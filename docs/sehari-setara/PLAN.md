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
- Semua fitur: uji ujung ke ujung yang memakai `page.clock` harus menjeda jam dengan `pauseAt` sebelum mengatur waktu, karena jam palsu Playwright tetap berjalan sampai dijeda (F-05, Temuan 1).

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
