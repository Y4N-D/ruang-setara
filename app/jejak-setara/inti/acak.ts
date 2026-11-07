// Acak berbenih (spesifikasi JS-02, P-1 sampai P-4). Hasilnya sama di mesin mana pun untuk benih
// yang sama. Inti tidak memakai sumber acak langsung: semua pengacakan menerima benih dari luar.

const BASIS_FNV = 2166136261;
const PRIMA_FNV = 16777619;

/**
 * Benih 32 bit dari beberapa bagian, misalnya `benih(benihRuang, pemainId, kejadianId)`.
 * Bagian disambung dengan `;`, lalu di-hash FNV-1a 32 bit per kode unit, diakhiri `h ^= h >>> 13`.
 * Hasilnya bilangan bulat 0–4.294.967.295.
 */
export function benih(...bagian: (string | number)[]): number {
  const teks = bagian.map((b) => String(b)).join(";");
  let h = BASIS_FNV;
  for (let i = 0; i < teks.length; i++) {
    h ^= teks.charCodeAt(i);
    h = Math.imul(h, PRIMA_FNV) >>> 0;
  }
  h ^= h >>> 13;
  return h >>> 0;
}

/** Pembangkit mulberry32: setiap panggilan mengembalikan angka 0 ≤ x < 1. */
export function acakBerbenih(b: number): () => number {
  let a = b | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Salinan larik dengan urutan diacak (Fisher–Yates). Larik asal tidak diubah. */
export function kocok<T>(larik: readonly T[], b: number): T[] {
  const hasil = larik.slice();
  const acak = acakBerbenih(b);
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(acak() * (i + 1));
    const simpan = hasil[i];
    hasil[i] = hasil[j];
    hasil[j] = simpan;
  }
  return hasil;
}

/** Satu unsur larik yang dipilih dengan benih. Larik kosong adalah kesalahan pemakaian. */
export function pilih<T>(larik: readonly T[], b: number): T {
  if (larik.length === 0) throw new RangeError("pilih: larik kosong");
  return larik[Math.floor(acakBerbenih(b)() * larik.length)];
}

/** Bilangan bulat min–maks (keduanya termasuk) yang dipilih dengan benih. */
export function bulat(b: number, min: number, maks: number): number {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(maks) || min > maks) {
    throw new RangeError("bulat: batas harus bilangan bulat dengan min ≤ maks");
  }
  return min + Math.floor(acakBerbenih(b)() * (maks - min + 1));
}
