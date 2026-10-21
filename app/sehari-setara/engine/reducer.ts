// Reducer murni Sehari Setara (Architecture bagian 6; spesifikasi F-02).
// Aksi yang tidak berlaku untuk fase berjalan, atau yang syaratnya tidak terpenuhi,
// mengembalikan objek keadaan yang sama sehingga klik ganda tidak berpengaruh.
// Reducer tidak mengubah masukannya dan tidak bergantung pada waktu atau bilangan acak;
// detik diskusi datang dari aksi TICK yang dikirim antarmuka.
import { activeTeam, withDerived } from "./rules";
import type { GameAction, GameState, HistoryEntry, Scene, Settings, TeamSetup } from "./types";

/** Nilai bawaan pengaturan (PRD bagian 16; Design System bagian 7 dan 9). */
export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  reducedMotion: false,
  typewriter: true,
  discussSeconds: 60,
};

const DISCUSS_OPTIONS: readonly Settings["discussSeconds"][] = [30, 60, 90];
const STAR_OPTIONS: readonly number[] = [0, 1, 2];

/** Menggabungkan nilai pengaturan yang sah; nilai lain diabaikan. */
function mergeSettings(current: Settings, patch: Partial<Settings>): Settings {
  const next: Settings = { ...current };
  if (typeof patch.sound === "boolean") next.sound = patch.sound;
  if (typeof patch.reducedMotion === "boolean") next.reducedMotion = patch.reducedMotion;
  if (typeof patch.typewriter === "boolean") next.typewriter = patch.typewriter;
  if (patch.discussSeconds !== undefined && DISCUSS_OPTIONS.includes(patch.discussSeconds)) {
    next.discussSeconds = patch.discussSeconds;
  }
  return next;
}

function sameSettings(a: Settings, b: Settings): boolean {
  return (
    a.sound === b.sound &&
    a.reducedMotion === b.reducedMotion &&
    a.typewriter === b.typewriter &&
    a.discussSeconds === b.discussSeconds
  );
}

function freshTimer(settings: Settings, running: boolean): GameState["timer"] {
  return { duration: settings.discussSeconds, remaining: settings.discussSeconds, running };
}

/** 2–4 tim, id unik, nama tidak kosong setelah dipangkas (PRD FR-02). */
function validTeams(teams: readonly TeamSetup[]): boolean {
  if (teams.length < 2 || teams.length > 4) return false;
  if (new Set(teams.map((team) => team.id)).size !== teams.length) return false;
  return teams.every((team) => team.name.trim() !== "");
}

export function createInitialState(settings: Partial<Settings> = {}): GameState {
  const merged = mergeSettings(DEFAULT_SETTINGS, settings);
  return {
    phase: "title",
    sceneIndex: 0,
    meters: { hak: 50, kewajiban: 50 },
    flags: [],
    teams: [],
    history: [],
    timer: freshTimer(merged, false),
    settings: merged,
    quizAnswer: null,
  };
}

/** Aksi di fase discuss: memilih dan mengatur waktu diskusi. */
function discussStep(state: GameState, action: GameAction, scenes: readonly Scene[]): GameState {
  const { timer } = state;
  switch (action.type) {
    case "PILIH": {
      const scene = scenes[state.sceneIndex];
      const team = activeTeam(state);
      if (!scene || !team) return state;
      if (!scene.choices.some((choice) => choice.id === action.choice)) return state;
      if (state.history.some((entry) => entry.sceneId === scene.id)) return state;
      const history: HistoryEntry[] = [
        ...state.history,
        { sceneId: scene.id, choiceId: action.choice, teamId: team.id, stars: 0 },
      ];
      return withDerived({ ...state, phase: "reaction", history, timer: { ...timer, running: false } }, scenes);
    }
    case "TICK": {
      if (!timer.running || timer.remaining <= 0) return state;
      const remaining = timer.remaining - 1;
      return { ...state, timer: { ...timer, remaining, running: remaining > 0 } };
    }
    case "JEDA_WAKTU":
      return timer.remaining > 0 ? { ...state, timer: { ...timer, running: !timer.running } } : state;
    case "TAMBAH_30": {
      const remaining = timer.remaining + 30;
      return {
        ...state,
        timer: {
          duration: Math.max(timer.duration, remaining),
          remaining,
          running: timer.remaining === 0 ? true : timer.running,
        },
      };
    }
    case "LEWATI_DISKUSI":
      return timer.remaining > 0 ? { ...state, timer: { ...timer, remaining: 0, running: false } } : state;
    default:
      return state;
  }
}

export function createReducer(scenes: readonly Scene[]) {
  const lastIndex = scenes.length - 1;

  return function reducer(state: GameState, action: GameAction): GameState {
    if (action.type === "UBAH_PENGATURAN") {
      const settings = mergeSettings(state.settings, action.settings);
      return sameSettings(settings, state.settings) ? state : { ...state, settings };
    }

    switch (state.phase) {
      case "title":
        return action.type === "MULAI" ? { ...state, phase: "setup" } : state;

      case "setup":
        if (action.type !== "SIMPAN_PENGATURAN" || !validTeams(action.teams)) return state;
        return {
          ...state,
          phase: "prolog",
          teams: action.teams.map(({ id, name, color, shape }) => ({ id, name, color, shape, stars: 0 })),
          settings: mergeSettings(state.settings, action.settings),
        };

      case "prolog":
        return action.type === "LANJUT" ? { ...state, phase: "intro", sceneIndex: 0 } : state;

      case "intro":
        return action.type === "NARASI_SELESAI"
          ? { ...state, phase: "discuss", timer: freshTimer(state.settings, true) }
          : state;

      case "discuss":
        return discussStep(state, action, scenes);

      case "reaction":
        return action.type === "REAKSI_SELESAI" ? { ...state, phase: "impact" } : state;

      case "impact":
        if (action.type !== "LANJUT") return state;
        return { ...state, phase: scenes[state.sceneIndex]?.roleQuiz ? "quiz" : "stars" };

      case "quiz":
        if (action.type === "JAWAB_KUIS") {
          return state.quizAnswer === null ? { ...state, quizAnswer: action.role } : state;
        }
        if (action.type === "LANJUT") {
          return state.quizAnswer !== null ? { ...state, phase: "stars" } : state;
        }
        return state;

      case "stars": {
        if (action.type !== "BERI_BINTANG" || !STAR_OPTIONS.includes(action.stars)) return state;
        const sceneId = scenes[state.sceneIndex]?.id;
        const index = state.history.findIndex((entry) => entry.sceneId === sceneId);
        if (index === -1) return state;
        const history = state.history.map((entry, i) => (i === index ? { ...entry, stars: action.stars } : entry));
        return withDerived({ ...state, phase: "transition", history }, scenes);
      }

      case "transition":
        if (action.type !== "LANJUT") return state;
        if (state.sceneIndex >= lastIndex) return { ...state, phase: "ending" };
        return {
          ...state,
          phase: "intro",
          sceneIndex: state.sceneIndex + 1,
          quizAnswer: null,
          timer: freshTimer(state.settings, false),
        };

      case "ending":
        return action.type === "LANJUT" ? { ...state, phase: "recap" } : state;

      case "recap":
        return action.type === "LANJUT" ? { ...state, phase: "reflection" } : state;

      case "reflection":
        if (action.type !== "MAIN_LAGI") return state;
        return {
          ...createInitialState(state.settings),
          teams: state.teams.map((team) => ({ ...team, stars: 0 })),
        };
    }
  };
}
