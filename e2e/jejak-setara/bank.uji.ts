// Bank kejadian di konsol lewat peramban (spesifikasi JS-12; AC-2 sampai AC-4, AC-6 sampai AC-8, AC-11, AC-12, AC-15):
// admin masuk, membuka daftar dan penyunting, melihat validasi langsung dan pratinjau tegak serta mendatar, menyimpan,
// lalu membuka pustaka rujukan dan paket. Judul yang diubah dikembalikan di akhir agar uji lain tidak terpengaruh.
import { expect, test, type Page } from "@playwright/test";

const KUNCI_ADMIN = "lokal-kunci-admin-bukan-rahasia";
const FOTO = "docs/jejak-setara/tests/JS-12";

async function tidakMeluap(page: Page) {
  const hasil = await page.evaluate(() => {
    const luap = Array.from(document.querySelectorAll("body *"))
      .map((el) => ({ el: `${el.tagName}.${(el as HTMLElement).className}`, kanan: el.getBoundingClientRect().right }))
      .filter((x) => x.kanan > window.innerWidth + 1)
      .map((x) => `${x.el} ${x.kanan.toFixed(1)}`);
    return { lebar: document.documentElement.scrollWidth, layar: window.innerWidth, luap: luap.slice(0, 5) };
  });
  expect(hasil.luap, JSON.stringify(hasil)).toEqual([]);
  expect(hasil.lebar).toBeLessThanOrEqual(hasil.layar + 1);
}

test("admin menyunting kejadian dengan validasi langsung dan pratinjau, lalu membuka rujukan dan paket", async ({ browser, baseURL, request }) => {
  test.setTimeout(180_000);
  const email = `admin-bank-${Date.now()}@sekolah.sch.id`;
  expect((await request.post("/api/admin-awal", { headers: { "X-Jejak-Kunci-Admin": KUNCI_ADMIN, "CF-Connecting-IP": "10.88.0.2" }, data: { email, sandi: "sandi sementara bank", namaTampilan: "Bu Ayu" } })).status()).toBe(200);
  const ctx = await browser.newContext({ baseURL: baseURL as string, viewport: { width: 1280, height: 720 }, timezoneId: "Asia/Makassar" });
  const g = await ctx.newPage();
  await g.goto("/admin/");
  await g.getByLabel("Email", { exact: true }).fill(email);
  await g.getByLabel("Sandi", { exact: true }).fill("sandi sementara bank");
  await g.getByRole("button", { name: "Masuk" }).click();
  await g.getByLabel("Sandi baru", { exact: true }).fill("kalimat sandi admin bank");
  await g.getByLabel("Ulangi sandi baru", { exact: true }).fill("kalimat sandi admin bank");
  await g.getByRole("button", { name: "Simpan sandi" }).click();
  await expect(g.getByRole("heading", { name: "Dasbor" })).toBeVisible();

  // Daftar kejadian (AC-2, AC-3).
  await g.getByRole("link", { name: "Kejadian" }).first().click();
  await expect(g.getByRole("heading", { name: "Kejadian" })).toBeVisible();
  await expect(g.getByText(/^\d+ kejadian$/)).toBeVisible();
  await expect(g.getByRole("link", { name: "K-01" })).toBeVisible();
  await g.getByLabel("Status").selectOption("tinjau");
  await expect(g.getByRole("link", { name: "K-16" })).toBeVisible();
  await g.screenshot({ path: `${FOTO}/konsol-kejadian-1280x720.png` });

  // Penyunting dengan validasi langsung dan pratinjau (AC-4, AC-6 sampai AC-8).
  await g.getByRole("link", { name: "K-01" }).click();
  const judul = g.getByLabel("Judul", { exact: true });
  await expect(judul).toBeVisible();
  const asli = await judul.inputValue();
  const bingkai = g.frameLocator("iframe[title='Pratinjau']");
  await expect(bingkai.getByText(asli).first()).toBeVisible();
  await expect(bingkai.getByText("Pratinjau. Di ronde, urutan pilihan diacak untuk setiap pemain.")).toBeVisible();
  await judul.fill("J".repeat(40));
  await expect(g.getByText(/^Terlalu panjang: paling banyak \d+ karakter\.$/)).toBeVisible();
  await expect(g.getByRole("button", { name: "Simpan", exact: true })).toBeDisabled();
  await judul.fill("Ketua kelas yang adil");
  await expect(g.getByText("Semua isian sah · Belum disimpan")).toBeVisible();
  await expect(bingkai.getByText("Ketua kelas yang adil").first()).toBeVisible();
  await g.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(g.getByText("Tersimpan.")).toBeVisible();
  await expect(g.getByRole("button", { name: "Terbitkan" })).toBeDisabled();
  await g.screenshot({ path: `${FOTO}/konsol-penyunting-1280x720.png` });
  await g.getByRole("button", { name: "Mendatar" }).click();
  await expect(g.locator("iframe[title='Pratinjau']")).toHaveAttribute("width", "731");
  await g.locator(".js-pratinjau-panel").screenshot({ path: `${FOTO}/konsol-pratinjau-mendatar.png` });
  // Kembalikan judul asli.
  await judul.fill(asli);
  await g.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(g.getByText("Tersimpan.")).toBeVisible();

  // Pustaka rujukan: admin tanpa tanda Peninjau tidak melihat tombol verifikasi (AC-11).
  await g.getByRole("link", { name: "Rujukan" }).first().click();
  await expect(g.getByText(/^\d+ rujukan, \d+ belum terverifikasi$/)).toBeVisible();
  await expect(g.getByRole("button", { name: "Tandai terverifikasi" })).toHaveCount(0);
  await g.getByRole("button", { name: "+ Rujukan baru" }).click();
  await expect(g.getByRole("dialog")).toBeVisible();
  await g.getByRole("button", { name: "Batal" }).click();
  await g.screenshot({ path: `${FOTO}/konsol-rujukan-1280x720.png` });

  // Paket (AC-12).
  await g.getByRole("link", { name: "Paket" }).first().click();
  await expect(g.getByRole("link", { name: "Paket inti 16" })).toBeVisible();
  await g.getByRole("link", { name: "Paket inti 16" }).click();
  await expect(g.getByLabel("Nama paket")).toHaveValue("Paket inti 16");
  await g.screenshot({ path: `${FOTO}/konsol-paket-1280x720.png` });

  // HP 360 × 640 (konteks baru dengan sesi yang sama): daftar menjadi kartu tanpa meluap (AC-15).
  const sesi = await ctx.storageState();
  await ctx.close();
  const hp = await browser.newContext({ baseURL: baseURL as string, viewport: { width: 360, height: 640 }, timezoneId: "Asia/Makassar", storageState: sesi });
  const h = await hp.newPage();
  await h.goto("/admin/#/kejadian");
  await expect(h.getByRole("link", { name: "K-01" })).toBeVisible();
  await tidakMeluap(h);
  await h.screenshot({ path: `${FOTO}/konsol-kejadian-360x640.png` });
  await h.goto("/admin/#/kejadian/K-02");
  await expect(h.getByLabel("Judul", { exact: true })).toBeVisible();
  await tidakMeluap(h);
  await h.screenshot({ path: `${FOTO}/konsol-penyunting-360x640.png` });
  await hp.close();
});
