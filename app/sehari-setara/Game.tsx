// Komponen akar game Sehari Setara.
// F-01: kerangka halaman. F-04: pratinjau panggung lewat #adegan-N, kini alat tinjau tak bertaut (keputusan Gerbang 1
// F-05 nomor 5 dan F-10 usulan 7a). F-10: alamat lain membuka permainan dari layar judul.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SCENES } from "./content/scenes";
import { useStageScale, useTitleScale } from "./ui/hooks";
import { parseRoute, uiPixel, type ScreenRoute } from "./ui/layout";
import { PlayScreen } from "./ui/PlayScreen";
import { StagePreview } from "./ui/StagePreview";

export default function Game() {
  const screenRef = useRef<HTMLDivElement>(null);
  const scale = useStageScale(screenRef);
  const titleScale = useTitleScale(screenRef);
  const [route, setRoute] = useState<ScreenRoute | null>(() => parseRoute(window.location.hash, SCENES.length));
  // Judul pratinjau berfokus bila pratinjau dibuka dari layar permainan; layar judul memfokuskan "Mulai" sendiri.
  const [focusPreview, setFocusPreview] = useState(false);
  const previous = useRef(route);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseRoute(window.location.hash, SCENES.length);
      if (next && !previous.current) setFocusPreview(true);
      previous.current = next;
      // Alamat lain yang bukan pratinjau tidak memulai ulang permainan (DRAF J-10).
      setRoute(next);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Satu piksel antarmuka untuk bingkai piksel (keputusan Gerbang 1 F-05 nomor 1).
  const screenStyle = { "--ss-px": `${uiPixel(scale)}px` } as CSSProperties;

  return (
    <div className="ss-viewport">
      <div ref={screenRef} className="ss-screen" style={screenStyle}>
        {route ? (
          <StagePreview route={route.preview} focusTitle={focusPreview} scale={scale} />
        ) : (
          <PlayScreen scale={scale} titleScale={titleScale} />
        )}
      </div>
    </div>
  );
}
