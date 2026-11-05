# Hasil uji JS-01 — 5 November 2026

Fitur: kerangka Jejak Setara ([spesifikasi](../specs/JS-01-kerangka.md)).

Lingkungan: Node 22.23.4, pnpm 11.25.0, dan Chromium 153 (Chrome for Testing 153.0.8010.12, lewat `JEJAK_CHROMIUM`), di salinan repositori dari ZIP `main` 5 November 2026 ditambah ZIP Gerbang 1 dan Gerbang 2 JS-01, cabang `fitur/JS-01-kerangka`. Tangkapan layar ada di folder [`JS-01/`](JS-01/).

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 Skrip dan dependensi | Lulus | `git diff package.json`: hanya sepuluh baris skrip baru, ditambah koma di baris `test:e2e`; `dependencies`, `devDependencies`, dan `pnpm-lock.yaml` tidak berubah. `install --frozen-lockfile` lulus (14 detik; di salinan bersih 9 detik). Uji unit "package.json memuat kesepuluh skrip Jejak Setara persis" |
| AC-2 Build | Lulus | `build:jejak` 5 detik. `dist-jejak/client/` berisi `index.html`, `admin/index.html`, `_headers`, `.assetsignore`, dan berkas berhash di `assets/`; `dist-jejak/worker/` berisi `index.js` dan `wrangler.json` dengan `name` `jejak-setara-lokal`, `compatibility_date` `2026-05-15`, `LINGKUNGAN` `lokal`, dan `run_worker_first` `["/api/*", "/ws/*"]` |
| AC-3 API sehat | Lulus | Uji unit 1 dan 5. Uji ujung ke ujung "tajuk halaman dan jawaban Worker": isi `{"ok":true,"protokol":1,"lingkungan":"lokal"}` dan kelima tajuk JSON persis |
| AC-4 Jawaban lain | Lulus | Uji unit: `POST`, `PUT`, dan `DELETE /api/sehat` 405 dengan `Allow: GET`; `/api/ruang`, `/api/`, `/api/sehat/lagi`, dan `/ws/ruang/K7MPA` (dengan dan tanpa `Upgrade: websocket`) 404 `BELUM_TERSEDIA`; `/`, `/admin/`, dan `/tidak-ada` diteruskan ke `ASSETS`. Uji ujung ke ujung: `POST /api/sehat` 405, `/api/ruang` 404 JSON, `/tidak-ada` 404, dan `/admin` 307 ke `/admin/` |
| AC-5 Halaman di empat ukuran | Lulus | Delapan uji ujung ke ujung (2 halaman × 4 ukuran; 731 × 411 dengan `isMobile` dan `hasTouch`): teks, `lang="id"`, judul tab, "✓ Server siap" dalam 5 detik, dan kedua huruf termuat. 0 galat atau peringatan konsol, 0 respons 4xx atau 5xx, 0 permintaan `favicon`, 0 pelanggaran CSP, dan 0 permintaan ke alamat lain |
| AC-6 Status penanda | Lulus | "Memeriksa server…" selama jawaban ditahan. "! Server belum tersambung" untuk kelima kegagalan (dibatalkan, 500, bukan JSON, `ok` false, `protokol` 99). Tanpa jawaban, penanda berganti sesudah sedikitnya 4,5 detik dan paling lambat 6 detik (uji 6,3 detik). Penanda ber-`role="status"`; tanda ✓ dan ! ber-`aria-hidden="true"`; cuplikan aksesibilitas "status: Server siap" dan "status: Server belum tersambung" |
| AC-7 Dua konteks | Lulus | Uji "dua konteks bersamaan sama-sama menampilkan server siap" |
| AC-8 Tajuk halaman | Lulus | Uji ujung ke ujung: `/` dan `/admin/` membawa keempat tajuk `_headers` persis. Uji unit isi `_headers` |
| AC-9 Pengembangan | Lulus | `pnpm dev:jejak --port 4330`: siap dalam 5,2 detik; `/`, `/admin/`, dan `/api/sehat` menjawab 200 dari satu alamat, dan isi `/api/sehat` persis |
| AC-10 Uji unit | Lulus | `test:jejak`: 1 berkas, 23 uji lulus. `test` Sehari Setara: 14 berkas, 296 lulus, 1 dilewati. `RILIS=1 content:check`: 43 lulus, "Verifikasi rujukan: 14 dari 14 terverifikasi." |
| AC-11 Uji ujung ke ujung terpisah | Lulus | `test:e2e:jejak`: 18 uji lulus dalam 30,3 detik (35 detik termasuk build dan server), hanya dari `kerangka.uji.ts`. `playwright test --list` Sehari Setara: "Total: 160 tests in 9 files" |
| AC-12 Skrip belum tersedia | Lulus | Keenam skrip mencetak teks persis dan selesai dengan kode 0 (tabel di bawah). Di salinan, satu uji contoh di `app/jejak-setara/__tests__/konten/` membuat `content:check:jejak` menjalankannya (1 lulus, kode 0), dan uji yang sengaja gagal membuatnya keluar dengan kode 1 |
| AC-13 Alur kerja | Lulus | PyYAML membaca `jejak-uji.yml` sebagai YAML sah: nama "Jejak: uji"; pemicu `push` ke `main` dengan 13 jalur dan `workflow_dispatch`; `permissions: contents: read`; `concurrency` `jejak-uji`; `ubuntu-latest`; batas 15 menit; enam langkah persis. Tidak ada rahasia atau langkah deploy (kata "deploy" hanya ada di komentar). Di salinan bersih (`git clone` cabang): pasang 9 detik, `content:check:jejak` 3 detik ("Belum tersedia: …"), `test:jejak` 4 detik (23 lulus), `build:jejak` 5 detik. `deploy-pages.yml` tidak berubah |
| AC-14 Git | Lulus | Keempat pola ada di `.gitignore`. `git status --ignored`: `dist-jejak/`, `test-results-jejak/`, dan `web/jejak-setara/.wrangler/` tercatat diabaikan |
| AC-15 Dokumen | Lulus | Semua perubahan di bagian "Perubahan dokumen" spesifikasi ada dengan teks persis. `docs/jejak-setara/AGENTS.md` tidak lagi memuat "Finder" atau "klik dua kali". Tiga sebutan yang tersisa ada di spesifikasi (teks kriteria ini dan rencana ujinya) dan di `PLAN.md` (riwayat usulan 11), yang menjelaskan perubahan itu (Temuan 1) |
| AC-16 Galeri dan Sehari Setara | Lulus | `build:pages` lulus, dan ke-178 berkas `dist-pages/` identik byte dengan build `main`, sekali sesudah kode dan sekali sesudah semua dokumen, termasuk laporan ini. `git diff --name-status` hanya memuat berkas di daftar spesifikasi |
| AC-17 Pemeriksaan kode | Lulus | `tsc --noEmit -p tsconfig.json --incremental false`: 0 galat (19 detik, tanpa `next-env.d.ts`). ESLint `--max-warnings 0` pada `app/jejak-setara`, `server/jejak-setara`, `web/jejak-setara`, `e2e/jejak-setara`, `scripts/jejak-setara`, dan ketiga konfigurasi Jejak: 0 masalah. Tidak ada `any` |
| AC-18 Anggaran | Lulus | Layar pemain 61,2 KB gzip (31% dari 200 KB); konsol 61,2 KB gzip (17% dari 350 KB); huruf woff2 20,2 KB (bagian "Anggaran ukuran dan kinerja") |
| AC-19 Tangkapan layar | Lulus | Sepuluh berkas di `JS-01/` (bagian "Tangkapan layar") |

## Perintah yang dijalankan dan hasilnya

| Perintah | Hasil |
|---|---|
| `npx pnpm@11.25.0 install --frozen-lockfile` | Lulus (14 detik); lockfile tidak berubah |
| `npx pnpm@11.25.0 content:check:jejak` | Kode 0: "Belum tersedia: app/jejak-setara/__tests__/konten belum ada (dibuat di JS-05 dan JS-06)." |
| `npx pnpm@11.25.0 test:jejak` | Lulus: 1 berkas, 23 uji |
| `npx pnpm@11.25.0 test:jejak:server` | Kode 0: "Belum tersedia (dibuat di JS-03)." |
| `npx pnpm@11.25.0 build:jejak` | Lulus (5 detik) |
| `JEJAK_CHROMIUM=… npx pnpm@11.25.0 test:e2e:jejak` | Lulus: 18 uji dalam 30,3 detik |
| `npx pnpm@11.25.0 sim:beban` | Kode 0: "Belum tersedia (dibuat di JS-03)." (tidak wajib, lihat di bawah) |
| `npx pnpm@11.25.0 db:migrasi:lokal` | Kode 0: "Belum tersedia (dibuat di JS-03)." |
| `npx pnpm@11.25.0 peta:build` | Kode 0: "Belum tersedia: scripts/jejak-setara/peta/build_peta.py belum ada (dibuat di JS-06)." |
| `npx pnpm@11.25.0 assets:build:jejak` | Kode 0: "Belum tersedia: scripts/game/art/build_jejak.py belum ada (dibuat Sesi C bersama aset tampak atas)." |
| `npx pnpm@11.25.0 dev:jejak --port 4330 --strictPort --host 127.0.0.1` dan `curl` | `/`, `/admin/`, dan `/api/sehat` 200 dari satu alamat |
| `npx pnpm@11.25.0 test` | Lulus: 14 berkas, 296 uji, 1 dilewati |
| `RILIS=1 npx pnpm@11.25.0 content:check` | Lulus: 43 uji; "Verifikasi rujukan: 14 dari 14 terverifikasi." |
| `npx pnpm@11.25.0 build:pages` dan `sha256sum` ke-178 berkas `dist-pages/` | Identik dengan build `main`, sesudah kode dan sesudah semua dokumen |
| `npx playwright test --list` (konfigurasi Sehari Setara) | "Total: 160 tests in 9 files" |
| `npx tsc --noEmit -p tsconfig.json --incremental false` | 0 galat |
| `npx eslint app/jejak-setara server/jejak-setara web/jejak-setara e2e/jejak-setara scripts/jejak-setara vite.jejak.config.ts vitest.jejak.config.ts playwright.jejak.config.ts --max-warnings 0` | 0 masalah |
| `git status --ignored --short` | `dist-jejak/`, `test-results-jejak/`, dan `web/jejak-setara/.wrangler/` diabaikan |

## Simulasi beban (bila wajib)

Tidak wajib: JS-01 belum menyentuh protokol, inti ruang, atau kiriman ke D1 (AGENTS bagian 4.4). Gema WebSocket lewat Worker lokal sudah diukur di Plan JS-01 (`PLAN.md`, entri JS-01).

## Anggaran ukuran dan kinerja

Ukuran gzip (tingkat 9) hasil `build:jejak`:

| Berkas | Asli | Gzip |
|---|---|---|
| `assets/HalamanKerangka-*.js` (React dan komponen bersama, dipakai kedua halaman) | 191.705 B | 59.726 B |
| `assets/pemain-*.js` | 263 B | 216 B |
| `assets/admin-*.js` | 282 B | 224 B |
| `assets/HalamanKerangka-*.css` | 2.737 B | 960 B |
| `index.html` / `admin/index.html` | 530 B / 545 B | 316 B / 328 B |
| Huruf woff2 (Press Start 2P, Pixelify Sans) | 12.512 B + 7.692 B | — |

- Layar pemain: 61,2 KB gzip, 31% dari anggaran 200 KB (Architecture 11.3).
- Konsol: 61,2 KB gzip, 17% dari anggaran 350 KB.
- Aset layar pemain: hanya huruf, 20,2 KB, jauh di bawah 2 MB.
- Kinerja permainan (fps, waktu pulang-pergi) belum relevan; diukur mulai JS-03 dan JS-07.

## Tangkapan layar

| Berkas | Isi |
|---|---|
| `pemain-731x411.png`, `pemain-1280x720.png`, `pemain-1024x768.png`, `pemain-1920x1080.png` | Halaman pemain, "✓ Server siap" |
| `konsol-731x411.png`, `konsol-1280x720.png`, `konsol-1024x768.png`, `konsol-1920x1080.png` | Konsol, "✓ Server siap" |
| `pemain-memeriksa-1280x720.png` | Penanda "Memeriksa server…" |
| `pemain-belum-1280x720.png` | Penanda "! Server belum tersambung" |

## Daftar periksa manual (AGENTS bagian 9)

Tidak ada butir yang berlaku, karena belum ada permainan. Butir "Tidak ada nama asli siswa di layar, berkas ekspor, maupun log" terpenuhi dengan sendirinya, karena JS-01 tidak punya isian.

## Temuan

1. **Kalimat AC-15 terlalu luas.** Kriteria itu meminta kata "Finder" dan "klik dua kali" tidak ada lagi di `docs/jejak-setara/`, padahal spesifikasi sendiri dan riwayat usulan 11 di `PLAN.md` menyebut kedua kata itu saat menjelaskan perubahannya. Yang dimaksud adalah petunjuk kerja, dan `AGENTS.md` Jejak Setara sudah bersih. Spesifikasi diberi catatan **[Build]** di AC-15; perilaku dan teks lain tidak berubah.
2. **Lingkungan agen: mematikan proses dengan pola.** Dua kali perintah uji berhenti tanpa keluaran, karena pola pencarian proses (`pkill -f`) juga cocok dengan perintah yang sedang berjalan. Hasil uji tidak terpengaruh, dan pemeriksaan diulang sampai lengkap. Server dev kini dimatikan lewat skrip berkas; catatan ditambahkan di `PLAN.md`.
3. **Halaman kosong di layar besar.** Di 1920 × 1080, panel hanya selebar sekitar seperempat layar, karena ukurannya mengikuti skala laptop Design System bagian 5 (D-4a). Ini sesuai spesifikasi; skala layar kelas (satuan u) dipakai sejak JS-10.

## Keputusan: Lulus
