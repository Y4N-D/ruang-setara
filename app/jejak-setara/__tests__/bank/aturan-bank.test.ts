// Aturan murni bank kejadian (spesifikasi JS-12, P-2, P-7, P-8, P-14, P-18; AC-1, AC-5, AC-6, AC-9).
import { describe, expect, it } from "vitest";
import { aksiBoleh, bolehSunting, gabungSumber, idRujukanBerikutnya, kodeBerikutnya, kolomDariLetak, type KeadaanKejadian, type PelakuBank } from "../../inti/bank";
import { KUNCI_ASET_DISETUJUI } from "../../inti/konten/kunci-aset";
import { KODE_TEMUAN } from "../../inti/konten/periksa";
import { TEKS_KONSOL } from "../../teks-konsol";
import { kunciAsetDisetujui } from "../konten/naskah-urai";

const ADMIN: PelakuBank = { id: "a", peran: "admin", peninjau: false };
const GURU: PelakuBank = { id: "g", peran: "guru", peninjau: false };
const k = (lain: Partial<KeadaanKejadian>): KeadaanKejadian => ({ status: "draf", pemilikId: "g", pernahTerbit: false, dipakaiRuang: false, adaPerubahan: false, ...lain });

describe("izin dan aksi (P-2, P-14)", () => {
  it("admin menyunting semua kecuali arsip; guru hanya miliknya berstatus Draf atau Siap tinjau; bank awal hanya admin (D-4)", () => {
    expect(bolehSunting(ADMIN, k({ pemilikId: null, status: "terbit" }))).toBe(true);
    expect(bolehSunting(ADMIN, k({ status: "arsip" }))).toBe(false);
    expect(bolehSunting(GURU, k({}))).toBe(true);
    expect(bolehSunting(GURU, k({ status: "tinjau" }))).toBe(true);
    expect(bolehSunting(GURU, k({ status: "terbit" }))).toBe(false);
    expect(bolehSunting(GURU, k({ pemilikId: null }))).toBe(false);
    expect(bolehSunting(GURU, k({ pemilikId: "lain" }))).toBe(false);
  });

  it("tabel aksi per status untuk admin", () => {
    expect(aksiBoleh(ADMIN, k({}))).toEqual(["ajukan", "terbitkan", "arsipkan", "hapus"]);
    expect(aksiBoleh(ADMIN, k({ status: "tinjau", pemilikId: null }))).toEqual(["kembalikan", "terbitkan", "arsipkan", "hapus"]);
    expect(aksiBoleh(ADMIN, k({ status: "terbit", pernahTerbit: true }))).toEqual(["arsipkan"]);
    expect(aksiBoleh(ADMIN, k({ status: "terbit", pernahTerbit: true, adaPerubahan: true }))).toEqual(["terbitkan", "arsipkan"]);
    expect(aksiBoleh(ADMIN, k({ status: "arsip", pernahTerbit: true }))).toEqual(["pulihkan"]);
    expect(aksiBoleh(ADMIN, k({ status: "tinjau", dipakaiRuang: true }))).toEqual(["kembalikan", "terbitkan", "arsipkan"]);
  });

  it("guru: ajukan dan hapus miliknya saja; tidak pernah terbitkan, arsipkan, kembalikan, atau pulihkan", () => {
    expect(aksiBoleh(GURU, k({}))).toEqual(["ajukan", "hapus"]);
    expect(aksiBoleh(GURU, k({ status: "tinjau" }))).toEqual(["hapus"]);
    expect(aksiBoleh(GURU, k({ pemilikId: null, status: "tinjau" }))).toEqual([]);
    expect(aksiBoleh(GURU, k({ status: "arsip" }))).toEqual([]);
  });
});

describe("bantuan (P-7, P-8, P-18)", () => {
  it("kode dan id berikutnya, sedikitnya dua angka", () => {
    expect(kodeBerikutnya(["K-01", "K-16", "K-09"])).toBe("K-17");
    expect(kodeBerikutnya([])).toBe("K-01");
    expect(kodeBerikutnya(["K-99"])).toBe("K-100");
    expect(idRujukanBerikutnya(["JR-01", "JR-23"])).toBe("JR-24");
  });

  it("letak temuan menjadi kunci kolom, dan sumber satu alamat per baris", () => {
    expect(kolomDariLetak("K-03/langkah1.opsi.2.teks")).toBe("langkah1.opsi.2.teks");
    expect(kolomDariLetak("K-03")).toBe("");
    expect(gabungSumber(" https://a.go.id/1 \n\nhttps://b.go.id/2\r\n")).toBe("https://a.go.id/1 · https://b.go.id/2");
  });

  it("ke-27 kode temuan punya kalimat konsol (Permintaan A-7)", () => {
    expect(KODE_TEMUAN).toHaveLength(27);
    expect(Object.keys(TEKS_KONSOL.temuan).sort()).toEqual([...KODE_TEMUAN].sort());
  });

  it("daftar kunci aset server sama dengan berkas aset dan kredit Disetujui", () => {
    expect([...KUNCI_ASET_DISETUJUI].sort()).toEqual([...kunciAsetDisetujui()].sort());
  });
});
