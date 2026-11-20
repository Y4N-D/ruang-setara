// Layar rekap pemain (spesifikasi JS-11, P-4 sampai P-9; AC-3 sampai AC-7): aturan murni dan isi halaman.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { KODE_LAYANAN_BERHENTI, KODE_PUTUS_LAMA } from "../../pemain/jaringan";
import { LayarRekap, type PropsRekap } from "../../pemain/Rekap";
import { akhirRekap, penyebabDariKode, tampilanSkor, type ButirRekap } from "../../pemain/rekapKeadaan";
import { isiTeks, TEKS } from "../../teks";

const BENAR: ButirRekap = {
  kejadianId: "K-13",
  judul: "Antrean puskesmas",
  pilihan1: "Hak ibu dan bayinya",
  benar1: true,
  opsiBenar1: "Hak ibu dan bayinya",
  pilihan2: "Menolak dengan sopan",
  tingkat2: "tepat",
  opsiTepat2: ["Menolak dengan sopan"],
  poin: 100,
  rujukan: ["Pasal 28H ayat (1) UUD NRI 1945"],
};
const SALAH: ButirRekap = {
  kejadianId: "K-06",
  judul: "Zebra cross",
  pilihan1: "Hak pengendara",
  benar1: false,
  opsiBenar1: "Hak pejalan kaki",
  pilihan2: null,
  tingkat2: null,
  opsiTepat2: ["Berhenti di belakang garis", "Memberi isyarat"],
  poin: 0,
  rujukan: ["UU No. 22 Tahun 2009", "PP No. 79 Tahun 2013"],
};

const tampil = (p: Partial<PropsRekap>) =>
  renderToStaticMarkup(<LayarRekap akhir={{ skor: 100, peringkat: 2, jumlah: 5 }} rekap={[SALAH, BENAR]} uji={false} menyambung={false} berakhir={null} saatKembali={() => {}} {...p} />);

describe("aturan rekap sesudah sambungan berakhir (P-8, D-2 a)", () => {
  it("penyebab dari kode tutup", () => {
    expect(penyebabDariKode(4000)).toBe("ditutup");
    expect(penyebabDariKode(KODE_LAYANAN_BERHENTI)).toBe("layanan");
    expect(penyebabDariKode(KODE_PUTUS_LAMA)).toBe("putus");
    expect(penyebabDariKode(4004)).toBe("dikeluarkan");
    expect(penyebabDariKode(4005)).toBe("versi");
    expect(penyebabDariKode(1006)).toBeNull();
    expect(penyebabDariKode(null)).toBeNull();
  });

  it("pita dan tombol sama dengan layar yang digantikan; pemain yang dikeluarkan tetap ke layar galat", () => {
    expect(akhirRekap("ditutup")).toEqual({ pita: "ditutup", tombol: "kembali" });
    expect(akhirRekap("tidak_ada")).toEqual({ pita: "ditutup", tombol: "kembali" });
    expect(akhirRekap("putus")).toEqual({ pita: "berhenti", tombol: "cobaLagi" });
    expect(akhirRekap("layanan")).toEqual({ pita: "berhenti", tombol: "cobaLagi" });
    expect(akhirRekap("versi")).toEqual({ pita: "berhenti", tombol: "muatUlang" });
    expect(akhirRekap("dikeluarkan")).toBeNull();
  });
});

describe("skor di rekap (P-5)", () => {
  it("skor lebih dari 0, skor 0 dengan rekap berisi, rekap kosong, dan sebelum selesai tiba", () => {
    expect(tampilanSkor({ skor: 40 }, null)).toBe("lengkap");
    expect(tampilanSkor({ skor: 0 }, [SALAH])).toBe("skorSaja");
    expect(tampilanSkor({ skor: 0 }, [])).toBe("kosong");
    expect(tampilanSkor({ skor: 0 }, null)).toBe("menunggu");
    expect(tampilanSkor(null, null)).toBe("menunggu");
  });
});

describe("isi layar rekap (P-4, P-6, P-9)", () => {
  it("susunan: judul, skor dan peringkat, arahan guru, tautan refleksi, daftar bernomor, lalu refleksi", () => {
    const h = tampil({});
    const urutan = [
      "<h1>Ronde selesai</h1>",
      "Skormu 100",
      "Peringkat 2 dari 5",
      TEKS.ronde.selesaiIsi,
      TEKS.rekap.keRefleksi,
      `<h2 id="js-rekap-judul">${isiTeks(TEKS.rekap.judul, { n: 2 })}</h2>`,
      '<ol class="js-rekap-daftar">',
      "Zebra cross",
      "Antrean puskesmas",
      `<h2 id="js-refleksi-judul" tabindex="-1">${TEKS.rekap.refleksiJudul}</h2>`,
      TEKS.rekap.refleksiPengantar,
      `<ol class="js-refleksi-daftar"><li>${TEKS.rekap.refleksiHak}</li><li>${TEKS.rekap.refleksiKewajiban}</li></ol>`,
    ];
    let posisi = -1;
    for (const bagian of urutan) {
      const i = h.indexOf(bagian, posisi + 1);
      expect(i, bagian).toBeGreaterThan(posisi);
      posisi = i;
    }
    expect(h.match(/<h3 /g)).toHaveLength(2);
    expect(h).not.toContain("js-pita-rekap");
    expect(h).not.toContain(TEKS.kartu.rujukanUji);
  });

  it("tanda berikon dan bertulisan; Jawaban tepat bila keliru; Belum dijawab; Pilihan yang tepat bila tingkat bukan tepat", () => {
    const h = tampil({});
    const salah = h.slice(h.indexOf("Zebra cross"), h.indexOf("Antrean puskesmas"));
    expect(salah).toContain(`data-jenis="belum"`);
    expect(salah).toContain(TEKS.dialog.belumTepat);
    expect(salah).toContain(`<dt>${TEKS.dialog.jawabanTepat}</dt><dd>Hak pejalan kaki</dd>`);
    expect(salah).toContain(`data-jenis="kabut"><span>${TEKS.rekap.belumDijawab}</span>`);
    expect(salah).toContain(`<dt>${TEKS.kartu.pilihanTepat}</dt><dd><ul class="js-rekap-sub"><li>Berhenti di belakang garis</li><li>Memberi isyarat</li></ul></dd>`);
    expect(salah).toContain("<li>UU No. 22 Tahun 2009</li><li>PP No. 79 Tahun 2013</li>");
    const benar = h.slice(h.indexOf("Antrean puskesmas"));
    expect(benar).toContain(`data-jenis="tepat"`);
    expect(benar).toContain(isiTeks(TEKS.rekap.poin, { poin: 100 }));
    expect(benar).not.toContain(TEKS.kartu.pilihanTepat);
    expect(benar).not.toContain(`<dt>${TEKS.dialog.jawabanTepat}</dt>`);
    expect(h.match(/<img [^>]*alt=""/g)?.length).toBe(3);
  });

  it("ruang uji: catatan rujukan sekali di atas daftar", () => {
    const h = tampil({ uji: true });
    expect(h.split(TEKS.kartu.rujukanUji)).toHaveLength(2);
  });

  it("rekap kosong: teks tanpa skor dan refleksi tetap tampil; sebelum selesai tiba: tanpa daftar dan refleksi", () => {
    const kosong = tampil({ akhir: { skor: 0, peringkat: 1, jumlah: 3 }, rekap: [] });
    expect(kosong).toContain(TEKS.ronde.tanpaSkor);
    expect(kosong).toContain(TEKS.rekap.refleksiJudul);
    expect(kosong).not.toContain(TEKS.rekap.keRefleksi);
    expect(kosong).not.toContain("Skormu");
    const nol = tampil({ akhir: { skor: 0, peringkat: 1, jumlah: 3 }, rekap: [SALAH] });
    expect(nol).toContain("Skormu 0");
    expect(nol).not.toContain("Peringkat");
    const menunggu = tampil({ rekap: null });
    expect(menunggu).toContain("Skormu 100");
    expect(menunggu).not.toContain(TEKS.rekap.refleksiJudul);
  });

  it("pita menyambung ulang (P-7), dan pita serta tombol sesudah sambungan berakhir tanpa arahan guru (P-8)", () => {
    expect(tampil({ menyambung: true })).toContain(TEKS.rekap.pitaMenyambung);
    const ditutup = tampil({ berakhir: { pita: "ditutup", tombol: "kembali" } });
    expect(ditutup).toContain(TEKS.rekap.pitaDitutup);
    expect(ditutup).not.toContain(TEKS.ronde.selesaiIsi);
    expect(ditutup).toMatch(new RegExp(`<button[^>]*>${TEKS.tombol.kembali}</button>`));
    expect(tampil({ berakhir: { pita: "berhenti", tombol: "cobaLagi" } })).toMatch(new RegExp(`${TEKS.rekap.pitaBerhenti}[\\s\\S]*<button[^>]*>${TEKS.berhenti.cobaLagi}</button>`));
    expect(tampil({ berakhir: { pita: "berhenti", tombol: "muatUlang" } })).toMatch(new RegExp(`<button[^>]*>${TEKS.tombol.muatUlang}</button>`));
    expect(tampil({ menyambung: true, berakhir: { pita: "ditutup", tombol: "kembali" } })).not.toContain(TEKS.rekap.pitaMenyambung);
  });
});
