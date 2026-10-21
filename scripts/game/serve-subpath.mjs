// Server uji: menyajikan dist-pages/ di bawah /ruang-setara/, meniru alamat GitHub Pages
// (https://NAMA-AKUN.github.io/ruang-setara/). Rujukan berpath absolut akan mendapat 404,
// sehingga ketahuan sebelum terbit. Hanya memakai modul bawaan Node.
// Lihat docs/sehari-setara/Architecture.md bagian 12.
//
// Pemakaian: node scripts/game/serve-subpath.mjs [--port <nomor>]
// Jalankan `npx pnpm@11.25.0 build:pages` lebih dulu.

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "/ruang-setara/";
const HOST = "127.0.0.1";
const DEFAULT_PORT = 4180;
const ROOT = path.resolve(fileURLToPath(new URL("../../dist-pages/", import.meta.url)));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".wasm": "application/wasm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

function readPort(args) {
  let raw;
  const i = args.indexOf("--port");
  if (i !== -1) raw = args[i + 1];
  const inline = args.find((a) => a.startsWith("--port="));
  if (inline) raw = inline.slice("--port=".length);
  if (raw === undefined) return DEFAULT_PORT;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`Nomor port tidak sah: ${raw}`);
    process.exit(1);
  }
  return port;
}

function sendText(res, status, text, extra = {}) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    ...extra,
  });
  res.end(text);
}

function redirect(res, status, location) {
  res.writeHead(status, { Location: location, "Cache-Control": "no-store" });
  res.end();
}

const notFound = (res) => sendText(res, 404, "404 Tidak ditemukan");

// Satu rentang "bytes=awal-akhir". Hasil: null bila tanpa Range atau tidak terbaca
// (berkas dikirim utuh), "invalid" bila di luar ukuran berkas, atau { start, end }.
function parseRange(header, size) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (match[1] === "" && match[2] === "")) return null;
  let start;
  let end;
  if (match[1] === "") {
    const suffix = Number(match[2]);
    if (suffix === 0) return "invalid";
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
  }
  if (start >= size || start > end) return "invalid";
  return { start, end };
}

function sendFile(req, res, filePath, size) {
  const headers = {
    "Content-Type": MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-store",
  };
  const range = parseRange(req.headers.range, size);
  if (range === "invalid") {
    sendText(res, 416, "416 Rentang tidak sah", { "Content-Range": `bytes */${size}` });
    return;
  }
  let start = 0;
  let end = size - 1;
  let status = 200;
  if (range) {
    ({ start, end } = range);
    status = 206;
    headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
  }
  headers["Content-Length"] = String(size === 0 ? 0 : end - start + 1);
  res.writeHead(status, headers);
  if (req.method === "HEAD" || size === 0) {
    res.end();
    return;
  }
  const stream = createReadStream(filePath, { start, end });
  stream.on("error", () => res.destroy());
  stream.pipe(res);
}

async function handle(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendText(res, 405, "405 Metode tidak diizinkan", { Allow: "GET, HEAD" });
    return;
  }
  const url = new URL(req.url ?? "/", "http://localhost");
  const { pathname, search } = url;

  if (pathname === "/") return redirect(res, 302, BASE);
  if (pathname === BASE.slice(0, -1)) return redirect(res, 301, BASE + search);
  if (!pathname.startsWith(BASE)) return notFound(res);

  let relative;
  try {
    relative = decodeURIComponent(pathname.slice(BASE.length));
  } catch {
    return notFound(res);
  }
  if (relative.includes("\0")) return notFound(res);

  const target = path.resolve(ROOT, relative);
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) return notFound(res);

  let info;
  try {
    info = await stat(target);
  } catch {
    return notFound(res);
  }

  if (info.isDirectory()) {
    // Seperti GitHub Pages: folder tanpa garis miring di akhir dialihkan.
    if (!pathname.endsWith("/")) return redirect(res, 301, pathname + "/" + search);
    const index = path.join(target, "index.html");
    let indexInfo;
    try {
      indexInfo = await stat(index);
    } catch {
      return notFound(res);
    }
    if (!indexInfo.isFile()) return notFound(res);
    return sendFile(req, res, index, indexInfo.size);
  }

  if (!info.isFile() || pathname.endsWith("/")) return notFound(res);
  return sendFile(req, res, target, info.size);
}

const port = readPort(process.argv.slice(2));

try {
  if (!(await stat(ROOT)).isDirectory()) throw new Error("bukan folder");
} catch {
  console.error("dist-pages/ belum ada. Jalankan dulu: npx pnpm@11.25.0 build:pages");
  process.exit(1);
}

const server = createServer((req, res) => {
  handle(req, res).catch(() => {
    if (res.headersSent) {
      res.destroy();
    } else {
      res.statusCode = 500;
      res.end();
    }
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} sudah dipakai. Jalankan dengan --port <nomor lain>.`);
    process.exit(1);
  }
  throw error;
});

server.listen(port, HOST, () => {
  console.log(`Menyajikan dist-pages/ di http://${HOST}:${port}${BASE} (Ctrl+C untuk berhenti)`);
  console.log(`Permainan: http://${HOST}:${port}${BASE}sehari-setara/`);
});
