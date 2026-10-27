// Uji ujung ke ujung panel indikator dan kartu dampak (spesifikasi F-06, Rencana uji langkah 3 sampai 5).
// Disesuaikan di F-07: sesudah kartu dampak, bintang alasan diberikan sebelum adegan berganti (giveStars).
// Disesuaikan di F-08: sesudah kartu dampak adegan 5, kuis peran dijawab sebelum bintang alasan (answerQuiz).
// Membuka hasil build di /ruang-setara/sehari-setara/#main lewat serve-subpath.mjs, seperti alamat GitHub Pages.
import { expect, test, type Page } from "@playwright/test";
import { SCENES } from "../app/sehari-setara/content/scenes";
import { metersFromHistory } from "../app/sehari-setara/engine/rules";
import type { Choice, ChoiceId, HistoryEntry } from "../app/sehari-setara/engine/types";
import {
  effectDirection,
  effectText,
  impactAnnouncement,
  meterValueAt,
  metersBefore,
  segmentFills,
  TIER_ICON,
  type MeterValues,
} from "../app/sehari-setara/ui/impact";
import {
  answerQuiz,
  awardPrompt,
  cardNext,
  contrast,
  CREAM,
  expectClean,
  giveStars,
  impactCard,
  INK,
  SHOTS,
  statusRowButtons,
  VIEWPORTS,
  watch,
  type ViewportName,
} from "./bantuan";

const T0 = new Date("2026-10-23T08:00:00+08:00").getTime();
const DUSK = "rgb(58, 74, 107)";
const TIER_BG = { tepat: "rgb(138, 217, 91)", kurang: "rgb(255, 159, 28)", berisiko: "rgb(255, 107, 91)" } as const;
const DELTA_BG = { naik: "rgb(138, 217, 91)", turun: "rgb(255, 107, 91)", nol: "rgb(201, 212, 229)" } as const;
const METER_COLOR = { hak: "rgb(46, 196, 182)", kewajiban: "rgb(58, 134, 217)" } as const;
const TIER_TEXT = { tepat: "Tepat", kurang: "Kurang tepat", berisiko: "Berisiko" } as const;
const LABELS = ["Yang terjadi", "Hak yang terdampak", "Kewajiban terkait", "Rujukan"];

const live = (page: Page) => page.locator('.ss-play [aria-live="polite"]');
const title = (page: Page) => page.locator("#ss-impact-title");
const counter = (page: Page) => page.locator(".ss-topbar-counter");

/** History naskah untuk n pilihan pertama sebuah jalur. */
const historyOf = (path: readonly ChoiceId[], n: number): HistoryEntry[] =>
  path.slice(0, n).map((choiceId, index) => ({ sceneId: SCENES[index].id, choiceId, teamId: "tim", stars: 0 }));
const choiceOf = (sceneIndex: number, id: ChoiceId): Choice => {
  const choice = SCENES[sceneIndex].choices.find((c) => c.id === id);
  if (!choice) throw new Error(`pilihan ${id} tidak ada`);
  return choice;
};

async function openPlay(page: Page, size: ViewportName, reduce: boolean) {
  const { width, height } = VIEWPORTS[size];
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: reduce ? "reduce" : "no-preference" });
  await page.clock.install({ time: T0 });
  await page.goto("sehari-setara/#main");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".ss-narration")).toBeVisible();
  await page.clock.pauseAt(T0 + 60_000);
}

/** Spasi sampai pertanyaan tampil; teks per huruf ditampilkan sekaligus oleh Spasi pertama setiap layar. */
async function toQuestion(page: Page) {
  while ((await page.locator(".ss-question").count()) === 0) await page.keyboard.press("Space");
  await expect(page.locator(".ss-question")).toBeFocused();
}

/** Menunggu huruf dan semua gambar latar (panggung, ikon indikator, ikon tingkat) termuat. */
async function waitImages(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const urls = [...document.querySelectorAll<HTMLElement>(".ss-stage-bg, .ss-sprite, .ss-emote, .ss-meter-icon, .ss-impact-icon")]
      .map((element) => /url\("(.*)"\)/.exec(getComputedStyle(element).backgroundImage)?.[1] ?? "")
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

/** Nilai yang tampil di kedua indikator, dari atribut pembaca layar, angka, dan segmen. */
async function readMeters(page: Page) {
  return page.locator(".ss-meter").evaluateAll((all) =>
    all.map((element) => ({
      key: element.getAttribute("data-meter"),
      now: Number(element.getAttribute("aria-valuenow")),
      text: element.getAttribute("aria-valuetext"),
      value: Number(element.querySelector(".ss-meter-value")?.textContent),
      fills: [...element.querySelectorAll(".ss-meter-seg")].map((seg) => seg.getAttribute("data-isi")),
    })),
  );
}

async function expectMeters(page: Page, values: MeterValues, note: string) {
  const meters = await readMeters(page);
  expect(meters.map((m) => m.key), note).toEqual(["hak", "kewajiban"]);
  for (const meter of meters) {
    const expected = values[meter.key as keyof MeterValues];
    expect([meter.now, meter.value, meter.text], `${note}, ${meter.key}`).toEqual([expected, expected, `${expected} dari 100`]);
    expect(meter.fills, `${note}, segmen ${meter.key}`).toEqual(segmentFills(expected));
  }
}

/** Ukuran dan warna kartu serta panel indikator, dalam satuan u dan piksel antarmuka p. */
async function measureCard(page: Page) {
  return page.evaluate(() => {
    const rect = (element: Element | null) => {
      if (!element) throw new Error("elemen tidak ada");
      return element.getBoundingClientRect();
    };
    const style = (selector: string) => getComputedStyle(document.querySelector(selector) as Element);
    const screen = rect(document.querySelector(".ss-screen"));
    const frame = rect(document.querySelector(".ss-stage-frame"));
    const card = rect(document.querySelector(".ss-impact"));
    const meters = rect(document.querySelector(".ss-meters"));
    const body = document.querySelector(".ss-impact-body") as HTMLElement;
    const parts = [...document.querySelectorAll(".ss-impact-body p, .ss-impact-body li, .ss-impact-label")];
    const u = screen.height / 100;
    const size = (selector: string) => parseFloat(style(selector).fontSize) / u;
    return {
      u,
      frameLeft: frame.left - screen.left,
      card: { left: card.left - screen.left, top: card.top - screen.top, right: screen.right - card.right, bottom: screen.bottom - card.bottom },
      meters: { left: meters.left - screen.left, top: meters.top - screen.top, width: meters.width, height: meters.height },
      overflow: {
        down: body.scrollHeight - body.clientHeight,
        side: parts.filter((element) => element.scrollWidth > element.clientWidth + 1).length,
        panel: (() => {
          const panel = document.querySelector(".ss-meters") as HTMLElement;
          return [panel.scrollHeight - panel.clientHeight, panel.scrollWidth - panel.clientWidth];
        })(),
      },
      fonts: {
        terjadi: size(".ss-impact-terjadi"),
        text: size(".ss-impact-text"),
        refs: size(".ss-impact-refs"),
        label: size(".ss-impact-label"),
        title: size(".ss-impact-title"),
        choice: size(".ss-impact-choice"),
        titleFamily: style(".ss-impact-title").fontFamily,
      },
      colors: {
        head: style(".ss-impact-head").backgroundColor,
        title: style(".ss-impact-title").color,
        choice: style(".ss-impact-choice").color,
        label: [style(".ss-impact-label").color, style(".ss-impact").backgroundColor],
        body: [style(".ss-impact-terjadi").color, style(".ss-impact-text").color, style(".ss-impact-refs").color],
        meterLabel: style(".ss-meter-label").color,
        meterValue: style(".ss-meter-value").color,
        screen: style(".ss-screen").backgroundColor,
      },
      icon: style(".ss-impact-icon").backgroundImage,
      iconSize: [rect(document.querySelector(".ss-impact-icon")).width, rect(document.querySelector(".ss-impact-icon")).height],
    };
  });
}

/** Memeriksa satu kartu: isi naskah, tingkat, letak, ukuran huruf, luapan, kontras, dan pengumuman. */
async function checkCard(page: Page, sceneIndex: number, choice: Choice, before: MeterValues, after: MeterValues, px: number) {
  const card = impactCard(page);
  const note = `adegan ${sceneIndex + 1} pilihan ${choice.id}`;
  await expect(card).toHaveAttribute("role", "dialog");
  await expect(card).toHaveAttribute("aria-modal", "true");
  await expect(page.getByRole("dialog", { name: `Kartu dampak: ${TIER_TEXT[choice.tier]}` })).toHaveCount(1);
  await expect(card).toHaveAttribute("data-tier", choice.tier);
  await expect(title(page)).toHaveText(`Kartu dampak: ${TIER_TEXT[choice.tier]}`);
  expect(await title(page).evaluate((element) => element.tagName)).toBe("H2");
  await expect(page.locator(".ss-impact-choice")).toHaveText(`Kelas memilih ${choice.id}.`);
  await expect(page.locator(".ss-impact-label")).toHaveText(LABELS);
  expect(await page.locator(".ss-impact-label").evaluateAll((all) => all.map((element) => element.tagName))).toEqual(["H3", "H3", "H3", "H3"]);
  await expect(page.locator(".ss-impact-terjadi")).toHaveText(choice.impact.terjadi);
  await expect(page.locator(".ss-impact-text")).toHaveText([choice.impact.hak, choice.impact.kewajiban]);
  await expect(page.locator(".ss-impact-refs li")).toHaveText(choice.impact.rujukan.map((reference) => reference.text));
  await expect(cardNext(page)).toHaveText("Lanjut");
  await expect(live(page)).toHaveText(impactAnnouncement(choice, before, after));
  await expect(page.locator(".ss-play-panel > *")).toHaveCount(0);

  const m = await measureCard(page);
  const near = (actual: number, expected: number, what: string) => expect(Math.abs(actual - expected), `${note}: ${what}`).toBeLessThanOrEqual(1);
  near(m.card.left, m.frameLeft, "kiri kartu");
  near(m.card.top, 9.2 * m.u, "atas kartu");
  near(m.card.right, 2 * m.u, "jarak kanan kartu");
  near(m.card.bottom, 1.2 * m.u, "jarak bawah kartu");
  near(m.meters.left, 0, "kiri panel indikator");
  near(m.meters.top, 8 * m.u, "atas panel indikator");
  near(m.meters.width, m.frameLeft, "lebar panel indikator");
  near(m.meters.height, 52 * m.u, "tinggi panel indikator");
  expect(m.overflow.down, `${note}: luapan ke bawah`).toBeLessThanOrEqual(0);
  expect(m.overflow.side, `${note}: luapan ke samping`).toBe(0);
  expect(m.overflow.panel, `${note}: luapan panel indikator`).toEqual([0, 0]);
  for (const [name, expected] of [["terjadi", 3.6], ["text", 3.1], ["refs", 3.1], ["label", 2.5], ["title", 2.8], ["choice", 2.8]] as const) {
    expect(Math.abs(m.fonts[name] - expected), `${note}: huruf ${name}`).toBeLessThanOrEqual(0.05);
  }
  expect(m.fonts.titleFamily).toContain("Press Start 2P");
  expect(m.colors.head, `${note}: warna kepala`).toBe(TIER_BG[choice.tier]);
  expect(m.icon, `${note}: ikon tingkat`).toContain(`emote_${TIER_ICON[choice.tier]}-`);
  await expect(page.locator(".ss-impact-icon")).toHaveAttribute("aria-hidden", "true");
  expect(m.iconSize).toEqual([16 * px, 16 * px]);
  expect([m.colors.title, m.colors.choice, m.colors.label[0], ...m.colors.body]).toEqual([INK, INK, DUSK, INK, INK, INK]);
  for (const fg of [m.colors.title, m.colors.choice]) expect(contrast(fg, m.colors.head)).toBeGreaterThanOrEqual(4.5);
  for (const fg of [m.colors.label[0], ...m.colors.body]) expect(contrast(fg, m.colors.label[1])).toBeGreaterThanOrEqual(4.5);
  for (const fg of [m.colors.meterLabel, m.colors.meterValue]) expect(contrast(fg, m.colors.screen)).toBeGreaterThanOrEqual(4.5);
}

/** Memeriksa kedua angka melayang: teks efek naskah, huruf, warna, dan animasi. */
async function checkDeltas(page: Page, choice: Choice) {
  const deltas = await page.locator(".ss-meter-delta").evaluateAll((all) =>
    all.map((element) => {
      const style = getComputedStyle(element);
      return {
        text: element.textContent,
        arah: element.getAttribute("data-arah"),
        bg: style.backgroundColor,
        fg: style.color,
        family: style.fontFamily,
        animation: [style.animationName, style.animationDuration, style.animationTimingFunction],
      };
    }),
  );
  const keys = ["hak", "kewajiban"] as const;
  expect(deltas.map((d) => d.text)).toEqual(keys.map((key) => effectText(choice.effects[key])));
  for (const [index, key] of keys.entries()) {
    const arah = effectDirection(choice.effects[key]);
    expect(deltas[index].arah).toBe(arah);
    expect(deltas[index].bg).toBe(DELTA_BG[arah]);
    expect(deltas[index].fg).toBe(INK);
    expect(contrast(deltas[index].fg, deltas[index].bg)).toBeGreaterThanOrEqual(4.5);
    expect(deltas[index].family).toContain("Pixelify Sans");
    expect(deltas[index].animation).toEqual(["ss-delta-rise", "0.24s", "steps(2)"]);
  }
}

// Empat ukuran: ke-18 kartu lewat jalur semua A, semua B, dan semua C, dengan gerak aktif dan jam dijeda.
// Satu uji per ukuran dan jalur, agar setiap uji singkat.
for (const size of Object.keys(VIEWPORTS) as ViewportName[]) {
  for (const id of ["A", "B", "C"] as const) {
  test(`kartu dan indikator di ${size}, jalur semua ${id}: isi, nilai, letak, dan kontras (AC-1–AC-3, AC-5–AC-7, AC-12–AC-14)`, async ({ page }) => {
    const log = watch(page);
    const { px } = VIEWPORTS[size];

    // Panel indikator tidak tampil di layar kerangka dan pratinjau.
    await page.setViewportSize({ width: VIEWPORTS[size].width, height: VIEWPORTS[size].height });
    await page.goto("sehari-setara/");
    await expect(page.locator(".ss-placeholder")).toBeVisible();
    await expect(page.locator(".ss-meters")).toHaveCount(0);
    await page.goto("sehari-setara/#adegan-1");
    await expect(page.locator("#ss-preview-title")).toBeVisible();
    await expect(page.locator(".ss-meters")).toHaveCount(0);

    await openPlay(page, size, false);
    // Panel indikator di layar pertama: grup bernama, dua meter, label satu baris, ukuran ikon dan batang.
    await expect(page.getByRole("group", { name: "Indikator" })).toHaveCount(1);
    await expect(page.getByRole("meter")).toHaveCount(2);
    await expect(page.locator(".ss-meter-name")).toHaveText(["Hak orang lain terjaga", "Kewajiban dijalankan"]);
    const panel = await page.evaluate(() => {
      const u = (document.querySelector(".ss-screen") as Element).getBoundingClientRect().height / 100;
      const box = (selector: string) => [...document.querySelectorAll(selector)].map((element) => [element.getBoundingClientRect().width, element.getBoundingClientRect().height]);
      return {
        u,
        names: box(".ss-meter-name").map(([, height]) => height),
        icons: box(".ss-meter-icon"),
        bars: box(".ss-meter-bar"),
        segs: box(".ss-meter-seg"),
        hidden: [...document.querySelectorAll(".ss-meter-row, .ss-meter-icon")].every((element) => element.getAttribute("aria-hidden") === "true"),
        meter: [...document.querySelectorAll(".ss-meter")].map((element) => [element.getAttribute("role"), element.getAttribute("aria-valuemin"), element.getAttribute("aria-valuemax")]),
        icon: [...document.querySelectorAll(".ss-meter-icon")].map((element) => getComputedStyle(element).backgroundImage),
      };
    });
    for (const height of panel.names) expect(height).toBeLessThanOrEqual(2.5 * 1.3 * panel.u + 1);
    expect(panel.icons).toEqual([[16 * px, 16 * px], [16 * px, 16 * px]]);
    expect(panel.bars).toEqual([[71 * px, 12 * px], [71 * px, 12 * px]]);
    expect(panel.segs).toHaveLength(20);
    for (const seg of panel.segs) expect(seg).toEqual([6 * px, 10 * px]);
    expect(panel.hidden).toBe(true);
    expect(panel.meter).toEqual([["meter", "0", "100"], ["meter", "0", "100"]]);
    expect(panel.icon[0]).toContain("ui_hak-");
    expect(panel.icon[1]).toContain("ui_kewajiban-");
    await expectMeters(page, { hak: 50, kewajiban: 50 }, "awal");

    {
      const path = SCENES.map(() => id);
      for (let i = 0; i < SCENES.length; i++) {
        const choice = choiceOf(i, id);
        const before = metersFromHistory(historyOf(path, i), SCENES);
        const after = metersFromHistory(historyOf(path, i + 1), SCENES);
        expect(metersBefore(historyOf(path, i + 1), SCENES, SCENES[i].id)).toEqual(before);
        await expect(counter(page)).toHaveText(`Adegan ${i + 1}/6`);
        await expectMeters(page, before, `jalur ${id}, narasi adegan ${i + 1}`);
        await toQuestion(page);
        await expectMeters(page, before, `jalur ${id}, pilihan adegan ${i + 1}`);
        await page.keyboard.press(id);
        await expect(page.locator(".ss-status")).toHaveText(`Kelas memilih ${id}.`);
        await expectMeters(page, before, `jalur ${id}, reaksi adegan ${i + 1}`);
        if (size === "1280x720" && id === "B" && i === 0) {
          await waitImages(page);
          await page.screenshot({ path: `${SHOTS}/indikator_reaksi_adegan_1_1280x720.png` });
        }
        await page.clock.runFor(1200);
        await expect(title(page)).toBeFocused();
        await expectMeters(page, before, `jalur ${id}, kartu adegan ${i + 1} pada 0 ms`);
        await page.clock.runFor(600);
        await expectMeters(page, after, `jalur ${id}, kartu adegan ${i + 1} sesudah gerak`);
        await checkCard(page, i, choice, before, after, px);
        await checkDeltas(page, choice);
        if (id === "B" && i === 0) {
          // Segmen separuh: 3p kiri berwarna indikator (kewajiban 65 sesudah adegan 1 pilihan B).
          const half = await page.locator('.ss-meter[data-meter="kewajiban"] .ss-meter-seg[data-isi="separuh"]').evaluate((element) => getComputedStyle(element).backgroundImage);
          expect(half).toContain(METER_COLOR.kewajiban);
          expect(half).toContain("50%");
        }
        // Angka melayang pertama tidak bertumpuk dengan label indikator kedua.
        const gap = await page.evaluate(() => {
          const delta = (document.querySelector(".ss-meter-delta") as Element).getBoundingClientRect();
          const label = (document.querySelectorAll(".ss-meter-label")[1] as Element).getBoundingClientRect();
          return label.top - delta.bottom;
        });
        expect(gap).toBeGreaterThanOrEqual(0);
        const shot =
          (id === "B" && i === 4 && size !== "1366x768" && `kartu_tepat_adegan_5b_${size}.png`) ||
          (size === "1280x720" && id === "A" && i === 1 && "kartu_berisiko_adegan_2a_1280x720.png") ||
          (size === "1280x720" && id === "C" && i === 2 && "kartu_kurang_adegan_3c_1280x720.png");
        if (shot) {
          await waitImages(page);
          await page.screenshot({ path: `${SHOTS}/${shot}` });
        }
        await page.keyboard.press("Enter");
        await expect(impactCard(page)).toHaveCount(0);
        await expect(page.locator(".ss-meter-delta")).toHaveCount(0);
        if (SCENES[i].roleQuiz) await answerQuiz(page, true);
        await giveStars(page);
        // Adegan 6 langsung ke layar akhir sementara; adegan lain berganti lewat sapuan dengan nilai sesudah.
        if (i < SCENES.length - 1) await expectMeters(page, after, `jalur ${id}, pergantian sesudah adegan ${i + 1}`);
        await page.clock.runFor(400);
      }
      const end = page.locator(".ss-play-end");
      await expect(end.locator("h1")).toBeFocused();
      await expect(page.locator(".ss-meters")).toHaveCount(0);
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      await expect(page.locator(".ss-narration .ss-next")).toBeFocused();
      await expectMeters(page, { hak: 50, kewajiban: 50 }, "main lagi");
    }
    expectClean(log);
  });
  }
}

test("gerak indikator per 100 ms bersama kartu (AC-4)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, "1280x720", false);
  const path: ChoiceId[] = ["A", "C", "B"];
  for (let i = 0; i < path.length; i++) {
    const choice = choiceOf(i, path[i]);
    const before = metersFromHistory(historyOf(path, i), SCENES);
    const after = metersFromHistory(historyOf(path, i + 1), SCENES);
    await toQuestion(page);
    await page.keyboard.press(path[i]);
    // Kartu tampil tepat 1.200 ms sesudah memilih.
    await page.clock.runFor(1150);
    await expect(impactCard(page)).toHaveCount(0);
    await page.clock.runFor(50);
    await expect(title(page)).toBeFocused();
    await checkDeltas(page, choice);
    for (const ms of [0, 100, 200, 300, 400, 500]) {
      if (ms > 0) await page.clock.runFor(100);
      await expectMeters(
        page,
        { hak: meterValueAt(before.hak, after.hak, ms), kewajiban: meterValueAt(before.kewajiban, after.kewajiban, ms) },
        `adegan ${i + 1} pada ${ms} ms`,
      );
    }
    await page.clock.runFor(100);
    await page.keyboard.press("Space");
    await giveStars(page);
    await page.clock.runFor(400);
  }
  await expect(counter(page)).toHaveText("Adegan 4/6");
  expectClean(log);
});

test("fokus, dialog, keyboard, dan pengaman tekanan ganda (AC-8, AC-9, AC-10)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, "1280x720", true);

  // Adegan 1: masa tunggu 600 ms, fokus terkunci di kartu, tombol lain tidak berpengaruh.
  await toQuestion(page);
  await page.keyboard.press("B");
  await page.clock.runFor(1200);
  await expect(title(page)).toBeFocused();
  await expect(cardNext(page)).toHaveAttribute("aria-disabled", "true");
  await page.clock.runFor(599);
  // Klik selama masa tunggu: force melewati pemeriksaan Playwright untuk tombol ber-aria-disabled.
  await cardNext(page).click({ force: true });
  await page.keyboard.press("Space");
  await page.keyboard.press("Enter");
  for (const key of ["Escape", "1", "b"]) await page.keyboard.press(key);
  await expect(impactCard(page)).toBeVisible();
  await expect(cardNext(page)).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Tab");
  await expect(cardNext(page)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(cardNext(page)).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(cardNext(page)).toBeFocused();
  await page.clock.runFor(1);
  await expect(cardNext(page)).not.toHaveAttribute("aria-disabled", /.*/);
  // Dua Enter cepat pada tombol hanya memajukan satu adegan; fokus pindah ke tombol narasi adegan 2.
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await giveStars(page);
  await page.clock.runFor(150);
  await expect(counter(page)).toHaveText("Adegan 2/6");
  await expect(page.locator(".ss-narration .ss-next")).toBeFocused();
  await page.clock.runFor(500);
  await expect(counter(page)).toHaveText("Adegan 2/6");

  // Adegan 2: tekan Spasi pada 600 ms tepat (fokus di judul) melanjutkan. Jam dimajukan sesudah kartu tampil,
  // karena masa tunggu dihitung sejak kartu benar-benar tampil.
  await toQuestion(page);
  await page.keyboard.press("C");
  await page.clock.runFor(1200);
  await expect(title(page)).toBeFocused();
  await page.clock.runFor(600);
  await page.keyboard.press("Space");
  await giveStars(page);
  await page.clock.runFor(150);
  await expect(counter(page)).toHaveText("Adegan 3/6");

  // Adegan 3: Spasi yang ditahan sejak reaksi (repeat) tidak melewati kartu; klik ganda hanya satu adegan.
  await toQuestion(page);
  await page.keyboard.press("A");
  await page.keyboard.down(" ");
  await page.clock.runFor(1200);
  await expect(title(page)).toBeFocused();
  await page.clock.runFor(600);
  await page.keyboard.down(" ");
  await page.keyboard.up(" ");
  await expect(impactCard(page)).toBeVisible();
  await expect(counter(page)).toHaveText("Adegan 3/6");
  await cardNext(page).dblclick();
  // Klik kedua jatuh di ruang kosong panel bawah, jadi bintang diberikan dengan tombol 1 tanpa bergantung pada fokus (F-07).
  await expect(awardPrompt(page)).toBeVisible();
  await expect(counter(page)).toHaveText("Adegan 3/6");
  await page.keyboard.press("1");
  await page.clock.runFor(150);
  await expect(counter(page)).toHaveText("Adegan 4/6");
  await page.clock.runFor(500);
  await expect(counter(page)).toHaveText("Adegan 4/6");

  // Adegan 4 sampai 6: selama kartu, kuis belum tampil dan baris status tanpa tombol. Kuis peran tampil sesudah Lanjut
  // kartu adegan 5 (F-08), lalu layar akhir sementara.
  for (let i = 3; i < SCENES.length; i++) {
    await toQuestion(page);
    await page.keyboard.press("B");
    await page.clock.runFor(1200);
    await expect(statusRowButtons(page)).toHaveCount(0);
    await expect(page.locator('[role="dialog"]')).toHaveCount(1);
    for (const role of ["Polisi", "Jaksa", "Advokat", "Hakim"]) await expect(page.getByText(role, { exact: true })).toHaveCount(0);
    await page.clock.runFor(600);
    await page.keyboard.press("Enter");
    if (SCENES[i].roleQuiz) {
      await expect(page.getByRole("dialog", { name: "Kuis peran" })).toBeVisible();
      await expect(page.locator('[role="dialog"]')).toHaveCount(1);
      await answerQuiz(page, true);
    }
    await giveStars(page);
    await page.clock.runFor(150);
  }
  await expect(page.locator(".ss-play-end h1")).toBeFocused();
  expectClean(log);
});

test("kurangi gerak: nilai langsung, tanpa angka melayang, masa tunggu tetap (AC-11, AC-12)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, "1280x720", true);
  const choice = choiceOf(0, "A");
  await toQuestion(page);
  await page.keyboard.press("A");
  await page.clock.runFor(1200);
  await expect(title(page)).toBeFocused();
  await expectMeters(page, { hak: 40, kewajiban: 35 }, "kartu kurangi gerak pada 0 ms");
  await expect(page.locator(".ss-meter-delta")).toHaveCount(0);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await expect(live(page)).toHaveText(impactAnnouncement(choice, { hak: 50, kewajiban: 50 }, { hak: 40, kewajiban: 35 }));
  await waitImages(page);
  await page.screenshot({ path: `${SHOTS}/kartu_kurangi_gerak_1280x720.png` });
  await page.clock.runFor(599);
  await page.keyboard.press("Space");
  await expect(impactCard(page)).toBeVisible();
  await page.clock.runFor(1);
  await page.keyboard.press("Space");
  await giveStars(page);
  await page.clock.runFor(150);
  await expect(counter(page)).toHaveText("Adegan 2/6");
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await expect(page.locator(".ss-meter")).toHaveCount(2);
  expect(await page.locator(".ss-screen").evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(CREAM);
  expectClean(log);
});
