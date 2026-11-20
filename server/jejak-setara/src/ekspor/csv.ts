// Rincian jawaban dan ekspor CSV hasil ruang (spesifikasi JS-11, P-24 dan P-26 sampai P-30; Architecture 10.8).
// Murni: menerima baris D1 yang sudah dibaca, mengembalikan objek atau teks berkas.
import { HURUF_PILIHAN, nomorKode, type JawabanRincian } from "../../../../app/jejak-setara/inti/hasil";
import type { IsiKejadian, Tingkat } from "../../../../app/jejak-setara/inti/tipe";
import { TEKS_KONSOL } from "../../../../app/jejak-setara/teks-konsol";
import type { BarisJawabanHasil, BarisVersiHasil } from "../db/ruang";

const T = TEKS_KONSOL.csv;
const TINGKAT_SAH: readonly string[] = ["tepat", "kurang", "berisiko"];
const JAM_WITA_MS = 8 * 3_600_000;

// ---------------------------------------------------------------------------------------------
// Rincian jawaban (P-24), dipakai juga CSV jawaban (P-29)

export interface JawabanRuangRinci extends JawabanRincian {
  pesertaId: string;
  dibukaPada: number;
}

function bacaIsi(v: BarisVersiHasil): IsiKejadian | null {
  try {
    const isi = JSON.parse(v.isi_json) as IsiKejadian;
    return Array.isArray(isi?.langkah1?.opsi) && Array.isArray(isi?.langkah2?.opsi) && typeof isi.judul === "string" ? isi : null;
  } catch {
    return null;
  }
}

function bacaUrutan(json: string): { langkah1: string[]; langkah2: string[] } {
  try {
    const u = JSON.parse(json) as { langkah1?: unknown; langkah2?: unknown };
    const daftar = (x: unknown) => (Array.isArray(x) ? x.filter((y): y is string => typeof y === "string") : []);
    return { langkah1: daftar(u.langkah1), langkah2: daftar(u.langkah2) };
  } catch {
    return { langkah1: [], langkah2: [] };
  }
}

const huruf = (urutan: readonly string[], id: string) => HURUF_PILIHAN[urutan.indexOf(id)] ?? "?";

/**
 * Jawaban yang Langkah 1-nya dikunci, dengan teks dari versi kejadian yang dipakai ruang dan huruf yang dilihat pemain
 * (urutan acak per pemain di `urutan_opsi_json`). Urut menurut nomor kode kejadian; baris tanpa isi versi dilewati.
 */
export function rincianJawaban(jawaban: readonly BarisJawabanHasil[], versi: readonly BarisVersiHasil[]): JawabanRuangRinci[] {
  // Isi setiap versi diurai sekali; urutan acak juga, karena banyak pemain berbagi urutan yang sama (P-35: CPU ekspor).
  const isiVersi = new Map<string, { v: BarisVersiHasil; isi: IsiKejadian; tepat1: string; tepat2: string[] }>();
  for (const v of versi) {
    const isi = bacaIsi(v);
    if (isi)
      isiVersi.set(v.id, {
        v,
        isi,
        tepat1: isi.langkah1.opsi.find((o) => o.benar)?.teks ?? "",
        tepat2: isi.langkah2.opsi.filter((o) => o.tingkat === "tepat").map((o) => o.teks),
      });
  }
  const urutanTerurai = new Map<string, { langkah1: string[]; langkah2: string[] }>();
  const hasil: JawabanRuangRinci[] = [];
  for (const j of jawaban) {
    const x = isiVersi.get(j.kejadian_versi_id);
    if (!x || j.langkah1_opsi === null) continue;
    const { v, isi } = x;
    let urutan = urutanTerurai.get(j.urutan_opsi_json);
    if (!urutan) {
      urutan = bacaUrutan(j.urutan_opsi_json);
      urutanTerurai.set(j.urutan_opsi_json, urutan);
    }
    const pilihan1 = isi.langkah1.opsi.find((o) => o.id === j.langkah1_opsi);
    const pilihan2 = j.langkah2_opsi === null ? undefined : isi.langkah2.opsi.find((o) => o.id === j.langkah2_opsi);
    const dikunci2 = j.langkah2_opsi !== null && j.langkah2_pada !== null && pilihan2 !== undefined;
    const tingkatD1 = j.tingkat !== null && TINGKAT_SAH.includes(j.tingkat) ? (j.tingkat as Tingkat) : null;
    const tingkat2: Tingkat | null = dikunci2 ? (tingkatD1 ?? pilihan2?.tingkat ?? null) : null;
    hasil.push({
      pesertaId: j.peserta_id,
      dibukaPada: j.dibuka_pada,
      kode: v.kode,
      judul: isi.judul,
      versi: v.jenis === "terbit" ? v.nomor : null,
      huruf1: huruf(urutan.langkah1, j.langkah1_opsi),
      pilihan1: pilihan1?.teks ?? "",
      benar1: j.langkah1_benar === 1,
      jawabanTepat1: x.tepat1,
      huruf2: dikunci2 ? huruf(urutan.langkah2, j.langkah2_opsi as string) : null,
      pilihan2: dikunci2 ? (pilihan2?.teks ?? null) : null,
      tingkat2,
      pilihanTepat2: x.tepat2,
      poin: j.poin,
      waktuMenjawabMs: dikunci2 ? Math.max(0, (j.langkah2_pada as number) - j.dibuka_pada) : null,
    });
  }
  return hasil.sort((a, b) => nomorKode(a.kode) - nomorKode(b.kode) || (a.kode < b.kode ? -1 : a.kode > b.kode ? 1 : 0));
}

// ---------------------------------------------------------------------------------------------
// Sel, baris, dan berkas CSV (P-27)

const AWALAN_RUMUS = /^[=+\-@\t\r]/;
const PERLU_KUTIP = /[;"\r\n]/;

/**
 * Sel teks: perlindungan rumus lebih dulu (awalan `=`, `+`, `-`, `@`, tab, atau CR diberi tanda kutip tunggal), lalu
 * tanda kutip ganda bila sel memuat titik koma, tanda kutip ganda, CR, atau LF (RFC 4180).
 */
export function selTeks(nilai: string | null | undefined): string {
  if (nilai === null || nilai === undefined || nilai === "") return "";
  const aman = AWALAN_RUMUS.test(nilai) ? `'${nilai}` : nilai;
  return PERLU_KUTIP.test(aman) ? `"${aman.replace(/"/g, '""')}"` : aman;
}

/** Sel bilangan bulat; kosong bila null. */
export function selBulat(n: number | null | undefined): string {
  return n === null || n === undefined || !Number.isFinite(n) ? "" : String(Math.round(n));
}

/** Sel pecahan satu angka di belakang koma dengan koma desimal, tanpa pemisah ribuan; kosong bila null. */
export function selDesimal(n: number | null | undefined): string {
  return n === null || n === undefined || !Number.isFinite(n) ? "" : (Math.round(n * 10) / 10).toFixed(1).replace(".", ",");
}

const dua = (n: number) => String(n).padStart(2, "0");

/** Tanggal WITA (UTC+8) "YYYY-MM-DD". */
export function tanggalWita(ms: number): string {
  const d = new Date(ms + JAM_WITA_MS);
  return `${d.getUTCFullYear()}-${dua(d.getUTCMonth() + 1)}-${dua(d.getUTCDate())}`;
}

/** Waktu WITA (UTC+8) "YYYY-MM-DD HH:MM:SS"; kosong bila null. */
export function waktuWita(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return "";
  const d = new Date(ms + JAM_WITA_MS);
  return `${d.getUTCFullYear()}-${dua(d.getUTCMonth() + 1)}-${dua(d.getUTCDate())} ${dua(d.getUTCHours())}:${dua(d.getUTCMinutes())}:${dua(d.getUTCSeconds())}`;
}

/** BOM UTF-8, baris judul, lalu baris isi; setiap baris diakhiri CRLF; pemisah titik koma. */
export function susunCsv(judul: readonly string[], baris: readonly (readonly string[])[]): string {
  return "﻿" + [judul.map(selTeks), ...baris].map((b) => b.join(";") + "\r\n").join("");
}

/**
 * Nama berkas (P-30): `jejak-setara_{label}_{tanggal}_{jenis}.csv`. Label dalam huruf kecil; setiap rangkaian karakter
 * selain a–z dan 0–9 menjadi satu tanda minus, tanpa tanda minus di kedua ujung, paling panjang 40 karakter, atau
 * `ruang` bila kosong. Tanggal ruang dibuat dalam WITA.
 */
export function namaBerkasCsv(label: string, dibuatPada: number, jenis: "peserta" | "jawaban"): string {
  const slug =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40)
      .replace(/-+$/, "") || "ruang";
  return `jejak-setara_${slug}_${tanggalWita(dibuatPada)}_${jenis}.csv`;
}

// ---------------------------------------------------------------------------------------------
// CSV peserta (P-28) dan CSV jawaban (P-29)

export interface RuangEkspor {
  labelKelas: string;
  dibuatPada: number;
}

export interface PesertaEkspor {
  id: string;
  nama: string;
  nomorAbsen: number | null;
  dikeluarkan: boolean;
  peringkat: number | null;
  skor: number;
  selesai: number;
  langkah1Dijawab: number;
  langkah1Benar: number;
  tepat: number;
  kurang: number;
  berisiko: number;
  waktuSkorMs: number | null;
  gabungPada: number;
}

const TEKS_TINGKAT: Record<Tingkat, string> = { tepat: T.tingkatTepat, kurang: T.tingkatKurang, berisiko: T.tingkatBerisiko };
const keterangan = (dikeluarkan: boolean) => (dikeluarkan ? T.dikeluarkan : "");

/** Peserta sudah urut menurut P-21 (peringkat, lalu yang dikeluarkan). */
export function csvPeserta(ruang: RuangEkspor, peserta: readonly PesertaEkspor[]): string {
  const judul = [T.kelas, T.tanggal, T.peringkat, T.nama, T.absen, T.skor, T.selesai, T.l1Dijawab, T.l1Benar, T.ketepatan, T.tepat, T.kurang, T.berisiko, T.waktuSkor, T.gabung, T.keterangan];
  const tanggal = tanggalWita(ruang.dibuatPada);
  const baris = peserta.map((p) => [
    selTeks(ruang.labelKelas),
    selTeks(tanggal),
    selBulat(p.dikeluarkan ? null : p.peringkat),
    selTeks(p.nama),
    selBulat(p.nomorAbsen),
    selBulat(p.skor),
    selBulat(p.selesai),
    selBulat(p.langkah1Dijawab),
    selBulat(p.langkah1Benar),
    selDesimal(p.langkah1Dijawab > 0 ? (p.langkah1Benar / p.langkah1Dijawab) * 100 : null),
    selBulat(p.tepat),
    selBulat(p.kurang),
    selBulat(p.berisiko),
    selDesimal(p.skor > 0 && p.waktuSkorMs !== null ? p.waktuSkorMs / 1000 : null),
    selTeks(waktuWita(p.gabungPada)),
    selTeks(keterangan(p.dikeluarkan)),
  ]);
  return susunCsv(judul, baris);
}

/** Jawaban menurut urutan peserta (P-28), lalu nomor kode kejadian. */
export function csvJawaban(ruang: RuangEkspor, peserta: readonly PesertaEkspor[], jawaban: readonly JawabanRuangRinci[]): string {
  const judul = [
    T.kelas,
    T.tanggal,
    T.nama,
    T.absen,
    T.kodeKejadian,
    T.judul,
    T.versi,
    T.hurufL1,
    T.pilihanL1,
    T.benarL1,
    T.hurufL2,
    T.pilihanL2,
    T.tingkatL2,
    T.poin,
    T.dibuka,
    T.waktuMenjawab,
    T.keterangan,
  ];
  const kelas = selTeks(ruang.labelKelas);
  const tanggal = selTeks(tanggalWita(ruang.dibuatPada));
  const perPeserta = new Map<string, JawabanRuangRinci[]>();
  for (const j of jawaban) {
    const daftar = perPeserta.get(j.pesertaId);
    if (daftar) daftar.push(j);
    else perPeserta.set(j.pesertaId, [j]);
  }
  const baris: string[][] = [];
  for (const p of peserta) {
    const nama = selTeks(p.nama);
    const absen = selBulat(p.nomorAbsen);
    const ket = selTeks(keterangan(p.dikeluarkan));
    for (const j of perPeserta.get(p.id) ?? []) {
      baris.push([
        kelas,
        tanggal,
        nama,
        absen,
        selTeks(j.kode),
        selTeks(j.judul),
        j.versi === null ? selTeks(T.versiKerja) : selBulat(j.versi),
        selTeks(j.huruf1),
        selTeks(j.pilihan1),
        selTeks(j.benar1 ? T.ya : T.tidak),
        selTeks(j.huruf2),
        selTeks(j.pilihan2),
        selTeks(j.tingkat2 ? TEKS_TINGKAT[j.tingkat2] : null),
        selBulat(j.poin),
        selTeks(waktuWita(j.dibukaPada)),
        selDesimal(j.waktuMenjawabMs === null ? null : j.waktuMenjawabMs / 1000),
        ket,
      ]);
    }
  }
  return susunCsv(judul, baris);
}
