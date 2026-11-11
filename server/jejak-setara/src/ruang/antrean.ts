// Antrean kiriman ke D1 di SQLite ruang (spesifikasi JS-08, P-60 sampai P-62; Architecture 5.3 dan 8.6).
// Satu baris per baris D1 berkunci `jenis:id`, diperbarui di tempat dengan `versi` yang naik, sehingga satu jawaban
// yang berubah tiga kali tetap satu baris antrean. Baris dikirim berurutan menurut `urutan` (ruang 0, peserta 1,
// jawaban 2) lalu `dibuat_pada`, agar kunci asing D1 terpenuhi, dan dihapus sesudah terkirim hanya bila versinya
// belum berubah. Tabel `kiriman` lama (ruang sebelum JS-08) dikuras lebih dulu oleh RuangJejak.ts.
// Hanya memakai `exec` gaya SqlStorage, agar bisa diuji di Node dengan node:sqlite.
import type { BarisKiriman } from "./inti-ruang";

/** Bagian SqlStorage Durable Object yang dipakai (exec dengan pengikat, toArray, dan rowsWritten). */
export interface SqlMirip {
  exec(query: string, ...pengikat: unknown[]): { toArray(): Record<string, unknown>[]; rowsWritten: number };
}

export const URUTAN_KIRIMAN: Readonly<Record<BarisKiriman["jenis"], number>> = { ruang: 0, peserta: 1, jawaban: 2 };

export function kunciKiriman(b: BarisKiriman): string {
  if (b.jenis === "ruang") return `ruang:${b.isi.ruangId}`;
  return `${b.jenis}:${b.isi.id}`;
}

export const SQL_TABEL_ANTREAN =
  "CREATE TABLE IF NOT EXISTS antrean (kunci TEXT PRIMARY KEY, jenis TEXT NOT NULL, urutan INTEGER NOT NULL, isi_json TEXT NOT NULL, " +
  "versi INTEGER NOT NULL, dibuat_pada INTEGER NOT NULL)";

/** Upsert setiap baris; mengembalikan jumlah baris SQLite yang ditulis. */
export function antrekan(sql: SqlMirip, baris: readonly BarisKiriman[], sekarang: number): number {
  let ditulis = 0;
  for (const b of baris) {
    const c = sql.exec(
      "INSERT INTO antrean (kunci, jenis, urutan, isi_json, versi, dibuat_pada) VALUES (?, ?, ?, ?, 1, ?) " +
        "ON CONFLICT(kunci) DO UPDATE SET isi_json = excluded.isi_json, versi = antrean.versi + 1",
      kunciKiriman(b),
      b.jenis,
      URUTAN_KIRIMAN[b.jenis],
      JSON.stringify(b.isi),
      sekarang,
    );
    ditulis += c.rowsWritten;
  }
  return ditulis;
}

export interface BarisAntrean {
  kunci: string;
  versi: number;
  baris: BarisKiriman;
}

/** Seluruh antrean, berurutan menurut urutan lalu dibuat_pada (lalu kunci, agar tetap). */
export function ambilAntrean(sql: SqlMirip): BarisAntrean[] {
  return sql
    .exec("SELECT kunci, jenis, isi_json, versi FROM antrean ORDER BY urutan, dibuat_pada, kunci")
    .toArray()
    .map((r) => ({ kunci: String(r.kunci), versi: Number(r.versi), baris: { jenis: r.jenis, isi: JSON.parse(String(r.isi_json)) } as BarisKiriman }));
}

/** Menghapus baris yang terkirim, hanya bila versinya masih sama dengan yang dikirim. */
export function hapusTerkirim(sql: SqlMirip, terkirim: readonly Pick<BarisAntrean, "kunci" | "versi">[]): number {
  let ditulis = 0;
  for (const t of terkirim) ditulis += sql.exec("DELETE FROM antrean WHERE kunci = ? AND versi = ?", t.kunci, t.versi).rowsWritten;
  return ditulis;
}

export function jumlahAntrean(sql: SqlMirip): number {
  return Number(sql.exec("SELECT COUNT(*) AS n FROM antrean").toArray()[0]?.n ?? 0);
}
