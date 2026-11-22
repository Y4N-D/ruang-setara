// Uji server JS-14 lewat HTTP dan WebSocket sungguhan (spesifikasi JS-14; AC-11, AC-13, AC-15 sampai AC-17, AC-20,
// AC-21): mode nama, penyaring, ganti nama dari konsol dan layar kelas, ganti semua nama, CSV, dan penghapusan otomatis.
import { describe, expect, it } from "vitest";
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/versi";
import { NAMA_SAMARAN } from "../src/ruang/nama-samaran";
import { alamat, buatRuang, d1, kelasJson, klien, klienKelas, konsol, sesiAdmin, tungguSampai, type Klien } from "./bantuan";

const V = PROTOKOL_VERSI;
type Pesan = Record<string, unknown>;

async function datang(kode: string) {
  const k = await klien(kode);
  k.kirim({ v: V, t: "halo", peran: "pemain" });
  const s = (await k.tunggu((m) => m.t === "selamat_datang")) as Pesan & { pemainId: string; saranNama: string[]; pengaturan: { modeNama: string } };
  return { k, s };
}

async function pilih(k: Klien, nama: string): Promise<Pesan> {
  k.masuk.length = 0;
  k.kirim({ v: V, t: "pilih_identitas", nama, avatar: 2 });
  return k.tunggu((m) => m.t === "galat" || m.t === "pemain_baru");
}

describe("mode nama di ruang sungguhan (AC-11, AC-13)", () => {
  it("nilai mode nama lain ditolak; ruang tanpa isian memakai daftar", async () => {
    expect((await buatRuang({ modeNama: "rakitan" })).status).toBe(400);
    const r = await buatRuang({ labelKelas: "IX Daftar" });
    expect(r.status).toBe(201);
    const pub = (await (await fetch(`${alamat()}/api/publik/ruang/${String(r.isi.kode)}`)).json()) as Pesan;
    expect(pub.modeNama).toBe("daftar");
    const a = await datang(String(r.isi.kode));
    expect(a.s.pengaturan.modeNama).toBe("daftar");
    expect(await pilih(a.k, "Putu Agus")).toMatchObject({ t: "galat", kode: "NAMA_DIPAKAI" });
    a.k.ws.close();
  });

  it("mode bebas: nama buatan dirapikan, kata kasar NAMA_DITOLAK, nama kembar NAMA_DIPAKAI, ganti nama, dan ganti semua nama", async () => {
    const r = await buatRuang({ labelKelas: "IX Nama", modeNama: "bebas" });
    expect(r.status).toBe(201);
    const kode = String(r.isi.kode);
    const id = String(r.isi.ruangId);
    expect((await (await fetch(`${alamat()}/api/publik/ruang/${kode}`)).json()) as Pesan).toEqual({ ada: true, modeNomorAbsen: false, modeNama: "bebas" });
    expect(JSON.parse(String(d1<{ p: string }>(`SELECT pengaturan_json AS p FROM ruang WHERE id = '${id}'`)[0].p)).modeNama).toBe("bebas");

    const a = await datang(kode);
    expect(a.s.pengaturan.modeNama).toBe("bebas");
    expect(await pilih(a.k, "Budi Anjing")).toMatchObject({ t: "galat", kode: "NAMA_DITOLAK", pesan: "Nama itu tidak bisa dipakai. Coba nama lain." });
    expect(await pilih(a.k, "  Putu   Agus ")).toMatchObject({ t: "pemain_baru", nama: "Putu Agus" });
    const b = await datang(kode);
    expect(await pilih(b.k, "putu  AGUS")).toMatchObject({ t: "galat", kode: "NAMA_DIPAKAI" });

    // Ganti nama dari konsol (P-51): nama baru dari daftar, nama_baru ke semua, nama lama diblokir.
    const ganti = await konsol("POST", `/api/ruang/${id}/kelola`, { aksi: "ganti_nama", pemainId: a.s.pemainId });
    expect(ganti.status).toBe(200);
    expect(NAMA_SAMARAN).toContain(String(ganti.isi.nama));
    await a.k.tungguRiwayat((m) => m.t === "nama_baru" && m.id === a.s.pemainId && m.nama === ganti.isi.nama);
    await b.k.tungguRiwayat((m) => m.t === "nama_baru" && m.id === a.s.pemainId);
    expect(await pilih(b.k, "Putu Agus")).toMatchObject({ t: "galat", kode: "NAMA_DITOLAK" });
    expect((await konsol("POST", `/api/ruang/${id}/kelola`, { aksi: "ganti_nama", pemainId: "p-tidak-ada" })).status).toBe(404);

    // Ganti nama dari layar kelas (P-46).
    expect(await pilih(b.k, "Komang Wira")).toMatchObject({ t: "pemain_baru", nama: "Komang Wira" });
    const kk = await klienKelas(kode);
    expect(kk).not.toBeNull();
    kk?.ws.send(JSON.stringify({ v: V, t: "ganti_nama", pemainId: b.s.pemainId }));
    const baru = (await b.k.tungguRiwayat((m) => m.t === "nama_baru" && m.id === b.s.pemainId)) as Pesan;
    expect(NAMA_SAMARAN).toContain(String(baru.nama));
    await tungguSampai(
      () => kk?.riwayat.filter((m) => m.t === "lobi").at(-1) as { pemain?: { nama: string }[] } | undefined,
      (l) => !!l?.pemain?.some((p) => p.nama === baru.nama),
      5000,
    );

    // Ganti semua nama (P-48): pemain dengan nama ketikan diganti, lalu ruang menjadi mode daftar.
    const c = await datang(kode);
    expect(await pilih(c.k, "Gede Surya")).toMatchObject({ t: "pemain_baru", nama: "Gede Surya" });
    const d = await datang(kode);
    const semua = await konsol("POST", `/api/ruang/${id}/kelola`, { aksi: "ganti_semua_nama" });
    expect(semua).toMatchObject({ status: 200, isi: { ok: true, jumlah: 1 } });
    await d.k.tungguRiwayat((m) => m.t === "mode_nama" && m.modeNama === "daftar");
    expect((await konsol("POST", `/api/ruang/${id}/kelola`, { aksi: "ganti_semua_nama" })).isi).toMatchObject({ galat: { kode: "BUKAN_NAMA_BEBAS" } });
    const detail = await konsol("GET", `/api/ruang/${id}`);
    expect((detail.isi.langsung as { modeNama?: string } | undefined)?.modeNama).toBe("daftar");

    // CSV (P-61): judul "Nama pemain" dan nama baru sesudah ronde berakhir.
    expect((await kelasJson(kode, { v: V, t: "mulai" })).status).toBe(200);
    await tungguSampai(() => kk?.status, (s) => s === "main", 10_000);
    expect((await kelasJson(kode, { v: V, t: "akhiri" })).status).toBe(200);
    await tungguSampai(() => kk?.status, (s) => s === "selesai", 10_000);
    const cookie = await sesiAdmin();
    const ambilCsv = async (jenis: string) => {
      const j = await fetch(`${alamat()}/api/ruang/${id}/ekspor?jenis=${jenis}`, { headers: { Cookie: cookie } });
      return j.ok ? await j.text() : "";
    };
    const csv = await tungguSampai(() => ambilCsv("peserta"), (t) => t.includes(String(baru.nama)), 40_000, 1000);
    const judul = csv.replace(/^\uFEFF/, "").split(/\r?\n/)[0];
    expect(judul).toContain("Nama pemain");
    expect(judul).not.toContain("Nama samaran");
    expect(csv).not.toContain("Komang Wira");
    const judulJawaban = (await ambilCsv("jawaban")).replace(/^\uFEFF/, "").split(/\r?\n/)[0];
    expect(judulJawaban).toContain("Nama pemain");
    expect(judulJawaban).not.toContain("Nama samaran");
    for (const x of [a, b, c, d]) x.k.ws.close();
  }, 90_000);
});

describe("penghapusan otomatis sesudah masa simpan (AC-21)", () => {
  it("ruang ditutup berumur 366 hari terhapus dengan log audit; berumur 364 hari tetap", async () => {
    const tua = await buatRuang({ labelKelas: "IX Tua" });
    const muda = await buatRuang({ labelKelas: "IX Muda" });
    for (const r of [tua, muda]) expect((await konsol("POST", `/api/ruang/${String(r.isi.ruangId)}/kelola`, { aksi: "tutup" })).status).toBe(200);
    const sekarang = Date.now();
    const hari = 86_400_000;
    d1(`UPDATE ruang SET status = 'ditutup', dibuat_pada = ${sekarang - 366 * hari} WHERE id = '${String(tua.isi.ruangId)}'`);
    d1(`UPDATE ruang SET status = 'ditutup', dibuat_pada = ${sekarang - 364 * hari} WHERE id = '${String(muda.isi.ruangId)}'`);
    const j = await fetch(`${alamat()}/api/uji/pembersihan`, { method: "POST", body: JSON.stringify({ sekarang }) });
    expect(j.status).toBe(200);
    expect(((await j.json()) as { dihapus: number }).dihapus).toBeGreaterThanOrEqual(1);
    expect(d1(`SELECT id FROM ruang WHERE id = '${String(tua.isi.ruangId)}'`)).toEqual([]);
    expect(d1(`SELECT id FROM ruang WHERE id = '${String(muda.isi.ruangId)}'`)).toHaveLength(1);
    const audit = d1<{ aksi: string; pengguna_id: string | null; rincian_json: string }>(
      `SELECT aksi, pengguna_id, rincian_json FROM log_audit WHERE sasaran = '${String(tua.isi.ruangId)}'`,
    );
    expect(audit).toHaveLength(1);
    expect(audit[0].aksi).toBe("ruang.hapus_otomatis");
    expect(audit[0].pengguna_id).toBeNull();
    expect(JSON.parse(audit[0].rincian_json)).toMatchObject({ labelKelas: "IX Tua", peserta: 0, jawaban: 0 });
  }, 60_000);
});
