// Uji pengaman biaya lewat Worker lokal sungguhan (spesifikasi JS-22; AC-3, AC-11).
import { describe, expect, it } from "vitest";
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/versi";
import { alamat, buatRuang, d1, kelas, klien, konsol, tidur, tungguSampai } from "./bantuan";

const V = PROTOKOL_VERSI;
const B = alamat();
type Pesan = Record<string, unknown>;

async function gabung(kode: string) {
  const k = await klien(kode);
  k.kirim({ v: V, t: "halo", peran: "pemain" });
  const datang = (await k.tunggu((m) => m.t === "selamat_datang")) as { pemainId: string; saranNama: string[] };
  k.kirim({ v: V, t: "pilih_identitas", nama: datang.saranNama[0], avatar: 1 });
  await k.tunggu((m) => m.t === "pemain_baru" && m.id === datang.pemainId);
  return k;
}

describe("pemakaian per ruang (P-15 sampai P-17)", () => {
  it("ruang yang ditutup menyimpan pemakaian di ringkasan_json, dan detail ruang admin menampilkannya", async () => {
    const { status, isi } = await buatRuang({});
    expect(status).toBe(201);
    const kode = String(isi.kode);
    const id = String(isi.ruangId);
    const a = await gabung(kode);
    for (let i = 0; i < 5; i++) a.kirim({ v: V, t: "ping", t0: Date.now() } as Pesan);
    await tidur(300);
    const langsung = await konsol("GET", `/api/ruang/${id}`);
    const pemakaian = langsung.isi.pemakaian as Record<string, number>;
    expect(pemakaian.sambungan).toBeGreaterThanOrEqual(1);
    expect(pemakaian.pesanMasuk).toBeGreaterThanOrEqual(2);
    expect(pemakaian.internal).toBeGreaterThanOrEqual(2);
    expect(pemakaian.perkiraanPermintaan).toBe(pemakaian.sambungan + Math.ceil(pemakaian.pesanMasuk / 20) + pemakaian.alarm + pemakaian.internal);
    expect(await kelas(kode, { v: V, t: "tutup_ruang" })).toBe(200);
    await tungguSampai(
      () => d1<{ ringkasan_json: string | null }>(`SELECT ringkasan_json FROM ruang WHERE id = '${id}'`)[0]?.ringkasan_json,
      (x) => typeof x === "string" && x.includes("pemakaian"),
      10_000,
      250,
    );
    const ringkasan = JSON.parse(d1<{ ringkasan_json: string }>(`SELECT ringkasan_json FROM ruang WHERE id = '${id}'`)[0].ringkasan_json) as { pemakaian: Record<string, number> };
    expect(ringkasan.pemakaian.sambungan).toBeGreaterThanOrEqual(2);
    expect(ringkasan.pemakaian.barisSqlite).toBeGreaterThan(0);
    // JS-15 (D-3 a): waktu pulang-pergi tidak ditulis ke D1.
    expect(Object.keys(ringkasan.pemakaian).filter((k) => k.startsWith("rtt"))).toEqual([]);
    const detail = await konsol("GET", `/api/ruang/${id}`);
    expect(detail.isi.langsung).toBeNull();
    expect((detail.isi.pemakaian as Record<string, number>).sambungan).toBeGreaterThanOrEqual(2);
    a.ws.close();
  }, 30_000);
});

describe("JS-15: waktu pulang-pergi HP di pemakaian (P-27 sampai P-29, AC-22)", () => {
  it("ping dengan rttMs dari pemain masuk median, p95, dan sampel; ping tanpa rttMs dan rttMs tidak sah tidak dihitung", async () => {
    const { isi } = await buatRuang({});
    const kode = String(isi.kode);
    const id = String(isi.ruangId);
    const a = await gabung(kode);
    const kosong = (await konsol("GET", `/api/ruang/${id}`)).isi.pemakaian as Record<string, number | null>;
    expect([kosong.rttMedianMs, kosong.rttP95Ms, kosong.rttSampel]).toEqual([null, null, 0]);
    for (const rttMs of [35, 42, 48, 51, 57, 63, 66, 74, 88, 240]) a.kirim({ v: V, t: "ping", tKlien: Date.now(), rttMs } as Pesan);
    a.kirim({ v: V, t: "ping", tKlien: Date.now() } as Pesan);
    a.kirim({ v: V, t: "ping", tKlien: Date.now(), rttMs: 60_001 } as Pesan);
    await tungguSampai(
      async () => ((await konsol("GET", `/api/ruang/${id}`)).isi.pemakaian as Record<string, number>).rttSampel,
      (n) => n >= 10,
      10_000,
    );
    const p = (await konsol("GET", `/api/ruang/${id}`)).isi.pemakaian as Record<string, number>;
    expect([p.rttMedianMs, p.rttP95Ms, p.rttSampel]).toEqual([60, 250, 10]);
    // Layar kelas tidak punya pesan ping: pesan itu ditolak skema kelas dan tidak menambah sampel.
    await kelas(kode, { v: V, t: "ping", tKlien: Date.now(), rttMs: 10 });
    expect(((await konsol("GET", `/api/ruang/${id}`)).isi.pemakaian as Record<string, number>).rttSampel).toBe(10);
    a.ws.close();
  }, 30_000);
});

describe("anggaran alarm (P-3, P-6)", () => {
  it("alarm ke-201 menjalankan berhenti paksa: ruang ditutup, sambungan 4000, kode tidak lagi ditemukan", async () => {
    const { isi } = await buatRuang({});
    const kode = String(isi.kode);
    const a = await gabung(kode);
    const atur = await fetch(`${B}/api/uji/ruang/${kode}/pengaman`, { method: "POST", body: JSON.stringify({ alarmDipakai: 200 }) });
    expect(await atur.json()).toEqual({ ok: true, alarmDipakai: 200 });
    expect(await kelas(kode, { v: V, t: "mulai" })).toBe(200);
    await a.tunggu((m) => m.t === "status_ruang" && m.status === "ditutup", 8000);
    await tungguSampai(() => a.tutupKode, (k) => k !== null, 8000, 50);
    expect(a.tutupKode).toBe(4000);
    await tungguSampai(async () => (await fetch(`${B}/api/publik/ruang/${kode}`)).status, (s) => s === 404, 8000, 250);
  }, 30_000);
});
