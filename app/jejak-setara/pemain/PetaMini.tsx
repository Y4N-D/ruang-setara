// Peta mini (spesifikasi JS-07, P-35 sampai P-37; DRAF D-4 pilihan a; Design System 3.3 dan 10): 112 × 75 px di
// kanan atas, peta 0,7 px per ubin dengan delapan zona berwarna dominan, garis batas ink, halte, dan panah diri.
// Peta mini adalah tombol untuk membuka peta besar. Lapisan penanda kejadian diisi di JS-08 (P-36).
import type { RefObject } from "react";
import type { Arah, ZonaId } from "../inti/tipe";
import { TEKS } from "../teks";
import { HALTE, UKURAN_PETA, ZONA } from "./dunia/petaKampung";

/** Warna dominan zona dari palet (D-4a; Design System 7): coral, sky-d, slate, mango, wood, leaf, teal, berry. */
export const WARNA_ZONA: Readonly<Record<ZonaId, string>> = {
  z1: "#FF6B5B",
  z2: "#3A86D9",
  z3: "#6B7A99",
  z4: "#FF9F1C",
  z5: "#C98B4F",
  z6: "#8AD95B",
  z7: "#2EC4B6",
  z8: "#9B5DE5",
};
const TINTA = "#1F2A44";

export const PETA_MINI = { lebar: 112, tinggi: 75, pxPerUbin: 0.7 } as const;
/** Urutan bingkai tanda_diri: bawah, atas, kanan, kiri (manifest TANDA). */
const BINGKAI_DIRI: Record<Arah, number> = { bawah: 0, atas: 1, kanan: 2, kiri: 3 };

export interface GambarPeta {
  tandaDiri: CanvasImageSource | null;
  halte: CanvasImageSource | null;
}

/** Zona berwarna dan garis batasnya, di kanvas dengan `s` piksel perangkat per ubin dan geser tegak `dy`. */
export function gambarZona(ctx: CanvasRenderingContext2D, s: number, dy: number, garis: number): void {
  for (const z of ZONA) {
    const x0 = Math.round(z.kiri * s);
    const y0 = Math.round(z.atas * s) + dy;
    const x1 = Math.round((z.kanan + 1) * s);
    const y1 = Math.round((z.bawah + 1) * s) + dy;
    ctx.fillStyle = WARNA_ZONA[z.id];
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  ctx.fillStyle = TINTA;
  for (const z of ZONA) {
    const x0 = Math.round(z.kiri * s);
    const y0 = Math.round(z.atas * s) + dy;
    const x1 = Math.round((z.kanan + 1) * s);
    const y1 = Math.round((z.bawah + 1) * s) + dy;
    ctx.fillRect(x0, y0, x1 - x0, garis);
    ctx.fillRect(x0, y1 - garis, x1 - x0, garis);
    ctx.fillRect(x0, y0, garis, y1 - y0);
    ctx.fillRect(x1 - garis, y0, garis, y1 - y0);
  }
}

/**
 * Menggambar peta mini lengkap ke kanvas berukuran 112r × 75r piksel perangkat: zona, halte, lalu panah diri.
 * Ikon 7 × 7 digambar dengan skala bulat agar tetap tajam.
 */
export function gambarPetaMini(ctx: CanvasRenderingContext2D, rasio: number, gambar: GambarPeta, diri: { x: number; y: number; arah: Arah } | null): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = TINTA;
  ctx.fillRect(0, 0, w, h);
  const s = PETA_MINI.pxPerUbin * rasio;
  const dy = Math.round(((PETA_MINI.tinggi - UKURAN_PETA.tinggi * PETA_MINI.pxPerUbin) / 2) * rasio);
  gambarZona(ctx, s, dy, Math.max(1, Math.round(rasio)));
  const ikon = Math.max(1, Math.round(rasio)) * 7;
  if (gambar.halte) {
    for (const t of HALTE) {
      ctx.drawImage(gambar.halte, Math.round((t.x + 0.5) * s - ikon / 2), Math.round((t.y + 0.5) * s + dy - ikon / 2), ikon, ikon);
    }
  }
  if (diri && gambar.tandaDiri) {
    const ux = diri.x / 16;
    const uy = diri.y / 16;
    ctx.drawImage(gambar.tandaDiri, BINGKAI_DIRI[diri.arah] * 7, 0, 7, 7, Math.round(ux * s - ikon / 2), Math.round(uy * s + dy - ikon / 2), ikon, ikon);
  }
}

export default function PetaMini({ kanvasRef, rasio, saatBuka }: { kanvasRef: RefObject<HTMLCanvasElement | null>; rasio: number; saatBuka: () => void }) {
  return (
    <button type="button" className="js-peta-mini" aria-label={TEKS.peta.bukaBesar} onClick={saatBuka}>
      <canvas
        ref={kanvasRef}
        width={Math.round(PETA_MINI.lebar * rasio)}
        height={Math.round(PETA_MINI.tinggi * rasio)}
        style={{ width: PETA_MINI.lebar, height: PETA_MINI.tinggi }}
        aria-hidden="true"
      />
    </button>
  );
}
