// Rute hash konsol dan pengalihannya (spesifikasi JS-04, P-37; JS-10, P-1). Murni: tanpa DOM, sehingga diuji di Node.
// Sejak JS-10: `#/ruang` (daftar), `#/ruang/{id}` (detail), dan `#/kelas/{id}` (layar kelas, tanpa kerangka konsol).
import type { Peran } from "../inti/akun";
import { idRuangSah } from "../inti/ruang";

export const RUTE = ["masuk", "sandi", "dasbor", "ruang", "akun", "kelas"] as const;
export type Rute = (typeof RUTE)[number];

/** Rute beserta id ruang (detail ruang dan layar kelas); id null untuk rute lain. */
export interface Tujuan {
  rute: Rute;
  id: string | null;
}

/** Keadaan masuk yang menentukan rute (dari GET /api/saya). */
export type KeadaanMasuk = { masuk: false } | { masuk: true; peran: Peran; wajibGantiSandi: boolean };

/** `#/dasbor` → dasbor; `#/ruang/{uuid}` → detail ruang; `#/kelas/{uuid}` → layar kelas. Bentuk lain → null. */
export function bacaRute(hash: string): Tujuan | null {
  const cocok = /^#\/([a-z]+)(?:\/([0-9a-f-]{36}))?$/.exec(hash);
  if (!cocok || !(RUTE as readonly string[]).includes(cocok[1])) return null;
  const rute = cocok[1] as Rute;
  const id = cocok[2] ?? null;
  if (id !== null && (!idRuangSah(id) || (rute !== "ruang" && rute !== "kelas"))) return null;
  if (rute === "kelas" && id === null) return null;
  return { rute, id };
}

export function keHash(rute: Rute, id: string | null = null): string {
  return id === null ? `#/${rute}` : `#/${rute}/${id}`;
}

/**
 * Rute yang ditampilkan (P-37). Belum masuk: masuk. Wajib ganti sandi: sandi (mode wajib), apa pun rutenya.
 * Sudah masuk: rute yang diminta; rute kosong, `#/masuk`, atau yang tidak dikenal (termasuk rute fitur yang belum ada)
 * menjadi dasbor. Guru yang membuka `#/akun` tetap di akun dan melihat "Halaman ini hanya untuk admin."
 */
export function tujuan(hash: string, keadaan: KeadaanMasuk): Tujuan {
  if (!keadaan.masuk) return { rute: "masuk", id: null };
  if (keadaan.wajibGantiSandi) return { rute: "sandi", id: null };
  const t = bacaRute(hash);
  return t === null || t.rute === "masuk" ? { rute: "dasbor", id: null } : t;
}

/** Menu konsol per peran (JS-04 P-38; JS-10 P-1): Akun hanya untuk admin; Ruang untuk keduanya. */
export function menuUntuk(peran: Peran): Exclude<Rute, "masuk" | "kelas">[] {
  return peran === "admin" ? ["dasbor", "ruang", "akun", "sandi"] : ["dasbor", "ruang", "sandi"];
}
