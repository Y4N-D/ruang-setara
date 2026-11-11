// Uji Worker, Durable Object, dan D1 lewat HTTP dan WebSocket sungguhan (spesifikasi JS-03, AC-1 sampai AC-15).
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { AKAR, alamat, buatRuang, d1, kelas, klien, matikanServer, nyalakanServer, tidur, upgradeMentah } from "./bantuan";
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/versi";

const B = alamat();
const halo = (opsi: Record<string, unknown> = {}) => ({ v: PROTOKOL_VERSI, t: "halo", peran: "pemain", ...opsi });

async function masuk(kode: string, avatar = 0, port = 4320) {
  const k = await klien(kode, port);
  k.kirim(halo());
  const datang = (await k.tunggu((m) => m.t === "selamat_datang")) as { pemainId: string; token: string; saranNama: string[] };
  k.kirim({ v: PROTOKOL_VERSI, t: "pilih_identitas", nama: datang.saranNama[0], avatar });
  await k.tunggu((m) => m.t === "pemain_baru" && m.id === datang.pemainId);
  return { k, ...datang, nama: datang.saranNama[0] };
}

describe("migrasi D1 (AC-1)", () => {
  it("13 tabel, kunci asing bersih, CHECK aktif, dan menjalankan ulang tidak menerapkan apa pun", () => {
    const tabel = d1<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name").map((r) => r.name);
    expect(tabel).toEqual(
      ["batas_masuk", "d1_migrations", "jawaban", "kejadian", "kejadian_versi", "log_audit", "paket", "paket_kejadian", "pengaturan", "pengguna", "peserta", "ruang", "rujukan", "sesi"].sort(),
    );
    expect(d1("PRAGMA foreign_key_check")).toEqual([]);
    expect(() => d1("INSERT INTO ruang (id, kode, label_kelas, pengaturan_json, benih, status, do_id, dibuat_pada) VALUES ('x', 'AAAAA', 'x', '{}', 1, 'salah', 'd', 1)")).toThrow();
    const ulang = spawnSync(
      process.execPath,
      ["node_modules/wrangler/bin/wrangler.js", "d1", "migrations", "apply", "jejak-setara-lokal", "--local", "--persist-to", "test-results-jejak/keadaan-4320", "--config", "server/jejak-setara/wrangler.jsonc"],
      { cwd: AKAR, encoding: "utf8", env: { ...process.env, WRANGLER_SEND_METRICS: "false", CI: "1" } },
    );
    expect(ulang.status).toBe(0);
    expect(ulang.stdout).toMatch(/No migrations to apply/i);
  });
});

describe("ruang coba dan pemeriksaan kode (AC-2, AC-4)", () => {
  it("201 dengan kode, tautan, dan baris D1 sesuai P-4", async () => {
    const { status, isi } = await buatRuang({ batasPemain: 30 });
    expect(status).toBe(201);
    expect(isi.kode).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}$/);
    expect(isi.tautan).toBe(`${B}/?kode=${isi.kode}`);
    const [baris] = d1<Record<string, unknown>>(`SELECT label_kelas, pemilik_id, paket_id, status, uji, pengaturan_json FROM ruang WHERE kode = '${isi.kode}'`);
    // Sejak JS-08 server uji menyemai bank awal, jadi ruang coba memuat Paket inti 16 (P-3, P-4).
    expect(isi.kejadian).toBe(16);
    expect(baris).toMatchObject({ label_kelas: "Ruang coba", pemilik_id: null, paket_id: "9880c4d5-8294-51c9-971a-e95531a2e039", status: "lobi", uji: 1 });
    expect(JSON.parse(String(baris.pengaturan_json))).toEqual({ durasiMenit: 15, batasPemain: 30, batasTerlambatMenit: 5, skillAktif: ["lari", "kompas", "petunjuk"], modeNomorAbsen: false, uji: true });
  });

  it("isi tidak sah 400; nomor absen untuk lebih dari 50 pemain 400 dengan pesan khusus; GET 405", async () => {
    for (const isi of [{ batasPemain: 101 }, { batasPemain: 1 }, { warna: "biru" }, "bukan json"]) {
      const j = await fetch(`${B}/api/ruang-coba`, { method: "POST", body: typeof isi === "string" ? isi : JSON.stringify(isi) });
      expect(j.status, JSON.stringify(isi)).toBe(400);
    }
    const absen = await buatRuang({ modeNomorAbsen: true, batasPemain: 60 });
    expect(absen).toEqual({ status: 400, isi: { galat: { kode: "PENGATURAN_SALAH", pesan: "Mode nomor absen hanya untuk ruang sampai 50 pemain." } } });
    expect((await fetch(`${B}/api/ruang-coba`)).status).toBe(405);
  });

  it("pemeriksaan kode: 200 tanpa peka huruf, 404 untuk kode tidak ada atau ruang ditutup, 405 untuk POST", async () => {
    const { isi } = await buatRuang({ modeNomorAbsen: true });
    const kode = String(isi.kode);
    const j = await fetch(`${B}/api/publik/ruang/${kode.toLowerCase()}`);
    expect([j.status, await j.json()]).toEqual([200, { ada: true, modeNomorAbsen: true }]);
    expect((await fetch(`${B}/api/publik/ruang/ZZZZZ`)).status).toBe(404);
    expect((await fetch(`${B}/api/publik/ruang/${kode}`, { method: "POST" })).status).toBe(405);
  });
});

describe("rute WebSocket (AC-5)", () => {
  it("426 tanpa Upgrade; 403 tanpa Origin atau Origin lain; 404 kode tidak ada; 101 dengan Origin sendiri", async () => {
    const { isi } = await buatRuang();
    const kode = String(isi.kode);
    expect((await fetch(`${B}/ws/ruang/${kode}`)).status).toBe(426);
    // vite preview memutus soket untuk upgrade yang ditolak (status 0); Worker sendiri menjawab 403/404 (uji kerangka).
    for (const [jalur, tajuk] of [[`/ws/ruang/${kode}`, {}], [`/ws/ruang/${kode}`, { Origin: "https://lain.contoh.id" }], ["/ws/ruang/ZZZZZ", { Origin: B }]] as const) {
      expect([0, 403, 404], jalur).toContain(await upgradeMentah(jalur, tajuk));
    }
    expect(await upgradeMentah(`/ws/ruang/${kode}`, { Origin: B, "X-Jejak-Peran": "guru" })).toBe(101);
  });
});

describe("sambungan, bergabung, dan sambung ulang (AC-6 sampai AC-9)", () => {
  it("pesan terlalu besar: galat TERLALU_CEPAT pada pelanggaran ke-3, tutup 1008 pada ke-10", async () => {
    const { isi } = await buatRuang();
    const k = await klien(String(isi.kode));
    k.kirim(halo());
    await k.tunggu((m) => m.t === "selamat_datang");
    for (let i = 0; i < 10; i++) k.kirim("x".repeat(2100));
    await k.tunggu((m) => m.t === "galat" && m.kode === "TERLALU_CEPAT");
    for (let i = 0; i < 50 && k.tutupKode === null; i++) await tidur(50);
    expect(k.tutupKode).toBe(1008);
  });

  it("tanpa halo dalam 10 detik: ruang menutup sambungan lewat alarm (4002)", async () => {
    // Runtime lokal tidak meneruskan penutupan yang dimulai dari alarm ke klien, jadi yang diperiksa adalah
    // keadaan ruang (statistik kait uji). Penerimaan kode 4002 di klien diperiksa di lingkungan uji Cloudflare.
    const { isi } = await buatRuang();
    const kode = String(isi.kode);
    await klien(kode);
    const statistik = async () => (await (await fetch(`${B}/api/ruang-coba/${kode}/statistik`)).json()) as Record<string, number>;
    expect(await statistik()).toMatchObject({ sambungan: 1, menungguHalo: 1 });
    await tidur(11_000);
    expect(await statistik()).toMatchObject({ sambungan: 0, menungguHalo: 0 });
  }, 20_000);

  it("bergabung, ruang penuh, dan sambung ulang dengan token", async () => {
    const { isi } = await buatRuang({ batasPemain: 2 });
    const kode = String(isi.kode);
    const a = await masuk(kode, 1);
    const b = await masuk(kode, 2);
    expect(a.k.masuk.filter((m) => m.t === "pemain_baru").map((m) => m.id)).toEqual([a.pemainId, b.pemainId]);
    const c = await klien(kode);
    c.kirim(halo());
    expect(await c.tunggu((m) => m.t === "galat")).toMatchObject({ kode: "RUANG_PENUH" });
    a.k.ws.close();
    await tidur(200);
    const ulang = await klien(kode);
    ulang.kirim(halo({ token: a.token }));
    expect(await ulang.tunggu((m) => m.t === "selamat_datang")).toMatchObject({ pemainId: a.pemainId, token: a.token, saranNama: [] });
    await ulang.tunggu((m) => m.t === "pemain_baru" && m.id === a.pemainId);
  });

  it("dikeluarkan lewat kait uji: galat, tutup 4004, pemain lain menerima pemain_pergi", async () => {
    const { isi } = await buatRuang();
    const kode = String(isi.kode);
    const a = await masuk(kode);
    const b = await masuk(kode);
    expect(await kelas(kode, { v: PROTOKOL_VERSI, t: "keluarkan", pemainId: a.pemainId })).toBe(200);
    await a.k.tunggu((m) => m.t === "galat" && m.kode === "DIKELUARKAN");
    await b.k.tunggu((m) => m.t === "pemain_pergi" && m.id === a.pemainId);
    for (let i = 0; i < 40 && a.k.tutupKode === null; i++) await tidur(50);
    expect(a.k.tutupKode).toBe(4004);
    expect(await kelas(kode, { v: PROTOKOL_VERSI, t: "halo", peran: "guru" })).toBe(400);
  });
});

describe("siklus, kiriman ke D1, dan muat ulang Durable Object (AC-11, AC-14, AC-15)", () => {
  it("mulai lewat kait uji, main sesudah 3 detik, akhiri, lalu D1 berisi peserta, peringkat, dan waktu", async () => {
    const { isi } = await buatRuang();
    const kode = String(isi.kode);
    const a = await masuk(kode);
    await kelas(kode, { v: PROTOKOL_VERSI, t: "mulai" });
    await a.k.tunggu((m) => m.t === "status_ruang" && m.status === "main", 6000);
    await kelas(kode, { v: PROTOKOL_VERSI, t: "akhiri" });
    await a.k.tunggu((m) => m.t === "status_ruang" && m.status === "selesai");
    await tidur(300);
    const [r] = d1<Record<string, unknown>>(
      `SELECT r.status, r.mulai_pada IS NOT NULL AS mulai, r.selesai_pada IS NOT NULL AS selesai, p.nama_samaran, p.peringkat_akhir FROM ruang r JOIN peserta p ON p.ruang_id = r.id WHERE r.kode = '${kode}'`,
    );
    expect(r).toEqual({ status: "selesai", mulai: 1, selesai: 1, nama_samaran: a.nama, peringkat_akhir: 1 });
  });

  it("baris peserta sampai di D1 dalam 30 detik tanpa ronde berakhir", async () => {
    const { isi } = await buatRuang();
    const a = await masuk(String(isi.kode));
    await tidur(31_500);
    expect(d1(`SELECT nama_samaran FROM peserta WHERE id = '${a.pemainId}'`)).toEqual([{ nama_samaran: a.nama }]);
  }, 45_000);

  it("server dimatikan lalu dinyalakan lagi dengan keadaan yang sama: token melanjutkan pemain", async () => {
    const keadaan = "test-results-jejak/keadaan-4321";
    let anak = await nyalakanServer(4321, ["--tanpa-build", "--keadaan", keadaan]);
    let kode = "";
    let a: Awaited<ReturnType<typeof masuk>>;
    let awal = { x: 0, y: 0 };
    try {
      const { isi } = await buatRuang({}, 4321);
      kode = String(isi.kode);
      a = await masuk(kode, 3, 4321);
      // JS-07: posisi di lobi ikut tersimpan saat terputus, dan ruang yang dipulihkan memakai peta kampung.
      awal = (await a.k.tunggu((m) => m.t === "koreksi")) as { x: number; y: number };
      await tidur(300); // anggaran jarak terkumpul sejak posisi awal (JS-07, P-52)
      a.k.kirim({ v: PROTOKOL_VERSI, t: "gerak", x: awal.x + 6, y: awal.y, arah: "kanan", jalan: false, seq: 1 });
      await tidur(300);
      a.k.ws.close();
      await tidur(300);
    } finally {
      await matikanServer(anak);
    }
    anak = await nyalakanServer(4321, ["--tanpa-build", "--keadaan", keadaan, "--pakai-ulang"]);
    try {
      const ulang = await klien(kode, 4321);
      ulang.kirim(halo({ token: a.token }));
      expect(await ulang.tunggu((m) => m.t === "selamat_datang")).toMatchObject({ pemainId: a.pemainId, saranNama: [] });
      expect(await ulang.tunggu((m) => m.t === "pemain_baru" && m.id === a.pemainId)).toMatchObject({ nama: a.nama, avatar: 3 });
      expect(await ulang.tunggu((m) => m.t === "koreksi")).toMatchObject({ x: awal.x + 6, y: awal.y, seq: 0 });
    } finally {
      await matikanServer(anak);
    }
  }, 120_000);
});
