// Teks muncul per huruf (spesifikasi JS-14, P-24 sampai P-26): 40 huruf per detik, rumus `typedLength` Sehari Setara.
import { useEffect, useRef, useState } from "react";

export const KETIK_HURUF_PER_DETIK = 40;

export function panjangKetik(ms: number, total: number, perDetik: number = KETIK_HURUF_PER_DETIK): number {
  if (!(ms > 0)) return 0;
  return Math.min(total, Math.floor((ms * perDetik) / 1000));
}

/**
 * Menjalankan teks satu per satu bila `aktif`; `lewati` menampilkan semuanya. `saatMaju(dari, ke)` dipanggil setiap ada
 * huruf baru (untuk bunyi teks). Bila tidak aktif, teks langsung tampil penuh. Teks baru memerlukan komponen baru
 * (pemanggil memberi `key`).
 */
export function useKetik(teks: string, aktif: boolean, saatMaju?: (dari: number, ke: number) => void) {
  const [n, setN] = useState(0);
  const maju = useRef(saatMaju);
  const dilewati = useRef(false);
  useEffect(() => {
    maju.current = saatMaju;
  });
  useEffect(() => {
    if (!aktif) return;
    const mulai = performance.now();
    let akhir = 0;
    let id = 0;
    const langkah = () => {
      if (dilewati.current) return;
      const k = panjangKetik(performance.now() - mulai, teks.length);
      if (k !== akhir) {
        maju.current?.(akhir, k);
        akhir = k;
        setN(k);
      }
      if (k < teks.length) id = requestAnimationFrame(langkah);
    };
    id = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(id);
  }, [teks, aktif]);
  const penuh = !aktif || n >= teks.length;
  return {
    tampil: penuh ? teks : teks.slice(0, n),
    selesai: penuh,
    lewati: () => {
      dilewati.current = true;
      setN(teks.length);
    },
  };
}
