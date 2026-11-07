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
}
