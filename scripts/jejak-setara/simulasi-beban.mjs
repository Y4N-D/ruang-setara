// Simulasi beban Jejak Setara (spesifikasi JS-03, bagian "Skrip"; AC-20; Architecture 13.4 dan 14).
// Bawaan: menyalakan Worker lokal (server-lokal.mjs, port 4330), yang tidak memakai kuota Cloudflare.
//   node scripts/jejak-setara/simulasi-beban.mjs --ruang 1 --bot 50 --detik 60 [--jitter-ms 50] [--tanpa-build]
// Lingkungan uji hanya dengan pilihan tertulis: --sasaran uji --alamat <URL> --saya-paham-kuota, serta
// rahasia JEJAK_KUNCI_COBA; perkiraan permintaan Durable Object dicetak lebih dulu, dan lebih dari 20.000 ditolak.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
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
async function buatRuang() {
  const j = await fetch(`${alamat}/api/ruang-coba`, { method: "POST", headers: tajukKunci, body: JSON.stringify({ batasPemain: Math.max(2, Math.min(100, BOT)) }) });
  if (j.status !== 201) throw new Error(`ruang coba ${j.status}`);
  return (await j.json()).kode;
}
const kodeRuangIndeks = new Map();
const kelas = (kode, pesan) => fetch(`${alamat}/api/ruang-coba/${kode}/kelas`, { method: "POST", body: JSON.stringify({ v: 1, ...pesan }) });
const statistik = async (kode) => (await fetch(`${alamat}/api/ruang-coba/${kode}/statistik`)).json();

// Bot bergerak di jalur bebas blok peta uji (ubin y 25–75), menuju titik acak lalu diam 4–10 detik.
const TITIK = Array.from({ length: 16 }, (_, i) => [120 + (i % 8) * 300, 440 + Math.floor(i / 8) * 640]);

function buatBot(kode, nomor) {
  const b = { kode, nomor, ws: null, id: null, seq: 0, x: null, y: null, arah: "bawah", tujuan: null, diamSampai: 0, kirimTerakhir: 0,
    naik: 0, turun: 0, byteTurun: 0, rtt: [], koreksi: 0, gerak: 0, tersinkron: false, antreKirim: 0, putus: false };
  return new Promise((ok, gagal) => {
    // Di lokal, setiap ruang dianggap sekolah sendiri (alamat IP berbeda) agar pembatas 300 sambungan per menit
    // per alamat (D-5) tidak menahan simulasi; di Cloudflare tajuk ini diisi jaringan Cloudflare, bukan klien.
    const tajuk = SASARAN === "lokal" ? { Origin: alamat, "CF-Connecting-IP": `10.0.0.${kodeRuangIndeks.get(kode) + 1}` } : { Origin: alamat };
    const ws = new WebSocket(`${alamat.replace(/^http/, "ws")}/ws/ruang/${kode}`, { headers: tajuk });
    b.ws = ws;
    const kirim = (p) => {
      b.naik++;
      const teks = JSON.stringify(p);
      if (JITTER <= 0) return ws.readyState === 1 && ws.send(teks);
      const pada = Math.max(b.antreKirim, Date.now() + Math.random() * JITTER);
      b.antreKirim = pada;
      setTimeout(() => ws.readyState === 1 && ws.send(teks), pada - Date.now());
    };
    b.kirim = kirim;
    ws.onopen = () => kirim({ v: 1, t: "halo", peran: "pemain" });
    ws.onmessage = (e) => {
      b.turun++;
      b.byteTurun += String(e.data).length;
      const m = JSON.parse(String(e.data));
      if (m.t === "selamat_datang") {
        b.id = m.pemainId;
        kirim({ v: 1, t: "pilih_identitas", nama: m.saranNama[0], avatar: nomor % 8 });
      } else if (m.t === "saran_nama") kirim({ v: 1, t: "pilih_identitas", nama: m.saranNama[0], avatar: nomor % 8 });
      else if (m.t === "pemain_baru" && m.id === b.id) ok(b);
      else if (m.t === "pong") b.rtt.push(Date.now() - m.tKlien);
      else if (m.t === "koreksi") {
        if (b.tersinkron) b.koreksi++;
        b.x = m.x;
        b.y = m.y;
        b.tersinkron = true;
      } else if (m.t === "galat" && m.kode !== "NAMA_DIPAKAI") gagal(new Error(m.kode));
    };
    ws.onclose = () => (b.putus = true);
    ws.onerror = () => gagal(new Error("sambungan gagal"));
  });
}

function langkahBot(b, sekarang, hz) {
  if (b.ws.readyState !== 1) return;
  if (!b.tersinkron) {
    // Laporan pertama sengaja salah tempat agar server menjawab koreksi berisi posisi muncul yang sebenarnya.
    if (sekarang - b.kirimTerakhir >= 1000) {
      b.kirimTerakhir = sekarang;
      b.kirim({ v: 1, t: "gerak", x: 1, y: 1, arah: "bawah", jalan: false, seq: ++b.seq });
    }
    return;
  }
  if (!b.tujuan && sekarang >= b.diamSampai) b.tujuan = TITIK[Math.floor(Math.random() * TITIK.length)];
  let jalan = false;
  const selang = 1000 / hz;
  if (b.tujuan && sekarang - b.kirimTerakhir >= selang) {
    const dx = b.tujuan[0] - b.x;
    const dy = b.tujuan[1] - b.y;
    const d = Math.hypot(dx, dy);
    const s = Math.min(d, (72 * (sekarang - b.kirimTerakhir)) / 1000 || 72 / hz);
    if (d < 4) {
      b.tujuan = null;
      b.diamSampai = sekarang + 4000 + Math.random() * 6000;
    } else {
      b.x += (dx / d) * Math.min(s, 72 / hz);
      b.y += (dy / d) * Math.min(s, 72 / hz);
      b.arah = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "kanan" : "kiri") : dy > 0 ? "bawah" : "atas";
      jalan = true;
    }
  }
  if (jalan || sekarang - b.kirimTerakhir >= 1000) {
    b.kirimTerakhir = sekarang;
    b.gerak++;
    b.kirim({ v: 1, t: "gerak", x: Math.round(b.x * 10) / 10, y: Math.round(b.y * 10) / 10, arah: b.arah, jalan, seq: ++b.seq });
  }
}

const persen = (larik, q) => {
  const s = [...larik].sort((a, c) => a - c);
  return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : null;
};

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
  if (SASARAN === "lokal") for (const kode of kodeRuang) await kelas(kode, { t: "mulai" });
  await tidur(3500);
  for (const b of bot) {
    b.naik = 0;
    b.turun = 0;
    b.byteTurun = 0;
  }
  const hz = frekuensi(BOT);
  const mulai = Date.now();
  const akhir = mulai + DETIK * 1000;
  let ping = 0;
  while (Date.now() < akhir) {
    const sekarang = Date.now();
    for (const b of bot) langkahBot(b, sekarang, hz);
    if (sekarang - ping >= 5000) {
      ping = sekarang;
      for (const b of bot) if (b.ws.readyState === 1) b.kirim({ v: 1, t: "ping", tKlien: Date.now() });
    }
    await tidur(1000 / hz / 2);
  }
  const detik = (Date.now() - mulai) / 1000;
  // Dihitung sebelum ruang diakhiri dan ditutup, karena penutupan ruang memutus semua bot dengan sengaja.
  const putusTakTerduga = bot.filter((b) => b.putus).length;
  const stat = SASARAN === "lokal" ? await Promise.all(kodeRuang.map(statistik)) : [];
  if (SASARAN === "lokal") for (const kode of kodeRuang) {
    await kelas(kode, { t: "akhiri" });
    await kelas(kode, { t: "tutup_ruang" });
  }
  const jumlah = (f) => bot.reduce((s, b) => s + f(b), 0);
  const naikPerPemain = jumlah((b) => b.naik) / bot.length / detik;
  const turunBytePerPemain = jumlah((b) => b.byteTurun) / bot.length / detik;
  const hasil = {
    waktu: new Date().toISOString(),
    sasaran: SASARAN,
    ruang: RUANG,
    botPerRuang: BOT,
    detik: Math.round(detik),
    jitterMs: JITTER,
    gerakPerDetikSaatBergerak: hz,
    lamaSemuaBergabungMs: lamaGabung,
    pesanNaikPerPemainPerDetik: +naikPerPemain.toFixed(2),
    pesanTurunPerPemainPerDetik: +(jumlah((b) => b.turun) / bot.length / detik).toFixed(2),
    byteTurunPerPemainPerDetik: Math.round(turunBytePerPemain),
    mbTurunPerPemainPer15Menit: +((turunBytePerPemain * 900) / 1e6).toFixed(2),
    rttMsP50: persen(bot.flatMap((b) => b.rtt), 0.5),
    rttMsP95: persen(bot.flatMap((b) => b.rtt), 0.95),
    gerakDikoreksiPersen: +((100 * jumlah((b) => b.koreksi)) / Math.max(1, jumlah((b) => b.gerak))).toFixed(3),
    sambunganPutusTakTerduga: putusTakTerduga,
    pesanDitolakServer: stat.reduce((s, x) => s + (x.pelanggaran ?? 0), 0),
    barisSqliteDitulisPerRuang: stat.map((x) => x.barisDitulis),
    perkiraanPermintaanDurableObjectPerSesi15MenitPerRuang: perkiraanPermintaan(naikPerPemain * BOT, BOT),
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
