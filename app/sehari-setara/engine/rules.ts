// Aturan permainan Sehari Setara: fungsi murni yang diuji unit.
// clamp, activeTeamIndex, dan endingFor persis seperti Architecture bagian 6.
// history adalah sumber kebenaran: indikator, bendera, dan bintang tim selalu
// dihitung ulang darinya, sehingga pembatalan pilihan (FR-18, F-13) cukup memotong history.
import type {
  Choice,
  ChoiceId,
  EndingId,
  Flag,
  GameState,
  HistoryEntry,
  RoleId,
  Scene,
  Team,
} from "./types";

export type Meters = GameState["meters"];

/** Nilai awal kedua indikator (PRD FR-08). */
export const METER_START = 50;

export const clamp = (v: number) => Math.max(0, Math.min(100, v));

export const activeTeamIndex = (sceneIndex: number, teamCount: number) =>
  sceneIndex % teamCount;

export function endingFor(m: { hak: number; kewajiban: number }): EndingId {
  if (m.hak >= 75 && m.kewajiban >= 75) return "setara";
  if (m.hak < 40 || m.kewajiban < 40) return "berat";
  return "hampir";
}

/** Menambahkan efek satu pilihan, lalu membatasi kedua indikator ke 0–100. */
export function applyEffects(meters: Meters, effects: Choice["effects"]): Meters {
  return {
    hak: clamp(meters.hak + effects.hak),
    kewajiban: clamp(meters.kewajiban + effects.kewajiban),
  };
}

export function findChoice(
  scenes: readonly Scene[],
  sceneId: Scene["id"],
  choiceId: ChoiceId,
): Choice | undefined {
  return scenes.find((scene) => scene.id === sceneId)?.choices.find((choice) => choice.id === choiceId);
}

/** Indikator dari history: mulai 50/50, efek diterapkan berurutan dengan batas per langkah. */
export function metersFromHistory(history: readonly HistoryEntry[], scenes: readonly Scene[]): Meters {
  let meters: Meters = { hak: METER_START, kewajiban: METER_START };
  for (const entry of history) {
    const choice = findChoice(scenes, entry.sceneId, entry.choiceId);
    if (choice) meters = applyEffects(meters, choice.effects);
  }
  return meters;
}

/** Bendera dari pilihan yang diambil, berurutan dan tanpa duplikat. */
export function flagsFromHistory(history: readonly HistoryEntry[], scenes: readonly Scene[]): Flag[] {
  const flags: Flag[] = [];
  for (const entry of history) {
    const flag = findChoice(scenes, entry.sceneId, entry.choiceId)?.setsFlag;
    if (flag && !flags.includes(flag)) flags.push(flag);
  }
  return flags;
}

/** Jumlah bintang alasan per id tim. */
export function starsByTeam(history: readonly HistoryEntry[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const entry of history) totals.set(entry.teamId, (totals.get(entry.teamId) ?? 0) + entry.stars);
  return totals;
}

/** Keadaan dengan meters, flags, dan bintang tim dihitung ulang dari history. */
export function withDerived(state: GameState, scenes: readonly Scene[]): GameState {
  const stars = starsByTeam(state.history);
  return {
    ...state,
    meters: metersFromHistory(state.history, scenes),
    flags: flagsFromHistory(state.history, scenes),
    teams: state.teams.map((team) => ({ ...team, stars: stars.get(team.id) ?? 0 })),
  };
}

/** Tim yang mendapat giliran di adegan berjalan; undefined bila belum ada tim. */
export function activeTeam(state: GameState): Team | undefined {
  if (state.teams.length === 0) return undefined;
  return state.teams[activeTeamIndex(state.sceneIndex, state.teams.length)];
}

/** Teks pilihan; memakai varian bila benderanya sudah disetel (FR-10). */
export function choiceText(choice: Choice, flags: readonly Flag[]): string {
  return choice.textIfFlag && flags.includes(choice.textIfFlag.flag) ? choice.textIfFlag.text : choice.text;
}

/** Layar narasi adegan, disambung bagian present atau absent bila adegan punya varian (FR-10). */
export function narrationFor(scene: Scene, flags: readonly Flag[]): string[] {
  const variant = scene.narrationIfFlag;
  if (!variant) return [...scene.narration];
  return [...scene.narration, ...(flags.includes(variant.flag) ? variant.present : variant.absent)];
}

export function isQuizCorrect(scene: Scene, answer: RoleId | null): boolean {
  return scene.roleQuiz !== undefined && answer === scene.roleQuiz.answer;
}
