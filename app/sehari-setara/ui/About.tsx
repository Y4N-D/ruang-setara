// Dialog "Tentang" Sehari Setara (spesifikasi F-11 bagian B) dan penanganan tombol yang dipakai bersama dengan dialog
// "Cara bermain" (F-10): fokus di judul saat dibuka, Tab hanya beredar antara judul dan "Tutup", dan Esc menutup.
// Bunyi, fokus sesudah ditutup, dan masa tunggu layar judul diatur PlayScreen.
import { useEffect, useRef, type KeyboardEvent } from "react";
import { copy } from "../content/copy";

const about = copy.about;

/** Fokus dan tombol dialog layar judul; dipakai dialog "Cara bermain" dan "Tentang". */
export function useTitleDialog(onClose: () => void) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (!event.repeat && !event.ctrlKey && !event.altKey && !event.metaKey) onClose();
      return;
    }
    if (event.repeat && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      return;
    }
    if (event.key !== "Tab") return;
    // Fokus hanya beredar antara judul dan "Tutup".
    event.preventDefault();
    if (document.activeElement === closeRef.current) titleRef.current?.focus();
    else closeRef.current?.focus();
  };

  return { titleRef, closeRef, onKeyDown };
}

/** Dialog "Tentang": tentang permainan dan kredit, dengan bingkai dialog "Cara bermain"; Esc dan "Tutup" menutupnya. */
export function AboutDialog({ onClose }: { onClose(): void }) {
  const { titleRef, closeRef, onKeyDown } = useTitleDialog(onClose);

  return (
    <section className="ss-howto ss-about" role="dialog" aria-modal="true" aria-labelledby="ss-about-title" tabIndex={-1} onKeyDown={onKeyDown}>
      <header className="ss-howto-head">
        <h2 id="ss-about-title" ref={titleRef} tabIndex={-1} className="ss-howto-title">
          {about.title}
        </h2>
      </header>
      <div className="ss-howto-body">
        <section className="ss-howto-col" aria-labelledby="ss-about-permainan">
          <h3 id="ss-about-permainan" className="ss-howto-label">
            {about.aboutLabel}
          </h3>
          {about.aboutLines.map((line) => (
            <p key={line} className="ss-about-text">
              {line}
            </p>
          ))}
        </section>
        <section className="ss-howto-col" aria-labelledby="ss-about-kredit">
          <h3 id="ss-about-kredit" className="ss-howto-label">
            {about.creditsLabel}
          </h3>
          {about.credits.map((credit) => (
            <div key={credit.label}>
              <h4 className="ss-howto-label ss-about-label">{credit.label}</h4>
              <p className="ss-about-text">{credit.text}</p>
              {credit.notes.map((note) => (
                <p key={note} className="ss-about-note">
                  {note}
                </p>
              ))}
            </div>
          ))}
        </section>
      </div>
      <div className="ss-howto-foot">
        <button ref={closeRef} type="button" className="ss-button" onClick={onClose}>
          {about.close}
        </button>
      </div>
    </section>
  );
}
