# F-11 — Integrasi dengan galeri Ruang Setara, layar "Tentang", dan rilis 1.0

| | |
|---|---|
| Status | Bagian A: disetujui 5 November 2026 (`Spesifikasi disetujui: F-11 bagian A`; saran V-1 sampai V-4 dipakai), dibangun tanpa perubahan dari spesifikasi, dan diuji dengan keputusan Lulus ([laporan](../tests/F-11-hasil.md)). Bagian B: disetujui 5 November 2026 (`Spesifikasi disetujui: F-11 bagian B`; saran B-1 sampai B-6 dipakai, dan B-2 memakai kalimat sementara karena S-6 belum dijawab), dibangun, dan diuji dengan keputusan Lulus ([laporan](../tests/F-11-hasil.md)). Rilis 1.0 tercatat 5 November 2026, sesudah ke-14 rujukan diverifikasi pemilik proyek |
| Tanggal | 5 November 2026 |
| Rencana | `docs/sehari-setara/PLAN.md`, entri F-11 (disetujui 5 November 2026, balasan `Setuju: F-11`; saran setiap usulan diterima) |
| Isi bagian A | Perbaikan uji daftar centang (AC-5 F-03) dan penyelarasan baris rujukan PRD bagian 8, sebagai paket pendahuluan yang boleh di-commit sebelum pemilik proyek mencentang |
| Isi bagian B | Dua tautan galeri, langkah pemeriksaan ketat di CI, layar "Tentang", serta pemeriksaan dan pencatatan rilis 1.0. Di-commit hanya sesudah verifikasi ke-14 rujukan selesai |

## Ringkasan

Bagian A membuat isi `Verifikasi_Rujukan.md` tidak pernah lagi menggagalkan uji biasa. Kotak yang dicentang, baris yang rusak, atau berkas yang hilang hanya mengubah laporan, sedangkan pemblokiran terjadi di mode rilis (`RILIS=1`). Bagian A juga menyamakan baris rujukan PRD bagian 8 dengan naskah, dan uji PRD ikut memeriksanya. Kode game dan galeri tidak berubah, dan halaman yang terbit identik byte.

Bagian B, yaitu tautan galeri, langkah pemeriksaan ketat di CI, layar "Tentang", dan pemeriksaan rilis 1.0, ditulis di dokumen ini sesudah ZIP A diserahkan.

## Kaitan PRD

- PRD bagian 14, "Rujukan pasal keliru": konten tidak dirilis sebelum semua rujukan dicentang manusia. Bagian A memastikan centang itu bisa dilakukan tanpa menahan terbitan, dan pemblokiran tetap di mode rilis.
- PRD bagian 8: naskah dan PRD selalu sama (aturan 12 spesifikasi F-03), kini termasuk baris rujukan.
- PRD bagian 17: keputusan 22 Oktober 2026 (rujukan) dan 5 November 2026 (rencana F-11).
- AGENTS bagian 8: status verifikasi dicatat di `Verifikasi_Rujukan.md`, dan rilis diblokir selama ada kotak kosong.
- Spesifikasi F-03: perilaku "Uji biasa tetap lulus, sehingga situs tetap terbit" dan aturan 14 ("Uji ini selalu lulus dalam mode biasa") dipulihkan; AC-5 diubah.
- Laporan F-06, Temuan 8.

## Keputusan bagian A (disetujui 5 November 2026)

| No. | Hal | Saran | Alternatif |
|---|---|---|---|
| V-1 | Berkas `Verifikasi_Rujukan.md` hilang | Dibaca sebagai teks kosong: ke-14 rujukan dilaporkan "tidak ada di daftar", uji biasa lulus, dan mode rilis memblokir | Uji biasa gagal dengan pesan bahwa berkas itu tidak ditemukan |
| V-2 | Pesan bila rujukan PRD berbeda | Satu pesan per pilihan, seperti baris hak dan kewajiban: `Adegan s1, pilihan A: rujukan berbeda dengan PRD.` | Satu pesan per adegan yang menyebut kedua teks |
| V-3 | Jawaban pertanyaan terbuka PRD bagian 16 nomor 2 (pintu masuk) | Dicatat sekarang di baris 5 Nov 2026 PRD bagian 17, karena keputusannya dibuat di Gerbang 1. Baris "Rilis 1.0" di bagian B merujuk ke baris itu | Dicatat di baris "Rilis 1.0" bagian B, seperti bunyi usulan 10a rencana |
| V-4 | `test:e2e` untuk bagian A | Tidak dijalankan, karena ke-178 berkas yang terbit identik byte (AC-A9), bukti yang lebih kuat daripada uji layar. Uji ujung ke ujung dijalankan penuh di bagian B | Dijalankan penuh juga di bagian A, sehingga ZIP A terlambat sekitar satu sesi |

## Perilaku

- Diberikan `Verifikasi_Rujukan.md` dengan 0 sampai 14 kotak tercentang, ketika `test` atau `content:check` dijalankan tanpa `RILIS=1`, maka semua uji lulus, dan laporan "Verifikasi rujukan: n dari 14 terverifikasi." dicetak beserta daftar yang belum.
- Diberikan satu baris butir rusak (kotak, kode, atau teks tidak sama dengan `references.ts`), ketika uji biasa dijalankan, maka uji tetap lulus, dan rujukan itu dilaporkan belum terverifikasi dengan alasan "teks di daftar berbeda" atau "tidak ada di daftar".
- Diberikan berkas `Verifikasi_Rujukan.md` tidak ada (V-1), ketika uji biasa dijalankan, maka uji lulus, dan ke-14 rujukan dilaporkan "tidak ada di daftar".
- Diberikan masih ada rujukan yang belum terverifikasi, ketika `RILIS=1 content:check` dijalankan, maka perintah gagal (kode 1) dengan pesan "Rilis diblokir: n rujukan belum terverifikasi." disusul laporannya.
- Diberikan ke-14 rujukan terverifikasi, ketika `RILIS=1 content:check` dijalankan, maka semua uji lulus (kode 0).
- Diberikan baris "Rujukan:" setiap adegan di PRD bagian 8 sama dengan teks rujukan setiap pilihannya (berurutan, dipisah "; ", dengan titik di akhir), ketika uji dijalankan, maka uji PRD lulus.
- Diberikan satu rujukan berbeda, berpindah urutan, hilang, atau bertambah, di PRD atau di naskah, ketika uji dijalankan, maka uji gagal dengan pesan `Adegan sN, pilihan X: rujukan berbeda dengan PRD.` untuk setiap pilihan adegan itu.
- Diberikan baris "Rujukan:" tidak ada di sebuah adegan PRD, ketika uji dijalankan, maka uji gagal dengan pesan `Adegan sN: baris rujukan PRD tidak terbaca.`
- Diberikan rujukan diubah kelak atas keputusan pemilik proyek, ketika uji dijalankan, maka `references.ts`, `scenes.ts`, PRD bagian 8, dan `Verifikasi_Rujukan.md` (kotaknya dikosongkan) harus berubah bersama. Uji AC-4 dan uji PRD menangkap yang tertinggal, dan mode rilis memblokir sampai rujukan itu diverifikasi ulang.

## Status antarmuka

Tidak ada perubahan tampilan. Bagian A tidak mengubah kode game maupun galeri, dan halaman yang terbit identik byte (AC-A9).

## Teks yang tampil (final)

Tidak ada teks baru di layar. Teks final pesan uji dan dokumen:

### Pesan pemeriksa konten (baru)

| Keadaan | Pesan |
|---|---|
| Rujukan berbeda dengan PRD | `Adegan s1, pilihan A: rujukan berbeda dengan PRD.` |
| Baris rujukan PRD tidak ada | `Adegan s1: baris rujukan PRD tidak terbaca.` |

Pesan lain di spesifikasi F-03 ("Pesan pemeriksa konten") tetap.

### PRD bagian 8

Kalimat status di awal bagian:

| Lama | Baru |
|---|---|
| Semua rujukan berstatus **perlu verifikasi** sampai dicocokkan dengan naskah resmi di JDIH (lihat aturan di `AGENTS.md`). | Setiap rujukan dicocokkan dengan naskah resmi di JDIH, dan status verifikasinya dicatat di `Verifikasi_Rujukan.md` (lihat aturan di `AGENTS.md`). |

Baris "Rujukan:" setiap adegan. Teks setiap rujukan sama persis dengan `references.ts`, berurutan seperti di kartu dampak. Tidak ada rujukan baru, dan tidak ada teks rujukan yang berubah:

| Adegan | Lama | Baru |
|---|---|---|
| 1 | Rujukan: Pasal 28B ayat (2) UUD NRI 1945; UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 19. | Rujukan: Pasal 28B ayat (2) UUD NRI 1945; UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 14 ayat (1); UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 19. |
| 2 | Rujukan: Pasal 28G ayat (1), Pasal 31 ayat (1), Pasal 27 ayat (1) UUD NRI 1945; UU No. 22 Tahun 2009 tentang LLAJ, Pasal 77 ayat (1) dan Pasal 106 ayat (8). | Rujukan: Pasal 28G ayat (1) UUD NRI 1945; Pasal 31 ayat (1) UUD NRI 1945; Pasal 27 ayat (1) UUD NRI 1945; UU No. 22 Tahun 2009 tentang LLAJ, Pasal 77 ayat (1) dan Pasal 106 ayat (8). |
| 3 | Rujukan: Pasal 28E ayat (3) dan Pasal 28J ayat (1) UUD NRI 1945. | Rujukan: Pasal 28E ayat (3) UUD NRI 1945; Pasal 28J ayat (1) UUD NRI 1945. |
| 4 | Rujukan: Pasal 28B ayat (2), Pasal 28G ayat (1), Pasal 28J ayat (1) UUD NRI 1945. | Rujukan: Pasal 28B ayat (2) UUD NRI 1945; Pasal 28G ayat (1) UUD NRI 1945; Pasal 28J ayat (1) UUD NRI 1945. |
| 5 | Rujukan: Pasal 28D ayat (1), Pasal 28G ayat (1), Pasal 24 UUD NRI 1945; UU No. 2 Tahun 2002, Pasal 13 dan Pasal 14 ayat (1) huruf g; UU No. 48 Tahun 2009, Pasal 8 ayat (1) (asas praduga tak bersalah). | Rujukan: Pasal 28D ayat (1) UUD NRI 1945; Pasal 28G ayat (1) UUD NRI 1945; Pasal 24 ayat (1) dan ayat (2) UUD NRI 1945; UU No. 48 Tahun 2009, Pasal 11 ayat (1); UU No. 2 Tahun 2002 sebagaimana telah diubah terakhir dengan UU No. 5 Tahun 2026, Pasal 13 dan Pasal 14 ayat (1) huruf g; UU No. 48 Tahun 2009, Pasal 8 ayat (1) (asas praduga tak bersalah). |
| 6 | Rujukan: Pasal 28E ayat (3), Pasal 28G ayat (1), Pasal 28J ayat (1) UUD NRI 1945. | Rujukan: Pasal 28G ayat (1) UUD NRI 1945; Pasal 28J ayat (1) UUD NRI 1945. |

Baris lain PRD bagian 8 tidak berubah.

### PRD bagian 17

Dua baris baru, disisipkan menurut tanggal:

| Tanggal | Keputusan |
|---|---|
| 22 Okt 2026 | Rujukan disesuaikan atas keputusan pemilik proyek: R-07 (Pasal 28E ayat (3) UUD NRI 1945) dilepas dari adegan 6; R-10 menjadi Pasal 24 ayat (1) dan ayat (2) UUD NRI 1945; R-11 menjadi UU No. 2 Tahun 2002 sebagaimana telah diubah terakhir dengan UU No. 5 Tahun 2026, Pasal 13 dan Pasal 14 ayat (1) huruf g; R-13 (UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 14 ayat (1)) ditambahkan di adegan 1; dan R-14 (UU No. 48 Tahun 2009, Pasal 11 ayat (1)) ditambahkan di adegan 5. Semuanya tetap perlu verifikasi; riwayatnya di `Verifikasi_Rujukan.md` |
| 5 Nov 2026 | Rencana F-11 disetujui (balasan `Setuju: F-11`): game ditautkan dari dua titik galeri, yaitu tombol "Main Sehari Setara" di galeri Refleksi dan tautan di menu "Daftar materi", menjawab pertanyaan terbuka bagian 16 nomor 2 (V-3); layar "Tentang" dikerjakan di F-11; pemeriksaan ketat rujukan dijalankan di CI sebelum build; dan tautan dari galeri baru terbit sesudah semua rujukan di `Verifikasi_Rujukan.md` dicentang pemilik proyek |

### Spesifikasi F-03

- Kepala, baris "Revisi": ditambah "5 November 2026: isi daftar centang tidak lagi menggagalkan uji biasa, dan baris rujukan PRD ikut dibandingkan (F-11 bagian A)."
- Aturan 12: "… serta baris hak dan kewajiban sama dengan PRD bagian 8" menjadi "… serta baris hak dan kewajiban, dan sejak 5 November 2026 baris rujukan, sama dengan PRD bagian 8".
- AC-5 menjadi: "AC-5 `Verifikasi_Rujukan.md` dibuat dengan satu butir untuk setiap rujukan di `references.ts` (kini 14), berkotak kosong, berformat seperti di atas, dan teksnya sama dengan `references.ts`. Isi daftar sesudahnya, yaitu kotak yang dicentang, baris yang rusak, atau berkas yang hilang, tidak pernah membuat uji biasa gagal; daftar yang belum lengkap atau belum dicentang hanya diblokir mode rilis (AC-7). [Diubah 5 November 2026, F-11 bagian A]"
- "Riwayat perubahan": subbagian baru "5 November 2026: uji daftar centang dan rujukan PRD (F-11 bagian A)", berisi pemicu (laporan F-06 Temuan 8; percobaan Plan F-11: satu kotak dicentang membuat `test` gagal, dan 14 kotak dicentang tetap gagal), perubahan uji, perubahan PRD, dan catatan bahwa kedua butir "Belum diubah dan menunggu keputusan pemilik proyek" di riwayat 22 Oktober 2026 kini selesai.

## Data dan aksi

- Tidak ada perubahan tipe, reducer, naskah, atau rujukan.
- `content/schema.ts`: `prdProblems(scenes, roles, prd)` membaca baris `^Rujukan: (.+)$` di setiap adegan PRD. Untuk setiap pilihan, `choice.impact.rujukan.map((r) => r.text).join("; ")` dibandingkan dengan baris itu lewat `loose`, aturan perbandingan yang sama dengan teks PRD lain (tanda petik, huruf kapital di awal, titik di akhir, dan spasi berlebih diabaikan). Fungsi daftar centang (`parseChecklist`, `verificationReport`, `formatReport`, `releaseBlockedMessage`) tidak berubah.
- `__tests__/content.test.ts`:
  - `Verifikasi_Rujukan.md` yang tidak ada dibaca sebagai teks kosong (V-1);
  - uji AC-5 lama ("… berkotak kosong dengan teks yang sama") diganti uji contoh yang tidak membaca berkas milik pemilik proyek. Lima daftar buatan dari `REFERENCES` (semua kotak kosong; lima kotak pertama dicentang; semua dicentang; semua dicentang dengan teks R-04 tanpa "NRI"; teks kosong) menghasilkan 14, 9, 0, 1, dan 14 rujukan belum terverifikasi, dengan pesan pemblokiran yang sesuai atau tanpa pesan;
  - uji AC-2 ditambah satu uji yang mengubah salinan PRD (teks satu rujukan adegan 1; baris rujukan adegan 1 dihapus) dan satu mutasi naskah (urutan rujukan pilihan A adegan 5 dibalik);
  - uji AC-4, AC-6, AC-7, dan mode rilis tidak berubah.

Hasil percobaan [Coba], 5 November 2026, di salinan ZIP `main` commit `4778284` di luar repositori, dengan kode di atas:

| Keadaan | Hasil |
|---|---|
| Kode baru, PRD bagian 8 lama | Uji PRD gagal dengan 18 pesan (enam adegan × tiga pilihan), karena adegan 2 sampai 4 pun ditulis dengan gaya ringkas |
| Kode baru, PRD bagian 8 baru, daftar asli | `content:check` 42 lulus, 1 dilewati; "0 dari 14"; `RILIS=1` diblokir 14 |
| Ke-14 kotak dicentang | Biasa dan `RILIS=1` lulus |
| Berkas daftar dihapus | Biasa lulus ("0 dari 14"); `RILIS=1` diblokir 14 |
| Seluruh uji | `test` 294 lulus, 1 dilewati (sebelumnya 288); `tsc` 0 galat; ESLint 0 masalah pada kedua berkas |

## Aset

Tidak ada aset baru, dan placeholder tidak diperlukan.

## Di luar cakupan (bagian A)

- Semua isi bagian B: kedua tautan galeri, langkah pemeriksaan ketat di CI, layar "Tentang", pemeriksaan rilis 1.0, dan pencatatan rilis.
- Mencentang atau mengubah isi `Verifikasi_Rujukan.md`.
- Mengubah teks, kode, urutan, atau jumlah rujukan (`references.ts`, `scenes.ts`).
- Mengubah PRD bagian 8 selain kalimat status dan keenam baris "Rujukan:", dan mengubah daftar pertanyaan terbuka PRD bagian 16.
- Catatan untuk bagian B: kalimat "Mengubah file ini tidak pernah membuat situs gagal terbit." di `Verifikasi_Rujukan.md` tetap benar sampai paket B. Sesudah langkah ketat masuk CI, daftar yang belum lengkap menahan terbitan. Karena ZIP dari agen tidak memuat berkas itu, cara memperbarui kalimat itu dibahas di bagian B.

## Perubahan dokumen (Build bagian A)

| Berkas | Perubahan |
|---|---|
| `docs/sehari-setara/PRD.md` | Bagian 8 (kalimat status dan keenam baris "Rujukan:") dan bagian 17 (dua baris), sesuai "Teks yang tampil" |
| `docs/sehari-setara/specs/F-03-konten-adegan.md` | Baris "Revisi", aturan 12, AC-5, dan "Riwayat perubahan" |
| `docs/sehari-setara/PLAN.md` | Tabel status (F-03: "uji daftar centang disesuaikan 5 Nov 2026 (F-11 bagian A)"; F-11) dan status entri F-11 |
| `docs/sehari-setara/specs/F-11-integrasi-galeri-rilis.md` | Status bagian A dan catatan Build |
| `docs/sehari-setara/tests/F-11-hasil.md` | Baru, bagian A |

`Architecture.md` dan `AGENTS.md` tidak berubah di bagian A; uraian `content:check` di Architecture bagian 5 dan 12 tetap benar.

## Kriteria penerimaan (bagian A)

- [ ] AC-A1 Isi daftar tidak menahan uji biasa: kelima daftar contoh menghasilkan jumlah belum terverifikasi dan pesan pemblokiran yang benar, dan `test` serta `content:check` lulus dengan daftar asli ("0 dari 14").
- [ ] AC-A2 Di salinan di luar repositori, `Verifikasi_Rujukan.md` dengan 5 kotak, 14 kotak, 14 kotak dengan baris R-04 rusak, dan berkas dihapus: uji biasa lulus dengan ringkasan 5, 14, 13, dan 0 dari 14; `RILIS=1` diblokir 9, lulus, diblokir 1, dan diblokir 14. Berkas repositori tidak diubah.
- [ ] AC-A3 `RILIS=1 content:check` pada daftar asli gagal dengan "Rilis diblokir: 14 rujukan belum terverifikasi."
- [ ] AC-A4 Kalimat status dan keenam baris "Rujukan:" PRD bagian 8 sama persis dengan tabel di atas, dan baris lain PRD bagian 8 tidak berubah (diff).
- [ ] AC-A5 Uji PRD membandingkan baris rujukan dan lulus. Ketiga perubahan sengaja (teks di PRD, baris PRD dihapus, urutan di naskah) tertangkap dengan pesan yang tepat.
- [ ] AC-A6 PRD bagian 17 memuat kedua baris baru dengan teks final, di urutan tanggal.
- [ ] AC-A7 Spesifikasi F-03 diperbarui sesuai bagian "Teks yang tampil".
- [ ] AC-A8 `references.ts`, `scenes.ts`, `roles.ts`, `Verifikasi_Rujukan.md`, kode game dan galeri, `package.json`, `pnpm-lock.yaml`, dan workflow tidak berubah (`git diff --name-status`). Jumlah uji: `test` 294 lulus dan 1 dilewati (288 sebelumnya; +5 contoh daftar, −1 uji AC-5 lama, +1 uji PRD, +1 mutasi naskah).
- [ ] AC-A9 `build:pages` lulus, dan ke-178 berkas `dist-pages/` identik byte dengan build sebelum bagian A, juga sesudah semua dokumen bagian A ditulis (Tailwind galeri membaca dokumen).
- [ ] AC-A10 `tsc --noEmit` di salinan tanpa `next-env.d.ts` 0 galat; ESLint `--max-warnings 0` pada `content.test.ts` dan `schema.ts` 0 masalah; tanpa `any`.

## Rencana uji (bagian A)

| Langkah | Cara | Kriteria |
|---|---|---|
| 1 | `npx pnpm@11.25.0 install --frozen-lockfile`, lalu `npx pnpm@11.25.0 test` | AC-A1, AC-A5, AC-A8 |
| 2 | `npx pnpm@11.25.0 content:check`, lalu `RILIS=1 npx pnpm@11.25.0 content:check` (diharapkan gagal) | AC-A1, AC-A3 |
| 3 | Di salinan di luar repositori: daftar diubah (5 kotak, 14 kotak, satu baris rusak, berkas dihapus), lalu mode biasa dan mode rilis dijalankan | AC-A2 |
| 4 | Diff `PRD.md` dan spesifikasi F-03 terhadap keadaan sebelum bagian A | AC-A4, AC-A6, AC-A7 |
| 5 | `git diff --name-status` terhadap keadaan sebelum bagian A | AC-A8 |
| 6 | `npx pnpm@11.25.0 build:pages`, lalu sidik jari SHA-256 ke-178 berkas dibandingkan, sekali sesudah kode dan sekali sesudah semua dokumen | AC-A9 |
| 7 | `npx tsc --noEmit -p tsconfig.json --incremental false` dan `npx eslint` pada kedua berkas | AC-A10 |
| — | `test:e2e` tidak dijalankan untuk bagian A (V-4) | — |

Hasil ditulis di `docs/sehari-setara/tests/F-11-hasil.md` (templat 11.3), bagian A. ZIP A berisi berkas di bagian "Perubahan dokumen" ditambah `content.test.ts` dan `schema.ts`, dan tidak pernah memuat `Verifikasi_Rujukan.md`.

## Bagian B

### Ringkasan bagian B

Bagian B menautkan game dari dua titik galeri, menambah langkah pemeriksaan ketat rujukan di GitHub, menambah layar "Tentang" di layar judul, lalu menjalankan dan mencatat pemeriksaan rilis 1.0. Kode galeri hanya berubah di dua tautan dan satu nama ikon. Hasil bagian B baru boleh di-commit sesudah pemilik proyek menyatakan ke-14 rujukan terverifikasi (usulan 6a rencana).

### Keputusan bagian B (perlu disetujui)

| No. | Hal | Saran | Alternatif |
|---|---|---|---|
| B-1 | Nama di layar "Tentang" | "YAN", seperti di `CREDITS.md` dan baris atribusi lain | Nama lengkap; atau tanpa nama ("pemilik proyek") |
| B-2 | Baris bunyi (S-6) | **Perlu jawaban Anda.** Bila belum ada jawaban sampai Build, dipakai kalimat yang sesuai `CREDITS.md`: "Bunyi klik dan bunyi teks dipilih YAN dari halaman uji suara Sehari Setara.", dan S-6 tetap tercatat terbuka di `CREDITS.md` | "Dibuat dengan kode oleh Claude (Anthropic), dipilih YAN." bila halaman uji itu dibuat Claude; atau "Dibuat dengan {alat}, {lisensi}, dipilih YAN." bila dari alat lain |
| B-3 | Susunan dialog "Tentang" | Dua kolom seperti "Cara bermain": kiri "Tentang permainan" (tiga kalimat), kanan "Kredit" (Gambar, Huruf beserta dua pemberitahuan hak cipta dan alamat lisensi, lalu Bunyi) | Satu kolom; atau teks lisensi OFL lengkap ikut tampil dan bisa digulir |
| B-4 | Kalimat lama di `Verifikasi_Rujukan.md` ("Mengubah file ini tidak pernah membuat situs gagal terbit. …") | Pemilik proyek mengganti sendiri kalimat itu saat meng-commit ZIP B, dengan teks pengganti di bagian "Teks yang tampil". ZIP tetap tidak memuat berkas itu | Kalimat dibiarkan, dan penjelasan hanya di `PANDUAN_GITHUB_PAGES.md`, sehingga kalimat lama tidak lagi benar; atau agen mengubahnya lewat ZIP, yang bisa menimpa centang (bertentangan dengan usulan 6a) |
| B-5 | Tanggal rilis di PRD bagian 17 dan `PLAN.md` | Tanggal saat ZIP B final disiapkan, sesudah verifikasi selesai | Tanggal push oleh pemilik proyek, ditulis menyusul |
| B-6 | Ukuran layar untuk uji galeri yang lambat di browser uji tanpa GPU | Alur dan keyboard diuji di 1280×720; letak dan keterlihatan kedua tautan diperiksa juga di 1024×768 dan 1920×1080; tangkapan layar di ketiga ukuran | Semua uji galeri di ketiga ukuran, dengan risiko melewati batas 300 detik per perintah |

### Perilaku bagian B

**Galeri** (Architecture bagian 11)

- Diberikan galeri Refleksi (galeri ke-6) tampil, maka panel naratifnya memuat tautan bergaya tombol "Main Sehari Setara" di bawah "Mulai tantangan" dan di atas "Kembali ke atrium". Galeri lain tidak memuatnya.
- Diberikan menu "Daftar materi" dibuka, maka tautan teks "Main Sehari Setara" tampil tepat di bawah kalimat pembuka dan di atas daftar enam galeri, dan terlihat tanpa menggulir di 1024×768, 1280×720, dan 1920×1080.
- Ketika salah satu tautan diklik, atau berfokus lalu `Enter` ditekan, maka browser membuka `sehari-setara/` relatif terhadap alamat galeri, yaitu `/ruang-setara/sehari-setara/` di GitHub Pages, di tab yang sama. Layar judul game tampil dengan "Mulai" berfokus.
- Bagian galeri lain tidak berubah. "Kembali ke galeri" di game tetap `../` dan membuka galeri dari layar sambutan.
- Di versi Vinext (`pnpm dev`, `pnpm build`, dan `pnpm start`), kedua tautan berakhir di halaman 404 Vinext. Hal ini dicatat dan dibiarkan (usulan 4a).

**Layar judul dan dialog "Tentang"**

- Tombol keempat "Tentang" berada di baris tombol layar judul, berurutan "Mulai", "Cara bermain", "Tentang", "Kembali ke galeri". Gayanya `ss-button`, sama dengan tombol lain.
- "Tentang" membuka dialog "Tentang" dengan satu bunyi klik. Fase tetap `title`.
- Keempat tombol baru bekerja 600 ms sesudah layar judul tampil, termasuk sesudah dialog "Tentang" ditutup (spesifikasi F-10, bagian "Masa tunggu dan klik ganda").
- Dialog "Tentang" berperilaku sama dengan dialog "Cara bermain":
  - menutupi seluruh layar 16:9, dengan `role="dialog"`, `aria-modal="true"`, dan nama "Tentang" dari judulnya;
  - saat dibuka, fokus pindah ke judulnya. `Tab` dan `Shift+Tab` hanya beredar antara judul dan "Tutup";
  - "Tutup" (klik, atau `Enter` dan `Spasi` pada tombol) dan `Esc` menutup dialog dengan satu bunyi klik, lalu fokus kembali ke tombol "Tentang", dan masa tunggu layar judul dihitung lagi. "Tutup" sendiri tidak punya masa tunggu;
  - selama dialog terbuka, pintasan permainan tidak berlaku dan tidak berbunyi;
  - isi dialog tidak bergantung pada fase atau pengaturan.
- "Tentang" dan "Cara bermain" tidak bisa terbuka bersamaan.
- Sesudah "Main lagi" atau "Kembali", dialog "Tentang" tertutup dan fokus di "Mulai", sama dengan dialog "Cara bermain".

**CI**

- Langkah "Periksa verifikasi rujukan" dijalankan sesudah "Uji game" dan sebelum "Build versi statis". Bila masih ada rujukan yang belum terverifikasi, langkah gagal, build dan terbit tidak dijalankan, dan situs yang sedang tayang tetap seperti terbitan terakhir.

**Rilis**

- Urutan rilis mengikuti usulan 6a rencana. ZIP B yang diserahkan sebelum verifikasi selesai hanya untuk ditinjau, dan agen tidak menyarankan commit.

### Tata letak dan ukuran (bagian B)

**Galeri.** Kedua tautan memakai kelas galeri yang sudah ada, tanpa CSS baru:

| Titik | Kelas | Letak |
|---|---|---|
| Panel galeri Refleksi | `journey-cta`, dengan ikon `Gamepad2` 18 px | Sesudah "Mulai tantangan", sebelum "Kembali ke atrium"; hanya bila galeri ke-6 tampil |
| Menu "Daftar materi" | `text-control` | Sesudah kalimat pembuka, sebelum daftar enam galeri |

Hasil percobaan Plan [Coba]: di ketiga ukuran, tautan panel (198,5 × 48 px) berjarak 20–25 px dari garis kepala halaman dan paling sedikit 27 px dari kaki halaman, dan tautan menu berada pada y 331–370 px, di dalam bidang menu yang terlihat (batas 684 px di 1280×720 dan 733 px di 1024×768).

**Layar judul.** Pita tombol tetap (spesifikasi F-10); baris kini berisi empat tombol. Hasil percobaan [Coba], dengan tombol "Tentang" disuntikkan ke layar judul F-10:

| | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
|---|---|---|---|---|
| Baris (kiri–kanan) | 22,9–154,9u (132,0u) | 23,0–154,8u (131,8u) | 22,9–154,9u (132,0u) | 22,3–155,4u (133,1u) |
| "Mulai" | 22,9–44,9u | 23,0–45,0u | 22,9–44,9u | 22,3–44,7u |
| "Cara bermain" | 47,9–82,9u | 48,0–82,9u | 47,9–82,9u | 47,7–82,9u |
| "Tentang" | 85,9–113,1u | 85,9–113,0u | 85,9–113,1u | 85,9–113,3u |
| "Kembali ke galeri" | 116,1–154,9u | 116,0–154,8u | 116,1–154,9u | 116,3–155,4u |
| Atas–bawah tombol | 89,5–97,7u | 89,6–97,6u | 89,5–97,7u | 89,4–97,8u |

Klik ganda yang berubah karena tombol keempat, di 1280×720:

| Klik ganda pada | Klik kedua jatuh di | Pengaman |
|---|---|---|
| "Tutup" dialog "Cara bermain" atau "Tentang" (146,2–169,8u × 88,9–97,0u) | "Kembali ke galeri" (116,1–154,9u), tumpang tindih 8,7u | Masa tunggu layar judul: klik dibatalkan (`preventDefault()`) |
| "Main lagi" di refleksi (12,0–39,1u) | "Mulai" (22,9–44,9u), tumpang tindih 16,2u | Masa tunggu layar judul |
| "Tentang" (85,9–113,1u) | Teks kolom kanan dialog, bukan tombol | — |

**Dialog "Tentang".** Bingkai, kepala, isi, dan kaki sama dengan dialog "Cara bermain" (spesifikasi F-10, "Tata letak dan ukuran"), dan memakai kelas yang sama (`ss-howto`, `ss-howto-head`, `ss-howto-title`, `ss-howto-body`, `ss-howto-col`, `ss-howto-label`, `ss-howto-foot`). Unsur baru:

| Unsur | Nilai |
|---|---|
| Kalimat (`ss-about-text`) | Pixelify Sans 3,1u, tinggi baris 1,3, `ink`, jarak bawah 1,6u |
| Label kredit (`ss-howto-label`) | Pixelify Sans 2,5u, `dusk`; jarak bawah 0,5u |
| Pemberitahuan hak cipta dan lisensi (`ss-about-note`) | Pixelify Sans 2,5u, tinggi baris 1,3, `ink`, jarak bawah 1,6u |

Hasil percobaan [Coba], dengan isi dialog "Cara bermain" diganti isi "Tentang" (saran B-1 dan B-2):

| | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
|---|---|---|---|---|
| Sisa di bawah kolom kiri / kanan | 52,5u / 12,2u | 52,6u / 12,2u | 52,5u / 12,2u | 52,2u / 11,9u |
| Teks yang meluap | Tidak ada | Tidak ada | Tidak ada | Tidak ada |
| "Tutup" (kiri–kanan; atas–bawah) | 146,2–169,8u; 88,9–97,0u | 146,3–169,8u; 88,9–97,0u | 146,2–169,8u; 88,9–97,0u | 145,9–169,8u; 88,6–97,0u |

Sisa terkecil 11,9u cukup untuk dua baris tambahan, misalnya jawaban S-6 yang lebih panjang.

### Teks yang tampil (final) bagian B

**Galeri**

| Tempat | Teks |
|---|---|
| Tautan panel galeri Refleksi | Main Sehari Setara |
| Tautan menu "Daftar materi" | Main Sehari Setara |

**Layar judul**

| Tempat | Teks |
|---|---|
| Tombol keempat | Tentang |

**Dialog "Tentang"** (B-1 dan B-2 memakai saran)

| Tempat | Teks |
|---|---|
| Judul dialog | Tentang |
| Judul kolom kiri | Tentang permainan |
| Kalimat 1 | Sehari Setara adalah permainan Pendidikan Pancasila kelas IX di Ruang Setara. |
| Kalimat 2 | Permainan ini tidak menyimpan data siswa. |
| Kalimat 3 | Versi 1.0, November 2026. |
| Judul kolom kanan | Kredit |
| Label | Gambar |
| Kalimat | Digambar dengan kode oleh Claude (Anthropic) dengan arahan dan persetujuan YAN. |
| Label | Huruf |
| Kalimat | Press Start 2P dan Pixelify Sans, SIL Open Font License 1.1. |
| Pemberitahuan | Copyright 2012 The Press Start 2P Project Authors (cody@zone38.net), with Reserved Font Name "Press Start 2P". |
| Pemberitahuan | Copyright 2021 The Pixelify Sans Project Authors (https://github.com/eifetx/Pixelify-Sans). |
| Pemberitahuan | Lisensi: scripts.sil.org/OFL |
| Label | Bunyi |
| Kalimat | Bunyi klik dan bunyi teks dipilih YAN dari halaman uji suara Sehari Setara. (B-2) |
| Tombol | Tutup |

Kedua pemberitahuan hak cipta disalin persis dari metadata berkas huruf (nama 0), dengan titik di akhir. Alamat lisensi ditulis sebagai teks, bukan tautan.

**Teks pengganti untuk `Verifikasi_Rujukan.md` (B-4, diganti pemilik proyek)**

| Lama | Baru |
|---|---|
| Mengubah file ini tidak pernah membuat situs gagal terbit. Baris yang rusak hanya membuat rujukannya dianggap belum terverifikasi. | Sejak rilis 1.0, situs hanya terbit bila semua kotak tercentang dan setiap baris pertama utuh. Selama masih ada kotak kosong atau baris yang rusak, situs yang sedang tayang tetap seperti terbitan terakhir. |

### Data dan aksi bagian B

**Galeri (`app/page.tsx`).** Tepat tiga potongan, tanpa perubahan lain:

1. Baris impor `lucide-react`: `Grid2X2}` menjadi `Grid2X2,Gamepad2}`.
2. Sesudah tombol `journey-cta` "Mulai tantangan": `{current===5&&<a className="journey-cta" href="sehari-setara/"><Gamepad2 size={18}/>Main Sehari Setara</a>}`.
3. Sesudah kalimat pembuka menu ("Pilih galeri untuk meneruskan perjalanan. …"): `<a className="text-control" href="sehari-setara/">Main Sehari Setara</a>`.

**CI (`.github/workflows/deploy-pages.yml`).** Langkah baru sesudah "Uji game":

```yaml
      - name: Periksa verifikasi rujukan
        env:
          RILIS: "1"
        run: npx -y pnpm@11.25.0 content:check
```

**Game**

- `content/copy.ts`: `title.about` ("Tentang") dan `about` (judul, kedua judul kolom, ketiga kalimat kiri, butir kredit berisi label, kalimat, dan pemberitahuan, serta "Tutup").
- `ui/About.tsx` (baru): `AboutDialog({ onClose })`. Penanganan `Tab`, `Esc`, dan `Enter` atau `Spasi` yang ditahan sama persis dengan `HowToDialog`. Bila memungkinkan, penangan itu dipakai bersama tanpa salinan kode.
- `ui/Title.tsx`: tombol keempat dan dialog "Tentang". `TitleFocus.target` ditambah `"tentang"`, dan properti ditambah `about`, `onAbout`, dan `onCloseAbout`.
- `ui/PlayScreen.tsx`: keadaan `about`, beserta `openAbout` dan `closeAbout` yang meniru `openHowTo` dan `closeHowTo`. Setiap pemeriksaan `howTo` di layar judul (kunci masa tunggu, "Mulai", dan kedua pembuka dialog) ikut memeriksa `about`. "Main lagi" dan "Kembali" menutup keduanya.
- `styles/game.css`: kelas `ss-about-text` dan `ss-about-note` (bagian "Tata letak dan ukuran"). Mode warna paksa mengikuti aturan dialog "Cara bermain".
- Mesin, reducer, naskah, rujukan, aset, dan `manifest.ts` tidak berubah.

**Uji**

- `__tests__/opening.test.ts`: teks "Tentang" lengkap, yaitu tanpa kurung siku atau kurawal, tanpa "TBD", "draf", "sementara", atau "sedang dibuat"; memuat "SIL Open Font License 1.1" dan kedua pemberitahuan hak cipta persis seperti tabel.
- `e2e/galeri-integrasi.spec.ts` (baru): kedua tautan, alur galeri → game → galeri dengan klik dan keyboard, main penuh dengan keyboard dari galeri, dan galat (bagian "Rencana uji bagian B").
- `e2e/judul-pengaturan-prolog.spec.ts`: uji baru dialog "Tentang". Uji lama layar judul (daftar dan letak tombol, masa tunggu, urutan Tab, fokus, dan bunyi) disesuaikan untuk empat tombol. Daftar tombol di `e2e/sehari-setara.spec.ts` dan `e2e/alur-permainan.spec.ts` ditambah "Tentang".

### Pemeriksaan rilis 1.0 (bagian B)

| Pemeriksaan | Cara | Syarat |
|---|---|---|
| Anggaran | Jumlah ukuran `dist-pages/assets/` untuk gambar, bunyi, dan huruf game; gzip JS game, React bersama, dan CSS game | Aset ≤ 4 MB; kode JS game ditambah React bersama ≤ 150 KB gzip |
| Waktu siap | Cache kosong, 10 Mbps, latensi 40 ms, 1280×720; layar judul dan pratinjau `#adegan-1`; prosesor biasa dan diperlambat 4×; satu jalan pemanasan lalu lima jalan | Setiap jalan sesudah pemanasan ≤ 3 detik |
| Galat | Uji ujung ke ujung di galeri (layar sambutan, galeri Refleksi, menu) dan di game (main penuh) | 0 galat konsol, 0 galat halaman, 0 respons 4xx/5xx, 0 permintaan ke situs lain |
| Placeholder | `Daftar_Aset.md`; uji aset; pencarian teks di `content/*.ts` dan teks semua layar selama main penuh | Semua aset Disetujui; tanpa kurung siku, kurawal, "TBD", "draf", "sementara", atau "sedang dibuat" |
| Keyboard | Main penuh dengan keyboard dari galeri ke game, lalu kembali ke galeri | Tanpa tetikus, sampai galeri tampil lagi |
| Rujukan | `RILIS=1 content:check` pada `Verifikasi_Rujukan.md` milik pemilik proyek | 14 dari 14, kode 0 |
| Galeri hanya berubah di dua titik | Tiga lapis bukti usulan 7a | Lihat AC-B4 |

### Perubahan dokumen (Build bagian B)

| Berkas | Perubahan |
|---|---|
| `docs/sehari-setara/Architecture.md` | Versi 0.13. Bagian 3: `ui/About.tsx`. Bagian 4: langkah "Periksa verifikasi rujukan", catatan Vinext, dan catatan `tsc` dengan `next-env.d.ts`. Bagian 7: dialog "Tentang" di layar judul. Bagian 10: dialog "Tentang". Bagian 11: kedua titik sudah dibuat, beserta letak dan kelasnya. Bagian 12: uji galeri ujung ke ujung |
| `docs/sehari-setara/Design_System.md` | Bagian 7: dialog "Tentang". Bagian 13: nama, alat, dan lisensi diisi dari B-1 dan B-2 |
| `docs/sehari-setara/PRD.md` | Bagian 13: isi versi 1.0 dan 1.1 (usulan 10a). Bagian 17: baris "Rilis 1.0" (B-5), yang merujuk baris 5 Nov 2026 untuk jawaban bagian 16 nomor 2 |
| `AGENTS.md` | Bagian 6: `RILIS=1 npx pnpm@11.25.0 content:check  # pemeriksaan ketat sebelum rilis` |
| `app/sehari-setara/assets/CREDITS.md` | Bagian "Efek suara": jawaban S-6, atau S-6 tetap terbuka (B-2) |
| `docs/sehari-setara/Daftar_Aset.md` | S-01 dan S-02: asal bunyi, bila S-6 dijawab |
| `PANDUAN_GITHUB_PAGES.md` | Bagian "Memperbarui isi website": situs hanya terbit bila semua kotak di `Verifikasi_Rujukan.md` tercentang; bila tertahan, situs yang sedang tayang tetap seperti terbitan terakhir |
| `docs/sehari-setara/PLAN.md` | Status F-11 dan satu baris "Rilis 1.0" berisi tanggal (B-5) |
| `docs/sehari-setara/specs/F-11-integrasi-galeri-rilis.md` | Status bagian B dan catatan Build |
| `docs/sehari-setara/tests/F-11-hasil.md` | Bagian B, dan tangkapan layar di `tests/F-11/` |

### Di luar cakupan (bagian B)

- Panduan guru satu halaman (keputusan 2a F-10).
- Kembali dari game langsung ke galeri Refleksi, rute Vinext untuk game, dan penanda build untuk menyembunyikan tautan.
- Memperbaiki masalah ESLint lama di `app/page.tsx` dan konflik tipe gambar `next-env.d.ts`.
- Mengubah berkas galeri lain, `github-pages/`, konfigurasi build, dan dependensi.
- Mencentang atau mengubah `Verifikasi_Rujukan.md` oleh agen (B-4).
- Fitur F-13 (layar penuh, ulangi adegan, dan sisa efek suara).

### Kriteria penerimaan (bagian B)

- [ ] AC-B1 Tautan panel: hanya di galeri ke-6, berkelas `journey-cta` dengan ikon `Gamepad2`, bertuliskan "Main Sehari Setara", ber-`href="sehari-setara/"`, di antara "Mulai tantangan" dan "Kembali ke atrium", tanpa tumpang tindih dengan kepala dan kaki halaman di tiga ukuran.
- [ ] AC-B2 Tautan menu: berkelas `text-control`, bertuliskan "Main Sehari Setara", ber-`href="sehari-setara/"`, di antara kalimat pembuka dan daftar galeri, dan terlihat tanpa menggulir di tiga ukuran.
- [ ] AC-B3 Klik pada kedua tautan, serta `Tab` lalu `Enter`, membuka `/ruang-setara/sehari-setara/` dengan "Mulai" berfokus. "Kembali ke galeri" dari layar judul dan dari refleksi membuka `/ruang-setara/`.
- [ ] AC-B4 Galeri hanya berubah di dua titik:
  - kode: `app/page.tsx` dikurangi ketiga potongan identik byte dengan berkas sebelum F-11, dan berkas galeri lain identik byte;
  - build: dibanding build sebelum bagian B, berkas galeri yang berubah hanya `index.html` dan `main-*.js`; CSS galeri dan potongan React bersama identik byte; berkas game yang berubah hanya `sehari-setara/index.html`, JS game, dan CSS game; semua aset identik. Diperiksa lagi sesudah semua dokumen bagian B ditulis;
  - tampilan: tangkapan layar galeri sebelum dan sesudah, di tiga ukuran, hanya berbeda di kedua tautan.
- [ ] AC-B5 Main penuh dengan keyboard dari galeri ke game, lalu kembali ke galeri, tanpa tetikus, dengan 0 galat konsol, 0 galat halaman, 0 respons 4xx/5xx, dan 0 permintaan ke situs lain.
- [ ] AC-B6 Layar judul: empat tombol berurutan, dengan letak dalam ±0,5u dari tabel di empat ukuran; keempatnya ber-`aria-disabled` selama masa tunggu 600 ms; urutan Tab "Mulai", "Cara bermain", "Tentang", "Kembali ke galeri".
- [ ] AC-B7 Dialog "Tentang":
  - peran, nama, dan fokus awal benar; `Tab` hanya beredar antara judul dan "Tutup";
  - `Esc` dan "Tutup" menutup dengan satu bunyi klik, lalu fokus kembali ke "Tentang", dan masa tunggu dihitung lagi;
  - pintasan tidak berlaku dan tidak berbunyi selama dialog terbuka;
  - "Tentang" dan "Cara bermain" tidak terbuka bersamaan;
  - teks sama persis dengan tabel, tanpa teks yang meluap, dengan sisa kolom kanan paling sedikit 10u di empat ukuran.
- [ ] AC-B8 Uji teks "Tentang" di `opening.test.ts` lulus, dan semua butir tabel "Teks yang tampil" bagian B ada di layar.
- [ ] AC-B9 Langkah CI sama persis dengan bagian "Data dan aksi" dan berada di antara "Uji game" dan "Build versi statis". Selama verifikasi belum selesai, `RILIS=1 content:check` gagal dengan jumlah kotak kosong yang benar. Pada berkas pemilik proyek sesudah verifikasi, perintah itu lulus.
- [ ] AC-B10 Dokumen di bagian "Perubahan dokumen" diperbarui.
- [ ] AC-B11 Pemeriksaan rilis 1.0 memenuhi syarat di tabelnya, dan angkanya dicatat di laporan.
- [ ] AC-B12 Pemeriksaan kode:
  - `test`, `content:check`, `build:pages`, dan `test:e2e` lulus;
  - `tsc --noEmit` 0 galat di salinan tanpa `next-env.d.ts`;
  - ESLint `--max-warnings 0` 0 masalah pada berkas game dan uji yang baru atau diubah;
  - masalah ESLint di `app/page.tsx` sama persis dengan sebelum F-11 (4 galat dan 1 peringatan di baris yang sama), tanpa masalah di baris baru;
  - tanpa dependensi baru.
- [ ] AC-B13 Di versi Vinext, alamat `sehari-setara/` diperiksa sekali dan berakhir di halaman 404, sesuai catatan Architecture.

### Rencana uji (bagian B)

| Langkah | Cara | Kriteria |
|---|---|---|
| 1 | `install --frozen-lockfile`, `test`, `content:check`, dan `RILIS=1 content:check` | AC-B8, AC-B9, AC-B12 |
| 2 | `build:pages`, sidik jari SHA-256 dibanding build sebelum bagian B, dan bukti potongan `app/page.tsx` | AC-B4 |
| 3 | `test:e2e` dengan Chromium 153 lewat konfigurasi pengganti di luar repositori, per berkas; `galeri-integrasi.spec.ts` di 1280×720, dan letak tautan di tiga ukuran (B-6) | AC-B1, AC-B2, AC-B3, AC-B5, AC-B6, AC-B7 |
| 4 | Pengukuran anggaran dan waktu siap dengan skrip di luar repositori; pencarian placeholder | AC-B11 |
| 5 | Tangkapan layar di 1280×720, 1024×768, dan 1920×1080: galeri Refleksi (biasa dan berfokus), menu "Daftar materi", layar judul dengan empat tombol, dan dialog "Tentang"; untuk dialog dan layar judul juga di 1366×768 | AC-B4, AC-B7 |
| 6 | `tsc` di salinan bersih dan ESLint, termasuk perbandingan `app/page.tsx` sebelum dan sesudah | AC-B12 |
| 7 | `pnpm dev` sekali, lalu alamat `sehari-setara/` dibuka | AC-B13 |
| 8 | Daftar periksa manual AGENTS bagian 9, dan daftar periksa usulan 9 diserahkan kepada pemilik proyek | — |

Hasil ditulis di bagian B `tests/F-11-hasil.md`. Bila saat Test masih ada kotak kosong, laporan menyebutnya, dan ZIP B hanya untuk ditinjau. ZIP B final disiapkan sesudah pemilik proyek menyatakan verifikasi selesai dan mengirim ZIP `main` terbaru. Isinya memuat baris "Rilis 1.0" (B-5), dan tidak pernah memuat `Verifikasi_Rujukan.md`.

### Catatan Build bagian B

- **[Build]** Penanganan tombol dialog dipakai bersama lewat `useTitleDialog` di `ui/About.tsx`. `HowToDialog` di `ui/Title.tsx` kini memakainya juga, dengan perilaku yang sama; semua uji dialog "Cara bermain" F-10 lulus.
- **[Build]** Selain `ss-about-text` dan `ss-about-note`, ditambahkan `ss-about` (penanda dialog) dan `ss-about-label` (jarak bawah label kredit 0,5u).
- **[Build]** Fungsi uji `tabTo`, `openByKeyboard`, `toQuestion`, dan `playScene` dipindah dari `e2e/judul-pengaturan-prolog.spec.ts` ke `e2e/bantuan.ts`, untuk uji main penuh dari galeri.
- **[Build]** Uji urutan Tab di `e2e/sehari-setara.spec.ts` ikut disesuaikan dengan tombol keempat.
- **[Build]** `CREDITS.md` dan `Daftar_Aset.md` tidak berubah, karena S-6 belum dijawab (B-2).
