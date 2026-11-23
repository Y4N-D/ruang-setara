// Bantuan uji server: membuat ruang, klien WebSocket dengan Origin dan riwayat pesan, upgrade mentah, kueri D1
// lokal, dan penantian sampai suatu keadaan tercapai (tanpa jeda tetap).
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/versi";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import http from "node:http";
import { fileURLToPath } from "node:url";

export const AKAR = fileURLToPath(new URL("../../../", import.meta.url));
export const alamat = (port = 4320) => `http://127.0.0.1:${port}`;
export const tidur = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Pesan = Record<string, unknown>;

// JS-10 (P-32): ruang dibuat lewat jalur guru (admin awal lokal, masuk, lalu POST /api/ruang), dan dikendalikan lewat
// layar kelas bertiket. Bentuk jawaban buatRuang meniru ruang coba lama agar uji JS-03, JS-07, dan JS-08 tetap sama.
const PAKET_INTI = "9880c4d5-8294-51c9-971a-e95531a2e039";
const KUNCI_ADMIN_LOKAL = "lokal-kunci-admin-bukan-rahasia";
const SANDI_SEMENTARA = "sandi sementara uji server";
const SANDI_UJI = "kalimat sandi uji server";
const sesiPort = new Map<number, string>();
const idRuang = new Map<string, string>();

const tajukCsrf = (port: number, ip: string) => ({ "X-Jejak": "1", Origin: alamat(port), "Content-Type": "application/json", "CF-Connecting-IP": ip });

/** Cookie sesi admin uji untuk server di port ini (dibuat sekali). */
export async function sesiAdmin(port = 4320): Promise<string> {
  const ada = sesiPort.get(port);
  if (ada) return ada;
  const ip = `10.9.${port % 250}.7`;
  const email = `admin-uji-${port}@sekolah.sch.id`;
  const awal = await fetch(`${alamat(port)}/api/admin-awal`, {
    method: "POST",
    headers: { "X-Jejak-Kunci-Admin": KUNCI_ADMIN_LOKAL, "Content-Type": "application/json", "CF-Connecting-IP": ip },
    body: JSON.stringify({ email, sandi: SANDI_SEMENTARA, namaTampilan: "Admin uji" }),
  });
  if (awal.status !== 200) throw new Error(`admin awal ${awal.status}`);
  const masuk = await fetch(`${alamat(port)}/api/masuk`, { method: "POST", headers: tajukCsrf(port, ip), body: JSON.stringify({ email, sandi: SANDI_SEMENTARA }) });
  const sementara = (masuk.headers.get("set-cookie") ?? "").split(";")[0];
  const ganti = await fetch(`${alamat(port)}/api/sandi`, { method: "POST", headers: { ...tajukCsrf(port, ip), Cookie: sementara }, body: JSON.stringify({ sandiBaru: SANDI_UJI }) });
  const cookie = (ganti.headers.get("set-cookie") ?? "").split(";")[0];
  if (ganti.status !== 200 || !cookie) throw new Error(`ganti sandi ${ganti.status}`);
  sesiPort.set(port, cookie);
  return cookie;
}

/** Permintaan konsol dengan sesi admin uji. */
export async function konsol(metode: string, jalur: string, isi?: unknown, port = 4320): Promise<{ status: number; isi: Record<string, unknown> }> {
  const cookie = await sesiAdmin(port);
  const j = await fetch(`${alamat(port)}${jalur}`, {
    method: metode,
    headers: { ...tajukCsrf(port, `10.9.${port % 250}.7`), Cookie: cookie },
    ...(isi === undefined ? {} : { body: typeof isi === "string" ? isi : JSON.stringify(isi) }),
  });
  const teks = await j.text();
  return { status: j.status, isi: teks ? (JSON.parse(teks) as Record<string, unknown>) : {} };
}

/** Membuat ruang uji lewat POST /api/ruang; `isi` menimpa bawaan (durasiMenit, batasPemain, modeNomorAbsen, …). */
export async function buatRuang(isi: Record<string, unknown> = {}, port = 4320): Promise<{ status: number; isi: Record<string, unknown> }> {
  const badan = { labelKelas: "Ruang uji", paketId: PAKET_INTI, durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, modeNomorAbsen: false, uji: true, ...isi };
  const j = await konsol("POST", "/api/ruang", badan, port);
  if (j.status !== 201) return j;
  const ruang = j.isi.ruang as { id: string; kode: string };
  idRuang.set(`${port}:${ruang.kode}`, ruang.id);
  const kejadian = (await (await fetch(`${alamat(port)}/api/uji/ruang/${ruang.kode}/kejadian`)).json()) as { kejadian: unknown[] };
  return { status: 201, isi: { ruangId: ruang.id, kode: ruang.kode, tautan: `${alamat(port)}/?kode=${ruang.kode}`, kejadian: kejadian.kejadian.length, ruang } };
}

/** JS-13: mencatat ruang yang dibuat di luar buatRuang (misalnya ruang biasa milik guru), agar bisa dikendalikan `kelas`. */
export function catatRuangUji(kode: string, id: string, port = 4320): void {
  idRuang.set(`${port}:${kode}`, id);
}

export interface KlienKelas {
  ws: WebSocket;
  riwayat: Pesan[];
  status: string | null;
  tutupKode: number | null;
}
const kelasPort = new Map<string, KlienKelas>();

/** Membuka layar kelas bertiket untuk ruang yang dibuat buatRuang (P-12, P-13), lalu mengirim halo. */
export async function klienKelas(kode: string, port = 4320): Promise<KlienKelas | null> {
  const kunci = `${port}:${kode}`;
  const ada = kelasPort.get(kunci);
  if (ada && ada.tutupKode === null) return ada;
  const id = idRuang.get(kunci);
  if (!id) return null;
  const t = await konsol("POST", `/api/ruang/${id}/tiket`, {}, port);
  if (t.status !== 200) return null;
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws/kelas/${id}?tiket=${encodeURIComponent(String(t.isi.tiket))}`, { headers: { Origin: alamat(port) } } as unknown as string[]);
  const k: KlienKelas = { ws, riwayat: [], status: null, tutupKode: null };
  ws.onmessage = (e) => {
    const m = JSON.parse(String(e.data)) as Pesan;
    k.riwayat.push(m);
    if (m.t === "status_ruang") k.status = String(m.status);
  };
  ws.onclose = (e) => (k.tutupKode = e.code);
  await new Promise<void>((ok, gagal) => {
    ws.onopen = () => ok();
    ws.onerror = () => gagal(new Error("sambungan layar kelas gagal"));
  });
  ws.send(JSON.stringify({ v: PROTOKOL_VERSI, t: "halo", peran: "guru" })); // JS-14: tidak menulis angka versi tetap
  await tungguSampai(() => k.status, (s) => s !== null, 5000, 50);
  kelasPort.set(kunci, k);
  return k;
}

/** Pesan layar kelas lewat WebSocket bertiket (pengganti kait `kelas` lama): 200, 400 untuk halo, 404 tanpa ruang. */
export async function kelas(kode: string, pesan: unknown, port = 4320): Promise<number> {
  if ((pesan as Pesan).t === "halo") return 400;
  const k = await klienKelas(kode, port);
  if (!k) return 404;
  const sebelum = k.riwayat.length;
  k.ws.send(JSON.stringify(pesan));
  await tidur(250);
  if (k.riwayat.length === sebelum) await tidur(250);
  return 200;
}

/** Pesan layar kelas beserta status ruang sesudahnya (pengganti kait `kelas` lama, JS-07 P-54). */
export async function kelasJson(kode: string, pesan: unknown, port = 4320): Promise<{ status: number; isi: Record<string, unknown> }> {
  const status = await kelas(kode, pesan, port);
  const k = kelasPort.get(`${port}:${kode}`);
  return { status, isi: status === 200 ? { ok: true, status: k?.status ?? "ditutup" } : {} };
}

export async function statistikRuang(kode: string, port = 4320): Promise<Record<string, unknown>> {
  return (await (await fetch(`${alamat(port)}/api/uji/ruang/${kode}/statistik`)).json()) as Record<string, unknown>;
}



export interface Klien {
  ws: WebSocket;
  /** Pesan masuk. Uji boleh mengosongkannya sebelum mengirim permintaan, lalu menunggu jawabannya. */
  masuk: Pesan[];
  /** Semua pesan sejak tersambung; tidak pernah dikosongkan (JS-08, perbaikan uji 13 Nov 2026). */
  riwayat: Pesan[];
  tutupKode: number | null;
  kirim(p: unknown): void;
  tunggu(cocok: (m: Pesan) => boolean, ms?: number): Promise<Pesan>;
  /**
   * Seperti `tunggu`, tetapi mencari di `riwayat`. Dipakai untuk pesan yang dikirim server sekali saja dan bisa sudah
   * datang sebelum `masuk` dikosongkan, misalnya `kejadian_terlihat` (sekali per titik, P-10 dan P-11).
   */
  tungguRiwayat(cocok: (m: Pesan) => boolean, ms?: number): Promise<Pesan>;
}

/** Menunggu pesan yang cocok di `daftar()`, diperiksa setiap 20 ms dan sekali lagi saat batas waktu tercapai. */
async function tungguDi(daftar: () => Pesan[], cocok: (m: Pesan) => boolean, ms: number): Promise<Pesan> {
  const batas = Date.now() + ms;
  for (;;) {
    const ada = daftar().find(cocok);
    if (ada) return ada;
    if (Date.now() >= batas) throw new Error("pesan yang ditunggu tidak datang: " + JSON.stringify(daftar().map((m) => m.t)));
    await tidur(20);
  }
}

/**
 * Mengulang `ambil` sampai `cocok` terpenuhi, untuk hasil yang ditulis tanpa pesan penanda, misalnya baris D1
 * dari antrean kiriman ruang. Menggantikan jeda tetap, sehingga uji tidak bergantung pada kecepatan mesin.
 */
export async function tungguSampai<T>(ambil: () => T | Promise<T>, cocok: (hasil: T) => boolean, ms = 20_000, jeda = 250): Promise<T> {
  const batas = Date.now() + ms;
  for (;;) {
    const hasil = await ambil();
    if (cocok(hasil)) return hasil;
    if (Date.now() >= batas) throw new Error("keadaan yang ditunggu tidak tercapai: " + JSON.stringify(hasil));
    await tidur(jeda);
  }
}

export function klien(kode: string, port = 4320, asal = alamat(port)): Promise<Klien> {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws/ruang/${kode}`, { headers: { Origin: asal } } as unknown as string[]);
  const k: Klien = {
    ws,
    masuk: [],
    riwayat: [],
    tutupKode: null,
    kirim: (p) => ws.send(typeof p === "string" ? p : JSON.stringify(p)),
    tunggu: (cocok, ms = 5000) => tungguDi(() => k.masuk, cocok, ms),
    tungguRiwayat: (cocok, ms = 5000) => tungguDi(() => k.riwayat, cocok, ms),
  };
  ws.onmessage = (e) => {
    const m = JSON.parse(String(e.data)) as Pesan;
    k.masuk.push(m);
    k.riwayat.push(m);
  };
  ws.onclose = (e) => (k.tutupKode = e.code);
  return new Promise((ok, gagal) => {
    ws.onopen = () => ok(k);
    ws.onerror = () => gagal(new Error("sambungan gagal"));
  });
}

/** Upgrade WebSocket mentah agar Origin bisa dikosongkan; mengembalikan status HTTP. */
/** Status HTTP upgrade, atau 0 bila server lokal memutus soket tanpa jawaban (penolakan di vite preview). */
export function upgradeMentah(jalur: string, tajuk: Record<string, string>, port = 4320): Promise<number> {
  return new Promise((ok, gagal) => {
    const req = http.request({
      host: "127.0.0.1",
      port,
      path: jalur,
      headers: { Connection: "Upgrade", Upgrade: "websocket", "Sec-WebSocket-Version": "13", "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ==", ...tajuk },
    });
    req.on("response", (res) => {
      res.resume();
      ok(res.statusCode ?? 0);
    });
    req.on("upgrade", (res, soket) => {
      soket.destroy();
      ok(res.statusCode ?? 101);
    });
    req.on("error", (galat: NodeJS.ErrnoException) => (galat.code === "ECONNRESET" || /hang up/.test(galat.message) ? ok(0) : gagal(galat)));
    req.end();
  });
}

/**
 * Menjalankan SQL di D1 lokal Worker uji. Worker yang sedang menulis D1 (misalnya ringkasan ruang yang baru ditutup)
 * bisa mengunci berkas SQLite sesaat, sehingga wrangler gagal dengan SQLITE_BUSY; percobaan diulang sampai 5 kali
 * dengan jeda yang makin panjang (JS-15, Test: "Jejak: uji" 23 Nov 2026, uji masa simpan JS-11).
 */
export function d1<T = Record<string, unknown>>(sql: string, keadaan = "test-results-jejak/keadaan-4320"): T[] {
  for (let coba = 1; ; coba++) {
    const h = spawnSync(
      process.execPath,
      ["node_modules/wrangler/bin/wrangler.js", "d1", "execute", "jejak-setara-lokal", "--local", "--persist-to", keadaan, "--config", "server/jejak-setara/wrangler.jsonc", "--json", "--command", sql],
      { cwd: AKAR, encoding: "utf8", env: { ...process.env, WRANGLER_SEND_METRICS: "false", CI: "1" } },
    );
    if (h.status === 0) return (JSON.parse(h.stdout) as { results: T[] }[])[0].results;
    const pesan = h.stderr || h.stdout;
    if (coba >= 5 || !/SQLITE_BUSY|database is locked/.test(pesan)) throw new Error(pesan);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300 * coba);
  }
}

export async function nyalakanServer(port: number, opsi: string[]): Promise<ChildProcess> {
  const sudahAda = await fetch(`${alamat(port)}/api/sehat`).then(
    () => true,
    () => false,
  );
  if (sudahAda) throw new Error(`port ${port} masih dipakai server lain`);
  const anak = spawn(process.execPath, ["scripts/jejak-setara/server-lokal.mjs", "--port", String(port), ...opsi], { cwd: AKAR, stdio: "ignore", env: process.env });
  const batas = Date.now() + 120_000;
  while (Date.now() < batas) {
    try {
      if ((await fetch(`${alamat(port)}/api/sehat`)).ok) return anak;
    } catch {
      // Belum siap.
    }
    await tidur(300);
  }
  throw new Error("server tidak siap");
}

export async function matikanServer(anak: ChildProcess): Promise<void> {
  await new Promise<void>((ok) => {
    anak.once("exit", () => ok());
    anak.kill("SIGTERM");
  });
  await tidur(300);
}
