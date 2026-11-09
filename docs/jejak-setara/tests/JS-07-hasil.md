# JS-07 — Hasil uji

| | |
|---|---|
| Fitur | JS-07 Penjelajah |
| Spesifikasi | [specs/JS-07-penjelajah.md](../specs/JS-07-penjelajah.md), disetujui 8 November 2026 dengan semua saran DRAF D-1 sampai D-5 (pilihan a) |
| Tanggal | 9 November 2026 |
| Lingkungan | Lingkungan agen: Node 22.23.4, pnpm 11.25.0, `wrangler` 4.92.0, `@cloudflare/vite-plugin` 1.37.1, Chromium 153 tanpa GPU; 1 vCPU, 4 GB |
| Keputusan | **Lulus dengan catatan**, ditutup 9 November 2026: AC-19 otomatis tidak mencapai p95 ≤ 4 ms pada CPU 6× dengan 40 pemain yang terus berjalan, dan pemilik proyek menjawab "Lanjutkan" atas saran pilihan (a); pemeriksaan manual pemilik proyek di lingkungan uji lancar di HP dan laptop. Uji di HP Android kelas bawah dijadwalkan saat uji coba kelas |

## Perintah resmi

| Perintah | Hasil |
|---|---|
| `install --frozen-lockfile` | Lulus; lockfile tidak berubah, tanpa dependensi baru |
| `content:check:jejak` | Lulus: 10 berkas, 254 uji |
| `test:jejak` | Lulus: 33 berkas, 703 uji (garis dasar 23 berkas dan 610 uji; dua uji lama disesuaikan dengan perilaku baru: gerak di lobi dan kait kelas di lingkungan uji) |
| `test:jejak:server` | Lulus: 19 uji lewat HTTP dan WebSocket sungguhan (12 lama, satu di antaranya diperluas dengan posisi lobi sesudah server dinyalakan ulang, dan 7 baru) |
| `build:jejak` | Lulus. Lihat bagian "Anggaran ukuran" |
| Build `CLOUDFLARE_ENV=uji` dan `wrangler deploy --dry-run` | Binding `RUANG`, `DB` (`jejak-setara-uji`), `BATAS_PUBLIK`, `BATAS_WS`, `ASSETS`, dan `LINGKUNGAN` = `uji`; unggahan 175,37 KiB, 39,28 KiB gzip |
| `test:e2e:jejak` (`JEJAK_CHROMIUM`) | 23 uji lulus (14 kerangka JS-01, 5 alur gabung JS-03, 4 dunia JS-07); 1 uji kinerja (AC-19) gagal pada ambang p95. Karena batas sekitar 300 detik per perintah di lingkungan agen, uji dijalankan dalam tiga bagian dengan `-g` |
| `sim:beban` | Lulus; lihat bagian "Simulasi beban" |
| `dev:jejak` | Menyala; `/api/sehat`, `/`, dan `/admin/` menjawab 200 |
| `peta:build` dan `assets:build:jejak` | Lulus, tanpa berkas yang berubah (239 aset Disetujui, total 100,3 KB) |
| `build:pages` | Lulus; ke-178 berkas identik byte dengan garis dasar, sesudah kode dan sesudah semua dokumen |
| `tsc --noEmit` | 0 galat |
| ESLint `--max-warnings 0` pada berkas Jejak Setara | 0 masalah. `pnpm lint` untuk seluruh repositori menemukan 249 masalah, sama persis dengan garis dasar (semuanya di kode Sehari Setara); tidak ada yang baru |
| Alur kerja | Ketiga alur kerja Jejak terbaca sebagai YAML sah, dan setiap skrip `run` lulus `bash -n` |

## Kriteria penerimaan

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 Skala | Lulus | `dunia/skala.test.ts`: kelima contoh wajib (731 × 411 r 2,625 → ×6; 1280 × 720 → ×4; 1024 × 768 → ×3; 1920 × 1080 → ×6; 1366 × 657 → ×3), potongan ≤ 2 piksel logis per sisi, bingkai `ink`, dan skala HP tegak. E2E: kanvas 1.280 × 720 di laptop dan ×6 di HP; ukuran dihitung ulang saat jendela atau orientasi berubah |
| AC-2 Gambar dan urutan | Lulus | `dunia/penggambar.test.ts`: urutan lapis bawah, gerbang bawah, tokoh menurut y kaki lalu id, lapis atas, gerbang atas, lalu siluet hanya bila kotak diri beririsan dengan bagian atas objek atau gerbang; titik kaki (8, 21) dan posisi bulat; arah kiri dicerminkan per bingkai; "kurangi gerak" memakai bingkai 0. Kanvas logis 320 × 180 diperbesar sekali tanpa penghalusan |
| AC-3 Kamera | Lulus | `dunia/kamera.test.ts`: zona mati 24 × 16, jepit di keempat tepi, posisi bulat, berpusat saat posisi awal dan sesudah `koreksi` |
| AC-4 Potongan peta | Lulus | `dunia/potongan.test.ts`: lapis bawah lalu lapis atas sama piksel demi piksel dengan `peta_pagi`, `peta_siang`, dan `peta_sore.png` JS-06 di empat potongan contoh; persiapan bertahap menghasilkan isi yang sama dengan persiapan utuh; potongan terlihat selalu siap; paling banyak satu potongan cincin per bingkai; paling banyak 16 disimpan; gerbang tidak masuk potongan |
| AC-5 Masa | Lulus | `dunia/langit.test.ts` dan `potongan.test.ts`: pagi di lobi, pergantian di kemajuan 0,3 dan 0,65, persiapan mulai 10 detik sebelumnya, lalu tukar tanpa menggambar ulang; tambah waktu memundurkan masa; hasil hanya bergantung pada `berakhirPada` dan jam server. E2E dengan jam tiruan peramban: piksel marka di titik tetap cream (pagi), cream (sore), putih (siang sesudah tambah waktu) |
| AC-6 Keyboard | Lulus | `dunia/masukan.test.ts` dan `gerakDiri.test.ts`; E2E: berjalan dengan panah tanpa menggulir halaman, diagonal, dan tidak bergerak selama peta besar terbuka |
| AC-7 Joystick | Lulus | `dunia/masukan.test.ts`; E2E dengan sentuhan CDP di konteks HP: muncul di separuh kiri, pemain bergerak, hilang saat diangkat, separuh kanan tidak memulai joystick, dan laptop tanpa joystick |
| AC-8 Pengiriman `gerak` | Lulus | `dunia/gerakDiri.test.ts`: 100 ms dan 166 ms, satu laporan berhenti, tanpa kiriman saat diam, tanpa antrean saat `bufferedAmount` > 0, `seq` naik, posisi awal dan koreksi; `ruang/jaringan.test.ts`: `bufferedAmount` dari soket |
| AC-9 Pemain lain | Lulus | `dunia/pemainLain.test.ts`: tunda 120–250 ms, interpolasi, penerusan paling lama 100 ms, sembunyi sesudah 2,5 detik hanya di `main`; `dunia/aset.test.ts`: penggantian warna tas serentak pada kedelapan warna |
| AC-10 Label nama | Lulus | `dunia/penggambar.test.ts`: paling banyak 8 pemain lain terdekat yang terlihat, tanpa label diri; tangkapan layar: Pixelify Sans 13 px, teks `ink` di latar `cream` bergaris `ink` (D-1a) |
| AC-11 Lobi dan gerbang | Lulus | Uji inti ruang dan uji server: gerak di lobi tertahan gerbang (koreksi) lalu lolos sesudah `main`; E2E: gerbang tertutup, terbuka, dan pemain lewat; "Bersiap" dan angka; panel lobi D-2a |
| AC-12 Bilah atas | Lulus | E2E: latar per masa, label "Jam cerita" dan "Sisa waktu", dua menit terakhir (latar mango, `data-denyut`, pita "Dua menit lagi"), dan lapisan jeda |
| AC-13 Peta mini dan peta besar | Lulus | E2E: dibuka dengan `P`, klik, dan ketuk di HP; ditutup dengan `Esc` dan tombol; fokus kembali ke dunia; isi D-3 dan warna D-4; pemain berhenti (D-5) |
| AC-14 Lapisan | Lulus | E2E: "Menyambung ulang…" di atas dunia lalu kembali ke posisi terakhir, ajakan putar HP, layar selesai dan ditutup tetap (uji JS-03), dan tombol layar penuh hanya bila `document.fullscreenEnabled` |
| AC-15 Layar tetap menyala | Lulus | `dunia/layarMenyala.test.ts` dengan API tiruan |
| AC-16 Server: peta dan gerak | Lulus | Uji server `dunia.uji-server.ts` dan uji inti ruang: peta kampung di ruang baru dan ruang yang dipulihkan, `bacaPeta` atas `kampung.json`, grid lobi, posisi awal dan sesudah sambung ulang lewat `koreksi`; versi peta sama, dan klien berhenti bila berbeda (`jaringan.test.ts`) |
| AC-17 Server: `dunia` di lobi | Lulus | Uji inti ruang dan uji server: kiriman hanya mengikuti `gerak`, paling sering 100 ms kecuali laporan berhenti, kerangka penuh sekali per detik per pemain dan untuk pemain baru atau tersambung ulang, tanpa pengatur waktu selama lobi diam |
| AC-18 Kendali ruang coba | Lulus | `kerangka.test.ts`: 403 tanpa kunci yang benar di `uji`, diteruskan dengan kunci benar, 404 di produksi, `statistik` dan `putuskan` tetap lokal; uji server: keenam aksi dengan status ruang sesudahnya; uji alur kerja: kunci disamarkan, coba ulang selama 403, ringkasan berbahasa Indonesia, dan masukan durasi |
| AC-19 Kinerja | **Lulus dengan catatan** | Otomatis: lihat bagian "Anggaran ukuran dan kinerja". Bingkai terlama ≤ 25 ms (di bawah 50 ms), tetapi p95 ≤ 12 ms, bukan ≤ 4 ms; diterima pemilik proyek sebagai batas lingkungan agen. Manual: lancar di HP dan laptop pemilik proyek (bagian "Pemeriksaan manual di lingkungan uji"). HP Android kelas bawah: dijadwalkan saat uji coba kelas |
| AC-20 Beban dan lalu lintas | Lulus | Lihat bagian "Simulasi beban" |
| AC-21 Gerak jujur | Lulus | Dengan anggaran jarak: 0 dari 14.512 laporan jujur ditolak; tanpa anggaran (aturan JS-02, diukur lebih dulu): 16,25%. Keputusan tercatat di Architecture 8.2 dan `PLAN.md` |
| AC-22 Ukuran | Lulus | Lihat bagian "Anggaran ukuran dan kinerja" |
| AC-23 Aksesibilitas | Lulus | Fokus terlihat (kanvas dunia, peta mini dengan ▶, tombol), tombol ≥ 48 px, keyboard penuh untuk gerak dan peta besar, label pembaca layar (kanvas dunia, jam, sisa waktu, titik masa, peta besar sebagai dialog), pengumuman lewat wilayah `aria-live` yang ada dengan jarak ≥ 2 detik, dan gerbang tertutup atau terbuka berbeda bentuk |
| AC-24 Kode dan lingkungan | Lulus | Perintah di atas; tidak ada galat konsol, pelanggaran CSP, atau respons 4xx dan 5xx yang tidak diharapkan di uji E2E; galeri 178 berkas identik byte; `PROTOKOL_VERSI` tetap 1 |

## Simulasi beban (wajib)

Bot berjalan jujur 72 piksel per detik di sepanjang jalur ubin peta kampung: diam di lobi 5 detik, berjalan di halaman lobi 30 detik, lalu `mulai` lewat kait lokal dan menjelajah.

| Skenario | Lobi diam | Lobi berjalan | Ronde (jelajah) | Koreksi | Putus |
|---|---|---|---|---|---|
| 1 × 50 bot, 120 detik jelajah | 0 `dunia`, tanpa pengatur waktu, 0 putaran | 12,2 `dunia`/detik, 5,6 KB/detik (setara 5,05 MB per 15 menit) | 7,6 `dunia`/detik, 1,7 KB/detik (1,54 MB per 15 menit); RTT p50 7 ms, p95 14 ms | 0 dari 47.465 | 0 |
| 1 × 100 bot, 90 detik jelajah | 0 `dunia`, tanpa pengatur waktu, 0 putaran | 14,9 `dunia`/detik, 6,7 KB/detik (6,02 MB per 15 menit) | 7,6 `dunia`/detik, 1,8 KB/detik (1,60 MB per 15 menit); RTT p50 16 ms, p95 32 ms | 0 dari 42.504 | 0 |
| 1 × 20 bot, latensi 80 ms dan jitter eksponensial rata-rata 40 ms (AC-21) | — | — | RTT p50 238 ms, p95 377 ms | 0 dari 14.512 | 0 |

- Rata-rata seluruh simulasi, termasuk lobi berjalan: 2,24 MB (50 bot) dan 2,7 MB (100 bot) per pemain per 15 menit, di bawah 3 MB.
- Catatan untuk Plan berikutnya: halaman lobi sempit, jadi semua pemain saling berada di dalam kotak 480 × 270. Bila semuanya terus berjalan, setiap laporan berhenti langsung memicu `dunia` (P-47), sehingga kiriman lobi bisa lebih dari 10 per detik. Lobi biasanya hanya beberapa menit.
- Server tidak menolak pesan apa pun; baris SQLite per ruang 371 (50 bot) dan 735 (100 bot).
- Pengukuran awal aturan JS-02 (sebelum anggaran jarak, Worker lokal, 10 bot): 16,25% laporan jujur ditolak pada jitter rata-rata 40 ms dan 2,51% pada jitter 20 ms.

## Anggaran ukuran dan kinerja

| Butir | Anggaran | Hasil |
|---|---|---|
| Kode layar pemain (gzip) | ≤ 200 KB | 116,0 KB: `pemain` 52,0 KB, potongan bersama 61,0 KB, CSS 3,0 KB |
| Aset layar pemain | ≤ 2 MB | 236 PNG, 101,9 KB; tidak ada data URI PNG di kode (C-13) |
| Kedua berkas peta (gzip) | ≤ 60 KB | 13,9 KB (`kampung.json` 9,1 KB, `kampung_gambar.json` 4,7 KB) |
| Worker (gzip) | — | 40,4 KB (naik 3,5 KB karena lapisan tabrakan peta kampung) |

Kinerja (AC-19), uji E2E di ukuran HP (731 × 411, r 2,625, skala ×6) dengan 40 bot yang terus berjalan dan CPU diperlambat 6× lewat CDP. Waktu kode gambar per bingkai dicatat di histogram kanvas dunia (`data-histogram`):

| Keadaan | Bingkai | ≤ 4 ms | p95 | Bingkai terlama |
|---|---|---|---|---|
| Lobi penuh (10 detik) | 235 (23,5 fps) | 80% | ≤ 12 ms | ≤ 25 ms |
| Berjalan melintasi peta (12 detik) | 283 (23,6 fps) | 58% | ≤ 12 ms | ≤ 25 ms |
| Pagi ke siang, waktu sungguhan (20 detik) | 586 (29 fps) | 93% | ≤ 6 ms | ≤ 12 ms |

- Pada CPU normal: 60 fps, p95 ≤ 1 ms. Pada CPU 6× dengan bot diam: p95 ≤ 4 ms.
- Penyebab utama: Chromium tanpa GPU menggambar dengan perangkat lunak, di mesin satu CPU yang juga menjalankan Worker dan bot. Pengukuran awal sebelum perbaikan: p95 ≤ 16–25 ms dan bingkai terlama ≤ 50 ms. Persiapan potongan bertahap (satu irisan per bingkai) dan gambar label yang disimpan menurunkan bingkai terlama ke 25 ms.
- Keputusan: Sesi A menyarankan pilihan (a), yaitu angka ini diterima sebagai batas lingkungan agen dan pemeriksaan manual "≥ 30 fps di HP Android kelas bawah" menjadi penentu; pemilik proyek menjawab "Lanjutkan". Ambang otomatis ditetapkan ulang di Plan berikutnya (catatan di `PLAN.md`).

## Tangkapan layar

Di folder [JS-07/](JS-07/): lobi, ronde pagi, ronde sore, dan peta besar dalam empat ukuran (731 × 411 dari konteks HP r 2,625; tiga ukuran laptop dari satu halaman yang diubah ukurannya), ditambah joystick, ajakan putar HP, gerbang tertutup dan terbuka, menyambung ulang, dan dijeda.

## Deviasi dari spesifikasi dan koreksi Build

- Berkas tambahan di luar daftar spesifikasi: `pemain/dunia/petaKampung.ts` (data peta layar pemain), `pemain/dunia/mesin.ts` (keadaan dunia di luar React, agar `dunia` dan `koreksi` yang tiba bersama `pemain_baru` tidak hilang sebelum layar dunia terpasang), dan `pemain/PetaBesar.tsx` (dipisah dari `PetaMini.tsx`). `Lobi.tsx` kini meneruskan ke `PanelLobi.tsx`, agar tidak ada berkas yang perlu dihapus.
- Panel lobi juga menampilkan nama samaran dan avatar sendiri, karena Design System 10 ("Lobi pemain") memintanya; P-26 tidak menyebutnya, tetapi juga tidak melarang.
- Tombol "Masuk" baru aktif sesudah aset termuat. Kode dengan format salah tetap langsung dijawab; kode yang sah sebelum aset siap menunggu aset, lalu diperiksa otomatis.
- Laporan `gerak` dibulatkan ke 0,1 piksel. Batas ubin berupa bilangan bulat, jadi posisi sah tetap sah.
- Kait statistik lokal ditambah `duniaLobi`, `pewaktuPutaran`, dan alasan `koreksi`; kanvas dunia menulis ringkasan kecil di atribut `data-` setiap 500 ms untuk uji.
- Ditemukan dan diperbaiki selama Test: pengurai RLE di skrip simulasi beban membaca pasangan nilai dan jumlah terbalik, sehingga bot menabrak dinding (3% koreksi); sesudah diperbaiki, 0%.

## Temuan lain

- Alur kerja "Jejak: kendali ruang coba" menyimpan ulang rahasia `KUNCI_COBA` setiap kali dijalankan, sehingga Worker uji mendapat versi baru. Menurut changelog Cloudflare 30 Oktober 2026 ("Durable Objects now defer code updates by default"), ruang yang sedang aktif bisa tetap memakai kode lamanya paling lama 5 menit sebelum pindah, jadi pemain di ronde yang berjalan mungkin menyambung ulang sebentar. Posisi dan skor tetap.
- Aksi "tutup" hanya berlaku di status `selesai` atau `pembahasan` (protokol layar kelas). Untuk menutup ruang yang sedang berjalan: "akhiri" lebih dulu, lalu "tutup".
- Di peta besar, panah "Kamu di sini" bisa menutupi sebagian label zona Sekolah, karena halaman lobi berada di tengah zona itu.

## Pemeriksaan manual di lingkungan uji (9 November 2026)

Sesudah ZIP JS-07 di-push (9 November 2026, 12.34 WITA), pemilik proyek mengulang perintah resmi di luar sesi agen dan mencoba lingkungan uji.

| Hal | Hasil |
|---|---|
| Perintah resmi | `content:check:jejak` 254 dari 254, `test:jejak` 703 dari 703, `test:jejak:server` 19 dari 19, `build:jejak` berhasil, dan `build:pages` 178 berkas identik dengan rilis F-11. Diulang Sesi A di awal Plan JS-08 dengan hasil yang sama |
| Lingkungan uji di HP dan laptop | Lancar, menurut pemilik proyek |
| Merek dan tipe HP | Belum dicatat; dilengkapi di Gerbang 2 JS-08 |
| Butir yang dicek | Belum dicatat; dilengkapi bersama tipe HP |

- **AC-19, bagian manual:** lancar di HP dan laptop pemilik proyek. Karena tipe HP belum dicatat, belum bisa dipastikan apakah HP itu termasuk kelas bawah menurut PRD 4 dan 12 (RAM sekitar 3 GB, Android 10 ke atas). Butir AGENTS 9 "Lancar (≥ 30 fps) di HP Android kelas bawah selama satu ronde penuh" tetap terbuka.
- **Saran waktu uji HP kelas bawah:** saat uji coba kelas, dengan dua atau tiga HP siswa yang paling sederhana, selama satu ronde penuh 15 menit. Pada waktu itu JS-08 sudah selesai, sehingga dialog dan penanda kejadian ikut teruji, dan paket berbayar sudah aktif (Architecture 18 langkah 2), sehingga kuota tidak membatasi. Bila sebelum itu tersedia HP kelas bawah (misalnya milik keluarga atau rekan guru), uji bisa dimajukan di lingkungan uji dengan "Jejak: ruang coba" dan "Jejak: kendali ruang coba".
- **Ambang otomatis AC-19** ditetapkan ulang di Plan JS-08 (usulan 10).

## Perbaikan uji sesudah Selesai (9 November 2026)

**Yang terjadi.** Sesudah ZIP perbaikan uji JS-03 di-push (9 November 2026), alur kerja "Jejak: uji" #49 merah di `test:jejak`. Uji `dunia/potongan.test.ts` baris 148, "persiapan bertahap menghasilkan isi yang sama dengan persiapan utuh", melewati batas waktu bawaan Vitest 5.000 ms. Kode permainan tidak berubah.

**Penyebab.** Uji itu menyiapkan potongan peta bertahap selama 80 bingkai, lalu membandingkan tiga potongan piksel demi piksel di Node. Waktunya selalu mepet di batas 5 detik: 4.741 ms di "Jejak: uji" #48, dan 5.063 ms di mesin agen saat diukur ulang (pada pengukuran itu uji ini juga gagal karena batas waktu). Uji lain paling lama 644 ms.

**Perbaikan.** Isi uji tidak diubah. Uji itu kini menulis batas waktunya sendiri, 30 detik, dan batas bawaan semua uji unit Jejak di `vitest.jejak.config.ts` menjadi 20 detik.

**Bukti.** Uji potongan dijalankan 3 kali di mesin agen: semuanya lulus, dengan uji berat itu 5.379, 5.064, dan 4.785 ms (dua yang pertama pasti gagal dengan batas lama). `test:jejak` lulus 33 berkas dan 705 uji, uji konten 254, `tsc --noEmit` 0 galat, ESLint 0 masalah, dan galeri tetap 178 berkas identik byte.

**Kegagalan lain di push yang sama.** Alur kerja galeri "Terbitkan ke GitHub Pages" #79 gagal dengan "Timeout reached, aborting!" sesudah 10 menit 54 detik. Proses sebelumnya (#78) juga lambat, 8 menit 49 detik, padahal biasanya kurang dari 1 menit 20 detik. Ini kelambatan layanan GitHub Pages, bukan kode: isi galeri dari ZIP Jejak Setara tetap 178 berkas identik byte, dan `deploy-pages.yml` tidak diubah.

## Keputusan

**Lulus dengan catatan; JS-07 Selesai 9 November 2026.** Pemeriksaan manual pemilik proyek di lingkungan uji lancar di HP dan laptop. Uji ≥ 30 fps di HP Android kelas bawah selama satu ronde penuh dijadwalkan saat uji coba kelas, dan ambang otomatis AC-19 ditetapkan ulang di Plan JS-08 (usulan 10).
