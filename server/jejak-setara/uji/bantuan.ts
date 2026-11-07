// Bantuan uji server: membuat ruang, klien WebSocket dengan Origin, upgrade mentah, dan kueri D1 lokal.
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

export interface Klien {
  ws: WebSocket;
  masuk: Record<string, unknown>[];
  tutupKode: number | null;
  kirim(p: unknown): void;
  tunggu(cocok: (m: Record<string, unknown>) => boolean, ms?: number): Promise<Record<string, unknown>>;
}

export function klien(kode: string, port = 4320, asal = alamat(port)): Promise<Klien> {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws/ruang/${kode}`, { headers: { Origin: asal } } as unknown as string[]);
  const k: Klien = {
    ws,
    masuk: [],
    tutupKode: null,
    kirim: (p) => ws.send(typeof p === "string" ? p : JSON.stringify(p)),
    tunggu: async (cocok, ms = 5000) => {
      const batas = Date.now() + ms;
      while (Date.now() < batas) {
        const ada = k.masuk.find(cocok);
        if (ada) return ada;
        await tidur(20);
      }
      throw new Error("pesan yang ditunggu tidak datang: " + JSON.stringify(k.masuk.map((m) => m.t)));
    },
  };
  ws.onmessage = (e) => k.masuk.push(JSON.parse(String(e.data)) as Record<string, unknown>);
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
