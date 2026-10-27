// Pramuat gambar adegan berikutnya (Architecture bagian 8; spesifikasi F-04). Sejak F-08 juga ikon kuis peran.
import { emoteIcons, roleIcons, sceneAssets } from "../assets/manifest";
import type { Scene } from "../engine/types";

const requested = new Set<string>();

/** Ikon kuis peran (spesifikasi F-08): keempat ikon peran serta ikon hati dan tanda tanya pita umpan balik. */
function quizIcons(scene: Scene): string[] {
  return scene.roleQuiz ? [...Object.values(roleIcons), emoteIcons.hati, emoteIcons.tanya] : [];
}

/**
 * Memuat dan men-decode gambar panggung satu adegan di latar belakang, ditambah ikon kuis bila adegan itu punya
 * roleQuiz; setiap URL sekali per halaman.
 */
export function preloadScene(scene: Scene): void {
  const sources = [...sceneAssets(scene).map(({ src }) => src), ...quizIcons(scene)];
  for (const src of sources) {
    if (!src || requested.has(src)) continue;
    requested.add(src);
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    // Kegagalan decode diabaikan: gambar tetap dimuat biasa saat adegan itu tampil.
    img.decode().catch(() => undefined);
  }
}
