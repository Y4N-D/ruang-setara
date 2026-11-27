// Uji server Teropong dan Angkot (spesifikasi JS-18, rencana uji "Uji server"; AC-2, AC-5, AC-8, AC-10): Worker hasil
// build di vite preview dengan D1 lokal yang sudah disemai (port 4320).
import { describe, expect, it } from "vitest";
import { dalamTeropong, halteDekat, JANGKAUAN_HALTE_KLIEN_PX, terlihatDiLayar, titikHalte } from "../../../app/jejak-setara/inti/aturan";
import { posisiSah } from "../../../app/jejak-setara/inti/gerak";
import type { KotakJenis, SkillId } from "../../../app/jejak-setara/inti/tipe";
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/versi";
import { HALTE_KAMPUNG, KOTAK_KAMPUNG, PETA_KAMPUNG } from "../src/ruang/peta-kampung";
import { alamat, buatRuang, d1, kelas, klien, tidur, type Klien } from "./bantuan";

const V = PROTOKOL_VERSI;
const LIMA: SkillId[] = ["lari", "kompas", "petunjuk", "teropong", "angkot"];
type Pesan = Record<string, unknown>;
type ButirDunia = [string, number, number, string, boolean, boolean];
const grid = { lebar: PETA_KAMPUNG.lebar, tinggi: PETA_KAMPUNG.tinggi, tabrakan: PETA_KAMPUNG.tabrakan };
const kaki = (x: number, y: number) => ({ x: x * 16 + 8, y: y * 16 + 12 });
const ubinSah = (x: number, y: number) => posisiSah(grid, kaki(x, y).x, kaki(x, y).y);

interface Pemain {
  k: Klien;
  id: string;
  nama: string;
  seq: number;
  pos: { x: number; y: number };
}

async function gabung(kode: string): Promise<Pemain> {
  const k = await klien(kode);
  k.kirim({ v: V, t: "halo", peran: "pemain" });
  const datang = await k.tunggu((m) => m.t === "selamat_datang");
  const nama = (datang.saranNama as string[])[0];
  k.kirim({ v: V, t: "pilih_identitas", nama, avatar: 4 });
  await k.tunggu((m) => m.t === "pemain_baru" && m.id === datang.pemainId);
  return { k, id: String(datang.pemainId), nama, seq: 0, pos: { x: 0, y: 0 } };
}

async function pindahkan(kode: string, p: Pemain, x: number, y: number): Promise<void> {
  p.k.masuk.length = 0;
  expect((await fetch(`${alamat()}/api/uji/ruang/${kode}/pindahkan`, { method: "POST", body: JSON.stringify({ nama: p.nama, x, y }) })).status).toBe(200);
  const koreksi = await p.k.tunggu((m) => m.t === "koreksi");
  p.seq = Math.max(p.seq, Number(koreksi.seq));
  p.pos = kaki(x, y);
}

function gerak(p: Pemain, x: number, y: number): void {
  p.seq++;
  p.k.kirim({ v: V, t: "gerak", x, y, arah: x >= p.pos.x ? "kanan" : "kiri", jalan: true, seq: p.seq });
  p.pos = { x, y };
}

/** Kotak berjenis itu yang ubin kiri dan kanannya bisa diinjak, dengan baris kaki yang bebas di antaranya. */
function kotakDatar(jenis: KotakJenis) {
  const kt = KOTAK_KAMPUNG.find((k) => {
    if (k.jenis !== jenis) return false;
    for (let x = k.x * 16 - 8; x <= k.x * 16 + 24; x++) if (!posisiSah(grid, x, k.y * 16 + 12)) return false;
    return true;
  });
  if (!kt) throw new Error(`tidak ada kotak ${jenis} di baris datar`);
  return kt;
}

/** Pindah ke ubin kiri kotak, lalu berjalan 32 piksel ke ubin kanannya, melewati pusat kotak. */
async function ambilKotak(kode: string, p: Pemain, jenis: KotakJenis) {
  const kt = kotakDatar(jenis);
  await pindahkan(kode, p, kt.x - 1, kt.y);
  await tidur(150);
  p.k.masuk.length = 0;
  gerak(p, kt.x * 16 + 24, kt.y * 16 + 12);
  return kt;
}

async function titikKejadian(kode: string): Promise<{ kejadianId: string; titik: { x: number; y: number }[] }[]> {
  return ((await (await fetch(`${alamat()}/api/uji/ruang/${kode}/kejadian`)).json()) as { kejadian: { kejadianId: string; titik: { x: number; y: number }[] }[] }).kejadian;
}

async function mulai(kode: string, pemain: Pemain[]) {
  expect(await kelas(kode, { v: V, t: "mulai" })).toBe(200);
  for (const p of pemain) await p.k.tunggu((m) => m.t === "status_ruang" && m.status === "main", 8000);
}

const muatan = (m: Pesan) => m.muatan as Record<SkillId, number>;
const lebarPx = PETA_KAMPUNG.lebar * 16;
const tinggiPx = PETA_KAMPUNG.tinggi * 16;

/**
 * Ubin yang bisa diinjak dengan titik kaki dalam radius Teropong dari sebuah titik kejadian, tetapi titik itu di luar
 * pandangan 320 × 180 (JS-08), sehingga hanya Teropong yang bisa mengungkapnya.
 */
function tempatTeropong(daftar: { kejadianId: string; titik: { x: number; y: number }[] }[], sudah: Set<string>) {
  for (const kj of daftar) {
    if (sudah.has(kj.kejadianId)) continue;
    for (const t of kj.titik) {
      const pusat = { x: t.x * 16 + 8, y: t.y * 16 + 8 };
      for (const [dx, dy] of [[11, 0], [-11, 0], [11, 1], [-11, 1], [11, -1], [-11, -1], [0, 11], [0, -11], [1, 11], [-1, -11]]) {
        const u = { x: t.x + dx, y: t.y + dy };
        if (u.x < 1 || u.y < 1 || u.x >= PETA_KAMPUNG.lebar - 1 || u.y >= PETA_KAMPUNG.tinggi - 1 || !ubinSah(u.x, u.y)) continue;
        const p = kaki(u.x, u.y);
        if (dalamTeropong(p, t) && !terlihatDiLayar(p, pusat, lebarPx, tinggiPx)) return { kejadianId: kj.kejadianId, ubin: u };
      }
    }
  }
  throw new Error("tidak ada tempat untuk uji Teropong");
}

/** Ubin bebas paling dekat (jarak Chebyshev 1 sampai 3) dari ubin (x, y). */
function ubinDekat(x: number, y: number, kecuali: { x: number; y: number }[] = []): { x: number; y: number } {
  for (let r = 1; r <= 3; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const u = { x: x + dx, y: y + dy };
        if (ubinSah(u.x, u.y) && !kecuali.some((k) => k.x === u.x && k.y === u.y)) return u;
      }
    }
  }
  throw new Error(`tidak ada ubin bebas di dekat (${x}, ${y})`);
}

/** Tujuan sejauh `d` piksel ke salah satu dari empat arah yang jalurnya bebas. */
function arahBebas(p: { x: number; y: number }, d: number): { x: number; y: number } {
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
    let bebas = true;
    for (let i = 1; i <= d && bebas; i++) bebas = posisiSah(grid, p.x + dx * i, p.y + dy * i);
    if (bebas) return { x: p.x + dx * d, y: p.y + dy * d };
  }
  throw new Error("tidak ada arah bebas");
}

describe("Teropong dan Angkot di ruang uji (AC-2, AC-5, AC-8, AC-10)", () => {
  it("lima skill di POST /api/ruang; kotak teropong; Teropong mengungkap kejadian dalam radius 12 ubin di luar layar", async () => {
    const { status, isi } = await buatRuang({ skillAktif: ["angkot", "teropong", "lari", "kompas", "petunjuk"] });
    expect(status).toBe(201);
    expect((isi.ruang as Pesan).skillAktif).toEqual(LIMA);
    const [baris] = d1<{ pengaturan_json: string }>(`SELECT pengaturan_json FROM ruang WHERE id = '${String(isi.ruangId)}'`);
    expect((JSON.parse(baris.pengaturan_json) as Pesan).skillAktif).toEqual(LIMA);
    const kode = String(isi.kode);
    const a = await gabung(kode);
    await mulai(kode, [a]);
    await a.k.tunggu((m) => m.t === "pribadi");

    // Kotak teropong di pantai Z6: muatan Teropong 1, lalu pemberitahuan kotak_teropong.
    const kt = await ambilKotak(kode, a, "teropong");
    expect(kt.id.startsWith("k-z6-")).toBe(true);
    const pr1 = await a.k.tunggu((m) => m.t === "pribadi" && muatan(m).teropong === 1);
    await a.k.tunggu((m) => m.t === "pemberitahuan" && m.kode === "kotak_teropong");
    expect((pr1.kotakMenunggu as { id: string }[]).map((k) => k.id)).toEqual([kt.id]);

    // Tempat dalam radius sebuah titik yang belum terlihat, di luar pandangan; tanpa Teropong tidak ada pengungkapan.
    const sudah = new Set(a.k.riwayat.filter((m) => m.t === "kejadian_terlihat").map((m) => String(m.kejadianId)));
    const tempat = tempatTeropong(await titikKejadian(kode), sudah);
    await pindahkan(kode, a, tempat.ubin.x, tempat.ubin.y);
    await tidur(500);
    expect(a.k.riwayat.some((m) => m.t === "kejadian_terlihat" && m.kejadianId === tempat.kejadianId)).toBe(false);

    a.k.masuk.length = 0;
    a.k.kirim({ v: V, t: "pakai_skill", skill: "teropong" });
    const pr2 = await a.k.tunggu((m) => m.t === "pribadi" && muatan(m).teropong === 0);
    const akhir = (pr2.aktifSampai as Record<string, number>).teropong;
    expect(akhir).toBeGreaterThan(Date.now() + 25_000);
    expect(akhir).toBeLessThanOrEqual(Date.now() + 30_500);
    await a.k.tunggu((m) => m.t === "kejadian_terlihat" && m.kejadianId === tempat.kejadianId, 3000);
    // Teropong yang aktif tidak bisa dipakai lagi; pemakaian yang ditolak tidak dijawab.
    a.k.masuk.length = 0;
    a.k.kirim({ v: V, t: "pakai_skill", skill: "teropong" });
    await tidur(400);
    expect(a.k.masuk.filter((m) => m.t === "pribadi" && muatan(m).teropong !== 0)).toEqual([]);
    a.k.ws.close();
  }, 60_000);

  it("karcis, lalu Angkot dari halte: koreksi, pribadi, angkot_tiba; gerak lama dikoreksi; pengamat menerima butir perpisahan", async () => {
    const { isi } = await buatRuang({});
    expect((isi.ruang as Pesan).skillAktif).toEqual(LIMA); // tanpa isian: kelima skill
    const kode = String(isi.kode);
    const a = await gabung(kode);
    const b = await gabung(kode);
    await mulai(kode, [a, b]);
    await a.k.tunggu((m) => m.t === "pribadi");

    // Kotak karcis di dekat halte: muatan Angkot 1, lalu pemberitahuan kotak_angkot.
    const kt = await ambilKotak(kode, a, "karcis");
    await a.k.tunggu((m) => m.t === "pribadi" && muatan(m).angkot === 1);
    await a.k.tunggu((m) => m.t === "pemberitahuan" && m.kode === "kotak_angkot");

    // Halte asal: halte terdekat dari kotak itu; A di titik halte dan B dua ubin darinya.
    const asal = [...HALTE_KAMPUNG].sort((p, q) => Math.hypot(p.x - kt.x, p.y - kt.y) - Math.hypot(q.x - kt.x, q.y - kt.y))[0];
    const tujuan = HALTE_KAMPUNG.find((h) => h.id !== asal.id && Math.hypot(h.x - asal.x, h.y - asal.y) > 30)!;
    await pindahkan(kode, a, asal.x, asal.y);
    expect(halteDekat(a.pos, HALTE_KAMPUNG, JANGKAUAN_HALTE_KLIEN_PX)?.id).toBe(asal.id);
    const ub = ubinDekat(asal.x, asal.y + 2, [{ x: asal.x, y: asal.y }]);
    await pindahkan(kode, b, ub.x, ub.y);
    await b.k.tungguRiwayat((m) => m.t === "dunia" && (m.p as ButirDunia[]).some((x) => x[0] === a.id && x[1] === a.pos.x && x[2] === a.pos.y), 5000);

    a.k.masuk.length = 0;
    b.k.masuk.length = 0;
    a.k.kirim({ v: V, t: "pakai_skill", skill: "angkot", halteId: tujuan.id });
    await a.k.tunggu((m) => m.t === "pemberitahuan" && m.kode === "angkot_tiba");
    const t = titikHalte(tujuan);
    const urutan = a.k.masuk.filter((m) => m.t === "koreksi" || m.t === "pribadi" || m.t === "pemberitahuan");
    expect(urutan.map((m) => m.t)).toEqual(["koreksi", "pribadi", "pemberitahuan"]);
    expect(urutan[0]).toMatchObject({ x: t.x, y: t.y, seq: a.seq });
    expect(muatan(urutan[1])).toMatchObject({ angkot: 0 });

    // Butir perpisahan: B (dua ubin dari halte asal) menerima A di titik halte tujuan.
    await b.k.tunggu((m) => m.t === "dunia" && (m.p as ButirDunia[]).some((x) => x[0] === a.id && x[1] === t.x && x[2] === t.y), 3000);

    // Laporan gerak lama dari halte asal ditolak dan dijawab koreksi ke halte tujuan.
    a.k.masuk.length = 0;
    gerak(a, a.pos.x + 4, a.pos.y);
    const kor = await a.k.tunggu((m) => m.t === "koreksi");
    expect(kor).toMatchObject({ x: t.x, y: t.y });
    // Laporan pertama dari halte tujuan diterima tanpa koreksi.
    a.pos = { ...t };
    await tidur(400);
    a.k.masuk.length = 0;
    const maju = arahBebas(t, 20);
    gerak(a, maju.x, maju.y);
    await tidur(500);
    expect(a.k.masuk.filter((m) => m.t === "koreksi")).toEqual([]);
    // Tanpa karcis lagi: Angkot ditolak tanpa jawaban.
    a.k.masuk.length = 0;
    a.k.kirim({ v: V, t: "pakai_skill", skill: "angkot", halteId: asal.id });
    await tidur(400);
    expect(a.k.masuk.filter((m) => m.t === "koreksi" || m.t === "pemberitahuan")).toEqual([]);
    a.k.ws.close();
    b.k.ws.close();
  }, 60_000);

  it("ruang tanpa Teropong dan Angkot: kotak teropong dan karcis tidak terambil, pakai_skill diabaikan", async () => {
    const { isi } = await buatRuang({ skillAktif: ["lari", "kompas", "petunjuk"] });
    const kode = String(isi.kode);
    const a = await gabung(kode);
    await mulai(kode, [a]);
    await a.k.tunggu((m) => m.t === "pribadi");
    await ambilKotak(kode, a, "teropong");
    await tidur(400);
    expect(a.k.masuk.filter((m) => m.t === "pribadi" || m.t === "pemberitahuan")).toEqual([]);
    await ambilKotak(kode, a, "karcis");
    await tidur(400);
    expect(a.k.masuk.filter((m) => m.t === "pribadi" || m.t === "pemberitahuan")).toEqual([]);
    a.k.kirim({ v: V, t: "pakai_skill", skill: "teropong" });
    a.k.kirim({ v: V, t: "pakai_skill", skill: "angkot", halteId: "halte-1" });
    await tidur(400);
    expect(a.k.masuk.filter((m) => m.t === "pribadi" || m.t === "pemberitahuan" || m.t === "koreksi")).toEqual([]);
    a.k.ws.close();
  }, 60_000);
});
