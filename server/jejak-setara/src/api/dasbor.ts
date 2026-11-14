// GET /api/dasbor (spesifikasi JS-04, P-36): jumlah rujukan yang belum diverifikasi. Isi dasbor lain ditambahkan JS-10,
// JS-11, dan JS-13.
import { hitungRujukanBelum } from "../db/akun";
import type { Env } from "../env";
import { jawabJson } from "../keamanan";
import { jagaRute, metodeSalah } from "./masuk";

export async function tanganiApiDasbor(request: Request, env: Env): Promise<Response> {
  if (request.method !== "GET") return metodeSalah("GET");
  const jaga = await jagaRute(request, env, "dasbor.lihat", Date.now());
  if (!jaga.ok) return jaga.jawaban;
  return jawabJson({ rujukanBelum: await hitungRujukanBelum(env.DB) }, 200);
}
