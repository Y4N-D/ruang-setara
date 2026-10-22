// Uji ujung ke ujung layar permainan Sehari Setara (spesifikasi F-05, Rencana uji langkah 3 dan 4).
// Membuka hasil build di /ruang-setara/sehari-setara/#main lewat serve-subpath.mjs, seperti alamat GitHub Pages.
import { expect, test, type Page } from "@playwright/test";
import { SCENES } from "../app/sehari-setara/content/scenes";
import { choiceText, narrationFor } from "../app/sehari-setara/engine/rules";
import type { CastSlot, ChoiceId, Flag } from "../app/sehari-setara/engine/types";
import { WIPE, wipeSchedule } from "../app/sehari-setara/ui/controls";
import {
  contrast,
  CREAM,
  EMOTES,
  expectClean,
  INK,
  measureStage,
  SHOTS,
  SUN,
  VIEWPORTS,
  watch,
  type ViewportName,
} from "./bantuan";

const MIST = "rgb(201, 212, 229)";
const DUSK = "rgb(58, 74, 107)";
const SKY: Record<string, string> = {
  pagi: "rgb(255, 217, 168)",
  siang: "rgb(110, 198, 242)",
  sore: "rgb(255, 194, 122)",
  malam: "rgb(74, 79, 156)",
};

type Run = { ssTekan?: number; ssMuncul?: number };

/** Waktu awal jam uji. Jam palsu Playwright tetap berjalan sampai dijeda, jadi uji yang mengatur waktu menjedanya. */
const T0 = new Date("2026-10-22T08:00:00+08:00").getTime();

/** Menjeda jam uji sesudah halaman termuat; sesudahnya waktu hanya maju lewat page.clock.runFor. */
async function pauseClock(page: Page) {
  await page.clock.pauseAt(T0 + 60_000);
}

const live = (page: Page) => page.locator('.ss-play [aria-live="polite"]');
const narrationNext = (page: Page) => page.locator(".ss-narration .ss-next");
const bridgeNext = (page: Page) => page.locator(".ss-question-row .ss-next");

async function openPlay(page: Page, size: ViewportName = "1280x720", reduce = true) {
  const { width, height } = VIEWPORTS[size];
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: reduce ? "reduce" : "no-preference" });
  await page.goto("sehari-setara/#main");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".ss-narration")).toBeVisible();
}

/** Menunggu semua gambar panggung dan bilah atas termuat, tanpa requestAnimationFrame (aman dengan jam uji). */
async function waitImages(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const urls = [...document.querySelectorAll<HTMLElement>(".ss-stage-bg, .ss-sprite, .ss-emote")]
      .map((element) => /url\("(.*)"\)/.exec(getComputedStyle(element).backgroundImage)?.[1] ?? "")
      .concat([...document.querySelectorAll("image.ss-dayarc-icon")].map((element) => (element as SVGImageElement).href.baseVal));
    await Promise.all(
      urls.map((url) => {
        const image = new Image();
        image.src = url;
        return image.decode();
      }),
    );
  });
}

/** Menjalani layar narasi satu adegan dengan Spasi; teks sudah lengkap karena kurangi gerak aktif. */
async function readNarration(page: Page, sceneIndex: number, flags: Flag[]) {
  const scene = SCENES[sceneIndex];
  const screens = narrationFor(scene, flags);
  for (let i = 0; i < screens.length; i++) {
    await expect(page.locator(".ss-narration-tab")).toHaveText(scene.title);
    await expect(live(page)).toHaveText(screens[i]);
    await expect(page.locator(".ss-narration-text")).toHaveText(screens[i]);
    await expect(page.locator(".ss-narration-rest")).toHaveText("");
    await expect(narrationNext(page)).toHaveText(i === screens.length - 1 ? "Tampilkan pilihan" : "Lanjut");
    await expect(narrationNext(page)).toBeFocused();
    await page.keyboard.press("Space");
  }
  await expect(page.locator(".ss-question")).toHaveText(scene.question);
  await expect(page.locator(".ss-question")).toBeFocused();
}

/** Memeriksa susunan tokoh, posisi, dan ikon emosi panggung dengan rumus F-04. */
async function checkStage(page: Page, cast: CastSlot[], emoteKey?: string) {
  const stage = await measureStage(page);
  const k = stage.frame.width / 320;
  const near = (actual: number, expected: number) => expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
  expect(stage.sprites.map((s) => `${s.char}.${s.pose}`)).toEqual(cast.map((slot) => `${slot.char}.${slot.pose}`));
  cast.forEach((slot, i) => {
    const sprite = stage.sprites[i];
    const w = Math.round(sprite.width / k);
    near(sprite.top + sprite.height, 157 * k);
    near(sprite.left, (slot.x - Math.floor(w / 2)) * k);
  });
  if (emoteKey) {
    const [icon, left, top] = EMOTES[emoteKey];
    expect(stage.emote?.icon).toBe(icon);
    near((stage.emote?.left ?? Number.NaN) / k, left);
    near((stage.emote?.top ?? Number.NaN) / k, top);
  } else {
    expect(stage.emote).toBeNull();
  }
  return stage;
}

/** Memeriksa layar sesudah memilih: status, kunci tombol, panggung reaksi, dan label panggung. */
async function checkChosen(page: Page, sceneIndex: number, choiceId: ChoiceId) {
  const scene = SCENES[sceneIndex];
  const choice = scene.choices.find((c) => c.id === choiceId);
  if (!choice) throw new Error(`pilihan ${choiceId} tidak ada`);
  await expect(page.locator(".ss-status")).toHaveText(`Kelas memilih ${choiceId}.`);
  for (const c of scene.choices) {
    const button = page.locator(`.ss-choice[data-choice="${c.id}"]`);
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("data-state", c.id === choiceId ? "dipilih" : "nonaktif");
  }
  const stage = await checkStage(page, choice.reaction, `${sceneIndex + 1}-${choiceId.toLowerCase()}`);
  expect(stage.label).toBe(`${scene.altText} Reaksi tokoh atas pilihan ${choiceId}.`);
}

/** Main dari adegan yang sedang tampil sampai layar akhir sementara, hanya dengan keyboard. */
async function playPath(page: Page, path: ChoiceId[], shots?: { bridgeS4?: string; discussS5?: string }) {
  const flags: Flag[] = [];
  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    await expect(page.locator(".ss-topbar-counter")).toHaveText(`Adegan ${i + 1}/6`);
    await expect(page.locator("#ss-play-title")).toHaveText(`Adegan ${i + 1}: ${scene.title}`);
    await checkStage(page, scene.cast);
    await readNarration(page, i, flags);
    const texts = scene.choices.map((c) => `Pilihan ${c.id}: ${choiceText(c, flags)}`);
    await expect(page.locator(".ss-choice-text")).toHaveText(texts);
    await expect(page.locator(".ss-choice-key")).toHaveText(["A", "B", "C"]);
    if (i === 4 && shots?.discussS5) {
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await expect(page.locator('.ss-choice[data-choice="B"]')).toBeFocused();
      await page.screenshot({ path: `${SHOTS}/${shots.discussS5}` });
    }
    await page.keyboard.press(path[i]);
    await checkChosen(page, i, path[i]);
    if (i === 3 && path[i] === "B") flags.push("komangDibela");
    await expect(bridgeNext(page)).toBeVisible({ timeout: 3000 });
    await expect(bridgeNext(page)).toBeFocused();
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    if (i === 3 && shots?.bridgeS4) await page.screenshot({ path: `${SHOTS}/${shots.bridgeS4}` });
    await page.keyboard.press("Enter");
  }
  await expect(page.locator(".ss-play-end h1")).toHaveText("Keenam adegan selesai");
}

/** Dari layar pertama adegan 1 ke pertanyaannya (kurangi gerak aktif). */
async function toQuestion(page: Page) {
  await page.keyboard.press("Space");
  await page.keyboard.press("Space");
  await expect(page.locator(".ss-question")).toBeFocused();
}

test("layar kerangka: tombol ketiga, masuk dan keluar layar permainan (AC-1)", async ({ page }) => {
  const log = watch(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("sehari-setara/");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    (window as unknown as { ssPenanda: number }).ssPenanda = 1;
  });
  const links = page.locator(".ss-placeholder-actions a");
  await expect(links).toHaveText(["Kembali ke galeri", "Lihat pratinjau panggung", "Coba alur permainan"]);
  expect(await links.evaluateAll((all) => all.map((a) => a.getAttribute("href")))).toEqual(["../", "#adegan-1", "#main"]);
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveText("Kembali ke galeri");

  await page.getByRole("link", { name: "Coba alur permainan" }).click();
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator(".ss-narration-tab")).toHaveText(SCENES[0].title);
  await expect(live(page)).toHaveText(SCENES[0].narration[0]);
  await expect(narrationNext(page)).toBeFocused();
  await toQuestion(page);

  await page.goBack();
  await expect(page.locator(".ss-placeholder")).toBeVisible();
  await expect(page.getByRole("link", { name: "Coba alur permainan" })).toBeFocused();
  expect(await page.evaluate(() => (window as unknown as { ssPenanda?: number }).ssPenanda)).toBe(1);

  // Membuka #main lagi dan memuat ulang halaman selalu mulai dari layar narasi 1 adegan 1.
  await page.goForward();
  await expect(live(page)).toHaveText(SCENES[0].narration[0]);
  await expect(page.locator(".ss-narration .ss-next")).toHaveText("Lanjut");
  await toQuestion(page);
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await expect(live(page)).toHaveText(SCENES[0].narration[0]);
  await expect(narrationNext(page)).toBeFocused();

  // Pratinjau dan alamat lain tetap seperti F-04.
  await page.evaluate(() => {
    window.location.hash = "#adegan-2";
  });
  await expect(page.locator("#ss-preview-title")).toHaveText(SCENES[1].title);
  await expect(page.locator("#ss-preview-title")).toBeFocused();
  for (const hash of ["#lain", "#mainkan", "#Main", ""]) {
    await page.evaluate((target) => {
      window.location.hash = target;
    }, hash);
    await expect(page.locator(".ss-placeholder")).toBeVisible();
  }
  expectClean(log);
});

test("kotak narasi: teks per huruf, Spasi, Enter, klik, dan wilayah aria-live (AC-2)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, "1280x720", false);
  const rest = page.locator(".ss-narration-rest");
  expect((await rest.textContent())?.length ?? 0).toBeGreaterThan(0);
  await expect(narrationNext(page)).toHaveText("Lanjut");
  await expect(live(page)).toHaveText(SCENES[0].narration[0]);

  // Spasi pertama menampilkan seluruh teks tanpa berganti layar; Spasi berikutnya berganti layar.
  await page.keyboard.press("Space");
  await expect(rest).toHaveText("");
  await expect(narrationNext(page)).toHaveText("Lanjut");
  await expect(live(page)).toHaveText(SCENES[0].narration[0]);
  await page.keyboard.press("Space");
  await expect(live(page)).toHaveText(SCENES[0].narration[1]);
  await expect(narrationNext(page)).toHaveText("Tampilkan pilihan");
  expect((await rest.textContent())?.length ?? 0).toBeGreaterThan(0);

  // Klik di kotak narasi (bukan tombol) sama dengan satu kali tombol lanjut.
  const box = await page.locator(".ss-narration").boundingBox();
  if (!box) throw new Error("kotak narasi tidak ada");
  await page.mouse.click(box.x + 30, box.y + box.height - 20);
  await expect(rest).toHaveText("");
  await expect(narrationNext(page)).toHaveText("Tampilkan pilihan");
  // Fokus kini tidak di tombol; Enter di mana saja juga berarti lanjut.
  await page.keyboard.press("Enter");
  await expect(page.locator(".ss-question")).toHaveText(SCENES[0].question);

  // Klik pada tombol lanjut di dalam kotak dihitung sekali: dari layar 1 ke layar 2, bukan ke pertanyaan.
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await expect(rest).toHaveText("", { timeout: 5000 });
  await narrationNext(page).click();
  await expect(live(page)).toHaveText(SCENES[0].narration[1]);
  await expect(page.locator(".ss-question")).toHaveCount(0);
  expectClean(log);
});

test("pilihan: teks, fokus, status tombol, dan aturan keyboard (AC-3, AC-4, AC-10)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page);
  await toQuestion(page);
  const scene = SCENES[0];
  for (const choice of scene.choices) {
    await expect(page.getByRole("button", { name: `Pilihan ${choice.id}: ${choice.text}` })).toBeEnabled();
  }
  const choice = (id: ChoiceId) => page.locator(`.ss-choice[data-choice="${id}"]`);
  const style = (id: ChoiceId) =>
    choice(id).evaluate((element) => ({
      bg: getComputedStyle(element).backgroundColor,
      fg: getComputedStyle(element).color,
      cursor: getComputedStyle(element, "::before").visibility,
      ring: getComputedStyle(element).boxShadow,
      keyBg: getComputedStyle(element.querySelector(".ss-choice-key") as Element).backgroundColor,
      keyFg: getComputedStyle(element.querySelector(".ss-choice-key") as Element).color,
      width: element.getBoundingClientRect().width,
    }));
  const plainB = await style("B");
  await page.keyboard.press("Tab");
  await expect(choice("A")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(choice("B")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(choice("C")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(choice("B")).toBeFocused();
  const focusedB = await style("B");
  expect([focusedB.bg, focusedB.cursor]).toEqual([SUN, "visible"]);
  expect((await style("A")).bg).toBe(CREAM);
  expect((await style("A")).cursor).toBe("hidden");
  expect(focusedB.width).toBe(plainB.width);

  // Kombinasi Ctrl/Alt/Meta, tekanan berulang, dan tombol lain tidak memilih.
  for (const combo of ["Control+2", "Alt+2", "Meta+2", "4", "d", "Escape"]) await page.keyboard.press(combo);
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "2", repeat: true, bubbles: true }));
  });
  await expect(page.locator(".ss-question")).toHaveText(scene.question);
  await expect(page.locator(".ss-status")).toHaveCount(0);

  // Spasi pada tombol pilihan yang berfokus memilih tepat satu kali.
  await page.keyboard.press("Space");
  await checkChosen(page, 0, "B");
  await page.keyboard.press("3");
  await choice("C").click({ force: true });
  await expect(page.locator(".ss-status")).toHaveText("Kelas memilih B.");
  const chosenB = await style("B");
  expect([chosenB.bg, chosenB.ring]).toEqual([SUN, `${INK} 0px 0px 0px 4px inset`]);
  for (const id of ["A", "C"] as const) {
    const s = await style(id);
    expect([s.bg, s.fg, s.keyBg, s.keyFg]).toEqual([MIST, DUSK, DUSK, CREAM]);
  }
  expect(await page.evaluate(() => [window.scrollX, window.scrollY])).toEqual([0, 0]);

  // Setiap cara memilih diuji sekali, masing-masing di permainan baru.
  const ways: Array<[string, ChoiceId]> = [
    ["klik", "A"],
    ["enter", "C"],
    ["1", "A"],
    ["2", "B"],
    ["3", "C"],
    ["a", "A"],
    ["b", "B"],
    ["c", "C"],
    ["A", "A"],
    ["B", "B"],
    ["C", "C"],
  ];
  for (const [way, expected] of ways) {
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    await toQuestion(page);
    if (way === "klik") await choice("A").click();
    else if (way === "enter") {
      for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
      await expect(choice("C")).toBeFocused();
      await page.keyboard.press("Enter");
    } else await page.keyboard.press(way);
    await expect(page.locator(".ss-status")).toHaveText(`Kelas memilih ${expected}.`);
  }
  expectClean(log);
});

test("reaksi dan jembatan: 1,2 detik, sekali per adegan, tanpa kuis (AC-5, AC-6)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page);
  await toQuestion(page);
  await page.evaluate(() => {
    const run = window as unknown as Run;
    window.addEventListener("keydown", () => (run.ssTekan = performance.now()), { capture: true, once: true });
    new MutationObserver(() => {
      if (!run.ssMuncul && document.querySelector(".ss-question-row .ss-next")) run.ssMuncul = performance.now();
    }).observe(document.body, { childList: true, subtree: true });
  });
  await page.keyboard.press("2");
  await checkChosen(page, 0, "B");
  await expect(bridgeNext(page)).toBeVisible({ timeout: 3000 });
  await expect(bridgeNext(page)).toBeFocused();
  const waited = await page.evaluate(() => {
    const run = window as unknown as Run;
    return (run.ssMuncul ?? 0) - (run.ssTekan ?? 0);
  });
  expect(waited).toBeGreaterThanOrEqual(1150);
  expect(waited).toBeLessThanOrEqual(1600);

  // Klik ganda hanya memajukan satu adegan.
  await bridgeNext(page).dblclick();
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 2/6");
  await expect(narrationNext(page)).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 2/6");
  await expect(live(page)).toHaveText(SCENES[1].narration[0]);

  // Dua kali Enter dengan cepat juga hanya memajukan satu adegan.
  await readNarration(page, 1, []);
  await page.keyboard.press("2");
  await expect(bridgeNext(page)).toBeFocused({ timeout: 3000 });
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 3/6");
  await page.waitForTimeout(500);
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 3/6");
  await expect(page.locator(".ss-narration")).toBeVisible();

  // Adegan 3 dan 4 dengan B, lalu adegan 5: kuis peran tidak tampil.
  for (const i of [2, 3]) {
    await readNarration(page, i, []);
    await page.keyboard.press("B");
    await expect(bridgeNext(page)).toBeFocused({ timeout: 3000 });
    await page.keyboard.press("Enter");
  }
  await readNarration(page, 4, []);
  await page.keyboard.press("b");
  await expect(bridgeNext(page)).toBeFocused({ timeout: 3000 });
  for (const role of ["Polisi", "Jaksa", "Advokat", "Hakim"]) await expect(page.getByText(role, { exact: true })).toHaveCount(0);
  await page.keyboard.press("Enter");
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 6/6");
  expectClean(log);
});

test("sapuan blok piksel pada 100 ms dan 300 ms (AC-7)", async ({ page }) => {
  const log = watch(page);
  await page.clock.install({ time: T0 });
  await openPlay(page, "1280x720", false);
  await pauseClock(page);
  // Adegan 1: setiap Spasi menampilkan seluruh teks atau berlanjut, sampai pertanyaan tampil.
  while ((await page.locator(".ss-question").count()) === 0) await page.keyboard.press("Space");
  await page.keyboard.press("2");
  await page.clock.runFor(1200);
  await expect(bridgeNext(page)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".ss-wipe")).toHaveAttribute("data-time", "pagi");
  await page.clock.runFor(400);
  await expect(page.locator(".ss-wipe")).toHaveCount(0);
  await expect(page.locator(".ss-narration-tab")).toHaveText(SCENES[1].title);

  // Adegan 2 ke 3: lapisan sapuan dengan 144 blok sesuai jadwal. Teks per huruf berhenti karena jam dijeda.
  for (let i = 0; i < 2; i++) await page.keyboard.press("Space");
  await expect(page.locator(".ss-question")).toBeVisible();
  await page.keyboard.press("2");
  await page.clock.runFor(1200);
  await expect(bridgeNext(page)).toBeFocused();
  await page.keyboard.press("Enter");
  const wipe = page.locator(".ss-wipe");
  await expect(wipe).toHaveAttribute("data-time", "siang");
  await expect(page.locator(".ss-play-panel > *")).toHaveCount(0);
  const blocks = await page.locator(".ss-wipe-block").evaluateAll((all) =>
    all.map((element) => {
      const style = getComputedStyle(element);
      return {
        left: (element as HTMLElement).style.left,
        top: (element as HTMLElement).style.top,
        width: style.width,
        delay: style.animationDelay,
        duration: style.animationDuration,
        bg: style.backgroundColor,
      };
    }),
  );
  const schedule = wipeSchedule();
  expect(blocks).toHaveLength(144);
  expect(blocks).toEqual(
    schedule.map((b) => ({
      left: `${b.col * WIPE.block}px`,
      top: `${b.row * WIPE.block}px`,
      width: `${WIPE.block}px`,
      delay: `${b.delayMs / 1000}s`,
      duration: "0.24s",
      bg: SKY.siang,
    })),
  );

  const seek = async (t: number) => {
    await page.evaluate((time) => {
      for (const animation of document.getAnimations()) {
        animation.pause();
        animation.currentTime = time;
      }
    }, t);
    const visible = await page
      .locator(".ss-wipe-block")
      .evaluateAll((all) => all.map((element) => getComputedStyle(element).visibility === "visible"));
    expect(visible).toEqual(schedule.map((b) => b.delayMs <= t && t < b.delayMs + WIPE.showMs));
  };

  // 100 ms: adegan lama masih di balik blok; tombol tidak berpengaruh selama pergantian.
  await waitImages(page);
  await seek(100);
  expect((await measureStage(page)).background).toContain("bg_s2_jalan_pagi-");
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 2/6");
  await page.screenshot({ path: `${SHOTS}/sapuan_2_ke_3_100ms_1280x720.png` });
  for (const key of ["Space", "Enter", "1", "2"]) await page.keyboard.press(key);

  // 200 ms: LANJUT dikirim di balik blok; 300 ms: adegan baru terbuka dari kiri.
  await page.clock.runFor(200);
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 3/6");
  expect((await measureStage(page)).background).toContain("bg_s3_kelas_siang-");
  await expect(page.locator(".ss-play-panel > *")).toHaveCount(0);
  await waitImages(page);
  await seek(300);
  await page.screenshot({ path: `${SHOTS}/sapuan_2_ke_3_300ms_1280x720.png` });

  // 400 ms: lapisan hilang dan narasi adegan 3 tampil dari layar pertama.
  await page.clock.runFor(200);
  await expect(wipe).toHaveCount(0);
  await expect(page.locator(".ss-narration-tab")).toHaveText(SCENES[2].title);
  await expect(live(page)).toHaveText(SCENES[2].narration[0]);
  await expect(narrationNext(page)).toBeFocused();
  expectClean(log);
});

test("sapuan tepat waktu dan tanpa sapuan sesudah adegan 6 (AC-7)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, "1280x720", false);
  for (let i = 0; i < SCENES.length; i++) {
    // Teks per huruf: setiap Spasi menampilkan seluruh teks atau berlanjut, sampai pertanyaan tampil.
    while ((await page.locator(".ss-question").count()) === 0) {
      await page.keyboard.press("Space");
      await page.waitForTimeout(50);
    }
    await page.keyboard.press("C");
    await expect(bridgeNext(page)).toBeFocused({ timeout: 3000 });
    await page.evaluate(() => {
      const run = window as unknown as Run;
      run.ssMuncul = 0;
      window.addEventListener("keydown", () => (run.ssTekan = performance.now()), { capture: true, once: true });
      const observer = new MutationObserver(() => {
        if (!run.ssMuncul && document.querySelector(".ss-narration, .ss-play-end")) {
          run.ssMuncul = performance.now();
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
    await page.keyboard.press("Enter");
    if (i < SCENES.length - 1) {
      await expect(page.locator(".ss-wipe")).toHaveAttribute("data-time", SCENES[i + 1].timeOfDay);
      await expect(page.locator(".ss-narration")).toBeVisible();
      await expect(page.locator(".ss-wipe")).toHaveCount(0);
      const waited = await page.evaluate(() => {
        const run = window as unknown as Run;
        return (run.ssMuncul ?? 0) - (run.ssTekan ?? 0);
      });
      expect(waited).toBeGreaterThanOrEqual(390);
      expect(waited).toBeLessThanOrEqual(600);
    } else {
      await expect(page.locator(".ss-play-end")).toBeVisible();
      await expect(page.locator(".ss-wipe")).toHaveCount(0);
    }
  }
  expectClean(log);
});

test("kurangi gerak: teks langsung lengkap, pudar 75 + 75 ms, tanpa animasi lain (AC-8)", async ({ page }) => {
  const log = watch(page);
  await page.clock.install({ time: T0 });
  await openPlay(page);
  await pauseClock(page);
  await expect(page.locator(".ss-narration-rest")).toHaveText("");
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await toQuestion(page);
  await page.keyboard.press("2");
  await page.clock.runFor(1200);
  await expect(bridgeNext(page)).toBeFocused();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await page.keyboard.press("Enter");
  const holder = page.locator(".ss-stage-holder");
  const fade = () =>
    holder.evaluate((element) => [
      element.getAttribute("data-fade"),
      getComputedStyle(element).animationName,
      getComputedStyle(element).animationDuration,
    ]);
  await expect(holder).toHaveAttribute("data-fade", "keluar");
  expect(await fade()).toEqual(["keluar", "ss-fade-out", "0.075s"]);
  await expect(page.locator(".ss-wipe")).toHaveCount(0);
  await page.clock.runFor(75);
  await expect(holder).toHaveAttribute("data-fade", "masuk");
  expect(await fade()).toEqual(["masuk", "ss-fade-in", "0.075s"]);
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 2/6");
  await page.clock.runFor(75);
  await expect(holder).not.toHaveAttribute("data-fade", /.*/);
  await expect(page.locator(".ss-narration")).toBeVisible();
  await expect(page.locator(".ss-narration-rest")).toHaveText("");
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
  expectClean(log);
});

test("tiga jalur sampai akhir dengan keyboard, layar akhir sementara, dan main lagi (AC-9, AC-13, AC-14)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page);
  await waitImages(page);
  await page.screenshot({ path: `${SHOTS}/adegan_1_narasi_1280x720.png` });
  await playPath(page, ["B", "B", "B", "B", "B", "B"], { bridgeS4: "adegan_4_jembatan_b_1280x720.png" });

  // Layar akhir sementara.
  const end = page.locator(".ss-play-end");
  await expect(end.locator("h1")).toBeFocused();
  await expect(end.locator(".ss-placeholder-lead")).toHaveText("Terima kasih sudah menemani Nara sampai malam.");
  await expect(end.locator(".ss-placeholder-status")).toHaveText("Layar akhir, rekap, dan refleksi sedang dibuat.");
  await expect(end.locator("button")).toHaveText("Main lagi dari adegan 1");
  await expect(end.locator("a")).toHaveText("Kembali ke galeri");
  await expect(end.locator("a")).toHaveAttribute("href", "../");
  await page.screenshot({ path: `${SHOTS}/akhir_sementara_1280x720.png` });

  // Main lagi: permainan baru mulai bersih, sehingga varian adegan 6 mengikuti pilihan adegan 4 yang baru.
  for (const path of [["A", "A", "A", "A", "A", "A"], ["B", "B", "B", "C", "C", "C"]] as ChoiceId[][]) {
    await page.keyboard.press("Tab");
    await expect(end.locator("button")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(narrationNext(page)).toBeFocused();
    await expect(live(page)).toHaveText(SCENES[0].narration[0]);
    await playPath(page, path);
  }
  expectClean(log);
});

for (const size of Object.keys(VIEWPORTS) as ViewportName[]) {
  test(`tata letak, bingkai, dan kontras di ${size} (AC-11, AC-12, AC-13)`, async ({ page }) => {
    const log = watch(page);
    const { k, px } = VIEWPORTS[size];
    await page.clock.install({ time: T0 });

    // Layar kerangka dan pratinjau memakai bingkai yang sama.
    await page.setViewportSize({ width: VIEWPORTS[size].width, height: VIEWPORTS[size].height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("sehari-setara/");
    await page.evaluate(() => document.fonts.ready);
    await pauseClock(page);
    const border = (selector: string) =>
      page.locator(selector).first().evaluate((element) => getComputedStyle(element).borderTopWidth);
    expect(await border(".ss-button")).toBe(`${2 * px}px`);
    expect(await page.locator(".ss-screen").evaluate((element) => getComputedStyle(element).getPropertyValue("--ss-px").trim())).toBe(`${px}px`);
    await page.evaluate(() => {
      window.location.hash = "#adegan-3";
    });
    await expect(page.locator("#ss-preview-title")).toHaveText(SCENES[2].title);
    expect(await border(".ss-chip")).toBe(`${2 * px}px`);
    expect(await page.locator('.ss-chip[aria-current="page"]').first().evaluate((element) => getComputedStyle(element).boxShadow)).toBe(
      `${INK} 0px 0px 0px ${2 * px}px inset`,
    );

    // Layar permainan, dua kali main agar kedua varian adegan 6 ikut diperiksa.
    await page.evaluate(() => {
      window.location.hash = "#main";
    });
    for (const path of [["B", "B", "B", "B", "B", "B"], ["A", "A", "A", "A", "A", "A"]] as ChoiceId[][]) {
      for (let i = 0; i < SCENES.length; i++) {
        const box = await page.evaluate(() => {
          const rect = (selector: string) => {
            const element = document.querySelector(selector);
            if (!element) throw new Error(selector);
            return element.getBoundingClientRect();
          };
          return {
            screen: rect(".ss-screen").height,
            bar: rect(".ss-topbar").height,
            area: rect(".ss-stage-area").height,
            panel: rect(".ss-play-panel").height,
            frame: [rect(".ss-stage-frame").width, rect(".ss-stage-frame").height],
            page: [document.documentElement.scrollWidth - document.documentElement.clientWidth, document.documentElement.scrollHeight - document.documentElement.clientHeight],
          };
        });
        const u = box.screen / 100;
        expect(Math.abs(box.bar - 8 * u)).toBeLessThanOrEqual(1);
        expect(Math.abs(box.area - 52 * u)).toBeLessThanOrEqual(1);
        expect(Math.abs(box.panel - 40 * u)).toBeLessThanOrEqual(1);
        expect(Math.abs(box.frame[0] / 320 - k)).toBeLessThanOrEqual(0.005);
        expect(Math.abs(box.frame[1] - 180 * k)).toBeLessThanOrEqual(1);
        expect(box.page).toEqual([0, 0]);

        const overflow = () => page.locator(".ss-play-panel").evaluate((element) => element.scrollHeight - element.clientHeight);
        // Setiap layar narasi.
        while ((await page.locator(".ss-question").count()) === 0) {
          expect(await overflow()).toBeLessThanOrEqual(0);
          expect(await border(".ss-narration")).toBe(`${2 * px}px`);
          expect(await border(".ss-narration .ss-next")).toBe(`${2 * px}px`);
          const tab = await page.locator(".ss-narration-tab").evaluate((element) => [getComputedStyle(element).color, getComputedStyle(element).backgroundColor]);
          expect(tab).toEqual([CREAM, INK]);
          const firstScreen = (await live(page).textContent()) === SCENES[0].narration[0];
          if (i === 0 && firstScreen && path[0] === "B" && (size === "1280x720" || size === "1024x768")) {
            await waitImages(page);
            await page.screenshot({ path: `${SHOTS}/adegan_1_narasi_${size}.png` });
          }
          await page.keyboard.press("Space");
        }
        // Layar pilihan.
        expect(await overflow()).toBeLessThanOrEqual(0);
        expect(await border(".ss-choice")).toBe(`${2 * px}px`);
        const colors = await page.locator(".ss-choice").first().evaluate((element) => {
          const key = element.querySelector(".ss-choice-key") as Element;
          const question = document.querySelector(".ss-question") as Element;
          const screen = document.querySelector(".ss-screen") as Element;
          return {
            text: [getComputedStyle(element).color, getComputedStyle(element).backgroundColor],
            key: [getComputedStyle(key).color, getComputedStyle(key).backgroundColor],
            question: [getComputedStyle(question).color, getComputedStyle(screen).backgroundColor],
          };
        });
        for (const [fg, bg] of [colors.text, colors.key, colors.question]) expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
        expect(colors.question).toEqual([INK, CREAM]);
        if (i === 4 && path[0] === "B" && size !== "1366x768") {
          await page.keyboard.press("Tab");
          await page.keyboard.press("Tab");
          const focused = await page.locator('.ss-choice[data-choice="B"]').evaluate((element) => [getComputedStyle(element).color, getComputedStyle(element).backgroundColor]);
          expect(focused).toEqual([INK, SUN]);
          expect(contrast(focused[0], focused[1])).toBeGreaterThanOrEqual(4.5);
          await waitImages(page);
          await page.screenshot({ path: `${SHOTS}/adegan_5_pilihan_${size}.png` });
        }
        // Layar jembatan.
        await page.keyboard.press(path[i]);
        await page.clock.runFor(1200);
        await expect(bridgeNext(page)).toBeFocused();
        expect(await overflow()).toBeLessThanOrEqual(0);
        const states = await page.locator(".ss-choice").evaluateAll((all) =>
          all.map((element) => ({
            state: element.getAttribute("data-state"),
            fg: getComputedStyle(element).color,
            bg: getComputedStyle(element).backgroundColor,
            ring: getComputedStyle(element).boxShadow,
            key: [getComputedStyle(element.querySelector(".ss-choice-key") as Element).color, getComputedStyle(element.querySelector(".ss-choice-key") as Element).backgroundColor],
          })),
        );
        for (const s of states) {
          expect(contrast(s.fg, s.bg)).toBeGreaterThanOrEqual(4.5);
          expect(contrast(s.key[0], s.key[1])).toBeGreaterThanOrEqual(4.5);
          if (s.state === "dipilih") expect(s.ring).toBe(`${INK} 0px 0px 0px ${2 * px}px inset`);
        }
        expect(await border(".ss-question-row .ss-next")).toBe(`${2 * px}px`);
        await page.keyboard.press("Enter");
        await page.clock.runFor(150);
      }
      await expect(page.locator(".ss-play-end")).toBeVisible();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      await expect(narrationNext(page)).toBeFocused();
    }
    expectClean(log);
  });
}
