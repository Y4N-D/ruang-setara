-- Kontrak tabel D1 untuk semai bank awal (spesifikasi JS-05; Permintaan A-5 di docs/jejak-setara/naskah/STATUS.md).
-- BUKAN migrasi: jangan dijalankan ke D1. Berkas ini hanya dipakai uji bank-semai selama
-- server/jejak-setara/migrations/ belum berisi migrasi. Sesudah migrasi JS-03 ada, uji memakai migrasi itu.
-- Isinya hanya tabel dan kolom yang disentuh semai (Architecture 5.2).
CREATE TABLE rujukan (
  id TEXT PRIMARY KEY,
  teks TEXT NOT NULL,
  sumber TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'belum' CHECK (status IN ('belum', 'terverifikasi')),
  diverifikasi_oleh TEXT,
  diverifikasi_pada INTEGER,
  catatan TEXT,
  kode_sehari TEXT
);
CREATE TABLE kejadian (
  id INTEGER PRIMARY KEY,
  kode TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('draf', 'tinjau', 'terbit', 'arsip')),
  versi_terbit_id INTEGER,
  pemilik_id TEXT,
  diubah_pada INTEGER NOT NULL
);
CREATE TABLE kejadian_versi (
  id INTEGER PRIMARY KEY,
  kejadian_id INTEGER NOT NULL REFERENCES kejadian (id),
  nomor INTEGER NOT NULL,
  isi_json TEXT NOT NULL CHECK (json_valid(isi_json)),
  jenis TEXT NOT NULL CHECK (jenis IN ('kerja', 'terbit')),
  dibuat_oleh TEXT,
  dibuat_pada INTEGER NOT NULL,
  catatan_perubahan TEXT
);
CREATE TABLE paket (
  id INTEGER PRIMARY KEY,
  nama TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  aktif INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE paket_kejadian (
  paket_id INTEGER NOT NULL REFERENCES paket (id),
  kejadian_id INTEGER NOT NULL REFERENCES kejadian (id),
  urutan INTEGER NOT NULL,
  PRIMARY KEY (paket_id, kejadian_id)
);
CREATE TABLE pengaturan (
  kunci TEXT PRIMARY KEY,
  nilai_json TEXT NOT NULL
);
