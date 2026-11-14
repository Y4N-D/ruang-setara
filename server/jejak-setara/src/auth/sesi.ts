// Token, cookie, dan masa berlaku sesi konsol (spesifikasi JS-04, P-6 sampai P-9; Architecture 10.3). Murni kecuali
// pembuatan token dan hash SHA-256 lewat WebCrypto.
import { base64url, sha256Hex } from "../keamanan";
import { byteAcak, type AmbilByte } from "./sandi";

export const NAMA_COOKIE = "__Host-jejak_sesi";
/** Sesi berakhir sesudah 8 jam tidak dipakai (P-7). */
export const SESI_DIAM_MS = 8 * 3_600_000;
/** Sesi berakhir paling lama 7 hari sesudah dibuat (P-6). */
export const SESI_MAKS_MS = 7 * 86_400_000;
/** `terakhir_dipakai` ditulis paling sering sekali per 5 menit (P-7). */
export const SESI_TULIS_MS = 5 * 60_000;

const POLA_TOKEN = /^[A-Za-z0-9_-]{43}$/;

/** Token 32 byte acak dalam base64url (43 karakter). */
export function tokenBaru(ambilByte: AmbilByte = byteAcak): string {
  return base64url(ambilByte(32));
}

/** Yang disimpan di D1 hanya SHA-256 heksadesimal token. */
export function hashToken(token: string): Promise<string> {
  return sha256Hex(token);
}

/** Cookie sesi tanpa Max-Age dan Expires: hilang saat peramban ditutup (P-6, D-1a). */
export function cookieSesi(token: string): string {
  return `${NAMA_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

/** Cookie hapus (P-8). */
export function cookieHapus(): string {
  return `${NAMA_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/** Token dari tajuk Cookie, atau null bila tidak ada atau bentuknya salah. */
export function bacaToken(tajukCookie: string | null): string | null {
  if (!tajukCookie) return null;
  for (const bagian of tajukCookie.split(";")) {
    const i = bagian.indexOf("=");
    if (i < 0) continue;
    if (bagian.slice(0, i).trim() !== NAMA_COOKIE) continue;
    const nilai = bagian.slice(i + 1).trim();
    return POLA_TOKEN.test(nilai) ? nilai : null;
  }
  return null;
}

export interface WaktuSesi {
  terakhir_dipakai: number;
  kedaluwarsa: number;
}

/** Sesi masih sah: dipakai dalam 8 jam terakhir dan belum melewati `kedaluwarsa` (P-7). */
export function sesiSah(sesi: WaktuSesi, sekarang: number): boolean {
  return sekarang - sesi.terakhir_dipakai <= SESI_DIAM_MS && sekarang <= sesi.kedaluwarsa;
}

/** `terakhir_dipakai` perlu ditulis ulang bila sudah lebih dari 5 menit (P-7). */
export function perluSentuh(sesi: WaktuSesi, sekarang: number): boolean {
  return sekarang - sesi.terakhir_dipakai > SESI_TULIS_MS;
}
