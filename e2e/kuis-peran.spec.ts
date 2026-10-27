// Uji ujung ke ujung kuis peran penegak hukum Sehari Setara (spesifikasi F-08, Rencana uji langkah 3, 4, 6, dan 7).
// Membuka hasil build di /ruang-setara/sehari-setara/#main lewat serve-subpath.mjs, seperti alamat GitHub Pages.
// Jam uji dijeda sebelum halaman dimuat, sehingga kartu, masa tunggu, dan pergantian adegan hanya maju lewat
// page.clock.runFor, dalam dua langkah sesudah unsur tampil (catatan PLAN "Semua fitur dengan jam uji").
// Bunyi klik di kuis diuji di suara.spec.ts, yang memiliki perekam bunyi (AC-14).
import { expect, test, type Page } from "@playwright/test";
import { ROLES } from "../app/sehari-setara/content/roles";
import { SCENES } from "../app/sehari-setara/content/scenes";
import { isQuizCorrect, narrationFor } from "../app/sehari-setara/engine/rules";
import type { ChoiceId, RoleId } from "../app/sehari-setara/engine/types";
import {
  quizCardName,
  quizCards,
  quizFeedback,
  quizResultAnnouncement,
  quizStartAnnouncement,
} from "../app/sehari-setara/ui/quiz";
import {
  awardPrompt,
  cardNext,
  contrast,
  CREAM,
  expectClean,
  INK,
  quizCard,
  quizDialog,
  quizNext,
  quizTitle,
  SHOTS,
  statusRowButtons,
  SUN,
  VIEWPORTS,
  watch,
  type ViewportName,
} from "./bantuan";

const T0 = new Date("2026-10-27T08:00:00+08:00").getTime();
const LEAF = "rgb(138, 217, 91)";
const MANGO = "rgb(255, 159, 28)";
const MIST = "rgb(201, 212, 229)";
const DUSK = "rgb(58, 74, 107)";
const WHITE = "rgb(255, 255, 255)";

const QUIZ_SCENE = SCENES[4];
function quizOfScene() {
  const quiz = QUIZ_SCENE.roleQuiz;
  if (!quiz) throw new Error("adegan 5 tidak punya roleQuiz");
  return quiz;
}
const QUIZ = quizOfScene();
const IDS: RoleId[] = ROLES.map((role) => role.id);
const LABELS = ROLES.map((role) => role.label);
/** Ukuran huruf tabel tata letak spesifikasi, dalam u. Ruang tugas tertutup memakai huruf "?" (2,8u). */
const FONTS = { title: 2.8, answer: 2.8, question: 3.6, role: 2.8, dutyOpen: 3.6, dutyClosed: 2.8, mark: 2.5, feedback: 3.1, next: 2.8, key: 2.8 };

const live = (page: Page) => page.locator('.ss-play [aria-live="polite"]');
const status = (page: Page) => page.locator('.ss-play [role="status"]');
const counter = (page: Page) => page.locator(".ss-topbar-counter");
const counts = (page: Page) => page.locator(".ss-team-count");
const opened = (page: Page) => page.locator(".ss-quiz-card[data-terbuka]");
const headAnswer = (page: Page) => page.locator(".ss-quiz-answer");
const setHash = (page: Page, hash: string) =>
  page.evaluate((target) => {
    window.location.hash = target;
  }, hash);
/** Benar bila elemen yang berfokus berada di dalam dialog kuis. */
const focusInQuiz = (page: Page) => page.evaluate(() => Boolean(document.activeElement?.closest(".ss-quiz")));

/** Membuka layar permainan dengan jam uji yang dijeda sejak sebelum halaman dimuat. */
async function openPlay(page: Page, size: ViewportName = "1280x720", reduce = true) {
  const { width, height } = VIEWPORTS[size];
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: reduce ? "reduce" : "no-preference" });
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(T0 + 60_000);
  await page.goto("sehari-setara/#main");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".ss-narration")).toBeVisible();
}

/** Permainan baru dari adegan 1 tanpa memuat ulang halaman: layar kerangka, lalu #main lagi (F-07 AC-11). */
async function restart(page: Page) {
  await setHash(page, "");
  await expect(page.locator(".ss-placeholder")).toBeVisible();
  await setHash(page, "#main");
  await expect(page.locator(".ss-narration")).toBeVisible();
  await expect(counter(page)).toHaveText("Adegan 1/6");
}

/** Spasi sampai pertanyaan tampil: teks per huruf ditampilkan sekaligus oleh Spasi pertama setiap layar. */
async function toQuestion(page: Page) {
  while ((await page.locator(".ss-question").count()) === 0) await page.keyboard.press("Space");
  await expect(page.locator(".ss-question")).toBeFocused();
}

/** Memilih, lalu memajukan jam sampai kartu dampak tampil dan masa tunggu 600 ms selesai (dua langkah). */
async function toCard(page: Page, choice: ChoiceId) {
  await page.keyboard.press(choice);
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await page.clock.runFor(600);
}

/** Adegan tanpa kuis sampai pergantian selesai: pilihan, kartu, bintang 1, lalu 400 ms. */
async function playScene(page: Page, choice: ChoiceId = "B") {
  await toQuestion(page);
  await toCard(page, choice);
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  await page.keyboard.press("1");
  await page.clock.runFor(400);
}

/** Dari adegan 1 sampai kartu dampak adegan 5 siap; mengembalikan isi panel bawah fase reaksi adegan 5. */
async function toCard5(page: Page, choice: ChoiceId = "B") {
  for (let i = 0; i < 4; i++) await playScene(page, choice);
  await expect(counter(page)).toHaveText("Adegan 5/6");
  await toQuestion(page);
  await page.keyboard.press(choice);
  await expect(page.locator(".ss-status")).toHaveText(`Kelas memilih ${choice}.`);
  const reactionPanel = await page.locator(".ss-play-panel").innerHTML();
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await page.clock.runFor(600);
  return reactionPanel;
}

/** Dari adegan 1 sampai kuis adegan 5 tampil lewat Enter pada kartu dampak. */
async function toQuiz(page: Page, choice: ChoiceId = "B") {
  const reactionPanel = await toCard5(page, choice);
  await page.keyboard.press("Enter");
  await expect(quizTitle(page)).toBeFocused();
  return reactionPanel;
}

/** Menunggu huruf dan semua gambar latar di layar termuat, tanpa requestAnimationFrame (aman dengan jam uji). */
async function waitImages(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const selector =
      ".ss-stage-bg, .ss-sprite, .ss-emote, .ss-meter-icon, .ss-team-icon, .ss-team-star, .ss-quiz-icon, .ss-quiz-feedback-icon";
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

/** Kotak satu elemen dalam satuan u dari tepi kiri dan atas layar permainan. */
async function boxU(page: Page, selector: string) {
  return page.evaluate((target) => {
    const screen = (document.querySelector(".ss-screen") as Element).getBoundingClientRect();
    const u = screen.height / 100;
    const box = (document.querySelector(target) as Element).getBoundingClientRect();
    return { top: (box.top - screen.top) / u, bottom: (box.bottom - screen.top) / u, left: (box.left - screen.left) / u, right: (box.right - screen.left) / u };
  }, selector);
}

/** Nilai indikator, bintang setiap tim, dan tim yang bergiliran, untuk memastikan kuis tidak mengubah permainan. */
async function readGame(page: Page) {
  return page.evaluate(() => ({
    meters: [...document.querySelectorAll(".ss-meter")].map(
      (meter) => `${meter.getAttribute("aria-valuenow")}/${meter.querySelector(".ss-meter-value")?.textContent}`,
    ),
    counts: [...document.querySelectorAll(".ss-team-count")].map((count) => count.textContent),
    turn: [...document.querySelectorAll(".ss-team")].map((row) => row.hasAttribute("data-giliran")),
  }));
}

/** Letak, ukuran, luapan, dan huruf dialog kuis, dalam piksel layar dan satuan u. */
async function measureQuiz(page: Page) {
  return page.evaluate(() => {
    const rect = (element: Element | null) => {
      if (!element) throw new Error("elemen tidak ada");
      return element.getBoundingClientRect();
    };
    const screen = rect(document.querySelector(".ss-screen"));
    const u = screen.height / 100;
    const quiz = rect(document.querySelector(".ss-quiz"));
    const frame = rect(document.querySelector(".ss-stage-frame"));
    const bar = rect(document.querySelector(".ss-topbar"));
    const meters = rect(document.querySelector(".ss-meters"));
    const body = document.querySelector(".ss-quiz-body") as HTMLElement;
    const inQuiz = (x: number, y: number) => Boolean(document.elementFromPoint(x, y)?.closest(".ss-quiz"));
    const size = (selector: string) => {
      const element = document.querySelector(selector);
      return element ? parseFloat(getComputedStyle(element).fontSize) / u : null;
    };
    const texts = [
      ...document.querySelectorAll(
        ".ss-quiz-title, .ss-quiz-answer, .ss-quiz-question, .ss-quiz-role, .ss-quiz-duty, .ss-quiz-mark, .ss-quiz-feedback-text, .ss-quiz .ss-next, .ss-quiz .ss-choice-key",
      ),
    ];
    return {
      u,
      frameLeft: frame.left - screen.left,
      quiz: { left: quiz.left - screen.left, top: quiz.top - screen.top, right: screen.right - quiz.right, bottom: screen.bottom - quiz.bottom },
      barBottom: bar.bottom - screen.top,
      metersRight: meters.right - screen.left,
      visible: [inQuiz(bar.left + bar.width / 2, bar.top + bar.height / 2), inQuiz(meters.left + meters.width / 2, meters.top + meters.height / 2)],
      covered: [...document.querySelectorAll(".ss-team")].map((row) => {
        const r = row.getBoundingClientRect();
        return inQuiz(r.left + r.width / 2, r.top + r.height / 2);
      }),
      stage: getComputedStyle(document.querySelector(".ss-stage-area") as Element).visibility,
      panel: (document.querySelector(".ss-play-panel") as Element).children.length,
      overflow: { down: body.scrollHeight - body.clientHeight, side: texts.filter((element) => element.scrollWidth > element.clientWidth + 1).length },
      cards: [...document.querySelectorAll<HTMLElement>(".ss-quiz-card")].map((card) => {
        const r = card.getBoundingClientRect();
        return { peran: card.dataset.peran, left: r.left - screen.left, top: r.top - screen.top, width: r.width, height: r.height, bottom: r.bottom - screen.top };
      }),
      icons: [...document.querySelectorAll(".ss-quiz-icon")].map((icon) => [icon.getBoundingClientRect().width, icon.getBoundingClientRect().height]),
      next: (() => {
        const r = rect(document.querySelector(".ss-quiz .ss-next"));
        return { top: r.top - screen.top, left: r.left - screen.left, width: r.width, height: r.height };
      })(),
      fonts: {
        title: size(".ss-quiz-title"),
        answer: size(".ss-quiz-answer"),
        question: size(".ss-quiz-question"),
        role: size(".ss-quiz-role"),
        duty: size(".ss-quiz-duty"),
        mark: size(".ss-quiz-mark"),
        feedback: size(".ss-quiz-feedback-text"),
        next: size(".ss-quiz .ss-next"),
        key: size(".ss-quiz .ss-choice-key"),
        titleFamily: getComputedStyle(document.querySelector(".ss-quiz-title") as Element).fontFamily,
      },
    };
  });
}
type QuizMeasure = Awaited<ReturnType<typeof measureQuiz>>;

/** Letak dialog seperti kartu dampak F-06 (±1 px). */
function checkBox(m: QuizMeasure, note: string) {
  const near = (actual: number, expected: number, what: string) => expect(Math.abs(actual - expected), `${note}: ${what}`).toBeLessThanOrEqual(1);
  near(m.quiz.left, m.frameLeft, "kiri dialog");
  near(m.quiz.top, 9.2 * m.u, "atas dialog");
  near(m.quiz.right, 2 * m.u, "jarak kanan dialog");
  near(m.quiz.bottom, 1.2 * m.u, "jarak bawah dialog");
}

/** AC-2: letak, bagian yang tertutup dan tidak, kartu, ikon, huruf, dan luapan. */
function checkLayout(m: QuizMeasure, note: string, px: number, open: boolean) {
  checkBox(m, note);
  expect(m.quiz.top, `${note}: bilah atas tidak tertutup`).toBeGreaterThanOrEqual(m.barBottom - 1);
  expect(m.quiz.left, `${note}: panel indikator tidak tertutup`).toBeGreaterThanOrEqual(m.metersRight - 1);
  expect(m.visible, `${note}: titik tengah bilah atas dan panel indikator`).toEqual([false, false]);
  expect(m.covered.length, `${note}: baris papan tim`).toBeGreaterThan(0);
  expect(m.covered.every(Boolean), `${note}: titik tengah baris papan tim tertutup dialog`).toBe(true);
  expect(m.stage, `${note}: area panggung`).toBe("hidden");
  expect(m.panel, `${note}: panel bawah kosong`).toBe(0);
  expect(m.cards.map((card) => card.peran), `${note}: urutan kartu`).toEqual(IDS);
  for (const card of m.cards) {
    for (const [what, actual, expected] of [
      ["lebar", card.width, m.cards[0].width],
      ["tinggi", card.height, m.cards[0].height],
      ["atas", card.top, m.cards[0].top],
    ] as const) {
      expect(Math.abs(actual - expected), `${note}: ${what} kartu ${card.peran}`).toBeLessThanOrEqual(1);
    }
  }
  expect(m.icons, `${note}: ikon 32p`).toEqual(IDS.map(() => [32 * px, 32 * px]));
  const fonts: Array<[string, number | null, number | null]> = [
    ["judul", m.fonts.title, FONTS.title],
    ["kepala kanan", m.fonts.answer, open ? FONTS.answer : null],
    ["pertanyaan", m.fonts.question, FONTS.question],
    ["nama", m.fonts.role, FONTS.role],
    ["tugas", m.fonts.duty, open ? FONTS.dutyOpen : FONTS.dutyClosed],
    ["label", m.fonts.mark, FONTS.mark],
    ["umpan balik", m.fonts.feedback, open ? FONTS.feedback : null],
    ["Lanjut", m.fonts.next, FONTS.next],
    ["nomor", m.fonts.key, FONTS.key],
  ];
  for (const [what, actual, expected] of fonts) {
    if (expected === null) expect(actual, `${note}: ${what} belum ada`).toBeNull();
    else expect(Math.abs((actual ?? 0) - expected), `${note}: huruf ${what}`).toBeLessThanOrEqual(0.05);
  }
  expect(m.fonts.titleFamily).toContain("Press Start 2P");
  expect(m.overflow.down, `${note}: luapan ke bawah`).toBeLessThanOrEqual(0);
  expect(m.overflow.side, `${note}: luapan ke samping`).toBe(0);
}

/** Pasangan warna teks dan latarnya di dialog kuis (latar = latar pertama yang tidak transparan dari elemen ke atas). */
async function quizContrasts(page: Page) {
  return page.evaluate(() => {
    const background = (element: Element | null): string => {
      for (let e = element; e; e = e.parentElement) {
        const color = getComputedStyle(e).backgroundColor;
        if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent") return color;
      }
      return "rgb(255, 255, 255)";
    };
    const selector =
      ".ss-quiz-title, .ss-quiz-answer, .ss-quiz-question, .ss-quiz .ss-choice-key, .ss-quiz-role, .ss-quiz-duty, .ss-quiz-mark, .ss-quiz-feedback-text, .ss-quiz .ss-next";
    return [...document.querySelectorAll(selector)]
      .filter((element) => (element.textContent ?? "").trim() !== "")
      .map((element) => ({
        what: `${element.className}${element.closest(".ss-quiz-card") ? `@${(element.closest(".ss-quiz-card") as HTMLElement).dataset.peran}` : ""}`,
        fg: getComputedStyle(element).color,
        bg: background(element),
      }));
  });
}

async function expectContrast(page: Page, note: string) {
  const pairs = await quizContrasts(page);
  expect(pairs.length).toBeGreaterThan(0);
  for (const pair of pairs) expect(contrast(pair.fg, pair.bg), `${note}: ${pair.what} ${pair.fg} di atas ${pair.bg}`).toBeGreaterThanOrEqual(4.5);
}

/** Tampilan tombol Lanjut kuis: latar, teks, kursor ▶, dan garis fokus. */
async function nextLook(page: Page) {
  return quizNext(page).evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      bg: style.backgroundColor,
      fg: style.color,
      cursor: getComputedStyle(element, "::before").visibility,
      outline: [style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset].join(" "),
    };
  });
}

/** AC-3: isi sebelum dijawab, nama bagi pembaca layar, dan pengumuman pembuka. */
async function checkClosed(page: Page) {
  await expect(page.getByRole("dialog", { name: "Kuis peran" })).toHaveCount(1);
  await expect(page.locator(".ss-quiz-question")).toHaveText(QUIZ.question);
  await expect(page.locator(".ss-quiz .ss-choice-key")).toHaveText(["1", "2", "3", "4"]);
  await expect(page.locator(".ss-quiz-role")).toHaveText(LABELS);
  await expect(page.locator(".ss-quiz-duty")).toHaveText(["?", "?", "?", "?"]);
  for (const role of ROLES) await expect(page.getByText(role.tugas, { exact: true })).toHaveCount(0);
  await expect(headAnswer(page)).toHaveCount(0);
  await expect(page.locator(".ss-quiz-feedback")).toHaveCount(0);
  await expect(opened(page)).toHaveCount(0);
  await expect(quizNext(page)).toHaveText("Lanjut");
  await expect(quizNext(page)).toHaveAttribute("data-nonaktif", "");
  await expect(quizNext(page)).toHaveAttribute("aria-disabled", "true");
  const icons = await page.locator(".ss-quiz-icon").evaluateAll((all) => all.map((icon) => getComputedStyle(icon).backgroundImage));
  icons.forEach((icon, i) => expect(icon).toContain(`role_${IDS[i]}-`));
  await expect(live(page)).toHaveText(quizStartAnnouncement(QUIZ.question, ROLES));
  await expect(page.getByRole("group", { name: "Peran penegak hukum" })).toHaveCount(1);
  const names = quizCards(ROLES, null, QUIZ.answer).map(quizCardName);
  for (const [i, name] of names.entries()) await expect(quizCard(page).nth(i)).toHaveAccessibleName(name);
  await expect(page.locator('.ss-quiz-card-top[aria-hidden="true"]')).toHaveCount(4);
  await expect(page.locator('.ss-quiz-duty > [aria-hidden="true"]')).toHaveCount(4);
}

/** AC-4 dan AC-11: kartu terbuka, tanda, kepala kanan, pita umpan balik, nama, dan pengumuman hasil. */
async function checkAnswered(page: Page, answer: RoleId, px: number) {
  const correct = isQuizCorrect(QUIZ_SCENE, answer);
  const cards = await quizCard(page).evaluateAll((all) =>
    all.map((card) => ({
      peran: card.getAttribute("data-peran"),
      open: card.hasAttribute("data-terbuka"),
      disabled: (card as HTMLButtonElement).disabled,
      bg: getComputedStyle(card).backgroundColor,
      ring: getComputedStyle(card).boxShadow,
      duty: card.querySelector(".ss-quiz-duty")?.textContent ?? "",
      mark: card.querySelector(".ss-quiz-mark")?.textContent ?? "",
    })),
  );
  expect(cards.map((card) => card.peran)).toEqual(IDS);
  for (const [i, card] of cards.entries()) {
    const role = ROLES[i];
    const isAnswer = role.id === QUIZ.answer;
    const isChosen = role.id === answer;
    const note = `jawaban ${answer}, kartu ${role.id}`;
    expect([card.open, card.disabled, card.duty], note).toEqual([true, true, role.tugas]);
    expect(card.bg, `${note}: latar`).toBe(isAnswer ? LEAF : isChosen ? SUN : CREAM);
    expect(card.mark, `${note}: label`).toBe(isAnswer ? "Jawaban tepat" : isChosen ? "Pilihan kelas" : "");
    expect(card.ring, `${note}: cincin`).toBe(isChosen ? `${INK} 0px 0px 0px ${2 * px}px inset` : `${WHITE} 0px ${px}px 0px 0px inset`);
  }
  await expect(headAnswer(page)).toHaveText(`Jawaban kelas: ${LABELS[IDS.indexOf(answer)]}.`);
  await expect(quizDialog(page)).toHaveAttribute("data-hasil", correct ? "tepat" : "belum");
  const feedback = await page.locator(".ss-quiz-feedback").evaluate((element) => ({
    bg: getComputedStyle(element).backgroundColor,
    icon: getComputedStyle(element.querySelector(".ss-quiz-feedback-icon") as Element).backgroundImage,
    hidden: element.querySelector(".ss-quiz-feedback-icon")?.getAttribute("aria-hidden"),
    texts: [...element.querySelectorAll(".ss-quiz-feedback-text")].map((text) => text.textContent),
  }));
  expect(feedback.bg).toBe(correct ? LEAF : MANGO);
  expect(feedback.icon).toContain(correct ? "emote_hati-" : "emote_tanya-");
  expect(feedback.hidden).toBe("true");
  expect(feedback.texts).toEqual(quizFeedback(correct));
  await expect(quizNext(page)).not.toHaveAttribute("data-nonaktif", /.*/);
  await expect(live(page)).toHaveText(quizResultAnnouncement(ROLES, answer, correct));
  await expect(page.locator('[aria-live="polite"]')).toHaveCount(1);
  const names = quizCards(ROLES, answer, QUIZ.answer).map(quizCardName);
  for (const [i, name] of names.entries()) await expect(quizCard(page).nth(i)).toHaveAccessibleName(name);
}

// Empat ukuran: dua permainan per ukuran (Hakim lalu Advokat), dengan letak, isi, kontras, dan tangkapan layar.
for (const size of Object.keys(VIEWPORTS) as ViewportName[]) {
  test(`letak, isi, dan kontras di ${size}: tertutup, tepat, dan belum tepat (AC-2, AC-3, AC-4, AC-9, AC-12)`, async ({ page }) => {
    const log = watch(page);
    const { px } = VIEWPORTS[size];
    const shots = size !== "1366x768";
    await openPlay(page, size);
    for (const answer of ["hakim", "advokat"] as const) {
      const note = `${size}, ${answer}`;
      if (answer === "advokat") await restart(page);
      await toCard5(page);
      const impactNext = await boxU(page, ".ss-impact .ss-next");
      await page.keyboard.press("Enter");
      await expect(quizTitle(page)).toBeFocused();
      await expect(page.locator(".ss-wipe")).toHaveCount(0);
      await checkClosed(page);
      const closed = await measureQuiz(page);
      checkLayout(closed, `${note} tertutup`, px, false);
      // Lanjut kuis di tempat Lanjut kartu dampak; kartu peran jauh dari tempat itu (AC-9).
      const nextU = { top: closed.next.top / closed.u, left: closed.next.left / closed.u };
      expect(Math.abs(nextU.top - impactNext.top) * closed.u, `${note}: atas Lanjut`).toBeLessThanOrEqual(1);
      expect(Math.abs(nextU.left - impactNext.left) * closed.u, `${note}: kiri Lanjut`).toBeLessThanOrEqual(1);
      const gap = impactNext.top - Math.max(...closed.cards.map((card) => card.bottom)) / closed.u;
      console.log(`[ukur] ${note}: kartu ${(closed.cards[0].top / closed.u).toFixed(1)}–${(closed.cards[0].bottom / closed.u).toFixed(1)}u, jarak ke Lanjut kartu ${gap.toFixed(1)}u`);
      expect(gap, `${note}: jarak kartu ke Lanjut kartu dampak`).toBeGreaterThanOrEqual(20);
      await expectContrast(page, `${note} tertutup`);
      expect(await nextLook(page)).toMatchObject({ bg: MIST, fg: DUSK, cursor: "hidden" });
      if (answer === "hakim" && shots) await shot(page, `kuis_tertutup_${size}.png`);

      // "Lanjut" nonaktif berfokus lewat Tab: tetap mist dan dusk, dengan kursor ▶ dan garis fokus ink.
      for (let i = 0; i < 5; i++) await page.keyboard.press("Tab");
      await expect(quizNext(page)).toBeFocused();
      expect(await nextLook(page)).toEqual({ bg: MIST, fg: DUSK, cursor: "visible", outline: `solid 2px ${INK} 2px` });
      await expectContrast(page, `${note} Lanjut nonaktif berfokus`);

      // Menjawab dengan angka: kartu terbuka, ukuran dan letak kartu tetap.
      await page.keyboard.press(answer === "hakim" ? "4" : "3");
      await expect(opened(page)).toHaveCount(4);
      await checkAnswered(page, answer, px);
      const after = await measureQuiz(page);
      checkLayout(after, `${note} dijawab`, px, true);
      after.cards.forEach((card, i) => {
        for (const key of ["left", "top", "width", "height"] as const) {
          expect(Math.abs(card[key] - closed.cards[i][key]), `${note}: ${key} kartu ${card.peran} sebelum dan sesudah dijawab`).toBeLessThanOrEqual(1);
        }
      });
      // Masa tunggu: berfokus sun, tanpa fokus cream; keduanya tetap terbaca.
      await expect(quizNext(page)).toBeFocused();
      expect(await nextLook(page)).toMatchObject({ bg: SUN, fg: INK, cursor: "visible" });
      await expectContrast(page, `${note} tertahan berfokus`);
      await quizTitle(page).focus();
      expect(await nextLook(page)).toMatchObject({ bg: CREAM, fg: INK, cursor: "hidden" });
      await expectContrast(page, `${note} tertahan`);
      await page.clock.runFor(600);
      await expect(quizNext(page)).not.toHaveAttribute("aria-disabled", /.*/);
      expect(await nextLook(page)).toMatchObject({ bg: CREAM, fg: INK, cursor: "hidden" });
      await expectContrast(page, `${note} siap`);
      await page.keyboard.press("Shift+Tab");
      await expect(quizNext(page)).toBeFocused();
      expect(await nextLook(page)).toMatchObject({ bg: SUN, fg: INK, cursor: "visible" });
      await expectContrast(page, `${note} siap berfokus`);
      if (shots) await shot(page, `kuis_${answer === "hakim" ? "tepat" : "belum_tepat"}_${size}.png`);
      await page.keyboard.press("Enter");
      await expect(awardPrompt(page)).toBeFocused();
      await expect(quizDialog(page)).toHaveCount(0);
    }
    expectClean(log);
  });
}

test("kapan kuis tampil: hanya di adegan 5 sesudah Lanjut kartu, tanpa sapuan; baris status tanpa tombol (AC-1)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page);
  for (let i = 0; i < SCENES.length; i++) {
    const note = `adegan ${i + 1}`;
    await toQuestion(page);
    await expect(statusRowButtons(page), note).toHaveCount(0);
    await page.keyboard.press("B");
    await expect(statusRowButtons(page), note).toHaveCount(0);
    await page.clock.runFor(1200);
    await expect(page.locator("#ss-impact-title")).toBeFocused();
    await expect(quizDialog(page), `${note}: kuis belum tampil selama kartu`).toHaveCount(0);
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
    if (SCENES[i].roleQuiz) {
      await expect(quizDialog(page)).toBeVisible();
      await expect(page.locator(".ss-play")).toHaveAttribute("data-kuis", "");
      await expect(page.locator(".ss-wipe")).toHaveCount(0);
      await expect(page.locator(".ss-impact")).toHaveCount(0);
      await expect(awardPrompt(page)).toHaveCount(0);
      await expect(opened(page)).toHaveCount(0);
      await expect(statusRowButtons(page)).toHaveCount(0);
      await page.keyboard.press("4");
      await page.clock.runFor(600);
      await page.keyboard.press("Enter");
    } else {
      await expect(quizDialog(page), note).toHaveCount(0);
    }
    await expect(awardPrompt(page)).toBeFocused();
    await expect(quizDialog(page)).toHaveCount(0);
    await expect(page.locator(".ss-play")).not.toHaveAttribute("data-kuis", /.*/);
    await expect(statusRowButtons(page), note).toHaveCount(0);
    await page.keyboard.press("1");
    await page.clock.runFor(400);
  }
  // Layar akhir sementara, layar kerangka, dan pratinjau panggung tidak menampilkan kuis.
  await expect(page.locator(".ss-play-end h1")).toBeFocused();
  await expect(quizDialog(page)).toHaveCount(0);
  await setHash(page, "");
  await expect(page.locator(".ss-placeholder")).toBeVisible();
  await expect(quizDialog(page)).toHaveCount(0);
  await setHash(page, "#adegan-5");
  await expect(page.locator("#ss-preview-title")).toHaveText(QUIZ_SCENE.title);
  await expect(quizDialog(page)).toHaveCount(0);
  expectClean(log);
});

test("ikon kuis dimuat lebih dulu sejak adegan 4 (AC-3)", async ({ page }) => {
  const log = watch(page);
  const icons: string[] = [];
  page.on("request", (request) => {
    if (/\/(role_[a-z]+|emote_tanya)-[^/]*\.png$/.test(request.url())) icons.push(request.url());
  });
  await openPlay(page);
  for (let i = 0; i < 2; i++) await playScene(page);
  await toQuestion(page);
  await expect(counter(page)).toHaveText("Adegan 3/6");
  expect(icons, "belum diminta selama adegan 3").toEqual([]);
  await toCard(page, "B");
  await page.keyboard.press("Enter");
  await page.keyboard.press("1");
  await page.clock.runFor(400);
  await expect(counter(page)).toHaveText("Adegan 4/6");
  await expect.poll(() => icons.length).toBe(5);
  for (const name of [...IDS.map((id) => `role_${id}-`), "emote_tanya-"]) expect(icons.some((url) => url.includes(name)), name).toBe(true);
  await playScene(page);
  await toQuestion(page);
  await toCard(page, "B");
  await page.keyboard.press("Enter");
  await expect(quizTitle(page)).toBeFocused();
  await waitImages(page);
  expectClean(log);
});

test("ikon gagal dimuat: nomor, nama, tugas, label, dan kalimat tetap tampil, kuis tetap bisa dijawab (AC-3)", async ({ page }) => {
  const log = watch(page);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.location().url);
  });
  await page.route(/\/(role_[a-z]+|emote_tanya)-[^/]*\.png$/, (route) => route.abort("failed"));
  await openPlay(page);
  await toQuiz(page);
  await expect(page.locator(".ss-quiz .ss-choice-key")).toHaveText(["1", "2", "3", "4"]);
  await expect(page.locator(".ss-quiz-role")).toHaveText(LABELS);
  await page.keyboard.press("2");
  await expect(page.locator(".ss-quiz-duty")).toHaveText(ROLES.map((role) => role.tugas));
  await expect(page.locator(".ss-quiz-mark")).toHaveText(["", "Pilihan kelas", "", "Jawaban tepat"]);
  await expect(page.locator(".ss-quiz-feedback-text")).toHaveText(quizFeedback(false));
  await expect(headAnswer(page)).toHaveText("Jawaban kelas: Jaksa.");
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  await page.keyboard.press("1");
  await page.clock.runFor(400);
  await expect(counter(page)).toHaveText("Adegan 6/6");
  expect(log.failed.some((line) => line.includes("role_")), "permintaan ikon peran digagalkan").toBe(true);
  expect(log.page, "galat halaman").toEqual([]);
  expect(log.http, "respons 4xx/5xx").toEqual([]);
  expect(log.external, "permintaan ke host lain").toEqual([]);
  // Hanya pesan jaringan untuk ikon yang digagalkan.
  expect(consoleErrors.every((url) => /role_|emote_tanya/.test(url)), consoleErrors.join("\n")).toBe(true);
});

test("menjawab: keempat jawaban dengan klik, Enter pada kartu, dan 1 sampai 4; permainan tidak berubah (AC-4, AC-6, AC-11)", async ({ page }) => {
  const log = watch(page);
  const { px } = VIEWPORTS["1280x720"];
  await openPlay(page);
  let first = true;
  for (const way of ["klik", "enter", "angka"] as const) {
    for (const [index, answer] of IDS.entries()) {
      if (!first) await restart(page);
      first = false;
      await toQuiz(page);
      const before = await readGame(page);
      expect(before.counts).toEqual(["2", "2"]);
      if (way === "klik") await quizCard(page).nth(index).click();
      else if (way === "enter") {
        for (let i = 0; i <= index; i++) await page.keyboard.press("Tab");
        await expect(quizCard(page).nth(index)).toBeFocused();
        await page.keyboard.press("Enter");
      } else await page.keyboard.press(String(index + 1));
      await expect(opened(page)).toHaveCount(4);
      await checkAnswered(page, answer, px);
      await expect(quizNext(page)).toBeFocused();
      expect(await readGame(page), `${way} ${answer}: selama kuis`).toEqual(before);
      await page.clock.runFor(600);
      await page.keyboard.press("Enter");
      await expect(awardPrompt(page)).toBeFocused();
      expect(await readGame(page), `${way} ${answer}: sesudah kuis`).toEqual(before);
      if (way === "angka") {
        // Bendera: narasi adegan 6 tetap mengikuti pilihan B di adegan 4 (komangDibela).
        await page.keyboard.press("1");
        await page.clock.runFor(400);
        await expect(counter(page)).toHaveText("Adegan 6/6");
        const screens = narrationFor(SCENES[5], ["komangDibela"]);
        await expect(live(page)).toHaveText(screens[0]);
        await page.keyboard.press("Space");
        await expect(live(page)).toHaveText(screens[1]);
      }
    }
  }
  expectClean(log);
});

test("hanya jawaban pertama: angka lain, kartu terkunci, klik ganda, dan tombol yang ditahan (AC-5)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page);
  // Jaksa dengan 2; tekanan lain sesudahnya tidak mengubah tampilan dan pengumuman.
  await toQuiz(page);
  await page.keyboard.press("2");
  await expect(opened(page)).toHaveCount(4);
  const html = await quizDialog(page).innerHTML();
  const said = (await live(page).textContent()) ?? "";
  for (const key of ["1", "3", "4", "2"]) await page.keyboard.press(key);
  // Kartu terkunci: force melewati pemeriksaan Playwright untuk tombol disabled.
  await quizCard(page).nth(3).click({ force: true });
  await quizCard(page).nth(0).click({ force: true });
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "4", repeat: true, bubbles: true }));
  });
  expect(await quizDialog(page).innerHTML()).toBe(html);
  await expect(live(page)).toHaveText(said);
  await expect(headAnswer(page)).toHaveText("Jawaban kelas: Jaksa.");

  // Klik ganda pada Advokat: satu jawaban; fokus tetap di dalam dialog, lalu Tab ke Lanjut.
  await restart(page);
  await toQuiz(page);
  await quizCard(page).nth(2).dblclick();
  await expect(headAnswer(page)).toHaveText("Jawaban kelas: Advokat.");
  expect(await focusInQuiz(page)).toBe(true);
  await page.keyboard.press("Tab");
  await expect(quizNext(page)).toBeFocused();

  // Enter yang ditahan pada Polisi: satu jawaban; pengulangan sebelum dan sesudah masa tunggu tidak menekan Lanjut.
  await restart(page);
  await toQuiz(page);
  await page.keyboard.press("Tab");
  await expect(quizCard(page).nth(0)).toBeFocused();
  await page.keyboard.down("Enter");
  await expect(opened(page)).toHaveCount(4);
  await expect(quizNext(page)).toBeFocused();
  await page.keyboard.down("Enter");
  await page.keyboard.down("Enter");
  await page.clock.runFor(700);
  await page.keyboard.down("Enter");
  await page.keyboard.down("Enter");
  await page.keyboard.up("Enter");
  await expect(quizDialog(page)).toBeVisible();
  await expect(awardPrompt(page)).toHaveCount(0);
  await expect(headAnswer(page)).toHaveText("Jawaban kelas: Polisi.");

  // Spasi yang ditahan pada Hakim: satu jawaban saat dilepas, tanpa menekan Lanjut.
  await restart(page);
  await toQuiz(page);
  for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
  await expect(quizCard(page).nth(3)).toBeFocused();
  await page.keyboard.down(" ");
  await page.keyboard.down(" ");
  await page.clock.runFor(700);
  await page.keyboard.down(" ");
  await page.keyboard.up(" ");
  await expect(headAnswer(page)).toHaveText("Jawaban kelas: Hakim.");
  await expect(quizNext(page)).toBeFocused();
  await page.clock.runFor(700);
  await expect(quizDialog(page)).toBeVisible();
  await expect(awardPrompt(page)).toHaveCount(0);
  expectClean(log);
});

test("Lanjut kuis: nonaktif, masa tunggu 600 ms, sekali, lalu fase bintang (AC-7)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page);
  const reactionPanel = await toQuiz(page);
  // Sebelum dijawab: nonaktif, dan klik, Enter, serta Spasi tidak berpengaruh.
  await expect(quizNext(page)).toHaveAttribute("data-nonaktif", "");
  await expect(quizNext(page)).toHaveAttribute("aria-disabled", "true");
  expect(await nextLook(page)).toMatchObject({ bg: MIST, fg: DUSK, cursor: "hidden" });
  for (let i = 0; i < 5; i++) await page.keyboard.press("Tab");
  await expect(quizNext(page)).toBeFocused();
  expect(await nextLook(page)).toEqual({ bg: MIST, fg: DUSK, cursor: "visible", outline: `solid 2px ${INK} 2px` });
  await shot(page, "kuis_lanjut_nonaktif_1280x720.png");
  // Klik pada tombol ber-aria-disabled: force melewati pemeriksaan Playwright.
  await quizNext(page).click({ force: true });
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await quizTitle(page).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(quizDialog(page)).toBeVisible();
  await expect(opened(page)).toHaveCount(0);

  // Sesudah dijawab: tertahan sampai 599 ms; tepat 600 ms sesudah jawaban tampil, Spasi pada tombol melanjutkan.
  await page.keyboard.press("4");
  await expect(opened(page)).toHaveCount(4);
  await expect(quizNext(page)).toBeFocused();
  await expect(quizNext(page)).not.toHaveAttribute("data-nonaktif", /.*/);
  await page.clock.runFor(599);
  await expect(quizNext(page)).toHaveAttribute("aria-disabled", "true");
  await quizNext(page).click({ force: true });
  await page.keyboard.press("Space");
  await expect(quizDialog(page)).toBeVisible();
  await page.clock.runFor(1);
  await page.keyboard.press("Space");
  await expect(awardPrompt(page)).toBeFocused();
  // Fase bintang: dialog hilang, panggung terlihat dengan reaksi adegan 5, panel bawah seperti fase reaksi.
  await expect(quizDialog(page)).toHaveCount(0);
  expect(await page.locator(".ss-stage-area").evaluate((element) => getComputedStyle(element).visibility)).toBe("visible");
  await expect(page.locator(".ss-stage-frame")).toHaveAttribute("aria-label", `${QUIZ_SCENE.altText} Reaksi tokoh atas pilihan B.`);
  expect(await page.locator(".ss-play-panel").innerHTML()).toBe(reactionPanel);
  await expect(counts(page)).toHaveText(["2", "2"]);
  await shot(page, "bintang_sesudah_kuis_1280x720.png");

  // Klik ganda pada Lanjut sesudah masa tunggu: satu fase bintang, tanpa bintang.
  await restart(page);
  await toQuiz(page);
  await page.keyboard.press("4");
  await expect(opened(page)).toHaveCount(4);
  await page.clock.runFor(600);
  await quizNext(page).dblclick();
  await expect(awardPrompt(page)).toBeVisible();
  await expect(counts(page)).toHaveText(["2", "2"]);
  await expect(counter(page)).toHaveText("Adegan 5/6");

  // Dua Enter cepat sesudah masa tunggu: satu fase bintang, tanpa bintang.
  await restart(page);
  await toQuiz(page);
  await page.keyboard.press("1");
  await expect(opened(page)).toHaveCount(4);
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  await expect(counts(page)).toHaveText(["2", "2"]);
  await expect(page.locator(".ss-award")).toBeVisible();

  // Fokus di dialog sesudah klik ganda pada kartu: Enter pada 599 ms tidak berpengaruh, pada 600 ms melanjutkan.
  await restart(page);
  await toQuiz(page);
  await quizCard(page).nth(1).dblclick();
  await expect(opened(page)).toHaveCount(4);
  expect(await focusInQuiz(page)).toBe(true);
  await page.clock.runFor(599);
  await page.keyboard.press("Enter");
  await expect(quizDialog(page)).toBeVisible();
  await page.clock.runFor(1);
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  await expect(counts(page)).toHaveText(["2", "2"]);
  expectClean(log);
});

test("fokus dan dialog: judul, urutan Tab, ruang kosong, dan ukuran jendela (AC-8)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page);
  await toQuiz(page);
  await expect(quizDialog(page)).toHaveAttribute("role", "dialog");
  await expect(quizDialog(page)).toHaveAttribute("aria-modal", "true");
  await expect(page.getByRole("dialog", { name: "Kuis peran" })).toHaveCount(1);
  expect(await quizTitle(page).evaluate((element) => element.tagName)).toBe("H2");
  // Dibuka dengan keyboard: garis fokus judul terlihat.
  const titleOutline = await quizTitle(page).evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset];
  });
  expect(titleOutline).toEqual(["solid", "2px", INK, "4px"]);

  // Urutan Tab sebelum dijawab, maju dan mundur, termasuk dari judul.
  const cards = [0, 1, 2, 3].map((i) => quizCard(page).nth(i));
  for (const target of [...cards, quizNext(page), cards[0]]) {
    await page.keyboard.press("Tab");
    await expect(target).toBeFocused();
  }
  for (const target of [quizNext(page), cards[3], cards[2], cards[1], cards[0]]) {
    await page.keyboard.press("Shift+Tab");
    await expect(target).toBeFocused();
  }
  await quizTitle(page).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(quizNext(page)).toBeFocused();
  await quizTitle(page).focus();
  await page.keyboard.press("Tab");
  await expect(cards[0]).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(cards[1]).toBeFocused();
  const look = (i: number) => cards[i].evaluate((element) => [getComputedStyle(element).backgroundColor, getComputedStyle(element, "::before").visibility]);
  expect(await look(1)).toEqual([SUN, "visible"]);
  expect(await look(0)).toEqual([CREAM, "hidden"]);
  await shot(page, "kuis_fokus_1280x720.png");

  // Klik di ruang kosong (pertanyaan dan bawah kartu): fokus tetap di dalam dialog, tanpa garis fokus pada dialog.
  await page.locator(".ss-quiz-question").click();
  expect(await focusInQuiz(page)).toBe(true);
  const body = await page.locator(".ss-quiz-body").boundingBox();
  if (!body) throw new Error("isi kuis tidak ada");
  await page.mouse.click(body.x + body.width / 2, body.y + body.height - 10);
  expect(await page.evaluate(() => document.activeElement?.classList.contains("ss-quiz"))).toBe(true);
  expect(await quizDialog(page).evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("none");
  await page.keyboard.press("Tab");
  await expect(cards[0]).toBeFocused();
  await page.mouse.click(body.x + body.width / 2, body.y + body.height - 10);
  await page.keyboard.press("Shift+Tab");
  await expect(quizNext(page)).toBeFocused();

  // Ukuran jendela berubah sebelum dijawab: letak mengikuti, fokus dan pengumuman tetap.
  await quizTitle(page).focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(cards[1]).toBeFocused();
  const said = (await live(page).textContent()) ?? "";
  for (const size of ["1024x768", "1280x720"] as const) {
    await page.setViewportSize({ width: VIEWPORTS[size].width, height: VIEWPORTS[size].height });
    checkBox(await measureQuiz(page), `${size} sebelum dijawab`);
    await expect(cards[1]).toBeFocused();
    await expect(live(page)).toHaveText(said);
    await expect(opened(page)).toHaveCount(0);
  }

  // Sesudah dijawab: fokus di Lanjut; Tab dan Shift+Tab tetap di Lanjut; ukuran jendela tidak mengubah jawaban,
  // fokus, pengumuman, maupun masa tunggu.
  await page.keyboard.press("3");
  await expect(quizNext(page)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(quizNext(page)).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(quizNext(page)).toBeFocused();
  const result = (await live(page).textContent()) ?? "";
  await page.clock.runFor(300);
  for (const size of ["1024x768", "1280x720"] as const) {
    await page.setViewportSize({ width: VIEWPORTS[size].width, height: VIEWPORTS[size].height });
    checkBox(await measureQuiz(page), `${size} sesudah dijawab`);
    await expect(quizNext(page)).toBeFocused();
    await expect(live(page)).toHaveText(result);
    await expect(headAnswer(page)).toHaveText("Jawaban kelas: Advokat.");
  }
  await page.clock.runFor(299);
  await page.keyboard.press("Space");
  await expect(quizDialog(page)).toBeVisible();
  await page.clock.runFor(1);
  await page.keyboard.press("Space");
  await expect(awardPrompt(page)).toBeFocused();
  expectClean(log);
});

test("klik ganda dan dua Enter pada Lanjut kartu dampak membuka kuis yang belum dijawab (AC-9)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page);
  await toCard5(page);
  await cardNext(page).dblclick();
  await expect(quizDialog(page)).toBeVisible();
  await expect(opened(page)).toHaveCount(0);
  expect(await focusInQuiz(page)).toBe(true);
  await page.clock.runFor(1000);
  await expect(opened(page)).toHaveCount(0);
  await expect(live(page)).toHaveText(quizStartAnnouncement(QUIZ.question, ROLES));

  await restart(page);
  await toCard5(page);
  await page.keyboard.press("Tab");
  await expect(cardNext(page)).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(quizDialog(page)).toBeVisible();
  await expect(quizTitle(page)).toBeFocused();
  await expect(opened(page)).toHaveCount(0);
  expectClean(log);
});

test("keyboard: 1 sampai 4 hanya di kuis, tombol lain tanpa pengaruh, M, pengubah, dan tombol yang ditahan (AC-10)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page);
  // 4 tidak berpengaruh di fase narasi, diskusi, reaksi, kartu, dan bintang.
  await page.keyboard.press("4");
  await expect(live(page)).toHaveText(SCENES[0].narration[0]);
  await toQuestion(page);
  await page.keyboard.press("4");
  await expect(page.locator(".ss-status")).toHaveCount(0);
  await page.keyboard.press("2");
  await expect(page.locator(".ss-status")).toHaveText("Kelas memilih B.");
  await page.keyboard.press("4");
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await page.keyboard.press("4");
  await page.clock.runFor(600);
  await page.keyboard.press("4");
  await expect(page.locator(".ss-impact")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  await page.keyboard.press("4");
  await expect(page.locator(".ss-award")).toBeVisible();
  await expect(counts(page)).toHaveText(["0", "0"]);
  await page.keyboard.press("1");
  await page.clock.runFor(400);
  for (let i = 1; i < 4; i++) await playScene(page);
  await toQuestion(page);
  await toCard(page, "B");
  await page.keyboard.press("Enter");
  await expect(quizTitle(page)).toBeFocused();

  // Di fase quiz, tombol lain tidak berpengaruh.
  for (const key of ["0", "5", "9", "a", "b", "p", "t", "s", "Escape"]) await page.keyboard.press(key);
  await expect(opened(page)).toHaveCount(0);
  await expect(quizTitle(page)).toBeFocused();
  await expect(live(page)).toHaveText(quizStartAnnouncement(QUIZ.question, ROLES));
  // M mematikan dan menyalakan suara.
  await page.keyboard.press("m");
  await expect(status(page)).toHaveText("Suara dimatikan.");
  await page.keyboard.press("M");
  await expect(status(page)).toHaveText("Suara dinyalakan.");
  // Ctrl, Alt, Meta, dan tekanan repeat diabaikan.
  for (const combo of ["Control+4", "Alt+4", "Meta+4"]) await page.keyboard.press(combo);
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "4", repeat: true, bubbles: true }));
  });
  await expect(opened(page)).toHaveCount(0);
  // keydown Enter dan Spasi bertanda repeat di dalam dialog dibatalkan; tekanan pertama pada kartu tidak.
  const canceled = await page.evaluate(() => {
    const card = document.querySelector(".ss-quiz-card") as HTMLElement;
    const send = (key: string, repeat: boolean) => !card.dispatchEvent(new KeyboardEvent("keydown", { key, repeat, bubbles: true, cancelable: true }));
    return { enter: send("Enter", true), space: send(" ", true), firstEnter: send("Enter", false), firstSpace: send(" ", false) };
  });
  expect(canceled).toEqual({ enter: true, space: true, firstEnter: false, firstSpace: false });
  await expect(opened(page)).toHaveCount(0);
  // 1 sampai 4 menjawab hanya sekali.
  await page.keyboard.press("3");
  await expect(headAnswer(page)).toHaveText("Jawaban kelas: Advokat.");
  await page.keyboard.press("4");
  await expect(headAnswer(page)).toHaveText("Jawaban kelas: Advokat.");
  expectClean(log);
});

test("pembaca layar: pengumuman, nama kartu, dan wilayah status tanpa perubahan selain M (AC-11)", async ({ page }) => {
  const log = watch(page);
  const recordStatus = () =>
    page.evaluate(() => {
      const region = document.querySelector('.ss-play [role="status"]') as Element;
      const changes: string[] = [];
      (window as unknown as { ssStatus: string[] }).ssStatus = changes;
      new MutationObserver(() => changes.push(region.textContent ?? "")).observe(region, { childList: true, characterData: true, subtree: true });
    });
  const statusChanges = () => page.evaluate(() => (window as unknown as { ssStatus: string[] }).ssStatus);
  await openPlay(page);
  await toCard5(page);
  await recordStatus();
  await page.keyboard.press("Enter");
  await expect(quizTitle(page)).toBeFocused();
  await checkClosed(page);
  await expect(page.locator('[aria-live="polite"]')).toHaveCount(1);
  await page.keyboard.press("4");
  await expect(opened(page)).toHaveCount(4);
  await checkAnswered(page, "hakim", VIEWPORTS["1280x720"].px);
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  expect(await statusChanges()).toEqual([]);

  // M saat kuis: satu-satunya yang ditulis di wilayah status.
  await restart(page);
  await toQuiz(page);
  await recordStatus();
  await page.keyboard.press("m");
  await expect(status(page)).toHaveText("Suara dimatikan.");
  await page.keyboard.press("2");
  await expect(opened(page)).toHaveCount(4);
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  expect(await statusChanges()).toEqual(["Suara dimatikan."]);
  expectClean(log);
});

test("tanpa animasi; kurangi gerak tidak mengubah isi kuis dan masa tunggu (AC-13)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, "1280x720", false);
  await toQuiz(page);
  expect(await quizDialog(page).evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  const closedHtml = await quizDialog(page).innerHTML();
  await page.keyboard.press("3");
  await expect(opened(page)).toHaveCount(4);
  expect(await quizDialog(page).evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  const answeredHtml = await quizDialog(page).innerHTML();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await restart(page);
  await toQuiz(page);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  expect(await quizDialog(page).innerHTML()).toBe(closedHtml);
  await page.keyboard.press("3");
  await expect(opened(page)).toHaveCount(4);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  expect(await quizDialog(page).innerHTML()).toBe(answeredHtml);
  await page.clock.runFor(599);
  await page.keyboard.press("Space");
  await expect(quizDialog(page)).toBeVisible();
  await page.clock.runFor(1);
  await page.keyboard.press("Space");
  await expect(awardPrompt(page)).toBeFocused();
  expectClean(log);
});
