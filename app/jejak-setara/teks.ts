// Semua teks yang tampil di Jejak Setara (Architecture bagian 17; spesifikasi JS-01 dan JS-03).
// Kedua judul tab ditulis di index.html; nilainya di sini dipakai uji untuk memastikan keduanya sama.
// Teks dengan {n} atau {kode} diisi lewat isiTeks().
import type { KodeGalat } from "./inti/protokol";

export const TEKS = {
  judulTabPemain: "Jejak Setara",
  judulTabKonsol: "Konsol admin · Jejak Setara",
  judul: "Jejak Setara",
  konsolJudul: "Konsol admin",
  konsolIsi: "Konsol sedang disiapkan.",
  serverMemeriksa: "Memeriksa server…",
  serverSiap: "Server siap",
  serverBelum: "Server belum tersambung",
  tandaSiap: "✓",
  tandaBelum: "!",
  kode: {
    label: "Kode ruang",
    petunjuk: "Ketik 5 huruf atau angka dari layar guru.",
    tombol: "Masuk",
    memeriksa: "Memeriksa kode…",
    galatFormat: "Kode berisi 5 huruf atau angka.",
    galatJaringan: "Tidak bisa menghubungi server. Periksa wifi atau data selulermu.",
    galatTerlaluSering: "Terlalu banyak percobaan. Tunggu sebentar.",
  },
  absen: {
    judul: "Nomor absen",
    label: "Nomor absenmu",
    petunjuk: "Isi nomor absen dari daftar kelas (1–50).",
    tombol: "Lanjut",
    galatRentang: "Nomor absen harus 1 sampai 50.",
  },
  menghubungkan: "Menghubungkan ke ruang…",
  identitas: {
    judul: "Pilih nama dan avatar",
    kelompokNama: "Nama samaran",
    acak: "Acak ulang",
    kelompokAvatar: "Avatar",
    avatar: "Avatar {n}",
    gabung: "Gabung",
  },
  lobi: {
    judul: "Lobi",
    labelKode: "Kode ruang",
    jumlah: "{n} pemain di ruang",
    menunggu: "Menunggu guru memulai…",
    saran: "Jangan tutup tab ini.",
  },
  ronde: {
    bersiap: "Bersiap",
    berjalan: "Ronde berjalan",
    sisaWaktu: "Sisa waktu",
    dijeda: "Dijeda oleh guru",
    selesai: "Ronde selesai",
    selesaiIsi: "Tunggu arahan guru.",
    ditutup: "Ruang ditutup",
    ditutupIsi: "Terima kasih sudah bermain.",
  },
  menyambung: {
    judul: "Menyambung ulang…",
    lama: "Periksa wifi atau data selulermu.",
  },
  tombol: { kembali: "Kembali", muatUlang: "Muat ulang" },
  pengumuman: {
    lobi: "Kamu sudah masuk lobi.",
    mulai: "Ronde dimulai.",
    jeda: "Ronde dijeda.",
    lanjut: "Ronde dilanjutkan.",
    selesai: "Ronde selesai.",
    menyambung: "Menyambung ulang.",
    tersambung: "Tersambung kembali.",
  },
  galat: {
    RUANG_TIDAK_ADA: "Kode ruang tidak ditemukan. Periksa lagi kodenya.",
    RUANG_PENUH: "Ruang sudah penuh. Beri tahu gurumu.",
    RUANG_TERKUNCI: "Ruang sudah dikunci guru.",
    TERLAMBAT: "Ronde sudah berjalan terlalu lama untuk bergabung.",
    NAMA_DIPAKAI: "Nama itu baru saja dipakai pemain lain. Pilih nama lain.",
    VERSI_BERBEDA: "Ada pembaruan. Muat ulang halaman.",
    TERLALU_CEPAT: "Pesan terlalu cepat.",
    DIKELUARKAN: "Kamu dikeluarkan dari ruang oleh guru.",
    BUKAN_JANGKAUAN: "Terlalu jauh dari kejadian.",
    NOMOR_ABSEN_DIPAKAI: "Nomor absen ini sudah dipakai di ruang ini. Periksa lagi nomormu.",
  } satisfies Record<KodeGalat, string>,
  api: {
    KUNCI_SALAH: "Kunci ruang coba tidak cocok.",
    PENGATURAN_SALAH: "Pengaturan ruang tidak sah.",
    PENGATURAN_ABSEN: "Mode nomor absen hanya untuk ruang sampai 50 pemain.",
    KODE_HABIS: "Gagal membuat kode ruang. Coba lagi.",
    RUANG_GAGAL: "Ruang gagal dibuat. Coba lagi.",
    PERLU_WEBSOCKET: "Alamat ini hanya untuk sambungan permainan.",
    ASAL_DITOLAK: "Permintaan ditolak.",
    PESAN_SALAH: "Pesan tidak sah.",
    TERLALU_SERING: "Terlalu banyak percobaan. Tunggu sebentar.",
    RUANG_TIDAK_ADA: "Kode ruang tidak ditemukan. Periksa lagi kodenya.",
  },
} as const;

/** Mengisi {nama} di dalam teks, misalnya isiTeks(TEKS.lobi.jumlah, { n: 3 }). */
export function isiTeks(teks: string, nilai: Record<string, string | number>): string {
  return teks.replace(/\{(\w+)\}/g, (asli, kunci: string) => (kunci in nilai ? String(nilai[kunci]) : asli));
}
