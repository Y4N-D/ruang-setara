// Bunyi Sehari Setara (spesifikasi F-07, bagian Bunyi): aturan bunyi teks dan pemutar Web Audio.
// Aturannya murni. Pemutar menerima pembuat konteks dan pemuat berkas dari luar, sehingga bisa diuji unit dengan
// konteks tiruan (sound.test.ts). Konteks audio baru dibuat pada interaksi pertama (Architecture bagian 8), dan
// bunyi yang diminta sebelum kedua berkas siap dilewati, tidak diantre.
import { sounds, type SoundName } from "../assets/manifest";

export type { SoundName };

/** Volume bawaan 60% (Design System bagian 9). */
export const SOUND_VOLUME = 0.6;
/** Bunyi teks setiap 2 huruf, dengan laju 1,2 (nada "Tinggi"), pilihan pemilik proyek 26 Oktober 2026. */
export const TEXT_BLIP_EVERY = 2;
export const TEXT_BLIP_RATE = 1.2;
/** Bunyi klik diputar dengan laju aslinya. */
export const CLICK_RATE = 1;

const COUNTED = /^[\p{L}\p{N}]$/u;

/** Benar untuk huruf dan angka; spasi dan tanda baca tidak dihitung. */
export function isCountedLetter(char: string): boolean {
  return COUNTED.test(char);
}

/**
 * Benar bila di antara karakter yang baru muncul (indeks from sampai sebelum to) ada huruf atau angka ke-0, ke-every,
 * ke-2×every, dan seterusnya, dihitung dari awal layar. Satu pembaruan teks memutar paling banyak satu bunyi.
 */
export function textBlipDue(chars: readonly string[], from: number, to: number, every: number = TEXT_BLIP_EVERY): boolean {
  let index = 0;
  const end = Math.min(to, chars.length);
  for (let i = 0; i < end; i++) {
    if (!isCountedLetter(chars[i])) continue;
    if (i >= from && index % every === 0) return true;
    index++;
  }
  return false;
}

/** Banyak bunyi teks bila semua huruf satu layar muncul satu per satu: ⌈banyak huruf dan angka ÷ every⌉. */
export function textBlipCount(text: string, every: number = TEXT_BLIP_EVERY): number {
  return Math.ceil(Array.from(text).filter(isCountedLetter).length / every);
}

/* ------------------------------------------------------------------ */
/* Pemutar                                                             */
/* ------------------------------------------------------------------ */

/** Bagian Web Audio yang dipakai pemutar. AudioContext peramban memenuhinya; uji memakai tiruan. */
interface ParamLike {
  value: number;
}

interface NodeLike {
  connect(target: unknown): unknown;
}

interface GainLike extends NodeLike {
  readonly gain: ParamLike;
}

interface SourceLike extends NodeLike {
  buffer: unknown;
  readonly playbackRate: ParamLike;
  start(): void;
}

export interface ContextLike {
  readonly state: string;
  readonly destination: unknown;
  createGain(): GainLike;
  createBufferSource(): SourceLike;
  decodeAudioData(data: ArrayBuffer): Promise<unknown>;
  resume(): Promise<void>;
}

export interface SoundPlayerDeps {
  /** Membuat konteks audio; undefined bila peramban tidak punya Web Audio. */
  createContext(): ContextLike | undefined;
  /** Mengambil isi satu berkas bunyi. */
  load(name: SoundName): Promise<ArrayBuffer>;
}

export interface SoundPlayer {
  /** Dipanggil pada setiap interaksi: membuat konteks dan memuat berkas sekali, atau melanjutkan konteks yang ditangguhkan. */
  unlock(): void;
  /** Memutar satu bunyi bila kedua berkas sudah siap; selain itu tidak melakukan apa pun. */
  play(name: SoundName, rate?: number): void;
  ready(): boolean;
}

const NAMES = Object.keys(sounds) as SoundName[];

export function createSoundPlayer(deps: SoundPlayerDeps): SoundPlayer {
  let context: ContextLike | undefined;
  let output: GainLike | undefined;
  let failed = false;
  const buffers = new Map<SoundName, unknown>();

  const ready = () => !failed && buffers.size === NAMES.length;

  const unlock = () => {
    if (failed) return;
    if (context) {
      if (context.state === "suspended") context.resume().catch(() => undefined);
      return;
    }
    try {
      context = deps.createContext();
      if (!context) {
        failed = true;
        return;
      }
      output = context.createGain();
      output.gain.value = SOUND_VOLUME;
      output.connect(context.destination);
    } catch {
      failed = true;
      return;
    }
    const target = context;
    Promise.all(
      NAMES.map(async (name) => {
        const data = await deps.load(name);
        buffers.set(name, await target.decodeAudioData(data));
      }),
    ).catch(() => {
      failed = true;
      buffers.clear();
    });
  };

  const play = (name: SoundName, rate: number = CLICK_RATE) => {
    if (!context || !output || !ready()) return;
    try {
      const source = context.createBufferSource();
      source.buffer = buffers.get(name);
      source.playbackRate.value = rate;
      source.connect(output);
      source.start();
    } catch {
      // Bunyi yang gagal diputar tidak boleh menghentikan permainan.
    }
  };

  return { unlock, play, ready };
}

function browserContext(): ContextLike | undefined {
  const Context = typeof window === "undefined" ? undefined : window.AudioContext;
  return Context ? new Context() : undefined;
}

async function fetchSound(name: SoundName): Promise<ArrayBuffer> {
  const response = await fetch(sounds[name]);
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  return response.arrayBuffer();
}

/** Satu pemutar untuk seluruh halaman, sehingga membuka #main lagi tidak membuat konteks baru. */
export const soundPlayer: SoundPlayer = createSoundPlayer({ createContext: browserContext, load: fetchSound });
