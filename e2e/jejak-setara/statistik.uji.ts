// Halaman Statistik dan dasbor JS-13 di peramban (spesifikasi JS-13, rencana uji "Uji ujung ke ujung"; AC-1, AC-8 sampai
// AC-10, AC-12). Data halaman Statistik untuk admin diganti jawaban API tiruan 18 versi (pola uji cetak JS-11), agar
// tata letak dan urutan diuji dengan data yang banyak; guru memakai API sungguhan (belum punya ruang: keadaan kosong).
import { mkdirSync } from "node:fs";
import { expect, test, type APIRequestContext, type Browser, type Page } from "@playwright/test";
import { tajukKonsol } from "./ruang-uji";

const FOTO = "docs/jejak-setara/tests/JS-13";
const KUNCI_ADMIN = "lokal-kunci-admin-bukan-rahasia";
const ZONA = "Asia/Makassar";
const UKURAN = [
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 1920, height: 1080 },
  { width: 360, height: 640 },
];

type Baris = Record<string, unknown> & { kode: string; versi: number; dijawab: number; selesai: number; indeksKesulitan: number | null };

/** 16 kejadian versi 1 ditambah versi 2 untuk K-03 dan K-13; K-05 punya data sedikit dan K-07 paling sulit. */
function dataTiruan(): { cakupan: { ruang: number; pemain: number; jawaban: number }; kejadian: Baris[]; paket: { id: string; nama: string }[] } {
  const kejadian: Baris[] = [];
  const satu = (n: number) => Math.round(n * 10) / 10;
  for (const [n, versi] of [...Array.from({ length: 16 }, (_, i) => [i + 1, 1]), [3, 2], [13, 2]] as [number, number][]) {
    const dijawab = n === 5 ? 6 : 700 + n * 37 + versi * 11;
    const f = n === 7 ? 0.2 : 0.45 + ((n * 7) % 10) / 20;
    const benar = Math.floor(dijawab * f);
    const w1 = Math.floor((dijawab - benar) * 0.5);
    const w2 = Math.floor((dijawab - benar) * 0.3);
    const w3 = dijawab - benar - w1 - w2;
    const selesai = n === 5 ? 5 : dijawab - Math.floor(dijawab * 0.06);
    const tepat = Math.floor(selesai * (n === 7 ? 0.3 : 0.55));
    const kurang = Math.floor(selesai * 0.28);
    const berisiko = selesai - tepat - kurang;
    const penuh = Math.floor(tepat * f);
    const kode = `K-${String(n).padStart(2, "0")}`;
    kejadian.push({
      kode,
      judul: `Kejadian contoh ${n}${versi === 2 ? " (perbaikan)" : ""}`,
      zona: `z${Math.ceil(n / 2)}`,
      versi,
      pertanyaan1: "Hak siapa yang paling terganggu di sini?",
      pertanyaan2: "Apa yang kamu lakukan?",
      dijawab,
      selesai,
      benar1: benar,
      ketepatan1: satu((benar / dijawab) * 100),
      pilihan1: [
        { id: "1a", teks: "Hak orang yang paling dirugikan untuk dilayani dengan adil", benar: true, n: benar },
        { id: "1b", teks: "Hak teman untuk pulang lebih cepat", benar: false, n: w1 },
        { id: "1c", teks: "Hak petugas untuk beristirahat", benar: false, n: w2 },
        { id: "1d", teks: "Hak pengunjung untuk memilih tempat lain", benar: false, n: w3 },
      ],
      pilihan2: [
        { id: "2a", teks: "Ikut melanggar karena antrean terlalu lama", tingkat: "berisiko", n: berisiko },
        { id: "2b", teks: "Menolak, mengajak kembali, lalu memberi tahu petugas", tingkat: "tepat", n: tepat },
        { id: "2c", teks: "Tetap tertib, tetapi diam saja", tingkat: "kurang", n: kurang },
      ],
      tingkat: { tepat: satu((tepat / selesai) * 100), kurang: satu((kurang / selesai) * 100), berisiko: satu((berisiko / selesai) * 100) },
      penuh,
      indeksKesulitan: Math.round((penuh / selesai) * 100) / 100,
      medianDetik: 40 + n,
      keliruTerbanyak: "1b",
      petunjuk: satu(20 + (n % 7) * 1.5),
    });
  }
  const urut = kejadian.sort((a, b) => Number(a.kode.slice(2)) - Number(b.kode.slice(2)) || b.versi - a.versi);
  return { cakupan: { ruang: 265, pemain: 10418, jawaban: urut.reduce((s, k) => s + k.dijawab, 0) }, kejadian: urut, paket: [{ id: "9880c4d5-8294-51c9-971a-e95531a2e039", nama: "Paket inti 16" }] };
}

const kolom = (page: Page, label: string) => page.getByLabel(label, { exact: true });

async function masukKonsol(browser: Browser, baseURL: string, email: string, sandi: string, sandiBaru: string, ukuran = UKURAN[0]): Promise<Page> {
  const ctx = await browser.newContext({ baseURL, viewport: ukuran, timezoneId: ZONA });
  const page = await ctx.newPage();
  await page.goto("/admin/");
  await kolom(page, "Email").fill(email);
  await kolom(page, "Sandi").fill(sandi);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("heading", { name: "Buat sandi baru" })).toBeVisible();
  await kolom(page, "Sandi baru").fill(sandiBaru);
  await kolom(page, "Ulangi sandi baru").fill(sandiBaru);
  await page.getByRole("button", { name: "Simpan sandi" }).click();
  await expect(page.getByText("Sandi baru tersimpan.")).toBeVisible();
  return page;
}

async function adminBaru(request: APIRequestContext, email: string): Promise<void> {
  const j = await request.post("/api/admin-awal", { headers: { "X-Jejak-Kunci-Admin": KUNCI_ADMIN, "CF-Connecting-IP": "10.88.13.3" }, data: { email, sandi: "sandi sementara statistik", namaTampilan: "Admin Statistik" } });
  expect(j.status()).toBe(200);
}

/** Tombol, tautan, dan isian yang tampil setinggi kurang dari 48 px (pola JS-04 P-50). */
const targetKecil = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".js-konsol-ruang :is(button, a, input:not([type=checkbox]), select)")]
      .filter((el) => el.getClientRects().length > 0 && el.getBoundingClientRect().height < 47.5)
      .map((el) => `${el.tagName} "${el.textContent?.trim() || el.getAttribute("aria-label") || ""}" ${el.getBoundingClientRect().height}`),
  );
const luapan = (page: Page) =>
  page.evaluate(() => {
    const g = document.querySelector<HTMLElement>(".js-statistik-gulung");
    return { halaman: document.documentElement.scrollWidth - window.innerWidth, tabel: g ? g.scrollWidth - g.clientWidth : 0 };
  });

test("admin: Statistik dengan saringan bawaan, urutan, rincian, papan ketik, dan tampilan di empat ukuran (AC-8 sampai AC-10)", async ({ browser, baseURL, request }) => {
  test.setTimeout(180_000);
  mkdirSync(FOTO, { recursive: true });
  const email = `admin-statistik-${Date.now()}@sekolah.sch.id`;
  await adminBaru(request, email);
  const page = await masukKonsol(browser, baseURL as string, email, "sandi sementara statistik", "kalimat sandi admin statistik");
  const data = dataTiruan();
  const permintaan: string[] = [];
  await page.route("**/api/statistik/kejadian**", (r) => {
    permintaan.push(r.request().url());
    return r.fulfill({ json: data });
  });

  const menu = page.getByRole("navigation", { name: "Menu konsol" });
  await expect(menu.getByRole("link")).toHaveText(["Dasbor", "Ruang", "Kejadian", "Rujukan", "Paket", "Statistik", "Akun", "Sandi saya"]);
  await menu.getByRole("link", { name: "Statistik" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Statistik");
  await expect(menu.getByRole("link", { name: "Statistik" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Statistik setiap kejadian dari ruang yang rondenya sudah berakhir.")).toBeVisible();

  // Bawaan 30 hari (D-2a): "Dari tanggal" berisi tanggal 29 hari lalu, dan permintaan memakai pukul 00.00 WITA hari itu.
  const harapan = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date(Date.now() - 29 * 86_400_000));
  await expect(kolom(page, "Dari tanggal")).toHaveValue(harapan);
  await expect(page.getByText("Bawaan: 30 hari terakhir. Kosongkan untuk semua waktu.")).toBeVisible();
  const [th, bl, tg] = harapan.split("-").map(Number);
  await expect.poll(() => permintaan.length).toBeGreaterThan(0);
  expect(new URL(permintaan[0]).searchParams.get("dari")).toBe(String(Date.UTC(th, bl - 1, tg) - 8 * 3_600_000));

  const jawaban = new Intl.NumberFormat("id-ID").format(data.cakupan.jawaban);
  await expect(page.getByText(`Dari 265 ruang, 10.418 pemain, dan ${jawaban} jawaban.`)).toBeVisible();
  const baris = page.locator(".js-statistik-tabel > tbody > tr:not(.js-statistik-rincian-baris)");
  await expect(baris).toHaveCount(18);
  await expect(baris.first().locator(".js-statistik-kode")).toHaveText("K-01");
  await expect(page.locator(".js-statistik-sedikit")).toHaveCount(1);
  await expect(baris.filter({ hasText: "K-03" })).toHaveCount(2);

  // Urutan di peramban, tanpa permintaan baru (P-18).
  const sebelum = permintaan.length;
  await kolom(page, "Urutkan").selectOption("sulit");
  const tersulit = [...data.kejadian].sort((a, b) => (a.indeksKesulitan ?? 9) - (b.indeksKesulitan ?? 9) || Number(a.kode.slice(2)) - Number(b.kode.slice(2)) || b.versi - a.versi)[0];
  await expect(baris.first().locator(".js-statistik-kode")).toHaveText(tersulit.kode);
  await expect(baris.first().getByText("Sulit")).toBeVisible();
  await kolom(page, "Urutkan").selectOption("kode");
  expect(permintaan.length).toBe(sebelum);

  // Rincian lewat papan ketik; satu rincian terbuka pada satu waktu (P-20, P-22).
  const tombol = page.getByRole("button", { name: "Rincian K-01 versi 1" });
  await tombol.focus();
  await page.keyboard.press("Enter");
  const tutup = page.getByRole("button", { name: "Tutup rincian K-01 versi 1" });
  await expect(tutup).toHaveAttribute("aria-expanded", "true");
  const rincian = page.locator(".js-statistik-rincian-baris");
  await expect(rincian).toHaveCount(1);
  await expect(rincian.getByRole("heading", { name: "Langkah 1: Hak siapa yang paling terganggu di sini?" })).toBeVisible();
  await expect(rincian.getByText("Jawaban tepat")).toBeVisible();
  await expect(rincian.getByText("Keliru terbanyak")).toBeVisible();
  await expect(rincian.getByText("Huruf mengikuti urutan asli di bank kejadian. Di ronde, urutan pilihan diacak untuk setiap pemain.")).toBeVisible();
  await expect(rincian.getByRole("link", { name: "Buka di bank kejadian" })).toHaveAttribute("href", "#/kejadian/K-01");
  for (const u of UKURAN) {
    await page.setViewportSize(u);
    await page.waitForTimeout(150);
    const l = await luapan(page);
    expect(l.halaman, `luapan halaman ${u.width}`).toBeLessThanOrEqual(0);
    if (u.width === 1280 || u.width === 1024) expect(l.tabel, `tabel digulir ${u.width}`).toBeLessThanOrEqual(1);
    expect(await targetKecil(page), `target ${u.width}`).toEqual([]);
    if (u.width !== 1024) await page.screenshot({ path: `${FOTO}/statistik-${u.width}x${u.height}.png`, fullPage: u.width !== 360 });
  }
  await page.setViewportSize(UKURAN[0]);
  await page.getByRole("button", { name: "Rincian K-02 versi 1" }).click();
  await expect(rincian).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Tutup rincian K-02 versi 1" })).toBeVisible();
  await page.getByRole("button", { name: "Tutup rincian K-02 versi 1" }).click();
  await expect(rincian).toHaveCount(0);
  await page.setViewportSize(UKURAN[1]);
  await page.screenshot({ path: `${FOTO}/statistik-1024x768.png` });
  await page.setViewportSize(UKURAN[0]);

  // Galat tanggal tanpa memanggil API, lalu Atur ulang mengembalikan bawaan (P-16, P-17).
  const sebelumGalat = permintaan.length;
  await kolom(page, "Sampai tanggal").fill("2020-01-01");
  await page.getByRole("button", { name: "Terapkan" }).click();
  await expect(page.getByText("Tanggal akhir tidak boleh sebelum tanggal awal.")).toBeVisible();
  expect(permintaan.length).toBe(sebelumGalat);
  await kolom(page, "Dari tanggal").fill("");
  await kolom(page, "Sampai tanggal").fill("");
  await page.getByRole("button", { name: "Terapkan" }).click();
  await expect.poll(() => permintaan.length).toBe(sebelumGalat + 1);
  expect(new URL(permintaan[permintaan.length - 1]).searchParams.get("dari")).toBeNull();
  await page.getByRole("button", { name: "Atur ulang" }).click();
  await expect(kolom(page, "Dari tanggal")).toHaveValue(harapan);
});

test("admin dan guru: dasbor empat kartu, menu guru, dan Statistik kosong dari API sungguhan (AC-1, AC-12)", async ({ browser, baseURL, request }) => {
  test.setTimeout(180_000);
  mkdirSync(FOTO, { recursive: true });
  const email = `admin-dasbor-${Date.now()}@sekolah.sch.id`;
  await adminBaru(request, email);
  const page = await masukKonsol(browser, baseURL as string, email, "sandi sementara statistik", "kalimat sandi admin dasbor");
  for (const judul of ["Peringatan", "Ruang yang sedang berjalan", "Sesi terakhir", "Ringkasan 30 hari terakhir"]) await expect(page.getByRole("heading", { name: judul })).toBeVisible();
  const peringatan = page.locator(".js-dasbor-peringatan a");
  await expect(peringatan.filter({ hasText: "rujukan belum diverifikasi" })).toHaveAttribute("href", "#/rujukan");
  await expect(peringatan.filter({ hasText: "kejadian Siap tinjau menunggu diterbitkan." })).toHaveAttribute("href", "#/kejadian");
  const kartu = page.locator(".js-konsol-kartu");
  const [k1, k2] = [await kartu.nth(0).boundingBox(), await kartu.nth(1).boundingBox()];
  expect(Math.abs((k1?.y ?? 0) - (k2?.y ?? 1))).toBeLessThan(2);
  expect(await targetKecil(page)).toEqual([]);
  await page.screenshot({ path: `${FOTO}/dasbor-1280x720.png`, fullPage: true });

  // Guru baru: menu tanpa Paket dan Akun, dasbor tanpa Siap tinjau, Statistik kosong.
  const guruEmail = `guru-statistik-${Date.now()}@sekolah.sch.id`;
  const akun = await request.post("/api/akun", { headers: await tajukKonsol(request), data: { email: guruEmail, namaTampilan: "Pak Statistik", peran: "guru", peninjau: false } });
  expect(akun.status()).toBe(201);
  const sementara = ((await akun.json()) as { sandiSementara: string }).sandiSementara;
  const guru = await masukKonsol(browser, baseURL as string, guruEmail, sementara, "kalimat sandi guru statistik", UKURAN[3]);
  await expect(guru.getByText("Ringkasan 30 hari terakhir")).toBeVisible();
  await expect(guru.getByText("Belum ada sesi kelas dalam 30 hari terakhir.")).toBeVisible();
  await expect(guru.getByText("Belum ada sesi kelas.")).toBeVisible();
  await expect(guru.getByText("kejadian Siap tinjau")).toHaveCount(0);
  const l = await luapan(guru);
  expect(l.halaman).toBeLessThanOrEqual(0);
  expect(await targetKecil(guru)).toEqual([]);
  await guru.screenshot({ path: `${FOTO}/dasbor-360x640.png`, fullPage: true });
  await guru.setViewportSize(UKURAN[0]);
  const menuGuru = guru.getByRole("navigation", { name: "Menu konsol" });
  await expect(menuGuru.getByRole("link")).toHaveText(["Dasbor", "Ruang", "Kejadian", "Rujukan", "Statistik", "Sandi saya"]);
  await menuGuru.getByRole("link", { name: "Statistik" }).click();
  await expect(guru.getByText("Belum ada jawaban yang cocok dengan saringan.")).toBeVisible();
  await expect(guru.getByLabel("Guru", { exact: true })).toHaveCount(0);
  await guru.screenshot({ path: `${FOTO}/statistik-kosong-1280x720.png` });
});
