// Uji rute akun lewat HTTP sungguhan terhadap server lokal port 4320 (spesifikasi JS-04, rencana uji "Uji server";
// AC-3 sampai AC-9, AC-12, AC-13). Setiap kelompok membuat admin sendiri lewat POST /api/admin-awal dengan kunci lokal
// (P-31) dan email unik, dan memakai alamat CF-Connecting-IP sendiri agar pembatas tidak saling memengaruhi. Masa sesi
// dan pembatas diatur lewat d1().
import { createHash, createHmac, pbkdf2Sync, randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { TEKS_KONSOL } from "../../../app/jejak-setara/teks-konsol";
import { alamat, d1 } from "./bantuan";

const B = alamat();
const KUNCI_ADMIN = "lokal-kunci-admin-bukan-rahasia";
const KUNCI_SANDI = "lokal-kunci-sandi-bukan-rahasia";
const KUNCI_IP = "lokal-kunci-ip-bukan-rahasia";
const SANDI_AWAL = "sandi-awal-12345";
const SANDI_ADMIN = "kalimat sandi admin";
const MENIT = 60_000;
const JAM = 60 * MENIT;

let urut = 0;
const unik = (awal: string) => `${awal}.${Date.now().toString(36)}${(urut++).toString(36)}@sekolah.sch.id`;
let urutIp = 0;
/** Alamat IP tiruan baru untuk satu kelompok uji (CF-Connecting-IP, P-12 dan P-14). */
const ipBaru = () => `10.4.${Math.floor(urutIp / 200)}.${(urutIp++ % 200) + 1}`;

const TAJUK_JSON: Record<string, string> = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "same-origin",
  "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
};

interface Opsi {
  isi?: unknown;
  cookie?: string | null;
  ip: string;
  tajuk?: Record<string, string>;
  tanpaCsrf?: boolean;
}

interface Jawaban {
  status: number;
  isi: Record<string, unknown> & { galat?: { kode: string; pesan: string } };
  cookie: string | null;
  setCookie: string | null;
  tajuk: Headers;
}

async function minta(metode: string, jalur: string, opsi: Opsi): Promise<Jawaban> {
  const tajuk: Record<string, string> = { "CF-Connecting-IP": opsi.ip };
  if (metode !== "GET" && !opsi.tanpaCsrf) Object.assign(tajuk, { "X-Jejak": "1", Origin: B });
  if (opsi.cookie) tajuk.Cookie = opsi.cookie;
  Object.assign(tajuk, opsi.tajuk);
  const body = opsi.isi === undefined ? undefined : typeof opsi.isi === "string" ? opsi.isi : JSON.stringify(opsi.isi);
  const j = await fetch(B + jalur, { method: metode, headers: tajuk, body });
  const teks = await j.text();
  const setCookie = j.headers.get("set-cookie");
  return { status: j.status, isi: teks ? JSON.parse(teks) : {}, cookie: setCookie ? setCookie.split(";")[0] : null, setCookie, tajuk: j.headers };
}

const galat = (kode: keyof typeof TEKS_KONSOL.galat) => ({ galat: { kode, pesan: TEKS_KONSOL.galat[kode] } });

function adminAwal(ip: string, email: string, sandi = SANDI_AWAL, nama = "Admin", kunci = KUNCI_ADMIN) {
  return minta("POST", "/api/admin-awal", { ip, tanpaCsrf: true, tajuk: { "X-Jejak-Kunci-Admin": kunci }, isi: { email, sandi, namaTampilan: nama } });
}

async function masuk(ip: string, email: string, sandi: string): Promise<string> {
  const j = await minta("POST", "/api/masuk", { ip, isi: { email, sandi } });
  expect(j.status, `masuk ${email}: ${JSON.stringify(j.isi)}`).toBe(200);
  return j.cookie as string;
}

/** Admin siap pakai: admin awal, masuk, lalu ganti sandi wajib. */
async function adminSiap(ip: string, email = unik("admin")): Promise<{ email: string; cookie: string; id: string }> {
  expect((await adminAwal(ip, email)).status).toBe(200);
  const sementara = await masuk(ip, email, SANDI_AWAL);
  const j = await minta("POST", "/api/sandi", { ip, cookie: sementara, isi: { sandiBaru: SANDI_ADMIN } });
  expect(j.status).toBe(200);
  return { email, cookie: j.cookie as string, id: String((j.isi.akun as { id: string }).id) };
}

async function buatAkun(ip: string, cookie: string, email: string, peran: "guru" | "admin" = "guru", nama = "Bu Sari", peninjau = false) {
  const j = await minta("POST", "/api/akun", { ip, cookie, isi: { email, namaTampilan: nama, peran, peninjau } });
  expect(j.status, JSON.stringify(j.isi)).toBe(201);
  return { id: String((j.isi.akun as { id: string }).id), sandi: String(j.isi.sandiSementara), isi: j.isi };
}

const hashToken = (cookie: string) => createHash("sha256").update(cookie.split("=")[1]).digest("hex");
const kunciEmail = (email: string) => "e:" + createHmac("sha256", KUNCI_IP).update(email).digest("hex").slice(0, 32);
const kunciAlamat = (ip: string) => "i:" + createHmac("sha256", KUNCI_IP).update(`${ip}|${new Date().toISOString().slice(0, 10)}`).digest("hex").slice(0, 32);
const sql = (teks: string) => `'${teks.replaceAll("'", "''")}'`;

describe("admin awal (P-28, P-30, P-31; AC-9)", () => {
  const ip = ipBaru();

  it("dibuat: admin baru dengan sandi sementara wajib diganti, Peninjau mati, dan log audit admin_awal", async () => {
    const email = unik("Admin.Baru");
    const j = await adminAwal(ip, `  ${email.toUpperCase()} `, SANDI_AWAL, "  YAN  ");
    expect(j).toMatchObject({ status: 200, isi: { hasil: "dibuat" } });
    const [baris] = d1<Record<string, unknown>>(
      `SELECT id, email, nama_tampilan, peran, peninjau, wajib_ganti_sandi, aktif, iterasi, length(garam) AS g, length(hash_sandi) AS h FROM pengguna WHERE email = ${sql(email.toLowerCase())}`,
    );
    expect(baris).toMatchObject({ email: email.toLowerCase(), nama_tampilan: "YAN", peran: "admin", peninjau: 0, wajib_ganti_sandi: 1, aktif: 1, iterasi: 15_000, g: 24, h: 44 });
    expect(d1(`SELECT pengguna_id, aksi, rincian_json FROM log_audit WHERE sasaran = ${sql(String(baris.id))}`)).toEqual([
      { pengguna_id: null, aksi: "admin_awal", rincian_json: '{"hasil":"dibuat"}' },
    ]);
  });

  it("dipulihkan: guru nonaktif menjadi admin aktif dengan sandi sementara baru; sesi dan catatan pembatasnya dihapus", async () => {
    const admin = await adminSiap(ip);
    const email = unik("guru.lama");
    const guru = await buatAkun(ip, admin.cookie, email, "guru", "Pak Made", true);
    const sesiGuru = await masuk(ip, email, guru.sandi);
    await minta("POST", "/api/masuk", { ip, isi: { email, sandi: "salah salah salah" } });
    expect(d1(`SELECT jumlah FROM batas_masuk WHERE kunci = '${kunciEmail(email)}'`)).toEqual([{ jumlah: 1 }]);
    expect((await minta("PATCH", `/api/akun/${guru.id}`, { ip, cookie: admin.cookie, isi: { aktif: false } })).status).toBe(200);

    const j = await adminAwal(ip, email, "sandi pemulihan baru", "Nama Lain");
    expect(j).toMatchObject({ status: 200, isi: { hasil: "dipulihkan" } });
    expect(d1(`SELECT nama_tampilan, peran, peninjau, wajib_ganti_sandi, aktif FROM pengguna WHERE id = ${sql(guru.id)}`)).toEqual([
      { nama_tampilan: "Pak Made", peran: "admin", peninjau: 1, wajib_ganti_sandi: 1, aktif: 1 },
    ]);
    expect(d1(`SELECT count(*) AS n FROM sesi WHERE pengguna_id = ${sql(guru.id)}`)).toEqual([{ n: 0 }]);
    expect(d1(`SELECT count(*) AS n FROM batas_masuk WHERE kunci = '${kunciEmail(email)}'`)).toEqual([{ n: 0 }]);
    expect((await minta("GET", "/api/saya", { ip, cookie: sesiGuru })).isi).toEqual({ masuk: false });
    expect((await minta("POST", "/api/masuk", { ip, isi: { email, sandi: guru.sandi } })).status).toBe(401);
    const baru = await minta("POST", "/api/masuk", { ip, isi: { email, sandi: "sandi pemulihan baru" } });
    expect(baru.isi).toMatchObject({ akun: { peran: "admin", wajibGantiSandi: true } });
    expect(d1(`SELECT pengguna_id, aksi, rincian_json FROM log_audit WHERE sasaran = ${sql(guru.id)} AND aksi = 'admin_awal'`)).toEqual([
      { pengguna_id: null, aksi: "admin_awal", rincian_json: '{"hasil":"dipulihkan"}' },
    ]);
  });

  it("kunci salah 403; sandi terlalu pendek, email, dan nama yang salah 400; tanpa X-Jejak tetap diterima", async () => {
    expect(await adminAwal(ip, unik("x"), SANDI_AWAL, "Admin", "kunci-salah")).toMatchObject({ status: 403, isi: galat("KUNCI_ADMIN_SALAH") });
    expect(await adminAwal(ip, unik("x"), "pendek")).toMatchObject({ status: 400, isi: galat("SANDI_PENDEK") });
    expect(await adminAwal(ip, unik("x"), "x".repeat(129))).toMatchObject({ status: 400, isi: galat("SANDI_PANJANG") });
    expect(await adminAwal(ip, "bukan-email", SANDI_AWAL)).toMatchObject({ status: 400, isi: galat("EMAIL_SALAH") });
    expect(await adminAwal(ip, unik("x"), SANDI_AWAL, "x".repeat(41))).toMatchObject({ status: 400, isi: galat("NAMA_SALAH") });
    // Sandi sementara admin awal tanpa aturan email (P-28): sandi yang sama dengan email diterima.
    const email = unik("sama");
    expect((await adminAwal(ip, email, email)).status).toBe(200);
  });
});

describe("masuk (P-6, P-10 sampai P-15; AC-3, AC-4, AC-5)", () => {
  const ip = ipBaru();

  it("berhasil: cookie persis P-6, baris sesi berisi hash token, masuk_terakhir terisi, jawaban Saya", async () => {
    const email = unik("masuk");
    await adminAwal(ip, email);
    const sebelum = Date.now();
    const j = await minta("POST", "/api/masuk", { ip, isi: { email: email.toUpperCase(), sandi: SANDI_AWAL } });
    expect(j.status).toBe(200);
    expect(j.setCookie).toMatch(/^__Host-jejak_sesi=[A-Za-z0-9_-]{43}; Path=\/; HttpOnly; Secure; SameSite=Lax$/);
    expect(j.isi).toEqual({ akun: { id: expect.any(String), email, namaTampilan: "Admin", peran: "admin", peninjau: false, wajibGantiSandi: true } });
    const token = (j.cookie as string).split("=")[1];
    const [sesi] = d1<Record<string, number | string>>(`SELECT * FROM sesi WHERE hash_token = '${hashToken(j.cookie as string)}'`);
    expect(sesi).toBeDefined();
    expect(Number(sesi.kedaluwarsa) - Number(sesi.dibuat_pada)).toBe(7 * 24 * JAM);
    expect(sesi.terakhir_dipakai).toBe(sesi.dibuat_pada);
    expect(d1(`SELECT count(*) AS n FROM sesi WHERE hash_token = '${token}'`)).toEqual([{ n: 0 }]);
    const [akun] = d1<{ masuk_terakhir: number }>(`SELECT masuk_terakhir FROM pengguna WHERE email = ${sql(email)}`);
    expect(akun.masuk_terakhir).toBeGreaterThanOrEqual(sebelum - 1000);
    for (const [nama, nilai] of Object.entries(TAJUK_JSON)) expect(j.tajuk.get(nama), nama).toBe(nilai);
  });

  it("sandi salah, email tidak terdaftar, dan akun nonaktif: jawaban yang sama 401 MASUK_SALAH", async () => {
    const admin = await adminSiap(ip);
    const email = unik("nonaktif");
    const guru = await buatAkun(ip, admin.cookie, email);
    await minta("PATCH", `/api/akun/${guru.id}`, { ip, cookie: admin.cookie, isi: { aktif: false } });
    const jawaban = [
      await minta("POST", "/api/masuk", { ip, isi: { email: admin.email, sandi: "sandi yang salah" } }),
      await minta("POST", "/api/masuk", { ip, isi: { email: unik("tidak.ada"), sandi: "sandi yang salah" } }),
      await minta("POST", "/api/masuk", { ip, isi: { email, sandi: guru.sandi } }),
    ];
    for (const j of jawaban) expect(j).toMatchObject({ status: 401, isi: galat("MASUK_SALAH"), cookie: null });
    expect(TEKS_KONSOL.galat.MASUK_SALAH).toBe("Email atau sandi salah.");
    d1(`DELETE FROM batas_masuk WHERE kunci = '${kunciAlamat(ip)}'`);
  });

  it("isi rusak 400; isi di luar aturan 401 tanpa hitungan; tanpa X-Jejak atau Origin lain 403", async () => {
    const ipSini = ipBaru();
    for (const isi of ["{bukan json", "[]", JSON.stringify({ email: "a@b.id" }), JSON.stringify({ email: "a@b.id", sandi: "x", lain: 1 })]) {
      expect(await minta("POST", "/api/masuk", { ip: ipSini, isi })).toMatchObject({ status: 400, isi: galat("PERMINTAAN_SALAH") });
    }
    expect(await minta("POST", "/api/masuk", { ip: ipSini, isi: { email: "bukan-email", sandi: "x" } })).toMatchObject({ status: 401, isi: galat("MASUK_SALAH") });
    expect(await minta("POST", "/api/masuk", { ip: ipSini, isi: { email: "a@b.id", sandi: "" } })).toMatchObject({ status: 401 });
    expect(d1(`SELECT count(*) AS n FROM batas_masuk WHERE kunci = '${kunciAlamat(ipSini)}'`)).toEqual([{ n: 0 }]);
    const tanpa = await minta("POST", "/api/masuk", { ip: ipSini, tanpaCsrf: true, tajuk: { Origin: B }, isi: { email: "a@b.id", sandi: "x" } });
    expect(tanpa).toMatchObject({ status: 403, isi: galat("ASAL_DITOLAK") });
    const asalLain = await minta("POST", "/api/masuk", { ip: ipSini, tanpaCsrf: true, tajuk: { "X-Jejak": "1", Origin: "https://lain.contoh.id" }, isi: { email: "a@b.id", sandi: "x" } });
    expect(asalLain).toMatchObject({ status: 403, isi: galat("ASAL_DITOLAK") });
    const tanpaAsal = await minta("POST", "/api/masuk", { ip: ipSini, tanpaCsrf: true, tajuk: { "X-Jejak": "1" }, isi: { email: "a@b.id", sandi: "x" } });
    expect(tanpaAsal.status).toBe(403);
  });

  it("email: lima kegagalan dari dua alamat mengunci percobaan keenam dari alamat mana pun; email lain tetap bisa; pulih sesudah kunci lewat", async () => {
    const ipA = ipBaru();
    const ipB = ipBaru();
    const email = unik("kunci.email");
    await adminAwal(ipA, email);
    for (let i = 0; i < 5; i++) {
      const j = await minta("POST", "/api/masuk", { ip: i % 2 ? ipB : ipA, isi: { email, sandi: "sandi yang salah" } });
      expect(j, `percobaan ${i + 1}`).toMatchObject({ status: 401, isi: galat("MASUK_SALAH") });
    }
    for (const ipLain of [ipA, ipB]) {
      expect(await minta("POST", "/api/masuk", { ip: ipLain, isi: { email, sandi: SANDI_AWAL } })).toMatchObject({ status: 429, isi: galat("TERKUNCI") });
    }
    expect(TEKS_KONSOL.galat.TERKUNCI).toBe("Terlalu banyak percobaan masuk. Tunggu 15 menit, lalu coba lagi.");
    const [baris] = d1<{ kunci: string; jumlah: number; jendela_mulai: number; terkunci_sampai: number }>(`SELECT * FROM batas_masuk WHERE kunci = '${kunciEmail(email)}'`);
    expect(baris.jumlah).toBe(5);
    expect(baris.terkunci_sampai - Date.now()).toBeGreaterThan(14 * MENIT);
    expect(baris.terkunci_sampai - Date.now()).toBeLessThanOrEqual(15 * MENIT);
    // Email lain dari alamat yang sama tetap bisa mencoba.
    const lain = unik("lain");
    await adminAwal(ipA, lain);
    expect((await minta("POST", "/api/masuk", { ip: ipA, isi: { email: lain, sandi: SANDI_AWAL } })).status).toBe(200);
    // Kunci dimundurkan: masuk berhasil, dan catatan email dihapus.
    d1(`UPDATE batas_masuk SET terkunci_sampai = ${Date.now() - 1} WHERE kunci = '${kunciEmail(email)}'`);
    expect((await minta("POST", "/api/masuk", { ip: ipA, isi: { email, sandi: SANDI_AWAL } })).status).toBe(200);
    expect(d1(`SELECT count(*) AS n FROM batas_masuk WHERE kunci = '${kunciEmail(email)}'`)).toEqual([{ n: 0 }]);
  });

  it("alamat: kegagalan ke-20 mengunci percobaan ke-21, juga untuk sandi yang benar; tanpa alamat IP di D1", async () => {
    const ipKunci = ipBaru();
    const email = unik("kunci.alamat");
    await adminAwal(ipBaru(), email);
    for (let i = 0; i < 20; i++) {
      const j = await minta("POST", "/api/masuk", { ip: ipKunci, isi: { email: unik(`acak${i}`), sandi: "sandi yang salah" } });
      expect(j.status, `percobaan ${i + 1}`).toBe(401);
    }
    expect(await minta("POST", "/api/masuk", { ip: ipKunci, isi: { email, sandi: SANDI_AWAL } })).toMatchObject({ status: 429, isi: galat("TERKUNCI") });
    expect(d1(`SELECT jumlah FROM batas_masuk WHERE kunci = '${kunciAlamat(ipKunci)}'`)).toEqual([{ jumlah: 20 }]);
    const semua = JSON.stringify(d1("SELECT * FROM batas_masuk"));
    expect(semua).not.toContain("10.4.");
    expect(d1("SELECT kunci FROM batas_masuk").every((b) => /^(e|i):[0-9a-f]{32}$/.test(String(b.kunci)))).toBe(true);
    d1(`UPDATE batas_masuk SET terkunci_sampai = ${Date.now() - 1} WHERE kunci = '${kunciAlamat(ipKunci)}'`);
    expect((await minta("POST", "/api/masuk", { ip: ipKunci, isi: { email, sandi: SANDI_AWAL } })).status).toBe(200);
  });
});

describe("akun saat ini, keluar, dan ganti sandi (P-8, P-9, P-16 sampai P-19; AC-3, AC-6)", () => {
  const ip = ipBaru();

  it("GET /api/saya selalu 200; keluar menghapus sesi dan mengirim cookie hapus, juga tanpa sesi", async () => {
    expect(await minta("GET", "/api/saya", { ip })).toMatchObject({ status: 200, isi: { masuk: false } });
    expect(await minta("GET", "/api/saya", { ip, cookie: "__Host-jejak_sesi=" + "A".repeat(43) })).toMatchObject({ status: 200, isi: { masuk: false } });
    const admin = await adminSiap(ip);
    expect((await minta("GET", "/api/saya", { ip, cookie: admin.cookie })).isi).toMatchObject({ masuk: true, akun: { email: admin.email, wajibGantiSandi: false } });
    const k = await minta("POST", "/api/keluar", { ip, cookie: admin.cookie });
    expect(k).toMatchObject({ status: 200, isi: { ok: true } });
    expect(k.setCookie).toBe("__Host-jejak_sesi=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
    expect(d1(`SELECT count(*) AS n FROM sesi WHERE hash_token = '${hashToken(admin.cookie)}'`)).toEqual([{ n: 0 }]);
    expect((await minta("GET", "/api/saya", { ip, cookie: admin.cookie })).isi).toEqual({ masuk: false });
    expect(await minta("POST", "/api/keluar", { ip })).toMatchObject({ status: 200, isi: { ok: true } });
    expect((await minta("POST", "/api/keluar", { ip, tanpaCsrf: true })).status).toBe(403);
  });

  it("wajib: hanya saya, sandi, dan keluar yang dilayani; galat aturan sandi; sandi sementara tidak bisa dipakai lagi", async () => {
    const email = unik("wajib");
    await adminAwal(ip, email);
    const c = await masuk(ip, email, SANDI_AWAL);
    expect(await minta("GET", "/api/akun", { ip, cookie: c })).toMatchObject({ status: 403, isi: galat("WAJIB_GANTI_SANDI") });
    expect(await minta("GET", "/api/dasbor", { ip, cookie: c })).toMatchObject({ status: 403, isi: galat("WAJIB_GANTI_SANDI") });
    const isi = (sandiBaru: string) => ({ ip, cookie: c, isi: { sandiLama: "diabaikan", sandiBaru } });
    expect(await minta("POST", "/api/sandi", isi("x".repeat(11)))).toMatchObject({ status: 400, isi: galat("SANDI_PENDEK") });
    expect(await minta("POST", "/api/sandi", isi("x".repeat(129)))).toMatchObject({ status: 400, isi: galat("SANDI_PANJANG") });
    expect(await minta("POST", "/api/sandi", isi(email.toUpperCase()))).toMatchObject({ status: 400, isi: galat("SANDI_SAMA_EMAIL") });
    expect(await minta("POST", "/api/sandi", isi(SANDI_AWAL))).toMatchObject({ status: 400, isi: galat("SANDI_SAMA") });
    expect(await minta("POST", "/api/sandi", { ip, cookie: c, isi: { sandiBaru: SANDI_ADMIN, ulangi: SANDI_ADMIN } })).toMatchObject({ status: 400, isi: galat("PERMINTAAN_SALAH") });
    const j = await minta("POST", "/api/sandi", isi(SANDI_ADMIN));
    expect(j).toMatchObject({ status: 200, isi: { akun: { email, wajibGantiSandi: false } } });
    expect(j.cookie).not.toBe(c);
    expect((await minta("GET", "/api/saya", { ip, cookie: c })).isi).toEqual({ masuk: false });
    expect((await minta("GET", "/api/dasbor", { ip, cookie: j.cookie })).status).toBe(200);
    expect(d1(`SELECT wajib_ganti_sandi FROM pengguna WHERE email = ${sql(email)}`)).toEqual([{ wajib_ganti_sandi: 0 }]);
    expect((await minta("POST", "/api/masuk", { ip, isi: { email, sandi: SANDI_AWAL } })).status).toBe(401);
    d1(`DELETE FROM batas_masuk WHERE kunci IN ('${kunciEmail(email)}', '${kunciAlamat(ip)}')`);
  });

  it("sukarela: sandi sekarang wajib dan dicocokkan; galat menambah hitungan; sesi perangkat lain berakhir", async () => {
    const admin = await adminSiap(ip);
    const hp = await masuk(ip, admin.email, SANDI_ADMIN);
    const laptop = admin.cookie;
    const isi = (sandiLama: string | undefined, sandiBaru: string) => ({ ip, cookie: laptop, isi: sandiLama === undefined ? { sandiBaru } : { sandiLama, sandiBaru } });
    expect(await minta("POST", "/api/sandi", isi(undefined, "kalimat sandi kedua"))).toMatchObject({ status: 400, isi: galat("PERMINTAAN_SALAH") });
    expect(await minta("POST", "/api/sandi", isi("bukan sandinya", "kalimat sandi kedua"))).toMatchObject({ status: 400, isi: galat("SANDI_LAMA_SALAH") });
    expect(d1(`SELECT jumlah FROM batas_masuk WHERE kunci = '${kunciEmail(admin.email)}'`)).toEqual([{ jumlah: 1 }]);
    expect(await minta("POST", "/api/sandi", isi(SANDI_ADMIN, "pendek"))).toMatchObject({ status: 400, isi: galat("SANDI_PENDEK") });
    expect(await minta("POST", "/api/sandi", isi(SANDI_ADMIN, SANDI_ADMIN))).toMatchObject({ status: 400, isi: galat("SANDI_SAMA") });
    const j = await minta("POST", "/api/sandi", isi(SANDI_ADMIN, "kalimat sandi kedua"));
    expect(j).toMatchObject({ status: 200, isi: { akun: { email: admin.email } } });
    expect((await minta("GET", "/api/saya", { ip, cookie: hp })).isi).toEqual({ masuk: false });
    expect((await minta("GET", "/api/saya", { ip, cookie: laptop })).isi).toEqual({ masuk: false });
    expect((await minta("GET", "/api/saya", { ip, cookie: j.cookie })).isi).toMatchObject({ masuk: true });
    const idAdmin = admin.id;
    expect(d1(`SELECT count(*) AS n FROM sesi WHERE pengguna_id = ${sql(idAdmin)}`)).toEqual([{ n: 1 }]);
    expect(d1(`SELECT rincian_json FROM log_audit WHERE sasaran = ${sql(idAdmin)} AND aksi = 'sandi.ganti' ORDER BY waktu`)).toEqual([
      { rincian_json: '{"wajib":true}' },
      { rincian_json: '{"wajib":false}' },
    ]);
  });

  it("sukarela saat email terkunci: 429 TERKUNCI tanpa mencocokkan", async () => {
    const admin = await adminSiap(ip);
    d1(`INSERT INTO batas_masuk (kunci, jumlah, jendela_mulai, terkunci_sampai) VALUES ('${kunciEmail(admin.email)}', 5, ${Date.now()}, ${Date.now() + 15 * MENIT})`);
    expect(await minta("POST", "/api/sandi", { ip, cookie: admin.cookie, isi: { sandiLama: SANDI_ADMIN, sandiBaru: "kalimat sandi kedua" } })).toMatchObject({
      status: 429,
      isi: galat("TERKUNCI"),
    });
    d1(`DELETE FROM batas_masuk WHERE kunci = '${kunciEmail(admin.email)}'`);
  });
});

describe("masa sesi (P-7; AC-3)", () => {
  const ip = ipBaru();

  it("8 jam tidak dipakai dan 7 hari mengakhiri sesi; barisnya dihapus", async () => {
    const admin = await adminSiap(ip);
    const lain = await masuk(ip, admin.email, SANDI_ADMIN);
    const h1 = hashToken(admin.cookie);
    const h2 = hashToken(lain);
    d1(`UPDATE sesi SET terakhir_dipakai = ${Date.now() - 8 * JAM - MENIT} WHERE hash_token = '${h1}'`);
    expect((await minta("GET", "/api/saya", { ip, cookie: admin.cookie })).isi).toEqual({ masuk: false });
    expect(await minta("GET", "/api/dasbor", { ip, cookie: admin.cookie })).toMatchObject({ status: 401, isi: galat("PERLU_MASUK") });
    expect(d1(`SELECT count(*) AS n FROM sesi WHERE hash_token = '${h1}'`)).toEqual([{ n: 0 }]);
    d1(`UPDATE sesi SET kedaluwarsa = ${Date.now() - 1} WHERE hash_token = '${h2}'`);
    expect(await minta("GET", "/api/dasbor", { ip, cookie: lain })).toMatchObject({ status: 401, isi: galat("PERLU_MASUK") });
    expect(d1(`SELECT count(*) AS n FROM sesi WHERE hash_token = '${h2}'`)).toEqual([{ n: 0 }]);
  });

  it("terakhir_dipakai ditulis ulang hanya sesudah lebih dari 5 menit", async () => {
    const admin = await adminSiap(ip);
    const h = hashToken(admin.cookie);
    const empat = Date.now() - 4 * MENIT;
    d1(`UPDATE sesi SET terakhir_dipakai = ${empat} WHERE hash_token = '${h}'`);
    await minta("GET", "/api/dasbor", { ip, cookie: admin.cookie });
    expect(d1(`SELECT terakhir_dipakai FROM sesi WHERE hash_token = '${h}'`)).toEqual([{ terakhir_dipakai: empat }]);
    d1(`UPDATE sesi SET terakhir_dipakai = ${Date.now() - 6 * MENIT} WHERE hash_token = '${h}'`);
    const sebelum = Date.now();
    await minta("GET", "/api/dasbor", { ip, cookie: admin.cookie });
    const [baris] = d1<{ terakhir_dipakai: number }>(`SELECT terakhir_dipakai FROM sesi WHERE hash_token = '${h}'`);
    expect(baris.terakhir_dipakai).toBeGreaterThanOrEqual(sebelum - 1000);
  });
});

describe("kelola akun (P-20 sampai P-27; AC-7, AC-8)", () => {
  const ip = ipBaru();

  it("buat: email dinormalkan, sandi sementara 19 karakter, wajib ganti sandi; email dipakai 409; email dan nama salah 400", async () => {
    const admin = await adminSiap(ip);
    const email = unik("Guru.Baru");
    const j = await minta("POST", "/api/akun", { ip, cookie: admin.cookie, isi: { email: `  ${email.toUpperCase()}  `, namaTampilan: "  Bu Sari  ", peran: "guru", peninjau: true } });
    expect(j.status).toBe(201);
    expect(j.isi).toEqual({
      akun: {
        id: expect.any(String),
        email: email.toLowerCase(),
        namaTampilan: "Bu Sari",
        peran: "guru",
        peninjau: true,
        wajibGantiSandi: true,
        aktif: true,
        dibuatPada: expect.any(Number),
        masukTerakhir: null,
      },
      sandiSementara: expect.stringMatching(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}(-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}){3}$/),
    });
    const sandi = String(j.isi.sandiSementara);
    expect(JSON.stringify(d1("SELECT * FROM pengguna")) + JSON.stringify(d1("SELECT * FROM log_audit"))).not.toContain(sandi);
    expect(await minta("POST", "/api/akun", { ip, cookie: admin.cookie, isi: { email, namaTampilan: "Lain", peran: "guru", peninjau: false } })).toMatchObject({
      status: 409,
      isi: galat("EMAIL_DIPAKAI"),
    });
    expect(await minta("POST", "/api/akun", { ip, cookie: admin.cookie, isi: { email: "guru@sekolah", namaTampilan: "A", peran: "guru", peninjau: false } })).toMatchObject({
      status: 400,
      isi: galat("EMAIL_SALAH"),
    });
    expect(await minta("POST", "/api/akun", { ip, cookie: admin.cookie, isi: { email: unik("n"), namaTampilan: "   ", peran: "guru", peninjau: false } })).toMatchObject({
      status: 400,
      isi: galat("NAMA_SALAH"),
    });
    expect(await minta("POST", "/api/akun", { ip, cookie: admin.cookie, isi: { email: unik("n"), namaTampilan: "A", peran: "kepala", peninjau: false } })).toMatchObject({
      status: 400,
      isi: galat("PERMINTAAN_SALAH"),
    });
    const id = String((j.isi.akun as { id: string }).id);
    expect(d1(`SELECT pengguna_id, aksi, rincian_json FROM log_audit WHERE sasaran = ${sql(id)}`)).toEqual([
      { pengguna_id: admin.id, aksi: "akun.buat", rincian_json: '{"peran":"guru","peninjau":true}' },
    ]);
  });

  it("daftar: kolom P-22 tanpa hash, akun aktif lebih dulu lalu nama tanpa membedakan huruf besar-kecil", async () => {
    const admin = await adminSiap(ip);
    const a = await buatAkun(ip, admin.cookie, unik("zaenal"), "guru", "zaenal");
    await buatAkun(ip, admin.cookie, unik("budi"), "guru", "Budi");
    await minta("PATCH", `/api/akun/${a.id}`, { ip, cookie: admin.cookie, isi: { aktif: false } });
    const j = await minta("GET", "/api/akun", { ip, cookie: admin.cookie });
    expect(j.status).toBe(200);
    const daftar = j.isi.akun as Record<string, unknown>[];
    for (const akun of daftar) expect(Object.keys(akun).sort()).toEqual(["aktif", "dibuatPada", "email", "id", "masukTerakhir", "namaTampilan", "peninjau", "peran", "wajibGantiSandi"]);
    expect(JSON.stringify(j.isi)).not.toMatch(/hash|garam|iterasi/);
    const aktif = daftar.map((x) => x.aktif);
    expect(aktif.indexOf(false)).toBeGreaterThan(aktif.lastIndexOf(true));
    const namaAktif = daftar.filter((x) => x.aktif).map((x) => String(x.namaTampilan).toLowerCase());
    expect(namaAktif).toEqual([...namaAktif].sort((p, q) => (p < q ? -1 : p > q ? 1 : 0)));
  });

  it("ubah setiap kolom; satu baris log audit per perubahan; tanpa perubahan tanpa log", async () => {
    const admin = await adminSiap(ip);
    const g = await buatAkun(ip, admin.cookie, unik("ubah"));
    const ubah = (isi: unknown) => minta("PATCH", `/api/akun/${g.id}`, { ip, cookie: admin.cookie, isi });
    expect((await ubah({ namaTampilan: "  Bu Sari W.  " })).isi).toMatchObject({ akun: { namaTampilan: "Bu Sari W." } });
    expect((await ubah({ peninjau: true })).isi).toMatchObject({ akun: { peninjau: true } });
    expect((await ubah({ peran: "admin" })).isi).toMatchObject({ akun: { peran: "admin" } });
    expect((await ubah({ peran: "guru" })).isi).toMatchObject({ akun: { peran: "guru" } });
    expect((await ubah({ namaTampilan: "Bu Sari W.", peninjau: true })).status).toBe(200);
    expect(await ubah({ namaTampilan: "x".repeat(41) })).toMatchObject({ status: 400, isi: galat("NAMA_SALAH") });
    expect(await ubah({})).toMatchObject({ status: 400, isi: galat("PERMINTAAN_SALAH") });
    expect(await ubah({ email: "baru@b.id" })).toMatchObject({ status: 400, isi: galat("PERMINTAAN_SALAH") });
    expect(await minta("PATCH", "/api/akun/tidak-ada", { ip, cookie: admin.cookie, isi: { peninjau: true } })).toMatchObject({ status: 404, isi: galat("AKUN_TIDAK_ADA") });
    expect(d1(`SELECT pengguna_id, aksi, rincian_json FROM log_audit WHERE sasaran = ${sql(g.id)} ORDER BY waktu, rowid`)).toEqual([
      { pengguna_id: admin.id, aksi: "akun.buat", rincian_json: '{"peran":"guru","peninjau":false}' },
      { pengguna_id: admin.id, aksi: "akun.ubah", rincian_json: '{"nama_tampilan":"Bu Sari W."}' },
      { pengguna_id: admin.id, aksi: "akun.ubah", rincian_json: '{"peninjau":true}' },
      { pengguna_id: admin.id, aksi: "akun.ubah", rincian_json: '{"peran":"admin"}' },
      { pengguna_id: admin.id, aksi: "akun.ubah", rincian_json: '{"peran":"guru"}' },
    ]);
  });

  it("nonaktif menghapus sesi sasaran; atur ulang memberi sandi sementara baru, sandi lama tidak berlaku, sesi terhapus", async () => {
    const admin = await adminSiap(ip);
    const email = unik("atur");
    const g = await buatAkun(ip, admin.cookie, email);
    const sesiG = await masuk(ip, email, g.sandi);
    const ganti = await minta("POST", "/api/sandi", { ip, cookie: sesiG, isi: { sandiBaru: "sandi guru yang baru" } });
    const sesiBaru = ganti.cookie as string;
    expect((await minta("PATCH", `/api/akun/${g.id}`, { ip, cookie: admin.cookie, isi: { aktif: false } })).isi).toMatchObject({ akun: { aktif: false } });
    expect(d1(`SELECT count(*) AS n FROM sesi WHERE pengguna_id = ${sql(g.id)}`)).toEqual([{ n: 0 }]);
    expect(await minta("GET", "/api/dasbor", { ip, cookie: sesiBaru })).toMatchObject({ status: 401, isi: galat("PERLU_MASUK") });
    expect((await minta("PATCH", `/api/akun/${g.id}`, { ip, cookie: admin.cookie, isi: { aktif: true } })).isi).toMatchObject({ akun: { aktif: true } });

    const sesiLagi = await masuk(ip, email, "sandi guru yang baru");
    await minta("POST", "/api/masuk", { ip, isi: { email, sandi: "salah lagi salah" } });
    const atur = await minta("PATCH", `/api/akun/${g.id}`, { ip, cookie: admin.cookie, isi: { aturUlangSandi: true } });
    expect(atur.status).toBe(200);
    expect(atur.isi).toMatchObject({ akun: { wajibGantiSandi: true }, sandiSementara: expect.stringMatching(/^[A-Z2-9]{4}(-[A-Z2-9]{4}){3}$/) });
    expect(atur.isi.sandiSementara).not.toBe(g.sandi);
    expect((await minta("GET", "/api/saya", { ip, cookie: sesiLagi })).isi).toEqual({ masuk: false });
    expect(d1(`SELECT count(*) AS n FROM batas_masuk WHERE kunci = '${kunciEmail(email)}'`)).toEqual([{ n: 0 }]);
    expect((await minta("POST", "/api/masuk", { ip, isi: { email, sandi: "sandi guru yang baru" } })).status).toBe(401);
    expect((await minta("POST", "/api/masuk", { ip, isi: { email, sandi: String(atur.isi.sandiSementara) } })).isi).toMatchObject({ akun: { wajibGantiSandi: true } });
    expect(d1(`SELECT aksi, rincian_json FROM log_audit WHERE sasaran = ${sql(g.id)} AND aksi <> 'sandi.ganti' ORDER BY waktu, rowid`)).toEqual([
      { aksi: "akun.buat", rincian_json: '{"peran":"guru","peninjau":false}' },
      { aksi: "akun.ubah", rincian_json: '{"aktif":false}' },
      { aksi: "akun.ubah", rincian_json: '{"aktif":true}' },
      { aksi: "akun.atur_ulang_sandi", rincian_json: "{}" },
    ]);
    d1(`DELETE FROM batas_masuk WHERE kunci = '${kunciAlamat(ip)}'`);
  });

  it("perlindungan diri 400; dua admin yang saling menurunkan peran bersamaan menyisakan satu admin (409)", async () => {
    const a = await adminSiap(ip);
    for (const isi of [{ peran: "guru" }, { aktif: false }, { aturUlangSandi: true }]) {
      expect(await minta("PATCH", `/api/akun/${a.id}`, { ip, cookie: a.cookie, isi })).toMatchObject({ status: 400, isi: galat("TIDAK_BOLEH_DIRI") });
    }
    expect((await minta("PATCH", `/api/akun/${a.id}`, { ip, cookie: a.cookie, isi: { namaTampilan: "YAN", peninjau: true, peran: "admin" } })).isi).toMatchObject({
      akun: { namaTampilan: "YAN", peninjau: true, peran: "admin" },
    });

    // Basis data uji bersama: hanya dua admin aktif yang tersisa, A dan C.
    const emailC = unik("admin.c");
    const c = await buatAkun(ip, a.cookie, emailC, "admin");
    const cookieC = (await minta("POST", "/api/sandi", { ip, cookie: await masuk(ip, emailC, c.sandi), isi: { sandiBaru: "sandi admin c baru" } })).cookie as string;
    const simpan = d1<{ id: string }>(`SELECT id FROM pengguna WHERE peran = 'admin' AND aktif = 1 AND id NOT IN (${sql(a.id)}, ${sql(c.id)})`).map((r) => r.id);
    const daftar = simpan.map(sql).join(", ");
    if (simpan.length) d1(`UPDATE pengguna SET aktif = 0 WHERE id IN (${daftar})`);
    try {
      const [ac, ca] = await Promise.all([
        minta("PATCH", `/api/akun/${c.id}`, { ip, cookie: a.cookie, isi: { peran: "guru" } }),
        minta("PATCH", `/api/akun/${a.id}`, { ip, cookie: cookieC, isi: { peran: "guru" } }),
      ]);
      // Tepat satu berhasil. Yang lain ditolak pemeriksaan admin terakhir (409), atau, bila peran pengirimnya sudah turun
      // sebelum permintaannya diperiksa, oleh penjaga (403). Keduanya tidak pernah berhasil bersamaan.
      const [menang, kalah] = ac.status === 200 ? [ac, ca] : [ca, ac];
      expect(menang.status).toBe(200);
      expect(kalah.isi).toEqual(kalah.status === 409 ? galat("ADMIN_TERAKHIR") : galat("TIDAK_BERWENANG"));
      expect([403, 409]).toContain(kalah.status);
      expect(d1(`SELECT count(*) AS n FROM pengguna WHERE peran = 'admin' AND aktif = 1 AND id IN (${sql(a.id)}, ${sql(c.id)})`)).toEqual([{ n: 1 }]);
    } finally {
      if (simpan.length) d1(`UPDATE pengguna SET aktif = 1 WHERE id IN (${daftar})`);
    }
  });

  it("guru ditolak di ketiga rute akun (403 TIDAK_BERWENANG); tanpa sesi 401", async () => {
    const admin = await adminSiap(ip);
    const email = unik("guru.biasa");
    const g = await buatAkun(ip, admin.cookie, email);
    const cg = (await minta("POST", "/api/sandi", { ip, cookie: await masuk(ip, email, g.sandi), isi: { sandiBaru: "sandi guru biasa" } })).cookie as string;
    expect(await minta("GET", "/api/akun", { ip, cookie: cg })).toMatchObject({ status: 403, isi: galat("TIDAK_BERWENANG") });
    expect(await minta("POST", "/api/akun", { ip, cookie: cg, isi: { email: unik("x"), namaTampilan: "X", peran: "guru", peninjau: false } })).toMatchObject({
      status: 403,
      isi: galat("TIDAK_BERWENANG"),
    });
    expect(await minta("PATCH", `/api/akun/${g.id}`, { ip, cookie: cg, isi: { peninjau: true } })).toMatchObject({ status: 403, isi: galat("TIDAK_BERWENANG") });
    expect(await minta("GET", "/api/dasbor", { ip, cookie: cg })).toMatchObject({ status: 200, isi: { rujukanBelum: 23 } });
    for (const [metode, jalur] of [
      ["GET", "/api/akun"],
      ["POST", "/api/akun"],
      ["PATCH", `/api/akun/${g.id}`],
      ["GET", "/api/dasbor"],
      ["POST", "/api/sandi"],
    ]) {
      expect(await minta(metode, jalur, { ip, isi: metode === "GET" ? undefined : { peninjau: true } }), `${metode} ${jalur}`).toMatchObject({ status: 401, isi: galat("PERLU_MASUK") });
    }
    // Peran turun saat masuk: permintaan akun.kelola berikutnya 403.
    const emailC = unik("admin.turun");
    const c = await buatAkun(ip, admin.cookie, emailC, "admin");
    const cc = (await minta("POST", "/api/sandi", { ip, cookie: await masuk(ip, emailC, c.sandi), isi: { sandiBaru: "sandi admin turun" } })).cookie as string;
    expect((await minta("GET", "/api/akun", { ip, cookie: cc })).status).toBe(200);
    await minta("PATCH", `/api/akun/${c.id}`, { ip, cookie: admin.cookie, isi: { peran: "guru" } });
    expect(await minta("GET", "/api/akun", { ip, cookie: cc })).toMatchObject({ status: 403, isi: galat("TIDAK_BERWENANG") });
    expect((await minta("GET", "/api/saya", { ip, cookie: cc })).isi).toMatchObject({ masuk: true, akun: { peran: "guru" } });
  });
});

describe("hash ulang (P-2; AC-1)", () => {
  const ip = ipBaru();

  it("akun dengan iterasi 5.000 menjadi 15.000 sesudah masuk, lalu tetap bisa masuk lagi", async () => {
    const email = unik("iterasi.lama");
    const id = crypto.randomUUID();
    const garam = randomBytes(16);
    const sandi = "sandi dengan iterasi lama";
    const hash = createHmac("sha256", KUNCI_SANDI).update(pbkdf2Sync(Buffer.from(sandi.normalize("NFC")), garam, 5_000, 32, "sha256")).digest("base64");
    d1(
      `INSERT INTO pengguna (id, email, nama_tampilan, peran, peninjau, hash_sandi, garam, iterasi, wajib_ganti_sandi, aktif, dibuat_pada) ` +
        `VALUES (${sql(id)}, ${sql(email)}, 'Lama', 'guru', 0, '${hash}', '${garam.toString("base64")}', 5000, 0, 1, ${Date.now()})`,
    );
    await masuk(ip, email, sandi);
    const [baru] = d1<{ iterasi: number; garam: string; hash_sandi: string }>(`SELECT iterasi, garam, hash_sandi FROM pengguna WHERE id = ${sql(id)}`);
    expect(baru.iterasi).toBe(15_000);
    expect(baru.garam).not.toBe(garam.toString("base64"));
    expect(baru.hash_sandi).not.toBe(hash);
    await masuk(ip, email, sandi);
  });
});

describe("dasbor, tajuk, metode, dan batas isi (P-36; AC-13; Data, protokol, API)", () => {
  const ip = ipBaru();

  it("dasbor menjawab 23 rujukan belum diverifikasi di D1 lokal yang disemai", async () => {
    const admin = await adminSiap(ip);
    const j = await minta("GET", "/api/dasbor", { ip, cookie: admin.cookie });
    expect(j).toMatchObject({ status: 200, isi: { rujukanBelum: 23 } });
    expect(d1("SELECT count(*) AS n FROM rujukan WHERE status = 'belum'")).toEqual([{ n: 23 }]);
    for (const [nama, nilai] of Object.entries(TAJUK_JSON)) expect(j.tajuk.get(nama), nama).toBe(nilai);
  });

  it("metode lain 405 dengan Allow; tajuk JSON di setiap jawaban galat; isi lebih dari 4.096 byte 400", async () => {
    for (const [jalur, metode, allow] of [
      ["/api/masuk", "GET", "POST"],
      ["/api/keluar", "GET", "POST"],
      ["/api/saya", "POST", "GET"],
      ["/api/sandi", "GET", "POST"],
      ["/api/akun", "PUT", "GET, POST"],
      ["/api/akun/abc", "DELETE", "PATCH"],
      ["/api/dasbor", "POST", "GET"],
      ["/api/admin-awal", "GET", "POST"],
    ]) {
      const j = await minta(metode, jalur, { ip, tanpaCsrf: true });
      expect(j.status, `${metode} ${jalur}`).toBe(405);
      expect(j.tajuk.get("allow")).toBe(allow);
      for (const [nama, nilai] of Object.entries(TAJUK_JSON)) expect(j.tajuk.get(nama), nama).toBe(nilai);
    }
    const panjang = JSON.stringify({ email: "a@b.id", sandi: "x".repeat(4_100) });
    expect(await minta("POST", "/api/masuk", { ip, isi: panjang })).toMatchObject({ status: 400, isi: galat("PERMINTAAN_SALAH") });
    expect(await adminAwal(ip, "a@b.id", "x".repeat(4_100))).toMatchObject({ status: 400, isi: galat("PERMINTAAN_SALAH") });
  });
});
