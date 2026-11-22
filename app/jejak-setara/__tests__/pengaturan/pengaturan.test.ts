// Pengaturan pemain dan penyimpanannya (spesifikasi JS-14, P-1 sampai P-3 dan P-28; AC-1, AC-10).
import { describe, expect, it } from "vitest";
import { bacaPengaturan, KUNCI_PENGATURAN, kurangiGerakEfektif, LABEL_HURUF, PENGATURAN_BAWAAN, simpanPengaturan, uraiPengaturan, type Penyimpan } from "../../pemain/pengaturan";

function penyimpan(awal: Record<string, string> = {}, gagal = false): Penyimpan & { isi: Record<string, string> } {
  const isi = { ...awal };
  return {
    isi,
    getItem: (k) => isi[k] ?? null,
    setItem: (k, v) => {
      if (gagal) throw new Error("penuh");
      isi[k] = v;
    },
  };
}

describe("pengaturan pemain (P-1, P-2)", () => {
  it("bawaan: suara mati, kurangi gerak mengikuti perangkat, teks per huruf mati, label biasa", () => {
    expect(PENGATURAN_BAWAAN).toEqual({ suara: false, kurangiGerak: null, ketik: false, label: "biasa" });
    expect(bacaPengaturan(penyimpan())).toEqual(PENGATURAN_BAWAAN);
    expect(bacaPengaturan(null)).toEqual(PENGATURAN_BAWAAN);
    expect(LABEL_HURUF).toEqual({ biasa: 13, besar: 17 });
  });

  it("tersimpan di jejak:pengaturan dan terbaca lagi", () => {
    const s = penyimpan();
    simpanPengaturan({ suara: true, kurangiGerak: false, ketik: true, label: "besar" }, s);
    expect(KUNCI_PENGATURAN).toBe("jejak:pengaturan");
    expect(JSON.parse(s.isi[KUNCI_PENGATURAN])).toEqual({ suara: true, kurangiGerak: false, ketik: true, label: "besar" });
    expect(bacaPengaturan(s)).toEqual({ suara: true, kurangiGerak: false, ketik: true, label: "besar" });
  });

  it("isian rusak atau di luar daftar diganti bawaannya satu per satu", () => {
    expect(uraiPengaturan("{rusak")).toEqual(PENGATURAN_BAWAAN);
    expect(uraiPengaturan("[1,2]")).toEqual(PENGATURAN_BAWAAN);
    expect(uraiPengaturan(JSON.stringify({ suara: "ya", kurangiGerak: true, ketik: 1, label: "raksasa" }))).toEqual({ suara: false, kurangiGerak: true, ketik: false, label: "biasa" });
  });

  it("penyimpanan yang penuh atau ditolak tidak menimbulkan galat", () => {
    expect(() => simpanPengaturan({ ...PENGATURAN_BAWAAN, suara: true }, penyimpan({}, true))).not.toThrow();
  });
});

describe("kurangi gerak efektif (P-28)", () => {
  it("mengikuti perangkat sampai diubah pemain", () => {
    expect(kurangiGerakEfektif(PENGATURAN_BAWAAN, true)).toBe(true);
    expect(kurangiGerakEfektif(PENGATURAN_BAWAAN, false)).toBe(false);
    expect(kurangiGerakEfektif({ ...PENGATURAN_BAWAAN, kurangiGerak: false }, true)).toBe(false);
    expect(kurangiGerakEfektif({ ...PENGATURAN_BAWAAN, kurangiGerak: true }, false)).toBe(true);
  });
});
