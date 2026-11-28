# Hasil uji JS-24 — 28 November 2026

Dibangun dan diuji dalam mode ZIP dari ZIP `main` sesudah commit `4dd3b47` (27 Nov 2026), oleh Sesi A dengan akun baru. Mesin agen: Linux dengan satu CPU dan tanpa GPU, Chromium 1243 lewat `JEJAK_CHROMIUM`, serta Worker dan D1 lokal. Pembanding ukuran dan kinerja: build `main` yang sama sebelum perubahan, di mesin yang sama.

Mesin agen membatasi satu perintah paling lama 5 menit. Karena itu `test:e2e:jejak` dijalankan per kelompok berkas dengan konfigurasi agen di luar repositori. Isinya sama dengan `playwright.jejak.config.ts`, tetapi server uji memakai hasil `build:jejak` yang sudah ada (`server-lokal.mjs --tanpa-build`), sehingga build tidak diulang di setiap kelompok. `test:jejak:server` dijalankan dalam tiga perintah.

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 Layar penuh | Lulus | `kontrol-sentuh.uji.ts`. Panel lobi, ikon HUD, dan tombol di Menu memanggil `requestFullscreen` lalu `lock("landscape")` (mata-mata). Penolakan peramban tidak menimbulkan galat atau peringatan konsol. Tombol hilang selama layar penuh dan tampil lagi sesudah keluar, di HP dan laptop |
| AC-2 Ikon HUD | Lulus, dengan Temuan 1 | Di keenam ukuran, kotak ikon tepat 48 × 48 px di `left` 8 px dan `top` 92 px HUD. Ikon tidak tampil di lobi, hitung mundur, selama peta besar, panel, dan layar penuh. Jarak terdekat: tombol Menu 8 px, bilah atas 64 px, pita terlebar 91,5 px (HUD 610), peta mini 429,5 px, Periksa 473,5 px, dan tombol skill 289,5 px. Kotak kelompok Menu, dasar kotak aman panah Kompas, mencakup baris kedua. Selama jeda ikon tampil, tetapi berada di bawah lapisan jeda bersama Menu dan suara (Temuan 1) |
| AC-3 Tombol di Menu | Lulus | Baris kaki "Layar penuh, Privasi, Tentang, Tutup" satu baris, setiap tombol setinggi 48 px di 610 × 343, 640 × 360, dan 731 × 411. Isi panel tidak perlu digulir di 640 × 360; di 915 × 356 tergulir 4 px seperti sebelum JS-24. Ditekan: layar penuh, orientasi dikunci, panel tertutup, dan fokus kembali ke dunia. Ditolak: panel tetap terbuka dan tombolnya tetap tampil |
| AC-4 Panel lobi | Lulus | Tampilan tidak berubah. Jari kedua pada "Layar penuh" selama analog dipegang di lobi memasuki layar penuh |
| AC-5 Jari kedua | Lulus | HP 731 × 411, analog dipegang dan avatar berjalan. Peta mini membuka peta besar dan peta besar tetap terbuka. Menu membuka panel tanpa pilihan berubah. Lari cepat tanpa muatan menampilkan "Cari kotak sepatu.". Lari cepat bermuatan mengirim tepat satu `pakai_skill`, `data-lari` menjadi "ya", x terus bertambah (1.486, 1.546, 1.603, 1.659 setiap 550 ms), dan tidak ada laporan berhenti sampai jari analog diangkat. Suara terbalik sekali. Ikon layar penuh memasuki layar penuh. Periksa membuka dialog di `situasi1`, dan Angkot berkarcis di halte membuka mode "Pilih halte tujuan" tanpa halte terpilih; keduanya dengan analog di zona diam, karena pemain harus tetap dalam jangkauan |
| AC-6 Urutan terbalik | Lulus | Jari di tombol suara lebih dulu, lalu analog dipegang dan avatar berjalan, lalu jari tombol diangkat: suara terbalik sekali |
| AC-7 Satu jari | Lulus | Ketukan satu jari pada peta mini, Menu, suara, Kompas tanpa muatan, Periksa, dan ikon layar penuh masing-masing bereaksi sekali. Tidak ada satu pun `click` yang tercatat di tingkat jendela selama ketukan sentuh pada tombol HUD, juga di AC-5, AC-6, dan AC-8 |
| AC-8 Tidak ada aksi | Lulus | Uji unit: angkat 8,01 px di luar kotak, jari yang bergeser masuk, `pointercancel`, dan tombol yang sudah terlepas. Uji ujung ke ujung: jari diangkat 12 px di luar Lari cepat dan jari yang bergeser masuk dari dunia tidak memunculkan pita |
| AC-9 Tetikus dan papan ketik | Lulus | Laptop 1280 × 720: klik peta mini, `Esc`, `P`, `Esc` membuka dan menutup Menu (fokus kembali ke dunia), `Enter` pada tombol Menu, `Spasi` pada tombol suara, klik ganda tetikus pada tombol suara (membalik sekali), `M`, `1`, `5`, klik pada tombol skill, `E` di dekat kejadian, dan klik ikon layar penuh. Uji lama yang memakai `click()` dan `tap()` lulus |
| AC-10 Joystick berakhir | Lulus | Peta besar, panel Menu, dialog dan menunggu Periksa, mode pilih halte, `P`, perubahan ukuran tampilan, dan layar penuh: lingkaran hilang dan avatar diam. Sesudah lapisan ditutup, jari yang sama tidak menggerakkan avatar. Sentuhan baru memulai joystick lagi |
| AC-11 Joystick tetap | Lulus | Sesudah jari kedua mengetuk Lari cepat atau suara, avatar terus berjalan. Jari ketiga di separuh kiri tidak memindahkan lingkaran dan tidak mengubah arah |
| AC-12 Ukuran | Lulus | Layar pemain: JS +0,90 KB (batas 1,2 KB) dan gaya +0,03 KB (batas 0,15 KB). Konsol awal +0,03 KB (batas 0,3 KB). Isi potongan layar kelas sama persis sesudah nama berkas berhash disamakan; gzip-nya +2 bita karena nama berkas berhash di dalamnya berubah (bagian "Anggaran") |
| AC-13 Perintah resmi | Lulus, dengan Temuan 2 | Bagian "Perintah yang dijalankan" |
| AC-14 Tangkapan layar | Lulus | `tests/JS-24/` (daftar di bawah) |
| AC-15 Manual di HP | Menunggu pemilik proyek | Butir "Manual di HP" spesifikasi, di lingkungan uji sesudah push |
| AC-16 Dokumen | Lulus | Design System 3.3, 3.4, 10, dan 13; Architecture 9; PRD 17, 20 (KT-19), dan 21; AGENTS 5 (versi 0.11); `PLAN.md`; status dan Catatan Build spesifikasi |

## Perintah yang dijalankan dan hasilnya

| Perintah | Hasil |
|---|---|
| `install --frozen-lockfile` | Lulus, lockfile tidak berubah |
| `content:check:jejak` | Lulus, 13 berkas, 395 uji |
| `test:jejak` | Lulus, 94 berkas, 1.474 uji (13 uji baru di `tekanHud.test.ts` dan 2 di `masukan.test.ts`) |
| `test:jejak:server`, tiga perintah | Lulus, 14 berkas, 73 uji: (1) akun, bank, biaya, dunia, hasil: 36 uji (145 detik); (2) kejadian, kelas, masuk-ulang, nama, produksi: 17 uji (96 detik); (3) ruang, skill, statistik, teropong-angkot: 20 uji (140 detik) |
| `build:jejak` tiga kali, lalu `anggaran.mjs` | Lulus, semua di bawah batas |
| `tsc --noEmit` | Lulus |
| ESLint `app/`, `server/`, `scripts/`, dan `e2e/` Jejak, `--max-warnings 0` | Lulus, 0 masalah |
| `test:e2e:jejak`, sepuluh kelompok | Lulus, 73 uji di 18 berkas, dengan Temuan 2: (1) `bank`, `gabung`, `hasil`, dan `dunia` tanpa uji kinerja: 12 (3,9 menit); (2) uji kinerja `dunia.uji.ts`: gagal sekali, lulus pada run ulang; (3) `jaringan` putus 30 detik dan 2 menit: 2 (3,6 menit); (4) `jaringan` latensi dan layar kelas ditutup: 2 (1,8 menit); (5) `skill`: 4 (2,8 menit); (6) `kinerja` dan `kerangka`: 16 (50 detik); (7) `kejadian`, `kelas`, dan `masuk-ulang`: 7 (3,4 menit); (8) `konsol` dan `medan`: 15 (1,8 menit); (9) `nama`, `pengaturan`, `statistik`, dan uji HUD `teropong-angkot`: 7, sedangkan uji panjang "Teropong dan Angkot" lulus pada percobaan keempat; (10) kelima uji `kontrol-sentuh` sekaligus dan uji dialog Ruang baru `teropong-angkot`: 6 (2,1 menit) |
| `build:pages` | Lulus, 178 berkas identik byte dengan build dasar |
| `sim:beban` | Tidak dijalankan: tidak wajib, karena protokol, inti ruang, dan kiriman ke D1 tidak berubah (AGENTS 4.4 butir 6) |

## Simulasi beban (bila wajib)

Tidak wajib untuk JS-24.

## Anggaran ukuran dan kinerja

Gzip level 9 per berkas (zlib Node), tiga build berurutan. Build kedua `pemain.js` berbeda 3 bita, dan `admin.js` berbeda 3 bita di build pertama dan ketiga.

| Berkas | Dasar | Sesudah JS-24 | Selisih |
|---|---|---|---|
| `pemain.js` | 59.736 B | 60.653 sampai 60.656 B | +917 sampai +920 B |
| `protokol.js` (bersama) | 79.745 B | 79.745 B | 0 |
| `protokol.css` (bersama) | 7.250 B | 7.276 B | +26 B |
| `admin.js` | 47.973 B | 47.970 sampai 47.973 B | −3 sampai 0 B |
| `admin.css` | 6.062 B | 6.062 B | 0 |
| `LayarKelas.js` | 11.627 B | 11.629 B | +2 B (isi sama; hanya nama berkas berhash) |

`anggaran.mjs`: kode layar pemain 143,44 → 144,37 KB (batas 200 KB), kode konsol admin 137,72 → 137,75 KB (batas 350 KB), dan potongan layar kelas 11,35 → 11,36 KB.

**Kinerja gambar dunia** (uji kinerja `dunia.uji.ts`, CPU normal, p95 waktu kode gambar per bingkai, batas 4 ms):

- JS-24 run pertama: 6 ms (gagal);
- kode dasar di mesin yang sama: 4 ms (lulus, tepat di batas);
- JS-24 run ulang: 2 ms (lulus).

Kode gambar dunia tidak diubah JS-24. Hasilnya berubah-ubah karena mesin agen hanya punya satu CPU, dengan beban 3 sampai 4 selama uji ujung ke ujung.

## Tangkapan layar

Di `docs/jejak-setara/tests/JS-24/`:

- `hud-ikon-hp-731x411.png`, `hud-ikon-hp-915x356.png` (dunia 610 × 343), `hud-ikon-hp-640x360-r3.png`, dan `hud-ikon-laptop-1280x720.png`: HUD dengan ikon layar penuh di bawah tombol Menu;
- `menu-layar-penuh-610x343.png` dan `menu-layar-penuh-731x411.png`: panel Menu dengan "Layar penuh" di baris kaki;
- `jari-kedua-pita-731x411.png`: pita "Cari kotak sepatu." sesudah jari kedua mengetuk Lari cepat, dengan analog dipegang dan avatar berjalan;
- `jari-kedua-peta-besar-731x411.png`: peta besar sesudah jari kedua mengetuk peta mini, tanpa lingkaran joystick;
- `jeda-ikon-731x411.png`: jeda, dengan kelompok Menu di bawah lapisan jeda (Temuan 1).

## Temuan

1. **Kelompok Menu di bawah lapisan jeda.** Selama jeda, ikon layar penuh tampil. Seperti tombol Menu dan suara sejak v1.1, ikon itu berada di bawah lapisan jeda yang tembus pandang, sehingga tidak bisa diketuk sampai ronde dilanjutkan.
   - Uji mencatat ketiga tombol "tidak di atas" lapisan jeda.
   - Design System 3.3, JS-14 P-5, dan baris "Jeda" di tabel status JS-24 menulis ketiganya di atas lapisan jeda.
   - Penyebabnya, lapisan jeda (`LapisanJeda` di `App.tsx`, `z-index` 30) menutupi seluruh layar dunia, termasuk HUD-nya.
   - Pilihan:
     - (a, saran) terima untuk v1.2, karena perilakunya sama dengan Menu dan suara di v1.1;
     - (b) perbaiki di JS-24 dengan memindahkan lapisan jeda ke dalam layar dunia di bawah kelompok Menu;
     - (c) perbaiki terpisah sesudah rilis v1.2.
   - **Keputusan pemilik proyek (28 Nov 2026): pilihan a.** Diterima untuk v1.2, dan kode tidak berubah.
2. **Uji waktu di mesin agen.** Uji ujung ke ujung yang memeriksa batas waktu kadang gagal di mesin agen yang hanya punya satu CPU.
   - Uji panjang "Teropong dan Angkot" (JS-18) dengan kode JS-24 lulus 1 dari 6 percobaan. Kegagalannya ada di tiga titik:
     - peta layar kelas belum tampil dalam 15 detik (empat kali);
     - pengumuman "Teropong aktif selama 30 detik." terlewat karena tidak ada bingkai dalam 1 detik sesudah skill aktif (sekali);
     - avatar hilang dari halte asal dalam 529 ms dengan batas 500 ms (sekali).
   - Dengan kode dasar di mesin yang sama, uji itu lulus 2 dari 3 percobaan, dan gagal sekali di titik peta layar kelas yang sama.
   - Uji kinerja dunia gagal sekali dan lulus pada run ulang (bagian "Anggaran").
   - Bagian uji yang mengetuk tombol skill dan memilih halte lulus sampai titik-titik itu.
   - Pemeriksaan penentunya adalah alur kerja "Jejak: uji" di GitHub sesudah push. Bila merah, kirim tangkapan layarnya ke Sesi A.
3. **Catatan, bukan perubahan.** Panel Menu yang dibuka dengan `Enter` pada tombol Menu tidak mengembalikan fokus ke tombol itu. Penyebabnya, tombol Menu disembunyikan selama panel terbuka (JS-14 P-5), seperti di v1.1. Fokus kembali ke dunia bila panel dibuka dari dunia, juga sesudah tombol "Layar penuh" di Menu dipakai. Dicatat untuk Specify berikutnya di `PLAN.md`.

## Keputusan: Lulus

Semua kriteria yang bisa diuji agen lulus. Temuan 1 diterima pemilik proyek (pilihan a, 28 Nov 2026). AC-15 diperiksa pemilik proyek di lingkungan uji sesudah "Jejak: uji" hijau.
