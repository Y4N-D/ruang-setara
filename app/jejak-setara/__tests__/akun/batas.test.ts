// Pembatas percobaan masuk (spesifikasi JS-04, P-12 dan P-13; AC-5). SQL hitungan dijalankan di SQLite bawaan Node
// (node:sqlite) dengan tabel dari migrasi D1, seperti uji semai JS-05.
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  BATAS_ALAMAT,
  BATAS_EMAIL,
  kunciAlamat,
  kunciEmail,
  KUNCI_MS,
  parameterGagal,
  sedangTerkunci,
  SQL_TAMBAH_GAGAL,
  type AturanBatas,
  type BarisBatas,
} from "../../../../server/jejak-setara/src/auth/batas";

const KUNCI_IP = "kunci-ip-uji";
const MENIT = 60_000;
const hmacHex = (teks: string) => createHmac("sha256", KUNCI_IP).update(teks).digest("hex").slice(0, 32);

describe("kunci pembatas (P-12)", () => {
  it("kunci email: e: + 32 karakter HMAC heksadesimal atas email, tanpa email itu sendiri", async () => {
    const k = await kunciEmail("guru@sekolah.sch.id", KUNCI_IP);
    expect(k).toBe("e:" + hmacHex("guru@sekolah.sch.id"));
    expect(k).toMatch(/^e:[0-9a-f]{32}$/);
    expect(k).not.toContain("guru");
    expect(await kunciEmail("guru2@sekolah.sch.id", KUNCI_IP)).not.toBe(k);
    expect(await kunciEmail("guru@sekolah.sch.id", "kunci-lain")).not.toBe(k);
  });

  it("kunci alamat: i: + HMAC atas alamat|YYYY-MM-DD (UTC), berganti setiap hari, tanpa alamat itu sendiri", async () => {
    const malam = Date.UTC(2026, 10, 14, 23, 59, 59, 999);
    const k = await kunciAlamat("203.0.113.7", malam, KUNCI_IP);
    expect(k).toBe("i:" + hmacHex("203.0.113.7|2026-11-14"));
    expect(k).not.toContain("203");
    expect(await kunciAlamat("203.0.113.7", malam + 1, KUNCI_IP)).toBe("i:" + hmacHex("203.0.113.7|2026-11-15"));
    expect(await kunciAlamat("203.0.113.8", malam, KUNCI_IP)).not.toBe(k);
  });
});

describe("angka P-13", () => {
  it("5 per 15 menit (email), 20 per 24 jam (alamat), kunci 15 menit", () => {
    expect(BATAS_EMAIL).toEqual({ jendelaMs: 15 * MENIT, batas: 5 });
    expect(BATAS_ALAMAT).toEqual({ jendelaMs: 24 * 60 * MENIT, batas: 20 });
    expect(KUNCI_MS).toBe(15 * MENIT);
  });

  it("sedangTerkunci: berakhir tepat pada terkunci_sampai", () => {
    expect(sedangTerkunci(null, 0)).toBe(false);
    expect(sedangTerkunci({ terkunci_sampai: null }, 0)).toBe(false);
    expect(sedangTerkunci({ terkunci_sampai: 1_000 }, 999)).toBe(true);
    expect(sedangTerkunci({ terkunci_sampai: 1_000 }, 1_000)).toBe(false);
  });
});

type ModulSqlite = typeof import("node:sqlite");
const sqlite = process.getBuiltinModule("node:sqlite") as ModulSqlite | undefined;

function basisBaru() {
  const db = new (sqlite as ModulSqlite).DatabaseSync(":memory:");
  db.exec(readFileSync("server/jejak-setara/migrations/0001_awal.sql", "utf8"));
  const gagal = (kunci: string, sekarang: number, aturan: AturanBatas) => db.prepare(SQL_TAMBAH_GAGAL).run(...parameterGagal(kunci, sekarang, aturan));
  const baris = (kunci: string) => (db.prepare("SELECT kunci, jumlah, jendela_mulai, terkunci_sampai FROM batas_masuk WHERE kunci = ?").get(kunci) ?? null) as BarisBatas | null;
  return { gagal, baris };
}

if (!sqlite) it.skip("Dilewati: node:sqlite tidak tersedia (perlu Node 22.13 atau lebih baru).", () => {});

describe.skipIf(!sqlite)("hitungan gagal di SQLite (SQL_TAMBAH_GAGAL)", () => {
  const t0 = Date.UTC(2026, 10, 14, 1, 0, 0);

  it("email: kegagalan kelima mengunci 15 menit; percobaan keenam terkunci", () => {
    const { gagal, baris } = basisBaru();
    for (let i = 0; i < 4; i++) {
      gagal("e:1", t0 + i * MENIT, BATAS_EMAIL);
      expect(sedangTerkunci(baris("e:1"), t0 + i * MENIT)).toBe(false);
    }
    expect(baris("e:1")).toEqual({ kunci: "e:1", jumlah: 4, jendela_mulai: t0, terkunci_sampai: null });
    gagal("e:1", t0 + 4 * MENIT, BATAS_EMAIL);
    expect(baris("e:1")).toEqual({ kunci: "e:1", jumlah: 5, jendela_mulai: t0, terkunci_sampai: t0 + 19 * MENIT });
    expect(sedangTerkunci(baris("e:1"), t0 + 5 * MENIT)).toBe(true);
    expect(sedangTerkunci(baris("e:1"), t0 + 19 * MENIT - 1)).toBe(true);
    // Pulih sesudah 15 menit; jendela juga sudah lewat, sehingga hitungan mulai lagi dari 1.
    expect(sedangTerkunci(baris("e:1"), t0 + 19 * MENIT)).toBe(false);
    gagal("e:1", t0 + 19 * MENIT, BATAS_EMAIL);
    expect(baris("e:1")).toEqual({ kunci: "e:1", jumlah: 1, jendela_mulai: t0 + 19 * MENIT, terkunci_sampai: null });
  });

  it("email: jendela 15 menit yang lewat memulai hitungan lagi dari 1", () => {
    const { gagal, baris } = basisBaru();
    for (let i = 0; i < 4; i++) gagal("e:2", t0 + i * MENIT, BATAS_EMAIL);
    gagal("e:2", t0 + 15 * MENIT, BATAS_EMAIL); // tepat 15 menit: masih jendela yang sama
    expect(baris("e:2")).toMatchObject({ jumlah: 5, jendela_mulai: t0, terkunci_sampai: t0 + 30 * MENIT });
    const { gagal: gagal2, baris: baris2 } = basisBaru();
    for (let i = 0; i < 4; i++) gagal2("e:3", t0 + i * MENIT, BATAS_EMAIL);
    gagal2("e:3", t0 + 15 * MENIT + 1, BATAS_EMAIL);
    expect(baris2("e:3")).toEqual({ kunci: "e:3", jumlah: 1, jendela_mulai: t0 + 15 * MENIT + 1, terkunci_sampai: null });
  });

  it("alamat: kegagalan ke-20 mengunci; sesudah kunci berakhir, kegagalan berikutnya di hari yang sama mengunci lagi", () => {
    const { gagal, baris } = basisBaru();
    for (let i = 0; i < 19; i++) gagal("i:1", t0 + i * MENIT, BATAS_ALAMAT);
    expect(baris("i:1")).toMatchObject({ jumlah: 19, terkunci_sampai: null });
    gagal("i:1", t0 + 19 * MENIT, BATAS_ALAMAT);
    expect(baris("i:1")).toMatchObject({ jumlah: 20, terkunci_sampai: t0 + 34 * MENIT });
    expect(sedangTerkunci(baris("i:1"), t0 + 34 * MENIT)).toBe(false);
    gagal("i:1", t0 + 40 * MENIT, BATAS_ALAMAT);
    expect(baris("i:1")).toMatchObject({ jumlah: 21, jendela_mulai: t0, terkunci_sampai: t0 + 55 * MENIT });
    // Sesudah 24 jam: jendela baru.
    gagal("i:1", t0 + 24 * 60 * MENIT + 1, BATAS_ALAMAT);
    expect(baris("i:1")).toMatchObject({ jumlah: 1, jendela_mulai: t0 + 24 * 60 * MENIT + 1, terkunci_sampai: null });
  });

  it("kunci yang masih berjalan dipertahankan oleh kegagalan lain di jendela yang sama", () => {
    const { gagal, baris } = basisBaru();
    for (let i = 0; i < 20; i++) gagal("i:2", t0, BATAS_ALAMAT);
    expect(baris("i:2")).toMatchObject({ jumlah: 20, terkunci_sampai: t0 + 15 * MENIT });
    gagal("i:2", t0 + MENIT, BATAS_ALAMAT);
    expect(baris("i:2")).toMatchObject({ jumlah: 21, terkunci_sampai: t0 + 16 * MENIT });
  });

  it("kunci email dan alamat tidak saling memengaruhi", () => {
    const { gagal, baris } = basisBaru();
    for (let i = 0; i < 5; i++) gagal("e:a", t0, BATAS_EMAIL);
    gagal("e:b", t0, BATAS_EMAIL);
    expect(sedangTerkunci(baris("e:a"), t0)).toBe(true);
    expect(sedangTerkunci(baris("e:b"), t0)).toBe(false);
  });
});
