import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { REFERENCES } from "../content/references";
import { ROLES } from "../content/roles";
import { SCENES } from "../content/scenes";
import {
  assetProblems,
  contentProblems,
  countSentences,
  formatReport,
  parseChecklist,
  prdProblems,
  releaseBlockedMessage,
  verificationReport,
} from "../content/schema";
import { createInitialState, createReducer } from "../engine/reducer";
import { choiceText, endingFor, narrationFor } from "../engine/rules";
import type { ChoiceId, GameAction, GameState, Reference, RoleInfo, Scene } from "../engine/types";
import { TEAMS } from "./fixtures";

const ROOT = new URL("../../../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, ROOT), "utf8");
const assetExists = (path: string) => existsSync(new URL(`app/sehari-setara/assets/${path}`, ROOT));
const PRD = read("docs/sehari-setara/PRD.md");
const CHECKLIST = read("docs/sehari-setara/Verifikasi_Rujukan.md");

/** Salinan naskah yang boleh diubah untuk uji pelanggaran. */
const copy = (): Scene[] => structuredClone([...SCENES]);
/** Jumlah rujukan dihitung dari references.ts agar tidak ditulis mati di uji. */
const REFERENCE_COUNT = REFERENCES.length;
/** Kode R-xx sesudah rujukan terakhir, yang belum dimiliki rujukan mana pun. */
const NEXT_REFERENCE_ID = `R-${String(REFERENCE_COUNT + 1).padStart(2, "0")}`;
const problemsOf = (scenes: Scene[], references: readonly Reference[] = REFERENCES, roles: readonly RoleInfo[] = ROLES) =>
  contentProblems(scenes, references, roles).join("\n");

describe("naskah memenuhi aturan (AC-3)", () => {
  it("tidak ada pelanggaran aturan 1–7 dan 9–11", () => {
    expect(contentProblems(SCENES, REFERENCES, ROLES)).toEqual([]);
  });

  it("semua berkas latar, sprite, dan ikon emosi yang dirujuk ada (aturan 8)", () => {
    expect(assetProblems(SCENES, assetExists)).toEqual([]);
  });

  const violations: [string, (scenes: Scene[]) => void, string][] = [
    ["aturan 1: jumlah adegan", (s) => s.pop(), "harus tepat 6 adegan"],
    ["aturan 1: urutan jam", (s) => { s[1].clock = "06.00"; }, "tidak lebih lambat"],
    ["aturan 2: urutan pilihan", (s) => { s[0].choices[0].id = "B"; }, "pilihan harus A, B, C berurutan"],
    ["aturan 2: tanpa pilihan tepat", (s) => { s[0].choices[1].tier = "kurang"; }, "tidak ada pilihan bertingkat tepat"],
    ["aturan 3: efek bukan kelipatan 5", (s) => { s[0].choices[0].effects.hak = 7; }, "harus kelipatan 5"],
    ["aturan 3: efek di luar rentang", (s) => { s[0].choices[0].effects.kewajiban = -25; }, "harus kelipatan 5"],
    ["aturan 4: rujukan kosong", (s) => { s[0].choices[0].impact.rujukan = []; }, "rujukan kosong"],
    ["aturan 4: kode tidak dikenal", (s) => { s[0].choices[0].impact.rujukan = [{ id: "R-99", text: "x" }]; }, "tidak ada di references.ts"],
    ["aturan 4: teks rujukan berbeda", (s) => { s[0].choices[0].impact.rujukan = [{ id: "R-01", text: "Pasal lain" }]; }, "berbeda dengan references.ts"],
    ["aturan 5: narasi empat kalimat", (s) => { s[1].narration = ["Satu. Dua. Tiga. Empat."]; }, "lebih dari 3 kalimat"],
    ["aturan 6: teks pilihan terlalu panjang", (s) => { s[0].choices[2].text = "a".repeat(141); }, "maksimal 140"],
    ["aturan 7: bendera dibaca sebelum disetel", (s) => { delete s[3].choices[1].setsFlag; }, "dibaca sebelum disetel"],
    ["aturan 9: ikon emosi tanpa tokoh", (s) => { s[0].choices[1].emote = { char: "bayu", icon: "hati" }; }, "tidak ada di susunan reaksi"],
    ["aturan 9: posisi di luar panggung", (s) => { s[0].cast[0].x = 400; }, "di luar 0–320"],
    ["aturan 10: kuis di adegan lain", (s) => { s[0].roleQuiz = { question: "?", answer: "hakim" }; }, "kuis peran harus hanya di adegan s5"],
  ];

  it.each(violations)("%s tertangkap", (_, mutate, expected) => {
    const scenes = copy();
    mutate(scenes);
    expect(problemsOf(scenes)).toContain(expected);
  });

  it("aturan 8: berkas aset yang hilang tertangkap", () => {
    const scenes = copy();
    scenes[0].bg = "bg_tidak_ada";
    scenes[1].choices[0].reaction[0].pose = "terbang";
    const problems = assetProblems(scenes, assetExists).join("\n");
    expect(problems).toContain("assets/bg/bg_tidak_ada.png");
    expect(problems).toContain("assets/sprites/char_dimas_terbang.png");
  });

  it("aturan 10 dan 11: peran dan rujukan yang tidak sesuai tertangkap", () => {
    expect(problemsOf(copy(), REFERENCES, ROLES.slice(0, 3))).toContain("hakim harus muncul tepat sekali");
    // Contoh rujukan tidak dipakai: kode berikutnya yang berurutan, sehingga hanya aturan "dipakai" yang dilanggar.
    const unused = problemsOf(copy(), [...REFERENCES, { id: NEXT_REFERENCE_ID, text: "Rujukan lebih" }]);
    expect(unused).toContain(`${NEXT_REFERENCE_ID} tidak dipakai`);
    expect(unused).not.toContain("harus R-");
    expect(unused).not.toContain("berbeda dengan references.ts");
    expect(problemsOf(copy(), [REFERENCES[1], REFERENCES[0], ...REFERENCES.slice(2)])).toContain("kode ke-1 harus R-01");
  });
});

describe("sama dengan PRD bagian 8 (AC-2)", () => {
  it("teks pilihan, efek, tingkat, bendera, situasi, kuis, serta hak dan kewajiban sama dengan PRD", () => {
    expect(prdProblems(SCENES, ROLES, PRD)).toEqual([]);
  });

  const prdMutations: [string, (s: Scene[]) => void, string][] = [
    ["teks pilihan", (s) => { s[2].choices[0].text = "Membalas dengan sopan"; }, "teks berbeda dengan PRD"],
    ["efek", (s) => { s[4].choices[1].effects.hak = 20; }, "berbeda dengan PRD"],
    ["tingkat", (s) => { s[1].choices[0].tier = "kurang"; }, "tingkat kurang berbeda"],
    ["situasi", (s) => { s[0].narration[1] = "Nara berangkat sendiri."; }, "narasi berbeda"],
    ["varian adegan 6", (s) => { s[5].narrationIfFlag = undefined; }, "varian narasi tidak sama"],
  ];

  it.each(prdMutations)("perubahan %s tertangkap", (_, mutate, expected) => {
    const scenes = copy();
    mutate(scenes);
    expect(prdProblems(scenes, ROLES, PRD).join("\n")).toContain(expected);
  });
});

describe("rujukan (AC-4, AC-5)", () => {
  it("references.ts memuat rujukan sesuai tabel rujukan spesifikasi", () => {
    // Teks harapan sengaja ditulis lengkap: uji ini menangkap perubahan teks rujukan yang tidak disengaja.
    // Bila pemilik proyek mengubah rujukan, tabel spesifikasi F-03, Verifikasi_Rujukan.md, dan daftar ini diperbarui bersama.
    expect(REFERENCES.map((r) => `${r.id} ${r.text}`)).toEqual([
      "R-01 Pasal 28B ayat (2) UUD NRI 1945",
      "R-02 UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 19",
      "R-03 Pasal 28G ayat (1) UUD NRI 1945",
      "R-04 Pasal 31 ayat (1) UUD NRI 1945",
      "R-05 Pasal 27 ayat (1) UUD NRI 1945",
      "R-06 UU No. 22 Tahun 2009 tentang LLAJ, Pasal 77 ayat (1) dan Pasal 106 ayat (8)",
      "R-07 Pasal 28E ayat (3) UUD NRI 1945",
      "R-08 Pasal 28J ayat (1) UUD NRI 1945",
      "R-09 Pasal 28D ayat (1) UUD NRI 1945",
      "R-10 Pasal 24 ayat (1) dan ayat (2) UUD NRI 1945",
      "R-11 UU No. 2 Tahun 2002 sebagaimana telah diubah terakhir dengan UU No. 5 Tahun 2026, Pasal 13 dan Pasal 14 ayat (1) huruf g",
      "R-12 UU No. 48 Tahun 2009, Pasal 8 ayat (1) (asas praduga tak bersalah)",
      "R-13 UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 14 ayat (1)",
      "R-14 UU No. 48 Tahun 2009, Pasal 11 ayat (1)",
    ]);
  });

  it("setiap pilihan merujuk kode adegannya", () => {
    const expected: Record<Scene["id"], string> = {
      s1: "R-01 R-13 R-02",
      s2: "R-03 R-04 R-05 R-06",
      s3: "R-07 R-08",
      s4: "R-01 R-03 R-08",
      s5: "R-09 R-03 R-10 R-14 R-11 R-12",
      s6: "R-03 R-08",
    };
    for (const scene of SCENES) {
      for (const choice of scene.choices) {
        expect(choice.impact.rujukan.map((r) => r.id).join(" "), `${scene.id} ${choice.id}`).toBe(expected[scene.id]);
      }
    }
  });

  it(`Verifikasi_Rujukan.md memuat ${REFERENCE_COUNT} butir berkotak kosong dengan teks yang sama`, () => {
    const entries = parseChecklist(CHECKLIST);
    expect(entries.map((e) => [e.id, e.text, e.checked])).toEqual(REFERENCES.map((r) => [r.id, r.text, false]));
  });
});

describe("pembaca daftar centang (AC-6)", () => {
  const sample = [
    "- [x] **R-01** Pasal 28B ayat (2) UUD NRI 1945",
    "  - Sumber JDIH: https://contoh",
    "- [ ] **R-02** UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 19",
    "- [x] **R-03** Pasal 28G ayat (2) UUD NRI 1945",
    "- [x] R-05",
    "* [X]   R-07    Pasal 28E ayat (3)   UUD NRI 1945  ",
  ].join("\n");
  const references = REFERENCES.slice(0, 7);

  it("menentukan status dan alasannya", () => {
    const statuses = verificationReport(references, parseChecklist(sample));
    expect(statuses.map((s) => [s.id, s.verified, s.reason ?? "terverifikasi"])).toEqual([
      ["R-01", true, "terverifikasi"],
      ["R-02", false, "belum dicentang"],
      ["R-03", false, "teks di daftar berbeda"],
      ["R-04", false, "tidak ada di daftar"],
      ["R-05", false, "tidak ada di daftar"],
      ["R-06", false, "tidak ada di daftar"],
      ["R-07", true, "terverifikasi"],
    ]);
    expect(releaseBlockedMessage(statuses)).toBe("Rilis diblokir: 5 rujukan belum terverifikasi.");
    expect(formatReport(statuses)).toContain("Verifikasi rujukan: 2 dari 7 terverifikasi.");
  });

  it("menghitung kalimat narasi", () => {
    expect(countSentences("Satu. Dua!")).toBe(2);
    expect(countSentences("Komang mengirim pesan pribadi, “Kak, videonya disebar. Aku malu besok ke sekolah.”")).toBe(2);
    expect(countSentences("Kelompok merencanakan proyek “Kelas Ramah”. Nara mengusulkan pojok baca.")).toBe(2);
    expect(countSentences("Gita, adik Nara yang kelas 3 SD, belum siap")).toBe(0);
  });
});

describe("laporan verifikasi rujukan (AC-7)", () => {
  const statuses = verificationReport(REFERENCES, parseChecklist(CHECKLIST));

  it("dicetak di setiap uji tanpa menahan terbitan", () => {
    const report = formatReport(statuses);
    console.info(report);
    expect(statuses.map((s) => s.id)).toEqual(REFERENCES.map((r) => r.id));
    const pending = statuses.filter((s) => !s.verified);
    expect(report.split("\n")[0]).toBe(
      `Verifikasi rujukan: ${REFERENCE_COUNT - pending.length} dari ${REFERENCE_COUNT} terverifikasi.`,
    );
    for (const status of pending) expect(report).toContain(`- ${status.id} ${status.text} (${status.reason})`);
  });

  it.runIf(process.env.RILIS === "1")("mode rilis: semua rujukan sudah terverifikasi", () => {
    const blocked = releaseBlockedMessage(statuses);
    if (blocked) throw new Error(`${blocked}\n${formatReport(statuses)}`);
  });
});

describe("peran dan kuis (AC-8)", () => {
  it("empat peran sesuai PRD dan kuis adegan 5 menjawab hakim", () => {
    expect(ROLES.map((r) => `${r.label}: ${r.tugas}`)).toEqual([
      "Polisi: Menerima laporan dan menyidik.",
      "Jaksa: Menuntut.",
      "Advokat: Mendampingi.",
      "Hakim: Memutus.",
    ]);
    expect(SCENES[4].roleQuiz?.answer).toBe("hakim");
  });
});

describe("naskah asli dengan mesin F-02 (AC-10)", () => {
  const reduce = createReducer(SCENES);

  function play(choices: ChoiceId[]): GameState {
    const setup: GameAction[] = [
      { type: "MULAI" },
      { type: "SIMPAN_PENGATURAN", teams: TEAMS.slice(0, 3), settings: {} },
      { type: "LANJUT" },
    ];
    let state = setup.reduce((s, a) => reduce(s, a), createInitialState());
    choices.forEach((choice, i) => {
      const actions: GameAction[] = [
        { type: "NARASI_SELESAI" },
        { type: "PILIH", choice },
        { type: "REAKSI_SELESAI" },
        { type: "LANJUT" },
      ];
      if (SCENES[i].roleQuiz) actions.push({ type: "JAWAB_KUIS", role: "hakim" }, { type: "LANJUT" });
      actions.push({ type: "BERI_BINTANG", stars: 1 }, { type: "LANJUT" });
      state = actions.reduce((s, a) => reduce(s, a), state);
    });
    return state;
  }

  it.each([
    [["B", "B", "B", "B", "B", "B"], "setara"],
    [["B", "B", "B", "C", "C", "C"], "hampir"],
    [["A", "A", "A", "A", "A", "A"], "berat"],
  ] as [ChoiceId[], string][])("pilihan %j berakhir %s", (choices, ending) => {
    const state = play(choices);
    expect(state.phase).toBe("ending");
    expect(endingFor(state.meters)).toBe(ending);
  });

  it("varian adegan 6 muncul hanya bila Komang dibela di adegan 4", () => {
    const dibela = play(["B", "B", "B", "B", "B"]);
    expect(choiceText(SCENES[5].choices[1], dibela.flags)).toMatch(/^Membalas pesan Komang/);
    expect(narrationFor(SCENES[5], dibela.flags)).toContain(SCENES[5].narrationIfFlag?.present[0]);
    const tidak = play(["B", "B", "B", "A", "B"]);
    expect(choiceText(SCENES[5].choices[1], tidak.flags)).toMatch(/^Tidak menyebarkan/);
    expect(narrationFor(SCENES[5], tidak.flags)).toContain("Malam itu Komang tidak membalas pesan siapa pun.");
  });
});
