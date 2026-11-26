# Hasil uji JS-21 — 25 November 2026

Spesifikasi: [JS-21-musik.md](../specs/JS-21-musik.md) (`Spesifikasi disetujui: JS-21`, D-1 sampai D-3 = a). Dikerjakan dalam mode ZIP dari ZIP `main` 25 Nov 2026 ditambah isi ZIP Gerbang 1 dan Gerbang 2, dengan Chromium 1243 di mesin agen. Tangkapan layar ada di [JS-21/](JS-21/).

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 Syarat dan status | Lulus | Uji unit "syarat musik untuk setiap status ruang dan keadaan sambungan" (8 status × 7 keadaan sambungan). Di `kelas.uji.ts`, `data-musik` bernilai `berbunyi` di lobi, saat bermain, dan sesudah lanjut, lalu `diam` saat hitung mundur, jeda, podium, dan pembahasan |
| AC-2 Berulang dan posisi | Lulus | Uji unit "berhenti dengan keluar pelan, lalu lanjut dari posisi terakhir": sumber ber-`loop`, mulai di `start(0, 0)`, lalu lanjut di `start(0, 11,6)` sesudah berbunyi 50 detik. Satu posisi per tab (D-3 a) |
| AC-3 Masuk dan keluar pelan | Lulus | Uji unit: penguat musik naik dari 0 ke 1 dalam 0,08 detik, turun ke 0 dalam 0,08 detik saat berhenti, dan sumber dihentikan pada akhir turun. Berhentinya musik dan jingle `akhir` dipicu oleh perubahan status ke `selesai` yang sama |
| AC-4 Tombol | Lulus | `kelas.uji.ts`: bawaan nyala; `aria-pressed`, `aria-label`, dan `aria-keyshortcuts="U"` sesuai; tombol Musik 50 × 48, 62 × 48, dan 89 × 48 px di kiri tombol suara; tulisan tertahan tampil di kiri tanpa menggeser tombol (jaraknya sama dengan tanpa tulisan); tombol tampil di lobi, saat bermain, podium, dan pembahasan, dan tidak tampil di "Ruang ditutup" |
| AC-5 Ruang kepala | Lulus | Jarak isi kanan kepala ke tombol Musik: lobi dan podium 11, 27, dan 60 px; saat bermain ("Sisa …") 13, 30, dan 65 px, di 1024 × 768, 1280 × 720, dan 1920 × 1080 |
| AC-6 `U` dan pengumuman | Lulus | `U` membalik pilihan dan mengumumkan "Musik dimatikan." atau "Musik dinyalakan."; `Alt+U` dan tekanan berulang karena tombol ditahan diabaikan; `U` bekerja saat panel Pemain terbuka; `jejak:musik-kelas` bernilai `mati` dan bertahan sesudah tab dimuat ulang |
| AC-7 Tombol suara | Lulus | Saat bermain, `M` membuat musik diam tanpa mengubah `aria-pressed` tombol Musik, dan `M` lagi membuat musik berbunyi |
| AC-8 Unduhan | Lulus | `musik_kelas` diminta sekali per muat layar kelas (dua kali muat, dua permintaan), dan tidak pernah dari halaman konsol guru atau ketiga HP pemain. Uji unit: tidak diunduh selama musik mati, lalu diunduh sekali saat dinyalakan |
| AC-9 Tertahan | Lulus | Uji unit: konteks `suspended` menghasilkan `tertahan`, lalu `berbunyi` sesudah dilanjutkan. `kelas.uji.ts` (D-2 a): tulisan "Klik untuk menyalakan suara" tampil di lobi sebelum ketukan pertama dan hilang sesudahnya |
| AC-10 Galat | Lulus | Uji unit: unduhan gagal membuat musik diam, efek tetap berbunyi, dan unduhan dicoba sekali lagi; sesudah dua kali gagal tidak dicoba lagi; tanpa Web Audio musik diam tanpa galat. `kelas.uji.ts` tidak mencatat galat halaman |
| AC-11 Tab lama | Lulus | Uji unit: `musikSeharusnya` bernilai salah untuk sambungan `diganti` (4001), `terputus`, `ditutup`, dan `tidakAda` |
| AC-12 Ukuran | Lulus dengan catatan | Potongan layar kelas 10,25 → 11,13 KB (+0,88 KB). Kode layar pemain tetap 140,52 KB. Konsol awal 136,98 → 137,08 KB (+0,10 KB), karena lima teks baru berada di `TEKS_KONSOL` seperti ditetapkan bagian Teks spesifikasi (temuan 1, diterima pemilik proyek). `anggaran.mjs`: musik latar 826,92 KB dari 1.024 KB, lulus |
| AC-13 Uji JS-14 tetap lulus | Lulus | `suara.test.ts` (18 uji), `pengaturan.uji.ts`, `nama.uji.ts` (suara layar kelas), dan `kelas.uji.ts` lulus. Tidak ada uji lama yang memakai letak tulisan tertahan, jadi tidak ada selektor yang perlu diubah |
| AC-14 Perintah resmi | Lulus dengan catatan | Semua perintah lulus (bagian berikut). ESLint Jejak: 0 galat baru dari JS-21, tetapi masih ada 2 galat lama dari v1.0 (temuan 2) |
| AC-15 Manual | Menunggu | Diperiksa pemilik proyek di lingkungan uji dengan langkah di bagian "Temuan" |
| AC-16 Dokumen | Lulus | Dokumen utama diperbarui di ZIP Specify; ZIP ini memperbarui status spesifikasi, PRD 21, dan `PLAN.md` |
| AC-17 Tangkapan layar | Lulus | 15 berkas di `tests/JS-21/`: kepala lobi tertahan, lobi musik mati, lobi, saat bermain, dan podium, masing-masing di tiga ukuran layar kelas |

## Perintah yang dijalankan dan hasilnya

| Perintah | Hasil |
|---|---|
| `content:check:jejak` | 12 berkas, 386 uji lulus |
| `test:jejak` | 90 berkas, 1.387 uji lulus (10 uji baru: 9 uji musik dan 1 uji teks JS-21) |
| `test:jejak:server` | 13 berkas, 70 uji lulus (dua kelompok, karena batas sekitar 5 menit per perintah) |
| `build:jejak` | Berhasil |
| `test:e2e:jejak` | 15 berkas, 62 uji lulus, dalam delapan kelompok. Satu uji `jaringan.uji.ts` (AC-15 JS-12) gagal sekali dalam kelompoknya, lalu lulus saat diulang sendiri (temuan 3) |
| `tsc --noEmit` | Bersih |
| ESLint untuk `app/jejak-setara`, `server/jejak-setara`, `e2e/jejak-setara`, dan `scripts/jejak-setara` | 2 galat lama, 0 galat baru (temuan 2) |
| `build:pages` | 178 berkas, identik byte dengan build dari ZIP `main` |

## Simulasi beban

Tidak wajib: JS-21 tidak menyentuh protokol, inti ruang, atau kiriman ke D1 (AGENTS 4.4 butir 6).

## Anggaran ukuran dan kinerja

| Butir | Sebelum (Plan v1.1) | Sesudah | Batas |
|---|---|---|---|
| Kode layar pemain (gzip) | 140,52 KB | 140,52 KB | 200 KB |
| Kode konsol admin (gzip) | 136,98 KB | 137,08 KB | 350 KB |
| Potongan layar kelas (gzip) | 10,25 KB | 11,13 KB | +1 KB (AC-12) |
| Musik latar `musik_kelas.wav` | Belum terbangun | 826,92 KB | 1.024 KB |
| Seluruh aset layar pemain | 233,46 KB | 233,46 KB | 2.048 KB |

Musik hanya diunduh laptop guru, sekali per muat layar kelas, dan hanya bila musik nyala. Sesudah diurai, musik memakai sekitar 7,4 MB memori laptop guru (percobaan Plan).

## Temuan

1. **Konsol awal naik 0,10 KB.** Kriteria AC-12 menulis kode konsol awal "tidak berubah", padahal bagian Teks spesifikasi menaruh lima teks baru di `TEKS_KONSOL`, yang dimuat konsol bersama teks konsol lainnya. Pemilik proyek tidak keberatan dengan saran untuk menerimanya (25 Nov 2026). Spesifikasi berikutnya menulis batas kenaikan konsol, bukan "tidak berubah".
2. **Dua galat ESLint lama.** `react-hooks/set-state-in-effect` di `admin/halaman/DetailRuang.tsx` (baris 65) dan di efek Perbesar QR `admin/kelas/LayarKelas.tsx` sudah ada di ZIP `main` v1.0; pemeriksaan berkas aslinya menghasilkan dua galat yang sama. "Jejak: uji" tidak menjalankan ESLint, jadi keduanya tidak membuat run merah. JS-21 sempat menambah satu galat serupa, yang sudah diperbaiki: keadaan musik kini datang lewat `pantau()`. Kedua galat lama dicatat untuk diperbaiki di fitur berikutnya ("Catatan untuk Plan berikutnya").
3. **Satu uji jaringan gagal sekali.** "Layar kelas ditutup 60 detik lalu dibuka lagi" menunggu nama pemain di layar kelas paling lama 20 detik. Uji itu gagal saat berjalan sesudah tiga uji jaringan berproksi dalam satu kelompok, lalu lulus saat diulang sendiri (81 detik). Kegagalan itu tidak berkaitan dengan musik: halaman layar kelas di uji itu tidak menerima ketukan, jadi kode musik tidak mengunduh atau memutar apa pun.
4. **Tabel teks spesifikasi.** Kunci di bagian Teks spesifikasi ditulis lengkap (`kelas.musik`, dan seterusnya), agar uji teks otomatis bisa membacanya. Isi teksnya tidak berubah.
5. **Pemeriksaan manual (AC-15).** Chromium di mesin agen tidak punya pengeras suara, jadi bunyi musik diperiksa pemilik proyek di lingkungan uji:
   1. Sesudah push dan "Jejak: uji" hijau, buka layar kelas di laptop yang tersambung ke proyektor atau pengeras suara.
   2. Klik sekali di layar kelas: musik lobi terdengar pelan.
   3. Gabung dengan satu HP, lalu Mulai: musik berhenti selama 3, 2, 1, lalu terdengar lagi saat ronde berjalan.
   4. Jeda, lalu Lanjut: musik berhenti, lalu lanjut dari posisi terakhir.
   5. Tekan `U`, lalu klik tombol Musik: musik mati, lalu nyala. Tik hitung mundur dan jingle tetap terdengar walaupun musik mati.
   6. Tekan `M`: semua bunyi mati. Tekan `M` lagi: musik kembali.
   7. Akhiri ronde: musik berhenti dan jingle terdengar. Podium dan pembahasan tanpa musik.
   8. Dengarkan sambungan putaran musik setiap 38,4 detik: tanpa jeda dan tanpa letup.

## Keputusan: Lulus

Semua kriteria yang bisa diuji di mesin agen lulus, dua di antaranya dengan catatan (AC-12 dan AC-14). AC-15 menunggu pemeriksaan manual pemilik proyek di lingkungan uji. Bila ada yang tidak sesuai, kirim keterangannya kepada Sesi A.
