// Uji unit fungsi murni unduh rekap (spesifikasi F-09, AC-24): nama berkas, tanggal lembar, dan batas waktu.
import { afterEach, describe, expect, it, vi } from "vitest";
import { DOWNLOAD_TIMEOUT_MS, downloadFileName, SHEET_SIZE, sheetDate, withTimeout } from "../ui/download";

afterEach(() => {
  vi.useRealTimers();
});

describe("konstanta", () => {
  it("batas waktu 15 detik dan lembar A4 150 dpi", () => {
    expect(DOWNLOAD_TIMEOUT_MS).toBe(15_000);
    expect(SHEET_SIZE).toEqual({ w: 1240, h: 1754 });
  });
});

describe("nama berkas (A-5)", () => {
  it("tanggal waktu setempat, bulan dan tanggal dua angka", () => {
    expect(downloadFileName("png", new Date(2026, 9, 27, 16, 55))).toBe("rekap-sehari-setara-2026-10-27.png");
    expect(downloadFileName("pdf", new Date(2026, 9, 27, 0, 0))).toBe("rekap-sehari-setara-2026-10-27.pdf");
    expect(downloadFileName("png", new Date(2027, 0, 5, 23, 59))).toBe("rekap-sehari-setara-2027-01-05.png");
  });
});

describe("tanggal lembar (A-3)", () => {
  it("hari, tanggal, bulan, dan tahun dalam bahasa Indonesia", () => {
    expect(sheetDate(new Date(2026, 9, 27))).toBe("Selasa, 27 Oktober 2026");
    expect(sheetDate(new Date(2027, 0, 5))).toBe("Selasa, 5 Januari 2027");
  });
});

describe("batas waktu (A-7)", () => {
  it("ditolak sesudah batas waktu bila promise belum selesai", async () => {
    vi.useFakeTimers();
    const waiting = withTimeout(new Promise<never>(() => undefined), DOWNLOAD_TIMEOUT_MS);
    const outcome = waiting.then(
      () => "selesai",
      () => "ditolak",
    );
    await vi.advanceTimersByTimeAsync(DOWNLOAD_TIMEOUT_MS - 1);
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(await outcome).toBe("ditolak");
  });

  it("meneruskan hasil dan galat, lalu membersihkan pewaktunya", async () => {
    vi.useFakeTimers();
    await expect(withTimeout(Promise.resolve("berkas"), DOWNLOAD_TIMEOUT_MS)).resolves.toBe("berkas");
    expect(vi.getTimerCount()).toBe(0);
    await expect(withTimeout(Promise.reject(new Error("gagal")), DOWNLOAD_TIMEOUT_MS)).rejects.toThrow("gagal");
    expect(vi.getTimerCount()).toBe(0);
  });
});
