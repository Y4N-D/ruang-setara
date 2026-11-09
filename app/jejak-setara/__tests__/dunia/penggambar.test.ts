// Urutan gambar, siluet, animasi, cermin arah kiri, dan pilihan label nama (spesifikasi JS-07, P-4 sampai P-6 dan
// P-23; AC-2 dan AC-10), dengan konteks kanvas perekam.
import { describe, expect, it } from "vitest";
import { cerminStrip, type Strip } from "../../pemain/dunia/aset";
import { MesinDunia } from "../../pemain/dunia/mesin";
import { bingkaiTokoh, gambarBingkai, urutTokoh, type TokohGambar } from "../../pemain/dunia/penggambar";
import { PengelolaPotongan, type KanvasPotongan } from "../../pemain/dunia/potongan";

type Catatan = string[];
/** Kanvas perekam: setiap panggilan drawImage dicatat dengan nama sumbernya. */
function kanvasRekam(nama: string, w: number, h: number, catatan: Catatan) {
  const k = {
    nama,
    width: w,
    height: h,
    getContext: () =>
      ({
        imageSmoothingEnabled: true,
        clearRect: () => undefined,
        save: () => catatan.push(`${nama}:save`),
        restore: () => catatan.push(`${nama}:restore`),
        translate: (x: number, y: number) => catatan.push(`${nama}:translate(${x},${y})`),
        scale: (x: number, y: number) => catatan.push(`${nama}:scale(${x},${y})`),
        drawImage: (src: { nama?: string }, ...a: number[]) => catatan.push(`${nama}<-${src.nama ?? "?"}(${a.join(",")})`),
      }) as unknown as CanvasRenderingContext2D,
  };
  return k;
}
const gambar = (nama: string, width: number, height: number) => ({ nama, width, height }) as unknown as CanvasImageSource & { width: number; height: number };

function peta() {
  let n = 0;
  const p = new PengelolaPotongan(
    {
      lebarUbin: 32,
      tinggiUbin: 16,
      kolomLembar: 16,
      daftar: [null, 0],
      tanah: new Uint8Array(32 * 16).fill(1),
      tumpang: new Uint8Array(32 * 16),
      bayangan: new Uint8Array(32 * 16),
      lembar: { pagi: gambar("lembar", 256, 256), siang: gambar("lembar", 256, 256), sore: gambar("lembar", 256, 256) },
      // Pohon 2 × 2 ubin di (4, 4): bagian atas 34 × 17, bagian bawah 34 × 17.
      objek: [{ x: 4, y: 4, tinggi: 2, bawah: gambar("pohonBawah", 34, 17), atas: gambar("pohonAtas", 34, 17) }],
    },
    (w, h) => kanvasRekam(`potongan${n++}`, w, h, []) as unknown as KanvasPotongan,
  );
  return p;
}

const strip = (nama: string, lebar = 16, tinggi = 24, bingkai = 4): Strip => ({ gambar: gambar(nama, lebar * bingkai, tinggi), lebar, tinggi, bingkai });

describe("animasi dan urutan tokoh (P-4, P-5)", () => {
  it("diam 2 bingkai 2 fps, jalan 4 bingkai 8 fps; kurangi gerak: bingkai 0", () => {
    expect([0, 499, 500, 999, 1000].map((t) => bingkaiTokoh(false, t, false))).toEqual([0, 0, 1, 1, 0]);
    expect([0, 125, 250, 375, 500].map((t) => bingkaiTokoh(true, t, false))).toEqual([0, 1, 2, 3, 0]);
    expect([0, 125, 777].map((t) => bingkaiTokoh(true, t, true))).toEqual([0, 0, 0]);
  });

  it("tokoh diurutkan menurut y kaki, lalu id", () => {
    const t = (id: string, y: number) => ({ id, y });
    expect(urutTokoh([t("c", 50), t("b", 40), t("a", 50), t("d", 10)]).map((x) => x.id)).toEqual(["d", "b", "a", "c"]);
  });
});

describe("urutan lapisan dan siluet (P-4, P-6)", () => {
  it("lapis bawah, gerbang bawah, tokoh, lapis atas, gerbang atas, lalu siluet hanya bila tertutup bagian atas", () => {
    const p = peta();
    const catat: Catatan = [];
    const ctx = kanvasRekam("dunia", 320, 180, catat).getContext();
    const gerbang = { x: 12, y: 2, bawah: gambar("gerbangBawah", 66, 17), atas: gambar("gerbangAtas", 66, 17) };
    const tokoh: TokohGambar[] = [
      { id: "b", x: 100, y: 120, strip: strip("tokohB"), bingkai: 1 },
      { id: "a", x: 80, y: 90, strip: strip("tokohA"), bingkai: 0 },
    ];
    const siluet = strip("siluet", 20, 28);
    // Diri di bawah pohon (kotak tokoh beririsan dengan bagian atas pohon di x 63–96, y 63–79).
    expect(gambarBingkai(ctx, { x: 0, y: 0 }, p, "pagi", gerbang, tokoh, { x: 80, y: 90, siluet, bingkai: 0 })).toBe(true);
    const urutan = catat.map((c) => c.replace(/\(.*$/, "").replace(/^dunia<-/, ""));
    // Dua potongan terlihat: (0,0) dengan pohon (lapis atas = potongan0, lapis bawah = potongan1) dan (1,0) tanpa objek.
    expect(urutan).toEqual(["potongan1", "potongan2", "gerbangBawah", "tokohA", "tokohB", "potongan0", "gerbangAtas", "siluet"]);
    expect(catat[3]).toBe("dunia<-tokohA(0,0,16,24,72,69,16,24)"); // titik kaki (8, 21), posisi bulat
    // Diri jauh dari bagian atas objek mana pun: tanpa siluet.
    catat.length = 0;
    expect(gambarBingkai(ctx, { x: 0, y: 0 }, p, "pagi", gerbang, tokoh, { x: 300, y: 170, siluet, bingkai: 0 })).toBe(false);
    expect(catat.some((c) => c.includes("siluet"))).toBe(false);
    // Di bawah bagian atas gerbang juga memunculkan siluet.
    catat.length = 0;
    expect(gambarBingkai(ctx, { x: 0, y: 0 }, p, "pagi", gerbang, tokoh, { x: 220, y: 50, siluet, bingkai: 0 })).toBe(true);
  });

  it("arah kiri: setiap bingkai arah kanan dicerminkan sendiri-sendiri, urutan bingkai tetap", () => {
    const catat: Catatan = [];
    const sumber = kanvasRekam("kanan", 64, 24, []);
    cerminStrip((w, h) => kanvasRekam("kiri", w, h, catat) as unknown as HTMLCanvasElement, sumber as unknown as HTMLCanvasElement, 16);
    expect(catat.filter((c) => c.includes("translate") || c.includes("<-"))).toEqual([
      "kiri:translate(16,0)",
      "kiri<-kanan(0,0,16,24,0,0,16,24)",
      "kiri:translate(32,0)",
      "kiri<-kanan(16,0,16,24,0,0,16,24)",
      "kiri:translate(48,0)",
      "kiri<-kanan(32,0,16,24,0,0,16,24)",
      "kiri:translate(64,0)",
      "kiri<-kanan(48,0,16,24,0,0,16,24)",
    ]);
    expect(catat.filter((c) => c.includes("scale"))).toEqual(Array(4).fill("kiri:scale(-1,1)"));
  });
});

describe("label nama (P-23, D-1)", () => {
  it("paling banyak 8 pemain lain terdekat yang terlihat; label diri tidak ada", () => {
    const m = new MesinDunia((w, h) => kanvasRekam("x", w, h, []) as unknown as HTMLCanvasElement);
    m.kamera = { x: 1000, y: 700 };
    m.gerak.terapkanKoreksi({ x: 1160, y: 790, seq: 0 });
    const s = strip("t");
    m.tokoh = [
      { id: "diri", x: 1160, y: 790, strip: s, bingkai: 0, nama: "Diri", diri: true },
      ...Array.from({ length: 12 }, (_, i) => ({ id: `p${i}`, x: 1160 + (i + 1) * 10, y: 790, strip: s, bingkai: 0, nama: `P${i}`, diri: false })),
      { id: "jauh", x: 1700, y: 790, strip: s, bingkai: 0, nama: "Jauh", diri: false },
    ];
    const label = m.labelTerdekat(8);
    expect(label.map((l) => l.id)).toEqual(["p0", "p1", "p2", "p3", "p4", "p5", "p6", "p7"]);
    expect(label.some((l) => l.id === "diri" || l.id === "jauh")).toBe(false);
  });
});
