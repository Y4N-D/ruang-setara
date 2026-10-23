// Hitungan murni untuk panel indikator dan kartu dampak (spesifikasi F-06).
// Tidak menyimpan keadaan dan tidak memakai pengatur waktu; PlayScreen, Meters, dan ImpactCard memakainya.
import { copy } from "../content/copy";
import { metersFromHistory } from "../engine/rules";
import type { Choice, HistoryEntry, Scene, Tier } from "../engine/types";

/** Satu langkah gerak indikator: setengah segmen (5 poin) setiap 100 ms. */
export const METER_STEP_MS = 100;
/** Masa tunggu tombol Lanjut kartu sejak kartu tampil; gerak indikator selesai paling lambat 400 ms. */
export const IMPACT_GUARD_MS = 600;
/** Jumlah segmen batang indikator; satu segmen bernilai 10. */
export const METER_SEGMENTS = 10;

/** Nilai kedua indikator, 0–100. */
export type MeterValues = { hak: number; kewajiban: number };
export type SegmentFill = "penuh" | "separuh" | "kosong";
export type EffectDirection = "naik" | "turun" | "nol";
type EmoteIcon = NonNullable<Choice["emote"]>["icon"];

/** Ikon tingkat di kepala kartu: kunci emoteIcons di manifest, sama dengan aturan ikon reaksi F-03. */
export const TIER_ICON = { tepat: "hati", kurang: "keringat", berisiko: "seru" } as const satisfies Record<Tier, EmoteIcon>;

const MINUS = "\u2212";
const HALF = 5;

/** Isi kesepuluh segmen: penuh bila nilai ≥ 10i, separuh bila 10i − 5 ≤ nilai < 10i, selain itu kosong. */
export function segmentFills(value: number): SegmentFill[] {
  return Array.from({ length: METER_SEGMENTS }, (_, index) => {
    const top = (index + 1) * 10;
    if (value >= top) return "penuh";
    if (value >= top - HALF) return "separuh";
    return "kosong";
  });
}

/** Indikator sebelum adegan sceneId dipilih: history tanpa entri adegan itu. */
export function metersBefore(history: readonly HistoryEntry[], scenes: readonly Scene[], sceneId: Scene["id"]): MeterValues {
  return metersFromHistory(
    history.filter((entry) => entry.sceneId !== sceneId),
    scenes,
  );
}

/** Banyak langkah setengah segmen dari nilai sebelum ke nilai sesudah. */
export function meterSteps(before: number, after: number): number {
  return Math.ceil(Math.abs(after - before) / HALF);
}

/** Nilai yang tampil elapsedMs sesudah kartu tampil: maju satu setengah segmen setiap stepMs, tidak melewati nilai sesudah. */
export function meterValueAt(before: number, after: number, elapsedMs: number, stepMs = METER_STEP_MS): number {
  const distance = Math.abs(after - before);
  if (distance === 0) return after;
  const done = Math.max(0, Math.floor(elapsedMs / stepMs));
  return before + Math.sign(after - before) * Math.min(distance, done * HALF);
}

/** Teks angka melayang: efek naskah, dengan tanda minus U+2212. */
export function effectText(effect: number): string {
  if (effect > 0) return `+${effect}`;
  if (effect < 0) return `${MINUS}${Math.abs(effect)}`;
  return "0";
}

export function effectDirection(effect: number): EffectDirection {
  if (effect > 0) return "naik";
  if (effect < 0) return "turun";
  return "nol";
}

/** Kalimat satu indikator untuk pengumuman kartu. */
export function meterSentence(label: string, effect: number, before: number, after: number): string {
  return copy.meters.sentence(label, effectText(effect), after, after === before);
}

/** Pengumuman kartu di wilayah aria-live (spesifikasi F-06, bagian "Teks yang tampil"). */
export function impactAnnouncement(choice: Choice, before: MeterValues, after: MeterValues): string {
  const { impact } = choice;
  return [
    `${copy.impact.titlePrefix}${copy.impact.tier[choice.tier]}.`,
    meterSentence(copy.meters.hak, choice.effects.hak, before.hak, after.hak),
    meterSentence(copy.meters.kewajiban, choice.effects.kewajiban, before.kewajiban, after.kewajiban),
    `${copy.impact.terjadi}: ${impact.terjadi}`,
    `${copy.impact.hak}: ${impact.hak}`,
    `${copy.impact.kewajiban}: ${impact.kewajiban}`,
    `${copy.impact.rujukan}: ${impact.rujukan.map((reference) => reference.text).join("; ")}.`,
  ].join(" ");
}
