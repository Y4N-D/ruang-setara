// Rute ruang konsol di atas D1 tiruan (node:sqlite) dan Durable Object tiruan (spesifikasi JS-10; AC-3, AC-4, AC-5, AC-9):
// batas ruang aktif di lingkungan (termasuk dua permintaan serentak), nilai batas yang tidak sah, kesiapan paket untuk
// ruang biasa, inisialisasi yang gagal, dan tiket tanpa KUNCI_TIKET.
import { describe, expect, it } from "vitest";
import worker from "../../../../server/jejak-setara/src/index";
import { periksaTiket } from "../../../../server/jejak-setara/src/auth/tiket";
import { D1Tiruan, sqlite } from "../akun/d1Tiruan";

type Env = Parameters<typeof worker.fetch>[1];
const ASAL = "http://127.0.0.1:4310";
const KUNCI = { KUNCI_SANDI: "kunci-sandi-uji", KUNCI_IP: "kunci-ip-uji", KUNCI_ADMIN: "kunci-admin-uji", ITERASI_SANDI: "1000" };

function lingkungan(lain: Record<string, unknown> = {}, inisialisasiOk = true): { d1: D1Tiruan; env: Env; inisialisasi: unknown[] } {
  const d1 = new D1Tiruan();
  const inisialisasi: unknown[] = [];
  let n = 0;
  const RUANG = {
    newUniqueId: () => ({ toString: () => `do-${++n}` }),
    idFromString: (s: string) => s,
    get: () => ({
      fetch: async (url: string, init?: RequestInit) => {
        if (url.endsWith("/inisialisasi")) {
          inisialisasi.push(JSON.parse(String(init?.body)));
          return new Response(JSON.stringify({ ok: inisialisasiOk }), { status: inisialisasiOk ? 200 : 500 });
        }
        return new Response(
          JSON.stringify({ status: "lobi", terkunci: false, mulaiPada: null, berakhirPada: null, jedaSejak: null, pemain: [], kirimanBerhenti: true, pemakaian: PEMAKAIAN }),
        );
      },
    }),
  };
  const env = { LINGKUNGAN: "lokal", DB: d1, ASSETS: { fetch: async () => new Response("aset") }, RUANG, BATAS_MASUK: { limit: async () => ({ success: true }) }, ...KUNCI, ...lain } as unknown as Env;
  d1.basis.exec("INSERT INTO paket (id, nama, aktif) VALUES ('p-1', 'Paket uji', 1)");
  return { d1, env, inisialisasi };
}

function minta(env: Env, metode: string, jalur: string, isi?: unknown, cookie?: string, tajuk: Record<string, string> = {}): Promise<Response> {
  const h: Record<string, string> = { ...tajuk };
  if (metode !== "GET") Object.assign(h, { "X-Jejak": "1", Origin: ASAL });
  if (cookie) h.Cookie = cookie;
  return worker.fetch(new Request(ASAL + jalur, { method: metode, headers: h, body: isi === undefined ? undefined : JSON.stringify(isi) }), env);
}
const cookieDari = (j: Response) => (j.headers.get("Set-Cookie") ?? "").split(";")[0];

async function admin(env: Env): Promise<string> {
  const awal = await worker.fetch(
    new Request(`${ASAL}/api/admin-awal`, {
      method: "POST",
      headers: { "X-Jejak-Kunci-Admin": KUNCI.KUNCI_ADMIN },
      body: JSON.stringify({ email: "admin@sekolah.sch.id", sandi: "sandi-awal-12345", namaTampilan: "Admin" }),
    }),
    env,
  );
  expect(awal.status).toBe(200);
  const sementara = cookieDari(await minta(env, "POST", "/api/masuk", { email: "admin@sekolah.sch.id", sandi: "sandi-awal-12345" }));
  const j = await minta(env, "POST", "/api/sandi", { sandiBaru: "kalimat sandi admin" }, sementara);
  expect(j.status).toBe(200);
  return cookieDari(j);
}

const PEMAKAIAN = { sambungan: 3, pesanMasuk: 400, alarm: 2, barisSqlite: 120, barisD1: 30, internal: 4, perkiraanPermintaan: 29 };

const RUANG_BARU = { labelKelas: "  IX B  ", paketId: "p-1", durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, modeNomorAbsen: false, uji: true };
const buat = (env: Env, cookie: string, isi: Record<string, unknown> = {}) => minta(env, "POST", "/api/ruang", { ...RUANG_BARU, ...isi }, cookie);

describe.skipIf(!sqlite)("rute ruang di atas D1 tiruan", () => {
  it("batas ruang aktif di lingkungan: ruang ketiga dengan batas 2 dijawab 503 SERVER_PENUH (P-4)", async () => {
    const { env, inisialisasi } = lingkungan({ RUANG_AKTIF_MAKS: "2" });
    const cookie = await admin(env);
    expect((await buat(env, cookie)).status).toBe(201);
    expect((await buat(env, cookie)).status).toBe(201);
    const ketiga = await buat(env, cookie);
    expect(ketiga.status).toBe(503);
    expect(await ketiga.json()).toEqual({ galat: { kode: "SERVER_PENUH", pesan: "Server sedang penuh. Tutup ruang yang tidak dipakai atau coba lagi nanti." } });
    expect(inisialisasi).toHaveLength(2);
    expect(inisialisasi[0]).toMatchObject({ labelKelas: "IX B", pengaturan: { durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, skillAktif: ["lari", "kompas", "petunjuk"], modeNomorAbsen: false, uji: true }, kejadian: [] });
  });

  it("dua permintaan serentak dengan sisa kuota satu: tepat satu berhasil (P-4)", async () => {
    const { env } = lingkungan({ RUANG_AKTIF_MAKS: "1" });
    const cookie = await admin(env);
    const status = (await Promise.all([buat(env, cookie), buat(env, cookie)])).map((j) => j.status).sort();
    expect(status).toEqual([201, 503]);
  });

  it("nilai RUANG_AKTIF_MAKS yang tidak sah dianggap 3 (P-4)", async () => {
    for (const nilai of ["abc", "0", "1001", ""]) {
      const { env } = lingkungan({ RUANG_AKTIF_MAKS: nilai });
      const cookie = await admin(env);
      for (let i = 0; i < 3; i++) expect((await buat(env, cookie)).status, `${nilai} ke-${i}`).toBe(201);
      expect((await buat(env, cookie)).status, nilai).toBe(503);
    }
  });

  it("kesiapan paket untuk ruang biasa: semua kejadian terbit dengan rujukan terverifikasi; arsip tidak dihitung (P-3)", async () => {
    const { d1, env } = lingkungan();
    const cookie = await admin(env);
    const pilihan = async () => ((await (await minta(env, "GET", "/api/ruang/pilihan", undefined, cookie)).json()) as { paket: { siapRuangBiasa: boolean; jumlahKejadian: number }[] }).paket[0];
    expect(await pilihan()).toMatchObject({ jumlahKejadian: 0, siapRuangBiasa: false });
    const isi = (rujukan: string[]) => JSON.stringify({ kartu: { rujukan } });
    d1.basis.exec(`INSERT INTO rujukan (id, teks, sumber, status) VALUES ('JR-01', 'UUD 1945 Pasal 28H', 'UUD', 'terverifikasi'), ('JR-02', 'UU 39/1999', 'UU', 'belum')`);
    d1.basis.exec(`INSERT INTO kejadian (id, kode, status, diubah_pada) VALUES ('k-1', 'K-01', 'terbit', 1)`);
    d1.basis.exec(`INSERT INTO kejadian_versi (id, kejadian_id, nomor, isi_json, jenis, dibuat_pada) VALUES ('v-1', 'k-1', 1, '${isi(["JR-01"])}', 'terbit', 1)`);
    d1.basis.exec(`UPDATE kejadian SET versi_terbit_id = 'v-1' WHERE id = 'k-1'`);
    d1.basis.exec(`INSERT INTO paket_kejadian (paket_id, kejadian_id, urutan) VALUES ('p-1', 'k-1', 1)`);
    expect(await pilihan()).toMatchObject({ jumlahKejadian: 1, siapRuangBiasa: true });
    expect((await buat(env, cookie, { uji: false })).status).toBe(201);
    d1.basis.exec(`INSERT INTO kejadian (id, kode, status, diubah_pada) VALUES ('k-2', 'K-02', 'terbit', 1)`);
    d1.basis.exec(`INSERT INTO kejadian_versi (id, kejadian_id, nomor, isi_json, jenis, dibuat_pada) VALUES ('v-2', 'k-2', 1, '${isi(["JR-02"])}', 'terbit', 1)`);
    d1.basis.exec(`UPDATE kejadian SET versi_terbit_id = 'v-2' WHERE id = 'k-2'`);
    d1.basis.exec(`INSERT INTO paket_kejadian (paket_id, kejadian_id, urutan) VALUES ('p-1', 'k-2', 2)`);
    expect(await pilihan()).toMatchObject({ jumlahKejadian: 2, siapRuangBiasa: false });
    d1.basis.exec(`UPDATE kejadian SET status = 'arsip' WHERE id = 'k-2'`);
    expect(await pilihan()).toMatchObject({ jumlahKejadian: 1, siapRuangBiasa: true });
    d1.basis.exec(`INSERT INTO kejadian (id, kode, status, diubah_pada) VALUES ('k-3', 'K-03', 'draf', 1)`);
    d1.basis.exec(`INSERT INTO paket_kejadian (paket_id, kejadian_id, urutan) VALUES ('p-1', 'k-3', 3)`);
    expect(await pilihan()).toMatchObject({ jumlahKejadian: 2, siapRuangBiasa: false });
    const tolak = await buat(env, cookie, { uji: false });
    expect(tolak.status).toBe(409);
  });

  it("inisialisasi Durable Object gagal: 503 RUANG_GAGAL_DIBUAT dan baris D1 ditandai ditutup (P-5)", async () => {
    const { d1, env } = lingkungan({}, false);
    const cookie = await admin(env);
    const j = await buat(env, cookie);
    expect(j.status).toBe(503);
    expect(await j.json()).toEqual({ galat: { kode: "RUANG_GAGAL_DIBUAT", pesan: "Ruang gagal dibuat. Coba lagi." } });
    expect(d1.basis.prepare("SELECT status FROM ruang").all()).toEqual([{ status: "ditutup" }]);
  });

  it("tiket: tanpa KUNCI_TIKET 503 KONSOL_BELUM_SIAP; dengan kunci tiket sah untuk ruang itu (P-12)", async () => {
    const tanpa = lingkungan();
    const c1 = await admin(tanpa.env);
    const r1 = ((await (await buat(tanpa.env, c1)).json()) as { ruang: { id: string } }).ruang.id;
    expect((await minta(tanpa.env, "POST", `/api/ruang/${r1}/tiket`, {}, c1)).status).toBe(503);
    const dengan = lingkungan({ KUNCI_TIKET: "kunci-tiket-uji" });
    const c2 = await admin(dengan.env);
    const r2 = ((await (await buat(dengan.env, c2)).json()) as { ruang: { id: string } }).ruang.id;
    const j = await minta(dengan.env, "POST", `/api/ruang/${r2}/tiket`, {}, c2);
    expect(j.status).toBe(200);
    const { tiket } = (await j.json()) as { tiket: string };
    expect((await periksaTiket("kunci-tiket-uji", tiket, r2, Date.now())).ok).toBe(true);
  });

  it("JS-22 (P-17, P-18): pemakaian hanya untuk admin, dari ruang yang berjalan atau dari ringkasan_json; kirimanBerhenti untuk keduanya", async () => {
    const { d1, env } = lingkungan();
    const admin1 = await admin(env);
    const akun = await minta(env, "POST", "/api/akun", { email: "guru@sekolah.sch.id", namaTampilan: "Bu Sari", peran: "guru", peninjau: false }, admin1);
    expect(akun.status).toBe(201);
    const { sandiSementara } = (await akun.json()) as { sandiSementara: string };
    const sementara = cookieDari(await minta(env, "POST", "/api/masuk", { email: "guru@sekolah.sch.id", sandi: sandiSementara }));
    const guru = cookieDari(await minta(env, "POST", "/api/sandi", { sandiBaru: "kalimat sandi guru uji" }, sementara));
    const id = ((await (await buat(env, guru)).json()) as { ruang: { id: string } }).ruang.id;
    const lihat = async (cookie: string) => (await (await minta(env, "GET", `/api/ruang/${id}`, undefined, cookie)).json()) as Record<string, unknown>;
    const olehAdmin = await lihat(admin1);
    expect(olehAdmin.pemakaian).toEqual(PEMAKAIAN);
    expect((olehAdmin.langsung as Record<string, unknown>).kirimanBerhenti).toBe(true);
    expect((olehAdmin.langsung as Record<string, unknown>).pemakaian).toBeUndefined();
    const olehGuru = await lihat(guru);
    expect(olehGuru.pemakaian).toBeNull();
    expect((olehGuru.langsung as Record<string, unknown>).kirimanBerhenti).toBe(true);
    d1.basis.prepare("UPDATE ruang SET status = 'ditutup', ringkasan_json = ? WHERE id = ?").run(JSON.stringify({ pemakaian: { ...PEMAKAIAN, alarm: 5 } }), id);
    const ditutup = await lihat(admin1);
    expect(ditutup.langsung).toBeNull();
    expect(ditutup.pemakaian).toEqual({ ...PEMAKAIAN, alarm: 5 });
    expect((await lihat(guru)).pemakaian).toBeNull();
  });
});
