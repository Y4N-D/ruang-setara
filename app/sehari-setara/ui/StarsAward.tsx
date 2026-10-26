// Bintang alasan di panel kanan (Design System bagian 7; spesifikasi F-07, bagian Bintang alasan dan Fokus).
// Tampil hanya di fase stars. PlayScreen menjaga agar bintang hanya bisa diberikan sekali per adegan.
import { useEffect, useRef } from "react";
import { copy } from "../content/copy";
import type { Stars } from "../engine/types";

const STAR_OPTIONS: readonly Stars[] = [0, 1, 2];

interface StarsAwardProps {
  teamName: string;
  onGive(stars: Stars): void;
}

export function StarsAward({ teamName, onGive }: StarsAwardProps) {
  const promptRef = useRef<HTMLParagraphElement>(null);

  // Saat fase bintang dimulai, fokus pindah ke ajakan (bukan tombol), sehingga Spasi dan Enter tidak memberi bintang.
  useEffect(() => {
    promptRef.current?.focus();
  }, []);

  return (
    <div className="ss-award" role="group" aria-labelledby="ss-award-prompt">
      <p id="ss-award-prompt" ref={promptRef} tabIndex={-1} className="ss-award-prompt">
        {copy.stars.prompt(teamName)}
      </p>
      <div className="ss-award-buttons">
        {STAR_OPTIONS.map((stars) => (
          <button
            key={stars}
            type="button"
            className="ss-award-button"
            data-stars={stars}
            aria-label={copy.stars.buttonName(stars)}
            onClick={() => onGive(stars)}
          >
            {stars}
          </button>
        ))}
      </div>
    </div>
  );
}
