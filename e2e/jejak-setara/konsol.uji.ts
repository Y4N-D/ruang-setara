// Uji ujung ke ujung konsol guru dan admin (spesifikasi JS-04, rencana uji "Uji ujung ke ujung"; AC-13 sampai AC-18).
// Admin dibuat lewat POST /api/admin-awal dengan kunci lokal (P-31). Urutan uji penting (mode serial): admin YAN dan guru
// Bu Sari dipakai beberapa uji berturut-turut. Galat yang sengaja diuji (401, 403, dan 429) dicatat terpisah.
import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { d1 } from "../../server/jejak-setara/uji/bantuan";

test.describe.configure({ mode: "serial" });

const LAYAR = "test-results-jejak/layar";
const KEADAAN = "test-results-jejak/keadaan-4310";
const KUNCI_ADMIN = "lokal-kunci-admin-bukan-rahasia";
const UKURAN = [
  { nama: "731x411", width: 731, height: 411, hp: true },
  { nama: "1280x720", width: 1280, height: 720, hp: false },
  { nama: "1024x768", width: 1024, height: 768, hp: false },
  { nama: "1920x1080", width: 1920, height: 1080, hp: false },
] as const;
const POLA_SANDI = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}(-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}){3}$/;

const ADMIN = { email: "yan@contoh.sch.id", awal: "sandi-awal-12345", sandi: "kalimat sandi admin", nama: "YAN" };
const GURU = { email: "sari@contoh.sch.id", nama: "Bu Sari", sandi: "sandi bu sari baru" };

type Catatan = { konsol: string[]; respons: string[]; luar: string[] };

/** Galat konsol, respons 4xx dan 5xx, dan permintaan ke alamat lain; `izinkan` untuk galat yang sengaja diuji. */
async function pantau(page: Page, asal: string, izinkan: RegExp[] = []): Promise<Catatan> {
  const c: Catatan = { konsol: [], respons: [], luar: [] };
  page.on("console", (m) => {
    if ((m.type() === "error" || m.type() === "warning") && !izinkan.some((p) => p.test(m.text()))) c.konsol.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (g) => c.konsol.push(`pageerror: ${g.message}`));
  page.on("response", (j) => {
    if (j.status() >= 400 && !izinkan.some((p) => p.test(`${j.status()} ${j.request().method()} ${new URL(j.url()).pathname}`))) {
      c.respons.push(`${j.status()} ${j.request().method()} ${j.url()}`);
    }
  });
  page.on("request", (p) => {
    const url = p.url();
    if (!url.startsWith(asal) && !url.startsWith("data:") && !url.startsWith("blob:")) c.luar.push(url);
  });
  await page.addInitScript(() => {
    const daftar: string[] = [];
    (window as unknown as { __csp: string[] }).__csp = daftar;
    document.addEventListener("securitypolicyviolation", (e) => daftar.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  return c;
}

const csp = (page: Page) => page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []);
const GAGAL_MUAT = /Failed to load resource: the server responded with a status of (401|403|409|429)/;

async function adminAwal(request: APIRequestContext, email: string, sandi = ADMIN.awal, nama = ADMIN.nama): Promise<string> {
  const j = await request.post("/api/admin-awal", { headers: { "X-Jejak-Kunci-Admin": KUNCI_ADMIN }, data: { email, sandi, namaTampilan: nama } });
  expect(j.status()).toBe(200);
  return ((await j.json()) as { hasil: string }).hasil;
}

async function konteks(browser: Browser, baseURL: string, ukuran: { width: number; height: number; hp?: boolean } = { width: 1280, height: 720 }) {
  const ctx = await browser.newContext({
    baseURL,
    viewport: { width: ukuran.width, height: ukuran.height },
    ...(ukuran.hp ? { isMobile: true, hasTouch: true } : {}),
    permissions: ["clipboard-read", "clipboard-write"],
    timezoneId: "Asia/Makassar",
  });
  return { ctx, page: await ctx.newPage() };
}

const kolom = (page: Page, label: string) => page.getByLabel(label, { exact: true });

async function masuk(page: Page, email: string, sandi: string) {
  await page.goto("/admin/");
  await kolom(page, "Email").fill(email);
  await kolom(page, "Sandi").fill(sandi);
  await page.getByRole("button", { name: "Masuk" }).click();
}

async function gantiSandiWajib(page: Page, sandi: string) {
  await expect(page.getByRole("heading", { name: "Buat sandi baru" })).toBeVisible();
  await kolom(page, "Sandi baru").fill(sandi);
  await kolom(page, "Ulangi sandi baru").fill(sandi);
  await page.getByRole("button", { name: "Simpan sandi" }).click();
  await expect(page.getByText("Sandi baru tersimpan.")).toBeVisible();
}

/** Semua tombol, tautan, kolom, dan kotak centang yang tampil setinggi sedikitnya 48 px (P-50). */
async function targetKecil(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".js-konsol-ruang :is(button, a, input:not([type=checkbox]), select, .js-konsol-centang)")]
      .filter((el) => el.getClientRects().length > 0)
      .filter((el) => el.getBoundingClientRect().height < 47.5)
      .map((el) => `${el.tagName} "${el.textContent?.trim() || el.getAttribute("aria-label") || ""}" ${el.getBoundingClientRect().height}`),
  );
}

let admin: { ctx: BrowserContext; page: Page; catatan: Catatan };
let guru: { ctx: BrowserContext; page: Page; catatan: Catatan };
let sandiGuru = "";

test.afterAll(async () => {
  await admin?.ctx.close();
  await guru?.ctx.close();
});

test("admin 1280 × 720: halaman masuk, sandi salah, sandi sementara, ganti sandi wajib, lalu dasbor (AC-13, AC-14, AC-15)", async ({ browser, baseURL, request }) => {
  expect(await adminAwal(request, ADMIN.email)).toBe("dibuat");
  const { ctx, page } = await konteks(browser, baseURL!);
  admin = { ctx, page, catatan: await pantau(page, baseURL!, [GAGAL_MUAT, /^401 POST \/api\/masuk$/, /^409 POST \/api\/akun$/]) };
  const permintaanMasuk: string[] = [];
  page.on("request", (p) => {
    if (p.url().endsWith("/api/masuk") || p.url().endsWith("/api/sandi")) permintaanMasuk.push(p.url());
  });

  await page.goto("/admin/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Jejak Setara");
  await expect(page).toHaveURL(/\/admin\/#\/masuk$/);
  await expect(page.getByText("Konsol guru dan admin")).toBeVisible();
  await expect(page.locator(".js-status")).toHaveText("✓ Server siap");
  await expect(page.getByText("Aset visual digambar dengan kode oleh Claude (Anthropic) berdasarkan arahan dan persetujuan YAN.")).toBeVisible();
  await expect(page.getByText("Huruf Press Start 2P dan Pixelify Sans, SIL Open Font License 1.1.")).toBeVisible();
  await expect(kolom(page, "Email")).toHaveAttribute("autocomplete", "username");
  await expect(kolom(page, "Email")).toHaveAttribute("type", "email");
  await expect(kolom(page, "Sandi")).toHaveAttribute("autocomplete", "current-password");

  // Kolom kosong: tanpa permintaan ke server.
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("alert")).toHaveText("Isi email dan sandi.");
  await expect(kolom(page, "Email")).toBeFocused();
  expect(permintaanMasuk).toEqual([]);

  // Tampilkan sandi (P-40), lalu sandi salah: pesan di bawah kolom Sandi, kolom dikosongkan dan difokus.
  await kolom(page, "Email").fill(ADMIN.email);
  await kolom(page, "Sandi").fill("sandi yang salah");
  const tampilkan = page.getByRole("button", { name: "Tampilkan" });
  await tampilkan.click();
  await expect(kolom(page, "Sandi")).toHaveAttribute("type", "text");
  await expect(page.getByRole("button", { name: "Sembunyikan" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("alert")).toHaveText("Email atau sandi salah.");
  await expect(kolom(page, "Sandi")).toHaveValue("");
  await expect(kolom(page, "Sandi")).toBeFocused();
  await expect(kolom(page, "Sandi")).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "Tampilkan" })).toHaveAttribute("aria-pressed", "false");
  const idGalat = await kolom(page, "Sandi").getAttribute("aria-describedby");
  expect(idGalat).toBeTruthy();
  await expect(page.locator(`[id="${idGalat}"]`)).toHaveText("Email atau sandi salah.");

  // Sandi sementara: halaman "Buat sandi baru" dengan kepala tanpa menu.
  await kolom(page, "Sandi").fill(ADMIN.awal);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("heading", { name: "Buat sandi baru" })).toBeVisible();
  await expect(page).toHaveURL(/#\/sandi$/);
  await expect(page.getByText("Anda masuk dengan sandi sementara. Buat sandi baru sebelum memakai konsol.")).toBeVisible();
  await expect(page.getByText("YAN · Admin")).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0);
  await expect(page.getByText("Minimal 12 karakter. Kalimat pendek yang mudah Anda ingat lebih kuat daripada kata acak yang pendek.")).toBeVisible();

  // Pemeriksaan sebelum mengirim (P-41): kedua sandi tidak sama, lalu terlalu pendek. Tanpa permintaan ke server.
  const sebelum = permintaanMasuk.length;
  await kolom(page, "Sandi baru").fill(ADMIN.sandi);
  await kolom(page, "Ulangi sandi baru").fill(ADMIN.sandi + "x");
  await page.getByRole("button", { name: "Simpan sandi" }).click();
  await expect(page.getByRole("alert")).toHaveText("Kedua sandi baru tidak sama.");
  await expect(kolom(page, "Ulangi sandi baru")).toBeFocused();
  await kolom(page, "Sandi baru").fill("pendek");
  await kolom(page, "Ulangi sandi baru").fill("pendek");
  await page.getByRole("button", { name: "Simpan sandi" }).click();
  await expect(page.getByRole("alert")).toHaveText("Sandi baru minimal 12 karakter.");
  await expect(kolom(page, "Sandi baru")).toBeFocused();
  expect(permintaanMasuk.length).toBe(sebelum);

  await gantiSandiWajib(page, ADMIN.sandi);
  await expect(page).toHaveURL(/#\/dasbor$/);
  await expect(page.getByText("Selamat datang, YAN.")).toBeVisible();
  await expect(page.locator(".js-konsol-peringatan")).toHaveText(
    "23 rujukan belum diverifikasi. Kejadian belum bisa terbit sampai semua rujukannya diverifikasi Peninjau.",
  );
  await expect(page.getByText("Belum ada ruang yang berjalan.")).toBeVisible();
  await expect(page.getByText("Belum ada sesi kelas.")).toBeVisible();
  const menu = page.getByRole("navigation", { name: "Menu konsol" });
  await expect(menu.getByRole("link")).toHaveText(["Dasbor", "Akun", "Sandi saya"]);
  await expect(menu.getByRole("link", { name: "Dasbor" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dasbor");
  expect(await targetKecil(page)).toEqual([]);
});

test("admin: akun baru, dialog sandi sementara sekali tampil, salin sandi, dan tabel (AC-16)", async () => {
  const { page } = admin;
  await page.getByRole("link", { name: "Akun" }).click();
  await expect(page).toHaveURL(/#\/akun$/);
  await expect(page.getByText("1 akun · 1 aktif")).toBeVisible();
  await expect(page.getByRole("row", { name: /YAN \(Anda\)/ })).toBeVisible();

  const tombolBaru = page.getByRole("button", { name: "+ Akun baru" });
  await tombolBaru.click();
  const dialog = page.getByRole("dialog", { name: "Akun baru" });
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(kolom(page, "Email")).toBeFocused();
  await expect(dialog.getByText("Nama yang tampil di konsol, misalnya Bu Sari.")).toBeVisible();
  await expect(dialog.getByLabel("Peran")).toHaveValue("guru");
  await kolom(page, "Email").fill("bukan email");
  await kolom(page, "Nama tampilan").fill(GURU.nama);
  await dialog.getByRole("button", { name: "Buat akun" }).click();
  await expect(dialog.getByRole("alert")).toHaveText("Tulis email yang benar, misalnya nama@sekolah.sch.id.");
  await expect(kolom(page, "Email")).toBeFocused();
  await kolom(page, "Email").fill(GURU.email);
  await dialog.getByRole("button", { name: "Buat akun" }).click();

  const sementara = page.getByRole("dialog", { name: "Akun baru dibuat" });
  await expect(sementara.getByText("Akun Bu Sari (Guru) sudah dibuat.")).toBeVisible();
  await expect(sementara.getByText("Berikan sandi ini langsung kepada pemilik akun. Sandi hanya tampil sekali dan wajib diganti saat masuk pertama.")).toBeVisible();
  sandiGuru = (await sementara.locator(".js-konsol-sandi-sementara").textContent()) ?? "";
  expect(sandiGuru).toMatch(POLA_SANDI);
  await expect(sementara.locator(".js-konsol-sandi-sementara")).toHaveCSS("font-family", /Press Start 2P/);
  await expect(sementara.locator(".js-konsol-sandi-sementara")).toHaveCSS("font-size", "16px");
  await expect(sementara.getByRole("button", { name: "Salin sandi" })).toBeFocused();

  // Esc tidak menutup dialog sandi sementara; Tab berputar di dalam dialog.
  await page.keyboard.press("Escape");
  await expect(sementara).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(sementara.getByRole("button", { name: "Selesai" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(sementara.getByRole("button", { name: "Salin sandi" })).toBeFocused();

  await sementara.getByRole("button", { name: "Salin sandi" }).click();
  await expect(sementara.getByText("Sandi disalin.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(sandiGuru);
  await sementara.getByRole("button", { name: "Selesai" }).click();
  await expect(sementara).toHaveCount(0);
  await expect(tombolBaru).toBeFocused();
  await expect(page.getByText(sandiGuru)).toHaveCount(0);

  const baris = page.getByRole("row", { name: /Bu Sari/ });
  await expect(baris).toContainText("sari@contoh.sch.id");
  await expect(baris).toContainText("Guru");
  await expect(baris).toContainText("Aktif");
  await expect(baris).toContainText("Belum ganti sandi");
  await expect(baris).toContainText("Belum pernah");
  await expect(page.getByText("2 akun · 2 aktif")).toBeVisible();
  await expect(page.getByRole("row", { name: /YAN \(Anda\)/ })).toContainText(/\d{1,2} \w{3} \d{4}, \d{2}\.\d{2}/);
  await expect(page.locator(".js-konsol-tabel td").first()).toHaveCSS("font-family", /system-ui/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-family", /Pixelify Sans/);

  // Email yang sudah dipakai: pesan di bawah kolom Email; Esc menutup dialog dan fokus kembali ke pembukanya.
  await tombolBaru.click();
  await kolom(page, "Email").fill(GURU.email.toUpperCase());
  await kolom(page, "Nama tampilan").fill("Sari Lain");
  await page.getByRole("button", { name: "Buat akun" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toHaveText("Email ini sudah dipakai akun lain.");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(tombolBaru).toBeFocused();
  expect(await targetKecil(page)).toEqual([]);
});

test("guru HP 731 × 411 lalu 1024 × 768: sandi sementara, ganti sandi, tanpa menu Akun, tombol Menu (AC-14, AC-17)", async ({ browser, baseURL }) => {
  const { ctx, page } = await konteks(browser, baseURL!, { width: 731, height: 411, hp: true });
  guru = { ctx, page, catatan: await pantau(page, baseURL!, [GAGAL_MUAT, /^401 GET \/api\/dasbor$/, /^401 POST \/api\/masuk$/]) };
  await masuk(page, GURU.email, sandiGuru);
  await gantiSandiWajib(page, GURU.sandi);
  await expect(page.getByText("Selamat datang, Bu Sari.")).toBeVisible();
  await expect(page.getByText("Bu Sari · Guru")).toBeVisible();
  await expect(page.locator(".js-konsol-peringatan")).toContainText("23 rujukan belum diverifikasi.");

  // Di bawah 1024 px navigasi samping tersembunyi; tombol Menu membuka daftar menu (D-2a).
  const tombolMenu = page.getByRole("button", { name: "Menu" });
  await expect(page.locator(".js-konsol-samping")).toBeHidden();
  await expect(tombolMenu).toHaveAttribute("aria-expanded", "false");
  await tombolMenu.tap();
  await expect(tombolMenu).toHaveAttribute("aria-expanded", "true");
  const menu = page.getByRole("navigation", { name: "Menu konsol" });
  await expect(menu.getByRole("link")).toHaveText(["Dasbor", "Sandi saya"]);
  await page.screenshot({ path: `${LAYAR}/konsol-menu-731x411.png` });
  await menu.getByRole("link", { name: "Sandi saya" }).tap();
  await expect(tombolMenu).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sandi saya");

  await page.goto("/admin/#/akun");
  await expect(page.getByText("Halaman ini hanya untuk admin.")).toBeVisible();
  await page.getByRole("link", { name: "Ke dasbor" }).tap();
  await expect(page).toHaveURL(/#\/dasbor$/);

  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator(".js-konsol-samping")).toBeVisible();
  await expect(tombolMenu).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Menu konsol" }).getByRole("link")).toHaveText(["Dasbor", "Sandi saya"]);
});

test("nonaktif dan atur ulang: konfirmasi, sesi guru berakhir, aktif lagi, sandi sementara baru (AC-14, AC-16)", async () => {
  const { page } = admin;
  const tombolUbah = page.getByRole("button", { name: "Ubah akun Bu Sari" });
  await tombolUbah.click();
  const ubah = page.getByRole("dialog", { name: "Ubah akun Bu Sari" });
  await expect(kolom(page, "Nama tampilan")).toBeFocused();
  await ubah.getByRole("button", { name: "Nonaktifkan akun" }).click();
  const konfirmasi = page.getByRole("dialog", { name: "Nonaktifkan akun Bu Sari?" });
  await expect(konfirmasi.getByText("Bu Sari tidak bisa masuk lagi dan dikeluarkan dari semua perangkat. Akun bisa diaktifkan kembali kapan saja.")).toBeVisible();
  await expect(konfirmasi.getByRole("button", { name: "Batal" })).toBeFocused();
  await expect(konfirmasi.getByRole("button", { name: "Nonaktifkan" })).toHaveCSS("background-color", "rgb(255, 107, 91)");
  // Batal kembali ke dialog ubah; konfirmasi lagi lalu nonaktifkan.
  await konfirmasi.getByRole("button", { name: "Batal" }).click();
  await expect(ubah).toBeVisible();
  await ubah.getByRole("button", { name: "Nonaktifkan akun" }).click();
  await page.getByRole("dialog", { name: "Nonaktifkan akun Bu Sari?" }).getByRole("button", { name: "Nonaktifkan" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Perubahan tersimpan.")).toBeVisible();
  await expect(tombolUbah).toBeFocused();
  await expect(page.getByRole("row", { name: /Bu Sari/ })).toContainText("Nonaktif");
  await expect(page.getByText("2 akun · 1 aktif")).toBeVisible();

  // Permintaan guru berikutnya dijawab 401: konsol kembali ke halaman masuk dengan pemberitahuan (P-48).
  await guru.page.getByRole("link", { name: "Sandi saya" }).click();
  await guru.page.getByRole("link", { name: "Dasbor" }).click();
  await expect(guru.page.getByRole("status").filter({ hasText: "Sesi berakhir. Silakan masuk lagi." })).toBeVisible();
  await expect(guru.page).toHaveURL(/#\/masuk$/);
  await kolom(guru.page, "Email").fill(GURU.email);
  await kolom(guru.page, "Sandi").fill(GURU.sandi);
  await guru.page.getByRole("button", { name: "Masuk" }).click();
  await expect(guru.page.getByRole("alert")).toHaveText("Email atau sandi salah.");

  // Aktifkan lagi, lalu atur ulang sandi lewat konfirmasi.
  await tombolUbah.click();
  await page.getByRole("dialog", { name: "Ubah akun Bu Sari" }).getByRole("button", { name: "Aktifkan akun" }).click();
  await expect(page.getByText("Akun Bu Sari aktif lagi.")).toBeVisible();
  await tombolUbah.click();
  await page.getByRole("dialog", { name: "Ubah akun Bu Sari" }).getByRole("button", { name: "Atur ulang sandi" }).click();
  const atur = page.getByRole("dialog", { name: "Atur ulang sandi Bu Sari?" });
  await expect(atur.getByText("Sandi lama tidak berlaku lagi, dan Bu Sari dikeluarkan dari semua perangkat. Sandi sementara baru hanya tampil sekali.")).toBeVisible();
  await atur.getByRole("button", { name: "Atur ulang sandi" }).click();
  const sementara = page.getByRole("dialog", { name: "Sandi diatur ulang" });
  await expect(sementara.getByText("Sandi Bu Sari sudah diatur ulang.")).toBeVisible();
  const baru = (await sementara.locator(".js-konsol-sandi-sementara").textContent()) ?? "";
  expect(baru).toMatch(POLA_SANDI);
  expect(baru).not.toBe(sandiGuru);
  await sementara.getByRole("button", { name: "Selesai" }).click();
  await expect(tombolUbah).toBeFocused();

  await kolom(guru.page, "Sandi").fill(baru);
  await guru.page.getByRole("button", { name: "Masuk" }).click();
  await expect(guru.page.getByRole("heading", { name: "Buat sandi baru" })).toBeVisible();
  await gantiSandiWajib(guru.page, GURU.sandi + " lagi");
  sandiGuru = GURU.sandi + " lagi";
});

test("akun sendiri: peran, nonaktifkan, dan atur ulang dimatikan dengan catatan; peran turun membaca ulang akun (AC-14, AC-16)", async ({ browser, baseURL, request }) => {
  const { page } = admin;
  await page.getByRole("button", { name: "Ubah akun YAN" }).click();
  const ubah = page.getByRole("dialog", { name: "Ubah akun YAN" });
  await expect(ubah.getByLabel("Peran")).toBeDisabled();
  await expect(ubah.getByRole("button", { name: "Nonaktifkan akun" })).toBeDisabled();
  await expect(ubah.getByRole("button", { name: "Atur ulang sandi" })).toBeDisabled();
  await expect(ubah.getByText("Anda tidak bisa menurunkan peran, menonaktifkan, atau mengatur ulang sandi akun sendiri. Ganti sandi Anda lewat Sandi saya.")).toBeVisible();
  await page.keyboard.press("Escape");

  // Admin kedua yang perannya diturunkan saat sedang di halaman Akun (P-48: 403 TIDAK_BERWENANG).
  await adminAwal(request, "made@contoh.sch.id", ADMIN.awal, "Pak Made");
  const kedua = await konteks(browser, baseURL!);
  const catatan = await pantau(kedua.page, baseURL!, [GAGAL_MUAT, /^403 POST \/api\/akun$/]);
  await masuk(kedua.page, "made@contoh.sch.id", ADMIN.awal);
  await gantiSandiWajib(kedua.page, "sandi pak made baru");
  await kedua.page.getByRole("link", { name: "Akun" }).click();
  await expect(kedua.page.getByRole("button", { name: "+ Akun baru" })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Ubah akun Pak Made" }).click();
  await page.getByRole("dialog").getByLabel("Peran").selectOption("guru");
  await page.getByRole("dialog").getByRole("button", { name: "Simpan perubahan" }).click();
  await expect(page.getByText("Perubahan tersimpan.")).toBeVisible();

  await kedua.page.getByRole("button", { name: "+ Akun baru" }).click();
  await kolom(kedua.page, "Email").fill("lain@contoh.sch.id");
  await kolom(kedua.page, "Nama tampilan").fill("Lain");
  await kedua.page.getByRole("button", { name: "Buat akun" }).click();
  await expect(kedua.page.getByRole("alert")).toHaveText("Anda tidak berwenang melakukan ini.");
  await expect(kedua.page.getByText("Halaman ini hanya untuk admin.")).toBeVisible();
  await expect(kedua.page.getByRole("navigation", { name: "Menu konsol" }).getByRole("link")).toHaveText(["Dasbor", "Sandi saya"]);
  expect(catatan).toEqual({ konsol: [], respons: [], luar: [] });
  await kedua.ctx.close();
});

test("penguncian: lima sandi salah untuk satu email, lalu pesan TERKUNCI di percobaan keenam (AC-14)", async ({ browser, baseURL }) => {
  const { ctx, page } = await konteks(browser, baseURL!);
  const catatan = await pantau(page, baseURL!, [GAGAL_MUAT, /^(401|429) POST \/api\/masuk$/]);
  await page.goto("/admin/");
  await kolom(page, "Email").fill(GURU.email);
  for (let i = 0; i < 5; i++) {
    await kolom(page, "Sandi").fill(`sandi salah ${i}`);
    await page.getByRole("button", { name: "Masuk" }).click();
    await expect(page.getByRole("alert")).toHaveText("Email atau sandi salah.");
    await expect(kolom(page, "Sandi")).toHaveValue("");
  }
  await kolom(page, "Sandi").fill(sandiGuru);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("alert")).toHaveText("Terlalu banyak percobaan masuk. Tunggu 15 menit, lalu coba lagi.");
  await page.screenshot({ path: `${LAYAR}/konsol-terkunci-1280x720.png` });
  expect(catatan.konsol).toEqual([]);
  expect(catatan.luar).toEqual([]);
  d1("DELETE FROM batas_masuk", KEADAAN);
  await ctx.close();
});

test("papan ketik saja: masuk, ganti sandi, membuka dialog akun baru, mengisi, dan menutup (AC-18)", async ({ browser, baseURL, request }) => {
  await adminAwal(request, "kunci@contoh.sch.id", ADMIN.awal, "Bu Wulan");
  const { ctx, page } = await konteks(browser, baseURL!);
  const catatan = await pantau(page, baseURL!);
  await page.goto("/admin/");
  await expect(kolom(page, "Email")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(kolom(page, "Email")).toBeFocused();
  await page.keyboard.type("kunci@contoh.sch.id");
  await page.keyboard.press("Tab");
  await expect(kolom(page, "Sandi")).toBeFocused();
  await page.keyboard.type(ADMIN.awal);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Tampilkan" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(kolom(page, "Sandi")).toHaveAttribute("type", "text");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Masuk" })).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("heading", { name: "Buat sandi baru" })).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(kolom(page, "Sandi baru")).toBeFocused();
  await page.keyboard.type("sandi bu wulan baru");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(kolom(page, "Ulangi sandi baru")).toBeFocused();
  await page.keyboard.type("sandi bu wulan baru");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Selamat datang, Bu Wulan.")).toBeVisible();

  // Menu samping: Dasbor, Akun.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Akun" })).toBeFocused();
  await page.keyboard.press("Enter");
  const tombolBaru = page.getByRole("button", { name: "+ Akun baru" });
  await expect(tombolBaru).toBeVisible();
  // Dari menu Akun: Sandi saya, Keluar, lalu "+ Akun baru".
  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
  await expect(tombolBaru).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(kolom(page, "Email")).toBeFocused();
  await page.keyboard.type("dewi@contoh.sch.id");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Bu Dewi");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("dialog").getByLabel("Peran")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("checkbox", { name: "Peninjau (boleh menandai rujukan terverifikasi)" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByRole("checkbox", { name: "Peninjau (boleh menandai rujukan terverifikasi)" })).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Buat akun" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Akun baru dibuat" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Akun baru dibuat" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Selesai" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(tombolBaru).toBeFocused();
  await expect(page.getByRole("row", { name: /Bu Dewi/ })).toContainText("Peninjau");

  // Dialog lain ditutup dengan Esc; fokus kembali ke pembukanya.
  await page.keyboard.press("Space");
  await expect(page.getByRole("dialog", { name: "Akun baru" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(tombolBaru).toBeFocused();

  // Garis fokus: ink 2 px di dalam, sun 4 px di luar (P-50).
  await expect(tombolBaru).toHaveCSS("outline-color", "rgb(31, 42, 68)");
  await expect(tombolBaru).toHaveCSS("outline-width", "2px");
  await expect(tombolBaru).toHaveCSS("box-shadow", "rgb(255, 210, 63) 0px 0px 0px 6px");
  expect(await csp(page)).toEqual([]);
  expect(catatan).toEqual({ konsol: [], respons: [], luar: [] });
  await ctx.close();
});

test("keluar: kembali ke halaman masuk tanpa pemberitahuan; GET /api/saya masuk: false (AC-14)", async () => {
  const { page } = admin;
  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Jejak Setara");
  await expect(page).toHaveURL(/#\/masuk$/);
  await expect(page.getByText("Sesi berakhir. Silakan masuk lagi.")).toHaveCount(0);
  expect(await (await page.request.get("/api/saya")).json()).toEqual({ masuk: false });
  expect(await csp(page)).toEqual([]);
  expect(admin.catatan).toEqual({ konsol: [], respons: [], luar: [] });
  expect(await csp(guru.page)).toEqual([]);
  expect(guru.catatan).toEqual({ konsol: [], respons: [], luar: [] });
});

test("memuat, server tidak menjawab, menunggu, dan data gagal dimuat (AC-13, AC-14)", async ({ browser, baseURL }) => {
  const { ctx, page } = await konteks(browser, baseURL!);
  const catatan = await pantau(page, baseURL!, [/Failed to load resource: the server responded with a status of 500/, /^500 GET \/api\/(dasbor|akun)$/]);

  // Memuat konsol selama GET /api/saya ditahan, lalu server tidak menjawab.
  let lepas: () => void = () => {};
  const tertahan = new Promise<void>((selesai) => (lepas = selesai));
  await page.route("**/api/saya", async (route) => {
    await tertahan;
    await route.abort();
  });
  await page.goto("/admin/");
  await expect(page.getByRole("status")).toHaveText("Memuat konsol…");
  lepas();
  await expect(page.getByRole("alert")).toHaveText("Server belum tersambung. Periksa internet, lalu muat ulang halaman.");
  await page.unroute("**/api/saya");
  await page.getByRole("button", { name: "Muat ulang" }).click();
  await expect(kolom(page, "Email")).toBeVisible();

  // Memeriksa…: tombol nonaktif selama POST /api/masuk ditahan.
  let lepasMasuk: () => void = () => {};
  const masukTertahan = new Promise<void>((selesai) => (lepasMasuk = selesai));
  await page.route("**/api/masuk", async (route) => {
    await masukTertahan;
    await route.continue();
  });
  await kolom(page, "Email").fill(ADMIN.email);
  await kolom(page, "Sandi").fill(ADMIN.sandi);
  await page.getByRole("button", { name: "Masuk" }).click();
  const tombol = page.getByRole("button", { name: "Memeriksa…" });
  await expect(tombol).toHaveAttribute("aria-disabled", "true");
  await expect(kolom(page, "Email")).toBeVisible();
  lepasMasuk();
  await expect(page.getByText("Selamat datang, YAN.")).toBeVisible();

  // Data dasbor dan daftar akun gagal dimuat, lalu Coba lagi.
  await page.route("**/api/dasbor", (route) => route.fulfill({ status: 500, contentType: "text/plain", body: "galat" }));
  await page.getByRole("link", { name: "Sandi saya" }).click();
  await page.getByRole("link", { name: "Dasbor" }).click();
  await expect(page.getByRole("alert")).toHaveText("Data dasbor gagal dimuat.");
  await page.unroute("**/api/dasbor");
  await page.getByRole("button", { name: "Coba lagi" }).click();
  await expect(page.locator(".js-konsol-peringatan")).toContainText("23 rujukan belum diverifikasi.");
  await page.route("**/api/akun", (route) => route.fulfill({ status: 500, contentType: "text/plain", body: "galat" }));
  await page.getByRole("link", { name: "Akun" }).click();
  await expect(page.getByRole("alert")).toHaveText("Daftar akun gagal dimuat.");
  await page.unroute("**/api/akun");
  await page.getByRole("button", { name: "Coba lagi" }).click();
  await expect(page.getByRole("button", { name: "+ Akun baru" })).toBeVisible();

  expect(await csp(page)).toEqual([]);
  expect(catatan.respons).toEqual([]);
  expect(catatan.luar).toEqual([]);
  await ctx.close();
});

for (const ukuran of UKURAN) {
  test(`tangkapan layar ${ukuran.nama}: masuk, sandi wajib, dasbor, akun, akun baru, sandi sementara (AC-17)`, async ({ browser, baseURL, request }) => {
    const email = `layar${ukuran.width}@contoh.sch.id`;
    await adminAwal(request, email, ADMIN.awal, ADMIN.nama);
    const { ctx, page } = await konteks(browser, baseURL!, ukuran);
    const catatan = await pantau(page, baseURL!);
    const foto = async (nama: string) => {
      await page.waitForLoadState("networkidle");
      const meluap = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(meluap, `${nama} meluap ke samping`).toBe(false);
      await page.screenshot({ path: `${LAYAR}/konsol-${nama}-${ukuran.nama}.png` });
    };

    await page.goto("/admin/");
    await expect(page.locator(".js-status")).toHaveText("✓ Server siap");
    const huruf = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replaceAll('"', ""));
    });
    expect(huruf).toEqual(expect.arrayContaining(["Press Start 2P", "Pixelify Sans"]));
    await expect(page.locator(".js-konsol-merek-besar")).toHaveCSS("font-family", /Press Start 2P/);
    await foto("masuk");

    await kolom(page, "Email").fill(email);
    await kolom(page, "Sandi").fill(ADMIN.awal);
    await page.getByRole("button", { name: "Masuk" }).click();
    await expect(page.getByRole("heading", { name: "Buat sandi baru" })).toBeVisible();
    await foto("sandi-wajib");
    await gantiSandiWajib(page, ADMIN.sandi);
    await expect(page.locator(".js-konsol-peringatan")).toBeVisible();
    await foto("dasbor");
    expect(await targetKecil(page)).toEqual([]);

    await page.goto("/admin/#/akun");
    await expect(page.getByRole("button", { name: "+ Akun baru" })).toBeVisible();
    await foto("akun");
    expect(await targetKecil(page)).toEqual([]);
    await page.getByRole("button", { name: "+ Akun baru" }).click();
    await kolom(page, "Email").fill(`guru${ukuran.width}@contoh.sch.id`);
    await kolom(page, "Nama tampilan").fill(`Pak Guru ${ukuran.width}`);
    await foto("akun-baru");
    await page.getByRole("button", { name: "Buat akun" }).click();
    await expect(page.getByRole("dialog", { name: "Akun baru dibuat" })).toBeVisible();
    await foto("sandi-sementara");
    await page.getByRole("button", { name: "Selesai" }).click();

    expect(await csp(page)).toEqual([]);
    expect(catatan).toEqual({ konsol: [], respons: [], luar: [] });
    await ctx.close();
  });
}
