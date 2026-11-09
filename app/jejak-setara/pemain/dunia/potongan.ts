// Potongan peta (spesifikasi JS-07, P-7 sampai P-11; Architecture 9). Peta dibagi potongan 256 × 256 piksel
// logis (16 × 16 ubin; 10 × 7 potongan, baris terakhir setinggi 64). Lapis bawah berisi ubin tanah, tumpang,
// dan bayangan dari lembar masa yang aktif, lalu bagian bawah objek; lapis atas berisi bagian atas objek.
// Bagian atas objek tidak bergantung masa, jadi lapis atas dipakai bersama semua masa. Gerbang lobi tidak masuk
// potongan (P-28). Hanya potongan di sekitar kamera yang disiapkan; yang jauh dilepas.
import { PANDANGAN } from "../../inti/aturan";
import type { Masa } from "../../inti/tipe";

export const UKURAN_POTONGAN = 256;
export const UBIN_PER_POTONGAN = 16;
export const SIMPAN_MAKS = 16;
/**
 * Potongan cincin dan potongan masa berikutnya disiapkan bertahap: empat irisan ubin (masing-masing 4 baris ubin)
 * dan satu irisan objek, satu irisan per bingkai, agar tidak ada bingkai yang tersendat karena menyiapkan satu
 * potongan utuh. Potongan yang terlihat tetap disiapkan utuh sebelum digambar (P-8).
 */
export const BARIS_PER_IRISAN = 4;
const UBIN = 16;

/** Sumber gambar dan kanvas yang dipakai modul ini; di peramban HTMLImageElement dan HTMLCanvasElement. */
export type Sumber = CanvasImageSource;
export interface KanvasPotongan {
  width: number;
  height: number;
  getContext(jenis: "2d"): CanvasRenderingContext2D | null;
}
export type BuatKanvasPotongan = (lebar: number, tinggi: number) => KanvasPotongan;

export interface ObjekGambar {
  x: number; // ubin, pojok kiri atas jejak kaki
  y: number;
  tinggi: number; // jejak kaki dalam ubin
  bawah: Sumber & { width: number; height: number };
  atas: (Sumber & { width: number; height: number }) | null;
}

export interface DataPotongan {
  lebarUbin: number;
  tinggiUbin: number;
  kolomLembar: number;
  daftar: readonly (number | null)[];
  tanah: Uint8Array;
  tumpang: Uint8Array;
  bayangan: Uint8Array;
  lembar: Record<Masa, Sumber>;
  /** Urutan objek kampung.json, tanpa gerbang lobi. */
  objek: readonly ObjekGambar[];
}

interface Kotak {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Kotak gambar objek dalam piksel logis: bagian atas di (16x − 1, 16y − 1), bagian bawah tepat di bawahnya. */
export function kotakObjek(o: ObjekGambar): Kotak {
  const tinggiAtas = o.atas ? o.atas.height : 0;
  return { x: o.x * UBIN - 1, y: o.y * UBIN - 1, w: o.bawah.width, h: tinggiAtas + o.bawah.height };
}

/** Kotak bagian atas objek (untuk siluet, P-6); null bila objek tidak punya bagian atas. */
export function kotakAtas(o: ObjekGambar): Kotak | null {
  if (!o.atas) return null;
  return { x: o.x * UBIN - 1, y: o.y * UBIN - 1, w: o.atas.width, h: o.atas.height };
}

export const beririsan = (a: Kotak, b: Kotak) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

export interface Potongan {
  cx: number;
  cy: number;
  atas: KanvasPotongan | null; // null bila tidak ada bagian atas objek di potongan ini
  bawah: Map<Masa, KanvasPotongan>;
}

const kunci = (cx: number, cy: number) => cy * 1000 + cx;

interface Persiapan {
  cx: number;
  cy: number;
  masa: Masa;
  kanvas: KanvasPotongan;
  ctx: CanvasRenderingContext2D | null;
  irisan: number; // irisan berikutnya: 0..(jumlah irisan ubin − 1) ubin, lalu bagian bawah objek, lalu bagian atas
  atas: KanvasPotongan | null | undefined; // undefined: lapis atas belum digambar
}

/** Pengelola potongan: menyiapkan, menyimpan paling banyak 16, dan melepas yang jauh. */
export class PengelolaPotongan {
  readonly kolom: number;
  readonly baris: number;
  readonly lebarPx: number;
  readonly tinggiPx: number;
  private readonly data: DataPotongan;
  private readonly buat: BuatKanvasPotongan;
  private readonly objekPer: ObjekGambar[][];
  private readonly atasPer: Kotak[][];
  private readonly simpan = new Map<number, Potongan>();
  /** Jumlah potongan yang disiapkan (lapis bawah) sejak dibuat; untuk uji dan statistik. */
  disiapkan = 0;
  /** Bingkai sebelumnya tidak menyisakan pekerjaan untuk kunci ini (rentang potongan terlihat dan masa). */
  private selesaiUntuk = "";
  /** Potongan yang sedang disiapkan bertahap (paling banyak satu). */
  private persiapan: Persiapan | null = null;
  /** Bergantian antara pekerjaan cincin dan pekerjaan masa berikutnya. */
  private gilir = 0;

  constructor(data: DataPotongan, buat: BuatKanvasPotongan) {
    this.data = data;
    this.buat = buat;
    this.lebarPx = data.lebarUbin * UBIN;
    this.tinggiPx = data.tinggiUbin * UBIN;
    this.kolom = Math.ceil(this.lebarPx / UKURAN_POTONGAN);
    this.baris = Math.ceil(this.tinggiPx / UKURAN_POTONGAN);
    this.objekPer = Array.from({ length: this.kolom * this.baris }, () => []);
    this.atasPer = Array.from({ length: this.kolom * this.baris }, () => []);
    // Urutan gambar: tepi bawah jejak kaki, lalu x; urutan kampung.json dipertahankan bila sama (JS-06).
    const urut = data.objek
      .map((o, i) => ({ o, i }))
      .sort((a, b) => a.o.y + a.o.tinggi - (b.o.y + b.o.tinggi) || a.o.x - b.o.x || a.i - b.i)
      .map((v) => v.o);
    for (const o of urut) {
      const k = kotakObjek(o);
      const ka = kotakAtas(o);
      for (let cy = Math.max(0, Math.floor(k.y / UKURAN_POTONGAN)); cy <= Math.min(this.baris - 1, Math.floor((k.y + k.h - 1) / UKURAN_POTONGAN)); cy++) {
        for (let cx = Math.max(0, Math.floor(k.x / UKURAN_POTONGAN)); cx <= Math.min(this.kolom - 1, Math.floor((k.x + k.w - 1) / UKURAN_POTONGAN)); cx++) {
          this.objekPer[cy * this.kolom + cx].push(o);
          if (ka && beririsan(ka, this.kotakPotongan(cx, cy))) this.atasPer[cy * this.kolom + cx].push(ka);
        }
      }
    }
  }

  kotakPotongan(cx: number, cy: number): Kotak {
    const x = cx * UKURAN_POTONGAN;
    const y = cy * UKURAN_POTONGAN;
    return { x, y, w: Math.min(UKURAN_POTONGAN, this.lebarPx - x), h: Math.min(UKURAN_POTONGAN, this.tinggiPx - y) };
  }

  get jumlahDisimpan(): number {
    return this.simpan.size;
  }

  ambil(cx: number, cy: number): Potongan | undefined {
    return this.simpan.get(kunci(cx, cy));
  }

  /** Kotak bagian atas objek yang beririsan dengan kotak `k` (untuk siluet pemain sendiri, P-6). */
  atasBeririsan(k: Kotak): boolean {
    const c0 = Math.max(0, Math.floor(k.x / UKURAN_POTONGAN));
    const c1 = Math.min(this.kolom - 1, Math.floor((k.x + k.w - 1) / UKURAN_POTONGAN));
    const r0 = Math.max(0, Math.floor(k.y / UKURAN_POTONGAN));
    const r1 = Math.min(this.baris - 1, Math.floor((k.y + k.h - 1) / UKURAN_POTONGAN));
    for (let cy = r0; cy <= r1; cy++) for (let cx = c0; cx <= c1; cx++) for (const a of this.atasPer[cy * this.kolom + cx]) if (beririsan(a, k)) return true;
    return false;
  }

  /** Potongan yang terlihat dari kamera (pandangan 320 × 180). */
  terlihat(kamera: { x: number; y: number }): [number, number][] {
    const hasil: [number, number][] = [];
    const c0 = Math.max(0, Math.floor(kamera.x / UKURAN_POTONGAN));
    const c1 = Math.min(this.kolom - 1, Math.floor((kamera.x + PANDANGAN.lebar - 1) / UKURAN_POTONGAN));
    const r0 = Math.max(0, Math.floor(kamera.y / UKURAN_POTONGAN));
    const r1 = Math.min(this.baris - 1, Math.floor((kamera.y + PANDANGAN.tinggi - 1) / UKURAN_POTONGAN));
    for (let cy = r0; cy <= r1; cy++) for (let cx = c0; cx <= c1; cx++) hasil.push([cx, cy]);
    return hasil;
  }

  /** Cincin satu potongan di sekitar pandangan, urut dari yang paling dekat ke tengah pandangan. */
  cincin(kamera: { x: number; y: number }): [number, number][] {
    const lihat = this.terlihat(kamera);
    const set = new Set(lihat.map(([cx, cy]) => kunci(cx, cy)));
    const cxs = lihat.map((v) => v[0]);
    const cys = lihat.map((v) => v[1]);
    const hasil: [number, number][] = [];
    for (let cy = Math.max(0, Math.min(...cys) - 1); cy <= Math.min(this.baris - 1, Math.max(...cys) + 1); cy++) {
      for (let cx = Math.max(0, Math.min(...cxs) - 1); cx <= Math.min(this.kolom - 1, Math.max(...cxs) + 1); cx++) {
        if (!set.has(kunci(cx, cy))) hasil.push([cx, cy]);
      }
    }
    const tx = kamera.x + PANDANGAN.lebar / 2;
    const ty = kamera.y + PANDANGAN.tinggi / 2;
    const jarak = ([cx, cy]: [number, number]) => (cx * UKURAN_POTONGAN + 128 - tx) ** 2 + (cy * UKURAN_POTONGAN + 128 - ty) ** 2;
    return hasil.sort((a, b) => jarak(a) - jarak(b));
  }

  /** Lapis atas satu potongan: bagian atas objek (tidak bergantung masa). */
  private gambarAtas(cx: number, cy: number): KanvasPotongan | null {
    const kp = this.kotakPotongan(cx, cy);
    const daftar = this.objekPer[cy * this.kolom + cx].filter((o) => o.atas);
    if (daftar.length === 0) return null;
    const kanvas = this.buat(kp.w, kp.h);
    const ctx = kanvas.getContext("2d");
    if (!ctx) return kanvas;
    ctx.imageSmoothingEnabled = false;
    for (const o of daftar) if (o.atas) ctx.drawImage(o.atas, o.x * UBIN - 1 - kp.x, o.y * UBIN - 1 - kp.y);
    return kanvas;
  }

  /** Jumlah irisan ubin satu potongan (baris terakhir peta lebih pendek). */
  private irisanUbin(cy: number): number {
    return Math.ceil(this.kotakPotongan(0, cy).h / UBIN / BARIS_PER_IRISAN);
  }

  /**
   * Satu irisan lapis bawah: irisan 0..n−1 menggambar ubin tanah, tumpang, lalu bayangan untuk 4 baris ubin; irisan
   * ke-n menggambar bagian bawah objek. Ubin tidak bertumpuk antarbaris, jadi hasilnya sama dengan menggambar setiap
   * lapisan untuk seluruh potongan sekaligus.
   */
  private gambarIrisan(ctx: CanvasRenderingContext2D, cx: number, cy: number, masa: Masa, irisan: number): void {
    const kp = this.kotakPotongan(cx, cy);
    const d = this.data;
    if (irisan < this.irisanUbin(cy)) {
      const lembar = d.lembar[masa];
      const ux0 = kp.x / UBIN;
      const uy0 = kp.y / UBIN;
      const uw = kp.w / UBIN;
      const y0 = irisan * BARIS_PER_IRISAN;
      const y1 = Math.min(kp.h / UBIN, y0 + BARIS_PER_IRISAN);
      for (const lapisan of [d.tanah, d.tumpang, d.bayangan]) {
        for (let y = y0; y < y1; y++) {
          for (let x = 0; x < uw; x++) {
            const i = lapisan[(uy0 + y) * d.lebarUbin + ux0 + x];
            if (i === 0) continue;
            const n = d.daftar[i];
            if (n === null || n === undefined) continue;
            ctx.drawImage(lembar, (n % d.kolomLembar) * UBIN, Math.floor(n / d.kolomLembar) * UBIN, UBIN, UBIN, x * UBIN, y * UBIN, UBIN, UBIN);
          }
        }
      }
      return;
    }
    for (const o of this.objekPer[cy * this.kolom + cx]) {
      const tinggiAtas = o.atas ? o.atas.height : 0;
      ctx.drawImage(o.bawah, o.x * UBIN - 1 - kp.x, o.y * UBIN - 1 + tinggiAtas - kp.y);
    }
  }

  /** Lapis bawah satu potongan untuk satu masa, utuh: ubin tanah, tumpang, bayangan, lalu bagian bawah objek. */
  private gambarBawah(cx: number, cy: number, masa: Masa): KanvasPotongan {
    const kp = this.kotakPotongan(cx, cy);
    const kanvas = this.buat(kp.w, kp.h);
    const ctx = kanvas.getContext("2d");
    if (!ctx) return kanvas;
    ctx.imageSmoothingEnabled = false;
    for (let i = 0; i <= this.irisanUbin(cy); i++) this.gambarIrisan(ctx, cx, cy, masa, i);
    this.disiapkan++;
    return kanvas;
  }

  /** Satu irisan persiapan bertahap; mengembalikan true bila potongan itu selesai dan tersimpan. */
  private lanjutkanPersiapan(): boolean {
    const p = this.persiapan;
    if (!p) return false;
    const n = this.irisanUbin(p.cy);
    if (p.irisan <= n) {
      if (p.ctx) this.gambarIrisan(p.ctx, p.cx, p.cy, p.masa, p.irisan);
      p.irisan++;
      // Lapis atas tidak bergantung masa: bila potongan ini sudah tersimpan, lapis atasnya dipakai lagi.
      if (p.irisan <= n) return false;
      const ada = this.simpan.get(kunci(p.cx, p.cy));
      if (ada) p.atas = ada.atas;
      if (p.atas === undefined) return false;
    } else {
      p.atas = this.gambarAtas(p.cx, p.cy);
    }
    this.persiapan = null;
    let simpan = this.simpan.get(kunci(p.cx, p.cy));
    if (!simpan) {
      simpan = { cx: p.cx, cy: p.cy, atas: p.atas ?? null, bawah: new Map() };
      this.simpan.set(kunci(p.cx, p.cy), simpan);
    }
    if (!simpan.bawah.has(p.masa)) simpan.bawah.set(p.masa, p.kanvas);
    this.disiapkan++;
    return true;
  }

  /** Memulai persiapan bertahap satu potongan untuk satu masa. */
  private mulaiPersiapan(cx: number, cy: number, masa: Masa): void {
    const kp = this.kotakPotongan(cx, cy);
    const kanvas = this.buat(kp.w, kp.h);
    const ctx = kanvas.getContext("2d");
    if (ctx) ctx.imageSmoothingEnabled = false;
    this.persiapan = { cx, cy, masa, kanvas, ctx, irisan: 0, atas: undefined };
  }

  /** Menyiapkan satu potongan untuk satu masa bila belum ada. Mengembalikan true bila ada yang digambar. */
  siapkan(cx: number, cy: number, masa: Masa): boolean {
    let p = this.simpan.get(kunci(cx, cy));
    if (!p) {
      p = { cx, cy, atas: this.gambarAtas(cx, cy), bawah: new Map() };
      this.simpan.set(kunci(cx, cy), p);
    }
    if (p.bawah.has(masa)) return false;
    p.bawah.set(masa, this.gambarBawah(cx, cy, masa));
    return true;
  }

  /**
   * Pekerjaan satu bingkai (P-8 sampai P-11): potongan terlihat wajib siap untuk masa aktif (disiapkan utuh);
   * potongan cincin disiapkan bertahap, satu irisan per bingkai, jadi paling banyak satu potongan cincin per bingkai;
   * bila `masaBerikut` diisi (≤ 10 detik sebelum berganti), potongan yang tersimpan disiapkan ulang untuk masa
   * berikutnya dengan cara yang sama, bergantian dengan pekerjaan cincin. Potongan yang jauh dan lapis masa lain
   * dilepas; paling banyak 16 potongan disimpan. Mengembalikan jumlah lapis bawah yang selesai di bingkai ini.
   */
  perbarui(kamera: { x: number; y: number }, masa: Masa, masaBerikut: Masa | null): number {
    // Bila rentang potongan terlihat dan masa sama dengan bingkai yang sudah tuntas, tidak ada pekerjaan.
    const c0 = Math.floor(kamera.x / UKURAN_POTONGAN);
    const c1 = Math.floor((kamera.x + PANDANGAN.lebar - 1) / UKURAN_POTONGAN);
    const r0 = Math.floor(kamera.y / UKURAN_POTONGAN);
    const r1 = Math.floor((kamera.y + PANDANGAN.tinggi - 1) / UKURAN_POTONGAN);
    const kunciBingkai = `${c0},${c1},${r0},${r1},${masa},${masaBerikut ?? "-"}`;
    if (kunciBingkai === this.selesaiUntuk && !this.persiapan) return 0;
    let selesai = 0;
    const lihat = this.terlihat(kamera);
    const kunciLihat = new Set(lihat.map(([cx, cy]) => kunci(cx, cy)));
    // Persiapan bertahap untuk potongan yang kini terlihat diselesaikan sekarang.
    if (this.persiapan && this.persiapan.masa === masa && kunciLihat.has(kunci(this.persiapan.cx, this.persiapan.cy))) {
      while (this.persiapan && !this.lanjutkanPersiapan());
      selesai++;
    }
    for (const [cx, cy] of lihat) if (this.siapkan(cx, cy, masa)) selesai++;
    const cincin = this.cincin(kamera);
    const dekat = new Set<number>([...kunciLihat, ...cincin.map(([cx, cy]) => kunci(cx, cy))]);
    // Lepas yang jauh, dan lapis bawah masa yang tidak dipakai lagi.
    for (const [k, p] of this.simpan) {
      if (!dekat.has(k)) {
        this.simpan.delete(k);
        continue;
      }
      for (const m of [...p.bawah.keys()]) if (m !== masa && m !== masaBerikut) p.bawah.delete(m);
    }
    const pp = this.persiapan;
    if (pp && (!dekat.has(kunci(pp.cx, pp.cy)) || (pp.masa !== masa && pp.masa !== masaBerikut))) this.persiapan = null;
    // Paling banyak 16: cincin terjauh dilepas lebih dulu.
    const urutCincin = cincin.map(([cx, cy]) => kunci(cx, cy));
    for (let i = urutCincin.length - 1; i >= 0 && this.simpan.size > SIMPAN_MAKS; i--) this.simpan.delete(urutCincin[i]);
    // Pekerjaan cincin berikutnya: potongan cincin terdekat yang belum siap untuk masa aktif.
    let calonCincin: [number, number] | null = null;
    for (let i = 0; i < cincin.length; i++) {
      const [cx, cy] = cincin[i];
      const ada = this.simpan.get(kunci(cx, cy));
      if (ada?.bawah.has(masa)) continue;
      if (!ada && this.simpan.size >= SIMPAN_MAKS) {
        // Penuh: lepas potongan cincin tersimpan yang lebih jauh dari yang ini, bila ada.
        let korban = -1;
        for (let j = urutCincin.length - 1; j > i; j--) {
          if (this.simpan.has(urutCincin[j])) {
            korban = urutCincin[j];
            break;
          }
        }
        if (korban < 0) break;
        this.simpan.delete(korban);
      }
      calonCincin = [cx, cy];
      break;
    }
    // Pekerjaan masa berikutnya: potongan tersimpan yang belum punya lapis masa berikutnya.
    let calonMasa: [number, number] | null = null;
    if (masaBerikut && masaBerikut !== masa) {
      for (const [cx, cy] of [...lihat, ...cincin]) {
        const p = this.simpan.get(kunci(cx, cy));
        if (p && !p.bawah.has(masaBerikut)) {
          calonMasa = [cx, cy];
          break;
        }
      }
    }
    // Satu irisan per bingkai: lanjutkan persiapan yang ada, atau mulai yang baru (bergantian cincin dan masa).
    if (!this.persiapan) {
      const pilihMasa = calonMasa !== null && (calonCincin === null || this.gilir % 2 === 1);
      if (pilihMasa && calonMasa) this.mulaiPersiapan(calonMasa[0], calonMasa[1], masaBerikut as Masa);
      else if (calonCincin) this.mulaiPersiapan(calonCincin[0], calonCincin[1], masa);
      this.gilir++;
    }
    if (this.persiapan && this.lanjutkanPersiapan()) selesai++;
    // Tuntas bila tidak ada persiapan yang berjalan atau tersisa.
    this.selesaiUntuk = this.persiapan || calonCincin || calonMasa ? "" : kunciBingkai;
    return selesai;
  }

  /** Lapis bawah potongan untuk masa itu (disiapkan bila belum ada) dan lapis atasnya. */
  lapis(cx: number, cy: number, masa: Masa): { bawah: KanvasPotongan; atas: KanvasPotongan | null } {
    this.siapkan(cx, cy, masa);
    const p = this.simpan.get(kunci(cx, cy)) as Potongan;
    return { bawah: p.bawah.get(masa) as KanvasPotongan, atas: p.atas };
  }
}
