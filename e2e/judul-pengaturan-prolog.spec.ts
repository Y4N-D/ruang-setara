// Uji ujung ke ujung layar judul, cara bermain, pengaturan kelas, prolog, dan dialog pengaturan Sehari Setara
// (spesifikasi F-10, AC-1 sampai AC-26 dan AC-29; Rencana uji langkah 3 sampai 9). Membuka hasil build di
// /ruang-setara/sehari-setara/ lewat serve-subpath.mjs, seperti alamat GitHub Pages. Tangkapan layar ditulis ke
// test-results/tangkapan/F-10, lalu disalin ke docs/sehari-setara/tests/F-10/.
import { expect, test, type Locator, type Page } from "@playwright/test";
import { PROLOG } from "../app/sehari-setara/content/prolog";
import { SCENES } from "../app/sehari-setara/content/scenes";
import {
  answerQuiz,
  awardPrompt,
  contrast,
  endingScreen,
  endingTitle,
  expectClean,
  finishDay,
  INK,
  playAgainButton,
  reflectionTitle,
  settle,
  SHOTS,
  startGame,
  SUN,
  titleStart,
  VIEWPORTS,
  watch,
  type ViewportName,
} from "./bantuan";

test.describe.configure({ mode: "serial" });

const T0 = new Date("2026-11-04T08:00:00+07:00").getTime();
const SIZES = Object.keys(VIEWPORTS) as ViewportName[];
const IDS = ["mangga", "laut", "daun", "mentari"];
const NAMES = ["Tim Mangga", "Tim Laut", "Tim Daun", "Tim Mentari"];
const shot = (page: Page, name: string) => page.screenshot({ path: `${SHOTS}/F-10/${name}` });

/* ---------------- Nilai tabel spesifikasi (bagian Tata letak dan ukuran), dalam u ---------------- */

type Span = [number, number];
const TITLE: Record<ViewportName, { rows: Span; buttons: Span[] }> = {
  "1280x720": { rows: [89.5, 97.7], buttons: [[37.9, 60.0], [63.0, 98.0], [101.0, 139.8]] },
  "1366x768": { rows: [89.6, 97.6], buttons: [[38.1, 60.0], [63.0, 98.0], [101.0, 139.7]] },
  "1920x1080": { rows: [89.5, 97.7], buttons: [[37.9, 60.0], [63.0, 98.0], [101.0, 139.8]] },
  "1024x768": { rows: [89.4, 97.8], buttons: [[37.5, 59.9], [62.9, 98.1], [101.1, 140.2]] },
};
const HOWTO_CLOSE: Record<ViewportName, { rows: Span; cols: Span }> = {
  "1280x720": { rows: [88.9, 97.0], cols: [146.2, 169.8] },
  "1366x768": { rows: [88.9, 97.0], cols: [146.3, 169.8] },
  "1920x1080": { rows: [88.9, 97.0], cols: [146.2, 169.8] },
  "1024x768": { rows: [88.6, 97.0], cols: [145.9, 169.8] },
};
const SETUP: Record<ViewportName, { spare2: number; spare34: number; back: Span; start: Span; rows: Span }> = {
  "1280x720": { spare2: 30.9, spare34: 22.1, back: [8.0, 33.5], start: [131.2, 169.8], rows: [87.9, 96.0] },
  "1366x768": { spare2: 31.4, spare34: 22.8, back: [8.0, 33.4], start: [131.3, 169.8], rows: [87.9, 96.0] },
  "1920x1080": { spare2: 30.9, spare34: 22.1, back: [8.0, 33.5], start: [131.2, 169.8], rows: [87.9, 96.0] },
  "1024x768": { spare2: 28.7, spare34: 18.7, back: [8.0, 33.7], start: [131.0, 169.8], rows: [87.6, 96.0] },
};
const PROLOG_BOX: Record<ViewportName, { spare: [number, number]; rows: Span; next: Span; startLeft: number }> = {
  "1280x720": { spare: [13.6, 8.8], rows: [90.3, 96.6], next: [155.2, 170.8], startLeft: 145.9 },
  "1366x768": { spare: [13.8, 8.9], rows: [90.4, 96.7], next: [155.3, 170.9], startLeft: 146.0 },
  "1920x1080": { spare: [13.6, 8.8], rows: [90.3, 96.6], next: [155.2, 170.8], startLeft: 145.9 },
  "1024x768": { spare: [13.1, 8.2], rows: [89.9, 96.5], next: [154.7, 170.7], startLeft: 145.5 },
};
const SETTINGS: Record<ViewportName, { button: [number, number, number, number]; size: Span; top: number; system: number; close: [number, number, number, number] }> = {
  "1280x720": { button: [128.0, 155.8, 1.0, 7.0], size: [130.3, 63.1], top: 18.5, system: 71.2, close: [125.9, 149.5, 70.5, 78.6] },
  "1366x768": { button: [128.1, 155.8, 1.0, 6.9], size: [130.0, 62.7], top: 18.7, system: 70.8, close: [125.9, 149.4, 70.3, 78.4] },
  "1920x1080": { button: [128.0, 155.8, 1.0, 7.0], size: [130.3, 63.1], top: 18.5, system: 71.2, close: [125.9, 149.5, 70.5, 78.6] },
  "1024x768": { button: [127.8, 155.8, 1.0, 7.2], size: [131.4, 64.7], top: 17.6, system: 72.8, close: [126.0, 149.9, 70.9, 79.3] },
};
const TURNS: Record<2 | 3 | 4, string[]> = {
  2: ["Adegan 1, 3, 5", "Adegan 2, 4, 6"],
  3: ["Adegan 1, 4", "Adegan 2, 5", "Adegan 3, 6"],
  4: ["Adegan 1, 5", "Adegan 2, 6", "Adegan 3", "Adegan 4"],
};
const SENTENCES: Record<2 | 3 | 4, string[]> = {
  2: ["Tim Mangga, giliran adegan 1, 3, dan 5.", "Tim Laut, giliran adegan 2, 4, dan 6."],
  3: ["Tim Mangga, giliran adegan 1 dan 4.", "Tim Laut, giliran adegan 2 dan 5.", "Tim Daun, giliran adegan 3 dan 6."],
  4: ["Tim Mangga, giliran adegan 1 dan 5.", "Tim Laut, giliran adegan 2 dan 6.", "Tim Daun, giliran adegan 3.", "Tim Mentari, giliran adegan 4."],
};
const ANNOUNCE: Record<2 | 3 | 4, string> = {
  2: "2 tim: Tim Mangga dan Tim Laut.",
  3: "3 tim: Tim Mangga, Tim Laut, dan Tim Daun.",
  4: "4 tim: Tim Mangga, Tim Laut, Tim Daun, dan Tim Mentari.",
};
const STEPS = [
  "Kelas dibagi menjadi 2 sampai 4 tim. Setiap adegan, satu tim mendapat giliran.",
  "Bacalah situasinya bersama, lalu diskusikan pilihan sebelum waktu habis.",
  "Tim yang mendapat giliran menyebutkan pilihan A, B, atau C beserta alasannya.",
  "Kartu dampak menjelaskan hak, kewajiban, dan pasal yang berkaitan.",
  "Guru memberi 0, 1, atau 2 bintang untuk alasan tim, bukan untuk tebakan cepat.",
  "Tidak ada yang kalah. Di akhir hari, kelas melihat rekap dan menulis refleksi.",
];
const KEYS: Array<[string, string, string]> = [
  ["Spasi / Enter", "Spasi atau Enter", "Lanjut"],
  ["1 2 3 / A B C", "1, 2, 3, atau A, B, C", "Memilih"],
  ["P", "P", "Jeda atau lanjutkan waktu"],
  ["T", "T", "Tambah 30 detik"],
  ["S", "S", "Lewati diskusi"],
  ["0 1 2", "0, 1, atau 2", "Memberi bintang alasan"],
  ["1 2 3 4", "1, 2, 3, atau 4", "Menjawab kuis peran"],
  ["M", "M", "Suara nyala atau mati"],
  ["Esc", "Esc", "Pengaturan"],
];

/* ---------------- Fungsi bantu ---------------- */

/** Perekam bunyi kecil: lama setiap bufer yang diputar dan banyak berkas yang selesai di-decode. */
function installRecorder() {
  const record = { plays: [] as number[], decoded: 0 };
  (window as unknown as { ssUjiBunyi: typeof record }).ssUjiBunyi = record;
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (this: AudioBufferSourceNode, ...args: Parameters<AudioBufferSourceNode["start"]>) {
    record.plays.push(this.buffer?.duration ?? 0);
    return start.apply(this, args);
  };
  const decode = BaseAudioContext.prototype.decodeAudioData;
  BaseAudioContext.prototype.decodeAudioData = function (this: BaseAudioContext, data: ArrayBuffer) {
    const result = decode.call(this, data);
    void result.then(() => {
      record.decoded += 1;
    });
    return result;
  } as typeof decode;
}

const soundRecord = (page: Page) =>
  page.evaluate(() => {
    const record = (window as unknown as { ssUjiBunyi: { plays: number[]; decoded: number } }).ssUjiBunyi;
    return { clicks: record.plays.filter((d) => d > 0.04).length, blips: record.plays.filter((d) => d <= 0.04).length, decoded: record.decoded };
  });
const clickCount = async (page: Page) => (await soundRecord(page)).clicks;

/** Pencatat penyimpanan peramban: setiap panggilan setItem dan indexedDB.open (AC-29). */
function installStorageSpy() {
  const calls: string[] = [];
  (window as unknown as { ssUjiSimpan: string[] }).ssUjiSimpan = calls;
  const setItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (this: Storage, key: string, value: string) {
    calls.push(`setItem:${key}`);
    return setItem.call(this, key, value);
  };
  const open = IDBFactory.prototype.open;
  IDBFactory.prototype.open = function (this: IDBFactory, name: string, version?: number) {
    calls.push(`indexedDB:${name}`);
    return open.call(this, name, version);
  };
}

interface OpenOptions {
  size?: ViewportName;
  reduce?: boolean;
  paused?: boolean;
  recorder?: boolean;
  spy?: boolean;
  hash?: string;
}

/** Membuka layar judul; dengan paused, jam uji dijeda sebelum halaman dimuat. */
async function openTitle(page: Page, { size = "1280x720", reduce = true, paused = false, recorder = false, spy = false, hash = "" }: OpenOptions = {}) {
  const { width, height } = VIEWPORTS[size];
  if (recorder) await page.addInitScript(installRecorder);
  if (spy) await page.addInitScript(installStorageSpy);
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: reduce ? "reduce" : "no-preference" });
  if (paused) {
    await page.clock.install({ time: T0 });
    await page.clock.pauseAt(T0 + 60_000);
  }
  await page.goto(`sehari-setara/${hash}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.ss-play[data-fase="title"]')).toBeVisible();
  await expect(titleStart(page)).toBeFocused();
}

/** Kotak unsur dalam u, relatif terhadap layar 16:9. */
const box = (locator: Locator) =>
  locator.evaluate((el) => {
    const screen = (document.querySelector(".ss-screen") as HTMLElement).getBoundingClientRect();
    const u = screen.height / 100;
    const r = el.getBoundingClientRect();
    return { l: (r.left - screen.left) / u, r: (r.right - screen.left) / u, t: (r.top - screen.top) / u, b: (r.bottom - screen.top) / u, w: r.width / u, h: r.height / u };
  });

/** Banyak baris teks: tinggi kotak dibagi tinggi baris. */
const lines = (locator: Locator) =>
  locator.evaluate((el) => {
    const style = getComputedStyle(el);
    return Math.round(el.getBoundingClientRect().height / parseFloat(style.lineHeight));
  });

/** Ukuran huruf dalam u. */
const fontU = (locator: Locator) =>
  locator.evaluate((el) => parseFloat(getComputedStyle(el).fontSize) / ((document.querySelector(".ss-screen") as HTMLElement).getBoundingClientRect().height / 100));

function near(actual: number, expected: number, note: string, tolerance = 0.5) {
  expect(Math.abs(actual - expected), `${note}: ${actual.toFixed(2)}u, tabel ${expected}u`).toBeLessThanOrEqual(tolerance);
}

/** Teks yang tampil di luar layar 16:9 atau terpotong leluhur ber-overflow hidden. */
const overflowing = (page: Page, root: string) =>
  page.evaluate((selector) => {
    const screen = (document.querySelector(".ss-screen") as HTMLElement).getBoundingClientRect();
    const out: string[] = [];
    for (const el of document.querySelectorAll(`${selector}, ${selector} *`)) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())) continue;
      if ((el as HTMLElement).closest(".ss-sr")) continue;
      const r = el.getBoundingClientRect();
      if (r.right > screen.right + 0.5 || r.left < screen.left - 0.5 || r.bottom > screen.bottom + 0.5) out.push(el.textContent?.trim() ?? "");
      for (let a = el.parentElement; a; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (cs.overflowX === "hidden" || cs.overflowY === "hidden") {
          const ar = a.getBoundingClientRect();
          if (r.right > ar.right + 0.5 || r.bottom > ar.bottom + 0.5) out.push(`terpotong: ${el.textContent?.trim()}`);
          break;
        }
      }
    }
    return out;
  }, root);

/** Kontras terkecil teks di dalam root: warna teks terhadap latar terdekat yang tidak bening. */
const contrasts = (page: Page, root: string) =>
  page.evaluate((selector) => {
    const out: Array<{ text: string; fg: string; bg: string }> = [];
    for (const el of document.querySelectorAll(`${selector}, ${selector} *`)) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())) continue;
      if ((el as HTMLElement).closest(".ss-sr, .ss-title-zone, [aria-hidden='true'] .ss-stage")) continue;
      let bg = "rgba(0, 0, 0, 0)";
      for (let a: Element | null = el; a; a = a.parentElement) {
        const color = getComputedStyle(a).backgroundColor;
        if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
          bg = color;
          break;
        }
      }
      out.push({ text: el.textContent?.trim().slice(0, 30) ?? "", fg: getComputedStyle(el).color, bg });
    }
    return out;
  }, root);

async function expectContrast(page: Page, root: string, note: string) {
  for (const item of await contrasts(page, root)) {
    expect(contrast(item.fg, item.bg), `${note}: "${item.text}" ${item.fg} di atas ${item.bg}`).toBeGreaterThanOrEqual(4.5);
  }
}

/** Tab sampai unsur bernama name berfokus, lalu berhenti (keyboard saja). */
async function tabTo(page: Page, name: string) {
  for (let i = 0; i < 16; i++) {
    const focused = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
    if (focused === name) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Tab tidak sampai ke "${name}"`);
}

/** Langkah pembuka dengan keyboard saja (AC-1, AC-20): Tab, Enter, dan Spasi; jam uji dijeda. */
async function openByKeyboard(page: Page, teams: 2 | 3 | 4, seconds: 30 | 60 | 90) {
  await expect(titleStart(page)).toBeFocused();
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await expect(page.locator(".ss-setup-title")).toBeFocused();
  await page.clock.runFor(600);
  for (const name of [`${teams} tim`, `${seconds} detik`]) {
    await tabTo(page, name);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name, exact: true })).toHaveAttribute("aria-pressed", "true");
  }
  await tabTo(page, "Mulai permainan");
  await page.keyboard.press("Space");
  for (const screen of PROLOG) {
    await expect(page.locator(".ss-narration-text")).toHaveText(screen.text);
    await page.clock.runFor(600);
    if ((await page.locator(".ss-narration-rest").textContent()) !== "") await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
  }
  await page.clock.runFor(400);
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 1/6");
  await expect(page.locator(".ss-narration .ss-next")).toBeFocused();
}

const settingsButton = (page: Page) => page.locator(".ss-settings-button");
const dialog = (page: Page) => page.locator(".ss-settings");
const statusRegion = (page: Page) => page.locator('.ss-play [role="status"]');
const liveRegion = (page: Page) => page.locator('.ss-play [aria-live="polite"]');
const timerValue = (page: Page) => page.locator(".ss-timer-value [aria-hidden]");
const dialogOption = (page: Page, row: string, label: string) =>
  page.locator(".ss-settings-cell").nth(["Suara", "Kurangi gerak", "Teks muncul per huruf", "Durasi diskusi"].indexOf(row)).getByRole("button", { name: label, exact: true });

/** Narasi sampai pertanyaan dengan Spasi (teks per huruf menyala: tampilkan sekaligus, lalu lanjut). */
async function toQuestion(page: Page) {
  for (let i = 0; i < 12 && (await page.locator(".ss-question").count()) === 0; i++) await page.keyboard.press("Space");
  await expect(page.locator(".ss-question")).toBeFocused();
}

/** Satu adegan dengan keyboard sampai pergantian selesai; jam uji dijeda. */
async function playScene(page: Page, choice: "A" | "B" | "C", runOut = 0) {
  const index = Number((await page.locator(".ss-topbar-counter").textContent())?.match(/\d/)?.[0] ?? "1") - 1;
  await toQuestion(page);
  if (runOut > 0) {
    await page.clock.runFor(runOut * 1000);
    await expect(page.locator(".ss-timer-text")).toHaveText("Waktunya memilih");
  }
  await page.keyboard.press(choice);
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  if (SCENES[index].roleQuiz) await answerQuiz(page, true);
  await expect(awardPrompt(page)).toBeFocused();
  await page.keyboard.press("1");
  await page.clock.runFor(400);
}

/* ---------------- AC-1: alur dan alamat ---------------- */

test("alur dari layar judul dengan keyboard saja, alamat lama, dan tanda pagar saat bermain (AC-1)", async ({ page }) => {
  const log = watch(page);
  for (const hash of ["", "#", "#main", "#main-3", "#main-4", "#lain", "#Main"]) {
    await page.goto(`sehari-setara/${hash}`);
    await expect(page.locator('.ss-play[data-fase="title"]')).toBeVisible();
    await expect(titleStart(page)).toBeFocused();
  }
  await openTitle(page, { paused: true });
  for (const removed of ["Permainan ini sedang dibuat.", "Lihat pratinjau panggung", "Coba alur permainan"]) {
    await expect(page.getByText(removed)).toHaveCount(0);
  }
  await expect(page.locator(".ss-placeholder")).toHaveCount(0);
  await openByKeyboard(page, 2, 60);
  await toQuestion(page);
  await page.clock.runFor(3000);
  await expect(timerValue(page)).toHaveText("0:57");
  for (const hash of ["#main", "#lain"]) {
    await page.evaluate((target) => {
      window.location.hash = target;
    }, hash);
    await expect(page.locator('.ss-play[data-fase="discuss"]')).toBeVisible();
    await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 1/6");
    await expect(timerValue(page)).toHaveText("0:57");
  }
  await page.evaluate(() => {
    window.location.hash = "#adegan-2";
  });
  await expect(page.locator("#ss-preview-title")).toHaveText(SCENES[1].title);
  await page.getByRole("link", { name: "Tutup pratinjau" }).click();
  await expect(page.locator('.ss-play[data-fase="title"]')).toBeVisible();
  await expect(titleStart(page)).toBeFocused();
  expectClean(log);
});

/* ---------------- AC-2, AC-22: layar judul ---------------- */

for (const size of SIZES) {
  test(`layar judul di ${size}: latar, Nara, judul, tombol, kontras, dan pembaca layar (AC-2, AC-22)`, async ({ page }) => {
    const log = watch(page);
    await openTitle(page, { size, reduce: false });
    await settle(page);
    const t = TITLE[size];
    const screen = await page.locator(".ss-screen").boundingBox();
    const frame = await page.locator(".ss-title .ss-stage-frame").boundingBox();
    expect(screen && frame).toBeTruthy();
    if (!screen || !frame) return;
    expect(Math.abs(frame.width - screen.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(frame.height - screen.height)).toBeLessThanOrEqual(1);
    const kj = screen.height / 180;
    await expect(page.locator(".ss-title .ss-stage-bg")).toHaveCSS("background-image", /bg_title/);
    await expect(page.locator(".ss-title .ss-stage-frame")).toHaveCSS("background-color", "rgb(201, 212, 229)");
    const sprite = page.locator(".ss-title .ss-sprite");
    await expect(sprite).toHaveCSS("background-image", /char_nara_walk/);
    const spriteBox = await sprite.boundingBox();
    const shadowBox = await page.locator(".ss-title .ss-shadow").boundingBox();
    if (!spriteBox || !shadowBox) throw new Error("Nara atau bayangannya tidak tampil");
    for (const [value, expected] of [
      [spriteBox.x - frame.x, 83 * kj], [spriteBox.y - frame.y, 95 * kj], [spriteBox.width, 26 * kj], [spriteBox.height, 62 * kj],
      [shadowBox.x - frame.x, 86 * kj], [shadowBox.y - frame.y, 155 * kj], [shadowBox.width, 20 * kj],
    ]) {
      expect(Math.abs(value - expected), `${size}: letak Nara`).toBeLessThanOrEqual(1);
    }
    await expect(page.locator(".ss-title .ss-shadow")).toHaveAttribute("data-tone", "wood");
    const animation = await sprite.evaluate((el) => {
      const [anim] = el.getAnimations() as CSSAnimation[];
      return anim ? { name: anim.animationName, duration: anim.effect?.getTiming().duration, iterations: anim.effect?.getTiming().iterations, easing: getComputedStyle(el).animationTimingFunction } : null;
    });
    expect(animation).toEqual({ name: "ss-strip", duration: 500, iterations: Infinity, easing: expect.stringMatching(/^steps\(4(, end)?\)$/) });

    const zone = await box(page.locator(".ss-title-zone"));
    near(zone.l, 35.6, `${size} bidang kiri`);
    near(zone.r, 142.2, `${size} bidang kanan`);
    near(zone.t, 3.3, `${size} bidang atas`);
    near(zone.b, 31.1, `${size} bidang bawah`);
    const name = page.locator(".ss-title-name");
    const lead = page.locator(".ss-title-lead");
    await expect(name).toHaveText("Sehari Setara");
    await expect(name).toHaveCSS("font-family", /Press Start 2P/);
    near(await fontU(name), 7, `${size} ukuran judul`, 0.05);
    near(await fontU(lead), 3.1, `${size} ukuran kalimat`, 0.05);
    expect([await lines(name), await lines(lead)]).toEqual([1, 1]);
    const nameBox = await box(name);
    const leadBox = await box(lead);
    near(nameBox.w, 91.0, `${size} lebar judul`);
    near(leadBox.w, 104.5, `${size} lebar kalimat`);
    for (const b of [nameBox, leadBox]) {
      expect(b.l).toBeGreaterThanOrEqual(zone.l - 0.01);
      expect(b.r).toBeLessThanOrEqual(zone.r + 0.01);
      near((b.l + b.r) / 2, (zone.l + zone.r) / 2, `${size} rata tengah`, 0.1);
    }
    const controls = page.locator(".ss-title-actions > *");
    await expect(controls).toHaveText(["Mulai", "Cara bermain", "Kembali ke galeri"]);
    await expect(controls.nth(2)).toHaveAttribute("href", "../");
    for (let i = 0; i < 3; i++) {
      const b = await box(controls.nth(i));
      near(b.l, t.buttons[i][0], `${size} tombol ${i + 1} kiri`);
      near(b.r, t.buttons[i][1], `${size} tombol ${i + 1} kanan`);
      near(b.t, t.rows[0], `${size} tombol ${i + 1} atas`);
      near(b.b, t.rows[1], `${size} tombol ${i + 1} bawah`);
      expect(b.t).toBeGreaterThanOrEqual(87.2 - 0.01);
    }
    expect(await overflowing(page, ".ss-title")).toEqual([]);
    await expect(page.locator(".ss-title-backdrop")).toHaveAttribute("aria-hidden", "true");
    await expect(page.getByRole("main")).toHaveAccessibleName("Sehari Setara");
    // Fokus terlihat dan kontras tombol (AC-22).
    await expect(titleStart(page)).toHaveCSS("background-color", SUN);
    await expectContrast(page, ".ss-title-actions", `${size} tombol judul`);
    if (size !== "1366x768") await shot(page, `judul_${size}.png`);
    // Warna bg_title di TITLE_ZONE hanya langit pagi, dengan kontras ≥ 9:1 terhadap ink (AC-22).
    const colors = await page.evaluate(async () => {
      const url = getComputedStyle(document.querySelector(".ss-title .ss-stage-bg") as HTMLElement).backgroundImage.slice(5, -2);
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 180;
      const g = canvas.getContext("2d") as CanvasRenderingContext2D;
      g.drawImage(img, 0, 0);
      const data = g.getImageData(64, 6, 193, 51).data;
      const seen = new Set<string>();
      for (let i = 0; i < data.length; i += 4) seen.add(`rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`);
      return [...seen].sort();
    });
    expect(colors).toEqual(["rgb(158, 216, 245)", "rgb(255, 241, 201)"]);
    for (const color of colors) expect(contrast(INK, color)).toBeGreaterThanOrEqual(9);
    expectClean(log);
  });
}

/* ---------------- AC-3, AC-4: kurangi gerak dan masa tunggu layar judul ---------------- */

test("layar judul: kurangi gerak dan masa tunggu 600 ms sesudah dimuat, Kembali, dan cara bermain (AC-3, AC-4)", async ({ page }) => {
  const log = watch(page);
  await openTitle(page, { paused: true });
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await expect(page.locator(".ss-title .ss-sprite")).toHaveCSS("background-position", "0px 0px");
  await page.evaluate(() => {
    const w = window as unknown as { ssKlikGaleri: boolean[] };
    w.ssKlikGaleri = [];
    window.addEventListener("click", (event) => {
      if (!(event.target instanceof Element) || !event.target.closest('a[href="../"]')) return;
      w.ssKlikGaleri.push(event.defaultPrevented);
      event.preventDefault();
    });
  });
  const gallery = page.getByRole("link", { name: "Kembali ke galeri" });
  const howTo = page.getByRole("button", { name: "Cara bermain", exact: true });

  const expectHeld = async (note: string) => {
    for (const control of [titleStart(page), howTo, gallery]) await expect(control, note).toHaveAttribute("aria-disabled", "true");
    await titleStart(page).focus();
    for (const key of ["Enter", "Space"]) await page.keyboard.press(key);
    await titleStart(page).click({ force: true });
    await howTo.click({ force: true });
    await gallery.click({ force: true });
    await expect(page.locator('.ss-play[data-fase="title"]'), note).toBeVisible();
    await expect(page.locator(".ss-howto"), note).toHaveCount(0);
  };

  await page.clock.runFor(599);
  await expectHeld("sesudah dimuat");
  await page.clock.runFor(1);
  await expect(titleStart(page)).not.toHaveAttribute("aria-disabled", /.*/);
  await gallery.click();
  expect(await page.evaluate(() => (window as unknown as { ssKlikGaleri: boolean[] }).ssKlikGaleri)).toEqual([true, false]);

  // Sesudah "Kembali".
  await titleStart(page).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".ss-setup")).toBeVisible();
  await page.clock.runFor(600);
  await page.getByRole("button", { name: "Kembali", exact: true }).click();
  await expect(titleStart(page)).toBeFocused();
  await page.clock.runFor(599);
  await expectHeld("sesudah Kembali");
  await page.clock.runFor(1);

  // Sesudah dialog "Cara bermain" ditutup.
  await howTo.click();
  await expect(page.locator(".ss-howto")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(howTo).toBeFocused();
  await page.clock.runFor(599);
  await expectHeld("sesudah cara bermain");
  await page.clock.runFor(1);
  await titleStart(page).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".ss-setup")).toBeVisible();
  expectClean(log);
});

/* ---------------- AC-5: cara bermain ---------------- */

for (const size of SIZES) {
  test(`cara bermain di ${size}: isi, fokus terkunci, menutup, letak, dan pintasan (AC-5)`, async ({ page }) => {
    const log = watch(page);
    await openTitle(page, { size });
    await expect(titleStart(page)).not.toHaveAttribute("aria-disabled", /.*/);
    const howTo = page.getByRole("button", { name: "Cara bermain", exact: true });
    await howTo.click();
    const sheet = page.getByRole("dialog", { name: "Cara bermain" });
    await expect(sheet).toHaveAttribute("aria-modal", "true");
    await expect(page.locator("#ss-howto-title")).toBeFocused();
    await expect(page.locator(".ss-howto-label")).toHaveText(["Langkah bermain", "Tombol keyboard untuk guru"]);
    await expect(page.locator(".ss-howto-step > span:last-child")).toHaveText(STEPS);
    await expect(page.locator(".ss-howto-step .ss-choice-key")).toHaveText(["1", "2", "3", "4", "5", "6"]);
    await expect(page.locator(".ss-key")).toHaveText(KEYS.map((k) => k[0]));
    await expect(page.locator(".ss-howto-keys dt .ss-sr")).toHaveText(KEYS.map((k) => k[1]));
    await expect(page.locator(".ss-howto-keys dd")).toHaveText(KEYS.map((k) => k[2]));
    await expect(page.locator(".ss-howto-foot button")).toHaveText("Tutup");
    await expect(sheet).toMatchAriaSnapshot(`
      - term: Spasi atau Enter
      - definition: Lanjut
    `);
    // Letak.
    const foot = await box(page.locator(".ss-howto-foot"));
    const lastStep = await box(page.locator(".ss-howto-step").last());
    const keyBottoms = await page.locator(".ss-howto-keys > *").evaluateAll((all) => Math.max(...all.map((el) => el.getBoundingClientRect().bottom)));
    const u = await page.evaluate(() => (document.querySelector(".ss-screen") as HTMLElement).getBoundingClientRect().height / 100);
    const screenTop = await page.evaluate(() => (document.querySelector(".ss-screen") as HTMLElement).getBoundingClientRect().top);
    expect(foot.t - lastStep.b, `${size} sisa kiri`).toBeGreaterThanOrEqual(14);
    expect(foot.t - (keyBottoms - screenTop) / u, `${size} sisa kanan`).toBeGreaterThanOrEqual(14);
    for (const step of await page.locator(".ss-howto-step > span:last-child").all()) expect(await lines(step)).toBe(2);
    expect(await Promise.all((await page.locator(".ss-howto-keys dd").all()).map(lines))).toEqual([1, 1, 2, 1, 1, 1, 1, 1, 1]);
    const close = await box(page.locator(".ss-howto-foot button"));
    near(close.t, HOWTO_CLOSE[size].rows[0], `${size} Tutup atas`);
    near(close.b, HOWTO_CLOSE[size].rows[1], `${size} Tutup bawah`);
    near(close.l, HOWTO_CLOSE[size].cols[0], `${size} Tutup kiri`);
    near(close.r, HOWTO_CLOSE[size].cols[1], `${size} Tutup kanan`);
    expect(await overflowing(page, ".ss-howto")).toEqual([]);
    await expectContrast(page, ".ss-howto", `${size} cara bermain`);
    if (size !== "1366x768") await shot(page, `cara_bermain_${size}.png`);
    // Pintasan tidak berlaku; Tab beredar antara judul dan "Tutup".
    for (const key of ["1", "a", "m", "p", "0", "Space", "Enter"]) await page.keyboard.press(key);
    await expect(sheet).toBeVisible();
    await expect(page.locator("#ss-howto-title")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator(".ss-howto-foot button")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("#ss-howto-title")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator(".ss-howto-foot button")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(sheet).toHaveCount(0);
    await expect(howTo).toBeFocused();
    await expect(howTo).not.toHaveAttribute("aria-disabled", /.*/);
    await howTo.click();
    await page.keyboard.press("Escape");
    await expect(page.locator(".ss-howto")).toHaveCount(0);
    await expect(howTo).toBeFocused();
    expectClean(log);
  });
}

/* ---------------- AC-6: pengaturan kelas ---------------- */

for (const size of SIZES) {
  test(`pengaturan kelas di ${size}: pilihan bawaan, daftar tim, letak, dan urutan Tab (AC-6)`, async ({ page }) => {
    const log = watch(page);
    await openTitle(page, { size });
    await expect(titleStart(page)).not.toHaveAttribute("aria-disabled", /.*/);
    await page.keyboard.press("Enter");
    await expect(page.locator(".ss-setup-title")).toBeFocused();
    await expect(page.getByRole("main")).toHaveAccessibleName("Pengaturan kelas");
    await expect(page.locator(".ss-option[aria-pressed='true']")).toHaveText(["3 tim", "60 detik", "Nyala"]);
    await expect(page.locator(".ss-option[aria-pressed='false']")).toHaveText(["2 tim", "4 tim", "30 detik", "90 detik", "Mati"]);
    await expect(page.locator(".ss-setup-label")).toHaveText(["Jumlah tim", "Durasi diskusi", "Suara"]);
    for (const name of ["Jumlah tim", "Durasi diskusi", "Suara"]) await expect(page.getByRole("group", { name })).toBeVisible();
    await expect(page.getByRole("group", { name: "Suara" })).toHaveAccessibleDescription("Bunyi klik dan bunyi teks.");
    await expect(page.locator(".ss-setup-foot button")).toHaveText(["Kembali", "Mulai permainan"]);
    // Urutan Tab.
    const order = ["2 tim", "3 tim", "4 tim", "30 detik", "60 detik", "90 detik", "Nyala", "Mati", "Kembali", "Mulai permainan"];
    for (const name of order) {
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toHaveText(name);
    }
    near(await fontU(page.locator(".ss-setup-title")), 2.8, `${size} ukuran judul pengaturan kelas`, 0.05);
    await expect(page.getByRole("button", { name: "Mulai permainan", exact: true })).not.toHaveAttribute("aria-disabled", /.*/);
    for (const teams of [2, 3, 4] as const) {
      await page.getByRole("button", { name: `${teams} tim`, exact: true }).click();
      const items = page.locator(".ss-setup-team");
      expect(await items.evaluateAll((all) => all.map((el) => el.getAttribute("data-team")))).toEqual(IDS.slice(0, teams));
      await expect(page.locator(".ss-setup-team-name")).toHaveText(NAMES.slice(0, teams));
      await expect(page.locator(".ss-setup-turns")).toHaveText(TURNS[teams]);
      await expect(page.locator(".ss-setup-team .ss-sr")).toHaveText(SENTENCES[teams]);
      await expect(page.getByRole("list", { name: "Tim yang bermain" })).toBeVisible();
      const foot = await box(page.locator(".ss-setup-foot"));
      const last = await box(page.locator(".ss-setup-row").last());
      near(foot.t - last.b, teams === 2 ? SETUP[size].spare2 : SETUP[size].spare34, `${size} sisa ${teams} tim`);
      expect(await overflowing(page, ".ss-setup")).toEqual([]);
      if ((teams === 4 && size !== "1366x768") || (teams === 2 && size === "1280x720")) await shot(page, `pengaturan_kelas_${teams}tim_${size}.png`);
    }
    for (const [selector, size_] of [[".ss-setup-label", 3.1], [".ss-option", 3.1], [".ss-setup-team-name", 3.1], [".ss-setup-turns", 2.5], [".ss-setup-note", 2.5]] as const) {
      near(await fontU(page.locator(selector).first()), size_, `${size} ukuran ${selector}`, 0.05);
    }
    const back = await box(page.locator(".ss-setup-foot button").first());
    const start = await box(page.locator(".ss-setup-foot button").last());
    near(back.l, SETUP[size].back[0], `${size} Kembali kiri`);
    near(back.r, SETUP[size].back[1], `${size} Kembali kanan`);
    near(start.l, SETUP[size].start[0], `${size} Mulai permainan kiri`);
    near(start.r, SETUP[size].start[1], `${size} Mulai permainan kanan`);
    near(start.t, SETUP[size].rows[0], `${size} kaki atas`);
    near(start.b, SETUP[size].rows[1], `${size} kaki bawah`);
    await expectContrast(page, ".ss-setup", `${size} pengaturan kelas`);
    expectClean(log);
  });
}

/* ---------------- AC-7, AC-8: pilihan, pengumuman, dan "Kembali" ---------------- */

test("pilihan, pengumuman jumlah tim, pintasan tidak aktif, dan Kembali tanpa membuang pilihan (AC-7, AC-8)", async ({ page }) => {
  const log = watch(page);
  await openTitle(page, { paused: true, recorder: true });
  await page.keyboard.press("x");
  await expect.poll(async () => (await soundRecord(page)).decoded).toBe(2);
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await expect(page.locator(".ss-setup-title")).toBeFocused();
  await page.clock.runFor(600);
  let clicks = await clickCount(page);
  await page.getByRole("button", { name: "4 tim", exact: true }).click();
  await expect(statusRegion(page)).toHaveText(ANNOUNCE[4]);
  expect(await clickCount(page)).toBe(clicks + 1);
  await page.getByRole("button", { name: "30 detik", exact: true }).click();
  await expect(statusRegion(page)).toHaveText(ANNOUNCE[4]);
  expect(await clickCount(page)).toBe(clicks + 2);
  clicks = await clickCount(page);
  await page.getByRole("button", { name: "4 tim", exact: true }).click();
  await page.getByRole("button", { name: "30 detik", exact: true }).click();
  expect(await clickCount(page)).toBe(clicks);
  await page.getByRole("button", { name: "2 tim", exact: true }).click();
  await expect(statusRegion(page)).toHaveText(ANNOUNCE[2]);
  await page.getByRole("button", { name: "3 tim", exact: true }).click();
  await expect(statusRegion(page)).toHaveText(ANNOUNCE[3]);
  await page.getByRole("button", { name: "4 tim", exact: true }).click();
  await expect(statusRegion(page)).toHaveText(ANNOUNCE[4]);
  // Esc, M, angka, dan huruf tidak berpengaruh dan tidak berbunyi.
  await page.locator(".ss-setup-title").focus();
  clicks = await clickCount(page);
  for (const key of ["Escape", "m", "1", "2", "a", "p", "t", "s", "0", "ArrowRight", "Space", "Enter"]) await page.keyboard.press(key);
  await expect(page.locator(".ss-setup")).toBeVisible();
  await expect(page.locator(".ss-option[aria-pressed='true']")).toHaveText(["4 tim", "30 detik", "Nyala"]);
  expect(await clickCount(page)).toBe(clicks);
  // "Kembali" lalu "Mulai": pilihan terakhir tetap.
  await page.getByRole("button", { name: "Kembali", exact: true }).click();
  await expect(titleStart(page)).toBeFocused();
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await expect(page.locator(".ss-option[aria-pressed='true']")).toHaveText(["4 tim", "30 detik", "Nyala"]);
  await page.clock.runFor(600);
  await page.getByRole("button", { name: "Mulai permainan", exact: true }).click();
  await expect(page.locator(".ss-play[data-prolog]")).toBeVisible();
  await expect(statusRegion(page)).toHaveText("");
  await expect(page.locator(".ss-team")).toHaveCount(4);
  for (let i = 0; i < 3; i++) {
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
  }
  await page.clock.runFor(400);
  await toQuestion(page);
  await expect(timerValue(page)).toHaveText("0:30");
  expectClean(log);
});

/* ---------------- AC-9: Mulai permainan ---------------- */

test("Mulai permainan: tim berurutan dan durasi untuk ketiga jumlah tim dan ketiga durasi (AC-9)", async ({ page }) => {
  const log = watch(page);
  const spoken: Record<30 | 60 | 90, [string, string, string]> = {
    30: ["0:30", "Sisa 30 detik", "Waktu diskusi 30 detik dimulai."],
    60: ["1:00", "Sisa 1 menit", "Waktu diskusi 1 menit dimulai."],
    90: ["1:30", "Sisa 1 menit 30 detik", "Waktu diskusi 1 menit 30 detik dimulai."],
  };
  let first = true;
  for (const teams of [2, 3, 4] as const) {
    for (const seconds of [30, 60, 90] as const) {
      if (first) await openTitle(page);
      else {
        await page.goto("sehari-setara/");
        await page.evaluate(() => document.fonts.ready);
      }
      first = false;
      await startGame(page, { teams, seconds });
      const note = `${teams} tim, ${seconds} detik`;
      expect(await page.locator(".ss-team").evaluateAll((all) => all.map((el) => el.getAttribute("data-team"))), note).toEqual(IDS.slice(0, teams));
      await expect(page.locator(".ss-team-count"), note).toHaveText(Array.from({ length: teams }, () => "0"));
      await expect(page.locator(".ss-team[data-giliran]"), note).toHaveAttribute("data-team", "mangga");
      await expect(page.locator(".ss-team[data-giliran] .ss-team-turn"), note).toHaveText("Giliran");
      await toQuestion(page);
      await expect(timerValue(page), note).toHaveText(spoken[seconds][0]);
      await expect(page.locator('[role="timer"] .ss-sr'), note).toHaveText(spoken[seconds][1]);
      await expect(statusRegion(page), note).toHaveText(spoken[seconds][2]);
    }
  }
  expectClean(log);
});

/* ---------------- AC-10: suara di pengaturan kelas ---------------- */

test("suara di pengaturan kelas: Mati tanpa bunyi sampai adegan 1, Nyala dengan satu klik (AC-10)", async ({ page }) => {
  const log = watch(page);
  await openTitle(page, { paused: true, recorder: true });
  await page.keyboard.press("x");
  await expect.poll(async () => (await soundRecord(page)).decoded).toBe(2);
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await expect(page.locator(".ss-setup")).toBeVisible();
  await page.clock.runFor(600);
  await page.keyboard.press("m");
  await expect(page.locator(".ss-option[aria-pressed='true']").last()).toHaveText("Nyala");
  const before = await soundRecord(page);
  await page.getByRole("button", { name: "Mati", exact: true }).click();
  await page.getByRole("button", { name: "Mulai permainan", exact: true }).click();
  for (let i = 0; i < 3; i++) {
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
  }
  await page.clock.runFor(400);
  await toQuestion(page);
  await page.keyboard.press("B");
  expect(await soundRecord(page)).toEqual(before);

  await page.goto("sehari-setara/");
  await page.evaluate(() => document.fonts.ready);
  await page.keyboard.press("x");
  await expect.poll(async () => (await soundRecord(page)).decoded).toBe(2);
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await page.clock.runFor(600);
  await page.getByRole("button", { name: "Mati", exact: true }).click();
  const off = await clickCount(page);
  await page.getByRole("button", { name: "Nyala", exact: true }).click();
  expect(await clickCount(page)).toBe(off + 1);
  await page.getByRole("button", { name: "Mulai permainan", exact: true }).click();
  expect(await clickCount(page)).toBe(off + 2);
  expectClean(log);
});

/* ---------------- AC-11: prolog ---------------- */

for (const size of SIZES) {
  test(`prolog di ${size}: bilah atas, panggung, panel, teks, letak, dan pintasan (AC-11)`, async ({ page }) => {
    const log = watch(page);
    await openTitle(page, { size, reduce: false, paused: true, recorder: true });
    await page.keyboard.press("x");
    await expect.poll(async () => (await soundRecord(page)).decoded).toBe(2);
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
    await page.clock.runFor(600);
    await page.getByRole("button", { name: "2 tim", exact: true }).click();
    await page.getByRole("button", { name: "Mulai permainan", exact: true }).click();
    const bar = page.locator(".ss-topbar");
    await expect(bar).toHaveCSS("background-color", "rgb(255, 217, 168)");
    await expect(page.locator(".ss-topbar-counter")).toHaveText("Prolog");
    await expect(bar).toHaveAttribute("aria-label", "Pukul 06.15, prolog");
    await expect(page.getByRole("main")).toHaveAccessibleName("Prolog");
    await expect(page.locator(".ss-narration-tab")).toHaveText("Prolog");
    await expect(page.locator(".ss-meter-value")).toHaveText(["50", "50"]);
    await expect(page.locator(".ss-team[data-giliran]")).toHaveAttribute("data-team", "mangga");
    await expect(page.locator(".ss-timer")).toHaveCount(0);
    await expect(page.locator(".ss-award-prompt")).toHaveCount(0);
    const poses = ["talk", "idle", "happy"];
    const s = PROLOG_BOX[size];
    for (const [i, screen] of PROLOG.entries()) {
      await expect(page.locator(".ss-narration-text")).toHaveText(screen.text);
      await expect(liveRegion(page)).toHaveText(screen.text);
      await expect(page.locator(".ss-stage-frame").first()).toHaveAttribute("aria-label", screen.altText);
      await expect(page.locator(".ss-stage-bg").first()).toHaveCSS("background-image", /bg_title/);
      await expect(page.locator(".ss-stage .ss-sprite")).toHaveCount(1);
      await expect(page.locator(".ss-stage .ss-sprite")).toHaveCSS("background-image", new RegExp(`char_nara_${poses[i]}`));
      const next = page.locator(".ss-narration .ss-next");
      await expect(next).toHaveText(i === 2 ? "Mulai adegan 1" : "Lanjut");
      await page.clock.runFor(600);
      // Teks per huruf 40 huruf per detik: 24 huruf sesudah 600 ms, dengan bunyi teks.
      const shown = await page.locator(".ss-narration-text").evaluate((el) => (el.textContent ?? "").length - (el.querySelector(".ss-narration-rest")?.textContent ?? "").length);
      expect(shown).toBe(24);
      if (i === 0) expect((await soundRecord(page)).blips).toBeGreaterThan(0);
      await page.keyboard.press("Space");
      await expect(page.locator(".ss-narration-rest")).toHaveText("");
      expect(await lines(page.locator(".ss-narration-text"))).toBe([2, 3, 3][i]);
      const text = await box(page.locator(".ss-narration-text"));
      const nb = await box(next);
      near(nb.t - text.b, i === 0 ? s.spare[0] : s.spare[1], `${size} sisa layar ${i + 1}`);
      near(nb.t, s.rows[0], `${size} tombol atas`);
      near(nb.b, s.rows[1], `${size} tombol bawah`);
      near(nb.l, i === 2 ? s.startLeft : s.next[0], `${size} tombol kiri`);
      near(nb.r, s.next[1], `${size} tombol kanan`);
      expect(await overflowing(page, ".ss-play-panel")).toEqual([]);
      if ((size === "1280x720") || (size === "1024x768" && i === 2) || (size === "1920x1080" && i === 0)) await shot(page, `prolog_${i + 1}_${size}.png`);
      if (i === 0) {
        await page.keyboard.press("m");
        await expect(statusRegion(page)).toHaveText("Suara dimatikan.");
        await page.keyboard.press("m");
        await expect(statusRegion(page)).toHaveText("Suara dinyalakan.");
      }
      await page.keyboard.press(i === 1 ? "Space" : "Enter");
    }
    expectClean(log);
  });
}

/* ---------------- AC-12: dari prolog ke adegan 1 ---------------- */

test("dari prolog ke adegan 1: sapuan pagi, atau pudar dengan kurangi gerak (AC-12)", async ({ page }) => {
  const log = watch(page);
  for (const reduce of [false, true]) {
    if (!reduce) await openTitle(page, { reduce, paused: true });
    else {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("sehari-setara/");
      await page.evaluate(() => document.fonts.ready);
    }
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
    await page.clock.runFor(600);
    await page.getByRole("button", { name: "Mulai permainan", exact: true }).click();
    for (let i = 0; i < 3; i++) {
      await expect(page.locator(".ss-narration-text")).toHaveText(PROLOG[i].text);
      await page.clock.runFor(600);
      if ((await page.locator(".ss-narration-rest").textContent()) !== "") await page.keyboard.press("Enter");
      if (i < 2) await page.keyboard.press("Enter");
    }
    await page.keyboard.press("Enter");
    if (!reduce) {
      await expect(page.locator('.ss-wipe[data-time="pagi"]')).toBeVisible();
      await page.clock.runFor(100);
      await expect(page.locator(".ss-stage-bg").first()).toHaveCSS("background-image", /bg_title/);
      await page.clock.runFor(200);
      await expect(page.locator(".ss-stage-bg").first()).not.toHaveCSS("background-image", /bg_title/);
      await page.clock.runFor(100);
    } else {
      await expect(page.locator(".ss-wipe")).toHaveCount(0);
      await expect(page.locator('.ss-stage-holder[data-fade="keluar"]')).toBeVisible();
      await page.clock.runFor(150);
    }
    await expect(page.locator(".ss-wipe")).toHaveCount(0);
    await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 1/6");
    await expect(page.locator(".ss-narration .ss-next")).toBeFocused();
    await expect(page.locator(".ss-narration-tab")).toHaveText(SCENES[0].title);
  }
  expectClean(log);
});

/* ---------------- AC-13: masa tunggu prolog dan tekanan ganda ---------------- */

test("prolog: masa tunggu 600 ms di setiap layar, klik ganda, dan Enter yang ditahan (AC-13)", async ({ page }) => {
  const log = watch(page);
  await openTitle(page, { reduce: false, paused: true });
  // Enter yang ditahan pada "Mulai" hanya membuka pengaturan kelas.
  await page.clock.runFor(600);
  await page.keyboard.down("Enter");
  await page.keyboard.down("Enter");
  await page.keyboard.down("Enter");
  await page.keyboard.up("Enter");
  await expect(page.locator(".ss-setup-title")).toBeFocused();
  await page.clock.runFor(600);
  // Klik ganda pada "Mulai permainan": prolog layar 1, teks tetap muncul per huruf.
  await page.getByRole("button", { name: "Mulai permainan", exact: true }).dblclick();
  await expect(page.locator(".ss-narration-text")).toHaveText(PROLOG[0].text);
  await expect(page.locator(".ss-narration-rest")).not.toHaveText("");
  const next = page.locator(".ss-narration .ss-next");
  for (let i = 0; i < 3; i++) {
    await page.clock.runFor(599);
    await expect(next).toHaveAttribute("aria-disabled", "true");
    const before = await page.locator(".ss-narration-rest").textContent();
    await next.click({ force: true });
    await page.locator(".ss-narration-text").click({ force: true });
    for (const key of ["Enter", "Space"]) await page.keyboard.press(key);
    await next.evaluate((el) => (el as HTMLElement).blur());
    for (const key of ["Enter", "Space"]) await page.keyboard.press(key);
    await expect(page.locator(".ss-narration-text")).toHaveText(PROLOG[i].text);
    expect(await page.locator(".ss-narration-rest").textContent()).toBe(before);
    await page.clock.runFor(1);
    await expect(next).not.toHaveAttribute("aria-disabled", /.*/);
    await next.focus();
    // Enter yang ditahan: setiap tekanan baru hanya memajukan satu langkah.
    await page.keyboard.down("Enter");
    await page.keyboard.down("Enter");
    await page.keyboard.up("Enter");
    await expect(page.locator(".ss-narration-rest")).toHaveText("");
    await expect(page.locator(".ss-narration-text")).toHaveText(PROLOG[i].text);
    if (i < 2) {
      await page.keyboard.press("Enter");
      await expect(page.locator(".ss-narration-text")).toHaveText(PROLOG[i + 1].text);
    }
  }
  expectClean(log);
});

/* ---------------- AC-14: dialog pengaturan, letak ---------------- */

for (const size of SIZES) {
  test(`dialog pengaturan di ${size}: tombol di bilah atas, letak dialog, dan catatan (AC-14)`, async ({ page }) => {
    const log = watch(page);
    await openTitle(page, { size, reduce: false, paused: true });
    await startGame(page, { teams: 2, paused: true });
    const s = SETTINGS[size];
    const counterGap = async (note: string) => {
      const button = await box(settingsButton(page));
      const counter = await box(page.locator(".ss-topbar-counter"));
      const arc = await box(page.locator(".ss-dayarc"));
      expect(counter.l - button.r, `${size} ${note}: celah ke tulisan kanan`).toBeGreaterThan(1.5);
      expect(button.l - arc.r, `${size} ${note}: celah ke busur`).toBeGreaterThan(60);
      return button;
    };
    const button = await counterGap("Adegan 1/6");
    near(button.l, s.button[0], `${size} Pengaturan kiri`);
    near(button.r, s.button[1], `${size} Pengaturan kanan`);
    near(button.t, s.button[2], `${size} Pengaturan atas`);
    near(button.b, s.button[3], `${size} Pengaturan bawah`);
    near(await fontU(settingsButton(page)), 2.5, `${size} huruf Pengaturan`, 0.05);
    await toQuestion(page);
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeVisible();
    const d = await box(dialog(page));
    near(d.w, s.size[0], `${size} lebar dialog`);
    near(d.h, s.size[1], `${size} tinggi dialog`);
    near(d.t, s.top, `${size} dialog atas`);
    near(100 - d.b, s.top, `${size} dialog bawah`);
    near((d.l + d.r) / 2, (await page.evaluate(() => { const r = (document.querySelector(".ss-screen") as HTMLElement).getBoundingClientRect(); return r.width / (r.height / 100) / 2; })), `${size} dialog di tengah`, 0.3);
    await expect(page.locator(".ss-settings-note")).toHaveText(["Berlaku mulai diskusi berikutnya."]);
    const close = await box(page.locator(".ss-settings-foot button"));
    near(close.l, s.close[0], `${size} Tutup kiri`);
    near(close.r, s.close[1], `${size} Tutup kanan`);
    near(close.t, s.close[2], `${size} Tutup atas`);
    near(close.b, s.close[3], `${size} Tutup bawah`);
    expect(await overflowing(page, ".ss-settings")).toEqual([]);
    await expectContrast(page, ".ss-settings", `${size} dialog`);
    if (size !== "1366x768") await shot(page, `dialog_pengaturan_${size}.png`);
    await page.keyboard.press("Escape");
    // Dengan kurangi gerak dari komputer: kedua catatan tambahan, setiap catatan satu baris.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.keyboard.press("Escape");
    await expect(page.locator(".ss-settings-note")).toHaveText([
      "Menyala karena komputer meminta gerak dikurangi.",
      "Teks langsung lengkap selama kurangi gerak menyala.",
      "Berlaku mulai diskusi berikutnya.",
    ]);
    for (const note of await page.locator(".ss-settings-note").all()) expect(await lines(note)).toBe(1);
    near((await box(dialog(page))).h, s.system, `${size} tinggi dialog dengan catatan`);
    expect(await overflowing(page, ".ss-settings")).toEqual([]);
    if (size === "1280x720") await shot(page, "dialog_pengaturan_kurangi_gerak_komputer_1280x720.png");
    expectClean(log);
  });
}

/* ---------------- AC-14, AC-15: fase, fokus kembali, dan lapisan bening ---------------- */

test("dialog pengaturan: fase yang membolehkan, fokus kembali, tombol nonaktif, dan lapisan bening (AC-14, AC-15)", async ({ page }) => {
  const log = watch(page);
  await openTitle(page, { paused: true });
  // Layar judul dan pengaturan kelas: tanpa tombol, dan Esc tidak berpengaruh.
  await expect(settingsButton(page)).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCount(0);
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await expect(settingsButton(page)).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCount(0);
  await page.clock.runFor(600);
  await page.getByRole("button", { name: "Mulai permainan", exact: true }).click();
  // Prolog: tombol membuka dialog; fokus kembali ke tombol.
  await expect(settingsButton(page)).not.toHaveAttribute("aria-disabled", /.*/);
  await settingsButton(page).click();
  await expect(page.getByRole("dialog", { name: "Pengaturan" })).toHaveAttribute("aria-modal", "true");
  await expect(page.locator("#ss-settings-title")).toBeFocused();
  await page.keyboard.press("Tab");
  const order: string[] = [];
  for (let i = 0; i < 11; i++) {
    order.push((await page.evaluate(() => document.activeElement?.textContent ?? "")).trim());
    await page.keyboard.press("Tab");
  }
  expect(order).toEqual(["Nyala", "Mati", "Nyala", "Mati", "Nyala", "Mati", "30 detik", "60 detik", "90 detik", "Tutup", "Nyala"]);
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator(":focus")).toHaveText("Tutup");
  await page.keyboard.press("Enter");
  await expect(dialog(page)).toHaveCount(0);
  await expect(settingsButton(page)).toBeFocused();
  // Esc dari tombol lanjut prolog: fokus kembali ke tombol itu.
  await page.locator(".ss-narration .ss-next").focus();
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".ss-narration .ss-next")).toBeFocused();
  // Esc saat fokus di body: fokus ke tombol "Pengaturan".
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(settingsButton(page)).toBeFocused();
  // Ke adegan 1.
  await page.locator(".ss-narration .ss-next").focus();
  for (let i = 0; i < 3; i++) {
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
  }
  await page.clock.runFor(400);
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 1/6");
  // Diskusi: klik di luar dialog tidak berpengaruh (J-2); klik ganda "Tutup" tidak memilih C (J-1).
  await toQuestion(page);
  const c = await page.locator(".ss-choice").nth(2).boundingBox();
  const jeda = await page.getByRole("button", { name: "Jeda", exact: true }).boundingBox();
  if (!c || !jeda) throw new Error("pilihan C atau Jeda tidak tampil");
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeVisible();
  await page.mouse.click(c.x + c.width - 4, c.y + c.height - 4);
  await page.mouse.click(jeda.x + jeda.width / 2, jeda.y + jeda.height / 2);
  await expect(dialog(page)).toBeVisible();
  await expect(page.locator('.ss-play[data-fase="discuss"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Jeda", exact: true })).toHaveAttribute("aria-pressed", "false");
  const close = page.locator(".ss-settings-foot button");
  const cb = await close.boundingBox();
  if (!cb) throw new Error("Tutup tidak tampil");
  await page.mouse.dblclick(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await expect(dialog(page)).toHaveCount(0);
  await expect(page.locator(".ss-settings-layer")).toHaveCount(1);
  await expect(page.locator('.ss-play[data-fase="discuss"]')).toBeVisible();
  await page.clock.runFor(599);
  await page.mouse.click(c.x + c.width / 2, c.y + c.height / 2);
  await expect(page.locator('.ss-play[data-fase="discuss"]')).toBeVisible();
  await page.clock.runFor(1);
  await expect(page.locator(".ss-settings-layer")).toHaveCount(0);
  await page.mouse.click(c.x + c.width / 2, c.y + c.height / 2);
  // Reaksi: tombol nonaktif dan Esc tidak berpengaruh.
  await expect(page.locator('.ss-play[data-fase="reaction"]')).toBeVisible();
  await expect(settingsButton(page)).toHaveAttribute("data-nonaktif", "");
  await expect(settingsButton(page)).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Escape");
  await settingsButton(page).click({ force: true });
  await expect(dialog(page)).toHaveCount(0);
  await page.clock.runFor(1200);
  // Kartu dampak: tombol nonaktif.
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await expect(settingsButton(page)).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCount(0);
  await shot(page, "pengaturan_nonaktif_kartu_1280x720.png");
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  // Fase bintang: Esc dari ajakan bintang, fokus kembali ke ajakan.
  await expect(awardPrompt(page)).toBeFocused();
  await expect(settingsButton(page)).not.toHaveAttribute("aria-disabled", /.*/);
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeVisible();
  for (const key of ["0", "1", "2"]) await page.keyboard.press(key);
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(awardPrompt(page)).toBeFocused();
  await page.clock.runFor(600);
  await page.keyboard.press("1");
  // Pergantian adegan: tombol nonaktif selama sapuan.
  await expect(settingsButton(page)).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCount(0);
  await page.clock.runFor(400);
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 2/6");
  await expect(settingsButton(page)).not.toHaveAttribute("aria-disabled", /.*/);
  expectClean(log);
});

/* ---------------- AC-16, AC-17: perubahan di dialog dan berhenti selama dialog ---------------- */

test("dialog pengaturan: perubahan langsung, durasi berikutnya, pengatur waktu dan teks per huruf berhenti (AC-16, AC-17)", async ({ page }) => {
  const log = watch(page);
  await openTitle(page, { reduce: false, paused: true, recorder: true });
  await page.keyboard.press("x");
  await expect.poll(async () => (await soundRecord(page)).decoded).toBe(2);
  await startGame(page, { teams: 2, seconds: 60, paused: true });
  // Teks per huruf berhenti selama dialog terbuka.
  await page.clock.runFor(300);
  const shown = () => page.locator(".ss-narration-text").evaluate((el) => (el.textContent ?? "").length - (el.querySelector(".ss-narration-rest")?.textContent ?? "").length);
  const atOpen = await shown();
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeVisible();
  const blips = (await soundRecord(page)).blips;
  await page.clock.runFor(5000);
  expect(await shown()).toBe(atOpen);
  expect((await soundRecord(page)).blips).toBe(blips);
  // Durasi 30 detik saat narasi: diskusi adegan ini mulai dari 0:30.
  let clicks = await clickCount(page);
  await dialogOption(page, "Durasi diskusi", "60 detik").click();
  expect(await clickCount(page)).toBe(clicks);
  await dialogOption(page, "Durasi diskusi", "30 detik").click();
  expect(await clickCount(page)).toBe(clicks + 1);
  // Teks per huruf Mati: layar yang tampil tetap per huruf, layar berikutnya langsung lengkap.
  await dialogOption(page, "Teks muncul per huruf", "Mati").click();
  await page.keyboard.press("Escape");
  await page.clock.runFor(300);
  expect(await shown()).toBeGreaterThan(atOpen);
  await expect(page.locator(".ss-narration-rest")).not.toHaveText("");
  await page.keyboard.press("Space");
  await page.keyboard.press("Space");
  await expect(page.locator(".ss-narration-rest")).toHaveText("");
  await toQuestion(page);
  await expect(timerValue(page)).toHaveText("0:30");
  // Pengatur waktu berhenti selama dialog terbuka.
  await page.clock.runFor(13_000);
  await expect(timerValue(page)).toHaveText("0:17");
  const status = await statusRegion(page).textContent();
  await page.keyboard.press("Escape");
  await page.clock.runFor(10_000);
  await expect(timerValue(page)).toHaveText("0:17");
  await expect(page.locator('[role="timer"] .ss-sr')).toHaveText("Sisa 17 detik");
  await expect(statusRegion(page)).toHaveText(status ?? "");
  await expect(page.getByRole("button", { name: "Jeda", exact: true })).toHaveAttribute("aria-pressed", "false");
  // Durasi 90 detik saat diskusi: diskusi ini tidak berubah; adegan berikutnya mulai dari 1:30.
  await dialogOption(page, "Durasi diskusi", "90 detik").click();
  // Kurangi gerak Nyala: animasi berhenti langsung.
  await dialogOption(page, "Kurangi gerak", "Nyala").click();
  await expect(page.locator(".ss-play")).toHaveAttribute("data-kurangi-gerak", "");
  expect(await page.locator(".ss-stage .ss-sprite, .ss-dayarc-icon").evaluateAll((all) => all.flatMap((el) => el.getAnimations()).length)).toBe(0);
  // Suara Mati lalu Nyala: tepat satu klik sebagai tanda.
  clicks = await clickCount(page);
  await dialogOption(page, "Suara", "Mati").click();
  expect(await clickCount(page)).toBe(clicks);
  await dialogOption(page, "Suara", "Nyala").click();
  expect(await clickCount(page)).toBe(clicks + 1);
  await expect(page.locator(".ss-settings-cell")).toHaveCount(4);
  await expect(page.locator(".ss-settings").getByText(/tim/i)).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.clock.runFor(999);
  await expect(timerValue(page)).toHaveText("0:17");
  await page.clock.runFor(1);
  await expect(timerValue(page)).toHaveText("0:16");
  // Pergantian adegan berikutnya memakai pudar, tanpa angka melayang dan pop bintang.
  await page.keyboard.press("B");
  await page.clock.runFor(1200);
  await expect(page.locator(".ss-meter-delta")).toHaveCount(0);
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  await page.keyboard.press("2");
  expect(await page.locator(".ss-team-star").evaluateAll((all) => all.flatMap((el) => el.getAnimations()).length)).toBe(0);
  await expect(page.locator(".ss-wipe")).toHaveCount(0);
  await page.clock.runFor(150);
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 2/6");
  await toQuestion(page);
  await expect(timerValue(page)).toHaveText("1:30");
  expectClean(log);
});

/* ---------------- AC-18: kurangi gerak dari komputer ---------------- */

test("kurangi gerak dari komputer: baris terkunci dengan catatan, tanpa bunyi (AC-18)", async ({ page }) => {
  const log = watch(page);
  await openTitle(page, { reduce: true, paused: true, recorder: true });
  await page.keyboard.press("x");
  await expect.poll(async () => (await soundRecord(page)).decoded).toBe(2);
  await startGame(page, { teams: 2, paused: true });
  await page.keyboard.press("Escape");
  const on = dialogOption(page, "Kurangi gerak", "Nyala");
  const off = dialogOption(page, "Kurangi gerak", "Mati");
  await expect(on).toHaveAttribute("aria-pressed", "true");
  for (const option of [on, off]) {
    await expect(option).toHaveAttribute("data-nonaktif", "");
    await expect(option).toHaveAttribute("aria-disabled", "true");
    await expect(option).toHaveCSS("background-color", "rgb(201, 212, 229)");
  }
  await expect(page.getByRole("group", { name: "Kurangi gerak" })).toHaveAccessibleDescription("Menyala karena komputer meminta gerak dikurangi.");
  await expect(page.getByRole("group", { name: "Teks muncul per huruf" })).toHaveAccessibleDescription("Teks langsung lengkap selama kurangi gerak menyala.");
  const clicks = await clickCount(page);
  await off.click({ force: true });
  await on.click({ force: true });
  expect(await clickCount(page)).toBe(clicks);
  await expect(on).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".ss-play")).not.toHaveAttribute("data-kurangi-gerak", /.*/);
  expectClean(log);
});

/* ---------------- AC-19, AC-23, AC-29: Main lagi, wilayah pengumuman, dan privasi ---------------- */

test("Main lagi ke layar judul dengan pengaturan sebelumnya; wilayah pengumuman tetap; tanpa isian dan penyimpanan (AC-19, AC-23, AC-29)", async ({ page }) => {
  const log = watch(page);
  const outside: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:4180/")) outside.push(request.url());
  });
  await openTitle(page, { reduce: false, paused: true, spy: true });
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('.ss-play [aria-live="polite"], .ss-play [role="status"]')) el.setAttribute("data-uji", "tetap");
  });
  const noInputs = async (note: string) => expect(await page.locator("input, textarea, select, [contenteditable]").count(), note).toBe(0);
  await noInputs("layar judul");
  await page.clock.runFor(600);
  await page.getByRole("button", { name: "Cara bermain", exact: true }).click();
  await noInputs("cara bermain");
  await page.keyboard.press("Escape");
  await page.clock.runFor(600);
  await titleStart(page).focus();
  await page.keyboard.press("Enter");
  await noInputs("pengaturan kelas");
  await page.clock.runFor(600);
  await page.getByRole("button", { name: "4 tim", exact: true }).click();
  await page.getByRole("button", { name: "Mulai permainan", exact: true }).click();
  await noInputs("prolog");
  for (let i = 0; i < 3; i++) {
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
  }
  await page.clock.runFor(400);
  // Dua langkah: tunggu narasi adegan 1 tampil dan berfokus sebelum Esc, agar fokus kembali ke tombol lanjutnya.
  await expect(page.locator(".ss-narration .ss-next")).toBeFocused();
  await page.keyboard.press("Escape");
  await noInputs("dialog pengaturan");
  await dialogOption(page, "Durasi diskusi", "90 detik").click();
  await dialogOption(page, "Kurangi gerak", "Nyala").click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("m");
  for (let i = 0; i < SCENES.length; i++) await playScene(page, "B");
  await expect(endingScreen(page)).toBeVisible();
  await expect(endingTitle(page)).toBeFocused();
  await expect(settingsButton(page)).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCount(0);
  await finishDay(page, true);
  await expect(reflectionTitle(page)).toBeFocused();
  await expect(settingsButton(page)).toHaveCount(0);
  await noInputs("refleksi");
  for (const region of [liveRegion(page), statusRegion(page)]) await expect(region).toHaveAttribute("data-uji", "tetap");
  // Klik ganda di tepi kanan "Main lagi", yang menumpuk dengan "Mulai": layar judul, "Mulai" tidak tertekan (AC-13).
  // Enter yang ditahan pada "Main lagi" diuji di akhir-rekap-refleksi.spec.ts (uji "keyboard").
  await page.clock.runFor(600);
  const again = await playAgainButton(page).boundingBox();
  if (!again) throw new Error("Main lagi tidak tampil");
  await page.mouse.dblclick(again.x + again.width - 2, again.y + again.height / 2);
  await expect(page.locator('.ss-play[data-fase="title"]')).toBeVisible();
  await expect(titleStart(page)).toBeFocused();
  await page.clock.runFor(600);
  await expect(page.locator('.ss-play[data-fase="title"]')).toBeVisible();
  await expect(statusRegion(page)).toHaveText("");
  await expect(page.locator(".ss-play")).toHaveAttribute("data-kurangi-gerak", "");
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  for (const region of [liveRegion(page), statusRegion(page)]) await expect(region).toHaveAttribute("data-uji", "tetap");
  await page.keyboard.press("Enter");
  await expect(page.locator(".ss-option[aria-pressed='true']")).toHaveText(["4 tim", "90 detik", "Mati"]);
  await page.clock.runFor(600);
  await page.getByRole("button", { name: "Mulai permainan", exact: true }).click();
  for (let i = 0; i < 3; i++) {
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
  }
  await page.clock.runFor(150);
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 1/6");
  await expect(page.locator(".ss-team-count")).toHaveText(["0", "0", "0", "0"]);
  await toQuestion(page);
  await expect(timerValue(page)).toHaveText("1:30");
  expect(await page.evaluate(() => (window as unknown as { ssUjiSimpan: string[] }).ssUjiSimpan)).toEqual([]);
  expect(outside).toEqual([]);
  expectClean(log);
});

/* ---------------- AC-20: permainan penuh dengan keyboard ---------------- */

const LATIN: Record<2 | 3 | 4, Array<[30 | 60 | 90, string, string]>> = {
  2: [[30, "BBBBBB", "Warga Setara"], [60, "BBBCCC", "Hampir Seimbang"], [90, "AAAAAA", "Hari yang Berat"]],
  3: [[30, "BBBCCC", "Hampir Seimbang"], [60, "AAAAAA", "Hari yang Berat"], [90, "BBBBBB", "Warga Setara"]],
  4: [[30, "AAAAAA", "Hari yang Berat"], [60, "BBBBBB", "Warga Setara"], [90, "BBBCCC", "Hampir Seimbang"]],
};

for (const teams of [2, 3, 4] as const) {
  test(`permainan penuh dengan keyboard, ${teams} tim: 30, 60, dan 90 detik lewat Main lagi (AC-20)`, async ({ page }) => {
    test.setTimeout(300_000);
    const log = watch(page);
    await openTitle(page, { reduce: true, paused: true });
    for (const [round, [seconds, path, ending]] of LATIN[teams].entries()) {
      if (round > 0) {
        await page.clock.runFor(600);
        await page.keyboard.press("Tab");
        await expect(playAgainButton(page)).toBeFocused();
        await page.keyboard.press("Enter");
      }
      await openByKeyboard(page, teams, seconds);
      for (let i = 0; i < SCENES.length; i++) {
        const note = `${teams} tim, ${seconds} detik, adegan ${i + 1}`;
        await expect(page.locator(".ss-topbar-counter"), note).toHaveText(`Adegan ${i + 1}/6`);
        await expect(page.locator(".ss-team[data-giliran]"), note).toHaveAttribute("data-team", IDS[i % teams]);
        const button = await box(settingsButton(page));
        const counter = await box(page.locator(".ss-topbar-counter"));
        expect(counter.l - button.r, `${note}: celah tombol Pengaturan`).toBeGreaterThan(1.5);
        await toQuestion(page);
        await expect(timerValue(page), note).toHaveText({ 30: "0:30", 60: "1:00", 90: "1:30" }[seconds]);
        await playScene(page, path[i] as "A" | "B" | "C", i === 1 ? seconds : 0);
      }
      await expect(endingTitle(page)).toHaveText(ending);
      const button = await box(settingsButton(page));
      const counter = await box(page.locator(".ss-topbar-counter"));
      expect(counter.l - button.r, "celah di layar akhir").toBeGreaterThan(1.5);
      await finishDay(page, true);
    }
    expectClean(log);
  });
}

/* ---------------- AC-21: keyboard di layar pembuka ---------------- */

test("pintasan tidak aktif di layar pembuka dan dialog, pengubah diabaikan, dan Esc yang ditahan (AC-21)", async ({ page }) => {
  const log = watch(page);
  await openTitle(page, { paused: true, recorder: true });
  await page.keyboard.press("x");
  await expect.poll(async () => (await soundRecord(page)).decoded).toBe(2);
  await page.clock.runFor(600);
  const keys = ["1", "2", "a", "p", "t", "s", "0", "m", "ArrowRight", "Escape", "Control+Enter", "Alt+Enter", "Meta+Enter"];
  const silent = async (note: string, expectVisible: string) => {
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    const clicks = await clickCount(page);
    for (const key of keys) await page.keyboard.press(key);
    for (const key of ["Space", "Enter"]) await page.keyboard.press(key);
    await expect(page.locator(expectVisible), note).toBeVisible();
    expect(await clickCount(page), note).toBe(clicks);
  };
  await silent("layar judul", '.ss-play[data-fase="title"]');
  await page.getByRole("button", { name: "Cara bermain", exact: true }).click();
  await page.locator("#ss-howto-title").focus();
  const before = await clickCount(page);
  for (const key of keys.filter((k) => k !== "Escape")) await page.keyboard.press(key);
  await expect(page.locator(".ss-howto")).toBeVisible();
  expect(await clickCount(page)).toBe(before);
  await page.keyboard.press("Escape");
  await page.clock.runFor(600);
  await titleStart(page).focus();
  await page.keyboard.press("Enter");
  await page.clock.runFor(600);
  await silent("pengaturan kelas", ".ss-setup");
  await expect(page.locator(".ss-option[aria-pressed='true']")).toHaveText(["3 tim", "60 detik", "Nyala"]);
  await page.getByRole("button", { name: "Mulai permainan", exact: true }).click();
  for (let i = 0; i < 3; i++) {
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
  }
  await page.clock.runFor(150);
  // Dialog pengaturan: pintasan tidak berlaku; Esc yang ditahan tidak membuka dan menutup berulang kali.
  await page.keyboard.down("Escape");
  await page.keyboard.down("Escape");
  await page.keyboard.down("Escape");
  await page.keyboard.up("Escape");
  await expect(dialog(page)).toBeVisible();
  await page.locator("#ss-settings-title").focus();
  const inDialog = await clickCount(page);
  for (const key of keys.filter((k) => k !== "Escape")) await page.keyboard.press(key);
  for (const key of ["Space", "Enter"]) await page.keyboard.press(key);
  await expect(dialog(page)).toBeVisible();
  await expect(page.locator('.ss-play[data-fase="intro"]')).toBeVisible();
  expect(await clickCount(page)).toBe(inDialog);
  await page.keyboard.press("Control+Escape");
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCount(0);
  expectClean(log);
});

/* ---------------- AC-22, AC-23: fokus terlihat dan pembaca layar ---------------- */

test("fokus terlihat di layar baru, nama main, grup, daftar, dan cuplikan ARIA (AC-22, AC-23)", async ({ page }) => {
  const log = watch(page);
  await openTitle(page, { paused: true });
  const focusLook = async (note: string) => {
    const look = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return { bg: getComputedStyle(el).backgroundColor, cursor: getComputedStyle(el, "::before").content, visible: getComputedStyle(el, "::before").visibility };
    });
    expect(look.cursor, note).toContain("▶");
    expect(look.visible, note).toBe("visible");
    return look;
  };
  await page.clock.runFor(600);
  for (const name of ["Mulai", "Cara bermain", "Kembali ke galeri"]) {
    await tabTo(page, name);
    expect((await focusLook(`judul ${name}`)).bg).toBe(SUN);
  }
  await titleStart(page).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".ss-setup-title")).toHaveCSS("outline-style", "solid");
  await expect(page.locator(".ss-setup-title")).toHaveCSS("outline-width", "2px");
  await page.clock.runFor(600);
  for (const name of ["2 tim", "3 tim", "60 detik", "Mati", "Kembali", "Mulai permainan"]) {
    await tabTo(page, name);
    expect((await focusLook(`pengaturan ${name}`)).bg).toBe(SUN);
  }
  await expect(page.locator(".ss-setup")).toMatchAriaSnapshot(`
    - group "Jumlah tim":
      - button "2 tim"
      - button "3 tim" [pressed]
      - button "4 tim"
    - list "Tim yang bermain":
      - listitem: Tim Mangga, giliran adegan 1 dan 4.
      - listitem: Tim Laut, giliran adegan 2 dan 5.
      - listitem: Tim Daun, giliran adegan 3 dan 6.
  `);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toHaveAccessibleName("Prolog");
  await page.clock.runFor(600);
  await tabTo(page, "Pengaturan");
  expect((await focusLook("tombol Pengaturan")).bg).toBe(SUN);
  await page.keyboard.press("Enter");
  await expect(page.locator("#ss-settings-title")).toHaveCSS("outline-width", "2px");
  for (const name of ["Suara", "Kurangi gerak", "Teks muncul per huruf", "Durasi diskusi"]) await expect(page.getByRole("group", { name })).toBeVisible();
  await expect(page.getByRole("group", { name: "Durasi diskusi" })).toHaveAccessibleDescription("Berlaku mulai diskusi berikutnya.");
  await page.keyboard.press("Tab");
  expect((await focusLook("pilihan dialog")).bg).toBe(SUN);
  await page.keyboard.press("Escape");
  expectClean(log);
});

/* ---------------- AC-24: bunyi klik ---------------- */

test("bunyi klik: satu untuk setiap tekanan yang diterima, nol untuk tekanan yang diabaikan (AC-24)", async ({ page }) => {
  const log = watch(page);
  await openTitle(page, { paused: true, recorder: true });
  await page.evaluate(() => {
    window.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest('a[href="../"]')) event.preventDefault();
    });
  });
  await page.keyboard.press("x");
  await expect.poll(async () => (await soundRecord(page)).decoded).toBe(2);
  let expected = 0;
  const expectClicks = async (note: string) => expect(await clickCount(page), note).toBe(expected);
  await page.clock.runFor(599);
  await page.keyboard.press("Enter");
  await expectClicks("Mulai selama masa tunggu");
  await page.clock.runFor(1);
  await page.getByRole("link", { name: "Kembali ke galeri" }).click();
  await expectClicks("Kembali ke galeri");
  await page.getByRole("button", { name: "Cara bermain", exact: true }).click();
  expected += 1;
  await expectClicks("Cara bermain");
  await page.locator(".ss-howto-foot button").click();
  expected += 1;
  await expectClicks("Tutup cara bermain");
  await page.clock.runFor(600);
  await titleStart(page).click();
  expected += 1;
  await expectClicks("Mulai");
  await page.clock.runFor(600);
  await page.getByRole("button", { name: "3 tim", exact: true }).click();
  await expectClicks("pilihan yang sudah aktif");
  await page.getByRole("button", { name: "2 tim", exact: true }).click();
  expected += 1;
  await expectClicks("2 tim");
  await page.getByRole("button", { name: "Kembali", exact: true }).click();
  expected += 1;
  await expectClicks("Kembali");
  await page.clock.runFor(600);
  await titleStart(page).click();
  expected += 1;
  await page.clock.runFor(600);
  await page.getByRole("button", { name: "Mulai permainan", exact: true }).click();
  expected += 1;
  await expectClicks("Mulai permainan");
  for (let i = 0; i < 3; i++) {
    await page.locator(".ss-narration .ss-next").click({ force: true });
    await expectClicks(`prolog ${i + 1} selama masa tunggu`);
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
    expected += 1;
    await expectClicks(`prolog ${i + 1}`);
  }
  await page.clock.runFor(400);
  await settingsButton(page).click();
  expected += 1;
  await expectClicks("Pengaturan");
  await dialogOption(page, "Durasi diskusi", "60 detik").click();
  await dialogOption(page, "Kurangi gerak", "Mati").click({ force: true });
  await expectClicks("pilihan aktif dan terkunci di dialog");
  await page.mouse.click(5, 5);
  await expectClicks("lapisan bening");
  await page.keyboard.press("Escape");
  expected += 1;
  await expectClicks("Esc menutup");
  await page.keyboard.press("Escape");
  expected += 1;
  await expectClicks("Esc membuka");
  await page.locator(".ss-settings-foot button").click();
  expected += 1;
  await expectClicks("Tutup dialog");
  expectClean(log);
});

/* ---------------- AC-25: mode warna paksa ---------------- */

test("mode warna paksa: sudut terpotong dimatikan, tulisan tetap (AC-25)", async ({ page }) => {
  const log = watch(page);
  await page.emulateMedia({ forcedColors: "active" });
  await openTitle(page);
  await expect(titleStart(page)).not.toHaveAttribute("aria-disabled", /.*/);
  await page.getByRole("button", { name: "Cara bermain", exact: true }).click();
  await expect(page.locator(".ss-key").first()).toHaveCSS("clip-path", "none");
  await expect(page.locator(".ss-key")).toHaveText(KEYS.map((k) => k[0]));
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Cara bermain", exact: true })).toBeFocused();
  await titleStart(page).focus();
  await startGame(page, { teams: 2 });
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCSS("clip-path", "none");
  await expect(page.locator(".ss-option").first()).toHaveCSS("clip-path", "none");
  await expect(page.locator(".ss-settings-label")).toHaveText(["Suara", "Kurangi gerak", "Teks muncul per huruf", "Durasi diskusi"]);
  expectClean(log);
});

/* ---------------- AC-29: pengatur waktu dan pendengar dibersihkan ---------------- */

function installTracker() {
  const timeouts = new Set<number>();
  const intervals = new Set<number>();
  const listeners: Record<string, number> = { keydown: 0, keyup: 0, pointerdown: 0, pointerup: 0 };
  (window as unknown as { ssPelacak: { timeouts: Set<number>; intervals: Set<number>; listeners: Record<string, number> } }).ssPelacak = { timeouts, intervals, listeners };
  const setT = window.setTimeout.bind(window);
  const clearT = window.clearTimeout.bind(window);
  const setI = window.setInterval.bind(window);
  const clearI = window.clearInterval.bind(window);
  window.setTimeout = ((handler: TimerHandler, ms?: number, ...rest: unknown[]) => {
    const id = setT(() => {
      timeouts.delete(id);
      if (typeof handler === "function") (handler as (...a: unknown[]) => void)(...rest);
    }, ms);
    timeouts.add(id);
    return id;
  }) as typeof window.setTimeout;
  window.clearTimeout = ((id?: number) => {
    if (id !== undefined) timeouts.delete(id);
    clearT(id);
  }) as typeof window.clearTimeout;
  window.setInterval = ((handler: TimerHandler, ms?: number, ...rest: unknown[]) => {
    const id = setI(handler, ms, ...rest);
    intervals.add(id);
    return id;
  }) as typeof window.setInterval;
  window.clearInterval = ((id?: number) => {
    if (id !== undefined) intervals.delete(id);
    clearI(id);
  }) as typeof window.clearInterval;
  const add = window.addEventListener.bind(window);
  const remove = window.removeEventListener.bind(window);
  window.addEventListener = ((type: string, ...rest: unknown[]) => {
    if (type in listeners) listeners[type] += 1;
    return (add as (...a: unknown[]) => void)(type, ...rest);
  }) as typeof window.addEventListener;
  window.removeEventListener = ((type: string, ...rest: unknown[]) => {
    if (type in listeners) listeners[type] -= 1;
    return (remove as (...a: unknown[]) => void)(type, ...rest);
  }) as typeof window.removeEventListener;
}

test("pengatur waktu dan pendengar dibersihkan sesudah berpindah ke pratinjau (AC-29)", async ({ page }) => {
  const log = watch(page);
  await page.addInitScript(installTracker);
  const leftovers = () =>
    page.evaluate(() => {
      const t = (window as unknown as { ssPelacak: { timeouts: Set<number>; intervals: Set<number>; listeners: Record<string, number> } }).ssPelacak;
      return { timeouts: t.timeouts.size, intervals: t.intervals.size, listeners: Object.values(t.listeners).reduce((a, b) => a + b, 0) };
    });
  const toPreview = async (note: string) => {
    await page.evaluate(() => {
      window.location.hash = "#adegan-1";
    });
    await expect(page.locator("#ss-preview-title"), note).toBeVisible();
    await page.waitForTimeout(50);
    expect(await leftovers(), note).toEqual({ timeouts: 0, intervals: 0, listeners: 0 });
    await page.evaluate(() => {
      window.location.hash = "";
    });
    await expect(page.locator('.ss-play[data-fase="title"]')).toBeVisible();
  };
  await openTitle(page);
  await toPreview("masa tunggu layar judul");
  await page.waitForTimeout(650);
  await page.keyboard.press("Enter");
  await expect(page.locator(".ss-setup")).toBeVisible();
  await toPreview("masa tunggu pengaturan kelas");
  await startGame(page, { teams: 2 });
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeVisible();
  await toPreview("dialog pengaturan terbuka");
  await startGame(page, { teams: 2 });
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(page.locator(".ss-settings-layer")).toHaveCount(1);
  await toPreview("lapisan bening");
  expectClean(log);
});
