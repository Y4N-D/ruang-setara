// Simulasi beban Jejak Setara (spesifikasi JS-03, bagian "Skrip"; JS-07, rencana uji "Uji beban"; AC-20, AC-21;
// Architecture 13.4 dan 14). Bawaan: menyalakan Worker lokal (server-lokal.mjs, port 4330), tanpa kuota Cloudflare.
//   node scripts/jejak-setara/simulasi-beban.mjs --ruang 1 --bot 50 --detik 120 [--lobi-detik 30] [--diam-detik 5]
//        [--latensi-ms 80 --jitter-eksp-ms 40] [--jitter-ms 50] [--tanpa-build]
// JS-07: bot jujur berjalan 72 piksel per detik di sepanjang jalur ubin peta kampung (pencarian jalur di grid
// tabrakan). Urutan: semua bot diam di lobi (memeriksa tidak ada kiriman dan pengatur waktu), berjalan di halaman
// lobi, lalu `mulai` lewat kait lokal dan menjelajah kampung. Pilihan --latensi-ms dan --jitter-eksp-ms menunda
// setiap pesan naik dan turun (urutan tetap, seperti TCP) untuk mengukur gerak jujur yang ditolak (P-52).
// JS-08 (P-71): saat menjelajah, bot berjalan ke kejadian yang terlihat dalam 12 ubin, memeriksa pada jarak 20 piksel,
// menjawab kedua langkah dengan jeda 1–3 detik secara acak, lalu menutup dialog sesudah 1 detik.
// Lingkungan uji hanya dengan pilihan tertulis: --sasaran uji --alamat <URL> --saya-paham-kuota, serta
// rahasia JEJAK_KUNCI_COBA; perkiraan permintaan Durable Object dicetak lebih dulu, dan lebih dari 20.000 ditolak.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const akar = fileURLToPath(new URL("../../", import.meta.url));
const arg = process.argv.slice(2);
const ambil = (nama, bawaan) => {
  const i = arg.indexOf(nama);
  return i >= 0 && arg[i + 1] ? arg[i + 1] : bawaan;
};
const RUANG = Number(ambil("--ruang", "1"));
const BOT = Number(ambil("--bot", "50"));
const DETIK = Number(ambil("--detik", "120"));
const JITTER = Number(ambil("--jitter-ms", "0"));
const LATENSI = Number(ambil("--latensi-ms", "0"));
const JITTER_EKSP = Number(ambil("--jitter-eksp-ms", "0"));
const LOBI_DETIK = Number(ambil("--lobi-detik", "30"));
const DIAM_DETIK = Number(ambil("--diam-detik", "5"));
const SASARAN = ambil("--sasaran", "lokal");
const PORT = Number(ambil("--port", "4330"));
const BATAS_PERMINTAAN_UJI = 20_000;
const tidur = (ms) => new Promise((r) => setTimeout(r, ms));
const frekuensi = (batas) => (batas > 50 ? 6 : 10); // sama dengan frekuensiGerak() di inti/aturan.ts

/** Perkiraan permintaan Durable Object per ruang untuk satu sesi 15 menit: pesan masuk ÷ 20 + satu per sambungan. */
const perkiraanPermintaan = (pesanNaikPerDetik, bot) => Math.round((pesanNaikPerDetik * 900) / 20 + bot);

let alamat = `http://127.0.0.1:${PORT}`;
let server = null;
if (SASARAN === "uji") {
  alamat = ambil("--alamat", "");
  const perkiraan = RUANG * perkiraanPermintaan(BOT * 6.5, BOT) * (DETIK / 900);
  console.log(`Perkiraan permintaan Durable Object untuk percobaan ini: ±${Math.round(perkiraan)} (kuota gratis 100.000 per hari).`);
  if (!alamat || !arg.includes("--saya-paham-kuota") || !process.env.JEJAK_KUNCI_COBA) {
    console.error("Lingkungan uji butuh --alamat, --saya-paham-kuota, dan rahasia JEJAK_KUNCI_COBA (Architecture 13.4).");
    process.exit(2);
  }
  if (perkiraan > BATAS_PERMINTAAN_UJI) {
    console.error(`Ditolak: lebih dari ${BATAS_PERMINTAAN_UJI} permintaan. Jalankan secara lokal atau tunggu paket berbayar (JS-15).`);
    process.exit(2);
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

const tajukKunci = SASARAN === "uji" ? { "X-Jejak-Kunci-Coba": process.env.JEJAK_KUNCI_COBA } : {};
/** Versi protokol server, dibaca dari /api/sehat, agar skrip tidak perlu diubah saat protokol naik (JS-08: versi 2). */
const V = (await (await fetch(`${alamat}/api/sehat`)).json()).protokol;
async function buatRuang() {
  const j = await fetch(`${alamat}/api/ruang-coba`, { method: "POST", headers: tajukKunci, body: JSON.stringify({ batasPemain: Math.max(2, Math.min(100, BOT)) }) });
  if (j.status !== 201) throw new Error(`ruang coba ${j.status}`);
  const isi = await j.json();
  kejadianRuang.push(isi.kejadian ?? 0);
  return isi.kode;
}
const kodeRuangIndeks = new Map();
/** Jumlah kejadian setiap ruang coba yang dibuat (JS-08, P-4). */
const kejadianRuang = [];
const kelas = (kode, pesan) => fetch(`${alamat}/api/ruang-coba/${kode}/kelas`, { method: "POST", body: JSON.stringify({ v: V, ...pesan }) });
const statistik = async (kode) => (await fetch(`${alamat}/api/ruang-coba/${kode}/statistik`)).json();

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
const pusatUbin = ([x, y]) => ({ x: x * 16 + 8, y: y * 16 + 12 });
const acakDari = (larik) => larik[Math.floor(Math.random() * larik.length)];
const eksponensial = (rata) => (rata > 0 ? -Math.log(1 - Math.random()) * rata : 0);

function buatBot(kode, nomor) {
  const b = { kode, nomor, ws: null, id: null, seq: 0, x: null, y: null, arah: "bawah", jalur: [], diamSampai: 0, kirimTerakhir: 0, majuTerakhir: 0,
    jalan: false, naik: 0, turun: 0, byteTurun: 0, dunia: 0, rtt: [], koreksi: 0, gerak: 0, tersinkron: false, antreKirim: 0, antreTerima: 0, putus: false,
    // JS-08: kejadian yang terlihat dan selesai, sasaran, dialog yang terbuka, dan hitungan.
    lihat: new Map(), selesai: new Set(), sasaran: null, dialog: null, menungguSampai: 0, terlihat: 0, terbuka: 0, jawaban: 0, pribadi: 0, poin: 0 };
  return new Promise((ok, gagal) => {
    // Di lokal, setiap ruang dianggap sekolah sendiri (alamat IP berbeda) agar pembatas 300 sambungan per menit
    // per alamat (D-5) tidak menahan simulasi; di Cloudflare tajuk ini diisi jaringan Cloudflare, bukan klien.
    const tajuk = SASARAN === "lokal" ? { Origin: alamat, "CF-Connecting-IP": `10.0.0.${kodeRuangIndeks.get(kode) + 1}` } : { Origin: alamat };
    const ws = new WebSocket(`${alamat.replace(/^http/, "ws")}/ws/ruang/${kode}`, { headers: tajuk });
    b.ws = ws;
    const tundaNaik = LATENSI > 0 || JITTER_EKSP > 0 || JITTER > 0;
    const kirim = (p) => {
      b.naik++;
      const teks = JSON.stringify(p);
      if (!tundaNaik) return ws.readyState === 1 && ws.send(teks);
      const pada = Math.max(b.antreKirim, Date.now() + LATENSI + eksponensial(JITTER_EKSP) + Math.random() * JITTER);
      b.antreKirim = pada;
      setTimeout(() => ws.readyState === 1 && ws.send(teks), pada - Date.now());
    };
    b.kirim = kirim;
    const proses = (teks) => {
      const m = JSON.parse(teks);
      if (m.t === "selamat_datang") {
        b.id = m.pemainId;
        kirim({ v: V, t: "pilih_identitas", nama: m.saranNama[0], avatar: nomor % 8 });
      } else if (m.t === "saran_nama") kirim({ v: V, t: "pilih_identitas", nama: m.saranNama[0], avatar: nomor % 8 });
      else if (m.t === "dunia") b.dunia++;
      else if (m.t === "pong") b.rtt.push(Date.now() - m.tKlien);
      else if (m.t === "kejadian_terlihat") {
        b.terlihat++;
        if (!b.selesai.has(m.kejadianId)) b.lihat.set(`${m.kejadianId}@${m.x},${m.y}`, { kode: m.kejadianId, x: m.x, y: m.y });
      } else if (m.t === "pribadi") {
        b.pribadi++;
        for (const kode of m.selesai) b.selesai.add(kode);
      } else if (m.t === "kejadian_terbuka") {
        b.terbuka++;
        b.dialog = { kode: m.kejadianId };
        b.menungguSampai = 0;
        const opsi = m.opsi1[Math.floor(Math.random() * m.opsi1.length)].id;
        setTimeout(() => b.kirim({ v: V, t: "kunci_1", kejadianId: m.kejadianId, opsiId: opsi }), 1000 + Math.random() * 2000);
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
        // Koreksi pertama berisi posisi awal (P-49); sesudah itu koreksi berarti laporan jujur ditolak.
        if (b.tersinkron) b.koreksi++;
        b.x = m.x;
        b.y = m.y;
        b.seq = Math.max(b.seq, m.seq);
        b.jalur = [];
        if (!b.tersinkron) {
          b.tersinkron = true;
          ok(b);
        }
      } else if (m.t === "galat" && m.kode !== "NAMA_DIPAKAI") gagal(new Error(m.kode));
    };
    ws.onopen = () => kirim({ v: V, t: "halo", peran: "pemain" });
    ws.onmessage = (e) => {
      const teks = String(e.data);
      b.turun++;
      b.byteTurun += teks.length;
      if (LATENSI <= 0 && JITTER_EKSP <= 0) return proses(teks);
      const pada = Math.max(b.antreTerima, Date.now() + LATENSI + eksponensial(JITTER_EKSP));
      b.antreTerima = pada;
      setTimeout(() => proses(teks), pada - Date.now());
    };
    ws.onclose = () => (b.putus = true);
    ws.onerror = () => gagal(new Error("sambungan gagal"));
  });
}

/** Satu langkah bot: maju 72 px/detik menurut jam dinding di sepanjang jalurnya, lalu mengirim gerak bila perlu. */
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
    const sasaran = acakDari(fase === "lobi" ? UBIN_LOBI : UBIN_JELAJAH);
    const jalur = jalurUbin(grid, [Math.floor(b.x / 16), Math.floor(b.y / 16)], sasaran);
    b.jalur = jalur ? jalur.map(pusatUbin) : [];
  }
  let sisa = (72 * dt) / 1000;
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
    const sekarang = Date.now();
    for (const b of bot) langkahBot(b, sekarang, hz, fase);
    if (sekarang - ping >= 5000) {
      ping = sekarang;
      for (const b of bot) if (b.ws.readyState === 1) b.kirim({ v: V, t: "ping", tKlien: Date.now() });
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
  const mulaiGabung = Date.now();
  for (const kode of kodeRuang) bot.push(...(await Promise.all(Array.from({ length: BOT }, (_, i) => buatBot(kode, i)))));
  const lamaGabung = Date.now() - mulaiGabung;
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
  const lobi = await jalankanFase(bot, "lobi", LOBI_DETIK, hz);
  const koreksiLobi = bot.reduce((s, b) => s + b.koreksi, 0);
  const gerakLobi = bot.reduce((s, b) => s + b.gerak, 0);
  // 3. Ronde: mulai lewat kait lokal, lalu menjelajah kampung.
  if (SASARAN === "lokal") for (const kode of kodeRuang) await kelas(kode, { t: "mulai" });
  await jalankanFase(bot, "diam", 3.5, hz);
  for (const b of bot) {
    b.koreksi = 0;
    b.gerak = 0;
    b.rtt = [];
  }
  const jelajah = await jalankanFase(bot, "jelajah", DETIK, hz);
  // Dihitung sebelum ruang diakhiri dan ditutup, karena penutupan ruang memutus semua bot dengan sengaja.
  const putusTakTerduga = bot.filter((b) => b.putus).length;
  const stat = SASARAN === "lokal" ? await Promise.all(kodeRuang.map(statistik)) : [];
  if (SASARAN === "lokal") for (const kode of kodeRuang) {
    await kelas(kode, { t: "akhiri" });
    await kelas(kode, { t: "tutup_ruang" });
  }
  const jumlah = (f) => bot.reduce((s, b) => s + f(b), 0);
  const hasil = {
    waktu: new Date().toISOString(),
    sasaran: SASARAN,
    ruang: RUANG,
    botPerRuang: BOT,
    latensiMs: LATENSI,
    jitterEksponensialRataMs: JITTER_EKSP,
    jitterSeragamMs: JITTER,
    gerakPerDetikSaatBergerak: hz,
    lamaSemuaBergabungMs: lamaGabung,
    lobiDiam,
    lobi: { ...lobi, gerakDikoreksiPersen: +((100 * koreksiLobi) / Math.max(1, gerakLobi)).toFixed(3) },
    jelajah: {
      ...jelajah,
      rttMsP50: persen(bot.flatMap((b) => b.rtt), 0.5),
      rttMsP95: persen(bot.flatMap((b) => b.rtt), 0.95),
      gerakDikirim: jumlah((b) => b.gerak),
      gerakDikoreksi: jumlah((b) => b.koreksi),
      gerakDikoreksiPersen: +((100 * jumlah((b) => b.koreksi)) / Math.max(1, jumlah((b) => b.gerak))).toFixed(3),
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
    sambunganPutusTakTerduga: putusTakTerduga,
    pesanDitolakServer: stat.reduce((s, x) => s + (x.pelanggaran ?? 0), 0),
    alasanKoreksiServer: stat.map((x) => x.koreksiAlasan ?? {}),
    barisSqliteDitulisPerRuang: stat.map((x) => x.barisDitulis),
    perkiraanPermintaanDurableObjectPerSesi15MenitPerRuang: perkiraanPermintaan(jelajah.pesanNaikPerPemainPerDetik * BOT, BOT),
  };
  mkdirSync(join(akar, "test-results-jejak"), { recursive: true });
  const berkas = join(akar, "test-results-jejak", `beban-${RUANG}x${BOT}-${Date.now()}.json`);
  writeFileSync(berkas, JSON.stringify(hasil, null, 2));
  console.log(JSON.stringify(hasil, null, 2));
  for (const b of bot) b.ws.close();
} finally {
  if (server) server.kill("SIGTERM");
  await tidur(800);
}
process.exit(0);
