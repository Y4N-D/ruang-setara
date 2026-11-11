// Logika ruang Jejak Setara (spesifikasi JS-03, bagian D sampai H; Architecture 7 dan JA-11).
// Murni: tanpa API Workers, jam, atau acak langsung. Pembungkus (RuangJejak.ts) memberi `sekarang`,
// fungsi `acak`, dan id baru, lalu menjalankan Keluaran: pesan, penutupan, penyimpanan, dan kiriman ke D1.
// JS-07: pemain berjalan di halaman lobi (P-45, P-47), kerangka penuh `dunia` (P-48), posisi awal lewat
// `koreksi` (P-49), dan pemeriksaan gerak dengan anggaran jarak (P-52).
// JS-08: kejadian (keterlihatan, periksa, dialog dua langkah, kunci, skor, peringkat, `pribadi`, `selesai`), tanda
// `dialog` di butir `dunia`, dan protokol versi 2 (spesifikasi JS-08, P-10 sampai P-37, P-55, P-56, P-63, P-64).
import { BATAS, hitungPeringkat } from "../../../../app/jejak-setara/inti/aturan";
import { koreksi, periksaGerak, posisiSah, STATUS_GERAK } from "../../../../app/jejak-setara/inti/gerak";
import { UKURAN_UBIN } from "../../../../app/jejak-setara/inti/peta";
import { PROTOKOL_VERSI, type KodeGalat, type PesanKelas, type PesanPemain, type PesanServerKelas, type PesanServerPemain } from "../../../../app/jejak-setara/inti/protokol";
import type { Arah, KejadianRuang, PengaturanRuang, StatusRuang, TitikPeta, WarnaTas } from "../../../../app/jejak-setara/inti/tipe";
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
  pesanTerbuka,
  pesanTerlihat,
  titikBaruTerlihat,
  titikDalamJangkauan,
  type BarisJawabanD1,
  type JawabanRuang,
  type SkorPemain,
} from "./kejadian-ruang";
import { NAMA_SAMARAN } from "./nama-samaran";

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
/** Kiriman `dunia` di lobi dan hitung mundur (JS-07): jarak antarkiriman dan jarak antar-kerangka penuh. */
export const DUNIA_LOBI = { jedaMs: 100, kerangkaPenuhMs: 1000 } as const;
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
}

export interface PetaRuang {
  versi: number;
  lebar: number;
  tinggi: number;
  tabrakan: Uint8Array;
  /** Grid lobi: tabrakan dengan sel gerbangLobi padat, dipakai di `lobi` dan `hitung_mundur` (JS-07, P-46). */
  tabrakanLobi: Uint8Array;
  titikMuncul: readonly { x: number; y: number }[];
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
  urutanBerikut: number;
  // Hanya di memori (JS-07): waktu kiriman `dunia` lobi terakhir, kerangka penuh terakhir per pemain,
  // dan nomor putaran `main`.
  duniaLobiTerakhir: number | null;
  kerangkaTerakhir: Map<string, number>;
  putaranKe: number;
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
}

export type KunciMeta = "ruang" | "status" | "waktu" | "terkunci" | "ditutupPada" | "sambunganTerakhirPutus";
export type Simpanan =
  | { jenis: "pemain"; pemain: PemainRuang }
  | { jenis: "hapus_pemain"; id: string }
  | { jenis: "meta"; kunci: KunciMeta; nilai: unknown }
  | { jenis: "jawaban"; jawaban: JawabanRuang } // JS-08, P-61
  | { jenis: "terlihat"; pemainId: string; titikId: string; kode: string; pada: number }; // JS-08, P-61

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
    urutanBerikut: 1,
    duniaLobiTerakhir: null,
    kerangkaTerakhir: new Map(),
    putaranKe: 0,
    kejadian: [...kejadian],
    jawaban: new Map(),
    skor: new Map(),
    terlihat: new Map(),
    dialog: new Map(),
    pribadiTerakhir: new Map(),
    peringkat: null,
  };
}

export interface DataPulih {
  ruang: DataRuang;
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
    },
  };
}

function barisRuang(k: KeadaanRuang): BarisKiriman {
  return { jenis: "ruang", isi: { ruangId: k.ruang.ruangId, status: k.status, mulaiPada: k.waktu.mulaiPada, selesaiPada: k.waktu.selesaiPada } };
}

/** Simpan status dan waktu, kirim status_ruang ke semua, dan antrekan baris ruang untuk D1. */
function ubahStatus(k: KeadaanRuang, o: Keluaran): void {
  simpanMeta(o, "status", k.status);
  simpanMeta(o, "waktu", k.waktu);
  kirimSemua(k, o, pesanStatus(k));
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

function pesanPribadi(k: KeadaanRuang, p: PemainRuang): Extract<PesanServerPemain, { t: "pribadi" }> {
  const jaw = k.jawaban.get(p.id);
  const lihat = k.terlihat.get(p.id);
  return {
    v: V,
    t: "pribadi",
    skor: skorDari(k, p.id).skor,
    peringkat: peringkatRuang(k).get(p.id) ?? 1,
    selesai: k.kejadian.filter((kj) => jaw?.get(kj.kode)?.status === "selesai").map((kj) => kj.kode),
    terlihat: k.kejadian.filter((kj) => kj.titik.some((t) => lihat?.has(t.id))).map((kj) => kj.kode),
    muatan: { lari: 0, kompas: 0, petunjuk: 0, teropong: 0, angkot: 0 },
    aktifSampai: {},
    kotakMenunggu: [],
  };
}

function kirimPribadi(k: KeadaanRuang, o: Keluaran, p: PemainRuang, sid: string, sekarang: number): void {
  const pesan = pesanPribadi(k, p);
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
  return { v: V, t: "selesai", skor: skorDari(k, p.id).skor, peringkat: peringkat.get(p.id) ?? 1, jumlahPemain: Math.max(1, peringkat.size), rekap: [] };
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
  o.kiriman.push({ jenis: "jawaban", isi: barisJawabanD1(k.ruang.ruangId, kj, j) });
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

/** Pesan pembukaan (P-28): `kejadian_terbuka`, lalu ulangan `hasil_1` bila Langkah 1 sudah dikunci (KT-13). */
function kirimPembukaan(o: Keluaran, sid: string, kj: KejadianRuang, j: JawabanRuang): void {
  kirimKe(o, sid, pesanTerbuka(kj, j));
  if (j.status !== "langkah1") kirimKe(o, sid, pesanHasil1(kj, j));
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
    if (terbuka === kj.kode && j) kirimPembukaan(o, sid, kj, j);
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
  kirimPembukaan(o, sid, kj, j);
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
  }
  kirimPribadi(k, o, p, sid, sekarang);
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

/** Tiga saran nama yang belum dipakai dan, bila masih cukup, tidak sama dengan saran sebelumnya (P-22). */
export function pilihSaran(k: KeadaanRuang, sebelumnya: readonly string[], acak: () => number): string[] {
  const dipakai = new Set<string>();
  for (const p of k.pemain.values()) if (p.nama !== null) dipakai.add(p.nama);
  let calon = NAMA_SAMARAN.filter((n) => !dipakai.has(n) && !sebelumnya.includes(n));
  if (calon.length < 3) calon = NAMA_SAMARAN.filter((n) => !dipakai.has(n));
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
    pengaturan: k.ruang.pengaturan,
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
): Keluaran {
  const o = keluaranKosong();
  if (!k.sambungan.has(sid)) k.sambungan.set(sid, null);
  if (k.sambungan.get(sid)) return o; // halo kedua diabaikan
  bersihkanTanpaIdentitas(k, o, sekarang);

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
      const dipakai = [...k.pemain.values()].some((q) => q.id !== p.id && q.nama === pesan.nama);
      if (!p.saran.includes(pesan.nama) || dipakai) {
        kirimKe(o, sid, galat("NAMA_DIPAKAI"));
        p.saran = pilihSaran(k, p.saran, acak);
        simpanPemain(o, p);
        kirimKe(o, sid, { v: V, t: "saran_nama", saranNama: [...p.saran] });
        return o;
      }
      p.nama = pesan.nama;
      p.avatar = pesan.avatar;
      p.warnaTas = warnaTasBaru(k);
      p.saran = [];
      if (STATUS_DUNIA.includes(k.status)) siapkanGerak(k, p, sekarang);
      simpanPemain(o, p);
      o.kiriman.push(barisPeserta(k, p, null));
      kirimSemua(k, o, pesanPemainBaru(p));
      kirimPosisiAwal(k, o, p, sid, sekarang);
      k.peringkat = null;
      kirimKeadaanKejadian(k, o, p, sid, sekarang);
      o.kelas.push(pesanLobi(k));
      return o;
    }
    case "gerak": {
      if (p.nama === null || !STATUS_GERAK.includes(k.status) || !p.posisi) return o;
      const g = k.gerak.get(p.id) ?? siapkanGerak(k, p, sekarang);
      const hasil = periksaGerak({
        posisi: p.posisi,
        laporan: { x: pesan.x, y: pesan.y, arah: pesan.arah, seq: pesan.seq },
        seqTerakhir: g.seqTerakhir,
        dtMs: sekarang - g.gerakTerakhirMs,
        lari: false,
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
        // Lobi dan hitung mundur tanpa putaran: `dunia` mengikuti gerak yang masuk (P-47).
        if (k.status !== "main") {
          const jeda = k.duniaLobiTerakhir === null ? Infinity : sekarang - k.duniaLobiTerakhir;
          if (!pesan.jalan || jeda >= DUNIA_LOBI.jedaMs) kirimDuniaLobi(k, o, sekarang);
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
    default:
      return o; // halo kedua, pakai_skill, ambil_kotak (JS-09)
  }
}

/** Sambungan putus (P-28). Pemain lain tidak menerima pemain_pergi. */
export function sambunganPutus(k: KeadaanRuang, sid: string, sekarang: number): Keluaran {
  const o = keluaranKosong();
  if (!k.sambungan.has(sid)) return o;
  const pid = k.sambungan.get(sid);
  k.sambungan.delete(sid);
  k.batasHalo.delete(sid);
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
  k.peringkat = null;
  const peringkat = peringkatRuang(k);
  for (const p of urutPemain(k)) {
    if (p.nama === null) continue;
    o.kiriman.push(barisPeserta(k, p, p.dikeluarkan ? null : (peringkat.get(p.id) ?? null)));
  }
  ubahStatus(k, o);
  for (const p of urutPemain(k)) {
    const sid = k.sambunganPemain.get(p.id);
    if (sid !== undefined && berkeidentitas(p)) kirimKe(o, sid, pesanSelesai(k, p));
  }
  o.kirimSekarang = true;
}

function tutupRuang(k: KeadaanRuang, o: Keluaran, sekarang: number): void {
  k.status = "ditutup";
  k.ditutupPada = sekarang;
  k.waktu.jedaSejak = null;
  if (k.waktu.selesaiPada === null) k.waktu.selesaiPada = sekarang;
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
  if (p.nama !== null) kirimSemua(k, o, { v: V, t: "pemain_pergi", id: p.id });
  o.kelas.push(pesanLobi(k));
}

/** Pesan layar kelas (P-32 sampai P-39). Di JS-03 datang dari uji dan kait uji lokal. */
export function terimaKelas(k: KeadaanRuang, pesan: PesanKelas, sekarang: number): Keluaran {
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
      }
      return o;
    case "keluarkan":
      keluarkan(k, o, pesan.pemainId);
      return o;
    case "tutup_ruang":
      if (k.status === "selesai" || k.status === "pembahasan") tutupRuang(k, o, sekarang);
      return o;
    default:
      return o; // halo, kode_masuk_ulang (JS-17), pembahasan (JS-11)
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
  jadwalPribadi(k, o, sekarang);
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
  return t.length > 0 ? Math.min(...t) : null;
}
