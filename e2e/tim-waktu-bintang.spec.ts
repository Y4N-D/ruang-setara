// Uji ujung ke ujung papan tim, giliran, pengatur waktu, dan bintang alasan Sehari Setara (spesifikasi F-07, Rencana
// uji langkah 3 sampai 5 dan 7). Membuka hasil build di /ruang-setara/sehari-setara/#main, #main-3, dan #main-4.
// Jam uji dijeda sebelum halaman dimuat, sehingga teks per huruf, pengatur waktu, kartu, dan pergantian adegan hanya
// maju lewat page.clock.runFor, dalam dua langkah sesudah unsur tampil (catatan PLAN F-05, F-06, dan F-07).
// Disesuaikan di F-08: sesudah kartu dampak adegan 5, kuis peran dijawab sebelum bintang alasan (answerQuiz di toStars).
import { expect, test, type Page } from "@playwright/test";
import { SCENES } from "../app/sehari-setara/content/scenes";
import { DEFAULT_TEAMS } from "../app/sehari-setara/content/teams";
import type { ChoiceId } from "../app/sehari-setara/engine/types";
import { clockText, filledBlocks, teamSentence } from "../app/sehari-setara/ui/turn";
import {
  answerQuiz,
  awardPrompt,
  contrast,
  expectClean,
  giveStars,
  impactCard,
  INK,
  sceneNumber,
  SHOTS,
  statusRowButtons,
  SUN,
  VIEWPORTS,
  watch,
  type ViewportName,
} from "./bantuan";

type TeamCount = 2 | 3 | 4;
type StarCount = 0 | 1 | 2;

const T0 = new Date("2026-10-26T08:00:00+08:00").getTime();
const SKY_D = "rgb(58, 134, 217)";
const MANGO = "rgb(255, 159, 28)";
const MIST = "rgb(201, 212, 229)";
const DUSK = "rgb(58, 74, 107)";
const ROUTES: Record<TeamCount, string> = { 2: "#main", 3: "#main-3", 4: "#main-4" };
const IDS = DEFAULT_TEAMS.map((team) => team.id);
const NAMES = DEFAULT_TEAMS.map((team) => team.name);
const ROLES = ["Polisi", "Jaksa", "Advokat", "Hakim"];

const status = (page: Page) => page.locator('.ss-play [role="status"]');
const counter = (page: Page) => page.locator(".ss-topbar-counter");
const timer = (page: Page) => page.locator(".ss-timer");
const clock = (page: Page) => page.locator('.ss-timer-value > [aria-hidden="true"]');
const timerLabel = (page: Page) => page.locator(".ss-timer-text");
const counts = (page: Page) => page.locator(".ss-team-count");
const pauseButton = (page: Page) => page.getByRole("button", { name: "Jeda", exact: true });
const addButton = (page: Page) => page.getByRole("button", { name: "+30 detik", exact: true });
const skipButton = (page: Page) => page.getByRole("button", { name: "Lewati diskusi", exact: true });
const starButton = (page: Page, stars: StarCount) => page.getByRole("button", { name: `${stars} bintang`, exact: true });
const narrationNext = (page: Page) => page.locator(".ss-narration .ss-next");
const setHash = (page: Page, hash: string) =>
  page.evaluate((target) => {
    window.location.hash = target;
  }, hash);

/** Membuka layar permainan dengan jam uji yang dijeda sejak sebelum halaman dimuat. */
async function openPlay(page: Page, size: ViewportName = "1280x720", teams: TeamCount = 2, reduce = false) {
  const { width, height } = VIEWPORTS[size];
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: reduce ? "reduce" : "no-preference" });
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(T0 + 60_000);
  await page.goto(`sehari-setara/${ROUTES[teams]}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".ss-narration")).toBeVisible();
}

/** Spasi sampai pertanyaan tampil: teks per huruf ditampilkan sekaligus oleh Spasi pertama setiap layar. */
async function toQuestion(page: Page) {
  while ((await page.locator(".ss-question").count()) === 0) await page.keyboard.press("Space");
  await expect(page.locator(".ss-question")).toBeFocused();
}

/** Memilih, lalu memajukan jam sampai kartu dampak tampil dan masa tunggu 600 ms selesai. */
async function toCard(page: Page, choice: ChoiceId) {
  await page.keyboard.press(choice);
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await page.clock.runFor(600);
}

/** Dari pertanyaan sampai fase bintang: memilih, kartu dampak, Enter pada kartu, lalu kuis peran di adegan 5 (F-08). */
async function toStars(page: Page, choice: ChoiceId) {
  const quiz = SCENES[(await sceneNumber(page)) - 1].roleQuiz !== undefined;
  await toCard(page, choice);
  await page.keyboard.press("Enter");
  if (quiz) await answerQuiz(page, true);
  await expect(awardPrompt(page)).toBeFocused();
}

/** Satu adegan penuh dengan keyboard: narasi, pilihan, kartu, bintang, lalu pergantian adegan (400 ms). */
async function playScene(page: Page, choice: ChoiceId = "B", stars: StarCount = 1) {
  await toQuestion(page);
  await toStars(page, choice);
  await page.keyboard.press(String(stars));
  await page.clock.runFor(400);
}

/** Menunggu huruf dan semua gambar latar di layar termuat, tanpa requestAnimationFrame (aman dengan jam uji). */
async function waitImages(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const selector = ".ss-stage-bg, .ss-sprite, .ss-emote, .ss-meter-icon, .ss-impact-icon, .ss-team-icon, .ss-team-star, .ss-timer-icon";
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

/** Tanda giliran setiap baris papan: atribut, kursor ▶, tulisan "Giliran", dan bingkai. */
async function readTurns(page: Page) {
  return page.locator(".ss-team").evaluateAll((all) =>
    all.map((row) => ({
      turn: row.hasAttribute("data-giliran"),
      cursor: getComputedStyle(row, "::before").visibility,
      label: row.querySelector(".ss-team-turn")?.textContent ?? "",
      frame: getComputedStyle(row).boxShadow !== "none",
    })),
  );
}

async function expectTurn(page: Page, active: number, teams: number) {
  const expected = Array.from({ length: teams }, (_, index) =>
    index === active
      ? { turn: true, cursor: "visible", label: "Giliran", frame: true }
      : { turn: false, cursor: "hidden", label: "", frame: false },
  );
  await expect.poll(() => readTurns(page)).toEqual(expected);
}

/** Ukuran, huruf, warna, dan luapan panel kanan, dalam piksel layar dan satuan u. */
async function measureSide(page: Page) {
  return page.evaluate(() => {
    const screenElement = document.querySelector(".ss-screen") as HTMLElement;
    const screen = screenElement.getBoundingClientRect();
    const u = screen.height / 100;
    const frame = (document.querySelector(".ss-stage-frame") as HTMLElement).getBoundingClientRect();
    const side = document.querySelector(".ss-side") as HTMLElement;
    const s = side.getBoundingClientRect();
    const rect = (element: Element) => element.getBoundingClientRect();
    const parts = [...side.querySelectorAll("*")].filter((element) => !element.closest(".ss-sr"));
    const bgOf = (element: Element) => {
      for (let current: Element | null = element; current; current = current.parentElement) {
        const bg = getComputedStyle(current).backgroundColor;
        if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
      }
      return "rgb(255, 255, 255)";
    };
    // Banyak baris teks yang terlihat di dalam elemen, tanpa teks pembaca layar dan tanpa bagian yang dilewati.
    const lines = (element: Element, skip?: string) => {
      const tops = new Set<number>();
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        if (!parent || parent.closest(".ss-sr") || (skip && parent.closest(skip)) || !node.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const box of range.getClientRects()) if (box.width > 0) tops.add(Math.round(box.top));
      }
      return tops.size;
    };
    const texts: { what: string; lines: number; font: number; fg: string; bg: string }[] = [];
    const add = (what: string, element: Element | null, skip?: string) => {
      if (!element) return;
      texts.push({ what, lines: lines(element, skip), font: parseFloat(getComputedStyle(element).fontSize) / u, fg: getComputedStyle(element).color, bg: bgOf(element) });
    };
    const rows = [...side.querySelectorAll(".ss-team")].map((row) => {
      const id = row.getAttribute("data-team") ?? "";
      const icon = row.querySelector(".ss-team-icon") as HTMLElement;
      const name = row.querySelector(".ss-team-name") as HTMLElement;
      const star = row.querySelector(".ss-team-star") as HTMLElement;
      add(`nama ${id}`, name, ".ss-team-turn");
      add(`giliran ${id}`, row.querySelector(".ss-team-turn"));
      add(`angka ${id}`, row.querySelector(".ss-team-count"));
      return {
        id,
        left: rect(row).left,
        width: rect(row).width,
        height: rect(row).height / u,
        iconLeft: rect(icon).left,
        nameLeft: rect(name).left,
        starLeft: rect(star).left,
        icon: getComputedStyle(icon).backgroundImage,
        iconSize: [rect(icon).width, rect(icon).height],
        star: getComputedStyle(star).backgroundImage,
        starSize: [rect(star).width, rect(star).height],
        starPosition: getComputedStyle(star).backgroundPosition,
        nameOverflow: name.scrollWidth - name.clientWidth,
        hidden: [icon, name, row.querySelector(".ss-team-stars")].every((element) => element?.getAttribute("aria-hidden") === "true"),
      };
    });
    add("label waktu", side.querySelector(".ss-timer-text"));
    add("angka waktu", side.querySelector('.ss-timer-value > [aria-hidden="true"]'));
    side.querySelectorAll(".ss-panel-button").forEach((button) => add(`tombol ${button.textContent}`, button));
    add("ajakan", side.querySelector(".ss-award-prompt"));
    side.querySelectorAll(".ss-award-button").forEach((button) => add(`tombol bintang ${button.textContent}`, button));
    const bar = side.querySelector(".ss-timer-bar");
    const filled = side.querySelector('.ss-timer-block[data-isi="penuh"]');
    return {
      u,
      px: parseFloat(getComputedStyle(screenElement).getPropertyValue("--ss-px")),
      frameRight: frame.right - screen.left,
      side: {
        left: s.left - screen.left,
        top: s.top - screen.top,
        right: screen.right - s.right,
        height: s.height,
        overflow: [side.scrollWidth - side.clientWidth, side.scrollHeight - side.clientHeight],
        // Jarak terkecil (piksel) dari isi ke batas isi: 2u dari tepi kanan panel, dan tepi bawah panel.
        spareRight: Math.min(...parts.map((element) => s.right - 2 * u - rect(element).right)),
        spareBottom: Math.min(...parts.map((element) => s.bottom - rect(element).bottom)),
        lastBottom: (s.bottom - Math.max(...[...side.children].map((child) => rect(child).bottom))) / u,
      },
      children: [...side.children].map((child) => child.className),
      rows,
      texts,
      bar: bar ? { size: [rect(bar).width, rect(bar).height], bg: getComputedStyle(bar).backgroundColor } : null,
      blocks: [...side.querySelectorAll(".ss-timer-block")].map((block) => [rect(block).width, rect(block).height]),
      filled: filled ? getComputedStyle(filled).backgroundColor : null,
    };
  });
}

type SideMeasure = Awaited<ReturnType<typeof measureSide>>;

/** Ukuran huruf tabel spesifikasi (u); kunci terpanjang yang cocok dipakai. */
const FONTS: Record<string, number> = {
  nama: 3.1,
  giliran: 2.5,
  angka: 2.8,
  "label waktu": 2.5,
  "angka waktu": 2.8,
  tombol: 2.5,
  ajakan: 2.5,
  "tombol bintang": 2.8,
};

/** Letak panel, huruf, satu baris, kontras teks, dan luapan isi (AC-1, AC-9). */
function checkSide(m: SideMeasure, note: string, promptLines = 1) {
  const near = (actual: number, expected: number, what: string) => expect(Math.abs(actual - expected), `${note}: ${what}`).toBeLessThanOrEqual(1);
  near(m.side.left, m.frameRight, "kiri panel");
  near(m.side.top, 8 * m.u, "atas panel");
  near(m.side.right, 0, "kanan panel");
  near(m.side.height, 52 * m.u, "tinggi panel");
  expect(m.side.overflow, `${note}: luapan panel`).toEqual([0, 0]);
  expect(m.side.spareRight, `${note}: isi meluap ke samping`).toBeGreaterThanOrEqual(-1);
  expect(m.side.spareBottom, `${note}: isi meluap ke bawah`).toBeGreaterThanOrEqual(-1);
  for (const text of m.texts) {
    const kind = Object.keys(FONTS)
      .filter((key) => text.what.startsWith(key))
      .sort((a, b) => b.length - a.length)[0];
    expect(Math.abs(text.font - FONTS[kind]), `${note}: huruf ${text.what}`).toBeLessThanOrEqual(0.05);
    expect(text.lines, `${note}: baris ${text.what}`).toBe(kind === "ajakan" ? promptLines : 1);
    expect(contrast(text.fg, text.bg), `${note}: kontras ${text.what}`).toBeGreaterThanOrEqual(4.5);
  }
}

/** Baris papan: urutan, ikon bentuk dan bintang 16p, bingkai normal, nama tanpa luapan, dan perataan (AC-1, AC-2). */
function checkRows(m: SideMeasure, note: string, teams: number) {
  const px = m.px;
  expect(m.rows.map((row) => row.id), `${note}: urutan tim`).toEqual(IDS.slice(0, teams));
  for (const [index, row] of m.rows.entries()) {
    expect(row.icon, `${note}: ikon ${row.id}`).toContain(`ui_team_${DEFAULT_TEAMS[index].shape}-`);
    expect(row.iconSize, `${note}: ukuran ikon ${row.id}`).toEqual([16 * px, 16 * px]);
    expect(row.star, `${note}: ikon bintang ${row.id}`).toContain("ui_star-");
    expect(row.starSize, `${note}: ukuran bintang ${row.id}`).toEqual([16 * px, 16 * px]);
    expect(row.starPosition, `${note}: bingkai bintang ${row.id}`).toBe(`${-32 * px}px 0px`);
    expect(row.nameOverflow, `${note}: nama ${row.id} meluap`).toBeLessThanOrEqual(0);
    expect(row.hidden, `${note}: bagian terlihat ${row.id} tersembunyi dari pembaca layar`).toBe(true);
    for (const key of ["left", "width", "iconLeft", "nameLeft", "starLeft"] as const) {
      expect(Math.abs(row[key] - m.rows[0][key]), `${note}: ${key} ${row.id}`).toBeLessThanOrEqual(1);
    }
  }
}

/** Kartu dampak: panggung tersembunyi, tanpa pita di atas kartu, dan setiap baris papan tertutup kartu (AC-7). */
async function checkCardCover(page: Page, note: string) {
  const cover = await page.evaluate(() => {
    const screen = (document.querySelector(".ss-screen") as HTMLElement).getBoundingClientRect();
    const u = screen.height / 100;
    const frame = (document.querySelector(".ss-stage-frame") as HTMLElement).getBoundingClientRect();
    const card = (document.querySelector(".ss-impact") as HTMLElement).getBoundingClientRect();
    const area = document.querySelector(".ss-stage-area") as HTMLElement;
    const inside = (x: number, y: number, selector: string) => {
      const hit = document.elementFromPoint(x, y);
      return hit !== null && hit.closest(selector) !== null;
    };
    const stripTop = screen.top + 8 * u;
    return {
      visibility: getComputedStyle(area).visibility,
      gap: card.top - stripTop,
      // Titik di pita antara bilah atas dan atas kartu, di tengah bingkai panggung.
      strip: card.top > stripTop ? inside(frame.left + frame.width / 2, (stripTop + card.top) / 2, ".ss-stage-area") : false,
      rows: [...document.querySelectorAll(".ss-team")].map((row) => {
        const r = row.getBoundingClientRect();
        return inside(r.left + r.width / 2, r.top + r.height / 2, ".ss-impact");
      }),
    };
  });
  expect(cover.visibility, `${note}: panggung`).toBe("hidden");
  expect(cover.strip, `${note}: pita panggung terlihat`).toBe(false);
  expect(cover.rows.every(Boolean), `${note}: baris papan tertutup kartu`).toBe(true);
  return cover;
}

/** Ruang kosong di bawah isi panel bawah sampai batas isinya (tanpa jarak dalam bawah), dalam u (AC-10). */
async function bottomSpace(page: Page) {
  return page.evaluate(() => {
    const u = (document.querySelector(".ss-screen") as HTMLElement).getBoundingClientRect().height / 100;
    const panel = document.querySelector(".ss-play-panel") as HTMLElement;
    const bottom = Math.max(...[...panel.querySelectorAll("*")].map((element) => element.getBoundingClientRect().bottom));
    return (panel.getBoundingClientRect().bottom - parseFloat(getComputedStyle(panel).paddingBottom) - bottom) / u;
  });
}

// Empat ukuran: dua tim di adegan 1 sampai 5 dan empat tim di adegan 4 (giliran Tim Mentari).
for (const size of Object.keys(VIEWPORTS) as ViewportName[]) {
  test(`panel kanan di ${size}: papan, pengatur waktu, bintang, kontras, kartu, dan panel bawah (AC-1, AC-2, AC-7, AC-9, AC-10)`, async ({ page }) => {
    const log = watch(page);
    const { px } = VIEWPORTS[size];
    const shot = async (name: string) => {
      await waitImages(page);
      await page.screenshot({ path: `${SHOTS}/${name}` });
    };
    await openPlay(page, size, 2);

    // Narasi: papan dua tim, Tim Mangga bergiliran.
    let m = await measureSide(page);
    expect(m.children).toEqual(["ss-teams"]);
    checkSide(m, `${size} narasi`);
    checkRows(m, `${size} narasi`, 2);
    await expectTurn(page, 0, 2);
    await expect(counts(page)).toHaveText(["0", "0"]);

    // Diskusi: batang sky-d terhadap lintasan ink, lalu 0:42 untuk tangkapan layar.
    await toQuestion(page);
    m = await measureSide(page);
    expect(m.children).toEqual(["ss-teams", "ss-timer"]);
    checkSide(m, `${size} diskusi`);
    checkRows(m, `${size} diskusi`, 2);
    expect(m.bar?.size).toEqual([73 * px, 12 * px]);
    expect(m.blocks).toHaveLength(12);
    for (const block of m.blocks) expect(block).toEqual([5 * px, 10 * px]);
    expect([m.filled, m.bar?.bg]).toEqual([SKY_D, INK]);
    expect(contrast(SKY_D, INK)).toBeGreaterThanOrEqual(3);
    await page.clock.runFor(18_000);
    await expect(clock(page)).toHaveText("0:42");
    if (size !== "1366x768") await shot(`diskusi_2tim_${size}.png`);

    // Tombol berfokus dan "Jeda" ditekan: sun dengan cincin dalam 2p.
    for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
    await expect(pauseButton(page)).toBeFocused();
    const button = () =>
      pauseButton(page).evaluate((element) => ({
        bg: getComputedStyle(element).backgroundColor,
        fg: getComputedStyle(element).color,
        ring: getComputedStyle(element).boxShadow,
        cursor: getComputedStyle(element, "::before").visibility,
      }));
    const focused = await button();
    expect([focused.bg, focused.fg, focused.cursor]).toEqual([SUN, INK, "visible"]);
    await page.keyboard.press("p");
    const pressed = await button();
    expect([pressed.bg, pressed.fg, pressed.ring]).toEqual([SUN, INK, `${INK} 0px 0px 0px ${2 * px}px inset`]);
    checkSide(await measureSide(page), `${size} dijeda`);
    await page.keyboard.press("p");

    // Sepuluh detik terakhir: blok mango; habis: label berlatar mango, "Jeda" dan "Lewati" nonaktif.
    await page.clock.runFor(33_000);
    await expect(clock(page)).toHaveText("0:09");
    m = await measureSide(page);
    expect(m.filled).toBe(MANGO);
    expect(contrast(MANGO, INK)).toBeGreaterThanOrEqual(3);
    await page.keyboard.press("s");
    await expect(timerLabel(page)).toHaveText("Waktunya memilih");
    m = await measureSide(page);
    checkSide(m, `${size} habis`);
    expect(m.texts.find((text) => text.what === "label waktu")?.bg).toBe(MANGO);
    const disabled = await page.locator('.ss-panel-button[aria-disabled="true"]').evaluateAll((all) =>
      all.map((element) => [getComputedStyle(element).backgroundColor, getComputedStyle(element).color]),
    );
    expect(disabled).toEqual([[MIST, DUSK], [MIST, DUSK]]);

    // Angka terlebar 9:59 tetap muat; "+30" lalu nonaktif.
    await page.keyboard.press("t");
    await page.clock.runFor(1000);
    await expect(clock(page)).toHaveText("0:29");
    for (let i = 0; i < 19; i++) await page.keyboard.press("t");
    await expect(clock(page)).toHaveText("9:59");
    await expect(addButton(page)).toHaveAttribute("aria-disabled", "true");
    checkSide(await measureSide(page), `${size} 9:59`);

    // Reaksi: panel kanan hanya papan. Kartu: panggung tersembunyi dan papan tertutup kartu.
    await page.keyboard.press("2");
    await expect(page.locator(".ss-status")).toHaveText("Kelas memilih B.");
    expect((await measureSide(page)).children).toEqual(["ss-teams"]);
    const reactionPanel = await page.locator(".ss-play-panel").innerHTML();
    await page.clock.runFor(1200);
    await expect(page.locator("#ss-impact-title")).toBeFocused();
    await page.clock.runFor(600);
    const cover = await checkCardCover(page, `${size} kartu adegan 1`);
    console.log(`[ukur] ${size}: jarak bilah atas ke kartu ${(cover.gap / m.u).toFixed(2)}u`);
    if (size === "1024x768") await shot("kartu_tanpa_pita_1024x768.png");

    // Bintang: panggung terlihat lagi, panel bawah sama dengan fase reaksi, ajakan berfokus dengan garis 2 px ink.
    await page.keyboard.press("Enter");
    await expect(awardPrompt(page)).toBeFocused();
    expect(await page.locator(".ss-stage-area").evaluate((element) => getComputedStyle(element).visibility)).toBe("visible");
    expect(await page.locator(".ss-play-panel").innerHTML()).toBe(reactionPanel);
    await expect(statusRowButtons(page)).toHaveCount(0);
    const outline = await awardPrompt(page).evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset];
    });
    expect(outline).toEqual(["solid", "2px", INK, "4px"]);
    m = await measureSide(page);
    expect(m.children).toEqual(["ss-teams", "ss-award"]);
    const mangoLines = m.texts.find((text) => text.what === "ajakan")?.lines ?? 0;
    expect(mangoLines).toBeGreaterThanOrEqual(1);
    checkSide(m, `${size} bintang`, mangoLines);
    if (size === "1280x720") await shot("bintang_2tim_1280x720.png");
    await page.keyboard.press("2");
    await expect(counts(page)).toHaveText(["2", "0"]);
    expect((await measureSide(page)).children).toEqual(["ss-teams"]);
    await page.clock.runFor(400);

    // Panel bawah adegan 3 dan 5 (pilihan terpanjang): ruang kosong tetap ≥ 3,0u.
    await playScene(page, "A", 1);
    for (const sceneIndex of [2, 3, 4]) {
      await toQuestion(page);
      if (sceneIndex !== 3) {
        const space = await bottomSpace(page);
        console.log(`[ukur] ${size}: ruang kosong panel bawah adegan ${sceneIndex + 1} ${space.toFixed(2)}u`);
        expect(space, `${size}: ruang panel bawah adegan ${sceneIndex + 1}`).toBeGreaterThanOrEqual(3.0);
      }
      await toStars(page, "C");
      await page.keyboard.press("0");
      await page.clock.runFor(400);
    }

    // Empat tim: alamat baru memulai permainan baru; adegan 4 milik Tim Mentari.
    await setHash(page, "#main-4");
    await expect(counter(page)).toHaveText("Adegan 1/6");
    await expect(counts(page)).toHaveText(["0", "0", "0", "0"]);
    for (let i = 0; i < 3; i++) await playScene(page, "B", 1);
    await expect(counter(page)).toHaveText("Adegan 4/6");
    await expectTurn(page, 3, 4);
    await toQuestion(page);
    await page.clock.runFor(18_000);
    await expect(clock(page)).toHaveText("0:42");
    m = await measureSide(page);
    expect(m.children).toEqual(["ss-teams", "ss-timer"]);
    checkSide(m, `${size} empat tim diskusi`);
    checkRows(m, `${size} empat tim diskusi`, 4);
    console.log(
      `[ukur] ${size}: baris tim ${m.rows.map((row) => row.height.toFixed(2)).join(" / ")}u; sisa bawah empat tim diskusi ${m.side.lastBottom.toFixed(2)}u`,
    );
    if (size !== "1366x768") await shot(`diskusi_4tim_${size}.png`);
    await page.clock.runFor(13_000);
    for (let i = 0; i < 19; i++) await page.keyboard.press("t");
    await expect(clock(page)).toHaveText("9:59");
    checkSide(await measureSide(page), `${size} empat tim 9:59`);

    await toCard(page, "B");
    await checkCardCover(page, `${size} kartu empat tim`);
    await page.keyboard.press("Enter");
    await expect(awardPrompt(page)).toHaveText("Bintang alasan untuk Tim Mentari");
    m = await measureSide(page);
    // Ajakan untuk Tim Mentari dua baris, kecuali di 1366×768 (tabel ukuran spesifikasi).
    checkSide(m, `${size} empat tim bintang`, size === "1366x768" ? 1 : 2);
    console.log(`[ukur] ${size}: sisa bawah empat tim bintang ${m.side.lastBottom.toFixed(2)}u`);
    if (size === "1024x768") await shot("bintang_4tim_1024x768.png");
    await page.keyboard.press("1");
    await expect(counts(page)).toHaveText(["1", "1", "1", "1"]);

    // Layar kerangka dan pratinjau tidak menampilkan panel kanan.
    await page.goto("sehari-setara/");
    await expect(page.locator(".ss-placeholder")).toBeVisible();
    await expect(page.locator(".ss-side")).toHaveCount(0);
    await setHash(page, "#adegan-1");
    await expect(page.locator("#ss-preview-title")).toBeVisible();
    await expect(page.locator(".ss-side")).toHaveCount(0);
    expectClean(log);
  });
}

test("giliran dengan 2, 3, dan 4 tim di keenam adegan, dan jumlah bintang di papan (AC-2, AC-5)", async ({ page }) => {
  const log = watch(page);
  const plans: Array<{ teams: TeamCount; stars: StarCount[]; reduce: boolean }> = [
    { teams: 2, stars: [2, 1, 0, 2, 1, 0], reduce: false },
    { teams: 3, stars: [1, 2, 0, 2, 0, 1], reduce: true },
    { teams: 4, stars: [2, 0, 1, 2, 1, 2], reduce: false },
  ];
  await openPlay(page, "1280x720", 2);
  for (const plan of plans) {
    await page.emulateMedia({ reducedMotion: plan.reduce ? "reduce" : "no-preference" });
    if (plan.teams !== 2) await setHash(page, ROUTES[plan.teams]);
    await expect(counter(page)).toHaveText("Adegan 1/6");
    await expect(page.locator(".ss-team")).toHaveCount(plan.teams);
    const totals: number[] = Array.from({ length: plan.teams }, () => 0);
    for (let i = 0; i < SCENES.length; i++) {
      const active = i % plan.teams;
      const note = `${plan.teams} tim, adegan ${i + 1}`;
      await expectTurn(page, active, plan.teams);
      await expect(counts(page), note).toHaveText(totals.map(String));
      await toQuestion(page);
      await toStars(page, "B");
      await expect(awardPrompt(page)).toHaveText(`Bintang alasan untuk ${NAMES[active]}`);
      await expectTurn(page, active, plan.teams);
      // Jalur dua tim 2, 1, 0, 2, 1, 0: di fase bintang adegan 6 papan menunjukkan 3 dan 3.
      if (plan.teams === 2 && i === 5) await expect(counts(page)).toHaveText(["3", "3"]);
      await giveStars(page, plan.stars[i]);
      totals[active] += plan.stars[i];
      if (i === SCENES.length - 1) break;
      await expect(counts(page), `${note}: jumlah langsung bertambah`).toHaveText(totals.map(String));
      // ▶ pindah saat LANJUT dikirim: 200 ms dalam sapuan, 75 ms dalam pudar.
      const half = plan.reduce ? 75 : 200;
      await page.clock.runFor(half - 1);
      await expect(counter(page)).toHaveText(`Adegan ${i + 1}/6`);
      await expectTurn(page, active, plan.teams);
      await page.clock.runFor(1);
      await expect(counter(page)).toHaveText(`Adegan ${i + 2}/6`);
      await expectTurn(page, (i + 1) % plan.teams, plan.teams);
      await page.clock.runFor(half);
      await expect(narrationNext(page)).toBeFocused();
    }
    // Sesudah bintang adegan 6, layar akhir sementara langsung tampil tanpa panel kanan.
    await expect(page.locator(".ss-play-end h1")).toBeFocused();
    await expect(page.locator(".ss-wipe")).toHaveCount(0);
    await expect(page.locator(".ss-side")).toHaveCount(0);
  }
  expectClean(log);
});

test("pengatur waktu: hitung mundur, blok, warna, dan waktu habis (AC-3)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, "1280x720", 2);
  await expect(timer(page)).toHaveCount(0);
  await toQuestion(page);
  const filledColors = () =>
    page.locator('.ss-timer-block[data-isi="penuh"]').evaluateAll((all) => all.map((element) => getComputedStyle(element).backgroundColor));
  await expect(timerLabel(page)).toHaveText("Waktu diskusi");
  await expect(clock(page)).toHaveText("1:00");
  expect(await filledColors()).toEqual(Array.from({ length: 12 }, () => SKY_D));
  await page.clock.runFor(999);
  await expect(clock(page)).toHaveText("1:00");
  await page.clock.runFor(1);
  await expect(clock(page)).toHaveText("0:59");
  await page.clock.runFor(9000);
  await expect(clock(page)).toHaveText("0:50");

  // Setiap detik sampai habis: angka, banyak blok berisi, dan warnanya.
  for (let remaining = 49; remaining >= 0; remaining--) {
    await page.clock.runFor(1000);
    await expect(clock(page)).toHaveText(clockText(remaining));
    const colors = await filledColors();
    expect(colors, `sisa ${remaining}`).toEqual(Array.from({ length: filledBlocks(remaining, 60) }, () => (remaining <= 10 ? MANGO : SKY_D)));
    if (remaining > 0) await expect(timerLabel(page)).toHaveText("Waktu diskusi");
    if (remaining === 8) {
      await waitImages(page);
      await page.screenshot({ path: `${SHOTS}/waktu_10detik_1280x720.png` });
    }
  }

  // Habis: tetap di fase diskusi, tidak ada pilihan otomatis, dan pilihan tetap aktif.
  await expect(timerLabel(page)).toHaveText("Waktunya memilih");
  expect(await timerLabel(page).evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(MANGO);
  await expect(page.locator('.ss-timer-block[data-isi="penuh"]')).toHaveCount(0);
  await waitImages(page);
  await page.screenshot({ path: `${SHOTS}/waktu_habis_1280x720.png` });
  await page.clock.runFor(5000);
  await expect(clock(page)).toHaveText("0:00");
  await expect(page.locator(".ss-status")).toHaveCount(0);
  for (const id of ["A", "B", "C"]) await expect(page.locator(`.ss-choice[data-choice="${id}"]`)).toBeEnabled();
  await page.keyboard.press("1");
  await expect(page.locator(".ss-status")).toHaveText("Kelas memilih A.");
  await expect(timer(page)).toHaveCount(0);

  // Fase lain yang lama tidak memengaruhi adegan berikutnya: mulai lagi dari 1:00.
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await page.clock.runFor(30_000);
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  await expect(timer(page)).toHaveCount(0);
  await page.clock.runFor(20_000);
  await page.keyboard.press("1");
  await page.clock.runFor(400);
  await expect(counter(page)).toHaveText("Adegan 2/6");
  await toQuestion(page);
  await expect(clock(page)).toHaveText("1:00");
  await expect(timerLabel(page)).toHaveText("Waktu diskusi");
  expect(await filledColors()).toEqual(Array.from({ length: 12 }, () => SKY_D));
  await page.clock.runFor(1000);
  await expect(clock(page)).toHaveText("0:59");
  expectClean(log);
});

test("tombol dan pintasan pengatur waktu: jeda, +30, lewati, batas 9:29, dan urutan Tab (AC-4)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, "1280x720", 2);
  // P, T, dan S tidak berpengaruh di fase narasi.
  for (const key of ["p", "t", "s", "P", "T", "S"]) await page.keyboard.press(key);
  await expect(status(page)).toHaveText("");
  await toQuestion(page);
  await expect(clock(page)).toHaveText("1:00");
  await expect(pauseButton(page)).toHaveAttribute("aria-pressed", "false");
  await expect(status(page)).toHaveText("Waktu diskusi 1 menit dimulai.");

  // Urutan Tab: pertanyaan, A, B, C, Jeda, +30, Lewati.
  const order = [
    page.locator('.ss-choice[data-choice="A"]'),
    page.locator('.ss-choice[data-choice="B"]'),
    page.locator('.ss-choice[data-choice="C"]'),
    pauseButton(page),
    addButton(page),
    skipButton(page),
  ];
  for (const target of order) {
    await page.keyboard.press("Tab");
    await expect(target).toBeFocused();
  }
  await page.locator(".ss-question").focus();

  // Jeda dengan klik pada 700 ms: angka tetap 5 detik; sesudah berjalan lagi, berkurang tepat 1.000 ms kemudian.
  await page.clock.runFor(700);
  await pauseButton(page).click();
  await expect(pauseButton(page)).toHaveAttribute("aria-pressed", "true");
  await expect(timerLabel(page)).toHaveText("Waktu dijeda");
  await page.clock.runFor(5000);
  await expect(clock(page)).toHaveText("1:00");
  await waitImages(page);
  await page.screenshot({ path: `${SHOTS}/waktu_dijeda_1280x720.png` });
  await page.keyboard.press("p");
  await expect(pauseButton(page)).toHaveAttribute("aria-pressed", "false");
  await expect(timerLabel(page)).toHaveText("Waktu diskusi");
  await page.clock.runFor(999);
  await expect(clock(page)).toHaveText("1:00");
  await page.clock.runFor(1);
  await expect(clock(page)).toHaveText("0:59");
  await page.keyboard.press("P");
  await page.clock.runFor(3000);
  await expect(clock(page)).toHaveText("0:59");
  await expect(pauseButton(page)).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("P");
  await expect(pauseButton(page)).toHaveAttribute("aria-pressed", "false");

  // +30 lewat klik, t, dan T.
  await addButton(page).click();
  await expect(clock(page)).toHaveText("1:29");
  await page.keyboard.press("t");
  await expect(clock(page)).toHaveText("1:59");
  await page.keyboard.press("T");
  await expect(clock(page)).toHaveText("2:29");

  // Lewati dengan s: habis; P dan S tidak berpengaruh; +30 menjalankan waktu lagi.
  await page.keyboard.press("s");
  await expect(clock(page)).toHaveText("0:00");
  await expect(timerLabel(page)).toHaveText("Waktunya memilih");
  await expect(pauseButton(page)).toHaveAttribute("aria-disabled", "true");
  await expect(skipButton(page)).toHaveAttribute("aria-disabled", "true");
  await expect(addButton(page)).not.toHaveAttribute("aria-disabled", /.*/);
  await page.keyboard.press("p");
  await page.keyboard.press("S");
  await expect(timerLabel(page)).toHaveText("Waktunya memilih");
  await expect(status(page)).toHaveText("Diskusi dilewati. Waktunya memilih.");
  await page.keyboard.press("T");
  await expect(clock(page)).toHaveText("0:30");
  await page.clock.runFor(1000);
  await expect(clock(page)).toHaveText("0:29");

  // Lewati dengan Enter pada tombol berfokus: fokus tetap di tombol yang kini nonaktif, dan tekanan berikutnya diabaikan.
  await skipButton(page).focus();
  await page.keyboard.press("Enter");
  await expect(clock(page)).toHaveText("0:00");
  await expect(skipButton(page)).toBeFocused();
  await expect(skipButton(page)).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await pauseButton(page).click({ force: true });
  await skipButton(page).click({ force: true });
  await expect(timerLabel(page)).toHaveText("Waktunya memilih");
  await expect(pauseButton(page)).toHaveAttribute("aria-pressed", "false");

  // Batas: dari 0, +30 sebanyak 19 kali menjadi 9:30; sesudahnya +30 nonaktif dan T tidak berpengaruh.
  for (let i = 0; i < 19; i++) await page.keyboard.press("t");
  await expect(clock(page)).toHaveText("9:30");
  await expect(addButton(page)).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("T");
  await addButton(page).click({ force: true });
  await expect(clock(page)).toHaveText("9:30");

  // P, T, dan S tidak berpengaruh di fase reaksi, kartu, bintang, dan pergantian adegan.
  const last = await status(page).textContent();
  const tryKeys = async () => {
    for (const key of ["p", "t", "s"]) await page.keyboard.press(key);
    await expect(status(page)).toHaveText(last ?? "");
  };
  await page.keyboard.press("3");
  await expect(page.locator(".ss-status")).toHaveText("Kelas memilih C.");
  await tryKeys();
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await tryKeys();
  await page.clock.runFor(600);
  await tryKeys();
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  await tryKeys();
  await page.keyboard.press("1");
  await expect(status(page)).toHaveText("Tim Mangga mendapat 1 bintang. Jumlah bintangnya sekarang 1.");
  for (const key of ["p", "t", "s"]) await page.keyboard.press(key);
  await page.clock.runFor(400);
  await toQuestion(page);
  await expect(clock(page)).toHaveText("1:00");
  await expect(timerLabel(page)).toHaveText("Waktu diskusi");
  await expect(pauseButton(page)).toHaveAttribute("aria-pressed", "false");
  await page.clock.runFor(1000);
  await expect(clock(page)).toHaveText("0:59");
  expectClean(log);
});

test("bintang alasan: fokus, tombol, pintasan, dan tekanan ganda (AC-5)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, "1280x720", 2);
  // 0, 1, dan 2 tidak berpengaruh di fase narasi; 0 tidak memilih di fase diskusi.
  for (const key of ["0", "1", "2"]) await page.keyboard.press(key);
  await expect(page.locator(".ss-narration")).toBeVisible();
  await toQuestion(page);
  await page.keyboard.press("0");
  await expect(page.locator(".ss-status")).toHaveCount(0);
  await page.keyboard.press("2");
  await expect(page.locator(".ss-status")).toHaveText("Kelas memilih B.");
  const reactionPanel = await page.locator(".ss-play-panel").innerHTML();
  for (const key of ["0", "1", "2"]) await page.keyboard.press(key);
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  for (const key of ["0", "1", "2"]) await page.keyboard.press(key);
  await page.clock.runFor(600);
  for (const key of ["0", "1", "2"]) await page.keyboard.press(key);
  await expect(impactCard(page)).toBeVisible();
  await expect(counts(page)).toHaveText(["0", "0"]);

  // Fase bintang: ajakan berfokus, grup bernama ajakan, tombol 0, 1, 2, dan panel bawah seperti fase reaksi.
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  await expect(awardPrompt(page)).toHaveText("Bintang alasan untuk Tim Mangga");
  await expect(page.getByRole("group", { name: "Bintang alasan untuk Tim Mangga" })).toHaveCount(1);
  await expect(page.locator(".ss-award-button")).toHaveText(["0", "1", "2"]);
  for (const stars of [0, 1, 2] as const) await expect(starButton(page, stars)).toBeVisible();
  expect(await page.locator(".ss-play-panel").innerHTML()).toBe(reactionPanel);
  await expect(statusRowButtons(page)).toHaveCount(0);
  for (const stars of [0, 1, 2] as const) {
    await page.keyboard.press("Tab");
    await expect(starButton(page, stars)).toBeFocused();
  }

  // Spasi dan Enter saat ajakan berfokus, serta tekanan repeat, tidak memberi bintang.
  await awardPrompt(page).focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Enter");
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "2", repeat: true, bubbles: true }));
  });
  await expect(page.locator(".ss-award")).toBeVisible();
  await expect(counts(page)).toHaveText(["0", "0"]);

  // Dua tekanan cepat: bintang diberikan sekali, blok bintang hilang, dan sapuan dimulai.
  await page.keyboard.press("1");
  await page.keyboard.press("1");
  await expect(counts(page)).toHaveText(["1", "0"]);
  await expect(page.locator(".ss-award")).toHaveCount(0);
  await expect(page.locator(".ss-wipe")).toHaveCount(1);
  for (const key of ["0", "1", "2"]) await page.keyboard.press(key);
  await page.clock.runFor(400);
  await expect(counter(page)).toHaveText("Adegan 2/6");
  await expect(counts(page)).toHaveText(["1", "0"]);

  // Adegan 2: Enter pada tombol "2" yang berfokus memberi 2 bintang kepada Tim Laut.
  await toQuestion(page);
  await toStars(page, "A");
  await expect(awardPrompt(page)).toHaveText("Bintang alasan untuk Tim Laut");
  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
  await expect(starButton(page, 2)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(counts(page)).toHaveText(["1", "2"]);
  await page.clock.runFor(400);

  // Adegan 3: klik ganda pada tombol "2" hanya memberi 2 bintang.
  await toQuestion(page);
  await toStars(page, "C");
  await starButton(page, 2).dblclick();
  await expect(counts(page)).toHaveText(["3", "2"]);
  await page.clock.runFor(400);
  await expect(counts(page)).toHaveText(["3", "2"]);

  // Adegan 4: klik "0".
  await toQuestion(page);
  await toStars(page, "B");
  await starButton(page, 0).click();
  await expect(page.locator(".ss-award")).toHaveCount(0);
  await expect(page.locator(".ss-wipe")).toHaveCount(1);
  await expect(counts(page)).toHaveText(["3", "2"]);
  await page.clock.runFor(400);

  // Adegan 5: kuis peran tampil sesudah kartu dan dijawab (F-08, lewat toStars); di fase bintang kuis sudah ditutup.
  await toQuestion(page);
  await toStars(page, "B");
  for (const role of ROLES) await expect(page.getByText(role, { exact: true })).toHaveCount(0);
  await page.keyboard.press("1");
  await expect(counts(page)).toHaveText(["4", "2"]);
  await page.clock.runFor(400);

  // Adegan 6: layar akhir sementara langsung tampil, tanpa sapuan, dengan fokus di judulnya.
  await toQuestion(page);
  await toStars(page, "B");
  await page.keyboard.press("2");
  await expect(page.locator(".ss-play-end h1")).toBeFocused();
  await expect(page.locator(".ss-wipe")).toHaveCount(0);
  expectClean(log);
});

test("pop bintang: tiga bingkai 80 ms, tanpa pop untuk 0, dan kurangi gerak (AC-6)", async ({ page }) => {
  const log = watch(page);
  const { px } = VIEWPORTS["1280x720"];
  await openPlay(page, "1280x720", 2);
  const star = (id: string) => page.locator(`.ss-team[data-team="${id}"] .ss-team-star`);
  const animations = (id: string) => star(id).evaluate((element) => element.getAnimations().length);
  const animationName = (id: string) => star(id).evaluate((element) => getComputedStyle(element).animationName);
  const frameAt = (id: string, time: number) =>
    star(id).evaluate((element, ms) => {
      for (const animation of element.getAnimations()) {
        animation.pause();
        animation.currentTime = ms;
      }
      return getComputedStyle(element).backgroundPositionX;
    }, time);

  // Adegan 1: Tim Mangga mendapat 2 bintang; pop 240 ms steps(3), sekali, bersamaan dengan angka.
  // Animasi CSS tidak mengikuti jam uji, jadi pop dijeda begitu ikonnya dipasang, lalu diatur lewat Web Animations API.
  await toQuestion(page);
  await toStars(page, "B");
  await page.evaluate(() => {
    const observer = new MutationObserver(() => {
      const popping = document.querySelector(".ss-team-star[data-pop]");
      if (!popping) return;
      for (const animation of popping.getAnimations()) animation.pause();
      observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
  await giveStars(page, 2);
  await expect(counts(page)).toHaveText(["2", "0"]);
  const style = await star("mangga").evaluate((element) => {
    const s = getComputedStyle(element);
    return [s.animationName, s.animationDuration, s.animationTimingFunction, s.animationIterationCount];
  });
  expect(style).toEqual(["ss-star-pop", "0.24s", "steps(3)", "1"]);
  expect(await animations("mangga")).toBe(1);
  expect(await animations("laut")).toBe(0);
  expect(await frameAt("mangga", 0)).toBe("0px");
  expect(await frameAt("mangga", 160)).toBe(`${-32 * px}px`);
  expect(await frameAt("mangga", 80)).toBe(`${-16 * px}px`);
  // Tangkapan layar pada 80 ms: semua animasi (pop dan sapuan) diatur ke 80 ms.
  await waitImages(page);
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      animation.pause();
      animation.currentTime = 80;
    }
  });
  await page.screenshot({ path: `${SHOTS}/pop_80ms_1280x720.png` });
  // Sesudah 240 ms: bingkai normal.
  await star("mangga").evaluate((element) => {
    for (const animation of element.getAnimations()) animation.finish();
  });
  expect(await animations("mangga")).toBe(0);
  expect(await star("mangga").evaluate((element) => getComputedStyle(element).backgroundPositionX)).toBe(`${-32 * px}px`);
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) animation.play();
  });
  await page.clock.runFor(400);

  // Adegan 2: pop pindah ke Tim Laut.
  await toQuestion(page);
  await toStars(page, "B");
  await giveStars(page, 1);
  await expect(counts(page)).toHaveText(["2", "1"]);
  expect(await animationName("laut")).toBe("ss-star-pop");
  expect(await animationName("mangga")).toBe("none");
  await page.clock.runFor(400);

  // Adegan 3: bintang 0 tidak memainkan pop.
  await toQuestion(page);
  await toStars(page, "B");
  await giveStars(page, 0);
  await expect(page.locator(".ss-award")).toHaveCount(0);
  expect(await animationName("mangga")).toBe("none");
  expect(await animationName("laut")).toBe("none");
  expect(await animations("mangga")).toBe(0);
  await page.clock.runFor(400);

  // Adegan 4 dengan kurangi gerak: tanpa animasi, bingkai normal, angka langsung berubah.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await toQuestion(page);
  await toStars(page, "B");
  await giveStars(page, 2);
  await expect(counts(page)).toHaveText(["2", "3"]);
  for (const id of ["mangga", "laut"]) {
    expect(await animations(id)).toBe(0);
    expect(await star(id).evaluate((element) => [getComputedStyle(element).animationName, getComputedStyle(element).backgroundPositionX])).toEqual([
      "none",
      `${-32 * px}px`,
    ]);
  }
  expectClean(log);
});

test("pembaca layar: papan, pengatur waktu, bintang, dan pengumuman per peristiwa (AC-8)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, "1280x720", 2);
  // Perekam isi wilayah status: setiap perubahan isi dicatat, sehingga perubahan di detik lain ikut terlihat.
  await page.evaluate(() => {
    const region = document.querySelector('.ss-play [role="status"]') as HTMLElement;
    const seen: string[] = [];
    (window as unknown as { ssStatus: string[] }).ssStatus = seen;
    new MutationObserver(() => {
      const text = region.textContent ?? "";
      if (text !== seen[seen.length - 1]) seen.push(text);
    }).observe(region, { childList: true, characterData: true, subtree: true });
  });
  const statusLog = () => page.evaluate(() => (window as unknown as { ssStatus: string[] }).ssStatus);
  const live = page.locator('.ss-play [aria-live="polite"]');
  await expect(page.locator(".ss-play [aria-live]")).toHaveCount(1);
  await expect(live).toHaveText(SCENES[0].narration[0]);
  await expect(status(page)).not.toHaveAttribute("aria-live", /.*/);

  await expect(page.locator(".ss-side")).toMatchAriaSnapshot(`
    - list "Papan tim":
      - listitem: ${teamSentence("Tim Mangga", true, 0)}
      - listitem: ${teamSentence("Tim Laut", false, 0)}
  `);

  // Diskusi dimulai, lalu 15 detik pertama tanpa pengumuman lain.
  await toQuestion(page);
  await expect(status(page)).toHaveText("Waktu diskusi 1 menit dimulai.");
  await expect(page.locator(".ss-side")).toMatchAriaSnapshot(`
    - list "Papan tim":
      - listitem: Tim Mangga, giliran, 0 bintang.
      - listitem: Tim Laut, 0 bintang.
    - group "Pengatur waktu":
      - paragraph: Waktu diskusi
      - timer: Sisa 1 menit
      - button "Jeda"
      - button "+30 detik": "+30"
      - button "Lewati diskusi": Lewati
  `);
  await expect(page.locator(".ss-timer-bar")).toHaveAttribute("aria-hidden", "true");
  await expect(pauseButton(page)).toHaveAttribute("aria-pressed", "false");
  for (let i = 0; i < 15; i++) await page.clock.runFor(1000);
  await expect(clock(page)).toHaveText("0:45");
  await expect(page.getByRole("timer")).toHaveCount(1);
  await expect(page.locator(".ss-side")).toMatchAriaSnapshot(`
    - timer: Sisa 45 detik
  `);
  expect(await statusLog()).toEqual(["Waktu diskusi 1 menit dimulai."]);

  // Sepuluh detik terakhir: satu pengumuman saat masuk, satu saat habis.
  await page.clock.runFor(34_000);
  await expect(clock(page)).toHaveText("0:11");
  await page.clock.runFor(1000);
  await expect(status(page)).toHaveText("Sisa waktu 10 detik.");
  for (let i = 0; i < 9; i++) await page.clock.runFor(1000);
  await expect(clock(page)).toHaveText("0:01");
  await expect(status(page)).toHaveText("Sisa waktu 10 detik.");
  await page.clock.runFor(1000);
  await expect(status(page)).toHaveText("Waktunya memilih.");
  await expect(page.locator(".ss-side")).toMatchAriaSnapshot(`
    - group "Pengatur waktu":
      - paragraph: Waktunya memilih
      - timer: Waktu habis
      - button "Jeda" [disabled]
      - button "+30 detik": "+30"
      - button "Lewati diskusi" [disabled]: Lewati
  `);

  // Tambah, jeda, berjalan lagi, lewati, dan suara.
  await page.keyboard.press("t");
  await expect(status(page)).toHaveText("Waktu ditambah 30 detik. Sisa 30 detik.");
  await page.keyboard.press("p");
  await expect(status(page)).toHaveText("Waktu dijeda. Sisa 30 detik.");
  await expect(page.locator(".ss-side")).toMatchAriaSnapshot(`
    - group "Pengatur waktu":
      - paragraph: Waktu dijeda
      - timer: Sisa 30 detik
      - button "Jeda" [pressed]
  `);
  await page.keyboard.press("p");
  await expect(status(page)).toHaveText("Waktu berjalan lagi. Sisa 30 detik.");
  await page.keyboard.press("s");
  await expect(status(page)).toHaveText("Diskusi dilewati. Waktunya memilih.");
  await page.keyboard.press("m");
  await expect(status(page)).toHaveText("Suara dimatikan.");
  await page.keyboard.press("M");
  await expect(status(page)).toHaveText("Suara dinyalakan.");

  // Kartu dampak tetap diumumkan lewat wilayah aria-live lama; wilayah status tidak berubah.
  await page.keyboard.press("2");
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await expect(live).not.toHaveText("");
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  await expect(page.locator(".ss-side")).toMatchAriaSnapshot(`
    - group "Bintang alasan untuk Tim Mangga":
      - paragraph: Bintang alasan untuk Tim Mangga
      - button "0 bintang": "0"
      - button "1 bintang": "1"
      - button "2 bintang": "2"
  `);
  await page.keyboard.press("2");
  await expect(status(page)).toHaveText("Tim Mangga mendapat 2 bintang. Jumlah bintangnya sekarang 2.");
  await page.clock.runFor(400);
  await expect(live).toHaveText(SCENES[1].narration[0]);
  await expect(page.locator(".ss-side")).toMatchAriaSnapshot(`
    - list "Papan tim":
      - listitem: Tim Mangga, 2 bintang.
      - listitem: Tim Laut, giliran, 0 bintang.
  `);

  // Adegan 2: diskusi dimulai lagi; durasi di atas satu menit ditulis "1 menit 30 detik".
  await toQuestion(page);
  await expect(status(page)).toHaveText("Waktu diskusi 1 menit dimulai.");
  await page.keyboard.press("T");
  await expect(status(page)).toHaveText("Waktu ditambah 30 detik. Sisa 1 menit 30 detik.");
  expect(await statusLog()).toEqual([
    "Waktu diskusi 1 menit dimulai.",
    "Sisa waktu 10 detik.",
    "Waktunya memilih.",
    "Waktu ditambah 30 detik. Sisa 30 detik.",
    "Waktu dijeda. Sisa 30 detik.",
    "Waktu berjalan lagi. Sisa 30 detik.",
    "Diskusi dilewati. Waktunya memilih.",
    "Suara dimatikan.",
    "Suara dinyalakan.",
    "Tim Mangga mendapat 2 bintang. Jumlah bintangnya sekarang 2.",
    "Waktu diskusi 1 menit dimulai.",
    "Waktu ditambah 30 detik. Sisa 1 menit 30 detik.",
  ]);
  await expect(page.locator(".ss-play [aria-live]")).toHaveCount(1);
  expectClean(log);
});

test("alamat uji tiga dan empat tim, dan kembali ke layar kerangka (AC-11)", async ({ page }) => {
  const log = watch(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(T0 + 60_000);
  await page.goto("sehari-setara/");
  await page.evaluate(() => document.fonts.ready);
  const links = page.locator(".ss-placeholder-actions a");
  expect(await links.evaluateAll((all) => all.map((a) => a.getAttribute("href")))).toEqual(["../", "#adegan-1", "#main"]);
  await expect(page.locator('a[href*="#main-"]')).toHaveCount(0);

  // Pindah alamat selalu memulai permainan baru dari adegan 1 dengan semua jumlah bintang 0.
  for (const teams of [4, 3, 2] as const) {
    await setHash(page, ROUTES[teams]);
    await expect(counter(page)).toHaveText("Adegan 1/6");
    await expect(page.locator(".ss-narration-tab")).toHaveText(SCENES[0].title);
    await expect(page.locator('.ss-play [aria-live="polite"]')).toHaveText(SCENES[0].narration[0]);
    await expect(narrationNext(page)).toBeFocused();
    expect(await page.locator(".ss-team").evaluateAll((all) => all.map((row) => row.getAttribute("data-team")))).toEqual(IDS.slice(0, teams));
    await expect(counts(page)).toHaveText(Array.from({ length: teams }, () => "0"));
    await expect(page.locator(".ss-team .ss-sr")).toHaveText(NAMES.slice(0, teams).map((name, index) => teamSentence(name, index === 0, 0)));
    await playScene(page, "B", 2);
    await page.clock.runFor(150);
    await expect(counter(page)).toHaveText("Adegan 2/6");
    await expect(counts(page)).toHaveText(["2", ...Array.from({ length: teams - 1 }, () => "0")]);
  }

  // Kembali ke layar kerangka dari ketiga alamat: fokus di tautan "Coba alur permainan".
  for (const teams of [2, 3, 4] as const) {
    await setHash(page, ROUTES[teams]);
    await expect(page.locator(".ss-side")).toBeVisible();
    await setHash(page, "");
    await expect(page.locator(".ss-placeholder")).toBeVisible();
    await expect(page.getByRole("link", { name: "Coba alur permainan" })).toBeFocused();
  }

  // Alamat lain membuka layar kerangka.
  for (const hash of ["#main-1", "#main-2", "#main-5", "#main-4x", "#main-03"]) {
    await setHash(page, hash);
    await expect(page.locator(".ss-placeholder")).toBeVisible();
    await expect(page.locator(".ss-side")).toHaveCount(0);
  }
  expectClean(log);
});

// Main sampai akhir hanya dengan keyboard di 1280×720, dengan bintang di setiap adegan.
for (const plan of [
  { teams: 2, paths: ["A", "B", "C"] },
  { teams: 3, paths: ["B"] },
  { teams: 4, paths: ["B"] },
] as Array<{ teams: TeamCount; paths: ChoiceId[] }>) {
  test(`main sampai akhir dengan keyboard, ${plan.teams} tim, jalur semua ${plan.paths.join(", ")} (AC-17)`, async ({ page }) => {
    const log = watch(page);
    await openPlay(page, "1280x720", plan.teams);
    for (const [round, choice] of plan.paths.entries()) {
      if (round > 0) {
        await page.keyboard.press("Tab");
        await expect(page.locator(".ss-play-end button")).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(narrationNext(page)).toBeFocused();
        await expect(counts(page)).toHaveText(Array.from({ length: plan.teams }, () => "0"));
      }
      const totals: number[] = Array.from({ length: plan.teams }, () => 0);
      for (let i = 0; i < SCENES.length; i++) {
        const stars = ((i + round) % 3) as StarCount;
        await expect(counter(page)).toHaveText(`Adegan ${i + 1}/6`);
        await expect(narrationNext(page)).toBeFocused();
        await toQuestion(page);
        await toStars(page, choice);
        await page.keyboard.press(String(stars));
        totals[i % plan.teams] += stars;
        if (i < SCENES.length - 1) {
          await expect(counts(page)).toHaveText(totals.map(String));
          await page.clock.runFor(400);
        }
      }
      await expect(page.locator(".ss-play-end h1")).toBeFocused();
      await expect(page.locator(".ss-side")).toHaveCount(0);
    }
    expectClean(log);
  });
}
