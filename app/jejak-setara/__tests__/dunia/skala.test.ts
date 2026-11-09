// Skala bulat (spesifikasi JS-07, P-1; AC-1).
import { describe, expect, it } from "vitest";
import { hitungSkala, POTONG_MAKS } from "../../pemain/dunia/skala";

describe("skala bulat (P-1)", () => {
  it.each([
    [731, 411, 2.625, 6],
    [1280, 720, 1, 4],
    [1024, 768, 1, 3],
    [1920, 1080, 1, 6],
    [1366, 657, 1, 3],
  ])("%i × %i px, rasio %f → ×%i", (w, h, r, k) => {
    const u = hitungSkala(w, h, r);
    expect(u.k).toBe(k);
    expect([u.lebarPerangkat, u.tinggiPerangkat]).toEqual([320 * k, 180 * k]);
    expect(u.lebarCss).toBeCloseTo((320 * k) / r, 9);
    expect(u.tinggiCss).toBeCloseTo((180 * k) / r, 9);
  });

  it("HP 731 × 411 (r 2,625): kanvas 1.920 × 1.080 terpotong kurang dari 2 piksel logis per sisi, di tengah", () => {
    const u = hitungSkala(731, 411, 2.625);
    const potongX = ((u.lebarPerangkat - 731 * 2.625) / 2) / u.k;
    const potongY = ((u.tinggiPerangkat - 411 * 2.625) / 2) / u.k;
    expect(potongX).toBeGreaterThan(0);
    expect(potongX).toBeLessThanOrEqual(POTONG_MAKS);
    expect(potongY).toBeLessThanOrEqual(POTONG_MAKS);
    expect(u.kiriCss).toBeLessThanOrEqual(0);
    expect(u.atasCss).toBeLessThanOrEqual(0);
  });

  it("laptop 1024 × 768: ×3 dengan bingkai ink di keempat sisi, letak di piksel bulat", () => {
    const u = hitungSkala(1024, 768, 1);
    expect([u.kiriCss, u.atasCss]).toEqual([32, 114]);
  });

  it("batas: tepat 316 × 176 piksel perangkat per k, dan paling kecil 1", () => {
    expect(hitungSkala(632, 352, 1).k).toBe(2);
    expect(hitungSkala(631, 352, 1).k).toBe(1);
    expect(hitungSkala(632, 351, 1).k).toBe(1);
    expect(hitungSkala(100, 50, 1).k).toBe(1);
    expect(hitungSkala(0, 0, 0).k).toBe(1);
  });

  it("dihitung ulang saat orientasi berubah: HP tegak 411 × 731 memakai skala yang lebih kecil", () => {
    expect(hitungSkala(411, 731, 2.625).k).toBe(3);
  });
});
