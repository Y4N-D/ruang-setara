// Peta kampung untuk server (spesifikasi JS-07, P-46; Architecture 8.2; usulan 7a). kampung.json (JS-06) diimpor
// saat build. Di lingkup modul Worker, sekali saat Worker dimuat dan bukan saat menangani pesan, hanya lapisan
// `tabrakan` yang diurai, lalu `titikMuncul` dan `gerbangLobi` diambil dan grid lobi dibuat. Hanya kunci yang
// dipakai yang diimpor, agar Worker tidak membawa daftar objek peta. Pemeriksaan penuh `bacaPeta` dijalankan uji.
import { gerbangLobi, lebar, tabrakan, tinggi, titikMuncul } from "../../../../app/jejak-setara/peta/kampung.json";
import { tutupGerbang, uraiRle, versiPeta } from "../../../../app/jejak-setara/inti/peta";
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
