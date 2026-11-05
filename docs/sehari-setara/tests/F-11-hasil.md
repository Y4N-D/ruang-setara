# Hasil uji F-11 — 5 November 2026

Fitur: integrasi dengan galeri Ruang Setara, layar "Tentang", dan rilis 1.0 ([spesifikasi](../specs/F-11-integrasi-galeri-rilis.md)). Laporan ini memuat **bagian A** (uji daftar centang dan baris rujukan PRD) dan **bagian B** (tautan galeri, pemeriksaan ketat di CI, layar "Tentang", dan pemeriksaan rilis 1.0). Bagian B diuji untuk ditinjau; ZIP B final menunggu verifikasi ke-14 rujukan.

Lingkungan: Node 22.23.4 dan pnpm 11.25.0, di salinan repositori dari ZIP `main` 5 November 2026 (commit `4778284`, ditambah dokumen Gerbang 1 dan Gerbang 2 bagian A), cabang `fitur/F-11-integrasi-galeri-rilis`. Uji ujung ke ujung tidak dijalankan untuk bagian A (keputusan V-4), karena ke-178 berkas yang terbit identik byte (AC-A9).

## Bagian A

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-A1 Isi daftar tidak menahan uji biasa | Lulus | `content.test.ts`, lima uji "daftar … hanya mengubah laporan (AC-5)": semua kotak kosong, lima kotak pertama dicentang, semua dicentang, semua dicentang dengan teks R-04 rusak, dan teks kosong menghasilkan 14, 9, 0, 1, dan 14 rujukan belum terverifikasi, dengan pesan "Rilis diblokir: n rujukan belum terverifikasi." atau tanpa pesan bila 0. Dengan daftar asli, `test` dan `content:check` lulus dan melaporkan "Verifikasi rujukan: 0 dari 14 terverifikasi." |
| AC-A2 Daftar diubah di salinan | Lulus | Salinan di luar repositori, `vitest` pada `content.test.ts`: 5 kotak dicentang, biasa kode 0 ("5 dari 14") dan `RILIS=1` kode 1 ("Rilis diblokir: 9 …"); 14 kotak, keduanya kode 0 ("14 dari 14"); 14 kotak dengan baris R-04 bertuliskan "UUD 1945", biasa kode 0 ("13 dari 14") dan `RILIS=1` kode 1 ("… 1 …"); berkas dihapus, biasa kode 0 ("0 dari 14") dan `RILIS=1` kode 1 ("… 14 …"). `Verifikasi_Rujukan.md` repositori tidak berubah |
| AC-A3 Mode rilis pada daftar asli | Lulus | `RILIS=1 npx pnpm@11.25.0 content:check` kode 1: "Rilis diblokir: 14 rujukan belum terverifikasi." |
| AC-A4 PRD bagian 8 | Lulus | `git diff -U0` `PRD.md`: tepat tujuh baris bagian 8 berubah, yaitu kalimat status dan keenam baris "Rujukan:", dan teksnya sama persis dengan tabel spesifikasi. Baris lain bagian 8 tidak berubah |
| AC-A5 Uji rujukan PRD | Lulus | Uji AC-2 "… serta rujukan sama dengan PRD" lulus. Uji "baris rujukan PRD yang berbeda atau hilang tertangkap" (teks rujukan adegan 1 diubah di salinan PRD; baris rujukan adegan 1 dihapus) dan mutasi "urutan rujukan" (pilihan A adegan 5 dibalik) menghasilkan "Adegan s1, pilihan A: rujukan berbeda dengan PRD.", "Adegan s1: baris rujukan PRD tidak terbaca.", dan "Adegan s5, pilihan A: rujukan berbeda dengan PRD." Di salinan, menukar urutan dua rujukan adegan 1 di PRD menghasilkan pesan untuk pilihan A, B, dan C |
| AC-A6 PRD bagian 17 | Lulus | Baris 22 Okt 2026 tepat sesudah baris terakhir 21 Okt 2026, dan baris 5 Nov 2026 sesudah baris terakhir 4 Nov 2026; teks keduanya sama dengan spesifikasi |
| AC-A7 Spesifikasi F-03 | Lulus | Baris "Revisi", aturan 12, AC-5, dan subbagian riwayat "5 November 2026: uji daftar centang dan rujukan PRD (F-11 bagian A)" sesuai spesifikasi |
| AC-A8 Cakupan dan jumlah uji | Lulus | `git diff --name-status` bagian A: `content.test.ts`, `schema.ts`, `PRD.md`, dan spesifikasi F-03, ditambah `PLAN.md`, spesifikasi F-11, dan laporan ini. `references.ts`, `scenes.ts`, `roles.ts`, `Verifikasi_Rujukan.md`, `package.json`, `pnpm-lock.yaml`, workflow, dan berkas galeri tidak berubah (`git diff --quiet`). `test`: 14 berkas, 294 lulus, 1 dilewati (sebelumnya 288) |
| AC-A9 Halaman yang terbit | Lulus | `build:pages` lulus, dan sidik jari SHA-256 ke-178 berkas `dist-pages/` identik dengan build `main`, sekali sesudah kode dan sekali sesudah semua dokumen bagian A, termasuk laporan ini |
| AC-A10 Pemeriksaan kode | Lulus | `tsc --noEmit` 0 galat, di salinan tanpa `next-env.d.ts`; ESLint `--max-warnings 0` 0 masalah pada `content.test.ts` dan `schema.ts`; tanpa `any` |

### Perintah yang dijalankan dan hasilnya

| Perintah | Hasil |
|---|---|
| `npx pnpm@11.25.0 install --frozen-lockfile` | Lulus (15 detik); lockfile tidak berubah |
| `npx pnpm@11.25.0 test` | Lulus: 14 berkas, 294 uji, 1 dilewati (6 uji baru, 1 uji lama diganti) |
| `npx pnpm@11.25.0 content:check` | Lulus: 42 uji, 1 dilewati; "Verifikasi rujukan: 0 dari 14 terverifikasi." |
| `RILIS=1 npx pnpm@11.25.0 content:check` | Gagal sesuai harapan (kode 1): "Rilis diblokir: 14 rujukan belum terverifikasi." |
| `npx pnpm@11.25.0 build:pages` | Lulus |
| `sha256sum` ke-178 berkas `dist-pages/` | Identik dengan build `main`, sesudah kode dan sesudah semua dokumen |
| `npx tsc --noEmit -p tsconfig.json --incremental false` | 0 galat |
| `npx eslint app/sehari-setara/__tests__/content.test.ts app/sehari-setara/content/schema.ts --max-warnings 0` | 0 masalah |

Pemeriksaan tambahan di salinan di luar repositori, berupa uji yang sengaja dibuat gagal:

- Pemeriksa baris rujukan dibuang dari `schema.ts`: 2 uji gagal, yaitu "baris rujukan PRD yang berbeda atau hilang tertangkap" dan "perubahan urutan rujukan tertangkap".
- Urutan dua rujukan adegan 1 di PRD ditukar: uji gagal dengan pesan untuk pilihan A, B, dan C adegan 1.

Sesudah salinan dipulihkan, semua uji lulus lagi.

Berkas yang dibuat atau diubah di bagian A, dibandingkan dengan ZIP `main` 5 November 2026:

| Status | Berkas |
|---|---|
| Diubah | `app/sehari-setara/__tests__/content.test.ts`, `app/sehari-setara/content/schema.ts` |
| Diubah | `docs/sehari-setara/PRD.md`, `docs/sehari-setara/specs/F-03-konten-adegan.md`, `docs/sehari-setara/PLAN.md` |
| Baru | `docs/sehari-setara/specs/F-11-integrasi-galeri-rilis.md` (bagian A), `docs/sehari-setara/tests/F-11-hasil.md` |

### Temuan

1. **Tidak ada perubahan dari spesifikasi.** Kode, teks dokumen, dan jumlah uji sama dengan spesifikasi bagian A dan percobaan [Coba].
2. **Sesudah ZIP A di-commit, kotak aman dicentang.** Mencentang kotak di `Verifikasi_Rujukan.md`, lewat GitHub Desktop maupun situs GitHub, tidak lagi menggagalkan langkah "Uji game", sehingga situs tetap terbit. Jumlah yang sudah terverifikasi terbaca di log langkah "Uji game" di tab Actions, pada baris "Verifikasi rujukan: n dari 14 terverifikasi.".
3. **Pemblokiran rilis belum aktif di CI.** Langkah `RILIS=1` baru masuk paket B. Sampai saat itu, situs terbit seperti biasa, termasuk game F-10 yang belum ditautkan dari galeri.
4. **Untuk bagian B.** Kalimat "Mengubah file ini tidak pernah membuat situs gagal terbit." di `Verifikasi_Rujukan.md` tidak lagi benar sesudah langkah ketat masuk CI, karena daftar yang belum lengkap akan menahan terbitan. Cara memperbaruinya dibahas di spesifikasi bagian B, karena ZIP dari agen tidak memuat berkas itu.

Daftar periksa manual (AGENTS bagian 9): tidak ada butir yang berlaku, karena halaman yang terbit tidak berubah.

### Keputusan bagian A: Lulus

## Bagian B

Lingkungan: sama dengan bagian A, cabang `fitur/F-11-integrasi-galeri-rilis`. Uji ujung ke ujung memakai Chromium 153 lewat berkas konfigurasi pengganti sementara (tidak diserahkan) dan server `serve-subpath.mjs` di `/ruang-setara/`, dijalankan per berkas atau per kelompok karena batas 300 detik per perintah. Tangkapan layar ada di folder [`F-11/`](F-11/); berkas `sebelum-*` diambil dari build `main` sebelum F-11.

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-B1 Tautan panel | Lulus | `galeri-integrasi.spec.ts`, 3 uji "kedua tautan di {ukuran}": tidak ada di layar sambutan; di galeri Refleksi berkelas `journey-cta` dengan satu ikon, bertuliskan "Main Sehari Setara", ber-`href="sehari-setara/"`, berurutan "Mulai tantangan", "Main Sehari Setara", "Kembali ke atrium"; jarak panel ke kepala dan kaki halaman paling sedikit 10 px; garis fokus `solid` saat dipilih dengan Tab. Tangkapan `galeri-refleksi-*.png` dan `galeri-refleksi-fokus-*.png` |
| AC-B2 Tautan menu | Lulus | Uji yang sama: berkelas `text-control`, teks dan `href` benar, tepat sesudah kalimat pembuka (`P`) dan sebelum `destination-list`, dan berada di dalam bidang menu yang terlihat di 1280×720, 1024×768, dan 1920×1080. Tangkapan `galeri-menu-*.png` |
| AC-B3 Alamat dan alur | Lulus | Uji "dari galeri ke game dan kembali, dengan klik dari kedua titik": tautan menu membuka `/ruang-setara/sehari-setara/` dengan "Mulai" berfokus; "Kembali ke galeri" membuka `/ruang-setara/`; galeri Atrium tanpa tautan panel; tautan panel membuka game. Jalur keyboard di AC-B5 |
| AC-B4 Galeri hanya berubah di dua titik | Lulus | Kode: `app/page.tsx` dikurangi ketiga potongan identik byte dengan berkas di ZIP `main` (+193 byte), dan berkas galeri, `github-pages/`, `public/`, konfigurasi build, `package.json`, serta `pnpm-lock.yaml` tidak berubah. Build: dari 178 berkas, yang berubah hanya `index.html` dan `main-*.js` galeri (897.094 byte, 244.660 byte gzip; +772 dan +286 byte), serta `sehari-setara/index.html`, JS game, dan CSS game; `main-Bp-7VtNx.css`, `jsx-runtime-CmKW-gyo.js`, dan ke-170 aset identik byte, juga sesudah semua dokumen ditulis. Tampilan: tangkapan `sebelum-*` dan sesudah di tiga ukuran hanya berbeda di kedua tautan. Panel naik untuk memberi tempat tombol, dan daftar galeri di menu turun satu baris. Kecerahan latar buram di belakang menu berbeda karena saat pengambilan, bukan karena CSS (CSS galeri identik byte) |
| AC-B5 Main penuh dengan keyboard dari galeri | Lulus | Uji "main penuh dengan keyboard dari galeri ke game, lalu kembali ke galeri": Tab ke "Daftar materi", Enter, Tab ke "Main Sehari Setara", Enter; 3 tim, 60 detik, keenam adegan pilihan B dengan kuis; layar akhir, empat halaman rekap, dan refleksi; Tab ke "Kembali ke galeri", Enter, lalu galeri tampil di `/ruang-setara/`. Galat konsol, galat halaman, respons 4xx/5xx, dan permintaan ke situs lain: 0 |
| AC-B6 Layar judul empat tombol | Lulus | `judul-pengaturan-prolog.spec.ts`: 4 uji "layar judul di {ukuran}" dengan tabel empat tombol (±0,5u) dan `href="../"` di tombol keempat; uji masa tunggu (AC-3, AC-4) dengan "Tentang", termasuk sesudah dialog "Tentang" ditutup; urutan Tab empat tombol di uji AC-22 dan di `sehari-setara.spec.ts` |
| AC-B7 Dialog "Tentang" | Lulus | 4 uji "dialog Tentang di {ukuran}": `aria-modal="true"`, fokus di judul, kelima belas teks sama dengan tabel, Tab dan Shift+Tab hanya antara judul dan "Tutup", pintasan tanpa akibat, "Cara bermain" tidak terbuka di bawahnya (satu dialog), tanpa teks meluap, sisa kolom kanan ≥ 10u, "Tutup" di kanan 169,8u, `Esc` menutup dan fokus kembali ke "Tentang". Uji bunyi AC-24: membuka "Tentang" dan menutupnya dengan `Esc` masing-masing tepat satu klik. Tangkapan `tentang-*.png` dan `judul-*.png` |
| AC-B8 Teks "Tentang" | Lulus | `opening.test.ts`, 2 uji "teks dialog Tentang": tanpa kurung siku, kurawal, "TBD", "draf", "sementara", atau "sedang dibuat"; lisensi huruf dan kedua pemberitahuan hak cipta persis |
| AC-B9 Langkah CI | Sebagian (menunggu verifikasi) | Langkah "Periksa verifikasi rujukan" sama persis dengan spesifikasi, di antara "Uji game" dan "Build versi statis". `RILIS=1 content:check` pada daftar saat ini gagal dengan "Rilis diblokir: 14 rujukan belum terverifikasi." Lulus pada berkas pemilik proyek baru bisa diperiksa sesudah verifikasi selesai |
| AC-B10 Dokumen | Lulus, kecuali B-5 | Architecture (0.13: bagian 3, 4, 7, 9, 10, 11, dan 12), Design System (bagian 3, 7, dan 13), PRD bagian 13, AGENTS bagian 6, `PANDUAN_GITHUB_PAGES.md`, spesifikasi, dan `PLAN.md`. Baris "Rilis 1.0" di PRD bagian 17 dan `PLAN.md` ditulis di ZIP B final (B-5). `CREDITS.md` dan `Daftar_Aset.md` tidak berubah, karena S-6 belum dijawab (B-2) |
| AC-B11 Pemeriksaan rilis | Lulus | Tabel "Pemeriksaan rilis 1.0" di bawah |
| AC-B12 Pemeriksaan kode | Lulus | `test` 296 lulus, 1 dilewati; `content:check` 42 lulus, 1 dilewati; `build:pages` lulus; `test:e2e` 160 lulus; `tsc` 0 galat tanpa `next-env.d.ts`; ESLint `--max-warnings 0` 0 masalah pada `app/sehari-setara` dan `e2e`; `app/page.tsx` tetap 4 galat `react-hooks/refs` (baris 33, 35, 37, 37) dan 1 peringatan `react-hooks/exhaustive-deps` (baris 56), sama dengan sebelum F-11; `package.json` dan `pnpm-lock.yaml` tidak berubah |
| AC-B13 Versi Vinext | Lulus | `pnpm dev`: `/` 200; `/sehari-setara/` dialihkan ke `/sehari-setara` lalu 404 "This page could not be found."; berkas sisa Vinext dihapus sesudahnya |

### Pemeriksaan rilis 1.0

| Pemeriksaan | Hasil |
|---|---|
| Aset game | 103.570 byte (gambar dan bunyi 66.774, huruf 36.796), 0,10 MB dari 4 MB |
| Kode game | JS game ditambah React bersama 98.605 byte gzip (96,3 KiB) dari 150 KB; CSS game 6.756 byte gzip |
| Waktu siap, layar judul | Prosesor biasa: pemanasan 0,55 detik, lima jalan 0,53–0,56 detik. Diperlambat 4×: pemanasan 0,94, lima jalan 0,87–0,94 detik |
| Waktu siap, adegan 1 (`#adegan-1`) | Prosesor biasa: pemanasan 0,53, lima jalan 0,52–0,54 detik. Diperlambat 4×: pemanasan 0,86, lima jalan 0,88–0,99 detik |
| Data per pemuatan | 380–391 KB, dengan cache kosong, 10 Mbps, latensi 40 ms |
| Galat | 0 di semua uji ujung ke ujung, termasuk galeri (layar sambutan, galeri Refleksi, menu) dan main penuh |
| Placeholder | `Daftar_Aset.md` 50 dari 50 baris Disetujui; uji aset lulus; tanpa kurung siku, kurawal, "TBD", atau "draf" di teks `content/*.ts`. Dua kecocokan kata "sementara" adalah kata sambung di teks alternatif adegan 1 dan 5 ("…, sementara Gita …", "…, sementara Pak Made …"), bukan penanda teks sementara |
| Rujukan | 0 dari 14 terverifikasi pada salinan agen; mode rilis memblokir (AC-B9) |

### Perintah yang dijalankan dan hasilnya

| Perintah | Hasil |
|---|---|
| `npx pnpm@11.25.0 test` | Lulus: 14 berkas, 296 uji, 1 dilewati |
| `npx pnpm@11.25.0 content:check` | Lulus: 42 uji, 1 dilewati; "0 dari 14 terverifikasi" |
| `RILIS=1 npx pnpm@11.25.0 content:check` | Gagal sesuai harapan: "Rilis diblokir: 14 rujukan belum terverifikasi." |
| `npx pnpm@11.25.0 build:pages` dan sidik jari 178 berkas | Lulus; perubahan sesuai AC-B4 |
| `npx playwright test` (Chromium 153), per kelompok | 160 lulus: `galeri-integrasi` 5, `judul-pengaturan-prolog` 43, `sehari-setara` dan `suara` 24, `kuis-peran` dan `tim-waktu-bintang` 29, `akhir-rekap-refleksi` 32, `alur-permainan` 12, `kartu-dampak` 15 |
| `npx tsc --noEmit -p tsconfig.json --incremental false` | 0 galat |
| `npx eslint app/sehari-setara e2e --max-warnings 0` | 0 masalah |
| `npx eslint app/page.tsx` | 5 masalah lama yang sama, tanpa masalah baru |
| `npx pnpm@11.25.0 dev`, lalu `curl` | `/sehari-setara/` berakhir di 404 Vinext |

### Temuan

1. **Verifikasi rujukan belum selesai.** Daftar di salinan agen masih 0 dari 14, sehingga langkah baru di CI pasti gagal bila ZIP B di-commit sekarang. ZIP B ini hanya untuk ditinjau. Sesudah ke-14 kotak dicentang, kirim ZIP `main` terbaru; agen menjalankan `RILIS=1 content:check` pada berkas itu, lalu menyiapkan ZIP B final beserta baris "Rilis 1.0" (B-5).
2. **Dua penyesuaian uji, bukan perbaikan permainan.** Uji baru "dialog Tentang" semula menekan `Spasi` saat "Tutup" berfokus, sehingga dialog memang tertutup; urutannya diperbaiki. Uji urutan Tab lama di `sehari-setara.spec.ts` ditambah "Tentang".
3. **Fungsi keyboard bersama.** `tabTo`, `openByKeyboard`, `toQuestion`, dan `playScene` dipindah dari uji F-10 ke `e2e/bantuan.ts`, agar dipakai juga oleh uji galeri.
4. **Tangkapan layar.** Playwright mengosongkan `test-results/` di setiap jalan, jadi tangkapan F-11 diambil ulang dan langsung disalin ke folder laporan.
5. **B-2 masih terbuka.** Layar "Tentang" memakai "Bunyi klik dan bunyi teks dipilih YAN dari halaman uji suara Sehari Setara." sampai S-6 dijawab.
6. **Lingkungan uji.** Galeri 3D di browser uji tanpa GPU lambat: satu uji "kedua tautan" butuh sekitar 1 menit di 1280×720 dan 2 menit di 1920×1080.

Daftar periksa manual (AGENTS bagian 9) dan daftar periksa rilis untuk pemilik proyek ada di rencana F-11, usulan 9: laptop kelas dengan Edge, proyektor, dan iPad bila ada, sesudah ZIP B final terbit dan sebelum tautan dibuka untuk siswa.

### Keputusan bagian B: Lulus untuk ditinjau

Semua kriteria lulus, kecuali dua hal yang menunggu verifikasi ke-14 rujukan: AC-B9 (mode rilis lulus pada berkas pemilik proyek) dan baris "Rilis 1.0" (B-5). ZIP B tidak untuk di-commit sebelum verifikasi selesai.
