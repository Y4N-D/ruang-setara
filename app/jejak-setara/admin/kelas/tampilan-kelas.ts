// Perhitungan murni layar kelas (spesifikasi JS-10, P-15, P-24 sampai P-29). Tanpa DOM, sehingga diuji di Node.

/** Batas zona `kampung.json` (z1–z8) dalam ubin: kiri, atas, kanan, bawah. Diuji sama dengan peta (P-26). */
export const ZONA_KELAS: readonly (readonly [number, number, number, number])[] = [
  [0, 30, 52, 62],
  [53, 30, 106, 62],
  [53, 63, 106, 99],
  [107, 30, 159, 62],
  [0, 63, 52, 99],
  [0, 0, 99, 29],
  [100, 0, 159, 29],
  [107, 63, 159, 99],
];
export const PETA_UBIN = { lebar: 160, tinggi: 100, piksel: 16 } as const;

/** Jeda menyambung ulang: 1, 2, 4, 8, lalu 15 detik (P-15). */
export const JEDA_SAMBUNG_ULANG = [1000, 2000, 4000, 8000, 15000] as const;
/** Sesudah 10 menit gagal terus, percobaan otomatis berhenti (P-15). */
export const BATAS_PUTUS_MS = 10 * 60_000;

export function jedaSambungUlang(percobaan: number): number {
  return JEDA_SAMBUNG_ULANG[Math.min(Math.max(0, percobaan), JEDA_SAMBUNG_ULANG.length - 1)];
}

/** Kode tutup sambungan kelas: 4000 ruang ditutup, 4001 dibuka di tab lain; lainnya disambung ulang (P-15). */
export function putusanTutup(kode: number): "ditutup" | "diganti" | "ulang" {
  if (kode === 4000) return "ditutup";
  if (kode === 4001) return "diganti";
  return "ulang";
}

/** Daftar nama lobi: paling banyak 40 nama menurut urutan bergabung, sisanya dihitung (P-24, D-2). */
export const LOBI_NAMA_MAKS = 40;
export function potongLobi<T>(pemain: readonly T[], maks = LOBI_NAMA_MAKS): { tampil: readonly T[]; sisa: number } {
  return { tampil: pemain.slice(0, maks), sisa: Math.max(0, pemain.length - maks) };
}

/** Persen kemajuan kelas (dibulatkan ke bawah) dan jumlah blok terisi dari 12 (P-26). */
export const JUMLAH_BLOK = 12;
export function kemajuanKelas(terjawab: number, kemungkinan: number): { persen: number; blok: number } {
  if (!(kemungkinan > 0)) return { persen: 0, blok: 0 };
  const persen = Math.min(100, Math.floor((terjawab * 100) / kemungkinan));
  return { persen, blok: Math.floor((persen * JUMLAH_BLOK) / 100) };
}

/** "mm:ss" untuk sisa waktu; nilai negatif menjadi 00:00. */
export function formatSisaKelas(ms: number): string {
  const detik = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(detik / 60)).padStart(2, "0")}:${String(detik % 60).padStart(2, "0")}`;
}

/** Angka hitung mundur 3, 2, 1 dari `mulaiPada` dan jam server (P-25). */
export function angkaHitungMundur(mulaiPada: number, jamServer: number): number {
  return Math.min(3, Math.max(1, Math.ceil((mulaiPada - jamServer) / 1000)));
}

/** Sisa waktu ronde dari status ruang: saat jeda, sisa dihitung sampai saat jeda dimulai. */
export function sisaRonde(berakhirPada: number | null, jedaSejak: number | null, jamServer: number): number {
  if (berakhirPada === null) return 0;
  return Math.max(0, berakhirPada - (jedaSejak ?? jamServer));
}

/** Podium: urutan tampil 2–1–3 (yang ada saja) dan daftar peringkat 4–10 (P-28). */
export function susunPodium<T extends { peringkat: number }>(papan: readonly T[]): { podium: { tempat: 1 | 2 | 3; pemain: T }[]; sisa: readonly T[] } {
  const tiga = papan.slice(0, 3);
  const urutan: (1 | 2 | 3)[] = [2, 1, 3];
  const podium = urutan.filter((t) => tiga[t - 1] !== undefined).map((t) => ({ tempat: t, pemain: tiga[t - 1] }));
  return { podium, sisa: papan.slice(3, 10) };
}

/** Persen pilihan pembahasan (dibulatkan ke bilangan bulat terdekat; total 0 menghasilkan 0) dan jumlah menjawab (P-29). */
export function persenPilihan(jumlah: readonly number[]): { persen: number[]; menjawab: number } {
  const menjawab = jumlah.reduce((a, b) => a + b, 0);
  return { persen: jumlah.map((j) => (menjawab > 0 ? Math.round((j * 100) / menjawab) : 0)), menjawab };
}
