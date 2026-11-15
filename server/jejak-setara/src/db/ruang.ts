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
/** Mengirim baris ke D1; mengembalikan jumlah baris D1 yang ditulis (JS-22, P-15). */
export async function kirimKeD1(db: D1Database, baris: readonly BarisKiriman[]): Promise<number> {
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
  let ditulis = 0;
  for (let i = 0; i < pernyataan.length; i += 50) {
    for (const h of await db.batch(pernyataan.slice(i, i + 50))) ditulis += h.meta?.rows_written ?? 0;
  }
  return ditulis;
}

// ---------------------------------------------------------------------------------------------
// Ruang dari konsol (spesifikasi JS-10, P-3 sampai P-8)

export interface BarisRuangKonsol {
  id: string;
  kode: string;
  pemilik_id: string | null;
  label_kelas: string;
  status: string;
  uji: number;
  pengaturan_json: string;
  dibuat_pada: number;
  do_id: string;
  nama_guru: string | null;
  ringkasan_json: string | null;
  jumlah_peserta: number;
}

const PILIH_RUANG_KONSOL =
  "SELECT r.id, r.kode, r.pemilik_id, r.label_kelas, r.status, r.uji, r.pengaturan_json, r.dibuat_pada, r.do_id, " +
  "g.nama_tampilan AS nama_guru, r.ringkasan_json, (SELECT COUNT(*) FROM peserta s WHERE s.ruang_id = r.id) AS jumlah_peserta " +
  "FROM ruang r LEFT JOIN pengguna g ON g.id = r.pemilik_id ";

export interface RuangBaruD1 {
  id: string;
  kode: string;
  pemilikId: string;
  labelKelas: string;
  paketId: string;
  pengaturanJson: string;
  benih: number;
  uji: boolean;
  doId: string;
  dibuatPada: number;
}

/**
 * Sisip ruang bersyarat dalam satu pernyataan (P-4): gagal bila ruang aktif di lingkungan ini sudah `batasAktif`, atau
 * bila `satuPerPemilik` dan pemilik sudah punya ruang aktif. Ruang aktif: belum ditutup dan dibuat sesudah `sejak`.
 */
export async function sisipkanRuang(
  db: D1Database,
  r: RuangBaruD1,
  aturan: { sejak: number; batasAktif: number; satuPerPemilik: boolean },
): Promise<"ok" | "bentrok" | "ditolak"> {
  try {
    const hasil = await db
      .prepare(
        "INSERT INTO ruang (id, kode, pemilik_id, label_kelas, paket_id, pengaturan_json, benih, status, uji, do_id, dibuat_pada) " +
          "SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, 'lobi', ?8, ?9, ?10 " +
          "WHERE (SELECT COUNT(*) FROM ruang WHERE status <> 'ditutup' AND dibuat_pada > ?11) < ?12 " +
          "AND (?13 = 0 OR NOT EXISTS (SELECT 1 FROM ruang WHERE pemilik_id = ?3 AND status <> 'ditutup' AND dibuat_pada > ?11))",
      )
      .bind(r.id, r.kode, r.pemilikId, r.labelKelas, r.paketId, r.pengaturanJson, r.benih, r.uji ? 1 : 0, r.doId, r.dibuatPada, aturan.sejak, aturan.batasAktif, aturan.satuPerPemilik ? 1 : 0)
      .run();
    return (hasil.meta?.changes ?? 0) > 0 ? "ok" : "ditolak";
  } catch (galat) {
    if (/UNIQUE/i.test(String(galat))) return "bentrok";
    throw galat;
  }
}

/** Ruang aktif milik seorang guru, atau null (P-4). */
export function ruangAktifPemilik(db: D1Database, pemilikId: string, sejak: number): Promise<{ id: string; kode: string; label_kelas: string } | null> {
  return db
    .prepare("SELECT id, kode, label_kelas FROM ruang WHERE pemilik_id = ?1 AND status <> 'ditutup' AND dibuat_pada > ?2 ORDER BY dibuat_pada DESC LIMIT 1")
    .bind(pemilikId, sejak)
    .first();
}

/** Daftar ruang yang belum ditutup dan dibuat sesudah `sejak`; `pemilikId` null berarti semua (P-6). */
export async function daftarRuang(db: D1Database, pemilikId: string | null, sejak: number, maks: number): Promise<BarisRuangKonsol[]> {
  const hasil = await db
    .prepare(PILIH_RUANG_KONSOL + "WHERE r.status <> 'ditutup' AND r.dibuat_pada > ?1 AND (?2 IS NULL OR r.pemilik_id = ?2) ORDER BY r.dibuat_pada DESC LIMIT ?3")
    .bind(sejak, pemilikId, maks)
    .all<BarisRuangKonsol>();
  return hasil.results ?? [];
}

export async function hitungRuangBerjalan(db: D1Database, pemilikId: string | null, sejak: number): Promise<number> {
  const baris = await db
    .prepare("SELECT COUNT(*) AS n FROM ruang WHERE status <> 'ditutup' AND dibuat_pada > ?1 AND (?2 IS NULL OR pemilik_id = ?2)")
    .bind(sejak, pemilikId)
    .first<{ n: number }>();
  return baris?.n ?? 0;
}

export function cariRuangId(db: D1Database, id: string): Promise<BarisRuangKonsol | null> {
  return db.prepare(PILIH_RUANG_KONSOL + "WHERE r.id = ?1").bind(id).first<BarisRuangKonsol>();
}

/** JS-22 (P-16): ringkasan pemakaian ruang di `ruang.ringkasan_json`; mengembalikan baris D1 yang ditulis. */
export async function tulisRingkasanRuang(db: D1Database, ruangId: string, ringkasan: unknown): Promise<number> {
  const h = await db.prepare("UPDATE ruang SET ringkasan_json = ?1 WHERE id = ?2").bind(JSON.stringify(ringkasan), ruangId).run();
  return h.meta?.rows_written ?? 0;
}
