// Tabel izin dan penjaga (spesifikasi JS-04, P-17, P-20, P-21; AC-7).
import { describe, expect, it } from "vitest";
import { boleh, IZIN, peranBoleh, STATUS_PENJAGA, type Aksi, type PemegangIzin } from "../../../../server/jejak-setara/src/auth/izin";

const AKSI: Aksi[] = ["dasbor.lihat", "sandi.sendiri", "akun.kelola"];
const akun = (peran: "admin" | "guru", lain: Partial<PemegangIzin> = {}): PemegangIzin => ({ peran, aktif: true, wajibGantiSandi: false, ...lain });

describe("tabel izin JS-04 (P-20)", () => {
  it("persis tiga aksi", () => {
    expect(IZIN).toEqual({
      "dasbor.lihat": ["admin", "guru"],
      "sandi.sendiri": ["admin", "guru"],
      "akun.kelola": ["admin"],
    });
  });

  it.each([
    ["admin", "dasbor.lihat", true],
    ["admin", "sandi.sendiri", true],
    ["admin", "akun.kelola", true],
    ["guru", "dasbor.lihat", true],
    ["guru", "sandi.sendiri", true],
    ["guru", "akun.kelola", false],
  ] as const)("%s, %s: %s", (peran, aksi, harap) => {
    expect(peranBoleh(peran, aksi)).toBe(harap);
    expect(boleh(akun(peran), aksi).ok).toBe(harap);
  });

  it("tanda Peninjau tidak menambah aksi di JS-04", () => {
    for (const aksi of AKSI) expect(boleh({ ...akun("guru"), peninjau: true } as PemegangIzin, aksi)).toEqual(boleh(akun("guru"), aksi));
  });
});

describe("penjaga (P-17, P-21)", () => {
  it("tanpa akun atau akun nonaktif: PERLU_MASUK (401)", () => {
    for (const aksi of AKSI) {
      expect(boleh(null, aksi)).toEqual({ ok: false, kode: "PERLU_MASUK" });
      expect(boleh(akun("admin", { aktif: false }), aksi)).toEqual({ ok: false, kode: "PERLU_MASUK" });
    }
    expect(STATUS_PENJAGA.PERLU_MASUK).toBe(401);
  });

  it("ganti sandi wajib: hanya sandi.sendiri; lainnya WAJIB_GANTI_SANDI (403)", () => {
    for (const peran of ["admin", "guru"] as const) {
      const wajib = akun(peran, { wajibGantiSandi: true });
      expect(boleh(wajib, "sandi.sendiri")).toEqual({ ok: true });
      expect(boleh(wajib, "dasbor.lihat")).toEqual({ ok: false, kode: "WAJIB_GANTI_SANDI" });
      expect(boleh(wajib, "akun.kelola")).toEqual({ ok: false, kode: "WAJIB_GANTI_SANDI" });
    }
    expect(STATUS_PENJAGA.WAJIB_GANTI_SANDI).toBe(403);
  });

  it("peran tanpa izin: TIDAK_BERWENANG (403)", () => {
    expect(boleh(akun("guru"), "akun.kelola")).toEqual({ ok: false, kode: "TIDAK_BERWENANG" });
    expect(STATUS_PENJAGA.TIDAK_BERWENANG).toBe(403);
  });
});
