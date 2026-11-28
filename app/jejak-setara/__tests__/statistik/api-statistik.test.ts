// GET /api/statistik/kejadian dan isi dasbor JS-13 di atas D1 tiruan dengan migrasi repositori (spesifikasi JS-13, P-1,
// P-3 sampai P-13, P-24 sampai P-26; AC-1 sampai AC-4, AC-7, AC-11).
import { describe, expect, it } from "vitest";
import worker from "../../../../server/jejak-setara/src/index";
import { skemaDasbor } from "../../inti/akun";
import { skemaStatistik } from "../../inti/statistik";
import { D1Tiruan, sqlite } from "../akun/d1Tiruan";
import { isiVersiUji } from "./isiUji";

type Env = Parameters<typeof worker.fetch>[1];
const ASAL = "http://127.0.0.1:4310";
const KUNCI = { KUNCI_SANDI: "kunci-sandi-uji", KUNCI_IP: "kunci-ip-uji", KUNCI_ADMIN: "kunci-admin-uji", ITERASI_SANDI: "1000" };
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const HARI = 86_400_000;
const T0 = Date.now() - 2 * HARI;
const PAKET1 = uuid(901);
const PAKET2 = uuid(902);

function lingkungan(): { d1: D1Tiruan; env: Env; sql: string[] } {
  const d1 = new D1Tiruan();
  const sql: string[] = [];
  const asli = d1.prepare.bind(d1);
  d1.prepare = (s: string) => {
    sql.push(s);
    return asli(s);
  };
  const env = { LINGKUNGAN: "lokal", DB: d1, ASSETS: { fetch: async () => new Response("aset") }, RUANG: {}, BATAS_MASUK: { limit: async () => ({ success: true }) }, ...KUNCI } as unknown as Env;
  d1.basis.exec(`INSERT INTO paket (id, nama, aktif) VALUES ('${PAKET1}', 'Paket inti 16', 1), ('${PAKET2}', 'Paket kedua', 0)`);
  return { d1, env, sql };
}

const cookieDari = (j: Response) => (j.headers.get("Set-Cookie") ?? "").split(";")[0];
async function masukSandi(env: Env, email: string, sandi: string, sandiBaru: string): Promise<string> {
  const sementara = cookieDari(await worker.fetch(new Request(`${ASAL}/api/masuk`, { method: "POST", headers: { "X-Jejak": "1", Origin: ASAL }, body: JSON.stringify({ email, sandi }) }), env));
  const j = await worker.fetch(new Request(`${ASAL}/api/sandi`, { method: "POST", headers: { "X-Jejak": "1", Origin: ASAL, Cookie: sementara }, body: JSON.stringify({ sandiBaru }) }), env);
  expect(j.status).toBe(200);
  return cookieDari(j);
}
async function akun(env: Env): Promise<{ admin: string; guruA: string; guruB: string }> {
  const awal = await worker.fetch(
    new Request(`${ASAL}/api/admin-awal`, { method: "POST", headers: { "X-Jejak-Kunci-Admin": KUNCI.KUNCI_ADMIN }, body: JSON.stringify({ email: "admin@sekolah.sch.id", sandi: "sandi-awal-12345", namaTampilan: "Admin" }) }),
    env,
  );
  expect(awal.status).toBe(200);
  const admin = await masukSandi(env, "admin@sekolah.sch.id", "sandi-awal-12345", "kalimat sandi admin");
  const buat = async (email: string, nama: string) => {
    const j = await worker.fetch(new Request(`${ASAL}/api/akun`, { method: "POST", headers: { "X-Jejak": "1", Origin: ASAL, Cookie: admin }, body: JSON.stringify({ email, namaTampilan: nama, peran: "guru", peninjau: false }) }), env);
    expect(j.status).toBe(201);
    return masukSandi(env, email, ((await j.json()) as { sandiSementara: string }).sandiSementara, "kalimat sandi guru uji");
  };
  return { admin, guruA: await buat("sari@sekolah.sch.id", "Bu Sari"), guruB: await buat("budi@sekolah.sch.id", "Pak Budi") };
}
const idPengguna = (d1: D1Tiruan, email: string) => d1.baris<{ id: string }>("SELECT id FROM pengguna WHERE email = ?", email)[0].id;
const minta = (env: Env, jalur: string, cookie?: string, metode = "GET") =>
  worker.fetch(new Request(ASAL + jalur, { method: metode, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(metode === "GET" ? {} : { "X-Jejak": "1", Origin: ASAL }) } }), env);

function versi(d1: D1Tiruan) {
  d1.basis.exec("INSERT INTO kejadian (id, kode, status, versi_terbit_id, pemilik_id, diubah_pada) VALUES ('k90', 'K-90', 'terbit', NULL, NULL, 0), ('k91', 'K-91', 'terbit', NULL, NULL, 0), ('k92', 'K-92', 'tinjau', NULL, NULL, 0)");
  const isi91 = isiVersiUji("Bekal").replace('"K-90"', '"K-91"');
  for (const [id, kejadian, nomor, isi, jenis] of [["v90-1", "k90", 1, isiVersiUji("Antrean v1"), "terbit"], ["v90-2", "k90", 2, isiVersiUji("Antrean v2"), "terbit"], ["v91-1", "k91", 1, isi91, "terbit"], ["v92-k", "k92", 1, isiVersiUji("Kerja"), "kerja"]] as const)
    d1.jalankan("INSERT INTO kejadian_versi (id, kejadian_id, nomor, isi_json, jenis, dibuat_oleh, dibuat_pada, catatan_perubahan) VALUES (?, ?, ?, ?, ?, NULL, 0, 'x')", id, kejadian, nomor, isi, jenis);
}

function ruang(d1: D1Tiruan, n: number, r: { pemilik: string; label: string; status: string; uji: boolean; dibuat: number; main: boolean; petunjuk: boolean; paket: string; hasil?: Record<string, number> }) {
  d1.jalankan(
    "INSERT INTO ruang (id, kode, pemilik_id, label_kelas, paket_id, pengaturan_json, benih, status, uji, do_id, dibuat_pada, mulai_pada, selesai_pada, ringkasan_json) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)",
    uuid(n),
    `R${String(n).padStart(4, "0")}`,
    r.pemilik,
    r.label,
    r.paket,
    JSON.stringify({ durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, skillAktif: r.petunjuk ? ["lari", "petunjuk"] : ["lari"], modeNomorAbsen: false, uji: r.uji }),
    r.status,
    r.uji ? 1 : 0,
    `do-${n}`,
    r.dibuat,
    r.main ? r.dibuat + 60_000 : null,
    r.main ? r.dibuat + 900_000 : null,
    r.hasil ? JSON.stringify({ pemakaian: {}, hasil: { versi: 1, jumlahKejadian: 1, ...r.hasil } }) : null,
  );
  return uuid(n);
}
function peserta(d1: D1Tiruan, ruangId: string, id: string, skor: number, dikeluarkan = false) {
  d1.jalankan(
    "INSERT INTO peserta (id, ruang_id, nama_samaran, avatar, warna_tas, nomor_absen, skor, waktu_skor_ms, langkah1_benar, jumlah_kejadian, gabung_pada, peringkat_akhir, dikeluarkan) VALUES (?, ?, ?, 1, 'sun', NULL, ?, NULL, 0, 0, 0, NULL, ?)",
    id,
    ruangId,
    `Nama ${id}`,
    skor,
    dikeluarkan ? 1 : 0,
  );
}
function jawab(d1: D1Tiruan, ruangId: string, pesertaId: string, versiId: string, l1: string | null, l2: string | null, detik: number, petunjuk = 0) {
  const t = T0;
  d1.jalankan(
    "INSERT INTO jawaban (id, ruang_id, peserta_id, kejadian_versi_id, urutan_opsi_json, langkah1_opsi, langkah1_benar, petunjuk_dipakai, langkah2_opsi, tingkat, poin, dibuka_pada, langkah1_pada, langkah2_pada) VALUES (?, ?, ?, ?, '{}', ?, ?, ?, ?, ?, 0, ?, ?, ?)",
    `${pesertaId}-${versiId}`,
    ruangId,
    pesertaId,
    versiId,
    l1,
    l1 === null ? null : l1 === "1a" ? 1 : 0,
    petunjuk,
    l2,
    l2 === null ? null : l2 === "2a" ? "tepat" : l2 === "2b" ? "kurang" : "berisiko",
    t,
    l1 === null ? null : t + 5000,
    l2 === null ? null : t + detik * 1000,
  );
}

async function siapkan() {
  const l = lingkungan();
  const k = await akun(l.env);
  const a = idPengguna(l.d1, "sari@sekolah.sch.id");
  const bId = idPengguna(l.d1, "budi@sekolah.sch.id");
  versi(l.d1);
  const R1 = ruang(l.d1, 1, { pemilik: a, label: "IX A", status: "ditutup", uji: false, dibuat: T0 + 1000, main: true, petunjuk: true, paket: PAKET1, hasil: { jumlahPemain: 4, jumlahSkor: 300, langkah1Dijawab: 5, langkah1Benar: 2, tepat: 2, kurang: 1, berisiko: 1 } });
  const R2 = ruang(l.d1, 2, { pemilik: bId, label: "IX B", status: "pembahasan", uji: false, dibuat: T0 + 2000, main: true, petunjuk: false, paket: PAKET2, hasil: { jumlahPemain: 2, jumlahSkor: 165, langkah1Dijawab: 2, langkah1Benar: 1, tepat: 2, kurang: 0, berisiko: 0 } });
  const R3 = ruang(l.d1, 3, { pemilik: a, label: "IX A", status: "ditutup", uji: true, dibuat: T0 + 3000, main: true, petunjuk: true, paket: PAKET1, hasil: { jumlahPemain: 1, jumlahSkor: 100, langkah1Dijawab: 1, langkah1Benar: 1, tepat: 1, kurang: 0, berisiko: 0 } });
  const R4 = ruang(l.d1, 4, { pemilik: a, label: "IX A", status: "main", uji: false, dibuat: T0 + 4000, main: true, petunjuk: true, paket: PAKET1 });
  const R5 = ruang(l.d1, 5, { pemilik: a, label: "IX A", status: "ditutup", uji: false, dibuat: T0 + 5000, main: false, petunjuk: true, paket: PAKET1 });
  const R6 = ruang(l.d1, 6, { pemilik: bId, label: "IX C", status: "selesai", uji: false, dibuat: T0 - 40 * HARI, main: true, petunjuk: false, paket: PAKET1, hasil: { jumlahPemain: 1, jumlahSkor: 25, langkah1Dijawab: 1, langkah1Benar: 0, tepat: 0, kurang: 1, berisiko: 0 } });
  for (let n = 7; n <= 10; n++) ruang(l.d1, n, { pemilik: bId, label: "IX D", status: "ditutup", uji: true, dibuat: T0 + n * 1000, main: true, petunjuk: false, paket: PAKET1 });
  for (const [id, skor, keluar] of [["p1", 100, false], ["p2", 25, false], ["p3", 40, false], ["p4", 0, true], ["p5", 0, false]] as const) peserta(l.d1, R1, id, skor, keluar);
  jawab(l.d1, R1, "p1", "v90-1", "1a", "2a", 30, 1);
  jawab(l.d1, R1, "p2", "v90-1", "1b", "2b", 45);
  jawab(l.d1, R1, "p3", "v90-1", "1a", null, 0);
  jawab(l.d1, R1, "p4", "v90-1", "1c", "2c", 12);
  jawab(l.d1, R1, "p5", "v90-1", null, null, 0);
  jawab(l.d1, R1, "p1", "v91-1", "1b", "2c", 61);
  jawab(l.d1, R1, "p2", "v91-1", "1b", "2a", 20);
  for (const [id, skor] of [["q1", 100], ["q2", 60]] as const) peserta(l.d1, R2, id, skor);
  jawab(l.d1, R2, "q1", "v90-2", "1a", "2a", 10, 1);
  jawab(l.d1, R2, "q2", "v90-2", "1c", "2a", 50);
  peserta(l.d1, R3, "u1", 100);
  jawab(l.d1, R3, "u1", "v90-1", "1a", "2a", 5);
  peserta(l.d1, R4, "m1", 0);
  jawab(l.d1, R4, "m1", "v90-1", "1a", "2a", 5);
  peserta(l.d1, R5, "x1", 0);
  jawab(l.d1, R5, "x1", "v90-1", "1a", "2a", 5);
  peserta(l.d1, R6, "s1", 25);
  jawab(l.d1, R6, "s1", "v90-1", "1d", "2b", 100);
  return { ...l, ...k, a, bId, R1, R2, R3 };
}

async function statistik(env: Env, cookie: string, q = "") {
  const j = await minta(env, `/api/statistik/kejadian${q}`, cookie);
  expect(j.status, q).toBe(200);
  const isi = skemaStatistik.parse(await j.json());
  return { ...isi, ringkas: isi.kejadian.map((k) => `${k.kode}v${k.versi}:${k.dijawab}`) };
}

describe.skipIf(!sqlite)("GET /api/statistik/kejadian (JS-13)", () => {
  it("izin, metode, dan parameter (P-1, P-11)", async () => {
    const s = await siapkan();
    expect((await minta(s.env, "/api/statistik/kejadian")).status).toBe(401);
    expect((await minta(s.env, "/api/statistik/kejadian", s.admin, "POST")).status).toBe(405);
    for (const q of ["?dari=x", "?dari=5&sampai=5", `?label=${"x".repeat(21)}`, "?paket=p-1", "?guru=a%20b"]) expect((await minta(s.env, `/api/statistik/kejadian${q}`, s.admin)).status, q).toBe(400);
    expect((await minta(s.env, "/api/statistik/kelas", s.admin)).status).toBe(404);
  });

  it("admin: ruang, jawaban, definisi, versi, cakupan, dan pilihan paket (P-3 sampai P-12)", async () => {
    const s = await siapkan();
    const h = await statistik(s.env, s.admin);
    expect(h.ringkas).toEqual(["K-90v2:2", "K-90v1:4", "K-91v1:2"]);
    expect(h.cakupan).toEqual({ ruang: 3, pemain: 7, jawaban: 8 });
    expect(h.paket).toEqual([
      { id: PAKET1, nama: "Paket inti 16" },
      { id: PAKET2, nama: "Paket kedua" },
    ]);
    const [v2, v1, k91] = h.kejadian;
    expect(v1).toMatchObject({ judul: "Antrean v1", dijawab: 4, selesai: 3, benar1: 2, ketepatan1: 50, penuh: 1, indeksKesulitan: 0.33, medianDetik: 45, keliruTerbanyak: "1b", petunjuk: 33.3 });
    expect(v1.pilihan1.map((o) => o.n)).toEqual([2, 1, 0, 1]);
    expect(v1.tingkat).toEqual({ tepat: 33.3, kurang: 66.7, berisiko: 0 });
    expect(v2).toMatchObject({ judul: "Antrean v2", dijawab: 2, selesai: 2, benar1: 1, indeksKesulitan: 0.5, medianDetik: 30, keliruTerbanyak: "1c", petunjuk: null });
    expect(k91).toMatchObject({ dijawab: 2, selesai: 2, benar1: 0, ketepatan1: 0, indeksKesulitan: 0, medianDetik: 41, keliruTerbanyak: "1b", petunjuk: 0 });
    expect(k91.tingkat).toEqual({ tepat: 50, kurang: 0, berisiko: 50 });
  });

  it("kepemilikan guru dan saringan admin (P-3, P-11, P-12)", async () => {
    const s = await siapkan();
    const guru = await statistik(s.env, s.guruA, `?guru=${s.bId}`);
    expect(guru.ringkas).toEqual(["K-90v1:3", "K-91v1:2"]);
    expect(guru.cakupan).toEqual({ ruang: 1, pemain: 4, jawaban: 5 });
    expect(guru.paket).toEqual([{ id: PAKET1, nama: "Paket inti 16" }]);
    expect((await statistik(s.env, s.admin, `?guru=${s.bId}`)).ringkas).toEqual(["K-90v2:2", "K-90v1:1"]);
    expect((await statistik(s.env, s.admin, `?dari=${T0 - 50 * HARI}&sampai=${T0 - 30 * HARI}`)).ringkas).toEqual(["K-90v1:1"]);
    expect((await statistik(s.env, s.admin, `?dari=${T0}`)).ringkas).toEqual(["K-90v2:2", "K-90v1:3", "K-91v1:2"]);
    expect((await statistik(s.env, s.admin, `?sampai=${T0 + 1000}`)).ringkas).toEqual(["K-90v1:1"]);
    expect((await statistik(s.env, s.admin, "?label=ix%20b")).ringkas).toEqual(["K-90v2:2"]);
    expect((await statistik(s.env, s.admin, `?paket=${PAKET2}`)).ringkas).toEqual(["K-90v2:2"]);
    const kosong = await statistik(s.env, s.admin, "?label=VIII");
    expect(kosong).toMatchObject({ cakupan: { ruang: 0, pemain: 0, jawaban: 0 }, kejadian: [] });
  });

  it("paling banyak empat pernyataan statistik dalam dua perjalanan (P-13)", async () => {
    const s = await siapkan();
    s.sql.length = 0;
    await statistik(s.env, s.admin);
    const kueri = s.sql.filter((q) => /kejadian_versi|jawaban|paket|COUNT\(\*\) FROM rr/.test(q));
    expect(kueri).toHaveLength(4);
  });
});

describe.skipIf(!sqlite)("GET /api/dasbor (JS-13, P-24 sampai P-26)", () => {
  it("admin: Siap tinjau, sesi terakhir, dan ringkasan 30 hari tanpa membaca jawaban", async () => {
    const s = await siapkan();
    s.sql.length = 0;
    const j = await minta(s.env, "/api/dasbor", s.admin);
    expect(j.status).toBe(200);
    const d = skemaDasbor.parse(await j.json());
    expect(s.sql.some((q) => /jawaban/.test(q))).toBe(false);
    expect(d.siapTinjau).toBe(1);
    expect(d.sesi.map((x) => x.kode)).toEqual(["R0010", "R0009", "R0008", "R0007", "R0003"]);
    expect(d.sesi[4]).toMatchObject({ uji: true, namaGuru: "Bu Sari", jumlahPemain: 1, rataSkor: 100 });
    expect(d.ringkasan).toEqual({ hari: 30, sesi: 2, sesiPendek: 0, pemain: 6, rataSkor: 77.5, ketepatan1: 42.9, tingkat: { tepat: 66.7, kurang: 16.7, berisiko: 16.7 } });
  });

  it("guru: tanpa Siap tinjau, hanya ruang miliknya, dan ruang yang tidak dimainkan dilewati (D-1a)", async () => {
    const s = await siapkan();
    const d = skemaDasbor.parse(await (await minta(s.env, "/api/dasbor", s.guruA)).json());
    expect(d.siapTinjau).toBeNull();
    expect(d.sesi.map((x) => [x.kode, x.uji, x.jumlahPemain, x.rataSkor])).toEqual([
      ["R0003", true, 1, 100],
      ["R0001", false, 4, 41.3],
    ]);
    expect(d.ringkasan).toEqual({ hari: 30, sesi: 1, sesiPendek: 0, pemain: 4, rataSkor: 75, ketepatan1: 40, tingkat: { tepat: 50, kurang: 25, berisiko: 25 } });
  });
});
