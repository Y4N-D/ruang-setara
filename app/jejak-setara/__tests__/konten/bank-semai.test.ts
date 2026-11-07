// Uji semai bank awal (spesifikasi JS-05 Revisi 1, P-26 sampai P-36, P-39, dan P-40; AC-9 sampai AC-14 dan
// AC-19). SQL dijalankan di SQLite bawaan Node (node:sqlite) dengan tabel dari migrasi D1 di
// server/jejak-setara/migrations/. Perintah semai diuji pada salinan sementara, sehingga wrangler tidak pernah
// dijalankan.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  adaD1,
  argumenWrangler,
  bacaBank,
  buangKomentar,
  CATATAN_VERSI,
  DASAR_ID,
  idKejadian,
  idPaket,
  idVersiPertama,
  kutip,
  PENANDA,
  PESAN_BELUM,
  sqlSemai,
  teksSql,
  uuid5,
} from "../../../../scripts/jejak-setara/semai.mjs";
import type { BankAwal } from "../../inti/konten/skema";
import { AKAR, bacaBankAwal, bacaRepo, jalurRepo } from "./naskah-urai";

const { teks: teksBank, bank } = bacaBankAwal();
const pernyataan: string[] = sqlSemai(bank);
const sql: string = teksSql(bank);
const BELUM = "NOT EXISTS (SELECT 1 FROM pengaturan WHERE kunci = 'semai_bank_awal')";
const WAKTU = "CAST(strftime('%s', 'now') AS INTEGER) * 1000";
const POLA_UUID5 = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("SQL semai (P-27 sampai P-32, AC-9)", () => {
  it("selalu sama untuk bank yang sama, dengan satu baris keterangan dan 73 pernyataan", () => {
    expect(teksSql(JSON.parse(teksBank) as BankAwal)).toBe(sql);
    expect(pernyataan).toHaveLength(73);
    expect(sql).toBe(
      [
        "-- Semai bank awal Jejak Setara (JS-05), dibuat oleh scripts/jejak-setara/semai.mjs dari server/jejak-setara/seed/bank-awal.json.",
        ...pernyataan,
        "",
      ].join("\n"),
    );
  });

  it("urutan: 23 rujukan, kejadian dan versi bergantian, paket, 16 isi paket, lalu penanda", () => {
    const awal = pernyataan.map((s) => /^INSERT INTO (\w+) /.exec(s)?.[1]);
    expect(awal).toEqual([
      ...Array<string>(23).fill("rujukan"),
      ...Array.from({ length: 16 }, () => ["kejadian", "kejadian_versi"]).flat(),
      "paket",
      ...Array<string>(16).fill("paket_kejadian"),
      "pengaturan",
    ]);
  });

  it("tanpa BEGIN, COMMIT, atau kata terverifikasi; setiap pernyataan ≤ 100.000 byte", () => {
    expect(/\b(BEGIN|COMMIT)\b/i.test(sql)).toBe(false);
    expect(sql.toLowerCase()).not.toContain("terverifikasi");
    for (const s of pernyataan) expect(Buffer.byteLength(s)).toBeLessThanOrEqual(100_000);
  });

  it("setiap pernyataan kecuali penanda hanya berlaku sebelum penanda ada; penanda memakai VALUES", () => {
    for (const s of pernyataan.slice(0, -1)) {
      expect(s).toContain(BELUM);
      expect(s).toContain(" SELECT ");
      expect(s).toContain(" WHERE ");
    }
    expect(pernyataan[72]).toBe(
      `INSERT INTO pengaturan (kunci, nilai_json) VALUES ('semai_bank_awal', '{"versi":1,"rujukan":23,"kejadian":16,"paket":1}') ON CONFLICT (kunci) DO NOTHING;`,
    );
  });

  it("status rujukan selalu 'belum' dan status kejadian 'tinjau', tidak diambil dari bank (P-30)", () => {
    bank.rujukan.forEach((r, i) => {
      expect(pernyataan[i]).toBe(
        `INSERT INTO rujukan (id, teks, sumber, status, catatan, kode_sehari) SELECT ${kutip(r.id)}, ${kutip(r.teks)}, ${kutip(r.sumber)}, 'belum', ${kutip(r.catatan)}, ${kutip(r.kodeSehari)} WHERE ${BELUM} ON CONFLICT (id) DO NOTHING;`,
      );
    });
    expect(pernyataan[23]).toBe(
      `INSERT INTO kejadian (id, kode, status, versi_terbit_id, pemilik_id, diubah_pada) SELECT '${idKejadian("K-01")}', 'K-01', 'tinjau', NULL, NULL, ${WAKTU} WHERE ${BELUM} ON CONFLICT DO NOTHING;`,
    );
  });

  it("versi kerja, paket, dan isi paket memakai id tetap (P-30, P-40)", () => {
    const k = bank.kejadian[0];
    expect(pernyataan[24]).toBe(
      `INSERT INTO kejadian_versi (id, kejadian_id, nomor, isi_json, jenis, dibuat_oleh, dibuat_pada, catatan_perubahan) SELECT '${idVersiPertama("K-01")}', k.id, 1, ${kutip(JSON.stringify(k))}, 'kerja', NULL, ${WAKTU}, 'Bank awal dari repositori (JS-05)' FROM kejadian k WHERE k.kode = 'K-01' AND ${BELUM} AND NOT EXISTS (SELECT 1 FROM kejadian_versi v WHERE v.kejadian_id = k.id) ON CONFLICT DO NOTHING;`,
    );
    expect(pernyataan[55]).toBe(
      `INSERT INTO paket (id, nama, deskripsi, aktif) SELECT '${idPaket("Paket inti 16")}', 'Paket inti 16', 'Enam belas kejadian bank awal, dua di setiap zona.', 1 WHERE ${BELUM} ON CONFLICT DO NOTHING;`,
    );
    expect(pernyataan[56]).toBe(
      `INSERT INTO paket_kejadian (paket_id, kejadian_id, urutan) SELECT p.id, k.id, 1 FROM paket p, kejadian k WHERE p.id = '${idPaket("Paket inti 16")}' AND k.kode = 'K-01' AND ${BELUM} ON CONFLICT DO NOTHING;`,
    );
  });
});

describe("id bank awal (P-40, AC-19)", () => {
  it("uuid5 sama dengan contoh dokumentasi Python: python.org di ruang nama DNS", () => {
    expect(uuid5("6ba7b810-9dad-11d1-80b4-00c04fd430c8", "python.org")).toBe("886313e1-3b8a-5372-9b90-0c9aee199e5d");
    expect(() => uuid5("bukan-uuid", "x")).toThrow(RangeError);
  });

  it("UUID dasar tetap dan id K-01 serta Paket inti 16 sesuai spesifikasi", () => {
    expect(DASAR_ID).toBe("93b81e4c-d848-4d2b-9c6a-230da39a8daf");
    expect(idKejadian("K-01")).toBe("ad912a81-53aa-5152-a119-544836b2500d");
    expect(idVersiPertama("K-01")).toBe("94f9dcaa-44db-571c-a99c-032ee0af3500");
    expect(idPaket("Paket inti 16")).toBe("9880c4d5-8294-51c9-971a-e95531a2e039");
  });

  it("33 id bank awal berbentuk UUID versi 5, berbeda satu sama lain, dan sama bila dihitung ulang", () => {
    const daftar = [...bank.kejadian.flatMap((k) => [idKejadian(k.kode), idVersiPertama(k.kode)]), ...bank.paket.map((p) => idPaket(p.nama))];
    expect(daftar).toHaveLength(33);
    expect(new Set(daftar).size).toBe(33);
    for (const id of daftar) expect(id).toMatch(POLA_UUID5);
    expect(sqlSemai(bank)).toEqual(pernyataan);
  });
});

describe("kutip dan bacaBank (P-31, P-33)", () => {
  it("kutip menggandakan tanda kutip tunggal, null menjadi NULL, NUL dan bukan teks ditolak", () => {
    expect(kutip(null)).toBe("NULL");
    expect(kutip("it's")).toBe("'it''s'");
    expect(kutip("")).toBe("''");
    expect(() => kutip("a\u0000b")).toThrow(RangeError);
    expect(() => kutip(5)).toThrow(TypeError);
  });

  it("bacaBank menerima bank awal", () => {
    expect(bacaBank(teksBank)).toEqual(bank);
  });

  const rujukanSah = { id: "JR-01", teks: "a", sumber: "b", kodeSehari: null, catatan: "c" };
  const kerangka = (ubah: Record<string, unknown>) => JSON.stringify({ versi: 1, rujukan: [rujukanSah], kejadian: [{ kode: "K-01" }], paket: [{ nama: "p", deskripsi: "d", kejadian: [] }], ...ubah });
  it.each([
    ["{", "berkas bukan JSON yang sah"],
    ['{"versi":2}', "versi bank harus 1"],
    ['{"versi":1}', "daftar rujukan kosong atau tidak ada"],
    [kerangka({ kejadian: [] }), "daftar kejadian kosong atau tidak ada"],
    [kerangka({ rujukan: [{ ...rujukanSah, status: "belum" }] }), "rujukan JR-01 punya kolom status"],
    [kerangka({ rujukan: [{ ...rujukanSah, catatan: 3 }] }), "rujukan JR-01 tidak lengkap"],
    [kerangka({ rujukan: [7] }), "rujukan ? tidak lengkap"],
    [kerangka({ kejadian: [{ judul: "x" }] }), "ada kejadian tanpa kode"],
    [kerangka({ paket: [{ nama: "p", deskripsi: "d", kejadian: [1] }] }), "paket p tidak lengkap"],
  ])("bacaBank menolak: %s", (isi, alasan) => {
    expect(() => bacaBank(isi)).toThrow(alasan);
  });
});

describe("adaD1, buangKomentar, dan argumenWrangler (P-33)", () => {
  it.each([
    ['{ // "d1_databases": []\n "name": "x" }', false],
    ['{ /* "d1_databases": [] */ "name": "x" }', false],
    ['{ "vars": {} // "d1_databases" menyusul di JS-03\n}', false],
    ['{ "nama": "teks berisi \\"d1_databases\\": palsu" }', false],
    ['{ "$schema": "https://contoh/skema.json", "d1_databases": [] }', true],
    ['{ "d1_databases": [] }', true],
    ['{\n  "env": { "uji": { "d1_databases": [{ "binding": "DB" }] } } // D1 per lingkungan\n}', true],
    [
      '{\n  "$schema": "../../node_modules/wrangler/config-schema.json",\n  "name": "jejak-setara-lokal",\n  "main": "src/index.ts",\n  "compatibility_date": "2026-05-15",\n  "assets": { "binding": "ASSETS", "run_worker_first": ["/api/*", "/ws/*"] },\n  "vars": { "LINGKUNGAN": "lokal" }\n}\n',
      false,
    ],
  ])("adaD1(%j) = %s", (isi, harap) => {
    expect(adaD1(isi)).toBe(harap);
  });

  it("buangKomentar membiarkan teks berkutip utuh", () => {
    expect(buangKomentar('{ "a": "https://x.id/b", /* c */ "d": 1 } // e')).toBe('{ "a": "https://x.id/b",  "d": 1 } ');
  });

  it("argumen wrangler: --local bila tidak ada --local atau --remote; bendera lain diteruskan apa adanya", () => {
    const dasar = ["d1", "execute", "DB", "--config", "server/jejak-setara/wrangler.jsonc", "--file", "/tmp/s.sql", "--yes"];
    expect(argumenWrangler("/tmp/s.sql", [])).toEqual([...dasar, "--local"]);
    expect(argumenWrangler("/tmp/s.sql", ["--remote", "--env", "uji"])).toEqual([...dasar, "--remote", "--env", "uji"]);
    expect(argumenWrangler("/tmp/s.sql", ["--local", "--persist-to", ".wrangler/state"])).toEqual([...dasar, "--local", "--persist-to", ".wrangler/state"]);
  });
});

// ---------------------------------------------------------------------------------------------
// Skenario SQL di SQLite (P-28 sampai P-31, P-39)

type ModulSqlite = typeof import("node:sqlite");
type Basis = InstanceType<ModulSqlite["DatabaseSync"]>;
const sqlite = process.getBuiltinModule("node:sqlite") as ModulSqlite | undefined;
const FOLDER_MIGRASI = "server/jejak-setara/migrations";
const migrasi = existsSync(jalurRepo(FOLDER_MIGRASI)) ? readdirSync(jalurRepo(FOLDER_MIGRASI)).filter((n) => n.endsWith(".sql")).sort() : [];
const sqlTabel = migrasi.map((n) => bacaRepo(`${FOLDER_MIGRASI}/${n}`)).join("\n");
const PENINJAU = "00000000-0000-4000-8000-000000000001";

function basisBaru(): Basis {
  const { DatabaseSync } = sqlite as ModulSqlite;
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(sqlTabel);
  return db;
}
const baris = (db: Basis, kueri: string) => db.prepare(kueri).all() as Record<string, unknown>[];
const jumlah = (db: Basis) =>
  Object.fromEntries(["rujukan", "kejadian", "kejadian_versi", "paket", "paket_kejadian", "pengaturan"].map((t) => [t, baris(db, `SELECT count(*) AS n FROM ${t}`)[0].n]));
/** Isi tabel semai tanpa kolom waktu, untuk membandingkan dua basis data. */
const isi = (db: Basis) => ({
  rujukan: baris(db, "SELECT id, teks, sumber, status, catatan, kode_sehari FROM rujukan ORDER BY id"),
  kejadian: baris(db, "SELECT id, kode, status, versi_terbit_id, pemilik_id FROM kejadian ORDER BY kode"),
  versi: baris(
    db,
    "SELECT v.id, k.kode, v.nomor, v.isi_json, v.jenis, v.dibuat_oleh, v.catatan_perubahan FROM kejadian_versi v JOIN kejadian k ON k.id = v.kejadian_id ORDER BY k.kode, v.nomor",
  ),
  paket: baris(db, "SELECT id, nama, deskripsi, aktif FROM paket ORDER BY nama"),
  isiPaket: baris(db, "SELECT p.nama, k.kode, pk.urutan FROM paket_kejadian pk JOIN paket p ON p.id = pk.paket_id JOIN kejadian k ON k.id = pk.kejadian_id ORDER BY p.nama, pk.urutan"),
  pengaturan: baris(db, "SELECT kunci, nilai_json FROM pengaturan ORDER BY kunci"),
});
/** Seluruh isi tabel semai, termasuk waktu, diurutkan agar tidak bergantung pada urutan baris. */
const potret = (db: Basis) =>
  ["rujukan", "kejadian", "kejadian_versi", "paket", "paket_kejadian", "pengaturan"].map((t) =>
    baris(db, `SELECT * FROM ${t}`)
      .map((r) => JSON.stringify(r))
      .sort(),
  );

if (!sqlite) it.skip("Dilewati: node:sqlite tidak tersedia (perlu Node 22.13 atau lebih baru).", () => {});
if (migrasi.length === 0) it.skip(`Belum tersedia: ${FOLDER_MIGRASI}/ belum berisi migrasi (dibuat di JS-03).`, () => {});

describe.skipIf(!sqlite || migrasi.length === 0)(`semai di SQLite, tabel dari migrasi (${migrasi.join(", ")})`, () => {
  it("semai pertama menulis 23 rujukan belum, 16 kejadian tinjau, 16 versi kerja, paket aktif, dan penanda (AC-10)", () => {
    const db = basisBaru();
    const mulai = Date.now();
    db.exec(sql);
    expect(jumlah(db)).toEqual({ rujukan: 23, kejadian: 16, kejadian_versi: 16, paket: 1, paket_kejadian: 16, pengaturan: 1 });
    const hasil = isi(db);
    expect(hasil.rujukan).toEqual(
      bank.rujukan.map((r) => ({ id: r.id, teks: r.teks, sumber: r.sumber, status: "belum", catatan: r.catatan, kode_sehari: r.kodeSehari })),
    );
    expect(hasil.kejadian).toEqual(
      bank.kejadian.map((k) => ({ id: idKejadian(k.kode), kode: k.kode, status: "tinjau", versi_terbit_id: null, pemilik_id: null })),
    );
    expect(hasil.versi).toEqual(
      bank.kejadian.map((k) => ({
        id: idVersiPertama(k.kode),
        kode: k.kode,
        nomor: 1,
        isi_json: JSON.stringify(k),
        jenis: "kerja",
        dibuat_oleh: null,
        catatan_perubahan: CATATAN_VERSI,
      })),
    );
    expect(baris(db, "SELECT count(*) AS n FROM kejadian_versi v JOIN kejadian k ON k.id = v.kejadian_id")[0].n).toBe(16);
    expect(CATATAN_VERSI).toBe("Bank awal dari repositori (JS-05)");
    expect(hasil.paket).toEqual([{ id: idPaket("Paket inti 16"), nama: "Paket inti 16", deskripsi: "Enam belas kejadian bank awal, dua di setiap zona.", aktif: 1 }]);
    expect(hasil.isiPaket).toEqual(bank.paket[0].kejadian.map((kode, i) => ({ nama: "Paket inti 16", kode, urutan: i + 1 })));
    expect(hasil.pengaturan).toEqual([{ kunci: PENANDA, nilai_json: '{"versi":1,"rujukan":23,"kejadian":16,"paket":1}' }]);
    for (const r of baris(db, "SELECT diubah_pada AS w FROM kejadian UNION ALL SELECT dibuat_pada FROM kejadian_versi")) {
      expect(Math.abs(Number(r.w) - mulai)).toBeLessThan(5000);
      expect(Number(r.w) % 1000).toBe(0);
    }
  });

  it("semai ulang sesudah kerja di konsol tidak mengubah satu baris pun (AC-11)", () => {
    const db = basisBaru();
    db.exec(sql);
    // Akun peninjau uji, karena rujukan.diverifikasi_oleh merujuk tabel pengguna (0001_awal.sql).
    db.exec(`INSERT INTO pengguna (id, email, nama_tampilan, peran, peninjau, hash_sandi, garam, iterasi, dibuat_pada)
VALUES ('${PENINJAU}', 'peninjau@contoh.id', 'Peninjau uji', 'guru', 1, 'uji', 'uji', 1, 1);
UPDATE rujukan SET status = 'terverifikasi', diverifikasi_oleh = '${PENINJAU}', diverifikasi_pada = 1 WHERE id = 'JR-04';
UPDATE rujukan SET teks = 'Teks disunting' WHERE id = 'JR-02';
UPDATE kejadian_versi SET isi_json = json_set(isi_json, '$.judul', 'Judul disunting') WHERE kejadian_id = (SELECT id FROM kejadian WHERE kode = 'K-01');
UPDATE paket SET aktif = 0;
DELETE FROM paket_kejadian WHERE kejadian_id = (SELECT id FROM kejadian WHERE kode = 'K-05');
DELETE FROM kejadian_versi WHERE kejadian_id = (SELECT id FROM kejadian WHERE kode = 'K-05');
DELETE FROM kejadian WHERE kode = 'K-05';
DELETE FROM rujukan WHERE id = 'JR-23';`);
    const sebelum = potret(db);
    db.exec(sql);
    expect(potret(db)).toEqual(sebelum);
    expect(baris(db, "SELECT status FROM rujukan WHERE id = 'JR-04'")).toEqual([{ status: "terverifikasi" }]);
  });

  it.each([1, 23, 24, 36, 72])("semai yang berhenti sesudah %i pernyataan lalu diulang menjadi lengkap (AC-12)", (n) => {
    const lengkap = basisBaru();
    lengkap.exec(sql);
    const db = basisBaru();
    db.exec(pernyataan.slice(0, n).join("\n"));
    db.exec(sql);
    expect(isi(db)).toEqual(isi(lengkap));
  });

  it("tanda kutip dan potongan perintah SQL tersimpan utuh (AC-13)", () => {
    const bankKutip = structuredClone(bank);
    bankKutip.rujukan[0].catatan = "Uji kutip ' ; DROP TABLE rujukan; -- dan '' ganda";
    const db = basisBaru();
    db.exec(teksSql(bankKutip));
    expect(baris(db, "SELECT catatan FROM rujukan WHERE id = 'JR-01'")).toEqual([{ catatan: bankKutip.rujukan[0].catatan }]);
    expect(jumlah(db).rujukan).toBe(23);
  });
});

// ---------------------------------------------------------------------------------------------
// Perintah semai sebagai proses Node (P-26, P-33, P-35; AC-14)

const SKRIP = jalurRepo("scripts/jejak-setara/semai.mjs");
const jalankan = (skrip: string, argumen: string[], cwd: string) => spawnSync(process.execPath, [skrip, ...argumen], { cwd, encoding: "utf8" });
const WRANGLER_TANPA_D1 =
  '{\n  "name": "jejak-setara-lokal",\n  "main": "src/index.ts",\n  "vars": { "LINGKUNGAN": "lokal" } // D1 menyusul di JS-03: "d1_databases"\n}\n';
const WRANGLER_DENGAN_D1 =
  '{\n  "name": "jejak-setara-lokal",\n  "main": "src/index.ts",\n  "d1_databases": [{ "binding": "DB", "database_name": "jejak-setara", "database_id": "contoh", "migrations_dir": "migrations" }]\n}\n';
const cermin = mkdtempSync(join(tmpdir(), "jejak-semai-uji-"));
afterAll(() => rmSync(cermin, { recursive: true, force: true }));

/** Salinan kecil repositori: skrip semai, bank (atau tanpa bank), dan wrangler.jsonc. */
function salinan(nama: string, wrangler: string, isiBank: string | null): string {
  const akar = join(cermin, nama);
  mkdirSync(join(akar, "scripts/jejak-setara"), { recursive: true });
  mkdirSync(join(akar, "server/jejak-setara/seed"), { recursive: true });
  cpSync(SKRIP, join(akar, "scripts/jejak-setara/semai.mjs"));
  writeFileSync(join(akar, "server/jejak-setara/wrangler.jsonc"), wrangler);
  if (isiBank !== null) writeFileSync(join(akar, "server/jejak-setara/seed/bank-awal.json"), isiBank);
  return join(akar, "scripts/jejak-setara/semai.mjs");
}

describe("perintah semai (AC-14)", () => {
  it("--sql mencetak SQL yang sama persis dengan teksSql dan selesai dengan kode 0", () => {
    const hasil = jalankan(SKRIP, ["--sql"], AKAR);
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toBe(sql);
  });

  it.each([[[]], [["--jalankan", "--remote"]], [["--sql", "lagi"]], [["--hapus"]]])("argumen %j: cara pakai dan kode 1", (argumen) => {
    const hasil = jalankan(SKRIP, argumen, AKAR);
    expect(hasil.status).toBe(1);
    expect(hasil.stderr).toBe(
      "Pemakaian:\n  node scripts/jejak-setara/semai.mjs --sql\n  node scripts/jejak-setara/semai.mjs --jalankan [-- <bendera wrangler>]\n",
    );
  });

  it("--jalankan tanpa d1_databases: Belum tersedia, kode 0, wrangler tidak dijalankan", () => {
    const hasil = jalankan(salinan("tanpa-d1", WRANGLER_TANPA_D1, teksBank), ["--jalankan", "--", "--local"], cermin);
    expect(hasil.stdout).toBe(`${PESAN_BELUM}\n`);
    expect(PESAN_BELUM).toBe("Belum tersedia: D1 belum disiapkan di server/jejak-setara/wrangler.jsonc (dibuat di JS-03).");
    expect(hasil.status).toBe(0);
  });

  it("--jalankan dengan d1_databases tetapi tanpa node_modules: wrangler belum terpasang, kode 1", () => {
    const hasil = jalankan(salinan("d1-tanpa-wrangler", WRANGLER_DENGAN_D1, teksBank), ["--jalankan"], cermin);
    expect(hasil.stderr).toBe("wrangler belum terpasang. Pasang dependensi lebih dulu (npx pnpm@11.25.0 install).\n");
    expect(hasil.status).toBe(1);
  });

  it("bank ber-versi 2: Bank awal tidak sah, kode 1", () => {
    const skrip = salinan("bank-v2", WRANGLER_TANPA_D1, teksBank.replace('"versi": 1', '"versi": 2'));
    for (const argumen of [["--sql"], ["--jalankan"]]) {
      const hasil = jalankan(skrip, argumen, cermin);
      expect(hasil.stderr).toBe("Bank awal tidak sah: versi bank harus 1. Jalankan content:check:jejak untuk rinciannya.\n");
      expect(hasil.status).toBe(1);
    }
  });

  it("bank tidak ada: Bank awal tidak ditemukan, kode 1", () => {
    const hasil = jalankan(salinan("tanpa-bank", WRANGLER_TANPA_D1, null), ["--sql"], cermin);
    expect(hasil.stderr).toBe("Bank awal tidak ditemukan: server/jejak-setara/seed/bank-awal.json.\n");
    expect(hasil.status).toBe(1);
  });
});
