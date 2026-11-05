// Uji unit kerangka Jejak Setara (spesifikasi JS-01, Rencana uji bagian "Uji unit"). Berjalan di Node, tanpa runtime Workers.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import worker from "../../../server/jejak-setara/src/index";
import { PROTOKOL_VERSI } from "../inti/protokol";
import { TEKS } from "../teks";

const AKAR = new URL("../../../", import.meta.url);
// Akhir baris dinormalkan, agar uji tetap lulus di salinan Windows.
const baca = (jalur: string) => readFileSync(new URL(jalur, AKAR), "utf8").replace(/\r\n/g, "\n");

const TAJUK_JSON: Record<string, string> = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "same-origin",
  "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
};

let diteruskan: Request[] = [];
const env = {
  LINGKUNGAN: "lokal",
  ASSETS: {
    fetch: async (permintaan: Request) => {
      diteruskan.push(permintaan);
      return new Response("aset", { status: 200, headers: { "x-uji": "aset" } });
    },
  },
} as unknown as Parameters<typeof worker.fetch>[1];

const minta = (jalur: string, init?: RequestInit) => worker.fetch(new Request("http://127.0.0.1" + jalur, init), env);

function periksaTajukJson(jawaban: Response) {
  for (const [nama, nilai] of Object.entries(TAJUK_JSON)) expect(jawaban.headers.get(nama), nama).toBe(nilai);
}

describe("Worker kerangka", () => {
  it("GET /api/sehat menjawab 200 dengan versi protokol dan lingkungan (AC-3)", async () => {
    const jawaban = await minta("/api/sehat");
    expect(jawaban.status).toBe(200);
    periksaTajukJson(jawaban);
    expect(await jawaban.text()).toBe('{"ok":true,"protokol":1,"lingkungan":"lokal"}');
  });

  it.each(["POST", "PUT", "DELETE"])("%s /api/sehat menjawab 405 dengan Allow: GET (AC-4)", async (metode) => {
    const jawaban = await minta("/api/sehat", { method: metode });
    expect(jawaban.status).toBe(405);
    expect(jawaban.headers.get("allow")).toBe("GET");
    periksaTajukJson(jawaban);
    expect(await jawaban.json()).toEqual({ galat: { kode: "METODE_TIDAK_DIDUKUNG", pesan: "Metode ini tidak didukung." } });
  });

  it.each([
    ["/api/ruang", {}],
    ["/api/", {}],
    ["/api/sehat/lagi", {}],
    ["/ws/ruang/K7MPA", {}],
    ["/ws/ruang/K7MPA", { headers: { Upgrade: "websocket" } }],
  ] as const)("%s %j menjawab 404 BELUM_TERSEDIA (AC-4)", async (jalur, init) => {
    const jawaban = await minta(jalur, init as RequestInit);
    expect(jawaban.status).toBe(404);
    periksaTajukJson(jawaban);
    expect(await jawaban.json()).toEqual({ galat: { kode: "BELUM_TERSEDIA", pesan: "Fitur ini belum tersedia." } });
  });

  it("jalur lain diteruskan ke ASSETS dan jawabannya dikembalikan apa adanya", async () => {
    for (const jalur of ["/", "/admin/", "/tidak-ada"]) {
      diteruskan = [];
      const jawaban = await minta(jalur);
      expect(diteruskan).toHaveLength(1);
      expect(new URL(diteruskan[0].url).pathname).toBe(jalur);
      expect(jawaban.headers.get("x-uji")).toBe("aset");
      expect(await jawaban.text()).toBe("aset");
    }
  });

  it("PROTOKOL_VERSI bernilai 1 dan sama dengan protokol jawaban Worker", async () => {
    expect(PROTOKOL_VERSI).toBe(1);
    const isi = (await (await minta("/api/sehat")).json()) as { protokol: number };
    expect(isi.protokol).toBe(PROTOKOL_VERSI);
  });
});

describe("Teks dan halaman", () => {
  it("TEKS sama persis dengan tabel Teks yang tampil (final)", () => {
    expect(TEKS).toEqual({
      judulTabPemain: "Jejak Setara",
      judulTabKonsol: "Konsol admin · Jejak Setara",
      judul: "Jejak Setara",
      pemainIsi: "Permainan sedang disiapkan.",
      konsolJudul: "Konsol admin",
      konsolIsi: "Konsol sedang disiapkan.",
      serverMemeriksa: "Memeriksa server…",
      serverSiap: "Server siap",
      serverBelum: "Server belum tersambung",
      tandaSiap: "✓",
      tandaBelum: "!",
    });
  });

  it.each([
    ["web/jejak-setara/index.html", TEKS.judulTabPemain],
    ["web/jejak-setara/admin/index.html", TEKS.judulTabKonsol],
  ])("%s: lang id, judul tab, ikon kosong, dan skrip modul", (jalur, judul) => {
    const html = baca(jalur);
    expect(html).toContain('<html lang="id">');
    expect(html).toContain(`<title>${judul}</title>`);
    expect(html).toContain('<link rel="icon" href="data:," />');
    expect(html).toContain('<script type="module" src="./main.tsx"></script>');
  });
});

const TOKEN_DASAR: Record<string, string> = {
  ink: "#1F2A44", dusk: "#3A4A6B", mist: "#C9D4E5", cream: "#FFF6E0", white: "#FFFFFF", sun: "#FFD23F",
  mango: "#FF9F1C", coral: "#FF6B5B", leaf: "#8AD95B", teal: "#2EC4B6", "sky-d": "#3A86D9", malam: "#4A4F9C",
};
const TOKEN_PERAN: Record<string, string> = {
  surface: "var(--js-cream)", text: "var(--js-ink)", "text-2": "var(--js-dusk)", focus: "var(--js-sun)",
  "tier-tepat": "var(--js-leaf)", "tier-kurang": "var(--js-mango)", "tier-berisiko": "var(--js-coral)",
  marker: "var(--js-sun)", "marker-selesai": "var(--js-leaf)", diri: "var(--js-sun)", kompas: "var(--js-teal)",
  "status-draf": "var(--js-mist)", "status-tinjau": "var(--js-sun)", "status-terbit": "var(--js-leaf)",
  "status-perhatian": "var(--js-mango)",
};

/** Token di blok :root pertama sebuah berkas CSS, untuk awalan tertentu. */
function tokenRoot(css: string, awalan: string): Record<string, string> {
  const mulai = css.indexOf(":root {");
  const blok = css.slice(mulai, css.indexOf("}", mulai));
  const hasil: Record<string, string> = {};
  for (const cocok of blok.matchAll(new RegExp(`--${awalan}-([a-z0-9-]+):\\s*([^;]+);`, "g"))) hasil[cocok[1]] = cocok[2].trim();
  return hasil;
}

describe("Token dan tajuk", () => {
  it("jejak.css memuat semua token Design System bagian 4 dengan nilai persis", () => {
    expect(tokenRoot(baca("app/jejak-setara/styles/jejak.css"), "js")).toEqual({ ...TOKEN_DASAR, ...TOKEN_PERAN });
  });

  it("token dasar sama dengan token --ss- Sehari Setara (malam hanya ada di Jejak Setara)", () => {
    const ss = tokenRoot(baca("app/sehari-setara/styles/game.css"), "ss");
    for (const [nama, nilai] of Object.entries(TOKEN_DASAR)) {
      if (nama === "malam") continue;
      expect(ss[nama], nama).toBe(nilai);
    }
  });

  it("_headers memberi keempat tajuk untuk /* (AC-8)", () => {
    expect(baca("web/jejak-setara/public/_headers")).toBe(
      "/*\n" +
        "  Content-Security-Policy: default-src 'self'; connect-src 'self'; img-src 'self' data: blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'\n" +
        "  X-Content-Type-Options: nosniff\n" +
        "  Referrer-Policy: same-origin\n" +
        "  Permissions-Policy: camera=(), microphone=(), geolocation=()\n",
    );
  });

  it("wrangler.jsonc persis spesifikasi", () => {
    expect(JSON.parse(baca("server/jejak-setara/wrangler.jsonc"))).toEqual({
      $schema: "../../node_modules/wrangler/config-schema.json",
      name: "jejak-setara-lokal",
      main: "src/index.ts",
      compatibility_date: "2026-05-15",
      assets: { binding: "ASSETS", run_worker_first: ["/api/*", "/ws/*"] },
      vars: { LINGKUNGAN: "lokal" },
    });
  });
});

describe("Skrip", () => {
  const B = "node scripts/jejak-setara/bila-ada.mjs";
  it("package.json memuat kesepuluh skrip Jejak Setara persis (AC-1)", () => {
    const { scripts } = JSON.parse(baca("package.json")) as { scripts: Record<string, string> };
    expect(scripts).toMatchObject({
      "dev:jejak": "vite --config vite.jejak.config.ts",
      "build:jejak": "vite build --config vite.jejak.config.ts",
      "test:jejak": "vitest run --config vitest.jejak.config.ts",
      "content:check:jejak": `${B} app/jejak-setara/__tests__/konten "dibuat di JS-05 dan JS-06" -- vitest run --config vitest.jejak.config.ts app/jejak-setara/__tests__/konten/`,
      "test:jejak:server": `${B} - "dibuat di JS-03"`,
      "test:e2e:jejak": "playwright test --config playwright.jejak.config.ts",
      "sim:beban": `${B} - "dibuat di JS-03"`,
      "db:migrasi:lokal": `${B} - "dibuat di JS-03"`,
      "peta:build": `${B} scripts/jejak-setara/peta/build_peta.py "dibuat di JS-06" -- python scripts/jejak-setara/peta/build_peta.py`,
      "assets:build:jejak": `${B} scripts/game/art/build_jejak.py "dibuat Sesi C bersama aset tampak atas" -- python scripts/game/art/build_jejak.py`,
    });
    expect(Object.keys(scripts).filter((nama) => /jejak|sim:beban|db:migrasi|peta:build/.test(nama))).toHaveLength(10);
  });

  describe("bila-ada.mjs (proses anak di folder sementara)", () => {
    const penjalan = fileURLToPath(new URL("scripts/jejak-setara/bila-ada.mjs", AKAR));
    const folder = mkdtempSync(join(tmpdir(), "bila-ada-"));
    mkdirSync(join(folder, "ada"));
    writeFileSync(join(folder, "keluar0.mjs"), "process.exit(0);\n");
    writeFileSync(join(folder, "keluar3.mjs"), "process.exit(3);\n");
    const jalankan = (...argumen: string[]) => spawnSync(process.execPath, [penjalan, ...argumen], { cwd: folder, encoding: "utf8" });

    it("jalur - mencetak Belum tersedia dan selesai dengan kode 0", () => {
      const hasil = jalankan("-", "dibuat di JS-03");
      expect(hasil.stdout).toBe("Belum tersedia (dibuat di JS-03).\n");
      expect(hasil.status).toBe(0);
    });

    it("jalur yang belum ada mencetak Belum tersedia dan selesai dengan kode 0", () => {
      const hasil = jalankan("tidak/ada.py", "dibuat di JS-06", "--", "python", "tidak/ada.py");
      expect(hasil.stdout).toBe("Belum tersedia: tidak/ada.py belum ada (dibuat di JS-06).\n");
      expect(hasil.status).toBe(0);
    });

    it.each([
      ["keluar0.mjs", 0],
      ["keluar3.mjs", 3],
    ])("jalur yang ada menjalankan perintah dan meneruskan kodenya (%s)", (berkas, kode) => {
      const hasil = jalankan("ada", "dibuat di JS-05", "--", "node", berkas);
      expect(hasil.status).toBe(kode);
    });
  });
});
