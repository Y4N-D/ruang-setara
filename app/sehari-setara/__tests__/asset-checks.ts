// Pemeriksa aset Sehari Setara (spesifikasi F-12).
// Semua fungsi murni: menerima teks dan data, lalu mengembalikan pesan. Pembacaan berkas ada di assets.test.ts,
// sehingga setiap aturan bisa diuji dengan contoh pelanggaran tanpa mengubah berkas sungguhan.
// Hanya diimpor uji, jadi tidak ikut terbundel.
import type { AssetRef, EmoteIcon, FrameStrip, SpriteStrip } from "../assets/manifest";
import type { CharId, EndingId, RoleId, Scene, Team } from "../engine/types";

/* ------------------------------------------------------------------ */
/* Warna: game.css, Design System bagian 4, dan palette.json           */
/* ------------------------------------------------------------------ */

/** Palet resmi: nama konstanta (INK, SKYD, …) → hex huruf besar. */
export type Palette = ReadonlyMap<string, string>;
type Rgb = readonly [number, number, number];

/** Meratakan palette.json (kelompok netral, aksen, …) dan melewati kunci berawalan "_". */
export function flattenPalette(json: Readonly<Record<string, unknown>>): Map<string, string> {
  const palette = new Map<string, string>();
  for (const [group, entries] of Object.entries(json)) {
    if (group.startsWith("_") || typeof entries !== "object" || entries === null) continue;
    for (const [name, hex] of Object.entries(entries as Record<string, unknown>)) {
      if (typeof hex === "string") palette.set(name, hex.toUpperCase());
    }
  }
  return palette;
}

/** Komentar CSS diganti spasi agar nomor baris tetap sama dengan berkas asli. */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
}

/** Spasi dirapikan dan hex ditulis huruf besar, supaya perbandingan tidak peka gaya penulisan. */
const tidy = (value: string) =>
  value.trim().replace(/\s+/g, " ").replace(/#[0-9a-f]{3,8}\b/gi, (hex) => hex.toUpperCase());

/** Token adalah deklarasi --ss-* di dalam blok :root (spesifikasi F-12, bagian Uji). */
export function rootTokens(css: string): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const block of stripComments(css).matchAll(/:root\s*\{([^}]*)\}/g)) {
    for (const declaration of block[1].matchAll(/(--ss-[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
      tokens.set(declaration[1], tidy(declaration[2]));
    }
  }
  return tokens;
}

/** Blok token Design System bagian 4: blok kode css pertama yang memuat --ss-ink. */
export function designTokens(designSystem: string): Map<string, string> {
  const blocks = [...designSystem.matchAll(/```css\r?\n([\s\S]*?)```/g)].map((match) => match[1]);
  return rootTokens(blocks.find((block) => block.includes("--ss-ink")) ?? "");
}

function hexToRgb(hex: string): Rgb | undefined {
  const digits = hex.slice(1);
  const twin = (i: number) => parseInt(digits[i] + digits[i], 16); // #rgb dan #rgba
  const pair = (i: number) => parseInt(digits.slice(i, i + 2), 16); // #rrggbb dan #rrggbbaa
  if (digits.length === 3 || digits.length === 4) return [twin(0), twin(1), twin(2)];
  if (digits.length === 6 || digits.length === 8) return [pair(0), pair(2), pair(4)];
  return undefined;
}

/** rgb()/rgba() dengan komponen bilangan bulat 0–255; alfa diabaikan. */
function rgbFunctionToRgb(literal: string): Rgb | undefined {
  const inner = literal.slice(literal.indexOf("(") + 1, literal.lastIndexOf(")"));
  const parts = inner.split(/[\s,/]+/).filter((part) => part !== "");
  const channels = parts.slice(0, 3);
  if (channels.length < 3 || !channels.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)) {
    return undefined;
  }
  return [Number(channels[0]), Number(channels[1]), Number(channels[2])];
}

const rgbKey = (rgb: Rgb) => rgb.join(",");

/**
 * Token game.css dibandingkan dengan blok token Design System bagian 4 (nilai harus sama persis),
 * lalu setiap token warna dasar dibandingkan dengan pasangannya di palette.json (--ss-sky-d → SKYD).
 */
export function tokenProblems(css: string, designSystem: string, palette: Palette): string[] {
  const problems: string[] = [];
  const mine = rootTokens(css);
  const design = designTokens(designSystem);
  for (const [name, value] of design) {
    const own = mine.get(name);
    if (own === undefined) problems.push(`game.css: token ${name} dari Design System bagian 4 tidak ada.`);
    else if (own !== value) problems.push(`game.css: ${name} bernilai ${own}, seharusnya ${value} (Design System bagian 4).`);
  }
  for (const name of mine.keys()) {
    if (!design.has(name)) problems.push(`game.css: token ${name} tidak ada di Design System bagian 4.`);
  }
  for (const [name, value] of mine) {
    if (!/^#[0-9A-F]{3,8}$/.test(value)) continue;
    const constant = name.slice("--ss-".length).replace(/-/g, "").toUpperCase();
    const expected = palette.get(constant);
    const actualRgb = hexToRgb(value);
    const expectedRgb = expected === undefined ? undefined : hexToRgb(expected);
    if (expected === undefined) {
      problems.push(`game.css: ${name} tidak punya pasangan di palette.json.`);
    } else if (actualRgb === undefined || expectedRgb === undefined || rgbKey(actualRgb) !== rgbKey(expectedRgb)) {
      problems.push(`game.css: ${name} bernilai ${value}, seharusnya ${expected} (palette.json ${constant}).`);
    }
  }
  return problems;
}

// Kelompok 1: hex; kelompok 2: rgb()/rgba(); kelompok 3: format warna lain yang tidak didukung.
const COLOR_LITERAL =
  /(#[0-9a-f]{3,8}\b)|(\brgba?\([^)]*\))|(\b(?:hsla?|hwb|lab|lch|oklab|oklch|color)\([^)]*\))/gi;

const lineAt = (text: string, index: number) => text.slice(0, index).split("\n").length;

/**
 * Setiap warna hex atau rgb() di nilai deklarasi harus ada di palette.json (alfa diabaikan).
 * Format lain (hsl() dan sejenisnya) tidak diterima. Pemilih dan komentar tidak dibaca.
 */
export function colorLiteralProblems(css: string, palette: Palette): string[] {
  const allowed = new Set<string>();
  for (const hex of palette.values()) {
    const rgb = hexToRgb(hex);
    if (rgb) allowed.add(rgbKey(rgb));
  }
  const problems: string[] = [];
  const text = stripComments(css);
  // Blok deklarasi terdalam: { … } tanpa kurung kurawal di dalamnya.
  for (const block of text.matchAll(/\{([^{}]*)\}/g)) {
    const blockStart = (block.index ?? 0) + 1;
    for (const declaration of block[1].matchAll(/([-\w]+)\s*:([^;]*)/g)) {
      const valueStart = blockStart + (declaration.index ?? 0) + declaration[0].length - declaration[2].length;
      for (const color of declaration[2].matchAll(COLOR_LITERAL)) {
        const [literal, hex, rgbFunction] = color;
        const where = `game.css baris ${lineAt(text, valueStart + (color.index ?? 0))}: warna ${literal}`;
        const rgb = hex ? hexToRgb(hex) : rgbFunction ? rgbFunctionToRgb(rgbFunction) : undefined;
        if (rgb === undefined) problems.push(`${where} tidak didukung; pakai hex atau rgb().`);
        else if (!allowed.has(rgbKey(rgb))) problems.push(`${where} tidak ada di palette.json.`);
      }
    }
  }
  return problems;
}

/* ------------------------------------------------------------------ */
/* Manifest, berkas, CREDITS.md, dan naskah                            */
/* ------------------------------------------------------------------ */

/** Bentuk manifest yang diperiksa; sama dengan ekspor kelompok di assets/manifest.ts. */
export interface ManifestGroups {
  readonly backgrounds: Readonly<Record<string, string>>;
  readonly endings: Readonly<Record<string, string>>;
  readonly sprites: Readonly<Record<string, Readonly<Record<string, SpriteStrip>>>>;
  readonly icons: Readonly<Record<string, string>>;
  readonly iconStrips: Readonly<Record<string, FrameStrip>>;
  readonly teamIcons: Readonly<Record<string, string>>;
  readonly roleIcons: Readonly<Record<string, string>>;
  readonly emoteIcons: Readonly<Record<string, string>>;
}

/** Satu entri manifest yang sudah diratakan. Ukuran dalam piksel logis. */
export interface ManifestEntry {
  readonly label: string; // misalnya "sprites.nara.idle"
  readonly src: string; // URL hasil impor
  readonly expected: string; // path yang sesuai kunci, relatif terhadap assets/
  readonly frames: number;
  readonly w: number;
  readonly h: number;
  readonly strip: boolean; // true: ukuran dari manifest; false: ukuran tetap kelompoknya
  readonly fps?: number; // hanya strip tokoh
  readonly pose?: string; // hanya strip tokoh
}

/** Ukuran dan isi berkas di subfolder assets/. Lebar dan tinggi hanya ada untuk PNG. */
export interface FileInfo {
  readonly bytes: number;
  readonly width?: number;
  readonly height?: number;
}

const ASSET_DIR = "app/sehari-setara/assets/";

/** Path relatif terhadap assets/ dari URL impor; undefined bila URL berada di luar folder aset. */
export function assetPath(src: string): string | undefined {
  const at = src.indexOf(ASSET_DIR);
  return at === -1 ? undefined : src.slice(at + ASSET_DIR.length).split(/[?#]/)[0];
}

/** Lebar dan tinggi PNG dari tanda tangan dan potongan IHDR; undefined bila bukan PNG. */
export function pngSize(data: Uint8Array): { width: number; height: number } | undefined {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (data.byteLength < 24 || signature.some((byte, i) => data[i] !== byte)) return undefined;
  if (String.fromCharCode(data[12], data[13], data[14], data[15]) !== "IHDR") return undefined;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

/** Meratakan manifest. Ukuran tetap per kelompok mengikuti Design System bagian 11. */
export function manifestEntries(groups: ManifestGroups): ManifestEntry[] {
  const entries: ManifestEntry[] = [];
  const single = (group: string, table: Readonly<Record<string, string>>, file: (key: string) => string, w: number, h: number) => {
    for (const [key, src] of Object.entries(table)) {
      entries.push({ label: `${group}.${key}`, src, expected: file(key), frames: 1, w, h, strip: false });
    }
  };
  single("backgrounds", groups.backgrounds, (key) => `bg/${key}.png`, 320, 180);
  single("endings", groups.endings, (key) => `end/end_${key}.png`, 320, 180);
  for (const [char, poses] of Object.entries(groups.sprites)) {
    for (const [pose, strip] of Object.entries(poses)) {
      entries.push({
        label: `sprites.${char}.${pose}`,
        src: strip.src,
        expected: `sprites/char_${char}_${pose}.png`,
        frames: strip.frames,
        w: strip.w,
        h: strip.h,
        strip: true,
        fps: strip.fps,
        pose,
      });
    }
  }
  single("icons", groups.icons, (key) => `ui/ui_${key}.png`, 16, 16);
  for (const [key, strip] of Object.entries(groups.iconStrips)) {
    entries.push({ label: `iconStrips.${key}`, src: strip.src, expected: `ui/ui_${key}.png`, frames: strip.frames, w: strip.w, h: strip.h, strip: true });
  }
  single("teamIcons", groups.teamIcons, (key) => `ui/ui_team_${key}.png`, 16, 16);
  single("roleIcons", groups.roleIcons, (key) => `ui/role_${key}.png`, 32, 32);
  single("emoteIcons", groups.emoteIcons, (key) => `ui/emote_${key}.png`, 8, 8);
  return entries;
}

/** Berkas ada, namanya sesuai kunci, tidak terdaftar dua kali, ukurannya cocok, dan fps dalam rentang. */
export function manifestProblems(entries: readonly ManifestEntry[], files: ReadonlyMap<string, FileInfo>): string[] {
  const problems: string[] = [];
  const labelsByPath = new Map<string, string[]>();
  for (const entry of entries) {
    if (entry.fps !== undefined) {
      const [min, max] = entry.pose === "walk" ? [6, 8] : [2, 4]; // Design System bagian 8
      if (!Number.isInteger(entry.fps)) problems.push(`Manifest: ${entry.label} fps ${entry.fps} bukan bilangan bulat.`);
      else if (entry.fps < min || entry.fps > max) problems.push(`Manifest: ${entry.label} fps ${entry.fps} di luar rentang ${min}–${max}.`);
    }
    const path = assetPath(entry.src);
    const info = path === undefined ? undefined : files.get(path);
    if (path === undefined || info === undefined) {
      problems.push(`Manifest: ${entry.label} menunjuk berkas yang tidak ada: ${path ?? entry.src}.`);
      continue;
    }
    labelsByPath.set(path, [...(labelsByPath.get(path) ?? []), entry.label]);
    if (path !== entry.expected) problems.push(`Manifest: ${entry.label} menunjuk ${path}, seharusnya ${entry.expected}.`);
    const width = entry.frames * entry.w;
    if (info.width !== width || info.height !== entry.h) {
      const actual = info.width === undefined ? "tidak terbaca" : `${info.width}×${info.height}`;
      const detail = entry.strip ? ` (${entry.frames} bingkai × ${entry.w}×${entry.h})` : "";
      problems.push(`Manifest: ${entry.label} berukuran ${actual}, seharusnya ${width}×${entry.h}${detail}.`);
    }
  }
  for (const [path, labels] of labelsByPath) {
    if (labels.length > 1) problems.push(`Manifest: ${path} terdaftar lebih dari sekali (${[...labels].sort().join(", ")}).`);
  }
  return problems;
}

/** Daftar kunci wajib; Record<…, true> membuat TypeScript menolak daftar yang tidak lengkap. */
const keysOf = <K extends string>(all: Record<K, true>): K[] => Object.keys(all) as K[];

const REQUIRED_KEYS = {
  endings: keysOf<EndingId>({ setara: true, hampir: true, berat: true }),
  sprites: keysOf<CharId>({
    nara: true, ibu: true, gita: true, dimas: true, sinta: true, ratih: true,
    komang: true, made: true, bayu: true, siswa: true, warga: true,
  }),
  teamIcons: keysOf<Team["shape"]>({ lingkaran: true, segitiga: true, persegi: true, bintang: true }),
  roleIcons: keysOf<RoleId>({ polisi: true, jaksa: true, advokat: true, hakim: true }),
  emoteIcons: keysOf<EmoteIcon>({ hati: true, keringat: true, tanya: true, seru: true }),
} as const;

/** Kelompok bertipe lengkap: setiap akhir, tokoh, bentuk tim, peran, dan ikon emosi punya gambar. */
export function groupProblems(groups: ManifestGroups): string[] {
  const problems: string[] = [];
  for (const [group, keys] of Object.entries(REQUIRED_KEYS)) {
    const table: Readonly<Record<string, unknown>> = groups[group as keyof typeof REQUIRED_KEYS];
    for (const key of keys) {
      const value = Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined;
      const empty = value === undefined || (typeof value === "object" && value !== null && Object.keys(value).length === 0);
      if (empty) problems.push(`Manifest: ${group} belum punya gambar untuk ${key}.`);
    }
  }
  return problems;
}

/** Path di kolom pertama tabel CREDITS.md, misalnya bg/bg_title.png. */
export function creditPaths(credits: string): string[] {
  return [...credits.matchAll(/^\|\s*`([^`]+)`\s*\|/gm)].map((match) => match[1]);
}

/** Path terdaftar yang berkasnya ada, tanpa duplikat. */
function registeredPaths(entries: readonly ManifestEntry[], files?: ReadonlyMap<string, FileInfo>): string[] {
  const paths = entries.map((entry) => assetPath(entry.src)).filter((path): path is string => path !== undefined);
  return [...new Set(paths)].filter((path) => files === undefined || files.has(path));
}

/**
 * Setiap berkas terdaftar wajib tercatat di CREDITS.md (masalah).
 * Baris CREDITS.md yang berkasnya belum terdaftar hanya dilaporkan (extra).
 */
export function creditProblems(entries: readonly ManifestEntry[], credits: string): { problems: string[]; extra: string[] } {
  const credited = new Set(creditPaths(credits));
  const registered = new Set(registeredPaths(entries));
  return {
    problems: [...registered].filter((path) => !credited.has(path)).map((path) => `CREDITS.md: ${path} belum tercatat.`),
    extra: [...credited].filter((path) => !registered.has(path)).sort(),
  };
}

/** Berkas di subfolder assets/ yang belum terdaftar di manifest. Hanya dilaporkan. */
export function unregisteredFiles(entries: readonly ManifestEntry[], files: ReadonlyMap<string, FileInfo>): string[] {
  const registered = new Set(registeredPaths(entries));
  return [...files.keys()].filter((path) => !registered.has(path)).sort();
}

/** Setiap latar, pasangan tokoh-pose, dan ikon emosi di naskah ada di manifest. */
export function sceneProblems(scenes: readonly Scene[], assetsOf: (scene: Scene) => readonly AssetRef[]): string[] {
  return scenes.flatMap((scene) =>
    assetsOf(scene)
      .filter((ref) => ref.src === undefined)
      .map((ref) => `Adegan ${scene.id}: ${ref.key} tidak ada di manifest.`),
  );
}

/* ------------------------------------------------------------------ */
/* Anggaran (Architecture bagian 8) dan ringkasan                       */
/* ------------------------------------------------------------------ */

const KB = 1024; // sama dengan build_assets.py
export const BUDGET = { latar: 40 * KB, strip: 15 * KB, total: 4 * KB * KB } as const;

/** Satu angka di belakang koma desimal, misalnya 61,4. */
const decimal = (value: number) => value.toFixed(1).replace(".", ",");

const totalBytes = (paths: readonly string[], files: ReadonlyMap<string, FileInfo>) =>
  paths.reduce((sum, path) => sum + (files.get(path)?.bytes ?? 0), 0);

/** Latar dan ilustrasi akhir ≤ 40 KB, strip tokoh ≤ 15 KB, seluruh aset terdaftar ≤ 4 MB. */
export function budgetProblems(entries: readonly ManifestEntry[], files: ReadonlyMap<string, FileInfo>): string[] {
  const problems: string[] = [];
  const paths = registeredPaths(entries, files);
  for (const path of paths) {
    const bytes = files.get(path)?.bytes ?? 0;
    if ((path.startsWith("bg/") || path.startsWith("end/")) && bytes > BUDGET.latar) {
      problems.push(`${path}: ${decimal(bytes / KB)} KB melebihi anggaran latar 40 KB.`);
    }
    if (path.startsWith("sprites/") && bytes > BUDGET.strip) {
      problems.push(`${path}: ${decimal(bytes / KB)} KB melebihi anggaran strip 15 KB.`);
    }
  }
  const total = totalBytes(paths, files);
  if (total > BUDGET.total) problems.push(`Seluruh aset terdaftar ${decimal(total / KB / KB)} MB melebihi anggaran 4 MB.`);
  return problems;
}

/** Ringkasan yang dicetak setiap kali uji aset berjalan (spesifikasi F-12, "Teks yang tampil"). */
export function assetSummary(
  entries: readonly ManifestEntry[],
  files: ReadonlyMap<string, FileInfo>,
  unregistered: readonly string[],
  extraCredits: readonly string[],
): string {
  const paths = registeredPaths(entries, files);
  const list = (items: readonly string[]) =>
    items.length === 0 ? " tidak ada." : `\n${items.map((item) => `- ${item}`).join("\n")}`;
  return [
    `Aset game: ${paths.length} berkas terdaftar, ${decimal(totalBytes(paths, files) / KB)} KB dari anggaran 4 MB.`,
    `Belum terdaftar di manifest:${list(unregistered)}`,
    `Tercatat di CREDITS.md tetapi belum terdaftar:${list(extraCredits)}`,
  ].join("\n");
}
