// Menyalakan server lokal sekali untuk semua uji server, lalu mematikannya (spesifikasi JS-03, bagian "Skrip").
import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";

const akar = fileURLToPath(new URL("../../../", import.meta.url));
let anak: ChildProcess | null = null;

export async function setup(): Promise<void> {
  anak = spawn(process.execPath, ["scripts/jejak-setara/server-lokal.mjs", "--port", "4320"], { cwd: akar, stdio: "ignore", env: process.env });
  const batas = Date.now() + 180_000;
  while (Date.now() < batas) {
    try {
      if ((await fetch("http://127.0.0.1:4320/api/sehat")).ok) return;
    } catch {
      // Belum siap.
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server lokal tidak siap dalam 180 detik");
}

export async function teardown(): Promise<void> {
  anak?.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 800));
}
