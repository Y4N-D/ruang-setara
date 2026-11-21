// Fungsi murni statistik (spesifikasi JS-13, P-5 sampai P-11, P-14, P-17, dan P-18; AC-3, AC-4, AC-7, AC-8).
import { describe, expect, it } from "vitest";
import {
  bacaSaringanStatistik,
  kategoriKesulitan,
  medianDetik,
  nomorKode,
  skemaStatistik,
  susunStatistik,
  tanggalMundur,
  urutStatistik,
  type BarisAgregat,
  type StatistikKejadian,
} from "../../inti/statistik";
import { isiVersiUji } from "./isiUji";

const b = (v: string, o1: string, o2: string | null, n: number, np = 0, pt = 0): BarisAgregat => ({ jenis: 0, v, o1, o2, detik: null, n, np, pt });
const d = (v: string, detik: number, n: number): BarisAgregat => ({ jenis: 1, v, o1: null, o2: null, detik, n, np: null, pt: null });

describe("bacaSaringanStatistik (P-11)", () => {
  const baca = (q: string, admin = true) => bacaSaringanStatistik(new URLSearchParams(q), admin);
  it("menerima saringan sah dan mengabaikan guru untuk akun guru", () => {
    expect(baca("")).toEqual({ dari: null, sampai: null, label: null, guru: null, paket: null });
    expect(baca("dari=10&sampai=20&label=%20ix%20b%20&guru=abc_1&paket=00000000-0000-4000-8000-000000000001")).toEqual({
      dari: 10,
      sampai: 20,
      label: "ix b",
      guru: "abc_1",
      paket: "00000000-0000-4000-8000-000000000001",
    });
    expect(baca("guru=abc", false)?.guru).toBeNull();
  });
  it("menolak parameter yang tidak sah", () => {
    for (const q of ["dari=abc", "dari=20&sampai=20", "dari=30&sampai=20", "sampai=-1", "dari=8640000000000001", `label=${"x".repeat(21)}`, "label=", "guru=a%20b", "paket=p-1"]) expect(baca(q), q).toBeNull();
  });
});

describe("medianDetik (P-6)", () => {
  it("ganjil, genap, seri, dan kosong", () => {
    expect(medianDetik([[30, 1], [45, 1], [100, 1]])).toBe(45);
    expect(medianDetik([[10, 1], [50, 1]])).toBe(30);
    expect(medianDetik([[20, 1], [61, 1]])).toBe(41);
    expect(medianDetik([[5, 3], [9, 1]])).toBe(5);
    expect(medianDetik([[7, 2], [9, 2]])).toBe(8);
    expect(medianDetik([])).toBeNull();
    expect(medianDetik([[4, 0]])).toBeNull();
  });
});

describe("kategoriKesulitan (P-9)", () => {
  it("batas 0,30 dan 0,70 termasuk Sedang", () => {
    expect([0, 0.29, 0.3, 0.5, 0.7, 0.71, 1].map(kategoriKesulitan)).toEqual(["sulit", "sulit", "sedang", "sedang", "sedang", "mudah", "mudah"]);
  });
});

describe("susunStatistik (P-5 sampai P-10, P-14)", () => {
  const versi = [
    { id: "v1", kode: "K-90", nomor: 1, isi_json: isiVersiUji("Antrean v1") },
    { id: "v2", kode: "K-90", nomor: 2, isi_json: isiVersiUji("Antrean v2") },
    { id: "rusak", kode: "K-91", nomor: 1, isi_json: "{" },
  ];
  const hasil = susunStatistik(
    [b("v1", "1a", "2a", 1, 1, 1), b("v1", "1b", "2b", 1, 1, 0), b("v1", "1a", null, 1, 1, 0), b("v1", "1d", "2b", 1), d("v1", 30, 1), d("v1", 45, 1), d("v1", 100, 1), b("v2", "1c", null, 2), b("rusak", "1a", "2a", 5), b("v9", "1a", "2a", 5)],
    versi,
  );
  it("satu baris per versi, urut kode lalu versi turun, versi tanpa isi sah dilewati", () => {
    expect(hasil.map((k) => [k.kode, k.versi, k.judul])).toEqual([
      ["K-90", 2, "Antrean v2"],
      ["K-90", 1, "Antrean v1"],
    ]);
    expect(skemaStatistik.safeParse({ cakupan: { ruang: 1, pemain: 1, jawaban: 6 }, kejadian: hasil, paket: [] }).success).toBe(true);
  });
  it("angka per versi sesuai definisi", () => {
    const v1 = hasil[1];
    expect(v1).toMatchObject({ dijawab: 4, selesai: 3, benar1: 2, ketepatan1: 50, penuh: 1, indeksKesulitan: 0.33, medianDetik: 45, keliruTerbanyak: "1b", petunjuk: 33.3 });
    expect(v1.pilihan1.map((o) => o.n)).toEqual([2, 1, 0, 1]);
    expect(v1.pilihan2.map((o) => o.n)).toEqual([1, 2, 0]);
    expect(v1.tingkat).toEqual({ tepat: 33.3, kurang: 66.7, berisiko: 0 });
    const v2 = hasil[0];
    expect(v2).toMatchObject({ dijawab: 2, selesai: 0, benar1: 0, ketepatan1: 0, penuh: 0, indeksKesulitan: null, medianDetik: null, keliruTerbanyak: "1c", petunjuk: null });
    expect(v2.tingkat).toEqual({ tepat: null, kurang: null, berisiko: null });
  });
});

describe("urutStatistik (P-18) dan bantuan lain", () => {
  const k = (kode: string, versi: number, indeks: number | null, ketepatan: number | null, dijawab: number) => ({ kode, versi, indeksKesulitan: indeks, ketepatan1: ketepatan, dijawab }) as StatistikKejadian;
  const daftar = [k("K-10", 1, 0.5, 70, 5), k("K-2", 1, null, 40, 9), k("K-10", 2, 0.2, 40, 9), k("K-3", 1, 0.2, 90, 1)];
  const kunci = (xs: StatistikKejadian[]) => xs.map((x) => `${x.kode}v${x.versi}`);
  it("empat urutan dengan aturan seri", () => {
    expect(kunci(urutStatistik(daftar, "kode"))).toEqual(["K-2v1", "K-3v1", "K-10v2", "K-10v1"]);
    expect(kunci(urutStatistik(daftar, "sulit"))).toEqual(["K-3v1", "K-10v2", "K-10v1", "K-2v1"]);
    expect(kunci(urutStatistik(daftar, "ketepatan"))).toEqual(["K-2v1", "K-10v2", "K-10v1", "K-3v1"]);
    expect(kunci(urutStatistik(daftar, "dijawab"))).toEqual(["K-2v1", "K-10v2", "K-10v1", "K-3v1"]);
  });
  it("nomor kode dan tanggal mundur", () => {
    expect([nomorKode("K-13"), nomorKode("K-101"), nomorKode("X")]).toEqual([13, 101, Number.MAX_SAFE_INTEGER]);
    expect(tanggalMundur(2026, 10, 21, 29)).toBe("2026-10-23");
    expect(tanggalMundur(2026, 0, 10, 29)).toBe("2025-12-12");
  });
});
