// Fungsi dan data bersama uji ujung ke ujung Sehari Setara (spesifikasi F-04; dipisahkan di F-05; ditambah di F-06 dan F-07).
// Dipakai semua berkas e2e/*.spec.ts. Berkas ini bukan berkas uji.
import { mkdirSync } from "node:fs";
import { expect, type Page } from "@playwright/test";

export const SHOTS = "test-results/tangkapan";
mkdirSync(SHOTS, { recursive: true });

/** Empat ukuran uji, skala panggung k, dan satu piksel antarmuka px (area panggung 52u sejak F-05). */
export const VIEWPORTS = {
  "1280x720": { width: 1280, height: 720, k: 2, px: 2 },
  "1366x768": { width: 1366, height: 768, k: 2, px: 2 },
  "1920x1080": { width: 1920, height: 1080, k: 3, px: 3 },
  "1024x768": { width: 1024, height: 768, k: 1.664, px: 2 },
} as const;
export type ViewportName = keyof typeof VIEWPORTS;

export const INK = "rgb(31, 42, 68)";
export const CREAM = "rgb(255, 246, 224)";
export const SUN = "rgb(255, 210, 63)";
export const BAR: Record<string, { bg: string; fg: string }> = {
  pagi: { bg: "rgb(255, 217, 168)", fg: INK },
  siang: { bg: "rgb(110, 198, 242)", fg: INK },
  sore: { bg: "rgb(255, 194, 122)", fg: INK },
  malam: { bg: "rgb(74, 79, 156)", fg: CREAM },
};
export const SHADOW: Record<string, string> = {
  bg_s1_rumah_pagi: "rgb(138, 90, 51)",
  bg_s2_jalan_pagi: "rgb(58, 74, 107)",
  bg_s3_kelas_siang: "rgb(107, 122, 153)",
  bg_s4_koridor_siang: "rgb(201, 139, 79)",
  bg_s5_kampung_sore: "rgb(107, 122, 153)",
  bg_s6_kamar_malam: "rgb(138, 90, 51)",
};
// Tabel "Posisi ikon emosi" di spesifikasi: ikon, kiri, atas (piksel logis).
export const EMOTES: Record<string, [string, number, number]> = {
  "1-a": ["keringat", 203, 79], "1-b": ["hati", 120, 100], "1-c": ["keringat", 120, 101],
  "2-a": ["seru", 224, 88], "2-b": ["hati", 155, 86], "2-c": ["keringat", 224, 88],
  "3-a": ["keringat", 182, 89], "3-b": ["hati", 182, 88], "3-c": ["keringat", 136, 88],
  "4-a": ["seru", 60, 90], "4-b": ["hati", 108, 89], "4-c": ["keringat", 60, 90],
  "5-a": ["seru", 35, 83], "5-b": ["hati", 113, 83], "5-c": ["keringat", 251, 84],
  "6-a": ["seru", 164, 87], "6-b": ["hati", 164, 87], "6-c": ["keringat", 164, 87],
};

/** Mencatat galat konsol, galat halaman, respons ≥ 400, permintaan ke host lain, dan permintaan yang gagal. */
export function watch(page: Page) {
  const log = { console: [] as string[], page: [] as string[], http: [] as string[], external: [] as string[], failed: [] as string[] };
  page.on("console", (message) => {
    if (message.type() === "error") log.console.push(message.text());
  });
  page.on("pageerror", (error) => log.page.push(String(error)));
  page.on("response", (response) => {
    if (response.status() >= 400) log.http.push(`${response.status()} ${response.url()}`);
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith("http") && url.hostname !== "127.0.0.1") log.external.push(request.url());
  });
  page.on("requestfailed", (request) => log.failed.push(`${request.failure()?.errorText} ${request.url()}`));
  return log;
}

export function expectClean(log: ReturnType<typeof watch>) {
  expect(log.console, "galat konsol").toEqual([]);
  expect(log.page, "galat halaman").toEqual([]);
  expect(log.http, "respons 4xx/5xx").toEqual([]);
  expect(log.external, "permintaan ke host lain").toEqual([]);
}

/** Menunggu huruf dan semua gambar di panggung dan bilah atas selesai dimuat dan di-decode, lalu dua bingkai gambar. */
export async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const urls = [...document.querySelectorAll<HTMLElement>(".ss-stage-bg, .ss-sprite, .ss-emote")]
      .map((element) => /url\("(.*)"\)/.exec(getComputedStyle(element).backgroundImage)?.[1] ?? "")
      .concat([...document.querySelectorAll("image.ss-dayarc-icon")].map((element) => (element as SVGImageElement).href.baseVal));
    if (urls.some((url) => url === "")) throw new Error("ada elemen panggung tanpa gambar");
    await Promise.all(
      urls.map((url) => {
        const image = new Image();
        image.src = url;
        return image.decode();
      }),
    );
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

/** Ukuran dan posisi isi panggung, relatif terhadap bingkai, dalam piksel layar. */
export async function measureStage(page: Page) {
  return page.evaluate(() => {
    const frame = document.querySelector(".ss-stage-frame");
    if (!frame) throw new Error("bingkai panggung tidak ada");
    const f = frame.getBoundingClientRect();
    const rel = (element: Element) => {
      const r = element.getBoundingClientRect();
      return { left: r.left - f.left, top: r.top - f.top, width: r.width, height: r.height };
    };
    const sprites = [...document.querySelectorAll<HTMLElement>(".ss-sprite")].map((element) => ({
      char: element.dataset.char,
      pose: element.dataset.pose,
      ...rel(element),
      transform: getComputedStyle(element).transform,
      animation: getComputedStyle(element).animationName,
      duration: getComputedStyle(element).animationDuration,
      timing: getComputedStyle(element).animationTimingFunction,
      rendering: getComputedStyle(element).imageRendering,
      z: getComputedStyle(element).zIndex,
    }));
    const shadows = [...document.querySelectorAll<HTMLElement>(".ss-shadow")].map((element) => ({
      ...rel(element),
      color: getComputedStyle(element).backgroundColor,
      z: getComputedStyle(element).zIndex,
    }));
    const emoteElement = document.querySelector<HTMLElement>(".ss-emote");
    const emote = emoteElement ? { icon: emoteElement.dataset.icon, ...rel(emoteElement), z: getComputedStyle(emoteElement).zIndex } : null;
    const bg = document.querySelector(".ss-stage-bg");
    return {
      frame: { width: f.width, height: f.height },
      label: frame.getAttribute("aria-label"),
      background: bg ? getComputedStyle(bg).backgroundImage : "",
      backgroundZ: bg ? getComputedStyle(bg).zIndex : "",
      sprites,
      shadows,
      emote,
    };
  });
}

export async function measureBar(page: Page) {
  return page.evaluate(() => {
    const bar = document.querySelector<HTMLElement>(".ss-topbar");
    if (!bar) throw new Error("bilah atas tidak ada");
    const style = getComputedStyle(bar);
    return {
      time: bar.dataset.time,
      bg: style.backgroundColor,
      fg: style.color,
      label: bar.getAttribute("aria-label"),
      clock: bar.querySelector(".ss-topbar-clock")?.textContent,
      counter: bar.querySelector(".ss-topbar-counter")?.textContent,
      passed: bar.querySelectorAll('.ss-dayarc-dot[data-state="lewat"]').length,
      next: bar.querySelectorAll('.ss-dayarc-dot[data-state="berikutnya"]').length,
      icon: bar.querySelector<SVGElement>(".ss-dayarc-icon")?.dataset.icon,
    };
  });
}

export function luminance(rgb: string): number {
  const [r, g, b] = (rgb.match(/\d+/g) ?? []).slice(0, 3).map((v) => {
    const c = Number(v) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Kartu dampak F-06 dan tombol Lanjut-nya. */
export const impactCard = (page: Page) => page.locator(".ss-impact");
export const cardNext = (page: Page) => page.locator(".ss-impact .ss-next");

/**
 * Menunggu kartu dampak tampil dengan judul berfokus, lalu menunggu masa tunggu 600 ms selesai.
 * Hanya untuk uji dengan jam berjalan; uji dengan jam dijeda memajukan waktu dengan page.clock.runFor.
 */
export async function waitCardReady(page: Page) {
  await expect(impactCard(page)).toBeVisible({ timeout: 3000 });
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await expect(cardNext(page)).not.toHaveAttribute("aria-disabled", "true");
}

/** Ajakan bintang alasan F-07, yang berfokus saat fase bintang dimulai. */
export const awardPrompt = (page: Page) => page.locator(".ss-award-prompt");

/**
 * Langkah bintang alasan F-07 sesudah tombol Lanjut kartu dampak: menunggu ajakan berfokus, lalu menekan 0, 1, atau 2.
 * Pergantian adegan dimulai sesudahnya; uji dengan jam dijeda memajukan waktunya sendiri.
 */
export async function giveStars(page: Page, stars: 0 | 1 | 2 = 1) {
  await expect(awardPrompt(page)).toBeFocused();
  await page.keyboard.press(String(stars));
}
