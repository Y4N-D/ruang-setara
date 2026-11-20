-- JS-11 (spesifikasi P-10): tanda pemain yang dikeluarkan guru, dipakai hasil per ruang, CSV, dan statistik JS-13.
-- Hanya menambah kolom bernilai bawaan 0, sehingga baris lama bernilai 0 dan Worker lama yang masih berjalan di antara
-- langkah migrasi dan deploy tetap bisa menulis peserta.
ALTER TABLE peserta ADD COLUMN dikeluarkan INTEGER NOT NULL DEFAULT 0 CHECK (dikeluarkan IN (0, 1));
