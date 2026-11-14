// Skema API akun dan aturan isi (spesifikasi JS-04, P-11, P-16, P-19, P-22 sampai P-28; AC-5, AC-6, AC-8).
import { describe, expect, it } from "vitest";
import {
  EMAIL_MAKS,
  emailSah,
  masukanMasukSah,
  NAMA_MAKS,
  namaSah,
  normalkanEmail,
  normalkanNama,
  panjangSandi,
  periksaSandiBaru,
  SANDI_MAKS,
  SANDI_MIN,
  skemaAdminAwal,
  skemaAkun,
  skemaAkunBaru,
  skemaDaftarAkun,
  skemaDasbor,
  skemaGalat,
  skemaGantiSandi,
  skemaHasilAdminAwal,
  skemaJawabanAkun,
  skemaJawabanSaya,
  skemaMasuk,
  skemaSaya,
  skemaUbahAkun,
} from "../../inti/akun";

const lolos = (skema: { safeParse(x: unknown): { success: boolean } }, isi: unknown) => skema.safeParse(isi).success;

const SAYA = { id: "u1", email: "guru@sekolah.sch.id", namaTampilan: "Bu Sari", peran: "guru", peninjau: false, wajibGantiSandi: true };
const AKUN = { ...SAYA, aktif: true, dibuatPada: 1_700_000_000_000, masukTerakhir: null };

describe("konstanta (P-19, P-27)", () => {
  it("batas panjang", () => {
    expect([SANDI_MIN, SANDI_MAKS, NAMA_MAKS, EMAIL_MAKS]).toEqual([12, 128, 40, 254]);
  });
});

describe("skema isi permintaan (semua .strict())", () => {
  it("skemaMasuk", () => {
    expect(lolos(skemaMasuk, { email: "a@b.id", sandi: "x" })).toBe(true);
    expect(lolos(skemaMasuk, { email: "", sandi: "" })).toBe(true); // aturan isi diperiksa terpisah (401, P-11)
    expect(lolos(skemaMasuk, { email: "a@b.id" })).toBe(false);
    expect(lolos(skemaMasuk, { email: "a@b.id", sandi: 12 })).toBe(false);
    expect(lolos(skemaMasuk, { email: "a@b.id", sandi: "x", ingat: true })).toBe(false);
    expect(lolos(skemaMasuk, null)).toBe(false);
    expect(lolos(skemaMasuk, ["a@b.id", "x"])).toBe(false);
  });

  it("skemaGantiSandi: sandiLama boleh tidak ada (mode wajib)", () => {
    expect(lolos(skemaGantiSandi, { sandiBaru: "x" })).toBe(true);
    expect(lolos(skemaGantiSandi, { sandiLama: "a", sandiBaru: "b" })).toBe(true);
    expect(lolos(skemaGantiSandi, { sandiLama: "a" })).toBe(false);
    expect(lolos(skemaGantiSandi, { sandiBaru: "b", ulangi: "b" })).toBe(false);
    expect(lolos(skemaGantiSandi, { sandiLama: null, sandiBaru: "b" })).toBe(false);
  });

  it("skemaAkunBaru: empat kolom wajib; peran admin atau guru; peninjau boolean", () => {
    const isi = { email: "a@b.id", namaTampilan: "Bu Sari", peran: "guru", peninjau: false };
    expect(lolos(skemaAkunBaru, isi)).toBe(true);
    expect(lolos(skemaAkunBaru, { ...isi, peran: "admin", peninjau: true })).toBe(true);
    expect(lolos(skemaAkunBaru, { ...isi, peran: "siswa" })).toBe(false);
    expect(lolos(skemaAkunBaru, { ...isi, peninjau: 1 })).toBe(false);
    expect(lolos(skemaAkunBaru, { email: "a@b.id", namaTampilan: "Bu Sari", peran: "guru" })).toBe(false);
    expect(lolos(skemaAkunBaru, { ...isi, sandi: "rahasia" })).toBe(false);
  });

  it("skemaUbahAkun: sedikitnya satu kolom; aturUlangSandi hanya true", () => {
    expect(lolos(skemaUbahAkun, { namaTampilan: "Pak Budi" })).toBe(true);
    expect(lolos(skemaUbahAkun, { peran: "admin" })).toBe(true);
    expect(lolos(skemaUbahAkun, { peninjau: true })).toBe(true);
    expect(lolos(skemaUbahAkun, { aktif: false })).toBe(true);
    expect(lolos(skemaUbahAkun, { aturUlangSandi: true })).toBe(true);
    expect(lolos(skemaUbahAkun, { namaTampilan: "A", peran: "guru", peninjau: false, aktif: true })).toBe(true);
    expect(lolos(skemaUbahAkun, {})).toBe(false);
    expect(lolos(skemaUbahAkun, { aturUlangSandi: false })).toBe(false);
    expect(lolos(skemaUbahAkun, { email: "baru@b.id" })).toBe(false);
    expect(lolos(skemaUbahAkun, { peran: "kepala" })).toBe(false);
  });

  it("skemaAdminAwal", () => {
    expect(lolos(skemaAdminAwal, { email: "a@b.id", sandi: "x", namaTampilan: "Admin" })).toBe(true);
    expect(lolos(skemaAdminAwal, { email: "a@b.id", sandi: "x" })).toBe(false);
    expect(lolos(skemaAdminAwal, { email: "a@b.id", sandi: "x", namaTampilan: "Admin", peran: "admin" })).toBe(false);
  });
});

describe("skema jawaban server", () => {
  it("skemaSaya dan skemaAkun", () => {
    expect(lolos(skemaSaya, SAYA)).toBe(true);
    expect(lolos(skemaSaya, { ...SAYA, peran: "siswa" })).toBe(false);
    expect(lolos(skemaAkun, AKUN)).toBe(true);
    expect(lolos(skemaAkun, { ...AKUN, masukTerakhir: 1_700_000_000_001 })).toBe(true);
    expect(lolos(skemaAkun, { ...AKUN, aktif: undefined })).toBe(false);
  });

  it("skemaJawabanSaya: masuk salah tanpa akun, atau masuk benar dengan akun", () => {
    expect(lolos(skemaJawabanSaya, { masuk: false })).toBe(true);
    expect(lolos(skemaJawabanSaya, { masuk: true, akun: SAYA })).toBe(true);
    expect(lolos(skemaJawabanSaya, { masuk: true })).toBe(false);
  });

  it("daftar, akun, dasbor, admin awal, dan galat", () => {
    expect(lolos(skemaDaftarAkun, { akun: [AKUN, AKUN] })).toBe(true);
    expect(lolos(skemaJawabanAkun, { akun: AKUN, sandiSementara: "K7QM-4TZP-H2XC-9RWE" })).toBe(true);
    expect(lolos(skemaJawabanAkun, { akun: AKUN })).toBe(true);
    expect(lolos(skemaDasbor, { rujukanBelum: 23 })).toBe(true);
    expect(lolos(skemaDasbor, { rujukanBelum: -1 })).toBe(false);
    expect(lolos(skemaDasbor, { rujukanBelum: 2.5 })).toBe(false);
    expect(lolos(skemaHasilAdminAwal, { hasil: "dibuat" })).toBe(true);
    expect(lolos(skemaHasilAdminAwal, { hasil: "dipulihkan" })).toBe(true);
    expect(lolos(skemaHasilAdminAwal, { hasil: "lain" })).toBe(false);
    expect(lolos(skemaGalat, { galat: { kode: "MASUK_SALAH", pesan: "Email atau sandi salah." } })).toBe(true);
    expect(lolos(skemaGalat, { galat: "MASUK_SALAH" })).toBe(false);
  });
});

describe("email dan nama (P-27)", () => {
  it("email dipangkas dan diubah ke huruf kecil", () => {
    expect(normalkanEmail("  Guru.Sari@Sekolah.SCH.ID \n")).toBe("guru.sari@sekolah.sch.id");
  });

  it("bentuk nama@domain.akhiran tanpa spasi, paling panjang 254 karakter", () => {
    for (const e of ["a@b.id", "guru.sari@sekolah.sch.id", "x+1@contoh.co.id"]) expect(emailSah(e)).toBe(true);
    for (const e of ["", "guru", "guru@", "@sekolah.id", "guru@sekolah", "guru sari@sekolah.id", "guru@seko lah.id", "a@@b.id"]) expect(emailSah(e)).toBe(false);
    const panjang = (n: number) => "a".repeat(n - "@b.id".length) + "@b.id";
    expect(emailSah(panjang(254))).toBe(true);
    expect(emailSah(panjang(255))).toBe(false);
  });

  it("nama 1 sampai 40 titik kode tanpa karakter kendali", () => {
    expect(normalkanNama("  Bu Sari  ")).toBe("Bu Sari");
    expect(namaSah("B")).toBe(true);
    expect(namaSah("x".repeat(40))).toBe(true);
    expect(namaSah("😀".repeat(40))).toBe(true); // 80 satuan UTF-16, 40 titik kode
    expect(namaSah("x".repeat(41))).toBe(false);
    expect(namaSah("")).toBe(false);
    for (const c of ["\u0000", "\n", "\t", "\u007f", "\u0085"]) expect(namaSah(`Bu${c}Sari`)).toBe(false);
  });
});

describe("aturan sandi baru (P-19)", () => {
  const huruf = (c: string, n: number) => c.repeat(n);

  it("batas 11, 12, 128, dan 129 titik kode sesudah NFC, termasuk huruf beraksen dan emoji", () => {
    for (const c of ["a", "é", "😀"]) {
      expect(periksaSandiBaru(huruf(c, 11), null)).toBe("SANDI_PENDEK");
      expect(periksaSandiBaru(huruf(c, 12), null)).toBeNull();
      expect(periksaSandiBaru(huruf(c, 128), null)).toBeNull();
      expect(periksaSandiBaru(huruf(c, 129), null)).toBe("SANDI_PANJANG");
    }
  });

  it("dihitung sesudah NFC: 12 huruf é terurai (24 titik kode sebelum NFC) tetap 12", () => {
    const terurai = huruf("é", 12);
    expect([...terurai].length).toBe(24);
    expect(panjangSandi(terurai)).toBe(12);
    expect(periksaSandiBaru(terurai, null)).toBeNull();
    expect(periksaSandiBaru(huruf("é", 11), null)).toBe("SANDI_PENDEK");
    expect(periksaSandiBaru(huruf("é", 129), null)).toBe("SANDI_PANJANG");
  });

  it("tidak sama dengan email tanpa membedakan huruf besar-kecil", () => {
    expect(periksaSandiBaru("guru.sari@sekolah.sch.id", "guru.sari@sekolah.sch.id")).toBe("SANDI_SAMA_EMAIL");
    expect(periksaSandiBaru("GURU.Sari@Sekolah.sch.id", "guru.sari@sekolah.sch.id")).toBe("SANDI_SAMA_EMAIL");
    expect(periksaSandiBaru("guru.sari@sekolah.sch.id!", "guru.sari@sekolah.sch.id")).toBeNull();
    // Admin awal: tanpa aturan email (P-28).
    expect(periksaSandiBaru("guru.sari@sekolah.sch.id", null)).toBeNull();
  });

  it("tidak ada aturan komposisi lain", () => {
    expect(periksaSandiBaru("aaaaaaaaaaaa", "x@y.id")).toBeNull();
    expect(periksaSandiBaru("sepeda biru di pagi hari", "x@y.id")).toBeNull();
  });
});

describe("isi masuk yang layak dihash (P-11 langkah 2)", () => {
  it("email sah dan sandi 1 sampai 128 karakter", () => {
    expect(masukanMasukSah("a@b.id", "x")).toBe(true);
    expect(masukanMasukSah("a@b.id", "😀".repeat(128))).toBe(true);
    expect(masukanMasukSah("a@b.id", "")).toBe(false);
    expect(masukanMasukSah("a@b.id", "x".repeat(129))).toBe(false);
    expect(masukanMasukSah("bukan-email", "sandi-yang-benar")).toBe(false);
  });
});
