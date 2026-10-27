// Uji ujung ke ujung layar akhir, rekap, refleksi, dan unduh rekap Sehari Setara (spesifikasi F-09, Rencana uji langkah 3
// sampai 9). Membuka hasil build di /ruang-setara/sehari-setara/#main, #main-3, dan #main-4 lewat serve-subpath.mjs.
// Jam uji dijeda sebelum halaman dimuat, sehingga kartu, kuis, pergantian adegan, dan masa tunggu hanya maju lewat
// page.clock.runFor, dalam dua langkah sesudah unsur tampil. Uji unduhan tidak memasang jam uji, karena jam palsu juga
// menghentikan requestAnimationFrame dan pewaktu modern-screenshot (Rencana uji langkah 7). Gerak timbangan dan pop
// bintang diatur lewat Web Animations API, karena animasi CSS tidak mengikuti jam uji. Perekam bunyi adalah skrip awal
// halaman milik uji, seperti di suara.spec.ts. Nilai yang diharapkan dihitung dari naskah asli dengan reducer F-02 dan
// fungsi murni ui/closing.ts, bukan dari salinan teks spesifikasi.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Download, type Locator, type Page } from "@playwright/test";
import { copy } from "../app/sehari-setara/content/copy";
import { ENDINGS } from "../app/sehari-setara/content/endings";
import { ROLES } from "../app/sehari-setara/content/roles";
import { SCENES } from "../app/sehari-setara/content/scenes";
import { DEFAULT_TEAMS } from "../app/sehari-setara/content/teams";
import { createInitialState, createReducer } from "../app/sehari-setara/engine/reducer";
import { activeTeamIndex, endingFor, narrationFor, starsByTeam } from "../app/sehari-setara/engine/rules";
import type { ChoiceId, EndingId, GameAction, GameState, RoleId, Stars, Tier } from "../app/sehari-setara/engine/types";
import {
  endingAnnouncement,
  quizLine,
  recapPageAnnouncement,
  recapPages,
  recapRows,
  reflectionAnnouncement,
  scaleSentence,
  scaleView,
  topTeamIds,
  type RecapRow,
  type ScaleMotion,
} from "../app/sehari-setara/ui/closing";
import { runActions, startActions } from "../app/sehari-setara/ui/controls";
import { starsAnnouncement, teamSentence } from "../app/sehari-setara/ui/turn";
import {
  awardPrompt,
  BAR,
  cardNext,
  contrast,
  CREAM,
  endingNext,
  endingScreen,
  endingTitle,
  expectClean,
  finishDay,
  INK,
  measureBar,
  playAgain,
  playAgainButton,
  quizDialog,
  quizNext,
  quizTitle,
  recapNext,
  recapTitle,
  reflectionTitle,
  SHOTS,
  SUN,
  VIEWPORTS,
  watch,
  type ViewportName,
} from "./bantuan";

type TeamCount = 2 | 3 | 4;
type Kind = "png" | "pdf";

const T0 = new Date("2026-10-27T08:00:00+08:00").getTime();
const SIZES = Object.keys(VIEWPORTS) as ViewportName[];
const ROUTES: Record<TeamCount, string> = { 2: "#main", 3: "#main-3", 4: "#main-4" };
const PAGES = recapPages(SCENES);
const reducer = createReducer(SCENES);
const text = copy.closing;

const MALAM = "rgb(74, 79, 156)";
const MIST = "rgb(201, 212, 229)";
const DUSK = "rgb(58, 74, 107)";
const HEAD: Record<string, string> = { pagi: "rgb(255, 217, 168)", siang: "rgb(110, 198, 242)", sore: "rgb(255, 194, 122)", malam: MALAM };
const TIER_BG: Record<Tier, string> = { tepat: "rgb(138, 217, 91)", kurang: "rgb(255, 159, 28)", berisiko: "rgb(255, 107, 91)" };
const OLD_TEXTS = ["Keenam adegan selesai", "Layar akhir, rekap, dan refleksi sedang dibuat.", "Main lagi dari adegan 1"];
const APP_DIR = fileURLToPath(new URL("../app", import.meta.url));
/** Gambar layar akhir di hasil build: ketiga ilustrasi akhir dan strip timbangan. */
const ENDING_ASSET = /\/(end_(?:setara|hampir|berat)|ui_timbangan)-[^/]*\.png$/;
/** Bagian layar permainan yang tidak dipasang di rekap dan refleksi (AC-12). */
const UNMOUNTED = [".ss-topbar", ".ss-meters", ".ss-stage-area", ".ss-play-panel", ".ss-side", ".ss-teams"];

/* ---------------- Tabel spesifikasi, bagian "Tata letak dan ukuran" ---------------- */

/** "Lihat rekap": atas, bawah, kiri, kanan (u). */
const ENDING_NEXT: Record<ViewportName, number[]> = {
  "1280x720": [92.5, 98.8, 151.8, 173.8],
  "1366x768": [92.5, 98.8, 151.8, 173.8],
  "1920x1080": [92.5, 98.8, 151.8, 173.8],
  "1024x768": [92.2, 98.8, 151.5, 173.8],
};
/** Timbangan di bingkai panggung: kiri, atas, lebar, tinggi (piksel layar). */
const SCALE_PX: Record<ViewportName, number[]> = {
  "1280x720": [464, 32, 96, 64],
  "1366x768": [464, 32, 96, 64],
  "1920x1080": [696, 48, 144, 96],
  "1024x768": [386, 27, 80, 53],
};
/** Tombol kaki rekap (u): Berikutnya [atas, bawah, kiri, kanan]; Sebelumnya, Sebelumnya halaman 4, dan Lanjut ke refleksi [kiri, kanan]. */
const RECAP_BUTTONS: Record<ViewportName, { next: number[]; prev: number[]; prev4: number[]; reflect: number[] }> = {
  "1280x720": { next: [92.5, 98.8, 152.3, 173.8], prev: [128.4, 150.3], prev4: [119.7, 141.5], reflect: [143.5, 173.8] },
  "1366x768": { next: [92.5, 98.8, 152.3, 173.8], prev: [128.5, 150.3], prev4: [119.8, 141.6], reflect: [143.6, 173.8] },
  "1920x1080": { next: [92.5, 98.8, 152.3, 173.8], prev: [128.4, 150.3], prev4: [119.7, 141.5], reflect: [143.5, 173.8] },
  "1024x768": { next: [92.2, 98.8, 152.0, 173.8], prev: [127.9, 150.0], prev4: [119.2, 141.3], reflect: [143.3, 173.8] },
};
/** Refleksi (u): Main lagi [atas, bawah, kiri, kanan]; tiga tombol lain [kiri, kanan]; jarak kelompok; sisa di bawah kotak. */
const REFLECTION_LAYOUT: Record<ViewportName, { play: number[]; gallery: number[]; png: number[]; pdf: number[]; gap: number; spare: number }> = {
  "1280x720": { play: [88.9, 97.0, 12.0, 39.1], gallery: [42.1, 80.9], png: [97.6, 133.3], pdf: [136.3, 165.8], gap: 16.7, spare: 31.8 },
  "1366x768": { play: [88.9, 97.0, 12.0, 39.0], gallery: [42.0, 80.8], png: [97.7, 133.4], pdf: [136.4, 165.8], gap: 16.9, spare: 31.9 },
  "1920x1080": { play: [88.9, 97.0, 12.0, 39.1], gallery: [42.1, 80.9], png: [97.6, 133.3], pdf: [136.3, 165.8], gap: 16.7, spare: 31.8 },
  "1024x768": { play: [88.6, 97.0, 12.0, 39.3], gallery: [42.3, 81.4], png: [97.0, 133.0], pdf: [136.0, 165.8], gap: 15.6, spare: 31.2 },
};
/** Ukuran huruf rekap (u). */
const RECAP_FONTS = {
  title: 2.8, page: 2.5, label: 2.5, number: 2.8, scene: 3.1, clock: 2.5, team: 2.5,
  choice: 3.1, key: 2.5, tier: 2.5, quiz: 2.5, same: 3.1, refs: 3.1,
};
/** Waktu contoh gerak timbangan, dan bingkai yang tampil pada waktu itu lalu sesudah selesai (bagian "Timbangan: gerak"). */
const SCALE_TIMES = [0, 299, 400, 600, 800, 1000];
const FRAMES_AT: Record<ScaleMotion, number[]> = {
  seimbang: [2, 2, 2, 1, 3, 2, 2],
  "sedikit-kanan": [2, 2, 2, 1, 3, 3, 3],
  "sedikit-kiri": [2, 2, 2, 3, 1, 1, 1],
  "miring-kanan": [2, 2, 2, 1, 3, 4, 4],
  "miring-kiri": [2, 2, 2, 3, 1, 0, 0],
};

/* ---------------- Model permainan ---------------- */

interface Day {
  path: string;
  stars: readonly Stars[];
  role: RoleId;
  teams: TeamCount;
}

function day(path: string, options: Partial<Omit<Day, "path">> = {}): Day {
  return { path, stars: [1, 1, 1, 1, 1, 1], role: "hakim", teams: 2, ...options };
}

/** Keadaan mesin sesudah satu hari dengan aksi yang sama dengan layar permainan (seperti closing.test.ts). */
function model(d: Day): GameState {
  let state = runActions(reducer, createInitialState(), startActions(DEFAULT_TEAMS.slice(0, d.teams)));
  [...d.path].forEach((id, i) => {
    const actions: GameAction[] = [
      { type: "NARASI_SELESAI" },
      { type: "PILIH", choice: id as ChoiceId },
      { type: "REAKSI_SELESAI" },
      { type: "LANJUT" },
    ];
    if (SCENES[i].roleQuiz) actions.push({ type: "JAWAB_KUIS", role: d.role }, { type: "LANJUT" });
    actions.push({ type: "BERI_BINTANG", stars: d.stars[i] }, { type: "LANJUT" });
    state = runActions(reducer, state, actions);
  });
  if (state.phase !== "ending") throw new Error(`jalur ${d.path} tidak sampai layar akhir`);
  return state;
}

/* ---------------- Perekam bunyi (seperti suara.spec.ts) ---------------- */

interface SoundRecord {
  contexts: AudioContext[];
  decoded: number;
  plays: { at: number; duration: number }[];
}

/** Dijalankan di halaman sebelum kode game (page.addInitScript). */
function installRecorder() {
  const record = { contexts: [] as AudioContext[], decoded: 0, plays: [] as { at: number; duration: number }[] };
  (window as unknown as { ssBunyi: typeof record }).ssBunyi = record;
  const Original = window.AudioContext;
  if (!Original) return;
  class Recorded extends Original {
    constructor(options?: AudioContextOptions) {
      super(options);
      record.contexts.push(this);
    }
  }
  window.AudioContext = Recorded;
  const decode = BaseAudioContext.prototype.decodeAudioData;
  BaseAudioContext.prototype.decodeAudioData = function (this: BaseAudioContext, data: ArrayBuffer) {
    return decode.call(this, data).then((buffer) => {
      record.decoded += 1;
      return buffer;
    });
  };
  const sourceProto = AudioBufferSourceNode.prototype as unknown as { start: (...args: unknown[]) => void };
  const start = sourceProto.start;
  sourceProto.start = function (this: AudioBufferSourceNode, ...args: unknown[]) {
    record.plays.push({ at: performance.now(), duration: this.buffer?.duration ?? 0 });
    return start.apply(this, args);
  };
}

const soundRecord = (page: Page) =>
  page.evaluate(() => {
    const record = (window as unknown as { ssBunyi: SoundRecord }).ssBunyi;
    return { states: record.contexts.map((context) => context.state), decoded: record.decoded, plays: [...record.plays] };
  });
/** Jumlah bunyi klik (45 ms); bunyi teks 32 ms tidak dihitung. */
const clickCount = async (page: Page) => (await soundRecord(page)).plays.filter((played) => played.duration > 0.04).length;

/** Tekanan pembuka x (tidak berpengaruh pada permainan), lalu menunggu konteks berjalan dan kedua bunyi siap. */
async function unlock(page: Page) {
  await page.keyboard.press("x");
  await expect.poll(async () => (await soundRecord(page)).decoded).toBe(2);
  await expect.poll(async () => (await soundRecord(page)).states).toEqual(["running"]);
}

/* ---------------- Pemilih dan langkah halaman ---------------- */

const live = (page: Page) => page.locator('.ss-play [aria-live="polite"]');
const status = (page: Page) => page.locator('.ss-play [role="status"]');
const recapScreen = (page: Page, p: number) => page.locator(`.ss-recap[data-halaman="${p}"]`);
const prevButton = (page: Page) => page.getByRole("button", { name: text.recap.prev, exact: true });
const galleryLink = (page: Page) => page.getByRole("link", { name: copy.backToGallery, exact: true });
const downloadButton = (page: Page, kind: Kind) => page.locator(`.ss-download [data-unduh="${kind}"]`);
const downloadLine = (page: Page) => page.locator(".ss-download-status");
const narrationText = (page: Page) => page.locator(".ss-narration-text");

/** Layar yang sedang tampil: akhir, rekap-{p}, refleksi, narasi, atau lain. */
const where = (page: Page) =>
  page.evaluate(() => {
    if (document.querySelector(".ss-play[data-akhir]")) return "akhir";
    const recap = document.querySelector(".ss-recap");
    if (recap) return `rekap-${recap.getAttribute("data-halaman")}`;
    if (document.querySelector(".ss-reflection")) return "refleksi";
    if (document.querySelector(".ss-narration")) return "narasi";
    return "lain";
  });

interface OpenOptions {
  size?: ViewportName;
  teams?: TeamCount;
  reduce?: boolean;
  /** Jam uji dijeda sejak sebelum halaman dimuat; false untuk uji unduhan. */
  paused?: boolean;
  recorder?: boolean;
}

async function openPlay(page: Page, { size = "1280x720", teams = 2, reduce = false, paused = true, recorder = false }: OpenOptions = {}) {
  const { width, height } = VIEWPORTS[size];
  if (recorder) await page.addInitScript(installRecorder);
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: reduce ? "reduce" : "no-preference" });
  if (paused) {
    await page.clock.install({ time: T0 });
    await page.clock.pauseAt(T0 + 60_000);
  }
  await page.goto(`sehari-setara/${ROUTES[teams]}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".ss-narration")).toBeVisible();
}

/** Mengubah ukuran jendela dan menunggu layar 16:9, satu piksel antarmuka, dan bingkai panggung (bila ada) mengikutinya. */
async function resize(page: Page, size: ViewportName) {
  const { width, height, k, px } = VIEWPORTS[size];
  await page.setViewportSize({ width, height });
  const screenHeight = Math.min(height, (width * 9) / 16);
  await expect
    .poll(() => page.evaluate(() => (document.querySelector(".ss-screen") as HTMLElement).getBoundingClientRect().height))
    .toBeCloseTo(screenHeight, 0);
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.querySelector(".ss-screen") as HTMLElement).getPropertyValue("--ss-px").trim()))
    .toBe(`${px}px`);
  if ((await page.locator(".ss-stage-frame").count()) > 0) {
    await expect.poll(() => page.locator(".ss-stage-frame").evaluate((element) => element.getBoundingClientRect().width)).toBeCloseTo(320 * k, 0);
  }
}

/** Isi kartu dampak dan teks pilihan yang tampil saat adegan dimainkan, untuk dibandingkan dengan rekap. */
interface Card {
  refs: string[];
  icon: string;
  tier: string;
  chosen: string;
  best: string;
}

interface PlayOptions {
  paused?: boolean;
  /** Dipanggil saat adegan i tampil (bilah atas sudah berganti), sebelum narasi dilewati. */
  atScene?: (index: number) => Promise<void>;
  /** Dipanggil tepat sebelum bintang adegan 6. */
  beforeLastStars?: () => Promise<void>;
}

/**
 * Satu hari penuh dengan keyboard: narasi, pilihan, kartu dampak, kuis peran di adegan 5 (belum dijawab saat tampil),
 * bintang alasan, lalu pergantian adegan. Berakhir di layar akhir dengan judul berfokus. Dengan jam dijeda, waktu
 * dimajukan page.clock.runFor; tanpa itu, uji menunggu tombol siap.
 */
async function playDay(page: Page, d: Day, { paused = true, atScene, beforeLastStars }: PlayOptions = {}): Promise<Card[]> {
  const cards: Card[] = [];
  const roleKey = String(ROLES.findIndex((role) => role.id === d.role) + 1);
  for (let i = 0; i < SCENES.length; i++) {
    await expect(page.locator(".ss-topbar-counter")).toHaveText(`Adegan ${i + 1}/6`);
    if (atScene) await atScene(i);
    while ((await page.locator(".ss-question").count()) === 0) await page.keyboard.press("Space");
    await expect(page.locator(".ss-question")).toBeFocused();
    const letter = d.path[i];
    const shown = await page.evaluate((id) => {
      const textOf = (choice: string) => {
        const element = document.querySelector(`.ss-choice[data-choice="${choice}"] .ss-choice-text`);
        if (!element) return "";
        return [...element.childNodes]
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent ?? "")
          .join("");
      };
      return { chosen: textOf(id), best: textOf("B") };
    }, letter);
    await page.keyboard.press(letter);
    if (paused) await page.clock.runFor(1200);
    await expect(page.locator("#ss-impact-title")).toBeFocused();
    const impact = await page.evaluate(() => ({
      refs: [...document.querySelectorAll(".ss-impact-refs li")].map((item) => item.textContent ?? ""),
      icon: getComputedStyle(document.querySelector(".ss-impact-icon") as Element).backgroundImage,
      tier: document.querySelector(".ss-impact")?.getAttribute("data-tier") ?? "",
    }));
    cards.push({ ...impact, ...shown });
    if (paused) await page.clock.runFor(600);
    else await expect(cardNext(page)).not.toHaveAttribute("aria-disabled", /.*/);
    await page.keyboard.press("Enter");
    if (SCENES[i].roleQuiz) {
      await expect(quizDialog(page)).toBeVisible();
      await expect(quizTitle(page)).toBeFocused();
      await expect(page.locator(".ss-quiz-card[data-terbuka]")).toHaveCount(0);
      await page.keyboard.press(roleKey);
      await expect(page.locator(".ss-quiz-card[data-terbuka]")).toHaveCount(ROLES.length);
      await expect(quizNext(page)).toBeFocused();
      if (paused) await page.clock.runFor(600);
      else await expect(quizNext(page)).not.toHaveAttribute("aria-disabled", /.*/);
      await page.keyboard.press("Enter");
      await expect(quizDialog(page)).toHaveCount(0);
    }
    await expect(awardPrompt(page)).toBeFocused();
    if (i === SCENES.length - 1 && beforeLastStars) await beforeLastStars();
    await page.keyboard.press(String(d.stars[i]));
    if (i < SCENES.length - 1 && paused) await page.clock.runFor(400);
  }
  await expect(endingScreen(page)).toBeVisible();
  await expect(endingTitle(page)).toBeFocused();
  return cards;
}

/** Menunggu huruf dan semua gambar latar di layar termuat, tanpa requestAnimationFrame (aman dengan jam uji). */
async function waitImages(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const selector = ".ss-stage-bg, .ss-scale, .ss-meter-icon, .ss-team-icon, .ss-team-star, .ss-recap-icon";
    const urls = [...document.querySelectorAll<HTMLElement>(selector)]
      .map((element) => /url\("(.*)"\)/.exec(getComputedStyle(element).backgroundImage)?.[1] ?? "")
      .concat([...document.querySelectorAll("image.ss-dayarc-icon")].map((element) => (element as SVGImageElement).href.baseVal))
      .filter((url) => url !== "");
    await Promise.all(
      urls.map((url) => {
        const image = new Image();
        image.src = url;
        return image.decode();
      }),
    );
  });
}

async function shot(page: Page, name: string) {
  await waitImages(page);
  await page.screenshot({ path: `${SHOTS}/${name}` });
}

function near(actual: number, expected: number, tolerance: number, note: string) {
  expect(Math.abs(actual - expected), `${note}: terukur ${actual.toFixed(2)}, tabel ${expected}`).toBeLessThanOrEqual(tolerance + 1e-6);
}

interface BoxU {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Kotak terukur dibandingkan dengan tabel ±0,5u: [atas, bawah, kiri, kanan] atau [kiri, kanan]. */
function nearBox(box: BoxU, expected: number[], note: string) {
  if (expected.length === 4) {
    near(box.top, expected[0], 0.5, `${note} atas`);
    near(box.bottom, expected[1], 0.5, `${note} bawah`);
  }
  near(box.left, expected[expected.length - 2], 0.5, `${note} kiri`);
  near(box.right, expected[expected.length - 1], 0.5, `${note} kanan`);
}

/* ---------------- Pengukuran ---------------- */

async function measureEnding(page: Page) {
  return page.evaluate(() => {
    const screen = (document.querySelector(".ss-screen") as HTMLElement).getBoundingClientRect();
    const u = screen.height / 100;
    const rel = (element: Element) => {
      const r = element.getBoundingClientRect();
      return {
        top: (r.top - screen.top) / u,
        bottom: (r.bottom - screen.top) / u,
        left: (r.left - screen.left) / u,
        right: (r.right - screen.left) / u,
        width: r.width / u,
      };
    };
    const lines = (element: Element) => Math.round(element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight));
    const font = (element: Element) => ({ family: getComputedStyle(element).fontFamily, size: parseFloat(getComputedStyle(element).fontSize) / u });
    const title = document.querySelector(".ss-ending-title") as HTMLElement;
    const message = document.querySelector(".ss-ending-message") as HTMLElement;
    const next = document.querySelector(".ss-ending .ss-next") as HTMLElement;
    const panel = document.querySelector(".ss-play-panel") as HTMLElement;
    const ending = document.querySelector(".ss-ending") as HTMLElement;
    const frame = (document.querySelector(".ss-stage-frame") as HTMLElement).getBoundingClientRect();
    const scale = (document.querySelector(".ss-scale") as HTMLElement).getBoundingClientRect();
    const overflows = (element: HTMLElement) => element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1;
    return {
      title: { ...rel(title), ...font(title), lines: lines(title) },
      message: { ...rel(message), ...font(message), lines: lines(message) },
      next: rel(next),
      spare: (next.getBoundingClientRect().top - message.getBoundingClientRect().bottom) / u - 1.6,
      overflow: overflows(panel) || overflows(ending) || message.scrollWidth > message.clientWidth + 1,
      scale: [scale.left - frame.left, scale.top - frame.top, scale.width, scale.height],
    };
  });
}

async function readBoard(page: Page) {
  return page.locator(".ss-team").evaluateAll((rows) =>
    rows.map((row) => ({
      team: row.getAttribute("data-team") ?? "",
      top: row.hasAttribute("data-terbanyak"),
      turn: row.hasAttribute("data-giliran"),
      cursor: getComputedStyle(row, "::before").visibility,
      turnLabel: row.querySelector(".ss-team-turn")?.textContent ?? "",
      count: row.querySelector(".ss-team-count")?.textContent ?? "",
      sentence: row.querySelector(".ss-sr")?.textContent ?? "",
      tag: row.querySelector(".ss-team-top")?.textContent ?? null,
      tagHidden: row.querySelector(".ss-team-top")?.getAttribute("aria-hidden") ?? null,
    })),
  );
}

/** Tanda "Bintang terbanyak": di dalam isi panel kanan (tanpa jarak dalam), satu baris; dan bawah papan (u). */
async function measureBoard(page: Page) {
  return page.evaluate(() => {
    const screen = (document.querySelector(".ss-screen") as HTMLElement).getBoundingClientRect();
    const u = screen.height / 100;
    const side = document.querySelector(".ss-side") as HTMLElement;
    const box = side.getBoundingClientRect();
    const style = getComputedStyle(side);
    const inner = { left: box.left + parseFloat(style.paddingLeft), right: box.right - parseFloat(style.paddingRight) };
    const tags = [...document.querySelectorAll<HTMLElement>(".ss-team-top span")].map((tag) => {
      const r = tag.getBoundingClientRect();
      return {
        team: tag.closest(".ss-team")?.getAttribute("data-team") ?? "",
        inside: r.left >= inner.left - 0.5 && r.right <= inner.right + 0.5,
        width: r.width / u,
        toEdge: (inner.right - r.right) / u,
        lines: tag.getClientRects().length,
      };
    });
    const board = (document.querySelector(".ss-teams") as HTMLElement).getBoundingClientRect();
    return { tags, bottom: (board.bottom - screen.top) / u };
  });
}

/** Isi halaman rekap yang tampil: kepala, judul kolom, dan setiap kotak adegan. */
async function readRecapPage(page: Page) {
  return page.evaluate(() => {
    const head = document.querySelector(".ss-recap-head") as HTMLElement;
    const bg = (element: Element | null) => (element ? getComputedStyle(element).backgroundImage : null);
    const content = (element: Element | null) => element?.textContent ?? null;
    return {
      time: head.dataset.time ?? "",
      headBg: getComputedStyle(head).backgroundColor,
      headFg: getComputedStyle(head).color,
      title: content(document.querySelector(".ss-recap-title")),
      pageText: content(document.querySelector(".ss-recap-page")),
      labels: [...document.querySelectorAll(".ss-recap-label")].map((label) => label.textContent ?? ""),
      rows: [...document.querySelectorAll(".ss-recap-row")].map((row) => {
        const cells = row.querySelectorAll(".ss-recap-cell");
        const tier = row.querySelector(".ss-recap-tier");
        return {
          adegan: row.getAttribute("data-adegan"),
          number: content(row.querySelector(".ss-recap-row-head .ss-choice-key")),
          scene: content(row.querySelector(".ss-recap-scene")),
          clock: content(row.querySelector(".ss-recap-clock")),
          team: content(row.querySelector(".ss-recap-team")),
          teamIcon: bg(row.querySelector(".ss-recap-team .ss-recap-icon")),
          choiceKey: content(cells[0].querySelector(".ss-recap-key")),
          choice: content(cells[0].querySelector(".ss-recap-choice > span:last-child")),
          tier: content(tier),
          tierData: tier?.getAttribute("data-tier") ?? null,
          tierBg: tier ? getComputedStyle(tier).backgroundColor : null,
          tierIcon: bg(row.querySelector(".ss-recap-tier .ss-recap-icon")),
          quiz: content(row.querySelector(".ss-recap-quiz")),
          same: content(cells[1].querySelector(".ss-recap-same > span:last-child")),
          sameIcon: bg(cells[1].querySelector(".ss-recap-same .ss-recap-icon")),
          bestKey: content(cells[1].querySelector(".ss-recap-key")),
          best: content(cells[1].querySelector(".ss-recap-choice > span:last-child")),
          refsPrefix: content(cells[2].querySelector(".ss-sr")),
          refs: [...cells[2].querySelectorAll(".ss-recap-refs li")].map((item) => item.textContent ?? ""),
        };
      }),
    };
  });
}

type RecapRead = Awaited<ReturnType<typeof readRecapPage>>;

/** Membandingkan satu kotak adegan dengan RecapRow model dan dengan kartu dampak adegan itu saat dimainkan. */
function expectRow(actual: RecapRead["rows"][number], row: RecapRow, card: Card, teamIcons: Record<string, string>, heart: string) {
  const note = `adegan ${row.number}`;
  expect(actual.adegan, note).toBe(String(row.number));
  expect(actual.number, note).toBe(String(row.number));
  expect(actual.scene, note).toBe(`${text.recap.prefix.scene(row.number)}${row.scene.title}`);
  expect(actual.clock, note).toBe(text.recap.clock(row.scene.clock));
  expect(row.team, note).not.toBeNull();
  if (row.team) {
    expect(actual.team, note).toBe(text.recap.team(row.team.name, row.stars));
    expect(actual.teamIcon, note).toBe(teamIcons[row.team.id]);
  }
  expect(actual.choiceKey, note).toBe(row.choice.id);
  expect(actual.choice, note).toBe(`${text.recap.prefix.choice(row.choice.id)}${row.choiceText}`);
  expect(row.choiceText, `${note}: teks pilihan sama dengan saat dimainkan`).toBe(card.chosen);
  expect(actual.tier, note).toBe(copy.impact.tier[row.choice.tier]);
  expect(actual.tierData, note).toBe(row.choice.tier);
  expect(card.tier, note).toBe(row.choice.tier);
  expect(actual.tierBg, note).toBe(TIER_BG[row.choice.tier]);
  expect(actual.tierIcon, `${note}: ikon tingkat sama dengan kartu dampak`).toBe(card.icon);
  expect(actual.quiz, note).toBe(row.quiz && row.scene.roleQuiz ? quizLine(row.quiz, ROLES, row.scene.roleQuiz.answer) : null);
  if (row.same) {
    expect(actual.same, note).toBe(`${text.recap.prefix.bestSame}${text.recap.same}`);
    expect(actual.sameIcon, note).toBe(heart);
    expect(actual.best, note).toBeNull();
  } else {
    expect(actual.same, note).toBeNull();
    expect(actual.bestKey, note).toBe(row.best.id);
    expect(actual.best, note).toBe(`${text.recap.prefix.best(row.best.id)}${row.bestText}`);
    expect(row.bestText, `${note}: teks pilihan terbaik sama dengan saat dimainkan`).toBe(card.best);
  }
  expect(actual.refsPrefix, note).toBe(text.recap.prefix.refs);
  expect(actual.refs, note).toEqual(row.references.map((reference) => reference.text));
  expect(actual.refs, `${note}: rujukan sama dan berurutan dengan kartu dampak`).toEqual(card.refs);
}

async function measureRecap(page: Page) {
  return page.evaluate(() => {
    const screen = (document.querySelector(".ss-screen") as HTMLElement).getBoundingClientRect();
    const u = screen.height / 100;
    const body = (document.querySelector(".ss-recap-body") as HTMLElement).getBoundingClientRect();
    const list = (document.querySelector(".ss-recap-list") as HTMLElement).getBoundingClientRect();
    // Teks ss-sr (tersembunyi, hanya untuk pembaca layar) memang dipotong 1 px, jadi tidak dihitung.
    const overflow = [...document.querySelectorAll<HTMLElement>(".ss-recap *")]
      .filter((element) => !element.closest(".ss-sr") && element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1)
      .map((element) => element.className);
    const clash = [...document.querySelectorAll(".ss-recap-row-head")].filter((head) => {
      const clock = (head.querySelector(".ss-recap-clock") as HTMLElement).getBoundingClientRect();
      const team = (head.querySelector(".ss-recap-team") as HTMLElement).getBoundingClientRect();
      const scene = head.querySelector(".ss-recap-scene") as HTMLElement;
      return clock.right > team.left - 1 || scene.getBoundingClientRect().height > parseFloat(getComputedStyle(scene).lineHeight) * 1.5;
    }).length;
    const sizes = (selector: string) => [
      ...new Set([...document.querySelectorAll(selector)].map((element) => Math.round((parseFloat(getComputedStyle(element).fontSize) / u) * 100) / 100)),
    ];
    const buttons = [...document.querySelectorAll(".ss-recap-foot .ss-next")].map((button) => {
      const r = button.getBoundingClientRect();
      return {
        text: button.textContent ?? "",
        top: (r.top - screen.top) / u,
        bottom: (r.bottom - screen.top) / u,
        left: (r.left - screen.left) / u,
        right: (r.right - screen.left) / u,
      };
    });
    return {
      spare: (body.bottom - list.bottom) / u,
      overflow,
      clash,
      fonts: {
        title: sizes(".ss-recap-title"),
        page: sizes(".ss-recap-page"),
        label: sizes(".ss-recap-label"),
        number: sizes(".ss-recap-row-head .ss-choice-key"),
        scene: sizes(".ss-recap-scene"),
        clock: sizes(".ss-recap-clock"),
        team: sizes(".ss-recap-team"),
        choice: sizes(".ss-recap-choice"),
        key: sizes(".ss-recap-key"),
        tier: sizes(".ss-recap-tier"),
        quiz: sizes(".ss-recap-quiz"),
        same: sizes(".ss-recap-same"),
        refs: sizes(".ss-recap-refs"),
      },
      buttons,
    };
  });
}

/** Letak rekap di satu ukuran: sisa ≥ 4u, tanpa luapan, kepala kotak tidak bertabrakan, huruf, dan tombol kaki. */
async function checkRecapLayout(page: Page, size: ViewportName, p: number, note: string) {
  const m = await measureRecap(page);
  expect(m.spare, `${note}: sisa di bawah kotak terakhir`).toBeGreaterThanOrEqual(4);
  expect(m.overflow, `${note}: luapan ke samping`).toEqual([]);
  expect(m.clash, `${note}: keterangan tim menabrak jam atau judul`).toBe(0);
  for (const [key, expected] of Object.entries(RECAP_FONTS)) {
    const found = m.fonts[key as keyof typeof RECAP_FONTS];
    for (const value of found) near(value, expected, 0.05, `${note}: huruf ${key}`);
  }
  expect(m.fonts.quiz.length, `${note}: baris kuis hanya di halaman sore`).toBe(p === 3 ? 1 : 0);
  const table = RECAP_BUTTONS[size];
  const expectedTexts = p === 1 ? [text.recap.next] : [text.recap.prev, p === 4 ? text.recap.toReflection : text.recap.next];
  expect(m.buttons.map((button) => button.text), note).toEqual(expectedTexts);
  const forward = m.buttons[m.buttons.length - 1];
  if (p < 4) nearBox(forward, table.next, `${note} Berikutnya`);
  else {
    nearBox(forward, [table.next[0], table.next[1], ...table.reflect], `${note} Lanjut ke refleksi`);
  }
  if (p > 1) nearBox({ ...m.buttons[0] }, p === 4 ? table.prev4 : table.prev, `${note} Sebelumnya`);
  return m;
}

async function measureReflection(page: Page) {
  return page.evaluate(() => {
    const screen = (document.querySelector(".ss-screen") as HTMLElement).getBoundingClientRect();
    const u = screen.height / 100;
    const q = (selector: string) => document.querySelector(selector) as HTMLElement;
    const rel = (element: HTMLElement) => {
      const r = element.getBoundingClientRect();
      return { top: (r.top - screen.top) / u, bottom: (r.bottom - screen.top) / u, left: (r.left - screen.left) / u, right: (r.right - screen.left) / u };
    };
    const lines = (element: HTMLElement) => Math.round(element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight));
    const size = (selector: string) => parseFloat(getComputedStyle(q(selector)).fontSize) / u;
    const body = q(".ss-reflection-body").getBoundingClientRect();
    const box = q(".ss-reflection-prompts").getBoundingClientRect();
    const left = q(".ss-reflection-actions").getBoundingClientRect();
    const right = q(".ss-download").getBoundingClientRect();
    const line = q(".ss-download-status");
    return {
      spare: (body.bottom - box.bottom) / u,
      lines: [...document.querySelectorAll<HTMLElement>(".ss-reflection-prompt")].map(lines),
      gap: (right.left - left.right) / u,
      status: { width: line.getBoundingClientRect().width / u, lines: lines(line), text: line.textContent ?? "" },
      play: rel(q(".ss-reflection-actions .ss-button:first-child")),
      gallery: rel(q(".ss-reflection-actions .ss-button:last-child")),
      png: rel(q('[data-unduh="png"]')),
      pdf: rel(q('[data-unduh="pdf"]')),
      inside: right.right <= screen.right + 0.5 && left.left >= screen.left - 0.5,
      overflow: [...document.querySelectorAll<HTMLElement>(".ss-reflection *")].filter(
        (element) => !element.closest(".ss-sr") && element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1,
      ).length,
      fonts: { title: size(".ss-reflection-title"), lead: size(".ss-reflection-lead"), prompt: size(".ss-reflection-prompt"), status: size(".ss-download-status") },
    };
  });
}

/** Letak refleksi di satu ukuran (tabel spesifikasi ±0,5u); status berisi kabar yang sedang tampil. */
async function checkReflectionLayout(page: Page, size: ViewportName, note: string) {
  const m = await measureReflection(page);
  const table = REFLECTION_LAYOUT[size];
  expect(m.lines, note).toEqual([1, 2, 2]);
  near(m.spare, table.spare, 0.5, `${note}: sisa di bawah kotak kalimat`);
  near(m.gap, table.gap, 0.5, `${note}: jarak kelompok`);
  nearBox(m.play, table.play, `${note} Main lagi`);
  nearBox(m.gallery, table.gallery, `${note} Kembali ke galeri`);
  nearBox(m.png, table.png, `${note} Unduh gambar`);
  nearBox(m.pdf, table.pdf, `${note} Unduh PDF`);
  expect(m.inside, note).toBe(true);
  expect(m.overflow, `${note}: luapan`).toBe(0);
  near(m.fonts.title, 2.8, 0.05, `${note}: huruf judul`);
  near(m.fonts.lead, 3.6, 0.05, `${note}: huruf kalimat pembuka`);
  near(m.fonts.prompt, 3.6, 0.05, `${note}: huruf kalimat pemantik`);
  near(m.fonts.status, 2.5, 0.05, `${note}: huruf kabar`);
  expect(m.status.lines, `${note}: kabar satu baris`).toBe(1);
  return m;
}

/** Warna teks dan latar efektif setiap teks yang terlihat di layar (tanpa teks ss-sr), untuk rasio kontras. */
async function textColors(page: Page) {
  return page.evaluate(() => {
    const result: { text: string; color: string; bg: string; translucent: boolean }[] = [];
    const root = document.querySelector(".ss-screen") as HTMLElement;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const value = node.textContent?.trim() ?? "";
      const element = node.parentElement;
      if (!value || !element || element.closest(".ss-sr")) continue;
      const style = getComputedStyle(element);
      if (style.visibility !== "visible" || element.getClientRects().length === 0) continue;
      let bg = "";
      let translucent = !style.color.startsWith("rgb(");
      for (let current: Element | null = element; current; current = current.parentElement) {
        const background = getComputedStyle(current).backgroundColor;
        const alpha = /rgba\(\d+, \d+, \d+, ([\d.]+)\)/.exec(background);
        if (alpha) {
          if (Number(alpha[1]) > 0) translucent = true;
          continue;
        }
        if (background.startsWith("rgb(")) {
          bg = background;
          break;
        }
      }
      result.push({ text: value.slice(0, 40), color: style.color, bg, translucent });
    }
    return result;
  });
}

/** Semua teks terlihat berkontras ≥ 4,5:1 dengan latar efektifnya. */
async function checkContrast(page: Page, note: string) {
  const pairs = await textColors(page);
  expect(pairs.length, `${note}: ada teks`).toBeGreaterThan(0);
  const rated = pairs.map((pair) => ({ ...pair, ratio: pair.bg ? Math.round(contrast(pair.color, pair.bg) * 100) / 100 : 0 }));
  const low = rated.filter((pair) => pair.translucent || pair.ratio < 4.5);
  expect(low, `${note}: kontras di bawah 4,5:1`).toEqual([]);
  const min = rated.reduce((a, b) => (b.ratio < a.ratio ? b : a));
  console.log(`[kontras] ${note}: ${rated.length} teks, terkecil ${min.ratio}:1 ("${min.text}", ${min.color} di atas ${min.bg})`);
  return pairs.length;
}

/** Tombol atau tautan yang berfokus lewat Tab: latar sun dengan kursor ▶. */
async function expectFocusedControl(page: Page, name: string) {
  const info = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement;
    return {
      text: element.textContent?.trim() ?? "",
      visible: element.matches(":focus-visible"),
      bg: getComputedStyle(element).backgroundColor,
      cursor: getComputedStyle(element, "::before").visibility,
    };
  });
  expect(info, name).toEqual({ text: name, visible: true, bg: SUN, cursor: "visible" });
}

/** Judul layar berfokus dengan garis fokus 2 px berjarak 4 px berwarna teksnya. */
async function expectTitleFocus(page: Page, title: Locator, color: string) {
  await expect(title).toBeFocused();
  const outline = await title.evaluate((element) => {
    const style = getComputedStyle(element);
    return { visible: element.matches(":focus-visible"), style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor, offset: style.outlineOffset };
  });
  expect(outline).toEqual({ visible: true, style: "solid", width: "2px", color, offset: "4px" });
}

/** Teks unsur yang bisa dicapai Tab di layar permainan, berurutan. */
const tabStops = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".ss-play button, .ss-play a[href], .ss-play [tabindex]")]
      .filter((element) => element.tabIndex >= 0)
      .map((element) => element.textContent?.trim() ?? ""),
  );

/** Tidak ada sisa layar akhir sementara di halaman. */
async function expectNoOldText(page: Page) {
  await expect(page.locator(".ss-play-end")).toHaveCount(0);
  const content = await page.evaluate(() => document.body.innerText);
  for (const old of OLD_TEXTS) expect(content).not.toContain(old);
}

/** Semua berkas di bawah folder, untuk mencari teks lama di app/ (AC-1). */
function filesUnder(folder: string): string[] {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

/** Ikon bentuk setiap tim di papan layar akhir, untuk dibandingkan dengan ikon di kotak rekap. */
const teamIconsOf = (page: Page) =>
  page.locator(".ss-team").evaluateAll((rows) =>
    Object.fromEntries(
      rows.map((row) => [row.getAttribute("data-team") ?? "", getComputedStyle(row.querySelector(".ss-team-icon") as Element).backgroundImage]),
    ),
  );

/** Mencatat sapuan atau pudar yang muncul sesudah titik ini (AC-1: layar akhir tanpa keduanya). */
async function watchSceneChange(page: Page) {
  await page.evaluate(() => {
    const record: string[] = [];
    (window as unknown as { ssGanti: string[] }).ssGanti = record;
    const observer = new MutationObserver(() => {
      if (document.querySelector(".ss-wipe")) record.push("sapuan");
      if (document.querySelector(".ss-stage-holder[data-fade]")) record.push("pudar");
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-fade"] });
  });
}

interface PopRecord {
  team: string;
  count: number;
  name: string;
  iterations: string;
}

/** Menjeda pop bintang begitu ikonnya dipasang, dan mencatat tim, jumlah animasi, nama, dan pengulangannya. */
async function watchPop(page: Page) {
  await page.evaluate(() => {
    const record: { team: string; count: number; name: string; iterations: string }[] = [];
    (window as unknown as { ssPop: typeof record }).ssPop = record;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          const stars = node.matches(".ss-team-star[data-pop]") ? [node] : [...node.querySelectorAll<HTMLElement>(".ss-team-star[data-pop]")];
          for (const star of stars) {
            const animations = star.getAnimations();
            for (const animation of animations) animation.pause();
            const style = getComputedStyle(star);
            record.push({
              team: star.closest(".ss-team")?.getAttribute("data-team") ?? "",
              count: animations.length,
              name: style.animationName,
              iterations: style.animationIterationCount,
            });
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

/** Mencatat keadaan kelompok unduh dan wilayah status sesudah setiap perubahan (Rencana uji langkah 7). */
interface DownloadSnap {
  busy: string | null;
  disabled: (string | null)[];
  line: string;
  status: string;
}

async function recordDownload(page: Page) {
  await page.evaluate(() => {
    const record: { busy: string | null; disabled: (string | null)[]; line: string; status: string }[] = [];
    (window as unknown as { ssUnduh: typeof record }).ssUnduh = record;
    const group = document.querySelector(".ss-download") as HTMLElement;
    const region = document.querySelector('.ss-play [role="status"]') as HTMLElement;
    const snap = () =>
      record.push({
        busy: group.getAttribute("data-sibuk"),
        disabled: [...group.querySelectorAll("button")].map((button) => button.getAttribute("aria-disabled")),
        line: group.querySelector(".ss-download-status")?.textContent ?? "",
        status: region.textContent ?? "",
      });
    const observer = new MutationObserver(snap);
    observer.observe(group, { attributes: true, childList: true, subtree: true, characterData: true });
    observer.observe(region, { childList: true, subtree: true, characterData: true });
  });
}

const takeSnaps = (page: Page) => page.evaluate(() => (window as unknown as { ssUnduh: DownloadSnap[] }).ssUnduh.splice(0));

/** Urutan keadaan selama satu unduhan: disiapkan (data-sibuk, kedua tombol nonaktif, kabar), lalu siap. */
function expectDownloadSequence(snaps: DownloadSnap[], kind: Kind) {
  const preparing = text.download.preparing[kind];
  const done = text.download.done[kind];
  const busy = snaps.findIndex((s) => s.busy === kind && s.disabled.every((value) => value === "true") && s.line === preparing && s.status === preparing);
  expect(busy, JSON.stringify(snaps)).toBeGreaterThanOrEqual(0);
  const finished = snaps.findIndex((s) => s.line === done);
  expect(finished, JSON.stringify(snaps)).toBeGreaterThan(busy);
  for (const s of snaps.slice(busy, finished)) expect(s.busy).toBe(kind);
  expect(snaps[snaps.length - 1]).toEqual({ busy: null, disabled: [null, null], line: done, status: done });
}

/** Tanggal komputer di halaman, YYYY-MM-DD (DRAF A-5). */
const pageDate = (page: Page) =>
  page.evaluate(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  });

/** Struktur PDF hasil unduhan (AC-18). */
function checkPdf(bytes: Buffer) {
  const pdf = bytes.toString("latin1");
  expect(pdf.startsWith("%PDF-1.4\n")).toBe(true);
  expect(pdf.endsWith("%%EOF\n")).toBe(true);
  expect(pdf.match(/\/Type \/Page(?!s)/g)?.length).toBe(1);
  expect(pdf).toContain("/MediaBox [0 0 595.28 841.89]");
  expect(pdf).toContain("/Width 1240 /Height 1754");
  expect(pdf).toContain("/Filter /FlateDecode");
  const start = Number(/startxref\n(\d+)\n%%EOF\n$/.exec(pdf)?.[1]);
  expect(pdf.slice(start, start + 5)).toBe("xref\n");
  const table = /^xref\n0 (\d+)\n((?:\d{10} \d{5} [nf] \n)+)/.exec(pdf.slice(start));
  expect(table).not.toBeNull();
  const entries = (table?.[2] ?? "").split("\n").filter((entry) => entry !== "");
  expect(entries.length).toBe(Number(table?.[1]));
  expect(entries[0]).toBe("0000000000 65535 f ");
  entries.slice(1).forEach((entry, index) => {
    const offset = Number(entry.slice(0, 10));
    const head = `${index + 1} 0 obj`;
    expect(pdf.slice(offset, offset + head.length), `objek ${index + 1}`).toBe(head);
  });
}

/* ================================================================================================================== */

test("urutan layar dengan keyboard saja, teks lama hilang, wilayah pengumuman tetap, dan dua permainan (AC-1, AC-12, AC-15, AC-16)", async ({ page }) => {
  test.setTimeout(180_000);
  const log = watch(page);
  await openPlay(page);
  // Kedua wilayah pengumuman ditandai di adegan 1, lalu diperiksa di refleksi (AC-12).
  await page.evaluate(() => {
    (document.querySelector('.ss-play [aria-live="polite"]') as HTMLElement).dataset.uji = "live";
    (document.querySelector('.ss-play [role="status"]') as HTMLElement).dataset.uji = "status";
  });

  // Bintang adegan 6 langsung membuka layar akhir tanpa sapuan dan tanpa pudar.
  await playDay(page, day("BBBBBB"), { beforeLastStars: () => watchSceneChange(page) });
  expect(await page.evaluate(() => (window as unknown as { ssGanti: string[] }).ssGanti)).toEqual([]);
  await expectNoOldText(page);
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  for (let p = 1; p <= 4; p++) {
    await expect(recapScreen(page, p)).toBeVisible();
    await expect(recapTitle(page)).toBeFocused();
    await expect(recapNext(page)).toHaveText(p === 4 ? text.recap.toReflection : text.recap.next);
    await expectNoOldText(page);
    await page.clock.runFor(600);
    await page.keyboard.press(p % 2 === 0 ? "Space" : "Enter");
  }
  await expect(reflectionTitle(page)).toBeFocused();
  await expectNoOldText(page);

  // "Kembali ke galeri" adalah tautan ../ (AC-16).
  await expect(galleryLink(page)).toHaveAttribute("href", "../");
  await expect(galleryLink(page)).toHaveText(copy.backToGallery);

  // Wilayah pengumuman tetap elemen yang sama sejak adegan 1 (AC-12).
  await expect(page.locator('.ss-play [data-uji="live"]')).toHaveAttribute("aria-live", "polite");
  await expect(page.locator('.ss-play [data-uji="status"]')).toHaveAttribute("role", "status");
  await expect(page.locator('.ss-play [aria-live="polite"]')).toHaveCount(1);
  await expect(page.locator('.ss-play [role="status"]')).toHaveCount(1);

  // Teks dan kelas layar akhir sementara tidak ada lagi di app/ (AC-1).
  for (const file of filesUnder(APP_DIR)) {
    if (!/\.(tsx?|css)$/.test(file)) continue;
    const source = readFileSync(file, "utf8");
    for (const old of [...OLD_TEXTS, "ss-play-end"]) expect(source.includes(old), `${old} di ${file}`).toBe(false);
  }

  // "Main lagi": narasi adegan 1, papan 0 bintang, wilayah status kosong (AC-15).
  await playAgain(page, true);
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 1/6");
  await expect(page.locator(".ss-team-count")).toHaveText(["0", "0"]);
  await expect(status(page)).toHaveText("");
  await expect(page.locator('.ss-play [data-uji="live"]')).toHaveCount(1);

  // Permainan kedua dengan jalur lain: kartu, kuis yang belum dijawab, dan bintang bekerja di keenam adegan.
  const second = day("CCCAAA", { role: "advokat", stars: [2, 0, 1, 2, 0, 1] });
  await playDay(page, second);
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  const keys: string[] = [];
  for (let p = 1; p <= 4; p++) {
    await expect(recapScreen(page, p)).toBeVisible();
    keys.push(...(await page.locator(".ss-recap-cell:first-child .ss-recap-key").allTextContents()));
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
  }
  expect(keys.join(""), "rekap permainan kedua hanya berisi pilihannya").toBe(second.path);
  await expect(reflectionTitle(page)).toBeFocused();
  expectClean(log);
});

const ENDING_PATHS: { path: string; id: EndingId; frame: number; motion: ScaleMotion; shots: [ViewportName, string][]; motionShot?: string }[] = [
  { path: "BBBBBB", id: "setara", frame: 2, motion: "seimbang", shots: [["1280x720", "akhir_setara_1280x720.png"]] },
  {
    path: "BBBCCC",
    id: "hampir",
    frame: 3,
    motion: "sedikit-kanan",
    shots: [
      ["1280x720", "akhir_hampir_1280x720.png"],
      ["1024x768", "akhir_hampir_1024x768.png"],
    ],
    motionShot: "akhir_timbangan_gerak_1280x720.png",
  },
  { path: "AAAAAA", id: "berat", frame: 4, motion: "miring-kanan", shots: [] },
  {
    path: "CCCCCC",
    id: "berat",
    frame: 4,
    motion: "miring-kanan",
    shots: [
      ["1280x720", "akhir_berat_1280x720.png"],
      ["1920x1080", "akhir_berat_1920x1080.png"],
    ],
  },
  { path: "AABBBB", id: "hampir", frame: 1, motion: "sedikit-kiri", shots: [] },
  { path: "AABBAB", id: "berat", frame: 0, motion: "miring-kiri", shots: [] },
];

for (const c of ENDING_PATHS) {
  test(`layar akhir jalur ${c.path}: isi, gerak timbangan, dan letak di keempat ukuran (AC-2, AC-3, AC-5)`, async ({ page }) => {
    const log = watch(page);
    const d = day(c.path);
    const state = model(d);
    const view = scaleView(state.meters);
    expect([endingFor(state.meters), view.frame, view.motion]).toEqual([c.id, c.frame, c.motion]);
    await openPlay(page);
    await playDay(page, d);
    const scale = page.locator(".ss-scale");

    // AC-5: satu animasi CSS ss-scale-{gerak}, langsung dijeda lewat Web Animations API.
    const info = await scale.evaluate((element) => {
      const animations = element.getAnimations();
      for (const animation of animations) animation.pause();
      const style = getComputedStyle(element);
      const effect = animations[0]?.effect as KeyframeEffect | undefined;
      const keyframes = effect ? effect.getKeyframes() : [];
      return {
        count: animations.length,
        name: style.animationName,
        delay: style.animationDelay,
        duration: style.animationDuration,
        timing: style.animationTimingFunction,
        iterations: style.animationIterationCount,
        fill: style.animationFillMode,
        offsets: keyframes.map((keyframe) => Math.round((keyframe.computedOffset ?? 0) * 100000) / 100000),
        positions: keyframes.map((keyframe) => parseFloat(String(keyframe.backgroundPositionX ?? keyframe["background-position-x"] ?? "NaN"))),
        motion: element.getAttribute("data-gerak"),
        frame: element.getAttribute("data-bingkai"),
      };
    });
    const n = view.sequence.length;
    expect(info).toEqual({
      count: 1,
      name: `ss-scale-${c.motion}`,
      delay: "0.3s",
      duration: `${(200 * n) / 1000}s`,
      // step-end sama dengan steps(1, end); Chromium menuliskannya sebagai steps(1) (CSS Easing Functions).
      timing: "steps(1)",
      iterations: "1",
      fill: "both",
      offsets: [...Array.from({ length: n }, (_, i) => Math.round((i / n) * 100000) / 100000), 1],
      positions: [...view.sequence, c.frame].map((frame) => -48 * frame + 0),
      motion: c.motion,
      frame: String(c.frame),
    });
    const frameAt = (ms: number) =>
      scale.evaluate((element, time) => {
        for (const animation of element.getAnimations()) {
          animation.pause();
          animation.currentTime = time;
        }
        return -parseFloat(getComputedStyle(element).backgroundPositionX) / 48 + 0;
      }, ms);
    const frames: number[] = [];
    for (const ms of [...SCALE_TIMES, 300 + 200 * n + 200]) frames.push(await frameAt(ms));
    expect(frames, "bingkai pada 0, 299, 400, 600, 800, 1000 ms, dan sesudah selesai").toEqual(FRAMES_AT[c.motion]);
    if (c.motionShot) {
      expect(await frameAt(600)).not.toBe(c.frame);
      await shot(page, c.motionShot);
    }

    // M dan perubahan ukuran jendela tidak memulai ulang animasi.
    await scale.evaluate((element) => {
      const [animation] = element.getAnimations();
      animation.pause();
      animation.currentTime = 700;
      (window as unknown as { ssTimbangan: { element: Element; animation: Animation } }).ssTimbangan = { element, animation };
    });
    await page.keyboard.press("m");
    await expect(status(page)).toHaveText(copy.sound.off);
    await resize(page, "1024x768");
    await resize(page, "1280x720");
    const kept = await page.evaluate(() => {
      const saved = (window as unknown as { ssTimbangan: { element: Element; animation: Animation } }).ssTimbangan;
      const element = document.querySelector(".ss-scale");
      const animations = element?.getAnimations() ?? [];
      return {
        element: element === saved.element,
        animation: animations.length === 1 && animations[0] === saved.animation,
        time: saved.animation.currentTime,
        state: saved.animation.playState,
      };
    });
    expect(kept).toEqual({ element: true, animation: true, time: 700, state: "paused" });
    // Sesudah selesai, timbangan diam di bingkai akhir.
    await scale.evaluate((element) => {
      for (const animation of element.getAnimations()) animation.finish();
    });
    await expect(scale).toHaveAttribute("data-bingkai", String(c.frame));
    expect(await scale.evaluate((element) => -parseFloat(getComputedStyle(element).backgroundPositionX) / 48 + 0)).toBe(c.frame);

    // AC-2: isi layar akhir.
    const ending = ENDINGS[c.id];
    await expect(page.locator(".ss-stage-bg")).toHaveCSS("background-image", new RegExp(`/end_${c.id}-[^/]*\\.png`));
    await expect(page.locator(".ss-sprite, .ss-shadow, .ss-emote")).toHaveCount(0);
    await expect(endingTitle(page)).toHaveText(ending.title);
    await expect(page.locator(".ss-ending-message")).toHaveText(ending.message.join(" "));
    await expect(endingNext(page)).toHaveText(text.ending.next);
    expect(await page.evaluate(() => document.body.innerText)).not.toMatch(/\b(kalah|gagal|salah)\b/i);
    await expect(page.locator('.ss-meter[data-meter="hak"]')).toHaveAttribute("aria-valuenow", String(state.meters.hak));
    await expect(page.locator('.ss-meter[data-meter="kewajiban"]')).toHaveAttribute("aria-valuenow", String(state.meters.kewajiban));
    await expect(page.locator(".ss-meter-delta")).toHaveCount(0);
    const bar = await measureBar(page);
    expect(bar).toMatchObject({
      time: "malam",
      bg: BAR.malam.bg,
      fg: BAR.malam.fg,
      counter: copy.topBar.ending,
      label: copy.topBar.endingLabel(SCENES[5].clock),
      clock: SCENES[5].clock,
      passed: 5,
      next: 0,
    });
    await expect(page.locator(".ss-stage-frame")).toHaveAttribute("role", "img");
    await expect(page.locator(".ss-stage-frame")).toHaveAttribute("aria-label", `${ending.alt} ${scaleSentence(view)}`);

    // AC-3: letak di keempat ukuran.
    for (const size of SIZES) {
      await resize(page, size);
      const m = await measureEnding(page);
      const note = `${c.path} ${size}`;
      expect(m.title.lines, `${note}: judul satu baris`).toBe(1);
      expect(m.title.family).toContain("Press Start 2P");
      near(m.title.size, 4.4, 0.05, `${note}: huruf judul`);
      near(m.title.width, c.id === "setara" ? 52.8 : 66, 0.5, `${note}: lebar judul`);
      near(m.title.top, 62.8, 0.5, `${note}: atas judul`);
      expect(m.message.family).toContain("Pixelify Sans");
      near(m.message.size, 3.6, 0.05, `${note}: huruf pesan`);
      expect(m.message.width, `${note}: lebar pesan`).toBeLessThanOrEqual(150.05);
      expect(m.message.lines, `${note}: baris pesan`).toBe(c.id === "berat" ? 3 : 2);
      expect(m.overflow, `${note}: luapan`).toBe(false);
      expect(m.message.bottom, `${note}: pesan di atas tombol`).toBeLessThan(m.next.top);
      SCALE_PX[size].forEach((value, i) => near(m.scale[i], value, 1, `${note}: timbangan ${["kiri", "atas", "lebar", "tinggi"][i]} (px)`));
      nearBox(m.next, ENDING_NEXT[size], `${note} Lihat rekap`);
      console.log(`[ukur] ${note}: sisa di atas "Lihat rekap" ${m.spare.toFixed(1)}u`);
      for (const [shotSize, name] of c.shots) if (shotSize === size) await shot(page, name);
    }
    await resize(page, "1280x720");
    await expect(endingTitle(page)).toBeFocused();
    expectClean(log);
  });
}

test("kurangi gerak: timbangan diam di bingkai akhir, tanpa animasi di ketiga layar, masa tunggu tetap 600 ms (AC-5, AC-21)", async ({ page }) => {
  const log = watch(page);
  const d = day("BBBCCC");
  const view = scaleView(model(d).meters);
  await openPlay(page, { reduce: true });
  await playDay(page, d);
  const scale = page.locator(".ss-scale");
  await expect(scale).toHaveAttribute("data-bingkai", String(view.frame));
  await expect(scale).not.toHaveAttribute("data-gerak", /.*/);
  expect(await scale.evaluate((element) => element.getAnimations().length)).toBe(0);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  expect(await scale.evaluate((element) => getComputedStyle(element).backgroundPositionX)).toBe(`${-48 * view.frame}px`);
  await shot(page, "akhir_kurangi_gerak_1280x720.png");

  await page.clock.runFor(599);
  await expect(endingNext(page)).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Enter");
  expect(await where(page)).toBe("akhir");
  await page.clock.runFor(1);
  await page.keyboard.press("Enter");
  for (let p = 1; p <= 4; p++) {
    await expect(recapScreen(page, p)).toBeVisible();
    expect(await page.evaluate(() => document.getAnimations().length), `rekap halaman ${p}`).toBe(0);
    await page.clock.runFor(599);
    await expect(recapNext(page)).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("Enter");
    expect(await where(page)).toBe(`rekap-${p}`);
    await page.clock.runFor(1);
    await page.keyboard.press("Enter");
  }
  await expect(reflectionTitle(page)).toBeFocused();
  expect(await page.evaluate(() => document.getAnimations().length), "refleksi").toBe(0);
  await page.clock.runFor(599);
  await expect(playAgainButton(page)).toHaveAttribute("aria-disabled", "true");
  await page.clock.runFor(1);
  await expect(playAgainButton(page)).not.toHaveAttribute("aria-disabled", /.*/);
  expectClean(log);
});

interface BoardCase {
  note: string;
  teams: TeamCount;
  stars: Stars[];
  top: string[];
  shot?: string;
}

const BOARDS: BoardCase[] = [
  { note: "2 tim, satu tim tertinggi", teams: 2, stars: [2, 1, 0, 2, 1, 2], top: ["laut"] },
  { note: "2 tim seri", teams: 2, stars: [1, 1, 1, 1, 1, 1], top: ["mangga", "laut"] },
  { note: "2 tim, semua 0 bintang", teams: 2, stars: [0, 0, 0, 0, 0, 0], top: [] },
  { note: "4 tim, dua tim seri", teams: 4, stars: [2, 1, 0, 2, 1, 2], top: ["mangga", "laut"], shot: "akhir_4tim_1024x768.png" },
  { note: "3 tim, semua seri", teams: 3, stars: [1, 1, 1, 1, 1, 1], top: ["mangga", "laut", "daun"] },
  { note: "4 tim, semua seri", teams: 4, stars: [1, 1, 2, 2, 1, 1], top: ["mangga", "laut", "daun", "mentari"], shot: "akhir_4tim_seri_1024x768.png" },
];

for (const board of BOARDS) {
  test(`papan tim layar akhir, ${board.note}: tanda, pop, kalimat, letak, dan main lagi (AC-4, AC-15)`, async ({ page }) => {
    const log = watch(page);
    const d = day("BBBBBB", { stars: board.stars, teams: board.teams });
    const state = model(d);
    expect(topTeamIds(state.teams)).toEqual(board.top);
    const last = state.teams[activeTeamIndex(5, board.teams)];
    await openPlay(page, { teams: board.teams });
    await playDay(page, d, { beforeLastStars: () => watchPop(page) });

    // Pop bintang adegan 6 sekali pada tim penerima; 0 bintang tanpa pop.
    const pops = await page.evaluate(() => (window as unknown as { ssPop: PopRecord[] }).ssPop);
    expect(pops).toEqual(board.stars[5] > 0 ? [{ team: last.id, count: 1, name: "ss-star-pop", iterations: "1" }] : []);
    // Pop dan timbangan diselesaikan; denyut bulan di bilah atas berulang tanpa akhir dan dibiarkan.
    await page.evaluate(() => {
      for (const element of document.querySelectorAll(".ss-team-star, .ss-scale")) {
        for (const animation of element.getAnimations()) animation.finish();
      }
    });
    await expect(status(page)).toHaveText(starsAnnouncement(last.name, board.stars[5], last.stars));

    // Tanpa giliran; jumlah bintang dari history; tanda dan kalimat pembaca layar.
    const fromHistory = starsByTeam(state.history);
    const rows = await readBoard(page);
    expect(rows.map((row) => row.team)).toEqual(state.teams.map((team) => team.id));
    state.teams.forEach((team, index) => {
      const top = board.top.includes(team.id);
      expect(rows[index]).toEqual({
        team: team.id,
        top,
        turn: false,
        cursor: "hidden",
        turnLabel: "",
        count: String(fromHistory.get(team.id) ?? 0),
        sentence: teamSentence(team.name, false, team.stars, top),
        tag: top ? copy.teams.top : null,
        tagHidden: top ? "true" : null,
      });
      expect(team.stars).toBe(fromHistory.get(team.id) ?? 0);
    });

    // Di keempat ukuran: tanda di dalam isi panel kanan, satu baris; bawah papan ≤ 60u.
    for (const size of SIZES) {
      await resize(page, size);
      const m = await measureBoard(page);
      expect(m.tags.map((tag) => tag.team)).toEqual(board.top);
      for (const tag of m.tags) {
        expect(tag.inside, `${board.note} ${size}: tanda ${tag.team} di dalam panel`).toBe(true);
        expect(tag.lines, `${board.note} ${size}: tanda ${tag.team} satu baris`).toBe(1);
      }
      expect(m.bottom, `${board.note} ${size}: bawah papan`).toBeLessThanOrEqual(60);
      console.log(
        `[ukur] ${board.note} ${size}: bawah papan ${m.bottom.toFixed(1)}u` +
          (m.tags.length ? `, tanda ${m.tags[0].width.toFixed(1)}u, ke tepi isi ${Math.min(...m.tags.map((tag) => tag.toEdge)).toFixed(1)}u` : ""),
      );
      if (board.shot && size === "1024x768") await shot(page, board.shot);
    }
    await resize(page, "1280x720");

    // "Main lagi": tim sebanyak alamat dengan 0 bintang, tanpa tanda.
    await finishDay(page, true);
    await playAgain(page, true);
    await expect(page.locator(".ss-team")).toHaveCount(board.teams);
    await expect(page.locator(".ss-team-count")).toHaveText(Array.from({ length: board.teams }, () => "0"));
    await expect(page.locator(".ss-team[data-terbanyak]")).toHaveCount(0);
    expectClean(log);
  });
}

interface RecapCase {
  path: string;
  teams: TeamCount;
  stars: Stars[];
  role: RoleId;
  /** Tangkapan layar per halaman di 1280×720. */
  pageShots?: string[];
  /** Tangkapan layar [ukuran, halaman, nama] untuk kasus terburuk. */
  sizeShots?: [ViewportName, number, string][];
}

const RECAPS: RecapCase[] = [
  { path: "BBBBBB", teams: 2, stars: [2, 1, 0, 2, 1, 2], role: "polisi" },
  {
    path: "BBBCCC",
    teams: 2,
    stars: [2, 1, 0, 2, 1, 2],
    role: "jaksa",
    pageShots: ["rekap_hal1_1280x720.png", "rekap_hal2_1280x720.png", "rekap_hal3_1280x720.png", "rekap_hal4_1280x720.png"],
  },
  { path: "AAAAAA", teams: 2, stars: [2, 1, 0, 2, 1, 2], role: "advokat" },
  { path: "CCCCCC", teams: 2, stars: [2, 1, 0, 2, 1, 2], role: "hakim" },
  { path: "BBBCCC", teams: 3, stars: [2, 1, 0, 2, 1, 2], role: "hakim" },
  { path: "CCCCCC", teams: 4, stars: [2, 1, 0, 2, 1, 2], role: "polisi" },
  // Kasus terburuk: teks pilihan kelas terpanjang tanpa B, empat tim, dan baris kuis terpanjang.
  {
    path: "CCCAAA",
    teams: 4,
    stars: [2, 2, 2, 2, 2, 2],
    role: "advokat",
    sizeShots: [
      ["1024x768", 3, "rekap_hal3_1024x768.png"],
      ["1920x1080", 2, "rekap_hal2_1920x1080.png"],
    ],
  },
];

for (const c of RECAPS) {
  test(`rekap jalur ${c.path}, ${c.teams} tim, kuis ${c.role}: isi, pengumuman, dan letak (AC-6, AC-7, AC-12)`, async ({ page }) => {
    const log = watch(page);
    const d = day(c.path, { teams: c.teams, stars: c.stars, role: c.role });
    const state = model(d);
    const rows = recapRows(state.history, SCENES, state.teams, state.flags);
    await openPlay(page, { teams: c.teams, reduce: true });
    const cards = await playDay(page, d);
    const icons = await teamIconsOf(page);
    const heart = cards.find((card) => card.tier === "tepat")?.icon ?? "";
    await expect(live(page)).toHaveText(endingAnnouncement(endingFor(state.meters), state.meters, scaleView(state.meters)));
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");

    for (let p = 1; p <= PAGES.length; p++) {
      await expect(recapScreen(page, p)).toBeVisible();
      await expect(recapTitle(page)).toBeFocused();
      await expect(live(page)).toHaveText(recapPageAnnouncement(rows, PAGES, p));
      const read = await readRecapPage(page);
      const time = SCENES[PAGES[p - 1][0]].timeOfDay;
      expect(read.time).toBe(time);
      expect(read.headBg).toBe(HEAD[time]);
      expect(read.headFg).toBe(time === "malam" ? CREAM : INK);
      expect(read.title).toBe(text.recap.title);
      expect(read.pageText).toBe(text.recap.page(text.recap.time[time], p, PAGES.length));
      expect(read.labels).toEqual([text.recap.columns.choice, text.recap.columns.best, text.recap.columns.refs]);
      const pageRows = rows.filter((row) => PAGES[p - 1].includes(row.number - 1));
      expect(read.rows.length).toBe(pageRows.length);
      pageRows.forEach((row, index) => expectRow(read.rows[index], row, cards[row.number - 1], icons, heart));

      if (c.pageShots) await shot(page, c.pageShots[p - 1]);
      for (const size of SIZES) {
        await resize(page, size);
        const m = await checkRecapLayout(page, size, p, `${c.path} ${c.teams} tim halaman ${p} ${size}`);
        console.log(`[ukur] ${c.path} ${c.teams} tim ${size} halaman ${p}: sisa ${m.spare.toFixed(1)}u`);
        for (const [shotSize, shotPage, name] of c.sizeShots ?? []) if (shotSize === size && shotPage === p) await shot(page, name);
      }
      await resize(page, "1280x720");
      await expect(recapTitle(page)).toBeFocused();
      await page.clock.runFor(600);
      await page.keyboard.press("Enter");
    }
    await expect(reflectionTitle(page)).toBeFocused();
    await expect(live(page)).toHaveText(reflectionAnnouncement());
    expectClean(log);
  });
}

test("navigasi rekap: Berikutnya, Sebelumnya tanpa masa tunggu, klik ganda Sebelumnya, ukuran jendela, lalu Main lagi dengan suara mati (AC-8, AC-14, AC-15)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, { reduce: true, recorder: true });
  await unlock(page);
  await playDay(page, day("BBBCCC"));
  let clicks = await clickCount(page);
  const step = async (expected: string, added: number, note: string) => {
    expect(await where(page), note).toBe(expected);
    clicks += added;
    expect(await clickCount(page), `${note}: bunyi klik`).toBe(clicks);
  };

  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await step("rekap-1", 1, "Lihat rekap");
  await expect(prevButton(page)).toHaveCount(0);
  await page.clock.runFor(600);
  await recapNext(page).click();
  await step("rekap-2", 1, "klik Berikutnya");
  // Sebelumnya bekerja langsung: klik, Enter, dan Spasi.
  await prevButton(page).click();
  await step("rekap-1", 1, "klik Sebelumnya pada 0 ms");
  await page.clock.runFor(600);
  await page.keyboard.press("Space");
  await step("rekap-2", 1, "Spasi sebagai pintasan");
  await page.keyboard.press("Tab");
  await expect(prevButton(page)).toBeFocused();
  await page.keyboard.press("Enter");
  await step("rekap-1", 1, "Enter pada Sebelumnya");
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await step("rekap-2", 1, "Enter sebagai pintasan");
  await page.keyboard.press("Tab");
  await expect(prevButton(page)).toBeFocused();
  await page.keyboard.press("Space");
  await step("rekap-1", 1, "Spasi pada Sebelumnya");
  for (const p of [2, 3]) {
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
    await step(`rekap-${p}`, 1, `ke halaman ${p}`);
  }
  // Klik ganda Sebelumnya di halaman 3 dan 4 hanya mundur satu halaman, dengan satu bunyi klik.
  await prevButton(page).dblclick();
  await step("rekap-2", 1, "klik ganda Sebelumnya di halaman 3");
  // Klik kedua jatuh di "Sebelumnya" halaman 2, sehingga tombol itu berfokus; Enter di sana berarti "Sebelumnya" lagi.
  await expect(prevButton(page)).toBeFocused();
  for (const p of [3, 4]) {
    await page.clock.runFor(600);
    await recapNext(page).click();
    await step(`rekap-${p}`, 1, `ke halaman ${p}`);
  }
  await expect(recapNext(page)).toHaveText(text.recap.toReflection);
  await prevButton(page).dblclick();
  await step("rekap-3", 1, "klik ganda Sebelumnya di halaman 4");
  // Perubahan ukuran jendela mempertahankan halaman dan fokus.
  const focused = await page.evaluate(() => document.activeElement?.textContent ?? "");
  for (const size of SIZES) {
    await resize(page, size);
    expect(await where(page), size).toBe("rekap-3");
    expect(await page.evaluate(() => document.activeElement?.textContent ?? ""), size).toBe(focused);
  }
  await resize(page, "1280x720");
  for (const target of ["rekap-4", "refleksi"]) {
    await page.clock.runFor(600);
    await recapNext(page).click();
    await step(target, 1, `klik ke ${target}`);
  }

  // "Main lagi" dengan suara yang dimatikan: permainan baru tetap tanpa bunyi sampai M ditekan lagi (AC-15).
  await page.clock.runFor(600);
  await page.keyboard.press("m");
  await expect(status(page)).toHaveText(copy.sound.off);
  await playAgain(page, true);
  await step("narasi", 0, "Main lagi dengan suara mati");
  await expect(status(page)).toHaveText("");
  await page.keyboard.press("Enter");
  await step("narasi", 0, "Lanjut narasi dengan suara mati");
  await page.keyboard.press("m");
  await expect(status(page)).toHaveText(copy.sound.on);
  await step("narasi", 1, "suara dinyalakan lagi dengan satu klik tanda");
  expectClean(log);
});

test("refleksi: isi, letak di keempat ukuran, Spasi dan Enter di judul, dan M (AC-9)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, { reduce: true });
  await playDay(page, day("AABBAB"));
  await finishDay(page, true);
  const head = page.locator(".ss-reflection-head");
  expect(await head.evaluate((element) => [getComputedStyle(element).backgroundColor, getComputedStyle(element).color])).toEqual([MALAM, CREAM]);
  await expect(reflectionTitle(page)).toHaveText(text.reflection.title);
  await expect(page.locator(".ss-reflection-lead")).toHaveText(text.reflection.lead);
  await expect(page.locator(".ss-reflection-prompt")).toHaveText(text.reflection.prompts.map((prompt, i) => `${i + 1}${prompt}`));
  await expect(page.locator(".ss-reflection-prompt .ss-choice-key")).toHaveText(["1", "2", "3"]);
  await expect(page.locator(".ss-reflection-actions > *")).toHaveText([text.reflection.playAgain, copy.backToGallery]);
  await expect(page.locator(".ss-download-buttons > *")).toHaveText([text.download.button.png, text.download.button.pdf]);
  await expect(downloadLine(page)).toHaveText("");

  const shots: Partial<Record<ViewportName, string>> = {
    "1280x720": "refleksi_1280x720.png",
    "1024x768": "refleksi_1024x768.png",
    "1920x1080": "refleksi_1920x1080.png",
  };
  for (const size of SIZES) {
    await resize(page, size);
    const m = await checkReflectionLayout(page, size, `refleksi ${size}`);
    console.log(`[ukur] refleksi ${size}: sisa di bawah kotak ${m.spare.toFixed(1)}u, jarak kelompok ${m.gap.toFixed(1)}u`);
    const name = shots[size];
    if (name) await shot(page, name);
  }
  await resize(page, "1280x720");

  // Spasi dan Enter saat fokus di judul tidak berpengaruh, sebelum dan sesudah masa tunggu.
  for (const wait of [0, 600]) {
    await page.clock.runFor(wait);
    await expect(reflectionTitle(page)).toBeFocused();
    await page.keyboard.press("Space");
    await page.keyboard.press("Enter");
    expect(await where(page)).toBe("refleksi");
    await expect(reflectionTitle(page)).toBeFocused();
    await expect(downloadLine(page)).toHaveText("");
    await expect(page.locator(".ss-download[data-sibuk]")).toHaveCount(0);
    await expect(status(page)).toHaveText(starsAnnouncement(DEFAULT_TEAMS[1].name, 1, 3));
  }
  // M bekerja di refleksi.
  await page.keyboard.press("m");
  await expect(status(page)).toHaveText(copy.sound.off);
  await page.keyboard.press("m");
  await expect(status(page)).toHaveText(copy.sound.on);
  // Fokus pada "Main lagi".
  await page.keyboard.press("Tab");
  await expect(playAgainButton(page)).toBeFocused();
  await shot(page, "refleksi_fokus_main_lagi_1280x720.png");
  expectClean(log);
});

test("masa tunggu 600 ms, tekanan ganda, dan bunyi klik di ketiga layar (AC-10, AC-14, AC-16)", async ({ page }) => {
  test.setTimeout(180_000);
  const log = watch(page);
  await openPlay(page, { reduce: true, recorder: true });
  await unlock(page);
  await playDay(page, day("BBBBBB"));
  let clicks = await clickCount(page);
  const expectClicks = async (added: number, note: string) => {
    clicks += added;
    expect(await clickCount(page), `${note}: bunyi klik`).toBe(clicks);
  };
  /** Pada 599 ms: klik, Spasi, dan Enter pada tombol, lalu Spasi dan Enter sebagai pintasan, tidak berpengaruh. */
  const ignored = async (button: Locator, title: Locator, at: string) => {
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await button.click({ force: true });
    expect(await where(page), `${at}: klik`).toBe(at);
    await button.focus();
    for (const key of ["Space", "Enter"]) {
      await page.keyboard.press(key);
      expect(await where(page), `${at}: ${key} pada tombol`).toBe(at);
    }
    await title.focus();
    for (const key of ["Space", "Enter"]) {
      await page.keyboard.press(key);
      expect(await where(page), `${at}: ${key} sebagai pintasan`).toBe(at);
    }
    await expectClicks(0, `${at} pada 599 ms`);
  };

  // Layar akhir: tertahan pada 599 ms, lalu dua Enter cepat pada "Lihat rekap" hanya membuka halaman 1.
  await page.clock.runFor(599);
  await ignored(endingNext(page), endingTitle(page), "akhir");
  await page.clock.runFor(1);
  await endingNext(page).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  expect(await where(page)).toBe("rekap-1");
  await expectClicks(1, "Lihat rekap");

  // Halaman rekap: masing-masing tertahan pada 599 ms, lalu diterima dengan cara berbeda.
  const accept: Record<number, () => Promise<void>> = {
    1: () => recapNext(page).click(),
    2: async () => {
      await recapNext(page).focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press("Enter");
    },
    3: async () => {
      await recapNext(page).focus();
      await page.keyboard.press("Space");
    },
    4: async () => {
      await recapNext(page).focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press("Enter");
    },
  };
  for (let p = 1; p <= 4; p++) {
    await page.clock.runFor(599);
    await ignored(recapNext(page), recapTitle(page), `rekap-${p}`);
    await page.clock.runFor(1);
    await accept[p]();
    expect(await where(page)).toBe(p < 4 ? `rekap-${p + 1}` : "refleksi");
    await expectClicks(1, `halaman ${p}`);
  }
  // Dua Enter cepat pada "Lanjut ke refleksi" tidak memulai unduhan.
  await expect(downloadLine(page)).toHaveText("");
  await expect(page.locator(".ss-download[data-sibuk]")).toHaveCount(0);

  // Refleksi pada 599 ms: Main lagi, tautan galeri (klik dan Enter dibatalkan, Spasi tanpa klik), dan unduhan.
  await page.evaluate(() => {
    const record: boolean[] = [];
    (window as unknown as { ssGaleri: boolean[] }).ssGaleri = record;
    window.addEventListener("click", (event) => {
      if (!(event.target instanceof Element) || !event.target.closest("a.ss-button")) return;
      record.push(event.defaultPrevented);
      event.preventDefault();
    });
  });
  const gallery = () => page.evaluate(() => [...(window as unknown as { ssGaleri: boolean[] }).ssGaleri]);
  await page.clock.runFor(599);
  for (const control of [playAgainButton(page), galleryLink(page), downloadButton(page, "png"), downloadButton(page, "pdf")]) {
    await expect(control).toHaveAttribute("aria-disabled", "true");
  }
  await playAgainButton(page).click({ force: true });
  await playAgainButton(page).focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Enter");
  expect(await where(page)).toBe("refleksi");
  await galleryLink(page).click({ force: true });
  await galleryLink(page).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  expect(await gallery(), "galeri pada 599 ms: klik dan Enter dibatalkan, Spasi tanpa klik").toEqual([true, true]);
  for (const kind of ["png", "pdf"] as const) await downloadButton(page, kind).click({ force: true });
  await expect(downloadLine(page)).toHaveText("");
  await expect(page.locator(".ss-download[data-sibuk]")).toHaveCount(0);
  expect(page.url()).toMatch(/#main$/);
  await expectClicks(0, "refleksi pada 599 ms");

  await page.clock.runFor(1);
  await galleryLink(page).click();
  await galleryLink(page).focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Enter");
  expect(await gallery(), "galeri pada 600 ms: klik dan Enter diterima, Spasi tanpa klik").toEqual([true, true, false, false]);
  expect(page.url()).toMatch(/#main$/);
  await expectClicks(0, "Kembali ke galeri tanpa bunyi");
  await playAgainButton(page).focus();
  await page.keyboard.press("Enter");
  expect(await where(page)).toBe("narasi");
  await expectClicks(1, "Main lagi");

  // Permainan kedua: klik ganda "Lihat rekap", "Berikutnya", dan "Lanjut ke refleksi" hanya maju satu langkah.
  await playDay(page, day("BBBBBB"));
  clicks = await clickCount(page);
  await page.clock.runFor(600);
  await endingNext(page).dblclick();
  expect(await where(page)).toBe("rekap-1");
  await expectClicks(1, "klik ganda Lihat rekap");
  await page.clock.runFor(600);
  await recapNext(page).dblclick();
  expect(await where(page)).toBe("rekap-2");
  await expectClicks(1, "klik ganda Berikutnya");
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  expect(await where(page)).toBe("rekap-3");
  await expectClicks(1, "dua Enter cepat sebagai pintasan");
  await page.clock.runFor(600);
  await recapNext(page).dblclick();
  expect(await where(page)).toBe("rekap-4");
  await expectClicks(1, "klik ganda Berikutnya halaman 3");
  await page.clock.runFor(600);
  await recapNext(page).dblclick();
  expect(await where(page)).toBe("refleksi");
  await expectClicks(1, "klik ganda Lanjut ke refleksi");
  await expect(downloadLine(page)).toHaveText("");
  await expect(page.locator(".ss-download[data-sibuk]")).toHaveCount(0);
  expectClean(log);
});

test("fokus: judul berfokus, garis fokus, urutan Tab, tombol berfokus, dan ukuran jendela (AC-11)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, { reduce: true });
  await playDay(page, day("BBBBBB"));
  await expectTitleFocus(page, endingTitle(page), INK);
  expect(await tabStops(page)).toEqual([text.ending.next]);
  await page.keyboard.press("Tab");
  await expectFocusedControl(page, text.ending.next);
  await resize(page, "1024x768");
  await expect(endingNext(page)).toBeFocused();
  await resize(page, "1280x720");
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");

  for (let p = 1; p <= 4; p++) {
    await expect(recapScreen(page, p)).toBeVisible();
    await expectTitleFocus(page, recapTitle(page), p === 4 ? CREAM : INK);
    const order = p === 1 ? [text.recap.next] : [text.recap.prev, p === 4 ? text.recap.toReflection : text.recap.next];
    expect(await tabStops(page)).toEqual(order);
    for (const name of order) {
      await page.keyboard.press("Tab");
      await expectFocusedControl(page, name);
    }
    await resize(page, "1920x1080");
    await expectFocusedControl(page, order[order.length - 1]);
    await resize(page, "1280x720");
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
  }

  await expectTitleFocus(page, reflectionTitle(page), CREAM);
  const order = [text.reflection.playAgain, copy.backToGallery, text.download.button.png, text.download.button.pdf];
  expect(await tabStops(page)).toEqual(order);
  for (const name of order) {
    await page.keyboard.press("Tab");
    await expectFocusedControl(page, name);
  }
  await resize(page, "1366x768");
  await expectFocusedControl(page, text.download.button.pdf);
  await resize(page, "1280x720");
  expectClean(log);
});

test("keyboard: Spasi, Enter, M, tombol lain, pengubah, tekanan berulang, dan tombol yang ditahan (AC-13, AC-14)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, { reduce: true, recorder: true });
  await unlock(page);
  await playDay(page, day("BBBBBB"));
  let clicks = await clickCount(page);
  const expectClicks = async (added: number, note: string) => {
    clicks += added;
    expect(await clickCount(page), `${note}: bunyi klik`).toBe(clicks);
  };
  const ignoredKeys = async (at: string) => {
    const before = { status: await status(page).textContent(), focus: await page.evaluate(() => document.activeElement?.className ?? "") };
    for (const key of ["0", "1", "4", "a", "p", "t", "s", "ArrowRight", "Escape", "Control+Enter", "Alt+Enter", "Meta+Enter", "Control+Space", "Meta+Space"]) {
      await page.keyboard.press(key);
      expect(await where(page), `${at}: ${key}`).toBe(at);
    }
    expect({ status: await status(page).textContent(), focus: await page.evaluate(() => document.activeElement?.className ?? "") }).toEqual(before);
    await expectClicks(0, `${at}: tombol lain`);
  };
  const toggleSound = async (at: string) => {
    await page.keyboard.press("m");
    await expect(status(page)).toHaveText(copy.sound.off);
    await expectClicks(0, `${at}: suara mati`);
    await page.keyboard.press("m");
    await expect(status(page)).toHaveText(copy.sound.on);
    await expectClicks(1, `${at}: suara nyala dengan satu klik tanda`);
  };

  // Layar akhir.
  await page.clock.runFor(600);
  await ignoredKeys("akhir");
  await toggleSound("akhir");
  await page.keyboard.press("Space");
  expect(await where(page)).toBe("rekap-1");
  await expectClicks(1, "Spasi di layar akhir");

  // Halaman 1: Enter yang ditahan pada "Berikutnya" yang berfokus, ditekan pada 599 ms dan diulang sesudah 600 ms.
  await page.keyboard.press("Tab");
  await expect(recapNext(page)).toBeFocused();
  await page.clock.runFor(599);
  await page.keyboard.down("Enter");
  await page.clock.runFor(1);
  await page.keyboard.down("Enter");
  await page.keyboard.down("Enter");
  expect(await where(page)).toBe("rekap-1");
  await expectClicks(0, "Enter yang ditahan");
  await page.keyboard.up("Enter");
  await page.keyboard.press("Enter");
  expect(await where(page)).toBe("rekap-2");
  await expectClicks(1, "Enter baru sesudah dilepas");

  // Halaman 2: tombol lain, M, lalu Enter sebagai pintasan.
  await page.clock.runFor(600);
  await ignoredKeys("rekap-2");
  await toggleSound("rekap-2");
  await page.keyboard.press("Enter");
  expect(await where(page)).toBe("rekap-3");
  await expectClicks(1, "Enter di rekap");

  // Halaman 3: tekanan berulang sebagai pintasan diabaikan.
  await page.clock.runFor(599);
  await page.keyboard.down("Enter");
  await page.clock.runFor(1);
  await page.keyboard.down("Enter");
  await page.keyboard.up("Enter");
  expect(await where(page)).toBe("rekap-3");
  await expectClicks(0, "Enter berulang sebagai pintasan");
  await page.keyboard.press("Space");
  expect(await where(page)).toBe("rekap-4");
  await expectClicks(1, "Spasi di rekap");
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  expect(await where(page)).toBe("refleksi");
  await expectClicks(1, "Lanjut ke refleksi");

  // Refleksi: Spasi dan Enter bukan pintasan; tombol lain tanpa pengaruh; M bekerja.
  await page.clock.runFor(600);
  await page.keyboard.press("Space");
  await page.keyboard.press("Enter");
  expect(await where(page)).toBe("refleksi");
  await expectClicks(0, "Spasi dan Enter di judul refleksi");
  await ignoredKeys("refleksi");
  await toggleSound("refleksi");

  // Enter yang ditahan pada "Main lagi": satu permainan baru, pengulangan tidak melewati layar narasi pertama.
  const screens = narrationFor(SCENES[0], []);
  expect(screens.length).toBeGreaterThan(1);
  await page.keyboard.press("Tab");
  await expect(playAgainButton(page)).toBeFocused();
  await page.keyboard.down("Enter");
  expect(await where(page)).toBe("narasi");
  await expect(narrationText(page)).toHaveText(screens[0]);
  await expectClicks(1, "Main lagi");
  for (let i = 0; i < 3; i++) await page.keyboard.down("Enter");
  await expect(narrationText(page)).toHaveText(screens[0]);
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 1/6");
  await expectClicks(0, "Enter yang ditahan sesudah Main lagi");
  await page.keyboard.up("Enter");
  await page.keyboard.press("Enter");
  await expect(narrationText(page)).toHaveText(screens[1]);
  await expectClicks(1, "Enter baru di narasi");
  expectClean(log);
});

test("pembaca layar: nama, awalan tersembunyi, unsur tersembunyi, dan unsur yang tidak dipasang (AC-12)", async ({ page }) => {
  const log = watch(page);
  const d = day("BBBCCC");
  const state = model(d);
  const view = scaleView(state.meters);
  const rows = recapRows(state.history, SCENES, state.teams, state.flags);
  await openPlay(page, { reduce: true });
  await playDay(page, d);
  const main = page.locator("main.ss-play");
  await expect(main).toHaveAccessibleName(text.heading.ending);
  await expect(page.locator(".ss-stage-frame")).toHaveAccessibleName(`${ENDINGS[endingFor(state.meters)].alt} ${scaleSentence(view)}`);
  await expect(page.locator(".ss-scale")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(".ss-team-top")).toHaveCount(2);
  for (const tag of await page.locator(".ss-team-top").all()) await expect(tag).toHaveAttribute("aria-hidden", "true");
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");

  for (let p = 1; p <= 4; p++) {
    await expect(recapScreen(page, p)).toBeVisible();
    await expect(main).toHaveAccessibleName(text.heading.recap);
    const list = page.getByRole("list", { name: text.recap.list, exact: true });
    await expect(list).toHaveCount(1);
    const snapshot = await list.ariaSnapshot();
    for (const row of rows.filter((item) => PAGES[p - 1].includes(item.number - 1))) {
      expect(snapshot).toContain(`${text.recap.prefix.scene(row.number)}${row.scene.title}`);
      expect(snapshot).toContain(`${text.recap.prefix.choice(row.choice.id)}${row.choiceText}`);
      expect(snapshot).toContain(row.same ? `${text.recap.prefix.bestSame}${text.recap.same}` : `${text.recap.prefix.best(row.best.id)}${row.bestText}`);
      for (const reference of row.references) expect(snapshot).toContain(reference.text);
    }
    expect(snapshot).toContain(text.recap.prefix.refs.trim());
    for (const element of await page.locator(".ss-recap .ss-choice-key, .ss-recap-key, .ss-recap-icon").all()) {
      await expect(element).toHaveAttribute("aria-hidden", "true");
    }
    for (const selector of UNMOUNTED) await expect(page.locator(selector), `${selector} di halaman ${p}`).toHaveCount(0);
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
  }

  await expect(reflectionTitle(page)).toBeFocused();
  await expect(main).toHaveAccessibleName(text.heading.reflection);
  await expect(page.getByRole("list", { name: text.reflection.list, exact: true })).toHaveCount(1);
  for (const element of await page.locator(".ss-reflection-prompt .ss-choice-key").all()) await expect(element).toHaveAttribute("aria-hidden", "true");
  for (const selector of UNMOUNTED) await expect(page.locator(selector), `${selector} di refleksi`).toHaveCount(0);
  await expect(downloadButton(page, "png")).toHaveAccessibleName(text.download.name.png);
  await expect(downloadButton(page, "pdf")).toHaveAccessibleName(text.download.name.pdf);
  expectClean(log);
});

test("unduh gambar dan PDF: berkas, kabar, klik ganda, tombol yang ditahan, dan kabar terpanjang (AC-9, AC-13, AC-14, AC-17, AC-18)", async ({ page }) => {
  test.setTimeout(180_000);
  const log = watch(page);
  const downloads: Download[] = [];
  page.on("download", (download) => downloads.push(download));
  await openPlay(page, { reduce: true, paused: false, recorder: true });
  await unlock(page);
  await playDay(page, day("BBBCCC"), { paused: false });
  await finishDay(page, false);
  await expect(downloadButton(page, "png")).not.toHaveAttribute("aria-disabled", /.*/);
  await recordDownload(page);
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));

  // Gambar, dengan klik ganda: satu berkas dan satu bunyi klik.
  let clicks = await clickCount(page);
  const date = await pageDate(page);
  const pngEvent = page.waitForEvent("download");
  await downloadButton(page, "png").dblclick();
  const png = await pngEvent;
  await expect(downloadLine(page)).toHaveText(text.download.done.png);
  await expect(status(page)).toHaveText(text.download.done.png);
  await page.waitForTimeout(1000);
  expect(downloads.length).toBe(1);
  expect(await clickCount(page)).toBe(clicks + 1);
  expect(png.suggestedFilename()).toBe(`rekap-sehari-setara-${date}.png`);
  expectDownloadSequence(await takeSnaps(page), "png");
  const pngBytes = readFileSync((await png.path()) as string);
  expect([...pngBytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect([pngBytes.readUInt32BE(16), pngBytes.readUInt32BE(20)]).toEqual([1240, 1754]);
  const pixels = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.drawImage(image, 0, 0);
    return [[...context.getImageData(10, 10, 1, 1).data].slice(0, 3), [...context.getImageData(45, 30, 1, 1).data].slice(0, 3)];
  }, pngBytes.toString("base64"));
  expect(pixels).toEqual([
    [255, 246, 224],
    [74, 79, 156],
  ]);
  await png.saveAs(`${SHOTS}/unduhan_rekap.png`);
  const pngRequests = requests.splice(0).filter((url) => url.startsWith("http"));
  expect(pngRequests.filter((url) => !url.startsWith("http://127.0.0.1:")), "permintaan ke host lain").toEqual([]);
  console.log(`[unduh] permintaan selama unduhan gambar: ${pngRequests.map((url) => url.split("/").pop()).join(", ") || "(tidak ada)"}`);

  // Letak refleksi dengan kabar terpanjang di keempat ukuran.
  for (const size of SIZES) {
    await resize(page, size);
    const m = await checkReflectionLayout(page, size, `refleksi kabar terpanjang ${size}`);
    expect(m.status.text).toBe(text.download.done.png);
    near(m.status.width, 52.7, 0.5, `${size}: lebar kabar terpanjang`);
  }
  await resize(page, "1280x720");
  // Tetikus dijauhkan, agar tangkapan layar tidak menampilkan warna arah tetikus pada "Unduh gambar".
  await page.mouse.move(1, 1);
  await shot(page, "refleksi_unduh_siap_1280x720.png");

  // PDF.
  clicks = await clickCount(page);
  const pdfEvent = page.waitForEvent("download");
  await downloadButton(page, "pdf").click();
  const pdf = await pdfEvent;
  await expect(downloadLine(page)).toHaveText(text.download.done.pdf);
  await expect(status(page)).toHaveText(text.download.done.pdf);
  expect(downloads.length).toBe(2);
  expect(await clickCount(page)).toBe(clicks + 1);
  expect(pdf.suggestedFilename()).toBe(`rekap-sehari-setara-${date}.pdf`);
  expectDownloadSequence(await takeSnaps(page), "pdf");
  checkPdf(readFileSync((await pdf.path()) as string));
  await pdf.saveAs("test-results/unduhan_rekap.pdf");
  expect(requests.filter((url) => url.startsWith("http") && !url.startsWith("http://127.0.0.1:"))).toEqual([]);

  // Enter yang ditahan pada "Unduh gambar": satu unduhan dan satu bunyi klik, juga bila diulang sesudah selesai.
  await downloadButton(page, "png").focus();
  clicks = await clickCount(page);
  const heldEvent = page.waitForEvent("download");
  await page.keyboard.down("Enter");
  for (let i = 0; i < 3; i++) await page.keyboard.down("Enter");
  await heldEvent;
  await expect(downloadLine(page)).toHaveText(text.download.done.png);
  for (let i = 0; i < 3; i++) await page.keyboard.down("Enter");
  await page.keyboard.up("Enter");
  await page.waitForTimeout(1500);
  expect(downloads.length).toBe(3);
  expect(await clickCount(page)).toBe(clicks + 1);
  expect(requests.filter((url) => url.startsWith("http") && !url.startsWith("http://127.0.0.1:"))).toEqual([]);
  expectClean(log);
});

test("unduhan gagal dan dibatalkan: tanpa CompressionStream, toBlob null, dan Main lagi saat disiapkan (AC-19)", async ({ page }) => {
  test.setTimeout(180_000);
  const log = watch(page);
  let downloads = 0;
  page.on("download", () => (downloads += 1));
  await openPlay(page, { reduce: true, paused: false });
  await playDay(page, day("BBBBBB"), { paused: false });
  await finishDay(page, false);
  await expect(downloadButton(page, "png")).not.toHaveAttribute("aria-disabled", /.*/);
  const enabled = async () => {
    for (const kind of ["png", "pdf"] as const) await expect(downloadButton(page, kind)).not.toHaveAttribute("aria-disabled", /.*/);
    await expect(page.locator(".ss-download[data-sibuk]")).toHaveCount(0);
  };

  // Tanpa CompressionStream: PDF gagal tanpa berkas dan tanpa galat halaman; gambar tetap berhasil.
  await page.evaluate(() => {
    delete (window as unknown as { CompressionStream?: unknown }).CompressionStream;
  });
  await downloadButton(page, "pdf").click();
  await expect(downloadLine(page)).toHaveText(text.download.failed);
  await expect(status(page)).toHaveText(text.download.failed);
  await enabled();
  await page.waitForTimeout(500);
  expect(downloads).toBe(0);
  const pngEvent = page.waitForEvent("download");
  await downloadButton(page, "png").click();
  await pngEvent;
  await expect(downloadLine(page)).toHaveText(text.download.done.png);
  expect(downloads).toBe(1);

  // toBlob menghasilkan null: gambar gagal; sesudah gagal, tombol bisa ditekan lagi.
  await page.evaluate(() => {
    const proto = HTMLCanvasElement.prototype as unknown as { toBlob: (callback: BlobCallback) => void; ssToBlob?: unknown };
    proto.ssToBlob = proto.toBlob;
    proto.toBlob = (callback: BlobCallback) => callback(null);
  });
  await downloadButton(page, "png").click();
  await expect(downloadLine(page)).toHaveText(text.download.failed);
  await enabled();
  await page.waitForTimeout(500);
  expect(downloads).toBe(1);
  await page.evaluate(() => {
    const proto = HTMLCanvasElement.prototype as unknown as { toBlob: unknown; ssToBlob: unknown };
    proto.toBlob = proto.ssToBlob;
  });
  const againEvent = page.waitForEvent("download");
  await downloadButton(page, "png").click();
  await againEvent;
  await expect(downloadLine(page)).toHaveText(text.download.done.png);
  expect(downloads).toBe(2);

  // Penyiapan dibuat lambat (toBlob tertunda 3 detik) untuk kedua kasus pembatalan di bawah.
  await page.evaluate(() => {
    const proto = HTMLCanvasElement.prototype as unknown as {
      toBlob: (this: HTMLCanvasElement, callback: BlobCallback, type?: string) => void;
    };
    const original = proto.toBlob;
    proto.toBlob = function (this: HTMLCanvasElement, callback: BlobCallback, type?: string) {
      setTimeout(() => original.call(this, callback, type), 3000);
    };
  });

  // "Kembali ke galeri" selama penyiapan: layar refleksi ditinggalkan, jadi tidak ada berkas dan tidak ada kabar, dan
  // lembar dilepas. Pendengar uji di window membatalkan perpindahan halaman sesudah pendengar React, agar galeri 3D
  // tidak dimuat; permainan tetap menganggap halaman berpindah.
  await page.evaluate(() => {
    window.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a.ss-button")) event.preventDefault();
    });
  });
  await downloadButton(page, "png").click();
  await expect(downloadLine(page)).toHaveText(text.download.preparing.png);
  await expect(page.locator("body > .ss-sheet")).toHaveCount(1);
  await galleryLink(page).click();
  await expect(page.locator(".ss-sheet")).toHaveCount(0);
  await expect(page.locator(".ss-download[data-sibuk]")).toHaveCount(0);
  await expect(downloadLine(page)).toHaveText("");
  await page.waitForTimeout(4000);
  expect(downloads, "tanpa berkas sesudah Kembali ke galeri").toBe(2);
  await expect(downloadLine(page)).toHaveText("");

  // "Main lagi" selama penyiapan: tidak ada berkas, tidak ada kabar, dan lembar dilepas.
  await downloadButton(page, "png").click();
  await expect(downloadLine(page)).toHaveText(text.download.preparing.png);
  await expect(page.locator("body > .ss-sheet")).toHaveCount(1);
  await expect(page.locator(".ss-download[data-sibuk]")).toHaveCount(1);
  await playAgainButton(page).click();
  await expect(page.locator(".ss-narration .ss-next")).toBeFocused();
  await expect(page.locator(".ss-sheet")).toHaveCount(0);
  await page.waitForTimeout(4000);
  expect(downloads).toBe(2);
  await expect(status(page)).toHaveText("");
  expect(log.page).toEqual([]);
  expectClean(log);
});

test("pramuat: ketiga ilustrasi akhir dan strip timbangan diminta saat adegan 6 dimulai (AC-20)", async ({ page }) => {
  const log = watch(page);
  const requested: string[] = [];
  page.on("request", (request) => requested.push(request.url()));
  const names = () => [...new Set(requested.filter((url) => ENDING_ASSET.test(url)).map((url) => ENDING_ASSET.exec(url)?.[1] ?? ""))].sort();
  await openPlay(page, { reduce: true });
  await playDay(page, day("BBBBBB"), {
    atScene: async (index) => {
      if (index < 5) expect(names(), `adegan ${index + 1}`).toEqual([]);
      else await expect.poll(names, { message: "adegan 6, sebelum layar akhir" }).toEqual(["end_berat", "end_hampir", "end_setara", "ui_timbangan"]);
    },
  });
  expectClean(log);
});

test("ilustrasi akhir dan timbangan gagal dimuat: layar akhir tetap lengkap dan permainan berlanjut (AC-20)", async ({ page }) => {
  const consoleErrors: { text: string; url: string }[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push({ text: message.text(), url: message.location().url });
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.route(ENDING_ASSET, (route) => route.abort());
  const d = day("BBBCCC");
  const state = model(d);
  const id = endingFor(state.meters);
  await openPlay(page, { reduce: true });
  await playDay(page, d);
  await expect(endingTitle(page)).toHaveText(ENDINGS[id].title);
  await expect(page.locator(".ss-ending-message")).toHaveText(ENDINGS[id].message.join(" "));
  await expect(page.locator('.ss-meter[data-meter="hak"]')).toHaveAttribute("aria-valuenow", String(state.meters.hak));
  await expect(page.locator('.ss-meter[data-meter="kewajiban"]')).toHaveAttribute("aria-valuenow", String(state.meters.kewajiban));
  await expect(page.locator(".ss-team")).toHaveCount(2);
  await expect(endingNext(page)).toBeVisible();
  await expect(page.locator(".ss-stage-frame")).toHaveCSS("background-color", MIST);
  await expect(page.locator(".ss-stage-frame")).toHaveAttribute("aria-label", `${ENDINGS[id].alt} ${scaleSentence(scaleView(state.meters))}`);
  await finishDay(page, true);
  await expect(reflectionTitle(page)).toBeFocused();
  expect(pageErrors).toEqual([]);
  expect(consoleErrors.length).toBeGreaterThan(0);
  for (const error of consoleErrors) {
    expect(error.text).toMatch(/Failed to load resource/);
    expect(`${error.url} ${error.text}`).toMatch(/(end_(setara|hampir|berat)|ui_timbangan)-[^/]*\.png/);
  }
});

test("kontras teks di ketiga layar dan keempat ukuran, dan mode warna paksa (AC-22, AC-23)", async ({ page }) => {
  test.setTimeout(180_000);
  const log = watch(page);
  await openPlay(page, { reduce: true });
  // Jalur dengan ketiga tingkat; bintang seri sehingga kedua tim bertanda "Bintang terbanyak".
  await playDay(page, day("ABCABC"));
  await expect(page.locator(".ss-team-top")).toHaveCount(2);
  const allSizes = async (note: string) => {
    for (const size of SIZES) {
      await resize(page, size);
      const count = await checkContrast(page, `${note} ${size}`);
      if (size === "1280x720") console.log(`[kontras] ${note}: ${count} teks`);
    }
    await resize(page, "1280x720");
  };
  /** Mode warna paksa: sudut terpotong dimatikan, dan semua tulisan tetap ada. */
  const forced = async (note: string, selectors: string) => {
    const before = await page.evaluate(() => document.body.innerText);
    await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
    const clips = await page.evaluate((target) => [...document.querySelectorAll(target)].map((element) => getComputedStyle(element).clipPath), selectors);
    expect(clips.length, note).toBeGreaterThan(0);
    expect([...new Set(clips)], `${note}: clip-path`).toEqual(["none"]);
    expect(await page.evaluate(() => document.body.innerText), `${note}: tulisan`).toBe(before);
    await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "none" });
  };

  // Layar akhir: tombol tertahan, siap, dan berfokus.
  await allSizes("akhir tertahan");
  await page.clock.runFor(600);
  await checkContrast(page, "akhir siap");
  await page.keyboard.press("Tab");
  await expectFocusedControl(page, text.ending.next);
  await checkContrast(page, "akhir berfokus");
  await forced("akhir", ".ss-next");
  await page.keyboard.press("Enter");

  // Keempat halaman rekap, dengan ketiga tingkat.
  const tiers = new Set<string>();
  for (let p = 1; p <= 4; p++) {
    await expect(recapScreen(page, p)).toBeVisible();
    for (const tier of await page.locator(".ss-recap-tier").evaluateAll((all) => all.map((element) => element.getAttribute("data-tier") ?? ""))) tiers.add(tier);
    await allSizes(`rekap halaman ${p} tertahan`);
    await page.clock.runFor(600);
    await checkContrast(page, `rekap halaman ${p} siap`);
    if (p > 1) await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await checkContrast(page, `rekap halaman ${p} berfokus`);
    if (p === 1) await forced("rekap", ".ss-recap-row, .ss-next");
    await page.keyboard.press("Enter");
  }
  expect([...tiers].sort()).toEqual(["berisiko", "kurang", "tepat"]);

  // Refleksi: tertahan, siap, berfokus, lalu unduhan yang sedang disiapkan (jam dijeda menahan penyiapan).
  await expect(reflectionTitle(page)).toBeFocused();
  await allSizes("refleksi tertahan");
  await page.clock.runFor(600);
  await checkContrast(page, "refleksi siap");
  for (const name of [text.reflection.playAgain, copy.backToGallery, text.download.button.png, text.download.button.pdf]) {
    await page.keyboard.press("Tab");
    await expectFocusedControl(page, name);
    await checkContrast(page, `refleksi berfokus pada ${name}`);
  }
  await forced("refleksi", ".ss-reflection-prompts, .ss-button");
  await downloadButton(page, "png").click();
  await expect(downloadLine(page)).toHaveText(text.download.preparing.png);
  await expect(page.locator('.ss-download[data-sibuk="png"]')).toHaveCount(1);
  await page.keyboard.press("Tab");
  await expect(downloadButton(page, "pdf")).toBeFocused();
  const busy = await downloadButton(page, "pdf").evaluate((element) => {
    const style = getComputedStyle(element);
    return { bg: style.backgroundColor, color: style.color, outline: `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`, cursor: getComputedStyle(element, "::before").visibility };
  });
  expect(busy).toEqual({ bg: MIST, color: DUSK, outline: `solid 2px ${INK}`, cursor: "visible" });
  await allSizes("refleksi unduhan disiapkan");
  await playAgainButton(page).click();
  await expect(page.locator(".ss-narration .ss-next")).toBeFocused();
  await expect(page.locator(".ss-sheet")).toHaveCount(0);
  expectClean(log);
});
