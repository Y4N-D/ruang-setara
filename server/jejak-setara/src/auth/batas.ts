// Pembatas percobaan masuk di tabel batas_masuk (spesifikasi JS-04, P-12 dan P-13; Architecture 10.3). Kunci berupa
// HMAC KUNCI_IP atas email, atau atas alamat IP dan tanggal UTC, sehingga alamat IP tidak pernah tersimpan.
import { hmac } from "./sandi";

export interface AturanBatas {
  /** Panjang jendela hitungan. */
  jendelaMs: number;
  /** Hitungan gagal yang mengunci. */
  batas: number;
}

export const BATAS_EMAIL: AturanBatas = { jendelaMs: 15 * 60_000, batas: 5 };
export const BATAS_ALAMAT: AturanBatas = { jendelaMs: 24 * 3_600_000, batas: 20 };
/** Lama penguncian (P-13). */
export const KUNCI_MS = 15 * 60_000;

export interface BarisBatas {
  kunci: string;
  jumlah: number;
  jendela_mulai: number;
  terkunci_sampai: number | null;
}

const penyandi = new TextEncoder();

async function hmacHex(kunciIp: string, teks: string): Promise<string> {
  const hasil = await hmac(kunciIp, penyandi.encode(teks));
  return Array.from(hasil, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

/** Kunci email: `e:` + 32 karakter pertama HMAC heksadesimal atas email yang sudah dinormalkan (P-12). */
export async function kunciEmail(email: string, kunciIp: string): Promise<string> {
  return "e:" + (await hmacHex(kunciIp, email));
}

/** Kunci alamat: `i:` + 32 karakter pertama HMAC heksadesimal atas "alamat|YYYY-MM-DD" (tanggal UTC, P-12). */
export async function kunciAlamat(alamat: string, sekarang: number, kunciIp: string): Promise<string> {
  const tanggal = new Date(sekarang).toISOString().slice(0, 10);
  return "i:" + (await hmacHex(kunciIp, `${alamat}|${tanggal}`));
}

/** Baris sedang terkunci (P-13). Penguncian berakhir tepat pada `terkunci_sampai`. */
export function sedangTerkunci(baris: Pick<BarisBatas, "terkunci_sampai"> | null | undefined, sekarang: number): boolean {
  return Boolean(baris && baris.terkunci_sampai !== null && baris.terkunci_sampai > sekarang);
}

/**
 * Satu kegagalan untuk satu kunci (P-13), dalam satu pernyataan agar percobaan yang datang bersamaan tetap terhitung
 * semua. Parameter: ?1 kunci, ?2 sekarang, ?3 panjang jendela, ?4 batas, ?5 lama penguncian.
 * - Baris baru, atau jendela yang sudah lewat: hitungan mulai lagi dari 1 dengan jendela mulai sekarang.
 * - Hitungan yang mencapai batas: `terkunci_sampai` = sekarang + lama penguncian.
 * - Selain itu penguncian yang masih berjalan dipertahankan, dan yang sudah lewat dikosongkan.
 * Di SQLite, kolom di ruas SET dan WHERE pernyataan UPDATE selalu bernilai lama (sebelum diubah).
 */
export const SQL_TAMBAH_GAGAL = `INSERT INTO batas_masuk (kunci, jumlah, jendela_mulai, terkunci_sampai)
VALUES (?1, 1, ?2, CASE WHEN 1 >= ?4 THEN ?2 + ?5 ELSE NULL END)
ON CONFLICT(kunci) DO UPDATE SET
  jumlah = CASE WHEN ?2 - batas_masuk.jendela_mulai > ?3 THEN 1 ELSE batas_masuk.jumlah + 1 END,
  jendela_mulai = CASE WHEN ?2 - batas_masuk.jendela_mulai > ?3 THEN ?2 ELSE batas_masuk.jendela_mulai END,
  terkunci_sampai = CASE
    WHEN (CASE WHEN ?2 - batas_masuk.jendela_mulai > ?3 THEN 1 ELSE batas_masuk.jumlah + 1 END) >= ?4 THEN ?2 + ?5
    WHEN batas_masuk.terkunci_sampai > ?2 THEN batas_masuk.terkunci_sampai
    ELSE NULL
  END`;

/** Parameter SQL_TAMBAH_GAGAL menurut urutannya. */
export function parameterGagal(kunci: string, sekarang: number, aturan: AturanBatas): [string, number, number, number, number] {
  return [kunci, sekarang, aturan.jendelaMs, aturan.batas, KUNCI_MS];
}
