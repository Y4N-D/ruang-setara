// Uji ujung ke ujung JS-14 untuk nama buatan siswa dan kelola nama (spesifikasi JS-14; AC-7, AC-11, AC-12, AC-17,
// AC-18): layar identitas mode bebas, galat, pergantian ke daftar sesudah lima penolakan, menu nama dan panel Pemain di
// layar kelas, suara layar kelas, serta Ganti nama dan Ganti semua nama di konsol.
import { mkdirSync } from "node:fs";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { buatRuang, EMAIL, idDariKode, SANDI, tajukKonsol, tutupRuangBerkas } from "./ruang-uji";

test.afterAll(tutupRuangBerkas);
const FOTO = "test-results-jejak/js14";
mkdirSync(FOTO, { recursive: true });
const dunia = (page: Page) => page.locator("canvas.js-kanvas-dunia");

async function pemain(browser: Browser, baseURL: string, hp: boolean) {
  const ctx = await browser.newContext({ baseURL, viewport: hp ? { width: 731, height: 411 } : { width: 1280, height: 720 }, ...(hp ? { isMobile: true, hasTouch: true } : {}) });
  return { ctx, page: await ctx.newPage() };
}

/** Masuk konsol lewat halaman masuk dengan admin uji yang disiapkan tajukKonsol. */
async function masukKonsol(page: Page): Promise<void> {
  await page.goto("/admin/");
  await page.getByLabel("Email", { exact: true }).fill(EMAIL);
  await page.getByLabel("Sandi", { exact: true }).fill(SANDI);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("heading", { name: "Dasbor" })).toBeVisible({ timeout: 15_000 });
}

async function tinggiPanel(page: Page): Promise<number> {
  return (await page.locator(".js-panel").boundingBox())?.height ?? 0;
}

test("nama buatan siswa: identitas, galat, menu nama dan panel Pemain di layar kelas, suara layar kelas, dan konsol", async ({ browser, baseURL, request }) => {
  test.setTimeout(150_000);
  const kode = await buatRuang(request, { labelKelas: "IX Nama", modeNama: "bebas" });
  const id = idDariKode(kode);
  const kodeDaftar = await buatRuang(request, { labelKelas: "IX Daftar" });

  // Guru membuka layar kelas dengan sesi konsol.
  await tajukKonsol(request);
  const guru = await browser.newContext({ baseURL, viewport: { width: 1024, height: 768 } });
  const g = await guru.newPage();
  await masukKonsol(g);
  await g.goto(`/admin/#/kelas/${id}`);
  await expect(g.locator(".js-kelas-kode")).toHaveText(kode, { timeout: 20_000 });
  await expect(g.getByText("Tulis nama pemain dan pilih avatar")).toBeVisible();
  await expect(g.getByRole("button", { name: "Suara nyala. Tekan untuk mematikan." })).toHaveAttribute("aria-pressed", "true");

  // P-36 sampai P-39: layar identitas mode bebas di HP.
  const a = await pemain(browser, baseURL!, true);
  await a.page.goto(`/?kode=${kode}`);
  await expect(a.page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible();
  const isian = a.page.getByLabel("Nama pemain");
  await expect(isian).toBeVisible();
  await expect(a.page.getByText("Jangan memakai nama lengkap. Nama ini tampil di layar kelas.")).toBeVisible();
  await expect(a.page.getByText("0/14")).toBeVisible();
  await a.page.screenshot({ path: `${FOTO}/nama-bebas-731x411.png` });
  const tinggiBebas = await tinggiPanel(a.page);
  await a.page.getByRole("radio", { name: "Avatar 2" }).tap();
  await isian.fill("Budi!");
  // Gabung ber-aria-disabled selama bentuk nama belum sah; Enter di isian tetap menampilkan galat bentuk (P-38).
  await expect(a.page.getByRole("button", { name: "Gabung" })).toHaveAttribute("aria-disabled", "true");
  await isian.press("Enter");
  await expect(a.page.locator("main").getByText("Nama berisi 3–14 huruf, angka, atau spasi.")).toBeVisible();
  await isian.fill("Budi Anjing");
  await a.page.getByRole("button", { name: "Gabung" }).tap();
  await expect(a.page.locator("main").getByText("Nama itu tidak bisa dipakai. Coba nama lain.")).toBeVisible();
  await expect(isian).toHaveValue("Budi Anjing");
  await expect(isian).toBeFocused();
  await a.page.screenshot({ path: `${FOTO}/nama-bebas-galat-731x411.png` });
  await isian.fill("Raka Roda");
  await a.page.getByRole("button", { name: "Gabung" }).tap();
  await expect(dunia(a.page)).toHaveAttribute("data-diri", /^\d+,\d+$/);

  // Tinggi panel mode bebas tidak melebihi mode daftar di ukuran yang sama (P-36).
  const d = await pemain(browser, baseURL!, true);
  await d.page.goto(`/?kode=${kodeDaftar}`);
  await expect(d.page.getByRole("radiogroup", { name: "Nama samaran" })).toBeVisible();
  expect(tinggiBebas).toBeLessThanOrEqual((await tinggiPanel(d.page)) + 1);
  await d.ctx.close();

  // P-53, P-54: nama di lobi layar kelas sebagai tombol, menu, dan ganti nama tanpa konfirmasi.
  const tombol = g.getByRole("button", { name: "Kelola Raka Roda" });
  await expect(tombol).toBeVisible({ timeout: 10_000 });
  await tombol.click();
  const menu = g.getByRole("menu");
  await expect(menu.getByRole("menuitem", { name: "Ganti nama" })).toBeFocused();
  await g.screenshot({ path: `${FOTO}/kelas-menu-1024x768.png` });
  await g.setViewportSize({ width: 1920, height: 1080 });
  await g.waitForTimeout(200);
  await g.screenshot({ path: `${FOTO}/kelas-menu-1920x1080.png` });
  await g.setViewportSize({ width: 1024, height: 768 });
  await menu.getByRole("menuitem", { name: "Ganti nama" }).click();
  await expect(g.locator(".js-kelas-pita-kelola")).toHaveText("Nama pemain diganti.");
  await expect(g.getByText("Raka Roda")).toHaveCount(0);
  await expect(a.page.getByText(/Gurumu mengganti namamu menjadi /).first()).toBeAttached({ timeout: 5000 });

  // P-55: panel Pemain dengan P; keluarkan memakai konfirmasi tanpa nama.
  const b = await pemain(browser, baseURL!, false);
  await b.page.goto(`/?kode=${kode}`);
  await b.page.getByLabel("Nama pemain").fill("Komang Wira");
  await b.page.getByRole("radio", { name: "Avatar 4" }).click();
  await b.page.getByRole("button", { name: "Gabung" }).click();
  await expect(dunia(b.page)).toHaveAttribute("data-diri", /^\d+,\d+$/);
  await g.keyboard.press("KeyP");
  const panel = g.getByRole("dialog", { name: /^Pemain \(\d+\)$/ });
  await expect(panel).toBeVisible();
  await g.screenshot({ path: `${FOTO}/kelas-panel-pemain-1024x768.png` });
  await panel.getByRole("button", { name: "Kelola Komang Wira" }).click();
  await g.getByRole("menuitem", { name: "Keluarkan" }).click();
  const konfirmasi = g.getByRole("dialog", { name: "Keluarkan pemain ini?" });
  await expect(konfirmasi.getByText("Pemain ini tidak bisa bergabung lagi ke ruang ini.")).toBeVisible();
  await expect(konfirmasi.getByText("Komang Wira")).toHaveCount(0);
  await konfirmasi.getByRole("button", { name: "Keluarkan" }).click();
  await expect(g.locator(".js-kelas-pita-kelola")).toHaveText("Pemain dikeluarkan.");
  await expect(panel.getByRole("button", { name: "Kelola Komang Wira" })).toHaveCount(0);
  await panel.getByRole("button", { name: "Tutup" }).click();
  await expect(panel).toHaveCount(0);

  // P-29: M mematikan suara layar kelas.
  await g.keyboard.press("KeyM");
  await expect(g.getByRole("button", { name: "Suara mati. Tekan untuk menyalakan." })).toHaveAttribute("aria-pressed", "false");

  // P-44, P-45: lima penolakan lalu tampilan daftar.
  const c = await pemain(browser, baseURL!, false);
  await c.page.goto(`/?kode=${kode}`);
  await c.page.getByRole("radio", { name: "Avatar 5" }).click();
  for (let i = 0; i < 5; i++) {
    await c.page.getByLabel("Nama pemain").fill(`Tolol ${i + 1}`);
    await c.page.getByRole("button", { name: "Gabung" }).click();
    await c.page.waitForTimeout(400);
  }
  await expect(c.page.getByRole("radiogroup", { name: "Nama samaran" })).toBeVisible({ timeout: 5000 });
  await expect(c.page.getByLabel("Nama pemain")).toHaveCount(0);

  // P-52: Ganti semua nama dan Ganti nama di halaman ruang konsol.
  const e = await pemain(browser, baseURL!, false);
  await e.page.goto(`/?kode=${kode}`);
  await e.page.getByLabel("Nama pemain").fill("Gede Surya");
  await e.page.getByRole("radio", { name: "Avatar 6" }).click();
  await e.page.getByRole("button", { name: "Gabung" }).click();
  await expect(dunia(e.page)).toHaveAttribute("data-diri", /^\d+,\d+$/);
  const k = await guru.newPage();
  await k.setViewportSize({ width: 1280, height: 720 });
  await k.goto(`/admin/#/ruang/${id}`);
  await expect(k.locator('[data-baris="nama"]')).toContainText("Nama buatan siswa", { timeout: 15_000 });
  await k.getByRole("button", { name: "Ganti semua nama" }).click();
  const dlg = k.getByRole("dialog", { name: "Ganti semua nama buatan siswa?" });
  await dlg.getByRole("button", { name: "Ganti semua nama" }).click();
  await expect(k.getByText("1 nama diganti.")).toBeAttached({ timeout: 10_000 });
  await expect(k.locator('[data-baris="nama"]')).toContainText("Daftar nama samaran", { timeout: 10_000 });
  await expect(k.getByRole("button", { name: "Ganti semua nama" })).toHaveCount(0);
  await k.getByRole("button", { name: /^Ganti nama / }).first().click();
  await expect(k.getByText(/^Nama pemain diganti menjadi /)).toBeAttached({ timeout: 10_000 });
  await k.screenshot({ path: `${FOTO}/konsol-ruang-nama-1280x720.png` });
  for (const x of [a, b, c, e]) await x.ctx.close();
  await guru.close();
});

test("konsol: kelompok Nama pemain di dialog Ruang baru dan kredit suara di halaman masuk", async ({ browser, baseURL, request }) => {
  await tajukKonsol(request);
  const ctx = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  await p.goto("/admin/");
  await expect(p.getByText("Efek suara dibuat dengan kode oleh Claude (Anthropic) berdasarkan arahan dan persetujuan YAN.")).toBeVisible();
  await masukKonsol(p);
  await p.goto("/admin/#/ruang");
  await p.getByRole("button", { name: "+ Ruang baru" }).click();
  const dialog = p.getByRole("dialog", { name: "Ruang baru" });
  const kelompok = dialog.getByRole("group", { name: "Nama pemain" });
  await expect(kelompok.getByRole("radio", { name: /Daftar nama samaran/ })).toBeChecked();
  await expect(kelompok.getByText("Libatkan sekolah lebih dulu", { exact: false })).toBeVisible();
  await kelompok.getByRole("radio", { name: /Nama buatan siswa/ }).check();
  await p.screenshot({ path: `${FOTO}/konsol-ruang-baru-nama-1280x720.png` });
  // Ruang yang dibuat lewat dialog dengan "Nama buatan siswa" menampilkan isian nama di HP (P-32 sampai P-36).
  await dialog.getByLabel("Label kelas").fill("IX Dialog");
  await dialog.getByRole("button", { name: "Buat ruang" }).click();
  const dibuat = p.getByText(/^Ruang [A-Z0-9]{5} dibuat\.$/);
  await expect(dibuat).toBeVisible({ timeout: 10_000 });
  const kode = ((await dibuat.textContent()) ?? "").slice(6, 11);
  const hp = await browser.newContext({ baseURL, viewport: { width: 731, height: 411 }, isMobile: true, hasTouch: true });
  const h = await hp.newPage();
  await h.goto(`/?kode=${kode}`);
  await expect(h.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible();
  await expect(h.getByLabel("Nama pemain")).toBeVisible();
  await hp.close();
  await ctx.close();
});
