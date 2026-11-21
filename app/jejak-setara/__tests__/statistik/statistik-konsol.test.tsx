// Tampilan murni halaman Statistik dan dasbor (spesifikasi JS-13, P-19, P-20, P-22, P-27; AC-8, AC-10, AC-12).
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IsiDasbor } from "../../admin/halaman/Dasbor";
import { kueriStatistik, RincianStatistik, saringanBawaan, TabelStatistik } from "../../admin/halaman/Statistik";
import type { StatistikKejadian } from "../../inti/statistik";

const dasar: StatistikKejadian = {
  kode: "K-90",
  judul: "Antrean puskesmas",
  zona: "z7",
  versi: 1,
  pertanyaan1: "Hak siapa yang paling terganggu?",
  pertanyaan2: "Apa yang kamu lakukan?",
  dijawab: 4,
  selesai: 3,
  benar1: 2,
  ketepatan1: 50,
  pilihan1: [
    { id: "1a", teks: "Hak ibu", benar: true, n: 2 },
    { id: "1b", teks: "Hak Raka", benar: false, n: 1 },
    { id: "1c", teks: "Hak petugas", benar: false, n: 0 },
    { id: "1d", teks: "Hak pengunjung", benar: false, n: 1 },
  ],
  pilihan2: [
    { id: "2a", teks: "Menolak", tingkat: "tepat", n: 1 },
    { id: "2b", teks: "Diam", tingkat: "kurang", n: 2 },
    { id: "2c", teks: "Ikut", tingkat: "berisiko", n: 0 },
  ],
  tingkat: { tepat: 33.3, kurang: 66.7, berisiko: 0 },
  penuh: 1,
  indeksKesulitan: 0.33,
  medianDetik: 45,
  keliruTerbanyak: "1b",
  petunjuk: 33.3,
};

describe("tabel statistik (P-19, P-20)", () => {
  it("kolom, tanda, dan rincian yang terbuka", () => {
    const html = renderToStaticMarkup(<TabelStatistik daftar={[dasar, { ...dasar, kode: "K-91", versi: 2, selesai: 12, indeksKesulitan: 0.82 }]} terbuka="K-90-v1" buka={() => {}} />);
    expect(html).toContain("Data sedikit");
    expect(html.match(/Data sedikit/g)).toHaveLength(1);
    expect(html).toContain("41,1%".replace("41,1", "50,0"));
    expect(html).toContain("0,33");
    expect(html).toContain("Sedang");
    expect(html).toContain("Mudah");
    expect(html).toContain("45 dtk");
    expect(html).toContain("B · 25,0%");
    expect(html).toContain("33,3%");
    expect(html).toContain("Tepat 33,3%, kurang tepat 66,7%, berisiko 0,0%.");
    expect(html).toContain('aria-label="Tutup rincian K-90 versi 1"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-label="Rincian K-91 versi 2"');
    expect(html).toContain('<th scope="col">');
    expect(html).toContain("Langkah 1: Hak siapa yang paling terganggu?");
  });
  it("rincian: grafik, tanda, angka, catatan huruf, dan tautan bank", () => {
    const html = renderToStaticMarkup(<RincianStatistik k={dasar} />);
    expect(html).toContain("A. Hak ibu");
    expect(html).toContain("Jawaban tepat");
    expect(html).toContain("Keliru terbanyak");
    expect(html).toContain("2 (50,0%)");
    expect(html).toContain("2 (66,7%)");
    expect(html).toContain("Dijawab 4 · selesai 3 · median 45 detik · indeks kesulitan 0,33");
    expect(html).toContain("33,3% memakai Petunjuk");
    expect(html).toContain("Huruf mengikuti urutan asli di bank kejadian.");
    expect(html).toContain('href="#/kejadian/K-90"');
    const kosong = renderToStaticMarkup(<RincianStatistik k={{ ...dasar, selesai: 0, indeksKesulitan: null, medianDetik: null, petunjuk: null }} />);
    expect(kosong).toContain("Belum ada Langkah 2 yang dikunci.");
    expect(kosong).toContain("median – · indeks kesulitan –");
    expect(kosong).not.toContain("memakai Petunjuk");
  });
  it("saringan bawaan 30 hari dan parameter kueri (P-17, D-2a)", () => {
    expect(saringanBawaan(new Date(2026, 10, 21, 9, 0))).toEqual({ dari: "2026-10-23", sampai: "", label: "", guru: "", paket: "" });
    const q = kueriStatistik({ dari: "", sampai: "", label: " ix ", guru: "g1", paket: "" });
    expect(Object.fromEntries(q)).toEqual({ label: "ix", guru: "g1" });
  });
});

describe("kartu dasbor (P-27)", () => {
  const data = {
    rujukanBelum: 2,
    ruang: [],
    jumlahRuang: 0,
    siapTinjau: 3,
    sesi: [{ id: "r1", kode: "AB123", labelKelas: "IX B", uji: true, namaGuru: "Bu Sari", dibuatPada: Date.UTC(2026, 10, 20, 2), jumlahPemain: 31, rataSkor: 793.4 }],
    ringkasan: { hari: 30, sesi: 22, pemain: 863, rataSkor: 797.7, ketepatan1: 66.7, tingkat: { tepat: 60.5, kurang: 24.5, berisiko: 15 } },
  };
  it("admin: peringatan bertaut, sesi dengan nama guru dan tanda Uji, ringkasan", () => {
    const html = renderToStaticMarkup(<IsiDasbor data={data} admin />);
    expect(html).toContain('href="#/rujukan"');
    expect(html).toContain('href="#/kejadian"');
    expect(html).toContain("kejadian Siap tinjau menunggu diterbitkan.");
    expect(html).toMatch(/20 Nov 2026 · IX B · Bu Sari · 31 pemain · rata-rata 793,4/);
    expect(html).toContain(">Uji<");
    expect(html).toContain('href="#/ruang/riwayat"');
    expect(html).toContain("863");
    expect(html).toContain("66,7%");
    expect(html).toContain("Tepat 60,5% · Kurang tepat 24,5% · Berisiko 15,0%");
    expect(html).toContain('href="#/statistik"');
  });
  it("guru dan keadaan kosong", () => {
    const html = renderToStaticMarkup(<IsiDasbor data={{ ...data, rujukanBelum: 0, siapTinjau: null, sesi: [], ringkasan: { ...data.ringkasan, sesi: 0 } }} admin={false} />);
    expect(html).toContain("Tidak ada peringatan.");
    expect(html).toContain("Belum ada ruang yang berjalan.");
    expect(html).toContain("Belum ada sesi kelas.");
    expect(html).toContain("Belum ada sesi kelas dalam 30 hari terakhir.");
    const guru = renderToStaticMarkup(<IsiDasbor data={data} admin={false} />);
    expect(guru).not.toContain("Siap tinjau");
    expect(guru).not.toContain("Bu Sari");
  });
});
