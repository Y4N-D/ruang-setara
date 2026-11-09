// Kamera (spesifikasi JS-07, P-3; AC-3).
import { describe, expect, it } from "vitest";
import { ikutiKamera, kameraPusat, ZONA_MATI } from "../../pemain/dunia/kamera";

const PETA = [2560, 1600] as const;

describe("kamera (P-3)", () => {
  it("berpusat pada pemain saat posisi awal, bulat, dan dijepit ke keempat tepi", () => {
    expect(kameraPusat({ x: 1112, y: 812 }, ...PETA)).toEqual({ x: 952, y: 722 });
    expect(kameraPusat({ x: 1112.6, y: 812.4 }, ...PETA)).toEqual({ x: 953, y: 722 });
    expect(kameraPusat({ x: 10, y: 10 }, ...PETA)).toEqual({ x: 0, y: 0 });
    expect(kameraPusat({ x: 2555, y: 1595 }, ...PETA)).toEqual({ x: 2240, y: 1420 });
  });

  it("zona mati 24 × 16: pemain boleh bergeser 12 mendatar dan 8 tegak tanpa kamera bergerak", () => {
    expect(ZONA_MATI).toEqual({ x: 12, y: 8 });
    const k = { x: 952, y: 722 };
    expect(ikutiKamera(k, { x: 1112 + 12, y: 812 + 8 }, ...PETA)).toEqual(k);
    expect(ikutiKamera(k, { x: 1112 - 12, y: 812 - 8 }, ...PETA)).toEqual(k);
    expect(ikutiKamera(k, { x: 1112 + 20, y: 812 }, ...PETA)).toEqual({ x: 960, y: 722 });
    expect(ikutiKamera(k, { x: 1112, y: 812 - 20 }, ...PETA)).toEqual({ x: 952, y: 710 });
  });

  it("selalu bulat dan tidak keluar peta saat pemain di tepi", () => {
    let k = kameraPusat({ x: 200, y: 200 }, ...PETA);
    for (let x = 200; x >= 5; x -= 0.7) {
      k = ikutiKamera(k, { x, y: 200 }, ...PETA);
      expect(Number.isInteger(k.x) && Number.isInteger(k.y)).toBe(true);
      expect(k.x).toBeGreaterThanOrEqual(0);
    }
    expect(k.x).toBe(0);
    k = ikutiKamera(k, { x: 2559, y: 1599 }, ...PETA);
    expect(k).toEqual({ x: 2240, y: 1420 });
  });
});
