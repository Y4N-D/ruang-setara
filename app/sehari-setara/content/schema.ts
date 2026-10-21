// Pemeriksa konten Sehari Setara (Architecture bagian 5; spesifikasi F-03).
// Berkas ini hanya diimpor oleh uji, sehingga zod tidak ikut terbundel ke halaman permainan.
// Semua fungsi murni: berkas dibaca oleh uji lalu isinya diberikan sebagai argumen.
import { z } from "zod";
import type { Flag, Reference, RoleInfo, Scene } from "../engine/types";

const CHAR_IDS = ["nara", "ibu", "gita", "dimas", "sinta", "ratih", "komang", "made", "bayu", "siswa", "warga"] as const;
const ROLE_IDS = ["polisi", "jaksa", "advokat", "hakim"] as const;
const SCENE_IDS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;
const STAGE_WIDTH = 320;

// Skema struktur. Aturan isi (batas angka, panjang teks, urutan) diperiksa contentProblems
// agar pesannya berbahasa Indonesia dan menyebut adegan serta pilihannya.
const flagSchema = z.literal("komangDibela");
const textSchema = z.string().min(1);

export const ReferenceSchema = z.object({ id: z.string().regex(/^R-\d{2}$/), text: textSchema }).strict();

export const CastSlotSchema = z
  .object({ char: z.enum(CHAR_IDS), pose: textSchema, x: z.number(), facing: z.enum(["left", "right"]) })
  .strict();

export const ChoiceSchema = z
  .object({
    id: z.enum(["A", "B", "C"]),
    text: textSchema,
    textIfFlag: z.object({ flag: flagSchema, text: textSchema }).strict().optional(),
    effects: z.object({ hak: z.number(), kewajiban: z.number() }).strict(),
    tier: z.enum(["tepat", "kurang", "berisiko"]),
    setsFlag: flagSchema.optional(),
    reaction: z.array(CastSlotSchema).min(1),
    emote: z.object({ char: z.enum(CHAR_IDS), icon: z.enum(["hati", "keringat", "tanya", "seru"]) }).strict().optional(),
    impact: z
      .object({ terjadi: textSchema, hak: textSchema, kewajiban: textSchema, rujukan: z.array(ReferenceSchema) })
      .strict(),
  })
  .strict();

export const SceneSchema = z
  .object({
    id: z.enum(SCENE_IDS),
    title: textSchema,
    clock: z.string().regex(/^\d{2}\.\d{2}$/),
    timeOfDay: z.enum(["pagi", "siang", "sore", "malam"]),
    bg: textSchema,
    altText: textSchema,
    cast: z.array(CastSlotSchema).min(1),
    narration: z.array(textSchema).min(1),
    narrationIfFlag: z
      .object({ flag: flagSchema, present: z.array(textSchema).min(1), absent: z.array(textSchema).min(1) })
      .strict()
      .optional(),
    question: textSchema,
    choices: z.tuple([ChoiceSchema, ChoiceSchema, ChoiceSchema]),
    roleQuiz: z.object({ question: textSchema, answer: z.enum(ROLE_IDS) }).strict().optional(),
  })
  .strict();

/** Jumlah kalimat: tanda . ! ? (boleh diikuti tanda petik penutup) yang diikuti spasi atau akhir teks. */
export function countSentences(text: string): number {
  return (text.match(/[.!?]+["”’)]*(?=\s|$)/g) ?? []).length;
}

/** Pelanggaran aturan 1–7 dan 9–11 di spesifikasi F-03. Daftar kosong berarti naskah sah. */
export function contentProblems(
  scenes: readonly Scene[],
  references: readonly Reference[],
  roles: readonly RoleInfo[],
): string[] {
  const problems: string[] = [];
  const add = (where: string, message: string) => problems.push(`${where}: ${message}.`);

  scenes.forEach((scene, i) => {
    const parsed = SceneSchema.safeParse(scene);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        add(`Adegan ${scene.id ?? i + 1}`, `struktur tidak sesuai skema di ${issue.path.join(".")} (${issue.message})`);
      }
    }
  });

  // Aturan 1: enam adegan berurutan dengan jam naik.
  if (scenes.length !== SCENE_IDS.length) add("Naskah", `harus tepat 6 adegan, ditemukan ${scenes.length}`);
  scenes.forEach((scene, i) => {
    if (scene.id !== SCENE_IDS[i]) add(`Adegan ke-${i + 1}`, `pengenal harus ${SCENE_IDS[i]}, ditemukan ${scene.id}`);
    if (i > 0 && !(scene.clock > scenes[i - 1].clock)) {
      add(`Adegan ${scene.id}`, `jam ${scene.clock} tidak lebih lambat dari adegan sebelumnya (${scenes[i - 1].clock})`);
    }
  });

  const referenceText = new Map(references.map((reference) => [reference.id, reference.text]));
  const flagsSetBefore = new Set<Flag>();

  for (const scene of scenes) {
    const where = `Adegan ${scene.id}`;

    // Aturan 2: pilihan A, B, C dan minimal satu tepat.
    const order = scene.choices.map((choice) => choice.id).join("");
    if (order !== "ABC") add(where, `pilihan harus A, B, C berurutan, ditemukan ${order}`);
    if (!scene.choices.some((choice) => choice.tier === "tepat")) add(where, "tidak ada pilihan bertingkat tepat");

    // Aturan 5: maksimal tiga kalimat per layar narasi.
    scene.narration.forEach((screen, i) => {
      if (countSentences(screen) > 3) add(where, `narasi layar ${i + 1} lebih dari 3 kalimat`);
    });
    const variant = scene.narrationIfFlag;
    if (variant) {
      variant.present.forEach((screen, i) => {
        if (countSentences(screen) > 3) add(where, `narasi present layar ${i + 1} lebih dari 3 kalimat`);
      });
      variant.absent.forEach((screen, i) => {
        if (countSentences(screen) > 3) add(where, `narasi absent layar ${i + 1} lebih dari 3 kalimat`);
      });
      // Aturan 7: bendera dibaca setelah disetel di adegan sebelumnya.
      if (!flagsSetBefore.has(variant.flag)) add(where, `bendera ${variant.flag} dibaca sebelum disetel`);
    }

    // Aturan 9: posisi tokoh di dalam panggung.
    for (const slot of scene.cast) {
      if (slot.x < 0 || slot.x > STAGE_WIDTH) add(where, `posisi x ${slot.x} untuk ${slot.char} di luar 0–320`);
    }

    for (const choice of scene.choices) {
      const at = `${where}, pilihan ${choice.id}`;

      // Aturan 3: efek kelipatan 5 dalam −20 sampai +20.
      for (const [meter, value] of Object.entries(choice.effects)) {
        if (!Number.isInteger(value) || value % 5 !== 0 || value < -20 || value > 20) {
          add(at, `efek ${meter} ${value} harus kelipatan 5 dalam −20 sampai +20`);
        }
      }

      // Aturan 4: rujukan tidak kosong dan cocok dengan references.ts.
      if (choice.impact.rujukan.length === 0) add(at, "rujukan kosong");
      for (const reference of choice.impact.rujukan) {
        const text = referenceText.get(reference.id);
        if (text === undefined) add(at, `kode rujukan ${reference.id} tidak ada di references.ts`);
        else if (text !== reference.text) add(at, `teks rujukan ${reference.id} berbeda dengan references.ts`);
      }

      // Aturan 6: teks pilihan maksimal 140 karakter.
      if (choice.text.length > 140) add(at, `teks pilihan ${choice.text.length} karakter, maksimal 140`);
      const textVariant = choice.textIfFlag;
      if (textVariant) {
        if (textVariant.text.length > 140) add(at, `teks varian ${textVariant.text.length} karakter, maksimal 140`);
        if (!flagsSetBefore.has(textVariant.flag)) add(at, `bendera ${textVariant.flag} dibaca sebelum disetel`);
      }

      // Aturan 9: tokoh ikon emosi ada di susunan reaksi; posisi di dalam panggung.
      const emote = choice.emote;
      if (emote && !choice.reaction.some((slot) => slot.char === emote.char)) {
        add(at, `tokoh ikon emosi ${emote.char} tidak ada di susunan reaksi`);
      }
      for (const slot of choice.reaction) {
        if (slot.x < 0 || slot.x > STAGE_WIDTH) add(at, `posisi x ${slot.x} untuk ${slot.char} di luar 0–320`);
      }
    }

    // Bendera yang disetel adegan ini baru berlaku untuk adegan berikutnya.
    for (const choice of scene.choices) if (choice.setsFlag) flagsSetBefore.add(choice.setsFlag);
  }

  // Aturan 10: kuis hanya di adegan 5 dengan jawaban hakim; empat peran tepat sekali.
  const quizScenes = scenes.filter((scene) => scene.roleQuiz).map((scene) => scene.id);
  if (quizScenes.join(",") !== "s5") {
    add("Naskah", `kuis peran harus hanya di adegan s5, ditemukan di ${quizScenes.join(", ") || "tidak ada adegan"}`);
  }
  const quiz = scenes.find((scene) => scene.id === "s5")?.roleQuiz;
  if (quiz && quiz.answer !== "hakim") add("Adegan s5", `jawaban kuis harus hakim, ditemukan ${quiz.answer}`);
  if (roles.length !== ROLE_IDS.length) add("Peran", `harus tepat 4 peran, ditemukan ${roles.length}`);
  for (const id of ROLE_IDS) {
    if (roles.filter((role) => role.id === id).length !== 1) add("Peran", `${id} harus muncul tepat sekali`);
  }

  // Aturan 11: kode rujukan berurutan dan semuanya dipakai.
  references.forEach((reference, i) => {
    const expected = `R-${String(i + 1).padStart(2, "0")}`;
    if (reference.id !== expected) add("Rujukan", `kode ke-${i + 1} harus ${expected}, ditemukan ${reference.id}`);
  });
  const used = new Set(scenes.flatMap((scene) => scene.choices.flatMap((choice) => choice.impact.rujukan.map((r) => r.id))));
  for (const reference of references) {
    if (!used.has(reference.id)) add("Rujukan", `${reference.id} tidak dipakai adegan mana pun`);
  }

  return problems;
}

/** Path aset (relatif terhadap app/sehari-setara/assets/) yang dirujuk satu adegan. */
export function assetPaths(scene: Scene): string[] {
  const slots = [...scene.cast, ...scene.choices.flatMap((choice) => choice.reaction)];
  const paths = [
    `bg/${scene.bg}.png`,
    ...slots.map((slot) => `sprites/char_${slot.char}_${slot.pose}.png`),
    ...scene.choices.flatMap((choice) => (choice.emote ? [`ui/emote_${choice.emote.icon}.png`] : [])),
  ];
  return [...new Set(paths)];
}

/** Aturan 8: setiap aset yang dirujuk ada. `exists` menerima path relatif terhadap assets/. */
export function assetProblems(scenes: readonly Scene[], exists: (path: string) => boolean): string[] {
  return scenes.flatMap((scene) =>
    assetPaths(scene)
      .filter((path) => !exists(path))
      .map((path) => `Adegan ${scene.id}: berkas aset tidak ada: assets/${path}.`),
  );
}

// ---------- Daftar centang verifikasi rujukan ----------

export interface ChecklistEntry { id: string; text: string; checked: boolean; line: number }

const tidy = (text: string) => text.replace(/\s+/g, " ").trim();

/** Membaca baris pertama setiap butir: kotak, kode R-xx, dan teks. Baris lain diabaikan. */
export function parseChecklist(markdown: string): ChecklistEntry[] {
  const entries: ChecklistEntry[] = [];
  markdown.split(/\r?\n/).forEach((line, i) => {
    const match = /^\s*[-*+]\s*\[\s*([xX])?\s*\]\s*(?:\*\*)?\s*(R-\d{2})\s*(?:\*\*)?\s+(\S.*?)\s*$/.exec(line);
    if (match && !entries.some((entry) => entry.id === match[2])) {
      entries.push({ id: match[2], text: tidy(match[3]), checked: match[1] !== undefined, line: i + 1 });
    }
  });
  return entries;
}

export type UnverifiedReason = "belum dicentang" | "tidak ada di daftar" | "teks di daftar berbeda";

export interface VerificationStatus { id: string; text: string; verified: boolean; reason?: UnverifiedReason }

/** Rujukan terverifikasi hanya bila kotaknya dicentang dan teksnya sama dengan naskah. */
export function verificationReport(
  references: readonly Reference[],
  entries: readonly ChecklistEntry[],
): VerificationStatus[] {
  return references.map(({ id, text }) => {
    const entry = entries.find((candidate) => candidate.id === id);
    if (!entry) return { id, text, verified: false, reason: "tidak ada di daftar" };
    if (entry.text !== tidy(text)) return { id, text, verified: false, reason: "teks di daftar berbeda" };
    if (!entry.checked) return { id, text, verified: false, reason: "belum dicentang" };
    return { id, text, verified: true };
  });
}

export function formatReport(statuses: readonly VerificationStatus[]): string {
  const pending = statuses.filter((status) => !status.verified);
  const lines = [`Verifikasi rujukan: ${statuses.length - pending.length} dari ${statuses.length} terverifikasi.`];
  if (pending.length > 0) {
    lines.push("Belum terverifikasi:");
    for (const status of pending) lines.push(`- ${status.id} ${status.text} (${status.reason})`);
  }
  return lines.join("\n");
}

export function releaseBlockedMessage(statuses: readonly VerificationStatus[]): string | null {
  const pending = statuses.filter((status) => !status.verified).length;
  return pending === 0 ? null : `Rilis diblokir: ${pending} rujukan belum terverifikasi.`;
}

// ---------- Perbandingan dengan PRD bagian 8 (aturan 12) ----------

/** Mengabaikan tanda petik lurus atau “ ”, huruf kapital di awal, titik di akhir, dan spasi berlebih. */
function loose(text: string): string {
  const plain = tidy(text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")).replace(/\.$/, "");
  return plain.charAt(0).toLowerCase() + plain.slice(1);
}

const TIERS: Record<string, string> = { tepat: "tepat", "kurang tepat": "kurang", berisiko: "berisiko" };
const toNumber = (value: string) => Number(value.replace("−", "-").replace("+", ""));

/** Selisih naskah dengan PRD bagian 8. Daftar kosong berarti sama. */
export function prdProblems(scenes: readonly Scene[], roles: readonly RoleInfo[], prd: string): string[] {
  const problems: string[] = [];
  const add = (where: string, message: string) => problems.push(`${where}: ${message}.`);
  const section = prd.split("## 8. Konten adegan")[1]?.split(/^## 9\./m)[0];
  if (!section) return ["PRD: bagian 8 tidak ditemukan."];

  const parts = section.split(/^### Adegan (\d) — (.+?) \((\d{2}\.\d{2})\)\s*$/m);
  if (parts.length < 5) return ["PRD: judul adegan di bagian 8 tidak terbaca."];
  for (let i = 1; i + 3 < parts.length + 1; i += 4) {
    const [no, title, clock, body] = [parts[i], parts[i + 1], parts[i + 2], parts[i + 3] ?? ""];
    const scene = scenes.find((candidate) => candidate.id === `s${no}`);
    const where = `Adegan s${no}`;
    if (!scene) {
      add(where, "ada di PRD tetapi tidak ada di naskah");
      continue;
    }
    if (scene.title !== title.trim()) add(where, `judul "${scene.title}" berbeda dengan PRD "${title.trim()}"`);
    if (scene.clock !== clock) add(where, `jam ${scene.clock} berbeda dengan PRD ${clock}`);

    const situation = body.trim().split(/\n\s*\n/)[0] ?? "";
    if (loose(scene.narration.join(" ")) !== loose(situation)) add(where, "narasi berbeda dengan situasi di PRD");

    const rows = [...body.matchAll(/^\| ([ABC]) \| (.+?) \| ([−+\-]?\d+) \| ([−+\-]?\d+) \| ([a-z ]+?) \|(?: (.*?) \|)?\s*$/gm)];
    if (rows.length !== 3) add(where, `tabel pilihan PRD berisi ${rows.length} baris, seharusnya 3`);
    for (const row of rows) {
      const [, id, text, hak, kewajiban, tier, flagCell] = row;
      const choice = scene.choices.find((candidate) => candidate.id === id);
      const at = `${where}, pilihan ${id}`;
      if (!choice) {
        add(at, "tidak ada di naskah");
        continue;
      }
      if (loose(choice.text) !== loose(text)) add(at, "teks berbeda dengan PRD");
      if (choice.effects.hak !== toNumber(hak) || choice.effects.kewajiban !== toNumber(kewajiban)) {
        add(at, `efek ${choice.effects.hak}/${choice.effects.kewajiban} berbeda dengan PRD ${hak}/${kewajiban}`);
      }
      if (choice.tier !== TIERS[tier.trim()]) add(at, `tingkat ${choice.tier} berbeda dengan PRD "${tier.trim()}"`);
      const prdFlag = flagCell?.match(/`(\w+)`/)?.[1];
      if ((choice.setsFlag ?? undefined) !== prdFlag) add(at, `bendera ${choice.setsFlag ?? "-"} berbeda dengan PRD ${prdFlag ?? "-"}`);
    }

    const rights = body.match(/^Hak dan kewajiban: (.+?); (.+)$/m);
    if (!rights) add(where, "baris hak dan kewajiban PRD tidak terbaca");
    else {
      for (const choice of scene.choices) {
        if (loose(choice.impact.hak) !== loose(rights[1])) add(`${where}, pilihan ${choice.id}`, "hak berbeda dengan PRD");
        if (loose(choice.impact.kewajiban) !== loose(rights[2])) {
          add(`${where}, pilihan ${choice.id}`, "kewajiban berbeda dengan PRD");
        }
      }
    }

    const present = body.match(/\*\*Jika `(\w+)`:\*\* (.+?) Pilihan B berbunyi "(.+?)"\s*$/m);
    const absent = body.match(/\*\*Jika tidak:\*\* narasi menambahkan, "(.+?)"\s*$/m);
    if (present || absent || scene.narrationIfFlag) {
      const variant = scene.narrationIfFlag;
      const choiceB = scene.choices[1];
      if (!variant || !present || !absent) add(where, "varian narasi tidak sama antara naskah dan PRD");
      else {
        if (variant.flag !== present[1]) add(where, `bendera varian ${variant.flag} berbeda dengan PRD ${present[1]}`);
        if (loose(variant.present.join(" ")) !== loose(present[2])) add(where, "narasi varian (Komang dibela) berbeda dengan PRD");
        if (loose(variant.absent.join(" ")) !== loose(absent[1])) add(where, "narasi varian (tidak dibela) berbeda dengan PRD");
        if (!choiceB.textIfFlag || loose(choiceB.textIfFlag.text) !== loose(present[3])) {
          add(`${where}, pilihan B`, "teks varian berbeda dengan PRD");
        }
      }
    }

    const quiz = body.match(/\*\*Kuis peran[^*]*\*\* "(.+?)" Pilihan: (.+?)\. Jawaban: (\w+)\./);
    if (quiz || scene.roleQuiz) {
      if (!quiz || !scene.roleQuiz) add(where, "kuis peran tidak sama antara naskah dan PRD");
      else {
        if (loose(scene.roleQuiz.question) !== loose(quiz[1])) add(where, "pertanyaan kuis berbeda dengan PRD");
        if (scene.roleQuiz.answer !== quiz[3].toLowerCase()) add(where, "jawaban kuis berbeda dengan PRD");
        const labels = quiz[2].split(",").map((label) => label.trim());
        if (labels.join(",") !== roles.map((role) => role.label).join(",")) add("Peran", "label peran berbeda dengan PRD");
        const duties = body.match(/kartu empat peran: (.+?)\. Kuis/)?.[1].split(", ") ?? [];
        for (const role of roles) {
          const duty = duties.find((candidate) => candidate.startsWith(`${role.id} `));
          if (!duty || loose(duty.slice(role.id.length + 1)) !== loose(role.tugas)) add("Peran", `tugas ${role.id} berbeda dengan PRD`);
        }
      }
    }
  }
  if (parts.length - 1 !== scenes.length * 4) add("Naskah", "jumlah adegan berbeda dengan PRD bagian 8");
  return problems;
}
