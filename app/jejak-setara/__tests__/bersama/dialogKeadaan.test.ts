// Keadaan dialog kejadian (spesifikasi JS-08, P-38 sampai P-49; AC-8 sampai AC-11): mode ringkas, perpindahan
// tampilan, pilihan dan penguncian, masa tunggu 600 ms, dan papan ketik.
import { describe, expect, it } from "vitest";
import {
  aturRingkas,
  BATAS_DIALOG_RINGKAS_PX,
  bolehTekan,
  bukaDialog,
  fokusAwal,
  kunci,
  langkahChip,
  MASA_TUNGGU_DIALOG_MS,
  modeRingkas,
  opsiUmpanBalik,
  pilih,
  pilihNomor,
  pindah,
  teksPilihanTepat,
  terimaHasil1,
  terimaHasil2,
  tombolKaki,
  type Hasil1,
  type Hasil2,
  type KeadaanDialog,
} from "../../bersama/dialogKeadaan";
import type { PesanServerPemain } from "../../inti/protokol";
import { PROTOKOL_VERSI } from "../../inti/versi";
import { hitungSkala } from "../../pemain/dunia/skala";

const TERBUKA: Extract<PesanServerPemain, { t: "kejadian_terbuka" }> = {
  v: PROTOKOL_VERSI,
  t: "kejadian_terbuka",
  kejadianId: "K-13",
  judul: "Antrean puskesmas",
  situasi: "Ruang tunggu penuh.",
  setTokoh: ["npc_ibubayi_bawah_diam"],
  pertanyaan1: "Hak siapa yang paling terganggu?",
  opsi1: [
    { id: "aaaaaaaa", teks: "A" },
    { id: "bbbbbbbb", teks: "B" },
    { id: "cccccccc", teks: "C" },
    { id: "dddddddd", teks: "D" },
  ],
  langkah: 1,
};
const H1: Hasil1 = {
  benar: false,
  opsiBenar: "cccccccc",
  umpanBalik: "Pilihanmu kurang tepat.",
  umpanBalikBenar: "Yang benar ini.",
  poin: 0,
  pertanyaan2: "Apa yang kamu lakukan?",
  opsi2: [
    { id: "eeeeeeee", teks: "Ikut" },
    { id: "ffffffff", teks: "Menolak dan memberi tahu" },
    { id: "gggggggg", teks: "Diam" },
  ],
};
const H2: Hasil2 = { tingkat: "kurang", poin: 25, terjadi: "Raka tetap menyerobot.", opsiTepat: ["ffffffff"], kartu: { hak: "Hak", kewajiban: "Kewajiban", rujukan: ["Pasal 28H"] } };
const T = 10_000;
const lewat = T + MASA_TUNGGU_DIALOG_MS;

describe("mode dan bentuk (P-39)", () => {
  it("ringkas bila tinggi area dialog < 560 px: HP 731 × 411 dan 960 × 540 ringkas; 1280 × 720 dan 1920 × 1080 penuh", () => {
    const area = (w: number, h: number, r: number) => {
      const u = hitungSkala(w, h, r);
      return Math.min(h, u.atasCss + u.tinggiCss) - Math.max(0, u.atasCss) - 28;
    };
    expect(BATAS_DIALOG_RINGKAS_PX).toBe(560);
    expect(modeRingkas(area(731, 411, 2.625))).toBe(true);
    expect(modeRingkas(area(1024, 768, 1))).toBe(true); // dunia 960 × 540
    expect(modeRingkas(area(1366, 657, 1))).toBe(true); // dunia 960 × 540
    expect(modeRingkas(area(1280, 720, 1))).toBe(false);
    expect(modeRingkas(area(1920, 1080, 1))).toBe(false);
  });
});

describe("Langkah 1 (P-41 sampai P-43, P-48)", () => {
  it("mode penuh: pilihan bisa diganti, Kunci aktif hanya sesudah memilih, semua tombol nonaktif sampai hasil tiba", () => {
    let d = bukaDialog(TERBUKA, 7, false, T);
    expect(d.tampilan).toBe("langkah1");
    expect(fokusAwal(d)).toBe("pilihan");
    expect(tombolKaki(d)).toEqual([
      { aksi: "tutup", utama: false, aktif: true },
      { aksi: "kunci", utama: true, aktif: false },
    ]);
    expect(pilih(d, "aaaaaaaa", T + 100)).toBe(d); // masa tunggu 600 ms
    expect(bolehTekan(d, lewat - 1)).toBe(false);
    d = pilih(d, "aaaaaaaa", lewat);
    d = pilihNomor(d, 2, lewat);
    expect(d.pilihan1).toBe("bbbbbbbb");
    expect(pilihNomor(d, 5, lewat)).toBe(d);
    expect(pilih(d, "bukan-id", lewat)).toBe(d);
    expect(tombolKaki(d)[1].aktif).toBe(true);
    const k = kunci(d, lewat);
    expect(k.pesan).toEqual({ t: "kunci_1", kejadianId: "K-13", opsiId: "bbbbbbbb" });
    expect(k.d.mengunci).toBe(true);
    expect(kunci(k.d, lewat).pesan).toBeNull(); // menunggu hasil
    expect(pilih(k.d, "aaaaaaaa", lewat)).toBe(k.d);
  });

  it("mode ringkas: Situasi lalu Lihat pilihan; Situasi kembali tanpa menghapus pilihan", () => {
    let d = bukaDialog(TERBUKA, 7, true, T);
    expect(d.tampilan).toBe("situasi1");
    expect(fokusAwal(d)).toBe("lihat");
    expect(tombolKaki(d).map((b) => b.aksi)).toEqual(["tutup", "lihat"]);
    expect(pilih(d, "aaaaaaaa", lewat).pilihan1).toBeNull(); // pilihan belum tampil
    d = pindah(d, "lihat", lewat);
    expect(d.tampilan).toBe("pilihan1");
    expect(tombolKaki(d).map((b) => b.aksi)).toEqual(["tutup", "situasi", "kunci"]);
    expect(pindah(d, "situasi", lewat + 100)).toBe(d); // masa tunggu tampilan baru
    d = pilih(d, "cccccccc", lewat + MASA_TUNGGU_DIALOG_MS);
    d = pindah(d, "situasi", lewat + MASA_TUNGGU_DIALOG_MS);
    expect(d.tampilan).toBe("situasi1");
    d = pindah(d, "lihat", lewat + 2 * MASA_TUNGGU_DIALOG_MS);
    expect(d.pilihan1).toBe("cccccccc");
    expect(aturRingkas(d, false).tampilan).toBe("langkah1");
    expect(aturRingkas(aturRingkas(d, false), true).tampilan).toBe("pilihan1");
  });
});

describe("umpan balik, Langkah 2, kartu, dan KT-13 (P-44 sampai P-46)", () => {
  function sampaiHasil1(ringkas: boolean): KeadaanDialog {
    let d = bukaDialog(TERBUKA, 7, ringkas, T);
    if (ringkas) d = pindah(d, "lihat", lewat);
    d = pilih(d, "aaaaaaaa", lewat + MASA_TUNGGU_DIALOG_MS);
    d = kunci(d, lewat + MASA_TUNGGU_DIALOG_MS).d;
    return terimaHasil1(d, H1, T + 5000);
  }

  it("umpan balik: penuh menampilkan keempat pilihan berlabel; ringkas hanya pilihan pemain dan pilihan benar", () => {
    const penuh = sampaiHasil1(false);
    expect(penuh.tampilan).toBe("umpan");
    expect(fokusAwal(penuh)).toBe("lanjut2");
    expect(langkahChip(penuh)).toBe(1);
    expect(opsiUmpanBalik(penuh).map((o) => o.label)).toEqual(["pilihanmu", null, "tepat", null]);
    const ringkas = sampaiHasil1(true);
    expect(opsiUmpanBalik(ringkas).map((o) => [o.id, o.label])).toEqual([
      ["aaaaaaaa", "pilihanmu"],
      ["cccccccc", "tepat"],
    ]);
    expect(tombolKaki(ringkas).map((b) => b.aksi)).toEqual(["tutup", "lanjut2"]);
  });

  it("Langkah 2 dan kartu dampak: kunci_2, Pilihan yang tepat bila tingkat bukan tepat, tombol Lanjut menjelajah", () => {
    let d = sampaiHasil1(true);
    d = pindah(d, "lanjut2", T + 5000 + MASA_TUNGGU_DIALOG_MS);
    expect(d.tampilan).toBe("pilihan2");
    expect(langkahChip(d)).toBe(2);
    d = pindah(d, "situasi", T + 5000 + 2 * MASA_TUNGGU_DIALOG_MS);
    expect(d.tampilan).toBe("situasi2");
    d = pindah(d, "lihat", T + 5000 + 3 * MASA_TUNGGU_DIALOG_MS);
    d = pilihNomor(d, 3, T + 5000 + 4 * MASA_TUNGGU_DIALOG_MS);
    const k = kunci(d, T + 5000 + 4 * MASA_TUNGGU_DIALOG_MS);
    expect(k.pesan).toEqual({ t: "kunci_2", kejadianId: "K-13", opsiId: "gggggggg" });
    const kartu = terimaHasil2(k.d, H2, T + 9000);
    expect(kartu.tampilan).toBe("kartu");
    expect(tombolKaki(kartu)).toEqual([{ aksi: "jelajah", utama: true, aktif: true }]);
    expect(fokusAwal(kartu)).toBe("jelajah");
    expect(teksPilihanTepat(kartu)).toEqual(["Menolak dan memberi tahu"]);
    expect(teksPilihanTepat(terimaHasil2(k.d, { ...H2, tingkat: "tepat", poin: 60 }, T + 9000))).toEqual([]);
  });

  it("KT-13: dibuka lagi di Langkah 2, ulangan hasil_1 langsung membuka Langkah 2 tanpa umpan balik", () => {
    let d = bukaDialog({ ...TERBUKA, langkah: 2 }, 7, false, T);
    expect(d.tampilan).toBe("langkah2");
    expect(d.mengunci).toBe(true);
    d = terimaHasil1(d, { ...H1, benar: true, poin: 40, umpanBalikBenar: undefined }, T + 50);
    expect(d.tampilan).toBe("langkah2");
    expect(d.mengunci).toBe(false);
    expect(fokusAwal(d)).toBe("pilihan");
    expect(d.pilihan1).toBe("cccccccc");
  });
});
