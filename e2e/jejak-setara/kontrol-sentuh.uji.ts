// Uji ujung ke ujung kontrol sentuh dan layar penuh (spesifikasi JS-24, rencana uji "Ujung ke ujung"; AC-1 sampai
// AC-11 dan AC-14). Dua jari dibuat lewat sesi CDP Playwright (`Input.dispatchTouchEvent`), cara yang dicoba di Plan v1.2:
// jari 1 memegang analog di separuh kiri dunia, jari 2 menekan tombol (`touchStart` dengan kedua jari), lalu hanya jari 2
// diangkat (`touchEnd` berisi jari 2 saja). Klik dihitung di tingkat jendela, dan `pakai_skill` dari bingkai WebSocket
// terkirim. `requestFullscreen` dan `screen.orientation.lock` diamati dengan mata-mata. Tangkapan layar disimpan di
// docs/jejak-setara/tests/JS-24/.
import { readFileSync } from "node:fs";
import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type CDPSession, type Page } from "@playwright/test";
import { posisiSah } from "../../app/jejak-setara/inti/gerak";
import { uraiRle } from "../../app/jejak-setara/inti/peta";
import { buatRuang, kejadianRuang, kelas, pindahkanPemain, tutupRuangBerkas } from "./ruang-uji";

test.describe.configure({ mode: "serial" });
test.afterAll(tutupRuangBerkas);

const FOTO = "docs/jejak-setara/tests/JS-24";

type Ubin = { x: number; y: number };
type Kotak = { id: string; jenis: string; x: number; y: number };
const kampung = JSON.parse(readFileSync(new URL("../../app/jejak-setara/peta/kampung.json", import.meta.url), "utf8")) as {
  lebar: number;
  tinggi: number;
  tabrakan: string;
  kotak: Kotak[];
  halte: { id: string; x: number; y: number }[];
};
const GRID = { lebar: kampung.lebar, tinggi: kampung.tinggi, tabrakan: uraiRle(kampung.tabrakan, kampung.lebar * kampung.tinggi) };
const kaki = (u: Ubin) => ({ x: u.x * 16 + 8, y: u.y * 16 + 12 });
function bebas(y: number, x0: number, x1: number): boolean {
  for (let x = Math.floor(x0); x <= x1; x++) if (!posisiSah(GRID, x, y)) return false;
  return true;
}
/** Lorong mendatar 26 ubin tanpa kotak dan jauh dari titik kejadian ruang ini, untuk berjalan ke kanan dengan analog. */
function cariLorong(titikKejadian: readonly Ubin[]): Ubin {
  for (let uy = 2; uy < kampung.tinggi - 2; uy++)
    for (let ux = 2; ux + 27 < kampung.lebar; ux++) {
      const f = kaki({ x: ux, y: uy });
      if (!bebas(f.y, f.x, f.x + 26 * 16)) continue;
      const dekat = (u: Ubin, r: number) => u.x >= ux - r && u.x <= ux + 27 + r && Math.abs(u.y - uy) <= r;
      if (kampung.kotak.some((k) => dekat(k, 1)) || titikKejadian.some((t) => dekat(t, 3))) continue;
      return { x: ux, y: uy };
    }
  throw new Error("tidak ada lorong");
}
function kotakDatar(jenis: string): Kotak {
  const kt = kampung.kotak.find((k) => k.jenis === jenis && bebas(k.y * 16 + 12, k.x * 16 - 8, k.x * 16 + 56));
  if (!kt) throw new Error(`tidak ada kotak ${jenis} di baris datar`);
  return kt;
}

interface Pemain {
  ctx: BrowserContext;
  page: Page;
  nama: string;
  kode: string;
  konsol: string[];
  kirim: string[];
}

async function gabung(browser: Browser, baseURL: string, kode: string, jenis: "hp" | "laptop", avatar: number, opsi: { ukuran?: { width: number; height: number }; rasio?: number } = {}): Promise<Pemain> {
  const hp = jenis === "hp";
  const ctx = await browser.newContext({
    baseURL,
    viewport: opsi.ukuran ?? (hp ? { width: 731, height: 411 } : { width: 1280, height: 720 }),
    ...(hp ? { isMobile: true, hasTouch: true, deviceScaleFactor: opsi.rasio ?? 2.625 } : {}),
  });
  const page = await ctx.newPage();
  const p: Pemain = { ctx, page, nama: "", kode, konsol: [], kirim: [] };
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") p.konsol.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (g) => p.konsol.push(`pageerror: ${g.message}`));
  page.on("websocket", (ws) => ws.on("framesent", (f) => p.kirim.push(String(f.payload))));
  await page.addInitScript(() => {
    const w = window as unknown as { __klik: string[]; __layar: string[]; __tolak: boolean };
    w.__klik = [];
    w.__layar = [];
    w.__tolak = false;
    window.addEventListener(
      "click",
      (e) => {
        const t = e.target as Element | null;
        w.__klik.push(`${(e as PointerEvent).pointerType ?? "?"}:${t?.getAttribute?.("class") ?? t?.tagName ?? ""}`);
      },
      true,
    );
    const asli = Element.prototype.requestFullscreen;
    Element.prototype.requestFullscreen = function (this: Element, ...isi: Parameters<Element["requestFullscreen"]>) {
      w.__layar.push("request");
      if (w.__tolak) return Promise.reject(new TypeError("ditolak uji"));
      return asli.apply(this, isi);
    };
    if (screen.orientation)
      Object.defineProperty(screen.orientation, "lock", {
        configurable: true,
        value: (arah: string) => {
          w.__layar.push(`lock:${arah}`);
          return Promise.resolve();
        },
      });
  });
  await page.goto(`/?kode=${kode}`);
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible({ timeout: 20_000 });
  const pilihan = page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first();
  p.nama = (await pilihan.textContent())?.replace("▶", "").trim() ?? "";
  await pilihan.click();
  await page.getByRole("radio", { name: `Avatar ${avatar}` }).click();
  await page.getByRole("button", { name: "Gabung" }).click();
  await expect(dunia(page)).toHaveAttribute("data-diri", /^\d+,\d+$/);
  return p;
}

const dunia = (page: Page) => page.locator("canvas.js-kanvas-dunia");
const pita = (page: Page) => page.locator(".js-pita");
const petaBesar = (page: Page) => page.locator(".js-peta-besar");
const joystick = (page: Page) => page.locator(".js-joystick");
const ikon = (page: Page) => page.locator(".js-hud-layar-penuh");
const tombolSkill = (page: Page, s: string) => page.locator(`.js-tombol-skill[data-skill="${s}"]`);
const panel = (page: Page) => page.getByRole("dialog", { name: "Pengaturan" });
const klik = (page: Page) => page.evaluate(() => (window as unknown as { __klik: string[] }).__klik.length);
const layar = (page: Page) => page.evaluate(() => (window as unknown as { __layar: string[] }).__layar.splice(0));
const tolak = (page: Page, ya: boolean) => page.evaluate((v) => ((window as unknown as { __tolak: boolean }).__tolak = v), ya);
const layarPenuh = (page: Page) => page.evaluate(() => document.fullscreenElement?.tagName ?? null);
const keluarLayarPenuh = (page: Page) => page.evaluate(() => (document.fullscreenElement ? document.exitFullscreen() : undefined));
async function diri(page: Page): Promise<number[]> {
  return ((await dunia(page).getAttribute("data-diri")) ?? "").split(",").map(Number);
}
/** Posisi pemain berubah dalam `ms`. Atribut `data-diri` ditulis setiap 500 ms, jadi selangnya lebih dari itu. */
async function bergerak(page: Page, ms = 700): Promise<boolean> {
  const a = await diri(page);
  await page.waitForTimeout(ms);
  const b = await diri(page);
  return a[0] !== b[0] || a[1] !== b[1];
}
/** Pemain diam: tunggu satu penulisan `data-diri` sesudah berhenti, lalu posisi tidak berubah selama 700 ms. */
async function diam(page: Page): Promise<boolean> {
  await page.waitForTimeout(600);
  return !(await bergerak(page));
}
async function pindahkan(request: APIRequestContext, p: Pemain, u: Ubin): Promise<void> {
  expect((await pindahkanPemain(request, p.kode, p.nama, u.x, u.y)).status()).toBe(200);
  const f = kaki(u);
  await expect(dunia(p.page)).toHaveAttribute("data-diri", `${f.x},${f.y}`);
}
async function mulai(request: APIRequestContext, kode: string, pemain: Pemain[]): Promise<void> {
  await kelas(request, kode, { t: "mulai" });
  for (const p of pemain) await expect(p.page.locator(".js-dunia")).toHaveAttribute("data-status", "main", { timeout: 10_000 });
}
async function tengah(page: Page, sel: string): Promise<{ x: number; y: number }> {
  const b = await page.locator(sel).first().boundingBox();
  expect(b, sel).not.toBeNull();
  return { x: b!.x + b!.width / 2, y: b!.y + b!.height / 2 };
}

// ---------------------------------------------------------------------------------------------------------------------
// Jari lewat CDP.

type Jari = { x: number; y: number; id: number };
class Sentuh {
  private constructor(private readonly cdp: CDPSession) {}
  static async buka(page: Page): Promise<Sentuh> {
    return new Sentuh(await page.context().newCDPSession(page));
  }
  async kirim(type: "touchStart" | "touchMove" | "touchEnd", titik: Jari[]): Promise<void> {
    await this.cdp.send("Input.dispatchTouchEvent", { type, touchPoints: titik.map((t) => ({ x: t.x, y: t.y, id: t.id })) });
  }
  /** Jari 1 menekan dunia di `j`, lalu bergeser `dx` ke kanan (0: tetap di zona diam). */
  async pegangAnalog(j: { x: number; y: number }, dx = 40): Promise<Jari> {
    const j1 = { x: j.x, y: j.y, id: 1 };
    await this.kirim("touchStart", [j1]);
    for (let i = 1; i <= 4 && dx !== 0; i++) await this.kirim("touchMove", [{ ...j1, x: j.x + (dx * i) / 4 }]);
    return { ...j1, x: j.x + dx };
  }
  /** Jari kedua mengetuk `b` selama `j1` menempel; hanya jari kedua yang diangkat. */
  async ketukKedua(j1: Jari, b: { x: number; y: number }, angkat: { x: number; y: number } = b): Promise<void> {
    const j2 = { x: b.x, y: b.y, id: 2 };
    await this.kirim("touchStart", [j1, j2]);
    if (angkat.x !== b.x || angkat.y !== b.y) await this.kirim("touchMove", [j1, { ...j2, x: angkat.x, y: angkat.y }]);
    await this.kirim("touchEnd", [{ ...j2, x: angkat.x, y: angkat.y }]);
  }
  async lepasSemua(): Promise<void> {
    await this.kirim("touchEnd", []);
  }
}

/** Titik analog di separuh kiri dunia, di bawah kelompok Menu dan jauh dari tombol. */
async function titikAnalog(page: Page): Promise<{ x: number; y: number }> {
  const h = (await page.locator(".js-hud").boundingBox())!;
  return { x: Math.round(h.x + h.width * 0.22), y: Math.round(h.y + h.height * 0.68) };
}

const catat = (judul: string, isi: unknown) => console.log(`[JS-24] ${judul}: ${JSON.stringify(isi)}`);

// ---------------------------------------------------------------------------------------------------------------------

test("HP 731 × 411: jari kedua di lobi dan selama berjalan, joystick berakhir, urutan terbalik, dan tanpa aksi (AC-4, AC-5, AC-6, AC-8, AC-10, AC-11, AC-14)", async ({
  browser,
  baseURL,
  request,
}) => {
  test.setTimeout(240_000);
  const kode = await buatRuang(request, {});
  const hp = await gabung(browser, baseURL!, kode, "hp", 1);
  const page = hp.page;
  const jari = await Sentuh.buka(page);
  const awal = await titikAnalog(page);

  // AC-4: di lobi, jari kedua pada tombol "Layar penuh" panel lobi selama analog dipegang memasuki layar penuh.
  const tombolLobi = page.locator(".js-panel-lobi").getByRole("button", { name: "Layar penuh" });
  await expect(tombolLobi).toBeVisible();
  let j1 = await jari.pegangAnalog(awal);
  await expect(joystick(page)).toBeVisible();
  await jari.ketukKedua(j1, await tengah(page, ".js-panel-lobi .js-tombol-ikon"));
  await expect.poll(() => layarPenuh(page)).toBe("HTML");
  expect(await layar(page)).toEqual(["request", "lock:landscape"]);
  await expect(tombolLobi).toHaveCount(0);
  await expect(joystick(page)).toHaveCount(0); // P-14: layar penuh dimulai
  await jari.lepasSemua();
  await keluarLayarPenuh(page);
  await expect(tombolLobi).toBeVisible(); // P-6
  await expect(ikon(page)).toHaveCount(0); // P-3: ikon tidak tampil di lobi

  await mulai(request, kode, [hp]);
  await expect(ikon(page)).toBeVisible();
  const daftarKejadian = await kejadianRuang(request, kode);
  const lorong = cariLorong(daftarKejadian.flatMap((k) => k.titik));
  const klikAwal = await klik(page);

  // AC-5: Lari cepat tanpa muatan → pita "Cari kotak sepatu.", avatar terus berjalan.
  await pindahkan(request, hp, lorong);
  j1 = await jari.pegangAnalog(awal);
  expect(await bergerak(page)).toBe(true);
  await jari.ketukKedua(j1, await tengah(page, '.js-tombol-skill[data-skill="lari"]'));
  await expect(pita(page)).toHaveText("Cari kotak sepatu.");
  await page.screenshot({ path: `${FOTO}/jari-kedua-pita-731x411.png` });
  expect(await bergerak(page)).toBe(true);
  await expect(joystick(page)).toBeVisible();
  // AC-5: suara terbalik sekali, avatar terus berjalan (P-15).
  const suara = page.locator(".js-hud-suara");
  await expect(suara).toHaveAttribute("aria-pressed", "false");
  await jari.ketukKedua(j1, await tengah(page, ".js-hud-suara"));
  await expect(suara).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(300);
  await expect(suara).toHaveAttribute("aria-pressed", "true");
  expect(await bergerak(page)).toBe(true);
  // AC-11: jari ketiga di separuh kiri tidak memulai joystick kedua dan tidak mengambil alih yang pertama.
  const gaya = () => joystick(page).getAttribute("style");
  const gayaAwal = await gaya();
  const yAwal = (await diri(page))[1];
  const j3 = { x: awal.x, y: awal.y - 70, id: 3 };
  await jari.kirim("touchStart", [j1, j3]);
  await jari.kirim("touchMove", [j1, { ...j3, y: j3.y - 40 }]);
  await expect(joystick(page)).toHaveCount(1);
  expect(await gaya()).toBe(gayaAwal);
  expect(await bergerak(page)).toBe(true);
  expect((await diri(page))[1]).toBe(yAwal); // tetap ke kanan, bukan ke atas
  await jari.kirim("touchEnd", [{ ...j3, y: j3.y - 40 }]);
  expect(await bergerak(page)).toBe(true);
  // AC-5 dan AC-10: peta mini membuka peta besar yang tetap terbuka; joystick berakhir dan pemain berhenti.
  await jari.ketukKedua(j1, await tengah(page, ".js-peta-mini"));
  await expect(petaBesar(page)).toBeVisible();
  await expect(joystick(page)).toHaveCount(0);
  await page.waitForTimeout(500);
  await expect(petaBesar(page)).toBeVisible();
  expect(await diam(page)).toBe(true);
  await page.screenshot({ path: `${FOTO}/jari-kedua-peta-besar-731x411.png` });
  await page.keyboard.press("Escape");
  await expect(petaBesar(page)).toHaveCount(0);
  // Jari yang sama tidak menggerakkan pemain lagi sesudah lapisan tertutup (P-13).
  await jari.kirim("touchMove", [{ ...j1, x: j1.x + 10 }]);
  expect(await diam(page)).toBe(true);
  await expect(joystick(page)).toHaveCount(0);
  await jari.lepasSemua();
  // Sentuhan baru memulai joystick lagi (AC-10).
  await pindahkan(request, hp, lorong);
  j1 = await jari.pegangAnalog(awal);
  await expect(joystick(page)).toBeVisible();
  expect(await bergerak(page)).toBe(true);
  // AC-5: Menu membuka panel, dan pilihan di panel tidak berubah.
  await jari.ketukKedua(j1, await tengah(page, ".js-hud-menu"));
  await expect(panel(page)).toBeVisible();
  await expect(joystick(page)).toHaveCount(0);
  const pilihan = await panel(page).locator('[role="radio"][aria-checked="true"]').allTextContents();
  await page.waitForTimeout(400);
  expect(await panel(page).locator('[role="radio"][aria-checked="true"]').allTextContents()).toEqual(pilihan);
  expect(pilihan[0]).toBe("Nyala"); // Suara sesudah dibalik di atas
  expect(await diam(page)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(panel(page)).toHaveCount(0);
  await jari.lepasSemua();
  // AC-10: tombol P dan perubahan ukuran tampilan mengakhiri joystick.
  await pindahkan(request, hp, lorong);
  j1 = await jari.pegangAnalog(awal);
  expect(await bergerak(page)).toBe(true);
  await page.keyboard.press("KeyP");
  await expect(petaBesar(page)).toBeVisible();
  await expect(joystick(page)).toHaveCount(0);
  await page.keyboard.press("KeyP");
  await expect(petaBesar(page)).toHaveCount(0);
  expect(await diam(page)).toBe(true);
  await jari.lepasSemua();
  await pindahkan(request, hp, lorong);
  j1 = await jari.pegangAnalog(awal);
  expect(await bergerak(page)).toBe(true);
  await page.setViewportSize({ width: 731, height: 400 });
  await expect(joystick(page)).toHaveCount(0);
  expect(await diam(page)).toBe(true);
  await jari.lepasSemua();
  await page.setViewportSize({ width: 731, height: 411 });
  await page.waitForTimeout(300);
  // AC-5: ikon layar penuh memasuki layar penuh; joystick berakhir saat layar penuh dimulai (P-14).
  await pindahkan(request, hp, lorong);
  j1 = await jari.pegangAnalog(awal);
  expect(await bergerak(page)).toBe(true);
  await jari.ketukKedua(j1, await tengah(page, ".js-hud-layar-penuh"));
  await expect.poll(() => layarPenuh(page)).toBe("HTML");
  expect(await layar(page)).toEqual(["request", "lock:landscape"]);
  await expect(ikon(page)).toHaveCount(0);
  await expect(joystick(page)).toHaveCount(0);
  expect(await diam(page)).toBe(true);
  await jari.lepasSemua();
  await keluarLayarPenuh(page);
  await expect(ikon(page)).toBeVisible();
  // AC-6: urutan terbalik: jari di tombol suara lebih dulu, lalu jari lain memegang analog, lalu jari tombol diangkat.
  await pindahkan(request, hp, lorong);
  const ts = await tengah(page, ".js-hud-suara");
  const tb = { x: ts.x, y: ts.y, id: 2 };
  await jari.kirim("touchStart", [tb]);
  const ja = { x: awal.x, y: awal.y, id: 1 };
  await jari.kirim("touchStart", [tb, ja]);
  for (let i = 1; i <= 4; i++) await jari.kirim("touchMove", [tb, { ...ja, x: awal.x + 10 * i }]);
  expect(await bergerak(page)).toBe(true);
  await jari.kirim("touchEnd", [tb]);
  await expect(suara).toHaveAttribute("aria-pressed", "false");
  await page.waitForTimeout(300);
  await expect(suara).toHaveAttribute("aria-pressed", "false");
  expect(await bergerak(page)).toBe(true);
  await jari.lepasSemua();
  // AC-8: jari diangkat lebih dari 8 px di luar tombol, dan jari yang bergeser masuk dari luar: tanpa aksi.
  const lari = (await tombolSkill(page, "lari").boundingBox())!;
  await expect(pita(page)).toHaveCount(0, { timeout: 8000 });
  await pindahkan(request, hp, lorong);
  j1 = await jari.pegangAnalog(awal);
  await jari.ketukKedua(j1, { x: lari.x + lari.width / 2, y: lari.y + lari.height / 2 }, { x: lari.x + lari.width + 12, y: lari.y + lari.height / 2 });
  const luar = { x: lari.x - 60, y: lari.y + lari.height / 2 }; // dunia di separuh kanan, bukan tombol
  await jari.ketukKedua(j1, luar, { x: lari.x + lari.width / 2, y: lari.y + lari.height / 2 });
  await page.waitForTimeout(500);
  await expect(pita(page)).toHaveCount(0);
  await jari.lepasSemua();
  expect(await klik(page), "tidak ada klik selama ketukan sentuh di tombol HUD").toBe(klikAwal);
  expect(hp.konsol, "tanpa galat dan peringatan konsol").toEqual([]);
  await hp.ctx.close();
});

/** Ruang uji yang sudah berjalan dengan satu HP 731 × 411, untuk uji yang memerlukan kotak, kejadian, atau halte. */
async function hpBermain(browser: Browser, baseURL: string, request: APIRequestContext, avatar: number) {
  const kode = await buatRuang(request, {});
  const hp = await gabung(browser, baseURL, kode, "hp", avatar);
  await mulai(request, kode, [hp]);
  const daftarKejadian = await kejadianRuang(request, kode);
  return { hp, page: hp.page, jari: await Sentuh.buka(hp.page), awal: await titikAnalog(hp.page), daftarKejadian, lorong: cariLorong(daftarKejadian.flatMap((k) => k.titik)) };
}

test("HP 731 × 411: jari kedua pada Lari cepat bermuatan, Periksa, dan Angkot (AC-5, AC-10)", async ({ browser, baseURL, request }) => {
  test.setTimeout(240_000);
  const { hp, page, jari, awal, daftarKejadian, lorong } = await hpBermain(browser, baseURL!, request, 2);
  let j1;

  // AC-5: Lari cepat bermuatan: tepat satu `pakai_skill`, avatar mulai berlari tanpa berhenti.
  const sepatu = kotakDatar("sepatu");
  await pindahkan(request, hp, { x: sepatu.x - 1, y: sepatu.y });
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(450);
  await page.keyboard.up("ArrowRight");
  await expect(tombolSkill(page, "lari")).toHaveAttribute("data-muatan", "1", { timeout: 8000 });
  await expect(pita(page)).toHaveCount(0, { timeout: 8000 });
  await pindahkan(request, hp, lorong);
  j1 = await jari.pegangAnalog(awal);
  expect(await bergerak(page)).toBe(true);
  const kirimAwal = hp.kirim.length;
  await jari.ketukKedua(j1, await tengah(page, '.js-tombol-skill[data-skill="lari"]'));
  await expect(dunia(page)).toHaveAttribute("data-lari", "ya", { timeout: 3000 });
  const jejak: number[] = [];
  for (let i = 0; i < 4; i++) {
    jejak.push((await diri(page))[0]);
    await page.waitForTimeout(550);
  }
  await jari.lepasSemua();
  const terkirim = hp.kirim.slice(kirimAwal);
  expect(terkirim.filter((f) => f.includes('"t":"pakai_skill"'))).toHaveLength(1);
  expect(terkirim.filter((f) => f.includes('"t":"gerak"') && f.includes('"jalan":false')).length, "tanpa laporan berhenti sampai jari 1 diangkat").toBe(0);
  for (let i = 1; i < jejak.length; i++) expect(jejak[i], `x terus bertambah ${JSON.stringify(jejak)}`).toBeGreaterThan(jejak[i - 1]);
  catat("x selama lari sesudah jari kedua", jejak);

  // AC-5 dan AC-10: Periksa dalam jangkauan membuka dialog di tampilan Situasi; analog dipegang di zona diam, karena
  // pemain harus tetap dalam jangkauan 24 px.
  const [k1] = daftarKejadian;
  const t1 = k1.titik[0];
  await pindahkan(request, hp, { x: t1.x, y: t1.y + 1 });
  await expect(dunia(page)).toHaveAttribute("data-jangkauan", k1.kejadianId, { timeout: 5000 });
  await expect(page.locator(".js-tombol-periksa")).toHaveAttribute("data-dekat", "ya");
  j1 = await jari.pegangAnalog(awal, 0);
  await expect(joystick(page)).toBeVisible();
  await jari.ketukKedua(j1, await tengah(page, ".js-tombol-periksa"));
  await expect(page.locator(".js-dialog")).toBeVisible();
  await expect(page.locator(".js-dialog")).toHaveAttribute("data-tampilan", "situasi1");
  await expect(joystick(page)).toHaveCount(0);
  await page.waitForTimeout(800);
  await expect(page.locator(".js-dialog")).toHaveAttribute("data-tampilan", "situasi1");
  await jari.lepasSemua();
  await page.keyboard.press("Escape");
  await expect(page.locator(".js-dialog")).toHaveCount(0);

  // AC-5: Angkot berkarcis di halte membuka mode "Pilih halte tujuan" tanpa halte terpilih (analog di zona diam).
  const karcis = kampung.kotak.find((k) => k.id === "k-z3-4")!;
  await pindahkan(request, hp, { x: karcis.x - 1, y: karcis.y });
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(450);
  await page.keyboard.up("ArrowRight");
  await expect(tombolSkill(page, "angkot")).toHaveAttribute("data-muatan", "1", { timeout: 8000 });
  await pindahkan(request, hp, kampung.halte[0]);
  await expect(tombolSkill(page, "angkot")).toHaveAttribute("data-dekat", "ya");
  await page.waitForTimeout(2100); // jeda antarpemakaian sesudah Lari cepat
  j1 = await jari.pegangAnalog(awal, 0);
  await jari.ketukKedua(j1, await tengah(page, '.js-tombol-skill[data-skill="angkot"]'));
  await expect(petaBesar(page)).toHaveAttribute("data-mode", "halte");
  await expect(page.locator(".js-halte-pilihan[data-dipilih], .js-halte-peta[data-dipilih]")).toHaveCount(0);
  await expect(joystick(page)).toHaveCount(0);
  await page.waitForTimeout(400);
  await expect(petaBesar(page)).toHaveAttribute("data-mode", "halte");
  await jari.lepasSemua();
  await page.keyboard.press("Escape");
  await expect(petaBesar(page)).toHaveCount(0);
  expect(hp.konsol, "tanpa galat dan peringatan konsol").toEqual([]);
  await hp.ctx.close();
});

test("HP 731 × 411: satu jari pada setiap tombol HUD menjalankan aksi sekali tanpa klik (AC-7)", async ({ browser, baseURL, request }) => {
  test.setTimeout(180_000);
  const { hp, page, daftarKejadian } = await hpBermain(browser, baseURL!, request, 3);
  const t1 = daftarKejadian[0].titik[0];
  const suara = page.locator(".js-hud-suara");
  const sebelum = await klik(page);
  await page.locator(".js-peta-mini").tap();
  await expect(petaBesar(page)).toBeVisible();
  await page.waitForTimeout(300);
  await expect(petaBesar(page)).toBeVisible();
  expect(await klik(page)).toBe(sebelum);
  await page.keyboard.press("Escape");
  await page.locator(".js-hud-menu").tap();
  await expect(panel(page)).toBeVisible();
  const pilihan1 = await panel(page).locator('[role="radio"][aria-checked="true"]').allTextContents();
  await page.waitForTimeout(300);
  expect(await panel(page).locator('[role="radio"][aria-checked="true"]').allTextContents()).toEqual(pilihan1);
  expect(await klik(page)).toBe(sebelum);
  await page.keyboard.press("Escape");
  await expect(panel(page)).toHaveCount(0);
  const nyala = await suara.getAttribute("aria-pressed");
  await suara.tap();
  await expect(suara).not.toHaveAttribute("aria-pressed", nyala!);
  await page.waitForTimeout(300);
  await expect(suara).not.toHaveAttribute("aria-pressed", nyala!);
  await tombolSkill(page, "kompas").tap({ force: true }); // tanpa muatan: aria-disabled, tetapi tetap bisa diketuk
  await expect(pita(page)).toHaveText("Cari kotak kompas.");
  await pindahkan(request, hp, { x: t1.x, y: t1.y + 1 });
  await expect(page.locator(".js-tombol-periksa")).toHaveAttribute("data-dekat", "ya", { timeout: 5000 });
  await page.locator(".js-tombol-periksa").tap();
  await expect(page.locator(".js-dialog")).toHaveAttribute("data-tampilan", "situasi1");
  await page.waitForTimeout(500);
  await expect(page.locator(".js-dialog")).toHaveAttribute("data-tampilan", "situasi1");
  expect(await klik(page)).toBe(sebelum);
  await page.waitForTimeout(1000); // masa tenang dialog (JS-08) sebelum Esc
  await page.keyboard.press("Escape");
  await expect(page.locator(".js-dialog")).toHaveCount(0);
  await ikon(page).tap();
  await expect.poll(() => layarPenuh(page)).toBe("HTML");
  expect(await klik(page), "satu jari: tanpa klik").toBe(sebelum);
  await keluarLayarPenuh(page);
  expect(hp.konsol, "tanpa galat dan peringatan konsol").toEqual([]);
  await hp.ctx.close();
});

test("ikon HUD dan tombol Menu di tiga ukuran HP dan tiga ukuran laptop, jeda, dan penolakan peramban (AC-1 sampai AC-3, AC-14)", async ({ browser, baseURL, request }) => {
  test.setTimeout(240_000);
  const kode = await buatRuang(request, {});
  const hp = await gabung(browser, baseURL!, kode, "hp", 1);
  const hp3 = await gabung(browser, baseURL!, kode, "hp", 3, { ukuran: { width: 640, height: 360 }, rasio: 3 });
  const laptop = await gabung(browser, baseURL!, kode, "laptop", 2);
  for (const p of [hp, hp3, laptop]) await expect(ikon(p.page)).toHaveCount(0); // lobi
  await kelas(request, kode, { t: "mulai" });
  for (const p of [hp, hp3, laptop]) {
    await expect(p.page.locator(".js-dunia")).toHaveAttribute("data-status", "hitung_mundur", { timeout: 5000 });
    await expect(ikon(p.page)).toHaveCount(0); // hitung mundur
  }
  for (const p of [hp, hp3, laptop]) await expect(p.page.locator(".js-dunia")).toHaveAttribute("data-status", "main", { timeout: 10_000 });

  // AC-2: letak dan jarak di keenam ukuran. Pita terlebar diukur dengan contoh pita bergaya asli di HUD.
  const ukur = (page: Page) =>
    page.evaluate(() => {
      const hud = document.querySelector(".js-hud")!.getBoundingClientRect();
      const r = (el: Element | null) => {
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { l: b.left - hud.left, t: b.top - hud.top, r: b.right - hud.left, b: b.bottom - hud.top };
      };
      const contoh = document.createElement("p");
      contoh.className = "js-pita";
      contoh.textContent = "Petunjuk dipakai di Langkah 1.";
      document.querySelector(".js-hud")!.appendChild(contoh);
      const hasil = {
        hud: { w: hud.width, h: hud.height },
        ikon: r(document.querySelector(".js-hud-layar-penuh")),
        menu: r(document.querySelector(".js-hud-menu")),
        kelompok: r(document.querySelector(".js-hud-kiri")),
        bilah: r(document.querySelector(".js-bilah")),
        peta: r(document.querySelector(".js-peta-mini")),
        periksa: r(document.querySelector(".js-tombol-periksa")),
        skill: [...document.querySelectorAll(".js-tombol-skill")].map(r),
        pita: r(contoh),
        kbd: document.querySelectorAll(".js-hud-layar-penuh kbd").length,
      };
      contoh.remove();
      return hasil;
    });
  type P = { l: number; t: number; r: number; b: number };
  const jarak = (a: P, b: P) => Math.max(b.l - a.r, a.l - b.r, b.t - a.b, a.t - b.b);
  const hasilUkur: Record<string, unknown> = {};
  const periksaLetak = async (p: Pemain, nama: string, foto: boolean) => {
    await p.page.waitForTimeout(400);
    const u = await ukur(p.page);
    expect(u.ikon, nama).not.toBeNull();
    const k = u.ikon!;
    expect({ l: k.l, t: k.t, w: k.r - k.l, h: k.b - k.t }, nama).toEqual({ l: 8, t: 92, w: 48, h: 48 });
    expect(u.kbd).toBe(0);
    const lain: [string, P | null][] = [
      ["menu", u.menu],
      ["bilah", u.bilah],
      ["peta", u.peta],
      ["periksa", u.periksa],
      ["pita", u.pita],
      ...u.skill.map((s, i) => [`skill${i + 1}`, s] as [string, P | null]),
    ];
    const terdekat: Record<string, number> = {};
    for (const [n, b] of lain) {
      if (!b) continue;
      terdekat[n] = Math.round(jarak(k, b) * 10) / 10;
      expect(terdekat[n], `${nama}: jarak ikon ke ${n}`).toBeGreaterThanOrEqual(8);
    }
    // Kotak aman panah Kompas dihitung dari kotak kelompok (P-7 JS-14), yang kini mencakup baris kedua.
    expect(u.kelompok!.b).toBeGreaterThanOrEqual(k.b);
    expect(u.kelompok!.l).toBeLessThanOrEqual(k.l);
    hasilUkur[nama] = { hud: u.hud, terdekat };
    if (foto) await p.page.screenshot({ path: `${FOTO}/hud-ikon-${nama}.png` });
  };
  await periksaLetak(hp, "hp-731x411", true);
  await hp.page.setViewportSize({ width: 915, height: 356 });
  await periksaLetak(hp, "hp-915x356", true);
  await periksaLetak(hp3, "hp-640x360-r3", true);
  for (const [ukuran, nama] of [
    [{ width: 1280, height: 720 }, "laptop-1280x720"],
    [{ width: 1024, height: 768 }, "laptop-1024x768"],
    [{ width: 700, height: 400 }, "laptop-700x400"],
  ] as const) {
    await laptop.page.setViewportSize(ukuran);
    await periksaLetak(laptop, nama, nama === "laptop-1280x720");
  }
  catat("jarak ikon ke unsur HUD (px)", hasilUkur);

  // AC-3: tombol "Layar penuh" paling kiri di baris kaki Menu; kaki satu baris 48 px; isi tanpa gulir di 640 × 360.
  const kaki = (page: Page) =>
    page.evaluate(() =>
      [...document.querySelectorAll(".js-atur-kaki button")].map((b) => {
        const r = b.getBoundingClientRect();
        return { teks: b.textContent, t: Math.round(r.top), h: Math.round(r.height) };
      }),
    );
  for (const [p, nama] of [
    [hp, "hp-915x356"],
    [hp3, "hp-640x360-r3"],
  ] as const) {
    await p.page.locator(".js-hud-menu").tap();
    await expect(panel(p.page)).toBeVisible();
    const k = await kaki(p.page);
    expect(k.map((b) => b.teks)).toEqual(["Layar penuh", "Privasi", "Tentang", "Tutup"]);
    expect(new Set(k.map((b) => b.t)).size, `${nama}: kaki satu baris`).toBe(1);
    expect(k.every((b) => b.h === 48)).toBe(true);
    const gulir = await p.page.locator(".js-atur-isi").evaluate((el) => el.scrollHeight - el.clientHeight);
    catat(`panel Menu ${nama}`, { kaki: k, gulir });
    if (nama === "hp-640x360-r3") expect(gulir, "isi panel tanpa gulir di 640 × 360").toBeLessThanOrEqual(0);
    if (nama === "hp-915x356") await p.page.screenshot({ path: `${FOTO}/menu-layar-penuh-610x343.png` });
    await p.page.keyboard.press("Escape");
  }
  await hp.page.setViewportSize({ width: 731, height: 411 });
  await hp.page.waitForTimeout(300);
  await dunia(hp.page).focus(); // P-12: ketukan tidak memindahkan fokus; fokus kembali ke kanvas sesudah panel ditutup
  await hp.page.locator(".js-hud-menu").tap();
  await expect(panel(hp.page)).toBeVisible();
  await hp.page.screenshot({ path: `${FOTO}/menu-layar-penuh-731x411.png` });
  // AC-1 dan AC-3: penolakan peramban: panel tetap terbuka, tombol tetap tampil, tanpa galat konsol.
  await tolak(hp.page, true);
  await panel(hp.page).getByRole("button", { name: "Layar penuh" }).tap();
  await hp.page.waitForTimeout(400);
  await expect(panel(hp.page)).toBeVisible();
  await expect(panel(hp.page).getByRole("button", { name: "Layar penuh" })).toBeVisible();
  expect(await layar(hp.page)).toEqual(["request"]);
  await tolak(hp.page, false);
  // Diterima: layar penuh, orientasi dikunci, panel tertutup, dan fokus kembali ke unsur sebelum panel dibuka.
  await panel(hp.page).getByRole("button", { name: "Layar penuh" }).tap();
  await expect.poll(() => layarPenuh(hp.page)).toBe("HTML");
  await expect(panel(hp.page)).toHaveCount(0);
  expect(await layar(hp.page)).toEqual(["request", "lock:landscape"]);
  await expect(ikon(hp.page)).toHaveCount(0);
  await expect.poll(() => hp.page.evaluate(() => document.activeElement?.getAttribute("class") ?? "")).toContain("js-kanvas-dunia");
  await hp.page.locator(".js-hud-menu").tap();
  await expect(panel(hp.page).getByRole("button", { name: "Layar penuh" })).toHaveCount(0);
  await hp.page.keyboard.press("Escape");
  await keluarLayarPenuh(hp.page);
  await expect(ikon(hp.page)).toBeVisible();
  // Laptop: Esc dari dunia membuka Menu, tombol di kaki dipakai dengan papan ketik, lalu fokus kembali ke dunia.
  await laptop.page.setViewportSize({ width: 1280, height: 720 });
  await dunia(laptop.page).focus();
  await laptop.page.keyboard.press("Escape");
  await expect(panel(laptop.page)).toBeVisible();
  await panel(laptop.page).getByRole("button", { name: "Layar penuh" }).focus();
  await laptop.page.keyboard.press("Enter");
  await expect.poll(() => layarPenuh(laptop.page)).toBe("HTML");
  await expect(panel(laptop.page)).toHaveCount(0);
  await expect.poll(() => laptop.page.evaluate(() => document.activeElement?.getAttribute("class") ?? "")).toContain("js-kanvas-dunia");
  await keluarLayarPenuh(laptop.page);
  // Ikon ditolak: tanpa galat, ikon tetap tampil.
  await tolak(hp.page, true);
  await ikon(hp.page).tap();
  await hp.page.waitForTimeout(300);
  await expect(ikon(hp.page)).toBeVisible();
  await tolak(hp.page, false);
  await layar(hp.page);
  // Jeda: ikon tampil bersama Menu dan suara. Ketiganya berada di bawah lapisan jeda yang tembus pandang, seperti Menu
  // dan suara di v1.1 (Temuan 1 laporan JS-24): yang diperiksa di sini adalah ikon bertumpuk sama dengan tombol Menu.
  expect(await kelas(request, kode, { t: "jeda" })).toBe("jeda");
  await expect(hp.page.locator(".js-lapisan")).toBeVisible();
  await expect(ikon(hp.page)).toBeVisible();
  const tumpukan = await hp.page.evaluate(() =>
    [".js-hud-menu", ".js-hud-suara", ".js-hud-layar-penuh"].map((sel) => {
      const b = document.querySelector(sel)!.getBoundingClientRect();
      return document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)?.closest(sel) !== null;
    }),
  );
  catat("di atas lapisan jeda (Menu, suara, ikon)", tumpukan);
  expect(tumpukan[2], "ikon bertumpuk sama dengan tombol Menu").toBe(tumpukan[0]);
  await hp.page.screenshot({ path: `${FOTO}/jeda-ikon-731x411.png` });
  expect(await kelas(request, kode, { t: "lanjut" })).toBe("main");
  // P-3: ikon tidak tampil selama peta besar dan dialog Menu.
  await laptop.page.keyboard.press("KeyP");
  await expect(petaBesar(laptop.page)).toBeVisible();
  await expect(ikon(laptop.page)).toHaveCount(0);
  await laptop.page.keyboard.press("KeyP");
  await expect(ikon(laptop.page)).toBeVisible();
  for (const p of [hp, hp3, laptop]) expect(p.konsol, "tanpa galat dan peringatan konsol").toEqual([]);
  for (const p of [hp, hp3, laptop]) await p.ctx.close();
});

test("laptop 1280 × 720: tetikus dan papan ketik seperti v1.1 (AC-9)", async ({ browser, baseURL, request }) => {
  test.setTimeout(120_000);
  const kode = await buatRuang(request, {});
  const laptop = await gabung(browser, baseURL!, kode, "laptop", 4);
  const page = laptop.page;
  await mulai(request, kode, [laptop]);
  // Klik tetikus pada peta mini; Esc menutup; P membuka dan menutup.
  await page.locator(".js-peta-mini").click();
  await expect(petaBesar(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(petaBesar(page)).toHaveCount(0);
  await page.keyboard.press("KeyP");
  await expect(petaBesar(page)).toBeVisible();
  await page.keyboard.press("KeyP");
  await expect(petaBesar(page)).toHaveCount(0);
  // Esc dari dunia membuka Menu dan fokus kembali ke dunia sesudah ditutup; Enter pada tombol Menu yang terfokus.
  await dunia(page).focus();
  await page.keyboard.press("Escape");
  await expect(panel(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel(page)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute("class") ?? "")).toContain("js-kanvas-dunia");
  await page.locator(".js-hud-menu").focus();
  await page.keyboard.press("Enter");
  await expect(panel(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel(page)).toHaveCount(0);
  // Spasi pada tombol suara, klik ganda tetikus (sekali), dan M.
  const suara = page.locator(".js-hud-suara");
  await expect(suara).toHaveAttribute("aria-pressed", "false");
  await suara.focus();
  await page.keyboard.press("Space");
  await expect(suara).toHaveAttribute("aria-pressed", "true");
  await suara.dblclick();
  await expect(suara).toHaveAttribute("aria-pressed", "false");
  await page.waitForTimeout(300);
  await expect(suara).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("KeyM");
  await expect(suara).toHaveAttribute("aria-pressed", "true");
  await suara.click();
  await expect(suara).toHaveAttribute("aria-pressed", "false");
  // Tombol 1 sampai 5 dan klik tetikus pada tombol skill.
  await dunia(page).focus();
  await page.keyboard.press("Digit1");
  await expect(pita(page)).toHaveText("Cari kotak sepatu.");
  await expect(pita(page)).toHaveCount(0, { timeout: 8000 });
  await tombolSkill(page, "kompas").click({ force: true }); // tanpa muatan: aria-disabled, tetapi tetap bisa diklik
  await expect(pita(page)).toHaveText("Cari kotak kompas.");
  await expect(pita(page)).toHaveCount(0, { timeout: 8000 });
  await page.keyboard.press("Digit5");
  await expect(pita(page)).toHaveText("Cari kotak karcis.");
  // E di dekat kejadian membuka dialog; Esc menutupnya.
  const [k1] = await kejadianRuang(request, kode);
  await pindahkan(request, laptop, { x: k1.titik[0].x, y: k1.titik[0].y + 1 });
  await expect(dunia(page)).toHaveAttribute("data-jangkauan", k1.kejadianId, { timeout: 5000 });
  await dunia(page).focus(); // E pada tombol yang terfokus tidak memeriksa (JS-08); fokus pindah ke tombol Kompas saat diklik
  await page.keyboard.press("KeyE");
  await expect(page.locator(".js-dialog")).toHaveAttribute("data-tampilan", "langkah1"); // laptop: bukan mode ringkas
  await page.waitForTimeout(1000); // masa tenang dialog sebelum Esc
  await page.keyboard.press("Escape");
  await expect(page.locator(".js-dialog")).toHaveCount(0);
  // Ikon layar penuh dengan tetikus (P-1), tanpa tanda papan ketik.
  await expect(page.locator(".js-hud-layar-penuh kbd")).toHaveCount(0);
  await ikon(page).click();
  await expect.poll(() => layarPenuh(page)).toBe("HTML");
  expect(await layar(page)).toEqual(["request", "lock:landscape"]);
  await keluarLayarPenuh(page);
  await expect(ikon(page)).toBeVisible();
  expect(laptop.konsol, "tanpa galat dan peringatan konsol").toEqual([]);
  await laptop.ctx.close();
});
