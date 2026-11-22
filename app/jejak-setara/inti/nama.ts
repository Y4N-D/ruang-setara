// Aturan nama pemain bersama klien dan server (spesifikasi JS-14, P-38 dan P-40). Murni dan tanpa daftar kata
// penyaring: penyaring hanya ada di server (`server/jejak-setara/src/ruang/penyaring-nama.ts`).
export const NAMA_BEBAS_MIN = 3;
export const NAMA_BEBAS_MAKS = 14;
const POLA_NAMA_BEBAS = /^[A-Za-z0-9 ]+$/;

/** NFKC, spasi berurutan menjadi satu, dan spasi di kedua ujung dibuang. */
export function rapikanNama(nama: string): string {
  return nama.normalize("NFKC").replace(/\s+/g, " ").trim();
}

/** 3–14 karakter berupa huruf A–Z dan a–z, angka 0–9, dan spasi, diperiksa sesudah dirapikan (D-3). */
export function bentukNamaSah(nama: string): boolean {
  const n = rapikanNama(nama);
  return n.length >= NAMA_BEBAS_MIN && n.length <= NAMA_BEBAS_MAKS && POLA_NAMA_BEBAS.test(n);
}

/** Kunci keunikan nama di ruang: nama yang dirapikan dalam huruf kecil. */
export function kunciNama(nama: string): string {
  return rapikanNama(nama).toLowerCase();
}

function fnv1a(teks: string, benih: number): number {
  let h = benih >>> 0;
  for (let i = 0; i < teks.length; i++) {
    h ^= teks.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Sidik 64 bit dari `kunciNama`, 16 karakter heksadesimal, dari FNV-1a 32 bit yang dihitung dua kali dengan benih
 * berbeda. Dipakai untuk mengenali nama yang pernah diganti guru tanpa menyimpan tulisannya (P-50); bukan pengaman sandi.
 */
export function sidikNama(nama: string): string {
  const k = kunciNama(nama);
  return fnv1a(k, 0x811c9dc5).toString(16).padStart(8, "0") + fnv1a(k, 0x9747b28c).toString(16).padStart(8, "0");
}
