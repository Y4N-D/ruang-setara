// Kueri D1 untuk ruang, peserta, dan jawaban (spesifikasi JS-03, P-5, P-12, P-47; JS-08, P-3 dan P-62).
// Semua kueri berparameter.
import type { BarisKiriman } from "../ruang/inti-ruang";

export interface BarisRuangD1 {
  id: string;
  do_id: string;
  pengaturan_json: string;
  status: string;
}

export async function cariRuangAktif(db: D1Database, kode: string): Promise<BarisRuangD1 | null> {
  return db
    .prepare("SELECT id, do_id, pengaturan_json, status FROM ruang WHERE kode = ?1 AND status <> 'ditutup'")
    .bind(kode)
    .first<BarisRuangD1>();
}

export async function sisipkanRuangCoba(
  db: D1Database,
  r: { id: string; kode: string; pengaturanJson: string; benih: number; doId: string; dibuatPada: number; paketId?: string | null },
): Promise<"ok" | "bentrok"> {
  try {
    await db
      .prepare(
        "INSERT INTO ruang (id, kode, pemilik_id, label_kelas, paket_id, pengaturan_json, benih, status, uji, do_id, dibuat_pada) VALUES (?1, ?2, NULL, 'Ruang coba', ?7, ?3, ?4, 'lobi', 1, ?5, ?6)",
      )
      .bind(r.id, r.kode, r.pengaturanJson, r.benih, r.doId, r.dibuatPada, r.paketId ?? null)
      .run();
    return "ok";
  } catch (galat) {
    if (/UNIQUE/i.test(String(galat))) return "bentrok";
    throw galat;
  }
}

export async function tandaiRuangDitutup(db: D1Database, id: string, sekarang: number): Promise<void> {
  await db.prepare("UPDATE ruang SET status = 'ditutup', selesai_pada = COALESCE(selesai_pada, ?2) WHERE id = ?1").bind(id, sekarang).run();
}

/** Pemicu harian: ruang yang dibuat lebih dari 24 jam lalu tetapi belum ditutup ditandai ditutup. */
export async function tandaiRuangLama(db: D1Database, sekarang: number): Promise<void> {
  await db
    .prepare("UPDATE ruang SET status = 'ditutup', selesai_pada = COALESCE(selesai_pada, ?1) WHERE status <> 'ditutup' AND dibuat_pada < ?2")
    .bind(sekarang, sekarang - 24 * 3_600_000)
    .run();
}

const UPSERT_PESERTA =
  "INSERT INTO peserta (id, ruang_id, nama_samaran, avatar, warna_tas, nomor_absen, skor, waktu_skor_ms, langkah1_benar, jumlah_kejadian, gabung_pada, peringkat_akhir) " +
  "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12) ON CONFLICT(id) DO UPDATE SET nama_samaran = excluded.nama_samaran, " +
  "avatar = excluded.avatar, warna_tas = excluded.warna_tas, nomor_absen = excluded.nomor_absen, skor = excluded.skor, " +
  "waktu_skor_ms = excluded.waktu_skor_ms, langkah1_benar = excluded.langkah1_benar, jumlah_kejadian = excluded.jumlah_kejadian, " +
  "peringkat_akhir = excluded.peringkat_akhir";
const UPSERT_JAWABAN =
  "INSERT INTO jawaban (id, ruang_id, peserta_id, kejadian_versi_id, urutan_opsi_json, langkah1_opsi, langkah1_benar, petunjuk_dipakai, " +
  "langkah2_opsi, tingkat, poin, dibuka_pada, langkah1_pada, langkah2_pada) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14) " +
  "ON CONFLICT(id) DO UPDATE SET urutan_opsi_json = excluded.urutan_opsi_json, langkah1_opsi = excluded.langkah1_opsi, " +
  "langkah1_benar = excluded.langkah1_benar, petunjuk_dipakai = excluded.petunjuk_dipakai, langkah2_opsi = excluded.langkah2_opsi, " +
  "tingkat = excluded.tingkat, poin = excluded.poin, langkah1_pada = excluded.langkah1_pada, langkah2_pada = excluded.langkah2_pada";
const UBAH_RUANG =
  "UPDATE ruang SET status = ?2, mulai_pada = COALESCE(?3, mulai_pada), selesai_pada = COALESCE(?4, selesai_pada) WHERE id = ?1";

/**
 * Mengirim antrean kiriman dalam batch berisi paling banyak 50 pernyataan, menurut urutan masukan (ruang, peserta,
 * lalu jawaban, agar kunci asing terpenuhi; JS-08, P-62). Pengiriman ulang aman (idempoten).
 */
export async function kirimKeD1(db: D1Database, baris: readonly BarisKiriman[]): Promise<void> {
  const pernyataan = baris.map((b) =>
    b.jenis === "jawaban"
      ? db
          .prepare(UPSERT_JAWABAN)
          .bind(
            b.isi.id,
            b.isi.ruangId,
            b.isi.pesertaId,
            b.isi.kejadianVersiId,
            b.isi.urutanOpsiJson,
            b.isi.langkah1Opsi,
            b.isi.langkah1Benar,
            b.isi.petunjukDipakai,
            b.isi.langkah2Opsi,
            b.isi.tingkat,
            b.isi.poin,
            b.isi.dibukaPada,
            b.isi.langkah1Pada,
            b.isi.langkah2Pada,
          )
      : b.jenis === "peserta"
      ? db
          .prepare(UPSERT_PESERTA)
          .bind(
            b.isi.id,
            b.isi.ruangId,
            b.isi.nama,
            b.isi.avatar,
            b.isi.warnaTas,
            b.isi.nomorAbsen,
            b.isi.skor,
            b.isi.waktuSkorMs,
            b.isi.langkah1Benar,
            b.isi.jumlahKejadian,
            b.isi.gabungPada,
            b.isi.peringkatAkhir,
          )
      : db.prepare(UBAH_RUANG).bind(b.isi.ruangId, b.isi.status, b.isi.mulaiPada, b.isi.selesaiPada),
  );
  for (let i = 0; i < pernyataan.length; i += 50) await db.batch(pernyataan.slice(i, i + 50));
}
