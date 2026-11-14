// Rute akun di atas D1 tiruan (node:sqlite) dan binding tiruan (spesifikasi JS-04, rencana uji api-akun): hal yang
// sulit diuji lewat server lokal. KUNCI_ADMIN kosong (P-28), kunci Worker kosong dan ITERASI_SANDI tidak sah (P-34),
// binding pembatas yang gagal (P-14), jumlah hash per permintaan (P-3), hash ulang (P-2), admin terakhir saat dua
// perubahan datang bersamaan (P-25), sandi yang tidak tersimpan (P-5), log audit (P-26), dan pembersihan harian (P-35).
// AC-1, AC-2, AC-8, AC-9, AC-11, AC-12. Iterasi diturunkan ke 1.000 agar uji cepat; jumlah hash tidak bergantung padanya.
import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POLA_SANDI_SEMENTARA } from "../../../../server/jejak-setara/src/auth/sandi";
import worker from "../../../../server/jejak-setara/src/index";
import { TAJUK_JSON } from "../../../../server/jejak-setara/src/keamanan";
import { TEKS_KONSOL } from "../../teks-konsol";
import { D1Tiruan, sqlite } from "./d1Tiruan";

type Env = Parameters<typeof worker.fetch>[1];

const ASAL = "http://127.0.0.1:4310";
const KUNCI = { KUNCI_SANDI: "kunci-sandi-uji", KUNCI_IP: "kunci-ip-uji", KUNCI_ADMIN: "kunci-admin-uji", ITERASI_SANDI: "1000" };
const SANDI_AWAL = "sandi-awal-12345";
const SANDI_ADMIN = "kalimat sandi admin";

function lingkungan(lain: Record<string, unknown> = {}): { d1: D1Tiruan; env: Env } {
  const d1 = new D1Tiruan();
  const env = {
    LINGKUNGAN: "lokal",
    DB: d1,
    ASSETS: { fetch: async () => new Response("aset") },
    RUANG: {},
    BATAS_MASUK: { limit: async () => ({ success: true }) },
    ...KUNCI,
    ...lain,
  } as unknown as Env;
  return { d1, env };
}

interface Opsi {
  isi?: unknown;
  cookie?: string | null;
  tajuk?: Record<string, string>;
  tanpaCsrf?: boolean;
}

function minta(env: Env, metode: string, jalur: string, opsi: Opsi = {}): Promise<Response> {
  const tajuk: Record<string, string> = {};
  if (metode !== "GET" && !opsi.tanpaCsrf) Object.assign(tajuk, { "X-Jejak": "1", Origin: ASAL });
  if (opsi.cookie) tajuk.Cookie = opsi.cookie;
  Object.assign(tajuk, opsi.tajuk);
  const body = opsi.isi === undefined ? undefined : typeof opsi.isi === "string" ? opsi.isi : JSON.stringify(opsi.isi);
  return worker.fetch(new Request(ASAL + jalur, { method: metode, headers: tajuk, body }), env);
}

const cookieDari = (j: Response) => (j.headers.get("Set-Cookie") ?? "").split(";")[0];
const galat = async (j: Response) => ((await j.json()) as { galat: { kode: string; pesan: string } }).galat;

function adminAwal(env: Env, email = "admin@sekolah.sch.id", sandi = SANDI_AWAL, nama = "Admin") {
  return minta(env, "POST", "/api/admin-awal", { tanpaCsrf: true, tajuk: { "X-Jejak-Kunci-Admin": KUNCI.KUNCI_ADMIN }, isi: { email, sandi, namaTampilan: nama } });
}

async function masuk(env: Env, email: string, sandi: string): Promise<string> {
  const j = await minta(env, "POST", "/api/masuk", { isi: { email, sandi } });
  expect(j.status, `masuk ${email}`).toBe(200);
  return cookieDari(j);
}

/** Admin siap pakai: dibuat lewat admin awal, masuk, lalu mengganti sandi sementara. */
async function adminSiap(env: Env, email = "admin@sekolah.sch.id"): Promise<string> {
  expect((await adminAwal(env, email)).status).toBe(200);
  const sementara = await masuk(env, email, SANDI_AWAL);
  const j = await minta(env, "POST", "/api/sandi", { cookie: sementara, isi: { sandiBaru: SANDI_ADMIN } });
  expect(j.status).toBe(200);
  return cookieDari(j);
}

async function buatGuru(env: Env, cookieAdmin: string, email = "guru@sekolah.sch.id", peran = "guru"): Promise<{ id: string; sandi: string }> {
  const j = await minta(env, "POST", "/api/akun", { cookie: cookieAdmin, isi: { email, namaTampilan: "Bu Sari", peran, peninjau: false } });
  expect(j.status).toBe(201);
  const isi = (await j.json()) as { akun: { id: string }; sandiSementara: string };
  return { id: isi.akun.id, sandi: isi.sandiSementara };
}

/** Jumlah PBKDF2 selama `kerja` (P-3), dihitung lewat WebCrypto yang dipakai auth/sandi.ts. */
async function hitungHash(kerja: () => Promise<unknown>): Promise<number> {
  const mata = vi.spyOn(webcrypto.subtle, "deriveBits");
  try {
    await kerja();
    return mata.mock.calls.length;
  } finally {
    mata.mockRestore();
  }
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

if (!sqlite) it.skip("Dilewati: node:sqlite tidak tersedia (perlu Node 22.13 atau lebih baru).", () => {});

describe.skipIf(!sqlite)("admin awal tanpa KUNCI_ADMIN dan dengan kunci salah (P-28, AC-9)", () => {
  it("tanpa KUNCI_ADMIN: 404 BELUM_TERSEDIA untuk metode apa pun, tanpa menyentuh D1", async () => {
    const { d1, env } = lingkungan({ KUNCI_ADMIN: undefined });
    for (const metode of ["POST", "GET", "PUT"]) {
      const j = await minta(env, metode, "/api/admin-awal", { tanpaCsrf: true, tajuk: { "X-Jejak-Kunci-Admin": "apa saja" } });
      expect(j.status).toBe(404);
      expect(await j.json()).toEqual({ galat: { kode: "BELUM_TERSEDIA", pesan: "Fitur ini belum tersedia." } });
    }
    expect(d1.jumlahKueri).toBe(0);
  });

  it("kunci salah atau tidak ada: 403 KUNCI_ADMIN_SALAH; metode lain 405", async () => {
    const { d1, env } = lingkungan();
    for (const tajuk of [{ "X-Jejak-Kunci-Admin": "kunci-salah" }, {} as Record<string, string>]) {
      const j = await minta(env, "POST", "/api/admin-awal", { tanpaCsrf: true, tajuk, isi: { email: "a@b.id", sandi: SANDI_AWAL, namaTampilan: "A" } });
      expect(j.status).toBe(403);
      expect(await galat(j)).toEqual({ kode: "KUNCI_ADMIN_SALAH", pesan: "Kunci admin awal tidak cocok." });
    }
    const salahMetode = await minta(env, "GET", "/api/admin-awal");
    expect(salahMetode.status).toBe(405);
    expect(salahMetode.headers.get("Allow")).toBe("POST");
    expect(d1.jumlahKueri).toBe(0);
  });
});

describe.skipIf(!sqlite)("kunci Worker belum siap (P-34, AC-11)", () => {
  it.each([
    ["KUNCI_SANDI tidak ada", { KUNCI_SANDI: undefined }],
    ["KUNCI_IP kosong", { KUNCI_IP: "" }],
    ["ITERASI_SANDI tidak ada", { ITERASI_SANDI: undefined }],
    ["ITERASI_SANDI 999", { ITERASI_SANDI: "999" }],
    ["ITERASI_SANDI 100001", { ITERASI_SANDI: "100001" }],
    ["ITERASI_SANDI bukan angka", { ITERASI_SANDI: "lima belas ribu" }],
  ])("%s: rute yang memakai kunci menjawab 503; rute lain tetap berjalan", async (_nama, ubahan) => {
    const { env } = lingkungan();
    const admin = await adminSiap(env);
    const guru = await buatGuru(env, admin);
    const rusak = { ...env, ...ubahan } as Env;
    const belumSiap = { kode: "KONSOL_BELUM_SIAP", pesan: TEKS_KONSOL.galat.KONSOL_BELUM_SIAP };
    expect(belumSiap.pesan).toBe("Konsol belum siap. Coba lagi beberapa menit lagi.");

    const harus503 = [
      await minta(rusak, "POST", "/api/masuk", { isi: { email: "admin@sekolah.sch.id", sandi: SANDI_ADMIN } }),
      await minta(rusak, "POST", "/api/sandi", { cookie: admin, isi: { sandiLama: SANDI_ADMIN, sandiBaru: "kalimat sandi baru" } }),
      await minta(rusak, "POST", "/api/akun", { cookie: admin, isi: { email: "lain@sekolah.sch.id", namaTampilan: "Lain", peran: "guru", peninjau: false } }),
      await minta(rusak, "PATCH", `/api/akun/${guru.id}`, { cookie: admin, isi: { aturUlangSandi: true } }),
      await adminAwal(rusak),
    ];
    for (const j of harus503) {
      expect(j.status).toBe(503);
      expect(await galat(j)).toEqual(belumSiap);
    }

    expect(await (await minta(rusak, "GET", "/api/saya", { cookie: admin })).json()).toMatchObject({ masuk: true });
    expect((await minta(rusak, "GET", "/api/akun", { cookie: admin })).status).toBe(200);
    expect(await (await minta(rusak, "GET", "/api/dasbor", { cookie: admin })).json()).toEqual({ rujukanBelum: 0 });
    expect((await minta(rusak, "PATCH", `/api/akun/${guru.id}`, { cookie: admin, isi: { namaTampilan: "Bu Sari W." } })).status).toBe(200);
    expect((await minta(rusak, "POST", "/api/keluar", { cookie: admin })).status).toBe(200);
  });
});

describe.skipIf(!sqlite)("binding BATAS_MASUK (P-14)", () => {
  it("melewati batas: 429 TERLALU_SERING sebelum D1 disentuh, untuk masuk, ganti sandi, dan admin awal", async () => {
    const kunci: string[] = [];
    const { d1, env } = lingkungan({
      BATAS_MASUK: {
        limit: async ({ key }: { key: string }) => {
          kunci.push(key);
          return { success: false };
        },
      },
    });
    const tajuk = { "CF-Connecting-IP": "203.0.113.9" };
    const jawaban = [
      await minta(env, "POST", "/api/masuk", { tajuk, isi: { email: "a@b.id", sandi: "x" } }),
      await minta(env, "POST", "/api/sandi", { tajuk, isi: { sandiBaru: "x" } }),
      await minta(env, "POST", "/api/admin-awal", { tanpaCsrf: true, tajuk: { ...tajuk, "X-Jejak-Kunci-Admin": KUNCI.KUNCI_ADMIN }, isi: {} }),
    ];
    for (const j of jawaban) {
      expect(j.status).toBe(429);
      expect(await galat(j)).toEqual({ kode: "TERLALU_SERING", pesan: "Terlalu banyak percobaan. Tunggu sebentar." });
    }
    expect(kunci).toEqual(["203.0.113.9", "203.0.113.9", "203.0.113.9"]);
    expect(d1.jumlahKueri).toBe(0);
  });

  it("binding yang gagal dipanggil: permintaan diteruskan", async () => {
    const { env } = lingkungan({
      BATAS_MASUK: {
        limit: async () => {
          throw new Error("binding tidak tersedia");
        },
      },
    });
    expect((await adminAwal(env)).status).toBe(200);
    expect((await minta(env, "POST", "/api/masuk", { isi: { email: "admin@sekolah.sch.id", sandi: "salah-sandi-ini" } })).status).toBe(401);
    expect((await minta(env, "POST", "/api/masuk", { isi: { email: "admin@sekolah.sch.id", sandi: SANDI_AWAL } })).status).toBe(200);
  });
});

describe.skipIf(!sqlite)("jumlah hash per permintaan (P-3, AC-1)", () => {
  it("sesuai tabel P-3", async () => {
    const { d1, env } = lingkungan();
    expect(await hitungHash(() => adminAwal(env))).toBe(1);
    let cookie = "";
    expect(
      await hitungHash(async () => {
        cookie = await masuk(env, "admin@sekolah.sch.id", SANDI_AWAL);
      }),
    ).toBe(1);
    // Ganti sandi wajib: memastikan berbeda dari sandi sementara, lalu hash baru.
    expect(
      await hitungHash(async () => {
        const j = await minta(env, "POST", "/api/sandi", { cookie, isi: { sandiBaru: SANDI_ADMIN } });
        expect(j.status).toBe(200);
        cookie = cookieDari(j);
      }),
    ).toBe(2);
    // Ganti sandi sukarela: mencocokkan sandi sekarang, lalu hash baru.
    expect(
      await hitungHash(async () => {
        const j = await minta(env, "POST", "/api/sandi", { cookie, isi: { sandiLama: SANDI_ADMIN, sandiBaru: "kalimat sandi kedua" } });
        expect(j.status).toBe(200);
        cookie = cookieDari(j);
      }),
    ).toBe(2);
    let guru = { id: "", sandi: "" };
    expect(
      await hitungHash(async () => {
        guru = await buatGuru(env, cookie);
      }),
    ).toBe(1);
    expect(await hitungHash(() => minta(env, "PATCH", `/api/akun/${guru.id}`, { cookie, isi: { aturUlangSandi: true } }))).toBe(1);

    // Email tidak terdaftar dan akun nonaktif: satu hash tiruan.
    expect(await hitungHash(() => minta(env, "POST", "/api/masuk", { isi: { email: "tidak-ada@sekolah.sch.id", sandi: "apa saja 123" } }))).toBe(1);
    expect((await minta(env, "PATCH", `/api/akun/${guru.id}`, { cookie, isi: { aktif: false } })).status).toBe(200);
    expect(await hitungHash(() => minta(env, "POST", "/api/masuk", { isi: { email: "guru@sekolah.sch.id", sandi: "apa saja 123" } }))).toBe(1);

    // Isi yang tidak memenuhi aturan: 401 tanpa hash.
    expect(await hitungHash(() => minta(env, "POST", "/api/masuk", { isi: { email: "bukan-email", sandi: "x" } }))).toBe(0);
    // Selama terkunci: tanpa hash.
    for (let i = 0; i < 5; i++) await minta(env, "POST", "/api/masuk", { isi: { email: "kunci@sekolah.sch.id", sandi: "salah salah" } });
    const terkunci = await hitungHash(async () => {
      const j = await minta(env, "POST", "/api/masuk", { isi: { email: "kunci@sekolah.sch.id", sandi: "salah salah" } });
      expect(j.status).toBe(429);
    });
    expect(terkunci).toBe(0);
    d1.jalankan("DELETE FROM batas_masuk");

    // Permintaan lain: tanpa hash.
    const lain = await hitungHash(async () => {
      await minta(env, "GET", "/api/saya", { cookie });
      await minta(env, "GET", "/api/akun", { cookie });
      await minta(env, "GET", "/api/dasbor", { cookie });
      await minta(env, "PATCH", `/api/akun/${guru.id}`, { cookie, isi: { namaTampilan: "Bu Sari W.", aktif: true } });
      await minta(env, "POST", "/api/keluar", { cookie });
    });
    expect(lain).toBe(0);
  });
});

describe.skipIf(!sqlite)("hash ulang saat masuk (P-2, AC-1)", () => {
  it("iterasi akun di bawah target: dua hash, lalu iterasi dan garam baru; masuk berikutnya satu hash", async () => {
    const { d1, env } = lingkungan();
    await adminAwal(env);
    const lama = d1.baris<{ garam: string; iterasi: number }>("SELECT garam, iterasi FROM pengguna")[0];
    expect(lama.iterasi).toBe(1_000);
    const naik = { ...env, ITERASI_SANDI: "2000" } as Env;
    expect(await hitungHash(() => masuk(naik, "admin@sekolah.sch.id", SANDI_AWAL))).toBe(2);
    const baru = d1.baris<{ garam: string; iterasi: number; wajib_ganti_sandi: number }>("SELECT garam, iterasi, wajib_ganti_sandi FROM pengguna")[0];
    expect(baru.iterasi).toBe(2_000);
    expect(baru.garam).not.toBe(lama.garam);
    expect(baru.wajib_ganti_sandi).toBe(1);
    expect(await hitungHash(() => masuk(naik, "admin@sekolah.sch.id", SANDI_AWAL))).toBe(1);
  });

  it("iterasi akun di atas target tidak diubah", async () => {
    const { d1, env } = lingkungan({ ITERASI_SANDI: "3000" });
    await adminAwal(env);
    const turun = { ...env, ITERASI_SANDI: "1000" } as Env;
    expect(await hitungHash(() => masuk(turun, "admin@sekolah.sch.id", SANDI_AWAL))).toBe(1);
    expect(d1.baris("SELECT iterasi FROM pengguna")).toEqual([{ iterasi: 3_000 }]);
  });
});

describe.skipIf(!sqlite)("admin terakhir saat dua perubahan datang bersamaan (P-25, AC-8)", () => {
  it("perubahan yang menghabiskan admin aktif tidak berlaku: 409, tanpa audit, sesi tetap", async () => {
    const { d1, env } = lingkungan();
    const a = await adminSiap(env, "a@sekolah.sch.id");
    const c = await buatGuru(env, a, "c@sekolah.sch.id", "admin");
    const cookieC = await masuk(env, "c@sekolah.sch.id", c.sandi);
    const idA = d1.baris<{ id: string }>("SELECT id FROM pengguna WHERE email = 'a@sekolah.sch.id'")[0].id;
    const auditSebelum = d1.baris("SELECT * FROM log_audit").length;
    // C menurunkan peran A tepat sebelum perubahan A atas C ditulis.
    d1.sebelumBatch = () => d1.jalankan("UPDATE pengguna SET peran = 'guru' WHERE id = ?", idA);
    const j = await minta(env, "PATCH", `/api/akun/${c.id}`, { cookie: a, isi: { peran: "guru" } });
    expect(j.status).toBe(409);
    expect(await galat(j)).toEqual({ kode: "ADMIN_TERAKHIR", pesan: "Harus ada sedikitnya satu admin aktif." });
    expect(d1.baris("SELECT peran, aktif FROM pengguna WHERE id = ?", c.id)).toEqual([{ peran: "admin", aktif: 1 }]);
    expect(d1.baris("SELECT * FROM log_audit")).toHaveLength(auditSebelum);
    expect((await minta(env, "GET", "/api/saya", { cookie: cookieC })).status).toBe(200);
    expect(await (await minta(env, "GET", "/api/saya", { cookie: cookieC })).json()).toMatchObject({ masuk: true, akun: { peran: "admin" } });
  });

  it("menonaktifkan bersamaan juga ditolak, dan sesi sasaran tidak dihapus", async () => {
    const { d1, env } = lingkungan();
    const a = await adminSiap(env, "a@sekolah.sch.id");
    const c = await buatGuru(env, a, "c@sekolah.sch.id", "admin");
    await masuk(env, "c@sekolah.sch.id", c.sandi);
    const idA = d1.baris<{ id: string }>("SELECT id FROM pengguna WHERE email = 'a@sekolah.sch.id'")[0].id;
    d1.sebelumBatch = () => d1.jalankan("UPDATE pengguna SET aktif = 0 WHERE id = ?", idA);
    const j = await minta(env, "PATCH", `/api/akun/${c.id}`, { cookie: a, isi: { aktif: false } });
    expect(j.status).toBe(409);
    expect(d1.baris("SELECT count(*) AS n FROM sesi WHERE pengguna_id = ?", c.id)).toEqual([{ n: 1 }]);
  });
});

describe.skipIf(!sqlite)("sandi tidak tersimpan dan log audit (P-5, P-26, AC-2, AC-8)", () => {
  const TABEL = ["pengguna", "sesi", "batas_masuk", "log_audit", "rujukan", "pengaturan"];

  it("sandi sementara, sandi baru, token, dan alamat IP tidak ada di D1 maupun di log", async () => {
    const log = (["log", "info", "warn", "error", "debug"] as const).map((m) => vi.spyOn(console, m));
    const { d1, env } = lingkungan();
    const a = await adminSiap(env);
    const tajukIp = { "CF-Connecting-IP": "203.0.113.77" };
    const j = await minta(env, "POST", "/api/akun", { cookie: a, tajuk: tajukIp, isi: { email: "guru@sekolah.sch.id", namaTampilan: "Bu Sari", peran: "guru", peninjau: true } });
    const { akun, sandiSementara } = (await j.json()) as { akun: { id: string }; sandiSementara: string };
    expect(POLA_SANDI_SEMENTARA.test(sandiSementara)).toBe(true);
    const ulang = (await (await minta(env, "PATCH", `/api/akun/${akun.id}`, { cookie: a, isi: { aturUlangSandi: true } })).json()) as { sandiSementara: string };
    const guru = await masuk(env, "guru@sekolah.sch.id", ulang.sandiSementara);
    await minta(env, "POST", "/api/masuk", { tajuk: tajukIp, isi: { email: "guru@sekolah.sch.id", sandi: "salah salah salah" } });

    const isiD1 = JSON.stringify(TABEL.map((t) => d1.baris(`SELECT * FROM ${t}`)));
    const token = (c: string) => c.split("=")[1];
    for (const rahasia of [sandiSementara, ulang.sandiSementara, sandiSementara.replaceAll("-", ""), SANDI_AWAL, SANDI_ADMIN, token(a), token(guru), "203.0.113.77"]) {
      expect(isiD1).not.toContain(rahasia);
    }
    for (const m of log) expect(m).not.toHaveBeenCalled();
  });

  it("satu baris per perubahan dengan rincian P-26", async () => {
    const { d1, env } = lingkungan();
    const a = await adminSiap(env);
    const g = await buatGuru(env, a);
    await minta(env, "PATCH", `/api/akun/${g.id}`, { cookie: a, isi: { namaTampilan: "Bu Sari W.", peninjau: true } });
    await minta(env, "PATCH", `/api/akun/${g.id}`, { cookie: a, isi: { namaTampilan: "Bu Sari W.", peninjau: true } }); // tanpa perubahan
    await minta(env, "PATCH", `/api/akun/${g.id}`, { cookie: a, isi: { aktif: false } });
    await minta(env, "PATCH", `/api/akun/${g.id}`, { cookie: a, isi: { aktif: true, aturUlangSandi: true } });
    await adminAwal(env); // memulihkan admin yang sama
    const idA = d1.baris<{ id: string }>("SELECT id FROM pengguna WHERE email = 'admin@sekolah.sch.id'")[0].id;
    const baris = d1.baris<{ pengguna_id: string | null; aksi: string; sasaran: string; rincian_json: string }>(
      "SELECT pengguna_id, aksi, sasaran, rincian_json FROM log_audit ORDER BY waktu, rowid",
    );
    expect(baris).toEqual([
      { pengguna_id: null, aksi: "admin_awal", sasaran: idA, rincian_json: '{"hasil":"dibuat"}' },
      { pengguna_id: idA, aksi: "sandi.ganti", sasaran: idA, rincian_json: '{"wajib":true}' },
      { pengguna_id: idA, aksi: "akun.buat", sasaran: g.id, rincian_json: '{"peran":"guru","peninjau":false}' },
      { pengguna_id: idA, aksi: "akun.ubah", sasaran: g.id, rincian_json: '{"nama_tampilan":"Bu Sari W.","peninjau":true}' },
      { pengguna_id: idA, aksi: "akun.ubah", sasaran: g.id, rincian_json: '{"aktif":false}' },
      { pengguna_id: idA, aksi: "akun.ubah", sasaran: g.id, rincian_json: '{"aktif":true}' },
      { pengguna_id: idA, aksi: "akun.atur_ulang_sandi", sasaran: g.id, rincian_json: "{}" },
      { pengguna_id: null, aksi: "admin_awal", sasaran: idA, rincian_json: '{"hasil":"dipulihkan"}' },
    ]);
  });
});

describe.skipIf(!sqlite)("jawaban API: tajuk JSON, 405, dan batas isi", () => {
  it("tajuk JSON JS-03 di setiap jawaban, termasuk cookie", async () => {
    const { env } = lingkungan();
    const j = await adminAwal(env);
    for (const [nama, nilai] of Object.entries(TAJUK_JSON)) expect(j.headers.get(nama), nama).toBe(nilai);
    const m = await minta(env, "POST", "/api/masuk", { isi: { email: "admin@sekolah.sch.id", sandi: SANDI_AWAL } });
    for (const [nama, nilai] of Object.entries(TAJUK_JSON)) expect(m.headers.get(nama), nama).toBe(nilai);
    expect(m.headers.get("Set-Cookie")).toMatch(/^__Host-jejak_sesi=[A-Za-z0-9_-]{43}; Path=\/; HttpOnly; Secure; SameSite=Lax$/);
  });

  it.each([
    ["/api/masuk", "GET", "POST"],
    ["/api/keluar", "GET", "POST"],
    ["/api/saya", "POST", "GET"],
    ["/api/sandi", "PUT", "POST"],
    ["/api/akun", "DELETE", "GET, POST"],
    ["/api/akun/abc", "GET", "PATCH"],
    ["/api/dasbor", "POST", "GET"],
  ])("%s %s: 405 dengan Allow %s", async (jalur, metode, allow) => {
    const { env } = lingkungan();
    const j = await minta(env, metode, jalur);
    expect(j.status).toBe(405);
    expect(j.headers.get("Allow")).toBe(allow);
    expect(await galat(j)).toEqual({ kode: "METODE_TIDAK_DIDUKUNG", pesan: "Metode ini tidak didukung." });
  });

  it("jalur di bawah /api/akun yang tidak dikenal: 404 BELUM_TERSEDIA", async () => {
    const { env } = lingkungan();
    for (const jalur of ["/api/akun/", "/api/akun/a/b", "/api/akunku"]) {
      const j = await minta(env, "GET", jalur);
      expect(j.status, jalur).toBe(404);
      expect((await galat(j)).kode).toBe("BELUM_TERSEDIA");
    }
  });

  it("isi lebih dari 4.096 byte, bukan JSON, atau bukan UTF-8: 400 PERMINTAAN_SALAH", async () => {
    const { env } = lingkungan();
    const panjang = JSON.stringify({ email: "a@b.id", sandi: "x".repeat(4_100) });
    for (const isi of [panjang, "{bukan json", "", new Uint8Array([0x7b, 0xff, 0x7d])]) {
      const j = await worker.fetch(
        new Request(ASAL + "/api/masuk", { method: "POST", headers: { "X-Jejak": "1", Origin: ASAL }, body: isi as BodyInit }),
        env,
      );
      expect(j.status).toBe(400);
      expect(await galat(j)).toEqual({ kode: "PERMINTAAN_SALAH", pesan: "Permintaan tidak sah." });
    }
    // Tepat 4.096 byte masih dibaca (lalu 401 karena sandi lebih dari 128 karakter).
    const pas = JSON.stringify({ email: "a@b.id", sandi: "" });
    const isiPas = JSON.stringify({ email: "a@b.id", sandi: "x".repeat(4_096 - pas.length) });
    expect(new TextEncoder().encode(isiPas).length).toBe(4_096);
    expect((await minta(env, "POST", "/api/masuk", { isi: isiPas })).status).toBe(401);
  });
});

describe.skipIf(!sqlite)("pembersihan harian (P-35, AC-12) dengan jam tiruan", () => {
  const JAM = 3_600_000;
  const sekarang = Date.UTC(2026, 10, 14, 19, 0, 0);

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(sekarang);
  });

  it("menghapus sesi kedaluwarsa atau 8 jam tidak dipakai, dan catatan pembatas lama yang tidak terkunci", async () => {
    const { d1, env } = lingkungan();
    d1.jalankan(
      "INSERT INTO pengguna (id, email, nama_tampilan, peran, hash_sandi, garam, iterasi, dibuat_pada) VALUES ('u1', 'u1@b.id', 'U', 'guru', 'h', 'g', 1000, 0)",
    );
    const sesi = (h: string, terakhir: number, kedaluwarsa: number) =>
      d1.jalankan("INSERT INTO sesi VALUES (?, 'u1', ?, ?, ?)", h, terakhir, terakhir, kedaluwarsa);
    sesi("kedaluwarsa", sekarang - JAM, sekarang - 1);
    sesi("diam-lewat", sekarang - 8 * JAM - 1, sekarang + JAM);
    sesi("diam-pas", sekarang - 8 * JAM, sekarang + JAM);
    sesi("sah", sekarang - 60_000, sekarang + 6 * 24 * JAM);
    const batas = (k: string, mulai: number, terkunci: number | null) => d1.jalankan("INSERT INTO batas_masuk VALUES (?, 3, ?, ?)", k, mulai, terkunci);
    batas("lama", sekarang - 24 * JAM - 1, null);
    batas("lama-terkunci", sekarang - 24 * JAM - 1, sekarang + 60_000);
    batas("lama-kunci-habis", sekarang - 24 * JAM - 1, sekarang);
    batas("baru", sekarang - JAM, null);

    await worker.scheduled({} as ScheduledController, env);
    expect(d1.baris("SELECT hash_token FROM sesi ORDER BY hash_token")).toEqual([{ hash_token: "diam-pas" }, { hash_token: "sah" }]);
    expect(d1.baris("SELECT kunci FROM batas_masuk ORDER BY kunci")).toEqual([{ kunci: "baru" }, { kunci: "lama-terkunci" }]);
  });
});
