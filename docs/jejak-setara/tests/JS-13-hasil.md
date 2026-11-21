# Laporan uji JS-13 — Statistik per kejadian lintas ruang dan isi dasbor

| | |
|---|---|
| Spesifikasi | [specs/JS-13-statistik.md](../specs/JS-13-statistik.md) (disetujui 21 November 2026; D-1, D-2, dan D-3 pilihan a) |
| Tanggal | 21 November 2026 |
| Sesi | Sesi A (mesin), mode ZIP dari `main` commit `676b821` ditambah ZIP Gerbang 1 dan 2 JS-13 |
| Lingkungan | Node 22.23.5, pnpm 11.25.0, Chromium 1243 (Playwright), Miniflare 4.20260515 |
| Status | Semua kriteria otomatis lulus; menunggu uji manual pemilik proyek dan `Diterima: JS-13` |

## Ringkasan

Halaman Statistik (`#/statistik`), API `GET /api/statistik/kejadian`, isi dasbor baru, dan kueri riwayat yang dihemat sudah dibangun. Semua perintah uji lulus. Kode layar pemain tidak naik, dan kode konsol naik 4,44 KB gzip. Pada data tiruan 300 ruang, satu permintaan dengan saringan bawaan membaca sekitar 65 ribu baris dalam 21 ms waktu D1 lokal. Dasbor tidak membaca tabel jawaban. Angka statistik dicocokkan dengan hasil per ruang dan CSV jawaban JS-11 di Worker lokal dengan ronde sungguhan.

## Perintah dan hasil

| Perintah | Hasil | Catatan |
|---|---|---|
| `pnpm content:check:jejak` | 259 uji lulus | Tidak berubah |
| `pnpm test:jejak` | 1.121 uji lulus (72 berkas) | 22 uji baru di `__tests__/statistik/` ditambah uji teks JS-13; uji rute, izin, dan teks JS-04 diperbarui |
| `pnpm test:jejak:server` | 62 uji lulus (10 berkas) | Dijalankan dalam tiga kelompok berkas (28, 24, dan 10 uji), karena satu perintah di lingkungan agen dibatasi sekitar 300 detik. Termasuk uji baru `statistik.uji-server.ts` |
| `pnpm test:e2e:jejak` | 50 uji lulus (10 berkas) | Dijalankan per berkas atau per kelompok berkas karena batas yang sama; dua uji baru di `statistik.uji.ts` |
| `pnpm build:jejak` | Berhasil | Ukuran di bawah |
| `pnpm build:pages` | 178 berkas, identik byte dengan `main` | Galeri tidak berubah |
| `tsc --noEmit`, ESLint berkas Jejak | Bersih | |
| `sim:beban` | Tidak dijalankan | Tidak wajib (AGENTS 4.4): JS-13 tidak menyentuh protokol, inti ruang, atau kiriman ke D1 |

## Kriteria penerimaan

| AC | Hasil | Bukti |
|---|---|---|
| AC-1 Izin dan rute | Lulus | `api-statistik.test.ts` (401, 405, 400, 404 jalur lain), `izin.test.ts`, `rute.test.ts`, e2e menu admin dan guru |
| AC-2 Ruang dan jawaban yang dihitung | Lulus | `api-statistik.test.ts` (ruang uji, tidak dimainkan, `main`, `selesai`, `pembahasan`, `ditutup`, pemain dikeluarkan, jawaban tanpa Langkah 1); uji server (ruang uji dan pemain dikeluarkan tidak dihitung) |
| AC-3 Definisi | Lulus | `statistik-inti.test.ts` dan `api-statistik.test.ts`: setiap isian, median ganjil, genap, dan seri, pilihan keliru seri, Petunjuk, kategori di 0,29, 0,30, 0,70, dan 0,71 |
| AC-4 Per versi | Lulus | Dua versi menjadi dua baris dengan teks masing-masing, di uji unit dan uji server (versi 2 diterbitkan admin di tengah uji) |
| AC-5 Cocok dengan hasil per ruang | Lulus | `statistik.uji-server.ts`: dijawab, benar, dan ketiga tingkat sama dengan hasil per ruang; jumlah baris CSV jawaban tanpa "Dikeluarkan" sama dengan dijawab |
| AC-6 Kueri hemat | Lulus | `rencana-kueri.test.ts` (`ruang_dibuat`/`ruang_pemilik` lalu `jawaban_ruang`, tanpa penelusuran penuh `jawaban`); empat pernyataan dalam dua perjalanan (`api-statistik.test.ts`) |
| AC-7 Saringan dan jawaban API | Lulus | `api-statistik.test.ts` (batas tanggal, label, guru, paket, pilihan paket, skema) |
| AC-8 Halaman Statistik | Lulus | `statistik.uji.ts` (bawaan D-2a dan parameter `dari`, galat tanggal tanpa permintaan, Atur ulang, urutan tanpa permintaan, Data sedikit, satu rincian terbuka, keadaan kosong guru); `statistik-konsol.test.tsx` |
| AC-9 Tampilan | Lulus | `statistik.uji.ts`: tanpa luapan halaman di 1280 × 720, 1024 × 768, 1920 × 1080, dan 360 × 640 dengan rincian terbuka; tabel tidak digulir di 1280 dan 1024; semua kendali ≥ 48 px |
| AC-10 Aksesibilitas | Lulus | Rincian dibuka dengan papan ketik, `aria-expanded`, judul `h2` dan `h3`, `th scope`, teks pembaca layar batang (e2e dan uji tampilan) |
| AC-11 API dasbor | Lulus | `api-statistik.test.ts` (Siap tinjau, sesi terakhir D-1a, ringkasan, tidak ada kueri yang menyebut `jawaban`); uji server dasbor guru |
| AC-12 Kartu dasbor | Lulus | `statistik.uji.ts` (empat kartu, tautan Rujukan dan Kejadian, dua kolom di 1280, satu kolom di 360, keadaan kosong); `statistik-konsol.test.tsx` (nama guru untuk admin D-3a, tanda Uji) |
| AC-13 Kueri riwayat | Lulus | Uji riwayat JS-11 (unit, server, e2e `hasil.uji.ts`) tetap lulus tanpa perubahan harapan; rencana kueri memakai `ruang_dibuat` |
| AC-14 Teks | Lulus | `kerangka.test.ts`: 79 kunci teks JS-13 sama persis dengan spesifikasi |
| AC-15 Ukuran dan kinerja | Lulus | Bagian "Ukuran kode" dan "Pengukuran kueri" |
| AC-16 Tanpa regresi | Lulus | Bagian "Perintah dan hasil" |

## Pengukuran kueri

Data tiruan berbenih dari percobaan Plan JS-13 (migrasi repositori 0001 dan 0002, 16 kejadian bank awal), D1 lokal Miniflare, kueri dan fungsi yang sama dengan `db/statistik.ts` dan `db/ruang.ts`. Angka adalah median lima kali jalan, dijumlahkan untuk semua pernyataan setiap permintaan (`meta.rows_read` dan `meta.duration`). Skripnya sementara dan tidak masuk repositori; cara mengulangnya: bangun data tiruan seperti percobaan Plan, lalu panggil `bacaStatistik`, `sesiTerakhir`, `ringkasanDasbor`, dan `daftarRiwayat` dengan binding D1 Miniflare yang dibungkus pencatat `meta`.

| Permintaan | 300 ruang (144 ribu jawaban) | 1.200 ruang (768 ribu jawaban) |
|---|---|---|
| Statistik admin, saringan bawaan 30 hari | 64.595 baris, 21 ms | 315.101 baris, 99 ms |
| Statistik admin, semua waktu | 772.534 baris, 275 ms | 3.903.099 baris, 1.438 ms |
| Statistik satu guru, 30 hari | 20.747 baris, 8 ms (108 ruang) | 125.371 baris, 39 ms (433 ruang) |
| Statistik satu guru, semua waktu | 271.418 baris, 86 ms | 1.425.469 baris, 476 ms |
| Dasbor: sesi terakhir dan ringkasan 30 hari | 448 baris, 1 ms | 523 baris, 2 ms |
| Riwayat ruang halaman pertama (50 ruang) | 4.334 baris, 2 ms | 4.334 baris, 1 ms |

Ambang AC-15 (300 ruang, saringan bawaan: paling lama 100 ms dan paling banyak 100 ribu baris) terpenuhi. Sebagai pembanding, kueri riwayat sebelum JS-13 membaca sekitar 101 ribu baris pada data 1.200 ruang (percobaan Plan).

## Ukuran kode

Gzip tingkat 9 atas JS dan CSS yang dimuat halaman, dibandingkan dengan build `main` sebelum Build:

| Halaman | Sebelum | Sesudah | Selisih | Anggaran |
|---|---|---|---|---|
| Layar pemain (`/`) | 126,85 KB JS + 6,23 KB CSS = 133,08 KB | 126,85 KB JS + 6,23 KB CSS = 133,08 KB | 0 KB | 200 KB |
| Konsol (`/admin/`) | 120,90 KB JS + 10,93 KB CSS = 131,83 KB | 124,63 KB JS + 11,64 KB CSS = 136,27 KB | +4,44 KB | +6 KB (AC-15); 350 KB |

## Tangkapan layar

Di [tests/JS-13/](JS-13/), dari `statistik.uji.ts` (data halaman Statistik admin memakai jawaban API tiruan 18 versi; dasbor dan halaman guru memakai API sungguhan):

- `statistik-1280x720.png`, `statistik-1920x1080.png`: tabel lengkap dengan rincian K-01 terbuka.
- `statistik-1024x768.png`: enam kolom.
- `statistik-360x640.png`: kartu di HP, bagian atas.
- `statistik-kosong-1280x720.png`: guru tanpa ruang.
- `dasbor-1280x720.png`: admin, empat kartu dua kolom, peringatan rujukan dan Siap tinjau.
- `dasbor-360x640.png`: guru, satu kolom.

## Temuan dan perubahan uji lama

- Kartu peringatan rujukan di dasbor ternyata belum menautkan ke `#/rujukan`, walaupun JS-12 P-3 menyebutnya (temuan Specify JS-13). JS-13 memasangnya.
- `api-akun.test.ts` (JS-04) memeriksa isi jawaban dasbor secara persis; harapannya ditambah isian JS-13.
- `konsol.uji.ts`: daftar menu memuat Statistik, peringatan rujukan dipilih menurut teksnya karena admin kini punya dua peringatan, uji papan ketik menekan satu Tab lagi untuk menu Statistik, dan kalimat "Belum ada sesi kelas." diganti pemeriksaan judul kartu, karena kartu Sesi terakhir kini berisi ruang yang dibuat uji lain.
- `kerangka.test.ts`: kunci teks JS-13 dikecualikan dari uji teks JS-04, seperti fitur sebelumnya.
- Pembantu uji baru: `catatRuangUji` di `server/jejak-setara/uji/bantuan.ts` (ruang biasa milik guru dikendalikan layar kelas di uji) dan `app/jejak-setara/__tests__/statistik/isiUji.ts`.

## Risiko yang tersisa

- Rentang semua waktu pada data setahun membaca sekitar 3,9 juta baris (1,4 detik) per permintaan. Selama paket gratis D1 (5 juta baris per hari, dipakai bersama), sebaiknya rentang semua waktu tidak dibuka berkali-kali dalam sehari. Bawaan 30 hari jauh lebih ringan.
- Persentase dari data sedikit mudah berubah; versi dengan kurang dari 10 jawaban selesai diberi tanda "Data sedikit".
- Di basis data uji, ruang biasa yang dimainkan sebelum JS-09 tercatat tanpa Petunjuk, sehingga kolom Petunjuk bisa lebih rendah untuk ruang lama.

## Uji manual pemilik proyek

1. Pastikan "Jejak: uji" hijau sesudah push.
2. Jalankan satu ronde pendek di ruang biasa (kotak "Ruang uji" tidak dicentang) dengan dua atau tiga HP sampai ronde berakhir, lalu tutup ruangnya.
3. Di konsol sebagai admin, buka Statistik. Periksa bahwa "Dari tanggal" sudah terisi, buka Rincian satu kejadian, dan cocokkan jumlahnya dengan hasil ruang tadi dan CSV jawabannya.
4. Kosongkan "Dari tanggal", klik Terapkan, lalu coba "Urutkan: Paling sulit dulu".
5. Buka Dasbor: empat kartu, ruang tadi di "Sesi terakhir", dan angka "Ringkasan 30 hari terakhir".
6. Masuk dengan akun guru uji: Statistik hanya memuat ruang guru itu, dan kartu Peringatan tidak memuat "Siap tinjau".
7. Kirim tangkapan layar Statistik dengan rincian terbuka dan Dasbor, lalu balas `Diterima: JS-13` bila sesuai.
