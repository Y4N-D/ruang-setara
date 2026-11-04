// Kotak narasi Sehari Setara (Design System bagian 7; spesifikasi F-05; bunyi teks dan klik F-07; prolog F-10).
// Satu komponen untuk satu layar narasi atau prolog: PlayScreen memberi key per layar, sehingga teks per huruf mulai dari
// awal. Sejak F-10 teks per huruf bisa dijeda selama dialog pengaturan terbuka, dan tekanan bisa ditahan masa tunggu.
import { useCallback, useEffect, useEffectEvent, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import { copy } from "../content/copy";
import { typedLength } from "./controls";
import { textBlipDue } from "./sound";

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
  /** Bunyi teks (F-07): dipanggil paling banyak sekali per pembaruan teks per huruf, menurut textBlipDue. */
  onTypeSound?(): void;
  /** Setiap tekanan yang diterima kotak narasi, termasuk Spasi dan Enter dari PlayScreen (F-07: bunyi klik). */
  onPress?(): void;
  /** Tulisan tombol lanjut. Bawaan "Lanjut", atau "Tampilkan pilihan" di layar terakhir; prolog memakai "Mulai adegan 1" (F-10). */
  nextLabel?: string;
  /** Teks per huruf berhenti di huruf yang sama, misalnya selama dialog pengaturan terbuka (F-10). */
  paused?: boolean;
  /** Salah selama masa tunggu: tombol lanjut ber-aria-disabled (F-10). */
  ready?: boolean;
  /** Diperiksa saat tekanan diterima; bila salah, tekanan diabaikan tanpa onPress (masa tunggu prolog, F-10). */
  canPress?(): boolean;
  ref?: Ref<NarrationHandle>;
}

export function NarrationBox({
  title,
  text,
  isLast,
  typewriter,
  onNext,
  onTypeSound,
  onPress,
  nextLabel,
  paused = false,
  ready = true,
  canPress,
  ref,
}: NarrationBoxProps) {
  const chars = useMemo(() => Array.from(text), [text]);
  const [elapsed, setElapsed] = useState(0);
  const [revealed, setRevealed] = useState(!typewriter);
  // Waktu yang sudah berlalu, agar teks berlanjut dari huruf yang sama sesudah dijeda (F-10).
  const elapsedRef = useRef(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shown = revealed ? chars.length : typedLength(elapsed, chars.length);
  const done = shown >= chars.length;

  const typeSound = useEffectEvent(() => onTypeSound?.());

  // Teks per huruf: waktu berlalu dihitung dari saat layar ini tampil, tanpa waktu selama dijeda, sampai teks lengkap
  // atau ditampilkan sekaligus. Bunyi teks dipicu dari pengatur waktu ini, bukan dari render.
  useEffect(() => {
    if (revealed || paused) return;
    const start = performance.now() - elapsedRef.current;
    let shown = typedLength(elapsedRef.current, chars.length);
    const timer = setInterval(() => {
      const ms = performance.now() - start;
      elapsedRef.current = ms;
      setElapsed(ms);
      const next = typedLength(ms, chars.length);
      if (next > shown) {
        if (textBlipDue(chars, shown, next)) typeSound();
        shown = next;
      }
      if (next >= chars.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [revealed, chars, paused]);

  // Setiap layar narasi baru memindahkan fokus ke tombol lanjut.
  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  // Teks yang masih muncul ditampilkan sekaligus; teks yang sudah lengkap berlanjut.
  const activate = useCallback(() => {
    if (canPress && !canPress()) return;
    onPress?.();
    if (done) onNext();
    else setRevealed(true);
  }, [canPress, done, onNext, onPress]);

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
          aria-disabled={ready ? undefined : true}
          onClick={(event) => {
            // Tombol berada di dalam kotak narasi; klik dihitung sekali.
            event.stopPropagation();
            activate();
          }}
        >
          {nextLabel ?? (isLast ? copy.play.showChoices : copy.play.next)}
        </button>
      </div>
    </div>
  );
}
