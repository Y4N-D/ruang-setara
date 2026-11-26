// Gambar medan peta (spesifikasi JS-23, P-2 sampai P-7 dan P-12; AC-1, AC-4, AC-5, dan AC-7).
import { describe, expect, it } from "vitest";
import peta from "../../peta/kampung.json";
import {
  buatPemuatMedan,
  buatSimpananMedan,
  JEDA_COBA_ULANG_MS,
  LEBAR_LABEL_V10,
  letakLabelZona,
  pilihMedan,
  ukuranMedanMini,
} from "../../pemain/dunia/medan";

class GambarTiruan {
  src = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
}

describe("JS-23: pilihan gambar peta mini (P-2; AC-1)", () => {
  it("medan1 di bawah rasio 2, medan2 sejak rasio 2", () => {
    expect([1, 1.5, 1.99].map(pilihMedan)).toEqual([1, 1, 1]);
    expect([2, 2.625, 3].map(pilihMedan)).toEqual([2, 2, 2]);
  });
});

describe("JS-23: kanvas simpanan peta mini (P-7; AC-4)", () => {
  it("ukuran 160 × 0,7r kali 100 × 0,7r piksel perangkat", () => {
    expect([1, 1.5, 2.625, 3].map((r) => ukuranMedanMini(r))).toEqual([
      { lebar: 112, tinggi: 70 },
      { lebar: 168, tinggi: 105 },
      { lebar: 294, tinggi: 184 },
      { lebar: 336, tinggi: 210 },
    ]);
  });

  it("dibuat sekali selama sumber dan ukuran tetap, tanpa penghalusan", () => {
    const dibuat: { width: number; height: number; ctx: { imageSmoothingEnabled: boolean; gambar: unknown[][] } }[] = [];
    const salin = buatSimpananMedan((width, height) => {
      const ctx = { imageSmoothingEnabled: true, gambar: [] as unknown[][], drawImage: (...a: unknown[]) => ctx.gambar.push(a) };
      const k = { width, height, ctx, getContext: () => ctx };
      dibuat.push(k);
      return k as unknown as HTMLCanvasElement;
    });
    const sumber = {} as CanvasImageSource;
    expect(salin(sumber, 294, 184)).toBe(salin(sumber, 294, 184));
    expect(dibuat).toHaveLength(1);
    expect(dibuat[0].ctx.imageSmoothingEnabled).toBe(false);
    expect(dibuat[0].ctx.gambar).toEqual([[sumber, 0, 0, 294, 184]]);
    salin(sumber, 112, 70);
    expect(dibuat).toHaveLength(2);
    salin({} as CanvasImageSource, 112, 70);
    expect(dibuat).toHaveLength(3);
  });
});

describe("JS-23: pemuat gambar medan (P-4, P-5; AC-5)", () => {
  it("memuat sekali, coba ulang sekali paling cepat 10 detik sesudah gagal, lalu berhenti", () => {
    const dibuat: GambarTiruan[] = [];
    let jam = 1_000;
    const pemuat = buatPemuatMedan(
      () => {
        const g = new GambarTiruan();
        dibuat.push(g);
        return g as unknown as HTMLImageElement;
      },
      JEDA_COBA_ULANG_MS,
      () => jam,
    );
    let siap = 0;
    const berhenti = pemuat.dengar(() => siap++);
    expect(pemuat.ambil("a.png")).toBeNull();
    expect(pemuat.ambil("a.png")).toBeNull();
    expect(dibuat.map((g) => g.src)).toEqual(["a.png"]);
    dibuat[0].onerror?.();
    jam += JEDA_COBA_ULANG_MS - 1;
    expect(pemuat.ambil("a.png")).toBeNull();
    expect(dibuat).toHaveLength(1);
    jam += 1;
    expect(pemuat.ambil("a.png")).toBeNull();
    expect(dibuat.map((g) => g.src)).toEqual(["a.png", "a.png"]);
    dibuat[1].onerror?.();
    jam += 60_000;
    expect(pemuat.ambil("a.png")).toBeNull();
    expect(dibuat).toHaveLength(2);
    expect(pemuat.ambil("b.png")).toBeNull();
    dibuat[2].onload?.();
    expect(siap).toBe(1);
    expect(pemuat.ambil("b.png")).toBe(dibuat[2]);
    berhenti();
    pemuat.ambil("c.png");
    dibuat[3].onload?.();
    expect(siap).toBe(1);
  });
});

describe("JS-23: label zona peta besar (P-12; DRAF D-1 a; AC-7)", () => {
  it("berpojok 3 px dari pojok zona dan tetap di dalam zonanya pada skala 2 sampai 9", () => {
    for (let s = 2; s <= 9; s++) {
      for (const z of peta.zona) {
        const l = letakLabelZona(z, s);
        expect(l.kiri, `${z.id} s=${s}`).toBe(z.kiri * s + 3);
        expect(l.atas, `${z.id} s=${s}`).toBe(z.atas * s + 3);
        expect(l.lebarMaks, `${z.id} s=${s}`).toBeLessThanOrEqual(LEBAR_LABEL_V10);
        expect(l.kiri + l.lebarMaks, `${z.id} s=${s}`).toBeLessThanOrEqual((z.kanan + 1) * s - 3);
      }
    }
  });

  it("pada skala 2, label Z1 dan Z3 lebih sempit daripada label v1.0", () => {
    const z = (id: string) => peta.zona.find((x) => x.id === id) as (typeof peta.zona)[number];
    expect(letakLabelZona(z("z1"), 2).lebarMaks).toBe(100);
    expect(letakLabelZona(z("z3"), 2).lebarMaks).toBe(102);
    expect(letakLabelZona(z("z6"), 3).lebarMaks).toBe(LEBAR_LABEL_V10);
  });
});
