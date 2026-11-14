// Rute hash konsol dan pengalihannya (spesifikasi JS-04, P-37 dan P-38; AC-14).
import { describe, expect, it } from "vitest";
import { bacaRute, keHash, menuUntuk, RUTE, tujuan, type KeadaanMasuk } from "../../admin/rute";

const keluar: KeadaanMasuk = { masuk: false };
const admin: KeadaanMasuk = { masuk: true, peran: "admin", wajibGantiSandi: false };
const guru: KeadaanMasuk = { masuk: true, peran: "guru", wajibGantiSandi: false };
const wajib = (peran: "admin" | "guru"): KeadaanMasuk => ({ masuk: true, peran, wajibGantiSandi: true });

describe("pembacaan hash", () => {
  it("empat rute", () => {
    expect(RUTE).toEqual(["masuk", "sandi", "dasbor", "akun"]);
    for (const r of RUTE) {
      expect(keHash(r)).toBe(`#/${r}`);
      expect(bacaRute(keHash(r))).toBe(r);
    }
  });

  it.each(["", "#", "#/", "#/ruang", "#/Dasbor", "#dasbor", "#/dasbor/", "#/dasbor?x=1", "/dasbor"])("%j bukan rute yang dikenal", (hash) => {
    expect(bacaRute(hash)).toBeNull();
  });
});

describe("pengalihan (P-37)", () => {
  const SEMUA = ["", "#/masuk", "#/sandi", "#/dasbor", "#/akun", "#/ruang", "#/bank"];

  it("belum masuk: selalu ke halaman masuk", () => {
    for (const hash of SEMUA) expect(tujuan(hash, keluar)).toBe("masuk");
  });

  it("wajib ganti sandi: selalu ke halaman sandi (mode wajib), untuk admin dan guru", () => {
    for (const hash of SEMUA) {
      expect(tujuan(hash, wajib("admin"))).toBe("sandi");
      expect(tujuan(hash, wajib("guru"))).toBe("sandi");
    }
  });

  it("sudah masuk: rute yang diminta; kosong, #/masuk, dan rute yang tidak dikenal menjadi dasbor", () => {
    for (const k of [admin, guru]) {
      expect(tujuan("", k)).toBe("dasbor");
      expect(tujuan("#/masuk", k)).toBe("dasbor");
      expect(tujuan("#/ruang", k)).toBe("dasbor");
      expect(tujuan("#/dasbor", k)).toBe("dasbor");
      expect(tujuan("#/sandi", k)).toBe("sandi");
      expect(tujuan("#/akun", k)).toBe("akun");
    }
  });
});

describe("menu per peran (P-38)", () => {
  it("admin: Dasbor, Akun, Sandi saya; guru tanpa Akun", () => {
    expect(menuUntuk("admin")).toEqual(["dasbor", "akun", "sandi"]);
    expect(menuUntuk("guru")).toEqual(["dasbor", "sandi"]);
  });
});
