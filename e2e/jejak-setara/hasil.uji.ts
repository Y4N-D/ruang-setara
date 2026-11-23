// Uji ujung ke ujung akhir ronde (spesifikasi JS-11, rencana uji "Uji ujung ke ujung"; AC-3 sampai AC-6, AC-12, AC-14,
// AC-16 sampai AC-20). Admin membuat ruang "IX B"; satu pemain di HP Android dan satu di laptop menjawab lewat peramban,
// satu bot menjawab lewat WebSocket, dan satu pemain laptop tidak menjawab. Ronde diakhiri dari layar kelas; HP dan
// laptop menampilkan rekap dan refleksi; guru menutup ruang dan rekap tetap tampil dengan pita (D-2 a). Lalu di konsol:
// riwayat, hasil, rincian, unduh kedua CSV, tampilan cetak dan PDF A4, serta hapus data ruang oleh admin.
// Tangkapan layar disimpan di docs/jejak-setara/tests/JS-11/.
import { readFileSync } from "node:fs";
import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { PROTOKOL_VERSI } from "../../app/jejak-setara/inti/versi";
import { catatRuang, kejadianRuang, pindahkanPemain, tutupRuangBerkas } from "./ruang-uji";

// JS-09 (P-49): ruang yang dibuat berkas ini ditutup sesudah semua ujinya selesai.
test.afterAll(tutupRuangBerkas);

const V = PROTOKOL_VERSI;
const KUNCI_ADMIN = "lokal-kunci-admin-bukan-rahasia";
const PAKET_INTI = "9880c4d5-8294-51c9-971a-e95531a2e039";
const FOTO = "docs/jejak-setara/tests/JS-11";
type Pesan = Record<string, unknown>;
const BANK = JSON.parse(readFileSync(new URL("../../server/jejak-setara/seed/bank-awal.json", import.meta.url), "utf8")) as {
  kejadian: { kode: string; judul: string; langkah1: { opsi: { teks: string; benar: boolean }[] }; langkah2: { opsi: { teks: string; tingkat: string }[] } }[];
};
function isi(kode: string) {
  const k = BANK.kejadian.find((x) => x.kode === kode);
  if (!k) throw new Error(`kejadian ${kode} tidak ada`);
  return k;
}

async function konteks(browser: Browser, baseURL: string, ukuran = { width: 1280, height: 720 }, hp = false): Promise<{ ctx: BrowserContext; page: Page; galat: string[] }> {
  const ctx = await browser.newContext({
    baseURL,
    viewport: ukuran,
    timezoneId: "Asia/Makassar",
    ...(hp ? { isMobile: true, hasTouch: true } : {}),
  });
  const page = await ctx.newPage();
  const galat: string[] = [];
  page.on("pageerror", (e) => galat.push(e.message));
  return { ctx, page, galat };
}

const dunia = (page: Page) => page.locator("canvas.js-kanvas-dunia");
const dialog = (page: Page) => page.getByRole("dialog").filter({ has: page.locator("#js-dialog-judul") });
const tampilan = (page: Page) => page.locator(".js-dialog").getAttribute("data-tampilan");
const tunggu = (page: Page) => page.waitForTimeout(700); // masa tunggu 600 ms setiap tampilan dialog (JS-08 P-48)

async function gabung(page: Page, kode: string, avatar: number): Promise<string> {
  await page.goto(`/?kode=${kode}`);
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible({ timeout: 20_000 }); // JS-15 (P-23): gambar dunia dimuat dulu
  const nama = page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first();
  const teks = (await nama.textContent())?.replace("▶", "").trim() ?? "";
  await nama.click();
  await page.getByRole("radio", { name: `Avatar ${avatar}` }).click();
  await page.getByRole("button", { name: "Gabung" }).click();
  await expect(dunia(page)).toHaveAttribute("data-diri", /^\d+,\d+$/);
  return teks;
}

/** Bot pemain lewat WebSocket (pola JS-10): bergabung dan menjawab satu kejadian. */
async function botPemain(asal: string, kode: string) {
  const ws = new WebSocket(`${asal.replace(/^http/, "ws")}/ws/ruang/${kode}`, { headers: { Origin: asal } } as unknown as string[]);
  const riwayat: Pesan[] = [];
  ws.onmessage = (e) => riwayat.push(JSON.parse(String(e.data)) as Pesan);
  await new Promise<void>((ok) => (ws.onopen = () => ok()));
  const tungguPesan = async (cocok: (m: Pesan) => boolean) => {
    await expect.poll(() => riwayat.some(cocok), { timeout: 8000 }).toBe(true);
    return riwayat.find(cocok) as Pesan;
  };
  ws.send(JSON.stringify({ v: V, t: "halo", peran: "pemain" }));
  const datang = await tungguPesan((m) => m.t === "selamat_datang");
  const nama = (datang.saranNama as string[])[0];
  ws.send(JSON.stringify({ v: V, t: "pilih_identitas", nama, avatar: 4 }));
  await tungguPesan((m) => m.t === "pemain_baru" && m.id === datang.pemainId);
  return { ws, nama, tungguPesan };
}

/** Tangkapan layar kelas di 1024 × 768 dan 1920 × 1080, dengan pemeriksaan tidak ada yang meluap (JS-10 AC-18). */
async function fotoKelas(page: Page, nama: string): Promise<void> {
  for (const u of [
    { width: 1024, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(u);
    await page.waitForTimeout(200);
    const luap = await page.evaluate(() => {
      const t = window.innerHeight;
      const l = window.innerWidth;
      return [...document.querySelectorAll(".js-kelas *")].filter((e) => {
        if (e.closest(".js-kelas-kartu") && !e.classList.contains("js-kelas-kartu")) return false;
        const r = e.getBoundingClientRect();
        return r.width > 0 && (r.right > l + 1 || r.bottom > t + 1);
      }).length;
    });
    expect(luap, `${nama} ${u.width}x${u.height}`).toBe(0);
    await page.screenshot({ path: `${FOTO}/kelas-${nama}-${u.width}x${u.height}.png` });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
}

const tanpaLuapMendatar = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

/** Foto rekap: layar penuh (dengan gulir) di ukuran sekarang. */
async function fotoRekap(page: Page, nama: string): Promise<void> {
  await page.waitForTimeout(200);
  expect(await tanpaLuapMendatar(page), nama).toBe(true);
  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
  await page.screenshot({ path: `${FOTO}/rekap-${nama}-${width}x${height}.png`, fullPage: true });
}

test("ronde sampai rekap, ruang ditutup, lalu riwayat, hasil, rincian, CSV, cetak, dan hapus data ruang", async ({ browser, baseURL, request }) => {
  test.setTimeout(300_000);
  const asal = baseURL as string;

  // Admin masuk dan mengganti sandi sementara.
  const email = `admin-hasil-${Date.now()}@sekolah.sch.id`;
  const awal = await request.post("/api/admin-awal", {
    headers: { "X-Jejak-Kunci-Admin": KUNCI_ADMIN, "CF-Connecting-IP": "10.88.0.3" },
    data: { email, sandi: "sandi sementara hasil", namaTampilan: "Bu Rina" },
  });
  expect(awal.status()).toBe(200);
  const guru = await konteks(browser, asal);
  const g = guru.page;
  await g.goto("/admin/");
  await g.getByLabel("Email", { exact: true }).fill(email);
  await g.getByLabel("Sandi", { exact: true }).fill("sandi sementara hasil");
  await g.getByRole("button", { name: "Masuk" }).click();
  await g.getByLabel("Sandi baru", { exact: true }).fill("kalimat sandi guru hasil");
  await g.getByLabel("Ulangi sandi baru", { exact: true }).fill("kalimat sandi guru hasil");
  await g.getByRole("button", { name: "Simpan sandi" }).click();
  await expect(g.getByRole("heading", { name: "Dasbor" })).toBeVisible();

  // Ruang "IX B" lewat API konsol dari halaman konsol, dengan cookie sesi peramban (ruang uji, karena Paket inti 16
  // belum siap untuk ruang biasa).
  const buat = await g.evaluate(async (isi) => {
    const j = await fetch("/api/ruang", { method: "POST", headers: { "X-Jejak": "1", "Content-Type": "application/json" }, body: JSON.stringify(isi), credentials: "same-origin" });
    return { status: j.status, ruang: j.status === 201 ? ((await j.json()) as { ruang: { id: string; kode: string } }).ruang : null };
  }, { labelKelas: "IX B", paketId: PAKET_INTI, durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, modeNomorAbsen: false, uji: true });
  expect(buat.status).toBe(201);
  const { id, kode } = buat.ruang as { id: string; kode: string };
  catatRuang(id);

  // Layar kelas di tab baru, pemain di HP dan laptop, bot, dan satu pemain laptop yang tidak menjawab.
  const kelas = await guru.ctx.newPage();
  const galatKelas: string[] = [];
  kelas.on("pageerror", (e) => galatKelas.push(e.message));
  await kelas.goto(`/admin/#/kelas/${id}`);
  await expect(kelas.locator(".js-kelas-kode")).toHaveText(kode);
  const hp = await konteks(browser, asal, { width: 731, height: 411 }, true);
  const laptop = await konteks(browser, asal);
  const diam = await konteks(browser, asal);
  const namaHp = await gabung(hp.page, kode, 1);
  const namaLaptop = await gabung(laptop.page, kode, 2);
  const namaDiam = await gabung(diam.page, kode, 3);
  const bot = await botPemain(asal, kode);
  await expect(kelas.locator(".js-kelas-daftar li")).toHaveCount(4);

  // Mulai dari layar kelas (Spasi).
  await kelas.bringToFront();
  await kelas.keyboard.press(" ");
  for (const p of [hp, laptop, diam]) await expect(p.page.locator(".js-bilah")).toBeVisible({ timeout: 10_000 });
  const kejadian = await kejadianRuang(request, kode);
  const [kA, kB, kC] = kejadian;

  // Laptop: kejadian pertama lewat papan ketik, Langkah 1 benar dan Langkah 2 tepat.
  expect((await pindahkanPemain(request, kode, namaLaptop, kA.titik[0].x, kA.titik[0].y + 1)).status()).toBe(200);
  await expect(dunia(laptop.page)).toHaveAttribute("data-jangkauan", kA.kejadianId, { timeout: 5000 });
  await dunia(laptop.page).focus();
  await laptop.page.keyboard.press("KeyE");
  await expect(dialog(laptop.page)).toBeVisible();
  const nomor = async (page: Page, teks: string) => {
    const semua = await page.locator('.js-dialog [data-pilihan="ya"] .js-teks-pilihan').allTextContents();
    expect(semua).toContain(teks);
    return String(semua.indexOf(teks) + 1);
  };
  await tunggu(laptop.page);
  await laptop.page.keyboard.press(await nomor(laptop.page, isi(kA.kejadianId).langkah1.opsi.find((o) => o.benar)!.teks));
  await laptop.page.keyboard.press("Enter");
  await expect.poll(() => tampilan(laptop.page)).toBe("umpan");
  await tunggu(laptop.page);
  await laptop.page.keyboard.press("Enter");
  await expect.poll(() => tampilan(laptop.page)).toBe("langkah2");
  await tunggu(laptop.page);
  await laptop.page.keyboard.press(await nomor(laptop.page, isi(kA.kejadianId).langkah2.opsi.find((o) => o.tingkat === "tepat")!.teks));
  await laptop.page.keyboard.press("Enter");
  await expect.poll(() => tampilan(laptop.page)).toBe("kartu");
  await tunggu(laptop.page);
  await laptop.page.keyboard.press("Enter");
  await expect(dialog(laptop.page)).toHaveCount(0);

  // HP: kejadian kedua dengan sentuhan (Langkah 1 keliru, Langkah 2 kurang tepat), lalu kejadian ketiga Langkah 1 saja.
  const periksa = hp.page.locator(".js-tombol-periksa");
  const dekatiHp = async (k: { kejadianId: string; titik: { x: number; y: number }[] }) => {
    expect((await pindahkanPemain(request, kode, namaHp, k.titik[0].x, k.titik[0].y + 1)).status()).toBe(200);
    await expect(dunia(hp.page)).toHaveAttribute("data-jangkauan", k.kejadianId, { timeout: 5000 });
    await periksa.tap();
    await expect(dialog(hp.page)).toBeVisible();
    await tunggu(hp.page);
    await hp.page.getByRole("button", { name: "Lihat pilihan" }).tap();
    await tunggu(hp.page);
  };
  await dekatiHp(kB);
  await hp.page.locator(".js-dialog .js-teks-pilihan", { hasText: isi(kB.kejadianId).langkah1.opsi.find((o) => !o.benar)!.teks }).tap();
  await hp.page.getByRole("button", { name: "Kunci jawaban" }).tap();
  await expect.poll(() => tampilan(hp.page)).toBe("umpan");
  await tunggu(hp.page);
  await hp.page.getByRole("button", { name: "Lanjut ke Langkah 2" }).tap();
  await expect.poll(() => tampilan(hp.page)).toBe("pilihan2");
  await tunggu(hp.page);
  const kurang = isi(kB.kejadianId).langkah2.opsi.find((o) => o.tingkat !== "tepat")!;
  await hp.page.locator(".js-dialog .js-teks-pilihan", { hasText: kurang.teks }).tap();
  await hp.page.getByRole("button", { name: "Kunci jawaban" }).tap();
  await expect.poll(() => tampilan(hp.page)).toBe("kartu");
  await tunggu(hp.page);
  await hp.page.getByRole("button", { name: "Lanjut menjelajah" }).tap();
  await expect(dialog(hp.page)).toHaveCount(0);
  await dekatiHp(kC);
  await hp.page.locator(".js-dialog .js-teks-pilihan", { hasText: isi(kC.kejadianId).langkah1.opsi.find((o) => o.benar)!.teks }).tap();
  await hp.page.getByRole("button", { name: "Kunci jawaban" }).tap();
  await expect.poll(() => tampilan(hp.page)).toBe("umpan");
  await tunggu(hp.page);
  await hp.page.getByRole("button", { name: "Tutup" }).tap();
  await expect(dialog(hp.page)).toHaveCount(0);

  // Bot: kejadian pertama, Langkah 1 benar.
  expect((await pindahkanPemain(request, kode, bot.nama, kA.titik[0].x, kA.titik[0].y + 1)).status()).toBe(200);
  bot.ws.send(JSON.stringify({ v: V, t: "periksa", kejadianId: kA.kejadianId }));
  const terbuka = await bot.tungguPesan((m) => m.t === "kejadian_terbuka");
  const opsi1 = terbuka.opsi1 as { id: string; teks: string }[];
  bot.ws.send(JSON.stringify({ v: V, t: "kunci_1", kejadianId: kA.kejadianId, opsiId: (opsi1.find((o) => o.teks === isi(kA.kejadianId).langkah1.opsi.find((x) => x.benar)?.teks) ?? opsi1[0]).id }));
  const hasil1 = await bot.tungguPesan((m) => m.t === "hasil_1");
  bot.ws.send(JSON.stringify({ v: V, t: "kunci_2", kejadianId: kA.kejadianId, opsiId: (hasil1.opsi2 as { id: string }[])[0].id }));
  await bot.tungguPesan((m) => m.t === "hasil_2");

  // Layar kelas: 10 besar dengan ikon centang dan teks pembaca layar, tanpa tanda ✓ berupa huruf (P-34; AC-20).
  await kelas.bringToFront();
  const barisHp = kelas.locator(".js-kelas-papan li").filter({ hasText: namaHp });
  await expect(barisHp.locator(".js-kelas-selesai .js-sr")).toHaveText("1 kejadian selesai", { timeout: 6000 });
  await expect(barisHp.locator('.js-kelas-selesai span[aria-hidden="true"]')).toHaveText("1");
  await expect(kelas.locator(".js-kelas-selesai img")).toHaveCount(4);
  expect(await kelas.locator(".js-kelas-papan").textContent()).not.toContain("✓");
  await fotoKelas(kelas, "bermain");

  // Akhiri ronde (A), podium, lalu rekap di setiap HP (P-1 sampai P-6; AC-3, AC-4).
  await kelas.keyboard.press("a");
  await kelas.getByRole("dialog", { name: "Akhiri ronde sekarang?" }).getByRole("button", { name: "Akhiri" }).click();
  await expect(kelas.getByText("Ronde selesai · IX B")).toBeVisible();

  const L = laptop.page;
  await expect(L.getByRole("heading", { name: "Ronde selesai", level: 1 })).toBeVisible();
  await expect(L.getByRole("heading", { name: "Kejadian yang kamu jawab (1)" })).toBeVisible();
  const butirL = L.locator(".js-rekap-daftar > li");
  await expect(butirL).toHaveCount(1);
  await expect(butirL.getByRole("heading", { level: 3 })).toContainText(isi(kA.kejadianId).judul);
  await expect(butirL.locator('.js-tanda-rekap[data-jenis="tepat"]')).toHaveCount(2);
  await expect(L.locator(".js-rekap-uji")).toHaveText("Rujukan di ruang uji belum tentu sudah diverifikasi Peninjau.");
  await expect(L.getByText("Satu hak yang kupelajari hari ini adalah hak … untuk …")).toBeVisible();
  await expect(L.getByText("Satu kewajiban yang akan kujalankan minggu ini adalah …")).toBeVisible();
  // Target sentuh sedikitnya 48 px; dengan papan ketik saja, Tab ke tautan lalu Enter memindahkan fokus ke judul
  // Refleksi (P-6, P-9; AC-4, AC-7).
  const keRefleksi = L.getByRole("link", { name: "Langsung ke refleksi" });
  expect((await keRefleksi.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
  await L.keyboard.press("Tab");
  await expect(keRefleksi).toBeFocused();
  await L.keyboard.press("Enter");
  await expect(L.getByRole("heading", { name: "Refleksi" })).toBeFocused();
  await L.evaluate(() => window.scrollTo(0, 0));
  await fotoRekap(L, "berisi");

  const H = hp.page;
  await expect(H.getByRole("heading", { name: "Kejadian yang kamu jawab (2)" })).toBeVisible();
  const butirH = H.locator(".js-rekap-daftar > li");
  await expect(butirH).toHaveCount(2);
  await expect(butirH.nth(0).locator('.js-tanda-rekap[data-jenis="belum"]')).toBeVisible();
  await expect(butirH.nth(0)).toContainText("Jawaban tepat");
  await expect(butirH.nth(0)).toContainText("Pilihan yang tepat");
  await expect(butirH.nth(1)).toContainText("Belum dijawab");
  await fotoRekap(H, "berisi");

  const D = diam.page;
  await expect(D.getByText("Belum ada kejadian yang kamu jawab di ronde ini.")).toBeVisible();
  await expect(D.getByRole("heading", { name: "Refleksi" })).toBeVisible();
  await fotoRekap(D, "kosong");
  await D.setViewportSize({ width: 731, height: 411 });
  await fotoRekap(D, "kosong");

  // Pembahasan kejadian pertama: label "Jawaban tepat" berikon centang (P-34).
  await kelas.bringToFront();
  await kelas.keyboard.press("ArrowRight");
  await expect(kelas.getByText(/^Kejadian 1 dari \d+ · 2 pemain menjawab$/)).toBeVisible();
  await expect(kelas.locator(".js-kelas-tepat img")).toHaveCount(1);
  await fotoKelas(kelas, "pembahasan");

  // Konsol saat pembahasan: hasil di bawah tombol kelola dan di atas daftar pemain; keluarkan pemain yang diam (D-4).
  await g.bringToFront();
  await g.goto(`/admin/#/ruang/${id}`);
  const bagianHasil = g.getByRole("region", { name: "Hasil ronde" });
  await expect(bagianHasil.getByRole("heading", { name: "Peringkat lengkap" })).toBeVisible();
  const urutan = await g.locator(".js-konsol-isi > section").evaluateAll((s) => s.map((e) => e.getAttribute("aria-labelledby") ?? e.getAttribute("aria-label")));
  expect(urutan.indexOf("js-hasil-judul")).toBeLessThan(urutan.indexOf("js-ruang-pemain-judul"));
  await g.getByRole("button", { name: `Keluarkan ${namaDiam}` }).click();
  await g.getByRole("dialog", { name: `Keluarkan ${namaDiam}?` }).getByRole("button", { name: "Keluarkan" }).click();
  await expect(g.getByText(`${namaDiam} dikeluarkan.`)).toBeVisible();
  await expect(bagianHasil.getByRole("heading", { name: "Dikeluarkan (1)" })).toBeVisible({ timeout: 15_000 });
  await g.screenshot({ path: `${FOTO}/konsol-hasil-pembahasan-1280x720.png`, fullPage: true });

  // Guru menutup ruang dari layar kelas: rekap tetap tampil dengan pita dan tombol Kembali (P-8, D-2 a; AC-6).
  await kelas.bringToFront();
  await kelas.getByRole("button", { name: "Tutup ruang" }).click();
  await kelas.getByRole("dialog", { name: `Tutup ruang ${kode}?` }).getByRole("button", { name: "Tutup ruang" }).click();
  for (const P of [L, H]) {
    await expect(P.locator(".js-pita-rekap")).toHaveText("Ruang sudah ditutup. Rekapmu tetap tampil sampai halaman ini ditutup.");
    await expect(P.getByText("Tunggu arahan guru.")).toBeHidden();
    await expect(P.getByRole("button", { name: "Kembali" })).toBeVisible();
    expect((await P.getByRole("button", { name: "Kembali" }).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
  }
  await fotoRekap(L, "ditutup");
  await fotoRekap(H, "ditutup");
  bot.ws.close();

  // Riwayat: tab, saringan, galat tanggal tanpa memanggil API, tabel dan kartu (P-16 sampai P-18; AC-12, AC-14).
  await g.bringToFront();
  await g.goto("/admin/#/ruang");
  await g.getByRole("navigation", { name: "Bagian halaman Ruang" }).getByRole("link", { name: "Riwayat" }).click();
  await expect(g).toHaveURL(/#\/ruang\/riwayat$/);
  const tab = g.getByRole("navigation", { name: "Bagian halaman Ruang" });
  await expect(tab.getByRole("link", { name: "Riwayat" })).toHaveAttribute("aria-current", "page");
  await expect(tab.getByRole("link", { name: "Berjalan" })).not.toHaveAttribute("aria-current", "page");
  await expect(g.locator(".js-konsol-menu a[aria-current='page']").first()).toHaveText("Ruang");
  const baris = g.getByRole("row").filter({ hasText: kode });
  await expect(baris).toContainText("IX B");
  await expect(baris).toContainText("Uji");
  let mintaRiwayat = 0;
  g.on("request", (r) => {
    if (r.url().includes("/api/ruang/riwayat")) mintaRiwayat++;
  });
  await g.getByLabel("Dari tanggal").fill("2030-01-02");
  await g.getByLabel("Sampai tanggal").fill("2030-01-01");
  await g.getByRole("button", { name: "Terapkan" }).click();
  await expect(g.getByText("Tanggal akhir tidak boleh sebelum tanggal awal.")).toBeVisible();
  expect(mintaRiwayat).toBe(0);
  await g.getByLabel("Dari tanggal").fill("2000-01-01");
  await g.getByLabel("Sampai tanggal").fill("2100-01-01");
  await g.getByLabel("Label kelas").fill("ix");
  await g.getByRole("button", { name: "Terapkan" }).click();
  await expect.poll(() => mintaRiwayat).toBe(1);
  await expect(baris).toBeVisible();
  await g.getByLabel("Label kelas").fill("zz-tidak-ada");
  await g.getByRole("button", { name: "Terapkan" }).click();
  await expect(g.getByText("Tidak ada ruang yang cocok dengan saringan.")).toBeVisible();
  await g.getByRole("button", { name: "Atur ulang" }).click();
  await expect(baris).toBeVisible();
  await g.screenshot({ path: `${FOTO}/konsol-riwayat-1280x720.png` });
  await g.setViewportSize({ width: 360, height: 640 });
  expect(await tanpaLuapMendatar(g)).toBe(true);
  await g.screenshot({ path: `${FOTO}/konsol-riwayat-360x640.png`, fullPage: true });
  await g.setViewportSize({ width: 1280, height: 720 });

  // Hasil ruang yang sudah ditutup (P-19 sampai P-24; AC-16).
  await baris.getByRole("link", { name: /^Hasil ruang IX B, / }).click();
  await expect(g.getByRole("link", { name: "← Riwayat ruang" })).toBeVisible();
  await expect(bagianHasil.getByText("Ruang uji: hasilnya tidak masuk statistik.")).toBeVisible();
  await expect(bagianHasil.locator(".js-hasil-ringkasan")).toContainText("3 (1 dikeluarkan)");
  const tabelPeringkat = bagianHasil.locator(".js-hasil-tabel").first();
  await expect(tabelPeringkat.locator("> tbody > tr")).toHaveCount(3);
  await expect(tabelPeringkat.locator("> thead img")).toHaveCount(3);
  await expect(bagianHasil.getByText("Pemain yang dikeluarkan guru tidak masuk peringkat dan ringkasan.")).toBeVisible();
  const tombolRincian = bagianHasil.getByRole("button", { name: `Rincian jawaban ${namaHp}` });
  await expect(tombolRincian).toHaveAttribute("aria-expanded", "false");
  await tombolRincian.click();
  await expect(tombolRincian).toHaveAttribute("aria-expanded", "true");
  await expect(tombolRincian).toHaveText("Tutup rincian");
  const rincian = bagianHasil.locator(".js-hasil-rincian");
  await expect(rincian.locator("tbody tr")).toHaveCount(2);
  await expect(rincian).toContainText("Belum tepat");
  await expect(rincian).toContainText("Belum dijawab");
  await expect(rincian).toContainText(`${kB.kejadianId} · ${isi(kB.kejadianId).judul}`);
  await g.screenshot({ path: `${FOTO}/konsol-hasil-1280x720.png`, fullPage: true });
  // Kepala tabel tetap di atas saat halaman digulir (P-23).
  const kepalaTetap = await g.evaluate(() => {
    const tabel = document.querySelector(".js-hasil-tabel") as HTMLElement;
    window.scrollTo(0, tabel.getBoundingClientRect().top + window.scrollY + 300);
    return (tabel.querySelector(":scope > thead th") as HTMLElement).getBoundingClientRect().top;
  });
  expect(Math.abs(kepalaTetap)).toBeLessThanOrEqual(1);
  await g.evaluate(() => window.scrollTo(0, 0));
  await g.setViewportSize({ width: 360, height: 640 });
  expect(await tanpaLuapMendatar(g)).toBe(true);
  await g.screenshot({ path: `${FOTO}/konsol-hasil-360x640.png`, fullPage: true });
  await g.setViewportSize({ width: 1280, height: 720 });

  // Unduh CSV (P-26 sampai P-30; AC-17).
  for (const [jenis, tombol] of [
    ["peserta", "Unduh CSV peserta"],
    ["jawaban", "Unduh CSV jawaban"],
  ] as const) {
    const [unduhan] = await Promise.all([g.waitForEvent("download"), bagianHasil.getByRole("button", { name: tombol }).click()]);
    expect(unduhan.suggestedFilename()).toMatch(new RegExp(`^jejak-setara_ix-b_\\d{4}-\\d{2}-\\d{2}_${jenis}\\.csv$`));
    const bita = readFileSync((await unduhan.path()) as string);
    expect([...bita.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const teks = bita.subarray(3).toString("utf8");
    // JS-09 (P-47): CSV jawaban mendapat kolom ke-18 "Petunjuk dipakai" di ujung kanan.
    expect(teks.split("\r\n")[0].split(";").length).toBe(jenis === "peserta" ? 16 : 18);
    if (jenis === "peserta") expect(teks).toContain(";Dikeluarkan");
    else expect(teks.split("\r\n")[0]).toMatch(/;Keterangan;Petunjuk dipakai$/);
  }

  // Cetak: hanya bagian P-31; ruang 40 pemain menjadi PDF A4 satu halaman (AC-18).
  await g.emulateMedia({ media: "print" });
  await expect(g.locator(".js-konsol-samping")).toBeHidden();
  await expect(g.locator(".js-konsol-kepala")).toBeHidden();
  await expect(bagianHasil.getByRole("button")).toHaveCount(0);
  await expect(g.getByRole("region", { name: "Hapus data ruang" })).toBeHidden();
  await expect(bagianHasil.getByText("Hasil ronde · IX B")).toBeVisible();
  await expect(bagianHasil.getByText(`Kode ruang ${kode}`)).toBeVisible();
  await expect(bagianHasil.getByText(/^Dicetak dari konsol Jejak Setara, /)).toBeVisible();
  await g.setViewportSize({ width: 794, height: 1123 });
  await g.screenshot({ path: `${FOTO}/konsol-cetak-a4.png`, fullPage: true });
  await g.emulateMedia({ media: "screen" });
  await g.setViewportSize({ width: 1280, height: 720 });
  await g.route(`**/api/ruang/${id}/hasil`, async (rute) => {
    const asli = await rute.fetch();
    const data = (await asli.json()) as { peserta: Pesan[] };
    const contoh = data.peserta[0];
    data.peserta = Array.from({ length: 40 }, (_, i) => ({ ...contoh, id: `p-${i}`, nama: `Pemain Uji ${String(i + 1).padStart(2, "0")}`, peringkat: i + 1, dikeluarkan: false }));
    await rute.fulfill({ response: asli, json: data });
  });
  await g.reload();
  await expect(bagianHasil.locator(".js-hasil-tabel").first().locator("> tbody > tr")).toHaveCount(40);
  await g.emulateMedia({ media: "print" });
  const pdf = await g.pdf({ format: "A4", preferCSSPageSize: true, path: "test-results-jejak/cetak-40-pemain.pdf" });
  await g.emulateMedia({ media: "screen" });
  const halaman = pdf.toString("latin1").match(/\/Type\s*\/Page(?!s)/g) ?? [];
  expect(halaman.length).toBe(1);
  await g.unroute(`**/api/ruang/${id}/hasil`);
  await g.reload();

  // Hapus data ruang oleh admin (P-32; AC-19).
  const bagianHapus = g.getByRole("region", { name: "Hapus data ruang" });
  await bagianHapus.getByRole("button", { name: "Hapus data ruang" }).click();
  const hapus = g.getByRole("dialog", { name: "Hapus data ruang IX B?" });
  await expect(hapus.getByLabel("Label kelas")).toBeFocused();
  await expect(hapus).toContainText("Data 4 peserta dan semua jawabannya di ruang ini dihapus permanen.");
  const tombolHapus = hapus.getByRole("button", { name: "Hapus data" });
  await expect(tombolHapus).toBeDisabled();
  await hapus.getByLabel("Label kelas").fill("IX");
  await expect(tombolHapus).toBeDisabled();
  await hapus.getByLabel("Label kelas").fill("  ix b ");
  await expect(tombolHapus).toBeEnabled();
  await g.screenshot({ path: `${FOTO}/konsol-hapus-1280x720.png` });
  await tombolHapus.click();
  await expect(g).toHaveURL(/#\/ruang\/riwayat$/);
  await expect(g.getByText(`Data ruang IX B (${kode}) dihapus.`)).toBeVisible();
  await expect(g.getByRole("row").filter({ hasText: kode })).toHaveCount(0);

  expect([...guru.galat, ...galatKelas, ...hp.galat, ...laptop.galat, ...diam.galat]).toEqual([]);
  await Promise.all([guru.ctx.close(), hp.ctx.close(), laptop.ctx.close(), diam.ctx.close()]);
});
