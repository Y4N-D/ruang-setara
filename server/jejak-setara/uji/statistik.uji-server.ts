// Uji server statistik lewat Worker lokal sungguhan (spesifikasi JS-13, rencana uji "Uji server"; AC-2, AC-4, AC-5,
// AC-7, AC-11): kejadian baru diterbitkan dua versi, ronde di ruang biasa guru A (versi 1) dan admin (versi 2), satu
// ruang uji, pemain yang dikeluarkan, lalu statistik dicocokkan dengan hasil per ruang dan CSV jawaban JS-11.
import { describe, expect, it } from "vitest";
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/versi";
import { alamat, buatRuang, catatRuangUji, kelas, klien, konsol, sesiAdmin, tungguSampai, type Klien } from "./bantuan";

const V = PROTOKOL_VERSI;
const B = alamat();
const IP = "10.9.71.7";
type Pesan = Record<string, unknown>;
type Pemain = { k: Klien; id: string; nama: string };
type Opsi1 = { id: string; teks: string; benar: boolean };
type Opsi2 = { id: string; teks: string; tingkat: string };
const tajuk = (cookie = "") => ({ "X-Jejak": "1", Origin: B, "Content-Type": "application/json", "CF-Connecting-IP": IP, ...(cookie ? { Cookie: cookie } : {}) });
const cookieDari = (j: Response) => (j.headers.get("set-cookie") ?? "").split(";")[0];

async function minta(cookie: string, metode: string, jalur: string, isi?: unknown) {
  const j = await fetch(`${B}${jalur}`, { method: metode, headers: tajuk(cookie), ...(isi === undefined ? {} : { body: JSON.stringify(isi) }) });
  const teks = await j.text();
  return { status: j.status, isi: (teks ? JSON.parse(teks) : {}) as Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

async function guruBaru(nama: string): Promise<{ cookie: string; id: string }> {
  const email = `statistik-${Date.now()}-${Math.floor(Math.random() * 1e6)}@sekolah.sch.id`;
  const akun = await konsol("POST", "/api/akun", { email, namaTampilan: nama, peran: "guru", peninjau: true });
  expect(akun.status).toBe(201);
  const s1 = cookieDari(await fetch(`${B}/api/masuk`, { method: "POST", headers: tajuk(), body: JSON.stringify({ email, sandi: akun.isi.sandiSementara }) }));
  const cookie = cookieDari(await fetch(`${B}/api/sandi`, { method: "POST", headers: tajuk(s1), body: JSON.stringify({ sandiBaru: "kalimat sandi statistik" }) }));
  expect(cookie).not.toBe("");
  return { cookie, id: (akun.isi.akun as { id: string }).id };
}

async function gabung(kode: string, avatar: number): Promise<Pemain> {
  const k = await klien(kode);
  k.kirim({ v: V, t: "halo", peran: "pemain" });
  const datang = (await k.tunggu((m) => m.t === "selamat_datang")) as { pemainId: string; saranNama: string[] };
  k.kirim({ v: V, t: "pilih_identitas", nama: datang.saranNama[0], avatar });
  await k.tunggu((m) => m.t === "pemain_baru" && m.id === datang.pemainId);
  return { k, id: datang.pemainId, nama: datang.saranNama[0] };
}

async function titikKejadian(kode: string): Promise<{ kejadianId: string; titik: { x: number; y: number }[] }[]> {
  return ((await (await fetch(`${B}/api/uji/ruang/${kode}/kejadian`)).json()) as { kejadian: { kejadianId: string; titik: { x: number; y: number }[] }[] }).kejadian;
}

/** Membuka kejadian lalu mengunci Langkah 1 (benar atau keliru) dan, bila diminta, Langkah 2 dengan tingkat tertentu. */
async function jawab(p: Pemain, kode: string, isi: { langkah1: { opsi: Opsi1[] }; langkah2: { opsi: Opsi2[] } }, benar: boolean, tingkat: string | null): Promise<void> {
  const [k1] = await titikKejadian(kode);
  const t = k1.titik[0];
  expect((await fetch(`${B}/api/uji/ruang/${kode}/pindahkan`, { method: "POST", body: JSON.stringify({ nama: p.nama, x: t.x, y: t.y + 1 }) })).status).toBe(200);
  await p.k.tungguRiwayat((m) => m.t === "kejadian_terlihat" && m.kejadianId === k1.kejadianId);
  p.k.masuk.length = 0;
  p.k.kirim({ v: V, t: "periksa", kejadianId: k1.kejadianId });
  const buka = await p.k.tunggu((m) => m.t === "kejadian_terbuka" && m.kejadianId === k1.kejadianId);
  const teksBenar = isi.langkah1.opsi.find((o) => o.benar)?.teks;
  const opsi1 = buka.opsi1 as { id: string; teks: string }[];
  const pilih1 = opsi1.find((o) => (benar ? o.teks === teksBenar : o.teks !== teksBenar));
  p.k.kirim({ v: V, t: "kunci_1", kejadianId: k1.kejadianId, opsiId: pilih1?.id });
  const h1 = await p.k.tunggu((m) => m.t === "hasil_1");
  expect(h1.benar).toBe(benar);
  if (tingkat === null) return;
  const teks2 = isi.langkah2.opsi.find((o) => o.tingkat === tingkat)?.teks;
  const pilih2 = (h1.opsi2 as { id: string; teks: string }[]).find((o) => o.teks === teks2);
  p.k.kirim({ v: V, t: "kunci_2", kejadianId: k1.kejadianId, opsiId: pilih2?.id });
  await p.k.tunggu((m) => m.t === "hasil_2");
  p.k.kirim({ v: V, t: "tutup_dialog", kejadianId: k1.kejadianId });
}

async function kirimanSelesai(id: string): Promise<void> {
  await tungguSampai(
    async () => ((await konsol("GET", `/api/ruang/${id}`)).isi.langsung as { kirimanTertunda?: boolean } | null)?.kirimanTertunda,
    (t) => t === false,
    20_000,
    200,
  );
}

async function mulai(kode: string, pemain: Pemain[]): Promise<void> {
  expect(await kelas(kode, { v: V, t: "mulai" })).toBe(200);
  for (const p of pemain) await p.k.tunggu((m) => m.t === "status_ruang" && m.status === "main", 8000);
}

async function akhiriDanTutup(kode: string, id: string, pemain: Pemain[], keluarkan?: Pemain): Promise<void> {
  expect(await kelas(kode, { v: V, t: "akhiri" })).toBe(200);
  for (const p of pemain) await p.k.tunggu((m) => m.t === "selesai");
  if (keluarkan) expect((await konsol("POST", `/api/ruang/${id}/kelola`, { aksi: "keluarkan", pemainId: keluarkan.id })).status).toBe(200);
  await kirimanSelesai(id);
  expect(await kelas(kode, { v: V, t: "tutup_ruang" })).toBe(200);
  await tungguSampai(async () => ((await konsol("GET", `/api/ruang/${id}`)).isi.ruang as { status?: string } | undefined)?.status, (s) => s === "ditutup", 15_000, 250);
  for (const p of pemain) p.k.ws.close();
}

describe("statistik per kejadian lintas ruang di Worker lokal (JS-13)", () => {
  it("dua versi, ruang biasa dan uji, pemain dikeluarkan, cocok dengan hasil dan CSV, kepemilikan, dan dasbor", async () => {
    const guruA = await guruBaru("Bu Statistik");
    const k01 = await minta(guruA.cookie, "GET", "/api/kejadian/K-01");
    expect(k01.status).toBe(200);
    const isi1 = { ...k01.isi.kerja.isi, judul: "Statistik uji v1" };
    const baru = await minta(guruA.cookie, "POST", "/api/kejadian", { isi: isi1 });
    expect(baru.status).toBe(201);
    const kode = baru.isi.kode as string;
    expect((await minta(guruA.cookie, "POST", `/api/kejadian/${kode}/aksi`, { aksi: "ajukan" })).isi.status).toBe("tinjau");
    for (const id of isi1.kartu.rujukan as string[]) await minta(guruA.cookie, "POST", `/api/rujukan/${id}/verifikasi`, { terverifikasi: true });
    expect((await konsol("POST", `/api/kejadian/${kode}/aksi`, { aksi: "terbitkan", catatan: "Terbit pertama" })).isi).toMatchObject({ nomor: 1 });
    const paket = await konsol("POST", "/api/paket", { nama: `Paket statistik ${Date.now()}`, deskripsi: "Satu kejadian untuk uji statistik.", aktif: true, kejadian: [kode] });
    expect(paket.status).toBe(201);
    const paketId = paket.isi.id as string;

    // Ruang biasa guru A (versi 1): A benar dan tepat, B keliru dan kurang tepat, C benar tanpa Langkah 2, D dikeluarkan.
    const r1 = await minta(guruA.cookie, "POST", "/api/ruang", { labelKelas: "IX Stat", paketId, durasiMenit: 10, batasPemain: 40, batasTerlambatMenit: 5, modeNomorAbsen: false, uji: false });
    expect(r1.status).toBe(201);
    const ruang1 = r1.isi.ruang as { id: string; kode: string };
    catatRuangUji(ruang1.kode, ruang1.id);
    const [a, b, c, dd] = [await gabung(ruang1.kode, 1), await gabung(ruang1.kode, 2), await gabung(ruang1.kode, 3), await gabung(ruang1.kode, 4)];
    await mulai(ruang1.kode, [a, b, c, dd]);
    await jawab(a, ruang1.kode, isi1, true, "tepat");
    await jawab(b, ruang1.kode, isi1, false, "kurang");
    await jawab(c, ruang1.kode, isi1, true, null);
    await jawab(dd, ruang1.kode, isi1, false, "tepat");
    await akhiriDanTutup(ruang1.kode, ruang1.id, [a, b, c, dd], dd);

    // Versi 2 oleh admin, lalu ruang biasa admin: E benar dan tepat, F keliru dan berisiko.
    const kerja = await konsol("GET", `/api/kejadian/${kode}`);
    const isi2 = { ...((kerja.isi.kerja as { isi: Pesan }).isi), judul: "Statistik uji v2" };
    expect((await konsol("PUT", `/api/kejadian/${kode}/kerja`, { isi: isi2, diubahPada: (kerja.isi.kerja as { diubahPada: number }).diubahPada })).status).toBe(200);
    expect((await konsol("POST", `/api/kejadian/${kode}/aksi`, { aksi: "terbitkan", catatan: "Versi kedua" })).isi).toMatchObject({ nomor: 2 });
    const r2 = await konsol("POST", "/api/ruang", { labelKelas: "IX Stat 2", paketId, durasiMenit: 10, batasPemain: 40, batasTerlambatMenit: 5, modeNomorAbsen: false, uji: false });
    expect(r2.status).toBe(201);
    const ruang2 = r2.isi.ruang as { id: string; kode: string };
    catatRuangUji(ruang2.kode, ruang2.id);
    const [e, f] = [await gabung(ruang2.kode, 5), await gabung(ruang2.kode, 6)];
    await mulai(ruang2.kode, [e, f]);
    await jawab(e, ruang2.kode, isi1, true, "tepat");
    await jawab(f, ruang2.kode, isi1, false, "berisiko");
    await akhiriDanTutup(ruang2.kode, ruang2.id, [e, f]);

    // Ruang uji dengan paket yang sama: tidak masuk statistik.
    const r0 = await buatRuang({ labelKelas: "IX Stat uji", paketId, uji: true });
    expect(r0.status).toBe(201);
    const g = await gabung(String(r0.isi.kode), 7);
    await mulai(String(r0.isi.kode), [g]);
    await jawab(g, String(r0.isi.kode), isi1, true, "tepat");
    await akhiriDanTutup(String(r0.isi.kode), String(r0.isi.ruangId), [g]);

    // Admin: dua baris versi untuk paket ini, tanpa ruang uji dan tanpa pemain yang dikeluarkan.
    const stat = await konsol("GET", `/api/statistik/kejadian?paket=${paketId}`);
    expect(stat.status).toBe(200);
    const baris = (stat.isi.kejadian as { kode: string; versi: number; judul: string; dijawab: number; selesai: number; benar1: number; penuh: number; pilihan2: { tingkat: string; n: number }[] }[]).filter((x) => x.kode === kode);
    expect(baris.map((x) => [x.versi, x.judul, x.dijawab, x.selesai, x.benar1, x.penuh])).toEqual([
      [2, "Statistik uji v2", 2, 2, 1, 1],
      [1, "Statistik uji v1", 3, 2, 2, 1],
    ]);
    expect(stat.isi.cakupan).toMatchObject({ ruang: 2, pemain: 5, jawaban: 5 });

    // Cocok dengan hasil per ruang dan CSV jawaban JS-11 (AC-5).
    const hasil = await konsol("GET", `/api/ruang/${ruang1.id}/hasil`);
    const aktif = (hasil.isi.peserta as { dikeluarkan: boolean; langkah1Dijawab: number; langkah1Benar: number; tepat: number; kurang: number; berisiko: number }[]).filter((p) => !p.dikeluarkan);
    const jumlah = (kunci: "langkah1Dijawab" | "langkah1Benar" | "tepat" | "kurang" | "berisiko") => aktif.reduce((n, p) => n + p[kunci], 0);
    const v1 = baris[1];
    const perTingkat = (t: string) => v1.pilihan2.filter((o) => o.tingkat === t).reduce((n, o) => n + o.n, 0);
    expect([v1.dijawab, v1.benar1, perTingkat("tepat"), perTingkat("kurang"), perTingkat("berisiko")]).toEqual([jumlah("langkah1Dijawab"), jumlah("langkah1Benar"), jumlah("tepat"), jumlah("kurang"), jumlah("berisiko")]);
    const csv = await fetch(`${B}/api/ruang/${ruang1.id}/ekspor?jenis=jawaban`, { headers: tajuk(await sesiAdmin()) });
    const barisCsv = (await csv.text()).split("\r\n").slice(1).filter((x) => x.trim() !== "");
    expect(barisCsv.filter((x) => !x.includes(";Dikeluarkan;")).length).toBe(v1.dijawab);

    // Guru A hanya melihat ruangnya (versi 1); admin bisa menyaring guru A.
    const statGuru = await minta(guruA.cookie, "GET", `/api/statistik/kejadian?paket=${paketId}`);
    expect((statGuru.isi.kejadian as { kode: string; versi: number }[]).filter((x) => x.kode === kode).map((x) => x.versi)).toEqual([1]);
    const statSaring = await konsol("GET", `/api/statistik/kejadian?paket=${paketId}&guru=${guruA.id}`);
    expect((statSaring.isi.kejadian as { kode: string; versi: number }[]).filter((x) => x.kode === kode).map((x) => x.versi)).toEqual([1]);

    // Dasbor guru A: sesi terakhir dan ringkasan 30 hari dari ruangnya (P-25, P-26).
    const dasbor = await minta(guruA.cookie, "GET", "/api/dasbor");
    expect(dasbor.status).toBe(200);
    expect(dasbor.isi.siapTinjau).toBeNull();
    expect(dasbor.isi.sesi[0]).toMatchObject({ id: ruang1.id, uji: false, jumlahPemain: 3 });
    expect(dasbor.isi.ringkasan).toMatchObject({ hari: 30, sesi: 1, pemain: 3 });
    expect(typeof (await konsol("GET", "/api/dasbor")).isi.siapTinjau).toBe("number");
  }, 120_000);
});
