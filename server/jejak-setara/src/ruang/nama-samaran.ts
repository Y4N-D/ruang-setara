// Daftar nama samaran bawaan (spesifikasi JS-03, D-1): hewan Nusantara + warna, 26 × 10 = 260 nama.
// Sengaja tanpa warna yang juga dipakai untuk kulit, tanpa hewan yang biasa dipakai mengejek, dan tanpa primata.
export const HEWAN = [
  "Anoa", "Bangau", "Belibis", "Camar", "Cendrawasih", "Elang", "Gelatik", "Jalak", "Kakatua", "Kancil",
  "Kasuari", "Kelinci", "Kenari", "Kepodang", "Kijang", "Kutilang", "Lebah", "Maleo", "Merak", "Merpati",
  "Nuri", "Penyu", "Pesut", "Rangkong", "Rusa", "Tupai",
] as const;

export const WARNA = ["Biru", "Emas", "Hijau", "Jingga", "Merah", "Merah Muda", "Nila", "Perak", "Toska", "Ungu"] as const;

/** Semua nama samaran, urut hewan lalu warna, misalnya "Kancil Jingga". */
export const NAMA_SAMARAN: readonly string[] = HEWAN.flatMap((h) => WARNA.map((w) => `${h} ${w}`));
