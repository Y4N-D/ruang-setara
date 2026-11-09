// Uji ujung ke ujung alur gabung Jejak Setara (spesifikasi JS-03, AC-17 dan AC-18). Beberapa konteks peramban
// bermain di ruang coba lokal; siklus ronde dikendalikan lewat kait uji (P-9). Sejak JS-07 lobi dan ronde tampil di
// atas dunia (panel lobi, bilah atas); uji dunia sendiri ada di dunia.uji.ts.
import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from "@playwright/test";

const LAYAR = "test-results-jejak/layar";
const UKURAN = [
  { nama: "731x411", width: 731, height: 411 },
  { nama: "1280x720", width: 1280, height: 720 },
  { nama: "1024x768", width: 1024, height: 768 },
  { nama: "1920x1080", width: 1920, height: 1080 },
] as const;

type Catatan = { konsol: string[]; respons: string[] };

async function pantau(page: Page, izinkan: RegExp[] = []): Promise<Catatan> {
  const c: Catatan = { konsol: [], respons: [] };
  page.on("console", (m) => {
    if ((m.type() === "error" || m.type() === "warning") && !izinkan.some((p) => p.test(m.text()))) c.konsol.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (g) => c.konsol.push(`pageerror: ${g.message}`));
  page.on("response", (j) => {
    if (j.status() >= 400 && !izinkan.some((p) => p.test(`${j.status()} ${j.url()}`))) c.respons.push(`${j.status()} ${j.url()}`);
  });
  await page.addInitScript(() => {
    const daftar: string[] = [];
    (window as unknown as { __csp: string[] }).__csp = daftar;
    document.addEventListener("securitypolicyviolation", (e) => daftar.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  return c;
}

// Teks galat juga diumumkan di wilayah aria-live, jadi pencarian teks dibatasi ke <main>.
const csp = (page: Page) => page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []);

async function buatRuang(request: APIRequestContext, isi: Record<string, unknown> = {}): Promise<string> {
  const j = await request.post("/api/ruang-coba", { data: isi });
  expect(j.status()).toBe(201);
  return ((await j.json()) as { kode: string }).kode;
}

const kelas = async (request: APIRequestContext, kode: string, pesan: Record<string, unknown>) =>
  expect((await request.post(`/api/ruang-coba/${kode}/kelas`, { data: { v: 1, ...pesan } })).status()).toBe(200);

async function konteks(browser: Browser, baseURL: string, hp = false): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx = await browser.newContext({
    baseURL,
    viewport: hp ? { width: 731, height: 411 } : { width: 1280, height: 720 },
    ...(hp ? { isMobile: true, hasTouch: true } : {}),
  });
  return { ctx, page: await ctx.newPage() };
}

/** Membuka tautan ruang, memilih nama pertama dan avatar ke-n, lalu masuk lobi. Mengembalikan nama. */
async function gabung(page: Page, kode: string, avatar = 1): Promise<string> {
  await page.goto(`/?kode=${kode}`);
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible();
  const nama = page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first();
  const teks = (await nama.textContent())?.replace("▶", "").trim() ?? "";
  await nama.click();
  await page.getByRole("radio", { name: `Avatar ${avatar}` }).click();
  await page.getByRole("button", { name: "Gabung" }).click();
  await expect(page.getByRole("heading", { name: "Lobi" })).toBeVisible();
  return teks;
}

async function fotoEmpat(page: Page, nama: string): Promise<void> {
  for (const u of UKURAN) {
    await page.setViewportSize({ width: u.width, height: u.height });
    await page.waitForTimeout(80);
    await page.screenshot({ path: `${LAYAR}/${nama}-${u.nama}.png` });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
}

test("tiga pemain (satu emulasi HP) masuk lobi dan melihat 3 pemain (AC-18)", async ({ browser, baseURL, request }) => {
  const kode = await buatRuang(request);
  const pemain = [await konteks(browser, baseURL!, true), await konteks(browser, baseURL!), await konteks(browser, baseURL!)];
  const catatan = await Promise.all(pemain.map((p) => pantau(p.page)));
  const nama: string[] = [];
  for (const [i, p] of pemain.entries()) nama.push(await gabung(p.page, kode, i + 1));
  expect(new Set(nama).size).toBe(3);
  for (const [i, p] of pemain.entries()) {
    await expect(p.page.getByText("3 pemain di ruang")).toBeVisible();
    await expect(p.page.getByText(nama[i])).toBeVisible();
    await expect(p.page.getByText("Menunggu guru memulai…")).toBeVisible();
    await expect(p.page.getByText("Jangan tutup tab ini.")).toBeVisible();
  }
  await fotoEmpat(pemain[1].page, "lobi");
  for (const [i, p] of pemain.entries()) {
    expect(await csp(p.page)).toEqual([]);
    expect(catatan[i]).toEqual({ konsol: [], respons: [] });
    await p.ctx.close();
  }
});

test("layar Kode: format salah, kode tidak ada, keyboard saja, dan acak ulang nama (AC-17)", async ({ page, request }) => {
  const catatan = await pantau(page, [/404 .*\/api\/publik\/ruang\/ZZZZZ/, /Failed to load resource.*404/]);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText("✓ Server siap");
  await fotoEmpat(page, "kode");
  const isian = page.getByLabel("Kode ruang");
  await isian.fill("ab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main").getByText("Kode berisi 5 huruf atau angka.")).toBeVisible();
  await isian.fill("zzzzz");
  await expect(isian).toHaveValue("ZZZZZ");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("main").getByText("Kode ruang tidak ditemukan. Periksa lagi kodenya.")).toBeVisible();
  const kode = await buatRuang(request);
  await isian.fill(kode.toLowerCase());
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible();
  await fotoEmpat(page, "identitas");
  const radioNama = page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio");
  const awal = await radioNama.allTextContents();
  await page.getByRole("button", { name: "Acak ulang" }).click();
  await expect.poll(async () => (await radioNama.allTextContents()).join("|")).not.toBe(awal.join("|"));
  // Keyboard saja: Tab ke kelompok nama, panah, lalu kelompok avatar, lalu Gabung.
  await radioNama.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(radioNama.nth(1)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("radio", { name: "Avatar 1" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Avatar 2" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Gabung" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Lobi" })).toBeVisible();
  expect(await csp(page)).toEqual([]);
  expect(catatan).toEqual({ konsol: [], respons: [] });
});

test("ruang penuh dan mode nomor absen (AC-8, AC-18)", async ({ browser, baseURL, request }) => {
  const kode = await buatRuang(request, { batasPemain: 2 });
  const [a, b, c] = [await konteks(browser, baseURL!), await konteks(browser, baseURL!), await konteks(browser, baseURL!)];
  await gabung(a.page, kode, 1);
  await gabung(b.page, kode, 2);
  await c.page.goto(`/?kode=${kode}`);
  await expect(c.page.getByRole("main").getByText("Ruang sudah penuh. Beri tahu gurumu.")).toBeVisible();
  await fotoEmpat(c.page, "galat-penuh");
  await c.page.getByRole("button", { name: "Kembali" }).click();
  await expect(c.page.getByLabel("Kode ruang")).toBeVisible();

  const kodeAbsen = await buatRuang(request, { modeNomorAbsen: true });
  await a.page.goto(`/?kode=${kodeAbsen}`);
  await expect(a.page.getByRole("heading", { name: "Nomor absen" })).toBeVisible();
  await fotoEmpat(a.page, "absen");
  await a.page.getByLabel("Nomor absenmu").fill("51");
  await a.page.getByRole("button", { name: "Lanjut" }).click();
  await expect(a.page.getByRole("main").getByText("Nomor absen harus 1 sampai 50.")).toBeVisible();
  await a.page.getByLabel("Nomor absenmu").fill("7");
  await a.page.getByRole("button", { name: "Lanjut" }).click();
  await expect(a.page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible();
  await b.page.goto(`/?kode=${kodeAbsen}`);
  await b.page.getByLabel("Nomor absenmu").fill("7");
  await b.page.getByRole("button", { name: "Lanjut" }).click();
  await expect(b.page.getByRole("main").getByText("Nomor absen ini sudah dipakai di ruang ini. Periksa lagi nomormu.")).toBeVisible();
  await b.page.getByLabel("Nomor absenmu").fill("8");
  await b.page.getByRole("button", { name: "Lanjut" }).click();
  await expect(b.page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible();
  for (const p of [a, b, c]) await p.ctx.close();
});

test("putus, menyambung ulang, dan muat ulang kembali ke lobi dengan nama yang sama (AC-9, AC-18)", async ({ page, context, request }) => {
  const catatan = await pantau(page, [/WebSocket connection to .* failed/, /ERR_INTERNET_DISCONNECTED/]);
  await page.setViewportSize({ width: 1280, height: 720 });
  const kode = await buatRuang(request);
  const nama = await gabung(page, kode, 4);
  await context.setOffline(true);
  await request.post(`/api/ruang-coba/${kode}/putuskan`);
  const lapisan = page.getByRole("dialog", { name: "Menyambung ulang…" });
  await expect(lapisan).toBeVisible();
  await fotoEmpat(page, "menyambung");
  await page.waitForTimeout(5000);
  await context.setOffline(false);
  await expect(lapisan).toBeHidden({ timeout: 15_000 });
  await expect(page.getByText(nama)).toBeVisible();
  await expect(page.getByText("1 pemain di ruang")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Lobi" })).toBeVisible();
  await expect(page.getByText(nama)).toBeVisible();
  expect(catatan).toEqual({ konsol: [], respons: [] });
});

test("mulai, jeda, lanjut, dikeluarkan, selesai, dan ditutup lewat kait uji (AC-11, AC-12, AC-18)", async ({ browser, baseURL, request }) => {
  const kode = await buatRuang(request);
  const a = await konteks(browser, baseURL!);
  const b = await konteks(browser, baseURL!, true);
  const catatan = await pantau(a.page);
  let idB = "";
  b.page.on("websocket", (ws) =>
    ws.on("framereceived", (f) => {
      const d = JSON.parse(String(f.payload)) as { t?: string; pemainId?: string };
      if (d.t === "selamat_datang" && d.pemainId) idB = d.pemainId;
    }),
  );
  await gabung(a.page, kode, 5);
  await gabung(b.page, kode, 6);
  await kelas(request, kode, { t: "mulai" });
  // Sejak JS-07: hitung mundur dan ronde tampil di atas dunia (P-29, P-31).
  await expect(a.page.getByText("Bersiap")).toBeVisible();
  await expect(a.page.getByRole("heading", { name: "Ronde berjalan" })).toBeAttached({ timeout: 6000 });
  await expect(a.page.locator(".js-sisa")).toHaveAttribute("aria-label", /^Sisa waktu 1[45]:[0-5]\d$/);
  await fotoEmpat(a.page, "ronde");
  await kelas(request, kode, { t: "jeda" });
  await expect(a.page.getByRole("dialog", { name: "Dijeda oleh guru" })).toBeVisible();
  await fotoEmpat(a.page, "dijeda");
  await kelas(request, kode, { t: "lanjut" });
  await expect(a.page.getByRole("dialog", { name: "Dijeda oleh guru" })).toBeHidden();
  await kelas(request, kode, { t: "keluarkan", pemainId: idB });
  await expect(b.page.getByRole("main").getByText("Kamu dikeluarkan dari ruang oleh guru.")).toBeVisible();
  await kelas(request, kode, { t: "akhiri" });
  await expect(a.page.getByRole("heading", { name: "Ronde selesai" })).toBeVisible();
  await expect(a.page.getByText("Tunggu arahan guru.")).toBeVisible();
  await kelas(request, kode, { t: "tutup_ruang" });
  await expect(a.page.getByRole("heading", { name: "Ruang ditutup" })).toBeVisible();
  await expect(a.page.getByText("Terima kasih sudah bermain.")).toBeVisible();
  expect(catatan).toEqual({ konsol: [], respons: [] });
  await a.ctx.close();
  await b.ctx.close();
});
