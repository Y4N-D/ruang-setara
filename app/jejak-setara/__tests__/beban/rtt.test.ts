// Histogram waktu pulang-pergi HP per ruang (spesifikasi JS-15, P-28).
import { describe, expect, it } from "vitest";
import { HistogramRtt, RTT_BATAS_MS, RTT_KOTAK_MS } from "../../../../server/jejak-setara/src/ruang/rtt";

describe("HistogramRtt (P-28)", () => {
  it("tanpa sampel: median dan p95 null, sampel 0", () => {
    expect(new HistogramRtt().ringkas()).toEqual({ rttMedianMs: null, rttP95Ms: null, rttSampel: 0 });
  });

  it("median dan p95 memakai batas atas kotak 10 ms", () => {
    const h = new HistogramRtt();
    for (let i = 1; i <= 100; i++) h.tambah(i * 10 - 1); // 9, 19, ..., 999
    expect(h.ringkas()).toEqual({ rttMedianMs: 500, rttP95Ms: 950, rttSampel: 100 });
    expect(RTT_KOTAK_MS).toBe(10);
  });

  it("satu sampel 0 ms masuk kotak pertama; nilai tidak sah dilewati", () => {
    const h = new HistogramRtt();
    h.tambah(0);
    h.tambah(-5);
    h.tambah(Number.NaN);
    expect(h.ringkas()).toEqual({ rttMedianMs: 10, rttP95Ms: 10, rttSampel: 1 });
  });

  it("kotak di atas 2.000 ms memakai nilai terbesar yang diterima", () => {
    const h = new HistogramRtt();
    for (let i = 0; i < 90; i++) h.tambah(80);
    for (let i = 0; i < 10; i++) h.tambah(RTT_BATAS_MS + 500 + i);
    expect(h.ringkas()).toEqual({ rttMedianMs: 80 + 10 - (80 % 10), rttP95Ms: RTT_BATAS_MS + 509, rttSampel: 100 });
  });
});
