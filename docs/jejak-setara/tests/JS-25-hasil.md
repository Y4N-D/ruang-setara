# Hasil uji JS-25 — 28 November 2026

Dibangun dan diuji dalam mode ZIP oleh Sesi A, di atas keadaan sesudah ZIP JS-24 (dari ZIP `main` sesudah commit `4dd3b47`). Mesin agen sama dengan JS-24: Linux dengan satu CPU, Chromium 1243 lewat `JEJAK_CHROMIUM`, serta Worker dan D1 lokal. Pembanding ukuran: keadaan sesudah JS-24 di mesin yang sama.

Satu perintah di mesin agen paling lama 5 menit, jadi uji panjang dijalankan di latar belakang. `test:e2e:jejak` memakai konfigurasi agen yang sama dengan JS-24 (isi sama dengan `playwright.jejak.config.ts`, server dari hasil `build:jejak` yang sudah ada).

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 Durasi 5 menit | Lulus | `POST /api/ruang` menerima 5 dan menolak 0, 7, 25, "lima", dan "5" (uji server); skema ruang baru, `selamat_datang`, dan `info_kelas` menerima 5 dan menolak 12 (uji unit) |
| AC-2 Dialog Ruang baru | Lulus | Uji ujung ke ujung: "5 menit, 10 menit, 15 menit, 20 menit" dengan 15 terpilih; paket inti (16 kejadian) dengan "5 menit" memunculkan catatan yang dirujuk tombol lewat `aria-describedby`, tanpa menolak; catatan hilang saat 15 menit dipilih lagi |
| AC-3 Waktu ronde | Lulus | Uji server: `berakhirPada` − `mulaiPada` = 300.000 ms; Tambah 2 menit menambah 120.000 ms; Akhiri mengakhiri ronde; uji unit langit: jeda membekukan sisa waktu dan tambah waktu menghapus peringatan |
| AC-4 Masa | Lulus | Uji unit: masa di 89,9, 90, 194,9, dan 195 detik = pagi, siang, siang, sore. Uji ujung ke ujung di HP dengan waktu sungguhan: siang 90,4 detik dan sore 195,9 detik sesudah status main (run sebelumnya: 90,3 dan 195,6 detik). |
| AC-5 Peringatan | Lulus | Uji unit: peringatan di sisa 60 dan 1 detik, tidak di 61 dan 0 detik (5 menit); 120 detik untuk ronde lain; bunyi layar kelas sekali saat sisa turun melewati 60 detik (`lewatPeringatan`), tidak saat dimuat. Di HP, pita "Satu menit lagi" tampil 239,9 detik sesudah status main, yaitu di sisa 60 detik (run sebelumnya: 240,7 detik). Bunyi layar kelas didengar pemilik proyek di AC-15 (Catatan Build). |
| AC-6 Kode lama | Lulus | Uji server dan ujung ke ujung: sambungan tanpa `?tambahan` ke ruang 5 menit menerima tepat satu pesan `galat` `VERSI_BERBEDA` (v 6, "Ada pembaruan. Muat ulang halaman.") lalu ditutup 4005, tanpa menunggu `halo` (`menungguHalo` 0); dengan `?tambahan=1` diterima; ruang 15 menit tetap menerima kode lama. Klien yang menerima galat itu berhenti dan tidak menyambung ulang (uji unit) |
| AC-7 Riwayat | Lulus | Uji server: riwayat memuat `durasiMenit` 5. Uji ujung ke ujung: tabel Riwayat ruang memuat kolom "Durasi" sesudah Kode, dan baris ruang itu menampilkan "5 menit"; butir Sesi terakhir dasbor memuat "· 5 menit ·". |
| AC-8 Dasbor | Lulus | Uji server: sesi terakhir memuat `durasiMenit` 5; ringkasan menambah satu sesi, satu `sesiPendek`, dan satu pemain, sedangkan `rataSkor` tidak berubah. Uji komponen: butir sesi "· 5 menit ·" dan catatan "Ruang uji tidak dihitung. Rata-rata skor tanpa ronde 5 menit." |
| AC-9 CSV | Lulus | Uji unit dan server: kolom terakhir "Durasi (menit)" berisi durasi ruang di setiap baris; CSV peserta 17 kolom dan CSV jawaban 19 kolom |
| AC-10 Protokol | Lulus | `PROTOKOL_VERSI` 6, `PROTOKOL_TAMBAHAN` 1; `/api/sehat` = `{"ok":true,"protokol":6,"tambahan":1,"lingkungan":"lokal"}` (uji unit dan server) |
| AC-11 Teks | Lulus | `kerangka.test.ts` dan `ronde-5-menit.test.ts`: teks final JS-25 sama persis dengan spesifikasi (Catatan Build: kunci `riwayatRuang.kolomDurasi`) |
| AC-12 Uji | Lulus | Bagian "Perintah yang dijalankan" |
| AC-13 Beban | Lulus, dengan Temuan 1 | Bagian "Simulasi beban" |
| AC-14 Ukuran | Lulus | Layar pemain +0,11 KB (batas 0,6 KB), konsol awal +0,32 KB (batas 0,8 KB), layar kelas +0,03 KB (batas 0,3 KB) |
| AC-15 Manual | Menunggu pemilik proyek | Ronde 5 menit dari konsol sampai rekap di lingkungan uji, termasuk bunyi peringatan layar kelas |
| AC-16 Dokumen | Lulus | PRD (JFR-01, 11.2, 21), Design System, Architecture (pengaturan ruang, 6.2 tambahan protokol, rute riwayat dan dasbor, CSV), AGENTS 7 butir 14 (versi 0.12), `PLAN.md`, `rilis/v1.2.md`, status dan Catatan Build spesifikasi |

## Perintah yang dijalankan dan hasilnya

| Perintah | Hasil |
|---|---|
| `content:check:jejak` | Lulus, 13 berkas, 395 uji |
| `test:jejak` | Lulus, 95 berkas, 1.487 uji (13 uji baru di `ronde-5-menit.test.ts`, 1 di `jaringan.test.ts`, 1 di `statistik-konsol.test.tsx`, 1 di `kerangka.test.ts`; harapan uji lama diperbarui untuk `/api/sehat`, isian dasbor, kolom CSV, dan daftar durasi) |
| `test:jejak:server` | Lulus, 15 berkas, 77 uji. Run penuh: 75 lulus; 2 gagal karena harapan jumlah kolom CSV di `hasil.uji-server.ts` dan `skill.uji-server.ts` (kolom "Durasi (menit)"). Harapannya diperbarui, lalu keduanya lulus saat diulang; `hasil` sempat terputus sekali saat server lokal sibuk, lalu lulus. `ronde-5-menit.uji-server.ts` baru: 4 uji |
| `build:jejak` tiga kali, lalu `anggaran.mjs` | Lulus, semua di bawah batas |
| `tsc --noEmit` | Lulus |
| ESLint `app/`, `server/`, `scripts/`, dan `e2e/` Jejak, `--max-warnings 0` | Lulus, 0 masalah |
| `test:e2e:jejak` | Lulus, 74 uji di 19 berkas. Run penuh tanpa kedua uji JS-25 (24,6 menit): 69 lulus; 3 gagal karena keluaran yang memang berubah (jumlah kolom dan tajuk CSV di `hasil.uji.ts` dan `skill.uji.ts`, isi `/api/sehat` di `kerangka.uji.ts`). Harapannya diperbarui, lalu `kerangka.uji.ts` (14 uji), `skill.uji.ts` (4), `hasil.uji.ts` (1), dan `ronde-5-menit.uji.ts` (2, termasuk satu ronde 5 menit dengan waktu sungguhan) dijalankan ulang dan lulus. Saat diulang, uji `hasil` sekali gagal karena layar kelas belum tampil dalam 5 detik, dan uji kinerja `skill` sekali gagal di p95 12 ms (Temuan 2); keduanya lulus di run lain |
| `build:pages` | Lulus, 178 berkas identik byte dengan build dasar |
| `sim:beban` | Lulus, dengan Temuan 1 (bagian "Simulasi beban") |

## Simulasi beban

Satu ruang dengan 50 bot di server lokal. Run 1 dan 2 memakai ruang 5 menit dengan lama simulasi 330 detik, dan ronde dibiarkan berakhir sendiri. Run 3 mengulang simulasi JS-18 (ruang 20 menit, 180 detik menjelajah, dengan tunda) untuk memeriksa antrean tunda yang baru.

| Ukuran | Run 1 (5 menit, tanpa tunda) | Run 2 (5 menit, tunda 80 ms + jitter 40 ms) | Run 3 (JS-18, dengan tunda) |
|---|---|---|---|
| Bot yang menerima `selesai` dan rekapnya lolos skema | 50 dari 50 | 50 dari 50 | 50 dari 50 |
| Sambungan putus tak terduga, pesan ditolak server | 0, 0 | 0, 0 | 0, 0 |
| Lama ronde dari status `main` sampai `selesai`, dilihat layar kelas | 301,002 detik | 300,996 detik | (diakhiri guru) |
| Lalu lintas turun per pemain per 15 menit (lobi; menjelajah) | 2,71 MB; 1,31 MB | 2,78 MB; 1,20 MB | 2,81 MB; 1,50 MB |
| Gerak dikoreksi (semua; dalam 1 detik sesudah pindah halte; saat lari) | 0; 0; 0 | 0; 0; 0 | 0; 0; 0 (JS-18: 34; 3; 0) |
| `angkot_tiba` | 83 | 67 | 63 |
| Selang putaran server rata-rata | 100,9 ms | 100,8 ms | 100,6 ms |
| Waktu pulang-pergi p95 | 30 ms | 380 ms | 380 ms |

Pengukuran lama ronde dari sisi bot (`lamaRondeBotMs`) ditambahkan ke skrip sesudah run 1 dan 2, sehingga belum ada angkanya untuk ronde 5 menit. Uji ujung ke ujung di HP mengukur rekap tampil 301,3 detik sesudah status main (run sebelumnya: 301,1 detik; Temuan 1).

Penolakan nama `NAMA_DIPAKAI` (6, 5, dan 8) terjadi saat beberapa bot memilih saran nama yang sama bersamaan; bot lalu memakai saran berikutnya (perilaku JS-03).

## Anggaran ukuran dan kinerja

Gzip level 9 per berkas (zlib Node), tiga build berurutan, dibandingkan dengan keadaan sesudah JS-24.

| Berkas | Sesudah JS-24 | Sesudah JS-25 | Selisih |
|---|---|---|---|
| `pemain.js` | 60.653 sampai 60.656 B | 60.717 sampai 60.719 B | +64 B |
| `protokol.js` (bersama) | 79.745 B | 79.800 B | +55 B |
| `protokol.css` (bersama) | 7.276 B | 7.276 B | 0 |
| `admin.js` | 47.970 sampai 47.973 B | 48.248 sampai 48.252 B | +278 B |
| `admin.css` | 6.062 B | 6.062 B | 0 |
| `LayarKelas.js` | 11.629 B | 11.661 sampai 11.662 B | +33 B |

`anggaran.mjs`: kode layar pemain 144,37 → 144,48 KB (batas 200 KB), kode konsol admin 137,75 → 138,07 KB (batas 350 KB), dan potongan layar kelas 11,36 → 11,39 KB.

## Tangkapan layar

Di `docs/jejak-setara/tests/JS-25/`:

- `dialog-ruang-baru-5-menit.png`: dialog Ruang baru dengan "5 menit" terpilih dan catatan paket 16 kejadian;
- `satu-menit-lagi-731x411.png`: HP dengan pita "Satu menit lagi" di sisa 60 detik;
- `rekap-731x411.png`: layar rekap HP sesudah ronde 5 menit berakhir;
- `riwayat-durasi.png`: tabel Riwayat ruang dengan kolom Durasi;
- `dasbor-durasi.png`: dasbor dengan butir Sesi terakhir yang menyebut 5 menit.

## Temuan

1. **Lama ronde dilihat dari layar kelas sekitar 1 detik di atas 300 detik.**
   - Run 1 mengukur 301,002 detik dari status `main` sampai `selesai` di layar kelas, 2 ms di atas batas "300 detik ± 1 detik" AC-13; run 2 mengukur 300,996 detik.
   - Server menghitung `berakhirPada` tepat `mulaiPada` + 300.000 ms (uji server). Akhir ronde diperiksa di alarm Durable Object (`alarm()` di `inti-ruang.ts`), dan alarm itu di server lokal datang sekitar 1 detik sesudah `berakhirPada`.
   - Perilaku ini sama untuk semua durasi sejak JS-07 dan tidak diubah JS-25: ronde 15 menit juga berakhir sekitar 1 detik sesudah angka sisa waktu menunjukkan 00:00. Uji ujung ke ujung di HP juga mengukur rekap tampil 301,3 detik (dan 301,1 detik di run sebelumnya) sesudah status main.
   - Pilihan: (a, saran) terima; siswa melihat 00:00, lalu rekap tampil sekitar 1 detik kemudian, seperti di v1.1; (b) Plan berikutnya mengakhiri ronde di putaran 100 ms, sehingga rekap tampil paling lama sekitar 0,1 detik sesudah 00:00.
2. **Uji waktu di mesin agen** (sama dengan Temuan 2 laporan JS-24). Di JS-25, uji kinerja `skill.uji.ts` sekali gagal (p95 12 ms dari batas 4 ms) dan uji `hasil.uji.ts` sekali gagal karena layar kelas belum tampil dalam 5 detik, keduanya saat berkasnya dijalankan terpisah; keduanya lulus di run penuh atau run berikutnya. Pemeriksaan penentu tetap "Jejak: uji" di GitHub.

## Keputusan: Lulus

Semua kriteria yang bisa diuji agen lulus, dengan Temuan 1 untuk diputuskan pemilik proyek. AC-15 diperiksa pemilik proyek di lingkungan uji sesudah "Jejak: uji" hijau.
