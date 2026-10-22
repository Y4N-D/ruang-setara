// Uji ujung ke ujung Sehari Setara (spesifikasi F-04, Rencana uji langkah 6; disesuaikan F-05).
// Membuka hasil build di /ruang-setara/ lewat serve-subpath.mjs, seperti alamat GitHub Pages.
import { expect, test, type Page } from "@playwright/test";
import { SCENES } from "../app/sehari-setara/content/scenes";
import {
  BAR,
  contrast,
  EMOTES,
  expectClean,
  measureBar,
  measureStage,
  settle,
  SHADOW,
  SHOTS,
  SUN,
  VIEWPORTS,
  watch,
  type ViewportName,
} from "./bantuan";

async function goHash(page: Page, hash: string) {
  await page.evaluate((target) => {
    window.location.hash = target;
  }, hash);
}

function routes() {
  return SCENES.flatMap((scene, i) =>
    ["", "-a", "-b", "-c"].map((suffix) => ({ scene, n: i + 1, suffix, hash: `#adegan-${i + 1}${suffix}` })),
  );
}

test.describe.configure({ mode: "serial" });

test("layar kerangka: teks, tombol pratinjau, urutan Tab, tanpa animasi, huruf (AC-2, AC-3)", async ({ page }) => {
  const log = watch(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("sehari-setara/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("h1")).toHaveText("Sehari Setara");
  await expect(page.locator(".ss-placeholder-lead")).toHaveText("Temani Nara menjalani satu hari dan pilih tindakannya bersama kelas.");
  await expect(page.locator(".ss-placeholder-status")).toHaveText("Permainan ini sedang dibuat.");
  const links = page.locator(".ss-placeholder-actions a");
  await expect(links).toHaveText(["Kembali ke galeri", "Lihat pratinjau panggung", "Coba alur permainan"]);
  expect(await links.evaluateAll((all) => all.map((a) => a.getAttribute("href")))).toEqual(["../", "#adegan-1", "#main"]);
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveText("Kembali ke galeri");
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  expect(await page.evaluate(() => [document.fonts.check('20px "Press Start 2P"'), document.fonts.check('20px "Pixelify Sans"')])).toEqual([true, true]);
  const fontFiles = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((entry) => entry.name).filter((name) => /\.woff2?$/.test(name)),
  );
  expect(fontFiles.length).toBeGreaterThanOrEqual(2);
  for (const name of fontFiles) expect(name).toMatch(/^http:\/\/127\.0\.0\.1:4180\/ruang-setara\/assets\/(press-start-2p|pixelify-sans)-latin-400-normal-/);
  await page.screenshot({ path: `${SHOTS}/kerangka_1280x720.png` });
  expectClean(log);
});

test("alamat pratinjau: sah, tidak dikenal, tanpa muat ulang, dan fokus (AC-4)", async ({ page }) => {
  const log = watch(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  for (const hash of ["", "#adegan-0", "#adegan-7", "#adegan-1-d", "#lain"]) {
    await page.goto(`sehari-setara/${hash}`);
    await expect(page.locator(".ss-placeholder")).toBeVisible();
    await expect(page.locator(".ss-preview")).toHaveCount(0);
  }
  await page.goto("sehari-setara/");
  await page.evaluate(() => {
    (window as unknown as { ssPenanda: number }).ssPenanda = 1;
  });
  await page.getByRole("link", { name: "Lihat pratinjau panggung" }).click();
  await expect(page).toHaveURL(/#adegan-1$/);
  await expect(page.locator("#ss-preview-title")).toHaveText(SCENES[0].title);
  await expect(page.locator("#ss-preview-title")).toBeFocused();
  for (const { scene, hash, suffix } of routes()) {
    await goHash(page, hash);
    await expect(page.locator("#ss-preview-title")).toHaveText(scene.title);
    const status = suffix ? `Pratinjau panggung: reaksi pilihan ${suffix.slice(1).toUpperCase()}.` : "Pratinjau panggung: situasi awal.";
    await expect(page.locator(".ss-preview-status")).toHaveText(status);
  }
  expect(await page.evaluate(() => (window as unknown as { ssPenanda?: number }).ssPenanda)).toBe(1);
  await page.getByRole("link", { name: "Tutup pratinjau" }).click();
  await expect(page.locator(".ss-placeholder")).toBeVisible();
  await expect(page.getByRole("link", { name: "Lihat pratinjau panggung" })).toBeFocused();
  await page.goBack();
  await expect(page.locator(".ss-preview")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { ssPenanda?: number }).ssPenanda)).toBe(1);
  expectClean(log);
});

for (const name of Object.keys(VIEWPORTS) as ViewportName[]) {
  test(`tata letak dan skala di ${name} (AC-5)`, async ({ page }) => {
    const log = watch(page);
    const viewport = VIEWPORTS[name];
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("sehari-setara/#adegan-3");
    await settle(page);
    const box = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(selector);
        const r = element.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height };
      };
      const panel = document.querySelector(".ss-preview-panel");
      return {
        screen: rect(".ss-screen"),
        bar: rect(".ss-topbar"),
        area: rect(".ss-stage-area"),
        frame: rect(".ss-stage-frame"),
        bottom: rect(".ss-preview-panel"),
        panelOverflow: panel ? panel.scrollHeight - panel.clientHeight : 0,
        pageOverflow: [document.documentElement.scrollWidth - document.documentElement.clientWidth, document.documentElement.scrollHeight - document.documentElement.clientHeight],
      };
    });
    const u = box.screen.height / 100;
    expect(Math.abs(box.bar.height - 8 * u)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.area.height - 52 * u)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.bottom.height - 40 * u)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.frame.width - 320 * viewport.k)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.frame.height - 180 * viewport.k)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.frame.width / 320 - viewport.k)).toBeLessThanOrEqual(0.005);
    const centerX = box.area.left + box.area.width / 2 - (box.frame.left + box.frame.width / 2);
    const centerY = box.area.top + box.area.height / 2 - (box.frame.top + box.frame.height / 2);
    expect(Math.abs(centerX)).toBeLessThanOrEqual(1);
    expect(Math.abs(centerY)).toBeLessThanOrEqual(1);
    expect(box.panelOverflow).toBeLessThanOrEqual(0);
    expect(box.pageOverflow).toEqual([0, 0]);
    if (name === "1920x1080") await page.screenshot({ path: `${SHOTS}/adegan_3_1920x1080.png` });
    expectClean(log);
  });
}

for (const name of ["1280x720", "1024x768"] as const) {
  test(`panggung di ke-24 alamat pada ${name} (AC-6, AC-7, AC-8, AC-10)`, async ({ page }) => {
    const log = watch(page);
    const { width, height, k } = VIEWPORTS[name];
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("sehari-setara/#adegan-1");
    const near = (actual: number, expected: number) => expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
    for (const { scene, n, suffix, hash } of routes()) {
      await goHash(page, hash);
      await expect(page.locator("#ss-preview-title")).toHaveText(scene.title);
      await settle(page);
      const choice = scene.choices.find((c) => `-${c.id.toLowerCase()}` === suffix);
      const cast = choice ? choice.reaction : scene.cast;
      const stage = await measureStage(page);
      const scale = stage.frame.width / 320;
      expect(Math.abs(scale - k)).toBeLessThanOrEqual(0.005);

      // Lapisan dan efek (AC-8)
      expect(stage.background).toContain(`${scene.bg}-`);
      expect(stage.backgroundZ).toBe("0");
      // Tokoh dan bayangan (AC-6)
      expect(stage.sprites.map((s) => `${s.char}.${s.pose}`)).toEqual(cast.map((slot) => `${slot.char}.${slot.pose}`));
      expect(stage.shadows).toHaveLength(cast.length);
      cast.forEach((slot, i) => {
        const sprite = stage.sprites[i];
        const w = Math.round(sprite.width / scale);
        near(sprite.top + sprite.height, 157 * scale);
        near(sprite.left, (slot.x - Math.floor(w / 2)) * scale);
        expect(sprite.transform).toBe(slot.facing === "left" ? "matrix(-1, 0, 0, 1, 0, 0)" : "none");
        expect(sprite.rendering).toBe("pixelated");
        expect(sprite.z).toBe("20");
        const shadow = stage.shadows[i];
        near(shadow.top, 155 * scale);
        near(shadow.height, 2 * scale);
        near(shadow.width, (w - 6) * scale);
        near(shadow.left, (slot.x - Math.floor((w - 6) / 2)) * scale);
        expect(shadow.color).toBe(SHADOW[scene.bg]);
        expect(shadow.z).toBe("20");
      });
      // Ikon emosi (AC-7)
      const expectedEmote = suffix ? EMOTES[`${n}${suffix}`] : undefined;
      if (expectedEmote) {
        expect(stage.emote?.icon).toBe(expectedEmote[0]);
        near((stage.emote?.left ?? NaN) / scale, expectedEmote[1]);
        near((stage.emote?.top ?? NaN) / scale, expectedEmote[2]);
        expect(stage.emote?.z).toBe("30");
      } else {
        expect(stage.emote).toBeNull();
      }
      // Label panggung
      expect(stage.label).toBe(choice ? `${scene.altText} Tampilan reaksi pilihan ${choice.id}.` : scene.altText);
      // Bilah atas (AC-10)
      const bar = await measureBar(page);
      expect(bar.time).toBe(scene.timeOfDay);
      expect([bar.bg, bar.fg]).toEqual([BAR[scene.timeOfDay].bg, BAR[scene.timeOfDay].fg]);
      expect(contrast(bar.bg, bar.fg)).toBeGreaterThanOrEqual(4.5);
      expect([bar.clock, bar.counter]).toEqual([scene.clock, `Adegan ${n}/6`]);
      expect(bar.label).toBe(`Pukul ${scene.clock}, adegan ${n} dari 6`);
      expect([bar.passed, bar.next]).toEqual([n - 1, 6 - n]);
      expect(bar.icon).toBe(scene.timeOfDay === "malam" ? "bulan" : "matahari");

      const shot = suffix === "" || (name === "1280x720" && (hash === "#adegan-2-b" || hash === "#adegan-4-b"));
      const forDocs = name === "1280x720" || (suffix === "" && (n === 1 || n === 6));
      if (shot && forDocs) {
        const label = suffix ? `adegan_${n}_reaksi_${suffix.slice(1)}` : `adegan_${n}`;
        await page.screenshot({ path: `${SHOTS}/${label}_${name}.png` });
      }
    }
    // Garis pindai dan vinyet (AC-8)
    const effects = await page.evaluate(() => ({
      scan: getComputedStyle(document.querySelector(".ss-stage-frame") as Element, "::after").backgroundImage,
      scanZ: getComputedStyle(document.querySelector(".ss-stage-frame") as Element, "::after").zIndex,
      vignette: getComputedStyle(document.querySelector(".ss-stage") as Element, "::after").boxShadow,
      vignetteZ: getComputedStyle(document.querySelector(".ss-stage") as Element, "::after").zIndex,
    }));
    expect(effects.scan).toBe("repeating-linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 2px, rgba(31, 42, 68, 0.1) 2px, rgba(31, 42, 68, 0.1) 3px)");
    expect(effects.vignette).toBe("rgba(31, 42, 68, 0.06) 0px 0px 0px 2px inset, rgba(31, 42, 68, 0.06) 0px 0px 0px 4px inset");
    expect([effects.scanZ, effects.vignetteZ]).toEqual(["40", "40"]);
    expectClean(log);
  });
}

test("gerak sprite, denyut busur, dan kurangi gerak (AC-9)", async ({ page }) => {
  const log = watch(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("sehari-setara/#adegan-1");
  await settle(page);
  const running = await page.evaluate(() =>
    document.getAnimations().map((animation) => (animation as CSSAnimation).animationName).sort(),
  );
  // Adegan 1: Gita senang (1 bingkai, diam), Nara diam (2 bingkai), Ibu bicara (2 bingkai), ditambah denyut ikon.
  expect(running).toEqual(["ss-pulse", "ss-strip", "ss-strip"]);
  const sprites = await measureStage(page);
  expect(sprites.sprites.map((s) => [s.char, s.animation, s.duration, s.timing])).toEqual([
    ["gita", "none", "0s", "ease"],
    ["nara", "ss-strip", "1s", "steps(2)"],
    ["ibu", "ss-strip", "0.5s", "steps(2)"],
  ]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
  for (const hash of ["#adegan-4", "#adegan-6-b"]) {
    await goHash(page, hash);
    await settle(page);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  }
  expectClean(log);
});

test("pramuat gambar adegan berikutnya (AC-11)", async ({ page }) => {
  const log = watch(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  const nextBackground = page.waitForRequest(/\/assets\/bg_s2_jalan_pagi-[\w-]+\.png$/);
  await page.goto("sehari-setara/#adegan-1");
  await nextBackground;
  const nextSprite = page.waitForRequest(/\/assets\/bg_s3_kelas_siang-[\w-]+\.png$/);
  await goHash(page, "#adegan-2");
  await nextSprite;
  expectClean(log);
});

test("navigasi pratinjau dengan keyboard dan fokus yang terlihat (AC-16)", async ({ page }) => {
  const log = watch(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("sehari-setara/#adegan-1");
  await settle(page);
  const target = page.getByRole("link", { name: "Adegan 2: Perjalanan ke sekolah" });
  for (let i = 0; i < 20 && !(await target.evaluate((element) => element === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
  expect(await target.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(SUN);
  expect(await target.evaluate((element) => getComputedStyle(element, "::before").visibility)).toBe("visible");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#adegan-2$/);
  await expect(page.locator("#ss-preview-title")).toHaveText(SCENES[1].title);
  await expect(page.locator('.ss-chip[aria-current="page"]')).toHaveText(["2", "Situasi"]);
  expectClean(log);
});

test("galeri tetap terbuka tanpa galat dan tanpa huruf game (AC-2, AC-16)", async ({ page }) => {
  const log = watch(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("./");
  await page.waitForTimeout(3000);
  const fonts = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((entry) => entry.name).filter((name) => /(press-start-2p|pixelify-sans)/.test(name)),
  );
  expect(fonts).toEqual([]);
  expect(log.console).toEqual([]);
  expect(log.page).toEqual([]);
  expect(log.http).toEqual([]);
});

for (const name of Object.keys(VIEWPORTS) as ViewportName[]) {
  test(`halaman permainan tanpa galat di ${name} (AC-16)`, async ({ page }) => {
    const log = watch(page);
    const { width, height } = VIEWPORTS[name];
    await page.setViewportSize({ width, height });
    await page.goto("sehari-setara/");
    await page.evaluate(() => document.fonts.ready);
    for (const hash of ["#adegan-1", "#adegan-5-c", "#adegan-6"]) {
      await goHash(page, hash);
      await settle(page);
    }
    expectClean(log);
    expect(log.failed).toEqual([]);
  });
}
