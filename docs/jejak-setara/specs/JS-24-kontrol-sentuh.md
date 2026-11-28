# JS-24 — Kontrol sentuh dan layar penuh

Status: **Disetujui (28 Nov 2026)**: `Setuju: JS-24, JS-25` dan `Spesifikasi disetujui: JS-24, JS-25`, dengan D-1, D-2, dan D-3 = a. Dibangun dan diuji 28 Nov 2026 ([laporan](../tests/JS-24-hasil.md)). Plan dan spesifikasi ditulis sekaligus atas instruksi pemilik proyek. Dasar: entri "Rencana v1.2" di `PLAN.md` (spesifikasi ini memakai saran a untuk usulan 1 sampai 8 dan KT-19), spesifikasi JS-07 (P-13, P-14, P-26, P-42, P-43), JS-08 (P-21 sampai P-24), JS-09 (P-33 sampai P-38), JS-14 (P-4 sampai P-10), dan JS-18 (P-19 sampai P-21 dan P-28).

## Ringkasan

Pemilik proyek menemukan dua masalah kontrol saat mencoba v1.1 di HP. Keduanya sudah ada sejak v1.0:

1. Tombol "Layar penuh" hanya ada di panel lobi dan hilang saat ronde mulai. Siswa yang tidak sengaja keluar dari layar penuh, atau lupa masuk, tidak bisa masuk lagi.
2. Ketukan jari kedua di tombol skill, Periksa, peta mini, atau Menu tidak bereaksi selama jari pertama memegang analog (joystick). Penyebabnya terbukti di percobaan Plan: tombol HUD memakai `onClick`, dan peramban hanya membuat `click` untuk ketukan satu jari. Ketukan jari kedua (pointer bukan utama) sampai ke tombol sebagai `pointerdown` dan `pointerup`, tetapi tanpa `click`.

JS-24 menambah ikon layar penuh di bawah tombol Menu selama ronde dan tombol "Layar penuh" di panel Menu, keduanya dengan penguncian orientasi mendatar seperti P-43 JS-07. Semua tombol HUD bereaksi pada jari yang mengetuknya, juga selama jari lain memegang analog, tepat sekali dan tanpa klik nyasar ke lapisan yang baru terbuka. Tetikus dan papan ketik di laptop tidak berubah. Joystick yang sedang dipegang berakhir saat sebuah lapisan menutupi dunia atau ukuran tampilan berubah.

Perubahan hanya di layar pemain. Server, protokol (`PROTOKOL_VERSI` tetap 6), basis data, konsol, dan layar kelas tidak berubah.

## Kaitan PRD

- JFR-09: joystick sentuh di separuh kiri dunia. JFR-55 dan JFR-57: pengaturan pemain dan permainan penuh dengan papan ketik.
- PRD 4 dan 12: HP Android mendatar, target sentuh ≥ 48 px, dan kompatibilitas Chrome Android serta Safari iOS.
- Design System 3.3 (HUD HP: tombol "Layar penuh" di lobi, kelompok Menu dan suara), 3.4 (laptop), 10 (tombol), dan 13 (aksesibilitas).
- Spesifikasi JS-07 P-13 (joystick satu jari, pointer `pointerId`), P-14 (kapan bisa bergerak), P-43 (layar penuh), JS-14 P-6 (sentuhan yang dimulai di tombol tidak memulai joystick) dan P-7 (kotak aman panah Kompas).

## Berkas

| Berkas | Jenis | Isi |
|---|---|---|
| `app/jejak-setara/pemain/tekanHud.ts` | Baru | Aturan ketukan tombol HUD (P-7 sampai P-12): bagian murni yang bisa diuji tanpa peramban dan pengikat React untuk tombol |
| `app/jejak-setara/pemain/layarPenuh.ts` | Baru | `masukLayarPenuh` dan `useBisaLayarPenuh`, dipindah dari `PanelLobi.tsx` tanpa perubahan perilaku (P-1) |
| `app/jejak-setara/pemain/PanelLobi.tsx` | Diubah | Memakai `layarPenuh.ts`; tombol "Layar penuh" memakai aturan ketukan (P-5, P-7) |
| `app/jejak-setara/pemain/PanelPengaturan.tsx` | Diubah | Tombol Menu, suara, dan ikon layar penuh di kelompok Menu (P-2); tombol "Layar penuh" di baris kaki panel Pengaturan (P-4); aturan ketukan (P-7) |
| `app/jejak-setara/pemain/TombolSkill.tsx`, `TombolPeriksa.tsx`, `PetaMini.tsx` | Diubah | Aturan ketukan (P-7) |
| `app/jejak-setara/pemain/LayarDunia.tsx` | Diubah | Ikon layar penuh di kelompok Menu selama ronde (P-2, P-3); joystick berakhir saat lapisan muncul atau ukuran tampilan berubah (P-13 sampai P-15) |
| `app/jejak-setara/pemain/App.tsx` | Diubah | Panel Pengaturan menerima aksi layar penuh dan menutup diri sesudah layar penuh dimulai (P-4) |
| `app/jejak-setara/pemain/dunia/masukan.ts` | Diubah | Cara mengakhiri joystick mana pun tanpa melepas tombol papan ketik (P-13) |
| `app/jejak-setara/styles/jejak.css` | Diubah | Kelompok Menu dua baris (`.js-hud-kiri` berbentuk kisi) dan ikon layar penuh (P-2) |
| `app/jejak-setara/__tests__/dunia/tekanHud.test.ts` | Baru | Uji unit aturan ketukan |
| `app/jejak-setara/__tests__/dunia/masukan.test.ts` | Diubah | Joystick berakhir tanpa jari diangkat |
| `e2e/jejak-setara/kontrol-sentuh.uji.ts` | Baru | Uji ujung ke ujung dua pointer sentuh, ikon dan tombol layar penuh, joystick, serta laptop |
| `docs/jejak-setara/tests/JS-24-hasil.md` dan `docs/jejak-setara/tests/JS-24/` | Baru | Laporan dan tangkapan layar Test |
| Dokumen utama | Diubah | Design System 3.3, 3.4, 10, dan 13; Architecture 9; PRD 21; AGENTS 5 (P-17) |

Tidak disentuh: server, `app/jejak-setara/inti/`, protokol, migrasi D1, konsol, layar kelas, `package.json`, lockfile, alur kerja, `wrangler.jsonc`, aset dan `manifest.ts`, berkas Sesi B dan C, Sehari Setara, dan galeri. Tidak ada teks baru: label ikon dan tombol Menu memakai `TEKS.dunia.layarPenuh` ("Layar penuh") yang sudah ada.

## Perilaku

### A. Layar penuh

- **P-1. Satu cara masuk.** Ketiga tombol layar penuh (panel lobi, ikon di HUD, dan tombol di Menu) menjalankan cara yang sama dengan P-43 JS-07: `document.documentElement.requestFullscreen()`, lalu `screen.orientation.lock("landscape")` bila tersedia. Penolakan peramban dan kegagalan mengunci diabaikan tanpa pesan dan tanpa galat konsol. Tombol layar penuh hanya tampil bila `document.fullscreenEnabled` bernilai benar dan `document.fullscreenElement` kosong. Nilai itu dihitung ulang setiap `fullscreenchange`. Di peramban yang tidak mendukung (misalnya Safari di iPhone), ketiga tombol tidak pernah tampil.
- **P-2. Ikon di HUD.** Diberikan status `main` atau `jeda`, kelompok Menu sedang tampil (P-5 JS-14), dan layar penuh bisa dimasuki (P-1), maka kelompok Menu memuat tombol ketiga, yaitu ikon layar penuh, di baris kedua tepat di bawah tombol Menu.
  - Letak: kiri sejajar tombol Menu, 8 px di bawahnya. Kotaknya di HUD menjadi `left` 8 px dan `top` 92 px, di ketiga ukuran HP dan di laptop.
  - Bentuk: 48 × 48 px, garis `ink` 4 px, latar `cream`, `ikon_layar_penuh` 16 × 16 pada skala 2 di tengahnya, seperti tombol suara. Fokus dan keadaan ditekan sama dengan tombol suara (P-4 JS-14).
  - `aria-label` "Layar penuh" (DRAF D-1). Tanpa tanda `kbd` dan tanpa pintasan papan ketik, juga di laptop.
  - Kelompok Menu menjadi kisi dua kolom (Menu, suara; lalu ikon di bawah Menu). Saat ikon tidak tampil, letak Menu dan suara sama dengan JS-14.
- **P-3. Kapan ikon tidak tampil.** Ikon tidak tampil di status `lobi` dan `hitung_mundur` (tombol panel lobi yang berlaku, P-5), selama kelompok Menu tidak tampil (dialog, peta besar, lapisan menyambung ulang, ajakan memutar HP, atau panel terbuka), dan selama layar penuh atau di peramban yang tidak mendukung. Kotak aman panah Kompas (P-7 JS-14) dihitung dari kotak seluruh kelompok, sehingga ikut meluas ke baris kedua selama ikon tampil.
- **P-4. Tombol di Menu.** Baris kaki panel Pengaturan (P-9 JS-14) berisi "Layar penuh", "Privasi", "Tentang", lalu "Tutup" bila layar penuh bisa dimasuki (P-1) (DRAF D-2), dan sama dengan JS-14 bila tidak. Tombol bergaya `js-tombol` setinggi 48 px. Ketika ditekan, P-1 dijalankan. Begitu layar penuh dimulai, panel tertutup seperti ditekan "Tutup", dan fokus kembali menurut P-10 JS-14 (DRAF D-3). Bila peramban menolak, panel tetap terbuka dan tombolnya tetap tampil. Panel Privasi dan Tentang tidak memuat tombol ini. Aturan ini berlaku di setiap layar yang bisa membuka Menu: layar identitas, dunia, dan rekap.
- **P-5. Panel lobi.** Tombol "Layar penuh" di panel lobi tetap seperti P-26 dan P-43 JS-07, kini dengan aturan ketukan P-7 sampai P-12.
- **P-6. Keluar dari layar penuh.** Diberikan pemain keluar dari layar penuh (misalnya dengan gerakan kembali di HP), maka tombol layar penuh yang sesuai tampil lagi: ikon di HUD selama ronde, tombol panel lobi di lobi, dan tombol di Menu. Keluar dari layar penuh lewat tombol tidak termasuk JS-24.

### B. Ketukan pada tombol HUD

- **P-7. Tombol HUD.** Aturan ketukan berlaku untuk kelima tombol skill (JS-09 dan JS-18), tombol Periksa (JS-08), peta mini (JS-07), tombol Menu dan suara (JS-14), ikon layar penuh (P-2), dan tombol "Layar penuh" di panel lobi (P-5). Tombol di dalam dialog kejadian, peta besar, panel Menu, dan layar lain tetap memakai klik, karena joystick berakhir saat lapisan itu terbuka (P-13).
- **P-8. Jari yang mengetuk.** Diberikan sebuah jari (pointer berjenis `touch`) menekan tombol HUD T, ketika jari itu diangkat dengan titik angkat di dalam kotak T yang diperluas 8 px ke setiap sisi, maka aksi T berjalan tepat sekali. Hal ini berlaku apa pun jari lain yang sedang menyentuh layar, misalnya jari yang memegang analog, dan apa pun urutannya: analog lebih dulu lalu tombol, atau tombol lebih dulu lalu analog. Aksi berjalan saat peramban mengirim `touchend` untuk jari itu, sehingga masih dalam ketukan yang sama. Peramban yang tidak mengirim `touchend` menjalankan aksi pada giliran berikutnya.
- **P-9. Tidak ada aksi.** Aksi tidak berjalan bila:
  1. jari diangkat di luar kotak T yang diperluas 8 px;
  2. jari mulai di luar T, lalu bergeser masuk ke T;
  3. sentuhan dibatalkan peramban (`pointercancel`);
  4. T sudah hilang dari layar saat aksinya akan berjalan, misalnya karena jari lain lebih dulu membuka sebuah lapisan.
- **P-10. Tepat sekali.** Untuk setiap sentuhan yang dimulai di tombol HUD, layar pemain mencegah peramban membuat klik dan peristiwa tetikus pengganti (`preventDefault` pada `touchend`). Dengan begitu:
  - aksi tidak berjalan dua kali;
  - tidak ada klik yang jatuh ke lapisan yang baru terbuka, misalnya tombol "Tutup peta", pilihan di panel Menu, tombol halte, atau "Lihat pilihan" di dialog.

  Sebagai pengaman tambahan, tombol HUD mengabaikan klik yang berasal dari sentuhan (`pointerType` "touch") dan klik yang tiba kurang dari 800 ms sesudah aksi sentuh di tombol yang sama.
- **P-11. Tetikus, papan ketik, dan pena tidak berubah.** Klik tetikus, `Enter` atau `Spasi` pada tombol yang terfokus, dan ketukan pena menjalankan aksi lewat klik seperti sebelumnya. Klik ganda tetikus pada tombol suara tetap membalik suara sekali (P-4 JS-14). Pintasan `Esc`, `M`, `P`, `E`, dan `1` sampai `5` tidak berubah.
- **P-12. Fokus.** Ketukan sentuh tidak memindahkan fokus papan ketik ke tombol, karena klik pengganti dicegah (P-10). Panel Menu yang dibuka dengan ketukan mengembalikan fokus ke unsur yang terfokus sebelum panel dibuka, biasanya kanvas dunia, saat panel ditutup (P-10 JS-14).

**Aturan per tombol selama analog dipegang.** Aksinya sama dengan aksi klik di spesifikasi asalnya.

| Tombol | Aksi | Joystick yang sedang dipegang |
|---|---|---|
| Lari cepat, Kompas kejadian, Teropong | Memakai skill bila boleh; selain itu pita bantuan (P-37 JS-09) | Tetap. Avatar terus berjalan, dan berlari bila Lari cepat aktif |
| Petunjuk (di luar dialog) | Pita "Petunjuk dipakai di Langkah 1." | Tetap |
| Angkot | Berkarcis dan dekat halte: mode "Pilih halte tujuan" (P-19 JS-18). Selain itu pita bantuan | Berakhir bila mode pilih halte terbuka (P-13); selain itu tetap |
| Periksa | Dalam jangkauan: laporan berhenti, lalu `periksa` (P-23 JS-08). Di luar jangkauan: tidak ada | Berakhir sejak menunggu jawaban Periksa (P-13); di luar jangkauan tetap |
| Peta mini | Membuka peta besar | Berakhir |
| Menu | Membuka panel Pengaturan | Berakhir |
| Suara | Membalik suara | Tetap |
| Ikon layar penuh dan tombol panel lobi | P-1 | Berakhir bila layar penuh dimulai (P-14); bila ditolak, tetap |

### C. Joystick

- **P-13. Lapisan.** Diberikan joystick sedang dipegang, ketika peta besar (termasuk mode "Pilih halte tujuan"), panel Menu, dialog kejadian, keadaan menunggu jawaban Periksa, lapisan menyambung ulang, atau ajakan memutar HP muncul, maka joystick berakhir: lingkarannya hilang dan pemain berhenti. Jari yang sama tidak menggerakkan pemain lagi. Jari itu harus diangkat lalu menyentuh dunia lagi (P-13 JS-07). Aturan ini juga berlaku bila lapisan dibuka dengan papan ketik, misalnya `P` atau `Esc`.
- **P-14. Ukuran tampilan.** Diberikan joystick sedang dipegang, ketika ukuran tampilan berubah (`resize` atau `orientationchange`) atau layar penuh dimulai atau berakhir (`fullscreenchange`), maka joystick berakhir seperti P-13, karena letak dunia di layar ikut berubah.
- **P-15. Tombol tanpa lapisan.** Ketukan tombol HUD yang tidak membuka lapisan (skill selain Angkot di halte, Petunjuk di luar dialog, suara, dan Periksa di luar jangkauan) tidak mengubah joystick.
- **P-16. Satu analog.** Joystick tetap mengikuti satu jari (P-13 JS-07). Jari kedua di separuh kiri dunia yang tidak berada di tombol tidak memulai joystick kedua dan tidak mengambil alih joystick pertama.

### D. Dokumen

- **P-17. Dokumen.** Sesudah kedua gerbang, perilaku ini dicatat di Design System 3.3 (ikon layar penuh di kelompok Menu, tombol HUD dengan jari kedua), 3.4, 10, dan 13; Architecture 9 (aturan ketukan tombol HUD); PRD 21; AGENTS 5; dan `PLAN.md`. Perubahan dokumen utama ikut ZIP Build.

## Beberapa pemain sekaligus

- Perubahan hanya di layar pemain masing-masing. Server, pesan, dan layar pemain lain tidak berubah.
- Layar pemain mengirim laporan berhenti saat joystick berakhir (P-13, P-14), seperti saat jari diangkat (P-16 JS-07), sehingga pemain lain dan layar kelas melihat avatar berhenti.
- Masuk atau keluar dari layar penuh tidak mengirim pesan apa pun ke server.

## Status antarmuka

| Keadaan | Tombol layar penuh | Kelompok Menu |
|---|---|---|
| Layar identitas dan rekap | Hanya tombol di panel Menu (P-4) | Seperti JS-14, tanpa ikon |
| Lobi dan hitung mundur | Tombol panel lobi (P-5) dan tombol di Menu | Menu dan suara, tanpa ikon |
| Ronde berjalan | Ikon di bawah Menu (P-2) dan tombol di Menu | Dua baris |
| Jeda | Ikon di atas lapisan jeda, bersama Menu dan suara | Dua baris |
| Dialog, peta besar, menyambung ulang, ajakan memutar HP, panel | Tidak tampil | Tidak tampil (P-5 JS-14) |
| Sudah layar penuh | Tidak tampil | Satu baris |
| Peramban tanpa dukungan layar penuh | Tidak tampil | Satu baris |
| Fokus (papan ketik) | Garis luar `sun` 4 px berjarak 2 px | Seperti JS-14 |
| Ditekan | Bergeser 2 px | Seperti JS-14 |
| Laptop | Ikon tampil di bawah Menu, tanpa `kbd` | Menu dan suara dengan `kbd` `Esc` dan `M` |
| Joystick dipegang, tombol HUD diketuk | Aksi berjalan sekali (tabel di bagian B) | Tetap |

## Teks yang tampil (final)

Tidak ada teks baru.

| Kunci | Teks | Dipakai |
|---|---|---|
| `dunia.layarPenuh` (sudah ada) | Layar penuh | Tombol panel lobi, `aria-label` ikon HUD, dan tombol di Menu |

## Data, protokol, API, dan migrasi

- Pesan protokol: tidak ada yang baru atau berubah; `PROTOKOL_VERSI` tetap 6.
- Rute API, server, Durable Object, dan D1: tidak berubah. Migrasi: tidak ada.
- Penyimpanan klien: tidak ada yang baru. Keadaan layar penuh dibaca dari peramban, tidak disimpan.
- Bagian murni di `tekanHud.ts`, untuk uji unit tanpa peramban:
  - pemeriksaan titik angkat di dalam kotak yang diperluas 8 px;
  - pencatat per tombol: jari yang menekan, aksi yang menunggu `touchend`, dan waktu aksi sentuh terakhir;
  - penerimaan peristiwa berbentuk objek biasa (`pointerType`, `pointerId`, `clientX`, `clientY`, dan unsur dengan `getBoundingClientRect()` serta `isConnected`), dengan jam dan penjadwal yang bisa diganti.

  Nama fungsi akhirnya ditetapkan saat Build, dengan perilaku P-7 sampai P-12.

## Aset

- `ikon_layar_penuh` (I-19, Disetujui 6 Nov 2026) sudah ada di `manifest.ts` dan `CREDITS.md`. Tidak ada aset baru.

## Keamanan dan privasi

- Layar penuh dan penguncian orientasi tidak memerlukan izin pengguna dan tidak menyimpan apa pun (seperti JS-07).
- Tidak ada data baru yang dikirim ke server.

## Di luar cakupan

- Tombol untuk keluar dari layar penuh. Pemain memakai gerakan kembali atau tombol peramban.
- Pintasan papan ketik layar penuh di layar pemain. Layar kelas sudah punya `F`.
- Tombol yang bekerja selama ditahan (misalnya berlari selama tombol ditekan), joystick kedua, atau joystick di separuh kanan.
- Tombol di dalam dialog, peta besar, dan panel. Semuanya tetap memakai klik.
- Perubahan aturan skill, Periksa, Angkot, atau peta.
- Peramban yang memakai pointer sentuh tanpa Touch Events (misalnya Firefox desktop dengan layar sentuh). Di sana aksi tetap berjalan sekali lewat penjadwal cadangan P-8, tetapi pencegahan klik pengganti P-10 tidak berlaku.

## DRAF untuk ditinjau pemilik proyek

- **D-1. Label ikon HUD.**
  - (a, saran) "Layar penuh", sama dengan tombol panel lobi.
  - (b) "Masuk layar penuh": lebih jelas bagi pembaca layar, tetapi berbeda dari tombol panel lobi.
- **D-2. Letak tombol di baris kaki Menu.**
  - (a, saran) Paling kiri, sebelum "Privasi".
  - (b) Tepat sebelum "Tutup".
- **D-3. Sesudah tombol "Layar penuh" di Menu dipakai.**
  - (a, saran) Panel tertutup begitu layar penuh dimulai, sehingga pemain langsung kembali ke permainan.
  - (b) Panel tetap terbuka, dan tombolnya hilang karena sudah layar penuh.

## Kriteria penerimaan

- [ ] AC-1 **Layar penuh.** P-1 dan P-6: ketiga tombol memanggil `requestFullscreen` lalu `lock("landscape")` (diamati dengan mata-mata di uji ujung ke ujung), penolakan tidak menimbulkan galat konsol, tombol hilang saat layar penuh dan tampil lagi sesudah keluar.
- [ ] AC-2 **Ikon HUD.** P-2 dan P-3 di HP 731 × 411, HP 915 × 356 (dunia 610 × 343), HP 640 × 360 rasio 3, dan laptop 1280 × 720, 1024 × 768 (dunia 960 × 540), serta 700 × 400 (dunia 640 × 360):
  - tampil selama `main` dan `jeda` saja, dengan kotak 48 × 48 px di `left` 8 px dan `top` 92 px HUD;
  - tidak tampil di lobi, hitung mundur, selama dialog, peta besar, panel, dan sesudah layar penuh dimulai;
  - berjarak sedikitnya 8 px dari tombol Menu, bilah atas, peta mini, tombol skill, Periksa, dan pita terlebar ("Petunjuk dipakai di Langkah 1.");
  - kotak aman panah Kompas mencakup baris kedua kelompok Menu.
- [ ] AC-3 **Tombol di Menu.** P-4: tampil hanya bila layar penuh bisa dimasuki; baris kaki tetap satu baris setinggi 48 px di ketiga ukuran HP; isi panel tidak perlu digulir di 640 × 360 (seperti JS-14); menekannya masuk layar penuh, mengunci orientasi, lalu menutup panel dengan fokus kembali; bila ditolak, panel tetap terbuka.
- [ ] AC-4 **Panel lobi.** P-5: tampilan sama dengan v1.1, dan ketukan jari kedua selama analog dipegang di lobi memasuki layar penuh.
- [ ] AC-5 **Jari kedua.** P-8 dan tabel bagian B, dengan analog dipegang dan pemain berjalan:
  - peta mini membuka peta besar dan peta besar tetap terbuka;
  - Menu membuka panel, dan pilihan di panel tidak berubah;
  - Periksa dalam jangkauan membuka dialog di tampilan pertama ("Situasi"), tidak lebih jauh;
  - Lari cepat bermuatan mengirim tepat satu `pakai_skill`, dan avatar mulai berlari tanpa berhenti;
  - Lari cepat tanpa muatan menampilkan pita "Cari kotak sepatu.";
  - Angkot berkarcis di halte membuka mode "Pilih halte tujuan" tanpa halte terpilih;
  - suara terbalik sekali;
  - ikon layar penuh memasuki layar penuh.
- [ ] AC-6 **Urutan terbalik.** P-8: jari menekan tombol lebih dulu, lalu jari lain memegang analog, lalu jari tombol diangkat: aksi berjalan sekali.
- [ ] AC-7 **Satu jari.** P-8 dan P-10: ketukan satu jari pada setiap tombol HUD menjalankan aksi sekali, dan tidak ada `click` yang sampai ke unsur lain (dihitung di tingkat jendela).
- [ ] AC-8 **Tidak ada aksi.** P-9: jari diangkat lebih dari 8 px di luar tombol, jari yang bergeser masuk dari luar, sentuhan yang dibatalkan, dan tombol yang sudah hilang tidak menjalankan aksi (uji unit, dan dua kasus pertama di uji ujung ke ujung).
- [ ] AC-9 **Tetikus dan papan ketik.** P-11 dan P-12 di laptop: klik, `Enter`, `Spasi`, `Esc`, `M`, `P`, `E`, dan `1` sampai `5` bekerja seperti v1.1; klik ganda pada tombol suara membalik suara sekali; uji ujung ke ujung lama yang memakai `click()` dan `tap()` tetap lulus.
- [ ] AC-10 **Joystick berakhir.** P-13 dan P-14: untuk peta besar, panel Menu, dialog, menunggu Periksa, mode pilih halte, `P`, perubahan ukuran tampilan, dan `fullscreenchange`, lingkaran joystick hilang dan posisi pemain berhenti; sentuhan baru memulai joystick lagi.
- [ ] AC-11 **Joystick tetap.** P-15 dan P-16: sesudah tombol skill atau suara diketuk jari kedua, posisi pemain terus berubah; jari ketiga di separuh kiri tidak memulai joystick kedua.
- [ ] AC-12 **Ukuran.** Dibandingkan dengan garis dasar Plan v1.2 (gzip level 9, tiga build): kode layar pemain naik paling banyak 1,2 KB untuk JS dan 0,15 KB untuk gaya; kode konsol awal naik paling banyak 0,3 KB, termasuk potongan bersama `protokol.js` dan `protokol.css` (Temuan 1 JS-18); potongan layar kelas tidak berubah.
- [ ] AC-13 **Perintah resmi.** `content:check:jejak`, `test:jejak`, `test:jejak:server`, `build:jejak`, dan `test:e2e:jejak` lulus; `tsc --noEmit` dan ESLint Jejak bersih; `build:pages` menghasilkan 178 berkas yang identik byte.
- [ ] AC-14 **Tangkapan layar.** `tests/JS-24/` memuat HUD dengan ikon di ketiga ukuran HP dan laptop 1280 × 720, panel Menu dengan tombol "Layar penuh" di dunia 610 × 343 dan 731 × 411, serta dua saat jari kedua: pita "Cari kotak sepatu." selama berjalan dan peta besar yang terbuka tanpa lingkaran joystick.
- [ ] AC-15 **Manual di HP sungguhan.** Butir "Manual di HP" di rencana uji diperiksa pemilik proyek di lingkungan uji, dengan merek dan tipe HP dicatat.
- [ ] AC-16 **Dokumen.** P-17.

## Rencana uji

### Unit (`test:jejak`)

- `__tests__/dunia/tekanHud.test.ts` dengan peristiwa dan unsur tiruan:
  - satu jari: `pointerdown`, `pointerup`, lalu `touchend` menjalankan aksi sekali, dan `touchend` dicegah;
  - jari kedua dan urutan terbalik: pointer yang berbeda pada tombol yang sama dan tombol lain;
  - titik angkat tepat 8 px dan 8,01 px di luar kotak;
  - `pointercancel`, jari yang bergeser masuk, dan unsur yang sudah terlepas;
  - tanpa `touchend`: aksi berjalan sekali lewat penjadwal;
  - klik berjenis `touch` dan klik dalam 800 ms sesudah aksi sentuh diabaikan, sedangkan klik tetikus, klik papan ketik (`detail` 0), dan klik pena menjalankan aksi;
  - penyaring klik tombol suara (`detail` ≤ 1).
- `__tests__/dunia/masukan.test.ts`: joystick berakhir tanpa jari diangkat, dan jari yang sama tidak menggerakkan pemain lagi.

### Ujung ke ujung (`test:e2e:jejak`), berkas `kontrol-sentuh.uji.ts`

Dua pointer sentuh dibuat lewat sesi CDP Playwright, cara yang sudah dicoba di percobaan Plan:

1. Jari 1 menekan dunia: `Input.dispatchTouchEvent` dengan `type: "touchStart"` dan `touchPoints: [{ x, y, id: 1 }]`, lalu bergeser dengan `touchMove`.
2. Jari 2 menekan tombol: `touchStart` dengan `touchPoints` berisi jari 1 dan jari 2 (`id: 2`).
3. Hanya jari 2 diangkat: `touchEnd` dengan `touchPoints: [{ x, y, id: 2 }]`. Percobaan Plan membuktikan bentuk ini melepas jari 2 saja, sedangkan `touchMove` tanpa jari 2 tidak melepasnya.
4. Jari 1 diangkat: `touchEnd` dengan `touchPoints: []`.

Klik dihitung lewat pendengar `click` di tingkat jendela (skrip awal halaman), dan `pakai_skill` dihitung dari bingkai WebSocket terkirim (`page.on("websocket")` dan `framesent`).

- HP 731 × 411 rasio 2,625: AC-5 untuk setiap tombol, AC-6, AC-7, AC-8 (dua kasus), AC-10, dan AC-11. Pemain dipindah ke dekat kejadian, kotak, atau halte lewat kait uji `pindahkan`.
- HP 731 × 411, 915 × 356, dan 640 × 360 rasio 3: AC-2 dan AC-3, dengan mata-mata `screen.orientation.lock`, serta tangkapan layar AC-14. Di peramban tanpa tampilan, `requestFullscreen` berhasil tetapi ukuran jendela tidak berubah (percobaan Plan), jadi P-14 diuji lewat `fullscreenchange` dan `setViewportSize`.
- Laptop 1280 × 720, 1024 × 768, dan 700 × 400: AC-2 dan AC-9.
- Uji lama yang mengetuk tombol HUD (misalnya `dunia.uji.ts`, `kejadian.uji.ts`, `hasil.uji.ts`, `skill.uji.ts`, `teropong-angkot.uji.ts`, dan `pengaturan.uji.ts`) ikut menjadi uji regresi P-10, karena ketukan yang memunculkan klik ganda akan menggagalkan langkah berikutnya.

### Server dan beban

- Server tidak berubah. `test:jejak:server` dijalankan sebagai regresi.
- `sim:beban` tidak wajib, karena protokol, inti ruang, dan kiriman ke D1 tidak berubah (AGENTS 4.4 butir 6).

### Ukuran

- `build:jejak` tiga kali, `anggaran.mjs`, dan ukuran gzip-9 per berkas dibandingkan dengan garis dasar Plan v1.2: layar pemain 143,44 KB (`pemain.js` 59,88 KB, `protokol.js` 79,91 KB, `protokol.css` 7,31 KB), konsol awal 137,72 KB, dan potongan layar kelas 11,35 KB.

### Manual di HP (pemilik proyek, lingkungan uji)

1. Buka tautan ruang uji di HP Android dengan Chrome. Di lobi, ketuk "Layar penuh" di panel lobi: layar penuh dan mendatar.
2. Keluar dari layar penuh dengan gerakan kembali. Mulai ronde dari layar kelas. Ikon layar penuh tampil di bawah tombol Menu. Ketuk ikon itu: layar penuh lagi, dan HP tetap mendatar walaupun diputar tegak.
3. Keluar lagi, buka Menu, lalu ketuk "Layar penuh": layar penuh, dan panel Menu tertutup.
4. Pegang analog dengan jempol kiri sampai avatar berjalan. Tanpa melepas analog, ketuk dengan jempol kanan:
   - Lari cepat (sesudah mengambil kotak sepatu): avatar langsung berlari tanpa berhenti;
   - Kompas dan Teropong (sesudah mengambil kotaknya): skill aktif, avatar terus berjalan;
   - suara: suara berbalik, avatar terus berjalan;
   - peta mini: peta besar terbuka dan tetap terbuka, dan lingkaran analog hilang;
   - Menu: panel terbuka, dan tidak ada pilihan yang berubah sendiri;
   - Periksa di dekat kejadian: dialog terbuka di tampilan "Situasi".
5. Di halte dengan karcis, pegang analog lalu ketuk Angkot: mode "Pilih halte tujuan" terbuka tanpa halte terpilih.
6. Ulangi beberapa tombol dengan satu jari saja: setiap tombol bereaksi sekali.
7. Sambil memegang analog, ketuk ikon layar penuh: layar penuh, lingkaran analog hilang, dan analog bekerja lagi sesudah jempol kiri diangkat lalu menyentuh lagi.
8. Di iPhone (bila ada): ikon dan tombol layar penuh tidak tampil, dan butir 4 sampai 6 bekerja.
9. Di laptop: klik tetikus dan tombol papan ketik bekerja seperti v1.1, dan ikon layar penuh memasuki layar penuh.

## Bahan panduan guru (JS-16d)

- HP siswa yang keluar dari layar penuh bisa kembali ke layar penuh lewat ikon di bawah tombol Menu, atau lewat Menu lalu "Layar penuh".
- Siswa bisa memakai skill, Periksa, peta mini, dan Menu dengan jempol kanan sambil tetap memegang analog dengan jempol kiri.

## Catatan Build (28 Nov 2026)

- Nama akhir bagian murni (`tekanHud.ts`): `dalamKotak`, `klikPertama` (penyaring klik tombol suara), dan kelas `PencatatTekan`; pengikat React `useTekanHud`. Cara mengakhiri joystick tanpa jari diangkat: `Masukan.hentiJoystick()`.
- Pendengar `touchend` dipasang langsung di setiap tombol HUD dan tidak dilepas, agar klik pengganti tetap dicegah walaupun tombolnya hilang dari halaman sebelum jari diangkat (P-9 butir 4 dan P-10). `touchend` yang tidak bisa dibatalkan tidak dicegah, agar tidak ada peringatan konsol.
- Selama lapisan P-13 tampil, joystick baru juga tidak dimulai, sehingga lingkarannya tidak muncul di atas lapisan.
- Uji ujung ke ujung: Periksa dan Angkot diketuk jari kedua dengan analog dipegang di zona diam (avatar diam), karena pemain harus tetap dalam jangkauan 24 px. Tombol lain diketuk selama avatar berjalan.
- Temuan 1 laporan uji: selama jeda, kelompok Menu (termasuk ikon) berada di bawah lapisan jeda yang tembus pandang, seperti Menu dan suara sejak v1.1. Baris "Jeda" di tabel status belum terpenuhi, dan keputusannya menunggu pemilik proyek.
