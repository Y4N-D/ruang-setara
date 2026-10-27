// Teks antarmuka Sehari Setara.
// Semua teks yang tampil ke pengguna berasal dari folder content/ (Architecture bagian 14).
// Teks F-01 mengikuti docs/sehari-setara/specs/F-01-kerangka-halaman.md; teks F-04 mengikuti specs/F-04-panggung.md;
// teks F-05 mengikuti specs/F-05-panel-narasi-pilihan.md; teks F-06 mengikuti specs/F-06-indikator-kartu-dampak.md;
// teks F-07 mengikuti specs/F-07-tim-waktu-bintang.md; teks F-08 mengikuti specs/F-08-kuis-peran.md;
// teks F-09 mengikuti specs/F-09-akhir-rekap-refleksi.md (judul, pesan, dan teks alternatif akhir ada di endings.ts).
import type { ChoiceId, Tier, TimeOfDay } from "../engine/types";

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
    ending: "Akhir hari",
    endingLabel: (clock: string) => `Pukul ${clock}, akhir hari`,
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
    stageReaction: (id: ChoiceId) => `Reaksi tokoh atas pilihan ${id}.`,
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
    top: "Bintang terbanyak",
    sentence: (name: string, active: boolean, stars: number, top: boolean) =>
      `${name}, ${active ? "giliran, " : ""}${stars} bintang${top ? ", bintang terbanyak" : ""}.`,
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
  quiz: {
    title: "Kuis peran",
    group: "Peran penegak hukum",
    closed: "?",
    answer: (role: string) => `Jawaban kelas: ${role}.`,
    mark: { tepat: "Jawaban tepat", pilihan: "Pilihan kelas" },
    verdict: { tepat: "Tepat!", belum: "Belum tepat." },
    // Menyebut jawaban naskah adegan 5 (roleQuiz.answer, hakim); quiz.test.ts memeriksa nama peran di awal kalimat.
    reason: "Hakimlah yang memeriksa, mengadili, dan memutus perkara.",
    closing: "Setiap peran punya tugas sendiri agar perkara diproses dengan adil.",
    cardName: (n: number, role: string) => `Peran ${n}: ${role}`,
    choicesIntro: "Pilihannya:",
    dutiesIntro: "Tugas setiap peran.",
  },
  // Layar akhir, rekap, refleksi, dan unduh rekap (F-09).
  closing: {
    heading: { ending: "Akhir hari", recap: "Rekap pilihan kelas", reflection: "Refleksi" },
    ending: {
      next: "Lihat rekap",
      announceTitle: (title: string) => `Akhir hari: ${title}.`,
      meter: (label: string, value: number) => `${label} ${value}.`,
    },
    // Nama indikator ditulis huruf kecil di dalam kalimat (AGENTS bagian 8).
    scale: {
      seimbang: "Timbangan seimbang.",
      sedikit: {
        hak: "Timbangan sedikit miring ke sisi hak orang lain terjaga.",
        kewajiban: "Timbangan sedikit miring ke sisi kewajiban dijalankan.",
        sama: "Timbangan sedikit miring.",
      },
      miring: {
        hak: "Timbangan miring ke sisi hak orang lain terjaga.",
        kewajiban: "Timbangan miring ke sisi kewajiban dijalankan.",
        sama: "Timbangan miring.",
      },
    },
    recap: {
      title: "Rekap pilihan kelas",
      list: "Rekap pilihan kelas",
      time: { pagi: "Pagi", siang: "Siang", sore: "Sore", malam: "Malam" } satisfies Record<TimeOfDay, string>,
      page: (time: string, page: number, total: number) => `${time} · halaman ${page} dari ${total}`,
      columns: {
        choice: "Pilihan kelas",
        best: "Pilihan yang paling menjaga keseimbangan",
        refs: "Rujukan",
      },
      clock: (clock: string) => `Pukul ${clock}`,
      team: (name: string, stars: number) => `${name}, ${stars} bintang`,
      same: "Sama dengan pilihan kelas.",
      quizWrong: (answer: string, correct: string) => `Kuis peran: jawaban kelas ${answer}, jawaban tepat ${correct}.`,
      quizCorrect: (correct: string) => `Kuis peran: jawaban kelas ${correct}, tepat.`,
      prev: "Sebelumnya",
      next: "Berikutnya",
      toReflection: "Lanjut ke refleksi",
      prefix: {
        scene: (n: number) => `Adegan ${n}: `,
        choice: (id: ChoiceId) => `Pilihan kelas ${id}: `,
        best: (id: ChoiceId) => `Pilihan yang paling menjaga keseimbangan ${id}: `,
        bestSame: "Pilihan yang paling menjaga keseimbangan: ",
        refs: "Rujukan: ",
      },
      announce: {
        page: (time: string, page: number, total: number) => `Rekap pilihan kelas, ${time}, halaman ${page} dari ${total}.`,
        scene: (n: number, title: string, clock: string) => `Adegan ${n}, ${title}, pukul ${clock}.`,
        team: (name: string, stars: number) => `${name}, ${stars} bintang.`,
        choice: (id: ChoiceId, text: string) => `Pilihan kelas ${id}: ${text}`,
        best: (id: ChoiceId, text: string) => `Pilihan yang paling menjaga keseimbangan ${id}: ${text}`,
        bestSame: "Pilihan yang paling menjaga keseimbangan: sama dengan pilihan kelas.",
        refs: (list: string) => `Rujukan: ${list}`,
      },
    },
    reflection: {
      title: "Refleksi",
      lead: "Tulis jawabanmu di buku catatan.",
      prompts: [
        "Pilihan mana yang paling sulit diputuskan kelasmu hari ini, dan mengapa?",
        "Hak siapa yang terdampak oleh pilihan itu, dan pasal mana di rekap yang berkaitan dengannya?",
        "Bila kamu mengalami situasi serupa, apa yang akan kamu lakukan agar hak orang lain terjaga dan kewajibanmu tetap dijalankan?",
      ],
      list: "Kalimat pemantik",
      playAgain: "Main lagi",
    },
    download: {
      button: { png: "Unduh gambar", pdf: "Unduh PDF" },
      name: { png: "Unduh gambar rekap (PNG)", pdf: "Unduh PDF rekap (A4)" },
      preparing: { png: "Menyiapkan gambar rekap…", pdf: "Menyiapkan PDF rekap…" },
      done: { png: "Gambar rekap siap. Periksa folder unduhan.", pdf: "PDF rekap siap. Periksa folder unduhan." },
      failed: "Rekap gagal dibuat. Coba lagi.",
    },
    sheet: {
      title: "Sehari Setara · Rekap pilihan kelas",
      ending: (title: string) => `Akhir hari: ${title}`,
      foot: "Ruang Setara · Pendidikan Pancasila kelas IX",
    },
  },
} as const;
