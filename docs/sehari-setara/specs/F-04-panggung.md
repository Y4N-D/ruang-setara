# F-04 — Panggung: skala, lapisan, sprite, garis pindai, busur hari

| | |
|---|---|
| Status | Disetujui 22 Oktober 2026 (`Spesifikasi disetujui: F-04`, termasuk pratinjau ikon D-11) |
| Tanggal | 21 Oktober 2026 |
| Rencana | `docs/sehari-setara/PLAN.md`, entri F-04 (disetujui 21 Oktober 2026 dengan balasan `Setuju: F-04` dan `Izinkan dependensi: @playwright/test, @fontsource/press-start-2p, @fontsource/pixelify-sans`) |

## Ringkasan

F-04 membangun panggung permainan dan menampilkannya lewat **pratinjau panggung** di alamat `sehari-setara/#adegan-1` sampai `#adegan-6` (keputusan Gerbang 1 nomor 2). Isinya:

- Panggung logis 320×180 yang diskalakan, dengan latar, bayangan kaki, tokoh beranimasi, ikon emosi, vinyet, dan garis pindai.
- Bilah atas dengan busur hari. Warnanya mengikuti waktu adegan, dan ikon matahari atau bulan menandai titik jam berjalan.
- Pramuat gambar adegan berikutnya.
- Huruf Press Start 2P dan Pixelify Sans dari paket `@fontsource`.
- Uji ujung ke ujung dengan Playwright untuk pertama kalinya.

Layar kerangka F-01 tetap menjadi tampilan bawaan, ditambah tombol "Lihat pratinjau panggung". Game belum bisa dimainkan; narasi dan pilihan datang di F-05.

Dua hal lain ikut dikerjakan:

- **Ikon D-11** (`ui_matahari`, `ui_bulan`) sudah digambar dengan kit dalam peran Pembuat aset dan berstatus Ditinjau. Pratinjaunya ada di `docs/sehari-setara/preview/ikon_busur_hari.png`. Persetujuan spesifikasi ini sekaligus menyetujui kedua ikon.
- **Ralat uji F-12.** Tiga uji di `assets.test.ts` mewajibkan "belum ada berkas yang belum terdaftar". Akibatnya, aset yang masih ditinjau akan menggagalkan langkah "Uji game", padahal spesifikasi F-12 menyatakan berkas seperti itu hanya dilaporkan. Kesalahan ini tertangkap saat ikon D-11 dibangun dan diperbaiki di sini.

Asal setiap nilai ditandai:

| Tanda | Arti |
|---|---|
| **[Dokumen]** | Dari Design System, Architecture, atau PRD; bagiannya disebut |
| **[Pratinjau]** | Dari komposisi pratinjau adegan yang sudah disetujui (`PREVIEW_SCENES` di `build_assets.py`) |
| **[Berkas]** | Diukur dari PNG di repositori |
| **[Pemilik]** | Keputusan pemilik proyek di Gerbang 1 |
| **[DRAF]** | Usulan baru dari agen. Mohon ditinjau |

## Kaitan PRD

| Acuan | Yang dipenuhi F-04 |
|---|---|
| PRD bagian 10 | Layar 16:9 dengan bingkai `ink` untuk 4:3; uji di 1024×768, 1280×720, 1366×768, 1920×1080; `prefers-reduced-motion` dihormati; tanpa layanan pihak ketiga |
| PRD bagian 14 | Huruf piksel terpasang sejak awal, sehingga keterbacaannya bisa diuji di proyektor |
| FR-04 (sebagian) | Keenam adegan dan ketiga reaksinya bisa dilihat; belum bisa dimainkan |
| Design System bagian 1, 3, 6, 8 | Langit sehari, busur hari, kanvas 320×180, skala, garis lantai, lapisan, garis pindai, vinyet, piksel tajam, gerak sprite, kurangi gerak |
| Design System bagian 7 | Busur hari; tombol berstatus biasa, fokus/arah, dan terpilih |
| Architecture bagian 7, 8, 10, 12 | Rumus skala dan sprite; pramuat; `altText`; uji ujung ke ujung |
| Keputusan Gerbang 1 | Tiga dependensi; pratinjau lewat alamat; ikon matahari dan bulan; data bayangan dan kepala di manifest; sapuan ditunda ke F-05; cara uji |

## Perilaku

### Alamat dan layar

- Diberikan alamat tanpa tanda pagar, atau dengan tanda pagar yang tidak dikenal (misalnya `#adegan-9` atau `#lain`), ketika halaman dibuka, maka layar kerangka F-01 tampil dengan tombol kedua "Lihat pratinjau panggung" (`href="#adegan-1"`) sesudah "Kembali ke galeri".
- Diberikan alamat `#adegan-N` (N = 1–6), ketika halaman dibuka, maka pratinjau menampilkan adegan N dalam tampilan **situasi awal**: latar adegan dan pemeran `scene.cast`.
- Diberikan alamat `#adegan-N-a`, `#adegan-N-b`, atau `#adegan-N-c`, ketika halaman dibuka, maka pratinjau menampilkan **reaksi** pilihan itu: pemeran `choice.reaction` dan ikon emosi `choice.emote`.
- Diberikan pratinjau terbuka, ketika tanda pagar berubah (tautan diklik, alamat diketik, atau tombol Kembali browser), maka tampilan berganti tanpa memuat ulang halaman.
- Diberikan pratinjau terbuka, ketika "Tutup pratinjau" (`href="#"`) dipilih, maka layar kerangka tampil kembali dan fokus pindah ke tombol "Lihat pratinjau panggung".
- Diberikan layar kerangka, ketika "Lihat pratinjau panggung" dipilih, maka pratinjau adegan 1 tampil dan fokus pindah ke judul pratinjau. Berpindah tampilan lewat tombol di dalam pratinjau tidak memindahkan fokus.
- Diberikan layar kerangka yang baru dimuat, ketika Tab ditekan sekali, maka "Kembali ke galeri" mendapat fokus, sama seperti F-01.

### Tata letak dan skala

- Layar 16:9 dari F-01 (177,78u × 100u) dibagi menjadi tiga baris [Dokumen: Design System bagian 3]:
  - bilah atas 8u;
  - area panggung 62u;
  - panel bawah 30u.

  Panel samping kiri dan kanan (masing-masing minimal 30u) dikosongkan untuk F-06 dan F-07.
- Skala panggung k = `stageScale(177,78u − 60u, 62u)`, memakai rumus Architecture bagian 7. Karena layar selalu 16:9, k hanya bergantung pada tinggi layar. Hasilnya:

  | Ruang tampilan | 1u | k | Panggung |
  |---|---|---|---|
  | 1280×720 | 7,2 px | 2 | 640×360 |
  | 1366×768 | 7,68 px | 2 | 640×360 |
  | 1920×1080 | 10,8 px | 3 | 960×540 |
  | 1024×768 (layar 1024×576) | 5,76 px | 1,984 (pecahan) | 634,9×357,1 |

- Panggung berada di tengah area panggung, baik mendatar maupun tegak. k dihitung ulang setiap kali ukuran layar berubah.
- Tidak ada bilah gulir, dan tidak ada isi yang meluap dari panel bawah, pada keempat ukuran.

### Panggung

- **Lapisan** [Dokumen: Design System bagian 3]: latar z 0; bayangan kaki dan tokoh z 20, dengan semua bayangan digambar sebelum semua tokoh; ikon emosi z 30; vinyet dan garis pindai z 40. Lapisan properti depan (z 10) belum dipakai, karena belum ada asetnya.
- **Latar**: gambar 320×180 dari `backgroundFor(scene.bg)`.
- **Tokoh**: setiap `CastSlot` digambar dengan strip `spriteFor(char, pose)` berukuran bingkai w×h [Dokumen: Architecture bagian 7].
  - Posisi: kiri = `x − floor(w/2)`, atas = `157 − h`, dalam piksel logis bilangan bulat.
  - Tokoh yang menghadap kiri dicerminkan dengan `scaleX(-1)`.
- **Bayangan kaki** [Pratinjau]: setiap tokoh mendapat kotak `(w − 6)` × 2 piksel di kiri = `x − floor((w − 6)/2)`, atas = 155. Warnanya mengikuti latar lewat `shadowFor(scene.bg)` (tabel di bagian "Aset").
- **Ikon emosi** [DRAF], hanya di tampilan reaksi: gambar 8×8 `emoteIcons[icon]` di atas tokoh yang disebut `choice.emote.char`.
  - pusat = kiri tokoh + `head.x` bila menghadap kanan, atau kiri tokoh + `(w − head.x)` bila menghadap kiri;
  - kiri ikon = `Math.round(pusat − 4)`;
  - atas ikon = `(157 − h) + head.y − 10`.

  `head` adalah titik kepala strip yang tercatat di manifest (lihat "Aset"). Hasil untuk ke-18 reaksi tercantum di tabel "Posisi ikon emosi".
- **Garis pindai** [Dokumen: Architecture bagian 7]: pada bingkai panggung yang tidak ikut diskalakan, `repeating-linear-gradient(to bottom, transparent 0 2px, rgb(31 42 68 / 0.10) 2px 3px)`, yaitu satu garis piksel layar setiap 3 piksel layar.
- **Vinyet** [DRAF]: dua cincin keras di dalam panggung yang ikut diskalakan. Lebarnya 2 dan 4 piksel logis dari tepi, masing-masing `ink` 6%, sehingga tepi terluar paling gelap sekitar 12% (Design System bagian 6: ≤ 12%, tanpa bayangan lembut).
- **Piksel tajam**: `image-rendering: pixelated` untuk latar, sprite, dan ikon.
- **Aksesibilitas**: bingkai panggung memakai `role="img"` dengan `aria-label` berisi `scene.altText`. Di tampilan reaksi, label itu ditambah "Tampilan reaksi pilihan B." (sesuai pilihan). Gambar di dalam panggung disembunyikan dari pembaca layar.
- **Sebelum latar termuat**, bingkai panggung berwarna `mist`.

### Gerak

- Strip lebih dari satu bingkai beranimasi `ss-strip` selama `frames / fps` detik, dengan `steps(frames)` dan berulang terus [Dokumen: Architecture bagian 7; fps dari manifest F-12]. Strip satu bingkai tidak beranimasi.
- Diberikan `prefers-reduced-motion: reduce`, maka semua sprite diam di bingkai pertama dan denyut ikon busur hari berhenti. Tidak ada animasi CSS yang berjalan di panggung maupun bilah atas. Pengaturan "kurangi gerak" di dalam game menyusul di F-13.

### Bilah atas dan busur hari [DRAF]

- **Warna latar** mengikuti `scene.timeOfDay`. Warnanya diambil dari tabel langit Design System bagian 4, sesuai gambaran di bagian 1 ("pagi persik keemasan, siang biru terang, sore jingga, malam ungu kebiruan"):

  | Waktu | Latar bilah | Teks dan garis | Kontras teks |
  |---|---|---|---|
  | pagi | `#FFD9A8` (PAGI3) | `ink` | 10,7:1 |
  | siang | `#6EC6F2` (SIANG1) | `ink` | 7,5:1 |
  | sore | `#FFC27A` (SORE2) | `ink` | 9,0:1 |
  | malam | `#4A4F9C` (MALAM1) | `cream` | 6,8:1 |

- **Isi, dari kiri ke kanan**:
  - jam adegan (`scene.clock`, Press Start 2P 2,8u);
  - busur hari;
  - "Adegan n/6" di ujung kanan (Pixelify Sans 3,1u).

  Jarak tepi kiri dan kanan 3u, dan jarak jam ke busur 3u. Semua isi berada di tengah bilah secara tegak.
- **Busur hari** adalah gambar logis 136×22 yang diskalakan dengan k yang sama dengan panggung, sehingga pikselnya setajam panggung.
  - Enam titik berpusat di x = 8, 32, 56, 80, 104, 128 dan y = 14, 11, 10, 10, 11, 14, membentuk lengkung rendah.
  - Titik yang berurutan disambung garis 1 piksel (Bresenham) berwarna teks bilah.
  - Titik yang sudah lewat: lingkaran piksel 6×6 bergaris warna teks bilah, berisi `sun`.
  - Titik berikutnya: lingkaran yang sama tanpa isi.
  - Titik berjalan: ikon 16×16 `ui_matahari` (pagi, siang, sore) atau `ui_bulan` (malam) di `(x − 8, y − 8)`.
  - Denyut pelan: ikon naik 1 piksel logis selama 0,8 detik lalu kembali selama 0,8 detik, berulang. Denyut berhenti bila kurangi gerak aktif.
- **Aksesibilitas**: bilah memakai `role="img"` dengan label "Pukul 06.15, adegan 1 dari 6". Teks dan gambar di dalamnya disembunyikan dari pembaca layar.

### Panel bawah pratinjau [DRAF]

- **Baris 1**: judul adegan (`scene.title`, `<h1>`, Press Start 2P 2,8u, `ink`), diikuti keterangan tampilan (Pixelify Sans 2,5u, `dusk`).
- **Baris 2**: navigasi dengan dua kelompok, masing-masing berlabel (Pixelify Sans 2,5u, `dusk`).
  - "Adegan": tombol 1 sampai 6.
  - "Tampilan": "Situasi", "Reaksi A", "Reaksi B", "Reaksi C".
- **Baris 3**: "Tutup pratinjau" dan "Kembali ke galeri" (`href="../"`).
- Semua tombol navigasi adalah tautan `<a>` bergaya `ss-chip`: bingkai piksel F-01 (garis `ink` 2 px, sudut terpotong, sorotan putih), Pixelify Sans 2,8u, dan padding 0,8u × 2u. Ruang kursor ▶ berada di dalam padding kiri, jadi lebar tombol tidak berubah saat fokus.
- Teks rata kiri dan jarak tepi 6u [Dokumen: Design System bagian 3].

### Pramuat

- Diberikan adegan N tampil (N < 6), ketika pratinjau dirender, maka semua gambar `sceneAssets(adegan N+1)` dimuat dan di-*decode* (`img.decode()`) di latar belakang [Dokumen: Architecture bagian 8].
- Setiap URL dimuat paling banyak sekali per halaman.
- Kegagalan *decode* diabaikan diam-diam: tidak memunculkan galat di layar maupun konsol.

### Huruf

- `github-pages/sehari-setara/main.tsx` mengimpor `@fontsource/press-start-2p/latin-400.css` dan `@fontsource/pixelify-sans/latin-400.css` [Pemilik].
- Berkas huruf (woff2 dan woff) keluar di `dist-pages/assets/` dan dimuat dari situs sendiri, tanpa permintaan ke luar.
- Galeri tidak memuat huruf ini.

### Uji aset (perluasan dan ralat F-12)

- Diberikan titik kepala di manifest yang tidak sama dengan hasil pengukuran PNG, ketika `test` dijalankan, maka uji gagal dengan pesan yang menyebut strip dan nilai yang benar (lihat "Teks yang tampil").
  - Cara mengukur: bingkai pertama strip; `head.y` = baris teratas yang punya piksel tak transparan; `head.x` = `(kolom terkiri + kolom terkanan + 1) / 2` dari piksel tak transparan di enam baris mulai `head.y`.
- Diberikan latar tanpa warna bayangan, atau warna bayangan yang tidak punya aturan `.ss-shadow[data-tone="…"]` di `game.css`, ketika `test` dijalankan, maka uji gagal.
- Diberikan PNG di subfolder `assets/` yang belum terdaftar di manifest, ketika `test` dijalankan, maka uji tetap lulus dan ringkasan mendaftar berkas itu (ralat F-12).

## Status antarmuka

| Bagian | Status | Tampilan |
|---|---|---|
| Tombol `ss-button` di layar kerangka | Biasa, fokus/arah, warna paksa | Sama dengan F-01. Kedua tombol berada di satu baris berjarak 3u, dan pindah ke baris berikutnya bila tidak muat |
| Tombol `ss-chip` | Biasa | Latar `cream`, teks `ink`, bingkai piksel |
| | Fokus (`:focus-visible`) atau arah (tetikus, hanya di perangkat ber-*hover*) | Latar `sun`, kursor ▶ tampil di padding kiri |
| | Terpilih (`aria-current="page"`: adegan dan tampilan yang sedang dilihat) | Latar `sun` dan garis tampak 4 px (bingkai 2 px ditambah cincin dalam 2 px `ink`), tanpa perubahan ukuran |
| | Nonaktif | Tidak berlaku |
| | Mode warna paksa | Sudut terpotong dimatikan; fokus terlihat lewat garis luar warna sistem |
| Panggung | Biasa | Seperti bagian "Panggung" |
| | Sebelum latar termuat | Bingkai `mist` |
| | Galat (gambar gagal dimuat) | Bingkai `mist` tetap tampil, label `role="img"` tetap ada. Kejadian ini ditangkap uji ujung ke ujung sebagai respons 4xx |
| | Kurangi gerak | Sprite di bingkai pertama, tanpa animasi |
| Bilah atas | Pagi, siang, sore, malam | Seperti tabel warna di bagian "Bilah atas" |
| | Kurangi gerak | Ikon tanpa denyut |
| Layar 4:3 | — | Bingkai `ink` di atas dan bawah, seperti F-01 |
| Kosong | — | Tidak berlaku: setiap adegan punya latar dan minimal satu tokoh |

## Teks yang tampil (final)

Semua teks baru **[DRAF]** dan berasal dari `app/sehari-setara/content/copy.ts`, kecuali judul adegan, jam, dan teks alternatif yang diambil dari `scenes.ts`.

| Tempat | Teks |
|---|---|
| Tombol kedua layar kerangka | Lihat pratinjau panggung |
| Bilah atas, kanan | Adegan 1/6 (angka mengikuti adegan) |
| Bilah atas, label pembaca layar | Pukul 06.15, adegan 1 dari 6 |
| Panel bawah, judul | Judul adegan, misalnya "Pagi di rumah" |
| Panel bawah, keterangan situasi | Pratinjau panggung: situasi awal. |
| Panel bawah, keterangan reaksi | Pratinjau panggung: reaksi pilihan A. (atau B, C) |
| Label navigasi (`aria-label`) | Navigasi pratinjau |
| Label kelompok | Adegan · Tampilan (dua label terpisah) |
| Tombol adegan | 1, 2, 3, 4, 5, 6; label pembaca layar "Adegan 1: Pagi di rumah" dan seterusnya |
| Tombol tampilan | Situasi · Reaksi A · Reaksi B · Reaksi C |
| Tombol tutup | Tutup pratinjau |
| Tombol galeri | Kembali ke galeri (teks F-01) |
| Tambahan label panggung di tampilan reaksi | Tampilan reaksi pilihan A. (atau B, C) |

Judul tab dan deskripsi halaman tidak berubah.

Pesan uji untuk pengembang:

| Aturan | Contoh pesan |
|---|---|
| Titik kepala tidak cocok | `Manifest: sprites.dimas.happy titik kepala (14, 1), seharusnya (19, 1) menurut gambar.` |
| Latar tanpa warna bayangan | `Manifest: floorShadows belum punya warna untuk bg_s7_contoh.` |
| Warna bayangan tanpa aturan CSS | `game.css: tidak ada aturan .ss-shadow[data-tone="dusk"].` |

## Data dan aksi

Tidak ada aksi reducer baru, dan `GameState` tidak berubah. Pratinjau tidak memakai mesin permainan. Keadaannya hanya berasal dari tanda pagar di alamat.

### `app/sehari-setara/ui/layout.ts` (fungsi murni, diuji unit)

| Ekspor | Isi |
|---|---|
| `STAGE`, `LAYOUT` | `{ w: 320, h: 180, floorTop: 157, shadowY: 155 }`; `{ barU: 8, stageU: 62, bottomU: 30, sideU: 30 }` |
| `stageScale(availW, availH)` | Persis Architecture bagian 7 |
| `stageScaleForScreen(screenHeightPx)` | `stageScale((1600/9 − 60) × u, 62 × u)` dengan `u = screenHeightPx / 100` |
| `spriteBox(slot, strip)` | `{ left, top, w, h, mirrored }` |
| `shadowBox(slot, strip)` | `{ left, top: 155, width: w − 6, height: 2 }` |
| `emoteBox(slot, strip)` | `{ left, top }` sesuai rumus ikon emosi |
| `ARC`, `arcPointStates(current)` | Titik busur `{ x, y }` dan status `"lewat" \| "berjalan" \| "berikutnya"` |
| `arcTrackPixels()` | Piksel garis Bresenham antartitik |
| `PreviewRoute`, `parsePreviewHash(hash, sceneCount)`, `previewHash(route)` | `PreviewRoute = { sceneIndex: number; view: "situasi" \| ChoiceId }`; `null` untuk alamat yang tidak dikenal |

### Komponen

- `ui/Stage.tsx`: `Stage({ scene, cast, emote, scale, animate })`.
- `ui/Sprite.tsx`: `Sprite({ slot, strip, animate })`, dengan `data-char` dan `data-pose` untuk uji.
- `ui/DayArc.tsx`: `DayArc({ scenes, sceneIndex, scale, animate })`.
- `ui/StagePreview.tsx`: layar pratinjau. Komponen ini mengukur tinggi layar untuk k (`ResizeObserver`), membaca `prefers-reduced-motion`, dan memanggil pramuat.
- `ui/preload.ts`: `preloadScene(scene)`.
- `Game.tsx`: membaca `location.hash` dan mendengarkan `hashchange`, lalu menampilkan layar kerangka atau `StagePreview`.

### Manifest (`app/sehari-setara/assets/manifest.ts`)

- `SpriteStrip` mendapat `head: { x: number; y: number }`, yaitu titik kepala dalam koordinat bingkai saat menghadap kanan (tabel di "Aset").
- Tipe baru `ShadowTone = "wood-d" | "dusk" | "slate" | "wood"` dan ekspor `floorShadows` (setiap kunci `backgrounds` → `ShadowTone`, diperiksa `satisfies`).
- Fungsi baru `backgroundFor(key)` dan `shadowFor(key)`. Keduanya memakai pencarian aman yang sama dengan `spriteFor`.
- `icons` bertambah `matahari` dan `bulan` (`ui/ui_matahari.png`, `ui/ui_bulan.png`).

### Gaya (`app/sehari-setara/styles/game.css`)

- Kelas baru berawalan `ss-`: `ss-preview`, `ss-topbar`, `ss-dayarc`, `ss-stage-area`, `ss-stage-frame`, `ss-stage`, `ss-sprite`, `ss-shadow`, `ss-emote`, `ss-preview-panel`, `ss-chip`, dan kelas pendukungnya.
- Keyframes `ss-strip` (Architecture bagian 7) dan `ss-pulse`.
- Warna khusus bilah dan bayangan ditulis lewat atribut `data-time` dan `data-tone`, dengan nilai hex dari palet. Tidak ada token `:root` baru, jadi uji warna F-12 tetap berlaku.

### Dependensi, skrip, dan berkas uji

- `package.json` (versi persis) [Pemilik]:
  - `dependencies`: `"@fontsource/pixelify-sans": "5.3.0"`, `"@fontsource/press-start-2p": "5.3.0"`;
  - `devDependencies`: `"@playwright/test": "1.56.1"`;
  - skrip `"test:e2e": "playwright test"`.

  `pnpm-lock.yaml` mengikuti hasil `pnpm add`, sesuai percobaan saat Plan.
- `playwright.config.ts`:
  - `testDir: "e2e"`, `outputDir: "test-results"`, satu *worker*, reporter `list`, Chromium.
  - `webServer` menjalankan `npx pnpm@11.25.0 build:pages && node scripts/game/serve-subpath.mjs --port 4180` [Dokumen: Architecture bagian 12].
  - `baseURL` = `http://127.0.0.1:4180/ruang-setara/`.
- `e2e/sehari-setara.spec.ts`: uji ujung ke ujung (lihat "Rencana uji"). Tangkapan layar ditulis ke `test-results/tangkapan/`.
- `.gitignore`: `/test-results/` dan `/playwright-report/`.
- `app/sehari-setara/__tests__/layout.test.ts`: uji unit `layout.ts`.
- `app/sehari-setara/__tests__/asset-checks.ts` dan `assets.test.ts`:
  - pembaca PNG kecil (tanda tangan, IHDR, IDAT dengan `node:zlib`, dan pembalik penyaringan baris) untuk mengukur titik kepala;
  - pemeriksaan `floorShadows` dan aturan CSS-nya;
  - ralat tiga uji F-12.

  Tidak ada dependensi baru untuk ini.

### Perubahan dokumen (Build)

- `Architecture.md` naik ke versi 0.6:
  - keputusan **A10** (`@playwright/test` 1.56.1, uji ujung ke ujung hanya di lingkungan agen) dan **A11** (huruf dari `@fontsource` 5.3.0, subset latin berbobot 400);
  - bagian 3: berkas `ui/`, `e2e/`, dan `playwright.config.ts`;
  - bagian 7: tata letak layar, bayangan kaki, ikon emosi, vinyet, busur hari, dan rute pratinjau;
  - bagian 8: tambahan manifest dan pramuat;
  - bagian 12: cakupan uji ujung ke ujung F-04.
- `Design_System.md` naik ke versi 0.4:
  - bagian 4: baris kontras "`cream` di atas langit malam `#4A4F9C` 6,8:1, untuk teks bilah atas malam";
  - bagian 7: baris busur hari (warna bilah per waktu, ikon matahari dan bulan, denyut);
  - bagian 11: ikon matahari dan bulan masuk daftar ikon antarmuka 16×16.
- `Daftar_Aset.md`: status D-11 menjadi Disetujui bila spesifikasi ini disetujui.
- `assets/CREDITS.md`: dua baris D-11 dengan penyetuju YAN, seperti entri lain.
- `PLAN.md`:
  - status F-04;
  - baris tabel dependensi untuk Playwright dan huruf;
  - catatan Plan F-05 tentang sapuan pergantian adegan (keputusan Gerbang 1 nomor 5).
- `tests/F-12-hasil.md`: catatan ralat di bagian Temuan.

## Aset

### Ikon baru D-11 (Ditinjau, disetujui bersama spesifikasi ini)

| Berkas | Ukuran | Isi | Kunci manifest |
|---|---|---|---|
| `ui/ui_matahari.png` | 16×16 | Matahari `sun` dengan bayangan `mango` di kanan bawah, kilau putih, dan delapan sinar; garis luar `ink` | `icons.matahari` |
| `ui/ui_bulan.png` | 16×16 | Bulan sabit `cream` yang terbuka ke kanan atas, dengan lengkung dalam `lampu`; garis luar `ink` | `icons.bulan` |

Keduanya dibangun `build_assets.py` (lulus pemeriksaan palet, transparansi, dan ukuran; 252 B dan 169 B) di file kit `ikon.py`. Pratinjaunya ada di `docs/sehari-setara/preview/ikon_busur_hari.png`.

### Warna bayangan kaki per latar [Pratinjau]

| Latar | `ShadowTone` | Hex |
|---|---|---|
| `bg_s1_rumah_pagi`, `bg_s6_kamar_malam` | `wood-d` | `#8A5A33` |
| `bg_s2_jalan_pagi` | `dusk` | `#3A4A6B` |
| `bg_s3_kelas_siang`, `bg_s5_kampung_sore` | `slate` | `#6B7A99` |
| `bg_s4_koridor_siang`, `bg_title` | `wood` | `#C98B4F` |

### Titik kepala setiap strip [Berkas]

Koordinat dalam bingkai, menghadap kanan; `x` boleh bernilai setengah.

| Strip | head.x | head.y | | Strip | head.x | head.y |
|---|---|---|---|---|---|---|
| nara.idle | 13 | 2 | | sinta.idle | 13,5 | 3 |
| nara.talk | 13 | 2 | | sinta.talk | 13,5 | 3 |
| nara.happy | 13 | 2 | | sinta.happy | 13,5 | 3 |
| nara.sad | 13 | 3 | | sinta.sad | 13,5 | 4 |
| nara.walk | 13 | 2 | | ratih.idle | 14 | 4 |
| nara.phone | 13 | 2 | | ratih.talk | 14 | 4 |
| ibu.talk | 14 | 0 | | komang.idle | 13 | 4 |
| ibu.happy | 14 | 0 | | komang.sad | 13 | 5 |
| ibu.sad | 14 | 0 | | komang.happy | 13 | 4 |
| gita.idle | 12 | 1 | | made.talk | 14 | 4 |
| gita.happy | 12 | 1 | | made.happy | 14 | 4 |
| gita.sad | 12 | 2 | | made.sad | 14 | 5 |
| dimas.motor | 19 | 1 | | bayu.idle | 14 | 4 |
| dimas.happy | 19 | 1 | | bayu.happy | 14 | 4 |
| dimas.sad | 19 | 2 | | siswa.merekam | 13 | 0 |
| warga.a | 14 | 5 | | siswa.tertawa | 12 | 2 |
| warga.b | 13,5 | 3 | | | | |

Kepala Dimas berada 9 piksel di kiri tengah bingkai karena ia duduk di atas motor.

### Posisi ikon emosi [DRAF]

Posisi dihitung dari rumus di bagian "Panggung", dalam piksel logis.

| Reaksi | Ikon | Di atas | Kiri | Atas |
|---|---|---|---|---|
| s1 A | keringat | Ibu (sad, x 206, kiri) | 203 | 79 |
| s1 B | hati | Gita (happy, x 124, kanan) | 120 | 100 |
| s1 C | keringat | Gita (sad, x 124, kanan) | 120 | 101 |
| s2 A | seru | Nara (sad, x 228, kiri) | 224 | 88 |
| s2 B | hati | Dimas (happy, x 168, kanan) | 155 | 86 |
| s2 C | keringat | Nara (sad, x 228, kiri) | 224 | 88 |
| s3 A | keringat | Sinta (sad, x 186, kiri) | 182 | 89 |
| s3 B | hati | Sinta (happy, x 186, kiri) | 182 | 88 |
| s3 C | keringat | Nara (sad, x 140, kanan) | 136 | 88 |
| s4 A | seru | Komang (sad, x 64, kanan) | 60 | 90 |
| s4 B | hati | Komang (happy, x 112, kanan) | 108 | 89 |
| s4 C | keringat | Komang (sad, x 64, kanan) | 60 | 90 |
| s5 A | seru | Bayu (idle, x 40, kanan) | 35 | 83 |
| s5 B | hati | Bayu (happy, x 118, kanan) | 113 | 83 |
| s5 C | keringat | Pak Made (sad, x 256, kanan) | 251 | 84 |
| s6 A, B, C | seru, hati, keringat | Nara (phone, x 168, kanan) | 164 | 87 |

### Aset lain

Semua latar, strip, dan ikon emosi yang dipakai sudah Disetujui dan terdaftar di manifest F-12. Posisi tokoh di `scenes.ts` tidak berubah.

## Di luar cakupan

- Sapuan blok piksel saat pergantian adegan (keputusan Gerbang 1 nomor 5, ditunda ke F-05). Di pratinjau, adegan berganti seketika.
- Narasi, pertanyaan, pilihan, dan pintasan keyboard permainan (F-05).
- Indikator dan kartu dampak (F-06); tim, pengatur waktu, dan isi panel samping (F-07); kuis (F-08); layar akhir dan timbangan (F-09); layar judul (F-10).
- Pengaturan kurangi gerak di dalam game, suara, dan layar penuh (F-13). F-04 hanya mengikuti pengaturan sistem.
- Waktu tampil reaksi (1–1,5 detik) dan ikon emosi yang muncul lalu hilang (F-05/F-06). Di pratinjau, reaksi tampil diam.
- Bingkai piksel panel samping dan panel narasi, termasuk keputusan satuan bingkai (catatan Plan F-05).
- Lapisan properti depan, karena belum ada asetnya.
- Perbaikan keranjang Ibu dan varian pakaian rumah Nara (pembuat aset, menunggu keputusan pemilik).
- Mekanisme placeholder (keputusan Gerbang 1 F-12 nomor 5).
- Menjalankan Playwright di CI (Architecture bagian 4).
- Perubahan pada `engine/`, `content/scenes.ts`, `vite.pages.config.ts`, file galeri, dan workflow.

## Kriteria penerimaan

- [ ] AC-1 **Dependensi**: `package.json` hanya bertambah `@fontsource/pixelify-sans` 5.3.0, `@fontsource/press-start-2p` 5.3.0, `@playwright/test` 1.56.1 (versi persis), dan skrip `test:e2e`. `install --frozen-lockfile` berhasil, dan lockfile lolos kebijakan rantai pasok.
- [ ] AC-2 **Huruf**: di halaman permainan, `document.fonts.check` bernilai benar untuk "Press Start 2P" dan "Pixelify Sans". Berkas huruf dimuat dari `/ruang-setara/assets/`, tanpa permintaan ke host lain. Halaman galeri tidak memuat berkas huruf itu.
- [ ] AC-3 **Layar kerangka**:
  - teks F-01 tidak berubah;
  - ada tombol "Lihat pratinjau panggung" (`href="#adegan-1"`) sesudah "Kembali ke galeri";
  - Tab pertama tetap memfokuskan "Kembali ke galeri";
  - masih tanpa animasi.
- [ ] AC-4 **Alamat**:
  - ke-24 alamat sah (`#adegan-1` sampai `#adegan-6`, masing-masing dengan `-a`, `-b`, `-c`) menampilkan adegan dan tampilan yang benar;
  - `#adegan-0`, `#adegan-7`, `#adegan-1-d`, `#lain`, dan alamat kosong menampilkan layar kerangka;
  - pergantian tanda pagar tidak memuat ulang halaman;
  - "Tutup pratinjau" kembali ke layar kerangka dengan fokus pada "Lihat pratinjau panggung", dan masuk ke pratinjau memindahkan fokus ke judulnya.
- [ ] AC-5 **Tata letak dan skala**:
  - pada 1280×720, 1366×768, 1920×1080, dan 1024×768, tinggi bilah atas 8u dan panel bawah 30u (±1 px);
  - bingkai panggung berukuran 320k × 180k (±1 px), dengan k = 2, 2, 3, dan 1,984 (±0,005), di tengah area panggung (±1 px);
  - tanpa bilah gulir, dan panel bawah tidak meluap.
- [ ] AC-6 **Tokoh dan bayangan**: di setiap adegan dan tampilan, pada 1280×720 dan 1024×768:
  - jumlah sprite sama dengan jumlah pemeran, dengan `data-char` dan `data-pose` berurutan sesuai naskah;
  - tepi bawah setiap sprite di `157k` dan tepi kirinya di `(x − floor(w/2))·k` (±1 px), dengan w = lebar terukur ÷ k;
  - sprite yang menghadap kiri bertransformasi `scaleX(-1)`;
  - setiap bayangan berada di `155k`, setinggi `2k`, dan selebar `(w − 6)·k` (±1 px), dengan warna sesuai tabel bayangan.
- [ ] AC-7 **Ikon emosi**: di ke-18 tampilan reaksi, ikon dan posisinya sama dengan tabel "Posisi ikon emosi" (±1 px setelah dibagi k). Di tampilan situasi tidak ada ikon emosi.
- [ ] AC-8 **Lapisan dan efek**:
  - urutan z: latar < bayangan dan tokoh < ikon emosi < vinyet dan garis pindai;
  - garis pindai di bingkai memakai gradien sesuai spesifikasi;
  - vinyet berupa dua cincin `ink` 6%;
  - `image-rendering` bernilai `pixelated` untuk latar, sprite, dan ikon.
- [ ] AC-9 **Gerak**:
  - tanpa kurangi gerak, setiap sprite lebih dari satu bingkai punya animasi berdurasi `frames/fps` detik, dan ikon busur hari berdenyut;
  - sprite satu bingkai tanpa animasi;
  - dengan `prefers-reduced-motion: reduce`, `document.getAnimations()` kosong di pratinjau.
- [ ] AC-10 **Bilah atas**: di keenam adegan:
  - warna latar, warna teks, jam, dan "Adegan n/6" sesuai spesifikasi, dengan kontras teks terukur ≥ 4,5:1;
  - busur memiliki n−1 titik lewat, satu ikon berjalan (matahari di adegan 1–5, bulan di adegan 6), dan 6−n titik berikutnya;
  - label pembaca layar sesuai teks final.
- [ ] AC-11 **Pramuat**: saat `#adegan-N` dibuka (N < 6), browser meminta latar adegan N+1 sebelum adegan itu dibuka. Tidak ada galat konsol.
- [ ] AC-12 **Manifest dan uji aset**:
  - titik kepala ke-33 strip sama dengan hasil pengukuran PNG;
  - `floorShadows` lengkap untuk ketujuh latar, dan setiap nada punya aturan CSS;
  - `backgroundFor`, `shadowFor`, dan `spriteFor` mengembalikan `undefined` untuk kunci yang tidak ada (termasuk `constructor`);
  - contoh pelanggaran (titik kepala salah, latar tanpa bayangan, aturan CSS hilang) tertangkap dengan pesan sesuai spesifikasi.
- [ ] AC-13 **Ralat F-12**: dengan PNG tambahan yang belum terdaftar di `assets/ui/`, `test` tetap lulus dan ringkasan mendaftarnya. Contoh dalam uji tidak lagi bergantung pada isi folder.
- [ ] AC-14 **Ikon D-11**: `build_assets.py` lulus dengan kedua ikon (16×16, palet, tanpa piksel semi-transparan). Keduanya terdaftar di manifest dan `CREDITS.md`, dan berstatus Disetujui di `Daftar_Aset.md`.
- [ ] AC-15 **Uji unit `layout.ts`**:
  - `stageScale` untuk keempat ukuran dan titik batas 0,75;
  - posisi sprite, bayangan, dan ikon emosi, termasuk Dimas menghadap kanan dan kiri;
  - titik dan status busur hari;
  - piksel garis busur;
  - pembaca alamat.
- [ ] AC-16 **Uji ujung ke ujung**: `npx pnpm@11.25.0 test:e2e` lulus. Di halaman permainan (layar kerangka dan pratinjau) dan galeri pada keempat ukuran: 0 galat konsol dan 0 respons 4xx/5xx. Navigasi pratinjau bisa dijalankan dengan Tab dan Enter, dengan fokus yang terlihat.
- [ ] AC-17 **Build**:
  - `build:pages` lulus;
  - JS permainan ≤ 150 KB gzip, tanpa penanda `__THREE__`;
  - semua `src`/`href` di HTML permainan relatif;
  - berkas JS dan CSS milik galeri (`main-*`) identik dengan sebelum F-04.
- [ ] AC-18 **Pemeriksaan kode**: `tsc --noEmit` seluruh proyek tanpa galat. ESLint `--max-warnings 0` pada semua file kode baru dan yang diubah. Tidak ada `any`.
- [ ] AC-19 **Dokumen dan cakupan**: perubahan dokumen di bagian "Perubahan dokumen" ada dan sesuai. `git diff --name-status` hanya memuat file yang disebut spesifikasi ini dan tangkapan layar bukti di `tests/F-04/`.

## Rencana uji

| Langkah | Cara | Kriteria |
|---|---|---|
| 1 | `pnpm add` sesuai AC-1, lalu `install --frozen-lockfile`; periksa diff `package.json` dan lockfile | AC-1 |
| 2 | `content:check` dan `test` (termasuk `layout.test.ts` dan uji aset yang diperluas) | AC-12, AC-13, AC-15 |
| 3 | Ralat F-12: salin sementara satu PNG ke `assets/ui/`, jalankan `test` (harus lulus dan melaporkan berkas itu), lalu hapus salinannya | AC-13 |
| 4 | `python scripts/game/art/build_assets.py`; pastikan PNG lain tidak berubah | AC-14 |
| 5 | `build:pages`; periksa ukuran gzip, penanda three.js, path relatif, dan berkas `main-*` galeri | AC-17 |
| 6 | `test:e2e`, yang membangun lalu menyajikan `dist-pages/` di `/ruang-setara/`: layar kerangka, ke-24 alamat pratinjau di 1280×720 dan 1024×768, skala di empat ukuran, kurangi gerak, pramuat, keyboard, huruf, dan galeri | AC-2 sampai AC-11, AC-16 |
| 7 | Salin tangkapan layar terpilih ke `docs/sehari-setara/tests/F-04/`: layar kerangka 1280×720; adegan 1–6 di 1280×720; adegan 1 dan 6 di 1024×768; adegan 3 di 1920×1080; reaksi 2B dan 4B di 1280×720 | Bukti AC-5 sampai AC-10 |
| 8 | `tsc --noEmit -p tsconfig.json --incremental false` dan ESLint | AC-18 |
| 9 | `git diff --name-status` terhadap keadaan F-12, dan periksa diff dokumen | AC-19 |
| 10 | Daftar periksa manual AGENTS bagian 9: tampilan di 1024×768 dan 1920×1080 (dari tangkapan layar) dan kurangi gerak (dari langkah 6). Keterbacaan di proyektor dan laptop kelas bawah dicatat "belum diuji", untuk dicek pemilik proyek | — |

Hasil uji ditulis di `docs/sehari-setara/tests/F-04-hasil.md` (templat 11.3).
