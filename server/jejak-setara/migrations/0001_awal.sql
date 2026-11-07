-- Skema awal Jejak Setara (spesifikasi JS-03, bagian "Migrasi D1"; Architecture 5.2).
-- Migrasi hanya maju dan hanya ditulis Sesi A. Waktu dalam milidetik UTC; id berupa teks.
CREATE TABLE pengguna (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nama_tampilan TEXT NOT NULL,
  peran TEXT NOT NULL CHECK (peran IN ('admin', 'guru')),
  peninjau INTEGER NOT NULL DEFAULT 0 CHECK (peninjau IN (0, 1)),
  hash_sandi TEXT NOT NULL,
  garam TEXT NOT NULL,
  iterasi INTEGER NOT NULL,
  wajib_ganti_sandi INTEGER NOT NULL DEFAULT 1 CHECK (wajib_ganti_sandi IN (0, 1)),
  aktif INTEGER NOT NULL DEFAULT 1 CHECK (aktif IN (0, 1)),
  dibuat_pada INTEGER NOT NULL,
  masuk_terakhir INTEGER
);
CREATE TABLE sesi (
  hash_token TEXT PRIMARY KEY,
  pengguna_id TEXT NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  dibuat_pada INTEGER NOT NULL,
  terakhir_dipakai INTEGER NOT NULL,
  kedaluwarsa INTEGER NOT NULL
);
CREATE INDEX sesi_pengguna ON sesi(pengguna_id);
CREATE INDEX sesi_kedaluwarsa ON sesi(kedaluwarsa);
CREATE TABLE batas_masuk (
  kunci TEXT PRIMARY KEY,
  jumlah INTEGER NOT NULL,
  jendela_mulai INTEGER NOT NULL,
  terkunci_sampai INTEGER
);
CREATE TABLE rujukan (
  id TEXT PRIMARY KEY CHECK (id GLOB 'JR-[0-9][0-9]*'),
  teks TEXT NOT NULL,
  sumber TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'belum' CHECK (status IN ('belum', 'terverifikasi')),
  diverifikasi_oleh TEXT REFERENCES pengguna(id),
  diverifikasi_pada INTEGER,
  catatan TEXT,
  kode_sehari TEXT
);
CREATE TABLE kejadian (
  id TEXT PRIMARY KEY,
  kode TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draf' CHECK (status IN ('draf', 'tinjau', 'terbit', 'arsip')),
  versi_terbit_id TEXT REFERENCES kejadian_versi(id),
  pemilik_id TEXT REFERENCES pengguna(id),
  diubah_pada INTEGER NOT NULL
);
CREATE TABLE kejadian_versi (
  id TEXT PRIMARY KEY,
  kejadian_id TEXT NOT NULL REFERENCES kejadian(id),
  nomor INTEGER NOT NULL,
  isi_json TEXT NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('kerja', 'terbit')),
  dibuat_oleh TEXT REFERENCES pengguna(id),
  dibuat_pada INTEGER NOT NULL,
  catatan_perubahan TEXT
);
CREATE UNIQUE INDEX kejadian_versi_kerja ON kejadian_versi(kejadian_id) WHERE jenis = 'kerja';
CREATE UNIQUE INDEX kejadian_versi_nomor ON kejadian_versi(kejadian_id, nomor) WHERE jenis = 'terbit';
CREATE TABLE paket (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  deskripsi TEXT,
  aktif INTEGER NOT NULL DEFAULT 1 CHECK (aktif IN (0, 1))
);
CREATE TABLE paket_kejadian (
  paket_id TEXT NOT NULL REFERENCES paket(id) ON DELETE CASCADE,
  kejadian_id TEXT NOT NULL REFERENCES kejadian(id),
  urutan INTEGER NOT NULL,
  PRIMARY KEY (paket_id, kejadian_id)
);
CREATE TABLE ruang (
  id TEXT PRIMARY KEY,
  kode TEXT NOT NULL CHECK (length(kode) = 5),
  pemilik_id TEXT REFERENCES pengguna(id),
  label_kelas TEXT NOT NULL,
  paket_id TEXT REFERENCES paket(id),
  pengaturan_json TEXT NOT NULL,
  benih INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('lobi', 'hitung_mundur', 'main', 'jeda', 'selesai', 'pembahasan', 'ditutup')),
  uji INTEGER NOT NULL DEFAULT 0 CHECK (uji IN (0, 1)),
  do_id TEXT NOT NULL,
  dibuat_pada INTEGER NOT NULL,
  mulai_pada INTEGER,
  selesai_pada INTEGER,
  ringkasan_json TEXT
);
CREATE UNIQUE INDEX ruang_kode_aktif ON ruang(kode) WHERE status <> 'ditutup';
CREATE INDEX ruang_pemilik ON ruang(pemilik_id, dibuat_pada);
CREATE INDEX ruang_dibuat ON ruang(dibuat_pada);
CREATE TABLE peserta (
  id TEXT PRIMARY KEY,
  ruang_id TEXT NOT NULL REFERENCES ruang(id) ON DELETE CASCADE,
  nama_samaran TEXT NOT NULL,
  avatar INTEGER NOT NULL CHECK (avatar BETWEEN 0 AND 7),
  warna_tas TEXT NOT NULL,
  nomor_absen INTEGER CHECK (nomor_absen BETWEEN 1 AND 50),
  skor INTEGER NOT NULL DEFAULT 0,
  waktu_skor_ms INTEGER,
  langkah1_benar INTEGER NOT NULL DEFAULT 0,
  jumlah_kejadian INTEGER NOT NULL DEFAULT 0,
  gabung_pada INTEGER NOT NULL,
  peringkat_akhir INTEGER
);
CREATE INDEX peserta_ruang ON peserta(ruang_id);
CREATE TABLE jawaban (
  id TEXT PRIMARY KEY,
  ruang_id TEXT NOT NULL REFERENCES ruang(id) ON DELETE CASCADE,
  peserta_id TEXT NOT NULL REFERENCES peserta(id) ON DELETE CASCADE,
  kejadian_versi_id TEXT NOT NULL REFERENCES kejadian_versi(id),
  urutan_opsi_json TEXT NOT NULL,
  langkah1_opsi TEXT,
  langkah1_benar INTEGER CHECK (langkah1_benar IN (0, 1)),
  petunjuk_dipakai INTEGER NOT NULL DEFAULT 0 CHECK (petunjuk_dipakai IN (0, 1)),
  langkah2_opsi TEXT,
  tingkat TEXT CHECK (tingkat IN ('tepat', 'kurang', 'berisiko')),
  poin INTEGER NOT NULL DEFAULT 0 CHECK (poin BETWEEN 0 AND 100),
  dibuka_pada INTEGER NOT NULL,
  langkah1_pada INTEGER,
  langkah2_pada INTEGER,
  UNIQUE (peserta_id, kejadian_versi_id)
);
CREATE INDEX jawaban_ruang ON jawaban(ruang_id);
CREATE INDEX jawaban_versi ON jawaban(kejadian_versi_id);
CREATE TABLE pengaturan (
  kunci TEXT PRIMARY KEY,
  nilai_json TEXT NOT NULL
);
CREATE TABLE log_audit (
  id TEXT PRIMARY KEY,
  pengguna_id TEXT REFERENCES pengguna(id),
  aksi TEXT NOT NULL,
  sasaran TEXT,
  rincian_json TEXT,
  waktu INTEGER NOT NULL
);
CREATE INDEX log_audit_waktu ON log_audit(waktu);
