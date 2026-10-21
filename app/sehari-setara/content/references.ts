// Rujukan pasal Sehari Setara (PRD bagian 8; spesifikasi F-03).
// Status verifikasi tidak disimpan di sini, melainkan di docs/sehari-setara/Verifikasi_Rujukan.md,
// yang hanya boleh dicentang peninjau konten (manusia). Lihat AGENTS.md bagian 8.
import type { Reference } from "../engine/types";

export const REFERENCE_TEXT = {
  "R-01": "Pasal 28B ayat (2) UUD NRI 1945",
  "R-02": "UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 19",
  "R-03": "Pasal 28G ayat (1) UUD NRI 1945",
  "R-04": "Pasal 31 ayat (1) UUD NRI 1945",
  "R-05": "Pasal 27 ayat (1) UUD NRI 1945",
  "R-06": "UU No. 22 Tahun 2009 tentang LLAJ, Pasal 77 ayat (1) dan Pasal 106 ayat (8)",
  "R-07": "Pasal 28E ayat (3) UUD NRI 1945",
  "R-08": "Pasal 28J ayat (1) UUD NRI 1945",
  "R-09": "Pasal 28D ayat (1) UUD NRI 1945",
  "R-10": "Pasal 24 UUD NRI 1945",
  "R-11": "UU No. 2 Tahun 2002, Pasal 13 dan Pasal 14 ayat (1) huruf g",
  "R-12": "UU No. 48 Tahun 2009, Pasal 8 ayat (1) (asas praduga tak bersalah)",
} as const;

export type RefId = keyof typeof REFERENCE_TEXT;

export const REFERENCES: readonly Reference[] = Object.entries(REFERENCE_TEXT).map(([id, text]) => ({ id, text }));

/** Rujukan berdasarkan kodenya; kode yang salah ketik tertangkap saat kompilasi. */
export function ref(id: RefId): Reference {
  return { id, text: REFERENCE_TEXT[id] };
}
