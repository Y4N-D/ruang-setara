// Perkiraan biaya uji beban (spesifikasi JS-15, P-3 dan P-4).
import { describe, expect, it } from "vitest";
import { BATAS_PERMINTAAN_PER_RUN, KUOTA_BULANAN, perkiraanBiaya, perkiraanSkenario, SKENARIO, teksPerkiraan } from "../../../../scripts/jejak-setara/biaya-beban.mjs";

describe("perkiraanBiaya (P-3)", () => {
  it("satu ruang 50 bot, 15 menit menjelajah tanpa lobi: sekitar 18.100 permintaan, sama dengan Build JS-08 dan Plan JS-15", () => {
    const p = perkiraanBiaya({ ruang: 1, botPerRuang: 50, detikLobi: 0, detikJelajah: 900 });
    expect(p.permintaanDO).toBeGreaterThan(18_000);
    expect(p.permintaanDO).toBeLessThan(18_200);
    expect(p.gbDetik).toBe(Math.round((900 + 120) * 0.125));
  });

  it("ruang 100 bot memakai laju ruang besar: sekitar 22.200 permintaan per 15 menit (Build JS-08)", () => {
    const p = perkiraanBiaya({ ruang: 1, botPerRuang: 100, detikLobi: 0, detikJelajah: 900 });
    expect(Math.abs(p.permintaanDO - 22_200)).toBeLessThan(400);
  });

  it("kelima skenario P-12 di bawah batas 400.000 permintaan per run; jumlah satu putaran D-2 sekitar 25% kuota bulanan", () => {
    const semua = Object.keys(SKENARIO).map((n) => [n, perkiraanSkenario(n)] as const);
    for (const [n, p] of semua) expect(p.permintaanDO, n).toBeLessThan(BATAS_PERMINTAAN_PER_RUN);
    const jarakJauh = semua.filter(([n]) => SKENARIO[n as keyof typeof SKENARIO].sasaran === "uji").reduce((s, [, p]) => s + p.permintaanDO, 0);
    expect(jarakJauh).toBeGreaterThan(200_000);
    expect(jarakJauh).toBeLessThan(0.3 * KUOTA_BULANAN.permintaanDO);
    expect(perkiraanSkenario("s2").permintaanDOPerRuang).toBe(perkiraanSkenario("s1").permintaanDOPerRuang);
  });

  it("teks perkiraan menyebut permintaan, GB-detik, baris, dan persen kuota", () => {
    const t = teksPerkiraan(perkiraanSkenario("singkat"));
    expect(t).toMatch(/^Perkiraan: ±[\d.]+ permintaan Durable Object \([\d.]+% kuota bulanan\), ±[\d.]+ GB-detik \([\d.]+%\), ±[\d.]+ baris ditulis \([\d.]+%\)\.$/);
    expect(() => perkiraanSkenario("s9")).toThrow("skenario tidak dikenal");
  });
});
