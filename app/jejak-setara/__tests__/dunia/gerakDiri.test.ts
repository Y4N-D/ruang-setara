// Gerak pemain sendiri dan kiriman `gerak` (spesifikasi JS-07, P-14 sampai P-18; AC-6 dan AC-8).
import { describe, expect, it } from "vitest";
import type { PesanPemain } from "../../inti/protokol";
import { GerakDiri, LANGKAH_MS, selangKirim } from "../../pemain/dunia/gerakDiri";

type Gerak = Extract<PesanPemain, { t: "gerak" }>;
const TERBUKA = { lebar: 40, tinggi: 40, tabrakan: new Uint8Array(1600) };

function siap(x = 300, y = 300, seq = 0) {
  const g = new GerakDiri();
  g.terapkanKoreksi({ x, y, seq });
  const kirim: Gerak[] = [];
  return { g, kirim, f: (p: Gerak) => (kirim.push(p), true) };
}

describe("langkah tetap 60 Hz (P-15)", () => {
  it("72 piksel per detik; diagonal tidak lebih cepat", () => {
    const { g } = siap();
    for (let i = 0; i < 60; i++) g.maju(LANGKAH_MS, { dx: 1, dy: 0 }, true, TERBUKA);
    expect(g.posisi!.x).toBeCloseTo(372, 6);
    const d = siap();
    for (let i = 0; i < 60; i++) d.g.maju(LANGKAH_MS, { dx: 1, dy: 1 }, true, TERBUKA);
    expect(Math.hypot(d.g.posisi!.x - 300, d.g.posisi!.y - 300)).toBeCloseTo(72, 6);
  });

  it("selang besar dikejar paling lama 250 ms; tidak bergerak bila tidak diizinkan atau posisi awal belum tiba", () => {
    const { g } = siap();
    g.maju(5000, { dx: 1, dy: 0 }, true, TERBUKA);
    expect(g.posisi!.x).toBeCloseTo(300 + 72 * 0.25, 0);
    const x = g.posisi!.x;
    g.maju(100, { dx: 1, dy: 0 }, false, TERBUKA);
    expect([g.posisi!.x, g.jalan]).toEqual([x, false]);
    const baru = new GerakDiri();
    baru.maju(100, { dx: 1, dy: 0 }, true, TERBUKA);
    expect(baru.posisi).toBeNull();
  });
});

describe("kiriman gerak (P-16)", () => {
  it("paling sering setiap 100 ms selama berjalan, satu laporan berhenti, tanpa kiriman saat diam", () => {
    const { g, kirim, f } = siap();
    let t = 1000;
    for (let i = 0; i < 60; i++) {
      t += LANGKAH_MS;
      g.maju(LANGKAH_MS, { dx: 1, dy: 0 }, true, TERBUKA);
      g.kirimBila(t, 100, 0, f);
    }
    expect(kirim.length).toBeGreaterThanOrEqual(9);
    expect(kirim.length).toBeLessThanOrEqual(10);
    expect(kirim.every((p) => p.jalan)).toBe(true);
    for (let i = 1; i < kirim.length; i++) expect(kirim[i].seq).toBe(kirim[i - 1].seq + 1);
    const n = kirim.length;
    t += LANGKAH_MS;
    g.maju(LANGKAH_MS, { dx: 0, dy: 0 }, true, TERBUKA);
    g.kirimBila(t, 100, 0, f);
    expect(kirim.length).toBe(n + 1);
    expect(kirim[n]).toMatchObject({ jalan: false });
    for (let i = 0; i < 120; i++) {
      t += LANGKAH_MS;
      g.maju(LANGKAH_MS, { dx: 0, dy: 0 }, true, TERBUKA);
      g.kirimBila(t, 100, 0, f);
    }
    expect(kirim.length).toBe(n + 1);
  });

  it("166 ms di ruang lebih dari 50 pemain", () => {
    expect([selangKirim(40), selangKirim(50), selangKirim(51), selangKirim(100)]).toEqual([100, 100, 166, 166]);
  });

  it("bufferedAmount > 0: dilewati tanpa antrean, lalu posisi terbaru dikirim", () => {
    const { g, kirim, f } = siap();
    let t = 0;
    for (let i = 0; i < 25; i++) {
      t += LANGKAH_MS;
      g.maju(LANGKAH_MS, { dx: 1, dy: 0 }, true, TERBUKA);
      g.kirimBila(t, 100, 512, f);
    }
    expect(kirim).toHaveLength(0);
    t += LANGKAH_MS;
    g.maju(LANGKAH_MS, { dx: 1, dy: 0 }, true, TERBUKA);
    g.kirimBila(t, 100, 0, f);
    expect(kirim).toHaveLength(1);
    expect(kirim[0].x).toBeCloseTo(Math.round(g.posisi!.x * 10) / 10, 6);
    expect(kirim[0].x).toBeGreaterThan(330); // posisi sesudah 26 langkah, bukan posisi lama yang diantrekan
  });

  it("posisi dilaporkan dibulatkan ke 0,1 piksel; kirim yang gagal tidak menaikkan seq", () => {
    const { g } = siap(300, 300, 7);
    const ditolak: Gerak[] = [];
    g.maju(LANGKAH_MS * 3, { dx: 1, dy: 0 }, true, TERBUKA);
    expect(g.kirimBila(0, 100, 0, () => false)).toBeNull();
    const p = g.kirimBila(0, 100, 0, (q) => (ditolak.push(q), true));
    expect(p?.seq).toBe(8);
    expect(String(p?.x)).toMatch(/^\d+(\.\d)?$/);
  });
});

describe("koreksi (P-17, P-18)", () => {
  it("koreksi pertama: posisi dipakai, seq berikutnya koreksi.seq + 1; koreksi berikutnya: seq paling kecil koreksi.seq + 1", () => {
    const g = new GerakDiri();
    expect(g.terapkanKoreksi({ x: 10, y: 20, seq: 5 })).toBe(true);
    expect([g.posisi, g.seqBerikut]).toEqual([{ x: 10, y: 20 }, 6]);
    g.kirimBila(0, 100, 0, () => true); // posisi sama dengan koreksi: tidak dikirim
    expect(g.seqBerikut).toBe(6);
    g.maju(LANGKAH_MS * 6, { dx: 1, dy: 0 }, true, TERBUKA);
    g.kirimBila(0, 100, 0, () => true);
    expect(g.seqBerikut).toBe(7);
    expect(g.terapkanKoreksi({ x: 50, y: 50, seq: 3 })).toBe(false);
    expect([g.posisi, g.seqBerikut]).toEqual([{ x: 50, y: 50 }, 7]);
    g.terapkanKoreksi({ x: 50, y: 50, seq: 40 });
    expect(g.seqBerikut).toBe(41);
    g.mulaiSesi();
    expect(g.terapkanKoreksi({ x: 1, y: 2, seq: 0 })).toBe(true);
    expect(g.seqBerikut).toBe(1);
  });
});
