// Histogram waktu pulang-pergi HP pemain per ruang (spesifikasi JS-15, P-28): kotak 10 ms dari 0 sampai 2.000 ms,
// ditambah satu kotak di atas 2.000 ms. Hanya di memori Durable Object, tanpa nilai per pemain, dan tidak ditulis ke
// D1 (D-3 a). Median dan p95 memakai batas atas kotak; kotak di atas 2.000 ms memakai nilai terbesar yang diterima.

export const RTT_KOTAK_MS = 10;
export const RTT_BATAS_MS = 2000;
const JUMLAH_KOTAK = RTT_BATAS_MS / RTT_KOTAK_MS;

export interface RingkasanRtt {
  rttMedianMs: number | null;
  rttP95Ms: number | null;
  rttSampel: number;
}

export class HistogramRtt {
  private readonly kotak: number[] = new Array<number>(JUMLAH_KOTAK + 1).fill(0);
  private sampel = 0;
  private maks = 0;

  /** Menambah satu sampel (milidetik, ≥ 0). Nilai yang tidak sah dilewati. */
  tambah(ms: number): void {
    if (!Number.isFinite(ms) || ms < 0) return;
    this.kotak[Math.min(JUMLAH_KOTAK, Math.floor(ms / RTT_KOTAK_MS))]++;
    this.sampel++;
    if (ms > this.maks) this.maks = ms;
  }

  /** Persentil q (0 < q ≤ 1) sebagai batas atas kotak; null bila belum ada sampel. */
  persentil(q: number): number | null {
    if (this.sampel === 0) return null;
    const sasaran = Math.max(1, Math.ceil(q * this.sampel));
    let jalan = 0;
    for (let i = 0; i < JUMLAH_KOTAK; i++) {
      jalan += this.kotak[i];
      if (jalan >= sasaran) return (i + 1) * RTT_KOTAK_MS;
    }
    return Math.round(this.maks);
  }

  ringkas(): RingkasanRtt {
    return { rttMedianMs: this.persentil(0.5), rttP95Ms: this.persentil(0.95), rttSampel: this.sampel };
  }
}
