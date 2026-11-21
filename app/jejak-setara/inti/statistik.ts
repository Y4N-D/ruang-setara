// Statistik per kejadian lintas ruang (spesifikasi JS-13, P-5 sampai P-14 dan P-18): skema jawaban API, saringan,
// penyusun murni dari baris agregat, median dari hitungan per detik, kategori indeks kesulitan, dan urutan tabel.
// Murni: tanpa DOM, React, jam, atau API Workers; dipakai server, konsol, dan uji.
import { z } from "zod";
import { persen, WAKTU_MAKS } from "./hasil";
import { labelSah, normalkanLabel } from "./ruang";

/** Versi dengan jawaban selesai kurang dari ini bertanda "Data sedikit" (P-19, usulan 7a). */
export const STATISTIK_SEDIKIT = 10;
/** Rentang ringkasan dasbor (P-26) dan rentang bawaan halaman Statistik (P-17, D-2a), dalam hari. */
export const HARI_RINGKASAN = 30;
export const HARI_MS = 86_400_000;

const bulat = () => z.number().int().min(0);
const persenNull = z.number().min(0).max(100).nullable();
const tingkat = z.enum(["tepat", "kurang", "berisiko"]);

export const skemaStatistikKejadian = z.object({
  kode: z.string(),
  judul: z.string(),
  zona: z.string(),
  versi: z.number().int().min(1),
  pertanyaan1: z.string(),
  pertanyaan2: z.string(),
  dijawab: bulat(),
  selesai: bulat(),
  benar1: bulat(),
  ketepatan1: persenNull,
  pilihan1: z.array(z.object({ id: z.string(), teks: z.string(), benar: z.boolean(), n: bulat() })).length(4),
  pilihan2: z.array(z.object({ id: z.string(), teks: z.string(), tingkat, n: bulat() })).length(3),
  tingkat: z.object({ tepat: persenNull, kurang: persenNull, berisiko: persenNull }),
  penuh: bulat(),
  indeksKesulitan: z.number().min(0).max(1).nullable(),
  medianDetik: bulat().nullable(),
  keliruTerbanyak: z.string().nullable(),
  petunjuk: persenNull,
});
export type StatistikKejadian = z.infer<typeof skemaStatistikKejadian>;

export const skemaStatistik = z.object({
  cakupan: z.object({ ruang: bulat(), pemain: bulat(), jawaban: bulat() }),
  kejadian: z.array(skemaStatistikKejadian),
  paket: z.array(z.object({ id: z.string(), nama: z.string() })),
});
export type Statistik = z.infer<typeof skemaStatistik>;

// ---------------------------------------------------------------------------------------------
// Saringan (P-11)

export interface SaringanStatistik {
  dari: number | null;
  sampai: number | null;
  label: string | null;
  guru: string | null;
  paket: string | null;
}

const POLA_ID_GURU = /^[A-Za-z0-9_-]{1,64}$/;
const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function bacaWaktu(nilai: string | null): number | null | "salah" {
  if (nilai === null) return null;
  if (!/^\d{1,16}$/.test(nilai)) return "salah";
  const n = Number(nilai);
  return n <= WAKTU_MAKS ? n : "salah";
}

/** Parameter `GET /api/statistik/kejadian`; `guru` hanya dibaca untuk admin. Parameter tidak sah menghasilkan null (400). */
export function bacaSaringanStatistik(p: URLSearchParams, admin: boolean): SaringanStatistik | null {
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
  let paket: string | null = null;
  const paketMentah = p.get("paket");
  if (paketMentah !== null) {
    if (!POLA_UUID.test(paketMentah)) return null;
    paket = paketMentah;
  }
  return { dari, sampai, label, guru, paket };
}

// ---------------------------------------------------------------------------------------------
// Penyusun (P-5 sampai P-10, P-14)

/** Satu baris hasil kueri statistik: jenis 0 = jumlah per versi dan pilihan; jenis 1 = jumlah per versi dan detik. */
export interface BarisAgregat {
  jenis: number;
  v: string;
  o1: string | null;
  o2: string | null;
  detik: number | null;
  n: number;
  np: number | null;
  pt: number | null;
}

const skemaIsiStatistik = z.object({
  judul: z.string(),
  zona: z.string(),
  langkah1: z.object({ pertanyaan: z.string(), opsi: z.array(z.object({ id: z.string(), teks: z.string(), benar: z.boolean() })).length(4) }),
  langkah2: z.object({ pertanyaan: z.string(), opsi: z.array(z.object({ id: z.string(), teks: z.string(), tingkat })).length(3) }),
});

/** Isi versi terbit dari D1 (`kejadian_versi`), dengan `isi_json` yang belum diurai. */
export interface VersiStatistik {
  id: string;
  kode: string;
  nomor: number;
  isi_json: string;
}

/** Nomor urut kode kejadian (`K-13` → 13); kode lain di akhir. */
export function nomorKode(kode: string): number {
  const m = /^K-(\d{1,4})$/.exec(kode);
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

/** Median dari hitungan per detik [detik, jumlah] (P-6); jumlah genap: rata-rata dua nilai tengah, dibulatkan. */
export function medianDetik(hitungan: readonly (readonly [number, number])[]): number | null {
  const urut = hitungan.filter(([, n]) => n > 0).sort((a, b) => a[0] - b[0]);
  const total = urut.reduce((s, [, n]) => s + n, 0);
  if (total === 0) return null;
  const ke = (k: number) => {
    let lewat = 0;
    for (const [d, n] of urut) {
      if (k < lewat + n) return d;
      lewat += n;
    }
    return urut[urut.length - 1][0];
  };
  return Math.round((ke(Math.floor((total - 1) / 2)) + ke(Math.floor(total / 2))) / 2);
}

/** Kategori dari indeks yang sudah dibulatkan dua angka (P-9). */
export function kategoriKesulitan(indeks: number): "sulit" | "sedang" | "mudah" {
  return indeks < 0.3 ? "sulit" : indeks <= 0.7 ? "sedang" : "mudah";
}

interface Kumpulan {
  versi: VersiStatistik;
  isi: z.infer<typeof skemaIsiStatistik>;
  n1: Map<string, number>;
  n2: Map<string, number>;
  dijawab: number;
  selesai: number;
  benar1: number;
  penuh: number;
  np: number;
  pt: number;
  detik: [number, number][];
}

/** Menyusun statistik per versi dari baris agregat dan isi versi; baris tanpa isi versi yang sah dilewati (P-14). */
export function susunStatistik(baris: readonly BarisAgregat[], versi: readonly VersiStatistik[]): StatistikKejadian[] {
  const isi = new Map<string, Kumpulan>();
  for (const v of versi) {
    let data: unknown;
    try {
      data = JSON.parse(v.isi_json);
    } catch {
      continue;
    }
    const hasil = skemaIsiStatistik.safeParse(data);
    if (!hasil.success) continue;
    isi.set(v.id, { versi: v, isi: hasil.data, n1: new Map(), n2: new Map(), dijawab: 0, selesai: 0, benar1: 0, penuh: 0, np: 0, pt: 0, detik: [] });
  }
  for (const b of baris) {
    const x = isi.get(b.v);
    if (!x) continue;
    if (b.jenis === 1) {
      if (b.detik !== null) x.detik.push([Math.max(0, b.detik), b.n]);
      continue;
    }
    const o1 = x.isi.langkah1.opsi.find((o) => o.id === b.o1);
    if (!o1) continue;
    x.dijawab += b.n;
    x.n1.set(o1.id, (x.n1.get(o1.id) ?? 0) + b.n);
    if (o1.benar) x.benar1 += b.n;
    x.np += b.np ?? 0;
    x.pt += b.pt ?? 0;
    const o2 = b.o2 === null ? undefined : x.isi.langkah2.opsi.find((o) => o.id === b.o2);
    if (!o2) continue;
    x.selesai += b.n;
    x.n2.set(o2.id, (x.n2.get(o2.id) ?? 0) + b.n);
    if (o1.benar && o2.tingkat === "tepat") x.penuh += b.n;
  }
  const daftar: StatistikKejadian[] = [];
  for (const x of isi.values()) {
    if (x.dijawab === 0) continue;
    const pilihan1 = x.isi.langkah1.opsi.map((o) => ({ id: o.id, teks: o.teks, benar: o.benar, n: x.n1.get(o.id) ?? 0 }));
    const pilihan2 = x.isi.langkah2.opsi.map((o) => ({ id: o.id, teks: o.teks, tingkat: o.tingkat, n: x.n2.get(o.id) ?? 0 }));
    const perTingkat = (t: string) => pilihan2.filter((o) => o.tingkat === t).reduce((s, o) => s + o.n, 0);
    let keliru: { id: string; n: number } | null = null;
    for (const o of pilihan1) if (!o.benar && o.n > 0 && (keliru === null || o.n > keliru.n)) keliru = { id: o.id, n: o.n };
    daftar.push({
      kode: x.versi.kode,
      judul: x.isi.judul,
      zona: x.isi.zona,
      versi: x.versi.nomor,
      pertanyaan1: x.isi.langkah1.pertanyaan,
      pertanyaan2: x.isi.langkah2.pertanyaan,
      dijawab: x.dijawab,
      selesai: x.selesai,
      benar1: x.benar1,
      ketepatan1: persen(x.benar1, x.dijawab),
      pilihan1,
      pilihan2,
      tingkat: { tepat: persen(perTingkat("tepat"), x.selesai), kurang: persen(perTingkat("kurang"), x.selesai), berisiko: persen(perTingkat("berisiko"), x.selesai) },
      penuh: x.penuh,
      indeksKesulitan: x.selesai > 0 ? Math.round((x.penuh / x.selesai) * 100) / 100 : null,
      medianDetik: x.selesai > 0 ? medianDetik(x.detik) : null,
      keliruTerbanyak: keliru?.id ?? null,
      petunjuk: persen(x.pt, x.np),
    });
  }
  return urutStatistik(daftar, "kode");
}

// ---------------------------------------------------------------------------------------------
// Urutan tabel (P-18) dan tanggal bawaan (P-17)

export type UrutanStatistik = "kode" | "sulit" | "ketepatan" | "dijawab";

export function urutStatistik(daftar: readonly StatistikKejadian[], urutan: UrutanStatistik): StatistikKejadian[] {
  const kode = (a: StatistikKejadian, b: StatistikKejadian) => nomorKode(a.kode) - nomorKode(b.kode) || (a.kode < b.kode ? -1 : a.kode > b.kode ? 1 : 0) || b.versi - a.versi;
  const nilai = (x: number | null) => (x === null ? Number.POSITIVE_INFINITY : x);
  return [...daftar].sort((a, b) => {
    if (urutan === "sulit") return nilai(a.indeksKesulitan) - nilai(b.indeksKesulitan) || kode(a, b);
    if (urutan === "ketepatan") return nilai(a.ketepatan1) - nilai(b.ketepatan1) || kode(a, b);
    if (urutan === "dijawab") return b.dijawab - a.dijawab || kode(a, b);
    return kode(a, b);
  });
}

/** Tanggal `YYYY-MM-DD` sejumlah hari sebelum tanggal kalender yang diberikan (bulan 0–11), tanpa zona waktu. */
export function tanggalMundur(tahun: number, bulan: number, tanggal: number, hari: number): string {
  const d = new Date(Date.UTC(tahun, bulan, tanggal - hari));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
