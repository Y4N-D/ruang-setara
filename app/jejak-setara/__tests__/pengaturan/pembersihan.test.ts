// Penghapusan otomatis sesudah masa simpan (spesifikasi JS-14, P-62 sampai P-64; AC-21), dengan D1 tiruan.
import { describe, expect, it } from "vitest";
import { HAPUS_KEDALUWARSA_MAKS, hapusRuangKedaluwarsa, MASA_SIMPAN_MS } from "../../../../server/jejak-setara/src/db/ruang";

type Baris = { id: string; kode: string; label_kelas: string; dibuat_pada: number };

function d1Tiruan(baris: Baris[], gagal: Set<string> = new Set()) {
  const catatan: { sql: string; nilai: unknown[] }[] = [];
  const db = {
    prepare(sql: string) {
      const p = {
        nilai: [] as unknown[],
        bind(...n: unknown[]) {
          p.nilai = n;
          catatan.push({ sql, nilai: n });
          return p;
        },
        async all() {
          return { results: baris };
        },
        async first() {
          return { peserta: 3, jawaban: 12 };
        },
      };
      return p;
    },
    async batch(daftar: { nilai: unknown[] }[]) {
      const id = String(daftar[1]?.nilai[0]);
      if (gagal.has(id)) throw new Error("gagal");
      return daftar.map(() => ({ meta: { changes: 1 } }));
    },
  };
  return { db: db as unknown as D1Database, catatan };
}

describe("hapusRuangKedaluwarsa (P-62 sampai P-64)", () => {
  it("365 hari, paling banyak 50 ruang, urut tertua, log audit tanpa pengguna dan tanpa nama pemain", async () => {
    const sekarang = 2_000_000_000_000;
    const baris: Baris[] = [
      { id: "r-1", kode: "AAAAA", label_kelas: "IX A", dibuat_pada: 1 },
      { id: "r-2", kode: "BBBBB", label_kelas: "IX B", dibuat_pada: 2 },
    ];
    const { db, catatan } = d1Tiruan(baris);
    expect(await hapusRuangKedaluwarsa(db, sekarang)).toBe(2);
    expect(MASA_SIMPAN_MS).toBe(365 * 86_400_000);
    expect(HAPUS_KEDALUWARSA_MAKS).toBe(50);
    const pilih = catatan.find((c) => c.sql.startsWith("SELECT id, kode"));
    expect(pilih?.sql).toContain("status = 'ditutup'");
    expect(pilih?.sql).toContain("ORDER BY dibuat_pada");
    expect(pilih?.nilai).toEqual([sekarang - MASA_SIMPAN_MS, 50]);
    const audit = catatan.filter((c) => c.sql.includes("INSERT INTO log_audit"));
    expect(audit).toHaveLength(2);
    expect(audit[0].nilai[1]).toBeNull();
    expect(audit[0].nilai[2]).toBe("ruang.hapus_otomatis");
    expect(JSON.parse(String(audit[0].nilai[4]))).toEqual({ kode: "AAAAA", labelKelas: "IX A", dibuatPada: 1, peserta: 3, jawaban: 12 });
  });

  it("kegagalan satu ruang tidak menghentikan ruang lain", async () => {
    const baris: Baris[] = ["r-1", "r-2", "r-3"].map((id, i) => ({ id, kode: "CCCCC", label_kelas: "IX C", dibuat_pada: i }));
    const { db } = d1Tiruan(baris, new Set(["r-2"]));
    expect(await hapusRuangKedaluwarsa(db, Date.now())).toBe(2);
  });
});
