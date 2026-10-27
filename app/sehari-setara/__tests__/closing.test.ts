// Uji unit fungsi murni layar penutup (spesifikasi F-09, AC-24): timbangan, rekap, baris kuis, tanda bintang terbanyak,
// pengumuman, dan teks ketiga akhir. Memakai naskah asli dan reducer F-02.
import { describe, expect, it } from "vitest";
import { copy } from "../content/copy";
import { ENDINGS } from "../content/endings";
import { ROLES } from "../content/roles";
import { SCENES } from "../content/scenes";
import { DEFAULT_TEAMS } from "../content/teams";
import { createInitialState, createReducer } from "../engine/reducer";
import { choiceText, endingFor, flagsFromHistory } from "../engine/rules";
import type { ChoiceId, GameAction, GameState, RoleId, Stars } from "../engine/types";
import {
  bestChoice,
  CLOSING_GUARD_MS,
  endingAnnouncement,
  quizLine,
  recapPageAnnouncement,
  recapPages,
  recapRows,
  reflectionAnnouncement,
  SCALE_BOX,
  SCALE_DELAY_MS,
  SCALE_FRAME_MS,
  scaleSentence,
  scaleView,
  topTeamIds,
  type ScaleView,
} from "../ui/closing";
import { runActions, startActions } from "../ui/controls";
import { teamSentence } from "../ui/turn";

const reducer = createReducer(SCENES);

/** Satu hari penuh dengan aksi layar permainan: jalur pilihan, bintang per adegan, dan jawaban kuis adegan 5. */
function playDay(path: string, stars: readonly Stars[] = [1, 1, 1, 1, 1, 1], role: RoleId = "hakim", teamCount = 2): GameState {
  let state = runActions(reducer, createInitialState(), startActions(DEFAULT_TEAMS.slice(0, teamCount)));
  [...path].forEach((id, i) => {
    const actions: GameAction[] = [{ type: "NARASI_SELESAI" }, { type: "PILIH", choice: id as ChoiceId }, { type: "REAKSI_SELESAI" }, { type: "LANJUT" }];
    if (SCENES[i].roleQuiz) actions.push({ type: "JAWAB_KUIS", role }, { type: "LANJUT" });
    actions.push({ type: "BERI_BINTANG", stars: stars[i] }, { type: "LANJUT" });
    state = runActions(reducer, state, actions);
  });
  expect(state.phase).toBe("ending");
  return state;
}

/** Ke-729 jalur naskah. */
const ALL_PATHS: string[] = Array.from({ length: 729 }, (_, n) =>
  Array.from({ length: 6 }, (_, i) => "ABC"[Math.floor(n / 3 ** (5 - i)) % 3]).join(""),
);

describe("konstanta (spesifikasi F-09)", () => {
  it("sesuai bagian Data dan aksi", () => {
    expect(CLOSING_GUARD_MS).toBe(600);
    expect(SCALE_BOX).toEqual({ left: 232, top: 16, w: 48, h: 32 });
    expect([SCALE_DELAY_MS, SCALE_FRAME_MS]).toEqual([300, 200]);
  });

  it("kotak timbangan berada di tengah END_SCALE_ZONE (x 220–292, y 8–56)", () => {
    expect(SCALE_BOX.left - 220).toBe(292 - (SCALE_BOX.left + SCALE_BOX.w));
    expect(SCALE_BOX.top - 8).toBe(56 - (SCALE_BOX.top + SCALE_BOX.h));
  });
});

describe("timbangan", () => {
  it("bingkai akhir menurut jenis akhir dan sisi yang lebih tinggi (usulan 2, pilihan a)", () => {
    const cases: Array<[number, number, ScaleView["frame"], ScaleView["side"]]> = [
      [100, 100, 2, null],
      [100, 80, 2, null],
      [80, 100, 2, null],
      [100, 65, 1, "hak"],
      [65, 80, 3, "kewajiban"],
      [50, 50, 3, null],
      [65, 35, 0, "hak"],
      [25, 35, 4, "kewajiban"],
      [0, 0, 4, null],
    ];
    for (const [hak, kewajiban, frame, side] of cases) {
      const view = scaleView({ hak, kewajiban });
      expect([view.frame, view.side]).toEqual([frame, side]);
    }
  });

  it("contoh jalur di spesifikasi", () => {
    const expected: Record<string, ScaleView["frame"]> = {
      BBBBBB: 2,
      AABBBB: 1,
      BBBCCC: 3,
      ABABBA: 3,
      AABBAB: 0,
      AAAAAA: 4,
      CCCCCC: 4,
    };
    for (const [path, frame] of Object.entries(expected)) expect(scaleView(playDay(path).meters).frame).toBe(frame);
  });

  it("nama gerak dan urutan bingkai", () => {
    const motions = [
      [100, 100, "seimbang", [2, 1, 3, 2]],
      [65, 80, "sedikit-kanan", [2, 1, 3]],
      [100, 65, "sedikit-kiri", [2, 3, 1]],
      [25, 35, "miring-kanan", [2, 1, 3, 4]],
      [65, 35, "miring-kiri", [2, 3, 1, 0]],
    ] as const;
    for (const [hak, kewajiban, motion, sequence] of motions) {
      const view = scaleView({ hak, kewajiban });
      expect([view.motion, view.sequence]).toEqual([motion, sequence]);
    }
  });

  it("ke-729 jalur: besar kemiringan mengikuti jenis akhir, sisi lebih tinggi turun, dan gerak berakhir di bingkai akhir", () => {
    const frames = new Set<number>();
    for (const path of ALL_PATHS) {
      const { meters } = playDay(path);
      const view = scaleView(meters);
      const ending = endingFor(meters);
      const tilt = { setara: "seimbang", hampir: "sedikit", berat: "miring" }[ending];
      expect(view.tilt).toBe(tilt);
      if (ending === "setara") expect(view.frame).toBe(2);
      else if (meters.hak > meters.kewajiban) expect(view.frame).toBe(ending === "hampir" ? 1 : 0);
      else expect(view.frame).toBe(ending === "hampir" ? 3 : 4);
      expect(view.side).toBe(ending === "setara" || meters.hak === meters.kewajiban ? null : meters.hak > meters.kewajiban ? "hak" : "kewajiban");
      expect(view.sequence[0]).toBe(2);
      expect(view.sequence[view.sequence.length - 1]).toBe(view.frame);
      frames.add(view.frame);
    }
    expect([...frames].sort()).toEqual([0, 1, 2, 3, 4]);
  });

  it("kalimat timbangan, dengan nama indikator huruf kecil", () => {
    const sentence = (hak: number, kewajiban: number) => scaleSentence(scaleView({ hak, kewajiban }));
    expect(sentence(100, 100)).toBe("Timbangan seimbang.");
    expect(sentence(100, 65)).toBe("Timbangan sedikit miring ke sisi hak orang lain terjaga.");
    expect(sentence(65, 80)).toBe("Timbangan sedikit miring ke sisi kewajiban dijalankan.");
    expect(sentence(65, 35)).toBe("Timbangan miring ke sisi hak orang lain terjaga.");
    expect(sentence(25, 35)).toBe("Timbangan miring ke sisi kewajiban dijalankan.");
    expect(sentence(50, 50)).toBe("Timbangan sedikit miring.");
    expect(sentence(0, 0)).toBe("Timbangan miring.");
  });
});

describe("pilihan yang paling menjaga keseimbangan (usulan 4a)", () => {
  it("setiap adegan punya tepat satu pilihan bertingkat tepat, yaitu B", () => {
    for (const scene of SCENES) {
      expect(scene.choices.filter((choice) => choice.tier === "tepat")).toHaveLength(1);
      expect(bestChoice(scene).id).toBe("B");
    }
  });

  it("rujukan ketiga pilihan satu adegan sama, jadi rujukan pilihan terbaik sama dengan kartu dampak pilihan kelas", () => {
    for (const scene of SCENES) {
      for (const choice of scene.choices) expect(choice.impact.rujukan).toEqual(bestChoice(scene).impact.rujukan);
    }
  });
});

describe("baris rekap", () => {
  const STARS: Stars[] = [2, 1, 0, 2, 1, 2];

  it.each([
    ["BBBBBB", true],
    ["BBBCCC", false],
    ["AAAAAA", false],
    ["CCCCCC", false],
  ])("jalur %s: pilihan, teks, tingkat, pilihan terbaik, rujukan, tim, bintang, dan kuis", (path, variant) => {
    const state = playDay(path, STARS, "advokat");
    const rows = recapRows(state.history, SCENES, state.teams, state.flags);
    expect(rows.map((row) => row.number)).toEqual([1, 2, 3, 4, 5, 6]);
    rows.forEach((row, i) => {
      const scene = SCENES[i];
      expect(row.scene).toBe(scene);
      expect(row.choice.id).toBe(path[i]);
      expect(row.best.id).toBe("B");
      expect(row.same).toBe(path[i] === "B");
      expect(row.references).toEqual(scene.choices.find((choice) => choice.id === path[i])?.impact.rujukan);
      const { id, name, shape } = DEFAULT_TEAMS[i % 2];
      expect(row.team).toEqual({ id, name, shape });
      expect(row.stars).toBe(STARS[i]);
      expect(row.quiz).toEqual(scene.roleQuiz ? { answer: "advokat", correct: false } : null);
    });
    const b6 = SCENES[5].choices[1];
    expect(rows[5].bestText).toBe(variant ? b6.textIfFlag?.text : b6.text);
    if (path[5] === "B") expect(rows[5].choiceText).toBe(rows[5].bestText);
  });

  it("jawaban kuis tepat ditandai benar", () => {
    const state = playDay("BBBBBB", undefined, "hakim");
    const rows = recapRows(state.history, SCENES, state.teams, state.flags);
    expect(rows[4].quiz).toEqual({ answer: "hakim", correct: true });
  });

  it("ke-729 jalur: teks dengan bendera akhir sama dengan teks saat adegan dimainkan", () => {
    for (const path of ALL_PATHS) {
      const state = playDay(path);
      const rows = recapRows(state.history, SCENES, state.teams, state.flags);
      rows.forEach((row, i) => {
        const flagsThen = flagsFromHistory(state.history.slice(0, i), SCENES);
        expect(row.choiceText).toBe(choiceText(row.choice, flagsThen));
        expect(row.bestText).toBe(choiceText(row.best, flagsThen));
      });
    }
  });

  it("halaman menurut waktu adegan", () => {
    expect(recapPages(SCENES)).toEqual([[0, 1], [2, 3], [4], [5]]);
  });
});

describe("baris kuis (A-8)", () => {
  it("keempat jawaban, dengan label peran dan peran tepat dari naskah", () => {
    const correctId = SCENES[4].roleQuiz?.answer;
    expect(correctId).toBe("hakim");
    const line = (answer: RoleId) => quizLine({ answer, correct: answer === correctId }, ROLES, correctId ?? "hakim");
    expect(line("polisi")).toBe("Kuis peran: jawaban kelas Polisi, jawaban tepat Hakim.");
    expect(line("jaksa")).toBe("Kuis peran: jawaban kelas Jaksa, jawaban tepat Hakim.");
    expect(line("advokat")).toBe("Kuis peran: jawaban kelas Advokat, jawaban tepat Hakim.");
    expect(line("hakim")).toBe("Kuis peran: jawaban kelas Hakim, tepat.");
  });
});

describe("tanda bintang terbanyak (A-2)", () => {
  const teams = (...stars: number[]) => DEFAULT_TEAMS.slice(0, stars.length).map((team, i) => ({ ...team, stars: stars[i] }));

  it("satu tim tertinggi, seri, semua 0, dan empat tim dengan dua tim seri", () => {
    expect(topTeamIds(teams(3, 5))).toEqual(["laut"]);
    expect(topTeamIds(teams(3, 3))).toEqual(["mangga", "laut"]);
    expect(topTeamIds(teams(0, 0))).toEqual([]);
    expect(topTeamIds(teams(0, 0, 0, 0))).toEqual([]);
    expect(topTeamIds(teams(3, 3, 0, 2))).toEqual(["mangga", "laut"]);
    expect(topTeamIds(teams(2, 2, 2))).toEqual(["mangga", "laut", "daun"]);
    expect(topTeamIds(teams(2, 2, 2, 2))).toEqual(["mangga", "laut", "daun", "mentari"]);
  });

  it("kalimat papan tim bagi pembaca layar", () => {
    expect(teamSentence("Tim Laut", false, 5, true)).toBe("Tim Laut, 5 bintang, bintang terbanyak.");
    expect(teamSentence("Tim Mangga", false, 3)).toBe("Tim Mangga, 3 bintang.");
  });
});

describe("pengumuman", () => {
  it("layar akhir: contoh B-B-B-C-C-C di spesifikasi", () => {
    const { meters } = playDay("BBBCCC");
    expect(endingFor(meters)).toBe("hampir");
    expect(endingAnnouncement("hampir", meters, scaleView(meters))).toBe(
      "Akhir hari: Hampir Seimbang. Banyak pilihan kelas sudah baik, tetapi ada yang masih bisa diperbaiki. Mari lihat rekap untuk menemukan pilihan yang lebih menjaga keseimbangan. Hak orang lain terjaga 65. Kewajiban dijalankan 80. Timbangan sedikit miring ke sisi kewajiban dijalankan.",
    );
  });

  it("layar akhir: susunan untuk ketiga akhir", () => {
    for (const path of ["BBBBBB", "BBBCCC", "AAAAAA"]) {
      const { meters } = playDay(path);
      const id = endingFor(meters);
      const view = scaleView(meters);
      const ending = ENDINGS[id];
      expect(endingAnnouncement(id, meters, view)).toBe(
        [
          `Akhir hari: ${ending.title}.`,
          ending.message[0],
          ending.message[1],
          `Hak orang lain terjaga ${meters.hak}.`,
          `Kewajiban dijalankan ${meters.kewajiban}.`,
          scaleSentence(view),
        ].join(" "),
      );
    }
  });

  it("halaman 1 rekap: contoh semua B, dua tim, bintang 2 dan 1 di spesifikasi", () => {
    const state = playDay("BBBBBB", [2, 1, 1, 1, 1, 1]);
    const rows = recapRows(state.history, SCENES, state.teams, state.flags);
    expect(recapPageAnnouncement(rows, recapPages(SCENES), 1)).toBe(
      "Rekap pilihan kelas, pagi, halaman 1 dari 4. Adegan 1, Pagi di rumah, pukul 06.15. Tim Mangga, 2 bintang. Pilihan kelas B: Mengantar Gita, lalu memberi tahu ketua kelas akan sedikit terlambat dan mengganti piket saat istirahat. Tepat. Pilihan yang paling menjaga keseimbangan: sama dengan pilihan kelas. Rujukan: Pasal 28B ayat (2) UUD NRI 1945; UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 14 ayat (1); UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 19. Adegan 2, Perjalanan ke sekolah, pukul 06.50. Tim Laut, 1 bintang. Pilihan kelas B: Menolak dengan sopan, berjalan cepat atau naik angkot, dan mengingatkan Dimas memakai helm. Tepat. Pilihan yang paling menjaga keseimbangan: sama dengan pilihan kelas. Rujukan: Pasal 28G ayat (1) UUD NRI 1945; Pasal 31 ayat (1) UUD NRI 1945; Pasal 27 ayat (1) UUD NRI 1945; UU No. 22 Tahun 2009 tentang LLAJ, Pasal 77 ayat (1) dan Pasal 106 ayat (8).",
    );
  });

  it("halaman rekap: susunan setiap kotak, termasuk baris kuis di adegan 5 dan pilihan terbaik yang berbeda", () => {
    const state = playDay("BBBCCC", [2, 1, 0, 2, 1, 2], "advokat");
    const rows = recapRows(state.history, SCENES, state.teams, state.flags);
    const pages = recapPages(SCENES);
    const times = ["pagi", "siang", "sore", "malam"];
    pages.forEach((indexes, p) => {
      const parts = [`Rekap pilihan kelas, ${times[p]}, halaman ${p + 1} dari 4.`];
      for (const i of indexes) {
        const row = rows[i];
        parts.push(`Adegan ${i + 1}, ${row.scene.title}, pukul ${row.scene.clock}.`);
        parts.push(`${row.team?.name}, ${row.stars} bintang.`);
        parts.push(`Pilihan kelas ${row.choice.id}: ${row.choiceText}.`, `${copy.impact.tier[row.choice.tier]}.`);
        if (i === 4) parts.push("Kuis peran: jawaban kelas Advokat, jawaban tepat Hakim.");
        parts.push(
          row.same
            ? "Pilihan yang paling menjaga keseimbangan: sama dengan pilihan kelas."
            : `Pilihan yang paling menjaga keseimbangan ${row.best.id}: ${row.bestText}.`,
        );
        parts.push(`Rujukan: ${row.references.map((reference) => reference.text).join("; ")}.`);
      }
      expect(recapPageAnnouncement(rows, pages, p + 1)).toBe(parts.join(" "));
    });
  });

  it("refleksi", () => {
    expect(reflectionAnnouncement()).toBe(
      "Refleksi. Tulis jawabanmu di buku catatan. 1. Pilihan mana yang paling sulit diputuskan kelasmu hari ini, dan mengapa? 2. Hak siapa yang terdampak oleh pilihan itu, dan pasal mana di rekap yang berkaitan dengannya? 3. Bila kamu mengalami situasi serupa, apa yang akan kamu lakukan agar hak orang lain terjaga dan kewajibanmu tetap dijalankan?",
    );
  });
});

describe("teks ketiga akhir", () => {
  it("judul sesuai PRD bagian 9 dan tanpa kata kalah, gagal, atau salah", () => {
    expect(ENDINGS.setara.title).toBe("Warga Setara");
    expect(ENDINGS.hampir.title).toBe("Hampir Seimbang");
    expect(ENDINGS.berat.title).toBe("Hari yang Berat");
    for (const ending of Object.values(ENDINGS)) {
      const text = [ending.title, ...ending.message, ending.alt].join(" ");
      expect(text).not.toMatch(/\b(kalah|gagal|salah)\b/i);
    }
  });
});
