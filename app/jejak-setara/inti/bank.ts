// Aturan murni dan skema isi API bank kejadian (spesifikasi JS-12, P-2, P-8, P-13 sampai P-24). Dipakai server dan
// konsol; tidak mengimpor kode layar pemain.
import { z } from "zod";

export const STATUS_KEJADIAN = ["draf", "tinjau", "terbit", "arsip"] as const;
export type StatusKejadian = (typeof STATUS_KEJADIAN)[number];
export const AKSI_KEJADIAN = ["ajukan", "kembalikan", "terbitkan", "arsipkan", "pulihkan", "hapus"] as const;
export type AksiKejadian = (typeof AKSI_KEJADIAN)[number];

export const KODE_GALAT_BANK = [
  "TEMUAN",
  "SUDAH_DIUBAH",
  "STATUS_KEJADIAN",
  "BELUM_TERVERIFIKASI",
  "MASIH_DIPAKAI",
  "KEJADIAN_TIDAK_ADA",
  "RUJUKAN_TIDAK_ADA",
  "PAKET_TIDAK_ADA",
  "NAMA_DIPAKAI",
] as const;
export type KodeGalatBank = (typeof KODE_GALAT_BANK)[number];

/** Pengguna yang beraksi di bank. */
export interface PelakuBank {
  id: string;
  peran: "admin" | "guru";
  peninjau: boolean;
}

/** Keadaan satu kejadian yang menentukan izin dan aksi (P-2, P-14). */
export interface KeadaanKejadian {
  status: StatusKejadian;
  pemilikId: string | null;
  pernahTerbit: boolean;
  dipakaiRuang: boolean;
  adaPerubahan: boolean;
}

/** P-2: admin menyunting semua kecuali arsip; guru hanya miliknya yang berstatus Draf atau Siap tinjau (KT-03, D-4). */
export function bolehSunting(p: PelakuBank, k: KeadaanKejadian): boolean {
  if (k.status === "arsip") return false;
  if (p.peran === "admin") return true;
  return k.pemilikId === p.id && (k.status === "draf" || k.status === "tinjau");
}

/** P-14: aksi yang berlaku untuk pengguna dan keadaan ini, menurut urutan tampil. */
export function aksiBoleh(p: PelakuBank, k: KeadaanKejadian): AksiKejadian[] {
  const admin = p.peran === "admin";
  const pemilik = k.pemilikId !== null && k.pemilikId === p.id;
  const hasil: AksiKejadian[] = [];
  if (k.status === "draf" && (admin || pemilik)) hasil.push("ajukan");
  if (k.status === "tinjau" && admin) hasil.push("kembalikan");
  if (admin && (k.status === "draf" || k.status === "tinjau" || (k.status === "terbit" && k.adaPerubahan))) hasil.push("terbitkan");
  if (admin && k.status !== "arsip") hasil.push("arsipkan");
  if (admin && k.status === "arsip") hasil.push("pulihkan");
  if ((admin || pemilik) && (k.status === "draf" || k.status === "tinjau") && !k.pernahTerbit && !k.dipakaiRuang) hasil.push("hapus");
  return hasil;
}

/** Status sesudah aksi; null untuk hapus. */
export function statusSesudah(aksi: AksiKejadian): StatusKejadian | null {
  switch (aksi) {
    case "ajukan":
      return "tinjau";
    case "kembalikan":
    case "pulihkan":
      return "draf";
    case "terbitkan":
      return "terbit";
    case "arsipkan":
      return "arsip";
    default:
      return null;
  }
}

/** P-8: letak temuan `K-03/langkah1.opsi.2.teks` menjadi kunci kolom penyunting `langkah1.opsi.2.teks`. */
export function kolomDariLetak(letak: string): string {
  const i = letak.indexOf("/");
  return i >= 0 ? letak.slice(i + 1) : "";
}

/** Kode kejadian berikutnya: `K-` dan angka terbesar + 1, sedikitnya dua angka (P-7). */
export function kodeBerikutnya(kode: readonly string[]): string {
  const n = kode.reduce((m, k) => Math.max(m, /^K-(\d+)$/.test(k) ? Number(k.slice(2)) : 0), 0) + 1;
  return `K-${String(n).padStart(2, "0")}`;
}

/** Id rujukan berikutnya: `JR-` dan angka terbesar + 1, sedikitnya dua angka (P-18). */
export function idRujukanBerikutnya(id: readonly string[]): string {
  const n = id.reduce((m, k) => Math.max(m, /^JR-(\d+)$/.test(k) ? Number(k.slice(3)) : 0), 0) + 1;
  return `JR-${String(n).padStart(2, "0")}`;
}

/** Sumber rujukan dari isian satu alamat per baris menjadi bentuk tersimpan dipisah " · " (P-18). */
export function gabungSumber(baris: string): string {
  return baris
    .split(/\r?\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
    .join(" · ");
}

// -------------------------------------------------------------------------------------------
// Isi permintaan

export const skemaSimpanKejadian = z.object({ isi: z.unknown(), diubahPada: z.number().int().nullable() }).strict();
export const skemaBuatKejadian = z.object({ isi: z.unknown() }).strict();
export const skemaAksiKejadian = z.object({ aksi: z.enum(AKSI_KEJADIAN), catatan: z.string().max(400).optional() }).strict();
export const skemaIsiRujukan = z.object({ teks: z.string().max(2000), sumber: z.string().max(2000), catatan: z.string().max(4000), kodeSehari: z.string().max(20).nullable() }).strict();
export const skemaVerifikasi = z.object({ terverifikasi: z.boolean() }).strict();
export const skemaIsiPaket = z.object({ nama: z.string().max(200), deskripsi: z.string().max(1000), aktif: z.boolean(), kejadian: z.array(z.string().max(10)).max(64) }).strict();
/** Catatan perubahan saat terbit: 1–200 karakter (P-14). */
export const CATATAN_TERBIT_MAKS = 200;

// -------------------------------------------------------------------------------------------
// Jawaban

const skemaTemuan = z.object({ kode: z.string(), tingkat: z.enum(["galat", "peringatan"]), letak: z.string(), pesan: z.string() });
export type TemuanApi = z.infer<typeof skemaTemuan>;

export const skemaBarisKejadian = z.object({
  kode: z.string(),
  judul: z.string(),
  zona: z.string(),
  topik: z.string(),
  jenis: z.string(),
  status: z.enum(STATUS_KEJADIAN),
  adaPerubahan: z.boolean(),
  rujukanBelum: z.number().int().min(0),
  pemilik: z.string().nullable(),
  milikSaya: z.boolean(),
  diubahPada: z.number(),
});
export type BarisKejadian = z.infer<typeof skemaBarisKejadian>;
export const skemaDaftarKejadian = z.object({ kejadian: z.array(skemaBarisKejadian) });

export const skemaPilihanBank = z.object({
  zona: z.array(z.object({ id: z.string(), nama: z.string() })),
  topik: z.array(z.string()),
  aset: z.array(z.string()),
  rujukan: z.array(z.object({ id: z.string(), teks: z.string(), status: z.enum(["belum", "terverifikasi"]) })),
  titikPerZona: z.record(z.string(), z.number().int().min(0)),
});
export type PilihanBank = z.infer<typeof skemaPilihanBank>;

const skemaVersiTerbit = z.object({ nomor: z.number().int().min(1), dibuatPada: z.number(), penerbit: z.string().nullable(), catatan: z.string().nullable() });
export const skemaDetailKejadian = z.object({
  kejadian: z.object({ kode: z.string(), status: z.enum(STATUS_KEJADIAN), pemilik: z.string().nullable(), milikSaya: z.boolean(), adaPerubahan: z.boolean(), dipakaiRuang: z.boolean() }),
  kerja: z.object({ isi: z.unknown(), diubahPada: z.number() }),
  riwayat: z.array(skemaVersiTerbit),
  temuan: z.array(skemaTemuan),
  rujukanBelum: z.array(z.string()),
  bolehSunting: z.boolean(),
  aksi: z.array(z.enum(AKSI_KEJADIAN)),
});
export type DetailKejadian = z.infer<typeof skemaDetailKejadian>;
export const skemaVersiKejadian = z.object({ nomor: z.number().int(), isi: z.unknown(), dibuatPada: z.number(), penerbit: z.string().nullable(), catatan: z.string().nullable() });
export const skemaHasilSimpan = z.object({ kode: z.string(), diubahPada: z.number() });
export const skemaHasilAksi = z.object({ kode: z.string(), status: z.enum(STATUS_KEJADIAN).nullable(), nomor: z.number().int().nullable() });

export const skemaBarisRujukan = z.object({
  id: z.string(),
  teks: z.string(),
  sumber: z.string(),
  catatan: z.string(),
  kodeSehari: z.string().nullable(),
  status: z.enum(["belum", "terverifikasi"]),
  diverifikasiOleh: z.string().nullable(),
  diverifikasiPada: z.number().nullable(),
  dipakai: z.number().int().min(0),
});
export type BarisRujukan = z.infer<typeof skemaBarisRujukan>;
export const skemaDaftarRujukan = z.object({ rujukan: z.array(skemaBarisRujukan) });
export const skemaHasilRujukan = z.object({ rujukan: skemaBarisRujukan });

export const skemaBarisPaket = z.object({ id: z.string(), nama: z.string(), deskripsi: z.string(), aktif: z.boolean(), jumlah: z.number().int().min(0), siapRuangBiasa: z.boolean() });
export const skemaDaftarPaket = z.object({ paket: z.array(skemaBarisPaket) });
export const skemaDetailPaket = z.object({
  paket: skemaBarisPaket,
  kejadian: z.array(z.object({ kode: z.string(), judul: z.string(), zona: z.string(), status: z.enum(STATUS_KEJADIAN) })),
});
export type DetailPaket = z.infer<typeof skemaDetailPaket>;
