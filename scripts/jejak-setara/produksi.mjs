// Pemeriksaan sebelum deploy produksi Jejak Setara (spesifikasi JS-16a, P-3 sampai P-6), dipakai "Jejak: produksi":
//   node scripts/jejak-setara/produksi.mjs periksa-rilis   cabang, nomor rilis, catatan rilis, rahasia, dan Database ID
//   node scripts/jejak-setara/produksi.mjs ruang-aktif     jumlah ruang produksi yang belum ditutup
// Variabel lingkungan: VERSI_MASUKAN, GITHUB_REF, CLOUDFLARE_API_TOKEN dan CLOUDFLARE_ACCOUNT_ID (hanya ada tidaknya; isinya
// tidak pernah dibaca atau dicetak), DEPLOY_DARURAT ("true" atau "false"), GITHUB_ENV, dan GITHUB_STEP_SUMMARY.
// Pemeriksaan ruang hanya membaca jumlah, tanpa kode ruang, nama, atau isi lain.
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JALUR_WRANGLER, argumenStatusWrangler, barisStatus, buangKomentar } from "./semai.mjs";

const AKAR = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const SQL_ADA_TABEL_RUANG = "SELECT COUNT(*) AS jumlah FROM sqlite_master WHERE type = 'table' AND name = 'ruang'";
export const SQL_RUANG_AKTIF = "SELECT COUNT(*) AS jumlah FROM ruang WHERE status <> 'ditutup'";
export const POLA_VERSI = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)(\.(0|[1-9]\d*))?$/;
export const ID_KOSONG_PRODUKSI = "ISI_DATABASE_ID_PRODUKSI";
export const CABANG_RILIS = "refs/heads/main";
export const BENDERA_PRODUKSI = ["--remote", "--env", "produksi"];

/** Teks alur kerja produksi, sama dengan TEKS_KONSOL.alurProduksi dan alurAdminAwal.rahasiaCloudflare (uji kerangka). */
export const TEKS = {
  bukanMain: "Jalankan alur kerja ini dari branch main.",
  versiSalah: "Nomor rilis harus berbentuk vX.Y atau vX.Y.Z, misalnya v0.9.",
  catatanTidakAda: "Catatan rilis {versi} belum ada di docs/jejak-setara/rilis/. Minta agen menulisnya lebih dulu.",
  rahasiaCloudflare: "Rahasia Cloudflare belum diisi (Architecture bagian 18, langkah 6).",
  idBelumDiisi: "Database ID produksi belum diisi di server/jejak-setara/wrangler.jsonc (Architecture bagian 18, langkah 3).",
  ruangKosong: "Tidak ada ruang produksi yang sedang berjalan.",
  ruangAktif: "Ada {jumlah} ruang produksi yang belum ditutup. Tunggu sampai kelas selesai atau tutup ruangnya dari konsol, lalu jalankan lagi.",
  ruangDarurat: "Peringatan: deploy dilanjutkan walaupun ada {jumlah} ruang yang belum ditutup. Pemain di ruang itu akan tersambung ulang.",
  ruangGagal: "Daftar ruang produksi tidak bisa dibaca. Coba lagi beberapa menit lagi.",
};

const isiTeks = (teks, nilai) => teks.replace(/\{(\w+)\}/g, (_, kunci) => String(nilai[kunci]));

/** Database ID D1 lingkungan produksi dari isi wrangler.jsonc, atau null bila tidak ada atau tidak terbaca. */
export function idD1Produksi(isiWrangler) {
  try {
    const d1 = JSON.parse(buangKomentar(isiWrangler))?.env?.produksi?.d1_databases;
    return Array.isArray(d1) && typeof d1[0]?.database_id === "string" ? d1[0].database_id : null;
  } catch {
    return null;
  }
}

/**
 * Pemeriksaan P-3, berurutan: cabang, bentuk nomor rilis, berkas catatan rilis, rahasia Cloudflare, Database ID produksi.
 * Mengembalikan { ok: true } atau { ok: false, pesan } dengan pesan pertama yang cocok.
 */
export function periksaRilis({ versi, ref, adaToken, adaAkun, akar = AKAR }) {
  if (ref !== CABANG_RILIS) return { ok: false, pesan: TEKS.bukanMain };
  if (typeof versi !== "string" || !POLA_VERSI.test(versi)) return { ok: false, pesan: TEKS.versiSalah };
  if (!existsSync(join(akar, "docs", "jejak-setara", "rilis", `${versi}.md`))) {
    return { ok: false, pesan: isiTeks(TEKS.catatanTidakAda, { versi }) };
  }
  if (!adaToken || !adaAkun) return { ok: false, pesan: TEKS.rahasiaCloudflare };
  const jalur = join(akar, JALUR_WRANGLER);
  const id = existsSync(jalur) ? idD1Produksi(readFileSync(jalur, "utf8")) : null;
  if (!id || id === ID_KOSONG_PRODUKSI) return { ok: false, pesan: TEKS.idBelumDiisi };
  return { ok: true };
}

/** Kolom jumlah di baris pertama keluaran "wrangler d1 execute --json", atau null bila tidak terbaca. */
export function bacaJumlah(keluaran) {
  const baris = barisStatus(keluaran);
  const nilai = baris ? baris.jumlah : undefined;
  if (typeof nilai !== "number" && !(typeof nilai === "string" && /^\d+$/.test(nilai))) return null;
  const jumlah = Number(nilai);
  return Number.isInteger(jumlah) && jumlah >= 0 ? jumlah : null;
}

/**
 * Keputusan P-4 dan P-6: { lanjut, tingkat: "info" | "peringatan" | "galat", pesan }.
 * Jumlah yang tidak terbaca selalu menghentikan run, juga bila darurat dicentang.
 */
export function putuskanRuang(jumlah, darurat) {
  if (!Number.isInteger(jumlah) || jumlah < 0) return { lanjut: false, tingkat: "galat", pesan: TEKS.ruangGagal };
  if (jumlah === 0) return { lanjut: true, tingkat: "info", pesan: TEKS.ruangKosong };
  if (darurat === true) return { lanjut: true, tingkat: "peringatan", pesan: isiTeks(TEKS.ruangDarurat, { jumlah }) };
  return { lanjut: false, tingkat: "galat", pesan: isiTeks(TEKS.ruangAktif, { jumlah }) };
}

/**
 * P-4 dan P-5: jumlah ruang yang belum ditutup; 0 bila tabel ruang belum ada (D1 baru sebelum migrasi);
 * null bila wrangler gagal atau keluarannya tidak terbaca. `jalankan(argumen)` mengembalikan { status, stdout }.
 */
export function hitungRuangAktif(jalankan) {
  const kueri = (sql) => {
    const hasil = jalankan(argumenStatusWrangler(sql, BENDERA_PRODUKSI));
    return hasil && hasil.status === 0 ? bacaJumlah(hasil.stdout) : null;
  };
  const adaTabel = kueri(SQL_ADA_TABEL_RUANG);
  if (adaTabel === null) return null;
  if (adaTabel === 0) return 0;
  return kueri(SQL_RUANG_AKTIF);
}

function jalankanWrangler(argumen) {
  const wrangler = join(AKAR, "node_modules/wrangler/bin/wrangler.js");
  if (!existsSync(wrangler)) return { status: 1, stdout: "" };
  const hasil = spawnSync(process.execPath, [wrangler, ...argumen], {
    cwd: AKAR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    maxBuffer: 1024 * 1024,
  });
  return { status: hasil.status ?? 1, stdout: hasil.stdout ?? "" };
}

function tambahBaris(berkas, baris) {
  if (berkas) appendFileSync(berkas, `${baris}\n`);
}

/**
 * Titik masuk baris perintah; mengembalikan kode keluar.
 * @param {string[]} argumen
 * @param {Record<string, string | undefined>} [lingkungan]
 * @param {(argumen: string[]) => { status: number, stdout: string }} [jalankan]
 */
export function utama(argumen, lingkungan = process.env, jalankan = jalankanWrangler) {
  const [perintah] = argumen;
  if (perintah === "periksa-rilis") {
    const versi = (lingkungan.VERSI_MASUKAN ?? "").trim();
    const hasil = periksaRilis({
      versi,
      ref: lingkungan.GITHUB_REF,
      adaToken: Boolean(lingkungan.CLOUDFLARE_API_TOKEN),
      adaAkun: Boolean(lingkungan.CLOUDFLARE_ACCOUNT_ID),
    });
    if (!hasil.ok) {
      console.log(`::error::${hasil.pesan}`);
      return 1;
    }
    // Nomor rilis sudah lolos POLA_VERSI, jadi aman ditulis ke GITHUB_ENV untuk langkah berikutnya.
    tambahBaris(lingkungan.GITHUB_ENV, `VERSI=${versi}`);
    console.log(`Rilis ${versi}: pemeriksaan awal lulus.`);
    return 0;
  }
  if (perintah === "ruang-aktif") {
    const keputusan = putuskanRuang(hitungRuangAktif(jalankan), lingkungan.DEPLOY_DARURAT === "true");
    if (keputusan.tingkat === "galat") {
      console.log(`::error::${keputusan.pesan}`);
      return 1;
    }
    console.log(keputusan.tingkat === "peringatan" ? `::warning::${keputusan.pesan}` : keputusan.pesan);
    tambahBaris(lingkungan.GITHUB_STEP_SUMMARY, keputusan.pesan);
    return 0;
  }
  console.error("Pemakaian: node scripts/jejak-setara/produksi.mjs periksa-rilis | ruang-aktif");
  return 2;
}

if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
  process.exitCode = utama(process.argv.slice(2));
}
