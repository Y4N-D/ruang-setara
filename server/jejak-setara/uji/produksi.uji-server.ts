// Kueri ruang produksi di D1 lokal yang sungguhan (spesifikasi JS-16a, P-4 dan P-5; AC-7). Memakai folder keadaan D1
// tersendiri, terpisah dari server uji di port 4320, agar ruang uji lain tidak ikut terhitung.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { SQL_ADA_TABEL_RUANG, SQL_RUANG_AKTIF, bacaJumlah } from "../../../scripts/jejak-setara/produksi.mjs";
import { argumenStatusWrangler } from "../../../scripts/jejak-setara/semai.mjs";

const akar = fileURLToPath(new URL("../../../", import.meta.url));
const keadaan = mkdtempSync(join(tmpdir(), "jejak-d1-produksi-"));
const bendera = ["--local", "--persist-to", keadaan];
const wrangler = (argumen: string[]) =>
  spawnSync(process.execPath, [join(akar, "node_modules/wrangler/bin/wrangler.js"), ...argumen], {
    cwd: akar,
    encoding: "utf8",
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
  });
const kueri = (sql: string) => {
  const hasil = wrangler(argumenStatusWrangler(sql, bendera));
  expect(hasil.status, hasil.stderr).toBe(0);
  return hasil.stdout;
};

afterAll(() => rmSync(keadaan, { recursive: true, force: true }));

describe("JS-16a: kueri ruang produksi di D1 lokal (AC-7)", () => {
  it("sebelum migrasi tabel ruang belum ada: SQL_ADA_TABEL_RUANG memberi 0", () => {
    expect(bacaJumlah(kueri(SQL_ADA_TABEL_RUANG))).toBe(0);
  });

  it("sesudah migrasi: tabel ada, dan SQL_RUANG_AKTIF menghitung semua status kecuali ditutup", () => {
    const migrasi = wrangler(["d1", "migrations", "apply", "jejak-setara-lokal", ...bendera, "--config", "server/jejak-setara/wrangler.jsonc"]);
    expect(migrasi.status, migrasi.stderr).toBe(0);
    expect(bacaJumlah(kueri(SQL_ADA_TABEL_RUANG))).toBe(1);
    expect(bacaJumlah(kueri(SQL_RUANG_AKTIF))).toBe(0);
    const status = ["lobi", "hitung_mundur", "main", "jeda", "selesai", "pembahasan", "ditutup", "ditutup"];
    const sisip = status
      .map((s, i) => `INSERT INTO ruang (id, kode, label_kelas, pengaturan_json, benih, status, do_id, dibuat_pada) VALUES ('r${i}', 'KODE${i}', 'IX B', '{}', ${i}, '${s}', 'do${i}', ${1_790_000_000_000 + i})`)
      .join("; ");
    kueri(sisip);
    expect(bacaJumlah(kueri(SQL_RUANG_AKTIF))).toBe(6);
  });
});
