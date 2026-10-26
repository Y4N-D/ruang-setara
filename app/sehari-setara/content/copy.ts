// Teks antarmuka Sehari Setara.
// Semua teks yang tampil ke pengguna berasal dari folder content/ (Architecture bagian 14).
// Teks F-01 mengikuti docs/sehari-setara/specs/F-01-kerangka-halaman.md; teks F-04 mengikuti specs/F-04-panggung.md;
// teks F-05 mengikuti specs/F-05-panel-narasi-pilihan.md; teks F-06 mengikuti specs/F-06-indikator-kartu-dampak.md;
// teks F-07 mengikuti specs/F-07-tim-waktu-bintang.md.
import type { ChoiceId, Tier } from "../engine/types";

export const copy = {
  gameName: "Sehari Setara",
  backToGallery: "Kembali ke galeri",
  placeholder: {
    lead: "Temani Nara menjalani satu hari dan pilih tindakannya bersama kelas.",
    status: "Permainan ini sedang dibuat.",
    previewLink: "Lihat pratinjau panggung",
    playLink: "Coba alur permainan",
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
  play: {
    heading: (n: number, title: string) => `Adegan ${n}: ${title}`,
    next: "Lanjut",
    showChoices: "Tampilkan pilihan",
    choicePrefix: (id: ChoiceId) => `Pilihan ${id}: `,
    chosenMark: " (dipilih)",
    chosen: (id: ChoiceId) => `Kelas memilih ${id}.`,
    bridgeNext: "Lanjut",
    stageReaction: (id: ChoiceId) => `Reaksi tokoh atas pilihan ${id}.`,
    endTitle: "Keenam adegan selesai",
    endLead: "Terima kasih sudah menemani Nara sampai malam.",
    endStatus: "Layar akhir, rekap, dan refleksi sedang dibuat.",
    playAgain: "Main lagi dari adegan 1",
  },
  meters: {
    group: "Indikator",
    hak: "Hak orang lain terjaga",
    kewajiban: "Kewajiban dijalankan",
    valueText: (value: number) => `${value} dari 100`,
    sentence: (label: string, effect: string, value: number, same: boolean) =>
      `${label} ${effect}, ${same ? "tetap" : "menjadi"} ${value}.`,
  },
  impact: {
    titlePrefix: "Kartu dampak: ",
    tier: { tepat: "Tepat", kurang: "Kurang tepat", berisiko: "Berisiko" } satisfies Record<Tier, string>,
    terjadi: "Yang terjadi",
    hak: "Hak yang terdampak",
    kewajiban: "Kewajiban terkait",
    rujukan: "Rujukan",
  },
  teams: {
    board: "Papan tim",
    turn: "Giliran",
    sentence: (name: string, active: boolean, stars: number) => `${name}, ${active ? "giliran, " : ""}${stars} bintang.`,
  },
  timer: {
    group: "Pengatur waktu",
    running: "Waktu diskusi",
    paused: "Waktu dijeda",
    over: "Waktunya memilih",
    remaining: (duration: string) => `Sisa ${duration}`,
    none: "Waktu habis",
    pause: "Jeda",
    add: "+30",
    addName: "+30 detik",
    skip: "Lewati",
    skipName: "Lewati diskusi",
    seconds: (n: number) => `${n} detik`,
    minutes: (n: number) => `${n} menit`,
    minutesSeconds: (m: number, s: number) => `${m} menit ${s} detik`,
    announce: {
      start: (duration: string) => `Waktu diskusi ${duration} dimulai.`,
      last: (duration: string) => `Sisa waktu ${duration}.`,
      over: "Waktunya memilih.",
      pause: (duration: string) => `Waktu dijeda. Sisa ${duration}.`,
      resume: (duration: string) => `Waktu berjalan lagi. Sisa ${duration}.`,
      add: (duration: string) => `Waktu ditambah 30 detik. Sisa ${duration}.`,
      skip: "Diskusi dilewati. Waktunya memilih.",
    },
  },
  stars: {
    prompt: (name: string) => `Bintang alasan untuk ${name}`,
    buttonName: (n: number) => `${n} bintang`,
    announce: (name: string, n: number, total: number) => `${name} mendapat ${n} bintang. Jumlah bintangnya sekarang ${total}.`,
  },
  sound: {
    off: "Suara dimatikan.",
    on: "Suara dinyalakan.",
  },
} as const;
