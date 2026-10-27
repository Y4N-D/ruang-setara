// Uji unit kontrol layar permainan Sehari Setara (spesifikasi F-05, AC-15; tombol F-07, AC-18; kuis peran F-08, AC-16).
import { describe, expect, it } from "vitest";
import { SCENES } from "../content/scenes";
import { DEFAULT_TEAMS, PLAY_TEAMS } from "../content/teams";
import { createInitialState, createReducer } from "../engine/reducer";
import { choiceText, endingFor, narrationFor } from "../engine/rules";
import type { ChoiceId, GameAction, GameState, Phase, RoleId, Stars } from "../engine/types";
import {
  FADE_MS,
  keyCommand,
  REACTION_MS,
  restartActions,
  runActions,
  shouldHandleKey,
  startActions,
  TYPE_CPS,
  typedLength,
  WIPE,
  WIPE_COVER_MS,
  WIPE_MS,
  wipeSchedule,
  type KeyContext,
} from "../ui/controls";

const reducer = createReducer(SCENES);
const ALL_PHASES: Phase[] = [
  "title", "setup", "prolog", "intro", "discuss", "reaction", "impact", "quiz", "stars", "transition", "ending", "recap", "reflection",
];

const start = () => runActions(reducer, createInitialState(), startActions(PLAY_TEAMS));

/**
 * Aksi layar permainan dari "Lanjut" kartu dampak sampai fase bintang (F-08): LANJUT, lalu di adegan berkuis
 * JAWAB_KUIS dan LANJUT kuis.
 */
function cardToStars(state: GameState, role: RoleId = "hakim"): GameAction[] {
  const quiz: GameAction[] = SCENES[state.sceneIndex].roleQuiz ? [{ type: "JAWAB_KUIS", role }, { type: "LANJUT" }] : [];
  return [{ type: "LANJUT" }, ...quiz];
}

/** Satu adegan dari intro sampai adegan berikutnya, memakai aksi yang sama dengan layar permainan (F-07: bintang guru). */
function playScene(state: GameState, choice: ChoiceId, stars: Stars = 0): GameState {
  let next = runActions(reducer, state, [{ type: "NARASI_SELESAI" }, { type: "PILIH", choice }, { type: "REAKSI_SELESAI" }]);
  expect(next.phase).toBe("impact");
  next = runActions(reducer, next, cardToStars(next));
  expect(next.phase).toBe("stars");
  next = reducer(next, { type: "BERI_BINTANG", stars });
  expect(next.phase).toBe("transition");
  return reducer(next, { type: "LANJUT" });
}

describe("konstanta (spesifikasi F-05)", () => {
  it("sesuai bagian Data dan aksi", () => {
    expect([REACTION_MS, WIPE_MS, WIPE_COVER_MS, FADE_MS, TYPE_CPS]).toEqual([1200, 400, 200, 150, 40]);
    expect(WIPE).toEqual({ block: 20, cols: 16, rows: 9, offsets: [0, 2, 1, 3], showMs: 240 });
  });
});

describe("perintah keyboard", () => {
  it("1/2/3, a/b/c, dan A/B/C memilih hanya di fase discuss (1 dan 2 memberi bintang di fase stars sejak F-07; 1 sampai 3 menjawab kuis sejak F-08)", () => {
    const expected: Array<[string, ChoiceId]> = [
      ["1", "A"], ["a", "A"], ["A", "A"], ["2", "B"], ["b", "B"], ["B", "B"], ["3", "C"], ["c", "C"], ["C", "C"],
    ];
    for (const [key, choice] of expected) {
      expect(keyCommand("discuss", key)).toEqual({ type: "pilih", choice });
      const starKey = key === "1" || key === "2";
      const quizKey = key === "1" || key === "2" || key === "3";
      const others = ALL_PHASES.filter((p) => p !== "discuss" && !(starKey && p === "stars") && !(quizKey && p === "quiz"));
      for (const phase of others) expect(keyCommand(phase, key)).toBeNull();
    }
  });

  it("1 sampai 4 menjawab kuis peran hanya di fase quiz; 4 tidak berpengaruh di fase lain (F-08)", () => {
    for (const nomor of [1, 2, 3, 4] as const) expect(keyCommand("quiz", String(nomor))).toEqual({ type: "jawab", nomor });
    for (const phase of ALL_PHASES.filter((p) => p !== "quiz")) expect(keyCommand(phase, "4")).toBeNull();
    for (const key of ["0", "5", "6", "7", "8", "9", "a", "b", "c", "A", "p", "t", "s", "P", "T", "S", "d", "Escape", "Tab"]) {
      expect(keyCommand("quiz", key)).toBeNull();
    }
  });

  it("Spasi dan Enter berarti lanjut hanya di narasi, kartu dampak, dan kuis peran; tidak di fase bintang (F-07)", () => {
    for (const key of [" ", "Enter"]) {
      for (const phase of ALL_PHASES) {
        const lanjut = ["intro", "impact", "quiz"].includes(phase);
        expect(keyCommand(phase, key)).toEqual(lanjut ? { type: "lanjut" } : null);
      }
    }
  });

  it("P, T, dan S mengatur waktu hanya di fase discuss (F-07)", () => {
    const expected: Array<[string, string]> = [
      ["p", "JEDA_WAKTU"], ["P", "JEDA_WAKTU"], ["t", "TAMBAH_30"], ["T", "TAMBAH_30"], ["s", "LEWATI_DISKUSI"], ["S", "LEWATI_DISKUSI"],
    ];
    for (const [key, action] of expected) {
      expect(keyCommand("discuss", key)).toEqual({ type: "waktu", action });
      for (const phase of ALL_PHASES.filter((p) => p !== "discuss")) expect(keyCommand(phase, key)).toBeNull();
    }
  });

  it("0, 1, dan 2 memberi bintang hanya di fase stars; di fase discuss 1 dan 2 tetap memilih, di fase quiz menjawab (F-07, F-08)", () => {
    for (const stars of [0, 1, 2] as const) {
      expect(keyCommand("stars", String(stars))).toEqual({ type: "bintang", stars });
      const others = ALL_PHASES.filter((p) => p !== "stars" && p !== "discuss" && !(stars > 0 && p === "quiz"));
      for (const phase of others) expect(keyCommand(phase, String(stars))).toBeNull();
    }
    expect(keyCommand("discuss", "0")).toBeNull();
    expect(keyCommand("discuss", "1")).toEqual({ type: "pilih", choice: "A" });
    expect(keyCommand("discuss", "2")).toEqual({ type: "pilih", choice: "B" });
    for (const key of ["3", "a", "b", "p"]) expect(keyCommand("stars", key)).toBeNull();
  });

  it("M mematikan atau menyalakan suara di fase intro sampai transition (F-07)", () => {
    const scenePhases = ["intro", "discuss", "reaction", "impact", "quiz", "stars", "transition"];
    for (const key of ["m", "M"]) {
      for (const phase of ALL_PHASES) expect(keyCommand(phase, key)).toEqual(scenePhases.includes(phase) ? { type: "suara" } : null);
    }
  });

  it("tombol lain dan nama properti bawaan objek tidak berpengaruh (4 menjawab kuis sejak F-08)", () => {
    for (const key of ["4", "d", "D", "x", "Escape", "Tab", "f", "constructor", "toString", "__proto__", "hasOwnProperty", ""]) {
      for (const phase of ALL_PHASES.filter((p) => !(key === "4" && p === "quiz"))) expect(keyCommand(phase, key)).toBeNull();
    }
  });
});

describe("aturan pengabaian tekanan", () => {
  const base: KeyContext = { key: "2", ctrlKey: false, altKey: false, metaKey: false, repeat: false, isComposing: false, target: "lain" };

  it("tekanan biasa ditangani, termasuk angka saat tombol berfokus", () => {
    expect(shouldHandleKey(base)).toBe(true);
    expect(shouldHandleKey({ ...base, target: "tombol" })).toBe(true);
    expect(shouldHandleKey({ ...base, key: " " })).toBe(true);
    expect(shouldHandleKey({ ...base, key: "Enter" })).toBe(true);
  });

  it("Ctrl, Alt, Meta, tombol yang ditahan, huruf yang disusun, dan kolom isian diabaikan", () => {
    expect(shouldHandleKey({ ...base, ctrlKey: true })).toBe(false);
    expect(shouldHandleKey({ ...base, altKey: true })).toBe(false);
    expect(shouldHandleKey({ ...base, metaKey: true })).toBe(false);
    expect(shouldHandleKey({ ...base, repeat: true })).toBe(false);
    expect(shouldHandleKey({ ...base, isComposing: true })).toBe(false);
    expect(shouldHandleKey({ ...base, target: "isian" })).toBe(false);
  });

  it("Spasi dan Enter pada tombol atau tautan diserahkan ke browser sebagai klik", () => {
    expect(shouldHandleKey({ ...base, key: " ", target: "tombol" })).toBe(false);
    expect(shouldHandleKey({ ...base, key: "Enter", target: "tombol" })).toBe(false);
  });
});

describe("teks per huruf", () => {
  it("40 huruf per detik, tidak pernah lebih dari panjang teks", () => {
    expect(typedLength(0, 85)).toBe(0);
    expect(typedLength(-10, 85)).toBe(0);
    expect(typedLength(Number.NaN, 85)).toBe(0);
    expect(typedLength(24, 85)).toBe(0);
    expect(typedLength(25, 85)).toBe(1);
    expect(typedLength(1000, 85)).toBe(40);
    expect(typedLength(2125, 85)).toBe(85);
    expect(typedLength(60_000, 85)).toBe(85);
    expect(typedLength(1000, 85, 10)).toBe(10);
  });
});

describe("jadwal sapuan", () => {
  const schedule = wipeSchedule();
  const visibleAt = (t: number) => schedule.filter((b) => b.delayMs <= t && t < b.delayMs + WIPE.showMs);

  it("144 blok 20×20 menutupi panggung 320×180 tepat sekali", () => {
    expect(schedule).toHaveLength(144);
    const cells = new Set(schedule.map((b) => `${b.col},${b.row}`));
    expect(cells.size).toBe(144);
    expect(Math.max(...schedule.map((b) => b.col)) * WIPE.block + WIPE.block).toBe(320);
    expect(Math.max(...schedule.map((b) => b.row)) * WIPE.block + WIPE.block).toBe(180);
  });

  it("jeda bilangan bulat 0–160 ms sesuai rumus, dan setiap blok selesai paling lambat 400 ms", () => {
    for (const { col, row, delayMs } of schedule) {
      expect(Number.isInteger(delayMs)).toBe(true);
      expect(delayMs).toBe(Math.round(((col + [0, 2, 1, 3][row % 4]) * 160) / 18));
      expect(delayMs + WIPE.showMs).toBeLessThanOrEqual(WIPE_MS);
    }
    expect(Math.min(...schedule.map((b) => b.delayMs))).toBe(0);
    expect(Math.max(...schedule.map((b) => b.delayMs))).toBe(160);
  });

  it("seluruh panggung tertutup antara 160 dan 240 ms, termasuk saat adegan berganti (200 ms)", () => {
    for (const t of [160, 200, WIPE_COVER_MS, 239]) expect(visibleAt(t)).toHaveLength(144);
    expect(visibleAt(159).length).toBeLessThan(144);
    expect(visibleAt(240).length).toBeLessThan(144);
    expect(visibleAt(WIPE_MS)).toHaveLength(0);
  });

  it("tepi sapuan bergerak ke kanan", () => {
    for (let row = 0; row < WIPE.rows; row++) {
      const delays = schedule.filter((b) => b.row === row).sort((a, b) => a.col - b.col).map((b) => b.delayMs);
      for (let i = 1; i < delays.length; i++) expect(delays[i]).toBeGreaterThan(delays[i - 1]);
    }
    const meanCol = (blocks: { col: number }[]) => blocks.reduce((sum, b) => sum + b.col, 0) / blocks.length;
    const covering = visibleAt(100);
    const leaving = visibleAt(300);
    expect(covering.length).toBeGreaterThan(0);
    expect(leaving.length).toBeGreaterThan(0);
    expect(meanCol(covering)).toBeLessThan(meanCol(leaving));
    expect(covering.some((b) => b.col === 0)).toBe(true);
    expect(leaving.some((b) => b.col === 15)).toBe(true);
    expect(leaving.some((b) => b.col === 0)).toBe(false);
  });
});

describe("tim bawaan", () => {
  it("empat tim Design System bagian 7, dan layar permainan memakai dua yang pertama", () => {
    expect(DEFAULT_TEAMS).toEqual([
      { id: "mangga", name: "Tim Mangga", color: "mango", shape: "lingkaran" },
      { id: "laut", name: "Tim Laut", color: "sky-d", shape: "segitiga" },
      { id: "daun", name: "Tim Daun", color: "leaf", shape: "persegi" },
      { id: "mentari", name: "Tim Mentari", color: "sun", shape: "bintang" },
    ]);
    expect(PLAY_TEAMS).toEqual(DEFAULT_TEAMS.slice(0, 2));
  });
});

describe("urutan aksi layar permainan", () => {
  it("aksi awal membawa ke intro adegan 1 dengan dua tim bawaan", () => {
    expect(startActions(PLAY_TEAMS).map((a) => a.type)).toEqual(["MULAI", "SIMPAN_PENGATURAN", "LANJUT"]);
    const state = start();
    expect(state.phase).toBe("intro");
    expect(state.sceneIndex).toBe(0);
    expect(state.teams.map((t) => [t.id, t.stars])).toEqual([["mangga", 0], ["laut", 0]]);
    expect(state.meters).toEqual({ hak: 50, kewajiban: 50 });
    expect(state.history).toEqual([]);
  });

  it("LANJUT dari fase impact membuka quiz di adegan 5 dan stars di adegan lain (F-08)", () => {
    let state = start();
    for (let i = 0; i < SCENES.length; i++) {
      state = runActions(reducer, state, [{ type: "NARASI_SELESAI" }, { type: "PILIH", choice: "B" }, { type: "REAKSI_SELESAI" }]);
      expect(state.phase).toBe("impact");
      const next = reducer(state, { type: "LANJUT" });
      expect(next.phase).toBe(i === 4 ? "quiz" : "stars");
      expect(next.quizAnswer).toBeNull();
      // LANJUT di fase quiz ditolak sebelum JAWAB_KUIS, sehingga Enter kedua tidak menjawab dan tidak melewati kuis.
      if (next.phase === "quiz") expect(reducer(next, { type: "LANJUT" })).toBe(next);
      state = runActions(reducer, state, [...cardToStars(state), { type: "BERI_BINTANG", stars: 1 }, { type: "LANJUT" }]);
    }
    expect(state.phase).toBe("ending");
  });

  it("JAWAB_KUIS untuk keempat peran lalu LANJUT membuka stars tanpa mengubah indikator, bendera, bintang, dan history (F-08)", () => {
    let atImpact = start();
    for (let i = 0; i < 4; i++) atImpact = playScene(atImpact, "B", 1);
    atImpact = runActions(reducer, atImpact, [{ type: "NARASI_SELESAI" }, { type: "PILIH", choice: "B" }, { type: "REAKSI_SELESAI" }]);
    expect([atImpact.sceneIndex, atImpact.phase]).toEqual([4, "impact"]);
    const atQuiz = reducer(atImpact, { type: "LANJUT" });
    const before = { meters: atQuiz.meters, flags: atQuiz.flags, teams: atQuiz.teams, history: atQuiz.history };
    for (const role of ["polisi", "jaksa", "advokat", "hakim"] as const) {
      const answered = reducer(atQuiz, { type: "JAWAB_KUIS", role });
      expect([answered.phase, answered.quizAnswer]).toEqual(["quiz", role]);
      // Hanya jawaban pertama yang diterima.
      expect(reducer(answered, { type: "JAWAB_KUIS", role: role === "hakim" ? "polisi" : "hakim" })).toBe(answered);
      const atStars = reducer(answered, { type: "LANJUT" });
      expect(atStars.phase).toBe("stars");
      expect({ meters: atStars.meters, flags: atStars.flags, teams: atStars.teams, history: atStars.history }).toEqual(before);
      // Bintang kedua di adegan yang sama ditolak reducer; adegan 6 mulai dengan kuis kosong.
      const given = reducer(atStars, { type: "BERI_BINTANG", stars: 2 });
      expect(given.phase).toBe("transition");
      expect(reducer(given, { type: "BERI_BINTANG", stars: 1 })).toBe(given);
      const next = reducer(given, { type: "LANJUT" });
      expect([next.phase, next.sceneIndex, next.quizAnswer]).toEqual(["intro", 5, null]);
    }
  });

  it("bintang 2, 1, 0, 2, 1, 0 pada dua tim: Tim Mangga 3 dan Tim Laut 3 (spesifikasi F-07, AC-5)", () => {
    const stars: Stars[] = [2, 1, 0, 2, 1, 0];
    let state = start();
    const seen: Array<[number, number]> = [];
    stars.forEach((n, i) => {
      state = playScene(state, "B", n);
      if (i < stars.length - 1) seen.push([state.teams[0].stars, state.teams[1].stars]);
    });
    expect(seen).toEqual([[2, 0], [2, 1], [2, 1], [2, 3], [3, 3]]);
    expect(state.teams.map((t) => t.stars)).toEqual([3, 3]);
  });

  it("main lagi dari layar akhir kembali ke intro adegan 1 dengan history kosong", () => {
    let state = start();
    for (let i = 0; i < SCENES.length; i++) state = playScene(state, "B");
    expect(state.phase).toBe("ending");
    for (const phase of ["ending", "recap", "reflection"] as const) {
      const at = phase === "ending" ? state : phase === "recap" ? reducer(state, { type: "LANJUT" }) : runActions(reducer, state, [{ type: "LANJUT" }, { type: "LANJUT" }]);
      expect(at.phase).toBe(phase);
      const again = runActions(reducer, at, restartActions(PLAY_TEAMS));
      expect(again.phase).toBe("intro");
      expect(again.sceneIndex).toBe(0);
      expect(again.history).toEqual([]);
      expect(again.flags).toEqual([]);
      expect(again.meters).toEqual({ hak: 50, kewajiban: 50 });
      expect(again.teams.map((t) => [t.id, t.stars])).toEqual([["mangga", 0], ["laut", 0]]);
    }
  });

  it("tiga jalur naskah asli sampai akhir, dengan varian adegan 6 hanya bila B dipilih di adegan 4", () => {
    const paths: Array<[string, ChoiceId[], string, boolean]> = [
      ["semua B", ["B", "B", "B", "B", "B", "B"], "setara", true],
      ["B-B-B-C-C-C", ["B", "B", "B", "C", "C", "C"], "hampir", false],
      ["semua A", ["A", "A", "A", "A", "A", "A"], "berat", false],
    ];
    for (const [, path, ending, variant] of paths) {
      let state = start();
      path.forEach((choice, i) => {
        expect(state.phase).toBe("intro");
        expect(state.sceneIndex).toBe(i);
        if (i === 5) {
          const s6 = SCENES[5];
          const screens = narrationFor(s6, state.flags);
          expect(screens).toHaveLength(2);
          expect(screens[1]).toBe(variant ? s6.narrationIfFlag?.present[0] : s6.narrationIfFlag?.absent[0]);
          const b = s6.choices[1];
          expect(choiceText(b, state.flags)).toBe(variant ? b.textIfFlag?.text : b.text);
        }
        state = playScene(state, choice);
      });
      expect(state.phase).toBe("ending");
      expect(endingFor(state.meters)).toBe(ending);
    }
  });
});
