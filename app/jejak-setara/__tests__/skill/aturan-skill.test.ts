// Uji aturan inti skill JS-09 (spesifikasi JS-09, P-1 sampai P-5; AC-1).
import { describe, expect, it } from "vitest";
import {
  bolehPakaiSkill,
  jarakRuas,
  kompasTiba,
  kotakDilewati,
  lariBerlaku,
  pakaiSkill,
  sasaranKompas,
  SKILL_KOTAK,
  SKILL_P0,
  tambahMuatanKompas,
  TOLERANSI_LARI_MS,
} from "../../inti/aturan";
import type { KeadaanSkill } from "../../inti/tipe";

const keadaan = (muatan: Partial<KeadaanSkill["muatan"]> = {}): KeadaanSkill => ({
  muatan: { lari: 0, kompas: 0, petunjuk: 0, teropong: 0, angkot: 0, ...muatan },
  aktifSampaiMs: {},
  terakhirPakaiMs: {},
});

describe("skill P0 dan isi kotak (P-1)", () => {
  it("urutan tampil dan pemetaan jenis kotak", () => {
    expect(SKILL_P0).toEqual(["lari", "kompas", "petunjuk"]);
    expect(SKILL_KOTAK).toEqual({ sepatu: "lari", kompas: "kompas", buku: "petunjuk", teropong: "teropong", karcis: "angkot" });
  });
});

describe("kotak yang dilewati (P-3)", () => {
  // Kotak di ubin (10, 5): pusatnya (168, 88).
  const kotak = { x: 10, y: 5 };
  it("ruas yang lewat paling jauh 12 piksel dari pusat ubin mengambil kotak", () => {
    expect(kotakDilewati({ x: 140, y: 100 }, { x: 200, y: 100 }, kotak)).toBe(true); // tepat 12 piksel
    expect(kotakDilewati({ x: 140, y: 100.01 }, { x: 200, y: 100.01 }, kotak)).toBe(false); // 12,01 piksel
    expect(kotakDilewati({ x: 168, y: 60 }, { x: 168, y: 120 }, kotak)).toBe(true); // tepat melintasi pusat
  });
  it("jarak diukur ke ruas, bukan ke ujungnya saja", () => {
    // Kedua ujung lebih dari 12 piksel dari pusat, tetapi ruasnya lewat di atas pusat.
    expect(jarakRuas({ x: 150, y: 88 }, { x: 186, y: 88 }, { x: 168, y: 88 })).toBe(0);
    expect(kotakDilewati({ x: 150, y: 88 }, { x: 186, y: 88 }, kotak)).toBe(true);
    // Ruas yang berhenti sebelum kotak: jarak ke ujung terdekat.
    expect(jarakRuas({ x: 100, y: 88 }, { x: 150, y: 88 }, { x: 168, y: 88 })).toBe(18);
  });
  it("ruas sepanjang 0 diperlakukan sebagai titik", () => {
    expect(jarakRuas({ x: 170, y: 90 }, { x: 170, y: 90 }, { x: 168, y: 88 })).toBeCloseTo(Math.SQRT2 * 2, 10);
    expect(kotakDilewati({ x: 176, y: 96 }, { x: 176, y: 96 }, kotak)).toBe(true);
    expect(kotakDilewati({ x: 180, y: 100 }, { x: 180, y: 100 }, kotak)).toBe(false);
  });
});

describe("toleransi akhir Lari cepat (P-4)", () => {
  it("berlaku sampai 500 ms sesudah masa aktif", () => {
    expect(TOLERANSI_LARI_MS).toBe(500);
    expect(lariBerlaku(10_000, 9_000)).toBe(true);
    expect(lariBerlaku(10_000, 10_500)).toBe(true);
    expect(lariBerlaku(10_000, 10_501)).toBe(false);
    expect(lariBerlaku(undefined, 0)).toBe(false);
  });
});

describe("sasaran dan tiba Kompas (P-5)", () => {
  const daftar = [
    { kode: "K-03", selesai: false, titik: [{ id: "t-z1-02", x: 20, y: 10 }] },
    { kode: "K-01", selesai: true, titik: [{ id: "t-z1-01", x: 11, y: 10 }] },
    { kode: "K-02", selesai: false, titik: [{ id: "t-z2-05", x: 30, y: 10 }, { id: "t-z2-01", x: 14, y: 10 }] },
  ];
  it("titik terdekat dari kejadian yang belum selesai, termasuk titik kedua", () => {
    // Pemain di ubin (10, 10): K-01 lebih dekat tetapi sudah selesai; titik kedua K-02 (14, 10) lebih dekat dari K-03.
    expect(sasaranKompas({ x: 168, y: 168 }, daftar)).toEqual({ kode: "K-02", titikId: "t-z2-01", x: 14, y: 10 });
  });
  it("seri diputus kode kejadian, lalu id titik", () => {
    const seri = [
      { kode: "K-05", selesai: false, titik: [{ id: "t-b", x: 12, y: 10 }] },
      { kode: "K-04", selesai: false, titik: [{ id: "t-c", x: 8, y: 10 }, { id: "t-a", x: 8, y: 10 }] },
    ];
    expect(sasaranKompas({ x: 168, y: 168 }, seri)).toEqual({ kode: "K-04", titikId: "t-a", x: 8, y: 10 });
  });
  it("semua kejadian selesai: tanpa sasaran", () => {
    expect(sasaranKompas({ x: 0, y: 0 }, daftar.map((k) => ({ ...k, selesai: true })))).toBeNull();
    expect(sasaranKompas({ x: 0, y: 0 }, [])).toBeNull();
  });
  it("tiba bila paling jauh 32 piksel dari pusat titik", () => {
    expect(kompasTiba({ x: 168 + 32, y: 88 }, { x: 10, y: 5 })).toBe(true);
    expect(kompasTiba({ x: 168 + 32.01, y: 88 }, { x: 10, y: 5 })).toBe(false);
  });
});

describe("syarat memakai skill tetap seperti JS-02, ditambah D-1a (P-2)", () => {
  const minta = (k: KeadaanSkill, now: number, skill: "lari" | "kompas" | "petunjuk", langkahDialog: 1 | 2 | null = null) => ({
    skill,
    now,
    skillAktif: [...SKILL_P0],
    keadaan: k,
    langkahDialog,
  });
  it("Kompas yang aktif ditolak; sesudah selesai boleh lagi", () => {
    const k = pakaiSkill(minta(keadaan({ kompas: 2 }), 1000, "kompas")).keadaan;
    expect(k.aktifSampaiMs.kompas).toBe(21_000);
    expect(bolehPakaiSkill(minta(k, 20_999, "kompas"))).toBe(false);
    expect(bolehPakaiSkill(minta(k, 21_000, "kompas"))).toBe(true);
  });
  it("Lari cepat yang berakhir lebih awal karena dihapus server boleh dipakai lagi sesudah jeda 2 detik", () => {
    const k = pakaiSkill(minta(keadaan({ lari: 2 }), 1000, "lari")).keadaan;
    const tanpaAktif: KeadaanSkill = { ...k, aktifSampaiMs: {} };
    expect(bolehPakaiSkill(minta(tanpaAktif, 2999, "lari"))).toBe(false);
    expect(bolehPakaiSkill(minta(tanpaAktif, 3000, "lari"))).toBe(true);
  });
  it("pakaiSkill dan tambahMuatanKompas tidak berubah", () => {
    const k = pakaiSkill(minta(keadaan({ petunjuk: 1 }), 5000, "petunjuk", 1)).keadaan;
    expect(k.muatan.petunjuk).toBe(0);
    expect(k.aktifSampaiMs.petunjuk).toBeUndefined();
    expect([0, 1, 2].map(tambahMuatanKompas)).toEqual([1, 2, 2]);
  });
});
