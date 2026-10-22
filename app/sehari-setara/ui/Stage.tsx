// Panggung logis 320×180 yang diskalakan (Design System bagian 3 dan 6; Architecture bagian 7; spesifikasi F-04).
// Lapisan: latar 0, bayangan kaki dan tokoh 20, ikon emosi 30, vinyet dan garis pindai 40.
import { backgroundFor, emoteIcons, shadowFor, spriteFor } from "../assets/manifest";
import type { CastSlot, Choice, Scene } from "../engine/types";
import { emoteBox, shadowBox, STAGE } from "./layout";
import { Sprite } from "./Sprite";

interface StageProps {
  scene: Scene;
  cast: readonly CastSlot[];
  emote?: Choice["emote"];
  scale: number;
  animate: boolean;
  label: string;
}

export function Stage({ scene, cast, emote, scale, animate, label }: StageProps) {
  const background = backgroundFor(scene.bg);
  const tone = shadowFor(scene.bg);
  const placed = cast.flatMap((slot) => {
    const strip = spriteFor(slot.char, slot.pose);
    return strip ? [{ slot, strip }] : [];
  });
  const target = emote ? placed.find(({ slot }) => slot.char === emote.char) : undefined;
  const emoteAt = target ? emoteBox(target.slot, target.strip) : undefined;

  return (
    <div className="ss-stage-frame" role="img" aria-label={label} style={{ width: STAGE.w * scale, height: STAGE.h * scale }}>
      <div className="ss-stage" style={{ transform: `scale(${scale})` }}>
        {background && <div className="ss-stage-bg" style={{ backgroundImage: `url("${background}")` }} />}
        {placed.map(({ slot, strip }, i) => {
          const box = shadowBox(slot, strip);
          return (
            <div
              key={`bayangan-${i}`}
              className="ss-shadow"
              data-tone={tone}
              style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
            />
          );
        })}
        {placed.map(({ slot, strip }, i) => (
          <Sprite key={`tokoh-${i}`} slot={slot} strip={strip} animate={animate} />
        ))}
        {emote && emoteAt && (
          <div
            className="ss-emote"
            data-icon={emote.icon}
            style={{ left: emoteAt.left, top: emoteAt.top, backgroundImage: `url("${emoteIcons[emote.icon]}")` }}
          />
        )}
      </div>
    </div>
  );
}
