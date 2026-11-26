# Hasil uji JS-23 — 26 November 2026

Spesifikasi: [JS-23-peta-medan.md](../specs/JS-23-peta-medan.md) (`Spesifikasi disetujui: JS-23`, D-1 sampai D-3 = a). Diuji dalam mode ZIP dari ZIP `main` sesudah commit `c1c1a86`, ditambah isi ZIP Gerbang 1 dan Gerbang 2 JS-23, dengan Chromium 1243 di mesin agen.

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 Pilihan gambar | Lulus | `medan.test.ts`: `pilihMedan` memberi 1 untuk rasio 1, 1,5, dan 1,99, serta 2 untuk rasio 2, 2,625, dan 3. `medan.uji.ts`: peta besar dan peta kelas memakai `peta_medan_4` |
| AC-2 Pemuatan | Lulus | `medan.uji.ts`: HP rasio 2,625 dan 3 meminta `peta_medan_2` dan `peta_medan_4` masing-masing sekali tanpa `peta_medan_1`, dan laptop rasio 1 meminta `peta_medan_1` dan `peta_medan_4`. Pemain yang semua gambar medannya digagalkan tetap bisa bergabung dan masuk ronde. Layar kelas meminta `peta_medan_4` tepat sekali di lobi, dan konsol sebelum membuka layar kelas tidak memintanya |
| AC-3 Peta mini bermedan | Lulus | `medan.uji.ts` di HP 731 × 411 (rasio 2,625), HP 640 × 360 (rasio 3), dan laptop 1280 × 720: piksel peta mini di tengah setiap sel yang satu warna dengan kedelapan tetangganya di gambar sumber berwarna sama (sedikitnya 20 sel per layar), dan blok jalan aspal berwarna `#6B7A99`. Halte, penanda, dan panah diri tampak di tangkapan layar |
| AC-4 Kanvas simpanan | Lulus | `medan.test.ts`: ukuran 112 × 70, 168 × 105, 294 × 184, dan 336 × 210; kanvas simpanan dibuat sekali selama sumber dan ukuran tetap, tanpa penghalusan. Peta mini bermedan sesudah gambar siap (AC-3) |
| AC-5 Cadangan dan coba ulang | Lulus | `medan.uji.ts`: dengan semua gambar medan digagalkan, peta mini dan peta besar menampilkan zona berwarna (tengah Z5 `#C98B4F`) tanpa pesan. `medan.test.ts`: satu kali coba ulang tepat 10 detik sesudah gagal, dan tidak ada coba ulang sesudah gagal kedua |
| AC-6 Peta besar bermedan | Lulus | `medan.uji.ts`: lebar kanvas 480, 320, 960, 640, dan 1440 px CSS (skala 3, 2, 6, 4, dan 9) di HP 731 × 411, dunia 610 × 343, 1280 × 720, 1024 × 768, dan 1920 × 1080, serta skala 2 di HP 640 × 360 rasio 3; pikselnya cocok dengan `peta_medan_4`. Peta besar yang sudah terbuka berganti dari zona berwarna ke medan begitu `peta_medan_4` tiba, tanpa ditutup |
| AC-7 Label dan lapisan | Lulus | `medan.uji.ts` di keenam ukuran: kedelapan label berpojok di (kiri × s + 3, atas × s + 3), seluruhnya di dalam zonanya, dan tidak bertumpuk satu sama lain, termasuk label Z1, Z2, Z3, dan Z8 di HP 640 × 360. `elementFromPoint` di tengah halte 1, yang bertumpuk dengan label Z3, mengembalikan halte. Lapisan label 1, halte dan penanda 2, dan "Kamu di sini" 3. `medan.test.ts` memeriksa skala 2 sampai 9 |
| AC-8 Peta kelas bermedan | Lulus | `medan.uji.ts`: gambar `peta_medan_4` dengan `image-rendering: pixelated`, delapan ikon zona, tanpa kotak zona dan tanpa unsur kejadian, dengan label "Peta kampung dengan 3 pemain. Letak kejadian tidak ditampilkan." |
| AC-9 Titik pemain | Lulus | `tampilan-kelas.test.ts`: pergeseran (x/16 − 1,5, y/16 − 2,25). `medan.uji.ts`: garis luar `ink` 5 px dan garis dalam `white` 2 px bertebal tetap (`vector-effect: non-scaling-stroke`) dengan isi warna tas; lebar titik sama dengan 3 ubin (selisih di bawah 1 px) di 1024 × 768, 1280 × 720, dan 1920 × 1080 |
| AC-10 Cadangan peta kelas | Lulus | `medan.uji.ts`: dengan `peta_medan_4` digagalkan, latar peta `rgb(201, 212, 229)` (`mist`) dengan delapan ikon zona dan tiga titik, tanpa galat halaman |
| AC-11 Kejadian tetap tersembunyi | Lulus | `kejadian.uji.ts` dan `skill.uji.ts` lulus, dan peta kelas tanpa unsur kejadian (AC-8) |
| AC-12 Perbaikan ESLint | Lulus | ESLint keempat folder Jejak dengan `--max-warnings 0`: 0 masalah (dua galat lama hilang). Semua uji ujung ke ujung konsol dan layar kelas lulus, termasuk `masuk-ulang.uji.ts` |
| AC-13 Ukuran | Lulus | Tabel anggaran di bawah: semua kenaikan di bawah batas |
| AC-14 Uji lama | Lulus | Semua uji lama lulus tanpa melonggarkan ambang; uji kinerja `dunia.uji.ts` lulus saat dijalankan sendiri (Temuan 1) |
| AC-15 Perintah resmi | Lulus | Tabel perintah di bawah |
| AC-16 Tangkapan layar | Lulus | 13 berkas di [JS-23/](JS-23/) |
| AC-17 Pemeriksaan manual | Menunggu | Pemilik proyek di lingkungan uji: peta di HP sungguhan dan peta kelas di proyektor |
| AC-18 Dokumen | Lulus | PRD, Design System, dan Architecture diubah di ZIP Gerbang 2; `PLAN.md` dan spesifikasi (catatan Build) diperbarui di ZIP ini |

## Perintah yang dijalankan

| Perintah | Hasil |
|---|---|
| `content:check:jejak` | Lulus, 13 berkas, 393 uji |
| `test:jejak` | Lulus, 92 berkas, 1.403 uji |
| `test:jejak:server` | Lulus, 13 berkas, 70 uji (350 detik) |
| `build:jejak`, lalu `scripts/jejak-setara/anggaran.mjs` | Lulus, semua di bawah batas |
| `tsc --noEmit` | Lulus |
| ESLint `app/`, `server/`, `e2e/`, dan `scripts/` Jejak, `--max-warnings 0` | Lulus, 0 masalah |
| `test:e2e:jejak`, dalam tiga perintah | Lulus, 65 uji di 16 berkas: (1) `bank`, `dunia`, `gabung`, `hasil`, dan `jaringan`: 16 lulus, sedangkan uji kinerja `dunia.uji.ts` gagal di bagian CPU normal (Temuan 1); (2) uji kinerja itu sendiri: lulus (3,7 menit); (3) 11 berkas sisanya, termasuk `medan.uji.ts`: 48 lulus (9,2 menit) |
| `build:pages` | Lulus, 178 berkas identik byte dengan build dasar |
| `sim:beban` | Tidak wajib: protokol, inti ruang, dan kiriman ke D1 tidak berubah |

## Anggaran ukuran

| Butir | Sebelum (`main`) | Sesudah | Batas kenaikan (AC-13) | Batas |
|---|---|---|---|---|
| Kode layar pemain (gzip) | 140,52 KB | 141,19 KB (+0,67) | +1 KB | 200 KB |
| Kode konsol awal (gzip) | 137,08 KB | 137,09 KB (+0,01) | +0,2 KB | 350 KB |
| Potongan layar kelas | 11,13 KB | 11,21 KB (+0,08) | +0,5 KB | — |
| Seluruh aset layar pemain | 233,46 KB (251 berkas) | 249,07 KB (254 berkas, +15,61) | +16 KB | 2 MB |

## Tangkapan layar

Di [JS-23/](JS-23/): peta mini `mini-hp-731x411.png`, `mini-hp-640x360-r3.png`, dan `mini-laptop-1280x720.png`; peta besar `besar-hp-731x411.png`, `besar-hp-610x343.png`, `besar-1024x768.png`, `besar-1280x720.png`, `besar-1920x1080.png`, dan `besar-cadangan-1280x720.png`; peta kelas `kelas-1024x768.png`, `kelas-1280x720.png`, `kelas-1920x1080.png`, dan `kelas-cadangan-1280x720.png`.

## Temuan

1. **Uji kinerja `dunia.uji.ts` (40 pemain tiruan) peka beban mesin.** Saat berjalan bersama berkas lain, bagian CPU normal mencatat 235 bingkai dalam 5 detik (47 per detik, batas 50) dan bingkai terlama 50 ms (batas 25 ms), sedangkan semua bagian CPU 6 kali lebih lambat lulus. Saat dijalankan sendiri dengan kode JS-23, ujinya lulus: bagian CPU normal 270 bingkai (54 per detik), p95 3 ms, dan bingkai terlama 6 ms; dengan CPU 6 kali lebih lambat, p95 12 ms di lobi, 25 ms saat berjalan, 16 ms dekat kejadian, dan 12 ms saat pergantian masa, tanpa bingkai 100 ms ke atas. Bagian CPU normal diukur di lobi, saat peta mini tidak digambar; JS-23 hanya mulai memuat gambar medan saat layar dunia terpasang, sebelum pengukuran. Ini sesuai catatan lama bahwa uji yang peka beban sebaiknya dijalankan terpisah.
2. **Perintah ujung ke ujung pertama terhenti** sesudah uji ke-18 karena giliran kerja Sesi A berakhir, bukan karena uji. Berkas `kejadian.uji.ts` sampai `statistik.uji.ts` dijalankan ulang dalam perintah ketiga.
3. **Uji JS-23 ada di berkas baru `e2e/jejak-setara/medan.uji.ts`**, dan aspal diperiksa di blok 2 × 2 ubin (catatan Build di spesifikasi).
4. **Tangkapan layar fitur lama** (misalnya `tests/JS-10/`) ikut ditulis ulang oleh uji ujung ke ujung. Berkas itu tidak disertakan di ZIP.

## Keputusan

**Lulus.** AC-17 menunggu pemeriksaan manual pemilik proyek di lingkungan uji.
