// Teks ketiga akhir hari Sehari Setara (PRD bagian 9; spesifikasi F-09, bagian "Teks yang tampil").
// Judul dari PRD bagian 9; pesan dua kalimat dan teks alternatif ilustrasi C-02 sampai C-04 dari spesifikasi F-09.
// Tidak ada kata "kalah", "gagal", atau "salah" (Design System bagian 2 nomor 3); closing.test.ts memeriksanya.
import type { EndingId } from "../engine/types";

export interface EndingText {
  readonly title: string;
  readonly message: readonly [string, string];
  /** Teks alternatif ilustrasi akhir; label panggung menambahkan kalimat timbangan sesudahnya. */
  readonly alt: string;
}

export const ENDINGS: Readonly<Record<EndingId, EndingText>> = {
  setara: {
    title: "Warga Setara",
    message: [
      "Hak orang lain terjaga dan kewajiban dijalankan, sehingga timbangan Nara seimbang.",
      "Mari lihat rekap untuk mengingat alasan di balik setiap pilihan.",
    ],
    alt: "Nara duduk tersenyum di bangku teras sambil menggenggam teh hangat. Malam cerah, bulan dan banyak bintang bersinar.",
  },
  hampir: {
    title: "Hampir Seimbang",
    message: [
      "Banyak pilihan kelas sudah baik, tetapi ada yang masih bisa diperbaiki.",
      "Mari lihat rekap untuk menemukan pilihan yang lebih menjaga keseimbangan.",
    ],
    alt: "Nara duduk merenung di bangku teras sambil bertopang dagu. Sebagian langit berawan, dan bulan setengah tertutup.",
  },
  berat: {
    title: "Hari yang Berat",
    message: [
      "Pilihan kecil ternyata berdampak besar bagi orang-orang di sekitar Nara.",
      "Ini kesempatan untuk belajar: mari lihat rekap untuk menemukan pilihan yang lebih menjaga keseimbangan.",
    ],
    alt: "Nara duduk di bangku teras dan menatap langit yang berawan. Ada bintang jatuh, dan Nara tersenyum kecil penuh harapan.",
  },
};
