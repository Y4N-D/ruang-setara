// Ronde 5 menit di server (spesifikasi JS-25, rencana uji "Server"; AC-1, AC-3, AC-7 sampai AC-9). Penjaga tambahan
// protokol dengan WebSocket sungguhan (P-9), waktu ronde 300 detik dan tambah waktu (P-4), lalu riwayat, dasbor, dan
// CSV untuk ruang 5 menit yang diakhiri guru dan ditutup (P-13 sampai P-15, P-17).
import { describe, expect, it } from "vitest";
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/versi";
import { alamat, buatRuang, d1, kelas, klien, konsol, sesiAdmin, statistikRuang, tungguSampai, type Klien } from "./bantuan";

const V = PROTOKOL_VERSI;
const B = alamat();
type Pesan = Record<string, unknown>;

async function ruang(durasiMenit: number, uji = true): Promise<{ kode: string; id: string }> {
  const r = await buatRuang({ durasiMenit, uji, labelKelas: `Lima ${durasiMenit}` });
  expect(r.status, JSON.stringify(r.isi)).toBe(201);
  return { kode: r.isi.kode as string, id: r.isi.ruangId as string };
}

async function halo(k: Klien): Promise<Pesan> {
  k.kirim({ v: V, t: "halo", peran: "pemain" });
  return k.tunggu((m) => m.t === "selamat_datang");
}

async function dasbor(): Promise<{ sesi: Pesan[]; ringkasan: { sesi: number; sesiPendek: number; rataSkor: number | null; pemain: number } }> {
  const d = await konsol("GET", "/api/dasbor");
  expect(d.status).toBe(200);
  return d.isi as never;
}

describe("JS-25: ronde 5 menit di server", () => {
  it("/api/sehat memuat tambahan 1, dan protokol tetap 6 (P-8)", async () => {
    const j = await fetch(`${B}/api/sehat`);
    expect(await j.json()).toEqual({ ok: true, protokol: 6, tambahan: 1, lingkungan: "lokal" });
    expect(V).toBe(6);
  });

  it("POST /api/ruang menerima 5 menit dan menolak 0, 7, 25, dan teks (P-1)", async () => {
    const { kode, id } = await ruang(5);
    expect(d1<{ pengaturan_json: string }>(`SELECT pengaturan_json FROM ruang WHERE id = '${id}'`)[0].pengaturan_json).toContain('"durasiMenit":5');
    for (const salah of [0, 7, 25, "lima", "5"]) expect((await buatRuang({ durasiMenit: salah })).status, String(salah)).toBe(400);
    expect(await kelas(kode, { v: V, t: "tutup_ruang" })).toBe(200); // batas ruang aktif per guru
  });

  it("ruang 5 menit menolak kode lama sebelum halo; tambahan 1 diterima; ruang 15 menit tetap menerima kode lama (P-9)", async () => {
    const lima = await ruang(5);
    const lama = await klien(lima.kode);
    const galat = await lama.tunggu((m) => m.t === "galat");
    expect(galat).toMatchObject({ v: 6, t: "galat", kode: "VERSI_BERBEDA", pesan: "Ada pembaruan. Muat ulang halaman." });
    await tungguSampai(() => lama.tutupKode, (k) => k === 4005, 5000, 50);
    // Pesan dari sambungan itu tidak diproses, dan ruang tidak menunggu halo darinya.
    expect(lama.riwayat.map((m) => m.t)).toEqual(["galat"]);
    expect((await statistikRuang(lima.kode)).menungguHalo).toBe(0);

    const baru = await klien(lima.kode, 4320, B, 1);
    expect(((await halo(baru)).pengaturan as Pesan).durasiMenit).toBe(5);
    baru.ws.close();
    expect(await kelas(lima.kode, { v: V, t: "tutup_ruang" })).toBe(200);

    const limaBelas = await ruang(15);
    const lamaKe15 = await klien(limaBelas.kode);
    expect(((await halo(lamaKe15)).pengaturan as Pesan).durasiMenit).toBe(15);
    lamaKe15.ws.close();
    expect(await kelas(limaBelas.kode, { v: V, t: "tutup_ruang" })).toBe(200);
  });

  it("ronde 5 menit: berakhir 300 detik sesudah mulai, tambah waktu, akhiri, riwayat, dasbor, dan CSV (P-4, P-13 sampai P-17)", async () => {
    const sebelum = (await dasbor()).ringkasan;
    const { kode, id } = await ruang(5);
    const k = await klien(kode, 4320, B, 1);
    const datang = (await halo(k)) as { pemainId: string; saranNama: string[] };
    k.kirim({ v: V, t: "pilih_identitas", nama: datang.saranNama[0], avatar: 1 });
    await k.tunggu((m) => m.t === "pemain_baru" && m.id === datang.pemainId);

    expect(await kelas(kode, { v: V, t: "mulai" })).toBe(200);
    const main = (await k.tunggu((m) => m.t === "status_ruang" && m.status === "main", 15_000)) as { mulaiPada: number; berakhirPada: number };
    expect(main.berakhirPada - main.mulaiPada).toBe(300_000);
    k.masuk.length = 0;
    expect(await kelas(kode, { v: V, t: "tambah_waktu", detik: 120 })).toBe(200);
    const tambah = (await k.tunggu((m) => typeof m.berakhirPada === "number" && m.berakhirPada === main.berakhirPada + 120_000)) as Pesan;
    expect(tambah.berakhirPada).toBe(main.berakhirPada + 120_000);

    expect(await kelas(kode, { v: V, t: "akhiri" })).toBe(200);
    await k.tunggu((m) => m.t === "selesai");
    expect(await kelas(kode, { v: V, t: "tutup_ruang" })).toBe(200);
    await tungguSampai(
      () => d1<{ status: string; ringkasan_json: string | null }>(`SELECT status, ringkasan_json FROM ruang WHERE id = '${id}'`)[0],
      (r) => r?.status === "ditutup" && typeof r.ringkasan_json === "string" && r.ringkasan_json.includes('"hasil"'),
      15_000,
      250,
    );

    // Paket bawaan belum siap untuk ruang biasa, jadi ruang ini dibuat sebagai ruang uji lalu ditandai bukan uji di D1,
    // agar ikut ringkasan dasbor (yang melewati ruang uji).
    d1(`UPDATE ruang SET uji = 0 WHERE id = '${id}'`);

    // Riwayat: kolom Durasi dari pengaturan ruang (P-13).
    const riwayat = await konsol("GET", `/api/ruang/riwayat?label=${encodeURIComponent("Lima 5")}`);
    expect(riwayat.status).toBe(200);
    expect((riwayat.isi.ruang as Pesan[]).find((r) => r.id === id)).toMatchObject({ durasiMenit: 5, dimainkan: true, jumlahPemain: 1 });

    // Dasbor: sesi terakhir membawa durasi; ringkasan menghitung sesi dan pemain, tetapi rata-rata skor tanpa ronde
    // 5 menit (P-14, P-15).
    const sesudah = await dasbor();
    expect(sesudah.sesi.find((s) => s.id === id)).toMatchObject({ durasiMenit: 5 });
    expect(sesudah.ringkasan.sesi).toBe(sebelum.sesi + 1);
    expect(sesudah.ringkasan.sesiPendek).toBe(sebelum.sesiPendek + 1);
    expect(sesudah.ringkasan.pemain).toBe(sebelum.pemain + 1);
    expect(sesudah.ringkasan.rataSkor).toBe(sebelum.rataSkor);

    // CSV peserta: kolom terakhir "Durasi (menit)" berisi 5 (P-17).
    const csv = await (await fetch(`${B}/api/ruang/${id}/ekspor?jenis=peserta`, { headers: { Cookie: await sesiAdmin(), "CF-Connecting-IP": "10.9.70.25" } })).text();
    const baris = csv.replace(/^\uFEFF/, "").split("\r\n");
    expect(baris[0].split(";").at(-1)).toBe("Durasi (menit)");
    expect(baris[1].split(";").at(-1)).toBe("5");
    k.ws.close();
  });
});
