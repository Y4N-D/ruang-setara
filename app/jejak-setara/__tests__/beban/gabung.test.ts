// Penggabung hasil uji beban dan ambang lulus (spesifikasi JS-15, P-13 dan P-14).
import { describe, expect, it } from "vitest";
import { gabungHasil, teksRingkasan, tumpangTindihMain } from "../../../../scripts/jejak-setara/gabung-beban.mjs";
import { perkiraanBiaya } from "../../../../scripts/jejak-setara/biaya-beban.mjs";

const MENIT = 60_000;
function hasil(ruang: number, bot: number, ubah: Record<string, unknown> = {}) {
  const perkiraan = perkiraanBiaya({ ruang, botPerRuang: bot, detikLobi: 180, detikJelajah: 900 });
  return {
    perkiraanBiaya: perkiraan,
    rttSepiMsP95: 210,
    waktuRuang: Array.from({ length: ruang }, () => ({ mainMulai: 0, mainAkhir: 15 * MENIT })),
    sambunganPutusTakTerduga: 0,
    pesanDitolakServer: 0,
    jelajah: { gerakDikoreksiPersen: 0.2, mbTurunPerPemainPer15Menit: 2.1, rttMsP95: 240 },
    akhirRonde: { botMenerimaSelesai: ruang * bot, pesertaD1: Array.from({ length: ruang }, () => bot) },
    pemakaianRuang: Array.from({ length: ruang }, () => ({ perkiraanPermintaan: perkiraan.permintaanDOPerRuang, rttP95Ms: 230 })),
    ...ubah,
  };
}
const gagal = (laporan: ReturnType<typeof gabungHasil>) => laporan.ambang.filter((a) => !a.lulus).map((a) => a.nama);

describe("gabungHasil (P-14)", () => {
  it("s1 dengan semua angka baik: lulus, dan ringkasan memuat tabel", () => {
    const l = gabungHasil("s1", [hasil(1, 50)]);
    expect(gagal(l)).toEqual([]);
    expect(l.lulus).toBe(true);
    expect(teksRingkasan(l)).toContain("| Gerak jujur dikoreksi (%) | 0.2 | < 1 | Lulus |");
  });

  it("setiap ambang bisa gagal sendiri", () => {
    expect(gagal(gabungHasil("s1", [hasil(1, 50, { sambunganPutusTakTerduga: 1 })]))).toEqual(["Sambungan putus tak terduga"]);
    expect(gagal(gabungHasil("s1", [hasil(1, 50, { pesanDitolakServer: 2 })]))).toEqual(["Pesan ditolak server"]);
    expect(gagal(gabungHasil("s1", [hasil(1, 50, { jelajah: { gerakDikoreksiPersen: 1, mbTurunPerPemainPer15Menit: 2, rttMsP95: 240 } })]))).toEqual(["Gerak jujur dikoreksi (%)"]);
    expect(gagal(gabungHasil("s1", [hasil(1, 50, { jelajah: { gerakDikoreksiPersen: 0, mbTurunPerPemainPer15Menit: 3.2, rttMsP95: 240 } })]))).toEqual(["Data turun per pemain per 15 menit (MB)"]);
    expect(gagal(gabungHasil("s1", [hasil(1, 50, { jelajah: { gerakDikoreksiPersen: 0, mbTurunPerPemainPer15Menit: 2, rttMsP95: 261 } })]))).toEqual(["Kenaikan p95 pulang-pergi bersih (ms)"]);
    expect(gagal(gabungHasil("s1", [hasil(1, 50, { rttSepiMsP95: null })]))).toEqual(["Kenaikan p95 pulang-pergi bersih (ms)"]);
    expect(gagal(gabungHasil("s1", [hasil(1, 50, { akhirRonde: { botMenerimaSelesai: 49, pesertaD1: [49] } })]))).toEqual(["Bot menerima selesai", "Peserta di D1 per ruang"]);
    const p = perkiraanBiaya({ ruang: 1, botPerRuang: 50, detikLobi: 180, detikJelajah: 900 }).permintaanDOPerRuang;
    expect(gagal(gabungHasil("s1", [hasil(1, 50, { pemakaianRuang: [{ perkiraanPermintaan: Math.round(p * 1.3) }] })]))).toEqual([
      "Selisih permintaan Durable Object per ruang dari perkiraan (%)",
    ]);
    expect(gagal(gabungHasil("s2", [hasil(2, 50), hasil(2, 50)]))).toEqual(["Jumlah pekerjaan dengan hasil", "Bot menerima selesai", "Peserta di D1 per ruang", "Selisih permintaan Durable Object per ruang dari perkiraan (%)"]);
  });

  it("D-6 a dan D-7 a: sambung ulang yang pulih paling banyak 5% bot; kode penutupan dan ping tersendat masuk ringkasan", () => {
    const satu = gabungHasil("s1", [hasil(1, 50, { sambungUlangPulih: 1, kodeTutupTakTerduga: { "1006": 1 } })]);
    expect(gagal(satu)).toEqual([]);
    expect(satu.ringkasan).toMatchObject({ sambungUlangPulih: 1, kodeTutupTakTerduga: { "1006": 1 } });
    expect(teksRingkasan(satu)).toContain("Sambung ulang yang pulih: 1 (kode penutupan: 1006 × 1).");
    expect(gagal(gabungHasil("s1", [hasil(1, 50, { sambungUlangPulih: 2 })]))).toEqual([]);
    expect(gagal(gabungHasil("s1", [hasil(1, 50, { sambungUlangPulih: 3 })]))).toEqual(["Sambung ulang yang pulih (% bot)"]);
    const tersendat = gabungHasil("s1", [hasil(1, 50, { jelajah: { gerakDikoreksiPersen: 0, mbTurunPerPemainPer15Menit: 1, rttMsP95: 240, rttMsMaks: 6400, pingTersendat: 3 } })]);
    expect(teksRingkasan(tersendat)).toContain("Ping tersendat (lebih dari 2 detik): 3; waktu pulang-pergi terlama 6400 ms.");
  });

  it("D-9 a: kenaikan p95 dikurangi p95 jeda event loop mesin bot; angka mentah tetap di ringkasan", () => {
    const sibuk = gabungHasil("s1", [hasil(1, 50, { jelajah: { gerakDikoreksiPersen: 0, mbTurunPerPemainPer15Menit: 1, rttMsP95: 268, jedaEventLoopMsP95: 31.5 } })]);
    expect(gagal(sibuk)).toEqual([]);
    expect(sibuk.ambang.find((a) => a.nama === "Kenaikan p95 pulang-pergi bersih (ms)")!.nilai).toBe(27);
    expect(teksRingkasan(sibuk)).toContain("Kenaikan p95 mentah 58 ms, dengan p95 jeda event loop mesin bot 31.5 ms.");
    expect(gagal(gabungHasil("s1", [hasil(1, 50, { jelajah: { gerakDikoreksiPersen: 0, mbTurunPerPemainPer15Menit: 1, rttMsP95: 290, jedaEventLoopMsP95: 20 } })]))).toEqual([
      "Kenaikan p95 pulang-pergi bersih (ms)",
    ]);
  });

  it("rincian per pekerjaan, putus per ruang dan per menit, dan p95 server per ruang masuk ringkasan", () => {
    const satu = hasil(2, 50, {
      bagian: 2,
      waktuRuang: [
        { kode: "AAAAA", mainMulai: 0, mainAkhir: 15 * MENIT },
        { kode: "BBBBB", mainMulai: 0, mainAkhir: 15 * MENIT },
      ],
      putusPerRuang: { AAAAA: 3, BBBBB: 0 },
      putusPerMenit: { "7": 3 },
      pingTersendatPerRuang: { AAAAA: 4, BBBBB: 0 },
    });
    const l = gabungHasil("s2", [satu, ...Array.from({ length: 4 }, () => hasil(2, 50))]);
    expect(l.rincian[0]).toMatchObject({ ruang: [], putus: 0 });
    expect(l.rincian.find((x) => x.bagian === 2)).toMatchObject({ ruang: ["AAAAA", "BBBBB"], putus: 3, bersih: 30 });
    const teks = teksRingkasan(l);
    expect(teks).toContain("| 2 | AAAAA BBBBB | 210 | 240 | - | 30 | 3 | 0 |");
    expect(teks).toContain("Putus per ruang: AAAAA 3, BBBBB 0. Putus per menit sejak ronde mulai: menit 7: 3.");
    expect(teks).toContain("Ping tersendat per ruang: AAAAA 4, BBBBB 0. p95 pulang-pergi menurut server per ruang: AAAAA 230 ms, BBBBB 230 ms.");
  });

  it("s2: lima pekerjaan, sepuluh ruang main bersamaan sedikitnya 14 menit", () => {
    const lima = Array.from({ length: 5 }, () => hasil(2, 50));
    expect(gagal(gabungHasil("s2", lima))).toEqual([]);
    lima[3] = hasil(2, 50, { waktuRuang: [{ mainMulai: 0, mainAkhir: 15 * MENIT }, { mainMulai: 2 * MENIT, mainAkhir: 17 * MENIT }] });
    expect(tumpangTindihMain(lima)).toBe(13 * MENIT);
    expect(gagal(gabungHasil("s2", lima))).toEqual(["Semua ruang main bersamaan (menit)"]);
  });

  it("lokal-10x50 tidak menilai kenaikan pulang-pergi (tanpa pengukur sepi)", () => {
    const l = gabungHasil("lokal-10x50", [{ ...hasil(10, 50), rttSepiMsP95: null, perkiraanBiaya: perkiraanBiaya({ ruang: 10, botPerRuang: 50, detikLobi: 60, detikJelajah: 300 }), pemakaianRuang: Array.from({ length: 10 }, () => ({ perkiraanPermintaan: perkiraanBiaya({ ruang: 10, botPerRuang: 50, detikLobi: 60, detikJelajah: 300 }).permintaanDOPerRuang })) }]);
    expect(l.ambang.map((a) => a.nama)).not.toContain("Kenaikan p95 pulang-pergi bersih (ms)");
    expect(l.lulus).toBe(true);
  });
});
