// Aturan nama bersama (spesifikasi JS-14, P-38 dan P-40; AC-13).
import { describe, expect, it } from "vitest";
import { bentukNamaSah, kunciNama, NAMA_BEBAS_MAKS, NAMA_BEBAS_MIN, rapikanNama, sidikNama } from "../../inti/nama";

describe("rapikanNama dan bentukNamaSah (P-38)", () => {
  it("spasi berurutan dirapatkan, spasi di ujung dibuang, dan NFKC diterapkan", () => {
    expect(rapikanNama("  Budi   Santoso ")).toBe("Budi Santoso");
    expect(rapikanNama("Ｂｕｄｉ")).toBe("Budi"); // huruf lebar penuh menjadi huruf biasa
    expect(rapikanNama("Budi\t\nAja")).toBe("Budi Aja");
  });

  it("3–14 karakter berupa huruf A–Z, angka, dan spasi", () => {
    expect([NAMA_BEBAS_MIN, NAMA_BEBAS_MAKS]).toEqual([3, 14]);
    for (const sah of ["Ani", "Budi 07", "Ni Kadek Ayu W", "  Raka  ", "ABC"]) expect(bentukNamaSah(sah), sah).toBe(true);
    for (const tidak of ["", "Al", "Ni Kadek Ayu Wi", "Nur'aini", "Al-Fatih", "Budi!", "Bédi", "😀😀😀", "a.b.c"]) expect(bentukNamaSah(tidak), tidak).toBe(false);
  });
});

describe("kunciNama dan sidikNama (P-40)", () => {
  it("kunci tidak membedakan huruf besar, huruf kecil, dan spasi berlebih", () => {
    expect(kunciNama("  Budi   SANTOSO")).toBe("budi santoso");
    expect(kunciNama("Kancil Jingga")).toBe(kunciNama("kancil  jingga"));
  });

  it("sidik 16 karakter heksadesimal yang tetap untuk kunci yang sama", () => {
    expect(sidikNama("Kancil Jingga")).toBe("60059e1feda9ae00");
    expect(sidikNama(" kancil   JINGGA ")).toBe("60059e1feda9ae00");
    expect(sidikNama("Kancil Biru")).toMatch(/^[0-9a-f]{16}$/);
    expect(sidikNama("Kancil Biru")).not.toBe(sidikNama("Kancil Jingga"));
  });
});
