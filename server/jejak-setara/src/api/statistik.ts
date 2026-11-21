// GET /api/statistik/kejadian (spesifikasi JS-13, P-1 dan P-11 sampai P-15): statistik per versi kejadian lintas ruang.
// Admin melihat semua ruang (atau satu guru lewat saringan), guru hanya ruang miliknya. Hanya membaca data.
import { bacaSaringanStatistik, susunStatistik } from "../../../../app/jejak-setara/inti/statistik";
import { bacaStatistik } from "../db/statistik";
import type { Env } from "../env";
import { jawabJson } from "../keamanan";
import { jagaRute, metodeSalah } from "./masuk";
import { galatRuang } from "./ruang";

export const JALUR_STATISTIK = "/api/statistik/kejadian";

export async function tanganiApiStatistik(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method !== "GET") return metodeSalah("GET");
  const jaga = await jagaRute(request, env, "statistik.lihat", Date.now());
  if (!jaga.ok) return jaga.jawaban;
  const admin = jaga.sesi.akun.peran === "admin";
  const s = bacaSaringanStatistik(url.searchParams, admin);
  if (!s) return galatRuang("ISI_SALAH", 400);
  const data = await bacaStatistik(env.DB, s, admin ? s.guru : jaga.sesi.akun.id, admin ? null : jaga.sesi.akun.id);
  const kejadian = susunStatistik(data.baris, data.versi);
  const jawaban = kejadian.reduce((n, k) => n + k.dijawab, 0);
  return jawabJson({ cakupan: { ruang: data.ruang, pemain: data.pemain, jawaban }, kejadian, paket: data.paket }, 200);
}
