// Kueri D1 bank kejadian (spesifikasi JS-12, P-4, P-7, P-9, P-13 sampai P-25). Semua kueri berparameter. Penerbitan,
// arsip, dan simpan versi kerja memakai satu `batch` dengan syarat di pernyataannya, agar balapan tidak merusak data.

export interface BarisKejadianD1 {
  id: string;
  kode: string;
  status: "draf" | "tinjau" | "terbit" | "arsip";
  pemilik_id: string | null;
  diubah_pada: number;
  versi_terbit_id: string | null;
  nama_pemilik: string | null;
  kerja_isi: string | null;
  kerja_pada: number | null;
  terbit_isi: string | null;
}

const PILIH_KEJADIAN =
  "SELECT k.id, k.kode, k.status, k.pemilik_id, k.diubah_pada, k.versi_terbit_id, g.nama_tampilan AS nama_pemilik, " +
  "vk.isi_json AS kerja_isi, vk.dibuat_pada AS kerja_pada, vt.isi_json AS terbit_isi FROM kejadian k " +
  "LEFT JOIN kejadian_versi vk ON vk.kejadian_id = k.id AND vk.jenis = 'kerja' " +
  "LEFT JOIN kejadian_versi vt ON vt.id = k.versi_terbit_id LEFT JOIN pengguna g ON g.id = k.pemilik_id ";

export async function daftarKejadianD1(db: D1Database): Promise<BarisKejadianD1[]> {
  return (await db.prepare(PILIH_KEJADIAN + "ORDER BY k.kode").all<BarisKejadianD1>()).results ?? [];
}

export function cariKejadianKode(db: D1Database, kode: string): Promise<BarisKejadianD1 | null> {
  return db.prepare(PILIH_KEJADIAN + "WHERE k.kode = ?1").bind(kode).first<BarisKejadianD1>();
}

export async function semuaKode(db: D1Database): Promise<string[]> {
  return ((await db.prepare("SELECT kode FROM kejadian").all<{ kode: string }>()).results ?? []).map((b) => b.kode);
}

export interface BarisVersiTerbit {
  id: string;
  nomor: number;
  isi_json: string;
  dibuat_pada: number;
  penerbit: string | null;
  catatan_perubahan: string | null;
}

export async function riwayatTerbit(db: D1Database, kejadianId: string): Promise<BarisVersiTerbit[]> {
  const hasil = await db
    .prepare(
      "SELECT v.id, v.nomor, v.isi_json, v.dibuat_pada, g.nama_tampilan AS penerbit, v.catatan_perubahan FROM kejadian_versi v " +
        "LEFT JOIN pengguna g ON g.id = v.dibuat_oleh WHERE v.kejadian_id = ?1 AND v.jenis = 'terbit' ORDER BY v.nomor DESC",
    )
    .bind(kejadianId)
    .all<BarisVersiTerbit>();
  return hasil.results ?? [];
}

/** Versi kejadian pernah dipakai ruang (ada baris `jawaban`). */
export async function dipakaiRuang(db: D1Database, kejadianId: string): Promise<boolean> {
  const b = await db
    .prepare("SELECT 1 AS ada FROM jawaban j JOIN kejadian_versi v ON v.id = j.kejadian_versi_id WHERE v.kejadian_id = ?1 LIMIT 1")
    .bind(kejadianId)
    .first<{ ada: number }>();
  return b !== null;
}

export async function petaStatusRujukan(db: D1Database): Promise<Map<string, "belum" | "terverifikasi">> {
  const hasil = await db.prepare("SELECT id, status FROM rujukan").all<{ id: string; status: "belum" | "terverifikasi" }>();
  return new Map((hasil.results ?? []).map((r) => [r.id, r.status]));
}

export async function daftarTopik(db: D1Database): Promise<string[]> {
  const hasil = await db
    .prepare("SELECT DISTINCT json_extract(isi_json, '$.topik') AS topik FROM kejadian_versi WHERE jenis = 'kerja' ORDER BY topik")
    .all<{ topik: string | null }>();
  return (hasil.results ?? []).map((b) => b.topik).filter((t): t is string => typeof t === "string" && t.length > 0);
}

/** Pernyataan log audit (P-25); `syarat` opsional berupa klausa SQL yang harus benar agar baris ditulis. */
export function pernyataanAudit(
  db: D1Database,
  a: { penggunaId: string; aksi: string; sasaran: string; rincian: Record<string, unknown>; sekarang: number },
  syarat?: { sql: string; nilai: unknown[] },
): D1PreparedStatement {
  const nilai = [crypto.randomUUID(), a.penggunaId, a.aksi, a.sasaran, JSON.stringify(a.rincian), a.sekarang];
  if (!syarat) return db.prepare("INSERT INTO log_audit (id, pengguna_id, aksi, sasaran, rincian_json, waktu) VALUES (?1, ?2, ?3, ?4, ?5, ?6)").bind(...nilai);
  return db
    .prepare(`INSERT INTO log_audit (id, pengguna_id, aksi, sasaran, rincian_json, waktu) SELECT ?1, ?2, ?3, ?4, ?5, ?6 WHERE ${syarat.sql}`)
    .bind(...nilai, ...syarat.nilai);
}

/** P-7: kejadian baru berstatus Draf dengan satu versi kerja. */
export async function buatKejadianD1(
  db: D1Database,
  b: { kode: string; isiJson: string; pemilikId: string; sekarang: number },
): Promise<"ok" | "bentrok"> {
  const id = crypto.randomUUID();
  try {
    await db.batch([
      db.prepare("INSERT INTO kejadian (id, kode, status, versi_terbit_id, pemilik_id, diubah_pada) VALUES (?1, ?2, 'draf', NULL, ?3, ?4)").bind(id, b.kode, b.pemilikId, b.sekarang),
      db
        .prepare("INSERT INTO kejadian_versi (id, kejadian_id, nomor, isi_json, jenis, dibuat_oleh, dibuat_pada, catatan_perubahan) VALUES (?1, ?2, 1, ?3, 'kerja', ?4, ?5, NULL)")
        .bind(crypto.randomUUID(), id, b.isiJson, b.pemilikId, b.sekarang),
      pernyataanAudit(db, { penggunaId: b.pemilikId, aksi: "kejadian.buat", sasaran: b.kode, rincian: {}, sekarang: b.sekarang }),
    ]);
    return "ok";
  } catch (galat) {
    if (/UNIQUE/i.test(String(galat))) return "bentrok";
    throw galat;
  }
}

/** P-9: versi kerja diperbarui hanya bila belum diubah sejak dibaca (`dibuat_pada` sebagai penanda versi). */
export async function simpanKerjaD1(
  db: D1Database,
  b: { kejadianId: string; kode: string; isiJson: string; diubahPadaLama: number; penggunaId: string; sekarang: number },
): Promise<boolean> {
  const sudah = { sql: "EXISTS (SELECT 1 FROM kejadian_versi WHERE kejadian_id = ?7 AND jenis = 'kerja' AND dibuat_pada = ?8)", nilai: [b.kejadianId, b.sekarang] };
  const hasil = await db.batch([
    db
      .prepare("UPDATE kejadian_versi SET isi_json = ?1, dibuat_pada = ?2, dibuat_oleh = ?3 WHERE kejadian_id = ?4 AND jenis = 'kerja' AND dibuat_pada = ?5")
      .bind(b.isiJson, b.sekarang, b.penggunaId, b.kejadianId, b.diubahPadaLama),
    db
      .prepare("UPDATE kejadian SET diubah_pada = ?1 WHERE id = ?2 AND EXISTS (SELECT 1 FROM kejadian_versi WHERE kejadian_id = ?2 AND jenis = 'kerja' AND dibuat_pada = ?1)")
      .bind(b.sekarang, b.kejadianId),
    pernyataanAudit(db, { penggunaId: b.penggunaId, aksi: "kejadian.simpan", sasaran: b.kode, rincian: {}, sekarang: b.sekarang }, sudah),
  ]);
  return (hasil[0].meta?.changes ?? 0) > 0;
}

/** P-14: perubahan status sederhana (ajukan, kembalikan, pulihkan) dengan syarat status asal. */
export async function ubahStatusD1(
  db: D1Database,
  b: { kejadianId: string; kode: string; dari: readonly string[]; ke: string; aksi: string; penggunaId: string; sekarang: number },
): Promise<boolean> {
  const daftar = JSON.stringify(b.dari);
  const hasil = await db.batch([
    db
      .prepare("UPDATE kejadian SET status = ?1, diubah_pada = ?2 WHERE id = ?3 AND status IN (SELECT value FROM json_each(?4))")
      .bind(b.ke, b.sekarang, b.kejadianId, daftar),
    pernyataanAudit(
      db,
      { penggunaId: b.penggunaId, aksi: `kejadian.${b.aksi}`, sasaran: b.kode, rincian: { ke: b.ke }, sekarang: b.sekarang },
      { sql: "EXISTS (SELECT 1 FROM kejadian WHERE id = ?7 AND status = ?8 AND diubah_pada = ?9)", nilai: [b.kejadianId, b.ke, b.sekarang] },
    ),
  ]);
  return (hasil[0].meta?.changes ?? 0) > 0;
}

/**
 * P-13, P-14: versi kerja disalin menjadi versi terbit bernomor baru, hanya bila semua rujukannya terverifikasi pada saat
 * pernyataan dijalankan. Mengembalikan nomor versi, atau null bila syarat tidak terpenuhi.
 */
export async function terbitkanD1(
  db: D1Database,
  b: { kejadianId: string; kode: string; penggunaId: string; catatan: string; sekarang: number },
): Promise<number | null> {
  const versiId = crypto.randomUUID();
  const hasil = await db.batch([
    db
      .prepare(
        "INSERT INTO kejadian_versi (id, kejadian_id, nomor, isi_json, jenis, dibuat_oleh, dibuat_pada, catatan_perubahan) " +
          "SELECT ?1, k.id, COALESCE((SELECT MAX(nomor) FROM kejadian_versi WHERE kejadian_id = k.id AND jenis = 'terbit'), 0) + 1, vk.isi_json, 'terbit', ?2, ?3, ?4 " +
          "FROM kejadian k JOIN kejadian_versi vk ON vk.kejadian_id = k.id AND vk.jenis = 'kerja' " +
          "WHERE k.id = ?5 AND k.status IN ('draf', 'tinjau', 'terbit') AND NOT EXISTS (SELECT 1 FROM json_each(vk.isi_json, '$.kartu.rujukan') r " +
          "WHERE NOT EXISTS (SELECT 1 FROM rujukan ru WHERE ru.id = r.value AND ru.status = 'terverifikasi'))",
      )
      .bind(versiId, b.penggunaId, b.sekarang, b.catatan, b.kejadianId),
    db
      .prepare("UPDATE kejadian SET status = 'terbit', versi_terbit_id = ?1, diubah_pada = ?2 WHERE id = ?3 AND EXISTS (SELECT 1 FROM kejadian_versi WHERE id = ?1)")
      .bind(versiId, b.sekarang, b.kejadianId),
    pernyataanAudit(
      db,
      { penggunaId: b.penggunaId, aksi: "kejadian.terbitkan", sasaran: b.kode, rincian: { versiId }, sekarang: b.sekarang },
      { sql: "EXISTS (SELECT 1 FROM kejadian_versi WHERE id = ?7)", nilai: [versiId] },
    ),
  ]);
  if ((hasil[0].meta?.changes ?? 0) === 0) return null;
  const v = await db.prepare("SELECT nomor FROM kejadian_versi WHERE id = ?1").bind(versiId).first<{ nomor: number }>();
  return v?.nomor ?? null;
}

/** P-14: arsip mengeluarkan kejadian dari semua paket. */
export async function arsipkanD1(db: D1Database, b: { kejadianId: string; kode: string; penggunaId: string; sekarang: number }): Promise<boolean> {
  const hasil = await db.batch([
    db.prepare("UPDATE kejadian SET status = 'arsip', diubah_pada = ?1 WHERE id = ?2 AND status IN ('draf', 'tinjau', 'terbit')").bind(b.sekarang, b.kejadianId),
    db.prepare("DELETE FROM paket_kejadian WHERE kejadian_id = ?1 AND EXISTS (SELECT 1 FROM kejadian WHERE id = ?1 AND status = 'arsip')").bind(b.kejadianId),
    pernyataanAudit(
      db,
      { penggunaId: b.penggunaId, aksi: "kejadian.arsipkan", sasaran: b.kode, rincian: {}, sekarang: b.sekarang },
      { sql: "EXISTS (SELECT 1 FROM kejadian WHERE id = ?7 AND status = 'arsip' AND diubah_pada = ?8)", nilai: [b.kejadianId, b.sekarang] },
    ),
  ]);
  return (hasil[0].meta?.changes ?? 0) > 0;
}

/** P-14: hapus kejadian beserta versinya (syarat diperiksa pemanggil; kunci asing menolak bila ada jawaban). */
export async function hapusKejadianD1(db: D1Database, b: { kejadianId: string; kode: string; penggunaId: string; sekarang: number }): Promise<void> {
  await db.batch([
    db.prepare("DELETE FROM paket_kejadian WHERE kejadian_id = ?1").bind(b.kejadianId),
    db.prepare("UPDATE kejadian SET versi_terbit_id = NULL WHERE id = ?1").bind(b.kejadianId),
    db.prepare("DELETE FROM kejadian_versi WHERE kejadian_id = ?1").bind(b.kejadianId),
    db.prepare("DELETE FROM kejadian WHERE id = ?1").bind(b.kejadianId),
    pernyataanAudit(db, { penggunaId: b.penggunaId, aksi: "kejadian.hapus", sasaran: b.kode, rincian: {}, sekarang: b.sekarang }),
  ]);
}

// -------------------------------------------------------------------------------------------
// Pustaka rujukan (P-17 sampai P-20)

export interface BarisRujukanD1 {
  id: string;
  teks: string;
  sumber: string;
  catatan: string | null;
  kode_sehari: string | null;
  status: "belum" | "terverifikasi";
  diverifikasi_nama: string | null;
  diverifikasi_pada: number | null;
  dipakai: number;
}

const PILIH_RUJUKAN =
  "SELECT r.id, r.teks, r.sumber, r.catatan, r.kode_sehari, r.status, g.nama_tampilan AS diverifikasi_nama, r.diverifikasi_pada, " +
  "(SELECT COUNT(DISTINCT v.kejadian_id) FROM kejadian_versi v, json_each(v.isi_json, '$.kartu.rujukan') j WHERE j.value = r.id) AS dipakai " +
  "FROM rujukan r LEFT JOIN pengguna g ON g.id = r.diverifikasi_oleh ";

export async function daftarRujukanD1(db: D1Database): Promise<BarisRujukanD1[]> {
  return (await db.prepare(PILIH_RUJUKAN + "ORDER BY r.id").all<BarisRujukanD1>()).results ?? [];
}

export function cariRujukanD1(db: D1Database, id: string): Promise<BarisRujukanD1 | null> {
  return db.prepare(PILIH_RUJUKAN + "WHERE r.id = ?1").bind(id).first<BarisRujukanD1>();
}

export interface IsiRujukanD1 {
  id: string;
  teks: string;
  sumber: string;
  catatan: string;
  kodeSehari: string | null;
}

export async function tambahRujukanD1(db: D1Database, r: IsiRujukanD1, penggunaId: string, sekarang: number): Promise<"ok" | "bentrok"> {
  try {
    await db.batch([
      db
        .prepare("INSERT INTO rujukan (id, teks, sumber, status, diverifikasi_oleh, diverifikasi_pada, catatan, kode_sehari) VALUES (?1, ?2, ?3, 'belum', NULL, NULL, ?4, ?5)")
        .bind(r.id, r.teks, r.sumber, r.catatan, r.kodeSehari),
      pernyataanAudit(db, { penggunaId, aksi: "rujukan.tambah", sasaran: r.id, rincian: {}, sekarang }),
    ]);
    return "ok";
  } catch (galat) {
    if (/UNIQUE|PRIMARY/i.test(String(galat))) return "bentrok";
    throw galat;
  }
}

/** P-18: mengubah teks mengembalikan status ke `belum` dan mengosongkan verifikasi; kolom lain tidak. */
export async function ubahRujukanD1(db: D1Database, r: IsiRujukanD1, penggunaId: string, sekarang: number): Promise<boolean> {
  const hasil = await db.batch([
    db
      .prepare(
        "UPDATE rujukan SET status = CASE WHEN teks <> ?2 THEN 'belum' ELSE status END, diverifikasi_oleh = CASE WHEN teks <> ?2 THEN NULL ELSE diverifikasi_oleh END, " +
          "diverifikasi_pada = CASE WHEN teks <> ?2 THEN NULL ELSE diverifikasi_pada END, teks = ?2, sumber = ?3, catatan = ?4, kode_sehari = ?5 WHERE id = ?1",
      )
      .bind(r.id, r.teks, r.sumber, r.catatan, r.kodeSehari),
    pernyataanAudit(db, { penggunaId, aksi: "rujukan.ubah", sasaran: r.id, rincian: {}, sekarang }),
  ]);
  return (hasil[0].meta?.changes ?? 0) > 0;
}

export async function verifikasiRujukanD1(db: D1Database, id: string, terverifikasi: boolean, penggunaId: string, sekarang: number): Promise<boolean> {
  const hasil = await db.batch([
    terverifikasi
      ? db.prepare("UPDATE rujukan SET status = 'terverifikasi', diverifikasi_oleh = ?2, diverifikasi_pada = ?3 WHERE id = ?1").bind(id, penggunaId, sekarang)
      : db.prepare("UPDATE rujukan SET status = 'belum', diverifikasi_oleh = NULL, diverifikasi_pada = NULL WHERE id = ?1").bind(id),
    pernyataanAudit(db, { penggunaId, aksi: terverifikasi ? "rujukan.verifikasi" : "rujukan.batal_verifikasi", sasaran: id, rincian: {}, sekarang }),
  ]);
  return (hasil[0].meta?.changes ?? 0) > 0;
}

/** P-20: hanya rujukan yang tidak dipakai versi mana pun. */
export async function hapusRujukanD1(db: D1Database, id: string, penggunaId: string, sekarang: number): Promise<boolean> {
  const hasil = await db.batch([
    db
      .prepare("DELETE FROM rujukan WHERE id = ?1 AND NOT EXISTS (SELECT 1 FROM kejadian_versi v, json_each(v.isi_json, '$.kartu.rujukan') j WHERE j.value = ?1)")
      .bind(id),
    pernyataanAudit(db, { penggunaId, aksi: "rujukan.hapus", sasaran: id, rincian: {}, sekarang }, { sql: "NOT EXISTS (SELECT 1 FROM rujukan WHERE id = ?7)", nilai: [id] }),
  ]);
  return (hasil[0].meta?.changes ?? 0) > 0;
}

// -------------------------------------------------------------------------------------------
// Paket (P-21 sampai P-23)

export interface BarisPaketD1 {
  id: string;
  nama: string;
  deskripsi: string | null;
  aktif: number;
  jumlah: number;
}

export async function daftarPaketD1(db: D1Database): Promise<BarisPaketD1[]> {
  const hasil = await db
    .prepare("SELECT p.id, p.nama, p.deskripsi, p.aktif, (SELECT COUNT(*) FROM paket_kejadian pk WHERE pk.paket_id = p.id) AS jumlah FROM paket p ORDER BY p.nama")
    .all<BarisPaketD1>();
  return hasil.results ?? [];
}

export function cariPaketD1(db: D1Database, id: string): Promise<BarisPaketD1 | null> {
  return db
    .prepare("SELECT p.id, p.nama, p.deskripsi, p.aktif, (SELECT COUNT(*) FROM paket_kejadian pk WHERE pk.paket_id = p.id) AS jumlah FROM paket p WHERE p.id = ?1")
    .bind(id)
    .first<BarisPaketD1>();
}

export async function kejadianPaketD1(db: D1Database, paketId: string): Promise<{ kode: string; status: string; kerja_isi: string | null }[]> {
  const hasil = await db
    .prepare(
      "SELECT k.kode, k.status, vk.isi_json AS kerja_isi FROM paket_kejadian pk JOIN kejadian k ON k.id = pk.kejadian_id " +
        "LEFT JOIN kejadian_versi vk ON vk.kejadian_id = k.id AND vk.jenis = 'kerja' WHERE pk.paket_id = ?1 ORDER BY pk.urutan",
    )
    .bind(paketId)
    .all<{ kode: string; status: string; kerja_isi: string | null }>();
  return hasil.results ?? [];
}

export async function namaPaketDipakai(db: D1Database, nama: string, kecualiId: string): Promise<boolean> {
  return (await db.prepare("SELECT 1 AS ada FROM paket WHERE nama = ?1 AND id <> ?2").bind(nama, kecualiId).first()) !== null;
}

/** P-22: menyimpan paket utuh; daftar kejadian diganti menurut urutan kode. */
export async function simpanPaketD1(
  db: D1Database,
  p: { id: string; baru: boolean; nama: string; deskripsi: string; aktif: boolean; kejadianId: readonly string[]; penggunaId: string; sekarang: number },
): Promise<void> {
  const pernyataan: D1PreparedStatement[] = [
    p.baru
      ? db.prepare("INSERT INTO paket (id, nama, deskripsi, aktif) VALUES (?1, ?2, ?3, ?4)").bind(p.id, p.nama, p.deskripsi, p.aktif ? 1 : 0)
      : db.prepare("UPDATE paket SET nama = ?2, deskripsi = ?3, aktif = ?4 WHERE id = ?1").bind(p.id, p.nama, p.deskripsi, p.aktif ? 1 : 0),
    db.prepare("DELETE FROM paket_kejadian WHERE paket_id = ?1").bind(p.id),
    ...p.kejadianId.map((k, i) => db.prepare("INSERT INTO paket_kejadian (paket_id, kejadian_id, urutan) VALUES (?1, ?2, ?3)").bind(p.id, k, i + 1)),
    pernyataanAudit(db, { penggunaId: p.penggunaId, aksi: p.baru ? "paket.buat" : "paket.simpan", sasaran: p.id, rincian: { jumlah: p.kejadianId.length }, sekarang: p.sekarang }),
  ];
  await db.batch(pernyataan);
}

export async function idKejadianDariKode(db: D1Database, kode: readonly string[]): Promise<Map<string, { id: string; status: string; zona: string | null }>> {
  if (kode.length === 0) return new Map();
  const hasil = await db
    .prepare(
      "SELECT k.kode, k.id, k.status, json_extract(vk.isi_json, '$.zona') AS zona FROM kejadian k LEFT JOIN kejadian_versi vk ON vk.kejadian_id = k.id AND vk.jenis = 'kerja' " +
        "WHERE k.kode IN (SELECT value FROM json_each(?1))",
    )
    .bind(JSON.stringify([...new Set(kode)]))
    .all<{ kode: string; id: string; status: string; zona: string | null }>();
  return new Map((hasil.results ?? []).map((b) => [b.kode, { id: b.id, status: b.status, zona: b.zona }]));
}
