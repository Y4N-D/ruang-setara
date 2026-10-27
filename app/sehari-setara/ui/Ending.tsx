// Layar akhir (Design System bagian 7, "Layar akhir"; spesifikasi F-09): ilustrasi akhir dan timbangan D-10 di bingkai
// panggung F-04, lalu judul, pesan, dan "Lihat rekap" di panel bawah. Masa tunggu dan kelanjutan diatur PlayScreen.
import { useEffect, useRef } from "react";
import { endings, iconStrips } from "../assets/manifest";
import { copy } from "../content/copy";
import { ENDINGS } from "../content/endings";
import type { EndingId } from "../engine/types";
import { SCALE_BOX, scaleSentence, type ScaleView } from "./closing";
import { STAGE } from "./layout";

interface EndingStageProps {
  id: EndingId;
  view: ScaleView;
  scale: number;
  /** Benar tanpa kurangi gerak: timbangan berayun sekali lewat animasi CSS ss-scale-{gerak}. */
  animate: boolean;
}

/** Bingkai panggung layar akhir: latar ilustrasi akhir tanpa tokoh, timbangan di lapisan 30, garis pindai dan vinyet F-04. */
export function EndingStage({ id, view, scale, animate }: EndingStageProps) {
  const strip = iconStrips.timbangan;
  return (
    <div
      className="ss-stage-frame"
      role="img"
      aria-label={`${ENDINGS[id].alt} ${scaleSentence(view)}`}
      style={{ width: STAGE.w * scale, height: STAGE.h * scale }}
    >
      <div className="ss-stage" style={{ transform: `scale(${scale})` }}>
        <div className="ss-stage-bg" style={{ backgroundImage: `url("${endings[id]}")` }} />
        <div
          className="ss-scale"
          aria-hidden="true"
          data-bingkai={view.frame}
          data-gerak={animate ? view.motion : undefined}
          style={{
            left: SCALE_BOX.left,
            top: SCALE_BOX.top,
            width: SCALE_BOX.w,
            height: SCALE_BOX.h,
            backgroundImage: `url("${strip.src}")`,
            backgroundSize: `${strip.w * strip.frames}px ${strip.h}px`,
            backgroundPositionX: `${-strip.w * view.frame}px`,
          }}
        />
      </div>
    </div>
  );
}

interface EndingPanelProps {
  id: EndingId;
  /** Benar sesudah masa tunggu; sebelum itu "Lihat rekap" ber-aria-disabled. Waktu tetap diperiksa PlayScreen saat ditekan. */
  ready: boolean;
  onNext(): void;
}

/** Panel bawah layar akhir: judul (berfokus sekali saat tampil), dua kalimat pesan, dan "Lihat rekap". */
export function EndingPanel({ id, ready, onNext }: EndingPanelProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ending = ENDINGS[id];

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <div className="ss-ending">
      <h2 ref={titleRef} tabIndex={-1} className="ss-ending-title">
        {ending.title}
      </h2>
      <p className="ss-ending-message">{ending.message.join(" ")}</p>
      <button type="button" className="ss-next" aria-disabled={ready ? undefined : true} onClick={onNext}>
        {copy.closing.ending.next}
      </button>
    </div>
  );
}
