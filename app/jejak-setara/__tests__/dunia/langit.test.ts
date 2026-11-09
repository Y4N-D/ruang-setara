// Langit sehari (spesifikasi JS-07, P-9, P-10, P-30 sampai P-32; AC-5 dan AC-12).
import { describe, expect, it } from "vitest";
import { formatSisa, hitungLangit, type WaktuRuangKlien } from "../../pemain/dunia/langit";

const MULAI = 1_000_000;
const main = (berakhirPada: number): WaktuRuangKlien => ({ status: "main", mulaiPada: MULAI, berakhirPada, jedaSejak: null });
const D = 15 * 60_000;

describe("langit dari sisa waktu (P-30)", () => {
  it("lobi dan hitung mundur memakai pagi 06.00", () => {
    for (const status of ["lobi", "hitung_mundur"] as const) {
      const l = hitungLangit({ status, mulaiPada: null, berakhirPada: null, jedaSejak: null }, 15, MULAI);
      expect([l.masa, l.jam, l.kemajuan, l.duaMenit]).toEqual(["pagi", "06.00", 0, false]);
    }
  });

  it("pergantian masa di kemajuan 0,3 dan 0,65; jam cerita 06.00–18.00", () => {
    const l = (t: number) => hitungLangit(main(MULAI + D), 15, MULAI + t);
    expect([l(0).masa, l(0).jam, formatSisa(l(0).sisaMs)]).toEqual(["pagi", "06.00", "15:00"]);
    expect(l(0.3 * D - 1000).masa).toBe("pagi");
    expect([l(0.3 * D).masa, l(0.3 * D).jam]).toEqual(["siang", "09.36"]);
    expect(l(0.65 * D - 1000).masa).toBe("siang");
    expect([l(0.65 * D).masa, l(0.65 * D).jam]).toEqual(["sore", "13.48"]);
    expect([l(D).masa, l(D).jam, l(D).sisaMs]).toEqual(["sore", "18.00", 0]);
  });

  it("persiapan masa berikutnya: sisa waktu sampai berganti", () => {
    const l = hitungLangit(main(MULAI + D), 15, MULAI + 0.3 * D - 10_000);
    expect(l.masaBerikut).toBe("siang");
    expect(l.msSampaiBerikut).toBeCloseTo(10_000, 3);
    const s = hitungLangit(main(MULAI + D), 15, MULAI + 0.65 * D - 4000);
    expect(s.masaBerikut).toBe("sore");
    expect(s.msSampaiBerikut).toBeCloseTo(4000, 3);
    expect(hitungLangit(main(MULAI + D), 15, MULAI + 0.8 * D).masaBerikut).toBeNull();
  });

  it("jeda menghentikan jam; tambah waktu memundurkan langit dan masa", () => {
    const jeda: WaktuRuangKlien = { status: "jeda", mulaiPada: MULAI, berakhirPada: MULAI + D, jedaSejak: MULAI + 0.4 * D };
    const a = hitungLangit(jeda, 15, MULAI + 0.4 * D);
    const b = hitungLangit(jeda, 15, MULAI + 0.9 * D);
    expect([a.jam, a.masa]).toEqual([b.jam, b.masa]);
    const sebelum = hitungLangit(main(MULAI + D), 15, MULAI + 0.31 * D);
    const sesudah = hitungLangit(main(MULAI + D + 120_000), 15, MULAI + 0.31 * D);
    expect([sebelum.masa, sesudah.masa]).toEqual(["siang", "pagi"]);
    expect(sesudah.kemajuan).toBeLessThan(sebelum.kemajuan);
  });

  it("dua menit terakhir: sisa 1–120 detik; bisa kembali tidak aktif sesudah tambah waktu", () => {
    expect(hitungLangit(main(MULAI + D), 15, MULAI + D - 121_000).duaMenit).toBe(false);
    expect(hitungLangit(main(MULAI + D), 15, MULAI + D - 120_000).duaMenit).toBe(true);
    expect(hitungLangit(main(MULAI + D), 15, MULAI + D - 500).duaMenit).toBe(true);
    expect(hitungLangit(main(MULAI + D + 120_000), 15, MULAI + D - 60_000).duaMenit).toBe(false);
  });

  it("sama di setiap perangkat: hanya bergantung pada berakhirPada dan jam server", () => {
    const a = hitungLangit(main(MULAI + D), 15, MULAI + 123_456);
    const b = hitungLangit({ ...main(MULAI + D), mulaiPada: null }, 15, MULAI + 123_456);
    expect(a).toEqual(b);
  });

  it("format sisa waktu MM:SS dibulatkan ke atas per detik", () => {
    expect([formatSisa(0), formatSisa(1), formatSisa(59_001), formatSisa(900_000)]).toEqual(["00:00", "00:01", "01:00", "15:00"]);
  });
});
