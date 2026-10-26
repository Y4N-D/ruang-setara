// Papan tim di panel kanan (Design System bagian 7; spesifikasi F-07, bagian Papan tim dan Pop bintang).
// Satu baris per tim: bentuk, nama, dan jumlah bintang. Tim aktif ditandai ▶, bingkai, dan tulisan "Giliran".
import { iconStrips, teamIcons } from "../assets/manifest";
import { copy } from "../content/copy";
import type { Team } from "../engine/types";
import { teamSentence } from "./turn";

/** Ikon bintang yang sedang pop: tim penerima dan kunci adegan, agar animasi diputar ulang di adegan berikutnya. */
export interface StarPop {
  readonly key: string;
  readonly teamId: string;
}

interface TeamsProps {
  teams: readonly Team[];
  activeIndex: number;
  /** null bila tidak ada pop, termasuk saat kurangi gerak aktif. */
  pop: StarPop | null;
}

export function Teams({ teams, activeIndex, pop }: TeamsProps) {
  return (
    <ol className="ss-teams" aria-label={copy.teams.board}>
      {teams.map((team, index) => {
        const active = index === activeIndex;
        const popping = pop !== null && pop.teamId === team.id;
        return (
          <li key={team.id} className="ss-team" data-team={team.id} data-giliran={active ? "" : undefined}>
            <span className="ss-sr">{teamSentence(team.name, active, team.stars)}</span>
            <span
              className="ss-team-icon"
              aria-hidden="true"
              style={{ backgroundImage: `url(${teamIcons[team.shape]})` }}
            />
            <span className="ss-team-name" aria-hidden="true">
              {team.name}
              {active && <span className="ss-team-turn">{copy.teams.turn}</span>}
            </span>
            <span className="ss-team-stars" aria-hidden="true">
              <span
                key={popping ? pop.key : "diam"}
                className="ss-team-star"
                data-pop={popping ? "" : undefined}
                style={{ backgroundImage: `url(${iconStrips.star.src})` }}
              />
              <span className="ss-team-count">{team.stars}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
