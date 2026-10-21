// Naskah enam adegan Sehari Setara (PRD bagian 8; spesifikasi F-03).
// Teks pilihan, efek, tingkat, dan situasi wajib sama dengan PRD bagian 8; uji konten memeriksanya.
// Rujukan memakai kode di references.ts; status verifikasinya ada di docs/sehari-setara/Verifikasi_Rujukan.md.
import type { CastSlot, CharId, Choice, PoseId, Reference, Scene } from "../engine/types";
import { ref } from "./references";

/** Satu tokoh di panggung. x adalah posisi tengah dalam piksel panggung (0–320). */
const at = (char: CharId, pose: PoseId, x: number, facing: CastSlot["facing"]): CastSlot => ({
  char,
  pose,
  x,
  facing,
});

/** Hak, kewajiban, dan rujukan berlaku sama untuk ketiga pilihan satu adegan (PRD bagian 8). */
function impactFor(hak: string, kewajiban: string, rujukan: Reference[]) {
  return (terjadi: string): Choice["impact"] => ({ terjadi, hak, kewajiban, rujukan });
}

const s1Impact = impactFor(
  "Hak anak atas pengasuhan dan perlindungan.",
  "Kewajiban anak menghormati orang tua dan menyayangi keluarga.",
  [ref("R-01"), ref("R-02")],
);

const s1: Scene = {
  id: "s1",
  title: "Pagi di rumah",
  clock: "06.15",
  timeOfDay: "pagi",
  bg: "bg_s1_rumah_pagi",
  altText:
    "Dapur dan ruang depan rumah Nara pukul 06.15. Ibu membawa keranjang dan berbicara kepada Nara, sementara Gita berdiri di samping kakaknya.",
  cast: [at("gita", "happy", 124, "right"), at("nara", "idle", 152, "right"), at("ibu", "talk", 206, "left")],
  narration: [
    "Ibu harus berangkat lebih awal ke pasar. Gita, adik Nara yang kelas 3 SD, belum siap.",
    "Ibu meminta Nara mengantar Gita ke sekolahnya yang searah. Nara khawatir terlambat piket kelas.",
  ],
  question: "Apa yang sebaiknya Nara lakukan terhadap permintaan Ibu?",
  choices: [
    {
      id: "A",
      text: "Menolak karena “itu tugas Ibu”, lalu berangkat sendiri",
      effects: { hak: -10, kewajiban: -15 },
      tier: "kurang",
      reaction: [at("gita", "sad", 124, "right"), at("nara", "talk", 152, "right"), at("ibu", "sad", 206, "left")],
      emote: { char: "ibu", icon: "keringat" },
      impact: s1Impact(
        "Ibu terlambat berangkat ke pasar karena harus mengantar Gita lebih dulu. Gita merasa kakaknya tidak peduli.",
      ),
    },
    {
      id: "B",
      text: "Mengantar Gita, lalu memberi tahu ketua kelas akan sedikit terlambat dan mengganti piket saat istirahat",
      effects: { hak: 10, kewajiban: 15 },
      tier: "tepat",
      reaction: [at("gita", "happy", 124, "right"), at("nara", "happy", 152, "right"), at("ibu", "happy", 206, "left")],
      emote: { char: "gita", icon: "hati" },
      impact: s1Impact(
        "Gita tiba di sekolah tepat waktu, dan Ibu bisa berangkat dengan tenang. Ketua kelas mengerti, dan Nara tetap menjalankan piket saat istirahat.",
      ),
    },
    {
      id: "C",
      text: "Mengantar Gita sambil menggerutu dan memarahinya sepanjang jalan",
      effects: { hak: -5, kewajiban: 5 },
      tier: "kurang",
      reaction: [at("gita", "sad", 124, "right"), at("nara", "talk", 152, "left"), at("ibu", "sad", 206, "left")],
      emote: { char: "gita", icon: "keringat" },
      impact: s1Impact(
        "Gita sampai di sekolah dengan murung karena dimarahi sepanjang jalan. Nara memang membantu, tetapi tanpa hormat dan kasih sayang.",
      ),
    },
  ],
};

const s2Impact = impactFor(
  "Hak atas pendidikan dan rasa aman.",
  "Kewajiban menaati aturan lalu lintas.",
  [ref("R-03"), ref("R-04"), ref("R-05"), ref("R-06")],
);

const s2: Scene = {
  id: "s2",
  title: "Perjalanan ke sekolah",
  clock: "06.50",
  timeOfDay: "pagi",
  bg: "bg_s2_jalan_pagi",
  altText:
    "Tepi jalan dekat sekolah pada pagi hari. Dimas duduk di atas motor tanpa helm dan menawarkan boncengan kepada Nara yang berdiri di bahu jalan.",
  cast: [at("dimas", "motor", 168, "right"), at("nara", "idle", 228, "left")],
  narration: [
    "Dimas, teman sekelas, berhenti dengan motor. Ia belum punya SIM dan tidak membawa helm cadangan. Ia menawarkan boncengan agar Nara tidak terlambat.",
  ],
  question: "Apa yang sebaiknya Nara lakukan terhadap tawaran Dimas?",
  choices: [
    {
      id: "A",
      text: "Ikut tanpa helm karena “cuma dekat”",
      effects: { hak: -10, kewajiban: -20 },
      tier: "berisiko",
      reaction: [at("dimas", "sad", 168, "right"), at("nara", "sad", 228, "left")],
      emote: { char: "nara", icon: "seru" },
      impact: s2Impact(
        "Nara sampai lebih cepat, tetapi berboncengan tanpa helm dengan pengendara yang belum punya SIM membahayakan keselamatan keduanya. Mereka juga melanggar aturan lalu lintas.",
      ),
    },
    {
      id: "B",
      text: "Menolak dengan sopan, berjalan cepat atau naik angkot, dan mengingatkan Dimas memakai helm",
      effects: { hak: 10, kewajiban: 15 },
      tier: "tepat",
      reaction: [at("dimas", "happy", 168, "right"), at("nara", "talk", 228, "left")],
      emote: { char: "dimas", icon: "hati" },
      impact: s2Impact(
        "Nara tetap sampai di sekolah dengan aman tanpa melanggar aturan. Dimas jadi berpikir ulang untuk berkendara tanpa helm dan tanpa SIM.",
      ),
    },
    {
      id: "C",
      text: "Ikut setelah meminjam helm di warung",
      effects: { hak: 0, kewajiban: -5 },
      tier: "kurang",
      reaction: [at("dimas", "sad", 168, "right"), at("nara", "sad", 228, "left")],
      emote: { char: "nara", icon: "keringat" },
      impact: s2Impact(
        "Nara memakai helm pinjaman, tetapi Dimas tetap berkendara tanpa helm dan tanpa SIM. Bahayanya sedikit berkurang, tetapi aturan lalu lintas masih dilanggar.",
      ),
    },
  ],
};

const s3Impact = impactFor(
  "Kebebasan menyampaikan pendapat.",
  "Kewajiban menghormati hak orang lain dalam musyawarah.",
  [ref("R-07"), ref("R-08")],
);

const s3: Scene = {
  id: "s3",
  title: "Diskusi kelompok di kelas",
  clock: "09.00",
  timeOfDay: "siang",
  bg: "bg_s3_kelas_siang",
  altText:
    "Ruang kelas pukul 09.00. Nara menjelaskan usulannya kepada kelompok, Sinta memotong, dan Bu Ratih mendampingi kelompok lain di meja sebelah kanan.",
  cast: [at("nara", "talk", 140, "right"), at("sinta", "talk", 186, "left"), at("ratih", "idle", 268, "right")],
  narration: [
    "Kelompok merencanakan proyek “Kelas Ramah”. Nara mengusulkan pojok baca, tetapi Sinta memotong dan menyebut ide itu membosankan. Bu Ratih sedang mendampingi kelompok lain.",
  ],
  question: "Apa yang sebaiknya Nara lakukan saat usulannya dipotong?",
  choices: [
    {
      id: "A",
      text: "Membalas dengan mengejek usulan Sinta",
      effects: { hak: -15, kewajiban: -10 },
      tier: "kurang",
      reaction: [at("nara", "talk", 140, "right"), at("sinta", "sad", 186, "left"), at("ratih", "idle", 268, "right")],
      emote: { char: "sinta", icon: "keringat" },
      impact: s3Impact(
        "Diskusi berubah menjadi saling ejek, dan kelompok tidak menghasilkan keputusan. Sinta merasa direndahkan.",
      ),
    },
    {
      id: "B",
      text: "Meminta kesempatan menyelesaikan penjelasan, lalu mempersilakan Sinta memaparkan usulannya; kelompok memutuskan dengan alasan",
      effects: { hak: 15, kewajiban: 10 },
      tier: "tepat",
      reaction: [at("nara", "happy", 140, "right"), at("sinta", "happy", 186, "left"), at("ratih", "idle", 268, "right")],
      emote: { char: "sinta", icon: "hati" },
      impact: s3Impact(
        "Kedua usulan didengar sampai selesai, lalu kelompok memilih berdasarkan alasan yang paling kuat. Semua anggota merasa dihargai.",
      ),
    },
    {
      id: "C",
      text: "Diam dan mengalah walau punya alasan kuat",
      effects: { hak: 0, kewajiban: -5 },
      tier: "kurang",
      reaction: [at("nara", "sad", 140, "right"), at("sinta", "talk", 186, "left"), at("ratih", "idle", 268, "right")],
      emote: { char: "nara", icon: "keringat" },
      impact: s3Impact(
        "Diskusi tampak tenang, tetapi usulan Nara yang beralasan kuat tidak pernah dibahas. Kelompok kehilangan satu pilihan yang baik.",
      ),
    },
  ],
};

const s4Impact = impactFor(
  "Hak anak atas perlindungan dari kekerasan dan diskriminasi.",
  "Kewajiban tidak merendahkan orang lain.",
  [ref("R-01"), ref("R-03"), ref("R-08")],
);

/** Susunan saat ejekan berlanjut (pratinjau reaksi kurang adegan 4, untuk pilihan A dan C). */
const s4Ejekan: CastSlot[] = [
  at("komang", "sad", 64, "right"),
  at("siswa", "merekam", 150, "left"),
  at("siswa", "tertawa", 184, "left"),
  at("nara", "sad", 236, "left"),
];

const s4: Scene = {
  id: "s4",
  title: "Jam istirahat",
  clock: "10.15",
  timeOfDay: "siang",
  bg: "bg_s4_koridor_siang",
  altText:
    "Selasar sekolah dekat kantin saat istirahat. Komang memegang sepatunya yang robek, dua siswa menertawakan dan merekamnya dari kejauhan, dan Nara melihat dari dekat kantin.",
  cast: [
    at("komang", "sad", 64, "right"),
    at("siswa", "merekam", 150, "left"),
    at("siswa", "tertawa", 184, "left"),
    at("nara", "idle", 236, "left"),
  ],
  narration: [
    "Komang, adik kelas VII, ditertawakan sekelompok siswa karena sepatunya robek. Salah satu dari mereka merekamnya.",
  ],
  question: "Apa yang sebaiknya Nara lakukan saat melihat Komang ditertawakan?",
  choices: [
    {
      id: "A",
      text: "Ikut tertawa agar tidak dianggap aneh",
      effects: { hak: -20, kewajiban: -10 },
      tier: "berisiko",
      reaction: s4Ejekan,
      emote: { char: "komang", icon: "seru" },
      impact: s4Impact(
        "Tawa itu membuat Komang makin malu, dan rekaman ejekan terus beredar. Nara ikut merendahkan adik kelasnya.",
      ),
    },
    {
      id: "B",
      text: "Mendekati Komang, mengajaknya menjauh, lalu melapor kepada Bu Ratih (guru BK)",
      effects: { hak: 20, kewajiban: 10 },
      tier: "tepat",
      setsFlag: "komangDibela",
      reaction: [at("komang", "happy", 112, "right"), at("nara", "happy", 146, "left"), at("ratih", "talk", 206, "left")],
      emote: { char: "komang", icon: "hati" },
      impact: s4Impact(
        "Komang tidak lagi sendirian, dan Bu Ratih segera menanggapi laporan itu. Siswa yang mengejek dan merekam dipanggil untuk dibina.",
      ),
    },
    {
      id: "C",
      text: "Pura-pura tidak melihat",
      effects: { hak: -10, kewajiban: -5 },
      tier: "kurang",
      reaction: s4Ejekan,
      emote: { char: "komang", icon: "keringat" },
      impact: s4Impact("Ejekan berlanjut karena tidak ada yang menghentikannya. Komang menghadapi rasa malunya sendirian."),
    },
  ],
};

const s5Impact = impactFor(
  "Hak atas kepastian hukum yang adil dan perlakuan yang sama di hadapan hukum.",
  "Kewajiban menghormati proses hukum.",
  [ref("R-09"), ref("R-03"), ref("R-10"), ref("R-11"), ref("R-12")],
);

/** Susunan saat tuduhan berlanjut (pratinjau reaksi kurang adegan 5, untuk pilihan A dan C). */
const s5Tuduhan: CastSlot[] = [
  at("bayu", "idle", 40, "right"),
  at("warga", "a", 106, "left"),
  at("nara", "sad", 202, "right"),
  at("made", "sad", 256, "right"),
];

const s5: Scene = {
  id: "s5",
  title: "Sore di lingkungan rumah",
  clock: "16.30",
  timeOfDay: "sore",
  bg: "bg_s5_kampung_sore",
  altText:
    "Jalan kampung di depan warung pada sore hari; di ujung atap warung ada kamera CCTV kecil. Seorang warga menuduh Bayu, pemuda yang baru pindah, sementara Pak Made menunjuk ke depan warung tempat sepedanya diparkir.",
  cast: [
    at("bayu", "idle", 40, "right"),
    at("warga", "a", 106, "left"),
    at("nara", "idle", 202, "right"),
    at("made", "talk", 256, "right"),
  ],
  narration: [
    "Sepeda Pak Made hilang dari depan warung. Beberapa warga langsung menuduh Bayu, pemuda yang baru pindah, dan ingin mendatanginya beramai-ramai. Nara ingat warung itu punya kamera CCTV.",
  ],
  question: "Apa yang sebaiknya Nara lakukan saat warga menuduh Bayu?",
  choices: [
    {
      id: "A",
      text: "Ikut menyebarkan foto Bayu ke grup warga dengan tulisan “pencuri”",
      effects: { hak: -20, kewajiban: -15 },
      tier: "berisiko",
      reaction: s5Tuduhan,
      emote: { char: "bayu", icon: "seru" },
      impact: s5Impact(
        "Foto Bayu tersebar dengan tuduhan yang belum terbukti, dan nama baiknya tercemar. Sepeda Pak Made pun belum ditemukan.",
      ),
    },
    {
      id: "B",
      text: "Menyarankan Pak Made melapor kepada Ketua RT dan polisi dengan membawa rekaman CCTV, serta mengingatkan warga agar tidak main hakim sendiri",
      effects: { hak: 15, kewajiban: 15 },
      tier: "tepat",
      reaction: [at("bayu", "happy", 118, "right"), at("made", "happy", 170, "left"), at("nara", "happy", 218, "left")],
      emote: { char: "bayu", icon: "hati" },
      impact: s5Impact(
        "Polisi menerima laporan dan memeriksa rekaman CCTV, yang menunjukkan bahwa bukan Bayu yang mengambil sepeda. Warga batal main hakim sendiri, dan nama baik Bayu terjaga.",
      ),
    },
    {
      id: "C",
      text: "Pulang saja karena merasa bukan urusannya",
      effects: { hak: -5, kewajiban: -5 },
      tier: "kurang",
      reaction: s5Tuduhan,
      emote: { char: "made", icon: "keringat" },
      impact: s5Impact(
        "Warga mendatangi Bayu beramai-ramai tanpa bukti, dan tidak ada yang mengingatkan mereka. Masalahnya tidak selesai, dan suasana kampung menjadi tegang.",
      ),
    },
  ],
  roleQuiz: {
    question: "Jika perkara ini sampai ke pengadilan, siapa yang memeriksa, mengadili, dan memutusnya?",
    answer: "hakim",
  },
};

const s6Impact = impactFor(
  "Hak atas rasa aman, kehormatan, dan martabat.",
  "Kewajiban menghormati privasi dan tidak merendahkan orang lain.",
  [ref("R-07"), ref("R-03"), ref("R-08")],
);

/** Untuk sementara reaksi adegan 6 memakai pose memegang HP ditambah ikon emosi (keputusan pemilik proyek). */
const s6Nara: CastSlot[] = [at("nara", "phone", 168, "right")];

const s6: Scene = {
  id: "s6",
  title: "Malam, media sosial",
  clock: "20.00",
  timeOfDay: "malam",
  bg: "bg_s6_kamar_malam",
  altText: "Kamar Nara pukul 20.00 dengan lampu meja menyala. Nara memegang HP dan membaca pesan di grup kelas.",
  cast: s6Nara,
  narration: ["Video Komang tadi siang beredar di grup kelas dengan stiker ejekan. Banyak yang membalas dengan tawa."],
  narrationIfFlag: {
    flag: "komangDibela",
    present: ["Komang mengirim pesan pribadi, “Kak, videonya disebar. Aku malu besok ke sekolah.”"],
    absent: ["Malam itu Komang tidak membalas pesan siapa pun."],
  },
  question: "Apa yang sebaiknya Nara lakukan dengan video itu?",
  choices: [
    {
      id: "A",
      text: "Meneruskan video ke grup lain karena “sudah viral”",
      effects: { hak: -20, kewajiban: -15 },
      tier: "berisiko",
      reaction: s6Nara,
      emote: { char: "nara", icon: "seru" },
      impact: s6Impact(
        "Video itu menyebar makin jauh, dan makin banyak orang menertawakan Komang. Sekali tersebar, video sulit ditarik kembali.",
      ),
    },
    {
      id: "B",
      text: "Tidak menyebarkan, meminta video dihapus, mendukung Komang, dan melapor kepada wali kelas atau guru BK besok pagi",
      textIfFlag: {
        flag: "komangDibela",
        text: "Membalas pesan Komang, meminta video dihapus di grup, dan melapor bersama Komang besok pagi",
      },
      effects: { hak: 20, kewajiban: 15 },
      tier: "tepat",
      reaction: s6Nara,
      emote: { char: "nara", icon: "hati" },
      impact: s6Impact(
        "Video dihapus dari grup, dan Komang tahu ada yang membelanya. Keesokan harinya, guru membantu menyelesaikan masalah itu.",
      ),
    },
    {
      id: "C",
      text: "Keluar dari grup tanpa berbuat apa-apa",
      effects: { hak: -5, kewajiban: 0 },
      tier: "kurang",
      reaction: s6Nara,
      emote: { char: "nara", icon: "keringat" },
      impact: s6Impact(
        "Nara tidak lagi melihat ejekan itu, tetapi video tetap beredar di grup. Komang tetap tidak mendapat bantuan.",
      ),
    },
  ],
};

export const SCENES: readonly Scene[] = [s1, s2, s3, s4, s5, s6];
