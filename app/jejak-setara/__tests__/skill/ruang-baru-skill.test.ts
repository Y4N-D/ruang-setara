// Uji skema ruang dengan skill aktif (spesifikasi JS-09, P-8 dan P-9; AC-3). JS-18 (P-7, P-9; AC-2): kini lima skill.
import { describe, expect, it } from "vitest";
import { skemaRingkasanRuang, skemaRuangBaru, skillAktifRuang } from "../../inti/ruang";
import { skemaJawabanRincian } from "../../inti/hasil";

const dasar = { labelKelas: "IX B", paketId: "p", durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, modeNomorAbsen: false, uji: true };
const LIMA = ["lari", "kompas", "petunjuk", "teropong", "angkot"];

describe("skillAktif di permintaan Ruang baru (JS-09 P-8; JS-18 P-7)", () => {
  it("boleh tidak ada, kosong, sebagian, atau kelima skill, termasuk Teropong dan Angkot", () => {
    expect(skemaRuangBaru.safeParse(dasar).success).toBe(true);
    expect(skemaRuangBaru.safeParse({ ...dasar, skillAktif: [] }).success).toBe(true);
    expect(skemaRuangBaru.safeParse({ ...dasar, skillAktif: ["petunjuk", "lari"] }).success).toBe(true);
    expect(skemaRuangBaru.safeParse({ ...dasar, skillAktif: ["teropong"] }).success).toBe(true);
    expect(skemaRuangBaru.safeParse({ ...dasar, skillAktif: ["angkot", "teropong"] }).success).toBe(true);
    expect(skemaRuangBaru.safeParse({ ...dasar, skillAktif: LIMA }).success).toBe(true);
  });
  it("nilai lain, duplikat, lebih dari 5 butir, dan bukan larik ditolak", () => {
    for (const salah of [["lompat"], ["lari", "lari"], ["teropong", "teropong"], "lari", null, {}, [...LIMA, "lari"], ["lari", "kompas", "petunjuk", "lari"]]) {
      expect(skemaRuangBaru.safeParse({ ...dasar, skillAktif: salah }).success, JSON.stringify(salah)).toBe(false);
    }
  });
});

describe("skill aktif dari pengaturan ruang (JS-09 P-8, P-9; JS-18 P-7, P-9)", () => {
  it("urutan P-1, butir yang tidak dikenal dibuang, dan selain larik menjadi kelimanya", () => {
    expect(skillAktifRuang(["petunjuk", "lari"])).toEqual(["lari", "petunjuk"]);
    expect(skillAktifRuang(["angkot", "teropong", "kompas", "lompat"])).toEqual(["kompas", "teropong", "angkot"]);
    expect(skillAktifRuang([])).toEqual([]);
    expect(skillAktifRuang(undefined)).toEqual(LIMA);
    expect(skillAktifRuang("lari")).toEqual(LIMA);
  });
  it("ruang lama yang menyimpan tiga skill P0 tetap tanpa Teropong dan Angkot (P-9)", () => {
    expect(skillAktifRuang(["lari", "kompas", "petunjuk"])).toEqual(["lari", "kompas", "petunjuk"]);
  });
  it("ringkasan ruang membawa sampai lima skill; rincian jawaban membawa tanda Petunjuk", () => {
    const ringkasan = { id: "r", kode: "ABCDE", labelKelas: "IX B", status: "lobi", uji: true, jumlahPeserta: 0, batasPemain: 40, namaGuru: null, dibuatPada: 1 };
    expect(skemaRingkasanRuang.safeParse({ ...ringkasan, skillAktif: ["lari"] }).success).toBe(true);
    expect(skemaRingkasanRuang.safeParse({ ...ringkasan, skillAktif: ["teropong"] }).success).toBe(true);
    expect(skemaRingkasanRuang.safeParse({ ...ringkasan, skillAktif: LIMA }).success).toBe(true);
    expect(skemaRingkasanRuang.safeParse(ringkasan).success).toBe(false);
    expect(skemaRingkasanRuang.safeParse({ ...ringkasan, skillAktif: ["lompat"] }).success).toBe(false);
    expect(skemaJawabanRincian.shape.petunjukDipakai.safeParse(true).success).toBe(true);
  });
});
