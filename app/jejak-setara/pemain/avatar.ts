// Ikon kepala avatar A1–A8 (A-09, Disetujui), berurutan sehingga nomor avatar protokol (0–7) menjadi indeks.
// Sejak JS-07 diambil dari manifest.ts, satu-satunya pintu masuk aset (Architecture 11.2).
import { AVATAR, IKON } from "../assets/manifest";

export const IKON_AVATAR: readonly string[] = AVATAR.map((a) => a.ikon.url);
export const IKON_MENYAMBUNG: string = IKON.ikon_menyambung.url;
