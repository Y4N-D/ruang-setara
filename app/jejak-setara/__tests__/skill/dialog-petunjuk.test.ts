// Petunjuk dan "+1 Kompas" di dialog kejadian (spesifikasi JS-09, P-27 sampai P-32 dan P-44; AC-11, AC-12, AC-17):
// tombol kaki per tampilan, pilihan yang dicoret, menunggu `petunjuk`, Petunjuk yang dikirim ulang, dan pratinjau.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  aturPetunjuk,
  bukaDialog,
  dicoret,
  fokusAwal,
  kunci,
  MASA_TUNGGU_DIALOG_MS,
  pilih,
  pilihNomor,
  pindah,
  tekanPetunjuk,
  terimaHasil1,
  terimaPetunjuk,
  tombolKaki,
  type Hasil1,
} from "../../bersama/dialogKeadaan";
import type { PesanServerPemain } from "../../inti/protokol";
import type { IsiKejadian } from "../../inti/tipe";
import { PROTOKOL_VERSI } from "../../inti/versi";
import { MUATAN_PETUNJUK_PRATINJAU, pesanTerbuka, petunjukPratinjau } from "../../pemain/pratinjau";

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
  benar: true,
  opsiBenar: "cccccccc",
  umpanBalik: "Tepat.",
  poin: 40,
  pertanyaan2: "Apa yang kamu lakukan?",
  opsi2: [
    { id: "eeeeeeee", teks: "Ikut" },
    { id: "ffffffff", teks: "Menolak" },
    { id: "gggggggg", teks: "Diam" },
  ],
};
const T = 10_000;
const lewat = T + MASA_TUNGGU_DIALOG_MS;
const PET = { kejadianId: "K-13", kalimat: "Ingat siapa yang paling lama menunggu.", opsiDicoret: "aaaaaaaa" };
const aksi = (d: ReturnType<typeof bukaDialog>) => tombolKaki(d).map((b) => `${b.aksi}${b.aktif ? "" : "(nonaktif)"}`);

describe("tombol kaki Langkah 1 (P-27)", () => {
  it("Tutup, Petunjuk, lalu Kunci jawaban; Situasi di antara Tutup dan Petunjuk di tampilan pilihan; tanpa Petunjuk bila dimatikan", () => {
    const d = bukaDialog(TERBUKA, 2, false, T, 1);
    expect(aksi(d)).toEqual(["tutup", "petunjuk", "kunci(nonaktif)"]);
    const ringkas = pindah(bukaDialog(TERBUKA, 2, true, T, 1), "lihat", lewat);
    expect(ringkas.tampilan).toBe("pilihan1");
    expect(aksi(ringkas)).toEqual(["tutup", "situasi", "petunjuk", "kunci(nonaktif)"]);
    expect(aksi(bukaDialog(TERBUKA, 2, true, T, 1))).toEqual(["tutup", "lihat"]);
    expect(aksi(bukaDialog(TERBUKA, 2, false, T, null))).toEqual(["tutup", "kunci(nonaktif)"]);
    expect(aksi(bukaDialog(TERBUKA, 2, false, T, 0))).toEqual(["tutup", "petunjuk(nonaktif)", "kunci(nonaktif)"]);
    // Langkah 2 tidak punya tombol Petunjuk.
    const l2 = terimaHasil1(kunci(pilih(d, "cccccccc", lewat), lewat).d, H1, lewat);
    expect(tombolKaki(pindah(l2, "lanjut2", lewat + 1000)).map((b) => b.aksi)).not.toContain("petunjuk");
  });

  it("menunggu petunjuk: Petunjuk dan Kunci jawaban nonaktif, tidak bisa dikunci, sampai petunjuk tiba atau 2 detik berlalu", () => {
    const d = pilih(bukaDialog(TERBUKA, 2, false, T, 2), "bbbbbbbb", lewat);
    expect(tekanPetunjuk(bukaDialog(TERBUKA, 2, false, T, 2), T + 100)).toBeNull(); // masa tunggu 600 ms
    const tunggu = tekanPetunjuk(d, lewat)!;
    expect(tunggu.petunjuk?.menunggu).toBe(lewat);
    expect(aksi(tunggu)).toEqual(["tutup", "petunjuk(nonaktif)", "kunci(nonaktif)"]);
    expect(kunci(tunggu, lewat + 10).pesan).toBeNull();
    expect(tekanPetunjuk(tunggu, lewat + 10)).toBeNull();
    const lepas = aturPetunjuk(tunggu, { menunggu: 0 });
    expect(aksi(lepas)).toEqual(["tutup", "petunjuk", "kunci"]);
    expect(tekanPetunjuk(bukaDialog(TERBUKA, 2, false, T, 0), lewat)).toBeNull();
    expect(tekanPetunjuk(bukaDialog(TERBUKA, 2, false, T, null), lewat)).toBeNull();
  });
});

describe("petunjuk dan pilihan yang dicoret (P-29, P-30)", () => {
  it("pilihan yang dicoret ditolak pilih dan pilihNomor, dilepas bila sedang terpilih, dan tombol menjadi Petunjuk dipakai", () => {
    const d = pilih(bukaDialog(TERBUKA, 2, false, T, 2), "aaaaaaaa", lewat);
    expect(d.pilihan1).toBe("aaaaaaaa");
    const tunggu = tekanPetunjuk(d, lewat)!;
    const baru = terimaPetunjuk(tunggu, PET);
    expect(baru.pilihan1).toBeNull();
    expect(baru.petunjuk).toEqual({ muatan: 2, menunggu: 0, kalimat: PET.kalimat, dicoret: "aaaaaaaa" });
    expect(dicoret(baru, "aaaaaaaa")).toBe(true);
    expect(pilih(baru, "aaaaaaaa", lewat + 100).pilihan1).toBeNull();
    expect(pilihNomor(baru, 1, lewat + 100).pilihan1).toBeNull();
    expect(pilihNomor(baru, 2, lewat + 100).pilihan1).toBe("bbbbbbbb");
    expect(aksi(aturPetunjuk(baru, { muatan: 1 }))).toEqual(["tutup", "petunjuk(nonaktif)", "kunci(nonaktif)"]);
    expect(fokusAwal(baru)).toBe("pilihan");
    // Pilihan lain yang terpilih tetap.
    const lain = terimaPetunjuk(tekanPetunjuk(pilih(bukaDialog(TERBUKA, 2, false, T, 1), "dddddddd", lewat), lewat)!, PET);
    expect(lain.pilihan1).toBe("dddddddd");
  });

  it("petunjuk untuk kejadian lain, sesudah Langkah 1 dikunci, dengan pilihan asing, atau saat Petunjuk dimatikan diabaikan", () => {
    const d = bukaDialog(TERBUKA, 2, false, T, 1);
    expect(terimaPetunjuk(d, { ...PET, kejadianId: "K-14" })).toBe(d);
    expect(terimaPetunjuk(d, { ...PET, opsiDicoret: "zzzzzzzz" })).toBe(d);
    const terkunci = terimaHasil1(kunci(pilih(d, "cccccccc", lewat), lewat).d, H1, lewat);
    expect(terimaPetunjuk(terkunci, PET)).toBe(terkunci);
    const mati = bukaDialog(TERBUKA, 2, false, T, null);
    expect(terimaPetunjuk(mati, PET)).toBe(mati);
  });

  it("petunjuk yang dikirim ulang untuk dialog yang sama memberi keadaan yang sama, tanpa muatan berkurang", () => {
    const baru = terimaPetunjuk(tekanPetunjuk(bukaDialog(TERBUKA, 2, false, T, 2), lewat)!, PET);
    expect(terimaPetunjuk(baru, PET)).toEqual(baru);
    // Dibuka lagi sebelum Langkah 1 dikunci: kejadian_terbuka lalu petunjuk.
    const ulang = terimaPetunjuk(bukaDialog(TERBUKA, 2, false, T + 5000, 1), PET);
    expect(ulang.petunjuk).toEqual({ muatan: 1, menunggu: 0, kalimat: PET.kalimat, dicoret: "aaaaaaaa" });
  });
});

describe("pratinjau Petunjuk (P-44, D-3a; AC-17)", () => {
  const ISI = (JSON.parse(readFileSync(new URL("../../../../server/jejak-setara/seed/bank-awal.json", import.meta.url), "utf8")) as { kejadian: IsiKejadian[] }).kejadian[0];

  it("muatan tiruan 2; Petunjuk mencoret pilihan keliru pertama menurut urutan asli dan memakai kalimat isi", () => {
    expect(MUATAN_PETUNJUK_PRATINJAU).toBe(2);
    const keliru = ISI.langkah1.opsi.find((o) => !o.benar)!;
    expect(petunjukPratinjau(ISI)).toEqual({ kejadianId: "pratinjau", kalimat: ISI.langkah1.petunjuk, opsiDicoret: keliru.id });
    const d = bukaDialog(pesanTerbuka(ISI), 1, false, T, MUATAN_PETUNJUK_PRATINJAU);
    const pakai = aturPetunjuk(terimaPetunjuk(tekanPetunjuk(d, lewat)!, petunjukPratinjau(ISI)), { muatan: 1 });
    expect(pakai.petunjuk).toMatchObject({ dicoret: keliru.id, kalimat: ISI.langkah1.petunjuk });
  });

  it("kalimat kosong: pilihan tetap dicoret tanpa kalimat; pilihan benar tidak pernah dicoret", () => {
    const kosong = { ...ISI, langkah1: { ...ISI.langkah1, petunjuk: "  " } };
    const p = petunjukPratinjau(kosong);
    expect(p.kalimat).toBe("");
    expect(ISI.langkah1.opsi.find((o) => o.id === p.opsiDicoret)?.benar).toBe(false);
    const d = terimaPetunjuk(tekanPetunjuk(bukaDialog(pesanTerbuka(kosong), 1, false, T, 2), lewat)!, p);
    expect(d.petunjuk).toMatchObject({ kalimat: "", dicoret: p.opsiDicoret });
  });
});
