// Rute riwayat, hasil, rincian, ekspor, dan hapus di atas D1 tiruan (spesifikasi JS-11, P-17, P-21, P-24, P-26 sampai
// P-30, P-33; AC-13, AC-15, AC-17, AC-19).
import { describe, expect, it } from "vitest";
import worker from "../../../../server/jejak-setara/src/index";
import { skemaHasilRuang, skemaRiwayat, skemaRincianPeserta } from "../../inti/hasil";
import { D1Tiruan, sqlite } from "../akun/d1Tiruan";

type Env = Parameters<typeof worker.fetch>[1];
const ASAL = "http://127.0.0.1:4310";
const KUNCI = { KUNCI_SANDI: "kunci-sandi-uji", KUNCI_IP: "kunci-ip-uji", KUNCI_ADMIN: "kunci-admin-uji", ITERASI_SANDI: "1000" };

function lingkungan(): { d1: D1Tiruan; env: Env } {
  const d1 = new D1Tiruan();
  const RUANG = {
    idFromString: (s: string) => s,
    get: () => ({ fetch: async () => new Response(JSON.stringify({ status: "selesai", terkunci: false, mulaiPada: 1, berakhirPada: 2, jedaSejak: null, pemain: [], kirimanTertunda: true })) }),
  };
  const env = { LINGKUNGAN: "lokal", DB: d1, ASSETS: { fetch: async () => new Response("aset") }, RUANG, BATAS_MASUK: { limit: async () => ({ success: true }) }, ...KUNCI } as unknown as Env;
  d1.basis.exec("INSERT INTO paket (id, nama, aktif) VALUES ('p-1', 'Paket inti 16', 1)");
  return { d1, env };
}

function minta(env: Env, metode: string, jalur: string, cookie?: string, tajuk: Record<string, string> = {}): Promise<Response> {
  const h: Record<string, string> = { ...tajuk };
  if (metode !== "GET" && !("X-Jejak" in tajuk)) Object.assign(h, { "X-Jejak": "1", Origin: ASAL });
  if (cookie) h.Cookie = cookie;
  return worker.fetch(new Request(ASAL + jalur, { method: metode, headers: h }), env);
}
const cookieDari = (j: Response) => (j.headers.get("Set-Cookie") ?? "").split(";")[0];

async function masukSandi(env: Env, email: string, sandi: string, sandiBaru: string): Promise<string> {
  const sementara = cookieDari(await worker.fetch(new Request(`${ASAL}/api/masuk`, { method: "POST", headers: { "X-Jejak": "1", Origin: ASAL }, body: JSON.stringify({ email, sandi }) }), env));
  const j = await worker.fetch(new Request(`${ASAL}/api/sandi`, { method: "POST", headers: { "X-Jejak": "1", Origin: ASAL, Cookie: sementara }, body: JSON.stringify({ sandiBaru }) }), env);
  expect(j.status).toBe(200);
  return cookieDari(j);
}

async function akun(env: Env): Promise<{ admin: string; guru: string; guru2: string }> {
  const awal = await worker.fetch(
    new Request(`${ASAL}/api/admin-awal`, { method: "POST", headers: { "X-Jejak-Kunci-Admin": KUNCI.KUNCI_ADMIN }, body: JSON.stringify({ email: "admin@sekolah.sch.id", sandi: "sandi-awal-12345", namaTampilan: "Admin" }) }),
    env,
  );
  expect(awal.status).toBe(200);
  const admin = await masukSandi(env, "admin@sekolah.sch.id", "sandi-awal-12345", "kalimat sandi admin");
  const buatGuru = async (email: string, nama: string) => {
    const j = await worker.fetch(
      new Request(`${ASAL}/api/akun`, { method: "POST", headers: { "X-Jejak": "1", Origin: ASAL, Cookie: admin }, body: JSON.stringify({ email, namaTampilan: nama, peran: "guru", peninjau: false }) }),
      env,
    );
    expect(j.status).toBe(201);
    return masukSandi(env, email, ((await j.json()) as { sandiSementara: string }).sandiSementara, "kalimat sandi guru uji");
  };
  return { admin, guru: await buatGuru("sari@sekolah.sch.id", "Bu Sari"), guru2: await buatGuru("budi@sekolah.sch.id", "Pak Budi") };
}

const idGuru = (d1: D1Tiruan, email: string) => d1.baris<{ id: string }>("SELECT id FROM pengguna WHERE email = ?", email)[0].id;
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const JAM = 3_600_000;
const T0 = Date.UTC(2026, 10, 20, 0, 0, 0);

function isiVersi(kode: string, judul: string) {
  return JSON.stringify({
    kode,
    judul,
    langkah1: { opsi: [{ id: "1a", teks: "Hak ibu", benar: true }, { id: "1b", teks: "Hak penjual", benar: false }, { id: "1c", teks: "Pilihan C", benar: false }, { id: "1d", teks: "Pilihan D", benar: false }] },
    langkah2: { opsi: [{ id: "2a", teks: "Menolak dengan sopan", tingkat: "tepat" }, { id: "2b", teks: "Diam saja", tingkat: "kurang" }, { id: "2c", teks: "Ikut menyerobot", tingkat: "berisiko" }] },
  });
}

/** Ruang `n` milik `pemilik`; ronde dimainkan bila `mulai` terisi. */
function tambahRuang(d1: D1Tiruan, n: number, r: { pemilik: string; label: string; status?: string; dibuat?: number; mulai?: number | null; selesai?: number | null; uji?: boolean }) {
  const dibuat = r.dibuat ?? T0 + n * JAM;
  const mulai = r.mulai === undefined ? dibuat + 60_000 : r.mulai;
  const selesai = r.selesai === undefined ? (mulai === null ? dibuat + 120_000 : mulai + 15 * 60_000) : r.selesai;
  d1.jalankan(
    "INSERT INTO ruang (id, kode, pemilik_id, label_kelas, paket_id, pengaturan_json, benih, status, uji, do_id, dibuat_pada, mulai_pada, selesai_pada) VALUES (?, ?, ?, ?, 'p-1', ?, 1, ?, ?, ?, ?, ?, ?)",
    uuid(n),
    `R${String(n).padStart(4, "0")}`,
    r.pemilik,
    r.label,
    JSON.stringify({ durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, skillAktif: [], modeNomorAbsen: true, uji: r.uji ?? true }),
    r.status ?? "ditutup",
    r.uji === false ? 0 : 1,
    `do-${n}`,
    dibuat,
    mulai,
    selesai,
  );
  return uuid(n);
}

function tambahPeserta(d1: D1Tiruan, ruang: string, id: string, p: { nama: string; skor: number; peringkat: number | null; dikeluarkan?: boolean; absen?: number; gabung: number; waktuSkor?: number | null; selesai?: number }) {
  d1.jalankan(
    "INSERT INTO peserta (id, ruang_id, nama_samaran, avatar, warna_tas, nomor_absen, skor, waktu_skor_ms, langkah1_benar, jumlah_kejadian, gabung_pada, peringkat_akhir, dikeluarkan) VALUES (?, ?, ?, 1, 'sun', ?, ?, ?, 0, ?, ?, ?, ?)",
    id,
    ruang,
    p.nama,
    p.absen ?? null,
    p.skor,
    p.waktuSkor ?? null,
    p.selesai ?? 0,
    p.gabung,
    p.peringkat,
    p.dikeluarkan ? 1 : 0,
  );
}

function tambahJawaban(d1: D1Tiruan, ruang: string, peserta: string, versi: string, l1: string, l2: string | null, dibuka: number) {
  const tingkat = l2 === null ? null : l2 === "2a" ? "tepat" : l2 === "2b" ? "kurang" : "berisiko";
  const poin = (l1 === "1a" ? 40 : 0) + (l2 === "2a" ? 60 : l2 === "2b" ? 25 : 0);
  d1.jalankan(
    "INSERT INTO jawaban (id, ruang_id, peserta_id, kejadian_versi_id, urutan_opsi_json, langkah1_opsi, langkah1_benar, petunjuk_dipakai, langkah2_opsi, tingkat, poin, dibuka_pada, langkah1_pada, langkah2_pada) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)",
    `${peserta}:${versi}`,
    ruang,
    peserta,
    versi,
    JSON.stringify({ langkah1: ["1b", "1a", "1d", "1c"], langkah2: ["2c", "2a", "2b"] }),
    l1,
    l1 === "1a" ? 1 : 0,
    l2,
    tingkat,
    poin,
    dibuka,
    dibuka + 5_000,
    l2 === null ? null : dibuka + 30_400,
  );
}

/** Satu ruang dimainkan: tiga peserta (satu dikeluarkan), dua kejadian (versi terbit dan versi kerja). */
function siapkanHasil(d1: D1Tiruan, pemilik: string): string {
  d1.basis.exec("INSERT INTO kejadian (id, kode, status, diubah_pada) VALUES ('k-13', 'K-13', 'terbit', 1), ('k-6', 'K-06', 'tinjau', 1)");
  d1.jalankan("INSERT INTO kejadian_versi (id, kejadian_id, nomor, isi_json, jenis, dibuat_pada) VALUES ('v-13', 'k-13', 2, ?, 'terbit', 1)", isiVersi("K-13", "Antrean puskesmas"));
  d1.jalankan("INSERT INTO kejadian_versi (id, kejadian_id, nomor, isi_json, jenis, dibuat_pada) VALUES ('v-6', 'k-6', 0, ?, 'kerja', 1)", isiVersi("K-06", "Zebra cross"));
  const id = tambahRuang(d1, 1, { pemilik, label: "IX B" });
  const t = T0 + 2 * JAM;
  tambahPeserta(d1, id, "pa", { nama: "Jalak Biru", skor: 165, peringkat: 1, absen: 7, gabung: t + 1, waktuSkor: 61_000, selesai: 2 });
  tambahPeserta(d1, id, "pb", { nama: "Kancil Hijau", skor: 40, peringkat: 2, absen: 3, gabung: t + 2, waktuSkor: 30_000, selesai: 0 });
  tambahPeserta(d1, id, "pc", { nama: "Rusa Merah", skor: 0, peringkat: null, dikeluarkan: true, absen: 9, gabung: t + 3 });
  tambahJawaban(d1, id, "pa", "v-13", "1a", "2a", t + 10_000);
  tambahJawaban(d1, id, "pa", "v-6", "1b", "2b", t + 20_000);
  tambahJawaban(d1, id, "pb", "v-13", "1a", null, t + 30_000);
  tambahJawaban(d1, id, "pc", "v-13", "1b", "2c", t + 40_000);
  return id;
}

const json = async (j: Response) => (await j.json()) as Record<string, unknown>;

describe.skipIf(!sqlite)("riwayat ruang (P-17)", () => {
  it("hanya ruang ditutup; guru hanya miliknya; admin semua dan saringan guru; dimainkan dan rata-rata", async () => {
    const { d1, env } = lingkungan();
    const { admin, guru } = await akun(env);
    const sari = idGuru(d1, "sari@sekolah.sch.id");
    const budi = idGuru(d1, "budi@sekolah.sch.id");
    siapkanHasil(d1, sari);
    tambahRuang(d1, 2, { pemilik: sari, label: "VIII A", status: "pembahasan" });
    tambahRuang(d1, 3, { pemilik: budi, label: "ix c", mulai: null });
    tambahRuang(d1, 4, { pemilik: sari, label: "IX D", mulai: T0 + 4 * JAM + 10_000, selesai: T0 + 4 * JAM + 5_000 }); // ditutup saat hitung mundur
    const olehGuru = skemaRiwayat.parse(await json(await minta(env, "GET", "/api/ruang/riwayat", guru)));
    expect(olehGuru.ruang.map((r) => r.labelKelas)).toEqual(["IX D", "IX B"]);
    expect(olehGuru.ruang[0]).toMatchObject({ dimainkan: false, rataSkor: null, jumlahPemain: 0 });
    expect(olehGuru.ruang[1]).toMatchObject({ dimainkan: true, jumlahPemain: 2, rataSkor: 102.5, namaGuru: "Bu Sari", uji: true });
    expect(olehGuru.berikutnya).toBeNull();
    const olehAdmin = skemaRiwayat.parse(await json(await minta(env, "GET", "/api/ruang/riwayat", admin)));
    expect(olehAdmin.ruang.map((r) => r.labelKelas)).toEqual(["IX D", "ix c", "IX B"]);
    const saringGuru = skemaRiwayat.parse(await json(await minta(env, "GET", `/api/ruang/riwayat?guru=${budi}`, admin)));
    expect(saringGuru.ruang.map((r) => r.labelKelas)).toEqual(["ix c"]);
    // Guru tidak bisa melihat ruang guru lain lewat parameter guru.
    expect(skemaRiwayat.parse(await json(await minta(env, "GET", `/api/ruang/riwayat?guru=${budi}`, guru))).ruang.map((r) => r.labelKelas)).toEqual(["IX D", "IX B"]);
  });

  it("label sebagian tanpa membedakan huruf; tanggal: batas bawah ikut, batas atas tidak; penanda halaman tidak melompati atau mengulang", async () => {
    const { d1, env } = lingkungan();
    const { admin } = await akun(env);
    const sari = idGuru(d1, "sari@sekolah.sch.id");
    for (let n = 1; n <= 5; n++) tambahRuang(d1, n, { pemilik: sari, label: n % 2 ? `IX ${n}` : `VIII ${n}`, dibuat: T0 + n * JAM });
    const label = async (q: string) => skemaRiwayat.parse(await json(await minta(env, "GET", `/api/ruang/riwayat?${q}`, admin))).ruang.map((r) => r.labelKelas);
    expect(await label("label=ix")).toEqual(["IX 5", "IX 3", "IX 1"]);
    expect(await label("label=VIII")).toEqual(["VIII 4", "VIII 2"]);
    expect(await label(`dari=${T0 + 2 * JAM}&sampai=${T0 + 4 * JAM}`)).toEqual(["IX 3", "VIII 2"]);
    const semua: string[] = [];
    let mulai: string | null = "";
    for (let i = 0; i < 10 && mulai !== null; i++) {
      const h = skemaRiwayat.parse(await json(await minta(env, "GET", `/api/ruang/riwayat?batas=2${mulai ? `&mulai=${mulai}` : ""}`, admin)));
      semua.push(...h.ruang.map((r) => r.labelKelas));
      mulai = h.berikutnya;
    }
    expect(semua).toEqual(["IX 5", "VIII 4", "IX 3", "VIII 2", "IX 1"]);
    for (const q of ["dari=x", "batas=99", "label=", "mulai=abc"]) {
      const j = await minta(env, "GET", `/api/ruang/riwayat?${q}`, admin);
      expect(j.status, q).toBe(400);
      expect((await json(j)).galat).toMatchObject({ kode: "ISI_SALAH" });
    }
    expect((await minta(env, "GET", "/api/ruang/riwayat")).status).toBe(401);
  });
});

describe.skipIf(!sqlite)("hasil dan rincian (P-21, P-24)", () => {
  it("angka per peserta, urutan, dan ringkasan; guru lain 404; ruang yang belum selesai 409", async () => {
    const { d1, env } = lingkungan();
    const { admin, guru, guru2 } = await akun(env);
    const id = siapkanHasil(d1, idGuru(d1, "sari@sekolah.sch.id"));
    d1.jalankan("UPDATE ruang SET ringkasan_json = ? WHERE id = ?", JSON.stringify({ pemakaian: {}, hasil: { versi: 1, jumlahKejadian: 16, jumlahPemain: 2, jumlahSkor: 205, langkah1Dijawab: 3, langkah1Benar: 2, tepat: 1, kurang: 1, berisiko: 0 } }), id);
    const h = skemaHasilRuang.parse(await json(await minta(env, "GET", `/api/ruang/${id}/hasil`, guru)));
    expect(h.info).toEqual({ namaPaket: "Paket inti 16", jumlahKejadian: 16, durasiMenit: 15, modeNomorAbsen: true, mulaiPada: T0 + JAM + 60_000, selesaiPada: T0 + JAM + 60_000 + 15 * 60_000 });
    expect(h.dimainkan).toBe(true);
    expect(h.peserta.map((p) => [p.nama, p.peringkat, p.dikeluarkan])).toEqual([
      ["Jalak Biru", 1, false],
      ["Kancil Hijau", 2, false],
      ["Rusa Merah", null, true],
    ]);
    expect(h.peserta[0]).toMatchObject({ nomorAbsen: 7, skor: 165, selesai: 2, langkah1Dijawab: 2, langkah1Benar: 1, tepat: 1, kurang: 1, berisiko: 0, waktuSkorMs: 61_000 });
    expect(h.peserta[1]).toMatchObject({ langkah1Dijawab: 1, langkah1Benar: 1, tepat: 0 });
    // Ringkasan sama dengan ringkasan_json.hasil (P-14): rata 205/2, Langkah 1 2/3, Langkah 2 1:1:0.
    expect(h.ringkasan).toEqual({ jumlahPemain: 2, dikeluarkan: 1, rataSkor: 102.5, ketepatan1: 66.7, tingkat: { tepat: 50, kurang: 50, berisiko: 0 } });
    expect((await minta(env, "GET", `/api/ruang/${id}/hasil`, admin)).status).toBe(200);
    expect((await minta(env, "GET", `/api/ruang/${id}/hasil`, guru2)).status).toBe(404);
    d1.jalankan("UPDATE ruang SET status = 'main' WHERE id = ?", id);
    const belum = await minta(env, "GET", `/api/ruang/${id}/hasil`, guru);
    expect(belum.status).toBe(409);
    expect((await json(belum)).galat).toMatchObject({ kode: "HASIL_BELUM_ADA", pesan: "Hasil tersedia sesudah ronde selesai." });
  });

  it("ruang yang tidak dimainkan: ringkasan null", async () => {
    const { d1, env } = lingkungan();
    const { guru } = await akun(env);
    const id = tambahRuang(d1, 5, { pemilik: idGuru(d1, "sari@sekolah.sch.id"), label: "IX E", mulai: null });
    const h = skemaHasilRuang.parse(await json(await minta(env, "GET", `/api/ruang/${id}/hasil`, guru)));
    expect(h).toMatchObject({ dimainkan: false, ringkasan: null, peserta: [] });
  });

  it("rincian: huruf menurut urutan acak pemain, versi terbit dan versi kerja; peserta asing 404 PEMAIN_TIDAK_ADA", async () => {
    const { d1, env } = lingkungan();
    const { guru } = await akun(env);
    const id = siapkanHasil(d1, idGuru(d1, "sari@sekolah.sch.id"));
    const r = skemaRincianPeserta.parse(await json(await minta(env, "GET", `/api/ruang/${id}/hasil/pa`, guru)));
    expect(r.peserta).toEqual({ id: "pa", nama: "Jalak Biru" });
    expect(r.jawaban.map((j) => j.kode)).toEqual(["K-06", "K-13"]);
    expect(r.jawaban[0]).toMatchObject({ versi: null, huruf1: "A", pilihan1: "Hak penjual", benar1: false, jawabanTepat1: "Hak ibu", huruf2: "C", pilihan2: "Diam saja", tingkat2: "kurang", poin: 25, waktuMenjawabMs: 30_400 });
    expect(r.jawaban[1]).toMatchObject({ versi: 2, huruf1: "B", benar1: true, huruf2: "B", tingkat2: "tepat", poin: 100 });
    const pb = skemaRincianPeserta.parse(await json(await minta(env, "GET", `/api/ruang/${id}/hasil/pb`, guru)));
    expect(pb.jawaban[0]).toMatchObject({ huruf2: null, pilihan2: null, tingkat2: null, waktuMenjawabMs: null, pilihanTepat2: ["Menolak dengan sopan"] });
    tambahRuang(d1, 9, { pemilik: idGuru(d1, "sari@sekolah.sch.id"), label: "Lain" });
    tambahPeserta(d1, uuid(9), "asing", { nama: "Elang", skor: 0, peringkat: 1, gabung: 1 });
    const asing = await minta(env, "GET", `/api/ruang/${id}/hasil/asing`, guru);
    expect(asing.status).toBe(404);
    expect((await json(asing)).galat).toMatchObject({ kode: "PEMAIN_TIDAK_ADA" });
    expect((await minta(env, "GET", `/api/ruang/${id}/hasil/a%20b`, guru)).status).toBe(404);
  });
});

describe.skipIf(!sqlite)("ekspor CSV (P-26 sampai P-30)", () => {
  it("tajuk, nama berkas, BOM, isi; jenis salah 400; ruang belum selesai 409; guru lain 404", async () => {
    const { d1, env } = lingkungan();
    const { guru, guru2 } = await akun(env);
    const id = siapkanHasil(d1, idGuru(d1, "sari@sekolah.sch.id"));
    const j = await minta(env, "GET", `/api/ruang/${id}/ekspor?jenis=peserta`, guru);
    expect(j.status).toBe(200);
    expect(j.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    expect(j.headers.get("Content-Disposition")).toBe('attachment; filename="jejak-setara_ix-b_2026-11-20_peserta.csv"');
    expect(j.headers.get("Cache-Control")).toBe("no-store");
    expect(j.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(j.headers.get("Content-Security-Policy")).toBe("default-src 'none'; frame-ancestors 'none'");
    const byte = new Uint8Array(await j.arrayBuffer());
    expect([...byte.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const baris = new TextDecoder().decode(byte).slice(1).split("\r\n");
    expect(baris).toHaveLength(5);
    expect(baris[1].startsWith("IX B;2026-11-20;1;Jalak Biru;7;165;2;2;1;50,0;1;1;0;61,0;")).toBe(true);
    expect(baris[3].endsWith(";Dikeluarkan")).toBe(true);
    const jawaban = await minta(env, "GET", `/api/ruang/${id}/ekspor?jenis=jawaban`, guru);
    const isi = new TextDecoder().decode(new Uint8Array(await jawaban.arrayBuffer())).slice(1).split("\r\n");
    expect(isi.slice(1, -1).map((b) => b.split(";").slice(2, 5).join(";"))).toEqual(["Jalak Biru;7;K-06", "Jalak Biru;7;K-13", "Kancil Hijau;3;K-13", "Rusa Merah;9;K-13"]);
    expect(isi[1].split(";")[6]).toBe("Kerja");
    for (const q of ["", "?jenis=semua"]) {
      const salah = await minta(env, "GET", `/api/ruang/${id}/ekspor${q}`, guru);
      expect(salah.status, q).toBe(400);
    }
    expect((await minta(env, "GET", `/api/ruang/${id}/ekspor?jenis=peserta`, guru2)).status).toBe(404);
    d1.jalankan("UPDATE ruang SET status = 'jeda' WHERE id = ?", id);
    expect((await minta(env, "GET", `/api/ruang/${id}/ekspor?jenis=peserta`, guru)).status).toBe(409);
  });

  it("ruang yang tidak dimainkan: hanya baris judul", async () => {
    const { d1, env } = lingkungan();
    const { guru } = await akun(env);
    const id = tambahRuang(d1, 6, { pemilik: idGuru(d1, "sari@sekolah.sch.id"), label: "IX F", mulai: null });
    const isi = await (await minta(env, "GET", `/api/ruang/${id}/ekspor?jenis=jawaban`, guru)).text();
    expect(isi.split("\r\n")).toHaveLength(2);
  });
});

describe.skipIf(!sqlite)("hapus data ruang (P-33, D-3a)", () => {
  it("guru 403; ruang belum ditutup 409; admin 200 dalam satu batch dengan satu baris audit; kedua kalinya 404; tanpa tajuk CSRF 403", async () => {
    const { d1, env } = lingkungan();
    const { admin, guru } = await akun(env);
    const id = siapkanHasil(d1, idGuru(d1, "sari@sekolah.sch.id"));
    const olehGuru = await minta(env, "DELETE", `/api/ruang/${id}`, guru);
    expect(olehGuru.status).toBe(403);
    expect((await json(olehGuru)).galat).toMatchObject({ kode: "TIDAK_BERWENANG" });
    expect((await minta(env, "DELETE", `/api/ruang/${id}`, admin, { "X-Jejak": "" })).status).toBe(403);
    d1.jalankan("UPDATE ruang SET status = 'pembahasan' WHERE id = ?", id);
    const belum = await minta(env, "DELETE", `/api/ruang/${id}`, admin);
    expect(belum.status).toBe(409);
    expect((await json(belum)).galat).toMatchObject({ kode: "BELUM_DITUTUP", pesan: "Data ruang hanya bisa dihapus sesudah ruang ditutup." });
    d1.jalankan("UPDATE ruang SET status = 'ditutup' WHERE id = ?", id);
    const ok = await minta(env, "DELETE", `/api/ruang/${id}`, admin);
    expect(ok.status).toBe(200);
    expect(await json(ok)).toEqual({ ok: true });
    expect(d1.baris("SELECT id FROM ruang WHERE id = ?", id)).toEqual([]);
    expect(d1.baris("SELECT id FROM peserta WHERE ruang_id = ?", id)).toEqual([]);
    expect(d1.baris("SELECT id FROM jawaban WHERE ruang_id = ?", id)).toEqual([]);
    const audit = d1.baris<{ aksi: string; sasaran: string; rincian_json: string }>("SELECT aksi, sasaran, rincian_json FROM log_audit WHERE aksi = 'ruang.hapus'");
    expect(audit).toHaveLength(1);
    expect(audit[0].sasaran).toBe(id);
    expect(JSON.parse(audit[0].rincian_json)).toEqual({ kode: "R0001", labelKelas: "IX B", dibuatPada: T0 + JAM, peserta: 3, jawaban: 4 });
    expect(audit[0].rincian_json).not.toContain("Jalak Biru");
    expect((await minta(env, "DELETE", `/api/ruang/${id}`, admin)).status).toBe(404);
    expect(skemaRiwayat.parse(await json(await minta(env, "GET", "/api/ruang/riwayat", admin))).ruang).toEqual([]);
  });

  it("dua penghapusan hampir bersamaan: tepat satu berhasil dan satu baris audit", async () => {
    const { d1, env } = lingkungan();
    const { admin } = await akun(env);
    const id = siapkanHasil(d1, idGuru(d1, "sari@sekolah.sch.id"));
    const status = (await Promise.all([minta(env, "DELETE", `/api/ruang/${id}`, admin), minta(env, "DELETE", `/api/ruang/${id}`, admin)])).map((j) => j.status).sort();
    expect(status).toEqual([200, 404]);
    expect(d1.baris("SELECT id FROM log_audit WHERE aksi = 'ruang.hapus'")).toHaveLength(1);
  });
});
