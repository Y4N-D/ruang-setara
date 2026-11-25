// Uji ujung ke ujung JS-14 di layar pemain (spesifikasi JS-14; AC-1 sampai AC-6, AC-8 sampai AC-10, AC-22, AC-23):
// pemberitahuan privasi, Menu dan Pengaturan, Tentang, pengaturan yang bertahan, suara tanpa unduhan selama mati, teks
// per huruf, kurangi gerak, dan satu ronde hanya dengan papan ketik.
import { mkdirSync, readFileSync } from "node:fs";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { ruangKejadianSendiri } from "./ruang-kejadian";
import { buatRuang, kelas, pindahkanPemain, tutupRuangBerkas } from "./ruang-uji";

test.afterAll(tutupRuangBerkas);
const FOTO = "test-results-jejak/js14";
mkdirSync(FOTO, { recursive: true });
const bank = JSON.parse(readFileSync(new URL("../../server/jejak-setara/seed/bank-awal.json", import.meta.url), "utf8")) as {
  kejadian: { kode: string; judul: string; langkah1: { opsi: { teks: string; benar: boolean }[] }; langkah2: { opsi: { teks: string; tingkat: string }[] } }[];
};
const dunia = (page: Page) => page.locator("canvas.js-kanvas-dunia");
const hud = (page: Page) => page.locator(".js-hud-kiri");

async function konteks(browser: Browser, baseURL: string, ukuran = { width: 1280, height: 720 }, hp = false) {
  const ctx = await browser.newContext({ baseURL, viewport: ukuran, ...(hp ? { isMobile: true, hasTouch: true } : {}) });
  return { ctx, page: await ctx.newPage() };
}

async function pilihan(page: Page, teks: string): Promise<number> {
  const semua = await page.locator('.js-dialog [data-pilihan="ya"] .js-teks-pilihan').allTextContents();
  const i = semua.indexOf(teks);
  expect(i, teks).toBeGreaterThanOrEqual(0);
  return i + 1;
}

test("HP: privasi di layar Kode, Menu, Pengaturan, Tentang, pengaturan bertahan, dan suara tanpa unduhan selama mati", async ({ browser, baseURL, request }) => {
  const kode = await buatRuang(request);
  const { ctx, page } = await konteks(browser, baseURL!, { width: 731, height: 411 }, true);
  const wav: string[] = [];
  page.on("request", (r) => {
    if (r.url().endsWith(".wav")) wav.push(r.url());
  });
  // P-15, P-16: kalimat privasi dan panel Privasi dengan fokus awal di judul.
  await page.goto("/");
  await expect(page.getByText("Jejak Setara tidak meminta nama lengkap, foto, atau lokasimu.")).toBeVisible();
  await page.screenshot({ path: `${FOTO}/kode-privasi-731x411.png` });
  await page.getByRole("button", { name: "Privasi" }).tap();
  const privasi = page.getByRole("dialog", { name: "Privasi" });
  await expect(privasi.getByRole("heading", { name: "Privasi" })).toBeFocused();
  for (const judul of ["Yang disimpan", "Untuk apa", "Siapa yang melihat", "Berapa lama", "Yang tidak disimpan", "Di perangkat ini"]) {
    await expect(privasi.getByText(judul, { exact: true })).toBeAttached();
  }
  await page.screenshot({ path: `${FOTO}/privasi-731x411.png` });
  await privasi.getByRole("button", { name: "Tutup" }).tap();
  await expect(privasi).toHaveCount(0);

  // P-5: tombol Menu dan suara di baris kaki layar identitas.
  await page.getByLabel("Kode ruang").fill(kode);
  await page.getByRole("button", { name: "Masuk", exact: true }).tap();
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible({ timeout: 20_000 }); // JS-15 (P-23): gambar dunia dimuat dulu
  await expect(page.locator(".js-kaki-identitas").getByRole("button", { name: "Buka menu pengaturan" })).toBeVisible();
  await page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first().tap();
  await page.getByRole("radio", { name: "Avatar 2" }).tap();
  await page.getByRole("button", { name: "Gabung" }).tap();
  await expect(dunia(page)).toHaveAttribute("data-diri", /^\d+,\d+$/);

  // P-4: kelompok tombol di kiri atas, 48 px, tanpa tanda papan ketik di HP.
  const kotak = await hud(page).boundingBox();
  expect(kotak?.height).toBeGreaterThanOrEqual(48);
  await expect(hud(page).locator("kbd")).toHaveCount(0);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${FOTO}/hud-menu-731x411.png` });

  // P-8 sampai P-12: panel Pengaturan, Tentang, dan kurangi gerak.
  await hud(page).getByRole("button", { name: "Buka menu pengaturan" }).tap();
  const atur = page.getByRole("dialog", { name: "Pengaturan" });
  await expect(atur.getByRole("radiogroup", { name: "Suara" }).getByRole("radio", { name: "Mati" })).toBeFocused();
  await expect(atur.getByText("Awalnya mengikuti pengaturan perangkatmu.")).toBeVisible();
  await expect(hud(page)).toHaveCount(0);
  await page.screenshot({ path: `${FOTO}/pengaturan-731x411.png` });
  await atur.getByRole("radiogroup", { name: "Ukuran label nama" }).getByRole("radio", { name: "Besar" }).tap();
  await atur.getByRole("radiogroup", { name: "Kurangi gerak" }).getByRole("radio", { name: "Nyala" }).tap();
  expect(await page.evaluate(() => document.documentElement.dataset.kurangiGerak)).toBe("ya");
  await atur.getByRole("button", { name: "Tentang" }).tap();
  const tentang = page.getByRole("dialog", { name: "Tentang" });
  await expect(tentang.getByText("Efek suara dibuat dengan kode oleh Claude (Anthropic) berdasarkan arahan dan persetujuan YAN.")).toBeVisible();
  await page.screenshot({ path: `${FOTO}/tentang-731x411.png` });
  await tentang.getByRole("button", { name: "Tutup" }).tap();
  await expect(atur).toBeVisible();
  await page.setViewportSize({ width: 640, height: 360 });
  await page.waitForTimeout(200);
  expect(await page.locator(".js-atur-isi").evaluate((e) => e.scrollHeight > e.clientHeight + 1)).toBe(false);
  await page.screenshot({ path: `${FOTO}/pengaturan-640x360.png` });
  await page.setViewportSize({ width: 731, height: 411 });
  await atur.getByRole("button", { name: "Tutup" }).tap();
  await expect(atur).toHaveCount(0);

  // P-2: pengaturan bertahan sesudah halaman dimuat ulang di tab yang sama (dengan kode di alamat, token tab dipakai lagi).
  await page.goto(`/?kode=${kode}`);
  await expect(dunia(page)).toHaveAttribute("data-diri", /^\d+,\d+$/, { timeout: 15_000 });
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("jejak:pengaturan") ?? "{}"))).toEqual({ suara: false, kurangiGerak: true, ketik: false, label: "besar" });
  expect(await page.evaluate(() => document.documentElement.dataset.kurangiGerak)).toBe("ya");

  // P-21: selama suara mati tidak ada WAV yang diminta; menyalakan suara mengunduh sembilan berkas tanpa jingle.
  expect(wav).toEqual([]);
  await hud(page).getByRole("button", { name: "Suara mati. Tekan untuk menyalakan." }).tap();
  const nama = () => new Set(wav.map((u) => (u.split("/").pop() ?? "").replace(/-[^.]+\./, ".")));
  await expect.poll(() => nama().size, { timeout: 10_000 }).toBe(9);
  expect([...nama()].some((n) => n.startsWith("sfx_akhir"))).toBe(false);
  await expect(hud(page).getByRole("button", { name: "Suara nyala. Tekan untuk mematikan." })).toHaveAttribute("aria-pressed", "true");
  await ctx.close();
});

test("laptop: satu ronde hanya dengan papan ketik, Esc dan M, teks per huruf, dialog dan panel terbaca", async ({ browser, baseURL, request }) => {
  const k13 = bank.kejadian.find((k) => k.kode === "K-13")!;
  const { kode, titik } = await ruangKejadianSendiri(request, "K-13");
  const { ctx, page } = await konteks(browser, baseURL!);
  await page.goto(`/?kode=${kode}`);
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible({ timeout: 20_000 }); // JS-15 (P-23): gambar dunia dimuat dulu
  // Papan ketik saja: fokus dan tombol, tanpa klik.
  const nama1 = page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first();
  const nama = ((await nama1.textContent()) ?? "").replace("▶", "").trim();
  await nama1.focus();
  await page.keyboard.press("Space");
  await page.getByRole("radio", { name: "Avatar 3" }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Gabung" }).focus();
  await page.keyboard.press("Enter");
  await expect(dunia(page)).toHaveAttribute("data-diri", /^\d+,\d+$/);
  await expect(hud(page).locator("kbd")).toHaveText(["Esc", "M"]);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${FOTO}/hud-menu-1280x720.png` });

  // P-8, P-68: Esc membuka Menu; peran dan nama panel.
  await dunia(page).focus();
  await page.keyboard.press("Escape");
  const atur = page.getByRole("dialog", { name: "Pengaturan" });
  await expect(atur).toMatchAriaSnapshot(`
    - dialog "Pengaturan":
      - heading "Pengaturan" [level=2]
      - radiogroup "Suara":
        - radio /Mati/ [checked]
        - radio /Nyala/
  `);
  await page.screenshot({ path: `${FOTO}/pengaturan-1280x720.png` });
  await atur.getByRole("radiogroup", { name: "Teks muncul per huruf" }).getByRole("radio", { name: "Mati" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(atur.getByRole("radiogroup", { name: "Teks muncul per huruf" }).getByRole("radio", { name: "Nyala" })).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");
  await expect(atur).toHaveCount(0);

  // P-14: M menyalakan dan mematikan suara.
  await page.keyboard.press("KeyM");
  await expect(hud(page).getByRole("button", { name: "Suara nyala. Tekan untuk mematikan." })).toBeVisible();
  await page.keyboard.press("KeyM");
  await expect(hud(page).getByRole("button", { name: "Suara mati. Tekan untuk menyalakan." })).toBeVisible();

  // Satu ronde: dekati K-13, buka dengan E, jawab dengan angka dan Enter.
  await kelas(request, kode, { t: "mulai" });
  await expect(page.locator(".js-bilah")).toBeVisible({ timeout: 8000 });
  expect((await pindahkanPemain(request, kode, nama, titik.x, titik.y + 1)).status()).toBe(200);
  await expect(dunia(page)).toHaveAttribute("data-jangkauan", "K-13", { timeout: 5000 });
  await dunia(page).focus();
  await page.keyboard.press("KeyE");
  const dialog = page.getByRole("dialog").filter({ has: page.locator("#js-dialog-judul") });
  await expect(dialog).toHaveAccessibleName(k13.judul);
  // P-25: teks situasi berjalan; Enter di kotak situasi menampilkan semuanya, dan teks lengkap ada untuk pembaca layar.
  const berjalan = page.locator('.js-situasi[role="button"]');
  await expect(berjalan).toHaveCount(1);
  await expect(page.locator(".js-dialog .js-sr").first()).not.toBeEmpty();
  await berjalan.focus();
  await page.keyboard.press("Enter");
  await expect(berjalan).toHaveCount(0);
  await expect(page.locator('.js-dialog [data-pilihan="ya"]').first()).toBeFocused();
  await page.waitForTimeout(700);
  await page.keyboard.press(String(await pilihan(page, k13.langkah1.opsi.find((o) => o.benar)!.teks)));
  await page.keyboard.press("Enter");
  await expect.poll(() => page.locator(".js-dialog").getAttribute("data-tampilan")).toBe("umpan");
  await page.waitForTimeout(700);
  await page.keyboard.press("Enter");
  await expect.poll(() => page.locator(".js-dialog").getAttribute("data-tampilan")).toBe("langkah2");
  await page.waitForTimeout(700);
  await page.keyboard.press(String(await pilihan(page, k13.langkah2.opsi.find((o) => o.tingkat === "tepat")!.teks)));
  await page.keyboard.press("Enter");
  await expect.poll(() => page.locator(".js-dialog").getAttribute("data-tampilan")).toBe("kartu");
  await page.waitForTimeout(700);
  await page.keyboard.press("Enter");
  await expect(dialog).toHaveCount(0);

  // Rekap dengan Menu dan suara di kanan judul.
  await kelas(request, kode, { t: "akhiri" });
  await expect(page.locator(".js-rekap-menu").getByRole("button", { name: "Buka menu pengaturan" })).toBeVisible({ timeout: 10_000 });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Pengaturan" })).toBeVisible();
  await ctx.close();
});
