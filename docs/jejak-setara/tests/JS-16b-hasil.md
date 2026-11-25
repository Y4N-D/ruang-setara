# Hasil uji JS-16b — 25 November 2026

Huruf VT323, kode QR, kode masuk ulang, tombol lobi 48 px, dan pilihan lingkungan "Jejak: admin awal", sesuai spesifikasi [JS-16b-tampilan.md](../specs/JS-16b-tampilan.md) (disetujui 25 Nov 2026, D-1 sampai D-4 = a).

Diuji di mesin agen (Linux, Node 22.23.5, pnpm 11.25.0, Chromium 1243). Uji ujung ke ujung dijalankan dengan `JEJAK_CHROMIUM` per kelompok berkas, karena batas waktu satu perintah di mesin agen. Tidak ada rilis produksi di akhir JS-16b; produksi naik ke v1.0 sesudah panduan guru (JS-16c).

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 | Lulus | `huruf.test.ts`: `@fontsource/vt323` 5.3.0, Jejak hanya mengimpor `vt323/latin-400.css`, Sehari Setara tetap memakai huruf lamanya; `build:pages` 178 berkas identik byte |
| AC-2 | Lulus, dengan tambahan | `huruf.test.ts`: tidak ada nama huruf lama di `jejak.css` dan `kelas.css`; setiap pemakaian token berpasangan dengan `font-size-adjust`. Ditambah dua token tinggi baris (penyimpangan 2) |
| AC-3 | Lulus dengan penyimpangan 1 | Seluruh 63 uji ujung ke ujung lulus di empat ukuran, termasuk uji huruf dan kredit yang diperbarui; tanpa luapan sesudah ukuran teks 0,64 |
| AC-4 | Lulus dengan penyimpangan 1 | `huruf.test.ts`: label nama memakai keluarga dari token dan faktor 8/7 (13 px menjadi 15 px) |
| AC-5 | Lulus | `qr.test.ts`: 32 matriks sama persis dengan contoh `lean-qr` mode byte (versi 1, 4, 7, 10 × 8 mask); versi dan mask otomatis sama dengan rujukan qrcodegen Nayuki di 10 teks; tautan produksi versi 4 (33 modul) |
| AC-6 | Lulus | `masuk-ulang.uji.ts`: isi jalur QR sama dengan alamat `{tautan}/?kode={kode}`; sisi sedikitnya 36u di 1024 × 768, 1280 × 720, dan 1920 × 1080 |
| AC-7 | Lulus | `masuk-ulang.uji.ts`: `Q` dan tombol membuka lapisan, `Esc` dan `Q` menutupnya dengan fokus kembali, `L` tidak mengunci ruang selama lapisan terbuka, lapisan tertutup saat ronde dimulai |
| AC-8 | Lulus | Modul QR hanya di potongan layar kelas (`LayarKelas`, 10,22 KB; sebelumnya 7,94 KB); kode layar pemain tetap di bawah anggaran |
| AC-9 | Lulus | `masuk-ulang.uji-server.ts`: kode 6 karakter, berlaku sekitar 10 menit; galat rute; log audit `ruang.kode_masuk_ulang` tanpa kode. Penolakan guru yang bukan pemilik memakai pemeriksaan kepemilikan rute `kelola` yang sudah diuji sejak JS-10 |
| AC-10 | Lulus | `masuk-ulang.test.ts` (6 uji): pindah sambungan dengan token baru dan 4001; sekali pakai; kedaluwarsa; kode baru menggantikan; terkunci, penuh, terlambat, dan nomor absen dilewati; dikeluarkan dan ditutup ditolak; kesalahan kelima 1008; token dan kode bersamaan melanggar |
| AC-11 | Lulus | `masuk-ulang.uji-server.ts`: kode tetap berlaku sesudah server dimatikan lalu dinyalakan lagi dengan keadaan yang sama |
| AC-12 | Lulus | `masuk-ulang.uji.ts`: HP pertama bergabung; guru membuat kode di konsol; HP kedua salah format, salah kode, lalu masuk dengan kode huruf kecil; nama sama; HP pertama menampilkan pesan perangkat lain dan tetap berhenti |
| AC-13 | Lulus | `masuk-ulang.uji.ts`: dialog konsol menampilkan kode, petunjuk, jam berlaku dengan sisa waktu, tombol salin, dan tombol tutup |
| AC-14 | Lulus | `PROTOKOL_VERSI` 5; skema kelas menolak `kode_masuk_ulang` (`protokol.test.ts`) |
| AC-15 | Lulus | `sim:beban` lulus: 54.750 pesan masuk, sekitar 2.795 permintaan Durable Object per ruang, perkiraan 17.690 permintaan per sesi 15 menit per ruang; waktu pulang-pergi median 20 ms dan p95 140 ms |
| AC-16 | Lulus | `masuk-ulang.uji.ts`: "Kunci ruang" dan "Mulai" sedikitnya 48 px di ketiga ukuran layar kelas |
| AC-17 | Lulus | `kerangka.test.ts`: pilihan `pilih`, `uji`, `produksi` dengan bawaan `pilih`; pesan `pilihLingkungan` sebelum pemeriksaan rahasia Cloudflare; "Jejak: hentikan" tetap |
| AC-18 | Lulus | `gabung.uji.ts:130` menunggu 20 detik dan lulus; `skill.uji.ts` dijalankan utuh dan sendirian lebih dulu, lalu sekali lagi di akhir; keduanya lulus 4 dari 4 |
| AC-19 | Lulus | `kerangka.test.ts`: teks di `TEKS` dan `TEKS_KONSOL` cocok dengan tabel spesifikasi; kunci langkah bergabung yang dihapus tidak dipakai lagi |
| AC-20 | Lulus | Perintah lengkap di bawah; tangkapan layar di `tests/JS-16b/` dan tangkapan layar uji lama yang diperbarui ke VT323 (JS-09 sampai JS-15) |
| AC-21 | Lulus | Design System 0, 3.6, 5, dan 15; Architecture 1, 6.3, 6.7, 6.8, dan 10; PRD 7 dan 21; PLAN |

## Perintah yang dijalankan dan hasilnya

| Perintah | Hasil |
|---|---|
| `pnpm add @fontsource/vt323@5.3.0 --save-exact` | Lockfile diperbarui; satu paket baru |
| `content:check:jejak` | 386 uji lulus |
| `test:jejak` | 90 berkas, 1.376 uji lulus |
| `tsc --noEmit` | Bersih |
| `test:jejak:server` | 13 berkas, 70 uji lulus (dua kelompok) |
| `test:e2e:jejak` | 15 berkas, 63 uji lulus (enam kelompok; `skill.uji.ts` pertama dan terakhir) |
| `sim:beban` | Lulus (AC-15) |
| `build:jejak` dan anggaran | Lulus semua butir |
| `build:pages` | 178 berkas, identik byte dengan build dasar |

## Anggaran ukuran

| Butir | Ukuran | Batas | Hasil |
|---|---|---|---|
| Kode layar pemain (gzip) | 140,52 KB | 200 KB | Lulus (sebelumnya 139,57 KB) |
| Kode konsol admin (gzip) | 136,98 KB | 350 KB | Lulus (sebelumnya 135,98 KB) |
| Seluruh aset layar pemain | 233,46 KB | 2.048 KB | Lulus (sebelumnya 242,36 KB; satu huruf menggantikan dua) |
| Potongan layar kelas | 10,22 KB | — | Sebelumnya 7,94 KB; pembuat QR |

## Temuan

1. **Penyimpangan 1 — ukuran teks VT323 0,64, bukan 0,7.** Dengan `cap-height 0.7`, pilihan jawaban di HP 640 × 360 menjadi tiga baris dan isi dialog meluap 27 px (`skill.uji.ts`, dulu 0). Penyebabnya, VT323 berlebar tetap, jadi huruf i, l, dan spasi selebar huruf lain. Dengan `cap-height 0.64`, tinggi huruf kecil VT323 sama dengan huruf teks lama (0,45 em) dan semua uji lulus. Label nama di kanvas ikut memakai faktor 8/7. Saran: (a) diterima; (b) kembali ke 0,7, dengan dialog di HP kecil boleh digulir sampai 27 px dan uji dilonggarkan.
2. **Penyimpangan 2 — dua token tinggi baris.** VT323 yang diperbesar `font-size-adjust` membuat tinggi baris `normal` lebih besar (judul kejadian 13 px menjadi sekitar 23 px), sehingga dialog di HP 915 × 356 meluap. 48 aturan yang dulu memakai tinggi baris `normal` kini memakai `--js-huruf-judul-baris` (1) atau `--js-huruf-teks-baris` (1,2), sama dengan tinggi baris bawaan huruf lama. Saran: (a) diterima.
3. **Perbaikan klien: ping sesudah diterima.** Saat kode masuk ulang salah, klien terlanjur mengirim ping sebelum diterima ruang. Server menutup sambungan itu dengan 4002, lalu klien menyambung ulang dengan kode salah yang sama berulang kali. Ping kini dimulai sesudah `selamat_datang`. Alur nomor absen yang ditolak ikut terhindar dari hal yang sama.
4. **Jalur SVG QR memakai perintah mutlak.** Perintah relatif berangka negatif di jalur SVG ("h" diikuti minus satu) terbaca Tailwind galeri sebagai nama kelas tinggi, sehingga `build:pages` sempat berbeda. Dengan perintah mutlak (`H`, `V`, `Z`), galeri kembali identik.
5. **Penyesuaian uji lama:**
   - tombol "Masuk" di uji ujung ke ujung dicari dengan nama persis, karena kini ada tombol "Masuk dengan kode dari guru";
   - pita "Petunjuk dipakai di Langkah 1." di HP 915 × 356 kini satu baris, karena VT323 lebih sempit;
   - `nama.uji.ts` memeriksa QR, bukan langkah bergabung yang dihapus;
   - uji teks JS-04, JS-10, dan JS-14 mengecualikan kunci yang diubah JS-16b.
6. **Nama kunci teks** di spesifikasi disesuaikan dengan kelompok yang ada: `detail.*` untuk konsol, `masukUlang.diganti`, ditambah baris `galat.KODE_MASUK_ULANG_SALAH` dan `detail.kodeMasukUlangTutup`. Isi kalimatnya tidak berubah.
7. **Mesin agen:** uji `skill.uji.ts:405` yang di JS-16a gagal karena kinerja mesin kali ini lulus dua kali. Penyimpangan 1 dan 2 JS-16a selesai ditindaklanjuti.

## Uji manual pemilik proyek

Tidak ada langkah produksi di JS-16b. Bila ingin melihat langsung di lingkungan uji sesudah push: buka layar kelas sebuah ruang uji (QR, tombol `Q`), lalu coba kode masuk ulang dengan dua HP.

## Keputusan: Lulus

Lulus, dengan penyimpangan 1 dan 2 yang perlu diterima pemilik proyek (saran a).
