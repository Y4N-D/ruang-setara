// Pemanggil API konsol (spesifikasi JS-04). Setiap jawaban diperiksa dengan skema `inti/akun.ts`. Permintaan yang
// mengubah data membawa `X-Jejak: 1` (P-10); peramban menambahkan `Origin` sendiri. Galat jaringan menjadi `JARINGAN`,
// dan jawaban yang bentuknya tidak dikenal menjadi `UMUM` (bagian "Teks yang tampil", Galat).
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  KODE_GALAT_AKUN,
  skemaDaftarAkun,
  skemaDasbor,
  skemaGalat,
  skemaJawabanAkun,
  skemaJawabanAkunSaya,
  skemaJawabanSaya,
  type IsiAkunBaru,
  type IsiGantiSandi,
  type IsiUbahAkun,
  type KodeGalatAkun,
} from "../inti/akun";
import {
  KODE_GALAT_RUANG,
  skemaDaftarRuang,
  skemaDetailRuang,
  skemaJawabanRuangBaru,
  skemaPilihanRuang,
  skemaTiket,
  type AksiKelola,
  type IsiRuangBaru,
  type KodeGalatRuang,
} from "../inti/ruang";
import {
  skemaDaftarKejadian,
  skemaDaftarPaket,
  skemaDaftarRujukan,
  skemaDetailKejadian,
  skemaDetailPaket,
  skemaHasilAksi,
  skemaHasilRujukan,
  skemaHasilSimpan,
  skemaPilihanBank,
  skemaVersiKejadian,
  type AksiKejadian,
} from "../inti/bank";
import { TEKS_KONSOL } from "../teks-konsol";

export interface GalatApi {
  ok: false;
  kode: KodeGalatAkun | KodeGalatRuang;
  pesan: string;
  status: number;
  /** Isi jawaban galat apa adanya, misalnya ruang yang masih aktif pada RUANG_MASIH_ADA (JS-10, P-4). */
  isi?: unknown;
}
export type HasilApi<T> = { ok: true; data: T } | GalatApi;

const kodeDikenal = (kode: string): kode is KodeGalatAkun => (KODE_GALAT_AKUN as readonly string[]).includes(kode);
const kodeRuang = (kode: string): kode is KodeGalatRuang => (KODE_GALAT_RUANG as readonly string[]).includes(kode);

export function galatDari(kode: KodeGalatAkun | KodeGalatRuang, status = 0, isi?: unknown): GalatApi {
  const pesan = kodeRuang(kode) ? TEKS_KONSOL.galatRuang[kode] : TEKS_KONSOL.galat[kode];
  return { ok: false, kode, pesan, status, isi };
}

async function panggil<T>(metode: "GET" | "POST" | "PATCH" | "PUT" | "DELETE", jalur: string, isi: unknown, skema: z.ZodType<T>): Promise<HasilApi<T>> {
  const tajuk: Record<string, string> = { Accept: "application/json" };
  if (metode !== "GET") tajuk["X-Jejak"] = "1";
  if (isi !== undefined) tajuk["Content-Type"] = "application/json";
  let jawaban: Response;
  try {
    jawaban = await fetch(jalur, {
      method: metode,
      headers: tajuk,
      body: isi === undefined ? undefined : JSON.stringify(isi),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    return galatDari("JARINGAN");
  }
  let json: unknown;
  try {
    json = await jawaban.json();
  } catch {
    return galatDari(jawaban.status === 0 ? "JARINGAN" : "UMUM", jawaban.status);
  }
  if (!jawaban.ok) {
    const galat = skemaGalat.safeParse(json);
    const mentah = galat.success ? galat.data.galat.kode : "";
    const kode = kodeDikenal(mentah) || kodeRuang(mentah) ? mentah : "UMUM";
    return galatDari(kode, jawaban.status, json);
  }
  const hasil = skema.safeParse(json);
  return hasil.success ? { ok: true, data: hasil.data } : galatDari("UMUM", jawaban.status);
}

const skemaKeluar = z.object({ ok: z.literal(true) });

export interface IsiRujukanApi {
  teks: string;
  sumber: string;
  catatan: string;
  kodeSehari: string | null;
}
export interface IsiPaketApi {
  nama: string;
  deskripsi: string;
  aktif: boolean;
  kejadian: string[];
}
const skemaOk = z.object({ ok: z.literal(true) });
const skemaIdPaket = z.object({ id: z.string() });

/** Temuan validasi dari jawaban galat `TEMUAN` (JS-12, P-8). */
export function temuanDari(g: GalatApi): { kode: string; tingkat: "galat" | "peringatan"; letak: string; pesan: string }[] {
  const t = (g.isi as { temuan?: unknown } | undefined)?.temuan;
  return Array.isArray(t) ? (t as { kode: string; tingkat: "galat" | "peringatan"; letak: string; pesan: string }[]) : [];
}

export const api = {
  saya: () => panggil("GET", "/api/saya", undefined, skemaJawabanSaya),
  masuk: (email: string, sandi: string) => panggil("POST", "/api/masuk", { email, sandi }, skemaJawabanAkunSaya),
  keluar: () => panggil("POST", "/api/keluar", undefined, skemaKeluar),
  gantiSandi: (isi: IsiGantiSandi) => panggil("POST", "/api/sandi", isi, skemaJawabanAkunSaya),
  dasbor: () => panggil("GET", "/api/dasbor", undefined, skemaDasbor),
  daftarAkun: () => panggil("GET", "/api/akun", undefined, skemaDaftarAkun),
  buatAkun: (isi: IsiAkunBaru) => panggil("POST", "/api/akun", isi, skemaJawabanAkun),
  ubahAkun: (id: string, isi: IsiUbahAkun) => panggil("PATCH", `/api/akun/${encodeURIComponent(id)}`, isi, skemaJawabanAkun),
  // JS-10 (P-2 sampai P-12)
  pilihanRuang: () => panggil("GET", "/api/ruang/pilihan", undefined, skemaPilihanRuang),
  daftarRuang: () => panggil("GET", "/api/ruang", undefined, skemaDaftarRuang),
  buatRuang: (isi: IsiRuangBaru) => panggil("POST", "/api/ruang", isi, skemaJawabanRuangBaru),
  detailRuang: (id: string) => panggil("GET", `/api/ruang/${encodeURIComponent(id)}`, undefined, skemaDetailRuang),
  kelolaRuang: (id: string, aksi: AksiKelola, pemainId?: string) => panggil("POST", `/api/ruang/${encodeURIComponent(id)}/kelola`, { aksi, pemainId }, skemaKeluar),
  tiketRuang: (id: string) => panggil("POST", `/api/ruang/${encodeURIComponent(id)}/tiket`, {}, skemaTiket),
  // JS-12 (P-24): bank kejadian, pustaka rujukan, dan paket.
  daftarKejadian: () => panggil("GET", "/api/kejadian", undefined, skemaDaftarKejadian),
  pilihanBank: () => panggil("GET", "/api/kejadian/pilihan", undefined, skemaPilihanBank),
  detailKejadian: (kode: string) => panggil("GET", `/api/kejadian/${kode}`, undefined, skemaDetailKejadian),
  versiKejadian: (kode: string, nomor: number) => panggil("GET", `/api/kejadian/${kode}/versi/${nomor}`, undefined, skemaVersiKejadian),
  buatKejadian: (isi: unknown) => panggil("POST", "/api/kejadian", { isi }, skemaHasilSimpan),
  simpanKejadian: (kode: string, isi: unknown, diubahPada: number) => panggil("PUT", `/api/kejadian/${kode}/kerja`, { isi, diubahPada }, skemaHasilSimpan),
  aksiKejadian: (kode: string, aksi: AksiKejadian, catatan?: string) =>
    panggil("POST", `/api/kejadian/${kode}/aksi`, catatan === undefined ? { aksi } : { aksi, catatan }, skemaHasilAksi),
  daftarRujukan: () => panggil("GET", "/api/rujukan", undefined, skemaDaftarRujukan),
  tambahRujukan: (isi: IsiRujukanApi) => panggil("POST", "/api/rujukan", isi, skemaHasilRujukan),
  ubahRujukan: (id: string, isi: IsiRujukanApi) => panggil("PUT", `/api/rujukan/${id}`, isi, skemaHasilRujukan),
  verifikasiRujukan: (id: string, terverifikasi: boolean) => panggil("POST", `/api/rujukan/${id}/verifikasi`, { terverifikasi }, skemaHasilRujukan),
  hapusRujukan: (id: string) => panggil("DELETE", `/api/rujukan/${id}`, undefined, skemaOk),
  daftarPaket: () => panggil("GET", "/api/paket", undefined, skemaDaftarPaket),
  detailPaket: (id: string) => panggil("GET", `/api/paket/${id}`, undefined, skemaDetailPaket),
  simpanPaket: (id: string | null, isi: IsiPaketApi) => (id ? panggil("PUT", `/api/paket/${id}`, isi, skemaIdPaket) : panggil("POST", "/api/paket", isi, skemaIdPaket)),
};

export type Muatan<T> = { jenis: "memuat" } | { jenis: "gagal" } | { jenis: "ada"; data: T };

/**
 * Data halaman (dasbor dan daftar akun): "memuat", "gagal", atau "ada". `muatUlang` menampilkan "Memuat…" lagi (tombol
 * "Coba lagi"); `segarkan` membaca ulang sambil tetap menampilkan data lama, agar tombol pembuka dialog tidak hilang.
 * Galat sesi diteruskan ke `galatSesi` (P-48).
 */
export function useMuat<T>(ambil: () => Promise<HasilApi<T>>, galatSesi: (galat: GalatApi) => boolean) {
  const [muatan, setMuatan] = useState<Muatan<T>>({ jenis: "memuat" });
  const [putaran, setPutaran] = useState(0);
  useEffect(() => {
    let aktif = true;
    ambil().then((hasil) => {
      if (!aktif) return;
      if (hasil.ok) setMuatan({ jenis: "ada", data: hasil.data });
      else if (!galatSesi(hasil)) setMuatan({ jenis: "gagal" });
    });
    return () => {
      aktif = false;
    };
  }, [ambil, galatSesi, putaran]);
  return {
    muatan,
    muatUlang: () => {
      setMuatan({ jenis: "memuat" });
      setPutaran((p) => p + 1);
    },
    segarkan: () => setPutaran((p) => p + 1),
  };
}
