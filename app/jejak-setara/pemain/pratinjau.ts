// Mode pratinjau layar pemain untuk penyunting konsol (spesifikasi JS-12, P-11 dan P-12). Murni: menerjemahkan isi
// kejadian menjadi pesan yang biasanya datang dari server, sehingga dialog kejadian yang sungguhan bisa digambar tanpa
// menyambung ke ruang. Isi datang dari konsol di asal yang sama, yang sudah memakai skema kejadian; di sini hanya
// bentuk yang dibutuhkan untuk menggambar yang diperiksa.
// JS-09 (P-44, D-3a): Petunjuk tiruan bermuatan 2 yang mencoret pilihan keliru pertama menurut urutan asli A sampai D.
import { POIN } from "../inti/aturan";
import type { Hasil1, Hasil2 } from "../bersama/dialogKeadaan";
import type { PesanServerPemain } from "../inti/protokol";
import type { IsiKejadian } from "../inti/tipe";
import { PROTOKOL_VERSI } from "../inti/versi";

export interface IsiPratinjau {
  isi: IsiKejadian;
  rujukan: string[];
  bentuk: "panel" | "lembar";
}
export type PesanPratinjau = ({ jenis: "isi" } & IsiPratinjau) | { jenis: "ulang" };

/** Pesan `postMessage` dari konsol; bentuk yang tidak bisa digambar ditolak (P-12). */
export function bacaPesanPratinjau(data: unknown): PesanPratinjau | null {
  const p = data as { jenis?: unknown; isi?: IsiKejadian; rujukan?: unknown; bentuk?: unknown } | null;
  if (p?.jenis === "jejak-pratinjau-ulang") return { jenis: "ulang" };
  const isi = p?.jenis === "jejak-pratinjau" ? p.isi : undefined;
  if (typeof isi?.judul !== "string" || isi.langkah1?.opsi?.length !== 4 || isi.langkah2?.opsi?.length !== 3 || !isi.kartu) return null;
  return { jenis: "isi", isi, rujukan: Array.isArray(p?.rujukan) ? p.rujukan.map(String) : [], bentuk: p?.bentuk === "lembar" ? "lembar" : "panel" };
}

/** Pilihan Langkah 1 dalam urutan asli A–D (D-2). */
export function pesanTerbuka(isi: IsiKejadian): Extract<PesanServerPemain, { t: "kejadian_terbuka" }> {
  const { judul, situasi, setTokoh } = isi;
  return { v: PROTOKOL_VERSI, t: "kejadian_terbuka", kejadianId: "pratinjau", judul, situasi, setTokoh, pertanyaan1: isi.langkah1.pertanyaan, opsi1: isi.langkah1.opsi.map(({ id, teks }) => ({ id, teks })), langkah: 1 };
}

/** Muatan Petunjuk tiruan di pratinjau (P-44). */
export const MUATAN_PETUNJUK_PRATINJAU = 2;

/** Isi `petunjuk` tiruan (P-44, D-3a): kalimat dari isi yang disunting dan pilihan keliru pertama menurut urutan asli. */
export function petunjukPratinjau(isi: IsiKejadian): { kejadianId: string; kalimat: string; opsiDicoret: string } {
  const keliru = isi.langkah1.opsi.find((o) => !o.benar) ?? isi.langkah1.opsi[0];
  return { kejadianId: "pratinjau", kalimat: typeof isi.langkah1.petunjuk === "string" ? isi.langkah1.petunjuk.trim() : "", opsiDicoret: keliru.id };
}

export function hasilLangkah1(isi: IsiKejadian, opsiId: string): Hasil1 {
  const o = isi.langkah1.opsi;
  const dipilih = o.find((x) => x.id === opsiId) ?? o[0];
  const benar = o.find((x) => x.benar) ?? o[0];
  return {
    benar: dipilih.benar,
    opsiBenar: benar.id,
    umpanBalik: dipilih.umpanBalik,
    umpanBalikBenar: dipilih.benar ? undefined : benar.umpanBalik,
    poin: dipilih.benar ? POIN.langkah1Benar : 0,
    pertanyaan2: isi.langkah2.pertanyaan,
    opsi2: isi.langkah2.opsi.map(({ id, teks }) => ({ id, teks })),
  };
}

export function hasilLangkah2(isi: IsiKejadian, rujukan: string[], opsiId: string): Hasil2 {
  const o = isi.langkah2.opsi;
  const dipilih = o.find((x) => x.id === opsiId) ?? o[0];
  return {
    tingkat: dipilih.tingkat,
    poin: POIN[dipilih.tingkat],
    terjadi: dipilih.terjadi,
    opsiTepat: o.filter((x) => x.tingkat === "tepat").map((x) => x.id),
    kartu: { hak: isi.kartu.hak, kewajiban: isi.kartu.kewajiban, rujukan },
  };
}
