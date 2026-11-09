// Potongan peta (spesifikasi JS-07, P-7 sampai P-11; AC-4). Isi potongan dibandingkan piksel demi piksel dengan
// pratinjau peta JS-06 (docs/jejak-setara/preview/peta_{masa}.png), memakai kanvas tiruan Node.
import { describe, expect, it } from "vitest";
import { OBJEK, UBIN } from "../../assets/manifest";
import type { Masa } from "../../inti/tipe";
import { GERBANG, ID_GERBANG, LAPISAN_GAMBAR, OBJEK_PETA, UKURAN_PETA } from "../../pemain/dunia/petaKampung";
import {
  BARIS_PER_IRISAN,
  PengelolaPotongan,
  SIMPAN_MAKS,
  UKURAN_POTONGAN,
  type DataPotongan,
  type KanvasPotongan,
  type ObjekGambar,
} from "../../pemain/dunia/potongan";
import { bacaPng, berkasAset, KanvasHitung, KanvasUji, type GambarUji } from "./bantuGambar";

const cache = new Map<string, GambarUji>();
const muat = (url: string) => {
  const j = berkasAset(url);
  let g = cache.get(j);
  if (!g) {
    g = bacaPng(j);
    cache.set(j, g);
  }
  return g;
};
const sumber = (g: GambarUji) => g as unknown as CanvasImageSource & { width: number; height: number };

function dataPeta(): DataPotongan {
  const objek: ObjekGambar[] = OBJEK_PETA.map((o) => {
    const m = OBJEK[o.jenis];
    return { x: o.x, y: o.y, tinggi: m.tinggi, bawah: sumber(muat(m.bawah.url)), atas: m.atas ? sumber(muat(m.atas.url)) : null };
  });
  return {
    lebarUbin: UKURAN_PETA.lebar,
    tinggiUbin: UKURAN_PETA.tinggi,
    kolomLembar: LAPISAN_GAMBAR.kolom,
    daftar: LAPISAN_GAMBAR.daftar,
    tanah: LAPISAN_GAMBAR.tanah,
    tumpang: LAPISAN_GAMBAR.tumpang,
    bayangan: LAPISAN_GAMBAR.bayangan,
    lembar: { pagi: sumber(muat(UBIN.pagi)), siang: sumber(muat(UBIN.siang)), sore: sumber(muat(UBIN.sore)) },
    objek,
  };
}

const buatUji = (w: number, h: number) => new KanvasUji(w, h) as unknown as KanvasPotongan;

describe("isi potongan sama dengan pratinjau JS-06 (P-7; AC-4)", () => {
  const data = dataPeta();
  // Potongan contoh jauh dari halaman lobi, karena pratinjau juga menggambar delapan pemain dan gerbang di sana.
  const CONTOH: [number, number][] = [
    [0, 0],
    [2, 1],
    [6, 4],
    [9, 6],
  ];
  for (const masa of ["pagi", "siang", "sore"] as Masa[]) {
    it(`lapis bawah lalu lapis atas = peta_${masa}.png di ${CONTOH.length} potongan`, () => {
      const pratinjau = bacaPng(`docs/jejak-setara/preview/peta_${masa}.png`);
      const p = new PengelolaPotongan(data, buatUji);
      for (const [cx, cy] of CONTOH) {
        const { bawah, atas } = p.lapis(cx, cy, masa);
        const k = p.kotakPotongan(cx, cy);
        const gabung = new KanvasUji(k.w, k.h);
        const ctx = gabung.getContext();
        ctx.drawImage(bawah as unknown as CanvasImageSource, 0, 0);
        if (atas) ctx.drawImage(atas as unknown as CanvasImageSource, 0, 0);
        let beda = 0;
        for (let y = 0; y < k.h; y++) {
          for (let x = 0; x < k.w; x++) {
            const a = (y * k.w + x) * 4;
            const b = ((k.y + y) * pratinjau.width + k.x + x) * 4;
            if (gabung.data[a] !== pratinjau.data[b] || gabung.data[a + 1] !== pratinjau.data[b + 1] || gabung.data[a + 2] !== pratinjau.data[b + 2]) beda++;
            if (gabung.data[a + 3] !== 255) beda++;
          }
        }
        expect(beda, `potongan ${cx},${cy} masa ${masa}`).toBe(0);
      }
    });
  }

  it("baris terakhir setinggi 64; peta 10 × 7 potongan; gerbang lobi tidak masuk potongan", () => {
    const p = new PengelolaPotongan(data, (w, h) => new KanvasHitung(w, h) as unknown as KanvasPotongan);
    expect([p.kolom, p.baris]).toEqual([10, 7]);
    expect(p.kotakPotongan(9, 6)).toEqual({ x: 2304, y: 1536, w: 256, h: 64 });
    expect(OBJEK_PETA.some((o) => o.id === ID_GERBANG)).toBe(false);
    expect(GERBANG).toMatchObject({ id: ID_GERBANG, jenis: "gerbang_buka" });
    expect(UKURAN_POTONGAN).toBe(256);
  });
});

describe("persiapan, pelepasan, dan ganti masa (P-8 sampai P-11; AC-4)", () => {
  const data = dataPeta();
  const baru = () => new PengelolaPotongan(data, (w, h) => new KanvasHitung(w, h) as unknown as KanvasPotongan);

  it("potongan terlihat selalu siap; potongan cincin disiapkan bertahap, paling banyak satu per bingkai", () => {
    const p = baru();
    const kamera = { x: 0, y: 0 };
    expect(p.terlihat(kamera)).toEqual([
      [0, 0],
      [1, 0],
    ]);
    expect(p.perbarui(kamera, "pagi", null)).toBe(2); // 2 terlihat utuh; cincin baru dimulai
    for (const [cx, cy] of p.terlihat(kamera)) expect(p.ambil(cx, cy)?.bawah.has("pagi")).toBe(true);
    let bingkai = 1;
    while (p.jumlahDisimpan < 6 && bingkai < 100) {
      expect(p.perbarui(kamera, "pagi", null)).toBeLessThanOrEqual(1);
      bingkai++;
    }
    expect(p.jumlahDisimpan).toBe(6); // 2 terlihat + 4 cincin
    expect(bingkai).toBeGreaterThan(4 * BARIS_PER_IRISAN); // setiap potongan cincin butuh beberapa bingkai
    expect(p.perbarui(kamera, "pagi", null)).toBe(0);
    expect(p.disiapkan).toBe(6);
  });

  it("paling banyak 16 potongan disimpan; yang berjarak lebih dari satu potongan dilepas", () => {
    const p = baru();
    const tengah = { x: 1000, y: 600 }; // pandangan menyentuh 3 × 2 potongan (kolom 3–5, baris 2–3)
    expect(p.terlihat(tengah)).toHaveLength(6);
    for (let i = 0; i < 150; i++) {
      p.perbarui(tengah, "pagi", null);
      expect(p.jumlahDisimpan).toBeLessThanOrEqual(SIMPAN_MAKS);
    }
    expect(p.jumlahDisimpan).toBe(SIMPAN_MAKS);
    p.perbarui({ x: 0, y: 0 }, "pagi", null);
    expect(p.ambil(5, 2)).toBeUndefined();
    expect(p.jumlahDisimpan).toBeLessThanOrEqual(6);
  });

  it("masa berikutnya disiapkan bertahap ke simpanan kedua, lalu masa lama dilepas saat berganti", () => {
    const p = baru();
    const kamera = { x: 0, y: 0 };
    for (let i = 0; i < 60; i++) p.perbarui(kamera, "pagi", null);
    expect(p.jumlahDisimpan).toBe(6);
    expect(p.perbarui(kamera, "pagi", "siang")).toBe(0); // irisan pertama potongan siang
    for (let i = 0; i < 60; i++) expect(p.perbarui(kamera, "pagi", "siang")).toBeLessThanOrEqual(1);
    for (const [cx, cy] of [...p.terlihat(kamera), ...p.cincin(kamera)]) expect(p.ambil(cx, cy)?.bawah.has("siang")).toBe(true);
    const sebelum = p.disiapkan;
    p.perbarui(kamera, "siang", null);
    expect(p.disiapkan).toBe(sebelum); // langsung ditukar tanpa menggambar ulang
    expect(p.ambil(0, 0)?.bawah.has("pagi")).toBe(false);
    p.perbarui(kamera, "pagi", null); // masa mundur (tambah waktu): potongan terlihat dibuat saat dibutuhkan
    expect(p.ambil(0, 0)?.bawah.has("pagi")).toBe(true);
  });

  it("persiapan bertahap menghasilkan isi yang sama dengan persiapan utuh", () => {
    const data = dataPeta();
    const utuh = new PengelolaPotongan(data, buatUji);
    const bertahap = new PengelolaPotongan(data, buatUji);
    const kamera = { x: 1300, y: 300 };
    for (let i = 0; i < 80; i++) bertahap.perbarui(kamera, "sore", null);
    for (const [cx, cy] of bertahap.cincin(kamera).slice(0, 3)) {
      const a = bertahap.ambil(cx, cy);
      expect(a?.bawah.has("sore"), `${cx},${cy}`).toBe(true);
      const b = utuh.lapis(cx, cy, "sore");
      expect((a?.bawah.get("sore") as unknown as KanvasUji).data).toEqual((b.bawah as unknown as KanvasUji).data);
      expect((a?.atas as unknown as KanvasUji | null)?.data ?? null).toEqual((b.atas as unknown as KanvasUji | null)?.data ?? null);
    }
  });

  it("siluet: kotak bagian atas objek yang beririsan dengan kotak pemain terdeteksi", () => {
    const p = baru();
    const pohon = OBJEK_PETA.find((o) => o.jenis === "pohon")!;
    const kotak = { x: pohon.x * 16 + 8, y: pohon.y * 16 + 4, w: 16, h: 24 };
    expect(p.atasBeririsan(kotak)).toBe(true);
    expect(p.atasBeririsan({ x: 1, y: 1, w: 1, h: 1 })).toBe(false);
  });
});
