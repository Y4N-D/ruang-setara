// Ikon untuk halaman ruang dan layar kelas (spesifikasi JS-10, bagian "Aset"; JS-11, P-23, P-24, dan P-34). Diimpor
// langsung dari berkas PNG, bukan lewat manifest.ts, agar kode layar pemain tidak ikut membesar (JS-10 P-35).
import ava1 from "../../assets/ikon/ikon_ava_1.png";
import ava2 from "../../assets/ikon/ikon_ava_2.png";
import ava3 from "../../assets/ikon/ikon_ava_3.png";
import ava4 from "../../assets/ikon/ikon_ava_4.png";
import ava5 from "../../assets/ikon/ikon_ava_5.png";
import ava6 from "../../assets/ikon/ikon_ava_6.png";
import ava7 from "../../assets/ikon/ikon_ava_7.png";
import ava8 from "../../assets/ikon/ikon_ava_8.png";
import zona1 from "../../assets/ikon/ikon_zona_1.png";
import zona2 from "../../assets/ikon/ikon_zona_2.png";
import zona3 from "../../assets/ikon/ikon_zona_3.png";
import zona4 from "../../assets/ikon/ikon_zona_4.png";
import zona5 from "../../assets/ikon/ikon_zona_5.png";
import zona6 from "../../assets/ikon/ikon_zona_6.png";
import zona7 from "../../assets/ikon/ikon_zona_7.png";
import zona8 from "../../assets/ikon/ikon_zona_8.png";
import centang from "../../assets/ikon/ikon_centang.png";
import emosiHati from "../../assets/ikon/ikon_emosi_hati.png";
import emosiKeringat from "../../assets/ikon/ikon_emosi_keringat.png";
import emosiSeru from "../../assets/ikon/ikon_emosi_seru.png";
import emosiTanya from "../../assets/ikon/ikon_emosi_tanya.png";
import layarPenuh from "../../assets/ikon/ikon_layar_penuh.png";
import matahari from "../../assets/ikon/ikon_matahari.png";

/** Avatar 0–7 (JS-03). */
export const AVATAR: readonly string[] = [ava1, ava2, ava3, ava4, ava5, ava6, ava7, ava8];
/** Ikon zona 1–8 (indeks 0 = zona 1). */
export const ZONA: readonly string[] = [zona1, zona2, zona3, zona4, zona5, zona6, zona7, zona8];
export const EMOSI = { tepat: emosiHati, kurang: emosiTanya, berisiko: emosiSeru } as const;
/**
 * JS-11 (bagian "Aset"): tanda tingkat Langkah 2 di hasil ruang, seperti kepala kartu dampak JS-08 (kurang tepat =
 * keringat), serta tanda Langkah 1 (tepat = hati, belum tepat = tanya).
 */
export const EMOSI_HASIL = { tepat: emosiHati, kurang: emosiKeringat, berisiko: emosiSeru, belum: emosiTanya } as const;
/** `centang`: JS-11 (P-34), 10 besar dan label "Jawaban tepat" di layar kelas. */
export const IKON_KELAS = { layarPenuh, matahari, centang } as const;
