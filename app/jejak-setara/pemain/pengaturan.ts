// Pengaturan pemain (spesifikasi JS-14, P-1 sampai P-3, P-27, dan P-28): suara, kurangi gerak, teks muncul per huruf,
// dan ukuran label nama. Disimpan di sessionStorage tab ini (kunci `jejak:pengaturan`), seperti token; bukan data pribadi.
import { useCallback, useEffect, useState } from "react";

export interface PengaturanPemain {
  suara: boolean;
  /** null: mengikuti `prefers-reduced-motion` perangkat. */
  kurangiGerak: boolean | null;
  ketik: boolean;
  label: "biasa" | "besar";
}

export const KUNCI_PENGATURAN = "jejak:pengaturan";
export const PENGATURAN_BAWAAN: Readonly<PengaturanPemain> = { suara: false, kurangiGerak: null, ketik: false, label: "biasa" };
/** P-27: ukuran huruf label nama dalam px CSS. */
export const LABEL_HURUF = { biasa: 13, besar: 17 } as const;

export interface Penyimpan {
  getItem(kunci: string): string | null;
  setItem(kunci: string, nilai: string): void;
}

function penyimpanTab(): Penyimpan | null {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage;
  } catch {
    return null;
  }
}

/** P-2: isian yang tidak terbaca atau di luar daftar diganti bawaannya, satu per satu. */
export function uraiPengaturan(teks: string | null): PengaturanPemain {
  let o: Record<string, unknown> = {};
  try {
    const d = teks ? (JSON.parse(teks) as unknown) : null;
    if (d && typeof d === "object" && !Array.isArray(d)) o = d as Record<string, unknown>;
  } catch {
    o = {};
  }
  return {
    suara: typeof o.suara === "boolean" ? o.suara : PENGATURAN_BAWAAN.suara,
    kurangiGerak: typeof o.kurangiGerak === "boolean" ? o.kurangiGerak : null,
    ketik: typeof o.ketik === "boolean" ? o.ketik : PENGATURAN_BAWAAN.ketik,
    label: o.label === "besar" ? "besar" : "biasa",
  };
}

export function bacaPengaturan(s: Penyimpan | null = penyimpanTab()): PengaturanPemain {
  try {
    return uraiPengaturan(s?.getItem(KUNCI_PENGATURAN) ?? null);
  } catch {
    return { ...PENGATURAN_BAWAAN };
  }
}

/** Gagal menyimpan (penuh atau ditolak) tidak menimbulkan galat; pengaturan tetap berlaku di memori. */
export function simpanPengaturan(p: PengaturanPemain, s: Penyimpan | null = penyimpanTab()): void {
  try {
    s?.setItem(KUNCI_PENGATURAN, JSON.stringify(p));
  } catch {
    // Diabaikan (P-2).
  }
}

export function gerakPerangkat(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** P-28: pengaturan pemain bila sudah diubah, selain itu pengaturan perangkat. */
export function kurangiGerakEfektif(p: PengaturanPemain, perangkat: boolean): boolean {
  return p.kurangiGerak ?? perangkat;
}

export function usePengaturan(): [PengaturanPemain, (ubah: Partial<PengaturanPemain>) => void] {
  const [p, setP] = useState(bacaPengaturan);
  const ubah = useCallback((u: Partial<PengaturanPemain>) => {
    setP((lama) => {
      const baru = { ...lama, ...u };
      simpanPengaturan(baru);
      return baru;
    });
  }, []);
  return [p, ubah];
}

/** P-28: nilai efektif kurangi gerak, dipasang sebagai `data-kurangi-gerak` di <html>; mengikuti perubahan perangkat. */
export function useKurangiGerak(p: PengaturanPemain): { efektif: boolean; perangkat: boolean } {
  const [perangkat, setPerangkat] = useState(gerakPerangkat);
  useEffect(() => {
    const mq = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const ubah = () => setPerangkat(mq?.matches ?? false);
    mq?.addEventListener?.("change", ubah);
    return () => mq?.removeEventListener?.("change", ubah);
  }, []);
  const efektif = kurangiGerakEfektif(p, perangkat);
  useEffect(() => {
    document.documentElement.dataset.kurangiGerak = efektif ? "ya" : "tidak";
  }, [efektif]);
  return { efektif, perangkat };
}
