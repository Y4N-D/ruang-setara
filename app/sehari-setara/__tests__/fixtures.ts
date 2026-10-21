// Adegan tiruan untuk uji mesin, bukan naskah. Efek, tingkat, bendera, dan kuis
// meniru PRD bagian 8, sedangkan teksnya hanya penanda. Naskah asli masuk di F-03.
import type { Choice, ChoiceId, Scene, TeamSetup, Tier } from "../engine/types";

type Effect = [hak: number, kewajiban: number, tier: Tier];

function choice(sceneNo: number, id: ChoiceId, effect: Effect, extra: Partial<Choice> = {}): Choice {
  const [hak, kewajiban, tier] = effect;
  return {
    id,
    text: `Pilihan ${id} adegan ${sceneNo}`,
    effects: { hak, kewajiban },
    tier,
    reaction: [],
    impact: {
      terjadi: `Akibat pilihan ${id} adegan ${sceneNo}`,
      hak: "Hak tiruan",
      kewajiban: "Kewajiban tiruan",
      rujukan: [{ text: "Rujukan tiruan", verified: false }],
    },
    ...extra,
  };
}

function scene(
  no: 1 | 2 | 3 | 4 | 5 | 6,
  effects: Record<ChoiceId, Effect>,
  extra: Partial<Scene> = {},
  choiceExtra: Partial<Record<ChoiceId, Partial<Choice>>> = {},
): Scene {
  return {
    id: `s${no}`,
    title: `Adegan ${no}`,
    clock: "00.00",
    timeOfDay: "pagi",
    bg: `bg_tiruan_${no}`,
    altText: `Deskripsi adegan ${no}`,
    cast: [],
    narration: [`Narasi adegan ${no}`],
    question: `Pertanyaan adegan ${no}`,
    choices: [
      choice(no, "A", effects.A, choiceExtra.A),
      choice(no, "B", effects.B, choiceExtra.B),
      choice(no, "C", effects.C, choiceExtra.C),
    ],
    ...extra,
  };
}

export const SCENES: readonly Scene[] = [
  scene(1, { A: [-10, -15, "kurang"], B: [10, 15, "tepat"], C: [-5, 5, "kurang"] }),
  scene(2, { A: [-10, -20, "berisiko"], B: [10, 15, "tepat"], C: [0, -5, "kurang"] }),
  scene(3, { A: [-15, -10, "kurang"], B: [15, 10, "tepat"], C: [0, -5, "kurang"] }),
  scene(
    4,
    { A: [-20, -10, "berisiko"], B: [20, 10, "tepat"], C: [-10, -5, "kurang"] },
    {},
    { B: { setsFlag: "komangDibela" } },
  ),
  scene(
    5,
    { A: [-20, -15, "berisiko"], B: [15, 15, "tepat"], C: [-5, -5, "kurang"] },
    { roleQuiz: { question: "Pertanyaan kuis tiruan", answer: "hakim" } },
  ),
  scene(
    6,
    { A: [-20, -15, "berisiko"], B: [20, 15, "tepat"], C: [-5, 0, "kurang"] },
    { narrationIfFlag: { flag: "komangDibela", present: ["Narasi varian hadir"], absent: ["Narasi varian absen"] } },
    { B: { textIfFlag: { flag: "komangDibela", text: "Pilihan B adegan 6, varian" } } },
  ),
];

/** Nama, warna, dan bentuk tim bawaan dari Design System bagian 7 (data contoh). */
export const TEAMS: TeamSetup[] = [
  { id: "mangga", name: "Tim Mangga", color: "mango", shape: "lingkaran" },
  { id: "laut", name: "Tim Laut", color: "sky-d", shape: "segitiga" },
  { id: "daun", name: "Tim Daun", color: "leaf", shape: "persegi" },
  { id: "mentari", name: "Tim Mentari", color: "sun", shape: "bintang" },
];
