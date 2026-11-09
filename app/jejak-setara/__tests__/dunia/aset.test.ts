// Ganti warna tas, garis siluet, dan daftar aset dunia (spesifikasi JS-07, P-5, P-6, P-21; AC-2 dan AC-9).
import { describe, expect, it } from "vitest";
import { AVATAR, KUNCI_TAS, OBJEK, WARNA_TAS } from "../../assets/manifest";
import { daftarUrlDunia, gantiWarnaTas, garisSiluet, hexKeRgb, jenisObjekDunia, SILUET_TEPI } from "../../pemain/dunia/aset";
import { OBJEK_PETA } from "../../pemain/dunia/petaKampung";
import { bacaPng, berkasAset } from "./bantuGambar";

const kunci = { dasar: hexKeRgb(KUNCI_TAS.dasar), bayangan: hexKeRgb(KUNCI_TAS.bayangan) };

describe("warna tas (P-21; Design System 8)", () => {
  it("penggantian serentak: sun → mango dan mango → coral tidak berantai menjadi coral", () => {
    const data = new Uint8ClampedArray([...kunci.dasar, 255, ...kunci.bayangan, 255, 10, 20, 30, 255, ...kunci.dasar, 0]);
    const [d, b] = WARNA_TAS.mango;
    const n = gantiWarnaTas(data, kunci, { dasar: hexKeRgb(d), bayangan: hexKeRgb(b) });
    expect(n).toBe(2);
    expect([...data.slice(0, 4)]).toEqual([...hexKeRgb("#FF9F1C"), 255]);
    expect([...data.slice(4, 8)]).toEqual([...hexKeRgb("#FF6B5B"), 255]);
    expect([...data.slice(8, 12)]).toEqual([10, 20, 30, 255]);
    expect([...data.slice(12, 16)]).toEqual([...kunci.dasar, 0]);
  });

  it("pada strip avatar asli, hanya piksel sun dan mango yang berubah, untuk kedelapan warna tas", () => {
    const asli = bacaPng(berkasAset(AVATAR[0].bawah.jalan.url));
    for (const [warna, [d, b]] of Object.entries(WARNA_TAS)) {
      const data = new Uint8ClampedArray(asli.data);
      gantiWarnaTas(data, kunci, { dasar: hexKeRgb(d), bayangan: hexKeRgb(b) });
      let berubah = 0;
      for (let i = 0; i < data.length; i += 4) {
        const sama = data[i] === asli.data[i] && data[i + 1] === asli.data[i + 1] && data[i + 2] === asli.data[i + 2] && data[i + 3] === asli.data[i + 3];
        if (sama) continue;
        berubah++;
        const rgb = [asli.data[i], asli.data[i + 1], asli.data[i + 2]].join();
        expect([kunci.dasar.join(), kunci.bayangan.join()], warna).toContain(rgb);
      }
      if (warna !== "sun") expect(berubah, warna).toBeGreaterThan(0);
    }
  });
});

describe("garis siluet dua lapis (P-6; Design System 7, lapisan 60)", () => {
  it("garis dalam ink bertetangga 4 arah dengan bentuk, lalu garis luar sun bertetangga 4 arah dengan garis dalam", () => {
    // Bentuk satu piksel di tengah kisi 1 × 1: kisi hasil 5 × 5.
    const g = garisSiluet([255], 1, 1);
    expect(SILUET_TEPI).toBe(2);
    // prettier-ignore
    expect([...g]).toEqual([
      0, 0, 2, 0, 0,
      0, 2, 1, 2, 0,
      2, 1, 0, 1, 2,
      0, 2, 1, 2, 0,
      0, 0, 2, 0, 0,
    ]);
  });

  it("strip avatar asli: tidak ada garis di dalam bentuk, dan setiap garis luar bersebelahan dengan garis dalam", () => {
    const s = bacaPng(berkasAset(AVATAR[3].kanan.diam.url));
    const w = 16;
    const alpha = new Uint8Array(w * 24);
    for (let y = 0; y < 24; y++) for (let x = 0; x < w; x++) alpha[y * w + x] = s.data[(y * s.width + x) * 4 + 3];
    const g = garisSiluet(alpha, w, 24);
    const W = w + 4;
    for (let y = 0; y < 24; y++) for (let x = 0; x < w; x++) if (alpha[y * w + x]) expect(g[(y + 2) * W + x + 2]).toBe(0);
    for (let i = 0; i < g.length; i++) {
      if (g[i] !== 2) continue;
      const x = i % W;
      const y = Math.floor(i / W);
      const t = [g[i - 1], g[i + 1], g[i - W], g[i + W]].filter((v, j) => (j === 0 ? x > 0 : j === 1 ? x < W - 1 : true));
      expect(t).toContain(1);
      expect(y).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("aset yang dimuat layar dunia (bagian Aset spesifikasi; AC-22)", () => {
  it("semua jenis objek kampung.json ada di manifest, ditambah gerbang buka dan tutup", () => {
    const jenis = jenisObjekDunia();
    for (const o of OBJEK_PETA) expect(jenis).toContain(o.jenis);
    expect(jenis).toEqual(expect.arrayContaining(["gerbang_buka", "gerbang_tutup"]));
    for (const j of jenis) expect(OBJEK[j], j).toBeDefined();
  });

  it("URL unik: tiga lembar ubin, objek, 48 strip dan 8 ikon avatar, ikon dan tanda dunia", () => {
    const url = daftarUrlDunia();
    expect(new Set(url).size).toBe(url.length);
    expect(url.length).toBeGreaterThan(3 + 48 + 8 + 14);
  });
});
