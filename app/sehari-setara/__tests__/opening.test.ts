// Uji unit layar pembuka Sehari Setara (spesifikasi F-10, AC-27): tim dan jadwal giliran, pilihan sementara, aksi
// "Mulai permainan", dialog pengaturan, adegan semu layar judul dan prolog, teks prolog, dan TITLE_ZONE.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { copy } from "../content/copy";
import { PROLOG } from "../content/prolog";
import { SCENES } from "../content/scenes";
import { countSentences } from "../content/schema";
import { DEFAULT_TEAMS } from "../content/teams";
import { createInitialState, createReducer, DEFAULT_SETTINGS } from "../engine/reducer";
import { activeTeamIndex } from "../engine/rules";
import type { GameAction, GameState, Phase } from "../engine/types";
import { replayActions, runActions } from "../ui/controls";
import { TITLE_ZONE } from "../ui/layout";
import {
  DEFAULT_TEAM_COUNT,
  DISCUSS_CHOICES,
  listText,
  OPENING_GUARD_MS,
  OPENING_PHASES,
  openingScene,
  PROLOG_NARA_X,
  SETTINGS_PHASES,
  settingsOpenable,
  settingsView,
  setupActions,
  setupDraftFrom,
  TEAM_COUNTS,
  teamCountAnnouncement,
  teamsForCount,
  teamTurnSentence,
  TITLE_NARA_X,
  turnScenes,
  turnText,
  type TeamCount,
} from "../ui/opening";

const reducer = createReducer(SCENES);
const ALL_PHASES: Phase[] = [
  "title", "setup", "prolog", "intro", "discuss", "reaction", "impact", "quiz", "stars", "transition", "ending", "recap", "reflection",
];

/** Dari layar judul sampai refleksi dengan aksi layar permainan: semua B, kuis Hakim, 1 bintang per adegan. */
function playToReflection(count: TeamCount): GameState {
  let state = runActions(reducer, createInitialState(), [{ type: "MULAI" }, ...setupActions({ count, seconds: 60 }), { type: "LANJUT" }]);
  for (const scene of SCENES) {
    const actions: GameAction[] = [{ type: "NARASI_SELESAI" }, { type: "PILIH", choice: "B" }, { type: "REAKSI_SELESAI" }, { type: "LANJUT" }];
    if (scene.roleQuiz) actions.push({ type: "JAWAB_KUIS", role: "hakim" }, { type: "LANJUT" });
    actions.push({ type: "BERI_BINTANG", stars: 1 }, { type: "LANJUT" });
    state = runActions(reducer, state, actions);
  }
  return runActions(reducer, state, [{ type: "LANJUT" }, { type: "LANJUT" }]);
}

describe("konstanta (spesifikasi F-10)", () => {
  it("sesuai bagian Data dan aksi", () => {
    expect(OPENING_GUARD_MS).toBe(600);
    expect(TEAM_COUNTS).toEqual([2, 3, 4]);
    expect(DEFAULT_TEAM_COUNT).toBe(3);
    expect(DISCUSS_CHOICES).toEqual([30, 60, 90]);
    expect([TITLE_NARA_X, PROLOG_NARA_X]).toEqual([96, 160]);
    expect([...SETTINGS_PHASES]).toEqual(["prolog", "intro", "discuss", "stars"]);
    expect([...OPENING_PHASES]).toEqual(["title", "setup", "prolog"]);
  });
});

describe("tim dan jadwal giliran", () => {
  it("teamsForCount mengambil tim bawaan berurutan tanpa mengubah daftar", () => {
    for (const count of TEAM_COUNTS) expect(teamsForCount(count)).toEqual(DEFAULT_TEAMS.slice(0, count));
    expect(teamsForCount(3).map((team) => team.name)).toEqual(["Tim Mangga", "Tim Laut", "Tim Daun"]);
    expect(teamsForCount(2)[0]).not.toBe(DEFAULT_TEAMS[0]);
  });

  it("turnScenes sama dengan activeTeamIndex untuk keenam adegan dan ketiga jumlah tim", () => {
    for (const count of TEAM_COUNTS) {
      const turns = Array.from({ length: count }, (_, i) => turnScenes(i, count, SCENES.length));
      for (let s = 0; s < SCENES.length; s++) expect(turns[activeTeamIndex(s, count)]).toContain(s + 1);
      expect(turns.flat().sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
    }
  });

  it("jadwal yang terlihat sesuai tabel spesifikasi", () => {
    const table: Record<TeamCount, string[]> = {
      2: ["Adegan 1, 3, 5", "Adegan 2, 4, 6"],
      3: ["Adegan 1, 4", "Adegan 2, 5", "Adegan 3, 6"],
      4: ["Adegan 1, 5", "Adegan 2, 6", "Adegan 3", "Adegan 4"],
    };
    for (const count of TEAM_COUNTS) {
      expect(Array.from({ length: count }, (_, i) => turnText(turnScenes(i, count, SCENES.length)))).toEqual(table[count]);
    }
  });

  it("listText, kalimat setiap tim, dan pengumuman jumlah tim", () => {
    expect([listText([]), listText(["A"]), listText(["A", "B"]), listText(["A", "B", "C"])]).toEqual(["", "A", "A dan B", "A, B, dan C"]);
    expect(teamTurnSentence("Tim Mangga", [1, 4])).toBe("Tim Mangga, giliran adegan 1 dan 4.");
    expect(teamTurnSentence("Tim Mangga", [1, 3, 5])).toBe("Tim Mangga, giliran adegan 1, 3, dan 5.");
    expect(teamTurnSentence("Tim Daun", [3])).toBe("Tim Daun, giliran adegan 3.");
    expect(teamCountAnnouncement(teamsForCount(2))).toBe("2 tim: Tim Mangga dan Tim Laut.");
    expect(teamCountAnnouncement(teamsForCount(3))).toBe("3 tim: Tim Mangga, Tim Laut, dan Tim Daun.");
    expect(teamCountAnnouncement(teamsForCount(4))).toBe("4 tim: Tim Mangga, Tim Laut, Tim Daun, dan Tim Mentari.");
  });
});

describe("pilihan sementara dan Mulai permainan", () => {
  it("keadaan awal: 3 tim dan 60 detik", () => {
    expect(setupDraftFrom(createInitialState())).toEqual({ count: 3, seconds: 60 });
  });

  it("sesudah Main lagi: jumlah tim dan durasi permainan sebelumnya, termasuk durasi yang diubah", () => {
    for (const count of [2, 4] as const) {
      const reflection = playToReflection(count);
      expect(reflection.phase).toBe("reflection");
      expect(setupDraftFrom(runActions(reducer, reflection, replayActions()))).toEqual({ count, seconds: 60 });
      const changed = reducer(reflection, { type: "UBAH_PENGATURAN", settings: { discussSeconds: 90 } });
      const title = runActions(reducer, changed, replayActions());
      expect(title.phase).toBe("title");
      expect(setupDraftFrom(title)).toEqual({ count, seconds: 90 });
    }
  });

  it("setupActions yang dijalankan reducer membuka prolog dengan tim dan durasi pilihan", () => {
    for (const count of TEAM_COUNTS) {
      for (const seconds of DISCUSS_CHOICES) {
        const actions = setupActions({ count, seconds });
        expect(actions).toEqual([{ type: "SIMPAN_PENGATURAN", teams: DEFAULT_TEAMS.slice(0, count), settings: { discussSeconds: seconds } }]);
        const state = runActions(reducer, reducer(createInitialState(), { type: "MULAI" }), actions);
        expect(state.phase).toBe("prolog");
        expect(state.teams.map((team) => [team.id, team.stars])).toEqual(DEFAULT_TEAMS.slice(0, count).map((team) => [team.id, 0]));
        expect(state.settings).toEqual({ ...DEFAULT_SETTINGS, discussSeconds: seconds });
      }
    }
  });
});

describe("dialog pengaturan", () => {
  it("settingsOpenable hanya di prolog, intro, discuss, dan stars, tanpa pergantian adegan", () => {
    for (const phase of ALL_PHASES) {
      expect(settingsOpenable(phase, false)).toBe(["prolog", "intro", "discuss", "stars"].includes(phase));
      expect(settingsOpenable(phase, true)).toBe(false);
    }
  });

  it("settingsView untuk keempat kombinasi pengaturan komputer dan game", () => {
    const base = DEFAULT_SETTINGS;
    expect(settingsView(base, false)).toEqual({ sound: true, motion: { on: false, locked: false }, typewriter: { on: true, note: false }, seconds: 60 });
    expect(settingsView({ ...base, reducedMotion: true }, false)).toEqual({ sound: true, motion: { on: true, locked: false }, typewriter: { on: true, note: true }, seconds: 60 });
    expect(settingsView(base, true)).toEqual({ sound: true, motion: { on: true, locked: true }, typewriter: { on: true, note: true }, seconds: 60 });
    expect(settingsView({ sound: false, reducedMotion: true, typewriter: false, discussSeconds: 30 }, true)).toEqual({
      sound: false,
      motion: { on: true, locked: true },
      typewriter: { on: false, note: true },
      seconds: 30,
    });
  });
});

describe("adegan semu dan teks prolog", () => {
  it("openingScene memberi latar bg_title dan satu Nara tanpa mengubah adegan asalnya", () => {
    const before = structuredClone(SCENES[0]);
    const scene = openingScene(SCENES[0], "walk", TITLE_NARA_X, "teks");
    expect(SCENES[0]).toEqual(before);
    expect(scene).toEqual({ ...before, bg: "bg_title", altText: "teks", cast: [{ char: "nara", pose: "walk", x: 96, facing: "right" }] });
  });

  it("tiga layar prolog persis sesuai spesifikasi, masing-masing paling banyak tiga kalimat", () => {
    expect(PROLOG.map((screen) => screen.pose)).toEqual(["talk", "idle", "happy"]);
    expect(PROLOG[0].text).toBe(
      "Ini Nara, siswa kelas IX. Hari ini kalian menemani Nara dari pagi sampai malam. Di setiap adegan, kelas membantu Nara memilih tindakan.",
    );
    expect(PROLOG[1].text).toBe(
      "Lihat dua indikator di kiri: hak orang lain terjaga dan kewajiban dijalankan. Keduanya mulai dari 50 dan bergerak sesuai pilihan kelas. Indikator ini milik seluruh kelas, jadi semua tim menjaganya bersama.",
    );
    expect(PROLOG[2].text).toBe(
      "Tim yang mendapat giliran memutuskan pilihan, dan guru memberi bintang untuk alasan yang baik. Tidak ada yang kalah dalam permainan ini. Hari Nara dimulai sekarang!",
    );
    for (const screen of PROLOG) {
      expect(countSentences(screen.text)).toBeLessThanOrEqual(3);
      expect(screen.altText.startsWith("Jalan kampung pada pagi hari")).toBe(true);
    }
  });

  it("TITLE_ZONE sama dengan TITLE_ZONE di latar.py", () => {
    const source = readFileSync(new URL("../../../scripts/game/art/latar.py", import.meta.url), "utf8");
    const match = /^TITLE_ZONE = \((\d+), (\d+), (\d+), (\d+)\)/m.exec(source);
    expect(match?.slice(1).map(Number)).toEqual([TITLE_ZONE.x0, TITLE_ZONE.y0, TITLE_ZONE.x1, TITLE_ZONE.y1]);
  });
});

describe("teks dialog Tentang (F-11 bagian B, AC-B8)", () => {
  const about = copy.about;
  const texts: string[] = [
    about.title,
    about.aboutLabel,
    ...about.aboutLines,
    about.creditsLabel,
    ...about.credits.flatMap((credit) => [credit.label, credit.text, ...credit.notes]),
    about.close,
  ];

  it("lengkap, tanpa tanda teks sementara", () => {
    for (const text of texts) {
      expect(text.trim(), "teks kosong").not.toBe("");
      expect(text, text).not.toMatch(/[[\]{}]|TBD|draf|sementara|sedang dibuat/i);
    }
  });

  it("memuat lisensi huruf dan kedua pemberitahuan hak cipta persis", () => {
    const notes = about.credits.flatMap((credit) => [...credit.notes]);
    expect(texts).toContain("Press Start 2P dan Pixelify Sans, SIL Open Font License 1.1.");
    expect(notes).toEqual([
      'Copyright 2012 The Press Start 2P Project Authors (cody@zone38.net), with Reserved Font Name "Press Start 2P".',
      "Copyright 2021 The Pixelify Sans Project Authors (https://github.com/eifetx/Pixelify-Sans).",
      "Lisensi: scripts.sil.org/OFL",
    ]);
  });
});
