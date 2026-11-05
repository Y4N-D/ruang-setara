# Hasil uji F-11 — 5 November 2026

Fitur: integrasi dengan galeri Ruang Setara, layar "Tentang", dan rilis 1.0 ([spesifikasi](../specs/F-11-integrasi-galeri-rilis.md)). Laporan ini baru memuat **bagian A**, yaitu uji daftar centang dan baris rujukan PRD. Bagian B ditambahkan sesudah spesifikasi bagian B disetujui, dibangun, dan diuji.

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

Belum diuji.
