// Hitungan murni panel kanan Sehari Setara (spesifikasi F-07): papan tim, pengatur waktu, dan bintang alasan.
// Semua fungsi di sini murni dan diuji di turn.test.ts. Berkas ini tidak dinamai timer.ts agar tidak tertukar dengan
// Timer.tsx di sistem berkas yang tidak membedakan huruf besar (Windows dan macOS).
import { copy } from "../content/copy";
import type { GameState } from "../engine/types";

export type TimerState = GameState["timer"];

/** Batang pengatur waktu: 12 blok (Design System bagian 7). */
export const TIMER_BLOCKS = 12;
/** Sepuluh detik terakhir berwarna mango. */
export const LAST_SECONDS = 10;
/** "+30" dan T hanya berlaku bila sisa ≤ 569 detik (9:29), sehingga angka tidak pernah mencapai 10:00. */
export const ADD_LIMIT = 569;
/** Kait pengatur waktu memeriksa jam setiap 250 ms. */
export const TIMER_POLL_MS = 250;
/** Pop bintang alasan: 3 bingkai strip D-03, masing-masing 80 ms (Design System bagian 8). */
export const STAR_POP_MS = 240;
export const STAR_POP_FRAMES = 3;

/** Sisa waktu sebagai menit:detik, misalnya 1:00, 0:42, dan 9:59. */
export function clockText(seconds: number): string {
  const total = seconds > 0 ? Math.floor(seconds) : 0;
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Durasi untuk pembaca layar: "42 detik", "1 menit", atau "1 menit 12 detik". */
export function durationText(seconds: number): string {
  const total = seconds > 0 ? Math.floor(seconds) : 0;
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  if (minutes === 0) return copy.timer.seconds(rest);
  return rest === 0 ? copy.timer.minutes(minutes) : copy.timer.minutesSeconds(minutes, rest);
}

/** Banyak blok berisi: sisa × 12 ÷ durasi, dibulatkan ke atas, paling banyak 12. */
export function filledBlocks(remaining: number, duration: number): number {
  if (!(remaining > 0) || !(duration > 0)) return 0;
  return Math.min(TIMER_BLOCKS, Math.ceil((remaining * TIMER_BLOCKS) / duration));
}

export type TimerTone = "biasa" | "akhir" | "habis";

/** Warna blok: biasa (sky-d), sepuluh detik terakhir (mango), atau habis. */
export function timerTone(remaining: number): TimerTone {
  if (!(remaining > 0)) return "habis";
  return remaining <= LAST_SECONDS ? "akhir" : "biasa";
}

export type TimerStatus = "berjalan" | "dijeda" | "habis";

/** Keadaan untuk tulisan label dan tombol. */
export function timerStatus(timer: TimerState): TimerStatus {
  if (!(timer.remaining > 0)) return "habis";
  return timer.running ? "berjalan" : "dijeda";
}

/** Benar bila "+30" dan T masih berlaku. */
export function canAddTime(remaining: number): boolean {
  return remaining <= ADD_LIMIT;
}

/** Detik utuh yang sudah lewat sejak titik acuan; 0 untuk nilai negatif atau bukan angka. */
export function dueTicks(elapsedMs: number): number {
  return elapsedMs > 0 ? Math.floor(elapsedMs / 1000) : 0;
}

/** Penyebab perubahan pengatur waktu, untuk memilih pengumuman. */
export type TimerCause = "mulai" | "tick" | "jeda" | "tambah" | "lewati";

/**
 * Pengumuman wilayah status untuk satu perubahan pengatur waktu, atau null bila tidak ada peristiwa yang perlu
 * diumumkan (spesifikasi F-07, bagian Pembaca layar). Detik biasa tidak pernah diumumkan.
 */
export function timerAnnouncement(before: TimerState, after: TimerState, cause: TimerCause): string | null {
  const left = durationText(after.remaining);
  const { announce } = copy.timer;
  switch (cause) {
    case "mulai":
      return announce.start(durationText(after.duration));
    case "tick":
      if (after.remaining >= before.remaining) return null;
      if (!(after.remaining > 0)) return announce.over;
      return before.remaining > LAST_SECONDS && after.remaining <= LAST_SECONDS ? announce.last(left) : null;
    case "jeda":
      if (after.running === before.running) return null;
      return after.running ? announce.resume(left) : announce.pause(left);
    case "tambah":
      return after.remaining > before.remaining ? announce.add(left) : null;
    case "lewati":
      return before.remaining > 0 && !(after.remaining > 0) ? announce.skip : null;
  }
}

/** Pengumuman sesudah bintang alasan diberikan. */
export function starsAnnouncement(name: string, stars: number, total: number): string {
  return copy.stars.announce(name, stars, total);
}

/** Kalimat satu butir papan tim bagi pembaca layar; top menandai tim dengan bintang terbanyak di layar akhir (F-09). */
export function teamSentence(name: string, active: boolean, stars: number, top = false): string {
  return copy.teams.sentence(name, active, stars, top);
}
