// Hash sandi, pencocokan waktu konstan, hash tiruan, dan sandi sementara (spesifikasi JS-04, P-1 sampai P-5;
// Architecture 10.3). Hanya WebCrypto, sehingga modul ini juga berjalan di Node untuk uji unit.
import { ABJAD_KODE } from "../../../../app/jejak-setara/inti/aturan";
import { samaWaktuKonstan } from "../keamanan";

export const ITERASI_MIN = 1_000;
/** Batas PBKDF2 di Cloudflare (isu cloudflare/workerd #1346); `workerd` lokal menerima lebih. */
export const ITERASI_MAKS = 100_000;
export const PANJANG_GARAM = 16;
/** Garam hash tiruan (P-4): 16 byte nol. */
const GARAM_TIRUAN = new Uint8Array(PANJANG_GARAM);

const penyandi = new TextEncoder();

/** Byte untuk WebCrypto: Uint8Array di atas ArrayBuffer biasa. */
export type Byte = Uint8Array<ArrayBuffer>;
export type AmbilByte = (n: number) => Byte;
export const byteAcak: AmbilByte = (n) => crypto.getRandomValues(new Uint8Array(n));

/** `ITERASI_SANDI` yang sah: bilangan bulat 1.000 sampai 100.000 (P-2); selain itu null. */
export function bacaIterasi(nilai: string | undefined): number | null {
  if (nilai === undefined || !/^\d+$/.test(nilai.trim())) return null;
  const n = Number(nilai.trim());
  return n >= ITERASI_MIN && n <= ITERASI_MAKS ? n : null;
}

/** Kunci dan target iterasi yang dipakai rute akun (P-34). */
export interface KunciKonsol {
  kunciSandi: string;
  kunciIp: string;
  iterasi: number;
}

/** Null selama `KUNCI_SANDI` atau `KUNCI_IP` kosong, atau `ITERASI_SANDI` tidak sah: rute menjawab 503 (P-34). */
export function kunciKonsol(env: { KUNCI_SANDI?: string; KUNCI_IP?: string; ITERASI_SANDI?: string }): KunciKonsol | null {
  const iterasi = bacaIterasi(env.ITERASI_SANDI);
  if (!env.KUNCI_SANDI || !env.KUNCI_IP || iterasi === null) return null;
  return { kunciSandi: env.KUNCI_SANDI, kunciIp: env.KUNCI_IP, iterasi };
}

export function keBase64(byte: Uint8Array): string {
  let biner = "";
  for (const b of byte) biner += String.fromCharCode(b);
  return btoa(biner);
}

export function dariBase64(teks: string): Byte {
  return Uint8Array.from(atob(teks), (c) => c.charCodeAt(0));
}

/** HMAC-SHA256 dengan kunci teks. */
export async function hmac(kunci: string, data: Byte): Promise<Byte> {
  const k = await crypto.subtle.importKey("raw", penyandi.encode(kunci), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}

/**
 * Hash sandi (P-1): base64 dari HMAC-SHA256(`kunciSandi`, PBKDF2-HMAC-SHA256(sandi NFC dalam UTF-8, garam, iterasi,
 * 256 bit)). Satu panggilan = satu hash PBKDF2 (P-3).
 */
export async function hashSandi(sandi: string, garam: Byte, iterasi: number, kunciSandi: string): Promise<string> {
  const kunci = await crypto.subtle.importKey("raw", penyandi.encode(sandi.normalize("NFC")), "PBKDF2", false, ["deriveBits"]);
  const turunan = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: garam, iterations: iterasi }, kunci, 256));
  return keBase64(await hmac(kunciSandi, turunan));
}

export interface HashTersimpan {
  hash_sandi: string;
  garam: string;
  iterasi: number;
}

/** Hash baru dengan garam acak 16 byte dan target iterasi. */
export async function buatHash(sandi: string, iterasi: number, kunciSandi: string, ambilByte: AmbilByte = byteAcak): Promise<HashTersimpan> {
  const garam = ambilByte(PANJANG_GARAM);
  return { hash_sandi: await hashSandi(sandi, garam, iterasi, kunciSandi), garam: keBase64(garam), iterasi };
}

/** Mencocokkan sandi dengan hash tersimpan, dibandingkan dengan waktu konstan. */
export async function cocokkanSandi(sandi: string, tersimpan: HashTersimpan, kunciSandi: string): Promise<boolean> {
  const hash = await hashSandi(sandi, dariBase64(tersimpan.garam), tersimpan.iterasi, kunciSandi);
  return samaWaktuKonstan(hash, tersimpan.hash_sandi);
}

/** Hash tiruan (P-4): satu hash dengan garam nol dan target iterasi, hasilnya dibuang. */
export async function hashTiruan(sandi: string, iterasi: number, kunciSandi: string): Promise<void> {
  await hashSandi(sandi, GARAM_TIRUAN, iterasi, kunciSandi);
}

/**
 * Sandi sementara (P-5): 16 karakter dari ABJAD_KODE tanpa bias modulo (byte ≥ 248 = 31 × 8 dibuang), ditulis dalam
 * empat kelompok empat karakter yang dipisah tanda hubung, misalnya K7QM-4TZP-H2XC-9RWE.
 */
export function sandiSementara(ambilByte: AmbilByte = byteAcak): string {
  let hasil = "";
  while (hasil.length < 16) {
    for (const b of ambilByte(24)) {
      if (b < 248 && hasil.length < 16) hasil += ABJAD_KODE[b % 31];
    }
  }
  return `${hasil.slice(0, 4)}-${hasil.slice(4, 8)}-${hasil.slice(8, 12)}-${hasil.slice(12, 16)}`;
}

export const POLA_SANDI_SEMENTARA = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}(-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}){3}$/;
