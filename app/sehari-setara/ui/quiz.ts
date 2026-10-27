// Kuis peran penegak hukum (Design System bagian 7; spesifikasi F-08): fungsi murni untuk kartu peran, umpan balik,
// nama kartu bagi pembaca layar, dan pengumuman. Diuji di quiz.test.ts. Masa tunggu dan aksi diatur PlayScreen.tsx;
// jawaban disimpan mesin F-02 (quizAnswer), dan tepat atau tidaknya ditentukan isQuizCorrect.
import { copy } from "../content/copy";
import type { RoleId, RoleInfo } from "../engine/types";

/** Masa tunggu "Lanjut" kuis sesudah jawaban tampil, sama dengan IMPACT_GUARD_MS kartu dampak (Design System bagian 8). */
export const QUIZ_GUARD_MS = 600;

/** Nomor kartu peran, juga tombol pintasannya. */
export type QuizNumber = 1 | 2 | 3 | 4;

const NUMBERS: readonly QuizNumber[] = [1, 2, 3, 4];

/** Keadaan satu kartu peran. mark: label yang tampil di kartu ("tepat" atau "pilihan"), atau null bila tanpa label. */
export interface QuizCard {
  role: RoleInfo;
  number: QuizNumber;
  open: boolean;
  correct: boolean;
  chosen: boolean;
  mark: "tepat" | "pilihan" | null;
}

/** Peran ke-n (1 sampai 4) di roles, atau undefined untuk nomor lain. */
export function roleForNumber(number: number, roles: readonly RoleInfo[]): RoleInfo | undefined {
  return NUMBERS.includes(number as QuizNumber) ? roles[number - 1] : undefined;
}

/**
 * Empat kartu berurutan seperti roles. Sebelum dijawab semuanya tertutup tanpa tanda. Sesudah dijawab semuanya
 * terbuka: correct hanya pada correctId, chosen hanya pada answer, dan label "tepat" pada kartu jawaban, "pilihan"
 * pada pilihan kelas yang keliru (bila kelas menjawab dengan tepat, kartu itu hanya berlabel "tepat"; K-4).
 */
export function quizCards(roles: readonly RoleInfo[], answer: RoleId | null, correctId: RoleId): QuizCard[] {
  const open = answer !== null;
  return NUMBERS.map((number, index) => {
    const role = roles[index];
    const correct = open && role.id === correctId;
    const chosen = open && role.id === answer;
    return { role, number, open, correct, chosen, mark: correct ? "tepat" : chosen ? "pilihan" : null };
  });
}

/** Dua kalimat pita umpan balik; isCorrect benar bila kelas menjawab peran roleQuiz.answer (isQuizCorrect F-02). */
export function quizFeedback(isCorrect: boolean): [string, string] {
  const verdict = isCorrect ? copy.quiz.verdict.tepat : copy.quiz.verdict.belum;
  return [`${verdict} ${copy.quiz.reason}`, copy.quiz.closing];
}

/**
 * Nama kartu bagi pembaca layar (K-1): "Peran 1: Polisi" sebelum dijawab; sesudahnya ditambah tugas, lalu
 * "Jawaban tepat." pada kartu jawaban dan "Pilihan kelas." pada kartu pilihan kelas.
 */
export function quizCardName(card: QuizCard): string {
  const name = copy.quiz.cardName(card.number, card.role.label);
  if (!card.open) return name;
  const marks = [card.correct && copy.quiz.mark.tepat, card.chosen && copy.quiz.mark.pilihan].filter((mark) => mark);
  return [`${name}. ${card.role.tugas}`, ...marks.map((mark) => `${mark}.`)].join(" ");
}

/** Pengumuman saat kuis tampil: judul, pertanyaan, dan keempat pilihan bernomor. */
export function quizStartAnnouncement(question: string, roles: readonly RoleInfo[]): string {
  const options = roles.map((role, index) => `${index + 1} ${role.label}`).join(", ");
  return `${copy.quiz.title}. ${question} ${copy.quiz.choicesIntro} ${options}.`;
}

/** Pengumuman sesudah dijawab: hasil, jawaban kelas, alasan, tugas keempat peran, dan kalimat penutup (K-3, K-6). */
export function quizResultAnnouncement(roles: readonly RoleInfo[], answer: RoleId, isCorrect: boolean): string {
  const verdict = isCorrect ? copy.quiz.verdict.tepat : copy.quiz.verdict.belum;
  const label = roles.find((role) => role.id === answer)?.label ?? answer;
  const duties = roles.map((role) => `${role.label}: ${role.tugas}`).join(" ");
  return [verdict, copy.quiz.answer(label), copy.quiz.reason, copy.quiz.dutiesIntro, duties, copy.quiz.closing].join(" ");
}
