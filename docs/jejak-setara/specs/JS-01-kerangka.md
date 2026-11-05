# JS-01 — Kerangka

| | |
|---|---|
| Status | Ditulis 5 November 2026; menunggu `Spesifikasi disetujui: JS-01` |
| Rencana | `docs/jejak-setara/PLAN.md`, entri JS-01 |
| Keputusan Gerbang 1 | Balasan `Setuju: JS-01` (5 Nov 2026): saran setiap usulan diterima (1a sampai 13a), dan KT-01 dijawab "Jejak Setara" |

## Ringkasan

JS-01 membuat kerangka Jejak Setara. Sesudah fitur ini:

- dua halaman kosong, pemain di `/` dan konsol di `/admin/`, disajikan bersama satu Worker Cloudflare lokal di satu alamat;
- satu konstanta bersama, `PROTOKOL_VERSI`, dipakai klien dan server dari `app/jejak-setara/inti/`;
- kesepuluh skrip Jejak Setara terdaftar di `package.json`, sehingga Sesi B dan C tidak perlu menyentuhnya;
- uji unit dan uji ujung ke ujung Jejak Setara berjalan terpisah dari uji Sehari Setara;
- alur kerja GitHub "Jejak: uji" berjalan tanpa deploy;
- dokumen diperbarui: penunjuk di `AGENTS.md` akar, langkah Windows di AGENTS Jejak Setara, keputusan baru JA-15, dan catatan keputusan KT-01.

Belum ada permainan, ruang, WebSocket, basis data, atau akun.

## Kaitan PRD

| Acuan | Yang dipenuhi di JS-01 |
|---|---|
| Architecture JA-01 | Halaman, API, dan (kelak) WebSocket disajikan satu Worker di satu alamat; halaman memanggil `/api/sehat` tanpa CORS |
| Architecture JA-07 | Kode bersama di `app/jejak-setara/inti/` diimpor klien dan server (`PROTOKOL_VERSI`) |
| PRD bagian 12 | Anggaran muatan awal: kode layar pemain ≤ 200 KB gzip, konsol ≤ 350 KB gzip (Architecture 11.3); diukur di Test |
| PRD bagian 13; aturan wajib 4 | Tidak ada data pribadi, penyimpanan peramban, analitik, pelacak, atau CDN; semua permintaan ke alamat sendiri |
| Design System bagian 2, 4, 5, 10, 13 | Token `--js-`, huruf Press Start 2P dan Pixelify Sans, bingkai piksel, teks di atas warna aksen memakai `ink`, makna tidak hanya lewat warna, `lang="id"` |
| KT-01 | Nama produk "Jejak Setara" (dijawab di Gerbang 1) |
| Permintaan pemilik proyek, 5 Nov 2026 | Semua nama skrip AGENTS bagian 6 di `package.json`; tempat status Sesi B dan C di `PLAN.md`; istilah Windows di AGENTS bagian 11.4 |

## Berkas yang dibuat dan diubah

| Berkas | Status | Isi |
|---|---|---|
| `vite.jejak.config.ts` | Baru | Konfigurasi Vite dengan plugin Cloudflare (bagian "Konfigurasi") |
| `vitest.jejak.config.ts` | Baru | Uji unit Jejak Setara, terpisah dari `vitest.config.ts` agar Vitest tidak memuat plugin Cloudflare |
| `playwright.jejak.config.ts` | Baru | Uji ujung ke ujung Jejak Setara terhadap `vite preview` |
| `server/jejak-setara/wrangler.jsonc` | Baru | Konfigurasi Worker lokal |
| `server/jejak-setara/src/index.ts` | Baru | Worker: `/api/sehat`, jawaban `BELUM_TERSEDIA`, selebihnya aset |
| `web/jejak-setara/index.html`, `web/jejak-setara/main.tsx` | Baru | Titik masuk halaman pemain |
| `web/jejak-setara/admin/index.html`, `web/jejak-setara/admin/main.tsx` | Baru | Titik masuk konsol |
| `web/jejak-setara/public/_headers` | Baru | Tajuk keamanan halaman |
| `app/jejak-setara/inti/protokol.ts` | Baru | Hanya `export const PROTOKOL_VERSI = 1;` |
| `app/jejak-setara/teks.ts` | Baru | Semua teks halaman kosong (Architecture bagian 17) |
| `app/jejak-setara/styles/jejak.css` | Baru | Token `--js-` Design System bagian 4, bingkai piksel, dan gaya halaman kosong |
| `app/jejak-setara/bersama/HalamanKerangka.tsx` | Baru | Panel halaman kosong dengan penanda server, dipakai kedua halaman |
| `app/jejak-setara/pemain/App.tsx`, `app/jejak-setara/admin/App.tsx` | Baru | Halaman pemain dan konsol |
| `app/jejak-setara/__tests__/kerangka.test.ts` | Baru | Uji unit (Rencana uji) |
| `e2e/jejak-setara/kerangka.uji.ts` | Baru | Uji ujung ke ujung (Rencana uji) |
| `scripts/jejak-setara/bila-ada.mjs` | Baru | Penjalan skrip yang berkasnya belum ada |
| `.github/workflows/jejak-uji.yml` | Baru | Alur kerja "Jejak: uji" |
| `docs/jejak-setara/tests/JS-01-hasil.md`, `docs/jejak-setara/tests/JS-01/*.png` | Baru (Test) | Laporan uji dan tangkapan layar |
| `package.json` | Diubah | Hanya bagian `scripts`: sepuluh skrip baru |
| `.gitignore` | Diubah | Empat pola baru |
| `AGENTS.md` (akar) | Diubah | Satu paragraf penunjuk |
| `docs/jejak-setara/AGENTS.md` | Diubah | Bagian 4.1, 6, dan 11.4 (sudah di ZIP Gerbang 2); butir terakhir bagian 0 (Build) |
| `docs/jejak-setara/Architecture.md` | Diubah | Bagian "Perubahan dokumen" |
| `docs/jejak-setara/PRD.md` | Diubah | Satu baris catatan keputusan KT-01 di bagian 21 (tambahan kecil dari daftar rencana) |
| `docs/jejak-setara/PLAN.md` | Diubah | Status dan riwayat JS-01 |

Tidak disentuh: kode dan dokumen Sehari Setara, galeri, `deploy-pages.yml`, `playwright.config.ts`, `vitest.config.ts`, `tsconfig.json`, dan `pnpm-lock.yaml`.

## Perilaku

### Menjalankan dan membangun

- P-1. Diberikan dependensi terpasang, ketika agen menjalankan `npx pnpm@11.25.0 dev:jejak`, maka satu server Vite menyajikan halaman pemain di `/` dan konsol di `/admin/`, dan Worker lokal menjawab `/api/*` dan `/ws/*` di alamat yang sama. Perubahan halaman langsung terlihat tanpa build ulang.
- P-2. Ketika agen menjalankan `build:jejak`, maka `dist-jejak/client/` berisi `index.html`, `admin/index.html`, `_headers`, dan berkas berhash di `assets/`, sedangkan `dist-jejak/worker/` berisi `index.js` dan `wrangler.json`. `wrangler.json` hasil build bernama `jejak-setara-lokal`, bertanggal kompatibilitas `2026-05-15`, ber-`LINGKUNGAN` `lokal`, dan ber-`run_worker_first` `["/api/*", "/ws/*"]`.
- P-3. Ketika `vite preview --config vite.jejak.config.ts` dijalankan sesudah build, maka hasil build berjalan di runtime Workers lokal, dan halaman mendapat tajuk dari `_headers`.
- P-4. Vite, plugin, dan Wrangler tidak mengirim apa pun ke Cloudflare saat dev, build, dan preview: `vite.jejak.config.ts` mengisi `WRANGLER_SEND_METRICS=false` dan `CLOUDFLARE_CF_FETCH_ENABLED=false` bila belum diisi, sebelum plugin dimuat (pola `vite.config.ts`).

### Halaman

- P-5. Diberikan server berjalan, ketika `/` dibuka, maka di tengah layar tampil satu panel berbingkai piksel berisi judul "Jejak Setara", kalimat "Permainan sedang disiapkan.", dan penanda server. Penanda mula-mula "Memeriksa server…", lalu "✓ Server siap" sesudah `/api/sehat` menjawab benar.
- P-6. Ketika `/admin/` dibuka, maka panelnya berisi baris atas "Jejak Setara", judul "Konsol admin", kalimat "Konsol sedang disiapkan.", dan penanda server yang sama.
- P-7. Ketika `/admin` (tanpa garis miring) dibuka, maka peramban dialihkan ke `/admin/` (307, aturan bawaan aset Cloudflare).
- P-8. Diberikan `/api/sehat` gagal, ketika halaman memeriksa server, maka penanda menjadi "! Server belum tersambung". Gagal berarti salah satu dari: jaringan putus, jawaban bukan 200, isi bukan JSON, `ok` bukan `true`, `protokol` bukan `PROTOKOL_VERSI`, atau tidak ada jawaban dalam 5 detik (D-2, D-3). Tidak ada percobaan ulang otomatis; memuat ulang halaman memeriksa lagi.
- P-9. Pemeriksaan server terjadi sekali setiap halaman dimuat, dengan `fetch("/api/sehat", { cache: "no-store" })`. Pemeriksaan yang dibatalkan karena halaman ditutup tidak mengubah tampilan, termasuk saat React menjalankan efek dua kali di mode pengembangan.
- P-10. Halaman tidak meminta `favicon.ico` (`<link rel="icon" href="data:,">`) dan tidak memuat apa pun dari alamat lain.

### Worker

- P-11. Ketika `GET /api/sehat` diminta, maka Worker menjawab 200 dengan `{"ok":true,"protokol":1,"lingkungan":"lokal"}`. Nilai `protokol` diambil dari `PROTOKOL_VERSI`, dan `lingkungan` dari variabel `LINGKUNGAN`.
- P-12. Ketika `/api/sehat` diminta dengan metode selain `GET`, maka Worker menjawab 405 dengan tajuk `Allow: GET` dan `{"galat":{"kode":"METODE_TIDAK_DIDUKUNG","pesan":"Metode ini tidak didukung."}}`.
- P-13. Ketika jalur lain di bawah `/api/` atau `/ws/` diminta, dengan metode apa pun dan juga permintaan WebSocket, maka Worker menjawab 404 dengan `{"galat":{"kode":"BELUM_TERSEDIA","pesan":"Fitur ini belum tersedia."}}`.
- P-14. Jalur lain tidak melewati Worker bila cocok dengan aset. Bila tidak cocok dan sampai ke Worker, permintaan diteruskan ke `env.ASSETS.fetch`, yang menjawab 404 untuk jalur yang tidak ada.
- P-15. Worker tidak menulis log permintaan.

### Skrip

- P-16. Ketika `content:check:jejak` dijalankan dan folder `app/jejak-setara/__tests__/konten/` belum ada, maka tercetak "Belum tersedia: app/jejak-setara/__tests__/konten belum ada (dibuat di JS-05 dan JS-06)." dan skrip selesai dengan kode 0. Bila folder itu ada, Vitest menjalankan semua uji di dalamnya, dan kode keluar mengikuti hasil uji.
- P-17. `peta:build` dan `assets:build:jejak` berperilaku sama untuk berkas Python masing-masing. `test:jejak:server`, `sim:beban`, dan `db:migrasi:lokal` selalu mencetak "Belum tersedia (dibuat di JS-03)." dan selesai dengan kode 0.
- P-18. `test:jejak` menjalankan semua uji unit Jejak Setara (`app/jejak-setara/**/*.test.ts`, `app/jejak-setara/**/*.test.tsx`, dan `server/jejak-setara/**/*.test.ts`), termasuk uji konten. `test` Sehari Setara tidak menjalankannya, dan `test:jejak` tidak menjalankan uji Sehari Setara.
- P-19. `test:e2e:jejak` membangun Jejak Setara, menyalakan `vite preview` di `127.0.0.1:4310`, lalu menjalankan `e2e/jejak-setara/**/*.uji.ts` dengan Chromium. Bila variabel `JEJAK_CHROMIUM` berisi jalur, Chromium di jalur itu yang dipakai. `test:e2e` Sehari Setara tidak membaca berkas `*.uji.ts`.

### Alur kerja dan git

- P-20. Ketika push ke `main` mengubah salah satu jalur di bagian "Alur kerja", atau pemilik proyek menekan **Run workflow** di "Jejak: uji", maka alur kerja menjalankan empat langkah berurutan dan berhenti di langkah pertama yang gagal. Tidak ada deploy, migrasi, atau rahasia.
- P-21. Sesudah `dev:jejak`, `build:jejak`, dan `test:e2e:jejak` dijalankan, `git status` tidak menampilkan `dist-jejak/`, folder `.wrangler/` mana pun, atau `test-results-jejak/`.

## Beberapa pemain sekaligus

Belum berlaku: JS-01 belum punya ruang atau sambungan real-time. Beberapa tab atau perangkat yang membuka halaman bersamaan masing-masing memeriksa `/api/sehat` sendiri dan tidak saling memengaruhi. Diuji dengan dua konteks peramban yang dibuka bersamaan (AC-7).

## Status antarmuka

| Status | Kapan | Tampilan penanda |
|---|---|---|
| Memeriksa (memuat) | Sejak halaman tampil sampai pemeriksaan selesai, paling lama 5 detik | Latar `mist`, teks `ink`: "Memeriksa server…" |
| Siap (biasa) | `/api/sehat` menjawab benar (P-11) | Latar `leaf`, teks `ink`: "✓ Server siap" |
| Belum tersambung (galat) | Salah satu kegagalan P-8 | Latar `mango`, teks `ink`: "! Server belum tersambung" |

- Penanda adalah wilayah `role="status"`, sehingga perubahannya diumumkan pembaca layar. Tanda ✓ dan ! dibungkus `aria-hidden="true"`, jadi yang dibacakan "Server siap" atau "Server belum tersambung".
- Fokus: halaman kosong tidak punya unsur yang bisa difokus. Menekan `Tab` tidak memindahkan fokus ke unsur halaman.
- Nonaktif, kosong, terputus, menyambung ulang, dijeda, ruang penuh, dan ruang terkunci: tidak berlaku (JS-03 dan JS-07).
- HP tegak: panel tetap di tengah. Ajakan memutar HP dibuat di JS-07.
- Kurangi gerak: tidak ada animasi.

## Teks yang tampil (final)

| Tempat | Teks |
|---|---|
| Judul tab pemain (`<title>`) | Jejak Setara |
| Judul tab konsol (`<title>`) | Konsol admin · Jejak Setara |
| Pemain, judul | Jejak Setara |
| Pemain, kalimat | Permainan sedang disiapkan. |
| Konsol, baris atas | Jejak Setara |
| Konsol, judul | Konsol admin |
| Konsol, kalimat | Konsol sedang disiapkan. |
| Penanda, memeriksa | Memeriksa server… |
| Penanda, siap | ✓ Server siap |
| Penanda, belum tersambung | ! Server belum tersambung |
| Jawaban 404 API | kode `BELUM_TERSEDIA`, pesan "Fitur ini belum tersedia." |
| Jawaban 405 API | kode `METODE_TIDAK_DIDUKUNG`, pesan "Metode ini tidak didukung." |
| Penjalan skrip, berkas belum ada | Belum tersedia: {jalur} belum ada ({keterangan}). |
| Penjalan skrip, fitur belum ada | Belum tersedia ({keterangan}). |
| Alur kerja | Nama "Jejak: uji"; langkah "Pasang dependensi", "Periksa konten Jejak", "Uji Jejak", "Build Jejak" |

Teks halaman berada di `app/jejak-setara/teks.ts`, kecuali kedua `<title>`, yang ditulis di `index.html` agar tampil sebelum kode dimuat. Uji unit memastikan keduanya sama dengan tabel ini.

## Data, protokol, API, dan migrasi

### Protokol

`app/jejak-setara/inti/protokol.ts` hanya berisi `export const PROTOKOL_VERSI = 1;` dan satu baris komentar. Belum ada pesan, skema `zod`, atau WebSocket (JS-02 dan JS-03).

### API

| Metode dan jalur | Jawaban |
|---|---|
| `GET /api/sehat` | 200 `{"ok":true,"protokol":1,"lingkungan":"lokal"}` |
| Metode lain ke `/api/sehat` | 405, tajuk `Allow: GET`, galat `METODE_TIDAK_DIDUKUNG` |
| Jalur lain di bawah `/api/` atau `/ws/` | 404, galat `BELUM_TERSEDIA` |
| Jalur lain | Aset statis; 404 bila tidak ada |

Semua jawaban Worker berbentuk JSON dengan tajuk:

```
Content-Type: application/json; charset=utf-8
Cache-Control: no-store
X-Content-Type-Options: nosniff
Referrer-Policy: same-origin
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
```

Bentuk galat mengikuti Architecture 10.2: `{"galat":{"kode":"...","pesan":"..."}}`.

Klien menganggap jawaban benar bila status 200, isinya JSON, `ok === true`, dan `protokol === PROTOKOL_VERSI`. Isi diperiksa sebagai `unknown`, karena tipe `Response` di repositori ini berasal dari `@cloudflare/workers-types` (catatan Plan JS-02).

### Konfigurasi

`server/jejak-setara/wrangler.jsonc`, tanpa komentar agar uji bisa membacanya sebagai JSON:

```json
{
  "$schema": "../../node_modules/wrangler/config-schema.json",
  "name": "jejak-setara-lokal",
  "main": "src/index.ts",
  "compatibility_date": "2026-05-15",
  "assets": { "binding": "ASSETS", "run_worker_first": ["/api/*", "/ws/*"] },
  "vars": { "LINGKUNGAN": "lokal" }
}
```

`vite.jejak.config.ts` berbentuk `defineConfig(async () => …)`. Isinya: mengisi kedua variabel P-4, memuat `@cloudflare/vite-plugin` lewat `import()`, lalu mengembalikan:

- `root: "web/jejak-setara"`, `base: "/"`;
- `plugins: [react(), cloudflare({ configPath: <akar>/server/jejak-setara/wrangler.jsonc, viteEnvironment: { name: "worker" }, inspectorPort: false })]`;
- `build: { outDir: <akar>/dist-jejak, emptyOutDir: true }`;
- `environments.client.build.rolldownOptions.input` berisi `pemain` (`web/jejak-setara/index.html`) dan `admin` (`web/jejak-setara/admin/index.html`).

Masukan dua halaman wajib di `environments.client`. Bila ditulis di `build` teratas, build Worker ikut membacanya dan gagal (percobaan Plan JS-01: galat `UNRESOLVED_ENTRY`).

`vitest.jejak.config.ts`: `include` ketiga pola P-18, `environment: "node"`.

`playwright.jejak.config.ts`: `testDir: "e2e/jejak-setara"`, `testMatch: "**/*.uji.ts"`, `outputDir: "test-results-jejak"`, satu pekerja, `reporter: "list"`, batas 60 detik per uji, `baseURL: http://127.0.0.1:4310`, Chromium dengan `executablePath` dari `JEJAK_CHROMIUM` bila ada, dan `webServer` yang menjalankan `npx pnpm@11.25.0 build:jejak && npx vite preview --config vite.jejak.config.ts --port 4310 --strictPort --host 127.0.0.1`, menunggu `/api/sehat` paling lama 180 detik, tanpa memakai server yang sudah ada.

### Tajuk halaman

`web/jejak-setara/public/_headers`:

```
/*
  Content-Security-Policy: default-src 'self'; connect-src 'self'; img-src 'self' data: blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  X-Content-Type-Options: nosniff
  Referrer-Policy: same-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

`base-uri` dan `form-action` adalah tambahan dari Architecture 12.2, karena keduanya tidak tercakup `default-src`. `connect-src 'self'` juga mengizinkan WebSocket ke alamat sendiri (percobaan Plan JS-01 dengan `ws://` lokal; `wss://` dicek ulang di lingkungan uji JS-03).

### Skrip `package.json`

Ditambahkan sesudah `test:e2e`, dengan teks persis:

| Skrip | Perintah |
|---|---|
| `dev:jejak` | `vite --config vite.jejak.config.ts` |
| `build:jejak` | `vite build --config vite.jejak.config.ts` |
| `test:jejak` | `vitest run --config vitest.jejak.config.ts` |
| `content:check:jejak` | `node scripts/jejak-setara/bila-ada.mjs app/jejak-setara/__tests__/konten "dibuat di JS-05 dan JS-06" -- vitest run --config vitest.jejak.config.ts app/jejak-setara/__tests__/konten/` |
| `test:jejak:server` | `node scripts/jejak-setara/bila-ada.mjs - "dibuat di JS-03"` |
| `test:e2e:jejak` | `playwright test --config playwright.jejak.config.ts` |
| `sim:beban` | `node scripts/jejak-setara/bila-ada.mjs - "dibuat di JS-03"` |
| `db:migrasi:lokal` | `node scripts/jejak-setara/bila-ada.mjs - "dibuat di JS-03"` |
| `peta:build` | `node scripts/jejak-setara/bila-ada.mjs scripts/jejak-setara/peta/build_peta.py "dibuat di JS-06" -- python scripts/jejak-setara/peta/build_peta.py` |
| `assets:build:jejak` | `node scripts/jejak-setara/bila-ada.mjs scripts/game/art/build_jejak.py "dibuat Sesi C bersama aset tampak atas" -- python scripts/game/art/build_jejak.py` |

Di JSON, tanda kutip di dalam perintah ditulis `\"`. Bagian `dependencies` dan `devDependencies` tidak berubah. `python` dipakai seperti skrip `assets:build` Sehari Setara.

`scripts/jejak-setara/bila-ada.mjs` dipanggil `node bila-ada.mjs <jalur atau -> <keterangan> [-- <perintah …>]`:

- jalur `-`: cetak "Belum tersedia ({keterangan})." dan keluar dengan kode 0;
- jalur belum ada: cetak "Belum tersedia: {jalur} belum ada ({keterangan})." dan keluar dengan kode 0;
- jalur ada dan perintah diberikan: jalankan perintah lewat *shell* dengan keluaran yang sama, lalu keluar dengan kode perintah itu (1 bila tidak ada kode). Argumen tambahan dari `pnpm` ikut ke akhir perintah.

### Alur kerja

`.github/workflows/jejak-uji.yml`, nama "Jejak: uji":

- pemicu: `push` ke `main` yang mengubah `app/jejak-setara/**`, `web/jejak-setara/**`, `server/jejak-setara/**`, `scripts/jejak-setara/**`, `scripts/game/art/**`, `e2e/jejak-setara/**`, `docs/jejak-setara/**`, `vite.jejak.config.ts`, `vitest.jejak.config.ts`, `playwright.jejak.config.ts`, `package.json`, `pnpm-lock.yaml`, atau `.github/workflows/jejak-uji.yml`; dan `workflow_dispatch` (tombol **Run workflow**);
- `permissions: contents: read`; `concurrency` grup `jejak-uji` yang membatalkan jalan lama;
- satu pekerjaan di `ubuntu-latest`, batas 15 menit: `actions/checkout@v4`, `actions/setup-node@v4` dengan Node 22, lalu "Pasang dependensi" (`npx -y pnpm@11.25.0 install --frozen-lockfile`), "Periksa konten Jejak" (`content:check:jejak`), "Uji Jejak" (`test:jejak`), dan "Build Jejak" (`build:jejak`), masing-masing lewat `npx -y pnpm@11.25.0`.

### `.gitignore`

Ditambahkan di akhir berkas, tanpa mengubah baris lama:

```
# Jejak Setara (JS-01)
/dist-jejak/
.wrangler/
.dev.vars*
/test-results-jejak/
```

### Migrasi dan penyimpanan

Migrasi D1: tidak ada. Penyimpanan peramban (`localStorage`, `sessionStorage`, *cookie*): tidak ada.

## Tampilan

- `jejak.css` memuat seluruh blok `:root` Design System bagian 4, termasuk token peran, dengan nilai persis. Nilai token dasar sama dengan token `--ss-` di `app/sehari-setara/styles/game.css` (berkas itu hanya dibaca uji). Tidak ada token baru di `:root`.
- Latar halaman `ink`. Panel di tengah layar memakai bingkai piksel Sehari Setara: garis `ink` 2 piksel antarmuka, sudut terpotong 1 piksel, sorotan `white` 1 piksel di sisi atas-dalam, dan latar `cream`. Satu piksel antarmuka adalah 2 px CSS, disimpan di properti `--js-px` pada `.js-kerangka`, bukan di `:root` (pola `--ss-px`). Lebar panel paling besar 560 px.
- Penanda server memakai bingkai yang sama dengan garis 1 piksel antarmuka. Teksnya selalu `ink`.
- Huruf (D-4): judul Press Start 2P, kalimat dan penanda Pixelify Sans, cadangan `monospace`. Ukurannya mengikuti Design System bagian 5:

| Unsur | HP | Laptop |
|---|---|---|
| Judul (gaya judul layar) | 16 px | 22 px |
| Kalimat (gaya teks situasi) | 17 px | 20 px |
| Penanda dan baris atas konsol (gaya label kecil) | 13 px | 14 px |

  Ukuran HP berlaku bila tinggi layar ≤ 500 px atau lebarnya ≤ 600 px.
- Baris atas konsol berwarna `dusk`. Huruf dimuat dari `@fontsource/press-start-2p/latin-400.css` dan `@fontsource/pixelify-sans/latin-400.css`, seperti Sehari Setara (keputusan A11).

## Aset

Tidak ada aset gambar atau suara. Tidak ada `manifest.ts` atau `CREDITS.md` Jejak Setara; keduanya dibuat bersama aset pertama (Sesi C, Daftar Aset). Huruf berasal dari paket `@fontsource` yang sudah terpasang. Ikon tab dikosongkan (`data:,`).

## Keamanan dan privasi

- Tidak ada isian, data pribadi, *cookie*, atau penyimpanan peramban.
- Tidak ada analitik, pelacak, CDN, atau huruf dari luar. Uji ujung ke ujung memastikan semua permintaan halaman menuju alamat sendiri.
- Tajuk keamanan halaman dari `_headers` dan tajuk jawaban API dari Worker (bagian "Data, protokol, API, dan migrasi").
- Tidak ada rahasia di JS-01. `.dev.vars*` dan `.env*` diabaikan git. Alur kerja hanya boleh membaca repositori dan tidak memakai rahasia.
- Telemetri Wrangler dan pengambilan data `Request.cf` dari Cloudflare dimatikan (P-4).

## Perubahan dokumen

| Dokumen | Perubahan | Diserahkan di |
|---|---|---|
| `docs/jejak-setara/AGENTS.md` | Baris versi 0.2; bagian 4.1 baris Keluaran (tempat rencana Sesi B dan C); bagian 6 (daftar skrip final); bagian 11.4 langkah 1, 3, dan 4 (istilah Windows) | ZIP Gerbang 2 (usulan 11a dan 12a) |
| `docs/jejak-setara/AGENTS.md` | Butir terakhir bagian 0 menjadi "Sejak JS-01, `AGENTS.md` akar memuat penunjuk ke dokumen ini." | ZIP akhir, bersama paragraf penunjuk |
| `AGENTS.md` akar | Satu paragraf sesudah kalimat pembuka di baris 3, dipisah baris kosong: "**Jejak Setara.** Repositori ini juga memuat game kedua, Jejak Setara. Panduan agennya ada di `docs/jejak-setara/AGENTS.md`, dan saat mengerjakan Jejak Setara panduan itu menggantikan dokumen ini. Dokumen ini tetap berlaku penuh untuk Sehari Setara dan galeri. Bila satu pekerjaan menyentuh keduanya, kedua panduan berlaku; bila bertentangan, berhenti dan tanyakan." | ZIP akhir |
| `docs/jejak-setara/Architecture.md` | Catatan pembuka: pemeriksaan dokumentasi Cloudflare di Plan JS-01 dan letak perbedaannya. Bagian 1: baris JA-15 (di bawah). Bagian 3: `teks.ts`, `bersama/HalamanKerangka.tsx`, `web/jejak-setara/public/_headers`, `scripts/jejak-setara/bila-ada.mjs`, `vitest.jejak.config.ts`, dan `playwright.jejak.config.ts`. Bagian 4.1: konfigurasi plugin menggantikan contoh, dan kalimat "Plan JS-01 menimbang …" diganti JA-15. Bagian 4.2: `wrangler.jsonc` JS-01, ditambah rencana JS-03 (lingkungan `uji` dan `produksi`, dipilih saat build lewat `CLOUDFLARE_ENV`). Bagian 4.3: tabel kesepuluh skrip dan penjalan `bila-ada.mjs`. Bagian 4.4: langkah `jejak-uji.yml` di JS-01, dengan migrasi dan deploy di JS-03. Bagian 4.5: `LINGKUNGAN` bernilai `lokal`, `uji`, atau `produksi`. Bagian 12.2: halaman mendapat tajuk dari `_headers`, jawaban API dari Worker. Bagian 14: uji ujung ke ujung memakai `vite preview` dan berkas `*.uji.ts` | ZIP akhir |
| `docs/jejak-setara/PRD.md` | Bagian 21, baris baru: "5 Nov 2026 \| Nama produk tetap "Jejak Setara" (KT-01, Gerbang 1 JS-01)" | ZIP akhir |
| `docs/jejak-setara/PLAN.md` | Status dan riwayat JS-01 | Setiap gerbang |

Baris JA-15 di Architecture bagian 1:

> JA-15 | Pengembangan, build, dan uji ujung ke ujung memakai **plugin Cloudflare untuk Vite** (`@cloudflare/vite-plugin`): `dev:jejak` menjalankan halaman dan Worker di satu alamat; `build:jejak` menghasilkan `dist-jejak/client/` dan `dist-jejak/worker/`; uji ujung ke ujung memakai `vite preview`. Lingkungan Cloudflare dipilih saat build lewat `CLOUDFLARE_ENV` | Satu perintah dan satu alamat seperti di server sungguhan; cara yang dianjurkan dokumentasi Cloudflare untuk proyek Vite; paket sudah terpasang. Diputuskan di Gerbang 1 JS-01 (5 Nov 2026)

## Di luar cakupan

- Ruang, Durable Object, WebSocket, D1, migrasi, akun, dan halaman gabung (JS-03, JS-04).
- Lingkungan `uji` dan `produksi`, deploy, rahasia GitHub dan Worker (JS-03).
- Isi `test:jejak:server`, `sim:beban`, dan `db:migrasi:lokal` (JS-03); uji konten (JS-05, JS-06); peta dan aset (Sesi C).
- Skema `zod` dan uji kemurnian `inti/` (JS-02).
- Antarmuka permainan: kanvas, HUD, ajakan memutar HP, layar penuh, *Screen Wake Lock*, dan suara (JS-07, JS-14).
- Tajuk *cache* untuk aset berhash dan perbaikan kinerja (JS-15).
- `test:e2e:jejak` di CI (usulan 9c tidak dipilih); uji di Safari iOS dan Firefox.
- Ikon tab sungguhan, layar "Tentang", dan kredit huruf di halaman (aset Sesi C; Design System bagian 15).

## DRAF untuk ditinjau pemilik proyek

- **D-1. Teks halaman kosong dan penanda server.** Saran: teks di tabel "Teks yang tampil (final)". Ganti kata mana pun bila kurang pas.
- **D-2. Batas waktu pemeriksaan server.** (a, saran) 5 detik, cukup untuk wifi sekolah yang lambat tanpa membuat pemilik proyek lama menunggu; (b) 10 detik.
- **D-3. Bila versi protokol server berbeda dari halaman.** (a, saran) sama dengan galat lain: "! Server belum tersambung". Di JS-01 halaman dan Worker selalu dibangun bersama, dan pesan pembaruan versi dibuat di JS-03 (kode `VERSI_BERBEDA`). (b) Teks Architecture 6.7: "! Ada pembaruan. Muat ulang halaman."
- **D-4. Ukuran huruf.** (a, saran) skala HP dan laptop Design System bagian 5, seperti tabel di bagian "Tampilan"; (b) satu ukuran laptop untuk semua layar.

## Kriteria penerimaan

- [ ] AC-1 **Skrip dan dependensi.** `package.json` memuat kesepuluh skrip dengan teks persis tabel; bagian lain `package.json` dan `pnpm-lock.yaml` tidak berubah; `install --frozen-lockfile` lulus.
- [ ] AC-2 **Build.** `build:jejak` lulus, dan isi `dist-jejak/` sesuai P-2, termasuk keempat nilai `wrangler.json` hasil build.
- [ ] AC-3 **API sehat.** `GET /api/sehat` sesuai P-11, dengan kelima tajuk JSON, baik lewat `vite preview` maupun di uji unit.
- [ ] AC-4 **Jawaban lain.** P-12, P-13, dan P-14: `POST /api/sehat` 405 dengan `Allow: GET`; `/api/ruang`, `/api/`, dan `/ws/ruang/K7MPA` (juga dengan tajuk `Upgrade: websocket`) 404 `BELUM_TERSEDIA`; jalur lain diteruskan ke aset; jalur yang tidak ada 404; `/admin` dialihkan 307 ke `/admin/`.
- [ ] AC-5 **Halaman di empat ukuran.** `/` dan `/admin/` di 731 × 411 (emulasi HP dengan sentuhan), 1280 × 720, 1024 × 768, dan 1920 × 1080 menampilkan teks persis, `lang="id"`, dan judul tab persis. "✓ Server siap" tampil dalam 5 detik, dan kedua huruf termuat. Tidak ada galat atau peringatan konsol, respons 4xx atau 5xx, permintaan `favicon`, pelanggaran CSP, atau permintaan ke alamat lain.
- [ ] AC-6 **Status penanda.** "Memeriksa server…" tampil selama jawaban ditahan. "! Server belum tersambung" tampil untuk keenam kegagalan P-8, dan untuk batas waktu paling lambat 6 detik sesudah halaman dibuka. Penanda ber-`role="status"`, dan tanda ✓ serta ! ber-`aria-hidden="true"`.
- [ ] AC-7 **Dua konteks.** Dua konteks peramban yang membuka `/` dan `/admin/` bersamaan sama-sama menampilkan "✓ Server siap".
- [ ] AC-8 **Tajuk halaman.** `/` dan `/admin/` membawa keempat tajuk `_headers` persis.
- [ ] AC-9 **Pengembangan.** Lewat `dev:jejak`, `/`, `/admin/`, dan `/api/sehat` menjawab 200 dari satu alamat.
- [ ] AC-10 **Uji unit.** `test:jejak` lulus. `test` Sehari Setara tetap 14 berkas, 296 lulus, dan 1 dilewati. `RILIS=1 content:check` lulus.
- [ ] AC-11 **Uji ujung ke ujung terpisah.** `test:e2e:jejak` lulus dan hanya menjalankan berkas `*.uji.ts`. `playwright test --list` Sehari Setara tetap 160 uji di 9 berkas.
- [ ] AC-12 **Skrip belum tersedia.** Keenam skrip P-16 dan P-17 mencetak teks persis dan selesai dengan kode 0. Di salinan, satu uji contoh di `app/jejak-setara/__tests__/konten/` membuat `content:check:jejak` menjalankannya, dan uji yang sengaja gagal membuatnya keluar dengan kode bukan 0.
- [ ] AC-13 **Alur kerja.** `jejak-uji.yml` terbaca sebagai YAML yang sah, dengan nama, pemicu, izin, dan langkah persis spesifikasi; tidak ada langkah deploy atau rahasia. Keempat langkahnya, dijalankan berurutan di salinan bersih, lulus. `deploy-pages.yml` tidak berubah.
- [ ] AC-14 **Git.** Keempat pola `.gitignore` ada, dan P-21 terpenuhi (`git status --ignored`).
- [ ] AC-15 **Dokumen.** Semua perubahan di bagian "Perubahan dokumen" ada dengan teks persis. Kata "Finder" dan "klik dua kali" tidak lagi ada di `docs/jejak-setara/`.
- [ ] AC-16 **Galeri dan Sehari Setara tidak berubah.** `build:pages` lulus, dan ke-178 berkas `dist-pages/` identik byte dengan build `main`, sekali sesudah kode dan sekali sesudah semua dokumen, termasuk laporan uji. `git diff --name-status` hanya memuat berkas di bagian "Berkas yang dibuat dan diubah".
- [ ] AC-17 **Pemeriksaan kode.** `tsc --noEmit -p tsconfig.json --incremental false` 0 galat, di salinan tanpa `next-env.d.ts`. ESLint `--max-warnings 0` pada semua berkas Jejak Setara: 0 masalah, tanpa `any`.
- [ ] AC-18 **Anggaran.** Kode layar pemain ≤ 200 KB gzip dan konsol ≤ 350 KB gzip, dicatat di laporan bersama ukuran huruf.
- [ ] AC-19 **Tangkapan layar.** Sepuluh tangkapan layar tersimpan di `docs/jejak-setara/tests/JS-01/`: `pemain-{ukuran}.png` dan `konsol-{ukuran}.png` untuk keempat ukuran, ditambah `pemain-memeriksa-1280x720.png` dan `pemain-belum-1280x720.png`.

## Rencana uji

### Uji unit (`app/jejak-setara/__tests__/kerangka.test.ts`, Vitest di Node)

1. Worker `GET /api/sehat`: status, isi, dan kelima tajuk (AC-3).
2. Worker `POST`, `PUT`, dan `DELETE` ke `/api/sehat`: 405, `Allow: GET`, galat persis (AC-4).
3. Worker `/api/ruang`, `/api/`, `/api/sehat/lagi`, dan `/ws/ruang/K7MPA` (dengan dan tanpa `Upgrade: websocket`): 404 `BELUM_TERSEDIA` dengan kelima tajuk (AC-4).
4. Worker meneruskan `/`, `/admin/`, dan `/tidak-ada` ke `ASSETS.fetch` tiruan, dan mengembalikan jawabannya apa adanya.
5. `PROTOKOL_VERSI` bernilai 1, dan `protokol` di jawaban Worker sama dengannya.
6. `TEKS` sama persis dengan tabel "Teks yang tampil (final)"; kedua `<title>` di `index.html` sama dengan tabel.
7. `jejak.css` memuat semua token Design System bagian 4 dengan nilai persis; token dasar sama dengan token `--ss-` di `game.css` Sehari Setara.
8. Kedua `index.html`: `lang="id"`, `<link rel="icon" href="data:,">`, dan skrip modul `./main.tsx`.
9. `_headers`: satu aturan `/*` dengan keempat tajuk persis.
10. `wrangler.jsonc`: nama, `main`, tanggal kompatibilitas, `assets`, dan `vars` persis.
11. `package.json`: kesepuluh skrip persis.
12. `bila-ada.mjs`, dijalankan sebagai proses anak di folder sementara: jalur `-`, jalur belum ada, jalur ada dengan perintah berkode 0, dan jalur ada dengan perintah berkode 3 (kode diteruskan).

### Uji ujung ke ujung (`e2e/jejak-setara/kerangka.uji.ts`)

1. Untuk `/` dan `/admin/` di keempat ukuran (731 × 411 memakai `isMobile` dan `hasTouch`): teks, `lang`, judul tab, "✓ Server siap", kedua huruf termuat (`document.fonts`), serta tidak ada galat atau peringatan konsol, respons 4xx atau 5xx, permintaan `favicon`, pelanggaran CSP (`securitypolicyviolation`), atau permintaan ke alamat lain. Tangkapan layar diambil (AC-5, AC-19).
2. Jawaban `/api/sehat` ditahan lewat `page.route`: "Memeriksa server…" tampil; tangkapan layar `pemain-memeriksa` (AC-6).
3. Jawaban `/api/sehat` dibatalkan, dijawab 500, dijawab teks bukan JSON, dijawab `{"ok":false,"protokol":1}`, dan dijawab `{"ok":true,"protokol":99}`: "! Server belum tersambung" (AC-6). Tangkapan layar `pemain-belum` dari kasus pertama.
4. Jawaban `/api/sehat` tidak pernah datang: "! Server belum tersambung" tampil paling lambat 6 detik sesudah halaman dibuka, memakai waktu sungguhan (AC-6).
5. Tanda ✓ dan ! ber-`aria-hidden="true"`, dan penanda ber-`role="status"` (AC-6).
6. Tajuk `/` dan `/admin/` (AC-8). Lewat `request`: `/api/sehat`, `POST /api/sehat`, `/api/ruang`, `/tidak-ada`, dan `/admin` tanpa mengikuti pengalihan (AC-3, AC-4).
7. Dua konteks bersamaan (AC-7).

### Perintah di tahap Test

`install --frozen-lockfile`; `content:check:jejak`; `test:jejak`; `test:jejak:server` (mencetak "Belum tersedia"); `build:jejak`; `test:e2e:jejak` dengan `JEJAK_CHROMIUM`; `test`; `RILIS=1 content:check`; `build:pages` dan perbandingan SHA-256 ke-178 berkas; `playwright test --list` Sehari Setara; `tsc`; ESLint; uji coba `dev:jejak` dengan `curl` di perintah yang sama (catatan lingkungan agen di `PLAN.md`); keenam skrip P-16 dan P-17; pembacaan YAML alur kerja dan keempat langkahnya di salinan bersih; `git status --ignored`; dan pencarian "Finder" serta "klik dua kali". `sim:beban` tidak wajib, karena JS-01 belum menyentuh protokol, inti ruang, atau kiriman ke D1 (AGENTS bagian 4.4).

### Daftar periksa manual (AGENTS bagian 9)

Tidak ada butir yang berlaku, karena belum ada permainan. Butir "Tidak ada nama asli siswa di layar, berkas ekspor, maupun log" terpenuhi dengan sendirinya: JS-01 tidak punya isian.
