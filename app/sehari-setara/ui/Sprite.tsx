// Sprite tokoh dari strip horizontal (Architecture bagian 7; spesifikasi F-04).
import type { CSSProperties } from "react";
import type { SpriteStrip } from "../assets/manifest";
import type { CastSlot } from "../engine/types";
import { spriteBox } from "./layout";

export function Sprite({ slot, strip, animate }: { slot: CastSlot; strip: SpriteStrip; animate: boolean }) {
  const box = spriteBox(slot, strip);
  const moving = animate && strip.frames > 1;
  const style = {
    left: box.left,
    top: box.top,
    width: box.w,
    height: box.h,
    backgroundImage: `url("${strip.src}")`,
    transform: box.mirrored ? "scaleX(-1)" : undefined,
    animation: moving ? `ss-strip ${strip.frames / strip.fps}s steps(${strip.frames}) infinite` : "none",
    "--ss-strip-end": `-${strip.w * strip.frames}px`,
  } as CSSProperties;
  return <div className="ss-sprite" data-char={slot.char} data-pose={slot.pose} style={style} />;
}
