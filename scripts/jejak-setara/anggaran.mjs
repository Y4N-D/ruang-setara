// Pemeriksa anggaran ukuran Jejak Setara (spesifikasi JS-15, P-20 sampai P-22; Architecture 11.3). Membaca hasil
// build:jejak (dist-jejak/client) dan berkas peta, menghitung gzip level 9, lalu mencetak tabel butir, ukuran, batas,
// dan status. Kode keluar 1 bila ada butir yang melewati batas. Ukuran dijumlahkan per jenis, bukan dicocokkan per nama
// berkas, karena nama aset kembar bisa bertukar antar-build.
//   node scripts/jejak-setara/anggaran.mjs [--dist dist-jejak/client] [--peta app/jejak-setara/peta] [--ringkasan]
import { appendFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

const KB = 1024;
export const BATAS = {
  kodePemain: 200 * KB,
  kodeKonsol: 350 * KB,
  asetPemain: 2 * KB * KB,
  ubin: 60 * KB,
  strip: 6 * KB,
  sfxPendek: 30 * KB,
  sfxAkhir: 160 * KB,
  musikKelas: KB * KB,
  peta: 60 * KB,
};
/** Berkas khusus layar kelas, tidak dihitung dalam aset layar pemain (Architecture 11.3, C-14 dan C-16). */
export const KHUSUS_KELAS = ["sfx_akhir", "musik_kelas"];
/** Awalan nama asli berkas → jenis berbatas per berkas. Awalan lain (obj_, ikon_, tanda_) hanya ikut jumlah. */
export const JENIS = [
  { awalan: "ubin_", jenis: "ubin", batas: BATAS.ubin, label: "Lembar ubin per masa" },
  { awalan: "ava_", jenis: "strip", batas: BATAS.strip, label: "Strip avatar atau tokoh" },
  { awalan: "npc_", jenis: "strip", batas: BATAS.strip, label: "Strip avatar atau tokoh" },
  { awalan: "sfx_akhir", jenis: "sfxAkhir", batas: BATAS.sfxAkhir, label: "Jingle akhir sfx_akhir.wav" },
  { awalan: "musik_kelas", jenis: "musikKelas", batas: BATAS.musikKelas, label: "Musik latar musik_kelas.wav" },
  { awalan: "sfx_", jenis: "sfxPendek", batas: BATAS.sfxPendek, label: "Efek suara pendek" },
];

const gz = (b) => gzipSync(b, { level: 9 }).length;
/** Nama asli tanpa hash Vite: `ubin_pagi-AbCd1234.png` → `ubin_pagi.png`. */
export const namaAsli = (berkas) => berkas.replace(/-[A-Za-z0-9_-]{8}(\.[a-z0-9]+)$/, "$1");
const dariHtml = (html) => [...html.matchAll(/(?:src|href)="\/assets\/([^"]+)"/g)].map((m) => m[1]);

export function ukurBuild({ dist, peta }) {
  const aset = join(dist, "assets");
  const berkas = readdirSync(aset);
  const isi = (f) => readFileSync(join(aset, f));
  const kode = (html) => dariHtml(readFileSync(join(dist, html), "utf8")).filter((f) => /\.(js|css)$/.test(f));
  const pemain = kode("index.html");
  const konsol = kode("admin/index.html");
  const teksPemain = pemain.map((f) => isi(f).toString("utf8")).join("\n");
  const teksKonsol = konsol.map((f) => isi(f).toString("utf8")).join("\n");
  const butir = [];
  const tambah = (nama, ukuran, batas, catatan = "") => butir.push({ nama, ukuran, batas, lulus: ukuran <= batas, catatan });
  tambah("Kode layar pemain (gzip)", pemain.reduce((s, f) => s + gz(isi(f)), 0), BATAS.kodePemain, pemain.join(", "));
  tambah("Kode konsol admin (gzip)", konsol.reduce((s, f) => s + gz(isi(f)), 0), BATAS.kodeKonsol, konsol.join(", "));
  // Potongan yang dimuat dinamis, dicatat terpisah menurut siapa yang mengimpornya (P-20 butir 2).
  const awal = new Set([...pemain, ...konsol]);
  const dinamis = berkas
    .filter((f) => f.endsWith(".js") && !awal.has(f))
    .map((f) => ({ berkas: f, milik: teksKonsol.includes(f) ? "konsol" : teksPemain.includes(f) ? "pemain" : "lain", gzip: gz(isi(f)) }));
  // Aset yang dirujuk kode layar pemain, kecuali berkas khusus layar kelas (P-20 butir 3).
  const rujukPemain = new Set([...teksPemain.matchAll(/\/assets\/([A-Za-z0-9_.-]+\.(?:png|woff2?|json|wav|mp3|ogg))/g)].map((m) => m[1]));
  const asetPemain = [...rujukPemain].filter((f) => !KHUSUS_KELAS.some((a) => namaAsli(f).startsWith(a)));
  tambah("Seluruh aset layar pemain", asetPemain.reduce((s, f) => s + statSync(join(aset, f)).size, 0), BATAS.asetPemain, `${asetPemain.length} berkas`);
  // Batas per jenis berkas (P-20 butir 4): berkas terbesar setiap jenis.
  const perJenis = new Map();
  for (const f of berkas) {
    const j = JENIS.find((x) => namaAsli(f).startsWith(x.awalan));
    if (!j) continue;
    const ukuran = statSync(join(aset, f)).size;
    const lama = perJenis.get(j.jenis);
    if (!lama || ukuran > lama.ukuran) perJenis.set(j.jenis, { j, ukuran, f: namaAsli(f) });
  }
  for (const { j, ukuran, f } of perJenis.values()) tambah(`${j.label} (terbesar)`, ukuran, j.batas, f);
  // Kedua berkas peta JSON bersama, gzip (P-20 butir 5).
  const berkasPeta = ["kampung.json", "kampung_gambar.json"];
  tambah("Kedua berkas peta JSON (gzip)", berkasPeta.reduce((s, f) => s + gz(readFileSync(join(peta, f))), 0), BATAS.peta, berkasPeta.join(" + "));
  return { lulus: butir.every((b) => b.lulus), butir, dinamis };
}

const kb = (n) => `${(n / KB).toFixed(2)} KB`;
export function teksTabel(laporan) {
  return [
    `### Anggaran ukuran Jejak Setara: ${laporan.lulus ? "semua di bawah batas" : "ADA YANG MELEWATI BATAS"}`,
    "",
    "| Butir | Ukuran | Batas | Status | Keterangan |",
    "|---|---|---|---|---|",
    ...laporan.butir.map((b) => `| ${b.nama} | ${kb(b.ukuran)} | ${kb(b.batas)} | ${b.lulus ? "Lulus" : "Lewat"} | ${b.catatan} |`),
    "",
    ...(laporan.dinamis.length > 0 ? ["Potongan yang dimuat dinamis: " + laporan.dinamis.map((d) => `${d.berkas} (${d.milik}, ${kb(d.gzip)})`).join("; "), ""] : []),
  ].join("\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = process.argv.slice(2);
  const ambil = (n, b) => (arg.indexOf(n) >= 0 ? arg[arg.indexOf(n) + 1] : b);
  const dist = ambil("--dist", "dist-jejak/client");
  if (!existsSync(join(dist, "index.html"))) {
    console.error(`Hasil build tidak ada di ${dist}. Jalankan build:jejak lebih dulu.`);
    process.exit(1);
  }
  const laporan = ukurBuild({ dist, peta: ambil("--peta", "app/jejak-setara/peta") });
  const teks = teksTabel(laporan);
  console.log(teks);
  if (arg.includes("--ringkasan") && process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, teks);
  process.exit(laporan.lulus ? 0 : 1);
}
