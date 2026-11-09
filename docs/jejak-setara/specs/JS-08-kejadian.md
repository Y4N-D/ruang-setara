# JS-08 — Kejadian

| | |
|---|---|
| Status | Ditulis 9 November 2026 di tahap Specify, sesudah balasan `Setuju: JS-08` (semua saran a, usulan 1 sampai 10; KT-13 dijawab sesuai usulan 7a). Menunggu `Spesifikasi disetujui: JS-08` beserta pilihan DRAF D-1 sampai D-6. Build menunggu JS-05 Selesai |
| Rencana | `PLAN.md`, bagian "JS-08 — Kejadian" |
| Sesi | Sesi A (mesin) |
| Bergantung pada | JS-07 (Selesai, 9 Nov 2026) dan JS-05 (Sesi B; Revisi 1 belum disetujui) |

## Ringkasan

JS-08 menghidupkan kejadian di kampung Nara. Ruang coba memuat Paket inti 16 dari D1, lalu server menempatkan setiap kejadian di titik zonanya: satu titik, atau dua titik di ruang lebih dari 50 pemain. Kejadian yang masuk pandangan pemain tampil sebagai penanda "!" dengan tokoh dan propertinya. Pemain yang cukup dekat bisa memeriksa kejadian dan menjawab dialog dua langkah dengan tombol "Kunci jawaban", lalu membaca kartu dampak. Server menghitung skor dan peringkat, dan setiap pemain melihat skor serta peringkatnya sendiri di bilah atas dan di layar "Ronde selesai". Jawaban disimpan di Durable Object dan dikirim ke D1.

Protokol naik ke versi 2. Bank awal disemai di D1 lokal dan D1 lingkungan uji (Permintaan A-5). Ambang kinerja otomatis AC-19 diganti, dan layar pemain bisa menampilkan angka fps untuk uji manual.

Skill, kotak bantuan, layar kelas, rekap berisi daftar kejadian, konsol, dan suara **tidak** termasuk (bagian "Di luar cakupan").

## Kaitan PRD

| Kebutuhan | Dipenuhi oleh |
|---|---|
| JFR-15: penempatan per ruang, sama untuk semua pemain; penanda "!" saat tampak; periksa bila dekat | P-1 sampai P-25 |
| JFR-16: dialog dua langkah dan kartu dampak | P-38 sampai P-46 |
| JFR-17: pilih lalu kunci dengan tombol atau `Enter` | P-43, P-45, P-49 |
| JFR-18: sekali per pemain, jawaban pertama dihitung, tanda ✓ | P-31, P-32, P-16, P-18 |
| JFR-19: skor dihitung server (40, 60, 25, 0) | P-31, P-32, P-55 |
| JFR-20: peringkat; pemain melihat skor dan peringkatnya sendiri | P-55 sampai P-59 |
| JFR-21: urutan pilihan diacak per pemain, huruf mengikuti urutan tampil | P-29, P-41 |
| JFR-22: jam ronde tetap berjalan, tanpa batas waktu per kejadian | P-51, P-57 |
| JFR-11 (bagian kejadian): penanda kejadian yang sudah terlihat di peta mini dan peta besar | P-18, P-19 |
| PRD 8.3: dua titik di ruang lebih dari 50 pemain; KT-13 | P-8, P-9, P-28, P-33 |
| PRD 12: ≥ 30 fps di HP kelas bawah; ≤ 3 MB per pemain per ronde | AC-19, AC-20 |

## Berkas yang dibuat dan diubah

| Berkas | Baru/Diubah | Isi |
|---|---|---|
| `app/jejak-setara/inti/versi.ts` | Diubah | `PROTOKOL_VERSI` 2 (P-64) |
| `app/jejak-setara/inti/protokol.ts` | Diubah | `setTokoh` di `kejadian_terlihat`; unsur `dialog` di butir `dunia` (P-64) |
| `app/jejak-setara/inti/aturan.ts` | Diubah | `tempatkanKejadian` dengan `jumlahTitik` (P-8) |
| `app/jejak-setara/inti/tipe.ts` | Diubah | Tipe `KejadianRuang` (isi, versi, rujukan, titik) |
| `server/jejak-setara/src/ruang/kejadian-ruang.ts` | Baru | Logika murni: penempatan ruang, keterlihatan, urutan dan id pilihan, kunci, poin, peringkat, isi pesan (P-8 sampai P-37, P-55, P-56) |
| `server/jejak-setara/src/db/konten.ts` | Baru | Membaca paket, versi `kerja`, dan teks rujukan dari D1 (P-1, P-2) |
| `server/jejak-setara/src/ruang/inti-ruang.ts` | Diubah | Pesan kejadian, putaran, `pribadi`, `selesai`, sambung ulang, tanda dialog di `dunia` |
| `server/jejak-setara/src/ruang/RuangJejak.ts` | Diubah | Tabel `kejadian`, `jawaban`, `terlihat`, dan `antrean`; lampiran dialog; pemulihan (P-60 sampai P-63) |
| `server/jejak-setara/src/api/ruang.ts` | Diubah | Ruang coba memuat paket (P-1 sampai P-5); kait uji lokal `kejadian` dan `pindahkan` (P-66, P-67) |
| `server/jejak-setara/src/db/ruang.ts` | Diubah | `paket_id` ruang coba; kiriman `jawaban` dan urutan kirim (P-62) |
| `app/jejak-setara/bersama/BingkaiPiksel.tsx`, `TombolPilihan.tsx`, `DialogKejadian.tsx`, `KartuDampak.tsx` | Baru | Komponen dialog, juga untuk pratinjau konsol di JS-12 (P-38 sampai P-50) |
| `app/jejak-setara/bersama/dialogKeadaan.ts` | Baru | Keadaan dialog murni: tampilan, pilihan, masa tunggu 600 ms, mode ringkas (P-38, P-39, P-48) |
| `app/jejak-setara/pemain/TombolPeriksa.tsx` | Baru | Tombol Periksa dan ajakan `E` (P-21 sampai P-24) |
| `app/jejak-setara/pemain/dunia/kejadian.ts` | Baru | Keadaan kejadian di klien, tata letak tokoh, jangkauan (P-14, P-21) |
| `app/jejak-setara/pemain/dunia/penggambar.ts`, `aset.ts`, `mesin.ts`, `pemainLain.ts` | Diubah | Penanda, tokoh dan properti, gelembung "…", tanda dialog dari `dunia` (P-15 sampai P-17) |
| `app/jejak-setara/pemain/LayarDunia.tsx`, `BilahAtas.tsx`, `PetaMini.tsx`, `PetaBesar.tsx`, `LayarRonde.tsx`, `App.tsx`, `jaringan.ts` | Diubah | Dialog, skor dan peringkat, penanda peta, layar selesai, pesan baru, fps (P-18, P-19, P-51 sampai P-59, P-70) |
| `app/jejak-setara/teks.ts`, `app/jejak-setara/styles/jejak.css` | Diubah | Teks final dan gaya dialog |
| `package.json` | Diubah | Hanya skrip `db:semai:lokal` (P-7); dependensi dan lockfile tidak berubah |
| `scripts/jejak-setara/server-lokal.mjs` | Diubah | Semai sesudah migrasi (P-7) |
| `.github/workflows/jejak-uji.yml` | Diubah | Langkah "Semai bank awal" di job "Deploy uji" (P-7) |
| `.github/workflows/jejak-ruang-coba.yml` | Diubah | Jumlah kejadian di ringkasan (P-6) |
| `scripts/jejak-setara/simulasi-beban.mjs` | Diubah | Bot memeriksa dan menjawab (P-71) |
| Uji: `app/jejak-setara/__tests__/inti/`, `__tests__/ruang/`, `__tests__/dunia/`, `__tests__/bersama/`, `server/jejak-setara/uji/kejadian.uji-server.ts`, `e2e/jejak-setara/kejadian.uji.ts`, `e2e/jejak-setara/dunia.uji.ts` | Baru dan diubah | Rencana uji; ambang kinerja baru (P-69) |
| `docs/jejak-setara/Architecture.md` (3, 5.3, 6.2, 6.3, 6.5, 6.9, 7, 8.3, 8.4, 8.6, 9, 10.2, 14), `Design_System.md` (3.3, 3.5, 7, 11), `PRD.md` (8.3, 20, 21) | Diubah | Sesuai keputusan Gerbang 1 (ikut ZIP Gerbang 2 ini) |

Tidak disentuh: kode dan dokumen Sehari Setara, galeri, `deploy-pages.yml`, `server/jejak-setara/wrangler.jsonc`, migrasi D1, berkas Sesi B (`naskah/`, `inti/konten/`, `seed/`, `semai.mjs`, uji `bank-` dan `naskah-`), dan berkas Sesi C (aset, `manifest.ts`, peta).

## Perilaku

Istilah: **titik aktif** adalah titik peta yang dipakai sebuah kejadian di ruang ini. **Pusat titik** (x, y dalam ubin) adalah piksel logis (16x + 8, 16y + 8). **Posisi pemain** adalah titik kaki, seperti di JS-07. `kejadianId` di protokol adalah kode kejadian, misalnya `K-13`.

### Isi kejadian di ruang coba (usulan 2)

- **P-1. Sumber.** Ketika `POST /api/ruang-coba` membuat ruang (lingkungan `lokal` dan `uji`), Worker membaca dari D1 paket berid `9880c4d5-8294-51c9-971a-e95531a2e039` (Paket inti 16; sama dengan `idPaket("Paket inti 16")` di `semai.mjs`). Yang dibaca: kejadian paket yang aktif dan tidak berstatus `arsip`, berurutan menurut `paket_kejadian.urutan`, masing-masing dengan versi `kerja`-nya, ditambah teks semua rujukan yang dipakai. Ruang coba adalah ruang uji (`pengaturan.uji` benar), sehingga boleh memakai kejadian yang belum terbit (Architecture 7, JFR-47).
- **P-2. Pemeriksaan.** Setiap `isi_json` diperiksa dengan `skemaIsiKejadian` (JS-05), dan setiap id rujukannya harus punya teks. Kejadian yang tidak lolos dilewati. Kejadian yang zonanya tidak punya cukup titik lagi (P-8) juga dilewati, mengikuti urutan paket.
- **P-3. Ruang dan Durable Object.** `ruang.paket_id` berisi id paket bila sedikitnya satu kejadian termuat; bila tidak, kosong. Isi permintaan `/inisialisasi` ditambah `kejadian`: larik `{ kode, versiId, isi, rujukan }`, dengan `rujukan` berupa teks menurut urutan `kartu.rujukan`. Durable Object menyimpannya bersama titik aktifnya (P-9, P-60).
- **P-4. Jawaban API.** `201` dengan `{ ruangId, kode, tautan, kejadian }`, dengan `kejadian` berupa jumlah kejadian yang termuat.
- **P-5. Tanpa bank awal.** Bila paket tidak ada atau tidak ada kejadian yang sah, ruang tetap dibuat dengan `kejadian` 0 dan berjalan seperti JS-07, tanpa penanda.
- **P-6. Ringkasan "Jejak: ruang coba".** Ringkasan alur kerja ditambah "Kejadian di ruang: {n}". Bila n = 0, yang tertulis adalah teks peringatan di bagian "Teks yang tampil".
- **P-7. Semai bank awal (Permintaan A-5).** Ada tiga tempat semai:
  - skrip `db:semai:lokal` = `node scripts/jejak-setara/semai.mjs --jalankan -- --local --persist-to .wrangler/state`, dijalankan sesudah `db:migrasi:lokal`;
  - `scripts/jejak-setara/server-lokal.mjs` menjalankan semai ke folder keadaan yang sama sesudah migrasi;
  - job "Deploy uji" di `jejak-uji.yml` mendapat langkah "Semai bank awal" tepat sesudah "Migrasi D1 uji", dengan syarat yang sama (`steps.rahasia.outputs.siap == 'ya'`), berisi `node scripts/jejak-setara/semai.mjs --jalankan -- --remote --env uji`.
  
  Semai hanya berlaku sekali per basis data (JS-05, P-28). Agen tidak pernah menjalankan semai `--remote` (P-34 JS-05).

### Penempatan

- **P-8. `tempatkanKejadian`.** Mendapat parameter keempat `jumlahTitik` (1 atau 2, bawaan 1). Dengan 1, hasilnya sama persis dengan JS-02. Dengan 2, kejadian tetap diproses menurut kode, calon titik dikocok dengan `kocok(calon, benih(benihRuang, kode))`, lalu dua calon pertama menjadi `titik` dan `titikKedua`. Keduanya ditandai terpakai. Bila calon kurang dari `jumlahTitik`, fungsi melempar `TITIK_TIDAK_CUKUP`.
- **P-9. Penempatan ruang.** Saat inisialisasi, ruang memakai `jumlahTitik` 2 bila `pengaturan.batasPemain` lebih dari 50, dan 1 bila tidak, dengan benih ruang. Hasilnya disimpan di tabel `kejadian` dan sama bagi semua pemain. Titik aktif tidak pernah dikirim sebelum terlihat (Architecture 8.3).

### Keterlihatan

- **P-10. Pemeriksaan.** Hanya di status `main`. Pada setiap putaran 100 ms, untuk setiap pemain berkeidentitas yang tersambung dan punya posisi, setiap titik aktif yang belum terlihat olehnya diperiksa dengan `terlihatDiLayar(posisi, pusat titik, 2560, 1600)`.
- **P-11. Terlihat.** Titik yang baru terlihat dicatat di tabel `terlihat`, lalu pemain itu menerima `kejadian_terlihat { kejadianId, x, y, setTokoh }`, satu pesan per titik. Kejadian dengan dua titik bisa menghasilkan dua pesan dengan `kejadianId` yang sama.
- **P-12. Kirim ulang.** Sesudah `koreksi` posisi awal (sambung ulang di status `main` atau `jeda`), server mengirim ulang `kejadian_terlihat` untuk setiap titik yang sudah terlihat (urut kode lalu id titik), lalu `pribadi`.
- **P-13. Pengumuman.** Saat sebuah kejadian pertama kali terlihat, klien mengumumkan "Kejadian baru terlihat." lewat wilayah `aria-live` yang ada, dengan jarak minimal 2 detik antarpengumuman.

### Tokoh, properti, dan penanda di dunia

- **P-14. Tata letak (usulan 4a).** `tataLetakKejadian(setTokoh, OBJEK)` di `pemain/dunia/kejadian.ts` menghasilkan letak setiap kunci di ruang 3 × 3 sekitar titik (dx dan dy −1, 0, atau 1 dari sel titik):
  - **Properti** (`obj_…`, jejak kaki dari `OBJEK`) diletakkan lebih dulu, yang terluas lebih dulu (seri menurut urutan kunci). Calon sel kiri-atasnya diperiksa berurutan: 3 × 1: (−1, −1). 2 × 1: (−1, −1), (0, −1), (−1, 1), (0, 1). 1 × 2: (1, −1), (−1, −1). 2 × 2: (0, −1), (−1, −1). 1 × 1: (0, −1), (−1, −1), (1, −1), (−1, 1), (1, 1).
  - Satu calon sah bila semua selnya di dalam 3 × 3, belum dipakai properti lain, dan tidak memuat sel titik (0, 0). Pengecualiannya properti 2 × 2, yang selalu memuat sel titik. Properti yang tidak mendapat tempat tidak digambar.
  - **Tokoh** (`npc_…`) diletakkan menurut urutan kunci di sel pertama yang bebas dari tokoh lain dan dari properti, dengan urutan (−1, 0), (1, 0), (0, −1), (−1, −1), (1, −1). Bila tidak ada, dipakai sel pertama dengan urutan yang sama yang hanya tertutup properti setinggi 1 ubin, sehingga tokoh tampak berdiri di depan properti. Bila masih tidak ada, tokoh tidak digambar.
  - Uji memastikan ke-16 set bank awal tergambar lengkap.
- **P-15. Menggambar tokoh dan properti.** Digambar di setiap titik yang sudah terlihat, dan tetap ada sesudah kejadian selesai.
  - Tokoh: berdiri dengan titik kaki (16(x+dx) + 8, 16(y+dy) + 12) memakai `kakiX` dan `kakiY` dari `NPC`. Diam 2 bingkai, 2 fps menurut jam lokal; dengan "kurangi gerak", bingkai pertama saja. Tokoh diurutkan bersama avatar menurut y kaki.
  - Properti: digambar seperti objek peta (aturan JS-06, "Cara layar pemain menggambar") dengan sel kiri-atas jejak kakinya. Bagian bawahnya digambar sesudah lapis bawah potongan, dan bagian atasnya (bila ada) sesudah lapis atas, seperti gerbang lobi JS-07.
  - Tokoh dan properti **bisa dilewati**: tidak masuk grid tabrakan, di klien maupun server.
- **P-16. Penanda kejadian.** Untuk setiap titik yang terlihat, penanda dipilih menurut keadaan kejadian bagi pemain ini:
  - selesai: `tanda_selesai`;
  - dialognya sedang terbuka di layar ini: `tanda_dibuka`;
  - selain itu: `tanda_kejadian`, termasuk kejadian yang Langkah 1-nya sudah dikunci (KT-13).
  
  Penanda berpusat mendatar di pusat titik, dengan tepi bawah di y = 16y − 2. `tanda_kejadian` naik 1 piksel pada setiap bingkai kedua (2 bingkai, 0,5 detik); dengan "kurangi gerak" penanda diam. Penanda diurutkan di lapisan tokoh dengan y = 16y + 16.
- **P-17. Gelembung "…" pemain lain.** Pemain lain yang butir `dunia` terakhirnya bertanda `dialog` digambar dengan `tanda_dibuka` di atas kepalanya, dengan tepi bawah di y kaki − 22, di lapisan 50 (efek), memakai posisi interpolasi. Pemain sendiri tidak mendapat gelembung, karena penandanya sudah berganti (P-16).
- **P-18. Peta mini.** Setiap titik yang terlihat ditandai `ikon_mini_kejadian`, atau `ikon_mini_selesai` bila kejadiannya selesai (7 × 7 px), berpusat di posisi titik pada peta mini. Yang selesai digambar lebih dulu.
- **P-19. Peta besar.** Penanda yang sama, berukuran 14 × 14 px. Di bawah judul tertulis "Kejadian terlihat {n}, selesai {m}." dengan n jumlah kejadian yang punya sedikitnya satu titik terlihat dan m jumlah kejadian selesai.
- **P-20. Atribut uji kanvas dunia.** Ditulis setiap 500 ms bersama atribut JS-07:
  - `data-kejadian`: jumlah titik yang terlihat;
  - `data-selesai`: jumlah kejadian selesai;
  - `data-jangkauan`: `kejadianId` dalam jangkauan, atau kosong;
  - `data-dialog-lain`: jumlah gelembung pemain lain yang tergambar;
  - `data-tokoh-kejadian`: jumlah tokoh dan properti kejadian yang tergambar.

### Periksa

- **P-21. Dalam jangkauan.** Sebuah kejadian dalam jangkauan bila jarak posisi pemain sendiri yang tampil ke pusat salah satu titiknya yang terlihat ≤ 24 piksel logis. Kejadiannya harus belum selesai. Bila lebih dari satu, dipilih yang terdekat, lalu kode terkecil. Syarat lain: status `main`, tidak ada dialog, dan tidak ada lapisan menyambung, peta besar, ajakan putar, atau jeda.
- **P-22. Tombol Periksa (perangkat sentuh).** Bulat 64 × 64 px, 16 px dari tepi kanan dan bawah dunia, dengan ruang kosong di atasnya untuk tombol skill JS-09. Tiga keadaan:
  - Biasa: `mist` dengan teks `dusk` "Periksa", `aria-disabled="true"`, dan label "Periksa. Dekati penanda kejadian dulu."
  - Dalam jangkauan: `sun` dengan teks `ink`, label "Periksa kejadian".
  - Ditekan: bergeser 2 px.
  
  Tombol tersembunyi di lobi, selama dialog, dan di bawah lapisan.
- **P-23. Ajakan `E` (tanpa layar sentuh).** Selama ada kejadian dalam jangkauan, pita kecil di tengah bawah dunia (16 px di atas tepi bawah) menampilkan tombol `E` dan "Periksa". `E` atau `Enter` pada dunia yang terfokus mengirim periksa, juga di perangkat sentuh yang berpapan ketik.
- **P-24. Mengirim.** Klien menghentikan pemain sendiri. Bila sedang berjalan, laporan berhenti (`gerak`, `jalan: false`) dikirim lebih dulu, lalu `periksa { kejadianId }`. Tombol tampak ditekan sampai `kejadian_terbuka` tiba, paling lama 2 detik.
- **P-25. Pengumuman jangkauan.** Saat sebuah kejadian masuk jangkauan, klien mengumumkan "Kejadian di dekatmu. Tekan E atau tombol Periksa." sekali. Pengumuman ini aktif lagi sesudah pemain keluar jangkauan, dengan jarak 2 detik antarpengumuman.

### Dialog di server

- **P-26. `periksa` diterima** bila semua syarat ini terpenuhi:
  - status `main` dan jam server sebelum `berakhirPada`;
  - pemain berkeidentitas dan punya posisi;
  - kejadian ada dan belum selesai bagi pemain itu;
  - tidak ada dialog lain yang terbuka;
  - jarak posisi server ke pusat salah satu titik aktif ≤ 32 piksel logis (`JANGKAUAN_PERIKSA_PX`).
  
  Bila dialog kejadian yang sama sudah terbuka, pesan pembukaan dikirim ulang (P-28). Bila hanya jaraknya yang terlalu jauh, server mengirim `galat BUKAN_JANGKAUAN` dan `koreksi` berisi posisi sah terakhir. Pesan yang tidak memenuhi syarat lain diabaikan.
- **P-27. Pembukaan pertama.** Membuat baris `jawaban` berstatus `langkah1` dengan `dibuka_pada` jam server, urutan, dan id pilihan (P-29). Bila titik itu belum tercatat terlihat, `kejadian_terlihat` dikirim lebih dulu.
- **P-28. Pesan pembukaan.** `kejadian_terbuka { kejadianId, judul, situasi, setTokoh, pertanyaan1, opsi1, langkah }`, dengan `opsi1` menurut urutan pemain dan id pemain. `langkah` bernilai 1 bila status jawaban `langkah1`. Bila statusnya `langkah2` (KT-13), `langkah` bernilai 2 dan pesan itu langsung diikuti ulangan `hasil_1` yang sama dengan aslinya.
- **P-29. Urutan dan id pilihan.** `urutan1 = kocok([0, 1, 2, 3], benih(benihRuang, pemainId, kode, "1"))` dan `urutan2 = kocok([0, 1, 2], benih(benihRuang, pemainId, kode, "2"))`. Unsur ke-p adalah indeks pilihan di isi kejadian yang tampil di posisi p. Tujuh id (4 dan 3) masing-masing 8 karakter `a-z0-9`, diambil dari `acakBerbenih(benih(benihRuang, pemainId, kode, "id"))`; id yang kembar diambil ulang. Urutan dan id disimpan di `jawaban`. Benih ruang tidak pernah dikirim ke klien.
- **P-30. Satu dialog per pemain.** Dialog yang terbuka (kode dan langkah) disimpan di memori dan di lampiran sambungan (`serializeAttachment`), bukan di SQLite. Selama terbuka:
  - butir `dunia` pemain itu bertanda `dialog`, dan perubahan tanda ini dihitung sebagai perubahan butir;
  - `gerak` pemain itu ditolak dengan alasan `dialog` (`periksaGerak`, JS-02).
- **P-31. `kunci_1` diterima** bila dialog kejadian itu terbuka di Langkah 1 (status `langkah1`), `opsiId` adalah id Langkah 1 milik pemain, status `main`, dan jam server sebelum `berakhirPada`. Akibatnya:
  - `jawaban` mencatat id asli pilihan (`1a`–`1d`), `langkah1_benar`, poin 40 atau 0, dan `langkah1_pada`, lalu berstatus `langkah2`;
  - dialog pindah ke Langkah 2, dan skor diperbarui (P-55);
  - server mengirim `hasil_1 { benar, opsiBenar, umpanBalik, umpanBalikBenar?, poin, pertanyaan2, opsi2 }`, lalu `pribadi`. `umpanBalik` milik pilihan pemain; `umpanBalikBenar` milik pilihan benar dan hanya ada bila pemain keliru.
  
  `kunci_1` berikutnya untuk kejadian yang sama diabaikan.
- **P-32. `kunci_2` diterima** dengan syarat yang sama untuk Langkah 2 (status `langkah2`). Akibatnya:
  - `jawaban` mencatat id asli (`2a`–`2c`), tingkat, `langkah2_pada`, poin total (Langkah 1 + Langkah 2), dan status `selesai`;
  - server mengirim `hasil_2 { tingkat, poin, terjadi, opsiTepat, kartu }`, lalu `pribadi`. `poin` adalah poin Langkah 2 (60, 25, atau 0), `opsiTepat` berisi id pemain untuk semua pilihan bertingkat tepat, dan `kartu.rujukan` berisi teks rujukan.
  
  Dialog tetap terbuka (kartu dampak) sampai ditutup.
- **P-33. `tutup_dialog`** untuk dialog yang terbuka menutupnya tanpa mengubah jawaban. Kejadian berstatus `langkah2` tetap menunggu Langkah 2 (KT-13). Pesan untuk kejadian lain diabaikan.
- **P-34. Jeda.** Selama `jeda`, `periksa`, `kunci_1`, dan `kunci_2` diabaikan. Dialog yang terbuka tetap terbuka.
- **P-35. Akhir ronde.** Saat ronde selesai, semua dialog ditutup, dan langkah yang belum dikunci tidak dihitung. Server menghitung peringkat akhir, mengirim `selesai { skor, peringkat, jumlahPemain, rekap: [] }` ke setiap pemain berkeidentitas yang tersambung, dan mengantrekan baris peserta beserta `peringkat_akhir`. `jumlahPemain` adalah jumlah pemain berkeidentitas yang tidak dikeluarkan.
- **P-36. Putus dan sambung ulang.** Sambungan putus menutup dialog pemain itu, tetapi status jawabannya tetap. Sambung ulang di `main` atau `jeda` mengikuti P-12. Sambung ulang di `selesai` atau `pembahasan` menerima `selesai` lagi.
- **P-37. Dikeluarkan.** Pemain yang dikeluarkan kehilangan dialognya dan tidak masuk peringkat. Jawabannya tetap tersimpan dan terkirim ke D1.

### Dialog di layar pemain

- **P-38. Komponen.** Tampilan ada di `bersama/DialogKejadian.tsx`, `TombolPilihan.tsx`, `KartuDampak.tsx`, dan `BingkaiPiksel.tsx`. Keadaan dan aturannya ada di `bersama/dialogKeadaan.ts` (modul murni yang diuji di Node): tampilan aktif, pilihan, masa tunggu, dan mode ringkas. Komponen hanya membaca keadaan itu, sehingga pratinjau konsol JS-12 bisa memakainya.
- **P-39. Ukuran, letak, dan mode.**
  - **Area dialog** adalah pandangan dunia di bawah bilah atas: tinggi dunia − 28 px.
  - **Mode ringkas** dipakai bila tinggi area dialog kurang dari 560 px CSS; selain itu mode penuh. Contoh: HP 731 × 411 dan laptop dengan dunia 960 × 540 memakai mode ringkas; 1280 × 720 dan 1920 × 1080 memakai mode penuh.
  - **Bentuk:** di perangkat sentuh dengan tinggi tampilan ≤ 500 px, dialog berupa lembar yang menutupi seluruh area dialog, dengan ukuran huruf kolom HP Design System 5. Selain itu dialog berupa panel selebar 70% dunia, berpusat mendatar dan tegak di area dialog, paling tinggi area − 24 px, dengan ukuran huruf kolom laptop.
  - **Bingkai:** bingkai piksel Sehari Setara, dengan 1 piksel antarmuka = 2 px CSS di semua layar pemain. Bilah atas tetap tampil di atas dialog.
- **P-40. Kepala.** Berisi ikon zona (`ikon_zona_n`, 28 px di HP dan 32 px di laptop), judul kejadian (Press Start 2P), dan chip "Langkah n dari 2".
- **P-41. Langkah 1, mode penuh.**
  - Isi: kotak situasi (latar `white`, garis `ink` 2 px), pertanyaan (`dusk`), lalu empat pilihan dalam kisi 2 × 2 berhuruf A–D menurut urutan tampil.
  - Kaki: "Tutup" di kiri dan "Kunci jawaban" di kanan. "Kunci jawaban" `mist` dengan `aria-disabled` sampai ada pilihan, lalu `sun`.
- **P-42. Langkah 1, mode ringkas.** Terdiri dari dua tampilan:
  - **Situasi:** situasi dan pertanyaan, dengan kaki "Tutup" dan "Lihat pilihan".
  - **Pilihan:** pertanyaan dan keempat pilihan, dengan kaki "Tutup", "Situasi", dan "Kunci jawaban".
  
  "Situasi" kembali ke tampilan Situasi tanpa menghapus pilihan, dan "Lihat pilihan" kembali ke tampilan Pilihan.
- **P-43. Memilih dan mengunci.** Mengetuk atau mengeklik pilihan, atau menekan `1`–`4`, memilihnya: latar `sun`, tanda ▶ di depan huruf, cincin dalam `white`, dan `aria-pressed="true"`. Pilihan bisa diganti sampai dikunci. "Kunci jawaban", atau `Enter` saat ada pilihan, mengirim `kunci_1`. Semua tombol dialog nonaktif sampai `hasil_1` tiba.
- **P-44. Umpan balik.** Sesudah `hasil_1`:
  - Mode penuh: keempat pilihan terkunci. Pilihan benar `leaf` berlabel "Jawaban tepat", pilihan pemain yang keliru `mango` berlabel "Pilihanmu", dan sisanya `mist` dengan teks `dusk`.
  - Pita di bawah pilihan, bila benar: `leaf`, ikon hati, "Tepat" dan "+40" (D-1), lalu umpan balik pilihan itu. Bila keliru: `mango`, ikon tanda tanya, "Belum tepat", lalu umpan balik pilihan pemain dan umpan balik pilihan benar (D-2).
  - Mode ringkas: pita, ditambah pilihan pemain dan pilihan benar saja (satu pilihan bila benar). Isinya boleh digulir, dan kakinya tetap.
  - Kaki: "Tutup" dan "Lanjut ke Langkah 2".
- **P-45. Langkah 2.** Chip "Langkah 2 dari 2".
  - Mode penuh: situasi, pertanyaan, dan tiga pilihan bersusun berhuruf A–C.
  - Mode ringkas: pertanyaan dan tiga pilihan, dengan kaki "Tutup", "Situasi", dan "Kunci jawaban". "Situasi" menampilkan situasi dengan tombol "Lihat pilihan".
  
  Memilih dan mengunci seperti P-43, dengan `1`–`3`, dan mengirim `kunci_2`.
- **P-46. Kartu dampak.** Sesudah `hasil_2`:
  - **Kepala** berwarna tingkat (`leaf` tepat, `mango` kurang tepat, `coral` berisiko). Isinya ikon emosi (hati, tetes keringat, atau tanda seru, 8 × 8 diperbesar ×2), tulisan tingkat (Press Start 2P), dan "+{poin}" di kanan bila poin lebih dari 0 (D-1).
  - **Bagian:** "Yang terjadi", "Hak yang terdampak", "Kewajiban terkait", "Pilihan yang tepat" (hanya bila tingkat bukan tepat, berisi teks pilihan di `opsiTepat`; D-3), dan "Rujukan" berupa daftar. Di ruang uji, daftar rujukan diikuti catatan D-4.
  - **Susunan:** mode penuh memakai dua kolom 1,1 : 1 (kiri empat bagian pertama, kanan rujukan). Mode ringkas memakai satu kolom yang boleh digulir.
  - **Kaki:** "Lanjut menjelajah" di kanan, yang mengirim `tutup_dialog` dan menutup dialog.
- **P-47. Menutup.** "Tutup" atau `Esc` di tampilan mana pun mengirim `tutup_dialog` dan menutup dialog, lalu fokus kembali ke dunia. `hasil` yang tiba sesudah dialog ditutup hanya memperbarui keadaan kejadian.
- **P-48. Masa tunggu.** Di setiap tampilan baru, semua tombol dialog mengabaikan tekanan selama 600 ms (Design System 11).
- **P-49. Papan ketik.**
  - Angka memilih pilihan, dan panah memindah fokus di antara pilihan.
  - `Enter` mengunci bila ada pilihan dan fokus berada di pilihan; pada tombol, `Enter` menekan tombol itu.
  - `Esc` sama dengan "Tutup". Fokus dikurung di dalam dialog.
  - Saat dibuka, fokus ada di pilihan pertama (mode penuh) atau "Lihat pilihan" (mode ringkas). Sesudah hasil, fokus pindah ke tombol utama.
- **P-50. Pembaca layar.** Dialog memakai `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (judul), dan `aria-describedby` (chip). Hasil diumumkan lewat wilayah `aria-live` yang ada:
  - Langkah 1 benar: "Langkah 1 tepat. Tambah 40 poin."
  - Langkah 1 keliru: "Langkah 1 belum tepat."
  - Langkah 2: "Kartu dampak: {tingkat}.", ditambah "Tambah {poin} poin." bila poin lebih dari 0.
- **P-51. Selama dialog.** Avatar sendiri diam: tombol gerak dan joystick diabaikan, `P` tidak membuka peta besar, dan tombol Periksa tersembunyi. Bilah atas dan jam ronde tetap berjalan (JFR-22).
- **P-52. Jeda (D-6).** Selama `jeda`, dialog disembunyikan tanpa ditutup: lapisan jeda di atas area dialog dibuat pekat. Dialog tampil kembali saat status kembali `main`. Tombol dialog tidak bekerja selama jeda.
- **P-53. Akhir ronde.** Pada `status_ruang` `selesai` atau pesan `selesai`, dialog tertutup dan layar "Ronde selesai" tampil (P-59).
- **P-54. Menyambung.** Saat klien menyambung ulang, dialog tertutup dan lapisan menyambung tampil. Sesudah tersambung, penanda dan skor dipulihkan dari pesan yang dikirim ulang (P-12).

### Skor dan peringkat

- **P-55. Hitungan server.** Untuk setiap pemain:
  - skor = jumlah `poin` jawabannya;
  - `waktuSkorMs` = waktu ronde tanpa jeda saat skor terakhir bertambah;
  - `langkah1Benar` = jumlah Langkah 1 benar;
  - jumlah kejadian selesai.
  
  Peringkat memakai `hitungPeringkat` atas pemain berkeidentitas yang tidak dikeluarkan, termasuk yang sedang terputus (PRD 8.4).
- **P-56. `pribadi`.** Isinya: `skor`, `peringkat`, `selesai` (kode kejadian selesai), `terlihat` (kode kejadian yang punya titik terlihat), `muatan` nol semua, `aktifSampai` kosong, dan `kotakMenunggu` kosong (JS-09). Dikirim:
  - langsung sesudah skor pemain itu berubah (P-31, P-32);
  - kepada semua pemain saat status menjadi `main`;
  - saat sambung ulang;
  - pada putaran 100 ms, kepada pemain yang peringkatnya berbeda dari `pribadi` terakhirnya, bila sudah ≥ 2.000 ms sejak `pribadi` terakhir. Bila belum, pengiriman ditunda ke putaran berikutnya yang memenuhi.
- **P-57. Bilah atas.** Di kanan bilah atas (`main` dan `jeda`): `ikon_bintang` (bingkai pertama), skor (Press Start 2P), dan "#n". Selama skor 0, tampil "#–", dengan tanda pisah ditulis memakai Pixelify Sans. Label pembaca layar: "Skor {skor}, peringkat {n}" atau "Skor 0, belum ada peringkat".
- **P-58. Skor melayang.** Saat skor bertambah, "+{selisih}" muncul di samping skor, naik 4 piksel dalam dua langkah selama 240 ms, lalu hilang sesudah 1 detik. Dengan "kurangi gerak", tidak ada skor melayang.
- **P-59. Layar "Ronde selesai".** Layar HTML JS-03 ditambah dua baris dari pesan `selesai` (atau `pribadi` terakhir bila `selesai` belum tiba): "Skormu {skor}" dan "Peringkat {n} dari {jumlah}". Bila skor 0, kedua baris diganti "Belum ada kejadian yang kamu jawab di ronde ini." (D-5).

### Penyimpanan dan kiriman (usulan 9)

- **P-60. Tabel SQLite ruang.** Dibuat dengan `CREATE TABLE IF NOT EXISTS`, sehingga ruang lama tetap jalan:
  - `kejadian (kode PK, urutan, versi_id, isi_json, rujukan_json, titik_json)`;
  - `jawaban (pemain_id, kode, urutan_json, status, langkah1_opsi, langkah1_benar, langkah2_opsi, tingkat, poin, dibuka_pada, langkah1_pada, langkah2_pada, PK (pemain_id, kode))`;
  - `terlihat (pemain_id, titik_id, kode, pada, PK (pemain_id, titik_id))`;
  - `antrean (kunci PK, jenis, urutan, isi_json, versi, dibuat_pada)`, dengan `kunci` = `jenis:id` dan `urutan` 0 (`ruang`), 1 (`peserta`), atau 2 (`jawaban`).
- **P-61. Tulisan.**
  - `kejadian`: satu baris per kejadian saat inisialisasi.
  - `jawaban`: satu tulisan saat pembukaan pertama dan saat setiap kunci.
  - `terlihat`: satu baris per titik yang terlihat.
  - `antrean`: *upsert* per perubahan baris D1, sehingga satu jawaban yang berubah tiga kali tetap satu baris antrean, dengan `versi` naik setiap kali.
  
  Baris `pemain` tidak ditulis karena skor.
- **P-62. Kiriman ke D1.** Setiap 30 detik selama antrean berisi, dan saat ronde selesai (JS-03), antrean dikirim dalam *batch* berurutan menurut `urutan` lalu `dibuat_pada`, agar kunci asing D1 terpenuhi.
  - `jawaban` D1 di-*upsert* menurut `id` = `{pemainId}:{kode}`, berisi `kejadian_versi_id`, `urutan_opsi_json` (`{"langkah1": [id asli menurut urutan tampil], "langkah2": [...]}`), pilihan asli, `petunjuk_dipakai` 0, tingkat, poin, dan ketiga waktu.
  - Sesudah terkirim, baris antrean dihapus hanya bila `versi`-nya masih sama dengan yang dikirim.
  - Baris tabel `kiriman` lama (ruang yang dibuat sebelum JS-08) dikirim lebih dulu sampai habis, dan tidak ada baris baru yang masuk ke sana.
- **P-63. Pemulihan.** Saat ruang dibangunkan, keadaan disusun ulang:
  - kejadian dan titik dari `kejadian`;
  - skor, peringkat, dan status kejadian dari `jawaban`;
  - titik terlihat dari `terlihat`;
  - dialog yang terbuka dari lampiran sambungan, dengan langkah dari status jawaban.

### Protokol versi 2 (usulan 3)

- **P-64. Skema.**
  - `PROTOKOL_VERSI` = 2.
  - `kejadian_terlihat` = `{ kejadianId, x, y, setTokoh }`, dengan `setTokoh` 1–4 id.
  - Butir `dunia.p` = `[id, x, y, arah, jalan, dialog]`.
  - Pesan lain tidak berubah. Semua pesan dibuat dengan `PROTOKOL_VERSI`, bukan angka tetap.
- **P-65. Klien lama.** `halo` versi 1 dijawab `galat VERSI_BERBEDA` dan ditutup dengan kode 4005. Layar menampilkan "Ada pembaruan. Muat ulang halaman." beserta tombol "Muat ulang" (perilaku JS-03).

### Kait uji lokal

- **P-66. `GET /api/ruang-coba/{KODE}/kejadian`** hanya di `lokal` (404 di `uji` dan produksi). Jawabannya `{ "kejadian": [{ "kejadianId": "K-01", "titik": [{ "x": 0, "y": 0 }] }] }` berisi titik aktif setiap kejadian.
- **P-67. `POST /api/ruang-coba/{KODE}/pindahkan`** hanya di `lokal`. Isi permintaannya `{ "nama": "<nama samaran>", "x": <ubin>, "y": <ubin> }`.
  - Pemain bernama itu dipindah ke (16x + 8, 16y + 12) bila sel itu bebas di grid status sekarang. Pemain menerima `koreksi` dengan `seq` gerak terakhirnya.
  - Jawaban: 200 `{ "ok": true }`; 404 bila nama atau ruang tidak ada; 400 bila sel padat.
  - Kedua kait ini dipensiunkan di JS-10 bersama ruang coba.

### Kinerja (usulan 10)

- **P-68. Kelompok histogram.** `KELOMPOK_WAKTU` menjadi 1, 2, 3, 4, 6, 8, 12, 16, 25, 50, 100, dan tak hingga (ms).
- **P-69. Ambang otomatis (AC-19)**, dari histogram `data-histogram` di ukuran HP (731 × 411, r 2,625) dengan 40 pemain tiruan yang berjalan:
  - **CPU normal:** p95 kode gambar ≤ 4 ms, bingkai terlama ≤ 25 ms, dan sedikitnya 50 bingkai per detik.
  - **CPU 6× lebih lambat:** p95 ≤ 50 ms, bingkai 50 ms ke atas paling banyak 1%, dan tanpa bingkai 100 ms ke atas. Diukur di empat keadaan: lobi penuh, berjalan melintasi peta, ganti masa, dan berdiri dekat kejadian yang tokoh serta penandanya tergambar.
  - Angka setiap kelompok dicatat di laporan dan dibandingkan dengan laporan JS-07. Kenaikan dua kelompok atau lebih menjadi temuan.
  - Uji kinerja JS-07 di `dunia.uji.ts` memakai ambang yang sama.
- **P-70. Angka fps.** Bila alamat halaman diakhiri `#fps` (saat dimuat atau sesudahnya), pojok kiri bawah dunia menampilkan "{fps} fps · p95 ≤ {kelompok} ms" untuk satu detik terakhir, diperbarui setiap detik. Tidak ada data yang disimpan atau dikirim.

### Simulasi beban

- **P-71. Bot.** Di status `main`, bot yang menerima `kejadian_terlihat` dalam jarak 12 ubin berjalan ke titik itu lewat jalur ubin. Bot mengirim `periksa` bila sudah ≤ 20 piksel logis, lalu `kunci_1` dengan pilihan acak 1–3 detik kemudian, `kunci_2` 1–3 detik kemudian, dan `tutup_dialog` 1 detik kemudian. Sesudah itu bot menjelajah lagi. Ringkasan mencatat jumlah jawaban, `pribadi` per pemain per detik, lalu lintas per pemain per 15 menit, CPU putaran, dan baris tulis SQLite ruang (kait statistik lokal).

## Beberapa pemain sekaligus

- Diberikan A dan B di dekat titik yang sama, maka keduanya melihat penanda di tempat yang sama dan boleh membuka dialog kejadian itu bersamaan. A melihat gelembung "…" di atas B, dan sebaliknya.
- Diberikan A mengunci Langkah 2 dengan poin, maka A langsung menerima `pribadi`. Pemain lain yang peringkatnya berubah menerimanya paling lambat sekitar 2 detik kemudian.
- Diberikan ruang 100 pemain, maka setiap kejadian punya dua titik aktif. Pemain di titik mana pun bisa memeriksa, dan sesudah selesai kedua penandanya berganti ✓ bagi pemain itu saja.
- Diberikan C bergabung terlambat, maka C melihat kejadian seperti pemain lain sejak titiknya masuk pandangan.
- Diberikan guru menjeda saat beberapa pemain membuka dialog, maka dialog mereka tersembunyi, kunci diabaikan, dan semuanya kembali saat dilanjutkan.
- Diberikan ronde berakhir saat ada dialog terbuka, maka semua dialog tertutup, langkah yang belum dikunci tidak dihitung, dan setiap pemain menerima `selesai` dengan peringkat akhirnya.
- Diberikan A tersambung ulang, maka A kembali tanpa dialog, dengan penanda, tokoh, skor, dan peringkatnya utuh.

## Status antarmuka

| Keadaan | Yang tampil |
|---|---|
| Dunia, tanpa kejadian dekat | Penanda dan tokoh di titik yang terlihat; tombol Periksa `mist` (perangkat sentuh); tanpa ajakan `E` |
| Dalam jangkauan | Tombol Periksa `sun` (perangkat sentuh) atau ajakan `E` Periksa (laptop); pengumuman sekali |
| Menunggu `kejadian_terbuka` | Tombol Periksa tampak ditekan, paling lama 2 detik |
| Langkah 1 | Mode penuh, atau mode ringkas dengan tampilan Situasi lalu Pilihan |
| Pilihan terpilih | Tombol pilihan `sun` dengan ▶; "Kunci jawaban" aktif |
| Mengunci | Semua tombol dialog nonaktif sampai hasil tiba |
| Umpan balik | Pita "Tepat" (`leaf`) atau "Belum tepat" (`mango`); label "Jawaban tepat" dan "Pilihanmu" |
| Langkah 2 | Chip "Langkah 2 dari 2"; tiga pilihan bersusun |
| Kartu dampak | Kepala tingkat (tepat, kurang tepat, berisiko); bagian kartu; "Lanjut menjelajah" |
| Dijeda | Dialog tersembunyi di bawah lapisan jeda (D-6) |
| Menyambung ulang | Dialog tertutup; lapisan menyambung JS-07 |
| Skor 0 | Bilah atas: bintang, 0, "#–" |
| Ronde selesai | Layar HTML dengan skor dan peringkat akhir (D-5) |
| Kurangi gerak | Penanda diam, tanpa skor melayang, tokoh di bingkai pertama |
| Fokus | Pilihan dan tombol dialog terlihat terfokus (latar `sun` dan ▶ untuk pilihan; garis fokus untuk tombol); fokus terkurung di dialog |

## Teks yang tampil (final)

Semua teks ada di `app/jejak-setara/teks.ts`. Teks dari bank (judul, situasi, pertanyaan, pilihan, umpan balik, yang terjadi, hak, kewajiban, dan rujukan) tampil apa adanya.

| Kunci | Teks |
|---|---|
| `kejadian.periksa` | Periksa |
| `kejadian.periksaLabel` | Periksa kejadian |
| `kejadian.periksaJauh` | Periksa. Dekati penanda kejadian dulu. |
| `dialog.langkah` | Langkah {n} dari 2 |
| `dialog.tutup` | Tutup |
| `dialog.kunci` | Kunci jawaban |
| `dialog.lihatPilihan` | Lihat pilihan |
| `dialog.situasi` | Situasi |
| `dialog.lanjutLangkah2` | Lanjut ke Langkah 2 |
| `dialog.lanjutMenjelajah` | Lanjut menjelajah |
| `dialog.jawabanTepat` | Jawaban tepat |
| `dialog.pilihanmu` | Pilihanmu |
| `dialog.tepat` | Tepat |
| `dialog.belumTepat` | Belum tepat |
| `dialog.poin` | +{poin} |
| `kartu.tingkat.tepat` / `.kurang` / `.berisiko` | Tepat / Kurang tepat / Berisiko |
| `kartu.terjadi` | Yang terjadi |
| `kartu.hak` | Hak yang terdampak |
| `kartu.kewajiban` | Kewajiban terkait |
| `kartu.pilihanTepat` | Pilihan yang tepat |
| `kartu.rujukan` | Rujukan |
| `kartu.rujukanUji` | Rujukan di ruang uji belum tentu sudah diverifikasi Peninjau. |
| `skor.label` | Skor {skor}, peringkat {n} |
| `skor.labelTanpaPeringkat` | Skor {skor}, belum ada peringkat |
| `peta.ringkasanKejadian` | Kejadian terlihat {n}, selesai {m}. |
| `ronde.skorAkhir` | Skormu {skor} |
| `ronde.peringkatAkhir` | Peringkat {n} dari {jumlah} |
| `ronde.tanpaSkor` | Belum ada kejadian yang kamu jawab di ronde ini. |
| `pengumuman.terlihat` | Kejadian baru terlihat. |
| `pengumuman.dekat` | Kejadian di dekatmu. Tekan E atau tombol Periksa. |
| `pengumuman.langkah1Tepat` | Langkah 1 tepat. Tambah 40 poin. |
| `pengumuman.langkah1Belum` | Langkah 1 belum tepat. |
| `pengumuman.kartu` | Kartu dampak: {tingkat}. |
| `pengumuman.tambahPoin` | Tambah {poin} poin. |
| `dunia.fps` | {fps} fps · p95 ≤ {kelompok} ms |

Ringkasan alur kerja "Jejak: ruang coba" (bukan layar pemain): "Kejadian di ruang: {n}"; bila 0: "Bank awal belum disemai, jadi ruang ini belum punya kejadian. Jalankan ulang "Jejak: uji" agar bank awal disemai, lalu buat ruang coba baru."

## Data, protokol, API, dan migrasi

- **Protokol:** `PROTOKOL_VERSI` 2 dengan dua perubahan (P-64). Pesan v1 yang mulai dipakai: `periksa`, `kunci_1`, `kunci_2`, dan `tutup_dialog` dari pemain; `kejadian_terlihat`, `kejadian_terbuka`, `hasil_1`, `hasil_2`, `pribadi`, dan `selesai` dari server. `pakai_skill` dan `ambil_kotak` tetap diabaikan (JS-09).
- **API:** jawaban `POST /api/ruang-coba` ditambah `kejadian` (P-4). Ada kait lokal baru `kejadian` dan `pindahkan` (P-66, P-67). Isi `/inisialisasi` Durable Object ditambah `kejadian` (P-3).
- **Migrasi D1:** tidak ada. Dipakai tabel `0001_awal.sql`: `paket`, `paket_kejadian`, `kejadian`, `kejadian_versi`, dan `rujukan` (baca); `ruang.paket_id`, `peserta`, dan `jawaban` (tulis).
- **Penyimpanan Durable Object:** empat tabel baru (P-60) dan lampiran sambungan berisi `dialog` (P-30).
- **Konstanta baru:** `PAKET_RUANG_COBA` (id P-1), `BATAS_DIALOG_RINGKAS_PX` 560, `JEDA_PRIBADI_MS` 2.000, `JANGKAUAN_KLIEN_PX` 24, dan `MASA_TUNGGU_DIALOG_MS` 600.
- **Dokumen yang ikut diubah (ZIP Gerbang 2):**
  - Architecture: 3, 5.3, 6.2, 6.3, 6.5, 6.9, 7, 8.3, 8.4, 8.6, 9, 10.2, dan 14;
  - Design System: 3.3 (peringkat "#–"), 3.5 (dialog di bawah bilah atas dan mode ringkas), 7 (tokoh di ruang 3 × 3), dan 11 (letak skor melayang);
  - PRD: 8.3, 20, dan 21 (KT-13 dan keputusan Gerbang 1).

## Aset

Semua dari `manifest.ts`, Disetujui, dan tanpa aset baru:
- `TANDA`: `tanda_kejadian`, `tanda_dibuka`, dan `tanda_selesai`.
- `IKON`: `ikon_mini_kejadian`, `ikon_mini_selesai`, `ikon_zona_1` sampai `ikon_zona_8`, `ikon_emosi_hati`, `ikon_emosi_tanya`, `ikon_emosi_keringat`, `ikon_emosi_seru`, dan `ikon_bintang`.
- `NPC` dan `OBJEK` untuk 37 kunci `setTokoh` bank awal (26 tokoh dan 11 properti).

## Keamanan dan privasi

- Server tetap berwenang atas kunci jawaban, poin, skor, dan peringkat. Kunci dan umpan balik baru dikirim sesudah pemain mengunci (JA-05).
- Id pilihan acak per pemain, dan benih ruang tidak pernah dikirim. Id tidak membuka jawaban benar.
- Titik aktif baru dikirim saat terlihat. Gelembung "…" hanya tampak pada pemain yang ada di layar.
- Semua pesan masuk tetap diperiksa skema dan batas JS-03. Pesan kejadian yang tidak sesuai keadaan diabaikan.
- Tidak ada data pribadi baru. Jawaban disimpan dengan id pemain dan nama samaran yang sudah ada.
- Kait `kejadian` dan `pindahkan` hanya hidup di `lokal`.
- `#fps` tidak menyimpan atau mengirim apa pun.

## Di luar cakupan

- Petunjuk dan tombolnya, Kompas, tombol skill, kotak bantuan, dan tambahan muatan Kompas untuk jawaban tepat (JS-09).
- Papan 10 besar, kemajuan kelas, podium, pembahasan, dan rute `/ws/kelas/` (JS-10).
- Rekap pribadi berisi daftar kejadian, pilihan, dan rujukan (JS-11); `selesai.rekap` tetap kosong.
- Pratinjau dialog di konsol (JS-12). Komponennya disiapkan di `bersama/`.
- Suara (JS-14) dan pengaturan pemain, termasuk ukuran label (JS-14).
- Membaca ulang kartu dampak kejadian yang sudah selesai (JS-11, lewat rekap).
- Teropong dan daftar "Kejadian terdekat" untuk pembaca layar (JS-18).

## DRAF untuk ditinjau pemilik proyek

- **D-1. Angka poin di dialog.** — (a, saran) pita "Tepat" menampilkan "+40", dan kepala kartu menampilkan "+60" atau "+25". Bila poinnya 0, tidak ada angka, agar nada tidak menghukum. (b) Selalu tampil, termasuk "+0".
- **D-2. Umpan balik saat Langkah 1 keliru.** — (a, saran) pita memuat umpan balik pilihan pemain lalu umpan balik pilihan benar. Di mode ringkas isinya boleh digulir, dengan tombol tetap terlihat. (b) Hanya umpan balik pilihan benar: selalu muat tanpa digulir, tetapi siswa tidak tahu mengapa pilihannya keliru.
- **D-3. "Pilihan yang tepat" di kartu dampak.** — (a, saran) tampil bila tingkat pilihan pemain bukan tepat, berisi teks pilihan bertingkat tepat. (b) Tidak tampil; siswa baru melihatnya di rekap JS-11.
- **D-4. Catatan rujukan di ruang uji.** — (a, saran) di ruang uji (termasuk ruang coba), daftar rujukan diikuti "Rujukan di ruang uji belum tentu sudah diverifikasi Peninjau." Catatan ini tidak tampil di ruang kelas, karena ruang kelas hanya memakai kejadian yang rujukannya terverifikasi. (b) Tanpa catatan.
- **D-5. Layar "Ronde selesai".** — (a, saran) "Skormu {skor}" dan "Peringkat {n} dari {jumlah}"; bila skor 0: "Belum ada kejadian yang kamu jawab di ronde ini." (b) Skor saja, dan peringkat menunggu rekap JS-11.
- **D-6. Dialog saat dijeda.** — (a, saran) dialog disembunyikan di bawah lapisan jeda yang pekat dan tampil lagi saat dilanjutkan, agar tidak ada yang membaca soal saat jam berhenti. (b) Dialog tetap terlihat samar di bawah lapisan `ink` 70%, seperti dunia.

## Kriteria penerimaan

- [ ] AC-1 **Isi ruang coba.** P-1 sampai P-6:
  - D1 lokal yang sudah disemai menghasilkan 16 kejadian berurutan dengan versi `kerja` yang benar, `ruang.paket_id` terisi, dan jawaban API berisi `kejadian` 16;
  - tanpa semai, `kejadian` 0 dan ruang berjalan seperti JS-07;
  - isi yang rusak dilewati;
  - ringkasan alur kerja menulis jumlah atau peringatan.
- [ ] AC-2 **Semai.** P-7: `db:semai:lokal` dan `server-lokal.mjs` menyemai D1 lokal, aman diulang. `jejak-uji.yml` punya langkah "Semai bank awal" sesudah "Migrasi D1 uji" dengan syarat yang sama (uji `kerangka.test.ts`).
- [ ] AC-3 **Penempatan.** P-8 dan P-9:
  - `jumlahTitik` 1 sama persis dengan JS-02 (uji JS-02 dan `bank-peta` tetap lulus);
  - `jumlahTitik` 2 memberi dua titik berbeda di zona yang sama, tanpa titik terpakai dua kali, dengan hasil tetap untuk benih yang sama;
  - `TITIK_TIDAK_CUKUP` bila kurang;
  - ruang lebih dari 50 pemain memakai dua titik.
- [ ] AC-4 **Keterlihatan.** P-10 sampai P-13: `kejadian_terlihat` hanya di `main`, sekali per pemain per titik, hanya saat titik masuk kotak pandangan, dan berisi `setTokoh`. Kiriman ulang sesudah sambung ulang lengkap. `pribadi.terlihat` sesuai.
- [ ] AC-5 **Tokoh dan properti.** P-14 dan P-15: tata letak ke-16 set bank awal sama dengan tabel harapan di uji, tanpa properti yang tumpang tindih; tergambar hanya di titik yang terlihat, tetap ada sesudah selesai, dan bisa dilewati (klien dan server).
- [ ] AC-6 **Penanda dan peta.** P-16 sampai P-20: penanda menurut keadaan (!, …, ✓), naik-turun dan diam saat kurangi gerak, ikon di peta mini dan peta besar, ringkasan peta besar, dan atribut uji.
- [ ] AC-7 **Periksa.** P-21 sampai P-26:
  - tombol Periksa (tiga keadaan, 64 px) di perangkat sentuh; ajakan `E` di laptop; `E` dan `Enter` bekerja;
  - jangkauan 24 px di klien dan 32 px di server, dengan kejadian terdekat yang dipilih;
  - laporan berhenti sebelum `periksa`;
  - jarak terlalu jauh dijawab `BUKAN_JANGKAUAN` dan `koreksi`;
  - pengumuman jangkauan sekali per pendekatan.
- [ ] AC-8 **Langkah 1.** P-28, P-29, P-39 sampai P-43, P-48, P-49:
  - mode ditentukan batas 560 px (contoh di P-39);
  - urutan dan id pilihan tetap per pemain, berbeda antarpemain, dan unik;
  - "Kunci jawaban" aktif hanya sesudah memilih;
  - papan ketik lengkap, masa tunggu 600 ms, dan fokus terkurung;
  - di mode ringkas tidak ada yang perlu digulir di tampilan Situasi dan Pilihan untuk ke-16 kejadian (HP 731 × 411 dan 1024 × 768).
- [ ] AC-9 **Kunci dan umpan balik.** P-31 dan P-44: isi `hasil_1` benar untuk pilihan benar dan keliru; kunci kedua diabaikan; poin 40 atau 0; label, warna, dan pita sesuai pilihan D-1 dan D-2; mode ringkas hanya menampilkan pilihan yang relevan.
- [ ] AC-10 **Langkah 2 dan kartu dampak.** P-32, P-45, P-46: isi `hasil_2` (tingkat, poin 60/25/0, semua pilihan tepat, teks rujukan); warna, ikon, dan tulisan tingkat; bagian kartu sesuai pilihan D-3 dan D-4; "Lanjut menjelajah" menutup dialog.
- [ ] AC-11 **Tutup dan KT-13.** P-33, P-47: menutup sebelum Langkah 1 dikunci tidak mengubah apa pun. Menutup sesudahnya lalu memeriksa lagi membuka Langkah 2 dengan ulangan `hasil_1`. Penanda tetap "!". Poin Langkah 1 tetap dihitung bila ronde berakhir.
- [ ] AC-12 **Jeda, akhir ronde, dan sambung ulang.** P-34 sampai P-37, P-52 sampai P-54, P-59:
  - kunci diabaikan saat jeda, dan dialog tersembunyi sesuai D-6;
  - akhir ronde menutup dialog dan mengirim `selesai` berisi peringkat akhir;
  - layar "Ronde selesai" sesuai D-5;
  - sambung ulang memulihkan penanda dan skor;
  - pemain yang dikeluarkan tidak masuk peringkat.
- [ ] AC-13 **Skor dan peringkat.** P-55 sampai P-58:
  - skor, `waktuSkorMs` tanpa jeda, dan peringkat sesuai PRD 8.4;
  - `pribadi` langsung untuk pemain yang menjawab, dan paling sering sekali per 2 detik untuk perubahan peringkat lain;
  - bilah atas menampilkan "#–" selama skor 0, serta label pembaca layar;
  - skor melayang, dan tanpa skor melayang saat kurangi gerak.
- [ ] AC-14 **Gelembung "…".** P-17 dan P-30: tanda `dialog` di `dunia` naik dan turun bersama dialog; gelembung tampil pada pemain lain dan tidak pada diri sendiri.
- [ ] AC-15 **Gerak selama dialog.** P-30 dan P-51: klien tidak mengirim `gerak` selama dialog, dan server menolak `gerak` pemain yang berdialog dengan alasan `dialog`.
- [ ] AC-16 **Penyimpanan ruang.** P-60, P-61, P-63: keempat tabel dan lampiran dialog. Sesudah ruang dibangunkan ulang (uji server), skor, titik terlihat, dan dialog pulih sama. Baris `pemain` tidak ditulis karena skor.
- [ ] AC-17 **Kiriman D1.** P-62: baris `jawaban` dan skor peserta sampai di D1 lokal dengan isi yang benar dan kunci asing terpenuhi. Satu jawaban yang berubah tiga kali menghasilkan satu baris antrean. Penghapusan sesudah kirim menghormati `versi`. Kiriman ulang aman. Baris `kiriman` lama terkuras.
- [ ] AC-18 **Protokol.** P-64 dan P-65: skema versi 2 di uji `protokol.test.ts` (termasuk penolakan butir `dunia` lima unsur dan `kejadian_terlihat` tanpa `setTokoh`); klien versi 1 mendapat 4005 dan pesan pembaruan.
- [ ] AC-19 **Kinerja.** P-68 sampai P-70: ambang P-69 lulus di keempat keadaan, dan angkanya tercatat di laporan; `#fps` menampilkan angka. Butir manual "≥ 30 fps di HP Android kelas bawah" tetap dicek saat uji coba kelas (laporan JS-07).
- [ ] AC-20 **Beban dan lalu lintas.** P-71: `sim:beban` lokal 1 × 50 dan 1 × 100 bot yang menjawab kejadian lulus tanpa pesan ditolak. Lalu lintas turun per pemain ≤ 3 MB per 15 menit. Baris tulis SQLite ruang dan D1 per sesi tercatat.
- [ ] AC-21 **Ukuran.** Kode layar pemain ≤ 200 KB gzip, dengan kenaikannya dicatat. Seluruh aset layar pemain ≤ 2 MB. Kedua berkas peta tidak berubah.
- [ ] AC-22 **Aksesibilitas.** Dialog sebagai `role="dialog"` dengan judul dan fokus terkurung; permainan bisa diselesaikan hanya dengan papan ketik; pengumuman P-13, P-25, dan P-50 berjarak ≥ 2 detik; target sentuh ≥ 48 px; makna tidak hanya lewat warna (label "Jawaban tepat", "Pilihanmu", tulisan tingkat, dan bentuk penanda).
- [ ] AC-23 **Kait uji lokal.** P-66 dan P-67: berfungsi di `lokal`, dan menjawab 404 di `uji` dan produksi.
- [ ] AC-24 **Kode dan lingkungan.**
  - semua perintah AGENTS bagian 6 lulus;
  - `tsc --noEmit` 0 galat dan ESLint 0 masalah pada berkas Jejak Setara;
  - tidak ada galat konsol, pelanggaran CSP, atau respons 4xx dan 5xx yang tidak diharapkan;
  - galeri 178 berkas identik byte;
  - `PROTOKOL_VERSI` 2;
  - uji JS-05 dan JS-06 tetap lulus tanpa perubahan berkas Sesi B dan C.
- [ ] AC-25 **Dokumen.** Architecture, Design System, dan PRD sesuai bagian "Data, protokol, API, dan migrasi"; `PLAN.md` diperbarui.

## Rencana uji

### Uji unit (`test:jejak`)

- `__tests__/inti/aturan.test.ts`: `tempatkanKejadian` dengan `jumlahTitik` 1 dan 2 (P-8): sama dengan JS-02 untuk 1, dua titik berbeda, tetap untuk benih yang sama, `TITIK_TIDAK_CUKUP`.
- `__tests__/inti/protokol.test.ts`: skema versi 2 (P-64), termasuk contoh yang ditolak.
- `__tests__/ruang/kejadian-ruang.test.ts`:
  - urutan dan id pilihan (tetap, unik, berbeda antarpemain, tidak bergantung pada jawaban benar);
  - pemetaan id pemain ke id asli;
  - poin;
  - isi `kejadian_terbuka`, `hasil_1`, dan `hasil_2` dari ke-16 kejadian bank awal yang lolos skema versi 2;
  - keterlihatan dengan kotak pandangan yang dijepit;
  - peringkat dan `waktuSkorMs` tanpa jeda.
- `__tests__/ruang/inti-ruang.test.ts`, dengan jam tiruan:
  - semua syarat P-26 sampai P-37, termasuk dua titik, KT-13, jeda, dan akhir ronde;
  - sambung ulang dan kiriman ulang;
  - tanda `dialog` dan penolakan `gerak`;
  - jadwal `pribadi` 2 detik;
  - antrean dengan `versi`;
  - pemulihan dari tabel tiruan.
- `__tests__/dunia/kejadian.test.ts`: tata letak ke-16 set bank awal dengan `OBJEK` dan `NPC` dari manifest (tabel harapan), jangkauan 24 px, dan pemilihan kejadian terdekat.
- `__tests__/dunia/penggambar.test.ts`: urutan gambar penanda, tokoh, properti, dan gelembung; kurangi gerak.
- `__tests__/bersama/dialogKeadaan.test.ts`:
  - batas mode ringkas untuk contoh P-39;
  - perpindahan tampilan penuh dan ringkas;
  - pilihan dan penguncian;
  - masa tunggu 600 ms;
  - papan ketik.
- `__tests__/kerangka.test.ts`: skrip `db:semai:lokal`, langkah semai di `jejak-uji.yml` (urutan dan syarat), dan ringkasan ruang coba.

### Uji server (`test:jejak:server`)

- Server lokal (dengan semai): ruang coba berisi 16 kejadian dan `paket_id`. Ruang tanpa semai (folder keadaan terpisah): 0 kejadian.
- Lewat WebSocket sungguhan dan kait `pindahkan`: periksa, kunci 1 dan 2, skor, dan `pribadi`. Sesudah kiriman, baris `jawaban` dan `peserta` diperiksa di D1 lokal.
- Ruang dibangunkan ulang (Worker dinyalakan ulang di tengah ronde): skor, titik terlihat, dan dialog pulih.
- Kait `kejadian` dan `pindahkan`: berfungsi di `lokal`, dan 404 di `uji` (konfigurasi uji yang sama seperti JS-07).

### Uji ujung ke ujung (`e2e/jejak-setara/kejadian.uji.ts`)

- **Laptop:** dua konteks dalam satu ruang.
  - Kait `kejadian` dan `pindahkan` menaruh A di dekat titik; A melihat penanda ("!") dan ajakan `E`.
  - A membuka dialog dengan `E` dan menjawab dengan papan ketik saja (`1`, `Enter`, Langkah 2, `Enter`, "Lanjut menjelajah").
  - Skor dan "#n" berubah, dan penanda menjadi ✓.
  - B melihat gelembung di atas A selama dialog A terbuka.
- **HP** (731 × 411, sentuhan):
  - tombol Periksa berganti keadaan saat mendekat;
  - mode ringkas: tampilan Situasi, "Lihat pilihan", lalu semua pilihan terlihat tanpa digulir;
  - memilih dengan sentuhan dan "Kunci jawaban"; umpan balik ringkas; kartu dampak.
- **KT-13:** kunci Langkah 1, tutup, lalu periksa lagi langsung membuka Langkah 2.
- **Kait `putuskan` di tengah dialog:** dialog tertutup, lalu penanda dan skor pulih.
- **Jeda saat dialog terbuka:** dialog tersembunyi, lalu kembali saat dilanjutkan.
- **Akhir ronde:** layar "Ronde selesai" menampilkan skor dan peringkat.
- **Tangkapan layar** empat ukuran (731 × 411, 1280 × 720, 1024 × 768, 1920 × 1080): dunia dengan penanda dan tokoh, Langkah 1, umpan balik, Langkah 2, dan kartu dampak. 0 galat konsol dan 0 pelanggaran CSP.
- **`dunia.uji.ts`:** uji kinerja dengan ambang P-69, ditambah keadaan berdiri dekat kejadian.

### Beban dan jaringan

- `sim:beban` (wajib): 1 × 50 dan 1 × 100 bot yang menjawab (P-71); dicatat lalu lintas, `pribadi` per detik, CPU putaran, baris tulis, dan 0 pesan ditolak (AC-20).
- Uji jaringan lokal (latensi 80 ms, jitter rata-rata 40 ms): tidak ada `periksa` jujur yang ditolak `BUKAN_JANGKAUAN` saat pemain berhenti dalam jangkauan klien 24 px.

### Manual (AGENTS 9) di lingkungan uji

- Dialog terbaca dan nyaman di HP sungguhan; mode ringkas; tombol Periksa.
- Bisa dimainkan sampai akhir hanya dengan papan ketik di laptop.
- Kurangi gerak mematikan naik-turun penanda, skor melayang, dan animasi tokoh.
- Menyambung kembali sesudah wifi HP dimatikan 30 detik di tengah dialog.
- ≥ 30 fps di HP Android kelas bawah: saat uji coba kelas (`#fps` membantu membaca angkanya).
