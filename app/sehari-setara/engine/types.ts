// Tipe data dan status mesin permainan Sehari Setara.
// Sumber: docs/sehari-setara/Architecture.md bagian 5, ditambah keputusan F-02
// (quizAnswer, Stars, EndingId, Settings, HistoryEntry, TeamSetup, GameAction).

export type TimeOfDay = "pagi" | "siang" | "sore" | "malam";
export type Tier = "tepat" | "kurang" | "berisiko";
export type ChoiceId = "A" | "B" | "C";
export type Flag = "komangDibela";
export type CharId =
  | "nara" | "ibu" | "gita" | "dimas" | "sinta" | "ratih" | "komang" | "made" | "bayu"
  | "siswa" | "warga"; // siswa: pose merekam/tertawa; warga: pose a/b (F-03)
export type PoseId = "idle" | "talk" | "happy" | "sad" | string; // pose khusus didaftarkan di manifest
export type RoleId = "polisi" | "jaksa" | "advokat" | "hakim";

export interface CastSlot { char: CharId; pose: PoseId; x: number; facing: "left" | "right" }
/** Status verifikasi tidak disimpan di kode, melainkan di docs/sehari-setara/Verifikasi_Rujukan.md (F-03). */
export interface Reference { id: string; text: string }

/** Peran pada kuis adegan 5 (FR-11). */
export interface RoleInfo { id: RoleId; label: string; tugas: string }

export interface Choice {
  id: ChoiceId;
  text: string;
  textIfFlag?: { flag: Flag; text: string };   // varian teks (akibat berantai)
  effects: { hak: number; kewajiban: number }; // bilangan kelipatan 5, −20…+20
  tier: Tier;
  setsFlag?: Flag;
  reaction: CastSlot[];                        // pose tokoh setelah memilih
  emote?: { char: CharId; icon: "hati" | "keringat" | "tanya" | "seru" };
  impact: { terjadi: string; hak: string; kewajiban: string; rujukan: Reference[] };
}

export interface Scene {
  id: "s1" | "s2" | "s3" | "s4" | "s5" | "s6";
  title: string;            // "Pagi di rumah"
  clock: string;            // "06.15"
  timeOfDay: TimeOfDay;
  bg: string;               // kunci di manifest
  altText: string;          // deskripsi adegan untuk pembaca layar
  cast: CastSlot[];
  narration: string[];      // maks. 3 kalimat per layar
  narrationIfFlag?: { flag: Flag; present: string[]; absent: string[] };
  question: string;
  choices: [Choice, Choice, Choice];
  roleQuiz?: { question: string; answer: RoleId };
}

export type Phase =
  | "title" | "setup" | "prolog"
  | "intro" | "discuss" | "reaction" | "impact" | "quiz" | "stars" | "transition"
  | "ending" | "recap" | "reflection";

export interface Team { id: string; name: string; color: string; shape: "lingkaran" | "segitiga" | "persegi" | "bintang"; stars: number }

/** Bintang alasan dari guru untuk tim aktif. */
export type Stars = 0 | 1 | 2;

/** Hasil endingFor: Warga Setara, Hampir Seimbang, Hari yang Berat (PRD bagian 9). */
export type EndingId = "setara" | "hampir" | "berat";

export interface Settings { sound: boolean; reducedMotion: boolean; typewriter: boolean; discussSeconds: 30 | 60 | 90 }

/**
 * Satu pilihan kelas. history adalah sumber kebenaran untuk indikator, bendera, dan bintang.
 * quizAnswer: jawaban kuis peran di adegan itu, untuk rekap (spesifikasi F-09, usulan 5c).
 */
export interface HistoryEntry { sceneId: Scene["id"]; choiceId: ChoiceId; teamId: string; stars: Stars; quizAnswer?: RoleId }

export interface GameState {
  phase: Phase;
  sceneIndex: number;                       // 0–5
  meters: { hak: number; kewajiban: number }; // 0–100, awal 50
  flags: Flag[];
  teams: Team[];
  history: HistoryEntry[];
  timer: { duration: number; remaining: number; running: boolean };
  settings: Settings;
  quizAnswer: RoleId | null;                // jawaban kuis peran adegan berjalan; null sebelum dijawab
}

/** Isi tim saat pengaturan kelas; bintang selalu dihitung dari history. */
export type TeamSetup = Omit<Team, "stars">;

export type GameAction =
  | { type: "MULAI" }
  | { type: "SIMPAN_PENGATURAN"; teams: TeamSetup[]; settings: Partial<Settings> }
  | { type: "LANJUT" }
  | { type: "NARASI_SELESAI" }
  | { type: "PILIH"; choice: ChoiceId }
  | { type: "REAKSI_SELESAI" }
  | { type: "JAWAB_KUIS"; role: RoleId }
  | { type: "BERI_BINTANG"; stars: Stars }
  | { type: "MAIN_LAGI" }
  | { type: "TICK" }
  | { type: "JEDA_WAKTU" }
  | { type: "TAMBAH_30" }
  | { type: "LEWATI_DISKUSI" }
  | { type: "UBAH_PENGATURAN"; settings: Partial<Settings> };
