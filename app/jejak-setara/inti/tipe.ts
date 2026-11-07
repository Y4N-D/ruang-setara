// Tipe bersama Jejak Setara untuk klien dan server (Architecture 5.1 dan 11.1; spesifikasi JS-02).
// Berkas ini hanya berisi tipe, tanpa nilai. Satuan: posisi pemain dalam piksel logis,
// koordinat peta dalam ubin (16 piksel logis), waktu dalam milidetik jam server.

export type ZonaId = "z1" | "z2" | "z3" | "z4" | "z5" | "z6" | "z7" | "z8";
export type Masa = "pagi" | "siang" | "sore";
export type Tingkat = "tepat" | "kurang" | "berisiko";
export type SkillId = "lari" | "kompas" | "petunjuk" | "teropong" | "angkot";
export type Arah = "bawah" | "atas" | "kanan" | "kiri";
export type StatusRuang = "lobi" | "hitung_mundur" | "main" | "jeda" | "selesai" | "pembahasan" | "ditutup";

export interface Opsi1 {
  id: string;
  teks: string;
  benar: boolean;
  umpanBalik: string;
}

export interface Opsi2 {
  id: string;
  teks: string;
  tingkat: Tingkat;
  terjadi: string;
}

/** Satu versi kejadian (Architecture 5.1). */
export interface IsiKejadian {
  kode: string; // "K-13"
  judul: string;
  zona: ZonaId;
  setTokoh: string[]; // kunci tokoh dan properti dari manifest
  situasi: string; // paling banyak 3 kalimat
  langkah1: { pertanyaan: string; opsi: [Opsi1, Opsi1, Opsi1, Opsi1]; petunjuk: string };
  langkah2: { pertanyaan: string; opsi: [Opsi2, Opsi2, Opsi2] };
  kartu: { hak: string; kewajiban: string; rujukan: string[] }; // id rujukan JR-xx
  topik: string; // misalnya "Hak atas kesehatan"
  jenis: "pelanggaran_hak" | "pengabaian_kewajiban" | "keduanya";
}

export interface PengaturanRuang {
  durasiMenit: 10 | 15 | 20;
  batasPemain: number; // 2–50, bawaan 40
  batasTerlambatMenit: number; // 0–10, bawaan 5
  skillAktif: SkillId[];
  modeNomorAbsen: boolean;
  uji: boolean; // ruang uji: tidak masuk statistik
}

// Tipe tambahan JS-02.

/** Isi kotak bantuan menurut tempatnya (PRD 8.5). */
export type KotakJenis = "sepatu" | "kompas" | "buku" | "teropong" | "karcis";

/** Warna tas penanda pemain, delapan aksen Design System bagian 8. */
export type WarnaTas = "sun" | "mango" | "coral" | "rose" | "berry" | "teal" | "leaf" | "sky-d";

/** Titik dalam piksel logis. Posisi pemain adalah titik kakinya: x di tengah, y di bawah. */
export interface Posisi {
  x: number;
  y: number;
}

/** Titik di peta dalam ubin: titik kejadian atau halte. */
export interface TitikPeta {
  id: string;
  zona: ZonaId;
  x: number;
  y: number;
}

/**
 * Peta kampung (Architecture 11.1.1). `kampung.json` berbentuk `PetaJejak<string>`: lapisan `ubin`
 * dan `tabrakan` berupa teks RLE. `bacaPeta` memeriksanya lalu mengembalikan `PetaJejak` dengan
 * kedua lapisan terurai menjadi satu byte per sel, baris demi baris dari kiri-atas.
 */
export interface PetaJejak<Lapisan = Uint8Array> {
  versi: 1;
  lebar: number; // ubin
  tinggi: number; // ubin
  ukuranUbin: 16;
  ubin: Lapisan; // nilai 0–63 per sel
  tabrakan: Lapisan; // 0 kosong, 1 padat
  objek: { id: string; jenis: string; x: number; y: number; arah?: Arah }[];
  zona: { id: ZonaId; nama: string; kiri: number; atas: number; kanan: number; bawah: number }[]; // batas inklusif
  titikKejadian: TitikPeta[];
  kotak: { id: string; jenis: KotakJenis; zona: ZonaId; x: number; y: number }[];
  halte: TitikPeta[];
  gerbangLobi: { kiri: number; atas: number; kanan: number; bawah: number }; // ubin gerbang, batas inklusif
  titikMuncul: { x: number; y: number }[];
}

/** Ringkasan pemain untuk peringkat, papan, dan lobi. */
export interface PemainRingkas {
  id: string;
  nama: string;
  avatar: number; // 0–7
  warnaTas: WarnaTas;
  skor: number;
  waktuSkorMs: number; // waktu ronde (tanpa jeda) saat skor terakhir bertambah
  langkah1Benar: number;
  urutanGabung: number; // unik di dalam satu ruang
  terhubung: boolean;
}

/** Keadaan skill satu pemain; dipegang pemanggil, bukan inti. */
export interface KeadaanSkill {
  muatan: Record<SkillId, number>;
  aktifSampaiMs: Partial<Record<SkillId, number>>;
  terakhirPakaiMs: Partial<Record<SkillId, number>>;
}

export type StatusPemainKejadian = "belum" | "langkah1" | "langkah2" | "selesai";

/** Hasil pemeriksaan satu laporan `gerak` di server. */
export interface HasilPeriksaGerak {
  diterima: boolean;
  x: number; // posisi baru bila diterima; posisi sah terakhir bila ditolak
  y: number;
  arah: Arah;
  seq: number; // seq laporan yang diperiksa
  alasan: "seq" | "status" | "dialog" | "waktu" | "kecepatan" | "tabrakan" | null; // null bila diterima
}
