// Kueri D1 untuk ruang, peserta, dan jawaban (spesifikasi JS-03, P-5, P-12, P-47; JS-08, P-3 dan P-62).
// JS-11: kolom `dikeluarkan` (P-10), riwayat (P-17), hasil dan rincian (P-21, P-24), ekspor (P-28, P-29), dan hapus
// data ruang (P-33). Semua kueri berparameter.
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
  "INSERT INTO peserta (id, ruang_id, nama_samaran, avatar, warna_tas, nomor_absen, skor, waktu_skor_ms, langkah1_benar, jumlah_kejadian, gabung_pada, peringkat_akhir, dikeluarkan) " +
  "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13) ON CONFLICT(id) DO UPDATE SET nama_samaran = excluded.nama_samaran, " +
  "avatar = excluded.avatar, warna_tas = excluded.warna_tas, nomor_absen = excluded.nomor_absen, skor = excluded.skor, " +
  "waktu_skor_ms = excluded.waktu_skor_ms, langkah1_benar = excluded.langkah1_benar, jumlah_kejadian = excluded.jumlah_kejadian, " +
  "peringkat_akhir = excluded.peringkat_akhir, dikeluarkan = excluded.dikeluarkan";
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
            b.isi.dikeluarkan ? 1 : 0, // JS-11 (P-10): baris antrean lama tanpa tanda ini dikirim sebagai 0
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
  /** JS-11 (P-21): waktu ronde dan nama paket ruang. */
  mulai_pada?: number | null;
  selesai_pada?: number | null;
  nama_paket?: string | null;
}

const PILIH_RUANG_KONSOL =
  "SELECT r.id, r.kode, r.pemilik_id, r.label_kelas, r.status, r.uji, r.pengaturan_json, r.dibuat_pada, r.do_id, " +
  "g.nama_tampilan AS nama_guru, r.ringkasan_json, (SELECT COUNT(*) FROM peserta s WHERE s.ruang_id = r.id) AS jumlah_peserta, " +
  "r.mulai_pada, r.selesai_pada, pk.nama AS nama_paket " +
  "FROM ruang r LEFT JOIN pengguna g ON g.id = r.pemilik_id LEFT JOIN paket pk ON pk.id = r.paket_id ";

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

// ---------------------------------------------------------------------------------------------
// Riwayat, hasil, ekspor, dan hapus data ruang (spesifikasi JS-11)

export interface BarisRiwayat {
  id: string;
  kode: string;
  label_kelas: string;
  uji: number;
  dibuat_pada: number;
  mulai_pada: number | null;
  selesai_pada: number | null;
  nama_guru: string | null;
  jumlah_pemain: number;
  rata_skor: number | null;
}

/**
 * P-17: ruang yang sudah ditutup, terbaru lebih dulu (`dibuat_pada`, lalu `id`, menurun). Label dicocokkan sebagian
 * tanpa membedakan huruf besar dan kecil (huruf Latin). Mengambil `batas + 1` baris agar pemanggil tahu ada halaman
 * berikutnya.
 */
export async function daftarRiwayat(
  db: D1Database,
  s: { pemilikId: string | null; dari: number | null; sampai: number | null; label: string | null; mulai: { dibuatPada: number; id: string } | null; batas: number },
): Promise<BarisRiwayat[]> {
  const hasil = await db
    .prepare(
      "SELECT r.id, r.kode, r.label_kelas, r.uji, r.dibuat_pada, r.mulai_pada, r.selesai_pada, g.nama_tampilan AS nama_guru, " +
        "(SELECT COUNT(*) FROM peserta s WHERE s.ruang_id = r.id AND s.dikeluarkan = 0) AS jumlah_pemain, " +
        "(SELECT AVG(s.skor) FROM peserta s WHERE s.ruang_id = r.id AND s.dikeluarkan = 0) AS rata_skor " +
        "FROM ruang r LEFT JOIN pengguna g ON g.id = r.pemilik_id " +
        "WHERE r.status = 'ditutup' AND (?1 IS NULL OR r.pemilik_id = ?1) AND (?2 IS NULL OR r.dibuat_pada >= ?2) " +
        "AND (?3 IS NULL OR r.dibuat_pada < ?3) AND (?4 IS NULL OR instr(lower(r.label_kelas), lower(?4)) > 0) " +
        "AND (?5 IS NULL OR r.dibuat_pada < ?5 OR (r.dibuat_pada = ?5 AND r.id < ?6)) " +
        "ORDER BY r.dibuat_pada DESC, r.id DESC LIMIT ?7",
    )
    .bind(s.pemilikId, s.dari, s.sampai, s.label, s.mulai?.dibuatPada ?? null, s.mulai?.id ?? null, s.batas + 1)
    .all<BarisRiwayat>();
  return hasil.results ?? [];
}

export interface BarisPesertaHasil {
  id: string;
  nama_samaran: string;
  nomor_absen: number | null;
  dikeluarkan: number;
  peringkat_akhir: number | null;
  skor: number;
  jumlah_kejadian: number;
  waktu_skor_ms: number | null;
  gabung_pada: number;
  langkah1_dijawab: number;
  langkah1_benar: number;
  tepat: number;
  kurang: number;
  berisiko: number;
}

/** P-21: semua peserta ruang dengan hitungan jawaban per peserta, dalam satu kueri. */
export async function bacaPesertaHasil(db: D1Database, ruangId: string): Promise<BarisPesertaHasil[]> {
  const hasil = await db
    .prepare(
      "SELECT s.id, s.nama_samaran, s.nomor_absen, s.dikeluarkan, s.peringkat_akhir, s.skor, s.jumlah_kejadian, s.waktu_skor_ms, s.gabung_pada, " +
        "COALESCE(j.l1, 0) AS langkah1_dijawab, COALESCE(j.b1, 0) AS langkah1_benar, COALESCE(j.tepat, 0) AS tepat, " +
        "COALESCE(j.kurang, 0) AS kurang, COALESCE(j.berisiko, 0) AS berisiko " +
        "FROM peserta s LEFT JOIN (SELECT peserta_id, COUNT(*) AS l1, SUM(CASE WHEN langkah1_benar = 1 THEN 1 ELSE 0 END) AS b1, " +
        "SUM(CASE WHEN tingkat = 'tepat' THEN 1 ELSE 0 END) AS tepat, SUM(CASE WHEN tingkat = 'kurang' THEN 1 ELSE 0 END) AS kurang, " +
        "SUM(CASE WHEN tingkat = 'berisiko' THEN 1 ELSE 0 END) AS berisiko FROM jawaban WHERE ruang_id = ?1 AND langkah1_opsi IS NOT NULL " +
        "GROUP BY peserta_id) j ON j.peserta_id = s.id WHERE s.ruang_id = ?1",
    )
    .bind(ruangId)
    .all<BarisPesertaHasil>();
  return hasil.results ?? [];
}

export function cariPesertaRuang(db: D1Database, ruangId: string, pesertaId: string): Promise<{ id: string; nama_samaran: string } | null> {
  return db.prepare("SELECT id, nama_samaran FROM peserta WHERE id = ?1 AND ruang_id = ?2").bind(pesertaId, ruangId).first();
}

export interface BarisJawabanHasil {
  peserta_id: string;
  kejadian_versi_id: string;
  urutan_opsi_json: string;
  langkah1_opsi: string;
  langkah1_benar: number | null;
  langkah2_opsi: string | null;
  tingkat: string | null;
  poin: number;
  dibuka_pada: number;
  langkah1_pada: number | null;
  langkah2_pada: number | null;
}

export interface BarisVersiHasil {
  id: string;
  nomor: number;
  jenis: string;
  isi_json: string;
  kode: string;
}

/**
 * P-24 dan P-29: jawaban yang Langkah 1-nya dikunci (satu peserta, atau semua bila `pesertaId` null), beserta setiap versi
 * kejadian yang dipakainya, sekali per versi.
 */
export async function bacaJawabanHasil(
  db: D1Database,
  ruangId: string,
  pesertaId: string | null,
): Promise<{ jawaban: BarisJawabanHasil[]; versi: BarisVersiHasil[] }> {
  const [jawaban, versi] = await db.batch([
    db
      .prepare(
        "SELECT peserta_id, kejadian_versi_id, urutan_opsi_json, langkah1_opsi, langkah1_benar, langkah2_opsi, tingkat, poin, dibuka_pada, " +
          "langkah1_pada, langkah2_pada FROM jawaban WHERE ruang_id = ?1 AND (?2 IS NULL OR peserta_id = ?2) AND langkah1_opsi IS NOT NULL",
      )
      .bind(ruangId, pesertaId),
    db
      .prepare(
        "SELECT v.id, v.nomor, v.jenis, v.isi_json, k.kode FROM kejadian_versi v JOIN kejadian k ON k.id = v.kejadian_id WHERE v.id IN " +
          "(SELECT DISTINCT kejadian_versi_id FROM jawaban WHERE ruang_id = ?1 AND (?2 IS NULL OR peserta_id = ?2) AND langkah1_opsi IS NOT NULL)",
      )
      .bind(ruangId, pesertaId),
  ]);
  return { jawaban: (jawaban.results ?? []) as BarisJawabanHasil[], versi: (versi.results ?? []) as BarisVersiHasil[] };
}

/** P-33: jumlah baris yang akan dihapus, untuk rincian log audit. */
export async function hitungDataRuang(db: D1Database, ruangId: string): Promise<{ peserta: number; jawaban: number }> {
  const b = await db
    .prepare("SELECT (SELECT COUNT(*) FROM peserta WHERE ruang_id = ?1) AS peserta, (SELECT COUNT(*) FROM jawaban WHERE ruang_id = ?1) AS jawaban")
    .bind(ruangId)
    .first<{ peserta: number; jawaban: number }>();
  return { peserta: b?.peserta ?? 0, jawaban: b?.jawaban ?? 0 };
}

/** Syarat setiap pernyataan hapus (P-33): ruang masih ada dan berstatus `ditutup`. */
export const SYARAT_HAPUS_RUANG = "EXISTS (SELECT 1 FROM ruang WHERE id = ?1 AND status = 'ditutup')";

/**
 * P-33: satu batch berisi baris audit (bersyarat sama, disiapkan pemanggil), lalu penghapusan jawaban, peserta, dan
 * ruang. Mengembalikan true bila baris ruang terhapus; dua penghapusan yang hampir bersamaan menghasilkan satu true.
 */
export async function hapusDataRuang(db: D1Database, ruangId: string, audit: D1PreparedStatement): Promise<boolean> {
  const hasil = await db.batch([
    audit,
    db.prepare(`DELETE FROM jawaban WHERE ruang_id = ?1 AND ${SYARAT_HAPUS_RUANG}`).bind(ruangId),
    db.prepare(`DELETE FROM peserta WHERE ruang_id = ?1 AND ${SYARAT_HAPUS_RUANG}`).bind(ruangId),
    db.prepare("DELETE FROM ruang WHERE id = ?1 AND status = 'ditutup'").bind(ruangId),
  ]);
  return (hasil[3]?.meta?.changes ?? 0) > 0;
}
