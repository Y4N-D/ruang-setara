// Penggambar satu bingkai dunia (spesifikasi JS-07, P-2, P-4 sampai P-6; Design System 7, lapisan 0–60).
// Semua digambar di kanvas logis 320 × 180, lalu kanvas itu diperbesar sekali ke kanvas layar tanpa penghalusan.
import { PANDANGAN } from "../../inti/aturan";
import type { Masa } from "../../inti/tipe";
import type { Strip } from "./aset";
import { beririsan, UKURAN_POTONGAN, type PengelolaPotongan } from "./potongan";

/** Titik kaki di dalam bingkai tokoh 16 × 24 (manifest TOKOH). */
export const KAKI = { x: 8, y: 21 } as const;
const UBIN = 16;

export interface TokohGambar {
  id: string;
  x: number; // titik kaki, piksel logis
  y: number;
  strip: Strip;
  bingkai: number;
}

export interface GerbangGambar {
  x: number; // ubin, pojok kiri atas jejak kaki objek gerbang-lobi
  y: number;
  bawah: CanvasImageSource & { width: number; height: number };
  atas: (CanvasImageSource & { width: number; height: number }) | null;
}

export interface DiriGambar {
  x: number;
  y: number;
  siluet: Strip | null;
  bingkai: number;
}

/** Bingkai animasi tokoh dari jam lokal (P-5): diam 2 bingkai 2 fps, jalan 4 bingkai 8 fps; kurangi gerak: bingkai 0. */
export function bingkaiTokoh(jalan: boolean, jamMs: number, kurangiGerak: boolean): number {
  if (kurangiGerak) return 0;
  return jalan ? Math.floor(jamMs / 125) % 4 : Math.floor(jamMs / 500) % 2;
}

/** Urutan tokoh: menurut y kaki, lalu id (P-4). */
export function urutTokoh<T extends { id: string; y: number }>(daftar: readonly T[]): T[] {
  return daftar.slice().sort((a, b) => a.y - b.y || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Kotak gambar tokoh dalam piksel logis, dengan posisi dibulatkan ke piksel logis. */
export function kotakTokoh(x: number, y: number): { x: number; y: number; w: number; h: number } {
  return { x: Math.round(x) - KAKI.x, y: Math.round(y) - KAKI.y, w: 16, h: 24 };
}

/**
 * Satu bingkai, berurutan (P-4): (1) lapis bawah potongan; (2) bagian bawah gerbang lobi; (3) tokoh menurut y kaki
 * lalu id; (4) lapis atas potongan; (5) bagian atas gerbang; (6) garis siluet pemain sendiri bila kotaknya beririsan
 * dengan bagian atas objek mana pun, termasuk gerbang (P-6). Mengembalikan apakah siluet digambar.
 */
export function gambarBingkai(
  ctx: CanvasRenderingContext2D,
  kamera: { x: number; y: number },
  potongan: PengelolaPotongan,
  masa: Masa,
  gerbang: GerbangGambar | null,
  tokoh: readonly TokohGambar[],
  diri: DiriGambar | null,
): boolean {
  ctx.imageSmoothingEnabled = false;
  const lihat = potongan.terlihat(kamera);
  const lapis = lihat.map(([cx, cy]) => ({ cx, cy, ...potongan.lapis(cx, cy, masa) }));
  for (const l of lapis) ctx.drawImage(l.bawah as CanvasImageSource, l.cx * UKURAN_POTONGAN - kamera.x, l.cy * UKURAN_POTONGAN - kamera.y);
  const tinggiAtasGerbang = gerbang?.atas ? gerbang.atas.height : 0;
  if (gerbang) ctx.drawImage(gerbang.bawah, gerbang.x * UBIN - 1 - kamera.x, gerbang.y * UBIN - 1 + tinggiAtasGerbang - kamera.y);
  const pandangan = { x: kamera.x, y: kamera.y, w: PANDANGAN.lebar, h: PANDANGAN.tinggi };
  for (const t of urutTokoh(tokoh)) {
    const k = kotakTokoh(t.x, t.y);
    if (!beririsan(k, pandangan)) continue;
    const b = Math.min(t.strip.bingkai - 1, Math.max(0, t.bingkai));
    ctx.drawImage(t.strip.gambar, b * t.strip.lebar, 0, t.strip.lebar, t.strip.tinggi, k.x - kamera.x, k.y - kamera.y, t.strip.lebar, t.strip.tinggi);
  }
  for (const l of lapis) if (l.atas) ctx.drawImage(l.atas as CanvasImageSource, l.cx * UKURAN_POTONGAN - kamera.x, l.cy * UKURAN_POTONGAN - kamera.y);
  if (gerbang?.atas) ctx.drawImage(gerbang.atas, gerbang.x * UBIN - 1 - kamera.x, gerbang.y * UBIN - 1 - kamera.y);
  if (!diri?.siluet) return false;
  const kd = kotakTokoh(diri.x, diri.y);
  const atasGerbang = gerbang?.atas ? { x: gerbang.x * UBIN - 1, y: gerbang.y * UBIN - 1, w: gerbang.atas.width, h: gerbang.atas.height } : null;
  const tertutup = potongan.atasBeririsan(kd) || (atasGerbang !== null && beririsan(kd, atasGerbang));
  if (!tertutup) return false;
  const s = diri.siluet;
  const b = Math.min(s.bingkai - 1, Math.max(0, diri.bingkai));
  const tepi = (s.lebar - 16) / 2;
  ctx.drawImage(s.gambar, b * s.lebar, 0, s.lebar, s.tinggi, kd.x - tepi - kamera.x, kd.y - tepi - kamera.y, s.lebar, s.tinggi);
  return true;
}

/** Kanvas logis diperbesar sekali ke kanvas layar berukuran 320k × 180k piksel perangkat (P-2). */
export function perbesar(ctxLayar: CanvasRenderingContext2D, logis: CanvasImageSource, k: number): void {
  ctxLayar.imageSmoothingEnabled = false;
  ctxLayar.drawImage(logis, 0, 0, PANDANGAN.lebar * k, PANDANGAN.tinggi * k);
}
