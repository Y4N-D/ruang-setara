// Kotak narasi Sehari Setara (Design System bagian 7; spesifikasi F-05).
// Satu komponen untuk satu layar narasi: PlayScreen memberi key per layar, sehingga teks per huruf mulai dari awal.
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import { copy } from "../content/copy";
import { typedLength } from "./controls";

/** Pegangan untuk pintasan Spasi dan Enter di PlayScreen: sama dengan menekan tombol lanjut satu kali. */
export interface NarrationHandle {
  activate(): void;
}

interface NarrationBoxProps {
  title: string;
  text: string;
  isLast: boolean;
  typewriter: boolean;
  onNext(): void;
  ref?: Ref<NarrationHandle>;
}

export function NarrationBox({ title, text, isLast, typewriter, onNext, ref }: NarrationBoxProps) {
  const chars = useMemo(() => Array.from(text), [text]);
  const [elapsed, setElapsed] = useState(0);
  const [revealed, setRevealed] = useState(!typewriter);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shown = revealed ? chars.length : typedLength(elapsed, chars.length);
  const done = shown >= chars.length;

  // Teks per huruf: waktu berlalu dihitung dari saat layar ini tampil, sampai teks lengkap atau ditampilkan sekaligus.
  useEffect(() => {
    if (revealed) return;
    const start = performance.now();
    const timer = setInterval(() => {
      const ms = performance.now() - start;
      setElapsed(ms);
      if (typedLength(ms, chars.length) >= chars.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [revealed, chars.length]);

  // Setiap layar narasi baru memindahkan fokus ke tombol lanjut.
  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  // Teks yang masih muncul ditampilkan sekaligus; teks yang sudah lengkap berlanjut.
  const activate = useCallback(() => {
    if (done) onNext();
    else setRevealed(true);
  }, [done, onNext]);

  useImperativeHandle(ref, () => ({ activate }), [activate]);

  return (
    <div className="ss-narration-wrap">
      <p className="ss-narration-tab" aria-hidden="true">
        {title}
      </p>
      <div className="ss-narration" onClick={activate}>
        <p className="ss-narration-text" aria-hidden="true">
          {chars.slice(0, shown).join("")}
          <span className="ss-narration-rest">{chars.slice(shown).join("")}</span>
        </p>
        <button
          ref={buttonRef}
          type="button"
          className="ss-next"
          onClick={(event) => {
            // Tombol berada di dalam kotak narasi; klik dihitung sekali.
            event.stopPropagation();
            activate();
          }}
        >
          {isLast ? copy.play.showChoices : copy.play.next}
        </button>
      </div>
    </div>
  );
}
