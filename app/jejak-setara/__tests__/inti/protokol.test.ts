// Uji skema protokol v1 (spesifikasi JS-02, P-33 sampai P-38; AC-9; Architecture 6.3, 6.4, 6.7).
import { describe, expect, it } from "vitest";
import { BATAS } from "../../inti/aturan";
import {
  BATAS_PESAN,
  KODE_GALAT,
  PANJANG_TEKS,
  PROTOKOL_VERSI,
  skemaKelas,
  skemaPemain,
  skemaServerKelas,
  skemaServerPemain,
} from "../../inti/protokol";

type Pesan = Record<string, unknown>;
const pesan = (t: string, isi: Pesan = {}): Pesan => ({ v: 1, t, ...isi });
const dengan = (dasar: Pesan, ubah: Pesan): Pesan => ({ ...dasar, ...ubah });
const huruf = (n: number) => "a".repeat(n);

const TOKEN = "4OHi4-Tl5ufo6err7O3u7_Dx8vP09fb3-Pn6-_z9_v8"; // 32 byte (224–255) dalam base64url: 43 karakter
const PENGATURAN = {
  durasiMenit: 15,
  batasPemain: 40,
  batasTerlambatMenit: 5,
  skillAktif: ["lari", "kompas", "petunjuk"],
  modeNomorAbsen: false,
  uji: false,
};
const KARTU = {
  hak: "Hak memperoleh pelayanan kesehatan.",
  kewajiban: "Menghormati hak orang lain dengan tertib mengantre.",
  rujukan: ["Pasal 28H ayat (1) UUD NRI 1945", "Pasal 28J ayat (1) UUD NRI 1945"],
};
const OPSI1 = [
  { id: "o-4f", teks: "Hak ibu dan bayinya untuk memperoleh pelayanan kesehatan secara tertib" },
  { id: "o-1c", teks: "Hak Raka untuk pulang lebih cepat" },
  { id: "o-9a", teks: "Hak petugas untuk beristirahat" },
  { id: "o-2b", teks: "Hak pengunjung untuk memilih puskesmas lain" },
];
const OPSI2 = [
  { id: "q-7d", teks: "Ikut menyerobot karena antrean terlalu lama" },
  { id: "q-3e", teks: "Menolak, mengajak Raka kembali ke antrean, lalu memberi tahu petugas bahwa ada bayi yang demam" },
  { id: "q-5f", teks: "Tetap mengantre, tetapi diam saja" },
];
const STATUS = { status: "main", mulaiPada: 1000, berakhirPada: 901000, jedaSejak: null };
const GALAT = { kode: "RUANG_PENUH", pesan: "Ruang sudah penuh. Beri tahu gurumu." };
const PEMAIN_PAPAN = { id: "p-01", nama: "Kancil Jingga", avatar: 2, warnaTas: "sun", skor: 340, peringkat: 1 };
const PEMAIN_LOBI = { id: "p-01", nama: "Kancil Jingga", avatar: 2, warnaTas: "sun", terhubung: true };

// Satu contoh sah dan satu contoh cacat untuk setiap pesan (Architecture 6.3 dan 6.4).
const PEMAIN_KE_SERVER: Record<string, [Pesan, Pesan]> = {
  halo: [pesan("halo", { peran: "pemain", token: TOKEN, nomorAbsen: 12 }), pesan("halo", { peran: "guru" })],
  pilih_identitas: [
    pesan("pilih_identitas", { nama: "Kancil Jingga", avatar: 3 }),
    pesan("pilih_identitas", { nama: huruf(25), avatar: 3 }),
  ],
  gerak: [
    pesan("gerak", { x: 412.5, y: 233, arah: "kiri", jalan: true, seq: 1042 }),
    pesan("gerak", { x: 412.5, y: 233, arah: "serong", jalan: true, seq: 1042 }),
  ],
  periksa: [pesan("periksa", { kejadianId: "K-13" }), pesan("periksa", { kejadianId: "K 13" })],
  kunci_1: [pesan("kunci_1", { kejadianId: "K-13", opsiId: "o-4f" }), pesan("kunci_1", { kejadianId: "K-13" })],
  kunci_2: [pesan("kunci_2", { kejadianId: "K-13", opsiId: "q-3e" }), pesan("kunci_2", { kejadianId: "K-13", opsiId: "" })],
  tutup_dialog: [pesan("tutup_dialog", { kejadianId: "K-13" }), pesan("tutup_dialog")],
  pakai_skill: [pesan("pakai_skill", { skill: "petunjuk", kejadianId: "K-13" }), pesan("pakai_skill", { skill: "terbang" })],
  ambil_kotak: [pesan("ambil_kotak", { kotakId: "kotak-z1-1" }), pesan("ambil_kotak", { kotakId: huruf(33) })],
  ping: [pesan("ping", { tKlien: 123456.7 }), pesan("ping", { tKlien: -1 })],
  minta_nama: [pesan("minta_nama"), pesan("minta_nama", { nama: "Kancil Jingga" })],
};

const KELAS_KE_SERVER: Record<string, [Pesan, Pesan]> = {
  halo: [pesan("halo", { peran: "guru" }), pesan("halo", { peran: "pemain" })],
  mulai: [pesan("mulai"), pesan("mulai", { detik: 3 })],
  jeda: [pesan("jeda"), pesan("jeda", { alasan: "istirahat" })],
  lanjut: [pesan("lanjut"), pesan("lanjut", { sekarang: true })],
  akhiri: [pesan("akhiri"), pesan("akhiri", { paksa: true })],
  tambah_waktu: [pesan("tambah_waktu", { detik: 120 }), pesan("tambah_waktu", { detik: 0 })],
  kunci_ruang: [pesan("kunci_ruang", { kunci: true }), pesan("kunci_ruang", { kunci: "ya" })],
  keluarkan: [pesan("keluarkan", { pemainId: "p-7f3a" }), pesan("keluarkan")],
  kode_masuk_ulang: [pesan("kode_masuk_ulang", { pemainId: "p-7f3a" }), pesan("kode_masuk_ulang", { pemainId: 7 })],
  pembahasan: [pesan("pembahasan", { kejadianId: "K-01" }), pesan("pembahasan", { kejadianId: "" })],
  tutup_ruang: [pesan("tutup_ruang"), pesan("tutup_ruang", { alasan: "selesai" })],
};

const SERVER_KE_PEMAIN: Record<string, [Pesan, Pesan]> = {
  selamat_datang: [
    pesan("selamat_datang", {
      pemainId: "p-01",
      token: TOKEN,
      status: "lobi",
      pengaturan: PENGATURAN,
      waktuServer: 1762500000000,
      versiPeta: 1,
      saranNama: ["Kancil Jingga", "Jalak Biru", "Anoa Hijau"],
      avatarTersedia: [0, 1, 2, 3, 4, 5, 6, 7],
    }),
    pesan("selamat_datang", {
      pemainId: "p-01",
      token: TOKEN,
      status: "lobi",
      pengaturan: { ...PENGATURAN, durasiMenit: 12 },
      waktuServer: 1762500000000,
      versiPeta: 1,
      saranNama: [],
      avatarTersedia: [],
    }),
  ],
  status_ruang: [pesan("status_ruang", STATUS), pesan("status_ruang", { ...STATUS, status: "istirahat" })],
  dunia: [
    pesan("dunia", {
      w: 5000,
      p: [
        ["p-01", 100.5, 200, "bawah", true],
        ["p-02", 300, 40, "kiri", false],
      ],
      n: 23,
    }),
    pesan("dunia", { w: 5000, p: [["p-01", 100.5, 200, "bawah"]], n: 23 }),
  ],
  pemain_baru: [
    pesan("pemain_baru", { id: "p-03", nama: "Anoa Hijau", avatar: 7, warnaTas: "teal" }),
    pesan("pemain_baru", { id: "p-03", nama: "Anoa Hijau", avatar: 7, warnaTas: "ungu" }),
  ],
  pemain_pergi: [pesan("pemain_pergi", { id: "p-03" }), pesan("pemain_pergi", { id: "p 03" })],
  pribadi: [
    pesan("pribadi", {
      skor: 340,
      peringkat: 5,
      selesai: ["K-01", "K-13"],
      terlihat: ["K-01", "K-02", "K-13"],
      muatan: { lari: 2, kompas: 1, petunjuk: 0, teropong: 0, angkot: 0 },
      aktifSampai: { lari: 106000 },
      kotakMenunggu: [{ id: "kotak-z1-1", siapPada: 190000 }],
    }),
    pesan("pribadi", {
      skor: 340,
      peringkat: 5,
      selesai: [],
      terlihat: [],
      muatan: { lari: 2, kompas: 1, petunjuk: 0, teropong: 2, angkot: 0 },
      aktifSampai: {},
      kotakMenunggu: [],
    }),
  ],
  kejadian_terlihat: [
    pesan("kejadian_terlihat", { kejadianId: "K-13", x: 88, y: 41 }),
    pesan("kejadian_terlihat", { kejadianId: "K-13", x: 88.5, y: 41 }),
  ],
  kompas: [pesan("kompas", { x: 88, y: 41, berakhirPada: 126000 }), pesan("kompas", { x: 88, y: 512, berakhirPada: 126000 })],
  kejadian_terbuka: [
    pesan("kejadian_terbuka", {
      kejadianId: "K-13",
      judul: "Antrean puskesmas",
      situasi: "Ruang tunggu puskesmas penuh. Seorang ibu menggendong bayinya yang demam sudah lama mengantre.",
      setTokoh: ["ibu_bayi", "raka", "petugas_puskesmas"],
      pertanyaan1: "Hak siapa yang paling terganggu di sini?",
      opsi1: OPSI1,
      langkah: 1,
    }),
    pesan("kejadian_terbuka", {
      kejadianId: "K-13",
      judul: "Antrean puskesmas",
      situasi: "Ruang tunggu puskesmas penuh.",
      setTokoh: [],
      pertanyaan1: "Hak siapa yang paling terganggu di sini?",
      opsi1: OPSI1.slice(0, 3),
      langkah: 1,
    }),
  ],
  petunjuk: [
    pesan("petunjuk", { kejadianId: "K-13", kalimat: "Perhatikan siapa yang sudah lama menunggu.", opsiDicoret: "o-9a" }),
    pesan("petunjuk", { kejadianId: "K-13", kalimat: huruf(121), opsiDicoret: "o-9a" }),
  ],
  hasil_1: [
    pesan("hasil_1", {
      benar: false,
      opsiBenar: "o-4f",
      umpanBalik: "Keinginan pulang cepat bukan alasan untuk mengambil giliran orang lain.",
      umpanBalikBenar: "Benar. Bayi yang demam berhak dilayani.",
      poin: 0,
      pertanyaan2: "Apa yang kamu lakukan?",
      opsi2: OPSI2,
    }),
    pesan("hasil_1", {
      benar: true,
      opsiBenar: "o-4f",
      umpanBalik: "Benar.",
      poin: 101,
      pertanyaan2: "Apa yang kamu lakukan?",
      opsi2: OPSI2,
    }),
  ],
  hasil_2: [
    pesan("hasil_2", {
      tingkat: "tepat",
      poin: 60,
      terjadi: "Raka kembali ke antrean. Petugas memeriksa bayi itu lebih dulu.",
      opsiTepat: ["q-3e"],
      kartu: KARTU,
    }),
    pesan("hasil_2", { tingkat: "tepat", poin: 60, terjadi: "Raka kembali.", opsiTepat: ["q-3e"], kartu: { ...KARTU, rujukan: [] } }),
  ],
  koreksi: [pesan("koreksi", { x: 100, y: 100, seq: 6 }), pesan("koreksi", { x: 100, y: 100, seq: 1_000_000_001 })],
  pemberitahuan: [pesan("pemberitahuan", { kode: "dua_menit" }), pesan("pemberitahuan", { kode: "Dua Menit" })],
  selesai: [
    pesan("selesai", {
      skor: 1240,
      peringkat: 3,
      jumlahPemain: 38,
      rekap: [
        {
          kejadianId: "K-13",
          judul: "Antrean puskesmas",
          pilihan1: "Hak Raka untuk pulang lebih cepat",
          benar1: false,
          opsiBenar1: "Hak ibu dan bayinya untuk memperoleh pelayanan kesehatan secara tertib",
          pilihan2: null,
          tingkat2: null,
          opsiTepat2: [OPSI2[1].teks],
          poin: 0,
          rujukan: KARTU.rujukan,
        },
      ],
    }),
    pesan("selesai", { skor: 1240, peringkat: 3, jumlahPemain: 0, rekap: [] }),
  ],
  galat: [pesan("galat", GALAT), pesan("galat", { ...GALAT, kode: "RUANG_HILANG" })],
  pong: [pesan("pong", { tKlien: 5, waktuServer: 1762500000000 }), pesan("pong", { tKlien: 5 })],
  saran_nama: [
    pesan("saran_nama", { saranNama: ["Kancil Jingga", "Jalak Biru", "Anoa Hijau"] }),
    pesan("saran_nama", { saranNama: ["a", "b", "c", "d"] }),
  ],
};

const SERVER_KE_KELAS: Record<string, [Pesan, Pesan]> = {
  lobi: [pesan("lobi", { pemain: [PEMAIN_LOBI] }), pesan("lobi", { pemain: [{ ...PEMAIN_LOBI, terhubung: "ya" }] })],
  dunia_kelas: [
    pesan("dunia_kelas", { w: 5000, p: [["p-01", 10, 20, true]] }),
    pesan("dunia_kelas", { w: 5000, p: [["p-01", 10, 20, "ya"]] }),
  ],
  papan: [pesan("papan", { pemain: [PEMAIN_PAPAN] }), pesan("papan", { pemain: [{ ...PEMAIN_PAPAN, peringkat: 0 }] })],
  kemajuan: [pesan("kemajuan", { terjawab: 120, kemungkinan: 640 }), pesan("kemajuan", { terjawab: -1, kemungkinan: 640 })],
  data_pembahasan: [
    pesan("data_pembahasan", {
      kejadianId: "K-13",
      judul: "Antrean puskesmas",
      situasi: "Ruang tunggu puskesmas penuh.",
      pertanyaan1: "Hak siapa yang paling terganggu di sini?",
      opsi1: OPSI1.map((o, i) => ({ ...o, benar: i === 0, jumlah: 10 - i })),
      pertanyaan2: "Apa yang kamu lakukan?",
      opsi2: OPSI2.map((o, i) => ({ ...o, tingkat: (["berisiko", "tepat", "kurang"] as const)[i], terjadi: "Sesuatu terjadi.", jumlah: i })),
      kartu: KARTU,
    }),
    pesan("data_pembahasan", {
      kejadianId: "K-13",
      judul: "Antrean puskesmas",
      situasi: "Ruang tunggu puskesmas penuh.",
      pertanyaan1: "Hak siapa yang paling terganggu di sini?",
      opsi1: OPSI1.map((o, i) => ({ ...o, benar: i === 0, jumlah: 1 })),
      pertanyaan2: "Apa yang kamu lakukan?",
      opsi2: OPSI2.slice(0, 2).map((o) => ({ ...o, tingkat: "tepat", terjadi: "Sesuatu terjadi.", jumlah: 0 })),
      kartu: KARTU,
    }),
  ],
  status_ruang: [pesan("status_ruang", STATUS), pesan("status_ruang", { ...STATUS, mulaiPada: "tadi" })],
  galat: [pesan("galat", GALAT), pesan("galat", { ...GALAT, pesan: huruf(161) })],
};

const KELOMPOK = [
  { nama: "pemain → server", skema: skemaPemain, contoh: PEMAIN_KE_SERVER },
  { nama: "layar kelas → server", skema: skemaKelas, contoh: KELAS_KE_SERVER },
  { nama: "server → pemain", skema: skemaServerPemain, contoh: SERVER_KE_PEMAIN },
  { nama: "server → layar kelas", skema: skemaServerKelas, contoh: SERVER_KE_KELAS },
] as const;

describe("versi dan daftar pesan (P-33 sampai P-37)", () => {
  it("PROTOKOL_VERSI tetap 1", () => {
    expect(PROTOKOL_VERSI).toBe(1);
  });

  it("setiap skema memuat tepat pesan Architecture 6.3 dan 6.4", () => {
    const tipe = (s: { optionsMap: Map<unknown, unknown> }) => [...s.optionsMap.keys()].map(String).sort();
    expect(tipe(skemaPemain)).toEqual(
      ["halo", "pilih_identitas", "minta_nama", "gerak", "periksa", "kunci_1", "kunci_2", "tutup_dialog", "pakai_skill", "ambil_kotak", "ping"].sort(),
    );
    expect(tipe(skemaKelas)).toEqual(
      ["halo", "mulai", "jeda", "lanjut", "tambah_waktu", "akhiri", "kunci_ruang", "keluarkan", "kode_masuk_ulang", "pembahasan", "tutup_ruang"].sort(),
    );
    expect(tipe(skemaServerPemain)).toEqual(
      [
        "selamat_datang",
        "status_ruang",
        "dunia",
        "pemain_baru",
        "pemain_pergi",
        "pribadi",
        "kejadian_terlihat",
        "kompas",
        "kejadian_terbuka",
        "petunjuk",
        "hasil_1",
        "hasil_2",
        "koreksi",
        "pemberitahuan",
        "selesai",
        "galat",
        "pong",
        "saran_nama",
      ].sort(),
    );
    expect(tipe(skemaServerKelas)).toEqual(["lobi", "dunia_kelas", "papan", "kemajuan", "data_pembahasan", "status_ruang", "galat"].sort());
    for (const k of KELOMPOK) expect(Object.keys(k.contoh).sort(), k.nama).toEqual(tipe(k.skema));
  });

  it("kode galat sama dengan Architecture 6.7", () => {
    expect([...KODE_GALAT]).toEqual([
      "RUANG_TIDAK_ADA",
      "RUANG_PENUH",
      "RUANG_TERKUNCI",
      "TERLAMBAT",
      "NAMA_DIPAKAI",
      "VERSI_BERBEDA",
      "TERLALU_CEPAT",
      "DIKELUARKAN",
      "BUKAN_JANGKAUAN",
      "NOMOR_ABSEN_DIPAKAI",
    ]);
  });

  it("batas pesan sama dengan BATAS aturan dan Architecture 5.4", () => {
    expect(BATAS_PESAN.pemainMaks).toBe(BATAS.pemainMaks);
    expect([BATAS_PESAN.nomorAbsenMin, BATAS_PESAN.nomorAbsenMaks]).toEqual([BATAS.nomorAbsenMin, BATAS.nomorAbsenMaks]);
    expect(PANJANG_TEKS).toMatchObject({ judul: 32, situasi: 280, pertanyaan: 100, opsi1: 90, opsi2: 140, umpanBalik: 160 });
    expect(PANJANG_TEKS).toMatchObject({ terjadi: 160, petunjuk: 120, hak: 120, kewajiban: 120, nama: 24 });
  });
});

for (const k of KELOMPOK) {
  describe(`contoh pesan ${k.nama} (AC-9)`, () => {
    for (const [tipe, [sah, cacat]] of Object.entries(k.contoh)) {
      it(`${tipe}: contoh sah lolos tanpa diubah, contoh cacat ditolak`, () => {
        const hasil = k.skema.safeParse(sah);
        expect(hasil.success, JSON.stringify(hasil.error?.issues)).toBe(true);
        expect(hasil.data).toEqual(sah);
        expect(k.skema.safeParse(cacat).success).toBe(false);
      });

      it(`${tipe}: v selain 1, tanpa v, dan kunci tambahan ditolak`, () => {
        expect(k.skema.safeParse(dengan(sah, { v: 2 })).success).toBe(false);
        expect(k.skema.safeParse(dengan(sah, { v: "1" })).success).toBe(false);
        const { v, ...tanpaV } = sah;
        expect(v).toBe(1);
        expect(k.skema.safeParse(tanpaV).success).toBe(false);
        expect(k.skema.safeParse(dengan(sah, { tambahan: 1 })).success).toBe(false);
      });
    }

    it("tipe pesan yang tidak dikenal ditolak", () => {
      expect(k.skema.safeParse(pesan("tidak_ada")).success).toBe(false);
      expect(k.skema.safeParse({ v: 1 }).success).toBe(false);
      expect(k.skema.safeParse(null).success).toBe(false);
      expect(k.skema.safeParse("halo").success).toBe(false);
    });
  });
}

describe("batas nilai (P-34 sampai P-38)", () => {
  const lolos = (skema: { safeParse: (x: unknown) => { success: boolean } }, x: Pesan) => skema.safeParse(x).success;
  const [gerak] = PEMAIN_KE_SERVER.gerak;
  const [halo] = PEMAIN_KE_SERVER.halo;

  it("gerak: seq 0–1.000.000.000 bulat; koordinat 0–8.192 piksel dan terhingga", () => {
    for (const seq of [0, 1_000_000_000]) expect(lolos(skemaPemain, dengan(gerak, { seq })), String(seq)).toBe(true);
    for (const seq of [-1, 1_000_000_001, 1.5]) expect(lolos(skemaPemain, dengan(gerak, { seq })), String(seq)).toBe(false);
    for (const x of [0, 8192]) expect(lolos(skemaPemain, dengan(gerak, { x })), String(x)).toBe(true);
    for (const x of [-0.1, 8192.1, Number.NaN, Infinity]) expect(lolos(skemaPemain, dengan(gerak, { x })), String(x)).toBe(false);
  });

  it("halo: nomor absen 1–50 dan token 43 karakter base64url, keduanya boleh tidak ada", () => {
    expect(TOKEN).toHaveLength(43);
    expect(lolos(skemaPemain, pesan("halo", { peran: "pemain" }))).toBe(true);
    for (const nomorAbsen of [1, 50]) expect(lolos(skemaPemain, dengan(halo, { nomorAbsen }))).toBe(true);
    for (const nomorAbsen of [0, 51, 2.5]) expect(lolos(skemaPemain, dengan(halo, { nomorAbsen }))).toBe(false);
    for (const token of [TOKEN.slice(1), TOKEN + "a", TOKEN.slice(1) + "+", TOKEN.slice(1) + "="]) {
      expect(lolos(skemaPemain, dengan(halo, { token })), token).toBe(false);
    }
  });

  it("nama samaran 1–24 karakter, avatar 0–7, id 1–32 karakter", () => {
    const [identitas] = PEMAIN_KE_SERVER.pilih_identitas;
    expect(lolos(skemaPemain, dengan(identitas, { nama: huruf(24) }))).toBe(true);
    expect(lolos(skemaPemain, dengan(identitas, { nama: "" }))).toBe(false);
    expect(lolos(skemaPemain, dengan(identitas, { avatar: 7 }))).toBe(true);
    expect(lolos(skemaPemain, dengan(identitas, { avatar: 8 }))).toBe(false);
    expect(lolos(skemaPemain, pesan("periksa", { kejadianId: huruf(32) }))).toBe(true);
    expect(lolos(skemaPemain, pesan("periksa", { kejadianId: huruf(33) }))).toBe(false);
    expect(lolos(skemaPemain, pesan("periksa", { kejadianId: "K-13<" }))).toBe(false);
  });

  it("tambah waktu 1–600 detik", () => {
    expect(lolos(skemaKelas, pesan("tambah_waktu", { detik: 600 }))).toBe(true);
    expect(lolos(skemaKelas, pesan("tambah_waktu", { detik: 601 }))).toBe(false);
  });

  it("dunia paling banyak 64 pemain dengan n sampai 100; lobi, papan, dan dunia kelas paling banyak 100 (JS-03, C-8)", () => {
    const isiDunia = (n: number) => Array.from({ length: n }, (_, i) => [`p-${i}`, 10, 10, "atas", false]);
    expect(lolos(skemaServerPemain, pesan("dunia", { w: 1, p: isiDunia(64), n: 64 }))).toBe(true);
    expect(lolos(skemaServerPemain, pesan("dunia", { w: 1, p: isiDunia(65), n: 64 }))).toBe(false);
    expect(lolos(skemaServerPemain, pesan("dunia", { w: 1, p: isiDunia(24), n: 100 }))).toBe(true);
    expect(lolos(skemaServerPemain, pesan("dunia", { w: 1, p: isiDunia(24), n: 101 }))).toBe(false);
    const banyak = <T>(n: number, x: T) => Array.from({ length: n }, () => x);
    expect(lolos(skemaServerKelas, pesan("lobi", { pemain: banyak(100, PEMAIN_LOBI) }))).toBe(true);
    expect(lolos(skemaServerKelas, pesan("lobi", { pemain: banyak(101, PEMAIN_LOBI) }))).toBe(false);
    expect(lolos(skemaServerKelas, pesan("papan", { pemain: banyak(100, PEMAIN_PAPAN) }))).toBe(true);
    expect(lolos(skemaServerKelas, pesan("papan", { pemain: banyak(101, PEMAIN_PAPAN) }))).toBe(false);
    expect(lolos(skemaServerKelas, pesan("dunia_kelas", { w: 1, p: banyak(100, ["p-1", 1, 1, true]) }))).toBe(true);
    expect(lolos(skemaServerKelas, pesan("dunia_kelas", { w: 1, p: banyak(101, ["p-1", 1, 1, true]) }))).toBe(false);
  });

  it("panjang teks isi kejadian mengikuti Architecture 5.4", () => {
    const [terbuka] = SERVER_KE_PEMAIN.kejadian_terbuka;
    const [hasil2] = SERVER_KE_PEMAIN.hasil_2;
    const batas: [Pesan, string, number][] = [
      [terbuka, "judul", PANJANG_TEKS.judul],
      [terbuka, "situasi", PANJANG_TEKS.situasi],
      [terbuka, "pertanyaan1", PANJANG_TEKS.pertanyaan],
      [hasil2, "terjadi", PANJANG_TEKS.terjadi],
    ];
    for (const [dasar, kunci, maks] of batas) {
      expect(lolos(skemaServerPemain, dengan(dasar, { [kunci]: huruf(maks) })), kunci).toBe(true);
      expect(lolos(skemaServerPemain, dengan(dasar, { [kunci]: huruf(maks + 1) })), kunci).toBe(false);
    }
    const opsi1 = (teks: string) => dengan(terbuka, { opsi1: OPSI1.map((o, i) => (i === 2 ? { ...o, teks } : o)) });
    expect(lolos(skemaServerPemain, opsi1(huruf(90)))).toBe(true);
    expect(lolos(skemaServerPemain, opsi1(huruf(91)))).toBe(false);
    const kartu = (ubah: Pesan) => dengan(hasil2, { kartu: { ...KARTU, ...ubah } });
    expect(lolos(skemaServerPemain, kartu({ hak: huruf(120) }))).toBe(true);
    expect(lolos(skemaServerPemain, kartu({ kewajiban: huruf(121) }))).toBe(false);
    expect(lolos(skemaServerPemain, kartu({ rujukan: ["a", "b", "c", "d"] }))).toBe(true);
    expect(lolos(skemaServerPemain, kartu({ rujukan: ["a", "b", "c", "d", "e"] }))).toBe(false);
  });

  it("pengaturan ruang: skill tidak ganda, batas pemain 2–100 (JS-03, C-8)", () => {
    const [datang] = SERVER_KE_PEMAIN.selamat_datang;
    const atur = (ubah: Pesan) => dengan(datang, { pengaturan: { ...PENGATURAN, ...ubah } });
    expect(lolos(skemaServerPemain, atur({ skillAktif: [] }))).toBe(true);
    expect(lolos(skemaServerPemain, atur({ skillAktif: ["lari", "lari"] }))).toBe(false);
    expect(lolos(skemaServerPemain, atur({ batasPemain: 100 }))).toBe(true);
    expect(lolos(skemaServerPemain, atur({ batasPemain: 1 }))).toBe(false);
    expect(lolos(skemaServerPemain, atur({ batasPemain: 101 }))).toBe(false);
  });

  it("pesan masuk yang sah jauh di bawah batas 2.048 byte", () => {
    for (const contoh of [PEMAIN_KE_SERVER, KELAS_KE_SERVER]) {
      for (const [sah] of Object.values(contoh)) expect(JSON.stringify(sah).length).toBeLessThan(BATAS.pesanByte / 10);
    }
    expect(JSON.stringify(gerak).length).toBeLessThan(80);
  });
});
