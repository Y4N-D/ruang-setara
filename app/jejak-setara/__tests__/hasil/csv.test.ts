// Ekspor CSV dan rincian jawaban (spesifikasi JS-11, P-24, P-27 sampai P-30; AC-17).
// JS-09 (P-46, P-47): kolom ke-18 "Petunjuk dipakai" di ujung kanan CSV jawaban dan `petunjukDipakai` di rincian.
import { describe, expect, it } from "vitest";
import { TEKS_KONSOL } from "../../teks-konsol";
import type { BarisJawabanHasil, BarisVersiHasil } from "../../../../server/jejak-setara/src/db/ruang";
import {
  csvJawaban,
  csvPeserta,
  namaBerkasCsv,
  rincianJawaban,
  selBulat,
  selDesimal,
  selTeks,
  susunCsv,
  tanggalWita,
  waktuWita,
  type PesertaEkspor,
} from "../../../../server/jejak-setara/src/ekspor/csv";

const T = TEKS_KONSOL.csv;

describe("sel CSV (P-27)", () => {
  it("perlindungan rumus untuk keenam awalan, tanpa mengubah teks yang aman", () => {
    expect(selTeks("=1+1")).toBe("'=1+1");
    expect(selTeks("+62 812")).toBe("'+62 812");
    expect(selTeks("-5")).toBe("'-5");
    expect(selTeks("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(selTeks("\tx")).toBe("'\tx");
    expect(selTeks("\rx")).toBe("\"'\rx\"");
    for (const aman of ["IX-B", "K-13", "Jalak Biru", "Hak atas kesehatan", "100%"]) expect(selTeks(aman)).toBe(aman);
  });

  it("tanda kutip ganda bila memuat titik koma, kutip, CR, atau LF; kutip di dalam ditulis dua kali", () => {
    expect(selTeks("a;b")).toBe('"a;b"');
    expect(selTeks('kata "hak"')).toBe('"kata ""hak"""');
    expect(selTeks("baris\nbaru")).toBe('"baris\nbaru"');
    expect(selTeks("=A1;B1")).toBe("\"'=A1;B1\"");
    expect(selTeks(null)).toBe("");
    expect(selTeks("")).toBe("");
  });

  it("bilangan: bulat apa adanya, pecahan satu angka dengan koma desimal, kosong bila null", () => {
    expect(selBulat(1500)).toBe("1500");
    expect(selBulat(null)).toBe("");
    expect(selDesimal(71.25)).toBe("71,3");
    expect(selDesimal(100)).toBe("100,0");
    expect(selDesimal(1234.56)).toBe("1234,6");
    expect(selDesimal(null)).toBe("");
  });

  it("waktu WITA (UTC+8), termasuk pergantian hari pukul 16.00 UTC", () => {
    expect(tanggalWita(Date.UTC(2026, 10, 19, 15, 59, 59))).toBe("2026-11-19");
    expect(tanggalWita(Date.UTC(2026, 10, 19, 16, 0, 0))).toBe("2026-11-20");
    expect(waktuWita(Date.UTC(2026, 10, 20, 2, 3, 4))).toBe("2026-11-20 10:03:04");
    expect(waktuWita(null)).toBe("");
  });

  it("berkas: BOM UTF-8, titik koma, dan CRLF di setiap baris", () => {
    const isi = susunCsv(["A", "B"], [["1", "2"]]);
    expect(isi.charCodeAt(0)).toBe(0xfeff);
    expect(isi).toBe("﻿A;B\r\n1;2\r\n");
    expect(new TextEncoder().encode(isi).slice(0, 3)).toEqual(new Uint8Array([0xef, 0xbb, 0xbf]));
  });
});

describe("nama berkas (P-30)", () => {
  const t = Date.UTC(2026, 10, 20, 1, 0, 0);
  it("label huruf kecil, rangkaian karakter lain menjadi satu tanda minus, tanggal WITA", () => {
    expect(namaBerkasCsv("IX B", t, "peserta")).toBe("jejak-setara_ix-b_2026-11-20_peserta.csv");
    expect(namaBerkasCsv("IX/B  (pagi)", t, "jawaban")).toBe("jejak-setara_ix-b-pagi_2026-11-20_jawaban.csv");
    expect(namaBerkasCsv("--Kelas Ünggul--", t, "peserta")).toBe("jejak-setara_kelas-nggul_2026-11-20_peserta.csv");
    expect(namaBerkasCsv("日本 語", t, "peserta")).toBe("jejak-setara_ruang_2026-11-20_peserta.csv");
    const panjang = namaBerkasCsv("a".repeat(39) + " bcd", t, "peserta");
    expect(panjang).toBe(`jejak-setara_${"a".repeat(39)}_2026-11-20_peserta.csv`);
  });
});

// ---------------------------------------------------------------------------------------------

function isiVersi(kode: string, judul: string) {
  return JSON.stringify({
    kode,
    judul,
    langkah1: { opsi: [{ id: "1a", teks: "Hak ibu", benar: true }, { id: "1b", teks: "Hak penjual", benar: false }, { id: "1c", teks: "C", benar: false }, { id: "1d", teks: "=D", benar: false }] },
    langkah2: { opsi: [{ id: "2a", teks: "Menolak dengan sopan", tingkat: "tepat" }, { id: "2b", teks: "Diam saja", tingkat: "kurang" }, { id: "2c", teks: "Ikut menyerobot", tingkat: "berisiko" }] },
  });
}
const VERSI: BarisVersiHasil[] = [
  { id: "v-10", nomor: 2, jenis: "terbit", isi_json: isiVersi("K-10", "Antrean"), kode: "K-10" },
  { id: "v-2", nomor: 0, jenis: "kerja", isi_json: isiVersi("K-2", "Zebra cross"), kode: "K-2" },
];
function jawaban(pesertaId: string, versi: string, l1: string, l2: string | null, petunjuk = 0): BarisJawabanHasil {
  return {
    peserta_id: pesertaId,
    kejadian_versi_id: versi,
    urutan_opsi_json: JSON.stringify({ langkah1: ["1d", "1c", "1b", "1a"], langkah2: ["2c", "2b", "2a"] }),
    langkah1_opsi: l1,
    langkah1_benar: l1 === "1a" ? 1 : 0,
    langkah2_opsi: l2,
    tingkat: l2 === null ? null : l2 === "2a" ? "tepat" : l2 === "2b" ? "kurang" : "berisiko",
    poin: (l1 === "1a" ? 40 : 0) + (l2 === "2a" ? 60 : l2 === "2b" ? 25 : 0),
    dibuka_pada: Date.UTC(2026, 10, 20, 2, 0, 0),
    langkah1_pada: Date.UTC(2026, 10, 20, 2, 0, 10),
    langkah2_pada: l2 === null ? null : Date.UTC(2026, 10, 20, 2, 0, 41, 600),
    petunjuk_dipakai: petunjuk,
  };
}

describe("rincian jawaban (P-24)", () => {
  it("huruf menurut urutan acak pemain, teks dari versi, urut menurut nomor kode, versi kerja bernilai null", () => {
    const r = rincianJawaban([jawaban("p1", "v-10", "1a", "2b"), jawaban("p1", "v-2", "1b", null), jawaban("p1", "v-hilang", "1a", null)], VERSI);
    expect(r.map((x) => x.kode)).toEqual(["K-2", "K-10"]);
    expect(r[0]).toMatchObject({ judul: "Zebra cross", versi: null, huruf1: "C", pilihan1: "Hak penjual", benar1: false, jawabanTepat1: "Hak ibu", huruf2: null, pilihan2: null, tingkat2: null, waktuMenjawabMs: null, poin: 0 });
    expect(r[0].pilihanTepat2).toEqual(["Menolak dengan sopan"]);
    expect(r[1]).toMatchObject({ versi: 2, huruf1: "D", benar1: true, huruf2: "B", pilihan2: "Diam saja", tingkat2: "kurang", poin: 65, waktuMenjawabMs: 41_600 });
    expect(r.map((x) => x.petunjukDipakai)).toEqual([false, false]);
  });

  it("JS-09 (P-46): petunjukDipakai bernilai true hanya bila kolom D1 bernilai 1", () => {
    const r = rincianJawaban([jawaban("p1", "v-10", "1a", "2b", 1), jawaban("p1", "v-2", "1b", null, 0)], VERSI);
    expect(r.map((x) => [x.kode, x.petunjukDipakai])).toEqual([["K-2", false], ["K-10", true]]);
  });
});

describe("CSV peserta dan jawaban (P-28, P-29)", () => {
  const ruang = { labelKelas: "IX B", dibuatPada: Date.UTC(2026, 10, 20, 1, 0, 0) , durasiMenit: 5 }; // JS-25 (P-17)
  const p = (id: string, lain: Partial<PesertaEkspor>): PesertaEkspor => ({
    id,
    nama: `Pemain ${id}`,
    nomorAbsen: null,
    dikeluarkan: false,
    peringkat: 1,
    skor: 65,
    selesai: 1,
    langkah1Dijawab: 3,
    langkah1Benar: 2,
    tepat: 0,
    kurang: 1,
    berisiko: 0,
    waktuSkorMs: 12_340,
    gabungPada: Date.UTC(2026, 10, 20, 1, 30, 0),
    ...lain,
  });
  const peserta = [p("p1", { nomorAbsen: 7 }), p("p2", { dikeluarkan: true, peringkat: null, skor: 0, waktuSkorMs: null, langkah1Dijawab: 0, langkah1Benar: 0 })];

  it("CSV peserta: 17 kolom menurut urutan (JS-25: Durasi terakhir), peringkat kosong dan keterangan untuk yang dikeluarkan", () => {
    const baris = csvPeserta(ruang, peserta).slice(1).split("\r\n");
    expect(baris[0].split(";")).toEqual([T.kelas, T.tanggal, T.peringkat, T.nama, T.absen, T.skor, T.selesai, T.l1Dijawab, T.l1Benar, T.ketepatan, T.tepat, T.kurang, T.berisiko, T.waktuSkor, T.gabung, T.keterangan, T.durasi]);
    expect(baris[1].split(";")).toEqual(["IX B", "2026-11-20", "1", "Pemain p1", "7", "65", "1", "3", "2", "66,7", "0", "1", "0", "12,3", "2026-11-20 09:30:00", "", "5"]);
    expect(baris[2].split(";")).toEqual(["IX B", "2026-11-20", "", "Pemain p2", "", "0", "1", "0", "0", "", "0", "1", "0", "", "2026-11-20 09:30:00", T.dikeluarkan, "5"]);
    expect(baris[3]).toBe("");
  });

  it("CSV jawaban: 19 kolom (JS-09 P-47, JS-25 P-17), urut menurut peserta lalu nomor kode, Kerja untuk versi kerja, Ya dan Tidak, tingkat sebagai teks", () => {
    const rinci = rincianJawaban([jawaban("p2", "v-10", "1a", "2c"), jawaban("p1", "v-10", "1a", "2b", 1), jawaban("p1", "v-2", "1b", null)], VERSI);
    const baris = csvJawaban(ruang, peserta, rinci).slice(1).split("\r\n");
    expect(baris[0].split(";")).toHaveLength(19);
    expect(baris[0].split(";").slice(15)).toEqual([T.waktuMenjawab, T.keterangan, T.petunjuk, T.durasi]);
    expect(baris[1].split(";")).toEqual(["IX B", "2026-11-20", "Pemain p1", "7", "K-2", "Zebra cross", T.versiKerja, "C", "Hak penjual", T.tidak, "", "", "", "0", "2026-11-20 10:00:00", "", "", T.tidak, "5"]);
    expect(baris[2].split(";")).toEqual(["IX B", "2026-11-20", "Pemain p1", "7", "K-10", "Antrean", "2", "D", "Hak ibu", T.ya, "B", "Diam saja", T.tingkatKurang, "65", "2026-11-20 10:00:00", "41,6", "", T.ya, "5"]);
    expect(baris[3].split(";")).toEqual(["IX B", "2026-11-20", "Pemain p2", "", "K-10", "Antrean", "2", "D", "Hak ibu", T.ya, "A", "Ikut menyerobot", T.tingkatBerisiko, "40", "2026-11-20 10:00:00", "41,6", T.dikeluarkan, T.tidak, "5"]);
    expect(T.petunjuk).toBe("Petunjuk dipakai");
    expect(T.durasi).toBe("Durasi (menit)");
  });

  it("ruang tidak dimainkan: hanya baris judul", () => {
    expect(csvPeserta(ruang, []).split("\r\n")).toHaveLength(2);
    expect(csvJawaban(ruang, [], []).split("\r\n")).toHaveLength(2);
  });
});
