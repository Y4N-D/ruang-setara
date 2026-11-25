// Isi API ruang konsol (spesifikasi JS-10, P-2 sampai P-12). Satu sumber aturan isian untuk konsol dan server.
import { z } from "zod";
import { SKILL_P0, type SkillP0 } from "./aturan";

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
// JS-14 (P-51): ganti nama dan ganti semua nama.
export const AKSI_KELOLA = ["kunci", "buka_kunci", "keluarkan", "tutup", "ganti_nama", "ganti_semua_nama", "kode_masuk_ulang"] as const; // JS-16b (P-11)
/** JS-14 (P-32): mode nama ruang. */
export const MODE_NAMA = ["daftar", "bebas"] as const;
export type AksiKelola = (typeof AKSI_KELOLA)[number];
/** Status yang membolehkan ruang ditutup (P-10). */
export const STATUS_BOLEH_TUTUP: readonly StatusRuangKonsol[] = ["lobi", "selesai", "pembahasan"];
/** JS-11 (P-20, P-21): status yang punya hasil ronde. */
export const STATUS_HASIL: readonly StatusRuangKonsol[] = ["selesai", "pembahasan", "ditutup"];

export const KODE_GALAT_RUANG = [
  "ISI_SALAH",
  "RUANG_MASIH_ADA",
  "PAKET_BELUM_SIAP",
  "SERVER_PENUH",
  "RUANG_GAGAL_DIBUAT",
  "RUANG_TIDAK_ADA",
  "PEMAIN_TIDAK_ADA",
  "STATUS_TIDAK_SESUAI",
  // JS-11 (P-21, P-33): hasil sebelum ronde selesai, dan hapus data ruang yang belum ditutup.
  "HASIL_BELUM_ADA",
  "BELUM_DITUTUP",
  "BUKAN_NAMA_BEBAS", // JS-14 (P-51)
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
  modeNama?: (typeof MODE_NAMA)[number]; // JS-14 (P-32)
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
    modeNama: z.enum(MODE_NAMA).optional(), // JS-14 (P-32): tanpa isian berarti daftar
    // JS-09 (P-8): skill P0 yang aktif di ruang, tanpa duplikat; tanpa isian berarti ketiganya.
    skillAktif: z
      .array(z.enum(SKILL_P0))
      .max(SKILL_P0.length)
      .refine((d) => new Set(d).size === d.length)
      .optional(),
  })
  .strict();

/** JS-09 (P-8, P-9): skill P0 menurut urutan tampil; butir yang bukan skill P0 dibuang, dan selain larik menjadi ketiganya. */
export function skillAktifRuang(nilai: unknown): SkillP0[] {
  if (!Array.isArray(nilai)) return [...SKILL_P0];
  return SKILL_P0.filter((s) => nilai.includes(s));
}

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
  /** JS-09 (P-9): skill yang aktif di ruang, menurut urutan P-1. */
  skillAktif: z.array(z.enum(SKILL_P0)),
  /** JS-14 (P-33): mode nama awal ruang dari pengaturannya; ruang lama dibaca sebagai daftar. */
  modeNama: z.enum(MODE_NAMA).optional(),
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
  /** JS-11 (P-15): antrean kiriman ke D1 belum kosong. */
  kirimanTertunda: z.boolean().optional(),
  /** JS-14 (P-33): mode nama yang berlaku sekarang. */
  modeNama: z.enum(MODE_NAMA).optional(),
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
  // JS-15 (P-29): waktu pulang-pergi HP; ringkasan lama di D1 tidak memuatnya (D-3 a).
  rttMedianMs: z.number().int().min(0).nullable().optional(),
  rttP95Ms: z.number().int().min(0).nullable().optional(),
  rttSampel: z.number().int().min(0).optional(),
});
export type PemakaianRuang = z.infer<typeof skemaPemakaian>;
/** JS-15 (D-1 a): kuota bulanan Workers Paid untuk persen pemakaian; menggantikan kuota harian paket gratis JS-22. */
export const KUOTA_BULANAN_BERBAYAR = { permintaan: 1_000_000, barisDitulis: 50_000_000 } as const;
export type Langsung = z.infer<typeof skemaLangsung>;
export const skemaDetailRuang = z.object({ ruang: skemaRingkasanRuang, langsung: skemaLangsung.nullable(), pemakaian: skemaPemakaian.nullable().optional() });
export type DetailRuang = z.infer<typeof skemaDetailRuang>;

export const skemaTiket = z.object({ tiket: z.string().min(1), kedaluwarsaPada: z.number() });
/** Galat 409 `RUANG_MASIH_ADA` membawa ruang guru yang masih aktif (P-4). */
export const skemaRuangLama = z.object({ ruang: z.object({ id: z.string(), kode: z.string(), labelKelas: z.string() }) });
