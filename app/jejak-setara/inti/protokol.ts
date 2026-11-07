// Protokol real-time Jejak Setara (Architecture 6; spesifikasi JS-02, P-33 sampai P-38).
// Satu sumber skema zod untuk klien dan server (JA-07). Setiap pesan berbentuk { v: 1, t: "<tipe>", … };
// kunci tambahan ditolak (.strict()). Batas ukuran 2 KB dan frekuensi pesan diperiksa di tingkat
// sambungan (JS-03), bukan di sini.
//
// Skema di tingkat atas modul ditandai /* @__PURE__ */ dan isinya dibuat oleh fungsi, sehingga halaman
// yang hanya mengimpor PROTOKOL_VERSI tidak ikut membawa zod dan skema ini saat dibundel.
import { z } from "zod";

// Versi protokol bersama klien dan server (Architecture JA-07); naikkan bila protokol berubah tidak kompatibel.
export const PROTOKOL_VERSI = 1;

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
] as const;
export type KodeGalat = (typeof KODE_GALAT)[number];

/** Batas angka dan larik di dalam pesan (Architecture 5.4 dan 6.6). */
export const BATAS_PESAN = {
  pemainMaks: 50, // sama dengan BATAS.pemainMaks
  duniaMaks: 64, // isi `dunia` paling banyak 64 pemain
  kejadianMaks: 64,
  seqMaks: 1_000_000_000,
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
const id = () => z.string().regex(POLA_ID);
const teks = (maks: number) => z.string().min(1).max(maks);
const angkaBulat = (min: number, maks: number) => z.number().int().min(min).max(maks);
const waktu = () => z.number().finite().nonnegative(); // milidetik
const waktuAtauKosong = () => waktu().nullable();
const koordinatPx = () => z.number().finite().min(0).max(BATAS_PESAN.koordinatPxMaks);
const koordinatUbin = () => angkaBulat(0, BATAS_PESAN.koordinatUbinMaks);
const arah = () => z.enum(["bawah", "atas", "kanan", "kiri"]);
const skill = () => z.enum(["lari", "kompas", "petunjuk", "teropong", "angkot"]);
const tingkat = () => z.enum(["tepat", "kurang", "berisiko"]);
const avatar = () => angkaBulat(0, BATAS_PESAN.avatarMaks);
const warnaTas = () => z.enum(["sun", "mango", "coral", "rose", "berry", "teal", "leaf", "sky-d"]);
const statusRuang = () => z.enum(["lobi", "hitung_mundur", "main", "jeda", "selesai", "pembahasan", "ditutup"]);
const nama = () => teks(PANJANG_TEKS.nama);
const skor = () => angkaBulat(0, 1_000_000);
const peringkat = () => angkaBulat(1, BATAS_PESAN.pemainMaks);
const poin = () => angkaBulat(0, 100);
const kartu = () =>
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
    })
    .strict();

/** Skema satu pesan: amplop { v: 1, t } ditambah isi, tanpa kunci tambahan. */
function pesan<T extends string, S extends z.ZodRawShape>(t: T, isi: () => S) {
  return z.object({ v: z.literal(PROTOKOL_VERSI), t: z.literal(t), ...isi() }).strict();
}

// ---------------------------------------------------------------------------------------------
// Pemain → server (Architecture 6.3)

const pHalo = /* @__PURE__ */ pesan("halo", () => ({
  peran: z.literal("pemain"),
  token: z.string().regex(POLA_TOKEN).optional(), // 32 byte acak, base64url tanpa padding
  nomorAbsen: angkaBulat(BATAS_PESAN.nomorAbsenMin, BATAS_PESAN.nomorAbsenMaks).optional(),
}));
const pPilihIdentitas = /* @__PURE__ */ pesan("pilih_identitas", () => ({ nama: nama(), avatar: avatar() }));
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
const pPakaiSkill = /* @__PURE__ */ pesan("pakai_skill", () => ({ skill: skill(), kejadianId: id().optional() }));
const pAmbilKotak = /* @__PURE__ */ pesan("ambil_kotak", () => ({ kotakId: id() }));
const pPing = /* @__PURE__ */ pesan("ping", () => ({ tKlien: waktu() }));

export const skemaPemain = /* @__PURE__ */ z.discriminatedUnion("t", [
  pHalo,
  pPilihIdentitas,
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
// Layar kelas → server (Architecture 6.4)

const kHalo = /* @__PURE__ */ pesan("halo", () => ({ peran: z.literal("guru") }));
const kMulai = /* @__PURE__ */ pesan("mulai", () => ({}));
const kJeda = /* @__PURE__ */ pesan("jeda", () => ({}));
const kLanjut = /* @__PURE__ */ pesan("lanjut", () => ({}));
const kAkhiri = /* @__PURE__ */ pesan("akhiri", () => ({}));
const kTambahWaktu = /* @__PURE__ */ pesan("tambah_waktu", () => ({ detik: angkaBulat(1, BATAS_PESAN.tambahWaktuDetikMaks) }));
const kKunciRuang = /* @__PURE__ */ pesan("kunci_ruang", () => ({ kunci: z.boolean() }));
const kKeluarkan = /* @__PURE__ */ pesan("keluarkan", () => ({ pemainId: id() }));
const kKodeMasukUlang = /* @__PURE__ */ pesan("kode_masuk_ulang", () => ({ pemainId: id() }));
const kPembahasan = /* @__PURE__ */ pesan("pembahasan", () => ({ kejadianId: id() }));
const kTutupRuang = /* @__PURE__ */ pesan("tutup_ruang", () => ({}));

export const skemaKelas = /* @__PURE__ */ z.discriminatedUnion("t", [
  kHalo,
  kMulai,
  kJeda,
  kLanjut,
  kAkhiri,
  kTambahWaktu,
  kKunciRuang,
  kKeluarkan,
  kKodeMasukUlang,
  kPembahasan,
  kTutupRuang,
]);

// ---------------------------------------------------------------------------------------------
// Server → pemain (Architecture 6.3)

const isiStatusRuang = () => ({
  status: statusRuang(),
  mulaiPada: waktuAtauKosong(),
  berakhirPada: waktuAtauKosong(),
  jedaSejak: waktuAtauKosong(),
});
const isiGalat = () => ({ kode: z.enum(KODE_GALAT), pesan: z.string().max(PANJANG_TEKS.pesanGalat) });

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
  p: z.array(z.tuple([id(), koordinatPx(), koordinatPx(), arah(), z.boolean()])).max(BATAS_PESAN.duniaMaks),
  n: angkaBulat(0, BATAS_PESAN.duniaMaks),
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
]);

// ---------------------------------------------------------------------------------------------
// Server → layar kelas (Architecture 6.4)

const kelasLobi = /* @__PURE__ */ pesan("lobi", () => ({
  pemain: z
    .array(z.object({ id: id(), nama: nama(), avatar: avatar(), warnaTas: warnaTas(), terhubung: z.boolean() }).strict())
    .max(BATAS_PESAN.pemainMaks),
}));
const kelasDunia = /* @__PURE__ */ pesan("dunia_kelas", () => ({
  w: waktu(),
  p: z.array(z.tuple([id(), koordinatPx(), koordinatPx(), z.boolean()])).max(BATAS_PESAN.pemainMaks), // [id, x, y, terhubung]
}));
const kelasPapan = /* @__PURE__ */ pesan("papan", () => ({
  pemain: z
    .array(
      z.object({ id: id(), nama: nama(), avatar: avatar(), warnaTas: warnaTas(), skor: skor(), peringkat: peringkat() }).strict(),
    )
    .max(BATAS_PESAN.pemainMaks),
}));
const kelasKemajuan = /* @__PURE__ */ pesan("kemajuan", () => ({
  terjawab: angkaBulat(0, 1_000_000),
  kemungkinan: angkaBulat(0, 1_000_000),
}));
const kelasDataPembahasan = /* @__PURE__ */ pesan("data_pembahasan", () => ({
  kejadianId: id(),
  judul: teks(PANJANG_TEKS.judul),
  situasi: teks(PANJANG_TEKS.situasi),
  pertanyaan1: teks(PANJANG_TEKS.pertanyaan),
  opsi1: z
    .array(
      z.object({ id: id(), teks: teks(PANJANG_TEKS.opsi1), benar: z.boolean(), jumlah: angkaBulat(0, BATAS_PESAN.pemainMaks) }).strict(),
    )
    .length(4),
  pertanyaan2: teks(PANJANG_TEKS.pertanyaan),
  opsi2: z
    .array(
      z
        .object({
          id: id(),
          teks: teks(PANJANG_TEKS.opsi2),
          tingkat: tingkat(),
          terjadi: teks(PANJANG_TEKS.terjadi),
          jumlah: angkaBulat(0, BATAS_PESAN.pemainMaks),
        })
        .strict(),
    )
    .length(3),
  kartu: kartu(),
}));
const kelasStatusRuang = /* @__PURE__ */ pesan("status_ruang", isiStatusRuang);
const kelasGalat = /* @__PURE__ */ pesan("galat", isiGalat);

export const skemaServerKelas = /* @__PURE__ */ z.discriminatedUnion("t", [
  kelasLobi,
  kelasDunia,
  kelasPapan,
  kelasKemajuan,
  kelasDataPembahasan,
  kelasStatusRuang,
  kelasGalat,
]);

export type PesanPemain = z.infer<typeof skemaPemain>;
export type PesanKelas = z.infer<typeof skemaKelas>;
export type PesanServerPemain = z.infer<typeof skemaServerPemain>;
export type PesanServerKelas = z.infer<typeof skemaServerKelas>;
