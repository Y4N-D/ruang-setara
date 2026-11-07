// Ikon kepala avatar A1–A8 (A-09, Disetujui), berurutan sehingga nomor avatar protokol (0–7) menjadi indeks.
// manifest.ts (C-6) belum ada saat JS-03 dibangun, jadi ikon diimpor langsung; JS-07 memindahkannya ke manifest.
import ava1 from "../assets/ikon/ikon_ava_1.png";
import ava2 from "../assets/ikon/ikon_ava_2.png";
import ava3 from "../assets/ikon/ikon_ava_3.png";
import ava4 from "../assets/ikon/ikon_ava_4.png";
import ava5 from "../assets/ikon/ikon_ava_5.png";
import ava6 from "../assets/ikon/ikon_ava_6.png";
import ava7 from "../assets/ikon/ikon_ava_7.png";
import ava8 from "../assets/ikon/ikon_ava_8.png";
import menyambung from "../assets/ikon/ikon_menyambung.png";

export const IKON_AVATAR: readonly string[] = [ava1, ava2, ava3, ava4, ava5, ava6, ava7, ava8];
export const IKON_MENYAMBUNG: string = menyambung;
