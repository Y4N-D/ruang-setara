// Uji unit skrip pemeriksaan produksi scripts/jejak-setara/produksi.mjs (spesifikasi JS-16a, P-3 sampai P-6; AC-5, AC-6).
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import {
  BENDERA_PRODUKSI,
  ID_KOSONG_PRODUKSI,
  SQL_ADA_TABEL_RUANG,
  SQL_RUANG_AKTIF,
  TEKS,
  bacaJumlah,
  hitungRuangAktif,
  idD1Produksi,
  periksaRilis,
  putuskanRuang,
  utama,
} from "../../../../scripts/jejak-setara/produksi.mjs";
import { TEKS_KONSOL } from "../../teks-konsol";

const ID = "354bffcb-5eae-4dc2-b7a4-17a2d108e232";
const sementara = mkdtempSync(join(tmpdir(), "jejak-produksi-"));
const tulis = (akar: string, jalur: string, isi: string) => {
  mkdirSync(dirname(join(akar, jalur)), { recursive: true });
  writeFileSync(join(akar, jalur), isi);
};
const wrangler = (id: string) =>
  `// konfigurasi uji\n${JSON.stringify({ env: { uji: { d1_databases: [{ database_id: "uji" }] }, produksi: { d1_databases: [{ binding: "DB", database_name: "jejak-setara", database_id: id }] } } }, null, 2)}`;
const siapkan = (nama: string, id: string) => {
  const akar = join(sementara, nama);
  for (const v of ["v0.9", "v1.0", "v1.0.1"]) tulis(akar, `docs/jejak-setara/rilis/${v}.md`, `# Rilis ${v}\n`);
  tulis(akar, "server/jejak-setara/wrangler.jsonc", wrangler(id));
  return akar;
};
const akar = siapkan("lengkap", ID);
const akarKosong = siapkan("tanda-isian", ID_KOSONG_PRODUKSI);
const dasar = { versi: "v0.9", ref: "refs/heads/main", adaToken: true, adaAkun: true, akar };
const keluaran = (jumlah: unknown) => JSON.stringify([{ results: [{ jumlah }], success: true, meta: { duration: 1 } }]);

afterAll(() => rmSync(sementara, { recursive: true, force: true }));
afterEach(() => vi.restoreAllMocks());

describe("periksaRilis (P-3; AC-5)", () => {
  it("menerima v0.9, v1.0, dan v1.0.1 bila catatan rilisnya ada", () => {
    for (const versi of ["v0.9", "v1.0", "v1.0.1"]) expect(periksaRilis({ ...dasar, versi })).toEqual({ ok: true });
  });

  it("menolak bentuk nomor rilis lain", () => {
    for (const versi of ["v09", "0.9", "v0.9-rc", "v01.0", "V0.9", "v0.9 ", "v1", "", "v1.0.0.1"]) {
      expect(periksaRilis({ ...dasar, versi }), versi).toEqual({ ok: false, pesan: TEKS.versiSalah });
    }
  });

  it("memeriksa dalam urutan P-3: cabang, nomor rilis, catatan rilis, rahasia, lalu Database ID", () => {
    expect(periksaRilis({ ...dasar, ref: "refs/heads/fitur", versi: "salah", adaToken: false })).toEqual({ ok: false, pesan: TEKS.bukanMain });
    expect(periksaRilis({ ...dasar, versi: "salah", adaToken: false })).toEqual({ ok: false, pesan: TEKS.versiSalah });
    expect(periksaRilis({ ...dasar, versi: "v2.0", adaToken: false })).toEqual({
      ok: false,
      pesan: "Catatan rilis v2.0 belum ada di docs/jejak-setara/rilis/. Minta agen menulisnya lebih dulu.",
    });
    expect(periksaRilis({ ...dasar, adaToken: false, akar: akarKosong })).toEqual({ ok: false, pesan: TEKS.rahasiaCloudflare });
    expect(periksaRilis({ ...dasar, adaAkun: false })).toEqual({ ok: false, pesan: TEKS.rahasiaCloudflare });
    expect(periksaRilis({ ...dasar, akar: akarKosong })).toEqual({ ok: false, pesan: TEKS.idBelumDiisi });
  });

  it("idD1Produksi membaca Database ID produksi dari JSONC, atau null", () => {
    expect(idD1Produksi(wrangler(ID))).toBe(ID);
    expect(idD1Produksi(JSON.stringify({ env: { uji: {} } }))).toBeNull();
    expect(idD1Produksi("bukan json")).toBeNull();
    expect(idD1Produksi(readFileSync(new URL("../../../../server/jejak-setara/wrangler.jsonc", import.meta.url), "utf8"))).toBe(ID);
  });
});

describe("bacaJumlah, putuskanRuang, dan hitungRuangAktif (P-4 sampai P-6; AC-6)", () => {
  it("bacaJumlah membaca kolom jumlah dari keluaran wrangler --json, atau null", () => {
    expect(bacaJumlah(keluaran(0))).toBe(0);
    expect(bacaJumlah(keluaran(3))).toBe(3);
    expect(bacaJumlah(keluaran("2"))).toBe(2);
    for (const rusak of [keluaran(-1), keluaran(1.5), keluaran(null), JSON.stringify([{ results: [] }]), "bukan json", ""]) {
      expect(bacaJumlah(rusak), rusak).toBeNull();
    }
  });

  it("putuskanRuang: 0 lanjut; ada ruang berhenti kecuali darurat; tidak terbaca selalu berhenti", () => {
    expect(putuskanRuang(0, false)).toEqual({ lanjut: true, tingkat: "info", pesan: TEKS.ruangKosong });
    expect(putuskanRuang(3, false)).toEqual({
      lanjut: false,
      tingkat: "galat",
      pesan: "Ada 3 ruang produksi yang belum ditutup. Tunggu sampai kelas selesai atau tutup ruangnya dari konsol, lalu jalankan lagi.",
    });
    expect(putuskanRuang(3, true)).toEqual({
      lanjut: true,
      tingkat: "peringatan",
      pesan: "Peringatan: deploy dilanjutkan walaupun ada 3 ruang yang belum ditutup. Pemain di ruang itu akan tersambung ulang.",
    });
    for (const darurat of [false, true]) expect(putuskanRuang(null, darurat)).toEqual({ lanjut: false, tingkat: "galat", pesan: TEKS.ruangGagal });
  });

  it("hitungRuangAktif: tabel belum ada dihitung 0 tanpa kueri kedua; kueri memakai D1 produksi jarak jauh", () => {
    const panggilan: string[][] = [];
    const jalankan = (argumen: string[]) => {
      panggilan.push(argumen);
      return { status: 0, stdout: keluaran(0) };
    };
    expect(hitungRuangAktif(jalankan)).toBe(0);
    expect(panggilan).toHaveLength(1);
    expect(panggilan[0]).toEqual(expect.arrayContaining(["d1", "execute", "DB", "--command", SQL_ADA_TABEL_RUANG, "--json", ...BENDERA_PRODUKSI]));
  });

  it("hitungRuangAktif: tabel ada, lalu jumlah ruang yang belum ditutup", () => {
    const urutan = [keluaran(1), keluaran(2)];
    const panggilan: string[][] = [];
    expect(hitungRuangAktif((argumen: string[]) => (panggilan.push(argumen), { status: 0, stdout: urutan.shift() ?? "" }))).toBe(2);
    expect(panggilan[1]).toEqual(expect.arrayContaining(["--command", SQL_RUANG_AKTIF, "--remote", "--env", "produksi"]));
  });

  it("hitungRuangAktif: null bila wrangler gagal atau keluaran kedua rusak", () => {
    expect(hitungRuangAktif(() => ({ status: 1, stdout: keluaran(0) }))).toBeNull();
    const urutan = [keluaran(1), "bukan json"];
    expect(hitungRuangAktif(() => ({ status: 0, stdout: urutan.shift() ?? "" }))).toBeNull();
  });
});

describe("utama: baris perintah alur kerja produksi", () => {
  it("periksa-rilis memangkas spasi, menulis VERSI ke GITHUB_ENV, dan keluar 0; galat keluar 1 tanpa menulis", () => {
    const env = join(sementara, "github-env");
    writeFileSync(env, "");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const lingkungan = { VERSI_MASUKAN: " v0.9 ", GITHUB_REF: "refs/heads/main", CLOUDFLARE_API_TOKEN: "x", CLOUDFLARE_ACCOUNT_ID: "y", GITHUB_ENV: env };
    expect(utama(["periksa-rilis"], lingkungan)).toBe(0);
    expect(readFileSync(env, "utf8")).toBe("VERSI=v0.9\n");
    expect(utama(["periksa-rilis"], { ...lingkungan, VERSI_MASUKAN: "v0.9-rc" })).toBe(1);
    expect(log).toHaveBeenLastCalledWith(`::error::${TEKS.versiSalah}`);
    expect(readFileSync(env, "utf8")).toBe("VERSI=v0.9\n");
  });

  it("ruang-aktif: berhenti bila ada ruang; dengan darurat lanjut dengan peringatan di log dan ringkasan", () => {
    const ringkasan = join(sementara, "ringkasan");
    writeFileSync(ringkasan, "");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const dua = () => {
      const urutan = [keluaran(1), keluaran(2)];
      return () => ({ status: 0, stdout: urutan.shift() ?? "" });
    };
    expect(utama(["ruang-aktif"], { DEPLOY_DARURAT: "false", GITHUB_STEP_SUMMARY: ringkasan }, dua())).toBe(1);
    expect(log).toHaveBeenLastCalledWith(`::error::${putuskanRuang(2, false).pesan}`);
    expect(utama(["ruang-aktif"], { DEPLOY_DARURAT: "true", GITHUB_STEP_SUMMARY: ringkasan }, dua())).toBe(0);
    expect(log).toHaveBeenLastCalledWith(`::warning::${putuskanRuang(2, true).pesan}`);
    expect(readFileSync(ringkasan, "utf8")).toBe(`${putuskanRuang(2, true).pesan}\n`);
    expect(utama(["ruang-aktif"], { DEPLOY_DARURAT: "true" }, () => ({ status: 0, stdout: keluaran(0) }))).toBe(0);
    expect(log).toHaveBeenLastCalledWith(TEKS.ruangKosong);
  });

  it("perintah tidak dikenal keluar 2", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(utama(["lain"], {})).toBe(2);
  });
});

describe("teks skrip sama dengan TEKS_KONSOL (bagian Teks; AC-14)", () => {
  it("setiap teks skrip ada di TEKS_KONSOL.alurProduksi, kecuali pesan rahasia yang memakai alurAdminAwal", () => {
    const { rahasiaCloudflare, ...lain } = TEKS;
    expect(rahasiaCloudflare).toBe(TEKS_KONSOL.alurAdminAwal.rahasiaCloudflare);
    for (const [kunci, teks] of Object.entries(lain)) expect(teks, kunci).toBe(TEKS_KONSOL.alurProduksi[kunci as keyof typeof TEKS_KONSOL.alurProduksi]);
  });
});
