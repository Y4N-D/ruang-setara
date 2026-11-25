// Uji ujung ke ujung skill dan kotak bantuan (spesifikasi JS-09, rencana uji "Uji ujung ke ujung"; AC-3, AC-8 sampai
// AC-20, AC-23, dan AC-25). HP (emulasi sentuh 731 × 411, rasio 2,625) dan laptop 1280 × 720 bermain di ruang uji yang
// sama: pemain dipindah ke samping kotak lewat kait uji `pindahkan`, lalu berjalan melewatinya dengan papan ketik.
// Sesudahnya: ruang tanpa Petunjuk dan tanpa skill, konsol (dialog Ruang baru, kepala ruang, hasil, rincian, CSV, dasbor,
// layar kelas), dan pratinjau penyunting. Tangkapan layar disimpan di docs/jejak-setara/tests/JS-09/.
import { readFileSync } from "node:fs";
import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { sasaranKompas } from "../../app/jejak-setara/inti/aturan";
import { posisiSah } from "../../app/jejak-setara/inti/gerak";
import { uraiRle } from "../../app/jejak-setara/inti/peta";
import { ARAH_PANAH, indeksArah } from "../../app/jejak-setara/pemain/dunia/skill";
import { buatRuang, catatRuang, idDariKode, kejadianRuang, kelas, pindahkanPemain, tutupRuangBerkas } from "./ruang-uji";

// Uji konsol memakai ruang yang dimainkan uji pertama, jadi uji di berkas ini berjalan berurutan.
test.describe.configure({ mode: "serial" });
// JS-09 (P-49): ruang yang dibuat berkas ini ditutup sesudah semua ujinya selesai.
test.afterAll(tutupRuangBerkas);

const FOTO = "docs/jejak-setara/tests/JS-09";
const KUNCI_ADMIN = "lokal-kunci-admin-bukan-rahasia";
const SKILL = ["lari", "kompas", "petunjuk"] as const;
type Skill = (typeof SKILL)[number];
const NAMA: Record<Skill, string> = { lari: "Lari cepat", kompas: "Kompas kejadian", petunjuk: "Petunjuk" };

type Jenis = "sepatu" | "kompas" | "buku";
type Kotak = { id: string; jenis: Jenis; x: number; y: number };
type Ubin = { x: number; y: number };
type Titik = { kejadianId: string; titik: Ubin[] };
const kampung = JSON.parse(readFileSync(new URL("../../app/jejak-setara/peta/kampung.json", import.meta.url), "utf8")) as {
  lebar: number;
  tinggi: number;
  tabrakan: string;
  kotak: Kotak[];
};
const GRID = { lebar: kampung.lebar, tinggi: kampung.tinggi, tabrakan: uraiRle(kampung.tabrakan, kampung.lebar * kampung.tinggi) };
const PETA = { lebar: kampung.lebar * 16, tinggi: kampung.tinggi * 16 };
const PANDANG = { lebar: 320, tinggi: 180 };
const BANK = JSON.parse(readFileSync(new URL("../../server/jejak-setara/seed/bank-awal.json", import.meta.url), "utf8")) as {
  kejadian: {
    kode: string;
    judul: string;
    langkah1: { petunjuk: string; opsi: { teks: string; benar: boolean }[] };
    langkah2: { opsi: { teks: string; tingkat: string }[] };
  }[];
};
const isi = (kode: string) => BANK.kejadian.find((k) => k.kode === kode)!;

// ---------------------------------------------------------------------------------------------------------------------
// Peta: titik kaki, kamera, dan tempat uji yang dihitung dari kampung.json (sama dengan uji server).

const kaki = (u: Ubin) => ({ x: u.x * 16 + 8, y: u.y * 16 + 12 });
const pusat = (u: Ubin) => ({ x: u.x * 16 + 8, y: u.y * 16 + 8 });
/** Semua titik kaki di baris kaki y dari x0 sampai x1 bisa diinjak. */
function bebas(y: number, x0: number, x1: number): boolean {
  for (let x = Math.floor(x0); x <= x1; x++) if (!posisiSah(GRID, x, y)) return false;
  return true;
}
/** Tidak ada kotak yang pusatnya dekat lintasan mendatar ini (agar tidak terambil). */
const tanpaKotak = (y: number, x0: number, x1: number) => !kampung.kotak.some((b) => Math.abs(b.y * 16 + 8 - y) <= 16 && b.x * 16 + 8 >= x0 - 16 && b.x * 16 + 8 <= x1 + 16);
/** Kamera berpusat di titik kaki, dijepit ke tepi peta (JS-07). */
function kamera(f: Ubin): Ubin {
  return {
    x: Math.max(0, Math.min(f.x - PANDANG.lebar / 2, PETA.lebar - PANDANG.lebar)),
    y: Math.max(0, Math.min(f.y - PANDANG.tinggi / 2, PETA.tinggi - PANDANG.tinggi)),
  };
}
/** Titik p di dalam pandangan dari titik kaki f, diperluas `tepi` piksel (negatif: diperkecil). */
function tampak(f: Ubin, p: Ubin, tepi = 0): boolean {
  const k = kamera(f);
  return p.x >= k.x - tepi && p.x <= k.x + PANDANG.lebar + tepi && p.y >= k.y - tepi && p.y <= k.y + PANDANG.tinggi + tepi;
}
/** Jumlah kotak yang tergambar di pandangan kamera k (P-18 butir 8): sprite 14 × 12 di (16x + 1, 16y + 2). */
const kotakTampak = (k: Ubin, daftar: readonly Kotak[]) =>
  daftar.filter((b) => b.x * 16 + 15 > k.x && b.x * 16 + 1 < k.x + PANDANG.lebar && b.y * 16 + 14 > k.y && b.y * 16 + 2 < k.y + PANDANG.tinggi).length;

/** Kotak berjenis itu yang baris kakinya bebas dari satu ubin di kirinya sampai tiga ubin di kanannya. */
function kotakDatar(jenis: Jenis, kecuali: readonly string[]): Kotak {
  const kt = kampung.kotak.find((k) => k.jenis === jenis && !kecuali.includes(k.id) && bebas(k.y * 16 + 12, k.x * 16 - 8, k.x * 16 + 56));
  if (!kt) throw new Error(`tidak ada kotak ${jenis} di baris datar`);
  return kt;
}

/** Lorong mendatar 26 ubin tanpa kotak, untuk mengukur jarak tempuh 3 detik (lari 345,6 piksel = 21,6 ubin). */
function cariLorong(): Ubin {
  for (let uy = 1; uy < kampung.tinggi - 1; uy++)
    for (let ux = 1; ux + 26 < kampung.lebar; ux++) {
      const f = kaki({ x: ux, y: uy });
      if (bebas(f.y, f.x, f.x + 26 * 16) && tanpaKotak(f.y, f.x, f.x + 26 * 16)) return { x: ux, y: uy };
    }
  throw new Error("tidak ada lorong");
}

interface TempatKompas {
  berdiri: Ubin;
  kotak: Kotak;
  sasaran: { kode: string; x: number; y: number };
  arah: string;
}
/**
 * Tempat berdiri dua sampai empat baris dari kotak yang belum diambil: di sepanjang lintasan ±72 piksel, sasaran Kompas
 * (titik aktif terdekat dari tempat berdiri, P-5) tetap di luar pandangan dan kotak tetap di dalamnya, tanpa kotak lain
 * di lintasan.
 */
function cariTempatKompas(titik: readonly Titik[], kecuali: readonly string[]): TempatKompas {
  const daftar = titik.map((k) => ({ kode: k.kejadianId, selesai: false, titik: k.titik.map((t, i) => ({ id: `t${i}`, x: t.x, y: t.y })) }));
  for (const kt of kampung.kotak) {
    if (kecuali.includes(kt.id)) continue;
    for (const dy of [2, -2, 3, -3, 4, -4]) {
      const berdiri = { x: kt.x, y: kt.y + dy };
      const f = kaki(berdiri);
      if (!bebas(f.y, f.x - 72, f.x + 72) || !tanpaKotak(f.y, f.x - 72, f.x + 72)) continue;
      const s = sasaranKompas(f, daftar);
      if (!s) continue;
      const ps = pusat(s);
      let ok = true;
      for (let x = f.x - 72; x <= f.x + 72 && ok; x += 8) ok = !tampak({ x, y: f.y }, ps, 32) && tampak({ x, y: f.y }, pusat(kt), -16);
      if (ok) return { berdiri, kotak: kt, sasaran: { kode: s.kode, x: s.x, y: s.y }, arah: ARAH_PANAH[indeksArah(ps.x - f.x, ps.y - f.y)] };
    }
  }
  throw new Error("tidak ada tempat Kompas");
}

/** Ubin yang bisa diinjak dengan sasaran tampak tetapi lebih dari 32 piksel darinya (belum tiba, P-25). */
function ubinDekat(t: Ubin): Ubin {
  for (const [dx, dy] of [[0, 3], [0, -3], [3, 0], [-3, 0], [3, 2], [-3, 2], [2, 3], [-2, 3], [3, -2], [-3, -2]]) {
    const u = { x: t.x + dx, y: t.y + dy };
    const f = kaki(u);
    const p = pusat(t);
    if (posisiSah(GRID, f.x, f.y) && Math.hypot(f.x - p.x, f.y - p.y) > 40) return u;
  }
  throw new Error(`tidak ada ubin di dekat ${t.x},${t.y}`);
}

// ---------------------------------------------------------------------------------------------------------------------
// Peramban

interface Pemain {
  ctx: BrowserContext;
  page: Page;
  nama: string;
  kode: string;
  /** Kotak yang sudah diambil pemain ini (belum siap lagi selama 90 detik). */
  diambil: string[];
  catatan: { konsol: string[]; respons: string[] };
}

async function gabung(
  browser: Browser,
  baseURL: string,
  kode: string,
  jenis: "hp" | "laptop",
  avatar: number,
  opsi: { kurangiGerak?: boolean; umum?: boolean; ukuran?: { width: number; height: number }; rasio?: number } = {},
): Promise<Pemain> {
  const hp = jenis === "hp";
  const ctx = await browser.newContext({
    baseURL,
    viewport: opsi.ukuran ?? (hp ? { width: 731, height: 411 } : { width: 1280, height: 720 }),
    ...(hp ? { isMobile: true, hasTouch: true, deviceScaleFactor: opsi.rasio ?? 2.625 } : {}),
    ...(opsi.kurangiGerak ? { reducedMotion: "reduce" as const } : {}),
  });
  const page = await ctx.newPage();
  const catatan = { konsol: [] as string[], respons: [] as string[] };
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") catatan.konsol.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (g) => catatan.konsol.push(`pageerror: ${g.message}`));
  page.on("response", (j) => {
    if (j.status() >= 400) catatan.respons.push(`${j.status()} ${j.url()}`);
  });
  if (opsi.umum) {
    // Catatan pengumuman pembaca layar (P-39): setiap teks baru di wilayah aria-live beserta waktunya.
    await page.addInitScript(() => {
      const catat: { t: number; teks: string }[] = [];
      (window as unknown as { __umum: typeof catat }).__umum = catat;
      new MutationObserver(() => {
        const teks = document.querySelector('.js-sr[aria-live="polite"]')?.textContent ?? "";
        if (teks && catat[catat.length - 1]?.teks !== teks) catat.push({ t: performance.now(), teks });
      }).observe(document, { subtree: true, childList: true, characterData: true });
    });
  }
  await page.goto(`/?kode=${kode}`);
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible({ timeout: 20_000 }); // JS-15 (P-23): gambar dunia dimuat dulu
  const pilihan = page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first();
  const nama = (await pilihan.textContent())?.replace("▶", "").trim() ?? "";
  await pilihan.click();
  await page.getByRole("radio", { name: `Avatar ${avatar}` }).click();
  await page.getByRole("button", { name: "Gabung" }).click();
  await expect(dunia(page)).toHaveAttribute("data-diri", /^\d+,\d+$/);
  return { ctx, page, nama, kode, diambil: [], catatan };
}

const dunia = (page: Page) => page.locator("canvas.js-kanvas-dunia");
const tombol = (page: Page, s: Skill) => page.locator(`.js-tombol-skill[data-skill="${s}"]`);
const pita = (page: Page) => page.locator(".js-pita");
const dialog = (page: Page) => page.getByRole("dialog").filter({ has: page.locator("#js-dialog-judul") });
const tampilan = (page: Page) => page.locator(".js-dialog").getAttribute("data-tampilan");
const kakiDialog = (page: Page) => page.locator(".js-dialog-kaki [data-aksi]");
const petunjukDialog = (page: Page) => page.locator('.js-dialog-kaki [data-aksi="petunjuk"]');
const dicoret = (page: Page) => page.locator('.js-dialog [data-dicoret="ya"]');
const tunggu = (page: Page) => page.waitForTimeout(700); // masa tunggu 600 ms setiap tampilan dialog (JS-08 P-48)
const aksiFokus = (page: Page) => page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.aksi ?? "");
const posisi = async (page: Page): Promise<Ubin> => {
  const [x, y] = ((await dunia(page).getAttribute("data-diri")) ?? "").split(",").map(Number);
  return { x, y };
};
const kameraDari = async (page: Page): Promise<Ubin> => {
  const [x, y] = ((await dunia(page).getAttribute("data-kamera")) ?? "").split(",").map(Number);
  return { x, y };
};
const lepasRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
/** Pindah ke ubin kiri kotak, lalu berjalan sekitar 32 piksel ke kanan melewati pusatnya dengan papan ketik. */
async function ambilKotak(request: APIRequestContext, p: Pemain, jenis: Jenis): Promise<Kotak> {
  const kt = kotakDatar(jenis, p.diambil);
  await pindahkan(request, p, { x: kt.x - 1, y: kt.y });
  await tahan(p.page, "ArrowRight", 450);
  p.diambil.push(kt.id);
  return kt;
}
async function mulai(request: APIRequestContext, kode: string, pemain: Pemain[]): Promise<void> {
  await kelas(request, kode, { t: "mulai" });
  for (const p of pemain) await expect(p.page.locator(".js-dunia")).toHaveAttribute("data-status", "main", { timeout: 10_000 });
}
async function dekati(request: APIRequestContext, p: Pemain, kejadianId: string, t: Ubin): Promise<void> {
  await pindahkan(request, p, { x: t.x, y: t.y + 1 });
  await expect(dunia(p.page)).toHaveAttribute("data-jangkauan", kejadianId, { timeout: 5000 });
}
/** Nomor (1-based) pilihan yang tampil dengan teks tertentu. */
async function nomorPilihan(page: Page, teks: string): Promise<number> {
  const semua = await page.locator('.js-dialog [data-pilihan="ya"] .js-teks-pilihan').allTextContents();
  const i = semua.indexOf(teks);
  expect(i, `pilihan "${teks}" tidak tampil: ${JSON.stringify(semua)}`).toBeGreaterThanOrEqual(0);
  return i + 1;
}
/** Jarak mendatar yang ditempuh selama `ms` milidetik menahan panah kanan, sesudah posisi tenang. */
async function jarakTempuh(page: Page, ms: number): Promise<number> {
  const awal = await posisi(page);
  await tahan(page, "ArrowRight", ms);
  let akhir = await posisi(page);
  await expect
    .poll(
      async () => {
        const p = await posisi(page);
        const sama = p.x === akhir.x && p.y === akhir.y;
        akhir = p;
        return sama;
      },
      { intervals: [700] },
    )
    .toBe(true);
  return akhir.x - awal.x;
}
/** Isi dialog: tinggi isi, tinggi tampak, dan luapan (px). */
const luapanDialog = (page: Page) =>
  page.locator(".js-dialog-isi").evaluate((el) => ({ isi: el.scrollHeight, tampak: el.clientHeight, luap: Math.max(0, el.scrollHeight - el.clientHeight) }));
/** Kaki dialog satu baris, setiap tombol setinggi 48 px (P-27). */
async function periksaKaki(page: Page, nama: string): Promise<void> {
  const k = await kakiDialog(page).evaluateAll((el) => el.map((e) => e.getBoundingClientRect()).map((r) => ({ atas: Math.round(r.top), tinggi: r.height, kanan: r.right })));
  expect(new Set(k.map((x) => x.atas)).size, `${nama}: kaki satu baris ${JSON.stringify(k)}`).toBe(1);
  for (const x of k) expect(x.tinggi, `${nama}: tinggi tombol kaki`).toBeGreaterThanOrEqual(48);
  await expect(page.locator(".js-dialog-kaki")).toBeInViewport({ ratio: 1 });
}

// ---------------------------------------------------------------------------------------------------------------------
// Tata letak HUD (AC-13, AC-16): tombol bulat dihitung sebagai lingkaran, lencana dan unsur lain sebagai persegi.

type Persegi = { l: number; t: number; r: number; b: number };
type Lingkaran = { x: number; y: number; jari: number };
type Bentuk = Persegi | Lingkaran;
interface TataHud {
  hud: Persegi;
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
    let pitaBaris = 0;
    if (p) {
      const g = getComputedStyle(p);
      pitaBaris = Math.round((p.clientHeight - parseFloat(g.paddingTop) - parseFloat(g.paddingBottom)) / parseFloat(g.lineHeight));
    }
    const kp = k(p);
    return {
      hud: k(document.querySelector(".js-hud"))!,
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
      pita: kp ? { ...kp, baris: pitaBaris } : null,
    };
  });
}
const lingkaran = (p: Persegi): Lingkaran => ({ x: (p.l + p.r) / 2, y: (p.t + p.b) / 2, jari: (p.r - p.l) / 2 });
const adalahLingkaran = (b: Bentuk): b is Lingkaran => "jari" in b;
/** Jarak tepi ke tepi dua bentuk; negatif bila bertumpuk. */
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

/** AC-13: ukuran, di dalam HUD, tidak bertumpuk dan berjarak ≥ 8 px; di perangkat sentuh juga jarak P-34. */
function periksaHud(h: TataHud, nama: string, sentuh: boolean, jumlah = 3): Record<string, number> {
  const ukur: Record<string, number> = { hudLebar: Math.round(h.hud.r - h.hud.l), hudTinggi: Math.round(h.hud.b - h.hud.t) };
  expect(h.butir.length, `${nama}: jumlah tombol`).toBe(jumlah);
  for (const b of h.butir) {
    expect(b.tombol.r - b.tombol.l, `${nama} ${b.skill}: lebar`).toBeGreaterThanOrEqual(48);
    expect(b.tombol.b - b.tombol.t, `${nama} ${b.skill}: tinggi`).toBeGreaterThanOrEqual(48);
    for (const x of [b.tombol, b.lencana, b.kbd]) {
      if (!x) continue;
      expect(x.l >= h.hud.l - 0.5 && x.r <= h.hud.r + 0.5 && x.t >= h.hud.t - 0.5 && x.b <= h.hud.b + 0.5, `${nama} ${b.skill}: di dalam HUD`).toBe(true);
    }
    for (const [n, x] of Object.entries(h.lain)) {
      if (!x) continue;
      const bentuk: Bentuk = n === "periksa" ? lingkaran(x) : x;
      const d = jarakMin(bentukButir(b), [bentuk]);
      ukur[`${b.skill}-${n}`] = Math.round(d * 10) / 10;
      expect(d, `${nama} ${b.skill} ↔ ${n}`).toBeGreaterThanOrEqual(8 - 0.5);
      if (sentuh && n === "periksa") expect(jarakBentuk(lingkaran(b.tombol), bentuk), `${nama} ${b.skill} ↔ Periksa (P-34)`).toBeGreaterThanOrEqual(20 - 0.5);
      if (sentuh && n === "peta") expect(d, `${nama} ${b.skill} ↔ peta mini (P-34)`).toBeGreaterThanOrEqual(70 - 0.5);
    }
  }
  for (let i = 0; i < h.butir.length; i++)
    for (let j = i + 1; j < h.butir.length; j++) {
      const [a, b] = [h.butir[i], h.butir[j]];
      const d = jarakMin(bentukButir(a), bentukButir(b));
      ukur[`${a.skill}-${b.skill}`] = Math.round(d * 10) / 10;
      expect(d, `${nama} ${a.skill} ↔ ${b.skill}`).toBeGreaterThanOrEqual(8 - 0.5);
      if (sentuh) expect(jarakBentuk(lingkaran(a.tombol), lingkaran(b.tombol)), `${nama} ${a.skill} ↔ ${b.skill} (P-34)`).toBeGreaterThanOrEqual(10 - 0.5);
    }
  return ukur;
}
/** AC-16: lebar luar pita ≤ lebar HUD − 256 px, berjarak ≥ 4 px dari peta mini, dengan jumlah baris yang diharapkan. */
function periksaPita(h: TataHud, nama: string, baris: number): void {
  expect(h.pita, `${nama}: pita tampil`).not.toBeNull();
  const p = h.pita!;
  const info = `${nama} (HUD ${Math.round(h.hud.r - h.hud.l)} px, pita ${Math.round(p.r - p.l)} px)`;
  expect(p.r - p.l, `${info}: lebar pita`).toBeLessThanOrEqual(h.hud.r - h.hud.l - 256 + 0.5);
  if (h.lain.peta) expect(h.lain.peta.l - p.r, `${info}: jarak pita ke peta mini`).toBeGreaterThanOrEqual(4 - 0.5);
  expect(p.baris, `${info}: baris pita`).toBe(baris);
}

/** Histogram kumulatif waktu kode gambar (batas kelompok JS-08 P-68) dan ringkasannya (pola dunia.uji.ts). */
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
  return { bingkai: total, p95Paling: p95, maksPaling: terakhir >= 0 ? BATAS_KELOMPOK[terakhir] : 0, kelompok: n };
}

/** Ruang yang dimainkan uji pertama, untuk uji konsol. */
const utama = { kode: "", id: "", namaHp: "", kejadianHp: "", kejadianLaptop: "" };
/** Ruang tanpa skill dari uji kedua (sudah diakhiri), untuk CSV "Tidak". */
const tanpaSkill = { kode: "", id: "" };

test("HP dan laptop di ruang yang sama: kotak, Lari cepat, Kompas, Petunjuk, +1 Kompas, tombol, pita, pengumuman, dan kinerja (AC-8 sampai AC-16, AC-23)", async ({
  browser,
  baseURL,
  request,
}) => {
  test.setTimeout(420_000);
  const kode = await buatRuang(request, { durasiMenit: 15 });
  utama.kode = kode;
  utama.id = idDariKode(kode);
  const laptop = await gabung(browser, baseURL!, kode, "laptop", 2, { umum: true });
  const hp = await gabung(browser, baseURL!, kode, "hp", 1);
  utama.namaHp = hp.nama;

  // Lobi: tanpa tombol skill dan tanpa kotak (P-18 butir 1, P-33).
  for (const p of [laptop, hp]) {
    await expect(dunia(p.page)).toHaveAttribute("data-kotak", "0");
    await expect(p.page.locator(".js-skill")).toHaveCount(0);
  }
  await mulai(request, kode, [laptop, hp]);
  const titik = (await kejadianRuang(request, kode)) as Titik[];

  // Tombol skill tanpa muatan (P-33 sampai P-36, P-39): lengkung di HP, kolom bertanda 1 2 3 di laptop.
  // Kelompok tombol tidak berukuran sendiri (semua tombolnya diletakkan mutlak), jadi yang diperiksa tampil adalah tombolnya.
  await expect(laptop.page.locator('.js-skill[data-letak="kolom"]')).toBeAttached();
  await expect(hp.page.locator('.js-skill[data-letak="lengkung"]')).toBeAttached();
  for (const p of [laptop, hp]) {
    await expect(p.page.getByRole("group", { name: "Skill" }).locator(".js-tombol-skill")).toHaveCount(3);
    for (const s of SKILL) await expect(tombol(p.page, s)).toBeVisible();
    for (const s of SKILL) {
      await expect(tombol(p.page, s)).toHaveAttribute("aria-label", `${NAMA[s]}, 0 muatan`);
      await expect(tombol(p.page, s)).toHaveAttribute("aria-disabled", "true");
      await expect(tombol(p.page, s)).toHaveAttribute("data-muatan", "0");
      await expect(tombol(p.page, s)).toHaveAttribute("data-aktif", "tidak");
      await expect(tombol(p.page, s)).toHaveAttribute("data-jeda", "tidak");
      await expect(tombol(p.page, s).locator(".js-skill-lencana")).toHaveText("0");
    }
  }
  await expect(laptop.page.locator(".js-skill-kbd")).toHaveText(["1", "2", "3"]);
  for (const [i, s] of SKILL.entries()) await expect(tombol(laptop.page, s)).toHaveAttribute("aria-keyshortcuts", String(i + 1));
  await expect(hp.page.locator(".js-skill-kbd")).toHaveCount(0);
  await expect(tombol(hp.page, "lari")).not.toHaveAttribute("aria-keyshortcuts", /./);

  // HP: tombol tanpa muatan memunculkan pita "Cari kotak …" satu per satu, tanpa role="status" (P-37 butir 2, P-41).
  // Tombol ber-aria-disabled tetap menerima ketukan (layar pemain yang memutuskan), jadi ketukannya dipaksa.
  await tombol(hp.page, "lari").tap({ force: true });
  await expect(pita(hp.page)).toHaveText("Cari kotak sepatu.");
  await expect(pita(hp.page)).not.toHaveAttribute("role", /./);
  await tombol(hp.page, "kompas").tap({ force: true });
  await hp.page.waitForTimeout(800);
  await expect(pita(hp.page)).toHaveText("Cari kotak sepatu.");
  await expect(pita(hp.page)).toHaveText("Cari kotak kompas.", { timeout: 4000 });
  periksaPita(await tataHud(hp.page), "HP 731x411 Cari kotak kompas.", 1);

  // ---------------------------------------------------------------- Laptop, hanya papan ketik (AC-15)
  // Kotak sepatu: tergambar di pandangan, terambil saat dilewati, lalu hilang (P-15 sampai P-18).
  const sepatuL = kotakDatar("sepatu", laptop.diambil);
  await pindahkan(request, laptop, { x: sepatuL.x - 1, y: sepatuL.y });
  const kotakAwal = kotakTampak(await kameraDari(laptop.page), kampung.kotak);
  expect(kotakAwal).toBeGreaterThanOrEqual(1);
  await expect(dunia(laptop.page)).toHaveAttribute("data-kotak", String(kotakAwal));
  await tahan(laptop.page, "ArrowRight", 450);
  laptop.diambil.push(sepatuL.id);
  await expect(pita(laptop.page)).toHaveText("+1 Lari cepat");
  await expect(tombol(laptop.page, "lari")).toHaveAttribute("data-muatan", "1");
  await expect(tombol(laptop.page, "lari")).not.toHaveAttribute("aria-disabled", /./);
  await expect(tombol(laptop.page, "lari")).toHaveAttribute("aria-label", "Lari cepat, 1 muatan");
  await expect(tombol(laptop.page, "lari").locator(".js-skill-lencana")).toHaveText("1");
  periksaPita(await tataHud(laptop.page), "laptop 1280x720 +1 Lari cepat", 1);
  await pindahkan(request, laptop, { x: sepatuL.x - 1, y: sepatuL.y });
  await expect(dunia(laptop.page)).toHaveAttribute("data-kotak", String(kotakTampak(await kameraDari(laptop.page), kampung.kotak.filter((k) => k.id !== sepatuL.id))));

  // Kotak kompas, lalu Kompas dengan tombol 2 di tempat yang sasarannya di luar pandangan (P-24, P-26).
  await ambilKotak(request, laptop, "kompas");
  await expect(pita(laptop.page)).toHaveText("+1 Kompas");
  await expect(tombol(laptop.page, "kompas")).toHaveAttribute("data-muatan", "1");
  const tl = cariTempatKompas(titik, laptop.diambil);
  await pindahkan(request, laptop, tl.berdiri);
  const terlihatSebelum = await dunia(laptop.page).getAttribute("data-kejadian");
  await laptop.page.keyboard.press("Digit2");
  await expect(tombol(laptop.page, "kompas")).toHaveAttribute("data-aktif", "ya");
  await expect(tombol(laptop.page, "kompas")).toHaveAttribute("data-jeda", "ya");
  await expect(tombol(laptop.page, "kompas")).toHaveAttribute("aria-label", "Kompas kejadian, 0 muatan, sedang aktif");
  await expect(tombol(laptop.page, "kompas")).toHaveAttribute("aria-disabled", "true");
  await expect(dunia(laptop.page)).toHaveAttribute("data-kompas", tl.arah);
  // HUD dengan tombol bermuatan (Lari cepat), aktif (Kompas), dan tanpa muatan (Petunjuk).
  const ukurLaptop = periksaHud(await tataHud(laptop.page), "laptop 1280x720", false);
  await laptop.page.screenshot({ path: `${FOTO}/hud-skill-1280x720.png` });
  await expect(tombol(laptop.page, "kompas")).toHaveAttribute("data-jeda", "tidak", { timeout: 4000 });
  // Peta besar menyembunyikan tombol skill dan tidak menandai sasaran Kompas (P-26 butir 7, P-33).
  await laptop.page.keyboard.press("KeyP");
  await expect(laptop.page.locator(".js-skill")).toHaveCount(0);
  await expect(laptop.page.locator(".js-peta-kejadian")).toHaveCount(Number(terlihatSebelum));
  await laptop.page.keyboard.press("Escape");
  await expect(tombol(laptop.page, "kompas")).toBeVisible();
  // Sasaran tampak: panah disembunyikan, Kompas tetap aktif; lalu tiba dalam 32 piksel: Kompas selesai (P-25, P-26).
  await pindahkan(request, laptop, ubinDekat(tl.sasaran));
  await expect(dunia(laptop.page)).toHaveAttribute("data-kompas", "");
  await expect(tombol(laptop.page, "kompas")).toHaveAttribute("data-aktif", "ya");
  await pindahkan(request, laptop, { x: tl.sasaran.x, y: tl.sasaran.y + 1 });
  await expect(tombol(laptop.page, "kompas")).toHaveAttribute("data-aktif", "tidak", { timeout: 4000 });
  await expect(tombol(laptop.page, "kompas")).toHaveAttribute("aria-label", "Kompas kejadian, 0 muatan");
  // Ajakan "E Periksa" tampil di dekat kejadian: tombol skill tidak bertumpuk dengannya (AC-13).
  await expect(laptop.page.locator(".js-ajakan-e")).toBeVisible();
  periksaHud(await tataHud(laptop.page), "laptop 1280x720 dengan ajakan E", false);

  // Lari cepat dengan tombol 1: jarak tempuh saat berlari sedikitnya 1,4 kali jarak berjalan (P-19, P-20; AC-9). Kedua
  // jarak diukur berturut-turut dengan menahan panah kanan 3 detik (lebih panjang dari 2 detik spesifikasi, agar
  // bingkai yang terlambat di mesin uji tidak banyak memengaruhi rasionya).
  const lorong = cariLorong();
  await pindahkan(request, laptop, lorong);
  const jarakJalan = await jarakTempuh(laptop.page, 3000);
  await pindahkan(request, laptop, lorong);
  await laptop.page.keyboard.press("Digit1");
  await expect(dunia(laptop.page)).toHaveAttribute("data-lari", "ya");
  await expect(tombol(laptop.page, "lari")).toHaveAttribute("data-aktif", "ya");
  const jarakLari = await jarakTempuh(laptop.page, 3000);
  console.log("JS09_JARAK", JSON.stringify({ lari: jarakLari, jalan: jarakJalan, rasio: jarakLari / jarakJalan }));
  expect(jarakLari).toBeGreaterThanOrEqual(1.4 * jarakJalan);
  await expect(dunia(laptop.page)).toHaveAttribute("data-lari", "tidak", { timeout: 8000 });
  await expect(tombol(laptop.page, "lari")).toHaveAttribute("data-aktif", "tidak");

  // Kotak buku; tombol 3 di luar dialog: pita "Petunjuk dipakai di Langkah 1." (P-37 butir 4).
  await ambilKotak(request, laptop, "buku");
  await expect(pita(laptop.page)).toHaveText("+1 Petunjuk");
  await expect(tombol(laptop.page, "petunjuk")).toHaveAttribute("data-muatan", "1");
  await laptop.page.keyboard.press("Digit3");
  await expect(pita(laptop.page)).toHaveText("Petunjuk dipakai di Langkah 1.", { timeout: 6000 });
  await expect(tombol(laptop.page, "petunjuk")).toHaveAttribute("data-muatan", "1");
  periksaPita(await tataHud(laptop.page), "laptop 1280x720 Petunjuk dipakai di Langkah 1.", 1);

  // Dialog mode penuh: Petunjuk lewat Tab lalu Enter (P-27 sampai P-29, P-38).
  const kL = tl.sasaran.kode;
  utama.kejadianLaptop = kL;
  const tL = titik.find((t) => t.kejadianId === kL)!.titik[0];
  await dekati(request, laptop, kL, tL);
  await laptop.page.keyboard.press("KeyE");
  await expect(dialog(laptop.page)).toBeVisible();
  expect(await tampilan(laptop.page)).toBe("langkah1");
  await expect(laptop.page.locator(".js-skill")).toHaveCount(0);
  await expect(kakiDialog(laptop.page)).toHaveText(["Tutup", "Petunjuk (1)", "Kunci jawaban"]);
  await periksaKaki(laptop.page, "laptop 1280x720 langkah1");
  await tunggu(laptop.page);
  const salahL = isi(kL).langkah1.opsi.filter((o) => !o.benar).map((o) => o.teks);
  await laptop.page.keyboard.press(String(await nomorPilihan(laptop.page, salahL[0])));
  await expect(laptop.page.locator('.js-dialog [data-pilihan="ya"][aria-pressed="true"]')).toContainText(salahL[0]);
  for (let i = 0; i < 12 && (await aksiFokus(laptop.page)) !== "petunjuk"; i++) await laptop.page.keyboard.press("Tab");
  expect(await aksiFokus(laptop.page)).toBe("petunjuk");
  await laptop.page.keyboard.press("Enter");
  const kotakPetunjukL = laptop.page.getByRole("note", { name: "Petunjuk" });
  await expect(kotakPetunjukL).toHaveText(isi(kL).langkah1.petunjuk);
  await expect(kotakPetunjukL.locator("img")).toHaveCount(1);
  await expect(dicoret(laptop.page)).toHaveCount(1);
  const coretL = (await dicoret(laptop.page).locator(".js-teks-pilihan").textContent()) ?? "";
  expect(salahL).toContain(coretL);
  await expect(dicoret(laptop.page)).toHaveAttribute("aria-disabled", "true");
  // Teks pembaca layar dari dua span tersembunyi; Chromium menyisipkan spasi di antara span itu, jadi spasi sebelum koma
  // diizinkan (dibacakan sama).
  await expect(dicoret(laptop.page)).toHaveAccessibleName(new RegExp(`^[A-D]\\. ${lepasRegex(coretL)} ?, dicoret Petunjuk$`));
  await expect(petunjukDialog(laptop.page)).toHaveText("Petunjuk dipakai");
  await expect(petunjukDialog(laptop.page)).toHaveAttribute("aria-disabled", "true");
  await expect(petunjukDialog(laptop.page)).toBeFocused();
  // Pilihan yang sedang terpilih dilepas bila dicoret; selain itu tetap terpilih (P-29 butir 3).
  const terpilihL = laptop.page.locator('.js-dialog [data-pilihan="ya"][aria-pressed="true"]');
  if (coretL === salahL[0]) {
    await expect(terpilihL).toHaveCount(0);
    await expect(laptop.page.locator('.js-dialog-kaki [data-aksi="kunci"]')).toHaveAttribute("aria-disabled", "true");
  } else await expect(terpilihL).toContainText(salahL[0]);
  // Angka dan Enter pada pilihan yang dicoret tidak memilihnya.
  await laptop.page.keyboard.press(String(await nomorPilihan(laptop.page, coretL)));
  await expect(dicoret(laptop.page)).toHaveAttribute("aria-pressed", "false");
  await dicoret(laptop.page).focus();
  await laptop.page.keyboard.press("Enter");
  await expect(dicoret(laptop.page)).toHaveAttribute("aria-pressed", "false");
  expect(await tampilan(laptop.page)).toBe("langkah1");
  expect((await luapanDialog(laptop.page)).luap, "laptop 1280x720 langkah1 dengan petunjuk: luapan").toBe(0);
  await laptop.page.screenshot({ path: `${FOTO}/dialog-petunjuk-penuh-1280x720.png` });
  // Ditutup lalu dibuka lagi di 960 × 540 (mode ringkas): petunjuk yang sama dikirim ulang (P-30), kaki satu baris.
  await laptop.page.keyboard.press("Escape");
  await expect(dialog(laptop.page)).toHaveCount(0);
  await expect(tombol(laptop.page, "petunjuk")).toHaveAttribute("data-muatan", "0");
  await laptop.page.setViewportSize({ width: 960, height: 540 });
  await laptop.page.waitForTimeout(400);
  await laptop.page.keyboard.press("KeyE");
  await expect(dialog(laptop.page)).toBeVisible();
  expect(await tampilan(laptop.page)).toBe("situasi1");
  await expect(petunjukDialog(laptop.page)).toHaveCount(0);
  await tunggu(laptop.page);
  for (let i = 0; i < 8 && (await aksiFokus(laptop.page)) !== "lihat"; i++) await laptop.page.keyboard.press("Tab");
  await laptop.page.keyboard.press("Enter");
  await expect.poll(() => tampilan(laptop.page)).toBe("pilihan1");
  await expect(kotakPetunjukL).toHaveText(isi(kL).langkah1.petunjuk);
  await expect(laptop.page.locator(".js-dialog .js-pertanyaan")).toHaveCount(0);
  await expect(dicoret(laptop.page).locator(".js-teks-pilihan")).toHaveText(coretL);
  await expect(kakiDialog(laptop.page)).toHaveText(["Tutup", "Situasi", "Petunjuk dipakai", "Kunci jawaban"]);
  await periksaKaki(laptop.page, "laptop 960x540 pilihan1");
  const luapan960 = await luapanDialog(laptop.page);
  expect(luapan960.luap, "laptop 960x540 pilihan1 dengan petunjuk: luapan").toBe(0);
  await tunggu(laptop.page);
  await laptop.page.keyboard.press("Escape");
  await expect(dialog(laptop.page)).toHaveCount(0);
  // Tombol 1 tanpa muatan di HUD 960: pita "Cari kotak sepatu." (P-41).
  await laptop.page.keyboard.press("Digit1");
  await expect(pita(laptop.page)).toHaveText("Cari kotak sepatu.");
  periksaPita(await tataHud(laptop.page), "laptop 960x540 Cari kotak sepatu.", 1);
  periksaHud(await tataHud(laptop.page), "laptop 960x540", false);
  await laptop.page.setViewportSize({ width: 1280, height: 720 });
  await laptop.page.waitForTimeout(400);
  // Langkah 1 benar, Langkah 2 bukan "tepat": tanpa +1 Kompas (P-32).
  await laptop.page.keyboard.press("KeyE");
  await expect(dialog(laptop.page)).toBeVisible();
  expect(await tampilan(laptop.page)).toBe("langkah1");
  await tunggu(laptop.page);
  await laptop.page.keyboard.press(String(await nomorPilihan(laptop.page, isi(kL).langkah1.opsi.find((o) => o.benar)!.teks)));
  await laptop.page.keyboard.press("Enter");
  await expect.poll(() => tampilan(laptop.page)).toBe("umpan");
  await expect(petunjukDialog(laptop.page)).toHaveCount(0);
  await tunggu(laptop.page);
  await laptop.page.keyboard.press("Enter");
  await expect.poll(() => tampilan(laptop.page)).toBe("langkah2");
  await expect(petunjukDialog(laptop.page)).toHaveCount(0);
  await tunggu(laptop.page);
  await laptop.page.keyboard.press(String(await nomorPilihan(laptop.page, isi(kL).langkah2.opsi.find((o) => o.tingkat !== "tepat")!.teks)));
  await laptop.page.keyboard.press("Enter");
  await expect.poll(() => tampilan(laptop.page)).toBe("kartu");
  await expect(petunjukDialog(laptop.page)).toHaveCount(0);
  await expect(laptop.page.locator(".js-kartu-skill")).toHaveCount(0);
  await tunggu(laptop.page);
  await laptop.page.keyboard.press("Enter");
  await expect(dialog(laptop.page)).toHaveCount(0);
  await expect(tombol(laptop.page, "kompas")).toHaveAttribute("data-muatan", "0");
  // Tombol 1 ditahan: tekanan berulang diabaikan (P-38).
  await expect(pita(laptop.page)).toHaveCount(0, { timeout: 8000 });
  await laptop.page.keyboard.down("Digit1");
  await expect(pita(laptop.page)).toHaveText("Cari kotak sepatu.");
  await expect(pita(laptop.page)).toHaveCount(0, { timeout: 5000 });
  await laptop.page.keyboard.down("Digit1"); // keydown dengan repeat: true
  await laptop.page.waitForTimeout(700);
  await expect(pita(laptop.page)).toHaveCount(0);
  await laptop.page.keyboard.up("Digit1");

  // Pengumuman P-39 (lewat antrean 2 detik JS-08 P-54), sesudah antrean kosong.
  const sejakUmum = () => laptop.page.evaluate(() => performance.now() - ((window as unknown as { __umum: { t: number }[] }).__umum.at(-1)?.t ?? 0));
  await expect.poll(sejakUmum, { timeout: 40_000 }).toBeGreaterThan(2500);
  const umum = await laptop.page.evaluate(() => (window as unknown as { __umum: { t: number; teks: string }[] }).__umum);
  const teksUmum = umum.map((u) => u.teks);
  const harapUmum = [
    "Dapat satu muatan Lari cepat.",
    "Dapat satu muatan Kompas kejadian.",
    "Kompas kejadian aktif selama 20 detik.",
    "Kompas kejadian selesai.",
    "Lari cepat aktif selama 6 detik.",
    "Lari cepat selesai.",
    "Dapat satu muatan Petunjuk.",
    "Petunjuk dipakai di Langkah 1.",
    `Petunjuk: ${isi(kL).langkah1.petunjuk} Satu pilihan dicoret.`,
    "Cari kotak sepatu.",
  ];
  let j = 0;
  for (const t of teksUmum) if (t === harapUmum[j]) j++;
  expect(j, `pengumuman ${JSON.stringify(teksUmum)}`).toBe(harapUmum.length);
  const selang = umum.slice(1).map((u, i) => u.t - umum[i].t);
  expect(Math.min(...selang), `selang pengumuman ${JSON.stringify(selang)}`).toBeGreaterThanOrEqual(1900);

  // ---------------------------------------------------------------- HP
  // Kotak sepatu: tangkapan layar kotak dan pita "+1 Lari cepat" (AC-25).
  const sepatuH = kotakDatar("sepatu", [...hp.diambil, sepatuL.id]);
  await pindahkan(request, hp, { x: sepatuH.x - 1, y: sepatuH.y });
  await hp.page.waitForTimeout(300);
  await hp.page.screenshot({ path: `${FOTO}/kotak-731x411.png` });
  await tahan(hp.page, "ArrowRight", 450);
  hp.diambil.push(sepatuH.id);
  await expect(pita(hp.page)).toHaveText("+1 Lari cepat");
  await expect(tombol(hp.page, "lari")).toHaveAttribute("data-muatan", "1");
  periksaPita(await tataHud(hp.page), "HP 731x411 +1 Lari cepat", 1);
  await hp.page.screenshot({ path: `${FOTO}/pita-lari-731x411.png` });
  await ambilKotak(request, hp, "kompas");
  await expect(pita(hp.page)).toHaveText("+1 Kompas");
  await expect(tombol(hp.page, "kompas")).toHaveAttribute("data-muatan", "1");

  // Kompas dengan tombol: panah, lalu HUD (bermuatan, aktif, tanpa muatan) di 731 × 411 dan 915 × 356 (AC-13, AC-25).
  const th = cariTempatKompas(titik, hp.diambil);
  await pindahkan(request, hp, th.berdiri);
  await tombol(hp.page, "kompas").tap();
  await expect(tombol(hp.page, "kompas")).toHaveAttribute("data-aktif", "ya");
  await expect(dunia(hp.page)).toHaveAttribute("data-kompas", th.arah);
  await expect(dunia(hp.page)).not.toHaveAttribute("data-kotak", "0");
  const ukurHud: Record<string, Record<string, number>> = { "1280x720": ukurLaptop };
  for (const u of [
    { width: 915, height: 356 },
    { width: 731, height: 411 },
  ]) {
    const n = `${u.width}x${u.height}`;
    await hp.page.setViewportSize(u);
    await hp.page.waitForTimeout(400);
    await expect(hp.page.locator(".js-tombol-periksa")).toBeVisible();
    ukurHud[n] = periksaHud(await tataHud(hp.page), `HP ${n}`, true);
    await hp.page.screenshot({ path: `${FOTO}/hud-skill-${n}.png` });
  }

  // Kinerja (AC-23, ambang JS-08 P-69 CPU normal): berlari bolak-balik dengan panah Kompas dan kotak di pandangan.
  await tombol(hp.page, "lari").tap();
  await expect(dunia(hp.page)).toHaveAttribute("data-lari", "ya");
  await expect(tombol(hp.page, "lari")).toHaveAttribute("aria-label", "Lari cepat, 0 muatan, sedang aktif");
  const awalHist = await histogram(hp.page);
  const t0 = Date.now();
  const contoh: Record<string, string | undefined>[] = [];
  for (const [kunci, ms] of [
    ["ArrowLeft", 600],
    ["ArrowRight", 1200],
    ["ArrowLeft", 1200],
    ["ArrowRight", 1200],
  ] as const) {
    await tahan(hp.page, kunci, ms);
    contoh.push(await dunia(hp.page).evaluate((k) => ({ kotak: (k as HTMLCanvasElement).dataset.kotak, kompas: (k as HTMLCanvasElement).dataset.kompas, lari: (k as HTMLCanvasElement).dataset.lari })));
  }
  const kinerja = { ...ringkasHistogram(awalHist, await histogram(hp.page)), detik: (Date.now() - t0) / 1000, contoh };
  await hp.page.keyboard.down("ArrowLeft");
  await hp.page.waitForTimeout(150);
  await hp.page.screenshot({ path: `${FOTO}/panah-kompas-731x411.png` });
  await hp.page.keyboard.up("ArrowLeft");
  console.log("JS09_KINERJA", JSON.stringify(kinerja));
  for (const c of contoh) {
    expect(Number(c.kotak), "kotak di pandangan selama berlari").toBeGreaterThanOrEqual(1);
    expect(c.kompas, "panah Kompas selama berlari").not.toBe("");
  }
  expect(kinerja.p95Paling, "p95").toBeLessThanOrEqual(4);
  expect(kinerja.maksPaling, "bingkai terlama").toBeLessThanOrEqual(25);
  expect(kinerja.bingkai / kinerja.detik, "bingkai per detik").toBeGreaterThanOrEqual(50);
  // Tiba di sasaran: Kompas selesai.
  await pindahkan(request, hp, { x: th.sasaran.x, y: th.sasaran.y + 1 });
  await expect(tombol(hp.page, "kompas")).toHaveAttribute("data-aktif", "tidak", { timeout: 4000 });
  await expect(dunia(hp.page)).toHaveAttribute("data-kompas", "");

  // Kotak buku; tombol Petunjuk di luar dialog: pita satu baris di HUD 731 dan dua baris di HUD 610 (P-41).
  await ambilKotak(request, hp, "buku");
  await expect(pita(hp.page)).toHaveText("+1 Petunjuk");
  await tombol(hp.page, "petunjuk").tap();
  await expect(pita(hp.page)).toHaveText("Petunjuk dipakai di Langkah 1.", { timeout: 6000 });
  periksaPita(await tataHud(hp.page), "HP 731x411 Petunjuk dipakai di Langkah 1.", 1);
  await hp.page.setViewportSize({ width: 915, height: 356 });
  await hp.page.waitForTimeout(250);
  // JS-16b (P-2): VT323 lebih sempit daripada huruf teks lama, jadi pita ini kini muat satu baris.
  periksaPita(await tataHud(hp.page), "HP 915x356 Petunjuk dipakai di Langkah 1.", 1);
  await hp.page.screenshot({ path: `${FOTO}/pita-dua-baris-915x356.png` });
  await hp.page.setViewportSize({ width: 731, height: 411 });
  await hp.page.waitForTimeout(400);

  // Dialog mode ringkas: Petunjuk di tampilan Pilihan, lalu jawaban tepat dengan +1 Kompas (P-27 sampai P-32).
  const kH = titik.map((t) => t.kejadianId).find((k) => k !== kL && k !== th.sasaran.kode)!;
  utama.kejadianHp = kH;
  await dekati(request, hp, kH, titik.find((t) => t.kejadianId === kH)!.titik[0]);
  await hp.page.locator(".js-tombol-periksa").tap();
  await expect(dialog(hp.page)).toBeVisible();
  expect(await tampilan(hp.page)).toBe("situasi1");
  await expect(petunjukDialog(hp.page)).toHaveCount(0);
  await tunggu(hp.page);
  await hp.page.getByRole("button", { name: "Lihat pilihan" }).tap();
  await expect.poll(() => tampilan(hp.page)).toBe("pilihan1");
  await expect(kakiDialog(hp.page)).toHaveText(["Tutup", "Situasi", "Petunjuk (1)", "Kunci jawaban"]);
  await periksaKaki(hp.page, "HP 731x411 pilihan1");
  await tunggu(hp.page);
  await petunjukDialog(hp.page).tap();
  const kotakPetunjukH = hp.page.getByRole("note", { name: "Petunjuk" });
  await expect(kotakPetunjukH).toHaveText(isi(kH).langkah1.petunjuk);
  await expect(hp.page.locator(".js-dialog .js-pertanyaan")).toHaveCount(0);
  await expect(petunjukDialog(hp.page)).toHaveText("Petunjuk dipakai");
  await expect(dicoret(hp.page)).toHaveCount(1);
  const coretH = (await dicoret(hp.page).locator(".js-teks-pilihan").textContent()) ?? "";
  expect(isi(kH).langkah1.opsi.find((o) => o.teks === coretH)?.benar).toBe(false);
  const luapan: Record<string, { isi: number; tampak: number; luap: number }> = { "960x540": luapan960 };
  for (const u of [
    { width: 915, height: 356 },
    { width: 731, height: 411 },
  ]) {
    const n = `${u.width}x${u.height}`;
    await hp.page.setViewportSize(u);
    await hp.page.waitForTimeout(400);
    expect(await tampilan(hp.page)).toBe("pilihan1");
    await periksaKaki(hp.page, `HP ${n} pilihan1 dengan petunjuk`);
    luapan[n] = await luapanDialog(hp.page);
    expect(luapan[n].luap, `HP ${n}: luapan`).toBeLessThanOrEqual(32);
  }
  await hp.page.screenshot({ path: `${FOTO}/dialog-petunjuk-ringkas-731x411.png` });
  // Pilihan yang dicoret tidak bisa diketuk; pilihan benar, lalu Langkah 2 tepat.
  await dicoret(hp.page).tap({ force: true });
  await expect(dicoret(hp.page)).toHaveAttribute("aria-pressed", "false");
  await expect(hp.page.locator('.js-dialog-kaki [data-aksi="kunci"]')).toHaveAttribute("aria-disabled", "true");
  await hp.page.locator(".js-dialog .js-teks-pilihan", { hasText: isi(kH).langkah1.opsi.find((o) => o.benar)!.teks }).tap();
  await hp.page.getByRole("button", { name: "Kunci jawaban" }).tap();
  await expect.poll(() => tampilan(hp.page)).toBe("umpan");
  await tunggu(hp.page);
  await hp.page.getByRole("button", { name: "Lanjut ke Langkah 2" }).tap();
  await expect.poll(() => tampilan(hp.page)).toBe("pilihan2");
  await expect(petunjukDialog(hp.page)).toHaveCount(0);
  await tunggu(hp.page);
  await hp.page.locator(".js-dialog .js-teks-pilihan", { hasText: isi(kH).langkah2.opsi.find((o) => o.tingkat === "tepat")!.teks }).tap();
  await hp.page.getByRole("button", { name: "Kunci jawaban" }).tap();
  await expect.poll(() => tampilan(hp.page)).toBe("kartu");
  await expect(hp.page.locator(".js-kartu")).toHaveAttribute("data-tingkat", "tepat");
  await expect(hp.page.locator(".js-kartu-kepala .js-kartu-skill")).toHaveText("+1 Kompas");
  await expect(hp.page.locator(".js-kartu-skill img")).toHaveCount(1);
  await hp.page.screenshot({ path: `${FOTO}/kartu-kompas-731x411.png` });
  await tunggu(hp.page);
  await hp.page.getByRole("button", { name: "Lanjut menjelajah" }).tap();
  await expect(dialog(hp.page)).toHaveCount(0);
  await expect(tombol(hp.page, "kompas")).toHaveAttribute("data-muatan", "1");

  // ---------------------------------------------------------------- HP 640 × 360, rasio 3 (dunia 640 × 360)
  // HP 640 × 360 dengan rasio 2,625 menampilkan dunia 610 × 343 (seperti 915 × 356), jadi dunia 640 × 360 diuji dengan
  // rasio 3. Pemain ini bergabung terlambat, agar pengukuran di atas berjalan dengan dua halaman saja.
  const hp3 = await gabung(browser, baseURL!, kode, "hp", 5, { ukuran: { width: 640, height: 360 }, rasio: 3 });
  await expect(tombol(hp3.page, "lari")).toHaveAttribute("data-muatan", "0");
  await ambilKotak(request, hp3, "sepatu");
  await expect(pita(hp3.page)).toHaveText("+1 Lari cepat");
  periksaPita(await tataHud(hp3.page), "HP 640x360 r3 +1 Lari cepat", 1);
  await ambilKotak(request, hp3, "kompas");
  await expect(tombol(hp3.page, "kompas")).toHaveAttribute("data-muatan", "1");
  const t3 = cariTempatKompas(titik, hp3.diambil);
  await pindahkan(request, hp3, t3.berdiri);
  await tombol(hp3.page, "kompas").tap();
  await expect(dunia(hp3.page)).toHaveAttribute("data-kompas", t3.arah);
  await expect(hp3.page.locator(".js-pita")).toHaveCount(0, { timeout: 8000 });
  ukurHud["640x360"] = periksaHud(await tataHud(hp3.page), "HP 640x360 r3", true);
  await hp3.page.screenshot({ path: `${FOTO}/hud-skill-640x360.png` });
  console.log("JS09_JARAK_HUD", JSON.stringify(ukurHud));
  await tombol(hp3.page, "petunjuk").tap({ force: true });
  await expect(pita(hp3.page)).toHaveText("Cari kotak buku.");
  periksaPita(await tataHud(hp3.page), "HP 640x360 r3 Cari kotak buku.", 1);
  await ambilKotak(request, hp3, "buku");
  await expect(tombol(hp3.page, "petunjuk")).toHaveAttribute("data-muatan", "1");
  // Dialog di dunia 640 × 360: kaki satu baris dan tanpa luapan sesudah Petunjuk dipakai (AC-11).
  const k3 = t3.sasaran.kode;
  await dekati(request, hp3, k3, { x: t3.sasaran.x, y: t3.sasaran.y });
  await expect(tombol(hp3.page, "kompas")).toHaveAttribute("data-aktif", "tidak", { timeout: 4000 });
  await hp3.page.locator(".js-tombol-periksa").tap();
  await expect(dialog(hp3.page)).toBeVisible();
  await tunggu(hp3.page);
  await hp3.page.getByRole("button", { name: "Lihat pilihan" }).tap();
  await expect.poll(() => tampilan(hp3.page)).toBe("pilihan1");
  await periksaKaki(hp3.page, "HP 640x360 r3 pilihan1");
  await tunggu(hp3.page);
  await petunjukDialog(hp3.page).tap();
  await expect(hp3.page.getByRole("note", { name: "Petunjuk" })).toHaveText(isi(k3).langkah1.petunjuk);
  await periksaKaki(hp3.page, "HP 640x360 r3 pilihan1 dengan petunjuk");
  luapan["640x360"] = await luapanDialog(hp3.page);
  console.log("JS09_LUAPAN", JSON.stringify(luapan));
  expect(luapan["640x360"].luap, "HP 640x360 r3: luapan").toBe(0);
  await tunggu(hp3.page);
  await hp3.page.getByRole("button", { name: "Tutup" }).tap();
  await expect(dialog(hp3.page)).toHaveCount(0);

  // Ronde diakhiri dari layar kelas (untuk hasil di konsol).
  expect(await kelas(request, kode, { t: "akhiri" })).toBe("selesai");
  for (const p of [laptop, hp, hp3]) {
    expect(p.catatan, p.nama).toEqual({ konsol: [], respons: [] });
    await p.ctx.close();
  }
});

test("ruang tanpa Petunjuk dan ruang tanpa skill; kurangi gerak (AC-15, AC-19)", async ({ browser, baseURL, request }) => {
  test.setTimeout(240_000);
  // Ruang tanpa Petunjuk: dua tombol di kolom laptop, tanpa kotak buku dan tanpa tombol Petunjuk di dialog.
  const kodeP = await buatRuang(request, { skillAktif: ["lari", "kompas"] });
  const a = await gabung(browser, baseURL!, kodeP, "laptop", 3, { kurangiGerak: true });
  await mulai(request, kodeP, [a]);
  const titikP = (await kejadianRuang(request, kodeP)) as Titik[];
  await expect(a.page.locator(".js-skill-butir")).toHaveCount(2);
  await expect(a.page.locator(".js-skill-kbd")).toHaveText(["1", "2"]);
  await expect(tombol(a.page, "petunjuk")).toHaveCount(0);
  const h = await tataHud(a.page);
  periksaHud(h, "laptop tanpa Petunjuk", false, 2);
  // Tombol yang tersisa turun ke bawah (P-35): Kompas di bottom 16, Lari cepat di bottom 74.
  const bawah = Object.fromEntries(h.butir.map((b) => [b.skill, Math.round(h.hud.b - b.tombol.b)]));
  expect(bawah).toEqual({ lari: 74, kompas: 16 });
  // Kotak buku tidak tergambar dan tidak terambil; tombol 3 tidak berbuat apa-apa.
  const buku = kotakDatar("buku", []);
  await pindahkan(request, a, { x: buku.x - 1, y: buku.y });
  const aktif = kampung.kotak.filter((k) => k.jenis !== "buku");
  await expect(dunia(a.page)).toHaveAttribute("data-kotak", String(kotakTampak(await kameraDari(a.page), aktif)));
  await tahan(a.page, "ArrowRight", 450);
  await a.page.keyboard.press("Digit3");
  await a.page.waitForTimeout(1200);
  await expect(pita(a.page)).toHaveCount(0);
  // Kurangi gerak: blok jeda 2 detik tampil penuh lalu hilang (P-40).
  await ambilKotak(request, a, "sepatu");
  await expect(pita(a.page)).toHaveText("+1 Lari cepat");
  await a.page.keyboard.press("Digit1");
  await expect(tombol(a.page, "lari")).toHaveAttribute("data-jeda", "ya");
  await a.page.waitForTimeout(1000);
  await expect(tombol(a.page, "lari").locator(".js-skill-jeda")).toHaveAttribute("style", /height: 100%/);
  await expect(tombol(a.page, "lari")).toHaveAttribute("data-jeda", "tidak", { timeout: 3000 });
  // Dialog tanpa tombol Petunjuk.
  const kP = titikP[0];
  await dekati(request, a, kP.kejadianId, kP.titik[0]);
  await a.page.keyboard.press("KeyE");
  await expect(dialog(a.page)).toBeVisible();
  await expect(kakiDialog(a.page)).toHaveText(["Tutup", "Kunci jawaban"]);
  await tunggu(a.page);
  await a.page.keyboard.press("Escape");
  await expect(dialog(a.page)).toHaveCount(0);

  // Ruang tanpa skill: tanpa tombol skill dan kotak; angka 1 sampai 3 diam; jawaban tepat tanpa +1 Kompas.
  const kodeN = await buatRuang(request, { skillAktif: [] });
  tanpaSkill.kode = kodeN;
  tanpaSkill.id = idDariKode(kodeN);
  const b = await gabung(browser, baseURL!, kodeN, "laptop", 4);
  await mulai(request, kodeN, [b]);
  const titikN = (await kejadianRuang(request, kodeN)) as Titik[];
  await expect(b.page.locator(".js-skill")).toHaveCount(0);
  const sepatu = kotakDatar("sepatu", []);
  await pindahkan(request, b, { x: sepatu.x - 1, y: sepatu.y });
  await b.page.waitForTimeout(700);
  await expect(dunia(b.page)).toHaveAttribute("data-kotak", "0");
  await tahan(b.page, "ArrowRight", 450);
  for (const k of ["Digit1", "Digit2", "Digit3"]) await b.page.keyboard.press(k);
  await b.page.waitForTimeout(1200);
  await expect(pita(b.page)).toHaveCount(0);
  const kN = titikN[0];
  await dekati(request, b, kN.kejadianId, kN.titik[0]);
  await b.page.keyboard.press("KeyE");
  await expect(dialog(b.page)).toBeVisible();
  await expect(kakiDialog(b.page)).toHaveText(["Tutup", "Kunci jawaban"]);
  await tunggu(b.page);
  await b.page.keyboard.press(String(await nomorPilihan(b.page, isi(kN.kejadianId).langkah1.opsi.find((o) => o.benar)!.teks)));
  await b.page.keyboard.press("Enter");
  await expect.poll(() => tampilan(b.page)).toBe("umpan");
  await tunggu(b.page);
  await b.page.keyboard.press("Enter");
  await expect.poll(() => tampilan(b.page)).toBe("langkah2");
  await tunggu(b.page);
  await b.page.keyboard.press(String(await nomorPilihan(b.page, isi(kN.kejadianId).langkah2.opsi.find((o) => o.tingkat === "tepat")!.teks)));
  await b.page.keyboard.press("Enter");
  await expect.poll(() => tampilan(b.page)).toBe("kartu");
  await expect(b.page.locator(".js-kartu")).toHaveAttribute("data-tingkat", "tepat");
  await expect(b.page.locator(".js-kartu-skill")).toHaveCount(0);
  await tunggu(b.page);
  await b.page.keyboard.press("Enter");
  await expect(dialog(b.page)).toHaveCount(0);
  expect(await kelas(request, kodeN, { t: "akhiri" })).toBe("selesai");
  for (const p of [a, b]) {
    expect(p.catatan, p.nama).toEqual({ konsol: [], respons: [] });
    await p.ctx.close();
  }
});

/** Admin baru lewat admin-awal, masuk, dan mengganti sandi sementara di peramban 1280 × 720. */
async function adminMasuk(browser: Browser, baseURL: string, request: APIRequestContext, ip: string): Promise<{ ctx: BrowserContext; page: Page }> {
  const email = `admin-skill-${Date.now()}@sekolah.sch.id`;
  const awal = await request.post("/api/admin-awal", {
    headers: { "X-Jejak-Kunci-Admin": KUNCI_ADMIN, "CF-Connecting-IP": ip },
    data: { email, sandi: "sandi sementara skill", namaTampilan: "Bu Ani" },
  });
  expect(awal.status()).toBe(200);
  const ctx = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 }, timezoneId: "Asia/Makassar" });
  const page = await ctx.newPage();
  await page.goto("/admin/");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Sandi", { exact: true }).fill("sandi sementara skill");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await page.getByLabel("Sandi baru", { exact: true }).fill("kalimat sandi admin skill");
  await page.getByLabel("Ulangi sandi baru", { exact: true }).fill("kalimat sandi admin skill");
  await page.getByRole("button", { name: "Simpan sandi" }).click();
  await expect(page.getByRole("heading", { name: "Dasbor" })).toBeVisible();
  return { ctx, page };
}

test("konsol: dasbor 48 px, kelompok Skill di dialog Ruang baru, baris Skill, tanda Petunjuk, CSV, cetak, dan layar kelas (AC-3, AC-18, AC-20, AC-25)", async ({
  browser,
  baseURL,
  request,
}) => {
  test.setTimeout(180_000);
  expect(utama.id, "ruang uji pertama").not.toBe("");
  const { ctx, page: g } = await adminMasuk(browser, baseURL!, request, "10.88.0.9");

  // Dasbor: tautan kartu "Ruang yang sedang berjalan" setinggi sedikitnya 48 px (P-48).
  const tautan = g.locator(".js-konsol-daftar-ruang a");
  await expect(tautan.first()).toBeVisible();
  const tinggi = await tautan.evaluateAll((a) => a.map((x) => x.getBoundingClientRect().height));
  for (const t of tinggi) expect(t).toBeGreaterThanOrEqual(48);

  // Dialog Ruang baru: kelompok Skill dengan tiga kotak centang tercentang, ikon, dan keterangan (P-7, P-8).
  await g.getByRole("link", { name: "Ruang" }).first().click();
  await g.getByRole("button", { name: "+ Ruang baru" }).click();
  const d = g.getByRole("dialog", { name: "Ruang baru" });
  const kelompok = d.getByRole("group", { name: "Skill" });
  await expect(kelompok).toBeVisible();
  for (const s of SKILL) await expect(kelompok.getByRole("checkbox", { name: NAMA[s] })).toBeChecked();
  await expect(kelompok.locator(".js-konsol-centang img")).toHaveCount(3);
  await expect(kelompok.getByText("Hapus centang untuk mematikan skill di ruang ini.")).toBeVisible();
  for (const t of await kelompok.locator(".js-konsol-centang").evaluateAll((l) => l.map((x) => x.getBoundingClientRect().height))) expect(t).toBeGreaterThanOrEqual(48);
  await d.getByLabel("Label kelas", { exact: true }).fill("IX C");
  await kelompok.getByRole("checkbox", { name: "Petunjuk" }).uncheck();
  await g.screenshot({ path: `${FOTO}/konsol-ruang-baru-1280x720.png` });
  const [kirim] = await Promise.all([
    g.waitForRequest((r) => r.method() === "POST" && new URL(r.url()).pathname === "/api/ruang"),
    d.getByRole("button", { name: "Buat ruang" }).click(),
  ]);
  expect((JSON.parse(kirim.postData() ?? "{}") as { skillAktif?: unknown }).skillAktif).toEqual(["lari", "kompas"]);
  await expect(g.getByText(/Ruang [A-Z0-9]{5} dibuat\./)).toBeVisible();
  const idBaru = /^#\/ruang\/([^/]+)$/.exec(new URL(g.url()).hash)?.[1] ?? "";
  expect(idBaru).not.toBe("");
  catatRuang(idBaru);
  await expect(g.locator('[data-baris="skill"]')).toHaveText("Skill Lari cepat, Kompas kejadian");

  // Hasil ruang uji pertama: baris Skill sesudah Durasi, tanda Petunjuk di rincian, CSV kolom ke-18 (P-9, P-45 sampai P-47).
  await g.goto(`/admin/#/ruang/${utama.id}`);
  await expect(g.locator('[data-baris="skill"]')).toHaveText("Skill Lari cepat, Kompas kejadian, Petunjuk");
  const bagian = g.getByRole("region", { name: "Hasil ronde" });
  const istilah = bagian.locator(".js-hasil-ringkasan dt");
  await expect(istilah.nth(0)).toBeVisible();
  const daftarIstilah = await istilah.allTextContents();
  expect(daftarIstilah.indexOf("Skill")).toBe(daftarIstilah.indexOf("Durasi") + 1);
  await expect(bagian.locator(".js-hasil-ringkasan div", { hasText: "Skill" })).toContainText("Lari cepat, Kompas kejadian, Petunjuk");
  const rincian = bagian.getByRole("button", { name: `Rincian jawaban ${utama.namaHp}` });
  await rincian.click();
  const tanda = bagian.locator('.js-hasil-rincian .js-hasil-tanda[data-jenis="petunjuk"]');
  await expect(tanda).toHaveCount(1);
  await expect(tanda).toHaveText("Petunjuk");
  await expect(tanda.locator("img")).toHaveCount(1);
  await expect(bagian.locator(".js-hasil-rincian tr", { has: g.locator('.js-hasil-tanda[data-jenis="petunjuk"]') })).toContainText(utama.kejadianHp);
  await g.screenshot({ path: `${FOTO}/konsol-hasil-1280x720.png`, fullPage: true });
  // Cetak: baris Skill di kepala ruang dan di ringkasan tidak ikut dicetak (P-9).
  await g.emulateMedia({ media: "print" });
  await expect(g.locator('[data-baris="skill"]')).toBeHidden();
  await expect(bagian.locator('.js-hasil-ringkasan [data-cetak="tidak"]')).toBeHidden();
  await expect(bagian.locator(".js-hasil-ringkasan div", { hasText: "Durasi" })).toBeVisible();
  await g.emulateMedia({ media: "screen" });
  // CSV jawaban: 18 kolom, kolom terakhir "Petunjuk dipakai" bernilai Ya untuk setiap jawaban ruang ini (ketiga pemain
  // memakai Petunjuk), dan Tidak di ruang tanpa skill.
  const csv = async (tujuan: string) => {
    await g.goto(`/admin/#/ruang/${tujuan}`);
    const [u] = await Promise.all([g.waitForEvent("download"), g.getByRole("region", { name: "Hasil ronde" }).getByRole("button", { name: "Unduh CSV jawaban" }).click()]);
    const baris = readFileSync((await u.path()) as string).subarray(3).toString("utf8").split("\r\n").filter((x) => x !== "");
    return baris.map((x) => x.split(";"));
  };
  const jawaban = await csv(utama.id);
  expect(jawaban[0].length).toBe(18);
  expect(jawaban[0][17]).toBe("Petunjuk dipakai");
  const kolom18 = jawaban.slice(1).map((r) => r[17]);
  expect(kolom18.length).toBeGreaterThanOrEqual(2);
  expect([...new Set(kolom18)]).toEqual(["Ya"]);
  const jawabanN = await csv(tanpaSkill.id);
  expect(jawabanN.slice(1).map((r) => r[17])).toEqual(["Tidak"]);

  // Layar kelas tanpa perubahan (AGENTS 4.4): podium ruang uji pertama.
  const kelasPage = await ctx.newPage();
  await kelasPage.goto(`/admin/#/kelas/${utama.id}`);
  await expect(kelasPage.getByText("Ronde selesai · Ruang uji")).toBeVisible();
  await expect(kelasPage.locator(".js-kelas-tiang-1")).toContainText(utama.namaHp);
  for (const u of [
    { width: 1024, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    await kelasPage.setViewportSize(u);
    await kelasPage.waitForTimeout(300);
    await kelasPage.screenshot({ path: `${FOTO}/kelas-${u.width}x${u.height}.png` });
  }
  await ctx.close();
});

test("pratinjau penyunting: Petunjuk (2), kalimat dan coretan, Petunjuk dipakai, kalimat kosong, dan Mulai ulang (AC-17)", async ({ browser, baseURL, request }) => {
  test.setTimeout(120_000);
  const { ctx, page: g } = await adminMasuk(browser, baseURL!, request, "10.88.0.10");
  await g.goto("/admin/#/kejadian/K-01");
  const kolom = g.getByLabel("Kalimat petunjuk", { exact: true });
  await expect(kolom).toBeVisible();
  const asli = await kolom.inputValue();
  const p = g.frameLocator("iframe[title='Pratinjau']");
  /** Dialog pratinjau (mode ringkas) baru dimulai di tampilan Situasi: lanjut ke tampilan Pilihan. */
  const lihatPilihan = async () => {
    await expect(p.locator(".js-dialog")).toHaveAttribute("data-tampilan", "situasi1");
    await g.waitForTimeout(700);
    await p.getByRole("button", { name: "Lihat pilihan" }).click();
    await expect(p.locator(".js-dialog")).toHaveAttribute("data-tampilan", "pilihan1");
    await g.waitForTimeout(700);
  };
  const tombolP = p.locator('.js-dialog-kaki [data-aksi="petunjuk"]');
  // Pratinjau mendatar 731 × 411 (layar HP saat bermain): mode ringkas, Petunjuk di tampilan Pilihan.
  await g.getByRole("button", { name: "Mendatar" }).click();
  await expect(g.locator("iframe[title='Pratinjau']")).toHaveAttribute("width", "731");
  await expect(p.locator(".js-dialog")).toBeVisible();
  await g.waitForTimeout(500);
  await lihatPilihan();
  await expect(tombolP).toHaveText("Petunjuk (2)");
  await tombolP.click();
  await expect(tombolP).toHaveText("Petunjuk dipakai");
  await expect(p.getByRole("note", { name: "Petunjuk" })).toHaveText(isi("K-01").langkah1.petunjuk);
  // Pilihan keliru pertama menurut urutan asli A sampai D (D-3a).
  await expect(p.locator('[data-dicoret="ya"] .js-teks-pilihan')).toHaveText(isi("K-01").langkah1.opsi.find((o) => !o.benar)!.teks);
  await g.locator(".js-pratinjau-panel").screenshot({ path: `${FOTO}/konsol-pratinjau-petunjuk.png` });
  // Mulai ulang: muatan tiruan dan dialog kembali ke awal.
  await g.getByRole("button", { name: "Mulai ulang" }).click();
  await lihatPilihan();
  await expect(tombolP).toHaveText("Petunjuk (2)");
  await expect(p.locator('[data-dicoret="ya"]')).toHaveCount(0);
  // Isi baru dari konsol juga mengembalikan dialog ke awal. Kalimat petunjuk kosong: tanpa kotak petunjuk, tetapi
  // pilihan tetap dicoret.
  await tombolP.click();
  await expect(tombolP).toHaveText("Petunjuk dipakai");
  await kolom.fill("");
  await lihatPilihan();
  await expect(tombolP).toHaveText("Petunjuk (2)");
  await tombolP.click();
  await expect(tombolP).toHaveText("Petunjuk dipakai");
  await expect(p.locator(".js-kotak-petunjuk")).toHaveCount(0);
  await expect(p.locator('[data-dicoret="ya"]')).toHaveCount(1);
  // Kalimat asli dikembalikan tanpa menyimpan.
  await kolom.fill(asli);
  await ctx.close();
});
