// Kait pengatur waktu diskusi Sehari Setara (spesifikasi F-07, bagian Kait pengatur waktu).
// Berada di ui/, bukan engine/, karena memakai setInterval; reducer tetap tanpa pengatur waktu (uji F-02 AC-14).
import { useEffect, useEffectEvent } from "react";
import { dueTicks, TIMER_POLL_MS } from "./turn";

/**
 * Selama active benar, setiap 250 ms menghitung detik utuh sejak titik acuan dengan performance.now(), lalu
 * memanggil onTicks dengan banyaknya. Titik acuan maju sebanyak detik yang sudah dikirim, dan dipasang ulang setiap
 * kali kait menjadi aktif, sehingga sisa pecahan detik dibuang saat dijeda. Pengatur dibersihkan saat tidak aktif
 * atau saat layar ditutup; StrictMode tidak membuat detik ganda karena efeknya dibersihkan sebelum dipasang lagi.
 */
export function useTimer(active: boolean, onTicks: (count: number) => void): void {
  const tick = useEffectEvent(onTicks);

  useEffect(() => {
    if (!active) return;
    let anchor = performance.now();
    const timer = setInterval(() => {
      const count = dueTicks(performance.now() - anchor);
      if (count === 0) return;
      anchor += count * 1000;
      tick(count);
    }, TIMER_POLL_MS);
    return () => clearInterval(timer);
  }, [active]);
}
