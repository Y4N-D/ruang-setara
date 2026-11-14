// Rute masuk, keluar, akun saat ini, dan ganti sandi (spesifikasi JS-04, P-6 sampai P-19), beserta bantuan yang juga
// dipakai rute akun dan dasbor: jawaban galat akun, pembacaan sesi (P-7), dan penjaga rute (P-20, P-21).
// Tidak menulis log: email, sandi, token, dan alamat IP tidak pernah dicatat (Architecture 12.3).
import { masukanMasukSah, normalkanEmail, periksaSandiBaru, skemaGantiSandi, skemaMasuk, type KodeGalatAkun } from "../../../../app/jejak-setara/inti/akun";
import { TEKS_KONSOL } from "../../../../app/jejak-setara/teks-konsol";
import { BATAS_ALAMAT, BATAS_EMAIL, kunciAlamat, kunciEmail, sedangTerkunci } from "../auth/batas";
import { boleh, STATUS_PENJAGA, type Aksi } from "../auth/izin";
import { buatHash, cocokkanSandi, hashTiruan, kunciKonsol } from "../auth/sandi";
import { bacaToken, cookieHapus, cookieSesi, hashToken, perluSentuh, sesiSah, tokenBaru } from "../auth/sesi";
import * as db from "../db/akun";
import type { Env } from "../env";
import { alamatIp, bacaIsiJson, bolehLewat, jawabGalat, jawabJson, lolosCsrf } from "../keamanan";

/** Kode galat yang dikirim server; JARINGAN dan UMUM hanya dipakai konsol. */
export type KodeGalatServer = Exclude<KodeGalatAkun, "JARINGAN" | "UMUM">;

/** Jawaban galat akun dengan teks dari TEKS_KONSOL (P-51). */
export function galatAkun(kode: KodeGalatServer, status: number): Response {
  return jawabGalat(kode, TEKS_KONSOL.galat[kode], status);
}

export const metodeSalah = (allow: string) => jawabGalat("METODE_TIDAK_DIDUKUNG", "Metode ini tidak didukung.", 405, { Allow: allow });
export const belumTersedia = () => jawabGalat("BELUM_TERSEDIA", "Fitur ini belum tersedia.", 404);

/** Isi permintaan yang lolos skema, atau null bila rusak, terlalu panjang, atau tidak sesuai bentuknya (400). */
export async function bacaIsi<T>(request: Request, skema: { safeParse(isi: unknown): { success: true; data: T } | { success: false } }): Promise<T | null> {
  const isi = await bacaIsiJson(request);
  if (!isi.ok) return null;
  const hasil = skema.safeParse(isi.isi);
  return hasil.success ? hasil.data : null;
}

export interface SesiAktif {
  akun: db.BarisPengguna;
  hashToken: string;
}

/**
 * Sesi sah dari cookie (P-7), atau null. Sesi yang tidak ada, sudah 8 jam tidak dipakai, melewati `kedaluwarsa`, atau
 * akunnya nonaktif dihapus. `terakhir_dipakai` ditulis ulang bila sudah lebih dari 5 menit.
 */
export async function bacaSesi(request: Request, env: Env, sekarang: number): Promise<SesiAktif | null> {
  const token = bacaToken(request.headers.get("Cookie"));
  if (!token) return null;
  const hash = await hashToken(token);
  const baris = await db.bacaSesiAkun(env.DB, hash);
  if (!baris) return null;
  if (!sesiSah(baris, sekarang) || baris.aktif !== 1) {
    await db.hapusSesi(env.DB, hash).run();
    return null;
  }
  if (perluSentuh(baris, sekarang)) await db.sentuhSesi(env.DB, hash, sekarang).run();
  return { akun: baris, hashToken: hash };
}

/** Penjaga rute (P-21): sesi sah yang boleh menjalankan aksi, atau jawaban 401 atau 403. */
export async function jagaRute(request: Request, env: Env, aksi: Aksi, sekarang: number): Promise<{ ok: true; sesi: SesiAktif } | { ok: false; jawaban: Response }> {
  const sesi = await bacaSesi(request, env, sekarang);
  if (!sesi) return { ok: false, jawaban: galatAkun("PERLU_MASUK", STATUS_PENJAGA.PERLU_MASUK) };
  const izin = boleh({ peran: sesi.akun.peran, aktif: sesi.akun.aktif === 1, wajibGantiSandi: sesi.akun.wajib_ganti_sandi === 1 }, aksi);
  if (!izin.ok) return { ok: false, jawaban: galatAkun(izin.kode, STATUS_PENJAGA[izin.kode]) };
  return { ok: true, sesi };
}

export const JALUR_MASUK: ReadonlySet<string> = new Set(["/api/masuk", "/api/keluar", "/api/saya", "/api/sandi"]);

export async function tanganiApiMasuk(request: Request, env: Env, url: URL): Promise<Response> {
  switch (url.pathname) {
    case "/api/masuk":
      return request.method === "POST" ? masuk(request, env, url) : metodeSalah("POST");
    case "/api/keluar":
      return request.method === "POST" ? keluar(request, env, url) : metodeSalah("POST");
    case "/api/saya":
      return request.method === "GET" ? saya(request, env) : metodeSalah("GET");
    case "/api/sandi":
      return request.method === "POST" ? gantiSandiSendiri(request, env, url) : metodeSalah("POST");
    default:
      return belumTersedia();
  }
}

/** P-11: urutan pemeriksaan menentukan berapa hash yang dihitung (P-3). */
async function masuk(request: Request, env: Env, url: URL): Promise<Response> {
  if (!lolosCsrf(request, url, env.LINGKUNGAN)) return galatAkun("ASAL_DITOLAK", 403);
  if (!(await bolehLewat(env.BATAS_MASUK, request))) return galatAkun("TERLALU_SERING", 429);
  const isi = await bacaIsi(request, skemaMasuk);
  if (!isi) return galatAkun("PERMINTAAN_SALAH", 400);
  const email = normalkanEmail(isi.email);
  if (!masukanMasukSah(email, isi.sandi)) return galatAkun("MASUK_SALAH", 401);
  const kunci = kunciKonsol(env);
  if (!kunci) return galatAkun("KONSOL_BELUM_SIAP", 503);

  const sekarang = Date.now();
  const kunciE = await kunciEmail(email, kunci.kunciIp);
  const kunciA = await kunciAlamat(alamatIp(request), sekarang, kunci.kunciIp);
  const batas = await db.bacaBatas(env.DB, [kunciE, kunciA]);
  if (batas.some((b) => sedangTerkunci(b, sekarang))) return galatAkun("TERKUNCI", 429);

  // Email tidak terdaftar dan akun nonaktif tetap menghitung satu hash (P-4, P-15).
  const akun = await db.cariPenggunaEmail(env.DB, email);
  const bisaMasuk = akun !== null && akun.aktif === 1;
  let cocok = false;
  if (bisaMasuk) cocok = await cocokkanSandi(isi.sandi, akun, kunci.kunciSandi);
  else await hashTiruan(isi.sandi, kunci.iterasi, kunci.kunciSandi);
  if (!bisaMasuk || !cocok) {
    await env.DB.batch([db.tambahGagal(env.DB, kunciE, sekarang, BATAS_EMAIL), db.tambahGagal(env.DB, kunciA, sekarang, BATAS_ALAMAT)]);
    return galatAkun("MASUK_SALAH", 401);
  }

  const pernyataan: D1PreparedStatement[] = [];
  // Hash ulang hanya bila iterasi akun di bawah target (P-2).
  if (akun.iterasi < kunci.iterasi) pernyataan.push(db.perbaruiHash(env.DB, akun.id, await buatHash(isi.sandi, kunci.iterasi, kunci.kunciSandi)));
  const token = tokenBaru();
  pernyataan.push(db.sisipkanSesi(env.DB, await hashToken(token), akun.id, sekarang), db.catatMasuk(env.DB, akun.id, sekarang), db.hapusBatas(env.DB, kunciE));
  await env.DB.batch(pernyataan);
  return jawabJson({ akun: db.keSaya(akun) }, 200, { "Set-Cookie": cookieSesi(token) });
}

/** P-8: menghapus sesi yang dipakai (bila ada) dan mengirim cookie hapus. */
async function keluar(request: Request, env: Env, url: URL): Promise<Response> {
  if (!lolosCsrf(request, url, env.LINGKUNGAN)) return galatAkun("ASAL_DITOLAK", 403);
  const token = bacaToken(request.headers.get("Cookie"));
  if (token) await db.hapusSesi(env.DB, await hashToken(token)).run();
  return jawabJson({ ok: true }, 200, { "Set-Cookie": cookieHapus() });
}

/** P-16: selalu 200. */
async function saya(request: Request, env: Env): Promise<Response> {
  const sesi = await bacaSesi(request, env, Date.now());
  return jawabJson(sesi ? { masuk: true, akun: db.keSaya(sesi.akun) } : { masuk: false }, 200);
}

/** P-18: ganti sandi wajib atau sukarela. */
async function gantiSandiSendiri(request: Request, env: Env, url: URL): Promise<Response> {
  if (!lolosCsrf(request, url, env.LINGKUNGAN)) return galatAkun("ASAL_DITOLAK", 403);
  if (!(await bolehLewat(env.BATAS_MASUK, request))) return galatAkun("TERLALU_SERING", 429);
  const sekarang = Date.now();
  const jaga = await jagaRute(request, env, "sandi.sendiri", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const { akun } = jaga.sesi;
  const isi = await bacaIsi(request, skemaGantiSandi);
  if (!isi) return galatAkun("PERMINTAAN_SALAH", 400);
  const kunci = kunciKonsol(env);
  if (!kunci) return galatAkun("KONSOL_BELUM_SIAP", 503);

  const wajib = akun.wajib_ganti_sandi === 1;
  if (wajib) {
    // Sandi lama diabaikan; sandi baru tidak boleh sama dengan sandi sementara (hash pertama).
    const galat = periksaSandiBaru(isi.sandiBaru, akun.email);
    if (galat) return galatAkun(galat, 400);
    if (await cocokkanSandi(isi.sandiBaru, akun, kunci.kunciSandi)) return galatAkun("SANDI_SAMA", 400);
  } else {
    if (isi.sandiLama === undefined) return galatAkun("PERMINTAAN_SALAH", 400);
    const kunciE = await kunciEmail(akun.email, kunci.kunciIp);
    const [baris] = await db.bacaBatas(env.DB, [kunciE]);
    if (sedangTerkunci(baris, sekarang)) return galatAkun("TERKUNCI", 429);
    if (!(await cocokkanSandi(isi.sandiLama, akun, kunci.kunciSandi))) {
      const kunciA = await kunciAlamat(alamatIp(request), sekarang, kunci.kunciIp);
      await env.DB.batch([db.tambahGagal(env.DB, kunciE, sekarang, BATAS_EMAIL), db.tambahGagal(env.DB, kunciA, sekarang, BATAS_ALAMAT)]);
      return galatAkun("SANDI_LAMA_SALAH", 400);
    }
    const galat = periksaSandiBaru(isi.sandiBaru, akun.email);
    if (galat) return galatAkun(galat, 400);
    if (isi.sandiBaru.normalize("NFC") === isi.sandiLama.normalize("NFC")) return galatAkun("SANDI_SAMA", 400);
  }

  // Hash kedua: sandi baru dengan garam baru dan target iterasi. Semua sesi akun diganti satu sesi baru (P-9).
  const hash = await buatHash(isi.sandiBaru, kunci.iterasi, kunci.kunciSandi);
  const token = tokenBaru();
  await env.DB.batch([
    db.gantiSandi(env.DB, akun.id, hash),
    db.hapusSesiAkun(env.DB, akun.id),
    db.sisipkanSesi(env.DB, await hashToken(token), akun.id, sekarang),
    db.catatAudit(env.DB, { id: crypto.randomUUID(), penggunaId: akun.id, aksi: "sandi.ganti", sasaran: akun.id, rincian: { wajib }, waktu: sekarang }),
  ]);
  return jawabJson({ akun: db.keSaya({ ...akun, wajib_ganti_sandi: 0 }) }, 200, { "Set-Cookie": cookieSesi(token) });
}
