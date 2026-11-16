// Rute bank kejadian di konsol (spesifikasi JS-12, P-2, P-4 sampai P-25): kejadian, pustaka rujukan, dan paket.
// Semua izin diperiksa di sini; konsol hanya menyembunyikan tombol.
import {
  aksiBoleh,
  bolehSunting,
  CATATAN_TERBIT_MAKS,
  idRujukanBerikutnya,
  kodeBerikutnya,
  skemaAksiKejadian,
  skemaBuatKejadian,
  skemaIsiPaket,
  skemaIsiRujukan,
  skemaSimpanKejadian,
  skemaVerifikasi,
  type KeadaanKejadian,
  type PelakuBank,
  type TemuanApi,
} from "../../../../app/jejak-setara/inti/bank";
import type { KodeGalatAkun } from "../../../../app/jejak-setara/inti/akun";
import { KUNCI_ASET_DISETUJUI } from "../../../../app/jejak-setara/inti/konten/kunci-aset";
import { adaGalat, periksaKejadian, periksaPaketPeta } from "../../../../app/jejak-setara/inti/konten/periksa";
import { skemaPaketBank, skemaRujukanBank } from "../../../../app/jejak-setara/inti/konten/skema";
import type { ZonaId } from "../../../../app/jejak-setara/inti/tipe";
import { TEKS_KONSOL } from "../../../../app/jejak-setara/teks-konsol";
import {
  arsipkanD1,
  buatKejadianD1,
  cariKejadianKode,
  cariPaketD1,
  cariRujukanD1,
  daftarKejadianD1,
  daftarPaketD1,
  daftarRujukanD1,
  daftarTopik,
  dipakaiRuang,
  hapusKejadianD1,
  hapusRujukanD1,
  idKejadianDariKode,
  kejadianPaketD1,
  namaPaketDipakai,
  petaStatusRujukan,
  riwayatTerbit,
  semuaKode,
  simpanKerjaD1,
  simpanPaketD1,
  tambahRujukanD1,
  terbitkanD1,
  ubahRujukanD1,
  ubahStatusD1,
  verifikasiRujukanD1,
  type BarisKejadianD1,
  type BarisRujukanD1,
  type BarisVersiTerbit,
} from "../db/bank";
import { paketSiapRuangBiasa } from "../db/konten";
import type { Env } from "../env";
import { jawabJson, lolosCsrf } from "../keamanan";
import { NAMA_ZONA, TITIK_PER_ZONA } from "../ruang/peta-kampung";
import { bacaIsi, belumTersedia, galatAkun, jagaRute, metodeSalah, type SesiAktif } from "./masuk";

type KodeZod = { code: string; path: (string | number)[]; message: string };

export function jalurBank(jalur: string): boolean {
  return /^\/api\/(kejadian|rujukan|paket)(\/|$)/.test(jalur);
}

function galat(kode: KodeGalatAkun, status: number, tambahan: Record<string, unknown> = {}): Response {
  return jawabJson({ galat: { kode, pesan: TEKS_KONSOL.galat[kode] }, ...tambahan }, status);
}

const pelaku = (s: SesiAktif): PelakuBank => ({ id: s.akun.id, peran: s.akun.peran, peninjau: Boolean(s.akun.peninjau) });

function parse<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/** Temuan dari isu `zod` untuk rujukan dan paket (kode setara dengan pemeriksa konten JS-05). */
function temuanZod(isu: readonly KodeZod[], awalan: string): TemuanApi[] {
  return isu.map((i) => {
    const kode = i.code === "too_big" ? "TEKS_PANJANG" : i.code === "too_small" ? "TEKS_KOSONG" : i.code === "invalid_string" ? "FORMAT" : i.code === "custom" ? "TEKS_POLOS" : "BENTUK";
    return { kode, tingkat: "galat" as const, letak: `${awalan}/${i.path.join(".")}`, pesan: i.message };
  });
}

async function konteksKejadian(db: D1Database) {
  const status = await petaStatusRujukan(db);
  return { status, konteks: { rujukan: new Set(status.keys()), kunciAset: new Set(KUNCI_ASET_DISETUJUI) } };
}

function rujukanIsi(isi: unknown): string[] {
  const r = (isi as { kartu?: { rujukan?: unknown } } | null)?.kartu?.rujukan;
  return Array.isArray(r) ? r.filter((x): x is string => typeof x === "string") : [];
}

function keadaanDari(b: BarisKejadianD1, pernahTerbit: boolean, dipakai: boolean): KeadaanKejadian {
  return { status: b.status, pemilikId: b.pemilik_id, pernahTerbit, dipakaiRuang: dipakai, adaPerubahan: b.status === "terbit" && b.kerja_isi !== b.terbit_isi };
}

export async function tanganiApiBank(request: Request, env: Env, url: URL): Promise<Response> {
  const jalur = url.pathname;
  const metode = request.method;
  const sekarang = Date.now();
  if (metode !== "GET" && !lolosCsrf(request, url, env.LINGKUNGAN)) return galatAkun("ASAL_DITOLAK", 403);
  let m: RegExpExecArray | null;
  if (jalur === "/api/kejadian") {
    if (metode === "GET") return daftar(request, env, sekarang);
    if (metode === "POST") return buat(request, env, sekarang);
    return metodeSalah("GET, POST");
  }
  if (jalur === "/api/kejadian/pilihan") return metode === "GET" ? pilihan(request, env, sekarang) : metodeSalah("GET");
  if ((m = /^\/api\/kejadian\/(K-\d{2,3})$/.exec(jalur))) return metode === "GET" ? detail(request, env, m[1], sekarang) : metodeSalah("GET");
  if ((m = /^\/api\/kejadian\/(K-\d{2,3})\/versi\/(\d{1,4})$/.exec(jalur))) return metode === "GET" ? versi(request, env, m[1], Number(m[2]), sekarang) : metodeSalah("GET");
  if ((m = /^\/api\/kejadian\/(K-\d{2,3})\/kerja$/.exec(jalur))) return metode === "PUT" ? simpan(request, env, m[1], sekarang) : metodeSalah("PUT");
  if ((m = /^\/api\/kejadian\/(K-\d{2,3})\/aksi$/.exec(jalur))) return metode === "POST" ? aksi(request, env, m[1], sekarang) : metodeSalah("POST");
  if (jalur === "/api/rujukan") {
    if (metode === "GET") return daftarRujukan(request, env, sekarang);
    if (metode === "POST") return tambahRujukan(request, env, sekarang);
    return metodeSalah("GET, POST");
  }
  if ((m = /^\/api\/rujukan\/(JR-\d{2,3})$/.exec(jalur))) {
    if (metode === "PUT") return ubahRujukan(request, env, m[1], sekarang);
    if (metode === "DELETE") return hapusRujukan(request, env, m[1], sekarang);
    return metodeSalah("PUT, DELETE");
  }
  if ((m = /^\/api\/rujukan\/(JR-\d{2,3})\/verifikasi$/.exec(jalur))) return metode === "POST" ? verifikasi(request, env, m[1], sekarang) : metodeSalah("POST");
  if (jalur === "/api/paket") {
    if (metode === "GET") return daftarPaket(request, env, sekarang);
    if (metode === "POST") return simpanPaket(request, env, null, sekarang);
    return metodeSalah("GET, POST");
  }
  if ((m = /^\/api\/paket\/([0-9a-f-]{36})$/.exec(jalur))) {
    if (metode === "GET") return detailPaket(request, env, m[1], sekarang);
    if (metode === "PUT") return simpanPaket(request, env, m[1], sekarang);
    return metodeSalah("GET, PUT");
  }
  return belumTersedia();
}

// -------------------------------------------------------------------------------------------
// Kejadian

async function daftar(request: Request, env: Env, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "kejadian.lihat", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const [baris, status] = await Promise.all([daftarKejadianD1(env.DB), petaStatusRujukan(env.DB)]);
  const kejadian = baris.map((b) => {
    const isi = parse<{ judul?: string; zona?: string; topik?: string; jenis?: string }>(b.kerja_isi) ?? {};
    return {
      kode: b.kode,
      judul: isi.judul ?? "",
      zona: isi.zona ?? "",
      topik: isi.topik ?? "",
      jenis: isi.jenis ?? "",
      status: b.status,
      adaPerubahan: b.status === "terbit" && b.kerja_isi !== b.terbit_isi,
      rujukanBelum: rujukanIsi(isi).filter((id) => status.get(id) !== "terverifikasi").length,
      pemilik: b.nama_pemilik,
      milikSaya: b.pemilik_id !== null && b.pemilik_id === jaga.sesi.akun.id,
      diubahPada: b.diubah_pada,
    };
  });
  return jawabJson({ kejadian }, 200);
}

async function pilihan(request: Request, env: Env, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "kejadian.lihat", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const [topik, rujukan] = await Promise.all([daftarTopik(env.DB), daftarRujukanD1(env.DB)]);
  const titikPerZona = Object.fromEntries(Object.entries(TITIK_PER_ZONA).map(([z, t]) => [z, t?.length ?? 0]));
  return jawabJson({ zona: NAMA_ZONA, topik, aset: KUNCI_ASET_DISETUJUI, rujukan: rujukan.map((r) => ({ id: r.id, teks: r.teks, status: r.status })), titikPerZona }, 200);
}

const versiRingkas = (v: BarisVersiTerbit) => ({ nomor: v.nomor, dibuatPada: v.dibuat_pada, penerbit: v.penerbit, catatan: v.catatan_perubahan });

async function detail(request: Request, env: Env, kode: string, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "kejadian.lihat", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const b = await cariKejadianKode(env.DB, kode);
  if (!b || b.kerja_pada === null) return galat("KEJADIAN_TIDAK_ADA", 404);
  const [riwayat, dipakai, { status, konteks }] = await Promise.all([riwayatTerbit(env.DB, b.id), dipakaiRuang(env.DB, b.id), konteksKejadian(env.DB)]);
  const isi = parse<unknown>(b.kerja_isi);
  const keadaan = keadaanDari(b, riwayat.length > 0, dipakai);
  const p = pelaku(jaga.sesi);
  return jawabJson(
    {
      kejadian: { kode: b.kode, status: b.status, pemilik: b.nama_pemilik, milikSaya: b.pemilik_id === p.id, adaPerubahan: keadaan.adaPerubahan, dipakaiRuang: dipakai },
      kerja: { isi, diubahPada: b.kerja_pada },
      riwayat: riwayat.map(versiRingkas),
      temuan: periksaKejadian(isi, konteks),
      rujukanBelum: rujukanIsi(isi).filter((id) => status.get(id) !== "terverifikasi"),
      bolehSunting: bolehSunting(p, keadaan),
      aksi: aksiBoleh(p, keadaan),
    },
    200,
  );
}

async function versi(request: Request, env: Env, kode: string, nomor: number, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "kejadian.lihat", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const b = await cariKejadianKode(env.DB, kode);
  const v = b ? (await riwayatTerbit(env.DB, b.id)).find((x) => x.nomor === nomor) : undefined;
  if (!v) return galat("KEJADIAN_TIDAK_ADA", 404);
  return jawabJson({ ...versiRingkas(v), isi: parse<unknown>(v.isi_json) }, 200);
}

/** Isi dengan kode yang dipaksa sama dengan kejadiannya; null bila bukan objek. */
function isiDenganKode(isi: unknown, kode: string): Record<string, unknown> | null {
  return typeof isi === "object" && isi !== null && !Array.isArray(isi) ? { ...(isi as Record<string, unknown>), kode } : null;
}

async function buat(request: Request, env: Env, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "kejadian.sunting", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const body = await bacaIsi(request, skemaBuatKejadian);
  if (!body) return galatAkun("PERMINTAAN_SALAH", 400);
  const { konteks } = await konteksKejadian(env.DB);
  for (let i = 0; i < 5; i++) {
    const kode = kodeBerikutnya(await semuaKode(env.DB));
    const isi = isiDenganKode(body.isi, kode);
    if (!isi) return galatAkun("PERMINTAAN_SALAH", 400);
    const temuan = periksaKejadian(isi, konteks);
    if (adaGalat(temuan)) return galat("TEMUAN", 400, { temuan });
    const hasil = await buatKejadianD1(env.DB, { kode, isiJson: JSON.stringify(isi), pemilikId: jaga.sesi.akun.id, sekarang });
    if (hasil === "ok") return jawabJson({ kode, diubahPada: sekarang }, 201);
  }
  return galat("SUDAH_DIUBAH", 409);
}

async function simpan(request: Request, env: Env, kode: string, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "kejadian.sunting", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const b = await cariKejadianKode(env.DB, kode);
  if (!b || b.kerja_pada === null) return galat("KEJADIAN_TIDAK_ADA", 404);
  const keadaan = keadaanDari(b, b.versi_terbit_id !== null, false);
  if (!bolehSunting(pelaku(jaga.sesi), keadaan)) return galatAkun("TIDAK_BERWENANG", 403);
  const body = await bacaIsi(request, skemaSimpanKejadian);
  const isi = body ? isiDenganKode(body.isi, b.kode) : null;
  if (!body || !isi) return galatAkun("PERMINTAAN_SALAH", 400);
  const { konteks } = await konteksKejadian(env.DB);
  const temuan = periksaKejadian(isi, konteks);
  if (adaGalat(temuan)) return galat("TEMUAN", 400, { temuan });
  if (body.diubahPada !== b.kerja_pada) return galat("SUDAH_DIUBAH", 409);
  const waktu = Math.max(sekarang, b.kerja_pada + 1);
  const ok = await simpanKerjaD1(env.DB, { kejadianId: b.id, kode: b.kode, isiJson: JSON.stringify(isi), diubahPadaLama: b.kerja_pada, penggunaId: jaga.sesi.akun.id, sekarang: waktu });
  if (!ok) return galat("SUDAH_DIUBAH", 409);
  return jawabJson({ kode: b.kode, diubahPada: waktu }, 200);
}

async function aksi(request: Request, env: Env, kode: string, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "kejadian.lihat", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const body = await bacaIsi(request, skemaAksiKejadian);
  if (!body) return galatAkun("PERMINTAAN_SALAH", 400);
  const b = await cariKejadianKode(env.DB, kode);
  if (!b || b.kerja_pada === null) return galat("KEJADIAN_TIDAK_ADA", 404);
  const [riwayat, dipakai] = await Promise.all([riwayatTerbit(env.DB, b.id), dipakaiRuang(env.DB, b.id)]);
  const keadaan = keadaanDari(b, riwayat.length > 0, dipakai);
  const p = pelaku(jaga.sesi);
  if (!aksiBoleh(p, keadaan).includes(body.aksi)) {
    const bolehAdmin = aksiBoleh({ ...p, peran: "admin" }, { ...keadaan, pemilikId: p.id }).includes(body.aksi);
    return bolehAdmin ? galatAkun("TIDAK_BERWENANG", 403) : galat("STATUS_KEJADIAN", 409);
  }
  const dasar = { kejadianId: b.id, kode: b.kode, penggunaId: p.id, sekarang };
  const isi = parse<unknown>(b.kerja_isi);
  if (body.aksi === "ajukan" || body.aksi === "terbitkan") {
    const { status, konteks } = await konteksKejadian(env.DB);
    const temuan = periksaKejadian(isi, konteks);
    if (adaGalat(temuan)) return galat("TEMUAN", 400, { temuan });
    if (body.aksi === "terbitkan") {
      const catatan = (body.catatan ?? "").trim();
      if (catatan.length < 1 || [...catatan].length > CATATAN_TERBIT_MAKS) return galatAkun("PERMINTAAN_SALAH", 400);
      const belum = rujukanIsi(isi).filter((id) => status.get(id) !== "terverifikasi");
      if (belum.length > 0) return galat("BELUM_TERVERIFIKASI", 409, { rujukanBelum: belum });
      const nomor = await terbitkanD1(env.DB, { ...dasar, catatan });
      if (nomor === null) return galat("BELUM_TERVERIFIKASI", 409);
      return jawabJson({ kode: b.kode, status: "terbit", nomor }, 200);
    }
  }
  let ok = true;
  if (body.aksi === "ajukan") ok = await ubahStatusD1(env.DB, { ...dasar, dari: ["draf"], ke: "tinjau", aksi: "ajukan" });
  else if (body.aksi === "kembalikan") ok = await ubahStatusD1(env.DB, { ...dasar, dari: ["tinjau"], ke: "draf", aksi: "kembalikan" });
  else if (body.aksi === "pulihkan") ok = await ubahStatusD1(env.DB, { ...dasar, dari: ["arsip"], ke: "draf", aksi: "pulihkan" });
  else if (body.aksi === "arsipkan") ok = await arsipkanD1(env.DB, dasar);
  else if (body.aksi === "hapus") {
    try {
      await hapusKejadianD1(env.DB, dasar);
    } catch {
      return galat("MASIH_DIPAKAI", 409);
    }
    return jawabJson({ kode: b.kode, status: null, nomor: null }, 200);
  }
  if (!ok) return galat("STATUS_KEJADIAN", 409);
  const ke = body.aksi === "ajukan" ? "tinjau" : body.aksi === "arsipkan" ? "arsip" : "draf";
  return jawabJson({ kode: b.kode, status: ke, nomor: null }, 200);
}

// -------------------------------------------------------------------------------------------
// Pustaka rujukan

function barisRujukan(r: BarisRujukanD1) {
  return {
    id: r.id,
    teks: r.teks,
    sumber: r.sumber,
    catatan: r.catatan ?? "",
    kodeSehari: r.kode_sehari,
    status: r.status,
    diverifikasiOleh: r.diverifikasi_nama,
    diverifikasiPada: r.diverifikasi_pada,
    dipakai: r.dipakai,
  };
}

async function daftarRujukan(request: Request, env: Env, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "rujukan.lihat", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  return jawabJson({ rujukan: (await daftarRujukanD1(env.DB)).map(barisRujukan) }, 200);
}

/** Memeriksa isi rujukan dengan skema bank awal (Architecture 5.4). */
function periksaRujukan(id: string, isi: { teks: string; sumber: string; catatan: string; kodeSehari: string | null }): TemuanApi[] {
  const hasil = skemaRujukanBank.safeParse({ id, teks: isi.teks, sumber: isi.sumber, kodeSehari: isi.kodeSehari, catatan: isi.catatan });
  return hasil.success ? [] : temuanZod(hasil.error.issues as unknown as KodeZod[], id);
}

async function tambahRujukan(request: Request, env: Env, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "rujukan.tambah", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const isi = await bacaIsi(request, skemaIsiRujukan);
  if (!isi) return galatAkun("PERMINTAAN_SALAH", 400);
  for (let i = 0; i < 5; i++) {
    const id = idRujukanBerikutnya((await daftarRujukanD1(env.DB)).map((r) => r.id));
    const temuan = periksaRujukan(id, isi);
    if (temuan.length > 0) return galat("TEMUAN", 400, { temuan });
    if ((await tambahRujukanD1(env.DB, { id, ...isi }, jaga.sesi.akun.id, sekarang)) === "ok") {
      const r = await cariRujukanD1(env.DB, id);
      return jawabJson({ rujukan: r ? barisRujukan(r) : null }, 201);
    }
  }
  return galat("SUDAH_DIUBAH", 409);
}

async function ubahRujukan(request: Request, env: Env, id: string, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "rujukan.sunting", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const isi = await bacaIsi(request, skemaIsiRujukan);
  if (!isi) return galatAkun("PERMINTAAN_SALAH", 400);
  const temuan = periksaRujukan(id, isi);
  if (temuan.length > 0) return galat("TEMUAN", 400, { temuan });
  if (!(await ubahRujukanD1(env.DB, { id, ...isi }, jaga.sesi.akun.id, sekarang))) return galat("RUJUKAN_TIDAK_ADA", 404);
  const r = await cariRujukanD1(env.DB, id);
  return jawabJson({ rujukan: r ? barisRujukan(r) : null }, 200);
}

async function verifikasi(request: Request, env: Env, id: string, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "rujukan.lihat", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  if (!jaga.sesi.akun.peninjau) return galatAkun("TIDAK_BERWENANG", 403);
  const isi = await bacaIsi(request, skemaVerifikasi);
  if (!isi) return galatAkun("PERMINTAAN_SALAH", 400);
  if (!(await verifikasiRujukanD1(env.DB, id, isi.terverifikasi, jaga.sesi.akun.id, sekarang))) return galat("RUJUKAN_TIDAK_ADA", 404);
  const r = await cariRujukanD1(env.DB, id);
  return jawabJson({ rujukan: r ? barisRujukan(r) : null }, 200);
}

async function hapusRujukan(request: Request, env: Env, id: string, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "rujukan.sunting", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  if (!(await cariRujukanD1(env.DB, id))) return galat("RUJUKAN_TIDAK_ADA", 404);
  if (!(await hapusRujukanD1(env.DB, id, jaga.sesi.akun.id, sekarang))) return galat("MASIH_DIPAKAI", 409);
  return jawabJson({ ok: true }, 200);
}

// -------------------------------------------------------------------------------------------
// Paket

async function daftarPaket(request: Request, env: Env, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "paket.kelola", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const baris = await daftarPaketD1(env.DB);
  const paket = [];
  for (const p of baris) paket.push({ id: p.id, nama: p.nama, deskripsi: p.deskripsi ?? "", aktif: p.aktif === 1, jumlah: p.jumlah, siapRuangBiasa: await paketSiapRuangBiasa(env.DB, p.id) });
  return jawabJson({ paket }, 200);
}

async function detailPaket(request: Request, env: Env, id: string, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "paket.kelola", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const p = await cariPaketD1(env.DB, id);
  if (!p) return galat("PAKET_TIDAK_ADA", 404);
  const kejadian = (await kejadianPaketD1(env.DB, id)).map((k) => {
    const isi = parse<{ judul?: string; zona?: string }>(k.kerja_isi) ?? {};
    return { kode: k.kode, judul: isi.judul ?? "", zona: isi.zona ?? "", status: k.status };
  });
  return jawabJson({ paket: { id: p.id, nama: p.nama, deskripsi: p.deskripsi ?? "", aktif: p.aktif === 1, jumlah: p.jumlah, siapRuangBiasa: await paketSiapRuangBiasa(env.DB, p.id) }, kejadian }, 200);
}

async function simpanPaket(request: Request, env: Env, idLama: string | null, sekarang: number): Promise<Response> {
  const jaga = await jagaRute(request, env, "paket.kelola", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const isi = await bacaIsi(request, skemaIsiPaket);
  if (!isi) return galatAkun("PERMINTAAN_SALAH", 400);
  if (idLama && !(await cariPaketD1(env.DB, idLama))) return galat("PAKET_TIDAK_ADA", 404);
  const id = idLama ?? crypto.randomUUID();
  const skema = skemaPaketBank.safeParse({ nama: isi.nama, deskripsi: isi.deskripsi, kejadian: isi.kejadian });
  const temuan: TemuanApi[] = skema.success ? [] : temuanZod(skema.error.issues as unknown as KodeZod[], "paket");
  const peta = await idKejadianDariKode(env.DB, isi.kejadian);
  const terlihat = new Set<string>();
  isi.kejadian.forEach((kode, i) => {
    const k = peta.get(kode);
    if (terlihat.has(kode)) temuan.push({ kode: "PAKET_KEJADIAN_KEMBAR", tingkat: "galat", letak: `paket/kejadian.${i}`, pesan: kode });
    else if (!k || (k.status !== "tinjau" && k.status !== "terbit")) temuan.push({ kode: "PAKET_KEJADIAN_TIDAK_ADA", tingkat: "galat", letak: `paket/kejadian.${i}`, pesan: kode });
    terlihat.add(kode);
  });
  const zona = isi.kejadian.map((k) => peta.get(k)?.zona).filter((z): z is string => typeof z === "string") as ZonaId[];
  const titik = Object.fromEntries(Object.entries(TITIK_PER_ZONA).map(([z, t]) => [z, t?.length ?? 0])) as Partial<Record<ZonaId, number>>;
  temuan.push(...periksaPaketPeta(zona, titik, "paket"));
  if (temuan.length > 0) return galat("TEMUAN", 400, { temuan });
  if (await namaPaketDipakai(env.DB, isi.nama, id)) return galat("NAMA_DIPAKAI", 409);
  await simpanPaketD1(env.DB, {
    id,
    baru: idLama === null,
    nama: isi.nama,
    deskripsi: isi.deskripsi,
    aktif: isi.aktif,
    kejadianId: isi.kejadian.map((k) => peta.get(k)?.id ?? ""),
    penggunaId: jaga.sesi.akun.id,
    sekarang,
  });
  return jawabJson({ id }, idLama ? 200 : 201);
}
