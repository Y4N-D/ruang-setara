// Uji gerak dan tabrakan (spesifikasi JS-02, P-24 sampai P-28; AC-7).
import { describe, expect, it } from "vitest";
import { acakBerbenih, benih } from "../../inti/acak";
import {
  arahDari,
  batasJarakGerak,
  DT_MAKS_MS,
  KECEPATAN,
  KECEPATAN_LARI,
  koreksi,
  KOTAK_KAKI,
  langkahGerak,
  periksaGerak,
  posisiSah,
  type LaporanGerak,
} from "../../inti/gerak";
import type { Arah, PetaJejak } from "../../inti/tipe";

/** Grid tabrakan dari baris teks: "#" padat, "." kosong. */
function petaDari(baris: string[]): Pick<PetaJejak, "lebar" | "tinggi" | "tabrakan"> {
  const lebar = baris[0].length;
  const tabrakan = new Uint8Array(lebar * baris.length);
  baris.forEach((b, y) => [...b].forEach((c, x) => (tabrakan[y * lebar + x] = c === "#" ? 1 : 0)));
  return { lebar, tinggi: baris.length, tabrakan };
}

const TERBUKA = petaDari(Array.from({ length: 40 }, () => ".".repeat(40))); // 640 × 640 piksel
//                        x: 0123456789
const BERDINDING = petaDari([
  "..........", // y 0
  "..........", // y 1
  "....#.....", // y 2: ubin (4,2) = x 64–80, y 32–48
  "....#.....", // y 3
  "..........", // y 4
  "######....", // y 5: y 80–96, x 0–96
  "..........", // y 6
]);

describe("kecepatan dan kotak kaki (P-24, P-25)", () => {
  it("kecepatan jalan 72 dan Lari cepat 115,2 piksel per detik", () => {
    expect(KECEPATAN).toBe(72);
    expect(KECEPATAN_LARI).toBe(115.2);
    expect(KECEPATAN_LARI).toBeCloseTo(KECEPATAN * 1.6, 10);
    expect(KOTAK_KAKI).toEqual({ lebar: 10, tinggi: 8 });
    expect(DT_MAKS_MS).toBe(1000);
  });

  it("kotak kaki boleh menyentuh tepi ubin padat, tetapi tidak menimpanya", () => {
    expect(posisiSah(BERDINDING, 59, 40)).toBe(true); // tepi kanan kotak tepat di x = 64
    expect(posisiSah(BERDINDING, 59.01, 40)).toBe(false);
    expect(posisiSah(BERDINDING, 85, 40)).toBe(true); // tepi kiri tepat di x = 80
    expect(posisiSah(BERDINDING, 84.99, 40)).toBe(false);
    expect(posisiSah(BERDINDING, 40, 80)).toBe(true); // tepi bawah tepat di y = 80
    expect(posisiSah(BERDINDING, 40, 80.01)).toBe(false);
    expect(posisiSah(BERDINDING, 40, 104)).toBe(true); // tepi atas tepat di y = 96
    expect(posisiSah(BERDINDING, 40, 103.99)).toBe(false);
  });

  it("batas peta padat", () => {
    expect(posisiSah(BERDINDING, 5, 20)).toBe(true);
    expect(posisiSah(BERDINDING, 4.99, 20)).toBe(false);
    expect(posisiSah(BERDINDING, 155, 20)).toBe(true);
    expect(posisiSah(BERDINDING, 155.01, 20)).toBe(false);
    expect(posisiSah(BERDINDING, 40, 8)).toBe(true);
    expect(posisiSah(BERDINDING, 40, 7.99)).toBe(false);
    expect(posisiSah(BERDINDING, 140, 112)).toBe(true);
    expect(posisiSah(BERDINDING, 140, 112.01)).toBe(false);
    expect(posisiSah(BERDINDING, Number.NaN, 20)).toBe(false);
  });
});

const langkah = (ubah: Partial<Parameters<typeof langkahGerak>[0]>) =>
  langkahGerak({ posisi: { x: 100, y: 100 }, arah: "bawah", dx: 0, dy: 0, dtMs: 1000, lari: false, peta: TERBUKA, ...ubah });

describe("langkahGerak di layar pemain (P-26, P-28)", () => {
  it("bergerak 72 piksel per detik, atau 115,2 saat Lari cepat", () => {
    expect(langkah({ dx: 1 }).x).toBeCloseTo(172, 9);
    expect(langkah({ dx: 1, lari: true }).x).toBeCloseTo(215.2, 9);
    expect(langkah({ dy: -1, dtMs: 100 }).y).toBeCloseTo(92.8, 9);
  });

  it("diagonal tidak lebih cepat: (1, 1) menempuh 72 piksel, bukan 72 × √2", () => {
    const h = langkah({ dx: 1, dy: 1 });
    expect(Math.hypot(h.x - 100, h.y - 100)).toBeCloseTo(72, 9);
    const lari = langkah({ dx: -1, dy: 1, lari: true });
    expect(Math.hypot(lari.x - 100, lari.y - 100)).toBeCloseTo(115.2, 9);
  });

  it("masukan joystick yang lebih pendek dari 1 berjalan lebih lambat", () => {
    expect(langkah({ dx: 0.5 }).x).toBeCloseTo(136, 9);
  });

  it("selang lebih dari 1 detik dianggap 1 detik; selang negatif tidak bergerak", () => {
    expect(langkah({ dx: 1, dtMs: 5000 }).x).toBeCloseTo(172, 9);
    const diam = langkah({ dx: 1, dtMs: -50 });
    expect([diam.x, diam.y, diam.bergerak]).toEqual([100, 100, false]);
  });

  it("meluncur di dinding: sumbu yang menabrak berhenti, sumbu lain tetap berjalan", () => {
    const h = langkah({ posisi: { x: 50, y: 50 }, dx: 1, dy: 1, dtMs: 200, peta: BERDINDING });
    expect(h.y).toBeCloseTo(50 + (72 * 0.2) / Math.SQRT2, 9);
    expect(h.x).toBeGreaterThan(50);
    expect(h.x).toBeLessThanOrEqual(59);
    expect(posisiSah(BERDINDING, h.x, h.y)).toBe(true);
  });

  it("berhenti di depan dinding tanpa menembusnya, juga pada selang 1 detik", () => {
    const h = langkah({ posisi: { x: 40, y: 40 }, dx: 1, dtMs: 1000, peta: BERDINDING });
    expect(h.x).toBeGreaterThan(55);
    expect(h.x).toBeLessThanOrEqual(59);
    expect(h.y).toBe(40);
  });

  it("tertahan di kedua sumbu: tidak bergerak", () => {
    const h = langkah({ posisi: { x: 5, y: 80 }, arah: "atas", dx: -1, dy: 1, dtMs: 100, peta: BERDINDING });
    expect([h.x, h.y, h.bergerak]).toEqual([5, 80, false]);
    expect(h.arah).toBe("bawah");
  });

  it("arah hadap mengikuti masukan; tanpa masukan arah tetap", () => {
    expect(arahDari(1, 0.2, "atas")).toBe("kanan");
    expect(arahDari(-1, 0, "atas")).toBe("kiri");
    expect(arahDari(0.2, -1, "kanan")).toBe("atas");
    expect(arahDari(0.5, 0.5, "kiri")).toBe("bawah");
    expect(arahDari(0, 0, "kiri")).toBe("kiri");
    expect(langkah({ arah: "kiri" })).toEqual({ x: 100, y: 100, arah: "kiri", bergerak: false });
  });
});

const lapor = (ubah: Partial<LaporanGerak> & { ke?: [number, number]; seq?: number; arahLapor?: Arah }) => {
  const { ke = [100, 100], seq = 6, arahLapor = "kanan", ...sisa } = ubah;
  return periksaGerak({
    posisi: { x: 100, y: 100, arah: "bawah" },
    laporan: { x: ke[0], y: ke[1], arah: arahLapor, seq },
    seqTerakhir: 5,
    dtMs: 100,
    lari: false,
    status: "main",
    dialogTerbuka: false,
    peta: TERBUKA,
    ...sisa,
  });
};

describe("periksaGerak di server (P-26, P-27)", () => {
  it("batas jarak: kecepatan × selang × 1,25 + 4 piksel", () => {
    expect(batasJarakGerak(100, false)).toBe(13);
    expect(batasJarakGerak(1000, false)).toBe(94);
    expect(batasJarakGerak(5000, false)).toBe(94);
    expect(batasJarakGerak(100, true)).toBeCloseTo(18.4, 9);
  });

  it("laporan dalam batas diterima dengan posisi dan arah laporan", () => {
    expect(lapor({ ke: [107.2, 100] })).toEqual({ diterima: true, x: 107.2, y: 100, arah: "kanan", seq: 6, alasan: null });
    expect(lapor({ ke: [113, 100] }).diterima).toBe(true);
  });

  it("melebihi batas toleransi ditolak karena kecepatan, dengan koreksi ke posisi sah terakhir", () => {
    const h = lapor({ ke: [113.01, 100] });
    expect(h).toEqual({ diterima: false, x: 100, y: 100, arah: "bawah", seq: 6, alasan: "kecepatan" });
    expect(koreksi(h)).toEqual({ x: 100, y: 100, seq: 6 });
  });

  it("diagonal tidak lebih cepat: jarak lurus yang diperiksa", () => {
    expect(lapor({ ke: [109.19, 109.19] }).diterima).toBe(true); // 12,99 piksel
    expect(lapor({ ke: [109.2, 109.2] }).alasan).toBe("kecepatan"); // 13,01 piksel
  });

  it("Lari cepat memperlebar batas, dan selang lebih dari 1 detik dianggap 1 detik", () => {
    expect(lapor({ ke: [118.3, 100] }).alasan).toBe("kecepatan");
    expect(lapor({ ke: [118.3, 100], lari: true }).diterima).toBe(true);
    expect(lapor({ ke: [118.5, 100], lari: true }).alasan).toBe("kecepatan");
    expect(lapor({ ke: [194, 100], dtMs: 5000 }).diterima).toBe(true);
    expect(lapor({ ke: [194.5, 100], dtMs: 5000 }).alasan).toBe("kecepatan");
  });

  it("ditolak tanpa koreksi karena seq, status, dialog, atau selang", () => {
    const kasus: [Partial<LaporanGerak> & { seq?: number }, string][] = [
      [{ seq: 5 }, "seq"],
      [{ seq: 2 }, "seq"],
      [{ status: "jeda" }, "status"],
      [{ status: "lobi" }, "status"],
      [{ status: "selesai" }, "status"],
      [{ dialogTerbuka: true }, "dialog"],
      [{ dtMs: 0 }, "waktu"],
    ];
    for (const [ubah, alasan] of kasus) {
      const h = lapor({ ...ubah, ke: [104, 100] });
      expect(h.alasan, alasan).toBe(alasan);
      expect([h.diterima, h.x, h.y, h.arah], alasan).toEqual([false, 100, 100, "bawah"]);
      expect(koreksi(h), alasan).toBeNull();
    }
    expect(koreksi(lapor({ ke: [104, 100] }))).toBeNull();
  });

  it("tujuan yang menabrak ditolak karena tabrakan, dengan koreksi", () => {
    const h = lapor({ posisi: { x: 55, y: 40, arah: "kanan" }, ke: [62, 40], peta: BERDINDING });
    expect(h.alasan).toBe("tabrakan");
    expect(koreksi(h)).toEqual({ x: 55, y: 40, seq: 6 });
  });

  it("tidak bisa melompati dinding walau jaraknya dalam batas", () => {
    const h = lapor({ posisi: { x: 59, y: 40, arah: "kanan" }, ke: [89, 40], dtMs: 1000, peta: BERDINDING });
    expect(posisiSah(BERDINDING, 89, 40)).toBe(true);
    expect(h.alasan).toBe("tabrakan");
  });

  it("menyusuri dinding dan berbelok di sudut ubin diterima", () => {
    expect(lapor({ posisi: { x: 59, y: 40, arah: "bawah" }, ke: [59, 47], peta: BERDINDING }).diterima).toBe(true);
    // Garis lurus dan "X dahulu" menembus ubin (5,5); jalan "Y dahulu, lalu X" bebas.
    const sudut = petaDari(Array.from({ length: 10 }, (_, y) => (y === 5 ? ".....#...." : "..........")));
    expect(posisiSah(sudut, 80, 97)).toBe(false);
    expect(lapor({ posisi: { x: 74, y: 90, arah: "bawah" }, ke: [86, 104], dtMs: 200, peta: sudut }).diterima).toBe(true);
  });
});

// Peta 30 × 20 ubin dengan dinding, tiang, dan sudut untuk simulasi banyak pemain.
const KOTA = petaDari([
  "..............................",
  "..............................",
  "....##......#.........###.....",
  "....##......#...........#.....",
  "............#.....#.....#.....",
  "..................#...........",
  "...#######........#.....#.....",
  ".........#..............#.....",
  ".........#....####......#.....",
  "..............#...............",
  "..............#.......####....",
  "....#.................#.......",
  "....#.......###.......#.......",
  "....#.........#...............",
  "..............#.....##........",
  "......####..........##........",
  "..............................",
  "...#.......#......#.....#.....",
  "..............................",
  "..............................",
]);

describe("50 pemain sekaligus", () => {
  it("gerak jujur 50 pemain selalu diterima server, dan hasilnya tidak bergantung urutan proses", () => {
    type Pemain = { x: number; y: number; arah: Arah; seq: number; acak: () => number; dx: number; dy: number; lari: boolean };
    const tempatMuncul: [number, number][] = [];
    for (let y = 20; y < 320 && tempatMuncul.length < 50; y += 26) {
      for (let x = 13; x < 480 && tempatMuncul.length < 50; x += 37) if (posisiSah(KOTA, x, y)) tempatMuncul.push([x, y]);
    }
    expect(tempatMuncul).toHaveLength(50);
    const buat = (): Pemain[] =>
      tempatMuncul.map(([x, y], i) => ({
        x,
        y,
        arah: "bawah",
        seq: 0,
        acak: acakBerbenih(benih("gerak-50", i)),
        dx: 0,
        dy: 0,
        lari: false,
      }));
    const satuPutaran = (p: Pemain) => {
      if (p.acak() < 0.3) {
        p.dx = Math.round(p.acak() * 2) - 1;
        p.dy = Math.round(p.acak() * 2) - 1;
        p.lari = p.acak() < 0.2;
      }
      const awal = { x: p.x, y: p.y, arah: p.arah };
      for (let f = 0; f < 6; f++) {
        const h = langkahGerak({ posisi: p, arah: p.arah, dx: p.dx, dy: p.dy, dtMs: 1000 / 60, lari: p.lari, peta: KOTA });
        p.x = h.x;
        p.y = h.y;
        p.arah = h.arah;
      }
      p.seq++;
      return periksaGerak({
        posisi: awal,
        laporan: { x: p.x, y: p.y, arah: p.arah, seq: p.seq },
        seqTerakhir: p.seq - 1,
        dtMs: 100,
        lari: p.lari,
        status: "main",
        dialogTerbuka: false,
        peta: KOTA,
      });
    };
    const berurutan = buat();
    const ditolak: string[] = [];
    for (const p of berurutan) {
      expect(posisiSah(KOTA, p.x, p.y)).toBe(true);
      for (let putaran = 0; putaran < 100; putaran++) {
        const h = satuPutaran(p);
        if (!h.diterima) ditolak.push(`${h.alasan} seq ${h.seq}`);
      }
    }
    expect(ditolak).toEqual([]);
    const berselang = buat();
    for (let putaran = 0; putaran < 100; putaran++) for (const p of berselang) satuPutaran(p);
    expect(berselang.map((p) => [p.x, p.y, p.arah])).toEqual(berurutan.map((p) => [p.x, p.y, p.arah]));
  });
});
