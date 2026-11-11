// Peta kampung untuk server (spesifikasi JS-07, P-46; Architecture 8.2; usulan 7a). kampung.json (JS-06) diimpor
// saat build. Di lingkup modul Worker, sekali saat Worker dimuat dan bukan saat menangani pesan, hanya lapisan
// `tabrakan` yang diurai, lalu `titikMuncul` dan `gerbangLobi` diambil dan grid lobi dibuat. Hanya kunci yang
// dipakai yang diimpor, agar Worker tidak membawa daftar objek peta. Pemeriksaan penuh `bacaPeta` dijalankan uji.
// JS-08: titik kejadian per zona untuk penempatan kejadian ruang (P-2, P-9).
import { gerbangLobi, lebar, tabrakan, tinggi, titikKejadian, titikMuncul } from "../../../../app/jejak-setara/peta/kampung.json";
import { tutupGerbang, uraiRle, versiPeta } from "../../../../app/jejak-setara/inti/peta";
import type { TitikPeta, ZonaId } from "../../../../app/jejak-setara/inti/tipe";
import type { PetaRuang } from "./inti-ruang";

const grid = uraiRle(tabrakan, lebar * tinggi);

/** Peta yang dipakai ruang baru dan ruang yang dipulihkan. */
export const PETA_KAMPUNG: PetaRuang = {
  versi: versiPeta({ tabrakan }),
  lebar,
  tinggi,
  tabrakan: grid,
  tabrakanLobi: tutupGerbang({ lebar, tinggi, tabrakan: grid, gerbangLobi }),
  titikMuncul,
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
