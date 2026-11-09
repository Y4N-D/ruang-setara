// Rute ruang: ruang coba, pemeriksaan kode, kait uji, dan sambungan WebSocket pemain
// (spesifikasi JS-03, bagian A sampai C). Sejak JS-07 kait `kelas` juga hidup di lingkungan uji dengan kunci
// sekali pakai KUNCI_COBA, untuk alur kerja "Jejak: kendali ruang coba" (P-53); dipensiunkan di JS-10.
import { z } from "zod";
import { BATAS } from "../../../../app/jejak-setara/inti/aturan";
import type { PengaturanRuang } from "../../../../app/jejak-setara/inti/tipe";
import { TEKS } from "../../../../app/jejak-setara/teks";
import { cariRuangAktif, sisipkanRuangCoba, tandaiRuangDitutup } from "../db/ruang";
import type { Env } from "../env";
import { asalDiizinkan, bolehLewat, jawabGalat, jawabJson, kodeAcak, normalkanKode, POLA_KODE_RUANG, samaWaktuKonstan } from "../keamanan";
import type { DataRuang } from "../ruang/inti-ruang";

const belumTersedia = () => jawabGalat("BELUM_TERSEDIA", "Fitur ini belum tersedia.", 404);
const metodeSalah = (allow: string) => jawabGalat("METODE_TIDAK_DIDUKUNG", "Metode ini tidak didukung.", 405, { Allow: allow });
const ruangTidakAda = () => jawabGalat("RUANG_TIDAK_ADA", TEKS.api.RUANG_TIDAK_ADA, 404);
const terlaluSering = () => jawabGalat("TERLALU_SERING", TEKS.api.TERLALU_SERING, 429);

function kodeDariJalur(bagian: string): string | null {
  try {
    const kode = normalkanKode(decodeURIComponent(bagian));
    return POLA_KODE_RUANG.test(kode) ? kode : null;
  } catch {
    return null;
  }
}

const skemaRuangCoba = () =>
  z
    .object({
      batasPemain: z.number().int().min(2).max(BATAS.pemainMaks).optional(),
      modeNomorAbsen: z.boolean().optional(),
      durasiMenit: z.union([z.literal(10), z.literal(15), z.literal(20)]).optional(),
    })
    .strict();

/** Tajuk X-Jejak-Kunci-Coba sama dengan rahasia KUNCI_COBA, dibandingkan dengan waktu konstan. */
function kunciCobaBenar(request: Request, env: Env): boolean {
  const kunci = request.headers.get("X-Jejak-Kunci-Coba") ?? "";
  return Boolean(env.KUNCI_COBA) && samaWaktuKonstan(kunci, env.KUNCI_COBA ?? "");
}

export async function tanganiApiRuang(request: Request, env: Env, url: URL): Promise<Response> {
  const jalur = url.pathname;
  if (jalur.startsWith("/api/publik/ruang/")) return periksaKode(request, env, jalur.slice("/api/publik/ruang/".length));
  if (env.LINGKUNGAN !== "lokal" && env.LINGKUNGAN !== "uji") return belumTersedia();
  if (jalur === "/api/ruang-coba") return buatRuangCoba(request, env, url);
  const kait = /^\/api\/ruang-coba\/([^/]+)\/(kelas|statistik|putuskan)$/.exec(jalur);
  if (kait && env.LINGKUNGAN === "lokal") return kaitUji(request, env, kait[1], kait[2] as "kelas" | "statistik" | "putuskan");
  // Lingkungan uji: hanya kait `kelas`, dan hanya dengan kunci sekali pakai (P-53).
  if (kait && kait[2] === "kelas") {
    if (!kunciCobaBenar(request, env)) return jawabGalat("KUNCI_SALAH", TEKS.api.KUNCI_SALAH, 403);
    return kaitUji(request, env, kait[1], "kelas");
  }
  return belumTersedia();
}

async function periksaKode(request: Request, env: Env, bagian: string): Promise<Response> {
  if (request.method !== "GET") return metodeSalah("GET");
  if (!(await bolehLewat(env.BATAS_PUBLIK, request))) return terlaluSering();
  const kode = kodeDariJalur(bagian);
  const ruang = kode ? await cariRuangAktif(env.DB, kode) : null;
  if (!ruang) return ruangTidakAda();
  const pengaturan = JSON.parse(ruang.pengaturan_json) as PengaturanRuang;
  return jawabJson({ ada: true, modeNomorAbsen: pengaturan.modeNomorAbsen }, 200);
}

async function buatRuangCoba(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method !== "POST") return metodeSalah("POST");
  if (env.LINGKUNGAN === "uji" && !kunciCobaBenar(request, env)) return jawabGalat("KUNCI_SALAH", TEKS.api.KUNCI_SALAH, 403);
  let isi: unknown = {};
  const teks = await request.text();
  if (teks.trim() !== "") {
    try {
      isi = JSON.parse(teks);
    } catch {
      return jawabGalat("PENGATURAN_SALAH", TEKS.api.PENGATURAN_SALAH, 400);
    }
  }
  const hasil = skemaRuangCoba().safeParse(isi);
  if (!hasil.success) return jawabGalat("PENGATURAN_SALAH", TEKS.api.PENGATURAN_SALAH, 400);
  const pengaturan: PengaturanRuang = {
    durasiMenit: hasil.data.durasiMenit ?? 15,
    batasPemain: hasil.data.batasPemain ?? 40,
    batasTerlambatMenit: BATAS.terlambatMenit,
    skillAktif: ["lari", "kompas", "petunjuk"],
    modeNomorAbsen: hasil.data.modeNomorAbsen ?? false,
    uji: true,
  };
  if (pengaturan.modeNomorAbsen && pengaturan.batasPemain > BATAS.pemainMaksNomorAbsen) {
    return jawabGalat("PENGATURAN_SALAH", TEKS.api.PENGATURAN_ABSEN, 400);
  }
  const benih = crypto.getRandomValues(new Uint32Array(1))[0];
  for (let i = 0; i < 5; i++) {
    const kode = kodeAcak((n) => crypto.getRandomValues(new Uint8Array(n)));
    const ruangId = crypto.randomUUID();
    const doId = env.RUANG.newUniqueId();
    const dibuatPada = Date.now();
    const sisip = await sisipkanRuangCoba(env.DB, { id: ruangId, kode, pengaturanJson: JSON.stringify(pengaturan), benih, doId: doId.toString(), dibuatPada });
    if (sisip === "bentrok") continue;
    const data: DataRuang = { ruangId, kode, pengaturan, benih, dibuatPada };
    try {
      const jawaban = await env.RUANG.get(doId, { locationHint: "apac" }).fetch("https://ruang/inisialisasi", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!jawaban.ok) throw new Error(`inisialisasi ${jawaban.status}`);
    } catch {
      await tandaiRuangDitutup(env.DB, ruangId, Date.now());
      return jawabGalat("RUANG_GAGAL", TEKS.api.RUANG_GAGAL, 503);
    }
    return jawabJson({ ruangId, kode, tautan: `${url.origin}/?kode=${kode}` }, 201);
  }
  return jawabGalat("KODE_HABIS", TEKS.api.KODE_HABIS, 503);
}

async function kaitUji(request: Request, env: Env, bagian: string, jenis: "kelas" | "statistik" | "putuskan"): Promise<Response> {
  const kode = kodeDariJalur(bagian);
  const ruang = kode ? await cariRuangAktif(env.DB, kode) : null;
  if (!ruang) return ruangTidakAda();
  const stub = env.RUANG.get(env.RUANG.idFromString(ruang.do_id));
  if (jenis === "statistik") {
    if (request.method !== "GET") return metodeSalah("GET");
    return stub.fetch("https://ruang/statistik");
  }
  if (request.method !== "POST") return metodeSalah("POST");
  if (jenis === "putuskan") return stub.fetch("https://ruang/putuskan", { method: "POST" });
  return stub.fetch("https://ruang/kelas", { method: "POST", body: await request.text() });
}

/** Sambungan WebSocket pemain: pemeriksaan, lalu diteruskan ke Durable Object ruang (P-14). */
export async function tanganiWsRuang(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return jawabGalat("PERLU_WEBSOCKET", TEKS.api.PERLU_WEBSOCKET, 426);
  }
  if (!asalDiizinkan(request.headers.get("Origin"), url, env.LINGKUNGAN)) return jawabGalat("ASAL_DITOLAK", TEKS.api.ASAL_DITOLAK, 403);
  if (!(await bolehLewat(env.BATAS_WS, request))) return terlaluSering();
  const kode = kodeDariJalur(url.pathname.slice("/ws/ruang/".length));
  const ruang = kode ? await cariRuangAktif(env.DB, kode) : null;
  if (!ruang) return ruangTidakAda();
  const tajuk = new Headers(request.headers);
  for (const nama of [...tajuk.keys()]) if (nama.toLowerCase().startsWith("x-jejak-")) tajuk.delete(nama);
  tajuk.set("X-Jejak-Peran", "pemain");
  tajuk.set("X-Jejak-Ruang", ruang.id);
  return env.RUANG.get(env.RUANG.idFromString(ruang.do_id)).fetch(new Request(request.url, { method: "GET", headers: tajuk }));
}
