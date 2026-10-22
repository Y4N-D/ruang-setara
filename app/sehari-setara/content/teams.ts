// Tim bawaan Sehari Setara (Design System bagian 7): warna dan bentuk agar tim tidak dibedakan lewat warna saja.
// F-05 memakai dua tim pertama tanpa menampilkannya (keputusan Gerbang 1 F-05 nomor 3);
// papan tim (F-07) dan pengaturan kelas (F-10) memakai daftar yang sama.
import type { TeamSetup } from "../engine/types";

export const DEFAULT_TEAMS: readonly TeamSetup[] = [
  { id: "mangga", name: "Tim Mangga", color: "mango", shape: "lingkaran" },
  { id: "laut", name: "Tim Laut", color: "sky-d", shape: "segitiga" },
  { id: "daun", name: "Tim Daun", color: "leaf", shape: "persegi" },
  { id: "mentari", name: "Tim Mentari", color: "sun", shape: "bintang" },
];

/** Tim untuk layar permainan sementara #main, sampai pengaturan kelas dibuat di F-10. */
export const PLAY_TEAMS: readonly TeamSetup[] = DEFAULT_TEAMS.slice(0, 2);
