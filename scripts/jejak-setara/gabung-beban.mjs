// Penggabung hasil uji beban (spesifikasi JS-15, P-13 dan P-14): membaca JSON setiap pekerjaan bot "Jejak: uji beban"
// (keluaran simulasi-beban.mjs), menilai ambang lulus per skenario, lalu menulis hasil-uji-beban.json dan tabel
// ringkasan. Kode keluar 1 bila satu ambang gagal.
//   node scripts/jejak-setara/gabung-beban.mjs --skenario s2 --masukan <folder> --keluaran hasil-uji-beban.json [--ringkasan]
import { appendFileSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { SKENARIO } from "./biaya-beban.mjs";

export const AMBANG = {
  koreksiPersenMaks: 1,
  mbPer15MenitMaks: 3,
  kenaikanRttMsMaks: 50,
  selisihPermintaanMaks: 0.25,
  tumpangTindihS2Ms: 14 * 60_000,
};

const jumlah = (larik, f) => larik.reduce((s, x) => s + f(x), 0);

/** Lama semua ruang berstatus `main` bersamaan (ms), dari waktuRuang setiap pekerjaan. */
export function tumpangTindihMain(daftarHasil) {
  const w = daftarHasil.flatMap((h) => h.waktuRuang ?? []);
  if (w.length === 0 || w.some((x) => x.mainMulai == null || x.mainAkhir == null)) return 0;
  return Math.max(0, Math.min(...w.map((x) => x.mainAkhir)) - Math.max(...w.map((x) => x.mainMulai)));
}

/** Menilai ambang P-14 untuk satu skenario dari hasil semua pekerjaannya. */
export function gabungHasil(skenario, daftarHasil) {
  const s = SKENARIO[skenario];
  if (!s) throw new Error(`skenario tidak dikenal: ${skenario}`);
  const ambang = [];
  const tambah = (nama, nilai, batas, lulus, catatan = "") => ambang.push({ nama, nilai, batas, lulus, catatan });
  const totalBot = s.pekerjaan * s.ruang * s.bot;
  tambah("Jumlah pekerjaan dengan hasil", daftarHasil.length, s.pekerjaan, daftarHasil.length === s.pekerjaan);
  const putus = jumlah(daftarHasil, (h) => h.sambunganPutusTakTerduga ?? 0);
  tambah("Sambungan putus tak terduga", putus, 0, putus === 0);
  const ditolak = jumlah(daftarHasil, (h) => h.pesanDitolakServer ?? 0);
  tambah("Pesan ditolak server", ditolak, 0, ditolak === 0);
  const koreksi = Math.max(0, ...daftarHasil.map((h) => h.jelajah?.gerakDikoreksiPersen ?? 100));
  tambah("Gerak jujur dikoreksi (%)", koreksi, `< ${AMBANG.koreksiPersenMaks}`, koreksi < AMBANG.koreksiPersenMaks);
  const selesai = jumlah(daftarHasil, (h) => h.akhirRonde?.botMenerimaSelesai ?? 0);
  const peserta = daftarHasil.flatMap((h) => h.akhirRonde?.pesertaD1 ?? []);
  const pesertaPas = peserta.length === s.pekerjaan * s.ruang && peserta.every((n) => n === s.bot);
  tambah("Bot menerima selesai", selesai, totalBot, selesai === totalBot);
  tambah("Peserta di D1 per ruang", peserta.join(", ") || "-", s.bot, pesertaPas);
  const mb = Math.max(0, ...daftarHasil.map((h) => h.jelajah?.mbTurunPerPemainPer15Menit ?? Infinity));
  tambah("Data turun per pemain per 15 menit (MB)", mb, `≤ ${AMBANG.mbPer15MenitMaks}`, mb <= AMBANG.mbPer15MenitMaks);
  if (s.sasaran === "uji") {
    const kenaikan = daftarHasil.map((h) => (h.rttSepiMsP95 == null ? null : (h.jelajah?.rttMsP95 ?? Infinity) - h.rttSepiMsP95));
    const ada = kenaikan.every((k) => k !== null);
    const maks = ada ? Math.max(...kenaikan) : null;
    tambah("Kenaikan p95 pulang-pergi (ms)", maks ?? "-", `≤ ${AMBANG.kenaikanRttMsMaks}`, ada && maks <= AMBANG.kenaikanRttMsMaks, ada ? "" : "pengukur sepi gagal");
  }
  const selisih = daftarHasil.flatMap((h) =>
    (h.pemakaianRuang ?? []).map((p) => (p?.perkiraanPermintaan == null ? null : p.perkiraanPermintaan / h.perkiraanBiaya.permintaanDOPerRuang - 1)),
  );
  const adaPemakaian = selisih.length === s.pekerjaan * s.ruang && selisih.every((x) => x !== null);
  const selisihMaks = adaPemakaian ? Math.max(...selisih.map(Math.abs)) : null;
  tambah(
    "Selisih permintaan Durable Object per ruang dari perkiraan (%)",
    selisihMaks === null ? "-" : Math.round(selisihMaks * 1000) / 10,
    `≤ ${AMBANG.selisihPermintaanMaks * 100}`,
    adaPemakaian && selisihMaks <= AMBANG.selisihPermintaanMaks,
    adaPemakaian ? "" : "pemakaian ruang tidak terbaca",
  );
  if (skenario === "s2") {
    const tt = tumpangTindihMain(daftarHasil);
    tambah("Semua ruang main bersamaan (menit)", Math.round(tt / 6000) / 10, `≥ ${AMBANG.tumpangTindihS2Ms / 60_000}`, tt >= AMBANG.tumpangTindihS2Ms);
  }
  const rtt = daftarHasil.flatMap((h) => (h.pemakaianRuang ?? []).map((p) => p?.rttP95Ms ?? null)).filter((x) => x !== null);
  return {
    skenario,
    waktu: new Date().toISOString(),
    lulus: ambang.every((a) => a.lulus),
    ambang,
    ringkasan: {
      pekerjaan: daftarHasil.length,
      ruang: s.pekerjaan * s.ruang,
      botPerRuang: s.bot,
      perkiraanPermintaanDO: jumlah(daftarHasil, (h) => h.perkiraanBiaya?.permintaanDO ?? 0),
      pemakaianPermintaanDO: jumlah(daftarHasil, (h) => jumlah(h.pemakaianRuang ?? [], (p) => p?.perkiraanPermintaan ?? 0)),
      rttServerP95MsMaks: rtt.length > 0 ? Math.max(...rtt) : null,
    },
  };
}

/** Tabel Markdown untuk ringkasan run GitHub. */
export function teksRingkasan(laporan) {
  const baris = laporan.ambang.map((a) => `| ${a.nama} | ${a.nilai} | ${a.batas} | ${a.lulus ? "Lulus" : "Gagal"}${a.catatan ? ` (${a.catatan})` : ""} |`);
  const r = laporan.ringkasan;
  return [
    `### Jejak: uji beban, skenario ${laporan.skenario}: ${laporan.lulus ? "LULUS" : "GAGAL"}`,
    "",
    "| Ambang | Nilai | Batas | Hasil |",
    "|---|---|---|---|",
    ...baris,
    "",
    `Ruang ${r.ruang} × ${r.botPerRuang} bot dari ${r.pekerjaan} pekerjaan. Permintaan Durable Object: perkiraan ±${r.perkiraanPermintaanDO}, penghitung ruang ${r.pemakaianPermintaanDO}. p95 pulang-pergi HP menurut server: ${r.rttServerP95MsMaks ?? "-"} ms.`,
    "",
  ].join("\n");
}

/** Semua berkas .json di folder (bertingkat), seperti hasil actions/download-artifact. */
function bacaFolder(folder) {
  const hasil = [];
  for (const nama of readdirSync(folder)) {
    const jalur = join(folder, nama);
    if (statSync(jalur).isDirectory()) hasil.push(...bacaFolder(jalur));
    else if (nama.endsWith(".json")) hasil.push(JSON.parse(readFileSync(jalur, "utf8")));
  }
  return hasil;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = process.argv.slice(2);
  const ambil = (n) => (arg.indexOf(n) >= 0 ? arg[arg.indexOf(n) + 1] : undefined);
  const laporan = gabungHasil(ambil("--skenario"), bacaFolder(ambil("--masukan")));
  writeFileSync(ambil("--keluaran") ?? "hasil-uji-beban.json", JSON.stringify(laporan, null, 2));
  const teks = teksRingkasan(laporan);
  console.log(teks);
  if (arg.includes("--ringkasan") && process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, teks);
  process.exit(laporan.lulus ? 0 : 1);
}
