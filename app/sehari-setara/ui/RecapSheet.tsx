// Lembar unduhan rekap (spesifikasi F-09, bagian "Lembar unduhan"; DRAF A-3): satu lembar A4 pada 150 dpi (1.240 px,
// paling rendah 1.754 px) berisi akhir hari, papan tim, keenam kotak adegan, dan kalimat pemantik. Dipasang lewat portal
// ke document.body di luar layar hanya selama penyiapan, tersembunyi dari pembaca layar dan tidak bisa difokus.
import type { Ref } from "react";
import { createPortal } from "react-dom";
import { iconStrips, teamIcons } from "../assets/manifest";
import { copy } from "../content/copy";
import { ENDINGS } from "../content/endings";
import type { EndingId, Team } from "../engine/types";
import type { RecapRow } from "./closing";
import { sheetDate } from "./download";
import { segmentFills, type MeterValues } from "./impact";
import { RecapColumns, RecapItem } from "./Recap";

const METERS = [
  { key: "hak", label: copy.meters.hak },
  { key: "kewajiban", label: copy.meters.kewajiban },
] as const;

interface RecapSheetProps {
  id: EndingId;
  meters: MeterValues;
  teams: readonly Team[];
  topIds: readonly string[];
  rows: readonly RecapRow[];
  date: Date;
  ref?: Ref<HTMLElement>;
}

export function RecapSheet({ id, meters, teams, topIds, rows, date, ref }: RecapSheetProps) {
  const { sheet, reflection } = copy.closing;
  return createPortal(
    <article ref={ref} className="ss-sheet" aria-hidden="true" inert>
      <header className="ss-sheet-head">
        <h1 className="ss-sheet-title">{sheet.title}</h1>
        <p className="ss-sheet-date">{sheetDate(date)}</p>
      </header>
      <section className="ss-sheet-summary">
        <div>
          <h2 className="ss-sheet-ending">{sheet.ending(ENDINGS[id].title)}</h2>
          {METERS.map(({ key, label }) => (
            <p key={key} className="ss-sheet-meter" data-meter={key}>
              <span className="ss-sheet-meter-name">{label}</span>
              <span className="ss-meter-bar">
                {segmentFills(meters[key]).map((fill, index) => (
                  <span key={index} className="ss-meter-seg" data-isi={fill} />
                ))}
              </span>
              <span>{meters[key]}</span>
            </p>
          ))}
        </div>
        <ul className="ss-sheet-teams">
          {teams.map((team) => (
            <li key={team.id} className="ss-sheet-team">
              <span className="ss-recap-icon" style={{ backgroundImage: `url(${teamIcons[team.shape]})` }} />
              {team.name}
              <span className="ss-team-star" style={{ backgroundImage: `url(${iconStrips.star.src})` }} />
              {team.stars}
              {topIds.includes(team.id) && <span className="ss-sheet-top">{copy.teams.top}</span>}
            </li>
          ))}
        </ul>
      </section>
      <RecapColumns />
      <ol className="ss-recap-list">
        {rows.map((row) => (
          <RecapItem key={row.scene.id} row={row} />
        ))}
      </ol>
      <section className="ss-sheet-reflection">
        <div>
          <h2>{reflection.title}</h2>
          <p>{reflection.lead}</p>
        </div>
        <ol>
          {reflection.prompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ol>
      </section>
      <p className="ss-sheet-foot">{sheet.foot}</p>
    </article>,
    document.body,
  );
}
