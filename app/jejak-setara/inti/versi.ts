// Versi protokol bersama klien dan server (Architecture JA-07), dipisah agar halaman yang hanya butuh
// angka ini (konsol, penanda server) tidak ikut membawa zod dan skema protokol (JS-03).
// Versi 2 sejak JS-08 (P-64): `kejadian_terlihat` membawa `setTokoh`, dan butir `dunia` membawa unsur keenam `dialog`.
export const PROTOKOL_VERSI = 2;
