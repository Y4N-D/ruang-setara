// Rekap pribadi dan ringkasan hasil ronde (spesifikasi JS-11, P-1, P-2, dan P-14). Murni: dipanggil inti ruang.
import type { RingkasanHasilRuang } from "../../../../app/jejak-setara/inti/hasil";
import { BATAS_PESAN, type PesanServerPemain } from "../../../../app/jejak-setara/inti/protokol";
import type { KejadianRuang } from "../../../../app/jejak-setara/inti/tipe";
import type { JawabanRuang } from "./kejadian-ruang";

export type ButirRekap = Extract<PesanServerPemain, { t: "selesai" }>["rekap"][number];

/**
 * Rekap satu pemain (P-1, P-2): setiap kejadian yang Langkah 1-nya sudah dikunci, menurut urutan kejadian ruang (urutan
 * paket). Teks diambil dari isi kejadian yang disalin ke ruang, lewat id asli pilihan. Langkah 2 yang belum dikunci
 * bernilai null.
 */
export function susunRekap(kejadian: readonly KejadianRuang[], jawaban: ReadonlyMap<string, JawabanRuang> | undefined): ButirRekap[] {
  const hasil: ButirRekap[] = [];
  if (!jawaban) return hasil;
  for (const kj of kejadian) {
    const j = jawaban.get(kj.kode);
    if (!j || j.langkah1Opsi === null || j.langkah1Benar === null || j.langkah1Pada === null) continue;
    const opsi1 = kj.isi.langkah1.opsi;
    const pilihan1 = opsi1.find((o) => o.id === j.langkah1Opsi);
    const benar1 = opsi1.find((o) => o.benar);
    if (!pilihan1 || !benar1) continue;
    const opsi2 = kj.isi.langkah2.opsi;
    const pilihan2 = j.langkah2Opsi === null ? undefined : opsi2.find((o) => o.id === j.langkah2Opsi);
    hasil.push({
      kejadianId: kj.kode,
      judul: kj.isi.judul,
      pilihan1: pilihan1.teks,
      benar1: j.langkah1Benar,
      opsiBenar1: benar1.teks,
      pilihan2: pilihan2?.teks ?? null,
      tingkat2: pilihan2?.tingkat ?? null,
      opsiTepat2: opsi2.filter((o) => o.tingkat === "tepat").map((o) => o.teks),
      poin: j.poin,
      rujukan: [...kj.rujukan],
    });
    if (hasil.length >= BATAS_PESAN.kejadianMaks) break;
  }
  return hasil;
}

/**
 * Ringkasan hasil untuk `ruang.ringkasan_json.hasil` (P-14), dari pemain berkeidentitas yang tidak dikeluarkan: jumlah
 * skor, jawaban yang Langkah 1-nya dikunci, Langkah 1 benar, dan setiap tingkat Langkah 2 yang dikunci.
 */
export function hitungRingkasanHasil(jumlahKejadian: number, pemain: Iterable<{ skor: number; jawaban: Iterable<JawabanRuang> }>): RingkasanHasilRuang {
  const h: RingkasanHasilRuang = { versi: 1, jumlahKejadian, jumlahPemain: 0, jumlahSkor: 0, langkah1Dijawab: 0, langkah1Benar: 0, tepat: 0, kurang: 0, berisiko: 0 };
  for (const p of pemain) {
    h.jumlahPemain++;
    h.jumlahSkor += p.skor;
    for (const j of p.jawaban) {
      if (j.langkah1Pada === null || j.langkah1Benar === null) continue;
      h.langkah1Dijawab++;
      if (j.langkah1Benar) h.langkah1Benar++;
      if (j.langkah2Pada !== null && j.tingkat !== null) h[j.tingkat]++;
    }
  }
  return h;
}
