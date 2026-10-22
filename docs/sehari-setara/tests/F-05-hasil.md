# Hasil uji F-05 — 22 Oktober 2026

Spesifikasi: [`specs/F-05-panel-narasi-pilihan.md`](../specs/F-05-panel-narasi-pilihan.md).

Lingkungan:

- Node 22.22.2, pnpm 11.25.0, Vite 8.0.13, Vitest 5.0.4, dan TypeScript 5.9.3;
- `@playwright/test` 1.56.1 dengan Chromium 141.0.7390.37 di lingkungan agen.

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 | Lulus | Layar kerangka memuat "Kembali ke galeri" (`../`), "Lihat pratinjau panggung" (`#adegan-1`), dan "Coba alur permainan" (`#main`); Tab pertama memfokuskan "Kembali ke galeri". Tombol ketiga membuka layar narasi 1 adegan 1 tanpa memuat ulang halaman (penanda di `window` bertahan), dengan fokus di tombol lanjut. Tombol Kembali browser memindahkan fokus ke "Coba alur permainan". Maju lagi ke `#main` dan memuat ulang halaman mulai dari layar narasi 1. `#adegan-2` tetap membuka pratinjau dengan fokus di judul; `#lain`, `#mainkan`, `#Main`, dan alamat kosong menampilkan layar kerangka. [Tangkapan layar](F-05/kerangka_1280x720.png) |
| AC-2 | Lulus | Tanpa kurangi gerak, teks yang belum muncul masih ada sesaat setelah layar tampil. `Spasi` pertama menampilkan seluruh teks tanpa berganti layar, dan `Spasi` berikutnya pindah ke layar 2 ("Tampilkan pilihan"). Klik di kotak narasi menampilkan seluruh teks, dan `Enter` saat fokus tidak di tombol membuka pertanyaan. Satu klik pada tombol lanjut di dalam kotak hanya memajukan satu layar. Tab dan isi layar narasi sama dengan `narrationFor` di ketiga jalur, termasuk bagian `present` dan `absent` adegan 6. Wilayah `aria-live` berisi teks utuh layar yang tampil. [1280×720](F-05/adegan_1_narasi_1280x720.png), [1024×768](F-05/adegan_1_narasi_1024x768.png) |
| AC-3 | Lulus | Pertanyaan dan teks ketiga pilihan sama dengan `choiceText` di keenam adegan pada ketiga jalur, termasuk varian pilihan B adegan 6. Kotak huruf berisi A, B, C, dan nama tombol "Pilihan A: …". Fokus berada di pertanyaan, lalu Tab berurutan ke A, B, C (Shift+Tab kembali ke B). Pilihan berfokus berlatar `rgb(255, 210, 63)` dengan kursor ▶ terlihat; pilihan biasa berlatar `rgb(255, 246, 224)` tanpa kursor; lebar tombol sama saat biasa dan fokus. [Tangkapan layar](F-05/adegan_5_pilihan_1280x720.png) |
| AC-4 | Lulus | Klik, `Enter` pada tombol berfokus, `Spasi` pada tombol berfokus, `1`, `2`, `3`, `a`, `b`, `c`, `A`, `B`, dan `C` masing-masing memilih pilihan yang benar. Sesudah memilih: status "Kelas memilih B."; B berstatus dipilih (latar `sun`, cincin `inset` 4 px di 1280×720); A dan C nonaktif (latar `rgb(201, 212, 229)`, teks dan kotak huruf `rgb(58, 74, 107)`); ketiganya `disabled`. Tombol `3` dan klik pada C sesudahnya tidak mengubah status |
| AC-5 | Lulus | Di setiap pilihan yang diambil uji (15 reaksi di layar permainan; ke-18 reaksi juga lulus di uji pratinjau F-04): urutan `data-char`/`data-pose` sama dengan `choice.reaction`, tepi bawah di 157k, tepi kiri di `(x − floor(w/2))·k`, dan ikon emosi sesuai tabel F-04 (±1 px). Label panggung diakhiri "Reaksi tokoh atas pilihan X.". Tombol "Lanjut" jembatan muncul dan berfokus 1.150–1.600 ms sesudah tombol pilihan ditekan. [Tangkapan layar](F-05/adegan_4_jembatan_b_1280x720.png) |
| AC-6 | Lulus | Klik ganda pada "Lanjut" hanya memajukan ke adegan 2, dan tetap di sana 500 ms kemudian. Dua kali `Enter` dengan cepat hanya memajukan ke adegan 3. Di adegan 5 tidak ada teks peran kuis yang tampil, dan "Lanjut" membawa ke adegan 6 |
| AC-7 | Lulus | Dengan jam uji yang dijeda: lapisan `data-time="siang"` berisi 144 blok; posisi, lebar 20 px, jeda, durasi `0.24s`, dan warna `rgb(110, 198, 242)` sama dengan `wipeSchedule()`; panel bawah kosong. Pada 100 ms blok yang terlihat sama dengan jadwal dan panggung masih adegan 2. Pada 200 ms bilah atas dan panggung berganti ke adegan 3. Pada 300 ms blok yang terlihat sama dengan jadwal. Pada 400 ms lapisan hilang dan layar narasi 1 adegan 3 tampil dengan fokus di tombol lanjut. `Spasi`, `Enter`, `1`, dan `2` selama pergantian tidak berpengaruh. Dengan waktu nyata, kelima sapuan memakai warna waktu adegan berikutnya, narasi tampil 390–600 ms sesudah `Enter`, dan dari adegan 6 layar akhir tampil tanpa sapuan. [100 ms](F-05/sapuan_2_ke_3_100ms_1280x720.png), [300 ms](F-05/sapuan_2_ke_3_300ms_1280x720.png) |
| AC-8 | Lulus | Dengan `prefers-reduced-motion: reduce`, teks narasi langsung lengkap dan `getAnimations()` kosong di narasi dan jembatan. Sesudah "Lanjut": tanpa blok sapuan; `data-fade="keluar"` dengan animasi `ss-fade-out` 0,075 s; 75 ms kemudian `data-fade="masuk"` dengan `ss-fade-in` 0,075 s dan bilah atas "Adegan 2/6"; 150 ms kemudian tanpa `data-fade`, narasi tampil, dan `getAnimations()` kembali kosong |
| AC-9 | Lulus | Sesudah adegan 6: judul "Keenam adegan selesai" berfokus, kalimat, keterangan, tombol "Main lagi dari adegan 1", dan tautan "Kembali ke galeri" (`../`) sesuai teks final. Tab lalu `Enter` pada "Main lagi" membuka layar narasi 1 adegan 1 dengan fokus di tombol lanjut. Permainan kedua (semua A) dan ketiga (B-B-B-C-C-C) menampilkan bagian `absent` adegan 6, jadi bendera dari permainan pertama tidak terbawa. [Tangkapan layar](F-05/akhir_sementara_1280x720.png) |
| AC-10 | Lulus | Control+2, Alt+2, Meta+2, `4`, `d`, `Escape`, dan tekanan `2` dengan `repeat` tidak memilih. `Spasi` pada pilihan B yang berfokus memilih tepat satu kali. Halaman tidak bergulir (`scrollX` dan `scrollY` 0) |
| AC-11 | Lulus | Di 1280×720, 1366×768, 1920×1080, dan 1024×768: bilah atas 8u, area panggung 52u, panel bawah 40u (±1 px); bingkai panggung 320k × 180k dengan k = 2, 2, 3, dan 1,664 (±0,005). Panel bawah tidak meluap di setiap layar narasi, layar pilihan, dan layar jembatan keenam adegan, pada dua permainan per ukuran (kedua varian adegan 6). Tanpa bilah gulir. Tata letak pratinjau diperiksa uji F-04 AC-5. [1024×768](F-05/adegan_5_pilihan_1024x768.png), [1920×1080](F-05/adegan_5_pilihan_1920x1080.png) |
| AC-12 | Lulus | `--ss-px` bernilai 2, 2, 3, dan 2 px. Garis `ss-button` (layar kerangka), `ss-chip` (pratinjau), kotak narasi, tombol lanjut (narasi dan jembatan), dan tombol pilihan 4, 4, 6, dan 4 px. Cincin `ss-chip` terpilih dan pilihan dipilih `inset` 2p. Lebar tombol pilihan sama saat biasa dan fokus. [Pratinjau](F-05/pratinjau_adegan_3_1280x720.png) |
| AC-13 | Lulus | `<h1>` tersembunyi "Adegan n: judul" benar di keenam adegan pada ketiga jalur. Panggung `role="img"` dengan label sesuai, dan wilayah `aria-live="polite"` ada. Fokus berpindah ke tombol lanjut, pertanyaan, baris status lalu tombol jembatan, dan judul layar akhir. Kontras terukur ≥ 4,5:1 untuk teks pilihan (biasa, fokus, dipilih, nonaktif), kotak huruf, pertanyaan, dan tab judul, di keempat ukuran |
| AC-14 | Lulus | Dengan keyboard saja di 1280×720, ketiga jalur (semua B, semua A, B-B-B-C-C-C) berjalan dari adegan 1 sampai layar akhir sementara, dua kali lewat "Main lagi". Varian adegan 6 muncul hanya di jalur semua B. Di ke-28 uji ujung ke ujung: 0 galat konsol, 0 respons 4xx/5xx, dan 0 permintaan ke host lain |
| AC-15 | Lulus | `controls.test.ts`: 18 uji lulus (perintah keyboard, aturan pengabaian, teks per huruf, jadwal sapuan, tim bawaan, aksi awal, jembatan dari fase `impact`, `quiz`, dan `stars`, main lagi, dan tiga jalur dengan naskah asli). `layout.test.ts`: 14 uji lulus, termasuk `stageScaleForScreen(576)` ≈ 1,664, `uiPixel`, dan `parseRoute` |
| AC-16 | Lulus | Ke-16 uji ujung ke ujung F-04 lulus dengan harapan baru: panel bawah 40u dan area panggung 52u, k = 1,664 di 1024×768, dan tiga tombol layar kerangka |
| AC-17 | Lulus | `build:pages` kode 0. JS permainan 41,26 KB (13,93 KB gzip) ditambah React 60,18 KB gzip, total sekitar 74 KB dari anggaran 150 KB; 0 penanda `__THREE__`. Semua `src`/`href` HTML permainan relatif (`../`). `index.html`, `main-Bp-7VtNx.css`, `main-CC47J1DW.js`, dan `jsx-runtime-CmKW-gyo.js` identik byte dengan build sebelum F-05, juga sesudah dokumen diperbarui |
| AC-18 | Lulus | `tsc --noEmit` seluruh proyek: 0 galat. ESLint `--max-warnings 0` pada 16 file kode baru dan yang diubah, termasuk `e2e/`: kode 0. Tidak ada `any`. `git diff` terhadap keadaan F-04 untuk `engine/` kosong, dan `engine/` tetap tanpa `setTimeout` |
| AC-19 | Lulus | Design System 0.5, Architecture 0.7, dan `PLAN.md` sesuai bagian "Perubahan dokumen". `git diff --name-status` terhadap keadaan F-04 memuat 33 berkas (23 baru, 10 diubah), tanpa penghapusan, dan semuanya disebut spesifikasi atau berupa tangkapan layar bukti. `package.json` dan `pnpm-lock.yaml` tidak berubah; `install --frozen-lockfile`, `content:check`, dan `test` lulus |

## Perintah yang dijalankan dan hasilnya

1. `npx pnpm@11.25.0 install --frozen-lockfile`: kode 0, "Lockfile passes supply-chain policies", "Lockfile is up to date".

2. `npx pnpm@11.25.0 content:check`: kode 0, "Verifikasi rujukan: 0 dari 14 terverifikasi." (kotak verifikasi memang belum dicentang).

3. `npx pnpm@11.25.0 test`: kode 0.

   ```
   Aset game: 65 berkas terdaftar, 61,8 KB dari anggaran 4 MB.
   Belum terdaftar di manifest: tidak ada.
   Tercatat di CREDITS.md tetapi belum terdaftar: tidak ada.
   Test Files  6 passed (6)
        Tests  158 passed | 1 skipped (159)
   ```

   Uji yang dilewati adalah uji mode rilis, yang hanya berjalan dengan `RILIS=1`.

4. `npx pnpm@11.25.0 build:pages`: kode 0.

   ```
   dist-pages/sehari-setara/index.html     0.72 kB │ gzip:  0.42 kB
   dist-pages/assets/game-DMAD88-f.css    12.29 kB │ gzip:  2.73 kB
   dist-pages/assets/game-DrRZe-NR.js     41.26 kB │ gzip: 13.93 kB
   dist-pages/assets/jsx-runtime-…js     190.84 kB │ gzip: 60.18 kB
   ```

   SHA-256 keempat berkas galeri sama dengan build sebelum F-05.

5. `npx pnpm@11.25.0 test:e2e`, dijalankan dua kali sesudah perbaikan Temuan 1: kode 0, "28 passed" pada kedua putaran (2,1 dan 2,9 menit). Rinciannya: 16 uji F-04 dan 12 uji `e2e/alur-permainan.spec.ts`.

6. `npx tsc --noEmit -p tsconfig.json --incremental false`: kode 0. `npx eslint --max-warnings 0` pada 16 file kode: kode 0.

7. `git diff --name-status` terhadap keadaan F-04: 33 berkas, 23 baru dan 10 diubah.

## Tangkapan layar

Semua di folder [`F-05/`](F-05/):

| Berkas | Isi |
|---|---|
| `kerangka_1280x720.png` | Layar kerangka dengan tiga tombol (Tab pertama di "Kembali ke galeri") |
| `adegan_1_narasi_1280x720.png`, `adegan_1_narasi_1024x768.png` | Kotak narasi dengan teks lengkap dan tombol lanjut berfokus |
| `adegan_5_pilihan_1280x720.png`, `adegan_5_pilihan_1024x768.png`, `adegan_5_pilihan_1920x1080.png` | Layar pilihan terpanjang, fokus di B |
| `adegan_4_jembatan_b_1280x720.png` | Reaksi B dan tombol "Lanjut" jembatan |
| `sapuan_2_ke_3_100ms_1280x720.png`, `sapuan_2_ke_3_300ms_1280x720.png` | Sapuan dari adegan 2 ke 3 |
| `akhir_sementara_1280x720.png` | Layar akhir sementara, fokus di judul |
| `pratinjau_adegan_3_1280x720.png` | Pratinjau dengan tata letak dan bingkai baru |

## Daftar periksa manual (AGENTS bagian 9)

- [x] Bisa dimainkan sampai akhir hanya dengan keyboard: tiga jalur lewat uji AC-14.
- [x] Mode kurangi gerak mematikan sapuan dan animasi sprite: uji AC-8.
- [x] Tampilan rapi di 1024×768 dan 1920×1080: tangkapan layar di atas.
- [ ] Teks terbaca dari jarak sekitar 8 meter di proyektor: belum diuji, menunggu pemilik proyek.
- [ ] Berjalan lancar di laptop kelas bawah: belum diuji, menunggu pemilik proyek.

## Temuan

1. **Jam uji Playwright tetap berjalan sampai dijeda.** Pada putaran pertama seluruh `test:e2e`, dua uji yang memakai `page.clock` gagal: sapuan pada 100 dan 300 ms, dan pudar kurangi gerak. Sesudah `page.clock.install()`, waktu palsu ternyata tetap maju mengikuti waktu nyata, sehingga pengatur waktu 200, 400, dan 75 ms bisa berjalan sebelum uji memeriksanya. Pada putaran sebelumnya kedua uji itu lulus karena kebetulan cepat. Perbaikan: ketiga uji yang mengatur waktu kini menjeda jam lewat `page.clock.pauseAt` sesudah halaman termuat, lalu memajukannya hanya dengan `page.clock.runFor`. Sesudahnya, putaran ulang tiga kali lulus di 33 uji yang sempat berjalan, dan dua putaran penuh lulus 28 dari 28. Ini kesalahan cara uji, bukan kesalahan game.
2. **Ruang cadangan panel pilihan kurang dari satu baris.** Layar pilihan dan jembatan adegan 3 dan 5 menyisakan 3,05u (1024×768) sampai 3,3u (ukuran lain), sedangkan satu baris pilihan 4,03u. Sesuai spesifikasi, bila teks pilihan kelak diperpanjang, uji tata letak akan gagal dan menunjukkan luapannya.

## Keputusan: Lulus

Kesembilan belas kriteria lulus. `content:check`, `test`, `build:pages`, dan `test:e2e` lulus, dan anggaran ukuran terpenuhi. Halaman permainan tanpa galat konsol dan tanpa respons 4xx, dan berkas galeri tidak berubah. Dua butir manual menunggu pengecekan pemilik proyek.
