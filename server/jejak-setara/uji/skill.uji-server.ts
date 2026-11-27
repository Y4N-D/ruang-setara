// Uji server skill dan kotak bantuan (spesifikasi JS-09, rencana uji "Uji server"; AC-3, AC-4, AC-5, AC-7, AC-9 sampai
// AC-12, AC-18, AC-19): Worker hasil build di vite preview dengan D1 lokal yang sudah disemai (port 4320). JS-18 (P-7;
// AC-2, AC-16): ruang tanpa isian skillAktif kini memakai kelima skill, dan Teropong serta Angkot sah di permintaan.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { kejadianTerdekat } from "../../../app/jejak-setara/inti/aturan";
import { posisiSah } from "../../../app/jejak-setara/inti/gerak";
import type { IsiKejadian, KotakJenis, SkillId } from "../../../app/jejak-setara/inti/tipe";
import { PROTOKOL_VERSI } from "../../../app/jejak-setara/inti/versi";
import { KOTAK_KAMPUNG, PETA_KAMPUNG } from "../src/ruang/peta-kampung";
import { alamat, buatRuang, d1, kelas, klien, konsol, sesiAdmin, statistikRuang, tidur, tungguSampai, type Klien } from "./bantuan";

const V = PROTOKOL_VERSI;
type Pesan = Record<string, unknown>;
const BANK = (JSON.parse(readFileSync(new URL("../seed/bank-awal.json", import.meta.url), "utf8")) as { kejadian: (IsiKejadian & { kode: string })[] }).kejadian;
const grid = { lebar: PETA_KAMPUNG.lebar, tinggi: PETA_KAMPUNG.tinggi, tabrakan: PETA_KAMPUNG.tabrakan };

interface Pemain {
  k: Klien;
  id: string;
  nama: string;
  token: string;
  seq: number;
  pos: { x: number; y: number };
}

async function gabung(kode: string): Promise<Pemain> {
  const k = await klien(kode);
  k.kirim({ v: V, t: "halo", peran: "pemain" });
  const datang = await k.tunggu((m) => m.t === "selamat_datang");
  const nama = (datang.saranNama as string[])[0];
  k.kirim({ v: V, t: "pilih_identitas", nama, avatar: 3 });
  await k.tunggu((m) => m.t === "pemain_baru" && m.id === datang.pemainId);
  return { k, id: String(datang.pemainId), nama, token: String(datang.token), seq: 0, pos: { x: 0, y: 0 } };
}

async function pindahkan(kode: string, p: Pemain, x: number, y: number): Promise<void> {
  p.k.masuk.length = 0;
  expect((await fetch(`${alamat()}/api/uji/ruang/${kode}/pindahkan`, { method: "POST", body: JSON.stringify({ nama: p.nama, x, y }) })).status).toBe(200);
  const koreksi = await p.k.tunggu((m) => m.t === "koreksi");
  p.seq = Math.max(p.seq, Number(koreksi.seq));
  p.pos = { x: x * 16 + 8, y: y * 16 + 12 };
}

function gerak(p: Pemain, x: number, y: number): void {
  p.seq++;
  p.k.kirim({ v: V, t: "gerak", x, y, arah: x >= p.pos.x ? "kanan" : "kiri", jalan: true, seq: p.seq });
  p.pos = { x, y };
}

/** Kotak berjenis itu yang ubin kiri dan kanannya bisa diinjak, dengan baris kaki yang bebas di antaranya. */
function kotakDatar(jenis: KotakJenis, kecuali: string[] = []) {
  const kt = KOTAK_KAMPUNG.find((k) => {
    if (k.jenis !== jenis || kecuali.includes(k.id)) return false;
    for (let x = k.x * 16 - 8; x <= k.x * 16 + 24; x++) if (!posisiSah(grid, x, k.y * 16 + 12)) return false;
    return true;
  });
  if (!kt) throw new Error(`tidak ada kotak ${jenis} di baris datar`);
  return kt;
}

/** Pindah ke ubin kiri kotak, lalu berjalan 32 piksel ke ubin kanannya, melewati pusat kotak. */
async function ambilKotak(kode: string, p: Pemain, jenis: KotakJenis, kecuali: string[] = []) {
  const kt = kotakDatar(jenis, kecuali);
  await pindahkan(kode, p, kt.x - 1, kt.y);
  await tidur(150);
  p.k.masuk.length = 0;
  gerak(p, kt.x * 16 + 24, kt.y * 16 + 12);
  return kt;
}

async function titikKejadian(kode: string): Promise<{ kejadianId: string; titik: { id?: string; x: number; y: number }[] }[]> {
  return ((await (await fetch(`${alamat()}/api/uji/ruang/${kode}/kejadian`)).json()) as { kejadian: { kejadianId: string; titik: { x: number; y: number }[] }[] }).kejadian;
}

async function periksa(kode: string, p: Pemain, kejadianId: string, t: { x: number; y: number }): Promise<Pesan> {
  await pindahkan(kode, p, t.x, t.y + 1);
  await p.k.tungguRiwayat((m) => m.t === "kejadian_terlihat" && m.kejadianId === kejadianId && m.x === t.x && m.y === t.y);
  p.k.masuk.length = 0;
  p.k.kirim({ v: V, t: "periksa", kejadianId });
  return p.k.tunggu((m) => m.t === "kejadian_terbuka" && m.kejadianId === kejadianId);
}

/** Id pilihan yang tampil untuk teks pilihan bank awal yang memenuhi syarat. */
function idOpsi(daftar: unknown, teks: string): string {
  return (daftar as { id: string; teks: string }[]).find((o) => o.teks === teks)?.id ?? "";
}

async function mulai(kode: string, pemain: Pemain[]) {
  expect(await kelas(kode, { v: V, t: "mulai" })).toBe(200);
  for (const p of pemain) await p.k.tunggu((m) => m.t === "status_ruang" && m.status === "main", 8000);
}

const pribadiTerakhir = (p: Pemain) => [...p.k.riwayat].reverse().find((m) => m.t === "pribadi") as Pesan;
const muatan = (m: Pesan) => m.muatan as Record<SkillId, number>;

describe("kotak, Lari cepat, Kompas, Petunjuk, dan +1 Kompas di ruang uji (AC-4, AC-7, AC-9 sampai AC-12)", () => {
  it("ketiga skill: ambil kotak, lari 6 detik tanpa koreksi, Kompas sampai tiba, Petunjuk, jawaban tepat, jeda, sambung ulang, dan D1", async () => {
    const { isi } = await buatRuang({ batasPemain: 40 });
    const kode = String(isi.kode);
    const a = await gabung(kode);
    const b = await gabung(kode);
    await mulai(kode, [a, b]);

    // Kotak sepatu: pribadi bermuatan Lari cepat 1, lalu pemberitahuan kotak_lari.
    const sepatu = await ambilKotak(kode, a, "sepatu");
    const pr1 = await a.k.tunggu((m) => m.t === "pribadi" && muatan(m).lari === 1);
    await a.k.tunggu((m) => m.t === "pemberitahuan" && m.kode === "kotak_lari");
    expect((pr1.kotakMenunggu as { id: string }[]).map((k) => k.id)).toEqual([sepatu.id]);
    // ambil_kotak diabaikan tanpa pelanggaran.
    const sebelum = Number((await statistikRuang(kode)).pelanggaran);
    a.k.kirim({ v: V, t: "ambil_kotak", kotakId: "k-z1-1" });
    await tidur(200);
    expect(Number((await statistikRuang(kode)).pelanggaran)).toBe(sebelum);

    // Lari cepat: 13 piksel per 100 ms (130 px/detik, di atas kecepatan jalan 90 px/detik) bolak-balik di baris kaki
    // kotak yang sudah diperiksa bebas, selama 5,5 detik, tanpa koreksi.
    a.k.masuk.length = 0;
    a.k.kirim({ v: V, t: "pakai_skill", skill: "lari" });
    const prLari = await a.k.tunggu((m) => m.t === "pribadi" && muatan(m).lari === 0);
    expect((prLari.aktifSampai as Record<string, number>).lari).toBeGreaterThan(Date.now() + 4000);
    const x0 = a.pos.x;
    const y0 = a.pos.y;
    const langkah = [0, 13, 26, 13];
    for (let i = 1; i <= 55; i++) {
      await tidur(100);
      gerak(a, x0 - langkah[i % 4], y0);
    }
    await tidur(300);
    expect(a.k.masuk.filter((m) => m.t === "koreksi")).toEqual([]);

    // Kotak kompas lalu Kompas: sasaran = titik aktif terdekat dari kait kejadian.
    await ambilKotak(kode, a, "kompas");
    await a.k.tunggu((m) => m.t === "pemberitahuan" && m.kode === "kotak_kompas");
    await tidur(2100); // jeda 2 detik tidak berlaku antarskill, tetapi beri jeda untuk pemeriksaan gerak
    const titik = await titikKejadian(kode);
    const kandidat = titik.flatMap((k) => k.titik.map((t) => ({ kode: k.kejadianId, selesai: false, x: t.x * 16 + 8, y: t.y * 16 + 8, ubin: t })));
    const harap = kejadianTerdekat(a.pos, kandidat);
    a.k.masuk.length = 0;
    a.k.kirim({ v: V, t: "pakai_skill", skill: "kompas" });
    const kompas = await a.k.tunggu((m) => m.t === "kompas");
    const sasaran = kandidat.find((c) => c.ubin.x === kompas.x && c.ubin.y === kompas.y);
    expect(sasaran?.x).toBe(harap?.x);
    expect(sasaran?.y).toBe(harap?.y);
    const prKompas = await a.k.tunggu((m) => m.t === "pribadi" && (m.aktifSampai as Record<string, number>).kompas !== undefined);
    expect((prKompas.aktifSampai as Record<string, number>).kompas).toBe(kompas.berakhirPada);
    // Dipindah ke dekat sasaran: pribadi tanpa aktifSampai.kompas di putaran berikutnya.
    await pindahkan(kode, a, Number(kompas.x), Number(kompas.y) + 1);
    await a.k.tunggu((m) => m.t === "pribadi" && (m.aktifSampai as Record<string, number>).kompas === undefined, 3000);

    // Kotak buku dan Petunjuk di kejadian yang belum dijawab.
    await ambilKotak(kode, a, "buku");
    await a.k.tunggu((m) => m.t === "pemberitahuan" && m.kode === "kotak_petunjuk");
    const kj = titik.find((k) => k.kejadianId !== sasaran?.kode) ?? titik[0];
    const isiBank = BANK.find((x) => x.kode === kj.kejadianId)!;
    const buka = await periksa(kode, a, kj.kejadianId, kj.titik[0]);
    a.k.kirim({ v: V, t: "pakai_skill", skill: "petunjuk", kejadianId: kj.kejadianId });
    const pet = await a.k.tunggu((m) => m.t === "petunjuk");
    expect(pet.kalimat).toBe(isiBank.langkah1.petunjuk);
    const teksDicoret = (buka.opsi1 as { id: string; teks: string }[]).find((o) => o.id === pet.opsiDicoret)?.teks;
    expect(isiBank.langkah1.opsi.find((o) => o.teks === teksDicoret)?.benar).toBe(false);
    const prPet = await a.k.tunggu((m) => m.t === "pribadi" && muatan(m).petunjuk === 0);
    // Ditutup dan dibuka lagi: petunjuk yang sama tanpa muatan berkurang.
    a.k.kirim({ v: V, t: "tutup_dialog", kejadianId: kj.kejadianId });
    await tidur(200);
    a.k.masuk.length = 0;
    a.k.kirim({ v: V, t: "periksa", kejadianId: kj.kejadianId });
    await a.k.tunggu((m) => m.t === "kejadian_terbuka");
    expect(await a.k.tunggu((m) => m.t === "petunjuk")).toEqual(pet);
    expect(muatan(pribadiTerakhir(a)).petunjuk).toBe(muatan(prPet).petunjuk);
    // Langkah 1 dan 2 tepat: +1 Kompas.
    const kompasSebelum = muatan(pribadiTerakhir(a)).kompas;
    a.k.kirim({ v: V, t: "kunci_1", kejadianId: kj.kejadianId, opsiId: idOpsi(buka.opsi1, isiBank.langkah1.opsi.find((o) => o.benar)!.teks) });
    const h1 = await a.k.tunggu((m) => m.t === "hasil_1");
    expect(h1.benar).toBe(true);
    a.k.masuk.length = 0;
    a.k.kirim({ v: V, t: "kunci_2", kejadianId: kj.kejadianId, opsiId: idOpsi(h1.opsi2, isiBank.langkah2.opsi.find((o) => o.tingkat === "tepat")!.teks) });
    await a.k.tunggu((m) => m.t === "hasil_2" && m.tingkat === "tepat");
    await a.k.tunggu((m) => m.t === "pemberitahuan" && m.kode === "kompas_tepat");
    await a.k.tunggu((m) => m.t === "pribadi" && muatan(m).kompas === kompasSebelum + 1);
    const urutan = a.k.masuk.map((m) => String(m.t)).filter((x) => ["hasil_2", "pemberitahuan", "pribadi"].includes(x));
    expect(urutan.slice(urutan.indexOf("hasil_2"), urutan.indexOf("hasil_2") + 3)).toEqual(["hasil_2", "pemberitahuan", "pribadi"]);
    a.k.kirim({ v: V, t: "tutup_dialog", kejadianId: kj.kejadianId });

    // B menjawab satu kejadian tanpa Petunjuk.
    const kjB = titik.find((k) => k.kejadianId !== kj.kejadianId)!;
    const bukaB = await periksa(kode, b, kjB.kejadianId, kjB.titik[0]);
    b.k.kirim({ v: V, t: "kunci_1", kejadianId: kjB.kejadianId, opsiId: (bukaB.opsi1 as { id: string }[])[0].id });
    await b.k.tunggu((m) => m.t === "hasil_1");

    // Kompas lagi (muatan dari jawaban tepat), lalu jeda 3 detik: berakhirPada bergeser sekitar 3 detik.
    await tidur(2100);
    await pindahkan(kode, a, sepatu.x - 1, sepatu.y);
    a.k.masuk.length = 0;
    a.k.kirim({ v: V, t: "pakai_skill", skill: "kompas" });
    const kompas2 = await a.k.tunggu((m) => m.t === "kompas");
    await a.k.tunggu((m) => m.t === "pribadi" && (m.aktifSampai as Record<string, number>).kompas !== undefined);
    // Kait kelas mengirim pesan lalu menunggu 250–500 ms; jeda diukur dari saat pesan jeda dikirim.
    const mulaiJeda = Date.now();
    expect(await kelas(kode, { v: V, t: "jeda" })).toBe(200);
    await tidur(Math.max(0, mulaiJeda + 3000 - Date.now()));
    a.k.masuk.length = 0;
    expect(await kelas(kode, { v: V, t: "lanjut" })).toBe(200);
    const prLanjut = await a.k.tunggu((m) => m.t === "pribadi" && (m.aktifSampai as Record<string, number>).kompas !== undefined);
    const geser = Number((prLanjut.aktifSampai as Record<string, number>).kompas) - Number(kompas2.berakhirPada);
    expect(Math.abs(geser - 3000)).toBeLessThanOrEqual(100);

    // Sambung ulang dengan token: muatan, aktifSampai, dan kotakMenunggu sama, lalu kompas tiba lagi.
    const terakhir = pribadiTerakhir(a);
    expect((await fetch(`${alamat()}/api/uji/ruang/${kode}/putuskan`, { method: "POST" })).status).toBe(200);
    const a2 = await klien(kode);
    a2.kirim({ v: V, t: "halo", peran: "pemain", token: a.token });
    const prUlang = await a2.tunggu((m) => m.t === "pribadi");
    expect({ muatan: prUlang.muatan, aktifSampai: prUlang.aktifSampai, kotakMenunggu: prUlang.kotakMenunggu }).toEqual({
      muatan: terakhir.muatan,
      aktifSampai: terakhir.aktifSampai,
      kotakMenunggu: terakhir.kotakMenunggu,
    });
    const kompasUlang = await a2.tunggu((m) => m.t === "kompas");
    expect(a2.riwayat.findIndex((m) => m.t === "kompas")).toBeGreaterThan(a2.riwayat.findIndex((m) => m.t === "pribadi"));
    expect(kompasUlang.berakhirPada).toBe((prUlang.aktifSampai as Record<string, number>).kompas);

    // Akhiri ronde: D1 menandai jawaban A yang memakai Petunjuk.
    const bUlang = await klien(kode);
    bUlang.kirim({ v: V, t: "halo", peran: "pemain", token: b.token });
    await bUlang.tunggu((m) => m.t === "pribadi");
    expect(await kelas(kode, { v: V, t: "akhiri" })).toBe(200);
    const jawaban = await tungguSampai(
      () => d1<{ id: string; petunjuk_dipakai: number }>(`SELECT id, petunjuk_dipakai FROM jawaban WHERE ruang_id = '${String(isi.ruangId)}' ORDER BY id`),
      (baris) => baris.length === 2,
    );
    expect(jawaban).toEqual(
      expect.arrayContaining([
        { id: `${a.id}:${kj.kejadianId}`, petunjuk_dipakai: 1 },
        { id: `${b.id}:${kjB.kejadianId}`, petunjuk_dipakai: 0 },
      ]),
    );

    // Detail dan hasil membawa skillAktif (JS-18: kelima skill bawaan); CSV jawaban berkolom 18 dengan "Petunjuk dipakai".
    const id = String(isi.ruangId);
    await tungguSampai(
      async () => (await konsol("GET", `/api/ruang/${id}/hasil`)).status,
      (s) => s === 200,
    );
    expect(((await konsol("GET", `/api/ruang/${id}`)).isi.ruang as Pesan).skillAktif).toEqual(["lari", "kompas", "petunjuk", "teropong", "angkot"]);
    const hasil = await konsol("GET", `/api/ruang/${id}/hasil`);
    expect((hasil.isi.ruang as Pesan).skillAktif).toEqual(["lari", "kompas", "petunjuk", "teropong", "angkot"]);
    const rincian = await konsol("GET", `/api/ruang/${id}/hasil/${a.id}`);
    expect((rincian.isi.jawaban as { kode: string; petunjukDipakai: boolean }[]).find((j) => j.kode === kj.kejadianId)?.petunjukDipakai).toBe(true);
    const csv = await fetch(`${alamat()}/api/ruang/${id}/ekspor?jenis=jawaban`, { headers: { Cookie: await sesiAdmin(), "CF-Connecting-IP": "10.9.70.9" } });
    expect(csv.status).toBe(200);
    const baris = new TextDecoder("utf-8", { ignoreBOM: true }).decode(await csv.arrayBuffer()).slice(1).split("\r\n").filter(Boolean);
    expect(baris[0].split(";")).toHaveLength(18);
    expect(baris[0].split(";")[17]).toBe("Petunjuk dipakai");
    // Baris dicari lewat kolom yang sama persis dengan nama: "Kancil Merah" juga terkandung di "Kancil Merah Muda".
    const barisA = baris.find((x) => x.split(";").includes(a.nama));
    expect(barisA?.split(";")[17]).toBe("Ya");
    expect(baris.find((x) => x.split(";").includes(b.nama))?.split(";")[17]).toBe("Tidak");
    a2.ws.close();
    bUlang.ws.close();
    b.k.ws.close();
  }, 120_000);
});

describe("ruang tanpa skill dan ruang tanpa Petunjuk (AC-19)", () => {
  it("tanpa skill: kotak dan pakai_skill tidak mengubah pribadi, jawaban tepat tanpa +1 Kompas", async () => {
    const { isi } = await buatRuang({ skillAktif: [] });
    const kode = String(isi.kode);
    const a = await gabung(kode);
    await mulai(kode, [a]);
    await a.k.tunggu((m) => m.t === "pribadi");
    await ambilKotak(kode, a, "sepatu");
    await tidur(400);
    expect(a.k.masuk.filter((m) => m.t === "pribadi" || m.t === "pemberitahuan")).toEqual([]);
    a.k.kirim({ v: V, t: "pakai_skill", skill: "lari" });
    await tidur(300);
    expect(a.k.masuk.filter((m) => m.t === "pribadi")).toEqual([]);
    const [kj] = await titikKejadian(kode);
    const isiBank = BANK.find((x) => x.kode === kj.kejadianId)!;
    const buka = await periksa(kode, a, kj.kejadianId, kj.titik[0]);
    a.k.kirim({ v: V, t: "kunci_1", kejadianId: kj.kejadianId, opsiId: idOpsi(buka.opsi1, isiBank.langkah1.opsi.find((o) => o.benar)!.teks) });
    const h1 = await a.k.tunggu((m) => m.t === "hasil_1");
    a.k.masuk.length = 0;
    a.k.kirim({ v: V, t: "kunci_2", kejadianId: kj.kejadianId, opsiId: idOpsi(h1.opsi2, isiBank.langkah2.opsi.find((o) => o.tingkat === "tepat")!.teks) });
    const pr = await a.k.tunggu((m) => m.t === "pribadi");
    expect(pr).toMatchObject({ muatan: { lari: 0, kompas: 0, petunjuk: 0, teropong: 0, angkot: 0 }, aktifSampai: {}, kotakMenunggu: [] });
    expect(a.k.masuk.some((m) => m.t === "pemberitahuan")).toBe(false);
    a.k.ws.close();
  });

  it("tanpa Petunjuk: kotak buku tidak terambil dan Petunjuk diabaikan; kotak sepatu tetap terambil", async () => {
    const { isi } = await buatRuang({ skillAktif: ["lari", "kompas"] });
    const kode = String(isi.kode);
    const a = await gabung(kode);
    await mulai(kode, [a]);
    await a.k.tunggu((m) => m.t === "pribadi");
    await ambilKotak(kode, a, "buku");
    await tidur(400);
    expect(a.k.masuk.filter((m) => m.t === "pribadi" || m.t === "pemberitahuan")).toEqual([]);
    await ambilKotak(kode, a, "sepatu");
    await a.k.tunggu((m) => m.t === "pemberitahuan" && m.kode === "kotak_lari");
    a.k.ws.close();
  });
});

describe("API ruang dengan skillAktif (P-8, P-9; AC-3, AC-18; JS-18 P-7, AC-2)", () => {
  it("skillAktif tidak sah dijawab 400 ISI_SALAH tanpa membuat ruang; urutan disimpan menurut P-1", async () => {
    for (const salah of [["lompat"], ["lari", "lari"], ["teropong", "teropong"], "lari", ["lari", "kompas", "petunjuk", "teropong", "angkot", "lari"], [1]]) {
      const j = await buatRuang({ skillAktif: salah, labelKelas: "Skill salah" });
      expect(j.status).toBe(400);
      expect((j.isi.galat as Pesan).kode).toBe("ISI_SALAH");
    }
    expect(d1<{ n: number }>("SELECT COUNT(*) AS n FROM ruang WHERE label_kelas = 'Skill salah'")[0].n).toBe(0);
    const { isi } = await buatRuang({ skillAktif: ["petunjuk", "lari"] });
    expect((isi.ruang as Pesan).skillAktif).toEqual(["lari", "petunjuk"]);
    const [baris] = d1<{ pengaturan_json: string }>(`SELECT pengaturan_json FROM ruang WHERE id = '${String(isi.ruangId)}'`);
    expect((JSON.parse(baris.pengaturan_json) as Pesan).skillAktif).toEqual(["lari", "petunjuk"]);
    const tanpa = await buatRuang({});
    expect((tanpa.isi.ruang as Pesan).skillAktif).toEqual(["lari", "kompas", "petunjuk", "teropong", "angkot"]);
    // JS-18: Teropong dan Angkot sah, disimpan menurut urutan P-1.
    const dua = await buatRuang({ skillAktif: ["angkot", "teropong"] });
    expect(dua.status).toBe(201);
    expect((dua.isi.ruang as Pesan).skillAktif).toEqual(["teropong", "angkot"]);
  });
});
