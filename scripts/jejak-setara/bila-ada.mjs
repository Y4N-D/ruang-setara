// Penjalan skrip Jejak Setara yang berkas atau fiturnya belum ada (spesifikasi JS-01, P-16 dan P-17).
// Pemakaian: node scripts/jejak-setara/bila-ada.mjs <jalur atau -> <keterangan> [-- <perintah …>]
// - jalur "-": cetak "Belum tersedia (keterangan)." lalu selesai dengan kode 0;
// - jalur belum ada: cetak "Belum tersedia: jalur belum ada (keterangan)." lalu selesai dengan kode 0;
// - jalur ada: jalankan perintah lewat shell dan teruskan kode keluarnya (1 bila tidak ada kode).
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const [jalur, keterangan, pemisah, ...perintah] = process.argv.slice(2);

if (jalur === "-") {
  console.log(`Belum tersedia (${keterangan}).`);
  process.exit(0);
}
if (!existsSync(jalur)) {
  console.log(`Belum tersedia: ${jalur} belum ada (${keterangan}).`);
  process.exit(0);
}
if (pemisah !== "--" || perintah.length === 0) {
  console.error("bila-ada.mjs: perintah tidak diberikan sesudah --.");
  process.exit(1);
}
const hasil = spawnSync(perintah.join(" "), { stdio: "inherit", shell: true });
process.exit(hasil.status ?? 1);
