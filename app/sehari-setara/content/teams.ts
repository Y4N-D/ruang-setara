// Tim bawaan Sehari Setara (Design System bagian 7): warna dan bentuk agar tim tidak dibedakan lewat warna saja.
// Papan tim (F-07) dan pengaturan kelas (F-10) memakai daftar yang sama; pengaturan kelas mengambilnya berurutan.
import type { TeamSetup } from "../engine/types";

export const DEFAULT_TEAMS: readonly TeamSetup[] = [
  { id: "mangga", name: "Tim Mangga", color: "mango", shape: "lingkaran" },
  { id: "laut", name: "Tim Laut", color: "sky-d", shape: "segitiga" },
  { id: "daun", name: "Tim Daun", color: "leaf", shape: "persegi" },
  { id: "mentari", name: "Tim Mentari", color: "sun", shape: "bintang" },
];
