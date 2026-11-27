// Modul skill server ruang (spesifikasi JS-09, P-6, P-11 sampai P-16, P-19, P-24, P-25, P-28, P-32; AC-2, AC-4,
// AC-6, AC-7). Murni: semua waktu diberikan uji dalam waktu ronde. JS-18 (AC-3, AC-4, AC-5, AC-8): 31 kotak (C-19),
// kotak teropong dan karcis, isi `pribadi` kelima skill, Teropong, dan syarat Angkot.
import { describe, expect, it } from "vitest";
import { KOTAK, SKILL } from "../../inti/aturan";
import type { IsiKejadian, SkillId } from "../../inti/tipe";
import {
  akhiriKompas,
  ambilKotak,
  bolehPakai,
  isiPribadiSkill,
  keJamServer,
  KOTAK_MENUNGGU_MAKS,
  kompasAktif,
  pakai,
  pakaiAngkot,
  pilihCoretan,
  pilihSasaran,
  skillBaru,
  skillDariJson,
  skillKeJson,
  tambahKompas,
  teropongAktif,
  type KotakPeta,
  type SkillPemain,
} from "../../../../server/jejak-setara/src/ruang/skill-ruang";
import { HALTE_KAMPUNG, KOTAK_KAMPUNG, PETA_KAMPUNG } from "../../../../server/jejak-setara/src/ruang/peta-kampung";
import { MASUK } from "../ruang/bankUji";

const SEMUA: SkillId[] = ["lari", "kompas", "petunjuk"];
const LIMA: SkillId[] = ["lari", "kompas", "petunjuk", "teropong", "angkot"];
const pusat = (k: { x: number; y: number }) => ({ x: k.x * 16 + 8, y: k.y * 16 + 8 });
const SEPATU: KotakPeta = { id: "k-a", jenis: "sepatu", x: 10, y: 10 };
const BUKU: KotakPeta = { id: "k-b", jenis: "buku", x: 11, y: 10 };
const KOMPAS: KotakPeta = { id: "k-c", jenis: "kompas", x: 30, y: 10 };

function denganMuatan(m: Partial<Record<SkillId, number>>): SkillPemain {
  const s = skillBaru();
  Object.assign(s.keadaan.muatan, m);
  return s;
}

describe("kotak dari ruas gerak (P-16)", () => {
  const c = pusat(SEPATU);
  const dari = { x: c.x - 20, y: c.y + 4 };
  const ke = { x: c.x + 20, y: c.y + 4 };

  it("ruas yang lewat 12 px dari pusat ubin mengambil kotak: muatan +1 dan waktu ambil tercatat; keadaan asal tidak berubah", () => {
    const s = skillBaru();
    const hasil = ambilKotak(s, dari, ke, [SEPATU], SEMUA, 5000);
    expect(hasil.diambil.map((k) => k.id)).toEqual(["k-a"]);
    expect(hasil.s.keadaan.muatan.lari).toBe(1);
    expect(hasil.s.kotak).toEqual({ "k-a": 5000 });
    expect(s.keadaan.muatan.lari).toBe(0);
    expect(s.kotak).toEqual({});
    // Tepat 12 px: terambil; 12,01 px: tidak.
    expect(ambilKotak(s, { x: c.x - 20, y: c.y + 12 }, { x: c.x + 20, y: c.y + 12 }, [SEPATU], SEMUA, 0).diambil).toHaveLength(1);
    expect(ambilKotak(s, { x: c.x - 20, y: c.y + 12.01 }, { x: c.x + 20, y: c.y + 12.01 }, [SEPATU], SEMUA, 0).diambil).toHaveLength(0);
  });

  it("kotak belum siap 90 detik sesudah diambil, lalu siap lagi", () => {
    const s = ambilKotak(skillBaru(), dari, ke, [SEPATU], SEMUA, 1000).s;
    s.keadaan.muatan.lari = 0;
    expect(ambilKotak(s, dari, ke, [SEPATU], SEMUA, 1000 + KOTAK.munculLagiMs - 1).diambil).toHaveLength(0);
    const lagi = ambilKotak(s, dari, ke, [SEPATU], SEMUA, 1000 + KOTAK.munculLagiMs);
    expect(lagi.diambil).toHaveLength(1);
    expect(lagi.s.kotak["k-a"]).toBe(1000 + KOTAK.munculLagiMs);
  });

  it("skill isi kotak yang dimatikan di ruang: tidak terambil", () => {
    expect(ambilKotak(skillBaru(), dari, ke, [SEPATU], ["kompas", "petunjuk"], 0).diambil).toEqual([]);
    expect(ambilKotak(skillBaru(), dari, ke, [SEPATU], [], 0).diambil).toEqual([]);
  });

  it("muatan penuh: kotak tidak terambil, tetap siap, dan keadaan yang sama dikembalikan", () => {
    const s = denganMuatan({ lari: SKILL.lari.muatanMaks });
    const hasil = ambilKotak(s, dari, ke, [SEPATU], SEMUA, 0);
    expect(hasil.diambil).toEqual([]);
    expect(hasil.s).toBe(s);
    expect(s.kotak).toEqual({});
  });

  it("dua kotak dalam satu ruas: keduanya terambil menurut urutan daftar (id)", () => {
    const b = pusat(BUKU);
    const hasil = ambilKotak(skillBaru(), { x: c.x - 10, y: c.y }, { x: b.x + 10, y: b.y }, [SEPATU, BUKU], SEMUA, 700);
    expect(hasil.diambil.map((k) => k.jenis)).toEqual(["sepatu", "buku"]);
    expect(hasil.s.keadaan.muatan).toMatchObject({ lari: 1, petunjuk: 1, kompas: 0 });
    expect(hasil.s.kotak).toEqual({ "k-a": 700, "k-b": 700 });
  });

  it("kotak teropong dan karcis tidak terambil di ruang tanpa Teropong dan Angkot (JS-18 P-9), dan ruas jauh tidak mengambil apa pun", () => {
    const teropong: KotakPeta = { id: "k-t", jenis: "teropong", x: 10, y: 10 };
    const karcis: KotakPeta = { id: "k-u", jenis: "karcis", x: 10, y: 10 };
    expect(ambilKotak(skillBaru(), dari, ke, [teropong, karcis], SEMUA, 0).diambil).toEqual([]);
    expect(ambilKotak(skillBaru(), { x: 0, y: 0 }, { x: 10, y: 0 }, [SEPATU, BUKU, KOMPAS], SEMUA, 0).diambil).toEqual([]);
  });

  it("JS-18 (P-11): kotak teropong menambah Teropong dan kotak karcis menambah Angkot sampai 1; muatan penuh tidak mengambil", () => {
    const teropong: KotakPeta = { id: "k-t", jenis: "teropong", x: 10, y: 10 };
    const karcis: KotakPeta = { id: "k-u", jenis: "karcis", x: 10, y: 10 };
    const hasil = ambilKotak(skillBaru(), dari, ke, [teropong, karcis], LIMA, 3000);
    expect(hasil.diambil.map((k) => k.id)).toEqual(["k-t", "k-u"]);
    expect(hasil.s.keadaan.muatan).toMatchObject({ teropong: 1, angkot: 1 });
    expect(hasil.s.kotak).toEqual({ "k-t": 3000, "k-u": 3000 });
    const penuh = denganMuatan({ teropong: SKILL.teropong.muatanMaks, angkot: SKILL.angkot.muatanMaks });
    const tolak = ambilKotak(penuh, dari, ke, [teropong, karcis], LIMA, 0);
    expect(tolak.diambil).toEqual([]);
    expect(tolak.s).toBe(penuh);
    // Hanya Angkot yang aktif: kotak teropong tidak terambil.
    expect(ambilKotak(skillBaru(), dari, ke, [teropong, karcis], ["angkot"], 0).diambil.map((k) => k.id)).toEqual(["k-u"]);
  });

  it("kampung.json (C-19): 31 kotak urut menurut id (9 sepatu, 6 kompas, 9 buku, 3 teropong, 4 karcis) dan sama dengan PETA_KAMPUNG.kotak", () => {
    expect(KOTAK_KAMPUNG).toHaveLength(31);
    expect(PETA_KAMPUNG.kotak).toBe(KOTAK_KAMPUNG);
    expect(KOTAK_MENUNGGU_MAKS).toBe(KOTAK_KAMPUNG.length);
    const id = KOTAK_KAMPUNG.map((k) => k.id);
    expect(id).toEqual([...id].sort());
    const jumlah = (j: string) => KOTAK_KAMPUNG.filter((k) => k.jenis === j).length;
    expect([jumlah("sepatu"), jumlah("kompas"), jumlah("buku"), jumlah("teropong"), jumlah("karcis")]).toEqual([9, 6, 9, 3, 4]);
    const baru = KOTAK_KAMPUNG.filter((k) => k.jenis === "teropong" || k.jenis === "karcis").map((k) => [k.id, k.jenis, k.x, k.y]);
    expect(baru).toEqual([
      ["k-z3-4", "karcis", 57, 64],
      ["k-z3-5", "karcis", 86, 88],
      ["k-z6-4", "teropong", 26, 7],
      ["k-z6-5", "teropong", 51, 7],
      ["k-z6-6", "teropong", 76, 7],
      ["k-z7-4", "karcis", 107, 25],
      ["k-z8-4", "karcis", 116, 75],
    ]);
  });

  it("JS-18 (P-2, P-22): empat halte kampung.json menurut urutan nomor, dan PETA_KAMPUNG memakainya", () => {
    expect(HALTE_KAMPUNG.map((h) => [h.id, h.x, h.y])).toEqual([
      ["halte-1", 55, 64],
      ["halte-2", 84, 88],
      ["halte-3", 105, 25],
      ["halte-4", 116, 73],
    ]);
    expect(PETA_KAMPUNG.halte).toBe(HALTE_KAMPUNG);
  });
});

describe("memakai skill (P-19, P-24, P-28; D-1a)", () => {
  it("Lari cepat: muatan −1, waktu pakai, aktif 6 detik; tidak bisa dipakai lagi selama aktif", () => {
    const s = denganMuatan({ lari: 2 });
    const baru = pakai(s, "lari", 10_000, SEMUA, null);
    expect(baru?.keadaan.muatan.lari).toBe(1);
    expect(baru?.keadaan.aktifSampaiMs.lari).toBe(16_000);
    expect(baru?.keadaan.terakhirPakaiMs.lari).toBe(10_000);
    expect(s.keadaan.muatan.lari).toBe(2);
    expect(pakai(baru!, "lari", 15_999, SEMUA, null)).toBeNull();
    expect(bolehPakai(baru!, "lari", 16_000, SEMUA, null)).toBe(true);
  });

  it("Kompas: aktif 20 detik; Petunjuk hanya di Langkah 1; tanpa muatan atau skill mati ditolak", () => {
    const s = denganMuatan({ kompas: 1, petunjuk: 1 });
    expect(pakai(s, "kompas", 1000, SEMUA, null)?.keadaan.aktifSampaiMs.kompas).toBe(21_000);
    expect(pakai(s, "kompas", 1000, SEMUA, 1)).toBeNull();
    expect(pakai(s, "petunjuk", 1000, SEMUA, 1)?.keadaan.muatan.petunjuk).toBe(0);
    expect(pakai(s, "petunjuk", 1000, SEMUA, 2)).toBeNull();
    expect(pakai(s, "petunjuk", 1000, SEMUA, null)).toBeNull();
    expect(pakai(s, "lari", 1000, SEMUA, null)).toBeNull();
    expect(pakai(s, "kompas", 1000, ["lari", "petunjuk"], null)).toBeNull();
  });

  it("jeda 2 detik sesudah pemakaian skill yang sama", () => {
    const s = pakai(denganMuatan({ petunjuk: 2 }), "petunjuk", 5000, SEMUA, 1)!;
    expect(pakai(s, "petunjuk", 6999, SEMUA, 1)).toBeNull();
    expect(pakai(s, "petunjuk", 7000, SEMUA, 1)?.keadaan.muatan.petunjuk).toBe(0);
  });

  it("JS-18 (P-4, P-14): Teropong aktif 30 detik dan tidak bisa dipakai lagi selama aktif; teropongAktif mengikuti masa aktif", () => {
    const s = denganMuatan({ teropong: 1 });
    const baru = pakai(s, "teropong", 40_000, LIMA, null)!;
    expect(baru.keadaan.muatan.teropong).toBe(0);
    expect(baru.keadaan.aktifSampaiMs.teropong).toBe(70_000);
    expect(baru.keadaan.terakhirPakaiMs.teropong).toBe(40_000);
    expect(teropongAktif(baru, 69_999)).toBe(true);
    expect(teropongAktif(baru, 70_000)).toBe(false);
    expect(teropongAktif(undefined, 0)).toBe(false);
    // Muatan bertambah lagi dari kotak, tetapi Teropong yang masih aktif tidak bisa dipakai lagi.
    baru.keadaan.muatan.teropong = 1;
    expect(pakai(baru, "teropong", 69_999, LIMA, null)).toBeNull();
    expect(bolehPakai(baru, "teropong", 70_000, LIMA, null)).toBe(true);
    expect(pakai(s, "teropong", 0, SEMUA, null)).toBeNull(); // skill mati
    expect(pakai(s, "teropong", 0, LIMA, 1)).toBeNull(); // dialog terbuka
  });

  it("kompasAktif dan akhiriKompas; +1 Kompas hanya bila Kompas aktif di ruang dan muatan kurang dari 2", () => {
    const s = pakai(denganMuatan({ kompas: 1 }), "kompas", 0, SEMUA, null)!;
    expect(kompasAktif(s, 100)).toBe(false); // tanpa sasaran
    s.kompas = { kode: "K-01", titik: "t-1" };
    expect(kompasAktif(s, 19_999)).toBe(true);
    expect(kompasAktif(s, 20_000)).toBe(false);
    const akhir = akhiriKompas(s);
    expect(akhir.kompas).toBeNull();
    expect(akhir.keadaan.aktifSampaiMs.kompas).toBeUndefined();
    expect(s.kompas).not.toBeNull();
    expect(tambahKompas(skillBaru(), SEMUA)?.keadaan.muatan.kompas).toBe(1);
    expect(tambahKompas(denganMuatan({ kompas: 1 }), SEMUA)?.keadaan.muatan.kompas).toBe(2);
    expect(tambahKompas(denganMuatan({ kompas: 2 }), SEMUA)).toBeNull();
    expect(tambahKompas(skillBaru(), ["lari", "petunjuk"])).toBeNull();
  });
});

describe("JS-18: syarat Angkot (P-22)", () => {
  const halte = HALTE_KAMPUNG;
  const pusatHalte = (i: number) => ({ x: halte[i].x * 16 + 8, y: halte[i].y * 16 + 8 });

  it("di halte 1 (32 px dari pusat ubin) ke halte 3: muatan −1, waktu pakai, halte asal dan tujuan", () => {
    const s = denganMuatan({ angkot: 1 });
    const c = pusatHalte(0);
    const hasil = pakaiAngkot(s, { x: c.x + 32, y: c.y }, "halte-3", halte, 9000, LIMA, null);
    expect(hasil?.asal.id).toBe("halte-1");
    expect(hasil?.tujuan.id).toBe("halte-3");
    expect(hasil?.s.keadaan.muatan.angkot).toBe(0);
    expect(hasil?.s.keadaan.terakhirPakaiMs.angkot).toBe(9000);
    expect(hasil?.s.keadaan.aktifSampaiMs.angkot).toBeUndefined();
    expect(s.keadaan.muatan.angkot).toBe(1);
  });

  it("ditolak: 32,01 px dari halte, halte tujuan sama, tidak ada, atau tanpa isian, dialog terbuka, tanpa karcis, skill mati, dan jeda 2 detik", () => {
    const s = denganMuatan({ angkot: 1 });
    const c = pusatHalte(0);
    const di = { x: c.x, y: c.y + 4 };
    expect(pakaiAngkot(s, { x: c.x + 32.01, y: c.y }, "halte-3", halte, 0, LIMA, null)).toBeNull();
    expect(pakaiAngkot(s, di, "halte-1", halte, 0, LIMA, null)).toBeNull();
    expect(pakaiAngkot(s, di, "halte-9", halte, 0, LIMA, null)).toBeNull();
    expect(pakaiAngkot(s, di, undefined, halte, 0, LIMA, null)).toBeNull();
    expect(pakaiAngkot(s, di, "halte-2", halte, 0, LIMA, 1)).toBeNull();
    expect(pakaiAngkot(s, di, "halte-2", halte, 0, LIMA, 2)).toBeNull();
    expect(pakaiAngkot(skillBaru(), di, "halte-2", halte, 0, LIMA, null)).toBeNull();
    expect(pakaiAngkot(s, di, "halte-2", halte, 0, SEMUA, null)).toBeNull();
    expect(pakaiAngkot(s, di, "halte-2", [], 0, LIMA, null)).toBeNull(); // peta tanpa halte
    const sekali = pakaiAngkot(s, di, "halte-2", halte, 5000, LIMA, null)!.s;
    sekali.keadaan.muatan.angkot = 1;
    const c2 = pusatHalte(1);
    expect(pakaiAngkot(sekali, c2, "halte-1", halte, 6999, LIMA, null)).toBeNull();
    expect(pakaiAngkot(sekali, c2, "halte-1", halte, 7000, LIMA, null)?.tujuan.id).toBe("halte-1");
  });
});

describe("sasaran Kompas (P-5, P-24)", () => {
  const kejadian = [
    { kode: "K-02", titik: [{ id: "t-b", zona: "z1" as const, x: 20, y: 10 }] },
    { kode: "K-01", titik: [{ id: "t-a", zona: "z1" as const, x: 40, y: 10 }, { id: "t-c", zona: "z2" as const, x: 12, y: 10 }] },
  ];
  it("titik aktif terdekat, termasuk titik kedua; kejadian selesai dilewati; null bila semua selesai", () => {
    const pos = { x: 10 * 16 + 8, y: 10 * 16 + 8 };
    expect(pilihSasaran(pos, kejadian, () => false)).toEqual({ kode: "K-01", titikId: "t-c", x: 12, y: 10 });
    expect(pilihSasaran(pos, kejadian, (k) => k === "K-01")).toEqual({ kode: "K-02", titikId: "t-b", x: 20, y: 10 });
    expect(pilihSasaran(pos, kejadian, () => true)).toBeNull();
  });
});

describe("pilihan yang dicoret Petunjuk (P-6; AC-2)", () => {
  const isi: Pick<IsiKejadian, "langkah1"> = MASUK[0].isi;
  const keliru = isi.langkah1.opsi.filter((o) => !o.benar).map((o) => o.id);

  it("selalu satu pilihan keliru, sama untuk benih, pemain, dan kejadian yang sama", () => {
    expect(keliru).toHaveLength(3);
    for (let i = 0; i < 50; i++) {
      const a = pilihCoretan(7, `p${i}`, "K-01", isi);
      expect(keliru).toContain(a);
      expect(pilihCoretan(7, `p${i}`, "K-01", isi)).toBe(a);
    }
  });

  it("ketiga pilihan keliru muncul di antara 300 pemain, dan benih atau kejadian lain bisa memberi hasil lain", () => {
    const muncul = new Set<string>();
    for (let i = 0; i < 300; i++) muncul.add(pilihCoretan(7, `p${i}`, "K-01", isi));
    expect([...muncul].sort()).toEqual([...keliru].sort());
    const beda = Array.from({ length: 40 }, (_, i) => pilihCoretan(7, `p${i}`, "K-01", isi) !== pilihCoretan(8, `p${i}`, "K-01", isi));
    expect(beda.some(Boolean)).toBe(true);
    const bedaKode = Array.from({ length: 40 }, (_, i) => pilihCoretan(7, `p${i}`, "K-01", isi) !== pilihCoretan(7, `p${i}`, "K-02", isi));
    expect(bedaKode.some(Boolean)).toBe(true);
  });
});

describe("pribadi dan jam server (P-12, P-13)", () => {
  it("waktu ronde ke jam server: mulaiPada + jedaMs + t", () => {
    expect(keJamServer(6000, 1_000_000, 0)).toBe(1_006_000);
    expect(keJamServer(6000, 1_000_000, 60_000)).toBe(1_066_000);
  });

  it("tanpa keadaan atau sebelum ronde: muatan 0, aktifSampai dan kotakMenunggu kosong", () => {
    const kosong = { muatan: { lari: 0, kompas: 0, petunjuk: 0, teropong: 0, angkot: 0 }, aktifSampai: {}, kotakMenunggu: [] };
    expect(isiPribadiSkill(undefined, 5000, 1_000_000, 0)).toEqual(kosong);
    expect(isiPribadiSkill(denganMuatan({ lari: 2 }), 0, null, 0)).toEqual(kosong);
  });

  it("JS-18 (P-14): muatan kelima skill; aktifSampai Lari cepat, Kompas, dan Teropong yang masih aktif; kotakMenunggu urut id dengan siapPada", () => {
    const s = denganMuatan({ lari: 1, kompas: 2, petunjuk: 1, teropong: 1, angkot: 1 });
    s.keadaan.aktifSampaiMs = { lari: 12_000, kompas: 9000, petunjuk: 50_000, teropong: 35_000, angkot: 60_000 };
    s.kotak = { "k-z3-1": 4000, "k-z1-2": 9000, "k-z2-2": 9000 - KOTAK.munculLagiMs };
    const isi = isiPribadiSkill(s, 10_000, 1_000_000, 30_000);
    expect(isi.muatan).toEqual({ lari: 1, kompas: 2, petunjuk: 1, teropong: 1, angkot: 1 });
    expect(isi.aktifSampai).toEqual({ lari: 1_042_000, teropong: 1_065_000 });
    expect(isiPribadiSkill(s, 35_000, 1_000_000, 30_000).aktifSampai).toEqual({});
    expect(isi.kotakMenunggu).toEqual([
      { id: "k-z1-2", siapPada: 1_000_000 + 30_000 + 9000 + KOTAK.munculLagiMs },
      { id: "k-z3-1", siapPada: 1_000_000 + 30_000 + 4000 + KOTAK.munculLagiMs },
    ]);
  });
});

describe("baris skill (P-14)", () => {
  it("isi_json bolak-balik menghasilkan keadaan yang sama", () => {
    const s = denganMuatan({ lari: 1, kompas: 2 });
    s.keadaan.aktifSampaiMs = { kompas: 412_300 };
    s.keadaan.terakhirPakaiMs = { kompas: 392_300, lari: 118_000 };
    s.kotak = { "k-z3-1": 95_000, "k-z1-2": 388_000 };
    s.kompas = { kode: "K-07", titik: "t-z4-03" };
    const json = skillKeJson(s);
    expect(JSON.parse(json)).toEqual({
      muatan: { lari: 1, kompas: 2, petunjuk: 0, teropong: 0, angkot: 0 },
      aktif: { kompas: 412_300 },
      pakai: { kompas: 392_300, lari: 118_000 },
      kotak: { "k-z3-1": 95_000, "k-z1-2": 388_000 },
      kompas: { kode: "K-07", titik: "t-z4-03" },
    });
    expect(skillDariJson(json)).toEqual(s);
    expect(skillDariJson(skillKeJson(skillBaru()))).toEqual(skillBaru());
  });

  it("JS-18: contoh baris spesifikasi dengan Teropong dan Angkot bolak-balik tanpa perubahan; muatan dijepit ke 1", () => {
    const contoh = {
      muatan: { lari: 0, kompas: 1, petunjuk: 0, teropong: 0, angkot: 0 },
      aktif: { teropong: 412_300 },
      pakai: { teropong: 382_300, angkot: 118_000 },
      kotak: { "k-z6-4": 380_000, "k-z3-4": 110_000 },
      kompas: null,
    };
    expect(JSON.parse(skillKeJson(skillDariJson(JSON.stringify(contoh))))).toEqual(contoh);
    expect(skillDariJson(JSON.stringify({ muatan: { teropong: 3, angkot: 2 } })).keadaan.muatan).toMatchObject({ teropong: 1, angkot: 1 });
  });

  it("isi rusak atau di luar batas menjadi keadaan awal atau dijepit", () => {
    expect(skillDariJson("bukan json")).toEqual(skillBaru());
    expect(skillDariJson("null")).toEqual(skillBaru());
    const s = skillDariJson(JSON.stringify({ muatan: { lari: 9, kompas: -3, petunjuk: "2" }, aktif: { lari: "x", kompas: 5 }, kotak: { a: 1, b: "2" }, kompas: { kode: 1 } }));
    expect(s.keadaan.muatan).toMatchObject({ lari: 2, kompas: 0, petunjuk: 0 });
    expect(s.keadaan.aktifSampaiMs).toEqual({ kompas: 5 });
    expect(s.kotak).toEqual({ a: 1 });
    expect(s.kompas).toBeNull();
  });
});
