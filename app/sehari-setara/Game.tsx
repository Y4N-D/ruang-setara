// Komponen akar game Sehari Setara.
// F-01: layar kerangka. F-04: pratinjau panggung lewat #adegan-N (alat tinjau, keputusan Gerbang 1 F-05 nomor 5).
// F-05: layar permainan lewat #main. F-07: alamat uji #main-3 dan #main-4 dengan tiga dan empat tim.
// Layar judul menggantikan layar kerangka dan alamat-alamat itu di F-10.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { copy } from "./content/copy";
import { SCENES } from "./content/scenes";
import { useStageScale } from "./ui/hooks";
import { parseRoute, PLAY_HASH, uiPixel, type ScreenRoute } from "./ui/layout";
import { PlayScreen } from "./ui/PlayScreen";
import { StagePreview } from "./ui/StagePreview";

// Tautan kembali ke galeri, relatif terhadap /ruang-setara/sehari-setara/ (Architecture bagian 11).
const GALLERY_HREF = "../";
const PREVIEW_START = "#adegan-1";

type Focus = "none" | "preview-title" | "preview-link" | "play-link";

function Placeholder({ focus }: { focus: Focus }) {
  const previewLinkRef = useRef<HTMLAnchorElement>(null);
  const playLinkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (focus === "preview-link") previewLinkRef.current?.focus();
    if (focus === "play-link") playLinkRef.current?.focus();
  }, [focus]);

  return (
    <main className="ss-placeholder" aria-labelledby="ss-placeholder-title">
      <h1 id="ss-placeholder-title" className="ss-placeholder-title">
        {copy.gameName}
      </h1>
      <p className="ss-placeholder-lead">{copy.placeholder.lead}</p>
      <p className="ss-placeholder-status">{copy.placeholder.status}</p>
      <div className="ss-placeholder-actions">
        <a className="ss-button" href={GALLERY_HREF}>
          {copy.backToGallery}
        </a>
        <a ref={previewLinkRef} className="ss-button" href={PREVIEW_START}>
          {copy.placeholder.previewLink}
        </a>
        <a ref={playLinkRef} className="ss-button" href={PLAY_HASH}>
          {copy.placeholder.playLink}
        </a>
      </div>
    </main>
  );
}

/** Ke mana fokus pindah saat tanda pagar berganti; null berarti fokus tidak dipindahkan Game.tsx. */
function focusAfter(before: ScreenRoute | null, next: ScreenRoute | null): Focus | null {
  if (next?.kind === "pratinjau") return before?.kind === "pratinjau" ? null : "preview-title";
  if (next === null && before?.kind === "pratinjau") return "preview-link";
  if (next === null && before?.kind === "main") return "play-link";
  return null;
}

export default function Game() {
  const screenRef = useRef<HTMLDivElement>(null);
  const scale = useStageScale(screenRef);
  const [route, setRoute] = useState<ScreenRoute | null>(() => parseRoute(window.location.hash, SCENES.length));
  const [focus, setFocus] = useState<Focus>("none");
  const previous = useRef(route);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseRoute(window.location.hash, SCENES.length);
      const moved = focusAfter(previous.current, next);
      if (moved) setFocus(moved);
      previous.current = next;
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
        {route?.kind === "main" ? (
          // Kunci per jumlah tim: pindah antara #main, #main-3, dan #main-4 memulai permainan baru.
          <PlayScreen key={`main-${route.teams}`} scale={scale} teamCount={route.teams} />
        ) : route?.kind === "pratinjau" ? (
          <StagePreview route={route.preview} focusTitle={focus === "preview-title"} scale={scale} />
        ) : (
          <Placeholder focus={focus} />
        )}
      </div>
    </div>
  );
}
