// Tata letak panggung Sehari Setara (spesifikasi F-04 dan F-05; alamat uji tim F-07). Semua fungsi murni dan diuji di layout.test.ts.
// Satuan: piksel logis panggung (320×180), kecuali disebut lain.
import type { SpriteStrip } from "../assets/manifest";
import type { CastSlot, ChoiceId, Scene } from "../engine/types";

/** Panggung logis dan garis lantai (Design System bagian 3). */
export const STAGE = { w: 320, h: 180, floorTop: 157, shadowY: 155 } as const;

/**
 * Tinggi baris layar dalam satuan u, dan ruang minimum panel samping.
 * F-05 (keputusan Gerbang 1 nomor 2): panel bawah 40u dan area panggung 52u, agar pertanyaan dan tiga pilihan muat.
 */
export const LAYOUT = { screenU: 1600 / 9, barU: 8, stageU: 52, bottomU: 40, sideU: 30 } as const;

/** Architecture bagian 7: skala bulat bila sisa ruang di bawah 25 %, selain itu pecahan. */
export function stageScale(availW: number, availH: number): number {
  const fit = Math.min(availW / STAGE.w, availH / STAGE.h);
  const whole = Math.floor(fit);
  return whole >= 1 && whole / fit >= 0.75 ? whole : fit;
}

/** Skala panggung dari tinggi layar 16:9 dalam piksel (1u = tinggi / 100). */
export function stageScaleForScreen(screenHeightPx: number): number {
  const u = screenHeightPx / 100;
  return stageScale((LAYOUT.screenU - 2 * LAYOUT.sideU) * u, LAYOUT.stageU * u);
}

/**
 * Satu piksel antarmuka untuk bingkai piksel (spesifikasi F-05): skala panggung dibulatkan ke piksel layar utuh,
 * paling kecil 1. Garis bingkai 2 piksel antarmuka, sudut terpotong dan sorotan 1 piksel antarmuka.
 */
export function uiPixel(k: number): number {
  return Math.max(1, Math.round(k));
}

/** Kotak sprite: titik tengah di x, baris terbawah di garis lantai (sama dengan place() di kit gambar). */
export function spriteBox(slot: CastSlot, strip: SpriteStrip) {
  return {
    left: slot.x - Math.floor(strip.w / 2),
    top: STAGE.floorTop - strip.h,
    w: strip.w,
    h: strip.h,
    mirrored: slot.facing === "left",
  };
}

/** Bayangan kaki selebar w − 6 dan setinggi 2 piksel, sama dengan pratinjau adegan yang disetujui. */
export function shadowBox(slot: CastSlot, strip: SpriteStrip) {
  const width = strip.w - 6;
  return { left: slot.x - Math.floor(width / 2), top: STAGE.shadowY, width, height: 2 };
}

/** Ikon emosi 8×8, dua piksel di atas titik kepala strip (dicerminkan bila tokoh menghadap kiri). */
export function emoteBox(slot: CastSlot, strip: SpriteStrip) {
  const box = spriteBox(slot, strip);
  const center = box.left + (box.mirrored ? strip.w - strip.head.x : strip.head.x);
  return { left: Math.round(center - 4), top: box.top + strip.head.y - 10 };
}

/* ------------------------------------------------------------------ */
/* Busur hari: gambar logis 136×22 yang diskalakan dengan k panggung      */
/* ------------------------------------------------------------------ */

export const ARC = {
  w: 136,
  h: 22,
  points: [
    { x: 8, y: 14 },
    { x: 32, y: 11 },
    { x: 56, y: 10 },
    { x: 80, y: 10 },
    { x: 104, y: 11 },
    { x: 128, y: 14 },
  ],
} as const;

export type ArcState = "lewat" | "berjalan" | "berikutnya";

export function arcPointStates(current: number): ArcState[] {
  return ARC.points.map((_, i) => (i < current ? "lewat" : i === current ? "berjalan" : "berikutnya"));
}

/** Kotak 6×6 tempat titik ke-i digambar: x − 3 … x + 2, y − 3 … y + 2. */
export function arcDotOrigin(i: number) {
  const point = ARC.points[i];
  return { x: point.x - 3, y: point.y - 3 };
}

/** Piksel garis Bresenham antartitik, tanpa piksel yang jatuh di dalam kotak titik. */
export function arcTrackPixels(): Array<[number, number]> {
  const inDot = (x: number, y: number) => ARC.points.some((p) => x >= p.x - 3 && x <= p.x + 2 && y >= p.y - 3 && y <= p.y + 2);
  const seen = new Set<string>();
  const pixels: Array<[number, number]> = [];
  for (let i = 0; i + 1 < ARC.points.length; i++) {
    let { x, y } = ARC.points[i];
    const { x: x1, y: y1 } = ARC.points[i + 1];
    const dx = Math.abs(x1 - x);
    const dy = -Math.abs(y1 - y);
    const sx = x < x1 ? 1 : -1;
    const sy = y < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      const key = `${x},${y}`;
      if (!inDot(x, y) && !seen.has(key)) {
        seen.add(key);
        pixels.push([x, y]);
      }
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }
  return pixels;
}

/* ------------------------------------------------------------------ */
/* Rute pratinjau panggung: #adegan-N dan #adegan-N-a|b|c               */
/* ------------------------------------------------------------------ */

export interface PreviewRoute {
  readonly sceneIndex: number;
  readonly view: "situasi" | ChoiceId;
}

const PREVIEW_HASH = /^#adegan-([1-9][0-9]*)(?:-([abc]))?$/;

export function parsePreviewHash(hash: string, sceneCount: number): PreviewRoute | null {
  const match = PREVIEW_HASH.exec(hash);
  if (!match) return null;
  const n = Number(match[1]);
  if (n > sceneCount) return null;
  const view = match[2] ? (match[2].toUpperCase() as ChoiceId) : "situasi";
  return { sceneIndex: n - 1, view };
}

export function previewHash(route: PreviewRoute): string {
  const suffix = route.view === "situasi" ? "" : `-${route.view.toLowerCase()}`;
  return `#adegan-${route.sceneIndex + 1}${suffix}`;
}

/* ------------------------------------------------------------------ */
/* Layar menurut tanda pagar (spesifikasi F-05)                          */
/* ------------------------------------------------------------------ */

/** Alamat layar permainan sementara, sampai layar judul dibuat di F-10. */
export const PLAY_HASH = "#main";

/** Jumlah tim di layar permainan sementara: dua tim bawaan, atau tiga dan empat lewat alamat uji (F-07). */
export type TeamCount = 2 | 3 | 4;

/** #main memakai dua tim bawaan; #main-3 dan #main-4 alamat uji tiga dan empat tim, tidak ditautkan (F-07). */
const PLAY_HASHES: Readonly<Record<string, TeamCount>> = { [PLAY_HASH]: 2, "#main-3": 3, "#main-4": 4 };

export type ScreenRoute =
  | { readonly kind: "main"; readonly teams: TeamCount }
  | { readonly kind: "pratinjau"; readonly preview: PreviewRoute };

/** #main, #main-3, dan #main-4 untuk layar permainan, #adegan-N[-a|b|c] untuk pratinjau panggung, selain itu null. */
export function parseRoute(hash: string, sceneCount: number): ScreenRoute | null {
  if (Object.prototype.hasOwnProperty.call(PLAY_HASHES, hash)) return { kind: "main", teams: PLAY_HASHES[hash] };
  const preview = parsePreviewHash(hash, sceneCount);
  return preview ? { kind: "pratinjau", preview } : null;
}

/** Pemeran dan ikon emosi yang tampil di panggung untuk satu tampilan pratinjau. */
export function routeCast(scene: Scene, view: PreviewRoute["view"]) {
  if (view === "situasi") return { cast: scene.cast, emote: undefined };
  const choice = scene.choices.find((c) => c.id === view);
  return { cast: choice?.reaction ?? scene.cast, emote: choice?.emote };
}
