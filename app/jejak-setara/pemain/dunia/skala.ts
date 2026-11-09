// Skala bulat dan ukuran kanvas dunia (spesifikasi JS-07, P-1; Design System 3.2).
import { PANDANGAN } from "../../inti/aturan";

/** Pandangan boleh terpotong paling banyak 2 piksel logis di setiap sisi (pandangan sedikitnya 316 × 176). */
export const POTONG_MAKS = 2;

export interface UkuranDunia {
  /** Skala bulat: satu piksel logis = k piksel perangkat. */
  k: number;
  /** Ukuran backing store kanvas dunia dalam piksel perangkat: 320k × 180k. */
  lebarPerangkat: number;
  tinggiPerangkat: number;
  /** Ukuran dan letak kanvas dalam px CSS; kiri dan atas bisa negatif bila kanvas sedikit terpotong. */
  lebarCss: number;
  tinggiCss: number;
  kiriCss: number;
  atasCss: number;
}

/**
 * Skala k adalah bilangan bulat terbesar dengan 316k ≤ W·r dan 176k ≤ H·r, paling kecil 1 (P-1). Kanvas
 * 320k × 180k piksel perangkat diletakkan di tengah; letaknya dibulatkan ke piksel perangkat agar tetap tajam.
 */
export function hitungSkala(lebarLayar: number, tinggiLayar: number, rasio: number): UkuranDunia {
  const r = Number.isFinite(rasio) && rasio > 0 ? rasio : 1;
  const wp = Math.max(0, lebarLayar) * r;
  const hp = Math.max(0, tinggiLayar) * r;
  const minLebar = PANDANGAN.lebar - 2 * POTONG_MAKS;
  const minTinggi = PANDANGAN.tinggi - 2 * POTONG_MAKS;
  const k = Math.max(1, Math.floor(Math.min(wp / minLebar, hp / minTinggi) + 1e-9));
  const lebarPerangkat = PANDANGAN.lebar * k;
  const tinggiPerangkat = PANDANGAN.tinggi * k;
  return {
    k,
    lebarPerangkat,
    tinggiPerangkat,
    lebarCss: lebarPerangkat / r,
    tinggiCss: tinggiPerangkat / r,
    kiriCss: Math.round((wp - lebarPerangkat) / 2) / r,
    atasCss: Math.round((hp - tinggiPerangkat) / 2) / r,
  };
}
