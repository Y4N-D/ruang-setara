// Komponen akar game Sehari Setara.
// F-01: layar kerangka. F-04: pratinjau panggung lewat #adegan-N (sementara, sampai alur permainan dibuat).
// Layar judul menggantikan layar kerangka di F-10.
import { useEffect, useRef, useState } from "react";
import { copy } from "./content/copy";
import { SCENES } from "./content/scenes";
import { parsePreviewHash, type PreviewRoute } from "./ui/layout";
import { StagePreview } from "./ui/StagePreview";

// Tautan kembali ke galeri, relatif terhadap /ruang-setara/sehari-setara/ (Architecture bagian 11).
const GALLERY_HREF = "../";
const PREVIEW_START = "#adegan-1";

type Focus = "none" | "preview-title" | "preview-link";

function Placeholder({ focusPreviewLink }: { focusPreviewLink: boolean }) {
  const previewLinkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (focusPreviewLink) previewLinkRef.current?.focus();
  }, [focusPreviewLink]);

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
      </div>
    </main>
  );
}

export default function Game() {
  const [route, setRoute] = useState<PreviewRoute | null>(() => parsePreviewHash(window.location.hash, SCENES.length));
  const [focus, setFocus] = useState<Focus>("none");
  const previous = useRef(route);

  useEffect(() => {
    const onHashChange = () => {
      const next = parsePreviewHash(window.location.hash, SCENES.length);
      if (previous.current === null && next) setFocus("preview-title");
      else if (previous.current !== null && !next) setFocus("preview-link");
      previous.current = next;
      setRoute(next);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="ss-viewport">
      <div className="ss-screen">
        {route ? (
          <StagePreview route={route} focusTitle={focus === "preview-title"} />
        ) : (
          <Placeholder focusPreviewLink={focus === "preview-link"} />
        )}
      </div>
    </div>
  );
}
