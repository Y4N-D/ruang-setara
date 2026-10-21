# PLAN — Sehari Setara

Status fitur dari backlog di `AGENTS.md` bagian 5. Setiap entri melewati Plan → Specify → Build → Test (`AGENTS.md` bagian 4) dan memakai templat 11.1.

| Fitur | Status | Spesifikasi | Laporan uji |
|---|---|---|---|
| F-01 | Selesai (21 Okt 2026) | [F-01-kerangka-halaman.md](specs/F-01-kerangka-halaman.md) | [F-01-hasil.md](tests/F-01-hasil.md) — lulus |
| F-02 | Selesai (21 Okt 2026) | [F-02-mesin-permainan.md](specs/F-02-mesin-permainan.md) | [F-02-hasil.md](tests/F-02-hasil.md) — lulus |

## Dependensi dan skrip yang ditunda

Dicatat 21 Okt 2026 atas permintaan pemilik proyek agar tidak terlewat. Setiap paket tetap memerlukan izin tertulis saat Plan fitur yang bersangkutan (`AGENTS.md` bagian 7, aturan 8).

| Yang dipasang | Jenis | Fitur | Ikut ditambahkan |
|---|---|---|---|
| `vitest` | Dependensi pengembangan | F-02 (terpasang 21 Okt 2026, versi 5.0.4) | Skrip `test` dan langkah "Uji game" di `.github/workflows/deploy-pages.yml` (Architecture bagian 4). Seri 5.x mendukung Vite 8; versi yang dipilih harus berumur ≥ 7 hari (`minimumReleaseAge` di `pnpm-workspace.yaml`). |
| Skrip `content:check` | Skrip, memakai `vitest` | F-03 | `app/sehari-setara/__tests__/content.test.ts` |
| `@playwright/test` | Dependensi pengembangan | F-04 | Skrip `test:e2e`, `playwright.config.ts`, `e2e/sehari-setara.spec.ts`, dan folder hasil Playwright di `.gitignore`. Versi 1.56, agar cocok dengan browser di lingkungan agen. |
| `@fontsource/press-start-2p`, `@fontsource/pixelify-sans` | Dependensi aplikasi | F-04 | Impor di `github-pages/sehari-setara/main.tsx`, lalu uji keterbacaan di proyektor (PRD bagian 14). |
| Skrip `assets:build` | Skrip | F-12 | `python scripts/game/art/build_assets.py` (Architecture bagian 4) |

Alasannya: F-02 adalah fitur pertama yang berisi uji unit. F-04 adalah fitur pertama sesudah F-01 yang menampilkan antarmuka permainan, sehingga uji ujung ke ujung, tangkapan layar, dan huruf final mulai berguna di sana.

## Catatan untuk Plan berikutnya

- Plan F-04: F-04 sudah menampilkan latar dan sprite, sedangkan `manifest.ts` baru dibuat di F-12. Perlu diputuskan apakah F-12 dikerjakan lebih dulu.
- Plan F-13: F-13 kini juga memuat FR-18, ulangi adegan dan kembali ke adegan sebelumnya (keputusan 21 Okt 2026). Reducer F-02 menjadikan `history` sumber kebenaran, sehingga pembatalan pilihan cukup memotong `history` lalu menghitung ulang.
- Plan F-05: Design System bagian 7 menyebut bingkai piksel "garis ink 2 px". F-01 membacanya sebagai px CSS. Sebelum panel dibangun, perlu dipastikan apakah yang dimaksud adalah piksel logis panggung.

## F-01 — Kerangka halaman game dan build dua halaman
- Status: Selesai (21 Okt 2026). Riwayat 21 Okt 2026: direncanakan dan disetujui; spesifikasi disetujui; dibangun; diuji dan lulus semua kriteria ([laporan](tests/F-01-hasil.md)); digabung ke `main` dan terbit di GitHub Pages (dikonfirmasi pemilik proyek).
- Memenuhi: A1; FR-15 sebagian, yaitu tautan "Kembali ke galeri" dengan `href="../"`. Tombol "Main lagi" ada di F-09 dan tautan dari galeri di F-11.
- Bergantung pada: —
- File yang dibuat/diubah:
  - Baru `github-pages/sehari-setara/index.html`: halaman game, `lang="id"`, ikon `../favicon.svg` (mencegah permintaan `/favicon.ico` yang berakhir 404).
  - Baru `github-pages/sehari-setara/main.tsx`: titik masuk; hanya memuat CSS game, bukan CSS galeri.
  - Baru `app/sehari-setara/Game.tsx`: komponen akar; untuk sementara menampilkan layar kerangka.
  - Baru `app/sehari-setara/content/copy.ts`: teks layar kerangka (Architecture bagian 14: teks berasal dari `content/`).
  - Baru `app/sehari-setara/styles/game.css`: token warna Design System bagian 4, satuan `--u` bagian 5, bingkai 16:9 dengan sisa ruang `ink`, fokus `sun` dengan kursor ▶.
  - Baru `scripts/game/serve-subpath.mjs`: menyajikan `dist-pages/` di bawah `/ruang-setara/` seperti GitHub Pages; hanya memakai modul bawaan Node.
  - Diubah `vite.pages.config.ts`: menambah input kedua `game` (Architecture bagian 4). Ditulis sebagai `build.rolldownOptions.input`, karena nama `rollupOptions` pada contoh Architecture sudah usang di Vite 8 (fungsinya sama).
  - Diubah `package.json`: hanya menambah skrip `dev:pages`. Dependensi tidak berubah.
  - Dokumen: `specs/F-01-kerangka-halaman.md`, `tests/F-01-hasil.md`, dan tangkapan layar di `tests/F-01/`.
  - Tidak disentuh: semua file galeri, `.github/workflows/deploy-pages.yml`, dan `pnpm-lock.yaml`.
- Aset yang dibutuhkan: tidak ada. Layar kerangka hanya berisi teks; aset gambar masuk lewat `manifest.ts` (F-12).
- Risiko:
  - Galeri dan game berada dalam satu build. Bila build game gagal, terbitan galeri ikut gagal. Mitigasi: `build:pages` dan pemeriksaan galeri di tahap Test.
  - Dengan dua titik masuk, Vite memisahkan kode bersama (React) ke berkas tersendiri, sehingga keluaran galeri berubah dari satu berkas JS menjadi beberapa. Kode galeri tidak berubah; galeri diperiksa tetap terbuka tanpa 404 dan tanpa galat konsol.
  - Path subfolder: halaman game harus memuat `../assets/…` dengan benar di `/ruang-setara/sehari-setara/`. Diperiksa lewat `serve-subpath.mjs`.
  - Bundel game tidak boleh ikut membawa kode galeri (three.js). Ukurannya diperiksa terhadap anggaran 150 KB gzip.
  - Push ke `main` langsung menerbitkan situs, jadi halaman kerangka bisa dibuka publik walau belum ditautkan dari galeri. Mitigasi: teks kerangka layak dibaca siswa; commit di cabang `fitur/F-01-kerangka-halaman` dan gabung ke `main` setelah Gerbang 3.
  - `pnpm dev` (Vinext) tidak menyajikan halaman game; pengembangan memakai `dev:pages`.
- Ukuran: S
- Keputusan Gerbang 1 (21 Okt 2026, balasan `Setuju: F-01` tanpa izin dependensi):
  1. Uji F-01 memakai pemeriksaan pengganti di lingkungan agen: `build:pages`, pemeriksaan isi `dist-pages/`, dan Chromium headless lewat `serve-subpath.mjs`. Perintah `content:check`, `test`, dan `test:e2e` belum dijalankan untuk F-01. `vitest` dibahas saat Plan F-02; `@playwright/test` dibahas lagi paling lambat saat Plan fitur antarmuka pertama.
  2. Paket huruf `@fontsource` belum dipasang. Layar kerangka memakai cadangan `monospace` (Design System bagian 5).

## F-02 — Tipe data, reducer, aturan permainan, uji unit
- Status: Selesai (21 Okt 2026). Riwayat 21 Okt 2026: direncanakan dan disetujui dengan izin `vitest`; spesifikasi disetujui; dibangun; diuji dan lulus semua kriteria ([laporan](tests/F-02-hasil.md)).
- Memenuhi (sisi mesin; tampilannya menyusul di fitur antarmuka):
  - FR-04: urutan enam adegan, masing-masing dengan tiga pilihan, lewat alur fase Architecture bagian 6.
  - FR-06: giliran tim berotasi per adegan (`activeTeamIndex`).
  - FR-08: dua indikator 0–100, awal 50, dibatasi di kedua ujung (`clamp`).
  - FR-10: bendera `komangDibela` dan pemilihan teks varian di adegan 6.
  - FR-12: tiga akhir menurut ambang PRD bagian 9 (`endingFor`).
- Bergantung pada: F-01 (selesai dan sudah terbit)
- File yang dibuat/diubah:
  - Baru `app/sehari-setara/engine/types.ts`: tipe dari Architecture bagian 5, ditambah tipe aksi dan `EndingId`.
  - Baru `app/sehari-setara/engine/rules.ts`: `clamp`, `activeTeamIndex`, dan `endingFor` persis seperti Architecture bagian 6, ditambah fungsi murni untuk menerapkan efek, menyetel bendera, dan memilih teks varian.
  - Baru `app/sehari-setara/engine/reducer.ts`: keadaan awal dan reducer murni untuk semua transisi Architecture bagian 6 beserta aksi tambahannya, kecuali `ULANGI_ADEGAN` dan `KEMBALI` (P1). Data adegan diterima sebagai parameter, sehingga reducer bisa diuji tanpa naskah asli.
  - Baru `app/sehari-setara/__tests__/rules.test.ts`, `reducer.test.ts`, dan `fixtures.ts` (adegan tiruan untuk uji; naskah asli masuk di F-03).
  - Baru `vitest.config.ts`: konfigurasi uji terpisah (lingkungan Node, hanya `app/sehari-setara/**/*.test.ts`).
  - Diubah `package.json`: dependensi pengembangan `vitest` (`^5.0.4`) dan skrip `test` (`vitest run`).
  - Diubah `pnpm-lock.yaml`: bertambah 18 paket, tidak ada yang dihapus (hasil percobaan).
  - Diubah `.github/workflows/deploy-pages.yml`: langkah "Uji game" sebelum build (Architecture bagian 4).
  - Diubah `docs/sehari-setara/Architecture.md`: keputusan A9 (`vitest`) di bagian 1 sesuai konvensi bagian 14, serta bagian 5–6 bila usulan keputusan 2 disetujui.
  - Diubah `AGENTS.md`: baris F-13 di backlog bagian 5 memuat FR-18 (keputusan 2c), dan catatan versi 0.3.
  - Dokumen: `specs/F-02-mesin-permainan.md`, `tests/F-02-hasil.md`, dan baris `vitest` di tabel "Dependensi dan skrip yang ditunda".
  - Tidak disentuh: `Game.tsx` dan antarmuka, sehingga halaman yang terbit tidak berubah (mesin baru dihubungkan ke layar mulai F-05); file galeri; `game.css`. `engine/useTimer.ts` menyusul di F-07 bersama tampilan pengatur waktu.
- Aset yang dibutuhkan: tidak ada.
- Risiko:
  - Kebijakan pnpm. Percobaan di salinan sementara di luar repositori: `vitest` 5.0.4 terpasang (5.0.5 belum berumur 7 hari), 18 paket baru, tidak ada skrip build yang ditolak `strictDepBuilds`, dan `pnpm-workspace.yaml` tidak perlu diubah.
  - Tanpa konfigurasi sendiri, vitest memuat `vite.config.ts` milik Vinext beserta plugin Cloudflare-nya. Mitigasi: `vitest.config.ts` terpisah; dalam percobaan, uji contoh selesai dalam sekitar 1 detik.
  - Langkah "Uji game" menahan terbitan galeri dan game bila ada uji yang gagal. Ini memang tujuannya; tambahan waktu CI hanya beberapa detik.
  - Naskah asli baru masuk di F-03, jadi reducer diuji dengan adegan tiruan. Mitigasi: `types.ts` menjadi kontrak yang wajib dipenuhi data F-03.
  - Ada tiga hal yang tidak tercakup Architecture; lihat keputusan 2.
- Ukuran: M
- Keputusan Gerbang 1 (21 Okt 2026, balasan `Setuju: F-02` dan `Izinkan dependensi: vitest`):
  1. `vitest` (`^5.0.4`) disetujui sesuai rencana.
  2. Hal yang tidak tercakup Architecture:
     - a. Disetujui: `LANJUT` dipakai untuk keluar dari fase `transition`.
     - b. Disetujui: `quizAnswer` ditambahkan ke `GameState`.
     - c. FR-18 tidak dikerjakan di F-02 dan dimasukkan ke backlog sebagai bagian dari F-13. Reducer dirancang agar pembatalan pilihan mudah ditambahkan, misalnya indikator dihitung ulang dari `history`, karena guru bisa salah klik di kelas.
  3. Cara uji disetujui.
