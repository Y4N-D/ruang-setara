// Logika ruang Jejak Setara (spesifikasi JS-03, bagian D sampai H; Architecture 7 dan JA-11).
// Murni: tanpa API Workers, jam, atau acak langsung. Pembungkus (RuangJejak.ts) memberi `sekarang`,
// fungsi `acak`, dan id baru, lalu menjalankan Keluaran: pesan, penutupan, penyimpanan, dan kiriman ke D1.
// JS-07: pemain berjalan di halaman lobi (P-45, P-47), kerangka penuh `dunia` (P-48), posisi awal lewat
// `koreksi` (P-49), dan pemeriksaan gerak dengan anggaran jarak (P-52).
// JS-08: kejadian (keterlihatan, periksa, dialog dua langkah, kunci, skor, peringkat, `pribadi`, `selesai`), tanda
// `dialog` di butir `dunia`, dan protokol versi 2 (spesifikasi JS-08, P-10 sampai P-37, P-55, P-56, P-63, P-64).
// JS-11: rekap di `selesai` (P-1 sampai P-3), tanda `dikeluarkan` dan peringkat akhir di baris peserta (P-11 sampai
// P-13), serta tanda menulis ringkasan hasil ke `ruang.ringkasan_json` (P-14).
// JS-09: skill dan kotak bantuan (spesifikasi JS-09, P-11 sampai P-32): `pakai_skill`, kotak dari ruas `gerak`, Lari
// cepat di pemeriksaan gerak, sasaran dan tiba Kompas di putaran, Petunjuk, +1 Kompas, dan `pribadi` berisi skill.
import { HAPUS_PAKSA_MS } from "./pengaman";
import { rondeDimainkan, type RingkasanHasilRuang } from "../../../../app/jejak-setara/inti/hasil";
import { BATAS, hitungPeringkat, kompasTiba, lariBerlaku, SKILL_KOTAK, SKILL_P0 } from "../../../../app/jejak-setara/inti/aturan";
import { koreksi, periksaGerak, posisiSah, STATUS_GERAK } from "../../../../app/jejak-setara/inti/gerak";
import { UKURAN_UBIN } from "../../../../app/jejak-setara/inti/peta";
import { PROTOKOL_VERSI, type KodeGalat, type PesanPemain, type PesanServerPemain } from "../../../../app/jejak-setara/inti/protokol";
import type { PesanKelas, PesanServerKelas } from "../../../../app/jejak-setara/inti/protokol-kelas";
import type { Arah, KejadianRuang, ModeNama, PengaturanRuang, SkillId, StatusRuang, TitikPeta, WarnaTas } from "../../../../app/jejak-setara/inti/tipe";
import { bentukNamaSah, kunciNama, rapikanNama, sidikNama } from "../../../../app/jejak-setara/inti/nama";
import { namaTertolak } from "./penyaring-nama";
import { TEKS } from "../../../../app/jejak-setara/teks";
import {
  barisJawabanD1,
  hitungSkor,
  JEDA_PRIBADI_MS,
  jawabanBaru,
  kunciLangkah1,
  kunciLangkah2,
  pesanHasil1,
  pesanHasil2,
  pesanPetunjuk,
  pesanTerbuka,
  pesanTerlihat,
  titikBaruTerlihat,
  titikDalamJangkauan,
  type BarisJawabanD1,
  type JawabanRuang,
  type SkorPemain,
} from "./kejadian-ruang";
import { NAMA_SAMARAN } from "./nama-samaran";
import { hitungRingkasanHasil, susunRekap } from "./rekap-ruang";
import {
  akhiriKompas,
  ambilKotak,
  bolehPakai,
  isiPribadiSkill,
  keJamServer,
  kompasAktif,
  pakai,
  pilihCoretan,
  pilihSasaran,
  skillBaru,
  skillDariJson,
  skillKeJson,
  tambahKompas,
  type KotakPeta,
  type SkillPemain,
} from "./skill-ruang";

/** Versi amplop semua pesan keluar (P-64: dibuat dengan PROTOKOL_VERSI, bukan angka tetap). */
const V = PROTOKOL_VERSI;

/** Kode penutupan sambungan (spesifikasi JS-03, bagian "Protokol"). */
export const KODE_TUTUP = {
  pelanggaran: 1008,
  ditutup: 4000,
  diganti: 4001,
  tanpaHalo: 4002,
  ditolak: 4003,
  dikeluarkan: 4004,
  versi: 4005,
} as const;

const JAM = 3_600_000;
export const WAKTU = {
  hitungMundurMs: 3000,
  tutupTanpaSambunganMs: 3 * JAM,
  tutupSejakDibuatMs: 6 * JAM,
  hapusSesudahTutupMs: 24 * JAM,
  lepasTanpaIdentitasMs: 5 * 60_000,
} as const;

/** Urutan warna tas bila jumlah pemakaiannya seri (P-23). */
export const URUTAN_WARNA_TAS: readonly WarnaTas[] = ["sun", "mango", "coral", "rose", "berry", "teal", "leaf", "sky-d"];
export const AVATAR_TERSEDIA: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7];
/** Setengah kotak 480 × 270 piksel logis di sekitar pemain (P-43). */
const SETENGAH_KOTAK = { x: 240, y: 135 } as const;
/**
 * Kiriman `dunia` di lobi dan hitung mundur (JS-07): jarak antarkiriman dan jarak antar-kerangka penuh. JS-15 (P-24,
 * D-5 a): jarak naik dari 100 ke 300 ms dan kerangka penuh dari 1 ke 3 detik, agar lobi ≤ 3 MB per pemain per 15 menit;
 * pemain yang berhenti tetap dikirim lebih cepat, paling cepat 100 ms sesudah kiriman terakhir.
 */
export const DUNIA_LOBI = { jedaMs: 300, jedaBerhentiMs: 100, kerangkaPenuhMs: 3000 } as const;
/** Di status `main`, kerangka penuh dikirim setiap putaran ke-10 (JS-07, P-48). */
export const KERANGKA_PENUH_SETIAP = 10;
/** Status ruang yang menampilkan dunia di layar pemain (JS-07): posisi awal dan kerangka penuh dikirim. */
const STATUS_DUNIA: readonly StatusRuang[] = ["lobi", "hitung_mundur", "main", "jeda"];

export interface DataRuang {
  ruangId: string;
  kode: string;
  pengaturan: PengaturanRuang;
  benih: number;
  dibuatPada: number;
  /** Label kelas dari konsol (JS-10, P-5); ruang lama tanpa label. */
  labelKelas?: string;
}

export interface PetaRuang {
  versi: number;
  lebar: number;
  tinggi: number;
  tabrakan: Uint8Array;
  /** Grid lobi: tabrakan dengan sel gerbangLobi padat, dipakai di `lobi` dan `hitung_mundur` (JS-07, P-46). */
  tabrakanLobi: Uint8Array;
  titikMuncul: readonly { x: number; y: number }[];
  /** JS-09 (P-16): kotak bantuan peta; peta tanpa kotak (peta uji) tidak punya kotak. */
  kotak?: readonly KotakPeta[];
}

export interface PosisiPemain {
  x: number;
  y: number;
  arah: Arah;
}

export interface PemainRuang {
  id: string;
  hashToken: string;
  urutan: number;
  nama: string | null;
  avatar: number | null;
  warnaTas: WarnaTas | null;
  nomorAbsen: number | null;
  saran: string[];
  /** JS-14 (P-44): banyak penolakan `NAMA_DITOLAK`. */
  tolak?: number;
  terhubung: boolean;
  terputusSejak: number | null;
  posisi: PosisiPemain | null;
  dikeluarkan: boolean;
  gabungPada: number;
}

/** Keadaan gerak yang hanya ada di memori (tidak ditulis ke SQLite). */
interface GerakPemain {
  seqTerakhir: number;
  gerakTerakhirMs: number;
  jalan: boolean;
  berubah: boolean;
  /** Anggaran jarak sesudah laporan diterima terakhir (JS-07, P-52). */
  anggaranPx: number;
}

export interface WaktuRuang {
  mulaiPada: number | null;
  berakhirPada: number | null;
  jedaSejak: number | null;
  jedaMs: number;
  selesaiPada: number | null;
  /** Setiap jeda yang sudah dilanjutkan (JS-08), agar waktu ronde saat skor bertambah bisa dihitung ulang (P-63). */
  riwayatJeda?: { sejak: number; lama: number }[];
}

export interface KeadaanRuang {
  ruang: DataRuang;
  peta: PetaRuang;
  status: StatusRuang;
  waktu: WaktuRuang;
  terkunci: boolean;
  ditutupPada: number | null;
  sambunganTerakhirPutus: number | null;
  pemain: Map<string, PemainRuang>;
  gerak: Map<string, GerakPemain>;
  sambungan: Map<string, string | null>; // sambunganId → pemainId
  sambunganPemain: Map<string, string>; // pemainId → sambunganId
  batasHalo: Map<string, number>; // sambunganId → batas waktu halo (P-15)
  kodeMasukUlang: Map<string, { hash: string; berlakuSampai: number }>; // JS-16b (P-12): pemainId → kode aktif
  salahMasukUlang: Map<string, number>; // JS-16b (P-14): sambunganId → jumlah kode salah
  urutanBerikut: number;
  // Hanya di memori (JS-07): waktu kiriman `dunia` lobi terakhir, kerangka penuh terakhir per pemain,
  // dan nomor putaran `main`.
  duniaLobiTerakhir: number | null;
  kerangkaTerakhir: Map<string, number>;
  putaranKe: number;
  // JS-10 (hanya di memori): alamat untuk layar kelas (dari sambungan kelas terakhir), serta isi `papan` dan
  // `kemajuan` terakhir yang dikirim ke layar kelas, agar hanya dikirim bila berubah (P-18, P-19).
  tautan: string | null;
  papanTerakhir: string | null;
  kemajuanTerakhir: string | null;
  // JS-08. Kejadian ruang menurut urutan paket, jawaban per pemain per kode, skor per pemain (dihitung dari
  // jawaban), titik yang sudah terlihat per pemain, dan dialog yang terbuka (hanya di memori dan lampiran
  // sambungan, P-30). Peringkat disimpan sampai ada skor atau pemain yang berubah.
  kejadian: KejadianRuang[];
  jawaban: Map<string, Map<string, JawabanRuang>>;
  skor: Map<string, SkorPemain>;
  terlihat: Map<string, Set<string>>;
  dialog: Map<string, string>; // pemainId → kode kejadian
  pribadiTerakhir: Map<string, { pada: number; peringkat: number }>;
  peringkat: Map<string, number> | null;
  // JS-09 (P-11, P-14): keadaan skill per pemain (waktu ronde) dan Petunjuk yang dipakai (pemain → kode → id asli).
  skill: Map<string, SkillPemain>;
  petunjuk: Map<string, Map<string, string>>;
  // JS-14: mode nama yang berlaku di ruang (P-41) dan sidik nama yang diganti guru (P-50); keduanya di meta.
  modeNama: ModeNama;
  namaDiblokir: string[];
}

export type KunciMeta = "ruang" | "status" | "waktu" | "terkunci" | "ditutupPada" | "sambunganTerakhirPutus" | "modeNama" | "namaDiblokir";
export type Simpanan =
  | { jenis: "pemain"; pemain: PemainRuang }
  | { jenis: "hapus_pemain"; id: string }
  | { jenis: "meta"; kunci: KunciMeta; nilai: unknown }
  | { jenis: "jawaban"; jawaban: JawabanRuang } // JS-08, P-61
  | { jenis: "terlihat"; pemainId: string; titikId: string; kode: string; pada: number } // JS-08, P-61
  | { jenis: "skill"; pemainId: string; isi: string } // JS-09, P-14
  | { jenis: "petunjuk"; pemainId: string; kode: string; opsi: string } // JS-09, P-14
  | { jenis: "kode_masuk_ulang"; pemainId: string; hash: string; berlakuSampai: number } // JS-16b, P-12
  | { jenis: "hapus_kode_masuk_ulang"; pemainId: string }; // JS-16b, P-12

export interface BarisPeserta {
  id: string;
  ruangId: string;
  nama: string;
  avatar: number;
  warnaTas: WarnaTas;
  nomorAbsen: number | null;
  skor: number;
  waktuSkorMs: number | null;
  langkah1Benar: number;
  jumlahKejadian: number;
  gabungPada: number;
  peringkatAkhir: number | null;
  /** JS-11 (P-10, P-11). Baris antrean dari sebelum JS-11 tidak memuatnya dan dikirim sebagai 0. */
  dikeluarkan?: boolean;
}
export type BarisKiriman =
  | { jenis: "peserta"; isi: BarisPeserta }
  | { jenis: "ruang"; isi: { ruangId: string; status: StatusRuang; mulaiPada: number | null; selesaiPada: number | null } }
  | { jenis: "jawaban"; isi: BarisJawabanD1 }; // JS-08, P-62

export interface Keluaran {
  kirim: { sambunganId: string; pesan: PesanServerPemain }[];
  kelas: PesanServerKelas[];
  tutup: { sambunganId: string; kode: number; alasan: string }[];
  ikat: { sambunganId: string; pemainId: string | null }[];
  simpan: Simpanan[];
  kiriman: BarisKiriman[];
  putaran: "mulai" | "henti" | null;
  kirimSekarang: boolean;
  hapusSemua: boolean;
  koreksi: number;
  /** Jumlah pesan `dunia` yang dikirim di lobi dan hitung mundur (statistik kait uji, JS-07). */
  duniaLobi: number;
  /** Alasan penolakan gerak yang dijawab `koreksi` (statistik kait uji, JS-07). */
  alasanKoreksi: string | null;
  /** Lampiran sambungan yang perlu diperbarui: dialog yang terbuka (kode) atau tertutup (null) (JS-08, P-30). */
  dialog: { sambunganId: string; kode: string | null }[];
  /** Statistik kait uji (JS-08): Langkah 2 yang dikunci dan `pribadi` yang dikirim. */
  jawabanSelesai: number;
  pribadi: number;
  /** JS-11 (P-14): pembungkus menulis `ruang.ringkasan_json` (pemakaian dan hasil) ke D1. */
  tulisRingkasan: boolean;
}

export function keluaranKosong(): Keluaran {
  return {
    kirim: [],
    kelas: [],
    tutup: [],
    ikat: [],
    simpan: [],
    kiriman: [],
    putaran: null,
    kirimSekarang: false,
    hapusSemua: false,
    koreksi: 0,
    duniaLobi: 0,
    alasanKoreksi: null,
    dialog: [],
    jawabanSelesai: 0,
    pribadi: 0,
    tulisRingkasan: false,
  };
}

/** Calon pemain baru; id dan token dibuat pembungkus dengan sumber acak kriptografis. */
export interface CalonPemain {
  pemainId: string;
  token: string;
  hashToken: string;
}

export function buatKeadaan(ruang: DataRuang, peta: PetaRuang, kejadian: readonly KejadianRuang[] = []): KeadaanRuang {
  return {
    ruang,
    peta,
    status: "lobi",
    waktu: { mulaiPada: null, berakhirPada: null, jedaSejak: null, jedaMs: 0, selesaiPada: null },
    terkunci: false,
    ditutupPada: null,
    sambunganTerakhirPutus: null,
    pemain: new Map(),
    gerak: new Map(),
    sambungan: new Map(),
    sambunganPemain: new Map(),
    batasHalo: new Map(),
    kodeMasukUlang: new Map(),
    salahMasukUlang: new Map(),
    urutanBerikut: 1,
    duniaLobiTerakhir: null,
    kerangkaTerakhir: new Map(),
    putaranKe: 0,
    tautan: null,
    papanTerakhir: null,
    kemajuanTerakhir: null,
    kejadian: [...kejadian],
    jawaban: new Map(),
    skor: new Map(),
    terlihat: new Map(),
    dialog: new Map(),
    pribadiTerakhir: new Map(),
    peringkat: null,
    skill: new Map(),
    petunjuk: new Map(),
    modeNama: ruang.pengaturan.modeNama === "bebas" ? "bebas" : "daftar", // ruang sebelum JS-14 tanpa isian
    namaDiblokir: [],
  };
}

export interface DataPulih {
  ruang: DataRuang;
  /** JS-16b (P-12): kode masuk ulang yang masih tersimpan di SQLite ruang. */
  kodeMasukUlang?: { pemainId: string; hash: string; berlakuSampai: number }[];
  status: StatusRuang;
  waktu: WaktuRuang;
  terkunci: boolean;
  ditutupPada: number | null;
  sambunganTerakhirPutus: number | null;
  pemain: PemainRuang[];
  sambungan: { sambunganId: string; pemainId: string | null; dibukaPada?: number; dialog?: string | null }[];
  // JS-08 (P-63): tabel `kejadian`, `jawaban`, dan `terlihat` SQLite ruang.
  kejadian?: KejadianRuang[];
  jawaban?: JawabanRuang[];
  terlihat?: { pemainId: string; titikId: string }[];
  // JS-09 (P-12, P-14): tabel `skill` dan `petunjuk` SQLite ruang; ruang sebelum JS-09 tidak punya barisnya.
  skill?: { pemainId: string; isi: string }[];
  petunjuk?: { pemainId: string; kode: string; opsi: string }[];
  // JS-14 (P-41, P-50): meta `modeNama` dan `namaDiblokir`.
  modeNama?: ModeNama;
  namaDiblokir?: string[];
}

/**
 * Membangun keadaan dari SQLite dan lampiran sambungan sesudah hibernasi atau muat ulang (P-48). Sejak JS-08 juga
 * kejadian dan titiknya, jawaban (skor dan peringkat dihitung ulang darinya), titik terlihat, dan dialog yang
 * terbuka dari lampiran sambungan (P-63).
 */
export function pulihkanKeadaan(d: DataPulih, peta: PetaRuang, sekarang: number): KeadaanRuang {
  const k = buatKeadaan(d.ruang, peta, d.kejadian ?? []);
  k.status = d.status;
  k.waktu = { ...d.waktu };
  k.terkunci = d.terkunci;
  k.ditutupPada = d.ditutupPada;
  k.sambunganTerakhirPutus = d.sambunganTerakhirPutus;
  if (d.modeNama === "daftar" || d.modeNama === "bebas") k.modeNama = d.modeNama;
  k.namaDiblokir = [...(d.namaDiblokir ?? [])];
  for (const c of d.kodeMasukUlang ?? []) k.kodeMasukUlang.set(c.pemainId, { hash: c.hash, berlakuSampai: c.berlakuSampai });
  for (const p of d.pemain) {
    k.pemain.set(p.id, { ...p, terhubung: false });
    k.urutanBerikut = Math.max(k.urutanBerikut, p.urutan + 1);
  }
  for (const s of d.sambungan) {
    const p = s.pemainId ? k.pemain.get(s.pemainId) : undefined;
    if (p && !p.dikeluarkan) {
      k.sambungan.set(s.sambunganId, p.id);
      k.sambunganPemain.set(p.id, s.sambunganId);
      p.terhubung = true;
      p.terputusSejak = null;
    } else {
      k.sambungan.set(s.sambunganId, null);
      k.batasHalo.set(s.sambunganId, (s.dibukaPada ?? sekarang) + BATAS.haloMs);
    }
  }
  if (STATUS_DUNIA.includes(k.status)) {
    for (const p of k.pemain.values()) {
      if (!berkeidentitas(p)) continue;
      // Posisi dari peta lama (misalnya peta uji sebelum JS-07) yang tidak sah di peta ini diganti titik muncul.
      if (p.posisi && !posisiSah(gridUntuk(k), p.posisi.x, p.posisi.y)) p.posisi = null;
      siapkanGerak(k, p, sekarang);
    }
  }
  for (const j of d.jawaban ?? []) jawabanPemain(k, j.pemainId).set(j.kode, { ...j });
  for (const pid of k.jawaban.keys()) perbaruiSkor(k, pid);
  for (const t of d.terlihat ?? []) terlihatPemain(k, t.pemainId).add(t.titikId);
  for (const s of d.skill ?? []) k.skill.set(s.pemainId, skillDariJson(s.isi));
  for (const s of d.petunjuk ?? []) petunjukPemain(k, s.pemainId).set(s.kode, s.opsi);
  if (k.status === "main" || k.status === "jeda") {
    for (const s of d.sambungan) {
      const pid = k.sambungan.get(s.sambunganId);
      if (pid && s.dialog && k.jawaban.get(pid)?.has(s.dialog)) k.dialog.set(pid, s.dialog);
    }
  }
  return k;
}

// ---------------------------------------------------------------------------------------------
// Bantuan

const berkeidentitas = (p: PemainRuang) => p.nama !== null && !p.dikeluarkan;

/** Grid tabrakan sesuai status: grid lobi selama `lobi` dan `hitung_mundur`, grid kampung selain itu (P-45). */
function gridUntuk(k: KeadaanRuang): { lebar: number; tinggi: number; tabrakan: Uint8Array } {
  const lobi = k.status === "lobi" || k.status === "hitung_mundur";
  return { lebar: k.peta.lebar, tinggi: k.peta.tinggi, tabrakan: lobi ? k.peta.tabrakanLobi : k.peta.tabrakan };
}

/** Pemain berkeidentitas yang punya posisi, menurut urutan bergabung. */
function pemainAktif(k: KeadaanRuang): PemainRuang[] {
  return urutPemain(k).filter((p) => berkeidentitas(p) && p.posisi !== null);
}

function urutPemain(k: KeadaanRuang): PemainRuang[] {
  return [...k.pemain.values()].sort((a, b) => a.urutan - b.urutan);
}

function kirimKe(o: Keluaran, sambunganId: string, pesan: PesanServerPemain): void {
  o.kirim.push({ sambunganId, pesan });
}

/** Ke semua sambungan yang sudah punya pemain, termasuk yang masih memilih identitas. */
function kirimSemua(k: KeadaanRuang, o: Keluaran, pesan: PesanServerPemain): void {
  for (const sid of k.sambunganPemain.values()) kirimKe(o, sid, pesan);
}

function galat(kode: KodeGalat): PesanServerPemain {
  return { v: V, t: "galat", kode, pesan: TEKS.galat[kode] };
}

function pesanStatus(k: KeadaanRuang): PesanServerPemain {
  return { v: V, t: "status_ruang", status: k.status, mulaiPada: k.waktu.mulaiPada, berakhirPada: k.waktu.berakhirPada, jedaSejak: k.waktu.jedaSejak };
}

function pesanPemainBaru(p: PemainRuang): PesanServerPemain {
  return { v: V, t: "pemain_baru", id: p.id, nama: p.nama ?? "", avatar: p.avatar ?? 0, warnaTas: p.warnaTas ?? "sun" };
}

/** Daftar pemain untuk layar kelas (JS-10). */
export function pesanLobi(k: KeadaanRuang): PesanServerKelas {
  return {
    v: V,
    t: "lobi",
    pemain: urutPemain(k)
      .filter(berkeidentitas)
      .map((p) => ({ id: p.id, nama: p.nama ?? "", avatar: p.avatar ?? 0, warnaTas: p.warnaTas ?? "sun", terhubung: p.terhubung })),
  };
}

function simpanPemain(o: Keluaran, p: PemainRuang): void {
  o.simpan.push({ jenis: "pemain", pemain: { ...p, saran: [...p.saran], posisi: p.posisi ? { ...p.posisi } : null } });
}

function simpanMeta(o: Keluaran, kunci: KunciMeta, nilai: unknown): void {
  o.simpan.push({ jenis: "meta", kunci, nilai });
}

function barisPeserta(k: KeadaanRuang, p: PemainRuang, peringkat: number | null): BarisKiriman {
  const s = skorDari(k, p.id);
  return {
    jenis: "peserta",
    isi: {
      id: p.id,
      ruangId: k.ruang.ruangId,
      nama: p.nama ?? "",
      avatar: p.avatar ?? 0,
      warnaTas: p.warnaTas ?? "sun",
      nomorAbsen: p.nomorAbsen,
      skor: s.skor,
      waktuSkorMs: s.skor > 0 ? s.waktuSkorMs : null,
      langkah1Benar: s.langkah1Benar,
      jumlahKejadian: s.selesai,
      gabungPada: p.gabungPada,
      peringkatAkhir: peringkat,
      dikeluarkan: p.dikeluarkan,
    },
  };
}

/** Baris peserta semua pemain berkeidentitas dengan peringkat akhir; pemain yang dikeluarkan tanpa peringkat (P-11). */
function antrekanPesertaAkhir(k: KeadaanRuang, o: Keluaran): void {
  k.peringkat = null;
  const peringkat = peringkatRuang(k);
  for (const p of urutPemain(k)) {
    if (p.nama === null) continue;
    o.kiriman.push(barisPeserta(k, p, p.dikeluarkan ? null : (peringkat.get(p.id) ?? null)));
  }
}

function barisRuang(k: KeadaanRuang): BarisKiriman {
  return { jenis: "ruang", isi: { ruangId: k.ruang.ruangId, status: k.status, mulaiPada: k.waktu.mulaiPada, selesaiPada: k.waktu.selesaiPada } };
}

/** Simpan status dan waktu, kirim status_ruang ke semua, dan antrekan baris ruang untuk D1. */
function ubahStatus(k: KeadaanRuang, o: Keluaran): void {
  simpanMeta(o, "status", k.status);
  simpanMeta(o, "waktu", k.waktu);
  kirimSemua(k, o, pesanStatus(k));
  o.kelas.push(pesanStatusKelas(k));
  o.kiriman.push(barisRuang(k));
}

/** Titik muncul pemain dalam piksel logis (titik kaki di tengah-bawah ubin), bergiliran menurut urutan. */
export function titikMuncul(k: KeadaanRuang, urutan: number): PosisiPemain {
  const daftar = k.peta.titikMuncul;
  const t = daftar[(urutan - 1) % daftar.length];
  return { x: t.x * UKURAN_UBIN + UKURAN_UBIN / 2, y: t.y * UKURAN_UBIN + 12, arah: "bawah" };
}

/**
 * Posisi awal (titik muncul) bila belum ada, dan keadaan gerak baru bila belum ada (JS-07, P-49). Posisi pemain
 * baru langsung dikirim lewat kirimPosisiAwal, jadi keadaan baru tidak ditandai berubah.
 */
function siapkanGerak(k: KeadaanRuang, p: PemainRuang, sekarang: number): GerakPemain {
  if (!p.posisi) p.posisi = titikMuncul(k, p.urutan);
  let g = k.gerak.get(p.id);
  if (!g) {
    g = { seqTerakhir: -1, gerakTerakhirMs: sekarang, jalan: false, berubah: false, anggaranPx: 0 };
    k.gerak.set(p.id, g);
  }
  return g;
}

type IsiDunia = [string, number, number, Arah, boolean, boolean];

/** Paling banyak 24 pemain terdekat dari `calon` di dalam kotak 480 × 270 pemain `p`, tanpa `p` sendiri. */
function isiDunia(k: KeadaanRuang, p: PemainRuang, calon: readonly PemainRuang[]): IsiDunia[] {
  if (!p.posisi) return [];
  const dekat: [number, PemainRuang][] = [];
  for (const q of calon) {
    if (q === p || !q.posisi) continue;
    const dx = q.posisi.x - p.posisi.x;
    const dy = q.posisi.y - p.posisi.y;
    if (Math.abs(dx) <= SETENGAH_KOTAK.x && Math.abs(dy) <= SETENGAH_KOTAK.y) dekat.push([dx * dx + dy * dy, q]);
  }
  dekat.sort((a, b) => a[0] - b[0] || a[1].urutan - b[1].urutan);
  return dekat.slice(0, BATAS.duniaTerdekat).map(([, q]): IsiDunia => {
    const pos = q.posisi as PosisiPemain;
    return [q.id, pos.x, pos.y, pos.arah, k.gerak.get(q.id)?.jalan ?? false, k.dialog.has(q.id)];
  });
}

/**
 * Posisi awal sesudah memilih identitas atau tersambung ulang (P-48, P-49): `koreksi` berisi posisinya dengan
 * `seq` gerak terakhir yang diterima (paling kecil 0), kerangka penuh untuk pemain itu, dan posisinya untuk
 * pemain lain yang kotaknya memuat pemain itu.
 */
function kirimPosisiAwal(k: KeadaanRuang, o: Keluaran, p: PemainRuang, sid: string, sekarang: number): void {
  if (!STATUS_DUNIA.includes(k.status) || !berkeidentitas(p)) return;
  const g = siapkanGerak(k, p, sekarang);
  const pos = p.posisi as PosisiPemain;
  kirimKe(o, sid, { v: V, t: "koreksi", x: pos.x, y: pos.y, seq: Math.max(0, g.seqTerakhir) });
  const aktif = pemainAktif(k);
  const isi = isiDunia(k, p, aktif);
  k.kerangkaTerakhir.set(p.id, sekarang);
  if (isi.length > 0) kirimKe(o, sid, { v: V, t: "dunia", w: sekarang, p: isi, n: aktif.length });
  const diri: IsiDunia = [p.id, pos.x, pos.y, pos.arah, g.jalan, k.dialog.has(p.id)];
  for (const q of aktif) {
    const sidQ = k.sambunganPemain.get(q.id);
    if (q === p || sidQ === undefined || !q.posisi) continue;
    if (Math.abs(pos.x - q.posisi.x) <= SETENGAH_KOTAK.x && Math.abs(pos.y - q.posisi.y) <= SETENGAH_KOTAK.y) {
      kirimKe(o, sidQ, { v: V, t: "dunia", w: sekarang, p: [diri], n: aktif.length });
    }
  }
}

/**
 * `dunia` di lobi dan hitung mundur (P-47, P-48): pemain yang berubah, ditambah kerangka penuh untuk pemain
 * yang kerangka penuh terakhirnya sudah ≥ 1 detik. Dipanggil hanya sesudah `gerak` diterima, tanpa putaran.
 */
function kirimDuniaLobi(k: KeadaanRuang, o: Keluaran, sekarang: number): void {
  const aktif = pemainAktif(k);
  const berubah = aktif.filter((p) => k.gerak.get(p.id)?.berubah);
  for (const p of aktif) {
    const sid = k.sambunganPemain.get(p.id);
    if (sid === undefined) continue;
    const penuh = sekarang - (k.kerangkaTerakhir.get(p.id) ?? -Infinity) >= DUNIA_LOBI.kerangkaPenuhMs;
    const isi = isiDunia(k, p, penuh ? aktif : berubah);
    if (isi.length === 0) continue;
    if (penuh) k.kerangkaTerakhir.set(p.id, sekarang);
    kirimKe(o, sid, { v: V, t: "dunia", w: sekarang, p: isi, n: aktif.length });
    o.duniaLobi++;
  }
  for (const q of berubah) {
    const g = k.gerak.get(q.id);
    if (g) g.berubah = false;
  }
  k.duniaLobiTerakhir = sekarang;
}

/**
 * JS-15 (P-24): kiriman lobi untuk perubahan yang tertahan, misalnya pemain yang berhenti kurang dari 100 ms sesudah
 * kiriman terakhir. Dipanggil saat `ping` masuk, jadi lobi tetap tanpa putaran.
 */
function kirimDuniaLobiTertunda(k: KeadaanRuang, o: Keluaran, sekarang: number): void {
  const jeda = k.duniaLobiTerakhir === null ? Infinity : sekarang - k.duniaLobiTerakhir;
  if (jeda >= DUNIA_LOBI.jedaBerhentiMs && pemainAktif(k).some((p) => k.gerak.get(p.id)?.berubah)) kirimDuniaLobi(k, o, sekarang);
}

/** Waktu ronde tanpa jeda sejak mulaiPada. */
export function waktuRonde(k: KeadaanRuang, sekarang: number): number {
  if (k.waktu.mulaiPada === null) return 0;
  const akhir = k.status === "jeda" && k.waktu.jedaSejak !== null ? k.waktu.jedaSejak : sekarang;
  return Math.max(0, akhir - k.waktu.mulaiPada - k.waktu.jedaMs);
}

/**
 * Waktu ronde tanpa jeda pada jam server `t` (JS-08): t − mulaiPada − lama jeda yang dimulai sebelum t. Kunci hanya
 * diterima di status `main`, jadi setiap jeda sebelum t sudah selesai. Ruang lama tanpa riwayat memakai jedaMs.
 */
export function waktuRondePada(k: KeadaanRuang, t: number): number {
  if (k.waktu.mulaiPada === null) return 0;
  const riwayat = k.waktu.riwayatJeda;
  const jeda = riwayat ? riwayat.filter((r) => r.sejak < t).reduce((s, r) => s + r.lama, 0) : k.waktu.jedaMs;
  return Math.max(0, t - k.waktu.mulaiPada - jeda);
}

// ---------------------------------------------------------------------------------------------
// Kejadian (JS-08)

function jawabanPemain(k: KeadaanRuang, pemainId: string): Map<string, JawabanRuang> {
  let m = k.jawaban.get(pemainId);
  if (!m) {
    m = new Map();
    k.jawaban.set(pemainId, m);
  }
  return m;
}

function terlihatPemain(k: KeadaanRuang, pemainId: string): Set<string> {
  let s = k.terlihat.get(pemainId);
  if (!s) {
    s = new Set();
    k.terlihat.set(pemainId, s);
  }
  return s;
}

const SKOR_NOL: SkorPemain = { skor: 0, waktuSkorMs: 0, langkah1Benar: 0, selesai: 0 };

export function skorDari(k: KeadaanRuang, pemainId: string): SkorPemain {
  return k.skor.get(pemainId) ?? SKOR_NOL;
}

/** Skor pemain dihitung ulang dari jawabannya (P-55, P-63); peringkat ditandai perlu dihitung ulang. */
function perbaruiSkor(k: KeadaanRuang, pemainId: string): void {
  k.skor.set(pemainId, hitungSkor(k.jawaban.get(pemainId)?.values() ?? [], (t) => waktuRondePada(k, t)));
  k.peringkat = null;
}

/** Peringkat pemain berkeidentitas yang tidak dikeluarkan, termasuk yang terputus (P-55; PRD 8.4). */
export function peringkatRuang(k: KeadaanRuang): Map<string, number> {
  if (k.peringkat) return k.peringkat;
  const daftar = urutPemain(k)
    .filter(berkeidentitas)
    .map((p) => {
      const s = skorDari(k, p.id);
      return { id: p.id, skor: s.skor, waktuSkorMs: s.waktuSkorMs, langkah1Benar: s.langkah1Benar, urutanGabung: p.urutan };
    });
  k.peringkat = new Map(hitungPeringkat(daftar).map((r) => [r.id, r.peringkat]));
  return k.peringkat;
}

function pesanPribadi(k: KeadaanRuang, p: PemainRuang, sekarang: number): Extract<PesanServerPemain, { t: "pribadi" }> {
  const jaw = k.jawaban.get(p.id);
  const lihat = k.terlihat.get(p.id);
  return {
    v: V,
    t: "pribadi",
    skor: skorDari(k, p.id).skor,
    peringkat: peringkatRuang(k).get(p.id) ?? 1,
    selesai: k.kejadian.filter((kj) => jaw?.get(kj.kode)?.status === "selesai").map((kj) => kj.kode),
    terlihat: k.kejadian.filter((kj) => kj.titik.some((t) => lihat?.has(t.id))).map((kj) => kj.kode),
    // JS-09 (P-13): muatan, masa aktif, dan kotak yang menunggu dalam jam server.
    ...isiPribadiSkill(k.skill.get(p.id), waktuRonde(k, sekarang), k.waktu.mulaiPada, k.waktu.jedaMs),
  };
}

function kirimPribadi(k: KeadaanRuang, o: Keluaran, p: PemainRuang, sid: string, sekarang: number): void {
  const pesan = pesanPribadi(k, p, sekarang);
  kirimKe(o, sid, pesan);
  k.pribadiTerakhir.set(p.id, { pada: sekarang, peringkat: pesan.peringkat });
  o.pribadi++;
}

/** `pribadi` kepada semua pemain berkeidentitas yang tersambung (P-56: saat status menjadi `main`). */
function kirimPribadiSemua(k: KeadaanRuang, o: Keluaran, sekarang: number): void {
  for (const p of urutPemain(k)) {
    const sid = k.sambunganPemain.get(p.id);
    if (sid !== undefined && berkeidentitas(p)) kirimPribadi(k, o, p, sid, sekarang);
  }
}

function pesanSelesai(k: KeadaanRuang, p: PemainRuang): PesanServerPemain {
  const peringkat = peringkatRuang(k);
  return {
    v: V,
    t: "selesai",
    skor: skorDari(k, p.id).skor,
    peringkat: peringkat.get(p.id) ?? 1,
    jumlahPemain: Math.max(1, peringkat.size),
    rekap: susunRekap(k.kejadian, k.jawaban.get(p.id)), // JS-11, P-1 dan P-2
  };
}

/** `selesai` kepada setiap pemain berkeidentitas yang tersambung (JS-08 P-35; JS-11 P-3). */
function kirimSelesaiSemua(k: KeadaanRuang, o: Keluaran): void {
  for (const p of urutPemain(k)) {
    const sid = k.sambunganPemain.get(p.id);
    if (sid !== undefined && berkeidentitas(p)) kirimKe(o, sid, pesanSelesai(k, p));
  }
}

/**
 * JS-11 (P-13): peringkat berubah sesudah ronde berakhir (pemain dikeluarkan, atau pemain yang sudah tersambung baru
 * memilih nama). Peringkat dihitung ulang, baris peserta semua pemain diantrekan lagi, layar kelas menerima `papan` dan
 * `kemajuan` bila berubah, pemain yang tersambung menerima `selesai` baru, dan ringkasan hasil ditulis ulang.
 */
function perbaruiPeringkatAkhir(k: KeadaanRuang, o: Keluaran): void {
  antrekanPesertaAkhir(k, o);
  kirimPapanKelas(k, o, false);
  kirimSelesaiSemua(k, o);
  o.tulisRingkasan = true;
  o.kirimSekarang = true;
}

/**
 * JS-11 (P-14): ringkasan hasil untuk `ruang.ringkasan_json.hasil`, atau null bila ronde tidak dimainkan (ruang ditutup
 * dari lobi atau saat hitung mundur).
 */
export function ringkasanHasil(k: KeadaanRuang): RingkasanHasilRuang | null {
  if (!rondeDimainkan(k.waktu.mulaiPada, k.waktu.selesaiPada)) return null;
  const pemain = urutPemain(k)
    .filter(berkeidentitas)
    .map((p) => ({ skor: skorDari(k, p.id).skor, jawaban: k.jawaban.get(p.id)?.values() ?? [] }));
  return hitungRingkasanHasil(k.kejadian.length, pemain);
}

function catatTerlihat(k: KeadaanRuang, o: Keluaran, p: PemainRuang, sid: string, kj: KejadianRuang, titik: TitikPeta, sekarang: number): void {
  terlihatPemain(k, p.id).add(titik.id);
  o.simpan.push({ jenis: "terlihat", pemainId: p.id, titikId: titik.id, kode: kj.kode, pada: sekarang });
  kirimKe(o, sid, pesanTerlihat(kj, titik));
}

/** Jawaban disimpan ke SQLite ruang dan diantrekan ke D1 (P-61, P-62). */
function simpanJawaban(k: KeadaanRuang, o: Keluaran, kj: KejadianRuang, j: JawabanRuang): void {
  jawabanPemain(k, j.pemainId).set(j.kode, j);
  o.simpan.push({ jenis: "jawaban", jawaban: { ...j } });
  antrekanJawaban(k, o, kj, j);
}

/** Baris jawaban D1 dengan tanda Petunjuk (JS-09, P-45); kunci antrean yang sama, jadi baris D1 tidak bertambah. */
function antrekanJawaban(k: KeadaanRuang, o: Keluaran, kj: KejadianRuang, j: JawabanRuang): void {
  o.kiriman.push({ jenis: "jawaban", isi: barisJawabanD1(k.ruang.ruangId, kj, j, k.petunjuk.get(j.pemainId)?.has(j.kode) === true) });
}

function tandaiBerubah(k: KeadaanRuang, pemainId: string): void {
  const g = k.gerak.get(pemainId);
  if (g) g.berubah = true;
}

function bukaDialog(k: KeadaanRuang, o: Keluaran, p: PemainRuang, sid: string, kode: string): void {
  k.dialog.set(p.id, kode);
  o.dialog.push({ sambunganId: sid, kode });
  tandaiBerubah(k, p.id);
}

function tutupDialog(k: KeadaanRuang, o: Keluaran, pemainId: string): void {
  if (!k.dialog.delete(pemainId)) return;
  const sid = k.sambunganPemain.get(pemainId);
  if (sid !== undefined) o.dialog.push({ sambunganId: sid, kode: null });
  tandaiBerubah(k, pemainId);
}

/**
 * Pesan pembukaan (P-28): `kejadian_terbuka`, lalu ulangan `hasil_1` bila Langkah 1 sudah dikunci (KT-13). JS-09 (P-30):
 * Petunjuk yang sudah dipakai dikirim ulang selama Langkah 1 belum dikunci.
 */
function kirimPembukaan(k: KeadaanRuang, o: Keluaran, sid: string, kj: KejadianRuang, j: JawabanRuang): void {
  kirimKe(o, sid, pesanTerbuka(kj, j));
  if (j.status !== "langkah1") kirimKe(o, sid, pesanHasil1(kj, j));
  else {
    const opsi = k.petunjuk.get(j.pemainId)?.get(kj.kode);
    const pesan = opsi === undefined ? null : pesanPetunjuk(kj, j, opsi);
    if (pesan) kirimKe(o, sid, pesan);
  }
}

/** Kejadian yang terlihat dikirim ulang (urut kode, lalu id titik), lalu `pribadi` (P-12, P-36). */
function kirimKeadaanKejadian(k: KeadaanRuang, o: Keluaran, p: PemainRuang, sid: string, sekarang: number): void {
  if (!berkeidentitas(p)) return;
  if (k.status === "main" || k.status === "jeda") {
    const lihat = k.terlihat.get(p.id);
    const daftar = [...k.kejadian].sort((a, b) => (a.kode < b.kode ? -1 : a.kode > b.kode ? 1 : 0));
    for (const kj of daftar) {
      for (const t of [...kj.titik].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) if (lihat?.has(t.id)) kirimKe(o, sid, pesanTerlihat(kj, t));
    }
    kirimPribadi(k, o, p, sid, sekarang);
    // JS-09 (P-12): Kompas yang masih aktif dikirim ulang sesudah `pribadi`.
    const s = k.skill.get(p.id);
    if (s && kompasAktif(s, waktuRonde(k, sekarang))) {
      const pesan = pesanKompas(k, s);
      if (pesan) kirimKe(o, sid, pesan);
    }
  } else if (k.status === "selesai" || k.status === "pembahasan") {
    kirimKe(o, sid, pesanSelesai(k, p));
  }
}

function bolehMenjawab(k: KeadaanRuang, sekarang: number): boolean {
  return k.status === "main" && k.waktu.berakhirPada !== null && sekarang < k.waktu.berakhirPada;
}

/** `periksa` (P-26 sampai P-28). */
function terimaPeriksa(k: KeadaanRuang, o: Keluaran, p: PemainRuang, sid: string, kejadianId: string, sekarang: number): void {
  if (!bolehMenjawab(k, sekarang) || !berkeidentitas(p) || !p.posisi) return;
  const kj = k.kejadian.find((x) => x.kode === kejadianId);
  if (!kj) return;
  let j = k.jawaban.get(p.id)?.get(kj.kode);
  if (j?.status === "selesai") return;
  const terbuka = k.dialog.get(p.id);
  if (terbuka !== undefined) {
    if (terbuka === kj.kode && j) kirimPembukaan(k, o, sid, kj, j);
    return;
  }
  const titik = titikDalamJangkauan(p.posisi, kj);
  if (!titik) {
    const g = siapkanGerak(k, p, sekarang);
    kirimKe(o, sid, galat("BUKAN_JANGKAUAN"));
    kirimKe(o, sid, { v: V, t: "koreksi", x: p.posisi.x, y: p.posisi.y, seq: Math.max(0, g.seqTerakhir) });
    return;
  }
  if (!terlihatPemain(k, p.id).has(titik.id)) catatTerlihat(k, o, p, sid, kj, titik, sekarang);
  if (!j) {
    j = jawabanBaru(k.ruang.benih, p.id, kj.kode, sekarang);
    simpanJawaban(k, o, kj, j);
  }
  bukaDialog(k, o, p, sid, kj.kode);
  kirimPembukaan(k, o, sid, kj, j);
}

/** `kunci_1` dan `kunci_2` (P-31, P-32): hanya sekali per langkah, untuk dialog yang terbuka. */
function terimaKunci(k: KeadaanRuang, o: Keluaran, p: PemainRuang, sid: string, langkah: 1 | 2, kejadianId: string, opsiId: string, sekarang: number): void {
  if (!bolehMenjawab(k, sekarang) || k.dialog.get(p.id) !== kejadianId) return;
  const kj = k.kejadian.find((x) => x.kode === kejadianId);
  const j = k.jawaban.get(p.id)?.get(kejadianId);
  if (!kj || !j) return;
  const baru = langkah === 1 ? kunciLangkah1(kj, j, opsiId, sekarang) : kunciLangkah2(kj, j, opsiId, sekarang);
  if (!baru) return;
  simpanJawaban(k, o, kj, baru);
  perbaruiSkor(k, p.id);
  o.kiriman.push(barisPeserta(k, p, null));
  if (langkah === 1) kirimKe(o, sid, pesanHasil1(kj, baru));
  else {
    kirimKe(o, sid, pesanHasil2(kj, baru));
    o.jawabanSelesai++;
    // JS-09 (P-32): +1 Kompas untuk jawaban "tepat"; (P-25) sasaran Kompas yang baru selesai diganti.
    let s = k.skill.get(p.id);
    let berubah = false;
    if (baru.tingkat === "tepat") {
      const tambah = tambahKompas(s ?? skillBaru(), skillAktifRuang(k));
      if (tambah) {
        s = tambah;
        berubah = true;
        kirimKe(o, sid, { v: V, t: "pemberitahuan", kode: "kompas_tepat" });
      }
    }
    if (s && kompasAktif(s, waktuRonde(k, sekarang)) && s.kompas?.kode === kj.kode) {
      const ganti = sasaranBaru(k, p, s);
      s = ganti.s;
      berubah = true;
      if (ganti.pesan) kirimKe(o, sid, ganti.pesan);
    }
    if (s && berubah) aturSkill(k, o, p.id, s);
  }
  kirimPribadi(k, o, p, sid, sekarang);
}

// ---------------------------------------------------------------------------------------------
// Skill dan kotak bantuan (JS-09, P-11 sampai P-32). Waktu keadaan skill memakai waktu ronde (P-11).

/** Skill P0 yang aktif di ruang, menurut urutan P-1 (P-8, P-10). */
function skillAktifRuang(k: KeadaanRuang): SkillId[] {
  return SKILL_P0.filter((s) => k.ruang.pengaturan.skillAktif.includes(s));
}

function petunjukPemain(k: KeadaanRuang, pemainId: string): Map<string, string> {
  let m = k.petunjuk.get(pemainId);
  if (!m) {
    m = new Map();
    k.petunjuk.set(pemainId, m);
  }
  return m;
}

/** Keadaan skill baru dipakai dan ditulis sebagai satu baris `skill` (P-14). */
function aturSkill(k: KeadaanRuang, o: Keluaran, pemainId: string, s: SkillPemain): void {
  k.skill.set(pemainId, s);
  o.simpan.push({ jenis: "skill", pemainId, isi: skillKeJson(s) });
}

/** `kompas` untuk sasaran yang tersimpan, dengan `berakhirPada` dalam jam server (P-24). */
function pesanKompas(k: KeadaanRuang, s: SkillPemain): PesanServerPemain | null {
  const akhir = s.keadaan.aktifSampaiMs.kompas;
  const kj = s.kompas ? k.kejadian.find((x) => x.kode === s.kompas?.kode) : undefined;
  const titik = kj?.titik.find((x) => x.id === s.kompas?.titik);
  if (akhir === undefined || !titik || k.waktu.mulaiPada === null) return null;
  return { v: V, t: "kompas", x: titik.x, y: titik.y, berakhirPada: keJamServer(akhir, k.waktu.mulaiPada, k.waktu.jedaMs) };
}

/** Sasaran Kompas dari posisi pemain di antara titik aktif kejadian yang belum selesai baginya (P-24). */
function cariSasaran(k: KeadaanRuang, p: PemainRuang): { kode: string; titikId: string } | null {
  if (!p.posisi) return null;
  const jaw = k.jawaban.get(p.id);
  return pilihSasaran(p.posisi, k.kejadian, (kode) => jaw?.get(kode)?.status === "selesai");
}

/** Sasaran baru dengan akhir masa aktif yang sama, atau Kompas berakhir bila tidak ada lagi (P-25). */
function sasaranBaru(k: KeadaanRuang, p: PemainRuang, s: SkillPemain): { s: SkillPemain; pesan: PesanServerPemain | null } {
  const sasaran = cariSasaran(k, p);
  if (!sasaran) return { s: akhiriKompas(s), pesan: null };
  const baru: SkillPemain = { ...s, kompas: { kode: sasaran.kode, titik: sasaran.titikId } };
  return { s: baru, pesan: pesanKompas(k, baru) };
}

/** Kotak dari ruas gerak (P-16): satu baris `skill`, lalu `pribadi` dan satu `pemberitahuan` per kotak. */
function ambilKotakGerak(k: KeadaanRuang, o: Keluaran, p: PemainRuang, sid: string, dari: PosisiPemain | null, ke: PosisiPemain, sekarang: number): void {
  const daftar = k.peta.kotak;
  if (!dari || !daftar || daftar.length === 0) return;
  const aktif = skillAktifRuang(k);
  if (aktif.length === 0) return;
  const hasil = ambilKotak(k.skill.get(p.id) ?? skillBaru(), dari, ke, daftar, aktif, waktuRonde(k, sekarang));
  if (hasil.diambil.length === 0) return;
  aturSkill(k, o, p.id, hasil.s);
  kirimPribadi(k, o, p, sid, sekarang);
  for (const kotak of hasil.diambil) kirimKe(o, sid, { v: V, t: "pemberitahuan", kode: `kotak_${SKILL_KOTAK[kotak.jenis]}` });
}

/** `pakai_skill` (P-15, P-19, P-24, P-28). Pemakaian yang ditolak tidak dijawab, kecuali Kompas tanpa sasaran. */
function terimaPakaiSkill(k: KeadaanRuang, o: Keluaran, p: PemainRuang, sid: string, skill: SkillId, kejadianId: string | undefined, sekarang: number): void {
  if (!bolehMenjawab(k, sekarang) || !berkeidentitas(p) || !p.posisi) return;
  if (!(SKILL_P0 as readonly SkillId[]).includes(skill)) return;
  const aktif = skillAktifRuang(k);
  const t = waktuRonde(k, sekarang);
  const s = k.skill.get(p.id) ?? skillBaru();
  const kodeDialog = k.dialog.get(p.id);
  if (skill === "petunjuk") {
    terimaPetunjuk(k, o, p, sid, s, aktif, t, kodeDialog, kejadianId, sekarang);
    return;
  }
  const langkahDialog = kodeDialog === undefined ? null : k.jawaban.get(p.id)?.get(kodeDialog)?.status === "langkah1" ? 1 : 2;
  if (!bolehPakai(s, skill, t, aktif, langkahDialog)) return;
  let sasaran: { kode: string; titikId: string } | null = null;
  if (skill === "kompas") {
    sasaran = cariSasaran(k, p);
    if (!sasaran) {
      kirimKe(o, sid, { v: V, t: "pemberitahuan", kode: "kompas_tanpa_sasaran" });
      return;
    }
  }
  const baru = pakai(s, skill, t, aktif, langkahDialog);
  if (!baru) return;
  if (sasaran) baru.kompas = { kode: sasaran.kode, titik: sasaran.titikId };
  aturSkill(k, o, p.id, baru);
  const pesan = sasaran ? pesanKompas(k, baru) : null;
  if (pesan) kirimKe(o, sid, pesan);
  kirimPribadi(k, o, p, sid, sekarang);
}

/** Petunjuk (P-28): dialog kejadian itu terbuka di Langkah 1, dan Petunjuk belum dipakai untuk kejadian itu. */
function terimaPetunjuk(
  k: KeadaanRuang,
  o: Keluaran,
  p: PemainRuang,
  sid: string,
  s: SkillPemain,
  aktif: readonly SkillId[],
  t: number,
  kodeDialog: string | undefined,
  kejadianId: string | undefined,
  sekarang: number,
): void {
  if (kejadianId === undefined || kodeDialog !== kejadianId) return;
  const kj = k.kejadian.find((x) => x.kode === kejadianId);
  const j = k.jawaban.get(p.id)?.get(kejadianId);
  if (!kj || !j || j.status !== "langkah1" || k.petunjuk.get(p.id)?.has(kejadianId)) return;
  const baru = pakai(s, "petunjuk", t, aktif, 1);
  if (!baru) return;
  const opsi = pilihCoretan(k.ruang.benih, p.id, kj.kode, kj.isi);
  const pesan = pesanPetunjuk(kj, j, opsi);
  if (!pesan) return;
  aturSkill(k, o, p.id, baru);
  petunjukPemain(k, p.id).set(kj.kode, opsi);
  o.simpan.push({ jenis: "petunjuk", pemainId: p.id, kode: kj.kode, opsi });
  antrekanJawaban(k, o, kj, j);
  kirimKe(o, sid, pesan);
  kirimPribadi(k, o, p, sid, sekarang);
}

/** Tiba di sasaran Kompas pada setiap putaran `main` (P-25). Kompas yang habis karena waktu dilupakan tanpa pesan. */
function periksaKompas(k: KeadaanRuang, o: Keluaran, aktif: readonly PemainRuang[], sekarang: number): void {
  if (k.skill.size === 0) return;
  const t = waktuRonde(k, sekarang);
  for (const p of aktif) {
    const s = k.skill.get(p.id);
    if (!s?.kompas || !p.posisi) continue;
    const akhir = s.keadaan.aktifSampaiMs.kompas;
    if (akhir === undefined || akhir <= t) {
      k.skill.set(p.id, { ...s, kompas: null });
      continue;
    }
    const kj = k.kejadian.find((x) => x.kode === s.kompas?.kode);
    const titik = kj?.titik.find((x) => x.id === s.kompas?.titik);
    if (!titik || !kompasTiba(p.posisi, titik)) continue;
    aturSkill(k, o, p.id, akhiriKompas(s));
    const sid = k.sambunganPemain.get(p.id);
    if (sid !== undefined) kirimPribadi(k, o, p, sid, sekarang);
  }
}

/** Keterlihatan pada setiap putaran `main` (P-10, P-11): hanya pemain yang tersambung dan punya posisi. */
function periksaKeterlihatan(k: KeadaanRuang, o: Keluaran, aktif: readonly PemainRuang[], sekarang: number): void {
  if (k.kejadian.length === 0) return;
  const lebar = k.peta.lebar * UKURAN_UBIN;
  const tinggi = k.peta.tinggi * UKURAN_UBIN;
  for (const p of aktif) {
    const sid = k.sambunganPemain.get(p.id);
    if (sid === undefined || !p.posisi) continue;
    for (const { k: kj, titik } of titikBaruTerlihat(p.posisi, k.kejadian, terlihatPemain(k, p.id), lebar, tinggi)) {
      catatTerlihat(k, o, p, sid, kj, titik, sekarang);
    }
  }
}

/** `pribadi` karena peringkat berubah oleh pemain lain: paling sering sekali per 2 detik per pemain (P-56). */
function jadwalPribadi(k: KeadaanRuang, o: Keluaran, sekarang: number): void {
  const peringkat = peringkatRuang(k);
  for (const p of urutPemain(k)) {
    const sid = k.sambunganPemain.get(p.id);
    const r = peringkat.get(p.id);
    if (sid === undefined || r === undefined) continue;
    const akhir = k.pribadiTerakhir.get(p.id);
    if (akhir && (akhir.peringkat === r || sekarang - akhir.pada < JEDA_PRIBADI_MS)) continue;
    kirimPribadi(k, o, p, sid, sekarang);
  }
}

function terlambat(k: KeadaanRuang, sekarang: number): boolean {
  if (k.status === "selesai" || k.status === "pembahasan") return true;
  if (k.status !== "main" && k.status !== "jeda") return false;
  return waktuRonde(k, sekarang) > k.ruang.pengaturan.batasTerlambatMenit * 60_000;
}

// ---------------------------------------------------------------------------------------------
// Nama pemain (JS-14, P-41 sampai P-50)

/** P-44 (D-4): banyak `NAMA_DITOLAK` sebelum pemain hanya boleh memakai nama samaran. */
export const BATAS_TOLAK_NAMA = 5;
/** P-50: banyak sidik nama yang diblokir paling banyak; butir tertua dibuang bila penuh. */
export const BLOKIR_NAMA_MAKS = 300;

/** P-41: mode nama yang berlaku untuk seorang pemain. */
export function modeNamaPemain(k: KeadaanRuang, p: PemainRuang): ModeNama {
  return k.modeNama === "bebas" && (p.tolak ?? 0) < BATAS_TOLAK_NAMA ? "bebas" : "daftar";
}

/** Kunci nama semua pemain bernama selain `pemainId`, termasuk yang terputus dan yang dikeluarkan. */
function kunciTerpakai(k: KeadaanRuang, pemainId: string): Set<string> {
  const hasil = new Set<string>();
  for (const q of k.pemain.values()) if (q.id !== pemainId && q.nama !== null) hasil.add(kunciNama(q.nama));
  return hasil;
}

type HasilNama = { nama: string; galat?: undefined } | { galat: KodeGalat; nama?: undefined };

/** P-42: nama yang diterima, atau kode galatnya. */
function periksaNamaPilihan(k: KeadaanRuang, p: PemainRuang, masuk: string): HasilNama {
  const terpakai = kunciTerpakai(k, p.id);
  const diblokir = (n: string) => k.namaDiblokir.includes(sidikNama(n));
  if (p.saran.includes(masuk) && !terpakai.has(kunciNama(masuk)) && !diblokir(masuk)) return { nama: masuk };
  if (modeNamaPemain(k, p) === "daftar") return { galat: "NAMA_DIPAKAI" };
  const rapi = rapikanNama(masuk);
  if (!bentukNamaSah(rapi) || diblokir(rapi) || namaTertolak(rapi)) return { galat: "NAMA_DITOLAK" };
  if (terpakai.has(kunciNama(rapi))) return { galat: "NAMA_DIPAKAI" };
  return { nama: rapi };
}

/** P-50: sidik nama lama masuk daftar blokir ruang. */
function blokirNama(k: KeadaanRuang, o: Keluaran, nama: string): void {
  const sidik = sidikNama(nama);
  if (!k.namaDiblokir.includes(sidik)) {
    k.namaDiblokir.push(sidik);
    if (k.namaDiblokir.length > BLOKIR_NAMA_MAKS) k.namaDiblokir.splice(0, k.namaDiblokir.length - BLOKIR_NAMA_MAKS);
  }
  simpanMeta(o, "namaDiblokir", [...k.namaDiblokir]);
}

/** P-46 butir 2: nama samaran acak yang belum dipakai dan tidak diblokir; cadangannya "Pemain {urutan}". */
function namaPengganti(k: KeadaanRuang, p: PemainRuang, acak: () => number): string {
  const terpakai = kunciTerpakai(k, p.id);
  const blokir = new Set(k.namaDiblokir);
  const calon = NAMA_SAMARAN.filter((n) => !terpakai.has(kunciNama(n)) && !blokir.has(sidikNama(n)));
  if (calon.length > 0) return calon[Math.min(calon.length - 1, Math.floor(acak() * calon.length))];
  let nama = `Pemain ${p.urutan}`;
  for (let i = 2; terpakai.has(kunciNama(nama)); i++) nama = `Pemain ${p.urutan} ${i}`;
  return nama;
}

/** P-46 butir 1 sampai 4 untuk satu pemain bernama, tanpa pesan ke layar kelas. */
function gantiNamaPemain(k: KeadaanRuang, o: Keluaran, p: PemainRuang, nama: string, acak: () => number): string {
  blokirNama(k, o, nama);
  const baru = namaPengganti(k, p, acak);
  p.nama = baru;
  simpanPemain(o, p);
  kirimSemua(k, o, { v: V, t: "nama_baru", id: p.id, nama: baru });
  const akhir = k.status === "selesai" || k.status === "pembahasan";
  o.kiriman.push(barisPeserta(k, p, akhir ? (peringkatRuang(k).get(p.id) ?? null) : null));
  return baru;
}

/** P-46: ganti nama satu pemain berkeidentitas yang belum dikeluarkan; nama baru, atau null bila tidak berlaku. */
export function gantiNama(k: KeadaanRuang, o: Keluaran, pemainId: string, acak: () => number): string | null {
  const p = k.pemain.get(pemainId);
  if (!p || p.nama === null || p.dikeluarkan || k.status === "ditutup") return null;
  const baru = gantiNamaPemain(k, o, p, p.nama, acak);
  o.kelas.push(pesanLobi(k));
  kirimPapanKelas(k, o, true);
  return baru;
}

/** P-48: ganti semua nama buatan siswa, lalu ruang menjadi mode daftar; jumlahnya, atau null di ruang mode daftar. */
export function gantiSemuaNama(k: KeadaanRuang, o: Keluaran, sekarang: number, acak: () => number): number | null {
  if (k.modeNama !== "bebas" || k.status === "ditutup") return null;
  const daftar = new Set(NAMA_SAMARAN);
  let jumlah = 0;
  for (const p of urutPemain(k)) {
    if (p.nama === null || p.dikeluarkan || daftar.has(p.nama)) continue;
    gantiNamaPemain(k, o, p, p.nama, acak);
    jumlah++;
  }
  k.modeNama = "daftar";
  simpanMeta(o, "modeNama", k.modeNama);
  for (const p of k.pemain.values()) {
    if (p.nama !== null || p.dikeluarkan) continue;
    const sid = k.sambunganPemain.get(p.id);
    if (sid !== undefined) kirimKe(o, sid, { v: V, t: "mode_nama", modeNama: "daftar" });
  }
  o.kelas.push(pesanLobi(k));
  kirimPapanKelas(k, o, true);
  if (k.tautan !== null) o.kelas.push(pesanInfoKelas(k, sekarang));
  return jumlah;
}

/** Tiga saran nama yang belum dipakai dan, bila masih cukup, tidak sama dengan saran sebelumnya (P-22). */
export function pilihSaran(k: KeadaanRuang, sebelumnya: readonly string[], acak: () => number): string[] {
  // JS-14: nama dibandingkan tanpa membedakan huruf besar dan kecil, dan nama yang diblokir tidak disarankan.
  const dipakai = new Set<string>();
  for (const p of k.pemain.values()) if (p.nama !== null) dipakai.add(kunciNama(p.nama));
  const blokir = new Set(k.namaDiblokir);
  const bebas = (n: string) => !dipakai.has(kunciNama(n)) && !blokir.has(sidikNama(n));
  let calon = NAMA_SAMARAN.filter((n) => bebas(n) && !sebelumnya.includes(n));
  if (calon.length < 3) calon = NAMA_SAMARAN.filter(bebas);
  const hasil: string[] = [];
  while (hasil.length < 3 && calon.length > 0) {
    const i = Math.min(calon.length - 1, Math.floor(acak() * calon.length));
    hasil.push(calon[i]);
    calon = calon.filter((_, j) => j !== i);
  }
  return hasil;
}

/** Warna tas yang paling sedikit dipakai pemain berkeidentitas; seri mengikuti URUTAN_WARNA_TAS. */
export function warnaTasBaru(k: KeadaanRuang): WarnaTas {
  const hitung = new Map<WarnaTas, number>(URUTAN_WARNA_TAS.map((w) => [w, 0]));
  for (const p of k.pemain.values()) if (berkeidentitas(p) && p.warnaTas) hitung.set(p.warnaTas, (hitung.get(p.warnaTas) ?? 0) + 1);
  let terpilih: WarnaTas = URUTAN_WARNA_TAS[0];
  for (const w of URUTAN_WARNA_TAS) if ((hitung.get(w) ?? 0) < (hitung.get(terpilih) ?? 0)) terpilih = w;
  return terpilih;
}

function ikat(k: KeadaanRuang, o: Keluaran, sid: string, p: PemainRuang): void {
  k.batasHalo.delete(sid);
  k.sambungan.set(sid, p.id);
  k.sambunganPemain.set(p.id, sid);
  o.ikat.push({ sambunganId: sid, pemainId: p.id });
}

function tolakSambungan(k: KeadaanRuang, o: Keluaran, sid: string, kode: KodeGalat | null, kodeTutup: number, alasan: string): Keluaran {
  if (kode) kirimKe(o, sid, galat(kode));
  o.tutup.push({ sambunganId: sid, kode: kodeTutup, alasan });
  k.sambungan.delete(sid);
  k.batasHalo.delete(sid);
  k.salahMasukUlang.delete(sid);
  return o;
}

/** Pemain tanpa identitas yang terputus lebih dari 5 menit dilepas, sehingga tempatnya kembali (P-24). */
function bersihkanTanpaIdentitas(k: KeadaanRuang, o: Keluaran, sekarang: number): void {
  for (const p of [...k.pemain.values()]) {
    if (p.nama === null && !p.terhubung && p.terputusSejak !== null && sekarang - p.terputusSejak > WAKTU.lepasTanpaIdentitasMs) {
      k.pemain.delete(p.id);
      k.gerak.delete(p.id);
      o.simpan.push({ jenis: "hapus_pemain", id: p.id });
    }
  }
}

function sambutan(k: KeadaanRuang, o: Keluaran, sid: string, p: PemainRuang, token: string, sekarang: number): void {
  kirimKe(o, sid, {
    v: V,
    t: "selamat_datang",
    pemainId: p.id,
    token,
    status: k.status,
    pengaturan: { ...k.ruang.pengaturan, modeNama: modeNamaPemain(k, p) }, // JS-14 (P-34)
    waktuServer: sekarang,
    versiPeta: k.peta.versi,
    saranNama: p.nama === null ? [...p.saran] : [],
    avatarTersedia: [...AVATAR_TERSEDIA],
  });
  kirimKe(o, sid, pesanStatus(k));
  for (const q of urutPemain(k)) if (berkeidentitas(q)) kirimKe(o, sid, pesanPemainBaru(q));
}

// ---------------------------------------------------------------------------------------------
// Peristiwa

/** Sambungan baru: `halo` harus datang dalam 10 detik; batas ini ikut menentukan alarm (P-15, P-40). */
export function sambunganMasuk(k: KeadaanRuang, sid: string, sekarang: number): void {
  k.sambungan.set(sid, null);
  k.batasHalo.set(sid, sekarang + BATAS.haloMs);
}

/** `halo` dari pemain: sambung ulang dengan token, atau pemain baru (P-19 sampai P-21, P-26, P-27). */
export function terimaHalo(
  k: KeadaanRuang,
  sid: string,
  pesan: Extract<PesanPemain, { t: "halo" }>,
  sekarang: number,
  acak: () => number,
  calon: CalonPemain,
  hashTokenMasuk: string | null,
  hashKodeMasukUlang: string | null = null,
): Keluaran {
  const o = keluaranKosong();
  if (!k.sambungan.has(sid)) k.sambungan.set(sid, null);
  if (k.sambungan.get(sid)) return o; // halo kedua diabaikan
  bersihkanTanpaIdentitas(k, o, sekarang);

  // JS-16b (P-14): kode masuk ulang dari guru memindahkan pemainnya ke sambungan ini dengan token baru. Pemeriksaan
  // terkunci, penuh, terlambat, dan nomor absen dilewati karena pemainnya sudah tercatat.
  if (pesan.kodeMasukUlang !== undefined) {
    if (pesan.token !== undefined || pesan.nomorAbsen !== undefined) {
      return tolakSambungan(k, o, sid, null, KODE_TUTUP.pelanggaran, "kode masuk ulang bersama token");
    }
    if (k.status === "ditutup") return tolakSambungan(k, o, sid, "RUANG_TIDAK_ADA", KODE_TUTUP.ditutup, "ruang ditutup");
    hapusKodeKedaluwarsa(k, o, sekarang);
    const cocok = hashKodeMasukUlang === null ? undefined : [...k.kodeMasukUlang].find(([, c]) => c.hash === hashKodeMasukUlang);
    const p = cocok ? k.pemain.get(cocok[0]) : undefined;
    if (!cocok || !p) {
      const salah = (k.salahMasukUlang.get(sid) ?? 0) + 1;
      k.salahMasukUlang.set(sid, salah);
      if (salah >= BATAS_SALAH_MASUK_ULANG) {
        return tolakSambungan(k, o, sid, "KODE_MASUK_ULANG_SALAH", KODE_TUTUP.pelanggaran, "kode masuk ulang salah");
      }
      kirimKe(o, sid, galat("KODE_MASUK_ULANG_SALAH"));
      k.batasHalo.set(sid, sekarang + 2 * 60_000); // waktu untuk mengetik ulang kode
      return o; // sambungan tetap terbuka; klien boleh mengirim halo lagi
    }
    k.kodeMasukUlang.delete(p.id); // sekali pakai
    o.simpan.push({ jenis: "hapus_kode_masuk_ulang", pemainId: p.id });
    if (p.dikeluarkan) return tolakSambungan(k, o, sid, "DIKELUARKAN", KODE_TUTUP.dikeluarkan, "dikeluarkan");
    const sidLama = k.sambunganPemain.get(p.id);
    if (sidLama !== undefined && sidLama !== sid) {
      o.tutup.push({ sambunganId: sidLama, kode: KODE_TUTUP.diganti, alasan: "diganti" });
      k.sambungan.delete(sidLama);
    }
    p.hashToken = calon.hashToken; // token perangkat lama tidak berlaku lagi
    ikat(k, o, sid, p);
    p.terhubung = true;
    p.terputusSejak = null;
    simpanPemain(o, p);
    sambutan(k, o, sid, p, calon.token, sekarang);
    kirimPosisiAwal(k, o, p, sid, sekarang);
    kirimKeadaanKejadian(k, o, p, sid, sekarang);
    o.kelas.push(pesanLobi(k));
    return o;
  }

  if (hashTokenMasuk !== null && pesan.token) {
    const lama = [...k.pemain.values()].find((p) => p.hashToken === hashTokenMasuk);
    if (lama) {
      if (lama.dikeluarkan) return tolakSambungan(k, o, sid, "DIKELUARKAN", KODE_TUTUP.dikeluarkan, "dikeluarkan");
      if (k.status === "ditutup") return tolakSambungan(k, o, sid, "RUANG_TIDAK_ADA", KODE_TUTUP.ditutup, "ruang ditutup");
      const sidLama = k.sambunganPemain.get(lama.id);
      if (sidLama !== undefined && sidLama !== sid) {
        o.tutup.push({ sambunganId: sidLama, kode: KODE_TUTUP.diganti, alasan: "diganti" });
        k.sambungan.delete(sidLama);
      }
      ikat(k, o, sid, lama);
      lama.terhubung = true;
      lama.terputusSejak = null;
      simpanPemain(o, lama);
      sambutan(k, o, sid, lama, pesan.token, sekarang);
      kirimPosisiAwal(k, o, lama, sid, sekarang);
      kirimKeadaanKejadian(k, o, lama, sid, sekarang);
      o.kelas.push(pesanLobi(k));
      return o;
    }
  }

  if (k.status === "ditutup") return tolakSambungan(k, o, sid, "RUANG_TIDAK_ADA", KODE_TUTUP.ditutup, "ruang ditutup");
  if (k.terkunci) return tolakSambungan(k, o, sid, "RUANG_TERKUNCI", KODE_TUTUP.ditolak, "terkunci");
  const jumlah = [...k.pemain.values()].filter((p) => !p.dikeluarkan).length;
  if (jumlah >= k.ruang.pengaturan.batasPemain) return tolakSambungan(k, o, sid, "RUANG_PENUH", KODE_TUTUP.ditolak, "penuh");
  if (terlambat(k, sekarang)) return tolakSambungan(k, o, sid, "TERLAMBAT", KODE_TUTUP.ditolak, "terlambat");

  let nomorAbsen: number | null = null;
  if (k.ruang.pengaturan.modeNomorAbsen) {
    if (pesan.nomorAbsen === undefined) return tolakSambungan(k, o, sid, null, KODE_TUTUP.pelanggaran, "nomor absen wajib");
    if ([...k.pemain.values()].some((p) => !p.dikeluarkan && p.nomorAbsen === pesan.nomorAbsen)) {
      kirimKe(o, sid, galat("NOMOR_ABSEN_DIPAKAI"));
      k.batasHalo.set(sid, sekarang + 2 * 60_000); // waktu untuk mengetik ulang nomor absen
      return o; // sambungan tetap terbuka; klien boleh mengirim halo lagi
    }
    nomorAbsen = pesan.nomorAbsen;
  }

  const p: PemainRuang = {
    id: calon.pemainId,
    hashToken: calon.hashToken,
    urutan: k.urutanBerikut++,
    nama: null,
    avatar: null,
    warnaTas: null,
    nomorAbsen,
    saran: pilihSaran(k, [], acak),
    terhubung: true,
    terputusSejak: null,
    posisi: null,
    dikeluarkan: false,
    gabungPada: sekarang,
  };
  k.pemain.set(p.id, p);
  ikat(k, o, sid, p);
  simpanPemain(o, p);
  sambutan(k, o, sid, p, calon.token, sekarang);
  return o;
}

/** JS-16b (P-12): masa berlaku kode masuk ulang dan batas kode salah per sambungan (D-2a). */
export const MASA_KODE_MASUK_ULANG_MS = 10 * 60_000;
export const BATAS_SALAH_MASUK_ULANG = 5;

function hapusKodeKedaluwarsa(k: KeadaanRuang, o: Keluaran, sekarang: number): void {
  for (const [pemainId, c] of k.kodeMasukUlang) {
    if (c.berlakuSampai > sekarang) continue;
    k.kodeMasukUlang.delete(pemainId);
    o.simpan.push({ jenis: "hapus_kode_masuk_ulang", pemainId });
  }
}

/** JS-16b (P-11, P-12): kode masuk ulang baru untuk satu pemain; kode lama pemain itu diganti. Hanya hash yang disimpan. */
export function aturKodeMasukUlang(k: KeadaanRuang, pemainId: string, hash: string, sekarang: number): Keluaran {
  const o = keluaranKosong();
  hapusKodeKedaluwarsa(k, o, sekarang);
  const berlakuSampai = sekarang + MASA_KODE_MASUK_ULANG_MS;
  k.kodeMasukUlang.set(pemainId, { hash, berlakuSampai });
  o.simpan.push({ jenis: "kode_masuk_ulang", pemainId, hash, berlakuSampai });
  return o;
}

/** Pesan pemain selain `halo` (P-17, P-22, P-23, P-41, P-42). */
export function terimaPemain(k: KeadaanRuang, sid: string, pesan: PesanPemain, sekarang: number, acak: () => number): Keluaran {
  const o = keluaranKosong();
  const pid = k.sambungan.get(sid);
  const p = pid ? k.pemain.get(pid) : undefined;
  if (!p) return tolakSambungan(k, o, sid, null, KODE_TUTUP.tanpaHalo, "perlu halo");
  switch (pesan.t) {
    case "minta_nama": {
      if (p.nama !== null) return o;
      p.saran = pilihSaran(k, p.saran, acak);
      simpanPemain(o, p);
      kirimKe(o, sid, { v: V, t: "saran_nama", saranNama: [...p.saran] });
      return o;
    }
    case "pilih_identitas": {
      if (p.nama !== null) return o;
      // JS-14 (P-42 sampai P-44): nama dari saran, atau nama buatan siswa di mode bebas.
      const periksa = periksaNamaPilihan(k, p, pesan.nama);
      if (periksa.galat !== undefined) {
        kirimKe(o, sid, galat(periksa.galat));
        if (periksa.galat === "NAMA_DITOLAK") {
          p.tolak = (p.tolak ?? 0) + 1;
          if (p.tolak === BATAS_TOLAK_NAMA && k.modeNama === "bebas") kirimKe(o, sid, { v: V, t: "mode_nama", modeNama: "daftar" });
        }
        p.saran = pilihSaran(k, p.saran, acak);
        simpanPemain(o, p);
        kirimKe(o, sid, { v: V, t: "saran_nama", saranNama: [...p.saran] });
        return o;
      }
      p.nama = periksa.nama;
      p.avatar = pesan.avatar;
      p.warnaTas = warnaTasBaru(k);
      p.saran = [];
      if (STATUS_DUNIA.includes(k.status)) siapkanGerak(k, p, sekarang);
      simpanPemain(o, p);
      o.kiriman.push(barisPeserta(k, p, null));
      kirimSemua(k, o, pesanPemainBaru(p));
      kirimPosisiAwal(k, o, p, sid, sekarang);
      k.peringkat = null;
      // JS-11 (P-13): sesudah ronde berakhir, pemain baru ikut peringkat akhir dan semua menerima `selesai` baru.
      if (k.status === "selesai" || k.status === "pembahasan") perbaruiPeringkatAkhir(k, o);
      else kirimKeadaanKejadian(k, o, p, sid, sekarang);
      o.kelas.push(pesanLobi(k));
      return o;
    }
    case "gerak": {
      if (p.nama === null || !STATUS_GERAK.includes(k.status) || !p.posisi) return o;
      const g = k.gerak.get(p.id) ?? siapkanGerak(k, p, sekarang);
      // JS-09 (P-21): kecepatan lari berlaku sampai 500 ms sesudah Lari cepat berakhir.
      const lari = k.status === "main" && lariBerlaku(k.skill.get(p.id)?.keadaan.aktifSampaiMs.lari, waktuRonde(k, sekarang));
      const dari = p.posisi;
      const hasil = periksaGerak({
        posisi: p.posisi,
        laporan: { x: pesan.x, y: pesan.y, arah: pesan.arah, seq: pesan.seq },
        seqTerakhir: g.seqTerakhir,
        dtMs: sekarang - g.gerakTerakhirMs,
        lari,
        status: k.status,
        dialogTerbuka: k.dialog.has(p.id),
        peta: gridUntuk(k),
        anggaranPx: g.anggaranPx,
      });
      if (hasil.diterima) {
        p.posisi = { x: hasil.x, y: hasil.y, arah: hasil.arah };
        g.seqTerakhir = hasil.seq;
        g.gerakTerakhirMs = sekarang;
        g.anggaranPx = hasil.anggaranPx ?? 0;
        g.jalan = pesan.jalan;
        g.berubah = true;
        // JS-09 (P-16): kotak yang dilewati ruas dari posisi sah sebelumnya ke posisi baru, hanya di status `main`.
        if (k.status === "main") ambilKotakGerak(k, o, p, sid, dari, p.posisi, sekarang);
        // Lobi dan hitung mundur tanpa putaran: `dunia` mengikuti gerak yang masuk (P-47).
        if (k.status !== "main") {
          const jeda = k.duniaLobiTerakhir === null ? Infinity : sekarang - k.duniaLobiTerakhir;
          if (jeda >= (pesan.jalan ? DUNIA_LOBI.jedaMs : DUNIA_LOBI.jedaBerhentiMs)) kirimDuniaLobi(k, o, sekarang);
        }
        return o;
      }
      const isi = koreksi(hasil);
      if (isi) {
        kirimKe(o, sid, { v: V, t: "koreksi", ...isi });
        o.koreksi++;
        o.alasanKoreksi = hasil.alasan;
      }
      return o;
    }
    case "ping":
      kirimKe(o, sid, { v: V, t: "pong", tKlien: pesan.tKlien, waktuServer: sekarang });
      // JS-15 (P-24): perubahan lobi yang tertahan jarak kiriman ikut terkirim saat `ping` berikutnya dari siapa pun.
      if (k.status === "lobi" || k.status === "hitung_mundur") kirimDuniaLobiTertunda(k, o, sekarang);
      return o;
    case "periksa":
      terimaPeriksa(k, o, p, sid, pesan.kejadianId, sekarang);
      return o;
    case "kunci_1":
    case "kunci_2":
      terimaKunci(k, o, p, sid, pesan.t === "kunci_1" ? 1 : 2, pesan.kejadianId, pesan.opsiId, sekarang);
      return o;
    case "tutup_dialog":
      // P-33: menutup dialog kejadian itu tanpa mengubah jawaban; pesan untuk kejadian lain diabaikan.
      if (k.dialog.get(p.id) === pesan.kejadianId) tutupDialog(k, o, p.id);
      return o;
    case "pakai_skill":
      terimaPakaiSkill(k, o, p, sid, pesan.skill, pesan.kejadianId, sekarang);
      return o;
    default:
      return o; // halo kedua dan ambil_kotak (JS-09, P-17: kotak hanya diambil dari ruas gerak)
  }
}

/** Sambungan putus (P-28). Pemain lain tidak menerima pemain_pergi. */
export function sambunganPutus(k: KeadaanRuang, sid: string, sekarang: number): Keluaran {
  const o = keluaranKosong();
  if (!k.sambungan.has(sid)) return o;
  const pid = k.sambungan.get(sid);
  k.sambungan.delete(sid);
  k.batasHalo.delete(sid);
  k.salahMasukUlang.delete(sid);
  if (pid && k.sambunganPemain.get(pid) === sid) {
    // Sambungan putus menutup dialog pemain itu; status jawabannya tetap (P-36).
    if (k.dialog.delete(pid)) tandaiBerubah(k, pid);
    k.sambunganPemain.delete(pid);
    const p = k.pemain.get(pid);
    if (p) {
      p.terhubung = false;
      p.terputusSejak = sekarang;
      simpanPemain(o, p);
      o.kelas.push(pesanLobi(k));
    }
  }
  if (k.sambungan.size === 0) {
    k.sambunganTerakhirPutus = sekarang;
    simpanMeta(o, "sambunganTerakhirPutus", sekarang);
  }
  return o;
}

/**
 * Ronde selesai (P-35): semua dialog ditutup (langkah yang belum dikunci tidak dihitung), peringkat akhir dihitung
 * dari skor, baris peserta beserta peringkat akhirnya diantrekan, lalu setiap pemain yang tersambung menerima
 * `selesai`. Pemain yang dikeluarkan tidak masuk peringkat, tetapi jawabannya tetap terkirim.
 */
function akhiriRonde(k: KeadaanRuang, o: Keluaran, sekarang: number): void {
  for (const pid of [...k.dialog.keys()]) tutupDialog(k, o, pid);
  k.status = "selesai";
  k.waktu.jedaSejak = null;
  k.waktu.selesaiPada = sekarang;
  o.putaran = "henti";
  antrekanPesertaAkhir(k, o);
  ubahStatus(k, o);
  kirimPapanKelas(k, o, true); // JS-10, P-18
  kirimSelesaiSemua(k, o);
  o.tulisRingkasan = true; // JS-11, P-14
  o.kirimSekarang = true;
}

function tutupRuang(k: KeadaanRuang, o: Keluaran, sekarang: number): void {
  // JS-11 (P-12): server menutup ruang di tengah ronde (tutup otomatis, penghapusan paksa, atau berhenti paksa). Dialog
  // ditutup dan peringkat akhir diantrekan lebih dulu, tanpa `selesai`.
  const diTengahRonde = k.status === "main" || k.status === "jeda";
  if (diTengahRonde) for (const pid of [...k.dialog.keys()]) tutupDialog(k, o, pid);
  k.status = "ditutup";
  k.ditutupPada = sekarang;
  k.waktu.jedaSejak = null;
  if (k.waktu.selesaiPada === null) k.waktu.selesaiPada = sekarang;
  if (diTengahRonde) antrekanPesertaAkhir(k, o);
  o.putaran = "henti";
  simpanMeta(o, "ditutupPada", sekarang);
  ubahStatus(k, o);
  for (const sid of [...k.sambungan.keys()]) o.tutup.push({ sambunganId: sid, kode: KODE_TUTUP.ditutup, alasan: "ruang ditutup" });
  k.sambungan.clear();
  k.sambunganPemain.clear();
  k.batasHalo.clear();
  for (const p of k.pemain.values()) p.terhubung = false;
  o.kirimSekarang = true;
}

function keluarkan(k: KeadaanRuang, o: Keluaran, pemainId: string): void {
  const p = k.pemain.get(pemainId);
  if (!p || p.dikeluarkan) return;
  tutupDialog(k, o, pemainId);
  p.dikeluarkan = true;
  p.terhubung = false;
  k.peringkat = null;
  const sid = k.sambunganPemain.get(pemainId);
  if (sid !== undefined) {
    kirimKe(o, sid, galat("DIKELUARKAN"));
    o.tutup.push({ sambunganId: sid, kode: KODE_TUTUP.dikeluarkan, alasan: "dikeluarkan" });
    k.sambungan.delete(sid);
    k.sambunganPemain.delete(pemainId);
  }
  simpanPemain(o, p);
  if (p.nama !== null) {
    kirimSemua(k, o, { v: V, t: "pemain_pergi", id: p.id });
    // JS-11 (P-13): tanda `dikeluarkan` ke D1 di status apa pun; sesudah ronde berakhir, peringkat akhir dihitung ulang.
    if (k.status === "selesai" || k.status === "pembahasan") perbaruiPeringkatAkhir(k, o);
    else o.kiriman.push(barisPeserta(k, p, null));
  }
  o.kelas.push(pesanLobi(k));
}

/** Pesan layar kelas (P-32 sampai P-39). Di JS-03 datang dari uji dan kait uji lokal. */
export function terimaKelas(k: KeadaanRuang, pesan: PesanKelas, sekarang: number, acak: () => number = () => 0): Keluaran {
  const o = keluaranKosong();
  switch (pesan.t) {
    case "mulai": {
      if (k.status !== "lobi") return o;
      const mulaiPada = sekarang + WAKTU.hitungMundurMs;
      k.status = "hitung_mundur";
      k.waktu = { mulaiPada, berakhirPada: mulaiPada + k.ruang.pengaturan.durasiMenit * 60_000, jedaSejak: null, jedaMs: 0, selesaiPada: null, riwayatJeda: [] };
      for (const p of k.pemain.values()) if (berkeidentitas(p)) siapkanGerak(k, p, sekarang);
      ubahStatus(k, o);
      return o;
    }
    case "jeda": {
      if (k.status !== "main") return o;
      k.status = "jeda";
      k.waktu.jedaSejak = sekarang;
      o.putaran = "henti";
      ubahStatus(k, o);
      return o;
    }
    case "lanjut": {
      if (k.status !== "jeda" || k.waktu.jedaSejak === null) return o;
      const lama = sekarang - k.waktu.jedaSejak;
      k.waktu.berakhirPada = (k.waktu.berakhirPada ?? sekarang) + lama;
      k.waktu.jedaMs += lama;
      k.waktu.riwayatJeda = [...(k.waktu.riwayatJeda ?? []), { sejak: k.waktu.jedaSejak, lama }];
      k.waktu.jedaSejak = null;
      k.status = "main";
      for (const g of k.gerak.values()) g.gerakTerakhirMs = sekarang;
      o.putaran = "mulai";
      ubahStatus(k, o);
      kirimPribadiSemua(k, o, sekarang);
      return o;
    }
    case "tambah_waktu": {
      if ((k.status !== "main" && k.status !== "jeda") || k.waktu.berakhirPada === null) return o;
      k.waktu.berakhirPada += pesan.detik * 1000;
      ubahStatus(k, o);
      return o;
    }
    case "akhiri":
      if (k.status === "main" || k.status === "jeda") akhiriRonde(k, o, sekarang);
      return o;
    case "kunci_ruang":
      if (k.status !== "ditutup") {
        k.terkunci = pesan.kunci;
        simpanMeta(o, "terkunci", k.terkunci);
        if (k.tautan !== null) o.kelas.push(pesanInfoKelas(k, sekarang)); // JS-10, P-17
      }
      return o;
    case "keluarkan":
      keluarkan(k, o, pesan.pemainId);
      return o;
    case "ganti_nama": // JS-14 (P-46)
      gantiNama(k, o, pesan.pemainId, acak);
      return o;
    case "ganti_semua_nama": // JS-14 (P-48)
      gantiSemuaNama(k, o, sekarang, acak);
      return o;
    case "tutup_ruang":
      // JS-10 (P-10): ruang yang belum dimulai juga bisa ditutup.
      if (k.status === "lobi" || k.status === "selesai" || k.status === "pembahasan") tutupRuang(k, o, sekarang);
      return o;
    case "pembahasan": {
      // JS-10 (P-22): status menjadi `pembahasan`, lalu sebaran pilihan kelas untuk kejadian itu.
      const kj = k.kejadian.find((x) => x.kode === pesan.kejadianId);
      if (!kj || (k.status !== "selesai" && k.status !== "pembahasan")) return o;
      if (k.status === "selesai") {
        k.status = "pembahasan";
        ubahStatus(k, o);
      }
      o.kelas.push(pesanDataPembahasan(k, kj));
      return o;
    }
    default:
      return o; // halo
  }
}

/**
 * Putaran 100 ms selama status `main`: `dunia` berisi paling banyak 24 pemain terdekat yang berubah (P-43),
 * dan setiap putaran ke-10 berupa kerangka penuh yang juga memuat pemain yang tidak berubah (JS-07, P-48, P-51).
 * Sejak JS-08 juga keterlihatan kejadian (P-10, P-11) dan `pribadi` karena peringkat berubah (P-56).
 */
export function putaran(k: KeadaanRuang, sekarang: number): Keluaran {
  const o = keluaranKosong();
  if (k.status !== "main") {
    o.putaran = "henti";
    return o;
  }
  k.putaranKe++;
  const penuh = k.putaranKe % KERANGKA_PENUH_SETIAP === 0;
  const aktif = pemainAktif(k);
  const berubah = aktif.filter((p) => k.gerak.get(p.id)?.berubah);
  if (berubah.length > 0 || penuh) {
    for (const p of aktif) {
      const sid = k.sambunganPemain.get(p.id);
      if (sid === undefined) continue;
      const isi = isiDunia(k, p, penuh ? aktif : berubah);
      if (penuh) k.kerangkaTerakhir.set(p.id, sekarang);
      if (isi.length === 0) continue;
      kirimKe(o, sid, { v: V, t: "dunia", w: sekarang, p: isi, n: aktif.length });
    }
    for (const q of berubah) {
      const g = k.gerak.get(q.id);
      if (g) g.berubah = false;
    }
  }
  periksaKeterlihatan(k, o, aktif, sekarang);
  periksaKompas(k, o, aktif, sekarang); // JS-09, P-25
  jadwalPribadi(k, o, sekarang);
  // JS-10: peta kelas 2 kali per detik (P-20), papan dan kemajuan paling sering sekali per detik (P-18, P-19).
  if (k.putaranKe % DUNIA_KELAS_SETIAP === 0) o.kelas.push(pesanDuniaKelas(k, sekarang));
  if (k.putaranKe % PAPAN_KELAS_SETIAP === 0) kirimPapanKelas(k, o, false);
  return o;
}

/**
 * Kait uji lokal `pindahkan` (JS-08, P-67): pemain bernama `nama` dipindah ke ubin (x, y), titik kaki
 * (16x + 8, 16y + 12), bila sel itu bebas di grid status sekarang; pemain menerima `koreksi` dengan `seq` gerak
 * terakhirnya. Dipensiunkan di JS-10.
 */
export function pindahkanPemain(k: KeadaanRuang, nama: string, x: number, y: number, sekarang: number): Keluaran | "tidak_ada" | "padat" {
  const p = [...k.pemain.values()].find((q) => q.nama === nama && berkeidentitas(q));
  if (!p || !p.posisi) return "tidak_ada";
  const tujuan = { x: x * UKURAN_UBIN + UKURAN_UBIN / 2, y: y * UKURAN_UBIN + 12 };
  if (!posisiSah(gridUntuk(k), tujuan.x, tujuan.y)) return "padat";
  const o = keluaranKosong();
  const g = siapkanGerak(k, p, sekarang);
  p.posisi = { ...tujuan, arah: p.posisi.arah };
  g.berubah = true;
  g.anggaranPx = 0;
  const sid = k.sambunganPemain.get(p.id);
  if (sid !== undefined) kirimKe(o, sid, { v: V, t: "koreksi", x: tujuan.x, y: tujuan.y, seq: Math.max(0, g.seqTerakhir) });
  return o;
}

/** Titik aktif setiap kejadian ruang (kait uji lokal `kejadian`, JS-08, P-66). */
export function titikKejadianRuang(k: KeadaanRuang): { kejadianId: string; titik: { x: number; y: number }[] }[] {
  return k.kejadian.map((kj) => ({ kejadianId: kj.kode, titik: kj.titik.map((t) => ({ x: t.x, y: t.y })) }));
}

/** Alarm: hitung mundur selesai, waktu habis, tutup otomatis, dan hapus penyimpanan (P-32 sampai P-36). */
export function alarm(k: KeadaanRuang, sekarang: number, antreanKosong: boolean): Keluaran {
  const o = keluaranKosong();
  for (const [sid, batas] of [...k.batasHalo]) {
    if (batas > sekarang) continue;
    k.batasHalo.delete(sid);
    if (k.sambungan.get(sid) !== null) continue;
    k.sambungan.delete(sid);
    o.tutup.push({ sambunganId: sid, kode: KODE_TUTUP.tanpaHalo, alasan: "perlu halo" });
    if (k.sambungan.size === 0) {
      k.sambunganTerakhirPutus = sekarang;
      simpanMeta(o, "sambunganTerakhirPutus", sekarang);
    }
  }
  if (k.status === "hitung_mundur" && k.waktu.mulaiPada !== null && sekarang >= k.waktu.mulaiPada) {
    k.status = "main";
    // Putaran pertama `main` mengirim semua pemain ke semua pemain di kotaknya.
    for (const p of k.pemain.values()) if (berkeidentitas(p)) siapkanGerak(k, p, sekarang).berubah = true;
    k.putaranKe = 0;
    o.putaran = "mulai";
    ubahStatus(k, o);
    kirimPribadiSemua(k, o, sekarang);
  }
  if (k.status === "main" && k.waktu.berakhirPada !== null && sekarang >= k.waktu.berakhirPada) akhiriRonde(k, o, sekarang);
  if (k.status !== "ditutup") {
    const kosongLama =
      k.sambungan.size === 0 && k.sambunganTerakhirPutus !== null && sekarang >= k.sambunganTerakhirPutus + WAKTU.tutupTanpaSambunganMs;
    if (sekarang >= k.ruang.dibuatPada + WAKTU.tutupSejakDibuatMs || kosongLama) tutupRuang(k, o, sekarang);
  } else if (k.ditutupPada !== null && sekarang >= k.ditutupPada + WAKTU.hapusSesudahTutupMs && antreanKosong) {
    o.hapusSemua = true;
  }
  // JS-22 (P-5): penyimpanan dihapus paling lambat 7 hari sesudah ruang dibuat, walau antrean kiriman belum kosong.
  if (sekarang >= k.ruang.dibuatPada + HAPUS_PAKSA_MS) {
    if (k.status !== "ditutup") tutupRuang(k, o, sekarang);
    o.hapusSemua = true;
  }
  return o;
}

/** Tenggat terdekat untuk satu-satunya alarm Durable Object (P-40); null bila tidak ada. */
export function tenggatBerikut(k: KeadaanRuang, antreanKosong: boolean): number | null {
  const t: number[] = [...k.batasHalo.values()];
  if (k.status === "hitung_mundur" && k.waktu.mulaiPada !== null) t.push(k.waktu.mulaiPada);
  if (k.status === "main" && k.waktu.berakhirPada !== null) t.push(k.waktu.berakhirPada);
  if (k.status !== "ditutup") {
    t.push(k.ruang.dibuatPada + WAKTU.tutupSejakDibuatMs);
    if (k.sambungan.size === 0 && k.sambunganTerakhirPutus !== null) t.push(k.sambunganTerakhirPutus + WAKTU.tutupTanpaSambunganMs);
  } else if (k.ditutupPada !== null && antreanKosong) {
    t.push(k.ditutupPada + WAKTU.hapusSesudahTutupMs);
  }
  t.push(k.ruang.dibuatPada + HAPUS_PAKSA_MS); // JS-22, P-5
  return t.length > 0 ? Math.min(...t) : null;
}

// ---------------------------------------------------------------------------------------------
// Layar kelas (spesifikasi JS-10, P-13 dan P-17 sampai P-22)

/** `dunia_kelas` dikirim setiap putaran ke-5 (2 kali per detik); `papan` dan `kemajuan` diperiksa setiap putaran ke-10. */
export const DUNIA_KELAS_SETIAP = 5;
export const PAPAN_KELAS_SETIAP = 10;
const PAPAN_KELAS_ISI = 10;

/** Pemain yang dihitung untuk layar kelas: berkeidentitas dan tidak dikeluarkan, menurut urutan bergabung. */
function pemainKelas(k: KeadaanRuang): PemainRuang[] {
  return urutPemain(k).filter(berkeidentitas);
}

function pesanStatusKelas(k: KeadaanRuang): PesanServerKelas {
  return { v: V, t: "status_ruang", status: k.status, mulaiPada: k.waktu.mulaiPada, berakhirPada: k.waktu.berakhirPada, jedaSejak: k.waktu.jedaSejak };
}

/** P-17. Hanya dipanggil bila `k.tautan` sudah diisi sambungan kelas. */
export function pesanInfoKelas(k: KeadaanRuang, sekarang: number): PesanServerKelas {
  return {
    v: V,
    t: "info_kelas",
    labelKelas: k.ruang.labelKelas ?? "Ruang",
    kode: k.ruang.kode,
    tautan: k.tautan ?? "",
    durasiMenit: k.ruang.pengaturan.durasiMenit,
    batasPemain: k.ruang.pengaturan.batasPemain,
    uji: k.ruang.pengaturan.uji,
    terkunci: k.terkunci,
    modeNama: k.modeNama, // JS-14 (P-57)
    waktuServer: sekarang,
    jumlahKejadian: k.kejadian.length,
    kejadian: k.kejadian.map((kj) => ({ id: kj.kode, judul: kj.isi.judul, zona: Number(kj.isi.zona.slice(1)) })),
  };
}

function jumlahSelesai(k: KeadaanRuang, pemainId: string): number {
  let n = 0;
  for (const j of k.jawaban.get(pemainId)?.values() ?? []) if (j.status === "selesai") n++;
  return n;
}

/** P-18: 10 besar menurut peringkat ruang (JS-08), dengan jumlah kejadian yang kedua langkahnya selesai. */
export function pesanPapanKelas(k: KeadaanRuang): PesanServerKelas {
  const peringkat = peringkatRuang(k);
  const daftar = pemainKelas(k)
    .map((p) => ({ p, r: peringkat.get(p.id) ?? Number.MAX_SAFE_INTEGER }))
    .sort((a, b) => a.r - b.r || a.p.urutan - b.p.urutan);
  return {
    v: V,
    t: "papan",
    pemain: daftar.slice(0, PAPAN_KELAS_ISI).map(({ p, r }) => ({
      id: p.id,
      nama: p.nama ?? "",
      avatar: p.avatar ?? 0,
      warnaTas: p.warnaTas ?? "sun",
      skor: skorDari(k, p.id).skor,
      peringkat: r,
      selesai: jumlahSelesai(k, p.id),
    })),
    jumlahPemain: daftar.length,
  };
}

/** P-19: jawaban yang kedua langkahnya selesai, dibanding pemain × kejadian ruang. */
export function pesanKemajuan(k: KeadaanRuang): PesanServerKelas {
  const pemain = pemainKelas(k);
  const terjawab = pemain.reduce((n, p) => n + jumlahSelesai(k, p.id), 0);
  return { v: V, t: "kemajuan", terjawab, kemungkinan: pemain.length * k.kejadian.length };
}

/** P-20: posisi semua pemain berkeidentitas yang punya posisi, dibulatkan ke piksel. */
export function pesanDuniaKelas(k: KeadaanRuang, sekarang: number): PesanServerKelas {
  const p: [string, number, number, boolean][] = [];
  for (const q of pemainKelas(k)) if (q.posisi) p.push([q.id, Math.round(q.posisi.x), Math.round(q.posisi.y), q.terhubung]);
  return { v: V, t: "dunia_kelas", w: sekarang, p: p.slice(0, 100) };
}

/** `papan` dan `kemajuan` ke layar kelas bila isinya berubah, atau selalu bila `paksa` (ronde selesai). */
function kirimPapanKelas(k: KeadaanRuang, o: Keluaran, paksa: boolean): void {
  const papan = pesanPapanKelas(k);
  const teksPapan = JSON.stringify(papan);
  if (paksa || teksPapan !== k.papanTerakhir) {
    k.papanTerakhir = teksPapan;
    o.kelas.push(papan);
  }
  const kemajuan = pesanKemajuan(k);
  const teksKemajuan = JSON.stringify(kemajuan);
  if (paksa || teksKemajuan !== k.kemajuanTerakhir) {
    k.kemajuanTerakhir = teksKemajuan;
    o.kelas.push(kemajuan);
  }
}

/** P-22: sebaran pilihan kelas untuk satu kejadian, menurut urutan asli opsi; pemain yang dikeluarkan tidak dihitung. */
export function pesanDataPembahasan(k: KeadaanRuang, kj: KejadianRuang): PesanServerKelas {
  const hitung1 = new Map<string, number>();
  const hitung2 = new Map<string, number>();
  for (const p of pemainKelas(k)) {
    const j = k.jawaban.get(p.id)?.get(kj.kode);
    if (!j) continue;
    if (j.langkah1Opsi) hitung1.set(j.langkah1Opsi, (hitung1.get(j.langkah1Opsi) ?? 0) + 1);
    if (j.langkah2Opsi) hitung2.set(j.langkah2Opsi, (hitung2.get(j.langkah2Opsi) ?? 0) + 1);
  }
  const isi = kj.isi;
  return {
    v: V,
    t: "data_pembahasan",
    kejadianId: kj.kode,
    judul: isi.judul,
    situasi: isi.situasi,
    pertanyaan1: isi.langkah1.pertanyaan,
    opsi1: isi.langkah1.opsi.map((x) => ({ id: x.id, teks: x.teks, benar: x.benar, jumlah: hitung1.get(x.id) ?? 0 })),
    pertanyaan2: isi.langkah2.pertanyaan,
    opsi2: isi.langkah2.opsi.map((x) => ({ id: x.id, teks: x.teks, tingkat: x.tingkat, terjadi: x.terjadi, jumlah: hitung2.get(x.id) ?? 0 })),
    kartu: { hak: isi.kartu.hak, kewajiban: isi.kartu.kewajiban, rujukan: kj.rujukan },
  };
}

/**
 * Sambutan layar kelas sesudah `halo` (P-13): `info_kelas`, `status_ruang`, lalu `lobi` (lobi dan hitung mundur)
 * atau `papan`, `kemajuan`, dan `dunia_kelas` (status lain).
 */
export function sambutanKelas(k: KeadaanRuang, tautan: string, sekarang: number): Keluaran {
  const o = keluaranKosong();
  k.tautan = tautan;
  o.kelas.push(pesanInfoKelas(k, sekarang), pesanStatusKelas(k));
  if (k.status === "lobi" || k.status === "hitung_mundur") o.kelas.push(pesanLobi(k));
  else {
    kirimPapanKelas(k, o, true);
    o.kelas.push(pesanDuniaKelas(k, sekarang));
  }
  return o;
}

/** JS-22 (P-6): menutup ruang apa pun statusnya, untuk berhenti paksa (anggaran alarm dan darurat). */
export function tutupPaksa(k: KeadaanRuang, sekarang: number): Keluaran {
  const o = keluaranKosong();
  if (k.status !== "ditutup") tutupRuang(k, o, sekarang);
  return o;
}
