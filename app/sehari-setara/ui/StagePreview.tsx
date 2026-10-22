// Pratinjau panggung (spesifikasi F-04): dibuka lewat #adegan-N atau #adegan-N-a|b|c.
// Sejak F-05 dipertahankan sebagai alat tinjau (keputusan Gerbang 1 F-05 nomor 5). Tidak memakai mesin permainan.
// Skala panggung k diukur Game.tsx dan diteruskan lewat prop scale.
import { useEffect, useRef } from "react";
import { copy } from "../content/copy";
import { SCENES } from "../content/scenes";
import { DayArc } from "./DayArc";
import { usePrefersReducedMotion } from "./hooks";
import { previewHash, routeCast, type PreviewRoute } from "./layout";
import { preloadScene } from "./preload";
import { Stage } from "./Stage";

// Relatif terhadap /ruang-setara/sehari-setara/ (Architecture bagian 11).
const GALLERY_HREF = "../";
const VIEWS: ReadonlyArray<PreviewRoute["view"]> = ["situasi", "A", "B", "C"];

export function StagePreview({ route, focusTitle, scale }: { route: PreviewRoute; focusTitle: boolean; scale: number }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const animate = !usePrefersReducedMotion();
  const scene = SCENES[route.sceneIndex];
  const { cast, emote } = routeCast(scene, route.view);
  const label = route.view === "situasi" ? scene.altText : `${scene.altText} ${copy.preview.stageReaction(route.view)}`;
  const status = route.view === "situasi" ? copy.preview.statusSituation : copy.preview.statusReaction(route.view);

  useEffect(() => {
    if (focusTitle) titleRef.current?.focus();
  }, [focusTitle]);

  useEffect(() => {
    const next = SCENES[route.sceneIndex + 1];
    if (next) preloadScene(next);
  }, [route.sceneIndex]);

  return (
    <main className="ss-preview" aria-labelledby="ss-preview-title">
      <DayArc scenes={SCENES} sceneIndex={route.sceneIndex} scale={scale} animate={animate} />
      <div className="ss-stage-area">
        <Stage scene={scene} cast={cast} emote={emote} scale={scale} animate={animate} label={label} />
      </div>
      <div className="ss-preview-panel">
        <div className="ss-preview-heading">
          <h1 id="ss-preview-title" ref={titleRef} tabIndex={-1} className="ss-preview-title">
            {scene.title}
          </h1>
          <p className="ss-preview-status">{status}</p>
        </div>
        <nav className="ss-preview-nav" aria-label={copy.preview.nav}>
          <div className="ss-preview-row">
            <div className="ss-preview-group" role="group" aria-labelledby="ss-preview-group-scene">
              <span id="ss-preview-group-scene" className="ss-preview-label">
                {copy.preview.sceneGroup}
              </span>
              {SCENES.map((s, i) => (
                <a
                  key={s.id}
                  className="ss-chip"
                  href={previewHash({ sceneIndex: i, view: "situasi" })}
                  aria-label={copy.preview.sceneChip(i + 1, s.title)}
                  aria-current={i === route.sceneIndex ? "page" : undefined}
                >
                  {i + 1}
                </a>
              ))}
            </div>
            <div className="ss-preview-group" role="group" aria-labelledby="ss-preview-group-view">
              <span id="ss-preview-group-view" className="ss-preview-label">
                {copy.preview.viewGroup}
              </span>
              {VIEWS.map((view) => (
                <a
                  key={view}
                  className="ss-chip"
                  href={previewHash({ sceneIndex: route.sceneIndex, view })}
                  aria-current={view === route.view ? "page" : undefined}
                >
                  {view === "situasi" ? copy.preview.situation : copy.preview.reaction(view)}
                </a>
              ))}
            </div>
          </div>
          <div className="ss-preview-row">
            <a className="ss-chip" href="#">
              {copy.preview.close}
            </a>
            <a className="ss-chip" href={GALLERY_HREF}>
              {copy.backToGallery}
            </a>
          </div>
        </nav>
      </div>
    </main>
  );
}
