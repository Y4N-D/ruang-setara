// Aturan ketukan tombol HUD (spesifikasi JS-24, P-7 sampai P-12; Architecture 9; Design System 3.3 dan 10).
// Peramban hanya membuat `click` untuk ketukan satu jari, sehingga ketukan jari kedua selama jari lain memegang analog
// tidak pernah sampai ke `onClick`. Karena itu jari yang menekan tombol HUD menjalankan aksinya sendiri: saat jari itu
// diangkat di dalam kotak tombol yang diperluas 8 px, apa pun jari lain yang sedang menyentuh layar dan apa pun
// urutannya. Aksi berjalan saat `touchend` jari itu, dan `touchend` dicegah, agar peramban tidak membuat klik dan
// peristiwa tetikus pengganti: aksi tepat sekali dan tidak ada klik yang jatuh ke lapisan yang baru terbuka.
// Pendengar `touchend` dipasang langsung di tombol dan tidak dilepas, karena peramban tetap mengirim `touchend` ke tombol
// yang sudah hilang dari halaman, sedangkan pendengar React di akar halaman tidak menerimanya lagi. Peramban tanpa Touch
// Events menjalankan aksi pada giliran berikutnya lewat penjadwal cadangan. Tetikus, papan ketik, dan pena tetap memakai
// klik. Bagian murni (`dalamKotak`, `klikPertama`, dan `PencatatTekan`) diuji tanpa peramban.
import { useCallback, useLayoutEffect, useRef, type MouseEvent as MouseEventReact, type PointerEvent as PointerEventReact } from "react";

/** Perluasan kotak tombol untuk titik angkat jari, px CSS (P-8). */
export const PERLUASAN_PX = 8;
/** Klik yang tiba kurang dari selang ini sesudah aksi sentuh di tombol yang sama diabaikan, ms (P-10). */
export const JEDA_KLIK_MS = 800;

export interface KotakLayar {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Tombol yang diketuk, dalam bentuk yang bisa ditiru di uji unit. */
export interface UnsurTekan {
  getBoundingClientRect(): KotakLayar;
  readonly isConnected: boolean;
  /** Benar bila sasaran sebuah sentuhan berada di dalam tombol ini. */
  memuat(sasaran: unknown): boolean;
}

export interface PeristiwaPointer {
  pointerType: string;
  pointerId: number;
  clientX: number;
  clientY: number;
}

export interface PeristiwaSentuhSelesai {
  changedTouches: ArrayLike<{ target: unknown }>;
  cancelable?: boolean;
  preventDefault(): void;
}

/** Klik: `pointerType` hanya ada di peramban yang mengirim klik sebagai PointerEvent; `detail` 0 untuk papan ketik. */
export interface PeristiwaKlik {
  pointerType?: string;
  detail: number;
}

export interface Penjadwal {
  jam(): number;
  jadwalkan(f: () => void): unknown;
  batalkan(tugas: unknown): void;
}

export const PENJADWAL_PERAMBAN: Penjadwal = {
  jam: () => performance.now(),
  jadwalkan: (f) => window.setTimeout(f, 0),
  batalkan: (tugas) => window.clearTimeout(tugas as number),
};

/** Titik (x, y) di dalam kotak yang diperluas `perluas` px ke setiap sisi; tepat di garis perluasan masih di dalam (P-8). */
export function dalamKotak(k: KotakLayar, x: number, y: number, perluas: number = PERLUASAN_PX): boolean {
  return x >= k.left - perluas && x <= k.right + perluas && y >= k.top - perluas && y <= k.bottom + perluas;
}

/** Penyaring klik tombol suara (P-4 JS-14): klik kedua dan seterusnya dari klik ganda tetikus tidak membalik lagi. */
export const klikPertama = (e: PeristiwaKlik): boolean => e.detail <= 1;

/**
 * Pencatat ketukan satu tombol HUD (P-8 sampai P-11): jari yang menekan tombol, aksi yang menunggu `touchend`, dan
 * waktu aksi sentuh terakhir. Jam dan penjadwal bisa diganti untuk uji unit.
 */
export class PencatatTekan {
  private readonly jari = new Set<number>();
  private menunggu: { unsur: UnsurTekan; tugas: unknown } | null = null;
  private aksiSentuhPada = Number.NEGATIVE_INFINITY;

  constructor(
    private readonly aksi: () => void,
    private readonly penjadwal: Penjadwal,
  ) {}

  /** `pointerdown` di tombol: hanya jari (pointer `touch`) yang dicatat; tetikus dan pena memakai klik (P-11). */
  turun(e: PeristiwaPointer): void {
    if (e.pointerType === "touch") this.jari.add(e.pointerId);
  }

  /**
   * `pointerup` jari yang menekan tombol ini: bila titik angkat di dalam kotak yang diperluas, aksi menunggu `touchend`
   * jari itu, dengan penjadwal cadangan untuk peramban yang tidak mengirimnya (P-8). Jari yang mulai di luar tombol
   * tidak pernah tercatat, sehingga tidak menjalankan aksi walaupun diangkat di atasnya (P-9 butir 2).
   */
  naik(e: PeristiwaPointer, unsur: UnsurTekan): void {
    if (e.pointerType !== "touch" || !this.jari.delete(e.pointerId)) return;
    if (this.menunggu || !dalamKotak(unsur.getBoundingClientRect(), e.clientX, e.clientY)) return;
    this.menunggu = { unsur, tugas: this.penjadwal.jadwalkan(() => this.jalankan()) };
  }

  /** `pointercancel`: sentuhan dibatalkan peramban, tanpa aksi (P-9 butir 3). */
  batal(e: PeristiwaPointer): void {
    this.jari.delete(e.pointerId);
  }

  /**
   * `touchend` di tombol ini: setiap sentuhan yang dimulai di tombol dicegah agar tidak ada klik dan peristiwa tetikus
   * pengganti (P-10); aksi yang menunggu berjalan sekarang, masih dalam ketukan yang sama (P-8).
   */
  sentuhSelesai(e: PeristiwaSentuhSelesai, unsur: UnsurTekan): void {
    let dariSini = false;
    for (let i = 0; i < e.changedTouches.length; i++) if (unsur.memuat(e.changedTouches[i].target)) dariSini = true;
    if (!dariSini) return;
    if (e.cancelable !== false) e.preventDefault();
    if (!this.menunggu) return;
    this.penjadwal.batalkan(this.menunggu.tugas);
    this.jalankan();
  }

  /** Aksi tidak berjalan bila tombol sudah hilang dari layar, misalnya karena jari lain membuka lapisan (P-9 butir 4). */
  private jalankan(): void {
    const m = this.menunggu;
    this.menunggu = null;
    if (!m || !m.unsur.isConnected) return;
    this.aksiSentuhPada = this.penjadwal.jam();
    this.aksi();
  }

  /**
   * Klik menjalankan aksi bila datang dari tetikus, papan ketik, atau pena (P-11). Klik dari sentuhan dan klik yang tiba
   * kurang dari 800 ms sesudah aksi sentuh di tombol ini diabaikan sebagai pengaman tambahan (P-10).
   */
  klik(e: PeristiwaKlik, saring?: (e: PeristiwaKlik) => boolean): boolean {
    if (e.pointerType === "touch" || this.penjadwal.jam() - this.aksiSentuhPada < JEDA_KLIK_MS) return false;
    return saring ? saring(e) : true;
  }
}

export interface PropsTekan<T extends HTMLElement> {
  ref: (el: T | null) => void;
  onPointerDown: (e: PointerEventReact<T>) => void;
  onPointerUp: (e: PointerEventReact<T>) => void;
  onPointerCancel: (e: PointerEventReact<T>) => void;
  onClick: (e: MouseEventReact<T>) => void;
}

function unsurDari(el: HTMLElement): UnsurTekan {
  return {
    getBoundingClientRect: () => el.getBoundingClientRect(),
    get isConnected() {
      return el.isConnected;
    },
    memuat: (sasaran) => sasaran instanceof Node && el.contains(sasaran),
  };
}

/**
 * Pengikat React untuk satu tombol HUD (P-7): sebar hasilnya ke `<button>`. `aksi` boleh berubah di setiap gambar
 * ulang; `saringKlik` menyaring klik tetikus, papan ketik, dan pena (misalnya `klikPertama` untuk tombol suara).
 */
export function useTekanHud<T extends HTMLElement = HTMLButtonElement>(aksi: () => void, saringKlik?: (e: PeristiwaKlik) => boolean): PropsTekan<T> {
  const aksiRef = useRef(aksi);
  const saringRef = useRef(saringKlik);
  const pencatatRef = useRef<PencatatTekan | null>(null);
  const terpasangRef = useRef<WeakSet<Element> | null>(null);
  useLayoutEffect(() => {
    aksiRef.current = aksi;
    saringRef.current = saringKlik;
  });
  // Semua ref hanya dibaca di dalam penangan peristiwa dan pemasang ref, tidak saat menggambar.
  const pencatat = useCallback(() => (pencatatRef.current ??= new PencatatTekan(() => aksiRef.current(), PENJADWAL_PERAMBAN)), []);
  const ref = useCallback(
    (el: T | null) => {
      const terpasang = (terpasangRef.current ??= new WeakSet<Element>());
      if (!el || terpasang.has(el)) return;
      terpasang.add(el);
      const unsur = unsurDari(el);
      el.addEventListener("touchend", (e) => pencatat().sentuhSelesai(e, unsur), { passive: false });
    },
    [pencatat],
  );
  const onPointerDown = useCallback((e: PointerEventReact<T>) => pencatat().turun(e), [pencatat]);
  const onPointerUp = useCallback((e: PointerEventReact<T>) => pencatat().naik(e, unsurDari(e.currentTarget)), [pencatat]);
  const onPointerCancel = useCallback((e: PointerEventReact<T>) => pencatat().batal(e), [pencatat]);
  const onClick = useCallback(
    (e: MouseEventReact<T>) => {
      if (pencatat().klik(e.nativeEvent as MouseEvent & { pointerType?: string }, saringRef.current)) aksiRef.current();
    },
    [pencatat],
  );
  return { ref, onPointerDown, onPointerUp, onPointerCancel, onClick };
}
