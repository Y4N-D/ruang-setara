// Worker Jejak Setara, kerangka JS-01. Menjawab /api/sehat; jalur /api/* dan /ws/* lain belum tersedia.
// Jalur lain disajikan lapisan aset Cloudflare; yang sampai ke sini diteruskan ke ASSETS.
// Tidak menulis log permintaan (Architecture 12.3).
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/protokol";

export interface Env {
  ASSETS: Fetcher;
  LINGKUNGAN: string;
}

// Tajuk setiap jawaban Worker. Tajuk _headers tidak berlaku untuk jawaban buatan Worker (Architecture 12.2).
const TAJUK_JSON: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
};

function jawabJson(isi: unknown, status: number, tajukLain: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(isi), { status, headers: { ...TAJUK_JSON, ...tajukLain } });
}

function jawabGalat(kode: string, pesan: string, status: number, tajukLain?: Record<string, string>): Response {
  return jawabJson({ galat: { kode, pesan } }, status, tajukLain);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/sehat") {
      if (request.method !== "GET") {
        return jawabGalat("METODE_TIDAK_DIDUKUNG", "Metode ini tidak didukung.", 405, { Allow: "GET" });
      }
      return jawabJson({ ok: true, protokol: PROTOKOL_VERSI, lingkungan: env.LINGKUNGAN }, 200);
    }
    if (pathname.startsWith("/api/") || pathname.startsWith("/ws/")) {
      return jawabGalat("BELUM_TERSEDIA", "Fitur ini belum tersedia.", 404);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
