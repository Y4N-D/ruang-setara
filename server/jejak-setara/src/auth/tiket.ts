// Tiket layar kelas (spesifikasi JS-10, P-12 dan P-13). Bentuk `B.T`: B = base64url JSON { r: ruangId, e: kedaluwarsa,
// n: nonce }, T = base64url HMAC-SHA256 atas B dengan KUNCI_TIKET. Berlaku 60 detik; sekali pakai dijaga Durable Object
// lewat tabel `tiket_terpakai`. Tiket tidak pernah dicatat.
import { base64url, samaWaktuKonstan } from "../keamanan";

export const TIKET_MS = 60_000;
const TIKET_PANJANG_MAKS = 512;
const POLA_BAGIAN = /^[A-Za-z0-9_-]+$/;
const POLA_NONCE = /^[A-Za-z0-9_-]{22}$/;
const penyandi = new TextEncoder();

type AmbilByte = (n: number) => Uint8Array;
const byteAcak: AmbilByte = (n) => crypto.getRandomValues(new Uint8Array(n));

async function tandaTangan(kunci: string, isi: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", penyandi.encode(kunci), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", k, penyandi.encode(isi))));
}

function dariBase64url(teks: string): Uint8Array {
  const biasa = teks.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((teks.length + 3) % 4);
  const biner = atob(biasa);
  return Uint8Array.from(biner, (c) => c.charCodeAt(0));
}

export async function buatTiket(
  kunci: string,
  ruangId: string,
  sekarang: number,
  ambilByte: AmbilByte = byteAcak,
): Promise<{ tiket: string; kedaluwarsaPada: number }> {
  const e = sekarang + TIKET_MS;
  const isi = base64url(penyandi.encode(JSON.stringify({ r: ruangId, e, n: base64url(ambilByte(16)) })));
  return { tiket: `${isi}.${await tandaTangan(kunci, isi)}`, kedaluwarsaPada: e };
}

export type HasilTiket = { ok: true; nonce: string; kedaluwarsa: number } | { ok: false };

/** Tanda tangan dibandingkan dalam waktu tetap; tiket untuk ruang lain, kedaluwarsa, atau rusak ditolak (P-13). */
export async function periksaTiket(kunci: string, tiket: string, ruangId: string, sekarang: number): Promise<HasilTiket> {
  const tolak: HasilTiket = { ok: false };
  if (tiket.length === 0 || tiket.length > TIKET_PANJANG_MAKS) return tolak;
  const bagian = tiket.split(".");
  if (bagian.length !== 2 || !POLA_BAGIAN.test(bagian[0]) || !POLA_BAGIAN.test(bagian[1])) return tolak;
  if (!samaWaktuKonstan(await tandaTangan(kunci, bagian[0]), bagian[1])) return tolak;
  let isi: unknown;
  try {
    isi = JSON.parse(new TextDecoder().decode(dariBase64url(bagian[0])));
  } catch {
    return tolak;
  }
  if (typeof isi !== "object" || isi === null) return tolak;
  const { r, e, n } = isi as Record<string, unknown>;
  if (typeof r !== "string" || typeof e !== "number" || typeof n !== "string" || !POLA_NONCE.test(n)) return tolak;
  if (r !== ruangId || e < sekarang || e > sekarang + TIKET_MS) return tolak;
  return { ok: true, nonce: n, kedaluwarsa: e };
}
