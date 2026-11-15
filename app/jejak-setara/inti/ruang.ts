// Isi API ruang konsol (spesifikasi JS-10, P-2 sampai P-12). Satu sumber aturan isian untuk konsol dan server.
import { z } from "zod";

export const LABEL_KELAS_MAKS = 20;
export const DURASI_RUANG = [10, 15, 20] as const;
export type DurasiRuang = (typeof DURASI_RUANG)[number];
export const BATAS_PEMAIN = { min: 2, maks: 100, bawaan: 40 } as const;
export const BATAS_TERLAMBAT = { min: 0, maks: 10, bawaan: 5 } as const;
/** Mode nomor absen hanya untuk ruang dengan batas sampai 50 pemain (JS-03). */
export const NOMOR_ABSEN_PEMAIN_MAKS = 50;
export const DURASI_BAWAAN: DurasiRuang = 15;

/** Ruang dihitung aktif bila belum ditutup dan dibuat kurang dari 6 jam lalu (P-4). */
export const RUANG_AKTIF_MS = 6 * 3_600_000;
/** Daftar ruang memuat ruang yang belum ditutup dan dibuat kurang dari 24 jam lalu (P-6). */
export const RUANG_DAFTAR_MS = 24 * 3_600_000;
export const RUANG_DAFTAR_MAKS = 50;
export const RUANG_DASBOR_MAKS = 5;
/** Nilai `RUANG_AKTIF_MAKS` yang kosong atau tidak sah dianggap 3 (P-4). */
export const RUANG_AKTIF_MAKS_BAWAAN = 3;

export const STATUS_RUANG = ["lobi", "hitung_mundur", "main", "jeda", "selesai", "pembahasan", "ditutup"] as const;
export type StatusRuangKonsol = (typeof STATUS_RUANG)[number];
export const AKSI_KELOLA = ["kunci", "buka_kunci", "keluarkan", "tutup"] as const;
export type AksiKelola = (typeof AKSI_KELOLA)[number];
/** Status yang membolehkan ruang ditutup (P-10). */
export const STATUS_BOLEH_TUTUP: readonly StatusRuangKonsol[] = ["lobi", "selesai", "pembahasan"];

export const KODE_GALAT_RUANG = [
  "ISI_SALAH",
  "RUANG_MASIH_ADA",
  "PAKET_BELUM_SIAP",
  "SERVER_PENUH",
  "RUANG_GAGAL_DIBUAT",
  "RUANG_TIDAK_ADA",
  "PEMAIN_TIDAK_ADA",
  "STATUS_TIDAK_SESUAI",
] as const;
export type KodeGalatRuang = (typeof KODE_GALAT_RUANG)[number];

const KARAKTER_KENDALI = /[\u0000-\u001F\u007F-\u009F]/;

export function normalkanLabel(label: string): string {
  return label.trim();
}

/** Label kelas 1–20 karakter (titik kode) tanpa karakter kendali, sesudah dipangkas (P-2, D-1). */
export function labelSah(label: string): boolean {
  const n = [...label].length;
  return n >= 1 && n <= LABEL_KELAS_MAKS && !KARAKTER_KENDALI.test(label);
}

export function bacaRuangAktifMaks(nilai: string | undefined): number {
  if (nilai === undefined || !/^\d{1,4}$/.test(nilai)) return RUANG_AKTIF_MAKS_BAWAAN;
  const n = Number(nilai);
  return n >= 1 && n <= 1000 ? n : RUANG_AKTIF_MAKS_BAWAAN;
}

export interface IsiRuangBaru {
  labelKelas: string;
  paketId: string;
  durasiMenit: DurasiRuang;
  batasPemain: number;
  batasTerlambatMenit: number;
  modeNomorAbsen: boolean;
  uji: boolean;
}
export type GalatIsianRuang = "label" | "batasPemain" | "terlambat" | "nomorAbsen";

/** Galat isian ruang baru menurut urutan isian (P-2); kosong bila semua sah. Label dipangkas lebih dulu. */
export function periksaRuangBaru(isi: IsiRuangBaru): GalatIsianRuang[] {
  const galat: GalatIsianRuang[] = [];
  if (!labelSah(normalkanLabel(isi.labelKelas))) galat.push("label");
  const batasSah = Number.isInteger(isi.batasPemain) && isi.batasPemain >= BATAS_PEMAIN.min && isi.batasPemain <= BATAS_PEMAIN.maks;
  if (!batasSah) galat.push("batasPemain");
  if (!Number.isInteger(isi.batasTerlambatMenit) || isi.batasTerlambatMenit < BATAS_TERLAMBAT.min || isi.batasTerlambatMenit > BATAS_TERLAMBAT.maks) {
    galat.push("terlambat");
  }
  if (isi.modeNomorAbsen && batasSah && isi.batasPemain > NOMOR_ABSEN_PEMAIN_MAKS) galat.push("nomorAbsen");
  return galat;
}

const POLA_ID_PEMAIN = /^[A-Za-z0-9_-]{1,32}$/;
const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function idRuangSah(id: string): boolean {
  return POLA_UUID.test(id);
}

export const skemaRuangBaru = z
  .object({
    labelKelas: z.string().max(200),
    paketId: z.string().min(1).max(64),
    durasiMenit: z.union([z.literal(10), z.literal(15), z.literal(20)]),
    batasPemain: z.number().int(),
    batasTerlambatMenit: z.number().int(),
    modeNomorAbsen: z.boolean(),
    uji: z.boolean(),
  })
  .strict();

export const skemaKelola = z.object({ aksi: z.enum(AKSI_KELOLA), pemainId: z.string().regex(POLA_ID_PEMAIN).optional() }).strict();

export const skemaRingkasanRuang = z.object({
  id: z.string(),
  kode: z.string(),
  labelKelas: z.string(),
  status: z.enum(STATUS_RUANG),
  uji: z.boolean(),
  jumlahPeserta: z.number().int().min(0),
  batasPemain: z.number().int(),
  namaGuru: z.string().nullable(),
  dibuatPada: z.number(),
});
export type RingkasanRuang = z.infer<typeof skemaRingkasanRuang>;

export const skemaPilihanRuang = z.object({
  paket: z.array(z.object({ id: z.string(), nama: z.string(), jumlahKejadian: z.number().int().min(0), siapRuangBiasa: z.boolean() })),
});
export type PilihanRuang = z.infer<typeof skemaPilihanRuang>;

export const skemaDaftarRuang = z.object({ ruang: z.array(skemaRingkasanRuang) });
export const skemaJawabanRuangBaru = z.object({ ruang: skemaRingkasanRuang });

export const skemaPemainLangsung = z.object({ id: z.string(), nama: z.string(), avatar: z.number().int().min(0).max(7), terhubung: z.boolean() });
export const skemaLangsung = z.object({
  status: z.enum(STATUS_RUANG),
  terkunci: z.boolean(),
  mulaiPada: z.number().nullable(),
  berakhirPada: z.number().nullable(),
  jedaSejak: z.number().nullable(),
  tautan: z.string(),
  pemain: z.array(skemaPemainLangsung),
  /** JS-22 (P-18): kiriman ke D1 berhenti sesudah 24 jam gagal. */
  kirimanBerhenti: z.boolean().optional(),
});

/** JS-22 (P-15 sampai P-17): pemakaian ronde, hanya untuk admin. */
export const skemaPemakaian = z.object({
  sambungan: z.number().int().min(0),
  pesanMasuk: z.number().int().min(0),
  alarm: z.number().int().min(0),
  barisSqlite: z.number().int().min(0),
  barisD1: z.number().int().min(0),
  internal: z.number().int().min(0),
  perkiraanPermintaan: z.number().int().min(0),
});
export type PemakaianRuang = z.infer<typeof skemaPemakaian>;
/** JS-22 (P-17, D-3): kuota harian paket gratis untuk persen pemakaian (permintaan Durable Object dan baris ditulis). */
export const KUOTA_HARIAN_GRATIS = 100_000;
export type Langsung = z.infer<typeof skemaLangsung>;
export const skemaDetailRuang = z.object({ ruang: skemaRingkasanRuang, langsung: skemaLangsung.nullable(), pemakaian: skemaPemakaian.nullable().optional() });
export type DetailRuang = z.infer<typeof skemaDetailRuang>;

export const skemaTiket = z.object({ tiket: z.string().min(1), kedaluwarsaPada: z.number() });
/** Galat 409 `RUANG_MASIH_ADA` membawa ruang guru yang masih aktif (P-4). */
export const skemaRuangLama = z.object({ ruang: z.object({ id: z.string(), kode: z.string(), labelKelas: z.string() }) });
