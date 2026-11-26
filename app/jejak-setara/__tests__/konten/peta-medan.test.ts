// Uji gambar medan peta (PC-1; spesifikasi JS-06, bagian "Perubahan sesudah JS-06", P-32 sampai P-35; Daftar_Aset.md,
// bagian "Gambar medan peta dan kotak P1"). Memeriksa ulang hasil peta:build tanpa Python: ukuran 160n × 100n, PNG palet
// yang hanya memakai warna palette.json tanpa transparansi, anggaran ukuran, dan sidik sumber di potongan tEXt "sumber"
// yang sama dengan kelima berkas sumber peta dan dengan kampung_gambar.json. Bila uji sidik gagal, jalankan peta:build.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";

const AKAR = new URL("../../../../", import.meta.url);
const bacaBerkas = (jalur: string) => readFileSync(new URL(jalur, AKAR));
const bacaTeks = (jalur: string) => bacaBerkas(jalur).toString("utf8");

// P-23: urutan berkas sidik sumber, sama dengan peta-berkas.test.ts.
const SIDIK = [
  "scripts/jejak-setara/peta/kampung.txt",
  "scripts/jejak-setara/peta/objek.json",
  "scripts/jejak-setara/peta/build_peta.py",
  "scripts/game/art/atas_ubin.py",
  "scripts/game/art/atas_objek.py",
];
// P-32 dan P-35 galat 12: n piksel per ubin dan anggaran setiap berkas.
const MEDAN = [
  { n: 1, batas: 4 * 1024 },
  { n: 2, batas: 8 * 1024 },
  { n: 4, batas: 20 * 1024 },
];
const BATAS_TOTAL = 32 * 1024;
const jalurMedan = (n: number) => `app/jejak-setara/assets/peta/peta_medan_${n}.png`;

interface Potongan {
  jenis: string;
  isi: Buffer;
}

/** Potongan PNG berurutan; galat bila tanda tangan, panjang, atau CRC tidak sah. */
function potonganPng(b: Buffer): Potongan[] {
  if (b.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error("bukan PNG");
  const hasil: Potongan[] = [];
  let i = 8;
  while (i < b.length) {
    const panjang = b.readUInt32BE(i);
    const jenis = b.toString("latin1", i + 4, i + 8);
    const isi = b.subarray(i + 8, i + 8 + panjang);
    if (i + 12 + panjang > b.length) throw new Error(`potongan ${jenis} terpotong`);
    hasil.push({ jenis, isi });
    i += 12 + panjang;
  }
  return hasil;
}

function sidikSumber(): string {
  const h = createHash("sha256");
  for (const jalur of SIDIK) {
    h.update(`${jalur}\n`, "utf8");
    h.update(Buffer.from(bacaBerkas(jalur).toString("latin1").replace(/\r\n/g, "\n"), "latin1"));
    h.update("\n", "utf8");
  }
  return h.digest("hex");
}

const paletJson = JSON.parse(bacaTeks("scripts/game/art/palette.json")) as Record<string, Record<string, string> | string>;
const PALET = new Set(
  Object.entries(paletJson)
    .filter(([kelompok]) => !kelompok.startsWith("_"))
    .flatMap(([, isi]) => Object.values(isi as Record<string, string>).map((w) => w.toUpperCase())),
);
const sumberGambar = (JSON.parse(bacaTeks("app/jejak-setara/peta/kampung_gambar.json")) as { sumber: string }).sumber;

describe("gambar medan peta (PC-1)", () => {
  it("palette.json berisi 36 warna", () => {
    expect(PALET.size).toBe(36);
  });

  for (const { n, batas } of MEDAN) {
    it(`peta_medan_${n}.png: ${160 * n} × ${100 * n} px, PNG palet tanpa transparansi, hanya warna palet, paling besar ${batas / 1024} KB`, () => {
      const b = bacaBerkas(jalurMedan(n));
      const potongan = potonganPng(b);
      expect(potongan[0].jenis).toBe("IHDR");
      expect(potongan[potongan.length - 1].jenis).toBe("IEND");
      const ihdr = potongan[0].isi;
      const [lebar, tinggi, bit, jenisWarna, sela] = [ihdr.readUInt32BE(0), ihdr.readUInt32BE(4), ihdr[8], ihdr[9], ihdr[12]];
      expect([lebar, tinggi, jenisWarna, sela]).toEqual([160 * n, 100 * n, 3, 0]);
      expect([1, 2, 4, 8]).toContain(bit);
      const plte = potongan.filter((p) => p.jenis === "PLTE");
      expect(plte).toHaveLength(1);
      const warna = Array.from({ length: plte[0].isi.length / 3 }, (_, j) =>
        `#${plte[0].isi.subarray(j * 3, j * 3 + 3).toString("hex").toUpperCase()}`,
      );
      expect(warna.length).toBeGreaterThan(1);
      expect(warna.length).toBeLessThanOrEqual(2 ** bit);
      expect(new Set(warna).size).toBe(warna.length);
      expect(warna.filter((w) => !PALET.has(w))).toEqual([]);
      expect(potongan.some((p) => p.jenis === "tRNS")).toBe(false);
      // Data piksel terurai utuh: satu bita saring ditambah satu baris piksel untuk setiap baris gambar.
      const data = inflateSync(Buffer.concat(potongan.filter((p) => p.jenis === "IDAT").map((p) => p.isi)));
      expect(data.length).toBe(tinggi * (1 + Math.ceil((lebar * bit) / 8)));
      expect(b.length).toBeLessThanOrEqual(batas);
    });
  }

  it("sidik di setiap PNG sama dengan kelima berkas sumber dan kampung_gambar.json (bila gagal, jalankan peta:build)", () => {
    const sidik = sidikSumber();
    expect(sumberGambar).toBe(sidik);
    for (const { n } of MEDAN) {
      const teks = potonganPng(bacaBerkas(jalurMedan(n)))
        .filter((p) => p.jenis === "tEXt")
        .map((p) => p.isi.toString("latin1"))
        .filter((t) => t.startsWith("sumber\0"));
      expect(teks, `peta_medan_${n}.png`).toEqual([`sumber\0${sidik}`]);
    }
  });

  it(`bertiga paling besar ${BATAS_TOTAL / 1024} KB`, () => {
    const total = MEDAN.reduce((s, { n }) => s + bacaBerkas(jalurMedan(n)).length, 0);
    expect(total).toBeLessThanOrEqual(BATAS_TOTAL);
  });
});
