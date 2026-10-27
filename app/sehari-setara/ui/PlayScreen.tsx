// Layar permainan Sehari Setara (spesifikasi F-05 sampai F-09), dibuka lewat #main sampai layar judul dibuat di F-10.
// Menjalankan mesin F-02 dengan naskah F-03: narasi, pertanyaan, pilihan, pengatur waktu, reaksi, indikator, kartu
// dampak, kuis peran di adegan 5 (F-08), bintang alasan, pergantian adegan, papan tim dan bunyi (F-07), lalu layar
// akhir, rekap, refleksi, dan unduh rekap (F-09). Logika permainan tetap di engine/; layar ini hanya mengirim aksi.
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useReducer,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { copy } from "../content/copy";
import { ROLES } from "../content/roles";
import { SCENES } from "../content/scenes";
import { DEFAULT_TEAMS } from "../content/teams";
import { createInitialState, createReducer } from "../engine/reducer";
import { activeTeam, activeTeamIndex, endingFor, isQuizCorrect, narrationFor } from "../engine/rules";
import type { ChoiceId, GameAction, GameState, Phase, RoleId, Stars, TeamSetup, TimeOfDay } from "../engine/types";
import { ChoicePanel } from "./ChoicePanel";
import {
  CLOSING_GUARD_MS,
  endingAnnouncement,
  recapPageAnnouncement,
  recapPages,
  recapRows,
  reflectionAnnouncement,
  scaleView,
  topTeamIds,
} from "./closing";
import {
  CLOSING_PHASES,
  FADE_MS,
  keyCommand,
  REACTION_MS,
  replayActions,
  runActions,
  shouldHandleKey,
  startActions,
  WIPE_COVER_MS,
  WIPE_MS,
  type KeyContext,
  type TimerActionType,
} from "./controls";
import { DayArc } from "./DayArc";
import {
  canvasToPng,
  DOWNLOAD_TIMEOUT_MS,
  downloadFileName,
  renderSheet,
  saveBlob,
  withTimeout,
  type DownloadKind,
} from "./download";
import { EndingPanel, EndingStage } from "./Ending";
import { usePrefersReducedMotion } from "./hooks";
import { ImpactCard } from "./ImpactCard";
import { IMPACT_GUARD_MS, impactAnnouncement, METER_STEP_MS, meterValueAt, metersBefore } from "./impact";
import { STAGE, type TeamCount } from "./layout";
import { Meters } from "./Meters";
import { NarrationBox, type NarrationHandle } from "./NarrationBox";
import { canvasToPdf } from "./pdf";
import { preloadEnding, preloadScene } from "./preload";
import { QUIZ_GUARD_MS, quizResultAnnouncement, quizStartAnnouncement, roleForNumber } from "./quiz";
import { Recap } from "./Recap";
import { RecapSheet } from "./RecapSheet";
import { Reflection } from "./Reflection";
import { RoleQuiz } from "./RoleQuiz";
import { SceneWipe } from "./SceneWipe";
import { CLICK_RATE, soundPlayer, TEXT_BLIP_RATE } from "./sound";
import { Stage } from "./Stage";
import { StarsAward } from "./StarsAward";
import { Teams, type StarPop } from "./Teams";
import { Timer } from "./Timer";
import { canAddTime, starsAnnouncement, timerAnnouncement, type TimerCause } from "./turn";
import { useTimer } from "./useTimer";

const reducer = createReducer(SCENES);

/** Halaman rekap menurut waktu adegan: [[0, 1], [2, 3], [4], [5]] (F-09). */
const RECAP_PAGES = recapPages(SCENES);

/** Fase yang menampilkan pertanyaan dan tiga pilihan di panel bawah; di fase impact dan quiz panel bawah kosong (F-06, F-08). */
const CHOICE_PHASES: ReadonlySet<Phase> = new Set<Phase>(["discuss", "reaction", "stars"]);
/** Fase saat panggung menampilkan reaksi pilihan adegan berjalan. */
const REACTING_PHASES: ReadonlySet<Phase> = new Set<Phase>(["reaction", "impact", "quiz", "stars", "transition"]);

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

/** Halaman rekap yang tampil; visit naik setiap kali halaman tampil, agar masa tunggunya dihitung lagi (F-09). */
interface RecapView {
  page: number;
  visit: number;
}

/** Keadaan unduh rekap (F-09): run naik setiap kali penyiapan dimulai atau dibatalkan "Main lagi". */
interface DownloadState {
  run: number;
  kind: DownloadKind | null;
  status: "idle" | "menyiapkan" | "selesai" | "gagal";
  date: Date | null;
}

const DOWNLOAD_IDLE: DownloadState = { run: 0, kind: null, status: "idle", date: null };

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

/** Menunggu satu bingkai gambar, agar lembar unduhan sudah tergambar sebelum dibaca. */
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

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
  const cardUsed = useRef("");
  const quizUsed = useRef("");
  const starsUsed = useRef("");
  // Waktu sejak kartu dampak tampil: state untuk tampilan, ref untuk pengaman tekanan ganda (spesifikasi F-06).
  const [impactTime, setImpactTime] = useState({ key: "", ms: 0 });
  const impactStart = useRef({ key: "", at: 0 });
  // Masa tunggu Lanjut kuis (F-08): ref waktu mulai untuk pengaman tekanan, state hanya untuk tampilan tombol.
  const quizStart = useRef({ key: "", at: 0 });
  const [quizReady, setQuizReady] = useState("");
  // Layar penutup (F-09): halaman rekap, masa tunggu (ref waktu mulai dan state tampilan), dan tekanan yang sudah diterima.
  const [recap, setRecap] = useState<RecapView>({ page: 1, visit: 0 });
  const closingStart = useRef({ key: "", at: 0 });
  const [closingReady, setClosingReady] = useState("");
  const closingUsed = useRef("");
  const prevUsed = useRef("");
  // Enter atau Spasi yang masih ditahan sesudah "Main lagi" dibatalkan sampai tombol dilepas (F-09).
  const holdKeys = useRef(false);
  // Unduh rekap (F-09): lembar unduhan, dan pelepas URL blob yang dipanggil saat layar ditutup.
  const [download, setDownload] = useState<DownloadState>(DOWNLOAD_IDLE);
  const sheetRef = useRef<HTMLElement>(null);
  const releases = useRef<Array<() => void>>([]);
  // Pembatal penyiapan yang sedang berjalan, agar "Kembali ke galeri" bisa membatalkannya sebelum halaman berpindah.
  const downloadAbort = useRef<AbortController | null>(null);

  const reduced = prefersReduced || state.settings.reducedMotion;
  const soundOn = state.settings.sound;
  const scene = SCENES[state.sceneIndex];
  const screens = narrationFor(scene, state.flags);
  const screen = narration.round === round && narration.scene === state.sceneIndex ? narration.screen : 0;
  const entry = state.history.find((item) => item.sceneId === scene.id);
  const chosen = entry ? scene.choices.find((choice) => choice.id === entry.choiceId) : undefined;
  const reaction = chosen && REACTING_PHASES.has(state.phase) ? chosen : undefined;
  const sceneKey = `${round}-${state.sceneIndex}`;
  const impactElapsed = state.phase === "impact" && impactTime.key === sceneKey ? impactTime.ms : 0;
  const team = activeTeam(state);

  // Layar penutup (F-09).
  const closing = CLOSING_PHASES.has(state.phase);
  const ending = state.phase === "ending";
  const endingId = endingFor(state.meters);
  const view = scaleView(state.meters);
  const topIds = topTeamIds(state.teams);
  const rows = useMemo(() => recapRows(state.history, SCENES, state.teams, state.flags), [state.history, state.teams, state.flags]);
  const closingKey =
    state.phase === "ending"
      ? `${round}-akhir`
      : state.phase === "recap"
        ? `${round}-rekap-${recap.visit}`
        : state.phase === "reflection"
          ? `${round}-refleksi`
          : "";
  const closingReadyShown = closingKey !== "" && closingReady === closingKey;
  const busy = download.status === "menyiapkan" ? download.kind : null;

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

  /** Bintang alasan untuk tim aktif, sekali per adegan; lalu sapuan atau pudar ke adegan berikutnya, atau layar akhir. */
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

  /* ---------------- Layar penutup (F-09) ---------------- */

  /** Benar bila layar atau halaman penutup ini sudah tampil 600 ms; waktu diperiksa saat tekanan diterima. */
  const closingGuardPassed = () =>
    closingKey !== "" &&
    closingStart.current.key === closingKey &&
    performance.now() - closingStart.current.at >= CLOSING_GUARD_MS;

  /** Tombol maju layar penutup: sesudah masa tunggu dan sekali per layar atau halaman. */
  const acceptForward = () => {
    if (!closingGuardPassed() || closingUsed.current === closingKey) return false;
    closingUsed.current = closingKey;
    return true;
  };

  /** "Lihat rekap" atau Spasi/Enter di layar akhir: LANJUT ke rekap halaman 1. */
  const seeRecap = () => {
    if (state.phase !== "ending" || !acceptForward()) return;
    dispatch({ type: "LANJUT" });
    setRecap((current) => ({ page: 1, visit: current.visit + 1 }));
    click();
  };

  /** "Berikutnya" atau Spasi/Enter di rekap; di halaman terakhir "Lanjut ke refleksi" (LANJUT). */
  const recapNext = () => {
    if (state.phase !== "recap" || !acceptForward()) return;
    click();
    if (recap.page < RECAP_PAGES.length) setRecap({ page: recap.page + 1, visit: recap.visit + 1 });
    else dispatch({ type: "LANJUT" });
  };

  /** "Sebelumnya": tanpa masa tunggu; klik kedua dan seterusnya dari satu klik ganda diabaikan (DRAF A-9). */
  const recapPrev = (event: MouseEvent<HTMLButtonElement>) => {
    if (state.phase !== "recap" || recap.page <= 1 || event.detail > 1 || prevUsed.current === closingKey) return;
    prevUsed.current = closingKey;
    click();
    setRecap({ page: recap.page - 1, visit: recap.visit + 1 });
  };

  /** "Main lagi": permainan baru dengan tim dan pengaturan yang sama; penyiapan unduhan dibatalkan (DRAF A-6). */
  const replay = () => {
    if (state.phase !== "reflection" || !acceptForward()) return;
    send(replayActions(teamsFor(teamCount)));
    setRound((value) => value + 1);
    setPop(null);
    setRecap({ page: 1, visit: 0 });
    setDownload((current) => ({ ...DOWNLOAD_IDLE, run: current.run + 1 }));
    holdKeys.current = true;
    click();
  };

  /**
   * "Kembali ke galeri": selama masa tunggu klik dan Enter dibatalkan; tanpa bunyi karena halaman berpindah (F-07).
   * Bila halaman berpindah di tab ini, penyiapan unduhan dibatalkan lebih dulu, karena layar refleksi ditinggalkan
   * (DRAF A-6): tanpa berkas dan tanpa kabar, juga bila halaman lama sempat berjalan sebelum galeri tampil.
   */
  const galleryClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!closingGuardPassed()) {
      event.preventDefault();
      return;
    }
    const sameTab = event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
    if (sameTab && download.status === "menyiapkan") {
      downloadAbort.current?.abort();
      setDownload((current) => ({ ...DOWNLOAD_IDLE, run: current.run + 1 }));
    }
  };

  /** "Unduh gambar" dan "Unduh PDF": sesudah masa tunggu dan bila tidak ada unduhan yang sedang disiapkan. */
  const startDownload = (kind: DownloadKind) => {
    if (state.phase !== "reflection" || download.status === "menyiapkan" || !closingGuardPassed()) return;
    click();
    setDownload((current) => ({ run: current.run + 1, kind, status: "menyiapkan", date: new Date() }));
    announce(copy.closing.download.preparing[kind]);
  };

  /** Hasil penyiapan: kabar di baris kabar dan wilayah status, lalu lembar dilepas. */
  const settleDownload = useEffectEvent((result: "selesai" | "gagal", kind: DownloadKind) => {
    setDownload((current) => ({ ...current, status: result }));
    announce(result === "selesai" ? copy.closing.download.done[kind] : copy.closing.download.failed);
  });

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

  // Layar penutup: masa tunggu 600 ms sejak layar atau halaman pertama kali digambar (F-09). Satu pengatur waktu hanya
  // memperbarui aria-disabled, dan dibersihkan saat layar atau halaman berganti atau layar ditutup.
  useEffect(() => {
    if (!closingKey) return;
    closingStart.current = { key: closingKey, at: performance.now() };
    const timer = setTimeout(() => setClosingReady(closingKey), CLOSING_GUARD_MS);
    return () => clearTimeout(timer);
  }, [closingKey]);

  // Unduh rekap: sesudah lembar tergambar dan huruf siap, lembar digambar menjadi kanvas, lalu PNG atau PDF diserahkan
  // ke peramban. Penyiapan dibatalkan bila "Main lagi" ditekan atau layar ditutup; batas waktunya 15 detik (DRAF A-7).
  useEffect(() => {
    const { kind, date } = download;
    if (download.status !== "menyiapkan" || !kind || !date) return;
    const controller = new AbortController();
    downloadAbort.current = controller;
    const aborted = new Promise<never>((_, reject) => {
      controller.signal.addEventListener("abort", () => reject(new Error("Penyiapan dibatalkan")), { once: true });
    });
    // Penyiapan yang dibatalkan berhenti di langkah berikutnya, agar tidak terus menggambar atau menyusun PDF.
    const stopIfAborted = () => {
      if (controller.signal.aborted) throw new Error("Penyiapan dibatalkan");
    };
    const prepare = async (): Promise<Blob> => {
      await nextFrame();
      stopIfAborted();
      await document.fonts.ready;
      stopIfAborted();
      const node = sheetRef.current;
      if (!node) throw new Error("Lembar belum terpasang");
      const canvas = await renderSheet(node);
      stopIfAborted();
      return kind === "png" ? canvasToPng(canvas) : canvasToPdf(canvas);
    };
    withTimeout(Promise.race([prepare(), aborted]), DOWNLOAD_TIMEOUT_MS).then(
      (blob) => {
        if (controller.signal.aborted) return;
        try {
          releases.current.push(saveBlob(blob, downloadFileName(kind, date)));
        } catch {
          // Berkas tidak bisa diserahkan ke peramban: diperlakukan seperti penyiapan yang gagal.
          settleDownload("gagal", kind);
          return;
        }
        settleDownload("selesai", kind);
      },
      () => {
        if (!controller.signal.aborted) settleDownload("gagal", kind);
      },
    );
    return () => controller.abort();
  }, [download]);

  // URL blob yang belum dilepas dilepas saat layar ditutup, sehingga tidak ada pengatur waktu yang tertinggal.
  useEffect(() => {
    const pending = releases.current;
    return () => {
      for (const release of pending.splice(0)) release();
    };
  }, []);

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

  // Gambar adegan berikutnya dimuat lebih dulu (Architecture bagian 8); saat adegan 6 dimulai, ilustrasi akhir dan
  // strip timbangan (F-09).
  useEffect(() => {
    const next = SCENES[state.sceneIndex + 1];
    if (next) preloadScene(next);
    else preloadEnding();
  }, [state.sceneIndex]);

  // Pintasan keyboard (Architecture bagian 9; spesifikasi F-05, F-07, F-08, dan F-09), hanya aktif di layar permainan.
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    // Tombol yang ditahan: peramban mengubah setiap pengulangan Enter pada tombol berfokus menjadi klik. Di ketiga
    // layar penutup, dan sesudah "Main lagi" sampai tombol dilepas, pengulangan Enter dan Spasi dibatalkan (F-09).
    if (event.repeat && (event.key === "Enter" || event.key === " ") && (CLOSING_PHASES.has(state.phase) || holdKeys.current)) {
      event.preventDefault();
      return;
    }
    if (!event.repeat) holdKeys.current = false;
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
    else if (state.phase === "ending") seeRecap();
    else if (state.phase === "recap") recapNext();
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKey(event);
    const release = () => {
      holdKeys.current = false;
    };
    window.addEventListener("keydown", listener);
    window.addEventListener("keyup", release);
    return () => {
      window.removeEventListener("keydown", listener);
      window.removeEventListener("keyup", release);
    };
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
  if (state.phase === "ending") live = endingAnnouncement(endingId, state.meters, view);
  else if (state.phase === "recap") live = recapPageAnnouncement(rows, RECAP_PAGES, recap.page);
  else if (state.phase === "reflection") live = reflectionAnnouncement();
  else if (!change && state.phase === "intro") live = screens[screen];
  else if (showingImpact && chosen) live = impactAnnouncement(chosen, before, state.meters);
  else if (quiz) {
    live =
      state.quizAnswer === null
        ? quizStartAnnouncement(quiz.question, ROLES)
        : quizResultAnnouncement(ROLES, state.quizAnswer, isQuizCorrect(scene, state.quizAnswer));
  }

  let heading: string = copy.play.heading(state.sceneIndex + 1, scene.title);
  if (state.phase === "ending") heading = copy.closing.heading.ending;
  else if (state.phase === "recap") heading = copy.closing.heading.recap;
  else if (state.phase === "reflection") heading = copy.closing.heading.reflection;

  let downloadStatus = "";
  if (download.kind && download.status !== "idle") {
    const text = copy.closing.download;
    if (download.status === "menyiapkan") downloadStatus = text.preparing[download.kind];
    else if (download.status === "selesai") downloadStatus = text.done[download.kind];
    else downloadStatus = text.failed;
  }

  let panel: ReactNode = null;
  if (ending) {
    panel = <EndingPanel id={endingId} ready={closingReadyShown} onNext={seeRecap} />;
  } else if (!change && state.phase === "intro") {
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

  let content: ReactNode;
  if (state.phase === "recap") {
    // Rekap dan refleksi menutupi seluruh layar; bilah atas, indikator, panggung, dan kedua panel tidak dipasang.
    content = (
      <Recap
        rows={rows}
        pages={RECAP_PAGES}
        page={recap.page}
        ready={closingReadyShown}
        onPrev={recapPrev}
        onNext={recapNext}
      />
    );
  } else if (state.phase === "reflection") {
    content = (
      <Reflection
        ready={closingReadyShown}
        busy={busy}
        status={downloadStatus}
        onReplay={replay}
        onGallery={galleryClick}
        onDownload={startDownload}
      />
    );
  } else {
    content = (
      <>
        <DayArc scenes={SCENES} sceneIndex={state.sceneIndex} scale={scale} animate={!reduced} ending={ending} />
        <Meters values={shownMeters} effects={meterEffects} scale={scale} />
        <div className="ss-stage-area">
          <div className="ss-stage-holder" data-fade={fade} style={{ width: STAGE.w * scale, height: STAGE.h * scale }}>
            {ending ? (
              <EndingStage id={endingId} view={view} scale={scale} animate={!reduced} />
            ) : (
              <Stage
                scene={scene}
                cast={reaction ? reaction.reaction : scene.cast}
                emote={reaction?.emote}
                scale={scale}
                animate={!reduced}
                label={stageLabel}
              />
            )}
            {change?.kind === "sapuan" && <SceneWipe timeOfDay={change.nextTime} scale={scale} />}
          </div>
        </div>
        <div className="ss-play-panel">{panel}</div>
        {/* Panel kanan sesudah panel bawah, agar urutan Tab tetap pertanyaan, A, B, C, lalu tombol pengatur waktu (F-07). */}
        <div className="ss-side" style={{ width: `calc(50% - ${160 * scale}px)` }}>
          <Teams
            teams={state.teams}
            activeIndex={ending ? -1 : activeTeamIndex(state.sceneIndex, state.teams.length)}
            pop={reduced ? null : pop}
            topIds={ending ? topIds : undefined}
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
      </>
    );
  }

  return (
    <main
      className="ss-play"
      aria-labelledby="ss-play-title"
      data-kartu={showingImpact ? "" : undefined}
      data-kuis={quiz ? "" : undefined}
      data-akhir={ending ? "" : undefined}
    >
      <h1 id="ss-play-title" className="ss-sr">
        {heading}
      </h1>
      {/* Kedua wilayah pengumuman dipasang sekali dan tetap elemen yang sama sejak adegan 1 sampai refleksi (F-09). */}
      <div className="ss-sr" aria-live="polite">
        {live}
      </div>
      <div className="ss-sr" role="status">
        {status.round === round ? status.text : ""}
      </div>
      {content}
      {closing && busy && download.date && (
        <RecapSheet
          ref={sheetRef}
          id={endingId}
          meters={state.meters}
          teams={state.teams}
          topIds={topIds}
          rows={rows}
          date={download.date}
        />
      )}
    </main>
  );
}
