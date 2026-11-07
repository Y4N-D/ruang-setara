// Uji aturan bersama (spesifikasi JS-02, P-5 sampai P-23 dan P-39; AC-3 sampai AC-6 dan AC-10).
import { describe, expect, it } from "vitest";
import { acakBerbenih, benih, bulat } from "../../inti/acak";
import {
  ABJAD_KODE,
  BATAS,
  frekuensiGerak,
  normalkanKode,
  POLA_KODE_RUANG,
  bandingkanPeringkat,
  bolehPakaiSkill,
  dapatMemeriksa,
  dapatMengambilKotak,
  duaMenitTerakhir,
  formatJam,
  GalatInti,
  hitungPeringkat,
  jarak,
  JEDA_SKILL_MS,
  kejadianTerdekat,
  kemajuan,
  KOTAK,
  kotakSiap,
  masa,
  menitCerita,
  pakaiSkill,
  POIN,
  poinKejadian,
  SKILL,
  tambahMuatanKompas,
  tempatkanKejadian,
  terlihatDiLayar,
  type PermintaanSkill,
} from "../../inti/aturan";
import type { KeadaanSkill, SkillId, TitikPeta, ZonaId } from "../../inti/tipe";

describe("masa dan jam cerita (P-5 sampai P-9)", () => {
  it("kemajuan memakai waktu ronde tanpa jeda dan dijepit ke 0–1", () => {
    expect(kemajuan(1000, 1000, 0, 900000)).toBe(0);
    expect(kemajuan(1000 + 450000, 1000, 0, 900000)).toBe(0.5);
    expect(kemajuan(1000 + 450000 + 60000, 1000, 60000, 900000)).toBe(0.5);
    expect(kemajuan(500, 1000, 0, 900000)).toBe(0);
    expect(kemajuan(1000 + 2000000, 1000, 0, 900000)).toBe(1);
  });

  it("kemajuan menolak durasi yang tidak sah", () => {
    expect(() => kemajuan(0, 0, 0, 0)).toThrow(RangeError);
    expect(() => kemajuan(0, 0, 0, -5)).toThrow(RangeError);
    expect(() => kemajuan(Number.NaN, 0, 0, 1000)).toThrow(RangeError);
  });

  it("jam cerita pada nilai batas: 06.00, 09.36, 13.48, 18.00", () => {
    expect(formatJam(menitCerita(0))).toBe("06.00");
    expect(formatJam(menitCerita(0.3))).toBe("09.36");
    expect(formatJam(menitCerita(0.65))).toBe("13.48");
    expect(formatJam(menitCerita(1))).toBe("18.00");
  });

  it("jam cerita selalu dibulatkan ke bawah, tanpa galat pembulatan biner, dan dijepit", () => {
    expect(menitCerita(0.5)).toBe(720);
    expect(menitCerita(0.7)).toBe(864); // 720 × 0,7 = 503,99999999999994 dalam biner
    expect(menitCerita(1 / 720 - 1e-6)).toBe(360);
    expect(menitCerita(0.99999)).toBe(1079);
    expect(menitCerita(-0.2)).toBe(360);
    expect(menitCerita(1.5)).toBe(1080);
  });

  it("masa: batas bawah inklusif, batas atas eksklusif", () => {
    expect(masa(0)).toBe("pagi");
    expect(masa(0.2999)).toBe("pagi");
    expect(masa(0.3)).toBe("siang");
    expect(masa(0.6499)).toBe("siang");
    expect(masa(0.65)).toBe("sore");
    expect(masa(1)).toBe("sore");
  });

  for (const durasiMenit of BATAS.durasiMenit) {
    it(`batas masa dan jam tepat untuk ronde ${durasiMenit} menit, dihitung dari milidetik`, () => {
      const durasi = durasiMenit * 60000;
      const pada = (ms: number) => kemajuan(5000 + ms, 5000, 0, durasi);
      expect(masa(pada(durasi * 0.3 - 1))).toBe("pagi");
      expect(masa(pada(durasi * 0.3))).toBe("siang");
      expect(formatJam(menitCerita(pada(durasi * 0.3)))).toBe("09.36");
      expect(masa(pada(durasi * 0.65 - 1))).toBe("siang");
      expect(masa(pada(durasi * 0.65))).toBe("sore");
      expect(formatJam(menitCerita(pada(durasi * 0.65)))).toBe("13.48");
      expect(formatJam(menitCerita(pada(durasi)))).toBe("18.00");
    });
  }

  it("formatJam memakai titik dan dua digit", () => {
    expect(formatJam(576)).toBe("09.36");
    expect(formatJam(0)).toBe("00.00");
    expect(formatJam(5)).toBe("00.05");
    expect(formatJam(1200)).toBe("20.00");
    expect(formatJam(1439)).toBe("23.59");
    expect(() => formatJam(1440)).toThrow(RangeError);
    expect(() => formatJam(-1)).toThrow(RangeError);
  });

  it("tanda dua menit terakhir: sisa 1–120 detik", () => {
    expect(duaMenitTerakhir(121)).toBe(false);
    expect(duaMenitTerakhir(120)).toBe(true);
    expect(duaMenitTerakhir(1)).toBe(true);
    expect(duaMenitTerakhir(0)).toBe(false);
  });
});

type DataUji = { id: string; skor: number; waktuSkorMs: number; langkah1Benar: number; urutanGabung: number };
const data = (id: string, skor: number, waktuSkorMs: number, langkah1Benar: number, urutanGabung: number): DataUji => ({
  id,
  skor,
  waktuSkorMs,
  langkah1Benar,
  urutanGabung,
});

describe("skor dan peringkat (P-10 sampai P-13)", () => {
  it("POIN sesuai PRD 8.4", () => {
    expect(POIN).toEqual({ langkah1Benar: 40, tepat: 60, kurang: 25, berisiko: 0 });
  });

  it("keenam kombinasi Langkah 1 dan tingkat menghasilkan 0, 25, 40, 60, 65, dan 100", () => {
    const hasil: Record<string, number> = {};
    for (const benar of [true, false]) {
      for (const tingkat of ["tepat", "kurang", "berisiko"] as const) hasil[`${benar}-${tingkat}`] = poinKejadian(benar, tingkat);
    }
    expect(hasil).toEqual({
      "true-tepat": 100,
      "true-kurang": 65,
      "true-berisiko": 40,
      "false-tepat": 60,
      "false-kurang": 25,
      "false-berisiko": 0,
    });
  });

  it("pembanding memutus seri di keempat tingkat", () => {
    expect(bandingkanPeringkat(data("a", 200, 9, 1, 9), data("b", 100, 1, 9, 1))).toBeLessThan(0);
    expect(bandingkanPeringkat(data("a", 100, 5, 1, 9), data("b", 100, 6, 9, 1))).toBeLessThan(0);
    expect(bandingkanPeringkat(data("a", 100, 5, 3, 9), data("b", 100, 5, 2, 1))).toBeLessThan(0);
    expect(bandingkanPeringkat(data("a", 100, 5, 3, 1), data("b", 100, 5, 3, 2))).toBeLessThan(0);
    expect(bandingkanPeringkat(data("b", 100, 5, 3, 2), data("a", 100, 5, 3, 1))).toBeGreaterThan(0);
  });

  it("hitungPeringkat memberi 1..n berurutan tanpa mengubah larik dan objek asal", () => {
    const asal = [data("c", 100, 50, 2, 3), data("a", 160, 90, 4, 1), data("b", 100, 40, 2, 2)];
    const salinan = JSON.parse(JSON.stringify(asal)) as DataUji[];
    const hasil = hitungPeringkat(asal);
    expect(hasil.map((p) => [p.id, p.peringkat])).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
    expect(asal).toEqual(salinan);
    expect(hasil[0]).not.toBe(asal[1]);
  });

  it("40 pemain acak mendapat peringkat unik 1–40 yang taat pembanding", () => {
    const acak = acakBerbenih(benih("peringkat-40"));
    const pemain = Array.from({ length: 40 }, (_, i) =>
      data(`p-${i}`, Math.floor(acak() * 5) * 25, Math.floor(acak() * 3) * 1000, Math.floor(acak() * 3), (i * 17) % 40),
    );
    const hasil = hitungPeringkat(pemain);
    expect(hasil.map((p) => p.peringkat)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
    for (let i = 1; i < hasil.length; i++) expect(bandingkanPeringkat(hasil[i - 1], hasil[i])).toBeLessThan(0);
  });

  it("dua pemain dengan keempat nilai sama adalah kesalahan pemakaian", () => {
    expect(() => hitungPeringkat([data("a", 100, 5, 3, 1), data("b", 100, 5, 3, 1)])).toThrow(RangeError);
  });

  it("daftar kosong menghasilkan peringkat kosong", () => {
    expect(hitungPeringkat([])).toEqual([]);
  });
});

const SEMUA_SKILL: SkillId[] = ["lari", "kompas", "petunjuk", "teropong", "angkot"];
const keadaan = (muatan: Partial<Record<SkillId, number>> = {}): KeadaanSkill => ({
  muatan: { lari: 0, kompas: 0, petunjuk: 0, teropong: 0, angkot: 0, ...muatan },
  aktifSampaiMs: {},
  terakhirPakaiMs: {},
});
const minta = (ubah: Partial<PermintaanSkill>): PermintaanSkill => ({
  skill: "lari",
  now: 100000,
  skillAktif: SEMUA_SKILL,
  keadaan: keadaan({ lari: 2, kompas: 2, petunjuk: 2, teropong: 1, angkot: 1 }),
  langkahDialog: null,
  ...ubah,
});

describe("skill (P-14 sampai P-17 dan P-19)", () => {
  it("tabel SKILL: muatan maksimum dan lama aktif", () => {
    expect(SKILL).toEqual({
      lari: { muatanMaks: 2, lamaMs: 6000 },
      kompas: { muatanMaks: 2, lamaMs: 20000 },
      petunjuk: { muatanMaks: 2, lamaMs: null },
      teropong: { muatanMaks: 1, lamaMs: 30000 },
      angkot: { muatanMaks: 1, lamaMs: null },
    });
    expect(JEDA_SKILL_MS).toBe(2000);
  });

  it("pakaiSkill mengurangi muatan, mencatat waktu, dan mengaktifkan skill berdurasi", () => {
    const lari = pakaiSkill(minta({ skill: "lari" }));
    expect(lari.diterima).toBe(true);
    expect(lari.keadaan.muatan.lari).toBe(1);
    expect(lari.keadaan.terakhirPakaiMs.lari).toBe(100000);
    expect(lari.keadaan.aktifSampaiMs.lari).toBe(106000);
    expect(pakaiSkill(minta({ skill: "kompas" })).keadaan.aktifSampaiMs.kompas).toBe(120000);
    expect(pakaiSkill(minta({ skill: "teropong" })).keadaan.aktifSampaiMs.teropong).toBe(130000);
    const petunjuk = pakaiSkill(minta({ skill: "petunjuk", langkahDialog: 1 }));
    expect(petunjuk.keadaan.muatan.petunjuk).toBe(1);
    expect(petunjuk.keadaan.aktifSampaiMs.petunjuk).toBeUndefined();
  });

  it("pakaiSkill tidak mengubah keadaan asal", () => {
    const p = minta({});
    const salinan = JSON.parse(JSON.stringify(p.keadaan)) as KeadaanSkill;
    pakaiSkill(p);
    expect(p.keadaan).toEqual(salinan);
  });

  it("muatan habis: pemakaian ditolak dan keadaan yang sama dikembalikan", () => {
    let k = minta({}).keadaan;
    let now = 100000;
    for (const harapan of [true, true, false]) {
      const hasil = pakaiSkill(minta({ keadaan: k, now }));
      expect(hasil.diterima).toBe(harapan);
      if (!harapan) expect(hasil.keadaan).toBe(k);
      k = hasil.keadaan;
      now += 2000;
    }
    expect(k.muatan.lari).toBe(0);
  });

  it("jeda 2 detik antarpemakaian skill yang sama; skill lain tidak terhalang", () => {
    const sesudah = pakaiSkill(minta({ now: 100000 })).keadaan;
    expect(bolehPakaiSkill(minta({ keadaan: sesudah, now: 101999 }))).toBe(false);
    expect(bolehPakaiSkill(minta({ keadaan: sesudah, now: 102000 }))).toBe(true);
    expect(bolehPakaiSkill(minta({ keadaan: sesudah, now: 100500, skill: "kompas" }))).toBe(true);
  });

  it("skill tidak bisa dipakai selama dialog terbuka, kecuali Petunjuk di Langkah 1", () => {
    for (const s of ["lari", "kompas", "teropong", "angkot"] as const) {
      expect(bolehPakaiSkill(minta({ skill: s, langkahDialog: 1 })), s).toBe(false);
      expect(bolehPakaiSkill(minta({ skill: s, langkahDialog: 2 })), s).toBe(false);
      expect(bolehPakaiSkill(minta({ skill: s, langkahDialog: null })), s).toBe(true);
    }
    expect(bolehPakaiSkill(minta({ skill: "petunjuk", langkahDialog: 1 }))).toBe(true);
    expect(bolehPakaiSkill(minta({ skill: "petunjuk", langkahDialog: 2 }))).toBe(false);
    expect(bolehPakaiSkill(minta({ skill: "petunjuk", langkahDialog: null }))).toBe(false);
  });

  it("skill yang dimatikan guru tidak bisa dipakai walau muatannya ada", () => {
    expect(bolehPakaiSkill(minta({ skill: "lari", skillAktif: ["kompas", "petunjuk"] }))).toBe(false);
    expect(bolehPakaiSkill(minta({ skill: "kompas", skillAktif: ["kompas", "petunjuk"] }))).toBe(true);
    expect(pakaiSkill(minta({ skill: "lari", skillAktif: [] })).diterima).toBe(false);
  });

  it("jawaban tepat menambah muatan Kompas, berhenti di 2", () => {
    expect(tambahMuatanKompas(0)).toBe(1);
    expect(tambahMuatanKompas(1)).toBe(2);
    expect(tambahMuatanKompas(2)).toBe(2);
  });
});

describe("kotak bantuan (P-18)", () => {
  it("muncul lagi tepat 90 detik sesudah diambil", () => {
    expect(KOTAK.munculLagiMs).toBe(90000);
    expect(kotakSiap(0, 5000, false)).toBe(true);
    expect(kotakSiap(10000, 99999, true)).toBe(false);
    expect(kotakSiap(10000, 100000, true)).toBe(true);
  });

  it("jangkauan ambil 12 piksel: 12,0 diterima, 12,1 ditolak", () => {
    expect(dapatMengambilKotak(12)).toBe(true);
    expect(dapatMengambilKotak(12.1)).toBe(false);
    expect(dapatMengambilKotak(jarak({ x: 100, y: 100 }, { x: 112, y: 100 }))).toBe(true);
    expect(dapatMengambilKotak(jarak({ x: 100, y: 100 }, { x: 112.1, y: 100 }))).toBe(false);
  });

  it("kotak setiap pemain terpisah", () => {
    const waktuAmbil: Record<string, number | undefined> = { "p-1": 10000, "p-2": undefined };
    const siap = (pemain: string, now: number) => kotakSiap(waktuAmbil[pemain] ?? 0, now, waktuAmbil[pemain] !== undefined);
    expect(siap("p-1", 50000)).toBe(false);
    expect(siap("p-2", 50000)).toBe(true);
  });
});

const titik = (id: string, zona: ZonaId, x: number, y: number): TitikPeta => ({ id, zona, x, y });
const TITIK: Partial<Record<ZonaId, TitikPeta[]>> = {
  z1: [titik("t1a", "z1", 2, 2), titik("t1b", "z1", 9, 2), titik("t1c", "z1", 2, 9), titik("t1d", "z1", 9, 9)],
  z2: [titik("t2a", "z2", 20, 2), titik("t2b", "z2", 27, 2), titik("t2c", "z2", 20, 9)],
};
const KEJADIAN = [
  { kode: "K-01", zona: "z1" as const },
  { kode: "K-02", zona: "z1" as const },
  { kode: "K-03", zona: "z2" as const },
  { kode: "K-04", zona: "z2" as const },
];

describe("penempatan, keterlihatan, dan jangkauan kejadian (P-20 sampai P-23)", () => {
  it("penempatan deterministik, di zona sendiri, tanpa titik ganda", () => {
    const a = tempatkanKejadian(777, TITIK, KEJADIAN);
    expect(tempatkanKejadian(777, TITIK, KEJADIAN)).toEqual(a);
    expect(a.map((p) => p.kode)).toEqual(["K-01", "K-02", "K-03", "K-04"]);
    for (const p of a) expect(p.titik.zona).toBe(KEJADIAN.find((k) => k.kode === p.kode)?.zona);
    expect(new Set(a.map((p) => p.titik.id)).size).toBe(4);
  });

  it("urutan daftar masukan tidak mengubah titik setiap kejadian", () => {
    const maju = tempatkanKejadian("ruang-x", TITIK, KEJADIAN);
    const mundur = tempatkanKejadian("ruang-x", TITIK, [...KEJADIAN].reverse());
    for (const p of maju) expect(mundur.find((q) => q.kode === p.kode)?.titik).toEqual(p.titik);
  });

  it("benih ruang berbeda menghasilkan penempatan berbeda", () => {
    const susunan = new Set(Array.from({ length: 30 }, (_, i) => tempatkanKejadian(i, TITIK, KEJADIAN).map((p) => p.titik.id).join(",")));
    expect(susunan.size).toBeGreaterThan(5);
  });

  it("titik zona yang kurang ditolak dengan galat TITIK_TIDAK_CUKUP", () => {
    const terlalu = [...KEJADIAN, { kode: "K-05", zona: "z2" as const }, { kode: "K-06", zona: "z2" as const }];
    expect(() => tempatkanKejadian(1, TITIK, terlalu)).toThrow("TITIK_TIDAK_CUKUP");
    expect(() => tempatkanKejadian(1, TITIK, [{ kode: "K-09", zona: "z5" }])).toThrow(GalatInti);
    let kode = "";
    try {
      tempatkanKejadian(1, TITIK, terlalu);
    } catch (galat) {
      if (galat instanceof GalatInti) kode = galat.kode;
    }
    expect(kode).toBe("TITIK_TIDAK_CUKUP");
  });

  it("kode kejadian ganda adalah kesalahan pemakaian", () => {
    expect(() => tempatkanKejadian(1, TITIK, [KEJADIAN[0], KEJADIAN[0]])).toThrow(RangeError);
  });

  it("keterlihatan: kotak 320 × 180 berpusat di pemain, tepi termasuk", () => {
    const p = { x: 1000, y: 600 };
    expect(terlihatDiLayar(p, { x: 1000, y: 600 }, 1920, 1280)).toBe(true);
    expect(terlihatDiLayar(p, { x: 840, y: 510 }, 1920, 1280)).toBe(true);
    expect(terlihatDiLayar(p, { x: 1160, y: 690 }, 1920, 1280)).toBe(true);
    expect(terlihatDiLayar(p, { x: 839.9, y: 600 }, 1920, 1280)).toBe(false);
    expect(terlihatDiLayar(p, { x: 1000, y: 690.1 }, 1920, 1280)).toBe(false);
  });

  it("keterlihatan dijepit ke tepi peta", () => {
    expect(terlihatDiLayar({ x: 10, y: 10 }, { x: 320, y: 180 }, 1920, 1280)).toBe(true);
    expect(terlihatDiLayar({ x: 10, y: 10 }, { x: 320.5, y: 100 }, 1920, 1280)).toBe(false);
    expect(terlihatDiLayar({ x: 1915, y: 1275 }, { x: 1600, y: 1100 }, 1920, 1280)).toBe(true);
    expect(terlihatDiLayar({ x: 50, y: 50 }, { x: 250, y: 150 }, 256, 160)).toBe(true);
  });

  it("kejadian terdekat yang belum selesai; seri dimenangkan kode terkecil", () => {
    const daftar = [
      { kode: "K-03", x: 100, y: 0, selesai: false },
      { kode: "K-01", x: 0, y: 50, selesai: true },
      { kode: "K-02", x: 0, y: 100, selesai: false },
      { kode: "K-04", x: 0, y: 300, selesai: false },
    ];
    expect(kejadianTerdekat({ x: 0, y: 0 }, daftar)?.kode).toBe("K-02");
    expect(kejadianTerdekat({ x: 0, y: 0 }, [...daftar].reverse())?.kode).toBe("K-02");
    expect(kejadianTerdekat({ x: 0, y: 290 }, daftar)?.kode).toBe("K-04");
    expect(kejadianTerdekat({ x: 0, y: 0 }, daftar.map((k) => ({ ...k, selesai: true })))).toBeNull();
    expect(kejadianTerdekat({ x: 0, y: 0 }, [])).toBeNull();
  });

  it("jangkauan Periksa 32 piksel (1,5 ubin ditambah toleransi 8)", () => {
    expect(dapatMemeriksa(24)).toBe(true);
    expect(dapatMemeriksa(32)).toBe(true);
    expect(dapatMemeriksa(32.01)).toBe(false);
  });
});

describe("batas (P-39)", () => {
  it("BATAS sesuai Architecture 6.6 dan PRD JFR-01", () => {
    expect(BATAS).toEqual({
      pesanByte: 2048,
      pesanPerDetik: 20,
      lonjakan: 40,
      pelanggaranGalat: 3,
      jendelaPelanggaranMs: 10000,
      pelanggaranTutup: 10,
      pemainMaks: 100,
      pemainMaksNomorAbsen: 50,
      ruangBesarLebihDari: 50,
      durasiMenit: [10, 15, 20],
      terlambatMenit: 5,
      nomorAbsenMin: 1,
      nomorAbsenMaks: 50,
      duniaTerdekat: 24,
      gerakPerDetik: 10,
      gerakPerDetikRuangBesar: 6,
      gerakDiamPerDetik: 1,
      pingMs: 5000,
      haloMs: 10000,
    });
  });

  it("frekuensi gerak 10 per detik, atau 6 per detik di ruang lebih dari 50 pemain (JS-03, P-44)", () => {
    expect([2, 40, 50, 51, 100].map(frekuensiGerak)).toEqual([10, 10, 10, 6, 6]);
  });

  it("kode ruang: 31 karakter tanpa 0, O, 1, I, dan L; masukan dinormalkan (JS-03, P-10, P-11)", () => {
    expect(ABJAD_KODE).toHaveLength(31);
    for (const c of "0O1IL") expect(ABJAD_KODE).not.toContain(c);
    expect(normalkanKode(" k7-mpa ")).toBe("K7MPA");
    expect(POLA_KODE_RUANG.test("K7MPA")).toBe(true);
    for (const salah of ["K7MP", "K7MPAA", "K7MP0", "K7MPO", "K7MP1", "K7MPI", "K7MPL", "k7mpa"]) expect(POLA_KODE_RUANG.test(salah), salah).toBe(false);
  });
});

describe("50 pemain sekaligus", () => {
  it("keadaan skill dan kotak setiap pemain terpisah", () => {
    const pemain = Array.from({ length: 50 }, (_, i) => ({ id: `p-${i}`, keadaan: keadaan({ lari: 2 }) }));
    const now = 200000;
    for (const p of pemain.filter((_, i) => i % 2 === 0)) p.keadaan = pakaiSkill(minta({ keadaan: p.keadaan, now })).keadaan;
    pemain.forEach((p, i) => expect(p.keadaan.muatan.lari, p.id).toBe(i % 2 === 0 ? 1 : 2));
    const acakAmbil = (i: number) => bulat(benih("kotak", i), 0, 1) === 1;
    const siap = pemain.map((_, i) => kotakSiap(now - 1000, now, acakAmbil(i)));
    expect(siap.filter(Boolean).length).toBe(siap.length - pemain.filter((_, i) => acakAmbil(i)).length);
  });
});
