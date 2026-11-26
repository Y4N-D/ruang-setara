// Uji ujung ke ujung JS-23 (peta bermedan): peta mini dan peta besar memakai gambar medan menurut rasio layar, dengan
// cadangan warna zona, label zona di sudut, dan urutan lapisan; peta kelas memakai gambar medan dengan titik pemain
// bergaris ganda dan latar cadangan mist (spesifikasi JS-23, AC-2 sampai AC-10 dan AC-16). Tangkapan layar ditulis ke
// docs/jejak-setara/tests/JS-23/.
import { mkdirSync, readFileSync } from "node:fs";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { buatRuang, EMAIL, idDariKode, kelas, SANDI, tajukKonsol, tutupRuangBerkas } from "./ruang-uji";

test.afterAll(tutupRuangBerkas);

const FOTO = "docs/jejak-setara/tests/JS-23";
mkdirSync(FOTO, { recursive: true });
type Titik = { x: number; y: number };
type Zona = { id: string; kiri: number; atas: number; kanan: number; bawah: number };
const PETA = JSON.parse(readFileSync(new URL("../../app/jejak-setara/peta/kampung.json", import.meta.url), "utf8")) as { zona: Zona[]; halte: Titik[]; titikMuncul: Titik[] };
/** Titik yang dijauhi pemeriksaan piksel: halte (ikon) dan titik muncul (panah diri dan kejadian yang sudah terlihat). */
const JAUH = [...PETA.halte.map((h) => ({ x: h.x, y: h.y, r: 6 })), ...PETA.titikMuncul.map((t) => ({ x: t.x, y: t.y, r: 18 }))];
const PILIH_MINI = ".js-peta-mini canvas";
const PILIH_BESAR = ".js-peta-besar-isi canvas";

async function pemain(browser: Browser, baseURL: string, ukuran: { width: number; height: number }, rasio: number, hp: boolean) {
  const ctx = await browser.newContext({ baseURL, viewport: ukuran, deviceScaleFactor: rasio, timezoneId: "Asia/Makassar", ...(hp ? { isMobile: true, hasTouch: true } : {}) });
  const page = await ctx.newPage();
  const medan: string[] = [];
  const galat: string[] = [];
  page.on("request", (r) => {
    const m = /peta_medan_(\d)/.exec(r.url());
    if (m) medan.push(m[1]);
  });
  page.on("pageerror", (e) => galat.push(e.message));
  return { ctx, page, medan, galat };
}

async function gabung(page: Page, kode: string, avatar: number): Promise<void> {
  await page.goto(`/?kode=${kode}`);
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible({ timeout: 20_000 });
  await page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first().click();
  await page.getByRole("radio", { name: `Avatar ${avatar}` }).click();
  await page.getByRole("button", { name: "Gabung" }).click();
  await expect(page.getByRole("heading", { name: "Lobi" })).toBeVisible();
}

/**
 * AC-3 dan AC-6: untuk sel yang bloknya dan kedelapan tetangganya satu warna di gambar sumber, piksel kanvas di tengah
 * sel harus berwarna sama. Mengembalikan jumlah sel yang diperiksa, yang cocok, yang beraspal, dan contoh yang salah.
 */
async function bandingkanMedan(page: Page, pilih: string, n: number, mini: boolean) {
  return page.evaluate(
    async ({ pilih, n, mini, jauh }) => {
      const url = performance
        .getEntriesByType("resource")
        .map((e) => e.name)
        .find((u) => u.includes(`peta_medan_${n}`));
      if (!url) return { diperiksa: 0, cocok: 0, aspal: 0, salah: ["tanpa url"] };
      const img = new Image();
      img.src = url;
      await img.decode();
      const k = document.createElement("canvas");
      k.width = img.width;
      k.height = img.height;
      const c = k.getContext("2d") as CanvasRenderingContext2D;
      c.drawImage(img, 0, 0);
      const s = c.getImageData(0, 0, k.width, k.height).data;
      const w = (x: number, y: number) => {
        const i = (y * k.width + x) * 4;
        return (s[i] << 16) | (s[i + 1] << 8) | s[i + 2];
      };
      const tujuan = document.querySelector(pilih) as HTMLCanvasElement;
      const t = (tujuan.getContext("2d") as CanvasRenderingContext2D).getImageData(0, 0, tujuan.width, tujuan.height).data;
      const skala = mini ? 0.7 * devicePixelRatio : tujuan.width / 160;
      const dy = mini ? Math.round(2.5 * devicePixelRatio) : 0;
      let diperiksa = 0;
      let cocok = 0;
      let aspal = 0;
      const salah: string[] = [];
      for (let uy = 2; uy < 98; uy += 3) {
        for (let ux = 2; ux < 158; ux += 3) {
          if (jauh.some((p) => Math.hypot(p.x - ux, p.y - uy) < p.r)) continue;
          const warna = w(ux * n, uy * n);
          let rata = true;
          for (let y = (uy - 1) * n; y < (uy + 2) * n && rata; y++) {
            for (let x = (ux - 1) * n; x < (ux + 2) * n; x++) {
              if (w(x, y) !== warna) {
                rata = false;
                break;
              }
            }
          }
          if (!rata) continue;
          const i = ((dy + Math.floor((uy + 0.5) * skala)) * tujuan.width + Math.floor((ux + 0.5) * skala)) * 4;
          const v = (t[i] << 16) | (t[i + 1] << 8) | t[i + 2];
          diperiksa++;
          if (v === warna) cocok++;
          else if (salah.length < 5) salah.push(`${ux},${uy}: ${v.toString(16)} bukan ${warna.toString(16)}`);
        }
      }
      // Jalan aspal selebar 2 ubin: blok 2 × 2 ubin yang seluruhnya aspal di sumber, diperiksa di titik sudut bersamanya.
      for (let uy = 1; uy < 98 && aspal < 10; uy++) {
        for (let ux = 1; ux < 158 && aspal < 10; ux++) {
          if (jauh.some((p) => Math.hypot(p.x - ux, p.y - uy) < p.r)) continue;
          let semua = true;
          for (let y = uy * n; y < (uy + 2) * n && semua; y++) for (let x = ux * n; x < (ux + 2) * n; x++) if (w(x, y) !== 0x6b7a99) semua = false;
          if (!semua) continue;
          const i = ((dy + Math.floor((uy + 1) * skala)) * tujuan.width + Math.floor((ux + 1) * skala)) * 4;
          const v = (t[i] << 16) | (t[i + 1] << 8) | t[i + 2];
          if (v === 0x6b7a99) aspal++;
          else if (salah.length < 5) salah.push(`aspal ${ux},${uy}: ${v.toString(16)}`);
          ux += 3;
        }
      }
      return { diperiksa, cocok, aspal, salah };
    },
    { pilih, n, mini, jauh: JAUH },
  );
}

async function warnaKanvas(page: Page, pilih: string, ux: number, uy: number, mini: boolean): Promise<string> {
  return page.evaluate(
    ({ pilih, ux, uy, mini }) => {
      const k = document.querySelector(pilih) as HTMLCanvasElement;
      const skala = mini ? 0.7 * devicePixelRatio : k.width / 160;
      const dy = mini ? Math.round(2.5 * devicePixelRatio) : 0;
      const d = (k.getContext("2d") as CanvasRenderingContext2D).getImageData(Math.floor((ux + 0.5) * skala), dy + Math.floor((uy + 0.5) * skala), 1, 1).data;
      return `#${[d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
    },
    { pilih, ux, uy, mini },
  );
}

/** AC-7: letak label di sudut zona, di dalam zonanya, tidak bertumpuk, dan halte di atas label. */
async function periksaLabel(page: Page) {
  return page.evaluate((zona) => {
    const isi = document.querySelector(".js-peta-besar-isi") as HTMLElement;
    const ri = isi.getBoundingClientRect();
    const s = ri.width / 160;
    const kotak = [...isi.querySelectorAll(".js-label-zona")].map((e) => {
      const b = e.getBoundingClientRect();
      return { x0: b.left - ri.left, y0: b.top - ri.top, x1: b.right - ri.left, y1: b.bottom - ri.top };
    });
    const salah: string[] = [];
    kotak.forEach((b, i) => {
      const z = zona[i];
      if (Math.abs(b.x0 - (z.kiri * s + 3)) > 0.5 || Math.abs(b.y0 - (z.atas * s + 3)) > 0.5) salah.push(`${z.id} letak ${b.x0},${b.y0}`);
      if (b.x1 > (z.kanan + 1) * s + 0.5 || b.y1 > (z.bawah + 1) * s + 0.5) salah.push(`${z.id} keluar zona`);
      kotak.forEach((c, j) => {
        if (j > i && b.x0 < c.x1 && c.x0 < b.x1 && b.y0 < c.y1 && c.y0 < b.y1) salah.push(`${z.id} bertumpuk dengan ${zona[j].id}`);
      });
    });
    const halte = isi.querySelector(".js-peta-halte") as HTMLElement;
    const h = halte.getBoundingClientRect();
    const di = document.elementFromPoint(h.left + h.width / 2, h.top + h.height / 2);
    const z = (sel: string) => getComputedStyle(isi.querySelector(sel) as Element).zIndex;
    return { s, jumlah: kotak.length, salah, halteDiAtas: di === halte, zIndex: [z(".js-label-zona"), z(".js-peta-halte"), z(".js-kamu")] };
  }, PETA.zona);
}

async function ukuranPetaBesar(page: Page, lebar: number): Promise<void> {
  await expect.poll(() => page.locator(PILIH_BESAR).evaluate((k) => (k as HTMLCanvasElement).clientWidth), { timeout: 10_000 }).toBe(lebar);
}

test("peta mini dan peta besar bermedan menurut rasio, cadangan warna zona, label zona di sudut, dan urutan lapisan (JS-23 AC-2 sampai AC-7, AC-16)", async ({
  browser,
  baseURL,
  request,
}) => {
  test.setTimeout(240_000);
  const asal = baseURL as string;
  const kode = await buatRuang(request);
  const hp = await pemain(browser, asal, { width: 731, height: 411 }, 2.625, true);
  const hp3 = await pemain(browser, asal, { width: 640, height: 360 }, 3, true);
  const laptop = await pemain(browser, asal, { width: 1280, height: 720 }, 1, false);
  const cadangan = await pemain(browser, asal, { width: 1280, height: 720 }, 1, false);
  await cadangan.page.route(/peta_medan_\d/, (r) => r.abort());
  // P-11: medan4 baru tiba sesudah peta besar terbuka.
  let lepasMedan4 = () => {};
  const tahan = new Promise<void>((ok) => (lepasMedan4 = ok));
  const tunda = await pemain(browser, asal, { width: 1280, height: 720 }, 1, false);
  await tunda.page.route(/peta_medan_4/, async (r) => {
    await tahan;
    await r.continue();
  });
  // AC-2 dan P-4: gambar mulai dimuat di lobi, sesuai rasio, tanpa menahan tombol Masuk (juga saat gambar gagal).
  for (const [i, p] of [hp, hp3, laptop, cadangan, tunda].entries()) await gabung(p.page, kode, (i % 8) + 1);
  await expect.poll(() => [...hp.medan].sort().join()).toBe("2,4");
  await expect.poll(() => [...hp3.medan].sort().join()).toBe("2,4");
  await expect.poll(() => [...laptop.medan].sort().join()).toBe("1,4");
  expect(await kelas(request, kode, { t: "mulai" })).toBe("hitung_mundur");
  for (const p of [hp, hp3, laptop, cadangan, tunda]) await expect(p.page.locator(PILIH_MINI)).toBeVisible({ timeout: 15_000 });
  expect([...hp.medan].sort().join()).toBe("2,4");
  expect([...laptop.medan].sort().join()).toBe("1,4");

  // AC-3: peta mini bermedan di HP rasio 2,625 dan 3 serta laptop rasio 1.
  for (const [p, n] of [
    [hp, 2],
    [hp3, 2],
    [laptop, 1],
  ] as const) {
    await expect.poll(async () => (await bandingkanMedan(p.page, PILIH_MINI, n, true)).salah.join("; "), { timeout: 10_000 }).toBe("");
    const h = await bandingkanMedan(p.page, PILIH_MINI, n, true);
    expect(h.diperiksa, "sel yang diperiksa").toBeGreaterThanOrEqual(20);
    expect(h.cocok).toBe(h.diperiksa);
    expect(h.aspal, "sel aspal").toBeGreaterThan(0);
  }
  await hp.page.locator(".js-peta-mini").screenshot({ path: `${FOTO}/mini-hp-731x411.png` });
  await hp3.page.locator(".js-peta-mini").screenshot({ path: `${FOTO}/mini-hp-640x360-r3.png` });
  await laptop.page.locator(".js-peta-mini").screenshot({ path: `${FOTO}/mini-laptop-1280x720.png` });

  // AC-5: cadangan warna zona tanpa pesan (Z5 Balai warga di tengah zonanya, wood).
  await expect.poll(() => warnaKanvas(cadangan.page, PILIH_MINI, 26, 81, true)).toBe("#C98B4F");
  await cadangan.page.locator(".js-peta-mini").click();
  await expect(cadangan.page.locator(".js-peta-besar")).toBeVisible();
  expect(await warnaKanvas(cadangan.page, PILIH_BESAR, 26, 81, false)).toBe("#C98B4F");
  await cadangan.page.screenshot({ path: `${FOTO}/besar-cadangan-1280x720.png` });
  // AC-6 (P-11): peta besar yang sudah terbuka berganti dari zona berwarna ke medan begitu medan4 tiba, tanpa ditutup.
  await tunda.page.locator(".js-peta-mini").click();
  await expect(tunda.page.locator(".js-peta-besar")).toBeVisible();
  expect(await warnaKanvas(tunda.page, PILIH_BESAR, 26, 81, false)).toBe("#C98B4F");
  lepasMedan4();
  await expect.poll(async () => (await bandingkanMedan(tunda.page, PILIH_BESAR, 4, false)).salah.join("; "), { timeout: 10_000 }).toBe("");
  await expect(tunda.page.locator(".js-peta-besar")).toBeVisible();

  // AC-6 dan AC-7: peta besar di HP 731 × 411 (skala 3) dan dunia 610 × 343 (skala 2).
  await hp.page.locator(".js-peta-mini").tap();
  await expect(hp.page.locator(".js-peta-besar")).toBeVisible();
  for (const [ukuran, lebar, nama] of [
    [{ width: 731, height: 411 }, 480, "besar-hp-731x411"],
    [{ width: 640, height: 360 }, 320, "besar-hp-610x343"],
  ] as const) {
    await hp.page.setViewportSize(ukuran);
    await ukuranPetaBesar(hp.page, lebar);
    const m = await bandingkanMedan(hp.page, PILIH_BESAR, 4, false);
    expect(m.salah, nama).toEqual([]);
    expect(m.diperiksa).toBeGreaterThanOrEqual(20);
    const l = await periksaLabel(hp.page);
    expect(l.salah, nama).toEqual([]);
    expect([l.jumlah, l.halteDiAtas, ...l.zIndex]).toEqual([8, true, "1", "2", "3"]);
    await hp.page.screenshot({ path: `${FOTO}/${nama}.png` });
  }
  // HP 640 × 360 rasio 3 (skala 2): label Z1 dan Z3 terbungkus tanpa bertumpuk.
  await hp3.page.locator(".js-peta-mini").tap();
  await ukuranPetaBesar(hp3.page, 320);
  expect((await periksaLabel(hp3.page)).salah).toEqual([]);
  // Laptop 1280 × 720 (skala 6), 1024 × 768 (skala 4), dan 1920 × 1080 (skala 9).
  await laptop.page.locator(".js-peta-mini").click();
  await expect(laptop.page.locator(".js-peta-besar")).toBeVisible();
  for (const [ukuran, lebar, nama] of [
    [{ width: 1280, height: 720 }, 960, "besar-1280x720"],
    [{ width: 1024, height: 768 }, 640, "besar-1024x768"],
    [{ width: 1920, height: 1080 }, 1440, "besar-1920x1080"],
  ] as const) {
    await laptop.page.setViewportSize(ukuran);
    await ukuranPetaBesar(laptop.page, lebar);
    const m = await bandingkanMedan(laptop.page, PILIH_BESAR, 4, false);
    expect(m.salah, nama).toEqual([]);
    expect(m.diperiksa).toBeGreaterThanOrEqual(20);
    const l = await periksaLabel(laptop.page);
    expect(l.salah, nama).toEqual([]);
    expect([l.jumlah, l.halteDiAtas, ...l.zIndex]).toEqual([8, true, "1", "2", "3"]);
    await laptop.page.screenshot({ path: `${FOTO}/${nama}.png` });
  }
  // Peta besar tetap ditutup dengan Esc, lalu pemain kembali ke dunia (JS-07 P-39).
  await laptop.page.keyboard.press("Escape");
  await expect(laptop.page.locator(".js-peta-besar")).toHaveCount(0);
  for (const p of [hp, hp3, laptop, cadangan, tunda]) expect(p.galat).toEqual([]);
  for (const p of [hp, hp3, laptop, cadangan, tunda]) await p.ctx.close();
});

test("peta kelas bermedan: gambar tanpa penghalusan, ikon zona, titik pemain bergaris ganda, dan latar cadangan mist (JS-23 AC-2, AC-8 sampai AC-10, AC-16)", async ({
  browser,
  baseURL,
  request,
}) => {
  test.setTimeout(240_000);
  const asal = baseURL as string;
  const kode = await buatRuang(request);
  await tajukKonsol(request);
  const masuk = async () => {
    const ctx = await browser.newContext({ baseURL: asal, viewport: { width: 1280, height: 720 } });
    const g = await ctx.newPage();
    const medan: string[] = [];
    const gagal: string[] = [];
    const galat: string[] = [];
    g.on("request", (r) => {
      if (r.url().includes("peta_medan")) medan.push(r.url());
    });
    g.on("requestfailed", (r) => {
      if (r.url().includes("peta_medan")) gagal.push(r.url());
    });
    g.on("pageerror", (e) => galat.push(e.message));
    await g.goto("/admin/");
    await g.getByLabel("Email", { exact: true }).fill(EMAIL);
    await g.getByLabel("Sandi", { exact: true }).fill(SANDI);
    await g.getByRole("button", { name: "Masuk", exact: true }).click();
    await expect(g.getByRole("heading", { name: "Dasbor" })).toBeVisible();
    return { ctx, g, medan, gagal, galat };
  };
  const guru = await masuk();
  const g = guru.g;
  // AC-2: konsol tanpa layar kelas tidak memuat gambar medan; layar kelas memuatnya sekali di lobi.
  expect(guru.medan).toEqual([]);
  await g.goto(`/admin/#/kelas/${idDariKode(kode)}`);
  await expect(g.locator(".js-kelas-kode")).toHaveText(kode);
  await expect.poll(() => guru.medan.filter((u) => u.includes("peta_medan_4")).length).toBe(1);
  expect(guru.medan.every((u) => u.includes("peta_medan_4"))).toBe(true);

  const tiga = await Promise.all([1, 2, 3].map(() => pemain(browser, asal, { width: 1280, height: 720 }, 1, false)));
  for (const [i, p] of tiga.entries()) await gabung(p.page, kode, i + 1);
  await expect(g.locator(".js-kelas-daftar li")).toHaveCount(3);
  await g.getByRole("button", { name: /Mulai/ }).click();
  const peta = g.locator(".js-kelas-peta");
  await expect(peta).toBeVisible({ timeout: 15_000 });
  // AC-8: gambar medan tanpa penghalusan, delapan ikon zona di sudut, tanpa kotak zona dan tanpa letak kejadian.
  const medan = peta.locator("image.js-kelas-medan");
  await expect(medan).toHaveAttribute("href", /peta_medan_4/);
  expect(await medan.evaluate((e) => getComputedStyle(e).imageRendering)).toBe("pixelated");
  await expect(peta.locator("image.js-kelas-ikon-zona")).toHaveCount(8);
  await expect(peta.locator(".js-kelas-zona")).toHaveCount(0);
  await expect(peta.locator('[class*="kejadian"]')).toHaveCount(0);
  await expect(peta).toHaveAttribute("aria-label", "Peta kampung dengan 3 pemain. Letak kejadian tidak ditampilkan.");
  // AC-9: titik 3 × 3 ubin berwarna tas dengan garis white 2 px di depan dan ink 5 px di belakang, bertebal tetap.
  await expect(peta.locator("g.js-kelas-titik")).toHaveCount(3);
  const gaya = await peta
    .locator("g.js-kelas-titik")
    .first()
    .evaluate((el) => {
      const [luar, isi] = [...el.querySelectorAll("rect")].map((r) => getComputedStyle(r));
      return { luar: [luar.fill, luar.stroke, luar.strokeWidth, luar.vectorEffect], isi: [isi.stroke, isi.strokeWidth, isi.vectorEffect, isi.fill !== "none"] };
    });
  expect(gaya.luar).toEqual(["none", "rgb(31, 42, 68)", "5px", "non-scaling-stroke"]);
  expect(gaya.isi).toEqual(["rgb(255, 255, 255)", "2px", "non-scaling-stroke", true]);
  const ukuranTitik: string[] = [];
  for (const [ukuran, nama] of [
    [{ width: 1280, height: 720 }, "kelas-1280x720"],
    [{ width: 1024, height: 768 }, "kelas-1024x768"],
    [{ width: 1920, height: 1080 }, "kelas-1920x1080"],
  ] as const) {
    await g.setViewportSize(ukuran);
    await g.waitForTimeout(600);
    const u = await peta.evaluate((svg) => {
      const b = svg.getBoundingClientRect();
      const tepi = parseFloat(getComputedStyle(svg).borderLeftWidth);
      const pxPerUbin = (b.width - 2 * tepi) / 160;
      const titik = (svg.querySelector("g.js-kelas-titik rect.js-kelas-titik-isi") as SVGRectElement).getBoundingClientRect().width;
      return { pxPerUbin, titik };
    });
    expect(Math.abs(u.titik - 3 * u.pxPerUbin), nama).toBeLessThan(1);
    ukuranTitik.push(`${nama}: ${u.titik.toFixed(1)} px (${u.pxPerUbin.toFixed(2)} px per ubin)`);
    await g.screenshot({ path: `${FOTO}/${nama}.png` });
  }
  test.info().annotations.push({ type: "ukuran titik", description: ukuranTitik.join("; ") });
  test.info().annotations.push({ type: "permintaan peta_medan_4 layar kelas", description: String(guru.medan.length) });
  expect(guru.galat).toEqual([]);

  // AC-10: gambar medan gagal dimuat, peta kelas berlatar mist dengan ikon zona dan titik, tanpa galat halaman.
  const cadangan = await masuk();
  await cadangan.g.route(/peta_medan_\d/, (r) => r.abort());
  await cadangan.g.goto(`/admin/#/kelas/${idDariKode(kode)}`);
  const petaCadangan = cadangan.g.locator(".js-kelas-peta");
  await expect(petaCadangan).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => cadangan.gagal.length).toBeGreaterThan(0);
  expect(await petaCadangan.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgb(201, 212, 229)");
  await expect(petaCadangan.locator("image.js-kelas-ikon-zona")).toHaveCount(8);
  await expect(petaCadangan.locator("g.js-kelas-titik")).toHaveCount(3);
  await cadangan.g.screenshot({ path: `${FOTO}/kelas-cadangan-1280x720.png` });
  expect(cadangan.galat).toEqual([]);
  for (const p of tiga) await p.ctx.close();
  await cadangan.ctx.close();
  await guru.ctx.close();
});
