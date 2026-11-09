// Bantuan uji gambar di Node (spesifikasi JS-07, rencana uji potongan dan aset): pengurai PNG kecil (RGB dan RGBA
// 8 bit tanpa interlace) dan kanvas tiruan dengan drawImage tanpa skala dan paduan source-over, cukup untuk aset
// Jejak Setara yang tidak punya piksel semi-transparan.
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

export interface GambarUji {
  width: number;
  height: number;
  data: Uint8ClampedArray; // RGBA
}

export const AKAR = new URL("../../../../", import.meta.url);
const FOLDER_ASET = "app/jejak-setara/assets/";

/** Jalur berkas aset dari URL impor manifest di lingkungan uji. */
export function berkasAset(url: string): string {
  const i = url.indexOf(FOLDER_ASET);
  if (i === -1) throw new Error(`URL aset tidak dikenal: ${url}`);
  return FOLDER_ASET + url.slice(i + FOLDER_ASET.length).split(/[?#]/)[0];
}

export function bacaPng(jalur: string): GambarUji {
  const b = readFileSync(new URL(jalur, AKAR));
  if (b.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error(`${jalur} bukan PNG`);
  let i = 8;
  let lebar = 0;
  let tinggi = 0;
  let jenisWarna = 0;
  const idat: Buffer[] = [];
  while (i < b.length) {
    const panjang = b.readUInt32BE(i);
    const jenis = b.subarray(i + 4, i + 8).toString("latin1");
    const isi = b.subarray(i + 8, i + 8 + panjang);
    if (jenis === "IHDR") {
      lebar = isi.readUInt32BE(0);
      tinggi = isi.readUInt32BE(4);
      if (isi[8] !== 8 || isi[12] !== 0) throw new Error(`${jalur}: hanya 8 bit tanpa interlace`);
      jenisWarna = isi[9];
    } else if (jenis === "IDAT") idat.push(isi);
    else if (jenis === "IEND") break;
    i += 12 + panjang;
  }
  if (jenisWarna !== 2 && jenisWarna !== 6) throw new Error(`${jalur}: jenis warna ${jenisWarna} belum didukung`);
  const bpp = jenisWarna === 6 ? 4 : 3;
  const mentah = inflateSync(Buffer.concat(idat));
  const baris = lebar * bpp;
  const hasil = new Uint8Array(tinggi * baris);
  for (let y = 0; y < tinggi; y++) {
    const f = mentah[y * (baris + 1)];
    for (let x = 0; x < baris; x++) {
      const v = mentah[y * (baris + 1) + 1 + x];
      const a = x >= bpp ? hasil[y * baris + x - bpp] : 0;
      const atas = y > 0 ? hasil[(y - 1) * baris + x] : 0;
      const c = x >= bpp && y > 0 ? hasil[(y - 1) * baris + x - bpp] : 0;
      let p = 0;
      if (f === 1) p = a;
      else if (f === 2) p = atas;
      else if (f === 3) p = (a + atas) >> 1;
      else if (f === 4) {
        const q = a + atas - c;
        const pa = Math.abs(q - a);
        const pb = Math.abs(q - atas);
        const pc = Math.abs(q - c);
        p = pa <= pb && pa <= pc ? a : pb <= pc ? atas : c;
      }
      hasil[y * baris + x] = (v + p) & 255;
    }
  }
  const data = new Uint8ClampedArray(lebar * tinggi * 4);
  for (let p = 0; p < lebar * tinggi; p++) {
    data[p * 4] = hasil[p * bpp];
    data[p * 4 + 1] = hasil[p * bpp + 1];
    data[p * 4 + 2] = hasil[p * bpp + 2];
    data[p * 4 + 3] = bpp === 4 ? hasil[p * bpp + 3] : 255;
  }
  return { width: lebar, height: tinggi, data };
}

/** Kanvas tiruan: cukup untuk drawImage tanpa skala, clearRect, dan membaca piksel. */
export class KanvasUji implements GambarUji {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  panggilan = 0;
  private readonly ctx: KonteksUji;

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.data = new Uint8ClampedArray(w * h * 4);
    this.ctx = new KonteksUji(this);
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx as unknown as CanvasRenderingContext2D;
  }
}

class KonteksUji {
  imageSmoothingEnabled = true;
  readonly canvas: KanvasUji;

  constructor(k: KanvasUji) {
    this.canvas = k;
  }

  clearRect(x: number, y: number, w: number, h: number): void {
    const k = this.canvas;
    for (let yy = Math.max(0, y); yy < Math.min(k.height, y + h); yy++) for (let xx = Math.max(0, x); xx < Math.min(k.width, x + w); xx++) k.data.fill(0, (yy * k.width + xx) * 4, (yy * k.width + xx) * 4 + 4);
  }

  drawImage(src: GambarUji, ...a: number[]): void {
    this.canvas.panggilan++;
    let [sx, sy, sw, sh, dx, dy] = [0, 0, src.width, src.height, a[0], a[1]];
    if (a.length === 8) {
      [sx, sy, sw, sh, dx, dy] = a;
      if (a[6] !== sw || a[7] !== sh) throw new Error("KanvasUji tidak mendukung skala");
    } else if (a.length !== 2) throw new Error("KanvasUji: bentuk drawImage tidak didukung");
    const k = this.canvas;
    for (let y = 0; y < sh; y++) {
      const ty = dy + y;
      if (ty < 0 || ty >= k.height || sy + y >= src.height) continue;
      for (let x = 0; x < sw; x++) {
        const tx = dx + x;
        if (tx < 0 || tx >= k.width || sx + x >= src.width) continue;
        const s = ((sy + y) * src.width + sx + x) * 4;
        const t = (ty * k.width + tx) * 4;
        const as = src.data[s + 3] / 255;
        if (as === 0) continue;
        const at = k.data[t + 3] / 255;
        const ao = as + at * (1 - as);
        for (let c = 0; c < 3; c++) k.data[t + c] = Math.round((src.data[s + c] * as + k.data[t + c] * at * (1 - as)) / ao);
        k.data[t + 3] = Math.round(ao * 255);
      }
    }
  }
}

/** Kanvas tiruan ringan untuk uji perilaku: hanya menghitung panggilan, tanpa piksel. */
export class KanvasHitung {
  width: number;
  height: number;
  panggilan = 0;

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  getContext(): CanvasRenderingContext2D {
    return {
      imageSmoothingEnabled: false,
      drawImage: () => {
        this.panggilan++;
      },
      clearRect: () => undefined,
    } as unknown as CanvasRenderingContext2D;
  }
}
