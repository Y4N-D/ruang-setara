# Hasil uji F-02 — 21 Oktober 2026

Spesifikasi: [`specs/F-02-mesin-permainan.md`](../specs/F-02-mesin-permainan.md). Lingkungan: Node 22.22.2, pnpm 11.25.0, Vite 8.0.13, Vitest 5.0.4, Chromium 141.0.7390.37 (headless, lewat Playwright untuk Python 1.56 di lingkungan agen, di luar repositori).

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 | Lulus | `types.ts` memuat 14 tipe Architecture bagian 5 dengan nama dan bentuk yang sama, ditambah `quizAnswer`, `EndingId`, `Stars`, `Settings`, `HistoryEntry`, `TeamSetup`, dan `GameAction`. Semua uji dan `tsc` memakai tipe ini tanpa galat |
| AC-2 | Lulus | `rules.test.ts`: `clamp` (5 nilai), `activeTeamIndex` (2, 3, 4 tim di adegan 1–6), dan `endingFor` (9 titik, termasuk semua titik batas di spesifikasi) |
| AC-3 | Lulus | Uji "alur permainan": urutan fase lengkap dari `title` sampai `reflection`, lalu `MAIN_LAGI` ke `title`; `sceneIndex` naik setiap pergantian adegan; `history` mencatat s1–s6 berurutan |
| AC-4 | Lulus | 14 keadaan contoh (setiap fase, ditambah kuis belum dan sudah dijawab) × 13 aksi: setiap aksi yang tidak berlaku mengembalikan objek yang sama, dan setiap aksi yang berlaku mengubah keadaan. Ditambah uji `PILIH` kedua dan aksi pengatur waktu sesudah waktu habis |
| AC-5 | Lulus | Urutan B, B, B, B, B, A: indikator H 60 → 70 → 85 → 100 → 100 → 80 dan K 65 → 80 → 90 → 100 → 100 → 85 (batas per langkah); setiap `PILIH` menambah tepat satu entri dengan tim aktif dan bintang 0; pengatur waktu berhenti; bendera tanpa duplikat |
| AC-6 | Lulus | Invarian `withDerived` diperiksa setelah setiap aksi di semua uji alur. Memotong `history` di titik 0 sampai 6 lalu menghitung ulang mengembalikan indikator, bendera, dan bintang yang tercatat di titik itu |
| AC-7 | Lulus | Tiga tim: giliran mangga, laut, daun, mangga, laut, daun; bintang 2-1-0-2-2-1 menjadi Mangga 4, Laut 3, Daun 1. Rotasi dua dan empat tim juga benar |
| AC-8 | Lulus | Pilihan B di adegan 4 menghasilkan varian pilihan dan narasi `present` di adegan 6. Pilihan A menghasilkan teks dasar dan narasi `absent` |
| AC-9 | Lulus | Adegan tanpa kuis langsung ke `stars`. Di adegan 5: `LANJUT` ditolak sebelum dijawab, jawaban pertama ("polisi") terkunci, indikator tidak berubah, lalu `quizAnswer` kembali `null` di adegan 6. `isQuizCorrect` benar hanya untuk "hakim" |
| AC-10 | Lulus | Empat uji pengatur waktu: habis di 0 tanpa pindah fase dan `PILIH` tetap diterima; jeda dan lanjut; `TAMBAH_30` (habis → 30 berjalan, dijeda → 90 tetap dijeda, berjalan 50 → 80 dengan durasi 80); `LEWATI_DISKUSI` → 0 |
| AC-11 | Lulus | 2, 3, dan 4 tim diterima; 1 tim, 5 tim, `id` ganda, dan nama kosong ditolak; `UBAH_PENGATURAN` bekerja di 15 keadaan contoh, mengabaikan nilai tidak sah, tidak menyentuh pengatur waktu yang berjalan, dan durasi barunya berlaku di diskusi berikutnya |
| AC-12 | Lulus | Enam B berakhir `setara`; B, B, B, C, C, C berakhir `hampir`; enam A berakhir `berat` |
| AC-13 | Lulus | Sesudah `MAIN_LAGI`, keadaan sama dengan keadaan awal ber-pengaturan sama (durasi 90, suara mati), dengan tiga tim yang sama dan bintang 0 |
| AC-14 | Lulus | Satu permainan penuh (termasuk aksi pengatur waktu dan pengaturan) dengan keadaan dan adegan yang dibekukan secara mendalam berjalan tanpa galat. Ketiga file `engine/` tidak memuat `setInterval`, `setTimeout`, `Date`, maupun `Math.random` |
| AC-15 | Lulus | `npx pnpm@11.25.0 test`: Vitest 5.0.4, 2 file, 66 uji lulus. `install --frozen-lockfile` kode 0. `package.json` hanya bertambah `vitest` dan skrip `test`; workflow mendapat langkah "Uji game" sebelum build |
| AC-16 | Lulus | `build:pages` kode 0. `dist-pages/sehari-setara/index.html`, `dist-pages/index.html`, dan daftar berkas `assets/` identik dengan hasil F-01; kode mesin tidak ikut terbundel. Pemeriksaan browser F-01 diulang: semua lulus (0 galat konsol, 0 respons 4xx di halaman permainan dan galeri) |
| AC-17 | Lulus | `tsc --noEmit` seluruh proyek: kode 0, 0 galat. ESLint `--max-warnings 0` pada `engine/`, `__tests__/`, dan `vitest.config.ts`: kode 0. Tidak ada `any` |
| AC-18 | Lulus | Architecture 0.3 (kepala dokumen, A9, `quizAnswer`, label `LANJUT`, dua butir aturan), baris F-13 di `AGENTS.md`, dan `PLAN.md` sesuai bagian "Perubahan dokumen" |

## Perintah yang dijalankan dan hasilnya

Sesuai keputusan Gerbang 1, `content:check` (F-03) dan `test:e2e` (F-04) belum ada. Halaman diperiksa dengan pemeriksaan browser yang sama seperti F-01.

1. `npx pnpm@11.25.0 add -D "vitest@^5.0.4"`: terpasang 5.0.4. `pnpm-lock.yaml` bertambah 183 baris (18 paket), tanpa paket yang dihapus.
2. `npx pnpm@11.25.0 install --frozen-lockfile`: kode 0; lockfile lolos kebijakan rantai pasok.
3. `npx pnpm@11.25.0 test --reporter=verbose`: kode 0.

   ```
   RUN  v5.0.4
   ✓ app/sehari-setara/__tests__/reducer.test.ts (45 tests)
   ✓ app/sehari-setara/__tests__/rules.test.ts (21 tests)
   Test Files  2 passed (2)
        Tests  66 passed (66)
   ```

4. `npx pnpm@11.25.0 build:pages`: kode 0. Keluaran halaman permainan sama persis dengan F-01:

   ```
   dist-pages/sehari-setara/index.html          0.72 kB │ gzip:   0.42 kB
   dist-pages/assets/game-CXNfzINz.js           0.94 kB │ gzip:   0.46 kB
   dist-pages/assets/jsx-runtime-CmKW-gyo.js  190.84 kB │ gzip:  60.18 kB
   ```

5. `cmp` terhadap salinan hasil build F-01: HTML permainan, HTML galeri, dan daftar berkas `assets/` identik. Pencarian `komangDibela`, `SIMPAN_PENGATURAN`, dan `BERI_BINTANG` di JS hasil build tidak menemukan apa pun.
6. `node scripts/game/serve-subpath.mjs --port 4183`, lalu skrip pemeriksa browser F-01 pada 1280×720, 1366×768, 1920×1080, dan 1024×768: semua pemeriksaan lulus.
7. `npx tsc --noEmit -p tsconfig.json --incremental false`: kode 0, 0 galat. `npx eslint --max-warnings 0 app/sehari-setara/engine app/sehari-setara/__tests__ vitest.config.ts`: kode 0.
8. `git diff --name-status` terhadap keadaan F-01: 15 berkas, 9 baru dan 6 diubah (termasuk laporan ini).
9. Daftar periksa manual AGENTS bagian 9: belum ada butir yang berlaku, karena halaman tidak berubah.

## Temuan

1. **Halaman yang terbit tidak berubah sama sekali.** Mesin belum diimpor oleh `Game.tsx`, jadi kodenya tidak ikut terbundel dan anggaran kode permainan tetap 59,8 kB gzip dari 150 KB.
2. **Langkah "Uji game" belum pernah berjalan di GitHub Actions.** Perintah yang sama lulus di lingkungan agen. Hasil pertamanya baru terlihat pada push berikutnya; bila gagal, terbitan galeri dan permainan tertahan sampai diperbaiki.
3. **Saran vitest tentang `isolate: false` tidak dipakai.** Vitest menyarankannya untuk menghemat sekitar 0,5 detik, tetapi pemisahan antarberkas uji lebih aman, dan total waktu uji sudah sekitar 1,6 detik.
4. **Peringatan pnpm bukan dari F-02.** Peringatan tentang `eslint@9.39.4` dan `@esbuild-kit/*` yang usang sudah ada sebelumnya, tidak berasal dari `vitest`.

## Keputusan: Lulus

Kedelapan belas kriteria lulus, `test` dan `build:pages` lulus, dan halaman permainan tanpa galat konsol dan tanpa respons 4xx. `content:check` dan `test:e2e` dikecualikan untuk F-02 sesuai keputusan Gerbang 1.
