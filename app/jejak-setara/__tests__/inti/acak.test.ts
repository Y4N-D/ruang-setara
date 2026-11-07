// Uji acak berbenih (spesifikasi JS-02, P-1 sampai P-4; AC-2).
import { describe, expect, it, vi } from "vitest";
import { acakBerbenih, benih, bulat, kocok, pilih } from "../../inti/acak";

const ambil = (gen: () => number, n: number) => Array.from({ length: n }, () => gen());

describe("benih (P-1)", () => {
  it("memberi nilai tetap untuk bagian yang sama (dicocokkan dengan implementasi rujukan terpisah)", () => {
    expect(benih("")).toBe(2165871905);
    expect(benih("ruang-1", "p-01", "K-13")).toBe(2994746477);
    expect(benih(12345, "K-01")).toBe(819361737);
    expect(benih("a", "b")).toBe(851547125);
  });

  it("menyambung bagian dengan ; dan String(bagian)", () => {
    expect(benih("a", "b")).toBe(benih("a;b"));
    expect(benih(7, "x")).toBe(benih("7", "x"));
    expect(benih("a", "b")).not.toBe(benih("b", "a"));
  });

  it("selalu bilangan bulat 0–4.294.967.295", () => {
    for (let i = 0; i < 2000; i++) {
      const b = benih("uji", i);
      expect(Number.isInteger(b) && b >= 0 && b <= 4294967295, String(b)).toBe(true);
    }
  });

  it("10.000 benih gabungan ruang, pemain, dan kejadian tidak bertabrakan", () => {
    const semua = new Set<number>();
    for (let r = 0; r < 10; r++) {
      for (let p = 0; p < 50; p++) {
        for (let k = 1; k <= 20; k++) semua.add(benih(`ruang-${r}`, `p-${p}`, `K-${String(k).padStart(2, "0")}`));
      }
    }
    expect(semua.size).toBe(10000);
  });
});

describe("acakBerbenih (P-2)", () => {
  it("memberi urutan tetap untuk benih tetap (mulberry32)", () => {
    expect(ambil(acakBerbenih(1), 3)).toEqual([0.6270739405881613, 0.002735721180215478, 0.5274470399599522]);
    expect(ambil(acakBerbenih(benih("ruang-1", "p-01", "K-13")), 3)).toEqual([
      0.030292846262454987, 0.6058896032627672, 0.5841623193118721,
    ]);
  });

  it("benih sama menghasilkan urutan sama; benih berbeda menghasilkan urutan berbeda", () => {
    expect(ambil(acakBerbenih(99), 50)).toEqual(ambil(acakBerbenih(99), 50));
    expect(ambil(acakBerbenih(99), 50)).not.toEqual(ambil(acakBerbenih(100), 50));
  });

  it("setiap angka berada di 0 ≤ x < 1", () => {
    const acak = acakBerbenih(benih("rentang"));
    let diLuar = 0;
    for (let i = 0; i < 100000; i++) {
      const x = acak();
      if (!(x >= 0 && x < 1)) diLuar++;
    }
    expect(diLuar).toBe(0);
  });

  it("sebarannya merata: chi² 16 kelas dari 160.000 angka di bawah batas p = 0,01", () => {
    const kelas = new Array<number>(16).fill(0);
    const acak = acakBerbenih(benih("sebaran"));
    for (let i = 0; i < 160000; i++) kelas[Math.floor(acak() * 16)]++;
    const chi2 = kelas.reduce((jumlah, n) => jumlah + (n - 10000) ** 2 / 10000, 0);
    expect(chi2).toBeLessThan(30.58); // df = 15
  });

  it("dua salinan modul yang dimuat ulang memberi urutan yang sama", async () => {
    const a = await import("../../inti/acak");
    for (let i = 0; i < 100; i++) a.acakBerbenih(i)(); // salinan pertama sudah dipakai
    const urutanA = ambil(a.acakBerbenih(a.benih("ruang-9", "p-3", "K-07")), 10);
    vi.resetModules();
    const b = await import("../../inti/acak");
    const urutanB = ambil(b.acakBerbenih(b.benih("ruang-9", "p-3", "K-07")), 10);
    expect(urutanB).toEqual(urutanA);
  });
});

describe("kocok, pilih, bulat (P-3)", () => {
  const asal = Object.freeze(["A", "B", "C", "D", "E", "F", "G", "H"]);

  it("kocok menghasilkan permutasi penuh di larik baru, tanpa mengubah larik asal", () => {
    for (let b = 0; b < 200; b++) {
      const hasil = kocok(asal, b);
      expect(hasil).not.toBe(asal);
      expect([...hasil].sort()).toEqual([...asal]);
    }
    expect(asal).toEqual(["A", "B", "C", "D", "E", "F", "G", "H"]);
  });

  it("kocok tetap untuk benih sama dan berubah untuk benih lain", () => {
    expect(kocok(asal, 7)).toEqual(kocok(asal, 7));
    const berbeda = new Set(Array.from({ length: 50 }, (_, b) => kocok(asal, b).join("")));
    expect(berbeda.size).toBeGreaterThan(45);
  });

  it("kocok larik kosong dan larik satu unsur", () => {
    expect(kocok([], 1)).toEqual([]);
    expect(kocok(["x"], 1)).toEqual(["x"]);
  });

  it("setiap posisi sama mungkinnya: opsi benar di 4.000 pemain tersebar rata", () => {
    const posisi = [0, 0, 0, 0];
    for (let p = 0; p < 4000; p++) posisi[kocok(["benar", "b", "c", "d"], benih("ruang-1", `p-${p}`, "K-13")).indexOf("benar")]++;
    for (const n of posisi) {
      expect(n).toBeGreaterThan(880);
      expect(n).toBeLessThan(1120);
    }
  });

  it("urutan pilihan tetap untuk satu pemain dan berbeda antarpemain (JFR-21)", () => {
    const opsi = ["o1", "o2", "o3", "o4"];
    const untuk = (pemainId: string) => kocok(opsi, benih("ruang-1", pemainId, "K-13")).join(",");
    expect(untuk("p-01")).toBe(untuk("p-01"));
    const urutan = new Set(Array.from({ length: 40 }, (_, i) => untuk(`p-${i}`)));
    expect(urutan.size).toBeGreaterThan(10);
  });

  it("pilih mengembalikan unsur larik dan tetap untuk benih sama; larik kosong ditolak", () => {
    expect(asal).toContain(pilih(asal, 5));
    expect(pilih(asal, 5)).toBe(pilih(asal, 5));
    expect(() => pilih([], 1)).toThrow(RangeError);
  });

  it("bulat selalu di dalam batas dan mencapai kedua ujung", () => {
    const terlihat = new Set<number>();
    for (let b = 0; b < 500; b++) {
      const n = bulat(b, 3, 7);
      expect(Number.isInteger(n) && n >= 3 && n <= 7, String(n)).toBe(true);
      terlihat.add(n);
    }
    expect([...terlihat].sort()).toEqual([3, 4, 5, 6, 7]);
    expect(bulat(123, 4, 4)).toBe(4);
  });

  it("bulat menolak batas yang tidak sah", () => {
    expect(() => bulat(1, 5, 4)).toThrow(RangeError);
    expect(() => bulat(1, 0.5, 4)).toThrow(RangeError);
  });
});
