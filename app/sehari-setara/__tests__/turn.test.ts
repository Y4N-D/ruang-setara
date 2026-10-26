// Uji unit hitungan panel kanan: papan tim, pengatur waktu, dan bintang alasan (spesifikasi F-07, AC-18).
import { describe, expect, it } from "vitest";
import { SCENES } from "../content/scenes";
import { createInitialState, createReducer } from "../engine/reducer";
import type { GameState } from "../engine/types";
import {
  ADD_LIMIT,
  canAddTime,
  clockText,
  dueTicks,
  durationText,
  filledBlocks,
  LAST_SECONDS,
  STAR_POP_FRAMES,
  STAR_POP_MS,
  starsAnnouncement,
  teamSentence,
  TIMER_BLOCKS,
  TIMER_POLL_MS,
  timerAnnouncement,
  timerStatus,
  timerTone,
  type TimerState,
} from "../ui/turn";

const timer = (remaining: number, running = true, duration = 60): TimerState => ({ duration, remaining, running });

describe("konstanta (spesifikasi F-07)", () => {
  it("sesuai bagian Berkas dan ekspor", () => {
    expect([TIMER_BLOCKS, LAST_SECONDS, ADD_LIMIT, TIMER_POLL_MS]).toEqual([12, 10, 569, 250]);
    expect([STAR_POP_MS, STAR_POP_FRAMES]).toEqual([240, 3]);
  });

  it("pop bintang 80 ms per bingkai, di dalam rentang 120–400 ms Design System bagian 8", () => {
    expect(STAR_POP_MS / STAR_POP_FRAMES).toBe(80);
    expect(STAR_POP_MS).toBeGreaterThanOrEqual(120);
    expect(STAR_POP_MS).toBeLessThanOrEqual(400);
  });

  it("batas +30 membuat angka paling besar 9:59", () => {
    expect(clockText(ADD_LIMIT + 30)).toBe("9:59");
    expect(clockText(ADD_LIMIT + 31)).toBe("10:00");
  });
});

describe("teks waktu", () => {
  it("clockText menulis menit:detik", () => {
    const table: Array<[number, string]> = [
      [0, "0:00"],
      [5, "0:05"],
      [42, "0:42"],
      [60, "1:00"],
      [90, "1:30"],
      [599, "9:59"],
    ];
    for (const [seconds, text] of table) expect(clockText(seconds)).toBe(text);
    expect(clockText(-3)).toBe("0:00");
  });

  it("durationText menulis durasi untuk pembaca layar", () => {
    const table: Array<[number, string]> = [
      [10, "10 detik"],
      [42, "42 detik"],
      [60, "1 menit"],
      [72, "1 menit 12 detik"],
      [90, "1 menit 30 detik"],
      [120, "2 menit"],
    ];
    for (const [seconds, text] of table) expect(durationText(seconds)).toBe(text);
  });
});

describe("batang 12 blok", () => {
  it("60 detik: satu blok bernilai 5 detik, dibulatkan ke atas", () => {
    const table: Array<[number, number]> = [
      [60, 12],
      [56, 12],
      [55, 11],
      [42, 9],
      [10, 2],
      [6, 2],
      [5, 1],
      [1, 1],
      [0, 0],
    ];
    for (const [remaining, blocks] of table) expect(filledBlocks(remaining, 60)).toBe(blocks);
  });

  it("90 detik: satu blok bernilai 7,5 detik", () => {
    expect(filledBlocks(90, 90)).toBe(12);
    expect(filledBlocks(83, 90)).toBe(12);
    expect(filledBlocks(82, 90)).toBe(11);
    expect(filledBlocks(7, 90)).toBe(1);
  });

  it("sesudah +30 durasi menjadi sisa baru, sehingga batang penuh lagi", () => {
    const reducer = createReducer(SCENES);
    const start = (): GameState => ({ ...createInitialState(), phase: "discuss", timer: timer(42) });
    const added = reducer(start(), { type: "TAMBAH_30" });
    expect(added.timer).toEqual({ duration: 72, remaining: 72, running: true });
    expect(filledBlocks(added.timer.remaining, added.timer.duration)).toBe(12);
    expect(filledBlocks(66, 72)).toBe(11);
  });

  it("nilai tidak sah menghasilkan 0 dan tidak pernah lebih dari 12", () => {
    expect(filledBlocks(10, 0)).toBe(0);
    expect(filledBlocks(Number.NaN, 60)).toBe(0);
    expect(filledBlocks(-5, 60)).toBe(0);
    expect(filledBlocks(80, 60)).toBe(12);
  });
});

describe("nada dan keadaan", () => {
  it("timerTone: biasa di atas 10 detik, akhir pada 10 sampai 1 detik, habis pada 0", () => {
    expect(timerTone(60)).toBe("biasa");
    expect(timerTone(11)).toBe("biasa");
    expect(timerTone(10)).toBe("akhir");
    expect(timerTone(1)).toBe("akhir");
    expect(timerTone(0)).toBe("habis");
  });

  it("timerStatus: berjalan, dijeda, atau habis", () => {
    expect(timerStatus(timer(42, true))).toBe("berjalan");
    expect(timerStatus(timer(42, false))).toBe("dijeda");
    expect(timerStatus(timer(0, false))).toBe("habis");
    expect(timerStatus(timer(0, true))).toBe("habis");
  });

  it("canAddTime hanya sampai 569 detik", () => {
    expect(canAddTime(0)).toBe(true);
    expect(canAddTime(569)).toBe(true);
    expect(canAddTime(570)).toBe(false);
  });
});

describe("detik yang jatuh tempo", () => {
  it("dueTicks menghitung detik utuh", () => {
    const table: Array<[number, number]> = [
      [-1, 0],
      [0, 0],
      [999, 0],
      [1000, 1],
      [2999, 2],
      [10_000, 10],
      [Number.NaN, 0],
    ];
    for (const [ms, ticks] of table) expect(dueTicks(ms)).toBe(ticks);
  });
});

describe("pengumuman", () => {
  it("diskusi dimulai dengan durasi penuh", () => {
    expect(timerAnnouncement(timer(60, false), timer(60), "mulai")).toBe("Waktu diskusi 1 menit dimulai.");
    expect(timerAnnouncement(timer(90, false, 90), timer(90, true, 90), "mulai")).toBe("Waktu diskusi 1 menit 30 detik dimulai.");
    expect(timerAnnouncement(timer(30, false, 30), timer(30, true, 30), "mulai")).toBe("Waktu diskusi 30 detik dimulai.");
  });

  it("detik biasa tidak diumumkan; sepuluh detik terakhir dan habis diumumkan sekali", () => {
    for (let r = 60; r > 11; r--) expect(timerAnnouncement(timer(r), timer(r - 1), "tick")).toBeNull();
    expect(timerAnnouncement(timer(11), timer(10), "tick")).toBe("Sisa waktu 10 detik.");
    for (let r = 10; r > 1; r--) expect(timerAnnouncement(timer(r), timer(r - 1), "tick")).toBeNull();
    expect(timerAnnouncement(timer(1), timer(0, false), "tick")).toBe("Waktunya memilih.");
    expect(timerAnnouncement(timer(0, false), timer(0, false), "tick")).toBeNull();
  });

  it("beberapa detik sekaligus tetap mengumumkan peristiwa yang terlewati", () => {
    expect(timerAnnouncement(timer(12), timer(8), "tick")).toBe("Sisa waktu 8 detik.");
    expect(timerAnnouncement(timer(12), timer(0, false), "tick")).toBe("Waktunya memilih.");
  });

  it("jeda, berjalan lagi, tambah, dan lewati", () => {
    expect(timerAnnouncement(timer(42), timer(42, false), "jeda")).toBe("Waktu dijeda. Sisa 42 detik.");
    expect(timerAnnouncement(timer(42, false), timer(42), "jeda")).toBe("Waktu berjalan lagi. Sisa 42 detik.");
    expect(timerAnnouncement(timer(42), timer(72, true, 72), "tambah")).toBe("Waktu ditambah 30 detik. Sisa 1 menit 12 detik.");
    expect(timerAnnouncement(timer(0, false), timer(30, true, 60), "tambah")).toBe("Waktu ditambah 30 detik. Sisa 30 detik.");
    expect(timerAnnouncement(timer(42), timer(0, false), "lewati")).toBe("Diskusi dilewati. Waktunya memilih.");
  });

  it("aksi yang tidak mengubah apa pun tidak diumumkan", () => {
    expect(timerAnnouncement(timer(0, false), timer(0, false), "jeda")).toBeNull();
    expect(timerAnnouncement(timer(0, false), timer(0, false), "lewati")).toBeNull();
    expect(timerAnnouncement(timer(42), timer(42), "tambah")).toBeNull();
  });

  it("pengumuman bintang dan kalimat papan tim", () => {
    expect(starsAnnouncement("Tim Mangga", 2, 4)).toBe("Tim Mangga mendapat 2 bintang. Jumlah bintangnya sekarang 4.");
    expect(starsAnnouncement("Tim Laut", 0, 0)).toBe("Tim Laut mendapat 0 bintang. Jumlah bintangnya sekarang 0.");
    expect(teamSentence("Tim Mangga", true, 2)).toBe("Tim Mangga, giliran, 2 bintang.");
    expect(teamSentence("Tim Laut", false, 0)).toBe("Tim Laut, 0 bintang.");
  });
});
