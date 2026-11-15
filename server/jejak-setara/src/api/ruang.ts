// Rute ruang (spesifikasi JS-03 bagian A sampai C, JS-08, dan JS-10): pemeriksaan kode untuk pemain, ruang dari konsol
// (JS-10, P-2 sampai P-12), sambungan WebSocket pemain (JS-03, P-14) dan layar kelas (JS-10, P-13), serta kait uji
// lokal (JS-10, P-32). Ruang coba JS-03 dan kait `kelas` dipensiunkan di JS-10.
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
  skemaRuangBaru,
  STATUS_RUANG,
  type KodeGalatRuang,
  type RingkasanRuang,
  type StatusRuangKonsol,
} from "../../../../app/jejak-setara/inti/ruang";
import type { PengaturanRuang } from "../../../../app/jejak-setara/inti/tipe";
import { TEKS } from "../../../../app/jejak-setara/teks";
import { TEKS_KONSOL } from "../../../../app/jejak-setara/teks-konsol";
import { buatTiket, periksaTiket } from "../auth/tiket";
import { bacaPaketUntuk, bacaTeksRujukan, daftarPaketPilihan, paketSiapRuangBiasa } from "../db/konten";
import {
  cariRuangAktif,
  cariRuangId,
  daftarRuang,
  ruangAktifPemilik,
  sisipkanRuang,
  tandaiRuangDitutup,
  type BarisRuangKonsol,
} from "../db/ruang";
import type { Env } from "../env";
import { asalDiizinkan, bolehLewat, jawabGalat, jawabJson, kodeAcak, lolosCsrf, normalkanKode, POLA_KODE_RUANG } from "../keamanan";
import type { DataRuang } from "../ruang/inti-ruang";
import { jumlahTitikRuang, saringMenurutTitik, type KejadianMasuk } from "../ruang/kejadian-ruang";
import { TITIK_PER_ZONA } from "../ruang/peta-kampung";
import { bacaIsi, belumTersedia, galatAkun, jagaRute, metodeSalah, type SesiAktif } from "./masuk";

const ruangTidakAda = () => jawabGalat("RUANG_TIDAK_ADA", TEKS.api.RUANG_TIDAK_ADA, 404);
const terlaluSering = () => jawabGalat("TERLALU_SERING", TEKS.api.TERLALU_SERING, 429);
/** Ketiga skill P0 tersimpan aktif sampai JS-09 menambah pilihannya (P-5). */
const SKILL_P0: PengaturanRuang["skillAktif"] = ["lari", "kompas", "petunjuk"];

export function galatRuang(kode: KodeGalatRuang, status: number, tambahan: Record<string, unknown> = {}): Response {
  return jawabJson({ galat: { kode, pesan: TEKS_KONSOL.galatRuang[kode] }, ...tambahan }, status);
}

export function jalurRuang(jalur: string): boolean {
  return jalur.startsWith("/api/publik/ruang/") || jalur === "/api/ruang" || jalur.startsWith("/api/ruang/") || jalur.startsWith("/api/uji/ruang/");
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
  try {
    batasPemain = (JSON.parse(b.pengaturan_json) as PengaturanRuang).batasPemain;
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
  };
}

export async function tanganiApiRuang(request: Request, env: Env, url: URL): Promise<Response> {
  const jalur = url.pathname;
  if (jalur.startsWith("/api/publik/ruang/")) return periksaKode(request, env, jalur.slice("/api/publik/ruang/".length));
  const kait = /^\/api\/uji\/ruang\/([^/]+)\/(statistik|putuskan|kejadian|pindahkan)$/.exec(jalur);
  if (kait) return env.LINGKUNGAN === "lokal" ? kaitUji(request, env, kait[1], kait[2] as JenisKait) : belumTersedia();
  if (jalur === "/api/ruang/pilihan") return request.method === "GET" ? pilihan(request, env) : metodeSalah("GET");
  if (jalur === "/api/ruang") {
    if (request.method === "GET") return daftar(request, env);
    if (request.method === "POST") return buat(request, env, url);
    return metodeSalah("GET, POST");
  }
  const cocok = /^\/api\/ruang\/([^/]+)(?:\/(kelola|tiket))?$/.exec(jalur);
  if (!cocok) return belumTersedia();
  const id = cocok[1];
  if (!cocok[2]) return request.method === "GET" ? detail(request, env, url, id) : metodeSalah("GET");
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
  return jawabJson({ ada: true, modeNomorAbsen: pengaturan.modeNomorAbsen }, 200);
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
    skillAktif: SKILL_P0,
    modeNomorAbsen: isi.modeNomorAbsen,
    uji: isi.uji,
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
  if (milik.ruang.status !== "ditutup") {
    try {
      const jawaban = await stubRuang(env, milik.ruang).fetch("https://ruang/kelola");
      if (jawaban.ok) langsung = { ...((await jawaban.json()) as Record<string, unknown>), tautan: url.origin };
    } catch {
      langsung = null;
    }
  }
  return jawabJson({ ruang: ringkasanRuang(milik.ruang), langsung }, 200);
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
  if (jawaban.ok) return jawabJson({ ok: true }, 200);
  const galat = ((await jawaban.json().catch(() => null)) as { galat?: { kode?: string } } | null)?.galat?.kode;
  const kode: KodeGalatRuang = galat === "PEMAIN_TIDAK_ADA" || galat === "STATUS_TIDAK_SESUAI" || galat === "ISI_SALAH" ? galat : "RUANG_TIDAK_ADA";
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
// Kait uji lokal (P-32)

type JenisKait = "statistik" | "putuskan" | "kejadian" | "pindahkan";

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
