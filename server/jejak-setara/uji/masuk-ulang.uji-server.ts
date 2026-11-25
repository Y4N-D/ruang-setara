// Kode masuk ulang di Worker lokal (spesifikasi JS-16b, P-11 sampai P-15; AC-9 dan AC-11).
import { describe, expect, it } from "vitest";
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/protokol";
import { buatRuang, d1, klien, konsol, matikanServer, nyalakanServer, tidur, tungguSampai } from "./bantuan";

const V = PROTOKOL_VERSI;

async function masuk(kode: string, port = 4320) {
  const k = await klien(kode, port);
  k.kirim({ v: V, t: "halo", peran: "pemain" });
  const datang = (await k.tunggu((m) => m.t === "selamat_datang")) as unknown as { pemainId: string; token: string; saranNama: string[] };
  k.kirim({ v: V, t: "pilih_identitas", nama: datang.saranNama[0], avatar: 2 });
  await k.tunggu((m) => m.t === "pemain_baru" && m.id === datang.pemainId);
  return { k, pemainId: datang.pemainId, token: datang.token, nama: datang.saranNama[0] };
}

describe("JS-16b: kode masuk ulang lewat konsol dan halo", () => {
  it("rute kelola membuat kode 6 karakter yang berlaku 10 menit, dicatat tanpa kodenya; HP baru masuk, HP lama ditutup 4001, kode sekali pakai (AC-9)", async () => {
    const { isi } = await buatRuang({});
    const ruangId = String(isi.ruangId);
    const kode = String(isi.kode);
    const a = await masuk(kode);
    const sebelum = Date.now();
    const j = await konsol("POST", `/api/ruang/${ruangId}/kelola`, { aksi: "kode_masuk_ulang", pemainId: a.pemainId });
    expect(j.status).toBe(200);
    const kodeUlang = String(j.isi.kode);
    expect(kodeUlang).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
    expect(Number(j.isi.berlakuSampai) - sebelum).toBeGreaterThan(590_000);
    expect(Number(j.isi.berlakuSampai) - Date.now()).toBeLessThanOrEqual(600_000);
    const audit = d1<{ sasaran: string; rincian_json: string }>(`SELECT sasaran, rincian_json FROM log_audit WHERE aksi = 'ruang.kode_masuk_ulang' AND sasaran = '${ruangId}'`);
    expect(audit).toHaveLength(1);
    expect(JSON.parse(audit[0].rincian_json)).toEqual({ pemainId: a.pemainId });
    expect(audit[0].rincian_json).not.toContain(kodeUlang);

    // Galat rute: pemain tidak ada, tanpa pemainId, dan aksi tidak dikenal.
    expect((await konsol("POST", `/api/ruang/${ruangId}/kelola`, { aksi: "kode_masuk_ulang", pemainId: "p-tidakada" })).isi).toMatchObject({ galat: { kode: "PEMAIN_TIDAK_ADA" } });
    expect((await konsol("POST", `/api/ruang/${ruangId}/kelola`, { aksi: "kode_masuk_ulang" })).status).toBe(404);
    expect((await konsol("POST", `/api/ruang/${ruangId}/kelola`, { aksi: "kode_rahasia", pemainId: a.pemainId })).status).toBe(400);

    // HP baru masuk dengan kode (huruf kecil diterima); HP lama ditutup 4001.
    const b = await klien(kode);
    b.kirim({ v: V, t: "halo", peran: "pemain", kodeMasukUlang: kodeUlang.toLowerCase() });
    const datang = (await b.tunggu((m) => m.t === "selamat_datang")) as unknown as { pemainId: string; token: string };
    expect(datang.pemainId).toBe(a.pemainId);
    expect(datang.token).not.toBe(a.token);
    expect(await tungguSampai(() => a.k.tutupKode, (x) => x === 4001)).toBe(4001);

    // Sekali pakai: kode yang sama ditolak, sambungan tetap terbuka.
    const c = await klien(kode);
    c.kirim({ v: V, t: "halo", peran: "pemain", kodeMasukUlang: kodeUlang });
    expect(await c.tunggu((m) => m.t === "galat")).toMatchObject({ kode: "KODE_MASUK_ULANG_SALAH" });
    await tidur(300);
    expect(c.tutupKode).toBeNull();

    // Token HP lama tidak lagi menunjuk pemain itu.
    const d = await klien(kode);
    d.kirim({ v: V, t: "halo", peran: "pemain", token: a.token });
    const baru = (await d.tunggu((m) => m.t === "selamat_datang")) as unknown as { pemainId: string };
    expect(baru.pemainId).not.toBe(a.pemainId);
    for (const x of [b, c, d]) x.ws.close();
  });

  it("kode masuk ulang bertahan saat server dimatikan lalu dinyalakan lagi dengan keadaan yang sama (AC-11)", async () => {
    const keadaan = "test-results-jejak/keadaan-4322";
    let anak = await nyalakanServer(4322, ["--tanpa-build", "--keadaan", keadaan]);
    let kode = "";
    let pemainId = "";
    let kodeUlang = "";
    try {
      const { isi } = await buatRuang({}, 4322);
      kode = String(isi.kode);
      const a = await masuk(kode, 4322);
      pemainId = a.pemainId;
      const j = await konsol("POST", `/api/ruang/${String(isi.ruangId)}/kelola`, { aksi: "kode_masuk_ulang", pemainId }, 4322);
      expect(j.status).toBe(200);
      kodeUlang = String(j.isi.kode);
      a.k.ws.close();
      await tidur(300);
    } finally {
      await matikanServer(anak);
    }
    anak = await nyalakanServer(4322, ["--tanpa-build", "--keadaan", keadaan, "--pakai-ulang"]);
    try {
      const b = await klien(kode, 4322);
      b.kirim({ v: V, t: "halo", peran: "pemain", kodeMasukUlang: kodeUlang });
      expect(await b.tunggu((m) => m.t === "selamat_datang")).toMatchObject({ pemainId });
      b.ws.close();
    } finally {
      await matikanServer(anak);
    }
  }, 120_000);
});
