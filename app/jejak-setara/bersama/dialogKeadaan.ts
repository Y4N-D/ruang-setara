// Keadaan dialog kejadian (spesifikasi JS-08, P-38 sampai P-49): tampilan aktif, pilihan, penguncian, masa tunggu
// 600 ms, dan mode ringkas. Modul murni tanpa React dan DOM, sehingga diuji di Node dan dipakai ulang pratinjau
// konsol JS-12. Komponen DialogKejadian hanya membaca keadaan ini dan meneruskan aksi pemain.
import type { PesanServerPemain } from "../inti/protokol";

/** Mode ringkas dipakai bila tinggi area dialog kurang dari 560 px CSS (P-39; Design System 3.5). */
export const BATAS_DIALOG_RINGKAS_PX = 560;
/** Di setiap tampilan baru, tombol dialog mengabaikan tekanan selama 600 ms (P-48; Design System 11). */
export const MASA_TUNGGU_DIALOG_MS = 600;
/** Tinggi bilah atas yang tetap tampil di atas dialog (Design System 3.3). */
export const TINGGI_BILAH_PX = 28;

type Pesan<T extends PesanServerPemain["t"]> = Extract<PesanServerPemain, { t: T }>;
export type Hasil1 = Omit<Pesan<"hasil_1">, "v" | "t">;
export type Hasil2 = Omit<Pesan<"hasil_2">, "v" | "t">;
export interface OpsiTampil {
  id: string;
  teks: string;
}

/**
 * Tampilan dialog. Mode penuh: langkah1, umpan, langkah2, kartu. Mode ringkas membagi Langkah 1 menjadi situasi1
 * dan pilihan1, dan Langkah 2 menjadi pilihan2 dan situasi2 (P-42, P-45).
 */
export type Tampilan = "langkah1" | "situasi1" | "pilihan1" | "umpan" | "langkah2" | "pilihan2" | "situasi2" | "kartu";
export type AksiKaki = "tutup" | "kunci" | "lihat" | "situasi" | "lanjut2" | "jelajah";

export interface KeadaanDialog {
  kejadianId: string;
  judul: string;
  situasi: string;
  /** Nomor zona 1–8 untuk ikon zona di kepala dialog (P-40). */
  zona: number;
  pertanyaan1: string;
  opsi1: OpsiTampil[];
  hasil1: Hasil1 | null;
  hasil2: Hasil2 | null;
  /** Id pilihan milik pemain yang sedang dipilih atau sudah dikunci. */
  pilihan1: string | null;
  pilihan2: string | null;
  tampilan: Tampilan;
  ringkas: boolean;
  /** Kunci jawaban sudah dikirim dan hasilnya belum tiba: semua tombol nonaktif (P-43). */
  mengunci: boolean;
  /** Jam lokal saat tampilan terakhir berganti, untuk masa tunggu (P-48). */
  sejak: number;
  /** Dibuka lagi di Langkah 2 (KT-13): ulangan hasil_1 langsung membuka Langkah 2. */
  bukaLangkah2: boolean;
}

export function modeRingkas(tinggiAreaPx: number): boolean {
  return tinggiAreaPx < BATAS_DIALOG_RINGKAS_PX;
}

const tampilanLangkah2 = (ringkas: boolean): Tampilan => (ringkas ? "pilihan2" : "langkah2");

/** Dialog baru dari `kejadian_terbuka` (P-28, P-41, P-42). */
export function bukaDialog(p: Pesan<"kejadian_terbuka">, zona: number, ringkas: boolean, sekarang: number): KeadaanDialog {
  const l2 = p.langkah === 2;
  return {
    kejadianId: p.kejadianId,
    judul: p.judul,
    situasi: p.situasi,
    zona,
    pertanyaan1: p.pertanyaan1,
    opsi1: p.opsi1.map((o) => ({ id: o.id, teks: o.teks })),
    hasil1: null,
    hasil2: null,
    pilihan1: null,
    pilihan2: null,
    tampilan: l2 ? tampilanLangkah2(ringkas) : ringkas ? "situasi1" : "langkah1",
    ringkas,
    mengunci: l2, // Langkah 2 menunggu ulangan hasil_1
    sejak: sekarang,
    bukaLangkah2: l2,
  };
}

/** Ukuran layar berubah: tampilan dipetakan ke mode baru tanpa menghapus pilihan. */
export function aturRingkas(d: KeadaanDialog, ringkas: boolean): KeadaanDialog {
  if (d.ringkas === ringkas) return d;
  const peta: Record<Tampilan, Tampilan> = ringkas
    ? { langkah1: d.pilihan1 ? "pilihan1" : "situasi1", situasi1: "situasi1", pilihan1: "pilihan1", umpan: "umpan", langkah2: "pilihan2", pilihan2: "pilihan2", situasi2: "situasi2", kartu: "kartu" }
    : { langkah1: "langkah1", situasi1: "langkah1", pilihan1: "langkah1", umpan: "umpan", langkah2: "langkah2", pilihan2: "langkah2", situasi2: "langkah2", kartu: "kartu" };
  return { ...d, ringkas, tampilan: peta[d.tampilan] };
}

/** Langkah yang pilihannya tampil dan bisa dipilih di tampilan ini. */
export function langkahPilihan(d: KeadaanDialog): 1 | 2 | null {
  if (d.tampilan === "langkah1" || d.tampilan === "pilihan1") return 1;
  if ((d.tampilan === "langkah2" || d.tampilan === "pilihan2") && d.hasil1) return 2;
  return null;
}

/** Langkah untuk chip "Langkah n dari 2" (P-40). */
export function langkahChip(d: KeadaanDialog): 1 | 2 {
  return d.tampilan === "langkah1" || d.tampilan === "situasi1" || d.tampilan === "pilihan1" || d.tampilan === "umpan" ? 1 : 2;
}

export function opsiLangkah(d: KeadaanDialog, langkah: 1 | 2): OpsiTampil[] {
  return langkah === 1 ? d.opsi1 : (d.hasil1?.opsi2 ?? []);
}

export function bolehTekan(d: KeadaanDialog, sekarang: number): boolean {
  return !d.mengunci && sekarang - d.sejak >= MASA_TUNGGU_DIALOG_MS;
}

/** Memilih pilihan dengan id (ketuk, klik); bisa diganti sampai dikunci (P-43). */
export function pilih(d: KeadaanDialog, id: string, sekarang: number): KeadaanDialog {
  const l = langkahPilihan(d);
  if (l === null || !bolehTekan(d, sekarang) || !opsiLangkah(d, l).some((o) => o.id === id)) return d;
  return l === 1 ? { ...d, pilihan1: id } : { ...d, pilihan2: id };
}

/** Tombol angka 1–4 (Langkah 1) atau 1–3 (Langkah 2) memilih pilihan ke-n menurut urutan tampil (P-43, P-49). */
export function pilihNomor(d: KeadaanDialog, n: number, sekarang: number): KeadaanDialog {
  const l = langkahPilihan(d);
  if (l === null) return d;
  const opsi = opsiLangkah(d, l)[n - 1];
  return opsi ? pilih(d, opsi.id, sekarang) : d;
}

export interface PesanKunci {
  t: "kunci_1" | "kunci_2";
  kejadianId: string;
  opsiId: string;
}

/** "Kunci jawaban" atau Enter: mengirim kunci bila ada pilihan; semua tombol nonaktif sampai hasil tiba (P-43). */
export function kunci(d: KeadaanDialog, sekarang: number): { d: KeadaanDialog; pesan: PesanKunci | null } {
  const l = langkahPilihan(d);
  const pilihan = l === 1 ? d.pilihan1 : l === 2 ? d.pilihan2 : null;
  if (l === null || pilihan === null || !bolehTekan(d, sekarang)) return { d, pesan: null };
  return { d: { ...d, mengunci: true }, pesan: { t: l === 1 ? "kunci_1" : "kunci_2", kejadianId: d.kejadianId, opsiId: pilihan } };
}

/** Pindah tampilan lewat tombol kaki: Lihat pilihan, Situasi, dan Lanjut ke Langkah 2 (P-42, P-44, P-45). */
export function pindah(d: KeadaanDialog, aksi: "lihat" | "situasi" | "lanjut2", sekarang: number): KeadaanDialog {
  if (!bolehTekan(d, sekarang)) return d;
  let ke: Tampilan | null = null;
  if (aksi === "lihat") ke = d.tampilan === "situasi1" ? "pilihan1" : d.tampilan === "situasi2" ? "pilihan2" : null;
  else if (aksi === "situasi") ke = d.tampilan === "pilihan1" ? "situasi1" : d.tampilan === "pilihan2" ? "situasi2" : null;
  else if (d.tampilan === "umpan") ke = tampilanLangkah2(d.ringkas);
  return ke ? { ...d, tampilan: ke, sejak: sekarang } : d;
}

/** `hasil_1`: umpan balik, atau langsung Langkah 2 bila dialog dibuka lagi sesudah Langkah 1 dikunci (P-44; KT-13). */
export function terimaHasil1(d: KeadaanDialog, h: Hasil1, sekarang: number): KeadaanDialog {
  const pilihan1 = d.pilihan1 ?? (h.benar ? h.opsiBenar : null);
  const tampilan = d.bukaLangkah2 ? tampilanLangkah2(d.ringkas) : "umpan";
  return { ...d, hasil1: h, pilihan1, tampilan, mengunci: false, sejak: sekarang };
}

/** `hasil_2`: kartu dampak (P-46). */
export function terimaHasil2(d: KeadaanDialog, h: Hasil2, sekarang: number): KeadaanDialog {
  return { ...d, hasil2: h, tampilan: "kartu", mengunci: false, sejak: sekarang };
}

export interface TombolKaki {
  aksi: AksiKaki;
  utama: boolean;
  /** Kunci jawaban tanpa pilihan: tampak nonaktif (`mist`, aria-disabled). */
  aktif: boolean;
}

/** Tombol kaki setiap tampilan, dari kiri ke kanan (P-41, P-42, P-44 sampai P-46). */
export function tombolKaki(d: KeadaanDialog): TombolKaki[] {
  const tutup: TombolKaki = { aksi: "tutup", utama: false, aktif: true };
  const kunciTombol = (ada: boolean): TombolKaki => ({ aksi: "kunci", utama: true, aktif: ada });
  switch (d.tampilan) {
    case "langkah1":
      return [tutup, kunciTombol(d.pilihan1 !== null)];
    case "situasi1":
    case "situasi2":
      return [tutup, { aksi: "lihat", utama: true, aktif: true }];
    case "pilihan1":
      return [tutup, { aksi: "situasi", utama: false, aktif: true }, kunciTombol(d.pilihan1 !== null)];
    case "umpan":
      return [tutup, { aksi: "lanjut2", utama: true, aktif: true }];
    case "langkah2":
      return [tutup, kunciTombol(d.pilihan2 !== null)];
    case "pilihan2":
      return [tutup, { aksi: "situasi", utama: false, aktif: true }, kunciTombol(d.pilihan2 !== null)];
    case "kartu":
      return [{ aksi: "jelajah", utama: true, aktif: true }];
  }
}

/** Sasaran fokus saat tampilan muncul (P-49): pilihan pertama, atau tombol utama. */
export function fokusAwal(d: KeadaanDialog): "pilihan" | AksiKaki {
  if (langkahPilihan(d) !== null) return "pilihan";
  if (d.tampilan === "situasi1" || d.tampilan === "situasi2") return "lihat";
  if (d.tampilan === "umpan") return "lanjut2";
  if (d.tampilan === "kartu") return "jelajah";
  return "tutup";
}

/** Pilihan di tampilan umpan balik: semua pilihan (mode penuh), atau pilihan pemain dan pilihan benar saja (P-44). */
export function opsiUmpanBalik(d: KeadaanDialog): (OpsiTampil & { label: "tepat" | "pilihanmu" | null })[] {
  const h = d.hasil1;
  if (!h) return [];
  const semua = d.opsi1.map((o) => ({ ...o, label: o.id === h.opsiBenar ? ("tepat" as const) : o.id === d.pilihan1 ? ("pilihanmu" as const) : null }));
  return d.ringkas ? semua.filter((o) => o.label !== null) : semua;
}

/** Teks pilihan bertingkat tepat untuk bagian "Pilihan yang tepat" kartu dampak (D-3a). */
export function teksPilihanTepat(d: KeadaanDialog): string[] {
  const h2 = d.hasil2;
  if (!h2 || h2.tingkat === "tepat") return [];
  const opsi2 = d.hasil1?.opsi2 ?? [];
  return h2.opsiTepat.map((id) => opsi2.find((o) => o.id === id)?.teks ?? "").filter((t) => t !== "");
}
