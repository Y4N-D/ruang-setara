// Aturan skill dan kotak bantuan di server ruang (spesifikasi JS-09, P-6 dan P-11 sampai P-32). Murni: tanpa API
// Workers, jam, atau acak langsung. Semua waktu keadaan memakai waktu ronde (milidetik ronde tanpa jeda, P-11), sehingga
// jeda menggeser masa aktif, jeda 2 detik, dan kotak tanpa menulis ulang baris (P-12). Pesan memakai jam server (P-13).
// JS-18: kelima skill di `pribadi`, 31 kotak, Teropong yang aktif, dan syarat pindah halte Angkot (P-10, P-14, P-22).
import { acakBerbenih, benih } from "../../../../app/jejak-setara/inti/acak";
import {
  bolehPakaiSkill,
  halteDekat,
  JANGKAUAN_HALTE_PX,
  KOTAK,
  kotakDilewati,
  kotakSiap,
  pakaiSkill,
  sasaranKompas,
  SKILL,
  SKILL_KOTAK,
  tambahMuatanKompas,
} from "../../../../app/jejak-setara/inti/aturan";
import type { IsiKejadian, KeadaanSkill, KotakJenis, Posisi, SkillId, TitikPeta } from "../../../../app/jejak-setara/inti/tipe";

/** Satu kotak bantuan peta (kampung.json). */
export interface KotakPeta {
  id: string;
  jenis: KotakJenis;
  x: number;
  y: number;
}

/** Keadaan skill satu pemain (P-11), disimpan sebagai `skill.isi_json` (P-14). */
export interface SkillPemain {
  keadaan: KeadaanSkill;
  /** Id kotak → waktu ronde saat diambil. */
  kotak: Record<string, number>;
  /** Sasaran Kompas yang sedang aktif: kode kejadian dan id titik. */
  kompas: { kode: string; titik: string } | null;
}

const MUATAN_NOL: KeadaanSkill["muatan"] = { lari: 0, kompas: 0, petunjuk: 0, teropong: 0, angkot: 0 };

export function skillBaru(): SkillPemain {
  return { keadaan: { muatan: { ...MUATAN_NOL }, aktifSampaiMs: {}, terakhirPakaiMs: {} }, kotak: {}, kompas: null };
}

// ---------------------------------------------------------------------------------------------
// Baris `skill` (P-14)

export function skillKeJson(s: SkillPemain): string {
  return JSON.stringify({ muatan: s.keadaan.muatan, aktif: s.keadaan.aktifSampaiMs, pakai: s.keadaan.terakhirPakaiMs, kotak: s.kotak, kompas: s.kompas });
}

const angka = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const SKILL_ID = Object.keys(SKILL) as SkillId[];

function catatanWaktu(v: unknown): Partial<Record<SkillId, number>> {
  const hasil: Partial<Record<SkillId, number>> = {};
  if (v && typeof v === "object") for (const s of SKILL_ID) if (angka((v as Record<string, unknown>)[s])) hasil[s] = (v as Record<SkillId, number>)[s];
  return hasil;
}

/** Isi baris `skill`; isian yang rusak atau tidak dikenal menjadi keadaan awal (muatan 0). */
export function skillDariJson(teks: string): SkillPemain {
  const s = skillBaru();
  let d: Record<string, unknown>;
  try {
    d = JSON.parse(teks) as Record<string, unknown>;
  } catch {
    return s;
  }
  if (!d || typeof d !== "object") return s;
  const muatan = d.muatan as Record<string, unknown> | undefined;
  if (muatan && typeof muatan === "object") {
    for (const id of SKILL_ID) {
      const m = muatan[id];
      if (angka(m)) s.keadaan.muatan[id] = Math.max(0, Math.min(SKILL[id].muatanMaks, Math.trunc(m)));
    }
  }
  s.keadaan.aktifSampaiMs = catatanWaktu(d.aktif);
  s.keadaan.terakhirPakaiMs = catatanWaktu(d.pakai);
  if (d.kotak && typeof d.kotak === "object") {
    for (const [id, t] of Object.entries(d.kotak as Record<string, unknown>)) if (angka(t)) s.kotak[id] = t;
  }
  const k = d.kompas as { kode?: unknown; titik?: unknown } | null | undefined;
  if (k && typeof k.kode === "string" && typeof k.titik === "string") s.kompas = { kode: k.kode, titik: k.titik };
  return s;
}

// ---------------------------------------------------------------------------------------------
// Waktu ronde ke jam server (P-13)

/** Jam server untuk waktu ronde `t`: mulaiPada + jumlah jeda yang sudah dilanjutkan + t. Benar di `main` dan `jeda`. */
export function keJamServer(t: number, mulaiPada: number, jedaMs: number): number {
  return mulaiPada + jedaMs + t;
}

export interface IsiPribadiSkill {
  muatan: KeadaanSkill["muatan"];
  aktifSampai: Partial<Record<SkillId, number>>;
  kotakMenunggu: { id: string; siapPada: number }[];
}

/** Paling banyak 31 kotak di `kotakMenunggu` (JS-09 P-13; JS-18 P-10), sama dengan jumlah kotak kampung.json. */
export const KOTAK_MENUNGGU_MAKS = 31;

/**
 * Bagian skill pesan `pribadi` (JS-09 P-13; JS-18 P-14): muatan kelima skill, serta `aktifSampai` Lari cepat, Kompas, dan
 * Teropong yang masih aktif. `t` adalah waktu ronde sekarang.
 */
export function isiPribadiSkill(s: SkillPemain | undefined, t: number, mulaiPada: number | null, jedaMs: number): IsiPribadiSkill {
  if (!s || mulaiPada === null) return { muatan: { ...MUATAN_NOL }, aktifSampai: {}, kotakMenunggu: [] };
  const aktifSampai: Partial<Record<SkillId, number>> = {};
  for (const id of ["lari", "kompas", "teropong"] as const) {
    const a = s.keadaan.aktifSampaiMs[id];
    if (a !== undefined && a > t) aktifSampai[id] = keJamServer(a, mulaiPada, jedaMs);
  }
  const kotakMenunggu = Object.entries(s.kotak)
    .filter(([, ambil]) => !kotakSiap(ambil, t, true))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .slice(0, KOTAK_MENUNGGU_MAKS)
    .map(([id, ambil]) => ({ id, siapPada: keJamServer(ambil + KOTAK.munculLagiMs, mulaiPada, jedaMs) }));
  return { muatan: { ...s.keadaan.muatan }, aktifSampai, kotakMenunggu };
}

// ---------------------------------------------------------------------------------------------
// Kotak bantuan (P-16)

/**
 * Kotak yang terambil oleh satu ruas gerak, menurut urutan id: ruas lewat ≤ 12 piksel dari pusat ubin, kotak siap bagi
 * pemain itu, skill isinya aktif di ruang, dan muatannya kurang dari maksimum. Mengembalikan keadaan baru (salinan) bila
 * ada kotak yang terambil, atau keadaan yang sama bila tidak ada.
 */
export function ambilKotak(
  s: SkillPemain,
  dari: Posisi,
  ke: Posisi,
  daftar: readonly KotakPeta[],
  skillAktif: readonly SkillId[],
  t: number,
): { s: SkillPemain; diambil: KotakPeta[] } {
  let baru: SkillPemain | null = null;
  const diambil: KotakPeta[] = [];
  for (const kotak of daftar) {
    const skill = SKILL_KOTAK[kotak.jenis];
    if (!skillAktif.includes(skill)) continue;
    const kini = baru ?? s;
    const ambil = kini.kotak[kotak.id];
    if (!kotakSiap(ambil ?? 0, t, ambil !== undefined)) continue;
    if (kini.keadaan.muatan[skill] >= SKILL[skill].muatanMaks) continue;
    if (!kotakDilewati(dari, ke, kotak)) continue;
    baru ??= salinSkill(s);
    baru.keadaan.muatan[skill] += 1;
    baru.kotak[kotak.id] = t;
    diambil.push(kotak);
  }
  return { s: baru ?? s, diambil };
}

function salinSkill(s: SkillPemain): SkillPemain {
  return {
    keadaan: { muatan: { ...s.keadaan.muatan }, aktifSampaiMs: { ...s.keadaan.aktifSampaiMs }, terakhirPakaiMs: { ...s.keadaan.terakhirPakaiMs } },
    kotak: { ...s.kotak },
    kompas: s.kompas ? { ...s.kompas } : null,
  };
}

// ---------------------------------------------------------------------------------------------
// Memakai skill (P-19, P-24, P-28)

/** Pemakaian skill P0 menurut `bolehPakaiSkill` (P-2); null bila ditolak. Sasaran Kompas diisi pemanggil. */
export function pakai(s: SkillPemain, skill: SkillId, t: number, skillAktif: readonly SkillId[], langkahDialog: 1 | 2 | null): SkillPemain | null {
  const hasil = pakaiSkill({ skill, now: t, skillAktif, keadaan: s.keadaan, langkahDialog });
  if (!hasil.diterima) return null;
  return { ...salinSkill(s), keadaan: hasil.keadaan };
}

/** Boleh dipakai tanpa mengubah keadaan (untuk Kompas yang perlu sasaran lebih dulu). */
export function bolehPakai(s: SkillPemain, skill: SkillId, t: number, skillAktif: readonly SkillId[], langkahDialog: 1 | 2 | null): boolean {
  return bolehPakaiSkill({ skill, now: t, skillAktif, keadaan: s.keadaan, langkahDialog });
}

/** JS-18 (P-15): Teropong aktif pada waktu ronde `t`. */
export function teropongAktif(s: SkillPemain | undefined, t: number): boolean {
  const a = s?.keadaan.aktifSampaiMs.teropong;
  return a !== undefined && a > t;
}

/** Satu halte peta (kampung.json): id, lalu ubinnya. */
export interface HaltePeta {
  id: string;
  x: number;
  y: number;
}

/**
 * JS-18 (P-22): pemakaian Angkot. Diterima bila `bolehPakaiSkill` terpenuhi tanpa dialog, `halteId` ada di peta, titik
 * kaki `pos` paling jauh 32 piksel dari pusat ubin satu halte (halte asal), dan halte tujuan berbeda dari halte asal.
 * Mengembalikan keadaan baru (muatan −1 dan waktu pakai), halte asal, dan halte tujuan; null bila ditolak.
 */
export function pakaiAngkot(
  s: SkillPemain,
  pos: Posisi,
  halteId: string | undefined,
  halte: readonly HaltePeta[],
  t: number,
  skillAktif: readonly SkillId[],
  langkahDialog: 1 | 2 | null,
): { s: SkillPemain; asal: HaltePeta; tujuan: HaltePeta } | null {
  const tujuan = halte.find((h) => h.id === halteId);
  const asal = halteDekat(pos, halte, JANGKAUAN_HALTE_PX);
  if (!tujuan || !asal || asal.id === tujuan.id) return null;
  const baru = pakai(s, "angkot", t, skillAktif, langkahDialog);
  return baru ? { s: baru, asal, tujuan } : null;
}

/** Kompas aktif pada waktu ronde `t`. */
export function kompasAktif(s: SkillPemain | undefined, t: number): boolean {
  const a = s?.keadaan.aktifSampaiMs.kompas;
  return a !== undefined && a > t && s?.kompas !== null && s?.kompas !== undefined;
}

/** Kompas berakhir sebelum waktunya (tiba atau kehabisan sasaran): masa aktif dan sasaran dihapus. */
export function akhiriKompas(s: SkillPemain): SkillPemain {
  const baru = salinSkill(s);
  delete baru.keadaan.aktifSampaiMs.kompas;
  baru.kompas = null;
  return baru;
}

/** +1 Kompas untuk jawaban "tepat" (P-32); null bila tidak ada tambahan. */
export function tambahKompas(s: SkillPemain, skillAktif: readonly SkillId[]): SkillPemain | null {
  if (!skillAktif.includes("kompas")) return null;
  const m = tambahMuatanKompas(s.keadaan.muatan.kompas);
  if (m === s.keadaan.muatan.kompas) return null;
  const baru = salinSkill(s);
  baru.keadaan.muatan.kompas = m;
  return baru;
}

/** Sasaran Kompas (P-5, P-24) dari titik aktif kejadian ruang yang belum selesai bagi pemain. */
export function pilihSasaran(
  pos: Posisi,
  kejadian: readonly { kode: string; titik: readonly TitikPeta[] }[],
  selesai: (kode: string) => boolean,
): { kode: string; titikId: string; x: number; y: number } | null {
  return sasaranKompas(
    pos,
    kejadian.map((k) => ({ kode: k.kode, selesai: selesai(k.kode), titik: k.titik })),
  );
}

// ---------------------------------------------------------------------------------------------
// Petunjuk (P-6)

/** Id asli pilihan keliru Langkah 1 yang dicoret Petunjuk: acak berbenih (benihRuang, pemainId, kode, "petunjuk"). */
export function pilihCoretan(benihRuang: number, pemainId: string, kode: string, isi: Pick<IsiKejadian, "langkah1">): string {
  const keliru = isi.langkah1.opsi.filter((o) => !o.benar);
  const acak = acakBerbenih(benih(benihRuang, pemainId, kode, "petunjuk"));
  return keliru[Math.min(keliru.length - 1, Math.floor(acak() * keliru.length))].id;
}
