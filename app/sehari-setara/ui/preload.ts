// Pramuat gambar adegan berikutnya (Architecture bagian 8; spesifikasi F-04). Sejak F-08 juga ikon kuis peran, dan sejak
// F-09 ketiga ilustrasi akhir serta strip timbangan.
import { emoteIcons, endings, iconStrips, roleIcons, sceneAssets } from "../assets/manifest";
import type { Scene } from "../engine/types";

const requested = new Set<string>();

/** Memuat dan men-decode setiap URL sekali per halaman; kegagalan diabaikan, gambar tetap dimuat biasa saat tampil. */
function preload(sources: readonly (string | undefined)[]): void {
  for (const src of sources) {
    if (!src || requested.has(src)) continue;
    requested.add(src);
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img.decode().catch(() => undefined);
  }
}

/** Ikon kuis peran (spesifikasi F-08): keempat ikon peran serta ikon hati dan tanda tanya pita umpan balik. */
function quizIcons(scene: Scene): string[] {
  return scene.roleQuiz ? [...Object.values(roleIcons), emoteIcons.hati, emoteIcons.tanya] : [];
}

/**
 * Memuat dan men-decode gambar panggung satu adegan di latar belakang, ditambah ikon kuis bila adegan itu punya
 * roleQuiz; setiap URL sekali per halaman.
 */
export function preloadScene(scene: Scene): void {
  preload([...sceneAssets(scene).map(({ src }) => src), ...quizIcons(scene)]);
}

/** Ketiga ilustrasi akhir dan strip timbangan (spesifikasi F-09); dipanggil saat adegan 6 dimulai. */
export function preloadEnding(): void {
  preload([...Object.values(endings), iconStrips.timbangan.src]);
}
