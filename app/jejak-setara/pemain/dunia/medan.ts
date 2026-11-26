// Gambar medan peta (spesifikasi JS-23, P-2 sampai P-7 dan P-12): pilihan gambar peta mini menurut rasio layar, ukuran
// kanvas simpanan, letak dan lebar label zona peta besar, serta pemuat gambar sekali per halaman dengan satu kali coba
// ulang (DRAF D-3 pilihan a). Bagian murni bisa diuji di Node; pemuat dan kanvas simpanan menerima pembuat gambar,
// kanvas, dan jam dari luar.

/** Gambar peta mini: 2 px per ubin di layar berasio 2 ke atas, 1 px per ubin di bawahnya (P-2). */
export function pilihMedan(rasio: number): 1 | 2 {
  return rasio >= 2 ? 2 : 1;
}

/** Ukuran kanvas simpanan peta mini dalam piksel perangkat: 160 × 0,7r kali 100 × 0,7r, dibulatkan (P-7). */
export function ukuranMedanMini(
  rasio: number,
  ubin: { lebar: number; tinggi: number } = { lebar: 160, tinggi: 100 },
  pxPerUbin = 0.7,
): { lebar: number; tinggi: number } {
  return { lebar: Math.round(ubin.lebar * pxPerUbin * rasio), tinggi: Math.round(ubin.tinggi * pxPerUbin * rasio) };
}

/** Lebar luar label zona v1.0: isi paling lebar 180 px, ditambah jarak dalam 6 px dan garis 2 px di kedua sisi. */
export const LEBAR_LABEL_V10 = 196;

/**
 * Letak label zona di peta besar dengan s px CSS per ubin (P-12; DRAF D-1 pilihan a): pojok kiri atas 3 px dari pojok
 * zona, dan lebar luar paling besar lebar zona dikurangi 6 px, tidak lebih lebar daripada label v1.0.
 */
export function letakLabelZona(z: { kiri: number; atas: number; kanan: number }, s: number): { kiri: number; atas: number; lebarMaks: number } {
  return { kiri: z.kiri * s + 3, atas: z.atas * s + 3, lebarMaks: Math.min(LEBAR_LABEL_V10, (z.kanan - z.kiri + 1) * s - 6) };
}

/** Jeda paling cepat sebelum satu kali coba ulang gambar yang gagal dimuat (P-5; DRAF D-3 pilihan a). */
export const JEDA_COBA_ULANG_MS = 10_000;

interface Muatan {
  gambar: HTMLImageElement;
  status: "memuat" | "siap" | "gagal";
  gagal: number;
  gagalPada: number;
}

export interface PemuatMedan {
  /** Gambar bila sudah siap. Bila belum, mulai memuat (atau coba ulang sekali bila sudah waktunya) dan mengembalikan null. */
  ambil(url: string): HTMLImageElement | null;
  /** Fungsi dipanggil setiap kali sebuah gambar menjadi siap; hasilnya menghentikan pendengar itu. */
  dengar(fungsi: () => void): () => void;
}

/** Pemuat gambar medan (P-4 dan P-5): sekali per URL, satu kali coba ulang paling cepat `jeda` sesudah gagal pertama. */
export function buatPemuatMedan(buatGambar: () => HTMLImageElement, jeda = JEDA_COBA_ULANG_MS, jam: () => number = () => Date.now()): PemuatMedan {
  const muatan = new Map<string, Muatan>();
  const pendengar = new Set<() => void>();
  const mulai = (url: string, gagal: number) => {
    const m: Muatan = { gambar: buatGambar(), status: "memuat", gagal, gagalPada: 0 };
    m.gambar.onload = () => {
      m.status = "siap";
      for (const f of [...pendengar]) f();
    };
    m.gambar.onerror = () => {
      m.status = "gagal";
      m.gagal += 1;
      m.gagalPada = jam();
    };
    muatan.set(url, m);
    m.gambar.src = url;
  };
  return {
    ambil(url) {
      const m = muatan.get(url);
      if (!m) {
        mulai(url, 0);
        return null;
      }
      if (m.status === "siap") return m.gambar;
      if (m.status === "gagal" && m.gagal === 1 && jam() - m.gagalPada >= jeda) mulai(url, 1);
      return null;
    },
    dengar(fungsi) {
      pendengar.add(fungsi);
      return () => {
        pendengar.delete(fungsi);
      };
    },
  };
}

/** Pemuat bersama layar pemain: peta mini dan peta besar memakai gambar yang sama (P-4). */
export const MEDAN = buatPemuatMedan(() => new Image());

/**
 * Kanvas simpanan peta mini (P-7): sumber diubah ukurannya sekali tanpa penghalusan, dan dibuat ulang hanya bila
 * sumber atau ukurannya berubah.
 */
export function buatSimpananMedan(buatKanvas: (lebar: number, tinggi: number) => HTMLCanvasElement) {
  let simpan: { sumber: CanvasImageSource; lebar: number; tinggi: number; kanvas: HTMLCanvasElement } | null = null;
  return (sumber: CanvasImageSource, lebar: number, tinggi: number): HTMLCanvasElement => {
    if (!simpan || simpan.sumber !== sumber || simpan.lebar !== lebar || simpan.tinggi !== tinggi) {
      const kanvas = buatKanvas(lebar, tinggi);
      const ctx = kanvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sumber, 0, 0, lebar, tinggi);
      }
      simpan = { sumber, lebar, tinggi, kanvas };
    }
    return simpan.kanvas;
  };
}
