# PLAN — Sehari Setara

Status fitur dari backlog di `AGENTS.md` bagian 5. Setiap entri melewati Plan → Specify → Build → Test (`AGENTS.md` bagian 4) dan memakai templat 11.1.

| Fitur | Status | Spesifikasi | Laporan uji |
|---|---|---|---|
| F-01 | Selesai (21 Okt 2026) | [F-01-kerangka-halaman.md](specs/F-01-kerangka-halaman.md) | [F-01-hasil.md](tests/F-01-hasil.md) — lulus |
| F-02 | Selesai (21 Okt 2026) | [F-02-mesin-permainan.md](specs/F-02-mesin-permainan.md) | [F-02-hasil.md](tests/F-02-hasil.md) — lulus |
| F-03 | Selesai (21 Okt 2026); uji rujukan disesuaikan 22 Okt 2026 | [F-03-konten-adegan.md](specs/F-03-konten-adegan.md) | [F-03-hasil.md](tests/F-03-hasil.md) — lulus |
| F-12 | Selesai (21 Okt 2026) | [F-12-integrasi-aset.md](specs/F-12-integrasi-aset.md) | [F-12-hasil.md](tests/F-12-hasil.md) — lulus |
| F-04 | Selesai (22 Okt 2026) | [F-04-panggung.md](specs/F-04-panggung.md) | [F-04-hasil.md](tests/F-04-hasil.md) — lulus |
| F-05 | Selesai (22 Okt 2026) | [F-05-panel-narasi-pilihan.md](specs/F-05-panel-narasi-pilihan.md) | [F-05-hasil.md](tests/F-05-hasil.md) — lulus |
| F-06 | Selesai (23 Okt 2026) | [F-06-indikator-kartu-dampak.md](specs/F-06-indikator-kartu-dampak.md) | [F-06-hasil.md](tests/F-06-hasil.md), lulus |
| F-07 | Selesai (26 Okt 2026) | [F-07-tim-waktu-bintang.md](specs/F-07-tim-waktu-bintang.md) | [F-07-hasil.md](tests/F-07-hasil.md), lulus |
| F-08 | Direncanakan (26 Okt 2026), menunggu `Setuju: F-08` | — | — |

## Dependensi dan skrip yang ditunda

Dicatat 21 Okt 2026 atas permintaan pemilik proyek agar tidak terlewat. Setiap paket tetap memerlukan izin tertulis saat Plan fitur yang bersangkutan (`AGENTS.md` bagian 7, aturan 8).

| Yang dipasang | Jenis | Fitur | Ikut ditambahkan |
|---|---|---|---|
| `vitest` | Dependensi pengembangan | F-02 (terpasang 21 Okt 2026, versi 5.0.4) | Skrip `test` dan langkah "Uji game" di `.github/workflows/deploy-pages.yml` (Architecture bagian 4). Seri 5.x mendukung Vite 8; versi yang dipilih harus berumur ≥ 7 hari (`minimumReleaseAge` di `pnpm-workspace.yaml`). |
| Skrip `content:check` | Skrip, memakai `vitest` | F-03 (ditambahkan 21 Okt 2026) | `app/sehari-setara/__tests__/content.test.ts` |
| `@playwright/test` | Dependensi pengembangan | F-04 (ditambahkan 22 Okt 2026, versi 1.56.1) | Skrip `test:e2e`, `playwright.config.ts`, `e2e/sehari-setara.spec.ts`, dan folder hasil Playwright di `.gitignore`. Versi 1.56, agar cocok dengan browser di lingkungan agen. |
| `@fontsource/press-start-2p`, `@fontsource/pixelify-sans` | Dependensi aplikasi | F-04 (ditambahkan 22 Okt 2026, versi 5.3.0) | Impor di `github-pages/sehari-setara/main.tsx`, lalu uji keterbacaan di proyektor (PRD bagian 14). Keterbacaan di proyektor menunggu pengecekan pemilik proyek. |
| Skrip `assets:build` | Skrip | F-12 (ditambahkan 21 Okt 2026) | `python scripts/game/art/build_assets.py` (Architecture bagian 4); `__pycache__/` di `.gitignore` |

Alasannya: F-02 adalah fitur pertama yang berisi uji unit. F-04 adalah fitur pertama sesudah F-01 yang menampilkan antarmuka permainan, sehingga uji ujung ke ujung, tangkapan layar, dan huruf final mulai berguna di sana.

## Catatan untuk Plan berikutnya

- Plan F-04: F-04 sudah menampilkan latar dan sprite, sedangkan `manifest.ts` baru dibuat di F-12. Diputuskan 21 Okt 2026 (Gerbang 1 F-12): F-12 dikerjakan lebih dulu. F-04 cukup memakai kunci manifest dan fungsi `spriteFor` serta `sceneAssets` dari F-12, termasuk untuk pramuat gambar adegan berikutnya (Architecture bagian 8). Rencana F-04 ditulis 21 Okt 2026 (entri F-04).
- Plan F-13: F-13 kini juga memuat FR-18, ulangi adegan dan kembali ke adegan sebelumnya (keputusan 21 Okt 2026). Reducer F-02 menjadikan `history` sumber kebenaran, sehingga pembatalan pilihan cukup memotong `history` lalu menghitung ulang.
- Plan F-11: aktifkan pemeriksaan ketat rujukan (`RILIS=1 npx pnpm@11.25.0 content:check`) di CI sebelum permainan ditautkan dari galeri. Rilis hanya bila semua kotak di `Verifikasi_Rujukan.md` sudah dicentang pemilik proyek.
- Plan F-05: sapuan blok piksel saat pergantian adegan (Design System bagian 8) dikerjakan di F-05, fitur pertama yang menjalankan fase transition (keputusan Gerbang 1 F-04 nomor 5). Masuk rencana F-05 (22 Okt 2026).
- Plan F-05: pratinjau panggung F-04 (`#adegan-N`) adalah layar sementara. Putuskan apakah tetap dipertahankan sebagai alat tinjau setelah alur permainan dibuat. Lihat usulan 5 entri F-05.
- Semua fitur: Tailwind galeri membaca seluruh repositori, termasuk dokumen. Kata lepas yang sama dengan nama kelas Tailwind di kode atau dokumen baru bisa menambah aturan CSS galeri. Uji build membandingkan berkas galeri (F-04, Temuan 2).
- Plan F-05: Design System bagian 7 menyebut bingkai piksel "garis ink 2 px". F-01 membacanya sebagai px CSS. Sebelum panel dibangun, perlu dipastikan apakah yang dimaksud adalah piksel logis panggung. Lihat usulan 1 entri F-05.
- Plan F-06 sampai F-10: jembatan sementara dan pintu masuk `#main` dari F-05 diganti fitur pemiliknya (keputusan Gerbang 1 F-05 nomor 3 dan 4). Kartu dampak (F-06), bintang (F-07), dan kuis (F-08) menggantikan bagiannya masing-masing di `bridgeActions` dan `PlayScreen.tsx`. Layar akhir (F-09) menggantikan layar akhir sementara. Layar judul (F-10) menggantikan layar kerangka dan `#main`, dan memutuskan nasib tautan pratinjau.
- Plan F-06 dan seterusnya: di layar pilihan terpanjang, panel bawah 40u hanya menyisakan 3,05–3,3u, kurang dari satu baris pilihan (F-05, Temuan 2). Unsur baru di panel bawah perlu diukur ulang.
- Plan F-07: kartu dampak menutupi panel kanan selama kartu tampil, karena FR-09 dibaca "papan tim selalu terlihat, kecuali saat sebuah dialog terbuka" (keputusan Gerbang 1 F-06 nomor 1). Bagian bintang di `bridgeActions` (`BERI_BINTANG` 0) diganti F-07. Dikerjakan di F-07.
- Plan F-08: bagian kuis di `bridgeActions` (jawaban dari naskah) diganti F-08. Fase `quiz` datang sesudah tombol "Lanjut" kartu dampak adegan 5. Sejak F-07, `bridgeActions` berhenti di fase `stars`, sehingga kuis F-08 berada di antara kartu dampak adegan 5 dan fase bintang; tombol jembatan baris status (pengaman fase `quiz`) bisa dihapus bersama kuis.
- Plan F-09: jumlah bintang akhir setiap tim perlu tampil di layar akhir atau rekap. Sesudah bintang adegan 6, layar akhir sementara langsung tampil, sehingga pop dan jumlah terakhir di papan tidak terlihat (F-07).
- Plan F-10: (1) nama tim paling lebar 18,6u agar muat di papan pada 1024×768; "Tim Mentari" selebar 17,8u, sedangkan "Tim Kupu-kupu" (20,7u) atau "Tim Jalak Bali" (19,3u) tidak muat (F-07); (2) pengaturan suara di layar pengaturan memakai `settings.sound` yang sama dengan tombol `M` (F-07); (3) durasi diskusi 30, 60, atau 90 detik per kelas, dengan bawaan 60 detik (keputusan 26 Okt 2026); (4) alamat uji `#main-3` dan `#main-4` diganti layar judul, seperti `#main`.
- Plan F-11: asal dan lisensi bunyi klik dan bunyi teks (butir S-6 spesifikasi F-07) masih menunggu jawaban pemilik proyek. `CREDITS.md` dan Design System bagian 13 perlu dilengkapi sebelum rilis.
- Plan F-13: sisa FR-19, yaitu bunyi konfirmasi, dampak tepat dan berisiko, tik pelan sepuluh detik terakhir, dan jingle akhir hari, serta ikon suara D-05 di bilah atas (alternatif S-4a tidak dipilih di F-07) dan pengatur volume. Pertimbangkan juga laporan F-07 Temuan 1: klik ganda pada "Lanjut" kartu memindahkan fokus dari ajakan bintang ke halaman.
- Semua fitur dengan jam uji: waktu yang dihitung sejak sebuah elemen tampil baru mulai sesudah React menggambarnya. Majukan jam dalam dua langkah, misalnya `runFor(1200)`, tunggu kartu tampil, lalu `runFor(600)` (F-06, Temuan 3). Aturan yang sama berlaku untuk pengatur waktu diskusi dan teks per huruf sesudah sapuan (F-07, Temuan 3).
- Semua fitur: uji ujung ke ujung yang memakai `page.clock` harus menjeda jam dengan `pauseAt` sebelum mengatur waktu, karena jam palsu Playwright tetap berjalan sampai dijeda (F-05, Temuan 1). Sejak F-07, pengatur waktu diskusi berjalan dari jam itu: `pauseAt` yang melompat saat diskusi berjalan langsung menghabiskan waktu diskusi. Panggil `pauseAt` sebelum diskusi dimulai, paling aman sebelum halaman dimuat, dan majukan waktu diskusi hanya dengan `runFor`.
- Semua fitur dengan animasi CSS: animasi CSS (sapuan, pop bintang) tidak mengikuti jam uji. Uji menjedanya dan mengatur waktunya lewat Web Animations API (uji sapuan F-05; laporan F-07, Temuan 4).

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
- Status: Selesai (21 Okt 2026). Riwayat 21 Okt 2026: direncanakan dan disetujui dengan izin `vitest`; spesifikasi disetujui; dibangun; diuji dan lulus semua kriteria ([laporan](tests/F-02-hasil.md)); digabung ke `main` dan terbit (dikonfirmasi pemilik proyek).
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

## F-03 — Skema konten, data enam adegan, pemeriksa konten
- Status: Selesai (21 Okt 2026). Riwayat 21 Okt 2026: direncanakan dan disetujui; spesifikasi disetujui; dibangun; diuji dan lulus semua kriteria ([laporan](tests/F-03-hasil.md)). Riwayat 22 Okt 2026: uji konten disesuaikan dengan rujukan baru (lihat "Revisi 22 Okt 2026" di bawah).
- Memenuhi (sisi konten; tampilannya menyusul di fitur antarmuka):
  - FR-04: enam adegan sesuai PRD bagian 8, masing-masing dengan tiga pilihan.
  - FR-10: varian adegan 6 yang bergantung pada bendera `komangDibela` dari pilihan B adegan 4.
  - FR-11: data kuis peran di adegan 5 dan tugas keempat peran.
  - Architecture bagian 5: semua aturan skema, diperiksa oleh `content:check`. AGENTS bagian 8: aturan rujukan.
- Bergantung pada: F-02 (selesai dan sudah terbit)
- File yang dibuat/diubah:
  - Baru `app/sehari-setara/content/scenes.ts`: enam adegan lengkap.
  - Baru `app/sehari-setara/content/references.ts`: rujukan unik dari PRD bagian 8, berkode R-01 dan seterusnya (12 rujukan setelah keputusan Gerbang 1).
  - Baru `app/sehari-setara/content/roles.ts`: empat peran dan tugasnya (PRD adegan 5).
  - Baru `app/sehari-setara/content/schema.ts`: skema `zod` dan aturan Architecture bagian 5. Hanya dipakai uji, jadi tidak ikut terbundel.
  - Baru `app/sehari-setara/__tests__/content.test.ts`: memeriksa naskah, keberadaan berkas latar dan sprite yang dirujuk, dan status verifikasi rujukan.
  - Baru `docs/sehari-setara/Verifikasi_Rujukan.md`: daftar centang verifikasi (keputusan 1).
  - Diubah `app/sehari-setara/engine/types.ts`: `Reference` menjadi `{ id, text }` (keputusan 1), dan `CharId` ditambah `siswa` dan `warga` (keputusan 3).
  - Diubah `app/sehari-setara/__tests__/fixtures.ts`: menyesuaikan bentuk `Reference`.
  - Diubah `package.json`: skrip `content:check`. Dependensi tidak berubah, karena `zod` sudah ada.
  - Diubah `docs/sehari-setara/Architecture.md` (bagian 5) dan `AGENTS.md` (bagian 8): cara verifikasi dan tipe di atas.
  - Dokumen: `specs/F-03-konten-adegan.md`, `tests/F-03-hasil.md`, dan baris `content:check` di tabel dependensi.
  - Tidak disentuh: `Game.tsx` dan antarmuka (halaman yang terbit tidak berubah), galeri, aset, dan workflow. Langkah "Uji game" otomatis ikut menjalankan pemeriksa konten.
- Aset yang dibutuhkan: tidak ada aset baru. Data merujuk enam latar dan sprite yang sudah Disetujui, dan pemeriksa konten memastikan setiap berkas yang dirujuk memang ada.
- Risiko:
  - Naskah PRD belum lengkap untuk model data. Teks alternatif adegan (6), pertanyaan (6), dan "yang terjadi" untuk setiap pilihan (18, ditambah varian adegan 6) belum ada. Lihat keputusan 2.
  - Rujukan PRD masih perlu verifikasi. Dua hal patut dicek saat verifikasi: "UU No. 2 Tahun 2002 tentang Polri" belum menyebut pasal, dan adegan 6 menulis "Pasal 28J" tanpa ayat, sedangkan adegan 3 dan 4 menulis "Pasal 28J ayat (1)". Agen tidak mengubah keduanya; keduanya dicatat di daftar verifikasi.
  - Batas teks: semua teks pilihan PRD ≤ 140 karakter (terpanjang 139, pilihan B adegan 5). Situasi adegan 1 berisi 4 kalimat, jadi dibagi menjadi dua layar tanpa mengubah kata.
  - Pemeran dan reaksi diambil dari komposisi pratinjau adegan yang sudah disetujui (`build_assets.py` dan catatan Daftar_Aset), dan masih bisa disesuaikan saat panggung dibangun (F-04). Ada satu pertanyaan terbuka di Daftar_Aset: di adegan 6, Nara berpakaian rumah hanya punya pose memegang HP. Usulan: reaksi adegan 6 memakai pose itu ditambah ikon emosi sampai varian pakaian rumah tersedia.
  - Perubahan tipe `Reference` dan `CharId` menyentuh kode F-02, jadi uji F-02 ikut dijalankan ulang.
  - Uji di CI kini juga memeriksa naskah, sehingga kesalahan naskah menahan terbitan. Status verifikasi rujukan tidak menahan terbitan sampai F-11.
- Ukuran: M. Spesifikasinya akan panjang karena memuat seluruh naskah untuk ditinjau.
- Keputusan Gerbang 1 (21 Okt 2026, balasan `Setuju: F-03`):
  1. Disetujui: daftar centang `docs/sehari-setara/Verifikasi_Rujukan.md`. Pemilik proyek mencentangnya sendiri setelah F-03 terbit.
  2. Disetujui: agen menulis draf bagian naskah yang belum ada di spesifikasi, dengan tanda asal yang jelas (PRD atau draf baru).
  3. Disetujui: `CharId` ditambah `siswa` dan `warga`.
  4. Cara uji disetujui.
  5. Tambahan dari pemilik proyek:
     - Reaksi adegan 6 memakai pose Nara memegang HP ditambah ikon emosi, untuk sementara.
     - Rujukan adegan 6 "Pasal 28J UUD NRI 1945" diganti "Pasal 28J ayat (1) UUD NRI 1945", sama dengan adegan 3 dan 4.
     - Rujukan "UU No. 2 Tahun 2002 tentang Polri" diganti "UU No. 2 Tahun 2002, Pasal 13 dan Pasal 14 ayat (1) huruf g".
     - Kedua rujukan itu tetap belum dicentang sampai diverifikasi pemilik proyek di JDIH.
- Revisi 22 Okt 2026 (instruksi langsung pemilik proyek; peran Pembangun dan Penguji):
  - Pemicu: push `983f6c6` ("Perbaikan pasal") memperbarui rujukan, lalu langkah "Uji game" di CI gagal pada 4 uji `content.test.ts` sehingga terbitan tertahan. Uji masih memakai harapan lama: 12 rujukan, teks lama R-10 dan R-11, dan R-13 sebagai contoh rujukan yang tidak dipakai.
  - Keputusan rujukan pemilik proyek (dicatat di baris "Riwayat" `Verifikasi_Rujukan.md`): R-07 dilepas dari adegan 6; teks R-10 dan R-11 diganti; R-13 (adegan 1) dan R-14 (adegan 5) ditambahkan. Rujukan kini 14.
  - Diubah `app/sehari-setara/__tests__/content.test.ts`: jumlah rujukan dihitung dari `REFERENCES`; teks R-01 sampai R-14 dan susunan rujukan per adegan mengikuti keadaan terbaru; contoh "rujukan tidak dipakai" memakai kode sesudah rujukan terakhir (kini R-15); uji laporan AC-7 memeriksa baris ringkasan dan setiap baris rujukan yang belum terverifikasi.
  - Diubah `specs/F-03-konten-adegan.md`: tabel rujukan, baris rujukan adegan 1, 5, dan 6, AC-4, AC-5, AC-7, dan bagian "Riwayat perubahan".
  - Tidak disentuh: `scenes.ts`, `references.ts`, `Verifikasi_Rujukan.md` (tidak ada kotak yang dicentang), kode permainan, dan workflow.
  - Hasil: `test` 5 berkas, 138 lulus, 1 dilewati (uji mode rilis); `content:check` 36 lulus, 1 dilewati, dan mencetak "Verifikasi rujukan: 0 dari 14 terverifikasi."; `build:pages` kode 0; `tsc --noEmit` 0 galat; ESLint pada berkas uji kode 0. Dengan `RILIS=1`, `content:check` gagal dengan "Rilis diblokir: 14 rujukan belum terverifikasi.", sesuai harapan. Percobaan sementara membuktikan uji tetap menangkap teks rujukan yang berubah, rujukan yang dilepas dari adegan, dan baris daftar centang yang rusak. `test:e2e` tidak dijalankan karena halaman permainan tidak berubah.
  - Menunggu keputusan pemilik proyek:
    1. PRD bagian 8 masih memuat baris rujukan lama untuk adegan 1, 5, dan 6, dan bagian 17 belum mencatat keputusan 22 Okt 2026. CI tidak terpengaruh, karena uji tidak membandingkan rujukan dengan PRD.
    2. Uji AC-5 mewajibkan semua kotak kosong. Begitu pemilik proyek mencentang satu kotak, atau baris sebuah butir rusak, `test` gagal dan terbitan tertahan. Ini bertentangan dengan perilaku di spesifikasi F-03 dan dengan petunjuk di `Verifikasi_Rujukan.md`. Masalah ini sudah ada sejak F-03 dan perlu diperbaiki sebelum pemilik proyek mulai mencentang.

## F-12 — Integrasi aset: `manifest.ts`, uji palet, uji kelengkapan manifest
- Status: Selesai (21 Okt 2026). Riwayat 21 Okt 2026: direncanakan dan disetujui (balasan `Setuju: F-12`, keenam usulan diterima); spesifikasi disetujui (`Spesifikasi disetujui: F-12`, [F-12-integrasi-aset.md](specs/F-12-integrasi-aset.md)); dibangun; diuji dan lulus ketiga belas kriteria ([laporan](tests/F-12-hasil.md)). Halaman yang terbit tidak berubah, jadi aman digabung ke `main`.
- Memenuhi:
  - Architecture bagian 8: `assets/manifest.ts` sebagai satu-satunya pintu masuk aset, lengkap dengan jumlah bingkai, fps, dan ukuran setiap strip, serta anggaran ukuran per aset.
  - Architecture bagian 12, lapisan Aset: uji Vitest yang memastikan token warna di `game.css` sama dengan `palette.json` dan setiap kunci di `manifest.ts` punya berkas.
  - AGENTS bagian 7 aturan 1 dan bagian 9: aset hanya lewat manifest, dan setiap aset tercatat di `CREDITS.md`.
  - Skrip `assets:build` dari tabel "Dependensi dan skrip yang ditunda".
  - Tidak ada FR yang selesai di F-12. Fitur ini menyiapkan jalan untuk F-04 dan fitur antarmuka sesudahnya.
- Bergantung pada: F-01 (selesai dan sudah terbit). Uji silang memakai naskah F-03 (selesai).
- Mengapa sebelum F-04: urutan backlog menempatkan F-04 lebih dulu, tetapi F-04 menampilkan latar dan sprite yang wajib dimuat lewat manifest (AGENTS bagian 7 aturan 1). Bila manifest dibuat di dalam F-04, fitur itu membengkak dan lebih sulit diuji. F-12 berukuran S dan dependensinya sudah selesai, sesuai tujuan tahap Plan (fitur terkecil yang bernilai dan siap). Pemilik proyek condong ke urutan ini (21 Okt 2026); lihat usulan 1.
- File yang dibuat/diubah:
  - Baru `app/sehari-setara/assets/manifest.ts`: mengimpor ke-63 PNG dan mengelompokkannya menurut pemakaiannya:
    - latar, dengan kunci yang sama dengan `Scene.bg` di `scenes.ts` (misalnya `bg_s1_rumah_pagi`), ditambah `bg_title`;
    - ilustrasi akhir menurut `EndingId`;
    - strip tokoh `tokoh → pose → { src, frames, fps, w, h }`;
    - ikon antarmuka, termasuk strip bintang (3 bingkai) dan timbangan (5 bingkai);
    - bentuk tim, ikon peran, dan ikon emosi.

    Ditambah fungsi pencari kecil yang mengubah satu adegan menjadi daftar asetnya. Fungsi ini dipakai uji sekarang dan panggung di F-04.
  - Baru `app/sehari-setara/assets/png.d.ts`: deklarasi tipe agar TypeScript menerima impor `*.png`.
  - Baru `app/sehari-setara/__tests__/assets.test.ts`: uji palet, kelengkapan, dan anggaran (lihat "Isi uji"). Ukuran gambar dibaca dari kepala berkas PNG, tanpa dependensi baru. Spesifikasi menambah `__tests__/asset-checks.ts` untuk fungsi pemeriksa murni, seperti `schema.ts` di F-03.
  - Diubah `vite.pages.config.ts`: aset game selalu dikeluarkan sebagai berkas berhash dan tidak diselipkan ke JS (usulan 2). Aturannya hanya berlaku untuk `app/sehari-setara/assets/`.
  - Diubah `package.json`: hanya menambah skrip `"assets:build": "python scripts/game/art/build_assets.py"` (Architecture bagian 4). Dependensi tidak berubah.
  - Diubah `.gitignore`: menambah `__pycache__/` (usulan 3).
  - Diubah `docs/sehari-setara/Architecture.md` (bagian 3, 8, dan 12), `Design_System.md` (tabel kit bagian 12), dan `Daftar_Aset.md` (catatan `ikon.py`): usulan 4.
  - Dokumen: `specs/F-12-integrasi-aset.md`, `tests/F-12-hasil.md`, dan entri ini.
  - Tidak disentuh: `Game.tsx` dan antarmuka, sehingga halaman yang terbit tidak berubah (manifest baru dipakai layar mulai F-04); naskah dan uji F-03; PNG dan kode kit gambar; file galeri; workflow; `pnpm-lock.yaml`.
- Isi uji (`assets.test.ts`, ikut berjalan di langkah "Uji game" CI):
  - Palet: setiap warna di `game.css`, baik token `--ss-*` maupun warna yang ditulis langsung, ada di `palette.json` dengan nilai yang sama.
  - Kelengkapan: setiap entri manifest punya berkas; setiap PNG di `assets/` terdaftar di manifest (menurut spesifikasi, berkas yang belum terdaftar hanya dilaporkan dan tidak menggagalkan uji); lebar berkas sama dengan jumlah bingkai × lebar bingkai dan tingginya cocok; setiap berkas tercatat di `CREDITS.md`; setiap latar, pasangan tokoh-pose, dan ikon emosi di `scenes.ts` ada di manifest; setiap peran, bentuk tim, dan jenis akhir punya gambar; fps berada dalam rentang Design System bagian 8.
  - Anggaran (Architecture bagian 8): satu latar ≤ 40 KB, satu strip sprite ≤ 15 KB, seluruh aset ≤ 4 MB.
- Aset yang dibutuhkan: tidak ada aset baru. Ke-63 PNG (7 latar, 3 ilustrasi akhir, 33 strip dari 11 tokoh, dan 20 gambar antarmuka) sudah Disetujui (Daftar_Aset, 21 Okt 2026) dan tercatat di `CREDITS.md`. Ukuran setiap berkas sudah dicek cocok dengan ukuran bingkai di Daftar_Aset. Placeholder tidak diperlukan.
- Risiko (angka dari percobaan di salinan sementara di luar repositori, 21 Okt 2026):
  - Vite menyelipkan gambar di bawah 4 KB ke dalam JS sebagai data URI. Dalam percobaan berkas tiruan yang mengimpor ke-63 PNG, 62 di antaranya terselip dan JS game menjadi 56,2 kB gzip (sekarang 0,5 kB). Bersama React (60,2 kB), 116 dari 150 KB anggaran kode sudah terpakai sebelum antarmuka dibuat. Dengan aturan usulan 2, ke-63 PNG keluar sebagai berkas berhash dengan URL relatif (`new URL(…, import.meta.url)`), JS game hanya 1,4 kB gzip, dan keluaran galeri identik dengan build sekarang.
  - TypeScript menolak impor PNG tanpa deklarasi (TS2307). Dengan `png.d.ts`, `tsc` seluruh proyek 0 galat. Catatan: Next/Vinext bisa membuat `next-env.d.ts` di komputer pengembang, yang juga mendeklarasikan `*.png`. Berkas itu tidak ada di repositori, dan CI tidak menjalankan `tsc`.
  - Halaman yang terbit tidak berubah karena manifest belum dipakai layar. Akibatnya, aturan Vite hanya bisa dibuktikan lewat build percobaan yang memuat manifest (usulan 6).
  - `build_assets.py` menghasilkan 63 PNG dan 43 pratinjau yang identik byte dengan repositori (3 detik), tetapi meninggalkan folder `__pycache__/` yang akan tampil di GitHub Desktop (usulan 3). Di komputer dengan versi Pillow lain, byte PNG bisa berbeda walau gambarnya sama. Uji F-12 memeriksa keberadaan dan ukuran, bukan byte.
  - Dokumen hanya memberi rentang fps (diam dan bicara 2–4, berjalan 6–8). Nilai pasti per strip, termasuk pose khusus seperti motor dan merekam, diusulkan di spesifikasi.
  - Architecture bagian 8 menyebut latar sebagai PNG terindeks, sedangkan berkas yang disetujui ber-mode RGBA. Latar terbesar hanya 3,6 KB dari anggaran 40 KB, jadi uji memeriksa ukuran, bukan format, dan kalimat dokumen itu tidak diubah.
  - Uji membaca kolom path di tabel `CREDITS.md`. Bila format tabel itu berubah, uji gagal dengan pesan yang menyebut berkasnya.
- Ukuran: S
- Keputusan Gerbang 1 (21 Okt 2026, balasan `Setuju: F-12`; keenam usulan disetujui):
  1. F-12 dikerjakan sebelum F-04. F-04 kemudian cukup memakai kunci manifest.
  2. Aturan di `vite.pages.config.ts` agar aset game dikeluarkan sebagai berkas terpisah. Ini menjaga anggaran kode 150 KB dan sesuai keputusan A5 (nama berhash untuk cache).
  3. `.gitignore` menambah `__pycache__/`, agar file sementara Python tidak ikut ter-commit setelah `assets:build`.
  4. Pembaruan dokumen: `ikon.py` dicatat di Architecture bagian 3 dan 8 serta tabel kit Design System bagian 12 (usulan yang masih tertunda di Daftar_Aset); contoh manifest di Architecture bagian 8 memakai kunci nama berkas seperti `scenes.ts`; aturan aset sebagai berkas terpisah dicatat di bagian 8.
  5. Mekanisme placeholder (AGENTS bagian 5) belum dibuat, karena semua aset sudah Disetujui. Mekanisme dan laporannya di `content:check` dibuat oleh fitur pertama yang membutuhkan aset yang belum disetujui.
  6. Cara uji: `content:check`, `test`, `build:pages`, `tsc`, ESLint, dan `assets:build`. `test:e2e` belum ada (Playwright dijadwalkan di F-04), jadi diganti pemeriksaan browser seperti F-02 dan F-03, ditambah build percobaan di salinan sementara yang memuat manifest dan menyajikannya di `/ruang-setara/` untuk memastikan gambar termuat tanpa respons 4xx.

## F-04 — Panggung: skala, lapisan, sprite, garis pindai, busur hari
- Status: Selesai (22 Okt 2026). Riwayat 21 Okt 2026: direncanakan dan disetujui (balasan `Setuju: F-04` dan `Izinkan dependensi: @playwright/test, @fontsource/press-start-2p, @fontsource/pixelify-sans`; keenam usulan diterima); spesifikasi ditulis dan ikon D-11 digambar. Riwayat 22 Okt 2026: spesifikasi dan ikon D-11 disetujui (`Spesifikasi disetujui: F-04`, [F-04-panggung.md](specs/F-04-panggung.md)); dibangun; diuji dan lulus kesembilan belas kriteria ([laporan](tests/F-04-hasil.md)). Halaman permainan bawaan tetap layar kerangka, kini dengan tombol ke pratinjau panggung.
- Memenuhi:
  - Design System bagian 1: "Langit sehari", yaitu warna bilah atas yang mengikuti waktu adegan, dan busur hari dengan enam titik jam.
  - Design System bagian 3: panggung logis 320×180 yang diskalakan, garis lantai y = 156, urutan lapisan, dan tata letak layar 16:9 dengan bingkai `ink` untuk layar 4:3.
  - Design System bagian 6 dan 8: garis pindai, vinyet, piksel tajam, gerak sprite bertahap, dan kurangi gerak (`prefers-reduced-motion`).
  - Architecture bagian 7 (rumus skala dan sprite), bagian 8 (pramuat gambar adegan berikutnya), bagian 10 (teks alternatif adegan), dan bagian 12 (uji ujung ke ujung mulai dipakai).
  - PRD bagian 10 (layar 16:9 dan 4:3, empat ukuran uji, kurangi gerak) dan bagian 14 (uji keterbacaan huruf sejak awal).
  - FR-04 sebagian: keenam adegan sudah bisa dilihat, tetapi belum bisa dimainkan.
- Bergantung pada: F-01 dan F-12 (selesai dan sudah terbit). Memakai naskah F-03 dan tipe F-02.
- File yang dibuat/diubah:
  - Baru `app/sehari-setara/ui/Stage.tsx`: panggung 320×180 berskala dengan lapisan latar, bayangan kaki, tokoh, ikon emosi, garis pindai, dan vinyet. Panggung memakai `role="img"` dengan teks alternatif adegan.
  - Baru `app/sehari-setara/ui/Sprite.tsx`: strip animasi sesuai Architecture bagian 7, yang berhenti di bingkai pertama bila kurangi gerak aktif.
  - Baru `app/sehari-setara/ui/DayArc.tsx`: bilah atas berisi busur hari, ikon matahari atau bulan di titik jam berjalan, warna langit, dan "Adegan n/6".
  - Baru `app/sehari-setara/ui/layout.ts`: fungsi murni untuk skala panggung dan posisi sprite, bayangan, ikon emosi, serta titik busur hari.
  - Baru `app/sehari-setara/ui/preload.ts`: memuat dan men-*decode* gambar adegan berikutnya lewat `sceneAssets`.
  - Baru `app/sehari-setara/ui/StagePreview.tsx`: layar pratinjau panggung sementara (usulan 2).
  - Baru `app/sehari-setara/__tests__/layout.test.ts`: uji unit `layout.ts`.
  - Baru `playwright.config.ts` dan `e2e/sehari-setara.spec.ts`: uji ujung ke ujung di `/ruang-setara/` (Architecture bagian 12).
  - Baru `app/sehari-setara/assets/ui/ui_matahari.png` dan `ui_bulan.png` beserta pratinjaunya (usulan 3).
  - Diubah `app/sehari-setara/Game.tsx`: memilih layar kerangka atau pratinjau menurut alamat.
  - Diubah `app/sehari-setara/content/copy.ts`: teks bilah atas dan pratinjau.
  - Diubah `app/sehari-setara/styles/game.css`: kelas panggung, sprite, bilah atas, dan pratinjau. Warna langit diambil dari palet (Design System bagian 4), tanpa token baru.
  - Diubah `app/sehari-setara/assets/manifest.ts`: warna bayangan kaki per latar, titik kepala untuk ikon emosi, dan dua ikon baru (usulan 4). Ikut diubah `__tests__/asset-checks.ts` dan `assets.test.ts` agar data tambahan itu diperiksa, serta `assets/CREDITS.md`.
  - Diubah `github-pages/sehari-setara/main.tsx`: impor huruf, hanya subset latin berbobot 400.
  - Diubah `scripts/game/art/ikon.py` dan `build_assets.py`: gambar dua ikon baru, dikerjakan dalam peran Pembuat aset.
  - Diubah `package.json` dan `pnpm-lock.yaml`: tiga dependensi (usulan 1) dan skrip `test:e2e`.
  - Diubah `.gitignore`: folder hasil Playwright (`test-results/`, `playwright-report/`).
  - Diubah `docs/sehari-setara/Architecture.md` (keputusan A10 dan A11, bagian 3 dan 7), `Design_System.md` (ikon busur hari di bagian 11), `Daftar_Aset.md` (D-11), dan `PLAN.md`.
  - Dokumen: `specs/F-04-panggung.md`, `tests/F-04-hasil.md`, dan tangkapan layar di `tests/F-04/`.
  - Tambahan dari spesifikasi: ralat tiga uji F-12 yang keliru menggagalkan uji bila ada aset yang belum terdaftar (tertangkap saat ikon D-11 dibangun), pembaca PNG kecil di `asset-checks.ts` untuk memeriksa titik kepala, dan catatan ralat di `tests/F-12-hasil.md`.
  - Tidak disentuh: `engine/`, `content/scenes.ts` (posisi tokoh tetap seperti pratinjau yang disetujui), file galeri, `vite.pages.config.ts`, dan workflow. Playwright tidak dijalankan di CI (Architecture bagian 4).
- Aset yang dibutuhkan:
  - Tersedia dan Disetujui: enam latar, semua strip tokoh yang dirujuk naskah, dan empat ikon emosi, semuanya lewat manifest F-12.
  - Belum ada: ikon matahari untuk busur hari. Design System bagian 1 menyebutnya, tetapi daftar ikon di Design System bagian 11, PRD bagian 11, dan Daftar_Aset tidak memuatnya. Lihat usulan 3.
  - Bayangan kaki: pratinjau adegan yang disetujui menggambar bayangan setinggi 2 piksel di bawah setiap tokoh, dengan warna per latar. Adegan 1 dan 6 memakai `wood-d`, adegan 2 `dusk`, adegan 3 dan 5 `slate`, serta adegan 4 dan layar judul `wood` (sumber: `PREVIEW_SCENES` di `build_assets.py`). Panggung meniru bayangan ini agar tampilannya sama dengan yang sudah disetujui.
- Risiko (angka dari percobaan di salinan sementara di luar repositori, 21 Okt 2026):
  - Dependensi:
    - `@playwright/test` 1.56.1 cocok dengan Chromium 141 di lingkungan agen; uji contoh berjalan. Paket ini menambah 3 paket, ditambah `fsevents` yang opsional dan khusus Mac.
    - Kedua paket huruf 5.3.0 menambah 2 paket tanpa dependensi lain.
    - Semua versi berumur lebih dari 7 hari dan lolos kebijakan rantai pasok.
    - Lockfile bertambah 66 baris dan berkurang 11. Sebagian karena `next` dan `vinext` mendaftarkan Playwright sebagai peer opsional. Sebagian lagi karena pnpm menaikkan tiga paket transitif ke versi terbaru dalam rentangnya: `es-module-lexer` 2.1.0 → 2.3.2, `tinyglobby` 0.2.16 → 0.2.17, dan `@jridgewell/sourcemap-codec` 1.5.5 → 1.6.0. Kenaikan ini juga terjadi bila hanya paket huruf yang dipasang.
    - Dengan lockfile percobaan, 120 uji tetap lulus dan hasil build identik.
  - Huruf: subset latin berbobot 400 berukuran 7,7 KB (Pixelify Sans) dan 12,5 KB (Press Start 2P) dalam format woff2. Tampilan layar kerangka yang sudah terbit ikut berubah, karena hurufnya kini benar-benar dimuat. Keterbacaan di proyektor perlu dicek langsung oleh pemilik proyek.
  - Skala pecahan: pada 1024×768, panggung diperbesar sekitar 1,98 kali, sehingga ukuran piksel tidak seragam. Design System bagian 3 menerima hal ini dengan `image-rendering: pixelated`, dan tangkapan layar akan menunjukkannya.
  - Ikon emosi belum punya acuan, karena pratinjau adegan yang disetujui tidak memuatnya. Kepala sebagian besar tokoh berada di tengah bingkai (selisih paling banyak 1,5 piksel), tetapi kepala Dimas di atas motor berada 9 piksel di kiri tengah. Spesifikasi akan mengusulkan titik kepala per strip dan menyertakan tangkapan layar setiap reaksi.
  - Kontras bilah atas di adegan malam: teks `ink` di atas langit malam (`#4A4F9C`) hanya 2,0:1. Spesifikasi akan memakai `cream` (6,8:1) khusus untuk bilah malam. Di langit pagi, siang, dan sore, `ink` mencapai 7,0:1 atau lebih.
  - Halaman yang terbit berubah: layar kerangka mendapat tautan ke pratinjau, dan pratinjau bisa dibuka siapa pun yang tahu alamatnya. Game belum ditautkan dari galeri (F-11).
  - Temuan lama tentang keranjang Ibu (Daftar_Aset, Batch A1) akan terlihat di pratinjau adegan 1. Perbaikannya tetap tugas pembuat aset dan menunggu keputusan pemilik proyek.
  - Uji Playwright hanya berjalan di lingkungan agen. Uji ini tidak dijalankan di CI dan tidak perlu dijalankan pemilik proyek. Tangkapan layar setiap adegan menambah sekitar 0,5 MB ke folder `docs/`.
- Ukuran: M (batas atas). Sapuan pergantian adegan ditunda (usulan 5) agar ukurannya tetap M.
- Keputusan Gerbang 1 (21 Okt 2026, balasan `Setuju: F-04` dan `Izinkan dependensi: @playwright/test, @fontsource/press-start-2p, @fontsource/pixelify-sans`; keenam usulan disetujui):
  1. Dependensi dipasang dengan versi persis: `@playwright/test` 1.56.1 untuk pengembangan, serta `@fontsource/press-start-2p` 5.3.0 dan `@fontsource/pixelify-sans` 5.3.0 untuk aplikasi, termasuk perubahan lockfile di atas. Hanya subset latin berbobot 400 yang diimpor.
  2. Halaman utama game tetap berupa layar kerangka, dengan tambahan tautan "Lihat pratinjau panggung". Pratinjau dibuka lewat alamat `sehari-setara/#adegan-1` sampai `#adegan-6`, ditambah reaksi A, B, dan C setiap adegan (misalnya `#adegan-4-b`). Pratinjau ini sementara sampai alur permainan dibuat (mulai F-05), dan dipakai untuk uji serta tangkapan layar.
  3. Ikon busur hari baru: `ui_matahari` untuk adegan pagi sampai sore dan `ui_bulan` untuk adegan malam, masing-masing 16×16. Keduanya digambar dengan kit dalam peran Pembuat aset, lalu pratinjaunya dikirim bersama spesifikasi untuk disetujui di Gerbang 2. Bila disetujui, keduanya dicatat sebagai D-11 dan masuk daftar ikon Design System bagian 11.
  4. Warna bayangan kaki dan titik kepala untuk ikon emosi disimpan di manifest, sehingga uji aset F-12 ikut memeriksanya.
  5. Sapuan blok piksel saat pergantian adegan (Design System bagian 8) ditunda ke fitur pertama yang menjalankan fase transition, yaitu F-05.
  6. Cara uji: `content:check`, `test`, `build:pages`, dan `test:e2e` untuk pertama kalinya.
     - Uji ujung ke ujung memeriksa keenam adegan di 1280×720 dan 1024×768: respons, galat konsol, skala, posisi tokoh, dan kurangi gerak. Tangkapan layarnya disimpan sebagai bukti.
     - Ditambah uji unit `layout.ts`, `tsc`, dan ESLint.
     - Daftar periksa manual AGENTS bagian 9 yang berlaku: tampilan di 1024×768 dan 1920×1080, serta mode kurangi gerak.

## F-05 — Panel narasi, pertanyaan, dan tombol pilihan + kontrol keyboard
- Status: Selesai (22 Okt 2026). Riwayat 22 Okt 2026: direncanakan dan disetujui (balasan `Setuju: F-05`; keenam usulan diterima); spesifikasi ditulis dan disetujui (balasan `Spesifikasi disetujui: F-05`; [F-05-panel-narasi-pilihan.md](specs/F-05-panel-narasi-pilihan.md)); dibangun; diuji dan lulus kesembilan belas kriteria ([F-05-hasil.md](tests/F-05-hasil.md)). Layar bawaan halaman permainan tetap layar kerangka; alur permainan dibuka lewat tombol "Coba alur permainan" (`#main`).
- Memenuhi:
  - FR-04: keenam adegan bisa dimainkan berurutan, masing-masing dengan tiga pilihan. Sampai F-04, adegan hanya bisa dilihat lewat pratinjau.
  - FR-10 (sisi tampilan): narasi tambahan dan teks pilihan B adegan 6 mengikuti bendera `komangDibela`, lewat `narrationFor` dan `choiceText` dari F-02.
  - FR-16 sebagian (Architecture bagian 9): `1` `2` `3` atau `A` `B` `C` untuk memilih, serta `Spasi` dan `Enter` untuk lanjut dan menampilkan seluruh teks narasi. Tombol lain menyusul bersama fiturnya: `P`, `T`, `S`, dan `0` `1` `2` di F-07; `Esc` di F-10; `F` dan `M` di F-13.
  - Architecture bagian 6: antarmuka pertama yang menjalankan fase `intro`, `discuss`, `reaction`, dan `transition`, dengan aksi `NARASI_SELESAI`, `PILIH`, `REAKSI_SELESAI`, dan `LANJUT`.
  - Architecture bagian 10: narasi dan pertanyaan diumumkan lewat wilayah `aria-live="polite"`.
  - Design System bagian 7: kotak narasi dan tombol pilihan A/B/C dengan status biasa, fokus/arah, dipilih, dan nonaktif.
  - Design System bagian 8: reaksi tokoh 1–1,5 detik, serta sapuan blok piksel 400 ms ke kanan saat pergantian adegan, atau pudar 150 ms bila kurangi gerak aktif (catatan Plan F-05 tentang sapuan).
- Bergantung pada: F-02 dan F-04 (selesai dan sudah terbit). Memakai naskah F-03 dan manifest F-12.
- File yang dibuat/diubah:
  - Baru `app/sehari-setara/ui/PlayScreen.tsx`: layar permainan. Menjalankan reducer F-02 lewat `useReducer`, menampilkan bilah atas, panggung, dan panel bawah menurut fase, mengatur lama tampil reaksi dan sapuan, menangani keyboard, dan memuat jembatan sementara (usulan 4).
  - Baru `app/sehari-setara/ui/NarrationBox.tsx`: kotak narasi berbingkai piksel dengan tab label. Teks muncul per huruf (mengikuti `settings.typewriter`), dan klik, `Spasi`, atau `Enter` menampilkan seluruh teks sekaligus.
  - Baru `app/sehari-setara/ui/ChoicePanel.tsx`: pertanyaan dan tiga tombol pilihan, dengan huruf A/B/C dalam kotak di kiri.
  - Baru `app/sehari-setara/ui/SceneWipe.tsx`: lapisan sapuan blok piksel di atas bingkai panggung, atau pudar bila kurangi gerak aktif.
  - Baru `app/sehari-setara/ui/controls.ts`: fungsi murni untuk memetakan tombol keyboard ke aksi menurut fase, menghitung langkah teks per huruf, dan menyusun urutan blok sapuan.
  - Baru `app/sehari-setara/ui/hooks.ts`: `usePrefersReducedMotion` dan `useStageScale`, dipindahkan dari `StagePreview.tsx` agar dipakai bersama.
  - Baru `app/sehari-setara/content/teams.ts`: empat tim bawaan Design System bagian 7 (Tim Mangga, Tim Laut, Tim Daun, Tim Mentari). F-05 memakai dua yang pertama tanpa menampilkannya (usulan 3); F-07 dan F-10 memakai daftar yang sama.
  - Baru `app/sehari-setara/__tests__/controls.test.ts`: uji unit `controls.ts`.
  - Baru `e2e/alur-permainan.spec.ts`: uji ujung ke ujung alur permainan (usulan 6).
  - Diubah `app/sehari-setara/Game.tsx`: alamat `#main` membuka layar permainan, dan layar kerangka mendapat tombol ketiga (usulan 3).
  - Diubah `app/sehari-setara/content/copy.ts`: teks antarmuka baru.
  - Diubah `app/sehari-setara/styles/game.css`: kelas kotak narasi, tombol pilihan, sapuan, dan jembatan; tinggi baris layar (usulan 2); satuan bingkai piksel (usulan 1), termasuk `ss-button` dan `ss-chip` bila usulan 1 disetujui. Tidak ada token `:root` baru.
  - Diubah `app/sehari-setara/ui/layout.ts`: konstanta tata letak (usulan 2) dan satuan piksel antarmuka (usulan 1).
  - Diubah `app/sehari-setara/ui/StagePreview.tsx`: memakai `hooks.ts` dan tata letak yang sama dengan layar permainan.
  - Diubah `app/sehari-setara/__tests__/layout.test.ts` dan `e2e/sehari-setara.spec.ts`: harapan tata letak baru dan tombol ketiga layar kerangka.
  - Diubah `docs/sehari-setara/Design_System.md` (bagian 3 dan 7, sesuai usulan 1 dan 2) dan `docs/sehari-setara/Architecture.md` (bagian 3, 7, dan 9).
  - Dokumen: `specs/F-05-panel-narasi-pilihan.md`, `tests/F-05-hasil.md`, tangkapan layar di `tests/F-05/`, dan entri ini.
  - Tambahan dari spesifikasi: `e2e/bantuan.ts` (fungsi uji bersama untuk kedua berkas uji ujung ke ujung), serta `Design_System.md` bagian 8 dan `Architecture.md` bagian 12.
  - Tidak disentuh: `engine/` (reducer F-02 sudah mencukupi), `content/scenes.ts` dan naskah lain, `Stage.tsx`, `Sprite.tsx`, `DayArc.tsx`, aset dan kit gambar, file galeri, `vite.pages.config.ts`, `package.json`, `pnpm-lock.yaml`, dan workflow.
- Aset yang dibutuhkan: tidak ada aset baru. Latar, strip tokoh, pose reaksi, dan ikon emosi sudah Disetujui dan terdaftar di manifest. Huruf A/B/C, kursor ▶, dan tanda lanjut berupa teks. Placeholder tidak diperlukan.
- Risiko (angka dari percobaan di luar repositori, 22 Okt 2026, memakai huruf Pixelify Sans dan Press Start 2P yang terpasang):
  - **Panel bawah 30u tidak cukup untuk pertanyaan dan tiga pilihan.** Dengan ukuran huruf Design System bagian 5 (pertanyaan 3,6u, pilihan 3,1u) dan tiga pilihan berdampingan seperti bagan bagian 3:
    - adegan 2 dan 4 muat (sekitar 29u), adegan 1 dan 6 butuh sekitar 34u, adegan 3 dan 5 sekitar 38u;
    - pilihan B adegan 5 (139 karakter) terbungkus menjadi 6 baris dan terpotong sekitar 6u, di 1280×720 maupun 1024×768;
    - tiga pilihan bertumpuk ke bawah malah butuh 34–39u;
    - narasi terpanjang (adegan 5, 184 karakter) hanya butuh sekitar 23u, jadi masalahnya hanya di layar pilihan.

    Lihat usulan 2.
  - **Satuan bingkai piksel belum pasti** (catatan Plan F-05). Lihat usulan 1.
  - **Fase yang tampilannya milik fitur lain.** Sesudah reaksi, mesin masuk ke fase dampak (F-06), kuis di adegan 5 (F-08), bintang (F-07), lalu akhir (F-09). Reducer tidak melewatinya sendiri: `LANJUT` di fase kuis ditolak sebelum `JAWAB_KUIS`, dan fase bintang menunggu `BERI_BINTANG`. Lihat usulan 4.
  - **Layar judul, pengaturan, dan prolog belum ada** (F-10), padahal reducer menolak `PILIH` bila belum ada tim. Lihat usulan 3.
  - **Keyboard.** Satu tekanan `Spasi` atau `Enter` pada tombol yang sedang berfokus memicu klik bawaan browser sekaligus pintasan, sehingga bisa menjadi dua aksi. Tombol yang ditahan juga mengirim tekanan berulang, dan kombinasi dengan Ctrl, Alt, atau Meta harus diabaikan. Spesifikasi menetapkan aturannya dan uji ujung ke ujung memeriksanya. Reducer sudah mengabaikan `PILIH` kedua.
  - **Waktu di antarmuka.** Lama reaksi dan sapuan diatur pengatur waktu di komponen, karena reducer tetap tanpa `setTimeout` (F-02 AC-14). Pengatur waktu wajib dibersihkan saat layar ditutup, dan tidak boleh mengirim aksi dua kali walau `StrictMode` menjalankan efek dua kali saat pengembangan.
  - **Teks per huruf dan pembaca layar.** Wilayah `aria-live` harus menerima teks utuh satu kali, bukan per huruf.
  - **Pengatur waktu diskusi di mesin** sudah berstatus berjalan sejak `NARASI_SELESAI`, tetapi belum ada yang mengirim `TICK` sampai `useTimer` dibuat di F-07. Di F-05 hal ini tidak tampil dan tidak berpengaruh.
  - **Halaman yang terbit berubah.** Layar kerangka mendapat tombol ketiga, dan alur permainan sementara bisa dibuka siapa pun yang tahu alamatnya. Permainan belum ditautkan dari galeri (F-11). Bila usulan 1 disetujui, garis tombol di layar kerangka dan pratinjau ikut menebal.
  - **Perbedaan huruf antarkomputer.** Pemenggalan baris di Windows bisa sedikit berbeda dari lingkungan agen. Usulan 2 menyisakan ruang cadangan, dan uji ujung ke ujung memastikan panel tidak meluap di keenam adegan (termasuk varian adegan 6) pada empat ukuran. Pengecekan di laptop dan proyektor kelas tetap perlu dilakukan pemilik proyek.
  - **Tailwind galeri** (catatan "Semua fitur"): kata baru di kode dan dokumen bisa menambah aturan CSS galeri. Sesudah entri ini ditulis, `build:pages` diulang dan berkas galeri tetap identik byte. Pemeriksaan yang sama diulang di tahap Test.
- Ukuran: M (batas atas).
- Keputusan Gerbang 1 (22 Okt 2026, balasan `Setuju: F-05`; keenam usulan disetujui):
  1. **Bingkai piksel = 2 piksel panggung.** "Garis ink 2 px" di Design System bagian 7 dibaca sebagai piksel panggung, dibulatkan ke piksel layar utuh: 4 px di 1280×720, 1366×768, dan 1024×768, serta 6 px di 1920×1080. Sudut terpotong dan sorotan putih masing-masing 1 piksel panggung. Alasannya:
     - Design System bagian 6 sudah menyebut bayangan antarmuka dalam "piksel logis";
     - garis 2 px CSS terlihat tipis di 1920×1080 (F-01 Temuan 4);
     - garis bingkai menjadi setebal piksel latar dan tokoh, sehingga panel dan panggung terasa satu gaya.

     Berlaku untuk semua bingkai, termasuk tombol layar kerangka (F-01) dan pratinjau (F-04), agar seragam. Design System bagian 7 diperjelas sesuai keputusan. Bila tidak disetujui, bingkai tetap 2 px CSS seperti sekarang.
  2. **Panel bawah 40u dan area panggung 52u**, bilah atas tetap 8u, untuk layar permainan dan pratinjau.
     - Skala panggung tetap di 1280×720 dan 1366×768 (k = 2) serta 1920×1080 (k = 3).
     - Di 1024×768 panggung mengecil dari k = 1,984 menjadi 1,664 (lebar 635 menjadi 532 px).
     - Dengan jarak dalam yang sedikit lebih rapat, pilihan terpanjang butuh sekitar 36u, sehingga tersisa hampir satu baris cadangan.
     - Design System bagian 3 ("panel bawah sekitar 30%") dan Architecture bagian 7 diperbarui.

     Alternatif yang tidak diusulkan: memperkecil huruf pilihan (mengurangi keterbacaan dari bangku belakang), memendekkan teks pilihan (mengubah naskah PRD bagian 8), atau membiarkan layar 4:3 memakai tinggi penuh alih-alih bingkai `ink`. Alternatif terakhir membuat panggung di 1024×768 malah membesar ke k = 2, tetapi mengubah aturan PRD bagian 10 dan Design System bagian 3, sehingga lebih cocok diputuskan tersendiri.
  3. **Pintu masuk sementara.** Alamat `sehari-setara/#main` membuka alur permainan langsung di adegan 1. Judul, pengaturan, dan prolog (F-10) dilewati dengan dua tim bawaan yang belum ditampilkan (F-07). Layar kerangka mendapat tombol ketiga, dengan usulan teks "Coba alur permainan" (`href="#main"`). Meninggalkan alamat itu mengakhiri permainan, dan membukanya lagi mulai dari awal. Pintu ini diganti layar judul di F-10.
  4. **Jembatan sementara untuk fase milik fitur lain.**
     - Sesudah reaksi, panel menampilkan pilihan yang diambil dalam status terkunci, ditambah tombol "Lanjut".
     - "Lanjut" melewati fase dampak, kuis, dan bintang dengan nilai netral tanpa menampilkannya: bintang 0, dan jawaban kuis adegan 5 diisi dari naskah. Sesudah itu sapuan berjalan ke adegan berikutnya.
     - Sesudah adegan 6 tampil layar sementara yang menyatakan keenam adegan selesai, dengan tombol untuk main lagi dari adegan 1 dan kembali ke galeri.
     - Setiap bagian jembatan diganti fitur pemiliknya: kartu dampak (F-06), bintang (F-07), kuis (F-08), dan layar akhir (F-09).
  5. **Pratinjau panggung tetap dipertahankan** sebagai alat tinjau (catatan Plan F-05), tanpa fitur baru. Alasannya: pratinjau adalah cara tercepat memeriksa ke-24 tampilan panggung, dan 16 uji ujung ke ujung F-04 bergantung padanya. Nasib tautannya ditinjau lagi di F-10, saat layar judul menggantikan layar kerangka.
  6. **Cara uji**: `content:check`, `test` (ditambah `controls.test.ts`), `build:pages` (berkas galeri harus identik byte), dan `test:e2e`.
     - Uji F-04 disesuaikan dengan tata letak baru.
     - Uji alur baru: main dari adegan 1 sampai 6 hanya dengan keyboard, tiga jalur naskah (semua B, B-B-B-C-C-C, semua A), varian adegan 6, kunci klik ganda, sapuan dan pudar, serta panel tanpa luapan di keenam adegan pada empat ukuran.
     - Tangkapan layar di 1280×720 dan 1024×768, ditambah 1920×1080.
     - Daftar periksa manual AGENTS bagian 9 yang kini berlaku: dimainkan sampai akhir hanya dengan keyboard, kurangi gerak mematikan sapuan, serta tampilan di 1024×768 dan 1920×1080. Keterbacaan di proyektor dan laptop kelas bawah tetap dicek pemilik proyek.
     - Tidak ada dependensi baru, jadi `package.json` dan `pnpm-lock.yaml` tidak berubah.

## F-06 — Indikator dan kartu dampak
- Status: Selesai (23 Okt 2026). Riwayat 23 Okt 2026: direncanakan; disetujui (balasan `Setuju: F-06`; kesembilan usulan diterima); spesifikasi disetujui ([F-06-indikator-kartu-dampak.md](specs/F-06-indikator-kartu-dampak.md), balasan `Spesifikasi disetujui: F-06`); dibangun dan diuji ([F-06-hasil.md](tests/F-06-hasil.md), lulus).
- Memenuhi:
  - FR-07: sesudah reaksi tokoh (F-05), kartu dampak menampilkan "Yang terjadi", "Hak yang terdampak", "Kewajiban terkait", dan "Rujukan", dengan kepala berwarna dan bertanda tingkat.
  - FR-08 (sisi tampilan): dua indikator 0–100 di panel kiri, yang bergerak naik atau turun saat kartu dampak tampil. Sisi mesin sudah selesai di F-02.
  - Design System bagian 7 (indikator dan kartu dampak) dan bagian 8 (angka melayang, kurangi gerak).
  - Architecture bagian 10: kartu memakai `role="dialog"` dengan fokus di dalamnya, isinya diumumkan lewat wilayah `aria-live`, dan tingkat ditandai ikon serta teks, tidak hanya warna.
  - PRD bagian 5 (TP 2 dan TP 3) dan bagian 6 ("kartu dampak + indikator bergerak").
- Bergantung pada: F-05 (selesai dan sudah terbit). Memakai mesin F-02, naskah F-03, manifest F-12, serta tata letak F-04 dan F-05.
- File yang dibuat/diubah:
  - Baru `app/sehari-setara/ui/Meters.tsx`: panel indikator kiri berisi ikon, label, batang 10 segmen, angka nilai, dan angka melayang.
  - Baru `app/sehari-setara/ui/ImpactCard.tsx`: kartu dampak sebagai dialog.
  - Baru `app/sehari-setara/ui/impact.ts`: fungsi murni untuk nilai indikator sebelum dan sesudah pilihan (dihitung dari `history`, usulan 5), isi segmen termasuk setengah segmen, jadwal gerak segmen, dan teks angka melayang.
  - Baru `app/sehari-setara/__tests__/impact.test.ts`: uji unit `impact.ts`.
  - Baru `e2e/kartu-dampak.spec.ts`: uji ujung ke ujung kartu dan indikator.
  - Diubah `app/sehari-setara/ui/PlayScreen.tsx`: panel indikator di semua fase permainan, kartu dampak di fase `impact`, dan jembatan sementara yang kini hanya melewati kuis dan bintang (usulan 8).
  - Diubah `app/sehari-setara/ui/controls.ts`: `bridgeActions` dipecah karena bagian dampak diganti kartu, serta `Spasi` dan `Enter` di fase `impact` menjadi tombol lanjut kartu.
  - Diubah `app/sehari-setara/content/copy.ts`: label indikator, tulisan tingkat, judul bagian kartu, dan teks pembaca layar.
  - Diubah `app/sehari-setara/styles/game.css`: kelas panel indikator dan kartu dampak. Warnanya hanya dari token yang sudah ada (`--ss-meter-hak`, `--ss-meter-kewajiban`, `--ss-tier-*`); tidak ada token `:root` baru.
  - Diubah `app/sehari-setara/ui/layout.ts` bila letak kartu dan panel indikator perlu konstanta; diputuskan di spesifikasi.
  - Diubah `app/sehari-setara/__tests__/controls.test.ts` dan `e2e/alur-permainan.spec.ts`: harapan jembatan dan alur baru, yaitu kartu muncul sebelum adegan berganti.
  - Diubah `docs/sehari-setara/Design_System.md` (bagian 7 dan 8: letak dan isi kartu, setengah segmen, angka melayang) dan `Architecture.md` (bagian 3, 7, 9, 10, dan 12).
  - Dokumen: `specs/F-06-indikator-kartu-dampak.md`, `tests/F-06-hasil.md`, tangkapan layar di `tests/F-06/`, dan entri ini.
  - Perbedaan dari daftar di atas, disetujui bersama spesifikasi: `ui/controls.ts`, `__tests__/controls.test.ts`, dan `ui/layout.ts` tidak diubah, karena urutan `bridgeActions` sudah tepat untuk tombol kartu; `e2e/bantuan.ts` diubah untuk fungsi uji bersama kartu dampak.
  - Penyesuaian saat Build, disetujui pemilik proyek 23 Okt 2026 (balasan `Lanjutkan`): celah antarindikator 7u, bukan 6u (laporan uji, Temuan 1).
  - Tidak disentuh: `engine/`, naskah (`scenes.ts`, `references.ts`), `Verifikasi_Rujukan.md`, `content.test.ts`, aset dan kit gambar (bila usulan 2 disetujui), `Stage.tsx`, `StagePreview.tsx`, file galeri, `vite.pages.config.ts`, `package.json`, `pnpm-lock.yaml`, dan workflow.
- Aset yang dibutuhkan:
  - Tersedia dan Disetujui: `ui_hak` (D-01) dan `ui_kewajiban` (D-02) untuk indikator.
  - Ikon tingkat di kepala kartu: belum ada aset khusus, padahal Design System bagian 7 meminta "ikon dan tulisan tingkat". Usulan 2 memakai ikon emosi D-09 yang sudah Disetujui, sehingga placeholder tidak diperlukan.
- Risiko (angka dari percobaan di luar repositori, 23 Okt 2026: maket kartu disuntikkan ke hasil build F-05 di `/ruang-setara/sehari-setara/#main`, lalu diukur dengan huruf asli di Chromium 141 pada empat ukuran layar):
  - **Isi kartu terpanjang.** Kartu adegan 5 memuat sampai 168 huruf "Yang terjadi", 76 huruf hak, dan enam rujukan sepanjang 330 huruf (R-11 saja 120 huruf). Pilihan A adegan 2 memuat 171 huruf "Yang terjadi". Sisa ruang terkecil dari ke-18 kartu (angka negatif berarti meluap):

    | Letak kartu | Ukuran huruf | Sisa terkecil |
    |---|---|---|
    | Panel bawah 40u, satu halaman | lega atau ringkas | −15 sampai −32u (semua kartu meluap) |
    | Panel bawah 40u, dua halaman | ringkas | halaman 1 −4,2 sampai −6,5u; halaman rujukan 0,2 sampai 2,5u |
    | Kolom tengah selebar panggung, satu kolom | ringkas | 1,0u di 1280×720 dan 1920×1080; −1,8u di 1366×768; −0,8u di 1024×768 |
    | Kolom tengah, dua kolom, "Lanjut" di kepala kartu | ringkas | 7,5u (1366×768) sampai 15,7u (1024×768) |
    | Kolom tengah, dua kolom, "Lanjut" di kepala kartu | lega | −0,6 sampai −12,9u |
    | Kartu lebar (semua kecuali panel indikator kiri), dua kolom | lega | 15,7u (1024×768) sampai 17,9u (1366×768) |

    Huruf lega: "Yang terjadi" 3,6u (sama dengan narasi), hak, kewajiban, dan rujukan 3,1u. Huruf ringkas: "Yang terjadi", hak, dan kewajiban 3,1u, rujukan 2,5u (batas minimum Design System bagian 5). Judul bagian 2,5u. Lihat usulan 1.
  - **Papan tim F-07.** Kartu lebar menutupi panel kanan selama kartu terbuka, padahal FR-09 menyebut papan skor tim selalu terlihat. Kartu kolom tengah tidak menutupinya, tetapi hanya muat dengan huruf ringkas.
  - **Nilai indikator sudah berubah sejak `PILIH`.** Reducer F-02 menerapkan efek saat memilih, sedangkan PRD bagian 6 menggerakkan indikator bersama kartu dampak. Tanpa penanganan, indikator melompat ketika reaksi baru dimulai. Lihat usulan 5.
  - **Batas 0 dan 100.** Pada jalur semua B, hak menjadi 60, 70, 85, 100, 100, 100 dan kewajiban 65, 80, 90, 100, 100, 100, karena F-02 membatasi nilai per langkah. Di adegan 5 dan 6 batang tidak bergerak walaupun efeknya +15 dan +20. Efek nol juga ada di tiga pilihan: hak pada 2C dan 3C, kewajiban pada 6C. Lihat usulan 3.
  - **Kelipatan 5 dan 10 segmen.** Satu segmen bernilai 10, sedangkan nilai bisa 65 atau 75; ambang akhir 75 dan 40 (PRD bagian 9) juga tidak jatuh di batas segmen. Lihat usulan 4.
  - **Tanda minus.** Pixelify Sans memuat tanda minus (U+2212), sedangkan Press Start 2P tidak. Angka melayang ditulis dengan Pixelify Sans agar "−10" tidak tampil dengan huruf cadangan. Kedua huruf juga tidak memuat kursor ▶ (U+25B6); ini sudah berlaku sejak F-01 dan di luar cakupan F-06.
  - **Tekanan ganda.** Kartu muncul 1,2 detik sesudah memilih. `Spasi` yang ditekan berulang bisa langsung menutup kartu sebelum dibaca. Lihat usulan 6.
  - **Fokus dialog.** Architecture bagian 10 meminta fokus kembali ke tombol pemicu sesudah dialog ditutup, padahal kartu dampak muncul sendiri dan langsung diikuti pergantian adegan. Spesifikasi akan menetapkan fokus masuk ke kartu saat muncul, lalu ke tombol lanjut kotak narasi adegan berikutnya seperti aturan F-05.
  - **Panel indikator kiri.** Ruang di samping panggung 42,7u (1024×768), 44,4u (1280×720 dan 1920×1080), dan 47,2u (1366×768). Dengan jarak tepi 2u, baris batang dan angka butuh 35,6–36,3u dari 38,7–43,3u yang tersedia, dan kedua label muat dalam satu baris.
  - **Panel bawah.** F-06 tidak menambah apa pun ke panel pilihan, sehingga sisa ruang 3,05–3,3u (F-05, Temuan 2) tidak berkurang.
  - **Rujukan yang belum terverifikasi** mulai terlihat di alamat `#main` (0 dari 14 terverifikasi). Lihat usulan 7.
  - **Halaman yang terbit berubah.** Alamat `#main` kini menampilkan indikator dan kartu dampak. Permainan belum ditautkan dari galeri (F-11).
  - **Tailwind galeri** (catatan "Semua fitur"): sesudah entri ini ditulis, `build:pages` diulang dan berkas galeri tetap identik byte dengan build sebelum F-06. Pemeriksaan yang sama diulang di tahap Test.
  - **Jam uji Playwright** (catatan "Semua fitur"): uji yang mengatur waktu gerak indikator dan pengaman tekanan ganda menjeda jam dengan `pauseAt`.
  - **Anggaran:** kode game sekarang 13,93 KB gzip ditambah React 60,18 KB gzip, sekitar 74 KB dari 150 KB. F-06 menambah dua komponen kecil.
- Ukuran: M (batas atas).
- Keputusan Gerbang 1 (23 Okt 2026, balasan `Setuju: F-06`; kesembilan usulan disetujui):
  1. **Kartu lebar.** Kartu menutupi panggung, panel kanan, dan panel bawah, sedangkan panel indikator kiri tetap terlihat agar gerak indikator bisa diikuti. Isinya dua kolom: kiri "Yang terjadi", "Hak yang terdampak", dan "Kewajiban terkait"; kanan "Rujukan". Ukuran hurufnya lega, dengan sisa ruang paling sedikit 15,7u.
     - Papan tim F-07 tertutup selama kartu terbuka. FR-09 dibaca sebagai "selalu terlihat, kecuali saat sebuah dialog terbuka", dan bacaan ini dicatat di Design System bagian 7.
     - Alternatif: kartu di kolom tengah selebar panggung, sehingga kedua panel samping tetap terlihat, dengan huruf ringkas (rujukan 2,5u) dan "Lanjut" di kepala kartu.
     - Tidak diusulkan: kartu di panel bawah 40u, karena satu halaman maupun dua halaman tetap meluap.
     - Maket kedua letak untuk adegan 5 pilihan B dikirim lewat percakapan dan tidak disimpan di repositori.
  2. **Ikon tingkat dari ikon emosi D-09** dengan aturan yang sama dengan reaksi F-03: hati untuk tepat, keringat untuk kurang tepat, dan seru untuk berisiko. Ikon 8×8 itu ditampilkan dua kali lipat di kepala kartu, di sebelah tulisan tingkat. Tidak ada aset baru. Alternatif: tiga ikon tingkat 16×16 baru (D-12), digambar dalam peran Pembuat aset dan diajukan di Gerbang 2.
  3. **Angka melayang menampilkan efek di naskah** ("+15", "−10", atau "0"), juga ketika batang sudah mentok di 0 atau 100. Batang dan angka di ujungnya selalu menunjukkan nilai sebenarnya sesudah dibatasi. Bila kurangi gerak aktif, angka melayang tidak tampil (Design System bagian 8), dan perubahan nilai tetap dibacakan lewat wilayah `aria-live`.
  4. **Setengah segmen.** Setiap segmen bernilai 10, dan nilai kelipatan 5 ditampilkan dengan segmen terisi separuh; misalnya 65 menjadi enam segmen penuh dan satu segmen separuh. Angka pasti tetap tampil di ujung batang.
  5. **Indikator bergerak bersama kartu.** Selama reaksi, indikator masih menunjukkan nilai sebelum memilih, yang dihitung ulang dari `history` tanpa entri adegan berjalan. Saat kartu muncul, kedua batang bergerak bersamaan per setengah segmen, paling lama 0,4 detik. `engine/` tidak diubah.
  6. **Pengaman tekanan ganda.** Tombol "Lanjut" kartu baru menerima klik dan tombol keyboard sesudah gerak indikator selesai, paling lama 0,6 detik sesudah kartu muncul.
  7. **Rujukan tampil apa adanya**, tanpa tanda "perlu verifikasi", karena alamat `#main` belum ditautkan dari galeri dan rilis tetap diblokir di F-11 sampai semua kotak `Verifikasi_Rujukan.md` dicentang pemilik proyek. Alternatif: catatan kecil "Rujukan sedang diverifikasi" di kartu sampai F-11.
  8. **Jembatan sementara diperpendek.** "Lanjut" di kartu langsung membawa kelas ke adegan berikutnya lewat sapuan atau pudar. Kuis adegan 5 dan bintang tetap dilewati tanpa ditampilkan (jawaban dari naskah dan bintang 0) sampai F-08 dan F-07. Tombol "Lanjut" jembatan di baris status tidak muncul lagi.
  9. **Cara uji:** `content:check`, `test` (ditambah `impact.test.ts` dan `controls.test.ts` yang disesuaikan), `build:pages` (berkas galeri identik byte, ukuran, path relatif), dan `test:e2e`.
     - Ke-28 uji lama disesuaikan dengan alur baru.
     - Uji baru: isi ke-18 kartu sama dengan naskah; warna, ikon, dan tulisan tingkat; nilai indikator pada tiga jalur naskah, termasuk batas 100 dan 0; setengah segmen; angka melayang dan kurangi gerak; fokus dialog dan keyboard; pengaman tekanan ganda; kartu dan panel indikator tanpa luapan di empat ukuran; serta tanpa galat konsol dan tanpa respons 4xx.
     - Tangkapan layar di 1280×720 dan 1024×768, ditambah 1920×1080; `tsc` dan ESLint.
     - Daftar periksa manual AGENTS bagian 9 yang berlaku. Keterbacaan di proyektor dan laptop kelas bawah tetap dicek pemilik proyek.
     - Tidak ada dependensi baru, jadi `package.json` dan `pnpm-lock.yaml` tidak berubah.

## F-07 — Tim, giliran, bintang alasan, pengatur waktu
- Status: Selesai (26 Okt 2026). Riwayat 26 Okt 2026: direncanakan; disetujui (balasan `Setuju: F-07`; kesepuluh usulan diterima; durasi bawaan tetap 60 detik), dengan tambahan bunyi dari pemilik proyek; spesifikasi disetujui ([F-07-tim-waktu-bintang.md](specs/F-07-tim-waktu-bintang.md), balasan `Spesifikasi disetujui: F-07`; saran S-1 sampai S-8 dipakai, S-6 menunggu jawaban); dibangun dan diuji ([F-07-hasil.md](tests/F-07-hasil.md), lulus).
- Memenuhi:
  - FR-05: pengatur waktu diskusi yang bisa dijeda, ditambah 30 detik, dan dilewati, lewat tombol atau `P`, `T`, `S`. Saat waktu habis tampil "Waktunya memilih" tanpa pilihan otomatis. Sisi mesin (`TICK`, `JEDA_WAKTU`, `TAMBAH_30`, `LEWATI_DISKUSI`) sudah ada sejak F-02.
  - FR-06 (sisi tampilan): papan tim menandai tim aktif dengan ▶ dan tulisan "Giliran". Giliran berotasi per adegan lewat `activeTeamIndex` F-02.
  - FR-09: guru memberi 0, 1, atau 2 bintang kepada tim aktif lewat tombol atau `0` `1` `2`. Papan tim selalu terlihat, kecuali saat kartu dampak terbuka (bacaan FR-09, keputusan Gerbang 1 F-06 nomor 1).
  - FR-02 sebagian: papan tim menampung 2–4 tim dengan warna, bentuk, dan nama dari `content/teams.ts`, dan durasi diskusi bawaan diputuskan (PRD bagian 16 nomor 3). Layar pengaturan kelas tetap milik F-10.
  - FR-16 sebagian: `P`, `T`, `S`, serta `0` `1` `2` (Architecture bagian 9); ditambah `M` karena tambahan bunyi.
  - FR-19 sebagian (tambahan pemilik proyek, 26 Okt 2026): bunyi klik tombol dan bunyi teks per huruf. Bunyi lain FR-19 tetap di F-13.
  - Design System bagian 7 (pengatur waktu, papan tim, bintang alasan), bagian 8 (pop bintang, kurangi gerak), dan bagian 9 (suara); Architecture bagian 6 (fase `stars`), 8, 9, dan 10.
- Bergantung pada: F-05 (selesai dan sudah terbit). Memakai mesin F-02 (giliran, bintang, dan aksi pengatur waktu), manifest F-12, tata letak F-04 dan F-05, serta kartu dampak F-06.
- File yang dibuat/diubah:
  - Baru `app/sehari-setara/ui/Teams.tsx`: papan tim (usulan 1).
  - Baru `app/sehari-setara/ui/Timer.tsx`: pengatur waktu dan ketiga tombolnya (usulan 2).
  - Baru `app/sehari-setara/ui/StarsAward.tsx`: ajakan dan tombol bintang alasan (usulan 4).
  - Baru `app/sehari-setara/ui/useTimer.ts`: kait yang mengirim `TICK` (usulan 3).
  - Baru `app/sehari-setara/ui/timer.ts`: fungsi murni untuk teks menit:detik, isi 12 blok, nada (biasa, sepuluh detik terakhir, habis), detik yang jatuh tempo, batas "+30", jadwal pop bintang, serta peristiwa dan kalimat pengumuman (usulan 5).
  - Baru `app/sehari-setara/__tests__/timer.test.ts` dan `e2e/tim-waktu-bintang.spec.ts`.
  - Diubah `app/sehari-setara/ui/PlayScreen.tsx`: panel kanan, fase `stars`, pemberian bintang, kait pengatur waktu, wilayah pengumuman kedua, dan panggung yang disembunyikan selama kartu tampil (usulan 8).
  - Diubah `app/sehari-setara/ui/controls.ts` dan `__tests__/controls.test.ts`: `keyCommand` untuk `P` `T` `S` (fase `discuss`) dan `0` `1` `2` (fase `stars`); `Spasi` dan `Enter` tidak lagi berarti lanjut di fase `stars`; `bridgeActions` berhenti di fase `stars` (usulan 4).
  - Diubah `app/sehari-setara/ui/ChoicePanel.tsx` bila perlu, agar baris status tidak mengambil fokus dari ajakan bintang (risiko "Fokus di fase `stars`").
  - Diubah `app/sehari-setara/content/copy.ts`: teks papan, pengatur waktu, bintang, dan pengumuman.
  - Diubah `app/sehari-setara/styles/game.css`: kelas panel kanan, papan, pengatur waktu, tombol bintang, dan pop. Warnanya hanya dari token yang sudah ada; tidak ada token `:root` baru.
  - Bila usulan 9 disetujui: `ui/layout.ts` (`parseRoute` mengenali `#main-3` dan `#main-4`), `Game.tsx`, dan `__tests__/layout.test.ts`. `content/teams.ts` tidak berubah.
  - Bila durasi bawaan bukan 60 detik (usulan 7): `engine/reducer.ts` (`DEFAULT_SETTINGS`), `__tests__/reducer.test.ts`, dan `PRD.md` bagian 16 dan 17.
  - Diubah `e2e/alur-permainan.spec.ts`, `e2e/kartu-dampak.spec.ts`, dan `e2e/bantuan.ts`: langkah bintang sesudah setiap kartu.
  - Diubah `docs/sehari-setara/Design_System.md` (bagian 3, 7, dan 8) dan `Architecture.md` (bagian 3, 6, 7, 9, 10, dan 12).
  - Dokumen: `specs/F-07-tim-waktu-bintang.md`, `tests/F-07-hasil.md`, tangkapan layar di `tests/F-07/`, dan entri ini.
  - Tidak disentuh: `engine/` (kecuali usulan 7), naskah, rujukan, `Verifikasi_Rujukan.md`, aset, kit gambar, manifest, `CREDITS.md`, `Stage.tsx`, `Sprite.tsx`, `DayArc.tsx`, `Meters.tsx`, `ImpactCard.tsx`, `StagePreview.tsx`, file galeri, `vite.pages.config.ts`, `playwright.config.ts`, `package.json`, `pnpm-lock.yaml`, dan workflow.
  - Perbedaan dari daftar di atas, terutama karena tambahan bunyi, disetujui bersama spesifikasi (Gerbang 2, 26 Okt 2026; rinciannya di spesifikasi, "Perbedaan dengan daftar file di rencana"):
    - baru `ui/sound.ts`, `assets/wav.d.ts`, `assets/sfx/sfx_klik.wav`, `assets/sfx/sfx_teks.wav`, `__tests__/sound.test.ts`, dan `e2e/suara.spec.ts`;
    - diubah `assets/manifest.ts` (kelompok `sounds`), `assets/CREDITS.md`, `ui/NarrationBox.tsx`, `__tests__/asset-checks.ts`, `__tests__/assets.test.ts`, `Daftar_Aset.md`, `AGENTS.md` (baris backlog F-07 dan F-13), dan `PRD.md` bagian 17;
    - `ui/timer.ts` dan `__tests__/timer.test.ts` menjadi `ui/turn.ts` dan `__tests__/turn.test.ts`, karena `timer.ts` dan `Timer.tsx` hanya berbeda huruf besar dan bisa tertukar saat diimpor di Windows dan macOS;
    - `ui/ChoicePanel.tsx` pasti diubah, sedangkan `engine/reducer.ts` dan `__tests__/reducer.test.ts` tidak, karena durasi tetap 60 detik.
  - Penyesuaian saat Build, dicatat sebagai **[Build]** di spesifikasi: wilayah pengumuman kedua tidak dikosongkan saat adegan berganti; `Teams` menerima `pop`, bukan `popKey` dan `animate`; kelas tambahan `ss-timer-text` dan `ss-timer-row`; dua uji lama yang mengklik ganda kartu memberi bintang tanpa memeriksa fokus; simulasi bunyi teks di uji ujung ke ujung memakai salinan aturan `textBlipDue`; dan `pauseAt` dipanggil sebelum halaman dimuat (laporan uji, Temuan 1–5).
- Aset yang dibutuhkan: tidak ada aset baru, dan placeholder tidak diperlukan. Semua yang dipakai sudah Disetujui (21 Okt 2026) dan terdaftar di manifest:
  - bentuk tim D-07 (`teamIcons`): lingkaran `mango`, segitiga `sky-d`, persegi `leaf`, dan bintang bersudut empat `sun`;
  - bintang alasan D-03 (`iconStrips.star`, 3 bingkai: kecil, besar berkilau, normal) untuk jumlah bintang dan pop;
  - jam D-04 (`icons.clock`) untuk pengatur waktu.

  Kursor ▶ berupa teks, seperti sejak F-01.

  Tambahan bunyi (26 Okt 2026): dua berkas WAV dari halaman uji suara pemilik proyek, `sfx/sfx_klik.wav` (klik gaya A, 2.028 byte) dan `sfx/sfx_teks.wav` (teks gaya B, 1.454 byte), identik byte dengan aslinya. Format, asal, dan lisensinya diputuskan di Gerbang 2 (spesifikasi, butir S-1, S-6, dan S-8).
- Risiko (angka dari percobaan di luar repositori, 26 Okt 2026: build `main` dari ZIP; maket papan tim, pengatur waktu, dan tombol bintang disuntikkan ke `/ruang-setara/sehari-setara/#main`, lalu diukur dengan huruf asli di Chromium 153 pada empat ukuran):
  - **Ruang panel kanan.** Panel kanan selebar panel indikator. Sesudah jarak dalam 2u kiri-kanan, lebar isinya 40,4u (1280×720 dan 1920×1080), 43,2u (1366×768), dan 38,7u (1024×768); tingginya 52u.
    - Rancangan pertama, dengan ruang bingkai di setiap baris tim dan tombol "+30 detik" yang terbungkus dua baris, tidak muat: 4 tim meluap 5,3u di 1280×720 dan 1920×1080 serta 12,3u di 1024×768, dan 3 tim pun meluap 3,7u di 1024×768.
    - Rancangan ringkas usulan 1, 2, dan 4 muat. Sisa ruang di bawah blok terakhir:

      | Isi panel kanan | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
      |---|---|---|---|---|
      | 2 tim, fase diskusi | 18,2u | 19,0u | 18,2u | 14,8u |
      | 4 tim, fase diskusi (papan dan pengatur waktu) | 6,9u | 8,3u | 6,9u | 1,3u |
      | 4 tim, fase bintang (papan dan tombol bintang) | 9,0u | 13,1u | 9,0u | 5,4u |

    - Tinggi setiap baris tetap dan tidak ada teks yang terbungkus, sehingga sisa 1,3u di 1024×768 tidak bergantung pada perbedaan huruf antarkomputer. Uji ujung ke ujung memeriksanya dengan 4 tim (usulan 9).
  - **Lebar nama tim.** Kotak nama 18,6u di 1024×768, 22,6u di 1280×720 dan 1920×1080, serta 25,9u di 1366×768. "Tim Mentari", nama bawaan terpanjang, selebar 17,8u, jadi sisanya 0,7u di 1024×768. Nama seperti "Tim Jalak Bali" (19,3u) atau "Tim Kupu-kupu" (20,7u) tidak muat di 1024×768. Daftar nama di F-10 perlu mengikuti batas ini; dicatat di "Catatan untuk Plan berikutnya" saat Build.
  - **Bentrok dokumen: letak `useTimer`.** Architecture bagian 3 menaruh `useTimer.ts` di `engine/`, sedangkan uji F-02 AC-14 (`reducer.test.ts`) memeriksa setiap berkas `.ts` di `engine/` bebas dari `setInterval`, `setTimeout`, `Date`, dan `Math.random`. Kait pengatur waktu pasti memakai salah satunya. Lihat usulan 3.
  - **Jam uji dan pengatur waktu.** Model kait usulan 3 dicoba dengan jam uji Playwright:
    - `runFor(999)` belum menghasilkan detik, `runFor(1000)` menghasilkan 1, dan 10 detik menghasilkan 10;
    - jeda membuang sisa pecahan detik (0,7 detik), dan hitungan mulai dari nol lagi saat dilanjutkan;
    - `performance.now()` ikut jam uji;
    - tetapi `pauseAt` yang melompat 30 detik saat diskusi berjalan langsung menghabiskan 30 detik.

    Aturan uji: `pauseAt` dipanggil sebelum diskusi dimulai (di fase narasi, seperti uji sekarang), dan waktu diskusi hanya dimajukan dengan `runFor`. Aturan dua langkah F-06 juga berlaku, karena kait baru mulai menghitung sesudah React menggambar fase `discuss`. Ditambahkan ke catatan "Semua fitur dengan jam uji" saat Build.
  - **Uji lama perlu langkah bintang.** Sesudah F-07, "Lanjut" kartu berhenti di fase `stars`. Akibatnya 24 dari 43 uji ujung ke ujung lama (9 uji `alur-permainan.spec.ts` dan 15 uji `kartu-dampak.spec.ts`) harus menekan `0`, `1`, atau `2` sesudah setiap kartu. Ke-16 uji F-04 dan 3 uji awal F-05 tidak berubah.
  - **Lingkungan uji berubah.** Chromium 141 (revisi 1194) untuk `@playwright/test` 1.56.1 tidak lagi ada di lingkungan agen, dan unduhannya ditolak (403). Yang tersedia Chromium 153. Dengan berkas konfigurasi pengganti di luar repositori yang hanya menambah jalur Chromium 153, ke-43 uji lama lulus: 16 uji F-04 dalam 28 detik dan 27 uji F-05/F-06 dalam 2,1 menit. Ukuran huruf hampir sama dengan laporan sebelumnya: sisa panel bawah 3,05–3,38u (usulan 6) dan sisa kartu terpanjang 15,7–17,5u (laporan F-06: 15,7–17,9u). Lihat usulan 10.
  - **Fokus di fase `stars`.** `ChoicePanel` memfokuskan baris status saat dipasang, dan panel pilihan dipasang lagi tepat saat fase `stars` dimulai, karena di fase `impact` panel bawah kosong. Fokus harus berakhir di ajakan bintang (usulan 4), jadi urutannya ditetapkan di spesifikasi dan diuji.
  - **Adegan 6.** Sesudah bintang adegan 6, layar akhir sementara langsung tampil, sehingga pop dan jumlah bintang terakhir tidak sempat terlihat. Jumlah bintang akhir setiap tim perlu tampil di F-09 (layar akhir atau rekap); dicatat untuk Plan F-09 saat Build.
  - **Pembaruan setiap detik.** Selama diskusi, layar permainan digambar ulang sekali per detik. Ringan di lingkungan agen, tetapi termasuk butir manual "laptop kelas bawah".
  - **Halaman yang terbit berubah.** Alamat `#main` kini menampilkan papan tim dan pengatur waktu, dan setiap adegan menunggu bintang dari guru sebelum berganti. Permainan belum ditautkan dari galeri (F-11).
  - **Tailwind galeri** (catatan "Semua fitur"): sesudah entri ini ditulis, `build:pages` diulang, dan keempat berkas galeri (`index.html`, `main-Bp-7VtNx.css`, `main-CC47J1DW.js`, `jsx-runtime-CmKW-gyo.js`) tetap identik byte dengan build `main`. Pemeriksaan yang sama diulang di tahap Test.
  - **Anggaran:** JS permainan sekarang 15,40 KB gzip ditambah React 60,18 KB gzip, sekitar 76 KB dari 150 KB. F-07 diperkirakan menambah 2–3 KB gzip.
  - **Bunyi (tambahan 26 Okt 2026).** Diukur di luar repositori dengan berkas asli dari halaman uji suara, di Chromium 153:
    - Format: Architecture bagian 8 dan Design System bagian 9 meminta MP3, sedangkan bunyi yang dipilih berupa WAV (2.028 dan 1.454 byte). MP3 64 kbps hasil ffmpeg berukuran 1.088 byte per berkas dan di-*decode* tanpa hening di awal, tetapi bentuk gelombang klik sedikit berubah (kemiripan 0,993, puncak turun sekitar 1 dB). Lihat butir S-1 spesifikasi.
    - Build: WAV yang diimpor lewat manifest menjadi berkas berhash terpisah (`sfx_klik-*.wav` 2,02 kB dan `sfx_teks-*.wav` 1,45 kB) dengan URL relatif; `tsc` lulus dengan deklarasi `*.wav`; keempat berkas galeri tetap identik byte.
    - Aturan putar otomatis peramban: konteks audio harus dibuat saat interaksi. Konteks yang dibuat pada `keydown` pertama berstatus `running`, dan sebelum interaksi tidak ada konteks. Akibatnya klik pertama dan layar narasi pertama adegan 1 biasanya tanpa bunyi.
    - Kerapatan: pada 40 huruf per detik, bunyi teks setiap 2 huruf terdengar sekitar 16,5 kali per detik, lebih rapat daripada di halaman uji (sekitar 11,8). Pada naskah asli, 9 layar narasi menghasilkan 424 bunyi teks, tanpa bunyi yang menumpuk. Lihat butir S-3.
    - Jam uji: dengan jam uji Playwright, bunyi di halaman uji terhitung tepat (33 bunyi teks untuk 66 huruf, dan 1 klik) lewat pembungkus `AudioBufferSourceNode.prototype.start` di skrip uji, sehingga bunyi bisa diuji tanpa didengarkan.
    - Asal bunyi dan lisensinya belum diketahui, padahal diperlukan untuk `CREDITS.md` (butir S-6). Tik pelan sepuluh detik terakhir (Design System bagian 7 dan 9) belum punya bunyi pilihan (butir S-5). Tanpa tombol mematikan, guru hanya bisa memakai volume laptop (butir S-4).
    - Anggaran: aset bertambah 3,4 KB, dari 61,8 KB menjadi 65,2 KB dari 4 MB.
- Ukuran: L: tiga komponen kecil, satu kait, dua modul murni, pemutar bunyi, perluasan uji aset, dan penyesuaian 24 uji lama. Sebelum tambahan bunyi, M (batas atas).
- Keputusan Gerbang 1 (26 Okt 2026, balasan `Setuju: F-07`; kesepuluh usulan diterima). Teks usulan di bawah dipertahankan sebagai catatan; alternatifnya tidak dipilih. Maket dikirim lewat percakapan dan tidak disimpan di repositori:
  1. **Papan tim di panel kanan.**
     - Panel kanan mencerminkan panel indikator: dari tepi kanan bingkai panggung sampai tepi kanan layar, atas 8u, tinggi 52u, dengan jarak dalam 3u atas dan 2u kiri-kanan. Papan tim di bagian atas. Di bawahnya satu blok yang berganti menurut fase: pengatur waktu di fase `discuss` (usulan 2), tombol bintang di fase `stars` (usulan 4), dan kosong di fase lain. Kartu dampak menutup panel ini (keputusan F-06), dan layar akhir sementara tidak menampilkannya.
     - Satu baris per tim, urut sesuai pengaturan: ikon bentuk 16p, nama tim (Pixelify Sans 3,1u), lalu di kanan ikon bintang 16p (bingkai normal D-03) dan jumlah bintang (Press Start 2P 2,8u). Jumlah paling banyak 6 (dengan dua tim, satu tim mendapat tiga giliran), jadi selalu satu angka. Tinggi baris 5,2u (1280×720 dan 1920×1080), 5,0u (1366×768), dan 6,4u (1024×768, karena ikon 16p di sana setinggi 5,6u), dengan celah 0,4u.
     - Warna tim hanya pada ikon bentuk D-07, yang sudah berwarna tim. Nama dan angka selalu `ink` di atas `cream` (13,3:1). Latar berwarna tim tidak dipakai, karena teks `ink` di atas `sky-d` (Tim Laut) hanya 3,8:1.
     - Tim aktif ditandai ▶ di kiri, bingkai piksel F-05 di sekeliling barisnya (garis `ink` 2p, sudut terpotong, sorotan putih), dan tulisan "Giliran" (Pixelify Sans 2,5u) di bawah nama; baris ini setinggi 8,1u. Bingkai digambar di dalam baris, sehingga tidak ada yang bergeser saat giliran berpindah. ▶ berpindah ke tim berikutnya saat adegan berganti, di tengah sapuan (200 ms) atau pudar (75 ms).
     - Tanpa baris judul "Tim ★ skor" dari bagan Design System bagian 3, karena judul itu (sekitar 3,7u menurut hitungan) membuat 4 tim meluap sekitar 2,3u di 1024×768. Bagi pembaca layar, papan berupa daftar bernama "Papan tim", dan setiap butir dibaca seperti "Tim Mangga, giliran, 2 bintang".
     - Alternatif: (a) "Giliran" sebaris dengan nama, yang tidak muat di 1024×768; (b) baris tim aktif berlatar `sun`, yang lebih mencolok tetapi sama dengan tampilan fokus keyboard F-05; (c) baris judul dipertahankan dengan jarak yang dirapatkan.
  2. **Pengatur waktu di bawah papan tim, hanya di fase `discuss`.**
     - Baris label: ikon jam 16p (D-04) dan "Waktu diskusi". Saat dijeda tulisannya "Waktu dijeda", dan saat habis "Waktunya memilih" berlatar `mango` (teks `ink`, 6,9:1).
     - Baris batang: 12 blok 5p × 10p di lintasan `ink`, seperti batang indikator, lalu angka menit:detik (Press Start 2P 2,8u, sama dengan angka indikator). Blok berisi berwarna `sky-d` (3,8:1 terhadap lintasan), dan `mango` pada sepuluh detik terakhir (6,9:1). Blok kosong menyatu dengan lintasan, karena `mango` di atas `cream` hanya 1,9:1. Banyak blok berisi adalah sisa ÷ durasi × 12, dibulatkan ke atas; pada 60 detik, satu blok bernilai 5 detik.
     - Tiga tombol sebaris bergaya tombol lanjut F-05 (Pixelify Sans 2,5u): "Jeda" (tombol alih dengan `aria-pressed`; berlatar `sun` dengan cincin saat dijeda), "+30" (bagi pembaca layar "+30 detik"), dan "Lewati". Pintasannya `P`, `T`, dan `S`, hanya di fase `discuss`. Saat waktu habis, "Jeda" dan "Lewati" nonaktif karena reducer memang mengabaikannya, sedangkan "+30" menjalankan waktu lagi.
     - Saat habis, fase tetap `discuss`: tidak ada pilihan otomatis, dan tombol pilihan tetap bisa dipakai (F-02).
     - "+30" dan `T` tidak berlaku bila sisa lebih dari 9:29, agar angka tidak mencapai 10:00 (meluap 1,9u di 1024×768). Batas ini hanya di antarmuka; reducer tidak berubah.
     - Urutan Tab: pertanyaan, A, B, C, lalu "Jeda", "+30", dan "Lewati", sehingga urutan F-05 tidak berubah.
     - Alternatif: (a) tulisan tombol "+30 detik", yang membuat tombol terbungkus dua baris dan 4 tim meluap 5,3u di 1024×768; (b) pengatur waktu tetap tampil beku sesudah memilih, agar kelas melihat sisa waktu saat memilih; (c) pengatur waktu di bilah atas, yang berbeda dari Design System bagian 3 dan mengganggu ciri "Langit sehari".
  3. **`useTimer` di `ui/`, bukan `engine/`.**
     - `ui/useTimer.ts` hanya aktif bila fase `discuss`, pengatur waktu berjalan, sisa lebih dari 0, dan adegan tidak sedang berganti. Setiap 250 ms kait menghitung detik utuh sejak titik acuan dengan `performance.now()`, lalu mengirim `TICK` sebanyak itu. Dengan begitu waktu tetap tepat walaupun peramban terlambat menjalankan pengatur atau tab sempat di belakang. Sisa pecahan detik dibuang saat dijeda.
     - Pengatur dibersihkan saat fase berganti, saat dijeda, dan saat layar ditutup, dan tidak mengirim `TICK` dua kali walaupun `StrictMode` menjalankan efek dua kali.
     - Reducer tidak berubah dan tetap tanpa pengatur waktu, dan uji F-02 AC-14 tetap berlaku untuk seluruh `engine/`. Architecture bagian 3 dan 6 diperbarui: `useTimer.ts` pindah ke `ui/`. Hitungan murninya ada di `ui/timer.ts` dan diuji unit.
     - Alternatif: tetap `engine/useTimer.ts` sesuai Architecture bagian 3, dan uji F-02 AC-14 mengecualikan berkas itu.
  4. **Bintang alasan di panel kanan, hanya di fase `stars`.**
     - Kapan: sesudah "Lanjut" kartu dampak (di adegan 5 sesudah kuis, yang masih dilewati sampai F-08), sampai bintang diberikan.
     - Di mana: menggantikan blok pengatur waktu di bawah papan tim. Isinya ajakan "Bintang alasan untuk Tim Mangga" (Pixelify Sans 2,5u; nama mengikuti tim aktif; boleh dua baris) dan tombol "0", "1", "2" (Press Start 2P 2,8u; bagi pembaca layar "0 bintang", "1 bintang", "2 bintang"). Pintasan `0` `1` `2` hanya berlaku di fase `stars`.
     - Sesudah memilih: jumlah bintang tim aktif langsung bertambah, dan ikon bintang di barisnya memainkan pop 3 bingkai: kecil, besar berkilau, lalu normal, 80 ms per bingkai (total 240 ms, di dalam rentang 120–400 ms Design System bagian 8), berhenti di bingkai normal. Sapuan atau pudar ke adegan berikutnya langsung dimulai seperti F-06. Bingkai normal sudah tampil pada 160 ms, sebelum ▶ berpindah di tengah sapuan (200 ms). Bintang 0 tidak memainkan pop. Sesudah adegan 6, layar akhir sementara langsung tampil.
     - Kurangi gerak: tanpa pop. Ikon tetap di bingkai normal, jumlah langsung berubah, dan tidak ada animasi yang berjalan.
     - Pengaman tekanan ganda dan perpindahan fokus:
       - saat fase `stars` mulai, fokus pindah ke teks ajakan (bisa difokus lewat kode, bukan tombol), lalu Tab berurutan ke 0, 1, dan 2, seperti pertanyaan F-05 dan judul kartu F-06;
       - sebagai pintasan, `Spasi` dan `Enter` tidak berpengaruh di fase `stars`, sehingga `Enter` kedua dari tekanan ganda pada "Lanjut" kartu tidak memberi bintang. Pada tombol bintang yang berfokus, keduanya tetap menekan tombol itu seperti tombol lain (F-05);
       - tombol bintang berada di 8–60u, jauh dari "Lanjut" kartu di kanan bawah (sekitar 91–97u), sehingga klik ganda tidak mengenainya;
       - bintang hanya bisa diberikan sekali per adegan: tekanan selama pergantian adegan diabaikan (F-05), dan reducer menolak `BERI_BINTANG` kedua;
       - tanpa masa tunggu tambahan.
     - `bridgeActions`: "Lanjut" kartu kini hanya mengirim `LANJUT`, ditambah `JAWAB_KUIS` dengan jawaban naskah lalu `LANJUT` di adegan 5, sehingga permainan berhenti di fase `stars`. `BERI_BINTANG` dikirim tombol bintang. Tombol jembatan baris status tinggal pengaman untuk fase `quiz` sampai F-08.
     - Alternatif: (a) tombol bintang di kanan baris status panel bawah, sesudah "Kelas memilih X." (muat; lihat usulan 6); (b) masa tunggu 600 ms seperti kartu; (c) pop 100 ms per bingkai, dan sapuan menunggu 300 ms sampai pop selesai.
  5. **Pembaca layar: diumumkan per peristiwa, bukan per detik.**
     - Angka waktu memakai `role="timer"`, yang tidak diumumkan otomatis. Nilainya bisa dibaca kapan saja dalam kalimat, misalnya "sisa 42 detik".
     - Wilayah pengumuman kedua (`role="status"`) dipisah dari wilayah narasi dan kartu, sehingga pengumuman tidak saling menimpa. Isinya hanya berubah saat:
       - diskusi dimulai, dengan durasinya;
       - sisa 10 detik;
       - waktu habis ("Waktunya memilih");
       - waktu dijeda atau berjalan lagi, dengan sisa waktu;
       - waktu ditambah 30 detik, dengan sisa baru;
       - diskusi dilewati;
       - bintang diberikan, dengan nama tim, jumlah yang diberikan, dan jumlah barunya.
     - Uji lama memakai pemilih `[aria-live="polite"]`. Wilayah baru memakai `role="status"` tanpa atribut itu, sehingga pemilih lama tetap menunjuk wilayah narasi.
     - Alternatif: (a) hanya waktu habis yang diumumkan; (b) ditambah pengumuman setiap 30 detik.
  6. **Panel bawah tidak mendapat unsur baru.** Diukur ulang dengan Chromium 153, sisa layar pilihan terpanjang (adegan 3 dan 5) tetap 3,33u (1280×720), 3,38u (1366×768), 3,32u (1920×1080), dan 3,05u (1024×768). Di fase `stars`, panel bawah sama dengan fase reaksi: "Kelas memilih X." dan pilihan terkunci, tanpa tombol jembatan.
     - Bila alternatif 4a dipilih, tombol bintang masuk ke baris status yang tingginya tetap 5,8u. Tombolnya setinggi 5,75u (1280×720 dan 1920×1080) dan 5,68u (1366×768); di 1024×768 setinggi 6,02u, sama dengan tombol jembatan F-05 di baris itu. Sisa panel tetap tidak berubah.
  7. **Durasi diskusi bawaan (PRD bagian 16 nomor 3), diputuskan pemilik proyek.**

     | Pertimbangan | 30 detik | 60 detik (sekarang) | 90 detik |
     |---|---|---|---|
     | Diskusi enam adegan | 3 menit | 6 menit | 9 menit |
     | Perkiraan satu permainan (asumsi di bawah) | 16–17 menit | 19–20 menit | 22–23 menit |
     | Target PRD bagian 1 (15–20 menit) | terpenuhi | di batas atas | terlampaui |
     | Membaca pertanyaan dan tiga pilihan (29–46 kata, 12–23 detik) | 40–77% waktu diskusi | 20–38% | 13–26% |
     | Tujuan PRD bagian 3 nomor 3 ("alasan, bukan tebakan cepat") | mendorong tebakan cepat | cukup untuk menyusun satu alasan | paling longgar, tetapi tempo paling lambat |
     | Satu blok batang | 2,5 detik | 5 detik | 7,5 detik |
     | Sepuluh detik terakhir (`mango`) | sepertiga waktu | seperenam | sepersembilan |
     | Perubahan kode | `DEFAULT_SETTINGS` dan ujinya | tidak ada | `DEFAULT_SETTINGS` dan ujinya |

     - Asumsi perkiraan, kasar: semua teks yang tampil dibaca keras (361 kata sebelum memilih dan 368–395 kata kartu, 5–6 menit pada 120–150 kata per menit), bintang sekitar 20 detik per adegan, kuis sekitar 1 menit, serta pembuka dan penutup (F-10 dan F-09) sekitar 5 menit. Setiap kenaikan 30 detik menambah 3 menit ke satu permainan.
     - Pengatur waktu mulai begitu pertanyaan tampil (F-02), jadi waktu membaca pilihan ikut terpakai kecuali guru menjeda (`P`).
     - Apa pun pilihannya, guru tetap bisa menambah (`T`) atau melewati (`S`) di setiap adegan, dan F-10 menyediakan pilihan 30/60/90 per kelas. Yang diputuskan di sini hanya nilai bawaan.
     - Keputusan: tetap 60 detik, karena balasan `Setuju: F-07` tidak menyebut durasi lain. Masih bisa diubah di Gerbang 2 (spesifikasi, butir S-7).
  8. **Temuan 5 F-06 dibereskan di F-07: panggung disembunyikan selama kartu tampil.**
     - Pita terukur 6,9 px di 1024×768, 1,5 px di 1280×720, 2,2 px di 1920×1080, dan 0 di 1366×768.
     - Bila panggung disembunyikan selama fase `impact`, pita hilang di keempat ukuran, sedangkan letak, ukuran, dan sisa isi kartu F-06 tidak berubah (15,7–17,5u). Angka Design System dan uji F-06 tetap berlaku. Kartu sudah bersifat modal, sehingga panggung yang tersembunyi tidak mengubah apa yang dibacakan pembaca layar. F-07 sudah mengubah `PlayScreen.tsx` dan `game.css`, jadi perubahannya kecil.
     - Alternatif: (A) kartu mulai 8u, tepat di bawah bilah atas: pita hilang dan isi kartu bertambah 1,2u (16,9–18,7u), tetapi angka 9,2u di Design System bagian 7 dan uji F-06 berubah; (B) kartu mulai di tepi atas panggung (8u di 1024×768, 9u di 1280×720 dan 1920×1080, 10,56u di 1366×768): pita hilang, tetapi sisa isi di 1366×768 turun menjadi 15,9u; (C) dibiarkan, karena hanya kosmetik.
  9. **Alamat uji `#main-3` dan `#main-4`.** Sampai F-10, `#main` tetap memakai dua tim bawaan. Agar syarat "muat 2–4 tim di empat ukuran" bisa diuji ujung ke ujung dan dilihat sendiri, `#main-3` dan `#main-4` membuka layar permainan yang sama dengan tiga atau empat tim bawaan pertama. Keduanya tidak ditautkan dari layar kerangka, dan diganti layar judul di F-10, seperti `#main`.
     - Alternatif: 3 dan 4 tim hanya diukur dengan maket di tahap Plan dan Test, sehingga belum ada uji yang bisa diulang sampai F-10.
  10. **Cara uji.**
      - `content:check`.
      - `test`:
        - baru `timer.test.ts`: teks menit:detik, isi blok, nada, detik yang jatuh tempo, batas "+30", jadwal pop, dan peristiwa pengumuman;
        - `controls.test.ts` disesuaikan: `P` `T` `S`, `0` `1` `2`, `Spasi` dan `Enter` di fase `stars`, serta `bridgeActions` yang berhenti di fase `stars`, diuji bersama reducer dan naskah asli;
        - `layout.test.ts` bila usulan 9 disetujui, dan `reducer.test.ts` hanya bila durasi bawaan berubah.
      - `build:pages`: keempat berkas galeri identik byte dengan build sebelum F-07, juga sesudah semua dokumen F-07 ditulis; JS permainan ≤ 150 KB gzip tanpa penanda `__THREE__`; `src` dan `href` HTML permainan relatif.
      - `test:e2e`:
        - memakai Chromium 153 lewat berkas konfigurasi pengganti di luar repositori, seperti percobaan di atas, sehingga `playwright.config.ts`, `package.json`, dan lockfile tidak berubah. Alternatif: izin tertulis menaikkan `@playwright/test` ke versi yang cocok dengan Chromium 153, atau `playwright.config.ts` membaca jalur browser dari variabel lingkungan;
        - aturan jam uji: `pauseAt` di fase narasi sebelum diskusi dimulai, waktu diskusi hanya dimajukan dengan `runFor`, dan jam dimajukan dua langkah sesudah unsur tampil (catatan F-05 dan F-06);
        - uji baru: papan 2, 3, dan 4 tim di empat ukuran (tanpa luapan; nama, ikon, ▶, "Giliran", dan jumlah bintang); giliran di keenam adegan untuk 2, 3, dan 4 tim; pengatur waktu per detik, sepuluh detik terakhir, habis tanpa pilihan otomatis, `P` `T` `S` beserta tombolnya, batas 9:29, `TICK` hanya di fase `discuss`, dan waktu penuh lagi di adegan berikutnya; bintang lewat tombol dan `0` `1` `2`, sekali per adegan, jumlah per tim, pop pada 0, 80, dan 160 ms dengan jam uji, serta kurangi gerak tanpa animasi; tekanan ganda dan fokus; pengumuman; kontras; papan tertutup kartu; kartu tanpa pita panggung; 0 galat konsol dan 0 respons 4xx/5xx;
        - 24 uji lama ditambah langkah bintang;
        - bila satu perintah terlalu lama untuk lingkungan agen, uji dijalankan dalam beberapa bagian dengan konfigurasi yang sama, seperti F-06.
      - Tangkapan layar di 1280×720, 1024×768, dan 1920×1080: papan 2 dan 4 tim saat diskusi, sepuluh detik terakhir, waktu habis, dijeda, fase bintang, pop, dan kartu tanpa pita.
      - `tsc --noEmit` dan ESLint `--max-warnings 0` pada berkas kode baru dan yang diubah.
      - Daftar periksa manual AGENTS bagian 9 yang berlaku. Keterbacaan papan dan pengatur waktu dari bangku belakang, serta kelancaran di laptop kelas bawah, dicek pemilik proyek.
      - Tidak ada dependensi baru.
- Tambahan pemilik proyek (26 Okt 2026, dalam balasan `Setuju: F-07`): bunyi teks gaya B, bunyi klik tombol gaya A, bunyi teks setiap 2 huruf, dan tinggi nada teks "Tinggi", dipilih lewat halaman "Uji suara Sehari Setara".
  - Bunyi dikerjakan di F-07 sebagai bagian tersendiri spesifikasi, dengan volume 60% (Design System bagian 9). Bagian FR-19 lainnya tetap di F-13.
  - Hal baru yang muncul karenanya diajukan untuk Gerbang 2 sebagai butir S-1 sampai S-8 spesifikasi: format WAV, kapan klik berbunyi, kerapatan bunyi teks, `M` untuk mematikan suara, tik pelan sepuluh detik terakhir, asal dan lisensi bunyi, durasi 60 detik, serta status bunyi di `Daftar_Aset.md`.

## F-08 — Kuis peran penegak hukum
- Status: Direncanakan (26 Okt 2026). Menunggu balasan `Setuju: F-08`. Diperiksa sebelum Plan: entri F-07 berstatus Selesai dan `tests/F-07-hasil.md` berkeputusan Lulus.
- Memenuhi:
  - FR-11: kuis peran penegak hukum di adegan 5, dengan empat peran dan satu jawaban. Sisi mesin (fase `quiz`, `JAWAB_KUIS`, `quizAnswer`, dan `isQuizCorrect`) sudah ada sejak F-02, dan sisi naskah (pertanyaan, jawaban hakim, dan tugas keempat peran di `roles.ts`) sejak F-03. F-08 menampilkannya.
  - PRD bagian 5, TP 4 (membedakan peran polisi, jaksa, hakim, dan advokat), dan PRD bagian 8 adegan 5: kuis sesudah kartu dampak; sesudah dijawab, tampil kartu empat peran; kuis tidak memengaruhi indikator.
  - FR-16 sebagian: pintasan kuis (usulan 4), ditambahkan ke Architecture bagian 9.
  - Design System bagian 7 ("Kuis peran": empat kartu peran dengan ikon, yang terbuka dan menampilkan tugas sesudah dijawab) dan Architecture bagian 10 (kuis sebagai dialog dengan fokus terkunci di dalamnya).
  - Catatan "Plan F-06 sampai F-10" dan "Plan F-08": bagian kuis di `bridgeActions` diganti, dan tombol jembatan di baris status dihapus bersama kuis (usulan 7).
- Bergantung pada: F-06 (selesai; kartu dampak adegan 5 membuka kuis, dan kuis memakai pola dialog kartu) dan F-07 (selesai; fase `stars` datang sesudah kuis). Memakai mesin F-02, naskah F-03, manifest F-12, serta tata letak F-04 dan F-05.
- File yang dibuat/diubah:
  - Baru `app/sehari-setara/ui/RoleQuiz.tsx`: dialog kuis berisi pertanyaan, empat kartu peran, umpan balik, dan tombol "Lanjut". Nama berkas ini sudah tercantum di Architecture bagian 3.
  - Baru `app/sehari-setara/ui/quiz.ts`: fungsi murni untuk peran per tombol `1` sampai `4`, keadaan setiap kartu sesudah dijawab, kalimat umpan balik, dan kalimat pengumuman. Diuji di `__tests__/quiz.test.ts` (baru).
  - Baru `e2e/kuis-peran.spec.ts`.
  - Diubah `ui/PlayScreen.tsx`: dialog kuis di fase `quiz`, aksi `JAWAB_KUIS` dan `LANJUT` dari kuis, masa tunggu "Lanjut" kuis, pengumuman, serta panel bawah kosong dan panggung disembunyikan selama kuis. Jembatan dihapus (usulan 7).
  - Diubah `ui/controls.ts` dan `__tests__/controls.test.ts`: `keyCommand` mengenal `1` sampai `4` di fase `quiz`; `bridgeActions` dihapus.
  - Diubah `ui/ChoicePanel.tsx`: tombol "Lanjut" jembatan di baris status dihapus.
  - Diubah `content/copy.ts`: teks kuis (usulan 3 dan 5); `bridgeNext` dihapus.
  - Diubah `styles/game.css`: kelas dialog kuis dan kartu peran; aturan tombol jembatan dihapus. Warna hanya dari token yang sudah ada; tidak ada token `:root` baru.
  - Diubah `e2e/bantuan.ts` (langkah kuis bersama), `e2e/alur-permainan.spec.ts`, `e2e/kartu-dampak.spec.ts`, `e2e/tim-waktu-bintang.spec.ts`, dan `e2e/suara.spec.ts`: 31 uji lama melewati kuis di adegan 5, tiga pemeriksaan "kuis tidak tampil" dibalik, dan pemilih tombol jembatan dihapus (risiko "Uji lama").
  - Diubah `docs/sehari-setara/Architecture.md` (bagian 3, 7, 9, 10, dan 12) dan `Design_System.md` (bagian 3, 7, dan 8).
  - Dokumen: `specs/F-08-kuis-peran.md`, `tests/F-08-hasil.md`, tangkapan layar di `tests/F-08/`, dan entri ini.
  - Bila usulan 6b dipilih: juga `ui/StarsAward.tsx`.
  - Tidak disentuh: `engine/`, naskah (`scenes.ts`, `roles.ts`, `references.ts`), `Verifikasi_Rujukan.md`, `content.test.ts`, aset dan kit gambar, `manifest.ts`, `CREDITS.md`, `Daftar_Aset.md`, `ImpactCard.tsx`, `Teams.tsx`, `Timer.tsx`, `Meters.tsx`, `NarrationBox.tsx`, `Stage.tsx`, `Sprite.tsx`, `DayArc.tsx`, `StagePreview.tsx`, `Game.tsx`, `layout.ts`, file galeri, `vite.pages.config.ts`, `playwright.config.ts`, `package.json`, `pnpm-lock.yaml`, dan workflow.
- Aset yang dibutuhkan: tidak ada aset baru, dan placeholder tidak diperlukan. Semua yang dipakai sudah Disetujui (21 Okt 2026) dan terdaftar di manifest:
  - ikon peran D-08 (`roleIcons`): `role_polisi`, `role_jaksa`, `role_advokat`, dan `role_hakim`, masing-masing 32×32. F-08 adalah fitur pertama yang menampilkannya di layar permainan. Catatan warna toga dan simare ada di usulan 9;
  - ikon emosi D-09 (`emoteIcons`): `hati` untuk jawaban tepat dan `tanya` untuk jawaban yang belum tepat (usulan 3). `tanya` baru pertama kali dipakai layar permainan.

  Nomor kartu 1 sampai 4 dan tanda "?" berupa teks, seperti kursor ▶.
- Risiko (angka dari percobaan di luar repositori, 26 Okt 2026: salinan ZIP `main`, commit `7b6b7f8`; maket kuis disuntikkan ke `/ruang-setara/sehari-setara/#main` di kartu dampak adegan 5 pada jalur semua B, lalu diukur dengan huruf asli di Chromium 153 pada empat ukuran):
  - **Ruang.** Tiga letak dicoba dengan isi terpanjang (pertanyaan 88 huruf, tugas polisi, dan kalimat umpan balik usulan 3). Sisa ruang terkecil di bawah isi sesudah dijawab (angka negatif berarti meluap). Di letak A, angkanya sama dalam keadaan tertutup, karena tiga baris tugas selalu dicadangkan:

    | Letak | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
    |---|---|---|---|---|
    | A. Kotak kartu dampak, empat kartu sebaris, tugas 3,6u, umpan balik 3,1u (usulan 1) | 16,1u | 16,9u | 16,1u | 12,9u |
    | A dengan umpan balik 3,6u (setiap kalimat terbungkus dua baris) | 5,4u | 6,2u | 5,4u | 2,2u |
    | A dengan tugas dan umpan balik 3,1u | 18,0u | 18,8u | 18,0u | 14,8u |
    | B. Kolom tengah selebar panggung, kartu 2 × 2, huruf 3,1u | −12,2u | −15,7u | −12,2u | −17,9u |
    | C. Panel bawah 40u, empat kartu sebaris, huruf 3,1u | −1,0u | −0,4u | −1,1u | −3,8u |

    Di letak A, pertanyaan dua baris, tugas polisi tiga baris (tiga baris dicadangkan di setiap kartu), setiap kalimat umpan balik satu baris, dan tidak ada teks yang meluap ke samping. Bila di komputer lain pertanyaan dan kedua kalimat umpan balik masing-masing bertambah satu baris (+12,9u), isi masih muat di 1024×768.
  - **Klik ganda pada "Lanjut" kartu dampak.** Tombol itu berada 90,3–97,1u dari atas dan 156,7–172,9u dari kiri. Di letak A, kartu peran berada 28–66u dari atas, paling sedikit 24,7u di atasnya, dan tempat itu diisi "Lanjut" kuis yang masih nonaktif. Di letak C, kartu Hakim, jawaban yang benar, tepat berada di tempat itu, sehingga klik ganda bisa menjawab tanpa sengaja. Lihat usulan 1 dan 6.
  - **Jembatan menjawab sendiri.** Kode jembatan sekarang menjawab kuis dengan jawaban naskah saat `Spasi` atau `Enter` ditekan di fase `quiz`. Bila kode itu tertinggal, `Enter` kedua dari tekanan ganda pada "Lanjut" kartu akan menjawab "Hakim" untuk kelas. Karena itu jembatan dihapus bersamaan dengan munculnya kuis (usulan 7), dan uji memeriksa `Enter` ganda.
  - **Fokus.** `ChoicePanel` mengambil fokus saat dipasang. Di fase `quiz` panel bawah sekarang berisi baris status dan tombol jembatan, lalu memfokuskan tombol itu. Agar fokus tetap di dialog, panel bawah dikosongkan selama kuis, seperti selama kartu dampak (F-06), lalu dipasang lagi di fase `stars` tanpa mengambil fokus (F-07).
  - **Pita panggung.** Kuis memakai kotak kartu dampak, jadi pita panggung tipis di 1024×768 (Temuan 5 F-06) akan muncul lagi. Panggung disembunyikan selama kuis, seperti selama kartu (keputusan Gerbang 1 F-07 nomor 8).
  - **Uji lama.** Dalam salinan percobaan yang berhenti di fase `quiz` (bagian kuis dibuang dari `bridgeActions`), 31 dari 64 uji ujung ke ujung gagal menunggu ajakan bintang sesudah kartu adegan 5: 7 di `alur-permainan.spec.ts`, 13 di `kartu-dampak.spec.ts`, 9 di `tim-waktu-bintang.spec.ts`, dan 2 di `suara.spec.ts`. Ke-16 uji F-04 tidak memakai alur permainan, dan 17 uji lain berhenti sebelum adegan 5. Tiga dari ke-31 uji juga memeriksa bahwa kuis tidak tampil, sehingga pemeriksaan itu dibalik. Langkah kuis dibuat sebagai fungsi bersama di `e2e/bantuan.ts`, seperti langkah bintang F-07.
  - **Lingkungan uji.** Chromium 141 untuk `@playwright/test` 1.56.1 tetap tidak tersedia. Dengan berkas konfigurasi pengganti di luar repositori yang hanya menambah jalur Chromium 153 (keputusan Gerbang 1 F-07 nomor 10), ke-64 uji ujung ke ujung `main` lulus dalam dua bagian: 28 uji dalam 2,1 menit dan 36 uji dalam 1,5 menit. Uji dasar lain: `test` 9 berkas, 214 lulus, 1 dilewati; `content:check` 36 lulus, 1 dilewati.
  - **Jam uji.** Masa tunggu "Lanjut" kuis (usulan 6) dihitung sejak jawaban tampil. Aturan di "Catatan untuk Plan berikutnya" berlaku: `pauseAt` sebelum halaman dimuat, waktu hanya dimajukan dengan `runFor`, dan dua langkah sesudah unsur tampil.
  - **Keputusan pedagogis di luar PRD.** PRD tidak mengatur siapa yang menjawab, kalimat umpan balik, dan cara menandai jawaban (AGENTS bagian 12). Lihat usulan 2 dan 3. Semua teks baru bertanda "draf baru" (keputusan Gerbang 1 F-03 nomor 2).
  - **Rujukan R-14.** R-14 (UU No. 48 Tahun 2009, Pasal 11 ayat (1)) menopang kuis. Rujukan ini masuk naskah adegan 5 pada 22 Okt 2026 dan sudah tampil di kartu dampak adegan 5 sejak F-06. Kuis sendiri tidak menampilkan rujukan, karena PRD bagian 8 tidak memintanya. Kalimat umpan balik memakai kata "memeriksa, mengadili, dan memutus" dari pertanyaan naskah, sejalan dengan bunyi R-14. `Verifikasi_Rujukan.md` tidak diubah dan tidak ada kotak yang dicentang. Masalah lama di luar F-08 tetap ada: begitu satu kotak dicentang, uji konten AC-5 F-03 gagal dan terbitan tertahan (revisi F-03 22 Okt 2026, butir 2; laporan F-06, Temuan 8). Sebaiknya dibereskan sebelum R-14 atau rujukan lain dicentang.
  - **Rekap F-09.** Reducer F-02 mengosongkan `quizAnswer` saat adegan 6 dimulai, sehingga rekap tidak bisa menampilkan jawaban kelas tanpa perubahan mesin. Lihat usulan 8.
  - **Keterbacaan.** Tugas peran 3,6u (sama dengan narasi), nama peran Press Start 2P 2,8u, umpan balik 3,1u, dan label 2,5u (batas minimum Design System bagian 5). Keterbacaan di proyektor dicek pemilik proyek.
  - **Halaman yang terbit berubah.** Di alamat `#main`, adegan 5 kini menampilkan kuis sebelum bintang alasan. Permainan belum ditautkan dari galeri (F-11).
  - **Tailwind galeri** (catatan "Semua fitur"): sesudah entri ini ditulis, `build:pages` diulang, dan keempat berkas galeri (`index.html`, `main-Bp-7VtNx.css`, `main-CC47J1DW.js`, `jsx-runtime-CmKW-gyo.js`) tetap identik byte dengan build `main`. Pemeriksaan yang sama diulang di tahap Test.
  - **Anggaran:** JS permainan sekarang 18,52 KB gzip ditambah React 60,18 KB gzip, sekitar 79 KB dari 150 KB. F-08 diperkirakan menambah 1–2 KB gzip. Aset tidak bertambah.
- Ukuran: S menurut backlog; perkiraan sekarang M (batas bawah). Selain satu dialog dan fungsi murninya, F-08 menghapus jembatan dan menyesuaikan 31 uji ujung ke ujung lama.
- Temuan F-07 yang menunggu keputusan dan menyangkut F-08:
  - Temuan 1 (klik ganda pada "Lanjut" kartu memindahkan fokus dari ajakan bintang): dibawa ke usulan 6, karena "Lanjut" kuis juga membuka fase bintang.
  - Tidak dibawa: Temuan 8 (asal dan lisensi bunyi, butir S-6) tidak mengubah F-08, karena F-08 hanya memakai bunyi klik yang sudah ada; jawabannya tetap diperlukan sebelum rilis (catatan Plan F-11). Temuan 9 dan butir daftar periksa manual F-07 adalah pengecekan oleh pemilik proyek, bukan keputusan.
- Usulan untuk Gerbang 1. Balasan `Setuju: F-08` berarti saran di setiap usulan diterima, kecuali usulan 8 yang tidak memuat saran. Sebutkan nomornya bila memilih alternatif. Maket dikirim lewat percakapan dan tidak disimpan di repositori:
  1. **Kuis sebagai dialog lebar di kotak kartu dampak.**
     - Kapan: langsung sesudah "Lanjut" kartu dampak adegan 5, tanpa sapuan. Sesudah "Lanjut" kuis, fase bintang dimulai (F-07).
     - Di mana: kotak yang sama dengan kartu dampak (kiri di tepi kiri bingkai panggung, atas 9,2u, kanan 2u, bawah 1,2u), dengan bingkai piksel F-05. Bilah atas dan panel indikator tetap terlihat; panggung, papan tim, dan panel bawah tertutup. Selama kuis, panggung disembunyikan dan panel bawah kosong (risiko "Pita panggung" dan "Fokus"). Papan tim tertutup sesuai bacaan FR-09, "selalu terlihat, kecuali saat sebuah dialog terbuka" (keputusan Gerbang 1 F-06 nomor 1).
     - Susunan dan huruf:
       - kepala berlatar `mist`: "Kuis peran" (Press Start 2P 2,8u), dan sesudah dijawab, di kanan, "Kelas menjawab {peran}." (Pixelify Sans 2,8u);
       - pertanyaan naskah (Pixelify Sans 3,6u, sama dengan pertanyaan F-05), dua baris;
       - empat kartu peran sebaris, sama lebar (29,6–30,6u) dan sama tinggi (34,1–37,2u), dengan celah 1,5u. Setiap kartu berisi kotak nomor 1 sampai 4 seperti kotak A/B/C pilihan F-05 (Press Start 2P 2,8u, `cream` di atas `ink`), ikon peran D-08 berukuran 32p × 32p (64 px di 1280×720, 1366×768, dan 1024×768; 96 px di 1920×1080), nama peran (Press Start 2P 2,8u), lalu ruang tugas tiga baris (Pixelify Sans 3,6u);
       - sebelum dijawab, ruang tugas ditutup kotak `mist` bertanda "?" (`dusk`). Sesudah dijawab, keempat kartu terbuka serentak, dan ukurannya tidak berubah;
       - pita umpan balik di bawah kartu, sesudah dijawab (usulan 3);
       - kaki berisi "Lanjut" di kanan, di tempat yang sama dengan "Lanjut" kartu dampak.
     - Hasil ukur: tabel di risiko "Ruang".
     - Dialog: `role="dialog"` dan `aria-modal="true"`, bernama "Kuis peran". Fokus terkunci di dalamnya: Tab dan Shift+Tab beredar di kartu dan "Lanjut", dan klik di ruang kosong dialog tidak memindahkan fokus keluar (dialog bisa difokus lewat kode). Kuis muncul sendiri tanpa tombol pemicu, jadi aturan "fokus kembali ke tombol pemicu" di Architecture bagian 10 diperjelas seperti untuk kartu dampak: sesudah "Lanjut" kuis, fokus pindah ke ajakan bintang (usulan 6).
     - Alternatif yang tidak diusulkan karena meluap: (a) kolom tengah selebar panggung dengan kartu 2 × 2, agar papan tim tetap terlihat; (b) panel bawah 40u, agar panggung dan papan tetap terlihat, padahal kartu Hakim jatuh di tempat "Lanjut" kartu dampak. Alternatif yang muat: (c) tugas peran 3,1u, dengan sisa 14,8–18,8u, tetapi lebih kecil daripada narasi.
  2. **Kuis dijawab kelas bersama, tanpa pengatur waktu.**
     - Pertanyaan berasal dari `roleQuiz.question`, jawabannya dari `roleQuiz.answer` (hakim), dan nama serta tugas peran dari `roles.ts`. Semuanya teks naskah PRD bagian 8, tanpa perubahan. Urutan kartu tetap seperti naskah (Polisi, Jaksa, Advokat, Hakim) dan tidak diacak.
     - Kelas berdiskusi singkat, lalu guru mengklik atau menekan jawaban yang disepakati kelas. Tidak ada pengatur waktu, karena pengatur waktu mesin hanya berjalan di fase `discuss` (F-02).
     - Jawaban pertama dikunci (F-02). Kuis tidak mengubah indikator, bintang, giliran, maupun papan tim, dan `engine/` tidak berubah.
     - Alternatif: (a) tim aktif yang menjawab, dengan kepala "Kuis untuk {nama tim}" dan "{nama tim} menjawab {peran}.", tetap tanpa bintang otomatis, karena bintang hanya untuk alasan (PRD bagian 9); (b) kuis memakai pengatur waktu: mesin harus diubah, jadi tidak diusulkan.
  3. **Tanda jawaban dan umpan balik (semua teks baru berstatus draf baru).**
     - Sesudah dijawab, keempat kartu terbuka dan menampilkan tugasnya dari `roles.ts`. Jawaban ditandai dengan tulisan, tidak hanya warna:
       - kartu Hakim berlatar `leaf` dengan label "Jawaban tepat";
       - kartu pilihan kelas diberi cincin dalam `ink` 2p, seperti pilihan yang diambil (F-05). Bila jawabannya keliru, kartu itu juga berlatar `sun` dengan label "Pilihan kelas";
       - kartu lain tetap `cream`;
       - label memakai Pixelify Sans 2,5u, `cream` di atas `ink`.
     - Pita umpan balik di bawah kartu berisi ikon emosi D-09 16p dan dua kalimat (Pixelify Sans 3,1u, `ink`):

       | Jawaban | Latar dan ikon | Kalimat pertama | Kalimat kedua |
       |---|---|---|---|
       | Hakim | `leaf`, hati | Tepat! Hakimlah yang memeriksa, mengadili, dan memutus perkara. (draf baru) | Setiap peran punya tugas sendiri agar perkara diproses dengan adil. (draf baru) |
       | Polisi, Jaksa, atau Advokat | `mango`, tanda tanya | Belum tepat. Hakimlah yang memeriksa, mengadili, dan memutus perkara. (draf baru) | Sama dengan baris di atas |

     - Teks baru lain yang tampil: judul "Kuis peran", kepala kanan "Kelas menjawab {peran}." (meniru "Kelas memilih X." F-05), serta label "Jawaban tepat" dan "Pilihan kelas" (semuanya draf baru). Tombol tetap "Lanjut" (teks F-05).
     - Nada: tanpa kata "salah" atau "kalah" (Design System bagian 2 nomor 3). Kalimat kedua sama untuk semua jawaban, agar perhatian kelas pindah ke tugas keempat peran.
     - Kontras: `ink` di atas `leaf` 8,3:1, `mango` 6,9:1, `sun` 9,9:1, `mist` 9,5:1, dan `cream` 13,3:1; `cream` di atas `ink` 13,3:1; "?" `dusk` di atas `mist` 5,9:1.
     - Alternatif: (a) kalimat kedua diganti "Sebelum ada putusan hakim, siapa pun tidak boleh dianggap bersalah.", yang mengaitkan kuis dengan asas praduga tak bersalah (R-12), tetapi perlu ditinjau peninjau konten; (b) tanpa kalimat kedua; (c) baris "Rujukan: UU No. 48 Tahun 2009, Pasal 11 ayat (1)" (R-14) di bawah umpan balik, padahal R-14 sudah tampil di kartu dampak tepat sebelum kuis; (d) jawaban yang belum tepat memakai ikon keringat, seperti tingkat "Kurang tepat" di kartu dampak.
  4. **Pintasan `1` `2` `3` `4`.**
     - Di fase `quiz` sebelum dijawab: `1` Polisi, `2` Jaksa, `3` Advokat, dan `4` Hakim, sama dengan nomor di kartu dan meniru `1` `2` `3` untuk pilihan. Sesudah dijawab, angka tidak berpengaruh, dan `Spasi` atau `Enter` berarti "Lanjut" (sesudah masa tunggu, usulan 6). `M` tetap mematikan dan menyalakan suara. `0`, `5` sampai `9`, huruf, `P` `T` `S`, dan `Esc` tidak berpengaruh selama kuis.
     - Tidak bentrok: `1` `2` `3` hanya memilih di fase `discuss`, `0` `1` `2` hanya memberi bintang di fase `stars`, dan fase `stars` baru dimulai sesudah "Lanjut" kuis. Tekanan angka kedua tidak mengubah jawaban (F-02) dan tidak memberi bintang.
     - Architecture bagian 9 mendapat baris "`1` `2` `3` `4`: menjawab kuis peran (fase kuis)". Arti `Esc` selama dialog diputuskan di F-10 bersama layar pengaturan, dan dicatat untuk Plan F-10 saat Build.
     - Alternatif: (a) huruf awal `P` `J` `A` `H`. Mudah diingat, tetapi `P` sudah berarti jeda dan `A` berarti pilihan A, sehingga guru yang terbiasa menekan `P` bisa menjawab "Polisi" tanpa sengaja; (b) panah kiri dan kanan untuk berpindah kartu, lalu `Enter`; (c) tanpa pintasan, cukup Tab dan `Enter` atau klik.
  5. **Pembaca layar dan kurangi gerak.**
     - Pengumuman di wilayah `aria-live="polite"` yang sama dengan narasi dan kartu dampak (draf baru):
       - saat kuis tampil: "Kuis peran. {pertanyaan} Pilihannya: 1 Polisi, 2 Jaksa, 3 Advokat, 4 Hakim."
       - sesudah dijawab: "{Tepat! atau Belum tepat.} Kelas menjawab {peran}. Hakimlah yang memeriksa, mengadili, dan memutus perkara. Tugas setiap peran: Polisi: Menerima laporan dan menyidik. Jaksa: Menuntut. Advokat: Mendampingi. Hakim: Memutus. Setiap peran punya tugas sendiri agar perkara diproses dengan adil."
     - Judul "Kuis peran" berupa `<h2>`. Sebelum dijawab, kartu berupa tombol bernama nomor dan peran, misalnya "Peran 1: Polisi" (draf baru). Sesudah dijawab, kartu terkunci seperti pilihan yang sudah diambil (F-05), dan namanya memuat tugas serta labelnya, sehingga tetap terbaca dalam mode baca. Ikon, nomor yang terlihat, dan "?" disembunyikan dari pembaca layar.
     - Tepat atau keliru tidak hanya ditandai warna: ada kata pembuka "Tepat!" atau "Belum tepat.", ikon hati atau tanda tanya, label "Jawaban tepat" dan "Pilihan kelas", serta "Kelas menjawab {peran}.".
     - Kurangi gerak: kuis tidak punya animasi. Kartu terbuka serentak tanpa gerak, sehingga tampilannya sama dengan atau tanpa kurangi gerak. Masa tunggu "Lanjut" tetap 600 ms, seperti kartu dampak, dan bunyi klik tetap ada.
     - Alternatif: kartu terbuka dengan animasi balik dua bingkai selama 160 ms (`steps(2)`) yang dimatikan saat kurangi gerak. Uji perlu mengatur waktunya lewat Web Animations API (catatan "Semua fitur dengan animasi CSS").
  6. **Pengaman klik ganda dan perpindahan fokus.**
     - Masuk ke kuis:
       - fokus pindah ke judul "Kuis peran" (bisa difokus lewat kode), sehingga `Spasi` tidak menekan kartu tanpa sengaja. Tab berikutnya berpindah ke kartu 1;
       - "Lanjut" kuis tampil nonaktif (`mist`, teks `dusk`, `aria-disabled="true"`) sampai kelas menjawab;
       - klik kedua dari klik ganda pada "Lanjut" kartu dampak jatuh di "Lanjut" kuis yang masih nonaktif, sehingga tidak berpengaruh dan fokus tetap di dialog. Kartu peran berada jauh di atasnya (risiko "Klik ganda");
       - `Spasi` atau `Enter` kedua sebelum dijawab tidak berpengaruh;
       - tanpa masa tunggu di awal kuis.
     - Menjawab: klik kartu, `Enter` atau `Spasi` pada kartu yang berfokus, atau `1` sampai `4`. Hanya jawaban pertama yang diterima, berbunyi klik, dan diumumkan; tekanan berikutnya tidak berbunyi. Sesudah dijawab, fokus pindah ke "Lanjut" kuis, dan Tab tetap di tombol itu, seperti di kartu dampak.
     - Keluar dari kuis: "Lanjut" kuis baru bekerja 600 ms sesudah jawaban, baik lewat klik, `Enter` atau `Spasi` pada tombol, maupun `Spasi` atau `Enter` sebagai pintasan, sama dengan kartu dampak (F-06). Selama masa tunggu, tombol tampil biasa dengan `aria-disabled="true"`. Sesudah itu fase `stars` dimulai: fokus pindah ke ajakan bintang, `Spasi` dan `Enter` tidak memberi bintang, dan panel bawah sama dengan fase bintang adegan lain (F-07).
     - Bunyi: klik F-07 untuk jawaban dan "Lanjut" kuis yang diterima. Tidak ada bunyi baru; bunyi tepat dan keliru milik F-13.
     - Temuan 1 F-07, yang menunggu keputusan: klik ganda pada "Lanjut" kuis membuat klik kedua jatuh di panel bawah fase bintang, sehingga fokus pindah dari ajakan ke halaman, sama dengan "Lanjut" kartu di adegan lain. Pilihan:
       - (a, saran) dibiarkan, seperti usul laporan F-07. Bintang tetap bisa diberikan lewat tombol atau `0` `1` `2`, dan temuan ini tetap dicatat untuk F-13;
       - (b) dibereskan di F-08 untuk semua adegan: di fase bintang, klik di tempat yang bukan tombol mengembalikan fokus ke ajakan bintang. Perilaku F-07 sedikit berubah, dan satu uji ditambahkan.
     - Alternatif untuk fokus sesudah menjawab: (a) tetap di kartu yang diklik, sehingga `Enter` berikutnya tertelan kartu yang sudah terkunci dan tidak berarti "Lanjut"; (b) ke kalimat umpan balik, sehingga pembaca layar membaca umpan balik dua kali.
  7. **Jembatan sementara dihapus seluruhnya.**
     - Yang tersisa dari jembatan sesudah F-07:
       - `bridgeActions(scene)` di `ui/controls.ts`: `LANJUT`, lalu di adegan 5 jawaban naskah dan `LANJUT`, yang dikirim "Lanjut" kartu dampak;
       - `BRIDGE_PHASES` dan `bridge()` di `PlayScreen.tsx`, termasuk `Spasi` dan `Enter` di fase `quiz` yang menjawab dari naskah;
       - tombol "Lanjut" jembatan di baris status `ChoicePanel` (properti `bridgeReady` dan `onBridge`), teks `copy.play.bridgeNext`, aturan CSS `.ss-question-row .ss-next`, dan fase `quiz` di `CHOICE_PHASES`;
       - dua uji jembatan di `controls.test.ts`, serta pemilih tombol jembatan dan pemeriksaan "kuis tidak tampil" di tiga berkas uji ujung ke ujung;
       - uraian "Jembatan sementara" di Architecture bagian 7 dan komentar kode.
     - Sesudah F-08 tidak ada lagi fase yang dilewati: "Lanjut" kartu dampak cukup mengirim `LANJUT` (di adegan 5 ke fase `quiz`, di adegan lain ke fase `stars`). Semua bagian di atas dihapus atau disesuaikan, dan Architecture bagian 7 menggantinya dengan uraian kuis.
     - Yang tetap ada karena milik fitur lain: pintu masuk `#main`, `#main-3`, dan `#main-4` serta `startActions`, yang melewati judul, pengaturan, dan prolog (F-10); layar akhir sementara dan `restartActions` (F-09).
     - Alternatif: `bridgeActions` dipertahankan dengan isi `LANJUT` saja, dan tombol jembatan tetap sebagai pengaman yang tidak pernah tampil. Perubahannya lebih sedikit, tetapi kode yang tidak dipakai tertinggal.
  8. **Hasil kuis di rekap F-09 (perlu keputusan pemilik proyek; agen tidak memberi saran).**
     - Fakta: FR-13 menyebut enam pilihan kelas, pilihan yang paling menjaga keseimbangan, dan rujukannya, dan Design System bagian 7 menyebut rekap enam baris. Keduanya tidak menyebut kuis. Reducer F-02 mengosongkan `quizAnswer` saat adegan 6 dimulai.
     - Pilihan:
       - (a) tidak tampil di rekap. Mesin tidak berubah;
       - (b) satu baris tetap tanpa jawaban kelas, misalnya "Kuis peran: hakimlah yang memeriksa, mengadili, dan memutus perkara." Mesin tidak berubah, tetapi rekap menjadi tujuh baris;
       - (c) satu baris dengan jawaban kelas, misalnya "Kuis peran: kelas menjawab Advokat; jawaban tepat Hakim." Mesin harus menyimpan jawaban sesudah adegan 5, sebaiknya di entri `history` adegan 5 agar "ulangi adegan" F-13 ikut menghapusnya. Perubahan mesin itu dikerjakan di F-09, dan rekap juga menjadi tujuh baris.
     - F-08 sama untuk ketiga pilihan. Bila balasan `Setuju: F-08` tidak menyebut pilihan, butir ini tetap terbuka dan dicatat di "Catatan untuk Plan berikutnya" untuk Plan F-09.
  9. **Tugas pemilik proyek, bukan penghalang: warna toga dan simare ikon peran D-08.**
     - `Daftar_Aset.md` mencatat bahwa warna simare (merah untuk hakim, hitam untuk jaksa dan advokat) diambil dari hukumonline.com dan perlu dicek peninjau konten. F-08 adalah fitur pertama yang menampilkan ikon itu di layar permainan.
     - Ikon sudah Disetujui (21 Okt 2026), jadi F-08 memakainya apa adanya. Bila pengecekan menemukan warna yang perlu diubah, perbaikannya cukup di `scripts/game/art/ikon.py` dan PNG D-08 (peran Pembuat aset, dengan persetujuan pratinjau), tanpa mengubah kode F-08.
     - Status D-08 di `Daftar_Aset.md` tidak diubah.
  10. **Cara uji.**
      - `content:check`; naskah tidak berubah.
      - `test`:
        - baru `quiz.test.ts`: peran untuk `1` sampai `4`, keadaan kartu untuk keempat jawaban, kalimat umpan balik dan pengumuman, serta jawaban, nama, dan tugas yang selalu diambil dari naskah dan `roles.ts`;
        - `controls.test.ts` disesuaikan: `1` sampai `4` hanya di fase `quiz`, angka lain tidak, `Spasi` dan `Enter` di fase `quiz`, dan uji jembatan dihapus. Dari kartu dampak adegan 5 sampai fase `stars` lewat `JAWAB_KUIS` dan `LANJUT`, diuji dengan reducer dan naskah asli untuk keempat jawaban, tanpa mengubah indikator, bendera, dan bintang;
        - uji lain tidak berubah.
      - `build:pages`: keempat berkas galeri identik byte dengan build sebelum F-08, juga sesudah semua dokumen F-08 ditulis; JS permainan ≤ 150 KB gzip tanpa penanda `__THREE__`; `src` dan `href` HTML permainan relatif.
      - `test:e2e`:
        - memakai Chromium 153 lewat berkas konfigurasi pengganti di luar repositori, seperti F-07, sehingga `playwright.config.ts`, `package.json`, dan lockfile tidak berubah;
        - aturan jam uji di "Catatan untuk Plan berikutnya": `pauseAt` sebelum halaman dimuat, waktu hanya dimajukan dengan `runFor`, dan dua langkah sesudah unsur tampil (kuis tampil, lalu masa tunggu 600 ms dihitung sejak jawaban tampil);
        - uji baru `kuis-peran.spec.ts`: kuis hanya di adegan 5 dan hanya sesudah "Lanjut" kartu; letak, ukuran huruf, dan tanpa luapan di empat ukuran dalam keadaan tertutup, tepat, dan belum tepat; keempat jawaban lewat klik, `Enter` pada kartu, dan `1` sampai `4`; kartu terbuka dengan tugas dari `roles.ts`, label, umpan balik, dan kontras; indikator, bintang, dan papan tim tidak berubah; dialog, fokus terkunci, urutan Tab, serta fokus sesudah menjawab dan sesudah "Lanjut"; klik ganda dan `Enter` ganda pada "Lanjut" kartu tidak menjawab; jawaban kedua dan tombol lain diabaikan; masa tunggu pada 599 dan 600 ms; pengumuman; kurangi gerak tanpa animasi; bunyi klik hanya untuk tekanan yang diterima; `#main-3` dan `#main-4`; kuis baru sesudah "Main lagi"; 0 galat konsol dan 0 respons 4xx/5xx;
        - 31 uji lama ditambah langkah kuis lewat `e2e/bantuan.ts`, tiga pemeriksaan "kuis tidak tampil" dibalik, dan pemilih tombol jembatan dihapus;
        - bila satu perintah terlalu lama untuk lingkungan agen, uji dijalankan dalam beberapa bagian dengan konfigurasi yang sama.
      - Tangkapan layar di 1280×720, 1024×768, dan 1920×1080: kuis tertutup, jawaban tepat, jawaban belum tepat, dan fase bintang sesudah kuis.
      - `tsc --noEmit` dan ESLint `--max-warnings 0` pada berkas kode baru dan yang diubah.
      - Daftar periksa manual AGENTS bagian 9 yang berlaku. Keterbacaan kartu peran dari bangku belakang dicek pemilik proyek.
      - Tidak ada dependensi baru.
