// Riwayat ruang, hasil per ruang, dan rincian jawaban (spesifikasi JS-11, P-14, P-17, P-21, P-24). Skema isi jawaban
// API dipakai konsol untuk memeriksa jawaban; fungsi murninya dipakai server, konsol, dan uji.
import { z } from "zod";
import { labelSah, normalkanLabel, skemaRingkasanRuang } from "./ruang";

/** Paling banyak 50 ruang per halaman riwayat (P-17). */
export const RIWAYAT_BATAS_MAKS = 50;
/** Batas atas milidetik yang diterima saringan tanggal: tanggal terbesar `Date` JavaScript. */
export const WAKTU_MAKS = 8_640_000_000_000_000;
/** Huruf pilihan yang dilihat pemain menurut posisi tampil (P-24, P-29). */
export const HURUF_PILIHAN = ["A", "B", "C", "D"] as const;

const tingkat = z.enum(["tepat", "kurang", "berisiko"]);
const bulat = () => z.number().int().min(0);

// ---------------------------------------------------------------------------------------------
// Ringkasan hasil di ruang.ringkasan_json (P-14)

export const skemaRingkasanHasilRuang = z.object({
  versi: z.literal(1),
  jumlahKejadian: bulat(),
  jumlahPemain: bulat(),
  jumlahSkor: bulat(),
  langkah1Dijawab: bulat(),
  langkah1Benar: bulat(),
  tepat: bulat(),
  kurang: bulat(),
  berisiko: bulat(),
});
export type RingkasanHasilRuang = z.infer<typeof skemaRingkasanHasilRuang>;

// ---------------------------------------------------------------------------------------------
// Riwayat (P-17)

export const skemaRuangRiwayat = z.object({
  id: z.string(),
  kode: z.string(),
  labelKelas: z.string(),
  uji: z.boolean(),
  namaGuru: z.string().nullable(),
  dibuatPada: z.number(),
  mulaiPada: z.number().nullable(),
  selesaiPada: z.number().nullable(),
  dimainkan: z.boolean(),
  jumlahPemain: bulat(),
  rataSkor: z.number().nullable(),
});
export type RuangRiwayat = z.infer<typeof skemaRuangRiwayat>;
export const skemaRiwayat = z.object({ ruang: z.array(skemaRuangRiwayat), berikutnya: z.string().nullable() });
export type Riwayat = z.infer<typeof skemaRiwayat>;

export interface SaringanRiwayat {
  dari: number | null;
  sampai: number | null;
  label: string | null;
  guru: string | null;
  batas: number;
  mulai: { dibuatPada: number; id: string } | null;
}

const POLA_PENANDA = /^(\d{1,16})_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;
const POLA_ID_GURU = /^[A-Za-z0-9_-]{1,64}$/;

export function penandaRiwayat(dibuatPada: number, id: string): string {
  return `${dibuatPada}_${id}`;
}

function bacaWaktu(nilai: string | null): number | null | "salah" {
  if (nilai === null) return null;
  if (!/^\d{1,16}$/.test(nilai)) return "salah";
  const n = Number(nilai);
  return n <= WAKTU_MAKS ? n : "salah";
}

/** Parameter riwayat (P-17); `guru` hanya dibaca untuk admin. Parameter yang tidak sah menghasilkan null (400). */
export function bacaSaringanRiwayat(p: URLSearchParams, admin: boolean): SaringanRiwayat | null {
  const dari = bacaWaktu(p.get("dari"));
  const sampai = bacaWaktu(p.get("sampai"));
  if (dari === "salah" || sampai === "salah" || (dari !== null && sampai !== null && dari >= sampai)) return null;
  let label: string | null = null;
  const labelMentah = p.get("label");
  if (labelMentah !== null) {
    label = normalkanLabel(labelMentah);
    if (!labelSah(label)) return null;
  }
  let guru: string | null = null;
  const guruMentah = p.get("guru");
  if (guruMentah !== null && admin) {
    if (!POLA_ID_GURU.test(guruMentah)) return null;
    guru = guruMentah;
  }
  let batas = RIWAYAT_BATAS_MAKS;
  const batasMentah = p.get("batas");
  if (batasMentah !== null) {
    if (!/^\d{1,2}$/.test(batasMentah)) return null;
    batas = Number(batasMentah);
    if (batas < 1 || batas > RIWAYAT_BATAS_MAKS) return null;
  }
  let mulai: SaringanRiwayat["mulai"] = null;
  const mulaiMentah = p.get("mulai");
  if (mulaiMentah !== null) {
    const m = POLA_PENANDA.exec(mulaiMentah);
    if (!m) return null;
    mulai = { dibuatPada: Number(m[1]), id: m[2] };
  }
  return { dari, sampai, label, guru, batas, mulai };
}

/** Ronde sempat berjalan: `mulai_pada` terisi dan tidak sesudah `selesai_pada` (P-17). */
export function rondeDimainkan(mulaiPada: number | null, selesaiPada: number | null): boolean {
  return mulaiPada !== null && selesaiPada !== null && mulaiPada <= selesaiPada;
}

// ---------------------------------------------------------------------------------------------
// Hasil per ruang (P-21)

export const skemaPesertaHasil = z.object({
  id: z.string(),
  nama: z.string(),
  nomorAbsen: z.number().int().nullable(),
  dikeluarkan: z.boolean(),
  peringkat: z.number().int().nullable(),
  skor: bulat(),
  selesai: bulat(),
  langkah1Dijawab: bulat(),
  langkah1Benar: bulat(),
  tepat: bulat(),
  kurang: bulat(),
  berisiko: bulat(),
  waktuSkorMs: z.number().nullable(),
});
export type PesertaHasil = z.infer<typeof skemaPesertaHasil>;

export const skemaRingkasanHasil = z.object({
  jumlahPemain: bulat(),
  dikeluarkan: bulat(),
  rataSkor: z.number().nullable(),
  ketepatan1: z.number().nullable(),
  tingkat: z.object({ tepat: z.number().nullable(), kurang: z.number().nullable(), berisiko: z.number().nullable() }),
});
export type RingkasanHasil = z.infer<typeof skemaRingkasanHasil>;

export const skemaHasilRuang = z.object({
  ruang: skemaRingkasanRuang,
  info: z.object({
    namaPaket: z.string().nullable(),
    jumlahKejadian: z.number().int().nullable(),
    durasiMenit: z.number().int(),
    modeNomorAbsen: z.boolean(),
    mulaiPada: z.number().nullable(),
    selesaiPada: z.number().nullable(),
  }),
  dimainkan: z.boolean(),
  ringkasan: skemaRingkasanHasil.nullable(),
  peserta: z.array(skemaPesertaHasil),
});
export type HasilRuang = z.infer<typeof skemaHasilRuang>;

/** Persen dengan satu angka di belakang koma; null bila penyebutnya 0. */
export function persen(bagian: number, keseluruhan: number): number | null {
  return keseluruhan > 0 ? Math.round((bagian / keseluruhan) * 1000) / 10 : null;
}

/** Rata-rata dengan satu angka di belakang koma; null bila tidak ada isinya. */
export function rataRata(jumlah: number, n: number): number | null {
  return n > 0 ? Math.round((jumlah / n) * 10) / 10 : null;
}

/** Ringkasan dari peserta yang tidak dikeluarkan (P-21; definisi PRD 11.2). */
export function ringkasHasil(peserta: readonly PesertaHasil[]): RingkasanHasil {
  const aktif = peserta.filter((p) => !p.dikeluarkan);
  const jumlah = (f: (p: PesertaHasil) => number) => aktif.reduce((n, p) => n + f(p), 0);
  const tepat = jumlah((p) => p.tepat);
  const kurang = jumlah((p) => p.kurang);
  const berisiko = jumlah((p) => p.berisiko);
  const langkah2 = tepat + kurang + berisiko;
  return {
    jumlahPemain: aktif.length,
    dikeluarkan: peserta.length - aktif.length,
    rataSkor: rataRata(jumlah((p) => p.skor), aktif.length),
    ketepatan1: persen(jumlah((p) => p.langkah1Benar), jumlah((p) => p.langkah1Dijawab)),
    tingkat: { tepat: persen(tepat, langkah2), kurang: persen(kurang, langkah2), berisiko: persen(berisiko, langkah2) },
  };
}

/**
 * Urutan peserta (P-21): menurut peringkat; peserta yang tidak dikeluarkan tetapi belum berperingkat menyusul menurut
 * waktu bergabung; lalu pemain yang dikeluarkan menurut waktu bergabung.
 */
export function urutPeserta<T extends { dikeluarkan: boolean; peringkat: number | null; gabungPada: number; id: string }>(daftar: readonly T[]): T[] {
  const kelompok = (p: T) => (p.dikeluarkan ? 2 : p.peringkat === null ? 1 : 0);
  return [...daftar].sort(
    (a, b) =>
      kelompok(a) - kelompok(b) ||
      (kelompok(a) === 0 ? (a.peringkat as number) - (b.peringkat as number) : 0) ||
      a.gabungPada - b.gabungPada ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
}

// ---------------------------------------------------------------------------------------------
// Rincian jawaban per pemain (P-24)

export const skemaJawabanRincian = z.object({
  kode: z.string(),
  judul: z.string(),
  versi: z.number().int().nullable(),
  huruf1: z.string(),
  pilihan1: z.string(),
  benar1: z.boolean(),
  jawabanTepat1: z.string(),
  huruf2: z.string().nullable(),
  pilihan2: z.string().nullable(),
  tingkat2: tingkat.nullable(),
  pilihanTepat2: z.array(z.string()),
  poin: bulat(),
  waktuMenjawabMs: z.number().nullable(),
  /** JS-09 (P-46): Petunjuk dipakai pemain di kejadian ini. */
  petunjukDipakai: z.boolean(),
});
export type JawabanRincian = z.infer<typeof skemaJawabanRincian>;
export const skemaRincianPeserta = z.object({ peserta: z.object({ id: z.string(), nama: z.string() }), jawaban: z.array(skemaJawabanRincian) });
export type RincianPeserta = z.infer<typeof skemaRincianPeserta>;

/** Nomor dari kode kejadian ("K-13" → 13) untuk urutan P-24 dan P-29; kode lain di urutan terakhir. */
export function nomorKode(kode: string): number {
  const m = /^K-(\d{1,4})$/.exec(kode);
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

// ---------------------------------------------------------------------------------------------
// Tampilan (konsol)

/** Waktu skor "m:ss" (P-23); null bila tidak ada. */
export function formatWaktuSkor(ms: number | null): string | null {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return null;
  const detik = Math.floor(ms / 1000);
  return `${Math.floor(detik / 60)}:${String(detik % 60).padStart(2, "0")}`;
}

/** Tanggal isian "YYYY-MM-DD" menjadi milidetik pukul 00.00 menurut zona waktu peramban; `besok` menambah satu hari (P-18). */
export function tanggalKeMs(tanggal: string, besok = false): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tanggal);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + (besok ? 1 : 0));
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

/** Isian konfirmasi hapus sama dengan label kelas sesudah dipangkas, tanpa membedakan huruf besar dan kecil (P-32). */
export function labelCocok(isian: string, label: string): boolean {
  const a = isian.trim().toLowerCase();
  return a.length > 0 && a === label.trim().toLowerCase();
}
