// Aturan murni pengaman biaya (spesifikasi JS-22, P-1 sampai P-5, P-15; AC-1 sampai AC-5, AC-11). Jam tiruan.
import { describe, expect, it } from "vitest";
import {
  ALARM_GESER_MS,
  ANGGARAN_ALARM,
  BERULANG_KOSONG,
  bacaPemakaian,
  HAPUS_PAKSA_MS,
  jedaKiriman,
  kirimanHarusBerhenti,
  perkiraanPermintaan,
  periksaBerulang,
  tenggatAman,
  type CatatanBerulang,
} from "../../../../server/jejak-setara/src/ruang/pengaman";

const T = 1_800_000_000_000;

describe("alarm (P-1 sampai P-3)", () => {
  it("tenggat lewat atau kurang dari 1 detik dipasang pada sekarang + 1 detik; tenggat jauh tidak berubah", () => {
    expect(tenggatAman(T - 5000, T)).toBe(T + 1000);
    expect(tenggatAman(T + 500, T)).toBe(T + 1000);
    expect(tenggatAman(T + 90_000, T)).toBe(T + 90_000);
  });

  it("tenggat lewat yang sama dengan alarm tadi: geser pada hitungan kelima, lalu hitungan kembali ke nol", () => {
    let c: CatatanBerulang = BERULANG_KOSONG;
    const tadi = T - 10;
    const hasil: boolean[] = [];
    for (let i = 0; i < 6; i++) {
      const r = periksaBerulang(c, tadi, tadi, T + i * 1000);
      c = r.catatan;
      hasil.push(r.geser);
    }
    expect(hasil).toEqual([false, false, false, false, true, false]);
    expect(ALARM_GESER_MS).toBe(60_000);
  });

  it("tenggat berubah, belum lewat, atau kosong mengembalikan hitungan ke nol", () => {
    const c = { tenggat: T - 10, n: 3 };
    expect(periksaBerulang(c, T - 10, T - 20, T).catatan.n).toBe(0);
    expect(periksaBerulang(c, T - 10, T + 5000, T).catatan.n).toBe(0);
    expect(periksaBerulang(c, T - 10, null, T)).toEqual({
      catatan: { tenggat: null, n: 0 },
      geser: false,
    });
  });

  it("anggaran 200 alarm per ruang (D-1)", () => {
    expect(ANGGARAN_ALARM).toBe(200);
  });
});

describe("kiriman dan penyimpanan (P-4, P-5)", () => {
  it("jeda 30 detik, 1, 2, 4, 8, 16, 32 menit, lalu 60 menit", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 20].map(jedaKiriman)).toEqual([
      30_000, 60_000, 120_000, 240_000, 480_000, 960_000, 1_920_000, 3_600_000,
      3_600_000, 3_600_000,
    ]);
  });

  it("berhenti tepat 24 jam sesudah kegagalan pertama", () => {
    expect(kirimanHarusBerhenti(T, T + 24 * 3_600_000 - 1)).toBe(false);
    expect(kirimanHarusBerhenti(T, T + 24 * 3_600_000)).toBe(true);
  });

  it("penghapusan paksa 7 hari", () => {
    expect(HAPUS_PAKSA_MS).toBe(7 * 24 * 3_600_000);
  });
});

describe("pemakaian (P-15)", () => {
  it("perkiraan permintaan Durable Object dan pembacaan JSON yang rusak", () => {
    const p = {
      sambungan: 41,
      pesanMasuk: 30_001,
      alarm: 9,
      barisSqlite: 4000,
      barisD1: 900,
      internal: 12,
    };
    expect(perkiraanPermintaan(p)).toBe(41 + 1501 + 9 + 12);
    expect(bacaPemakaian({ ...p, alarm: -3, barisD1: "x" })).toEqual({
      ...p,
      alarm: 0,
      barisD1: 0,
    });
    expect(bacaPemakaian(null)).toEqual({
      sambungan: 0,
      pesanMasuk: 0,
      alarm: 0,
      barisSqlite: 0,
      barisD1: 0,
      internal: 0,
    });
  });
});
