// Worker Jejak Setara (spesifikasi JS-01 dan JS-03). Menjawab /api/sehat, rute ruang, dan sambungan
// WebSocket pemain; jalur /api/* dan /ws/* lain belum tersedia. Jalur lain disajikan lapisan aset
// Cloudflare; yang sampai ke sini diteruskan ke ASSETS. Tidak menulis log permintaan (Architecture 12.3).
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/protokol";
import { tanganiApiRuang, tanganiWsRuang } from "./api/ruang";
import { tandaiRuangLama } from "./db/ruang";
import type { Env } from "./env";
import { jawabGalat, jawabJson } from "./keamanan";

export type { Env } from "./env";
export { RuangJejak } from "./ruang/RuangJejak";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    if (pathname === "/api/sehat") {
      if (request.method !== "GET") {
        return jawabGalat("METODE_TIDAK_DIDUKUNG", "Metode ini tidak didukung.", 405, { Allow: "GET" });
      }
      return jawabJson({ ok: true, protokol: PROTOKOL_VERSI, lingkungan: env.LINGKUNGAN }, 200);
    }
    if (pathname.startsWith("/ws/ruang/")) return tanganiWsRuang(request, env, url);
    if (pathname.startsWith("/api/publik/ruang/") || pathname === "/api/ruang-coba" || pathname.startsWith("/api/ruang-coba/")) {
      return tanganiApiRuang(request, env, url);
    }
    if (pathname.startsWith("/api/") || pathname.startsWith("/ws/")) {
      return jawabGalat("BELUM_TERSEDIA", "Fitur ini belum tersedia.", 404);
    }
    return env.ASSETS.fetch(request);
  },

  // Pemicu harian 03.00 WITA: jaring pengaman untuk ruang yang tidak sempat ditutup Durable Object-nya.
  async scheduled(_pengendali: ScheduledController, env: Env): Promise<void> {
    await tandaiRuangLama(env.DB, Date.now());
  },
} satisfies ExportedHandler<Env>;
