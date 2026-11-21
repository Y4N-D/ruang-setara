// Peta kampung untuk server (spesifikasi JS-07, P-46; Architecture 8.2; usulan 7a). kampung.json (JS-06) diimpor
// saat build. Di lingkup modul Worker, sekali saat Worker dimuat dan bukan saat menangani pesan, hanya lapisan
// `tabrakan` yang diurai, lalu `titikMuncul` dan `gerbangLobi` diambil dan grid lobi dibuat. Hanya kunci yang
// dipakai yang diimpor, agar Worker tidak membawa daftar objek peta. Pemeriksaan penuh `bacaPeta` dijalankan uji.
// JS-08: titik kejadian per zona untuk penempatan kejadian ruang (P-2, P-9).
// JS-09: kotak bantuan untuk deteksi kotak dari ruas gerak (spesifikasi JS-09, P-16).
import { gerbangLobi, kotak, lebar, tabrakan, tinggi, titikKejadian, titikMuncul, zona } from "../../../../app/jejak-setara/peta/kampung.json";
import { tutupGerbang, uraiRle, versiPeta } from "../../../../app/jejak-setara/inti/peta";
import type { KotakJenis, TitikPeta, ZonaId } from "../../../../app/jejak-setara/inti/tipe";
import type { PetaRuang } from "./inti-ruang";
import type { KotakPeta } from "./skill-ruang";

const grid = uraiRle(tabrakan, lebar * tinggi);

/** JS-09 (P-16): ke-24 kotak bantuan kampung.json, urut menurut id (urutan pemeriksaan kotak). */
export const KOTAK_KAMPUNG: readonly KotakPeta[] = kotak
  .map((k) => ({ id: k.id, jenis: k.jenis as KotakJenis, x: k.x, y: k.y }))
  .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

/** Peta yang dipakai ruang baru dan ruang yang dipulihkan. */
export const PETA_KAMPUNG: PetaRuang = {
  versi: versiPeta({ tabrakan }),
  lebar,
  tinggi,
  tabrakan: grid,
  tabrakanLobi: tutupGerbang({ lebar, tinggi, tabrakan: grid, gerbangLobi }),
  titikMuncul,
  kotak: KOTAK_KAMPUNG,
};

/** Titik kejadian peta kampung per zona, menurut urutan kampung.json (JS-08). */
export const TITIK_PER_ZONA: Readonly<Partial<Record<ZonaId, readonly TitikPeta[]>>> = (() => {
  const hasil: Partial<Record<ZonaId, TitikPeta[]>> = {};
  for (const t of titikKejadian) {
    const zona = t.zona as ZonaId;
    (hasil[zona] ??= []).push({ id: t.id, zona, x: t.x, y: t.y });
  }
  return hasil;
})();

/** JS-12 (P-24): nama zona untuk pilihan penyunting konsol. */
export const NAMA_ZONA: readonly { id: string; nama: string }[] = zona.map((z) => ({ id: z.id, nama: z.nama }));
