// Worker Jejak Setara (spesifikasi JS-01, JS-03, JS-04, JS-10, dan JS-22). Menjawab /api/sehat, rute ruang, sambungan WebSocket
// pemain dan layar kelas, serta rute akun, ruang, dan dasbor konsol; jalur /api/* dan /ws/* lain belum tersedia. Jalur lain disajikan
// lapisan aset Cloudflare; yang sampai ke sini diteruskan ke ASSETS. Tidak menulis log permintaan (Architecture 12.3).
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/protokol";
import { TEKS } from "../../../app/jejak-setara/teks";
import { jalurAkun, tanganiApiAkun } from "./api/akun";
import { tanganiApiDasbor } from "./api/dasbor";
import { JALUR_MASUK, tanganiApiMasuk } from "./api/masuk";
import { jalurBank, tanganiApiBank } from "./api/bank";
import { jalurRuang, tanganiApiRuang, tanganiWsKelas, tanganiWsRuang } from "./api/ruang";
import { bersihkanAkun } from "./db/akun";
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
      const sehat = { ok: true, protokol: PROTOKOL_VERSI, lingkungan: env.LINGKUNGAN };
      return jawabJson(env.DARURAT === "1" ? { ...sehat, darurat: true } : sehat, 200);
    }
    // JS-22 (P-12): saat "Jejak: hentikan" aktif, semua API dan WebSocket dijawab 503 sebelum menyentuh D1 atau ruang.
    if (env.DARURAT === "1" && (pathname.startsWith("/api/") || pathname.startsWith("/ws/"))) {
      return jawabGalat("LAYANAN_BERHENTI", TEKS.api.LAYANAN_BERHENTI, 503);
    }
    if (pathname.startsWith("/ws/ruang/")) return tanganiWsRuang(request, env, url);
    if (pathname.startsWith("/ws/kelas/")) return tanganiWsKelas(request, env, url);
    if (jalurRuang(pathname)) return tanganiApiRuang(request, env, url);
    if (JALUR_MASUK.has(pathname)) return tanganiApiMasuk(request, env, url);
    if (jalurAkun(pathname)) return tanganiApiAkun(request, env, url);
    if (pathname === "/api/dasbor") return tanganiApiDasbor(request, env);
    if (jalurBank(pathname)) return tanganiApiBank(request, env, url);
    if (pathname.startsWith("/api/") || pathname.startsWith("/ws/")) {
      return jawabGalat("BELUM_TERSEDIA", "Fitur ini belum tersedia.", 404);
    }
    return env.ASSETS.fetch(request);
  },

  // Pemicu harian 03.00 WITA: jaring pengaman untuk ruang yang tidak sempat ditutup Durable Object-nya, lalu
  // pembersihan sesi dan catatan pembatas percobaan masuk yang sudah lama (JS-04, P-35).
  async scheduled(_pengendali: ScheduledController, env: Env): Promise<void> {
    const sekarang = Date.now();
    await tandaiRuangLama(env.DB, sekarang);
    await bersihkanAkun(env.DB, sekarang);
  },
} satisfies ExportedHandler<Env>;
