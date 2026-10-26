// Pertanyaan dan tiga tombol pilihan A/B/C (Design System bagian 7; spesifikasi F-05).
// Sesudah memilih, baris pertanyaan menjadi status. Tombol "Lanjut" jembatan sementara hanya tersisa sebagai pengaman
// fase quiz sampai F-08 (spesifikasi F-07). Tombol pilihan terkunci sejak pilihan diambil.
import { useEffect, useRef } from "react";
import { copy } from "../content/copy";
import { choiceText } from "../engine/rules";
import type { ChoiceId, Flag, Scene } from "../engine/types";

interface ChoicePanelProps {
  question: string;
  choices: Scene["choices"];
  flags: readonly Flag[];
  chosen: ChoiceId | null;
  bridgeReady: boolean;
  onChoose(id: ChoiceId): void;
  onBridge(): void;
  /** Salah di fase bintang (F-07): fokus tetap pada ajakan bintang di panel kanan. */
  takeFocus?: boolean;
}

export function ChoicePanel({ question, choices, flags, chosen, bridgeReady, onChoose, onBridge, takeFocus = true }: ChoicePanelProps) {
  const questionRef = useRef<HTMLParagraphElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const bridgeRef = useRef<HTMLButtonElement>(null);

  // Fokus: pertanyaan (agar Spasi tidak memilih tanpa sengaja), lalu baris status, lalu tombol jembatan.
  useEffect(() => {
    if (!takeFocus) return;
    if (chosen === null) questionRef.current?.focus();
    else if (bridgeReady) bridgeRef.current?.focus();
    else statusRef.current?.focus();
  }, [chosen, bridgeReady, takeFocus]);

  return (
    <>
      <div className="ss-question-row">
        {chosen === null ? (
          <p ref={questionRef} className="ss-question" tabIndex={-1}>
            {question}
          </p>
        ) : (
          <>
            <p ref={statusRef} className="ss-status" tabIndex={-1}>
              {copy.play.chosen(chosen)}
            </p>
            {bridgeReady && (
              <button ref={bridgeRef} type="button" className="ss-next" onClick={onBridge}>
                {copy.play.bridgeNext}
              </button>
            )}
          </>
        )}
      </div>
      <div className="ss-choices" role="group" aria-label={question}>
        {choices.map((choice) => {
          const state = chosen === null ? undefined : choice.id === chosen ? "dipilih" : "nonaktif";
          return (
            <button
              key={choice.id}
              type="button"
              className="ss-choice"
              data-choice={choice.id}
              data-state={state}
              disabled={chosen !== null}
              onClick={() => onChoose(choice.id)}
            >
              <span className="ss-choice-key" aria-hidden="true">
                {choice.id}
              </span>
              <span className="ss-choice-text">
                <span className="ss-sr">{copy.play.choicePrefix(choice.id)}</span>
                {choiceText(choice, flags)}
                {state === "dipilih" && <span className="ss-sr">{copy.play.chosenMark}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
