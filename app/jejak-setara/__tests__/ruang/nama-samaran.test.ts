// Daftar nama samaran bawaan (spesifikasi JS-03, D-1; AC-7).
import { describe, expect, it } from "vitest";
import { HEWAN, NAMA_SAMARAN, WARNA } from "../../../../server/jejak-setara/src/ruang/nama-samaran";

describe("nama samaran (D-1)", () => {
  it("260 nama unik dari 26 hewan dan 10 warna, contoh Design System 3.6 ikut", () => {
    expect([HEWAN.length, WARNA.length, NAMA_SAMARAN.length, new Set(NAMA_SAMARAN).size]).toEqual([26, 10, 260, 260]);
    expect(NAMA_SAMARAN).toEqual(expect.arrayContaining(["Kancil Jingga", "Jalak Biru", "Anoa Hijau"]));
  });

  it("setiap nama 1–24 karakter (batas protokol)", () => {
    for (const n of NAMA_SAMARAN) expect(n.length, n).toBeLessThanOrEqual(24);
    expect(Math.max(...NAMA_SAMARAN.map((n) => n.length))).toBe("Cendrawasih Merah Muda".length);
  });

  it("tanpa warna kulit, hewan ejekan, dan primata", () => {
    const terlarang = ["Hitam", "Putih", "Cokelat", "Coklat", "Sawo", "Kuning", "Babi", "Monyet", "Kera", "Anjing", "Tikus", "Buaya",
      "Kerbau", "Keledai", "Kambing", "Sapi", "Ayam", "Bebek", "Kodok", "Cicak", "Gajah", "Badak", "Beruang", "Kuda", "Ular", "Kadal",
      "Tarsius", "Bekantan", "Orang"];
    for (const n of NAMA_SAMARAN) for (const kata of n.split(" ")) expect(terlarang, n).not.toContain(kata);
  });
});
