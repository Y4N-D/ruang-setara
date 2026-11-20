// Aturan murni layar rekap pribadi (spesifikasi JS-11, P-5 dan P-8; D-2 a). Dipakai App.tsx dan uji.
import type { PesanServerPemain } from "../inti/protokol";
import { KODE_LAYANAN_BERHENTI, KODE_PUTUS_LAMA } from "./jaringan";

export type ButirRekap = Extract<PesanServerPemain, { t: "selesai" }>["rekap"][number];

/** Penyebab sambungan berakhir saat layar rekap tampil. */
export type PenyebabBerakhir = "ditutup" | "tidak_ada" | "putus" | "layanan" | "versi" | "dikeluarkan";

/** Rekap yang tetap tampil sesudah sambungan berakhir: jenis pita dan tombol di akhir rekap (P-8). */
export interface AkhirRekap {
  pita: "ditutup" | "berhenti";
  tombol: "kembali" | "cobaLagi" | "muatUlang";
}

/**
 * P-8: tombolnya sama dengan tombol layar yang digantikan (Ruang ditutup: Kembali; layar berhenti JS-22: Coba lagi;
 * versi berbeda: Muat ulang). Pemain yang dikeluarkan tetap ke layar galat (null).
 */
export function akhirRekap(p: PenyebabBerakhir): AkhirRekap | null {
  if (p === "dikeluarkan") return null;
  if (p === "ditutup" || p === "tidak_ada") return { pita: "ditutup", tombol: "kembali" };
  return { pita: "berhenti", tombol: p === "versi" ? "muatUlang" : "cobaLagi" };
}

const PENYEBAB: Readonly<Record<number, PenyebabBerakhir>> = {
  4000: "ditutup",
  [KODE_LAYANAN_BERHENTI]: "layanan",
  [KODE_PUTUS_LAMA]: "putus",
  4004: "dikeluarkan",
  4005: "versi",
};

/** Penyebab dari kode tutup klien (JS-03, JS-22); null bila kode tidak mengakhiri sambungan secara tetap. */
export function penyebabDariKode(kode: number | null): PenyebabBerakhir | null {
  return (kode !== null && PENYEBAB[kode]) || null;
}

/**
 * P-5: skor lebih dari 0 menampilkan skor dan peringkat; skor 0 dengan rekap berisi hanya skor; rekap kosong
 * menampilkan teks tanpa skor. Selama `selesai` belum tiba (rekap null), hanya skor lebih dari 0 yang tampil.
 */
export function tampilanSkor(akhir: { skor: number } | null, rekap: readonly ButirRekap[] | null): "lengkap" | "skorSaja" | "kosong" | "menunggu" {
  if (akhir && akhir.skor > 0) return "lengkap";
  if (rekap === null) return "menunggu";
  return rekap.length > 0 && akhir ? "skorSaja" : "kosong";
}
