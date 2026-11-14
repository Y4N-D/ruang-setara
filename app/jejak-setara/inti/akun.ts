// Skema API akun dan aturan sandi (spesifikasi JS-04, P-11, P-16, P-18, P-19, P-22 sampai P-28; Architecture 10.2
// dan 10.3). Murni: dipakai server (rute akun) dan konsol (pemeriksaan sebelum mengirim dan pemeriksaan jawaban).
// Skema isi permintaan hanya memeriksa bentuk (`.strict()`); aturan isi (email, nama, sandi) diperiksa fungsi di bawah,
// agar server bisa memberi kode galat yang tepat. Panjang teks dibatasi batas isi permintaan 4.096 byte di server.
import { z } from "zod";

export const SANDI_MIN = 12;
export const SANDI_MAKS = 128;
export const NAMA_MAKS = 40;
export const EMAIL_MAKS = 254;

export const PERAN = ["admin", "guru"] as const;
export type Peran = (typeof PERAN)[number];

/** Kode galat API akun (spesifikasi JS-04, bagian "Teks yang tampil", Galat). JARINGAN dan UMUM hanya di konsol. */
export const KODE_GALAT_AKUN = [
  "MASUK_SALAH",
  "TERKUNCI",
  "TERLALU_SERING",
  "PERLU_MASUK",
  "WAJIB_GANTI_SANDI",
  "TIDAK_BERWENANG",
  "ASAL_DITOLAK",
  "PERMINTAAN_SALAH",
  "KONSOL_BELUM_SIAP",
  "SANDI_LAMA_SALAH",
  "SANDI_PENDEK",
  "SANDI_PANJANG",
  "SANDI_SAMA_EMAIL",
  "SANDI_SAMA",
  "EMAIL_SALAH",
  "EMAIL_DIPAKAI",
  "NAMA_SALAH",
  "AKUN_TIDAK_ADA",
  "TIDAK_BOLEH_DIRI",
  "ADMIN_TERAKHIR",
  "KUNCI_ADMIN_SALAH",
  "JARINGAN",
  "UMUM",
] as const;
export type KodeGalatAkun = (typeof KODE_GALAT_AKUN)[number];

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Karakter kendali C0, DEL, dan C1 tidak boleh ada di nama tampilan (P-27).
const POLA_KENDALI = /[\u0000-\u001f\u007f-\u009f]/;

/** Email dipangkas spasinya dan diubah ke huruf kecil (P-27). */
export function normalkanEmail(masukan: string): string {
  return masukan.trim().toLowerCase();
}

/** Email yang sudah dinormalkan: paling panjang 254 karakter dan berbentuk nama@domain.akhiran tanpa spasi. */
export function emailSah(email: string): boolean {
  return email.length <= EMAIL_MAKS && POLA_EMAIL.test(email);
}

/** Nama tampilan dipangkas spasinya (P-27). */
export function normalkanNama(masukan: string): string {
  return masukan.trim();
}

/** Nama tampilan yang sudah dinormalkan: 1 sampai 40 karakter (titik kode), tanpa karakter kendali. */
export function namaSah(nama: string): boolean {
  const panjang = [...nama].length;
  return panjang >= 1 && panjang <= NAMA_MAKS && !POLA_KENDALI.test(nama);
}

/** Panjang sandi dalam titik kode Unicode sesudah dinormalkan NFC (P-19). */
export function panjangSandi(sandi: string): number {
  return [...sandi.normalize("NFC")].length;
}

export type GalatSandiBaru = "SANDI_PENDEK" | "SANDI_PANJANG" | "SANDI_SAMA_EMAIL";

/**
 * Aturan sandi baru (P-19): 12 sampai 128 karakter dan tidak sama dengan email tanpa membedakan huruf besar-kecil.
 * `email` null berarti aturan email tidak dipakai (sandi sementara admin awal, P-28).
 */
export function periksaSandiBaru(sandi: string, email: string | null): GalatSandiBaru | null {
  const panjang = panjangSandi(sandi);
  if (panjang < SANDI_MIN) return "SANDI_PENDEK";
  if (panjang > SANDI_MAKS) return "SANDI_PANJANG";
  if (email !== null && sandi.normalize("NFC").toLowerCase() === normalkanEmail(email)) return "SANDI_SAMA_EMAIL";
  return null;
}

/** Isi masuk yang layak dihash (P-11 langkah 2): email sah dan sandi 1 sampai 128 karakter. */
export function masukanMasukSah(email: string, sandi: string): boolean {
  const panjang = panjangSandi(sandi);
  return emailSah(email) && panjang >= 1 && panjang <= SANDI_MAKS;
}

const teks = () => z.string();

// ------------------------------------------------------------------ Isi permintaan (bentuk saja)

export const skemaMasuk = z.object({ email: teks(), sandi: teks() }).strict();
export const skemaGantiSandi = z.object({ sandiLama: teks().optional(), sandiBaru: teks() }).strict();
export const skemaAkunBaru = z
  .object({ email: teks(), namaTampilan: teks(), peran: z.enum(PERAN), peninjau: z.boolean() })
  .strict();
export const skemaUbahAkun = z
  .object({
    namaTampilan: teks().optional(),
    peran: z.enum(PERAN).optional(),
    peninjau: z.boolean().optional(),
    aktif: z.boolean().optional(),
    aturUlangSandi: z.literal(true).optional(),
  })
  .strict()
  .refine((isi) => Object.values(isi).some((nilai) => nilai !== undefined), { message: "kosong" });
export const skemaAdminAwal = z.object({ email: teks(), sandi: teks(), namaTampilan: teks() }).strict();

export type IsiMasuk = z.infer<typeof skemaMasuk>;
export type IsiGantiSandi = z.infer<typeof skemaGantiSandi>;
export type IsiAkunBaru = z.infer<typeof skemaAkunBaru>;
export type IsiUbahAkun = z.infer<typeof skemaUbahAkun>;
export type IsiAdminAwal = z.infer<typeof skemaAdminAwal>;

// ------------------------------------------------------------------ Jawaban server

export const skemaSaya = z.object({
  id: z.string(),
  email: z.string(),
  namaTampilan: z.string(),
  peran: z.enum(PERAN),
  peninjau: z.boolean(),
  wajibGantiSandi: z.boolean(),
});
export const skemaAkun = skemaSaya.extend({
  aktif: z.boolean(),
  dibuatPada: z.number(),
  masukTerakhir: z.number().nullable(),
});
export const skemaJawabanSaya = z.union([
  z.object({ masuk: z.literal(false) }),
  z.object({ masuk: z.literal(true), akun: skemaSaya }),
]);
export const skemaJawabanAkunSaya = z.object({ akun: skemaSaya });
export const skemaDaftarAkun = z.object({ akun: z.array(skemaAkun) });
export const skemaJawabanAkun = z.object({ akun: skemaAkun, sandiSementara: z.string().optional() });
export const skemaDasbor = z.object({ rujukanBelum: z.number().int().min(0) });
export const skemaHasilAdminAwal = z.object({ hasil: z.enum(["dibuat", "dipulihkan"]) });
export const skemaGalat = z.object({ galat: z.object({ kode: z.string(), pesan: z.string() }) });

export type Saya = z.infer<typeof skemaSaya>;
export type Akun = z.infer<typeof skemaAkun>;
export type JawabanSaya = z.infer<typeof skemaJawabanSaya>;
