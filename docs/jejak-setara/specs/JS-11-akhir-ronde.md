# JS-11 — Akhir ronde

| | |
|---|---|
| Status | Ditulis 20 November 2026; menunggu `Spesifikasi disetujui: JS-11` (DRAF D-1 sampai D-4) |
| Rencana | `PLAN.md`, entri JS-11 (Plan 16 November 2026; disetujui 20 November 2026 dengan `Setuju: JS-11 (usulan 1a sampai 12a)`) |
| Sesi | Sesi A (mesin) |
| Bergantung pada | JS-10 (Selesai, 15 November 2026); memakai juga JS-12 dan JS-22 (keduanya Selesai, 16 November 2026) |

## Ringkasan

JS-11 menutup satu ronde dari sisi siswa dan guru. Saat ronde berakhir, setiap HP pemain menerima rekap pribadi: skor, peringkat, kejadian yang dijawab beserta pilihannya, pilihan yang tepat, rujukannya, lalu dua kalimat refleksi untuk disalin ke buku. Rekap tetap terbaca selama HP menyambung ulang dan sesudah guru menutup ruang (D-2).

Server ruang menulis hasil akhir ke D1, termasuk tanda pemain yang dikeluarkan (migrasi `0002`) dan ringkasan ronde di `ruang.ringkasan_json`. Ruang yang ditutup sebelum ronde berakhir dan pemain yang dikeluarkan sesudah ronde tetap menghasilkan peringkat akhir yang utuh.

Di konsol, halaman Ruang mendapat bagian Riwayat untuk ruang yang sudah ditutup, dengan saringan tanggal, label kelas, dan guru. Halaman ruang yang sudah selesai atau ditutup menampilkan hasil: ringkasan, peringkat lengkap, dan rincian jawaban setiap pemain. Dari halaman itu guru mengunduh CSV peserta dan CSV jawaban yang langsung rapi di Excel berbahasa Indonesia, dan mencetak ringkasan. Admin bisa menghapus data satu ruang yang sudah ditutup. Di layar kelas, tanda centang berupa huruf diganti ikon `ikon_centang`.

## Kaitan PRD

| Kebutuhan | Dipenuhi oleh |
|---|---|
| JFR-32 Rekap pribadi: skor, peringkat, kejadian yang dijawab, pilihan, pilihan yang tepat, rujukan, dan dua kalimat refleksi | P-1 sampai P-9 |
| JFR-38 Riwayat ruang dengan saringan tanggal, label kelas, dan guru, serta tautan ke hasil | P-16 sampai P-19 |
| JFR-49 Hasil per ruang: peringkat lengkap dan rincian jawaban setiap pemain | P-20 sampai P-25 |
| JFR-53 Ekspor CSV peserta dan jawaban yang rapi di Excel berbahasa Indonesia | P-26 sampai P-30 |
| PRD 8.7 Rekap menunjukkan pilihan yang lebih tepat beserta rujukannya | P-1, P-4 |
| PRD 11.1 Ekspor CSV dan cetak ringkasan (admin semua ruang, guru ruang miliknya); menghapus data ruang | P-26, P-31 sampai P-33 (D-3) |
| PRD 11.2 Definisi ketepatan Langkah 1, sebaran tingkat, dan waktu menjawab | P-21, P-24, P-28, P-29 |
| PRD 13 Admin dapat menghapus data satu ruang | P-32, P-33 |
| Architecture 6.3 (`selesai` dengan rekap), 7 (akhir ronde), 8.6 (kiriman ke D1), 10.1, 10.2 (`GET /api/ruang/{id}/ekspor`, `DELETE /api/ruang/{id}`), dan 10.8 (aturan CSV) | P-1, P-10 sampai P-17, P-21, P-26 sampai P-33 |
| Catatan Plan JS-11 dari JS-08 dan JS-10: rekap dari tabel `jawaban` ruang, hasil di `#/ruang/{id}`, ikon centang | P-1, P-20, P-34 |
| Permintaan A-12 Sesi B: kalimat refleksi dan urutan menutup ruang | P-6, P-8 (D-1, D-2) |
| `PLAN.md` usulan 1a sampai 12a | Seluruh dokumen |

## Berkas yang dibuat dan diubah

| Berkas | Baru/ubah | Isi |
|---|---|---|
| `server/jejak-setara/migrations/0002_peserta_dikeluarkan.sql` | Baru | Kolom `peserta.dikeluarkan` (P-10) |
| `app/jejak-setara/inti/hasil.ts` | Baru | Skema zod riwayat, hasil, dan rincian; fungsi murni ketepatan, persen, dan ringkasan (P-14, P-17, P-21, P-24) |
| `app/jejak-setara/inti/ruang.ts` | Ubah | Kode galat `HASIL_BELUM_ADA` dan `BELUM_DITUTUP`; `kirimanTertunda` di keadaan langsung (P-15) |
| `server/jejak-setara/src/ruang/rekap-ruang.ts` | Baru | Penyusun rekap pribadi dan ringkasan hasil, murni (P-1, P-2, P-14) |
| `server/jejak-setara/src/ruang/inti-ruang.ts` | Ubah | `selesai` dengan rekap; baris peserta dengan `dikeluarkan`; P-11 sampai P-14 |
| `server/jejak-setara/src/ruang/RuangJejak.ts` | Ubah | `ringkasan_json` dengan `hasil`; `kirimanTertunda` (P-14, P-15) |
| `server/jejak-setara/src/db/ruang.ts` | Ubah | `UPSERT_PESERTA` dengan `dikeluarkan`; kueri riwayat, hasil, rincian, ekspor, dan hapus |
| `server/jejak-setara/src/api/ruang.ts` | Ubah | Rute riwayat, hasil, rincian, ekspor, dan hapus (P-17, P-21, P-24, P-26, P-33) |
| `server/jejak-setara/src/ekspor/csv.ts` | Baru | Penyusun CSV dan nama berkas, murni (P-27 sampai P-30) |
| `server/jejak-setara/src/auth/izin.ts` | Ubah | Aksi `ruang.hapus` (P-33) |
| `app/jejak-setara/pemain/LayarRonde.tsx`, `pemain/Rekap.tsx` | Ubah dan baru | Layar rekap (P-4 sampai P-9) |
| `app/jejak-setara/pemain/App.tsx` | Ubah | Rekap di memori tab, pita, dan layar sesudah sambungan berhenti (P-3, P-7, P-8) |
| `app/jejak-setara/teks.ts`, `teks-konsol.ts` | Ubah | Teks bagian "Teks yang tampil (final)" |
| `app/jejak-setara/admin/rute.ts`, `admin/App.tsx` | Ubah | Rute `#/ruang/riwayat` (P-16) |
| `app/jejak-setara/admin/halaman/Ruang.tsx` | Ubah | Tab Berjalan dan Riwayat (P-16) |
| `app/jejak-setara/admin/halaman/RiwayatRuang.tsx` | Baru | Halaman riwayat (P-18) |
| `app/jejak-setara/admin/halaman/DetailRuang.tsx` | Ubah | Bagian hasil, tautan kembali, dan muat ulang (P-19, P-20, P-25) |
| `app/jejak-setara/admin/halaman/HasilRuang.tsx` | Baru | Ringkasan, peringkat, rincian, unduh CSV, cetak, dan hapus (P-22 sampai P-24, P-30 sampai P-32) |
| `app/jejak-setara/admin/api.ts` | Ubah | Pemanggil riwayat, hasil, rincian, unduh CSV, dan hapus |
| `app/jejak-setara/admin/kelas/Langsung.tsx`, `KartuBahas.tsx`, `ikon-kelas.ts` | Ubah | Ikon centang (P-34) |
| `app/jejak-setara/styles/jejak.css` | Ubah | Gaya layar rekap (layar pemain) |
| `app/jejak-setara/styles/kelas.css` | Ubah | Gaya riwayat, hasil, dan cetak (hanya konsol) |
| `scripts/jejak-setara/simulasi-beban.mjs` | Ubah | Ukuran `selesai` dan pemeriksaan rekap bot (AC-23) |
| Uji | Baru dan ubah | Bagian "Rencana uji" |
| `docs/jejak-setara/Architecture.md`, `Design_System.md`, `PRD.md`, `PLAN.md`, `tests/JS-11-hasil.md` | Ubah dan baru | Architecture 3, 5.2, 6.3, 7, 8.6, 10.1, 10.2, 10.4, 10.8, dan 12.3; Design System 3.7 dan 10; PRD 11.1 (sesuai D-3) dan 21 |

Tidak disentuh: Sehari Setara, galeri, `deploy-pages.yml`, `package.json` dan lockfile (tanpa dependensi baru), `server/jejak-setara/wrangler.jsonc`, isi `.github/workflows/` (langkah migrasi D1 yang sudah ada di "Jejak: uji" menerapkan `0002`), migrasi `0001_awal.sql`, berkas Sesi B (`naskah/`, `inti/konten/`, `seed/`, `semai.mjs`), dan berkas Sesi C.

## Perilaku

### Rekap pribadi di layar pemain (usulan 2a, 3a, dan 11a)

- **P-1. Isi rekap.** Pesan `selesai` (skema JS-02, `PROTOKOL_VERSI` tetap 2) kini membawa `rekap` yang terisi. Server ruang menyusunnya dari jawaban pemain itu di tabel `jawaban` SQLite ruang dan dari isi kejadian yang disalin ke ruang saat ruang dibuat (`KejadianRuang`), sehingga rekap tetap benar walaupun kejadian diterbitkan ulang sesudahnya. Setiap butir rekap:

  | Kolom | Isi |
  |---|---|
  | `kejadianId` | Kode kejadian |
  | `judul` | Judul versi yang dipakai ruang |
  | `pilihan1` | Teks pilihan Langkah 1 yang dikunci pemain, dipetakan dari id asli `langkah1Opsi` |
  | `benar1` | Pilihan itu benar atau tidak |
  | `opsiBenar1` | Teks pilihan Langkah 1 yang benar |
  | `pilihan2`, `tingkat2` | Teks dan tingkat pilihan Langkah 2 yang dikunci; keduanya `null` bila Langkah 2 belum dikunci saat ronde berakhir |
  | `opsiTepat2` | Teks semua pilihan Langkah 2 bertingkat tepat, menurut urutan asli |
  | `poin` | Poin kejadian itu, 0 sampai 100 |
  | `rujukan` | Teks rujukan kartu dampak, 1 sampai 4 |

- **P-2. Cakupan dan urutan.** Rekap memuat setiap kejadian yang Langkah 1-nya sudah dikunci pemain, menurut urutan kejadian ruang (urutan paket, sama dengan pembahasan di layar kelas). Paling banyak 64 butir, sesuai batas skema. Ketentuan ini menyempurnakan usulan 2a ("setiap kejadian yang dibuka"): kejadian yang hanya dibuka tanpa mengunci Langkah 1 tidak masuk, karena belum ada pilihan untuk ditampilkan dan skema `selesai` JS-02 mewajibkan `pilihan1` dan `benar1`. Mengubah keduanya menjadi boleh kosong berarti mengubah protokol secara tidak kompatibel, sehingga `PROTOKOL_VERSI` harus naik.

- **P-3. Kapan dikirim.** `selesai` dikirim kepada setiap pemain berkeidentitas yang tersambung saat ronde berakhir (JS-08 P-35), dan kepada pemain yang menyambung ulang selama status `selesai` atau `pembahasan` (JS-08 P-36). Sejak JS-11, `selesai` juga dikirim ulang kepada semua pemain yang tersambung bila peringkat berubah sesudah ronde berakhir (P-13). HP memperbarui skor dan peringkat di layar rekap tanpa memindahkan posisi gulir.

- **P-4. Layar "Ronde selesai".** Layar HTML JS-03 dan JS-08 (P-59) menjadi halaman rekap yang digulir biasa, dengan panel selebar paling banyak 560 px, tanpa garis pindai (Design System 6), dan huruf menurut skala Design System 5 (gaya teks situasi 17 px di HP dan 20 px di laptop; label kecil paling sedikit 13 px). Urutan isinya:
  1. Judul "Ronde selesai".
  2. Baris skor dan peringkat (P-5), lalu "Tunggu arahan guru." selama ruang belum ditutup.
  3. Tautan "Langsung ke refleksi", yang menggulir ke bagian Refleksi dan memindahkan fokus ke judulnya.
  4. Judul "Kejadian yang kamu jawab ({n})", lalu daftar bernomor. Setiap butir berisi:
     - judul kejadian dan "{poin} poin";
     - baris "Langkah 1" dengan tanda "Tepat" (ikon hati, latar `leaf`) atau "Belum tepat" (ikon tanda tanya, latar `mango`), label "Pilihanmu" dengan teks pilihannya, serta label "Jawaban tepat" dengan teksnya bila pilihan keliru;
     - baris "Langkah 2" dengan tanda tingkat seperti kepala kartu dampak ("Tepat", "Kurang tepat", atau "Berisiko", dengan ikon emosi dan warna tingkat) atau tanda "Belum dijawab" (latar `mist`), label "Pilihanmu" bila ada, serta label "Pilihan yang tepat" dengan teks setiap pilihan tepat bila tingkatnya bukan tepat atau Langkah 2 belum dijawab;
     - label "Rujukan" dengan daftar teks rujukannya.

     Di ruang uji, catatan "Rujukan di ruang uji belum tentu sudah diverifikasi Peninjau." tampil sekali di atas daftar.
  5. Bagian "Refleksi" (P-6).

  Untuk rekap kosong, butir 3 dan 4 diganti "Belum ada kejadian yang kamu jawab di ronde ini.", dan Refleksi tetap tampil. Sketsa di HP 731 × 411 (digulir):

  ```
  ┌──────────────────────────────────────────────┐
  │ RONDE SELESAI                                │
  │ Skormu 290                                   │
  │ Peringkat 5 dari 23                          │
  │ Tunggu arahan guru.                          │
  │ [Langsung ke refleksi]                       │
  │ Kejadian yang kamu jawab (4)                 │
  │ 1. Antrean puskesmas               100 poin  │
  │    Langkah 1  [Tepat]                        │
  │    Pilihanmu  Hak ibu dan bayinya untuk ...  │
  │    Langkah 2  [Tepat]                        │
  │    Pilihanmu  Menolak, mengajak temanmu ...  │
  │    Rujukan    Pasal 28H ayat (1) UUD ...     │
  │ 2. Zebra cross                      25 poin  │
  │    Langkah 1  [Belum tepat]                  │
  │    Pilihanmu      ...                        │
  │    Jawaban tepat  ...                        │
  │    Langkah 2  [Kurang tepat]                 │
  │    Pilihanmu      ...                        │
  │    Pilihan yang tepat  ...                   │
  │    Rujukan    ...                            │
  │ ...                                          │
  │ REFLEKSI                                     │
  │ Salin dan lengkapi kalimat ini di buku       │
  │ catatanmu.                                   │
  │ 1. Satu hak yang kupelajari hari ini adalah  │
  │    hak ... untuk ...                         │
  │ 2. Satu kewajiban yang akan kujalankan       │
  │    minggu ini adalah ...                     │
  └──────────────────────────────────────────────┘
  ```

- **P-5. Skor dan peringkat di rekap** (menyempurnakan D-5 dan P-59 JS-08, karena rekap kini bisa berisi walaupun skornya 0). Nilainya dari pesan `selesai`, atau dari `pribadi` terakhir selama `selesai` belum tiba.
  - Skor lebih dari 0: "Skormu {skor}" dan "Peringkat {n} dari {jumlah}".
  - Skor 0 dan rekap berisi: "Skormu 0" tanpa baris peringkat, sejalan dengan "#–" di bilah atas selama skor 0 (JS-08 P-57).
  - Rekap kosong: hanya "Belum ada kejadian yang kamu jawab di ronde ini." (teks JS-08).

- **P-6. Refleksi (D-1).** Judul "Refleksi", kalimat pengantar, lalu dua kalimat bernomor: satu tentang hak dan satu tentang kewajiban, sama untuk semua pemain dan semua paket. Kalimat ini tidak diisi di HP. Siswa menulis di buku, jadi tidak ada tulisan siswa yang dikirim atau disimpan (PRD 13). Teks yang dipakai adalah Pasangan 1 dari `naskah/refleksi.md` (D-1).

- **P-7. Rekap tetap terbaca saat menyambung ulang.** Di layar rekap, lapisan "Menyambung ulang…" JS-07 (lapisan `ink` 70%) tidak dipakai. Sebagai gantinya, pita kecil `mango` di atas panel berbunyi "Menyambung ulang… Rekapmu tetap bisa dibaca." tanpa menutup isi, dan hilang saat tersambung lagi. Layar lain tetap memakai lapisan JS-07.

- **P-8. Sesudah ruang ditutup atau sambungan berhenti (D-2, Permintaan A-12).** HP yang sudah menampilkan layar "Ronde selesai" tetap di layar itu bila sambungannya berakhir karena penyebab apa pun selain dikeluarkan. Aturan sambungan dan token tidak berubah (JS-03 dan JS-22): HP berhenti menyambung ulang, dan token hanya dihapus bila ruang ditutup atau tidak ditemukan. Yang berubah hanya tampilannya. Layar yang selama ini menggantikan rekap tidak tampil; sebagai gantinya, pita `mist` muncul di atas panel, "Tunggu arahan guru." hilang, dan satu tombol muncul di akhir rekap dengan tindakan yang sama seperti tombol di layar yang digantikannya:

  | Penyebab | Pita | Tombol di akhir rekap |
  |---|---|---|
  | Ruang ditutup (`status_ruang` `ditutup` atau kode 4000) atau tidak ditemukan (`RUANG_TIDAK_ADA`, termasuk pemeriksaan JS-22 P-8) | "Ruang sudah ditutup. Rekapmu tetap tampil sampai halaman ini ditutup." | "Kembali", membuka layar kode |
  | Putus terlalu lama (JS-22 P-9) atau layanan berhenti (JS-22 P-8) | "Sambungan ke ruang berhenti. Rekapmu tetap tampil sampai halaman ini ditutup." | "Coba lagi", memuat ulang halaman |
  | Versi berbeda (kode 4005) | Sama dengan baris di atas | "Muat ulang", memuat ulang halaman |

  Rekap hanya disimpan di memori tab, sehingga memuat ulang halaman menghapusnya. Bila token masih ada dan ruang masih berstatus `selesai` atau `pembahasan`, server mengirim `selesai` lagi sesudah halaman dimuat ulang (P-3), sehingga rekap tampil kembali.

  Pemain yang dikeluarkan (`DIKELUARKAN`, kode 4004) tetap pindah ke layar galat JS-03. Layar "Ruang ditutup" JS-03 dan layar berhenti JS-22 tetap dipakai untuk HP yang belum sampai ke layar rekap, misalnya ruang yang ditutup dari lobi.

- **P-9. Aksesibilitas.** Struktur judul: h1 "Ronde selesai", h2 "Kejadian yang kamu jawab ({n})" dan "Refleksi", dan h3 untuk setiap judul kejadian. Daftar kejadian dan kedua kalimat refleksi memakai daftar bernomor; rujukan memakai daftar biasa. Tanda tepat, tingkat, dan "Belum dijawab" selalu berupa ikon dan tulisan, bukan warna saja. Pita P-7 dan P-8 diumumkan lewat wilayah `aria-live` yang sudah ada, dengan jarak minimal 2 detik antarpengumuman. Tautan "Langsung ke refleksi" dan tombol di akhir rekap (P-8) bisa dipakai dengan keyboard, dengan fokus terlihat (`sun` dan ▶), dan target sentuhnya sedikitnya 48 px.

### Hasil akhir di server ruang dan D1 (usulan 4a)

- **P-10. Kolom baru `peserta.dikeluarkan`.** Migrasi `server/jejak-setara/migrations/0002_peserta_dikeluarkan.sql`:

  ```sql
  ALTER TABLE peserta ADD COLUMN dikeluarkan INTEGER NOT NULL DEFAULT 0 CHECK (dikeluarkan IN (0, 1));
  ```

  Migrasi ini hanya menambah kolom bernilai bawaan 0, sehingga baris lama bernilai 0 dan Worker lama yang masih berjalan di antara langkah migrasi dan deploy di "Jejak: uji" tetap bisa menulis `peserta`. Pernyataan sisip `UPSERT_PESERTA` menulis dan memperbarui `dikeluarkan`. Baris antrean yang tersimpan di ruang sebelum deploy dan belum memuat tanda ini dikirim dengan nilai 0. Kolom ini dipakai hasil per ruang (P-21, P-23), CSV (P-28, P-29), dan statistik JS-13.

- **P-11. Baris peserta akhir.** Perilaku JS-08 tetap: saat ronde berakhir, setiap pemain berkeidentitas diantrekan ke D1 dengan skor, waktu skor, jumlah Langkah 1 benar, jumlah kejadian selesai, dan peringkat akhir, lalu antrean langsung dikirim. Yang baru, `dikeluarkan` ikut terkirim: 1 untuk pemain yang dikeluarkan, dengan peringkat akhir kosong.

- **P-12. Ruang yang ditutup di tengah ronde.** Guru hanya bisa menutup ruang di `lobi`, `selesai`, dan `pembahasan` (JS-10 P-9), tetapi server bisa menutup ruang berstatus `main` atau `jeda`: tutup otomatis 3 jam tanpa sambungan atau 6 jam sejak dibuat (Architecture 7), penghapusan paksa 7 hari (JS-22 P-5), atau berhenti paksa (JS-22 P-6). Dalam keadaan itu, server ruang lebih dulu menutup semua dialog, menghitung peringkat akhir, dan mengantrekan baris peserta seperti P-11, tanpa mengirim `selesai`, lalu menutup ruang seperti biasa. Ruang yang ditutup dari `lobi` atau `hitung_mundur` tidak dimainkan dan tidak punya hasil (P-17).

- **P-13. Peringkat yang berubah sesudah ronde berakhir.** Saat guru mengeluarkan pemain berkeidentitas (JS-10 P-10), baris pesertanya langsung diantrekan dengan `dikeluarkan` 1, di status apa pun. Selama status `selesai` atau `pembahasan`, peringkat bisa berubah karena dua hal: guru mengeluarkan pemain, atau pemain yang sudah tersambung sebelum ronde berakhir baru memilih nama (pemain baru sudah ditolak dengan `TERLAMBAT`). Untuk kedua penyebab itu:
  - peringkat akhir dihitung ulang, dan baris peserta semua pemain berkeidentitas diantrekan dengan peringkat barunya (pemain yang dikeluarkan tanpa peringkat);
  - layar kelas menerima `papan` dan `kemajuan` baru, sehingga 10 besar dan podium ikut berubah;
  - pemain yang tersambung menerima `selesai` baru (P-3);
  - ringkasan hasil ditulis ulang (P-14).

- **P-14. Ringkasan hasil di `ruang.ringkasan_json`.** Objek yang ditulis JS-22 (`{ "pemakaian": … }`, JS-22 P-16) mendapat kunci `hasil`, misalnya:

  ```text
  { "pemakaian": { …isi JS-22… },
    "hasil": { "versi": 1, "jumlahKejadian": 16, "jumlahPemain": 23, "jumlahSkor": 9480, "langkah1Dijawab": 180,
               "langkah1Benar": 131, "tepat": 102, "kurang": 49, "berisiko": 21 } }
  ```

  Semua angka dihitung dari pemain berkeidentitas yang tidak dikeluarkan: jumlah pemain, jumlah skor, jumlah jawaban yang Langkah 1-nya dikunci, jumlah Langkah 1 benar, dan jumlah setiap tingkat Langkah 2 yang dikunci. `jumlahKejadian` adalah jumlah kejadian ruang. Durable Object menulis `ringkasan_json` dengan kedua kunci saat ronde berakhir, sesudah P-12 dan P-13, saat ruang ditutup, dan sebelum penyimpanannya dihapus (JS-22 P-16). Ruang yang tidak dimainkan (P-17) tidak punya kunci `hasil`. Halaman hasil tidak membaca kunci ini, karena P-21 menghitung langsung dari baris D1; kunci ini salinan ringkas untuk dasbor JS-13, dan uji memastikan angkanya sama dengan P-21.

- **P-15. Kiriman yang tertunda.** Keadaan langsung dari Durable Object (`GET https://ruang/kelola`, JS-10 P-8) mendapat `kirimanTertunda`, yang bernilai benar selama antrean kiriman ke D1 belum kosong. Selama ruang berstatus `selesai` atau `pembahasan` dan nilai itu benar, bagian hasil menampilkan "Sebagian hasil masih disimpan. Halaman ini memuat ulang sendiri." dan memuat hasil lagi pada muat ulang berikutnya (P-25).

### Riwayat ruang (usulan 5a)

- **P-16. Rute dan bagian halaman.** Halaman Ruang punya dua bagian yang dipilih lewat tautan bergaya tab di bawah judul: "Berjalan" (`#/ruang`, isi JS-10 P-7 tanpa perubahan) dan "Riwayat" (`#/ruang/riwayat`). `admin/rute.ts` mengenal `#/ruang/riwayat`; id `riwayat` hanya berlaku untuk rute ruang. Menu "Ruang" tetap satu butir dan aktif di ketiga rute ruang. Tab yang aktif berlatar `sun` dengan teks `ink` dan tanda ▶ (pola butir menu aktif), serta bertanda `aria-current="page"`.

- **P-17. API riwayat.** `GET /api/ruang/riwayat` (izin `ruang.kelola`) dengan parameter berikut, semuanya pilihan:

  | Parameter | Aturan |
  |---|---|
  | `dari`, `sampai` | Milidetik UTC berupa bilangan bulat 0 sampai 8.640.000.000.000.000; memilih ruang dengan `dibuat_pada` ≥ `dari` dan < `sampai`. Bila keduanya ada, `dari` < `sampai` |
  | `label` | 1–20 karakter sesudah dipangkas; memilih label kelas yang memuat teks itu, tanpa membedakan huruf besar dan kecil (huruf Latin) |
  | `guru` | Id pengguna pemilik ruang; hanya berlaku untuk admin dan diabaikan untuk guru |
  | `batas` | 1 sampai 50, bawaan 50 (Architecture 10.2: daftar memakai `batas` dan `mulai`) |
  | `mulai` | Penanda halaman berikutnya dari jawaban sebelumnya, berbentuk `{dibuatPada}_{id}` |

  Jawaban 200 `{ ruang: [...], berikutnya }` berisi ruang berstatus `ditutup` saja; guru hanya melihat ruang miliknya, admin semua ruang. Urutannya terbaru lebih dulu (`dibuat_pada`, lalu `id`, menurun). `berikutnya` berisi penanda bila masih ada ruang, dan `null` bila tidak. Setiap ruang: `{ id, kode, labelKelas, uji, namaGuru, dibuatPada, mulaiPada, selesaiPada, dimainkan, jumlahPemain, rataSkor }`. `dimainkan` bernilai benar bila ronde sempat berjalan, yaitu `mulai_pada` terisi dan tidak sesudah `selesai_pada`; ruang yang ditutup dari lobi atau saat hitung mundur tidak dimainkan. `jumlahPemain` adalah jumlah peserta yang tidak dikeluarkan, dan `rataSkor` rata-rata skor mereka (`null` bila ruang tidak dimainkan atau tidak ada peserta). Parameter yang tidak sah dijawab 400 `ISI_SALAH`.

- **P-18. Halaman `#/ruang/riwayat`.**
  - Saringan dalam satu baris yang membungkus: "Dari tanggal" dan "Sampai tanggal" (isian tanggal peramban), "Label kelas" (paling banyak 20 karakter, dengan petunjuk "Cukup sebagian, misalnya IX."), "Guru" (hanya admin: "Semua guru", lalu nama akun dari `GET /api/akun` menurut abjad), serta tombol "Terapkan" dan "Atur ulang".
  - Tanggal dibaca menurut zona waktu peramban: "Dari tanggal" menjadi pukul 00.00 hari itu, dan "Sampai tanggal" menjadi pukul 00.00 hari berikutnya. Bila "Sampai tanggal" sebelum "Dari tanggal", galat "Tanggal akhir tidak boleh sebelum tanggal awal." tampil di bawah isian tanpa memanggil API. Saringan disimpan di memori halaman selama sesi konsol, seperti daftar kejadian JS-12.
  - Baris ringkasan "Menampilkan {n} ruang", lalu tabel berkolom Tanggal (waktu dibuat, format JS-10), Kelas (dengan label "Uji" untuk ruang uji), Kode (Press Start 2P), Pemain, Rata-rata skor (satu angka di belakang koma, "Tidak dimainkan" bila `dimainkan` salah, atau "–" bila tidak ada peserta), Guru (hanya admin), dan tautan "Hasil" ke `#/ruang/{id}` dengan label pembaca layar "Hasil ruang {kelas}, {tanggal}". Di bawah 1024 px tabel menjadi kartu bersusun, seperti JS-10.
  - Tombol "Muat lebih banyak" tampil di bawah tabel bila `berikutnya` ada. Tombol itu menambah baris di bawah baris yang sudah ada, dan selama memuat bertuliskan "Memuat…" serta nonaktif.
  - Kosong tanpa saringan: "Belum ada ruang yang ditutup." Kosong dengan saringan: "Tidak ada ruang yang cocok dengan saringan." Memuat: "Memuat riwayat…". Gagal: "Riwayat ruang gagal dimuat." dengan tombol "Coba lagi".

- **P-19. Kembali dari hasil.** Halaman ruang yang sudah ditutup menampilkan tautan "← Riwayat ruang" ke `#/ruang/riwayat` dengan saringan yang sama, menggantikan "← Semua ruang".

### Hasil per ruang (usulan 6a)

- **P-20. Kapan hasil tampil.** Halaman `#/ruang/{id}` (JS-10 P-9) menampilkan bagian "Hasil ronde" untuk ruang berstatus `selesai`, `pembahasan`, atau `ditutup`.
  - Ruang yang belum ditutup: bagian hasil tampil di bawah tombol kelola dan di atas daftar pemain.
  - Ruang yang sudah ditutup: halaman berisi kepala ruang, bagian hasil, bagian "Pemakaian ronde ini" (admin, JS-22 P-17), dan bagian hapus (admin, P-32). Ruang yang tidak dimainkan (P-17) menampilkan "Ronde tidak dimainkan di ruang ini." di bagian hasil.

- **P-21. API hasil.** `GET /api/ruang/{id}/hasil` (izin `ruang.kelola`; guru hanya ruang miliknya, selain itu 404 `RUANG_TIDAK_ADA`). Status `lobi`, `hitung_mundur`, `main`, atau `jeda`: 409 `HASIL_BELUM_ADA`. Selain itu 200:

  ```
  { ruang, info: { namaPaket, jumlahKejadian, durasiMenit, modeNomorAbsen, mulaiPada, selesaiPada },
    dimainkan, ringkasan, peserta: [ ... ] }
  ```

  - `ruang` adalah ringkasan JS-10 P-6. `info` berisi nama paket ruang (`null` bila tidak ada), jumlah kejadian dari `ringkasan_json.hasil` (`null` bila tidak ada), pengaturan durasi dan nomor absen, serta waktu mulai dan selesai ronde dari D1. `dimainkan` mengikuti definisi P-17.
  - `peserta` memuat semua baris `peserta` ruang itu, masing-masing `{ id, nama, nomorAbsen, dikeluarkan, peringkat, skor, selesai, langkah1Dijawab, langkah1Benar, tepat, kurang, berisiko, waktuSkorMs }`. `peringkat` diambil dari `peringkat_akhir` (kosong untuk pemain yang dikeluarkan) dan `selesai` dari `jumlah_kejadian`. `langkah1Dijawab`, `tepat`, `kurang`, dan `berisiko` dihitung dari baris `jawaban` pemain itu: jawaban yang Langkah 1-nya dikunci, dan tingkat Langkah 2 yang dikunci. Urutannya menurut peringkat; peserta yang tidak dikeluarkan tetapi belum punya peringkat di D1 (misalnya kiriman masih tertunda) menyusul menurut waktu bergabung, lalu pemain yang dikeluarkan menurut waktu bergabung.
  - `ringkasan` bernilai `null` bila ronde tidak dimainkan. Selain itu, dari peserta yang tidak dikeluarkan: `jumlahPemain`, `dikeluarkan` (jumlah pemain yang dikeluarkan), `rataSkor`, `ketepatan1` (jumlah Langkah 1 benar dibagi jumlah Langkah 1 yang dikunci, dikali 100), dan `tingkat` (persen tepat, kurang tepat, dan berisiko dari semua Langkah 2 yang dikunci). Persen dan rata-rata dibulatkan ke satu angka di belakang koma; nilai tanpa penyebut bernilai `null`.

  Definisi mengikuti PRD 11.2. Ketepatan Langkah 1 memakai jawaban yang Langkah 1-nya dikunci sebagai penyebut, karena pemain bisa mengunci Langkah 1 tanpa sempat mengunci Langkah 2 sebelum ronde berakhir.

- **P-22. Tampilan ringkasan.** Judul "Hasil ronde", lalu daftar istilah dua kolom:

  | Istilah | Isi |
  |---|---|
  | Tanggal | "{tanggal}, {mulai}–{selesai}" menurut zona waktu peramban |
  | Guru | Nama pemilik ruang |
  | Paket | "{nama} · {n} kejadian", atau nama saja bila jumlahnya tidak ada |
  | Durasi | "{n} menit" (pengaturan ruang) |
  | Pemain | "{n}", atau "{n} ({m} dikeluarkan)" |
  | Rata-rata skor | Satu angka di belakang koma |
  | Ketepatan Langkah 1 | "{n}%" |
  | Langkah 2 | "Tepat {a}% · Kurang tepat {b}% · Berisiko {c}%" |

  Nilai kosong ditulis "–". Ruang uji menampilkan "Ruang uji: hasilnya tidak masuk statistik." Baris tombol berisi "Unduh CSV peserta", "Unduh CSV jawaban", dan "Cetak".

- **P-23. Peringkat lengkap (D-4).** Judul "Peringkat lengkap" dan tabel berkolom:
  - Peringkat ("–" bila belum ada, P-21), Nama samaran, dan No. absen (hanya bila mode nomor absen aktif);
  - Skor, Kejadian selesai, dan Ketepatan Langkah 1 ("{n}%", atau "–");
  - Tepat, Kurang tepat, dan Berisiko: jumlah jawaban Langkah 2 pada setiap tingkat, dengan kepala kolom berikon emosi dan tulisan;
  - Waktu skor: waktu ronde tanpa jeda saat skor terakhir bertambah, berbentuk "m:ss", atau "–" bila skor 0;
  - tombol "Rincian".

  Kepala tabel tetap di atas saat digulir. Di bawah 1024 px, tabel digulir menyamping di dalam wadahnya. Pemain yang dikeluarkan tampil di tabel kedua "Dikeluarkan ({n})" dengan kolom yang sama tanpa Peringkat, didahului keterangan "Pemain yang dikeluarkan guru tidak masuk peringkat dan ringkasan."

- **P-24. Rincian jawaban per pemain.** Tombol "Rincian" (label pembaca layar "Rincian jawaban {nama}", dengan `aria-expanded`) membuka baris tepat di bawah pemain itu dan berubah menjadi "Tutup rincian". Isinya tabel jawaban dari `GET /api/ruang/{id}/hasil/{pesertaId}` (izin dan status seperti P-21; peserta yang tidak ada di ruang itu dijawab 404 `PEMAIN_TIDAK_ADA`):
  - Kolom Kejadian ("{kode} · {judul}"); Langkah 1 ("{huruf}. {pilihan}", tanda "Tepat" atau "Belum tepat", dan "Jawaban tepat: {teks}" bila keliru); Langkah 2 ("{huruf}. {pilihan}" dan tanda tingkat, atau "Belum dijawab", serta "Pilihan yang tepat: {teks}" untuk setiap pilihan tepat bila tingkatnya bukan tepat atau Langkah 2 belum dijawab); Poin; dan Waktu menjawab ("{n} detik", dari dialog pertama dibuka sampai Langkah 2 dikunci, dibulatkan ke detik terdekat, atau "–" bila Langkah 2 belum dikunci).
  - Huruf adalah huruf yang dilihat pemain itu, dari urutan acak per pemain di `urutan_opsi_json`. Teks diambil dari versi kejadian yang dipakai ruang (`kejadian_versi`). Untuk ruang uji, versi kerja dibaca apa adanya sekarang, jadi teksnya bisa berbeda bila kejadian sudah disunting sesudah ronde.
  - Urutannya menurut nomor kode kejadian. Hanya jawaban yang Langkah 1-nya dikunci; bila tidak ada: "Belum ada kejadian yang dijawab."
  - Rincian dimuat sekali per pemain dan disimpan di memori halaman. Selama memuat tampil "Memuat rincian…"; bila gagal tampil "Rincian gagal dimuat." dengan tombol "Coba lagi".

  Isi jawaban 200: `{ peserta: { id, nama }, jawaban: [{ kode, judul, versi, huruf1, pilihan1, benar1, jawabanTepat1, huruf2, pilihan2, tingkat2, pilihanTepat2, poin, waktuMenjawabMs }] }`, dengan `versi` berupa nomor versi terbit atau `null` untuk versi kerja, serta `huruf2`, `pilihan2`, `tingkat2`, dan `waktuMenjawabMs` bernilai `null` bila Langkah 2 belum dikunci.

- **P-25. Muat ulang.** Untuk ruang `selesai` atau `pembahasan`, hasil dimuat saat bagian hasil pertama tampil, lalu dimuat lagi bila status berubah, sesudah aksi "Keluarkan" berhasil, dan pada setiap muat ulang 10 detik JS-10 selama `kirimanTertunda` bernilai benar. Untuk ruang yang sudah ditutup, hasil dimuat sekali; muat ulang 10 detik JS-10 tetap berjalan untuk bagian lain halaman, tetapi tidak memuat hasil lagi.

### Ekspor CSV (usulan 7a)

- **P-26. Rute dan izin.** `GET /api/ruang/{id}/ekspor?jenis=peserta` atau `?jenis=jawaban` (izin `ruang.kelola`; guru hanya ruang miliknya, selain itu 404). Nilai `jenis` lain atau kosong: 400 `ISI_SALAH`. Status `lobi`, `hitung_mundur`, `main`, atau `jeda`: 409 `HASIL_BELUM_ADA`. Ruang yang tidak dimainkan (P-17) menghasilkan CSV berisi baris judul kolom saja. Jawaban 200 bertajuk `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="..."` (P-30), `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, dan `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`.

- **P-27. Format.**
  1. Berkas diawali BOM UTF-8 (`EF BB BF`), baris pertama berisi judul kolom (P-28, P-29), dan setiap baris diakhiri CRLF.
  2. Pemisah kolom titik koma (`;`). Bilangan pecahan memakai koma desimal tanpa pemisah ribuan (misalnya `71,3`); bilangan bulat ditulis apa adanya.
  3. Sel teks yang memuat `;`, `"`, CR, atau LF diapit tanda kutip ganda, dan tanda kutip ganda di dalamnya ditulis dua kali (RFC 4180).
  4. Perlindungan rumus: sel teks yang diawali `=`, `+`, `-`, `@`, tab, atau CR diberi awalan tanda kutip tunggal (`'`) lebih dulu, lalu aturan butir 3 diterapkan. Sel angka yang disusun server tidak diberi awalan.
  5. Waktu ditulis dalam WITA (UTC+8) berbentuk `YYYY-MM-DD HH:MM:SS`, dan tanggal berbentuk `YYYY-MM-DD`; zona waktunya disebut di judul kolom.
  6. Nilai kosong ditulis sebagai sel kosong. Nilai ya dan tidak ditulis "Ya" dan "Tidak", dan tingkat ditulis "Tepat", "Kurang tepat", atau "Berisiko".

- **P-28. CSV peserta.** Satu baris per peserta, menurut urutan P-21 (peringkat, lalu yang dikeluarkan):

  | No. | Judul kolom | Isi |
  |---|---|---|
  | 1 | Kelas | Label kelas ruang |
  | 2 | Tanggal (WITA) | Tanggal ruang dibuat |
  | 3 | Peringkat | Peringkat akhir; kosong untuk yang dikeluarkan |
  | 4 | Nama samaran | Nama samaran pemain |
  | 5 | Nomor absen | Kosong bila mode nomor absen mati |
  | 6 | Skor | Skor akhir |
  | 7 | Kejadian selesai | Jumlah kejadian yang kedua langkahnya dikunci |
  | 8 | Langkah 1 dijawab | Jumlah jawaban yang Langkah 1-nya dikunci |
  | 9 | Langkah 1 benar | Jumlah Langkah 1 benar |
  | 10 | Ketepatan Langkah 1 (%) | Satu angka di belakang koma; kosong bila belum ada Langkah 1 yang dikunci |
  | 11 | Langkah 2 tepat | Jumlah jawaban Langkah 2 bertingkat tepat |
  | 12 | Langkah 2 kurang tepat | Jumlah jawaban Langkah 2 bertingkat kurang tepat |
  | 13 | Langkah 2 berisiko | Jumlah jawaban Langkah 2 bertingkat berisiko |
  | 14 | Waktu skor (detik) | Satu angka di belakang koma; kosong bila skor 0 |
  | 15 | Bergabung (WITA) | Waktu pemain bergabung |
  | 16 | Keterangan | "Dikeluarkan", atau kosong |

- **P-29. CSV jawaban.** Satu baris per jawaban yang Langkah 1-nya dikunci, menurut urutan peserta P-28, lalu nomor kode kejadian:

  | No. | Judul kolom | Isi |
  |---|---|---|
  | 1 | Kelas | Label kelas ruang |
  | 2 | Tanggal (WITA) | Tanggal ruang dibuat |
  | 3 | Nama samaran | Nama samaran pemain |
  | 4 | Nomor absen | Kosong bila mode nomor absen mati |
  | 5 | Kode kejadian | Misalnya K-13 |
  | 6 | Judul kejadian | Judul versi yang dipakai ruang |
  | 7 | Versi kejadian | Nomor versi terbit, atau "Kerja" untuk versi kerja (ruang uji) |
  | 8 | Langkah 1: huruf | Huruf A sampai D yang dilihat pemain |
  | 9 | Langkah 1: pilihan | Teks pilihan |
  | 10 | Langkah 1: benar | Ya atau Tidak |
  | 11 | Langkah 2: huruf | Huruf A sampai C; kosong bila belum dikunci |
  | 12 | Langkah 2: pilihan | Teks pilihan; kosong bila belum dikunci |
  | 13 | Langkah 2: tingkat | Tingkat; kosong bila belum dikunci |
  | 14 | Poin | Poin kejadian itu |
  | 15 | Dibuka (WITA) | Saat dialog kejadian pertama dibuka |
  | 16 | Waktu menjawab (detik) | Dari dibuka sampai Langkah 2 dikunci, satu angka di belakang koma; kosong bila belum dikunci |
  | 17 | Keterangan | "Dikeluarkan", atau kosong |

- **P-30. Nama berkas dan unduhan di konsol.** Nama berkas `jejak-setara_{label}_{tanggal}_{jenis}.csv`:
  - `{label}`: label kelas dalam huruf kecil; setiap rangkaian karakter selain `a`–`z` dan `0`–`9` diganti satu tanda minus, tanpa tanda minus di kedua ujung, paling panjang 40 karakter, atau `ruang` bila hasilnya kosong;
  - `{tanggal}`: tanggal ruang dibuat dalam WITA, berbentuk `YYYY-MM-DD`;
  - `{jenis}`: `peserta` atau `jawaban`.

  Contoh: label "IX B" pada 20 November 2026 menjadi `jejak-setara_ix-b_2026-11-20_peserta.csv`. Konsol mengunduh lewat `fetch` dengan cookie sesi, lalu menyimpan isinya sebagai berkas dengan nama dari tajuk `Content-Disposition`. Selama mengunduh, tombol bertuliskan "Mengunduh…" dan nonaktif. Galat menampilkan pesan API, atau "CSV gagal diunduh. Coba lagi." bila jaringan gagal.

### Cetak ringkasan (usulan 8a)

- **P-31. Cetak.** Tombol "Cetak" memanggil fitur cetak peramban. Gaya cetak ada di `styles/kelas.css` (`@media print`):
  - Halaman A4 tegak dengan margin 12 mm.
  - Tidak dicetak: navigasi samping, kepala konsol, semua tombol, pemberitahuan, bagian kelola, daftar pemain langsung, rincian, "Pemakaian ronde ini", dan bagian hapus.
  - Dicetak: kepala "Hasil ronde · {kelas}" dengan "Kode ruang {kode}", ringkasan P-22, tabel peringkat lengkap, tabel Dikeluarkan (bila ada), dan kaki "Dicetak dari konsol Jejak Setara, {tanggal}."
  - Tabel memakai huruf sistem 10 pt dan garis 1 px `ink`; warna latar baris tidak dicetak; kepala tabel diulang di setiap halaman; baris tidak terpotong antarhalaman.

  Ruang dengan sampai 40 pemain muat dalam satu halaman A4.

### Hapus data ruang (usulan 9a, D-3)

- **P-32. Tampilan.** Untuk admin, halaman ruang yang sudah ditutup memuat bagian "Hapus data ruang" di akhir halaman dengan tombol `coral` "Hapus data ruang". Tombol itu membuka dialog konfirmasi berbahaya (Design System 10):
  - judul "Hapus data ruang {kelas}?";
  - isi "Data {n} peserta dan semua jawabannya di ruang ini dihapus permanen. Data ini tidak bisa dipulihkan dan tidak masuk statistik lagi.";
  - "Ketik label kelas {kelas} untuk melanjutkan." dengan isian berlabel "Label kelas";
  - tombol "Batal" dan tombol `coral` "Hapus data", yang aktif hanya bila isian sama dengan label kelas sesudah dipangkas, tanpa membedakan huruf besar dan kecil.

  Fokus awal di isian; "Batal" dan `Esc` menutup dialog. Selama menghapus, tombol bertuliskan "Menghapus…". Sesudah berhasil, konsol pindah ke `#/ruang/riwayat` dengan pemberitahuan "Data ruang {kelas} ({kode}) dihapus." Guru tidak melihat bagian ini.

- **P-33. API hapus.** `DELETE /api/ruang/{id}` (izin baru `ruang.hapus`, admin saja; CSRF). Ruang tidak ada: 404 `RUANG_TIDAK_ADA`. Ruang belum ditutup: 409 `BELUM_DITUTUP`. PRD 13 menulis admin dapat menghapus data satu ruang kapan saja; ruang yang masih berjalan ditutup lebih dulu, karena server ruang masih mengirim baris ke D1 selama ruang berjalan. Satu `batch` D1 berisi, berurutan:
  1. baris `log_audit` `ruang.hapus` dengan sasaran id ruang dan rincian `{ kode, labelKelas, dibuatPada, peserta, jawaban }` (jumlah baris yang dihapus), tanpa nama samaran;
  2. penghapusan baris `jawaban`, lalu `peserta`, lalu `ruang` ruang itu.

  Setiap pernyataan hanya berlaku bila ruang itu masih ada dan berstatus `ditutup`, seperti pola penghapusan rujukan JS-12, sehingga dua penghapusan yang hampir bersamaan menghasilkan tepat satu baris audit; permintaan yang kalah menerima 404. Jawaban 200 `{ ok: true }`.

  Penyimpanan Durable Object ruang itu tetap dihapus menurut jadwalnya sendiri: 24 jam sesudah ditutup bila antrean kosong (Architecture 7), dan paling lambat 7 hari sejak dibuat (JS-22 P-5). Kiriman yang masih tertunda dari ruang itu tidak bisa menghidupkan data lagi. Baris `ruang` dari Durable Object hanya diperbarui (`UPDATE`), sedangkan sisipan `peserta` dan `jawaban` gagal karena kunci asingnya ke `ruang`; Durable Object lalu berhenti mencoba sesuai JS-22 P-4.

### Layar kelas (usulan 10a)

- **P-34. Ikon centang.** Di 10 besar layar kelas, "✓{n}" diganti ikon `ikon_centang` setinggi 2,5u diikuti angka "{n}", dengan teks pembaca layar "{n} kejadian selesai" sebagai teks tersembunyi (bukan `aria-label` pada elemen tanpa peran). Label "✓ Jawaban tepat" di pembahasan juga diganti ikon `ikon_centang` diikuti "Jawaban tepat", karena memakai tanda yang sama dan tampil dengan masalah yang sama di peramban Windows. Teks JS-10 yang berubah ada di bagian "Teks yang tampil (final)". Ikon diimpor langsung dari berkas PNG di `admin/kelas/ikon-kelas.ts` (JS-10 P-35).

### Ukuran, kinerja, dan kuota (usulan 11a)

- **P-35. Anggaran.**
  - Kode layar pemain naik paling banyak 1 KB gzip dibanding `main` sebelum Build, dan konsol tetap di bawah 350 KB gzip. Kode konsol baru tidak mengimpor `assets/manifest.ts`, `bersama/`, `permainan/`, atau `TEKS` selain `isiTeks` (aturan JS-10 dan JS-12).
  - Pesan `selesai` dengan Paket inti 16 berukuran sekitar 9,3–9,5 KB (dihitung dari `bank-awal.json` dengan pilihan terpendek dan terpanjang, di luar repositori), dan paling besar sekitar 92 KB untuk 64 kejadian dengan panjang maksimum skema. Batas 2 KB hanya untuk pesan masuk, dan pesan keluar tidak dihitung kuota Durable Object.
  - Prototipe penyusun CSV jawaban di Node (di luar repositori, 20 November 2026): 40 pemain × 16 kejadian menghasilkan 166 KB dalam 1,7 ms, 100 × 16 menghasilkan 416 KB dalam 3,5 ms, dan 100 × 64 menghasilkan 1,6 MB dalam 12,3 ms. Di Cloudflare angkanya bisa dua sampai tiga kali angka Node (perbandingan hash sandi Plan JS-03 dan penutupan JS-04). Kelas biasa (sampai 40 pemain dengan Paket inti 16) tetap di bawah CPU 10 ms paket gratis, sedangkan ruang 100 pemain bisa melewatinya sesekali; kelebihan sesekali ditanggung kelonggaran CPU Cloudflare (Architecture 13.4). Sesudah Workers Paid aktif (sebelum JS-15 atau uji coba kelas pertama), batas 10 ms itu tidak berlaku lagi. Test mengukur ulang ruang 100 × 16 (AC-22).
  - Halaman hasil memakai satu permintaan hasil ditambah satu permintaan per rincian yang dibuka, dan riwayat satu permintaan per 50 ruang. Baris D1 yang dibaca: hasil paling banyak jumlah peserta ditambah jumlah jawaban ruang; CSV jawaban paling banyak jumlah jawaban ditambah jumlah versi kejadian.

## Beberapa pemain sekaligus

- Diberikan 40 pemain tersambung saat waktu habis, ketika ronde berakhir, maka setiap HP menerima satu `selesai` dengan rekapnya sendiri (sekitar 9,5 KB untuk Paket inti 16), dan D1 menerima baris peserta akhir dan `ringkasan_json` sekali.
- Diberikan 100 pemain tersambung, ketika ronde berakhir, maka seluruh `selesai` dikirim dalam satu giliran Durable Object (sekitar 1 MB keluar untuk Paket inti 16) tanpa pesan masuk tambahan.
- Diberikan satu pemain masih di layar pilih nama saat ronde berakhir, ketika ia memilih nama saat pembahasan, maka ia masuk peringkat dengan skor 0, pemain lain menerima `selesai` dengan jumlah pemain yang baru, dan baris D1 semua pemain diperbarui (P-13).
- Diberikan HP yang terputus saat ronde berakhir, ketika HP itu tersambung lagi saat pembahasan, maka ia menerima `selesai` dengan rekap yang sama seperti pemain lain yang tersambung sejak awal.
- Diberikan guru menutup ruang saat siswa masih menyalin refleksi, maka setiap HP yang sudah di layar rekap tetap menampilkannya dengan pita P-8 (D-2a).
- Diberikan guru mengeluarkan pemain saat pembahasan, maka peringkat semua pemain lain dihitung ulang, layar kelas menerima `papan` dan `kemajuan` baru, HP yang tersambung menerima `selesai` baru, dan hasil di konsol menampilkan pemain itu di tabel Dikeluarkan (P-13, D-4).
- Diberikan admin dan guru pemilik membuka hasil ruang yang sama, maka keduanya melihat data yang sama; hanya admin yang melihat "Pemakaian ronde ini" dan bagian hapus.
- Diberikan admin menghapus data ruang saat guru membuka hasilnya, ketika guru membuka rincian, mengunduh CSV, atau memuat ulang, maka server menjawab 404 dan halaman menampilkan "Ruang tidak ditemukan atau sudah dihapus."
- Diberikan dua admin menghapus ruang yang sama hampir bersamaan, maka tepat satu berhasil dan yang lain menerima 404.
- Diberikan guru mengunduh CSV saat kiriman ke D1 masih tertunda, maka CSV berisi data yang sudah sampai di D1, dan bagian hasil menampilkan pesan P-15.

## Status antarmuka

| Tempat | Status | Tampilan |
|---|---|---|
| Layar rekap | Biasa | P-4 |
| Layar rekap | Sebelum `selesai` tiba | Skor dan peringkat dari `pribadi` terakhir; daftar dan refleksi tampil begitu `selesai` tiba (biasanya kurang dari 1 detik) |
| Layar rekap | Kosong | "Belum ada kejadian yang kamu jawab di ronde ini." dan Refleksi |
| Layar rekap | Skor 0 | "Skormu 0" tanpa peringkat (P-5) |
| Layar rekap | Menyambung ulang | Pita `mango` P-7; isi tetap terbaca |
| Layar rekap | Ruang ditutup atau sambungan berhenti | Pita `mist` dan satu tombol menurut penyebabnya (P-8) |
| Layar rekap | Dikeluarkan | Layar galat JS-03 |
| Layar rekap | Fokus | Latar `sun` dan ▶ pada tautan dan tombol |
| `#/ruang` dan `#/ruang/riwayat` | Tab | Tab aktif berlatar `sun` dengan ▶ dan `aria-current="page"`; tab lain berupa tautan biasa |
| `#/ruang/riwayat` | Memuat / kosong / kosong dengan saringan / galat | "Memuat riwayat…" / "Belum ada ruang yang ditutup." / "Tidak ada ruang yang cocok dengan saringan." / "Riwayat ruang gagal dimuat." dengan "Coba lagi" |
| `#/ruang/riwayat` | Memuat lebih banyak | Tombol "Memuat…" nonaktif; baris lama tetap tampil |
| Saringan riwayat | Galat tanggal | Pesan di bawah isian "Sampai tanggal"; API tidak dipanggil |
| Bagian hasil | Memuat / galat / tidak dimainkan / kiriman tertunda | "Memuat hasil…" / "Hasil ronde gagal dimuat." dengan "Coba lagi" / "Ronde tidak dimainkan di ruang ini." / pesan P-15 |
| Rincian | Memuat / galat / kosong | "Memuat rincian…" / "Rincian gagal dimuat." dengan "Coba lagi" / "Belum ada kejadian yang dijawab." |
| Unduh CSV | Mengunduh / galat | Tombol "Mengunduh…" nonaktif / pesan galat di bawah baris tombol |
| Dialog hapus | Nonaktif / aktif / menghapus / galat | "Hapus data" nonaktif sampai label cocok / aktif / "Menghapus…" / pesan galat di dalam dialog |
| Cetak | Media cetak | Hanya bagian P-31 |
| Layar kelas | 10 besar dan pembahasan | Ikon centang dengan angka atau tulisan (P-34) |

## Teks yang tampil (final)

Teks dengan `{…}` diisi lewat `isiTeks()`. Teks yang sudah ada dan dipakai ulang tanpa perubahan tidak dicantumkan di tabel: di layar pemain `ronde.selesai`, `ronde.selesaiIsi`, `ronde.skorAkhir`, `ronde.peringkatAkhir`, `ronde.tanpaSkor`, `dialog.tepat`, `dialog.belumTepat`, `dialog.pilihanmu`, `dialog.jawabanTepat`, `kartu.tingkat.*`, `kartu.pilihanTepat`, `kartu.rujukan`, `kartu.rujukanUji`, `tombol.kembali`, `tombol.muatUlang`, dan `berhenti.cobaLagi`; di konsol `bank.tingkatTepat`, `bank.tingkatKurang`, `bank.tingkatBerisiko`, `detail.*`, `ruang.*`, `status.*`, `batal`, dan `galatRuang.*` yang lama.

**Layar pemain** (`TEKS`, `app/jejak-setara/teks.ts`)

| Kunci | Teks |
|---|---|
| `rekap.keRefleksi` | Langsung ke refleksi |
| `rekap.judul` | Kejadian yang kamu jawab ({n}) |
| `rekap.poin` | {poin} poin |
| `rekap.langkah` | Langkah {n} |
| `rekap.belumDijawab` | Belum dijawab |
| `rekap.refleksiJudul` | Refleksi |
| `rekap.refleksiPengantar` | Salin dan lengkapi kalimat ini di buku catatanmu. |
| `rekap.refleksiHak` | Satu hak yang kupelajari hari ini adalah hak … untuk … |
| `rekap.refleksiKewajiban` | Satu kewajiban yang akan kujalankan minggu ini adalah … |
| `rekap.pitaMenyambung` | Menyambung ulang… Rekapmu tetap bisa dibaca. |
| `rekap.pitaDitutup` | Ruang sudah ditutup. Rekapmu tetap tampil sampai halaman ini ditutup. |
| `rekap.pitaBerhenti` | Sambungan ke ruang berhenti. Rekapmu tetap tampil sampai halaman ini ditutup. |

**Konsol** (`TEKS_KONSOL`, `app/jejak-setara/teks-konsol.ts`)

| Kunci | Teks |
|---|---|
| `riwayatRuang.bagian` | Bagian halaman Ruang |
| `riwayatRuang.tabBerjalan` / `riwayatRuang.tabRiwayat` | Berjalan / Riwayat |
| `riwayatRuang.dari` / `riwayatRuang.sampai` | Dari tanggal / Sampai tanggal |
| `riwayatRuang.label` | Label kelas |
| `riwayatRuang.labelPetunjuk` | Cukup sebagian, misalnya IX. |
| `riwayatRuang.guru` / `riwayatRuang.semuaGuru` | Guru / Semua guru |
| `riwayatRuang.terapkan` / `riwayatRuang.aturUlang` | Terapkan / Atur ulang |
| `riwayatRuang.galatTanggal` | Tanggal akhir tidak boleh sebelum tanggal awal. |
| `riwayatRuang.ringkasan` | Menampilkan {n} ruang |
| `riwayatRuang.kolomTanggal` / `riwayatRuang.kolomKelas` / `riwayatRuang.kolomKode` | Tanggal / Kelas / Kode |
| `riwayatRuang.kolomPemain` / `riwayatRuang.kolomRata` / `riwayatRuang.kolomGuru` | Pemain / Rata-rata skor / Guru |
| `riwayatRuang.hasil` | Hasil |
| `riwayatRuang.hasilLabel` | Hasil ruang {kelas}, {tanggal} |
| `riwayatRuang.tidakDimainkan` | Tidak dimainkan |
| `riwayatRuang.muatLagi` / `riwayatRuang.memuatLagi` | Muat lebih banyak / Memuat… |
| `riwayatRuang.kosong` | Belum ada ruang yang ditutup. |
| `riwayatRuang.kosongSaringan` | Tidak ada ruang yang cocok dengan saringan. |
| `riwayatRuang.memuat` | Memuat riwayat… |
| `riwayatRuang.gagal` | Riwayat ruang gagal dimuat. |
| `riwayatRuang.cobaLagi` | Coba lagi |
| `hasil.judul` | Hasil ronde |
| `hasil.kembaliRiwayat` | ← Riwayat ruang |
| `hasil.memuat` | Memuat hasil… |
| `hasil.gagal` | Hasil ronde gagal dimuat. |
| `hasil.cobaLagi` | Coba lagi |
| `hasil.tidakDimainkan` | Ronde tidak dimainkan di ruang ini. |
| `hasil.menyimpan` | Sebagian hasil masih disimpan. Halaman ini memuat ulang sendiri. |
| `hasil.tanggal` / `hasil.guru` / `hasil.paket` / `hasil.durasi` | Tanggal / Guru / Paket / Durasi |
| `hasil.pemain` / `hasil.rataSkor` / `hasil.ketepatan` / `hasil.langkah2` | Pemain / Rata-rata skor / Ketepatan Langkah 1 / Langkah 2 |
| `hasil.tanggalIsi` | {tanggal}, {mulai}–{selesai} |
| `hasil.paketIsi` | {nama} · {n} kejadian |
| `hasil.durasiIsi` | {n} menit |
| `hasil.pemainIsi` | {n} ({m} dikeluarkan) |
| `hasil.persen` | {n}% |
| `hasil.sebaranIsi` | Tepat {a}% · Kurang tepat {b}% · Berisiko {c}% |
| `hasil.kosongNilai` | – |
| `hasil.uji` | Ruang uji: hasilnya tidak masuk statistik. |
| `hasil.unduhPeserta` | Unduh CSV peserta |
| `hasil.unduhJawaban` | Unduh CSV jawaban |
| `hasil.mengunduh` | Mengunduh… |
| `hasil.unduhGagal` | CSV gagal diunduh. Coba lagi. |
| `hasil.cetak` | Cetak |
| `hasil.cetakJudul` | Hasil ronde · {kelas} |
| `hasil.cetakKode` | Kode ruang {kode} |
| `hasil.cetakKaki` | Dicetak dari konsol Jejak Setara, {tanggal}. |
| `hasil.peringkatJudul` | Peringkat lengkap |
| `hasil.kolomPeringkat` / `hasil.kolomNama` / `hasil.kolomAbsen` / `hasil.kolomSkor` | Peringkat / Nama samaran / No. absen / Skor |
| `hasil.kolomSelesai` / `hasil.kolomKetepatan` / `hasil.kolomWaktu` | Kejadian selesai / Ketepatan Langkah 1 / Waktu skor |
| `hasil.kolomTepat` / `hasil.kolomKurang` / `hasil.kolomBerisiko` | Tepat / Kurang tepat / Berisiko |
| `hasil.dikeluarkanJudul` | Dikeluarkan ({n}) |
| `hasil.dikeluarkanKet` | Pemain yang dikeluarkan guru tidak masuk peringkat dan ringkasan. |
| `hasil.rincian` / `hasil.tutupRincian` | Rincian / Tutup rincian |
| `hasil.rincianLabel` | Rincian jawaban {nama} |
| `hasil.rincianMemuat` | Memuat rincian… |
| `hasil.rincianGagal` | Rincian gagal dimuat. |
| `hasil.rincianKosong` | Belum ada kejadian yang dijawab. |
| `hasil.rKejadian` / `hasil.rLangkah1` / `hasil.rLangkah2` / `hasil.rPoin` / `hasil.rWaktu` | Kejadian / Langkah 1 / Langkah 2 / Poin / Waktu menjawab |
| `hasil.rJudul` | {kode} · {judul} |
| `hasil.rPilihan` | {huruf}. {teks} |
| `hasil.rTepat` / `hasil.rBelumTepat` | Tepat / Belum tepat |
| `hasil.rJawabanTepat` | Jawaban tepat: {teks} |
| `hasil.rPilihanTepat` | Pilihan yang tepat: {teks} |
| `hasil.rBelumDijawab` | Belum dijawab |
| `hasil.rDetik` | {n} detik |
| `hasil.hapus` | Hapus data ruang |
| `hasil.hapusJudul` | Hapus data ruang {kelas}? |
| `hasil.hapusIsi` | Data {n} peserta dan semua jawabannya di ruang ini dihapus permanen. Data ini tidak bisa dipulihkan dan tidak masuk statistik lagi. |
| `hasil.hapusKetik` | Ketik label kelas {kelas} untuk melanjutkan. |
| `hasil.hapusIsian` | Label kelas |
| `hasil.hapusTombol` | Hapus data |
| `hasil.menghapus` | Menghapus… |
| `hasil.okHapus` | Data ruang {kelas} ({kode}) dihapus. |
| `galatRuang.HASIL_BELUM_ADA` | Hasil tersedia sesudah ronde selesai. |
| `galatRuang.BELUM_DITUTUP` | Data ruang hanya bisa dihapus sesudah ruang ditutup. |

**Isi berkas CSV** (`TEKS_KONSOL.csv`, dipakai server)

| Kunci | Teks |
|---|---|
| `csv.kelas` | Kelas |
| `csv.tanggal` | Tanggal (WITA) |
| `csv.peringkat` | Peringkat |
| `csv.nama` | Nama samaran |
| `csv.absen` | Nomor absen |
| `csv.skor` | Skor |
| `csv.selesai` | Kejadian selesai |
| `csv.l1Dijawab` | Langkah 1 dijawab |
| `csv.l1Benar` | Langkah 1 benar |
| `csv.ketepatan` | Ketepatan Langkah 1 (%) |
| `csv.tepat` | Langkah 2 tepat |
| `csv.kurang` | Langkah 2 kurang tepat |
| `csv.berisiko` | Langkah 2 berisiko |
| `csv.waktuSkor` | Waktu skor (detik) |
| `csv.gabung` | Bergabung (WITA) |
| `csv.keterangan` | Keterangan |
| `csv.kodeKejadian` | Kode kejadian |
| `csv.judul` | Judul kejadian |
| `csv.versi` | Versi kejadian |
| `csv.hurufL1` | Langkah 1: huruf |
| `csv.pilihanL1` | Langkah 1: pilihan |
| `csv.benarL1` | Langkah 1: benar |
| `csv.hurufL2` | Langkah 2: huruf |
| `csv.pilihanL2` | Langkah 2: pilihan |
| `csv.tingkatL2` | Langkah 2: tingkat |
| `csv.poin` | Poin |
| `csv.dibuka` | Dibuka (WITA) |
| `csv.waktuMenjawab` | Waktu menjawab (detik) |
| `csv.ya` / `csv.tidak` | Ya / Tidak |
| `csv.dikeluarkan` | Dikeluarkan |
| `csv.versiKerja` | Kerja |
| `csv.tingkatTepat` / `csv.tingkatKurang` / `csv.tingkatBerisiko` | Tepat / Kurang tepat / Berisiko |

**Teks JS-10 yang berubah** (`TEKS_KONSOL.kelas`; menggantikan baris yang sama di spesifikasi JS-10 untuk uji AC-25 JS-10)

| Kunci | Teks |
|---|---|
| `kelas.selesaiJumlah` | {n} |
| `kelas.jawabanTepat` | Jawaban tepat |

## Data, protokol, API, dan migrasi

**Migrasi D1:** `0002_peserta_dikeluarkan.sql` (P-10), diterapkan otomatis oleh langkah migrasi D1 di "Jejak: uji" sebelum deploy, dan oleh `db:migrasi:lokal` serta uji server di mesin agen.

**Rute API baru** (jawaban JSON kecuali CSV; galat berbentuk `{ galat: { kode, pesan } }`; `DELETE` memeriksa CSRF):

| Rute | Izin | Jawaban berhasil | Galat |
|---|---|---|---|
| `GET /api/ruang/riwayat` | `ruang.kelola` | 200 `{ ruang, berikutnya }` (P-17) | 400 `ISI_SALAH`, 401 |
| `GET /api/ruang/{id}/hasil` | `ruang.kelola` (pemilik atau admin) | 200 (P-21) | 401, 404 `RUANG_TIDAK_ADA`, 409 `HASIL_BELUM_ADA` |
| `GET /api/ruang/{id}/hasil/{pesertaId}` | `ruang.kelola` (pemilik atau admin) | 200 `{ peserta, jawaban }` (P-24) | 401, 404 `RUANG_TIDAK_ADA` atau `PEMAIN_TIDAK_ADA`, 409 `HASIL_BELUM_ADA` |
| `GET /api/ruang/{id}/ekspor?jenis=peserta\|jawaban` | `ruang.kelola` (pemilik atau admin) | 200 CSV (P-26 sampai P-30) | 400 `ISI_SALAH`, 401, 404 `RUANG_TIDAK_ADA`, 409 `HASIL_BELUM_ADA` |
| `DELETE /api/ruang/{id}` | `ruang.hapus` (admin) | 200 `{ ok: true }` (P-33) | 401, 403 `TIDAK_BERWENANG`, 404 `RUANG_TIDAK_ADA`, 409 `BELUM_DITUTUP` |

`IZIN` mendapat `"ruang.hapus": ["admin"]`. Kode galat API baru: `HASIL_BELUM_ADA` (409) dan `BELUM_DITUTUP` (409), keduanya di `KODE_GALAT_RUANG`. Rute riwayat dikenali sebelum pola `/api/ruang/{id}`. Skema zod isi jawaban riwayat, hasil, dan rincian ada di `inti/hasil.ts` dan dipakai konsol untuk memeriksa jawaban.

**D1:** kueri baru di `db/ruang.ts`: riwayat (P-17, memakai indeks `ruang_dibuat` dan `ruang_pemilik` yang sudah ada), hasil (peserta dan hitungan jawaban per peserta dalam satu kueri), rincian (jawaban satu peserta dengan isi `kejadian_versi`), ekspor, dan hapus (P-33). `UPSERT_PESERTA` mendapat kolom `dikeluarkan`. `ruang.ringkasan_json` berbentuk P-14.

**Protokol real-time:** `PROTOKOL_VERSI` tetap 2. Skema `selesai` tidak berubah; `rekap` yang selama ini kosong kini terisi (P-1), dan klien lama yang belum dimuat ulang hanya mengabaikannya. Pesan layar kelas tidak berubah bentuk; `papan` dan `kemajuan` juga dikirim sesudah P-13.

**Durable Object:** tidak ada tabel SQLite baru. `GET https://ruang/kelola` mendapat `kirimanTertunda` (P-15). Keluaran inti ruang mendapat tanda untuk menulis `ringkasan_json` (P-14).

## Aset

Tidak ada aset gambar atau token CSS baru. Yang dipakai, semuanya Disetujui: `ikon_centang` (layar kelas, P-34), `ikon_emosi_hati` dan `ikon_emosi_tanya` (tanda Langkah 1, seperti pita umpan balik JS-08), `ikon_emosi_hati`, `ikon_emosi_keringat`, dan `ikon_emosi_seru` (tanda tingkat Langkah 2 di rekap dan kepala kolom tingkat di hasil, seperti kepala kartu dampak JS-08), serta `ikon_peringatan` (pesan galat konsol). Layar pemain memuat ikon emosi lewat `assets/manifest.ts` seperti dialog kejadian; konsol mengimpornya langsung dari berkas PNG.

## Keamanan dan privasi

- Rekap hanya berisi data pemain itu sendiri, dikirim lewat sambungannya sendiri, dan hanya disimpan di memori tab; tidak ada `localStorage` atau penyimpanan lain di HP.
- Hasil, rincian, dan CSV hanya untuk admin dan guru pemilik ruang; pengguna lain mendapat 404. Isinya nama samaran dan nomor absen (bila mode nomor absen aktif), tanpa nama asli siswa. Proyektor tetap hanya menampilkan 10 besar dan podium.
- CSV dilindungi dari rumus Excel (P-27 butir 4), dijawab dengan tajuk keamanan API, dan tidak tersimpan di server sesudah diunduh.
- Hapus data ruang hanya untuk admin (D-3), dengan konfirmasi mengetik label kelas, dan dicatat di log audit tanpa nama samaran. Penyimpanan Durable Object ruang itu terhapus 24 jam sesudah ruang ditutup bila semua kiriman sudah sampai, dan paling lambat 7 hari sejak ruang dibuat.
- Cetakan hanya memuat ringkasan dan peringkat dengan nama samaran.

## Di luar cakupan

- Statistik per kejadian lintas ruang dan isi dasbor (JS-13). `ringkasan_json.hasil` disiapkan untuk JS-13.
- Masa simpan dan penghapusan otomatis data (JFR-40), serta halaman log audit (JFR-39), keduanya JS-19.
- Rekap sebagai gambar PNG (JFR-33, P2).
- Kolom "Petunjuk dipakai" di CSV jawaban dan rekap Petunjuk (JS-09).
- Zona waktu selain WITA di CSV (pengaturan umum, JS-19).
- Panduan guru (JS-16, Permintaan A-13), kode masuk ulang (JS-17), dan statistik per siswa lintas sesi (JS-20).

## DRAF untuk ditinjau pemilik proyek

- **D-1. Dua kalimat refleksi (Permintaan A-12).** Rincian dan contoh isian ketiga pasangan ada di `naskah/refleksi.md` (Sesi B, 20 November 2026). Semua kalimat paling banyak 80 karakter dan bermakna juga bagi pemain yang belum menjawab kejadian.
  - (a, saran Sesi B) **Pasangan 1:** pengantar "Salin dan lengkapi kalimat ini di buku catatanmu.", lalu "Satu hak yang kupelajari hari ini adalah hak … untuk …" (54 karakter) dan "Satu kewajiban yang akan kujalankan minggu ini adalah …" (55 karakter). Paling cepat dilengkapi, meniru bentuk kartu dampak, dan kewajibannya menjadi rencana minggu itu yang bisa ditanyakan guru (TP 5). Jawaban siswa cenderung singkat.
  - (b) **Pasangan 2:** pengantar "Tulis jawabanmu di buku catatan.", lalu "Hak siapa yang paling kamu ingat hari ini, dan mengapa hak itu penting?" (71 karakter) dan "Kewajiban apa yang akan kamu jalankan di rumah atau di sekolah minggu ini?" (74 karakter). Memancing alasan (TP 2) dan sebentuk dengan pemantik refleksi Sehari Setara, tetapi setiap kalimat dua baris di HP dan lebih lama ditulis.
  - (c) **Pasangan 3:** pengantar seperti (a), lalu "Satu hak yang kupelajari hari ini adalah …, yang dijamin oleh …" (63 karakter) dan "Untuk menghormati hak orang lain, aku wajib …" (45 karakter). Menautkan hak dengan rujukannya (TP 3), tetapi menyalin nomor pasal memakan waktu, dan kalimat kewajibannya bukan rencana tindakan.

  Pilihan (b) atau (c) hanya mengubah baris `rekap.refleksiPengantar`, `rekap.refleksiHak`, dan `rekap.refleksiKewajiban` di tabel teks. Menurut `refleksi.md`, kalimat dari pasangan berbeda boleh dipadukan bila bentuknya sama (kalimat rumpang dengan kalimat rumpang).

- **D-2. Rekap sesudah ruang ditutup (Permintaan A-12).**
  - (a, saran) HP yang sudah menampilkan rekap tetap menampilkannya sesudah ruang ditutup atau sambungannya berhenti, dengan pita keterangan dan satu tombol di akhir rekap (P-8). Siswa bisa menyelesaikan salinan refleksi walaupun guru sudah menutup ruang, dan guru tidak perlu menunggu semua siswa selesai menulis.
  - (b) Seperti sekarang: HP pindah ke layar "Ruang ditutup", dan panduan guru (JS-16) meminta guru menutup ruang sesudah siswa selesai menulis. Lebih sedikit perubahan di layar pemain, tetapi rekap hilang bila ruang ditutup terlalu cepat.

- **D-3. Guru menghapus data ruangnya sendiri.** PRD 11.1 menulis guru boleh menghapus data ruang miliknya, sedangkan usulan 9a yang disetujui menulis "Guru tidak bisa menghapus."
  - (a, sesuai usulan 9a) Hanya admin. Saat Build, baris "Menghapus data ruang" di PRD 11.1 diubah menjadi "Tidak" untuk guru, dan baris `DELETE /api/ruang/{id}` di Architecture 10.2 ikut disesuaikan.
  - (b) Admin dan guru pemilik, sesuai PRD 11.1. Izin `ruang.hapus` berlaku untuk keduanya, dengan pemeriksaan kepemilikan seperti `ruang.kelola`.

- **D-4. Pemain yang dikeluarkan di hasil.**
  - (a, saran) Tampil di tabel terpisah "Dikeluarkan" tanpa peringkat, beserta rincian jawabannya; tidak dihitung di ringkasan; di CSV peserta dan CSV jawaban dengan keterangan "Dikeluarkan". Guru tetap tahu apa yang sudah dijawab siswa itu.
  - (b) Tidak tampil di hasil dan CSV sama sekali.

  Kedua pilihan memerlukan kolom `peserta.dikeluarkan` (P-10), karena D1 belum bisa membedakan pemain yang dikeluarkan.

## Kriteria penerimaan

- [ ] AC-1 **Isi rekap.** P-1 dan P-2: butir menurut urutan kejadian ruang; kejadian yang hanya dibuka tidak masuk; teks dipetakan dari id asli lewat urutan acak yang diketahui; Langkah 2 yang belum dikunci bernilai `null`; semua pilihan tepat tercantum; rujukan berupa teks.
- [ ] AC-2 **Pengiriman rekap.** P-3: `selesai` dengan rekap saat ronde berakhir, saat menyambung ulang di `selesai` dan `pembahasan`, dan sesudah P-13; pesan lolos skema dan `PROTOKOL_VERSI` tetap 2.
- [ ] AC-3 **Layar rekap.** P-4 dan P-5: susunan isi, tanda tepat dan tingkat dengan ikon dan tulisan, "Belum dijawab", catatan ruang uji, rekap kosong, dan skor 0; tidak meluap di HP 731 × 411 dan laptop 1280 × 720.
- [ ] AC-4 **Refleksi.** P-6 dengan teks sesuai D-1; tautan "Langsung ke refleksi" menggulir dan memindahkan fokus.
- [ ] AC-5 **Rekap saat menyambung ulang.** P-7: pita, bukan lapisan, di layar rekap; layar lain tetap memakai lapisan JS-07.
- [ ] AC-6 **Rekap sesudah sambungan berakhir.** P-8 sesuai D-2: pita, tombol, dan token diuji di klien murni untuk setiap penyebab berakhir, dan tutup ruang diuji di ujung ke ujung; pemain yang dikeluarkan tetap ke layar galat.
- [ ] AC-7 **Aksesibilitas rekap.** P-9: struktur judul, daftar, pengumuman pita, keyboard, dan target sentuh.
- [ ] AC-8 **Migrasi.** P-10: `0002` berlaku di atas `0001`; baris lama bernilai 0; `UPSERT_PESERTA` menulis kolom itu; uji semai bank awal tetap lulus.
- [ ] AC-9 **Hasil akhir di D1.** P-11 sampai P-13: baris peserta akhir dengan `dikeluarkan`; ruang yang ditutup dari `main` dan `jeda` punya peringkat akhir; perubahan peringkat sesudah ronde (pemain dikeluarkan atau baru memilih nama) menghitung ulang peringkat dan mengirim `papan`, `kemajuan`, dan `selesai`.
- [ ] AC-10 **Ringkasan hasil.** P-14: `ringkasan_json` berisi `pemakaian` dan `hasil`, ditulis pada keempat saat itu, dan angka `hasil` sama dengan ringkasan P-21 (uji server).
- [ ] AC-11 **Kiriman tertunda.** P-15: `kirimanTertunda` benar selama antrean berisi, dan bagian hasil menampilkan pesannya lalu memuat ulang.
- [ ] AC-12 **Rute dan tab.** P-16 dan P-19: `#/ruang/riwayat` dikenali, menu Ruang aktif di ketiga rute, tab bertanda `aria-current`, dan tautan kembali sesuai status ruang.
- [ ] AC-13 **API riwayat.** P-17: hanya ruang ditutup; kepemilikan guru; saringan tanggal (batas bawah ikut, batas atas tidak); label sebagian tanpa membedakan huruf; guru (admin saja); `batas` dan penanda halaman yang tidak melompati atau mengulang ruang; `dimainkan` untuk ruang yang ditutup dari lobi, saat hitung mundur, dan sesudah ronde; parameter tidak sah 400.
- [ ] AC-14 **Halaman riwayat.** P-18: saringan, galat tanggal tanpa memanggil API, tabel dan kartu, muat lebih banyak, serta tampilan kosong, memuat, dan gagal.
- [ ] AC-15 **API hasil dan rincian.** P-21 dan P-24: angka per peserta dan ringkasan sesuai definisi (uji dengan data yang diketahui), urutan, 409 untuk ruang yang belum selesai, 404 untuk guru lain dan peserta asing, serta huruf sesuai urutan acak pemain.
- [ ] AC-16 **Halaman hasil.** P-20, P-22 sampai P-25: ringkasan, tabel peringkat dan Dikeluarkan (sesuai D-4), rincian, muat ulang, dan tidak meluap di 1280 × 720 dan HP 360 × 640.
- [ ] AC-17 **CSV.** P-26 sampai P-30: BOM, titik koma, CRLF, koma desimal, kutip, perlindungan rumus untuk keenam awalan tanpa mengubah teks yang aman, WITA, kolom dan urutannya, nama berkas, tajuk, izin, dan status.
- [ ] AC-18 **Cetak.** P-31: pada media cetak hanya bagian yang ditentukan yang tampil, dan ruang 40 pemain menghasilkan PDF A4 satu halaman.
- [ ] AC-19 **Hapus data ruang.** P-32 dan P-33 sesuai D-3: tombol aktif hanya bila label cocok; izin; 409 untuk ruang yang belum ditutup; baris `jawaban`, `peserta`, dan `ruang` terhapus dalam satu batch; satu baris log audit; ruang hilang dari riwayat.
- [ ] AC-20 **Ikon centang.** P-34: tidak ada tanda ✓ berupa huruf di 10 besar dan pembahasan; ikon dan teks pembaca layar tampil.
- [ ] AC-21 **Teks.** Isi `TEKS` dan `TEKS_KONSOL` sama dengan bagian "Teks yang tampil (final)" spesifikasi ini, dan uji teks JS-10 (AC-25) memakai tabel "Teks JS-10 yang berubah".
- [ ] AC-22 **Ukuran dan kinerja.** P-35: kode layar pemain naik paling banyak 1 KB gzip; konsol di bawah 350 KB gzip; aturan impor konsol; penyusun CSV jawaban untuk 100 pemain × 16 kejadian paling lama 5 ms di Node (median 20 kali di mesin agen, dicatat di laporan uji).
- [ ] AC-23 **Beban.** `sim:beban` 1 ruang × 50 bot di Worker lokal sampai ronde berakhir: setiap bot menerima `selesai` dengan rekap yang lolos skema, tanpa putus tak terduga dan tanpa galat; ukuran `selesai` dan baris D1 akhir dicatat.
- [ ] AC-24 **Tanpa regresi.** Semua uji JS-01 sampai JS-22 lulus, dan `build:pages` menghasilkan 178 berkas yang identik byte dengan `main` sebelum Build.

## Rencana uji

### Uji unit (`test:jejak`)

- Penyusun rekap dan ringkasan hasil (`rekap-ruang.ts`): urutan, cakupan, pemetaan id asli ke teks, Langkah 2 kosong, beberapa pilihan tepat, rujukan, dan ukuran pesan untuk 64 kejadian.
- Inti ruang: `selesai` dengan rekap saat akhir ronde dan saat menyambung ulang; P-12 (tutup dari `main` dan `jeda`, `tutupPaksa`, serta tutup dari `hitung_mundur` tanpa hasil); P-13 (keluarkan dan pilih nama sesudah ronde: peringkat ulang, `papan` dan `kemajuan`, `selesai`, baris peserta, dan tanda ringkasan); baris peserta dengan `dikeluarkan`; `kirimanTertunda`.
- Klien murni: layar, pita, tombol, dan token sesudah `status_ruang` ditutup, `RUANG_TIDAK_ADA`, kode 4000, putus terlalu lama, layanan berhenti, versi berbeda, dan dikeluarkan, baik sudah maupun belum di layar rekap (D-2); pita menyambung ulang (P-7).
- CSV (`ekspor/csv.ts`): sel, BOM, CRLF, koma desimal, kutip, perlindungan rumus (keenam awalan, serta teks aman seperti "IX-B" dan "K-13" yang tidak berubah), WITA termasuk pergantian hari pukul 16.00 UTC, dan nama berkas (label dengan spasi, garis miring, huruf non-Latin, dan label yang menjadi kosong).
- API dengan D1 tiruan: riwayat (saringan, kepemilikan, penanda halaman), hasil (angka), rincian (huruf), ekspor (izin, status, jenis), dan hapus (admin, status, batch, audit).
- `admin/rute.ts`: `#/ruang/riwayat` dan bentuk id lain.
- Fungsi tampilan murni: waktu skor "m:ss", persen, tanggal saringan ke milidetik, dan pencocokan label untuk hapus.
- Kerangka: migrasi `0002`, tabel `IZIN` (`ruang.hapus`), teks JS-11 dan pengganti teks JS-10, serta aturan impor konsol.

### Uji server (`test:jejak:server`, baru `server/jejak-setara/uji/hasil.uji-server.ts`)

- Ronde penuh di Worker lokal: admin membuat ruang uji; tiga pemain bergabung dan menjawab, satu di antaranya hanya mengunci Langkah 1; ronde diakhiri; setiap pemain menerima `selesai` dengan rekap; satu pemain dikeluarkan saat pembahasan; D1 berisi peserta akhir dengan `dikeluarkan` dan `ringkasan_json.hasil` yang sama dengan `GET .../hasil`; ruang ditutup; riwayat memuat ruang itu; rincian; kedua CSV diurai ulang dan dicocokkan dengan D1; hapus oleh guru 403 (sesuai D-3a) dan oleh admin 200; ruang hilang dari riwayat.
- Berhenti paksa dari status `main` lewat kait uji lokal `pengaman` (JS-22): baris peserta punya peringkat akhir (P-12).
- Uji server JS-03 sampai JS-22 tetap lulus.

### Uji ujung ke ujung (`test:e2e:jejak`, baru `e2e/jejak-setara/hasil.uji.ts`)

- Multi-konteks: guru membuat ruang; dua pemain, satu dengan emulasi HP Android, menjawab; ronde diakhiri; HP menampilkan rekap dengan teks yang benar dan refleksi; guru menutup ruang dan rekap tetap tampil dengan pita (D-2a); di konsol riwayat, hasil, rincian, unduh kedua CSV (isi diperiksa: BOM dan titik koma), tampilan cetak (`emulateMedia` dan PDF A4 satu halaman), lalu hapus data oleh admin.
- Tangkapan layar di `docs/jejak-setara/tests/JS-11/`: rekap di HP 731 × 411 dan laptop 1280 × 720 (berisi, kosong, dan sesudah ditutup); riwayat dan hasil di 1280 × 720 dan HP 360 × 640; dialog hapus; pratinjau cetak; serta 10 besar dan pembahasan layar kelas di 1024 × 768 dan 1920 × 1080 dengan ikon centang (AGENTS 4.4).
- Uji ujung ke ujung lama tetap lulus.

### Beban dan ukuran

- `sim:beban` 1 ruang × 50 bot sampai ronde berakhir (AC-23).
- Ukuran kode layar pemain dan konsol dibandingkan dengan `main` sebelum Build (AC-22).
- Waktu penyusun CSV jawaban untuk 100 × 16 dan 100 × 64 diukur di Node (median 20 kali) dan dicatat di laporan uji. Pengukuran ini tidak menjadi uji otomatis, karena waktunya bergantung pada mesin yang menjalankannya.

### Manual (AGENTS 9) dan lingkungan uji

Langkah pemilik proyek sesudah ZIP Build di-push:

1. Pastikan "Jejak: uji" hijau, termasuk langkah migrasi D1 yang menerapkan `0002`.
2. Jalankan satu ronde pendek dengan dua atau tiga HP sampai rekap tampil, salin satu kalimat refleksi, lalu tutup ruang dan pastikan rekap tetap tampil dengan pita (sesuai D-2).
3. Di konsol, buka Ruang, lalu tab Riwayat; coba saringan, buka hasil ruang tadi, dan buka satu rincian.
4. Unduh CSV peserta dan CSV jawaban, lalu buka keduanya di Excel berbahasa Indonesia: kolom terpisah, huruf Indonesia tampil benar, dan angka desimal memakai koma.
5. Klik Cetak dan periksa pratinjau cetaknya, atau simpan sebagai PDF.
6. Sebagai admin, hapus data satu ruang uji, lalu pastikan ruang itu hilang dari Riwayat.
7. Kirim tangkapan layar rekap di HP, hasil di konsol, dan CSV di Excel.

Butir daftar periksa AGENTS 9 yang relevan: tidak ada nama asli siswa di layar, berkas ekspor, maupun log; rekap dan refleksi bisa dibaca sampai akhir hanya dengan keyboard di laptop; dan 10 besar di layar kelas terbaca dengan ikon centang.
