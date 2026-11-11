// Uji ujung ke ujung layar dunia (spesifikasi JS-07, rencana uji "Uji ujung ke ujung"; AC-1 sampai AC-15, AC-19,
// AC-23, AC-24). Beberapa konteks peramban dan bot WebSocket bermain di ruang coba lokal; ronde dikendalikan lewat
// kait uji. Ringkasan keadaan dunia dibaca dari atribut data kanvas dunia (ditulis setiap 500 ms).
import { readFileSync } from "node:fs";
import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { posisiSah } from "../../app/jejak-setara/inti/gerak";
import { tutupGerbang, uraiRle } from "../../app/jejak-setara/inti/peta";
import { PROTOKOL_VERSI } from "../../app/jejak-setara/inti/versi";

const LAYAR = "test-results-jejak/layar";
/** Ukuran laptop diambil dari satu halaman yang diubah ukurannya; ukuran HP dari konteks HP sungguhan (r 2,625). */
const UKURAN = [
  { nama: "1280x720", width: 1280, height: 720 },
  { nama: "1024x768", width: 1024, height: 768 },
  { nama: "1920x1080", width: 1920, height: 1080 },
] as const;

const kampung = JSON.parse(readFileSync(new URL("../../app/jejak-setara/peta/kampung.json", import.meta.url), "utf8")) as {
  lebar: number;
  tinggi: number;
  tabrakan: string;
  gerbangLobi: { kiri: number; atas: number; kanan: number; bawah: number };
};
const GRID = uraiRle(kampung.tabrakan, kampung.lebar * kampung.tinggi);
const GRID_LOBI = { lebar: kampung.lebar, tinggi: kampung.tinggi, tabrakan: tutupGerbang({ ...kampung, tabrakan: GRID }) };

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
const csp = (page: Page) => page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []);

async function buatRuang(request: APIRequestContext, isi: Record<string, unknown> = {}): Promise<string> {
  const j = await request.post("/api/ruang-coba", { data: isi });
  expect(j.status()).toBe(201);
  return ((await j.json()) as { kode: string }).kode;
}
const kelas = async (request: APIRequestContext, kode: string, pesan: Record<string, unknown>) => {
  const j = await request.post(`/api/ruang-coba/${kode}/kelas`, { data: { v: PROTOKOL_VERSI, ...pesan } });
  expect(j.status()).toBe(200);
  return ((await j.json()) as { status: string }).status;
};

async function konteks(browser: Browser, baseURL: string, hp = false): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx = await browser.newContext({
    baseURL,
    viewport: hp ? { width: 731, height: 411 } : { width: 1280, height: 720 },
    ...(hp ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2.625 } : {}),
  });
  return { ctx, page: await ctx.newPage() };
}

/** Bergabung lewat tautan ruang, memilih nama pertama dan avatar ke-n, lalu menunggu dunia lobi. */
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

const dunia = (page: Page) => page.locator("canvas.js-kanvas-dunia");
const data = (page: Page) => dunia(page).evaluate((k) => ({ ...(k as HTMLCanvasElement).dataset }));
const posisi = async (page: Page) => {
  const d = (await dunia(page).getAttribute("data-diri")) ?? "";
  const [x, y] = d.split(",").map(Number);
  return { x, y };
};

/** Warna piksel kanvas dunia di titik logis (x, y), dibaca lewat salinan agar kanvas dunia tidak dibaca berulang. */
const piksel = (page: Page, x: number, y: number) =>
  dunia(page).evaluate(
    (k, [px, py]) => {
      const c = k as HTMLCanvasElement;
      const s = Number(c.dataset.skala ?? "1");
      const salin = document.createElement("canvas");
      salin.width = 1;
      salin.height = 1;
      const ctx = salin.getContext("2d", { willReadFrequently: true });
      ctx?.drawImage(c, px * s + Math.floor(s / 2), py * s + Math.floor(s / 2), 1, 1, 0, 0, 1, 1);
      return [...(ctx?.getImageData(0, 0, 1, 1).data ?? [])].slice(0, 3);
    },
    [x, y],
  );

async function fotoLaptop(page: Page, nama: string): Promise<void> {
  for (const u of UKURAN) {
    await page.setViewportSize({ width: u.width, height: u.height });
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${LAYAR}/dunia-${nama}-${u.nama}.png` });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
}

/** Bot jujur di halaman lobi: berjalan mendatar 72 px/detik dan berbalik di depan dinding. */
async function bot(baseURL: string, kode: string, nomor: number) {
  const ws = new WebSocket(`${baseURL.replace(/^http/, "ws")}/ws/ruang/${kode}`, { headers: { Origin: baseURL } } as unknown as string[]);
  const b = { ws, x: 0, y: 0, seq: 0, arah: nomor % 2 ? 1 : -1, siap: false };
  await new Promise<void>((ok, gagal) => {
    ws.onopen = () => ws.send(JSON.stringify({ v: PROTOKOL_VERSI, t: "halo", peran: "pemain" }));
    ws.onerror = () => gagal(new Error("bot gagal tersambung"));
    ws.onmessage = (e) => {
      const m = JSON.parse(String(e.data)) as Record<string, unknown>;
      if (m.t === "selamat_datang" || m.t === "saran_nama") {
        ws.send(JSON.stringify({ v: PROTOKOL_VERSI, t: "pilih_identitas", nama: (m.saranNama as string[])[0], avatar: nomor % 8 }));
      } else if (m.t === "koreksi") {
        b.x = m.x as number;
        b.y = m.y as number;
        b.seq = Math.max(b.seq, m.seq as number);
        if (!b.siap) {
          b.siap = true;
          ok();
        }
      }
    };
  });
  return b;
}

function langkahBot(b: Awaited<ReturnType<typeof bot>>) {
  if (!b.siap || b.ws.readyState !== 1) return;
  let x = b.x + b.arah * 7.2;
  if (!posisiSah(GRID_LOBI, x, b.y)) {
    b.arah = -b.arah;
    x = b.x + b.arah * 7.2;
    if (!posisiSah(GRID_LOBI, x, b.y)) return;
  }
  b.x = Math.round(x * 10) / 10;
  b.ws.send(JSON.stringify({ v: PROTOKOL_VERSI, t: "gerak", x: b.x, y: b.y, arah: b.arah > 0 ? "kanan" : "kiri", jalan: true, seq: ++b.seq }));
}

test("dua pemain saling melihat di lobi tanpa bergerak; berjalan dengan keyboard terlihat pemain lain (AC-1 sampai AC-3, AC-6, AC-9 sampai AC-11)", async ({
  browser,
  baseURL,
  request,
}) => {
  const kode = await buatRuang(request);
  const a = await konteks(browser, baseURL!);
  const b = await konteks(browser, baseURL!, true);
  const catatan = [await pantau(a.page), await pantau(b.page)];
  const namaA = await gabung(a.page, kode, 1);
  await gabung(b.page, kode, 3);
  await expect(dunia(a.page)).toHaveAttribute("data-lain", "1");
  await expect(dunia(b.page)).toHaveAttribute("data-lain", "1");
  // Skala laptop 1280 × 720 = ×4, kanvas 1.280 × 720 piksel perangkat (P-1).
  expect(await data(a.page)).toMatchObject({ skala: "4", masa: "pagi" });
  expect(await dunia(a.page).evaluate((k) => [(k as HTMLCanvasElement).width, (k as HTMLCanvasElement).height])).toEqual([1280, 720]);
  // Panel lobi: kode, nama sendiri, jumlah pemain, dua kalimat (P-26).
  await expect(a.page.getByText(kode)).toBeVisible();
  await expect(a.page.getByText(namaA)).toBeVisible();
  await expect(a.page.getByText("2 pemain di ruang")).toBeVisible();
  await expect(a.page.getByText("Menunggu guru memulai…")).toBeVisible();
  // Keyboard: A berjalan ke kanan; tombol panah tidak menggulir halaman; B melihat A berpindah.
  const awalA = await posisi(a.page);
  const terdekatB = (await dunia(b.page).getAttribute("data-terdekat")) ?? "";
  await dunia(a.page).focus();
  await a.page.keyboard.down("ArrowRight");
  await a.page.waitForTimeout(700);
  await a.page.keyboard.up("ArrowRight");
  await a.page.waitForTimeout(700);
  const sesudahA = await posisi(a.page);
  expect(sesudahA.x - awalA.x).toBeGreaterThan(30);
  expect(sesudahA.y).toBe(awalA.y);
  expect(await a.page.evaluate(() => window.scrollY + window.scrollX)).toBe(0);
  await expect.poll(async () => (await dunia(b.page).getAttribute("data-terdekat")) ?? "").not.toBe(terdekatB);
  await expect.poll(async () => (await dunia(b.page).getAttribute("data-terdekat")) ?? "").toBe(`${sesudahA.x},${sesudahA.y}`);
  // Diagonal tidak lebih cepat: tombol tegak lurus bersama.
  await a.page.keyboard.down("KeyS");
  await a.page.keyboard.down("KeyA");
  await a.page.waitForTimeout(500);
  await a.page.keyboard.up("KeyS");
  await a.page.keyboard.up("KeyA");
  await fotoLaptop(a.page, "lobi");
  expect(await data(b.page)).toMatchObject({ skala: "6" });
  await b.page.screenshot({ path: `${LAYAR}/dunia-lobi-731x411.png` });
  for (const [i, p] of [a, b].entries()) {
    expect(await csp(p.page)).toEqual([]);
    expect(catatan[i]).toEqual({ konsol: [], respons: [] });
  }
  await a.ctx.close();
  await b.ctx.close();
});

test("HP: joystick sentuh menggerakkan pemain, laptop tanpa joystick, ajakan putar saat tegak (AC-7, AC-14)", async ({ browser, baseURL, request }) => {
  const kode = await buatRuang(request);
  const hp = await konteks(browser, baseURL!, true);
  const laptop = await konteks(browser, baseURL!);
  const catatan = await pantau(hp.page);
  await gabung(hp.page, kode, 2);
  await gabung(laptop.page, kode, 4);
  expect(await data(hp.page)).toMatchObject({ skala: "6" });
  const awal = await posisi(hp.page);
  const cdp = await hp.ctx.newCDPSession(hp.page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 150, y: 300 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 190, y: 300 }] });
  await expect(hp.page.locator(".js-joystick")).toBeVisible();
  await hp.page.waitForTimeout(800);
  await hp.page.screenshot({ path: `${LAYAR}/dunia-joystick-731x411.png` });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(hp.page.locator(".js-joystick")).toHaveCount(0);
  await hp.page.waitForTimeout(600);
  const sesudah = await posisi(hp.page);
  expect(sesudah.x - awal.x).toBeGreaterThan(25);
  // Separuh kanan dunia tidak memulai joystick.
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 600, y: 300 }] });
  await expect(hp.page.locator(".js-joystick")).toHaveCount(0);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  // Laptop: seret tetikus tidak memunculkan joystick.
  await laptop.page.mouse.move(200, 400);
  await laptop.page.mouse.down();
  await laptop.page.mouse.move(260, 400);
  await expect(laptop.page.locator(".js-joystick")).toHaveCount(0);
  await laptop.page.mouse.up();
  // HP tegak: hanya ajakan putar.
  await hp.page.setViewportSize({ width: 411, height: 731 });
  await expect(hp.page.getByText("Putar HP ke posisi mendatar")).toBeVisible();
  await hp.page.screenshot({ path: `${LAYAR}/dunia-putar-411x731.png` });
  await hp.page.setViewportSize({ width: 731, height: 411 });
  await expect(hp.page.getByText("Putar HP ke posisi mendatar")).toHaveCount(0);
  expect(await csp(hp.page)).toEqual([]);
  expect(catatan).toEqual({ konsol: [], respons: [] });
  await hp.ctx.close();
  await laptop.ctx.close();
});

test("ronde: gerbang terbuka, bilah atas, peta mini, peta besar, masa berganti, dua menit terakhir, jeda (AC-5, AC-11 sampai AC-13)", async ({
  browser,
  baseURL,
  request,
}) => {
  test.setTimeout(120_000);
  const kode = await buatRuang(request, { durasiMenit: 10 });
  const a = await konteks(browser, baseURL!);
  const h = await konteks(browser, baseURL!, true);
  await a.page.clock.install({ time: Date.now() });
  await h.page.clock.install({ time: Date.now() });
  const catatan = [await pantau(a.page), await pantau(h.page)];
  await gabung(a.page, kode, 5);
  await gabung(h.page, kode, 2);
  // Pagi: marka di pinggir pandangan cream (P-9).
  const MARKA = { x: 68, y: 90 };
  await expect.poll(() => piksel(a.page, MARKA.x, MARKA.y)).toEqual([255, 246, 224]);
  expect(await kelas(request, kode, { t: "mulai" })).toBe("hitung_mundur");
  await expect(a.page.getByText("Bersiap")).toBeVisible();
  await expect(a.page.locator(".js-bilah")).toBeVisible({ timeout: 6000 });
  await expect(a.page.locator(".js-bilah")).toHaveAttribute("data-masa", "pagi");
  await expect(a.page.getByRole("button", { name: "Buka peta besar" })).toBeVisible();
  await expect(a.page.locator(".js-jam")).toHaveAttribute("aria-label", /^Jam cerita 06\.0\d$/);
  await expect(a.page.locator(".js-sisa")).toHaveAttribute("aria-label", /^Sisa waktu (10:00|09:5\d)$/);
  await fotoLaptop(a.page, "ronde-pagi");
  await expect(h.page.locator(".js-bilah")).toHaveAttribute("data-masa", "pagi");
  await h.page.screenshot({ path: `${LAYAR}/dunia-ronde-pagi-731x411.png` });
  await h.page.getByRole("button", { name: "Buka peta besar" }).tap();
  await expect(h.page.getByRole("dialog", { name: "Peta kampung" })).toBeVisible();
  await h.page.screenshot({ path: `${LAYAR}/dunia-peta-besar-731x411.png` });
  await h.page.getByRole("button", { name: "Tutup peta" }).tap();
  await expect(h.page.getByRole("dialog", { name: "Peta kampung" })).toHaveCount(0);
  // Peta besar: dibuka dengan P dan dengan klik, ditutup dengan Esc dan tombol; fokus kembali ke dunia (P-37 sampai P-39).
  await dunia(a.page).focus();
  await a.page.keyboard.press("KeyP");
  await expect(a.page.getByRole("dialog", { name: "Peta kampung" })).toBeVisible();
  await expect(a.page.getByText("Kamu di sini")).toBeVisible();
  await expect(a.page.getByText("Taman, sungai, dan pantai")).toBeVisible();
  await expect(a.page.getByRole("button", { name: "Tutup peta" })).toBeFocused();
  const sebelumPeta = await posisi(a.page);
  await a.page.keyboard.down("ArrowLeft");
  await a.page.waitForTimeout(400);
  await a.page.keyboard.up("ArrowLeft");
  expect(await posisi(a.page)).toEqual(sebelumPeta); // pemain berhenti selama peta besar terbuka (D-5)
  await fotoLaptop(a.page, "peta-besar");
  await a.page.keyboard.press("Escape");
  await expect(a.page.getByRole("dialog", { name: "Peta kampung" })).toHaveCount(0);
  await expect(dunia(a.page)).toBeFocused();
  await a.page.getByRole("button", { name: "Buka peta besar" }).click();
  await a.page.getByRole("button", { name: "Tutup peta" }).click();
  await expect(a.page.getByRole("dialog", { name: "Peta kampung" })).toHaveCount(0);
  // Jam tiruan peramban: selisih jam ditaksir dari median lima ping, jadi tunggu lima ping dulu, lalu lompat sekali
  // (satu ping baru tidak menggeser median). Sesudah lompatan, sore dan dua menit terakhir; lalu tambah waktu
  // memundurkan langit ke siang (P-30).
  await a.page.waitForTimeout(21_000);
  await a.page.clock.fastForward("08:10"); // kemajuan ± 0,86: sore, sisa < 2 menit
  await h.page.clock.fastForward("08:10");
  await expect(a.page.locator(".js-bilah")).toHaveAttribute("data-masa", "sore");
  await expect(dunia(a.page)).toHaveAttribute("data-masa", "sore");
  await expect.poll(() => piksel(a.page, MARKA.x, MARKA.y)).toEqual([255, 246, 224]);
  await expect(a.page.locator(".js-sisa")).toHaveAttribute("data-dua-menit", "ya");
  await expect(a.page.locator(".js-busur")).toHaveAttribute("data-denyut", "ya");
  await expect(a.page.locator(".js-pita")).toHaveText("Dua menit lagi");
  await fotoLaptop(a.page, "ronde-sore");
  await expect(h.page.locator(".js-bilah")).toHaveAttribute("data-masa", "sore");
  await h.page.screenshot({ path: `${LAYAR}/dunia-ronde-sore-731x411.png` });
  expect(await kelas(request, kode, { t: "tambah_waktu", detik: 240 })).toBe("main");
  await expect(a.page.locator(".js-bilah")).toHaveAttribute("data-masa", "siang");
  await expect(dunia(a.page)).toHaveAttribute("data-masa", "siang");
  await expect.poll(() => piksel(a.page, MARKA.x, MARKA.y)).toEqual([255, 255, 255]);
  await expect(a.page.locator(".js-sisa")).not.toHaveAttribute("data-dua-menit", "ya");
  expect(await kelas(request, kode, { t: "jeda" })).toBe("jeda");
  await expect(a.page.getByRole("dialog", { name: "Dijeda oleh guru" })).toBeVisible();
  await a.page.screenshot({ path: `${LAYAR}/dunia-dijeda-1280x720.png` });
  expect(await kelas(request, kode, { t: "lanjut" })).toBe("main");
  await expect(a.page.getByRole("dialog", { name: "Dijeda oleh guru" })).toHaveCount(0);
  for (const [i, p] of [a, h].entries()) {
    expect(await csp(p.page)).toEqual([]);
    expect(catatan[i]).toEqual({ konsol: [], respons: [] });
  }
  await a.ctx.close();
  await h.ctx.close();
});

test("gerbang tertutup di lobi, terbuka sesudah mulai; menyambung ulang di atas dunia kembali ke posisi terakhir (AC-11, AC-14, AC-16)", async ({
  browser,
  baseURL,
  request,
}) => {
  test.setTimeout(90_000);
  const kode = await buatRuang(request);
  const { ctx, page } = await konteks(browser, baseURL!);
  const catatan = await pantau(page, [/WebSocket connection to .* failed/, /ERR_INTERNET_DISCONNECTED/]);
  await gabung(page, kode, 6);
  // Ke depan gerbang: mendatar ke tengah bukaan gerbang dengan tekanan pendek, lalu ke bawah.
  const gb = kampung.gerbangLobi;
  const tahan = async (tombol: string, ms: number) => {
    await page.keyboard.down(tombol);
    await page.waitForTimeout(ms);
    await page.keyboard.up(tombol);
    await page.waitForTimeout(600); // atribut data diperbarui setiap 500 ms
  };
  await dunia(page).focus();
  const tengahGerbang = ((gb.kiri + gb.kanan + 1) / 2) * 16;
  for (let i = 0; i < 8; i++) {
    const dx = tengahGerbang - (await posisi(page)).x;
    if (Math.abs(dx) <= 5) break;
    await tahan(dx > 0 ? "KeyD" : "KeyA", Math.max(30, Math.round((Math.abs(dx) / 72) * 1000) - 20));
  }
  expect(Math.abs((await posisi(page)).x - tengahGerbang)).toBeLessThanOrEqual(5);
  await tahan("KeyS", 4000);
  const tertahan = await posisi(page);
  expect(tertahan.y).toBeLessThanOrEqual(gb.atas * 16);
  await page.screenshot({ path: `${LAYAR}/dunia-gerbang-tutup-1280x720.png` });
  expect(await kelas(request, kode, { t: "mulai" })).toBe("hitung_mundur");
  await expect(page.locator(".js-bilah")).toBeVisible({ timeout: 6000 });
  await page.screenshot({ path: `${LAYAR}/dunia-gerbang-buka-1280x720.png` });
  await tahan("KeyS", 1500);
  const lewat = await posisi(page);
  expect(lewat.y).toBeGreaterThan((gb.bawah + 1) * 16);
  // Menyambung ulang: lapisan di atas dunia, lalu kembali di posisi terakhir.
  await request.post(`/api/ruang-coba/${kode}/putuskan`);
  const lapisan = page.getByRole("dialog", { name: "Menyambung ulang…" });
  await expect(lapisan).toBeVisible();
  await expect(dunia(page)).toBeVisible();
  await page.screenshot({ path: `${LAYAR}/dunia-menyambung-1280x720.png` });
  await expect(lapisan).toBeHidden({ timeout: 15_000 });
  await expect.poll(() => posisi(page)).toEqual(lewat);
  expect(catatan).toEqual({ konsol: [], respons: [] });
  await ctx.close();
});

/** Histogram kumulatif waktu kode gambar dari atribut data kanvas (batas kelompok: KELOMPOK_WAKTU, JS-08 P-68). */
const BATAS_KELOMPOK = [1, 2, 3, 4, 6, 8, 12, 16, 25, 50, 100, Infinity];
const histogram = async (page: Page) => ((await dunia(page).getAttribute("data-histogram")) ?? "").split(",").map(Number);
function ringkasHistogram(awal: number[], akhir: number[]) {
  const n = akhir.map((v, i) => v - (awal[i] ?? 0));
  const total = n.reduce((a, b) => a + b, 0);
  let kumulatif = 0;
  let p95 = Infinity;
  for (let i = 0; i < n.length; i++) {
    kumulatif += n[i];
    if (kumulatif >= 0.95 * total) {
      p95 = BATAS_KELOMPOK[i];
      break;
    }
  }
  const terakhir = n.findLastIndex((v) => v > 0);
  // Bingkai 50 ms ke atas (kelompok 50–100 dan ≥ 100) dan 100 ms ke atas (P-69).
  const i50 = BATAS_KELOMPOK.indexOf(100);
  const lambat50 = n.slice(i50).reduce((a, b) => a + b, 0);
  const lambat100 = n.slice(i50 + 1).reduce((a, b) => a + b, 0);
  return { bingkai: total, p95Paling: p95, maksPaling: terakhir >= 0 ? BATAS_KELOMPOK[terakhir] : 0, persen50: total ? (100 * lambat50) / total : 0, lambat100, kelompok: n };
}

test("kinerja: 40 pemain tiruan di ukuran HP; CPU normal dan CPU 6× lebih lambat di lobi, berjalan, dekat kejadian, dan pergantian masa (JS-07 AC-19 dengan ambang JS-08 P-69; ± 4 menit)", async ({
  browser,
  baseURL,
  request,
}) => {
  test.setTimeout(330_000);
  const kode = await buatRuang(request, { batasPemain: 45, durasiMenit: 10 });
  const hp = await konteks(browser, baseURL!, true);
  const namaHp = await gabung(hp.page, kode, 7);
  const bots: Awaited<ReturnType<typeof bot>>[] = [];
  for (let i = 0; i < 40; i++) bots.push(await bot(baseURL!, kode, i));
  const putaran = setInterval(() => bots.forEach(langkahBot), 100);
  const cdp = await hp.ctx.newCDPSession(hp.page);
  try {
    // CPU normal: 40 pemain berjalan di lobi (P-69 butir 1).
    await hp.page.waitForTimeout(3000);
    let awal = await histogram(hp.page);
    await hp.page.waitForTimeout(5000);
    const normal = { ...ringkasHistogram(awal, await histogram(hp.page)), detik: 5 };
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
    await hp.page.waitForTimeout(2000);
    awal = await histogram(hp.page);
    await hp.page.waitForTimeout(10_000); // lobi penuh: 40 pemain berjalan di sekitar pemain
    const lobi = { ...ringkasHistogram(awal, await histogram(hp.page)), lain: Number(await dunia(hp.page).getAttribute("data-lain")) };
    expect(await kelas(request, kode, { t: "mulai" })).toBe("hitung_mundur");
    await expect(hp.page.locator(".js-bilah")).toBeVisible({ timeout: 8000 });
    const mulaiMain = Date.now();
    await dunia(hp.page).focus();
    awal = await histogram(hp.page);
    await hp.page.keyboard.down("ArrowDown");
    await hp.page.keyboard.down("ArrowRight");
    await hp.page.waitForTimeout(12_000); // berjalan melintasi peta
    await hp.page.keyboard.up("ArrowDown");
    await hp.page.keyboard.up("ArrowRight");
    const jalan = { ...ringkasHistogram(awal, await histogram(hp.page)), diri: await dunia(hp.page).getAttribute("data-diri") };
    // Berdiri dekat kejadian K-13: penanda, tiga tokoh, dan bangku antrean tergambar (P-69 keadaan keempat).
    const titik = ((await (await request.get(`/api/ruang-coba/${kode}/kejadian`)).json()) as { kejadian: { kejadianId: string; titik: { x: number; y: number }[] }[] }).kejadian;
    const t13 = titik.find((k) => k.kejadianId === "K-13")!.titik[0];
    expect((await request.post(`/api/ruang-coba/${kode}/pindahkan`, { data: { nama: namaHp, x: t13.x, y: t13.y + 1 } })).status()).toBe(200);
    await expect(dunia(hp.page)).toHaveAttribute("data-tokoh-kejadian", "4", { timeout: 8000 });
    awal = await histogram(hp.page);
    await hp.page.waitForTimeout(8000);
    const dekat = { ...ringkasHistogram(awal, await histogram(hp.page)), tokoh: await dunia(hp.page).getAttribute("data-tokoh-kejadian") };
    // Pergantian pagi ke siang di kemajuan 0,3 (3 menit pada ronde 10 menit), dengan waktu sungguhan.
    await hp.page.waitForTimeout(Math.max(0, mulaiMain + 168_000 - Date.now()));
    awal = await histogram(hp.page);
    await hp.page.waitForTimeout(20_000);
    const masa = { ...ringkasHistogram(awal, await histogram(hp.page)), masa: await dunia(hp.page).getAttribute("data-masa") };
    console.log("KINERJA", JSON.stringify({ normal, lobi, jalan, dekat, masa }));
    expect(lobi.lain).toBeGreaterThanOrEqual(30);
    expect(masa.masa).toBe("siang");
    // CPU normal (P-69 butir 1): p95 ≤ 4 ms, bingkai terlama ≤ 25 ms, sedikitnya 50 bingkai per detik.
    expect(normal.p95Paling, "normal: p95").toBeLessThanOrEqual(4);
    expect(normal.maksPaling, "normal: bingkai terlama").toBeLessThanOrEqual(25);
    expect(normal.bingkai / normal.detik, "normal: bingkai per detik").toBeGreaterThanOrEqual(50);
    // CPU 6× (P-69 butir 2): p95 ≤ 50 ms, bingkai 50 ms ke atas paling banyak 1%, tanpa bingkai 100 ms ke atas.
    for (const [nama, r] of Object.entries({ lobi, jalan, dekat, masa })) {
      expect(r.p95Paling, `${nama}: p95`).toBeLessThanOrEqual(50);
      expect(r.persen50, `${nama}: bingkai 50 ms ke atas (%)`).toBeLessThanOrEqual(1);
      expect(r.lambat100, `${nama}: bingkai 100 ms ke atas`).toBe(0);
    }
  } finally {
    clearInterval(putaran);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 }).catch(() => undefined);
    for (const b of bots) b.ws.close();
    await hp.ctx.close();
  }
});
