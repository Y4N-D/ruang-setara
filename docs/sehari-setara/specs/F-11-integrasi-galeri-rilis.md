# F-11 — Integrasi dengan galeri Ruang Setara, layar "Tentang", dan rilis 1.0

| | |
|---|---|
| Status | Bagian A: disetujui 5 November 2026 (`Spesifikasi disetujui: F-11 bagian A`; saran V-1 sampai V-4 dipakai), dibangun tanpa perubahan dari spesifikasi, dan diuji dengan keputusan Lulus ([laporan](../tests/F-11-hasil.md)). Bagian B: belum ditulis; disusun sesudah ZIP A diserahkan (keputusan Gerbang 1, usulan 1a dan 6a) |
| Tanggal | 5 November 2026 |
| Rencana | `docs/sehari-setara/PLAN.md`, entri F-11 (disetujui 5 November 2026, balasan `Setuju: F-11`; saran setiap usulan diterima) |
| Isi bagian A | Perbaikan uji daftar centang (AC-5 F-03) dan penyelarasan baris rujukan PRD bagian 8, sebagai paket pendahuluan yang boleh di-commit sebelum pemilik proyek mencentang |

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

Belum ditulis. Disusun sesudah ZIP A diserahkan, mengikuti usulan 2 sampai 12 rencana F-11. Yang dibutuhkan dari pemilik proyek paling lambat di Gerbang 2 bagian B:

- nama yang ditampilkan di layar "Tentang" (`CREDITS.md` memakai "YAN", Design System bagian 13 masih "[nama pengembang]");
- jawaban S-6: siapa atau alat apa yang membuat bunyi klik dan bunyi teks di halaman uji suara, dan lisensinya.
