// Uji unit kuis peran penegak hukum (spesifikasi F-08, AC-16), dengan naskah asli adegan 5 dan peran dari roles.ts.
import { describe, expect, it } from "vitest";
import { copy } from "../content/copy";
import { ROLES } from "../content/roles";
import { SCENES } from "../content/scenes";
import { isQuizCorrect } from "../engine/rules";
import type { RoleId } from "../engine/types";
import { IMPACT_GUARD_MS } from "../ui/impact";
import {
  QUIZ_GUARD_MS,
  quizCardName,
  quizCards,
  quizFeedback,
  quizResultAnnouncement,
  quizStartAnnouncement,
  roleForNumber,
} from "../ui/quiz";

const quizScene = SCENES[4];
const quiz = quizScene.roleQuiz;
if (!quiz) throw new Error("adegan 5 tidak punya roleQuiz");
const IDS: RoleId[] = ["polisi", "jaksa", "advokat", "hakim"];

describe("konstanta dan naskah (spesifikasi F-08)", () => {
  it("masa tunggu 600 ms, sama dengan kartu dampak F-06", () => {
    expect(QUIZ_GUARD_MS).toBe(600);
    expect(QUIZ_GUARD_MS).toBe(IMPACT_GUARD_MS);
  });

  it("hanya adegan 5 yang berkuis, dengan jawaban hakim dan empat peran berurutan sesuai PRD", () => {
    expect(SCENES.map((scene) => scene.roleQuiz !== undefined)).toEqual([false, false, false, false, true, false]);
    expect(quiz.answer).toBe("hakim");
    expect(ROLES.map((role) => role.id)).toEqual(IDS);
    expect(ROLES.map((role) => role.label)).toEqual(["Polisi", "Jaksa", "Advokat", "Hakim"]);
  });
});

describe("roleForNumber", () => {
  it("1 sampai 4 adalah Polisi, Jaksa, Advokat, dan Hakim", () => {
    expect([1, 2, 3, 4].map((n) => roleForNumber(n, ROLES)?.label)).toEqual(["Polisi", "Jaksa", "Advokat", "Hakim"]);
  });

  it("nomor lain tidak menghasilkan peran", () => {
    for (const n of [0, 5, 9, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) expect(roleForNumber(n, ROLES)).toBeUndefined();
  });
});

describe("quizCards", () => {
  it("sebelum dijawab: empat kartu bernomor 1 sampai 4, tertutup, tanpa tanda", () => {
    const cards = quizCards(ROLES, null, quiz.answer);
    expect(cards.map((card) => [card.number, card.role.id])).toEqual([[1, "polisi"], [2, "jaksa"], [3, "advokat"], [4, "hakim"]]);
    for (const card of cards) {
      expect([card.open, card.correct, card.chosen, card.mark]).toEqual([false, false, false, null]);
    }
  });

  it("sesudah dijawab: semua terbuka; jawaban tepat pada Hakim; pilihan kelas pada jawaban yang keliru", () => {
    const expected: Record<RoleId, Array<[boolean, boolean, "tepat" | "pilihan" | null]>> = {
      polisi: [[false, true, "pilihan"], [false, false, null], [false, false, null], [true, false, "tepat"]],
      jaksa: [[false, false, null], [false, true, "pilihan"], [false, false, null], [true, false, "tepat"]],
      advokat: [[false, false, null], [false, false, null], [false, true, "pilihan"], [true, false, "tepat"]],
      hakim: [[false, false, null], [false, false, null], [false, false, null], [true, true, "tepat"]],
    };
    for (const answer of IDS) {
      const cards = quizCards(ROLES, answer, quiz.answer);
      expect(cards.every((card) => card.open), answer).toBe(true);
      expect(cards.map((card) => [card.correct, card.chosen, card.mark]), answer).toEqual(expected[answer]);
    }
  });
});

describe("umpan balik", () => {
  it("dua kalimat: Tepat! atau Belum tepat., lalu kalimat yang sama untuk semua jawaban", () => {
    expect(quizFeedback(true)).toEqual([
      "Tepat! Hakimlah yang memeriksa, mengadili, dan memutus perkara.",
      "Setiap peran punya tugas sendiri agar perkara diproses dengan adil.",
    ]);
    expect(quizFeedback(false)).toEqual([
      "Belum tepat. Hakimlah yang memeriksa, mengadili, dan memutus perkara.",
      "Setiap peran punya tugas sendiri agar perkara diproses dengan adil.",
    ]);
  });

  it("hanya jawaban naskah yang tepat (isQuizCorrect F-02)", () => {
    expect(IDS.map((id) => isQuizCorrect(quizScene, id))).toEqual([false, false, false, true]);
  });

  it("kalimat alasan diawali nama peran jawaban naskah, sehingga perubahan jawaban naskah langsung ketahuan", () => {
    const answer = ROLES.find((role) => role.id === quiz.answer);
    expect(answer).toBeDefined();
    expect(copy.quiz.reason.startsWith(`${answer?.label}lah `)).toBe(true);
  });
});

describe("nama kartu bagi pembaca layar", () => {
  it("sebelum dijawab: Peran {n}: {nama}", () => {
    expect(quizCards(ROLES, null, quiz.answer).map(quizCardName)).toEqual([
      "Peran 1: Polisi",
      "Peran 2: Jaksa",
      "Peran 3: Advokat",
      "Peran 4: Hakim",
    ]);
  });

  it("sesudah dijawab: tugas, lalu Jawaban tepat. dan Pilihan kelas. pada kartu yang ditandai", () => {
    expect(quizCards(ROLES, "advokat", quiz.answer).map(quizCardName)).toEqual([
      "Peran 1: Polisi. Menerima laporan dan menyidik.",
      "Peran 2: Jaksa. Menuntut.",
      "Peran 3: Advokat. Mendampingi. Pilihan kelas.",
      "Peran 4: Hakim. Memutus. Jawaban tepat.",
    ]);
    expect(quizCards(ROLES, "hakim", quiz.answer).map(quizCardName)).toEqual([
      "Peran 1: Polisi. Menerima laporan dan menyidik.",
      "Peran 2: Jaksa. Menuntut.",
      "Peran 3: Advokat. Mendampingi.",
      "Peran 4: Hakim. Memutus. Jawaban tepat. Pilihan kelas.",
    ]);
  });

  it("setiap nama memuat nama peran yang terlihat", () => {
    for (const answer of [null, ...IDS]) {
      for (const card of quizCards(ROLES, answer, quiz.answer)) expect(quizCardName(card)).toContain(card.role.label);
    }
  });
});

describe("pengumuman", () => {
  it("pembuka: judul, pertanyaan naskah, dan pilihan bernomor", () => {
    expect(quizStartAnnouncement(quiz.question, ROLES)).toBe(
      "Kuis peran. Jika perkara ini sampai ke pengadilan, siapa yang memeriksa, mengadili, dan memutusnya? Pilihannya: 1 Polisi, 2 Jaksa, 3 Advokat, 4 Hakim.",
    );
  });

  it("hasil: sama persis dengan contoh spesifikasi untuk jawaban Advokat", () => {
    expect(quizResultAnnouncement(ROLES, "advokat", isQuizCorrect(quizScene, "advokat"))).toBe(
      "Belum tepat. Jawaban kelas: Advokat. Hakimlah yang memeriksa, mengadili, dan memutus perkara. Tugas setiap peran. " +
        "Polisi: Menerima laporan dan menyidik. Jaksa: Menuntut. Advokat: Mendampingi. Hakim: Memutus. " +
        "Setiap peran punya tugas sendiri agar perkara diproses dengan adil.",
    );
  });

  it("hasil untuk keempat jawaban: hanya kata pembuka dan jawaban kelas yang berbeda", () => {
    const rest =
      "Hakimlah yang memeriksa, mengadili, dan memutus perkara. Tugas setiap peran. Polisi: Menerima laporan dan menyidik. " +
      "Jaksa: Menuntut. Advokat: Mendampingi. Hakim: Memutus. Setiap peran punya tugas sendiri agar perkara diproses dengan adil.";
    const labels: Record<RoleId, string> = { polisi: "Polisi", jaksa: "Jaksa", advokat: "Advokat", hakim: "Hakim" };
    for (const id of IDS) {
      const verdict = id === "hakim" ? "Tepat!" : "Belum tepat.";
      expect(quizResultAnnouncement(ROLES, id, isQuizCorrect(quizScene, id))).toBe(`${verdict} Jawaban kelas: ${labels[id]}. ${rest}`);
    }
  });
});
