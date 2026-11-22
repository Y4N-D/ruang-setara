// Versi protokol bersama klien dan server (Architecture JA-07), dipisah agar halaman yang hanya butuh
// angka ini (konsol, penanda server) tidak ikut membawa zod dan skema protokol (JS-03).
// Versi 2 sejak JS-08 (P-64): `kejadian_terlihat` membawa `setTokoh`, dan butir `dunia` membawa unsur keenam `dialog`.
// Versi 3 sejak JS-14 (P-58): mode nama ruang, `nama_baru`, `mode_nama`, `NAMA_DITOLAK`, dan ganti nama dari layar kelas.
export const PROTOKOL_VERSI = 3;
