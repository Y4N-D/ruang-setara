// Sapuan blok piksel saat pergantian adegan (Design System bagian 8; spesifikasi F-05).
// 144 blok 20×20 piksel panggung berwarna langit adegan berikutnya; setiap blok terlihat 240 ms mulai jedanya.
// Lapisan ini berada di atas panggung dan di bawah garis pindai, dan tidak dipakai bila kurangi gerak aktif.
import type { TimeOfDay } from "../engine/types";
import { WIPE, wipeSchedule } from "./controls";
import { STAGE } from "./layout";

const SCHEDULE = wipeSchedule();

export function SceneWipe({ timeOfDay, scale }: { timeOfDay: TimeOfDay; scale: number }) {
  return (
    <div
      className="ss-wipe"
      data-time={timeOfDay}
      aria-hidden="true"
      style={{ width: STAGE.w, height: STAGE.h, transform: `scale(${scale})` }}
    >
      {SCHEDULE.map(({ col, row, delayMs }) => (
        <div
          key={`${col}-${row}`}
          className="ss-wipe-block"
          data-delay={delayMs}
          style={{
            left: col * WIPE.block,
            top: row * WIPE.block,
            width: WIPE.block,
            height: WIPE.block,
            animationDelay: `${delayMs}ms`,
            animationDuration: `${WIPE.showMs}ms`,
          }}
        />
      ))}
    </div>
  );
}
