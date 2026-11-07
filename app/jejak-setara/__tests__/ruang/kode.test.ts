// Kode ruang, pembanding waktu konstan, dan Origin (spesifikasi JS-03, P-2, P-10, P-11, P-14; AC-3, AC-5).
import { webcrypto } from "node:crypto";
import { describe, expect, it } from "vitest";
import { POLA_KODE_RUANG } from "../../inti/aturan";
import { ABJAD_KODE, asalDiizinkan, base64url, kodeAcak, samaWaktuKonstan } from "../../../../server/jejak-setara/src/keamanan";

const acakByte = (n: number) => webcrypto.getRandomValues(new Uint8Array(n));

describe("kode ruang", () => {
  it("100.000 kode sesuai pola, dan sebaran 31 karakter lolos uji chi² (p = 0,01)", () => {
    const hitung = new Map<string, number>();
    for (let i = 0; i < 100_000; i++) {
      const kode = kodeAcak(acakByte);
      expect(POLA_KODE_RUANG.test(kode)).toBe(true);
      for (const c of kode) hitung.set(c, (hitung.get(c) ?? 0) + 1);
    }
    expect(hitung.size).toBe(31);
    const harapan = 500_000 / 31;
    const chi2 = [...hitung.values()].reduce((s, n) => s + (n - harapan) ** 2 / harapan, 0);
    expect(chi2).toBeLessThan(50.89); // derajat bebas 30
  });

  it("byte 248–255 dibuang agar tidak ada bias modulo", () => {
    const urutan = [Uint8Array.from([248, 255, 0, 30, 31, 249, 61, 62]), Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8])];
    let i = 0;
    expect(kodeAcak(() => urutan[i++])).toBe(ABJAD_KODE[0] + ABJAD_KODE[30] + ABJAD_KODE[0] + ABJAD_KODE[30] + ABJAD_KODE[0]);
  });
});

describe("keamanan kecil", () => {
  it("samaWaktuKonstan", () => {
    expect(samaWaktuKonstan("abc", "abc")).toBe(true);
    expect(samaWaktuKonstan("abc", "abd")).toBe(false);
    expect(samaWaktuKonstan("abc", "ab")).toBe(false);
    expect(samaWaktuKonstan("", "")).toBe(true);
  });

  it("base64url tanpa padding: 32 byte menjadi 43 karakter", () => {
    expect(base64url(new Uint8Array(32).fill(255))).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("Origin harus sama dengan asal alamat; di lokal juga localhost dan 127.0.0.1", () => {
    const url = new URL("https://jejak.contoh.id/ws/ruang/K7MPA");
    expect(asalDiizinkan("https://jejak.contoh.id", url, "uji")).toBe(true);
    expect(asalDiizinkan("https://lain.contoh.id", url, "uji")).toBe(false);
    expect(asalDiizinkan(null, url, "uji")).toBe(false);
    expect(asalDiizinkan("http://127.0.0.1:4310", url, "uji")).toBe(false);
    expect(asalDiizinkan("http://127.0.0.1:4310", url, "lokal")).toBe(true);
    expect(asalDiizinkan("http://localhost:5173", url, "lokal")).toBe(true);
  });
});
