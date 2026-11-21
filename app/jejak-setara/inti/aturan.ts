// Aturan permainan bersama (spesifikasi JS-02, P-5 sampai P-23 dan P-39; PRD bagian 8; Architecture 8).
// Semua fungsi murni: waktu, keadaan pemain, dan benih masuk sebagai parameter, dan tidak ada yang
// disimpan di modul ini. Server memakainya sebagai sumber kebenaran; klien hanya untuk tampilan.
import { benih, kocok } from "./acak";
import type { IsiKejadian, KeadaanSkill, KotakJenis, Masa, PemainRingkas, Posisi, SkillId, Tingkat, TitikPeta, ZonaId } from "./tipe";

/** Galat aturan atau data yang dikenali, dengan kode tetap (misalnya `TITIK_TIDAK_CUKUP`, `PETA_CACAT`). */
export class GalatInti extends Error {
  readonly kode: "TITIK_TIDAK_CUKUP" | "PETA_CACAT";

  constructor(kode: "TITIK_TIDAK_CUKUP" | "PETA_CACAT", rincian: string) {
    super(`${kode}: ${rincian}`);
    this.name = "GalatInti";
    this.kode = kode;
  }
}

// ---------------------------------------------------------------------------------------------
// Masa dan jam cerita (PRD 8.1; P-5 sampai P-9)

export const HARI = {
  mulaiMenit: 360, // 06.00
  panjangMenit: 720, // 06.00–18.00
  ambangSiang: 0.3,
  ambangSore: 0.65,
  duaMenitDetik: 120,
} as const;

/** Bagian ronde yang sudah berjalan, tanpa lama jeda, dijepit ke 0–1. */
export function kemajuan(now: number, mulaiPada: number, jedaMs: number, durasiMs: number): number {
  if (!(durasiMs > 0) || !Number.isFinite(durasiMs)) throw new RangeError("kemajuan: durasiMs harus lebih dari 0");
  const k = (now - mulaiPada - jedaMs) / durasiMs;
  if (Number.isNaN(k)) throw new RangeError("kemajuan: waktu tidak sah");
  return Math.min(1, Math.max(0, k));
}

/**
 * Menit sejak tengah malam pada jam cerita: 360 + ⌊720 × kemajuan⌋, yaitu 06.00 sampai 18.00.
 * Tambahan 1e-9 menahan galat pembulatan biner (misalnya 720 × 0,7 = 503,99999999999994).
 */
export function menitCerita(k: number): number {
  const p = Math.min(1, Math.max(0, k));
  return HARI.mulaiMenit + Math.min(HARI.panjangMenit, Math.floor(HARI.panjangMenit * p + 1e-9));
}

/** Masa untuk kemajuan ronde. Batas bawah inklusif, batas atas eksklusif; 1 tetap sore. */
export function masa(k: number): Masa {
  if (k < HARI.ambangSiang) return "pagi";
  if (k < HARI.ambangSore) return "siang";
  return "sore";
}

/** "HH.MM" untuk menit sejak tengah malam (0–1439), misalnya 576 → "09.36". */
export function formatJam(menit: number): string {
  const m = Math.floor(menit);
  if (!(m >= 0 && m < 1440)) throw new RangeError("formatJam: menit di luar 0–1439");
  const jam = Math.floor(m / 60);
  return `${String(jam).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;
}

/** Benar selama sisa waktu 1–120 detik; 0 detik berarti ronde selesai. */
export function duaMenitTerakhir(sisaDetik: number): boolean {
  return sisaDetik > 0 && sisaDetik <= HARI.duaMenitDetik;
}

// ---------------------------------------------------------------------------------------------
// Skor dan peringkat (PRD 8.4; Architecture 8.4; P-10 sampai P-13)

export const POIN = { langkah1Benar: 40, tepat: 60, kurang: 25, berisiko: 0 } as const;

/** Poin satu kejadian: Langkah 1 benar 40, ditambah poin tingkat Langkah 2; hasilnya 0–100. */
export function poinKejadian(langkah1Benar: boolean, tingkat: Tingkat): number {
  return (langkah1Benar ? POIN.langkah1Benar : 0) + POIN[tingkat];
}

/** Nilai yang menentukan peringkat. */
export type DataPeringkat = Pick<PemainRingkas, "skor" | "waktuSkorMs" | "langkah1Benar" | "urutanGabung">;

/** Pembanding untuk `Array.prototype.sort`: skor, lalu waktu skor, lalu Langkah 1 benar, lalu urutan bergabung. */
export function bandingkanPeringkat(a: DataPeringkat, b: DataPeringkat): number {
  return (
    b.skor - a.skor || // 1) skor lebih tinggi
    a.waktuSkorMs - b.waktuSkorMs || // 2) lebih dulu mencapai skor itu
    b.langkah1Benar - a.langkah1Benar || // 3) lebih banyak Langkah 1 benar
    a.urutanGabung - b.urutanGabung // 4) lebih dulu bergabung
  );
}

/**
 * Salinan berurut dengan nomor peringkat 1..n. Larik dan objek asal tidak diubah.
 * Dua pemain dengan keempat nilai sama adalah kesalahan pemakaian (`urutanGabung` selalu unik).
 */
export function hitungPeringkat<T extends DataPeringkat>(pemain: readonly T[]): (T & { peringkat: number })[] {
  const urut = pemain.slice().sort(bandingkanPeringkat);
  for (let i = 1; i < urut.length; i++) {
    if (bandingkanPeringkat(urut[i - 1], urut[i]) === 0) {
      throw new RangeError("hitungPeringkat: dua pemain tidak bisa dibedakan (urutanGabung ganda)");
    }
  }
  return urut.map((p, i) => ({ ...p, peringkat: i + 1 }));
}

// ---------------------------------------------------------------------------------------------
// Skill (PRD 8.5; P-14 sampai P-17 dan P-19)

/** Muatan maksimum dan lama aktif setiap skill. `lamaMs` null berarti sekali pakai. */
export const SKILL = {
  lari: { muatanMaks: 2, lamaMs: 6000 },
  kompas: { muatanMaks: 2, lamaMs: 20000 },
  petunjuk: { muatanMaks: 2, lamaMs: null },
  teropong: { muatanMaks: 1, lamaMs: 30000 },
  angkot: { muatanMaks: 1, lamaMs: null },
} as const satisfies Record<SkillId, { muatanMaks: number; lamaMs: number | null }>;

/** Jeda paling singkat antarpemakaian skill yang sama. */
export const JEDA_SKILL_MS = 2000;

export interface PermintaanSkill {
  skill: SkillId;
  now: number;
  /** Dari `PengaturanRuang.skillAktif`: skill yang tidak dimatikan guru. */
  skillAktif: readonly SkillId[];
  keadaan: KeadaanSkill;
  /** Langkah dialog kejadian yang sedang terbuka, atau null bila tidak ada dialog. */
  langkahDialog: 1 | 2 | null;
}

/**
 * Skill boleh dipakai bila aktif di ruang, muatannya ada, jeda 2 detik sejak pemakaian skill yang sama
 * sudah lewat, dan tidak ada dialog terbuka. Petunjuk sebaliknya hanya dipakai di Langkah 1 dialog.
 * JS-09 (P-2, D-1a): skill berdurasi yang masih aktif tidak bisa dipakai lagi sampai selesai.
 */
export function bolehPakaiSkill(p: PermintaanSkill): boolean {
  if (!p.skillAktif.includes(p.skill)) return false;
  if (!(p.keadaan.muatan[p.skill] > 0)) return false;
  const terakhir = p.keadaan.terakhirPakaiMs[p.skill];
  if (terakhir !== undefined && p.now - terakhir < JEDA_SKILL_MS) return false;
  const aktifSampai = p.keadaan.aktifSampaiMs[p.skill];
  if (aktifSampai !== undefined && aktifSampai > p.now) return false;
  return p.skill === "petunjuk" ? p.langkahDialog === 1 : p.langkahDialog === null;
}

/**
 * Memakai skill: muatan berkurang 1, waktu pakai dicatat, dan skill berdurasi aktif sampai now + lama.
 * Pemakaian yang ditolak mengembalikan objek keadaan yang sama, tanpa perubahan.
 */
export function pakaiSkill(p: PermintaanSkill): { diterima: boolean; keadaan: KeadaanSkill } {
  if (!bolehPakaiSkill(p)) return { diterima: false, keadaan: p.keadaan };
  const { lamaMs } = SKILL[p.skill];
  return {
    diterima: true,
    keadaan: {
      muatan: { ...p.keadaan.muatan, [p.skill]: p.keadaan.muatan[p.skill] - 1 },
      aktifSampaiMs: lamaMs === null ? { ...p.keadaan.aktifSampaiMs } : { ...p.keadaan.aktifSampaiMs, [p.skill]: p.now + lamaMs },
      terakhirPakaiMs: { ...p.keadaan.terakhirPakaiMs, [p.skill]: p.now },
    },
  };
}

/** Muatan Kompas sesudah jawaban Langkah 2 "tepat": bertambah 1, paling banyak 2. */
export function tambahMuatanKompas(muatan: number): number {
  return Math.min(SKILL.kompas.muatanMaks, muatan + 1);
}

/** JS-09 (P-1): skill P0, menurut urutan tampil di HUD, dialog Ruang baru, detail ruang, dan hasil. */
export const SKILL_P0 = ["lari", "kompas", "petunjuk"] as const satisfies readonly SkillId[];
export type SkillP0 = (typeof SKILL_P0)[number];

/** JS-09 (P-1): isi setiap jenis kotak bantuan. Kotak teropong dan karcis belum ada di peta (JS-18). */
export const SKILL_KOTAK = {
  sepatu: "lari",
  kompas: "kompas",
  buku: "petunjuk",
  teropong: "teropong",
  karcis: "angkot",
} as const satisfies Record<KotakJenis, SkillId>;

/** JS-09 (P-4): server tetap memakai kecepatan lari untuk laporan gerak sampai 500 ms sesudah Lari cepat berakhir. */
export const TOLERANSI_LARI_MS = 500;

export function lariBerlaku(aktifSampai: number | undefined, now: number): boolean {
  return aktifSampai !== undefined && now <= aktifSampai + TOLERANSI_LARI_MS;
}

// ---------------------------------------------------------------------------------------------
// Kotak bantuan (PRD 8.5; Architecture 8.5; P-18)

export const KOTAK = { munculLagiMs: 90_000, jangkauanPx: 12 } as const;

/** Kotak siap diambil pemain ini bila belum pernah diambilnya, atau 90 detik sudah lewat. */
export function kotakSiap(waktuAmbilMs: number, now: number, sudahDiambil: boolean): boolean {
  return !sudahDiambil || now - waktuAmbilMs >= KOTAK.munculLagiMs;
}

/** Jarak posisi pemain (titik kaki) ke pusat ubin kotak paling jauh 12 piksel. */
export function dapatMengambilKotak(jarakPx: number): boolean {
  return jarakPx <= KOTAK.jangkauanPx;
}

/** Pusat ubin (x, y) dalam piksel logis (ubin 16 piksel). */
function pusatUbinPx(u: { x: number; y: number }): Posisi {
  return { x: u.x * 16 + 8, y: u.y * 16 + 8 };
}

/** JS-09 (P-3): jarak terdekat titik `p` ke ruas lurus `a` ke `b`; ruas sepanjang 0 diperlakukan sebagai titik `a`. */
export function jarakRuas(a: Posisi, b: Posisi, p: Posisi): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const panjang2 = dx * dx + dy * dy;
  const s = panjang2 > 0 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / panjang2)) : 0;
  return Math.hypot(a.x + s * dx - p.x, a.y + s * dy - p.y);
}

/** JS-09 (P-3): ruas gerak dari `dari` ke `ke` (titik kaki) lewat paling jauh 12 piksel dari pusat ubin kotak. */
export function kotakDilewati(dari: Posisi, ke: Posisi, kotak: { x: number; y: number }): boolean {
  return dapatMengambilKotak(jarakRuas(dari, ke, pusatUbinPx(kotak)));
}

// ---------------------------------------------------------------------------------------------
// Kejadian: penempatan, keterlihatan, jangkauan (PRD 8.3; Architecture 8.3; P-20 sampai P-23)

/** Kotak pandangan yang sama untuk semua pemain (Design System 3.2). */
export const PANDANGAN = { lebar: 320, tinggi: 180 } as const;

/** 1,5 ubin (24 piksel) ditambah toleransi 8 piksel. */
export const JANGKAUAN_PERIKSA_PX = 32;
/** Layar pemain menganggap kejadian dalam jangkauan pada 24 piksel, di bawah batas server (JS-08, P-21). */
export const JANGKAUAN_KLIEN_PX = 24;

/** Jarak lurus dua titik dalam piksel logis. */
export function jarak(a: Posisi, b: Posisi): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Memberi setiap kejadian satu titik di zonanya, atau dua titik berbeda bila `jumlahTitik` 2 (ruang lebih dari
 * 50 pemain; JS-08, P-8), tanpa titik terpakai dua kali. Kejadian diproses menurut kode; calon titik dikocok
 * dengan `kocok` berbenih (benihRuang, kode), lalu calon pertama (dan kedua) dipakai. Dengan `jumlahTitik` 1
 * hasilnya sama persis dengan JS-02. Hasil mengikuti urutan daftar masukan dan selalu sama untuk benih dan
 * daftar yang sama.
 */
export function tempatkanKejadian(
  benihRuang: number | string,
  titikPerZona: Readonly<Partial<Record<ZonaId, readonly TitikPeta[]>>>,
  kejadian: readonly Pick<IsiKejadian, "kode" | "zona">[],
  jumlahTitik: 1 | 2 = 1,
): { kode: string; titik: TitikPeta; titikKedua?: TitikPeta }[] {
  if (jumlahTitik !== 1 && jumlahTitik !== 2) throw new RangeError("tempatkanKejadian: jumlahTitik harus 1 atau 2");
  const terpakai = new Set<string>();
  const hasil = new Map<string, TitikPeta[]>();
  const urut = kejadian.slice().sort((a, b) => (a.kode < b.kode ? -1 : a.kode > b.kode ? 1 : 0));
  for (const k of urut) {
    if (hasil.has(k.kode)) throw new RangeError(`tempatkanKejadian: kode ${k.kode} ganda`);
    const calon = (titikPerZona[k.zona] ?? []).filter((t) => !terpakai.has(t.id));
    if (calon.length < jumlahTitik) {
      throw new GalatInti("TITIK_TIDAK_CUKUP", `zona ${k.zona} kekurangan titik untuk ${k.kode}`);
    }
    const pilihan = kocok(calon, benih(benihRuang, k.kode)).slice(0, jumlahTitik);
    for (const t of pilihan) terpakai.add(t.id);
    hasil.set(k.kode, pilihan);
  }
  return kejadian.map((k) => {
    const [titik, titikKedua] = hasil.get(k.kode) as TitikPeta[];
    return jumlahTitik === 2 ? { kode: k.kode, titik, titikKedua } : { kode: k.kode, titik };
  });
}

/**
 * Titik terlihat bila berada di kotak pandangan 320 × 180 yang berpusat di posisi pemain dan dijepit
 * ke tepi peta. Tepi kotak termasuk. Semua nilai dalam piksel logis.
 */
export function terlihatDiLayar(posPemain: Posisi, titik: Posisi, lebarPetaPx: number, tinggiPetaPx: number): boolean {
  const kiri = Math.max(0, Math.min(posPemain.x - PANDANGAN.lebar / 2, lebarPetaPx - PANDANGAN.lebar));
  const atas = Math.max(0, Math.min(posPemain.y - PANDANGAN.tinggi / 2, tinggiPetaPx - PANDANGAN.tinggi));
  return titik.x >= kiri && titik.x <= kiri + PANDANGAN.lebar && titik.y >= atas && titik.y <= atas + PANDANGAN.tinggi;
}

/** Kejadian belum selesai yang paling dekat (jarak lurus); bila sama jauh, kode terkecil. */
export function kejadianTerdekat<T extends { kode: string; x: number; y: number; selesai: boolean }>(
  posPemain: Posisi,
  daftar: readonly T[],
): T | null {
  let terbaik: T | null = null;
  let jarakTerbaik = Infinity;
  for (const k of daftar) {
    if (k.selesai) continue;
    const d = (k.x - posPemain.x) ** 2 + (k.y - posPemain.y) ** 2;
    if (d < jarakTerbaik || (d === jarakTerbaik && terbaik !== null && k.kode < terbaik.kode)) {
      terbaik = k;
      jarakTerbaik = d;
    }
  }
  return terbaik;
}

/**
 * JS-09 (P-5): sasaran Kompas, yaitu titik dengan jarak lurus terkecil dari `pos` ke pusat titik di antara semua titik
 * kejadian yang belum selesai; seri diputus kode kejadian terkecil, lalu id titik terkecil. Null bila semua selesai.
 */
export function sasaranKompas(
  pos: Posisi,
  daftar: readonly { kode: string; selesai: boolean; titik: readonly { id: string; x: number; y: number }[] }[],
): { kode: string; titikId: string; x: number; y: number } | null {
  const calon: { kode: string; titikId: string; x: number; y: number; ux: number; uy: number; selesai: boolean }[] = [];
  for (const k of daftar) {
    if (k.selesai) continue;
    for (const t of k.titik) {
      const p = pusatUbinPx(t);
      calon.push({ kode: k.kode, titikId: t.id, x: p.x, y: p.y, ux: t.x, uy: t.y, selesai: false });
    }
  }
  calon.sort((a, b) => (a.kode < b.kode ? -1 : a.kode > b.kode ? 1 : a.titikId < b.titikId ? -1 : a.titikId > b.titikId ? 1 : 0));
  const t = kejadianTerdekat(pos, calon);
  return t ? { kode: t.kode, titikId: t.titikId, x: t.ux, y: t.uy } : null;
}

/** JS-09 (P-5): pemain tiba di sasaran Kompas bila jaraknya ke pusat titik paling jauh 32 piksel. */
export function kompasTiba(pos: Posisi, titik: { x: number; y: number }): boolean {
  return jarak(pos, pusatUbinPx(titik)) <= JANGKAUAN_PERIKSA_PX;
}

/** Tombol Periksa aktif bila jarak pemain ke titik kejadian paling jauh 32 piksel. */
export function dapatMemeriksa(jarakPx: number): boolean {
  return jarakPx <= JANGKAUAN_PERIKSA_PX;
}

// ---------------------------------------------------------------------------------------------
// Batas pesan dan ruang (Architecture 6.6; PRD JFR-01; P-39)

export const BATAS = {
  pesanByte: 2048,
  pesanPerDetik: 20,
  lonjakan: 40,
  pelanggaranGalat: 3,
  jendelaPelanggaranMs: 10_000,
  pelanggaranTutup: 10,
  pemainMaks: 100, // JS-03, Permintaan C-8 (bawaan tetap 40)
  pemainMaksNomorAbsen: 50, // mode nomor absen hanya untuk ruang sampai 50 pemain (KT-02)
  ruangBesarLebihDari: 50, // ruang lebih dari 50 pemain memakai frekuensi gerak lebih rendah
  durasiMenit: [10, 15, 20],
  terlambatMenit: 5,
  nomorAbsenMin: 1,
  nomorAbsenMaks: 50,
  duniaTerdekat: 24, // isi `dunia` paling banyak 24 pemain terdekat
  gerakPerDetik: 10,
  gerakPerDetikRuangBesar: 6,
  gerakDiamPerDetik: 1,
  pingMs: 5000,
  haloMs: 10_000,
} as const;

/** 31 huruf dan angka kode ruang, tanpa 0, O, 1, I, dan L (spesifikasi JS-03, P-10). */
export const ABJAD_KODE = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const POLA_KODE_RUANG = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}$/;

/** Kode yang diketik: huruf kecil menjadi besar; spasi dan tanda hubung dibuang (P-11). */
export function normalkanKode(masukan: string): string {
  return masukan.toUpperCase().replace(/[\s-]+/g, "");
}

/** Frekuensi laporan `gerak` saat bergerak: 10 per detik, atau 6 per detik di ruang lebih dari 50 pemain. */
export function frekuensiGerak(batasPemain: number): number {
  return batasPemain > BATAS.ruangBesarLebihDari ? BATAS.gerakPerDetikRuangBesar : BATAS.gerakPerDetik;
}
