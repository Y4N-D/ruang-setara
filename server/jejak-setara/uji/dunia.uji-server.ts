// Uji server JS-07 lewat HTTP dan WebSocket sungguhan (spesifikasi JS-07, AC-16 sampai AC-18): peta kampung, posisi
// awal lewat `koreksi`, gerak di halaman lobi dengan gerbang tertutup, `dunia` di lobi tanpa putaran, dan kait kendali.
import { describe, expect, it } from "vitest";
import { posisiSah } from "../../../app/jejak-setara/inti/gerak";
import { bacaPeta, tutupGerbang, versiPeta } from "../../../app/jejak-setara/inti/peta";
import kampung from "../../../app/jejak-setara/peta/kampung.json";
import { PETA_KAMPUNG } from "../src/ruang/peta-kampung";
import { buatRuang, kelasJson, klien, statistikRuang, tidur, type Klien } from "./bantuan";

const halo = (opsi: Record<string, unknown> = {}) => ({ v: 1, t: "halo", peran: "pemain", ...opsi });
type Grid = { lebar: number; tinggi: number; tabrakan: Uint8Array };
const LOBI: Grid = { lebar: PETA_KAMPUNG.lebar, tinggi: PETA_KAMPUNG.tinggi, tabrakan: PETA_KAMPUNG.tabrakanLobi };
const KAMPUNG: Grid = { lebar: PETA_KAMPUNG.lebar, tinggi: PETA_KAMPUNG.tinggi, tabrakan: PETA_KAMPUNG.tabrakan };

async function masuk(kode: string, avatar = 0) {
  const k = await klien(kode);
  k.kirim(halo());
  const datang = (await k.tunggu((m) => m.t === "selamat_datang")) as { pemainId: string; token: string; saranNama: string[]; versiPeta: number };
  k.kirim({ v: 1, t: "pilih_identitas", nama: datang.saranNama[0], avatar });
  const awal = (await k.tunggu((m) => m.t === "koreksi")) as { x: number; y: number; seq: number };
  return { k, ...datang, awal };
}

/** Jalur ubin terpendek (4 tetangga) di grid, dari ubin `a` ke ubin `b`, atau null. */
function jalurUbin(g: Grid, a: [number, number], b: [number, number]): [number, number][] | null {
  const asal = new Int32Array(g.lebar * g.tinggi).fill(-1);
  const antre = [a[1] * g.lebar + a[0]];
  asal[antre[0]] = antre[0];
  for (let i = 0; i < antre.length; i++) {
    const s = antre[i];
    if (s === b[1] * g.lebar + b[0]) {
      const hasil: [number, number][] = [];
      for (let t = s; ; t = asal[t]) {
        hasil.unshift([t % g.lebar, Math.floor(t / g.lebar)]);
        if (t === asal[t]) break;
      }
      return hasil;
    }
    const x = s % g.lebar;
    const y = Math.floor(s / g.lebar);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= g.lebar || ny >= g.tinggi) continue;
      const n = ny * g.lebar + nx;
      if (asal[n] >= 0 || g.tabrakan[n]) continue;
      asal[n] = s;
      antre.push(n);
    }
  }
  return null;
}

const pusat = ([x, y]: [number, number]) => ({ x: x * 16 + 8, y: y * 16 + 12 });

/** Titik setiap 7,2 piksel (72 px/detik × 100 ms) di sepanjang jalur ubin. */
function langkahJalur(jalur: [number, number][]): { x: number; y: number }[] {
  const hasil: { x: number; y: number }[] = [];
  for (let i = 1; i < jalur.length; i++) {
    const a = pusat(jalur[i - 1]);
    const b = pusat(jalur[i]);
    const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 7.2);
    for (let j = 1; j <= n; j++) hasil.push({ x: Math.round((a.x + ((b.x - a.x) * j) / n) * 10) / 10, y: Math.round((a.y + ((b.y - a.y) * j) / n) * 10) / 10 });
  }
  return hasil;
}

/** Mengirim laporan gerak jujur setiap 100 ms; berhenti di koreksi pertama bila `henti`. */
async function jalan(k: Klien, titik: { x: number; y: number }[], seqAwal: number, henti = true): Promise<{ seq: number; koreksi: Record<string, unknown> | null }> {
  let seq = seqAwal;
  const sebelum = k.masuk.length;
  for (const p of titik) {
    seq++;
    k.kirim({ v: 1, t: "gerak", x: p.x, y: p.y, arah: "bawah", jalan: true, seq });
    await tidur(100);
    const kor = k.masuk.slice(sebelum).find((m) => m.t === "koreksi");
    if (kor && henti) return { seq, koreksi: kor };
  }
  await tidur(200);
  return { seq, koreksi: k.masuk.slice(sebelum).find((m) => m.t === "koreksi") ?? null };
}

describe("peta kampung di server (P-46, P-50; AC-16)", () => {
  it("bacaPeta lulus atas kampung.json, dan peta-kampung.ts sama dengan hasil bacaPeta; grid lobi menutup gerbang", () => {
    const peta = bacaPeta(kampung);
    expect(PETA_KAMPUNG.tabrakan).toEqual(peta.tabrakan);
    expect(PETA_KAMPUNG.tabrakanLobi).toEqual(tutupGerbang(peta));
    expect(PETA_KAMPUNG.titikMuncul).toEqual(peta.titikMuncul);
    expect(PETA_KAMPUNG.versi).toBe(versiPeta(kampung));
  });

  it("ruang baru: selamat_datang membawa versi peta kampung, dan posisi awal di titik muncul pertama dengan seq 0", async () => {
    const { isi } = await buatRuang();
    const a = await masuk(String(isi.kode));
    expect(a.versiPeta).toBe(PETA_KAMPUNG.versi);
    expect(a.awal).toMatchObject({ x: kampung.titikMuncul[0].x * 16 + 8, y: kampung.titikMuncul[0].y * 16 + 12, seq: 0 });
  });
});

describe("gerak dan dunia di lobi (P-45, P-47 sampai P-49; AC-11, AC-16, AC-17)", () => {
  it("pemain kedua langsung menerima kerangka penuh, dan yang pertama melihatnya tanpa bergerak lebih dulu", async () => {
    const { isi } = await buatRuang();
    const kode = String(isi.kode);
    const a = await masuk(kode);
    const b = await masuk(kode, 2);
    const kerangka = (await b.k.tunggu((m) => m.t === "dunia")) as { p: [string, number, number, string, boolean][] };
    expect(kerangka.p.map((x) => x[0])).toContain(a.pemainId);
    const dilihatA = (await a.k.tunggu((m) => m.t === "dunia" && (m.p as unknown[][]).some((x) => x[0] === b.pemainId))) as { p: unknown[][] };
    expect(dilihatA.p.find((x) => x[0] === b.pemainId)?.slice(1, 3)).toEqual([b.awal.x, b.awal.y]);
  });

  it("gerak di lobi tertahan gerbang (koreksi), lalu lolos sesudah ronde dimulai; pemain lain melihatnya keluar", async () => {
    const { isi } = await buatRuang();
    const kode = String(isi.kode);
    const a = await masuk(kode);
    const b = await masuk(kode, 3);
    const awal: [number, number] = [Math.floor(a.awal.x / 16), Math.floor(a.awal.y / 16)];
    const gb = kampung.gerbangLobi;
    const luar: [number, number] = [gb.kiri, gb.bawah + 2];
    expect(jalurUbin(LOBI, awal, luar)).toBeNull();
    const jalur = jalurUbin(KAMPUNG, awal, luar);
    expect(jalur).not.toBeNull();
    const titik = langkahJalur(jalur as [number, number][]);
    const lobi = await jalan(a.k, titik, a.awal.seq);
    expect(lobi.koreksi).not.toBeNull();
    const kor = lobi.koreksi as { x: number; y: number; seq: number };
    expect(posisiSah(LOBI, kor.x, kor.y)).toBe(true);
    expect(kor.y).toBeLessThanOrEqual(gb.atas * 16);
    expect((await kelasJson(kode, { v: 1, t: "mulai" })).isi).toEqual({ ok: true, status: "hitung_mundur" });
    await a.k.tunggu((m) => m.t === "status_ruang" && m.status === "main", 6000);
    const iKoreksi = titik.findIndex((p) => p.x === kor.x && p.y === kor.y);
    expect(iKoreksi).toBeGreaterThanOrEqual(0);
    const sisa = titik.slice(iKoreksi + 1);
    const main = await jalan(a.k, sisa, lobi.seq, false);
    expect(main.koreksi).toBeNull();
    // Posisi terakhir yang diterima server (di luar gerbang) kembali lewat koreksi saat tersambung ulang (P-49).
    const akhir = sisa[sisa.length - 1];
    a.k.ws.close();
    await tidur(300);
    const ulang = await klien(kode);
    ulang.kirim(halo({ token: a.token }));
    expect(await ulang.tunggu((m) => m.t === "koreksi")).toMatchObject({ x: akhir.x, y: akhir.y, seq: main.seq });
    expect(akhir.y).toBeGreaterThan(gb.bawah * 16 + 16);
    expect(b.pemainId).not.toBe(a.pemainId);
  }, 30_000);

  it("tanpa gerak di lobi tidak ada kiriman dunia dan tidak ada pengatur waktu putaran", async () => {
    const { isi } = await buatRuang();
    const kode = String(isi.kode);
    const a = await masuk(kode);
    const b = await masuk(kode, 4);
    await tidur(300);
    const awal = await statistikRuang(kode);
    expect(awal.pewaktuPutaran).toBe(false);
    const jumlahDunia = b.k.masuk.filter((m) => m.t === "dunia").length;
    await tidur(2000);
    expect((await statistikRuang(kode)).duniaLobi).toBe(awal.duniaLobi);
    expect(b.k.masuk.filter((m) => m.t === "dunia").length).toBe(jumlahDunia);
    a.k.kirim({ v: 1, t: "gerak", x: a.awal.x + 5, y: a.awal.y, arah: "kanan", jalan: false, seq: 1 });
    await b.k.tunggu((m) => m.t === "dunia" && (m.p as unknown[][]).some((x) => x[0] === a.pemainId && x[1] === a.awal.x + 5));
    const sesudah = await statistikRuang(kode);
    expect(Number(sesudah.duniaLobi)).toBeGreaterThan(Number(awal.duniaLobi));
    expect(sesudah.pewaktuPutaran).toBe(false);
  });

  it("sambung ulang: kembali di posisi terakhir (bukan titik muncul) lewat koreksi", async () => {
    const { isi } = await buatRuang();
    const kode = String(isi.kode);
    const a = await masuk(kode);
    await tidur(300); // anggaran jarak terkumpul sejak posisi awal (P-52)
    a.k.kirim({ v: 1, t: "gerak", x: a.awal.x + 6, y: a.awal.y, arah: "kanan", jalan: false, seq: 1 });
    await tidur(300);
    a.k.ws.close();
    await tidur(300);
    const ulang = await klien(kode);
    ulang.kirim(halo({ token: a.token }));
    expect(await ulang.tunggu((m) => m.t === "koreksi")).toMatchObject({ x: a.awal.x + 6, y: a.awal.y, seq: 1 });
  });
});

describe("kait kendali ruang coba (P-53, P-54; AC-18)", () => {
  it("keenam aksi menjawab 200 dengan status ruang sesudahnya; pesan yang tidak berlaku tidak mengubah apa pun", async () => {
    const { isi } = await buatRuang({ durasiMenit: 10 });
    const kode = String(isi.kode);
    const aksi = async (pesan: Record<string, unknown>) => kelasJson(kode, { v: 1, ...pesan });
    expect(await aksi({ t: "jeda" })).toEqual({ status: 200, isi: { ok: true, status: "lobi" } });
    expect(await aksi({ t: "mulai" })).toEqual({ status: 200, isi: { ok: true, status: "hitung_mundur" } });
    expect((await aksi({ t: "lanjut" })).isi.status).toBe("hitung_mundur");
    await tidur(3300);
    expect((await aksi({ t: "jeda" })).isi.status).toBe("jeda");
    expect((await aksi({ t: "lanjut" })).isi.status).toBe("main");
    expect((await aksi({ t: "tambah_waktu", detik: 60 })).isi.status).toBe("main");
    expect((await aksi({ t: "tutup_ruang" })).isi.status).toBe("main");
    expect((await aksi({ t: "akhiri" })).isi.status).toBe("selesai");
    expect((await aksi({ t: "tutup_ruang" })).isi.status).toBe("ditutup");
    expect((await aksi({ t: "mulai" })).status).toBe(404);
  }, 20_000);
});
