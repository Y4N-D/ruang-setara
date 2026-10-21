import { describe, expect, it } from "vitest";
import {
  activeTeamIndex,
  applyEffects,
  choiceText,
  clamp,
  endingFor,
  flagsFromHistory,
  isQuizCorrect,
  metersFromHistory,
  narrationFor,
  starsByTeam,
} from "../engine/rules";
import type { HistoryEntry } from "../engine/types";
import { SCENES } from "./fixtures";

const s4 = SCENES[3];
const s5 = SCENES[4];
const s6 = SCENES[5];

describe("clamp", () => {
  it("membatasi nilai ke 0–100", () => {
    expect(clamp(-5)).toBe(0);
    expect(clamp(0)).toBe(0);
    expect(clamp(55)).toBe(55);
    expect(clamp(100)).toBe(100);
    expect(clamp(120)).toBe(100);
  });
});

describe("activeTeamIndex", () => {
  it.each([
    [2, [0, 1, 0, 1, 0, 1]],
    [3, [0, 1, 2, 0, 1, 2]],
    [4, [0, 1, 2, 3, 0, 1]],
  ])("merotasi giliran untuk %i tim di adegan 1–6", (teamCount, expected) => {
    expect([0, 1, 2, 3, 4, 5].map((i) => activeTeamIndex(i, teamCount))).toEqual(expected);
  });
});

describe("endingFor", () => {
  it.each([
    [75, 75, "setara"],
    [100, 100, "setara"],
    [74, 75, "hampir"],
    [75, 74, "hampir"],
    [40, 40, "hampir"],
    [50, 50, "hampir"],
    [39, 90, "berat"],
    [90, 39, "berat"],
    [0, 0, "berat"],
  ])("H %i, K %i menghasilkan %s", (hak, kewajiban, expected) => {
    expect(endingFor({ hak, kewajiban })).toBe(expected);
  });
});

describe("applyEffects", () => {
  it("membatasi di setiap langkah: 50 → 70 → 90 → 100 → 80", () => {
    const steps = [20, 20, 20, -20];
    const seen: number[] = [];
    let meters = { hak: 50, kewajiban: 50 };
    for (const hak of steps) {
      meters = applyEffects(meters, { hak, kewajiban: 0 });
      seen.push(meters.hak);
    }
    expect(seen).toEqual([70, 90, 100, 80]);
  });
});

describe("turunan dari history", () => {
  const history: HistoryEntry[] = [
    { sceneId: "s1", choiceId: "B", teamId: "mangga", stars: 2 },
    { sceneId: "s2", choiceId: "B", teamId: "laut", stars: 1 },
    { sceneId: "s3", choiceId: "B", teamId: "mangga", stars: 0 },
    { sceneId: "s4", choiceId: "B", teamId: "laut", stars: 2 },
  ];

  it("menghitung indikator dari 50/50 dengan batas per langkah", () => {
    expect(metersFromHistory([], SCENES)).toEqual({ hak: 50, kewajiban: 50 });
    expect(metersFromHistory(history, SCENES)).toEqual({ hak: 100, kewajiban: 100 });
    expect(metersFromHistory(history.slice(0, 2), SCENES)).toEqual({ hak: 70, kewajiban: 80 });
  });

  it("mengumpulkan bendera tanpa duplikat", () => {
    expect(flagsFromHistory(history.slice(0, 3), SCENES)).toEqual([]);
    expect(flagsFromHistory([...history, history[3]], SCENES)).toEqual(["komangDibela"]);
  });

  it("menjumlahkan bintang per tim", () => {
    const totals = starsByTeam(history);
    expect(totals.get("mangga")).toBe(2);
    expect(totals.get("laut")).toBe(3);
    expect(totals.get("daun")).toBeUndefined();
  });
});

describe("teks varian (FR-10)", () => {
  it("memakai varian pilihan dan narasi bila komangDibela sudah disetel", () => {
    expect(choiceText(s6.choices[1], ["komangDibela"])).toBe("Pilihan B adegan 6, varian");
    expect(narrationFor(s6, ["komangDibela"])).toEqual(["Narasi adegan 6", "Narasi varian hadir"]);
  });

  it("memakai teks dasar bila bendera belum disetel", () => {
    expect(choiceText(s6.choices[1], [])).toBe("Pilihan B adegan 6");
    expect(narrationFor(s6, [])).toEqual(["Narasi adegan 6", "Narasi varian absen"]);
  });

  it("tidak mengubah adegan tanpa varian", () => {
    expect(choiceText(s4.choices[0], ["komangDibela"])).toBe("Pilihan A adegan 4");
    expect(narrationFor(s4, ["komangDibela"])).toEqual(["Narasi adegan 4"]);
  });
});

describe("isQuizCorrect", () => {
  it("benar hanya untuk jawaban hakim di adegan berkuis", () => {
    expect(isQuizCorrect(s5, "hakim")).toBe(true);
    expect(isQuizCorrect(s5, "polisi")).toBe(false);
    expect(isQuizCorrect(s5, null)).toBe(false);
    expect(isQuizCorrect(s4, "hakim")).toBe(false);
  });
});
