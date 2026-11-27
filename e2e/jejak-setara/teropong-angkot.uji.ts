// Uji ujung ke ujung Teropong dan Angkot (spesifikasi JS-18, rencana uji "Uji ujung ke ujung"; AC-2, AC-4, AC-6, AC-7,
// AC-9 sampai AC-11, AC-15, dan AC-17). HP (emulasi sentuh 731 × 411, rasio 2,625) dan dua laptop 1280 × 720 bermain di
// ruang uji yang sama: pemain dipindah lewat kait uji `pindahkan`, lalu berjalan dengan papan ketik. Layar kelas dan
// dialog Ruang baru dibuka di konsol. Tangkapan layar disimpan di docs/jejak-setara/tests/JS-18/.
import { readFileSync } from "node:fs";
import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { dalamTeropong, terlihatDiLayar } from "../../app/jejak-setara/inti/aturan";
import { posisiSah } from "../../app/jejak-setara/inti/gerak";
import { uraiRle } from "../../app/jejak-setara/inti/peta";
import { buatRuang, EMAIL, idDariKode, kejadianRuang, kelas, pindahkanPemain, SANDI, tutupRuangBerkas } from "./ruang-uji";

test.describe.configure({ mode: "serial" });
test.afterAll(tutupRuangBerkas);

const FOTO = "docs/jejak-setara/tests/JS-18";
const LIMA = ["lari", "kompas", "petunjuk", "teropong", "angkot"] as const;

type Ubin = { x: number; y: number };
type Kotak = { id: string; jenis: string; x: number; y: number };
type Halte = { id: string; zona: string; x: number; y: number };
const kampung = JSON.parse(readFileSync(new URL("../../app/jejak-setara/peta/kampung.json", import.meta.url), "utf8")) as {
  lebar: number;
  tinggi: number;
  tabrakan: string;
  kotak: Kotak[];
  halte: Halte[];
  zona: { id: string; nama: string }[];
};
const GRID = { lebar: kampung.lebar, tinggi: kampung.tinggi, tabrakan: uraiRle(kampung.tabrakan, kampung.lebar * kampung.tinggi) };
const PETA = { lebar: kampung.lebar * 16, tinggi: kampung.tinggi * 16 };
const kaki = (u: Ubin) => ({ x: u.x * 16 + 8, y: u.y * 16 + 12 });
const HALTE = kampung.halte;
const titikHalte = (n: number) => kaki(HALTE[n - 1]);
const namaZona = (id: string) => kampung.zona.find((z) => z.id === id)?.nama ?? "";
const kotakId = (id: string) => kampung.kotak.find((k) => k.id === id)!;
function bebas(y: number, x0: number, x1: number): boolean {
  for (let x = Math.floor(x0); x <= x1; x++) if (!posisiSah(GRID, x, y)) return false;
  return true;
}
const ubinSah = (u: Ubin) => posisiSah(GRID, kaki(u).x, kaki(u).y);
/** Ubin bebas terdekat (jarak Chebyshev 1 sampai 4) dari ubin u, selain yang dikecualikan. */
function ubinDekat(u: Ubin, kecuali: Ubin[] = []): Ubin {
  for (let r = 2; r <= 4; r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const v = { x: u.x + dx, y: u.y + dy };
        if (ubinSah(v) && !kecuali.some((k) => k.x === v.x && k.y === v.y)) return v;
      }
  throw new Error(`tidak ada ubin bebas di dekat ${u.x},${u.y}`);
}

interface Pemain {
  ctx: BrowserContext;
  page: Page;
  nama: string;
  kode: string;
}

async function gabung(
  browser: Browser,
  baseURL: string,
  kode: string,
  jenis: "hp" | "laptop",
  avatar: number,
  opsi: { umum?: boolean; soket?: boolean; ukuran?: { width: number; height: number }; rasio?: number } = {},
): Promise<Pemain> {
  const hp = jenis === "hp";
  const ctx = await browser.newContext({
    baseURL,
    viewport: opsi.ukuran ?? (hp ? { width: 731, height: 411 } : { width: 1280, height: 720 }),
    ...(hp ? { isMobile: true, hasTouch: true, deviceScaleFactor: opsi.rasio ?? 2.625 } : {}),
  });
  const page = await ctx.newPage();
  if (opsi.umum) {
    // Catatan pengumuman pembaca layar: setiap teks baru di wilayah aria-live.
    await page.addInitScript(() => {
      const catat: string[] = [];
      (window as unknown as { __umum: string[] }).__umum = catat;
      new MutationObserver(() => {
        const teks = document.querySelector('.js-sr[aria-live="polite"]')?.textContent ?? "";
        if (teks && catat[catat.length - 1] !== teks) catat.push(teks);
      }).observe(document, { subtree: true, childList: true, characterData: true });
    });
  }
  if (opsi.soket) {
    // Catatan soket yang dibuat halaman, agar uji bisa memutus sambungan (menyambung ulang, AC-7).
    await page.addInitScript(() => {
      const Asli = window.WebSocket;
      const daftar: WebSocket[] = [];
      (window as unknown as { __soket: WebSocket[] }).__soket = daftar;
      window.WebSocket = class extends Asli {
        constructor(...isi: ConstructorParameters<typeof WebSocket>) {
          super(...isi);
          daftar.push(this);
        }
      } as typeof WebSocket;
    });
  }
  await page.goto(`/?kode=${kode}`);
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible({ timeout: 20_000 });
  const pilihan = page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first();
  const nama = (await pilihan.textContent())?.replace("▶", "").trim() ?? "";
  await pilihan.click();
  await page.getByRole("radio", { name: `Avatar ${avatar}` }).click();
  await page.getByRole("button", { name: "Gabung" }).click();
  await expect(dunia(page)).toHaveAttribute("data-diri", /^\d+,\d+$/);
  return { ctx, page, nama, kode };
}

const dunia = (page: Page) => page.locator("canvas.js-kanvas-dunia");
const tombol = (page: Page, s: string) => page.locator(`.js-tombol-skill[data-skill="${s}"]`);
const pita = (page: Page) => page.locator(".js-pita");
const petaBesar = (page: Page) => page.locator(".js-peta-besar");
const umum = (page: Page) => page.evaluate(() => (window as unknown as { __umum?: string[] }).__umum ?? []);
const lapisanSambung = (page: Page) => page.getByRole("dialog", { name: "Menyambung ulang…" });
/** Menutup soket terakhir dari sisi halaman dengan kode 3000, sehingga layar pemain menyambung ulang. */
const putuskan = (page: Page) =>
  page.evaluate(() => {
    const d = (window as unknown as { __soket: WebSocket[] }).__soket;
    d[d.length - 1].close(3000, "uji menyambung ulang");
  });

async function pindahkan(request: APIRequestContext, p: Pemain, u: Ubin): Promise<void> {
  expect((await pindahkanPemain(request, p.kode, p.nama, u.x, u.y)).status()).toBe(200);
  const f = kaki(u);
  await expect(dunia(p.page)).toHaveAttribute("data-diri", `${f.x},${f.y}`);
}
async function tahan(page: Page, kunci: string, ms: number): Promise<void> {
  await page.keyboard.down(kunci);
  await page.waitForTimeout(ms);
  await page.keyboard.up(kunci);
}
/** Pindah ke ubin kiri kotak itu, lalu berjalan sekitar 32 piksel ke kanan melewati pusatnya. */
async function lewatiKotak(request: APIRequestContext, p: Pemain, kt: Kotak): Promise<void> {
  expect(bebas(kt.y * 16 + 12, kt.x * 16 - 8, kt.x * 16 + 56), `baris datar kotak ${kt.id}`).toBe(true);
  await pindahkan(request, p, { x: kt.x - 1, y: kt.y });
  await tahan(p.page, "ArrowRight", 450);
}
async function mulai(request: APIRequestContext, kode: string, pemain: Pemain[]): Promise<void> {
  await kelas(request, kode, { t: "mulai" });
  for (const p of pemain) await expect(p.page.locator(".js-dunia")).toHaveAttribute("data-status", "main", { timeout: 10_000 });
}

// ---------------------------------------------------------------------------------------------------------------------
// Tata letak HUD (AC-11): tombol bulat dihitung sebagai lingkaran, lencana dan unsur lain sebagai persegi (pola JS-09).

type Persegi = { l: number; t: number; r: number; b: number };
type Lingkaran = { x: number; y: number; jari: number };
type Bentuk = Persegi | Lingkaran;
interface TataHud {
  hud: Persegi;
  letak: string;
  butir: { skill: string; tombol: Persegi; lencana: Persegi | null; kbd: Persegi | null }[];
  lain: Record<"peta" | "bilah" | "periksa" | "ajakan", Persegi | null>;
  pita: (Persegi & { baris: number }) | null;
}
async function tataHud(page: Page): Promise<TataHud> {
  return page.evaluate(() => {
    const k = (el: Element | null) => {
      if (!el || el.getClientRects().length === 0) return null;
      const r = el.getBoundingClientRect();
      return { l: r.left, t: r.top, r: r.right, b: r.bottom };
    };
    const p = document.querySelector<HTMLElement>(".js-pita");
    let baris = 0;
    if (p) {
      const g = getComputedStyle(p);
      baris = Math.round((p.clientHeight - parseFloat(g.paddingTop) - parseFloat(g.paddingBottom)) / parseFloat(g.lineHeight));
    }
    const kp = k(p);
    return {
      hud: k(document.querySelector(".js-hud"))!,
      letak: document.querySelector(".js-skill")?.getAttribute("data-letak") ?? "",
      butir: [...document.querySelectorAll(".js-skill-butir")].map((el) => ({
        skill: el.getAttribute("data-skill") ?? "",
        tombol: k(el.querySelector(".js-tombol-skill"))!,
        lencana: k(el.querySelector(".js-skill-lencana")),
        kbd: k(el.querySelector(".js-skill-kbd")),
      })),
      lain: {
        peta: k(document.querySelector(".js-peta-mini")),
        bilah: k(document.querySelector(".js-bilah")),
        periksa: k(document.querySelector(".js-tombol-periksa")),
        ajakan: k(document.querySelector(".js-ajakan-e")),
      },
      pita: kp ? { ...kp, baris } : null,
    };
  });
}
const lingkaran = (p: Persegi): Lingkaran => ({ x: (p.l + p.r) / 2, y: (p.t + p.b) / 2, jari: (p.r - p.l) / 2 });
const adalahLingkaran = (b: Bentuk): b is Lingkaran => "jari" in b;
function jarakBentuk(a: Bentuk, b: Bentuk): number {
  if (adalahLingkaran(a) && adalahLingkaran(b)) return Math.hypot(a.x - b.x, a.y - b.y) - a.jari - b.jari;
  if (adalahLingkaran(a) || adalahLingkaran(b)) {
    const c = (adalahLingkaran(a) ? a : b) as Lingkaran;
    const r = (adalahLingkaran(a) ? b : a) as Persegi;
    const dx = Math.max(r.l - c.x, 0, c.x - r.r);
    const dy = Math.max(r.t - c.y, 0, c.y - r.b);
    return Math.hypot(dx, dy) - c.jari;
  }
  const pa = a as Persegi;
  const pb = b as Persegi;
  const gx = Math.max(pa.l - pb.r, pb.l - pa.r);
  const gy = Math.max(pa.t - pb.b, pb.t - pa.b);
  return gx < 0 && gy < 0 ? Math.max(gx, gy) : Math.hypot(Math.max(0, gx), Math.max(0, gy));
}
const bentukButir = (b: TataHud["butir"][number]): Bentuk[] => [lingkaran(b.tombol), ...(b.lencana ? [b.lencana] : []), ...(b.kbd ? [b.kbd] : [])];
const jarakMin = (as: Bentuk[], bs: Bentuk[]) => Math.min(...as.flatMap((a) => bs.map((b) => jarakBentuk(a, b))));

/**
 * AC-11: lima tombol 48 px di dalam HUD, tidak bertumpuk dan berjarak ≥ 8 px dari tombol lain, lencana, peta mini, bilah
 * atas, dan Periksa; kotak aman panah Kompas (12, 40, 160 atau 220, dan 80 px) tidak bertumpuk dengan tombol, lencana,
 * dan tanda tombol. Mengembalikan ukuran untuk laporan.
 */
function periksaHud(h: TataHud, nama: string, sentuh: boolean): Record<string, number | string> {
  const ukur: Record<string, number | string> = { hud: `${Math.round(h.hud.r - h.hud.l)}×${Math.round(h.hud.b - h.hud.t)}`, letak: h.letak };
  expect(h.butir.map((b) => b.skill), `${nama}: lima tombol`).toEqual([...LIMA]);
  const aman: Persegi = { l: h.hud.l + 12, t: h.hud.t + 40, r: h.hud.r - (h.letak === "kolom2" ? 220 : 160), b: h.hud.b - 80 };
  for (const b of h.butir) {
    expect(b.tombol.r - b.tombol.l, `${nama} ${b.skill}: lebar`).toBeGreaterThanOrEqual(48);
    for (const x of [b.tombol, b.lencana, b.kbd]) {
      if (!x) continue;
      expect(x.l >= h.hud.l - 0.5 && x.r <= h.hud.r + 0.5 && x.t >= h.hud.t - 0.5 && x.b <= h.hud.b + 0.5, `${nama} ${b.skill}: di dalam HUD`).toBe(true);
      const tumpang = x.l < aman.r && x.r > aman.l && x.t < aman.b && x.b > aman.t;
      expect(tumpang, `${nama} ${b.skill}: kotak aman ${JSON.stringify(aman)} dan ${JSON.stringify(x)}`).toBe(false);
    }
    for (const [n, x] of Object.entries(h.lain)) {
      if (!x) continue;
      const d = jarakMin(bentukButir(b), [n === "periksa" ? lingkaran(x) : x]);
      ukur[`${b.skill}-${n}`] = Math.round(d * 10) / 10;
      expect(d, `${nama} ${b.skill} ↔ ${n}`).toBeGreaterThanOrEqual(8 - 0.5);
    }
  }
  for (let i = 0; i < h.butir.length; i++)
    for (let j = i + 1; j < h.butir.length; j++) {
      const d = jarakMin(bentukButir(h.butir[i]), bentukButir(h.butir[j]));
      ukur[`${h.butir[i].skill}-${h.butir[j].skill}`] = Math.round(d * 10) / 10;
      expect(d, `${nama} ${h.butir[i].skill} ↔ ${h.butir[j].skill}`).toBeGreaterThanOrEqual(sentuh ? 10 - 0.5 : 8 - 0.5);
    }
  // Letak tetap per skill (P-27, P-28): kanan dan bawah relatif terhadap HUD.
  const kb = (s: string) => {
    const t = h.butir.find((b) => b.skill === s)!.tombol;
    return [Math.round(h.hud.r - t.r), Math.round(h.hud.b - t.b)];
  };
  const harap: Record<string, Record<string, [number, number]>> = {
    lengkung: { lari: [24, 100], kompas: [78, 78], petunjuk: [100, 24], teropong: [158, 24], angkot: [216, 24] },
    kolom: { lari: [16, 248], kompas: [16, 190], petunjuk: [16, 132], teropong: [16, 74], angkot: [16, 16] },
    kolom2: { lari: [16, 132], kompas: [16, 74], petunjuk: [16, 16], teropong: [120, 74], angkot: [120, 16] },
  };
  for (const s of LIMA) expect(kb(s), `${nama} ${s}: letak (kanan, bawah)`).toEqual(harap[h.letak][s]);
  if (!sentuh) {
    expect(h.butir.map((b) => b.kbd !== null), `${nama}: tanda tombol`).toEqual([true, true, true, true, true]);
    const atas = Math.min(...h.butir.map((b) => b.tombol.t));
    ukur.diBawahPetaMini = Math.round(atas - (h.lain.peta?.b ?? 0));
  }
  return ukur;
}
function periksaPita(h: TataHud, nama: string, baris: number): number {
  expect(h.pita, `${nama}: pita tampil`).not.toBeNull();
  const p = h.pita!;
  expect(p.r - p.l, `${nama}: lebar pita`).toBeLessThanOrEqual(h.hud.r - h.hud.l - 256 + 0.5);
  if (h.lain.peta) expect(h.lain.peta.l - p.r, `${nama}: jarak pita ke peta mini`).toBeGreaterThanOrEqual(4 - 0.5);
  expect(p.baris, `${nama}: baris pita`).toBe(baris);
  return Math.round(p.r - p.l);
}

// ---------------------------------------------------------------------------------------------------------------------
// Mode "Pilih halte tujuan" (AC-7): isi, ukuran, dan letak.

async function ukurModeHalte(page: Page, nama: string, dari: number): Promise<Record<string, number | string>> {
  const m = petaBesar(page);
  await expect(m).toBeVisible();
  await expect(m.getByRole("heading", { name: "Pilih halte tujuan" })).toBeVisible();
  await expect(m.locator(".js-ringkasan-kejadian")).toHaveText(`Kamu di Halte ${dari}.`);
  await expect(m.getByRole("button", { name: "Batal" })).toBeVisible();
  const tujuan = HALTE.map((h, i) => ({ ...h, n: i + 1 })).filter((h) => h.n !== dari);
  await expect(m.locator(".js-halte-peta")).toHaveCount(3);
  await expect(m.locator(`.js-halte-peta[data-halte="halte-${dari}"]`)).toHaveCount(0);
  for (const b of await m.locator(".js-halte-peta").all()) {
    await expect(b).toHaveAttribute("tabindex", "-1");
    await expect(b).toHaveAttribute("aria-hidden", "true");
  }
  const daftar = m.locator(".js-halte-pilihan");
  await expect(daftar).toHaveCount(3);
  for (const [i, h] of tujuan.entries()) await expect(daftar.nth(i)).toHaveAccessibleName(`Halte ${h.n}, ${namaZona(h.zona)}`);
  // Fokus awal di tombol pertama daftar (P-21 butir 4).
  await expect(daftar.first()).toBeFocused();
  const u = await page.evaluate(() => {
    const r = (e: Element) => e.getBoundingClientRect();
    const isi = r(document.querySelector(".js-peta-besar-isi")!);
    const lapis = r(document.querySelector(".js-peta-besar")!);
    const ul = document.querySelector<HTMLElement>(".js-halte-daftar")!;
    const baris = [...document.querySelectorAll<HTMLElement>(".js-halte-pilihan")];
    const tombolPeta = [...document.querySelectorAll(".js-halte-peta")].map((e) => r(e));
    let jarakTombol = Infinity;
    for (let i = 0; i < tombolPeta.length; i++)
      for (let j = i + 1; j < tombolPeta.length; j++) {
        const a = tombolPeta[i];
        const b = tombolPeta[j];
        jarakTombol = Math.min(jarakTombol, Math.hypot(a.x - b.x, a.y - b.y) - 48);
      }
    const z = (sel: string) => getComputedStyle(document.querySelector(sel)!).zIndex;
    return {
      skala: isi.width / 160,
      lebarDaftar: ul.clientWidth - 12,
      tinggiDaftar: Math.round(ul.scrollHeight - 12),
      daftarAtas: Math.round(r(ul).top + 6 - isi.top),
      daftarKeBawahPeta: Math.round(isi.bottom - (r(ul).top + 6 + ul.scrollHeight - 12)),
      daftarDiLapis: r(ul).left >= lapis.left - 0.5 && r(ul).right <= lapis.right + 0.5 && r(ul).bottom <= lapis.bottom + 0.5 ? 1 : 0,
      luapanDaftar: ul.scrollWidth - ul.clientWidth,
      luapanBaris: Math.max(...baris.map((b) => b.scrollWidth - b.clientWidth)),
      barisMin: Math.round(Math.min(...baris.map((b) => r(b).height))),
      barisMaks: Math.round(Math.max(...baris.map((b) => r(b).height))),
      tombolPeta: tombolPeta.map((t) => `${Math.round(t.width)}×${Math.round(t.height)}`).join(" "),
      tombolDiLapis: tombolPeta.every((t) => t.left >= lapis.left && t.right <= lapis.right && t.top >= lapis.top && t.bottom <= lapis.bottom) ? 1 : 0,
      jarakTombolMin: Math.round(jarakTombol),
      zTombolPeta: z(".js-halte-peta"),
      zKamu: z(".js-kamu"),
    };
  });
  expect(u.luapanDaftar, `${nama}: tanpa luapan mendatar daftar`).toBe(0);
  expect(u.luapanBaris, `${nama}: tanpa luapan mendatar baris`).toBe(0);
  expect(u.barisMin, `${nama}: tinggi baris`).toBeGreaterThanOrEqual(48);
  expect(u.daftarAtas, `${nama}: daftar mulai di tepi atas peta`).toBe(0);
  expect(u.daftarDiLapis, `${nama}: daftar di dalam lapisan peta besar`).toBe(1);
  expect(u.tombolDiLapis, `${nama}: tombol halte di dalam lapisan peta besar`).toBe(1);
  expect(u.tombolPeta, `${nama}: tombol halte 48 × 48`).toBe("48×48 48×48 48×48");
  expect(Number(u.zTombolPeta)).toBeGreaterThan(Number(u.zKamu));
  return u;
}

/** Tempat berdiri dalam radius Teropong sebuah titik kejadian, tetapi titik itu di luar pandangan (P-15). */
function tempatTeropong(daftar: { kejadianId: string; titik: Ubin[] }[], kecuali: Ubin[]): { kejadianId: string; ubin: Ubin } {
  for (const kj of daftar)
    for (const t of kj.titik) {
      const pusat = { x: t.x * 16 + 8, y: t.y * 16 + 8 };
      for (const [dx, dy] of [[11, 0], [-11, 0], [11, 1], [-11, 1], [0, 11], [0, -11]]) {
        const u = { x: t.x + dx, y: t.y + dy };
        if (u.x < 2 || u.y < 2 || u.x > kampung.lebar - 3 || u.y > kampung.tinggi - 3 || !ubinSah(u) || kecuali.some((k) => Math.hypot(k.x - u.x, k.y - u.y) < 12)) continue;
        const f = kaki(u);
        if (dalamTeropong(f, t) && !terlihatDiLayar(f, pusat, PETA.lebar, PETA.tinggi)) return { kejadianId: kj.kejadianId, ubin: u };
      }
    }
  throw new Error("tidak ada tempat Teropong");
}

/** Sidik wilayah 18 × 30 piksel logis di sekitar titik kaki (x, y) di kanvas dunia (untuk pengamat). */
const sidikWilayah = (page: Page, x: number, y: number) =>
  dunia(page).evaluate(
    (kv, [x, y]) => {
      const c = kv as HTMLCanvasElement;
      const [kx, ky] = (c.dataset.kamera ?? "0,0").split(",").map(Number);
      const k = c.width / 320;
      const d = c.getContext("2d")!.getImageData(Math.round((x - 9 - kx) * k), Math.round((y - 26 - ky) * k), Math.round(18 * k), Math.round(30 * k)).data;
      let h = 2166136261;
      for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619) >>> 0;
      return h;
    },
    [x, y],
  );

/** Riwayat histogram waktu kode gambar (batas kelompok JS-08 P-68). */
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
  return { bingkai: total, p95Paling: p95, maksPaling: terakhir >= 0 ? BATAS_KELOMPOK[terakhir] : 0 };
}

async function konsolMasuk(browser: Browser, baseURL: string, ukuran = { width: 1280, height: 720 }): Promise<{ ctx: BrowserContext; g: Page }> {
  const ctx = await browser.newContext({ baseURL, viewport: ukuran, timezoneId: "Asia/Makassar" });
  const g = await ctx.newPage();
  await g.goto("/admin/");
  await g.getByLabel("Email", { exact: true }).fill(EMAIL);
  await g.getByLabel("Sandi", { exact: true }).fill(SANDI);
  await g.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(g.getByRole("heading", { name: "Dasbor" })).toBeVisible();
  return { ctx, g };
}

const catat = (nama: string, isi: unknown) => test.info().annotations.push({ type: nama, description: JSON.stringify(isi) });

// =====================================================================================================================

test("HUD lima tombol di enam ukuran, kotak aman, dan pita satu baris di HUD 610 (AC-11, AC-17)", async ({ browser, baseURL, request }) => {
  test.setTimeout(240_000);
  const kode = await buatRuang(request, {});
  const hp = await gabung(browser, baseURL!, kode, "hp", 1);
  const laptop = await gabung(browser, baseURL!, kode, "laptop", 2);
  const hp3 = await gabung(browser, baseURL!, kode, "hp", 3, { ukuran: { width: 640, height: 360 }, rasio: 3 });
  await mulai(request, kode, [hp, laptop, hp3]);
  for (const p of [hp, laptop, hp3]) await expect(p.page.locator(".js-skill-butir")).toHaveCount(5);
  // Perangkat sentuh: lengkung dengan baris bawah Teropong dan Angkot (P-27).
  for (const [p, ukuran, nama] of [
    [hp, { width: 731, height: 411 }, "hp-731x411"],
    [hp, { width: 915, height: 356 }, "hp-915x356"],
    [hp3, { width: 640, height: 360 }, "hp-640x360-r3"],
  ] as const) {
    await p.page.setViewportSize(ukuran);
    await p.page.waitForTimeout(400);
    catat(`HUD ${nama}`, periksaHud(await tataHud(p.page), nama, true));
    await expect(p.page.locator(".js-skill-kbd")).toHaveCount(0);
    await p.page.screenshot({ path: `${FOTO}/hud-${nama}.png` });
  }
  // Laptop: satu kolom 1 sampai 5, atau dua kolom di dunia 640 × 360 (P-28).
  for (const [ukuran, nama, letak] of [
    [{ width: 1280, height: 720 }, "1280x720", "kolom"],
    [{ width: 1024, height: 768 }, "1024x768", "kolom"],
    [{ width: 700, height: 400 }, "700x400", "kolom2"],
  ] as const) {
    await laptop.page.setViewportSize(ukuran);
    await laptop.page.waitForTimeout(400);
    const h = await tataHud(laptop.page);
    expect(h.letak, nama).toBe(letak);
    catat(`HUD laptop ${nama}`, periksaHud(h, `laptop ${nama}`, false));
    await expect(laptop.page.locator(".js-skill-kbd")).toHaveText(["1", "2", "3", "4", "5"]);
    for (const [i, s] of LIMA.entries()) await expect(tombol(laptop.page, s)).toHaveAttribute("aria-keyshortcuts", String(i + 1));
    await laptop.page.screenshot({ path: `${FOTO}/hud-${nama}.png` });
  }
  // Pita baru satu baris di HUD 610 px (P-31): "Cari kotak teropong." dan yang terlebar, "Naik angkot dari halte.".
  await hp.page.setViewportSize({ width: 915, height: 356 });
  // Tombol ber-aria-disabled tetap menerima ketukan (layar pemain yang memutuskan), jadi ketukannya dipaksa (pola JS-09).
  await tombol(hp.page, "teropong").tap({ force: true });
  await expect(pita(hp.page)).toHaveText("Cari kotak teropong.");
  const lebar1 = periksaPita(await tataHud(hp.page), "HUD 610 Cari kotak teropong.", 1);
  await tombol(hp.page, "angkot").tap({ force: true });
  await expect(pita(hp.page)).toHaveText("Cari kotak karcis.", { timeout: 5000 });
  const karcis = kotakId("k-z3-4");
  await lewatiKotak(request, hp, karcis);
  await expect(pita(hp.page)).toHaveText("+1 Angkot", { timeout: 8000 });
  await expect(tombol(hp.page, "angkot")).toHaveAttribute("data-dekat", "tidak");
  await hp.page.waitForTimeout(3100);
  await tombol(hp.page, "angkot").tap();
  await expect(pita(hp.page)).toHaveText("Naik angkot dari halte.");
  const lebar2 = periksaPita(await tataHud(hp.page), "HUD 610 Naik angkot dari halte.", 1);
  catat("lebar pita HUD 610", { "Cari kotak teropong.": lebar1, "Naik angkot dari halte.": lebar2 });
  // HP 640 × 360 rasio 3: mode pilih halte dengan daftar 144 px (DRAF D-1).
  await lewatiKotak(request, hp3, karcis);
  await expect(tombol(hp3.page, "angkot")).toHaveAttribute("data-muatan", "1", { timeout: 8000 });
  await pindahkan(request, hp3, HALTE[0]);
  await expect(tombol(hp3.page, "angkot")).toHaveAttribute("data-dekat", "ya");
  await tombol(hp3.page, "angkot").tap();
  catat("mode pilih halte HP 640x360 r3", await ukurModeHalte(hp3.page, "HP 640x360 r3", 1));
  for (const p of [hp, laptop, hp3]) await p.ctx.close();
});

test("Teropong dan Angkot: kotak, lingkaran, pengungkapan, mode pilih halte, tiba, pengamat, layar kelas, dan papan ketik (AC-4, AC-6, AC-7, AC-9, AC-10, AC-15, AC-17)", async ({
  browser,
  baseURL,
  request,
}) => {
  test.setTimeout(600_000);
  const kode = await buatRuang(request, {});
  const a = await gabung(browser, baseURL!, kode, "hp", 1, { umum: true, soket: true });
  const b = await gabung(browser, baseURL!, kode, "laptop", 2);
  const c = await gabung(browser, baseURL!, kode, "laptop", 5);
  await mulai(request, kode, [a, b, c]);

  // ---------------------------------------------------------------- Teropong (P-11, P-13, P-14 sampai P-17, P-32, P-33)
  // k-z6-4 berbaris datar hanya sampai 2,5 ubin di kanannya, jadi dipakai kedua kotak teropong lainnya.
  const teropong = [kotakId("k-z6-5"), kotakId("k-z6-6")];
  await lewatiKotak(request, a, teropong[0]);
  await expect(pita(a.page)).toHaveText("+1 Teropong", { timeout: 8000 });
  await expect(tombol(a.page, "teropong")).toHaveAttribute("data-muatan", "1");
  await expect(tombol(a.page, "teropong")).toHaveAttribute("aria-label", "Teropong, 1 muatan");
  // Kotak teropong lain dengan muatan penuh: pita "Teropong sudah penuh." sekali.
  await a.page.waitForTimeout(3100);
  await lewatiKotak(request, a, teropong[1]);
  await expect(pita(a.page)).toHaveText("Teropong sudah penuh.", { timeout: 8000 });
  expect(await tombol(a.page, "teropong").getAttribute("data-muatan")).toBe("1");
  // Tempat dalam radius 12 ubin sebuah titik yang belum terlihat, di luar pandangan.
  const halteUbin = HALTE.map((h) => ({ x: h.x, y: h.y }));
  const tempat = tempatTeropong(await kejadianRuang(request, kode), halteUbin);
  await pindahkan(request, a, tempat.ubin);
  await a.page.waitForTimeout(800);
  const sebelum = Number(await dunia(a.page).getAttribute("data-kejadian"));
  await expect(a.page.locator(".js-peta-mini")).toHaveAttribute("data-teropong", "tidak");
  await tombol(a.page, "teropong").tap();
  await expect(a.page.locator(".js-peta-mini")).toHaveAttribute("data-teropong", "ya", { timeout: 4000 });
  await expect.poll(async () => Number(await dunia(a.page).getAttribute("data-kejadian")), { timeout: 4000 }).toBeGreaterThan(sebelum);
  const terungkap = Number(await dunia(a.page).getAttribute("data-kejadian"));
  await expect(tombol(a.page, "teropong")).toHaveAttribute("data-aktif", "ya");
  await expect.poll(() => umum(a.page)).toContain("Teropong aktif selama 30 detik.");
  await a.page.screenshot({ path: `${FOTO}/teropong-mini-731x411.png` });
  // Muat ulang halaman selama Teropong aktif: sesudah masuk lagi dengan token, `pribadi` memulihkan lingkaran (AC-6).
  await a.page.reload();
  await expect(dunia(a.page)).toHaveAttribute("data-diri", `${kaki(tempat.ubin).x},${kaki(tempat.ubin).y}`, { timeout: 20_000 });
  await expect(a.page.locator(".js-peta-mini")).toHaveAttribute("data-teropong", "ya", { timeout: 5000 });
  await expect(tombol(a.page, "teropong")).toHaveAttribute("data-aktif", "ya");
  await expect(dunia(a.page)).toHaveAttribute("data-kejadian", String(terungkap));
  // Peta besar: lingkaran 12s px di titik kaki, di atas label zona dan di bawah halte dan penanda (P-33, P-34).
  await a.page.locator(".js-peta-mini").tap();
  await expect(petaBesar(a.page)).toBeVisible();
  await expect(a.page.locator(".js-peta-besar-isi")).toHaveAttribute("data-teropong", "ya");
  const lingk = await a.page.evaluate(() => {
    const isi = document.querySelector(".js-peta-besar-isi")!.getBoundingClientRect();
    const s = isi.width / 160;
    const el = document.querySelector<HTMLElement>(".js-peta-teropong")!;
    const r = el.getBoundingClientRect();
    const kamu = document.querySelector(".js-kamu")!.getBoundingClientRect();
    const g = getComputedStyle(el);
    const urutan = [...document.querySelector(".js-peta-besar-isi")!.children].map((e) => e.className.split(" ")[0]);
    return {
      s,
      diameter: r.width,
      pusatX: r.left + r.width / 2 - kamu.left,
      pusatY: r.top + r.height / 2 - kamu.top,
      garis: g.borderTopWidth,
      warna: g.borderTopColor,
      z: g.zIndex,
      zLabel: getComputedStyle(document.querySelector(".js-label-zona")!).zIndex,
      zHalte: getComputedStyle(document.querySelector(".js-peta-halte")!).zIndex,
      sesudahLabel: urutan.lastIndexOf("js-label-zona") < urutan.indexOf("js-peta-teropong"),
    };
  });
  expect(lingk.diameter).toBeCloseTo(24 * lingk.s + 2, 0);
  expect(Math.abs(lingk.pusatX)).toBeLessThanOrEqual(1);
  expect(Math.abs(lingk.pusatY)).toBeLessThanOrEqual(1);
  expect([lingk.garis, lingk.warna]).toEqual(["2px", "rgb(255, 210, 63)"]);
  expect(lingk.z === lingk.zLabel && lingk.sesudahLabel && Number(lingk.zHalte) > Number(lingk.z)).toBe(true);
  await expect(a.page.locator(".js-peta-kejadian")).toHaveCount(terungkap);
  catat("Teropong", { titikSebelum: sebelum, titikSesudah: terungkap, lingkaran: lingk });
  await a.page.screenshot({ path: `${FOTO}/teropong-besar-731x411.png` });
  await a.page.getByRole("button", { name: "Tutup peta" }).tap();
  await expect(petaBesar(a.page)).toHaveCount(0);
  const mulaiTeropong = Date.now();

  // ---------------------------------------------------------------- Karcis dan tombol Angkot (P-11, P-18, P-19)
  const karcis1 = kotakId("k-z3-4");
  await lewatiKotak(request, a, karcis1);
  await expect(pita(a.page)).toHaveText("+1 Angkot", { timeout: 8000 });
  await expect(tombol(a.page, "angkot")).toHaveAttribute("data-dekat", "tidak");
  await a.page.waitForTimeout(3100);
  await tombol(a.page, "angkot").tap();
  await expect(pita(a.page)).toHaveText("Naik angkot dari halte.");
  await expect(petaBesar(a.page)).toHaveCount(0);

  // Pengamat: B dua ubin dari halte 1 (sidik wilayah halte kosong lebih dulu), C juga di dekat halte 1.
  const h1 = HALTE[0];
  const ubinB = ubinDekat(h1);
  const ubinC = ubinDekat(h1, [ubinB]);
  await pindahkan(request, b, ubinB);
  await pindahkan(request, c, ubinC);
  await b.page.waitForTimeout(1200);
  const t1 = titikHalte(1);
  const kosong = await sidikWilayah(b.page, t1.x, t1.y);
  await pindahkan(request, a, h1);
  await expect(tombol(a.page, "angkot")).toHaveAttribute("data-dekat", "ya");
  await expect(tombol(a.page, "angkot")).toHaveAttribute("aria-label", "Angkot, 1 muatan, di halte");
  await a.page.screenshot({ path: `${FOTO}/angkot-dekat-731x411.png` });
  await expect.poll(() => sidikWilayah(b.page, t1.x, t1.y), { timeout: 5000 }).not.toBe(kosong);
  await expect(dunia(c.page)).toHaveAttribute("data-terdekat", /\d/, { timeout: 5000 });
  const h3 = HALTE[2];

  // Layar kelas di konsol (menggantikan sambungan kelas kait uji untuk sementara), dengan perekam titik yang melompat.
  const guru = await konsolMasuk(browser, baseURL!, { width: 1024, height: 768 });
  await guru.g.goto(`/admin/#/kelas/${idDariKode(kode)}`);
  const petaKelas = guru.g.locator(".js-kelas-peta");
  await expect(petaKelas).toBeVisible({ timeout: 15_000 });
  await expect(petaKelas.locator("g.js-kelas-titik")).toHaveCount(3);
  await guru.g.waitForTimeout(1200);

  // ---------------------------------------------------------------- Mode pilih halte lewat ketuk (P-21)
  await tombol(a.page, "angkot").tap();
  const ukur731 = await ukurModeHalte(a.page, "HP 731x411", 1);
  catat("mode pilih halte HP 731x411", ukur731);
  await a.page.screenshot({ path: `${FOTO}/pilih-halte-731x411.png` });
  // Perekam: keadaan menunggu (P-21 butir 5) dan saat peta besar tertutup.
  await a.page.evaluate(() => {
    const w = window as unknown as { __tunggu: unknown[]; __tutup: number | null };
    w.__tunggu = [];
    w.__tutup = null;
    new MutationObserver(() => {
      if (document.querySelector('.js-halte-pilihan[data-dipilih="ya"]') && w.__tunggu.length === 0) {
        w.__tunggu.push(
          [...document.querySelectorAll(".js-halte-peta, .js-halte-pilihan, .js-peta-besar-kepala .js-tombol")].map((e) => [e.getAttribute("aria-disabled"), e.getAttribute("data-dipilih")]),
        );
      }
      if (w.__tunggu.length > 0 && w.__tutup === null && !document.querySelector(".js-peta-besar")) w.__tutup = Date.now();
    }).observe(document, { subtree: true, childList: true, attributes: true });
  });
  // Perekam pengamat: B membandingkan wilayah halte 1 dengan sidik kosong, C mencatat posisi terdekat.
  await b.page.evaluate(
    ([x, y, kosong]) => {
      const w = window as unknown as { __kosongPada: number | null };
      w.__kosongPada = null;
      const c = document.querySelector<HTMLCanvasElement>("canvas.js-kanvas-dunia")!;
      const id = setInterval(() => {
        const [kx, ky] = (c.dataset.kamera ?? "0,0").split(",").map(Number);
        const k = c.width / 320;
        const d = c.getContext("2d")!.getImageData(Math.round((x - 9 - kx) * k), Math.round((y - 26 - ky) * k), Math.round(18 * k), Math.round(30 * k)).data;
        let h = 2166136261;
        for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619) >>> 0;
        if (h === kosong) {
          w.__kosongPada = Date.now();
          clearInterval(id);
        }
      }, 20);
    },
    [t1.x, t1.y, kosong],
  );
  // C pindah ke dekat halte 3 tepat sebelum A memilih halte: penyangga C masih memuat butir A di halte 1 yang berumur
  // jauh di bawah (1015 − 64) / 144 ≈ 6,6 detik, jadi butir A di halte 3 `melompat` (P-5) dan mengganti penyangga (P-24).
  const ubinC3 = ubinDekat(h3);
  await pindahkan(request, c, ubinC3);
  // Titik C di layar kelas juga melompat karena kait uji; perekam lompatan dipasang sesudah tanda itu hilang.
  const fC3 = kaki(ubinC3);
  await expect
    .poll(
      () =>
        guru.g.evaluate(
          (tr) => [...document.querySelectorAll<SVGGElement>("g.js-kelas-titik")].some((g) => g.style.transform === tr && !g.hasAttribute("data-lompat")),
          `translate(${fC3.x / 16 - 1.5}px, ${fC3.y / 16 - 2.25}px)`,
        ),
      { timeout: 4000 },
    )
    .toBe(true);
  await guru.g.evaluate(() => {
    const w = window as unknown as { __lompat: { transform: string; durasi: string; lain: string[] }[]; __lompatHilang: number };
    w.__lompat = [];
    w.__lompatHilang = 0;
    let ada = false;
    new MutationObserver(() => {
      const el = document.querySelector<SVGGElement>('g.js-kelas-titik[data-lompat="ya"]');
      if (el && !ada) {
        w.__lompat.push({
          transform: el.style.transform,
          durasi: getComputedStyle(el).transitionDuration,
          lain: [...document.querySelectorAll<SVGGElement>("g.js-kelas-titik:not([data-lompat])")].map((x) => getComputedStyle(x).transitionDuration),
        });
      }
      if (!el && ada) w.__lompatHilang++;
      ada = el !== null;
    }).observe(document, { subtree: true, attributes: true, childList: true });
  });
  await c.page.evaluate(() => {
    const w = window as unknown as { __terdekat: string[] };
    w.__terdekat = [];
    const kv = document.querySelector<HTMLCanvasElement>("canvas.js-kanvas-dunia")!;
    new MutationObserver(() => w.__terdekat.push(kv.dataset.terdekat ?? "")).observe(kv, { attributes: true, attributeFilter: ["data-terdekat"] });
  });
  const histoAwal = await histogram(a.page);
  const pada = Date.now();
  await a.page.locator('.js-halte-peta[data-halte="halte-3"]').tap();
  await expect(petaBesar(a.page)).toHaveCount(0, { timeout: 3000 });
  await expect(pita(a.page)).toHaveText("Tiba di Halte 3.");
  await expect(tombol(a.page, "angkot")).toBeFocused();
  const t3 = titikHalte(3);
  await expect(dunia(a.page)).toHaveAttribute("data-diri", `${t3.x},${t3.y}`);
  await expect.poll(() => umum(a.page)).toContain("Tiba di Halte 3.");
  await a.page.screenshot({ path: `${FOTO}/tiba-731x411.png` });
  const rekam = await a.page.evaluate(() => {
    const w = window as unknown as { __tunggu: [string | null, string | null][][]; __tutup: number | null };
    return { tunggu: w.__tunggu, tutup: w.__tutup };
  });
  const tunggu = rekam.tunggu[0];
  expect(tunggu.every(([dis]) => dis === "true"), "semua tombol nonaktif saat menunggu").toBe(true);
  expect(tunggu.filter(([, dip]) => dip === "ya")).toHaveLength(2); // tombol peta dan tombol daftar halte 3
  const tutupMs = (rekam.tutup ?? Date.now()) - pada;
  expect(tutupMs, "peta tertutup paling lama 1 detik sesudah tiba").toBeLessThanOrEqual(1500);
  // Bingkai HP sesudah pindah halte, CPU biasa (P-39).
  await a.page.waitForTimeout(3000);
  const bingkaiBiasa = ringkasHistogram(histoAwal, await histogram(a.page));
  // Pengamat di halte asal: wilayah avatar sama dengan halte kosong paling lama 500 ms sesudah pindah (AC-10).
  const kosongPada = await b.page.evaluate(() => (window as unknown as { __kosongPada: number | null }).__kosongPada);
  expect(kosongPada, "avatar A hilang dari halte asal di layar B").not.toBeNull();
  const hilangMs = (kosongPada as number) - pada;
  expect(hilangMs).toBeLessThanOrEqual(500);
  // Pengamat di halte tujuan: setiap posisi terdekat yang tercatat adalah titik halte 3 atau kosong (tanpa posisi antara).
  const terdekatC = await c.page.evaluate(() => (window as unknown as { __terdekat: string[] }).__terdekat);
  expect(terdekatC.filter((x) => x !== ""), "posisi A di layar C").toContain(`${t3.x},${t3.y}`);
  expect(terdekatC.filter((x) => x !== "" && x !== `${t3.x},${t3.y}`), "posisi antara di layar C").toEqual([]);
  // Layar kelas: titik A tanpa transisi untuk lompatan, titik lain tetap bertransisi; pembaruan berikutnya halus (P-25).
  const kelasRekam = await guru.g.evaluate(() => {
    const w = window as unknown as { __lompat: { transform: string; durasi: string; lain: string[] }[]; __lompatHilang: number };
    return { lompat: w.__lompat, hilang: w.__lompatHilang };
  });
  expect(kelasRekam.lompat, "titik layar kelas yang melompat").toHaveLength(1);
  expect(kelasRekam.lompat[0].transform).toBe(`translate(${t3.x / 16 - 1.5}px, ${t3.y / 16 - 2.25}px)`);
  expect(kelasRekam.lompat[0].durasi).toBe("0s");
  expect(kelasRekam.lompat[0].lain).toEqual(["0.5s", "0.5s"]);
  expect(kelasRekam.hilang, "data-lompat hilang di pembaruan berikutnya").toBe(1);
  await expect(guru.g.locator('g.js-kelas-titik[data-lompat="ya"]')).toHaveCount(0);
  for (const [ukuran, nama] of [
    [{ width: 1024, height: 768 }, "kelas-1024x768"],
    [{ width: 1920, height: 1080 }, "kelas-1920x1080"],
  ] as const) {
    await guru.g.setViewportSize(ukuran);
    await guru.g.waitForTimeout(600);
    await guru.g.screenshot({ path: `${FOTO}/${nama}.png` });
  }
  await guru.ctx.close();

  // ---------------------------------------------------------------- Laptop, hanya papan ketik (P-20, P-21 butir 4)
  await lewatiKotak(request, b, karcis1);
  await expect(pita(b.page)).toHaveText("+1 Angkot", { timeout: 8000 });
  await pindahkan(request, b, h1);
  await expect(tombol(b.page, "angkot")).toHaveAttribute("data-dekat", "ya");
  await b.page.keyboard.press("Digit5");
  catat("mode pilih halte laptop 1280x720", await ukurModeHalte(b.page, "laptop 1280x720", 1));
  await b.page.screenshot({ path: `${FOTO}/pilih-halte-1280x720.png` });
  const fokus = () => b.page.evaluate(() => (document.activeElement as HTMLElement | null)?.getAttribute("aria-label") ?? document.activeElement?.textContent ?? "");
  const daftarB = b.page.locator(".js-halte-pilihan");
  for (let i = 0; i < 4; i++) await b.page.keyboard.press("Tab");
  await expect(daftarB.first()).toBeFocused(); // Tab berputar di dalam peta besar (tiga tombol daftar dan Batal)
  await b.page.keyboard.press("Shift+Tab");
  expect(await fokus()).toBe("Batal");
  await b.page.keyboard.press("Escape");
  await expect(petaBesar(b.page)).toHaveCount(0);
  await b.page.keyboard.press("Digit5");
  await expect(petaBesar(b.page)).toBeVisible();
  await b.page.keyboard.press("KeyP");
  await expect(petaBesar(b.page)).toHaveCount(0);
  await b.page.keyboard.press("Numpad5");
  await expect(petaBesar(b.page)).toBeVisible();
  await b.page.keyboard.press("Digit1"); // halte asal: diabaikan
  await b.page.waitForTimeout(300);
  await expect(petaBesar(b.page)).toBeVisible();
  await expect(b.page.locator('.js-halte-pilihan[data-dipilih="ya"]')).toHaveCount(0);
  await b.page.keyboard.press("Digit4");
  await expect(petaBesar(b.page)).toHaveCount(0, { timeout: 3000 });
  await expect(pita(b.page)).toHaveText("Tiba di Halte 4.");
  await expect(tombol(b.page, "angkot")).toBeFocused();
  const t4 = titikHalte(4);
  await expect(dunia(b.page)).toHaveAttribute("data-diri", `${t4.x},${t4.y}`);

  // ---------------------------------------------------------------- Dunia 610 × 343: mode, jeda, HP tegak, tanpa jawaban
  const karcis3 = kotakId("k-z7-4");
  await lewatiKotak(request, a, karcis3);
  await expect(tombol(a.page, "angkot")).toHaveAttribute("data-muatan", "1", { timeout: 8000 });
  await pindahkan(request, a, h3);
  await a.page.setViewportSize({ width: 915, height: 356 });
  await a.page.waitForTimeout(400);
  await tombol(a.page, "angkot").tap();
  catat("mode pilih halte dunia 610x343", await ukurModeHalte(a.page, "dunia 610x343", 3));
  await a.page.screenshot({ path: `${FOTO}/pilih-halte-610x343.png` });
  // Jeda: mode tertutup sendiri tanpa pita (P-21 butir 8).
  await kelas(request, kode, { t: "jeda" });
  await expect(petaBesar(a.page)).toHaveCount(0, { timeout: 3000 });
  await expect(a.page.locator(".js-pita", { hasText: "Tiba" })).toHaveCount(0);
  await kelas(request, kode, { t: "lanjut" });
  await expect(a.page.locator(".js-dunia")).toHaveAttribute("data-status", "main", { timeout: 5000 });
  // HP tegak: mode tertutup sendiri.
  await expect(tombol(a.page, "angkot")).toBeVisible();
  await tombol(a.page, "angkot").tap();
  await expect(petaBesar(a.page)).toBeVisible();
  await a.page.setViewportSize({ width: 356, height: 915 });
  await expect(petaBesar(a.page)).toHaveCount(0, { timeout: 3000 });
  await a.page.setViewportSize({ width: 915, height: 356 });
  await a.page.waitForTimeout(400);
  // Menyambung ulang: mode tertutup sendiri tanpa pita, lalu tombol Angkot kembali sesudah tersambung (P-21 butir 8).
  await tombol(a.page, "angkot").tap();
  await expect(petaBesar(a.page)).toBeVisible();
  await putuskan(a.page);
  await expect(petaBesar(a.page)).toHaveCount(0, { timeout: 5000 });
  await expect(a.page.locator(".js-pita", { hasText: "Tiba" })).toHaveCount(0);
  await expect(lapisanSambung(a.page)).toHaveCount(0, { timeout: 20_000 });
  await expect(tombol(a.page, "angkot")).toBeVisible({ timeout: 10_000 });
  await expect(tombol(a.page, "angkot")).toHaveAttribute("data-muatan", "1");
  // Tanpa jawaban (keadaan berubah tepat saat memilih: A dipindah menjauh dari halte): tertutup sesudah 2 detik tanpa pita.
  await tombol(a.page, "angkot").tap();
  await expect(petaBesar(a.page)).toBeVisible();
  const jauh = ubinDekat({ x: h3.x - 3, y: h3.y });
  expect((await pindahkanPemain(request, kode, a.nama, jauh.x, jauh.y)).status()).toBe(200);
  await expect(dunia(a.page)).toHaveAttribute("data-diri", `${kaki(jauh).x},${kaki(jauh).y}`);
  const padaTanpa = Date.now();
  await a.page.locator(".js-halte-pilihan").first().tap();
  await expect(a.page.locator('.js-halte-pilihan[data-dipilih="ya"]')).toHaveCount(1);
  await expect(petaBesar(a.page)).toHaveCount(0, { timeout: 4000 });
  const tanpaMs = Date.now() - padaTanpa;
  expect(tanpaMs).toBeGreaterThanOrEqual(1900);
  await expect(a.page.locator(".js-pita", { hasText: "Tiba" })).toHaveCount(0);
  await expect(tombol(a.page, "angkot")).toHaveAttribute("data-muatan", "1");
  await expect(dunia(a.page)).toHaveAttribute("data-diri", `${kaki(jauh).x},${kaki(jauh).y}`);

  // ---------------------------------------------------------------- Bingkai sesudah pindah halte, CPU 6 kali lebih lambat
  await a.page.setViewportSize({ width: 731, height: 411 });
  await pindahkan(request, a, h3);
  await a.page.waitForTimeout(500);
  const cdp = await a.ctx.newCDPSession(a.page);
  let bingkaiLambat: ReturnType<typeof ringkasHistogram>;
  try {
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
    await tombol(a.page, "angkot").tap();
    await expect(petaBesar(a.page)).toBeVisible();
    const awalLambat = await histogram(a.page);
    await a.page.locator('.js-halte-peta[data-halte="halte-2"]').tap();
    await expect(pita(a.page)).toHaveText("Tiba di Halte 2.", { timeout: 6000 });
    await a.page.waitForTimeout(3000);
    bingkaiLambat = ringkasHistogram(awalLambat, await histogram(a.page));
  } finally {
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 }).catch(() => undefined);
  }
  catat("waktu tiba", { petaTertutupMs: tutupMs, avatarHilangDiLayarBMs: hilangMs, tanpaJawabanTertutupMs: tanpaMs });
  catat("bingkai HP 731x411 sesudah pindah halte", { cpuBiasa: bingkaiBiasa, cpuLambat6x: bingkaiLambat });

  // ---------------------------------------------------------------- Teropong berakhir sesudah 30 detik (P-17, P-32, P-33)
  await a.page.waitForTimeout(Math.max(0, 31_000 - (Date.now() - mulaiTeropong)));
  await expect(a.page.locator(".js-peta-mini")).toHaveAttribute("data-teropong", "tidak", { timeout: 5000 });
  await expect(tombol(a.page, "teropong")).toHaveAttribute("data-aktif", "tidak");
  await expect.poll(() => umum(a.page)).toContain("Teropong selesai.");
  await a.page.locator(".js-peta-mini").tap();
  await expect(a.page.locator(".js-peta-besar-isi")).toHaveAttribute("data-teropong", "tidak");
  await expect(a.page.locator(".js-peta-teropong")).toHaveCount(0);
  for (const p of [a, b, c]) await p.ctx.close();
});

test("konsol: dialog Ruang baru dengan lima skill dan baris Skill (AC-2, AC-17)", async ({ browser, baseURL, request }) => {
  test.setTimeout(120_000);
  const kode = await buatRuang(request, {});
  const { ctx, g } = await konsolMasuk(browser, baseURL!);
  await g.getByRole("link", { name: "Ruang" }).first().click();
  await g.getByRole("button", { name: "+ Ruang baru" }).click();
  const d = g.getByRole("dialog", { name: "Ruang baru" });
  const kelompok = d.getByRole("group", { name: "Skill" });
  await expect(kelompok).toBeVisible();
  for (const nama of ["Lari cepat", "Kompas kejadian", "Petunjuk", "Teropong", "Angkot"]) await expect(kelompok.getByRole("checkbox", { name: nama })).toBeChecked();
  await expect(kelompok.locator(".js-konsol-centang img")).toHaveCount(5);
  for (const t of await kelompok.locator(".js-konsol-centang").evaluateAll((l) => l.map((x) => x.getBoundingClientRect().height))) expect(t).toBeGreaterThanOrEqual(48);
  await g.screenshot({ path: `${FOTO}/konsol-ruang-baru-1280x720.png` });
  await d.getByRole("button", { name: "Batal" }).click();
  await g.goto(`/admin/#/ruang/${idDariKode(kode)}`);
  await expect(g.locator('[data-baris="skill"]')).toHaveText("Skill Lari cepat, Kompas kejadian, Petunjuk, Teropong, Angkot");
  await ctx.close();
});
