// Huruf VT323 lewat token pusat (spesifikasi JS-16b, P-1 sampai P-5; AC-1, AC-2, AC-4).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FAKTOR_HURUF_TEKS, HURUF_TEKS_CADANGAN, keluargaHurufTeks, ukuranLabel } from "../pemain/huruf";

const baca = (jalur: string) => readFileSync(new URL(`../../../${jalur}`, import.meta.url), "utf8");
const CSS = ["app/jejak-setara/styles/jejak.css", "app/jejak-setara/styles/kelas.css"];

describe("JS-16b: huruf VT323", () => {
  it("paket dan impor: @fontsource/vt323 5.3.0; Jejak hanya mengimpor latin-400 VT323; Sehari Setara tetap (P-1; AC-1)", () => {
    expect(JSON.parse(baca("package.json")).dependencies["@fontsource/vt323"]).toBe("5.3.0");
    for (const berkas of ["web/jejak-setara/main.tsx", "web/jejak-setara/admin/main.tsx"]) {
      const isi = baca(berkas);
      expect(isi.match(/^import "@fontsource\/[^"]+";$/gm), berkas).toEqual(['import "@fontsource/vt323/latin-400.css";']);
    }
    expect(baca("app/sehari-setara/styles/game.css") + baca("app/layout.tsx")).toMatch(/Press Start 2P|press-start-2p/);
  });

  it("nama huruf hanya di empat token :root; setiap pemakaian token berpasangan dengan font-size-adjust yang sesuai (P-2; AC-2)", () => {
    for (const berkas of CSS) {
      const isi = baca(berkas);
      expect(isi, berkas).not.toMatch(/Press Start 2P|Pixelify Sans/);
      // Komentar boleh menyebut VT323; yang diperiksa hanya deklarasi.
      const baris = isi.replace(/\/\*[\s\S]*?\*\//g, (k) => k.replace(/[^\n]/g, " ")).split("\n");
      baris.forEach((b, i) => {
        if (/VT323/.test(b)) expect(b.trim(), `${berkas}:${i + 1}`).toMatch(/^--js-huruf-(judul|teks): "VT323", monospace;$/);
        const pakai = b.match(/^(\s*)font(?:-family)?: .*var\(--js-huruf-(judul|teks)\);$/);
        if (pakai) expect(baris[i + 1], `${berkas}:${i + 2}`).toBe(`${pakai[1]}font-size-adjust: var(--js-huruf-${pakai[2]}-sesuai);`);
      });
    }
    const root = baca(CSS[0]);
    expect(root.match(/--js-huruf-(judul|teks)(-sesuai)?:/g)).toEqual(["--js-huruf-judul:", "--js-huruf-judul-sesuai:", "--js-huruf-teks:", "--js-huruf-teks-sesuai:"]);
    expect(root).toContain("--js-huruf-judul-sesuai: cap-height 1;");
    expect(root).toContain("--js-huruf-teks-sesuai: cap-height 0.64;");
  });

  it("label nama di kanvas: faktor 0,64 ÷ 0,56, ukuran 13 px menjadi 15 px pada rasio 1, keluarga dari token (P-3; AC-4)", () => {
    expect(FAKTOR_HURUF_TEKS).toBe(8 / 7);
    expect(ukuranLabel(13, 1)).toBe(15);
    expect(ukuranLabel(13, 2)).toBe(30);
    expect(keluargaHurufTeks({ getPropertyValue: () => ' "VT323", monospace ' })).toBe('"VT323", monospace');
    expect(keluargaHurufTeks({ getPropertyValue: () => "" })).toBe(HURUF_TEKS_CADANGAN);
    expect(keluargaHurufTeks(null)).toBe(HURUF_TEKS_CADANGAN);
    const dunia = baca("app/jejak-setara/pemain/LayarDunia.tsx");
    expect(dunia).not.toMatch(/Pixelify|Press Start|VT323/);
    expect(dunia.match(/cg\.font = `\$\{huruf\}px \$\{keluarga\}`;/g)).toHaveLength(2);
  });
});
