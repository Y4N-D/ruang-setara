// Pesan layar kelas Jejak Setara (Architecture 6.4; spesifikasi JS-10, P-16 sampai P-22). Dipisah dari `protokol.ts`
// agar layar pemain tidak memuat skema yang hanya dipakai server dan konsol (P-35). Sejak JS-14 `PROTOKOL_VERSI` 3:
// `ganti_nama`, `ganti_semua_nama`, dan `info_kelas.modeNama` (spesifikasi JS-14, P-58).
import { z } from "zod";
import { POLA_KODE_RUANG } from "./aturan";
import {
  angkaBulat,
  avatar,
  BATAS_PESAN,
  id,
  isiGalat,
  isiStatusRuang,
  kartu,
  koordinatPx,
  modeNama,
  nama,
  PANJANG_TEKS,
  peringkat,
  pesan,
  skor,
  teks,
  tingkat,
  waktu,
  warnaTas,
} from "./protokol";
import { LABEL_KELAS_MAKS } from "./ruang";

/** Isi `papan` paling banyak 10 besar (P-18). */
export const PAPAN_KELAS_MAKS = 10;

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
const kPembahasan = /* @__PURE__ */ pesan("pembahasan", () => ({ kejadianId: id() }));
const kTutupRuang = /* @__PURE__ */ pesan("tutup_ruang", () => ({}));
const kGantiNama = /* @__PURE__ */ pesan("ganti_nama", () => ({ pemainId: id() })); // JS-14 (P-46)
const kGantiSemuaNama = /* @__PURE__ */ pesan("ganti_semua_nama", () => ({})); // JS-14 (P-48)

export const skemaKelas = /* @__PURE__ */ z.discriminatedUnion("t", [
  kHalo,
  kMulai,
  kJeda,
  kLanjut,
  kAkhiri,
  kTambahWaktu,
  kKunciRuang,
  kKeluarkan,
  kPembahasan,
  kTutupRuang,
  kGantiNama,
  kGantiSemuaNama,
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
      z
        .object({
          id: id(),
          nama: nama(),
          avatar: avatar(),
          warnaTas: warnaTas(),
          skor: skor(),
          peringkat: peringkat(),
          selesai: angkaBulat(0, BATAS_PESAN.kejadianMaks),
        })
        .strict(),
    )
    .max(PAPAN_KELAS_MAKS),
  jumlahPemain: angkaBulat(0, BATAS_PESAN.pemainMaks),
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
const kelasInfo = /* @__PURE__ */ pesan("info_kelas", () => ({
  labelKelas: teks(LABEL_KELAS_MAKS),
  kode: z.string().regex(POLA_KODE_RUANG),
  tautan: z.string().url().max(200),
  durasiMenit: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]), // 5 sejak JS-25 (tambahan 1)
  batasPemain: angkaBulat(2, BATAS_PESAN.pemainMaks),
  uji: z.boolean(),
  terkunci: z.boolean(),
  modeNama: modeNama(), // JS-14 (P-57)
  waktuServer: waktu(),
  jumlahKejadian: angkaBulat(0, BATAS_PESAN.kejadianMaks),
  kejadian: z
    .array(z.object({ id: id(), judul: teks(PANJANG_TEKS.judul), zona: angkaBulat(1, 8) }).strict())
    .max(BATAS_PESAN.kejadianMaks),
}));
const kelasStatusRuang = /* @__PURE__ */ pesan("status_ruang", isiStatusRuang);
const kelasGalat = /* @__PURE__ */ pesan("galat", isiGalat);

export const skemaServerKelas = /* @__PURE__ */ z.discriminatedUnion("t", [
  kelasInfo,
  kelasLobi,
  kelasDunia,
  kelasPapan,
  kelasKemajuan,
  kelasDataPembahasan,
  kelasStatusRuang,
  kelasGalat,
]);

export type PesanKelas = z.infer<typeof skemaKelas>;
export type PesanServerKelas = z.infer<typeof skemaServerKelas>;
