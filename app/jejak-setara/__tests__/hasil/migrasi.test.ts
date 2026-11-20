// Migrasi 0002 (spesifikasi JS-11, P-10; AC-8): kolom `peserta.dikeluarkan` berlaku di atas 0001, baris peserta yang
// sudah ada bernilai 0, dan nilai selain 0 dan 1 ditolak. SQLite bawaan Node, seperti D1 tiruan uji akun.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sqlite } from "../akun/d1Tiruan";

const MIGRASI = new URL("../../../../server/jejak-setara/migrations/", import.meta.url);
const sql = (nama: string) => readFileSync(new URL(nama, MIGRASI), "utf8");

describe.skipIf(!sqlite)("migrasi 0002_peserta_dikeluarkan (P-10)", () => {
  it("berlaku di atas 0001; baris peserta lama bernilai 0; nilai selain 0 dan 1 ditolak", () => {
    const db = new sqlite!.DatabaseSync(":memory:");
    db.exec("PRAGMA foreign_keys = ON");
    db.exec(sql("0001_awal.sql"));
    db.exec("INSERT INTO ruang (id, kode, label_kelas, pengaturan_json, benih, status, do_id, dibuat_pada) VALUES ('r-1', 'ABCDE', 'IX B', '{}', 1, 'ditutup', 'do-1', 1)");
    db.exec("INSERT INTO peserta (id, ruang_id, nama_samaran, avatar, warna_tas, gabung_pada) VALUES ('p-lama', 'r-1', 'Rusa Gesit', 1, 'merah', 2)");
    db.exec(sql("0002_peserta_dikeluarkan.sql"));
    expect(db.prepare("SELECT dikeluarkan FROM peserta WHERE id = 'p-lama'").get()).toEqual({ dikeluarkan: 0 });
    db.exec("INSERT INTO peserta (id, ruang_id, nama_samaran, avatar, warna_tas, gabung_pada, dikeluarkan) VALUES ('p-baru', 'r-1', 'Anoa Hijau', 2, 'biru', 3, 1)");
    expect(db.prepare("SELECT dikeluarkan FROM peserta WHERE id = 'p-baru'").get()).toEqual({ dikeluarkan: 1 });
    expect(() => db.exec("UPDATE peserta SET dikeluarkan = 2 WHERE id = 'p-lama'")).toThrow(/CHECK/);
    db.close();
  });

  it("migrasi hanya maju: berkas 0001 tetap ada dan 0002 hanya menambah satu kolom", () => {
    expect(sql("0001_awal.sql")).toContain("CREATE TABLE peserta");
    expect(sql("0002_peserta_dikeluarkan.sql").trim().split("\n").filter((b) => b.trim() && !b.trim().startsWith("--"))).toEqual([
      "ALTER TABLE peserta ADD COLUMN dikeluarkan INTEGER NOT NULL DEFAULT 0 CHECK (dikeluarkan IN (0, 1));",
    ]);
  });
});
