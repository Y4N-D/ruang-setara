// Versi protokol bersama klien dan server (Architecture JA-07), dipisah agar halaman yang hanya butuh
// angka ini (konsol, penanda server) tidak ikut membawa zod dan skema protokol (JS-03).
// Versi 2 sejak JS-08 (P-64): `kejadian_terlihat` membawa `setTokoh`, dan butir `dunia` membawa unsur keenam `dialog`.
// Versi 3 sejak JS-14 (P-58): mode nama ruang, `nama_baru`, `mode_nama`, `NAMA_DITOLAK`, dan ganti nama dari layar kelas.
// Versi 4 sejak JS-15 (P-30): `ping` membawa `rttMs` pilihan, waktu pulang-pergi terakhir yang diukur HP.
// Versi 5 sejak JS-16b (P-16): `halo` membawa `kodeMasukUlang` pilihan dan galat `KODE_MASUK_ULANG_SALAH`.
// Versi 6 sejak JS-18 (P-40): `pakai_skill` membawa `halteId` pilihan untuk Angkot.
export const PROTOKOL_VERSI = 6;
