// Aset gambar layar dunia (spesifikasi JS-07, P-5, P-6, P-21; Architecture 9 dan 11.2; Design System 7 dan 8).
// Semua gambar dimuat dari manifest.ts, satu-satunya pintu masuk aset. Bagian murni (ganti warna tas, garis
// siluet) bekerja pada larik piksel RGBA, sehingga bisa diuji di Node; bagian peramban memakai kanvas.
import { AVATAR, IKON, KUNCI_TAS, OBJEK, TANDA, UBIN, WARNA_TAS } from "../../assets/manifest";
import type { Arah, Masa, WarnaTas } from "../../inti/tipe";
import { GERBANG, OBJEK_PETA } from "./petaKampung";

export type Rgb = readonly [number, number, number];

export function hexKeRgb(hex: string): Rgb {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Mengganti dua warna kunci tas serentak (Design System 8): piksel `dasar` lama menjadi `dasar` baru dan piksel
 * `bayangan` lama menjadi `bayangan` baru dalam satu lintasan, sehingga hasil satu penggantian tidak terganti
 * lagi. Piksel transparan dan warna lain tidak berubah. Mengembalikan jumlah piksel yang diganti.
 */
export function gantiWarnaTas(data: Uint8ClampedArray, lama: { dasar: Rgb; bayangan: Rgb }, baru: { dasar: Rgb; bayangan: Rgb }): number {
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let ke: Rgb | null = null;
    if (r === lama.dasar[0] && g === lama.dasar[1] && b === lama.dasar[2]) ke = baru.dasar;
    else if (r === lama.bayangan[0] && g === lama.bayangan[1] && b === lama.bayangan[2]) ke = baru.bayangan;
    if (!ke) continue;
    data[i] = ke[0];
    data[i + 1] = ke[1];
    data[i + 2] = ke[2];
    n++;
  }
  return n;
}

/** Garis siluet melebar 2 piksel di setiap sisi bentuk. */
export const SILUET_TEPI = 2;

/**
 * Garis siluet dua lapis (P-6; Design System 7, lapisan 60) dari bentuk w × h (alpha > 0 = bentuk). Hasilnya
 * kisi (w + 4) × (h + 4): 1 = garis dalam `ink` (di luar bentuk, bertetangga 4 arah dengan bentuk), 2 = garis
 * luar `sun` (di luar bentuk dan garis dalam, bertetangga 4 arah dengan garis dalam), 0 = kosong.
 */
export function garisSiluet(alpha: ArrayLike<number>, w: number, h: number): Uint8Array {
  const W = w + 2 * SILUET_TEPI;
  const H = h + 2 * SILUET_TEPI;
  const bentuk = new Uint8Array(W * H);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (alpha[y * w + x] > 0) bentuk[(y + SILUET_TEPI) * W + x + SILUET_TEPI] = 1;
  const hasil = new Uint8Array(W * H);
  const tetangga = (kisi: Uint8Array, x: number, y: number, nilai: number) =>
    (x > 0 && kisi[y * W + x - 1] === nilai) ||
    (x < W - 1 && kisi[y * W + x + 1] === nilai) ||
    (y > 0 && kisi[(y - 1) * W + x] === nilai) ||
    (y < H - 1 && kisi[(y + 1) * W + x] === nilai);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!bentuk[y * W + x] && tetangga(bentuk, x, y, 1)) hasil[y * W + x] = 1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) if (!bentuk[y * W + x] && hasil[y * W + x] === 0 && tetangga(hasil, x, y, 1)) hasil[y * W + x] = 2;
  }
  return hasil;
}

// ---------------------------------------------------------------------------------------------
// Peramban

export type Kanvas = HTMLCanvasElement;
export type BuatKanvas = (lebar: number, tinggi: number) => Kanvas;

export const buatKanvasPeramban: BuatKanvas = (lebar, tinggi) => {
  const k = document.createElement("canvas");
  k.width = lebar;
  k.height = tinggi;
  return k;
};

/** Strip tokoh siap gambar: bingkai 16 × 24 berdampingan. */
export interface Strip {
  gambar: CanvasImageSource;
  lebar: number;
  tinggi: number;
  bingkai: number;
}
export type Pose = "diam" | "jalan";
export type SetStrip = Record<Arah, Record<Pose, Strip>>;

export interface AsetDunia {
  ubin: Record<Masa, HTMLImageElement>;
  objek: Map<string, { bawah: HTMLImageElement; atas: HTMLImageElement | null }>;
  avatar: { arah: Record<"bawah" | "atas" | "kanan", Record<Pose, HTMLImageElement>> }[];
  ikon: Map<string, HTMLImageElement>;
  tanda: Map<string, HTMLImageElement>;
}

/** Ikon dan tanda yang dipakai layar dunia JS-07 (bagian "Aset" spesifikasi). */
export const IKON_DUNIA = [
  "ikon_mini_halte",
  "ikon_matahari",
  "ikon_menyambung",
  "ikon_putar_hp",
  "ikon_layar_penuh",
  "ikon_zona_1",
  "ikon_zona_2",
  "ikon_zona_3",
  "ikon_zona_4",
  "ikon_zona_5",
  "ikon_zona_6",
  "ikon_zona_7",
  "ikon_zona_8",
] as const;
export const TANDA_DUNIA = ["tanda_diri"] as const;

/** Jenis objek yang digambar layar dunia: semua jenis di kampung.json, ditambah kedua gambar gerbang. */
export function jenisObjekDunia(): string[] {
  return [...new Set([...OBJEK_PETA.map((o) => o.jenis), GERBANG.jenis, "gerbang_buka", "gerbang_tutup"])].sort();
}

/** Semua URL yang dimuat sebelum tombol "Masuk" aktif (Architecture 9; status antarmuka "Memuat aset"). */
export function daftarUrlDunia(): string[] {
  const url: string[] = [UBIN.pagi, UBIN.siang, UBIN.sore];
  for (const j of jenisObjekDunia()) {
    const o = OBJEK[j];
    if (!o) continue;
    url.push(o.bawah.url);
    if (o.atas) url.push(o.atas.url);
  }
  for (const a of AVATAR) {
    for (const arah of ["bawah", "atas", "kanan"] as const) url.push(a[arah].diam.url, a[arah].jalan.url);
    url.push(a.ikon.url);
  }
  for (const n of IKON_DUNIA) if (IKON[n]) url.push(IKON[n].url);
  for (const n of TANDA_DUNIA) if (TANDA[n]) url.push(TANDA[n].url);
  return [...new Set(url)];
}

function muatSatu(url: string): Promise<HTMLImageElement> {
  return new Promise((ok, gagal) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => ok(img);
    img.onerror = () => gagal(new Error(`gambar gagal dimuat: ${url}`));
    img.src = url;
  });
}

/** Memuat semua gambar dunia; gambar yang gagal dicoba lagi sekali. */
export async function muatAsetDunia(): Promise<AsetDunia> {
  const cache = new Map<string, HTMLImageElement>();
  const muat = async (url: string) => {
    const ada = cache.get(url);
    if (ada) return ada;
    let img: HTMLImageElement;
    try {
      img = await muatSatu(url);
    } catch {
      img = await muatSatu(url);
    }
    cache.set(url, img);
    return img;
  };
  await Promise.all(daftarUrlDunia().map(muat));
  const ambil = (url: string) => cache.get(url) as HTMLImageElement;
  const objek = new Map<string, { bawah: HTMLImageElement; atas: HTMLImageElement | null }>();
  for (const j of jenisObjekDunia()) {
    const o = OBJEK[j];
    if (o) objek.set(j, { bawah: ambil(o.bawah.url), atas: o.atas ? ambil(o.atas.url) : null });
  }
  const ikon = new Map<string, HTMLImageElement>();
  for (const n of IKON_DUNIA) if (IKON[n]) ikon.set(n, ambil(IKON[n].url));
  const tanda = new Map<string, HTMLImageElement>();
  for (const n of TANDA_DUNIA) if (TANDA[n]) tanda.set(n, ambil(TANDA[n].url));
  return {
    ubin: { pagi: ambil(UBIN.pagi), siang: ambil(UBIN.siang), sore: ambil(UBIN.sore) },
    objek,
    avatar: AVATAR.map((a) => ({
      arah: {
        bawah: { diam: ambil(a.bawah.diam.url), jalan: ambil(a.bawah.jalan.url) },
        atas: { diam: ambil(a.atas.diam.url), jalan: ambil(a.atas.jalan.url) },
        kanan: { diam: ambil(a.kanan.diam.url), jalan: ambil(a.kanan.jalan.url) },
      },
    })),
    ikon,
    tanda,
  };
}

function salinStrip(buat: BuatKanvas, img: CanvasImageSource & { width: number; height: number }, warna: WarnaTas | null): Kanvas {
  const k = buat(img.width, img.height);
  const ctx = k.getContext("2d", { willReadFrequently: true });
  if (!ctx) return k;
  ctx.drawImage(img, 0, 0);
  if (warna && warna !== "sun") {
    const data = ctx.getImageData(0, 0, img.width, img.height);
    const [dasar, bayangan] = WARNA_TAS[warna];
    gantiWarnaTas(data.data, { dasar: hexKeRgb(KUNCI_TAS.dasar), bayangan: hexKeRgb(KUNCI_TAS.bayangan) }, { dasar: hexKeRgb(dasar), bayangan: hexKeRgb(bayangan) });
    ctx.putImageData(data, 0, 0);
  }
  return k;
}

/** Strip arah kiri: setiap bingkai arah kanan dicerminkan sendiri-sendiri, urutan bingkai tetap (P-5). */
export function cerminStrip(buat: BuatKanvas, sumber: Kanvas, lebarBingkai: number): Kanvas {
  const k = buat(sumber.width, sumber.height);
  // willReadFrequently: strip ini dibaca lagi saat garis siluet dibuat.
  const ctx = k.getContext("2d", { willReadFrequently: true });
  if (!ctx) return k;
  const n = Math.round(sumber.width / lebarBingkai);
  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.translate((i + 1) * lebarBingkai, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(sumber, i * lebarBingkai, 0, lebarBingkai, sumber.height, 0, 0, lebarBingkai, sumber.height);
    ctx.restore();
  }
  return k;
}

const BINGKAI: Record<Pose, number> = { diam: 2, jalan: 4 };

/** Satu set strip avatar untuk satu warna tas: empat arah, diam dan jalan (Architecture 9, "Warna tas"). */
export function buatSetAvatar(buat: BuatKanvas, aset: AsetDunia, avatar: number, warna: WarnaTas): SetStrip {
  const a = aset.avatar[avatar] ?? aset.avatar[0];
  const set = {} as SetStrip;
  for (const arah of ["bawah", "atas", "kanan"] as const) {
    set[arah] = {
      diam: { gambar: salinStrip(buat, a.arah[arah].diam, warna), lebar: 16, tinggi: 24, bingkai: BINGKAI.diam },
      jalan: { gambar: salinStrip(buat, a.arah[arah].jalan, warna), lebar: 16, tinggi: 24, bingkai: BINGKAI.jalan },
    };
  }
  set.kiri = {
    diam: { ...set.kanan.diam, gambar: cerminStrip(buat, set.kanan.diam.gambar as Kanvas, 16) },
    jalan: { ...set.kanan.jalan, gambar: cerminStrip(buat, set.kanan.jalan.gambar as Kanvas, 16) },
  };
  return set;
}

/** Strip garis siluet untuk satu strip tokoh: setiap bingkai (16 + 4) × (24 + 4), warna ink dan sun. */
export function buatStripSiluet(buat: BuatKanvas, strip: Strip): Strip {
  const sumber = strip.gambar as Kanvas;
  const ctxSumber = sumber.getContext("2d", { willReadFrequently: true });
  const lebarB = strip.lebar + 2 * SILUET_TEPI;
  const tinggiB = strip.tinggi + 2 * SILUET_TEPI;
  const k = buat(lebarB * strip.bingkai, tinggiB);
  const ctx = k.getContext("2d");
  if (!ctxSumber || !ctx) return { gambar: k, lebar: lebarB, tinggi: tinggiB, bingkai: strip.bingkai };
  const tinta = hexKeRgb("#1F2A44");
  const matahari = hexKeRgb("#FFD23F");
  const hasil = ctx.createImageData(k.width, k.height);
  for (let i = 0; i < strip.bingkai; i++) {
    const data = ctxSumber.getImageData(i * strip.lebar, 0, strip.lebar, strip.tinggi).data;
    const alpha = new Uint8Array(strip.lebar * strip.tinggi);
    for (let p = 0; p < alpha.length; p++) alpha[p] = data[p * 4 + 3];
    const garis = garisSiluet(alpha, strip.lebar, strip.tinggi);
    for (let y = 0; y < tinggiB; y++) {
      for (let x = 0; x < lebarB; x++) {
        const v = garis[y * lebarB + x];
        if (!v) continue;
        const warna = v === 1 ? tinta : matahari;
        const j = (y * k.width + i * lebarB + x) * 4;
        hasil.data[j] = warna[0];
        hasil.data[j + 1] = warna[1];
        hasil.data[j + 2] = warna[2];
        hasil.data[j + 3] = 255;
      }
    }
  }
  ctx.putImageData(hasil, 0, 0);
  return { gambar: k, lebar: lebarB, tinggi: tinggiB, bingkai: strip.bingkai };
}

export function buatSetSiluet(buat: BuatKanvas, set: SetStrip): SetStrip {
  const hasil = {} as SetStrip;
  for (const arah of ["bawah", "atas", "kanan", "kiri"] as const) {
    hasil[arah] = { diam: buatStripSiluet(buat, set[arah].diam), jalan: buatStripSiluet(buat, set[arah].jalan) };
  }
  return hasil;
}
