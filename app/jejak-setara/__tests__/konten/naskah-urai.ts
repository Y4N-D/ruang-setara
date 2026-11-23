// Pembantu uji konten JS-05 (bukan berkas uji): pengurai naskah K-xx.md dan tabel NASKAH.md, pembaca bank
// awal, dan daftar kunci aset yang Disetujui. Bentuk yang tidak dikenali menjadi galat yang menyebut berkas
// dan bagiannya, agar perubahan format naskah langsung ketahuan. Sejak semai tambahan (spesifikasi
// JS-05-semai-tambahan, P-23) juga untuk naskah di naskah/tambahan/, NASKAH-TAMBAHAN.md, dan bank tambahan.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PANJANG_KONTEN, type BankAwal } from "../../inti/konten/skema";
import type { Tingkat, ZonaId } from "../../inti/tipe";

/** Folder akar repositori. */
export const AKAR = fileURLToPath(new URL("../../../../", import.meta.url));
export const jalurRepo = (...bagian: string[]) => join(AKAR, ...bagian);
/** Isi berkas teks repositori; akhir baris Windows disamakan. */
export const bacaRepo = (jalur: string) => readFileSync(jalurRepo(jalur), "utf8").replace(/\r\n/g, "\n");

export const FOLDER_NASKAH = "docs/jejak-setara/naskah";
export const JALUR_BANK = "server/jejak-setara/seed/bank-awal.json";
/** Naskah tambahan K-17 sampai K-40 dan bank tambahannya (spesifikasi JS-05-semai-tambahan, P-23). */
export const FOLDER_NASKAH_TAMBAHAN = "docs/jejak-setara/naskah/tambahan";
export const JALUR_BANK_TAMBAHAN = "server/jejak-setara/seed/bank-tambahan-1.json";

export interface BarisLangkah1 {
  teks: string;
  benar: boolean;
  umpanBalik: string;
}
export interface BarisLangkah2 {
  teks: string;
  tingkat: Tingkat;
  terjadi: string;
}
export interface NaskahTerurai {
  kode: string;
  judul: string;
  zona: ZonaId;
  topik: string;
  jenis: "pelanggaran_hak" | "pengabaian_kewajiban" | "keduanya";
  situasi: string;
  langkah1: { pertanyaan: string; baris: BarisLangkah1[]; petunjuk: string };
  langkah2: { pertanyaan: string; baris: BarisLangkah2[] };
  kartu: { hak: string; kewajiban: string };
  rujukan: { id: string; teks: string; padanan: string }[];
  panjang: { bagian: string; karakter: number; batas: number }[];
}

const TINGKAT: Record<string, Tingkat> = { Tepat: "tepat", "Kurang tepat": "kurang", Berisiko: "berisiko" };
const JENIS: Record<string, NaskahTerurai["jenis"]> = {
  "Pelanggaran hak": "pelanggaran_hak",
  "Pengabaian kewajiban": "pengabaian_kewajiban",
  Keduanya: "keduanya",
};

/** Bagian-bagian "## …" sebuah dokumen Markdown. */
function bagian(teks: string): Map<string, string> {
  const hasil = new Map<string, string>();
  for (const potong of teks.split(/^## /m).slice(1)) {
    const akhirJudul = potong.indexOf("\n");
    hasil.set(potong.slice(0, akhirJudul).trim(), potong.slice(akhirJudul + 1).trim());
  }
  return hasil;
}

/** Baris tabel Markdown (tanpa baris pemisah), setiap sel dipangkas. */
export function tabel(isi: string): string[][] {
  return isi
    .split("\n")
    .filter((b) => b.startsWith("|"))
    .map((b) => b.slice(1, b.lastIndexOf("|")).split("|").map((s) => s.trim()))
    .filter((sel) => !sel.every((s) => /^:?-+:?$/.test(s) || s === ""));
}

function salah(berkas: string, apa: string): never {
  throw new Error(`${berkas}: ${apa}`);
}

/** Urai satu naskah, misalnya uraiNaskah("K-13"). */
export function uraiNaskah(kode: string, folder: string = FOLDER_NASKAH): NaskahTerurai {
  const berkas = `${folder}/${kode}.md`;
  const teks = bacaRepo(berkas);
  const judul = new RegExp(`^# ${kode} — (.+)$`, "m").exec(teks)?.[1] ?? salah(berkas, "baris judul tidak ditemukan");
  const b = bagian(teks);
  const wajib = (nama: string) => b.get(nama) ?? salah(berkas, `bagian "${nama}" tidak ada`);

  const ringkasan = new Map(tabel(wajib("Ringkasan")).map(([k, v]) => [k, v]));
  const zona = /^Z([1-8]) /.exec(ringkasan.get("Zona") ?? "")?.[1] ?? salah(berkas, "baris Zona tidak terbaca");
  const jenis = JENIS[ringkasan.get("Jenis") ?? ""] ?? salah(berkas, "baris Jenis tidak dikenal");
  const topik = ringkasan.get("Topik") ?? salah(berkas, "baris Topik tidak ada");

  const situasiIsi = wajib("Situasi");
  if (/\n\s*\n/.test(situasiIsi) || /^Versi /.test(situasiIsi)) salah(berkas, "situasi harus satu paragraf tanpa versi");
  const situasi = situasiIsi.replace(/\s*\n\s*/g, " ");

  const pertanyaan = (isi: string, nama: string) => /^Pertanyaan: (.+)$/m.exec(isi)?.[1].trim() ?? salah(berkas, `pertanyaan ${nama} tidak ada`);
  const l1 = wajib("Langkah 1 — Kenali");
  const baris1 = tabel(l1);
  if (baris1[0]?.join("|") !== "Pilihan|Benar|Umpan balik") salah(berkas, "kepala tabel Langkah 1 berubah");
  const l2 = wajib("Langkah 2 — Bertindak");
  const baris2 = tabel(l2);
  if (baris2[0]?.join("|") !== "Pilihan|Tingkat|Yang terjadi") salah(berkas, "kepala tabel Langkah 2 berubah");

  const kartu = new Map(tabel(wajib("Kartu dampak")).map(([k, v]) => [k, v]));
  const rujukan = tabel(wajib("Rujukan (perlu verifikasi)"));
  if (rujukan[0]?.slice(0, 3).join("|") !== "JR|Teks rujukan|Padanan Sehari") salah(berkas, "kepala tabel rujukan berubah");
  const panjang = tabel(wajib("Pemeriksaan panjang"));
  if (panjang[0]?.join("|") !== "Bagian|Karakter|Batas|Hasil") salah(berkas, "kepala tabel Pemeriksaan panjang berubah");

  return {
    kode,
    judul,
    zona: `z${zona}` as ZonaId,
    topik,
    jenis,
    situasi,
    langkah1: {
      pertanyaan: pertanyaan(l1, "Langkah 1"),
      baris: baris1.slice(1).map(([teks, benar, umpanBalik]) => ({ teks, benar: benar === "Ya", umpanBalik })),
      petunjuk: wajib("Petunjuk").replace(/\s*\n\s*/g, " "),
    },
    langkah2: {
      pertanyaan: pertanyaan(l2, "Langkah 2"),
      baris: baris2.slice(1).map(([teks, tingkat, terjadi]) => ({ teks, tingkat: TINGKAT[tingkat] ?? salah(berkas, `tingkat "${tingkat}"`), terjadi })),
    },
    kartu: {
      hak: kartu.get("Hak yang terdampak") ?? salah(berkas, "hak yang terdampak tidak ada"),
      kewajiban: kartu.get("Kewajiban terkait") ?? salah(berkas, "kewajiban terkait tidak ada"),
    },
    rujukan: rujukan.slice(1).map(([id, teks, padanan]) => ({ id, teks, padanan })),
    panjang: panjang.slice(1).map(([nama, karakter, batas]) => ({ bagian: nama, karakter: Number(karakter), batas: Number(batas) })),
  };
}

/** Semua naskah K-xx.md di folder naskah, berurutan kode. */
export function semuaNaskah(): NaskahTerurai[] {
  return readdirSync(jalurRepo(FOLDER_NASKAH))
    .filter((n) => /^K-\d{2,3}\.md$/.test(n))
    .sort()
    .map((n) => uraiNaskah(n.slice(0, -3)));
}

export interface IsiNaskahMd {
  pustaka: { id: string; teks: string; dokumen: string; padanan: string; dipakaiDi: string[] }[];
  dokumen: Map<string, string>;
  setTokoh: Map<string, { zona: string; kunci: string[] }>;
  latar: { zona: string; latarNaskah: string; kebutuhan: string }[];
}

/** Tabel pustaka rujukan, dokumen sumber, serta set tokoh dan latar titik di NASKAH.md. */
export function uraiNaskahMd(): IsiNaskahMd {
  const berkas = `${FOLDER_NASKAH}/NASKAH.md`;
  const b = bagian(bacaRepo(berkas));
  const pustakaIsi = b.get("Pustaka rujukan") ?? salah(berkas, 'bagian "Pustaka rujukan" tidak ada');
  const [daftar, dokumenIsi] = pustakaIsi.split("### Dokumen sumber");
  if (dokumenIsi === undefined) salah(berkas, 'bagian "Dokumen sumber" tidak ada');
  const setIsi = b.get("Set tokoh dan latar titik (bank awal)") ?? salah(berkas, 'bagian "Set tokoh dan latar titik (bank awal)" tidak ada');
  const tabelSet = tabel(setIsi);
  return {
    pustaka: tabel(daftar)
      .filter((r) => /^JR-\d{2,3}$/.test(r[0]))
      .map(([id, teks, dokumen, padanan, dipakai]) => ({ id, teks, dokumen, padanan, dipakaiDi: dipakai.split(/,\s*/) })),
    dokumen: new Map(tabel(dokumenIsi).filter((r) => r[0] !== "Dokumen").map(([nama, tautan]) => [nama, tautan])),
    setTokoh: new Map(
      tabelSet.filter((r) => /^K-\d{2,3}$/.test(r[0])).map(([kode, zona, kunci]) => [kode, { zona, kunci: [...kunci.matchAll(/`([^`]+)`/g)].map((m) => m[1]) }]),
    ),
    latar: tabelSet.filter((r) => /^Z[1-8]$/.test(r[0])).map(([zona, latarNaskah, kebutuhan]) => ({ zona, latarNaskah, kebutuhan })),
  };
}

/** Teks mentah dan isi berkas bank awal. */
export function bacaBankAwal(): { teks: string; bank: BankAwal } {
  const teks = readFileSync(jalurRepo(JALUR_BANK), "utf8");
  return { teks, bank: JSON.parse(teks) as BankAwal };
}

/** Teks mentah dan isi berkas bank tambahan (bentuknya sama dengan bank awal). */
export function bacaBankTambahan(): { teks: string; bank: BankAwal } {
  const teks = readFileSync(jalurRepo(JALUR_BANK_TAMBAHAN), "utf8");
  return { teks, bank: JSON.parse(teks) as BankAwal };
}

export interface IsiNaskahTambahanMd {
  kejadian: { kode: string; zona: string; judul: string; status: string; berkas: string }[];
  setTokoh: Map<string, { zona: string; kunci: string[]; sel: string }>;
  pustaka: { id: string; teks: string; dokumen: string; padanan: string; dipakaiDi: string[] }[];
  sumberCatatan: Map<string, { sumber: string; catatan: string }>;
}

/** Periksa kepala tabel, lalu kembalikan baris isinya. */
function isiTabel(berkas: string, isi: string, kepala: string): string[][] {
  const baris = tabel(isi);
  if (baris[0]?.join("|") !== kepala) salah(berkas, `kepala tabel "${kepala.split("|")[0]} …" berubah`);
  return baris.slice(1);
}

/** Tabel kejadian, set tokoh, pustaka, serta sumber dan catatan di naskah/tambahan/NASKAH-TAMBAHAN.md. */
export function uraiNaskahTambahanMd(): IsiNaskahTambahanMd {
  const berkas = `${FOLDER_NASKAH_TAMBAHAN}/NASKAH-TAMBAHAN.md`;
  const b = bagian(bacaRepo(berkas));
  const wajib = (nama: string) => b.get(nama) ?? salah(berkas, `bagian "${nama}" tidak ada`);
  const pustakaIsi = wajib("Pustaka rujukan tambahan");
  const [daftar, ...sub] = pustakaIsi.split(/^### /m);
  const sumberIsi = sub.find((x) => x.startsWith("Sumber dan catatan untuk pustaka konsol")) ?? salah(berkas, 'bagian "Sumber dan catatan untuk pustaka konsol" tidak ada');
  return {
    kejadian: isiTabel(berkas, wajib("Kejadian"), "Kode|Zona|Judul|Giliran|Status|Berkas").map(([kode, zona, judul, , status, tautan]) => ({ kode, zona, judul, status, berkas: tautan })),
    setTokoh: new Map(
      isiTabel(berkas, wajib("Set tokoh dan latar titik"), "Kode|Zona|Kunci `setTokoh`|Latar di naskah|Catatan").map(([kode, zona, kunci]) => [
        kode,
        { zona, kunci: [...kunci.matchAll(/`([^`]+)`/g)].map((m) => m[1]), sel: kunci },
      ]),
    ),
    pustaka: isiTabel(berkas, daftar, "JR|Teks rujukan|Dokumen sumber|Padanan Sehari|Dipakai di|Pra-pemeriksaan agen|Status").map(([id, teks, dokumen, padanan, dipakai]) => ({
      id,
      teks,
      dokumen,
      padanan,
      dipakaiDi: dipakai.split(/,\s*/),
    })),
    sumberCatatan: new Map(isiTabel(berkas, sumberIsi, "JR|Sumber|Catatan untuk Peninjau").map(([id, sumber, catatan]) => [id, { sumber, catatan }])),
  };
}

const TINGKAT_BAGIAN: Record<string, Tingkat> = { berisiko: "berisiko", tepat: "tepat", "kurang tepat": "kurang" };

/**
 * Panjang dan batas satu baris tabel "Pemeriksaan panjang" naskah, dihitung ulang dari isi naskah, atau null
 * bila nama bagiannya tidak dikenali. Sama dengan hitungan di uji naskah-cocok bank awal.
 */
export function nilaiBagianPanjang(n: NaskahTerurai, bagian: string): { panjang: number; batas: number } | null {
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

/**
 * Kunci aset yang boleh dipakai set tokoh sebelum manifest ada (usulan 5a): nama berkas PNG di
 * assets/npc/ dan assets/obj/ tanpa `.png`, yang tercatat "disetujui" di CREDITS.md. Bagian atas objek
 * dua bagian (`…_atas`) tidak termasuk.
 */
export function kunciAsetDisetujui(): Set<string> {
  const kredit = bacaRepo("app/jejak-setara/assets/CREDITS.md").split("\n");
  const hasil = new Set<string>();
  for (const folder of ["npc", "obj"]) {
    for (const nama of readdirSync(jalurRepo("app/jejak-setara/assets", folder))) {
      if (!nama.endsWith(".png") || nama.endsWith("_atas.png")) continue;
      const jalur = `${folder}/${nama}`;
      if (kredit.some((baris) => baris.includes(`\`${jalur}\``) && /disetujui/i.test(baris))) hasil.add(nama.slice(0, -4));
    }
  }
  return hasil;
}
