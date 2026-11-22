# JS-13 — Statistik per kejadian lintas ruang dan isi dasbor

| | |
|---|---|
| Status | Selesai 22 November 2026 (`Diterima: JS-13`); disetujui 21 November 2026 (D-1, D-2, dan D-3 pilihan a); dibangun dan diuji 21 November 2026 ([laporan](../tests/JS-13-hasil.md)) |
| Rencana | `PLAN.md`, entri JS-13 (Plan 21 November 2026; disetujui dengan `Setuju: JS-13`, dibaca sebagai usulan 1a sampai 13a) |
| Sesi | Sesi A (mesin) |
| Bergantung pada | JS-11 dan JS-12 (keduanya Selesai); memakai juga JS-09 (`jawaban.petunjuk_dipakai`) |

## Ringkasan

JS-13 memberi guru dan admin statistik yang bisa langsung dipakai. Halaman baru **Statistik** (`#/statistik`) menampilkan setiap versi kejadian yang sudah dijawab di ruang biasa: jumlah dijawab, persentase Langkah 1 benar, sebaran pilihan Langkah 2, median waktu menjawab, indeks kesulitan dengan label Sulit, Sedang, atau Mudah, pilihan keliru terbanyak, dan pemakaian Petunjuk. Saringannya tanggal, label kelas, guru (admin), dan paket. Rincian setiap kejadian memuat grafik batang semua pilihan.

Dasbor kini berisi empat kartu: Peringatan (ditambah kejadian Siap tinjau untuk admin), Ruang yang sedang berjalan, Sesi terakhir, dan Ringkasan 30 hari terakhir. Ringkasan dasbor dibaca dari salinan ringkas hasil setiap ruang (JS-11), tanpa membaca baris jawaban.

Statistik dihitung langsung dari baris jawaban di D1 dengan kueri hemat. Ruang yang memenuhi saringan dipilih lebih dulu lewat indeks, lalu jawabannya dihitung dalam satu pernyataan. Tanpa migrasi, tanpa perubahan protokol, dan tanpa perubahan di layar pemain atau server ruang. Kueri riwayat JS-11 ikut dihemat tanpa mengubah jawabannya.

## Kaitan PRD

| Kebutuhan | Dipenuhi oleh |
|---|---|
| JFR-50 Statistik per kejadian lintas ruang dengan saringan: jumlah dijawab, persentase Langkah 1 benar, sebaran pilihan Langkah 2, median waktu menjawab, indeks kesulitan, dan pilihan keliru terbanyak | P-3 sampai P-23 |
| JFR-37 Dasbor: ruang yang sedang berjalan, sesi terakhir, ringkasan statistik, dan peringatan | P-24 sampai P-28 |
| JFR-44 Statistik dicatat per versi | P-10 |
| PRD 11.1 Melihat hasil dan statistik: admin semua ruang, guru ruang miliknya | P-1, P-3, P-12, P-25, P-26 |
| PRD 11.2 Definisi statistik; ruang uji tidak masuk statistik; statistik per versi | P-3 sampai P-10, P-26 |
| PRD 13 Data minimal; tanpa nama asli | Bagian "Keamanan dan privasi" |
| Architecture 10.1 (`#/statistik`), 10.2 (`GET /api/statistik/kejadian`), 10.7 (statistik) | P-2, P-11 sampai P-15 |
| Design System 3.7 dan 10 ("Konsol admin": tabel, grafik batang, label status, keadaan kosong) | P-16 sampai P-23, P-27 |
| Catatan Plan JS-13 dari Specify JS-11 (`peserta.dikeluarkan`, tanpa ruang uji, `ringkasan_json.hasil`) dan Specify JS-09 (`petunjuk_dipakai` sejak JS-09) | P-4, P-7, P-26 |
| `PLAN.md` usulan 1a sampai 13a | Seluruh dokumen |

## Berkas yang dibuat dan diubah

| Berkas | Baru/ubah | Isi |
|---|---|---|
| `app/jejak-setara/inti/statistik.ts` | Baru | Skema `zod` saringan dan jawaban API, `bacaSaringanStatistik`, penyusun murni `susunStatistik`, `medianDetik`, `kategoriKesulitan`, `urutStatistik`, dan konstanta (P-5 sampai P-14) |
| `app/jejak-setara/inti/akun.ts` | Ubah | `skemaDasbor`: `siapTinjau`, `sesi`, dan `ringkasan` (P-24) |
| `server/jejak-setara/src/api/statistik.ts` | Baru | Rute `GET /api/statistik/kejadian` (P-11 sampai P-15) |
| `server/jejak-setara/src/db/statistik.ts` | Baru | Kueri statistik, cakupan, pilihan paket, dan isi versi (P-12, P-13) |
| `server/jejak-setara/src/api/dasbor.ts` | Ubah | Isian dasbor baru (P-24 sampai P-26) |
| `server/jejak-setara/src/db/ruang.ts` | Ubah | `daftarRiwayat` memilih dan memotong ruang lebih dulu; kueri sesi terakhir dan ringkasan 30 hari (P-25, P-26, P-29) |
| `server/jejak-setara/src/db/akun.ts` | Ubah | Jumlah kejadian Siap tinjau (P-24) |
| `server/jejak-setara/src/auth/izin.ts` | Ubah | Aksi `statistik.lihat` (P-1) |
| `server/jejak-setara/src/index.ts` | Ubah | Rute statistik (P-1) |
| `app/jejak-setara/admin/halaman/Statistik.tsx` | Baru | Halaman Statistik (P-16 sampai P-23) |
| `app/jejak-setara/admin/halaman/Dasbor.tsx` | Ubah | Empat kartu dasbor (P-27, P-28) |
| `app/jejak-setara/admin/rute.ts`, `admin/App.tsx`, `admin/Kerangka.tsx`, `admin/api.ts` | Ubah | Rute dan menu, halaman, judul kepala, dan pemanggil API (P-2) |
| `app/jejak-setara/teks-konsol.ts` | Ubah | Teks bagian "Teks yang tampil (final)" |
| `app/jejak-setara/styles/kelas.css` | Ubah | Gaya halaman Statistik dan dasbor (hanya konsol) |
| Uji | Baru dan ubah | Bagian "Rencana uji" |
| `docs/jejak-setara/Architecture.md`, `Design_System.md`, `PRD.md`, `PLAN.md`, `tests/JS-13-hasil.md`, `tests/JS-13/` | Ubah dan baru | Architecture 3, 10.1, 10.2, dan 10.7; Design System 3.7 dan 10; PRD 11.2 dan 21; laporan uji dan tangkapan layar |

Tidak disentuh: layar pemain (`app/jejak-setara/pemain/`, `bersama/`, `teks.ts`, `styles/jejak.css`), protokol (`PROTOKOL_VERSI` tetap 2), server ruang (`src/ruang/`), migrasi D1, `package.json` dan lockfile (tanpa dependensi baru), alur kerja, `server/jejak-setara/wrangler.jsonc`, kode dan dokumen Sehari Setara, galeri, `deploy-pages.yml`, berkas Sesi B (`naskah/`, `inti/konten/`, `seed/`, `semai.mjs`), dan berkas Sesi C.

## Perilaku

### Izin, menu, dan rute (usulan 3a dan 8a)

- **P-1. Izin dan rute API.** `IZIN` mendapat `"statistik.lihat": ["admin", "guru"]`. `GET /api/statistik/kejadian` memanggil `jagaRute` dengan aksi itu, sehingga tanpa sesi dijawab 401 `PERLU_MASUK`, dan akun yang wajib ganti sandi 403 `WAJIB_GANTI_SANDI` (JS-04). Metode lain dijawab seperti rute lain dengan `metodeSalah`. Jalur statistik lain (`/api/statistik/kelas` dan `/api/statistik/siswa`, Architecture 10.2) belum ada sampai JS-20 dan dijawab seperti jalur API lain yang tidak dikenal.

- **P-2. Menu dan rute konsol.** `RUTE` mendapat `statistik`. Menu admin: Dasbor, Ruang, Kejadian, Rujukan, Paket, **Statistik**, Akun, dan Sandi saya. Menu guru: Dasbor, Ruang, Kejadian, Rujukan, **Statistik**, dan Sandi saya. `#/statistik` menampilkan halaman Statistik dengan judul kepala "Statistik". `#/statistik` dengan id apa pun menjadi dasbor, sesuai aturan rute yang tidak dikenal (JS-04 P-37). Butir menu aktif memakai pola yang sudah ada (`sun`, ▶, `aria-current="page"`).

### Ruang dan jawaban yang dihitung (usulan 3a)

- **P-3. Ruang.** Statistik hanya memakai ruang yang memenuhi semua syarat berikut:
  - `uji = 0` (ruang uji tidak masuk statistik, PRD 11.2);
  - status `selesai`, `pembahasan`, atau `ditutup`, sehingga ruang yang masih `lobi`, `hitung_mundur`, `main`, atau `jeda` belum dihitung;
  - ronde sempat dimainkan: `mulai_pada` dan `selesai_pada` terisi dan `mulai_pada` tidak sesudah `selesai_pada` (definisi `rondeDimainkan`, JS-11 P-17);
  - guru: hanya ruang miliknya (`pemilik_id`); admin: semua ruang, atau ruang satu guru bila saringan `guru` diisi;
  - memenuhi saringan P-11.

  Ruang yang datanya sudah dihapus admin (JS-11 P-33) tidak ada lagi di D1, jadi tidak ikut.

- **P-4. Jawaban.** Dari ruang P-3, yang dihitung hanya jawaban yang memenuhi semua syarat berikut:
  - Langkah 1-nya dikunci (`langkah1_opsi` terisi);
  - pemainnya tidak dikeluarkan (`peserta.dikeluarkan = 0`, JS-11 D-4);
  - versinya versi terbit (`kejadian_versi.jenis = 'terbit'`).

  Ruang biasa selalu memakai versi terbit (JS-10 P-3), jadi syarat terakhir hanya pengaman. Kejadian yang diarsipkan tetap dihitung ("Statistiknya tetap tersimpan", JS-12 P-15).

### Definisi (usulan 4a, 5a, 6a, dan 9a)

- **P-5. Angka per versi.** Untuk setiap versi kejadian yang punya jawaban P-4:

  | Isian | Arti |
  |---|---|
  | `dijawab` | Jumlah jawaban P-4 (Langkah 1 dikunci) |
  | `selesai` | Jumlah jawaban yang Langkah 2-nya juga dikunci (`langkah2_opsi` terisi) |
  | `benar1` | Jumlah jawaban yang pilihan Langkah 1-nya benar menurut isi versi itu |
  | `ketepatan1` | `benar1` ÷ `dijawab` dalam persen, satu angka di belakang koma (fungsi `persen` di `inti/hasil.ts`); penyebutnya sama dengan JS-11 P-21 |
  | `pilihan1` | Empat pilihan Langkah 1 menurut urutan asli (`1a` sampai `1d`), masing-masing id, teks, tanda benar, dan jumlah yang memilihnya (dari `dijawab`) |
  | `pilihan2` | Tiga pilihan Langkah 2 menurut urutan asli (`2a` sampai `2c`), masing-masing id, teks, tingkat, dan jumlah yang memilihnya (dari `selesai`) |
  | `tingkat` | Persentase tingkat tepat, kurang tepat, dan berisiko dari `selesai`, satu angka di belakang koma; `null` bila `selesai` 0 |
  | `penuh` | Jumlah jawaban berpoin penuh (100), yaitu Langkah 1 benar dan Langkah 2 tepat |
  | `indeksKesulitan` | `penuh` ÷ `selesai`, dibulatkan ke dua angka di belakang koma; `null` bila `selesai` 0. Makin kecil makin sulit |
  | `medianDetik` | P-6; `null` bila `selesai` 0 |
  | `keliruTerbanyak` | P-8 |
  | `petunjuk` | P-7 |

  Benar dan tingkat dibaca dari isi versi itu (`kejadian_versi.isi_json`) dengan id pilihan asli yang tersimpan di `jawaban`. Versi terbit tidak pernah berubah (JS-12 P-13), jadi hasilnya sama dengan kolom `langkah1_benar` dan `tingkat`.

- **P-6. Median waktu menjawab.** Waktu menjawab setiap jawaban yang selesai adalah `langkah2_pada − dibuka_pada` (dari dialog pertama dibuka sampai Langkah 2 dikunci, PRD 11.2), dibulatkan ke detik terdekat (setengah ke atas) di kueri dan tidak kurang dari 0. Kueri mengirim jumlah jawaban per detik, bukan semua waktu. `medianDetik` dihitung dari hitungan itu:
  - jumlah ganjil: nilai detik di tengah;
  - jumlah genap: rata-rata dua nilai detik di tengah, dibulatkan ke detik terdekat (setengah ke atas).

  Selisihnya dengan median tepat paling besar setengah detik (percobaan Plan: 0,49 detik), dan tampilan memakai detik bulat.

- **P-7. Petunjuk.** `petunjuk` adalah persentase jawaban P-4 yang memakai Petunjuk (`petunjuk_dipakai = 1`), dihitung hanya dari ruang yang Petunjuk-nya aktif (`skillAktif` di `pengaturan_json` memuat `petunjuk`), satu angka di belakang koma; `null` bila tidak ada jawaban dari ruang seperti itu. Ruang biasa yang dimainkan di basis data uji sebelum JS-09 terpasang tercatat tanpa Petunjuk (usulan 9a); tidak ada batas tanggal di kode.

- **P-8. Pilihan keliru terbanyak.** `keliruTerbanyak` adalah id pilihan Langkah 1 yang keliru dengan jumlah terbesar, asalkan jumlahnya lebih dari 0. Bila seri, yang dipilih yang lebih dulu menurut urutan asli. `null` bila tidak ada pilihan keliru yang dipilih. Persentase yang tampil di tabel adalah jumlah pilihan itu ÷ `dijawab`.

- **P-9. Kategori indeks kesulitan (usulan 5a).** Kategori dihitung dari `indeksKesulitan` yang sudah dibulatkan, agar label selalu cocok dengan angka yang tampil:

  | Indeks | Kategori | Latar tanda |
  |---|---|---|
  | di bawah 0,30 | Sulit | `coral` |
  | 0,30 sampai 0,70 | Sedang | `sun` |
  | di atas 0,70 | Mudah | `leaf` |

  Tanda bergaris `ink` 2 px dengan teks `ink`, dan kategori selalu tertulis, sehingga makna tidak hanya lewat warna.

- **P-10. Satu baris per versi (usulan 6a).** Setiap versi terbit dengan `dijawab` sedikitnya 1 menjadi satu baris, misalnya K-13 versi 2 dan K-13 versi 1, agar perbaikan soal tidak mencampur data lama dan baru (JFR-44). Teks judul, pertanyaan, dan pilihan diambil dari versi itu sendiri. Urutan dari server: nomor kode kejadian naik (angka sesudah `K-`), lalu nomor versi turun.

### API statistik (usulan 2a dan 7a)

- **P-11. Saringan.** `GET /api/statistik/kejadian` menerima parameter berikut, semuanya pilihan. `bacaSaringanStatistik` di `inti/statistik.ts` memeriksanya, dan parameter yang tidak sah dijawab 400 `ISI_SALAH`.

  | Parameter | Aturan |
  |---|---|
  | `dari`, `sampai` | Milidetik UTC berupa bilangan bulat 0 sampai 8.640.000.000.000.000 (`WAKTU_MAKS`); memilih ruang dengan `dibuat_pada` ≥ `dari` dan < `sampai`. Bila keduanya ada, `dari` < `sampai`. Tanpa `dari` berarti sejak awal, dan tanpa `sampai` berarti tanpa batas atas |
  | `label` | 1–20 karakter sesudah `normalkanLabel`; memilih label kelas yang memuat teks itu tanpa membedakan huruf besar dan kecil (huruf Latin), seperti riwayat JS-11 |
  | `guru` | Id pengguna pemilik ruang (huruf, angka, `_`, dan `-`, paling panjang 64); hanya berlaku untuk admin dan diabaikan untuk guru |
  | `paket` | Id paket berupa UUID; memilih ruang yang memakai paket itu |

  Server tidak menerapkan rentang bawaan; bawaan 30 hari diatur konsol (P-17).

- **P-12. Jawaban 200.**

  ```text
  { cakupan: { ruang, pemain, jawaban },
    kejadian: [ { kode, judul, zona, versi, pertanyaan1, pertanyaan2, dijawab, selesai, benar1, ketepatan1,
                  pilihan1: [ { id, teks, benar, n } ×4 ], pilihan2: [ { id, teks, tingkat, n } ×3 ],
                  tingkat: { tepat, kurang, berisiko }, penuh, indeksKesulitan, medianDetik, keliruTerbanyak, petunjuk } ],
    paket: [ { id, nama } ] }
  ```

  - `cakupan.ruang`: jumlah ruang P-3 yang memenuhi saringan, termasuk yang tidak punya jawaban. `cakupan.pemain`: jumlah peserta tidak dikeluarkan di ruang-ruang itu. `cakupan.jawaban`: jumlah `dijawab` semua baris.
  - `versi` adalah nomor versi terbit (1 ke atas). `zona` dan judul dari isi versi itu.
  - `paket`: paket yang dipakai ruang P-3 milik pengguna ini (guru: miliknya; admin: semua ruang), tanpa memakai saringan tanggal, label, guru, dan paket, agar pilihan tidak hilang saat saringan berubah. Paket nonaktif yang punya data ikut. Urutannya menurut abjad nama.
  - Skema `skemaStatistik` di `inti/statistik.ts` memeriksa jawaban ini di konsol.

- **P-13. Kueri hemat (usulan 2a).** `db/statistik.ts` menjalankan paling banyak empat pernyataan dalam dua perjalanan ke D1:
  1. Satu `batch` berisi tiga pernyataan.
     - **Statistik.** Ruang P-3 dipilih lebih dulu dalam satu CTE yang dimaterialisasi, dengan batas tanggal selalu tertulis (`0` dan `WAKTU_MAKS` bila saringan kosong). Ada dua bentuk: tanpa guru (indeks `ruang_dibuat`) dan dengan guru (indeks `ruang_pemilik`, dipakai guru dan admin yang menyaring guru). Tanda Petunjuk aktif dihitung sekali per ruang lewat `json_each`. CTE kedua berisi id peserta yang dikeluarkan di ruang-ruang itu. Jawaban dibaca lewat indeks `jawaban_ruang` dengan `CROSS JOIN`, agar urutan penelusuran tetap. Hasilnya `UNION ALL` dari dua kelompok: jumlah per versi, per pilihan Langkah 1, dan per pilihan Langkah 2 (beserta jumlah dari ruang dengan Petunjuk aktif dan yang memakai Petunjuk); serta jumlah per versi dan per detik waktu menjawab.
     - **Cakupan.** Jumlah ruang P-3 dan jumlah peserta tidak dikeluarkan di ruang itu.
     - **Pilihan paket.** Paket ruang P-3 milik pengguna tanpa saringan tanggal, label, guru, dan paket (P-12).
  2. **Isi versi.** `SELECT` id, kode, nomor, dan isi versi terbit yang id-nya muncul di hasil statistik, dengan daftar id sebagai satu parameter JSON (`json_each(?1)`), karena D1 membatasi jumlah parameter.

  Tidak ada kueri lain. `EXPLAIN QUERY PLAN` kedua bentuk kueri statistik memuat `SEARCH r USING INDEX ruang_dibuat` atau `SEARCH r USING INDEX ruang_pemilik` dan `SEARCH j USING INDEX jawaban_ruang`, dan tidak memuat penelusuran penuh tabel `jawaban` (diperiksa di Specify dengan migrasi repositori).

- **P-14. Penyusun murni.** `susunStatistik` di `inti/statistik.ts` menyusun daftar `kejadian` dari baris agregat, hitungan per detik, dan isi versi, termasuk P-5 sampai P-10. Fungsi ini tidak memakai jam, acak, atau API Workers, sehingga diuji di Node dengan data yang diketahui. Baris dari versi yang isinya tidak ditemukan atau bukan versi terbit dilewati.

- **P-15. Ukuran jawaban.** Tidak ada batas jumlah versi. Jawaban untuk 18 versi sekitar 23 KB JSON (percobaan Plan). Jawaban memakai tajuk API yang sudah ada (`Cache-Control: no-store` dan lainnya, Architecture 12.2).

### Halaman Statistik (usulan 7a, 8a, dan 9a)

- **P-16. Susunan halaman.** Dari atas:
  1. Kalimat pengantar.
  2. Formulir saringan dalam satu baris yang membungkus (pola `js-riwayat-ruang-saring` JS-11):
     - "Dari tanggal" dengan petunjuk P-17;
     - "Sampai tanggal";
     - "Label kelas" (paling banyak 20 karakter, dengan petunjuk);
     - "Guru" (admin saja: "Semua guru", lalu nama akun dari `GET /api/akun` menurut abjad);
     - "Paket" ("Semua paket", lalu `paket` dari jawaban terakhir);
     - tombol "Terapkan" dan "Atur ulang".
  3. Judul bagian "Statistik per kejadian" (`h2`).
  4. Baris cakupan dan pilihan "Urutkan" (P-18).
  5. Legenda Langkah 2 (hanya di layar 1280 px ke atas, saat kolom Langkah 2 tampil).
  6. Tabel (P-19) dengan rincian per baris (P-20).

  Bila "Sampai tanggal" sebelum "Dari tanggal", galat "Tanggal akhir tidak boleh sebelum tanggal awal." tampil di bawah isian tanpa memanggil API, seperti riwayat JS-11. Tanggal dibaca menurut zona waktu peramban: "Dari tanggal" menjadi pukul 00.00 hari itu, dan "Sampai tanggal" menjadi pukul 00.00 hari berikutnya (`tanggalKeMs`, JS-11).

- **P-17. Bawaan dan semua waktu (DRAF D-2).** Saat halaman pertama dibuka dalam satu sesi konsol:
  - "Dari tanggal" terisi tanggal 29 hari sebelum hari ini menurut zona waktu peramban, sehingga mencakup 30 hari termasuk hari ini;
  - "Sampai tanggal", label, guru, dan paket kosong;
  - urutan "Kode kejadian".

  Petunjuk di bawah "Dari tanggal" berbunyi "Bawaan: 30 hari terakhir. Kosongkan untuk semua waktu." Mengosongkan "Dari tanggal" lalu menekan Terapkan menampilkan semua waktu. "Atur ulang" mengembalikan bawaan di atas dan memuat ulang. Saringan dan urutan yang diterapkan disimpan di memori halaman selama sesi konsol (seperti riwayat JS-11), sehingga kembali ke halaman ini tidak mengulang bawaan.

- **P-18. Cakupan dan urutan.** Sesudah data dimuat, baris "Dari {ruang} ruang, {pemain} pemain, dan {jawaban} jawaban." (angka dengan pemisah ribuan titik) tampil sebagai `role="status"`. "Urutkan" berisi empat pilihan yang diterapkan di peramban tanpa memanggil API:

  | Pilihan | Urutan | Bila seri |
  |---|---|---|
  | Kode kejadian (bawaan) | Nomor kode naik, lalu versi turun | — |
  | Paling sulit dulu | `indeksKesulitan` naik; `null` paling akhir | Urutan kode |
  | Langkah 1 benar terendah | `ketepatan1` naik | Urutan kode |
  | Paling banyak dijawab | `dijawab` turun | Urutan kode |

  Mengganti urutan tidak menutup rincian yang terbuka.

- **P-19. Tabel.** Huruf sistem 14 px (KT-05), kepala `mist`, baris berselang `white` dan `cream`, dan jarak sel 6 px. Kolom menurut lebar layar:

  | Kolom | Isi | 1280 px ke atas | 1024–1279 px | Kartu di bawah 1024 px |
  |---|---|---|---|---|
  | Kejadian | Kode (Press Start 2P 11 px), tanda versi "v{n}", tanda "Data sedikit" bila `selesai` kurang dari 10, lalu judul di baris kedua | Ya | Ya | Kepala kartu |
  | Dijawab | Angka dengan pemisah ribuan, rata kanan | Ya | Ya | Ya |
  | Langkah 1 benar | "41,1%", rata kanan | Ya | Ya | Ya |
  | Langkah 2 | Batang bertumpuk tiga tingkat (`leaf`, `mango`, `coral`, garis `ink` 2 px, tinggi 12 px), angka bulat "52 · 29 · 19" di bawahnya, dan teks pembaca layar lengkap | Ya | Tidak | Tidak |
  | Indeks kesulitan | "0,29" dengan tanda kategori P-9 di bawahnya | Ya | Ya | Ya |
  | Median | "66 dtk", rata kanan | Ya | Ya | Ya |
  | Keliru terbanyak | "A · 36,2%" (huruf menurut urutan asli) | Ya | Tidak | Tidak |
  | Petunjuk | "25,0%", rata kanan | Ya | Tidak | Tidak |
  | (tanpa judul tampak) | Tombol Rincian | Ya | Ya | Ya |

  Isi kolom yang disembunyikan tetap ada di rincian. Nilai tanpa penyebut ditulis "–". Wadah tabel memakai `position: relative`, agar teks pembaca layar tidak meluapkan halaman (temuan maket Plan). Di 1280 × 720 dan 1024 × 768 tabel muat tanpa digulir menyamping. Di bawah 1024 px, setiap baris menjadi kartu dengan label di kiri setiap angka (pola riwayat JS-11).

- **P-20. Rincian.** Tombol "Rincian" punya label pembaca layar "Rincian {kode} versi {versi}", `aria-expanded`, dan `aria-controls`, lalu berubah menjadi "Tutup rincian" (label "Tutup rincian {kode} versi {versi}"). Hanya satu rincian terbuka pada satu waktu; membuka rincian lain menutup yang sebelumnya. Rincian tampil di baris tepat di bawah barisnya dan berisi:
  1. **Grafik Langkah 1**, dengan judul `h3` "Langkah 1: {pertanyaan}". Empat pilihan menurut urutan asli, masing-masing "{huruf}. {teks}", batang 12 px bergaris `ink` 2 px, dan "{n} ({p}%)" dengan persen dari `dijawab`. Pilihan yang benar berbatang `leaf` dengan tanda `leaf` berikon `ikon_centang` dan tulisan "Jawaban tepat"; pilihan lain berbatang `sky-d`. Pilihan keliru terbanyak mendapat tanda `mist` "Keliru terbanyak".
  2. **Grafik Langkah 2**, dengan judul `h3` "Langkah 2: {pertanyaan}". Tiga pilihan menurut urutan asli dengan tanda tingkat berikon emosi dan bertulisan (seperti hasil JS-11), batang berwarna tingkat, dan "{n} ({p}%)" dengan persen dari `selesai`. Bila `selesai` 0, grafik ini diganti kalimat "Belum ada Langkah 2 yang dikunci."
  3. Baris angka "Dijawab {dijawab} · selesai {selesai} · median {median} · indeks kesulitan {indeks}", ditambah " · {n}% memakai Petunjuk" berikon `ikon_petunjuk` bila `petunjuk` tidak `null`.
  4. Catatan "Huruf mengikuti urutan asli di bank kejadian. Di ronde, urutan pilihan diacak untuk setiap pemain."
  5. Tautan "Buka di bank kejadian" ke `#/kejadian/{kode}`, setinggi sedikitnya 48 px.

  Kedua grafik berdampingan di layar 1280 px ke atas dan bersusun di layar yang lebih sempit. Di bawah 1024 px, batang pindah ke baris sendiri di bawah teks pilihan, dan teks panjang dibungkus, sehingga rincian tidak meluap.

- **P-21. Keadaan.** Selama memuat: "Memuat statistik…" (`role="status"`). Gagal: "Statistik gagal dimuat." dengan tombol "Coba lagi". Tanpa baris kejadian: "Belum ada jawaban yang cocok dengan saringan.", tanpa baris cakupan dan tabel. Galat sesi diteruskan ke `galatSesi` (JS-04 P-48). Menerapkan saringan menutup rincian yang terbuka dan menampilkan "Memuat statistik…" sampai data baru tiba.

- **P-22. Aksesibilitas.**
  - Struktur judul: judul halaman di kepala, `h2` "Statistik per kejadian", dan `h3` di rincian.
  - Tabel memakai `th scope="col"`, dan kolom tombol punya judul pembaca layar "Rincian".
  - Semua kendali adalah elemen bawaan (tautan, tombol, isian, dan pilihan), dengan fokus terlihat, sehingga halaman bisa dipakai hanya dengan papan ketik.
  - Batang hanya hiasan (`aria-hidden`); angka dan tulisannya selalu ada.
  - Tingkat dan kategori selalu bertulisan.
  - Semua tombol, tautan, dan isian setinggi sedikitnya 48 px.
  - Tanpa animasi.

- **P-23. Teks.** Semua teks halaman berasal dari kelompok `statistik` di `TEKS_KONSOL`, ditambah `bank.tingkatTepat`, `bank.tingkatKurang`, dan `bank.tingkatBerisiko` yang sudah ada. Angka memakai `Intl.NumberFormat("id-ID")`: pemisah ribuan titik dan koma desimal.

### Dasbor (usulan 10a dan 11a)

- **P-24. API dasbor.** `GET /api/dasbor` tetap menjawab `rujukanBelum`, `ruang`, dan `jumlahRuang` (JS-04, JS-10), ditambah:
  - `siapTinjau`: untuk admin, jumlah kejadian berstatus `tinjau`; untuk guru, `null`.
  - `sesi`: P-25.
  - `ringkasan`: P-26.

  Tidak ada kueri dasbor yang membaca tabel `jawaban`.

- **P-25. Sesi terakhir (DRAF D-1 dan D-3).** Paling banyak lima ruang berstatus `ditutup` yang rondenya dimainkan (P-3), milik guru itu atau semua ruang untuk admin, terbaru lebih dulu (`dibuat_pada`, lalu `id`, menurun). Setiap butir berisi `{ id, kode, labelKelas, uji, namaGuru, dibuatPada, jumlahPemain, rataSkor }`. `jumlahPemain` dan `rataSkor` dihitung dari peserta yang tidak dikeluarkan, seperti riwayat JS-11, dan `rataSkor` `null` bila tidak ada peserta. Ruang uji ikut, dengan `uji` benar. Kueri memilih dan memotong lima ruang lebih dulu, lalu menghitung pemain hanya untuk kelimanya (P-29).

- **P-26. Ringkasan 30 hari.** Dari ruang bukan uji yang rondenya dimainkan dan sudah berakhir (status `selesai`, `pembahasan`, atau `ditutup`), milik guru itu atau semua ruang untuk admin, dengan `dibuat_pada` ≥ waktu server dikurangi 30 × 86.400.000 ms, dan yang `ringkasan_json`-nya memuat kunci `hasil` (JS-11 P-14). Ruang yang ditutup sebelum JS-11 tidak punya kunci itu dan tidak dihitung. Jumlah dibaca dengan `json_extract` di D1:

  ```text
  ringkasan: { hari: 30, sesi, pemain, rataSkor, ketepatan1, tingkat: { tepat, kurang, berisiko } }
  ```

  `sesi` adalah jumlah ruang. `pemain` adalah jumlah `jumlahPemain`. `rataSkor` adalah jumlah `jumlahSkor` ÷ `pemain` dengan satu angka di belakang koma (`rataRata`). `ketepatan1` adalah jumlah `langkah1Benar` ÷ jumlah `langkah1Dijawab` dalam persen. `tingkat` adalah persen setiap tingkat dari jumlah ketiganya. Nilai tanpa penyebut bernilai `null`, dan `sesi` 0 menghasilkan semua angka 0 atau `null`.

- **P-27. Kartu dasbor.** Salam tetap di atas, lalu empat kartu bingkai piksel dalam kisi dua kolom (satu kolom di bawah 1024 px), dengan urutan berikut.
  - **Peringatan.** Setiap peringatan adalah tautan setinggi sedikitnya 48 px dengan `ikon_peringatan` 32 px dan garis kiri `mango`:
    - jumlah rujukan belum diverifikasi, dengan kalimat JS-04 yang sudah ada, menautkan ke `#/rujukan`. JS-12 P-3 menulis tautan ini, tetapi kode dasbor belum memuatnya (diperiksa di Specify JS-13);
    - untuk admin saja, "{n} kejadian Siap tinjau menunggu diterbitkan." menautkan ke `#/kejadian`.

    Angka memakai Press Start 2P. Tanpa peringatan: "Tidak ada peringatan."
  - **Ruang yang sedang berjalan.** Tidak berubah (JS-10 P-11, JS-09 P-48).
  - **Sesi terakhir.** Daftar tautan setinggi sedikitnya 48 px ke `#/ruang/{id}`:
    - untuk guru: "{tanggal} · {kelas} · {n} pemain · rata-rata {rata}";
    - untuk admin, dengan nama guru: "{tanggal} · {kelas} · {guru} · {n} pemain · rata-rata {rata}".

    Tanggal berbentuk "20 Nov 2026" menurut zona waktu peramban, dan rata-rata memakai satu angka di belakang koma atau "–". Ruang uji diberi tanda `mist` "Uji" sesudah tautannya. Butir terakhir adalah tautan "Lihat riwayat ruang" ke `#/ruang/riwayat`. Kosong: "Belum ada sesi kelas."
  - **Ringkasan 30 hari terakhir.** Daftar istilah dua kolom: Sesi kelas, Pemain, Rata-rata skor, dan Ketepatan Langkah 1, dengan angka Press Start 2P 16 px. Di bawahnya:
    - "Langkah 2" dengan batang bertumpuk tiga tingkat dan kalimat "Tepat {a}% · Kurang tepat {b}% · Berisiko {c}%" (batang hiasan, kalimat selalu ada);
    - catatan "Ruang uji tidak dihitung.";
    - tautan "Lihat statistik per kejadian" ke `#/statistik`.

    Bila `sesi` 0: "Belum ada sesi kelas dalam 30 hari terakhir."

- **P-28. Keadaan dasbor.** Memuat, gagal, dan "Coba lagi" tetap seperti JS-04 untuk seluruh dasbor, karena semua isinya dari satu permintaan. Tidak ada animasi.

### Kueri riwayat (usulan 11a)

- **P-29. Pilih dan potong lebih dulu.** `daftarRiwayat` (JS-11 P-17) dan kueri sesi terakhir (P-25) memilih ruang yang cocok dalam satu CTE dengan `ORDER BY` dan `LIMIT`, lalu menghitung jumlah pemain dan rata-rata skor hanya untuk ruang yang terpilih. Batas tanggal riwayat ditulis tetap (`0` dan `WAKTU_MAKS` bila kosong), agar indeks `ruang_dibuat` terpakai. Isi, urutan, penanda halaman, dan galat API riwayat tidak berubah, dan semua uji JS-11 tetap berlaku.

### Ukuran dan kinerja (usulan 12a)

- **P-30. Anggaran.**
  - Kode layar pemain tidak naik: ukuran gzip JS dan CSS yang dimuat `/` sama dengan build `main` sebelum Build.
  - Kode konsol naik paling banyak 6 KB gzip (prototipe Plan: +3,98 KB) dan tetap di bawah 350 KB.
  - Kode konsol baru tidak mengimpor `assets/manifest.ts`, `bersama/`, `permainan/`, atau `TEKS` selain `isiTeks`.
  - Satu permintaan statistik dengan saringan bawaan pada data tiruan 300 ruang (144 ribu jawaban, data percobaan Plan) paling lama 100 ms waktu D1 lokal (`meta.duration`) dan paling banyak 100 ribu baris dibaca (`meta.rows_read`), dihitung untuk semua pernyataan P-13 bersama.
  - Pengukuran semua waktu dan data 1.200 ruang dicatat di laporan tanpa ambang.

- **P-31. Kuota selama paket gratis.** Dasbor membaca paling banyak ruang 30 hari terakhir, lima kali peserta satu ruang, ditambah hitungan kejadian dan rujukan, tanpa `jawaban`. Statistik hanya dimuat saat halaman Statistik dibuka atau saringan diterapkan, tidak berkala.

## Beberapa pengguna sekaligus

- Diberikan admin dan guru membuka Statistik bersamaan, maka guru hanya melihat angka dari ruang miliknya, dan admin dari semua ruang (atau satu guru bila saringan Guru diisi).
- Diberikan sebuah ruang sedang `main`, ketika guru membuka Statistik, maka ruang itu belum dihitung; begitu rondenya berakhir, membuka atau menerapkan ulang saringan menampilkannya.
- Diberikan kiriman ruang ke D1 masih tertunda (JS-11 P-15), maka statistik dan ringkasan dasbor memakai data yang sudah sampai di D1, dan angkanya bertambah sesudah kiriman masuk.
- Diberikan admin menghapus data satu ruang, ketika guru menerapkan saringan lagi, maka ruang itu tidak lagi dihitung, dan sesi terakhir dasbor tidak lagi memuatnya.
- Diberikan admin menerbitkan versi 2 sebuah kejadian, ketika ruang lama memakai versi 1 dan ruang baru memakai versi 2, maka keduanya tampil sebagai dua baris dengan teks versinya masing-masing.
- Diberikan dua guru memakai label kelas yang sama, ketika salah satunya menyaring label itu, maka ia hanya melihat ruangnya sendiri; admin melihat gabungan keduanya.
- Diberikan guru mengeluarkan pemain sesudah ronde berakhir, maka jawaban pemain itu tidak dihitung di statistik maupun ringkasan dasbor.

## Status antarmuka

| Tempat | Status | Tampilan |
|---|---|---|
| Halaman Statistik | Memuat | "Memuat statistik…" |
| Halaman Statistik | Gagal | "Statistik gagal dimuat." dengan "Coba lagi" |
| Halaman Statistik | Kosong | "Belum ada jawaban yang cocok dengan saringan." |
| Saringan | Galat tanggal | Pesan di bawah "Sampai tanggal"; API tidak dipanggil |
| Saringan | Bawaan | "Dari tanggal" berisi tanggal 29 hari lalu dan petunjuk P-17 (D-2) |
| Tabel | Biasa | Kolom P-19 menurut lebar layar |
| Baris | Data sedikit | Tanda `mist` "Data sedikit" di kolom Kejadian |
| Baris | Rincian tertutup / terbuka | "Rincian" / "Tutup rincian" dan baris rincian P-20 |
| Rincian | Belum ada Langkah 2 | "Belum ada Langkah 2 yang dikunci." |
| Nilai | Tanpa penyebut | "–" |
| Tombol dan tautan | Fokus | Garis fokus konsol yang sudah ada |
| Dasbor | Memuat / gagal | Seperti JS-04 |
| Kartu Peringatan | Tanpa peringatan | "Tidak ada peringatan." |
| Kartu Sesi terakhir | Kosong | "Belum ada sesi kelas." |
| Kartu Ringkasan | Kosong | "Belum ada sesi kelas dalam 30 hari terakhir." |

## Teks yang tampil (final)

Teks dengan `{…}` diisi lewat `isiTeks()`. Teks yang sudah ada dan dipakai ulang tanpa perubahan tidak dicantumkan: `dasbor.judul`, `dasbor.salam`, `dasbor.peringatan`, `dasbor.rujukanBelum`, `dasbor.tanpaPeringatan`, `dasbor.ruang`, `dasbor.ruangKosong`, `dasbor.ruangItem`, `dasbor.ruangSemua`, `dasbor.sesi`, `dasbor.sesiKosong`, `dasbor.memuat`, `dasbor.gagal`, `dasbor.cobaLagi`, `bank.tingkatTepat`, `bank.tingkatKurang`, `bank.tingkatBerisiko`, `status.*`, dan `menu.label` serta butir menu lain.

**Konsol** (`TEKS_KONSOL`, `app/jejak-setara/teks-konsol.ts`)

| Kunci | Teks |
|---|---|
| `menu.statistik` | Statistik |
| `statistik.judul` | Statistik |
| `statistik.pengantar` | Statistik setiap kejadian dari ruang yang rondenya sudah berakhir. Ruang uji dan pemain yang dikeluarkan tidak dihitung. |
| `statistik.dari` | Dari tanggal |
| `statistik.dariPetunjuk` | Bawaan: 30 hari terakhir. Kosongkan untuk semua waktu. |
| `statistik.sampai` | Sampai tanggal |
| `statistik.galatTanggal` | Tanggal akhir tidak boleh sebelum tanggal awal. |
| `statistik.label` | Label kelas |
| `statistik.labelPetunjuk` | Cukup sebagian, misalnya IX. |
| `statistik.guru` | Guru |
| `statistik.semuaGuru` | Semua guru |
| `statistik.paket` | Paket |
| `statistik.semuaPaket` | Semua paket |
| `statistik.terapkan` | Terapkan |
| `statistik.aturUlang` | Atur ulang |
| `statistik.bagian` | Statistik per kejadian |
| `statistik.cakupan` | Dari {ruang} ruang, {pemain} pemain, dan {jawaban} jawaban. |
| `statistik.urutkan` | Urutkan |
| `statistik.urutKode` | Kode kejadian |
| `statistik.urutSulit` | Paling sulit dulu |
| `statistik.urutKetepatan` | Langkah 1 benar terendah |
| `statistik.urutDijawab` | Paling banyak dijawab |
| `statistik.legenda` | Langkah 2: |
| `statistik.kolomKejadian` | Kejadian |
| `statistik.kolomDijawab` | Dijawab |
| `statistik.kolomKetepatan` | Langkah 1 benar |
| `statistik.kolomLangkah2` | Langkah 2 |
| `statistik.kolomIndeks` | Indeks kesulitan |
| `statistik.kolomMedian` | Median |
| `statistik.kolomKeliru` | Keliru terbanyak |
| `statistik.kolomPetunjuk` | Petunjuk |
| `statistik.kolomRincian` | Rincian |
| `statistik.versi` | v{n} |
| `statistik.sedikit` | Data sedikit |
| `statistik.persen` | {n}% |
| `statistik.detik` | {n} dtk |
| `statistik.keliru` | {huruf} · {n}% |
| `statistik.tingkatRingkas` | {a} · {b} · {c} |
| `statistik.tingkatPembaca` | Tepat {a}%, kurang tepat {b}%, berisiko {c}%. |
| `statistik.sulit` | Sulit |
| `statistik.sedang` | Sedang |
| `statistik.mudah` | Mudah |
| `statistik.rincian` | Rincian |
| `statistik.tutupRincian` | Tutup rincian |
| `statistik.rincianLabel` | Rincian {kode} versi {versi} |
| `statistik.tutupRincianLabel` | Tutup rincian {kode} versi {versi} |
| `statistik.langkah1` | Langkah 1: {pertanyaan} |
| `statistik.langkah2` | Langkah 2: {pertanyaan} |
| `statistik.pilihan` | {huruf}. {teks} |
| `statistik.jumlah` | {n} ({p}%) |
| `statistik.jawabanTepat` | Jawaban tepat |
| `statistik.keliruTerbanyak` | Keliru terbanyak |
| `statistik.belumLangkah2` | Belum ada Langkah 2 yang dikunci. |
| `statistik.fakta` | Dijawab {dijawab} · selesai {selesai} · median {median} · indeks kesulitan {indeks} |
| `statistik.faktaDetik` | {n} detik |
| `statistik.faktaPetunjuk` | {n}% memakai Petunjuk |
| `statistik.huruf` | Huruf mengikuti urutan asli di bank kejadian. Di ronde, urutan pilihan diacak untuk setiap pemain. |
| `statistik.keBank` | Buka di bank kejadian |
| `statistik.memuat` | Memuat statistik… |
| `statistik.gagal` | Statistik gagal dimuat. |
| `statistik.cobaLagi` | Coba lagi |
| `statistik.kosong` | Belum ada jawaban yang cocok dengan saringan. |
| `statistik.kosongNilai` | – |
| `dasbor.siapTinjau` | {n} kejadian Siap tinjau menunggu diterbitkan. |
| `dasbor.sesiItem` | {tanggal} · {kelas} · {n} pemain · rata-rata {rata} |
| `dasbor.sesiItemGuru` | {tanggal} · {kelas} · {guru} · {n} pemain · rata-rata {rata} |
| `dasbor.sesiUji` | Uji |
| `dasbor.sesiSemua` | Lihat riwayat ruang |
| `dasbor.ringkasan` | Ringkasan 30 hari terakhir |
| `dasbor.ringkasanKosong` | Belum ada sesi kelas dalam 30 hari terakhir. |
| `dasbor.ringkasanSesi` | Sesi kelas |
| `dasbor.ringkasanPemain` | Pemain |
| `dasbor.ringkasanRata` | Rata-rata skor |
| `dasbor.ringkasanKetepatan` | Ketepatan Langkah 1 |
| `dasbor.ringkasanLangkah2` | Langkah 2 |
| `dasbor.ringkasanTingkat` | Tepat {a}% · Kurang tepat {b}% · Berisiko {c}% |
| `dasbor.ringkasanCatatan` | Ruang uji tidak dihitung. |
| `dasbor.keStatistik` | Lihat statistik per kejadian |
| `dasbor.kosongNilai` | – |

`dasbor.sesiItemGuru` hanya dipakai bila D-3 (a) dipilih. Bila D-2 (b) dipilih, `statistik.dariPetunjuk` diganti teks pilihan rentang di D-2.

## Data, protokol, API, dan migrasi

**Migrasi D1:** tidak ada. Kolom yang dipakai sudah ada: `jawaban` (id pilihan asli, `petunjuk_dipakai`, waktu), `peserta.dikeluarkan` (0002), `ruang.uji`, `ruang.pengaturan_json`, dan `ruang.ringkasan_json`. Indeks yang dipakai: `ruang_dibuat`, `ruang_pemilik`, `jawaban_ruang`, dan `peserta_ruang`.

**Rute API baru dan berubah:**

| Rute | Izin | Jawaban berhasil | Galat |
|---|---|---|---|
| `GET /api/statistik/kejadian` | `statistik.lihat` (admin, guru) | 200 (P-12) | 400 `ISI_SALAH`, 401 `PERLU_MASUK`, 403 `WAJIB_GANTI_SANDI` |
| `GET /api/dasbor` (berubah) | `dasbor.lihat` | 200 dengan `siapTinjau`, `sesi`, dan `ringkasan` (P-24 sampai P-26) | Seperti sebelumnya |
| `GET /api/ruang/riwayat` (kueri berubah) | `ruang.kelola` | Tidak berubah (P-29) | Tidak berubah |

**Skema baru** di `inti/statistik.ts`: `skemaStatistik` (P-12) dan tipe `SaringanStatistik`. `skemaDasbor` di `inti/akun.ts` mendapat:

```text
siapTinjau: number | null                     (bawaan null)
sesi: [ { id, kode, labelKelas, uji, namaGuru, dibuatPada, jumlahPemain, rataSkor } ]   (bawaan [])
ringkasan: { hari, sesi, pemain, rataSkor, ketepatan1, tingkat: { tepat, kurang, berisiko } } | null   (bawaan null)
```

Bawaan itu membuat konsol tetap membaca jawaban dasbor lama dengan benar selama Worker belum diperbarui.

**Protokol real-time:** tidak berubah (`PROTOKOL_VERSI` tetap 2). **Durable Object:** tidak berubah.

## Aset

Tidak ada aset gambar, suara, atau token CSS baru. Yang dipakai, semuanya Disetujui dan diimpor konsol langsung dari berkas PNG (tanpa `manifest.ts`, JS-10 P-35): `ikon_centang` (Jawaban tepat), `ikon_emosi_hati`, `ikon_emosi_keringat`, dan `ikon_emosi_seru` (tingkat Langkah 2, seperti hasil JS-11), `ikon_petunjuk` (JS-09), dan `ikon_peringatan` (peringatan dasbor).

## Keamanan dan privasi

- Statistik hanya berisi hitungan pilihan dan waktu per versi kejadian, tanpa nama samaran, nomor absen, atau nama asli. Jawaban per siswa tetap hanya ada di hasil per ruang (JS-11).
- Guru hanya melihat ruang miliknya; parameter `guru` diabaikan untuk guru, dan kepemilikan diperiksa di kueri server, bukan di konsol.
- Ruang uji dan pemain yang dikeluarkan tidak dihitung.
- Permintaan hanya membaca data, tanpa perubahan, sehingga tidak perlu tajuk CSRF. Jawaban memakai tajuk keamanan API yang sudah ada.
- Tidak ada penyimpanan baru di peramban; saringan hanya di memori halaman.

## Di luar cakupan

- Statistik per label kelas, per topik, dan tren antarsesi (JFR-51), statistik per siswa (JFR-52), dan cetak ringkasan statistik (JFR-54): JS-20.
- Ekspor CSV statistik.
- Ruang uji di statistik (tetap dikecualikan; JFR-47 dan ruang uji khusus: JS-19), dan masa simpan data (JFR-40, JS-19).
- Tabel ringkasan per ruang (usulan 2b) dan tembolok hasil statistik.
- Statistik di layar kelas dan di HP pemain.
- Rute `/api/statistik/kelas` dan `/api/statistik/siswa` (JS-20).

## DRAF untuk ditinjau pemilik proyek

Keputusan 21 November 2026 (`Spesifikasi disetujui: JS-13`): D-1 (a), D-2 (a), dan D-3 (a).

- **D-1. Ruang yang tidak dimainkan di kartu "Sesi terakhir".**
  - (a, saran) Dilewati. Kartu itu tentang sesi kelas, sedangkan ruang yang ditutup dari lobi atau saat hitung mundur tidak punya hasil. Riwayat ruang (JS-11) tetap menampilkannya dengan "Tidak dimainkan".
  - (b) Ditampilkan dengan teks "{tanggal} · {kelas} · tidak dimainkan", seperti riwayat.

- **D-2. Rentang bawaan dan cara memilih semua waktu.**
  - (a, saran) "Dari tanggal" langsung terisi tanggal 29 hari sebelum hari ini, dengan petunjuk "Bawaan: 30 hari terakhir. Kosongkan untuk semua waktu." Guru melihat tanggal yang sebenarnya dipakai, dan semua waktu cukup dengan mengosongkan satu isian (P-17).
  - (b) Pilihan "Rentang" di depan tanggal: 30 hari terakhir (bawaan), 90 hari terakhir, 12 bulan terakhir, semua waktu, dan pilih tanggal. Lebih cepat dipilih, tetapi menambah satu kendali dan teksnya.

- **D-3. Nama guru di kartu "Sesi terakhir" untuk admin.**
  - (a, saran) Ya: admin melihat sesi semua guru, jadi nama guru membedakan kelas yang berlabel sama (`dasbor.sesiItemGuru`). Guru tidak melihat nama, karena semua sesinya miliknya sendiri.
  - (b) Tidak, sama untuk semua peran.

## Kriteria penerimaan

- [x] AC-1 **Izin dan rute.** P-1 dan P-2: aksi `statistik.lihat` di `IZIN`; 401 tanpa sesi dan 403 untuk akun wajib ganti sandi; metode lain ditolak; menu admin dan guru sesuai urutan; `#/statistik` dikenali, dan bentuk lain menjadi dasbor.
- [x] AC-2 **Ruang dan jawaban yang dihitung.** P-3 dan P-4 dengan data uji yang memuat ruang uji, ruang yang tidak dimainkan, ruang yang masih `main`, ruang `selesai`, `pembahasan`, dan `ditutup`, pemain yang dikeluarkan, jawaban tanpa Langkah 1, dan kejadian yang diarsipkan: hanya yang memenuhi syarat dihitung.
- [x] AC-3 **Definisi.** P-5 sampai P-9 dengan data yang diketahui: setiap isian per versi; median untuk jumlah ganjil, genap, dan seri; pilihan keliru seri; Petunjuk hanya dari ruang dengan Petunjuk aktif dan `null` tanpa ruang seperti itu; kategori di 0,29, 0,30, 0,70, dan 0,71.
- [x] AC-4 **Per versi.** P-10: kejadian dengan dua versi menghasilkan dua baris dengan teks versinya masing-masing, dalam urutan kode lalu versi turun.
- [x] AC-5 **Cocok dengan hasil per ruang.** Untuk satu ruang yang dimainkan di Worker lokal, jumlah dijawab, benar, dan setiap tingkat per versi sama dengan hasil per ruang dan CSV jawaban JS-11.
- [x] AC-6 **Kueri hemat.** P-13: paling banyak empat pernyataan dalam dua perjalanan; `EXPLAIN QUERY PLAN` kedua bentuk kueri memakai `ruang_dibuat` atau `ruang_pemilik` dan `jawaban_ruang` tanpa penelusuran penuh `jawaban` (uji unit dengan migrasi repositori); median dihitung dari hitungan per detik.
- [x] AC-7 **Saringan dan jawaban API.** P-11 dan P-12: batas tanggal (bawah ikut, atas tidak), label sebagian tanpa membedakan huruf, guru (admin saja), paket, parameter tidak sah 400, `cakupan`, pilihan `paket` yang tidak bergantung saringan, dan jawaban lolos `skemaStatistik`.
- [x] AC-8 **Halaman Statistik.** P-16 sampai P-21: susunan halaman, bawaan sesuai D-2, galat tanggal tanpa memanggil API, Atur ulang, saringan dan urutan tersimpan selama sesi, empat urutan dengan aturan seri, tanda "Data sedikit", satu rincian terbuka pada satu waktu dengan isinya, dan keadaan memuat, gagal, serta kosong.
- [x] AC-9 **Tampilan.** P-19 dan P-20 di 1280 × 720, 1024 × 768, 1920 × 1080, dan 360 × 640, dengan dan tanpa rincian terbuka: tanpa luapan halaman; tabel tidak digulir menyamping di 1280 × 720 dan 1024 × 768; kolom sesuai lebar; kartu di bawah 1024 px; semua kendali setinggi sedikitnya 48 px.
- [x] AC-10 **Aksesibilitas.** P-22: struktur judul, `th scope`, `aria-expanded`, teks pembaca layar batang, tingkat dan kategori bertulisan, dan halaman Statistik serta dasbor bisa dipakai sampai rincian dan tautan hanya dengan papan ketik.
- [x] AC-11 **API dasbor.** P-24 sampai P-26: `siapTinjau` (admin angka, guru `null`); `sesi` sesuai D-1 dengan kepemilikan, ruang uji, urutan, dan paling banyak lima; `ringkasan` dari ruang yang tepat dengan angka sesuai data uji; dan tidak ada kueri dasbor yang menyebut tabel `jawaban`.
- [x] AC-12 **Kartu dasbor.** P-27 dan P-28: empat kartu dalam urutannya; peringatan bertaut ke Rujukan dan Kejadian; sesi terakhir dengan tanda Uji dan nama guru sesuai D-3; ringkasan dan tautannya; keadaan kosong; dua kolom di 1280 × 720 dan satu kolom di 360 × 640.
- [x] AC-13 **Kueri riwayat.** P-29: semua uji riwayat JS-11 tetap lulus dengan jawaban yang sama, dan rencana kueri memilih ruang lewat `ruang_dibuat` atau `ruang_pemilik` sebelum menghitung peserta.
- [x] AC-14 **Teks.** Isi `TEKS_KONSOL` sama dengan bagian "Teks yang tampil (final)" spesifikasi ini (uji `kerangka.test.ts`).
- [x] AC-15 **Ukuran dan kinerja.** P-30: kode layar pemain tidak naik; konsol naik paling banyak 6 KB gzip; aturan impor konsol; saringan bawaan pada data tiruan 300 ruang paling lama 100 ms waktu D1 lokal dan paling banyak 100 ribu baris dibaca (dicatat di laporan bersama pengukuran semua waktu dan data 1.200 ruang).
- [x] AC-16 **Tanpa regresi.** Semua uji JS-01 sampai JS-22 lulus; `build:pages` menghasilkan 178 berkas yang identik byte dengan `main` sebelum Build; `tsc` dan ESLint berkas Jejak bersih.

## Rencana uji

### Uji unit (`test:jejak`, baru folder `app/jejak-setara/__tests__/statistik/`)

- `statistik-inti.test.ts`: `bacaSaringanStatistik` (setiap parameter, batas, dan galat), `susunStatistik` dengan baris agregat dan isi versi yang diketahui (semua isian P-5, dua versi, versi yang tidak ditemukan dilewati), `medianDetik`, `kategoriKesulitan`, dan `urutStatistik`.
- `api-statistik.test.ts` dengan D1 tiruan (`__tests__/akun/d1Tiruan.ts`, SQLite bawaan Node dengan migrasi repositori): izin dan kepemilikan, saringan, ruang dan jawaban yang dihitung (AC-2), Petunjuk, pilihan paket, dan jumlah pernyataan.
- `rencana-kueri.test.ts`: `EXPLAIN QUERY PLAN` kueri statistik (tanpa dan dengan guru), sesi terakhir, dan riwayat (AC-6, AC-13).
- `dasbor.test.ts` dengan D1 tiruan: `siapTinjau`, `sesi` (D-1, kepemilikan, urutan), `ringkasan`, dan pemeriksaan bahwa teks SQL dasbor tidak menyebut `jawaban`.
- `statistik-konsol.test.tsx` (`renderToStaticMarkup`, seperti `hasil-konsol.test.tsx`): kolom dan tanda, rincian, keadaan, dan kartu dasbor.
- Diubah: `kerangka.test.ts` (tabel teks JS-13, `IZIN`, dan aturan impor konsol), `__tests__/akun/rute.test.ts` (rute dan menu), serta uji riwayat JS-11 yang tetap berlaku tanpa perubahan harapan.

### Uji server (`test:jejak:server`, baru `server/jejak-setara/uji/statistik.uji-server.ts`)

- Di Worker lokal, beberapa ronde lewat pembantu yang sudah ada:
  - ruang biasa milik guru A dengan tiga pemain yang menjawab (satu dikeluarkan sesudah ronde, satu hanya mengunci Langkah 1);
  - ruang uji milik guru A;
  - ruang biasa milik guru B;
  - satu kejadian diterbitkan ulang menjadi versi 2 sebelum ronde kedua.

  Angka statistik per versi dicocokkan dengan hasil per ruang dan CSV jawaban (AC-5). Guru A tidak melihat ruang guru B, admin melihat keduanya, dan saringan `guru` serta `paket` berlaku. `GET /api/dasbor` berisi sesi terakhir dan ringkasan yang sesuai.
- Uji server JS-03 sampai JS-22 tetap lulus.

### Uji ujung ke ujung (`test:e2e:jejak`, baru `e2e/jejak-setara/statistik.uji.ts`)

- Admin dan guru:
  - menu Statistik;
  - bawaan "Dari tanggal" (D-2), saringan, Atur ulang, dan galat tanggal;
  - empat urutan;
  - rincian dengan grafik, tanda, catatan huruf, dan tautan ke bank kejadian;
  - halaman dipakai hanya dengan papan ketik.
- Tampilan di 1280 × 720, 1024 × 768, 1920 × 1080, dan 360 × 640: tanpa luapan halaman, tabel tidak digulir di dua ukuran pertama, dan kendali setinggi sedikitnya 48 px.
- Dasbor admin dan guru (diubah di `konsol.uji.ts`): empat kartu, tautan peringatan, sesi terakhir dengan tanda Uji, dan ringkasan. Ruang yang dibuat uji ditutup di akhir (JS-09 P-49).
- Tangkapan layar di `docs/jejak-setara/tests/JS-13/`: Statistik di keempat ukuran (dengan satu rincian terbuka di 1280 × 720 dan 360 × 640), keadaan kosong, dan dasbor di 1280 × 720 dan 360 × 640.

### Pengukuran

- Kueri statistik dan dasbor pada data tiruan berbenih 300 ruang dan 1.200 ruang seperti percobaan Plan, di D1 lokal (Miniflare lewat `wrangler`) dengan teks SQL yang sama dari `db/statistik.ts`: `meta.rows_read` dan `meta.duration` untuk saringan bawaan, semua waktu, dan satu guru (AC-15). Skripnya sementara, di luar repositori, seperti pengukuran CSV JS-11, dan cara mengulangnya dicatat di laporan.
- Ukuran kode layar pemain dan konsol dibandingkan dengan build `main` sebelum Build (gzip tingkat 9 atas JS dan CSS yang dimuat halaman).
- `sim:beban` tidak wajib (AGENTS 4.4): JS-13 tidak menyentuh protokol, inti ruang, atau kiriman ke D1.

### Manual (AGENTS 9) dan lingkungan uji

Langkah pemilik proyek sesudah ZIP Build di-push:

1. Pastikan "Jejak: uji" hijau.
2. Jalankan satu ronde pendek di **ruang biasa** (kotak "Ruang uji" tidak dicentang; Paket inti 16 sudah terbit) dengan dua atau tiga HP sampai ronde berakhir, lalu tutup ruangnya. Ruang uji tidak masuk statistik.
3. Di konsol sebagai admin, buka **Statistik**. Periksa bahwa "Dari tanggal" sudah terisi, buka **Rincian** satu kejadian, dan cocokkan jumlahnya dengan hasil ruang tadi dan CSV jawabannya.
4. Kosongkan "Dari tanggal", klik **Terapkan**, lalu coba "Urutkan: Paling sulit dulu".
5. Buka **Dasbor**: empat kartu, ruang tadi di "Sesi terakhir", dan angka "Ringkasan 30 hari terakhir".
6. Masuk dengan akun guru uji: Statistik hanya memuat ruang guru itu, dan kartu Peringatan tidak memuat "Siap tinjau".
7. Kirim tangkapan layar Statistik dengan rincian terbuka dan Dasbor.

Butir daftar periksa AGENTS 9 yang relevan: tidak ada nama asli siswa di layar, dan halaman Statistik serta dasbor bisa dipakai hanya dengan papan ketik di laptop.

## Catatan Build (21 November 2026)

- Semua butir P-1 sampai P-31 dibangun seperti tertulis, dengan pilihan D-1, D-2, dan D-3 (a). Hasil uji dan pengukuran ada di [laporan JS-13](../tests/JS-13-hasil.md).
- P-13 di kode: satu `batch` berisi statistik, cakupan, dan pilihan paket, lalu satu kueri isi versi. Bentuk kueri tanpa guru menulis `?1 IS NULL`, agar jumlah parameter sama dengan bentuk dengan guru.
- P-28 di kode: selama memuat atau bila gagal, dasbor menampilkan kartu Peringatan dengan "Memuat…" atau "Data dasbor gagal dimuat." dan "Coba lagi", seperti JS-04; tiga kartu lain tampil sesudah data dimuat.
- Kartu peringatan rujukan kini menautkan ke `#/rujukan` (JS-12 P-3 belum terpasang; temuan Specify).
- Uji lama yang diperbarui karena perilaku baru: `api-akun.test.ts` (isi dasbor), `konsol.uji.ts` (menu Statistik, dua peringatan admin, satu Tab tambahan, kartu baru), `kerangka.test.ts` (kunci teks JS-13), `rute.test.ts`, dan `izin.test.ts`. Pembantu uji baru: `catatRuangUji` di `server/jejak-setara/uji/bantuan.ts`.
- Dokumen: Architecture 3, 10.1, 10.2, dan 10.7; Design System 3.7 dan 10; PRD 11.2 dan 21.
