// Rencana kueri SQLite dengan migrasi repositori (spesifikasi JS-13, P-13 dan P-29; AC-6, AC-13): ruang dipilih lebih
// dulu lewat indeks, lalu jawaban lewat `jawaban_ruang`, tanpa penelusuran penuh tabel jawaban.
import { describe, expect, it } from "vitest";
import { daftarRiwayat, sesiTerakhir } from "../../../../server/jejak-setara/src/db/ruang";
import { sqlStatistik } from "../../../../server/jejak-setara/src/db/statistik";
import { D1Tiruan, sqlite } from "../akun/d1Tiruan";

function rencana(d1: D1Tiruan, sql: string, nilai: (string | number | null)[]): string {
  const p = d1.basis.prepare(`EXPLAIN QUERY PLAN ${sql}`);
  return (p.all(...nilai) as { detail: string }[]).map((r) => r.detail).join(" | ");
}

describe.skipIf(!sqlite)("rencana kueri JS-13", () => {
  it("statistik tanpa guru memakai ruang_dibuat lalu jawaban_ruang", () => {
    const r = rencana(new D1Tiruan(), sqlStatistik(false), [null, 0, 1e15, null, null]);
    expect(r).toContain("SEARCH r USING INDEX ruang_dibuat");
    expect(r).toContain("SEARCH j USING INDEX jawaban_ruang");
    expect(r).not.toMatch(/SCAN j\b/);
  });
  it("statistik dengan guru memakai ruang_pemilik", () => {
    const r = rencana(new D1Tiruan(), sqlStatistik(true), ["g1", 0, 1e15, null, null]);
    expect(r).toContain("SEARCH r USING INDEX ruang_pemilik");
    expect(r).toContain("SEARCH j USING INDEX jawaban_ruang");
    expect(r).not.toMatch(/SCAN j\b/);
  });
  it("riwayat dan sesi terakhir memilih ruang lewat indeks sebelum menghitung peserta", async () => {
    const d1 = new D1Tiruan();
    const sql: { s: string; v: (string | number | null)[] }[] = [];
    const asli = d1.prepare.bind(d1);
    d1.prepare = (s: string) => {
      const p = asli(s);
      const ikat = p.bind.bind(p);
      p.bind = (...v: unknown[]) => {
        sql.push({ s, v: v as (string | number | null)[] });
        return ikat(...v);
      };
      return p;
    };
    await daftarRiwayat(d1 as unknown as D1Database, { pemilikId: null, dari: null, sampai: null, label: null, mulai: null, batas: 50 });
    await sesiTerakhir(d1 as unknown as D1Database, null, 5);
    expect(sql).toHaveLength(2);
    for (const { s, v } of sql) {
      const r = rencana(d1, s, v);
      expect(r).toContain("USING INDEX ruang_dibuat");
      expect(r).toContain("SEARCH s USING INDEX peserta_ruang");
    }
  });
});
