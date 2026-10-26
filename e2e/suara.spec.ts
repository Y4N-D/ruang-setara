// Uji ujung ke ujung bunyi klik dan bunyi teks Sehari Setara (spesifikasi F-07, bagian Bunyi; Rencana uji langkah 3, 4,
// dan 6). Perekam bunyi di berkas ini adalah skrip awal halaman milik uji, bukan kode game: ia membungkus konstruktor
// AudioContext, decodeAudioData, AudioNode.prototype.connect, dan AudioBufferSourceNode.prototype.start, lalu mencatat
// waktu jam uji, laju, panjang bunyi, keadaan konteks, dan sambungan. Bunyi dibedakan dari panjangnya: klik 45 ms dan
// teks 32 ms. Jam uji dijeda sebelum halaman dimuat, sehingga teks per huruf hanya maju lewat page.clock.runFor.
import { expect, test, type Page } from "@playwright/test";
import { SCENES } from "../app/sehari-setara/content/scenes";
import { typedLength } from "../app/sehari-setara/ui/controls";
import { awardPrompt, cardNext, expectClean, VIEWPORTS, watch } from "./bantuan";

const T0 = new Date("2026-10-26T09:00:00+08:00").getTime();

interface Played {
  at: number;
  rate: number;
  duration: number;
  state: string;
}

interface SoundLog {
  contexts: number;
  states: string[];
  decoded: number[];
  plays: Played[];
  links: string[];
}

/** Perekam bunyi; dijalankan di halaman sebelum kode game (page.addInitScript). */
function installRecorder() {
  const record = { contexts: [] as AudioContext[], decoded: [] as number[], plays: [] as Played[], links: [] as string[] };
  (window as unknown as { ssBunyi: typeof record }).ssBunyi = record;
  const Original = window.AudioContext;
  if (!Original) return;
  class Recorded extends Original {
    constructor(options?: AudioContextOptions) {
      super(options);
      record.contexts.push(this);
    }
  }
  window.AudioContext = Recorded;

  const decode = BaseAudioContext.prototype.decodeAudioData;
  BaseAudioContext.prototype.decodeAudioData = function (this: BaseAudioContext, data: ArrayBuffer) {
    return decode.call(this, data).then((buffer) => {
      record.decoded.push(buffer.duration);
      return buffer;
    });
  };

  const gainNames = new WeakMap<object, string>();
  const label = (node: unknown) => {
    if (node instanceof AudioDestinationNode) return "tujuan";
    if (node instanceof GainNode) {
      let name = gainNames.get(node);
      if (!name) {
        name = `gain${record.links.filter((link) => link.startsWith("gain")).length + 1}`;
        gainNames.set(node, name);
      }
      return `${name}(${Math.round(node.gain.value * 1000) / 1000})`;
    }
    if (node instanceof AudioBufferSourceNode) return "sumber";
    return "lain";
  };
  const nodeProto = AudioNode.prototype as unknown as { connect: (...args: unknown[]) => unknown };
  const connect = nodeProto.connect;
  nodeProto.connect = function (this: AudioNode, ...args: unknown[]) {
    record.links.push(`${label(this)}->${label(args[0])}`);
    return connect.apply(this, args);
  };

  const sourceProto = AudioBufferSourceNode.prototype as unknown as { start: (...args: unknown[]) => void };
  const start = sourceProto.start;
  sourceProto.start = function (this: AudioBufferSourceNode, ...args: unknown[]) {
    record.plays.push({
      at: performance.now(),
      rate: this.playbackRate.value,
      duration: this.buffer?.duration ?? 0,
      state: this.context.state,
    });
    return start.apply(this, args);
  };
}

const soundLog = (page: Page): Promise<SoundLog> =>
  page.evaluate(() => {
    const record = (window as unknown as { ssBunyi: { contexts: AudioContext[]; decoded: number[]; plays: Played[]; links: string[] } }).ssBunyi;
    return {
      contexts: record.contexts.length,
      states: record.contexts.map((context) => context.state),
      decoded: [...record.decoded],
      plays: [...record.plays],
      links: [...record.links],
    };
  });
const clicks = (log: SoundLog) => log.plays.filter((played) => played.duration > 0.04);
const blips = (log: SoundLog) => log.plays.filter((played) => played.duration <= 0.04);

const status = (page: Page) => page.locator('.ss-play [role="status"]');
const narrationNext = (page: Page) => page.locator(".ss-narration .ss-next");
const pauseButton = (page: Page) => page.getByRole("button", { name: "Jeda", exact: true });
const addButton = (page: Page) => page.getByRole("button", { name: "+30 detik", exact: true });
const setHash = (page: Page, hash: string) =>
  page.evaluate((target) => {
    window.location.hash = target;
  }, hash);

/** Membuka #main dengan perekam bunyi dan jam uji yang dijeda sejak sebelum halaman dimuat. */
async function openPlay(page: Page, reduce = false) {
  const { width, height } = VIEWPORTS["1280x720"];
  await page.addInitScript(installRecorder);
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: reduce ? "reduce" : "no-preference" });
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(T0 + 60_000);
  await page.goto("sehari-setara/#main");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".ss-narration")).toBeVisible();
}

/** Tekanan pembuka x (tidak berpengaruh pada permainan), lalu menunggu konteks berjalan dan kedua berkas siap. */
async function unlock(page: Page) {
  await page.keyboard.press("x");
  await expect.poll(async () => (await soundLog(page)).decoded.length).toBe(2);
  await expect.poll(async () => (await soundLog(page)).states).toEqual(["running"]);
}

async function expectClicks(page: Page, count: number, note: string) {
  expect(clicks(await soundLog(page)), note).toHaveLength(count);
}

/**
 * Salinan aturan textBlipDue di ui/sound.ts: huruf dan angka ke-0, ke-2, ke-4, dan seterusnya berbunyi, paling banyak
 * sekali per pembaruan. Uji ini tidak bisa mengimpor ui/sound.ts, karena berkas itu mengimpor manifest gambar dan bunyi
 * yang tidak bisa dimuat pemuat uji Playwright; aturan aslinya diuji unit di sound.test.ts.
 */
function blipDue(chars: readonly string[], from: number, to: number) {
  let index = 0;
  for (let i = 0; i < Math.min(to, chars.length); i++) {
    if (!/^[\p{L}\p{N}]$/u.test(chars[i])) continue;
    if (i >= from && index % 2 === 0) return true;
    index++;
  }
  return false;
}

/** Simulasi pembaruan teks per huruf 30 ms (F-05): waktu setiap bunyi teks sejak layar tampil, dalam ms. */
function blipSchedule(text: string, untilMs = Number.POSITIVE_INFINITY) {
  const chars = Array.from(text);
  const times: number[] = [];
  let shown = 0;
  for (let ms = 30; shown < chars.length && ms <= untilMs; ms += 30) {
    const next = typedLength(ms, chars.length);
    if (next > shown) {
      if (blipDue(chars, shown, next)) times.push(ms);
      shown = next;
    }
  }
  return times;
}

/** Satu adegan dengan keyboard sampai pergantian adegan selesai (400 ms sapuan). */
async function playScene(page: Page) {
  while ((await page.locator(".ss-question").count()) === 0) await page.keyboard.press("Space");
  await page.keyboard.press("B");
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  await page.keyboard.press("1");
  await page.clock.runFor(400);
}

test("pemuatan bunyi: tanpa konteks sebelum tekanan pertama, satu konteks dan dua berkas sesudahnya (AC-12)", async ({ page }) => {
  const log = watch(page);
  const wav: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith(".wav")) wav.push(request.url());
  });
  const responses: string[] = [];
  page.on("response", (response) => {
    const path = new URL(response.url()).pathname;
    if (path.endsWith(".wav")) responses.push(`${response.status()} ${path}`);
  });
  await page.addInitScript(installRecorder);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("sehari-setara/");
  await page.evaluate(() => document.fonts.ready);

  // Layar kerangka dan pratinjau: tekanan dan klik tidak membuat konteks.
  for (const key of ["x", "m", "Tab"]) await page.keyboard.press(key);
  await page.mouse.click(5, 5);
  await setHash(page, "#adegan-1");
  await expect(page.locator("#ss-preview-title")).toBeVisible();
  for (const key of ["x", "m", "Space"]) await page.keyboard.press(key);
  await page.mouse.click(5, 5);
  expect((await soundLog(page)).contexts).toBe(0);
  expect(wav).toEqual([]);

  // #main sebelum tekanan pertama: tidak ada konteks dan tidak ada permintaan .wav.
  await setHash(page, "#main");
  await expect(page.locator(".ss-narration")).toBeVisible();
  await page.waitForTimeout(500);
  expect((await soundLog(page)).contexts).toBe(0);
  expect(wav).toEqual([]);

  // Tekanan pertama: satu konteks berjalan dan tepat dua permintaan .wav berstatus 200 di /ruang-setara/assets/.
  await unlock(page);
  await expect.poll(() => responses.length).toBe(2);
  expect([...responses].sort()).toEqual([
    expect.stringMatching(/^200 \/ruang-setara\/assets\/sfx_klik-[\w-]+\.wav$/),
    expect.stringMatching(/^200 \/ruang-setara\/assets\/sfx_teks-[\w-]+\.wav$/),
  ]);
  await page.keyboard.press("Space");
  await expect.poll(async () => clicks(await soundLog(page)).length).toBeGreaterThanOrEqual(1);

  // Kembali ke layar kerangka lalu membuka #main lagi: konteks dan berkas tidak bertambah, bunyi tetap siap.
  await setHash(page, "");
  await expect(page.locator(".ss-placeholder")).toBeVisible();
  await setHash(page, "#main");
  await expect(page.locator(".ss-narration")).toBeVisible();
  const before = clicks(await soundLog(page)).length;
  await page.keyboard.press("Space");
  await expect.poll(async () => clicks(await soundLog(page)).length).toBe(before + 1);
  const after = await soundLog(page);
  expect([after.contexts, after.decoded.length, wav.length]).toEqual([1, 2, 2]);
  expect(after.states).toEqual(["running"]);
  expectClean(log);
});

test("bunyi klik dengan keyboard: sepuluh tekanan diterima di adegan 1, tekanan lain tanpa bunyi (AC-13)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page);
  await unlock(page);
  await expectClicks(page, 0, "tekanan pembuka x");

  // Spasi empat kali sampai pertanyaan tampil: tampilkan sekaligus, layar 2, tampilkan sekaligus, pertanyaan.
  for (let i = 0; i < 4; i++) await page.keyboard.press("Space");
  await expect(page.locator(".ss-question")).toBeFocused();
  await expectClicks(page, 4, "narasi");

  // Tekanan tanpa pengaruh di fase diskusi: tombol lain, Ctrl/Alt/Meta, dan tekanan berulang.
  for (const combo of ["4", "d", "0", "Control+2", "Alt+p", "Meta+t"]) await page.keyboard.press(combo);
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "p", repeat: true, bubbles: true }));
  });
  await expectClicks(page, 4, "tekanan tanpa pengaruh");

  for (const key of ["p", "p", "t"]) await page.keyboard.press(key);
  await expectClicks(page, 7, "jeda, lanjut, tambah");
  await page.keyboard.press("2");
  await expectClicks(page, 8, "memilih");
  await page.keyboard.press("Space");
  await page.keyboard.press("1");
  await expectClicks(page, 8, "reaksi");
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await page.keyboard.press("Space");
  await expectClicks(page, 8, "masa tunggu kartu");
  await page.clock.runFor(600);
  await page.keyboard.press("Space");
  await expect(awardPrompt(page)).toBeFocused();
  await expectClicks(page, 9, "Lanjut kartu");
  await page.keyboard.press("Space");
  await expectClicks(page, 9, "Spasi di fase bintang");
  await page.keyboard.press("2");
  await expect(page.locator(".ss-wipe")).toHaveCount(1);
  await page.keyboard.press("Space");
  await page.keyboard.press("2");
  await expectClicks(page, 10, "bintang dan sapuan");
  await page.clock.runFor(400);

  const all = clicks(await soundLog(page));
  expect(all).toHaveLength(10);
  for (const played of all) {
    expect(played.duration).toBeCloseTo(0.045, 3);
    expect(played.rate).toBe(1);
    expect(played.state).toBe("running");
  }
  expectClean(log);
});

test("bunyi klik dengan tetikus: jalur yang sama, jumlah klik yang sama (AC-13)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page);
  await unlock(page);
  for (let i = 0; i < 4; i++) await narrationNext(page).click();
  await expect(page.locator(".ss-question")).toBeVisible();
  await expectClicks(page, 4, "narasi");
  await pauseButton(page).click();
  await pauseButton(page).click();
  await addButton(page).click();
  await expectClicks(page, 7, "jeda, lanjut, tambah");
  await page.locator('.ss-choice[data-choice="B"]').click();
  await expectClicks(page, 8, "memilih");
  await page.locator('.ss-choice[data-choice="A"]').click({ force: true });
  await expectClicks(page, 8, "pilihan terkunci");
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await cardNext(page).click({ force: true });
  await expectClicks(page, 8, "masa tunggu kartu");
  await page.clock.runFor(600);
  await cardNext(page).click();
  await expect(awardPrompt(page)).toBeVisible();
  await expectClicks(page, 9, "Lanjut kartu");
  await page.getByRole("button", { name: "2 bintang", exact: true }).click();
  await expect(page.locator(".ss-wipe")).toHaveCount(1);
  const frame = await page.locator(".ss-stage-frame").boundingBox();
  if (!frame) throw new Error("bingkai panggung tidak ada");
  await page.mouse.click(frame.x + frame.width / 2, frame.y + frame.height / 2);
  await expectClicks(page, 10, "bintang dan sapuan");
  await page.clock.runFor(400);
  await expectClicks(page, 10, "sesudah sapuan");
  expectClean(log);
});

test("bunyi teks: setiap 2 huruf dengan laju 1,2, berhenti saat teks ditampilkan sekaligus (AC-14)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page);
  await unlock(page);
  const [first, second] = SCENES[0].narration;

  // Layar 1: 600 ms teks per huruf, lalu ditampilkan sekaligus; sesudahnya tidak ada bunyi teks lagi.
  await page.clock.runFor(600);
  const partial = blips(await soundLog(page));
  expect(partial).toHaveLength(blipSchedule(first, 600).length);
  await page.keyboard.press("Space");
  await page.clock.runFor(3000);
  expect(blips(await soundLog(page))).toHaveLength(partial.length);

  // Layar 2: tepat 40 bunyi teks 32 ms dengan laju 1,2, pada waktu simulasi pembaruan 30 ms.
  await page.keyboard.press("Space");
  await expect(page.locator('.ss-play [aria-live="polite"]')).toHaveText(second);
  const start = await page.evaluate(() => performance.now());
  await page.clock.runFor(2500);
  const screen = blips(await soundLog(page)).slice(partial.length);
  const schedule = blipSchedule(second);
  expect(schedule).toHaveLength(40);
  expect(screen).toHaveLength(40);
  expect(screen.map((played) => Math.round(played.at - start))).toEqual(schedule);
  for (const [index, played] of screen.entries()) {
    expect(played.duration).toBeCloseTo(0.032, 3);
    expect(played.rate).toBeCloseTo(1.2, 5);
    if (index > 0) expect(played.at - screen[index - 1].at).toBeGreaterThanOrEqual(30);
  }

  // Diskusi sampai pergantian adegan: tidak ada bunyi teks.
  await page.keyboard.press("Space");
  await expect(page.locator(".ss-question")).toBeFocused();
  const quiet = blips(await soundLog(page)).length;
  await page.clock.runFor(5000);
  await page.keyboard.press("2");
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  await page.clock.runFor(2000);
  await page.keyboard.press("1");
  await page.clock.runFor(199);
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 1/6");
  expect(blips(await soundLog(page))).toHaveLength(quiet);
  // Layar narasi adegan 2 berbunyi lagi sesudah sapuan. Jam dimajukan lagi sesudah kotak narasi tampil.
  await page.clock.runFor(201);
  await expect(page.locator(".ss-topbar-counter")).toHaveText("Adegan 2/6");
  await expect(narrationNext(page)).toBeFocused();
  await page.clock.runFor(1000);
  expect(blips(await soundLog(page)).length).toBeGreaterThan(quiet);
  expectClean(log);
});

test("bunyi teks dengan kurangi gerak: tidak ada, klik tetap berbunyi (AC-14)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page, true);
  await unlock(page);
  await page.clock.runFor(3000);
  await page.keyboard.press("Space");
  await page.clock.runFor(3000);
  await page.keyboard.press("Space");
  await expect(page.locator(".ss-question")).toBeFocused();
  const sounds = await soundLog(page);
  expect(blips(sounds)).toEqual([]);
  expect(clicks(sounds)).toHaveLength(2);
  expectClean(log);
});

test("volume 60% dan tombol M, juga sesudah main lagi (AC-15)", async ({ page }) => {
  const log = watch(page);
  await openPlay(page);
  await unlock(page);
  await page.clock.runFor(900);
  await page.keyboard.press("Space");
  const plays = async () => (await soundLog(page)).plays.length;
  expect(clicks(await soundLog(page))).toHaveLength(1);

  // M: suara mati; tekanan dan teks per huruf tidak berbunyi.
  await page.keyboard.press("m");
  await expect(status(page)).toHaveText("Suara dimatikan.");
  const muted = await plays();
  await page.keyboard.press("Space");
  await page.clock.runFor(1000);
  await page.keyboard.press("Space");
  await page.keyboard.press("Space");
  await expect(page.locator(".ss-question")).toBeFocused();
  for (const key of ["p", "p", "t"]) await page.keyboard.press(key);
  expect(await plays()).toBe(muted);

  // M lagi: suara menyala dengan tepat satu klik sebagai tanda.
  await page.keyboard.press("M");
  await expect(status(page)).toHaveText("Suara dinyalakan.");
  expect(await plays()).toBe(muted + 1);
  expect(clicks(await soundLog(page)).at(-1)?.rate).toBe(1);

  // Mati lagi, main sampai akhir, lalu "Main lagi dari adegan 1": suara tetap mati.
  await page.keyboard.press("m");
  await expect(status(page)).toHaveText("Suara dimatikan.");
  const silent = await plays();
  await page.keyboard.press("2");
  await page.clock.runFor(1200);
  await expect(page.locator("#ss-impact-title")).toBeFocused();
  await page.clock.runFor(600);
  await page.keyboard.press("Enter");
  await expect(awardPrompt(page)).toBeFocused();
  await page.keyboard.press("1");
  await page.clock.runFor(400);
  for (let i = 1; i < SCENES.length; i++) await playScene(page);
  await expect(page.locator(".ss-play-end h1")).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(narrationNext(page)).toBeFocused();
  await page.clock.runFor(1000);
  for (let i = 0; i < 4; i++) await page.keyboard.press("Space");
  await expect(page.locator(".ss-question")).toBeFocused();
  await page.keyboard.press("t");
  expect(await plays()).toBe(silent);
  await page.keyboard.press("m");
  await expect(status(page)).toHaveText("Suara dinyalakan.");
  expect(await plays()).toBe(silent + 1);

  // Setiap bunyi lewat satu GainNode 0,6 yang terhubung ke tujuan konteks.
  const sounds = await soundLog(page);
  const gains = sounds.links.filter((link) => link.startsWith("gain"));
  expect(gains).toEqual(["gain1(0.6)->tujuan"]);
  const sources = sounds.links.filter((link) => link.startsWith("sumber"));
  expect(sources).toHaveLength(sounds.plays.length);
  expect(new Set(sources)).toEqual(new Set(["sumber->gain1(0.6)"]));
  expectClean(log);
});

test("bunyi gagal dimuat: permainan tetap bisa dimainkan sampai akhir tanpa galat (AC-16)", async ({ page }) => {
  const log = watch(page);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.location().url);
  });
  await page.route("**/*.wav", (route) => route.abort("failed"));
  await openPlay(page);
  await page.keyboard.press("x");
  await expect.poll(() => log.failed.filter((line) => line.includes(".wav")).length).toBe(2);
  for (let i = 0; i < SCENES.length; i++) await playScene(page);
  await expect(page.locator(".ss-play-end h1")).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(narrationNext(page)).toBeFocused();

  const sounds = await soundLog(page);
  expect(sounds.plays).toEqual([]);
  expect(sounds.contexts).toBe(1);
  expect(log.page, "galat halaman").toEqual([]);
  expect(log.http, "respons 4xx/5xx").toEqual([]);
  expect(log.external, "permintaan ke host lain").toEqual([]);
  // Hanya pesan jaringan untuk dua permintaan .wav yang digagalkan.
  expect(consoleErrors.every((url) => url.endsWith(".wav")), consoleErrors.join("\n")).toBe(true);
});
