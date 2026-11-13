// Uji ujung ke ujung kejadian (spesifikasi JS-08, rencana uji "Uji ujung ke ujung"; AC-5 sampai AC-15, AC-22, AC-24).
// Ruang coba lokal berisi Paket inti 16 (server uji menyemai bank awal); pemain dipindah ke dekat titik lewat kait uji
// lokal `kejadian` dan `pindahkan`, dan ronde dikendalikan lewat kait `kelas`.
import { readFileSync } from "node:fs";
import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { PROTOKOL_VERSI } from "../../app/jejak-setara/inti/versi";
import { ruangKejadianSendiri } from "./ruang-kejadian";

const LAYAR = "test-results-jejak/layar";
const UKURAN = [
  { nama: "1280x720", width: 1280, height: 720 },
  { nama: "1024x768", width: 1024, height: 768 },
  { nama: "1920x1080", width: 1920, height: 1080 },
] as const;
const bank = JSON.parse(readFileSync(new URL("../../server/jejak-setara/seed/bank-awal.json", import.meta.url), "utf8")) as {
  kejadian: { kode: string; judul: string; langkah1: { opsi: { teks: string; benar: boolean }[] }; langkah2: { opsi: { teks: string; tingkat: string }[] } }[];
};
const isi = (kode: string) => bank.kejadian.find((k) => k.kode === kode)!;

type Catatan = { konsol: string[]; respons: string[] };
async function pantau(page: Page): Promise<Catatan> {
  const c: Catatan = { konsol: [], respons: [] };
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") c.konsol.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (g) => c.konsol.push(`pageerror: ${g.message}`));
  page.on("response", (j) => {
    if (j.status() >= 400) c.respons.push(`${j.status()} ${j.url()}`);
  });
  await page.addInitScript(() => {
    const daftar: string[] = [];
    (window as unknown as { __csp: string[] }).__csp = daftar;
    document.addEventListener("securitypolicyviolation", (e) => daftar.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  return c;
}
const csp = (page: Page) => page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []);

async function buatRuang(request: APIRequestContext, isiRuang: Record<string, unknown> = {}): Promise<string> {
  const j = await request.post("/api/ruang-coba", { data: isiRuang });
  expect(j.status()).toBe(201);
  const hasil = (await j.json()) as { kode: string; kejadian: number };
  expect(hasil.kejadian).toBe(16);
  return hasil.kode;
}
const kelas = async (request: APIRequestContext, kode: string, pesan: Record<string, unknown>) => {
  const j = await request.post(`/api/ruang-coba/${kode}/kelas`, { data: { v: PROTOKOL_VERSI, ...pesan } });
  expect(j.status()).toBe(200);
};
async function titikKejadian(request: APIRequestContext, kode: string): Promise<Map<string, { x: number; y: number }>> {
  const j = await request.get(`/api/ruang-coba/${kode}/kejadian`);
  const daftar = ((await j.json()) as { kejadian: { kejadianId: string; titik: { x: number; y: number }[] }[] }).kejadian;
  return new Map(daftar.map((k) => [k.kejadianId, k.titik[0]]));
}
const pindahkan = async (request: APIRequestContext, kode: string, nama: string, x: number, y: number) => {
  const j = await request.post(`/api/ruang-coba/${kode}/pindahkan`, { data: { nama, x, y } });
  expect(j.status()).toBe(200);
};

async function konteks(browser: Browser, baseURL: string, hp = false): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx = await browser.newContext({
    baseURL,
    viewport: hp ? { width: 731, height: 411 } : { width: 1280, height: 720 },
    ...(hp ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2.625 } : {}),
  });
  return { ctx, page: await ctx.newPage() };
}

const dunia = (page: Page) => page.locator("canvas.js-kanvas-dunia");
async function gabung(page: Page, kode: string, avatar = 1): Promise<string> {
  await page.goto(`/?kode=${kode}`);
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible();
  const nama = page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first();
  const teks = (await nama.textContent())?.replace("▶", "").trim() ?? "";
  await nama.click();
  await page.getByRole("radio", { name: `Avatar ${avatar}` }).click();
  await page.getByRole("button", { name: "Gabung" }).click();
  await expect(dunia(page)).toHaveAttribute("data-diri", /^\d+,\d+$/);
  return teks;
}
async function mulai(request: APIRequestContext, kode: string, halaman: Page[]): Promise<void> {
  await kelas(request, kode, { t: "mulai" });
  for (const p of halaman) await expect(p.locator(".js-bilah")).toBeVisible({ timeout: 8000 });
}
/** Pemain berdiri satu ubin di bawah titik kejadian (20 piksel dari pusatnya), lalu menunggu jangkauan. */
async function dekati(request: APIRequestContext, page: Page, kode: string, nama: string, kejadianId: string, t: { x: number; y: number }) {
  await pindahkan(request, kode, nama, t.x, t.y + 1);
  await expect(dunia(page)).toHaveAttribute("data-jangkauan", kejadianId, { timeout: 5000 });
}
const dialog = (page: Page) => page.getByRole("dialog").filter({ has: page.locator("#js-dialog-judul") });
const tampilan = (page: Page) => page.locator(".js-dialog").getAttribute("data-tampilan");
/** Nomor (1-based) pilihan yang tampil dengan teks tertentu. */
async function nomorPilihan(page: Page, teks: string): Promise<number> {
  const semua = await page.locator('.js-dialog [data-pilihan="ya"] .js-teks-pilihan').allTextContents();
  const i = semua.indexOf(teks);
  expect(i, `pilihan "${teks}" tidak tampil: ${JSON.stringify(semua)}`).toBeGreaterThanOrEqual(0);
  return i + 1;
}
const tunggu = (page: Page) => page.waitForTimeout(700); // masa tunggu 600 ms setiap tampilan baru (P-48)
/** Isi dialog tidak perlu digulir (AC-8). */
const tanpaGulir = (page: Page) =>
  page.locator(".js-dialog-isi").evaluate((el) => ({ isi: el.scrollHeight, tampak: el.clientHeight, muat: el.scrollHeight <= el.clientHeight + 1 }));

async function fotoLaptop(page: Page, nama: string): Promise<void> {
  for (const u of UKURAN) {
    await page.setViewportSize({ width: u.width, height: u.height });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${LAYAR}/kejadian-${nama}-${u.nama}.png` });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(300);
}

test("laptop: penanda, ajakan E, dialog dengan papan ketik saja, skor dan peringkat, tanda ✓, gelembung di layar pemain lain (AC-5 sampai AC-10, AC-13, AC-14, AC-22)", async ({
  browser,
  baseURL,
  request,
}) => {
  test.setTimeout(150_000);
  // Ruang yang titik K-13-nya tidak berdekatan dengan titik kejadian lain, agar hanya tokoh K-13 yang terhitung.
  const { kode, titik: t } = await ruangKejadianSendiri(request, "K-13");
  const a = await konteks(browser, baseURL!);
  const b = await konteks(browser, baseURL!);
  const catatan = [await pantau(a.page), await pantau(b.page)];
  const namaA = await gabung(a.page, kode, 1);
  const namaB = await gabung(b.page, kode, 4);
  await mulai(request, kode, [a.page, b.page]);
  // Skor 0: bilah atas menampilkan "#–" dan label pembaca layar tanpa peringkat (P-57).
  await expect(a.page.locator(".js-skor")).toHaveAttribute("aria-label", "Skor 0, belum ada peringkat");
  await expect(a.page.locator(".js-skor")).toContainText("#–");
  await dekati(request, a.page, kode, namaA, "K-13", t);
  await pindahkan(request, kode, namaB, t.x + 2, t.y + 1);
  await expect(dunia(a.page)).toHaveAttribute("data-kejadian", /^[1-9]/);
  await expect(dunia(a.page)).toHaveAttribute("data-tokoh-kejadian", "4"); // ibu menggendong bayi, siswa, petugas, bangku antrean
  await expect(a.page.locator(".js-ajakan-e")).toBeVisible();
  await expect(a.page.locator(".js-tombol-periksa")).toHaveCount(0); // tanpa layar sentuh
  await a.page.waitForTimeout(400);
  await fotoLaptop(a.page, "dunia");
  // E membuka dialog (P-23); papan ketik saja.
  await dunia(a.page).focus();
  await a.page.keyboard.press("KeyE");
  await expect(dialog(a.page)).toBeVisible();
  await expect(dialog(a.page)).toHaveAccessibleName(isi("K-13").judul);
  await expect(a.page.locator("#js-dialog-chip")).toHaveText("Langkah 1 dari 2");
  expect(await tampilan(a.page)).toBe("langkah1");
  await expect(a.page.locator('[data-aksi="kunci"]')).toHaveAttribute("aria-disabled", "true");
  await expect(dunia(b.page)).toHaveAttribute("data-dialog-lain", "1", { timeout: 4000 });
  await b.page.screenshot({ path: `${LAYAR}/kejadian-gelembung-1280x720.png` });
  await fotoLaptop(a.page, "langkah1");
  // Pilihan benar dari bank awal, dipilih dengan angka lalu Enter (P-43, P-49).
  const benar = isi("K-13").langkah1.opsi.find((o) => o.benar)!.teks;
  await tunggu(a.page);
  await a.page.keyboard.press(String(await nomorPilihan(a.page, benar)));
  await expect(a.page.locator('[data-pilihan="ya"][aria-pressed="true"]')).toContainText(benar);
  await expect(a.page.locator('[data-aksi="kunci"]')).not.toHaveAttribute("aria-disabled", "true");
  await a.page.keyboard.press("Enter");
  await expect.poll(() => tampilan(a.page)).toBe("umpan");
  await expect(a.page.locator(".js-pita-umpan")).toContainText("Tepat");
  await expect(a.page.locator(".js-pita-umpan")).toContainText("+40");
  await expect(a.page.locator('.js-pilihan-terkunci[data-label="tepat"]')).toContainText("Jawaban tepat");
  await expect(a.page.locator(".js-skor")).toHaveAttribute("aria-label", "Skor 40, peringkat 1");
  await fotoLaptop(a.page, "umpan");
  await tunggu(a.page);
  await a.page.keyboard.press("Enter"); // Lanjut ke Langkah 2
  await expect.poll(() => tampilan(a.page)).toBe("langkah2");
  await expect(a.page.locator("#js-dialog-chip")).toHaveText("Langkah 2 dari 2");
  await fotoLaptop(a.page, "langkah2");
  const tepat = isi("K-13").langkah2.opsi.find((o) => o.tingkat === "tepat")!.teks;
  await tunggu(a.page);
  await a.page.keyboard.press(String(await nomorPilihan(a.page, tepat)));
  await a.page.keyboard.press("Enter");
  await expect.poll(() => tampilan(a.page)).toBe("kartu");
  await expect(a.page.locator(".js-kartu")).toHaveAttribute("data-tingkat", "tepat");
  await expect(a.page.locator(".js-kartu-kepala")).toContainText("+60");
  await expect(a.page.locator(".js-kartu")).toContainText("Rujukan di ruang uji belum tentu sudah diverifikasi Peninjau.");
  await expect(a.page.locator(".js-skor")).toHaveAttribute("aria-label", "Skor 100, peringkat 1");
  await fotoLaptop(a.page, "kartu");
  await tunggu(a.page);
  await a.page.keyboard.press("Enter"); // Lanjut menjelajah
  await expect(dialog(a.page)).toHaveCount(0);
  await expect(dunia(a.page)).toHaveAttribute("data-selesai", "1");
  await expect(dunia(a.page)).toHaveAttribute("data-jangkauan", "");
  await expect(dunia(b.page)).toHaveAttribute("data-dialog-lain", "0", { timeout: 4000 });
  // Peta besar: penanda dan ringkasan (P-19).
  await a.page.keyboard.press("KeyP");
  await expect(a.page.locator(".js-ringkasan-kejadian")).toHaveText(/^Kejadian terlihat \d+, selesai 1\.$/);
  await expect(a.page.locator('.js-peta-kejadian[data-selesai="ya"]')).toHaveCount(1);
  await a.page.screenshot({ path: `${LAYAR}/kejadian-peta-besar-1280x720.png` });
  await a.page.keyboard.press("Escape");
  for (const [i, p] of [a, b].entries()) {
    expect(await csp(p.page)).toEqual([]);
    expect(catatan[i]).toEqual({ konsol: [], respons: [] });
  }
  await a.ctx.close();
  await b.ctx.close();
});

test("HP: tombol Periksa tiga keadaan, mode ringkas tanpa gulir di ke-16 kejadian, sentuhan sampai kartu dampak (AC-7, AC-8, AC-10)", async ({
  browser,
  baseURL,
  request,
}) => {
  test.setTimeout(240_000);
  const kode = await buatRuang(request);
  const hp = await konteks(browser, baseURL!, true);
  const catatan = await pantau(hp.page);
  const nama = await gabung(hp.page, kode, 6);
  await mulai(request, kode, [hp.page]);
  const titik = await titikKejadian(request, kode);
  const periksa = hp.page.locator(".js-tombol-periksa");
  await expect(periksa).toHaveAttribute("aria-label", "Periksa. Dekati penanda kejadian dulu.");
  await expect(periksa).toHaveAttribute("aria-disabled", "true");
  const kotak = await periksa.boundingBox();
  expect(kotak?.width).toBe(64);
  // Ke-16 kejadian: tampilan Situasi dan Pilihan tidak perlu digulir (AC-8), lalu ditutup tanpa menjawab.
  const ukuran: Record<string, { situasi: number; pilihan: number; tampak: number }> = {};
  for (const [kejadianId, t] of titik) {
    await dekati(request, hp.page, kode, nama, kejadianId, t);
    await expect(periksa).toHaveAttribute("aria-label", "Periksa kejadian");
    await periksa.tap();
    await expect(dialog(hp.page)).toBeVisible();
    expect(await tampilan(hp.page)).toBe("situasi1");
    await expect(hp.page.locator(".js-dialog")).toHaveAttribute("data-bentuk", "lembar");
    const s = await tanpaGulir(hp.page);
    await tunggu(hp.page);
    await hp.page.getByRole("button", { name: "Lihat pilihan" }).tap();
    await expect.poll(() => tampilan(hp.page)).toBe("pilihan1");
    const p = await tanpaGulir(hp.page);
    ukuran[kejadianId] = { situasi: s.isi, pilihan: p.isi, tampak: p.tampak };
    expect(s.muat, `${kejadianId} situasi ${JSON.stringify(s)}`).toBe(true);
    expect(p.muat, `${kejadianId} pilihan ${JSON.stringify(p)}`).toBe(true);
    if (kejadianId === "K-07") {
      await hp.page.screenshot({ path: `${LAYAR}/kejadian-pilihan1-731x411.png` });
      await tunggu(hp.page);
      await hp.page.getByRole("button", { name: "Situasi" }).tap();
      await hp.page.waitForTimeout(300);
      await hp.page.screenshot({ path: `${LAYAR}/kejadian-situasi1-731x411.png` });
      await tunggu(hp.page);
      await hp.page.getByRole("button", { name: "Lihat pilihan" }).tap();
    }
    await tunggu(hp.page);
    await hp.page.getByRole("button", { name: "Tutup" }).tap();
    await expect(dialog(hp.page)).toHaveCount(0);
  }
  console.log("UKURAN_RINGKAS_HP", JSON.stringify(ukuran));
  // Satu kejadian sampai kartu dampak dengan sentuhan; pilihan keliru memberi umpan balik ringkas.
  const kk = "K-07";
  await dekati(request, hp.page, kode, nama, kk, titik.get(kk)!);
  await hp.page.waitForTimeout(400);
  await hp.page.screenshot({ path: `${LAYAR}/kejadian-dunia-731x411.png` });
  await periksa.tap();
  await tunggu(hp.page);
  await hp.page.getByRole("button", { name: "Lihat pilihan" }).tap();
  await tunggu(hp.page);
  const salah = isi(kk).langkah1.opsi.find((o) => !o.benar)!.teks;
  await hp.page.locator(".js-dialog .js-teks-pilihan", { hasText: salah }).tap();
  await hp.page.getByRole("button", { name: "Kunci jawaban" }).tap();
  await expect.poll(() => tampilan(hp.page)).toBe("umpan");
  await expect(hp.page.locator(".js-pita-umpan")).toContainText("Belum tepat");
  await expect(hp.page.locator(".js-pilihan-terkunci")).toHaveCount(2);
  await expect(hp.page.locator('.js-pilihan-terkunci[data-label="pilihanmu"]')).toContainText("Pilihanmu");
  await hp.page.screenshot({ path: `${LAYAR}/kejadian-umpan-731x411.png` });
  await tunggu(hp.page);
  await hp.page.getByRole("button", { name: "Lanjut ke Langkah 2" }).tap();
  await expect.poll(() => tampilan(hp.page)).toBe("pilihan2");
  expect((await tanpaGulir(hp.page)).muat).toBe(true);
  await hp.page.screenshot({ path: `${LAYAR}/kejadian-langkah2-731x411.png` });
  await tunggu(hp.page);
  const kurang = isi(kk).langkah2.opsi.find((o) => o.tingkat === "kurang") ?? isi(kk).langkah2.opsi.find((o) => o.tingkat === "berisiko")!;
  await hp.page.locator(".js-dialog .js-teks-pilihan", { hasText: kurang.teks }).tap();
  await hp.page.getByRole("button", { name: "Kunci jawaban" }).tap();
  await expect.poll(() => tampilan(hp.page)).toBe("kartu");
  await expect(hp.page.locator(".js-kartu")).toContainText("Pilihan yang tepat");
  await expect(hp.page.getByRole("button", { name: "Lanjut menjelajah" })).toBeInViewport();
  await hp.page.screenshot({ path: `${LAYAR}/kejadian-kartu-731x411.png` });
  await tunggu(hp.page);
  await hp.page.getByRole("button", { name: "Lanjut menjelajah" }).tap();
  await expect(dialog(hp.page)).toHaveCount(0);
  expect(await csp(hp.page)).toEqual([]);
  expect(catatan).toEqual({ konsol: [], respons: [] });
  await hp.ctx.close();
});

test("laptop 1024 × 768: mode ringkas di panel, tanpa gulir di ke-16 kejadian (AC-8)", async ({ browser, baseURL, request }) => {
  test.setTimeout(200_000);
  const kode = await buatRuang(request);
  const ctx = await browser.newContext({ baseURL, viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage();
  const catatan = await pantau(page);
  const nama = await gabung(page, kode, 2);
  await mulai(request, kode, [page]);
  // Angka fps hanya bila alamat diakhiri #fps (P-70).
  await expect(page.locator(".js-fps")).toHaveCount(0);
  await page.evaluate(() => {
    window.location.hash = "fps";
  });
  await expect(page.locator(".js-fps")).toHaveText(/^\d+ fps · p95 ≤ \d+ ms$/, { timeout: 4000 });
  for (const [kejadianId, t] of await titikKejadian(request, kode)) {
    await dekati(request, page, kode, nama, kejadianId, t);
    await dunia(page).focus();
    await page.keyboard.press("KeyE");
    await expect(dialog(page)).toBeVisible();
    await expect(page.locator(".js-dialog")).toHaveAttribute("data-bentuk", "panel");
    expect(await tampilan(page)).toBe("situasi1");
    expect((await tanpaGulir(page)).muat, `${kejadianId} situasi`).toBe(true);
    await tunggu(page);
    await page.keyboard.press("Enter"); // fokus di "Lihat pilihan"
    await expect.poll(() => tampilan(page)).toBe("pilihan1");
    expect((await tanpaGulir(page)).muat, `${kejadianId} pilihan`).toBe(true);
    await tunggu(page);
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toHaveCount(0);
  }
  expect(catatan).toEqual({ konsol: [], respons: [] });
  await ctx.close();
});

test("KT-13, jeda saat dialog terbuka, putus di tengah dialog, dan akhir ronde dengan skor dan peringkat (AC-11, AC-12)", async ({ browser, baseURL, request }) => {
  test.setTimeout(120_000);
  const kode = await buatRuang(request);
  const a = await konteks(browser, baseURL!);
  const catatan = await pantau(a.page);
  const nama = await gabung(a.page, kode, 3);
  await mulai(request, kode, [a.page]);
  const titik = await titikKejadian(request, kode);
  await dekati(request, a.page, kode, nama, "K-01", titik.get("K-01")!);
  await dunia(a.page).focus();
  await a.page.keyboard.press("KeyE");
  await expect(dialog(a.page)).toBeVisible();
  await tunggu(a.page);
  await a.page.keyboard.press(String(await nomorPilihan(a.page, isi("K-01").langkah1.opsi.find((o) => o.benar)!.teks)));
  await a.page.keyboard.press("Enter");
  await expect.poll(() => tampilan(a.page)).toBe("umpan");
  await tunggu(a.page);
  await a.page.keyboard.press("Escape");
  await expect(dialog(a.page)).toHaveCount(0);
  await expect(dunia(a.page)).toHaveAttribute("data-selesai", "0"); // penanda tetap "!"
  await expect(dunia(a.page)).toHaveAttribute("data-jangkauan", "K-01");
  // KT-13: periksa lagi langsung membuka Langkah 2.
  await dunia(a.page).focus();
  await a.page.keyboard.press("KeyE");
  await expect(a.page.locator("#js-dialog-chip")).toHaveText("Langkah 2 dari 2");
  expect(await tampilan(a.page)).toBe("langkah2");
  // Jeda: dialog tersembunyi di bawah lapisan pekat, lalu kembali (D-6).
  await kelas(request, kode, { t: "jeda" });
  await expect(a.page.locator(".js-dialog-jeda")).toBeVisible();
  await expect(dialog(a.page)).toHaveCount(0);
  await a.page.screenshot({ path: `${LAYAR}/kejadian-jeda-1280x720.png` });
  await kelas(request, kode, { t: "lanjut" });
  await expect(dialog(a.page)).toBeVisible();
  // Putus di tengah dialog: dialog tertutup dan lapisan menyambung tampil; sesudah tersambung, penanda dan skor pulih (P-54).
  expect((await a.page.request.post(`/api/ruang-coba/${kode}/putuskan`)).status()).toBe(200);
  await expect(dialog(a.page)).toHaveCount(0);
  await expect(a.page.getByText("Menyambung ulang…")).toBeVisible();
  await expect(a.page.getByText("Menyambung ulang…")).toBeHidden({ timeout: 15_000 });
  await expect(a.page.locator(".js-skor")).toHaveAttribute("aria-label", "Skor 40, peringkat 1");
  await expect(dunia(a.page)).toHaveAttribute("data-kejadian", /^[1-9]/);
  await expect(dunia(a.page)).toHaveAttribute("data-jangkauan", "K-01");
  // Putus lagi, dan ronde berakhir selama HP terputus: sesudah tersambung, layar "Ronde selesai" tampil dengan skor dan
  // peringkat (P-36, P-59, D-5); poin Langkah 1 tetap dihitung walaupun Langkah 2 belum dijawab.
  expect((await a.page.request.post(`/api/ruang-coba/${kode}/putuskan`)).status()).toBe(200);
  await kelas(request, kode, { t: "akhiri" });
  await expect(a.page.getByRole("heading", { name: "Ronde selesai" })).toBeVisible({ timeout: 15_000 });
  await expect(a.page.getByText("Skormu 40")).toBeVisible();
  await expect(a.page.getByText("Peringkat 1 dari 1")).toBeVisible();
  await a.page.screenshot({ path: `${LAYAR}/kejadian-selesai-1280x720.png` });
  // Respons 4xx/5xx yang diharapkan: tidak ada; putus memicu sambung ulang, bukan galat konsol.
  expect(catatan.respons).toEqual([]);
  expect(catatan.konsol.filter((k) => !/WebSocket/.test(k))).toEqual([]);
  await a.ctx.close();
});
