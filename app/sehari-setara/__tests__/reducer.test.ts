import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createInitialState, createReducer, DEFAULT_SETTINGS } from "../engine/reducer";
import { choiceText, endingFor, narrationFor, withDerived } from "../engine/rules";
import type { ChoiceId, GameAction, GameState, Phase, RoleId, Settings, Stars } from "../engine/types";
import { SCENES, TEAMS } from "./fixtures";

const reduce = createReducer(SCENES);

/** Invarian F-02: meters, flags, dan bintang tim selalu sama dengan hasil hitung ulang dari history. */
function expectDerivedConsistent(state: GameState) {
  const derived = withDerived(state, SCENES);
  expect(state.meters).toEqual(derived.meters);
  expect(state.flags).toEqual(derived.flags);
  expect(state.teams).toEqual(derived.teams);
}

/** Menjalankan aksi berurutan dan memeriksa invarian setelah setiap aksi. */
function run(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce((current, action) => {
    const next = reduce(current, action);
    expectDerivedConsistent(next);
    return next;
  }, state);
}

const simpan = (teamCount = 3, settings: Partial<Settings> = {}): GameAction => ({
  type: "SIMPAN_PENGATURAN",
  teams: TEAMS.slice(0, teamCount),
  settings,
});

/** Keadaan di fase intro adegan pertama. */
function startGame(teamCount = 3, settings: Partial<Settings> = {}): GameState {
  return run(createInitialState(), { type: "MULAI" }, simpan(teamCount, settings), { type: "LANJUT" });
}

/** Aksi sesudah PILIH sampai adegan berikutnya (atau ending) dimulai. */
function afterChoice(sceneIndex: number, stars: Stars = 1, role: RoleId = "hakim"): GameAction[] {
  const actions: GameAction[] = [{ type: "REAKSI_SELESAI" }, { type: "LANJUT" }];
  if (SCENES[sceneIndex].roleQuiz) actions.push({ type: "JAWAB_KUIS", role }, { type: "LANJUT" });
  actions.push({ type: "BERI_BINTANG", stars }, { type: "LANJUT" });
  return actions;
}

function sceneActions(sceneIndex: number, choice: ChoiceId, stars: Stars = 1): GameAction[] {
  return [{ type: "NARASI_SELESAI" }, { type: "PILIH", choice }, ...afterChoice(sceneIndex, stars)];
}

function play(choices: ChoiceId[], stars: Stars[] = [], teamCount = 3): GameState {
  let state = startGame(teamCount);
  choices.forEach((choice, i) => {
    state = run(state, ...sceneActions(i, choice, stars[i] ?? 1));
  });
  return state;
}

/** Satu keadaan contoh untuk setiap fase (dan dua keadaan kuis). */
function statesByPhase(): Record<string, GameState> {
  const states: Record<string, GameState> = {};
  let s = createInitialState();
  states.title = s;
  s = run(s, { type: "MULAI" });
  states.setup = s;
  s = run(s, simpan());
  states.prolog = s;
  s = run(s, { type: "LANJUT" });
  states.intro = s;
  s = run(s, { type: "NARASI_SELESAI" });
  states.discuss = s;
  s = run(s, { type: "PILIH", choice: "B" });
  states.reaction = s;
  s = run(s, { type: "REAKSI_SELESAI" });
  states.impact = s;
  s = run(s, { type: "LANJUT" });
  states.stars = s;
  s = run(s, { type: "BERI_BINTANG", stars: 1 });
  states.transition = s;
  s = run(s, { type: "LANJUT" });
  for (let i = 1; i < 4; i++) s = run(s, ...sceneActions(i, "B"));
  s = run(s, { type: "NARASI_SELESAI" }, { type: "PILIH", choice: "B" }, { type: "REAKSI_SELESAI" }, { type: "LANJUT" });
  states.quizBelumDijawab = s;
  s = run(s, { type: "JAWAB_KUIS", role: "hakim" });
  states.quizSudahDijawab = s;
  s = run(s, { type: "LANJUT" }, { type: "BERI_BINTANG", stars: 1 }, { type: "LANJUT" }, ...sceneActions(5, "B"));
  states.ending = s;
  s = run(s, { type: "LANJUT" });
  states.recap = s;
  s = run(s, { type: "LANJUT" });
  states.reflection = s;
  return states;
}

const SAMPLE_ACTIONS: GameAction[] = [
  { type: "MULAI" },
  simpan(2),
  { type: "LANJUT" },
  { type: "NARASI_SELESAI" },
  { type: "PILIH", choice: "A" },
  { type: "REAKSI_SELESAI" },
  { type: "JAWAB_KUIS", role: "hakim" },
  { type: "BERI_BINTANG", stars: 1 },
  { type: "MAIN_LAGI" },
  { type: "TICK" },
  { type: "JEDA_WAKTU" },
  { type: "TAMBAH_30" },
  { type: "LEWATI_DISKUSI" },
];

const ALLOWED: Record<string, GameAction["type"][]> = {
  title: ["MULAI"],
  setup: ["SIMPAN_PENGATURAN"],
  prolog: ["LANJUT"],
  intro: ["NARASI_SELESAI"],
  discuss: ["PILIH", "TICK", "JEDA_WAKTU", "TAMBAH_30", "LEWATI_DISKUSI"],
  reaction: ["REAKSI_SELESAI"],
  impact: ["LANJUT"],
  quizBelumDijawab: ["JAWAB_KUIS"],
  quizSudahDijawab: ["LANJUT"],
  stars: ["BERI_BINTANG"],
  transition: ["LANJUT"],
  ending: ["LANJUT"],
  recap: ["LANJUT"],
  reflection: ["MAIN_LAGI"],
};

describe("keadaan awal", () => {
  it("sesuai spesifikasi", () => {
    expect(createInitialState()).toEqual({
      phase: "title",
      sceneIndex: 0,
      meters: { hak: 50, kewajiban: 50 },
      flags: [],
      teams: [],
      history: [],
      timer: { duration: 60, remaining: 60, running: false },
      settings: { sound: true, reducedMotion: false, typewriter: true, discussSeconds: 60 },
      quizAnswer: null,
    });
    expect(DEFAULT_SETTINGS.discussSeconds).toBe(60);
    expect(createInitialState({ discussSeconds: 90 }).timer).toEqual({ duration: 90, remaining: 90, running: false });
  });
});

describe("alur permainan (AC-3)", () => {
  it("berjalan dari title sampai reflection, lalu MAIN_LAGI kembali ke title", () => {
    const phases: Phase[] = [];
    let state = createInitialState();
    const step = (action: GameAction) => {
      state = run(state, action);
      phases.push(state.phase);
    };
    const expected: Phase[] = ["setup", "prolog", "intro"];
    const pembuka: GameAction[] = [{ type: "MULAI" }, simpan(), { type: "LANJUT" }];
    pembuka.forEach(step);
    SCENES.forEach((scene, i) => {
      sceneActions(i, "B").forEach(step);
      expected.push("discuss", "reaction", "impact");
      if (scene.roleQuiz) expected.push("quiz", "quiz");
      expected.push("stars", "transition", i < SCENES.length - 1 ? "intro" : "ending");
      expect(state.sceneIndex).toBe(i < SCENES.length - 1 ? i + 1 : i);
    });
    const penutup: GameAction[] = [{ type: "LANJUT" }, { type: "LANJUT" }, { type: "MAIN_LAGI" }];
    penutup.forEach(step);
    expected.push("recap", "reflection", "title");
    expect(phases).toEqual(expected);
  });

  it("mencatat enam pilihan berurutan di history", () => {
    const state = play(["B", "A", "C", "B", "A", "C"]);
    expect(state.phase).toBe("ending");
    expect(state.history.map((e) => `${e.sceneId}${e.choiceId}`)).toEqual(["s1B", "s2A", "s3C", "s4B", "s5A", "s6C"]);
  });
});

describe("kunci aksi per fase (AC-4)", () => {
  const states = statesByPhase();

  it.each(Object.keys(ALLOWED))("fase %s: aksi yang tidak berlaku mengembalikan objek yang sama", (key) => {
    const state = states[key];
    for (const action of SAMPLE_ACTIONS) {
      const next = reduce(state, action);
      if (ALLOWED[key].includes(action.type)) expect(next).not.toBe(state);
      else expect(next, `${key} + ${action.type}`).toBe(state);
    }
  });

  it("PILIH kedua di adegan yang sama diabaikan", () => {
    const afterFirst = reduce(states.discuss, { type: "PILIH", choice: "A" });
    expect(reduce(afterFirst, { type: "PILIH", choice: "B" })).toBe(afterFirst);
  });

  it("sesudah waktu habis, aksi pengatur waktu selain TAMBAH_30 diabaikan tetapi PILIH diterima", () => {
    const habis = run(states.discuss, { type: "LEWATI_DISKUSI" });
    for (const type of ["TICK", "JEDA_WAKTU", "LEWATI_DISKUSI"] as const) expect(reduce(habis, { type })).toBe(habis);
    expect(run(habis, { type: "PILIH", choice: "C" }).phase).toBe("reaction");
  });
});

describe("PILIH dan indikator (AC-5)", () => {
  it("mencatat entri, menggeser indikator dengan batas per langkah, dan menghentikan waktu", () => {
    let state = startGame();
    const hak: number[] = [];
    const kewajiban: number[] = [];
    (["B", "B", "B", "B", "B", "A"] as ChoiceId[]).forEach((choice, i) => {
      state = run(state, { type: "NARASI_SELESAI" });
      const before = state;
      state = run(state, { type: "PILIH", choice });
      expect(state.history).toHaveLength(before.history.length + 1);
      expect(state.history[state.history.length - 1]).toEqual({
        sceneId: SCENES[i].id,
        choiceId: choice,
        teamId: TEAMS[i % 3].id,
        stars: 0,
      });
      expect(state.phase).toBe("reaction");
      expect(state.timer.running).toBe(false);
      hak.push(state.meters.hak);
      kewajiban.push(state.meters.kewajiban);
      state = run(state, ...afterChoice(i));
    });
    expect(hak).toEqual([60, 70, 85, 100, 100, 80]);
    expect(kewajiban).toEqual([65, 80, 90, 100, 100, 85]);
    expect(state.flags).toEqual(["komangDibela"]);
  });
});

describe("history sebagai sumber kebenaran (AC-6, siap untuk F-13)", () => {
  it("memotong history di titik mana pun lalu menghitung ulang mengembalikan nilai di titik itu", () => {
    let state = startGame();
    const snapshot = (s: GameState) => ({ meters: s.meters, flags: s.flags, teams: s.teams });
    const snapshots = [snapshot(state)];
    const choices: ChoiceId[] = ["B", "A", "C", "B", "A", "B"];
    const stars: Stars[] = [2, 0, 1, 2, 1, 0];
    choices.forEach((choice, i) => {
      state = run(state, ...sceneActions(i, choice, stars[i]));
      snapshots.push(snapshot(state));
    });
    for (let k = 0; k <= choices.length; k++) {
      const rebuilt = withDerived({ ...state, history: state.history.slice(0, k) }, SCENES);
      expect(snapshot(rebuilt), `dipotong di ${k}`).toEqual(snapshots[k]);
    }
  });
});

describe("giliran dan bintang (AC-7)", () => {
  it("merotasi tim 1, 2, 3, 1, 2, 3 dan menjumlahkan bintang tim aktif", () => {
    const state = play(["B", "B", "B", "B", "B", "B"], [2, 1, 0, 2, 2, 1]);
    expect(state.history.map((e) => e.teamId)).toEqual(["mangga", "laut", "daun", "mangga", "laut", "daun"]);
    expect(state.teams.map((t) => [t.id, t.stars])).toEqual([
      ["mangga", 4],
      ["laut", 3],
      ["daun", 1],
    ]);
  });

  it.each([
    [2, ["mangga", "laut", "mangga", "laut", "mangga", "laut"]],
    [4, ["mangga", "laut", "daun", "mentari", "mangga", "laut"]],
  ])("merotasi giliran untuk %i tim", (teamCount, expected) => {
    const state = play(["C", "C", "C", "C", "C", "C"], [], teamCount);
    expect(state.history.map((e) => e.teamId)).toEqual(expected);
  });
});

describe("akibat berantai (AC-8)", () => {
  const toScene6 = (choiceAt4: ChoiceId) => play(["B", "B", "B", choiceAt4, "B"]);

  it("memakai varian adegan 6 bila Komang dibela di adegan 4", () => {
    const state = toScene6("B");
    expect(state.sceneIndex).toBe(5);
    expect(choiceText(SCENES[5].choices[1], state.flags)).toBe("Pilihan B adegan 6, varian");
    expect(narrationFor(SCENES[5], state.flags)).toContain("Narasi varian hadir");
  });

  it("memakai teks dasar bila Komang tidak dibela", () => {
    const state = toScene6("A");
    expect(state.flags).toEqual([]);
    expect(choiceText(SCENES[5].choices[1], state.flags)).toBe("Pilihan B adegan 6");
    expect(narrationFor(SCENES[5], state.flags)).toContain("Narasi varian absen");
  });
});

describe("kuis peran (AC-9)", () => {
  it("hanya muncul di adegan berkuis", () => {
    const impact = run(startGame(), { type: "NARASI_SELESAI" }, { type: "PILIH", choice: "B" }, { type: "REAKSI_SELESAI" });
    expect(run(impact, { type: "LANJUT" }).phase).toBe("stars");
  });

  it("mengunci jawaban pertama, menunggu jawaban sebelum lanjut, dan tidak mengubah indikator", () => {
    let state = play(["B", "B", "B", "B"]);
    state = run(state, { type: "NARASI_SELESAI" }, { type: "PILIH", choice: "B" }, { type: "REAKSI_SELESAI" }, { type: "LANJUT" });
    expect(state.phase).toBe("quiz");
    expect(state.quizAnswer).toBeNull();
    expect(reduce(state, { type: "LANJUT" })).toBe(state);
    const meters = state.meters;
    state = run(state, { type: "JAWAB_KUIS", role: "polisi" });
    expect(state.quizAnswer).toBe("polisi");
    expect(reduce(state, { type: "JAWAB_KUIS", role: "hakim" })).toBe(state);
    expect(state.meters).toEqual(meters);
    state = run(state, { type: "LANJUT" });
    expect(state.phase).toBe("stars");
    state = run(state, { type: "BERI_BINTANG", stars: 2 }, { type: "LANJUT" });
    expect(state.phase).toBe("intro");
    expect(state.quizAnswer).toBeNull();
  });
});

describe("jawaban kuis di history (F-09, usulan 5c)", () => {
  /** Keadaan kuis adegan 5 sesudah PILIH C, sebelum dijawab. */
  function atQuiz(): GameState {
    const state = run(
      play(["B", "B", "B", "B"]),
      { type: "NARASI_SELESAI" },
      { type: "PILIH", choice: "C" },
      { type: "REAKSI_SELESAI" },
      { type: "LANJUT" },
    );
    expect(state.phase).toBe("quiz");
    return state;
  }

  it("JAWAB_KUIS mengisi entri history adegan berjalan dengan objek baru; entri lain tetap", () => {
    const before = atQuiz();
    const sceneId = SCENES[before.sceneIndex].id;
    const index = before.history.findIndex((entry) => entry.sceneId === sceneId);
    const answered = run(before, { type: "JAWAB_KUIS", role: "advokat" });
    expect(answered.quizAnswer).toBe("advokat");
    expect(answered.history[index]).toEqual({ ...before.history[index], quizAnswer: "advokat" });
    expect(answered.history).not.toBe(before.history);
    expect(answered.history[index]).not.toBe(before.history[index]);
    expect(before.history[index]).not.toHaveProperty("quizAnswer");
    answered.history.forEach((entry, i) => {
      if (i !== index) expect(entry).toBe(before.history[i]);
    });
    expect([answered.meters, answered.flags, answered.teams]).toEqual([before.meters, before.flags, before.teams]);
  });

  it("jawaban kedua ditolak, jawaban tetap sampai akhir hari, dan MAIN_LAGI mengosongkannya", () => {
    const answered = run(atQuiz(), { type: "JAWAB_KUIS", role: "polisi" });
    expect(reduce(answered, { type: "JAWAB_KUIS", role: "hakim" })).toBe(answered);
    const end = run(answered, { type: "LANJUT" }, { type: "BERI_BINTANG", stars: 2 }, { type: "LANJUT" }, ...sceneActions(5, "B"));
    expect(end.phase).toBe("ending");
    expect(end.quizAnswer).toBeNull();
    const quizEntries = end.history.filter((entry) => entry.quizAnswer !== undefined);
    expect(quizEntries).toHaveLength(1);
    expect(quizEntries[0]).toMatchObject({ sceneId: SCENES[4].id, choiceId: "C", stars: 2, quizAnswer: "polisi" });
    const again = run(end, { type: "LANJUT" }, { type: "LANJUT" }, { type: "MAIN_LAGI" });
    expect(again.history).toEqual([]);
    expect(again.quizAnswer).toBeNull();
  });

  it("tanpa entri adegan berjalan, hanya state.quizAnswer yang diisi", () => {
    const state = atQuiz();
    const sceneId = SCENES[state.sceneIndex].id;
    const without: GameState = { ...state, history: state.history.filter((entry) => entry.sceneId !== sceneId) };
    const next = reduce(without, { type: "JAWAB_KUIS", role: "hakim" });
    expect(next.quizAnswer).toBe("hakim");
    expect(next.history).toBe(without.history);
  });
});

describe("pengatur waktu (AC-10)", () => {
  const diskusi = (seconds: Settings["discussSeconds"] = 60) =>
    run(startGame(3, { discussSeconds: seconds }), { type: "NARASI_SELESAI" });

  it("mulai dari durasi diskusi lalu habis di 0 tanpa berpindah fase", () => {
    let state = diskusi(30);
    expect(state.timer).toEqual({ duration: 30, remaining: 30, running: true });
    for (let i = 0; i < 29; i++) state = run(state, { type: "TICK" });
    expect(state.timer).toEqual({ duration: 30, remaining: 1, running: true });
    state = run(state, { type: "TICK" });
    expect(state.timer).toEqual({ duration: 30, remaining: 0, running: false });
    expect(state.phase).toBe("discuss");
    expect(reduce(state, { type: "TICK" })).toBe(state);
    expect(run(state, { type: "PILIH", choice: "A" }).phase).toBe("reaction");
  });

  it("JEDA_WAKTU menjeda dan melanjutkan", () => {
    const paused = run(diskusi(), { type: "JEDA_WAKTU" });
    expect(paused.timer.running).toBe(false);
    expect(reduce(paused, { type: "TICK" })).toBe(paused);
    expect(run(paused, { type: "JEDA_WAKTU" }).timer.running).toBe(true);
  });

  it("TAMBAH_30 menjalankan lagi waktu yang habis, tetapi tidak yang dijeda", () => {
    const habis = run(diskusi(30), { type: "LEWATI_DISKUSI" });
    expect(habis.timer).toEqual({ duration: 30, remaining: 0, running: false });
    expect(run(habis, { type: "TAMBAH_30" }).timer).toEqual({ duration: 30, remaining: 30, running: true });
    const paused = run(diskusi(60), { type: "JEDA_WAKTU" }, { type: "TAMBAH_30" });
    expect(paused.timer).toEqual({ duration: 90, remaining: 90, running: false });
    let berjalan = diskusi(60);
    for (let i = 0; i < 10; i++) berjalan = run(berjalan, { type: "TICK" });
    expect(run(berjalan, { type: "TAMBAH_30" }).timer).toEqual({ duration: 80, remaining: 80, running: true });
  });

  it("LEWATI_DISKUSI membuat sisa waktu 0 dan berhenti", () => {
    expect(run(diskusi(), { type: "LEWATI_DISKUSI" }).timer).toEqual({ duration: 60, remaining: 0, running: false });
  });
});

describe("pengaturan (AC-11)", () => {
  it.each([2, 3, 4])("SIMPAN_PENGATURAN menerima %i tim", (count) => {
    const state = run(createInitialState(), { type: "MULAI" }, simpan(count, { discussSeconds: 90, sound: false }));
    expect(state.phase).toBe("prolog");
    expect(state.teams).toHaveLength(count);
    expect(state.teams.every((t) => t.stars === 0)).toBe(true);
    expect(state.settings).toEqual({ ...DEFAULT_SETTINGS, discussSeconds: 90, sound: false });
  });

  it("SIMPAN_PENGATURAN menolak 1 tim, 5 tim, id ganda, dan nama kosong", () => {
    const setup = run(createInitialState(), { type: "MULAI" });
    const invalid = [
      TEAMS.slice(0, 1),
      [...TEAMS, { id: "kelima", name: "Tim Kelima", color: "coral", shape: "bintang" as const }],
      [TEAMS[0], { ...TEAMS[1], id: TEAMS[0].id }],
      [TEAMS[0], { ...TEAMS[1], name: "   " }],
    ];
    for (const teams of invalid) {
      expect(reduce(setup, { type: "SIMPAN_PENGATURAN", teams, settings: {} })).toBe(setup);
    }
  });

  it("UBAH_PENGATURAN bekerja di semua fase tanpa mengubah fase", () => {
    for (const state of Object.values(statesByPhase())) {
      const next = reduce(state, { type: "UBAH_PENGATURAN", settings: { typewriter: !state.settings.typewriter } });
      expect(next.phase).toBe(state.phase);
      expect(next.settings.typewriter).toBe(!state.settings.typewriter);
    }
  });

  it("UBAH_PENGATURAN mengabaikan nilai tidak sah dan perubahan kosong", () => {
    const state = createInitialState();
    const invalid = { discussSeconds: 45, sound: "ya" } as unknown as Partial<Settings>;
    expect(reduce(state, { type: "UBAH_PENGATURAN", settings: invalid })).toBe(state);
    expect(reduce(state, { type: "UBAH_PENGATURAN", settings: { sound: true } })).toBe(state);
  });

  it("durasi baru tidak mengubah waktu yang berjalan dan berlaku di diskusi berikutnya", () => {
    let state = run(startGame(), { type: "NARASI_SELESAI" }, { type: "TICK" });
    const timer = state.timer;
    state = run(state, { type: "UBAH_PENGATURAN", settings: { discussSeconds: 30 } });
    expect(state.timer).toBe(timer);
    state = run(state, { type: "PILIH", choice: "B" }, ...afterChoice(0), { type: "NARASI_SELESAI" });
    expect(state.timer).toEqual({ duration: 30, remaining: 30, running: true });
  });
});

describe("akhir hari (AC-12)", () => {
  it.each([
    [["B", "B", "B", "B", "B", "B"], "setara"],
    [["B", "B", "B", "C", "C", "C"], "hampir"],
    [["A", "A", "A", "A", "A", "A"], "berat"],
  ] as [ChoiceId[], string][])("pilihan %j berakhir %s", (choices, ending) => {
    const state = play(choices);
    expect(state.phase).toBe("ending");
    expect(endingFor(state.meters)).toBe(ending);
  });
});

describe("main lagi (AC-13)", () => {
  it("mengosongkan permainan tetapi mempertahankan pengaturan dan identitas tim", () => {
    let state = run(createInitialState(), { type: "MULAI" }, simpan(3, { discussSeconds: 90, sound: false }), { type: "LANJUT" });
    SCENES.forEach((_, i) => {
      state = run(state, ...sceneActions(i, "B", 2));
    });
    state = run(state, { type: "LANJUT" }, { type: "LANJUT" }, { type: "MAIN_LAGI" });
    expect(state).toEqual({
      ...createInitialState({ discussSeconds: 90, sound: false }),
      teams: TEAMS.slice(0, 3).map((t) => ({ ...t, stars: 0 })),
    });
  });
});

describe("kemurnian (AC-14)", () => {
  function deepFreeze<T>(value: T): T {
    if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const inner of Object.values(value)) deepFreeze(inner);
    }
    return value;
  }

  it("tidak mengubah keadaan maupun adegan yang dibekukan", () => {
    deepFreeze(SCENES);
    const frozenReduce = (state: GameState, action: GameAction) => reduce(deepFreeze(state), action);
    let state = createInitialState();
    const actions: GameAction[] = [
      { type: "MULAI" },
      simpan(),
      { type: "LANJUT" },
      { type: "UBAH_PENGATURAN", settings: { sound: false } },
      ...SCENES.flatMap((_, i): GameAction[] => [
        { type: "NARASI_SELESAI" },
        { type: "TICK" },
        { type: "JEDA_WAKTU" },
        { type: "TAMBAH_30" },
        { type: "LEWATI_DISKUSI" },
        { type: "PILIH", choice: "B" },
        ...afterChoice(i, 2),
      ]),
      { type: "LANJUT" },
      { type: "LANJUT" },
      { type: "MAIN_LAGI" },
    ];
    expect(() => {
      for (const action of actions) state = frozenReduce(state, action);
    }).not.toThrow();
    expect(state.phase).toBe("title");
  });

  it("file engine tidak memakai pewaktu, tanggal, atau bilangan acak", () => {
    const dir = new URL("../engine/", import.meta.url);
    const files = readdirSync(dir).filter((name) => name.endsWith(".ts"));
    expect(files.length).toBeGreaterThanOrEqual(3);
    for (const name of files) {
      const source = readFileSync(new URL(name, dir), "utf8");
      expect(source, name).not.toMatch(/\b(setInterval|setTimeout|Date|Math\.random)\b/);
    }
  });
});
