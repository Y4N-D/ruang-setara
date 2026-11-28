// Simulasi beban Jejak Setara (spesifikasi JS-03, bagian "Skrip"; JS-07, rencana uji "Uji beban"; AC-20, AC-21;
// Architecture 13.4 dan 14). Bawaan: menyalakan Worker lokal (server-lokal.mjs, port 4330), tanpa kuota Cloudflare.
//   node scripts/jejak-setara/simulasi-beban.mjs --ruang 1 --bot 50 --detik 120 [--lobi-detik 30] [--diam-detik 5]
//        [--latensi-ms 80 --jitter-eksp-ms 40] [--jitter-ms 50] [--tanpa-build] [--mode-nama bebas]
// JS-14: --mode-nama bebas membuat ruang nama buatan siswa; bot bergabung dengan nama "Bot 001" dan seterusnya, dan
// layar kelas mengganti 5 nama di lobi dan 5 nama saat menjelajah (spesifikasi JS-14, AC-25).
// JS-07: bot jujur berjalan 72 piksel per detik di sepanjang jalur ubin peta kampung (pencarian jalur di grid
// tabrakan). Urutan: semua bot diam di lobi (memeriksa tidak ada kiriman dan pengatur waktu), berjalan di halaman
// lobi, lalu `mulai` lewat kait lokal dan menjelajah kampung. Pilihan --latensi-ms dan --jitter-eksp-ms menunda
// setiap pesan naik dan turun (urutan tetap, seperti TCP) untuk mengukur gerak jujur yang ditolak (P-52).
// JS-08 (P-71): saat menjelajah, bot berjalan ke kejadian yang terlihat dalam 12 ubin, memeriksa pada jarak 20 piksel,
// menjawab kedua langkah dengan jeda 1–3 detik secara acak, lalu menutup dialog sesudah 1 detik.
// JS-10 (P-32): ruang dibuat lewat jalur guru (lokal: admin awal dengan kunci lokal, masuk, POST /api/ruang) dan
// dikendalikan lewat layar kelas bertiket, yang juga mencatat jumlah dan ukuran pesan ke layar kelas (AC-24).
// JS-11 (AC-23): sesudah ronde diakhiri, setiap bot harus menerima `selesai` dengan rekap yang lolos skema protokol;
// ukuran pesan itu dan baris peserta akhir di D1 (lewat GET /api/ruang/{id}/hasil) dicatat.
// JS-09 (P-50): separuh tujuan jelajah acak adalah kotak yang siap dan skillnya belum penuh menurut `pribadi` terakhir;
// bot bermuatan Lari cepat yang sedang berjalan memakainya lalu bergerak 115,2 piksel per detik sampai `aktifSampai.lari`
// (jam server diperkirakan dari `pong`); bot tanpa sasaran kejadian yang bermuatan Kompas memakainya lalu berjalan ke
// ubin dari `kompas`; di Langkah 1, bot bermuatan Petunjuk memakainya lalu memilih pilihan acak yang tidak dicoret.
// JS-15 (P-4 sampai P-8, paket berbayar): lingkungan uji hanya dengan pilihan tertulis --sasaran uji --saya-paham-biaya,
// serta akun konsol admin di JEJAK_UJI_EMAIL dan JEJAK_UJI_SANDI. Perkiraan biaya (biaya-beban.mjs) dicetak lebih dulu,
// dan run di atas 400.000 permintaan Durable Object ditolak. Di mode uji: bot bergabung paling banyak --laju-gabung
// (bawaan 4) per detik, satu sambungan pengukur mengirim 30 `ping` di lobi sebelum bot lain bergabung, --mulai-pada
// <milidetik epoch> memulai ronde bersama, dan sesudah ronde pemakaian dibaca dari GET /api/ruang/{id} lalu data ruang
// dihapus lewat DELETE /api/ruang/{id} (kecuali --simpan-ruang). Bot mengirim `rttMs` di `ping` (JS-15, P-29).
// JS-18 (P-38): kotak teropong dan karcis ikut menjadi tujuan jelajah bila skillnya belum penuh; bot bermuatan Teropong
// memakainya saat menjelajah; bot berkarcis tanpa sasaran kejadian berjalan ke halte terdekat, lalu mengirim
// `pakai_skill` Angkot dengan halte lain yang dipilih acak dan menyelaraskan posisinya dari `koreksi`. Ringkasan mencatat
// kotak dan pemakaian kedua skill itu, `kejadian_terlihat` selama Teropong aktif yang titiknya di luar pandangan,
// `angkot_tiba`, gerak yang dikoreksi dalam 1 detik sesudah pindah (terpisah dari koreksi lain), dan selang putaran.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { register } from "node:module";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { monitorEventLoopDelay } from "node:perf_hooks";
import { BATAS_PERMINTAAN_PER_RUN, perkiraanBiaya, SKENARIO as TABEL_SKENARIO, teksPerkiraan } from "./biaya-beban.mjs";

const akar = fileURLToPath(new URL("../../", import.meta.url));
const arg = process.argv.slice(2);
const ambil = (nama, bawaan) => {
  const i = arg.indexOf(nama);
  return i >= 0 && arg[i + 1] ? arg[i + 1] : bawaan;
};
// JS-15 (P-12): --skenario <nama> mengisi ruang, bot, lama, dan sasaran dari tabel biaya-beban.mjs; pilihan lain tetap menang.
const SK = TABEL_SKENARIO[ambil("--skenario", "")] ?? null;
const RUANG = Number(ambil("--ruang", String(SK?.ruang ?? 1)));
const BOT = Number(ambil("--bot", String(SK?.bot ?? 50)));
const DETIK = Number(ambil("--detik", String(SK?.detikJelajah ?? 120)));
// JS-25 (P-19): durasi ruang simulasi (5, 10, 15, atau 20 menit; bawaan tetap 20). Bila lebih pendek dari lama menjelajah,
// ronde dibiarkan berakhir sendiri, dan simulasi menunggu `selesai` untuk semua bot.
const DURASI_RUANG = Number(ambil("--durasi-ruang", "20"));
if (![5, 10, 15, 20].includes(DURASI_RUANG)) throw new Error("--durasi-ruang harus 5, 10, 15, atau 20");
const RONDE_SENDIRI = DURASI_RUANG * 60 < DETIK;
const JITTER = Number(ambil("--jitter-ms", "0"));
const LATENSI = Number(ambil("--latensi-ms", "0"));
const JITTER_EKSP = Number(ambil("--jitter-eksp-ms", "0"));
const LOBI_DETIK = Number(ambil("--lobi-detik", String(SK?.detikLobi ?? 30)));
const DIAM_DETIK = Number(ambil("--diam-detik", "5"));
const SASARAN = ambil("--sasaran", SK?.sasaran ?? "lokal");
const PORT = Number(ambil("--port", "4330"));
const MODE_NAMA = ambil("--mode-nama", "daftar") === "bebas" ? "bebas" : "daftar"; // JS-14
// JS-15: alamat lingkungan uji, laju bergabung, jam mulai bersama, dan identitas run untuk alur kerja "Jejak: uji beban".
const ALAMAT_UJI = "https://jejak-setara-uji.ruangsetara.workers.dev";
const LAJU_GABUNG = Number(ambil("--laju-gabung", SASARAN === "uji" ? "4" : "0"));
const MULAI_PADA = Number(ambil("--mulai-pada", "0")) > 0 ? Number(ambil("--mulai-pada", "0")) : null;
const SIMPAN_RUANG = arg.includes("--simpan-ruang");
const SKENARIO = ambil("--skenario", null);
const BAGIAN = Number(ambil("--bagian", "1"));
const KELUARAN = ambil("--keluaran", "");
// Hanya untuk menguji sambung ulang bot: menutup sambungan bot kedua sekian detik sesudah menjelajah dimulai.
const UJI_PUTUS_DETIK = Number(ambil("--uji-putus-bot", "0"));
// Hanya untuk menguji sambung ulang layar kelas tiruan (D-8 a).
const UJI_PUTUS_KELAS_DETIK = Number(ambil("--uji-putus-kelas", "0"));
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * JS-25 (P-19; Temuan 3 JS-18): antrean tunda yang menjaga urutan seperti TCP. Waktu tiap pesan tidak pernah lebih awal
 * dari pesan sebelumnya, dan satu pewaktu menjalankan antrean menurut urutan masuk, sehingga pembulatan pewaktu Node
 * tidak bisa menukar dua pesan yang waktunya berdekatan.
 */
function antreanTunda() {
  const isi = [];
  let pewaktu = null;
  const jalan = () => {
    pewaktu = null;
    while (isi.length > 0 && isi[0].pada <= Date.now()) isi.shift().f();
    if (isi.length > 0) pewaktu = setTimeout(jalan, Math.max(0, isi[0].pada - Date.now()));
  };
  return (pada, f) => {
    isi.push({ pada, f });
    if (pewaktu === null) pewaktu = setTimeout(jalan, Math.max(0, pada - Date.now()));
  };
}

/**
 * JS-11 (AC-23): skema pesan server dari inti/protokol.ts, dimuat lewat pelucutan tipe bawaan Node (22.18 ke atas).
 * Kait resolve kecil menambahkan ".ts" pada impor relatif tanpa ekstensi. Bila gagal, pemeriksaan skema dilewati (null).
 */
let skemaServerPemain = null;
try {
  register(
    "data:text/javascript," +
      encodeURIComponent(
        "export async function resolve(s, c, next) { try { return await next(s, c); } catch (e) { if (/^\\.\\.?\\//.test(s) && !/\\.[cm]?[jt]sx?$/.test(s)) return next(s + '.ts', c); throw e; } }",
      ),
  );
  ({ skemaServerPemain } = await import(pathToFileURL(join(akar, "app/jejak-setara/inti/protokol.ts")).href));
} catch {
  skemaServerPemain = null;
}
const frekuensi = (batas) => (batas > 50 ? 6 : 10); // sama dengan frekuensiGerak() di inti/aturan.ts
// JS-09: sama dengan KECEPATAN, KECEPATAN_LARI (inti/gerak.ts), JEDA_SKILL_MS, dan SKILL_KOTAK (inti/aturan.ts).
// JS-18 (P-38): kelima skill, muatan penuhnya (SKILL di inti/aturan.ts), dan jangkauan halte klien (24 piksel).
const KECEPATAN = 72;
const KECEPATAN_LARI = 115.2;
const JEDA_SKILL_MS = 2000;
const SKILL_KOTAK = { sepatu: "lari", kompas: "kompas", buku: "petunjuk", teropong: "teropong", karcis: "angkot" };
const KODE_KOTAK = { kotak_lari: "sepatu", kotak_kompas: "kompas", kotak_petunjuk: "buku", kotak_teropong: "teropong", kotak_angkot: "karcis" };
const SKILL_SEMUA = ["lari", "kompas", "petunjuk", "teropong", "angkot"];
const MUATAN_MAKS = { lari: 2, kompas: 2, petunjuk: 2, teropong: 1, angkot: 1 };
const JANGKAUAN_HALTE_KLIEN_PX = 24;

/** Perkiraan permintaan Durable Object per ruang untuk satu sesi 15 menit: pesan masuk ÷ 20 + satu per sambungan. */
const perkiraanPermintaan = (pesanNaikPerDetik, bot) => Math.round((pesanNaikPerDetik * 900) / 20 + bot);

let alamat = `http://127.0.0.1:${PORT}`;
let server = null;
const perkiraanRun = perkiraanBiaya({ ruang: RUANG, botPerRuang: BOT, detikLobi: LOBI_DETIK, detikJelajah: DETIK });
if (SASARAN === "uji") {
  alamat = ambil("--alamat", ALAMAT_UJI);
  console.log(teksPerkiraan(perkiraanRun));
  if (!arg.includes("--saya-paham-biaya") || !process.env.JEJAK_UJI_EMAIL || !process.env.JEJAK_UJI_SANDI) {
    console.error("Lingkungan uji butuh --saya-paham-biaya, serta JEJAK_UJI_EMAIL dan JEJAK_UJI_SANDI untuk akun admin uji beban (JS-15, P-4).");
    process.exit(1);
  }
  if (perkiraanRun.permintaanDO > BATAS_PERMINTAAN_PER_RUN) {
    console.error(`Ditolak: perkiraan lebih dari ${BATAS_PERMINTAAN_PER_RUN.toLocaleString("id-ID")} permintaan Durable Object per run (JS-15, P-4).`);
    process.exit(1);
  }
} else {
  const opsi = ["scripts/jejak-setara/server-lokal.mjs", "--port", String(PORT)];
  if (arg.includes("--tanpa-build")) opsi.push("--tanpa-build");
  server = spawn(process.execPath, opsi, { cwd: akar, stdio: "ignore", env: process.env });
  for (let i = 0; i < 400; i++) {
    try {
      if ((await fetch(`${alamat}/api/sehat`)).ok) break;
    } catch {
      // Belum siap.
    }
    await tidur(500);
  }
}

/** Versi protokol server, dibaca dari /api/sehat, agar skrip tidak perlu diubah saat protokol naik (JS-08: versi 2). */
const V = (await (await fetch(`${alamat}/api/sehat`)).json()).protokol;
const KUNCI_ADMIN_LOKAL = "lokal-kunci-admin-bukan-rahasia";
const PAKET_INTI = "9880c4d5-8294-51c9-971a-e95531a2e039";
let cookie = "";
// Cloudflare menghentikan permintaan klien yang membawa tajuk CF-Connecting-IP (galat 1000, HTTP 403; dokumentasi
// Cloudflare "Error 1000"), jadi alamat tiruan itu hanya dikirim ke Worker lokal (perbaikan Test JS-15, 23 Nov 2026).
const tajukKonsol = () => ({ "X-Jejak": "1", Origin: alamat, "Content-Type": "application/json", ...(SASARAN === "lokal" ? { "CF-Connecting-IP": "10.66.0.1" } : {}), Cookie: cookie });
/** Galat permintaan konsol dengan awal isi jawabannya, agar log alur kerja langsung menunjukkan penyebabnya. */
const galatJawaban = async (nama, j) => new Error(`${nama} ${j.status}: ${(await j.text().catch(() => "")).slice(0, 300)}`);
const cookieDari = (j) => (j.headers.get("set-cookie") ?? "").split(";")[0];

/** Sesi konsol: lokal lewat admin awal berkunci lokal; uji lewat akun di JEJAK_UJI_EMAIL dan JEJAK_UJI_SANDI. */
async function masukKonsol() {
  if (SASARAN === "uji") {
    const j = await fetch(`${alamat}/api/masuk`, { method: "POST", headers: tajukKonsol(), body: JSON.stringify({ email: process.env.JEJAK_UJI_EMAIL, sandi: process.env.JEJAK_UJI_SANDI }) });
    if (j.status !== 200) throw await galatJawaban("masuk", j);
    cookie = cookieDari(j);
    return;
  }
  const email = `admin-beban-${process.pid}@sekolah.sch.id`;
  const awal = await fetch(`${alamat}/api/admin-awal`, {
    method: "POST",
    headers: { "X-Jejak-Kunci-Admin": KUNCI_ADMIN_LOKAL, "Content-Type": "application/json", "CF-Connecting-IP": "10.66.0.1" },
    body: JSON.stringify({ email, sandi: "sandi sementara beban", namaTampilan: "Admin beban" }),
  });
  if (awal.status !== 200) throw await galatJawaban("admin awal", awal);
  const masuk = await fetch(`${alamat}/api/masuk`, { method: "POST", headers: tajukKonsol(), body: JSON.stringify({ email, sandi: "sandi sementara beban" }) });
  cookie = cookieDari(masuk);
  const ganti = await fetch(`${alamat}/api/sandi`, { method: "POST", headers: tajukKonsol(), body: JSON.stringify({ sandiBaru: "kalimat sandi beban lokal" }) });
  if (ganti.status !== 200) throw await galatJawaban("ganti sandi", ganti);
  cookie = cookieDari(ganti);
}

/** Layar kelas per ruang: sambungan bertiket dan hitungan pesan per jenis (JS-10, AC-24). */
const layarKelas = new Map();
/**
 * JS-15 (D-8 a): layar kelas tiruan menyambung ulang seperti layar kelas konsol (JS-10, P-15; sambungan-kelas.ts): tiket
 * baru, jeda 1, 2, 4, lalu 8 detik, paling banyak 6 kali berturut-turut; 4000 (ruang ditutup) dan 4001 (dibuka di tab
 * lain) akhir. Setiap penutupan dicatat beserta kodenya.
 */
async function sambungKelas(id, l) {
  const t = await fetch(`${alamat}/api/ruang/${id}/tiket`, { method: "POST", headers: tajukKonsol(), body: "{}" });
  if (t.status !== 200) throw await galatJawaban("tiket", t);
  const { tiket } = await t.json();
  const ws = new WebSocket(`${alamat.replace(/^http/, "ws")}/ws/kelas/${id}?tiket=${encodeURIComponent(tiket)}`, { headers: { Origin: alamat } });
  l.ws = ws;
  l.info = null;
  ws.onmessage = (e) => {
    const teks = String(e.data);
    const m = JSON.parse(teks);
    const x = (l.jenis[m.t] ??= { n: 0, byte: 0, byteMaks: 0 });
    x.n++;
    x.byte += teks.length;
    x.byteMaks = Math.max(x.byteMaks, teks.length);
    if (m.t === "info_kelas") l.info = m;
    if (m.t === "status_ruang") {
      l.status = m.status;
      // JS-25 (AC-13): lama ronde dari sisi layar kelas (tanpa tunda buatan): status main sampai selesai.
      if (m.status === "main" && l.mainPada === undefined) l.mainPada = Date.now();
      if ((m.status === "selesai" || m.status === "pembahasan") && l.selesaiPada === undefined) l.selesaiPada = Date.now();
    }
  };
  ws.onclose = (e) => {
    if (l.berhenti || ws !== l.ws) return;
    l.putusRinci.push({ kode: e.code, pada: Date.now() });
    if (e.code === 4000 || e.code === 4001 || l.gagalSambung >= 6) return;
    l.gagalSambung++;
    setTimeout(
      () =>
        void sambungKelas(id, l)
          .then(() => {
            l.sambungUlang++;
            l.gagalSambung = 0;
          })
          .catch(() => {}),
      Math.min(8000, 1000 * 2 ** (l.gagalSambung - 1)),
    );
  };
  await new Promise((ok, gagal) => {
    ws.onopen = () => ok();
    ws.onerror = () => gagal(new Error("layar kelas gagal tersambung"));
  });
  ws.send(JSON.stringify({ v: V, t: "halo", peran: "guru" }));
  for (let i = 0; i < 100 && !l.info; i++) await tidur(50);
}

async function bukaLayarKelas(id, kode) {
  const l = { ws: null, info: null, jenis: {}, status: null, putusRinci: [], sambungUlang: 0, gagalSambung: 0, berhenti: false };
  await sambungKelas(id, l);
  layarKelas.set(kode, l);
  return l;
}

const idRuangKode = new Map();
async function buatRuang() {
  const j = await fetch(`${alamat}/api/ruang`, {
    method: "POST",
    headers: tajukKonsol(),
    body: JSON.stringify({ labelKelas: "Uji beban", paketId: PAKET_INTI, durasiMenit: DURASI_RUANG, batasPemain: Math.max(2, Math.min(100, BOT)), batasTerlambatMenit: 10, modeNomorAbsen: false, uji: true , modeNama: MODE_NAMA }),
  });
  if (j.status !== 201) throw await galatJawaban("ruang", j);
  const { ruang } = await j.json();
  idRuangKode.set(ruang.kode, ruang.id);
  const l = await bukaLayarKelas(ruang.id, ruang.kode);
  kejadianRuang.push(l.info?.jumlahKejadian ?? 0);
  return ruang.kode;
}
const kodeRuangIndeks = new Map();
/** Jumlah kejadian setiap ruang yang dibuat (JS-08, P-4). */
const kejadianRuang = [];
/** Pesan layar kelas lewat WebSocket bertiket (pengganti kait `kelas` ruang coba). */
const kelas = async (kode, pesan) => {
  const l = layarKelas.get(kode);
  if (!l) return;
  // JS-15 (D-8 a): kirim hanya saat tersambung; tunggu sambung ulang paling lama 30 detik, lalu gagal dengan jelas.
  for (let i = 0; i < 300 && !(l.ws?.readyState === 1 && l.info); i++) await tidur(100);
  if (l.ws?.readyState !== 1) throw new Error(`layar kelas ${kode} tidak tersambung; penutupan: ${JSON.stringify(l.putusRinci)}`);
  l.ws.send(JSON.stringify({ v: V, ...pesan }));
  await tidur(200);
};
/** JS-15 (D-8 a): `akhiri` dipastikan sampai: status ruang harus menjadi `selesai`, dicoba dua kali. */
async function akhiriRuang(kode) {
  const l = layarKelas.get(kode);
  if (l.status === "selesai" || l.status === "pembahasan") return; // JS-25 (P-19): ronde sudah berakhir sendiri
  for (let coba = 0; coba < 2; coba++) {
    await kelas(kode, { t: "akhiri" });
    for (let i = 0; i < 150 && l.status !== "selesai" && l.status !== "pembahasan"; i++) await tidur(100);
    if (l.status === "selesai" || l.status === "pembahasan") return;
  }
  throw new Error(`ruang ${kode} tidak berakhir sesudah akhiri; status ${l.status}; penutupan layar kelas: ${JSON.stringify(l.putusRinci)}`);
}
const statistik = async (kode) => (await fetch(`${alamat}/api/uji/ruang/${kode}/statistik`)).json();
await masukKonsol();

// Peta kampung: grid tabrakan kampung dan grid lobi (sel gerbang padat), sama dengan server (P-46).
const kampung = JSON.parse(readFileSync(join(akar, "app/jejak-setara/peta/kampung.json"), "utf8"));
/** Mengurai RLE kampung.json: potongan "NILAIxJUMLAH;", sama dengan uraiRle di inti/peta.ts. */
function uraiRle(teks, n) {
  const hasil = new Uint8Array(n);
  let i = 0;
  for (const bagian of teks.split(";")) {
    if (!bagian) continue;
    const [nilai, jumlah] = bagian.split("x").map(Number);
    hasil.fill(nilai, i, i + jumlah);
    i += jumlah;
  }
  if (i !== n) throw new Error(`RLE berisi ${i} sel, bukan ${n}`);
  return hasil;
}
const L = kampung.lebar;
const T = kampung.tinggi;
const GRID = uraiRle(kampung.tabrakan, L * T);
const GRID_LOBI = Uint8Array.from(GRID);
const gb = kampung.gerbangLobi;
for (let y = gb.atas; y <= gb.bawah; y++) for (let x = gb.kiri; x <= gb.kanan; x++) GRID_LOBI[y * L + x] = 1;

/** Ubin yang bisa dicapai dari titik muncul pertama: di grid lobi (halaman lobi) dan di grid kampung (jelajah). */
function ubinTercapai(grid) {
  const hasil = [];
  const t = kampung.titikMuncul[0];
  const lihat = new Uint8Array(L * T);
  const antre = [t.y * L + t.x];
  lihat[antre[0]] = 1;
  for (let i = 0; i < antre.length; i++) {
    const s = antre[i];
    const x = s % L;
    const y = Math.floor(s / L);
    hasil.push([x, y]);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= L || ny >= T) continue;
      const n = ny * L + nx;
      if (lihat[n] || grid[n]) continue;
      lihat[n] = 1;
      antre.push(n);
    }
  }
  return hasil;
}

/** Pencarian jalur 4 arah dari ubin a ke ubin b; mengembalikan daftar ubin atau null. */
function jalurUbin(grid, a, b) {
  const asal = new Int32Array(L * T).fill(-1);
  const mulai = a[1] * L + a[0];
  const tuju = b[1] * L + b[0];
  const antre = [mulai];
  asal[mulai] = mulai;
  for (let i = 0; i < antre.length; i++) {
    const s = antre[i];
    if (s === tuju) {
      const hasil = [];
      for (let t = s; ; t = asal[t]) {
        hasil.unshift([t % L, Math.floor(t / L)]);
        if (t === asal[t]) break;
      }
      return hasil;
    }
    const x = s % L;
    const y = Math.floor(s / L);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= L || ny >= T) continue;
      const n = ny * L + nx;
      if (asal[n] >= 0 || grid[n]) continue;
      asal[n] = s;
      antre.push(n);
    }
  }
  return null;
}

const UBIN_LOBI = ubinTercapai(GRID_LOBI);
const UBIN_JELAJAH = ubinTercapai(GRID);
/** JS-09: kotak bantuan di peta kampung; JS-18: termasuk kotak teropong dan karcis. */
const KOTAK_PETA = kampung.kotak.filter((k) => SKILL_KOTAK[k.jenis]);
/** JS-18 (P-38): halte peta kampung, menurut urutan nomornya. */
const HALTE = kampung.halte;
/** Halte terdekat dari titik kaki bot (jarak ke pusat ubin halte). */
const halteTerdekat = (b) => [...HALTE].sort((p, q) => Math.hypot(b.x - (p.x * 16 + 8), b.y - (p.y * 16 + 8)) - Math.hypot(b.x - (q.x * 16 + 8), b.y - (q.y * 16 + 8)))[0];
/** Pusat titik kejadian di dalam pandangan 320 × 180 bot (kamera dijepit di tepi peta, sama dengan terlihatDiLayar). */
const dalamPandangan = (b, x, y) => {
  const kiri = Math.max(0, Math.min(b.x - 160, L * 16 - 320));
  const atas = Math.max(0, Math.min(b.y - 90, T * 16 - 180));
  const cx = x * 16 + 8;
  const cy = y * 16 + 8;
  return cx >= kiri && cx <= kiri + 320 && cy >= atas && cy <= atas + 180;
};
const pusatUbin = ([x, y]) => ({ x: x * 16 + 8, y: y * 16 + 12 });
const acakDari = (larik) => larik[Math.floor(Math.random() * larik.length)];
const eksponensial = (rata) => (rata > 0 ? -Math.log(1 - Math.random()) * rata : 0);

function buatBot(kode, nomor) {
  const b = { kode, nomor, ws: null, id: null, seq: 0, x: null, y: null, arah: "bawah", jalur: [], diamSampai: 0, kirimTerakhir: 0, majuTerakhir: 0,
    jalan: false, naik: 0, turun: 0, byteTurun: 0, dunia: 0, rtt: [], koreksi: 0, gerak: 0, tersinkron: false, antreKirim: 0, antreTerima: 0, putus: false,
    // JS-08: kejadian yang terlihat dan selesai, sasaran, dialog yang terbuka, dan hitungan.
    lihat: new Map(), selesai: new Set(), sasaran: null, dialog: null, menungguSampai: 0, terlihat: 0, terbuka: 0, jawaban: 0, pribadi: 0, poin: 0,
    // JS-11 (AC-23): pesan `selesai` terakhir dan ukurannya dalam bita.
    pesanSelesai: null, byteSelesai: 0,
    // JS-15 (D-6 a): sambung ulang dengan token seperti HP, beserta catatan setiap penutupan yang tidak disengaja.
    token: null, sambungUlang: 0, gagalSambung: 0, putusRinci: [], menyambung: false, berhenti: false, gerakDilewati: 0,
    // JS-09 (P-50): keadaan skill dari `pribadi` terakhir, perkiraan selisih jam server dari `pong`, dan hitungan.
    muatan: { lari: 0, kompas: 0, petunjuk: 0, teropong: 0, angkot: 0 }, aktifSampai: {}, kotakMenunggu: new Map(), selisihJam: 0, pakaiTerakhir: {}, menungguSkill: {},
    tujuanKompas: null, lariSampaiLokal: 0, kotak: { sepatu: 0, kompas: 0, buku: 0, teropong: 0, karcis: 0 }, dipakai: { lari: 0, kompas: 0, petunjuk: 0, teropong: 0, angkot: 0 },
    pesanKompas: 0, pesanPetunjuk: 0, kompasTanpaSasaran: 0, kompasTepat: 0, bytePribadi: 0, jumlahPribadi: 0, koreksiLari: 0,
    // JS-18 (P-38): Angkot yang menunggu jawaban (halte tujuan), halte yang sedang dituju, saat pindah, dan hitungan.
    angkot: null, menujuHalte: null, pindahPada: -Infinity, koreksiPindah: 0, angkotTiba: 0, terlihatTeropong: 0 };
  return new Promise((ok, gagal) => {
    // Di lokal, setiap ruang dianggap sekolah sendiri (alamat IP berbeda) agar pembatas 300 sambungan per menit
    // per alamat (D-5) tidak menahan simulasi; di Cloudflare tajuk ini diisi jaringan Cloudflare, bukan klien.
    const tajuk = SASARAN === "lokal" ? { Origin: alamat, "CF-Connecting-IP": `10.0.0.${kodeRuangIndeks.get(kode) + 1}` } : { Origin: alamat };
    const tundaNaik = LATENSI > 0 || JITTER_EKSP > 0 || JITTER > 0;
    const kirim = (p) => {
      b.naik++;
      const teks = JSON.stringify(p);
      if (!tundaNaik) return b.ws.readyState === 1 && b.ws.send(teks);
      const pada = Math.max(b.antreKirim, Date.now() + LATENSI + eksponensial(JITTER_EKSP) + Math.random() * JITTER);
      b.antreKirim = pada;
      (b.tundaKirim ??= antreanTunda())(pada, () => b.ws.readyState === 1 && b.ws.send(teks));
    };
    b.kirim = kirim;
    const proses = (teks) => {
      const m = JSON.parse(teks);
      // JS-25 (AC-13): lama ronde dari sisi bot: status main sampai `selesai` (keduanya tertunda sama besar bila ada tunda).
      if (m.t === "status_ruang" && m.status === "main" && b.mainPada === undefined) b.mainPada = Date.now();
      if (m.t === "selesai" && b.selesaiPada === undefined) b.selesaiPada = Date.now();
      if (m.t === "selamat_datang") {
        b.token = m.token;
        if (b.menyambung) {
          // Sambung ulang dengan token: identitas dan skor dipulihkan server, jadi tidak memilih nama lagi.
          b.menyambung = false;
          b.sambungUlang++;
          b.gagalSambung = 0;
          return;
        }
        b.id = m.pemainId;
        // JS-14: di ruang nama buatan siswa, bot mengetik namanya sendiri; penolakan dijawab dengan saran.
        const nama = MODE_NAMA === "bebas" ? `Bot ${String(nomor + 1).padStart(3, "0")}` : m.saranNama[0];
        kirim({ v: V, t: "pilih_identitas", nama, avatar: nomor % 8 });
      } else if (m.t === "saran_nama") kirim({ v: V, t: "pilih_identitas", nama: m.saranNama[0], avatar: nomor % 8 });
      else if (m.t === "nama_baru") (b.namaBaru ??= new Set()).add(m.id);
      else if (m.t === "galat" && (m.kode === "NAMA_DITOLAK" || m.kode === "NAMA_DIPAKAI")) b.galatNama = (b.galatNama ?? 0) + 1;
      else if (m.t === "dunia") b.dunia++;
      else if (m.t === "galat" && m.kode === "TERLALU_CEPAT") b.ditolak = (b.ditolak ?? 0) + 1;
      else if (m.t === "pong") {
        const rtt = Date.now() - m.tKlien;
        b.rtt.push(rtt);
        b.rttTerakhir = Math.min(60_000, Math.max(0, Math.round(rtt))); // JS-15 (P-29)
        b.selisihJam = m.waktuServer - (m.tKlien + rtt / 2);
      }
      else if (m.t === "kejadian_terlihat") {
        b.terlihat++;
        // JS-18 (P-38): titik yang terungkap selama Teropong aktif dan berada di luar pandangan bot.
        if ((b.aktifSampai.teropong ?? 0) > jamServer(b) && b.x !== null && !dalamPandangan(b, m.x, m.y)) b.terlihatTeropong++;
        if (!b.selesai.has(m.kejadianId)) b.lihat.set(`${m.kejadianId}@${m.x},${m.y}`, { kode: m.kejadianId, x: m.x, y: m.y });
      } else if (m.t === "selesai") {
        b.pesanSelesai = m;
        b.byteSelesai = Buffer.byteLength(teks);
      } else if (m.t === "pribadi") {
        b.pribadi++;
        for (const kode of m.selesai) b.selesai.add(kode);
        // JS-09 (P-50): muatan yang berkurang berarti skill itu dipakai; jeda 2 detik dihitung dari saat ini.
        b.jumlahPribadi++;
        b.bytePribadi += Buffer.byteLength(teks);
        for (const s of SKILL_SEMUA) {
          if (m.muatan[s] < b.muatan[s]) {
            b.dipakai[s]++;
            b.pakaiTerakhir[s] = Date.now();
          }
          b.muatan[s] = m.muatan[s];
          b.menungguSkill[s] = 0;
        }
        b.aktifSampai = m.aktifSampai;
        b.kotakMenunggu = new Map(m.kotakMenunggu.map((k) => [k.id, k.siapPada]));
        if (m.aktifSampai.lari !== undefined) b.lariSampaiLokal = m.aktifSampai.lari - b.selisihJam;
        if (m.aktifSampai.kompas === undefined) b.tujuanKompas = null;
      } else if (m.t === "pemberitahuan") {
        if (KODE_KOTAK[m.kode]) b.kotak[KODE_KOTAK[m.kode]]++;
        else if (m.kode === "angkot_tiba") b.angkotTiba++; // JS-18 (P-38)
        else if (m.kode === "kompas_tanpa_sasaran") {
          b.kompasTanpaSasaran++;
          b.menungguSkill.kompas = 0;
        } else if (m.kode === "kompas_tepat") b.kompasTepat++;
      } else if (m.t === "kompas") {
        // Sasaran Kompas: berjalan ke ubin di bawah titiknya (atau ke titiknya bila ubin itu tidak tercapai).
        b.pesanKompas++;
        b.tujuanKompas = { x: m.x, y: m.y };
        if (!b.sasaran && !b.dialog && b.x !== null) {
          const asal = [Math.floor(b.x / 16), Math.floor(b.y / 16)];
          const jalur = jalurUbin(GRID, asal, [m.x, m.y + 1]) ?? jalurUbin(GRID, asal, [m.x, m.y]);
          if (jalur) {
            b.jalur = jalur.map(pusatUbin);
            b.diamSampai = 0;
          }
        }
      } else if (m.t === "petunjuk") {
        b.pesanPetunjuk++;
        if (b.dialog && b.dialog.kode === m.kejadianId) b.dialog.coret = m.opsiDicoret;
      } else if (m.t === "kejadian_terbuka") {
        b.terbuka++;
        b.dialog = { kode: m.kejadianId, coret: null };
        b.menungguSampai = 0;
        // JS-09 (P-50): bermuatan Petunjuk (dan di luar jeda 2 detik): pakai lebih dulu, lalu pilih yang tidak dicoret.
        if (b.muatan.petunjuk > 0 && Date.now() - (b.pakaiTerakhir.petunjuk ?? 0) > JEDA_SKILL_MS + 100) {
          b.kirim({ v: V, t: "pakai_skill", skill: "petunjuk", kejadianId: m.kejadianId });
        }
        const dialog = b.dialog;
        setTimeout(() => {
          const boleh = m.opsi1.filter((o) => o.id !== dialog.coret);
          const opsi = boleh[Math.floor(Math.random() * boleh.length)].id;
          b.kirim({ v: V, t: "kunci_1", kejadianId: m.kejadianId, opsiId: opsi });
        }, 1000 + Math.random() * 2000);
      } else if (m.t === "hasil_1") {
        if (b.dialog) {
          const kode = b.dialog.kode;
          const opsi = m.opsi2[Math.floor(Math.random() * m.opsi2.length)].id;
          setTimeout(() => b.kirim({ v: V, t: "kunci_2", kejadianId: kode, opsiId: opsi }), 1000 + Math.random() * 2000);
        }
      } else if (m.t === "hasil_2") {
        b.jawaban++;
        b.poin += m.poin;
        if (b.dialog) {
          const kode = b.dialog.kode;
          b.selesai.add(kode);
          setTimeout(() => {
            b.kirim({ v: V, t: "tutup_dialog", kejadianId: kode });
            b.dialog = null;
            b.sasaran = null;
            b.jalur = [];
          }, 1000);
        }
      }
      else if (m.t === "koreksi") {
        // JS-18 (P-38): koreksi ke titik halte tujuan sesudah `pakai_skill` Angkot adalah perpindahan, bukan laporan yang
        // ditolak; koreksi lain dalam 1 detik sesudahnya dicatat terpisah.
        const pindah = b.angkot !== null && m.x === b.angkot.x && m.y === b.angkot.y;
        if (pindah) {
          b.angkot = null;
          b.menujuHalte = null;
          b.pindahPada = Date.now();
        } else if (b.tersinkron && Date.now() - b.pindahPada <= 1000) b.koreksiPindah++;
        else {
          // Koreksi pertama berisi posisi awal (P-49); sesudah itu koreksi berarti laporan jujur ditolak.
          if (b.tersinkron) b.koreksi++;
          // JS-09 (P-50): koreksi selama lari atau sampai 1 detik sesudahnya.
          if (b.tersinkron && Date.now() <= b.lariSampaiLokal + 1000) b.koreksiLari++;
        }
        b.x = m.x;
        b.y = m.y;
        b.seq = Math.max(b.seq, m.seq);
        b.jalur = [];
        b.menujuHalte = null; // JS-18: jalur ke halte dihitung ulang dari posisi baru
        if (!b.tersinkron) {
          b.tersinkron = true;
          ok(b);
        }
      } else if (m.t === "galat" && m.kode !== "NAMA_DIPAKAI") gagal(new Error(m.kode));
    };
    const terima = (e) => {
      const teks = String(e.data);
      b.turun++;
      b.byteTurun += teks.length;
      if (LATENSI <= 0 && JITTER_EKSP <= 0) return proses(teks);
      const pada = Math.max(b.antreTerima, Date.now() + LATENSI + eksponensial(JITTER_EKSP));
      b.antreTerima = pada;
      (b.tundaTerima ??= antreanTunda())(pada, () => proses(teks));
    };
    // JS-15 (D-6 a, D-7 a): penutupan yang tidak disambung ulang sama dengan TUTUP_BERHENTI HP (pemain/jaringan.ts): ruang
    // ditutup (4000), ditolak (4003), dikeluarkan (4004), dan versi berbeda (4005). Penutupan lain, termasuk pelanggaran
    // batas pesan (1008) karena jaringan tersendat dan 1006, disambung ulang dengan token sampai 6 kali berturut-turut.
    const AKHIR = new Set([4000, 4003, 4004, 4005]);
    const sambung = () => {
      // JS-25 (P-8): bot menyambung seperti layar pemain v1.2, dengan tambahan protokol.
      const ws = new WebSocket(`${alamat.replace(/^http/, "ws")}/ws/ruang/${kode}?tambahan=1`, { headers: tajuk });
      b.ws = ws;
      ws.onopen = () => kirim(b.token ? { v: V, t: "halo", peran: "pemain", token: b.token } : { v: V, t: "halo", peran: "pemain" });
      ws.onmessage = terima;
      ws.onclose = (e) => {
        if (b.berhenti || ws !== b.ws) return;
        b.putusRinci.push({ kode: e.code, pada: Date.now() });
        if (AKHIR.has(e.code) || !b.id || b.gagalSambung >= 6) {
          b.putus = true;
          b.menyambung = false;
          return;
        }
        b.tersinkron = false;
        b.menyambung = true;
        b.gagalSambung++;
        setTimeout(() => !b.berhenti && sambung(), Math.min(8000, 1000 * 2 ** (b.gagalSambung - 1)));
      };
      ws.onerror = () => !b.id && gagal(new Error("sambungan gagal"));
    };
    sambung();
  });
}

/** JS-09 (P-50): jam server menurut perkiraan bot dari `pong`. */
const jamServer = (b) => Date.now() + b.selisihJam;
/** Skill boleh dipakai: bermuatan, tidak sedang aktif, di luar jeda 2 detik, dan tidak sedang menunggu jawaban. */
const bolehPakai = (b, s, sekarang) =>
  b.muatan[s] > 0 && !(b.aktifSampai[s] > jamServer(b)) && sekarang - (b.pakaiTerakhir[s] ?? 0) > JEDA_SKILL_MS + 100 && sekarang - (b.menungguSkill[s] ?? 0) > 2000;
function pakaiSkill(b, s, sekarang) {
  b.menungguSkill[s] = sekarang;
  b.kirim({ v: V, t: "pakai_skill", skill: s });
}

/** Satu langkah bot: maju 72 px/detik (115,2 saat Lari cepat aktif) di sepanjang jalurnya, lalu mengirim gerak bila perlu. */
function langkahBot(b, sekarang, hz, fase) {
  if (b.ws.readyState !== 1 || !b.tersinkron) return;
  const dt = b.majuTerakhir ? Math.min(250, sekarang - b.majuTerakhir) : 0;
  b.majuTerakhir = sekarang;
  // JS-08: selama dialog terbuka atau periksa menunggu jawaban, bot diam dan tidak mengirim gerak.
  if (b.dialog || sekarang < b.menungguSampai) return;
  if (fase === "jelajah" && b.sasaran && b.selesai.has(b.sasaran.kode)) b.sasaran = null;
  if (fase === "jelajah" && b.sasaran && Math.hypot(b.x - (b.sasaran.x * 16 + 8), b.y - (b.sasaran.y * 16 + 8)) <= 20) {
    // Sampai di titik: laporan berhenti lebih dulu bila masih tercatat berjalan, lalu periksa (P-24).
    b.jalur = [];
    if (b.jalan) {
      if (b.ws.bufferedAmount > 0) return void b.gerakDilewati++; // seperti HP (gerakDiri.kirimBila), dicoba lagi nanti
      b.jalan = false;
      b.gerak++;
      b.kirimTerakhir = sekarang;
      b.kirim({ v: V, t: "gerak", x: Math.round(b.x * 10) / 10, y: Math.round(b.y * 10) / 10, arah: b.arah, jalan: false, seq: ++b.seq });
      return;
    }
    b.kirim({ v: V, t: "periksa", kejadianId: b.sasaran.kode });
    b.menungguSampai = sekarang + 2000;
    b.sasaran = null;
    return;
  }
  // JS-09 (P-50): tanpa sasaran kejadian, bot bermuatan Kompas memakainya; jalurnya diatur saat `kompas` tiba.
  if (fase === "jelajah" && !b.sasaran && !b.tujuanKompas && bolehPakai(b, "kompas", sekarang)) pakaiSkill(b, "kompas", sekarang);
  // JS-18 (P-38): bot bermuatan Teropong memakainya saat menjelajah.
  if (fase === "jelajah" && bolehPakai(b, "teropong", sekarang)) pakaiSkill(b, "teropong", sekarang);
  // JS-18 (P-38): bot berkarcis tanpa sasaran kejadian berjalan ke halte terdekat, berhenti, lalu naik Angkot ke halte lain
  // yang dipilih acak; selama menunggu jawaban (paling lama 2,5 detik) bot diam.
  if (b.angkot && sekarang - b.angkot.pada > 2500) b.angkot = null;
  if (b.angkot) return;
  if (fase === "jelajah" && !b.sasaran && b.muatan.angkot > 0) {
    const h = halteTerdekat(b);
    if (b.jalur.length === 0 && Math.hypot(b.x - (h.x * 16 + 8), b.y - (h.y * 16 + 8)) <= JANGKAUAN_HALTE_KLIEN_PX) {
      if (b.jalan) {
        if (b.ws.bufferedAmount > 0) return void b.gerakDilewati++;
        b.jalan = false;
        b.gerak++;
        b.kirimTerakhir = sekarang;
        b.kirim({ v: V, t: "gerak", x: Math.round(b.x * 10) / 10, y: Math.round(b.y * 10) / 10, arah: b.arah, jalan: false, seq: ++b.seq });
        return;
      }
      if (bolehPakai(b, "angkot", sekarang)) {
        const tujuan = acakDari(HALTE.filter((x) => x.id !== h.id));
        b.angkot = { id: tujuan.id, x: tujuan.x * 16 + 8, y: tujuan.y * 16 + 12, pada: sekarang };
        b.menungguSkill.angkot = sekarang;
        b.kirim({ v: V, t: "pakai_skill", skill: "angkot", halteId: tujuan.id });
      }
      return;
    }
    if (b.menujuHalte !== h.id) {
      // Dicatat walaupun jalurnya tidak ada, agar pencarian jalur tidak diulang setiap langkah.
      b.menujuHalte = h.id;
      const jalur = jalurUbin(GRID, [Math.floor(b.x / 16), Math.floor(b.y / 16)], [h.x, h.y]);
      if (jalur) {
        b.jalur = jalur.map(pusatUbin);
        b.diamSampai = 0;
      }
    }
  }
  if (fase === "jelajah" && b.jalur.length === 0) {
    // Kejadian terlihat yang belum selesai, paling jauh 12 ubin (atau sasaran yang jalurnya terputus koreksi):
    // jalur ke ubin titiknya.
    const ux = Math.floor(b.x / 16);
    const uy = Math.floor(b.y / 16);
    const dekat =
      b.sasaran ??
      [...b.lihat.values()]
        .filter((k) => !b.selesai.has(k.kode) && Math.max(Math.abs(k.x - ux), Math.abs(k.y - uy)) <= 12)
        .sort((a, c) => Math.hypot(a.x - ux, a.y - uy) - Math.hypot(c.x - ux, c.y - uy))[0];
    if (dekat) {
      const jalur = jalurUbin(GRID, [ux, uy], [dekat.x, dekat.y]);
      b.sasaran = jalur ? dekat : null;
      if (jalur) {
        b.jalur = jalur.map(pusatUbin);
        b.diamSampai = 0;
      }
    }
  }
  if (fase === "diam") {
    b.jalur = [];
    b.diamSampai = sekarang + 1000;
  } else if (b.jalur.length === 0 && sekarang >= b.diamSampai) {
    const grid = fase === "lobi" ? GRID_LOBI : GRID;
    const asal = [Math.floor(b.x / 16), Math.floor(b.y / 16)];
    let jalur = null;
    // JS-09 (P-50): saat menjelajah, separuh tujuan acak adalah kotak yang siap dan skillnya belum penuh.
    if (fase === "jelajah" && Math.random() < 0.5) {
      const w = jamServer(b);
      const siap = KOTAK_PETA.filter((k) => b.muatan[SKILL_KOTAK[k.jenis]] < MUATAN_MAKS[SKILL_KOTAK[k.jenis]] && !((b.kotakMenunggu.get(k.id) ?? 0) > w));
      if (siap.length > 0) {
        const k = acakDari(siap);
        jalur = jalurUbin(grid, asal, [k.x, k.y]);
      }
    }
    jalur ??= jalurUbin(grid, asal, acakDari(fase === "lobi" ? UBIN_LOBI : UBIN_JELAJAH));
    b.jalur = jalur ? jalur.map(pusatUbin) : [];
  }
  // JS-09 (P-50): bot bermuatan Lari cepat yang sedang berjalan memakainya, lalu berlari sesudah `pribadi` tiba sampai
  // `aktifSampai.lari` menurut jam server yang diperkirakan.
  if (fase === "jelajah" && b.jalur.length > 0 && bolehPakai(b, "lari", sekarang)) pakaiSkill(b, "lari", sekarang);
  const lari = fase === "jelajah" && b.aktifSampai.lari !== undefined && jamServer(b) < b.aktifSampai.lari;
  let sisa = ((lari ? KECEPATAN_LARI : KECEPATAN) * dt) / 1000;
  let berjalan = false;
  while (sisa > 0 && b.jalur.length > 0) {
    const t = b.jalur[0];
    const dx = t.x - b.x;
    const dy = t.y - b.y;
    const d = Math.hypot(dx, dy);
    if (d <= sisa) {
      b.x = t.x;
      b.y = t.y;
      sisa -= d;
      b.jalur.shift();
    } else {
      b.x += (dx / d) * sisa;
      b.y += (dy / d) * sisa;
      sisa = 0;
    }
    if (d > 0) {
      b.arah = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "kanan" : "kiri") : dy > 0 ? "bawah" : "atas";
      berjalan = true;
    }
  }
  if (b.jalur.length === 0 && berjalan) b.diamSampai = b.sasaran ? sekarang : sekarang + 2000 + Math.random() * 6000;
  const selang = 1000 / hz;
  const berhenti = !berjalan && b.jalan;
  if ((berjalan && sekarang - b.kirimTerakhir >= selang) || berhenti) {
    // JS-15 (D-7 a): seperti HP, gerak dilewati selama pesan sebelumnya belum terkirim; kesempatan berikutnya membawa posisi terbaru.
    if (b.ws.bufferedAmount > 0) return void b.gerakDilewati++;
    b.kirimTerakhir = sekarang;
    b.jalan = berjalan;
    b.gerak++;
    b.kirim({ v: V, t: "gerak", x: Math.round(b.x * 10) / 10, y: Math.round(b.y * 10) / 10, arah: b.arah, jalan: berjalan, seq: ++b.seq });
  }
}

const persen = (larik, q) => {
  const s = [...larik].sort((a, c) => a - c);
  return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : null;
};

/** `ping` dengan `rttMs` terakhir bila server sudah versi 4 atau lebih (JS-15, P-27 dan P-29). */
const pesanPing = (rttMs) => (V >= 4 && rttMs !== undefined && rttMs !== null ? { v: V, t: "ping", tKlien: Date.now(), rttMs } : { v: V, t: "ping", tKlien: Date.now() });

async function jalankanFase(bot, fase, detik, hz) {
  for (const b of bot) {
    b.naik = 0;
    b.turun = 0;
    b.byteTurun = 0;
    b.dunia = 0;
    b.majuTerakhir = 0;
    b.pribadi = 0;
  }
  const mulai = Date.now();
  const akhir = mulai + detik * 1000;
  let ping = 0;
  while (Date.now() < akhir) {
    // JS-25 (P-19): ronde yang berakhir sendiri: fase berhenti begitu semua bot menerima `selesai`, dan bot yang sudah
    // menerimanya tidak bergerak lagi.
    if (RONDE_SENDIRI && fase === "jelajah" && bot.every((b) => b.pesanSelesai !== null)) break;
    const sekarang = Date.now();
    for (const b of bot) if (!(RONDE_SENDIRI && b.pesanSelesai)) langkahBot(b, sekarang, hz, fase);
    if (sekarang - ping >= 5000) {
      ping = sekarang;
      for (const b of bot) if (b.ws.readyState === 1) b.kirim(pesanPing(b.rttTerakhir));
    }
    await tidur(1000 / hz / 2);
  }
  const lama = (Date.now() - mulai) / 1000;
  const jumlah = (f) => bot.reduce((s, b) => s + f(b), 0);
  const turunByte = jumlah((b) => b.byteTurun) / bot.length / lama;
  return {
    detik: Math.round(lama),
    pesanNaikPerPemainPerDetik: +(jumlah((b) => b.naik) / bot.length / lama).toFixed(2),
    pesanTurunPerPemainPerDetik: +(jumlah((b) => b.turun) / bot.length / lama).toFixed(2),
    duniaPerPemainPerDetik: +(jumlah((b) => b.dunia) / bot.length / lama).toFixed(2),
    byteTurunPerPemainPerDetik: Math.round(turunByte),
    mbTurunPerPemainPer15Menit: +((turunByte * 900) / 1e6).toFixed(2),
    pribadiPerPemainPerDetik: +(jumlah((b) => b.pribadi) / bot.length / lama).toFixed(3),
  };
}

try {
  const kodeRuang = [];
  for (let r = 0; r < RUANG; r++) {
    const kode = await buatRuang();
    kodeRuangIndeks.set(kode, r);
    kodeRuang.push(kode);
  }
  const bot = [];
  // JS-15 (P-6): di lingkungan uji, bot pertama ruang pertama mengukur 30 `ping` berjeda 1 detik saat sepi, sebelum bot
  // lain bergabung, lalu tetap bermain sebagai bot biasa. Sambungan pengukur terpisah tidak dipakai, karena pemain tanpa
  // identitas yang terputus baru dilepas sesudah 5 menit dan tempatnya membuat bot terakhir ditolak RUANG_PENUH.
  let rttSepiMsP95 = null;
  if (SASARAN === "uji") {
    const pengukur = await buatBot(kodeRuang[0], 0);
    pengukur.rtt = [];
    // JS-15 (D-9 a): 60 ping berjeda 500 ms (tetap 30 detik), agar p95 saat sepi tidak hanya bergantung pada 2 sampel.
    for (let i = 0; i < 60; i++) {
      pengukur.kirim(pesanPing(undefined));
      await tidur(500);
    }
    await tidur(500);
    rttSepiMsP95 = pengukur.rtt.length > 0 ? persen(pengukur.rtt, 0.95) : null;
    pengukur.rtt = [];
    bot.push(pengukur);
  }
  const mulaiGabung = Date.now();
  if (LAJU_GABUNG > 0) {
    // JS-15 (P-5): paling banyak LAJU_GABUNG sambungan per detik per proses, di bawah pembatas 300 per menit per alamat IP.
    const janji = [];
    for (const kode of kodeRuang)
      for (let i = 0; i < BOT; i++) {
        if (bot.length > 0 && kode === kodeRuang[0] && i === 0) continue; // bot pengukur sudah bergabung
        janji.push(buatBot(kode, i));
        await tidur(1000 / LAJU_GABUNG);
      }
    bot.push(...(await Promise.all(janji)));
  } else for (const kode of kodeRuang) bot.push(...(await Promise.all(Array.from({ length: BOT }, (_, i) => buatBot(kode, i)))));
  const lamaGabung = Date.now() - mulaiGabung;
  if (MULAI_PADA !== null && Date.now() - MULAI_PADA > 60_000) {
    throw new Error(`jam mulai bersama sudah lewat ${Math.round((Date.now() - MULAI_PADA) / 1000)} detik saat ruang siap (JS-15, P-7)`);
  }
  const hz = frekuensi(BOT);
  await tidur(1500);
  // 1. Semua bot diam di lobi: tidak ada kiriman `dunia` dan tidak ada pengatur waktu putaran (P-47; AC-17, AC-20).
  const statDiamAwal = SASARAN === "lokal" ? await Promise.all(kodeRuang.map(statistik)) : [];
  const diam = await jalankanFase(bot, "diam", DIAM_DETIK, hz);
  const statDiamAkhir = SASARAN === "lokal" ? await Promise.all(kodeRuang.map(statistik)) : [];
  const lobiDiam = {
    ...diam,
    duniaLobiServer: statDiamAkhir.map((x, i) => x.duniaLobi - statDiamAwal[i].duniaLobi),
    pewaktuPutaran: statDiamAkhir.map((x) => x.pewaktuPutaran),
    putaranServer: statDiamAkhir.map((x, i) => x.putaran - statDiamAwal[i].putaran),
  };
  // 2. Berjalan di halaman lobi (P-45, P-47).
  // JS-15 (P-7): dengan --mulai-pada, bot berjalan di lobi sampai jam mulai bersama.
  const detikLobi = MULAI_PADA === null ? LOBI_DETIK : Math.max(5, (MULAI_PADA - Date.now()) / 1000);
  const lobi = await jalankanFase(bot, "lobi", detikLobi, hz);
  // JS-14 (AC-25): layar kelas mengganti 5 nama per ruang di lobi, dan 5 nama lain saat menjelajah.
  const diganti = [];
  const gantiLima = async (awal) => {
    for (const [r, kode] of kodeRuang.entries()) {
      for (const b of bot.slice(r * BOT + awal, r * BOT + awal + 5)) {
        if (!b.id) continue;
        diganti.push(b.id);
        await kelas(kode, { t: "ganti_nama", pemainId: b.id });
      }
    }
  };
  await gantiLima(0);
  const koreksiLobi = bot.reduce((s, b) => s + b.koreksi, 0);
  const gerakLobi = bot.reduce((s, b) => s + b.gerak, 0);
  // 3. Ronde: mulai lewat layar kelas, lalu menjelajah kampung.
  if (MULAI_PADA !== null && MULAI_PADA > Date.now()) await tidur(MULAI_PADA - Date.now());
  const waktuRuang = new Map(kodeRuang.map((kode) => [kode, { kode, mainMulai: null, mainAkhir: null }]));
  for (const kode of kodeRuang) {
    waktuRuang.get(kode).mainMulai = Date.now() + 3000; // hitung mundur 3 detik
    await kelas(kode, { t: "mulai" });
  }
  await jalankanFase(bot, "diam", 3.5, hz);
  for (const b of bot) {
    b.koreksi = 0;
    b.gerak = 0;
    b.rtt = [];
  }
  const waktuGanti = setTimeout(() => void gantiLima(5), (DETIK * 1000) / 2);
  // JS-15 (D-9 a): jeda event loop mesin bot selama menjelajah. Balasan server yang tiba saat mesin bot sibuk baru diproses
  // sesudah jeda ini, jadi jeda itu ikut terukur sebagai waktu pulang-pergi walaupun bukan berasal dari server.
  const jedaLoop = monitorEventLoopDelay({ resolution: 10 });
  jedaLoop.enable();
  // JS-18 (P-38): hitungan putaran server di awal menjelajah, untuk selang putaran rata-rata.
  const statJelajahAwal = SASARAN === "lokal" ? await Promise.all(kodeRuang.map(statistik)) : [];
  const mulaiJelajah = Date.now();
  const waktuUjiPutus = UJI_PUTUS_DETIK > 0 ? setTimeout(() => bot[1]?.ws.close(4100, "uji putus"), UJI_PUTUS_DETIK * 1000) : null;
  const waktuUjiPutusKelas = UJI_PUTUS_KELAS_DETIK > 0 ? setTimeout(() => layarKelas.get(kodeRuang[0])?.ws.close(4100, "uji putus kelas"), UJI_PUTUS_KELAS_DETIK * 1000) : null;
  const jelajah = await jalankanFase(bot, "jelajah", DETIK, hz);
  clearTimeout(waktuGanti);
  if (waktuUjiPutus) clearTimeout(waktuUjiPutus);
  jedaLoop.disable();
  if (waktuUjiPutusKelas) clearTimeout(waktuUjiPutusKelas);
  const namaPemain = {
    mode: MODE_NAMA,
    diganti: diganti.length,
    botMenerimaSemuaNamaBaru: bot.filter((b) => diganti.every((id) => b.namaBaru?.has(id))).length,
    galatNama: bot.reduce((s, b) => s + (b.galatNama ?? 0), 0),
  };
  // Dihitung sebelum ruang diakhiri dan ditutup, karena penutupan ruang memutus semua bot dengan sengaja.
  // JS-15 (D-6 a): yang dihitung putus hanyalah bot yang tidak pulih (menyerah atau masih menyambung ulang).
  const putusTakTerduga = bot.filter((b) => b.putus || b.menyambung).length;
  const sambungUlangPulih = bot.reduce((s, b) => s + b.sambungUlang, 0);
  const kodeTutupTakTerduga = {};
  for (const b of bot) for (const p of b.putusRinci) kodeTutupTakTerduga[p.kode] = (kodeTutupTakTerduga[p.kode] ?? 0) + 1;
  const stat = SASARAN === "lokal" ? await Promise.all(kodeRuang.map(statistik)) : [];
  const lamaJelajahMs = Date.now() - mulaiJelajah;
  // Pesan layar kelas sampai akhir menjelajah, sebelum ruang diakhiri (JS-10, AC-24).
  const kelasJelajah = kodeRuang.map((kode) => JSON.parse(JSON.stringify(layarKelas.get(kode)?.jenis ?? {})));
  // JS-15: pemakaian dibaca juga sebelum ronde diakhiri, selagi waktu pulang-pergi (hanya di memori ruang) pasti ada.
  const pemakaianSebelumAkhir = [];
  if (SASARAN === "uji")
    for (const kode of kodeRuang)
      pemakaianSebelumAkhir.push((await (await fetch(`${alamat}/api/ruang/${idRuangKode.get(kode)}`, { headers: tajukKonsol() })).json()).pemakaian ?? null);
  for (const kode of kodeRuang) {
    waktuRuang.get(kode).mainAkhir = Date.now();
    await akhiriRuang(kode);
  }
  // JS-11 (AC-23): setiap bot menerima `selesai` (paling lama 10 detik), lalu kiriman ke D1 ditunggu kosong (P-15)
  // dan hasilnya dibaca dari D1 sebelum ruang ditutup.
  // JS-15: bot yang sedang menyambung ulang diberi waktu (paling lama 30 detik), karena server mengirim ulang `selesai`
  // kepada pemain yang tersambung kembali sesudah ronde berakhir (kirimKeadaanKejadian), seperti pada HP.
  for (let i = 0; i < 300 && bot.some((b) => b.pesanSelesai === null && (b.menyambung || i < 100)); i++) await tidur(100);
  const hasilAkhir = [];
  const pemakaianApi = [];
  for (const kode of kodeRuang) {
    const id = idRuangKode.get(kode);
    let pemakaian = null;
    for (let i = 0; i < 100; i++) {
      const d = await (await fetch(`${alamat}/api/ruang/${id}`, { headers: tajukKonsol() })).json();
      pemakaian = d.pemakaian ?? pemakaian; // JS-15 (P-8): sebelum ruang ditutup, termasuk waktu pulang-pergi
      if (d.langsung?.kirimanTertunda === false) break;
      await tidur(200);
    }
    const sebelum = pemakaianSebelumAkhir[pemakaianApi.length];
    if (pemakaian && sebelum && pemakaian.rttSampel == null) Object.assign(pemakaian, { rttMedianMs: sebelum.rttMedianMs, rttP95Ms: sebelum.rttP95Ms, rttSampel: sebelum.rttSampel });
    pemakaianApi.push(pemakaian);
    hasilAkhir.push(await (await fetch(`${alamat}/api/ruang/${id}/hasil`, { headers: tajukKonsol() })).json());
  }
  for (const b of bot) b.berhenti = true; // penutupan ruang memutus semua bot dengan sengaja
  for (const l of layarKelas.values()) l.berhenti = true; // 4000 sesudah tutup_ruang memang disengaja
  for (const kode of kodeRuang) await kelas(kode, { t: "tutup_ruang" });
  // JS-15 (P-8): data ruang uji beban dihapus sesudah ditutup, kecuali --simpan-ruang.
  const ruangDihapus = [];
  if (SASARAN === "uji" && !SIMPAN_RUANG) {
    for (const kode of kodeRuang) {
      let status = 0;
      for (let i = 0; i < 5 && !(status >= 200 && status < 300); i++) {
        if (i > 0) await tidur(1000);
        status = (await fetch(`${alamat}/api/ruang/${idRuangKode.get(kode)}`, { method: "DELETE", headers: tajukKonsol() })).status;
      }
      ruangDihapus.push(status);
    }
  }
  const jumlah = (f) => bot.reduce((s, b) => s + f(b), 0);
  const denganSelesai = bot.filter((b) => b.pesanSelesai !== null);
  const pemakaianRuang = SASARAN === "lokal" ? stat.map((x) => x.pemakaian ?? null) : pemakaianApi;
  const hasil = {
    waktu: new Date().toISOString(),
    // JS-15: identitas run, perkiraan biaya, pengukur sepi, jam ronde per ruang, dan penghapusan data ruang.
    skenario: SKENARIO,
    bagian: BAGIAN,
    mulaiPada: MULAI_PADA,
    perkiraanBiaya: perkiraanRun,
    rttSepiMsP95,
    waktuRuang: [...waktuRuang.values()],
    ruangDihapus,
    sasaran: SASARAN,
    ruang: RUANG,
    botPerRuang: BOT,
    durasiRuangMenit: DURASI_RUANG,
    rondeBerakhirSendiri: RONDE_SENDIRI,
    lamaRondeBotMs: (() => {
      const d = bot.filter((b) => b.mainPada !== undefined && b.selesaiPada !== undefined).map((b) => b.selesaiPada - b.mainPada).sort((a, c) => a - c);
      return d.length === 0 ? null : { bot: d.length, min: d[0], median: d[Math.floor(d.length / 2)], maks: d.at(-1) };
    })(),
    lamaRondeMs: kodeRuang.map((k) => {
      const l = layarKelas.get(k);
      return l?.mainPada !== undefined && l?.selesaiPada !== undefined ? l.selesaiPada - l.mainPada : null;
    }),
    latensiMs: LATENSI,
    jitterEksponensialRataMs: JITTER_EKSP,
    jitterSeragamMs: JITTER,
    gerakPerDetikSaatBergerak: hz,
    lamaSemuaBergabungMs: lamaGabung,
    namaPemain,
    lobiDiam,
    lobi: { ...lobi, gerakDikoreksiPersen: +((100 * koreksiLobi) / Math.max(1, gerakLobi)).toFixed(3) },
    jelajah: {
      ...jelajah,
      rttMsP50: persen(bot.flatMap((b) => b.rtt), 0.5),
      rttMsP95: persen(bot.flatMap((b) => b.rtt), 0.95),
      // JS-15 (D-7 a): tanda jaringan tersendat.
      rttMsMaks: bot.reduce((m, b) => b.rtt.reduce((x, r) => Math.max(x, r), m), 0),
      pingTersendat: bot.reduce((s, b) => s + b.rtt.filter((r) => r > 2000).length, 0),
      gerakDilewati: bot.reduce((s, b) => s + b.gerakDilewati, 0),
      jedaEventLoopMsP95: Math.round(jedaLoop.percentile(95) / 1e5) / 10,
      jedaEventLoopMsMaks: Math.round(jedaLoop.max / 1e5) / 10,
      gerakDikirim: jumlah((b) => b.gerak),
      gerakDikoreksi: jumlah((b) => b.koreksi),
      gerakDikoreksiPersen: +((100 * jumlah((b) => b.koreksi)) / Math.max(1, jumlah((b) => b.gerak))).toFixed(3),
      // JS-18 (P-38): koreksi dalam 1 detik sesudah pindah halte, terpisah dari koreksi di atas.
      gerakDikoreksiSesudahPindah: jumlah((b) => b.koreksiPindah),
      // JS-18 (P-38): putaran server selama menjelajah dan selang rata-ratanya (sasaran 100 ms).
      putaranServer: stat.map((x, i) => x.putaran - statJelajahAwal[i].putaran),
      selangPutaranMsRata: stat.map((x, i) => +(lamaJelajahMs / Math.max(1, x.putaran - statJelajahAwal[i].putaran)).toFixed(1)),
    },
    // JS-08 (P-71): kejadian dibuka dan dijawab bot, serta hitungan server.
    kejadian: {
      kejadianPerRuang: kejadianRuang,
      terlihatDiterima: jumlah((b) => b.terlihat),
      dibuka: jumlah((b) => b.terbuka),
      dijawabKeduaLangkah: jumlah((b) => b.jawaban),
      botYangMenjawab: bot.filter((b) => b.jawaban > 0).length,
      poinRataPerBot: +(jumlah((b) => b.poin) / bot.length).toFixed(1),
      jawabanSelesaiServer: stat.map((x) => x.jawabanSelesai ?? 0),
      pribadiServer: stat.map((x) => x.pribadi ?? 0),
      antreanKirimanSaatAkhir: stat.map((x) => x.antreanKiriman ?? 0),
    },
    // JS-09 (P-50): kotak dan skill per ruang, ukuran rata-rata `pribadi`, dan gerak yang dikoreksi selama lari atau
    // sampai 1 detik sesudahnya.
    skill: kodeRuang.map((kode) => {
      const bs = bot.filter((b) => b.kode === kode);
      const j = (f) => bs.reduce((s, b) => s + f(b), 0);
      return {
        kotakTerambil: {
          sepatu: j((b) => b.kotak.sepatu),
          kompas: j((b) => b.kotak.kompas),
          buku: j((b) => b.kotak.buku),
          teropong: j((b) => b.kotak.teropong),
          karcis: j((b) => b.kotak.karcis),
        },
        dipakai: {
          lari: j((b) => b.dipakai.lari),
          kompas: j((b) => b.dipakai.kompas),
          petunjuk: j((b) => b.dipakai.petunjuk),
          teropong: j((b) => b.dipakai.teropong),
          angkot: j((b) => b.dipakai.angkot),
        },
        // JS-18 (P-38): titik yang terungkap selama Teropong aktif di luar pandangan, dan `angkot_tiba`.
        terlihatSaatTeropongLuarPandangan: j((b) => b.terlihatTeropong),
        angkotTiba: j((b) => b.angkotTiba),
        pesanKompas: j((b) => b.pesanKompas),
        pesanPetunjuk: j((b) => b.pesanPetunjuk),
        kompasTanpaSasaran: j((b) => b.kompasTanpaSasaran),
        kompasTepat: j((b) => b.kompasTepat),
        pribadiByteRata: Math.round(j((b) => b.bytePribadi) / Math.max(1, j((b) => b.jumlahPribadi))),
        gerakDikoreksiSaatLari: j((b) => b.koreksiLari),
      };
    }),
    // JS-11 (AC-23): `selesai` dengan rekap, ukurannya, dan baris peserta akhir di D1.
    akhirRonde: {
      botMenerimaSelesai: denganSelesai.length,
      rekapLolosSkema: skemaServerPemain ? denganSelesai.filter((b) => skemaServerPemain.safeParse(b.pesanSelesai).success).length : null,
      butirRekapRataPerBot: +(jumlah((b) => b.pesanSelesai?.rekap?.length ?? 0) / Math.max(1, bot.length)).toFixed(2),
      byteSelesaiRata: Math.round(jumlah((b) => b.byteSelesai) / Math.max(1, denganSelesai.length)),
      byteSelesaiMaks: Math.max(0, ...bot.map((b) => b.byteSelesai)),
      pesertaD1: hasilAkhir.map((h) => h.peserta?.length ?? null),
      pesertaBerperingkatD1: hasilAkhir.map((h) => h.peserta?.filter((p) => p.peringkat !== null).length ?? null),
      jawabanLangkah1D1: hasilAkhir.map((h) => h.peserta?.reduce((n, p) => n + p.langkah1Dijawab, 0) ?? null),
      ringkasanHasil: hasilAkhir.map((h) => h.ringkasan ?? null),
    },
    sambunganPutusTakTerduga: putusTakTerduga,
    sambungUlangPulih,
    kodeTutupTakTerduga,
    // JS-15: rincian putus untuk membedakan gangguan jaringan (tersebar) dari ruang yang dimulai ulang (menumpuk di satu
    // ruang pada satu waktu): per ruang, dan per menit sejak ronde ruang itu mulai.
    putusPerRuang: Object.fromEntries(kodeRuang.map((kode) => [kode, bot.filter((b) => b.kode === kode).reduce((s, b) => s + b.putusRinci.length, 0)])),
    putusPerMenit: bot.reduce((o, b) => {
      const mulai = waktuRuang.get(b.kode)?.mainMulai ?? 0;
      for (const p of b.putusRinci) {
        const m = Math.floor((p.pada - mulai) / 60_000);
        o[m] = (o[m] ?? 0) + 1;
      }
      return o;
    }, {}),
    pingTersendatPerRuang: Object.fromEntries(kodeRuang.map((kode) => [kode, bot.filter((b) => b.kode === kode).reduce((s, b) => s + b.rtt.filter((r) => r > 2000).length, 0)])),
    // JS-15 (D-8 a): layar kelas tiruan.
    layarKelasSambungUlang: [...layarKelas.values()].reduce((s, l) => s + l.sambungUlang, 0),
    kodeTutupLayarKelas: [...layarKelas.values()].flatMap((l) => l.putusRinci.map((p) => p.kode)),
    // Lokal dari kait uji server; di lingkungan uji dari galat TERLALU_CEPAT yang diterima bot (JS-15, P-14).
    pesanDitolakServer: SASARAN === "lokal" ? stat.reduce((s, x) => s + (x.pelanggaran ?? 0), 0) : jumlah((b) => b.ditolak ?? 0),
    alasanKoreksiServer: stat.map((x) => x.koreksiAlasan ?? {}),
    barisSqliteDitulisPerRuang: SASARAN === "lokal" ? stat.map((x) => x.barisDitulis) : pemakaianApi.map((p) => p?.barisSqlite ?? null),
    barisD1DitulisPerRuang: pemakaianRuang.map((p) => p?.barisD1 ?? null), // JS-09 (P-50)
    // JS-10 (AC-24): pesan ke layar kelas selama sambungan (dari layar kelas), dan hitungan server.
    layarKelas: kelasJelajah.map((jenis) =>
      Object.fromEntries(Object.entries(jenis).map(([t, x]) => [t, { n: x.n, byteRata: Math.round(x.byte / Math.max(1, x.n)), byteMaks: x.byteMaks }])),
    ),
    // JS-22 (P-15): pemakaian per ruang menurut penghitung Durable Object, untuk dibandingkan dengan perkiraan di atas.
    pemakaianRuang,
    pesanKeLayarKelasServer: stat.map((x) => x.keluarKelas ?? 0),
    byteKeLayarKelasServer: stat.map((x) => x.byteKelas ?? 0),
    perkiraanPermintaanDurableObjectPerSesi15MenitPerRuang: perkiraanPermintaan(jelajah.pesanNaikPerPemainPerDetik * BOT, BOT),
  };
  mkdirSync(join(akar, "test-results-jejak"), { recursive: true });
  const berkas = KELUARAN || join(akar, "test-results-jejak", `beban-${RUANG}x${BOT}-${Date.now()}.json`);
  writeFileSync(berkas, JSON.stringify(hasil, null, 2));
  console.log(JSON.stringify(hasil, null, 2));
  for (const b of bot) b.ws.close();
  for (const l of layarKelas.values()) l.ws.close();
} finally {
  if (server) server.kill("SIGTERM");
  await tidur(800);
}
process.exit(0);
