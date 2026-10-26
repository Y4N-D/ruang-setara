// Uji aset Sehari Setara (spesifikasi F-12): warna game.css, manifest dan berkasnya, CREDITS.md, naskah,
// anggaran ukuran, fungsi pencari, dan aturan build aset sebagai berkas terpisah. Efek suara WAV: spesifikasi F-07.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import pagesConfig from "../../../vite.pages.config";
import {
  backgroundFor,
  backgrounds,
  emoteIcons,
  endings,
  floorShadows,
  iconStrips,
  icons,
  roleIcons,
  sceneAssets,
  shadowFor,
  sounds,
  spriteFor,
  sprites,
  teamIcons,
  type SpriteStrip,
} from "../assets/manifest";
import { SCENES } from "../content/scenes";
import type { Scene } from "../engine/types";
import {
  assetSummary,
  budgetProblems,
  colorLiteralProblems,
  creditProblems,
  decodePng,
  flattenPalette,
  groupProblems,
  headProblems,
  manifestEntries,
  manifestProblems,
  pngSize,
  sceneProblems,
  shadowProblems,
  tokenProblems,
  unregisteredFiles,
  wavInfo,
  type DecodedPng,
  type FileInfo,
  type ManifestGroups,
} from "./asset-checks";

const ROOT = new URL("../../../", import.meta.url);
const ASSETS = new URL("app/sehari-setara/assets/", ROOT);
const read = (path: string) => readFileSync(new URL(path, ROOT), "utf8");

const CSS = read("app/sehari-setara/styles/game.css");
const DESIGN = read("docs/sehari-setara/Design_System.md");
const PALETTE = flattenPalette(JSON.parse(read("scripts/game/art/palette.json")) as Record<string, unknown>);
const CREDITS = read("app/sehari-setara/assets/CREDITS.md");

/** Semua berkas di subfolder assets/ (bg, end, sprites, ui, dan sfx) beserta ukuran dan formatnya. */
function readAssetFiles(): Map<string, FileInfo> {
  const files = new Map<string, FileInfo>();
  for (const folder of readdirSync(ASSETS, { withFileTypes: true })) {
    if (!folder.isDirectory()) continue;
    for (const file of readdirSync(new URL(`${folder.name}/`, ASSETS), { withFileTypes: true })) {
      if (!file.isFile() || file.name.startsWith(".")) continue;
      const path = `${folder.name}/${file.name}`;
      const data = readFileSync(new URL(path, ASSETS));
      const wav = wavInfo(data);
      files.set(path, { bytes: data.byteLength, ...pngSize(data), ...(wav && { wav }) });
    }
  }
  return files;
}

const FILES = readAssetFiles();
const GROUPS: ManifestGroups = { backgrounds, endings, sprites, icons, iconStrips, teamIcons, roleIcons, emoteIcons, sounds };
const ENTRIES = manifestEntries(GROUPS);

/** Awalan URL impor aset di lingkungan uji, diambil dari impor sungguhan. */
const PREFIX = backgrounds.bg_title.slice(0, backgrounds.bg_title.indexOf("bg/bg_title.png"));

const withGroups = (changes: Partial<ManifestGroups>): ManifestGroups => ({ ...GROUPS, ...changes });
const withSprite = (char: string, pose: string, strip: SpriteStrip): ManifestGroups =>
  withGroups({ sprites: { ...GROUPS.sprites, [char]: { ...GROUPS.sprites[char], [pose]: strip } } });
const without = <T,>(table: Readonly<Record<string, T>>, key: string): Record<string, T> =>
  Object.fromEntries(Object.entries(table).filter(([name]) => name !== key));
const problemsOf = (groups: ManifestGroups, files: ReadonlyMap<string, FileInfo> = FILES) =>
  manifestProblems(manifestEntries(groups), files);

describe("warna game.css (AC-2)", () => {
  it("token sama dengan Design System bagian 4 dan palette.json, dan semua warna ada di palet", () => {
    expect(tokenProblems(CSS, DESIGN, PALETTE)).toEqual([]);
    expect(colorLiteralProblems(CSS, PALETTE)).toEqual([]);
  });

  it("pelanggaran token tertangkap", () => {
    const swap = (from: string, to: string, text = CSS) => {
      expect(text).toContain(from); // memastikan contoh masih cocok dengan berkas sungguhan
      return text.replace(from, to);
    };
    expect(tokenProblems(swap("--ss-focus: var(--ss-sun);", "--ss-focus: var(--ss-mango);"), DESIGN, PALETTE)).toEqual([
      "game.css: --ss-focus bernilai var(--ss-mango), seharusnya var(--ss-sun) (Design System bagian 4).",
    ]);
    expect(tokenProblems(swap("--ss-leaf: #8AD95B;", ""), DESIGN, PALETTE)).toEqual([
      "game.css: token --ss-leaf dari Design System bagian 4 tidak ada.",
    ]);
    expect(tokenProblems(swap("--ss-surface:", "--ss-sky: #6EC6F2;\n  --ss-surface:"), DESIGN, PALETTE)).toEqual([
      "game.css: token --ss-sky tidak ada di Design System bagian 4.",
      "game.css: --ss-sky tidak punya pasangan di palette.json.",
    ]);
    expect(tokenProblems(swap("--ss-sun: #FFD23F;", "--ss-sun: #FFD240;"), DESIGN, PALETTE)).toEqual([
      "game.css: --ss-sun bernilai #FFD240, seharusnya #FFD23F (Design System bagian 4).",
      "game.css: --ss-sun bernilai #FFD240, seharusnya #FFD23F (palette.json SUN).",
    ]);
    const gold = "--ss-sun: #FFD23F; --ss-gold: #FFD23F;";
    expect(tokenProblems(swap("--ss-sun: #FFD23F;", gold), swap("--ss-sun: #FFD23F;", gold, DESIGN), PALETTE)).toEqual([
      "game.css: --ss-gold tidak punya pasangan di palette.json.",
    ]);
  });

  it("warna di luar palet dan format lain tertangkap dengan nomor barisnya", () => {
    const sample = [
      ":root { --ss-ink: #1F2A44; }",
      "/* #123456 di dalam komentar tidak dibaca */",
      "#abc .ss-a { color: var(--ss-ink); }",
      ".ss-b {",
      "  color: #123456;",
      "  background: rgb(1 2 3 / 0.5);",
      "  border-color: hsl(0 0% 0%);",
      "  outline-color: rgb(10% 20% 30%);",
      "  box-shadow: 0 1px 0 rgb(31 42 68 / 0.10), 0 0 0 #fff;",
      "  outline: 2px solid transparent;",
      "}",
    ].join("\n");
    expect(colorLiteralProblems(sample, PALETTE)).toEqual([
      "game.css baris 5: warna #123456 tidak ada di palette.json.",
      "game.css baris 6: warna rgb(1 2 3 / 0.5) tidak ada di palette.json.",
      "game.css baris 7: warna hsl(0 0% 0%) tidak didukung; pakai hex atau rgb().",
      "game.css baris 8: warna rgb(10% 20% 30%) tidak didukung; pakai hex atau rgb().",
    ]);
  });
});

describe("manifest, berkas, kredit, dan naskah (AC-1, AC-3)", () => {
  it("setiap entri menunjuk berkas yang sesuai kuncinya, ukurannya cocok, dan fps dalam rentang", () => {
    expect(manifestProblems(ENTRIES, FILES)).toEqual([]);
  });

  it("kelompok bertipe lengkap", () => {
    expect(groupProblems(GROUPS)).toEqual([]);
  });

  it("setiap berkas terdaftar tercatat di CREDITS.md", () => {
    expect(creditProblems(ENTRIES, CREDITS).problems).toEqual([]);
  });

  it("setiap latar, tokoh-pose, dan ikon emosi di naskah ada di manifest", () => {
    expect(sceneProblems(SCENES, sceneAssets)).toEqual([]);
  });

  it("berkas, nama, dan ukuran yang salah tertangkap", () => {
    const walk = sprites.nara.walk;
    expect(problemsOf(withSprite("nara", "terbang", { ...walk, src: `${PREFIX}sprites/char_nara_terbang.png`, frames: 1, fps: 2 }))).toEqual([
      "Manifest: sprites.nara.terbang menunjuk berkas yang tidak ada: sprites/char_nara_terbang.png.",
    ]);
    expect(problemsOf(withSprite("nara", "idle", { ...sprites.nara.idle, src: sprites.nara.talk.src }))).toEqual([
      "Manifest: sprites.nara.idle menunjuk sprites/char_nara_talk.png, seharusnya sprites/char_nara_idle.png.",
      "Manifest: sprites/char_nara_talk.png terdaftar lebih dari sekali (sprites.nara.idle, sprites.nara.talk).",
    ]);
    expect(problemsOf(withGroups({ icons: { ...icons, star: iconStrips.star.src } }))).toEqual([
      "Manifest: icons.star berukuran 48×16, seharusnya 16×16.",
      "Manifest: ui/ui_star.png terdaftar lebih dari sekali (iconStrips.star, icons.star).",
    ]);
    expect(problemsOf(withSprite("nara", "walk", { ...walk, frames: 5 }))).toEqual([
      "Manifest: sprites.nara.walk berukuran 104×62, seharusnya 130×62 (5 bingkai × 26×62).",
    ]);
    expect(pngSize(new Uint8Array([1, 2, 3]))).toBeUndefined();
  });

  it("fps di luar rentang atau bukan bilangan bulat tertangkap", () => {
    expect(problemsOf(withSprite("nara", "walk", { ...sprites.nara.walk, fps: 12 }))).toEqual([
      "Manifest: sprites.nara.walk fps 12 di luar rentang 6–8.",
    ]);
    expect(problemsOf(withSprite("nara", "idle", { ...sprites.nara.idle, fps: 5 }))).toEqual([
      "Manifest: sprites.nara.idle fps 5 di luar rentang 2–4.",
    ]);
    expect(problemsOf(withSprite("nara", "talk", { ...sprites.nara.talk, fps: 2.5 }))).toEqual([
      "Manifest: sprites.nara.talk fps 2.5 bukan bilangan bulat.",
    ]);
  });

  it("kredit, aset naskah, dan kelompok yang tidak lengkap tertangkap", () => {
    const walkRow = "`sprites/char_nara_walk.png`";
    expect(CREDITS).toContain(walkRow);
    const tanpaWalk = CREDITS.split("\n").filter((line) => !line.includes(walkRow)).join("\n");
    expect(creditProblems(ENTRIES, tanpaWalk).problems).toEqual(["CREDITS.md: sprites/char_nara_walk.png belum tercatat."]);

    const s3: Scene = structuredClone(SCENES[2]);
    expect(s3.cast[1].char).toBe("sinta");
    s3.cast[1] = { ...s3.cast[1], pose: "marah" };
    expect(sceneProblems([s3], sceneAssets)).toEqual(["Adegan s3: char_sinta_marah tidak ada di manifest."]);

    expect(groupProblems(withGroups({ roleIcons: without(roleIcons, "hakim") }))).toEqual([
      "Manifest: roleIcons belum punya gambar untuk hakim.",
    ]);
    expect(groupProblems(withGroups({ sprites: without(sprites, "bayu") }))).toEqual([
      "Manifest: sprites belum punya gambar untuk bayu.",
    ]);
    expect(groupProblems(withGroups({ sprites: { ...sprites, warga: {} } }))).toEqual([
      "Manifest: sprites belum punya gambar untuk warga.",
    ]);
  });
});

// Ralat F-12 (dikerjakan di F-04): isi folder boleh memuat aset yang masih ditinjau dan belum terdaftar.
// Uji di sini tidak bergantung pada isi folder; yang diuji adalah laporan dan tidak adanya kegagalan.
describe("berkas yang belum terdaftar hanya dilaporkan (F-12 AC-4, ralat F-04 AC-13)", () => {
  it("berkas yang belum terdaftar di folder sungguhan muncul di ringkasan", () => {
    const unregistered = unregisteredFiles(ENTRIES, FILES);
    const lines = assetSummary(ENTRIES, FILES, unregistered, creditProblems(ENTRIES, CREDITS).extra).split("\n");
    for (const path of unregistered) expect(lines).toContain(`- ${path}`);
  });

  it("contoh muncul di ringkasan tanpa menggagalkan uji", () => {
    const files = new Map(FILES).set("ui/zz_contoh_baru.png", { bytes: 100, width: 16, height: 16 });
    const credits = `${CREDITS}\n| \`ui/zz_contoh_lama.png\` | D-99 | Contoh |\n`;
    expect(manifestProblems(ENTRIES, files)).toEqual([]);
    expect(budgetProblems(ENTRIES, files)).toEqual([]);
    const { problems, extra } = creditProblems(ENTRIES, credits);
    expect(problems).toEqual([]);
    expect(extra).toContain("ui/zz_contoh_lama.png");
    const unregistered = unregisteredFiles(ENTRIES, files);
    expect(unregistered).toEqual([...unregisteredFiles(ENTRIES, FILES), "ui/zz_contoh_baru.png"].sort());
    const lines = assetSummary(ENTRIES, files, unregistered, extra).split("\n");
    expect(lines).toContain("- ui/zz_contoh_baru.png");
    expect(lines).toContain("- ui/zz_contoh_lama.png");
  });
});

describe("anggaran ukuran (AC-5)", () => {
  it("dalam anggaran, lalu ringkasan dicetak", () => {
    expect(budgetProblems(ENTRIES, FILES)).toEqual([]);
    const summary = assetSummary(ENTRIES, FILES, unregisteredFiles(ENTRIES, FILES), creditProblems(ENTRIES, CREDITS).extra);
    console.log(summary);
    expect(summary).toMatch(
      /^Aset game: \d+ berkas terdaftar, \d+,\d KB dari anggaran 4 MB\.\nBelum terdaftar di manifest:( tidak ada\.|(\n- \S+)+)\nTercatat di CREDITS\.md tetapi belum terdaftar:( tidak ada\.|(\n- \S+)+)$/,
    );
  });

  it("latar, strip, dan total yang melebihi anggaran tertangkap", () => {
    const files = new Map(FILES)
      .set("bg/bg_s1_rumah_pagi.png", { ...FILES.get("bg/bg_s1_rumah_pagi.png"), bytes: 42_189 })
      .set("sprites/char_nara_walk.png", { ...FILES.get("sprites/char_nara_walk.png"), bytes: 15_872 });
    expect(budgetProblems(ENTRIES, files)).toEqual([
      "bg/bg_s1_rumah_pagi.png: 41,2 KB melebihi anggaran latar 40 KB.",
      "sprites/char_nara_walk.png: 15,5 KB melebihi anggaran strip 15 KB.",
    ]);
    // Total dibuat tepat 4,2 MB tanpa bergantung pada jumlah aset terdaftar (ralat F-12, F-04 AC-13).
    const besar = new Map([...FILES].map(([path, info]) => [path, { ...info, bytes: 0 }]));
    besar.set("bg/bg_title.png", { ...FILES.get("bg/bg_title.png"), bytes: Math.round(4.2 * 1024 * 1024) });
    expect(budgetProblems(ENTRIES, besar)).toContain("Seluruh aset terdaftar 4,2 MB melebihi anggaran 4 MB.");
  });
});

/** WAV PCM sintetis untuk contoh pelanggaran: kanal, bit, laju, dan banyak bingkai bisa diatur. */
function makeWav({ channels = 1, bits = 16, rate = 22050, frames = 700, format = 1 } = {}): Uint8Array {
  const dataBytes = frames * channels * (bits / 8);
  const bytes = new Uint8Array(44 + dataBytes);
  const view = new DataView(bytes.buffer);
  const tag = (at: number, text: string) => [...text].forEach((char, i) => (bytes[at + i] = char.charCodeAt(0)));
  tag(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  tag(8, "WAVE");
  tag(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * channels * (bits / 8), true);
  view.setUint16(32, channels * (bits / 8), true);
  view.setUint16(34, bits, true);
  tag(36, "data");
  view.setUint32(40, dataBytes, true);
  return bytes;
}

describe("efek suara (spesifikasi F-07, AC-18)", () => {
  const klikPath = "sfx/sfx_klik.wav";
  const withFile = (data: Uint8Array) => {
    const wav = wavInfo(data);
    return new Map(FILES).set(klikPath, { bytes: data.byteLength, ...(wav && { wav }) });
  };

  it("kedua bunyi terdaftar, berupa WAV PCM 16 bit mono 22.050 Hz, dan durasinya sesuai spesifikasi", () => {
    expect(Object.keys(sounds).sort()).toEqual(["klik", "teks"]);
    expect(FILES.get("sfx/sfx_klik.wav")).toEqual({ bytes: 2028, wav: { format: 1, channels: 1, sampleRate: 22050, bits: 16, durationMs: 45 } });
    expect(FILES.get("sfx/sfx_teks.wav")).toEqual({ bytes: 1454, wav: { format: 1, channels: 1, sampleRate: 22050, bits: 16, durationMs: 32 } });
    expect(ENTRIES.filter((entry) => entry.sound).map((entry) => [entry.label, entry.expected])).toEqual([
      ["sounds.klik", "sfx/sfx_klik.wav"],
      ["sounds.teks", "sfx/sfx_teks.wav"],
    ]);
    expect(creditProblems(ENTRIES, CREDITS).problems).toEqual([]);
  });

  it("stereo, 8 bit, bukan PCM, lebih dari 1 detik, dan bukan WAV tertangkap", () => {
    expect(problemsOf(GROUPS, withFile(makeWav({ channels: 2 })))).toEqual(["Manifest: sounds.klik harus mono, ternyata 2 kanal."]);
    expect(problemsOf(GROUPS, withFile(makeWav({ bits: 8 })))).toEqual(["Manifest: sounds.klik harus 16 bit, ternyata 8 bit."]);
    expect(problemsOf(GROUPS, withFile(makeWav({ format: 3, bits: 32 })))).toEqual([
      "Manifest: sounds.klik bukan WAV PCM (format 3).",
      "Manifest: sounds.klik harus 16 bit, ternyata 32 bit.",
    ]);
    expect(problemsOf(GROUPS, withFile(makeWav({ frames: 26_460 })))).toEqual(["Manifest: sounds.klik berdurasi 1200 ms, lebih dari 1 detik."]);
    expect(problemsOf(GROUPS, withFile(new Uint8Array([1, 2, 3])))).toEqual(["Manifest: sounds.klik bukan berkas WAV yang terbaca."]);
    expect(wavInfo(new Uint8Array(8))).toBeUndefined();
  });

  it("efek suara di atas 30 KB, nama berkas yang salah, kunci yang hilang, dan kredit yang hilang tertangkap", () => {
    const big = new Map(FILES).set(klikPath, { ...FILES.get(klikPath), bytes: 31 * 1024 });
    expect(budgetProblems(ENTRIES, big)).toEqual(["sfx/sfx_klik.wav: 31,0 KB melebihi anggaran efek suara 30 KB."]);
    expect(problemsOf(withGroups({ sounds: { ...sounds, klik: sounds.teks } }))).toEqual([
      "Manifest: sounds.klik menunjuk sfx/sfx_teks.wav, seharusnya sfx/sfx_klik.wav.",
      "Manifest: sfx/sfx_teks.wav terdaftar lebih dari sekali (sounds.klik, sounds.teks).",
    ]);
    expect(groupProblems(withGroups({ sounds: without(sounds, "teks") }))).toEqual(["Manifest: sounds belum punya bunyi untuk teks."]);
    const row = "`sfx/sfx_klik.wav`";
    expect(CREDITS).toContain(row);
    const tanpaKlik = CREDITS.split("\n").filter((line) => !line.includes(row)).join("\n");
    expect(creditProblems(ENTRIES, tanpaKlik).problems).toEqual(["CREDITS.md: sfx/sfx_klik.wav belum tercatat."]);
  });
});

describe("fungsi pencari (AC-6)", () => {
  it("spriteFor mengembalikan strip yang ada dan undefined untuk yang tidak ada", () => {
    expect(spriteFor("nara", "walk")).toEqual({ src: sprites.nara.walk.src, frames: 4, fps: 8, w: 26, h: 62, head: { x: 13, y: 2 } });
    expect(spriteFor("dimas", "motor")).toBe(sprites.dimas.motor);
    expect(spriteFor("nara", "terbang")).toBeUndefined();
    expect(spriteFor("nara", "constructor")).toBeUndefined();
    expect(spriteFor("nara", "toString")).toBeUndefined();
  });

  it("sceneAssets adegan 1 berurutan dan tanpa duplikat", () => {
    const refs = sceneAssets(SCENES[0]);
    expect(refs.map((ref) => ref.key)).toEqual([
      "bg_s1_rumah_pagi",
      "char_gita_happy",
      "char_nara_idle",
      "char_ibu_talk",
      "char_gita_sad",
      "char_nara_talk",
      "char_ibu_sad",
      "char_nara_happy",
      "char_ibu_happy",
      "emote_keringat",
      "emote_hati",
    ]);
    expect(refs[0]).toEqual({ key: "bg_s1_rumah_pagi", src: backgrounds.bg_s1_rumah_pagi });
    expect(refs.at(-1)).toEqual({ key: "emote_hati", src: emoteIcons.hati });
  });

  it("keenam adegan asli lengkap; pose yang tidak dikenal menghasilkan src undefined", () => {
    for (const scene of SCENES) {
      expect(sceneAssets(scene).filter((ref) => ref.src === undefined)).toEqual([]);
    }
    const tiruan: Scene = { ...structuredClone(SCENES[0]), cast: [{ char: "nara", pose: "terbang", x: 160, facing: "right" }] };
    expect(sceneAssets(tiruan)).toContainEqual({ key: "char_nara_terbang", src: undefined });
  });
});

describe("aturan build aset sebagai berkas terpisah (AC-7)", () => {
  it("aset game tidak pernah diselipkan; berkas lain memakai aturan bawaan Vite", () => {
    const limit = pagesConfig.build?.assetsInlineLimit;
    expect(typeof limit).toBe("function");
    if (typeof limit !== "function") return;
    const content = Buffer.alloc(16);
    expect(limit("/home/guru/ruang-setara/app/sehari-setara/assets/bg/bg_title.png", content)).toBe(false);
    expect(limit("C:\\Users\\guru\\ruang-setara\\app\\sehari-setara\\assets\\ui\\ui_star.png", content)).toBe(false);
    expect(limit("/home/guru/ruang-setara/public/stories/0-scene.jpg", content)).toBeUndefined();
    expect(limit("/home/guru/ruang-setara/app/sehari-setara/styles/game.css", content)).toBeUndefined();
  });
});

/** Gambar strip tokoh yang terdaftar, dibaca sebagai piksel RGBA (untuk titik kepala). */
function readSpriteImages(): Map<string, DecodedPng> {
  const images = new Map<string, DecodedPng>();
  for (const path of FILES.keys()) {
    if (!path.startsWith("sprites/")) continue;
    const png = decodePng(readFileSync(new URL(path, ASSETS)));
    if (png) images.set(path, png);
  }
  return images;
}

describe("titik kepala dan bayangan kaki (F-04 AC-12)", () => {
  const IMAGES = readSpriteImages();

  it("pembaca PNG cocok dengan ukuran di kepala berkas", () => {
    expect(IMAGES.size).toBe(ENTRIES.filter((entry) => entry.head).length);
    for (const [path, png] of IMAGES) {
      expect({ path, width: png.width, height: png.height }).toEqual({ path, width: FILES.get(path)?.width, height: FILES.get(path)?.height });
    }
    expect(decodePng(new Uint8Array([1, 2, 3]))).toBeUndefined();
  });

  it("titik kepala ke-33 strip sama dengan hasil pengukuran gambar", () => {
    expect(ENTRIES.filter((entry) => entry.head)).toHaveLength(33);
    expect(headProblems(ENTRIES, IMAGES)).toEqual([]);
  });

  it("titik kepala yang salah tertangkap", () => {
    const happy = sprites.dimas.happy;
    expect(headProblems(manifestEntries(withSprite("dimas", "happy", { ...happy, head: { x: 14, y: 1 } })), IMAGES)).toEqual([
      "Manifest: sprites.dimas.happy titik kepala (14, 1), seharusnya (19, 1) menurut gambar.",
    ]);
    const sinta = sprites.sinta.idle;
    expect(headProblems(manifestEntries(withSprite("sinta", "idle", { ...sinta, head: { x: 13, y: 3 } })), IMAGES)).toEqual([
      "Manifest: sprites.sinta.idle titik kepala (13, 3), seharusnya (13,5, 3) menurut gambar.",
    ]);
  });

  it("setiap latar punya warna bayangan dengan aturan CSS-nya", () => {
    expect(shadowProblems(backgrounds, floorShadows, CSS)).toEqual([]);
    expect(Object.keys(floorShadows).sort()).toEqual(Object.keys(backgrounds).sort());
  });

  it("latar tanpa warna bayangan dan aturan CSS yang hilang tertangkap", () => {
    expect(shadowProblems({ ...backgrounds, bg_s7_contoh: "x" }, floorShadows, CSS)).toEqual([
      "Manifest: floorShadows belum punya warna untuk bg_s7_contoh.",
    ]);
    const rule = '.ss-shadow[data-tone="dusk"]';
    expect(CSS).toContain(rule);
    expect(shadowProblems(backgrounds, floorShadows, CSS.split(rule).join(".ss-shadow-lain"))).toEqual([
      'game.css: tidak ada aturan .ss-shadow[data-tone="dusk"].',
    ]);
  });

  it("pencarian latar dan bayangan aman untuk kunci yang tidak ada", () => {
    expect(backgroundFor("bg_s1_rumah_pagi")).toBe(backgrounds.bg_s1_rumah_pagi);
    expect(shadowFor("bg_s2_jalan_pagi")).toBe("dusk");
    for (const key of ["bg_tidak_ada", "constructor", "toString"]) {
      expect(backgroundFor(key)).toBeUndefined();
      expect(shadowFor(key)).toBeUndefined();
    }
  });
});
