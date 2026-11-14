// Rute hash konsol dan pengalihannya (spesifikasi JS-04, P-37). Murni: tanpa DOM, sehingga diuji di Node.
import type { Peran } from "../inti/akun";

export const RUTE = ["masuk", "sandi", "dasbor", "akun"] as const;
export type Rute = (typeof RUTE)[number];

/** Keadaan masuk yang menentukan rute (dari GET /api/saya). */
export type KeadaanMasuk = { masuk: false } | { masuk: true; peran: Peran; wajibGantiSandi: boolean };

/** `#/dasbor` → "dasbor". Hash kosong, rute yang tidak dikenal, atau bentuk lain → null. */
export function bacaRute(hash: string): Rute | null {
  const cocok = /^#\/([a-z]+)$/.exec(hash);
  if (!cocok) return null;
  return (RUTE as readonly string[]).includes(cocok[1]) ? (cocok[1] as Rute) : null;
}

export function keHash(rute: Rute): string {
  return `#/${rute}`;
}

/**
 * Rute yang ditampilkan (P-37). Belum masuk: masuk. Wajib ganti sandi: sandi (mode wajib), apa pun rutenya.
 * Sudah masuk: rute yang diminta; rute kosong, `#/masuk`, atau yang tidak dikenal (termasuk rute fitur yang belum ada)
 * menjadi dasbor. Guru yang membuka `#/akun` tetap di akun dan melihat "Halaman ini hanya untuk admin."
 */
export function tujuan(hash: string, keadaan: KeadaanMasuk): Rute {
  if (!keadaan.masuk) return "masuk";
  if (keadaan.wajibGantiSandi) return "sandi";
  const rute = bacaRute(hash);
  return rute === null || rute === "masuk" ? "dasbor" : rute;
}

/** Menu konsol per peran (P-38): Akun hanya untuk admin. */
export function menuUntuk(peran: Peran): Exclude<Rute, "masuk">[] {
  return peran === "admin" ? ["dasbor", "akun", "sandi"] : ["dasbor", "sandi"];
}
