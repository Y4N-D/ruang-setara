// Tombol "Pengaturan" di bilah atas, dialog pengaturan, dan lapisan bening Sehari Setara (spesifikasi F-10), serta tombol
// pilihan yang juga dipakai pengaturan kelas. Isi dialog mengikuti settingsView; perubahan, bunyi, fokus kembali, dan
// masa lapisan diatur PlayScreen. Dialog mengunci fokus di dalamnya.
import { useEffect, useRef, type KeyboardEvent, type ReactNode, type Ref } from "react";
import { copy } from "../content/copy";
import type { Settings } from "../engine/types";
import { DISCUSS_CHOICES, type SettingsView } from "./opening";

const text = copy.settings;

interface OptionProps {
  label: string;
  pressed: boolean;
  /** Masa tunggu: aria-disabled dengan tampilan biasa; PlayScreen memeriksa waktunya saat tekanan diterima. */
  waiting?: boolean;
  /** Terkunci (kurangi gerak dari komputer): latar mist, teks dusk, dan tekanan diabaikan. */
  locked?: boolean;
  onPress(): void;
}

/** Tombol pilihan dengan aria-pressed (spesifikasi F-10): pengaturan kelas dan dialog pengaturan. */
export function Option({ label, pressed, waiting = false, locked = false, onPress }: OptionProps) {
  return (
    <button
      type="button"
      className="ss-button ss-option"
      aria-pressed={pressed}
      aria-disabled={locked || waiting ? true : undefined}
      data-nonaktif={locked ? "" : undefined}
      onClick={() => {
        if (!locked) onPress();
      }}
    >
      {label}
    </button>
  );
}

/** Tombol "Pengaturan" di bilah atas; nonaktif di fase yang tidak membolehkan dialog (usulan 5a). */
export function SettingsButton({ disabled, onOpen, ref }: { disabled: boolean; onOpen(): void; ref?: Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={ref}
      type="button"
      className="ss-button ss-settings-button"
      aria-disabled={disabled ? true : undefined}
      data-nonaktif={disabled ? "" : undefined}
      onClick={() => {
        if (!disabled) onOpen();
      }}
    >
      {text.open}
    </button>
  );
}

/** Lapisan bening di bawah dialog: menahan klik tanpa menutup dialog dan tanpa memindah fokus (DRAF J-1 dan J-2). */
export function SettingsLayer() {
  return <div className="ss-settings-layer" aria-hidden="true" onMouseDown={(event) => event.preventDefault()} />;
}

function Row({ id, label, note, children }: { id: string; label: string; note?: string; children: ReactNode }) {
  const labelId = `ss-settings-${id}`;
  const noteId = `${labelId}-catatan`;
  return (
    <>
      <p id={labelId} className="ss-settings-label">
        {label}
      </p>
      <div className="ss-settings-cell">
        <div className="ss-options" role="group" aria-labelledby={labelId} aria-describedby={note ? noteId : undefined}>
          {children}
        </div>
        {note && (
          <p id={noteId} className="ss-settings-note">
            {note}
          </p>
        )}
      </div>
    </>
  );
}

interface SettingsDialogProps {
  view: SettingsView;
  onSound(on: boolean): void;
  onMotion(on: boolean): void;
  onTypewriter(on: boolean): void;
  onSeconds(seconds: Settings["discussSeconds"]): void;
  onClose(): void;
}

export function SettingsDialog({ view, onSound, onMotion, onTypewriter, onSeconds, onClose }: SettingsDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Saat dialog tampil, fokus pindah ke judulnya.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    // Tombol yang ditahan: pengulangan Enter dan Spasi dibatalkan, agar tidak menekan tombol berulang kali (DRAF J-11).
    if (event.repeat && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      return;
    }
    if (event.key !== "Tab") return;
    // Fokus terkunci di kesepuluh tombol dialog, termasuk tombol yang terkunci.
    const items = [...(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const current = items.find((item) => item === document.activeElement);
    if (!current) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    }
  };

  const onOff = (value: boolean, change: (on: boolean) => void, locked = false) => (
    <>
      <Option label={copy.options.on} pressed={value} locked={locked} onPress={() => change(true)} />
      <Option label={copy.options.off} pressed={!value} locked={locked} onPress={() => change(false)} />
    </>
  );

  return (
    <section
      ref={dialogRef}
      className="ss-settings"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ss-settings-title"
      // Bisa difokus lewat kode: klik di ruang kosong dialog membuat fokus tetap di dalam dialog.
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <h2 id="ss-settings-title" ref={titleRef} tabIndex={-1} className="ss-settings-title">
        {text.title}
      </h2>
      <div className="ss-settings-rows">
        <Row id="suara" label={text.sound}>
          {onOff(view.sound, onSound)}
        </Row>
        <Row id="gerak" label={text.motion} note={view.motion.locked ? text.notes.motionSystem : undefined}>
          {onOff(view.motion.on, onMotion, view.motion.locked)}
        </Row>
        <Row id="teks" label={text.typewriter} note={view.typewriter.note ? text.notes.typewriterReduced : undefined}>
          {onOff(view.typewriter.on, onTypewriter)}
        </Row>
        <Row id="durasi" label={text.seconds} note={text.notes.seconds}>
          {DISCUSS_CHOICES.map((seconds) => (
            <Option key={seconds} label={copy.options.seconds(seconds)} pressed={view.seconds === seconds} onPress={() => onSeconds(seconds)} />
          ))}
        </Row>
      </div>
      <div className="ss-settings-foot">
        <button type="button" className="ss-button" onClick={onClose}>
          {text.close}
        </button>
      </div>
    </section>
  );
}
