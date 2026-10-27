// Unduh rekap (FR-20; spesifikasi F-09, bagian "Unduh rekap"): nama berkas, tanggal lembar, batas waktu, gambar lembar
// lewat modern-screenshot 4.7.0 (keputusan Gerbang 1 F-09), dan penyerahan berkas ke peramban. Fungsi murni diuji di
// download.test.ts; alurnya (tombol, kabar, pembatalan) diatur PlayScreen.tsx.
import { domToCanvas } from "modern-screenshot";

/** Batas waktu penyiapan satu berkas (DRAF A-7). */
export const DOWNLOAD_TIMEOUT_MS = 15_000;

/** Lembar unduhan: A4 pada 150 dpi. */
export const SHEET_SIZE = { w: 1240, h: 1754 } as const;

export type DownloadKind = "png" | "pdf";

/**
 * Lama URL blob dipertahankan sesudah klik, agar peramban yang lebih dulu bertanya (misalnya Safari iPad: "Unduh …?")
 * tetap bisa membacanya walaupun guru lama menjawab. URL tetap dilepas saat layar permainan ditutup.
 */
const RELEASE_MS = 5 * 60_000;

const two = (n: number) => String(n).padStart(2, "0");

/** rekap-sehari-setara-{YYYY-MM-DD}.{png|pdf}, dengan tanggal waktu setempat komputer (DRAF A-5). */
export function downloadFileName(kind: DownloadKind, date: Date): string {
  return `rekap-sehari-setara-${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}.${kind}`;
}

/** Tanggal panjang Indonesia untuk kepala lembar, misalnya "Selasa, 27 Oktober 2026" (DRAF A-3). */
export function sheetDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}

/** Promise yang ditolak bila promise belum selesai sesudah ms; pewaktunya dibersihkan begitu promise selesai. */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Waktu penyiapan habis")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

/**
 * Menggambar lembar unduhan menjadi kanvas 1.240 px; huruf dan ikon dimuat dari situs sendiri oleh modern-screenshot.
 * Tanpa font.preferredFormat: di modern-screenshot 4.7.0 pilihan itu menghapus src @font-face kedua (Pixelify Sans),
 * sehingga lembar memakai huruf pengganti (temuan Build F-09). Huruf disematkan dengan pengaturan bawaan.
 */
export function renderSheet(node: HTMLElement): Promise<HTMLCanvasElement> {
  return domToCanvas(node, { scale: 1, timeout: 10_000 });
}

/** Kanvas menjadi PNG; ditolak bila peramban tidak menghasilkan berkas. */
export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Gambar tidak terbentuk"))), "image/png");
  });
}

/**
 * Menyerahkan berkas ke peramban lewat tautan blob: sementara dengan atribut download. URL dilepas 5 menit sesudah
 * klik; fungsi yang dikembalikan melepasnya saat itu juga (dipanggil saat layar ditutup).
 */
export function saveBlob(blob: Blob, name: string): () => void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const release = () => {
    if (timer === undefined) return;
    clearTimeout(timer);
    timer = undefined;
    URL.revokeObjectURL(url);
  };
  timer = setTimeout(release, RELEASE_MS);
  return release;
}
