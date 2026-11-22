// Uji layar kelas dan ruang dari konsol lewat Worker lokal sungguhan (spesifikasi JS-10; AC-4 sampai AC-14, AC-20, AC-21).
import { describe, expect, it } from "vitest";
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/versi";
import { alamat, buatRuang, klien, konsol, sesiAdmin, tidur, tungguSampai, type Klien } from "./bantuan";

const V = PROTOKOL_VERSI;
const B = alamat();
type Pesan = Record<string, unknown>;

interface Layar {
  ws: WebSocket;
  riwayat: Pesan[];
  tutupKode: number | null;
  tunggu: (cocok: (m: Pesan) => boolean, ms?: number) => Promise<Pesan>;
  kirim: (p: Pesan) => void;
}

async function tiket(id: string, cookie?: string): Promise<string> {
  const j = await fetch(`${B}/api/ruang/${id}/tiket`, { method: "POST", headers: { "X-Jejak": "1", Origin: B, Cookie: cookie ?? (await sesiAdmin()) }, body: "{}" });
  expect(j.status).toBe(200);
  return String(((await j.json()) as { tiket: string }).tiket);
}

async function layar(id: string, t?: string): Promise<Layar> {
  const ws = new WebSocket(`ws://127.0.0.1:4320/ws/kelas/${id}?tiket=${encodeURIComponent(t ?? (await tiket(id)))}`, { headers: { Origin: B } } as unknown as string[]);
  const l: Layar = {
    ws,
    riwayat: [],
    tutupKode: null,
    tunggu: async (cocok, ms = 6000) => {
      let ketemu: Pesan | undefined;
      await tungguSampai(() => (ketemu = l.riwayat.find(cocok)), (x) => x !== undefined, ms, 25);
      return ketemu as Pesan;
    },
    kirim: (p) => ws.send(JSON.stringify(p)),
  };
  ws.onmessage = (e) => l.riwayat.push(JSON.parse(String(e.data)) as Pesan);
  ws.onclose = (e) => (l.tutupKode = e.code);
  await new Promise<void>((ok, gagal) => {
    ws.onopen = () => ok();
    ws.onerror = () => gagal(new Error("sambungan layar kelas gagal"));
  });
  l.kirim({ v: V, t: "halo", peran: "guru" });
  return l;
}

async function gabung(kode: string, avatar = 0): Promise<{ k: Klien; pemainId: string; nama: string }> {
  const k = await klien(kode);
  k.kirim({ v: V, t: "halo", peran: "pemain" });
  const datang = (await k.tunggu((m) => m.t === "selamat_datang")) as { pemainId: string; saranNama: string[] };
  k.kirim({ v: V, t: "pilih_identitas", nama: datang.saranNama[0], avatar });
  await k.tunggu((m) => m.t === "pemain_baru" && m.id === datang.pemainId);
  return { k, pemainId: datang.pemainId, nama: datang.saranNama[0] };
}

async function ruangBaru(isi: Record<string, unknown> = {}): Promise<{ id: string; kode: string }> {
  const { status, isi: hasil } = await buatRuang(isi);
  expect(status).toBe(201);
  return { id: String(hasil.ruangId), kode: String(hasil.kode) };
}

describe("tiket dan sambungan layar kelas (P-12, P-13; AC-9, AC-10)", () => {
  it("sambutan info_kelas, status, dan lobi; tiket sekali pakai; sambungan kedua menutup yang pertama dengan 4001", async () => {
    const { id, kode } = await ruangBaru({ labelKelas: "IX B", batasPemain: 30 });
    const t = await tiket(id);
    const satu = await layar(id, t);
    const info = await satu.tunggu((m) => m.t === "info_kelas");
    expect(info).toMatchObject({ labelKelas: "IX B", kode, tautan: B, durasiMenit: 15, batasPemain: 30, uji: true, terkunci: false, jumlahKejadian: 16 });
    expect((info.kejadian as unknown[]).length).toBe(16);
    expect(await satu.tunggu((m) => m.t === "status_ruang")).toMatchObject({ status: "lobi" });
    expect(await satu.tunggu((m) => m.t === "lobi")).toMatchObject({ pemain: [] });
    // Tiket yang sama ditolak Durable Object (403); vite preview memutus soket tanpa jawaban, jadi sambungan gagal.
    await expect(layar(id, t)).rejects.toThrow("sambungan layar kelas gagal");
    const a = await gabung(kode, 2);
    await satu.tunggu((m) => m.t === "lobi" && (m.pemain as { id: string }[]).some((p) => p.id === a.pemainId));
    const dua = await layar(id);
    await dua.tunggu((m) => m.t === "info_kelas");
    await tungguSampai(() => satu.tutupKode, (k) => k !== null, 5000, 25);
    expect(satu.tutupKode).toBe(4001);
    a.k.ws.close();
    dua.ws.close();
  });
});

describe("ronde lewat layar kelas (P-14, P-17 sampai P-22; AC-12 sampai AC-14)", () => {
  it("mulai, dunia_kelas dua kali per detik, papan dan kemajuan, jeda, tambah waktu, akhiri, pembahasan, lalu tutup 4000", async () => {
    const { id, kode } = await ruangBaru();
    const a = await gabung(kode, 1);
    const b = await gabung(kode, 3);
    const l = await layar(id);
    const info = await l.tunggu((m) => m.t === "info_kelas");
    l.kirim({ v: V, t: "mulai" });
    await l.tunggu((m) => m.t === "status_ruang" && m.status === "hitung_mundur");
    await l.tunggu((m) => m.t === "status_ruang" && m.status === "main", 8000);
    const mulaiHitung = l.riwayat.length;
    await tidur(2000);
    const dunia = l.riwayat.slice(mulaiHitung).filter((m) => m.t === "dunia_kelas");
    expect(dunia.length).toBeGreaterThanOrEqual(3);
    expect(dunia.length).toBeLessThanOrEqual(6);
    expect((dunia.at(-1)?.p as unknown[][]).map((p) => p[0]).sort()).toEqual([a.pemainId, b.pemainId].sort());
    const papan = await l.tunggu((m) => m.t === "papan");
    expect(papan.jumlahPemain).toBe(2);
    expect((papan.pemain as { selesai: number }[]).map((p) => p.selesai)).toEqual([0, 0]);
    expect(await l.tunggu((m) => m.t === "kemajuan")).toMatchObject({ terjawab: 0, kemungkinan: 32 });
    l.kirim({ v: V, t: "jeda" });
    await l.tunggu((m) => m.t === "status_ruang" && m.status === "jeda");
    const sesudahJeda = l.riwayat.length;
    await tidur(800);
    expect(l.riwayat.slice(sesudahJeda).filter((m) => m.t === "dunia_kelas")).toEqual([]);
    l.kirim({ v: V, t: "lanjut" });
    const lanjut = await l.tunggu((m) => m.t === "status_ruang" && m.status === "main" && l.riwayat.indexOf(m) >= sesudahJeda);
    l.kirim({ v: V, t: "tambah_waktu", detik: 120 });
    await l.tunggu((m) => m.t === "status_ruang" && Number(m.berakhirPada) === Number(lanjut.berakhirPada) + 120_000);
    l.kirim({ v: V, t: "akhiri" });
    const selesai = await l.tunggu((m) => m.t === "status_ruang" && m.status === "selesai");
    await l.tunggu((m) => m.t === "papan" && l.riwayat.indexOf(m) > l.riwayat.indexOf(selesai));
    const kejadianId = (info.kejadian as { id: string }[])[0].id;
    l.kirim({ v: V, t: "pembahasan", kejadianId });
    await l.tunggu((m) => m.t === "status_ruang" && m.status === "pembahasan");
    const bahas = await l.tunggu((m) => m.t === "data_pembahasan");
    expect(bahas.kejadianId).toBe(kejadianId);
    expect((bahas.opsi1 as { jumlah: number }[]).map((o) => o.jumlah)).toEqual([0, 0, 0, 0]);
    await a.k.tunggu((m) => m.t === "status_ruang" && m.status === "pembahasan");
    l.kirim({ v: V, t: "tutup_ruang" });
    await tungguSampai(() => l.tutupKode, (k) => k !== null, 5000, 25);
    expect(l.tutupKode).toBe(4000);
    await tungguSampai(() => a.k.tutupKode, (k) => k !== null, 5000, 25);
    expect(a.k.tutupKode).toBe(4000);
    b.k.ws.close();
  }, 30_000);
});

describe("kelola dari konsol (P-8 sampai P-11; AC-7, AC-8)", () => {
  it("detail langsung, kunci (info_kelas terkunci), keluarkan, tutup hanya di lobi, selesai, dan pembahasan", async () => {
    const { id, kode } = await ruangBaru();
    const a = await gabung(kode);
    const detail = await konsol("GET", `/api/ruang/${id}`);
    expect(detail.status).toBe(200);
    expect(detail.isi.langsung).toMatchObject({ status: "lobi", terkunci: false, tautan: B, pemain: [{ id: a.pemainId, nama: a.nama, avatar: 0, terhubung: true }] });
    const l = await layar(id);
    await l.tunggu((m) => m.t === "info_kelas");
    expect(await konsol("POST", `/api/ruang/${id}/kelola`, { aksi: "kunci" })).toEqual({ status: 200, isi: { ok: true } });
    await l.tunggu((m) => m.t === "info_kelas" && m.terkunci === true);
    expect(await konsol("POST", `/api/ruang/${id}/kelola`, { aksi: "keluarkan", pemainId: "tidak-ada" })).toEqual({
      status: 404,
      isi: { galat: { kode: "PEMAIN_TIDAK_ADA", pesan: "Pemain tidak ditemukan di ruang ini." } },
    });
    expect((await konsol("POST", `/api/ruang/${id}/kelola`, { aksi: "keluarkan", pemainId: a.pemainId })).status).toBe(200);
    await a.k.tunggu((m) => m.t === "galat" && m.kode === "DIKELUARKAN");
    const b = await gabung(kode).catch(() => null);
    expect(b).toBeNull(); // ruang terkunci: pemain baru ditolak
    expect((await konsol("POST", `/api/ruang/${id}/kelola`, { aksi: "buka_kunci" })).status).toBe(200);
    const c = await gabung(kode);
    l.kirim({ v: V, t: "mulai" });
    await l.tunggu((m) => m.t === "status_ruang" && m.status === "hitung_mundur");
    expect(await konsol("POST", `/api/ruang/${id}/kelola`, { aksi: "tutup" })).toEqual({
      status: 409,
      isi: { galat: { kode: "STATUS_TIDAK_SESUAI", pesan: "Ruang hanya bisa ditutup di lobi, sesudah ronde selesai, atau saat pembahasan." } },
    });
    await l.tunggu((m) => m.t === "status_ruang" && m.status === "main", 8000);
    l.kirim({ v: V, t: "akhiri" });
    await l.tunggu((m) => m.t === "status_ruang" && m.status === "selesai", 8000);
    expect((await konsol("POST", `/api/ruang/${id}/kelola`, { aksi: "tutup" })).status).toBe(200);
    await tungguSampai(() => l.tutupKode, (k) => k !== null, 5000, 25);
    c.k.ws.close();
  }, 30_000);

  it("ruang di lobi bisa ditutup dari konsol; daftar, dasbor, pilihan paket, dan ruang biasa ditolak selama rujukan belum terverifikasi", async () => {
    const { id, kode } = await ruangBaru();
    const daftar = await konsol("GET", "/api/ruang");
    expect((daftar.isi.ruang as { kode: string }[]).some((r) => r.kode === kode)).toBe(true);
    const dasbor = await konsol("GET", "/api/dasbor");
    expect((dasbor.isi.ruang as unknown[]).length).toBeLessThanOrEqual(5);
    expect(Number(dasbor.isi.jumlahRuang)).toBeGreaterThanOrEqual(1);
    // JS-14: kesiapan paket dibaca dari jawaban, karena uji bank bisa memverifikasi rujukan lebih dulu.
    const pilihan = await konsol("GET", "/api/ruang/pilihan");
    expect(pilihan).toEqual({
      status: 200,
      isi: { paket: [{ id: "9880c4d5-8294-51c9-971a-e95531a2e039", nama: expect.any(String), jumlahKejadian: 16, siapRuangBiasa: expect.any(Boolean) }] },
    });
    if (!(pilihan.isi.paket as { siapRuangBiasa: boolean }[])[0].siapRuangBiasa) {
      expect((await buatRuang({ uji: false })).isi).toEqual({ galat: { kode: "PAKET_BELUM_SIAP", pesan: "Paket ini belum siap untuk ruang biasa. Centang Ruang uji." } });
    }
    expect((await konsol("POST", `/api/ruang/${id}/kelola`, { aksi: "tutup" })).status).toBe(200);
    expect((await fetch(`${B}/api/publik/ruang/${kode}`)).status).toBe(404);
  });
});

describe("guru: satu ruang aktif dan kepemilikan (P-4, P-33; AC-4, AC-21)", () => {
  it("guru kedua kalinya mendapat RUANG_MASIH_ADA beserta kodenya; ruang admin dijawab 404 untuk guru", async () => {
    const ip = "10.9.70.7";
    const email = `guru-kelas-${Date.now()}@sekolah.sch.id`;
    const akun = await konsol("POST", "/api/akun", { email, namaTampilan: "Bu Sari", peran: "guru", peninjau: false });
    expect(akun.status).toBe(201);
    const tajuk = { "X-Jejak": "1", Origin: B, "Content-Type": "application/json", "CF-Connecting-IP": ip };
    const masuk = await fetch(`${B}/api/masuk`, { method: "POST", headers: tajuk, body: JSON.stringify({ email, sandi: akun.isi.sandiSementara }) });
    const sementara = (masuk.headers.get("set-cookie") ?? "").split(";")[0];
    const ganti = await fetch(`${B}/api/sandi`, { method: "POST", headers: { ...tajuk, Cookie: sementara }, body: JSON.stringify({ sandiBaru: "kalimat sandi guru uji" }) });
    const cookie = (ganti.headers.get("set-cookie") ?? "").split(";")[0];
    const buat = async () => {
      const j = await fetch(`${B}/api/ruang`, {
        method: "POST",
        headers: { ...tajuk, Cookie: cookie },
        body: JSON.stringify({ labelKelas: "IX C", paketId: "9880c4d5-8294-51c9-971a-e95531a2e039", durasiMenit: 10, batasPemain: 30, batasTerlambatMenit: 5, modeNomorAbsen: false, uji: true }),
      });
      return { status: j.status, isi: (await j.json()) as Record<string, unknown> };
    };
    const pertama = await buat();
    expect(pertama.status).toBe(201);
    const ruang = pertama.isi.ruang as { id: string; kode: string };
    expect(await buat()).toEqual({
      status: 409,
      isi: { galat: { kode: "RUANG_MASIH_ADA", pesan: "Anda masih punya ruang yang belum ditutup. Tutup ruang itu dulu." }, ruang: { id: ruang.id, kode: ruang.kode, labelKelas: "IX C" } },
    });
    const milikAdmin = await ruangBaru();
    const lihat = await fetch(`${B}/api/ruang/${milikAdmin.id}`, { headers: { Cookie: cookie } });
    expect(lihat.status).toBe(404);
    const tiketGuru = await fetch(`${B}/api/ruang/${milikAdmin.id}/tiket`, { method: "POST", headers: { ...tajuk, Cookie: cookie }, body: "{}" });
    expect(tiketGuru.status).toBe(404);
    const daftar = (await (await fetch(`${B}/api/ruang`, { headers: { Cookie: cookie } })).json()) as { ruang: { id: string }[] };
    expect(daftar.ruang.map((r) => r.id)).toEqual([ruang.id]);
  });
});
