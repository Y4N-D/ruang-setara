// Skill dan kotak bantuan di layar pemain (spesifikasi JS-09, P-18, P-20, P-23, P-26, P-36, P-37, P-39, P-41 sampai
// P-43). Murni, tanpa DOM, sehingga diuji di Node. Server berwenang atas muatan, masa aktif, kotak, dan sasaran Kompas;
// modul ini hanya menyimpan isi pesan terakhir, menghitung tampilan, dan menolak tekanan yang pasti ditolak. Semua
// waktu skill dibandingkan dengan waktu efektif `w`: perkiraan jam server di `main`, dan `jedaSejak` selama `jeda`.
// Ditulis ringkas karena anggaran ukuran P-51 (4 KB gzip untuk seluruh JS-09 di layar pemain).
import { bolehPakaiSkill, jarak, KOTAK, PANDANGAN, SKILL, SKILL_KOTAK, SKILL_P0, type SkillP0 } from "../../inti/aturan";
import type { KotakJenis, SkillId, StatusRuang } from "../../inti/tipe";
import { isiTeks, TEKS } from "../../teks";

const T = TEKS.skill;
/** Nama pendek (pita, kartu dampak, dan `skill.penuh`); nama lengkap untuk label dan pengumuman ada di `TEKS.skill[s]`. */
export const namaPendek = (s: SkillP0) => (s === "kompas" ? T.kompasPendek : T[s]);
const CARI: Readonly<Record<SkillP0, string>> = { lari: T.cariLari, kompas: T.cariKompas, petunjuk: T.cariPetunjuk };
const BERDURASI = ["lari", "kompas"] as const;
/** Tombol yang ditekan tampak menunggu jawaban server paling lama 2 detik (P-36). */
export const TUNGGU_JAWABAN_MS = 2000;
/** Pita tampil 3 detik; antrean paling banyak 3 butir (P-41). */
export const PITA_MS = 3000;
/** Bingkai pop kotak dan kilau: 80 ms (P-18). */
const EFEK_MS = 80;

export interface KotakKlien {
  id: string;
  jenis: KotakJenis;
  x: number; // ubin
  y: number;
}

/** Status satu tombol skill (P-36). `jeda`: langkah blok yang masih menutupi tombol (8 sampai 1), 0 di luar jeda. */
export interface StatusTombol {
  skill: SkillP0;
  muatan: number;
  aktif: boolean;
  jeda: number;
  menunggu: boolean;
}

const pusat = (k: { x: number; y: number }) => ({ x: k.x * 16 + 8, y: k.y * 16 + 8 });

/** Nama arah panah menurut urutan bingkai `tanda_kompas` (P-26, butir 2 dan 8). */
export const ARAH_PANAH = ["atas", "kanan_atas", "kanan", "kanan_bawah", "bawah", "kiri_bawah", "kiri", "kiri_atas"] as const;

/**
 * Indeks arah 0 sampai 7 (P-26, butir 2): sudut searah jarum jam dari atas, dibulatkan ke kelipatan 45° terdekat; nilai
 * tepat di tengah dibulatkan searah jarum jam.
 */
export const indeksArah = (dx: number, dy: number) => Math.round((Math.atan2(dx, -dy) * 4) / Math.PI + 8) % 8;

/**
 * Batas pusat panah dalam piksel logis pandangan (P-26, butir 4): kotak aman (pandangan dikurangi 12, 40, 160, dan 56 px
 * CSS di kiri, atas, kanan, dan bawah, ditambah bagian kanvas yang terpotong jendela) yang diperkecil 7 piksel di setiap
 * sisi. `px` = px CSS per piksel logis. Hasil: [x0, y0, x1, y1].
 */
export function batasPanah(px: number, potong: readonly [number, number, number, number] = [0, 0, 0, 0]): [number, number, number, number] {
  const ke = (css: number, i: number) => Math.round((css + potong[i]) / px);
  return [ke(12, 0) + 7, ke(40, 1) + 7, PANDANGAN.lebar - ke(160, 2) - 7, PANDANGAN.tinggi - ke(56, 3) - 7];
}

/**
 * Pusat panah (P-26, butir 4): titik potong garis dari titik kaki (dijepit lebih dulu ke dalam batas) ke arah sasaran
 * dengan tepi batas. Semua koordinat pandangan.
 */
export function letakPanah(kx: number, ky: number, dx: number, dy: number, [x0, y0, x1, y1]: readonly number[]): [number, number] {
  const ax = Math.min(x1, Math.max(x0, kx));
  const ay = Math.min(y1, Math.max(y0, ky));
  const s = Math.min(dx ? ((dx > 0 ? x1 : x0) - ax) / dx : Infinity, dy ? ((dy > 0 ? y1 : y0) - ay) / dy : Infinity);
  return [Math.round(ax + dx * s), Math.round(ay + dy * s)];
}

/**
 * Antrean pita (P-41): satu per satu selama 3 detik, paling banyak 3 butir, tanpa butir yang sama dengan ujung antrean
 * (atau pita yang sedang tampil bila antrean kosong). Pemanggil membuang pita skill selama dialog terbuka.
 */
export class AntreanPita {
  private antre: string[] = [];
  private tampil = "";
  private sampai = 0;

  /** Mengembalikan true bila pita diterima. */
  tambah(teks: string, jam: number): boolean {
    if ((this.antre.at(-1) ?? (jam < this.sampai ? this.tampil : "")) === teks) return false;
    if (this.antre.push(teks) > 3) this.antre.shift();
    return true;
  }

  /** Pita yang tampil sekarang, atau "". */
  perbarui(jam: number): string {
    if (jam >= this.sampai) {
      this.tampil = this.antre.shift() ?? "";
      if (this.tampil) this.sampai = jam + PITA_MS;
    }
    return this.tampil;
  }
}

export class SkillKlien {
  /** Skill P0 yang aktif di ruang, urutan P-1. */
  ruang: SkillP0[] = [];
  muatan: Record<SkillP0, number> = { lari: 0, kompas: 0, petunjuk: 0 };
  /** Akhir masa aktif dari `pribadi` terakhir (jam server). */
  sampai: { lari?: number; kompas?: number } = {};
  /** Kotak yang menunggu muncul lagi: id → siapPada (jam server). */
  tunggu = new Map<string, number>();
  /** Waktu efektif saat `pribadi` yang mengurangi muatan skill itu tiba (P-37). */
  pakai: Partial<Record<SkillP0, number>> = {};
  /** Sasaran `kompas` terakhir (ubin); masa aktifnya sama dengan `aktifSampai.kompas`. */
  kompas: { x: number; y: number } | null = null;
  /** Tombol yang menunggu jawaban server: skill → jam lokal saat ditekan. */
  ditekan: Partial<Record<SkillP0, number>> = {};
  /** Kilau kotak yang baru diambil: [x, y, jam lokal]. */
  kilau: [number, number, number][] = [];
  /** Skill berdurasi yang tampak aktif, untuk "{skill} selesai." (P-39). */
  private tampak = new Set<"lari" | "kompas">();
  /** Kotak yang pita penuhnya sudah tampil (P-43). */
  private penuh = new Set<string>();

  constructor(readonly kotak: readonly KotakKlien[]) {}

  /** Status `jeda` ke `main` (P-20, butir 2): masa aktif, `berakhirPada`, dan `siapPada` digeser sebesar lama jeda. */
  geser(ms: number): void {
    if (!(ms > 0)) return;
    for (const s of BERDURASI) if (this.sampai[s] !== undefined) this.sampai[s] += ms;
    for (const [id, t] of this.tunggu) this.tunggu.set(id, t + ms);
  }

  /** `pribadi` (P-13): muatan, masa aktif, dan kotak yang menunggu; kilau bagi kotak yang baru diambil (P-18). */
  pribadi(p: { muatan: Record<SkillId, number>; aktifSampai: Partial<Record<SkillId, number>>; kotakMenunggu: readonly { id: string; siapPada: number }[] }, w: number, jam: number, kurangiGerak: boolean): void {
    for (const s of SKILL_P0) {
      if (p.muatan[s] < this.muatan[s]) this.pakai[s] = w;
      this.muatan[s] = p.muatan[s];
    }
    this.sampai = { lari: p.aktifSampai.lari, kompas: p.aktifSampai.kompas };
    const baru = new Map(p.kotakMenunggu.map((k) => [k.id, k.siapPada]));
    for (const k of this.kotak) if (!kurangiGerak && baru.has(k.id) && !this.tunggu.has(k.id)) this.kilau.push([k.x * 16 + 8, k.y * 16 + 8, jam]);
    this.tunggu = baru;
    this.ditekan = {};
  }

  /** `kompas` (P-24, P-25). */
  sasaran(p: { x: number; y: number }): void {
    this.kompas = { x: p.x, y: p.y };
    this.ditekan = {};
  }

  /** `pemberitahuan` (P-42): [pita, pengumuman], atau null untuk kode lain. */
  pemberitahuan(kode: string): [string | null, string] | null {
    this.ditekan = {};
    const s = /^kotak_(lari|kompas|petunjuk)$/.exec(kode)?.[1] as SkillP0 | undefined;
    if (s) return [isiTeks(T.pita, { skill: namaPendek(s) }), isiTeks(T.dapat, { skill: T[s] })];
    if (kode === "kompas_tanpa_sasaran") return [T.semuaSelesai, T.semuaSelesai];
    return kode === "kompas_tepat" ? [null, isiTeks(T.dapat, { skill: T.kompas })] : null;
  }

  /** Skill berdurasi yang sedang aktif. */
  aktif(s: SkillP0, w: number): boolean {
    return s !== "petunjuk" && w < (this.sampai[s] ?? -Infinity);
  }

  /**
   * Pengumuman (P-39) saat Lari cepat atau Kompas mulai aktif ("{skill} aktif selama {n} detik.") atau berakhir karena
   * waktu, tiba, atau kehabisan sasaran ("{skill} selesai."), diperiksa setiap bingkai. Masa aktif yang berlanjut
   * sesudah halaman dimuat ulang tidak diumumkan sebagai baru.
   */
  periksaWaktu(w: number): string[] {
    const umum: string[] = [];
    for (const s of BERDURASI) {
      const aktif = this.aktif(s, w);
      const lama = SKILL[s].lamaMs ?? 0;
      if (aktif === this.tampak.has(s)) continue;
      if (aktif) this.tampak.add(s);
      else this.tampak.delete(s);
      if (!aktif || (this.sampai[s] ?? 0) - w > lama - 1000) umum.push(isiTeks(aktif ? T.aktif : T.selesai, { skill: T[s], n: lama / 1000 }));
    }
    return umum;
  }

  /** Tombol yang `pakai_skill`-nya terkirim tampak ditekan sampai jawaban tiba (P-36). */
  catatTekan(s: SkillP0, jam: number): void {
    this.ditekan[s] = jam;
  }

  /** Status tombol untuk HUD (P-36). */
  status(s: SkillP0, w: number, jam: number): StatusTombol {
    const lewat = w - (this.pakai[s] ?? -Infinity);
    return { skill: s, muatan: this.muatan[s], aktif: this.aktif(s, w), jeda: lewat >= 0 && lewat < 2000 ? 8 - Math.floor(lewat / 250) : 0, menunggu: jam - (this.ditekan[s] ?? -Infinity) < TUNGGU_JAWABAN_MS };
  }

  /**
   * Menekan tombol skill di luar dialog (P-37): true bila `pakai_skill` perlu dikirim, teks pita bila tanpa muatan atau
   * Petunjuk di luar dialog, selain itu false.
   */
  tekan(s: SkillP0, w: number, jam: number): boolean | string {
    const b = this.status(s, w, jam);
    if (!this.ruang.includes(s) || b.menunggu) return false;
    if (s === "petunjuk") return b.muatan > 0 ? T.diLangkah1 : CARI[s];
    if (b.aktif || b.jeda) return false;
    if (!b.muatan) return CARI[s];
    return bolehPakaiSkill({ skill: s, now: w, skillAktif: this.ruang, keadaan: { muatan: { ...this.muatan, teropong: 0, angkot: 0 }, aktifSampaiMs: this.sampai, terakhirPakaiMs: this.pakai }, langkahDialog: null });
  }

  /**
   * Kotak yang tergambar (P-18): di `main` dan `jeda`, untuk skill yang aktif di ruang, dan siap bagi pemain ini. Bingkai
   * 2 (biasa), atau pop 0 lalu 1 selama 160 ms sesudah `siapPada` bagi kotak yang muncul lagi.
   */
  kotakTampil(status: StatusRuang, w: number, kurangiGerak: boolean): [KotakKlien, number][] {
    if (status !== "main" && status !== "jeda") return [];
    const hasil: [KotakKlien, number][] = [];
    for (const k of this.kotak) {
      const lewat = w - (this.tunggu.get(k.id) ?? -Infinity);
      if (!this.ruang.includes(SKILL_KOTAK[k.jenis] as SkillP0) || lewat < 0) continue;
      hasil.push([k, status === "main" && !kurangiGerak && lewat < 2 * EFEK_MS ? Math.floor(lewat / EFEK_MS) : 2]);
    }
    return hasil;
  }

  /** Kilau yang masih tampil (dua bingkai 80 ms): [x, y, bingkai]. */
  kilauTampil(jam: number): [number, number, number][] {
    this.kilau = this.kilau.filter((k) => jam - k[2] < 2 * EFEK_MS);
    return this.kilau.map((k) => [k[0], k[1], Math.max(0, Math.floor((jam - k[2]) / EFEK_MS))]);
  }

  /**
   * Pita penuh (P-43): titik kaki paling jauh 12 piksel dari pusat kotak yang tergambar, sedangkan muatan skill isinya
   * sudah 2; sekali per kotak sampai avatar menjauh lebih dari 24 piksel atau kotak tidak tergambar lagi.
   */
  periksaPenuh(kaki: { x: number; y: number } | null, tampil: readonly [KotakKlien, number][]): string[] {
    const pita: string[] = [];
    const dekat = new Set<string>();
    for (const [k] of tampil) {
      const d = kaki ? jarak(kaki, pusat(k)) : Infinity;
      if (d > 24) continue;
      dekat.add(k.id);
      const s = SKILL_KOTAK[k.jenis] as SkillP0;
      if (d <= KOTAK.jangkauanPx && this.muatan[s] >= SKILL[s].muatanMaks && !this.penuh.has(k.id)) {
        this.penuh.add(k.id);
        pita.push(isiTeks(T.penuh, { skill: namaPendek(s) }));
      }
    }
    for (const id of this.penuh) if (!dekat.has(id)) this.penuh.delete(id);
    return pita;
  }

  /**
   * Panah Kompas (P-26): sasaran dari `kompas` terakhir, `pribadi` terakhir memuat `aktifSampai.kompas`, waktu efektif
   * belum mencapai `berakhirPada`, dan pusat ubin sasaran di luar pandangan. Hasil: [indeks arah, x, y] di pandangan.
   */
  panah(kaki: { x: number; y: number } | null, kamera: { x: number; y: number }, w: number, batas: readonly number[]): [number, number, number] | null {
    const k = this.kompas;
    if (!k || !kaki || !this.aktif("kompas", w)) return null;
    const c = pusat(k);
    const dx = c.x - kaki.x;
    const dy = c.y - kaki.y;
    if (c.x >= kamera.x && c.x < kamera.x + PANDANGAN.lebar && c.y >= kamera.y && c.y < kamera.y + PANDANGAN.tinggi) return null;
    return [indeksArah(dx, dy), ...letakPanah(kaki.x - kamera.x, kaki.y - kamera.y, dx, dy, batas)];
  }
}
