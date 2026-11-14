// Kueri D1 untuk akun, sesi, pembatas percobaan masuk, log audit, dan hitungan rujukan (spesifikasi JS-04).
// Semua kueri berparameter. Hash, garam, dan iterasi hanya dibaca untuk mencocokkan sandi; jawaban API dibentuk
// keSaya dan keAkun, yang tidak memuatnya (P-22).
import type { Akun, Peran, Saya } from "../../../../app/jejak-setara/inti/akun";
import { BATAS_ALAMAT, parameterGagal, SQL_TAMBAH_GAGAL, type AturanBatas, type BarisBatas } from "../auth/batas";
import type { HashTersimpan } from "../auth/sandi";
import { SESI_DIAM_MS, SESI_MAKS_MS } from "../auth/sesi";

/** Baris `pengguna` tanpa hash. */
export interface BarisAkun {
  id: string;
  email: string;
  nama_tampilan: string;
  peran: Peran;
  peninjau: number;
  wajib_ganti_sandi: number;
  aktif: number;
  dibuat_pada: number;
  masuk_terakhir: number | null;
}

export interface BarisPengguna extends BarisAkun, HashTersimpan {}

export interface BarisSesiAkun extends BarisPengguna {
  terakhir_dipakai: number;
  kedaluwarsa: number;
}

const KOLOM_AKUN = "id, email, nama_tampilan, peran, peninjau, wajib_ganti_sandi, aktif, dibuat_pada, masuk_terakhir";
const KOLOM_PENGGUNA = `${KOLOM_AKUN}, hash_sandi, garam, iterasi`;
const KOLOM_PENGGUNA_P = KOLOM_PENGGUNA.split(", ")
  .map((k) => "p." + k)
  .join(", ");
/** Daftar akun paling banyak 500 baris (P-22). */
export const DAFTAR_AKUN_MAKS = 500;

export function keSaya(b: BarisAkun): Saya {
  return {
    id: b.id,
    email: b.email,
    namaTampilan: b.nama_tampilan,
    peran: b.peran,
    peninjau: b.peninjau === 1,
    wajibGantiSandi: b.wajib_ganti_sandi === 1,
  };
}

export function keAkun(b: BarisAkun): Akun {
  return { ...keSaya(b), aktif: b.aktif === 1, dibuatPada: b.dibuat_pada, masukTerakhir: b.masuk_terakhir };
}

// ------------------------------------------------------------------ Akun

export function cariPenggunaEmail(db: D1Database, email: string): Promise<BarisPengguna | null> {
  return db.prepare(`SELECT ${KOLOM_PENGGUNA} FROM pengguna WHERE email = ?1`).bind(email).first<BarisPengguna>();
}

export function cariPenggunaId(db: D1Database, id: string): Promise<BarisPengguna | null> {
  return db.prepare(`SELECT ${KOLOM_PENGGUNA} FROM pengguna WHERE id = ?1`).bind(id).first<BarisPengguna>();
}

/** Urutan P-22: akun aktif lebih dulu, lalu nama tampilan tanpa membedakan huruf besar-kecil, lalu email. */
export async function daftarAkun(db: D1Database): Promise<BarisAkun[]> {
  const hasil = await db
    .prepare(`SELECT ${KOLOM_AKUN} FROM pengguna ORDER BY aktif DESC, lower(nama_tampilan), email LIMIT ?1`)
    .bind(DAFTAR_AKUN_MAKS)
    .all<BarisAkun>();
  return hasil.results;
}

export function sisipkanPengguna(
  db: D1Database,
  p: { id: string; email: string; namaTampilan: string; peran: Peran; peninjau: boolean; hash: HashTersimpan; sekarang: number },
): D1PreparedStatement {
  return db
    .prepare(
      "INSERT INTO pengguna (id, email, nama_tampilan, peran, peninjau, hash_sandi, garam, iterasi, wajib_ganti_sandi, aktif, dibuat_pada, masuk_terakhir) " +
        "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 1, 1, ?9, NULL)",
    )
    .bind(p.id, p.email, p.namaTampilan, p.peran, p.peninjau ? 1 : 0, p.hash.hash_sandi, p.hash.garam, p.hash.iterasi, p.sekarang);
}

/** Hash baru tanpa mengubah tanda ganti sandi wajib (hash ulang saat masuk, P-2). */
export function perbaruiHash(db: D1Database, id: string, hash: HashTersimpan): D1PreparedStatement {
  return db.prepare("UPDATE pengguna SET hash_sandi = ?2, garam = ?3, iterasi = ?4 WHERE id = ?1").bind(id, hash.hash_sandi, hash.garam, hash.iterasi);
}

/** Sandi diganti pemiliknya (P-18): hash baru dan tanda ganti sandi wajib dimatikan. */
export function gantiSandi(db: D1Database, id: string, hash: HashTersimpan): D1PreparedStatement {
  return db
    .prepare("UPDATE pengguna SET hash_sandi = ?2, garam = ?3, iterasi = ?4, wajib_ganti_sandi = 0 WHERE id = ?1")
    .bind(id, hash.hash_sandi, hash.garam, hash.iterasi);
}

export function catatMasuk(db: D1Database, id: string, sekarang: number): D1PreparedStatement {
  return db.prepare("UPDATE pengguna SET masuk_terakhir = ?2 WHERE id = ?1").bind(id, sekarang);
}

/** Admin awal memulihkan akun (P-30): menjadi admin aktif dengan sandi sementara; nama dan Peninjau tetap. */
export function pulihkanAdmin(db: D1Database, id: string, hash: HashTersimpan): D1PreparedStatement {
  return db
    .prepare("UPDATE pengguna SET peran = 'admin', aktif = 1, hash_sandi = ?2, garam = ?3, iterasi = ?4, wajib_ganti_sandi = 1 WHERE id = ?1")
    .bind(id, hash.hash_sandi, hash.garam, hash.iterasi);
}

export interface UbahanAkun {
  namaTampilan: string | null;
  peran: Peran | null;
  peninjau: boolean | null;
  aktif: boolean | null;
  /** Hash sandi sementara baru bila sandi diatur ulang (P-24). */
  hash: HashTersimpan | null;
}

/**
 * Ubah akun (P-24). Kolom bernilai null tidak diubah, sehingga perubahan admin lain pada kolom lain tidak tertimpa.
 * Perubahan hanya berlaku bila sesudahnya masih ada admin aktif (P-25): akun itu sendiri tetap admin aktif, atau ada
 * admin aktif lain. Pemeriksaan ini satu pernyataan dengan perubahannya, sehingga dua admin yang saling menurunkan peran
 * pada saat yang sama tidak bisa menghabiskan admin. Bila tidak berlaku, jumlah baris yang berubah 0.
 */
export function ubahAkun(db: D1Database, id: string, u: UbahanAkun): D1PreparedStatement {
  const angka = (n: boolean | null) => (n === null ? null : n ? 1 : 0);
  return db
    .prepare(
      "UPDATE pengguna SET nama_tampilan = COALESCE(?2, nama_tampilan), peran = COALESCE(?3, peran), peninjau = COALESCE(?4, peninjau), " +
        "aktif = COALESCE(?5, aktif), hash_sandi = COALESCE(?6, hash_sandi), garam = COALESCE(?7, garam), iterasi = COALESCE(?8, iterasi), " +
        "wajib_ganti_sandi = CASE WHEN ?6 IS NULL THEN wajib_ganti_sandi ELSE 1 END " +
        "WHERE id = ?1 AND ((COALESCE(?3, peran) = 'admin' AND COALESCE(?5, aktif) = 1) " +
        "OR EXISTS (SELECT 1 FROM pengguna AS lain WHERE lain.peran = 'admin' AND lain.aktif = 1 AND lain.id <> ?1))",
    )
    .bind(id, u.namaTampilan, u.peran, angka(u.peninjau), angka(u.aktif), u.hash?.hash_sandi ?? null, u.hash?.garam ?? null, u.hash?.iterasi ?? null);
}

export async function hitungAdminAktifLain(db: D1Database, kecualiId: string): Promise<number> {
  const baris = await db.prepare("SELECT count(*) AS n FROM pengguna WHERE peran = 'admin' AND aktif = 1 AND id <> ?1").bind(kecualiId).first<{ n: number }>();
  return baris?.n ?? 0;
}

// ------------------------------------------------------------------ Sesi

/** Sesi dan akunnya dalam satu kueri (P-7). */
export function bacaSesiAkun(db: D1Database, hashToken: string): Promise<BarisSesiAkun | null> {
  return db
    .prepare(
      `SELECT s.terakhir_dipakai, s.kedaluwarsa, ${KOLOM_PENGGUNA_P} FROM sesi AS s JOIN pengguna AS p ON p.id = s.pengguna_id WHERE s.hash_token = ?1`,
    )
    .bind(hashToken)
    .first<BarisSesiAkun>();
}

/** Sesi baru (P-6): dibuat dan terakhir dipakai sekarang, kedaluwarsa 7 hari lagi. */
export function sisipkanSesi(db: D1Database, hashToken: string, penggunaId: string, sekarang: number): D1PreparedStatement {
  return db
    .prepare("INSERT INTO sesi (hash_token, pengguna_id, dibuat_pada, terakhir_dipakai, kedaluwarsa) VALUES (?1, ?2, ?3, ?3, ?4)")
    .bind(hashToken, penggunaId, sekarang, sekarang + SESI_MAKS_MS);
}

export function hapusSesi(db: D1Database, hashToken: string): D1PreparedStatement {
  return db.prepare("DELETE FROM sesi WHERE hash_token = ?1").bind(hashToken);
}

export function hapusSesiAkun(db: D1Database, penggunaId: string): D1PreparedStatement {
  return db.prepare("DELETE FROM sesi WHERE pengguna_id = ?1").bind(penggunaId);
}

export function sentuhSesi(db: D1Database, hashToken: string, sekarang: number): D1PreparedStatement {
  return db.prepare("UPDATE sesi SET terakhir_dipakai = ?2 WHERE hash_token = ?1").bind(hashToken, sekarang);
}

// ------------------------------------------------------------------ Pembatas percobaan masuk

export async function bacaBatas(db: D1Database, kunci: readonly string[]): Promise<BarisBatas[]> {
  if (kunci.length === 0) return [];
  const tanda = kunci.map((_, i) => `?${i + 1}`).join(", ");
  const hasil = await db
    .prepare(`SELECT kunci, jumlah, jendela_mulai, terkunci_sampai FROM batas_masuk WHERE kunci IN (${tanda})`)
    .bind(...kunci)
    .all<BarisBatas>();
  return hasil.results;
}

export function tambahGagal(db: D1Database, kunci: string, sekarang: number, aturan: AturanBatas): D1PreparedStatement {
  return db.prepare(SQL_TAMBAH_GAGAL).bind(...parameterGagal(kunci, sekarang, aturan));
}

export function hapusBatas(db: D1Database, kunci: string): D1PreparedStatement {
  return db.prepare("DELETE FROM batas_masuk WHERE kunci = ?1").bind(kunci);
}

// ------------------------------------------------------------------ Log audit (P-26)

export interface CatatanAudit {
  id: string;
  /** Pelaku; null untuk admin awal. */
  penggunaId: string | null;
  aksi: "admin_awal" | "akun.buat" | "akun.ubah" | "akun.atur_ulang_sandi" | "sandi.ganti";
  sasaran: string;
  rincian: Record<string, unknown>;
  waktu: number;
}

const SISIP_AUDIT = "INSERT INTO log_audit (id, pengguna_id, aksi, sasaran, rincian_json, waktu)";
const nilaiAudit = (a: CatatanAudit) => [a.id, a.penggunaId, a.aksi, a.sasaran, JSON.stringify(a.rincian), a.waktu] as const;

export function catatAudit(db: D1Database, a: CatatanAudit): D1PreparedStatement {
  return db.prepare(`${SISIP_AUDIT} VALUES (?1, ?2, ?3, ?4, ?5, ?6)`).bind(...nilaiAudit(a));
}

/**
 * Baris audit yang hanya ditulis bila pernyataan tepat sebelumnya di batch yang sama mengubah baris (`changes()`),
 * dipakai sesudah ubahAkun. Pernyataan berikutnya di batch itu memakai `bilaAda` dengan id baris ini sebagai syarat.
 */
export function catatAuditBilaBerubah(db: D1Database, a: CatatanAudit): D1PreparedStatement {
  return db.prepare(`${SISIP_AUDIT} SELECT ?1, ?2, ?3, ?4, ?5, ?6 WHERE changes() > 0`).bind(...nilaiAudit(a));
}

/** Syarat pernyataan lanjutan: baris audit dengan id di parameter ke-n sudah tertulis di batch yang sama. */
const syaratAudit = (n: number) => `EXISTS (SELECT 1 FROM log_audit WHERE id = ?${n})`;

/** Pernyataan lanjutan ubah akun yang hanya berlaku bila baris audit `idAudit` sudah tertulis di batch yang sama. */
export const bilaAda = {
  catatAudit: (db: D1Database, a: CatatanAudit, idAudit: string) =>
    db.prepare(`${SISIP_AUDIT} SELECT ?1, ?2, ?3, ?4, ?5, ?6 WHERE ${syaratAudit(7)}`).bind(...nilaiAudit(a), idAudit),
  hapusSesiAkun: (db: D1Database, penggunaId: string, idAudit: string) =>
    db.prepare(`DELETE FROM sesi WHERE pengguna_id = ?1 AND ${syaratAudit(2)}`).bind(penggunaId, idAudit),
  hapusBatas: (db: D1Database, kunci: string, idAudit: string) =>
    db.prepare(`DELETE FROM batas_masuk WHERE kunci = ?1 AND ${syaratAudit(2)}`).bind(kunci, idAudit),
};

// ------------------------------------------------------------------ Dasbor dan pembersihan

/** Jumlah rujukan berstatus `belum` (P-36). */
export async function hitungRujukanBelum(db: D1Database): Promise<number> {
  const baris = await db.prepare("SELECT count(*) AS n FROM rujukan WHERE status = 'belum'").first<{ n: number }>();
  return baris?.n ?? 0;
}

/**
 * Pembersihan harian (P-35): sesi yang kedaluwarsa atau tidak dipakai lebih dari 8 jam, dan catatan pembatas yang
 * jendelanya mulai lebih dari 24 jam lalu dan tidak sedang terkunci.
 */
export async function bersihkanAkun(db: D1Database, sekarang: number): Promise<void> {
  await db.batch([
    db.prepare("DELETE FROM sesi WHERE kedaluwarsa < ?1 OR terakhir_dipakai < ?2").bind(sekarang, sekarang - SESI_DIAM_MS),
    db
      .prepare("DELETE FROM batas_masuk WHERE jendela_mulai < ?1 AND (terkunci_sampai IS NULL OR terkunci_sampai <= ?2)")
      .bind(sekarang - BATAS_ALAMAT.jendelaMs, sekarang),
  ]);
}
