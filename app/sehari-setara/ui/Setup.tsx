// Pengaturan kelas Sehari Setara (spesifikasi F-10): jumlah tim dengan jadwal giliran, durasi diskusi, dan suara.
// Pilihan sementara, masa tunggu, bunyi, dan aksi diatur PlayScreen; layar ini hanya menampilkan.
import { useEffect, useRef } from "react";
import { teamIcons } from "../assets/manifest";
import { copy } from "../content/copy";
import type { Settings, TeamSetup } from "../engine/types";
import { DISCUSS_CHOICES, TEAM_COUNTS, teamTurnSentence, turnScenes, turnText, type SetupDraft, type TeamCount } from "./opening";
import { Option } from "./Settings";

const text = copy.setup;

interface SetupScreenProps {
  draft: SetupDraft;
  /** Tim sebanyak draft.count, berurutan dari daftar bawaan. */
  teams: readonly TeamSetup[];
  sceneCount: number;
  sound: boolean;
  /** Benar sesudah masa tunggu; sebelum itu tombol ber-aria-disabled dengan tampilan biasa. */
  ready: boolean;
  onCount(count: TeamCount): void;
  onSeconds(seconds: Settings["discussSeconds"]): void;
  onSound(on: boolean): void;
  onBack(): void;
  onStart(): void;
}

export function SetupScreen({ draft, teams, sceneCount, sound, ready, onCount, onSeconds, onSound, onBack, onStart }: SetupScreenProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const waiting = !ready;

  // Saat layar tampil, fokus pindah ke judulnya, sehingga Spasi tidak menekan pilihan tanpa sengaja.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <div className="ss-setup">
      <header className="ss-setup-head">
        <h2 ref={titleRef} tabIndex={-1} className="ss-setup-title">
          {text.title}
        </h2>
      </header>
      <div className="ss-setup-body">
        <div className="ss-setup-row">
          <p id="ss-setup-count" className="ss-setup-label">
            {text.count}
          </p>
          <div>
            <div className="ss-options" role="group" aria-labelledby="ss-setup-count">
              {TEAM_COUNTS.map((count) => (
                <Option key={count} label={text.countOption(count)} pressed={draft.count === count} waiting={waiting} onPress={() => onCount(count)} />
              ))}
            </div>
            {/* role="list": tanpa itu, Safari membacakan daftar tanpa penanda butir sebagai kelompok biasa (F-09). */}
            <ul className="ss-setup-teams" role="list" aria-label={text.teamList}>
              {teams.map((team, index) => {
                const scenes = turnScenes(index, teams.length, sceneCount);
                return (
                  <li key={team.id} className="ss-setup-team" data-team={team.id}>
                    <span className="ss-sr">{teamTurnSentence(team.name, scenes)}</span>
                    <span className="ss-setup-team-icon" aria-hidden="true" style={{ backgroundImage: `url(${teamIcons[team.shape]})` }} />
                    <span className="ss-setup-team-name" aria-hidden="true">
                      {team.name}
                    </span>
                    <span className="ss-setup-turns" aria-hidden="true">
                      {turnText(scenes)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="ss-setup-row">
          <p id="ss-setup-seconds" className="ss-setup-label">
            {text.seconds}
          </p>
          <div className="ss-options" role="group" aria-labelledby="ss-setup-seconds">
            {DISCUSS_CHOICES.map((seconds) => (
              <Option key={seconds} label={copy.options.seconds(seconds)} pressed={draft.seconds === seconds} waiting={waiting} onPress={() => onSeconds(seconds)} />
            ))}
          </div>
        </div>
        <div className="ss-setup-row">
          <p id="ss-setup-sound" className="ss-setup-label">
            {text.sound}
          </p>
          <div>
            <div className="ss-options" role="group" aria-labelledby="ss-setup-sound" aria-describedby="ss-setup-sound-note">
              <Option label={copy.options.on} pressed={sound} waiting={waiting} onPress={() => onSound(true)} />
              <Option label={copy.options.off} pressed={!sound} waiting={waiting} onPress={() => onSound(false)} />
            </div>
            <p id="ss-setup-sound-note" className="ss-setup-note">
              {text.soundNote}
            </p>
          </div>
        </div>
      </div>
      <div className="ss-setup-foot">
        <button type="button" className="ss-button" aria-disabled={waiting ? true : undefined} onClick={onBack}>
          {text.back}
        </button>
        <button type="button" className="ss-button" aria-disabled={waiting ? true : undefined} onClick={onStart}>
          {text.start}
        </button>
      </div>
    </div>
  );
}
