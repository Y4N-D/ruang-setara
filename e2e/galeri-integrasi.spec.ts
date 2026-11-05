// Uji ujung ke ujung integrasi galeri Ruang Setara dengan Sehari Setara (spesifikasi F-11 bagian B, AC-B1 sampai AC-B5).
// Galeri 3D lambat di browser uji tanpa GPU, sehingga alur dan keyboard diuji di 1280×720, sedangkan letak kedua tautan
// diperiksa di tiga ukuran (keputusan B-6). Tangkapan layar ditulis ke test-results/tangkapan/F-11, lalu disalin ke
// docs/sehari-setara/tests/F-11/.
import { expect, test, type Page } from "@playwright/test";
import { SCENES } from "../app/sehari-setara/content/scenes";
import { expectClean, finishDay, openByKeyboard, playScene, SHOTS, tabTo, titleStart, watch } from "./bantuan";

test.describe.configure({ mode: "serial" });

const SIZES = {
  "1280x720": { width: 1280, height: 720 },
  "1024x768": { width: 1024, height: 768 },
  "1920x1080": { width: 1920, height: 1080 },
} as const;
type GallerySize = keyof typeof SIZES;

const GAME_URL = /\/ruang-setara\/sehari-setara\/$/;
const GALLERY_URL = /\/ruang-setara\/$/;
const menuLink = (page: Page) => page.locator('.map-content a[href="sehari-setara/"]');
const panelLink = (page: Page) => page.locator('.narrative-detail a[href="sehari-setara/"]');

async function openGallery(page: Page, size: GallerySize = "1280x720") {
  await page.setViewportSize(SIZES[size]);
  await page.goto("./");
  await expect(page.getByRole("button", { name: "Masuk galeri" })).toBeVisible();
}

/** Dari layar sambutan (Atrium) ke galeri ke-6, Refleksi. */
async function enterRefleksi(page: Page) {
  await page.getByRole("button", { name: "Galeri sebelumnya" }).click();
  await page.getByRole("button", { name: "Masuk galeri" }).click();
  await expect(panelLink(page)).toBeVisible({ timeout: 60_000 });
}

for (const size of Object.keys(SIZES) as GallerySize[]) {
  test(`kedua tautan di ${size}: teks, alamat, letak, dan tampilan (AC-B1, AC-B2)`, async ({ page }) => {
    test.setTimeout(280_000);
    const log = watch(page);
    await openGallery(page, size);
    await expect(panelLink(page)).toHaveCount(0);

    // Menu "Daftar materi": tepat di bawah kalimat pembuka, di atas daftar galeri, terlihat tanpa menggulir.
    await page.getByRole("button", { name: "Daftar materi" }).click();
    const link = menuLink(page);
    await expect(link).toHaveText("Main Sehari Setara");
    await expect(link).toHaveClass("text-control");
    const order = await link.evaluate((a) => ({ prev: a.previousElementSibling?.tagName, next: a.nextElementSibling?.className }));
    expect(order).toEqual({ prev: "P", next: "destination-list" });
    const seen = await link.evaluate((a) => {
      const area = a.closest(".study-scroll")!.getBoundingClientRect();
      const r = a.getBoundingClientRect();
      return r.top >= area.top && r.bottom <= area.bottom;
    });
    expect(seen, `${size}: tautan menu terlihat tanpa menggulir`).toBe(true);
    await page.screenshot({ path: `${SHOTS}/F-11/galeri-menu-${size}.png` });
    await page.keyboard.press("Escape");
    await expect(link).toHaveCount(0);

    // Panel galeri Refleksi: di antara "Mulai tantangan" dan "Kembali ke atrium".
    await enterRefleksi(page);
    const button = panelLink(page);
    await expect(button).toHaveText("Main Sehari Setara");
    await expect(button).toHaveClass("journey-cta");
    await expect(button.locator("svg")).toHaveCount(1);
    expect(await page.locator(".narrative-detail > button, .narrative-detail > a").allInnerTexts()).toEqual([
      "Mulai tantangan",
      "Main Sehari Setara",
      "Kembali ke atrium",
    ]);
    const room = await page.evaluate(() => {
      const r = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      return { head: r(".experience-header").bottom, top: r(".narrative").top, bottom: r(".narrative").bottom, foot: r(".journey-footer").top };
    });
    expect(room.top - room.head, `${size}: jarak ke kepala halaman`).toBeGreaterThanOrEqual(10);
    expect(room.foot - room.bottom, `${size}: jarak ke kaki halaman`).toBeGreaterThanOrEqual(10);
    await page.screenshot({ path: `${SHOTS}/F-11/galeri-refleksi-${size}.png` });
    await button.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS("outline-style", "solid");
    await page.screenshot({ path: `${SHOTS}/F-11/galeri-refleksi-fokus-${size}.png` });
    expectClean(log);
  });
}

test("dari galeri ke game dan kembali, dengan klik dari kedua titik (AC-B3)", async ({ page }) => {
  test.setTimeout(280_000);
  const log = watch(page);
  await openGallery(page);
  await page.getByRole("button", { name: "Daftar materi" }).click();
  await menuLink(page).click();
  await expect(page).toHaveURL(GAME_URL);
  await expect(titleStart(page)).toBeFocused();
  const back = page.getByRole("link", { name: "Kembali ke galeri" });
  await expect(back).not.toHaveAttribute("aria-disabled", /.*/);
  await back.click();
  await expect(page).toHaveURL(GALLERY_URL);
  await page.getByRole("button", { name: "Masuk galeri" }).click();
  await expect(page.locator(".narrative-detail .journey-cta").first()).toBeVisible({ timeout: 60_000 });
  await expect(panelLink(page), "galeri Atrium tanpa tautan").toHaveCount(0);
  await openGallery(page);
  await enterRefleksi(page);
  await panelLink(page).click();
  await expect(page).toHaveURL(GAME_URL);
  await expect(titleStart(page)).toBeFocused();
  expectClean(log);
});

test("main penuh dengan keyboard dari galeri ke game, lalu kembali ke galeri (AC-B3, AC-B5)", async ({ page }) => {
  test.setTimeout(290_000);
  const log = watch(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install({ time: new Date("2026-11-05T08:00:00+07:00").getTime() });
  await openGallery(page);
  await tabTo(page, "Daftar materi");
  await page.keyboard.press("Enter");
  await tabTo(page, "Main Sehari Setara");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(GAME_URL);
  await page.evaluate(() => document.fonts.ready);
  await expect(titleStart(page)).toBeFocused();
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
  await openByKeyboard(page, 3, 60);
  for (let i = 0; i < SCENES.length; i++) await playScene(page, "B");
  await finishDay(page, true);
  await page.clock.runFor(600);
  await tabTo(page, "Kembali ke galeri");
  await page.clock.resume();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(GALLERY_URL);
  await expect(page.getByRole("button", { name: "Masuk galeri" })).toBeVisible();
  expectClean(log);
});
