// Uji ujung ke ujung JS-16b: kode QR dan Perbesar QR di lobi layar kelas, tombol lobi 48 px, kode masuk ulang dari konsol,
// layar masuk ulang di HP, dan HP lama yang berhenti (spesifikasi JS-16b; AC-6, AC-7, AC-12, AC-13, AC-16, AC-20).
import { mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { buatQR, jalurSvg } from "../../app/jejak-setara/admin/kelas/qr";
import { PROTOKOL_VERSI } from "../../app/jejak-setara/inti/protokol";
import { buatRuang, EMAIL, idDariKode, kelas, SANDI, tajukKonsol, tutupRuangBerkas } from "./ruang-uji";

test.afterAll(tutupRuangBerkas);
const FOTO = "docs/jejak-setara/tests/JS-16b";
mkdirSync(FOTO, { recursive: true });
const HP = { viewport: { width: 731, height: 411 }, isMobile: true, hasTouch: true };

async function masukKonsol(page: Page): Promise<void> {
  await page.goto("/admin/");
  await page.getByLabel("Email", { exact: true }).fill(EMAIL);
  await page.getByLabel("Sandi", { exact: true }).fill(SANDI);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Dasbor" })).toBeVisible({ timeout: 15_000 });
}

async function gabung(page: Page, kode: string): Promise<string> {
  await page.goto(`/?kode=${kode}`);
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible({ timeout: 20_000 });
  const nama = page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first();
  const teks = (await nama.textContent())?.replace("▶", "").trim() ?? "";
  await nama.click();
  await page.getByRole("radio", { name: "Avatar 1" }).click();
  await page.getByRole("button", { name: "Gabung" }).click();
  await expect(page.getByRole("heading", { name: "Lobi" })).toBeVisible();
  return teks;
}

test("lobi layar kelas: kode QR, Perbesar QR, dan tombol 48 px di tiga ukuran layar kelas (AC-6, AC-7, AC-16)", async ({ browser, baseURL, request }) => {
  test.setTimeout(150_000);
  const kode = await buatRuang(request, { labelKelas: "IX QR" });
  const id = idDariKode(kode);
  await tajukKonsol(request);
  const guru = await browser.newContext({ baseURL, viewport: { width: 1024, height: 768 } });
  const g = await guru.newPage();
  await masukKonsol(g);
  await g.goto(`/admin/#/kelas/${id}`);
  await expect(g.locator(".js-kelas-kode")).toHaveText(kode, { timeout: 20_000 });
  const qr = g.locator(".js-kelas-qr svg.js-kelas-qr-gambar");
  await expect(qr).toHaveAttribute("aria-label", `Kode QR untuk bergabung ke ruang ${kode}`);
  // P-7: isi QR sama dengan matriks alamat gabung {tautan}/?kode={kode}.
  await expect(qr.locator("path")).toHaveAttribute("d", jalurSvg(buatQR(new URL(`/?kode=${kode}`, baseURL).href)).d);
  await expect(g.getByText("Pindai dengan kamera HP untuk bergabung.")).toBeVisible();
  for (const ukuran of [{ width: 1024, height: 768 }, { width: 1280, height: 720 }, { width: 1920, height: 1080 }]) {
    await g.setViewportSize(ukuran);
    const u = Math.min(ukuran.height * 0.01, ukuran.width * 0.005625);
    expect((await qr.boundingBox())!.width, `QR ${ukuran.width}`).toBeGreaterThanOrEqual(36 * u - 1);
    for (const nama of [/^Kunci ruang/, /^Mulai/]) {
      expect((await g.getByRole("button", { name: nama }).boundingBox())!.height, `${nama} ${ukuran.width}`).toBeGreaterThanOrEqual(48);
    }
    await g.screenshot({ path: `${FOTO}/lobi-qr-${ukuran.width}x${ukuran.height}.png` });
  }
  await g.setViewportSize({ width: 1024, height: 768 });
  // P-9: Q membuka lapisan; L tidak bekerja selama lapisan terbuka; Esc menutup dan fokus kembali ke tombolnya.
  await g.keyboard.press("q");
  const lapisan = g.getByRole("dialog", { name: `Kode QR untuk bergabung ke ruang ${kode}` });
  await expect(lapisan).toBeVisible();
  await expect(lapisan.getByRole("button", { name: /^Tutup/ })).toBeFocused();
  expect((await lapisan.locator("svg").boundingBox())!.width).toBeGreaterThanOrEqual(768 * 0.8 - 2);
  await g.screenshot({ path: `${FOTO}/perbesar-qr-1024x768.png` });
  await g.keyboard.press("l");
  await g.keyboard.press("Escape");
  await expect(lapisan).toBeHidden();
  await expect(g.getByRole("button", { name: /^Perbesar QR/ })).toBeFocused();
  await expect(g.getByRole("button", { name: /^Kunci ruang/ })).toBeVisible();
  await g.getByRole("button", { name: /^Perbesar QR/ }).click();
  await expect(lapisan).toBeVisible();
  await g.keyboard.press("q");
  await expect(lapisan).toBeHidden();
  // Lapisan tertutup sendiri saat ronde dimulai.
  const hp = await browser.newContext({ baseURL, ...HP });
  await gabung(await hp.newPage(), kode);
  await g.keyboard.press("q");
  await expect(lapisan).toBeVisible();
  await kelas(request, kode, { v: PROTOKOL_VERSI, t: "mulai" });
  await expect(lapisan).toBeHidden({ timeout: 10_000 });
  await guru.close();
  await hp.close();
});

test("kode masuk ulang: guru membuat kode di konsol, HP baru masuk dengan nama yang sama, HP lama berhenti (AC-12, AC-13)", async ({ browser, baseURL, request }) => {
  test.setTimeout(150_000);
  const kode = await buatRuang(request, { labelKelas: "IX Pindah HP" });
  const id = idDariKode(kode);
  await tajukKonsol(request);
  const a = await browser.newContext({ baseURL, ...HP });
  const pa = await a.newPage();
  const nama = await gabung(pa, kode);
  const guru = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 } });
  const g = await guru.newPage();
  await masukKonsol(g);
  await g.goto(`/admin/#/ruang/${id}`);
  await g.getByRole("button", { name: `Buat kode masuk ulang untuk ${nama}` }).click({ timeout: 20_000 });
  const dialog = g.getByRole("dialog", { name: `Kode masuk ulang untuk ${nama}` });
  await expect(dialog).toBeVisible();
  const kodeUlang = ((await dialog.locator(".js-konsol-kode-ulang").textContent()) ?? "").trim();
  expect(kodeUlang).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
  await expect(dialog.getByText(`mengetik kode ruang ${kode}`, { exact: false })).toBeVisible();
  await expect(dialog.getByText(/^Berlaku sampai pukul \d{2}\.\d{2} \(sisa (10:00|9:\d{2})\)\.$/)).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Salin kode" })).toBeVisible();
  await g.screenshot({ path: `${FOTO}/konsol-kode-masuk-ulang-1280x720.png` });

  // P-13: HP baru membuka layar masuk ulang; galat format, kode salah, lalu kode benar (huruf kecil diterima).
  const b = await browser.newContext({ baseURL, ...HP });
  const pb = await b.newPage();
  await pb.goto("/");
  await pb.getByRole("button", { name: "Masuk dengan kode dari guru" }).click({ timeout: 20_000 });
  await expect(pb.getByRole("heading", { name: "Masuk dengan kode dari guru" })).toBeVisible();
  await pb.getByLabel("Kode ruang").fill(kode);
  await pb.getByLabel("Kode dari guru").fill("ABC");
  await pb.getByLabel("Kode dari guru").press("Enter");
  await expect(pb.getByText("Kode dari guru berisi 6 huruf atau angka.")).toBeVisible();
  await pb.screenshot({ path: `${FOTO}/masuk-ulang-731x411.png` });
  await pb.getByLabel("Kode dari guru").fill(kodeUlang === "AAAAAA" ? "BBBBBB" : "AAAAAA");
  await pb.getByLabel("Kode dari guru").press("Enter");
  // Teks galat tampil di pita galat dan juga diumumkan lewat wilayah langsung; yang diperiksa pita galatnya.
  await expect(pb.locator("#js-masuk-ulang-galat")).toContainText("Kode dari guru salah atau sudah tidak berlaku. Minta kode baru.", { timeout: 20_000 });
  await pb.getByLabel("Kode dari guru").fill(kodeUlang.toLowerCase());
  await pb.getByLabel("Kode dari guru").press("Enter");
  await expect(pb.getByRole("heading", { name: "Lobi" })).toBeVisible({ timeout: 20_000 });
  await expect(pb.getByText(nama).first()).toBeVisible();
  await pb.screenshot({ path: `${FOTO}/lobi-sesudah-masuk-ulang-731x411.png` });

  // P-15: HP lama berhenti dengan pesan dan tidak menyambung ulang.
  const pesan = pa.getByText("Kamu sudah masuk dari perangkat lain. Lanjutkan bermain di perangkat itu.");
  await expect(pesan).toBeVisible({ timeout: 15_000 });
  await pa.waitForTimeout(4000);
  await expect(pesan).toBeVisible();
  await pa.screenshot({ path: `${FOTO}/perangkat-lama-731x411.png` });
  await dialog.getByRole("button", { name: "Tutup" }).click();
  await expect(dialog).toBeHidden();
  await a.close();
  await b.close();
  await guru.close();
});
