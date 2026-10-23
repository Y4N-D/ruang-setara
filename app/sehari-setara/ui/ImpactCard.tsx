// Kartu dampak (Design System bagian 7; spesifikasi F-06): dialog yang muncul sesudah reaksi tokoh.
// Masa tunggu 600 ms dan kelanjutan permainan diatur PlayScreen; kartu hanya menampilkan isi naskah.
import { useEffect, useRef, type KeyboardEvent } from "react";
import { emoteIcons } from "../assets/manifest";
import { copy } from "../content/copy";
import type { Choice } from "../engine/types";
import { TIER_ICON } from "./impact";

interface ImpactCardProps {
  choice: Choice;
  scale: number;
  /** Benar sesudah masa tunggu; sebelum itu tombol Lanjut ber-aria-disabled. */
  ready: boolean;
  onNext(): void;
}

export function ImpactCard({ choice, scale, ready, onNext }: ImpactCardProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { impact } = choice;

  // Saat kartu tampil, fokus pindah ke judulnya, sehingga Spasi tidak menekan tombol tanpa sengaja.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Tab dan Shift+Tab selalu kembali ke tombol Lanjut, sehingga fokus tidak keluar dari kartu.
  const keepFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    buttonRef.current?.focus();
  };

  return (
    <section
      className="ss-impact"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ss-impact-title"
      data-tier={choice.tier}
      // Tepi kiri sama dengan tepi kiri bingkai panggung (lebar layar ÷ 2 − 160k).
      style={{ left: `calc(50% - ${160 * scale}px)` }}
      onKeyDown={keepFocus}
    >
      <div className="ss-impact-head">
        <span
          className="ss-impact-icon"
          aria-hidden="true"
          style={{ backgroundImage: `url(${emoteIcons[TIER_ICON[choice.tier]]})` }}
        />
        <h2 id="ss-impact-title" ref={titleRef} tabIndex={-1} className="ss-impact-title">
          <span className="ss-sr">{copy.impact.titlePrefix}</span>
          {copy.impact.tier[choice.tier]}
        </h2>
        <p className="ss-impact-choice">{copy.play.chosen(choice.id)}</p>
      </div>
      <div className="ss-impact-body">
        <div className="ss-impact-col">
          <section className="ss-impact-part">
            <h3 className="ss-impact-label">{copy.impact.terjadi}</h3>
            <p className="ss-impact-terjadi">{impact.terjadi}</p>
          </section>
          <section className="ss-impact-part">
            <h3 className="ss-impact-label">{copy.impact.hak}</h3>
            <p className="ss-impact-text">{impact.hak}</p>
          </section>
          <section className="ss-impact-part">
            <h3 className="ss-impact-label">{copy.impact.kewajiban}</h3>
            <p className="ss-impact-text">{impact.kewajiban}</p>
          </section>
        </div>
        <div className="ss-impact-col">
          <section className="ss-impact-part">
            <h3 className="ss-impact-label">{copy.impact.rujukan}</h3>
            <ul className="ss-impact-refs">
              {impact.rujukan.map((reference) => (
                <li key={reference.id}>{reference.text}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <div className="ss-impact-foot">
        <button
          ref={buttonRef}
          type="button"
          className="ss-next"
          aria-disabled={ready ? undefined : true}
          onClick={() => {
            if (ready) onNext();
          }}
        >
          {copy.play.next}
        </button>
      </div>
    </section>
  );
}
