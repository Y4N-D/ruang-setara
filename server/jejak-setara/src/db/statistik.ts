// Kueri D1 statistik per kejadian lintas ruang (spesifikasi JS-13, P-3, P-4, P-12, dan P-13). Ruang yang memenuhi
// saringan dipilih lebih dulu lewat indeks (`ruang_dibuat`, atau `ruang_pemilik` bila ada guru), lalu jawabannya dibaca
// lewat `jawaban_ruang` dalam satu pernyataan; median memakai hitungan per detik. Semua kueri berparameter.
import { WAKTU_MAKS } from "../../../../app/jejak-setara/inti/hasil";
import type { BarisAgregat, SaringanStatistik, VersiStatistik } from "../../../../app/jejak-setara/inti/statistik";

/** Ruang yang dihitung (P-3) tanpa kepemilikan dan saringan. */
export const SYARAT_RUANG_STATISTIK =
  "r.uji = 0 AND r.status IN ('selesai', 'pembahasan', 'ditutup') AND r.mulai_pada IS NOT NULL AND r.selesai_pada IS NOT NULL AND r.mulai_pada <= r.selesai_pada";

/** CTE ruang yang dihitung: parameter ?1 guru, ?2 dari, ?3 sampai, ?4 label, ?5 paket. */
function cteRuang(denganGuru: boolean): string {
  return (
    "rr AS MATERIALIZED (SELECT r.id, EXISTS (SELECT 1 FROM json_each(r.pengaturan_json, '$.skillAktif') WHERE value = 'petunjuk') AS pa FROM ruang r WHERE " +
    (denganGuru ? "r.pemilik_id = ?1" : "?1 IS NULL") +
    " AND r.dibuat_pada >= ?2 AND r.dibuat_pada < ?3 AND " +
    SYARAT_RUANG_STATISTIK +
    " AND (?4 IS NULL OR instr(lower(r.label_kelas), lower(?4)) > 0) AND (?5 IS NULL OR r.paket_id = ?5))"
  );
}

const CTE_KELUAR = "kk AS MATERIALIZED (SELECT s.id FROM rr CROSS JOIN peserta s ON s.ruang_id = rr.id WHERE s.dikeluarkan = 1)";

/** P-13: agregat per versi dan pilihan, ditambah hitungan per detik waktu menjawab, dalam satu pernyataan. */
export function sqlStatistik(denganGuru: boolean): string {
  return (
    `WITH ${cteRuang(denganGuru)}, ${CTE_KELUAR}, ` +
    "d AS MATERIALIZED (SELECT j.kejadian_versi_id AS v, j.langkah1_opsi AS o1, j.langkah2_opsi AS o2, rr.pa AS pa, j.petunjuk_dipakai AS pt, " +
    "CASE WHEN j.langkah2_opsi IS NULL OR j.langkah2_pada IS NULL THEN NULL ELSE MAX(0, (j.langkah2_pada - j.dibuka_pada + 500) / 1000) END AS detik " +
    "FROM rr CROSS JOIN jawaban j ON j.ruang_id = rr.id WHERE j.langkah1_opsi IS NOT NULL AND j.peserta_id NOT IN (SELECT id FROM kk)) " +
    "SELECT 0 AS jenis, v, o1, o2, NULL AS detik, COUNT(*) AS n, SUM(pa) AS np, SUM(pa * pt) AS pt FROM d GROUP BY v, o1, o2 " +
    "UNION ALL SELECT 1, v, NULL, NULL, detik, COUNT(*), NULL, NULL FROM d WHERE detik IS NOT NULL GROUP BY v, detik"
  );
}

/** Jumlah ruang dan peserta tidak dikeluarkan (cakupan, P-12). */
export function sqlCakupan(denganGuru: boolean): string {
  return `WITH ${cteRuang(denganGuru)} SELECT (SELECT COUNT(*) FROM rr) AS ruang, (SELECT COUNT(*) FROM rr CROSS JOIN peserta s ON s.ruang_id = rr.id WHERE s.dikeluarkan = 0) AS pemain`;
}

/** Paket dari ruang yang dihitung milik pengguna, tanpa saringan lain (P-12). */
export const SQL_PAKET_STATISTIK =
  `SELECT DISTINCT p.id, p.nama FROM ruang r JOIN paket p ON p.id = r.paket_id WHERE (?1 IS NULL OR r.pemilik_id = ?1) AND ${SYARAT_RUANG_STATISTIK} ORDER BY p.nama`;

export const SQL_ISI_VERSI_STATISTIK =
  "SELECT kv.id, k.kode, kv.nomor, kv.isi_json FROM kejadian_versi kv JOIN kejadian k ON k.id = kv.kejadian_id WHERE kv.jenis = 'terbit' AND kv.id IN (SELECT value FROM json_each(?1))";

export interface DataStatistik {
  baris: BarisAgregat[];
  ruang: number;
  pemain: number;
  paket: { id: string; nama: string }[];
  versi: VersiStatistik[];
}

/**
 * Paling banyak empat pernyataan dalam dua perjalanan (P-13): statistik, cakupan, dan pilihan paket dalam satu batch,
 * lalu isi versi. `pemilik` menyaring ruang statistik (guru, atau saringan guru admin); `pemilikPilihan` ruang untuk
 * pilihan paket (guru saja).
 */
export async function bacaStatistik(db: D1Database, s: SaringanStatistik, pemilik: string | null, pemilikPilihan: string | null): Promise<DataStatistik> {
  const ikat = [pemilik, s.dari ?? 0, s.sampai ?? WAKTU_MAKS, s.label, s.paket];
  const denganGuru = pemilik !== null;
  const [agregat, cakupan, paket] = await db.batch([
    db.prepare(sqlStatistik(denganGuru)).bind(...ikat),
    db.prepare(sqlCakupan(denganGuru)).bind(...ikat),
    db.prepare(SQL_PAKET_STATISTIK).bind(pemilikPilihan),
  ]);
  const baris = (agregat.results ?? []) as unknown as BarisAgregat[];
  const c = ((cakupan.results ?? [])[0] ?? { ruang: 0, pemain: 0 }) as { ruang: number; pemain: number };
  const id = [...new Set(baris.map((b) => b.v))];
  const versi = id.length > 0 ? ((await db.prepare(SQL_ISI_VERSI_STATISTIK).bind(JSON.stringify(id)).all<VersiStatistik>()).results ?? []) : [];
  return { baris, ruang: c.ruang ?? 0, pemain: c.pemain ?? 0, paket: (paket.results ?? []) as unknown as { id: string; nama: string }[], versi };
}
