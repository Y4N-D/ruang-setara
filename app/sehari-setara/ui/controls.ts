// Kontrol layar permainan Sehari Setara (spesifikasi F-05; tombol pengatur waktu, bintang, dan suara: F-07;
// pintasan kuis peran: F-08). Semua fungsi di sini murni dan diuji di controls.test.ts. Waktu dan pengatur waktu
// dijalankan oleh PlayScreen.tsx dan useTimer.ts; reducer di engine/ tetap tanpa setTimeout (spesifikasi F-02, AC-14).
import type { ChoiceId, GameAction, GameState, Phase, Stars, TeamSetup } from "../engine/types";
import type { QuizNumber } from "./quiz";

/** Lama tampil reaksi tokoh sebelum REAKSI_SELESAI (Design System bagian 8: 1–1,5 detik). */
export const REACTION_MS = 1200;

/** Sapuan blok piksel: total 400 ms, dan adegan berganti di balik blok pada 200 ms. */
export const WIPE_MS = 400;
export const WIPE_COVER_MS = 200;

/** Pudar bila kurangi gerak aktif: 75 ms keluar, adegan berganti, lalu 75 ms masuk. */
export const FADE_MS = 150;

/** Kecepatan teks per huruf, dalam huruf per detik. */
export const TYPE_CPS = 40;

/** Blok sapuan 20×20 piksel panggung, 16 × 9 blok; offsets membuat tepi bergerigi, showMs = lama tiap blok terlihat. */
export const WIPE = { block: 20, cols: 16, rows: 9, offsets: [0, 2, 1, 3], showMs: 240 } as const;

/* ------------------------------------------------------------------ */
/* Keyboard (Architecture bagian 9)                                      */
/* ------------------------------------------------------------------ */

/** Aksi pengatur waktu yang punya tombol dan pintasan (F-07): P, T, dan S. */
export type TimerActionType = "JEDA_WAKTU" | "TAMBAH_30" | "LEWATI_DISKUSI";

export type PlayCommand =
  | { readonly type: "pilih"; readonly choice: ChoiceId }
  | { readonly type: "lanjut" }
  | { readonly type: "waktu"; readonly action: TimerActionType }
  | { readonly type: "bintang"; readonly stars: Stars }
  | { readonly type: "suara" }
  | { readonly type: "jawab"; readonly nomor: QuizNumber };

const CHOICE_KEYS: Readonly<Record<string, ChoiceId>> = {
  "1": "A",
  a: "A",
  A: "A",
  "2": "B",
  b: "B",
  B: "B",
  "3": "C",
  c: "C",
  C: "C",
};

const TIMER_KEYS: Readonly<Record<string, TimerActionType>> = {
  p: "JEDA_WAKTU",
  P: "JEDA_WAKTU",
  t: "TAMBAH_30",
  T: "TAMBAH_30",
  s: "LEWATI_DISKUSI",
  S: "LEWATI_DISKUSI",
};

const STAR_KEYS: Readonly<Record<string, Stars>> = { "0": 0, "1": 1, "2": 2 };

/** Pintasan kuis peran (F-08): 1 sampai 4 menjawab peran ke-n. */
const QUIZ_KEYS: Readonly<Record<string, QuizNumber>> = { "1": 1, "2": 2, "3": 3, "4": 4 };

/**
 * Fase tempat Spasi dan Enter berarti lanjut: narasi, kartu dampak, dan kuis peran. Sejak F-07 tidak lagi di fase
 * stars, sehingga tekanan kedua dari tekanan ganda pada Lanjut kartu tidak memberi bintang.
 */
const NEXT_PHASES: ReadonlySet<Phase> = new Set<Phase>(["intro", "impact", "quiz"]);

/** Fase adegan, tempat M mematikan atau menyalakan suara (F-07). */
const SOUND_PHASES: ReadonlySet<Phase> = new Set<Phase>(["intro", "discuss", "reaction", "impact", "quiz", "stars", "transition"]);

/** Membaca properti milik objek saja, sehingga kunci seperti "constructor" tidak terbaca dari prototipe. */
function own<T>(table: Readonly<Record<string, T>>, key: string): T | undefined {
  return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined;
}

/** Perintah untuk satu tombol di satu fase, atau null bila tombol itu tidak berpengaruh. */
export function keyCommand(phase: Phase, key: string): PlayCommand | null {
  if (key === " " || key === "Enter") return NEXT_PHASES.has(phase) ? { type: "lanjut" } : null;
  if (key === "m" || key === "M") return SOUND_PHASES.has(phase) ? { type: "suara" } : null;
  if (phase === "discuss") {
    const choice = own(CHOICE_KEYS, key);
    if (choice) return { type: "pilih", choice };
    const action = own(TIMER_KEYS, key);
    return action ? { type: "waktu", action } : null;
  }
  if (phase === "stars") {
    const stars = own(STAR_KEYS, key);
    return stars === undefined ? null : { type: "bintang", stars };
  }
  if (phase === "quiz") {
    const nomor = own(QUIZ_KEYS, key);
    return nomor === undefined ? null : { type: "jawab", nomor };
  }
  return null;
}

/** Keterangan satu tekanan tombol; target menyebut jenis elemen yang sedang berfokus. */
export interface KeyContext {
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  repeat: boolean;
  isComposing: boolean;
  target: "isian" | "tombol" | "lain";
}

/**
 * Salah untuk tekanan yang diabaikan pintasan: bersama Ctrl, Alt, atau Meta; tombol yang ditahan; huruf yang
 * sedang disusun; kolom isian; serta Spasi dan Enter pada tombol atau tautan, yang sudah ditangani browser sebagai klik.
 */
export function shouldHandleKey(ctx: KeyContext): boolean {
  if (ctx.ctrlKey || ctx.altKey || ctx.metaKey || ctx.repeat || ctx.isComposing) return false;
  if (ctx.target === "isian") return false;
  return !(ctx.target === "tombol" && (ctx.key === " " || ctx.key === "Enter"));
}

/* ------------------------------------------------------------------ */
/* Teks per huruf dan sapuan                                             */
/* ------------------------------------------------------------------ */

/** Banyak huruf yang sudah tampil setelah elapsedMs, paling banyak total. */
export function typedLength(elapsedMs: number, total: number, cps: number = TYPE_CPS): number {
  if (!(elapsedMs > 0)) return 0;
  return Math.min(total, Math.floor((elapsedMs * cps) / 1000));
}

export interface WipeBlock {
  col: number;
  row: number;
  delayMs: number;
}

/**
 * Jadwal sapuan: blok di kolom c dan baris r mulai terlihat pada bulat((c + g) × 160 ÷ 18) ms, lalu terlihat 240 ms.
 * Antara 160 dan 240 ms seluruh panggung tertutup; tepi sapuan bergerak ke kanan.
 */
export function wipeSchedule(): WipeBlock[] {
  const lastStart = WIPE_MS - WIPE.showMs;
  const span = WIPE.cols - 1 + Math.max(...WIPE.offsets);
  const blocks: WipeBlock[] = [];
  for (let row = 0; row < WIPE.rows; row++) {
    for (let col = 0; col < WIPE.cols; col++) {
      const offset = WIPE.offsets[row % WIPE.offsets.length];
      blocks.push({ col, row, delayMs: Math.round(((col + offset) * lastStart) / span) });
    }
  }
  return blocks;
}

/* ------------------------------------------------------------------ */
/* Urutan aksi layar permainan                                           */
/* ------------------------------------------------------------------ */

/** Dari keadaan awal sampai fase intro adegan 1: judul, pengaturan, dan prolog dilewati (F-10 belum ada). */
export function startActions(teams: readonly TeamSetup[]): GameAction[] {
  return [{ type: "MULAI" }, { type: "SIMPAN_PENGATURAN", teams: [...teams], settings: {} }, { type: "LANJUT" }];
}

/** Dari layar akhir sementara (fase ending, recap, atau reflection) kembali ke fase intro adegan 1. */
export function restartActions(teams: readonly TeamSetup[]): GameAction[] {
  return [{ type: "LANJUT" }, { type: "LANJUT" }, { type: "MAIN_LAGI" }, ...startActions(teams)];
}

/** Menjalankan aksi berurutan dengan reducer, misalnya untuk keadaan awal layar permainan. */
export function runActions(
  reducer: (state: GameState, action: GameAction) => GameState,
  state: GameState,
  actions: readonly GameAction[],
): GameState {
  return actions.reduce(reducer, state);
}
