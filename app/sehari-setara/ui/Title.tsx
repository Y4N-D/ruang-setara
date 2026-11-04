// Layar judul dan dialog "Cara bermain" Sehari Setara (spesifikasi F-10). Masa tunggu, bunyi, dan aksi diatur
// PlayScreen; layar ini menampilkan latar, judul, dan tombol, dan dialog mengunci fokus di dalamnya.
import { Fragment, useEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";
import { copy } from "../content/copy";
import type { Scene } from "../engine/types";
import { TITLE_BAND, TITLE_ZONE } from "./layout";
import { Stage } from "./Stage";

// Relatif terhadap /ruang-setara/sehari-setara/ (Architecture bagian 11).
const GALLERY_HREF = "../";

const howTo = copy.howTo;

/** Tombol yang berfokus saat layar judul tampil; key naik setiap kali fokus perlu dipindah lagi. */
export interface TitleFocus {
  readonly key: number;
  readonly target: "mulai" | "cara";
}

interface TitleScreenProps {
  /** Adegan semu berlatar bg_title dengan Nara berjalan. */
  scene: Scene;
  /** kj = tinggi layar ÷ 180. */
  scale: number;
  animate: boolean;
  /** Benar sesudah masa tunggu; sebelum itu tombol dan tautan ber-aria-disabled. */
  ready: boolean;
  focus: TitleFocus;
  howTo: boolean;
  onStart(): void;
  onHowTo(): void;
  /** Klik "Kembali ke galeri"; PlayScreen membatalkannya selama masa tunggu. */
  onGallery(event: MouseEvent<HTMLAnchorElement>): void;
  onCloseHowTo(): void;
}

export function TitleScreen({ scene, scale, animate, ready, focus, howTo: showHowTo, onStart, onHowTo, onGallery, onCloseHowTo }: TitleScreenProps) {
  const startRef = useRef<HTMLButtonElement>(null);
  const howToRef = useRef<HTMLButtonElement>(null);
  const waiting = ready ? undefined : true;

  useEffect(() => {
    (focus.target === "cara" ? howToRef : startRef).current?.focus();
  }, [focus.key, focus.target]);

  const zone = {
    left: TITLE_ZONE.x0 * scale,
    top: TITLE_ZONE.y0 * scale,
    width: (TITLE_ZONE.x1 - TITLE_ZONE.x0) * scale,
    height: (TITLE_ZONE.y1 - TITLE_ZONE.y0) * scale,
  };
  const band = { top: TITLE_BAND.top * scale, height: (TITLE_BAND.bottom - TITLE_BAND.top) * scale };

  return (
    <div className="ss-title">
      {/* Latar dan Nara adalah hiasan: judul dan kalimat pengantar sudah menjelaskan layar (DRAF J-8). */}
      <div className="ss-title-backdrop" aria-hidden="true">
        <Stage scene={scene} cast={scene.cast} scale={scale} animate={animate} label={scene.altText} />
      </div>
      <div className="ss-title-zone" style={zone}>
        <h1 id="ss-play-title" className="ss-title-name">
          {copy.gameName}
        </h1>
        <p className="ss-title-lead">{copy.title.lead}</p>
      </div>
      <div className="ss-title-actions" style={band}>
        <button ref={startRef} type="button" className="ss-button" aria-disabled={waiting} onClick={onStart}>
          {copy.title.start}
        </button>
        <button ref={howToRef} type="button" className="ss-button" aria-disabled={waiting} onClick={onHowTo}>
          {copy.title.howTo}
        </button>
        <a className="ss-button" href={GALLERY_HREF} aria-disabled={waiting} onClick={onGallery}>
          {copy.backToGallery}
        </a>
      </div>
      {showHowTo && <HowToDialog onClose={onCloseHowTo} />}
    </div>
  );
}

/** Dialog "Cara bermain" (usulan 2): enam langkah dan tombol keyboard untuk guru; Esc dan "Tutup" menutupnya. */
export function HowToDialog({ onClose }: { onClose(): void }) {
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

  return (
    <section className="ss-howto" role="dialog" aria-modal="true" aria-labelledby="ss-howto-title" tabIndex={-1} onKeyDown={onKeyDown}>
      <header className="ss-howto-head">
        <h2 id="ss-howto-title" ref={titleRef} tabIndex={-1} className="ss-howto-title">
          {howTo.title}
        </h2>
      </header>
      <div className="ss-howto-body">
        <section className="ss-howto-col" aria-labelledby="ss-howto-langkah">
          <h3 id="ss-howto-langkah" className="ss-howto-label">
            {howTo.stepsLabel}
          </h3>
          <ol className="ss-howto-steps" role="list">
            {howTo.steps.map((step, i) => (
              <li key={step} className="ss-howto-step">
                <span className="ss-choice-key" aria-hidden="true">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="ss-howto-col" aria-labelledby="ss-howto-tombol">
          <h3 id="ss-howto-tombol" className="ss-howto-label">
            {howTo.keysLabel}
          </h3>
          <dl className="ss-howto-keys">
            {howTo.keys.map((row) => (
              <Fragment key={row.keys}>
                <dt>
                  <kbd className="ss-key" aria-hidden="true">
                    {row.keys}
                  </kbd>
                  <span className="ss-sr">{row.spoken}</span>
                </dt>
                <dd>{row.text}</dd>
              </Fragment>
            ))}
          </dl>
        </section>
      </div>
      <div className="ss-howto-foot">
        <button ref={closeRef} type="button" className="ss-button" onClick={onClose}>
          {howTo.close}
        </button>
      </div>
    </section>
  );
}
