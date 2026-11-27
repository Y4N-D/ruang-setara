// Pemain lain (spesifikasi JS-07, P-19 sampai P-24; Architecture 9): penyangga butir `dunia`, tunda tampilan
// yang menyesuaikan jaringan, interpolasi dan penerusan paling lama 100 ms, serta sembunyi sesudah 2,5 detik di
// status `main`. Pemain saling tembus, jadi tidak ada tabrakan antarpemain di sini.
// JS-09 (P-23): pemain lain tampak berlari bila menempuh lebih dari 45 piksel dalam 500 ms tampilan.
// JS-18 (P-24): butir yang melompat (misalnya sesudah naik Angkot) mengganti penyangga, tanpa meluncur.
import { melompat } from "../../inti/aturan";
import type { Arah, StatusRuang, WarnaTas } from "../../inti/tipe";

/** Tunda tampilan = 100 + 2J ms, dijepit 120–250 ms; J dan d̄ rata-rata bergerak eksponensial α 0,1 (P-20). */
export const TUNDA = { dasarMs: 100, kaliJitter: 2, minMs: 120, maksMs: 250, jitterAwalMs: 25, alfa: 0.1 } as const;
/** JS-15 (P-24, D-5 a): di lobi dan hitung mundur `dunia` paling sering setiap 300 ms, jadi tunda tampilan paling sedikit 320 ms. */
export const TUNDA_LOBI_MIN_MS = 320;

/** Tunda tampilan untuk status ruang: 120–250 ms di `main` (P-20 JS-07), paling sedikit 320 ms di lobi dan hitung mundur. */
export function tundaUntukStatus(tundaMs: number, status: StatusRuang): number {
  return status === "lobi" || status === "hitung_mundur" ? Math.max(TUNDA_LOBI_MIN_MS, tundaMs) : tundaMs;
}
/** Penerusan paling lama 100 ms sesudah butir terakhir (P-21). */
export const TERUS_MAKS_MS = 100;
/** Di status `main`, pemain yang tidak muncul di `dunia` selama 2,5 detik disembunyikan (P-22). */
export const SEMBUNYI_MS = 2500;
/** Penyangga paling banyak 10 butir terbaru per pemain (P-19). */
export const PENYANGGA_MAKS = 10;

export interface Butir {
  w: number; // waktu server `dunia.w`
  x: number;
  y: number;
  arah: Arah;
  jalan: boolean;
}

export interface Tampilan {
  x: number;
  y: number;
  arah: Arah;
  jalan: boolean;
}

/** Tunda tampilan yang menyesuaikan jaringan (P-20). */
export class TundaAdaptif {
  private rata: number | null = null;
  private jitter: number = TUNDA.jitterAwalMs;

  /** `d` = (jam lokal + selisih jam server) − `dunia.w` untuk setiap `dunia` yang tiba. */
  tambah(d: number): void {
    if (!Number.isFinite(d)) return;
    if (this.rata === null) {
      this.rata = d;
      return;
    }
    const simpang = Math.abs(d - this.rata);
    this.jitter += TUNDA.alfa * (simpang - this.jitter);
    this.rata += TUNDA.alfa * (d - this.rata);
  }

  get jitterMs(): number {
    return this.jitter;
  }

  get tundaMs(): number {
    return Math.min(TUNDA.maksMs, Math.max(TUNDA.minMs, TUNDA.dasarMs + TUNDA.kaliJitter * this.jitter));
  }
}

/** Posisi tampil pada waktu server `t` dari butir berurutan menurut `w` (P-21). */
export function posisiPada(butir: readonly Butir[], t: number): Tampilan | null {
  const n = butir.length;
  if (n === 0) return null;
  const awal = butir[0];
  if (t <= awal.w) return { x: awal.x, y: awal.y, arah: awal.arah, jalan: awal.jalan };
  for (let i = n - 1; i > 0; i--) {
    const a = butir[i - 1];
    const b = butir[i];
    if (t >= a.w && t <= b.w) {
      const s = b.w > a.w ? (t - a.w) / (b.w - a.w) : 1;
      return { x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s, arah: a.arah, jalan: a.jalan };
    }
  }
  const akhir = butir[n - 1];
  const lewat = t - akhir.w;
  if (n < 2 || !akhir.jalan) return { x: akhir.x, y: akhir.y, arah: akhir.arah, jalan: akhir.jalan };
  const sebelum = butir[n - 2];
  const selang = akhir.w - sebelum.w;
  if (!(selang > 0)) return { x: akhir.x, y: akhir.y, arah: akhir.arah, jalan: lewat <= TERUS_MAKS_MS && akhir.jalan };
  const terus = Math.min(lewat, TERUS_MAKS_MS);
  return {
    x: akhir.x + ((akhir.x - sebelum.x) / selang) * terus,
    y: akhir.y + ((akhir.y - sebelum.y) / selang) * terus,
    arah: akhir.arah,
    jalan: lewat <= TERUS_MAKS_MS,
  };
}

export interface InfoPemain {
  nama: string;
  avatar: number;
  warnaTas: WarnaTas;
}

interface CatatanPemain {
  butir: Butir[];
  terlihatLokal: number; // jam lokal saat terakhir muncul di `dunia`
  /** Tanda `dialog` butir `dunia` terakhir (JS-08, P-17). */
  dialog: boolean;
}

export interface PemainTampil extends Tampilan {
  id: string;
  info: InfoPemain;
  /** Pemain ini sedang membuka dialog kejadian: gelembung "…" di atas kepalanya (JS-08, P-17). */
  dialog: boolean;
  /** Tampak berlari: langkah 12 fps dan debu (JS-09, P-23). */
  lari: boolean;
}

/** Semua pemain lain yang dikenal layar ini. */
export class PemainLain {
  readonly tunda = new TundaAdaptif();
  private readonly info = new Map<string, InfoPemain>();
  private readonly catatan = new Map<string, CatatanPemain>();
  private diriId: string | null = null;

  aturDiri(id: string | null): void {
    this.diriId = id;
    if (id) this.catatan.delete(id);
  }

  /** `pemain_baru`: pemain dikenal dan boleh digambar (P-19). */
  kenal(id: string, info: InfoPemain): void {
    this.info.set(id, info);
  }

  /** `pemain_pergi` atau sesi baru. */
  /** JS-14 (P-47): nama baru dari guru; label digambar ulang dari nama ini. */
  gantiNama(id: string, nama: string): void {
    const info = this.infoPemain(id);
    if (info) this.kenal(id, { ...info, nama });
  }

  lupakan(id: string): void {
    this.info.delete(id);
    this.catatan.delete(id);
  }

  kosongkan(): void {
    this.info.clear();
    this.catatan.clear();
  }

  infoPemain(id: string): InfoPemain | undefined {
    return this.info.get(id);
  }

  /** Butir `dunia` disimpan per pemain bersama waktu server, paling banyak 10 terbaru (P-19, P-20). */
  terimaDunia(w: number, p: readonly (readonly [string, number, number, Arah, boolean, boolean?])[], jamLokal: number, selisihJam: number): void {
    this.tunda.tambah(jamLokal + selisihJam - w);
    for (const [id, x, y, arah, jalan, dialog] of p) {
      if (id === this.diriId) continue;
      let c = this.catatan.get(id);
      if (!c) {
        c = { butir: [], terlihatLokal: jamLokal, dialog: false };
        this.catatan.set(id, c);
      }
      c.terlihatLokal = jamLokal;
      c.dialog = dialog === true;
      const daftar = c.butir;
      const akhir = daftar[daftar.length - 1];
      if (akhir && w < akhir.w) continue; // butir lama yang tertukar urutan
      if (akhir && w === akhir.w) daftar.pop();
      // JS-18 (P-24): butir yang melompat dari butir terakhir mengganti seluruh penyangga.
      else if (akhir && melompat(akhir, { x, y }, w - akhir.w)) daftar.length = 0;
      daftar.push({ w, x, y, arah, jalan });
      if (daftar.length > PENYANGGA_MAKS) daftar.splice(0, daftar.length - PENYANGGA_MAKS);
    }
  }

  /** Saat ronde (kembali) berjalan, hitungan 2,5 detik dimulai lagi untuk semua pemain (P-22). */
  segarkanTerlihat(jamLokal: number): void {
    for (const c of this.catatan.values()) c.terlihatLokal = jamLokal;
  }

  /**
   * Pemain lain yang digambar pada jam server sekarang dikurangi tunda (P-21). Di status `main`, pemain yang
   * tidak muncul selama 2,5 detik tidak digambar; di lobi dan hitung mundur tetap di posisi terakhirnya (P-22).
   */
  tampil(jamServer: number, jamLokal: number, status: StatusRuang): PemainTampil[] {
    const t = jamServer - tundaUntukStatus(this.tunda.tundaMs, status);
    const hasil: PemainTampil[] = [];
    for (const [id, c] of this.catatan) {
      const info = this.info.get(id);
      if (!info || id === this.diriId) continue;
      if (status === "main" && jamLokal - c.terlihatLokal > SEMBUNYI_MS) continue;
      const pos = posisiPada(c.butir, t);
      if (!pos) continue;
      // JS-09 (P-23): berlari bila butir terakhirnya bertanda jalan dan jarak posisi tampil pada t dan t − 500 ms lebih
      // dari 45 piksel; penyangga yang butir tertuanya lebih baru dari t − 500 ms dianggap berjalan.
      const lama = c.butir[0].w <= t - 500 ? posisiPada(c.butir, t - 500) : null;
      const lari = pos.jalan && c.butir[c.butir.length - 1].jalan && lama !== null && Math.hypot(pos.x - lama.x, pos.y - lama.y) > 45;
      hasil.push({ id, info, x: pos.x, y: pos.y, arah: pos.arah, jalan: pos.jalan, dialog: c.dialog, lari });
    }
    return hasil;
  }
}
