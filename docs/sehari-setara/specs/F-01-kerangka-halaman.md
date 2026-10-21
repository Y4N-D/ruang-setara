# F-01 — Kerangka halaman game dan build dua halaman

| | |
|---|---|
| Status | Disetujui 21 Oktober 2026 (`Spesifikasi disetujui: F-01`) |
| Tanggal | 21 Oktober 2026 |
| Rencana | `docs/sehari-setara/PLAN.md`, entri F-01 (disetujui 21 Oktober 2026) |

## Ringkasan

F-01 menambahkan halaman kedua `sehari-setara/` ke build GitHub Pages yang sama dengan galeri. Untuk sementara halaman ini berisi layar kerangka: nama permainan, satu kalimat pengantar, keterangan bahwa permainan sedang dibuat, dan tombol "Kembali ke galeri". Kerangka ini menyiapkan titik masuk, token warna, satuan ukuran `--u`, dan bingkai 16:9 yang dipakai fitur berikutnya, ditambah server uji yang meniru alamat GitHub Pages. Layar kerangka akan digantikan layar judul di F-10.

Sesuai keputusan Gerbang 1, F-01 tidak menambah dependensi. Huruf memakai cadangan `monospace`, dan uji memakai pemeriksaan pengganti (lihat Rencana uji).

## Kaitan PRD

| Acuan | Yang dipenuhi F-01 |
|---|---|
| Architecture A1 dan bagian 4 | Halaman terpisah `sehari-setara/` sebagai input build kedua |
| PRD FR-15 (sebagian) | Tombol "Kembali ke galeri" dengan `href="../"`. Tombol "Main lagi" ada di F-09, tautan dari galeri di F-11 |
| PRD bagian 10 | Hosting statis tanpa layanan luar; rasio 16:9 dengan bingkai untuk 4:3; kontras teks ≥ 4,5:1; tanpa data siswa |
| Design System bagian 3, 4, 5, 7 | Bingkai `ink` untuk layar 4:3, token warna, satuan `--u` dan skala huruf, bingkai piksel tombol, fokus `sun` dengan kursor ▶ |
| Architecture bagian 9, 10, 11, 12, 14 | Fokus terlihat, `lang="id"`, tautan relatif, server uji subfolder, teks dari `content/` |
| AGENTS bagian 7 | Path relatif, tanpa jaringan luar, tanpa data siswa, galeri tidak disentuh, dependensi tidak berubah |

## Perilaku

- Diberikan perintah `build:pages`, ketika build selesai, maka `dist-pages/` berisi `index.html` (galeri) dan `sehari-setara/index.html` (permainan) yang berbagi folder `assets/`.
- Diberikan situs disajikan di bawah `/ruang-setara/`, ketika `/ruang-setara/sehari-setara/` dibuka, maka layar kerangka tampil dan semua berkasnya termuat tanpa respons 4xx dan tanpa galat konsol.
- Diberikan alamat tanpa garis miring di akhir (`/ruang-setara/sehari-setara`), ketika dibuka di server uji, maka server mengalihkan ke `/ruang-setara/sehari-setara/` dengan kode 301, seperti GitHub Pages.
- Diberikan layar kerangka baru dimuat, ketika guru menekan Tab sekali, maka tombol "Kembali ke galeri" mendapat fokus: latarnya menjadi `sun` dan kursor ▶ tampil.
- Diberikan tombol sedang berfokus, ketika guru menekan Enter atau mengklik tombol, maka browser membuka `../`, yaitu `/ruang-setara/`, dan galeri termuat seperti sebelum F-01.
- Diberikan perangkat dengan tetikus, ketika penunjuk berada di atas tombol, maka tombol tampil seperti saat fokus (status "arah" di Design System bagian 7). Perangkat sentuh tidak memakai status ini.
- Diberikan ruang tampilan 16:9, ketika halaman dibuka, maka layar permainan memenuhi ruang tampilan tanpa bilah gulir.
- Diberikan ruang tampilan 4:3 (1024×768), ketika halaman dibuka, maka layar permainan berukuran 1024×576 di tengah, dan sisa ruang di atas serta di bawahnya berwarna `ink`.
- Diberikan pengembang menjalankan `dev:pages`, ketika membuka `/sehari-setara/` di server pengembangan, maka layar kerangka tampil.
- Diberikan build sesudah F-01, ketika galeri dibuka, maka galeri berperilaku sama seperti sebelumnya dan tidak memuat CSS permainan.

## Status antarmuka

Tata letak di 1280×720 (1u = 7,2 px):

```
┌──────────────── layar 16:9, latar cream ────────────────┐
│                                                          │
│                      Sehari Setara                       │  4,4u  ink
│                                                          │
│           Temani Nara menjalani satu hari dan            │  3,6u  ink
│            pilih tindakannya bersama kelas.              │
│               Permainan ini sedang dibuat.               │  3,1u  dusk
│                                                          │
│                ┌─────────────────────────┐               │
│                │    Kembali ke galeri    │               │  3,1u  ink
│                └─────────────────────────┘               │
│                                                          │
└──────────────────────────────────────────────────────────┘
Fokus atau arah:  │ ▶  Kembali ke galeri    │  latar sun
```

- **Layar:** kotak 16:9 berukuran 177,78u × 100u, dengan `--u: min(1vh, 0.5625vw)` (Design System bagian 5), di tengah ruang tampilan; sisa ruang berwarna `ink`. Tidak ada bilah gulir.
- **Isi:** berada di elemen `<main>` dengan judul `<h1>`, rata tengah, dan di tengah layar secara vertikal. Lebar baris teks paling banyak 60 karakter, dan baris yang terbungkus diseimbangkan (`text-wrap: balance`).
- **Ukuran dan jarak:** judul 4,4u dengan tinggi baris 1,2; pengantar 3,6u dengan tinggi baris 1,35; keterangan dan tombol 3,1u dengan tinggi baris 1,3. Jarak judul ke pengantar 3u, pengantar ke keterangan 1,5u, keterangan ke tombol 5u.
- **Huruf:** judul memakai `"Press Start 2P", monospace`, teks lain `"Pixelify Sans", monospace`. Karena paket huruf belum dipasang, yang tampil adalah huruf `monospace` bawaan browser. Semua berbobot 400.
- **Tombol "Kembali ke galeri"** (tautan `<a>` bergaya tombol, kelas `ss-button`):
  - *Biasa:* latar `cream`, teks `ink`, tanpa garis bawah. Bingkai piksel Design System bagian 7: garis `ink` 2 px dengan sudut terpotong 1 px dan sorotan `white` 1 px di sisi atas-dalam. Padding 1,5u × 3u. Ruang untuk kursor ▶ sudah disediakan di kiri teks (dan ruang kosong yang sama di kanan) tetapi tidak terlihat, sehingga lebar tombol tidak berubah saat fokus dan teks tetap di tengah.
  - *Fokus* (keyboard, `:focus-visible`) dan *arah* (tetikus di atasnya, hanya pada perangkat yang mendukung hover): latar `sun`, kursor ▶ tampil di kiri teks. Kursor bersifat hiasan dan tidak dibacakan pembaca layar. Kontras `ink` di atas `sun` 9,9:1.
  - *Nonaktif:* tidak berlaku; tautan selalu aktif.
- **Kosong:** tidak berlaku. Layar kerangka itu sendiri adalah keadaan sementara sebelum fitur permainan ada.
- **Galat:** F-01 tidak punya tampilan galat. Berkas yang gagal dimuat dideteksi di tahap Test lewat respons 4xx dan galat konsol.
- **Mode warna paksa** (tema kontras Windows): fokus tetap terlihat lewat garis luar warna sistem, dan sudut terpotong dinonaktifkan agar garis itu tidak ikut terpotong.
- **Kurangi gerak:** F-01 tidak memakai animasi maupun transisi, jadi tampilan sama dengan atau tanpa `prefers-reduced-motion`.

## Teks yang tampil (final)

| Tempat | Teks |
|---|---|
| Judul tab (`<title>`) | Sehari Setara — Ruang Setara |
| Deskripsi halaman (`<meta name="description">`) | Petualangan bercabang tentang hak dan kewajiban dalam satu hari, untuk Pendidikan Pancasila kelas IX. |
| Judul layar (`<h1>`) | Sehari Setara |
| Kalimat pengantar | Temani Nara menjalani satu hari dan pilih tindakannya bersama kelas. |
| Keterangan | Permainan ini sedang dibuat. |
| Tombol | Kembali ke galeri |

Teks di layar berasal dari `app/sehari-setara/content/copy.ts`. Judul tab dan deskripsi ditulis langsung di `index.html` karena harus sudah ada sebelum JavaScript berjalan.

Pesan `scripts/game/serve-subpath.mjs` (untuk pengembang, tampil di terminal atau sebagai isi respons):

| Keadaan | Pesan |
|---|---|
| Server berjalan | `Menyajikan dist-pages/ di http://127.0.0.1:<port>/ruang-setara/ (Ctrl+C untuk berhenti)` |
| Baris kedua saat berjalan | `Permainan: http://127.0.0.1:<port>/ruang-setara/sehari-setara/` |
| `dist-pages/` belum ada | `dist-pages/ belum ada. Jalankan dulu: npx pnpm@11.25.0 build:pages` |
| Port sudah dipakai | `Port <port> sudah dipakai. Jalankan dengan --port <nomor lain>.` |
| Nomor port tidak sah | `Nomor port tidak sah: <nilai>` |
| Respons 404 | `404 Tidak ditemukan` |
| Respons 405 | `405 Metode tidak diizinkan` |
| Respons 416 | `416 Rentang tidak sah` |

## Data dan aksi

- Belum ada tipe `GameState` maupun aksi reducer; keduanya mulai di F-02.
- `app/sehari-setara/content/copy.ts` mengekspor objek `copy` (`as const`) berisi `gameName`, `backToGallery`, `placeholder.lead`, dan `placeholder.status`.
- `app/sehari-setara/Game.tsx` memakai konstanta `GALLERY_HREF = "../"` (Architecture bagian 11).
- `app/sehari-setara/styles/game.css` berisi blok `:root` yang disalin persis dari Design System bagian 4, ditambah `--u` dari bagian 5. Semua kelas berawalan `ss-`.
- `github-pages/sehari-setara/main.tsx` hanya mengimpor `game.css` dan `Game`, tidak mengimpor CSS galeri.
- `vite.pages.config.ts` memakai `build.rolldownOptions.input` dengan dua entri: `main` untuk `github-pages/index.html` dan `game` untuk `github-pages/sehari-setara/index.html`. Pengaturan lain tidak berubah.
- `package.json` mendapat satu skrip, ditaruh sebelum `build:pages`: `"dev:pages": "vite --config vite.pages.config.ts"`.
- `scripts/game/serve-subpath.mjs`, hanya memakai modul bawaan Node:
  - Perintah `node scripts/game/serve-subpath.mjs [--port <nomor>]`. Port bawaan 4180, hanya di 127.0.0.1.
  - Menyajikan `dist-pages/` di bawah `/ruang-setara/`. Alamat `/` dialihkan (302) ke `/ruang-setara/`; alamat lain di luar `/ruang-setara/` mendapat 404, sehingga rujukan berpath absolut ketahuan saat uji.
  - Folder tanpa garis miring di akhir dialihkan (301) ke alamat bergaris miring; folder menyajikan `index.html` di dalamnya.
  - Hanya GET dan HEAD; metode lain mendapat 405. Berkas yang tidak ada dan path yang keluar dari `dist-pages/` mendapat 404.
  - Mendukung satu rentang `Range: bytes=…` (206; rentang di luar ukuran berkas mendapat 416) untuk video galeri.
  - Tipe MIME untuk html, js, mjs, css, json, map, svg, png, jpg, jpeg, webp, gif, ico, mp4, webm, mp3, glb, gltf, wasm, woff, woff2, ttf, dan txt; selain itu `application/octet-stream`. Setiap respons membawa `Cache-Control: no-store`.

## Aset

Tidak ada aset permainan baru, dan tidak ada aset gambar yang dipakai. Ikon tab memakai `public/favicon.svg` milik situs lewat `../favicon.svg`. Berkas itu bukan aset permainan, jadi tidak didaftarkan di `manifest.ts`.

## Di luar cakupan

- Paket huruf `@fontsource` (keputusan Gerbang 1), `vitest`, `@playwright/test`, serta skrip `test`, `content:check`, dan `test:e2e`.
- Mesin permainan, skema konten, dan naskah adegan (F-02, F-03).
- Panggung, sprite, busur hari, warna langit, dan garis pindai (F-04); `manifest.ts` dan aset gambar (F-12).
- Layar judul (F-10), tombol "Main lagi" (F-09), tautan dari galeri (F-11), pintasan keyboard permainan (F-05 dan seterusnya), suara dan layar penuh (F-13).
- Perubahan `.github/workflows/deploy-pages.yml`. Langkah "Uji game" ditambahkan bersama skrip `test`.
- Menyajikan halaman permainan lewat `pnpm dev` (Vinext).
- Tata letak khusus ponsel tegak, dan pesan bila JavaScript nonaktif.
- Perbesaran lewat zoom browser. Ukuran huruf mengikuti `--u` dari Design System, sehingga tidak ikut membesar saat zoom.
- Catatan: ukuran bingkai piksel dibaca sebagai px CSS, sesuai teks Design System bagian 7. Bila yang dimaksud adalah piksel logis panggung, penyesuaiannya dilakukan saat panel pertama dibangun (F-05).

## Kriteria penerimaan

- [ ] AC-1 `npx pnpm@11.25.0 build:pages` berakhir dengan kode 0 dan menghasilkan `dist-pages/index.html` serta `dist-pages/sehari-setara/index.html`.
- [ ] AC-2 Semua atribut `src` dan `href` di `dist-pages/sehari-setara/index.html` relatif (tidak diawali `/`, `http:`, atau `https:`), dan setiap berkas yang dirujuk ada di `dist-pages/`.
- [ ] AC-3 Di server uji, `/ruang-setara/sehari-setara/` yang dibuka di Chromium pada 1280×720, 1366×768, 1920×1080, dan 1024×768 menghasilkan nol respons 4xx/5xx dan nol galat konsol (`console.error` maupun galat halaman).
- [ ] AC-4 Halaman memakai `<html lang="id">`, dan judul tab, deskripsi, serta empat teks layar persis sama dengan tabel "Teks yang tampil".
- [ ] AC-5 Tombol "Kembali ke galeri" adalah `<a href="../">`. Mengkliknya membuka `/ruang-setara/`; galeri termuat dengan nol respons 4xx/5xx, nol galat konsol, dan tanpa lembar gaya yang memuat `--ss-ink`.
- [ ] AC-6 Dari halaman yang baru dimuat, satu kali Tab memfokuskan tombol; latarnya `rgb(255, 210, 63)` dan kursor ▶ terlihat; lebar tombol sama saat biasa dan saat fokus; Enter membuka galeri.
- [ ] AC-7 Pada 1280×720, 1366×768, dan 1920×1080, layar berlatar `cream` setinggi ruang tampilan dan selebar ruang tampilan dengan selisih ≤ 1 px. Pada 1024×768, layar berukuran 1024×576 (±1 px) dengan sisa `ink` 96 px di atas dan di bawah. Tidak ada bilah gulir pada keempat ukuran.
- [ ] AC-8 Pada 1280×720, ukuran huruf terhitung: judul 31,68 px, pengantar 25,92 px, keterangan 22,32 px, tombol 22,32 px (toleransi ±0,5 px). Warna judul, pengantar, dan tombol `ink`; keterangan `dusk`; setiap pasangan teks dan latar berkontras ≥ 4,5:1.
- [ ] AC-9 Blok `:root` di `game.css` memuat setiap token Design System bagian 4 dengan nilai yang sama persis, dan setiap token warna dasar sama dengan nilainya di `scripts/game/art/palette.json`.
- [ ] AC-10 Total JS yang dimuat halaman permainan ≤ 150 KB gzip, dan tidak satu pun berkas JS-nya memuat penanda three.js `__THREE__`.
- [ ] AC-11 Server uji: `/ruang-setara/sehari-setara` dialihkan 301 ke `/ruang-setara/sehari-setara/`; `/assets/…` di luar `/ruang-setara/` mendapat 404; berkas yang tidak ada mendapat 404; path traversal tidak bisa membaca berkas di luar `dist-pages/`; permintaan Range untuk video mendapat 206.
- [ ] AC-12 `npx pnpm@11.25.0 dev:pages` menyajikan `/sehari-setara/` dengan HTTP 200, dan layar kerangka tampil di browser.
- [ ] AC-13 `tsc --noEmit` untuk seluruh proyek tetap tanpa galat; ESLint pada file baru dan file yang diubah tanpa galat dan tanpa peringatan; kode baru tidak memakai `any`.
- [ ] AC-14 Halaman permainan tidak menjalankan animasi maupun transisi CSS (`document.getAnimations()` kosong, baik saat biasa maupun saat tombol berfokus).
- [ ] AC-15 Selain dokumen, hanya file di daftar `PLAN.md` yang berubah. File galeri, workflow, dan `pnpm-lock.yaml` tidak berubah, dan `npx pnpm@11.25.0 install --frozen-lockfile` tetap berhasil.

## Rencana uji

Sesuai keputusan Gerbang 1, untuk F-01 saja langkah `content:check`, `test`, dan `test:e2e` (AGENTS bagian 4.4) diganti pemeriksaan berikut, karena alat ujinya baru masuk di fitur berikutnya.

| Langkah | Cara | Kriteria |
|---|---|---|
| 1 | `npx pnpm@11.25.0 build:pages`, lalu daftar berkas HTML di `dist-pages/` | AC-1 |
| 2 | Skrip pemeriksa statis: atribut `src`/`href` di HTML permainan, keberadaan berkas yang dirujuk, ukuran gzip JS permainan, penanda `__THREE__`, token `game.css` dibandingkan dengan Design System dan `palette.json` | AC-2, AC-9, AC-10 |
| 3 | Menjalankan `serve-subpath.mjs`, lalu menguji pengalihan, 404, traversal, dan Range dengan `curl` | AC-11 |
| 4 | Chromium headless (Playwright untuk Python 1.56 di lingkungan agen, di luar repositori) lewat server uji: respons, galat konsol, teks, ukuran layar, ukuran huruf, kontras, fokus dengan Tab, Enter ke galeri, animasi | AC-3 sampai AC-8, AC-14 |
| 5 | Tangkapan layar ke `docs/sehari-setara/tests/F-01/`: 1280×720, 1024×768, 1920×1080, dan tombol berfokus di 1280×720 | Bukti AC-3, AC-6, AC-7 |
| 6 | `dev:pages`: membuka `/sehari-setara/` dengan `curl` dan browser | AC-12 |
| 7 | `tsc --noEmit` tanpa menulis `tsconfig.tsbuildinfo`, dan ESLint pada file baru serta file yang diubah | AC-13 |
| 8 | `git diff --stat` terhadap commit dasar, dan `npx pnpm@11.25.0 install --frozen-lockfile` | AC-15 |
| 9 | Daftar periksa manual AGENTS bagian 9: hanya "Tampilan rapi di 1024×768 dan 1920×1080" yang berlaku. Butir lain belum relevan karena belum ada dialog, permainan, gerak, atau suara | — |

Hasil ditulis di `docs/sehari-setara/tests/F-01-hasil.md` (templat 11.3).
