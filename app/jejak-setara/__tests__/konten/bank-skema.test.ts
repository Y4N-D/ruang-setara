// Uji bank awal terhadap skema dan aturan konten (spesifikasi JS-05, P-19 sampai P-25; AC-2 dan AC-6).
import { describe, expect, it } from "vitest";
import { periksaBank } from "../../inti/konten/periksa";
import { skemaBankAwal, VERSI_BANK } from "../../inti/konten/skema";
import { bacaBankAwal, kunciAsetDisetujui } from "./naskah-urai";

const { teks, bank } = bacaBankAwal();
const nomor = (awalan: string, n: number) => Array.from({ length: n }, (_, i) => `${awalan}${String(i + 1).padStart(2, "0")}`);

describe("bank-awal.json", () => {
  it("UTF-8 tanpa BOM, indentasi dua spasi, diakhiri satu baris baru (P-25)", () => {
    expect(teks.charCodeAt(0)).not.toBe(0xfeff);
    expect(teks.replace(/\r\n/g, "\n")).toBe(`${JSON.stringify(JSON.parse(teks), null, 2)}\n`);
  });

  it("lolos skemaBankAwal tanpa perubahan data (P-1)", () => {
    const hasil = skemaBankAwal.safeParse(bank);
    expect(hasil.success).toBe(true);
    if (hasil.success) expect(hasil.data).toEqual(bank);
  });

  it("periksaBank dengan daftar aset Disetujui: 0 galat dan 0 peringatan (AC-2)", () => {
    expect(periksaBank(bank, { kunciAset: kunciAsetDisetujui() })).toEqual([]);
  });

  it("versi 1, 23 rujukan JR-01 sampai JR-23, 16 kejadian K-01 sampai K-16, 1 paket (P-19)", () => {
    expect(bank.versi).toBe(VERSI_BANK);
    expect(bank.versi).toBe(1);
    expect(bank.rujukan.map((r) => r.id)).toEqual(nomor("JR-", 23));
    expect(bank.kejadian.map((k) => k.kode)).toEqual(nomor("K-", 16));
    expect(bank.paket).toHaveLength(1);
  });

  it("tepat dua kejadian di setiap zona z1–z8 (AC-2)", () => {
    for (const zona of ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]) {
      expect(bank.kejadian.filter((k) => k.zona === zona).map((k) => k.kode), zona).toHaveLength(2);
    }
  });

  it("Paket inti 16 menurut D-3, berisi K-01 sampai K-16 berurutan (P-24)", () => {
    expect(bank.paket[0]).toEqual({
      nama: "Paket inti 16",
      deskripsi: "Enam belas kejadian bank awal, dua di setiap zona.",
      kejadian: nomor("K-", 16),
    });
  });

  it("rujukan tanpa kolom status, dan kata terverifikasi tidak ada di berkas (P-8, P-25, AC-6)", () => {
    for (const r of bank.rujukan) expect(Object.keys(r), r.id).toEqual(["id", "teks", "sumber", "kodeSehari", "catatan"]);
    expect(teks.toLowerCase()).not.toContain("terverifikasi");
  });

  it("urutan kolom setiap kejadian sama dengan IsiKejadian (bagian Data)", () => {
    for (const k of bank.kejadian) {
      expect(Object.keys(k), k.kode).toEqual(["kode", "judul", "zona", "setTokoh", "situasi", "langkah1", "langkah2", "kartu", "topik", "jenis"]);
      expect(Object.keys(k.langkah1), k.kode).toEqual(["pertanyaan", "opsi", "petunjuk"]);
      expect(Object.keys(k.langkah2), k.kode).toEqual(["pertanyaan", "opsi"]);
      expect(Object.keys(k.kartu), k.kode).toEqual(["hak", "kewajiban", "rujukan"]);
      for (const o of k.langkah1.opsi) expect(Object.keys(o), k.kode).toEqual(["id", "teks", "benar", "umpanBalik"]);
      for (const o of k.langkah2.opsi) expect(Object.keys(o), k.kode).toEqual(["id", "teks", "tingkat", "terjadi"]);
    }
    expect(Object.keys(bank)).toEqual(["versi", "rujukan", "kejadian", "paket"]);
    expect(Object.keys(bank.paket[0])).toEqual(["nama", "deskripsi", "kejadian"]);
  });
});
