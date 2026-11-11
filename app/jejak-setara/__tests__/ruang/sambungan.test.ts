// Batas per sambungan (spesifikasi JS-03, P-16 dan P-17; AC-6).
import { PROTOKOL_VERSI } from "../../inti/versi";
import { describe, expect, it } from "vitest";
import { ambilToken, bacaPesanPemain, catatPelanggaran, panjangUtf8, sambunganBaru } from "../../../../server/jejak-setara/src/ruang/sambungan";

const halo = JSON.stringify({ v: PROTOKOL_VERSI, t: "halo", peran: "pemain" });

describe("ukuran UTF-8", () => {
  it("1, 2, 3, dan 4 byte per karakter", () => {
    expect(panjangUtf8("abc")).toBe(3);
    expect(panjangUtf8("é")).toBe(2);
    expect(panjangUtf8("…")).toBe(3);
    expect(panjangUtf8("😀")).toBe(4);
  });
});

describe("ember token 20 per detik dengan lonjakan 40", () => {
  it("40 pesan langsung boleh, ke-41 ditolak, lalu terisi lagi 20 per detik", () => {
    const k = sambunganBaru(0);
    for (let i = 0; i < 40; i++) expect(ambilToken(k, 0), String(i)).toBe(true);
    expect(ambilToken(k, 0)).toBe(false);
    expect(ambilToken(k, 49)).toBe(false);
    expect(ambilToken(k, 50)).toBe(true);
    let boleh = 0;
    for (let t = 51; t <= 1050; t++) if (ambilToken(k, t)) boleh++;
    expect(boleh).toBe(20);
  });
});

describe("jendela pelanggaran 10 detik", () => {
  it("galat pada pelanggaran ke-3, sekali per jendela; tutup pada ke-10", () => {
    const k = sambunganBaru(0);
    const hasil = Array.from({ length: 10 }, (_, i) => catatPelanggaran(k, i * 100));
    expect(hasil.map((h) => h.kirimGalat)).toEqual([false, false, true, false, false, false, false, false, false, false]);
    expect(hasil.map((h) => h.tutup)).toEqual([false, false, false, false, false, false, false, false, false, true]);
  });

  it("pelanggaran lama di luar jendela tidak dihitung", () => {
    const k = sambunganBaru(0);
    catatPelanggaran(k, 0);
    catatPelanggaran(k, 100);
    expect(catatPelanggaran(k, 10_200)).toEqual({ kirimGalat: false, tutup: false });
  });
});

describe("membaca pesan mentah", () => {
  it("biner, lebih dari 2.048 byte, JSON cacat, dan gagal skema adalah pelanggaran", () => {
    const k = sambunganBaru(0);
    expect(bacaPesanPemain(k, new ArrayBuffer(4), 0).jenis).toBe("pelanggaran");
    expect(bacaPesanPemain(k, JSON.stringify({ v: PROTOKOL_VERSI, t: "ping", tKlien: 1, x: "a".repeat(2100) }), 0).jenis).toBe("pelanggaran");
    expect(bacaPesanPemain(k, "{bukan json", 0).jenis).toBe("pelanggaran");
    expect(bacaPesanPemain(k, JSON.stringify({ v: PROTOKOL_VERSI, t: "terbang" }), 0).jenis).toBe("pelanggaran");
  });

  it("halo dengan versi lain dilaporkan sebagai versi berbeda", () => {
    // Klien versi 1 (sebelum JS-08) dan versi yang lebih baru sama-sama berbeda (JS-08, P-65).
    expect(bacaPesanPemain(sambunganBaru(0), JSON.stringify({ v: 1, t: "halo", peran: "pemain" }), 0).jenis).toBe("versi");
    expect(bacaPesanPemain(sambunganBaru(0), JSON.stringify({ v: PROTOKOL_VERSI + 1, t: "halo", peran: "pemain" }), 0).jenis).toBe("versi");
  });

  it("pesan sah dikembalikan dengan isinya; ember kosong menjadi pelanggaran", () => {
    const k = sambunganBaru(0);
    const hasil = bacaPesanPemain(k, halo, 0);
    expect(hasil).toEqual({ jenis: "sah", pesan: { v: PROTOKOL_VERSI, t: "halo", peran: "pemain" } });
    for (let i = 0; i < 39; i++) bacaPesanPemain(k, halo, 0);
    expect(bacaPesanPemain(k, halo, 0).jenis).toBe("pelanggaran");
  });
});
