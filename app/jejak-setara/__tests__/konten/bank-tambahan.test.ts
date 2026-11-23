// Uji bank tambahan dan semai tambahan (spesifikasi JS-05-semai-tambahan, P-1, P-6 sampai P-19, P-21, dan P-22;
// AC-1 dan AC-3 sampai AC-8). SQL dijalankan di SQLite bawaan Node (node:sqlite) dengan tabel dari migrasi D1,
// seperti uji bank-semai. Perintah semai diuji pada salinan sementara repositori dengan wrangler tiruan, jadi
// wrangler sungguhan tidak pernah dijalankan.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  argumenStatusWrangler,
  bacaBank,
  barisCetakStatus,
  barisStatus,
  CATATAN_VERSI_TAMBAHAN,
  idKejadian,
  idPaket,
  idVersiPertama,
  IZIN_TAMBAHAN,
  JALUR_TAMBAHAN,
  kutip,
  PENANDA,
  PENANDA_TAMBAHAN,
  PESAN_TAMBAHAN_DILEWATI,
  pesanStatusTambahan,
  sqlSemaiTambahan,
  sqlStatusTambahan,
  tambahanDilewati,
  teksSql,
  teksSqlTambahan,
  VARIABEL_TANPA_TAMBAHAN,
} from "../../../../scripts/jejak-setara/semai.mjs";
import { tempatkanKejadian } from "../../inti/aturan";
import { KUNCI_ASET_DISETUJUI } from "../../inti/konten/kunci-aset";
import { periksaBank, periksaPaketPeta } from "../../inti/konten/periksa";
import { skemaBankAwal, type BankAwal } from "../../inti/konten/skema";
import { bacaPeta } from "../../inti/peta";
import type { TitikPeta, ZonaId } from "../../inti/tipe";
import { bacaBankAwal, bacaBankTambahan, bacaRepo, jalurRepo, JALUR_BANK_TAMBAHAN } from "./naskah-urai";

const { teks: teksAwal, bank: awal } = bacaBankAwal();
const { teks: teksTambahan, bank: tambahan } = bacaBankTambahan();
const pernyataan: string[] = sqlSemaiTambahan(tambahan);
const sqlTambahan: string = teksSqlTambahan(tambahan);
const sqlAwal: string = teksSql(awal);
const KODE = Array.from({ length: 24 }, (_, i) => `K-${i + 17}`);
const ID = Array.from({ length: 20 }, (_, i) => `JR-${i + 24}`);
const WAKTU = "CAST(strftime('%s', 'now') AS INTEGER) * 1000";
const BELUM = "NOT EXISTS (SELECT 1 FROM pengaturan WHERE kunci = 'semai_tambahan_1')";
const IZIN = "EXISTS (SELECT 1 FROM pengaturan WHERE kunci = 'semai_tambahan_1_izin')";
const SYARAT = `${BELUM} AND ${IZIN}`;
const POLA_UUID5 = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const PAKET = [
  { nama: "Paket lanjutan 24", deskripsi: "Dua puluh empat kejadian tambahan, tiga di setiap zona.", kejadian: KODE },
  {
    nama: "Paket lengkap 40",
    deskripsi: "Empat puluh kejadian bank awal dan tambahan, lima di setiap zona.",
    kejadian: Array.from({ length: 40 }, (_, i) => `K-${String(i + 1).padStart(2, "0")}`),
  },
];
const gabungan = (): BankAwal => ({
  versi: 1,
  rujukan: [...awal.rujukan, ...tambahan.rujukan],
  kejadian: [...awal.kejadian, ...tambahan.kejadian],
  paket: [...awal.paket, ...tambahan.paket],
});

// ---------------------------------------------------------------------------------------------
// Berkas bank tambahan (P-1, P-6, P-7; AC-1)

describe("berkas bank tambahan (P-1, P-6, P-7; AC-1)", () => {
  it("jalur berkas sama di semai.mjs dan pembantu uji", () => {
    expect(JALUR_TAMBAHAN).toBe("server/jejak-setara/seed/bank-tambahan-1.json");
    expect(JALUR_BANK_TAMBAHAN).toBe(JALUR_TAMBAHAN);
  });

  it("sah menurut skema dan diterima bacaBank", () => {
    expect(skemaBankAwal.safeParse(tambahan).success).toBe(true);
    expect(bacaBank(teksTambahan)).toEqual(tambahan);
  });

  it("versi 1, 20 rujukan JR-24 sampai JR-43, dan 24 kejadian K-17 sampai K-40, berurutan", () => {
    expect(tambahan.versi).toBe(1);
    expect(tambahan.rujukan.map((r) => r.id)).toEqual(ID);
    expect(tambahan.kejadian.map((k) => k.kode)).toEqual(KODE);
  });

  it("kedua paket menurut D-1, berurutan", () => {
    expect(tambahan.paket).toEqual(PAKET);
    for (const p of tambahan.paket) expect(p.deskripsi.length).toBeLessThanOrEqual(160);
  });

  it("UTF-8 tanpa BOM, indentasi dua spasi, satu baris baru di akhir, tanpa kata terverifikasi", () => {
    const mentah = readFileSync(jalurRepo(JALUR_BANK_TAMBAHAN));
    expect(mentah.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]))).toBe(false);
    expect(teksTambahan).toBe(`${JSON.stringify(tambahan, null, 2)}\n`);
    expect(teksTambahan.toLowerCase()).not.toContain("terverifikasi");
  });

  it("urutan kolom sama dengan bank awal", () => {
    for (const r of tambahan.rujukan) expect(Object.keys(r)).toEqual(["id", "teks", "sumber", "kodeSehari", "catatan"]);
    for (const k of tambahan.kejadian) {
      expect(Object.keys(k)).toEqual(Object.keys(awal.kejadian[0]));
      expect(Object.keys(k.langkah1)).toEqual(["pertanyaan", "opsi", "petunjuk"]);
      expect(Object.keys(k.langkah2)).toEqual(["pertanyaan", "opsi"]);
      expect(Object.keys(k.kartu)).toEqual(["hak", "kewajiban", "rujukan"]);
      for (const o of k.langkah1.opsi) expect(Object.keys(o)).toEqual(["id", "teks", "benar", "umpanBalik"]);
      for (const o of k.langkah2.opsi) expect(Object.keys(o)).toEqual(["id", "teks", "tingkat", "terjadi"]);
    }
    for (const p of tambahan.paket) expect(Object.keys(p)).toEqual(["nama", "deskripsi", "kejadian"]);
  });

  it("bank awal tetap berisi K-01 sampai K-16 dalam bentuk baku", () => {
    expect(teksAwal).toBe(`${JSON.stringify(awal, null, 2)}\n`);
    expect(awal.kejadian.map((k) => k.kode)).toEqual(Array.from({ length: 16 }, (_, i) => `K-${String(i + 1).padStart(2, "0")}`));
  });
});

// ---------------------------------------------------------------------------------------------
// Gabungan bank awal dan tambahan (P-8; AC-3, AC-4)

describe("gabungan bank awal dan tambahan (P-8; AC-3, AC-4)", () => {
  it("periksaBank dengan KUNCI_ASET_DISETUJUI: 0 galat dan 0 peringatan", () => {
    expect(periksaBank(gabungan(), { kunciAset: new Set(KUNCI_ASET_DISETUJUI) })).toEqual([]);
  });

  it("kode kejadian, id rujukan, dan nama paket tambahan tidak sama dengan milik bank awal", () => {
    const kodeAwal = new Set(awal.kejadian.map((k) => k.kode));
    const idAwal = new Set(awal.rujukan.map((r) => r.id));
    const paketAwal = new Set(awal.paket.map((p) => p.nama));
    for (const k of tambahan.kejadian) expect(kodeAwal.has(k.kode), k.kode).toBe(false);
    for (const r of tambahan.rujukan) expect(idAwal.has(r.id), r.id).toBe(false);
    for (const p of tambahan.paket) expect(paketAwal.has(p.nama), p.nama).toBe(false);
  });

  const peta = bacaPeta(JSON.parse(bacaRepo("app/jejak-setara/peta/kampung.json")));
  const titikPerZona: Partial<Record<ZonaId, TitikPeta[]>> = {};
  for (const t of peta.titikKejadian) (titikPerZona[t.zona] ??= []).push(t);
  const jumlahTitik = Object.fromEntries(Object.entries(titikPerZona).map(([zona, daftar]) => [zona, daftar?.length ?? 0]));
  const zonaKode = new Map(gabungan().kejadian.map((k) => [k.kode, k.zona]));

  for (const p of PAKET) {
    it(`${p.nama}: paling banyak 6 kejadian per zona, lolos periksaPaketPeta, dan tempatkanKejadian lengkap untuk tiga benih`, () => {
      const zona = p.kejadian.map((kode) => zonaKode.get(kode) as ZonaId);
      const perZona = new Map<ZonaId, number>();
      for (const z of zona) perZona.set(z, (perZona.get(z) ?? 0) + 1);
      for (const [z, n] of perZona) expect(n, `${p.nama} ${z}`).toBeLessThanOrEqual(6);
      expect(periksaPaketPeta(zona, jumlahTitik)).toEqual([]);
      const kejadian = p.kejadian.map((kode) => ({ kode, zona: zonaKode.get(kode) as ZonaId }));
      for (const benihRuang of ["uji-1", "uji-2", "uji-3"]) {
        const hasil = tempatkanKejadian(benihRuang, titikPerZona, kejadian);
        expect(hasil.map((h) => h.kode)).toEqual(p.kejadian);
        hasil.forEach((h, i) => expect(h.titik.zona, h.kode).toBe(kejadian[i].zona));
        expect(new Set(hasil.map((h) => h.titik.id)).size).toBe(kejadian.length);
      }
    });
  }
});

// ---------------------------------------------------------------------------------------------
// SQL semai tambahan (P-9 sampai P-14; AC-5)

describe("SQL semai tambahan (P-9 sampai P-14; AC-5)", () => {
  it("selalu sama untuk bank yang sama, dengan satu baris keterangan dan 137 pernyataan", () => {
    expect(teksSqlTambahan(JSON.parse(teksTambahan) as BankAwal)).toBe(sqlTambahan);
    expect(pernyataan).toHaveLength(137);
    expect(sqlTambahan).toBe(
      [
        "-- Semai tambahan Jejak Setara (lanjutan JS-05), dibuat oleh scripts/jejak-setara/semai.mjs dari server/jejak-setara/seed/bank-tambahan-1.json.",
        ...pernyataan,
        "",
      ].join("\n"),
    );
  });

  it("urutan: izin, 20 rujukan, kejadian dan versi bergantian, dua paket dengan isinya, penanda, lalu penghapusan izin", () => {
    const jenis = pernyataan.map((s) => /^(?:INSERT INTO|DELETE FROM) (\w+) /.exec(s)?.[1]);
    expect(jenis).toEqual([
      "pengaturan",
      ...Array<string>(20).fill("rujukan"),
      ...Array.from({ length: 24 }, () => ["kejadian", "kejadian_versi"]).flat(),
      "paket",
      ...Array<string>(24).fill("paket_kejadian"),
      "paket",
      ...Array<string>(40).fill("paket_kejadian"),
      "pengaturan",
      "pengaturan",
    ]);
  });

  it("izin hanya bila penanda tambahan belum ada, bank awal sudah disemai, dan semua kode, nomor, serta nama paket bebas (P-10)", () => {
    const daftar = (x: string[]) => x.map((v) => kutip(v)).join(", ");
    expect(pernyataan[0]).toBe(
      `INSERT INTO pengaturan (kunci, nilai_json) SELECT 'semai_tambahan_1_izin', '{}' WHERE ${BELUM} AND EXISTS (SELECT 1 FROM pengaturan WHERE kunci = 'semai_bank_awal') ` +
        `AND NOT EXISTS (SELECT 1 FROM kejadian WHERE kode IN (${daftar(KODE)})) AND NOT EXISTS (SELECT 1 FROM rujukan WHERE id IN (${daftar(ID)})) ` +
        `AND NOT EXISTS (SELECT 1 FROM paket WHERE nama IN ('Paket lanjutan 24', 'Paket lengkap 40')) ON CONFLICT (kunci) DO NOTHING;`,
    );
  });

  it("sisipan lain hanya selama izin ada dan penanda belum ada; penanda hanya dengan izin; izin dihapus di akhir (P-11)", () => {
    for (const s of pernyataan.slice(1, -2)) {
      expect(s).toContain(SYARAT);
      expect(s).toContain(" SELECT ");
      expect(s).toContain(" WHERE ");
      expect(s).toMatch(/ON CONFLICT (\(id\) )?DO NOTHING;$/);
    }
    expect(pernyataan[135]).toBe(
      `INSERT INTO pengaturan (kunci, nilai_json) SELECT 'semai_tambahan_1', '{"versi":1,"rujukan":20,"kejadian":24,"paket":2}' WHERE ${IZIN} ON CONFLICT (kunci) DO NOTHING;`,
    );
    expect(pernyataan[136]).toBe("DELETE FROM pengaturan WHERE kunci = 'semai_tambahan_1_izin';");
    expect(PENANDA_TAMBAHAN).toBe("semai_tambahan_1");
    expect(IZIN_TAMBAHAN).toBe("semai_tambahan_1_izin");
  });

  it("nilai yang ditulis: rujukan 'belum', kejadian 'tinjau', versi kerja dengan catatan D-2, dan id tetap (P-13)", () => {
    tambahan.rujukan.forEach((r, i) => {
      expect(pernyataan[1 + i]).toBe(
        `INSERT INTO rujukan (id, teks, sumber, status, catatan, kode_sehari) SELECT ${kutip(r.id)}, ${kutip(r.teks)}, ${kutip(r.sumber)}, 'belum', ${kutip(r.catatan)}, NULL WHERE ${SYARAT} ON CONFLICT (id) DO NOTHING;`,
      );
    });
    const k = tambahan.kejadian[0];
    expect(pernyataan[21]).toBe(
      `INSERT INTO kejadian (id, kode, status, versi_terbit_id, pemilik_id, diubah_pada) SELECT '${idKejadian("K-17")}', 'K-17', 'tinjau', NULL, NULL, ${WAKTU} WHERE ${SYARAT} ON CONFLICT DO NOTHING;`,
    );
    expect(pernyataan[22]).toBe(
      `INSERT INTO kejadian_versi (id, kejadian_id, nomor, isi_json, jenis, dibuat_oleh, dibuat_pada, catatan_perubahan) SELECT '${idVersiPertama("K-17")}', k.id, 1, ${kutip(JSON.stringify(k))}, 'kerja', NULL, ${WAKTU}, 'Kejadian tambahan dari repositori (semai tambahan 1)' FROM kejadian k WHERE k.kode = 'K-17' AND ${SYARAT} AND NOT EXISTS (SELECT 1 FROM kejadian_versi v WHERE v.kejadian_id = k.id) ON CONFLICT DO NOTHING;`,
    );
    expect(CATATAN_VERSI_TAMBAHAN).toBe("Kejadian tambahan dari repositori (semai tambahan 1)");
    expect(pernyataan[69]).toBe(
      `INSERT INTO paket (id, nama, deskripsi, aktif) SELECT '${idPaket("Paket lanjutan 24")}', 'Paket lanjutan 24', 'Dua puluh empat kejadian tambahan, tiga di setiap zona.', 1 WHERE ${SYARAT} ON CONFLICT DO NOTHING;`,
    );
    expect(pernyataan[70]).toBe(
      `INSERT INTO paket_kejadian (paket_id, kejadian_id, urutan) SELECT p.id, k.id, 1 FROM paket p, kejadian k WHERE p.id = '${idPaket("Paket lanjutan 24")}' AND k.kode = 'K-17' AND ${SYARAT} ON CONFLICT DO NOTHING;`,
    );
    expect(pernyataan[95]).toContain(`WHERE p.id = '${idPaket("Paket lengkap 40")}' AND k.kode = 'K-01' AND`);
    expect(pernyataan[134]).toContain(`SELECT p.id, k.id, 40 FROM paket p, kejadian k WHERE p.id = '${idPaket("Paket lengkap 40")}' AND k.kode = 'K-40' AND`);
  });

  it("id contoh sesuai spesifikasi, berbentuk UUID versi 5, dan tidak sama dengan id bank awal (P-13)", () => {
    expect(idKejadian("K-17")).toBe("1460701d-71cc-5288-870d-536a4df549b5");
    expect(idVersiPertama("K-17")).toBe("0d432993-63d1-5a63-a86e-0f5df3e33a29");
    expect(idPaket("Paket lanjutan 24")).toBe("e32f69ae-02ce-5a3f-aa1f-59617a4ba7b5");
    expect(idPaket("Paket lengkap 40")).toBe("15f2b22e-8edd-5588-8d6f-51385e459d68");
    const id = (b: BankAwal) => [...b.kejadian.flatMap((k) => [idKejadian(k.kode), idVersiPertama(k.kode)]), ...b.paket.map((p) => idPaket(p.nama))];
    const semua = [...id(awal), ...id(tambahan)];
    expect(semua).toHaveLength(33 + 50);
    expect(new Set(semua).size).toBe(semua.length);
    for (const x of id(tambahan)) expect(x).toMatch(POLA_UUID5);
  });

  it("tanpa BEGIN, COMMIT, atau kata terverifikasi; setiap pernyataan ≤ 100.000 byte (P-14)", () => {
    expect(/\b(BEGIN|COMMIT)\b/i.test(sqlTambahan)).toBe(false);
    expect(sqlTambahan.toLowerCase()).not.toContain("terverifikasi");
    for (const s of pernyataan) expect(Buffer.byteLength(s)).toBeLessThanOrEqual(100_000);
  });
});

// ---------------------------------------------------------------------------------------------
// Status dan pesan (P-15, P-17, P-18; AC-7)

describe("status dan pesan semai tambahan (P-15, P-17, P-17a, P-18; AC-7, AC-14)", () => {
  const SELESAI = "Semai tambahan selesai. Kejadian tambahan (20 rujukan, 24 kejadian, 2 paket) sudah ada di basis data ini; baris yang sudah ada tidak pernah ditimpa.";
  const TIDAK_TERBACA = "Status semai tambahan tidak terbaca. Lihat daftar kejadian di konsol untuk memastikan K-17 sampai K-40 sudah ada.";
  const BELUM_AWAL = "Semai tambahan ditunda: bank awal belum disemai di basis data ini.";

  it("barisStatus mengambil baris pertama dari keluaran --json, atau null", () => {
    const baris = { sudah: 1, awal: 1, ada: null };
    expect(barisStatus(JSON.stringify([{ results: [baris], success: true, meta: {} }]))).toEqual(baris);
    expect(barisStatus(JSON.stringify({ results: [baris] }))).toEqual(baris);
    expect(barisStatus(JSON.stringify([{ meta: {} }, { results: [baris] }]))).toEqual(baris);
    expect(barisStatus(JSON.stringify([{ results: [] }]))).toBeNull();
    expect(barisStatus("bukan json")).toBeNull();
    expect(barisStatus("")).toBeNull();
    expect(barisStatus(undefined as unknown as string)).toBeNull();
  });

  it.each([
    [{ sudah: 1, awal: 1, ada: "K-17, JR-24" }, SELESAI, false],
    [{ sudah: 0, awal: 0, ada: null }, BELUM_AWAL, true],
    [
      { sudah: 0, awal: 1, ada: "Paket lanjutan 24, JR-24, K-17" },
      "Semai tambahan ditunda: K-17, JR-24, Paket lanjutan 24 sudah ada di basis data ini. Hapus di konsol bila itu hanya percobaan; deploy berikutnya akan mencoba lagi.",
      true,
    ],
    [{ sudah: 0, awal: 1, ada: null }, TIDAK_TERBACA, true],
    [{ sudah: "x", awal: 1, ada: null }, TIDAK_TERBACA, true],
    [null, TIDAK_TERBACA, true],
  ])("pesanStatusTambahan(%j)", (baris, teks, peringatan) => {
    expect(pesanStatusTambahan(baris, tambahan)).toEqual({ teks, peringatan });
  });

  it("peringatan diawali ::warning hanya di GitHub Actions (P-18)", () => {
    const peringatan = { teks: BELUM_AWAL, peringatan: true };
    expect(barisCetakStatus(peringatan, { GITHUB_ACTIONS: "true" })).toBe(`::warning title=Semai tambahan::${BELUM_AWAL}`);
    expect(barisCetakStatus(peringatan, { GITHUB_ACTIONS: "false" })).toBe(BELUM_AWAL);
    expect(barisCetakStatus(peringatan, {})).toBe(BELUM_AWAL);
    expect(barisCetakStatus({ teks: SELESAI, peringatan: false }, { GITHUB_ACTIONS: "true" })).toBe(SELESAI);
  });

  it("variabel server uji lokal: nama, pesan, dan hanya nilai tepat 1 yang melewati semai tambahan (P-17a)", () => {
    expect(VARIABEL_TANPA_TAMBAHAN).toBe("JEJAK_SEMAI_TANPA_TAMBAHAN");
    expect(PESAN_TAMBAHAN_DILEWATI).toBe("Semai tambahan dilewati (JEJAK_SEMAI_TANPA_TAMBAHAN=1).");
    expect(tambahanDilewati({ JEJAK_SEMAI_TANPA_TAMBAHAN: "1" })).toBe(true);
    for (const nilai of [undefined, "", "0", "true", "1 "]) expect(tambahanDilewati({ JEJAK_SEMAI_TANPA_TAMBAHAN: nilai }), String(nilai)).toBe(false);
    expect(tambahanDilewati({})).toBe(false);
  });

  it("argumen kueri status: --command, --json, --yes, lalu lokasi dan bendera yang sama dengan semai (P-17)", () => {
    const q = sqlStatusTambahan(tambahan);
    const dasar = ["d1", "execute", "DB", "--config", "server/jejak-setara/wrangler.jsonc", "--command", q, "--json", "--yes"];
    expect(argumenStatusWrangler(q, [])).toEqual([...dasar, "--local"]);
    expect(argumenStatusWrangler(q, ["--remote", "--env", "uji"])).toEqual([...dasar, "--remote", "--env", "uji"]);
    expect(argumenStatusWrangler(q, ["--local", "--persist-to", ".wrangler/state"])).toEqual([...dasar, "--local", "--persist-to", ".wrangler/state"]);
  });
});

// ---------------------------------------------------------------------------------------------
// Skenario SQL di SQLite (P-10 sampai P-15, P-22; AC-6, AC-7)

type ModulSqlite = typeof import("node:sqlite");
type Basis = InstanceType<ModulSqlite["DatabaseSync"]>;
const sqlite = process.getBuiltinModule("node:sqlite") as ModulSqlite | undefined;
const FOLDER_MIGRASI = "server/jejak-setara/migrations";
const migrasi = existsSync(jalurRepo(FOLDER_MIGRASI)) ? readdirSync(jalurRepo(FOLDER_MIGRASI)).filter((n) => n.endsWith(".sql")).sort() : [];
const sqlTabel = migrasi.map((n) => bacaRepo(`${FOLDER_MIGRASI}/${n}`)).join("\n");

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
const kunciPengaturan = (db: Basis) => baris(db, "SELECT kunci FROM pengaturan ORDER BY kunci").map((r) => r.kunci);
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
const status = (db: Basis) => db.prepare(sqlStatusTambahan(tambahan)).get() as Record<string, unknown>;
const LENGKAP = { rujukan: 43, kejadian: 40, kejadian_versi: 40, paket: 3, paket_kejadian: 80, pengaturan: 2 };
const SESUDAH_AWAL = { rujukan: 23, kejadian: 16, kejadian_versi: 16, paket: 1, paket_kejadian: 16, pengaturan: 1 };

if (!sqlite) it.skip("Dilewati: node:sqlite tidak tersedia (perlu Node 22.13 atau lebih baru).", () => {});
if (migrasi.length === 0) it.skip(`Belum tersedia: ${FOLDER_MIGRASI}/ belum berisi migrasi (dibuat di JS-03).`, () => {});

describe.skipIf(!sqlite || migrasi.length === 0)(`semai tambahan di SQLite, tabel dari migrasi (${migrasi.join(", ")})`, () => {
  /** Hasil semai lengkap yang benar: dipakai skenario 1, 4, 5, dan 6. */
  function periksaLengkap(db: Basis) {
    expect(jumlah(db)).toEqual(LENGKAP);
    expect(kunciPengaturan(db)).toEqual([PENANDA, PENANDA_TAMBAHAN]);
    const hasil = isi(db);
    expect(hasil.rujukan.filter((r) => ID.includes(String(r.id)))).toEqual(
      tambahan.rujukan.map((r) => ({ id: r.id, teks: r.teks, sumber: r.sumber, status: "belum", catatan: r.catatan, kode_sehari: null })),
    );
    expect(hasil.kejadian.filter((k) => KODE.includes(String(k.kode)))).toEqual(
      tambahan.kejadian.map((k) => ({ id: idKejadian(k.kode), kode: k.kode, status: "tinjau", versi_terbit_id: null, pemilik_id: null })),
    );
    expect(hasil.versi.filter((v) => KODE.includes(String(v.kode)))).toEqual(
      tambahan.kejadian.map((k) => ({
        id: idVersiPertama(k.kode),
        kode: k.kode,
        nomor: 1,
        isi_json: JSON.stringify(k),
        jenis: "kerja",
        dibuat_oleh: null,
        catatan_perubahan: CATATAN_VERSI_TAMBAHAN,
      })),
    );
    expect(hasil.paket.filter((p) => p.nama !== "Paket inti 16")).toEqual(PAKET.map((p) => ({ id: idPaket(p.nama), nama: p.nama, deskripsi: p.deskripsi, aktif: 1 })));
    for (const p of PAKET) {
      expect(hasil.isiPaket.filter((x) => x.nama === p.nama)).toEqual(p.kejadian.map((kode, i) => ({ nama: p.nama, kode, urutan: i + 1 })));
    }
    expect(hasil.pengaturan.find((x) => x.kunci === PENANDA_TAMBAHAN)?.nilai_json).toBe('{"versi":1,"rujukan":20,"kejadian":24,"paket":2}');
    expect(status(db)).toMatchObject({ sudah: 1, awal: 1 });
    expect(pesanStatusTambahan(status(db), tambahan).peringatan).toBe(false);
  }

  it("1. semai pertama: bank awal lalu tambahan menulis semuanya, tanpa izin yang tertinggal", () => {
    const db = basisBaru();
    db.exec(sqlAwal + sqlTambahan);
    periksaLengkap(db);
    const mulai = Date.now();
    for (const r of baris(db, `SELECT diubah_pada AS w FROM kejadian WHERE kode IN (${KODE.map((k) => kutip(k)).join(", ")})`)) {
      expect(Math.abs(Number(r.w) - mulai)).toBeLessThan(10_000);
      expect(Number(r.w) % 1000).toBe(0);
    }
  });

  it("2. semai ulang tidak mengubah satu baris pun", () => {
    const db = basisBaru();
    db.exec(sqlAwal + sqlTambahan);
    const sebelum = potret(db);
    db.exec(sqlAwal + sqlTambahan);
    db.exec(sqlTambahan);
    expect(potret(db)).toEqual(sebelum);
  });

  it("3. suntingan konsol sesudah semai bertahan saat semai diulang", () => {
    const db = basisBaru();
    db.exec(sqlAwal + sqlTambahan);
    db.exec(`UPDATE rujukan SET status = 'terverifikasi', diverifikasi_pada = 1 WHERE id = 'JR-24';
      UPDATE kejadian_versi SET isi_json = '{"disunting":true}' WHERE id = '${idVersiPertama("K-17")}';
      UPDATE kejadian SET status = 'arsip' WHERE kode = 'K-18';
      UPDATE paket SET aktif = 0 WHERE nama = 'Paket lanjutan 24';
      DELETE FROM paket_kejadian WHERE paket_id = '${idPaket("Paket lengkap 40")}' AND kejadian_id = '${idKejadian("K-20")}';`);
    const sesudahSunting = potret(db);
    db.exec(sqlAwal + sqlTambahan);
    expect(potret(db)).toEqual(sesudahSunting);
  });

  const TABRAKAN: [string, string, string, string][] = [
    [
      "kejadian K-17",
      "INSERT INTO kejadian (id, kode, status, diubah_pada) VALUES ('id-konsol', 'K-17', 'draf', 1);",
      "DELETE FROM kejadian WHERE id = 'id-konsol';",
      "K-17",
    ],
    ["rujukan JR-24", "INSERT INTO rujukan (id, teks, sumber, status) VALUES ('JR-24', 'Teks buatan konsol', 'https://contoh.invalid', 'belum');", "DELETE FROM rujukan WHERE id = 'JR-24';", "JR-24"],
    [
      "paket bernama Paket lanjutan 24",
      "INSERT INTO paket (id, nama, deskripsi, aktif) VALUES ('paket-konsol', 'Paket lanjutan 24', 'Dibuat di konsol', 1);",
      "DELETE FROM paket WHERE id = 'paket-konsol';",
      "Paket lanjutan 24",
    ],
  ];

  for (const [nama, buat, hapus, kode] of TABRAKAN) {
    it(`4. tabrakan dengan ${nama}: tidak ada yang ditulis, lalu lengkap sesudah dibereskan`, () => {
      const db = basisBaru();
      db.exec(sqlAwal);
      db.exec(buat);
      const sebelum = potret(db);
      db.exec(sqlTambahan);
      expect(potret(db)).toEqual(sebelum);
      expect(kunciPengaturan(db)).toEqual([PENANDA]);
      expect(status(db)).toEqual({ sudah: 0, awal: 1, ada: kode });
      const pesan = pesanStatusTambahan(status(db), tambahan);
      expect(pesan).toEqual({
        teks: `Semai tambahan ditunda: ${kode} sudah ada di basis data ini. Hapus di konsol bila itu hanya percobaan; deploy berikutnya akan mencoba lagi.`,
        peringatan: true,
      });
      db.exec(hapus);
      db.exec(sqlAwal + sqlTambahan);
      periksaLengkap(db);
    });
  }

  it("4. beberapa tabrakan sekaligus disebut berurutan seperti di bank", () => {
    const db = basisBaru();
    db.exec(sqlAwal);
    for (const [, buat] of TABRAKAN) db.exec(buat);
    db.exec("INSERT INTO kejadian (id, kode, status, diubah_pada) VALUES ('id-konsol-2', 'K-40', 'draf', 1);");
    db.exec(sqlTambahan);
    expect(pesanStatusTambahan(status(db), tambahan).teks).toBe(
      "Semai tambahan ditunda: K-17, K-40, JR-24, Paket lanjutan 24 sudah ada di basis data ini. Hapus di konsol bila itu hanya percobaan; deploy berikutnya akan mencoba lagi.",
    );
  });

  it("5. bank awal belum disemai: tambahan saja tidak menulis apa pun, lalu lengkap sesudah bank awal", () => {
    const db = basisBaru();
    db.exec(sqlTambahan);
    expect(jumlah(db)).toEqual({ rujukan: 0, kejadian: 0, kejadian_versi: 0, paket: 0, paket_kejadian: 0, pengaturan: 0 });
    expect(status(db)).toEqual({ sudah: 0, awal: 0, ada: null });
    expect(pesanStatusTambahan(status(db), tambahan).teks).toBe("Semai tambahan ditunda: bank awal belum disemai di basis data ini.");
    db.exec(sqlAwal + sqlTambahan);
    periksaLengkap(db);
  });

  it("6. semai terputus sesudah izin: semai berikutnya melengkapi semuanya (P-12)", () => {
    const acuan = basisBaru();
    acuan.exec(sqlAwal + sqlTambahan);
    for (const potong of [1, 2, 30, 70, 136]) {
      const db = basisBaru();
      db.exec(sqlAwal);
      db.exec(pernyataan.slice(0, potong).join("\n"));
      expect(jumlah(db).pengaturan, `terputus sesudah ${potong} pernyataan`).toBeGreaterThanOrEqual(2);
      expect(kunciPengaturan(db)).toContain(IZIN_TAMBAHAN);
      db.exec(sqlAwal + sqlTambahan);
      periksaLengkap(db);
      expect(isi(db)).toEqual(isi(acuan));
    }
  });

  it("bank awal sendiri tetap persis seperti sebelumnya sesudah semai tambahan", () => {
    const hanyaAwal = basisBaru();
    hanyaAwal.exec(sqlAwal);
    const db = basisBaru();
    db.exec(sqlAwal + sqlTambahan);
    const saring = (x: ReturnType<typeof isi>) => ({
      rujukan: x.rujukan.filter((r) => !ID.includes(String(r.id))),
      kejadian: x.kejadian.filter((k) => !KODE.includes(String(k.kode))),
      versi: x.versi.filter((v) => !KODE.includes(String(v.kode))),
      paket: x.paket.filter((p) => p.nama === "Paket inti 16"),
      isiPaket: x.isiPaket.filter((p) => p.nama === "Paket inti 16"),
    });
    expect(saring(isi(db))).toEqual(saring(isi(hanyaAwal)));
    expect(jumlah(hanyaAwal)).toEqual(SESUDAH_AWAL);
  });
});

// ---------------------------------------------------------------------------------------------
// Perintah semai dengan wrangler tiruan (P-16, P-17, P-17a, P-18; AC-8, AC-14)

const SKRIP = jalurRepo("scripts/jejak-setara/semai.mjs");
const WRANGLER_DENGAN_D1 =
  '{\n  "name": "jejak-setara-lokal",\n  "main": "src/index.ts",\n  "d1_databases": [{ "binding": "DB", "database_name": "jejak-setara", "database_id": "contoh", "migrations_dir": "migrations" }]\n}\n';
/**
 * wrangler tiruan: mencatat argumen dan isi berkas SQL ke log, keluar dengan kode dari lingkungan, dan untuk
 * --command mencetak JSON dari lingkungan.
 */
const WRANGLER_TIRUAN = `const fs = require("node:fs");
const argumen = process.argv.slice(2);
const i = argumen.indexOf("--file");
fs.appendFileSync(process.env.TIRUAN_LOG, JSON.stringify({ argumen, sql: i >= 0 ? fs.readFileSync(argumen[i + 1], "utf8") : null }) + "\\n");
if (i >= 0) process.exit(Number(process.env.TIRUAN_KODE_FILE || 0));
const kode = Number(process.env.TIRUAN_KODE_STATUS || 0);
if (kode !== 0) process.exit(kode);
process.stdout.write(process.env.TIRUAN_JSON || "");
`;
const cermin = mkdtempSync(join(tmpdir(), "jejak-semai-tambahan-uji-"));
afterAll(() => rmSync(cermin, { recursive: true, force: true }));

/** Salinan kecil repositori: skrip semai, bank awal, bank tambahan (atau tanpa), wrangler.jsonc, dan wrangler tiruan. */
function salinan(nama: string, isiTambahan: string | null): { akar: string; skrip: string; log: string } {
  const akar = join(cermin, nama);
  mkdirSync(join(akar, "scripts/jejak-setara"), { recursive: true });
  mkdirSync(join(akar, "server/jejak-setara/seed"), { recursive: true });
  mkdirSync(join(akar, "node_modules/wrangler/bin"), { recursive: true });
  cpSync(SKRIP, join(akar, "scripts/jejak-setara/semai.mjs"));
  writeFileSync(join(akar, "server/jejak-setara/wrangler.jsonc"), WRANGLER_DENGAN_D1);
  writeFileSync(join(akar, "server/jejak-setara/seed/bank-awal.json"), teksAwal);
  if (isiTambahan !== null) writeFileSync(join(akar, JALUR_TAMBAHAN), isiTambahan);
  writeFileSync(join(akar, "node_modules/wrangler/bin/wrangler.js"), WRANGLER_TIRUAN);
  return { akar, skrip: join(akar, "scripts/jejak-setara/semai.mjs"), log: join(akar, "tiruan.log") };
}
function jalankan(s: { akar: string; skrip: string; log: string }, argumen: string[], lingkungan: Record<string, string>) {
  return spawnSync(process.execPath, [s.skrip, ...argumen], {
    cwd: s.akar,
    encoding: "utf8",
    // Lingkungan uji ini sendiri tidak boleh ikut melewati semai tambahan, jadi variabelnya dikosongkan.
    env: { ...process.env, GITHUB_ACTIONS: "false", JEJAK_SEMAI_TANPA_TAMBAHAN: "", TIRUAN_LOG: s.log, ...lingkungan },
  });
}
const catatan = (log: string) =>
  existsSync(log)
    ? readFileSync(log, "utf8")
        .trim()
        .split("\n")
        .map((b) => JSON.parse(b) as { argumen: string[]; sql: string | null })
    : [];
const SELESAI_AWAL = "Semai selesai. Bank awal (23 rujukan, 16 kejadian, 1 paket) hanya ditulis bila basis data ini belum pernah disemai.";
const JSON_SELESAI = JSON.stringify([{ results: [{ sudah: 1, awal: 1, ada: "K-17" }], success: true, meta: {} }]);

describe("perintah semai dengan bank tambahan (P-16, P-17, P-17a, P-18; AC-8, AC-14)", () => {
  it("bank tambahan tidak sah: pesan galat, kode 1, dan wrangler tidak dijalankan", () => {
    const s = salinan("tambahan-tidak-sah", teksTambahan.replace('"versi": 1', '"versi": 2'));
    const hasil = jalankan(s, ["--jalankan"], {});
    expect(hasil.stderr).toBe("Bank tambahan tidak sah: versi bank harus 1. Jalankan content:check:jejak untuk rinciannya.\n");
    expect(hasil.stdout).toBe("");
    expect(hasil.status).toBe(1);
    expect(catatan(s.log)).toEqual([]);
  });

  it("tanpa bank tambahan: persis seperti JS-05 (satu kali wrangler, SQL bank awal saja, tanpa kueri status)", () => {
    const s = salinan("tanpa-tambahan", null);
    const hasil = jalankan(s, ["--jalankan"], {});
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toBe(`${SELESAI_AWAL}\n`);
    const log = catatan(s.log);
    expect(log).toHaveLength(1);
    expect(log[0].sql).toBe(sqlAwal);
    expect(log[0].argumen).toEqual(["d1", "execute", "DB", "--config", "server/jejak-setara/wrangler.jsonc", "--file", log[0].argumen[6], "--yes", "--local"]);
  });

  it("dengan bank tambahan: SQL bank awal lalu tambahan, lalu kueri status dengan bendera yang sama", () => {
    const s = salinan("dengan-tambahan", teksTambahan);
    const hasil = jalankan(s, ["--jalankan", "--", "--local", "--persist-to", "folder state"], { TIRUAN_JSON: JSON_SELESAI });
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toBe(
      `${SELESAI_AWAL}\nSemai tambahan selesai. Kejadian tambahan (20 rujukan, 24 kejadian, 2 paket) sudah ada di basis data ini; baris yang sudah ada tidak pernah ditimpa.\n`,
    );
    const log = catatan(s.log);
    expect(log).toHaveLength(2);
    expect(log[0].sql).toBe(sqlAwal + sqlTambahan);
    expect(log[0].argumen.slice(-3)).toEqual(["--local", "--persist-to", "folder state"]);
    expect(log[1].argumen).toEqual(argumenStatusWrangler(sqlStatusTambahan(tambahan), ["--local", "--persist-to", "folder state"]));
    expect(log[1].sql).toBeNull();
  });

  it("tambahan ditunda di GitHub Actions: peringatan ::warning, kode tetap 0", () => {
    const s = salinan("ditunda-github", teksTambahan);
    const json = JSON.stringify([{ results: [{ sudah: 0, awal: 1, ada: "JR-24, K-17" }], success: true }]);
    const hasil = jalankan(s, ["--jalankan", "--", "--remote", "--env", "uji"], { TIRUAN_JSON: json, GITHUB_ACTIONS: "true" });
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toBe(
      `${SELESAI_AWAL}\n::warning title=Semai tambahan::Semai tambahan ditunda: K-17, JR-24 sudah ada di basis data ini. Hapus di konsol bila itu hanya percobaan; deploy berikutnya akan mencoba lagi.\n`,
    );
    expect(catatan(s.log)[1].argumen.slice(-3)).toEqual(["--remote", "--env", "uji"]);
  });

  it.each([
    ["kueri status gagal", { TIRUAN_KODE_STATUS: "1" }],
    ["keluaran tidak terbaca", { TIRUAN_JSON: "Ini bukan JSON" }],
  ])("%s: pesan tidak terbaca, kode tetap 0", (_, lingkungan) => {
    const s = salinan(`tidak-terbaca-${Object.keys(lingkungan)[0]}`, teksTambahan);
    const hasil = jalankan(s, ["--jalankan"], lingkungan);
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toBe(`${SELESAI_AWAL}\nStatus semai tambahan tidak terbaca. Lihat daftar kejadian di konsol untuk memastikan K-17 sampai K-40 sudah ada.\n`);
  });

  it("semai gagal: pesan gagal JS-05, kode mengikuti wrangler, dan kueri status tidak dijalankan", () => {
    const s = salinan("semai-gagal", teksTambahan);
    const hasil = jalankan(s, ["--jalankan"], { TIRUAN_KODE_FILE: "3" });
    expect(hasil.status).toBe(3);
    expect(hasil.stderr).toBe("Semai gagal (kode keluar 3). Lihat pesan wrangler di atas.\n");
    expect(hasil.stdout).toBe("");
    expect(catatan(s.log)).toHaveLength(1);
  });

  it("JEJAK_SEMAI_TANPA_TAMBAHAN=1: SQL bank awal saja, satu kali wrangler, pesan dilewati, tanpa kueri status (P-17a)", () => {
    const s = salinan("tanpa-tambahan-variabel", teksTambahan);
    const hasil = jalankan(s, ["--jalankan", "--", "--local", "--persist-to", "folder state"], { JEJAK_SEMAI_TANPA_TAMBAHAN: "1", TIRUAN_JSON: JSON_SELESAI });
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toBe(`${SELESAI_AWAL}\nSemai tambahan dilewati (JEJAK_SEMAI_TANPA_TAMBAHAN=1).\n`);
    expect(hasil.stderr).toBe("");
    const log = catatan(s.log);
    expect(log).toHaveLength(1);
    expect(log[0].sql).toBe(sqlAwal);
    expect(log[0].argumen.slice(-3)).toEqual(["--local", "--persist-to", "folder state"]);
  });

  it("JEJAK_SEMAI_TANPA_TAMBAHAN=1: bank tambahan yang tidak sah tidak dibaca; tanpa berkas tambahan, keluarannya persis JS-05 (P-17a)", () => {
    const tidakSah = salinan("tanpa-tambahan-variabel-tidak-sah", teksTambahan.replace('"versi": 1', '"versi": 2'));
    const hasil = jalankan(tidakSah, ["--jalankan"], { JEJAK_SEMAI_TANPA_TAMBAHAN: "1" });
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toBe(`${SELESAI_AWAL}\nSemai tambahan dilewati (JEJAK_SEMAI_TANPA_TAMBAHAN=1).\n`);
    expect(catatan(tidakSah.log).map((c) => c.sql)).toEqual([sqlAwal]);
    const kosong = salinan("tanpa-tambahan-variabel-tanpa-berkas", null);
    const hasilKosong = jalankan(kosong, ["--jalankan"], { JEJAK_SEMAI_TANPA_TAMBAHAN: "1" });
    expect(hasilKosong.status).toBe(0);
    expect(hasilKosong.stdout).toBe(`${SELESAI_AWAL}\n`);
    expect(catatan(kosong.log).map((c) => c.sql)).toEqual([sqlAwal]);
  });

  it.each(["0", "true", "ya", " 1"])("JEJAK_SEMAI_TANPA_TAMBAHAN=%j tidak melewati apa pun (P-17a)", (nilai) => {
    const s = salinan(`variabel-lain-${["0", "true", "ya", " 1"].indexOf(nilai)}`, teksTambahan);
    const hasil = jalankan(s, ["--jalankan"], { JEJAK_SEMAI_TANPA_TAMBAHAN: nilai, TIRUAN_JSON: JSON_SELESAI });
    expect(hasil.status).toBe(0);
    expect(catatan(s.log)).toHaveLength(2);
    expect(hasil.stdout).not.toContain("dilewati");
  });

  it("--sql tetap mencetak SQL bank awal saja walaupun bank tambahan ada (P-16)", () => {
    const s = salinan("sql-saja", teksTambahan);
    const hasil = jalankan(s, ["--sql"], {});
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toBe(sqlAwal);
  });
});
