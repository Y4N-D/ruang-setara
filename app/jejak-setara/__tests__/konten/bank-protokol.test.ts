// Uji isi bank terhadap skema pesan JS-02 (spesifikasi JS-05, bagian "Protokol, API, dan migrasi"; AC-7).
// Pesan dibangun seperti yang akan dikirim server: id pilihan untuk pemain diacak (Architecture 8.3), dan
// kartu dampak memuat teks rujukan dari pustaka.
import { describe, expect, it } from "vitest";
import { PROTOKOL_VERSI, skemaServerKelas, skemaServerPemain } from "../../inti/protokol";
import { bacaBankAwal } from "./naskah-urai";

const { bank } = bacaBankAwal();
const teksRujukan = new Map(bank.rujukan.map((r) => [r.id, r.teks]));
const kartu = (k: (typeof bank.kejadian)[number]) => ({
  hak: k.kartu.hak,
  kewajiban: k.kartu.kewajiban,
  rujukan: k.kartu.rujukan.map((id) => teksRujukan.get(id) ?? `?${id}`),
});
const galatPertama = (hasil: { success: boolean; error?: { issues: { path: (string | number)[]; message: string }[] } }) =>
  hasil.success ? null : `${hasil.error?.issues[0].path.join(".")}: ${hasil.error?.issues[0].message}`;

describe("pesan protokol dari setiap kejadian", () => {
  for (const k of bank.kejadian) {
    it(`${k.kode}: kejadian_terbuka, petunjuk, hasil_1, hasil_2, dan data_pembahasan sah`, () => {
      const benar = k.langkah1.opsi.find((o) => o.benar);
      const salah = k.langkah1.opsi.find((o) => !o.benar);
      const tepat = k.langkah2.opsi.filter((o) => o.tingkat === "tepat");
      expect(benar && salah && tepat.length > 0).toBe(true);
      const pemain = [
        {
          v: PROTOKOL_VERSI,
          t: "kejadian_terbuka",
          kejadianId: k.kode,
          judul: k.judul,
          situasi: k.situasi,
          setTokoh: k.setTokoh,
          pertanyaan1: k.langkah1.pertanyaan,
          opsi1: k.langkah1.opsi.map((o, i) => ({ id: `o-${i}x`, teks: o.teks })),
          langkah: 1,
        },
        { v: PROTOKOL_VERSI, t: "petunjuk", kejadianId: k.kode, kalimat: k.langkah1.petunjuk, opsiDicoret: "o-1x" },
        {
          v: PROTOKOL_VERSI,
          t: "hasil_1",
          benar: false,
          opsiBenar: "o-0x",
          umpanBalik: salah?.umpanBalik,
          umpanBalikBenar: benar?.umpanBalik,
          poin: 0,
          pertanyaan2: k.langkah2.pertanyaan,
          opsi2: k.langkah2.opsi.map((o, i) => ({ id: `p-${i}x`, teks: o.teks })),
        },
        { v: PROTOKOL_VERSI, t: "hasil_2", tingkat: "tepat", poin: 60, terjadi: tepat[0]?.terjadi, opsiTepat: tepat.map((_, i) => `p-${i}x`), kartu: kartu(k) },
      ];
      for (const p of pemain) expect(galatPertama(skemaServerPemain.safeParse(p)), `${k.kode} ${p.t}`).toBeNull();
      const pembahasan = {
        v: PROTOKOL_VERSI,
        t: "data_pembahasan",
        kejadianId: k.kode,
        judul: k.judul,
        situasi: k.situasi,
        pertanyaan1: k.langkah1.pertanyaan,
        opsi1: k.langkah1.opsi.map((o) => ({ id: o.id, teks: o.teks, benar: o.benar, jumlah: 50 })),
        pertanyaan2: k.langkah2.pertanyaan,
        opsi2: k.langkah2.opsi.map((o) => ({ id: o.id, teks: o.teks, tingkat: o.tingkat, terjadi: o.terjadi, jumlah: 50 })),
        kartu: kartu(k),
      };
      expect(galatPertama(skemaServerKelas.safeParse(pembahasan)), `${k.kode} data_pembahasan`).toBeNull();
    });
  }

  it("selesai: rekap ke-16 kejadian dalam satu pesan sah", () => {
    const rekap = bank.kejadian.map((k) => ({
      kejadianId: k.kode,
      judul: k.judul,
      pilihan1: k.langkah1.opsi.find((o) => !o.benar)?.teks,
      benar1: false,
      opsiBenar1: k.langkah1.opsi.find((o) => o.benar)?.teks,
      pilihan2: k.langkah2.opsi[0].teks,
      tingkat2: k.langkah2.opsi[0].tingkat,
      opsiTepat2: k.langkah2.opsi.filter((o) => o.tingkat === "tepat").map((o) => o.teks),
      poin: 0,
      rujukan: kartu(k).rujukan,
    }));
    expect(galatPertama(skemaServerPemain.safeParse({ v: PROTOKOL_VERSI, t: "selesai", skor: 0, peringkat: 1, jumlahPemain: 50, rekap }))).toBeNull();
  });
});
