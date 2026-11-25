// Uji ujung ke ujung layar kelas dan halaman ruang (spesifikasi JS-10; AC-1, AC-2, AC-7, AC-12, AC-14 sampai AC-19).
// Guru masuk, membuat ruang, membuka layar kelas di tab baru; tiga pemain bergabung lewat peramban dan satu bot menjawab
// satu kejadian lewat WebSocket; ronde berjalan sampai podium, pembahasan, dan ruang ditutup. Tangkapan layar disimpan
// di docs/jejak-setara/tests/JS-10/.
import { readFileSync } from "node:fs";
import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { PROTOKOL_VERSI } from "../../app/jejak-setara/inti/versi";
import { catatRuang, kejadianRuang, pindahkanPemain, tutupRuangBerkas } from "./ruang-uji";

// JS-09 (P-49): ruang yang dibuat berkas ini ditutup sesudah semua ujinya selesai.
test.afterAll(tutupRuangBerkas);

const V = PROTOKOL_VERSI;
const KUNCI_ADMIN = "lokal-kunci-admin-bukan-rahasia";
const FOTO = "docs/jejak-setara/tests/JS-10";
const UKURAN_KELAS = [
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
];
type Pesan = Record<string, unknown>;
/** Teks opsi Langkah 1 yang benar per kejadian, dari bank awal, agar bot pasti mendapat skor (podium tidak kosong). */
const BANK = JSON.parse(readFileSync(new URL("../../server/jejak-setara/seed/bank-awal.json", import.meta.url), "utf8")) as {
  kejadian: { kode: string; langkah1: { opsi: { teks: string; benar: boolean }[] } }[];
};
const teksBenar = (kode: string) => BANK.kejadian.find((k) => k.kode === kode)?.langkah1.opsi.find((o) => o.benar)?.teks;

async function konteks(browser: Browser, baseURL: string, ukuran = { width: 1280, height: 720 }, hp = false): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx = await browser.newContext({ baseURL, viewport: ukuran, timezoneId: "Asia/Makassar", ...(hp ? { isMobile: true, hasTouch: true } : {}) });
  return { ctx, page: await ctx.newPage() };
}

async function gabung(page: Page, kode: string, avatar: number): Promise<string> {
  await page.goto(`/?kode=${kode}`);
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible({ timeout: 20_000 }); // JS-15 (P-23): gambar dunia dimuat dulu
  const nama = page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first();
  const teks = (await nama.textContent())?.trim() ?? "";
  await nama.click();
  await page.getByRole("radio", { name: `Avatar ${avatar}` }).click();
  await page.getByRole("button", { name: "Gabung" }).click();
  await expect(page.getByRole("heading", { name: "Lobi" })).toBeVisible();
  return teks;
}

/** Tangkapan layar di tiga ukuran layar kelas, dengan pemeriksaan tidak ada yang meluap (AC-18). */
async function fotoKelas(page: Page, nama: string): Promise<void> {
  for (const u of UKURAN_KELAS) {
    await page.setViewportSize(u);
    await page.waitForTimeout(150);
    // Isi kartu pembahasan yang lebih tinggi dari layar digulir di dalam kartu (P-29), jadi tidak dihitung meluap;
    // kebutuhan gulir dicatat terpisah.
    const { luap, gulir } = await page.evaluate(() => {
      const t = window.innerHeight;
      const l = window.innerWidth;
      const luap = [...document.querySelectorAll(".js-kelas *")].filter((e) => {
        if (e.closest(".js-kelas-kartu") && !e.classList.contains("js-kelas-kartu")) return false;
        const r = e.getBoundingClientRect();
        return r.width > 0 && (r.right > l + 1 || r.bottom > t + 1);
      }).length;
      const gulir = [...document.querySelectorAll(".js-kelas-kartu")].some((k) => k.scrollHeight > k.clientHeight + 1);
      return { luap, gulir };
    });
    expect(luap, `${nama} ${u.width}x${u.height}`).toBe(0);
    if (gulir) console.log(`[JS-10] ${nama} ${u.width}x${u.height}: kartu pembahasan perlu digulir`);
    await page.screenshot({ path: `${FOTO}/kelas-${nama}-${u.width}x${u.height}.png` });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
}

/** Bot pemain lewat WebSocket: bergabung, lalu menjawab kejadian pertama ruang sesudah dipindah ke titiknya. */
async function botPemain(asal: string, kode: string) {
  const ws = new WebSocket(`${asal.replace(/^http/, "ws")}/ws/ruang/${kode}`, { headers: { Origin: asal } } as unknown as string[]);
  const riwayat: Pesan[] = [];
  ws.onmessage = (e) => riwayat.push(JSON.parse(String(e.data)) as Pesan);
  await new Promise<void>((ok) => (ws.onopen = () => ok()));
  const tunggu = async (cocok: (m: Pesan) => boolean) => {
    await expect.poll(() => riwayat.some(cocok), { timeout: 8000 }).toBe(true);
    return riwayat.find(cocok) as Pesan;
  };
  ws.send(JSON.stringify({ v: V, t: "halo", peran: "pemain" }));
  const datang = await tunggu((m) => m.t === "selamat_datang");
  const nama = (datang.saranNama as string[])[0];
  ws.send(JSON.stringify({ v: V, t: "pilih_identitas", nama, avatar: 4 }));
  await tunggu((m) => m.t === "pemain_baru" && m.id === datang.pemainId);
  return { ws, nama, riwayat, tunggu };
}

test("guru membuat ruang, membuka layar kelas, dan menjalankan ronde sampai pembahasan dan ruang ditutup", async ({ browser, baseURL, request }) => {
  test.setTimeout(240_000);
  const asal = baseURL as string;
  const email = `guru-kelas-${Date.now()}@sekolah.sch.id`;
  expect((await request.post("/api/admin-awal", { headers: { "X-Jejak-Kunci-Admin": KUNCI_ADMIN, "CF-Connecting-IP": "10.88.0.1" }, data: { email, sandi: "sandi sementara kelas", namaTampilan: "Pak Komang" } })).status()).toBe(200);

  // Guru masuk dan mengganti sandi sementara.
  const guru = await konteks(browser, asal);
  const g = guru.page;
  await g.goto("/admin/");
  await g.getByLabel("Email", { exact: true }).fill(email);
  await g.getByLabel("Sandi", { exact: true }).fill("sandi sementara kelas");
  await g.getByRole("button", { name: "Masuk", exact: true }).click();
  await g.getByLabel("Sandi baru", { exact: true }).fill("kalimat sandi guru kelas");
  await g.getByLabel("Ulangi sandi baru", { exact: true }).fill("kalimat sandi guru kelas");
  await g.getByRole("button", { name: "Simpan sandi" }).click();
  await expect(g.getByRole("heading", { name: "Dasbor" })).toBeVisible();

  // Halaman Ruang dan dialog Ruang baru (AC-1, AC-2).
  await g.getByRole("link", { name: "Ruang" }).first().click();
  await expect(g.getByRole("heading", { name: "Ruang", level: 1 })).toBeVisible();
  await g.getByRole("button", { name: "+ Ruang baru" }).click();
  const dialog = g.getByRole("dialog", { name: "Ruang baru" });
  await expect(dialog.getByText("Kejadian di paket ini belum bisa dipakai untuk ruang biasa", { exact: false })).toBeVisible();
  await expect(dialog.getByRole("checkbox", { name: "Ruang uji (tidak masuk statistik)" })).toBeChecked();
  await expect(dialog.getByRole("checkbox", { name: "Ruang uji (tidak masuk statistik)" })).toBeDisabled();
  await dialog.getByRole("button", { name: "Buat ruang" }).click();
  await expect(dialog.getByText("Label kelas 1–20 karakter.")).toBeVisible();
  await dialog.getByLabel("Label kelas", { exact: true }).fill("IX B");
  await dialog.getByLabel("Batas pemain", { exact: true }).fill("60");
  await expect(dialog.getByRole("checkbox", { name: "Minta nomor absen" })).toBeDisabled();
  await dialog.getByLabel("Batas pemain", { exact: true }).fill("30");
  await dialog.getByRole("button", { name: "10 menit" }).click();
  await g.screenshot({ path: `${FOTO}/konsol-ruang-baru-1280x720.png` });
  await dialog.getByRole("button", { name: "Buat ruang" }).click();
  await expect(g.getByText(/Ruang [A-Z0-9]{5} dibuat\./)).toBeVisible();
  const kode = ((await g.locator(".js-ruang-kode-besar").textContent()) ?? "").trim();
  const idBaru = /^#\/ruang\/([^/]+)$/.exec(new URL(g.url()).hash)?.[1] ?? "";
  expect(idBaru, "detail ruang baru").not.toBe("");
  catatRuang(idBaru);
  expect(kode).toMatch(/^[A-Z0-9]{5}$/);

  // Layar kelas di tab baru (P-9, P-13).
  const [kelas] = await Promise.all([guru.ctx.waitForEvent("page"), g.getByRole("link", { name: "Buka layar kelas" }).click()]);
  const galatHalaman: string[] = [];
  kelas.on("pageerror", (e) => galatHalaman.push(e.message));
  await expect(kelas.locator(".js-kelas-kode")).toHaveText(kode);
  await expect(kelas).toHaveTitle(`Layar kelas · ${kode}`);
  await expect(kelas.getByText("Menunggu pemain bergabung…")).toBeVisible();
  await expect(kelas.getByRole("button", { name: /Mulai/ })).toBeDisabled();

  // Tiga pemain lewat peramban dan satu bot.
  const pemain = await Promise.all([1, 2, 3].map(() => konteks(browser, asal, { width: 731, height: 411 }, true)));
  const nama: string[] = [];
  for (const [i, p] of pemain.entries()) nama.push(await gabung(p.page, kode, i + 1));
  const bot = await botPemain(asal, kode);
  await expect(kelas.locator(".js-kelas-daftar li")).toHaveCount(4);
  await expect(kelas.getByText("4 pemain")).toBeVisible();
  for (const n of [...nama, bot.nama]) await expect(kelas.locator(".js-kelas-daftar").getByText(n, { exact: true })).toBeVisible();

  // Kunci lewat pintasan L, lalu dibuka lagi (P-30).
  await kelas.keyboard.press("l");
  await expect(kelas.locator(".js-kelas-kepala").getByText("Ruang dikunci")).toBeVisible();
  await kelas.keyboard.press("l");
  await expect(kelas.locator(".js-kelas-kepala").getByText("Ruang dikunci")).toBeHidden();
  await fotoKelas(kelas, "lobi");

  // Konsol: daftar ruang di 1280 x 720 dan HP 360 x 640 (AC-18).
  await g.goto("/admin/#/ruang");
  await expect(g.getByText(kode)).toBeVisible();
  await g.screenshot({ path: `${FOTO}/konsol-ruang-1280x720.png` });
  await g.setViewportSize({ width: 360, height: 640 });
  expect(await g.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await g.screenshot({ path: `${FOTO}/konsol-ruang-360x640.png`, fullPage: true });
  await g.setViewportSize({ width: 1280, height: 720 });

  // Mulai: hitung mundur, lalu saat bermain (P-25, P-26).
  await kelas.bringToFront();
  await kelas.keyboard.press(" ");
  await expect(kelas.locator(".js-kelas-hitung")).toHaveText(/^[123]$/);
  await expect(kelas.locator(".js-kelas-sisa")).toBeVisible({ timeout: 8000 });
  await expect(kelas.locator(".js-kelas-papan li")).toHaveCount(4);

  // Bot menjawab kejadian pertama ruang; papan dan kemajuan berubah (P-18, P-19).
  const kejadian = await kejadianRuang(request, kode);
  const t1 = kejadian[0].titik[0];
  expect((await pindahkanPemain(request, kode, bot.nama, t1.x, t1.y + 1)).status()).toBe(200);
  bot.ws.send(JSON.stringify({ v: V, t: "periksa", kejadianId: kejadian[0].kejadianId }));
  const terbuka = await bot.tunggu((m) => m.t === "kejadian_terbuka");
  const opsi1 = terbuka.opsi1 as { id: string; teks: string }[];
  const pilihan1 = opsi1.find((o) => o.teks === teksBenar(kejadian[0].kejadianId)) ?? opsi1[0];
  bot.ws.send(JSON.stringify({ v: V, t: "kunci_1", kejadianId: kejadian[0].kejadianId, opsiId: pilihan1.id }));
  const hasil1 = await bot.tunggu((m) => m.t === "hasil_1");
  bot.ws.send(JSON.stringify({ v: V, t: "kunci_2", kejadianId: kejadian[0].kejadianId, opsiId: (hasil1.opsi2 as { id: string }[])[0].id }));
  await bot.tunggu((m) => m.t === "hasil_2");
  // JS-11 (P-34): ikon centang, angka yang terlihat, dan teks pembaca layar tersembunyi.
  const selesaiBot = kelas.locator(".js-kelas-papan li").filter({ hasText: bot.nama }).locator(".js-kelas-selesai");
  await expect(selesaiBot.locator('span[aria-hidden="true"]')).toHaveText("1", { timeout: 5000 });
  await expect(selesaiBot.locator(".js-sr")).toHaveText("1 kejadian selesai");
  await expect(selesaiBot.locator("img")).toHaveAttribute("alt", "");
  await expect(kelas.locator(".js-kelas-kemajuan .js-kelas-angka")).toHaveText("1%");
  await fotoKelas(kelas, "bermain");

  // Jeda dan lanjut lewat Spasi, tambah waktu lewat T (P-27, P-30).
  await kelas.keyboard.press(" ");
  await expect(kelas.locator(".js-kelas-dijeda")).toBeVisible();
  await fotoKelas(kelas, "jeda");
  await kelas.keyboard.press(" ");
  await expect(kelas.locator(".js-kelas-dijeda")).toBeHidden();
  await kelas.keyboard.press("t");

  // Akhiri dengan konfirmasi (A), lalu podium (P-28).
  await kelas.keyboard.press("a");
  const akhiri = kelas.getByRole("dialog", { name: "Akhiri ronde sekarang?" });
  await expect(akhiri).toBeVisible();
  await kelas.keyboard.press("l"); // pintasan diabaikan selama dialog terbuka
  await expect(akhiri).toBeVisible();
  await expect(kelas.locator(".js-kelas-kepala").getByText("Ruang dikunci")).toHaveCount(0);
  await akhiri.getByRole("button", { name: "Akhiri" }).click();
  await expect(kelas.getByText("Ronde selesai · IX B")).toBeVisible();
  await expect(kelas.locator(".js-kelas-tiang-1")).toContainText(bot.nama);
  await fotoKelas(kelas, "podium");

  // Pembahasan kejadian pertama: satu pemain menjawab, 100% pada pilihan bot (P-22, P-29).
  await kelas.keyboard.press("ArrowRight");
  await expect(kelas.getByText(`Kejadian 1 dari ${kejadian.length} · 1 pemain menjawab`)).toBeVisible();
  await expect(kelas.locator(".js-kelas-grafik .js-kelas-angka").filter({ hasText: "100%" })).toHaveCount(2);
  await fotoKelas(kelas, "pembahasan");
  await kelas.keyboard.press("ArrowRight");
  await expect(kelas.getByText(`Kejadian 2 dari ${kejadian.length} · 0 pemain menjawab`)).toBeVisible();

  // Guru mengeluarkan satu pemain dari detail ruang, bukan dari proyektor (P-9, P-10).
  await g.goto("/admin/#/ruang");
  await g.getByRole("link", { name: "Detail" }).first().click();
  await g.getByRole("button", { name: `Keluarkan ${nama[2]}` }).click();
  const keluar = g.getByRole("dialog", { name: `Keluarkan ${nama[2]}?` });
  await keluar.getByRole("button", { name: "Keluarkan" }).click();
  await expect(g.getByText(`${nama[2]} dikeluarkan.`)).toBeVisible();
  // JS-22 (P-17): admin melihat pemakaian ronde di detail ruang.
  await expect(g.getByRole("heading", { name: "Pemakaian ronde ini" })).toBeVisible();
  // JS-15 (D-1 a): persen dari kuota bulanan Workers Paid, bukan lagi kuota harian paket gratis (JS-22).
  await expect(g.getByRole("row", { name: /Permintaan Durable Object \(perkiraan\)/ })).toContainText("kuota bulanan Workers Paid");
  await g.screenshot({ path: `${FOTO}/konsol-detail-1280x720.png`, fullPage: true });

  // Tutup ruang dari layar kelas: semua sambungan berhenti (P-14).
  await kelas.bringToFront();
  await kelas.getByRole("button", { name: "Tutup ruang" }).click();
  await kelas.getByRole("dialog", { name: `Tutup ruang ${kode}?` }).getByRole("button", { name: "Tutup ruang" }).click();
  await expect(kelas.getByText("Ruang sudah ditutup.")).toBeVisible();
  expect(galatHalaman).toEqual([]);
  bot.ws.close();
  await Promise.all([guru.ctx.close(), ...pemain.map((p) => p.ctx.close())]);
});
