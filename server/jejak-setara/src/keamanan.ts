// Tajuk, kode ruang, pembanding waktu konstan, dan hash token (spesifikasi JS-03, P-2, P-10 sampai P-14).
// Tidak menulis log: token, nama, nomor absen, dan alamat IP tidak pernah dicatat (Architecture 12.3).
import { ABJAD_KODE } from "../../../app/jejak-setara/inti/aturan";
import type { PembatasLaju } from "./env";

// Tajuk setiap jawaban Worker. Tajuk _headers tidak berlaku untuk jawaban buatan Worker (Architecture 12.2).
export const TAJUK_JSON: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
};

export function jawabJson(isi: unknown, status: number, tajukLain: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(isi), { status, headers: { ...TAJUK_JSON, ...tajukLain } });
}

export function jawabGalat(kode: string, pesan: string, status: number, tajukLain?: Record<string, string>): Response {
  return jawabJson({ galat: { kode, pesan } }, status, tajukLain);
}

export { ABJAD_KODE, normalkanKode, POLA_KODE_RUANG } from "../../../app/jejak-setara/inti/aturan";

/** Kode 5 karakter tanpa bias modulo: byte ≥ 248 (= 31 × 8) dibuang. `ambilByte` memberi byte acak. */
export function kodeAcak(ambilByte: (n: number) => Uint8Array): string {
  let hasil = "";
  while (hasil.length < 5) {
    for (const b of ambilByte(8)) {
      if (b < 248 && hasil.length < 5) hasil += ABJAD_KODE[b % 31];
    }
  }
  return hasil;
}

/** Perbandingan teks dengan waktu yang tidak bergantung pada letak perbedaan pertama. */
export function samaWaktuKonstan(a: string, b: string): boolean {
  let beda = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) beda |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return beda === 0;
}

export function base64url(bytes: Uint8Array): string {
  let biner = "";
  for (const b of bytes) biner += String.fromCharCode(b);
  return btoa(biner).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function sha256Hex(teks: string): Promise<string> {
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(teks)));
  return Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** `Origin` harus sama dengan asal alamat permintaan; di lokal juga localhost dan 127.0.0.1 (P-14). */
export function asalDiizinkan(asal: string | null, url: URL, lingkungan: string): boolean {
  if (!asal) return false;
  if (asal === url.origin) return true;
  return lingkungan === "lokal" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(asal);
}

/** Alamat IP hanya dipakai sesaat sebagai kunci pembatas, tidak disimpan (P-13). */
export function alamatIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "lokal";
}

export async function bolehLewat(pembatas: PembatasLaju | undefined, request: Request): Promise<boolean> {
  if (!pembatas) return true;
  try {
    const { success } = await pembatas.limit({ key: alamatIp(request) });
    return success;
  } catch {
    return true;
  }
}
