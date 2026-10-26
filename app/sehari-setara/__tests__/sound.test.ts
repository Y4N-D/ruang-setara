// Uji unit aturan bunyi dan pemutar bunyi (spesifikasi F-07, bagian Bunyi, AC-18).
// Pemutar diuji dengan konteks audio tiruan, karena uji berjalan di Node tanpa Web Audio.
import { describe, expect, it } from "vitest";
import { sounds } from "../assets/manifest";
import { SCENES } from "../content/scenes";
import { typedLength } from "../ui/controls";
import {
  CLICK_RATE,
  createSoundPlayer,
  isCountedLetter,
  SOUND_VOLUME,
  TEXT_BLIP_EVERY,
  TEXT_BLIP_RATE,
  textBlipCount,
  textBlipDue,
  type ContextLike,
  type SoundName,
} from "../ui/sound";

describe("konstanta (spesifikasi F-07)", () => {
  it("volume 60%, bunyi teks setiap 2 huruf dengan laju 1,2, klik dengan laju 1", () => {
    expect([SOUND_VOLUME, TEXT_BLIP_EVERY, TEXT_BLIP_RATE, CLICK_RATE]).toEqual([0.6, 2, 1.2, 1]);
  });

  it("manifest punya tepat dua bunyi", () => {
    expect(Object.keys(sounds).sort()).toEqual(["klik", "teks"]);
  });
});

describe("huruf yang dihitung", () => {
  it("huruf dan angka dihitung; spasi dan tanda baca tidak", () => {
    for (const char of ["a", "Z", "é", "3", "0"]) expect(isCountedLetter(char)).toBe(true);
    for (const char of [" ", ".", ",", "“", "”", "—", "-", "?", "(", ""]) expect(isCountedLetter(char)).toBe(false);
  });
});

describe("bunyi teks", () => {
  // Huruf dan angka ke-0 sampai ke-4: I, b, u, y, a. Bunyi untuk ke-0, ke-2, dan ke-4 (indeks karakter 0, 2, 6).
  const chars = Array.from("Ibu, ya.");

  it("berbunyi saat huruf ke-0, ke-2, ke-4, dan seterusnya muncul", () => {
    const due = chars.map((_, i) => textBlipDue(chars, i, i + 1));
    expect(due).toEqual([true, false, true, false, false, false, true, false]);
  });

  it("beberapa huruf yang muncul sekaligus menghasilkan paling banyak satu bunyi", () => {
    expect(textBlipDue(chars, 0, chars.length)).toBe(true);
    expect(textBlipDue(chars, 3, 6)).toBe(false);
    expect(textBlipDue(chars, 5, 7)).toBe(true);
    expect(textBlipDue(chars, 2, 2)).toBe(false);
  });

  it("setiap 3 huruf bila diminta", () => {
    expect(chars.map((_, i) => textBlipDue(chars, i, i + 1, 3))).toEqual([true, false, false, false, false, true, false, false]);
  });

  it("textBlipCount: ⌈banyak huruf dan angka ÷ 2⌉", () => {
    expect(textBlipCount("Ibu, ya.")).toBe(3);
    expect(textBlipCount("Ibu, ya.", 3)).toBe(2);
    expect(textBlipCount(SCENES[0].narration[0])).toBe(33);
    expect(textBlipCount(SCENES[0].narration[1])).toBe(40);
  });

  it("pada pembaruan 30 ms dan 40 huruf per detik, setiap layar narasi naskah berbunyi sebanyak textBlipCount", () => {
    const screens = new Set<string>();
    for (const scene of SCENES) {
      for (const text of scene.narration) screens.add(text);
      for (const text of [...(scene.narrationIfFlag?.present ?? []), ...(scene.narrationIfFlag?.absent ?? [])]) screens.add(text);
    }
    expect(screens.size).toBe(9);
    let total = 0;
    for (const text of screens) {
      const letters = Array.from(text);
      let shown = 0;
      let blips = 0;
      for (let t = 30; shown < letters.length; t += 30) {
        const next = typedLength(t, letters.length);
        if (next > shown && textBlipDue(letters, shown, next)) blips++;
        shown = next;
      }
      expect(blips, text).toBe(textBlipCount(text));
      total += blips;
    }
    expect(total).toBe(424);
  });
});

/* ------------------------------------------------------------------ */
/* Pemutar bunyi dengan konteks tiruan                                  */
/* ------------------------------------------------------------------ */

class FakeParam {
  value = 1;
}

class FakeNode {
  readonly connections: unknown[] = [];
  connect(target: unknown) {
    this.connections.push(target);
    return target;
  }
}

class FakeGain extends FakeNode {
  readonly gain = new FakeParam();
}

class FakeSource extends FakeNode {
  buffer: unknown = null;
  readonly playbackRate = new FakeParam();
  started = 0;
  start() {
    this.started++;
  }
}

class FakeContext implements ContextLike {
  state = "running";
  readonly destination = { nama: "tujuan" };
  readonly gains: FakeGain[] = [];
  readonly sources: FakeSource[] = [];
  resumed = 0;
  decodeFails = false;
  createGain() {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }
  createBufferSource() {
    const source = new FakeSource();
    this.sources.push(source);
    return source;
  }
  decodeAudioData(data: ArrayBuffer) {
    return this.decodeFails ? Promise.reject(new Error("decode")) : Promise.resolve({ isi: new Uint8Array(data)[0] });
  }
  resume() {
    this.resumed++;
    this.state = "running";
    return Promise.resolve();
  }
}

const MARK: Record<SoundName, number> = { klik: 1, teks: 2 };
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function setup(options: { noContext?: boolean; loadFails?: boolean; decodeFails?: boolean; state?: string } = {}) {
  const contexts: FakeContext[] = [];
  const loads: SoundName[] = [];
  const player = createSoundPlayer({
    createContext: () => {
      if (options.noContext) return undefined;
      const context = new FakeContext();
      context.state = options.state ?? "running";
      context.decodeFails = options.decodeFails ?? false;
      contexts.push(context);
      return context;
    },
    load: (name) => {
      loads.push(name);
      return options.loadFails ? Promise.reject(new Error("404")) : Promise.resolve(new Uint8Array([MARK[name]]).buffer);
    },
  });
  return { player, contexts, loads };
}

describe("pemutar bunyi", () => {
  it("tidak membuat konteks sebelum unlock", () => {
    const { player, contexts, loads } = setup();
    player.play("klik");
    expect(contexts).toHaveLength(0);
    expect(loads).toEqual([]);
    expect(player.ready()).toBe(false);
  });

  it("unlock membuat satu konteks dengan GainNode 0,6 dan memuat kedua berkas sekali", async () => {
    const { player, contexts, loads } = setup();
    player.unlock();
    player.unlock();
    expect(contexts).toHaveLength(1);
    const [context] = contexts;
    expect(context.gains).toHaveLength(1);
    expect(context.gains[0].gain.value).toBe(0.6);
    expect(context.gains[0].connections).toEqual([context.destination]);
    expect([...loads].sort()).toEqual(["klik", "teks"]);
    await settle();
    expect(player.ready()).toBe(true);
    player.unlock();
    expect(contexts).toHaveLength(1);
    expect(loads).toHaveLength(2);
  });

  it("bunyi sebelum siap dilewati, tidak diantre", async () => {
    const { player, contexts } = setup();
    player.unlock();
    player.play("klik");
    expect(contexts[0].sources).toHaveLength(0);
    await settle();
    expect(contexts[0].sources).toHaveLength(0);
  });

  it("sesudah siap, setiap play memutar satu bunyi dengan laju yang diminta lewat GainNode", async () => {
    const { player, contexts } = setup();
    player.unlock();
    await settle();
    player.play("klik", CLICK_RATE);
    player.play("teks", TEXT_BLIP_RATE);
    const [context] = contexts;
    expect(context.sources.map((s) => [s.buffer, s.playbackRate.value, s.started])).toEqual([
      [{ isi: 1 }, 1, 1],
      [{ isi: 2 }, 1.2, 1],
    ]);
    for (const source of context.sources) expect(source.connections).toEqual([context.gains[0]]);
  });

  it("konteks yang ditangguhkan dilanjutkan pada unlock berikutnya", async () => {
    const { player, contexts } = setup({ state: "suspended" });
    player.unlock();
    expect(contexts[0].resumed).toBe(0);
    player.unlock();
    expect(contexts[0].resumed).toBe(1);
    expect(contexts[0].state).toBe("running");
    await settle();
    player.unlock();
    expect(contexts[0].resumed).toBe(1);
  });

  it("tanpa Web Audio, berkas gagal dimuat, atau decode gagal: tanpa bunyi, tanpa pengecualian, tanpa mencoba ulang", async () => {
    for (const options of [{ noContext: true }, { loadFails: true }, { decodeFails: true }]) {
      const { player, contexts, loads } = setup(options);
      expect(() => player.unlock()).not.toThrow();
      await settle();
      expect(player.ready()).toBe(false);
      expect(() => player.play("klik")).not.toThrow();
      for (const context of contexts) expect(context.sources).toHaveLength(0);
      const created = contexts.length;
      const loaded = loads.length;
      player.unlock();
      await settle();
      expect(contexts).toHaveLength(created);
      expect(loads).toHaveLength(loaded);
    }
  });
});
