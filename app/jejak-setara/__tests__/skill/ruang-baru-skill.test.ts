// Uji skema ruang dengan skill aktif (spesifikasi JS-09, P-8 dan P-9; AC-3).
import { describe, expect, it } from "vitest";
import { skemaRingkasanRuang, skemaRuangBaru, skillAktifRuang } from "../../inti/ruang";
import { skemaJawabanRincian } from "../../inti/hasil";

const dasar = { labelKelas: "IX B", paketId: "p", durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, modeNomorAbsen: false, uji: true };

describe("skillAktif di permintaan Ruang baru (P-8)", () => {
  it("boleh tidak ada, kosong, atau sebagian skill P0", () => {
    expect(skemaRuangBaru.safeParse(dasar).success).toBe(true);
    expect(skemaRuangBaru.safeParse({ ...dasar, skillAktif: [] }).success).toBe(true);
    expect(skemaRuangBaru.safeParse({ ...dasar, skillAktif: ["petunjuk", "lari"] }).success).toBe(true);
  });
  it("Teropong, Angkot, duplikat, dan bukan larik ditolak", () => {
    for (const salah of [["teropong"], ["angkot"], ["lari", "lari"], "lari", null, ["lari", "kompas", "petunjuk", "lari"]]) {
      expect(skemaRuangBaru.safeParse({ ...dasar, skillAktif: salah }).success, JSON.stringify(salah)).toBe(false);
    }
  });
});

describe("skill aktif dari pengaturan ruang (P-8, P-9)", () => {
  it("urutan P-1, butir bukan P0 dibuang, dan selain larik menjadi ketiganya", () => {
    expect(skillAktifRuang(["petunjuk", "lari"])).toEqual(["lari", "petunjuk"]);
    expect(skillAktifRuang(["teropong", "kompas", "angkot"])).toEqual(["kompas"]);
    expect(skillAktifRuang([])).toEqual([]);
    expect(skillAktifRuang(undefined)).toEqual(["lari", "kompas", "petunjuk"]);
    expect(skillAktifRuang("lari")).toEqual(["lari", "kompas", "petunjuk"]);
  });
  it("ringkasan ruang dan rincian jawaban membawa bidang baru", () => {
    const ringkasan = { id: "r", kode: "ABCDE", labelKelas: "IX B", status: "lobi", uji: true, jumlahPeserta: 0, batasPemain: 40, namaGuru: null, dibuatPada: 1 };
    expect(skemaRingkasanRuang.safeParse({ ...ringkasan, skillAktif: ["lari"] }).success).toBe(true);
    expect(skemaRingkasanRuang.safeParse(ringkasan).success).toBe(false);
    expect(skemaRingkasanRuang.safeParse({ ...ringkasan, skillAktif: ["teropong"] }).success).toBe(false);
    expect(skemaJawabanRincian.shape.petunjukDipakai.safeParse(true).success).toBe(true);
  });
});
