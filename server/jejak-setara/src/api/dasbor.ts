// GET /api/dasbor (spesifikasi JS-04, P-36): jumlah rujukan yang belum diverifikasi. Sejak JS-10 (P-11) juga paling
// banyak 5 ruang yang sedang berjalan beserta jumlah seluruhnya. Isi dasbor lain ditambahkan JS-11 dan JS-13.
import { RUANG_DAFTAR_MS, RUANG_DASBOR_MAKS } from "../../../../app/jejak-setara/inti/ruang";
import { hitungRujukanBelum } from "../db/akun";
import { daftarRuang, hitungRuangBerjalan } from "../db/ruang";
import type { Env } from "../env";
import { jawabJson } from "../keamanan";
import { jagaRute, metodeSalah } from "./masuk";
import { ringkasanRuang } from "./ruang";

export async function tanganiApiDasbor(request: Request, env: Env): Promise<Response> {
  if (request.method !== "GET") return metodeSalah("GET");
  const sekarang = Date.now();
  const jaga = await jagaRute(request, env, "dasbor.lihat", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const pemilik = jaga.sesi.akun.peran === "admin" ? null : jaga.sesi.akun.id;
  const sejak = sekarang - RUANG_DAFTAR_MS;
  const [rujukanBelum, ruang, jumlahRuang] = await Promise.all([
    hitungRujukanBelum(env.DB),
    daftarRuang(env.DB, pemilik, sejak, RUANG_DASBOR_MAKS),
    hitungRuangBerjalan(env.DB, pemilik, sejak),
  ]);
  return jawabJson({ rujukanBelum, ruang: ruang.map(ringkasanRuang), jumlahRuang }, 200);
}
