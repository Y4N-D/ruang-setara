// Antrean kiriman berkunci dan berversi di SQLite ruang (spesifikasi JS-08, P-60 sampai P-62; AC-16, AC-17).
// Dijalankan di SQLite bawaan Node (node:sqlite), seperti uji semai JS-05.
import { describe, expect, it } from "vitest";
import { ambilAntrean, antrekan, hapusTerkirim, jumlahAntrean, kunciKiriman, SQL_TABEL_ANTREAN, type SqlMirip } from "../../../../server/jejak-setara/src/ruang/antrean";
import type { BarisKiriman } from "../../../../server/jejak-setara/src/ruang/inti-ruang";

type ModulSqlite = { DatabaseSync: new (jalur: string) => { exec(sql: string): void; prepare(sql: string): { all(...p: unknown[]): Record<string, unknown>[]; run(...p: unknown[]): { changes: number | bigint } } } };
const sqlite = (process as unknown as { getBuiltinModule?: (n: string) => unknown }).getBuiltinModule?.("node:sqlite") as ModulSqlite | undefined;

function sqlBaru(): SqlMirip {
  const db = new (sqlite as ModulSqlite).DatabaseSync(":memory:");
  return {
    exec(query, ...pengikat) {
      const s = db.prepare(query);
      if (/^\s*select/i.test(query)) return { toArray: () => s.all(...pengikat), rowsWritten: 0 };
      const r = s.run(...pengikat);
      return { toArray: () => [], rowsWritten: Number(r.changes) };
    },
  };
}

const jawaban = (poin: number, langkah2: string | null = null): BarisKiriman => ({
  jenis: "jawaban",
  isi: {
    id: "p1:K-01",
    ruangId: "r1",
    pesertaId: "p1",
    kejadianVersiId: "v1",
    urutanOpsiJson: "{}",
    langkah1Opsi: "1a",
    langkah1Benar: 1,
    petunjukDipakai: 0,
    langkah2Opsi: langkah2,
    tingkat: null,
    poin,
    dibukaPada: 1,
    langkah1Pada: 2,
    langkah2Pada: null,
  },
});
const peserta: BarisKiriman = {
  jenis: "peserta",
  isi: { id: "p1", ruangId: "r1", nama: "Anoa Hijau", avatar: 0, warnaTas: "sun", nomorAbsen: null, skor: 0, waktuSkorMs: null, langkah1Benar: 0, jumlahKejadian: 0, gabungPada: 1, peringkatAkhir: null },
};
const ruang: BarisKiriman = { jenis: "ruang", isi: { ruangId: "r1", status: "main", mulaiPada: 1, selesaiPada: null } };

describe.skipIf(!sqlite)("antrean SQLite ruang", () => {
  it("satu jawaban yang berubah tiga kali tetap satu baris antrean dengan versi naik", () => {
    const sql = sqlBaru();
    sql.exec(SQL_TABEL_ANTREAN);
    antrekan(sql, [jawaban(0)], 10);
    antrekan(sql, [jawaban(40)], 20);
    antrekan(sql, [jawaban(100, "2b")], 30);
    const isi = ambilAntrean(sql);
    expect(isi).toHaveLength(1);
    expect(isi[0]).toMatchObject({ kunci: "jawaban:p1:K-01", versi: 3 });
    expect(isi[0].baris).toEqual(jawaban(100, "2b"));
  });

  it("urutan kirim: ruang, peserta, lalu jawaban, walaupun dimasukkan terbalik", () => {
    const sql = sqlBaru();
    sql.exec(SQL_TABEL_ANTREAN);
    antrekan(sql, [jawaban(0)], 1);
    antrekan(sql, [peserta], 2);
    antrekan(sql, [ruang], 3);
    expect(ambilAntrean(sql).map((a) => a.kunci)).toEqual(["ruang:r1", "peserta:p1", "jawaban:p1:K-01"]);
    expect([ruang, peserta, jawaban(0)].map(kunciKiriman)).toEqual(["ruang:r1", "peserta:p1", "jawaban:p1:K-01"]);
  });

  it("hapus sesudah kirim hanya bila versi belum berubah; kiriman ulang aman", () => {
    const sql = sqlBaru();
    sql.exec(SQL_TABEL_ANTREAN);
    antrekan(sql, [peserta, jawaban(0)], 1);
    const terkirim = ambilAntrean(sql);
    antrekan(sql, [jawaban(40)], 2); // berubah saat kiriman berjalan
    expect(hapusTerkirim(sql, terkirim)).toBe(1);
    const sisa = ambilAntrean(sql);
    expect(sisa).toHaveLength(1);
    expect(sisa[0]).toMatchObject({ kunci: "jawaban:p1:K-01", versi: 2 });
    expect(hapusTerkirim(sql, terkirim)).toBe(0); // kiriman ulang yang sama tidak menghapus apa pun
    expect(hapusTerkirim(sql, sisa)).toBe(1);
    expect(jumlahAntrean(sql)).toBe(0);
  });
});
