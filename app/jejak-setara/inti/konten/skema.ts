// Skema konten Jejak Setara (Architecture 5.4; spesifikasi JS-05). Satu sumber untuk bank awal
// (content:check:jejak dan semai) dan untuk isian konsol (JS-12): satu kejadian, satu rujukan, satu paket,
// dan berkas bank awal. Aturan yang tidak bisa ditulis sebagai skema ada di periksa.ts.
//
// Seperti protokol.ts, skema di tingkat atas modul ditandai /* @__PURE__ */ dan isinya dibuat oleh fungsi.
import { z } from "zod";
import { BATAS_PESAN, PANJANG_TEKS } from "../protokol";
import type { IsiKejadian } from "../tipe";

/** Versi bentuk berkas bank awal. */
export const VERSI_BANK = 1;

/** Panjang teks paling banyak, dihitung sebagai `length` JavaScript, sama dengan protokol. */
export const PANJANG_KONTEN = {
  judul: PANJANG_TEKS.judul,
  situasi: PANJANG_TEKS.situasi,
  pertanyaan: PANJANG_TEKS.pertanyaan,
  opsi1: PANJANG_TEKS.opsi1,
  umpanBalik: PANJANG_TEKS.umpanBalik,
  petunjuk: PANJANG_TEKS.petunjuk,
  opsi2: PANJANG_TEKS.opsi2,
  terjadi: PANJANG_TEKS.terjadi,
  hak: PANJANG_TEKS.hak,
  kewajiban: PANJANG_TEKS.kewajiban,
  teksRujukan: PANJANG_TEKS.rujukan,
  topik: 40,
  sumber: 400,
  catatan: 600,
  namaPaket: 40,
  deskripsiPaket: 160,
} as const;

/** Batas jumlah (Architecture 5.4) dan ambang pemeriksaan. */
export const BATAS_KONTEN = {
  kalimatSituasiMin: 1,
  kalimatSituasiMaks: 3,
  setTokohMin: 1,
  setTokohMaks: 4,
  rujukanMin: 1,
  rujukanMaks: 4,
  petunjukSalinMaks: 20, // potongan sama terpanjang antara petunjuk dan pilihan benar yang masih boleh
  kejadianPaketMaks: BATAS_PESAN.kejadianMaks,
} as const;

/** Pola kode dan kunci. */
export const POLA_KONTEN = {
  kodeKejadian: /^K-\d{2,3}$/,
  idRujukan: /^JR-\d{2,3}$/,
  kodeSehari: /^R-\d{2}$/,
  kunciAset: /^(npc|obj)_[a-z0-9_]{1,28}$/,
  idOpsi1: /^1[a-d]$/,
  idOpsi2: /^2[a-c]$/,
  sumber: /^https:\/\/\S+( · https:\/\/\S+){0,2}$/,
} as const;

/** Rujukan di berkas bank awal. Tanpa kolom status: semai selalu menulis `belum` (Architecture 10.6). */
export interface RujukanBank {
  id: string;
  teks: string;
  sumber: string;
  kodeSehari: string | null;
  catatan: string;
}

/** Paket di berkas bank awal: kode kejadian berurutan. Paket bank awal selalu disemai aktif. */
export interface PaketBank {
  nama: string;
  deskripsi: string;
  kejadian: string[];
}

export interface BankAwal {
  versi: typeof VERSI_BANK;
  rujukan: RujukanBank[];
  kejadian: IsiKejadian[];
  paket: PaketBank[];
}

// Teks polos (Architecture 5.4): tanpa spasi di tepi atau spasi ganda, tanpa karakter kendali atau tak
// terlihat, dan tanpa tanda HTML, Markdown, atau tautan.
const POLA_SPASI = /^\s|\s$| {2}/;
const POLA_KENDALI = /[\p{Cc}\p{Cf}]/u;
const POLA_MARKAH = /[<>*_`#[\]]|https?:|www\./i;

/** Alasan sebuah teks tidak polos, atau null bila polos. */
export function alasanTidakPolos(teks: string): string | null {
  if (POLA_SPASI.test(teks)) return "spasi di awal, di akhir, atau spasi ganda";
  if (POLA_KENDALI.test(teks)) return "karakter kendali atau karakter tak terlihat";
  if (POLA_MARKAH.test(teks)) return "tanda HTML atau Markdown, atau tautan";
  return null;
}

// Pembuat skema kecil. Berupa fungsi agar tidak ada panggilan zod di tingkat atas modul.
const teksPolos = (maks: number) =>
  z
    .string()
    .min(1)
    .max(maks)
    .superRefine((teks, ctx) => {
      const alasan = alasanTidakPolos(teks);
      if (alasan) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Bukan teks polos: ${alasan}.`, params: { kode: "TEKS_POLOS" } });
    });
const pola = (p: RegExp, pesan: string) => z.string().regex(p, pesan);
const kodeKejadian = () => pola(POLA_KONTEN.kodeKejadian, "Kode kejadian berbentuk K-01.");
const idRujukan = () => pola(POLA_KONTEN.idRujukan, "Id rujukan berbentuk JR-01.");

const opsi1 = () =>
  z
    .object({
      id: pola(POLA_KONTEN.idOpsi1, "Id pilihan Langkah 1 adalah 1a, 1b, 1c, atau 1d."),
      teks: teksPolos(PANJANG_KONTEN.opsi1),
      benar: z.boolean(),
      umpanBalik: teksPolos(PANJANG_KONTEN.umpanBalik),
    })
    .strict();
const opsi2 = () =>
  z
    .object({
      id: pola(POLA_KONTEN.idOpsi2, "Id pilihan Langkah 2 adalah 2a, 2b, atau 2c."),
      teks: teksPolos(PANJANG_KONTEN.opsi2),
      tingkat: z.enum(["tepat", "kurang", "berisiko"]),
      terjadi: teksPolos(PANJANG_KONTEN.terjadi),
    })
    .strict();

function buatSkemaIsiKejadian() {
  return z
    .object({
      kode: kodeKejadian(),
      judul: teksPolos(PANJANG_KONTEN.judul),
      zona: z.enum(["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]),
      setTokoh: z
        .array(pola(POLA_KONTEN.kunciAset, "Kunci aset berbentuk npc_… atau obj_…, huruf kecil, paling banyak 32 karakter."))
        .min(BATAS_KONTEN.setTokohMin)
        .max(BATAS_KONTEN.setTokohMaks),
      situasi: teksPolos(PANJANG_KONTEN.situasi),
      langkah1: z
        .object({
          pertanyaan: teksPolos(PANJANG_KONTEN.pertanyaan),
          opsi: z.tuple([opsi1(), opsi1(), opsi1(), opsi1()]),
          petunjuk: teksPolos(PANJANG_KONTEN.petunjuk),
        })
        .strict(),
      langkah2: z
        .object({
          pertanyaan: teksPolos(PANJANG_KONTEN.pertanyaan),
          opsi: z.tuple([opsi2(), opsi2(), opsi2()]),
        })
        .strict(),
      kartu: z
        .object({
          hak: teksPolos(PANJANG_KONTEN.hak),
          kewajiban: teksPolos(PANJANG_KONTEN.kewajiban),
          rujukan: z.array(idRujukan()).min(BATAS_KONTEN.rujukanMin).max(BATAS_KONTEN.rujukanMaks),
        })
        .strict(),
      topik: teksPolos(PANJANG_KONTEN.topik),
      jenis: z.enum(["pelanggaran_hak", "pengabaian_kewajiban", "keduanya"]),
    })
    .strict();
}

function buatSkemaRujukanBank() {
  return z
    .object({
      id: idRujukan(),
      teks: teksPolos(PANJANG_KONTEN.teksRujukan),
      sumber: z
        .string()
        .max(PANJANG_KONTEN.sumber)
        .regex(POLA_KONTEN.sumber, "Sumber berupa 1–3 alamat https:// yang dipisah \" · \"."),
      kodeSehari: pola(POLA_KONTEN.kodeSehari, "Kode Sehari Setara berbentuk R-01.").nullable(),
      catatan: teksPolos(PANJANG_KONTEN.catatan),
    })
    .strict();
}

function buatSkemaPaketBank() {
  return z
    .object({
      nama: teksPolos(PANJANG_KONTEN.namaPaket),
      deskripsi: teksPolos(PANJANG_KONTEN.deskripsiPaket),
      kejadian: z.array(kodeKejadian()).min(1).max(BATAS_KONTEN.kejadianPaketMaks),
    })
    .strict();
}

function buatSkemaBankAwal() {
  return z
    .object({
      versi: z.literal(VERSI_BANK),
      rujukan: z.array(buatSkemaRujukanBank()).min(1),
      kejadian: z.array(buatSkemaIsiKejadian()).min(1),
      paket: z.array(buatSkemaPaketBank()).min(1),
    })
    .strict();
}

/** Satu versi kejadian (Architecture 5.1 dan 5.4). Dipakai bank awal dan penyunting konsol. */
export const skemaIsiKejadian: z.ZodType<IsiKejadian> = /* @__PURE__ */ buatSkemaIsiKejadian();
/** Satu rujukan di berkas bank awal. */
export const skemaRujukanBank: z.ZodType<RujukanBank> = /* @__PURE__ */ buatSkemaRujukanBank();
/** Satu paket di berkas bank awal. */
export const skemaPaketBank: z.ZodType<PaketBank> = /* @__PURE__ */ buatSkemaPaketBank();
/** Seluruh berkas `server/jejak-setara/seed/bank-awal.json`. */
export const skemaBankAwal: z.ZodType<BankAwal> = /* @__PURE__ */ buatSkemaBankAwal();
