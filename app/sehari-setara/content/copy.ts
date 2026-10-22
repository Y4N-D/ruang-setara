// Teks antarmuka Sehari Setara.
// Semua teks yang tampil ke pengguna berasal dari folder content/ (Architecture bagian 14).
// Teks F-01 mengikuti docs/sehari-setara/specs/F-01-kerangka-halaman.md; teks F-04 mengikuti specs/F-04-panggung.md.
import type { ChoiceId } from "../engine/types";

export const copy = {
  gameName: "Sehari Setara",
  backToGallery: "Kembali ke galeri",
  placeholder: {
    lead: "Temani Nara menjalani satu hari dan pilih tindakannya bersama kelas.",
    status: "Permainan ini sedang dibuat.",
    previewLink: "Lihat pratinjau panggung",
  },
  topBar: {
    counter: (n: number, total: number) => `Adegan ${n}/${total}`,
    label: (clock: string, n: number, total: number) => `Pukul ${clock}, adegan ${n} dari ${total}`,
  },
  preview: {
    statusSituation: "Pratinjau panggung: situasi awal.",
    statusReaction: (id: ChoiceId) => `Pratinjau panggung: reaksi pilihan ${id}.`,
    stageReaction: (id: ChoiceId) => `Tampilan reaksi pilihan ${id}.`,
    nav: "Navigasi pratinjau",
    sceneGroup: "Adegan",
    viewGroup: "Tampilan",
    sceneChip: (n: number, title: string) => `Adegan ${n}: ${title}`,
    situation: "Situasi",
    reaction: (id: ChoiceId) => `Reaksi ${id}`,
    close: "Tutup pratinjau",
  },
} as const;
