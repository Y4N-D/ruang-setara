// Rekap pilihan kelas (Design System bagian 7, "Rekap"; spesifikasi F-09): empat halaman menurut waktu adegan, satu kotak
// berbingkai piksel per adegan. RecapItem juga dipakai lembar unduhan (RecapSheet.tsx). Nomor halaman, masa tunggu, dan
// kelanjutan diatur PlayScreen.
import { useEffect, useRef, type MouseEvent } from "react";
import { emoteIcons, teamIcons } from "../assets/manifest";
import { copy } from "../content/copy";
import { ROLES } from "../content/roles";
import { quizLine, type RecapRow } from "./closing";
import { TIER_ICON } from "./impact";

const text = copy.closing.recap;

/** Judul ketiga kolom kotak adegan, sekali per halaman. */
export function RecapColumns() {
  return (
    <div className="ss-recap-cols">
      <p className="ss-recap-label">{text.columns.choice}</p>
      <p className="ss-recap-label">{text.columns.best}</p>
      <p className="ss-recap-label">{text.columns.refs}</p>
    </div>
  );
}

/** Satu kotak adegan: kepala (nomor, judul, jam, tim dan bintang), pilihan kelas, pilihan terbaik, dan rujukan. */
export function RecapItem({ row }: { row: RecapRow }) {
  const tierIcon = emoteIcons[TIER_ICON[row.choice.tier]];
  const quiz = row.quiz && row.scene.roleQuiz ? quizLine(row.quiz, ROLES, row.scene.roleQuiz.answer) : null;
  return (
    <li className="ss-recap-row" data-adegan={row.number}>
      <div className="ss-recap-row-head">
        <span className="ss-choice-key" aria-hidden="true">
          {row.number}
        </span>
        <p className="ss-recap-scene">
          <span className="ss-sr">{text.prefix.scene(row.number)}</span>
          {row.scene.title}
        </p>
        <p className="ss-recap-clock">{text.clock(row.scene.clock)}</p>
        {row.team && (
          <p className="ss-recap-team">
            <span
              className="ss-recap-icon"
              aria-hidden="true"
              style={{ backgroundImage: `url(${teamIcons[row.team.shape]})` }}
            />
            {text.team(row.team.name, row.stars)}
          </p>
        )}
      </div>
      <div className="ss-recap-grid">
        <div className="ss-recap-cell">
          <p className="ss-recap-choice">
            <span className="ss-recap-key" aria-hidden="true">
              {row.choice.id}
            </span>
            <span>
              <span className="ss-sr">{text.prefix.choice(row.choice.id)}</span>
              {row.choiceText}
            </span>
          </p>
          <p className="ss-recap-tier" data-tier={row.choice.tier}>
            <span className="ss-recap-icon" aria-hidden="true" style={{ backgroundImage: `url(${tierIcon})` }} />
            {copy.impact.tier[row.choice.tier]}
          </p>
          {quiz && <p className="ss-recap-quiz">{quiz}</p>}
        </div>
        <div className="ss-recap-cell">
          {row.same ? (
            <p className="ss-recap-same">
              <span className="ss-recap-icon" aria-hidden="true" style={{ backgroundImage: `url(${emoteIcons.hati})` }} />
              <span>
                <span className="ss-sr">{text.prefix.bestSame}</span>
                {text.same}
              </span>
            </p>
          ) : (
            <p className="ss-recap-choice">
              <span className="ss-recap-key" aria-hidden="true">
                {row.best.id}
              </span>
              <span>
                <span className="ss-sr">{text.prefix.best(row.best.id)}</span>
                {row.bestText}
              </span>
            </p>
          )}
        </div>
        <div className="ss-recap-cell">
          <span className="ss-sr">{text.prefix.refs}</span>
          {/* role="list": tanpa itu, Safari membacakan daftar tanpa penanda butir sebagai kelompok biasa. */}
          <ul className="ss-recap-refs" role="list">
            {row.references.map((reference) => (
              <li key={reference.id}>{reference.text}</li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

interface RecapProps {
  rows: readonly RecapRow[];
  pages: readonly (readonly number[])[];
  /** Nomor halaman, mulai dari 1. */
  page: number;
  /** Benar sesudah masa tunggu halaman ini; sebelum itu tombol maju ber-aria-disabled. */
  ready: boolean;
  onPrev(event: MouseEvent<HTMLButtonElement>): void;
  onNext(): void;
}

/** Satu halaman rekap; judulnya berfokus setiap kali halaman berganti. */
export function Recap({ rows, pages, page, ready, onPrev, onNext }: RecapProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const indexes = pages[page - 1] ?? [];
  const pageRows = rows.filter((row) => indexes.includes(row.number - 1));
  const time = pageRows[0]?.scene.timeOfDay ?? "pagi";
  const last = page >= pages.length;

  useEffect(() => {
    titleRef.current?.focus();
  }, [page]);

  return (
    <div className="ss-recap" data-halaman={page}>
      <header className="ss-recap-head" data-time={time}>
        <h2 ref={titleRef} tabIndex={-1} className="ss-recap-title">
          {text.title}
        </h2>
        <p className="ss-recap-page">{text.page(text.time[time], page, pages.length)}</p>
      </header>
      <div className="ss-recap-body">
        <RecapColumns />
        {/* role="list": tanpa itu, Safari membacakan daftar tanpa penanda butir sebagai kelompok biasa. */}
        <ol className="ss-recap-list" role="list" aria-label={text.list}>
          {pageRows.map((row) => (
            <RecapItem key={row.scene.id} row={row} />
          ))}
        </ol>
      </div>
      <div className="ss-recap-foot">
        {page > 1 && (
          <button type="button" className="ss-next" onClick={onPrev}>
            {text.prev}
          </button>
        )}
        <button type="button" className="ss-next" aria-disabled={ready ? undefined : true} onClick={onNext}>
          {last ? text.toReflection : text.next}
        </button>
      </div>
    </div>
  );
}
