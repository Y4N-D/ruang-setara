// Uji server kejadian (spesifikasi JS-08, rencana uji "Uji server"; AC-1, AC-4, AC-7, AC-9 sampai AC-13, AC-16,
// AC-17, AC-23): Worker hasil build di vite preview dengan D1 lokal yang sudah disemai (port 4320), ditambah server
// tanpa semai (4323) dan server yang dinyalakan ulang di tengah ronde (4324).
import { describe, expect, it } from "vitest";
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/versi";
import { alamat, buatRuang, d1, kelas, klien, matikanServer, nyalakanServer, tidur, type Klien } from "./bantuan";

const V = PROTOKOL_VERSI;
type Pesan = Record<string, unknown>;

/** Bergabung, memilih nama pertama; mengembalikan klien, id pemain, nama, dan token. */
async function gabung(kode: string, port = 4320): Promise<{ k: Klien; id: string; nama: string; token: string }> {
  const k = await klien(kode, port);
  k.kirim({ v: V, t: "halo", peran: "pemain" });
  const datang = await k.tunggu((m) => m.t === "selamat_datang");
  const nama = (datang.saranNama as string[])[0];
  k.kirim({ v: V, t: "pilih_identitas", nama, avatar: 2 });
  await k.tunggu((m) => m.t === "pemain_baru" && m.id === datang.pemainId);
  return { k, id: String(datang.pemainId), nama, token: String(datang.token) };
}

async function titikKejadian(kode: string, port = 4320): Promise<{ kejadianId: string; titik: { x: number; y: number }[] }[]> {
  const j = await fetch(`${alamat(port)}/api/ruang-coba/${kode}/kejadian`);
  expect(j.status).toBe(200);
  return ((await j.json()) as { kejadian: { kejadianId: string; titik: { x: number; y: number }[] }[] }).kejadian;
}

async function pindahkan(kode: string, nama: string, x: number, y: number, port = 4320): Promise<number> {
  return (await fetch(`${alamat(port)}/api/ruang-coba/${kode}/pindahkan`, { method: "POST", body: JSON.stringify({ nama, x, y }) })).status;
}

async function mulaiRonde(kode: string, port = 4320, pemain: Klien[] = []): Promise<void> {
  expect(await kelas(kode, { v: V, t: "mulai" }, port)).toBe(200);
  for (const p of pemain) await p.tunggu((m) => m.t === "status_ruang" && m.status === "main", 6000);
}

/** Pindah ke bawah titik, menunggu kejadian terlihat, lalu memeriksa; mengembalikan kejadian_terbuka. */
async function periksa(p: { k: Klien; nama: string }, kode: string, kejadianId: string, t: { x: number; y: number }, port = 4320): Promise<Pesan> {
  expect(await pindahkan(kode, p.nama, t.x, t.y + 1, port)).toBe(200);
  await p.k.tunggu((m) => m.t === "kejadian_terlihat" && m.kejadianId === kejadianId && m.x === t.x && m.y === t.y);
  p.k.masuk.length = 0;
  p.k.kirim({ v: V, t: "periksa", kejadianId });
  return p.k.tunggu((m) => m.t === "kejadian_terbuka" && m.kejadianId === kejadianId);
}

describe("ruang coba memuat Paket inti 16 (P-1 sampai P-5; AC-1)", () => {
  it("D1 yang disemai: 16 kejadian dengan versi kerja dan paket_id; kait kejadian memberi satu titik per kejadian", async () => {
    const { status, isi } = await buatRuang({ batasPemain: 40 });
    expect(status).toBe(201);
    expect(isi.kejadian).toBe(16);
    const [baris] = d1<{ paket_id: string }>(`SELECT paket_id FROM ruang WHERE kode = '${String(isi.kode)}'`);
    expect(baris.paket_id).toBe("9880c4d5-8294-51c9-971a-e95531a2e039");
    const titik = await titikKejadian(String(isi.kode));
    expect(titik.map((k) => k.kejadianId)).toEqual(Array.from({ length: 16 }, (_, i) => `K-${String(i + 1).padStart(2, "0")}`));
    for (const k of titik) expect(k.titik).toHaveLength(1);
    const besar = await buatRuang({ batasPemain: 60 });
    for (const k of await titikKejadian(String(besar.isi.kode))) expect(k.titik).toHaveLength(2);
  });

  it("D1 tanpa semai: kejadian 0, paket_id kosong, dan ruang tetap berjalan", async () => {
    const keadaan = "test-results-jejak/keadaan-4323";
    const anak = await nyalakanServer(4323, ["--tanpa-build", "--tanpa-semai", "--keadaan", keadaan]);
    try {
      const { status, isi } = await buatRuang({}, 4323);
      expect(status).toBe(201);
      expect(isi.kejadian).toBe(0);
      expect(d1<{ paket_id: string | null }>(`SELECT paket_id FROM ruang WHERE kode = '${String(isi.kode)}'`, keadaan)[0].paket_id).toBeNull();
      expect(await titikKejadian(String(isi.kode), 4323)).toEqual([]);
      const a = await gabung(String(isi.kode), 4323);
      await mulaiRonde(String(isi.kode), 4323, [a.k]);
      await tidur(400);
      expect(a.k.masuk.filter((m) => m.t === "kejadian_terlihat")).toEqual([]);
      a.k.ws.close();
    } finally {
      await matikanServer(anak);
    }
  });
});

describe("periksa, dua langkah, skor, dan kiriman D1 (AC-4, AC-7, AC-9 sampai AC-13, AC-17)", () => {
  it("pindahkan, terlihat, periksa, kunci 1 dan 2, pribadi, KT-13, akhiri; D1 berisi jawaban dan peserta yang benar", async () => {
    const { isi } = await buatRuang({ batasPemain: 40 });
    const kode = String(isi.kode);
    const a = await gabung(kode);
    const b = await gabung(kode);
    // Kait pindahkan: sel padat 400, nama tidak dikenal 404.
    expect(await pindahkan(kode, a.nama, 0, 0)).toBe(400);
    expect(await pindahkan(kode, "Bukan Siapa Siapa", 5, 5)).toBe(404);
    await mulaiRonde(kode, 4320, [a.k, b.k]);
    await a.k.tunggu((m) => m.t === "pribadi" && m.skor === 0);
    const [k1, k2] = await titikKejadian(kode);
    // Terlalu jauh: BUKAN_JANGKAUAN lalu koreksi.
    a.k.masuk.length = 0;
    a.k.kirim({ v: V, t: "periksa", kejadianId: k1.kejadianId });
    await a.k.tunggu((m) => m.t === "galat" && m.kode === "BUKAN_JANGKAUAN");
    await a.k.tunggu((m) => m.t === "koreksi");
    const buka1 = await periksa(a, kode, k1.kejadianId, k1.titik[0]);
    expect(buka1).toMatchObject({ v: V, langkah: 1 });
    expect(buka1.opsi1 as unknown[]).toHaveLength(4);
    // B melihat tanda dialog A di dunia (unsur keenam).
    expect(await pindahkan(kode, b.nama, k1.titik[0].x + 1, k1.titik[0].y + 1)).toBe(200);
    await b.k.tunggu((m) => m.t === "dunia" && (m.p as unknown[][]).some((x) => x[0] === a.id && x[5] === true), 4000);
    const opsi1 = buka1.opsi1 as { id: string }[];
    a.k.kirim({ v: V, t: "kunci_1", kejadianId: k1.kejadianId, opsiId: opsi1[0].id });
    const h1 = await a.k.tunggu((m) => m.t === "hasil_1");
    const poin1 = h1.benar ? 40 : 0;
    await a.k.tunggu((m) => m.t === "pribadi" && m.skor === poin1);
    // KT-13: tutup lalu periksa lagi membuka Langkah 2 dengan ulangan hasil_1.
    a.k.kirim({ v: V, t: "tutup_dialog", kejadianId: k1.kejadianId });
    await tidur(200);
    a.k.masuk.length = 0;
    a.k.kirim({ v: V, t: "periksa", kejadianId: k1.kejadianId });
    const ulang = await a.k.tunggu((m) => m.t === "kejadian_terbuka");
    expect(ulang.langkah).toBe(2);
    expect(await a.k.tunggu((m) => m.t === "hasil_1")).toEqual(h1);
    const opsi2 = h1.opsi2 as { id: string }[];
    a.k.kirim({ v: V, t: "kunci_2", kejadianId: k1.kejadianId, opsiId: opsi2[0].id });
    const h2 = await a.k.tunggu((m) => m.t === "hasil_2");
    const total = poin1 + Number(h2.poin);
    const pr = await a.k.tunggu((m) => m.t === "pribadi" && Array.isArray(m.selesai) && (m.selesai as string[]).includes(k1.kejadianId));
    expect(pr.skor).toBe(total);
    a.k.kirim({ v: V, t: "tutup_dialog", kejadianId: k1.kejadianId });
    // Kejadian kedua sampai Langkah 1 saja, lalu ronde berakhir: poin Langkah 1 tetap dihitung.
    const buka2 = await periksa(a, kode, k2.kejadianId, k2.titik[0]);
    a.k.kirim({ v: V, t: "kunci_1", kejadianId: k2.kejadianId, opsiId: (buka2.opsi1 as { id: string }[])[1].id });
    const h1b = await a.k.tunggu((m) => m.t === "hasil_1" && m.pertanyaan2 !== h1.pertanyaan2);
    const akhirSkor = total + (h1b.benar ? 40 : 0);
    expect(await kelas(kode, { v: V, t: "akhiri" })).toBe(200);
    const selesai = await a.k.tunggu((m) => m.t === "selesai");
    expect(selesai).toMatchObject({ skor: akhirSkor, jumlahPemain: 2, rekap: [] });
    const selesaiB = await b.k.tunggu((m) => m.t === "selesai");
    expect(selesaiB).toMatchObject({ skor: 0, jumlahPemain: 2 });
    if (akhirSkor > 0) expect([selesai.peringkat, selesaiB.peringkat]).toEqual([1, 2]);
    await tidur(1500);
    const jawaban = d1<Record<string, unknown>>(
      `SELECT j.id, j.peserta_id, j.kejadian_versi_id, j.urutan_opsi_json, j.langkah1_opsi, j.langkah1_benar, j.langkah2_opsi, j.tingkat, j.poin, j.petunjuk_dipakai, v.isi_json FROM jawaban j JOIN kejadian_versi v ON v.id = j.kejadian_versi_id WHERE j.ruang_id = '${String(isi.ruangId)}' ORDER BY j.id`,
    );
    expect(jawaban.map((j) => j.id)).toEqual([`${a.id}:${k1.kejadianId}`, `${a.id}:${k2.kejadianId}`]);
    const [j1, j2] = jawaban;
    expect(j1).toMatchObject({ peserta_id: a.id, langkah1_benar: h1.benar ? 1 : 0, tingkat: h2.tingkat, poin: total, petunjuk_dipakai: 0 });
    expect(j2).toMatchObject({ langkah2_opsi: null, tingkat: null, poin: h1b.benar ? 40 : 0 });
    const isiK1 = JSON.parse(String(j1.isi_json)) as { kode: string; langkah1: { opsi: { id: string }[] } };
    expect(isiK1.kode).toBe(k1.kejadianId);
    const urutan = JSON.parse(String(j1.urutan_opsi_json)) as { langkah1: string[]; langkah2: string[] };
    expect([...urutan.langkah1].sort()).toEqual(["1a", "1b", "1c", "1d"]);
    expect(urutan.langkah1[0]).toBe(j1.langkah1_opsi); // pilihan pertama yang tampil = pilihan yang dikunci
    expect(urutan.langkah2[0]).toBe(j1.langkah2_opsi);
    const peserta = d1<Record<string, unknown>>(`SELECT id, skor, langkah1_benar, jumlah_kejadian, peringkat_akhir FROM peserta WHERE ruang_id = '${String(isi.ruangId)}' ORDER BY id`);
    expect(peserta.find((p) => p.id === a.id)).toMatchObject({ skor: akhirSkor, jumlah_kejadian: 1, peringkat_akhir: selesai.peringkat });
    expect(peserta.find((p) => p.id === b.id)).toMatchObject({ skor: 0, jumlah_kejadian: 0, peringkat_akhir: selesaiB.peringkat });
    a.k.ws.close();
    b.k.ws.close();
  });

  it("ruang 60 pemain: titik kedua juga bisa diperiksa, dan sambung ulang memulihkan penanda dan skor", async () => {
    const { isi } = await buatRuang({ batasPemain: 60 });
    const kode = String(isi.kode);
    const a = await gabung(kode);
    await mulaiRonde(kode, 4320, [a.k]);
    const [k1] = await titikKejadian(kode);
    const buka = await periksa(a, kode, k1.kejadianId, k1.titik[1]);
    a.k.kirim({ v: V, t: "kunci_1", kejadianId: k1.kejadianId, opsiId: (buka.opsi1 as { id: string }[])[0].id });
    const h1 = await a.k.tunggu((m) => m.t === "hasil_1");
    // Putus di tengah dialog, lalu tersambung lagi dengan token.
    expect((await fetch(`${alamat()}/api/ruang-coba/${kode}/putuskan`, { method: "POST" })).status).toBe(200);
    const b = await klien(kode);
    b.kirim({ v: V, t: "halo", peran: "pemain", token: a.token });
    await b.tunggu((m) => m.t === "selamat_datang");
    const pr = await b.tunggu((m) => m.t === "pribadi");
    expect(pr.skor).toBe(h1.benar ? 40 : 0);
    expect(pr.terlihat).toContain(k1.kejadianId);
    const lihat = b.masuk.filter((m) => m.t === "kejadian_terlihat" && m.kejadianId === k1.kejadianId);
    expect(lihat.map((m) => `${String(m.x)},${String(m.y)}`)).toContain(`${k1.titik[1].x},${k1.titik[1].y}`);
    // Dialog tertutup saat putus; periksa lagi membuka Langkah 2 (KT-13).
    b.masuk.length = 0;
    b.kirim({ v: V, t: "periksa", kejadianId: k1.kejadianId });
    expect((await b.tunggu((m) => m.t === "kejadian_terbuka")).langkah).toBe(2);
    b.ws.close();
  });
});

describe("Durable Object dibangunkan ulang di tengah ronde (P-63; AC-16)", () => {
  it("server dimatikan lalu dinyalakan lagi dengan keadaan yang sama: skor, titik terlihat, dan status jawaban pulih", async () => {
    const keadaan = "test-results-jejak/keadaan-4324";
    let anak = await nyalakanServer(4324, ["--tanpa-build", "--keadaan", keadaan]);
    let token = "";
    let nama = "";
    let kode = "";
    let k1 = { kejadianId: "", titik: [{ x: 0, y: 0 }] };
    let skor = 0;
    try {
      const { isi } = await buatRuang({}, 4324);
      kode = String(isi.kode);
      const a = await gabung(kode, 4324);
      token = a.token;
      nama = a.nama;
      await mulaiRonde(kode, 4324, [a.k]);
      [k1] = await titikKejadian(kode, 4324);
      const buka = await periksa(a, kode, k1.kejadianId, k1.titik[0], 4324);
      a.k.kirim({ v: V, t: "kunci_1", kejadianId: k1.kejadianId, opsiId: (buka.opsi1 as { id: string }[])[2].id });
      skor = (await a.k.tunggu((m) => m.t === "hasil_1")).benar ? 40 : 0;
      await a.k.tunggu((m) => m.t === "pribadi" && m.skor === skor);
      a.k.ws.close();
      await tidur(300); // beri waktu ruang memproses sambungan putus, seperti uji JS-03
    } finally {
      await matikanServer(anak);
    }
    anak = await nyalakanServer(4324, ["--tanpa-build", "--keadaan", keadaan, "--pakai-ulang"]);
    try {
      const b = await klien(kode, 4324);
      b.kirim({ v: V, t: "halo", peran: "pemain", token });
      const pr = await b.tunggu((m) => m.t === "pribadi", 8000);
      expect(pr.skor).toBe(skor);
      expect(pr.terlihat).toContain(k1.kejadianId);
      expect(b.masuk.some((m) => m.t === "kejadian_terlihat" && m.kejadianId === k1.kejadianId)).toBe(true);
      // Posisi bukan bagian pemulihan P-63, dan posisi hanya tersimpan bila ruang sempat memproses sambungan putus
      // sebelum server dimatikan. Di mesin GitHub (11 Nov 2026) server mati lebih dulu, sehingga pemain kembali di
      // titik muncul dan periksa dijawab BUKAN_JANGKAUAN. Pemain dipindah lagi ke dekat titik sebelum memeriksa.
      b.masuk.length = 0;
      expect(await pindahkan(kode, nama, k1.titik[0].x, k1.titik[0].y + 1, 4324)).toBe(200);
      await b.tunggu((m) => m.t === "koreksi");
      b.masuk.length = 0;
      b.kirim({ v: V, t: "periksa", kejadianId: k1.kejadianId });
      expect((await b.tunggu((m) => m.t === "kejadian_terbuka")).langkah).toBe(2);
      b.ws.close();
    } finally {
      await matikanServer(anak);
    }
  });
});
