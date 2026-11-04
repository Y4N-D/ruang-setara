// Fungsi murni layar pembuka Sehari Setara (spesifikasi F-10): tim dan jadwal giliran di pengaturan kelas, pilihan
// sementara, aksi "Mulai permainan", fase dan isi dialog pengaturan, serta adegan semu layar judul dan prolog. Diuji di
// opening.test.ts. Nama berkas bukan setup.ts atau settings.ts, agar tidak tertukar dengan Setup.tsx dan Settings.tsx di
// sistem berkas yang tidak membedakan huruf besar (Windows dan macOS); sepasang dengan closing.ts F-09.
import { copy } from "../content/copy";
import { DEFAULT_TEAMS } from "../content/teams";
import { activeTeamIndex } from "../engine/rules";
import type { GameAction, GameState, Phase, PoseId, Scene, Settings, TeamSetup } from "../engine/types";

/** Masa tunggu tombol layar judul, pengaturan kelas, dan prolog, sama dengan layar penutup F-09 (usulan 9a). */
export const OPENING_GUARD_MS = 600;

/** Jumlah tim yang bisa dipilih di pengaturan kelas (FR-02), dan bawaannya 3 tim (usulan 3). */
export type TeamCount = 2 | 3 | 4;
export const TEAM_COUNTS: readonly TeamCount[] = [2, 3, 4];
export const DEFAULT_TEAM_COUNT: TeamCount = 3;

/** Durasi diskusi yang bisa dipilih (FR-02). */
export const DISCUSS_CHOICES: readonly Settings["discussSeconds"][] = [30, 60, 90];

/** Fase layar pembuka; di sini Enter dan Spasi yang berulang dibatalkan (DRAF J-11). */
export const OPENING_PHASES: ReadonlySet<Phase> = new Set<Phase>(["title", "setup", "prolog"]);

/** Pilihan sementara pengaturan kelas sampai "Mulai permainan" (DRAF J-3). */
export interface SetupDraft {
  readonly count: TeamCount;
  readonly seconds: Settings["discussSeconds"];
}

const isTeamCount = (n: number): n is TeamCount => n === 2 || n === 3 || n === 4;

/** Pilihan awal pengaturan kelas: banyak tim di state.teams bila 2–4, selain itu 3, dan durasi dari pengaturan. */
export function setupDraftFrom(state: Pick<GameState, "teams" | "settings">): SetupDraft {
  const count = state.teams.length;
  return { count: isTeamCount(count) ? count : DEFAULT_TEAM_COUNT, seconds: state.settings.discussSeconds };
}

/** Tim pertama sebanyak count dari daftar bawaan, berurutan (usulan 3a). */
export function teamsForCount(count: TeamCount, list: readonly TeamSetup[] = DEFAULT_TEAMS): TeamSetup[] {
  return list.slice(0, count).map((team) => ({ ...team }));
}

/** Nomor adegan (mulai 1) tempat tim ke-index bergiliran, sama dengan activeTeamIndex di mesin. */
export function turnScenes(index: number, count: number, sceneCount: number): number[] {
  const scenes: number[] = [];
  for (let s = 0; s < sceneCount; s++) if (activeTeamIndex(s, count) === index) scenes.push(s + 1);
  return scenes;
}

/** Jadwal yang terlihat, misalnya "Adegan 1, 4". */
export function turnText(scenes: readonly number[]): string {
  return copy.setup.turns(scenes.join(", "));
}

/** Daftar dengan "dan" sebelum butir terakhir: "A", "A dan B", "A, B, dan C". */
export function listText(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} ${copy.list.and} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${copy.list.and} ${items[items.length - 1]}`;
}

/** Kalimat pembaca layar setiap tim, misalnya "Tim Mangga, giliran adegan 1 dan 4.". */
export function teamTurnSentence(name: string, scenes: readonly number[]): string {
  return copy.setup.turnSentence(name, listText(scenes.map(String)));
}

/** Pengumuman jumlah tim, misalnya "3 tim: Tim Mangga, Tim Laut, dan Tim Daun.". */
export function teamCountAnnouncement(teams: readonly Pick<TeamSetup, "name">[]): string {
  return copy.setup.countAnnounce(teams.length, listText(teams.map((team) => team.name)));
}

/** Aksi "Mulai permainan": SIMPAN_PENGATURAN dengan tim pilihan dan durasi diskusi. */
export function setupActions(draft: SetupDraft, list: readonly TeamSetup[] = DEFAULT_TEAMS): GameAction[] {
  return [{ type: "SIMPAN_PENGATURAN", teams: teamsForCount(draft.count, list), settings: { discussSeconds: draft.seconds } }];
}

/** Fase tempat Esc dan tombol "Pengaturan" membuka dialog pengaturan (usulan 5a). */
export const SETTINGS_PHASES: ReadonlySet<Phase> = new Set<Phase>(["prolog", "intro", "discuss", "stars"]);

/** Benar bila dialog pengaturan bisa dibuka: fase di SETTINGS_PHASES dan tidak ada pergantian adegan. */
export function settingsOpenable(phase: Phase, changing: boolean): boolean {
  return SETTINGS_PHASES.has(phase) && !changing;
}

/** Keadaan setiap baris dialog pengaturan. */
export interface SettingsView {
  readonly sound: boolean;
  /** on: kurangi gerak dari komputer atau game; locked: dari komputer, sehingga tidak bisa diubah (usulan 6a1). */
  readonly motion: { readonly on: boolean; readonly locked: boolean };
  /** note: catatan "Teks langsung lengkap..." tampil selama kurangi gerak menyala. */
  readonly typewriter: { readonly on: boolean; readonly note: boolean };
  readonly seconds: Settings["discussSeconds"];
}

export function settingsView(settings: Settings, systemReduced: boolean): SettingsView {
  const motionOn = systemReduced || settings.reducedMotion;
  return {
    sound: settings.sound,
    motion: { on: motionOn, locked: systemReduced },
    typewriter: { on: settings.typewriter, note: motionOn },
    seconds: settings.discussSeconds,
  };
}

/** Letak Nara di layar judul dan prolog (piksel logis). */
export const TITLE_NARA_X = 96;
export const PROLOG_NARA_X = 160;

/** Adegan semu untuk Stage: adegan base berlatar bg_title dengan satu Nara menghadap kanan. base tidak diubah. */
export function openingScene(base: Scene, pose: PoseId, x: number, altText: string): Scene {
  return { ...base, bg: "bg_title", altText, cast: [{ char: "nara", pose, x, facing: "right" }] };
}
