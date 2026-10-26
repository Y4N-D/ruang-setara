// Uji unit tata letak panggung Sehari Setara (spesifikasi F-04 AC-15; tambahan F-05 AC-15 dan F-07 AC-18).
import { describe, expect, it } from "vitest";
import { spriteFor, sprites } from "../assets/manifest";
import { SCENES } from "../content/scenes";
import type { CastSlot } from "../engine/types";
import {
  ARC,
  arcPointStates,
  arcTrackPixels,
  emoteBox,
  LAYOUT,
  parsePreviewHash,
  parseRoute,
  PLAY_HASH,
  previewHash,
  routeCast,
  shadowBox,
  spriteBox,
  stageScale,
  stageScaleForScreen,
  uiPixel,
} from "../ui/layout";

const slot = (char: CastSlot["char"], pose: string, x: number, facing: CastSlot["facing"] = "right"): CastSlot => ({
  char,
  pose,
  x,
  facing,
});

describe("skala panggung (Architecture bagian 7)", () => {
  it("memakai skala bulat bila sisa ruang di bawah 25 %, selain itu pecahan", () => {
    expect(stageScale(848, 446.4)).toBe(2); // fit 2,48
    expect(stageScale(320 * 3.72, 180 * 3.72)).toBe(3);
    const batas = 2 / 0.75; // fit tepat di batas: 2 / fit = 0,75
    expect(stageScale(320 * batas, 180 * batas)).toBe(2);
    expect(stageScale(320 * 2.67, 180 * 2.67)).toBeCloseTo(2.67, 10);
    expect(stageScale(320 * 0.8, 180 * 0.8)).toBeCloseTo(0.8, 10);
  });

  it("menghitung k dari tinggi layar 16:9 untuk keempat ukuran uji (area panggung 52u sejak F-05)", () => {
    expect([LAYOUT.barU, LAYOUT.stageU, LAYOUT.bottomU]).toEqual([8, 52, 40]);
    expect(stageScaleForScreen(720)).toBe(2); // 1280×720
    expect(stageScaleForScreen(768)).toBe(2); // 1366×768
    expect(stageScaleForScreen(1080)).toBe(3); // 1920×1080
    expect(stageScaleForScreen(576)).toBeCloseTo(1.664, 3); // 1024×768, layar 1024×576
  });

  it("satu piksel antarmuka adalah k yang dibulatkan, paling kecil 1 (F-05)", () => {
    expect([720, 768, 1080, 576].map((h) => uiPixel(stageScaleForScreen(h)))).toEqual([2, 2, 3, 2]);
    expect(uiPixel(1.664)).toBe(2);
    expect(uiPixel(1.4)).toBe(1);
    expect(uiPixel(2.5)).toBe(3);
    expect(uiPixel(0.4)).toBe(1);
  });
});

describe("posisi sprite, bayangan, dan ikon emosi", () => {
  it("sprite berpusat di x dengan baris terbawah di garis lantai", () => {
    expect(spriteBox(slot("nara", "idle", 152), sprites.nara.idle)).toEqual({ left: 139, top: 95, w: 26, h: 62, mirrored: false });
    expect(spriteBox(slot("gita", "happy", 124), sprites.gita.happy)).toEqual({ left: 112, top: 109, w: 24, h: 48, mirrored: false });
    expect(spriteBox(slot("ibu", "talk", 206, "left"), sprites.ibu.talk)).toEqual({ left: 191, top: 89, w: 30, h: 68, mirrored: true });
  });

  it("bayangan kaki selebar w − 6 dan setinggi 2 piksel di y 155", () => {
    expect(shadowBox(slot("nara", "idle", 152), sprites.nara.idle)).toEqual({ left: 142, top: 155, width: 20, height: 2 });
    expect(shadowBox(slot("gita", "happy", 124), sprites.gita.happy)).toEqual({ left: 115, top: 155, width: 18, height: 2 });
    expect(shadowBox(slot("dimas", "motor", 168), sprites.dimas.motor)).toEqual({ left: 143, top: 155, width: 50, height: 2 });
  });

  it("ikon emosi di atas kepala, termasuk Dimas di atas motor yang menghadap kanan dan kiri", () => {
    expect(emoteBox(slot("dimas", "happy", 168), sprites.dimas.happy)).toEqual({ left: 155, top: 86 });
    expect(emoteBox(slot("dimas", "happy", 168, "left"), sprites.dimas.happy)).toEqual({ left: 173, top: 86 });
    expect(emoteBox(slot("sinta", "happy", 186, "left"), sprites.sinta.happy)).toEqual({ left: 182, top: 88 });
  });

  it("posisi ke-18 ikon emosi sama dengan tabel spesifikasi", () => {
    const expected: Record<string, [number, number]> = {
      "s1 A": [203, 79], "s1 B": [120, 100], "s1 C": [120, 101],
      "s2 A": [224, 88], "s2 B": [155, 86], "s2 C": [224, 88],
      "s3 A": [182, 89], "s3 B": [182, 88], "s3 C": [136, 88],
      "s4 A": [60, 90], "s4 B": [108, 89], "s4 C": [60, 90],
      "s5 A": [35, 83], "s5 B": [113, 83], "s5 C": [251, 84],
      "s6 A": [164, 87], "s6 B": [164, 87], "s6 C": [164, 87],
    };
    const actual: Record<string, [number, number]> = {};
    for (const scene of SCENES) {
      for (const choice of scene.choices) {
        const emote = choice.emote;
        expect(emote).toBeDefined();
        if (!emote) continue;
        const target = choice.reaction.find((s) => s.char === emote.char);
        expect(target).toBeDefined();
        if (!target) continue;
        const strip = spriteFor(target.char, target.pose);
        expect(strip).toBeDefined();
        if (!strip) continue;
        const box = emoteBox(target, strip);
        actual[`${scene.id} ${choice.id}`] = [box.left, box.top];
      }
    }
    expect(actual).toEqual(expected);
  });
});

describe("busur hari", () => {
  it("enam titik berjarak 24 piksel membentuk lengkung rendah", () => {
    expect(ARC.points.map((p) => [p.x, p.y])).toEqual([[8, 14], [32, 11], [56, 10], [80, 10], [104, 11], [128, 14]]);
    expect([ARC.w, ARC.h]).toEqual([136, 22]);
  });

  it("status titik: lewat, berjalan, berikutnya", () => {
    expect(arcPointStates(0)).toEqual(["berjalan", "berikutnya", "berikutnya", "berikutnya", "berikutnya", "berikutnya"]);
    expect(arcPointStates(2)).toEqual(["lewat", "lewat", "berjalan", "berikutnya", "berikutnya", "berikutnya"]);
    expect(arcPointStates(5)).toEqual(["lewat", "lewat", "lewat", "lewat", "lewat", "berjalan"]);
  });

  it("garis busur satu piksel per kolom di antara titik, tidak masuk ke kotak titik", () => {
    const pixels = arcTrackPixels();
    expect(pixels).toHaveLength(90);
    for (const [x, y] of pixels) {
      expect(x >= 0 && x < ARC.w && y >= 0 && y < ARC.h).toBe(true);
      for (const p of ARC.points) expect(x >= p.x - 3 && x <= p.x + 2 && y >= p.y - 3 && y <= p.y + 2).toBe(false);
    }
    for (let i = 0; i < 5; i++) {
      for (let x = ARC.points[i].x + 3; x <= ARC.points[i + 1].x - 4; x++) {
        expect(pixels.filter(([px]) => px === x)).toHaveLength(1);
      }
    }
  });
});

describe("alamat pratinjau", () => {
  it("menerima ke-24 alamat sah dan dapat membalikkannya", () => {
    for (let n = 1; n <= 6; n++) {
      for (const view of ["situasi", "A", "B", "C"] as const) {
        const hash = view === "situasi" ? `#adegan-${n}` : `#adegan-${n}-${view.toLowerCase()}`;
        const route = parsePreviewHash(hash, 6);
        expect(route).toEqual({ sceneIndex: n - 1, view });
        if (route) expect(previewHash(route)).toBe(hash);
      }
    }
  });

  it("menolak alamat yang tidak dikenal", () => {
    for (const hash of ["", "#", "#adegan-0", "#adegan-7", "#adegan-01", "#adegan-1-d", "#adegan-1-A", "#adegan-1-", "#lain", "adegan-1"]) {
      expect(parsePreviewHash(hash, 6)).toBeNull();
    }
  });

  it("#main membuka layar permainan dengan dua tim; #main-3 dan #main-4 dengan tiga dan empat tim (F-05, F-07)", () => {
    expect(PLAY_HASH).toBe("#main");
    expect(parseRoute("#main", 6)).toEqual({ kind: "main", teams: 2 });
    expect(parseRoute("#main-3", 6)).toEqual({ kind: "main", teams: 3 });
    expect(parseRoute("#main-4", 6)).toEqual({ kind: "main", teams: 4 });
    expect(parseRoute("#adegan-2-b", 6)).toEqual({ kind: "pratinjau", preview: { sceneIndex: 1, view: "B" } });
    const rejected = ["", "#", "#Main", "#main-1", "#main-2", "#main-5", "#main-4x", "#main-03", "#mainkan", "main", "#adegan-7", "#lain", "#constructor"];
    for (const hash of rejected) expect(parseRoute(hash, 6)).toBeNull();
  });

  it("tampilan situasi memakai pemeran adegan; tampilan reaksi memakai susunan dan ikon emosi pilihannya", () => {
    const s4 = SCENES[3];
    expect(routeCast(s4, "situasi")).toEqual({ cast: s4.cast, emote: undefined });
    const b = s4.choices.find((choice) => choice.id === "B");
    expect(routeCast(s4, "B")).toEqual({ cast: b?.reaction, emote: b?.emote });
  });
});
