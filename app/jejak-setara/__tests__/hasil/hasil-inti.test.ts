// Fungsi murni riwayat dan hasil (spesifikasi JS-11, P-17, P-18, P-21, P-23, P-32; AC-13 sampai AC-16, AC-19).
import { describe, expect, it } from "vitest";
import {
  bacaSaringanRiwayat,
  formatWaktuSkor,
  labelCocok,
  nomorKode,
  persen,
  rataRata,
  ringkasHasil,
  rondeDimainkan,
  tanggalKeMs,
  urutPeserta,
  type PesertaHasil,
} from "../../inti/hasil";

const ID = "0f8e3c1a-1b2c-4d3e-8f90-123456789abc";
const p = (q: string) => new URLSearchParams(q);

describe("saringan riwayat (P-17)", () => {
  it("parameter sah, termasuk penanda halaman dan batas", () => {
    expect(bacaSaringanRiwayat(p(`dari=10&sampai=20&label=%20ix%20&guru=u-1&batas=5&mulai=15_${ID}`), true)).toEqual({
      dari: 10,
      sampai: 20,
      label: "ix",
      guru: "u-1",
      batas: 5,
      mulai: { dibuatPada: 15, id: ID },
    });
    expect(bacaSaringanRiwayat(p(""), false)).toEqual({ dari: null, sampai: null, label: null, guru: null, batas: 50, mulai: null });
  });

  it("guru diabaikan untuk guru; parameter yang tidak sah ditolak", () => {
    expect(bacaSaringanRiwayat(p("guru=u-1"), false)?.guru).toBeNull();
    for (const q of ["dari=abc", "dari=20&sampai=20", "dari=30&sampai=20", "sampai=-1", `label=${"x".repeat(21)}`, "label=%20%20", "guru=a%20b", "batas=0", "batas=51", "batas=abc", "mulai=12", `mulai=12_${ID.toUpperCase()}`, `dari=${"9".repeat(17)}`]) {
      expect(bacaSaringanRiwayat(p(q), true), q).toBeNull();
    }
  });

  it("ronde dimainkan bila mulai terisi dan tidak sesudah selesai (ruang ditutup saat hitung mundur tidak dimainkan)", () => {
    expect(rondeDimainkan(100, 200)).toBe(true);
    expect(rondeDimainkan(100, 100)).toBe(true);
    expect(rondeDimainkan(300, 200)).toBe(false);
    expect(rondeDimainkan(null, 200)).toBe(false);
    expect(rondeDimainkan(100, null)).toBe(false);
  });
});

const pes = (id: string, lain: Partial<PesertaHasil & { gabungPada: number }>): PesertaHasil & { gabungPada: number } => ({
  id,
  nama: id,
  nomorAbsen: null,
  dikeluarkan: false,
  peringkat: 1,
  skor: 0,
  selesai: 0,
  langkah1Dijawab: 0,
  langkah1Benar: 0,
  tepat: 0,
  kurang: 0,
  berisiko: 0,
  waktuSkorMs: null,
  gabungPada: 0,
  ...lain,
});

describe("ringkasan dan urutan hasil (P-21)", () => {
  it("persen dan rata-rata satu angka di belakang koma; null tanpa penyebut", () => {
    expect(persen(2, 3)).toBe(66.7);
    expect(persen(0, 0)).toBeNull();
    expect(rataRata(10, 4)).toBe(2.5);
    expect(rataRata(5, 0)).toBeNull();
  });

  it("ringkasan dari peserta yang tidak dikeluarkan", () => {
    const r = ringkasHasil([
      pes("a", { skor: 100, langkah1Dijawab: 2, langkah1Benar: 2, tepat: 1, kurang: 1 }),
      pes("b", { skor: 40, langkah1Dijawab: 1, langkah1Benar: 0, berisiko: 1 }),
      pes("c", { dikeluarkan: true, peringkat: null, skor: 500, langkah1Dijawab: 5, langkah1Benar: 5, tepat: 5 }),
    ]);
    expect(r).toEqual({ jumlahPemain: 2, dikeluarkan: 1, rataSkor: 70, ketepatan1: 66.7, tingkat: { tepat: 33.3, kurang: 33.3, berisiko: 33.3 } });
    expect(ringkasHasil([])).toEqual({ jumlahPemain: 0, dikeluarkan: 0, rataSkor: null, ketepatan1: null, tingkat: { tepat: null, kurang: null, berisiko: null } });
  });

  it("urutan: peringkat, lalu tanpa peringkat menurut waktu bergabung, lalu yang dikeluarkan menurut waktu bergabung", () => {
    const urut = urutPeserta([
      pes("x", { dikeluarkan: true, peringkat: null, gabungPada: 1 }),
      pes("c", { peringkat: 2, gabungPada: 9 }),
      pes("t", { peringkat: null, gabungPada: 5 }),
      pes("a", { peringkat: 1, gabungPada: 8 }),
      pes("w", { dikeluarkan: true, peringkat: null, gabungPada: 0 }),
      pes("b", { peringkat: 2, gabungPada: 3 }),
    ]);
    expect(urut.map((x) => x.id)).toEqual(["a", "b", "c", "t", "w", "x"]);
  });

  it("nomor kode kejadian untuk urutan rincian", () => {
    expect(nomorKode("K-2")).toBeLessThan(nomorKode("K-10"));
    expect(nomorKode("lain")).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe("tampilan konsol (P-18, P-23, P-32)", () => {
  it("waktu skor m:ss", () => {
    expect(formatWaktuSkor(0)).toBe("0:00");
    expect(formatWaktuSkor(754_999)).toBe("12:34");
    expect(formatWaktuSkor(null)).toBeNull();
  });

  it("tanggal saringan menjadi pukul 00.00 menurut zona waktu peramban; sampai tanggal menjadi hari berikutnya", () => {
    expect(tanggalKeMs("2026-11-20")).toBe(new Date(2026, 10, 20).getTime());
    expect(tanggalKeMs("2026-11-30", true)).toBe(new Date(2026, 11, 1).getTime());
    expect(tanggalKeMs("20-11-2026")).toBeNull();
  });

  it("label konfirmasi hapus cocok sesudah dipangkas, tanpa membedakan huruf besar dan kecil", () => {
    expect(labelCocok("  ix b ", "IX B")).toBe(true);
    expect(labelCocok("IX", "IX B")).toBe(false);
    expect(labelCocok("", "IX B")).toBe(false);
  });
});
