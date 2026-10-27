// Uji unit PDF tanpa pustaka (spesifikasi F-09, AC-24): struktur, tabel xref, ukuran halaman, letak gambar, dan isi
// gambar yang diurai ulang dengan node:zlib.
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { A4_PT, pdfFromRgb, pdfPlacement } from "../ui/pdf";

const latin1 = (bytes: Uint8Array) => Buffer.from(bytes).toString("latin1");

/** Gambar kecil 3 × 2 dengan isi yang mudah dikenali. */
const W = 3;
const H = 2;
const RGB = Uint8Array.from({ length: W * H * 3 }, (_, i) => (i * 37) % 256);

describe("letak gambar di halaman A4", () => {
  it("A4 tegak dalam pt", () => {
    expect(A4_PT).toEqual({ w: 595.28, h: 841.89 });
  });

  it("lembar 1.240 × 1.754 px memenuhi halaman, rata atas", () => {
    const place = pdfPlacement(1240, 1754);
    expect(place.h).toBeCloseTo(841.89, 2);
    expect(place.w).toBeCloseTo((1240 * 841.89) / 1754, 2);
    expect(place.y).toBeCloseTo(0, 6);
    expect(place.x).toBeCloseTo((595.28 - place.w) / 2, 6);
  });

  it("gambar lebar selebar halaman dan rata atas; gambar tinggi setinggi halaman dan rata tengah mendatar", () => {
    const wide = pdfPlacement(2000, 1000);
    expect([wide.x, wide.w]).toEqual([0, 595.28]);
    expect(wide.h).toBeCloseTo(297.64, 2);
    expect(wide.y + wide.h).toBeCloseTo(841.89, 6);
    const tall = pdfPlacement(1240, 2000);
    expect(tall.h).toBeCloseTo(841.89, 6);
    expect(tall.y).toBeCloseTo(0, 6);
    expect(tall.x).toBeCloseTo((595.28 - tall.w) / 2, 6);
    expect(tall.x).toBeGreaterThan(0);
  });
});

describe("PDF 1.4 satu halaman", () => {
  it("awal, akhir, halaman, ukuran halaman, dan kamus gambar", async () => {
    const text = latin1(await pdfFromRgb(W, H, RGB));
    expect(text.startsWith("%PDF-1.4\n")).toBe(true);
    expect(text).toMatch(/%%EOF\n?$/);
    expect(text.match(/\/Type \/Page(?!s)/g)).toHaveLength(1);
    expect(text).toContain("/MediaBox [0 0 595.28 841.89]");
    expect(text).toContain(`/Width ${W} /Height ${H}`);
    expect(text).toContain("/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Interpolate false");
  });

  it("setiap posisi di tabel xref menunjuk awal objeknya, dan startxref menunjuk tabel itu", async () => {
    const text = latin1(await pdfFromRgb(W, H, RGB));
    const start = Number(/startxref\n(\d+)\n%%EOF/.exec(text)?.[1]);
    expect(text.slice(start, start + 5)).toBe("xref\n");
    const [, count] = /^xref\n0 (\d+)\n/.exec(text.slice(start)) ?? [];
    expect(Number(count)).toBe(6);
    const lines = text.slice(start).split("\n").slice(2, 2 + Number(count));
    expect(lines[0]).toBe("0000000000 65535 f ");
    lines.slice(1).forEach((line, i) => {
      expect(line).toMatch(/^\d{10} 00000 n $/);
      const offset = Number(line.slice(0, 10));
      expect(text.slice(offset, offset + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`);
    });
    expect(text).toContain(`trailer\n<< /Size 6 /Root 1 0 R >>`);
  });

  it("isi gambar diurai ulang sama dengan masukan, dan isi halaman meletakkan gambar sesuai pdfPlacement", async () => {
    const bytes = await pdfFromRgb(W, H, RGB);
    const text = latin1(bytes);
    const image = /4 0 obj\n<<[^]*?\/Length (\d+) >>\nstream\n/.exec(text);
    expect(image).not.toBeNull();
    const from = (image?.index ?? 0) + (image?.[0].length ?? 0);
    const length = Number(image?.[1]);
    expect(text.slice(from + length, from + length + 10)).toBe("\nendstream");
    expect(new Uint8Array(inflateSync(bytes.subarray(from, from + length)))).toEqual(RGB);
    const place = pdfPlacement(W, H);
    const round = (v: number) => String(Math.round(v * 100) / 100);
    expect(text).toContain(`q ${round(place.w)} 0 0 ${round(place.h)} ${round(place.x)} ${round(place.y)} cm /Im0 Do Q`);
  });

  it("menolak data gambar yang ukurannya tidak sesuai", async () => {
    await expect(pdfFromRgb(W, H, RGB.subarray(1))).rejects.toThrow();
  });
});
