// Pengatur waktu diskusi di panel kanan (Design System bagian 7; spesifikasi F-07, bagian Pengatur waktu).
// Hanya menampilkan state.timer; detik dikirim useTimer, dan PlayScreen memutuskan apakah tekanan diterima.
import { icons } from "../assets/manifest";
import { copy } from "../content/copy";
import { canAddTime, clockText, durationText, filledBlocks, TIMER_BLOCKS, timerStatus, timerTone, type TimerState } from "./turn";

const LABEL = {
  berjalan: copy.timer.running,
  dijeda: copy.timer.paused,
  habis: copy.timer.over,
} as const;

interface TimerProps {
  timer: TimerState;
  onPause(): void;
  onAdd(): void;
  onSkip(): void;
}

export function Timer({ timer, onPause, onAdd, onSkip }: TimerProps) {
  const status = timerStatus(timer);
  const filled = filledBlocks(timer.remaining, timer.duration);
  const over = status === "habis";
  const remaining = over ? copy.timer.none : copy.timer.remaining(durationText(timer.remaining));

  return (
    <div className="ss-timer" role="group" aria-label={copy.timer.group} data-status={status} data-tone={timerTone(timer.remaining)}>
      <p className="ss-timer-label">
        <span className="ss-timer-icon" aria-hidden="true" style={{ backgroundImage: `url(${icons.clock})` }} />
        <span className="ss-timer-text">{LABEL[status]}</span>
      </p>
      <div className="ss-timer-row">
        <span className="ss-timer-bar" aria-hidden="true">
          {Array.from({ length: TIMER_BLOCKS }, (_, index) => (
            <span key={index} className="ss-timer-block" data-isi={index < filled ? "penuh" : "kosong"} />
          ))}
        </span>
        <span className="ss-timer-value" role="timer">
          <span aria-hidden="true">{clockText(timer.remaining)}</span>
          <span className="ss-sr">{remaining}</span>
        </span>
      </div>
      <div className="ss-timer-buttons">
        <button
          type="button"
          className="ss-panel-button"
          aria-pressed={status === "dijeda"}
          aria-disabled={over ? true : undefined}
          onClick={onPause}
        >
          {copy.timer.pause}
        </button>
        <button
          type="button"
          className="ss-panel-button"
          aria-label={copy.timer.addName}
          aria-disabled={canAddTime(timer.remaining) ? undefined : true}
          onClick={onAdd}
        >
          {copy.timer.add}
        </button>
        <button
          type="button"
          className="ss-panel-button"
          aria-label={copy.timer.skipName}
          aria-disabled={over ? true : undefined}
          onClick={onSkip}
        >
          {copy.timer.skip}
        </button>
      </div>
    </div>
  );
}
