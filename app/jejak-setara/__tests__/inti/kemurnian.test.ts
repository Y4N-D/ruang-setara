// Uji kemurnian inti (spesifikasi JS-02, AC-1; AGENTS aturan wajib 1; Architecture 17).
// Memindai semua berkas app/jejak-setara/inti/**/*.ts. Komentar diabaikan; isi teks dalam tanda kutip
// diabaikan saat mencari panggilan terlarang, tetapi ekspresi di dalam ${…} tetap diperiksa.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const FOLDER_INTI = fileURLToPath(new URL("../../inti/", import.meta.url));

function berkasTs(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((isi) => {
    const jalur = join(folder, isi.name);
    if (isi.isDirectory()) return berkasTs(jalur);
    return isi.name.endsWith(".ts") ? [jalur] : [];
  });
}

/** Dua salinan kode: tanpa komentar (teks utuh), dan tanpa komentar maupun isi teks. */
function pindai(kode: string): { tanpaKomentar: string; tanpaTeks: string } {
  let tanpaKomentar = "";
  let tanpaTeks = "";
  const tambah = (a: string, b: string = a) => {
    tanpaKomentar += a;
    tanpaTeks += b;
  };
  const kosong = (s: string) => s.replace(/[^\n]/g, " ");
  const kurung: number[] = []; // kedalaman { } di dalam setiap ${ yang terbuka
  let mode: "kode" | "'" | '"' | "`" = "kode";
  let i = 0;
  while (i < kode.length) {
    const c = kode[i];
    const d = kode[i + 1] ?? "";
    if (mode === "kode") {
      if (c === "/" && d === "/") {
        const akhir = kode.indexOf("\n", i);
        const j = akhir < 0 ? kode.length : akhir;
        tambah(kosong(kode.slice(i, j)));
        i = j;
      } else if (c === "/" && d === "*") {
        const akhir = kode.indexOf("*/", i + 2);
        const j = akhir < 0 ? kode.length : akhir + 2;
        tambah(kosong(kode.slice(i, j)));
        i = j;
      } else if (c === "'" || c === '"' || c === "`") {
        mode = c;
        tambah(c);
        i++;
      } else if (c === "}" && kurung.length > 0 && kurung[kurung.length - 1] === 0) {
        kurung.pop();
        mode = "`";
        tambah(c);
        i++;
      } else {
        if (kurung.length > 0 && c === "{") kurung[kurung.length - 1]++;
        if (kurung.length > 0 && c === "}") kurung[kurung.length - 1]--;
        tambah(c);
        i++;
      }
    } else if (c === "\\") {
      tambah(c + d, kosong(c + d));
      i += 2;
    } else if (c === mode) {
      mode = "kode";
      tambah(c);
      i++;
    } else if (mode === "`" && c === "$" && d === "{") {
      kurung.push(0);
      mode = "kode";
      tambah("${");
      i += 2;
    } else {
      tambah(c, kosong(c));
      i++;
    }
  }
  return { tanpaKomentar, tanpaTeks };
}

const IMPOR_TERLARANG: [RegExp, string][] = [
  [/^react(-dom)?(\/|$)/, "React"],
  [/^next(\/|$)/, "Next"],
  [/^node:/, "modul Node"],
  [/^(fs|path|os|crypto|child_process|http|https|url|util|timers|worker_threads)(\/|$)/, "modul Node"],
  [/^@cloudflare\//, "API Workers"],
  [/(^|\/)server\//, "kode server"],
  [/(^|\/)(pemain|admin|bersama)(\/|$)/, "kode layar"],
];

const PANGGILAN_TERLARANG: [RegExp, string][] = [
  [/\bDate\s*\.\s*now\b/, "Date.now"],
  [/\bnew\s+Date\s*\(\s*\)/, "new Date()"],
  [/\bMath\s*\.\s*random\b/, "Math.random"],
  [/\bperformance\s*\.\s*now\b/, "performance.now"],
  [/\bcrypto\b/, "crypto"],
  [/\bfetch\b/, "fetch"],
  [/\blocalStorage\b/, "localStorage"],
  [/\bsessionStorage\b/, "sessionStorage"],
  [/\bdocument\b/, "document"],
  [/\bwindow\b/, "window"],
];

/** Daftar pelanggaran kemurnian di satu berkas kode. */
function periksaKemurnian(kode: string): string[] {
  const { tanpaKomentar, tanpaTeks } = pindai(kode);
  const pelanggaran: string[] = [];
  const impor = [
    ...tanpaKomentar.matchAll(/\bfrom\s*["']([^"']+)["']/g),
    ...tanpaKomentar.matchAll(/\bimport\s*["']([^"']+)["']/g),
    ...tanpaKomentar.matchAll(/\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g),
  ].map((m) => m[1]);
  for (const asal of impor) {
    for (const [pola, apa] of IMPOR_TERLARANG) if (pola.test(asal)) pelanggaran.push(`impor ${apa}: "${asal}"`);
  }
  for (const [pola, apa] of PANGGILAN_TERLARANG) if (pola.test(tanpaTeks)) pelanggaran.push(`memakai ${apa}`);
  return pelanggaran;
}

describe("pemeriksa kemurnian menangkap pelanggaran", () => {
  const terlarang = [
    'import { useState } from "react";',
    'import { createRoot } from "react-dom/client";',
    'import Link from "next/link";',
    'import { readFileSync } from "node:fs";',
    'import { join } from "path";',
    'import type { Fetcher } from "@cloudflare/workers-types";',
    'import worker from "../../../server/jejak-setara/src/index";',
    'import App from "../pemain/App";',
    'export { default } from "../admin/App";',
    'import HalamanKerangka from "../bersama/HalamanKerangka";',
    'const modul = await import("node:crypto");',
    "const t = Date.now();",
    "const t = Date . now();",
    "const t = new Date();",
    "const x = Math.random();",
    "const t = performance.now();",
    "const a = crypto.getRandomValues(new Uint8Array(4));",
    "const b = globalThis.crypto;",
    'await fetch("/api/sehat");',
    'localStorage.setItem("a", "b");',
    "sessionStorage.clear();",
    "document.title = 'x';",
    "const w = window.innerWidth;",
    "const s = `jam ${Date.now()} sekarang`;",
    "const s = `a ${`b ${Math.random()}`}`;",
  ];
  for (const kode of terlarang) {
    it(`menolak: ${kode}`, () => {
      expect(periksaKemurnian(kode).length, kode).toBeGreaterThan(0);
    });
  }

  const boleh = [
    'import { z } from "zod";',
    'import { benih } from "./acak";',
    'import type { PetaJejak } from "./tipe";',
    "// Date.now() hanya disebut di komentar",
    "/* Math.random() dan fetch di komentar blok */ const a = 1;",
    'const s = "Math.random, fetch, dan window hanya teks";',
    "const s = 'document di dalam teks';",
    "const s = `jam ${jam} dan crypto di teks`;",
    "const t = new Date(waktuServer);",
    "const prefetch = 1; const windowed = 2;",
    'const pola = "http://contoh"; // fetch(pola)',
  ];
  for (const kode of boleh) {
    it(`menerima: ${kode}`, () => {
      expect(periksaKemurnian(kode)).toEqual([]);
    });
  }
});

describe("inti/ murni", () => {
  const semua = berkasTs(FOLDER_INTI);

  it("memindai semua berkas inti, termasuk keenam berkas JS-02", () => {
    const nama = semua.map((jalur) => relative(FOLDER_INTI, jalur).split("\\").join("/"));
    for (const berkas of ["tipe.ts", "acak.ts", "aturan.ts", "gerak.ts", "peta.ts", "protokol.ts"]) expect(nama).toContain(berkas);
  });

  for (const jalur of semua) {
    it(`${relative(FOLDER_INTI, jalur).split("\\").join("/")} tanpa impor dan panggilan terlarang`, () => {
      expect(periksaKemurnian(readFileSync(jalur, "utf8"))).toEqual([]);
    });
  }
});
