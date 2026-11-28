// Uji server akhir ronde dan hasil lewat Worker lokal sungguhan (spesifikasi JS-11, rencana uji "Uji server"; AC-2,
// AC-9 sampai AC-11, AC-13, AC-15, AC-17, AC-19): ronde penuh dengan tiga pemain, rekap di `selesai`, pemain
// dikeluarkan saat pembahasan, hasil dan ringkasan_json, riwayat, rincian, kedua CSV, dan hapus data ruang; serta
// berhenti paksa dari status `main` lewat kait uji `pengaman` (P-12).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { skemaServerPemain } from "../../../app/jejak-setara/inti/protokol";
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/versi";
import { alamat, buatRuang, d1, kelas, klien, konsol, sesiAdmin, tidur, tungguSampai, type Klien } from "./bantuan";

const V = PROTOKOL_VERSI;
const B = alamat();
type Pesan = Record<string, unknown>;
type Pemain = { k: Klien; id: string; nama: string };

const BANK = JSON.parse(readFileSync(new URL("../seed/bank-awal.json", import.meta.url), "utf8")) as {
  kejadian: { kode: string; langkah1: { opsi: { teks: string; benar: boolean }[] }; langkah2: { opsi: { teks: string; tingkat: string }[] } }[];
};
function kejadianBank(kode: string) {
  const k = BANK.kejadian.find((x) => x.kode === kode);
  if (!k) throw new Error(`kejadian ${kode} tidak ada di bank awal`);
  return k;
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

/** Pindah ke bawah titik, menunggu titik terlihat, lalu memeriksa; mengembalikan kejadian_terbuka (pola JS-08). */
async function periksa(p: Pemain, kode: string, kejadianId: string, t: { x: number; y: number }): Promise<Pesan> {
  const pindah = await fetch(`${B}/api/uji/ruang/${kode}/pindahkan`, { method: "POST", body: JSON.stringify({ nama: p.nama, x: t.x, y: t.y + 1 }) });
  expect(pindah.status).toBe(200);
  await p.k.tungguRiwayat((m) => m.t === "kejadian_terlihat" && m.kejadianId === kejadianId && m.x === t.x && m.y === t.y);
  p.k.masuk.length = 0;
  p.k.kirim({ v: V, t: "periksa", kejadianId });
  return p.k.tunggu((m) => m.t === "kejadian_terbuka" && m.kejadianId === kejadianId);
}

/** Menunggu antrean kiriman ruang ke D1 kosong (P-15), lewat detail ruang di konsol. */
async function kirimanSelesai(id: string): Promise<void> {
  await tungguSampai(
    async () => ((await konsol("GET", `/api/ruang/${id}`)).isi.langsung as { kirimanTertunda?: boolean } | null)?.kirimanTertunda,
    (t) => t === false,
    20_000,
    200,
  );
}

const HURUF = ["A", "B", "C", "D"];

describe("ronde penuh sampai hapus data ruang (P-1 sampai P-33)", () => {
  it("selesai dengan rekap, keluarkan saat pembahasan, hasil sama dengan ringkasan_json, riwayat, rincian, CSV, dan hapus", async () => {
    const { status, isi } = await buatRuang({ labelKelas: "IX Hasil", modeNomorAbsen: false });
    expect(status).toBe(201);
    const kode = String(isi.kode);
    const id = String(isi.ruangId);
    const a = await gabung(kode, 1);
    const b = await gabung(kode, 2);
    const c = await gabung(kode, 3);

    // Lobi: hasil belum ada (409) dan CSV juga (P-21, P-26).
    expect((await konsol("GET", `/api/ruang/${id}/hasil`)).status).toBe(409);
    expect((await konsol("GET", `/api/ruang/${id}/ekspor?jenis=peserta`)).status).toBe(409);

    expect(await kelas(kode, { v: V, t: "mulai" })).toBe(200);
    for (const p of [a, b, c]) await p.k.tunggu((m) => m.t === "status_ruang" && m.status === "main", 8000);
    const [k1] = await titikKejadian(kode);
    const bank1 = kejadianBank(k1.kejadianId);

    // A: Langkah 1 benar dan Langkah 2 tepat. B: Langkah 1 keliru saja. C: tidak menjawab.
    const bukaA = await periksa(a, kode, k1.kejadianId, k1.titik[0]);
    const opsiA = bukaA.opsi1 as { id: string; teks: string }[];
    const benarA = opsiA.findIndex((o) => o.teks === bank1.langkah1.opsi.find((x) => x.benar)?.teks);
    expect(benarA).toBeGreaterThanOrEqual(0);
    a.k.kirim({ v: V, t: "kunci_1", kejadianId: k1.kejadianId, opsiId: opsiA[benarA].id });
    const h1A = await a.k.tunggu((m) => m.t === "hasil_1");
    expect(h1A.benar).toBe(true);
    const opsi2A = h1A.opsi2 as { id: string; teks: string }[];
    const tepatA = opsi2A.findIndex((o) => o.teks === bank1.langkah2.opsi.find((x) => x.tingkat === "tepat")?.teks);
    a.k.kirim({ v: V, t: "kunci_2", kejadianId: k1.kejadianId, opsiId: opsi2A[tepatA].id });
    await a.k.tunggu((m) => m.t === "hasil_2");
    a.k.kirim({ v: V, t: "tutup_dialog", kejadianId: k1.kejadianId });

    const bukaB = await periksa(b, kode, k1.kejadianId, k1.titik[0]);
    const opsiB = bukaB.opsi1 as { id: string; teks: string }[];
    const kelirB = opsiB.findIndex((o) => o.teks !== bank1.langkah1.opsi.find((x) => x.benar)?.teks);
    b.k.kirim({ v: V, t: "kunci_1", kejadianId: k1.kejadianId, opsiId: opsiB[kelirB].id });
    expect((await b.k.tunggu((m) => m.t === "hasil_1")).benar).toBe(false);

    // Akhiri: setiap HP menerima selesai dengan rekapnya sendiri, lolos skema (P-1, P-3; AC-2).
    for (const p of [a, b, c]) p.k.masuk.length = 0;
    expect(await kelas(kode, { v: V, t: "akhiri" })).toBe(200);
    const sA = await a.k.tunggu((m) => m.t === "selesai");
    const sB = await b.k.tunggu((m) => m.t === "selesai");
    const sC = await c.k.tunggu((m) => m.t === "selesai");
    for (const s of [sA, sB, sC]) expect(skemaServerPemain.safeParse(s).success).toBe(true);
    expect(sA).toMatchObject({ peringkat: 1, jumlahPemain: 3 });
    expect((sA.rekap as Pesan[]).map((r) => [r.kejadianId, r.benar1, r.tingkat2])).toEqual([[k1.kejadianId, true, "tepat"]]);
    expect((sB.rekap as Pesan[]).map((r) => [r.kejadianId, r.benar1, r.pilihan2, r.tingkat2])).toEqual([[k1.kejadianId, false, null, null]]);
    expect(sC.rekap).toEqual([]);

    // Keluarkan B saat pembahasan: peringkat dihitung ulang dan selesai dikirim lagi (P-13, D-4).
    expect(await kelas(kode, { v: V, t: "pembahasan", kejadianId: k1.kejadianId })).toBe(200);
    a.k.masuk.length = 0;
    expect((await konsol("POST", `/api/ruang/${id}/kelola`, { aksi: "keluarkan", pemainId: b.id })).status).toBe(200);
    expect(await a.k.tunggu((m) => m.t === "selesai")).toMatchObject({ peringkat: 1, jumlahPemain: 2 });
    await kirimanSelesai(id);
    const baris = d1<{ id: string; dikeluarkan: number; peringkat_akhir: number | null }>(`SELECT id, dikeluarkan, peringkat_akhir FROM peserta WHERE ruang_id = '${id}'`);
    expect(Object.fromEntries(baris.map((r) => [r.id, [r.dikeluarkan, r.peringkat_akhir]]))).toEqual({ [a.id]: [0, 1], [b.id]: [1, null], [c.id]: [0, 2] });

    // Hasil saat pembahasan (P-21): angka per peserta dan urutan.
    const hasil = await konsol("GET", `/api/ruang/${id}/hasil`);
    expect(hasil.status).toBe(200);
    const peserta = hasil.isi.peserta as Pesan[];
    expect(peserta.map((p) => [p.id, p.peringkat, p.dikeluarkan])).toEqual([
      [a.id, 1, false],
      [c.id, 2, false],
      [b.id, null, true],
    ]);
    expect(peserta[0]).toMatchObject({ langkah1Dijawab: 1, langkah1Benar: 1, tepat: 1, kurang: 0, berisiko: 0, selesai: 1 });
    expect(peserta[2]).toMatchObject({ langkah1Dijawab: 1, langkah1Benar: 0, tepat: 0, kurang: 0, berisiko: 0 });
    const skorA = Number(sA.skor);
    expect(hasil.isi.ringkasan).toEqual({ jumlahPemain: 2, dikeluarkan: 1, rataSkor: Math.round((skorA / 2) * 10) / 10, ketepatan1: 100, tingkat: { tepat: 100, kurang: 0, berisiko: 0 } });

    // Tutup ruang: ringkasan_json berisi pemakaian dan hasil yang sama dengan P-21 (P-14; AC-10).
    expect(await kelas(kode, { v: V, t: "tutup_ruang" })).toBe(200);
    const ringkasanJson = await tungguSampai(
      () => d1<{ status: string; ringkasan_json: string | null }>(`SELECT status, ringkasan_json FROM ruang WHERE id = '${id}'`)[0],
      (r) => r?.status === "ditutup" && typeof r.ringkasan_json === "string" && r.ringkasan_json.includes('"hasil"'),
      15_000,
      250,
    );
    const { pemakaian, hasil: h } = JSON.parse(ringkasanJson.ringkasan_json as string) as { pemakaian: Pesan; hasil: Record<string, number> };
    expect(pemakaian).toBeTruthy();
    expect(h).toEqual({ versi: 1, jumlahKejadian: Number(isi.kejadian), jumlahPemain: 2, jumlahSkor: skorA, langkah1Dijawab: 1, langkah1Benar: 1, tepat: 1, kurang: 0, berisiko: 0 });

    // Riwayat (P-17; AC-13).
    const riwayat = await konsol("GET", `/api/ruang/riwayat?label=${encodeURIComponent("ix has")}`);
    expect(riwayat.status).toBe(200);
    const r = (riwayat.isi.ruang as Pesan[]).find((x) => x.id === id);
    expect(r).toMatchObject({ kode, labelKelas: "IX Hasil", dimainkan: true, jumlahPemain: 2, rataSkor: Math.round((skorA / 2) * 10) / 10 });

    // Rincian A: huruf yang dilihat A dan teks dari versi kejadian (P-24; AC-15).
    const rincian = await konsol("GET", `/api/ruang/${id}/hasil/${a.id}`);
    expect(rincian.status).toBe(200);
    expect(rincian.isi.peserta).toEqual({ id: a.id, nama: a.nama });
    expect((rincian.isi.jawaban as Pesan[])[0]).toMatchObject({
      kode: k1.kejadianId,
      huruf1: HURUF[benarA],
      pilihan1: opsiA[benarA].teks,
      benar1: true,
      huruf2: HURUF[tepatA],
      tingkat2: "tepat",
    });
    expect((await konsol("GET", `/api/ruang/${id}/hasil/bukan-pemain`)).status).toBe(404);

    // CSV peserta dan jawaban (P-26 sampai P-30; AC-17).
    const tajuk = { Cookie: await sesiAdmin(), "CF-Connecting-IP": "10.9.70.7" };
    const csvP = await fetch(`${B}/api/ruang/${id}/ekspor?jenis=peserta`, { headers: tajuk });
    expect(csvP.status).toBe(200);
    expect(csvP.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(csvP.headers.get("cache-control")).toBe("no-store");
    expect(csvP.headers.get("x-content-type-options")).toBe("nosniff");
    expect(csvP.headers.get("content-security-policy")).toBe("default-src 'none'; frame-ancestors 'none'");
    expect(csvP.headers.get("content-disposition")).toMatch(/^attachment; filename="jejak-setara_ix-hasil_\d{4}-\d{2}-\d{2}_peserta\.csv"$/);
    const teksP = new TextDecoder("utf-8", { ignoreBOM: true }).decode(await csvP.arrayBuffer());
    expect(teksP.startsWith("﻿")).toBe(true);
    const barisP = teksP.slice(1).split("\r\n").filter(Boolean);
    expect(barisP).toHaveLength(4);
    expect(barisP[0].split(";")).toHaveLength(17); // JS-25 (P-17): kolom ke-17 "Durasi (menit)"
    expect(barisP[3]).toContain(b.nama);
    expect(barisP[3].endsWith(";Dikeluarkan;15")).toBe(true);
    const csvJ = await fetch(`${B}/api/ruang/${id}/ekspor?jenis=jawaban`, { headers: tajuk });
    const teksJ = new TextDecoder("utf-8", { ignoreBOM: true }).decode(await csvJ.arrayBuffer());
    const barisJ = teksJ.slice(1).split("\r\n").filter(Boolean);
    expect(barisJ).toHaveLength(3);
    expect(barisJ[0].split(";")).toHaveLength(19); // JS-09 (P-47): kolom ke-18 "Petunjuk dipakai"; JS-25 (P-17): ke-19 "Durasi (menit)"
    expect((await konsol("GET", `/api/ruang/${id}/ekspor?jenis=lain`)).status).toBe(400);

    // Hapus: guru 403 (D-3a), admin 200; satu baris audit; ruang hilang dari riwayat dan hasil 404 (P-33; AC-19).
    const guru = await akunGuru();
    const olehGuru = await fetch(`${B}/api/ruang/${id}`, { method: "DELETE", headers: { "X-Jejak": "1", Origin: B, Cookie: guru, "CF-Connecting-IP": "10.9.71.7" } });
    expect(olehGuru.status).toBe(403);
    expect(await konsol("DELETE", `/api/ruang/${id}`)).toEqual({ status: 200, isi: { ok: true } });
    expect(d1<{ n: number }>(`SELECT COUNT(*) AS n FROM log_audit WHERE aksi = 'ruang.hapus' AND sasaran = '${id}'`)[0].n).toBe(1);
    for (const t of ["ruang WHERE id", "peserta WHERE ruang_id", "jawaban WHERE ruang_id"]) expect(d1<{ n: number }>(`SELECT COUNT(*) AS n FROM ${t} = '${id}'`)[0].n).toBe(0);
    expect(((await konsol("GET", "/api/ruang/riwayat")).isi.ruang as Pesan[]).some((x) => x.id === id)).toBe(false);
    expect((await konsol("GET", `/api/ruang/${id}/hasil`)).status).toBe(404);
    expect((await konsol("DELETE", `/api/ruang/${id}`)).status).toBe(404);
    for (const p of [a, b, c]) p.k.ws.close();
  }, 90_000);
});

/** Akun guru siap pakai: dibuat admin, masuk, lalu ganti sandi sementara. Mengembalikan cookie sesinya. */
async function akunGuru(): Promise<string> {
  const ip = "10.9.71.7";
  const email = `guru-hasil-${Date.now()}@sekolah.sch.id`;
  const buat = await konsol("POST", "/api/akun", { email, namaTampilan: "Bu Dewi", peran: "guru", peninjau: false });
  expect(buat.status).toBe(201);
  const dasar = { "X-Jejak": "1", Origin: B, "Content-Type": "application/json", "CF-Connecting-IP": ip };
  const masuk = await fetch(`${B}/api/masuk`, { method: "POST", headers: dasar, body: JSON.stringify({ email, sandi: String(buat.isi.sandiSementara) }) });
  expect(masuk.status).toBe(200);
  const sementara = (masuk.headers.get("set-cookie") ?? "").split(";")[0];
  const ganti = await fetch(`${B}/api/sandi`, { method: "POST", headers: { ...dasar, Cookie: sementara }, body: JSON.stringify({ sandiBaru: "kalimat sandi guru hasil" }) });
  expect(ganti.status).toBe(200);
  return (ganti.headers.get("set-cookie") ?? "").split(";")[0];
}

describe("berhenti paksa dari status main (P-12; AC-9)", () => {
  it("anggaran alarm habis saat main: peserta mendapat peringkat akhir dan ringkasan_json berisi hasil", async () => {
    const { isi } = await buatRuang({ labelKelas: "IX Paksa" });
    const kode = String(isi.kode);
    const id = String(isi.ruangId);
    const a = await gabung(kode, 1);
    const b = await gabung(kode, 2);
    expect(await kelas(kode, { v: V, t: "mulai" })).toBe(200);
    for (const p of [a, b]) await p.k.tunggu((m) => m.t === "status_ruang" && m.status === "main", 8000);
    const [k1] = await titikKejadian(kode);
    const buka = await periksa(a, kode, k1.kejadianId, k1.titik[0]);
    const opsi = buka.opsi1 as { id: string; teks: string }[];
    const benar = opsi.findIndex((o) => o.teks === kejadianBank(k1.kejadianId).langkah1.opsi.find((x) => x.benar)?.teks);
    a.k.kirim({ v: V, t: "kunci_1", kejadianId: k1.kejadianId, opsiId: opsi[benar].id });
    await a.k.tunggu((m) => m.t === "hasil_1");
    // Anggaran alarm hampir habis; sambungan tanpa halo memasang alarm batas halo 10 detik, yang menjadi alarm ke-201.
    const atur = await fetch(`${B}/api/uji/ruang/${kode}/pengaman`, { method: "POST", body: JSON.stringify({ alarmDipakai: 200 }) });
    expect(await atur.json()).toEqual({ ok: true, alarmDipakai: 200 });
    const diam = await klien(kode);
    await a.k.tunggu((m) => m.t === "status_ruang" && m.status === "ditutup", 20_000);
    expect(a.k.riwayat.some((m) => m.t === "selesai")).toBe(false);
    const peserta = await tungguSampai(
      () => d1<{ id: string; peringkat_akhir: number | null }>(`SELECT id, peringkat_akhir FROM peserta WHERE ruang_id = '${id}' ORDER BY peringkat_akhir`),
      (r) => r.length === 2 && r.every((x) => x.peringkat_akhir !== null),
      15_000,
      250,
    );
    expect(peserta.map((p) => [p.id, p.peringkat_akhir])).toEqual([
      [a.id, 1],
      [b.id, 2],
    ]);
    const ruang = d1<{ status: string; ringkasan_json: string }>(`SELECT status, ringkasan_json FROM ruang WHERE id = '${id}'`)[0];
    expect(ruang.status).toBe("ditutup");
    expect((JSON.parse(ruang.ringkasan_json) as { hasil: Record<string, number> }).hasil).toMatchObject({ jumlahPemain: 2, langkah1Dijawab: 1, langkah1Benar: 1 });
    expect((await konsol("GET", `/api/ruang/${id}/hasil`)).isi).toMatchObject({ dimainkan: true });
    await tidur(100);
    for (const k of [a.k, b.k, diam]) k.ws.close();
  }, 60_000);
});
