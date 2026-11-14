// Binding dan variabel Worker Jejak Setara (wrangler.jsonc; Architecture 4.2 dan 4.5).

/** Binding Rate Limiting Workers (periode 60 detik, spesifikasi JS-03 P-13). */
export interface PembatasLaju {
  limit(opsi: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  ASSETS: Fetcher;
  LINGKUNGAN: string;
  DB: D1Database;
  RUANG: DurableObjectNamespace;
  BATAS_PUBLIK?: PembatasLaju;
  BATAS_WS?: PembatasLaju;
  KUNCI_COBA?: string;
  /** JS-04 (P-14): pembatas per alamat untuk masuk, ganti sandi, dan admin awal. */
  BATAS_MASUK?: PembatasLaju;
  /** JS-04 (P-1): kunci tambahan hash sandi; rahasia Worker di `uji`, variabel tiruan di `lokal`. */
  KUNCI_SANDI?: string;
  /** JS-04 (P-12): kunci HMAC pembatas percobaan masuk. */
  KUNCI_IP?: string;
  /** JS-04 (P-28): kunci sekali pakai rute admin awal; hanya ada selama alur kerja "Jejak: admin awal" berjalan. */
  KUNCI_ADMIN?: string;
  /** JS-04 (P-2): target iterasi PBKDF2, bilangan bulat 1.000 sampai 100.000. */
  ITERASI_SANDI?: string;
}
