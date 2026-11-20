// Rute hash konsol dan pengalihannya (spesifikasi JS-04, P-37 dan P-38, AC-14; JS-10, P-1, AC-1; JS-11, P-16, AC-12).
import { describe, expect, it } from "vitest";
import { bacaRute, keHash, menuUntuk, RUTE, tujuan, type KeadaanMasuk } from "../../admin/rute";

const keluar: KeadaanMasuk = { masuk: false };
const admin: KeadaanMasuk = { masuk: true, peran: "admin", wajibGantiSandi: false };
const guru: KeadaanMasuk = { masuk: true, peran: "guru", wajibGantiSandi: false };
const wajib = (peran: "admin" | "guru"): KeadaanMasuk => ({ masuk: true, peran, wajibGantiSandi: true });
const ID = "0b2f6a9e-1c3d-4e5f-8a7b-9c0d1e2f3a4b";

describe("pembacaan hash", () => {
  it("rute tanpa id, detail ruang, dan layar kelas", () => {
    expect(RUTE).toEqual(["masuk", "sandi", "dasbor", "ruang", "kejadian", "rujukan", "paket", "akun", "kelas"]);
    for (const r of RUTE.filter((x) => x !== "kelas")) {
      expect(keHash(r)).toBe(`#/${r}`);
      expect(bacaRute(keHash(r))).toEqual({ rute: r, id: null });
    }
    expect(bacaRute(`#/ruang/${ID}`)).toEqual({ rute: "ruang", id: ID });
    expect(bacaRute(`#/kelas/${ID}`)).toEqual({ rute: "kelas", id: ID });
    // JS-12 (P-3)
    expect(bacaRute("#/kejadian/K-07")).toEqual({ rute: "kejadian", id: "K-07" });
    expect(bacaRute("#/kejadian/baru")).toEqual({ rute: "kejadian", id: "baru" });
    expect(bacaRute(`#/paket/${ID}`)).toEqual({ rute: "paket", id: ID });
    for (const salah of ["#/kejadian/K-7", `#/kejadian/${ID}`, "#/paket/K-07", "#/rujukan/JR-01", "#/ruang/baru", "#/paket/baru"]) expect(bacaRute(salah), salah).toBeNull();
    expect(keHash("kelas", ID)).toBe(`#/kelas/${ID}`);
  });

  it("JS-11 (P-16): #/ruang/riwayat dikenali; id riwayat hanya berlaku untuk rute ruang", () => {
    expect(bacaRute("#/ruang/riwayat")).toEqual({ rute: "ruang", id: "riwayat" });
    expect(keHash("ruang", "riwayat")).toBe("#/ruang/riwayat");
    expect(tujuan("#/ruang/riwayat", guru)).toEqual({ rute: "ruang", id: "riwayat" });
    for (const salah of ["#/kelas/riwayat", "#/paket/riwayat", "#/kejadian/riwayat", "#/dasbor/riwayat", "#/ruang/Riwayat", "#/ruang/riwayat/"]) expect(bacaRute(salah), salah).toBeNull();
  });

  it.each(["", "#", "#/", "#/bank", "#/Dasbor", "#dasbor", "#/dasbor/", "#/dasbor?x=1", "/dasbor", "#/kelas", `#/akun/${ID}`, "#/ruang/bukan-id", `#/ruang/${ID.toUpperCase()}`])(
    "%j bukan rute yang dikenal",
    (hash) => {
      expect(bacaRute(hash)).toBeNull();
    },
  );
});

describe("pengalihan (P-37)", () => {
  const SEMUA = ["", "#/masuk", "#/sandi", "#/dasbor", "#/akun", "#/ruang", "#/bank", `#/kelas/${ID}`];

  it("belum masuk: selalu ke halaman masuk", () => {
    for (const hash of SEMUA) expect(tujuan(hash, keluar)).toEqual({ rute: "masuk", id: null });
  });

  it("wajib ganti sandi: selalu ke halaman sandi (mode wajib), untuk admin dan guru", () => {
    for (const hash of SEMUA) {
      expect(tujuan(hash, wajib("admin"))).toEqual({ rute: "sandi", id: null });
      expect(tujuan(hash, wajib("guru"))).toEqual({ rute: "sandi", id: null });
    }
  });

  it("sudah masuk: rute yang diminta tetap, termasuk hash layar kelas; kosong, #/masuk, dan rute yang tidak dikenal menjadi dasbor", () => {
    for (const k of [admin, guru]) {
      expect(tujuan("", k)).toEqual({ rute: "dasbor", id: null });
      expect(tujuan("#/masuk", k)).toEqual({ rute: "dasbor", id: null });
      expect(tujuan("#/bank", k)).toEqual({ rute: "dasbor", id: null });
      expect(tujuan("#/ruang", k)).toEqual({ rute: "ruang", id: null });
      expect(tujuan(`#/kelas/${ID}`, k)).toEqual({ rute: "kelas", id: ID });
      expect(tujuan("#/sandi", k)).toEqual({ rute: "sandi", id: null });
      expect(tujuan("#/akun", k)).toEqual({ rute: "akun", id: null });
    }
  });
});

describe("menu per peran (JS-04 P-38; JS-10 P-1)", () => {
  it("admin: Dasbor, Ruang, Akun, Sandi saya; guru tanpa Akun", () => {
    expect(menuUntuk("admin")).toEqual(["dasbor", "ruang", "kejadian", "rujukan", "paket", "akun", "sandi"]);
    expect(menuUntuk("guru")).toEqual(["dasbor", "ruang", "kejadian", "rujukan", "sandi"]);
  });
});
