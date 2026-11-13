// Bantuan uji server: membuat ruang, klien WebSocket dengan Origin dan riwayat pesan, upgrade mentah, kueri D1
// lokal, dan penantian sampai suatu keadaan tercapai (tanpa jeda tetap).
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import http from "node:http";
import { fileURLToPath } from "node:url";

export const AKAR = fileURLToPath(new URL("../../../", import.meta.url));
export const alamat = (port = 4320) => `http://127.0.0.1:${port}`;
export const tidur = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function buatRuang(isi: unknown = {}, port = 4320): Promise<{ status: number; isi: Record<string, unknown> }> {
  const j = await fetch(`${alamat(port)}/api/ruang-coba`, { method: "POST", body: JSON.stringify(isi) });
  return { status: j.status, isi: (await j.json()) as Record<string, unknown> };
}

export async function kelas(kode: string, pesan: unknown, port = 4320): Promise<number> {
  return (await fetch(`${alamat(port)}/api/ruang-coba/${kode}/kelas`, { method: "POST", body: JSON.stringify(pesan) })).status;
}

/** Kait kelas beserta isi jawabannya (JS-07, P-54). */
export async function kelasJson(kode: string, pesan: unknown, port = 4320): Promise<{ status: number; isi: Record<string, unknown> }> {
  const j = await fetch(`${alamat(port)}/api/ruang-coba/${kode}/kelas`, { method: "POST", body: JSON.stringify(pesan) });
  return { status: j.status, isi: (await j.json()) as Record<string, unknown> };
}

export async function statistikRuang(kode: string, port = 4320): Promise<Record<string, unknown>> {
  return (await (await fetch(`${alamat(port)}/api/ruang-coba/${kode}/statistik`)).json()) as Record<string, unknown>;
}

type Pesan = Record<string, unknown>;

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

export function d1<T = Record<string, unknown>>(sql: string, keadaan = "test-results-jejak/keadaan-4320"): T[] {
  const h = spawnSync(
    process.execPath,
    ["node_modules/wrangler/bin/wrangler.js", "d1", "execute", "jejak-setara-lokal", "--local", "--persist-to", keadaan, "--config", "server/jejak-setara/wrangler.jsonc", "--json", "--command", sql],
    { cwd: AKAR, encoding: "utf8", env: { ...process.env, WRANGLER_SEND_METRICS: "false", CI: "1" } },
  );
  if (h.status !== 0) throw new Error(h.stderr || h.stdout);
  return (JSON.parse(h.stdout) as { results: T[] }[])[0].results;
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
