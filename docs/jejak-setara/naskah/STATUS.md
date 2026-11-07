# STATUS — Sesi B (Naskah kejadian Jejak Setara)

| | |
|---|---|
| Tahap saat ini | Plan JS-05 (Gerbang 1): entri Plan ditulis 7 November 2026, menunggu `Setuju: JS-05` |
| Pekerjaan | Naskah final 16 kejadian dan rujukannya (selesai 5 November 2026), lalu JS-05: skema konten, bank awal, semai ke D1, dan `content:check:jejak` |
| Tanggal | 7 November 2026 |
| Acuan | ZIP repositori 7 November 2026 (JS-02 selesai menurut pemilik proyek; semua aset Sesi C Disetujui) |
| Berkas yang boleh diubah sesi ini | `docs/jejak-setara/naskah/`, `app/jejak-setara/inti/konten/`, `server/jejak-setara/seed/`, `scripts/jejak-setara/semai.mjs`, dan berkas berawalan `naskah-` atau `bank-` di `app/jejak-setara/__tests__/konten/` (pemilik proyek, 7 November 2026). Perubahan berkas lain ditulis di "Permintaan untuk Sesi A" |

## Riwayat

| Tanggal | Tahap | Kejadian |
|---|---|---|
| 5 Nov 2026 | Plan | Usulan Plan pertama ditulis, menunggu persetujuan "Setuju: naskah" |
| 5 Nov 2026 | Plan | Usulan diperiksa ulang terhadap ZIP repositori terbaru dan diperbaiki (lihat "Perubahan dari usulan pertama"); tetap menunggu "Setuju: naskah" |
| 5 Nov 2026 | Plan | Pemilik proyek membalas "Setuju: naskah": semua saran diterima (usulan 1a sampai 7a) |
| 5 Nov 2026 | Naskah | Giliran 1: `K-13.md`, `K-14.md`, dan `NASKAH.md` diserahkan untuk dinilai, menunggu "Setuju: naskah Z7" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z7": K-13 dan K-14 disetujui |
| 5 Nov 2026 | Naskah | Giliran 2: `K-01.md` dan `K-02.md` (dua versi situasi untuk KT-10) diserahkan, menunggu "Setuju: naskah Z1" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z1" tanpa menyebut versi K-02: K-01 disetujui; K-02 disetujui, dan kedua versi situasinya tetap disimpan sampai KT-10 diputuskan |
| 5 Nov 2026 | Naskah | Giliran 3: `K-03.md` dan `K-04.md` diserahkan, menunggu "Setuju: naskah Z2" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z2": K-03 dan K-04 disetujui, termasuk tambahan JR-04 di K-04 (Permintaan A-3 aktif) |
| 5 Nov 2026 | Naskah | Giliran 4: `K-05.md` dan `K-06.md` diserahkan, menunggu "Setuju: naskah Z3" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z3": K-05 dan K-06 disetujui, termasuk tambahan JR-05 di K-05 (Permintaan A-4 aktif) |
| 5 Nov 2026 | Naskah | Giliran 5: `K-07.md` dan `K-08.md` diserahkan, menunggu "Setuju: naskah Z4" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z4": K-07 dan K-08 disetujui |
| 5 Nov 2026 | Naskah | Giliran 6: `K-09.md` dan `K-10.md` diserahkan, menunggu "Setuju: naskah Z5" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z5": K-09 dan K-10 disetujui |
| 5 Nov 2026 | Naskah | Giliran 7: `K-11.md` dan `K-12.md` diserahkan, menunggu "Setuju: naskah Z6" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z6": K-11 dan K-12 disetujui |
| 5 Nov 2026 | Naskah | Giliran 8 (terakhir): `K-15.md` dan `K-16.md` diserahkan, menunggu "Setuju: naskah Z8" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z8": K-15 dan K-16 disetujui. Tahap naskah selesai (16 dari 16) |
| 7 Nov 2026 | Naskah | Pemilik proyek memilih "K-02 versi A" (KT-10). Versi B dihapus dari `K-02.md`, dan `NASKAH.md` diperbarui |
| 7 Nov 2026 | Plan JS-05 | Pemilik proyek mengabarkan JS-02 selesai dan sudah di-push. Entri Plan JS-05 serta Permintaan A-5 sampai A-9 ditulis; menunggu `Setuju: JS-05` |

## JS-05 — Konten

Entri Plan JS-05 (templat AGENTS 12.1). Entri ini ditulis di sini, bukan di `PLAN.md`, karena `PLAN.md` hanya diubah Sesi A (AGENTS bagian 4.1).

- Status: Direncanakan (7 Nov 2026), menunggu `Setuju: JS-05`.
  - Pemeriksaan sebelum Plan (AGENTS 4.1 langkah 1): pemilik proyek menyatakan JS-02 selesai dan sudah di-push (7 Nov 2026). ZIP 7 Nov 2026 memuat kode `app/jejak-setara/inti/` dari JS-02, dan laporan JS-02 berkeputusan Lulus (dengan pemeriksaan pengganti). `PLAN.md` masih menulis JS-02 "Diuji"; status Selesai dicatat Sesi A di awal Plan JS-03, sesuai catatan "Plan JS-03, langkah pertama" di `PLAN.md`.
  - KT-10 dijawab pemilik proyek (7 Nov 2026): K-02 versi A. Keputusan ini sudah diterapkan di ZIP Gerbang 1 ini (`K-02.md` dan `NASKAH.md`).
- Memenuhi: JFR-15, JFR-16, JFR-43, dan JFR-45 (bagian data), ditambah Paket inti 16 untuk JFR-46. Rinciannya: 16 kejadian, dua per zona, untuk penempatan per ruang (JFR-15); isi dialog dua langkah dan kartu dampak (JFR-16); status awal kejadian (JFR-43); serta pustaka 23 rujukan dengan teks, sumber, dan status `belum` (JFR-45). Juga Architecture 5.4 (satu skema `zod` untuk bank awal dan isian konsol), JA-10 (bank awal disemai dari repositori ke D1), dan 10.6 (agen dan skrip tidak pernah menyemai `terverifikasi`).
- Bergantung pada: JS-02 (selesai menurut pemilik proyek). Menjalankan semai di D1 sungguhan juga memerlukan tabel D1 dan alur kerja dari JS-03 (Sesi A, Permintaan A-5), tetapi data, skema, pemeriksaan, dan skrip tidak menunggu itu. Kunci set tokoh memakai aset Sesi C yang sudah Disetujui (6 Nov 2026).
- File yang dibuat/diubah:
  - Di ZIP Gerbang 1 ini: `naskah/STATUS.md` (entri ini dan Permintaan A-5 sampai A-9), `naskah/K-02.md` (hanya versi A), dan `naskah/NASKAH.md` (status dan properti K-02).
  - Baru, inti murni (usulan 1): `app/jejak-setara/inti/konten/skema.ts` dan `app/jejak-setara/inti/konten/periksa.ts`.
  - Baru, data dan skrip: `server/jejak-setara/seed/bank-awal.json` (usulan 2 dan 3) dan `scripts/jejak-setara/semai.mjs` (usulan 7).
  - Baru, uji di `app/jejak-setara/__tests__/konten/` (usulan 9): `bank-skema.test.ts`, `bank-aturan.test.ts`, `bank-protokol.test.ts`, `bank-aset.test.ts`, `bank-semai.test.ts`, `bank-peta.test.ts`, `naskah-cocok.test.ts`, dan berkas pembantu `naskah-urai.ts`.
  - Baru, dokumen: spesifikasi dan laporan uji JS-05 (tempatnya di usulan 10).
  - Diubah saat Build: `naskah/NASKAH.md` (kolom kunci set tokoh dan latar titik) dan `naskah/STATUS.md`.
  - Tidak disentuh: `package.json`, lockfile, alur kerja, `server/jejak-setara/wrangler.jsonc`, folder migrasi, berkas `inti/` lain (termasuk `tipe.ts` dan `protokol.ts`), `teks.ts`, keempat dokumen utama, aset, kode dan dokumen Sehari Setara, serta galeri. Perubahan yang dibutuhkan di sana ditulis sebagai Permintaan A-5 sampai A-9.
- Migrasi D1: tidak ada. Tabel D1 dibuat Sesi A di JS-03; semai menulis ke tabel Architecture 5.2 sesuai kontrak di Permintaan A-5.
- Pesan protokol baru/berubah: tidak ada. Isi bank diperiksa terhadap skema pesan JS-02 yang sudah ada.
- Aset yang dibutuhkan: tidak ada aset baru. `setTokoh` memakai 37 berkas yang sudah Disetujui: 26 tokoh dan 11 properti (usulan 4).
- Hasil percobaan risiko (7 Nov 2026, di luar repositori; Node 22.23.4 dengan `zod` 3.25.76 dan `tsx` 4.23.12 dari alat global, karena pemasangan paket tertutup):
  - **Naskah ke data.** Pengurai kecil membaca ke-16 naskah dalam 3,5 ms (K-02 versi A). Prototipe skema `zod` dengan batas Architecture 5.4: 16 dari 16 lolos. Ke-336 angka di tabel "Pemeriksaan panjang" naskah dihitung ulang: 0 berbeda. Bagian terpanjang dibanding batasnya: judul 20/32, situasi 250/280 (K-02), pertanyaan 75/100, pilihan Langkah 1 79/90, umpan balik 154/160 (K-16), petunjuk 94/120, pilihan Langkah 2 104/140, "yang terjadi" 145/160 (K-14), hak atau kewajiban 100/120, dan topik 36 karakter. Semua situasi terdiri atas 3 kalimat. Potongan sama terpanjang antara petunjuk dan pilihan benar 5–19 karakter, sama dengan catatan naskah. Huruf kapital di tengah kalimat di luar nama diri: 1 temuan ("PR", singkatan), atau 0 bila singkatan huruf besar dikecualikan. Selisih panjang pilihan sama dengan tabel `NASKAH.md`.
  - **Urutan pilihan.** Di ke-16 naskah, pilihan benar Langkah 1 selalu di baris pertama, dan pilihan Langkah 2 selalu berurutan berisiko, tepat, kurang tepat (usulan 3).
  - **Rujukan.** 23 rujukan, semuanya dipakai, 2–4 per kejadian. Teks terpanjang 120 karakter (JR-21), di bawah batas 160 karakter teks rujukan di pesan protokol. Ke-11 teks yang berpadanan R-xx sama persis dengan `app/sehari-setara/content/references.ts`, dan kolom "Dipakai di" di `NASKAH.md` cocok dengan naskah.
  - **Protokol JS-02.** Dari setiap kejadian dibangun pesan `kejadian_terbuka`, `petunjuk`, `hasil_1`, `hasil_2`, dan `data_pembahasan`, ditambah satu pesan `selesai` berisi 16 rekap. Ke-81 pesan itu diperiksa dengan skema asli `protokol.ts`: 0 gagal. Pesan terbesar adalah `data_pembahasan` (2.207 byte) dan `selesai` (9.385 byte). Keduanya dikirim server, jadi batas 2 KB untuk pesan masuk tidak berlaku.
  - **Set tokoh.** Baris "Set tokoh dan properti" di naskah berisi 2–6 unsur; empat kejadian lebih dari 4 bila setiap unsur dihitung (K-07, K-08, dan K-10 masing-masing 5; K-12 6). Pratinjau O3 Sesi C yang sudah disetujui memuat 5 unsur di K-07, K-08, dan K-12. Skema protokol JS-02 membatasi `setTokoh` paling banyak 4. Dengan aturan usulan 4a, setiap kejadian memakai 1–4 kunci, seluruhnya 37 kunci berbeda, dan semuanya berkas Disetujui yang tercatat di `CREDITS.md`.
  - **Latar dan titik peta.** Penempatan JS-02 (`tempatkanKejadian`) memberi setiap kejadian satu titik acak dari semua titik zonanya. Dua zona memuat kejadian dengan latar berbeda: Z6 (K-11 di tepi sungai, K-12 di lapangan taman) dan Z7 (K-13 di ruang tunggu puskesmas, K-14 di depan kantor desa). Z3 memerlukan halte dan zebra cross di setiap titiknya (usulan 6).
  - **Ukuran bank.** Prototipe `bank-awal.json` (23 rujukan, 16 kejadian, 1 paket) berukuran 61.492 byte, atau 12.598 byte sesudah gzip.
  - **SQL semai di SQLite.** Dari prototipe bank disusun 73 pernyataan SQL (64.461 byte; pernyataan terpanjang 3.094 byte, batas D1 100.000 byte), lalu dijalankan di SQLite 3.53.4 bawaan Node (`node:sqlite`) dengan tabel menurut Architecture 5.2:
    - Semai pertama menghasilkan 23 rujukan, 16 kejadian, 16 versi, 1 paket, 16 baris isi paket, dan 1 penanda dalam 0,9 ms. Semua rujukan berstatus `belum`, semua kejadian `tinjau`, semua versi `kerja`, dan isi JSON di basis data sama dengan bank.
    - Semai ulang sesudah simulasi kerja di konsol (JR-04 ditandai terverifikasi oleh akun peninjau uji, judul K-01 disunting, K-05 dihapus): tidak ada baris yang berubah atau muncul lagi.
    - Semai yang terputus di tengah (36 dari 73 pernyataan), lalu diulang penuh: hasilnya lengkap.
    - Teks berisi tanda kutip tunggal dan potongan perintah SQL tersimpan utuh. Kata "terverifikasi" dan perintah BEGIN atau COMMIT tidak ada di SQL.
  - **Dokumentasi Cloudflare** (developers.cloudflare.com, 7 Nov 2026): `wrangler d1 execute <DATABASE> --file … --local | --remote [--env …]`; tanpa `--remote`, perintah berjalan di basis data lokal; satu pernyataan paling besar 100.000 byte; berkas impor paling besar 5 GB; perintah BEGIN TRANSACTION dan COMMIT harus dibuang dari berkas yang diimpor. Architecture belum merinci semai, jadi tidak ada yang bertentangan.
  - **Galeri.** `build:pages` tidak bisa dijalankan tanpa dependensi, jadi dipakai pengganti seperti di Test JS-02: kata baru di berkas diperiksa dengan API `compile` tailwindcss 4.3.3. Uji kewarasan menangkap 2 dari 2 kelas contoh. Prototipe bank dan SQL menambah 43 kata baru, dan 0 di antaranya menjadi kelas Tailwind. Untuk ketiga dokumen Gerbang 1 ini, semua kata yang tidak ada di berkas lain repositori ikut diperiksa, dan 0 di antaranya menjadi kelas Tailwind. Pemeriksaan resmi `build:pages` (178 berkas identik byte) dijalankan saat dependensi bisa dipasang.
- Usulan:
  1. **Skema dan aturan konten (`inti/konten/`).** — (a, saran) `skema.ts` berisi skema `zod` untuk satu kejadian (bentuk `IsiKejadian` di `tipe.ts` dengan batas Architecture 5.4), satu rujukan, satu paket, dan berkas bank awal. `periksa.ts` berisi aturan yang tidak bisa ditulis sebagai skema: situasi 1–3 kalimat; petunjuk tidak menyalin pilihan benar (paling banyak 20 karakter berturut-turut yang sama, sedangkan naskah sekarang paling banyak 19); tepat satu pilihan benar dan sedikitnya satu pilihan tepat; kode dan id unik; rujukan dan kunci set tokoh harus ada; serta huruf kapital di tengah kalimat sebagai peringatan. Keduanya murni (lolos uji kemurnian JS-02), sehingga server dan konsol (JS-12) memakai aturan yang sama, sesuai Architecture 5.4. Setiap temuan punya kode tetap, misalnya `SITUASI_KALIMAT`; kalimat yang tampil di konsol ditetapkan di JS-12. Batas yang belum tertulis di Architecture 5.4 diusulkan: teks rujukan ≤ 160 karakter (sama dengan protokol), topik ≤ 40, serta batas sumber dan catatan rujukan (Permintaan A-7). — (b) Satu berkas `skema.ts` untuk semuanya: berkas lebih sedikit, tetapi skema dan aturan tambahan bercampur. — (c) Skema hanya di uji konten: lebih cepat sekarang, tetapi JS-12 harus menulis ulang aturan yang sama untuk konsol, bertentangan dengan Architecture 5.4.
  2. **Bentuk `bank-awal.json` dan hubungannya dengan naskah.** — (a, saran) Satu berkas JSON berversi: `rujukan` (23 rujukan: id, teks, sumber, padanan Sehari Setara, dan catatan untuk Peninjau), `kejadian` (16 kejadian, persis `IsiKejadian`), dan `paket` (Paket inti 16, urutan K-01 sampai K-16). Rujukan **tidak punya kolom status** di berkas ini, dan skema menolak kolom itu, sehingga status hanya bisa ditulis semai sebagai `belum`. Catatan untuk Peninjau diambil dari kolom "Yang dibutuhkan kejadian" dan catatan sumber di berkas ini, bukan dari pra-pemeriksaan agen. Naskah `K-xx.md` tetap menjadi bentuk yang Anda setujui; uji `naskah-cocok` membandingkan setiap teks JSON dengan naskahnya huruf demi huruf, jadi keduanya tidak bisa berbeda tanpa ketahuan. Yang tetap hanya di naskah: baris "Langkah 1 menanyakan", pra-pemeriksaan, dan catatan peninjauan. — (b) JSON dibuat otomatis dari naskah oleh skrip: hanya satu sumber, tetapi pengurai Markdown menjadi bagian produk, format naskah tidak boleh berubah sedikit pun, dan perlu skrip baru di luar batas berkas. — (c) Sesudah disemai, naskah hanya menjadi arsip: paling sederhana, tetapi perbaikan teks berikutnya tidak lagi bisa dinilai dalam bentuk naskah.
  3. **Urutan pilihan yang disimpan.** — (a, saran) Saat dipindah ke JSON, urutan pilihan setiap langkah diacak sekali lalu tetap (dengan `kocok` JS-02 dan benih kode kejadian), kemudian id diberi `1a`–`1d` dan `2a`–`2c` menurut urutan itu. Jawaban benar tidak lagi selalu pilihan pertama di data, sehingga tampilan yang memakai urutan tersimpan (misalnya pembahasan di proyektor atau pratinjau konsol) tidak memperlihatkan pola. Urutan yang dilihat pemain tetap diacak per pemain (JFR-21), dan id yang dikirim ke pemain tetap acak (Architecture 8.3). — (b) Mengikuti urutan naskah: pilihan benar selalu `1a` dan pilihan tepat selalu `2b` di ke-16 kejadian.
  4. **Isi `setTokoh` dan batas 4 kunci.** — (a, saran) Paling banyak 4 kunci, sesuai skema protokol JS-02 (`kejadian_terbuka.setTokoh`) dan Architecture 5.4. Kunci adalah nama berkas aset Disetujui tanpa `.png`, misalnya `npc_bayu_bawah_diam` atau `obj_tiang_kamera`. Bangunan penanda dan objek peta (pagar, halte, zebra cross, bale, warung berwifi, lapangan, tepi sungai) tidak dimasukkan karena sudah menjadi bagian peta JS-06, dan benda yang dipegang tokoh sudah ada di posenya. Tiga set dari pratinjau O3 dipangkas: K-07 tanpa lapak (pasar sudah penuh lapak), K-08 tanpa pos keamanan (di naskah letaknya "di ujung lorong", jadi cukup sebagai objek peta Z4), dan K-12 dengan satu anak SD selain Gita. Daftar lengkap 16 set ditulis di Specify sebagai DRAF. — (b) Naikkan batas menjadi 6 (Permintaan untuk Sesi A: `protokol.ts` dan Architecture 5.4): set persis seperti pratinjau O3, tetapi JS-08 perlu menentukan cara menggambar benda besar seperti pos keamanan (2 × 2 ubin) di titik acak tanpa kotak padat. — (c) Pisahkan `setTokoh` (paling banyak 4 tokoh) dan `setProperti` (paling banyak 3 benda): paling jelas, tetapi mengubah `IsiKejadian` di `tipe.ts` dan skema protokol, sehingga JS-05 menunggu jawaban Sesi A.
  5. **Memeriksa kunci set tokoh sebelum `manifest.ts` ada.** Manifest masih menunggu jawaban Sesi A atas Permintaan C-6 Sesi C. — (a, saran) Uji `bank-aset` memastikan setiap kunci punya berkas di `app/jejak-setara/assets/npc/` atau `obj/` dan tercatat di `CREDITS.md`, yang dibuat `build_jejak.py` hanya untuk aset Disetujui. Begitu manifest ada, uji ini ditambah pemeriksaan ke manifest (Permintaan A-6). — (b) Hanya memeriksa pola kunci sampai manifest ada: tidak bergantung pada berkas Sesi C, tetapi salah ketik kunci baru ketahuan di JS-08.
  6. **Latar kejadian dan titik peta.** Karena setiap kejadian mendapat titik acak dari semua titik zonanya, latar di naskah harus cocok dengan setiap titik di zona itu:

     | Zona | Latar di naskah | Yang dibutuhkan setiap titik |
     |---|---|---|
     | Z1 | K-01 pagar rumah Nara; K-02 teras dekat rumah Pak Made | Gang berpagar di antara rumah |
     | Z2 | K-03 dekat kantin; K-04 percakapan tentang lab lantai dua | Halaman sekolah dekat kantin |
     | Z3 | K-05 menunggu angkot di halte; K-06 zebra cross dekat halte | Dekat halte dan zebra cross |
     | Z4 | K-07 lapak dengan kamera; K-08 bangku pasar, pos keamanan di ujung lorong | Lorong pasar |
     | Z5 | K-09 dan K-10 di balai warga | Sekitar bale |
     | Z6 | K-11 tepi sungai; K-12 lapangan taman | **Berbeda:** lapangan taman di tepi sungai |
     | Z7 | K-13 ruang tunggu puskesmas; K-14 depan kantor desa | **Berbeda:** halaman bersama puskesmas dan kantor desa |
     | Z8 | K-15 dan K-16 di pojok gawai | Sekitar warung berwifi |

     — (a, saran) Naskah tidak diubah. `NASKAH.md` mendapat kolom "Latar titik" sesuai tabel ini, dan Sesi C menata titik setiap zona di JS-06 agar cocok dengan latar kedua kejadiannya. Tidak ada perubahan skema atau kode. Kejadian baru dari konsol kelak juga perlu memakai latar yang ada di semua titik zonanya (Permintaan A-8). — (b) Tambahkan `tempat` pada kejadian dan titik peta, lalu penempatan hanya memilih titik yang cocok: paling tepat bila bank tumbuh (Permintaan C-8 Sesi C), tetapi mengubah `tipe.ts`, `peta.ts`, dan `aturan.ts` (Sesi A) serta bentuk `kampung.json` (Sesi C), dan menunda JS-05 serta JS-06. — (c) Ubah situasi K-11, K-12, K-13, dan K-14 agar tidak menyebut tempat yang khas: titik menjadi bebas, tetapi naskah yang sudah disetujui berubah dan rasa tempatnya hilang.
  7. **Cara menyemai ke D1.** — (a, saran) `semai.mjs` membaca `bank-awal.json`, menyusun SQL `INSERT … ON CONFLICT DO NOTHING` untuk tabel `rujukan`, `kejadian`, `kejadian_versi`, `paket`, dan `paket_kejadian` (Architecture 5.2), lalu menulis penanda `semai_bank_awal` di tabel `pengaturan`. Setiap pernyataan hanya berlaku selama penanda belum ada, jadi bank awal disemai **sekali per basis data**: menjalankan ulang tidak menimpa suntingan konsol, tidak mengubah tanda Terverifikasi, dan tidak menghidupkan lagi kejadian yang sudah dihapus. Status rujukan selalu ditulis `belum`. Skrip menjalankan SQL lewat `wrangler d1 execute` ke basis data lokal atau jarak jauh (lingkungan uji dan produksi). Sebelum D1 dibuat di JS-03, skrip mencetak "Belum tersedia: …" lalu selesai tanpa galat, seperti `bila-ada.mjs`. Nama skrip di `package.json` dan langkah semai di alur kerja diminta kepada Sesi A (Permintaan A-5). — (b) SQL semai dijadikan migrasi data D1 (`000N_bank_awal.sql`) yang disalin Sesi A ke folder migrasi di JS-03: D1 sendiri menjamin migrasi berjalan sekali dan dibatalkan bila gagal, tanpa langkah alur kerja baru; tetapi folder migrasi milik Sesi A, ada dua salinan SQL, dan migrasi yang sudah ada di `main` tidak boleh diubah lagi. — (c) Semai dijalankan Worker dengan kueri berparameter (Architecture 17): paling rapi dari sisi kode server, tetapi seluruhnya berada di `server/jejak-setara/src/` milik Sesi A, sehingga JS-05 tidak bisa menyelesaikan bagian semai sendiri.
  8. **Status awal kejadian dan paket.** — (a, saran) Kejadian disemai berstatus `tinjau` (Siap tinjau) dengan satu versi `kerja`, karena naskahnya sudah Anda setujui; yang tersisa adalah verifikasi rujukan oleh Peninjau, lalu Terbitkan oleh Admin di konsol (JFR-43, Architecture 10.5). Paket inti 16 disemai aktif, dan ruang kelas baru bisa memakainya sesudah kejadiannya terbit. — (b) Kejadian berstatus `draf`: lebih hati-hati, tetapi ada 16 kali langkah "Ajukan" tambahan di konsol.
  9. **Uji `content:check:jejak`.** — (a, saran) Tujuh berkas uji berawalan `bank-` dan `naskah-`:
     - `bank-skema` dan `bank-aturan`: bank lolos skema dan aturan, dan setiap aturan punya contoh cacat yang ditolak, sebagai bekal konsol JS-12;
     - `bank-protokol`: setiap kejadian membentuk pesan JS-02 yang sah, seperti percobaan di atas;
     - `bank-aset`: pemeriksaan kunci set tokoh (usulan 5);
     - `bank-semai`: SQL dijalankan dua kali di SQLite bawaan Node (`node:sqlite`, tersedia sejak Node 22.13, sesuai batas `engines` repositori) dengan skenario percobaan di atas. Tabelnya diambil dari migrasi JS-03 begitu ada di `server/jejak-setara/migrations/`, dan dari kontrak Permintaan A-5 sebelum itu, sehingga perbedaan kolom langsung ketahuan;
     - `bank-peta`: dilewati dengan pesan jelas sampai `app/jejak-setara/peta/kampung.json` ada, lalu memeriksa bahwa titik setiap zona cukup untuk paket (Architecture 5.4), memakai `bacaPeta` dan `tempatkanKejadian` JS-02;
     - `naskah-cocok`: ke-16 naskah dan pustaka `NASKAH.md` sama dengan bank, dan teks yang berpadanan R-xx sama dengan teks Sehari Setara (hanya dibaca).

     — (b) Satu berkas uji besar: lebih sedikit berkas, tetapi galat lebih sulit ditelusuri, dan bagian SQL atau peta tidak bisa dilewati sendiri. — (c) SQL hanya diperiksa sebagai teks, atau dijalankan dengan alat uji Worker: yang pertama tidak menangkap kesalahan SQL, sedangkan yang kedua perlu izin dependensi dan diputuskan Sesi A di JS-03 (KT-07).
  10. **Tempat spesifikasi dan laporan uji.** Batas berkas JS-05 tidak memuat `docs/jejak-setara/specs/` dan `docs/jejak-setara/tests/`. — (a, saran) `docs/jejak-setara/specs/JS-05-konten.md` dan `docs/jejak-setara/tests/JS-05-hasil.md`, seperti fitur lain, agar semua spesifikasi ada di satu folder. Namanya berawalan JS-05, jadi tidak bertabrakan dengan berkas Sesi A. Perlu izin Anda. — (b) `docs/jejak-setara/naskah/JS-05-konten.md` dan `naskah/JS-05-hasil.md`: tetap di dalam batas, tetapi terpisah dari spesifikasi fitur lain.
- Keputusan terbuka yang perlu dijawab: tidak ada KT PRD baru. KT-10 sudah dijawab (versi A). KT-07 tidak terpakai karena tidak ada dependensi baru. Keputusan pedagogis dan tampilan di gerbang ini ada di usulan 4 (isi set tokoh) dan usulan 6 (latar titik peta).
- Dependensi baru: tidak ada. `zod` sudah terpasang, dan `node:sqlite` adalah modul bawaan Node 22.13 ke atas, bukan paket.
- Risiko:
  - **Kontrak D1 belum ada.** JS-03 belum direncanakan, jadi nama dan jenis kolom bisa berbeda dengan Architecture 5.2. Ditangani lewat Permintaan A-5 dan uji `bank-semai`, yang membaca migrasi JS-03 begitu ada.
  - **Uji lintas sesi.** `bank-aset` membaca berkas Sesi C, `bank-semai` membaca migrasi Sesi A, dan `naskah-cocok` membaca rujukan Sehari Setara. Bila salah satunya berubah tanpa kabar, alur kerja "Jejak: uji" bisa merah pada push sesi lain. Ini disengaja sebagai alarm; penyelesaiannya lewat permintaan di berkas status sesi masing-masing.
  - **`node:sqlite` masih eksperimental** di Node 22: modul ini mencetak peringatan, dan bentuknya bisa berubah. Modul dipanggil lewat `process.getBuiltinModule`, dan uji dilewati dengan pesan jelas bila modul tidak tersedia. SQLite di D1 sekeluarga tetapi tidak identik; fungsi waktu yang dipakai dicek di Specify.
  - **SQL disusun sebagai teks.** Architecture 17 meminta kueri berparameter untuk kode Worker; semai lebih mirip berkas migrasi. Isinya berasal dari repositori, bukan dari pengguna, dan semua teks lewat satu fungsi pengutip yang diuji dengan tanda kutip tunggal.
  - **Belum ada kejadian yang bisa terbit sebelum JS-12.** Rujukan disemai `belum`, jadi ruang kelas sungguhan belum bisa memakai bank awal sampai Peninjau memverifikasinya di konsol. Uji JS-08 dan JS-10 memerlukan ruang uji atau data uji (Permintaan A-9).
  - **Dua bentuk naskah** (Markdown dan JSON): dijaga uji `naskah-cocok`.
  - **Lingkungan agen tanpa pemasangan paket.** `vitest`, `tsc`, ESLint, dan `build:pages` di Build dan Test dijalankan dengan pengganti seperti JS-02; hasil pastinya terlihat di alur kerja "Jejak: uji" sesudah push.
  - **Bank yang tumbuh** (Permintaan C-8 Sesi C): bank awal tetap 16 kejadian, tetapi skema, pemeriksaan, dan semai tidak mengunci angka 16 atau dua kejadian per zona.
- Ukuran: M

## Ringkasan rencana tahap naskah (templat AGENTS 12.1)

| | |
|---|---|
| Status | Selesai 5 Nov 2026: 16 naskah disetujui; versi situasi K-02 dipilih 7 Nov 2026 (versi A) |
| Memenuhi | Bagian naskah JS-05: 16 kejadian dan rujukannya (PRD bagian 10), sebagai data untuk JFR-15, JFR-16, dan JFR-45 |
| Bergantung pada | PRD bagian 10 serta Architecture bagian 5.1 dan 5.4. Tidak menunggu JS-02; JS-02 baru diperlukan untuk bagian kode JS-05 |
| Berkas yang dibuat atau diubah | Sekarang: `naskah/STATUS.md`. Sesudah disetujui: `naskah/NASKAH.md` dan `naskah/K-01.md` sampai `naskah/K-16.md` |
| Migrasi D1 | Tidak ada |
| Pesan protokol baru atau berubah | Tidak ada |
| Aset yang dibutuhkan | Tidak ada untuk naskah. Bagian "Tokoh dan wataknya" menjadi masukan bagi Sesi C |
| Dependensi baru | Tidak ada |
| Risiko | Jawaban bisa ditebak dari panjang pilihan (KT-B6); stereotip di kejadian bertema agama, disabilitas, dan suku (KT-B5, peninjauan khusus); 12 rujukan baru belum pernah dicek |
| Ukuran | M (16 kejadian dalam 8 giliran) |

## Hasil percobaan dan pemeriksaan tahap naskah

Percobaan dijalankan dengan skrip kecil di luar repositori.

1. **Contoh K-13 terhadap batas Architecture 5.4.** Ke-21 bagian contoh K-13 di PRD bagian 10 lolos semua batas: judul 17/32 karakter, situasi 167/280 karakter dalam 3 kalimat, pilihan Langkah 1 terpanjang 70/90, pilihan Langkah 2 terpanjang 94/140, dan umpan balik terpanjang 98/160. Petunjuknya tidak menyalin pilihan benar. Format dan batasnya bisa dipakai.
2. **Panjang pilihan menjadi petunjuk jawaban.** Di keenam adegan Sehari Setara, pilihan "tepat" selalu yang terpanjang (77–139 karakter, sedangkan pilihan lain 23–65 karakter). Contoh K-13 sama: pilihan benar Langkah 1 berpanjang 70 karakter, sedangkan ketiga pengecohnya 30–43 karakter; pilihan tepat Langkah 2 berpanjang 94 karakter, sedangkan dua lainnya 33 dan 43. Di Sehari Setara kelas berdiskusi bersama, jadi pola ini tidak banyak berpengaruh. Di Jejak Setara siswa menjawab sendiri dan bersaing, sehingga kebiasaan "pilih yang terpanjang" bisa memberi skor tanpa berpikir (PRD bagian 18). Lihat usulan 6.
3. **Jumlah rujukan.** PRD bagian 10 memuat 23 rujukan berbeda: 11 berpadanan dengan rujukan Sehari Setara yang sudah Anda cek pada 5 November 2026, dan 12 baru. Setiap kejadian memakai 2–4 rujukan (terbanyak K-07, yaitu 4), masih dalam batas 1–4. Pencocokan otomatis ke-16 baris PRD dengan daftar di bawah: semuanya cocok.
4. **Tokoh.** Raka (K-04, juga K-13 di contoh PRD), Wayan (K-14), dan siswa SMP umum (K-03, K-10, K-11, K-12, K-16) belum tercantum di Design System bagian 8 maupun PRD bagian 15. Sesi C perlu mengetahuinya sebelum menggambar (Permintaan A-1).

## Perubahan dari usulan pertama

| Bagian | Usulan pertama | Sekarang | Alasan |
|---|---|---|---|
| Daftar rujukan | 22 rujukan | 23 rujukan: Pasal 31 ayat (2) UUD NRI 1945 (K-14) ditambahkan sebagai JR-23 | Terlewat; ada di PRD bagian 10, baris K-14 |
| Tautan | perpu.id dan `jdih.bpk.go.id/pencarian?q=…` | Alamat sumber resmi per dokumen | Alamat lama tidak bisa dibuka untuk dipastikan, dan perpu.id bukan situs JDIH pemerintah. Alamat baru sama dengan yang dipakai di `docs/sehari-setara/Verifikasi_Rujukan.md`, ditambah halaman UU 32/2009 di Database Peraturan JDIH BPK |
| Judul UU 32/2009 | Pengelolaan Lingkungan Hidup | Perlindungan dan Pengelolaan Lingkungan Hidup | Judul resmi di JDIH BPK |
| Format: jenis | pelanggaran hak / pengabaian kewajiban / peran lembaga | pelanggaran hak / pengabaian kewajiban / keduanya | Nilai yang ada di Architecture 5.1. "Peran lembaga" adalah hal yang ditanyakan Langkah 1, jadi dicatat di baris tersendiri |
| Format: batas | Tanpa batas judul dan jumlah rujukan | Judul ≤ 32 karakter; 1–4 rujukan per kejadian | Architecture 5.4 |
| Padanan JR-02 | "R-08 bagian (baru, bukan R yang sama persis)" | Baru | R-08 di `references.ts` hanya Pasal 28J ayat (1) |
| KT-B4 | Apakah Pasal 28E ayat (1) diberi kode sendiri? | Diganti: teks rujukan yang berpadanan dengan Sehari Setara | Pertanyaan lama bukan pilihan, karena setiap pasal yang berbeda memang mendapat kode sendiri |
| Tambahan | — | Hasil percobaan, pegangan gaya, tokoh dan wataknya, KT-B5 sampai KT-B7, Permintaan A-1 dan A-2 | AGENTS bagian 4.1 (langkah 6 dan 8) dan bagian 8 |

## Keputusan Gerbang naskah (5 November 2026)

| Kode | Keputusan |
|---|---|
| KT-B1 | 1a: satu berkas per kejadian (`K-01.md` sampai `K-16.md`) ditambah `NASKAH.md` |
| KT-B2 | 2a: dua kejadian per giliran, mulai Z7, lalu Z1 sampai Z8 |
| KT-B3 | 3a: JR-01 sampai JR-23 menjadi nomor tetap |
| KT-B4 | 4a: teks rujukan yang berpadanan R-xx sama persis dengan Sehari Setara; Permintaan A-2 diajukan |
| KT-B5 | 5a: penyerobot di K-13 menjadi teman sekelas tanpa nama; Raka hanya di K-04 |
| KT-B6 | 6a: selisih pilihan paling banyak 20 karakter (Langkah 1) dan 35 karakter (Langkah 2); pilihan benar atau tepat tidak selalu terpanjang |
| KT-B7 | 7a: rujukan baru dipra-periksa di sumber resmi setiap giliran |
| KT-10 PRD | Dijawab pemilik proyek, 7 Nov 2026: versi A (umum). Versi B dihapus dari `K-02.md` |

## Usulan Plan tahap naskah (disetujui 5 November 2026)

Setiap usulan berisi saran (a) dan alternatifnya. Kode KT-B di judul adalah keputusan terbuka yang dijawab di gerbang ini.

### 1. Format naskah (KT-B1)

(a, saran) Satu berkas Markdown per kejadian, `naskah/K-01.md` sampai `naskah/K-16.md`, ditambah `naskah/NASKAH.md` berisi daftar 16 kejadian beserta statusnya dan pustaka rujukan JR. Strukturnya tetap, agar di JS-05 isinya bisa dipindahkan ke `server/jejak-setara/seed/bank-awal.json` dan dicocokkan otomatis:

```markdown
# K-xx — [Judul, ≤ 32 karakter]
## Ringkasan
| | |
|---|---|
| Zona | Zx Nama zona |
| Set tokoh dan properti | Paling banyak 4 tokoh; kunci manifest diisi di JS-05 |
| Langkah 1 menanyakan | Hak yang terganggu / kewajiban yang diabaikan / peran lembaga |
| Topik | Misalnya "Hak atas kesehatan" |
| Jenis | Pelanggaran hak / pengabaian kewajiban / keduanya |
## Situasi
1–3 kalimat, ≤ 280 karakter, teks polos.
## Langkah 1 — Kenali
Pertanyaan (≤ 100 karakter), lalu tabel 4 pilihan (≤ 90 karakter, tepat satu benar)
dengan umpan balik per pilihan (≤ 160 karakter).
## Petunjuk
≤ 120 karakter; tidak menyalin teks pilihan benar.
## Langkah 2 — Bertindak
Pertanyaan (≤ 100 karakter), lalu tabel 3 pilihan (≤ 140 karakter: satu tepat,
satu kurang tepat, satu berisiko) dengan "yang terjadi" per pilihan (≤ 160 karakter).
## Kartu dampak
Hak yang terdampak (≤ 120 karakter) dan kewajiban terkait (≤ 120 karakter).
## Rujukan (perlu verifikasi)
1–4 kode JR beserta teksnya; rujukan baru disertai pra-pemeriksaan agen (KT-B7).
## Pemeriksaan panjang
Jumlah karakter setiap bagian terhadap batasnya, dihitung dengan skrip di luar repositori.
## Catatan peninjauan
Wajib untuk K-02 (agama), K-04 (disabilitas), dan K-10 (suku): risiko stereotip dan cara
menghindarinya. Kejadian lain mendapat catatan kepekaan bila perlu.
```

- (b) Satu berkas besar `NASKAH.md`: mudah dibaca sekali jalan, tetapi sulit dinilai per kejadian, dan satu perbaikan kecil menyentuh berkas besar.
- (c) Langsung JSON sesuai skema: terlalu dini, karena skema baru dibuat di JS-05.

**Pegangan gaya** (dari naskah Sehari Setara, Design System bagian 3.5, dan AGENTS bagian 8):

- Bahasa Indonesia baku yang ramah remaja dan berkalimat pendek. Huruf kapital hanya di awal kalimat dan pada nama diri, termasuk di judul.
- Pemain disapa "kamu", seperti contoh K-13. K-01 dan K-08 berpusat pada Nara, jadi pertanyaannya memakai "Nara", seperti di Sehari Setara.
- Pilihan berupa frasa kerja tanpa titik di akhir. Ucapan tokoh memakai tanda petik “ ”.
- Umpan balik dan "yang terjadi" berupa 1–2 kalimat yang menjelaskan alasan dengan nada mengajak. Umpan balik tidak diawali "Benar." atau "Salah.", karena pita "Tepat" atau "Belum tepat" sudah tampil di atasnya.
- Pengecoh Langkah 1 berupa anggapan keliru yang umum. Tidak ada pilihan, umpan balik, atau "yang terjadi" yang menyalahkan korban.
- Tanpa kekerasan fisik. Tokoh berwenang (guru, petugas, polisi) digambarkan membantu. Bayu tidak bersalah dan digambarkan netral.
- Kartu dampak ditulis seperti Sehari Setara: "Hak …." dan "Kewajiban …."

**Cara menyerahkan setiap giliran:** naskah dua kejadian tampil di balasan untuk dinilai, ditambah ZIP kecil berisi kedua berkas `K-xx.md`, `NASKAH.md`, dan `STATUS.md`. Frasa persetujuan per giliran: "Setuju: naskah Z7", "Setuju: naskah Z1", dan seterusnya. Permintaan revisi cukup ditulis bebas.

### 2. Urutan pengerjaan per zona (KT-B2)

(a, saran) Dua kejadian (satu zona) per giliran, dimulai dari zona yang contohnya sudah ada:

| Giliran | Kejadian | Zona | Catatan |
|---|---|---|---|
| 1 | K-13, K-14 | Z7 Puskesmas dan kantor desa | Kalibrasi gaya dari contoh K-13; memakai jawaban KT-B5 dan KT-B6 |
| 2 | K-01, K-02 | Z1 Rumah dan gang | K-02 peninjauan khusus (agama); KT-10 PRD diputuskan di sini |
| 3 | K-03, K-04 | Z2 Sekolah | K-04 peninjauan khusus (disabilitas) |
| 4 | K-05, K-06 | Z3 Jalan dan halte | |
| 5 | K-07, K-08 | Z4 Pasar | K-07 menanyakan peran lembaga |
| 6 | K-09, K-10 | Z5 Balai warga | K-10 peninjauan khusus (suku) |
| 7 | K-11, K-12 | Z6 Taman, sungai, dan pantai | |
| 8 | K-15, K-16 | Z8 Pojok gawai | |

- (b) Urutan per tingkat kesulitan atau per topik: mengganggu penilaian per zona dan menyulitkan Sesi C yang menyiapkan properti per zona.
- KT-10 PRD (nuansa lokal Bali di kejadian toleransi) diputuskan peninjau konten saat naskah ditulis. Untuk K-02 saya mengirim dua versi situasi: satu umum tanpa menyebut agama atau hari suci tertentu, dan satu bernuansa Bali. Peninjau memilih salah satunya.

### 3. Nomor rujukan JR (KT-B3)

- (a, saran) Nomor JR-01 sampai JR-23 di bagian "Daftar rujukan" langsung menjadi nomor tetap di naskah dan di semai JS-05, agar tidak ada penomoran ulang yang bisa keliru. Nomor tidak harus berurutan menurut kejadian; JR-23 ditambahkan di akhir supaya nomor lama tidak bergeser.
- (b) Nomor sementara, ditetapkan ulang di JS-05.

### 4. Teks rujukan yang berpadanan dengan Sehari Setara (KT-B4)

- (a, saran) Rujukan yang berpadanan R-xx memakai teks yang sama persis dengan `app/sehari-setara/content/references.ts`, dan rujukan baru dari undang-undang yang sama mengikuti gaya itu. Hasil pemeriksaan Sehari Setara pun langsung bisa dipakai sebagai pembanding. Akibatnya tiga teks sedikit berbeda dari PRD bagian 10: JR-18 dan JR-19 memakai "UU No. 22 Tahun 2009 tentang LLAJ", dan JR-20 diakhiri "(asas praduga tak bersalah)" (Permintaan A-2).
- (b) Semua teks persis seperti PRD bagian 10.

### 5. Tokoh penyerobot di K-13 (KT-B5)

Contoh K-13 di PRD memakai Raka sebagai tokoh yang menyerobot antrean lalu "menarikmu ikut", sedangkan K-04 memperkenalkan Raka sebagai teman berkursi roda. Bila keduanya orang yang sama, satu-satunya tokoh berkursi roda tampil sebagai pelanggar. Pelajaran K-13 juga bisa kabur, karena di banyak layanan umum penyandang disabilitas memang mendapat antrean prioritas.

- (a, saran) Penyerobot di K-13 menjadi teman sekelas tanpa nama (siswa SMP umum), dan Raka hanya muncul di K-04. PRD tidak perlu diubah, karena K-13 di PRD disebut sebagai contoh.
- (b) Raka tetap di K-13 sebagai orang yang sama, berkursi roda. Kalimat "menarikmu ikut" disesuaikan, dan peninjauan khusus K-04 ikut menilai K-13.
- (c) Memakai Dimas, yang di Sehari Setara pernah mengambil jalan pintas. Risikonya, Dimas menjadi pemberi pengaruh kurang baik di tiga kejadian (K-02, K-05, K-13).

### 6. Panjang pilihan (KT-B6)

- (a, saran) Panjang pilihan dibuat mirip: selisih pilihan terpanjang dan terpendek paling banyak 20 karakter di Langkah 1 dan 35 karakter di Langkah 2, dan pilihan benar atau tepat tidak selalu yang terpanjang. Setiap naskah mencantumkan angkanya di "Pemeriksaan panjang". Akibatnya pengecoh contoh K-13 diperpanjang sedikit (misalnya diberi alasan yang terdengar masuk akal), sehingga teks pilihannya tidak lagi persis sama dengan PRD.
- (b) Mengikuti gaya Sehari Setara apa adanya: lebih mudah ditulis, tetapi jawaban bisa ditebak dari panjangnya.
- (c) Hanya mengandalkan pengacakan urutan pilihan (JFR-21). Cara ini tidak menolong, karena yang ditebak adalah panjangnya, bukan letaknya.

### 7. Pra-pemeriksaan rujukan baru (KT-B7)

- (a, saran) Setiap giliran, rujukan **baru** di kedua kejadian itu saya pra-periksa di sumber resmi (bunyi pasal dan kecocokannya dengan kejadian), seperti catatan pra-pemeriksaan di `Verifikasi_Rujukan.md` Sehari Setara, agar Anda lebih cepat mencocokkan. Pra-pemeriksaan bukan verifikasi: statusnya tetap "perlu verifikasi".
- (b) Tanpa pra-pemeriksaan agen.

## Daftar rujukan untuk dicek di JDIH

Semua rujukan berstatus **perlu verifikasi**. Daftar ini persis rujukan usulan PRD bagian 10, tanpa nomor pasal baru. Memverifikasi berarti memastikan dua hal: bunyi pasal di naskah resmi sama, dan isinya cocok dengan kejadian yang memakainya.

- **11 rujukan berpadanan R-xx** sudah Anda cek untuk Sehari Setara pada 5 November 2026 (`docs/sehari-setara/Verifikasi_Rujukan.md`). Untuk rujukan ini cukup pastikan isinya cocok dengan kejadian Jejak Setara yang memakainya.
- **12 rujukan baru** (ditandai **baru**) perlu dibaca penuh.
- Pemeriksaan sekarang dipakai untuk menyetujui naskah. Tanda "Terverifikasi" resmi tetap diberikan akun Peninjau di pustaka rujukan konsol (JFR-45, dibangun di JS-12). Bank awal disemai dengan semua rujukan berstatus `belum`, dan agen tidak pernah menandai rujukan terverifikasi.
- Hasil pra-pemeriksaan agen (usulan 7a) dicatat per giliran di berkas `K-xx.md` dan di pustaka rujukan `NASKAH.md`.
- Untuk Pasal 28A–28J, cocokkan bunyi pasal dengan naskah Perubahan Kedua di peraturan.go.id. Naskah gabungan UUD 1945 di JDIH Kemenkeu memuat beberapa salah ketik di Bab XA (misalnya Pasal 28H ayat (2) dan 28I ayat (2)), jadi naskah itu hanya dipakai untuk melihat pasal mana yang pernah diubah.
- Kolom "Teks rujukan" mengikuti usulan 4a. Kolom "Yang dibutuhkan kejadian" adalah isi yang harus ada di pasal itu agar cocok, bukan kutipan bunyi pasal.
- Bila sebuah tautan tidak terbuka, buka https://peraturan.bpk.go.id (Database Peraturan JDIH BPK), lalu ketik jenis, nomor, dan tahunnya di kotak pencarian, misalnya "UU 32 Tahun 2009".

### A. UUD NRI 1945

| Naskah yang dibuka | Tautan | Pasal yang dicek di naskah ini |
|---|---|---|
| Perubahan Kedua (2000) | https://peraturan.go.id/files/UUD+1945+Perubahan+Kedua.pdf | Pasal 28B, 28D, 28E, 28F, 28G, 28H, 28I, dan 28J |
| Perubahan Keempat (2002) | https://jdih.setkab.go.id/PUUdoc/16953/UUD1945PerubahanKeempat.pdf | Pasal 31 |
| Naskah asli 1945 | https://jdih.kemenkeu.go.id/FullText/1945/UUDTAHUN~1945UUD.HTM | Pasal 27 ayat (1) dan Pasal 29 ayat (2) |

| JR | Teks rujukan | Dipakai di | Padanan Sehari | Yang dibutuhkan kejadian |
|---|---|---|---|---|
| JR-01 | Pasal 28B ayat (2) UUD NRI 1945 | K-01, K-03 | R-01 | Perlindungan dan tumbuh kembang Gita (K-01); perlindungan Komang dari kekerasan psikis dan diskriminasi (K-03) |
| JR-02 | Pasal 28E ayat (1) UUD NRI 1945 | K-02 | **baru** | Kebebasan memeluk agama dan beribadat |
| JR-03 | Pasal 29 ayat (2) UUD NRI 1945 | K-02 | **baru** | Jaminan negara atas kemerdekaan beribadat |
| JR-04 | Pasal 28J ayat (1) UUD NRI 1945 | K-02, K-03, K-06, K-08, K-09, K-10, K-12, K-13, K-15, K-16 | R-08 | Kewajiban menghormati hak asasi orang lain |
| JR-05 | Pasal 28G ayat (1) UUD NRI 1945 | K-03, K-07, K-15 | R-03 | Kehormatan dan martabat (K-03, K-15); nama baik dan rasa aman Bayu (K-07) |
| JR-06 | Pasal 31 ayat (1) UUD NRI 1945 | K-04, K-14 | R-04 | Hak atas pendidikan |
| JR-07 | Pasal 28H ayat (2) UUD NRI 1945 | K-04 | **baru** | Kemudahan atau perlakuan khusus agar Raka mendapat kesempatan yang sama |
| JR-08 | Pasal 27 ayat (1) UUD NRI 1945 | K-05 | R-05 | Kewajiban menjunjung hukum, termasuk aturan lalu lintas |
| JR-09 | Pasal 28D ayat (1) UUD NRI 1945 | K-07 | R-09 | Kepastian hukum yang adil dan perlakuan yang sama di hadapan hukum |
| JR-10 | Pasal 28H ayat (4) UUD NRI 1945 | K-08 | **baru** | Hak milik pribadi tidak boleh diambil sewenang-wenang |
| JR-11 | Pasal 28E ayat (3) UUD NRI 1945 | K-09 | R-07 | Kebebasan mengeluarkan pendapat |
| JR-12 | Pasal 28I ayat (2) UUD NRI 1945 | K-10 | **baru** | Bebas dari perlakuan diskriminatif |
| JR-13 | Pasal 28H ayat (1) UUD NRI 1945 | K-11, K-13 | **baru** | Lingkungan hidup yang baik dan sehat (K-11); pelayanan kesehatan (K-13) |
| JR-14 | Pasal 28F UUD NRI 1945 | K-16 | **baru** | Hak berkomunikasi dan memperoleh informasi |
| JR-15 | Pasal 28J ayat (2) UUD NRI 1945 | K-16 | **baru** | Pembatasan hak dengan undang-undang demi hak orang lain dan ketertiban umum |
| JR-23 | Pasal 31 ayat (2) UUD NRI 1945 | K-14 | **baru** | Kewajiban mengikuti pendidikan dasar, dan kewajiban pemerintah membiayainya |

### B. UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014 (Perlindungan Anak)

Tautan: https://peraturan.bpk.go.id/Details/44473/uu-no-23-tahun-2002 · UU 35/2014: https://peraturan.go.id/files/uu35-2014bt.pdf

| JR | Teks rujukan | Dipakai di | Padanan Sehari | Yang dibutuhkan kejadian |
|---|---|---|---|---|
| JR-16 | UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 19 | K-01 | R-02 | Kewajiban anak menghormati orang tua dan menyayangi keluarga |
| JR-17 | UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 11 | K-12 | **baru** | Hak anak beristirahat, bermain, dan bergaul dengan teman sebaya |

Catatan: pastikan apakah Pasal 11 termasuk pasal yang diubah UU 35/2014 (lihat Pasal I UU 35/2014). Menurut catatan R-02, perubahan terakhir UU 23/2002, yaitu UU 17/2016, hanya menyentuh Pasal 81, 81A, 82, dan 82A.

### C. UU No. 22 Tahun 2009 tentang Lalu Lintas dan Angkutan Jalan

Tautan: https://peraturan.bpk.go.id/Details/38654/uu-no-22-tahun-2009 · teks lengkap: https://jdih.kemenkeu.go.id/fullText/2009/22TAHUN2009UU.htm

| JR | Teks rujukan | Dipakai di | Padanan Sehari | Yang dibutuhkan kejadian |
|---|---|---|---|---|
| JR-18 | UU No. 22 Tahun 2009 tentang LLAJ, Pasal 77 ayat (1) dan Pasal 106 ayat (8) | K-05 | R-06 | Wajib punya SIM; pengemudi dan penumpang sepeda motor wajib berhelm |
| JR-19 | UU No. 22 Tahun 2009 tentang LLAJ, Pasal 131 ayat (2) | K-06 | **baru** | Pejalan kaki didahulukan saat menyeberang di tempat penyeberangan |

Catatan: UU 22/2009 pernah diubah lewat UU Cipta Kerja; pastikan Pasal 131 tidak termasuk yang diubah. Catatan R-06 menyebut hal yang sama untuk Pasal 77 dan 106.

### D. UU No. 48 Tahun 2009 tentang Kekuasaan Kehakiman

Tautan: https://peraturan.go.id/files/uu48-2009.pdf · https://peraturan.bpk.go.id/Details/38793/uu-no-48-tahun-2009

| JR | Teks rujukan | Dipakai di | Padanan Sehari | Yang dibutuhkan kejadian |
|---|---|---|---|---|
| JR-20 | UU No. 48 Tahun 2009, Pasal 8 ayat (1) (asas praduga tak bersalah) | K-07 | R-12 | Bayu dianggap tidak bersalah selama belum ada putusan pengadilan |

### E. UU No. 2 Tahun 2002 dan UU No. 5 Tahun 2026 (Kepolisian)

Tautan: https://peraturan.bpk.go.id/Details/44418/uu-no-2-tahun-2002 · UU 5/2026: https://peraturan.bpk.go.id/Details/350096/uu-no-5-tahun-2026

| JR | Teks rujukan | Dipakai di | Padanan Sehari | Yang dibutuhkan kejadian |
|---|---|---|---|---|
| JR-21 | UU No. 2 Tahun 2002 sebagaimana telah diubah terakhir dengan UU No. 5 Tahun 2026, Pasal 13 dan Pasal 14 ayat (1) huruf g | K-07 | R-11 | Polisi menerima laporan dan menyelidiki |

Catatan: menurut catatan R-11 (5 Nov 2026), UU 5/2026 sedang diuji di Mahkamah Konstitusi. Bila kelak dibatalkan, rujukan ini ditinjau ulang.

### F. UU No. 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup

Tautan: https://peraturan.bpk.go.id/Details/38771/uu-no-32-tahun-2009

| JR | Teks rujukan | Dipakai di | Padanan Sehari | Yang dibutuhkan kejadian |
|---|---|---|---|---|
| JR-22 | UU No. 32 Tahun 2009, Pasal 67 | K-11 | **baru** | Kewajiban setiap orang menjaga kelestarian lingkungan dan mencegah pencemaran |

Catatan: halaman JDIH BPK mencatat UU ini diubah lewat UU Cipta Kerja (UU 11/2020, Perppu 2/2022, dan UU 6/2023). Pastikan Pasal 67 tidak termasuk yang diubah.

## Tokoh dan wataknya

Pegangan agar tokoh Sehari Setara muncul dengan watak yang sama (AGENTS bagian 8). Watak diambil dari naskah Sehari Setara, dan ciri visual dari Design System bagian 8. "Muncul di" mengikuti garis besar PRD bagian 10.

| Tokoh | Watak dan ciri tetap | Muncul di | Ada di Design System bagian 8? |
|---|---|---|---|
| Nara | Siswa kelas IX, tokoh utama Sehari Setara; di Jejak Setara menjadi tokoh bukan pemain; tas `sun` bertali `mango` | K-01, K-08 | Ya |
| Ibu | Ibu Nara; pagi-pagi berangkat ke pasar (adegan 1) | K-01 | Ya |
| Gita | Adik Nara, kelas 3 SD (adegan 1) | K-01, K-12 | Ya |
| Dimas | Teman sekelas; menawarkan boncengan tanpa SIM dan helm cadangan, lalu berpikir ulang sesudah diingatkan (adegan 2) | K-02, K-05 | Ya |
| Sinta | Teman sekelas yang aktif berpendapat (adegan 3); berkerudung putih | K-09 | Ya |
| Bu Ratih | Guru BK yang segera menanggapi laporan (adegan 4); batik `teal`, berkacamata | K-03, K-14 | Ya |
| Komang | Adik kelas VII yang pernah ditertawakan dan videonya disebar (adegan 4 dan 6); digambarkan bermartabat, bukan untuk dikasihani | K-03, K-15 | Ya |
| Pak Made | Pemilik warung (adegan 5); kaus `mango`, sarung kotak-kotak | K-02 | Ya |
| Bayu | Pemuda yang baru pindah; dituduh tanpa bukti dan ternyata tidak bersalah (adegan 5); netral dan ramah; kaus `mist` | K-07 | Ya |
| Raka | Teman sekelas berkursi roda | K-04 | Belum; baru ada pose "duduk di kursi roda" dan objek kursi roda |
| Wayan | Teman sekelas yang ingin membantu orang tuanya berdagang | K-14 | Belum |
| Warga umum | Ibu menggendong bayi dan petugas puskesmas (K-13), lansia (K-06), pedagang dan polisi (K-07), anak SD (K-12) | — | Ya |
| Siswa SMP umum | Pengejek (K-03), peserta dan panitia lomba (K-10), remaja piknik (K-11), remaja bermain bola (K-12), teman yang menyerobot antrean (K-13), teman (K-16, mungkin juga K-01) | — | Belum |

## Permintaan untuk Sesi A

| Kode | Berkas | Permintaan | Alasan | Status |
|---|---|---|---|---|
| A-1 | `docs/jejak-setara/Design_System.md` bagian 8 dan `docs/jejak-setara/PRD.md` bagian 15 | Tambahkan ke daftar tokoh bukan pemain: Raka (teman sekelas berkursi roda, K-04), Wayan (teman sekelas, K-14), dan siswa SMP umum untuk K-03, K-10, K-11, K-12, K-13, dan K-16. Ciri visualnya ditetapkan pemilik proyek bersama Sesi C | Garis besar PRD bagian 10 dan naskah K-13 serta K-14 memakai tokoh-tokoh ini, tetapi kedua daftar belum memuatnya | Diajukan |
| A-2 | `docs/jejak-setara/PRD.md` bagian 10 | Samakan teks rujukan di baris K-05 dan K-06 menjadi "UU No. 22 Tahun 2009 tentang LLAJ, …", dan di baris K-07 menjadi "UU No. 48 Tahun 2009, Pasal 8 ayat (1) (asas praduga tak bersalah)" | Agar PRD dan pustaka rujukan memakai teks yang sama (KT-B4 dijawab a) | Diajukan |
| A-3 | `docs/jejak-setara/PRD.md` bagian 10 | Tambahkan "Pasal 28J ayat (1) UUD NRI 1945 (R-08)" ke rujukan usulan baris K-04 | Kewajiban di kartu dampak K-04 perlu rujukan; usulan ada di `K-04.md`, bagian catatan peninjauan | Diajukan (disetujui pemilik proyek, 5 Nov 2026) |
| A-4 | `docs/jejak-setara/PRD.md` bagian 10 | Tambahkan "Pasal 28G ayat (1) UUD NRI 1945 (R-03)" ke rujukan usulan baris K-05 | Hak di kartu dampak K-05 perlu rujukan; adegan 2 Sehari Setara memakai R-03 untuk hak yang sama (lihat `K-05.md`) | Diajukan (disetujui pemilik proyek, 5 Nov 2026) |
| A-5 | `server/jejak-setara/migrations/0001_awal.sql`, `package.json`, serta `.github/workflows/jejak-uji.yml` dan `jejak-produksi.yml` (JS-03) | (1) Tabel `rujukan`, `kejadian`, `kejadian_versi`, `paket`, `paket_kejadian`, dan `pengaturan` memuat kolom yang ditulis semai menurut Architecture 5.2: `rujukan` (`id`, `teks`, `sumber`, `status`, `catatan`, `kode_sehari`), `kejadian` (`kode` unik, `status`, `versi_terbit_id`, `pemilik_id`, `diubah_pada`), `kejadian_versi` (`kejadian_id`, `nomor`, `isi_json`, `jenis`, `dibuat_oleh`, `dibuat_pada`, `catatan_perubahan`), `paket` (`nama` unik, `deskripsi`, `aktif`), `paket_kejadian` (`paket_id`, `kejadian_id`, `urutan`), dan `pengaturan` (`kunci`, `nilai_json`). `kejadian.pemilik_id` dan `kejadian_versi.dibuat_oleh` boleh kosong, karena bank awal tidak punya akun pemilik, dan id `kejadian`, `kejadian_versi`, serta `paket` terisi otomatis. (2) Skrip `db:semai:lokal` yang menjalankan `node scripts/jejak-setara/semai.mjs --lokal`. (3) Langkah "Semai bank awal" sesudah migrasi D1 di kedua alur kerja; langkah ini aman dijalankan di setiap deploy. (4) Bila kolom, nomor versi kerja, atau nama binding D1 berbeda, tulis jawabannya di `PLAN.md`, lalu Sesi B menyesuaikan `semai.mjs` | JS-05 menyiapkan data dan skrip semai, tetapi D1 dan alur kerja dibuat di JS-03 (usulan 7 entri JS-05) | Diajukan |
| A-6 | `app/jejak-setara/assets/manifest.ts` (jawaban Permintaan C-6 Sesi C) | Manifest menyediakan pencarian gambar tokoh dan properti dengan kunci berupa nama berkas tanpa `.png` (misalnya `npc_bayu_bawah_diam`, atau `obj_gerobak` beserta bagian `obj_gerobak_atas`), karena `setTokoh` bank awal memakai kunci itu. Bila bentuk lain dipilih, tulis di `PLAN.md` | Architecture 5.4: set tokoh hanya kunci yang ada di manifest (usulan 4 dan 5 entri JS-05) | Diajukan |
| A-7 | `docs/jejak-setara/Architecture.md` bagian 3, 5.4, dan 10.6 | Sesudah Gerbang 2 JS-05: (1) bagian 3: `inti/konten/periksa.ts` dan kegunaan `semai.mjs`; (2) bagian 5.4: batas yang belum tertulis (teks rujukan ≤ 160 karakter, topik ≤ 40, serta sumber dan catatan rujukan) dan arti set tokoh sesuai usulan 4 yang dipilih; (3) bagian 10.6: bank awal disemai sekali per basis data dengan penanda `semai_bank_awal` | Agar dokumen utama sama dengan spesifikasi JS-05 | Diajukan |
| A-8 | `docs/jejak-setara/PRD.md` bagian 10, 20, dan 21 | (1) Catat KT-10 dijawab pemilik proyek (7 Nov 2026): K-02 memakai versi A (umum, tanpa menyebut hari suci tertentu). (2) Bila usulan 6a entri JS-05 dipilih, tambahkan di "Aturan menulis kejadian": latar situasi harus ada di semua titik kejadian zonanya | Keputusan pemilik proyek di awal Plan JS-05; usulan 6 entri JS-05 | Diajukan |
| A-9 | Plan JS-08 dan JS-10 | Rencanakan uji kejadian dan ruang kelas dengan ruang uji atau data uji. Kejadian bank awal baru bisa terbit sesudah Peninjau memverifikasi ke-23 rujukannya di konsol (JS-12) | AGENTS bagian 8 dan JFR-43; risiko di entri JS-05 | Diajukan |

## Untuk Sesi C (diteruskan pemilik proyek)

- O-42 (`obj_sanggah`) tidak diperlukan: KT-10 dijawab versi A (7 Nov 2026).
- Bila usulan 4a entri JS-05 dipilih: lapak (K-07) dan pos keamanan (K-08) menjadi objek peta Z4, bukan bagian set kejadian, dan K-12 memakai satu anak SD selain Gita.
- Bila usulan 6a entri JS-05 dipilih: titik kejadian setiap zona di JS-06 ditata sesuai tabel latar di usulan 6, terutama Z3, Z6, dan Z7.

## Catatan untuk JS-05

- JS-05 dimulai 7 Nov 2026, sesudah pemilik proyek mengabarkan bahwa JS-02 selesai.
- Batas berkas JS-05 dari pemilik proyek (7 Nov 2026): `docs/jejak-setara/naskah/`, `app/jejak-setara/inti/konten/`, `server/jejak-setara/seed/`, `scripts/jejak-setara/semai.mjs`, dan berkas berawalan `naskah-` atau `bank-` di `app/jejak-setara/__tests__/konten/`. Sesi C juga menaruh uji peta di folder itu. Perubahan pada berkas lain ditulis di "Permintaan untuk Sesi A".

## Ringkasan akhir tahap naskah (5 November 2026)

| | |
|---|---|
| Naskah disetujui | 16 dari 16 (K-01 sampai K-16), dalam 8 giliran |
| Pustaka rujukan | 23 rujukan (JR-01 sampai JR-23), semuanya terpakai dan berstatus perlu verifikasi |
| Rujukan baru yang dipra-periksa | 12 rujukan: sepuluh dari naskah resmi, dua dari sumber sekunder (JR-19 dan JR-22) |
| Tambahan rujukan yang disetujui | JR-04 di K-04 (Permintaan A-3) dan JR-05 di K-05 (Permintaan A-4) |
| Peninjauan khusus | K-02 (agama), K-04 (disabilitas), dan K-10 (suku) disetujui; versi situasi K-02: versi A (dipilih 7 Nov 2026) |
| Panjang pilihan (KT-B6) | Pilihan benar tidak pernah menjadi yang terpanjang di Langkah 1 (0 dari 16). Pilihan tepat menjadi yang terpanjang di Langkah 2 tiga kali, masing-masing selisih satu karakter |
| Tokoh dan properti | Tabel per kejadian ada di `NASKAH.md`, sebagai masukan bagi Sesi C |

## Yang masih ditunggu

| No. | Hal | Siapa | Keterangan |
|---|---|---|---|
| 1 | `Setuju: JS-05`, boleh dengan pilihan per usulan | Pemilik proyek | Termasuk izin tempat spesifikasi dan laporan uji (usulan 10) |
| 2 | Permintaan A-1 sampai A-9 | Sesi A | Dibaca Sesi A dari berkas ini pada Plan berikutnya. A-5 diperlukan sebelum semai bisa dijalankan di D1 |
| 3 | Membaca langsung JR-19 dan JR-22 di naskah resmi | Pemilik proyek | Pra-pemeriksaan keduanya memakai sumber sekunder. Pastikan juga keduanya tidak diubah UU Cipta Kerja; catatan R-06 meminta hal yang sama untuk JR-18 |
| 4 | Tanda "Terverifikasi" untuk 23 rujukan | Peninjau, di konsol (JS-12) | Bank awal disemai dengan semua rujukan berstatus `belum` |
| 5 | Pesan untuk Sesi C | Pemilik proyek | Teruskan bagian "Untuk Sesi C" sebelum Sesi C menata titik kejadian di peta JS-06 |

## Cara membalas

- Bila semua saran (a) diterima, cukup tulis "Setuju: JS-05".
- Bila memilih alternatif, sebutkan nomor usulannya, misalnya "Setuju: JS-05, usulan 4b, usulan 10b".
- Revisi atau pertanyaan cukup ditulis bebas.
