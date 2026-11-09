// Kamera dunia (spesifikasi JS-07, P-3; Design System 3.2): mengikuti posisi pemain sendiri dengan zona mati
// 24 × 16 piksel logis, dijepit ke tepi peta, dan selalu bulat. Tanpa guncangan dan tanpa zoom.
import { PANDANGAN } from "../../inti/aturan";

/** Setengah zona mati: pemain boleh bergeser 12 piksel mendatar dan 8 piksel tegak dari tengah pandangan. */
export const ZONA_MATI = { x: 12, y: 8 } as const;

export interface Kamera {
  x: number; // pojok kiri atas pandangan, piksel logis
  y: number;
}

function jepit(k: Kamera, lebarPetaPx: number, tinggiPetaPx: number): Kamera {
  const maksX = Math.max(0, lebarPetaPx - PANDANGAN.lebar);
  const maksY = Math.max(0, tinggiPetaPx - PANDANGAN.tinggi);
  return { x: Math.min(maksX, Math.max(0, Math.round(k.x))), y: Math.min(maksY, Math.max(0, Math.round(k.y))) };
}

/** Kamera yang berpusat pada pemain: posisi awal dan sesudah `koreksi`. */
export function kameraPusat(pos: { x: number; y: number }, lebarPetaPx: number, tinggiPetaPx: number): Kamera {
  return jepit({ x: pos.x - PANDANGAN.lebar / 2, y: pos.y - PANDANGAN.tinggi / 2 }, lebarPetaPx, tinggiPetaPx);
}

/** Kamera bergeser hanya bila pemain keluar dari zona mati di tengah pandangan. */
export function ikutiKamera(kamera: Kamera, pos: { x: number; y: number }, lebarPetaPx: number, tinggiPetaPx: number): Kamera {
  let { x, y } = kamera;
  const tengahX = x + PANDANGAN.lebar / 2;
  const tengahY = y + PANDANGAN.tinggi / 2;
  if (pos.x - tengahX > ZONA_MATI.x) x = pos.x - ZONA_MATI.x - PANDANGAN.lebar / 2;
  else if (tengahX - pos.x > ZONA_MATI.x) x = pos.x + ZONA_MATI.x - PANDANGAN.lebar / 2;
  if (pos.y - tengahY > ZONA_MATI.y) y = pos.y - ZONA_MATI.y - PANDANGAN.tinggi / 2;
  else if (tengahY - pos.y > ZONA_MATI.y) y = pos.y + ZONA_MATI.y - PANDANGAN.tinggi / 2;
  return jepit({ x, y }, lebarPetaPx, tinggiPetaPx);
}
