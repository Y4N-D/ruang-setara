// Uji pembaca peta dan RLE (spesifikasi JS-02, P-29 sampai P-32; AC-8).
import { describe, expect, it } from "vitest";
import { acakBerbenih } from "../../inti/acak";
import { GalatInti } from "../../inti/aturan";
import { bacaPeta, pikselKeUbin, pusatUbin, selPadat, ubinKePiksel, UKURAN_PETA_MAKS, UKURAN_UBIN, uraiRle } from "../../inti/peta";
import type { PetaJejak } from "../../inti/tipe";

/** Penyandi RLE untuk uji, ditulis terpisah dari pengurainya. */
function rle(nilai: readonly number[]): string {
  let hasil = "";
  for (let i = 0; i < nilai.length; ) {
    let j = i;
    while (j < nilai.length && nilai[j] === nilai[i]) j++;
    hasil += `${nilai[i]}x${j - i};`;
    i = j;
  }
  return hasil;
}

// prettier-ignore
const TABRAKAN = [
  1, 1, 1, 1, 1, 1, 1, 1,
  1, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 1, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 1, 0, 0, 1, 1, 1,
];
const UBIN = TABRAKAN.map((t, i) => (t ? 5 : 12 + (i % 3)));

/** Contoh `kampung.json` kecil (8 × 6 ubin) dengan semua bagian Architecture 11.1.1. */
function contohPeta(): PetaJejak<string> {
  return {
    versi: 1,
    lebar: 8,
    tinggi: 6,
    ukuranUbin: 16,
    ubin: rle(UBIN),
    tabrakan: rle(TABRAKAN),
    objek: [
      { id: "rumah-nara", jenis: "rumah", x: 1, y: 1, arah: "bawah" },
      { id: "pohon-1", jenis: "pohon_kelapa", x: 6, y: 4 },
    ],
    zona: [
      { id: "z1", nama: "Rumah dan gang", kiri: 0, atas: 0, kanan: 3, bawah: 5 },
      { id: "z2", nama: "Sekolah", kiri: 4, atas: 0, kanan: 7, bawah: 5 },
    ],
    titikKejadian: [
      { id: "t-z1-1", zona: "z1", x: 1, y: 3 },
      { id: "t-z2-1", zona: "z2", x: 5, y: 2 },
    ],
    kotak: [{ id: "kotak-1", jenis: "kompas", zona: "z1", x: 2, y: 4 }],
    halte: [{ id: "halte-1", zona: "z2", x: 6, y: 1 }],
    gerbangLobi: { kiri: 3, atas: 5, kanan: 4, bawah: 5 },
    titikMuncul: [
      { x: 3, y: 4 },
      { x: 4, y: 4 },
    ],
  };
}

/** Salinan contoh yang diubah; dipakai untuk kasus cacat. */
function ubah(f: (p: Record<string, unknown> & PetaJejak<string>) => void): unknown {
  const p = JSON.parse(JSON.stringify(contohPeta())) as Record<string, unknown> & PetaJejak<string>;
  f(p);
  return p;
}

describe("uraiRle (P-30)", () => {
  it("mengurai potongan menjadi satu byte per sel", () => {
    expect(Array.from(uraiRle("0x5;1x2;", 7))).toEqual([0, 0, 0, 0, 0, 1, 1]);
    expect(Array.from(uraiRle("255x1;", 1))).toEqual([255]);
    expect(uraiRle("", 0)).toHaveLength(0);
    expect(uraiRle("3x4;", 4)).toBeInstanceOf(Uint8Array);
  });

  it("bolak-balik dengan penyandi untuk larik acak", () => {
    const acak = acakBerbenih(2026);
    for (let n = 0; n < 50; n++) {
      const nilai = Array.from({ length: 1 + Math.floor(acak() * 300) }, () => (acak() < 0.7 ? 0 : Math.floor(acak() * 64)));
      expect(Array.from(uraiRle(rle(nilai), nilai.length))).toEqual(nilai);
    }
  });

  it("menolak teks cacat dan jumlah sel yang tidak cocok dengan galat PETA_CACAT", () => {
    const cacat: [string, number][] = [
      ["0x5;1x2", 7],
      ["0x0;1x7;", 7],
      ["256x1;", 1],
      ["1X2;", 2],
      [" 1x2;", 2],
      ["1x2;;", 2],
      ["ax2;", 2],
      ["-1x2;", 2],
      ["1x2;", 3],
      ["1x5;", 3],
      ["1x2;0x1;", 2],
    ];
    for (const [teks, panjang] of cacat) {
      expect(() => uraiRle(teks, panjang), teks).toThrow("PETA_CACAT");
      expect(() => uraiRle(teks, panjang), teks).toThrow(GalatInti);
    }
  });
});

describe("bacaPeta (P-29, P-32)", () => {
  it("membaca contoh peta sah dan mengurai kedua lapisan", () => {
    const json = contohPeta();
    const peta = bacaPeta(json);
    expect(peta.tabrakan).toBeInstanceOf(Uint8Array);
    expect(Array.from(peta.tabrakan)).toEqual(TABRAKAN);
    expect(Array.from(peta.ubin)).toEqual(UBIN);
    const { ubin, tabrakan, ...sisa } = peta;
    const { ubin: ubinJson, tabrakan: tabrakanJson, ...sisaJson } = json;
    expect([ubin.length, tabrakan.length, typeof ubinJson, typeof tabrakanJson]).toEqual([48, 48, "string", "string"]);
    expect(sisa).toEqual(sisaJson);
    expect(json).toEqual(contohPeta());
  });

  it("menerima peta selebar dan setinggi 512 ubin", () => {
    const besar = ubah((p) => {
      p.lebar = 512;
      p.tinggi = 512;
      p.ubin = "0x262144;";
      p.tabrakan = "0x262144;";
    });
    expect(bacaPeta(besar).tabrakan).toHaveLength(512 * 512);
  });

  const KASUS_CACAT: [string, unknown][] = [
    ["bukan objek", "kampung"],
    ["null", null],
    ["larik", []],
    ["versi 2", ubah((p) => Object.assign(p, { versi: 2 }))],
    ["ukuran ubin 32", ubah((p) => Object.assign(p, { ukuranUbin: 32 }))],
    ["lebar 0", ubah((p) => (p.lebar = 0))],
    ["lebar 513", ubah((p) => (p.lebar = 513))],
    ["lebar pecahan", ubah((p) => (p.lebar = 8.5))],
    ["kunci tambahan di akar", ubah((p) => (p.tambahan = true))],
    ["RLE cacat", ubah((p) => (p.tabrakan = "1x8;0x"))],
    ["jumlah sel salah", ubah((p) => (p.lebar = 7))],
    ["tabrakan bernilai 2", ubah((p) => (p.tabrakan = rle(TABRAKAN.map((t, i) => (i === 9 ? 2 : t)))))],
    ["ubin bernilai 64", ubah((p) => (p.ubin = rle(UBIN.map((u, i) => (i === 9 ? 64 : u)))))],
    ["id zona ganda", ubah((p) => (p.zona[1].id = "z1"))],
    ["id zona di luar z1–z8", ubah((p) => Object.assign(p.zona[1], { id: "z9" }))],
    ["batas zona terbalik", ubah((p) => (p.zona[0].kiri = 4))],
    ["batas zona di luar peta", ubah((p) => (p.zona[1].kanan = 8))],
    ["id titik ganda", ubah((p) => (p.titikKejadian[1].id = "t-z1-1"))],
    ["id kotak sama dengan id titik", ubah((p) => (p.kotak[0].id = "t-z1-1"))],
    ["id halte sama dengan id kotak", ubah((p) => (p.halte[0].id = "kotak-1"))],
    ["id objek ganda", ubah((p) => (p.objek[1].id = "rumah-nara"))],
    ["id berspasi", ubah((p) => (p.titikKejadian[0].id = "t z1"))],
    ["titik di luar peta (x)", ubah((p) => (p.titikKejadian[0].x = 8))],
    ["titik di luar peta (y)", ubah((p) => (p.titikKejadian[0].y = 6))],
    ["koordinat negatif", ubah((p) => (p.halte[0].x = -1))],
    ["koordinat pecahan", ubah((p) => (p.kotak[0].y = 1.5))],
    ["objek di luar peta", ubah((p) => (p.objek[0].x = 9))],
    ["titik muncul di luar peta", ubah((p) => (p.titikMuncul[0].y = 6))],
    ["tanpa titik muncul", ubah((p) => (p.titikMuncul = []))],
    ["kunci tambahan di titik", ubah((p) => Object.assign(p.titikKejadian[0], { lantai: 2 }))],
    ["jenis kotak tidak dikenal", ubah((p) => Object.assign(p.kotak[0], { jenis: "senter" }))],
    ["jenis objek bukan huruf kecil", ubah((p) => (p.objek[0].jenis = "Rumah Besar"))],
    ["titik memakai zona yang tidak ada", ubah((p) => (p.titikKejadian[0].zona = "z3"))],
    ["gerbang lobi terbalik", ubah((p) => (p.gerbangLobi = { kiri: 4, atas: 5, kanan: 3, bawah: 5 }))],
    ["tanpa halte", ubah((p) => Reflect.deleteProperty(p, "halte"))],
  ];

  for (const [nama, nilai] of KASUS_CACAT) {
    it(`menolak ${nama} dengan galat PETA_CACAT`, () => {
      expect(() => bacaPeta(nilai)).toThrow("PETA_CACAT");
      expect(() => bacaPeta(nilai)).toThrow(GalatInti);
    });
  }

  it("peta sintetis 120 × 80 ubin terbaca dan lapisan RLE-nya kecil", () => {
    const lebar = 120;
    const tinggi = 80;
    const tabrakan = new Array<number>(lebar * tinggi).fill(0);
    const isi = (x0: number, y0: number, w: number, h: number) => {
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) tabrakan[y * lebar + x] = 1;
    };
    isi(0, 0, lebar, 1);
    isi(0, tinggi - 1, lebar, 1);
    isi(0, 0, 1, tinggi);
    isi(lebar - 1, 0, 1, tinggi);
    const acak = acakBerbenih(80);
    for (let i = 0; i < 40; i++) isi(2 + Math.floor(acak() * 110), 2 + Math.floor(acak() * 70), 2 + Math.floor(acak() * 6), 2 + Math.floor(acak() * 5));
    const json = ubah((p) => {
      p.lebar = lebar;
      p.tinggi = tinggi;
      p.ubin = rle(tabrakan.map((t) => (t ? 5 : 12)));
      p.tabrakan = rle(tabrakan);
    }) as PetaJejak<string>;
    const peta = bacaPeta(json);
    expect(Array.from(peta.tabrakan)).toEqual(tabrakan);
    expect(json.tabrakan.length).toBeLessThan(JSON.stringify(tabrakan).length / 3);
  });
});

describe("selPadat dan bantuan ubin (P-31)", () => {
  const peta = bacaPeta(contohPeta());

  it("ubin padat dan ubin kosong", () => {
    expect(selPadat(peta, 0, 0)).toBe(true);
    expect(selPadat(peta, 1, 1)).toBe(false);
    expect(selPadat(peta, 3, 2)).toBe(true);
    expect(selPadat(peta, 3, 5)).toBe(false);
  });

  it("di luar peta selalu padat, termasuk tepat di luar setiap tepi", () => {
    expect(selPadat(peta, -1, 1)).toBe(true);
    expect(selPadat(peta, 1, -1)).toBe(true);
    expect(selPadat(peta, 8, 1)).toBe(true);
    expect(selPadat(peta, 1, 6)).toBe(true);
    expect(selPadat(peta, 7, 5)).toBe(true);
  });

  it("koordinat pecahan dibulatkan ke bawah", () => {
    expect(selPadat(peta, 1.9, 1.2)).toBe(false);
    expect(selPadat(peta, 2.9, 2.5)).toBe(false);
    expect(selPadat(peta, 3.1, 2.9)).toBe(true);
  });

  it("ubin dan piksel", () => {
    expect(UKURAN_UBIN).toBe(16);
    expect(UKURAN_PETA_MAKS).toBe(512);
    expect(ubinKePiksel(3)).toBe(48);
    expect(pusatUbin(3)).toBe(56);
    expect(pusatUbin(0)).toBe(8);
    expect(pikselKeUbin(47.99)).toBe(2);
    expect(pikselKeUbin(48)).toBe(3);
    expect(pikselKeUbin(-0.5)).toBe(-1);
  });
});
