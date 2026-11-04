// Teks prolog Sehari Setara (spesifikasi F-10, bagian Teks yang tampil): tiga layar sebelum adegan 1, masing-masing
// dengan pose Nara dan teks alternatif panggung. Paling banyak tiga kalimat per layar (AGENTS bagian 8), diperiksa di
// opening.test.ts dengan countSentences pemeriksa naskah.
export interface PrologScreen {
  readonly text: string;
  readonly pose: "talk" | "idle" | "happy";
  readonly altText: string;
}

export const PROLOG: readonly PrologScreen[] = [
  {
    text: "Ini Nara, siswa kelas IX. Hari ini kalian menemani Nara dari pagi sampai malam. Di setiap adegan, kelas membantu Nara memilih tindakan.",
    pose: "talk",
    altText:
      "Jalan kampung pada pagi hari, dengan rumah dan sekolah di kejauhan serta matahari terbit. Nara berdiri di tengah jalan sambil berbicara.",
  },
  {
    text: "Lihat dua indikator di kiri: hak orang lain terjaga dan kewajiban dijalankan. Keduanya mulai dari 50 dan bergerak sesuai pilihan kelas. Indikator ini milik seluruh kelas, jadi semua tim menjaganya bersama.",
    pose: "idle",
    altText: "Jalan kampung pada pagi hari, dengan rumah dan sekolah di kejauhan. Nara berdiri tenang di tengah jalan.",
  },
  {
    text: "Tim yang mendapat giliran memutuskan pilihan, dan guru memberi bintang untuk alasan yang baik. Tidak ada yang kalah dalam permainan ini. Hari Nara dimulai sekarang!",
    pose: "happy",
    altText: "Jalan kampung pada pagi hari, dengan rumah dan sekolah di kejauhan. Nara tersenyum senang di tengah jalan.",
  },
];
