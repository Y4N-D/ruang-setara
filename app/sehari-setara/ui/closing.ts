// Fungsi murni ketiga layar penutup Sehari Setara (spesifikasi F-09): timbangan layar akhir, isi dan halaman rekap,
// baris kuis, tanda "Bintang terbanyak", dan pengumuman layar akhir, rekap, serta refleksi. Diuji di closing.test.ts.
// Nama berkas bukan ending.ts atau recap.ts, agar tidak tertukar dengan Ending.tsx dan Recap.tsx di sistem berkas yang
// tidak membedakan huruf besar (Windows dan macOS).
import { copy } from "../content/copy";
import { ENDINGS } from "../content/endings";
import { ROLES } from "../content/roles";
import { choiceText, endingFor } from "../engine/rules";
import type {
  Choice,
  EndingId,
  Flag,
  HistoryEntry,
  Reference,
  RoleId,
  RoleInfo,
  Scene,
  Stars,
  Team,
} from "../engine/types";

/** Masa tunggu tombol maju di ketiga layar penutup, sama dengan kartu dampak dan kuis (Design System bagian 8). */
export const CLOSING_GUARD_MS = 600;

/** Kotak timbangan D-10 di panggung logis: tengah END_SCALE_ZONE (x 220–292, y 8–56). */
export const SCALE_BOX = { left: 232, top: 16, w: 48, h: 32 } as const;

/** Gerak timbangan: jeda sejak layar akhir tampil, lalu satu bingkai setiap 200 ms. */
export const SCALE_DELAY_MS = 300;
export const SCALE_FRAME_MS = 200;

/** Bingkai strip D-10: 0 miring kiri, 1 sedikit kiri, 2 seimbang, 3 sedikit kanan, 4 miring kanan. */
export type ScaleFrame = 0 | 1 | 2 | 3 | 4;
export type ScaleTilt = "seimbang" | "sedikit" | "miring";
export type ScaleMotion = "seimbang" | "sedikit-kiri" | "sedikit-kanan" | "miring-kiri" | "miring-kanan";

export interface ScaleView {
  readonly frame: ScaleFrame;
  readonly tilt: ScaleTilt;
  /** Sisi yang turun; null bila seimbang atau bila kedua indikator sama. */
  readonly side: "hak" | "kewajiban" | null;
  readonly motion: ScaleMotion;
  /** Urutan bingkai gerak, dimulai dari bingkai 2 dan diakhiri bingkai akhir. */
  readonly sequence: readonly ScaleFrame[];
}

const MOTIONS: Readonly<Record<ScaleFrame, { readonly motion: ScaleMotion; readonly sequence: readonly ScaleFrame[] }>> = {
  2: { motion: "seimbang", sequence: [2, 1, 3, 2] },
  3: { motion: "sedikit-kanan", sequence: [2, 1, 3] },
  1: { motion: "sedikit-kiri", sequence: [2, 3, 1] },
  4: { motion: "miring-kanan", sequence: [2, 1, 3, 4] },
  0: { motion: "miring-kiri", sequence: [2, 3, 1, 0] },
};

type MeterValues = { readonly hak: number; readonly kewajiban: number };

/**
 * Posisi akhir dan gerak timbangan [usulan 2, pilihan a]: besar kemiringan menurut jenis akhir (Warga Setara seimbang,
 * Hampir Seimbang sedikit, Hari yang Berat miring), dan sisi indikator yang lebih tinggi turun. Bila H = K, timbangan
 * miring ke kanan.
 */
export function scaleView(meters: MeterValues): ScaleView {
  const ending = endingFor(meters);
  if (ending === "setara") return { frame: 2, tilt: "seimbang", side: null, ...MOTIONS[2] };
  const tilt: ScaleTilt = ending === "hampir" ? "sedikit" : "miring";
  const left = meters.hak > meters.kewajiban;
  const frame: ScaleFrame = tilt === "sedikit" ? (left ? 1 : 3) : left ? 0 : 4;
  const side = meters.hak === meters.kewajiban ? null : left ? "hak" : "kewajiban";
  return { frame, tilt, side, ...MOTIONS[frame] };
}

/** Kalimat timbangan untuk label panggung dan pengumuman layar akhir. */
export function scaleSentence(view: ScaleView): string {
  const { scale } = copy.closing;
  if (view.tilt === "seimbang") return scale.seimbang;
  return scale[view.tilt][view.side ?? "sama"];
}

/** Pilihan yang paling menjaga keseimbangan: pilihan bertingkat tepat pertama di adegan itu [usulan 4a]. */
export function bestChoice(scene: Scene): Choice {
  const best = scene.choices.find((choice) => choice.tier === "tepat");
  // Aturan 2 pemeriksa konten menjamin ada; closing.test.ts memeriksa tepat satu per adegan.
  if (!best) throw new Error(`Adegan ${scene.id} tidak punya pilihan bertingkat tepat`);
  return best;
}

/** Isi satu kotak adegan di rekap dan lembar unduhan. */
export interface RecapRow {
  readonly scene: Scene;
  /** Nomor adegan, 1–6. */
  readonly number: number;
  readonly choice: Choice;
  readonly choiceText: string;
  readonly best: Choice;
  readonly bestText: string;
  /** Benar bila pilihan kelas sama dengan pilihan yang paling menjaga keseimbangan. */
  readonly same: boolean;
  /** Rujukan pilihan yang paling menjaga keseimbangan, berurutan dan apa adanya. */
  readonly references: readonly Reference[];
  readonly team: { readonly id: string; readonly name: string; readonly shape: Team["shape"] } | null;
  readonly stars: Stars;
  readonly quiz: { readonly answer: RoleId; readonly correct: boolean } | null;
}

/**
 * Satu baris per entri history, berurutan menurut adegan. Teks pilihan memakai choiceText dengan bendera akhir
 * (state.flags), sehingga varian adegan 6 ikut; hasilnya sama dengan teks saat adegan dimainkan (diuji untuk 729 jalur).
 */
export function recapRows(
  history: readonly HistoryEntry[],
  scenes: readonly Scene[],
  teams: readonly Team[],
  flags: readonly Flag[],
): RecapRow[] {
  const rows: RecapRow[] = [];
  scenes.forEach((scene, index) => {
    const entry = history.find((item) => item.sceneId === scene.id);
    const choice = entry && scene.choices.find((item) => item.id === entry.choiceId);
    if (!entry || !choice) return;
    const best = bestChoice(scene);
    const team = teams.find((item) => item.id === entry.teamId);
    const answer = entry.quizAnswer;
    rows.push({
      scene,
      number: index + 1,
      choice,
      choiceText: choiceText(choice, flags),
      best,
      bestText: choiceText(best, flags),
      same: choice.id === best.id,
      references: best.impact.rujukan,
      team: team ? { id: team.id, name: team.name, shape: team.shape } : null,
      stars: entry.stars,
      quiz: scene.roleQuiz && answer ? { answer, correct: answer === scene.roleQuiz.answer } : null,
    });
  });
  return rows;
}

/** Indeks adegan per halaman rekap: adegan berurutan dengan timeOfDay yang sama, [[0, 1], [2, 3], [4], [5]]. */
export function recapPages(scenes: readonly Scene[]): number[][] {
  const pages: number[][] = [];
  scenes.forEach((scene, index) => {
    const last = pages[pages.length - 1];
    if (last && scenes[last[0]].timeOfDay === scene.timeOfDay) last.push(index);
    else pages.push([index]);
  });
  return pages;
}

/** Baris hasil kuis di kotak adegan 5 (usulan 5c; DRAF A-8). */
export function quizLine(
  quiz: { readonly answer: RoleId; readonly correct: boolean },
  roles: readonly RoleInfo[],
  correctId: RoleId,
): string {
  const label = (id: RoleId) => roles.find((role) => role.id === id)?.label ?? id;
  const { recap } = copy.closing;
  return quiz.correct ? recap.quizCorrect(label(correctId)) : recap.quizWrong(label(quiz.answer), label(correctId));
}

/** Tim yang mendapat tanda "Bintang terbanyak": semua tim dengan jumlah tertinggi, bila jumlah itu lebih dari 0 (A-2). */
export function topTeamIds(teams: readonly Pick<Team, "id" | "stars">[]): string[] {
  const max = Math.max(0, ...teams.map((team) => team.stars));
  return max > 0 ? teams.filter((team) => team.stars === max).map((team) => team.id) : [];
}

/** Menambah titik bila teks belum diakhiri tanda baca akhir kalimat. */
function sentence(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

/** Pengumuman layar akhir: judul, dua kalimat pesan, nilai kedua indikator, dan kalimat timbangan. */
export function endingAnnouncement(id: EndingId, meters: MeterValues, view: ScaleView): string {
  const ending = ENDINGS[id];
  const { ending: text } = copy.closing;
  return [
    text.announceTitle(ending.title),
    ...ending.message,
    text.meter(copy.meters.hak, meters.hak),
    text.meter(copy.meters.kewajiban, meters.kewajiban),
    scaleSentence(view),
  ].join(" ");
}

/** Pengumuman satu kotak adegan di halaman rekap. */
function rowAnnouncement(row: RecapRow): string[] {
  const { announce } = copy.closing.recap;
  const parts = [announce.scene(row.number, row.scene.title, row.scene.clock)];
  if (row.team) parts.push(announce.team(row.team.name, row.stars));
  parts.push(sentence(announce.choice(row.choice.id, row.choiceText)), `${copy.impact.tier[row.choice.tier]}.`);
  if (row.quiz && row.scene.roleQuiz) parts.push(quizLine(row.quiz, ROLES, row.scene.roleQuiz.answer));
  parts.push(row.same ? announce.bestSame : sentence(announce.best(row.best.id, row.bestText)));
  parts.push(sentence(announce.refs(row.references.map((reference) => reference.text).join("; "))));
  return parts;
}

/** Pengumuman satu halaman rekap (page mulai dari 1): waktu dan nomor halaman, lalu setiap kotak adegan. */
export function recapPageAnnouncement(
  rows: readonly RecapRow[],
  pages: readonly (readonly number[])[],
  page: number,
): string {
  const indexes = pages[page - 1] ?? [];
  const pageRows = rows.filter((row) => indexes.includes(row.number - 1));
  const time = pageRows[0]?.scene.timeOfDay;
  const timeText = time ? copy.closing.recap.time[time].toLowerCase() : "";
  const parts = [copy.closing.recap.announce.page(timeText, page, pages.length)];
  for (const row of pageRows) parts.push(...rowAnnouncement(row));
  return parts.join(" ");
}

/** Pengumuman refleksi: judul, kalimat pembuka, dan ketiga kalimat pemantik bernomor. */
export function reflectionAnnouncement(): string {
  const { reflection } = copy.closing;
  return [`${reflection.title}.`, reflection.lead, ...reflection.prompts.map((prompt, i) => `${i + 1}. ${prompt}`)].join(" ");
}
