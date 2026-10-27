// Layar permainan Sehari Setara (spesifikasi F-05 sampai F-08), dibuka lewat #main sampai layar judul dibuat di F-10.
// Menjalankan mesin F-02 dengan naskah F-03: narasi, pertanyaan, pilihan, pengatur waktu, reaksi, indikator, kartu
// dampak, kuis peran di adegan 5 (F-08), bintang alasan, pergantian adegan, dan layar akhir sementara, ditambah papan tim
// dan bunyi (F-07). Logika permainan tetap di engine/; layar ini hanya mengirim aksi.
import { useEffect, useEffectEvent, useReducer, useRef, useState, type ReactNode } from "react";
import { copy } from "../content/copy";
import { ROLES } from "../content/roles";
import { SCENES } from "../content/scenes";
import { DEFAULT_TEAMS } from "../content/teams";
import { createInitialState, createReducer } from "../engine/reducer";
import { activeTeam, activeTeamIndex, isQuizCorrect, narrationFor } from "../engine/rules";
import type { ChoiceId, GameAction, GameState, Phase, RoleId, Stars, TeamSetup, TimeOfDay } from "../engine/types";
import { ChoicePanel } from "./ChoicePanel";
import {
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
  type TimerActionType,
} from "./controls";
import { DayArc } from "./DayArc";
import { usePrefersReducedMotion } from "./hooks";
import { ImpactCard } from "./ImpactCard";
import { IMPACT_GUARD_MS, impactAnnouncement, METER_STEP_MS, meterValueAt, metersBefore } from "./impact";
import { STAGE, type TeamCount } from "./layout";
import { Meters } from "./Meters";
import { NarrationBox, type NarrationHandle } from "./NarrationBox";
import { preloadScene } from "./preload";
import { QUIZ_GUARD_MS, quizResultAnnouncement, quizStartAnnouncement, roleForNumber } from "./quiz";
import { RoleQuiz } from "./RoleQuiz";
import { SceneWipe } from "./SceneWipe";
import { CLICK_RATE, soundPlayer, TEXT_BLIP_RATE } from "./sound";
import { Stage } from "./Stage";
import { StarsAward } from "./StarsAward";
import { Teams, type StarPop } from "./Teams";
import { Timer } from "./Timer";
import { canAddTime, starsAnnouncement, timerAnnouncement, type TimerCause } from "./turn";
import { useTimer } from "./useTimer";

// Relatif terhadap /ruang-setara/sehari-setara/ (Architecture bagian 11).
const GALLERY_HREF = "../";

const reducer = createReducer(SCENES);

/** Fase yang menampilkan pertanyaan dan tiga pilihan di panel bawah; di fase impact dan quiz panel bawah kosong (F-06, F-08). */
const CHOICE_PHASES: ReadonlySet<Phase> = new Set<Phase>(["discuss", "reaction", "stars"]);
/** Fase saat panggung menampilkan reaksi pilihan adegan berjalan. */
const REACTING_PHASES: ReadonlySet<Phase> = new Set<Phase>(["reaction", "impact", "quiz", "stars", "transition"]);
/** Fase yang memakai layar akhir sementara, sampai layar akhir dibuat di F-09. */
const END_PHASES: ReadonlySet<Phase> = new Set<Phase>(["ending", "recap", "reflection"]);

/** Interaksi yang membuat atau melanjutkan konteks audio (Architecture bagian 8: bunyi dimuat sesudah interaksi pertama). */
const UNLOCK_EVENTS = ["keydown", "pointerdown", "pointerup"] as const;

const TIMER_CAUSE: Readonly<Record<TimerActionType, TimerCause>> = {
  JEDA_WAKTU: "jeda",
  TAMBAH_30: "tambah",
  LEWATI_DISKUSI: "lewati",
};

interface SceneChange {
  kind: "sapuan" | "pudar";
  nextTime: TimeOfDay;
}

/** Tim bawaan pertama sebanyak alamat layar: dua untuk #main, tiga dan empat untuk alamat uji (F-07). */
const teamsFor = (count: TeamCount): TeamSetup[] => DEFAULT_TEAMS.slice(0, count);

/** Keadaan awal: judul, pengaturan, dan prolog dilewati dengan tim bawaan (F-10 belum ada). */
function initialPlayState(count: TeamCount): GameState {
  return runActions(reducer, createInitialState(), startActions(teamsFor(count)));
}

/** Jenis elemen yang menerima tekanan tombol, untuk aturan pengabaian pintasan. */
function targetKind(target: EventTarget | null): KeyContext["target"] {
  if (!(target instanceof HTMLElement)) return "lain";
  if (target.isContentEditable || target.closest("input, textarea, select")) return "isian";
  if (target.closest("button, a[href]")) return "tombol";
  return "lain";
}

export function PlayScreen({ scale, teamCount }: { scale: number; teamCount: TeamCount }) {
  const prefersReduced = usePrefersReducedMotion();
  const [state, dispatch] = useReducer(reducer, teamCount, initialPlayState);
  const [round, setRound] = useState(0);
  const [narration, setNarration] = useState({ round: 0, scene: 0, screen: 0 });
  const [change, setChange] = useState<SceneChange | null>(null);
  // Pengumuman wilayah status kedua (F-07); berlaku untuk satu permainan saja.
  const [status, setStatus] = useState({ round: 0, text: "" });
  const [pop, setPop] = useState<StarPop | null>(null);
  const narrationRef = useRef<NarrationHandle>(null);
  const endTitleRef = useRef<HTMLHeadingElement>(null);
  const cardUsed = useRef("");
  const quizUsed = useRef("");
  const starsUsed = useRef("");
  // Waktu sejak kartu dampak tampil: state untuk tampilan, ref untuk pengaman tekanan ganda (spesifikasi F-06).
  const [impactTime, setImpactTime] = useState({ key: "", ms: 0 });
  const impactStart = useRef({ key: "", at: 0 });
  // Masa tunggu Lanjut kuis (F-08): ref waktu mulai untuk pengaman tekanan, state hanya untuk tampilan tombol.
  const quizStart = useRef({ key: "", at: 0 });
  const [quizReady, setQuizReady] = useState("");

  const reduced = prefersReduced || state.settings.reducedMotion;
  const soundOn = state.settings.sound;
  const scene = SCENES[state.sceneIndex];
  const screens = narrationFor(scene, state.flags);
  const screen = narration.round === round && narration.scene === state.sceneIndex ? narration.screen : 0;
  const entry = state.history.find((item) => item.sceneId === scene.id);
  const chosen = entry ? scene.choices.find((choice) => choice.id === entry.choiceId) : undefined;
  const reaction = chosen && REACTING_PHASES.has(state.phase) ? chosen : undefined;
  const ended = END_PHASES.has(state.phase);
  const sceneKey = `${round}-${state.sceneIndex}`;
  const impactElapsed = state.phase === "impact" && impactTime.key === sceneKey ? impactTime.ms : 0;
  const team = activeTeam(state);

  const send = (actions: readonly GameAction[]) => {
    for (const action of actions) dispatch(action);
  };

  /** Bunyi klik untuk tekanan yang diterima permainan (spesifikasi F-07, bagian Bunyi klik). */
  const click = () => {
    if (soundOn) soundPlayer.play("klik", CLICK_RATE);
  };

  /** Bunyi teks dari kotak narasi, paling banyak sekali per pembaruan teks per huruf. */
  const typeSound = () => {
    if (soundOn) soundPlayer.play("teks", TEXT_BLIP_RATE);
  };

  /** Wilayah status kedua: hanya diisi pada peristiwa, tidak setiap detik. */
  const announce = (text: string | null) => {
    if (text) setStatus({ round, text });
  };

  /** Layar narasi berikutnya, atau pertanyaan sesudah layar terakhir. Tekanan ganda tidak melewati layar. */
  const nextNarration = (from: number) => {
    if (from >= screens.length - 1) {
      const next = reducer(state, { type: "NARASI_SELESAI" });
      if (next === state) return;
      dispatch({ type: "NARASI_SELESAI" });
      announce(timerAnnouncement(state.timer, next.timer, "mulai"));
      return;
    }
    setNarration((current) => {
      const at = current.round === round && current.scene === state.sceneIndex ? current.screen : 0;
      return at === from ? { round, scene: state.sceneIndex, screen: from + 1 } : current;
    });
  };

  const choose = (id: ChoiceId) => {
    const action: GameAction = { type: "PILIH", choice: id };
    if (reducer(state, action) === state) return;
    dispatch(action);
    click();
  };

  /** Jeda, +30, dan lewati: hanya di fase diskusi, dan hanya bila aksinya mengubah pengatur waktu. */
  const timerAction = (type: TimerActionType) => {
    if (state.phase !== "discuss" || change) return;
    if (type === "TAMBAH_30" && !canAddTime(state.timer.remaining)) return;
    const next = reducer(state, { type });
    if (next === state) return;
    dispatch({ type });
    click();
    announce(timerAnnouncement(state.timer, next.timer, TIMER_CAUSE[type]));
  };

  /** Detik dari useTimer; diumumkan hanya saat masuk sepuluh detik terakhir dan saat waktu habis. */
  const onTicks = (count: number) => {
    let next = state;
    for (let i = 0; i < count; i++) next = reducer(next, { type: "TICK" });
    if (next === state) return;
    for (let i = 0; i < count; i++) dispatch({ type: "TICK" });
    announce(timerAnnouncement(state.timer, next.timer, "tick"));
  };

  useTimer(state.phase === "discuss" && state.timer.running && state.timer.remaining > 0 && change === null, onTicks);

  /** Masa tunggu 600 ms dihitung dari waktu sebenarnya, sehingga tidak bergantung pada render terakhir. */
  const cardReady = () =>
    state.phase === "impact" &&
    impactStart.current.key === sceneKey &&
    performance.now() - impactStart.current.at >= IMPACT_GUARD_MS;

  /** Tombol Lanjut kartu dampak: sekali per adegan, sesudah masa tunggu; reducer membuka kuis di adegan 5, selain itu fase bintang. */
  const continueFromCard = () => {
    if (!cardReady() || cardUsed.current === sceneKey) return;
    cardUsed.current = sceneKey;
    dispatch({ type: "LANJUT" });
    click();
  };

  /** Jawaban kuis peran: kartu atau 1 sampai 4; hanya jawaban pertama yang diterima reducer (F-02, F-08). */
  const answerQuiz = (role: RoleId) => {
    const action: GameAction = { type: "JAWAB_KUIS", role };
    if (state.phase !== "quiz" || change || reducer(state, action) === state) return;
    dispatch(action);
    click();
  };

  /**
   * Tombol Lanjut kuis: sesudah dijawab, sekali per adegan, dan sesudah masa tunggu 600 ms. Waktu diperiksa saat tekanan
   * diterima, bukan dari tampilan tombol, sehingga tekanan pada 600 ms tetap diterima (spesifikasi F-08).
   */
  const continueFromQuiz = () => {
    if (state.phase !== "quiz" || change || state.quizAnswer === null || quizUsed.current === sceneKey) return;
    if (quizStart.current.key !== sceneKey || performance.now() - quizStart.current.at < QUIZ_GUARD_MS) return;
    if (reducer(state, { type: "LANJUT" }) === state) return;
    quizUsed.current = sceneKey;
    dispatch({ type: "LANJUT" });
    click();
  };

  /** Bintang alasan untuk tim aktif, sekali per adegan; lalu sapuan atau pudar ke adegan berikutnya. */
  const giveStars = (stars: Stars) => {
    if (state.phase !== "stars" || change || starsUsed.current === sceneKey || !team) return;
    starsUsed.current = sceneKey;
    dispatch({ type: "BERI_BINTANG", stars });
    click();
    announce(starsAnnouncement(team.name, stars, team.stars + stars));
    setPop(stars > 0 && !reduced ? { key: sceneKey, teamId: team.id } : null);
    const next = SCENES[state.sceneIndex + 1];
    if (next) setChange({ kind: reduced ? "pudar" : "sapuan", nextTime: next.timeOfDay });
    else dispatch({ type: "LANJUT" });
  };

  /** M: suara mati atau nyala lewat UBAH_PENGATURAN; saat dinyalakan, satu klik sebagai tanda. */
  const toggleSound = () => {
    const on = !soundOn;
    dispatch({ type: "UBAH_PENGATURAN", settings: { sound: on } });
    announce(on ? copy.sound.on : copy.sound.off);
    if (on) {
      soundPlayer.unlock();
      soundPlayer.play("klik", CLICK_RATE);
    }
  };

  const restart = () => {
    send(restartActions(teamsFor(teamCount)));
    setRound((value) => value + 1);
    setPop(null);
    click();
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

  // Kuis peran: masa tunggu Lanjut kuis dihitung sejak jawaban pertama tampil (spesifikasi F-08, K-5). Satu pengatur
  // waktu hanya memperbarui tampilan tombol, dan dibersihkan saat fase berganti atau layar ditutup.
  useEffect(() => {
    if (state.phase !== "quiz" || state.quizAnswer === null) return;
    quizStart.current = { key: sceneKey, at: performance.now() };
    const timer = setTimeout(() => setQuizReady(sceneKey), QUIZ_GUARD_MS);
    return () => clearTimeout(timer);
  }, [state.phase, state.quizAnswer, sceneKey]);

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

  // Pintasan keyboard (Architecture bagian 9; spesifikasi F-05, F-07, dan F-08), hanya aktif di layar permainan.
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
    else if (command.type === "waktu") timerAction(command.action);
    else if (command.type === "bintang") giveStars(command.stars);
    else if (command.type === "suara") toggleSound();
    else if (command.type === "jawab") {
      const role = roleForNumber(command.nomor, ROLES);
      if (role) answerQuiz(role.id);
    } else if (state.phase === "intro") narrationRef.current?.activate();
    else if (state.phase === "impact") continueFromCard();
    else if (state.phase === "quiz") continueFromQuiz();
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKey(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  // Konteks audio dibuat pada interaksi pertama di layar permainan, dan dilanjutkan bila peramban menangguhkannya.
  const unlockSound = useEffectEvent(() => {
    if (soundOn) soundPlayer.unlock();
  });

  useEffect(() => {
    const listener = () => unlockSound();
    for (const type of UNLOCK_EVENTS) window.addEventListener(type, listener, true);
    return () => {
      for (const type of UNLOCK_EVENTS) window.removeEventListener(type, listener, true);
    };
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
  // Kuis peran di adegan yang punya roleQuiz (adegan 5), di tempat kartu dampak (F-08).
  const quiz = state.phase === "quiz" && !change ? scene.roleQuiz : undefined;

  let live = "";
  if (!change && state.phase === "intro") live = screens[screen];
  else if (showingImpact && chosen) live = impactAnnouncement(chosen, before, state.meters);
  else if (quiz) {
    live =
      state.quizAnswer === null
        ? quizStartAnnouncement(quiz.question, ROLES)
        : quizResultAnnouncement(ROLES, state.quizAnswer, isQuizCorrect(scene, state.quizAnswer));
  }

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
        onTypeSound={typeSound}
        onPress={click}
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
        onChoose={choose}
        takeFocus={state.phase !== "stars"}
      />
    );
  }

  return (
    <main
      className="ss-play"
      aria-labelledby="ss-play-title"
      data-kartu={showingImpact ? "" : undefined}
      data-kuis={quiz ? "" : undefined}
    >
      <h1 id="ss-play-title" className="ss-sr">
        {copy.play.heading(state.sceneIndex + 1, scene.title)}
      </h1>
      <div className="ss-sr" aria-live="polite">
        {live}
      </div>
      <div className="ss-sr" role="status">
        {status.round === round ? status.text : ""}
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
      {/* Panel kanan sesudah panel bawah, agar urutan Tab tetap pertanyaan, A, B, C, lalu tombol pengatur waktu (F-07). */}
      <div className="ss-side" style={{ width: `calc(50% - ${160 * scale}px)` }}>
        <Teams
          teams={state.teams}
          activeIndex={activeTeamIndex(state.sceneIndex, state.teams.length)}
          pop={reduced ? null : pop}
        />
        {!change && state.phase === "discuss" && (
          <Timer
            timer={state.timer}
            onPause={() => timerAction("JEDA_WAKTU")}
            onAdd={() => timerAction("TAMBAH_30")}
            onSkip={() => timerAction("LEWATI_DISKUSI")}
          />
        )}
        {!change && state.phase === "stars" && team && (
          <StarsAward key={sceneKey} teamName={team.name} onGive={giveStars} />
        )}
      </div>
      {showingImpact && chosen && (
        <ImpactCard
          key={sceneKey}
          choice={chosen}
          scale={scale}
          ready={impactElapsed >= IMPACT_GUARD_MS}
          onNext={continueFromCard}
        />
      )}
      {quiz && (
        <RoleQuiz
          key={sceneKey}
          question={quiz.question}
          roles={ROLES}
          answer={state.quizAnswer}
          correctId={quiz.answer}
          scale={scale}
          ready={quizReady === sceneKey}
          onAnswer={answerQuiz}
          onNext={continueFromQuiz}
        />
      )}
    </main>
  );
}
