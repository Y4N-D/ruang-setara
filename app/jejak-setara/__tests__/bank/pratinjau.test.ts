// Mode pratinjau layar pemain (spesifikasi JS-12, P-12; AC-8): pesan dari konsol, urutan asli A–D, poin, dan kartu.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { IsiKejadian } from "../../inti/tipe";
import { bacaPesanPratinjau, hasilLangkah1, hasilLangkah2, pesanTerbuka } from "../../pemain/pratinjau";

const ISI = (JSON.parse(readFileSync(new URL("../../../../server/jejak-setara/seed/bank-awal.json", import.meta.url), "utf8")) as { kejadian: IsiKejadian[] }).kejadian[0];

describe("pratinjau", () => {
  it("menerima isi dan aba-aba mulai ulang; menolak pesan lain atau isi yang tidak bisa digambar", () => {
    expect(bacaPesanPratinjau({ jenis: "jejak-pratinjau", isi: ISI, rujukan: ["Pasal 1"], bentuk: "lembar" })).toEqual({ jenis: "isi", isi: ISI, rujukan: ["Pasal 1"], bentuk: "lembar" });
    expect(bacaPesanPratinjau({ jenis: "jejak-pratinjau-ulang" })).toEqual({ jenis: "ulang" });
    for (const salah of [null, "teks", { jenis: "lain", isi: ISI }, { jenis: "jejak-pratinjau" }, { jenis: "jejak-pratinjau", isi: { ...ISI, langkah1: { ...ISI.langkah1, opsi: ISI.langkah1.opsi.slice(0, 3) } } }]) {
      expect(bacaPesanPratinjau(salah)).toBeNull();
    }
    expect(bacaPesanPratinjau({ jenis: "jejak-pratinjau", isi: ISI })?.jenis === "isi" && bacaPesanPratinjau({ jenis: "jejak-pratinjau", isi: ISI })).toMatchObject({ bentuk: "panel", rujukan: [] });
  });

  it("Langkah 1 memakai urutan asli A–D (D-2); hasil benar dan keliru beserta poin", () => {
    const buka = pesanTerbuka(ISI);
    expect(buka.opsi1.map((o) => o.id)).toEqual(["1a", "1b", "1c", "1d"]);
    expect(buka.langkah).toBe(1);
    const kunci = ISI.langkah1.opsi.find((o) => o.benar)!;
    const salah = ISI.langkah1.opsi.find((o) => !o.benar)!;
    expect(hasilLangkah1(ISI, kunci.id)).toMatchObject({ benar: true, opsiBenar: kunci.id, poin: 40, umpanBalik: kunci.umpanBalik, umpanBalikBenar: undefined });
    expect(hasilLangkah1(ISI, salah.id)).toMatchObject({ benar: false, poin: 0, umpanBalik: salah.umpanBalik, umpanBalikBenar: kunci.umpanBalik });
  });

  it("Langkah 2: tingkat, poin 60/25/0, pilihan tepat, dan kartu dengan teks rujukan", () => {
    for (const o of ISI.langkah2.opsi) {
      const h = hasilLangkah2(ISI, ["Teks rujukan"], o.id);
      expect(h.poin).toBe({ tepat: 60, kurang: 25, berisiko: 0 }[o.tingkat]);
      expect(h.terjadi).toBe(o.terjadi);
      expect(h.kartu).toEqual({ hak: ISI.kartu.hak, kewajiban: ISI.kartu.kewajiban, rujukan: ["Teks rujukan"] });
      expect(h.opsiTepat).toEqual(ISI.langkah2.opsi.filter((x) => x.tingkat === "tepat").map((x) => x.id));
    }
  });
});
