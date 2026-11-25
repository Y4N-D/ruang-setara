# Hasil uji JS-16c — 25 November 2026

Tautan layar judul Sehari Setara dan catatan rilis v1.0, sesuai spesifikasi [JS-16c-tautan-judul.md](../specs/JS-16c-tautan-judul.md) (disetujui 25 Nov 2026, D-1 dan D-2 = a). Diuji di mesin agen (Linux, Node 22.23.5, pnpm 11.25.0, Chromium 1243). Uji ujung ke ujung Sehari Setara dijalankan dengan konfigurasi sementara yang menunjuk Chromium 1243; konfigurasi itu dihapus dan tidak ikut ZIP.

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 | Lulus | `judul-pengaturan-prolog.spec.ts` (uji JS-16c): tautan di bawah kalimat pengantar, di dalam zona judul, dan kalimat pengantar tetap satu baris di 1280 × 720, 1366 × 768, 1920 × 1080, 1024 × 768, 731 × 411, dan 640 × 360. Pita tetap empat kontrol; uji layar judul yang sudah ada lulus di keempat ukuran tanpa diubah |
| AC-2 | Lulus | `href` sama dengan `ALAMAT_JEJAK_SETARA`, tanpa `target`; `tautan-jejak.test.ts`: tidak ada alamat penuh di komponen Sehari Setara |
| AC-3 | Lulus | Uji JS-16c masa tunggu: pada 599 ms tautan ber-`aria-disabled` dan klik dibatalkan; pada 600 ms tautan bisa diklik |
| AC-4 | Lulus | Shift+Tab dari "Mulai" menuju tautan; pemeriksaan kontras zona judul lulus; tinggi sentuh sedikitnya 24 px di keenam ukuran |
| AC-5 | Lulus | Nama yang dibaca pembaca layar: "Main bersama kelas di Jejak Setara (situs lain)" |
| AC-6 | Lulus | `sehari-setara.spec.ts` (16 uji) dan `galeri-integrasi.spec.ts` (4 uji) lulus, termasuk pemeriksaan tanpa permintaan ke situs lain |
| AC-7 | Lulus dengan penyimpangan 1 | `test` 299 lulus (1 dilewati seperti sebelumnya); `content:check` 42 lulus; `test:jejak` 1.377 lulus; `content:check:jejak` dan `tsc` bersih; `test:e2e` Sehari Setara sebagian (penyimpangan 1) |
| AC-8 | Lulus | `build:pages`: 178 berkas. Yang berbeda hanya `sehari-setara/index.html` dan dua aset Sehari Setara berhash (`game-*.js`, `game-*.css`); berkas galeri dan Tailwind identik byte |
| AC-9 | Lulus | `kerangka.test.ts` (JS-16c): `rilis/v1.0.md` memuat keenam judul templat 12.4 dan isi P-7 |
| AC-10 | Lulus | `AGENTS.md` akar butir 4, AGENTS Jejak butir 12, Architecture Sehari Setara 11, PLAN Sehari Setara, Architecture Jejak 16, PRD 20 dan 21, `PLAN.md` |

## Perintah yang dijalankan dan hasilnya

| Perintah | Hasil |
|---|---|
| `test` (Sehari Setara dan bersama) | 15 berkas, 299 lulus, 1 dilewati |
| `content:check` | 42 lulus, 1 dilewati |
| `test:e2e` Sehari Setara | 82 uji lulus dari berkas yang dijalankan (penyimpangan 1) |
| `test:jejak` | 90 berkas, 1.377 uji lulus |
| `content:check:jejak` | Lulus |
| `tsc --noEmit` | Bersih |
| `build:pages` | Hanya berkas Sehari Setara yang berbeda (AC-8) |

## Temuan

1. **Penyimpangan 1 — uji ujung ke ujung Sehari Setara belum dijalankan semuanya.**
   - Sudah dijalankan dan lulus: `judul-pengaturan-prolog.spec.ts` (45 uji, seluruhnya), `sehari-setara.spec.ts` (16), `galeri-integrasi.spec.ts` (4), dan 17 uji pertama dari `alur-permainan`, `kartu-dampak`, dan `suara`.
   - Belum dijalankan: sisa ketiga berkas itu, `akhir-rekap-refleksi`, `kuis-peran`, dan `tim-waktu-bintang`. Berkas-berkas ini panjang (uji galeri saja sekitar 2 menit per uji), dan mesin agen membatasi satu perintah sekitar 5 menit.
   - Perubahan JS-16c hanya menambah satu tautan di layar judul; berkas yang belum dijalankan hanya melewati layar judul dengan tombol "Mulai". Uji Sehari Setara tidak dijalankan di CI (Architecture Sehari Setara 4).
   - Saran: (a) diterima, dan sisanya dijalankan di awal Test JS-16d; (b) ZIP kedua ditahan sampai sisanya lulus.
2. **Letak tautan** mengikuti percobaan Plan: zona judul masih punya ruang di keenam ukuran, termasuk HP 640 × 360.
3. **Serah terima dua ZIP** (usulan 7a): ZIP pertama hanya berisi catatan rilis, uji, dan dokumen Jejak, jadi "Jejak: uji" tetap hijau tanpa ZIP kedua.

## Keputusan: Lulus

Lulus, dengan penyimpangan 1 yang perlu diterima pemilik proyek (saran a).
