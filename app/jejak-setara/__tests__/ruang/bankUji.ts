// Bank awal (JS-05) sebagai masukan kejadian ruang untuk uji JS-08; berkas pembantu, bukan berkas uji.
import { readFileSync } from "node:fs";
import type { IsiKejadian } from "../../inti/tipe";
import type { KejadianMasuk } from "../../../../server/jejak-setara/src/ruang/kejadian-ruang";

const bank = JSON.parse(readFileSync(new URL("../../../../server/jejak-setara/seed/bank-awal.json", import.meta.url), "utf8")) as {
  rujukan: { id: string; teks: string }[];
  kejadian: IsiKejadian[];
};
const teksRujukan = new Map(bank.rujukan.map((r) => [r.id, r.teks]));

/** Ke-16 kejadian bank awal dengan teks rujukan, seperti yang dikirim Worker ke /inisialisasi (P-3). */
export const MASUK: KejadianMasuk[] = bank.kejadian.map((isi) => ({
  kode: isi.kode,
  versiId: `versi-${isi.kode}`,
  isi,
  rujukan: isi.kartu.rujukan.map((id) => teksRujukan.get(id) ?? "?"),
}));
