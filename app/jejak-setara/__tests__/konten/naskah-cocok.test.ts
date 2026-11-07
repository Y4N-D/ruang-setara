// Uji kecocokan bank awal dengan naskah yang disetujui (spesifikasi JS-05, P-20 sampai P-24; AC-4, AC-5,
// AC-6, dan tabel set tokoh AC-8). Naskah K-xx.md dan NASKAH.md tetap bentuk yang dinilai pemilik proyek,
// jadi setiap teks di bank harus sama huruf demi huruf dengan naskahnya.
import { describe, expect, it } from "vitest";
import { REFERENCE_TEXT } from "../../../sehari-setara/content/references";
import { benih, kocok } from "../../inti/acak";
import { PANJANG_KONTEN } from "../../inti/konten/skema";
import { bacaBankAwal, semuaNaskah, uraiNaskahMd, type NaskahTerurai } from "./naskah-urai";

const { bank } = bacaBankAwal();
const naskah = semuaNaskah();
const naskahMd = uraiNaskahMd();
const HURUF = "abcd";

/** Isi kejadian yang diharapkan dari naskah, dengan urutan pilihan P-21. */
function harapan(n: NaskahTerurai, setTokoh: string[]) {
  const urutan1 = kocok([0, 1, 2, 3], benih("bank-awal", n.kode, "langkah1"));
  const urutan2 = kocok([0, 1, 2], benih("bank-awal", n.kode, "langkah2"));
  return {
    kode: n.kode,
    judul: n.judul,
    zona: n.zona,
    setTokoh,
    situasi: n.situasi,
    langkah1: {
      pertanyaan: n.langkah1.pertanyaan,
      opsi: urutan1.map((asal, posisi) => ({ id: `1${HURUF[posisi]}`, ...n.langkah1.baris[asal] })),
      petunjuk: n.langkah1.petunjuk,
    },
    langkah2: {
      pertanyaan: n.langkah2.pertanyaan,
      opsi: urutan2.map((asal, posisi) => ({ id: `2${HURUF[posisi]}`, ...n.langkah2.baris[asal] })),
    },
    kartu: { hak: n.kartu.hak, kewajiban: n.kartu.kewajiban, rujukan: n.rujukan.map((r) => r.id) },
    topik: n.topik,
    jenis: n.jenis,
  };
}

const TINGKAT_BAGIAN: Record<string, string> = { berisiko: "berisiko", tepat: "tepat", "kurang tepat": "kurang" };

/** Panjang dan batas satu baris tabel "Pemeriksaan panjang" naskah. */
function nilaiBagian(n: NaskahTerurai, bagian: string): { panjang: number; batas: number } | null {
  const benar = n.langkah1.baris.find((b) => b.benar);
  const pengecoh = n.langkah1.baris.filter((b) => !b.benar);
  const ke = Number(/pengecoh (\d)/.exec(bagian)?.[1] ?? 0);
  const tingkat = TINGKAT_BAGIAN[/\((berisiko|tepat|kurang tepat)\)$/.exec(bagian)?.[1] ?? ""];
  const opsi2 = n.langkah2.baris.find((b) => b.tingkat === tingkat);
  const P = PANJANG_KONTEN;
  if (bagian === "Judul") return { panjang: n.judul.length, batas: P.judul };
  if (/^Situasi \(\d kalimat\)$/.test(bagian)) return { panjang: n.situasi.length, batas: P.situasi };
  if (bagian === "Pertanyaan Langkah 1") return { panjang: n.langkah1.pertanyaan.length, batas: P.pertanyaan };
  if (bagian === "Pertanyaan Langkah 2") return { panjang: n.langkah2.pertanyaan.length, batas: P.pertanyaan };
  if (bagian === "Pilihan Langkah 1 (benar)" && benar) return { panjang: benar.teks.length, batas: P.opsi1 };
  if (bagian.startsWith("Pilihan Langkah 1 (pengecoh") && pengecoh[ke - 1]) return { panjang: pengecoh[ke - 1].teks.length, batas: P.opsi1 };
  if (bagian === "Umpan balik (benar)" && benar) return { panjang: benar.umpanBalik.length, batas: P.umpanBalik };
  if (bagian.startsWith("Umpan balik (pengecoh") && pengecoh[ke - 1]) return { panjang: pengecoh[ke - 1].umpanBalik.length, batas: P.umpanBalik };
  if (bagian === "Petunjuk") return { panjang: n.langkah1.petunjuk.length, batas: P.petunjuk };
  if (bagian.startsWith("Pilihan Langkah 2") && opsi2) return { panjang: opsi2.teks.length, batas: P.opsi2 };
  if (bagian.startsWith("Yang terjadi") && opsi2) return { panjang: opsi2.terjadi.length, batas: P.terjadi };
  if (bagian === "Kartu: hak yang terdampak") return { panjang: n.kartu.hak.length, batas: P.hak };
  if (bagian === "Kartu: kewajiban terkait") return { panjang: n.kartu.kewajiban.length, batas: P.kewajiban };
  return null;
}

describe("kejadian sama dengan naskah (P-20, P-21; AC-4, AC-5)", () => {
  it("16 naskah K-01 sampai K-16, sama dengan kode di bank", () => {
    expect(naskah.map((n) => n.kode)).toEqual(bank.kejadian.map((k) => k.kode));
  });

  for (const n of naskah) {
    it(`${n.kode}: teks, zona, jenis, topik, urutan pilihan, dan rujukan`, () => {
      const k = bank.kejadian.find((x) => x.kode === n.kode);
      expect(k).toBeDefined();
      if (k) expect(k).toEqual(harapan(n, k.setTokoh));
    });

    it(`${n.kode}: angka "Pemeriksaan panjang" sama dengan hitungan ulang`, () => {
      expect(n.panjang).toHaveLength(21);
      for (const baris of n.panjang) {
        const nilai = nilaiBagian(n, baris.bagian);
        expect(nilai, `${n.kode} bagian "${baris.bagian}" dikenali`).not.toBeNull();
        expect(baris.karakter, `${n.kode} ${baris.bagian}`).toBe(nilai?.panjang);
        expect(baris.batas, `${n.kode} batas ${baris.bagian}`).toBe(nilai?.batas);
      }
    });
  }

  it("sebaran pilihan benar dan tepat sesuai tabel urutan (AC-5)", () => {
    const sebaran = (daftar: string[]) => Object.fromEntries([...new Set(daftar)].sort().map((x) => [x, daftar.filter((y) => y === x).length]));
    expect(sebaran(bank.kejadian.map((k) => k.langkah1.opsi.find((o) => o.benar)?.id ?? "-"))).toEqual({ "1a": 4, "1b": 5, "1c": 2, "1d": 5 });
    expect(sebaran(bank.kejadian.map((k) => k.langkah2.opsi.find((o) => o.tingkat === "tepat")?.id ?? "-"))).toEqual({ "2a": 6, "2b": 4, "2c": 6 });
  });
});

// D-4: catatan rujukan untuk Peninjau
const PADANAN = (r: string) =>
  `Padanan Sehari Setara: ${r}, dicek pemilik proyek untuk Sehari Setara pada 5 November 2026; cukup pastikan isinya cocok dengan kejadian yang memakainya.`;
const BARU = "Rujukan baru: baca pasalnya penuh di naskah resmi.";
const KEDUA = "Cocokkan bunyi pasal dengan naskah Perubahan Kedua (2000), bukan naskah gabungan UUD 1945 di JDIH Kemenkeu yang memuat beberapa salah ketik di Bab XA.";
const KEEMPAT = "Cocokkan bunyi pasal dengan naskah Perubahan Keempat (2002).";
const ASLI = "Bunyi pasal ada di naskah asli 1945; pastikan juga di naskah gabungan bahwa ayat ini tidak diubah.";
const SEKUNDER = "Pra-pemeriksaan agen hanya memakai sumber sekunder, jadi bunyinya perlu dibaca langsung.";
const CATATAN: [string, string, ...string[]][] = [
  ["JR-01", "perlindungan dan tumbuh kembang Gita (K-01); perlindungan Komang dari kekerasan psikis dan diskriminasi (K-03)", PADANAN("R-01"), KEDUA],
  ["JR-02", "kebebasan memeluk agama dan beribadat (K-02)", BARU, KEDUA],
  ["JR-03", "jaminan negara atas kemerdekaan beribadat (K-02)", BARU, ASLI],
  [
    "JR-04",
    "kewajiban menghormati hak asasi orang lain",
    "Dipakai di sebelas kejadian bank awal: K-02, K-03, K-04, K-06, K-08, K-09, K-10, K-12, K-13, K-15, dan K-16.",
    PADANAN("R-08"),
    KEDUA,
  ],
  ["JR-05", "kehormatan dan martabat (K-03, K-15); rasa aman dan keselamatan di jalan (K-05); nama baik dan rasa aman Bayu (K-07)", PADANAN("R-03"), KEDUA],
  ["JR-06", "hak atas pendidikan (K-04, K-14)", PADANAN("R-04"), KEEMPAT],
  ["JR-07", "kemudahan atau perlakuan khusus agar Raka mendapat kesempatan yang sama (K-04)", BARU, KEDUA],
  ["JR-08", "kewajiban menjunjung hukum, termasuk aturan lalu lintas (K-05)", PADANAN("R-05"), ASLI],
  ["JR-09", "kepastian hukum yang adil dan perlakuan yang sama di hadapan hukum (K-07)", PADANAN("R-09"), KEDUA],
  ["JR-10", "hak milik pribadi tidak boleh diambil alih secara sewenang-wenang (K-08)", BARU, KEDUA],
  ["JR-11", "kebebasan mengeluarkan pendapat (K-09)", PADANAN("R-07"), KEDUA],
  ["JR-12", "bebas dari perlakuan yang diskriminatif (K-10)", BARU, KEDUA],
  ["JR-13", "lingkungan hidup yang baik dan sehat (K-11); pelayanan kesehatan (K-13)", BARU, KEDUA],
  ["JR-14", "hak berkomunikasi dan memperoleh informasi (K-16)", BARU, KEDUA],
  ["JR-15", "pembatasan hak dengan undang-undang demi hak orang lain dan ketertiban umum (K-16)", BARU, KEDUA],
  ["JR-16", "kewajiban anak menghormati orang tua dan menyayangi keluarga (K-01)", PADANAN("R-02"), "Sumbernya dua: UU 23/2002 dan UU 35/2014 yang mengubahnya."],
  [
    "JR-17",
    "hak anak beristirahat, bermain, dan bergaul dengan teman sebaya (K-12)",
    BARU,
    "Pastikan apakah Pasal 11 termasuk pasal yang diubah UU 35/2014 (lihat Pasal I UU 35/2014).",
  ],
  [
    "JR-18",
    "wajib punya SIM; pengemudi dan penumpang sepeda motor wajib berhelm (K-05)",
    PADANAN("R-06"),
    "Seperti catatan R-06, pastikan Pasal 77 dan Pasal 106 tidak diubah UU Cipta Kerja.",
  ],
  ["JR-19", "pejalan kaki didahulukan saat menyeberang di tempat penyeberangan (K-06)", BARU, SEKUNDER, "Pastikan juga Pasal 131 tidak diubah UU Cipta Kerja."],
  ["JR-20", "Bayu dianggap tidak bersalah selama belum ada putusan pengadilan (K-07)", PADANAN("R-12")],
  [
    "JR-21",
    "polisi menerima laporan dan menyelidiki (K-07)",
    PADANAN("R-11"),
    "Menurut catatan R-11 (5 November 2026), UU 5/2026 sedang diuji di Mahkamah Konstitusi; bila dibatalkan, rujukan ini ditinjau ulang.",
  ],
  [
    "JR-22",
    "kewajiban setiap orang menjaga kelestarian lingkungan dan mencegah pencemaran (K-11)",
    BARU,
    SEKUNDER,
    "Halaman JDIH BPK mencatat UU ini diubah lewat UU Cipta Kerja; pastikan Pasal 67 tidak termasuk yang diubah.",
  ],
  ["JR-23", "kewajiban mengikuti pendidikan dasar, dan kewajiban pemerintah membiayainya (K-14)", BARU, KEEMPAT],
];

describe("pustaka rujukan (P-23; AC-6)", () => {
  it("23 rujukan di NASKAH.md, sama urutan dan id dengan bank", () => {
    expect(naskahMd.pustaka.map((r) => r.id)).toEqual(bank.rujukan.map((r) => r.id));
  });

  for (const p of naskahMd.pustaka) {
    it(`${p.id}: teks, sumber, padanan Sehari Setara, dan pemakaian sama dengan NASKAH.md`, () => {
      const r = bank.rujukan.find((x) => x.id === p.id);
      expect(r?.teks).toBe(p.teks);
      expect(r?.sumber).toBe(naskahMd.dokumen.get(p.dokumen));
      expect(r?.kodeSehari).toBe(/^R-\d{2}$/.test(p.padanan) ? p.padanan : null);
      expect(bank.kejadian.filter((k) => k.kartu.rujukan.includes(p.id)).map((k) => k.kode)).toEqual(p.dipakaiDi);
    });
  }

  it("teks rujukan di setiap naskah sama dengan pustaka", () => {
    const pustaka = new Map(naskahMd.pustaka.map((p) => [p.id, p]));
    for (const n of naskah) {
      for (const r of n.rujukan) {
        expect(pustaka.get(r.id)?.teks, `${n.kode} ${r.id}`).toBe(r.teks);
      }
    }
  });

  it("ke-11 teks berpadanan R-xx sama persis dengan Sehari Setara (KT-B4a)", () => {
    const berpadanan = bank.rujukan.filter((r) => r.kodeSehari !== null);
    expect(berpadanan).toHaveLength(11);
    const teksSehari: Record<string, string> = REFERENCE_TEXT;
    for (const r of berpadanan) expect(r.teks, `${r.id} = ${r.kodeSehari}`).toBe(teksSehari[r.kodeSehari ?? ""]);
  });

  it("catatan setiap rujukan sama dengan D-4", () => {
    expect(CATATAN.map(([id]) => id)).toEqual(bank.rujukan.map((r) => r.id));
    for (const [id, butuh, ...lanjutan] of CATATAN) {
      expect(bank.rujukan.find((r) => r.id === id)?.catatan, id).toBe([`Yang dibutuhkan kejadian: ${butuh}.`, ...lanjutan].join(" "));
    }
  });
});

describe("set tokoh dan latar titik di NASKAH.md (D-1, D-2; AC-8, AC-18)", () => {
  it("tabel set tokoh sama dengan setTokoh dan zona di bank", () => {
    expect([...naskahMd.setTokoh.keys()]).toEqual(bank.kejadian.map((k) => k.kode));
    for (const k of bank.kejadian) {
      expect(naskahMd.setTokoh.get(k.kode), k.kode).toEqual({ zona: k.zona.toUpperCase(), kunci: k.setTokoh });
    }
  });

  it("tabel latar titik memuat Z1 sampai Z8", () => {
    expect(naskahMd.latar.map((l) => l.zona)).toEqual(["Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7", "Z8"]);
    for (const l of naskahMd.latar) expect(l.kebutuhan.length, l.zona).toBeGreaterThan(0);
  });
});
