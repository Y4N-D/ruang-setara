// Rute kelola akun dan admin awal (spesifikasi JS-04, P-22 sampai P-31). Sandi sementara hanya dikirim sekali di
// jawaban yang membuatnya, dan tidak pernah disimpan atau dicatat (P-5). Log audit tanpa sandi, hash, token, atau
// alamat IP (P-26).
import {
  emailSah,
  namaSah,
  normalkanEmail,
  normalkanNama,
  periksaSandiBaru,
  skemaAdminAwal,
  skemaAkunBaru,
  skemaUbahAkun,
  type Peran,
} from "../../../../app/jejak-setara/inti/akun";
import { kunciEmail } from "../auth/batas";
import { buatHash, kunciKonsol, sandiSementara, type HashTersimpan } from "../auth/sandi";
import * as db from "../db/akun";
import type { Env } from "../env";
import { bolehLewat, jawabJson, lolosCsrf, samaWaktuKonstan } from "../keamanan";
import { bacaIsi, belumTersedia, galatAkun, jagaRute, metodeSalah } from "./masuk";

const POLA_JALUR_AKUN = /^\/api\/akun\/([^/]+)$/;

export function jalurAkun(jalur: string): boolean {
  return jalur === "/api/akun" || jalur.startsWith("/api/akun/") || jalur === "/api/admin-awal";
}

export async function tanganiApiAkun(request: Request, env: Env, url: URL): Promise<Response> {
  const jalur = url.pathname;
  if (jalur === "/api/admin-awal") return adminAwal(request, env);
  if (jalur === "/api/akun") {
    if (request.method === "GET") return daftar(request, env);
    if (request.method === "POST") return buat(request, env, url);
    return metodeSalah("GET, POST");
  }
  const cocok = POLA_JALUR_AKUN.exec(jalur);
  if (!cocok) return belumTersedia();
  if (request.method !== "PATCH") return metodeSalah("PATCH");
  let id = "";
  try {
    id = decodeURIComponent(cocok[1]);
  } catch {
    // Id yang tidak bisa dibaca diperlakukan sebagai akun yang tidak ada.
  }
  return ubah(request, env, url, id);
}

/** P-22. */
async function daftar(request: Request, env: Env): Promise<Response> {
  const jaga = await jagaRute(request, env, "akun.kelola", Date.now());
  if (!jaga.ok) return jaga.jawaban;
  const baris = await db.daftarAkun(env.DB);
  return jawabJson({ akun: baris.map(db.keAkun) }, 200);
}

/** P-23. */
async function buat(request: Request, env: Env, url: URL): Promise<Response> {
  if (!lolosCsrf(request, url, env.LINGKUNGAN)) return galatAkun("ASAL_DITOLAK", 403);
  const sekarang = Date.now();
  const jaga = await jagaRute(request, env, "akun.kelola", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const isi = await bacaIsi(request, skemaAkunBaru);
  if (!isi) return galatAkun("PERMINTAAN_SALAH", 400);
  const kunci = kunciKonsol(env);
  if (!kunci) return galatAkun("KONSOL_BELUM_SIAP", 503);
  const email = normalkanEmail(isi.email);
  if (!emailSah(email)) return galatAkun("EMAIL_SALAH", 400);
  const nama = normalkanNama(isi.namaTampilan);
  if (!namaSah(nama)) return galatAkun("NAMA_SALAH", 400);
  if (await db.cariPenggunaEmail(env.DB, email)) return galatAkun("EMAIL_DIPAKAI", 409);

  const sandi = sandiSementara();
  const hash = await buatHash(sandi, kunci.iterasi, kunci.kunciSandi);
  const id = crypto.randomUUID();
  try {
    await env.DB.batch([
      db.sisipkanPengguna(env.DB, { id, email, namaTampilan: nama, peran: isi.peran, peninjau: isi.peninjau, hash, sekarang }),
      db.catatAudit(env.DB, {
        id: crypto.randomUUID(),
        penggunaId: jaga.sesi.akun.id,
        aksi: "akun.buat",
        sasaran: id,
        rincian: { peran: isi.peran, peninjau: isi.peninjau },
        waktu: sekarang,
      }),
    ]);
  } catch (galat) {
    // Email yang baru saja dipakai admin lain di saat yang sama.
    if (/UNIQUE/i.test(String(galat))) return galatAkun("EMAIL_DIPAKAI", 409);
    throw galat;
  }
  const akun: db.BarisAkun = {
    id,
    email,
    nama_tampilan: nama,
    peran: isi.peran,
    peninjau: isi.peninjau ? 1 : 0,
    wajib_ganti_sandi: 1,
    aktif: 1,
    dibuat_pada: sekarang,
    masuk_terakhir: null,
  };
  return jawabJson({ akun: db.keAkun(akun), sandiSementara: sandi }, 201);
}

/** P-24 sampai P-26. */
async function ubah(request: Request, env: Env, url: URL, id: string): Promise<Response> {
  if (!lolosCsrf(request, url, env.LINGKUNGAN)) return galatAkun("ASAL_DITOLAK", 403);
  const sekarang = Date.now();
  const jaga = await jagaRute(request, env, "akun.kelola", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const pelaku = jaga.sesi.akun;
  const isi = await bacaIsi(request, skemaUbahAkun);
  if (!isi) return galatAkun("PERMINTAAN_SALAH", 400);
  const aturUlang = isi.aturUlangSandi === true;
  const kunci = kunciKonsol(env);
  if (aturUlang && !kunci) return galatAkun("KONSOL_BELUM_SIAP", 503);
  const nama = isi.namaTampilan === undefined ? undefined : normalkanNama(isi.namaTampilan);
  if (nama !== undefined && !namaSah(nama)) return galatAkun("NAMA_SALAH", 400);

  const sasaran = await db.cariPenggunaId(env.DB, id);
  if (!sasaran) return galatAkun("AKUN_TIDAK_ADA", 404);
  // P-25: admin tidak bisa menurunkan perannya, menonaktifkan, atau mengatur ulang sandi akunnya sendiri.
  if (sasaran.id === pelaku.id && (isi.peran === "guru" || isi.aktif === false || aturUlang)) return galatAkun("TIDAK_BOLEH_DIRI", 400);

  // Hanya kolom yang nilainya benar-benar berubah yang ditulis dan dicatat (P-26).
  const berubah: { namaTampilan?: string; peran?: Peran; peninjau?: boolean; aktif?: boolean } = {};
  if (nama !== undefined && nama !== sasaran.nama_tampilan) berubah.namaTampilan = nama;
  if (isi.peran !== undefined && isi.peran !== sasaran.peran) berubah.peran = isi.peran;
  if (isi.peninjau !== undefined && isi.peninjau !== (sasaran.peninjau === 1)) berubah.peninjau = isi.peninjau;
  if (isi.aktif !== undefined && isi.aktif !== (sasaran.aktif === 1)) berubah.aktif = isi.aktif;
  const adaUbahan = Object.keys(berubah).length > 0;
  if (!adaUbahan && !aturUlang) return jawabJson({ akun: db.keAkun(sasaran) }, 200);

  // P-25: harus tetap ada admin aktif. Diperiksa juga di dalam pernyataan ubahAkun untuk perubahan yang bersamaan.
  const tetapAdminAktif = (berubah.peran ?? sasaran.peran) === "admin" && (berubah.aktif ?? sasaran.aktif === 1);
  if (sasaran.peran === "admin" && sasaran.aktif === 1 && !tetapAdminAktif && (await db.hitungAdminAktifLain(env.DB, sasaran.id)) === 0) {
    return galatAkun("ADMIN_TERAKHIR", 409);
  }

  let sandi: string | null = null;
  let hash: HashTersimpan | null = null;
  if (aturUlang && kunci) {
    sandi = sandiSementara();
    hash = await buatHash(sandi, kunci.iterasi, kunci.kunciSandi);
  }

  // Satu batch: perubahan, lalu audit dan pernyataan lanjutan yang hanya berlaku bila perubahan itu berlaku.
  const idAudit = crypto.randomUUID();
  const audit = (aksi: db.CatatanAudit["aksi"], rincian: Record<string, unknown>, idBaris = idAudit): db.CatatanAudit => ({
    id: idBaris,
    penggunaId: pelaku.id,
    aksi,
    sasaran: sasaran.id,
    rincian,
    waktu: sekarang,
  });
  const pernyataan: D1PreparedStatement[] = [
    db.ubahAkun(env.DB, sasaran.id, {
      namaTampilan: berubah.namaTampilan ?? null,
      peran: berubah.peran ?? null,
      peninjau: berubah.peninjau ?? null,
      aktif: berubah.aktif ?? null,
      hash,
    }),
  ];
  if (adaUbahan) pernyataan.push(db.catatAuditBilaBerubah(env.DB, audit("akun.ubah", rincianUbah(berubah))));
  if (aturUlang) {
    const catatan = audit("akun.atur_ulang_sandi", {}, adaUbahan ? crypto.randomUUID() : idAudit);
    pernyataan.push(adaUbahan ? db.bilaAda.catatAudit(env.DB, catatan, idAudit) : db.catatAuditBilaBerubah(env.DB, catatan));
  }
  if (berubah.aktif === false || aturUlang) pernyataan.push(db.bilaAda.hapusSesiAkun(env.DB, sasaran.id, idAudit));
  if (aturUlang && kunci) pernyataan.push(db.bilaAda.hapusBatas(env.DB, await kunciEmail(sasaran.email, kunci.kunciIp), idAudit));
  const hasil = await env.DB.batch(pernyataan);
  if ((hasil[0]?.meta.changes ?? 0) === 0) return galatAkun("ADMIN_TERAKHIR", 409);

  const sesudah = (await db.cariPenggunaId(env.DB, sasaran.id)) ?? sasaran;
  return jawabJson(sandi === null ? { akun: db.keAkun(sesudah) } : { akun: db.keAkun(sesudah), sandiSementara: sandi }, 200);
}

/** Rincian audit `akun.ubah` (P-26): nama kolom yang berubah beserta nilai barunya. */
function rincianUbah(berubah: { namaTampilan?: string; peran?: Peran; peninjau?: boolean; aktif?: boolean }): Record<string, unknown> {
  const rincian: Record<string, unknown> = {};
  if (berubah.namaTampilan !== undefined) rincian.nama_tampilan = berubah.namaTampilan;
  if (berubah.peran !== undefined) rincian.peran = berubah.peran;
  if (berubah.peninjau !== undefined) rincian.peninjau = berubah.peninjau;
  if (berubah.aktif !== undefined) rincian.aktif = berubah.aktif;
  return rincian;
}

/** P-28 sampai P-30: dipanggil alur kerja "Jejak: admin awal", bukan peramban, sehingga tanpa pemeriksaan CSRF. */
async function adminAwal(request: Request, env: Env): Promise<Response> {
  if (!env.KUNCI_ADMIN) return belumTersedia();
  if (request.method !== "POST") return metodeSalah("POST");
  if (!(await bolehLewat(env.BATAS_MASUK, request))) return galatAkun("TERLALU_SERING", 429);
  if (!samaWaktuKonstan(request.headers.get("X-Jejak-Kunci-Admin") ?? "", env.KUNCI_ADMIN)) return galatAkun("KUNCI_ADMIN_SALAH", 403);
  const isi = await bacaIsi(request, skemaAdminAwal);
  if (!isi) return galatAkun("PERMINTAAN_SALAH", 400);
  const kunci = kunciKonsol(env);
  if (!kunci) return galatAkun("KONSOL_BELUM_SIAP", 503);
  const email = normalkanEmail(isi.email);
  if (!emailSah(email)) return galatAkun("EMAIL_SALAH", 400);
  const nama = normalkanNama(isi.namaTampilan);
  if (!namaSah(nama)) return galatAkun("NAMA_SALAH", 400);
  const galatSandi = periksaSandiBaru(isi.sandi, null);
  if (galatSandi) return galatAkun(galatSandi, 400);

  const sekarang = Date.now();
  const hash = await buatHash(isi.sandi, kunci.iterasi, kunci.kunciSandi);
  const catat = (sasaran: string, hasil: "dibuat" | "dipulihkan") =>
    db.catatAudit(env.DB, { id: crypto.randomUUID(), penggunaId: null, aksi: "admin_awal", sasaran, rincian: { hasil }, waktu: sekarang });
  // Dua putaran: bila email baru saja dibuat di saat yang sama, putaran kedua memulihkannya.
  for (let putaran = 0; putaran < 2; putaran++) {
    const ada = await db.cariPenggunaEmail(env.DB, email);
    if (ada) {
      await env.DB.batch([
        db.pulihkanAdmin(env.DB, ada.id, hash),
        db.hapusSesiAkun(env.DB, ada.id),
        db.hapusBatas(env.DB, await kunciEmail(email, kunci.kunciIp)),
        catat(ada.id, "dipulihkan"),
      ]);
      return jawabJson({ hasil: "dipulihkan" }, 200);
    }
    const id = crypto.randomUUID();
    try {
      await env.DB.batch([db.sisipkanPengguna(env.DB, { id, email, namaTampilan: nama, peran: "admin", peninjau: false, hash, sekarang }), catat(id, "dibuat")]);
      return jawabJson({ hasil: "dibuat" }, 200);
    } catch (galat) {
      if (putaran > 0 || !/UNIQUE/i.test(String(galat))) throw galat;
    }
  }
  return galatAkun("EMAIL_DIPAKAI", 409);
}
