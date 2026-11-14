// Token, cookie, dan masa sesi (spesifikasi JS-04, P-6 sampai P-8; AC-3).
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  bacaToken,
  cookieHapus,
  cookieSesi,
  hashToken,
  NAMA_COOKIE,
  perluSentuh,
  SESI_DIAM_MS,
  SESI_MAKS_MS,
  SESI_TULIS_MS,
  sesiSah,
  tokenBaru,
} from "../../../../server/jejak-setara/src/auth/sesi";

const TOKEN = "A".repeat(42) + "w";
const JAM = 3_600_000;
const MENIT = 60_000;

describe("token (P-6)", () => {
  it("32 byte acak dalam base64url, 43 karakter, tanpa padding", () => {
    const a = tokenBaru();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(tokenBaru()).not.toBe(a);
    expect(tokenBaru(() => new Uint8Array(32).fill(255))).toBe("_".repeat(42) + "8");
  });

  it("D1 hanya menyimpan SHA-256 heksadesimal token", async () => {
    expect(await hashToken(TOKEN)).toBe(createHash("sha256").update(TOKEN).digest("hex"));
    expect(await hashToken(TOKEN)).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("cookie (P-6, P-8, D-1a)", () => {
  it("cookie sesi tanpa Max-Age dan tanpa Expires", () => {
    expect(NAMA_COOKIE).toBe("__Host-jejak_sesi");
    expect(cookieSesi(TOKEN)).toBe(`__Host-jejak_sesi=${TOKEN}; Path=/; HttpOnly; Secure; SameSite=Lax`);
    expect(cookieSesi(TOKEN)).not.toMatch(/Max-Age|Expires|Domain/i);
  });

  it("cookie hapus", () => {
    expect(cookieHapus()).toBe("__Host-jejak_sesi=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  });

  it("token dibaca dari tajuk Cookie yang berisi beberapa cookie", () => {
    expect(bacaToken(null)).toBeNull();
    expect(bacaToken("")).toBeNull();
    expect(bacaToken(`__Host-jejak_sesi=${TOKEN}`)).toBe(TOKEN);
    expect(bacaToken(`tema=gelap; __Host-jejak_sesi=${TOKEN}; lain=1`)).toBe(TOKEN);
    expect(bacaToken(`tema=gelap;__Host-jejak_sesi=${TOKEN}`)).toBe(TOKEN);
    expect(bacaToken(`x__Host-jejak_sesi=${TOKEN}`)).toBeNull();
    expect(bacaToken("__Host-jejak_sesi=pendek")).toBeNull();
    expect(bacaToken(`__Host-jejak_sesi=${TOKEN}!`)).toBeNull();
    expect(bacaToken("__Host-jejak_sesi=")).toBeNull();
  });
});

describe("masa sesi (P-7) dengan jam tiruan", () => {
  const dibuat = Date.UTC(2026, 10, 14, 0, 0, 0);
  const sesi = (terakhir: number) => ({ terakhir_dipakai: terakhir, kedaluwarsa: dibuat + SESI_MAKS_MS });

  it("angka P-6 dan P-7", () => {
    expect([SESI_DIAM_MS, SESI_MAKS_MS, SESI_TULIS_MS]).toEqual([8 * JAM, 7 * 24 * JAM, 5 * MENIT]);
  });

  it("berakhir sesudah 8 jam tidak dipakai", () => {
    expect(sesiSah(sesi(dibuat), dibuat + 8 * JAM)).toBe(true);
    expect(sesiSah(sesi(dibuat), dibuat + 8 * JAM + 1)).toBe(false);
  });

  it("berakhir sesudah 7 hari walaupun terus dipakai", () => {
    const akhir = dibuat + 7 * 24 * JAM;
    expect(sesiSah(sesi(akhir - MENIT), akhir)).toBe(true);
    expect(sesiSah(sesi(akhir), akhir + 1)).toBe(false);
  });

  it("terakhir_dipakai ditulis ulang hanya sesudah lebih dari 5 menit", () => {
    expect(perluSentuh(sesi(dibuat), dibuat + 4 * MENIT)).toBe(false);
    expect(perluSentuh(sesi(dibuat), dibuat + 5 * MENIT)).toBe(false);
    expect(perluSentuh(sesi(dibuat), dibuat + 5 * MENIT + 1)).toBe(true);
  });
});
