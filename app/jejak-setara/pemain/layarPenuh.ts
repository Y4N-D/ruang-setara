// Layar penuh di layar pemain (spesifikasi JS-07 P-43; JS-24 P-1, P-4, dan P-6): satu cara masuk untuk tombol panel lobi,
// ikon di HUD, dan tombol di panel Menu. Dipindah dari PanelLobi.tsx tanpa perubahan perilaku; `saatMasuk` ditambahkan
// untuk panel Menu, yang menutup diri begitu layar penuh dimulai (P-4, DRAF D-3 pilihan a).
import { useEffect, useState } from "react";

/** Layar penuh bisa dimasuki: peramban mendukung dan belum layar penuh (P-1). */
export function bisaLayarPenuh(): boolean {
  return Boolean(document.fullscreenEnabled) && !document.fullscreenElement;
}

/**
 * Layar penuh lalu kunci orientasi mendatar bila didukung (P-43 JS-07). Penolakan peramban dan kegagalan mengunci
 * diabaikan tanpa pesan dan tanpa galat konsol. `saatMasuk` dipanggil begitu layar penuh dimulai, sebelum orientasi
 * dikunci. Mengembalikan true bila layar penuh dimulai.
 */
export async function masukLayarPenuh(saatMasuk?: () => void): Promise<boolean> {
  try {
    await document.documentElement.requestFullscreen();
  } catch {
    return false; // Peramban menolak layar penuh: tidak ada pesan.
  }
  saatMasuk?.();
  try {
    const orientasi = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    await orientasi.lock?.("landscape").catch(() => undefined);
  } catch {
    // Orientasi tidak bisa dikunci: tidak ada pesan.
  }
  return true;
}

/** Tombol layar penuh tampil selama nilai ini benar; dihitung ulang setiap `fullscreenchange` (P-1, P-6). */
export function useBisaLayarPenuh(): boolean {
  const [bisa, setBisa] = useState(bisaLayarPenuh);
  useEffect(() => {
    const ubah = () => setBisa(bisaLayarPenuh());
    document.addEventListener("fullscreenchange", ubah);
    return () => document.removeEventListener("fullscreenchange", ubah);
  }, []);
  return bisa;
}
