// Bantuan uji ujung ke ujung (JS-10, P-32): ruang dibuat lewat jalur guru (admin awal lokal, masuk, POST /api/ruang)
// dan dikendalikan lewat layar kelas bertiket, menggantikan ruang coba JS-03. Kait uji lokal ada di /api/uji/ruang/….
// Berkas ini tidak berakhiran .uji.ts, jadi tidak dibaca sebagai uji.
import { expect, type APIRequestContext } from "@playwright/test";
import { PROTOKOL_VERSI } from "../../app/jejak-setara/inti/versi";

const KUNCI_ADMIN = "lokal-kunci-admin-bukan-rahasia";
const PAKET_INTI = "9880c4d5-8294-51c9-971a-e95531a2e039";
const SANDI_SEMENTARA = "sandi sementara uji e2e";
const SANDI = "kalimat sandi uji e2e";
const IP = `10.77.${process.pid % 250}.1`;
const EMAIL = `admin-e2e-${process.pid}@sekolah.sch.id`;

let asal: string | null = null;
let cookie: string | null = null;
const idRuang = new Map<string, string>();
type Pesan = Record<string, unknown>;
const kelasRuang = new Map<string, { ws: WebSocket; status: string | null; tutup: number | null; riwayat: Pesan[] }>();

async function alamatAsal(request: APIRequestContext): Promise<string> {
  if (!asal) asal = new URL((await request.get("/api/sehat")).url()).origin;
  return asal;
}

const cookieDari = (setCookie: string | undefined) => (setCookie ?? "").split(";")[0];

/** Tajuk konsol: CSRF, alamat tiruan (pembatas percobaan masuk terpisah dari uji konsol), dan cookie admin uji. */
export async function tajukKonsol(request: APIRequestContext): Promise<Record<string, string>> {
  const a = await alamatAsal(request);
  if (!cookie) {
    const awal = await request.post("/api/admin-awal", {
      headers: { "X-Jejak-Kunci-Admin": KUNCI_ADMIN, "CF-Connecting-IP": IP },
      data: { email: EMAIL, sandi: SANDI_SEMENTARA, namaTampilan: "Admin e2e" },
    });
    expect(awal.status()).toBe(200);
    const dasar = { "X-Jejak": "1", Origin: a, "CF-Connecting-IP": IP };
    const masuk = await request.post("/api/masuk", { headers: dasar, data: { email: EMAIL, sandi: SANDI_SEMENTARA } });
    expect(masuk.status()).toBe(200);
    const ganti = await request.post("/api/sandi", { headers: { ...dasar, Cookie: cookieDari(masuk.headers()["set-cookie"]) }, data: { sandiBaru: SANDI } });
    expect(ganti.status()).toBe(200);
    cookie = cookieDari(ganti.headers()["set-cookie"]);
  }
  return { "X-Jejak": "1", Origin: a, "CF-Connecting-IP": IP, Cookie: cookie };
}

/** Ruang uji Paket inti 16 lewat POST /api/ruang; `isi` menimpa bawaan. Mengembalikan kode ruang. */
export async function buatRuang(request: APIRequestContext, isi: Pesan = {}): Promise<string> {
  const j = await request.post("/api/ruang", {
    headers: await tajukKonsol(request),
    data: { labelKelas: "Ruang uji", paketId: PAKET_INTI, durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, modeNomorAbsen: false, uji: true, ...isi },
  });
  expect(j.status()).toBe(201);
  const { ruang } = (await j.json()) as { ruang: { id: string; kode: string } };
  idRuang.set(ruang.kode, ruang.id);
  return ruang.kode;
}

export const idDariKode = (kode: string) => idRuang.get(kode) ?? "";

async function layarKelas(request: APIRequestContext, kode: string) {
  const ada = kelasRuang.get(kode);
  if (ada && ada.tutup === null) return ada;
  const id = idRuang.get(kode);
  expect(id, `ruang ${kode} dibuat lewat buatRuang`).toBeTruthy();
  const t = await request.post(`/api/ruang/${id}/tiket`, { headers: await tajukKonsol(request), data: {} });
  expect(t.status()).toBe(200);
  const { tiket } = (await t.json()) as { tiket: string };
  const a = await alamatAsal(request);
  const ws = new WebSocket(`${a.replace(/^http/, "ws")}/ws/kelas/${id}?tiket=${encodeURIComponent(tiket)}`, { headers: { Origin: a } } as unknown as string[]);
  const k = { ws, status: null as string | null, tutup: null as number | null, riwayat: [] as Pesan[] };
  ws.onmessage = (e) => {
    const m = JSON.parse(String(e.data)) as Pesan;
    k.riwayat.push(m);
    if (m.t === "status_ruang") k.status = String(m.status);
  };
  ws.onclose = (e) => (k.tutup = e.code);
  await new Promise<void>((ok, gagal) => {
    ws.onopen = () => ok();
    ws.onerror = () => gagal(new Error("sambungan layar kelas gagal"));
  });
  ws.send(JSON.stringify({ v: PROTOKOL_VERSI, t: "halo", peran: "guru" }));
  await expect.poll(() => k.status, { timeout: 5000 }).not.toBeNull();
  kelasRuang.set(kode, k);
  return k;
}

/** Pesan layar kelas lewat WebSocket bertiket (pengganti kait `kelas` ruang coba). Mengembalikan status ruang sesudahnya. */
export async function kelas(request: APIRequestContext, kode: string, pesan: Pesan): Promise<string> {
  const k = await layarKelas(request, kode);
  k.ws.send(JSON.stringify({ v: PROTOKOL_VERSI, ...pesan }));
  await new Promise((r) => setTimeout(r, 300));
  return k.status ?? "ditutup";
}

export async function kejadianRuang(request: APIRequestContext, kode: string): Promise<{ kejadianId: string; titik: { x: number; y: number }[] }[]> {
  const j = await request.get(`/api/uji/ruang/${kode}/kejadian`);
  expect(j.status()).toBe(200);
  return ((await j.json()) as { kejadian: { kejadianId: string; titik: { x: number; y: number }[] }[] }).kejadian;
}

export const putuskan = (request: APIRequestContext, kode: string) => request.post(`/api/uji/ruang/${kode}/putuskan`);
export const pindahkanPemain = (request: APIRequestContext, kode: string, nama: string, x: number, y: number) =>
  request.post(`/api/uji/ruang/${kode}/pindahkan`, { data: { nama, x, y } });
