// Ketahanan jaringan (spesifikasi JS-15, P-15 sampai P-19; AC-12 sampai AC-15). Peramban pemain tersambung ke Worker
// lokal lewat proksi-jaringan.mjs, yang bisa menambah latensi dan jitter serta memutus semua sambungan selama waktu
// tertentu, termasuk sambungan baru. Pemain lain dan kait uji tetap tersambung langsung.
import { readFileSync } from "node:fs";
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { buatProksi } from "../../scripts/jejak-setara/proksi-jaringan.mjs";
import { buatRuang, EMAIL, idDariKode, kejadianRuang, kelas, pindahkanPemain, SANDI, tajukKonsol, tutupRuangBerkas } from "./ruang-uji";

test.afterAll(tutupRuangBerkas);

const PORT_WORKER = 4310;
const bank = JSON.parse(readFileSync(new URL("../../server/jejak-setara/seed/bank-awal.json", import.meta.url), "utf8")) as {
  kejadian: { kode: string; langkah1: { opsi: { teks: string; benar: boolean }[] } }[];
};
const dunia = (page: Page) => page.locator("canvas.js-kanvas-dunia");
const lapisanSambung = (page: Page) => page.getByRole("dialog", { name: "Menyambung ulang…" });
const sisaDetik = async (page: Page) => {
  const m = /(\d+):(\d\d)$/.exec((await page.locator(".js-sisa").getAttribute("aria-label")) ?? "");
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};

/** Bergabung lewat `?kode=`; kode baru diperiksa sesudah gambar dunia termuat (P-50 JS-03), jadi jaringan lambat butuh waktu lebih. */
async function gabung(page: Page, alamat: string, kode: string, avatar: number, batasMs = 20_000): Promise<string> {
  await page.goto(`${alamat}/?kode=${kode}`);
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible({ timeout: batasMs });
  const nama = page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first();
  const teks = (await nama.textContent())?.replace("▶", "").trim() ?? "";
  await nama.click();
  await page.getByRole("radio", { name: `Avatar ${avatar}` }).click();
  await page.getByRole("button", { name: "Gabung" }).click();
  await expect(page.getByRole("heading", { name: "Lobi" })).toBeVisible({ timeout: batasMs });
  return teks;
}

/** Pemain dipindah ke dekat kejadian ke-`i`, membuka dialog dengan E, lalu menjawab Langkah 1 dengan benar (+40). */
async function jawabLangkah1(request: APIRequestContext, page: Page, kode: string, nama: string, i = 0, skor = "Skor 40, peringkat 1") {
  const k = (await kejadianRuang(request, kode))[i];
  expect((await pindahkanPemain(request, kode, nama, k.titik[0].x, k.titik[0].y + 1)).status()).toBe(200);
  await expect(dunia(page)).toHaveAttribute("data-jangkauan", k.kejadianId, { timeout: 10_000 });
  await dunia(page).focus();
  await page.keyboard.press("KeyE");
  await expect(page.locator(".js-dialog")).toHaveAttribute("data-tampilan", "langkah1", { timeout: 10_000 });
  await page.waitForTimeout(700);
  const benar = bank.kejadian.find((b) => b.kode === k.kejadianId)!.langkah1.opsi.find((o) => o.benar)!.teks;
  const semua = await page.locator('.js-dialog [data-pilihan="ya"] .js-teks-pilihan').allTextContents();
  await page.keyboard.press(String(semua.indexOf(benar) + 1));
  await page.keyboard.press("Enter");
  await expect(page.locator(".js-skor")).toHaveAttribute("aria-label", skor, { timeout: 10_000 });
}

/** Mengakhiri ronde lalu membaca peserta dari D1 sesudah kiriman kosong. */
async function pesertaAkhir(request: APIRequestContext, kode: string) {
  await kelas(request, kode, { t: "akhiri" });
  const id = idDariKode(kode);
  const tajuk = await tajukKonsol(request);
  let peserta: { nama: string; langkah1Dijawab: number }[] = [];
  await expect
    .poll(
      async () => {
        const d = (await (await request.get(`/api/ruang/${id}`, { headers: tajuk })).json()) as { langsung?: { kirimanTertunda?: boolean } };
        if (d.langsung?.kirimanTertunda !== false) return -1;
        peserta = ((await (await request.get(`/api/ruang/${id}/hasil`, { headers: tajuk })).json()) as { peserta: typeof peserta }).peserta;
        return peserta.length;
      },
      { timeout: 20_000 },
    )
    .toBeGreaterThan(0);
  return peserta;
}

test("putus 30 detik lewat proksi: kembali dengan nama dan skor yang sama, jawaban tetap terhitung (AC-12)", async ({ browser, request }) => {
  test.setTimeout(180_000);
  const proksi = await buatProksi({ portTujuan: PORT_WORKER });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  try {
    const kode = await buatRuang(request);
    const nama = await gabung(page, `http://127.0.0.1:${proksi.port}`, kode, 3);
    await kelas(request, kode, { t: "mulai" });
    await expect(page.locator(".js-bilah")).toBeVisible({ timeout: 10_000 });
    await jawabLangkah1(request, page, kode, nama);
    proksi.putus(30_000);
    await expect(lapisanSambung(page)).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(20_000);
    await expect(lapisanSambung(page)).toBeVisible();
    await expect(lapisanSambung(page)).toBeHidden({ timeout: 60_000 });
    await expect(page.locator(".js-skor")).toHaveAttribute("aria-label", "Skor 40, peringkat 1");
    const peserta = await pesertaAkhir(request, kode);
    expect(peserta.map((p) => [p.nama, p.langkah1Dijawab])).toEqual([[nama, 1]]);
  } finally {
    await ctx.close();
    await proksi.tutup();
  }
});

test("putus 2 menit: kembali tanpa kehilangan skor, ronde tetap berjalan, pemain lain tidak terputus (AC-13)", async ({ browser, baseURL, request }) => {
  test.setTimeout(290_000);
  const proksi = await buatProksi({ portTujuan: PORT_WORKER });
  const ctxA = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const ctxB = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();
  try {
    const kode = await buatRuang(request);
    const namaA = await gabung(a, `http://127.0.0.1:${proksi.port}`, kode, 2);
    const namaB = await gabung(b, baseURL!, kode, 5);
    await kelas(request, kode, { t: "mulai" });
    await expect(a.locator(".js-bilah")).toBeVisible({ timeout: 10_000 });
    await jawabLangkah1(request, a, kode, namaA);
    const sisaAwal = await sisaDetik(b);
    proksi.putus(120_000);
    await expect(lapisanSambung(a)).toBeVisible({ timeout: 15_000 });
    for (let i = 0; i < 4; i++) {
      await b.waitForTimeout(25_000);
      await expect(lapisanSambung(b)).toHaveCount(0);
    }
    await expect(lapisanSambung(a)).toBeHidden({ timeout: 90_000 });
    expect(sisaAwal - (await sisaDetik(b))).toBeGreaterThanOrEqual(115);
    await expect(a.locator(".js-skor")).toHaveAttribute("aria-label", "Skor 40, peringkat 1");
    const peserta = await pesertaAkhir(request, kode);
    expect(peserta.map((p) => [p.nama, p.langkah1Dijawab]).sort()).toEqual([[namaA, 1], [namaB, 0]].sort());
  } finally {
    await ctxA.close();
    await ctxB.close();
    await proksi.tutup();
  }
});

test("latensi 150 ms per arah dengan jitter 25 ms: pemain berjalan hampir tanpa koreksi, membuka kejadian, dan menjawab (AC-14)", async ({ browser, request }) => {
  test.setTimeout(150_000);
  const proksi = await buatProksi({ portTujuan: PORT_WORKER, latensiMs: 150, jitterMs: 25 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const hitung = { gerak: 0, koreksi: 0 };
  page.on("websocket", (ws) => {
    ws.on("framesent", (f) => String(f.payload).includes('"t":"gerak"') && hitung.gerak++);
    ws.on("framereceived", (f) => String(f.payload).includes('"t":"koreksi"') && hitung.koreksi++);
  });
  try {
    const kode = await buatRuang(request);
    // Worker lokal memakai HTTP/1.1 (paling banyak 6 sambungan per alamat), jadi ratusan gambar dunia lewat latensi
    // 300 ms pulang-pergi butuh belasan detik; waktu itu dicatat terpisah dengan ukur-muat.mjs.
    const mulaiGabung = Date.now();
    const nama = await gabung(page, `http://127.0.0.1:${proksi.port}`, kode, 4, 90_000);
    console.log(`AC-14: bergabung lewat latensi 300 ms pulang-pergi dalam ${Math.round((Date.now() - mulaiGabung) / 100) / 10} detik`);
    await kelas(request, kode, { t: "mulai" });
    await expect(page.locator(".js-bilah")).toBeVisible({ timeout: 10_000 });
    await dunia(page).focus();
    for (const tombol of ["ArrowRight", "ArrowDown", "ArrowLeft"]) {
      await page.keyboard.down(tombol);
      await page.waitForTimeout(900);
      await page.keyboard.up(tombol);
    }
    await page.waitForTimeout(1000);
    // Berjalan tetap jalan: hampir semua gerak diterima. Ambang 1% untuk gerak jujur diukur sim:beban dengan 50 bot
    // (lebih banyak sampel); di sini cukup memastikan latensi tidak membuat gerak ditolak beruntun.
    console.log(`AC-14: ${hitung.gerak} gerak, ${hitung.koreksi} koreksi`);
    expect(hitung.gerak).toBeGreaterThan(10);
    expect(hitung.koreksi / hitung.gerak).toBeLessThan(0.1);
    await jawabLangkah1(request, page, kode, nama);
  } finally {
    await ctx.close();
    await proksi.tutup();
  }
});

test("layar kelas ditutup 60 detik lalu dibuka lagi: ronde tetap berjalan dan papan kembali (AC-15)", async ({ browser, baseURL, request }) => {
  test.setTimeout(200_000);
  const ctxP = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const pemain = await ctxP.newPage();
  const ctxK = await browser.newContext({ baseURL, viewport: { width: 1920, height: 1080 } });
  await tajukKonsol(request); // membuat akun admin uji bila belum ada
  try {
    const kode = await buatRuang(request);
    const nama = await gabung(pemain, baseURL!, kode, 6);
    await kelas(request, kode, { t: "mulai" });
    await expect(pemain.locator(".js-bilah")).toBeVisible({ timeout: 10_000 });
    let layar = await ctxK.newPage();
    await layar.goto("/admin/");
    await layar.getByLabel("Email", { exact: true }).fill(EMAIL);
    await layar.getByLabel("Sandi", { exact: true }).fill(SANDI);
    await layar.getByRole("button", { name: "Masuk" }).click();
    await expect(layar.getByRole("heading", { name: "Dasbor" })).toBeVisible({ timeout: 15_000 });
    await layar.goto(`/admin/#/kelas/${idDariKode(kode)}`);
    await expect(layar.getByText(nama).first()).toBeVisible({ timeout: 20_000 });
    await layar.close();
    const sisaAwal = await sisaDetik(pemain);
    await pemain.waitForTimeout(30_000);
    await jawabLangkah1(request, pemain, kode, nama);
    await pemain.waitForTimeout(30_000);
    expect(sisaAwal - (await sisaDetik(pemain))).toBeGreaterThanOrEqual(55);
    layar = await ctxK.newPage();
    await layar.goto(`/admin/#/kelas/${idDariKode(kode)}`);
    await expect(layar.getByText(nama).first()).toBeVisible({ timeout: 20_000 });
    await expect(layar.getByText(/\b\d{1,2}:\d{2}\b/).first()).toBeVisible();
    await expect(layar.getByText("Layar kelas gagal dimuat. Muat ulang halaman.")).toHaveCount(0);
  } finally {
    await ctxP.close();
    await ctxK.close();
  }
});
