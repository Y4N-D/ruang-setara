// Protokol real-time Jejak Setara (Architecture 6; spesifikasi JS-02, P-33 sampai P-38). Sejak JS-10 (P-16) pesan
// layar kelas ada di `protokol-kelas.ts`, yang hanya diimpor server dan konsol; pembantu skema di sini diekspor untuknya.
// Satu sumber skema zod untuk klien dan server (JA-07). Setiap pesan berbentuk { v: PROTOKOL_VERSI, t: "<tipe>", … };
// kunci tambahan ditolak (.strict()). Batas ukuran 2 KB dan frekuensi pesan diperiksa di tingkat
// sambungan (JS-03), bukan di sini.
//
// Skema di tingkat atas modul ditandai /* @__PURE__ */ dan isinya dibuat oleh fungsi, sehingga halaman
// yang hanya mengimpor PROTOKOL_VERSI tidak ikut membawa zod dan skema ini saat dibundel.
import { z } from "zod";

// Versi protokol bersama klien dan server (Architecture JA-07); naikkan bila protokol berubah tidak kompatibel.
// Nilainya di versi.ts agar halaman tanpa skema tidak ikut membawa zod (JS-03).
import { PROTOKOL_VERSI } from "./versi";
import { POLA_KODE_MASUK_ULANG } from "./aturan";
export { PROTOKOL_VERSI };

/** Kode galat protokol (Architecture 6.7). Kalimat yang tampil ditetapkan di JS-03. */
export const KODE_GALAT = [
  "RUANG_TIDAK_ADA",
  "RUANG_PENUH",
  "RUANG_TERKUNCI",
  "TERLAMBAT",
  "NAMA_DIPAKAI",
  "VERSI_BERBEDA",
  "TERLALU_CEPAT",
  "DIKELUARKAN",
  "BUKAN_JANGKAUAN",
  "NOMOR_ABSEN_DIPAKAI", // JS-03
  "NAMA_DITOLAK", // JS-14 (P-42): nama buatan siswa tidak sah, tertangkap penyaring, atau diblokir
  "KODE_MASUK_ULANG_SALAH", // JS-16b (P-14): kode dari guru salah atau kedaluwarsa
] as const;
export type KodeGalat = (typeof KODE_GALAT)[number];

/** Batas angka dan larik di dalam pesan (Architecture 5.4 dan 6.6). */
export const BATAS_PESAN = {
  pemainMaks: 100, // sama dengan BATAS.pemainMaks (JS-03, Permintaan C-8)
  duniaMaks: 64, // isi `dunia` paling banyak 64 pemain
  kejadianMaks: 64,
  seqMaks: 1_000_000_000,
  rttMsMaks: 60_000, // JS-15 (P-27): waktu pulang-pergi di `ping`
  koordinatPxMaks: 8192, // peta terbesar: 512 ubin × 16 piksel
  koordinatUbinMaks: 511,
  avatarMaks: 7, // 8 avatar: 0–7
  nomorAbsenMin: 1,
  nomorAbsenMaks: 50,
  tambahWaktuDetikMaks: 600,
} as const;

/** Panjang teks paling banyak (Architecture 5.4; nama samaran 24). */
export const PANJANG_TEKS = {
  judul: 32,
  situasi: 280,
  pertanyaan: 100,
  opsi1: 90,
  opsi2: 140,
  umpanBalik: 160,
  terjadi: 160,
  petunjuk: 120,
  hak: 120,
  kewajiban: 120,
  rujukan: 160,
  nama: 24,
  pesanGalat: 160,
} as const;

const POLA_ID = /^[A-Za-z0-9_-]{1,32}$/;
const POLA_TOKEN = /^[A-Za-z0-9_-]{43}$/;
const POLA_KODE = /^[a-z0-9_]{1,32}$/;

// Pembuat skema kecil. Berupa fungsi agar tidak ada panggilan zod di tingkat atas modul.
export const id = () => z.string().regex(POLA_ID);
export const teks = (maks: number) => z.string().min(1).max(maks);
export const angkaBulat = (min: number, maks: number) => z.number().int().min(min).max(maks);
export const waktu = () => z.number().finite().nonnegative(); // milidetik
export const waktuAtauKosong = () => waktu().nullable();
export const koordinatPx = () => z.number().finite().min(0).max(BATAS_PESAN.koordinatPxMaks);
const koordinatUbin = () => angkaBulat(0, BATAS_PESAN.koordinatUbinMaks);
const arah = () => z.enum(["bawah", "atas", "kanan", "kiri"]);
const skill = () => z.enum(["lari", "kompas", "petunjuk", "teropong", "angkot"]);
export const tingkat = () => z.enum(["tepat", "kurang", "berisiko"]);
export const avatar = () => angkaBulat(0, BATAS_PESAN.avatarMaks);
export const warnaTas = () => z.enum(["sun", "mango", "coral", "rose", "berry", "teal", "leaf", "sky-d"]);
export const statusRuang = () => z.enum(["lobi", "hitung_mundur", "main", "jeda", "selesai", "pembahasan", "ditutup"]);
export const nama = () => teks(PANJANG_TEKS.nama);
/** JS-14 (P-58): mode nama ruang, daftar nama samaran atau nama buatan siswa. */
export const modeNama = () => z.enum(["daftar", "bebas"]);
export const skor = () => angkaBulat(0, 1_000_000);
export const peringkat = () => angkaBulat(1, BATAS_PESAN.pemainMaks);
const poin = () => angkaBulat(0, 100);
export const kartu = () =>
  z
    .object({
      hak: teks(PANJANG_TEKS.hak),
      kewajiban: teks(PANJANG_TEKS.kewajiban),
      rujukan: z.array(teks(PANJANG_TEKS.rujukan)).min(1).max(4),
    })
    .strict();
const pengaturan = () =>
  z
    .object({
      durasiMenit: z.union([z.literal(10), z.literal(15), z.literal(20)]),
      batasPemain: angkaBulat(2, BATAS_PESAN.pemainMaks),
      batasTerlambatMenit: angkaBulat(0, 10),
      skillAktif: z
        .array(skill())
        .max(5)
        .refine((daftar) => new Set(daftar).size === daftar.length, "skill ganda"),
      modeNomorAbsen: z.boolean(),
      uji: z.boolean(),
      modeNama: modeNama(), // JS-14: mode yang berlaku untuk pemain ini (P-34, P-41)
    })
    .strict();

/** Skema satu pesan: amplop { v: PROTOKOL_VERSI, t } ditambah isi, tanpa kunci tambahan (versi 2 sejak JS-08). */
export function pesan<T extends string, S extends z.ZodRawShape>(t: T, isi: () => S) {
  return z.object({ v: z.literal(PROTOKOL_VERSI), t: z.literal(t), ...isi() }).strict();
}

// ---------------------------------------------------------------------------------------------
// Pemain → server (Architecture 6.3)

const pHalo = /* @__PURE__ */ pesan("halo", () => ({
  peran: z.literal("pemain"),
  token: z.string().regex(POLA_TOKEN).optional(), // 32 byte acak, base64url tanpa padding
  nomorAbsen: angkaBulat(BATAS_PESAN.nomorAbsenMin, BATAS_PESAN.nomorAbsenMaks).optional(),
  kodeMasukUlang: z.string().regex(POLA_KODE_MASUK_ULANG).optional(), // JS-16b (P-13)
}));
const pPilihIdentitas = /* @__PURE__ */ pesan("pilih_identitas", () => ({ nama: nama(), avatar: avatar() }));
const pMintaNama = /* @__PURE__ */ pesan("minta_nama", () => ({})); // tombol "Acak ulang" (JS-03)
const pGerak = /* @__PURE__ */ pesan("gerak", () => ({
  x: koordinatPx(),
  y: koordinatPx(),
  arah: arah(),
  jalan: z.boolean(),
  seq: angkaBulat(0, BATAS_PESAN.seqMaks),
}));
const pPeriksa = /* @__PURE__ */ pesan("periksa", () => ({ kejadianId: id() }));
const pKunci1 = /* @__PURE__ */ pesan("kunci_1", () => ({ kejadianId: id(), opsiId: id() }));
const pKunci2 = /* @__PURE__ */ pesan("kunci_2", () => ({ kejadianId: id(), opsiId: id() }));
const pTutupDialog = /* @__PURE__ */ pesan("tutup_dialog", () => ({ kejadianId: id() }));
const pPakaiSkill = /* @__PURE__ */ pesan("pakai_skill", () => ({
  skill: skill(),
  kejadianId: id().optional(),
  halteId: z.string().regex(/^halte-[0-9]{1,2}$/).optional(), // JS-18 (P-40): hanya untuk Angkot, sejak versi 6
}));
const pAmbilKotak = /* @__PURE__ */ pesan("ambil_kotak", () => ({ kotakId: id() }));
// JS-15 (P-27): `rttMs` = waktu pulang-pergi terakhir yang diukur HP; `ping` pertama tanpa nilai ini.
const pPing = /* @__PURE__ */ pesan("ping", () => ({ tKlien: waktu(), rttMs: angkaBulat(0, BATAS_PESAN.rttMsMaks).optional() }));

export const skemaPemain = /* @__PURE__ */ z.discriminatedUnion("t", [
  pHalo,
  pPilihIdentitas,
  pMintaNama,
  pGerak,
  pPeriksa,
  pKunci1,
  pKunci2,
  pTutupDialog,
  pPakaiSkill,
  pAmbilKotak,
  pPing,
]);

// ---------------------------------------------------------------------------------------------
// Server → pemain (Architecture 6.3)

export const isiStatusRuang = () => ({
  status: statusRuang(),
  mulaiPada: waktuAtauKosong(),
  berakhirPada: waktuAtauKosong(),
  jedaSejak: waktuAtauKosong(),
});
export const isiGalat = () => ({ kode: z.enum(KODE_GALAT), pesan: z.string().max(PANJANG_TEKS.pesanGalat) });

const sSelamatDatang = /* @__PURE__ */ pesan("selamat_datang", () => ({
  pemainId: id(),
  token: z.string().regex(POLA_TOKEN),
  status: statusRuang(),
  pengaturan: pengaturan(),
  waktuServer: waktu(),
  versiPeta: angkaBulat(1, 1_000_000),
  saranNama: z.array(nama()).max(3),
  avatarTersedia: z.array(avatar()).max(BATAS_PESAN.avatarMaks + 1),
}));
const sStatusRuang = /* @__PURE__ */ pesan("status_ruang", isiStatusRuang);
const sDunia = /* @__PURE__ */ pesan("dunia", () => ({
  w: waktu(),
  // [id, x, y, arah, jalan, dialog]; unsur keenam `dialog` sejak versi 2 (JS-08, P-64).
  p: z.array(z.tuple([id(), koordinatPx(), koordinatPx(), arah(), z.boolean(), z.boolean()])).max(BATAS_PESAN.duniaMaks),
  n: angkaBulat(0, BATAS_PESAN.pemainMaks), // jumlah pemain berkeidentitas di ruang
}));
const sPemainBaru = /* @__PURE__ */ pesan("pemain_baru", () => ({ id: id(), nama: nama(), avatar: avatar(), warnaTas: warnaTas() }));
const sPemainPergi = /* @__PURE__ */ pesan("pemain_pergi", () => ({ id: id() }));
const sPribadi = /* @__PURE__ */ pesan("pribadi", () => ({
  skor: skor(),
  peringkat: peringkat(),
  selesai: z.array(id()).max(BATAS_PESAN.kejadianMaks),
  terlihat: z.array(id()).max(BATAS_PESAN.kejadianMaks),
  muatan: z
    .object({
      lari: angkaBulat(0, 2),
      kompas: angkaBulat(0, 2),
      petunjuk: angkaBulat(0, 2),
      teropong: angkaBulat(0, 1),
      angkot: angkaBulat(0, 1),
    })
    .strict(),
  aktifSampai: z
    .object({
      lari: waktu().optional(),
      kompas: waktu().optional(),
      petunjuk: waktu().optional(),
      teropong: waktu().optional(),
      angkot: waktu().optional(),
    })
    .strict(),
  kotakMenunggu: z.array(z.object({ id: id(), siapPada: waktu() }).strict()).max(BATAS_PESAN.kejadianMaks),
}));
const sKejadianTerlihat = /* @__PURE__ */ pesan("kejadian_terlihat", () => ({
  kejadianId: id(),
  x: koordinatUbin(),
  y: koordinatUbin(),
  setTokoh: z.array(id()).min(1).max(4), // tokoh dan properti di titik itu, sejak versi 2 (JS-08, P-64)
}));
const sKompas = /* @__PURE__ */ pesan("kompas", () => ({ x: koordinatUbin(), y: koordinatUbin(), berakhirPada: waktu() }));
const sKejadianTerbuka = /* @__PURE__ */ pesan("kejadian_terbuka", () => ({
  kejadianId: id(),
  judul: teks(PANJANG_TEKS.judul),
  situasi: teks(PANJANG_TEKS.situasi),
  setTokoh: z.array(id()).max(4),
  pertanyaan1: teks(PANJANG_TEKS.pertanyaan),
  opsi1: z
    .array(z.object({ id: id(), teks: teks(PANJANG_TEKS.opsi1) }).strict())
    .length(4),
  langkah: z.union([z.literal(1), z.literal(2)]),
}));
const sPetunjuk = /* @__PURE__ */ pesan("petunjuk", () => ({
  kejadianId: id(),
  kalimat: teks(PANJANG_TEKS.petunjuk),
  opsiDicoret: id(),
}));
const sHasil1 = /* @__PURE__ */ pesan("hasil_1", () => ({
  benar: z.boolean(),
  opsiBenar: id(),
  umpanBalik: teks(PANJANG_TEKS.umpanBalik), // untuk pilihan pemain
  umpanBalikBenar: teks(PANJANG_TEKS.umpanBalik).optional(), // untuk pilihan benar, bila pemain keliru
  poin: poin(),
  pertanyaan2: teks(PANJANG_TEKS.pertanyaan),
  opsi2: z
    .array(z.object({ id: id(), teks: teks(PANJANG_TEKS.opsi2) }).strict())
    .length(3),
}));
const sHasil2 = /* @__PURE__ */ pesan("hasil_2", () => ({
  tingkat: tingkat(),
  poin: poin(),
  terjadi: teks(PANJANG_TEKS.terjadi),
  opsiTepat: z.array(id()).min(1).max(3), // semua pilihan bertingkat tepat
  kartu: kartu(),
}));
const sKoreksi = /* @__PURE__ */ pesan("koreksi", () => ({
  x: koordinatPx(),
  y: koordinatPx(),
  seq: angkaBulat(0, BATAS_PESAN.seqMaks),
}));
const sPemberitahuan = /* @__PURE__ */ pesan("pemberitahuan", () => ({ kode: z.string().regex(POLA_KODE) }));
const sSelesai = /* @__PURE__ */ pesan("selesai", () => ({
  skor: skor(),
  peringkat: peringkat(),
  jumlahPemain: angkaBulat(1, BATAS_PESAN.pemainMaks),
  rekap: z
    .array(
      z
        .object({
          kejadianId: id(),
          judul: teks(PANJANG_TEKS.judul),
          pilihan1: teks(PANJANG_TEKS.opsi1),
          benar1: z.boolean(),
          opsiBenar1: teks(PANJANG_TEKS.opsi1),
          pilihan2: teks(PANJANG_TEKS.opsi2).nullable(), // null bila Langkah 2 belum dijawab
          tingkat2: tingkat().nullable(),
          opsiTepat2: z.array(teks(PANJANG_TEKS.opsi2)).min(1).max(3),
          poin: poin(),
          rujukan: z.array(teks(PANJANG_TEKS.rujukan)).min(1).max(4),
        })
        .strict(),
    )
    .max(BATAS_PESAN.kejadianMaks),
}));
const sGalat = /* @__PURE__ */ pesan("galat", isiGalat);
const sPong = /* @__PURE__ */ pesan("pong", () => ({ tKlien: waktu(), waktuServer: waktu() }));
const sSaranNama = /* @__PURE__ */ pesan("saran_nama", () => ({ saranNama: z.array(nama()).max(3) })); // JS-03
const sNamaBaru = /* @__PURE__ */ pesan("nama_baru", () => ({ id: id(), nama: nama() })); // JS-14 (P-46)
const sModeNama = /* @__PURE__ */ pesan("mode_nama", () => ({ modeNama: modeNama() })); // JS-14 (P-44, P-48)

export const skemaServerPemain = /* @__PURE__ */ z.discriminatedUnion("t", [
  sSelamatDatang,
  sStatusRuang,
  sDunia,
  sPemainBaru,
  sPemainPergi,
  sPribadi,
  sKejadianTerlihat,
  sKompas,
  sKejadianTerbuka,
  sPetunjuk,
  sHasil1,
  sHasil2,
  sKoreksi,
  sPemberitahuan,
  sSelesai,
  sGalat,
  sPong,
  sSaranNama,
  sNamaBaru,
  sModeNama,
]);

export type PesanPemain = z.infer<typeof skemaPemain>;
export type PesanServerPemain = z.infer<typeof skemaServerPemain>;
