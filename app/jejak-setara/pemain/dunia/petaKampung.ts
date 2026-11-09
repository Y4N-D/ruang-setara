// Data peta kampung untuk layar pemain (spesifikasi JS-07, P-7, P-15, P-28, P-35, P-50). Kedua berkas peta JS-06
// diimpor saat build, hanya kunci yang dipakai layar pemain. Lapisan RLE diurai sekali saat modul dimuat.
import { gerbangLobi, halte, lebar, objek, tabrakan, tinggi, titikMuncul, zona } from "../../peta/kampung.json";
import { bayangan, daftar, kolom, tanah, tumpang } from "../../peta/kampung_gambar.json";
import { tutupGerbang, UKURAN_UBIN, uraiRle, versiPeta } from "../../inti/peta";
import type { ZonaId } from "../../inti/tipe";

const SEL = lebar * tinggi;
const gridKampung = uraiRle(tabrakan, SEL);

/** Ukuran peta dalam ubin dan piksel logis (160 × 100 ubin, 2.560 × 1.600 piksel). */
export const UKURAN_PETA = { lebar, tinggi, lebarPx: lebar * UKURAN_UBIN, tinggiPx: tinggi * UKURAN_UBIN } as const;

/** Versi peta yang dibawa halaman ini, dibandingkan dengan `selamat_datang.versiPeta` (P-50). */
export const VERSI_PETA = versiPeta({ tabrakan });

/** Grid kampung (ronde) dan grid lobi (gerbang padat), sama dengan server (P-15, P-46). */
export const GRID_KAMPUNG = { lebar, tinggi, tabrakan: gridKampung } as const;
export const GRID_LOBI = { lebar, tinggi, tabrakan: tutupGerbang({ lebar, tinggi, tabrakan: gridKampung, gerbangLobi }) } as const;

/** Nomor ubin lembar per sel untuk lapisan tanah, tumpang, dan bayangan (0 = kosong, indeks ke `daftar`). */
export const LAPISAN_GAMBAR = {
  kolom,
  daftar: daftar as readonly (number | null)[],
  tanah: uraiRle(tanah, SEL),
  tumpang: uraiRle(tumpang, SEL),
  bayangan: uraiRle(bayangan, SEL),
} as const;

export interface ObjekPeta {
  id: string;
  jenis: string;
  x: number; // ubin, pojok kiri atas jejak kaki
  y: number;
}

/** Id objek gerbang lobi; gambarnya berganti, jadi tidak masuk potongan peta (P-7, P-28). */
export const ID_GERBANG = "gerbang-lobi";
const semuaObjek: readonly ObjekPeta[] = objek;
export const OBJEK_PETA: readonly ObjekPeta[] = semuaObjek.filter((o) => o.id !== ID_GERBANG);
export const GERBANG: ObjekPeta = semuaObjek.find((o) => o.id === ID_GERBANG) ?? { id: ID_GERBANG, jenis: "gerbang_buka", x: 0, y: 0 };

export interface ZonaPeta {
  id: ZonaId;
  nama: string;
  kiri: number;
  atas: number;
  kanan: number;
  bawah: number;
}
export const ZONA: readonly ZonaPeta[] = zona.map((z) => ({ ...z, id: z.id as ZonaId }));
export const HALTE: readonly { id: string; x: number; y: number }[] = halte.map((h) => ({ id: h.id, x: h.x, y: h.y }));
export const TITIK_MUNCUL: readonly { x: number; y: number }[] = titikMuncul;
