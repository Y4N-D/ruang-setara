// Uji aturan konten (spesifikasi JS-05, P-1 sampai P-18; AC-3): setiap kode temuan punya contoh cacat yang
// tertangkap, contoh sah tidak menghasilkan temuan, dan fungsi teks memberi hasil contoh spesifikasi.
import { describe, expect, it } from "vitest";
import {
  adaGalat,
  hitungKalimat,
  kataKapitalTengah,
  KODE_PERINGATAN,
  KODE_TEMUAN,
  NAMA_DIRI,
  periksaBank,
  periksaKejadian,
  periksaPaketPeta,
  potonganSamaTerpanjang,
  type KodeTemuan,
  type Temuan,
} from "../../inti/konten/periksa";
import { alasanTidakPolos, skemaIsiKejadian } from "../../inti/konten/skema";
import type { IsiKejadian, ZonaId } from "../../inti/tipe";
import { bacaBankAwal, kunciAsetDisetujui } from "./naskah-urai";

const { bank } = bacaBankAwal();
const dasar = bank.kejadian.find((k) => k.kode === "K-03") as IsiKejadian;
const konteks = { rujukan: new Set(bank.rujukan.map((r) => r.id)), kunciAset: kunciAsetDisetujui() };
const ubah = (f: (k: IsiKejadian) => void): IsiKejadian => {
  const k = structuredClone(dasar);
  f(k);
  return k;
};
const mentah = (f: (k: Record<string, unknown>) => void): unknown => {
  const k = structuredClone(dasar) as unknown as Record<string, unknown>;
  f(k);
  return k;
};
const kode = (daftar: readonly Temuan[]) => daftar.map((t) => t.kode);
const titik = (n: number): Partial<Record<ZonaId, number>> => ({ z1: n, z2: n, z3: n, z4: n, z5: n, z6: n, z7: n, z8: n });

describe("kejadian sah", () => {
  it("salinan K-03 lolos periksaKejadian tanpa temuan (P-11)", () => {
    expect(periksaKejadian(dasar, konteks)).toEqual([]);
  });
  it("skemaIsiKejadian mengembalikan data yang sama persis (P-1)", () => {
    expect(skemaIsiKejadian.parse(dasar)).toEqual(dasar);
  });
});

const CONTOH_KEJADIAN: [KodeTemuan, string, unknown][] = [
  ["BENTUK", "kolom judul dihapus", mentah((k) => delete k.judul)],
  ["BENTUK", "situasi berupa angka", mentah((k) => (k.situasi = 7))],
  ["KOLOM_ASING", "kolom status ditambahkan", mentah((k) => (k.status = "terbit"))],
  ["TEKS_KOSONG", "topik kosong", ubah((k) => (k.topik = ""))],
  ["TEKS_PANJANG", "judul 33 karakter", ubah((k) => (k.judul = "x".repeat(33)))],
  ["TEKS_POLOS", "situasi berisi tanda HTML", ubah((k) => (k.situasi = "Lihat <b>ini</b>."))],
  ["TEKS_POLOS", "situasi berisi tautan", ubah((k) => (k.situasi = "Buka https://contoh.id sekarang."))],
  ["TEKS_POLOS", "judul berspasi ganda", ubah((k) => (k.judul = "Dua  spasi"))],
  ["TEKS_POLOS", "judul berisi karakter tak terlihat", ubah((k) => (k.judul = "Tak\u200Bterlihat"))],
  ["TEKS_POLOS", "petunjuk berisi ganti baris", ubah((k) => (k.langkah1.petunjuk = "Baris satu\nbaris dua."))],
  ["FORMAT", "kode K13", ubah((k) => (k.kode = "K13"))],
  ["FORMAT", "kunci NPC_Bayu", ubah((k) => (k.setTokoh = ["NPC_Bayu"]))],
  ["FORMAT", "id pilihan x1", ubah((k) => (k.langkah1.opsi[0].id = "x1"))],
  ["FORMAT", "id rujukan R-08", ubah((k) => (k.kartu.rujukan = ["R-08"]))],
  ["JUMLAH", "tiga pilihan Langkah 1", mentah((k) => (k.langkah1 as { opsi: unknown[] }).opsi.pop())],
  ["JUMLAH", "set tokoh kosong", ubah((k) => (k.setTokoh = []))],
  ["JUMLAH", "lima kunci set tokoh", ubah((k) => (k.setTokoh = ["obj_bola", "obj_dompet", "obj_gerobak", "obj_motor", "obj_halte"]))],
  ["JUMLAH", "rujukan kosong", ubah((k) => (k.kartu.rujukan = []))],
  ["NILAI", "zona z9", mentah((k) => (k.zona = "z9"))],
  ["NILAI", "tingkat baik", mentah((k) => ((k.langkah2 as { opsi: { tingkat: string }[] }).opsi[0].tingkat = "baik"))],
  ["SITUASI_KALIMAT", "empat kalimat", ubah((k) => (k.situasi = "Satu. Dua. Tiga. Empat."))],
  ["SITUASI_KALIMAT", "tanpa tanda akhir", ubah((k) => (k.situasi = "Tanpa tanda akhir"))],
  ["OPSI_BENAR", "empat pilihan benar", ubah((k) => k.langkah1.opsi.forEach((o) => (o.benar = true)))],
  ["OPSI_BENAR", "tidak ada pilihan benar", ubah((k) => k.langkah1.opsi.forEach((o) => (o.benar = false)))],
  ["OPSI_TEPAT", "tidak ada pilihan tepat", ubah((k) => k.langkah2.opsi.forEach((o) => (o.tingkat = "kurang")))],
  ["OPSI_ID", "id pilihan kembar", ubah((k) => (k.langkah1.opsi[1].id = k.langkah1.opsi[0].id))],
  ["OPSI_KEMBAR", "teks pilihan kembar beda huruf besar", ubah((k) => (k.langkah2.opsi[1].teks = k.langkah2.opsi[0].teks.toUpperCase()))],
  [
    "PETUNJUK_MENYALIN",
    "petunjuk memuat 25 karakter pilihan benar",
    ubah((k) => (k.langkah1.petunjuk = `Ingat: ${(k.langkah1.opsi.find((o) => o.benar)?.teks ?? "").slice(0, 25)}.`)),
  ],
  ["RUJUKAN_TIDAK_ADA", "rujukan JR-99", ubah((k) => (k.kartu.rujukan = ["JR-99"]))],
  ["RUJUKAN_KEMBAR", "JR-01 dua kali", ubah((k) => (k.kartu.rujukan = ["JR-01", "JR-01"]))],
  ["SET_TOKOH_KEMBAR", "obj_bola dua kali", ubah((k) => (k.setTokoh = ["obj_bola", "obj_bola"]))],
  ["SET_TOKOH_TIDAK_ADA", "kunci aset yang tidak ada", ubah((k) => (k.setTokoh = ["npc_naga_bawah_diam"]))],
  ["KAPITAL_TENGAH", "nama di luar daftar", ubah((k) => (k.situasi = "Kamu melihat Tono di dekat kantin."))],
];

// Bank cacat: setiap baris menimbulkan satu jenis cacat bank.
const rusak = structuredClone(bank) as unknown as {
  rujukan: Record<string, unknown>[];
  kejadian: Record<string, unknown>[];
  paket: { nama: string; deskripsi: string; kejadian: string[] }[];
};
rusak.rujukan[0].status = "terverifikasi";
rusak.rujukan[1].id = rusak.rujukan[0].id;
rusak.kejadian[1].kode = rusak.kejadian[0].kode;
rusak.paket.push(structuredClone(rusak.paket[0]));
rusak.paket[0].kejadian.push("K-99", "K-01");
rusak.rujukan.push({ id: "JR-24", teks: "Pasal uji", sumber: "https://contoh.go.id/a", kodeSehari: null, catatan: "Uji." });
const TEMUAN_BANK = periksaBank(rusak, { kunciAset: konteks.kunciAset });
const TEMUAN_PETA = periksaPaketPeta(
  bank.kejadian.map((k) => k.zona),
  { ...titik(2), z3: 1 },
);

describe("contoh cacat satu kejadian (AC-3)", () => {
  for (const [harap, uraian, isi] of CONTOH_KEJADIAN) {
    it(`${harap}: ${uraian}`, () => {
      const temuan = periksaKejadian(isi, konteks);
      expect(kode(temuan)).toContain(harap);
      for (const t of temuan) expect(t.tingkat, t.kode).toBe(KODE_PERINGATAN.includes(t.kode) ? "peringatan" : "galat");
    });
  }

  it("aturan tetap berjalan walaupun skema gagal (P-12)", () => {
    const isi = ubah((k) => {
      k.judul = "x".repeat(40);
      k.langkah1.opsi.forEach((o) => (o.benar = true));
    });
    expect(kode(periksaKejadian(isi, konteks))).toEqual(["TEKS_PANJANG", "OPSI_BENAR"]);
  });

  it("letak memakai kode kejadian dan jalur kolom (P-15)", () => {
    expect(periksaKejadian(mentah((k) => delete k.judul), konteks)).toEqual([{ kode: "BENTUK", tingkat: "galat", letak: "K-03/judul", pesan: "Kolom wajib tidak ada." }]);
    expect(periksaKejadian(ubah((k) => (k.judul = "x".repeat(33))), konteks)[0]).toEqual({
      kode: "TEKS_PANJANG",
      tingkat: "galat",
      letak: "K-03/judul",
      pesan: "Teks 33 karakter, batasnya 32.",
    });
    expect(periksaKejadian(ubah((k) => (k.kode = "K13")), konteks)[0].letak).toBe("kejadian/kode");
    expect(periksaKejadian(ubah((k) => (k.langkah1.opsi[1].id = k.langkah1.opsi[0].id)), konteks)[0].letak).toBe("K-03/");
  });

  it("tanpa daftar aset, kunci set tokoh tidak dicocokkan", () => {
    const isi = ubah((k) => (k.setTokoh = ["npc_naga_bawah_diam"]));
    expect(periksaKejadian(isi, { rujukan: konteks.rujukan })).toEqual([]);
  });
});

describe("contoh cacat bank (P-14)", () => {
  const temuan = TEMUAN_BANK;

  for (const harap of ["KODE_KEMBAR", "RUJUKAN_ID_KEMBAR", "RUJUKAN_BERSTATUS", "RUJUKAN_TIDAK_DIPAKAI", "PAKET_NAMA_KEMBAR", "PAKET_KEJADIAN_TIDAK_ADA", "PAKET_KEJADIAN_KEMBAR"] as const) {
    it(`${harap} tertangkap`, () => {
      expect(kode(temuan)).toContain(harap);
    });
  }

  it("kolom status rujukan dilaporkan sekali, bukan juga KOLOM_ASING", () => {
    expect(temuan.filter((t) => t.kode === "RUJUKAN_BERSTATUS")).toEqual([
      { kode: "RUJUKAN_BERSTATUS", tingkat: "galat", letak: "JR-01/", pesan: "Rujukan di bank awal tidak boleh punya kolom status; semai selalu menulis status belum." },
    ]);
    expect(kode(temuan)).not.toContain("KOLOM_ASING");
  });

  it("rujukan tidak dipakai hanya peringatan", () => {
    expect(temuan.find((t) => t.kode === "RUJUKAN_TIDAK_DIPAKAI")).toEqual({
      kode: "RUJUKAN_TIDAK_DIPAKAI",
      tingkat: "peringatan",
      letak: "JR-24/",
      pesan: "Rujukan JR-24 tidak dipakai kejadian mana pun di bank.",
    });
  });

  it("bank yang bukan objek ditolak tanpa galat program", () => {
    expect(kode(periksaBank(null))).toEqual(["BENTUK"]);
    expect(kode(periksaBank({ versi: 2, rujukan: [], kejadian: [], paket: [] }))).toEqual(["NILAI", "JUMLAH", "JUMLAH", "JUMLAH"]);
  });
});

describe("periksaPaketPeta (P-16)", () => {
  const zona = bank.kejadian.map((k) => k.zona);

  it("zona yang kekurangan titik dilaporkan dengan letak paket/zona", () => {
    expect(TEMUAN_PETA).toEqual([
      { kode: "PAKET_TITIK_KURANG", tingkat: "galat", letak: "paket/z3", pesan: "Zona z3: 2 kejadian, tetapi hanya 1 titik kejadian di peta." },
    ]);
  });

  it("titik cukup: tanpa temuan; zona tanpa titik dianggap 0", () => {
    expect(periksaPaketPeta(zona, titik(2))).toEqual([]);
    expect(kode(periksaPaketPeta(["z5"], {}, "Paket uji"))).toEqual(["PAKET_TITIK_KURANG"]);
    expect(periksaPaketPeta(["z5"], {}, "Paket uji")[0].letak).toBe("Paket uji/z5");
  });
});

describe("kode temuan", () => {
  it("27 kode unik; dua peringatan (tabel kode temuan)", () => {
    expect(KODE_TEMUAN).toHaveLength(27);
    expect(new Set(KODE_TEMUAN).size).toBe(27);
    expect([...KODE_PERINGATAN].sort()).toEqual(["KAPITAL_TENGAH", "RUJUKAN_TIDAK_DIPAKAI"]);
  });

  it("setiap kode muncul di sedikitnya satu contoh (AC-3)", () => {
    const terlihat = new Set<KodeTemuan>([
      ...CONTOH_KEJADIAN.flatMap(([, , isi]) => kode(periksaKejadian(isi, konteks))),
      ...kode(TEMUAN_BANK),
      ...kode(TEMUAN_PETA),
    ]);
    expect([...KODE_TEMUAN].filter((k) => !terlihat.has(k))).toEqual([]);
  });

  it("adaGalat hanya untuk galat (P-17)", () => {
    expect(adaGalat([])).toBe(false);
    expect(adaGalat([{ kode: "KAPITAL_TENGAH", tingkat: "peringatan", letak: "K-01/situasi", pesan: "" }])).toBe(false);
    expect(adaGalat([{ kode: "OPSI_BENAR", tingkat: "galat", letak: "K-01/langkah1.opsi", pesan: "" }])).toBe(true);
  });
});

describe("fungsi teks (P-4, P-13)", () => {
  it("hitungKalimat", () => {
    expect(hitungKalimat("Satu. “Dua!” Tiga?")).toBe(3);
    expect(hitungKalimat("Tanpa tanda akhir")).toBe(0);
    expect(hitungKalimat("Pukul 07.00 kami berangkat... Lalu tiba.")).toBe(2);
    for (const k of bank.kejadian) expect(hitungKalimat(k.situasi), k.kode).toBe(3);
  });

  it("potonganSamaTerpanjang", () => {
    expect(potonganSamaTerpanjang("Perhatikan ibu itu", "IBU ITU sakit")).toBe("ibu itu");
    expect(potonganSamaTerpanjang("abc", "xyz")).toBe("");
    for (const k of bank.kejadian) {
      const benar = k.langkah1.opsi.find((o) => o.benar)?.teks ?? "";
      expect(potonganSamaTerpanjang(k.langkah1.petunjuk, benar).length, k.kode).toBeLessThanOrEqual(20);
    }
  });

  it("kataKapitalTengah", () => {
    expect(kataKapitalTengah("Saya dan Tono ke SD. Lalu “Ayo!” kata Pak Made.")).toEqual(["Tono"]);
    expect(kataKapitalTengah("Ia membawa HP-nya dan buku PR ke kelas VII.")).toEqual([]);
    expect(kataKapitalTengah("Kata (Siapa) dan “Kamu” boleh.")).toEqual([]);
    expect(NAMA_DIRI.size).toBe(15);
  });

  it("alasanTidakPolos", () => {
    expect(alasanTidakPolos("Teks biasa, dengan “kutipan” dan (kurung).")).toBeNull();
    expect(alasanTidakPolos(" awal")).toBe("spasi di awal, di akhir, atau spasi ganda");
    expect(alasanTidakPolos("tab\tdi tengah")).toBe("karakter kendali atau karakter tak terlihat");
    expect(alasanTidakPolos("**tebal**")).toBe("tanda HTML atau Markdown, atau tautan");
    expect(alasanTidakPolos("lihat WWW.contoh.id")).toBe("tanda HTML atau Markdown, atau tautan");
  });
});
