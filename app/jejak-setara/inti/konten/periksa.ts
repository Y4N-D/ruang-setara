// Pemeriksaan konten Jejak Setara (Architecture 5.4; spesifikasi JS-05). Menjalankan skema di skema.ts,
// lalu aturan yang tidak bisa ditulis sebagai skema, dan mengembalikan temuan berkode tetap. Bank awal
// (content:check:jejak) dan konsol (JS-12) memakai fungsi yang sama. `pesan` ditujukan kepada pengembang;
// kalimat yang tampil di konsol ditetapkan di JS-12.
import type { ZodIssue } from "zod";
import type { ZonaId } from "../tipe";
import { BATAS_KONTEN, skemaBankAwal, skemaIsiKejadian } from "./skema";

export const KODE_TEMUAN = [
  // dari skema
  "BENTUK",
  "KOLOM_ASING",
  "TEKS_KOSONG",
  "TEKS_PANJANG",
  "TEKS_POLOS",
  "FORMAT",
  "JUMLAH",
  "NILAI",
  // aturan satu kejadian
  "SITUASI_KALIMAT",
  "OPSI_BENAR",
  "OPSI_TEPAT",
  "OPSI_ID",
  "OPSI_KEMBAR",
  "PETUNJUK_MENYALIN",
  "RUJUKAN_TIDAK_ADA",
  "RUJUKAN_KEMBAR",
  "SET_TOKOH_KEMBAR",
  "SET_TOKOH_TIDAK_ADA",
  "KAPITAL_TENGAH",
  // aturan bank dan paket
  "KODE_KEMBAR",
  "RUJUKAN_ID_KEMBAR",
  "RUJUKAN_BERSTATUS",
  "RUJUKAN_TIDAK_DIPAKAI",
  "PAKET_NAMA_KEMBAR",
  "PAKET_KEJADIAN_TIDAK_ADA",
  "PAKET_KEJADIAN_KEMBAR",
  "PAKET_TITIK_KURANG",
] as const;
export type KodeTemuan = (typeof KODE_TEMUAN)[number];

/** Temuan yang hanya peringatan; semua kode lain adalah galat. */
export const KODE_PERINGATAN: readonly KodeTemuan[] = ["KAPITAL_TENGAH", "RUJUKAN_TIDAK_DIPAKAI"];

export interface Temuan {
  kode: KodeTemuan;
  tingkat: "galat" | "peringatan";
  letak: string; // misalnya "K-03/langkah1.opsi.2.teks", "JR-04/catatan", "paket[0]/kejadian.5"
  pesan: string;
}

export interface KonteksKejadian {
  rujukan: ReadonlySet<string>; // id rujukan yang ada di pustaka
  kunciAset?: ReadonlySet<string>; // kunci aset yang ada; bila tidak diberikan, kunci tidak dicocokkan
}

/**
 * Nama diri dan sapaan yang boleh berhuruf kapital di tengah kalimat. Singkatan berhuruf besar semua
 * (SD, SMP, HP, PR, VII) dikenali sendiri.
 */
export const NAMA_DIRI: ReadonlySet<string> = new Set([
  "Bapak",
  "Bayu",
  "Bu",
  "Dimas",
  "Gita",
  "Ibu",
  "Komang",
  "Made",
  "Nara",
  "Nenek",
  "Pak",
  "Raka",
  "Ratih",
  "Sinta",
  "Wayan",
]);

// ---------------------------------------------------------------------------------------------
// Fungsi teks

const POLA_AKHIR_KALIMAT = /[.!?]+[”"’)]*(?=\s|$)/g;

/** Jumlah kalimat: tanda . ! atau ? (boleh berulang dan diikuti tanda petik atau kurung tutup) sebelum spasi atau akhir teks. */
export function hitungKalimat(teks: string): number {
  return (teks.match(POLA_AKHIR_KALIMAT) ?? []).length;
}

/** Potongan sama terpanjang dari dua teks, tanpa membedakan huruf besar dan kecil; diambil dari teks pertama. */
export function potonganSamaTerpanjang(a: string, b: string): string {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  let terpanjang = 0;
  let akhir = 0;
  let baris = new Array<number>(y.length + 1).fill(0);
  for (let i = 1; i <= x.length; i++) {
    const kini = new Array<number>(y.length + 1).fill(0);
    for (let j = 1; j <= y.length; j++) {
      if (x[i - 1] === y[j - 1]) {
        kini[j] = baris[j - 1] + 1;
        if (kini[j] > terpanjang) {
          terpanjang = kini[j];
          akhir = i;
        }
      }
    }
    baris = kini;
  }
  return a.slice(akhir - terpanjang, akhir);
}

/**
 * Kata berhuruf kapital yang tidak di awal kalimat, bukan awal kutipan, bukan singkatan, dan tidak ada di
 * NAMA_DIRI. Awal kalimat: kata pertama teks, atau kata sesudah tanda . ! atau ?.
 */
export function kataKapitalTengah(teks: string): string[] {
  const hasil: string[] = [];
  let awalKalimat = true;
  for (const kasar of teks.split(/\s+/)) {
    if (kasar === "") continue;
    const awalKutipan = /^[“"‘(]/.test(kasar);
    const kata = kasar.replace(/^[“"‘(]+/, "").replace(/[”"’),.!?;:]+$/, "");
    const hurufDepan = kata.split("-")[0].replace(/[^A-Za-z]/g, "");
    const singkatan = hurufDepan !== "" && hurufDepan === hurufDepan.toUpperCase();
    if (!awalKalimat && !awalKutipan && /^[A-Z]/.test(kata) && !singkatan && !NAMA_DIRI.has(kata)) hasil.push(kata);
    awalKalimat = /[.!?][”"’)]*$/.test(kasar);
  }
  return hasil;
}

// ---------------------------------------------------------------------------------------------
// Pembantu

type Rekaman = Record<string, unknown>;
const rekaman = (x: unknown): x is Rekaman => typeof x === "object" && x !== null && !Array.isArray(x);
const larik = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);
const teksAtau = (x: unknown): string | undefined => (typeof x === "string" ? x : undefined);
const ambil = (x: unknown, ...jalur: (string | number)[]): unknown => {
  let kini = x;
  for (const kunci of jalur) {
    if (typeof kunci === "number") kini = Array.isArray(kini) ? kini[kunci] : undefined;
    else kini = rekaman(kini) ? kini[kunci] : undefined;
  }
  return kini;
};
const kembar = (daftar: readonly string[]): string[] => [...new Set(daftar.filter((x, i) => daftar.indexOf(x) !== i))];

function temuan(kode: KodeTemuan, letak: string, pesan: string): Temuan {
  return { kode, tingkat: KODE_PERINGATAN.includes(kode) ? "peringatan" : "galat", letak, pesan };
}

function kodeDariZod(isu: ZodIssue): KodeTemuan {
  switch (isu.code) {
    case "unrecognized_keys":
      return "KOLOM_ASING";
    case "too_small":
      return isu.type === "string" ? "TEKS_KOSONG" : isu.type === "array" ? "JUMLAH" : "NILAI";
    case "too_big":
      return isu.type === "string" ? "TEKS_PANJANG" : isu.type === "array" ? "JUMLAH" : "NILAI";
    case "invalid_string":
      return "FORMAT";
    case "invalid_enum_value":
    case "invalid_literal":
      return "NILAI";
    case "custom": {
      const kode = isu.params?.kode;
      return typeof kode === "string" && (KODE_TEMUAN as readonly string[]).includes(kode) ? (kode as KodeTemuan) : "BENTUK";
    }
    default:
      return "BENTUK";
  }
}

function pesanDariZod(isu: ZodIssue, nilai: unknown): string {
  switch (isu.code) {
    case "invalid_type":
      return isu.received === "undefined" ? "Kolom wajib tidak ada." : `Jenis data ${isu.received}, seharusnya ${isu.expected}.`;
    case "unrecognized_keys":
      return `Kolom tidak dikenal: ${isu.keys.join(", ")}.`;
    case "too_small":
      if (isu.type === "string") return "Teks kosong.";
      return `Jumlah ${larik(nilai).length}, paling sedikit ${isu.minimum}.`;
    case "too_big":
      if (isu.type === "string") return `Teks ${teksAtau(nilai)?.length ?? "?"} karakter, batasnya ${isu.maximum}.`;
      return `Jumlah ${larik(nilai).length}, paling banyak ${isu.maximum}.`;
    case "invalid_enum_value":
      return `Nilai "${String(isu.received)}" tidak dikenal; pilihannya ${isu.options.join(", ")}.`;
    case "invalid_literal":
      return `Nilai harus ${JSON.stringify(isu.expected)}.`;
    default:
      return isu.message;
  }
}

/** Letak di dalam kejadian: kode bila sah, atau nomor urutnya. */
function namaKejadian(isi: unknown, urutan?: number): string {
  const kode = ambil(isi, "kode");
  if (typeof kode === "string" && /^K-\d{2,3}$/.test(kode)) return kode;
  return urutan === undefined ? "kejadian" : `kejadian[${urutan}]`;
}

const sambung = (awalan: string, jalur: readonly (string | number)[]) => `${awalan}/${jalur.join(".")}`;

// ---------------------------------------------------------------------------------------------
// Aturan satu kejadian (dijalankan pada data mentah, sehingga tetap berjalan bila skema gagal)

const BIDANG_TEKS: readonly (readonly (string | number)[])[] = [
  ["judul"],
  ["situasi"],
  ["langkah1", "pertanyaan"],
  ...[0, 1, 2, 3].flatMap((i) => [
    ["langkah1", "opsi", i, "teks"],
    ["langkah1", "opsi", i, "umpanBalik"],
  ]),
  ["langkah1", "petunjuk"],
  ["langkah2", "pertanyaan"],
  ...[0, 1, 2].flatMap((i) => [
    ["langkah2", "opsi", i, "teks"],
    ["langkah2", "opsi", i, "terjadi"],
  ]),
  ["kartu", "hak"],
  ["kartu", "kewajiban"],
  ["topik"],
];

function aturanKejadian(isi: unknown, awalan: string, konteks: KonteksKejadian): Temuan[] {
  const hasil: Temuan[] = [];
  if (!rekaman(isi)) return hasil;

  const situasi = teksAtau(isi.situasi);
  if (situasi !== undefined && situasi !== "") {
    const n = hitungKalimat(situasi);
    if (n < BATAS_KONTEN.kalimatSituasiMin || n > BATAS_KONTEN.kalimatSituasiMaks) {
      hasil.push(temuan("SITUASI_KALIMAT", sambung(awalan, ["situasi"]), `Situasi ${n} kalimat; seharusnya 1–3 kalimat yang diakhiri tanda titik, tanya, atau seru.`));
    }
  }

  const opsi1 = larik(ambil(isi, "langkah1", "opsi")).filter(rekaman);
  const opsi2 = larik(ambil(isi, "langkah2", "opsi")).filter(rekaman);
  const benar = opsi1.filter((o) => o.benar === true);
  if (opsi1.length > 0 && benar.length !== 1) {
    hasil.push(temuan("OPSI_BENAR", sambung(awalan, ["langkah1", "opsi"]), `${benar.length} pilihan benar; seharusnya tepat satu.`));
  }
  if (opsi2.length > 0 && !opsi2.some((o) => o.tingkat === "tepat")) {
    hasil.push(temuan("OPSI_TEPAT", sambung(awalan, ["langkah2", "opsi"]), "Tidak ada pilihan bertingkat tepat; seharusnya sedikitnya satu."));
  }
  const id = [...opsi1, ...opsi2].map((o) => o.id).filter((x): x is string => typeof x === "string");
  for (const x of kembar(id)) hasil.push(temuan("OPSI_ID", sambung(awalan, []), `Id pilihan "${x}" dipakai lebih dari sekali.`));
  for (const [langkah, opsi] of [["langkah1", opsi1], ["langkah2", opsi2]] as const) {
    const teks = opsi.map((o) => teksAtau(o.teks)?.trim().toLowerCase()).filter((x): x is string => x !== undefined && x !== "");
    for (const x of kembar(teks)) hasil.push(temuan("OPSI_KEMBAR", sambung(awalan, [langkah, "opsi"]), `Dua pilihan berteks sama: "${x}".`));
  }

  const petunjuk = teksAtau(ambil(isi, "langkah1", "petunjuk"));
  if (petunjuk !== undefined) {
    for (const o of benar) {
      const teks = teksAtau(o.teks);
      if (teks === undefined) continue;
      const sama = potonganSamaTerpanjang(petunjuk, teks);
      if (sama.length > BATAS_KONTEN.petunjukSalinMaks) {
        hasil.push(
          temuan("PETUNJUK_MENYALIN", sambung(awalan, ["langkah1", "petunjuk"]), `Petunjuk menyalin ${sama.length} karakter pilihan benar ("${sama}"); paling banyak ${BATAS_KONTEN.petunjukSalinMaks}.`),
        );
      }
    }
  }

  const rujukan = larik(ambil(isi, "kartu", "rujukan")).filter((x): x is string => typeof x === "string");
  for (const x of rujukan) {
    if (!konteks.rujukan.has(x)) hasil.push(temuan("RUJUKAN_TIDAK_ADA", sambung(awalan, ["kartu", "rujukan"]), `Rujukan ${x} tidak ada di pustaka.`));
  }
  for (const x of kembar(rujukan)) hasil.push(temuan("RUJUKAN_KEMBAR", sambung(awalan, ["kartu", "rujukan"]), `Rujukan ${x} disebut lebih dari sekali.`));

  const setTokoh = larik(isi.setTokoh).filter((x): x is string => typeof x === "string");
  for (const x of kembar(setTokoh)) hasil.push(temuan("SET_TOKOH_KEMBAR", sambung(awalan, ["setTokoh"]), `Kunci ${x} disebut lebih dari sekali.`));
  if (konteks.kunciAset) {
    for (const x of setTokoh) {
      if (!konteks.kunciAset.has(x)) hasil.push(temuan("SET_TOKOH_TIDAK_ADA", sambung(awalan, ["setTokoh"]), `Kunci ${x} tidak ada di daftar aset.`));
    }
  }

  for (const jalur of BIDANG_TEKS) {
    const teks = teksAtau(ambil(isi, ...jalur));
    if (teks === undefined) continue;
    const kata = kataKapitalTengah(teks);
    if (kata.length > 0) {
      hasil.push(temuan("KAPITAL_TENGAH", sambung(awalan, jalur), `Huruf kapital di tengah kalimat: ${kata.join(", ")}. Bila ini nama diri, abaikan peringatan ini.`));
    }
  }
  return hasil;
}

// ---------------------------------------------------------------------------------------------
// Pemeriksaan utama

/** Periksa satu kejadian: skema lalu aturan. Daftar kosong berarti lolos. */
export function periksaKejadian(isi: unknown, konteks: KonteksKejadian): Temuan[] {
  const awalan = namaKejadian(isi);
  const hasil: Temuan[] = [];
  const skema = skemaIsiKejadian.safeParse(isi);
  if (!skema.success) {
    for (const isu of skema.error.issues) {
      hasil.push(temuan(kodeDariZod(isu), sambung(awalan, isu.path), pesanDariZod(isu, ambil(isi, ...isu.path))));
    }
  }
  return [...hasil, ...aturanKejadian(isi, awalan, konteks)];
}

/** Periksa seluruh berkas bank awal. `kunciAset` diisi daftar aset bila tersedia. */
export function periksaBank(bank: unknown, konteks: { kunciAset?: ReadonlySet<string> } = {}): Temuan[] {
  const hasil: Temuan[] = [];
  const kejadian = larik(ambil(bank, "kejadian"));
  const rujukan = larik(ambil(bank, "rujukan"));
  const paket = larik(ambil(bank, "paket"));

  const letak = (jalur: readonly (string | number)[]): string => {
    const [bagian, urutan, ...sisa] = jalur;
    if (typeof urutan !== "number") return sambung("bank", jalur);
    if (bagian === "kejadian") return sambung(namaKejadian(kejadian[urutan], urutan), sisa);
    if (bagian === "rujukan") {
      const id = ambil(rujukan[urutan], "id");
      return sambung(typeof id === "string" && /^JR-\d{2,3}$/.test(id) ? id : `rujukan[${urutan}]`, sisa);
    }
    return sambung(`${String(bagian)}[${urutan}]`, sisa);
  };

  const skema = skemaBankAwal.safeParse(bank);
  if (!skema.success) {
    for (const isu of skema.error.issues) {
      const tempat = letak(isu.path);
      const diRujukan = isu.path.length === 2 && isu.path[0] === "rujukan";
      if (isu.code === "unrecognized_keys" && diRujukan && isu.keys.includes("status")) {
        hasil.push(temuan("RUJUKAN_BERSTATUS", tempat, "Rujukan di bank awal tidak boleh punya kolom status; semai selalu menulis status belum."));
        const lain = isu.keys.filter((k) => k !== "status");
        if (lain.length > 0) hasil.push(temuan("KOLOM_ASING", tempat, `Kolom tidak dikenal: ${lain.join(", ")}.`));
        continue;
      }
      hasil.push(temuan(kodeDariZod(isu), tempat, pesanDariZod(isu, ambil(bank, ...isu.path))));
    }
  }

  const idRujukan = rujukan.map((r) => ambil(r, "id")).filter((x): x is string => typeof x === "string");
  for (const x of kembar(idRujukan)) hasil.push(temuan("RUJUKAN_ID_KEMBAR", sambung("bank", ["rujukan"]), `Id rujukan ${x} dipakai lebih dari sekali.`));
  const kode = kejadian.map((k) => ambil(k, "kode")).filter((x): x is string => typeof x === "string");
  for (const x of kembar(kode)) hasil.push(temuan("KODE_KEMBAR", sambung("bank", ["kejadian"]), `Kode kejadian ${x} dipakai lebih dari sekali.`));

  const pustaka = new Set(idRujukan);
  kejadian.forEach((k, i) => hasil.push(...aturanKejadian(k, namaKejadian(k, i), { rujukan: pustaka, kunciAset: konteks.kunciAset })));

  const dipakai = new Set(kejadian.flatMap((k) => larik(ambil(k, "kartu", "rujukan"))));
  for (const x of idRujukan) {
    if (!dipakai.has(x)) hasil.push(temuan("RUJUKAN_TIDAK_DIPAKAI", sambung(x, []), `Rujukan ${x} tidak dipakai kejadian mana pun di bank.`));
  }

  const namaPaket = paket.map((p) => ambil(p, "nama")).filter((x): x is string => typeof x === "string");
  for (const x of kembar(namaPaket)) hasil.push(temuan("PAKET_NAMA_KEMBAR", sambung("bank", ["paket"]), `Nama paket "${x}" dipakai lebih dari sekali.`));
  const adaKode = new Set(kode);
  paket.forEach((p, i) => {
    const isiPaket = larik(ambil(p, "kejadian")).filter((x): x is string => typeof x === "string");
    for (const x of isiPaket) {
      if (!adaKode.has(x)) hasil.push(temuan("PAKET_KEJADIAN_TIDAK_ADA", sambung(`paket[${i}]`, ["kejadian"]), `Kejadian ${x} tidak ada di bank.`));
    }
    for (const x of kembar(isiPaket)) hasil.push(temuan("PAKET_KEJADIAN_KEMBAR", sambung(`paket[${i}]`, ["kejadian"]), `Kejadian ${x} disebut lebih dari sekali.`));
  });
  return hasil;
}

/** Architecture 5.4: jumlah kejadian per zona di sebuah paket tidak melebihi jumlah titik zona itu di peta. */
export function periksaPaketPeta(zonaKejadian: readonly ZonaId[], titikPerZona: Readonly<Partial<Record<ZonaId, number>>>, letak = "paket"): Temuan[] {
  const jumlah = new Map<ZonaId, number>();
  for (const z of zonaKejadian) jumlah.set(z, (jumlah.get(z) ?? 0) + 1);
  const hasil: Temuan[] = [];
  for (const [zona, n] of [...jumlah].sort(([a], [b]) => a.localeCompare(b))) {
    const titik = titikPerZona[zona] ?? 0;
    if (n > titik) hasil.push(temuan("PAKET_TITIK_KURANG", sambung(letak, [zona]), `Zona ${zona}: ${n} kejadian, tetapi hanya ${titik} titik kejadian di peta.`));
  }
  return hasil;
}

/** Benar bila ada sedikitnya satu galat (peringatan tidak menghalangi). */
export function adaGalat(daftar: readonly Temuan[]): boolean {
  return daftar.some((t) => t.tingkat === "galat");
}
