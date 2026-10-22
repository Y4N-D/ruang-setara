// Pramuat gambar adegan berikutnya (Architecture bagian 8; spesifikasi F-04).
import { sceneAssets } from "../assets/manifest";
import type { Scene } from "../engine/types";

const requested = new Set<string>();

/** Memuat dan men-decode gambar panggung satu adegan di latar belakang; setiap URL sekali per halaman. */
export function preloadScene(scene: Scene): void {
  for (const { src } of sceneAssets(scene)) {
    if (!src || requested.has(src)) continue;
    requested.add(src);
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    // Kegagalan decode diabaikan: gambar tetap dimuat biasa saat adegan itu tampil.
    img.decode().catch(() => undefined);
  }
}
