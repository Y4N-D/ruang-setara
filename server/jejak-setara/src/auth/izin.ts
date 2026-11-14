// Tabel izin dan penjaga rute (spesifikasi JS-04, P-17, P-20, P-21; PRD 11.1; Architecture 10.4). Fitur berikutnya
// menambah barisnya sendiri ke IZIN. Tanda Peninjau belum memberi aksi apa pun; ia dipakai `rujukan.verifikasi` (JS-12).
import type { KodeGalatAkun, Peran } from "../../../../app/jejak-setara/inti/akun";

export const IZIN = {
  "dasbor.lihat": ["admin", "guru"],
  "sandi.sendiri": ["admin", "guru"],
  "akun.kelola": ["admin"],
} as const satisfies Record<string, readonly Peran[]>;

export type Aksi = keyof typeof IZIN;

/** Bagian akun yang dibaca penjaga. */
export interface PemegangIzin {
  peran: Peran;
  aktif: boolean;
  wajibGantiSandi: boolean;
}

export type KodePenjaga = Extract<KodeGalatAkun, "PERLU_MASUK" | "WAJIB_GANTI_SANDI" | "TIDAK_BERWENANG">;
export type HasilIzin = { ok: true } | { ok: false; kode: KodePenjaga };

/** Peran tercantum di tabel untuk aksi itu. */
export function peranBoleh(peran: Peran, aksi: Aksi): boolean {
  return (IZIN[aksi] as readonly Peran[]).includes(peran);
}

/**
 * Penjaga yang dipanggil setiap rute (P-20, P-21). Tanpa akun atau akun nonaktif: `PERLU_MASUK`. Selama sandi
 * sementara belum diganti, hanya `sandi.sendiri` yang boleh (P-17): `WAJIB_GANTI_SANDI`. Peran tanpa izin:
 * `TIDAK_BERWENANG`.
 */
export function boleh(akun: PemegangIzin | null, aksi: Aksi): HasilIzin {
  if (!akun || !akun.aktif) return { ok: false, kode: "PERLU_MASUK" };
  if (akun.wajibGantiSandi && aksi !== "sandi.sendiri") return { ok: false, kode: "WAJIB_GANTI_SANDI" };
  return peranBoleh(akun.peran, aksi) ? { ok: true } : { ok: false, kode: "TIDAK_BERWENANG" };
}

/** Status HTTP jawaban penjaga (P-21). */
export const STATUS_PENJAGA: Record<KodePenjaga, number> = { PERLU_MASUK: 401, WAJIB_GANTI_SANDI: 403, TIDAK_BERWENANG: 403 };
