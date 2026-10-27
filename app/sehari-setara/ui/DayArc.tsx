// Bilah atas dengan busur hari (Design System bagian 1 dan 7; spesifikasi F-04).
// Busur adalah gambar logis 136×22 yang diskalakan dengan k panggung agar pikselnya sama tajam.
// Di layar akhir (F-09) busur tetap pada adegan 6, dan tulisan kanan menjadi "Akhir hari".
import { icons } from "../assets/manifest";
import { copy } from "../content/copy";
import type { Scene } from "../engine/types";
import { ARC, arcDotOrigin, arcPointStates, arcTrackPixels } from "./layout";

/** Garis busur sebagai satu path: piksel yang bersebelahan di baris yang sama digabung. */
const TRACK_PATH = (() => {
  const rows = new Map<number, number[]>();
  for (const [x, y] of arcTrackPixels()) rows.set(y, [...(rows.get(y) ?? []), x]);
  const parts: string[] = [];
  for (const [y, xs] of rows) {
    const sorted = [...xs].sort((a, b) => a - b);
    let start = sorted[0];
    for (let i = 1; i <= sorted.length; i++) {
      if (i === sorted.length || sorted[i] !== sorted[i - 1] + 1) {
        parts.push(`M${start} ${y}h${sorted[i - 1] - start + 1}v1h-${sorted[i - 1] - start + 1}z`);
        start = sorted[i];
      }
    }
  }
  return parts.join("");
})();

/** Lingkaran piksel 6×6 tanpa sudut, sebagai garis tepi saja. */
function ringPath(i: number): string {
  const { x, y } = arcDotOrigin(i);
  return `M${x + 1} ${y}h4v1h-4z M${x + 1} ${y + 5}h4v1h-4z M${x} ${y + 1}h1v4h-1z M${x + 5} ${y + 1}h1v4h-1z`;
}

interface DayArcProps {
  scenes: readonly Scene[];
  sceneIndex: number;
  scale: number;
  animate: boolean;
  /** Layar akhir (F-09): tulisan "Akhir hari" dan label "Pukul {jam}, akhir hari". */
  ending?: boolean;
}

export function DayArc({ scenes, sceneIndex, scale, animate, ending = false }: DayArcProps) {
  const scene = scenes[sceneIndex];
  const states = arcPointStates(sceneIndex);
  const current = ARC.points[sceneIndex];
  const icon = scene.timeOfDay === "malam" ? icons.bulan : icons.matahari;

  return (
    <div
      className="ss-topbar"
      data-time={scene.timeOfDay}
      role="img"
      aria-label={ending ? copy.topBar.endingLabel(scene.clock) : copy.topBar.label(scene.clock, sceneIndex + 1, scenes.length)}
    >
      <span className="ss-topbar-clock" aria-hidden="true">
        {scene.clock}
      </span>
      <svg
        className="ss-dayarc"
        viewBox={`0 0 ${ARC.w} ${ARC.h}`}
        width={ARC.w * scale}
        height={ARC.h * scale}
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
      >
        <path className="ss-dayarc-line" d={TRACK_PATH} />
        {ARC.points.map((_, i) =>
          states[i] === "berjalan" ? null : (
            <g key={i} className="ss-dayarc-dot" data-state={states[i]}>
              <path className="ss-dayarc-line" d={ringPath(i)} />
              {states[i] === "lewat" && (
                <rect className="ss-dayarc-fill" x={arcDotOrigin(i).x + 1} y={arcDotOrigin(i).y + 1} width={4} height={4} />
              )}
            </g>
          ),
        )}
        <image
          className="ss-dayarc-icon"
          data-animate={animate ? "ya" : "tidak"}
          data-icon={scene.timeOfDay === "malam" ? "bulan" : "matahari"}
          href={icon}
          x={current.x - 8}
          y={current.y - 8}
          width={16}
          height={16}
        />
      </svg>
      <span className="ss-topbar-counter" aria-hidden="true">
        {ending ? copy.topBar.ending : copy.topBar.counter(sceneIndex + 1, scenes.length)}
      </span>
    </div>
  );
}
