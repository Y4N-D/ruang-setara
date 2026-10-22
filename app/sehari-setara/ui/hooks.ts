// Kait React bersama untuk layar game Sehari Setara.
// Dipindahkan dari StagePreview.tsx di F-05 tanpa perubahan perilaku, agar dipakai Game.tsx dan layar permainan.
import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { stageScaleForScreen } from "./layout";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Benar bila sistem meminta gerak dikurangi; ikut berubah saat pengaturan sistem berubah. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia(REDUCED_MOTION).matches);
  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION);
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** k dihitung dari tinggi layar 16:9 dan dihitung ulang setiap kali ukurannya berubah. */
export function useStageScale(ref: RefObject<HTMLElement | null>): number {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setScale(stageScaleForScreen(element.getBoundingClientRect().height));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return scale;
}
