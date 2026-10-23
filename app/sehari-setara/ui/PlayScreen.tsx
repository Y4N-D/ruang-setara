// Layar permainan Sehari Setara (spesifikasi F-05 dan F-06), dibuka lewat #main sampai layar judul dibuat di F-10.
// Menjalankan mesin F-02 dengan naskah F-03: narasi, pertanyaan, pilihan, reaksi, indikator, kartu dampak,
// jembatan sementara, pergantian adegan, dan layar akhir sementara. Logika permainan tetap di engine/;
// layar ini hanya mengirim aksi.
import { useEffect, useEffectEvent, useReducer, useRef, useState, type ReactNode } from "react";
import { copy } from "../content/copy";
import { SCENES } from "../content/scenes";
import { PLAY_TEAMS } from "../content/teams";
import { createInitialState, createReducer } from "../engine/reducer";
import { narrationFor } from "../engine/rules";
import type { ChoiceId, GameAction, GameState, Phase, TimeOfDay } from "../engine/types";
import { ChoicePanel } from "./ChoicePanel";
import {
  bridgeActions,
  FADE_MS,
  keyCommand,
  REACTION_MS,
  restartActions,
  runActions,
  shouldHandleKey,
  startActions,
  WIPE_COVER_MS,
  WIPE_MS,
  type KeyContext,
} from "./controls";
import { DayArc } from "./DayArc";
import { usePrefersReducedMotion } from "./hooks";
import { ImpactCard } from "./ImpactCard";
import { IMPACT_GUARD_MS, impactAnnouncement, METER_STEP_MS, meterValueAt, metersBefore } from "./impact";
import { STAGE } from "./layout";
import { NarrationBox, type NarrationHandle } from "./NarrationBox";
import { Meters } from "./Meters";
import { preloadScene } from "./preload";
import { SceneWipe } from "./SceneWipe";
import { Stage } from "./Stage";

// Relatif terhadap /ruang-setara/sehari-setara/ (Architecture bagian 11).
const GALLERY_HREF = "../";

const reducer = createReducer(SCENES);

/** Fase yang menampilkan pertanyaan dan tiga pilihan di panel bawah; di fase impact panel bawah kosong (F-06). */
const CHOICE_PHASES: ReadonlySet<Phase> = new Set<Phase>(["discuss", "reaction", "quiz", "stars"]);
/**
 * Fase milik fitur lain yang dilewati jembatan sementara (keputusan Gerbang 1 F-05 nomor 4). Sejak F-06 keduanya
 * dilewati dalam tekanan Lanjut kartu dampak, jadi tombol jembatan hanya pengaman sampai F-07 dan F-08.
 */
const BRIDGE_PHASES: ReadonlySet<Phase> = new Set<Phase>(["quiz", "stars"]);
/** Fase saat panggung menampilkan reaksi pilihan adegan berjalan. */
const REACTING_PHASES: ReadonlySet<Phase> = new Set<Phase>(["reaction", "impact", "quiz", "stars", "transition"]);
/** Fase yang memakai layar akhir sementara, sampai layar akhir dibuat di F-09. */
const END_PHASES: ReadonlySet<Phase> = new Set<Phase>(["ending", "recap", "reflection"]);

interface SceneChange {
  kind: "sapuan" | "pudar";
  nextTime: TimeOfDay;
}

/** Keadaan awal: judul, pengaturan, dan prolog dilewati dengan dua tim bawaan (F-10 belum ada). */
function initialPlayState(): GameState {
  return runActions(reducer, createInitialState(), startActions(PLAY_TEAMS));
}

/** Jenis elemen yang menerima tekanan tombol, untuk aturan pengabaian pintasan. */
function targetKind(target: EventTarget | null): KeyContext["target"] {
  if (!(target instanceof HTMLElement)) return "lain";
  if (target.isContentEditable || target.closest("input, textarea, select")) return "isian";
  if (target.closest("button, a[href]")) return "tombol";
  return "lain";
}

export function PlayScreen({ scale }: { scale: number }) {
  const prefersReduced = usePrefersReducedMotion();
  const [state, dispatch] = useReducer(reducer, undefined, initialPlayState);
  const [round, setRound] = useState(0);
  const [narration, setNarration] = useState({ round: 0, scene: 0, screen: 0 });
  const [change, setChange] = useState<SceneChange | null>(null);
  const narrationRef = useRef<NarrationHandle>(null);
  const endTitleRef = useRef<HTMLHeadingElement>(null);
  const bridgeUsed = useRef("");
  // Waktu sejak kartu dampak tampil: state untuk tampilan, ref untuk pengaman tekanan ganda (spesifikasi F-06).
  const [impactTime, setImpactTime] = useState({ key: "", ms: 0 });
  const impactStart = useRef({ key: "", at: 0 });

  const reduced = prefersReduced || state.settings.reducedMotion;
  const scene = SCENES[state.sceneIndex];
  const screens = narrationFor(scene, state.flags);
  const screen = narration.round === round && narration.scene === state.sceneIndex ? narration.screen : 0;
  const entry = state.history.find((item) => item.sceneId === scene.id);
  const chosen = entry ? scene.choices.find((choice) => choice.id === entry.choiceId) : undefined;
  const reaction = chosen && REACTING_PHASES.has(state.phase) ? chosen : undefined;
  const ended = END_PHASES.has(state.phase);
  const sceneKey = `${round}-${state.sceneIndex}`;
  const impactElapsed = state.phase === "impact" && impactTime.key === sceneKey ? impactTime.ms : 0;

  const send = (actions: readonly GameAction[]) => {
    for (const action of actions) dispatch(action);
  };

  /** Layar narasi berikutnya, atau pertanyaan sesudah layar terakhir. Tekanan ganda tidak melewati layar. */
  const nextNarration = (from: number) => {
    if (from >= screens.length - 1) {
      dispatch({ type: "NARASI_SELESAI" });
      return;
    }
    setNarration((current) => {
      const at = current.round === round && current.scene === state.sceneIndex ? current.screen : 0;
      return at === from ? { round, scene: state.sceneIndex, screen: from + 1 } : current;
    });
  };

  const choose = (id: ChoiceId) => dispatch({ type: "PILIH", choice: id });

  /** Sekali per adegan: kuis dan bintang dilewati (jembatan sementara), lalu sapuan atau pudar ke adegan berikutnya. */
  const advance = () => {
    if (bridgeUsed.current === sceneKey) return;
    bridgeUsed.current = sceneKey;
    send(bridgeActions(scene));
    const next = SCENES[state.sceneIndex + 1];
    if (next) setChange({ kind: reduced ? "pudar" : "sapuan", nextTime: next.timeOfDay });
    else dispatch({ type: "LANJUT" });
  };

  /** Tombol jembatan F-05, hanya bila fase kuis atau bintang sempat tampil. */
  const bridge = () => {
    if (BRIDGE_PHASES.has(state.phase)) advance();
  };

  /** Masa tunggu 600 ms dihitung dari waktu sebenarnya, sehingga tidak bergantung pada render terakhir. */
  const cardReady = () =>
    state.phase === "impact" &&
    impactStart.current.key === sceneKey &&
    performance.now() - impactStart.current.at >= IMPACT_GUARD_MS;

  /** Tombol Lanjut kartu dampak: bekerja sesudah masa tunggu, sekali per adegan. */
  const continueFromCard = () => {
    if (cardReady()) advance();
  };

  const restart = () => {
    send(restartActions(PLAY_TEAMS));
    setRound((value) => value + 1);
  };

  // Reaksi tokoh tampil 1,2 detik, lalu REAKSI_SELESAI.
  useEffect(() => {
    if (state.phase !== "reaction") return;
    const timer = setTimeout(() => dispatch({ type: "REAKSI_SELESAI" }), REACTION_MS);
    return () => clearTimeout(timer);
  }, [state.phase, sceneKey]);

  // Kartu dampak: waktu berlalu dihitung dari saat kartu tampil, untuk gerak indikator (paling lama 400 ms)
  // dan masa tunggu tombol Lanjut (600 ms). Pengatur waktu berhenti sesudah masa tunggu atau saat fase berganti.
  useEffect(() => {
    if (state.phase !== "impact") return;
    const start = performance.now();
    impactStart.current = { key: sceneKey, at: start };
    const timer = setInterval(() => {
      const ms = performance.now() - start;
      setImpactTime({ key: sceneKey, ms });
      if (ms >= IMPACT_GUARD_MS) clearInterval(timer);
    }, METER_STEP_MS / 2);
    return () => clearInterval(timer);
  }, [state.phase, sceneKey]);

  // Pergantian adegan: LANJUT di tengah sapuan (200 ms) atau sesudah pudar keluar (75 ms); lapisan dibuang di akhir.
  useEffect(() => {
    if (!change) return;
    const half = change.kind === "sapuan" ? WIPE_COVER_MS : FADE_MS / 2;
    const full = change.kind === "sapuan" ? WIPE_MS : FADE_MS;
    const switchTimer = setTimeout(() => dispatch({ type: "LANJUT" }), half);
    const doneTimer = setTimeout(() => setChange(null), full);
    return () => {
      clearTimeout(switchTimer);
      clearTimeout(doneTimer);
    };
  }, [change]);

  // Gambar adegan berikutnya dimuat lebih dulu (Architecture bagian 8).
  useEffect(() => {
    const next = SCENES[state.sceneIndex + 1];
    if (next) preloadScene(next);
  }, [state.sceneIndex]);

  // Layar akhir sementara: fokus ke judulnya.
  useEffect(() => {
    if (ended) endTitleRef.current?.focus();
  }, [ended]);

  // Pintasan keyboard (Architecture bagian 9; spesifikasi F-05), hanya aktif di layar permainan.
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (change) return;
    const context: KeyContext = {
      key: event.key,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      repeat: event.repeat,
      isComposing: event.isComposing,
      target: targetKind(event.target),
    };
    if (!shouldHandleKey(context)) return;
    const command = keyCommand(state.phase, event.key);
    if (!command) return;
    event.preventDefault();
    if (command.type === "pilih") choose(command.choice);
    else if (state.phase === "intro") narrationRef.current?.activate();
    else if (state.phase === "impact") continueFromCard();
    else bridge();
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKey(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  if (ended) {
    return (
      <main className="ss-placeholder ss-play-end" aria-labelledby="ss-play-end-title">
        <h1 id="ss-play-end-title" ref={endTitleRef} tabIndex={-1} className="ss-placeholder-title">
          {copy.play.endTitle}
        </h1>
        <p className="ss-placeholder-lead">{copy.play.endLead}</p>
        <p className="ss-placeholder-status">{copy.play.endStatus}</p>
        <div className="ss-placeholder-actions">
          <button type="button" className="ss-button" onClick={restart}>
            {copy.play.playAgain}
          </button>
          <a className="ss-button" href={GALLERY_HREF}>
            {copy.backToGallery}
          </a>
        </div>
      </main>
    );
  }

  const stageLabel = reaction ? `${scene.altText} ${copy.play.stageReaction(reaction.id)}` : scene.altText;
  const fade = change?.kind === "pudar" ? (state.phase === "transition" ? "keluar" : "masuk") : undefined;
  // Indikator: nilai sebelum memilih selama reaksi, bergerak saat kartu dampak tampil, lalu nilai sesudah (F-06).
  const showingImpact = state.phase === "impact" && chosen !== undefined && !change;
  const before =
    chosen && (state.phase === "reaction" || state.phase === "impact")
      ? metersBefore(state.history, SCENES, scene.id)
      : state.meters;
  const meterTime = reduced ? Number.POSITIVE_INFINITY : impactElapsed;
  const shownMeters =
    state.phase === "reaction"
      ? before
      : state.phase === "impact"
        ? {
            hak: meterValueAt(before.hak, state.meters.hak, meterTime),
            kewajiban: meterValueAt(before.kewajiban, state.meters.kewajiban, meterTime),
          }
        : state.meters;
  const meterEffects = showingImpact && !reduced && chosen ? chosen.effects : null;

  let live = "";
  if (!change && state.phase === "intro") live = screens[screen];
  else if (showingImpact && chosen) live = impactAnnouncement(chosen, before, state.meters);

  let panel: ReactNode = null;
  if (!change && state.phase === "intro") {
    panel = (
      <NarrationBox
        key={`${sceneKey}-${screen}`}
        ref={narrationRef}
        title={scene.title}
        text={screens[screen]}
        isLast={screen === screens.length - 1}
        typewriter={state.settings.typewriter && !reduced}
        onNext={() => nextNarration(screen)}
      />
    );
  } else if (!change && CHOICE_PHASES.has(state.phase)) {
    panel = (
      <ChoicePanel
        key={sceneKey}
        question={scene.question}
        choices={scene.choices}
        flags={state.flags}
        chosen={state.phase === "discuss" ? null : (entry?.choiceId ?? null)}
        bridgeReady={BRIDGE_PHASES.has(state.phase)}
        onChoose={choose}
        onBridge={bridge}
      />
    );
  }

  return (
    <main className="ss-play" aria-labelledby="ss-play-title">
      <h1 id="ss-play-title" className="ss-sr">
        {copy.play.heading(state.sceneIndex + 1, scene.title)}
      </h1>
      <div className="ss-sr" aria-live="polite">
        {live}
      </div>
      <DayArc scenes={SCENES} sceneIndex={state.sceneIndex} scale={scale} animate={!reduced} />
      <Meters values={shownMeters} effects={meterEffects} scale={scale} />
      <div className="ss-stage-area">
        <div className="ss-stage-holder" data-fade={fade} style={{ width: STAGE.w * scale, height: STAGE.h * scale }}>
          <Stage
            scene={scene}
            cast={reaction ? reaction.reaction : scene.cast}
            emote={reaction?.emote}
            scale={scale}
            animate={!reduced}
            label={stageLabel}
          />
          {change?.kind === "sapuan" && <SceneWipe timeOfDay={change.nextTime} scale={scale} />}
        </div>
      </div>
      <div className="ss-play-panel">{panel}</div>
      {showingImpact && chosen && (
        <ImpactCard
          key={sceneKey}
          choice={chosen}
          scale={scale}
          ready={impactElapsed >= IMPACT_GUARD_MS}
          onNext={continueFromCard}
        />
      )}
    </main>
  );
}
