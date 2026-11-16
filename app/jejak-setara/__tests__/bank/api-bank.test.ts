// Rute bank kejadian di atas D1 tiruan (spesifikasi JS-12; AC-1, AC-5 sampai AC-7, AC-9 sampai AC-12, AC-14).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import worker from "../../../../server/jejak-setara/src/index";
import type { IsiKejadian } from "../../inti/tipe";
import { D1Tiruan, sqlite } from "../akun/d1Tiruan";

type Env = Parameters<typeof worker.fetch>[1];
const ASAL = "http://127.0.0.1:4310";
const KUNCI = { KUNCI_SANDI: "kunci-sandi-uji", KUNCI_IP: "kunci-ip-uji", KUNCI_ADMIN: "kunci-admin-uji", ITERASI_SANDI: "1000" };
const BANK = JSON.parse(readFileSync(new URL("../../../../server/jejak-setara/seed/bank-awal.json", import.meta.url), "utf8")) as {
  rujukan: { id: string; teks: string; sumber: string; kodeSehari: string | null; catatan: string }[];
  kejadian: IsiKejadian[];
};

function lingkungan() {
  const d1 = new D1Tiruan();
  for (const r of BANK.rujukan) d1.basis.prepare("INSERT INTO rujukan (id, teks, sumber, status, catatan, kode_sehari) VALUES (?, ?, ?, 'belum', ?, ?)").run(r.id, r.teks, r.sumber, r.catatan, r.kodeSehari);
  BANK.kejadian.slice(0, 3).forEach((isi, i) => {
    d1.basis.prepare("INSERT INTO kejadian (id, kode, status, versi_terbit_id, pemilik_id, diubah_pada) VALUES (?, ?, 'tinjau', NULL, NULL, 1000)").run(`k-${i}`, isi.kode);
    d1.basis.prepare("INSERT INTO kejadian_versi (id, kejadian_id, nomor, isi_json, jenis, dibuat_oleh, dibuat_pada, catatan_perubahan) VALUES (?, ?, 1, ?, 'kerja', NULL, 1000, NULL)").run(`v-${i}`, `k-${i}`, JSON.stringify(isi));
  });
  d1.basis.exec("INSERT INTO paket (id, nama, deskripsi, aktif) VALUES ('00000000-0000-4000-8000-000000000001', 'Paket uji', '', 1)");
  ["k-0", "k-1", "k-2"].forEach((id, i) => d1.basis.prepare("INSERT INTO paket_kejadian (paket_id, kejadian_id, urutan) VALUES ('00000000-0000-4000-8000-000000000001', ?, ?)").run(id, i + 1));
  const env = { LINGKUNGAN: "lokal", DB: d1, ASSETS: { fetch: async () => new Response("aset") }, RUANG: {}, BATAS_MASUK: { limit: async () => ({ success: true }) }, ...KUNCI } as unknown as Env;
  return { d1, env };
}

function minta(env: Env, metode: string, jalur: string, isi?: unknown, cookie?: string): Promise<Response> {
  const h: Record<string, string> = {};
  if (metode !== "GET") Object.assign(h, { "X-Jejak": "1", Origin: ASAL });
  if (cookie) h.Cookie = cookie;
  return worker.fetch(new Request(ASAL + jalur, { method: metode, headers: h, body: isi === undefined ? undefined : JSON.stringify(isi) }), env);
}
const cookieDari = (j: Response) => (j.headers.get("Set-Cookie") ?? "").split(";")[0];
async function json(j: Response | Promise<Response>) {
  return (await (await j).json()) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

async function siapkanAkun(env: Env) {
  const awal = await worker.fetch(
    new Request(`${ASAL}/api/admin-awal`, { method: "POST", headers: { "X-Jejak-Kunci-Admin": KUNCI.KUNCI_ADMIN }, body: JSON.stringify({ email: "admin@sekolah.sch.id", sandi: "sandi-awal-12345", namaTampilan: "Admin" }) }),
    env,
  );
  expect(awal.status).toBe(200);
  const s1 = cookieDari(await minta(env, "POST", "/api/masuk", { email: "admin@sekolah.sch.id", sandi: "sandi-awal-12345" }));
  const admin = cookieDari(await minta(env, "POST", "/api/sandi", { sandiBaru: "kalimat sandi admin" }, s1));
  const akun = await json(minta(env, "POST", "/api/akun", { email: "guru@sekolah.sch.id", namaTampilan: "Bu Sari", peran: "guru", peninjau: false }, admin));
  const s2 = cookieDari(await minta(env, "POST", "/api/masuk", { email: "guru@sekolah.sch.id", sandi: akun.sandiSementara }));
  const guru = cookieDari(await minta(env, "POST", "/api/sandi", { sandiBaru: "kalimat sandi guru uji" }, s2));
  return { admin, guru };
}

const ubahJudul = (isi: IsiKejadian, judul: string): IsiKejadian => ({ ...isi, judul });

describe.skipIf(!sqlite)("rute bank di atas D1 tiruan", () => {
  it("daftar, detail, simpan dengan bentrok dan temuan, terbit dengan syarat rujukan, versi, dan riwayat", async () => {
    const { d1, env } = lingkungan();
    const { admin } = await siapkanAkun(env);
    const daftar = await json(minta(env, "GET", "/api/kejadian", undefined, admin));
    expect(daftar.kejadian.map((k: { kode: string }) => k.kode)).toEqual(["K-01", "K-02", "K-03"]);
    expect(daftar.kejadian[0]).toMatchObject({ status: "tinjau", pemilik: null, milikSaya: false, adaPerubahan: false });
    expect(daftar.kejadian[0].rujukanBelum).toBe(BANK.kejadian[0].kartu.rujukan.length);

    const d = await json(minta(env, "GET", "/api/kejadian/K-01", undefined, admin));
    expect(d.bolehSunting).toBe(true);
    expect(d.aksi).toEqual(["kembalikan", "terbitkan", "arsipkan", "hapus"]);
    expect(d.temuan.filter((t: { tingkat: string }) => t.tingkat === "galat")).toEqual([]);

    const bentrok = await minta(env, "PUT", "/api/kejadian/K-01/kerja", { isi: ubahJudul(BANK.kejadian[0], "Judul baru"), diubahPada: 999 }, admin);
    expect(bentrok.status).toBe(409);
    expect((await json(bentrok)).galat.kode).toBe("SUDAH_DIUBAH");
    const salah = await json(minta(env, "PUT", "/api/kejadian/K-01/kerja", { isi: ubahJudul(BANK.kejadian[0], "J".repeat(40)), diubahPada: d.kerja.diubahPada }, admin));
    expect(salah.galat.kode).toBe("TEMUAN");
    expect(salah.temuan.some((t: { kode: string; letak: string }) => t.kode === "TEKS_PANJANG" && t.letak === "K-01/judul")).toBe(true);
    const ok = await json(minta(env, "PUT", "/api/kejadian/K-01/kerja", { isi: ubahJudul(BANK.kejadian[0], "Judul baru"), diubahPada: d.kerja.diubahPada }, admin));
    expect(ok.kode).toBe("K-01");

    const belum = await minta(env, "POST", "/api/kejadian/K-01/aksi", { aksi: "terbitkan", catatan: "Terbit pertama" }, admin);
    expect(belum.status).toBe(409);
    expect((await json(belum)).rujukanBelum).toEqual(BANK.kejadian[0].kartu.rujukan);
    // Admin tanpa tanda Peninjau tidak bisa memverifikasi.
    expect((await minta(env, "POST", `/api/rujukan/${BANK.kejadian[0].kartu.rujukan[0]}/verifikasi`, { terverifikasi: true }, admin)).status).toBe(403);
    d1.basis.exec("UPDATE pengguna SET peninjau = 1 WHERE email = 'admin@sekolah.sch.id'");
    for (const id of BANK.kejadian[0].kartu.rujukan) {
      const v = await json(minta(env, "POST", `/api/rujukan/${id}/verifikasi`, { terverifikasi: true }, admin));
      expect(v.rujukan).toMatchObject({ id, status: "terverifikasi", diverifikasiOleh: "Admin" });
    }
    expect((await minta(env, "POST", "/api/kejadian/K-01/aksi", { aksi: "terbitkan", catatan: "  " }, admin)).status).toBe(400);
    expect(await json(minta(env, "POST", "/api/kejadian/K-01/aksi", { aksi: "terbitkan", catatan: "Terbit pertama" }, admin))).toEqual({ kode: "K-01", status: "terbit", nomor: 1 });
    const sesudah = await json(minta(env, "GET", "/api/kejadian/K-01", undefined, admin));
    expect(sesudah.kejadian).toMatchObject({ status: "terbit", adaPerubahan: false });
    expect(sesudah.riwayat).toMatchObject([{ nomor: 1, penerbit: "Admin", catatan: "Terbit pertama" }]);
    expect(sesudah.aksi).toEqual(["arsipkan"]);
    expect((await minta(env, "POST", "/api/kejadian/K-01/aksi", { aksi: "terbitkan", catatan: "Lagi" }, admin)).status).toBe(409);
    await minta(env, "PUT", "/api/kejadian/K-01/kerja", { isi: ubahJudul(BANK.kejadian[0], "Judul kedua"), diubahPada: sesudah.kerja.diubahPada }, admin);
    expect((await json(minta(env, "GET", "/api/kejadian", undefined, admin))).kejadian[0]).toMatchObject({ status: "terbit", adaPerubahan: true });
    expect((await json(minta(env, "POST", "/api/kejadian/K-01/aksi", { aksi: "terbitkan", catatan: "Judul diperbaiki" }, admin))).nomor).toBe(2);
    expect((await json(minta(env, "GET", "/api/kejadian/K-01/versi/1", undefined, admin))).isi.judul).toBe("Judul baru");

    // Ubah teks rujukan terverifikasi membatalkan verifikasi (P-18).
    const r0 = BANK.rujukan.find((r) => r.id === BANK.kejadian[0].kartu.rujukan[0])!;
    const ubah = await json(minta(env, "PUT", `/api/rujukan/${r0.id}`, { teks: r0.teks + " Diubah.", sumber: r0.sumber, catatan: r0.catatan, kodeSehari: r0.kodeSehari }, admin));
    expect(ubah.rujukan).toMatchObject({ status: "belum", diverifikasiOleh: null });
    const audit = d1.basis.prepare("SELECT aksi, rincian_json FROM log_audit ORDER BY waktu").all() as { aksi: string; rincian_json: string }[];
    expect(audit.map((a) => a.aksi)).toEqual(expect.arrayContaining(["kejadian.simpan", "rujukan.verifikasi", "kejadian.terbitkan", "rujukan.ubah"]));
    expect(audit.every((a) => !a.rincian_json.includes("Judul"))).toBe(true);
  });

  it("guru: membuat kejadian sendiri (kode berikutnya), tidak menyunting bank awal, tidak menerbitkan; rujukan dan paket", async () => {
    const { d1, env } = lingkungan();
    const { admin, guru } = await siapkanAkun(env);
    const baru = await minta(env, "POST", "/api/kejadian", { isi: { ...BANK.kejadian[0], kode: "K-00", judul: "Kejadian guru" } }, guru);
    expect(baru.status).toBe(201);
    expect((await json(baru)).kode).toBe("K-04");
    const d = await json(minta(env, "GET", "/api/kejadian/K-04", undefined, guru));
    expect(d.kejadian).toMatchObject({ status: "draf", milikSaya: true, pemilik: "Bu Sari" });
    expect(d.aksi).toEqual(["ajukan", "hapus"]);
    const awal = await json(minta(env, "GET", "/api/kejadian/K-02", undefined, guru));
    expect(awal.bolehSunting).toBe(false);
    expect((await minta(env, "PUT", "/api/kejadian/K-02/kerja", { isi: BANK.kejadian[1], diubahPada: awal.kerja.diubahPada }, guru)).status).toBe(403);
    expect((await minta(env, "POST", "/api/kejadian/K-04/aksi", { aksi: "terbitkan", catatan: "x" }, guru)).status).toBe(403);
    expect((await minta(env, "POST", "/api/kejadian/K-02/aksi", { aksi: "arsipkan" }, guru)).status).toBe(403);
    expect((await json(minta(env, "POST", "/api/kejadian/K-04/aksi", { aksi: "ajukan" }, guru))).status).toBe("tinjau");
    expect((await minta(env, "POST", "/api/kejadian/K-04/aksi", { aksi: "ajukan" }, guru)).status).toBe(409);

    // Rujukan: guru menambah, tidak mengubah (D-1).
    const r = await minta(env, "POST", "/api/rujukan", { teks: "Rujukan baru dari guru.", sumber: "https://jdih.contoh.go.id/1", catatan: "Ditambahkan guru untuk kejadian baru.", kodeSehari: null }, guru);
    expect(r.status).toBe(201);
    const id = (await json(r)).rujukan.id as string;
    expect(id).toBe(`JR-${String(BANK.rujukan.length + 1).padStart(2, "0")}`);
    expect((await minta(env, "PUT", `/api/rujukan/${id}`, { teks: "Teks lain.", sumber: "https://a.go.id", catatan: "Catatan.", kodeSehari: null }, guru)).status).toBe(403);
    expect((await minta(env, "DELETE", `/api/rujukan/${BANK.kejadian[0].kartu.rujukan[0]}`, undefined, admin)).status).toBe(409);
    expect((await minta(env, "DELETE", `/api/rujukan/${id}`, undefined, admin)).status).toBe(200);

    // Paket: hanya admin; kejadian draf ditolak; nama unik; arsip mengeluarkan dari paket.
    expect((await minta(env, "GET", "/api/paket", undefined, guru)).status).toBe(403);
    const daftarPaket = await json(minta(env, "GET", "/api/paket", undefined, admin));
    expect(daftarPaket.paket).toMatchObject([{ nama: "Paket uji", jumlah: 3, aktif: true, siapRuangBiasa: false }]);
    await minta(env, "POST", "/api/kejadian/K-04/aksi", { aksi: "kembalikan" }, admin);
    const tolak = await json(minta(env, "POST", "/api/paket", { nama: "Paket dua", deskripsi: "Dua kejadian", aktif: true, kejadian: ["K-01", "K-04"] }, admin));
    expect(tolak.galat.kode).toBe("TEMUAN");
    expect(tolak.temuan).toMatchObject([{ kode: "PAKET_KEJADIAN_TIDAK_ADA", letak: "paket/kejadian.1" }]);
    expect((await minta(env, "POST", "/api/paket", { nama: "Paket uji", deskripsi: "Nama sama", aktif: true, kejadian: ["K-01"] }, admin)).status).toBe(409);
    const p2 = await minta(env, "POST", "/api/paket", { nama: "Paket dua", deskripsi: "Dua kejadian", aktif: true, kejadian: ["K-02", "K-01"] }, admin);
    expect(p2.status).toBe(201);
    const p2id = (await json(p2)).id as string;
    expect((await json(minta(env, "GET", `/api/paket/${p2id}`, undefined, admin))).kejadian.map((k: { kode: string }) => k.kode)).toEqual(["K-02", "K-01"]);
    expect((await json(minta(env, "POST", "/api/kejadian/K-02/aksi", { aksi: "arsipkan" }, admin))).status).toBe("arsip");
    expect((await json(minta(env, "GET", `/api/paket/${p2id}`, undefined, admin))).kejadian.map((k: { kode: string }) => k.kode)).toEqual(["K-01"]);
    expect((await json(minta(env, "POST", "/api/kejadian/K-02/aksi", { aksi: "pulihkan" }, admin))).status).toBe("draf");
    // Hapus draf milik guru yang belum pernah terbit.
    expect((await json(minta(env, "POST", "/api/kejadian/K-04/aksi", { aksi: "hapus" }, guru))).status).toBeNull();
    expect((await minta(env, "GET", "/api/kejadian/K-04", undefined, guru)).status).toBe(404);
    expect(d1.basis.prepare("SELECT COUNT(*) AS n FROM kejadian_versi WHERE kejadian_id NOT IN (SELECT id FROM kejadian)").get()).toEqual({ n: 0 });
  });

  it("dua pembuatan serentak mendapat kode berbeda (P-7)", async () => {
    const { env } = lingkungan();
    const { admin } = await siapkanAkun(env);
    const isi = { ...BANK.kejadian[0], kode: "K-00" };
    const hasil = await Promise.all([minta(env, "POST", "/api/kejadian", { isi }, admin), minta(env, "POST", "/api/kejadian", { isi }, admin)]);
    const kode = await Promise.all(hasil.map(async (j) => (await json(j)).kode as string));
    expect(new Set(kode).size).toBe(2);
  });
});
