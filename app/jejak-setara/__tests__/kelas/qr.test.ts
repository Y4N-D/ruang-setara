// Uji pembuat kode QR layar kelas (spesifikasi JS-16b, P-6; AC-5). Matriks contoh dibuat sekali di luar repositori dengan
// pustaka pembanding (lihat kolom "sumber" di qr-contoh.json), jadi uji ini tidak membandingkan kode dengan dirinya sendiri.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buatQR, jalurSvg, VERSI_MAKS } from "../../admin/kelas/qr";

interface Contoh {
  matriks: { teks: string; versi: number; mask: number; baris: string[] }[];
  maskOtomatis: { teks: string; versi: number; mask: number }[];
}
const contoh = JSON.parse(readFileSync(new URL("./qr-contoh.json", import.meta.url), "utf8")) as Contoh;
const keHex = (baris: readonly boolean[]) => {
  let s = "";
  for (let i = 0; i < baris.length; i += 4) {
    let v = 0;
    for (let j = 0; j < 4; j++) v = (v << 1) | (i + j < baris.length && baris[i + j] ? 1 : 0);
    s += v.toString(16);
  }
  return s;
};

describe("JS-16b: pembuat kode QR (P-6; AC-5)", () => {
  it("matriks sama persis dengan matriks contoh untuk versi 1, 4, 7, dan 10 dan kedelapan mask", () => {
    expect(contoh.matriks.map((c) => `${c.versi}:${c.mask}`)).toHaveLength(32);
    for (const c of contoh.matriks) {
      const q = buatQR(c.teks, { mask: c.mask });
      expect(q.versi, `versi ${c.versi} mask ${c.mask}`).toBe(c.versi);
      expect(q.modul.map(keHex), `versi ${c.versi} mask ${c.mask}`).toEqual(c.baris);
    }
  });

  it("versi dan mask pilihan sama dengan rujukan penalti ISO (qrcodegen Nayuki)", () => {
    for (const c of contoh.maskOtomatis) {
      const q = buatQR(c.teks);
      expect({ versi: q.versi, mask: q.mask }, c.teks).toEqual({ versi: c.versi, mask: c.mask });
    }
  });

  it("tautan produksi menjadi versi 4 dengan 33 modul; 213 byte masih versi 10; 214 byte ditolak", () => {
    const q = buatQR("https://jejak-setara.ruangsetara.workers.dev/?kode=K7MPA");
    expect([q.versi, q.ukuran]).toEqual([4, 33]);
    expect(buatQR("a".repeat(213)).versi).toBe(VERSI_MAKS);
    expect(() => buatQR("a".repeat(214))).toThrow();
  });

  it("jalur SVG memakai zona tenang 4 modul dan satu kotak per modul gelap", () => {
    const q = buatQR("jejak-setara");
    const { sisi, d } = jalurSvg(q);
    expect(sisi).toBe(q.ukuran + 8);
    expect(d.match(/M/g)).toHaveLength(q.modul.flat().filter(Boolean).length);
    expect(d.startsWith("M4 4H5V5H4Z")).toBe(true);
  });
});
