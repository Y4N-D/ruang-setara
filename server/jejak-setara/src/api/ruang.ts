// Rute ruang (spesifikasi JS-03 bagian A sampai C, JS-08, dan JS-10): pemeriksaan kode untuk pemain, ruang dari konsol
// (JS-10, P-2 sampai P-12), sambungan WebSocket pemain (JS-03, P-14) dan layar kelas (JS-10, P-13), serta kait uji
// lokal (JS-10, P-32). Ruang coba JS-03 dan kait `kelas` dipensiunkan di JS-10. JS-11: riwayat (P-17), hasil dan
// rincian (P-21, P-24), ekspor CSV (P-26 sampai P-30), dan hapus data ruang (P-33).
import {
  bacaSaringanRiwayat,
  penandaRiwayat,
  rondeDimainkan,
  ringkasHasil,
  skemaRingkasanHasilRuang,
  urutPeserta,
  type PesertaHasil,
  type RuangRiwayat,
} from "../../../../app/jejak-setara/inti/hasil";
import { skemaIsiKejadian } from "../../../../app/jejak-setara/inti/konten/skema";
import { PANJANG_TEKS } from "../../../../app/jejak-setara/inti/protokol";
import {
  bacaRuangAktifMaks,
  idRuangSah,
  normalkanLabel,
  periksaRuangBaru,
  RUANG_AKTIF_MS,
  RUANG_DAFTAR_MAKS,
  RUANG_DAFTAR_MS,
  skemaKelola,
  skemaPemakaian,
  skemaRuangBaru,
  skillAktifRuang,
  STATUS_HASIL,
  STATUS_RUANG,
  type KodeGalatRuang,
  type RingkasanRuang,
  type StatusRuangKonsol,
} from "../../../../app/jejak-setara/inti/ruang";
import type { PengaturanRuang } from "../../../../app/jejak-setara/inti/tipe";
import { TEKS } from "../../../../app/jejak-setara/teks";
import { TEKS_KONSOL } from "../../../../app/jejak-setara/teks-konsol";
import { buatTiket, periksaTiket } from "../auth/tiket";
import { pernyataanAudit } from "../db/bank";
import { bacaPaketUntuk, bacaTeksRujukan, daftarPaketPilihan, paketSiapRuangBiasa } from "../db/konten";
import {
  bacaJawabanHasil,
  bacaPesertaHasil,
  type BarisPesertaHasil,
  type BarisRiwayat,
  type BarisRuangKonsol,
  cariPesertaRuang,
  cariRuangAktif,
  cariRuangId,
  daftarRiwayat,
  daftarRuang,
  hapusDataRuang,
  hapusRuangKedaluwarsa,
  hitungDataRuang,
  ruangAktifPemilik,
  sisipkanRuang,
  tandaiRuangDitutup,
} from "../db/ruang";
import { csvJawaban, csvPeserta, namaBerkasCsv, rincianJawaban, type PesertaEkspor } from "../ekspor/csv";
import type { Env } from "../env";
import { asalDiizinkan, bolehLewat, jawabGalat, jawabJson, kodeAcak, lolosCsrf, normalkanKode, POLA_KODE_RUANG, TAJUK_JSON } from "../keamanan";
import type { DataRuang } from "../ruang/inti-ruang";
import { jumlahTitikRuang, saringMenurutTitik, type KejadianMasuk } from "../ruang/kejadian-ruang";
import { TITIK_PER_ZONA } from "../ruang/peta-kampung";
import { bacaIsi, belumTersedia, galatAkun, jagaRute, metodeSalah, type SesiAktif } from "./masuk";

const ruangTidakAda = () => jawabGalat("RUANG_TIDAK_ADA", TEKS.api.RUANG_TIDAK_ADA, 404);
const terlaluSering = () => jawabGalat("TERLALU_SERING", TEKS.api.TERLALU_SERING, 429);
/** Ketiga skill P0 tersimpan aktif sampai JS-09 menambah pilihannya (P-5). */

export function galatRuang(kode: KodeGalatRuang, status: number, tambahan: Record<string, unknown> = {}): Response {
  return jawabJson({ galat: { kode, pesan: TEKS_KONSOL.galatRuang[kode] }, ...tambahan }, status);
}

export function jalurRuang(jalur: string): boolean {
  return jalur.startsWith("/api/publik/ruang/") || jalur === "/api/ruang" || jalur.startsWith("/api/ruang/") || jalur.startsWith("/api/uji/ruang/") || jalur === "/api/uji/pembersihan";
}

function kodeDariJalur(bagian: string): string | null {
  try {
    const kode = normalkanKode(decodeURIComponent(bagian));
    return POLA_KODE_RUANG.test(kode) ? kode : null;
  } catch {
    return null;
  }
}

/** Ringkasan ruang untuk konsol (P-6). */
export function ringkasanRuang(b: BarisRuangKonsol): RingkasanRuang {
  let batasPemain = 40;
  let skillAktif: unknown = undefined;
  let modeNama: "daftar" | "bebas" = "daftar";
  try {
    const p = JSON.parse(b.pengaturan_json) as PengaturanRuang;
    batasPemain = p.batasPemain;
    skillAktif = p.skillAktif;
    if (p.modeNama === "bebas") modeNama = "bebas"; // JS-14 (P-33)
  } catch {
    // Pengaturan rusak: memakai bawaan.
  }
  const status = (STATUS_RUANG as readonly string[]).includes(b.status) ? (b.status as StatusRuangKonsol) : "lobi";
  return {
    id: b.id,
    kode: b.kode,
    labelKelas: b.label_kelas,
    status,
    uji: b.uji === 1,
    jumlahPeserta: b.jumlah_peserta,
    batasPemain,
    namaGuru: b.nama_guru,
    dibuatPada: b.dibuat_pada,
    skillAktif: skillAktifRuang(skillAktif), // JS-09, P-9
    modeNama,
  };
}

export async function tanganiApiRuang(request: Request, env: Env, url: URL): Promise<Response> {
  const jalur = url.pathname;
  if (jalur.startsWith("/api/publik/ruang/")) return periksaKode(request, env, jalur.slice("/api/publik/ruang/".length));
  const kait = /^\/api\/uji\/ruang\/([^/]+)\/(statistik|putuskan|kejadian|pindahkan|pengaman)$/.exec(jalur);
  if (kait) return env.LINGKUNGAN === "lokal" ? kaitUji(request, env, kait[1], kait[2] as JenisKait) : belumTersedia();
  // JS-14 (P-65): kait uji lokal penghapusan sesudah masa simpan.
  if (jalur === "/api/uji/pembersihan") return env.LINGKUNGAN === "lokal" ? kaitPembersihan(request, env) : belumTersedia();
  if (jalur === "/api/ruang/pilihan") return request.method === "GET" ? pilihan(request, env) : metodeSalah("GET");
  if (jalur === "/api/ruang") {
    if (request.method === "GET") return daftar(request, env);
    if (request.method === "POST") return buat(request, env, url);
    return metodeSalah("GET, POST");
  }
  // JS-11 (P-17): riwayat dikenali sebelum pola /api/ruang/{id}.
  if (jalur === "/api/ruang/riwayat") return request.method === "GET" ? riwayat(request, env, url) : metodeSalah("GET");
  const cocok = /^\/api\/ruang\/([^/]+)(?:\/(kelola|tiket|hasil|ekspor)(?:\/([^/]+))?)?$/.exec(jalur);
  if (!cocok || (cocok[3] !== undefined && cocok[2] !== "hasil")) return belumTersedia();
  const id = cocok[1];
  if (!cocok[2]) {
    if (request.method === "GET") return detail(request, env, url, id);
    if (request.method === "DELETE") return hapus(request, env, url, id); // JS-11, P-33
    return metodeSalah("GET, DELETE");
  }
  if (cocok[2] === "hasil") return request.method === "GET" ? (cocok[3] === undefined ? hasil(request, env, id) : rincian(request, env, id, cocok[3])) : metodeSalah("GET");
  if (cocok[2] === "ekspor") return request.method === "GET" ? ekspor(request, env, url, id) : metodeSalah("GET");
  if (request.method !== "POST") return metodeSalah("POST");
  return cocok[2] === "kelola" ? kelola(request, env, url, id) : tiket(request, env, url, id);
}

// -------------------------------------------------------------------------------------------
// Pemeriksaan kode untuk pemain (JS-03)

async function periksaKode(request: Request, env: Env, bagian: string): Promise<Response> {
  if (request.method !== "GET") return metodeSalah("GET");
  if (!(await bolehLewat(env.BATAS_PUBLIK, request))) return terlaluSering();
  const kode = kodeDariJalur(bagian);
  const ruang = kode ? await cariRuangAktif(env.DB, kode) : null;
  if (!ruang) return ruangTidakAda();
  const pengaturan = JSON.parse(ruang.pengaturan_json) as PengaturanRuang;
  // JS-14 (P-34): mode nama awal ruang.
  return jawabJson({ ada: true, modeNomorAbsen: pengaturan.modeNomorAbsen, modeNama: pengaturan.modeNama === "bebas" ? "bebas" : "daftar" }, 200);
}

// -------------------------------------------------------------------------------------------
// Ruang dari konsol (P-2 sampai P-12)

async function pilihan(request: Request, env: Env): Promise<Response> {
  const jaga = await jagaRute(request, env, "ruang.buat", Date.now());
  if (!jaga.ok) return jaga.jawaban;
  return jawabJson({ paket: await daftarPaketPilihan(env.DB) }, 200);
}

async function daftar(request: Request, env: Env): Promise<Response> {
  const sekarang = Date.now();
  const jaga = await jagaRute(request, env, "ruang.kelola", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const pemilik = jaga.sesi.akun.peran === "admin" ? null : jaga.sesi.akun.id;
  const baris = await daftarRuang(env.DB, pemilik, sekarang - RUANG_DAFTAR_MS, RUANG_DAFTAR_MAKS);
  return jawabJson({ ruang: baris.map(ringkasanRuang) }, 200);
}

/**
 * Isi kejadian ruang (P-3; JS-08, P-1 dan P-2): isi yang tidak lolos skemaIsiKejadian, rujukan tanpa teks, dan
 * kejadian yang zonanya kehabisan titik dilewati.
 */
async function muatKejadian(db: D1Database, paketId: string, uji: boolean, batasPemain: number): Promise<KejadianMasuk[]> {
  const baris = await bacaPaketUntuk(db, paketId, uji);
  const calon: { kode: string; versiId: string; isi: KejadianMasuk["isi"] }[] = [];
  for (const b of baris) {
    let json: unknown;
    try {
      json = JSON.parse(b.isi_json);
    } catch {
      continue;
    }
    const hasil = skemaIsiKejadian.safeParse(json);
    if (hasil.success && hasil.data.kode === b.kode) calon.push({ kode: b.kode, versiId: b.versi_id, isi: hasil.data });
  }
  const teks = await bacaTeksRujukan(
    db,
    calon.flatMap((c) => c.isi.kartu.rujukan),
  );
  const sah: KejadianMasuk[] = [];
  for (const c of calon) {
    const rujukan = c.isi.kartu.rujukan.map((id) => teks.get(id) ?? "");
    if (rujukan.some((r) => r.length === 0 || r.length > PANJANG_TEKS.rujukan)) continue;
    sah.push({ ...c, rujukan });
  }
  return saringMenurutTitik(sah, TITIK_PER_ZONA, jumlahTitikRuang(batasPemain));
}

async function paketAktif(db: D1Database, id: string): Promise<boolean> {
  return (await db.prepare("SELECT id FROM paket WHERE id = ?1 AND aktif = 1").bind(id).first()) !== null;
}

/** P-2 sampai P-5. */
async function buat(request: Request, env: Env, url: URL): Promise<Response> {
  if (!lolosCsrf(request, url, env.LINGKUNGAN)) return galatAkun("ASAL_DITOLAK", 403);
  const sekarang = Date.now();
  const jaga = await jagaRute(request, env, "ruang.buat", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const isi = await bacaIsi(request, skemaRuangBaru);
  if (!isi) return galatRuang("ISI_SALAH", 400);
  const isian = periksaRuangBaru(isi);
  if (isian.length > 0) return galatRuang("ISI_SALAH", 400, { isian });
  if (!(await paketAktif(env.DB, isi.paketId))) return galatRuang("ISI_SALAH", 400);
  if (!isi.uji && !(await paketSiapRuangBiasa(env.DB, isi.paketId))) return galatRuang("PAKET_BELUM_SIAP", 409);
  const pengaturan: PengaturanRuang = {
    durasiMenit: isi.durasiMenit,
    batasPemain: isi.batasPemain,
    batasTerlambatMenit: isi.batasTerlambatMenit,
    // JS-09 (P-8): skill P0 yang dicentang menurut urutan P-1; tanpa isian berarti ketiganya.
    skillAktif: skillAktifRuang(isi.skillAktif),
    modeNomorAbsen: isi.modeNomorAbsen,
    uji: isi.uji,
    modeNama: isi.modeNama ?? "daftar", // JS-14 (P-32)
  };
  const labelKelas = normalkanLabel(isi.labelKelas);
  const kejadian = await muatKejadian(env.DB, isi.paketId, isi.uji, isi.batasPemain);
  const akun = jaga.sesi.akun;
  const guru = akun.peran !== "admin";
  const sejak = sekarang - RUANG_AKTIF_MS;
  const batasAktif = bacaRuangAktifMaks(env.RUANG_AKTIF_MAKS);
  const benih = crypto.getRandomValues(new Uint32Array(1))[0];
  for (let i = 0; i < 5; i++) {
    const kode = kodeAcak((n) => crypto.getRandomValues(new Uint8Array(n)));
    const ruangId = crypto.randomUUID();
    const doId = env.RUANG.newUniqueId();
    const dibuatPada = Date.now();
    const sisip = await sisipkanRuang(
      env.DB,
      { id: ruangId, kode, pemilikId: akun.id, labelKelas, paketId: isi.paketId, pengaturanJson: JSON.stringify(pengaturan), benih, uji: isi.uji, doId: doId.toString(), dibuatPada },
      { sejak, batasAktif, satuPerPemilik: guru },
    );
    if (sisip === "bentrok") continue;
    if (sisip === "ditolak") {
      const lama = guru ? await ruangAktifPemilik(env.DB, akun.id, sejak) : null;
      if (lama) return galatRuang("RUANG_MASIH_ADA", 409, { ruang: { id: lama.id, kode: lama.kode, labelKelas: lama.label_kelas } });
      return galatRuang("SERVER_PENUH", 503);
    }
    const data: DataRuang = { ruangId, kode, pengaturan, benih, dibuatPada, labelKelas };
    try {
      const jawaban = await env.RUANG.get(doId, { locationHint: "apac" }).fetch("https://ruang/inisialisasi", {
        method: "POST",
        body: JSON.stringify({ ...data, kejadian }),
      });
      if (!jawaban.ok) throw new Error(`inisialisasi ${jawaban.status}`);
    } catch {
      await tandaiRuangDitutup(env.DB, ruangId, Date.now());
      return galatRuang("RUANG_GAGAL_DIBUAT", 503);
    }
    const baris = await cariRuangId(env.DB, ruangId);
    if (!baris) return galatRuang("RUANG_GAGAL_DIBUAT", 503);
    return jawabJson({ ruang: ringkasanRuang(baris) }, 201);
  }
  return galatRuang("RUANG_GAGAL_DIBUAT", 503);
}

/** Ruang yang boleh dikelola pengguna ini (P-33): admin semua, guru hanya miliknya; selain itu 404. */
async function ruangMilik(
  request: Request,
  env: Env,
  id: string,
): Promise<{ ok: true; sesi: SesiAktif; ruang: BarisRuangKonsol } | { ok: false; jawaban: Response }> {
  const jaga = await jagaRute(request, env, "ruang.kelola", Date.now());
  if (!jaga.ok) return jaga;
  const ruang = idRuangSah(id) ? await cariRuangId(env.DB, id) : null;
  if (!ruang || (jaga.sesi.akun.peran !== "admin" && ruang.pemilik_id !== jaga.sesi.akun.id)) return { ok: false, jawaban: galatRuang("RUANG_TIDAK_ADA", 404) };
  return { ok: true, sesi: jaga.sesi, ruang };
}

function stubRuang(env: Env, ruang: BarisRuangKonsol): DurableObjectStub {
  return env.RUANG.get(env.RUANG.idFromString(ruang.do_id));
}

/** P-8. */
async function detail(request: Request, env: Env, url: URL, id: string): Promise<Response> {
  const milik = await ruangMilik(request, env, id);
  if (!milik.ok) return milik.jawaban;
  let langsung: Record<string, unknown> | null = null;
  let pemakaian: unknown = null;
  if (milik.ruang.status !== "ditutup") {
    try {
      const jawaban = await stubRuang(env, milik.ruang).fetch("https://ruang/kelola");
      if (jawaban.ok) {
        const { pemakaian: dariRuang, ...isi } = (await jawaban.json()) as Record<string, unknown>;
        langsung = { ...isi, tautan: url.origin };
        pemakaian = dariRuang ?? null;
      }
    } catch {
      langsung = null;
    }
  }
  if (pemakaian === null && milik.ruang.ringkasan_json) {
    try {
      pemakaian = (JSON.parse(milik.ruang.ringkasan_json) as { pemakaian?: unknown }).pemakaian ?? null;
    } catch {
      pemakaian = null;
    }
  }
  // JS-22 (P-17): pemakaian ronde hanya untuk admin.
  const admin = milik.sesi.akun.peran === "admin";
  return jawabJson({ ruang: ringkasanRuang(milik.ruang), langsung, pemakaian: admin && skemaPemakaian.safeParse(pemakaian).success ? pemakaian : null }, 200);
}

/** P-10. */
async function kelola(request: Request, env: Env, url: URL, id: string): Promise<Response> {
  if (!lolosCsrf(request, url, env.LINGKUNGAN)) return galatAkun("ASAL_DITOLAK", 403);
  const milik = await ruangMilik(request, env, id);
  if (!milik.ok) return milik.jawaban;
  const isi = await bacaIsi(request, skemaKelola);
  if (!isi) return galatRuang("ISI_SALAH", 400);
  if (milik.ruang.status === "ditutup") return galatRuang(isi.aksi === "tutup" ? "STATUS_TIDAK_SESUAI" : "RUANG_TIDAK_ADA", isi.aksi === "tutup" ? 409 : 404);
  const jawaban = await stubRuang(env, milik.ruang).fetch("https://ruang/kelola", { method: "POST", body: JSON.stringify(isi) });
  // JS-14 (P-51): jawaban berhasil membawa `nama` atau `jumlah` dari Durable Object.
  if (jawaban.ok) {
    const isiJawaban = (await jawaban.json().catch(() => ({}))) as Record<string, unknown>;
    // JS-16b (P-12, D-3a): pembuatan kode masuk ulang dicatat di log audit tanpa kodenya.
    if (isi.aksi === "kode_masuk_ulang") {
      await pernyataanAudit(env.DB, {
        penggunaId: milik.sesi.akun.id,
        aksi: "ruang.kode_masuk_ulang",
        sasaran: milik.ruang.id,
        rincian: { pemainId: isi.pemainId ?? null },
        sekarang: Date.now(),
      }).run();
    }
    return jawabJson({ ...isiJawaban, ok: true }, 200);
  }
  const galat = ((await jawaban.json().catch(() => null)) as { galat?: { kode?: string } } | null)?.galat?.kode;
  const kode: KodeGalatRuang =
    galat === "PEMAIN_TIDAK_ADA" || galat === "STATUS_TIDAK_SESUAI" || galat === "ISI_SALAH" || galat === "BUKAN_NAMA_BEBAS" ? galat : "RUANG_TIDAK_ADA";
  return galatRuang(kode, jawaban.status === 409 || jawaban.status === 400 ? jawaban.status : 404);
}

/** P-12. */
async function tiket(request: Request, env: Env, url: URL, id: string): Promise<Response> {
  if (!lolosCsrf(request, url, env.LINGKUNGAN)) return galatAkun("ASAL_DITOLAK", 403);
  const milik = await ruangMilik(request, env, id);
  if (!milik.ok) return milik.jawaban;
  if (milik.ruang.status === "ditutup") return galatRuang("RUANG_TIDAK_ADA", 404);
  if (!env.KUNCI_TIKET) return galatAkun("KONSOL_BELUM_SIAP", 503);
  return jawabJson(await buatTiket(env.KUNCI_TIKET, milik.ruang.id, Date.now()), 200);
}

// -------------------------------------------------------------------------------------------
// Riwayat, hasil, rincian, ekspor, dan hapus (JS-11)

const POLA_ID_PESERTA = /^[A-Za-z0-9_-]{1,32}$/;

function ruangRiwayat(b: BarisRiwayat): RuangRiwayat {
  const dimainkan = rondeDimainkan(b.mulai_pada, b.selesai_pada);
  return {
    id: b.id,
    kode: b.kode,
    labelKelas: b.label_kelas,
    uji: b.uji === 1,
    namaGuru: b.nama_guru,
    dibuatPada: b.dibuat_pada,
    mulaiPada: b.mulai_pada,
    selesaiPada: b.selesai_pada,
    dimainkan,
    jumlahPemain: b.jumlah_pemain,
    rataSkor: dimainkan && b.rata_skor !== null ? Math.round(b.rata_skor * 10) / 10 : null,
  };
}

/** P-17. */
async function riwayat(request: Request, env: Env, url: URL): Promise<Response> {
  const jaga = await jagaRute(request, env, "ruang.kelola", Date.now());
  if (!jaga.ok) return jaga.jawaban;
  const admin = jaga.sesi.akun.peran === "admin";
  const s = bacaSaringanRiwayat(url.searchParams, admin);
  if (!s) return galatRuang("ISI_SALAH", 400);
  const baris = await daftarRiwayat(env.DB, { pemilikId: admin ? s.guru : jaga.sesi.akun.id, dari: s.dari, sampai: s.sampai, label: s.label, mulai: s.mulai, batas: s.batas });
  const ruang = baris.slice(0, s.batas).map(ruangRiwayat);
  const akhir = ruang[ruang.length - 1];
  return jawabJson({ ruang, berikutnya: baris.length > s.batas && akhir ? penandaRiwayat(akhir.dibuatPada, akhir.id) : null }, 200);
}

function pesertaEkspor(b: BarisPesertaHasil): PesertaEkspor {
  return {
    id: b.id,
    nama: b.nama_samaran,
    nomorAbsen: b.nomor_absen,
    dikeluarkan: b.dikeluarkan === 1,
    peringkat: b.dikeluarkan === 1 ? null : b.peringkat_akhir,
    skor: b.skor,
    selesai: b.jumlah_kejadian,
    langkah1Dijawab: b.langkah1_dijawab,
    langkah1Benar: b.langkah1_benar,
    tepat: b.tepat,
    kurang: b.kurang,
    berisiko: b.berisiko,
    waktuSkorMs: b.skor > 0 ? b.waktu_skor_ms : null,
    gabungPada: b.gabung_pada,
  };
}

function keHasil(p: PesertaEkspor): PesertaHasil {
  const { id, nama, nomorAbsen, dikeluarkan, peringkat, skor, selesai, langkah1Dijawab, langkah1Benar, tepat, kurang, berisiko, waktuSkorMs } = p;
  return { id, nama, nomorAbsen, dikeluarkan, peringkat, skor, selesai, langkah1Dijawab, langkah1Benar, tepat, kurang, berisiko, waktuSkorMs };
}

function pengaturanHasil(b: BarisRuangKonsol): { durasiMenit: number; modeNomorAbsen: boolean } {
  try {
    const p = JSON.parse(b.pengaturan_json) as Partial<PengaturanRuang>;
    return { durasiMenit: typeof p.durasiMenit === "number" ? p.durasiMenit : 15, modeNomorAbsen: p.modeNomorAbsen === true };
  } catch {
    return { durasiMenit: 15, modeNomorAbsen: false };
  }
}

function jumlahKejadianRingkasan(b: BarisRuangKonsol): number | null {
  try {
    const h = skemaRingkasanHasilRuang.safeParse((JSON.parse(b.ringkasan_json ?? "null") as { hasil?: unknown } | null)?.hasil);
    return h.success ? h.data.jumlahKejadian : null;
  } catch {
    return null;
  }
}

const punyaHasil = (b: BarisRuangKonsol) => (STATUS_HASIL as readonly string[]).includes(b.status);
const dimainkanRuang = (b: BarisRuangKonsol) => rondeDimainkan(b.mulai_pada ?? null, b.selesai_pada ?? null);

/** P-21. */
async function hasil(request: Request, env: Env, id: string): Promise<Response> {
  const milik = await ruangMilik(request, env, id);
  if (!milik.ok) return milik.jawaban;
  const r = milik.ruang;
  if (!punyaHasil(r)) return galatRuang("HASIL_BELUM_ADA", 409);
  const dimainkan = dimainkanRuang(r);
  const peserta = urutPeserta((await bacaPesertaHasil(env.DB, r.id)).map(pesertaEkspor)).map(keHasil);
  return jawabJson(
    {
      ruang: ringkasanRuang(r),
      info: { namaPaket: r.nama_paket ?? null, jumlahKejadian: jumlahKejadianRingkasan(r), ...pengaturanHasil(r), mulaiPada: r.mulai_pada ?? null, selesaiPada: r.selesai_pada ?? null },
      dimainkan,
      ringkasan: dimainkan ? ringkasHasil(peserta) : null,
      peserta,
    },
    200,
  );
}

/** P-24. */
async function rincian(request: Request, env: Env, id: string, bagian: string): Promise<Response> {
  const milik = await ruangMilik(request, env, id);
  if (!milik.ok) return milik.jawaban;
  if (!punyaHasil(milik.ruang)) return galatRuang("HASIL_BELUM_ADA", 409);
  let pesertaId = "";
  try {
    pesertaId = decodeURIComponent(bagian);
  } catch {
    pesertaId = "";
  }
  const p = POLA_ID_PESERTA.test(pesertaId) ? await cariPesertaRuang(env.DB, milik.ruang.id, pesertaId) : null;
  if (!p) return galatRuang("PEMAIN_TIDAK_ADA", 404);
  const { jawaban, versi } = await bacaJawabanHasil(env.DB, milik.ruang.id, p.id);
  const daftar = rincianJawaban(jawaban, versi).map((j) => ({
    kode: j.kode,
    judul: j.judul,
    versi: j.versi,
    huruf1: j.huruf1,
    pilihan1: j.pilihan1,
    benar1: j.benar1,
    jawabanTepat1: j.jawabanTepat1,
    huruf2: j.huruf2,
    pilihan2: j.pilihan2,
    tingkat2: j.tingkat2,
    pilihanTepat2: j.pilihanTepat2,
    poin: j.poin,
    waktuMenjawabMs: j.waktuMenjawabMs,
    petunjukDipakai: j.petunjukDipakai, // JS-09, P-46
  }));
  return jawabJson({ peserta: { id: p.id, nama: p.nama_samaran }, jawaban: daftar }, 200);
}

/** P-26: tajuk jawaban CSV (tajuk keamanan API, dengan jenis isi CSV). */
const TAJUK_CSV: Record<string, string> = { ...TAJUK_JSON, "Content-Type": "text/csv; charset=utf-8" };

/** P-26 sampai P-30. */
async function ekspor(request: Request, env: Env, url: URL, id: string): Promise<Response> {
  const milik = await ruangMilik(request, env, id);
  if (!milik.ok) return milik.jawaban;
  const jenis = url.searchParams.get("jenis");
  if (jenis !== "peserta" && jenis !== "jawaban") return galatRuang("ISI_SALAH", 400);
  const r = milik.ruang;
  if (!punyaHasil(r)) return galatRuang("HASIL_BELUM_ADA", 409);
  const dimainkan = dimainkanRuang(r);
  const peserta = dimainkan ? urutPeserta((await bacaPesertaHasil(env.DB, r.id)).map(pesertaEkspor)) : [];
  const ruang = { labelKelas: r.label_kelas, dibuatPada: r.dibuat_pada };
  let isi: string;
  if (jenis === "peserta") isi = csvPeserta(ruang, peserta);
  else {
    const { jawaban, versi } = dimainkan ? await bacaJawabanHasil(env.DB, r.id, null) : { jawaban: [], versi: [] };
    isi = csvJawaban(ruang, peserta, rincianJawaban(jawaban, versi));
  }
  return new Response(isi, { status: 200, headers: { ...TAJUK_CSV, "Content-Disposition": `attachment; filename="${namaBerkasCsv(r.label_kelas, r.dibuat_pada, jenis)}"` } });
}

/** P-33 (D-3a): hanya admin; ruang harus sudah ditutup. */
async function hapus(request: Request, env: Env, url: URL, id: string): Promise<Response> {
  if (!lolosCsrf(request, url, env.LINGKUNGAN)) return galatAkun("ASAL_DITOLAK", 403);
  const sekarang = Date.now();
  const jaga = await jagaRute(request, env, "ruang.hapus", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const ruang = idRuangSah(id) ? await cariRuangId(env.DB, id) : null;
  if (!ruang) return galatRuang("RUANG_TIDAK_ADA", 404);
  if (ruang.status !== "ditutup") return galatRuang("BELUM_DITUTUP", 409);
  const jumlah = await hitungDataRuang(env.DB, ruang.id);
  const audit = pernyataanAudit(
    env.DB,
    {
      penggunaId: jaga.sesi.akun.id,
      aksi: "ruang.hapus",
      sasaran: ruang.id,
      rincian: { kode: ruang.kode, labelKelas: ruang.label_kelas, dibuatPada: ruang.dibuat_pada, peserta: jumlah.peserta, jawaban: jumlah.jawaban },
      sekarang,
    },
    { sql: "EXISTS (SELECT 1 FROM ruang WHERE id = ?7 AND status = 'ditutup')", nilai: [ruang.id] },
  );
  return (await hapusDataRuang(env.DB, ruang.id, audit)) ? jawabJson({ ok: true }, 200) : galatRuang("RUANG_TIDAK_ADA", 404);
}

// -------------------------------------------------------------------------------------------
// Kait uji lokal (P-32)

type JenisKait = "statistik" | "putuskan" | "kejadian" | "pindahkan" | "pengaman";

/** JS-14 (P-65): menjalankan penghapusan sesudah masa simpan dengan waktu `sekarang` dari isi permintaan. */
async function kaitPembersihan(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return metodeSalah("POST");
  const isi = (await request.json().catch(() => null)) as { sekarang?: unknown } | null;
  const sekarang = typeof isi?.sekarang === "number" && Number.isFinite(isi.sekarang) ? isi.sekarang : Date.now();
  return jawabJson({ dihapus: await hapusRuangKedaluwarsa(env.DB, sekarang) }, 200);
}

async function kaitUji(request: Request, env: Env, bagian: string, jenis: JenisKait): Promise<Response> {
  const kode = kodeDariJalur(bagian);
  const ruang = kode ? await cariRuangAktif(env.DB, kode) : null;
  if (!ruang) return ruangTidakAda();
  const stub = env.RUANG.get(env.RUANG.idFromString(ruang.do_id));
  if (jenis === "statistik" || jenis === "kejadian") {
    if (request.method !== "GET") return metodeSalah("GET");
    return stub.fetch(`https://ruang/${jenis}`);
  }
  if (request.method !== "POST") return metodeSalah("POST");
  if (jenis === "putuskan") return stub.fetch("https://ruang/putuskan", { method: "POST" });
  if (jenis === "pengaman") return stub.fetch("https://ruang/pengaman", { method: "POST", body: await request.text() }); // JS-22
  return stub.fetch("https://ruang/pindahkan", { method: "POST", body: await request.text() });
}

// -------------------------------------------------------------------------------------------
// Sambungan WebSocket

function tajukBersih(request: Request): Headers {
  const tajuk = new Headers(request.headers);
  for (const nama of [...tajuk.keys()]) if (nama.toLowerCase().startsWith("x-jejak-")) tajuk.delete(nama);
  return tajuk;
}

async function periksaAwalWs(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") return jawabGalat("PERLU_WEBSOCKET", TEKS.api.PERLU_WEBSOCKET, 426);
  if (!asalDiizinkan(request.headers.get("Origin"), url, env.LINGKUNGAN)) return jawabGalat("ASAL_DITOLAK", TEKS.api.ASAL_DITOLAK, 403);
  if (!(await bolehLewat(env.BATAS_WS, request))) return terlaluSering();
  return null;
}

/** Sambungan WebSocket pemain: pemeriksaan, lalu diteruskan ke Durable Object ruang (JS-03, P-14). */
export async function tanganiWsRuang(request: Request, env: Env, url: URL): Promise<Response> {
  const tolak = await periksaAwalWs(request, env, url);
  if (tolak) return tolak;
  const kode = kodeDariJalur(url.pathname.slice("/ws/ruang/".length));
  const ruang = kode ? await cariRuangAktif(env.DB, kode) : null;
  if (!ruang) return ruangTidakAda();
  const tajuk = tajukBersih(request);
  tajuk.set("X-Jejak-Peran", "pemain");
  tajuk.set("X-Jejak-Ruang", ruang.id);
  return env.RUANG.get(env.RUANG.idFromString(ruang.do_id)).fetch(new Request(request.url, { method: "GET", headers: tajuk }));
}

/** Sambungan layar kelas bertiket (P-13): tiket diperiksa di sini, nonce sekali pakai dijaga Durable Object. */
export async function tanganiWsKelas(request: Request, env: Env, url: URL): Promise<Response> {
  const tolak = await periksaAwalWs(request, env, url);
  if (tolak) return tolak;
  let id = "";
  try {
    id = decodeURIComponent(url.pathname.slice("/ws/kelas/".length));
  } catch {
    id = "";
  }
  if (!idRuangSah(id)) return ruangTidakAda();
  const hasil = env.KUNCI_TIKET ? await periksaTiket(env.KUNCI_TIKET, url.searchParams.get("tiket") ?? "", id, Date.now()) : { ok: false as const };
  if (!hasil.ok) return jawabGalat("TIKET_DITOLAK", "Tiket layar kelas ditolak.", 403);
  const ruang = await cariRuangId(env.DB, id);
  if (!ruang || ruang.status === "ditutup") return ruangTidakAda();
  const tajuk = tajukBersih(request);
  tajuk.set("X-Jejak-Peran", "guru");
  tajuk.set("X-Jejak-Nonce", hasil.nonce);
  tajuk.set("X-Jejak-Kedaluwarsa", String(hasil.kedaluwarsa));
  tajuk.set("X-Jejak-Asal", url.origin);
  return stubRuang(env, ruang).fetch(new Request("https://ruang/ws-kelas", { method: "GET", headers: tajuk }));
}
