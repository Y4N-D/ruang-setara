// Empat peran untuk kuis adegan 5 (PRD bagian 8; spesifikasi F-03).
import type { RoleInfo } from "../engine/types";

export const ROLES: readonly RoleInfo[] = [
  { id: "polisi", label: "Polisi", tugas: "Menerima laporan dan menyidik." },
  { id: "jaksa", label: "Jaksa", tugas: "Menuntut." },
  { id: "advokat", label: "Advokat", tugas: "Mendampingi." },
  { id: "hakim", label: "Hakim", tugas: "Memutus." },
];
