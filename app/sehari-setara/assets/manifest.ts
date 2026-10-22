// Satu-satunya pintu masuk aset gambar Sehari Setara (Architecture bagian 8; spesifikasi F-12).
// Komponen hanya memakai kunci di sini, tidak pernah path berkas. Vite mengubah setiap impor menjadi
// URL berkas berhash yang relatif terhadap halaman (aturan assetsInlineLimit di vite.pages.config.ts).
//
// Kunci mengikuti cara naskah menyebut aset: latar memakai nama berkas utuh seperti Scene.bg,
// kelompok lain memakai bagian {nama} dari pola penamaan berkas. Ukuran dalam piksel logis.
// Aset baru: daftarkan di sini dan di CREDITS.md. Uji assets.test.ts memeriksa keduanya.
import type { CharId, Choice, EndingId, PoseId, RoleId, Scene, Team } from "../engine/types";

import bgS1RumahPagi from "./bg/bg_s1_rumah_pagi.png";
import bgS2JalanPagi from "./bg/bg_s2_jalan_pagi.png";
import bgS3KelasSiang from "./bg/bg_s3_kelas_siang.png";
import bgS4KoridorSiang from "./bg/bg_s4_koridor_siang.png";
import bgS5KampungSore from "./bg/bg_s5_kampung_sore.png";
import bgS6KamarMalam from "./bg/bg_s6_kamar_malam.png";
import bgTitle from "./bg/bg_title.png";

import endBerat from "./end/end_berat.png";
import endHampir from "./end/end_hampir.png";
import endSetara from "./end/end_setara.png";

import charBayuHappy from "./sprites/char_bayu_happy.png";
import charBayuIdle from "./sprites/char_bayu_idle.png";
import charDimasHappy from "./sprites/char_dimas_happy.png";
import charDimasMotor from "./sprites/char_dimas_motor.png";
import charDimasSad from "./sprites/char_dimas_sad.png";
import charGitaHappy from "./sprites/char_gita_happy.png";
import charGitaIdle from "./sprites/char_gita_idle.png";
import charGitaSad from "./sprites/char_gita_sad.png";
import charIbuHappy from "./sprites/char_ibu_happy.png";
import charIbuSad from "./sprites/char_ibu_sad.png";
import charIbuTalk from "./sprites/char_ibu_talk.png";
import charKomangHappy from "./sprites/char_komang_happy.png";
import charKomangIdle from "./sprites/char_komang_idle.png";
import charKomangSad from "./sprites/char_komang_sad.png";
import charMadeHappy from "./sprites/char_made_happy.png";
import charMadeSad from "./sprites/char_made_sad.png";
import charMadeTalk from "./sprites/char_made_talk.png";
import charNaraHappy from "./sprites/char_nara_happy.png";
import charNaraIdle from "./sprites/char_nara_idle.png";
import charNaraPhone from "./sprites/char_nara_phone.png";
import charNaraSad from "./sprites/char_nara_sad.png";
import charNaraTalk from "./sprites/char_nara_talk.png";
import charNaraWalk from "./sprites/char_nara_walk.png";
import charRatihIdle from "./sprites/char_ratih_idle.png";
import charRatihTalk from "./sprites/char_ratih_talk.png";
import charSintaHappy from "./sprites/char_sinta_happy.png";
import charSintaIdle from "./sprites/char_sinta_idle.png";
import charSintaSad from "./sprites/char_sinta_sad.png";
import charSintaTalk from "./sprites/char_sinta_talk.png";
import charSiswaMerekam from "./sprites/char_siswa_merekam.png";
import charSiswaTertawa from "./sprites/char_siswa_tertawa.png";
import charWargaA from "./sprites/char_warga_a.png";
import charWargaB from "./sprites/char_warga_b.png";

import emoteHati from "./ui/emote_hati.png";
import emoteKeringat from "./ui/emote_keringat.png";
import emoteSeru from "./ui/emote_seru.png";
import emoteTanya from "./ui/emote_tanya.png";
import roleAdvokat from "./ui/role_advokat.png";
import roleHakim from "./ui/role_hakim.png";
import roleJaksa from "./ui/role_jaksa.png";
import rolePolisi from "./ui/role_polisi.png";
import uiBulan from "./ui/ui_bulan.png";
import uiClock from "./ui/ui_clock.png";
import uiFullscreen from "./ui/ui_fullscreen.png";
import uiHak from "./ui/ui_hak.png";
import uiKewajiban from "./ui/ui_kewajiban.png";
import uiMatahari from "./ui/ui_matahari.png";
import uiSoundOff from "./ui/ui_sound_off.png";
import uiSoundOn from "./ui/ui_sound_on.png";
import uiStar from "./ui/ui_star.png";
import uiTeamBintang from "./ui/ui_team_bintang.png";
import uiTeamLingkaran from "./ui/ui_team_lingkaran.png";
import uiTeamPersegi from "./ui/ui_team_persegi.png";
import uiTeamSegitiga from "./ui/ui_team_segitiga.png";
import uiTimbangan from "./ui/ui_timbangan.png";

/**
 * Strip tokoh: bingkai berjajar mendatar dengan lebar seragam. w dan h adalah ukuran satu bingkai.
 * head adalah titik kepala di bingkai pertama saat menghadap kanan (spesifikasi F-04): x = pusat mendatar
 * kepala (boleh setengah), y = baris teratas yang tak transparan. Dipakai untuk ikon emosi; diperiksa uji aset.
 */
export interface SpriteStrip {
  readonly src: string;
  readonly frames: number;
  readonly fps: number;
  readonly w: number;
  readonly h: number;
  readonly head: { readonly x: number; readonly y: number };
}

/** Strip antarmuka. Waktu animasinya ditentukan fitur pemakainya (bintang F-07, timbangan F-09). */
export interface FrameStrip {
  readonly src: string;
  readonly frames: number;
  readonly w: number;
  readonly h: number;
}

export type EmoteIcon = NonNullable<Choice["emote"]>["icon"];

/** Satu aset panggung yang dirujuk adegan. key = nama berkas tanpa .png; src undefined bila tidak ada di manifest. */
export interface AssetRef {
  readonly key: string;
  readonly src: string | undefined;
}

/*
  fps strip tokoh (Design System bagian 8; spesifikasi F-12): 4 bila bingkai kedua mengubah mulut
  (bicara atau tertawa), 2 bila hanya tubuh yang bergerak, 8 untuk berjalan, dan 2 untuk strip
  satu bingkai (nilainya tidak berpengaruh). Ukuran bingkai mengikuti Design System bagian 10.
*/
type Head = readonly [x: number, y: number];
const strip = (w: number, h: number) => (src: string, frames: number, fps: number, [x, y]: Head): SpriteStrip => ({
  src,
  frames,
  fps,
  w,
  h,
  head: { x, y },
});
const anak = strip(24, 48);
const smp = strip(26, 62);
const dewasa = strip(30, 68);
const motor = strip(56, 62);

/** Latar 320×180. Kunci = Scene.bg di content/scenes.ts. */
export const backgrounds = {
  bg_s1_rumah_pagi: bgS1RumahPagi,
  bg_s2_jalan_pagi: bgS2JalanPagi,
  bg_s3_kelas_siang: bgS3KelasSiang,
  bg_s4_koridor_siang: bgS4KoridorSiang,
  bg_s5_kampung_sore: bgS5KampungSore,
  bg_s6_kamar_malam: bgS6KamarMalam,
  bg_title: bgTitle,
} as const satisfies Readonly<Record<string, string>>;

/** Warna bayangan kaki tokoh per latar, sesuai pratinjau adegan yang disetujui (spesifikasi F-04). */
export type ShadowTone = "wood-d" | "dusk" | "slate" | "wood";

export const floorShadows = {
  bg_s1_rumah_pagi: "wood-d",
  bg_s2_jalan_pagi: "dusk",
  bg_s3_kelas_siang: "slate",
  bg_s4_koridor_siang: "wood",
  bg_s5_kampung_sore: "slate",
  bg_s6_kamar_malam: "wood-d",
  bg_title: "wood",
} as const satisfies Readonly<Record<keyof typeof backgrounds, ShadowTone>>;

/** Ilustrasi akhir 320×180 untuk setiap jenis akhir (PRD bagian 9). */
export const endings = {
  setara: endSetara,
  hampir: endHampir,
  berat: endBerat,
} as const satisfies Readonly<Record<EndingId, string>>;

/** Strip tokoh: tokoh → pose → strip. Nama berkas: char_{tokoh}_{pose}.png. */
export const sprites = {
  nara: {
    idle: smp(charNaraIdle, 2, 2, [13, 2]), // bernapas
    talk: smp(charNaraTalk, 2, 4, [13, 2]), // bicara
    happy: smp(charNaraHappy, 1, 2, [13, 2]),
    sad: smp(charNaraSad, 1, 2, [13, 3]),
    walk: smp(charNaraWalk, 4, 8, [13, 2]), // berjalan
    phone: smp(charNaraPhone, 2, 2, [13, 2]), // bernapas, ibu jari bergerak
  },
  ibu: {
    talk: dewasa(charIbuTalk, 2, 4, [14, 0]), // bicara
    happy: dewasa(charIbuHappy, 1, 2, [14, 0]),
    sad: dewasa(charIbuSad, 1, 2, [14, 0]),
  },
  gita: {
    idle: anak(charGitaIdle, 1, 2, [12, 1]),
    happy: anak(charGitaHappy, 1, 2, [12, 1]),
    sad: anak(charGitaSad, 1, 2, [12, 2]),
  },
  dimas: {
    motor: motor(charDimasMotor, 2, 4, [19, 1]), // bicara sambil menepuk jok
    happy: motor(charDimasHappy, 1, 2, [19, 1]),
    sad: motor(charDimasSad, 1, 2, [19, 2]),
  },
  sinta: {
    idle: smp(charSintaIdle, 2, 2, [13.5, 3]), // bernapas
    talk: smp(charSintaTalk, 2, 4, [13.5, 3]), // bicara
    happy: smp(charSintaHappy, 1, 2, [13.5, 3]),
    sad: smp(charSintaSad, 1, 2, [13.5, 4]),
  },
  ratih: {
    idle: dewasa(charRatihIdle, 2, 2, [14, 4]), // bernapas
    talk: dewasa(charRatihTalk, 2, 4, [14, 4]), // bicara sambil menjelaskan
  },
  komang: {
    idle: smp(charKomangIdle, 2, 2, [13, 4]), // bernapas
    sad: smp(charKomangSad, 2, 2, [13, 5]), // menunduk memegang sepatu
    happy: smp(charKomangHappy, 1, 2, [13, 4]),
  },
  made: {
    talk: dewasa(charMadeTalk, 2, 4, [14, 4]), // bicara sambil menunjuk
    happy: dewasa(charMadeHappy, 1, 2, [14, 4]),
    sad: dewasa(charMadeSad, 1, 2, [14, 5]),
  },
  bayu: {
    idle: dewasa(charBayuIdle, 2, 2, [14, 4]), // menggaruk kepala
    happy: dewasa(charBayuHappy, 1, 2, [14, 4]),
  },
  siswa: {
    merekam: smp(charSiswaMerekam, 2, 4, [13, 0]), // tertawa sambil merekam
    tertawa: smp(charSiswaTertawa, 2, 4, [12, 2]), // tertawa
  },
  warga: {
    a: dewasa(charWargaA, 2, 4, [14, 5]), // bicara keras sambil menunjuk
    b: dewasa(charWargaB, 2, 4, [13.5, 3]), // bicara keras sambil bersedekap
  },
} as const satisfies Readonly<Record<CharId, Readonly<Record<string, SpriteStrip>>>>;

/** Ikon antarmuka 16×16. Nama berkas: ui_{kunci}.png. matahari dan bulan menandai busur hari (D-11, F-04). */
export const icons = {
  hak: uiHak,
  kewajiban: uiKewajiban,
  clock: uiClock,
  sound_on: uiSoundOn,
  sound_off: uiSoundOff,
  fullscreen: uiFullscreen,
  matahari: uiMatahari,
  bulan: uiBulan,
} as const satisfies Readonly<Record<string, string>>;

/** Strip antarmuka. Nama berkas: ui_{kunci}.png. */
export const iconStrips = {
  /** Bintang alasan, bingkai 0–2: kecil, besar berkilau, normal (Daftar_Aset D-03). */
  star: { src: uiStar, frames: 3, w: 16, h: 16 },
  /** Timbangan, bingkai 0–4: miring kiri, sedikit kiri, seimbang, sedikit kanan, miring kanan (D-10). */
  timbangan: { src: uiTimbangan, frames: 5, w: 48, h: 32 },
} as const satisfies Readonly<Record<string, FrameStrip>>;

/** Bentuk tim 16×16. Nama berkas: ui_team_{bentuk}.png. */
export const teamIcons = {
  lingkaran: uiTeamLingkaran,
  segitiga: uiTeamSegitiga,
  persegi: uiTeamPersegi,
  bintang: uiTeamBintang,
} as const satisfies Readonly<Record<Team["shape"], string>>;

/** Ikon peran penegak hukum 32×32. Nama berkas: role_{peran}.png. */
export const roleIcons = {
  polisi: rolePolisi,
  jaksa: roleJaksa,
  advokat: roleAdvokat,
  hakim: roleHakim,
} as const satisfies Readonly<Record<RoleId, string>>;

/** Ikon emosi 8×8 di atas kepala tokoh. Nama berkas: emote_{ikon}.png. */
export const emoteIcons = {
  hati: emoteHati,
  keringat: emoteKeringat,
  tanya: emoteTanya,
  seru: emoteSeru,
} as const satisfies Readonly<Record<EmoteIcon, string>>;

/** Membaca properti milik objek saja, sehingga kunci seperti "constructor" tidak terbaca dari prototipe. */
function own<T>(table: Readonly<Record<string, T>>, key: string): T | undefined {
  return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined;
}

const spriteTable: Readonly<Record<string, Readonly<Record<string, SpriteStrip>>>> = sprites;
const backgroundTable: Readonly<Record<string, string>> = backgrounds;
const shadowTable: Readonly<Record<string, ShadowTone>> = floorShadows;
const emoteTable: Readonly<Record<string, string>> = emoteIcons;

/** URL latar untuk kunci Scene.bg; undefined bila kunci tidak ada. */
export function backgroundFor(key: string): string | undefined {
  return own(backgroundTable, key);
}

/** Warna bayangan kaki untuk kunci Scene.bg; undefined bila kunci tidak ada. */
export function shadowFor(key: string): ShadowTone | undefined {
  return own(shadowTable, key);
}

/** Strip untuk pasangan tokoh-pose; undefined bila pasangan itu tidak ada. */
export function spriteFor(char: CharId, pose: PoseId): SpriteStrip | undefined {
  const poses = own(spriteTable, char);
  return poses && own(poses, pose);
}

/**
 * Aset panggung satu adegan tanpa duplikat, berurutan: latar, tokoh di pemeran, tokoh di reaksi A, B, C,
 * lalu ikon emosi pilihan A, B, C. Dipakai uji (F-12) dan pramuat gambar adegan berikutnya (F-04).
 */
export function sceneAssets(scene: Scene): AssetRef[] {
  const found = new Map<string, string | undefined>();
  const add = (key: string, src: string | undefined) => {
    if (!found.has(key)) found.set(key, src);
  };
  add(scene.bg, own(backgroundTable, scene.bg));
  for (const slot of [...scene.cast, ...scene.choices.flatMap((choice) => choice.reaction)]) {
    add(`char_${slot.char}_${slot.pose}`, spriteFor(slot.char, slot.pose)?.src);
  }
  for (const choice of scene.choices) {
    if (choice.emote) add(`emote_${choice.emote.icon}`, own(emoteTable, choice.emote.icon));
  }
  return [...found].map(([key, src]) => ({ key, src }));
}
