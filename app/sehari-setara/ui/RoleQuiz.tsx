// Kuis peran penegak hukum (Design System bagian 7; spesifikasi F-08): dialog di adegan 5 sesudah kartu dampak.
// Jawaban, masa tunggu "Lanjut", bunyi, dan pengumuman diatur PlayScreen; dialog ini menampilkan pertanyaan, empat kartu
// peran, dan pita umpan balik, serta menjaga fokus tetap di dalam dialog.
import { useEffect, useRef, type KeyboardEvent } from "react";
import { emoteIcons, roleIcons } from "../assets/manifest";
import { copy } from "../content/copy";
import type { RoleId, RoleInfo } from "../engine/types";
import { quizCardName, quizCards, quizFeedback } from "./quiz";

interface RoleQuizProps {
  question: string;
  roles: readonly RoleInfo[];
  /** Jawaban kelas (quizAnswer F-02); null sebelum dijawab. */
  answer: RoleId | null;
  /** Jawaban naskah (roleQuiz.answer). */
  correctId: RoleId;
  scale: number;
  /** Benar sesudah masa tunggu; hanya mengatur aria-disabled dan tampilan tombol Lanjut. */
  ready: boolean;
  onAnswer(id: RoleId): void;
  /** Dipanggil setiap kali Lanjut diaktifkan sesudah dijawab; PlayScreen memeriksa masa tunggu dengan waktu sebenarnya. */
  onNext(): void;
}

export function RoleQuiz({ question, roles, answer, correctId, scale, ready, onAnswer, onNext }: RoleQuizProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const answered = answer !== null;
  const correct = answer === correctId;
  const cards = quizCards(roles, answer, correctId);
  const chosenLabel = roles.find((role) => role.id === answer)?.label;

  // Saat kuis tampil, fokus pindah ke judulnya, sehingga Spasi tidak menekan kartu tanpa sengaja.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Sesudah jawaban pertama tampil, fokus pindah ke Lanjut (sekali; tidak saat digambar ulang karena ukuran jendela).
  useEffect(() => {
    if (answered) nextRef.current?.focus();
  }, [answered]);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    // Tombol yang ditahan: browser mengubah setiap pengulangan Enter pada tombol berfokus menjadi klik, sehingga
    // pengulangan sesudah jawaban akan menekan Lanjut dan melewati umpan balik. Pengulangan dibatalkan.
    if (event.repeat && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      return;
    }
    if (event.key !== "Tab") return;
    // Fokus terkunci di dalam dialog: kartu yang belum terkunci, lalu Lanjut, lalu kembali ke awal.
    const items = [...(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [])];
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const current = items.find((item) => item === document.activeElement);
    if (!current) {
      // Dari judul atau dialog sendiri: Tab ke elemen pertama, Shift+Tab ke elemen terakhir.
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    }
  };

  return (
    <section
      ref={dialogRef}
      className="ss-quiz"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ss-quiz-title"
      // Bisa difokus lewat kode: klik di ruang kosong dialog membuat fokus tetap di dalam dialog.
      tabIndex={-1}
      data-hasil={answered ? (correct ? "tepat" : "belum") : undefined}
      // Tepi kiri sama dengan tepi kiri bingkai panggung (lebar layar ÷ 2 − 160k), seperti kartu dampak.
      style={{ left: `calc(50% - ${160 * scale}px)` }}
      onKeyDown={onKeyDown}
    >
      <div className="ss-quiz-head">
        <h2 id="ss-quiz-title" ref={titleRef} tabIndex={-1} className="ss-quiz-title">
          {copy.quiz.title}
        </h2>
        {chosenLabel && <p className="ss-quiz-answer">{copy.quiz.answer(chosenLabel)}</p>}
      </div>
      <div className="ss-quiz-body">
        <p className="ss-quiz-question">{question}</p>
        <div className="ss-quiz-cards" role="group" aria-label={copy.quiz.group}>
          {cards.map((card) => (
            <button
              key={card.role.id}
              type="button"
              className="ss-quiz-card"
              data-peran={card.role.id}
              data-terbuka={card.open ? "" : undefined}
              data-tepat={card.correct ? "" : undefined}
              data-pilihan={card.chosen ? "" : undefined}
              disabled={answered}
              aria-label={quizCardName(card)}
              onClick={() => onAnswer(card.role.id)}
            >
              <span className="ss-quiz-card-top" aria-hidden="true">
                <span className="ss-choice-key">{card.number}</span>
                <span className="ss-quiz-icon" style={{ backgroundImage: `url(${roleIcons[card.role.id]})` }} />
              </span>
              <span className="ss-quiz-role">{card.role.label}</span>
              <span className="ss-quiz-duty">{card.open ? card.role.tugas : <span aria-hidden="true">{copy.quiz.closed}</span>}</span>
              <span className="ss-quiz-mark">{card.mark ? copy.quiz.mark[card.mark] : ""}</span>
            </button>
          ))}
        </div>
        {answered && (
          <div className="ss-quiz-feedback">
            <span
              className="ss-quiz-feedback-icon"
              aria-hidden="true"
              style={{ backgroundImage: `url(${emoteIcons[correct ? "hati" : "tanya"]})` }}
            />
            <div>
              {quizFeedback(correct).map((text) => (
                <p key={text} className="ss-quiz-feedback-text">
                  {text}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="ss-quiz-foot">
        <button
          ref={nextRef}
          type="button"
          className="ss-next"
          // Nonaktif sebelum dijawab (data-nonaktif), lalu tertahan selama masa tunggu; keduanya ber-aria-disabled.
          aria-disabled={answered && ready ? undefined : true}
          data-nonaktif={answered ? undefined : ""}
          onClick={() => {
            if (answered) onNext();
          }}
        >
          {copy.play.next}
        </button>
      </div>
    </section>
  );
}
