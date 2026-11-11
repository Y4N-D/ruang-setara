// Uji ujung ke ujung kerangka Jejak Setara (spesifikasi JS-01, Rencana uji bagian "Uji ujung ke ujung").
// Dijalankan terhadap hasil build lewat vite preview (runtime Workers lokal), lihat playwright.jejak.config.ts.
import { expect, test, type BrowserContextOptions, type Page, type Route } from "@playwright/test";
import { PROTOKOL_VERSI } from "../../app/jejak-setara/inti/versi";

const LAYAR = "test-results-jejak/layar";

const UKURAN = [
  { nama: "731x411", width: 731, height: 411, hp: true },
  { nama: "1280x720", width: 1280, height: 720, hp: false },
  { nama: "1024x768", width: 1024, height: 768, hp: false },
  { nama: "1920x1080", width: 1920, height: 1080, hp: false },
] as const;

// Sejak JS-03 halaman pemain adalah alur gabung (gabung.uji.ts); uji penanda server di "/" tetap di bawah.
const HALAMAN = [
  {
    jalur: "/admin/",
    berkas: "konsol",
    judulTab: "Konsol admin · Jejak Setara",
    atas: "Jejak Setara",
    judul: "Konsol admin",
    isi: "Konsol sedang disiapkan.",
  },
] as const;

const TAJUK_HALAMAN: Record<string, string> = {
  "content-security-policy":
    "default-src 'self'; connect-src 'self'; img-src 'self' data: blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "same-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

const TAJUK_JSON: Record<string, string> = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "same-origin",
  "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
};

type Catatan = { konsol: string[]; respons: string[]; favicon: string[]; luar: string[] };

/** Mencatat galat dan peringatan konsol, respons 4xx atau 5xx, permintaan favicon, dan permintaan ke alamat lain. */
async function pantau(page: Page, asal: string): Promise<Catatan> {
  const catatan: Catatan = { konsol: [], respons: [], favicon: [], luar: [] };
  page.on("console", (pesan) => {
    if (pesan.type() === "error" || pesan.type() === "warning") catatan.konsol.push(`${pesan.type()}: ${pesan.text()}`);
  });
  page.on("pageerror", (galat) => catatan.konsol.push(`pageerror: ${galat.message}`));
  page.on("response", (jawaban) => {
    if (jawaban.status() >= 400) catatan.respons.push(`${jawaban.status()} ${jawaban.url()}`);
  });
  page.on("request", (permintaan) => {
    const url = permintaan.url();
    if (url.includes("favicon")) catatan.favicon.push(url);
    if (!url.startsWith(asal) && !url.startsWith("data:")) catatan.luar.push(url);
  });
  await page.addInitScript(() => {
    const daftar: string[] = [];
    (window as unknown as { __pelanggaranCsp: string[] }).__pelanggaranCsp = daftar;
    document.addEventListener("securitypolicyviolation", (e) => daftar.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  return catatan;
}

const pelanggaranCsp = (page: Page) =>
  page.evaluate(() => (window as unknown as { __pelanggaranCsp?: string[] }).__pelanggaranCsp ?? []);

for (const halaman of HALAMAN) {
  for (const ukuran of UKURAN) {
    test(`${halaman.berkas} ${ukuran.nama}: teks, huruf, dan tanpa galat (AC-5)`, async ({ browser, baseURL }) => {
      const opsi: BrowserContextOptions = { baseURL, viewport: { width: ukuran.width, height: ukuran.height } };
      if (ukuran.hp) Object.assign(opsi, { isMobile: true, hasTouch: true });
      const konteks = await browser.newContext(opsi);
      const page = await konteks.newPage();
      const catatan = await pantau(page, baseURL!);

      await page.goto(halaman.jalur);
      await expect(page.getByRole("status")).toHaveText("✓ Server siap", { timeout: 5000 });
      await expect(page.locator("html")).toHaveAttribute("lang", "id");
      await expect(page).toHaveTitle(halaman.judulTab);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(halaman.judul);
      await expect(page.locator(".js-isi")).toHaveText(halaman.isi);
      if (halaman.atas) await expect(page.locator(".js-atas")).toHaveText(halaman.atas);
      else await expect(page.locator(".js-atas")).toHaveCount(0);

      const huruf = await page.evaluate(async () => {
        await document.fonts.ready;
        return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replaceAll('"', ""));
      });
      expect(huruf).toEqual(expect.arrayContaining(["Press Start 2P", "Pixelify Sans"]));

      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `${LAYAR}/${halaman.berkas}-${ukuran.nama}.png` });
      expect(await pelanggaranCsp(page)).toEqual([]);
      expect(catatan).toEqual({ konsol: [], respons: [], favicon: [], luar: [] });
      await konteks.close();
    });
  }
}

test("memeriksa: penanda tampil selama jawaban server ditahan (AC-6)", async ({ page }) => {
  let lepas: () => void = () => {};
  const tertahan = new Promise<void>((selesai) => (lepas = selesai));
  await page.route("**/api/sehat", async (route) => {
    await tertahan;
    await route.continue();
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  const penanda = page.getByRole("status");
  await expect(penanda).toHaveText("Memeriksa server…");
  await expect(penanda).toHaveAttribute("data-keadaan", "memeriksa");
  await page.screenshot({ path: `${LAYAR}/pemain-memeriksa-1280x720.png` });
  lepas();
  await expect(penanda).toHaveText("✓ Server siap");
});

const KEGAGALAN: [string, (route: Route) => Promise<void>][] = [
  ["permintaan dibatalkan", (route) => route.abort()],
  ["status 500", (route) => route.fulfill({ status: 500, contentType: "application/json", body: '{"ok":true,"protokol":1}' })],
  ["isi bukan JSON", (route) => route.fulfill({ status: 200, contentType: "text/plain", body: "halo" })],
  ["ok bukan true", (route) => route.fulfill({ status: 200, json: { ok: false, protokol: 1 } })],
  ["protokol berbeda", (route) => route.fulfill({ status: 200, json: { ok: true, protokol: 99 } })],
];

for (const [nama, jawab] of KEGAGALAN) {
  test(`belum tersambung: ${nama} (AC-6)`, async ({ page }) => {
    await page.route("**/api/sehat", jawab);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    const penanda = page.getByRole("status");
    await expect(penanda).toHaveText("! Server belum tersambung");
    await expect(penanda).toHaveAttribute("data-keadaan", "belum");
    if (nama === "permintaan dibatalkan") await page.screenshot({ path: `${LAYAR}/pemain-belum-1280x720.png` });
  });
}

test("belum tersambung: tidak ada jawaban dalam batas waktu (AC-6)", async ({ page }) => {
  await page.route("**/api/sehat", () => {
    // Sengaja tidak dijawab.
  });
  const mulai = Date.now();
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText("Memeriksa server…");
  await expect(page.getByRole("status")).toHaveText("! Server belum tersambung", { timeout: 6000 });
  expect(Date.now() - mulai).toBeGreaterThanOrEqual(4500);
});

test("penanda ber-role status; tanda ✓ dan ! tersembunyi dari pembaca layar (AC-6)", async ({ page }) => {
  await page.goto("/");
  const penanda = page.getByRole("status");
  await expect(penanda).toHaveText("✓ Server siap");
  await expect(penanda.locator('span[aria-hidden="true"]')).toHaveText("✓");
  await expect(penanda).toMatchAriaSnapshot("- status: Server siap");

  await page.route("**/api/sehat", (route) => route.abort());
  await page.reload();
  await expect(penanda).toHaveText("! Server belum tersambung");
  await expect(penanda.locator('span[aria-hidden="true"]')).toHaveText("!");
  await expect(penanda).toMatchAriaSnapshot("- status: Server belum tersambung");
});

test("tajuk halaman dan jawaban Worker (AC-3, AC-4, AC-8)", async ({ request }) => {
  for (const jalur of ["/", "/admin/"]) {
    const jawaban = await request.get(jalur);
    expect(jawaban.status(), jalur).toBe(200);
    for (const [nama, nilai] of Object.entries(TAJUK_HALAMAN)) expect(jawaban.headers()[nama], `${jalur} ${nama}`).toBe(nilai);
  }

  const sehat = await request.get("/api/sehat");
  expect(sehat.status()).toBe(200);
  expect(await sehat.text()).toBe(`{"ok":true,"protokol":${PROTOKOL_VERSI},"lingkungan":"lokal"}`);
  for (const [nama, nilai] of Object.entries(TAJUK_JSON)) expect(sehat.headers()[nama], nama).toBe(nilai);

  const kirim = await request.post("/api/sehat");
  expect(kirim.status()).toBe(405);
  expect(kirim.headers()["allow"]).toBe("GET");
  expect(await kirim.json()).toEqual({ galat: { kode: "METODE_TIDAK_DIDUKUNG", pesan: "Metode ini tidak didukung." } });

  const ruang = await request.get("/api/ruang");
  expect(ruang.status()).toBe(404);
  expect(await ruang.json()).toEqual({ galat: { kode: "BELUM_TERSEDIA", pesan: "Fitur ini belum tersedia." } });

  expect((await request.get("/tidak-ada")).status()).toBe(404);

  const konsol = await request.get("/admin", { maxRedirects: 0 });
  expect(konsol.status()).toBe(307);
  expect(konsol.headers()["location"]).toBe("/admin/");
});

test("dua konteks bersamaan sama-sama menampilkan server siap (AC-7)", async ({ browser, baseURL }) => {
  const [satu, dua] = await Promise.all([browser.newContext({ baseURL }), browser.newContext({ baseURL })]);
  const [halamanSatu, halamanDua] = await Promise.all([satu.newPage(), dua.newPage()]);
  await Promise.all([halamanSatu.goto("/"), halamanDua.goto("/admin/")]);
  await Promise.all([
    expect(halamanSatu.getByRole("status")).toHaveText("✓ Server siap"),
    expect(halamanDua.getByRole("status")).toHaveText("✓ Server siap"),
  ]);
  await Promise.all([satu.close(), dua.close()]);
});
