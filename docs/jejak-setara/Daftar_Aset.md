# Daftar Aset — Jejak Setara

| | |
|---|---|
| Versi | 1.0 |
| Diperbarui | 8 November 2026 |
| Tahap saat ini | JS-06 (peta 160 × 100) selesai 8 November 2026; laporan uji `tests/JS-06-hasil.md` Lulus. Menunggu Sesi A membaca Permintaan C-6, C-7, dan C-9 sampai C-12. Semua kelompok aset dalam rencana Disetujui (6 November 2026) |
| Dikerjakan | Sesi C (aset dan peta), lihat `PLAN.md` bagian "Pembagian kerja tiga sesi" |
| Acuan | ZIP repositori 7 November 2026 (JS-02 selesai dan di-push menurut pemilik proyek) |
| Cara membuat | Digambar dengan kode di `scripts/game/art/` (berkas `atas_*.py`), mengikuti `Design_System.md` bagian 14 |
| Cara membangun | `npx pnpm@11.25.0 assets:build:jejak` (menjalankan `python scripts/game/art/build_jejak.py`) |
| Berkas yang boleh diubah Sesi C | `scripts/game/art/atas_*.py`, `scripts/game/art/build_jejak.py`, `app/jejak-setara/assets/`, `docs/jejak-setara/Daftar_Aset.md`, `docs/jejak-setara/preview/`. Sesudah kabar "JS-02 selesai": juga `scripts/jejak-setara/peta/`, `app/jejak-setara/peta/`, dan uji berawalan `peta-` di `app/jejak-setara/__tests__/konten/` (izin 7 Nov 2026), serta `docs/jejak-setara/specs/JS-06-peta.md` dan `docs/jejak-setara/tests/JS-06-hasil.md` (usulan JS-06 nomor 8a, 8 Nov 2026) |

Status: **Disetujui** (pratinjau sudah diterima pemilik proyek) · **Ditinjau** (pratinjau sudah dikirim, menunggu keputusan) · **Belum** · **Ditunda** (menunggu keputusan lain).

Perbarui berkas ini setiap kali sebuah aset selesai atau berubah status. Ukuran tokoh sudah termasuk margin 1 px untuk garis luar. Ukuran objek dalam ubin (1 ubin = 16 × 16 piksel) masih usulan dan dipastikan bersama peta di JS-06.

## Riwayat

| Tanggal | Tahap | Kejadian |
|---|---|---|
| 6 Nov 2026 | Plan | Dokumen dibaca, pemeriksaan awal dijalankan, percobaan uji gaya dimulai (laporan sementara) |
| 6 Nov 2026 | Plan | Daftar aset, urutan pengerjaan, usulan, dan lembar uji gaya `preview/uji_gaya.png` diserahkan; menunggu "Setuju: aset" |
| 6 Nov 2026 | Plan | Pemilik proyek membalas "Setuju: aset": semua saran (a) diterima (usulan 1a sampai 10a) |
| 6 Nov 2026 | Kelompok A | Kit `atas_tokoh.py`, `atas_ubin.py`, `atas_objek.py`, dan `build_jejak.py` dibuat; delapan avatar dan ikon kepalanya diserahkan, menunggu "Setuju: aset A" |
| 6 Nov 2026 | Kelompok A | Pemilik proyek membalas "Setuju: aset A": A-01 sampai A-09 Disetujui. `app/jejak-setara/assets/CREDITS.md` dibuat otomatis oleh `build_jejak.py` |
| 6 Nov 2026 | Kelompok U | Lembar ubin tiga masa (377 ubin per lembar) diserahkan, menunggu "Setuju: aset U" |
| 6 Nov 2026 | Kelompok U | Pemilik proyek membalas "Setuju: aset U": U-01 sampai U-15 Disetujui, termasuk warna bahan baru. Kredit lembar ubin ditambahkan; Permintaan C-2 dilengkapi |
| 6 Nov 2026 | Kelompok O1 | 25 objek (48 berkas) diserahkan, menunggu "Setuju: aset O1" |
| 6 Nov 2026 | Kelompok O1 | Pemilik proyek membalas "Setuju: aset O1": O-01 sampai O-20 Disetujui; kredit 48 berkas objek ditambahkan |
| 6 Nov 2026 | Kelompok O2 | Objek umum (24 berkas, termasuk 16 ruas pagar) diserahkan, menunggu "Setuju: aset O2" |
| 6 Nov 2026 | Kelompok O2 | Pemilik proyek membalas "Setuju: aset O2": O-21 sampai O-28 Disetujui; kredit 24 berkas ditambahkan |
| 6 Nov 2026 | Kelompok T | Penanda dan efek (12 berkas, kode baru `atas_ikon.py`) diserahkan, menunggu "Setuju: aset T" |
| 6 Nov 2026 | Kelompok T | Pemilik proyek membalas "Setuju: aset T": T-01 sampai T-12 Disetujui; kredit 12 berkas ditambahkan |
| 6 Nov 2026 | Kelompok N1 | Sembilan tokoh Sehari Setara versi tampak atas (11 berkas, termasuk Dimas di motor dan Komang menunduk) diserahkan, menunggu "Setuju: aset N1" |
| 6 Nov 2026 | Peta | Pemilik proyek menetapkan ukuran peta 160 × 100 ubin (rencana awal 120 × 80), karena perkiraan 50–100 pemain per sesi dan pertanyaan yang banyak serta bervariasi. Permintaan C-7 dan C-8 diajukan |
| 6 Nov 2026 | Kelompok N1 | Pemilik proyek membalas "Setuju: aset N1": N-01 sampai N-09 Disetujui; kredit 11 berkas ditambahkan |
| 6 Nov 2026 | Kelompok N2 | 18 tokoh (22 berkas) diserahkan, termasuk usulan ciri Raka, Wayan, dan siswa umum; menunggu "Setuju: aset N2" |
| 6 Nov 2026 | Kelompok N2 | Pemilik proyek membalas "Setuju: aset N2": N-10 sampai N-20 Disetujui, termasuk ciri Raka, Wayan, dan siswa umum; kredit 22 berkas ditambahkan |
| 6 Nov 2026 | Kelompok O3 | 13 properti kejadian (15 berkas) diserahkan bersama pratinjau set tokoh per kejadian; menunggu "Setuju: aset O3" |
| 6 Nov 2026 | Kelompok O3 | Pemilik proyek membalas "Setuju: aset O3": O-29 sampai O-41 Disetujui; kredit 15 berkas ditambahkan |
| 6 Nov 2026 | Kelompok O4 | 9 varian untuk peta 160 × 100 (15 berkas) diserahkan; menunggu "Setuju: aset O4" |
| 6 Nov 2026 | Kelompok O4 | Pemilik proyek membalas "Setuju: aset O4": O-43 sampai O-51 Disetujui; kredit 15 berkas ditambahkan |
| 6 Nov 2026 | Kelompok I | Ikon (33 berkas: 22 ikon baru dan 11 ikon Sehari Setara yang dipakai ulang) diserahkan; menunggu "Setuju: aset I" |
| 6 Nov 2026 | Kelompok I | Pemilik proyek membalas "Setuju: aset I": I-01 sampai I-19 Disetujui; kredit 33 berkas ditambahkan. Seluruh 239 berkas aset dalam rencana Disetujui |
| 7 Nov 2026 | Plan JS-06 | Pemilik proyek mengabarkan JS-02 selesai dan di-push, lalu menetapkan batas berkas Sesi C untuk JS-06 |
| 8 Nov 2026 | Plan JS-06 | Percobaan prototipe 160 × 100 dijalankan di luar repositori; entri Plan, denah kasar `preview/peta_denah.png`, dan Permintaan C-9 sampai C-11 diserahkan; menunggu `Setuju: JS-06` |
| 8 Nov 2026 | Plan JS-06 | Pemilik proyek membalas `Setuju: JS-06`: semua saran (a) diterima (usulan 1a sampai 9a, KT-C11 sampai KT-C19) |
| 8 Nov 2026 | Specify JS-06 | Spesifikasi `specs/JS-06-peta.md` (P-1 sampai P-31, D-1 sampai D-7, AC-1 sampai AC-15) diserahkan; menunggu `Spesifikasi disetujui: JS-06` |
| 8 Nov 2026 | Specify JS-06 | Pemilik proyek membalas `Spesifikasi disetujui: JS-06`: saran D-1 sampai D-7 dipakai |
| 8 Nov 2026 | Build JS-06 | `build_peta.py`, `kampung.txt`, dan `objek.json` dibuat; semua pemeriksaan galat lulus (penanda terlihat 100%, 0 sel sempit); draf peta dikirim sebagai gambar untuk titik tinjau; menunggu `Setuju: peta` |
| 8 Nov 2026 | Build JS-06 | Pemilik proyek membalas `Setuju: peta`: draf diterima tanpa perubahan |
| 8 Nov 2026 | Test JS-06 | 25 uji peta baru lulus, 12 salinan rusak ditolak, `test:jejak` 319 uji lulus, `test:e2e:jejak` 18 uji lulus, galeri 178 berkas identik; JS-06 Selesai ([laporan](tests/JS-06-hasil.md)) |

## Keputusan Gerbang aset (6 November 2026)

| Kode | Keputusan |
|---|---|
| KT-C1 | 1a: gaya `preview/uji_gaya.png` menjadi acuan semua aset tampak atas |
| KT-C2 | 2a: urutan A, U, O1, O2, T, N1, N2, O3, lalu I |
| KT-C3 | 3a: tiga lembar ubin (pagi, siang, sore); Permintaan C-1 |
| KT-C4 | 4a: hanya lembar ubin yang berganti per masa; bayangan objek menjadi ubin tumpang lapisan 10 |
| KT-C5 | 5a: tas bergambar warna kunci `sun` dan `mango`, diganti antarmuka saat memuat |
| KT-C6 | 6a: bangunan dan pohon dua bagian, `obj_{nama}.png` dan `obj_{nama}_atas.png` |
| KT-C7 | 7a: satu strip per arah dan gerak; arah kiri dicerminkan antarmuka |
| KT-C8 | 8a: delapan desain avatar di bagian A |
| KT-C9 | 9a: siswa bukan pemain tanpa tas; ciri Raka, Wayan, dan siswa umum diusulkan di kelompok N2 |
| KT-C10 | 10a: `CREDITS.md` dan `manifest.ts` dibuat `build_jejak.py` untuk aset Disetujui |

## Keputusan ukuran peta (6 November 2026)

| Hal | Keputusan |
|---|---|
| Ukuran peta | 160 × 100 ubin (2.560 × 1.600 piksel logis, sekitar 8 × 9 layar HP), menggantikan rencana 120 × 80 di PRD JFR-09 dan Design System bagian 3.2 |
| Alasan | Pemilik proyek memperkirakan 50–100 pemain per sesi, pemain mencari kejadian dalam waktu yang ditetapkan, dan pertanyaannya banyak serta bervariasi |
| Titik kejadian | Sedikitnya 12 titik per zona (96 titik), cukup untuk sekitar 48 kejadian dengan 2 titik calon masing-masing |
| Waktu menyeberang | Sekitar 36 detik berjalan dari ujung ke ujung (4,5 ubin per detik) |
| Masih perlu keputusan | Kapasitas pemain per ruang dan jumlah kejadian per ronde (Permintaan C-8) |

## Ringkasan rencana (templat AGENTS 12.1)

| | |
|---|---|
| Status | Selesai 6 Nov 2026: semua kelompok (A, U, O1, O2, O3, O4, T, N1, N2, I) Disetujui; 239 berkas, 100,3 KB |
| Memenuhi | Aset gambar untuk JFR-09, JFR-10, JFR-11, JFR-12, JFR-15, JFR-18, JFR-23, dan JFR-24 (JFR-25 untuk P1); PRD bagian 15; Design System bagian 7, 8, 9, dan 14 |
| Bergantung pada | Tidak ada untuk menggambar. Peta (JS-06) baru dimulai sesudah kabar "JS-02 selesai" |
| Berkas yang dibuat atau diubah | Sekarang: `docs/jejak-setara/Daftar_Aset.md` dan `docs/jejak-setara/preview/uji_gaya.png` (keduanya baru). Sesudah disetujui: `atas_tokoh.py`, `atas_ubin.py`, `atas_objek.py`, `atas_ikon.py`, dan `build_jejak.py` di `scripts/game/art/`; PNG di `app/jejak-setara/assets/` (`ava/`, `npc/`, `ubin/`, `obj/`, `ikon/`); `app/jejak-setara/assets/CREDITS.md`; pratinjau di `docs/jejak-setara/preview/` |
| Migrasi D1 | Tidak ada |
| Pesan protokol baru atau berubah | Tidak ada |
| Dependensi baru | Tidak ada. Python 3 dan Pillow sudah dipakai kit Sehari Setara |
| Risiko | Gaya tidak selaras dengan Sehari Setara (dijawab uji gaya); ketiga masa tampak mirip di rumput (percobaan 5); garis siluet `sun` kurang terlihat di beberapa atap (percobaan 4); siswa bukan pemain tertukar dengan avatar pemain (usulan 9); sekitar 200 berkas kecil (percobaan 6); kata baru di dokumen dan kode menambah aturan CSS galeri (percobaan 7) |
| Ukuran | L (sekitar 200 berkas dalam 9 kelompok) |

## Hasil percobaan dan pemeriksaan

Percobaan dijalankan di luar repositori dengan skrip kecil yang memakai `pixelart.py` dan `palette.json` tanpa mengubahnya.

1. **Kit Sehari Setara tetap sama.** `build_assets.py` dibangun ulang ke folder sementara; ke-65 PNG Sehari Setara identik byte dengan yang ada di repositori. Plan ini tidak mengubah kode gambar bersama.
2. **Uji gaya.** Satu ubin (rumput, tiga masa), satu avatar (A1: bawah, kanan, kiri sebagai cermin, atas; diam dan jalan; delapan warna tas), dan satu objek (rumah beratap limasan `coral`), lalu ketiganya disusun di peta kecil. Semua gambar: 0 piksel di luar palet, tanpa piksel semi-transparan. Hasil: `preview/uji_gaya.png`. Sesudah disetujui, kode percobaan menjadi awal `atas_ubin.py`, `atas_tokoh.py`, dan `atas_objek.py`, dan `build_jejak.py` membangun ulang pratinjau ini. Sudah dilakukan di kelompok A: avatar A1, ubin rumput, dan rumah di kit sama piksel dengan uji gaya, dan `uji_gaya.png` hasil bangun ulang identik byte dengan aslinya.
3. **Ukuran berkas** (PNG teroptimasi):

   | Gambar | Ukuran | Anggaran (Architecture 11.3) |
   |---|---|---|
   | Ubin rumput 16×16 | 179 B | Lembar ubin ≤ 60 KB |
   | Lembar uji 144 ubin yang sengaja ramai (potongan rumah, avatar, bayangan) | sekitar 6 KB | ≤ 60 KB per lembar |
   | Strip avatar A1, diam 2 bingkai | 459–513 B | ≤ 6 KB per strip |
   | Strip avatar A1, jalan 4 bingkai | 558–642 B | ≤ 6 KB per strip |
   | Enam strip avatar A1 | 3,2 KB | — |
   | Rumah: atap dan dinding | 456 B dan 456 B | — |

   Perkiraan seluruh aset gambar: di bawah 300 KB, jauh di bawah anggaran 2 MB aset layar pemain.
4. **Kontras garis siluet** (Design System bagian 7, lapisan 60: pemain sendiri di belakang objek atas bergaris luar `sun`):

   | Atap atau tenda | `sun` | `ink` |
   |---|---|---|
   | `coral` (Z1) | 1,9 : 1 | 5,1 : 1 |
   | `mango` dan `sun` (tenda Z4) | 1,4 : 1 dan 1,0 : 1 | 6,9 : 1 dan 9,9 : 1 |
   | `teal` (Z3, Z7) | 1,5 : 1 | 6,6 : 1 |
   | `sky-d` (Z2) | 2,6 : 1 | 3,8 : 1 |
   | `berry` (Z8) | 2,9 : 1 | 3,5 : 1 |
   | `wood-d` (Z5) | 4,0 : 1 | 2,4 : 1 |

   Garis `sun` saja tidak mencapai 3 : 1 di enam dari tujuh warna atap. Dengan garis ganda (`ink` di dalam, `sun` di luar), salah satu garis selalu ≥ 3 : 1 (Permintaan C-4).
5. **Tukar palet per masa.** Bahan rumput berwarna `leaf` di ketiga masa, sehingga di atas rumput yang berganti hanya kilau ujung rumpun dan warna bayangan. Pagi dan siang hampir sama (panel 5 uji gaya); perbedaan besar ada di air, pasir, marka, dan bilah atas. Bayangan tetap terlihat: `dusk` di atas `leaf` 5,1 : 1, `wood-d` di atas `leaf` 3,4 : 1. Pemetaan akhir ditetapkan lewat pratinjau peta di kelompok U, sesuai Design System bagian 4. Catatan: tanah rumput berwarna dasar `leaf`; `sun` di atas `leaf` hanya 1,2 : 1, jadi aturan "penanda `sun` wajib bergaris luar `ink`" tetap perlu (`ink` di atas `leaf` 8,3 : 1).
6. **Jumlah berkas.** Daftar di bawah menghasilkan sekitar 200 berkas kecil. Bila pramuat terasa lambat di wifi sekolah (diuji di JS-15), `build_jejak.py` bisa menggabungkannya menjadi beberapa lembar tanpa menggambar ulang.
7. **Galeri (Tailwind).** `build:pages` dijalankan sebelum dan sesudah kedua berkas Plan ini ditambahkan. Ke-178 berkas `dist-pages/` identik byte, jadi tidak ada aturan CSS galeri yang bertambah (catatan "Semua fitur, semua sesi" di `PLAN.md`).

## Usulan (disetujui 6 November 2026: semua saran a)

Setiap usulan berisi saran (a) dan alternatifnya. Kode KT-C adalah keputusan terbuka Sesi C.

### 1. Gaya acuan (KT-C1)

- (a, saran) Gaya di `preview/uji_gaya.png` menjadi acuan semua aset tampak atas:
  - tokoh *chibi* 16 × 24 bergaris luar `ink`, mata 1 × 2, dan bayangan kaki berpola papan catur;
  - ubin datar tanpa garis luar;
  - objek padat bergaris luar `ink` hanya di tepi siluet;
  - cahaya dari kiri atas: sisi kiri dan belakang atap lebih terang, sisi kanan teduh, dan bayangan jatuh ke kanan bawah.
- (b) Disetujui dengan perbaikan yang Anda tulis bebas, misalnya "atap lebih rendah" atau "avatar tanpa mulut". Lembar uji gaya diperbaiki lebih dulu sebelum kelompok A.
- (c) Objek tanpa garis luar, seperti latar Sehari Setara: lebih lembut, tetapi bangunan dan tokoh kurang menonjol dari tanah di layar HP.

### 2. Urutan pengerjaan (KT-C2)

- (a, saran) Urutan di bagian "Urutan pengerjaan": avatar lebih dulu, lalu ubin dan bangunan untuk peta, lalu penanda, tokoh, properti, dan ikon. Avatar kecil dan cepat dinilai, menjadi dasar badan semua tokoh bukan pemain, dan dibutuhkan paling awal (memilih avatar di lobi JS-03 dan bergerak di JS-07). Ubin dan bangunan menyusul sebelum JS-06 dimulai.
- (b) Ubin dan bangunan lebih dulu, lalu avatar. Cocok bila JS-02 diperkirakan selesai sangat cepat.

### 3. Jumlah masa (KT-C3)

- (a, saran) Tiga lembar ubin: `ubin_pagi.png`, `ubin_siang.png`, dan `ubin_sore.png`, sesuai Design System bagian 4 dan instruksi pemilik proyek. Layar akhir dan pembahasan bernuansa malam memakai warna antarmuka (`#4A4F9C`), bukan peta. PRD bagian 15 masih menyebut empat masa, jadi diajukan Permintaan C-1.
- (b) Tambah `ubin_malam.png` untuk kemungkinan layar akhir berlatar peta: satu lembar lagi dan satu pemetaan bahan malam.

### 4. Tukar palet dan bayangan objek (KT-C4)

Bayangan dan kilau termasuk bahan yang berganti per masa (Design System bagian 4), padahal keduanya juga ada di sekitar objek.

- (a, saran) Hanya lembar ubin yang berganti per masa.
  - Bayangan bangunan, pohon, dan objek besar digambar sebagai **ubin tumpang** di lapisan 10, di dalam lembar ubin, sehingga ikut berganti warna (`dusk` pagi dan siang, `wood-d` sore).
  - Bayangan adalah siluet objek yang digeser 8 piksel ke kanan dan 4 piksel ke bawah, berpola papan catur. Letaknya dihitung `build_peta.py` dari daftar objek (JS-06).
  - Objek, tokoh, dan ikon cukup satu berkas untuk semua masa, dengan warna tetap.
  - Panel 5 uji gaya sudah memakai cara ini.
- (b) Bayangan tetap di dalam gambar objek, dan setiap objek diekspor tiga kali (`obj_{nama}_{masa}.png`): berkas objek menjadi tiga kali lipat.
- (c) Antarmuka mengganti warna bayangan di gambar objek saat bermain: menambah kerja Sesi A, dan warna kunci bisa bentrok dengan warna lain di objek yang sama (misalnya dinding putih puskesmas dan kilau putih siang).

### 5. Warna tas avatar (KT-C5)

Warna tas dipilih otomatis saat bermain (Design System bagian 8), jadi tidak bisa digambar tetap.

- (a, saran) Tas digambar dengan dua warna kunci, `sun` (dasar) dan `mango` (bayangan), yang tidak dipakai bagian lain avatar. Saat memuat, antarmuka membuat salinan avatar dengan delapan pasangan warna di tabel "Warna tas", dengan penggantian serentak (bukan berurutan). Contohnya ada di panel 2 uji gaya.
- (b) `build_jejak.py` membuat semua kombinasi (8 avatar × 8 warna × 6 strip = 384 berkas).
- (c) Tas sebagai gambar terpisah di atas avatar: urutan gambar lebih rumit, terutama saat menghadap samping.

### 6. Bangunan dan pohon dua bagian (KT-C6)

- (a, saran) Satu gambar digambar utuh, lalu dipotong di satu baris:
  - `obj_{nama}.png`: bagian bawah (dinding depan, pintu, batang), lapisan 20;
  - `obj_{nama}_atas.png`: atap atau tajuk, lapisan 40.

  Sambungannya rapi karena berasal dari satu gambar (panel 3 uji gaya). Objek pendek (pagar, bangku, tempat sampah) cukup satu berkas. Titik letak dan kotak tabrakan setiap objek ditulis di `objek.json` (JS-06).
- (b) Satu berkas per objek, lalu antarmuka memotong di baris yang dicatat di `objek.json`: berkas lebih sedikit, tetapi baris potong harus dijaga setiap kali gambar diubah.

### 7. Format berkas tokoh (KT-C7)

- (a, saran) Satu strip mendatar per arah dan gerak, mengikuti pola `ava_{n}_{arah}_{pose}.png` di Design System bagian 14:
  - arah `bawah`, `atas`, dan `kanan`; kiri dicerminkan antarmuka, tanpa berkas `kiri`;
  - gerak `diam` (2 bingkai) dan `jalan` (4 bingkai); lari memakai bingkai jalan;
  - setiap avatar menjadi 6 strip;
  - bayangan kaki sudah di dalam bingkai 16 × 24 (baris 20–23), dan titik kaki (jangkar) di x 8, y 21.

  Tokoh bukan pemain cukup `npc_{tokoh}_bawah_diam.png`, ditambah pose khusus yang diperlukan kejadian.
- (b) Satu lembar per avatar (3 baris × 6 bingkai): hanya 8 berkas avatar, tetapi pola nama di Design System berubah.

### 8. Delapan desain avatar (KT-C8)

- (a, saran) Delapan desain di bagian A. Setiap warna kulit muncul dua kali; empat bercelana dan empat berok; dua berkerudung putih (dengan kemeja lengan panjang dan rok panjang); dua berkacamata. Tidak ada avatar yang mirip tokoh bukan pemain: tidak ada rambut berponi dengan `skin-2` (Nara), kerudung dengan `skin-3` (Sinta), atau rambut cepak dengan `skin-4` (Dimas).
- (b) Susunan lain yang Anda tentukan.

### 9. Siswa umum dan tokoh baru (KT-C9)

- (a, saran) Siswa umum yang bukan pemain **tidak memakai tas punggung**, karena tas berwarna adalah tanda pemain.
  - Empat siswa berbaju bebas (S1–S4) untuk kejadian di luar sekolah.
  - Dua siswa berseragam tanpa tas (S5–S6) untuk Z2 dan K-13.
  - Ciri visual Raka, Wayan, dan siswa umum saya usulkan bersama pratinjau kelompok N2 untuk Anda setujui. Ini menjawab bagian "ciri visualnya ditetapkan pemilik proyek bersama Sesi C" pada Permintaan A-1 Sesi B (`naskah/STATUS.md`).
- (b) Semua siswa umum berseragam tanpa tas.

### 10. Manifest dan kredit (KT-C10)

- (a, saran) `build_jejak.py` menulis `app/jejak-setara/assets/CREDITS.md` dan `app/jejak-setara/assets/manifest.ts` secara otomatis dari daftar asetnya, hanya untuk aset "Disetujui". Dengan begitu daftar tidak pernah berbeda dari berkas yang ada. Bentuk manifest disepakati dengan Sesi A sebelum kelompok A selesai (Permintaan C-6). Sebelum ada aset yang disetujui, kedua berkas belum dibuat.
- (b) Sesi A menulis `manifest.ts` dengan tangan; Sesi C hanya membuat PNG dan `CREDITS.md`.

## Urutan pengerjaan

Setiap kelompok diserahkan dalam satu balasan: pratinjau tampil di balasan, ZIP kecil berisi kode, PNG, pratinjau, dan berkas ini. Aset berstatus "Disetujui" sesudah pemilik proyek membalas frasa kelompoknya.

| Urutan | Kelompok | Isi | Perkiraan berkas | Dibutuhkan untuk | Frasa persetujuan |
|---|---|---|---|---|---|
| 1 | A — Avatar pemain | A-01 sampai A-09 | 56 | JS-03 (pilih avatar), JS-07 | `Setuju: aset A` |
| 2 | U — Ubin per masa | U-01 sampai U-15 | 3 lembar | JS-06, JS-07 | `Setuju: aset U` |
| 3 | O1 — Bangunan penanda zona | O-01 sampai O-20 | sekitar 36 | JS-06 (ukuran dan tabrakan), JS-07 | `Setuju: aset O1` |
| 4 | O2 — Objek umum | O-21 sampai O-28 | sekitar 13 | JS-06 | `Setuju: aset O2` |
| 5 | T — Penanda dan efek | T-01 sampai T-12 | 12 | JS-08, JS-09 | `Setuju: aset T` |
| 6 | N1 — Tokoh Sehari Setara | N-01 sampai N-09 | sekitar 12 | JS-08 | `Setuju: aset N1` |
| 7 | N2 — Warga dan tokoh baru | N-10 sampai N-20 | sekitar 22 | JS-08 | `Setuju: aset N2` |
| 8 | O3 — Properti kejadian | O-29 sampai O-41 | sekitar 14 | JS-08 | `Setuju: aset O3` |
| 9 | O4 — Varian untuk peta besar | Rumah warga dan pohon tambahan, agar peta 160 × 100 tidak terlihat berulang | sekitar 10 | JS-06 | `Setuju: aset O4` |
| 10 | I — Ikon | I-01 sampai I-19 | sekitar 35 | JS-07, JS-09, JS-10, JS-12 | `Setuju: aset I` |

Status 6 November 2026: semua kelompok Disetujui.

| Kelompok | Isi | Berkas | Ukuran |
|---|---|---|---|
| A | Avatar pemain | 56 | 27,8 KB |
| U | Ubin per masa | 3 | 17,3 KB |
| O1 | Bangunan penanda zona | 48 | 15,9 KB |
| O2 | Objek umum | 24 | 4,8 KB |
| T | Penanda dan efek | 12 | 3,1 KB |
| N1 | Tokoh Sehari Setara | 11 | 5,5 KB |
| N2 | Warga dan tokoh baru | 22 | 11,1 KB |
| O3 | Properti kejadian | 15 | 3,2 KB |
| O4 | Varian untuk peta besar | 15 | 4,7 KB |
| I | Ikon | 33 | 6,7 KB |
| **Jumlah** | | **239** | **100,3 KB** |

- Bila kabar "JS-02 selesai" datang sebelum kelompok U dan O1 disetujui, JS-06 memakai *placeholder* berupa kotak warna palet dengan label kunci aset (AGENTS bagian 5), lalu diganti sesudah disetujui.
- Setiap kelompok diperiksa dengan daftar periksa Design System bagian 14 dan bagian 12 Sehari Setara sebelum diserahkan.

## A. Avatar pemain

Setiap desain: seragam SMP (kemeja putih, celana atau rok `navy`, ikat pinggang `ink`, sepatu `dusk`) dan tas punggung berwarna kunci (usulan 5). Bingkai 16 × 24; berkasnya `ava_{n}_bawah_diam.png`, `ava_{n}_bawah_jalan.png`, `ava_{n}_atas_diam.png`, `ava_{n}_atas_jalan.png`, `ava_{n}_kanan_diam.png`, dan `ava_{n}_kanan_jalan.png`.

| ID | Desain | Kulit | Rambut atau kepala | Bawahan | Ciri lain | Status |
|---|---|---|---|---|---|---|
| A-01 | A1 | `skin-3` | `hair-1` pendek rapi, belah samping | Celana | — | Disetujui (6 Nov) |
| A-02 | A2 | `skin-1` | `hair-1` panjang dikuncir, ikat rambut `berry` | Rok, kaus kaki putih | — | Disetujui (6 Nov) |
| A-03 | A3 | `skin-4` | `hair-1` pendek ikal | Celana | Kacamata | Disetujui (6 Nov) |
| A-04 | A4 | `skin-2` | Kerudung putih | Rok panjang | Kemeja lengan panjang | Disetujui (6 Nov) |
| A-05 | A5 | `skin-2` | `hair-2` pendek berdiri | Celana | — | Disetujui (6 Nov) |
| A-06 | A6 | `skin-3` | `hair-2` panjang dikuncir, ikat rambut `rose` | Rok, kaus kaki putih | Kacamata | Disetujui (6 Nov) |
| A-07 | A7 | `skin-1` | `hair-2` pendek cepak | Celana | — | Disetujui (6 Nov) |
| A-08 | A8 | `skin-4` | Kerudung putih | Rok panjang | Kemeja lengan panjang | Disetujui (6 Nov) |
| A-09 | Ikon kepala | — | Kepala dan bahu A1–A8 menghadap bawah, untuk papan skor, lobi, dan kartu pemain (`ikon_ava_{n}.png`, 16 × 16); tali tas ikut berwarna kunci | — | — | Disetujui (6 Nov) |

**Warna tas** (dasar dan bayangan; warna kunci di gambar: `sun` dan `mango`)

| Warna penanda | Dasar | Bayangan |
|---|---|---|
| sun | `sun` | `mango` |
| mango | `mango` | `coral` |
| coral | `coral` | `wood-d` |
| rose | `rose` | `coral` |
| berry | `berry` | `malam` (`#4A4F9C`) |
| teal | `teal` | `grass` |
| leaf | `leaf` | `grass` |
| sky-d | `sky-d` | `navy` |

### Rincian kelompok A (6 November 2026)

| | |
|---|---|
| Kode | `scripts/game/art/atas_tokoh.py` (gambar avatar), `build_jejak.py` (daftar, ekspor, pemeriksaan, pratinjau). `atas_ubin.py` dan `atas_objek.py` berisi ubin rumput dan rumah dari uji gaya, untuk pratinjau |
| Berkas | 48 strip di `app/jejak-setara/assets/ava/` (`ava_1_bawah_diam.png` sampai `ava_8_kanan_jalan.png`) dan 8 ikon di `app/jejak-setara/assets/ikon/` (`ikon_ava_1.png` sampai `ikon_ava_8.png`) |
| Ukuran | Strip diam 417–561 B, strip jalan 526–701 B (batas 6 KB per strip); enam strip satu avatar 3,0–3,4 KB; ikon 235–325 B; seluruh kelompok A 27,8 KB |
| Pemeriksaan `build_jejak.py` | Lulus: 0 piksel di luar palet atau semi-transparan, ukuran 32 × 24 (diam), 64 × 24 (jalan), 16 × 16 (ikon), dan warna kunci tas tidak dipakai di luar tas |
| Pratinjau | `preview/ava_ringkasan.png` (ringkasan), `preview/ava_pose_semua.png` (semua bingkai ×3), `preview/pose_ava_1.png` sampai `pose_ava_8.png` (×6), dan `preview/ava_gerak.gif` (berjalan ke empat arah, lalu diam) |
| Kredit dan manifest | `CREDITS.md` dibuat otomatis sesudah "Setuju: aset A" (56 aset). `manifest.ts` menunggu bentuk yang disepakati Sesi A (Permintaan C-6) |

- A1 sama piksel dengan avatar uji gaya yang disetujui, termasuk bingkai jalan dan arah atas.
- Rok: kaus kaki putih di bawah rok. Pada bingkai diam kedua (bernapas), badan turun 1 piksel sehingga rok menutup kaus kaki, sama seperti celana yang menutup sebagian kaki pada A1.
- Rok panjang: hanya sepatu yang terlihat; saat berjalan, ujung rok ikut maju bersama sepatu.
- Kerudung: menutup kepala, telinga, bahu, dan dada; tepi juntai bergaris `slate`. Tali tas berada di atas juntai.
- Rambut dikuncir: dari depan, rambut panjang menutup telinga; dari samping dan belakang, ekor kuda dan ikat rambutnya terlihat.
- Kacamata: bingkai atas dan sisi berwarna `slate`.
- Dari depan, warna tas hanya terlihat di dua tali; dari samping dan belakang, tas terlihat penuh. Nama samaran di atas kepala (antarmuka) tetap menjadi penanda utama dari depan.

## U. Ubin per masa

Satu lembar per masa: `ubin_pagi.png`, `ubin_siang.png`, dan `ubin_sore.png`, masing-masing 256 × 384 piksel (377 ubin, 16 per baris). Nomor ubin sama di ketiga lembar.

| ID | Isi | Lapisan | Jumlah ubin | Zona | Status |
|---|---|---|---|---|---|
| U-01 | Rumput dasar, 4 varian yang dipilih berbenih menurut posisi agar pola tidak berulang | 0 | 4 | Semua | Disetujui (6 Nov) |
| U-02 | Detail rumput: bunga merah muda, bunga putih, rumput tinggi, daun gugur | 10 | 4 | Semua | Disetujui (6 Nov) |
| U-03 | Tanah setapak (`skin-2`, kerikil `wood`) dan peralihannya | 0 | 48 | Z1, Z6 | Disetujui (6 Nov) |
| U-04 | Paving gang (bata `wood`, nat `wood-d`) dan peralihannya | 0 | 48 | Z1 | Disetujui (6 Nov) |
| U-05 | Aspal dan peralihannya; pinggir jalan berisi bayangan kerb dan garis tepi; garis tengah putus-putus mendatar dan tegak | 0 dan 10 | 48 + 2 | Z3 | Disetujui (6 Nov) |
| U-06 | Zebra cross mendatar dan tegak | 10 | 2 | Z3 | Disetujui (6 Nov) |
| U-07 | Trotoar dan kerb: trotoar memakai semen (U-10), kerb menjadi pinggir aspal (U-05) | — | — | Z3, Z4 | Digabung ke U-05 dan U-10 |
| U-08 | Air dan air dalam, masing-masing dengan peralihannya (garis tepi dan buih; air dalam berpola papan catur ke air) | 0 | 48 + 48 | Z6 | Disetujui (6 Nov) |
| U-09 | Pasir dan peralihannya dengan rumput; tepi air ke pasir digambar oleh ubin air | 0 | 48 | Z6 | Disetujui (6 Nov) |
| U-10 | Semen (`mist`) untuk halaman sekolah, trotoar, pasar, dan halaman puskesmas, dengan peralihannya | 0 | 48 | Z2, Z3, Z4, Z7 | Disetujui (6 Nov) |
| U-11 | Lantai pasar memakai semen (U-10); lantai papan bale menjadi bagian objek bale (O-14) | — | — | Z4, Z5 | Digabung ke U-10 dan O-14 |
| U-12 | Garis lapangan: empat sisi, empat sudut, garis tengah mendatar dan tegak, dan pertemuan garis tengah dengan sisi; dipakai di atas rumput (taman) maupun semen (sekolah) | 10 | 14 | Z2, Z6 | Disetujui (6 Nov) |
| U-13 | Bayangan bangunan: kanan atas, kanan, sudut, bawah kiri, bawah | 10 | 5 | Semua | Disetujui (6 Nov) |
| U-14 | Bayangan pohon (2 × 2) dan objek kecil (1 × 1) | 10 | 5 | Semua | Disetujui (6 Nov) |
| U-15 | Detail tanah: batu, kerikil, retakan, genangan | 10 | 4 | Semua | Disetujui (6 Nov) |


### Rincian kelompok U (6 November 2026)

**Susunan lembar** (nomor ubin = baris × 16 + kolom, sama di ketiga masa):

| Nomor | Isi |
|---|---|
| 0–3 | Rumput varian 1–4 (varian 1 = uji gaya) |
| 4–39 | Ubin tumpang lapisan 10: detail (4–11), bayangan (12–21), marka jalan (22–25), garis lapangan (26–39) |
| 40–46 | Varian kedua isi tanah, paving, semen, pasir, aspal, air, dan air dalam |
| 47 | Kosong |
| 48–376 | 47 ubin peralihan per bahan, berurutan: tanah (48), paving (95), semen (142), pasir (189), aspal (236), air (283), air dalam (330) |

**Cara peralihan dibuat.** Setiap bahan wilayah punya urutan prioritas: rumput, tanah, paving, semen, pasir, aspal, air, lalu air dalam. Sebuah sel mendapat pita tepi di sisi atau sudut yang bertetangga dengan bahan berprioritas lebih rendah. Pita tepinya: tanah = rumput berpola papan catur lalu garis `wood`; paving = garis `wood-d`; semen = garis `slate`; pasir = rumput berpola papan catur; aspal = bayangan kerb `dusk`, aspal, lalu garis tepi (marka); air = garis bayangan lalu buih (kilau); air dalam = air berpola papan catur. Karena dihitung dari 8 tetangga, satu bahan cukup 47 ubin untuk semua bentuk, termasuk sudut dalam (jalan setapak berbentuk L dan tepi air berundak di pratinjau).

**Aturan peta untuk JS-06** (diperiksa `build_peta.py` nanti):
- Tanah dan pasir hanya bersebelahan dengan rumput atau air, karena pita tepinya memakai warna rumput.
- Lapangan berbentuk persegi panjang dengan lebar ganjil, agar garis tengah tepat di tengah.
- Setiap sel paling banyak satu ubin tumpang detail atau marka, dan satu ubin bayangan.
- Bayangan bangunan mengikuti kotak tapak bangunan (bentuk persegi), digeser 8 piksel ke kanan dan 4 piksel ke bawah.

| | |
|---|---|
| Kode | `scripts/game/art/atas_ubin.py` (bahan, ubin, susunan lembar, `nomor_tanah` untuk peta) dan `build_jejak.py` (ekspor, pemeriksaan, pratinjau) |
| Berkas | `app/jejak-setara/assets/ubin/ubin_pagi.png`, `ubin_siang.png`, `ubin_sore.png` |
| Ukuran | Sekitar 5,8 KB per lembar (batas 60 KB) |
| Pemeriksaan `build_jejak.py` | Lulus: hanya warna palet, ukuran 256 × 384, dan semua ubin lapisan 0 penuh tanpa lubang transparan |
| Pratinjau | `preview/ubin_contoh.png` (peta contoh siang ×2), `preview/ubin_masa.png` (tiga masa ×1), `preview/ubin_dekat.png` (potongan ×3 dengan garis pindai), dan `preview/ubin_lembar.png` (lembar ubin) |

- Rumput tetap `leaf` di ketiga masa, jadi pagi dan siang hampir sama di atas rumput. Perbedaan terbesar ada di air (biru muda, biru, jingga), pasir, warna bayangan, dan marka.
- Garis lapangan di atas semen memakai marka: putih di siang hari dan `cream` di pagi dan sore. Garis `cream` di atas `mist` tetap terlihat, tetapi lebih lembut.
- Pohon belum digambar (kelompok O2), jadi ubin bayangan pohon baru terlihat di lembar ubin.

**Bahan per masa.** Baris yang disetujui di kelompok U belum ada di Design System bagian 4 dan diajukan ke Sesi A (Permintaan C-2).

| Bahan | Pagi | Siang | Sore | Asal |
|---|---|---|---|---|
| Rumput | `leaf` | `leaf` | `leaf` | Design System bagian 4 |
| Tekstur rumput, daun | `grass` | `grass` | `grass` | Design System bagian 4 |
| Kilau | `PAGI2` | `white` | `SORE1` | Design System bagian 4 |
| Bayangan (papan catur) | `dusk` | `dusk` | `wood-d` | Design System bagian 4 |
| Aspal | `slate` | `slate` | `slate` | Design System bagian 4 |
| Marka, zebra cross, garis lapangan | `cream` | `white` | `cream` | Design System bagian 4 |
| Air | `PAGI1` | `SIANG1` | `SORE3` | Design System bagian 4 |
| Air dalam | `sky-d` | `sky-d` | `sky-d` | Design System bagian 4 |
| Pasir | `PAGI2` | `cream` | `SORE1` | Design System bagian 4 |
| Dinding | `cream` | `cream` | `cream` | Design System bagian 4 |
| Tanah setapak | `skin-2`, kerikil `wood` | sama | sama | Disetujui 6 Nov (kelompok U), tidak ditukar |
| Paving gang | bata `wood`, nat `wood-d` | sama | sama | Disetujui 6 Nov (kelompok U), tidak ditukar |
| Semen (halaman, trotoar, lantai pasar) | `mist`, bintik dan tepi `slate` | sama | sama | Disetujui 6 Nov (kelompok U), tidak ditukar |
| Kerb dan pinggir aspal | bayangan kerb `dusk`, garis tepi = marka | sama | sama | Disetujui 6 Nov (kelompok U) |

## O. Objek dan bangunan

Bangunan dan pohon terdiri atas `obj_{nama}.png` dan `obj_{nama}_atas.png` (usulan 6). Semua tanpa tulisan, logo, merek, lambang instansi, atau lambang palang merah dan bulan sabit merah.

### O1. Bangunan penanda zona

| ID | Berkas | Ukuran (ubin) | Isi | Zona dan kejadian | Status |
|---|---|---|---|---|---|
| O-01 | `obj_rumah_nara` | 4 × 4 | Rumah Nara: bentuk rumah a dengan pintu `teal`, kanopi `coral` di atas pintu, dan dua pot bunga; jendela bertirai `rose` | Z1, K-01 | Disetujui (6 Nov) |
| O-02 | `obj_rumah_a`, `obj_rumah_b` | 4 × 4, 3 × 3 | Rumah warga: varian a (uji gaya, atap limasan) dan varian b (atap pelana, lebih kecil) | Z1 | Disetujui (6 Nov) |
| O-03 | `obj_warung_made` | 3 × 3 | Warung berdinding papan, atap `coral`, etalase terbuka berisi stoples dan jajanan polos | Z1, K-02 | Disetujui (6 Nov) |
| O-04 | `obj_sekolah` | 10 × 6 | Gedung SMP dua lantai: dinding `cream`, atap limasan `sky-d`, selasar berpagar, tiga pintu kelas, tangga ke lantai dua di kanan depan | Z2, K-04 | Disetujui (6 Nov) |
| O-05 | `obj_kantin` | 4 × 3 | Kantin beratap `sky-d` dengan jendela layan berisi jajanan polos | Z2, K-03 | Disetujui (6 Nov) |
| O-06 | `obj_tiang_bendera` | 1 × 3 | Tiang bendera merah putih di atas alas semen | Z2 | Disetujui (6 Nov) |
| O-07 | `obj_gerbang_tutup`, `obj_gerbang_buka` | 4 × 2 | Gerbang besi berpilar `cream` bertopi `sky-d`: tertutup bergembok dan terbuka | Z2, lobi | Disetujui (6 Nov) |
| O-08 | `obj_halte` | 3 × 2 | Halte beratap `teal` dengan panel belakang dan bangku kayu | Z3, K-05, K-06 | Disetujui (6 Nov) |
| O-09 | `obj_angkot` | 3 × 2 | Angkot `sky-d` bergaris putih seperti di Sehari Setara, pintu samping terbuka | Z3, K-06 | Disetujui (6 Nov) |
| O-10 | `obj_rambu_seberang`, `obj_rambu_halte` | 1 × 2 | Rambu biru bertepi putih: segitiga berpejalan kaki, dan gambar angkot | Z3 | Disetujui (6 Nov) |
| O-11 | `obj_tenda_a`, `obj_tenda_b` | 3 × 3 | Tenda bergaris `mango` dan `sun`: varian a berisi sayur dan buah, varian b berisi tampah bumbu | Z4 | Disetujui (6 Nov) |
| O-12 | `obj_los` | 6 × 3 | Los beratap seng (`slate`), tirai bergaris, lapak sepanjang depan | Z4, K-07 | Disetujui (6 Nov) |
| O-13 | `obj_gerobak` | 2 × 2 | Gerobak kayu beroda dengan atap kecil `teal` dan etalase kaca | Z4, Z7, K-14 | Disetujui (6 Nov) |
| O-14 | `obj_bale` | 5 × 4 | Bale terbuka: lantai papan panggung, tiang kayu, atap limasan `wood-d` | Z5, K-09, K-10 | Disetujui (6 Nov) |
| O-15 | `obj_pos_ronda` | 3 × 3 | Pos ronda panggung beratap `wood-d` dengan kentongan tergantung | Z5 | Disetujui (6 Nov) |
| O-16 | `obj_jembatan_datar`, `obj_jembatan_tegak` | 3 × 2, 2 × 3 | Jembatan papan berpagar, satu berkas tanpa bagian atas, bisa dilewati di atas air | Z6 | Disetujui (6 Nov) |
| O-17 | `obj_kelapa` | 3 × 4 | Pohon kelapa: batang condong berbuku, tajuk 11 pelepah dengan buah | Z6 | Disetujui (6 Nov) |
| O-18 | `obj_puskesmas` | 6 × 4 | Dinding `white`, atap limasan `teal`, papan bergambar hati `leaf`, pintu kaca ganda, landai berpegangan di samping pintu | Z7, K-13 | Disetujui (6 Nov) |
| O-19 | `obj_kantor_desa` | 6 × 4 | Dinding `cream`, atap `teal`, serambi bertiang putih, pintu kayu ganda, tiang bendera kecil | Z7, K-14 | Disetujui (6 Nov) |
| O-20 | `obj_warung_wifi` | 4 × 3 | Atap `berry`, antena, papan bergambar gelombang sinyal `teal`, colokan, bangku panjang | Z8, K-15, K-16 | Disetujui (6 Nov) |

#### Rincian kelompok O1 (6 November 2026)

| | |
|---|---|
| Kode | `scripts/game/art/atas_objek.py`: satu fungsi per objek dan daftar `OBJEK` (ukuran, baris potong, kotak padat, jenis bayangan, bisa dilewati) yang nanti dipakai `build_peta.py` di JS-06 |
| Berkas | 48 PNG di `app/jejak-setara/assets/obj/`: 23 objek berbagian bawah dan atas (`obj_{nama}.png` dan `obj_{nama}_atas.png`) dan 2 jembatan satu berkas |
| Ukuran | Seluruh kelompok O1 15,9 KB; berkas terbesar 747 B |
| Pemeriksaan `build_jejak.py` | Lulus: hanya warna palet, tanpa piksel semi-transparan, ukuran sesuai ubin (lebar ubin × 16 + 2 piksel margin) |
| Pratinjau | `preview/obj_lembar.png` (semua objek ×2), `preview/obj_peta.png` (delapan zona di peta contoh, ×2), `preview/obj_dekat.png` (potongan ×3 dengan garis pindai) |

- Kotak padat: bangunan padat kecuali baris ubin teratas, tempat atap menutupi pemain yang berjalan di belakangnya. Tiang bendera, rambu, dan gerbang hanya padat di alasnya; gerbang terbuka hanya di kedua pilarnya. Pohon kelapa hanya padat di ubin batang. Jembatan bisa dilewati walaupun di atas air.
- Bayangan di tanah: bangunan memakai ubin bayangan bangunan (U-13) mengikuti tapaknya; pohon kelapa memakai bayangan kecil (U-14) di ubin batang; tiang, rambu, gerbang, dan jembatan tanpa bayangan.
- Semua tanpa tulisan, logo, merek, pelat nomor, atau lambang instansi. Puskesmas memakai hati `leaf`, bukan palang merah. Bendera merah putih memakai `coral` dan `white` seperti di Sehari Setara.
- Landai berpegangan di puskesmas dan tangga terbuka di sekolah mendukung kejadian K-04 (akses kursi roda).

### O2. Objek umum

| ID | Berkas | Ukuran (ubin) | Isi | Zona dan kejadian | Status |
|---|---|---|---|---|---|
| O-21 | `obj_pohon` | 3 × 3 (batang 1 ubin, tajuk 2 × 2) | Pohon rindang: tajuk bergerombol `leaf` dengan lengkung daun dan sisi kanan bawah teduh, batang di tengah bawah | Semua | Disetujui (6 Nov) |
| O-22 | `obj_semak` | 1 × 1 | Semak bergerombol | Semua | Disetujui (6 Nov) |
| O-23 | `obj_pagar_bambu_{ruas}` | 1 × 1 | Pagar bambu `wood` beruas dalam 8 ruas: datar, tegak, sudut atas kiri, sudut atas kanan, sudut bawah kiri, sudut bawah kanan, ujung kiri, ujung kanan | Z1, K-01 | Disetujui (6 Nov) |
| O-24 | `obj_pagar_sekolah_{ruas}` | 1 × 1 | Tembok sekolah `cream` bertutup `sky-d`, dengan 8 ruas yang sama; sudutnya berupa pilar | Z2 | Disetujui (6 Nov) |
| O-25 | `obj_bangku` | 2 × 1 | Bangku panjang kayu bersandaran | Z6, Z7, Z8 | Disetujui (6 Nov) |
| O-26 | `obj_tempat_sampah` | 1 × 1 | Dua tempat sampah untuk memilah, hijau dan kuning, tanpa tulisan | Semua, K-11 | Disetujui (6 Nov) |
| O-27 | `obj_motor` | 2 × 1 | Motor matik `mango` seperti motor Dimas di Sehari Setara, tanpa merek dan pelat | Z3, Z4, K-05 | Disetujui (6 Nov) |
| O-28 | `obj_tiang_lampu` | 1 × 2 | Tiang lampu jalan dengan lampu berwarna `lampu` (#F7D774) | Z1, Z3 | Disetujui (6 Nov) |

#### Rincian kelompok O2 (6 November 2026)

| | |
|---|---|
| Kode | `scripts/game/art/atas_objek.py` (fungsi objek, `_pagar` untuk semua ruas pagar, dan entri `OBJEK`) |
| Berkas | 24 PNG di `app/jejak-setara/assets/obj/`: pohon dan tiang lampu dua bagian, objek lain satu berkas, ditambah 8 ruas pagar bambu dan 8 ruas tembok sekolah |
| Ukuran | Seluruh kelompok O2 4,8 KB |
| Pemeriksaan `build_jejak.py` | Lulus: hanya warna palet, tanpa piksel semi-transparan, ukuran sesuai ubin |
| Pratinjau | `preview/obj2_lembar.png` (objek ×3, ruas pagar ×3, dan contoh susunan pagar ×2) dan `preview/obj2_peta.png` (peta contoh 30 × 20 ubin, ×2) |

- Daftar rencana menyebut ruas datar, tegak, dan sudut. Kini setiap pagar punya 8 ruas (empat sudut dan dua ujung), agar pagar bisa mengelilingi halaman dan menyisakan celah di depan pintu atau gerbang.
- Sisi ruas yang tersambung digambar menembus tepi ubin lalu dipotong, sehingga ruas yang berdampingan menyambung tanpa garis luar di tengah sambungan. Di JS-06, `build_peta.py` memilih ruas dari tetangganya.
- Kotak padat: pohon hanya di ubin batang; tiang lampu di alasnya; pagar, bangku, tempat sampah, dan motor di seluruh ubinnya.
- Bayangan di tanah: pohon memakai bayangan pohon 2 × 2 (U-14) di bawah tajuk; semak, tempat sampah, dan motor memakai bayangan kecil (U-14); pagar, bangku, dan tiang lampu tanpa bayangan.

### O3. Properti kejadian

Diambil dari tabel "Tokoh dan properti per kejadian" di `naskah/NASKAH.md`. Properti yang dipegang tokoh (HP, kotak bekal di tangan Komang) sudah menjadi pose tokoh di kelompok N. Benda kecil digambar di tengah kanvas 1 × 1 ubin agar mudah diletakkan, dan bisa dilewati.

| ID | Berkas | Ukuran (ubin) | Isi | Kejadian | Status |
|---|---|---|---|---|---|
| O-29 | `obj_pengeras_suara` | 1 × 1 | Pengeras suara portabel `dusk` | K-02 | Disetujui (6 Nov) |
| O-30 | `obj_kotak_bekal` | 1 × 1, benda kecil | Kotak bekal `sky-d` bertutup `mist` | K-03 | Disetujui (6 Nov) |
| O-31 | `obj_kursi_roda` | 1 × 1 | Kursi roda kosong dilihat dari depan; Raka yang duduk di kursi roda ada di N-17 | K-04 | Disetujui (6 Nov) |
| O-32 | `obj_tiang_kamera` | 1 × 2 | Tiang dengan kamera keamanan kecil | K-07 | Disetujui (6 Nov) |
| O-33 | `obj_lapak` | 2 × 2 | Meja lapak dengan tiga keranjang sayur dan buah, peti terung di depan | K-07 | Disetujui (6 Nov) |
| O-34 | `obj_dompet` | 1 × 1, benda kecil | Dompet cokelat tanpa tulisan | K-08 | Disetujui (6 Nov) |
| O-35 | `obj_bangku_pasar` | 2 × 1 | Bangku kayu tanpa sandaran | K-08 | Disetujui (6 Nov) |
| O-36 | `obj_pos_keamanan` | 2 × 2 | Pos jaga beratap seng dengan loket dan pintu, tanpa tulisan dan lambang | K-08 | Disetujui (6 Nov) |
| O-37 | `obj_meja_panitia` | 2 × 1 | Meja dengan kertas polos, pensil, dan tumpukan kertas, tanpa tulisan | K-09, K-10 | Disetujui (6 Nov) |
| O-38 | `obj_sisa_piknik` | 2 × 1 | Tikar anyaman dengan botol, bungkus, dan kantong plastik; bisa dilewati | K-11 | Disetujui (6 Nov) |
| O-39 | `obj_bola` | 1 × 1, benda kecil | Bola putih bertambal | K-12 | Disetujui (6 Nov) |
| O-40 | `obj_tali_lompat` | 1 × 1 | Tali lompat `coral` bergagang kayu, tergeletak di tanah | K-12 | Disetujui (6 Nov) |
| O-41 | `obj_bangku_antrean` | 3 × 1 | Empat kursi plastik `sky-d` bersambung | K-13 | Disetujui (6 Nov) |
| O-42 | `obj_sanggah` | — | Sanggah keluarga untuk K-02 versi B | K-02 | Ditunda: hanya bila KT-10 memilih versi B dan pemilik proyek mengizinkan, karena Design System bagian 7 aturan 6 tidak menggambar tempat ibadah sebagai penanda zona |

#### Rincian kelompok O3 (6 November 2026)

| | |
|---|---|
| Kode | `scripts/game/art/atas_objek.py` (bagian "kelompok O3" dan entri `OBJEK`) |
| Berkas | 15 PNG di `app/jejak-setara/assets/obj/`; tiang kamera dan pos keamanan berbagian bawah dan atas |
| Ukuran | Seluruh kelompok O3 3,2 KB |
| Pemeriksaan `build_jejak.py` | Lulus: hanya warna palet, tanpa piksel semi-transparan, ukuran sesuai ubin |
| Pratinjau | `preview/obj3_lembar.png` (properti ×4) dan `preview/obj3_set.png` (set tokoh dan properti untuk 12 kejadian, ×3) |

- Pratinjau set kejadian memakai tokoh yang sudah disetujui dan mengikuti tabel tokoh dan properti di `naskah/NASKAH.md`. Di JS-06, setiap titik kejadian menyediakan ruang 3 × 3 ubin untuk set ini.
- K-05 (Dimas di motor dan halte), K-10, K-15, dan K-16 memakai tokoh dan objek dari kelompok yang sudah disetujui (pose Dimas di motor, halte, meja panitia, warung berwifi, pose memegang HP).
- Benda kecil (kotak bekal, dompet, bola, tali lompat) dan sisa piknik tidak punya kotak padat.

### O4. Varian untuk peta besar

Ditambahkan sesudah keputusan ukuran peta 160 × 100 ubin, agar kampung yang lebih luas tidak terlihat berulang. Semua memakai warna tetap dan gaya acuan yang sama.

| ID | Berkas | Ukuran (ubin) | Isi | Zona | Status |
|---|---|---|---|---|---|
| O-43 | `obj_rumah_c` | 5 × 4 | Rumah warga memanjang: atap pelana `coral`, dinding peach, teras bertiang dengan bangku, tirai `leaf` | Z1 | Disetujui (6 Nov) |
| O-44 | `obj_rumah_d` | 3 × 3 | Rumah warga kecil: atap limasan `coral`, dinding `mist`, pintu di kanan, tirai `sun` | Z1 | Disetujui (6 Nov) |
| O-45 | `obj_pohon_b` | 3 × 3 (batang 1 ubin) | Pohon rindang gelap: tajuk bulat `grass` dengan lengkung daun `leaf` | Semua | Disetujui (6 Nov) |
| O-46 | `obj_pohon_c` | 3 × 3 (batang 1 ubin) | Pohon berbunga: tajuk `leaf` dengan bunga `rose` dan putih | Semua | Disetujui (6 Nov) |
| O-47 | `obj_pohon_kecil` | 1 × 2 | Pohon muda dengan tajuk kecil | Semua | Disetujui (6 Nov) |
| O-48 | `obj_pisang` | 3 × 3 (batang 1 ubin) | Pohon pisang: batang semu hijau, daun lebar, setandan pisang dan jantungnya | Z1, Z6 | Disetujui (6 Nov) |
| O-49 | `obj_semak_b` | 1 × 1 | Semak berbunga `rose` dan putih | Semua | Disetujui (6 Nov) |
| O-50 | `obj_pot_tanaman` | 1 × 1 | Pot tanaman `coral` di depan rumah | Z1, Z8 | Disetujui (6 Nov) |
| O-51 | `obj_batu` | 1 × 1 | Batu besar di tepi sungai atau taman | Z6 | Disetujui (6 Nov) |

#### Rincian kelompok O4 (6 November 2026)

| | |
|---|---|
| Kode | `scripts/game/art/atas_objek.py` (bagian "kelompok O4" dan entri `OBJEK`) |
| Berkas | 15 PNG di `app/jejak-setara/assets/obj/`; rumah dan pohon berbagian bawah dan atas |
| Ukuran | Seluruh kelompok O4 4,7 KB |
| Pemeriksaan `build_jejak.py` | Lulus: hanya warna palet, tanpa piksel semi-transparan, ukuran sesuai ubin |
| Pratinjau | `preview/obj4_lembar.png` (varian ×3) dan `preview/obj4_peta.png` (potongan kampung 40 × 26 ubin dengan semua varian, ×2) |

- Peta 160 × 100 kini bisa memakai lima bentuk rumah dan enam jenis pohon (termasuk kelapa). Di JS-06, `build_peta.py` memilih varian berbenih agar susunan tidak berulang.
- Pohon dan pisang hanya padat di ubin batangnya; tajuknya di lapisan atas menutupi pemain yang lewat di belakangnya.

## T. Penanda dan efek

Berkas `tanda_*.png` disimpan di folder `ikon/`, karena Architecture bagian 3 tidak mempunyai folder `tanda/`; di manifest tetap kelompok `tanda`.

| ID | Berkas | Ukuran | Isi | Status |
|---|---|---|---|---|
| T-01 | `tanda_kejadian.png` | 12 × 12 | Gelembung `sun` bertanda seru, bergaris luar `ink`, berkilau putih. Naik-turun 1 piksel dilakukan antarmuka | Disetujui (6 Nov) |
| T-02 | `tanda_dibuka.png` | 12 × 12 | Gelembung `mist` bertanda tiga titik | Disetujui (6 Nov) |
| T-03 | `tanda_selesai.png` | 10 × 10 | Gelembung kecil `leaf` bertanda centang `ink` | Disetujui (6 Nov) |
| T-04 | `tanda_kotak_sepatu.png` | 3 × 14 × 12 | Peti kayu bergesper; tutupnya bergambar sepatu `coral` (Lari cepat). Bingkai: kecil, besar berkilau, biasa | Disetujui (6 Nov) |
| T-05 | `tanda_kotak_kompas.png` | 3 × 14 × 12 | Peti bergambar kompas putih berjarum `teal` (Kompas kejadian) | Disetujui (6 Nov) |
| T-06 | `tanda_kotak_buku.png` | 3 × 14 × 12 | Peti bergambar buku terbuka putih bersampul `sky-d` (Petunjuk) | Disetujui (6 Nov) |
| T-07 | `tanda_kotak_teropong.png` | 3 × 14 × 12 | Peti bergambar teropong `dusk` (P1) | Disetujui (6 Nov) |
| T-08 | `tanda_kotak_karcis.png` | 3 × 14 × 12 | Peti bergambar karcis `sun` (Angkot, P1) | Disetujui (6 Nov) |
| T-09 | `tanda_kompas.png` | 16 × 7 × 7 | Panah `teal` bergaris luar `ink`, 8 arah; bingkai kedua lebih terang (berdenyut) | Disetujui (6 Nov) |
| T-10 | `tanda_diri.png` | 4 × 7 × 7 | Panah `sun` bergaris luar `ink` untuk peta mini | Disetujui (6 Nov) |
| T-11 | `tanda_debu.png` | 2 × 8 × 6 | Debu lari `mist` dan putih, tanpa garis luar | Disetujui (6 Nov) |
| T-12 | `tanda_kilau.png` | 2 × 8 × 8 | Kilau putih dan `sun`, tanpa garis luar | Disetujui (6 Nov) |
| — | Titik pemain di peta kelas | 3 × 3 | Digambar antarmuka dengan warna tas; tanpa berkas | — |

### Rincian kelompok T (6 November 2026)

| | |
|---|---|
| Kode | `scripts/game/art/atas_ikon.py` (baru): gelembung, peti, panah, debu, dan kilau |
| Berkas | 12 PNG di `app/jejak-setara/assets/ikon/` |
| Ukuran | Seluruh kelompok T 3,1 KB |
| Pemeriksaan `build_jejak.py` | Lulus: hanya warna palet, tanpa piksel semi-transparan, ukuran strip sesuai jumlah bingkai |
| Pratinjau | `preview/tanda_lembar.png` (semua penanda ×8 di atas empat bahan, dan contoh saat bermain ×3) dan `preview/tanda_gerak.gif` (gerakan) |

**Urutan bingkai di berkas**
- `tanda_kompas.png`: atas, kanan atas, kanan, kanan bawah, bawah, kiri bawah, kiri, kiri atas; dua bingkai per arah (biasa, terang).
- `tanda_diri.png`: bawah, atas, kanan, kiri.
- `tanda_kotak_*.png`: kecil, besar berkilau, biasa. Bingkai biasa (ketiga) dipakai saat kotak diam.

- Bingkai kotak menjadi 14 × 12, bukan 12 × 10 seperti di rencana, agar bingkai besar berkilau muat dalam strip. Peti biasa tetap 12 × 10, sesuai Design System bagian 9.
- Semua penanda bergaris luar `ink`, sehingga tetap terlihat di rumput, aspal, semen, dan pasir. Kejadian, dialog, dan selesai dibedakan bentuk dan tandanya (seru, tiga titik, centang), bukan hanya warnanya.
- Kurangi gerak: penanda dan panah diam di bingkai pertama, dan kotak langsung tampil dengan bingkai biasa (Design System bagian 11).

## N. Tokoh bukan pemain

Tampak atas, menghadap bawah, diam 2 bingkai (`npc_{tokoh}_bawah_diam.png`), ditambah pose khusus yang diperlukan kejadian. Ukuran bingkai: siswa dan lansia 16 × 24, dewasa 16 × 26, anak SD 14 × 20 (Design System bagian 8). Ciri tokoh Sehari Setara sama dengan `docs/sehari-setara/Daftar_Aset.md` bagian A.

### N1. Tokoh Sehari Setara

| ID | Tokoh | Berkas | Ciri | Kejadian | Status |
|---|---|---|---|---|---|
| N-01 | Nara | `npc_nara_bawah_diam.png` (16 × 24) | Rambut berponi `hair-1`, `skin-2`, seragam SMP, tali tas `mango` (tas `sun`, warna asli, tidak diganti antarmuka) | K-01, K-08 | Disetujui (6 Nov) |
| N-02 | Ibu | `npc_ibu_bawah_diam.png` (16 × 26) | `skin-3`, rambut `hair-2` bersanggul, daster `rose` bertitik putih dan kuning, sandal | Tidak ada di set peta naskah; Design System bagian 8 | Disetujui (6 Nov) |
| N-03 | Gita | `npc_gita_bawah_diam.png` (14 × 20) | Anak SD: `skin-1`, rambut dikuncir samping berikat `coral`, pipi merah muda, kemeja putih, rok `coral`, kaus kaki putih | K-01, K-12 | Disetujui (6 Nov) |
| N-04 | Dimas | `npc_dimas_bawah_diam.png` (16 × 24), `npc_dimas_kanan_motor.png` (34 × 30) | `skin-4`, rambut cepak, jaket `sky-d` terbuka di atas seragam; pose khusus duduk di motor matik `mango` menghadap kanan, tanpa helm seperti adegan 2 Sehari Setara | K-02, K-05 | Disetujui (6 Nov) |
| N-05 | Sinta | `npc_sinta_bawah_diam.png` (16 × 24) | `skin-3`, kerudung putih, kemeja lengan panjang, rok panjang `navy`, tanpa tas | K-09 | Disetujui (6 Nov) |
| N-06 | Bu Ratih | `npc_ratih_bawah_diam.png` (16 × 26) | `skin-4`, rambut bob, kacamata, kemeja batik `teal`, rok cokelat, memeluk buku `mango` | Disebut di pilihan K-03 dan K-14; Design System bagian 8 | Disetujui (6 Nov) |
| N-07 | Komang | `npc_komang_bawah_diam.png`, `npc_komang_bawah_menunduk.png` (16 × 24) | `skin-2`, potongan mangkuk, 1 piksel lebih pendek, seragam kebesaran tidak dimasukkan, sepatu kanan robek; pose khusus menunduk memegang kotak bekal | K-03 (K-15 hanya di dalam video, tidak di peta) | Disetujui (6 Nov) |
| N-08 | Pak Made | `npc_made_bawah_diam.png` (16 × 26) | `skin-4`, rambut kelabu menipis, kumis kelabu, kaus `mango`, sarung kotak-kotak `navy` bergaris `sky-d`, sandal | K-02 | Disetujui (6 Nov) |
| N-09 | Bayu | `npc_bayu_bawah_diam.png` (16 × 26) | `skin-2`, rambut rapi `hair-2`, kaus `mist`, jin `sky-d`, sepatu kets putih; netral dan ramah | K-07 | Disetujui (6 Nov) |

#### Rincian kelompok N1 (6 November 2026)

| | |
|---|---|
| Kode | `scripts/game/art/atas_tokoh.py` (bagian "tokoh bukan pemain": `NPC`, `npc()`, `strip_npc()`); gambar motor dipakai bersama lewat `_motor()` di `atas_objek.py` (motor O-27 tetap sama piksel) |
| Berkas | 11 PNG di `app/jejak-setara/assets/npc/`, masing-masing strip 2 bingkai (diam bernapas) |
| Ukuran | Seluruh kelompok N1 5,5 KB |
| Titik kaki (jangkar) | Siswa 16 × 24: (8, 21) · dewasa 16 × 26: (8, 23) · anak 14 × 20: (7, 17) · Dimas di motor 34 × 30: (17, 28) |
| Pemeriksaan `build_jejak.py` | Lulus: hanya warna palet, tanpa piksel semi-transparan, ukuran sesuai |
| Pratinjau | `preview/npc1_ringkasan.png` (setiap tokoh di samping sprite Sehari Setara yang sudah disetujui) dan `preview/npc1_peta.png` (tokoh di peta contoh, di tempat kejadiannya) |

- Ciri setiap tokoh sama dengan sprite Sehari Setara (`docs/sehari-setara/Daftar_Aset.md` bagian A), diperkecil menjadi gaya *chibi* tampak atas dengan proporsi avatar yang sudah disetujui.
- Tokoh bukan pemain tidak bertas punggung, kecuali Nara, sehingga tidak tertukar dengan pemain (usulan 9a).
- Bayu digambarkan netral dan ramah, dan Komang digambarkan bermartabat (AGENTS bagian 8).
- Avatar A1 sampai A8 tidak berubah; `_badan_bawah` hanya mendapat pilihan tanpa tali tas untuk tokoh bukan pemain.

### N2. Warga dan tokoh baru

Ciri Raka, Wayan, dan siswa umum diusulkan Sesi C dan ditetapkan pemilik proyek pada 6 November 2026 ("Setuju: aset N2"). Sesi A dapat menyalinnya ke Design System bagian 8 untuk menyelesaikan Permintaan A-1 Sesi B.

| ID | Tokoh | Berkas | Ciri | Kejadian | Status |
|---|---|---|---|---|---|
| N-10 | Warga dewasa 1–3 | `npc_warga1_bawah_diam`, `npc_warga1_bawah_menunjuk`, `npc_warga2_bawah_diam`, `npc_warga3_bawah_diam` (16 × 26) | Warga 1: `skin-3`, rambut rapi, kemeja `sky-d`, celana `dusk`; pose menunjuk sambil bicara, tanpa kekerasan. Warga 2: `skin-1`, kerudung `teal`, baju lengan panjang `berry`, rok panjang `navy`. Warga 3: `skin-4`, rambut kelabu cepak, kemeja cokelat | K-07, K-10 | Disetujui (6 Nov) |
| N-11 | Nenek | `npc_nenek_bawah_diam` (16 × 24) | `skin-3`, rambut kelabu bersanggul, baju lengan panjang `berry`, kain cokelat, bertongkat, sedikit lebih rendah | K-06 | Disetujui (6 Nov) |
| N-12 | Ibu menggendong bayi | `npc_ibubayi_bawah_diam` (16 × 26) | `skin-2`, rambut bersanggul, baju `teal`, rok panjang `navy`, gendongan `mango`, bayi berselimut putih | K-13 | Disetujui (6 Nov) |
| N-13 | Anak SD 1–2 | `npc_anak1_bawah_diam`, `npc_anak2_bawah_diam` (14 × 20) | Anak 1: `skin-3`, rambut pendek, kaus `sun`, celana pendek `navy`. Anak 2: `skin-4`, rambut dikuncir dua berikat `leaf`, kaus `rose`, rok `sky-d` | K-12 | Disetujui (6 Nov) |
| N-14 | Pedagang | `npc_pedagang_bawah_diam` (16 × 26) | `skin-3`, caping anyaman, kaus `coral`, celemek putih, sandal | K-07 | Disetujui (6 Nov) |
| N-15 | Petugas puskesmas | `npc_petugas_bawah_diam` (16 × 26) | `skin-1`, rambut bersanggul, seragam putih dengan tanda hati `leaf`, sepatu putih; ramah | K-13 | Disetujui (6 Nov) |
| N-16 | Polisi | `npc_polisi_bawah_diam` (16 × 26) | `skin-2`, topi gelap polos, seragam cokelat bersaku tanpa lambang instansi; sikap membantu | Design System bagian 8 | Disetujui (6 Nov) |
| N-17 | Raka | `npc_raka_bawah_kursiroda` (16 × 24) | Usulan: `skin-3`, rambut belah tengah `hair-2`, seragam tanpa tas, duduk di kursi roda dengan tangan di pelek roda | K-04 | Disetujui (6 Nov) |
| N-18 | Wayan | `npc_wayan_bawah_diam` (16 × 24) | Usulan: `skin-4`, rambut belah tengah, kaus `leaf`, celana pendek cokelat, sandal (membantu gerobak orang tuanya) | K-14 | Disetujui (6 Nov) |
| N-19 | Siswa umum S1–S4 | `npc_siswa1_bawah_diam`, `npc_siswa1_bawah_hp`, `npc_siswa2_bawah_diam`, `npc_siswa2_bawah_menunduk`, `npc_siswa3_bawah_diam`, `npc_siswa4_bawah_diam` (16 × 24) | Usulan, berbaju bebas tanpa tas: S1 `skin-1`, rambut tergerai, kaus `berry`, jin; S2 `skin-3`, rambut ikal, kaus `sky-d`; S3 `skin-2`, kerudung `rose`, baju lengan panjang `sky-d`, rok panjang; S4 `skin-4`, rambut dikuncir, kaus `leaf`. Pose memegang HP (S1) dan menunduk (S2) | K-01, K-08, K-09, K-10, K-11, K-12, K-15, K-16 | Disetujui (6 Nov) |
| N-20 | Siswa umum S5–S6 | `npc_siswa5_bawah_diam`, `npc_siswa5_bawah_hp`, `npc_siswa6_bawah_diam` (16 × 24) | Usulan, berseragam tanpa tas: S5 `skin-1`, rambut belah tengah, celana; S6 `skin-4`, rambut tergerai, rok panjang. Pose memegang HP (S5) | K-03, K-04, K-13 | Disetujui (6 Nov) |

#### Rincian kelompok N2 (6 November 2026)

| | |
|---|---|
| Kode | `scripts/game/art/atas_tokoh.py` (bagian "kelompok N2": `NPC2`, `npc2()`, `strip_npc2()`) |
| Berkas | 22 PNG di `app/jejak-setara/assets/npc/`, masing-masing strip 2 bingkai |
| Ukuran | Seluruh kelompok N2 11,1 KB |
| Titik kaki (jangkar) | Sama dengan kelompok N1: siswa dan lansia (8, 21), dewasa (8, 23), anak (7, 17); Raka di kursi roda (8, 21) |
| Pemeriksaan `build_jejak.py` | Lulus: hanya warna palet, tanpa piksel semi-transparan, ukuran sesuai |
| Pratinjau | `preview/npc2_ringkasan.png` (semua tokoh ×5 dan usulan ciri) dan `preview/npc2_peta.png` (tokoh di tempat kejadiannya) |

- Siswa umum tidak bertas punggung, sehingga tidak tertukar dengan pemain (usulan 9a). Kerudung, kulit, dan rambut dibuat beragam.
- Polisi tanpa lambang instansi, petugas puskesmas memakai tanda hati `leaf`, dan caping pedagang tanpa tulisan.
- Tokoh kelompok N1 dan kedelapan avatar tidak berubah.

## I. Ikon

Ikon 16 × 16 (termasuk margin 1 piksel) bergaris luar `ink`, sejalan dengan ikon antarmuka Sehari Setara.

| ID | Berkas | Ukuran | Isi | Status |
|---|---|---|---|---|
| I-01 | `ikon_lari.png` | 16 × 16 | Sepatu `coral` bersol putih dengan garis laju (Lari cepat) | Disetujui (6 Nov) |
| I-02 | `ikon_kompas.png` | 16 × 16 | Kompas bermuka putih, jarum `teal` (Kompas kejadian) | Disetujui (6 Nov) |
| I-03 | `ikon_petunjuk.png` | 16 × 16 | Buku terbuka bersampul `sky-d` dengan pembatas `coral` (Petunjuk) | Disetujui (6 Nov) |
| I-04 | `ikon_teropong.png` | 16 × 16 | Teropong `dusk` (P1) | Disetujui (6 Nov) |
| I-05 | `ikon_karcis.png` | 16 × 16 | Karcis `sun` bergambar angkot (Angkot, P1) | Disetujui (6 Nov) |
| I-06 sampai I-13 | `ikon_zona_1.png` sampai `ikon_zona_8.png` | 16 × 16 | Ikon zona: rumah, buku, rambu, keranjang, kentongan, pohon kelapa, hati, gelombang sinyal | Disetujui (6 Nov) |
| I-14 | `ikon_mini_kejadian.png`, `ikon_mini_selesai.png`, `ikon_mini_halte.png` | 7 × 7 | Peta mini: "!" `sun`, centang `leaf`, dan halte `teal` (P1); ukuran dipastikan bersama JS-07 | Disetujui (6 Nov) |
| I-15 | `ikon_menyambung.png` | 2 × 16 × 16 | Jam berputar untuk layar menyambung ulang | Disetujui (6 Nov) |
| I-16 | `ikon_putar_hp.png` | 32 × 32 | Panah dari HP tegak ke HP mendatar | Disetujui (6 Nov) |
| I-17 | `ikon_jejak.png` | 32 × 32 | Ikon tab: dua jejak kaki `sun` di atas petak `navy` | Disetujui (6 Nov) |
| I-18 | `ikon_arsip.png`, `ikon_peringatan.png`, `ikon_centang.png` | 16 × 16 | Konsol: kotak arsip `mist`, segitiga `mango` bertanda seru (rujukan belum diverifikasi), lingkaran `leaf` bercentang (terverifikasi) | Disetujui (6 Nov) |
| I-19 | `ikon_bintang.png` (3 bingkai), `ikon_jam.png`, `ikon_suara_nyala.png`, `ikon_suara_mati.png`, `ikon_layar_penuh.png`, `ikon_matahari.png`, `ikon_bulan.png`, `ikon_emosi_hati.png`, `ikon_emosi_keringat.png`, `ikon_emosi_tanya.png`, `ikon_emosi_seru.png` | 16 × 16, emosi 8 × 8 | Dipakai ulang dari Sehari Setara: dibangun dari `ikon.py` tanpa perubahan; piksel sama dengan berkas Sehari Setara | Disetujui (6 Nov) |

### Rincian kelompok I (6 November 2026)

| | |
|---|---|
| Kode | `scripts/game/art/atas_ikon.py` (bagian "kelompok I"); ikon I-19 dipanggil dari `ikon.py` Sehari Setara tanpa diubah |
| Berkas | 33 PNG di `app/jejak-setara/assets/ikon/`: 22 ikon baru dan 11 ikon yang dipakai ulang |
| Ukuran | Seluruh kelompok I 6,7 KB |
| Pemeriksaan `build_jejak.py` | Lulus: hanya warna palet, tanpa piksel semi-transparan, ukuran sesuai. Ikon I-19 sama piksel dengan berkas Sehari Setara |
| Pratinjau | `preview/ikon_lembar.png` (semua ikon) dan `preview/ikon_hud.png` (ikon di tiruan HUD, bukan tata letak akhir) |

- Ikon antarmuka (I-15 sampai I-18) dibuat sekarang agar Sesi A bisa langsung memakainya; bentuk akhirnya bisa disesuaikan ketika spesifikasi JS-07 sampai JS-12 ditulis.
- Tidak ada tulisan, logo, atau lambang di ikon mana pun. Ikon zona Z7 memakai hati, bukan palang merah.

## Efek suara

Efek suara di Design System bagian 12 (`sfx_kejadian.wav` sampai `sfx_akhir.wav`) tidak dibuat dengan kit gambar dan tidak termasuk pekerjaan Plan ini. Bunyi klik dan bunyi teks memakai ulang Sehari Setara.

## Catatan teknis untuk Sesi A

- **Tokoh:** bingkai 16 × 24 dengan titik kaki di x 8, y 21 (baris tepat di bawah sepatu). Strip mendatar, bingkai berurutan dari kiri. Arah kiri dicerminkan dari arah kanan.
- **Tas:** warna kunci `sun` dan `mango` diganti serentak saat memuat (tabel "Warna tas").
- **Objek dua bagian:** `obj_{nama}.png` dan `obj_{nama}_atas.png` berasal dari satu gambar yang dipotong di satu baris. Keduanya digambar di titik yang sama, dengan bagian atas tepat di atas bagian bawah.
- **Bayangan objek:** berupa ubin tumpang lapisan 10 di lembar ubin (usulan 4). Letaknya dihitung `build_peta.py`, jadi antarmuka tidak menggambar bayangan objek sendiri.
- **Lembar ubin:** nomor ubin = baris × 16 + kolom. Ubin lapisan 0 selalu penuh; ubin tumpang berlatar transparan. `kampung.json` (JS-06) memuat nomor ubin per lapisan (tanah, tumpang, bayangan), jadi antarmuka cukup menyalin potongan 16 × 16 dari lembar masa yang aktif. Saat masa berganti, hanya lembar yang ditukar.
- **Siluet pemain:** pemain sendiri di belakang objek atas sebaiknya bergaris ganda (Permintaan C-4).

## Permintaan untuk Sesi A

| Kode | Berkas | Permintaan | Alasan | Status |
|---|---|---|---|---|
| C-1 | `docs/jejak-setara/PRD.md` bagian 15 | Ubah "empat masa (pagi, siang, sore, malam)" menjadi "tiga masa (pagi, siang, sore)" | Design System bagian 4 dan instruksi pemilik proyek memakai tiga masa (usulan 3) | Diajukan (usulan 3a disetujui 6 Nov 2026) |
| C-2 | `docs/jejak-setara/Design_System.md` bagian 4 | Tambahkan: hanya lembar ubin yang berganti per masa; bayangan objek berupa ubin tumpang lapisan 10; objek, tokoh, dan ikon satu berkas untuk semua masa. Tambahkan juga baris bahan baru yang disetujui: tanah setapak (`skin-2`, kerikil `wood`), paving gang (bata `wood`, nat `wood-d`), semen (`mist`, tepi `slate`), dan pinggir aspal (bayangan kerb `dusk`, garis tepi = marka); semuanya tidak berganti per masa | Usulan 4 dan kelompok U (tabel "Bahan per masa" di bagian U) | Diajukan (usulan 4a dan kelompok U disetujui 6 Nov 2026) |
| C-3 | `docs/jejak-setara/Design_System.md` bagian 8 dan `Architecture.md` bagian 9 | Catat warna kunci tas `sun` dan `mango`, tabel delapan pasangan warna, dan penggantian serentak saat memuat | Usulan 5 | Diajukan (usulan 5a disetujui 6 Nov 2026) |
| C-4 | `docs/jejak-setara/Design_System.md` bagian 7 (lapisan 60) | Siluet pemain sendiri bergaris ganda: garis dalam `ink` 1 piksel, lalu garis luar `sun` 1 piksel | Garis `sun` saja 1,0–2,9 : 1 di enam dari tujuh warna atap (percobaan 4); dengan garis ganda salah satu garis selalu ≥ 3 : 1 | Diajukan |
| C-5 | `docs/jejak-setara/Design_System.md` bagian 14 (penamaan) | Tambahkan pola `obj_{nama}_atas.png`, `ikon_ava_{n}.png`, `tanda_debu.png`, dan `tanda_kilau.png`; arah tokoh `bawah`, `atas`, dan `kanan`; tanpa berkas arah kiri | Usulan 6 dan 7 | Diajukan (usulan 6a dan 7a disetujui 6 Nov 2026) |
| C-7 | `docs/jejak-setara/PRD.md` JFR-09, `Design_System.md` bagian 3.2, dan `Architecture.md` bagian 9 dan 11.3 | Ubah ukuran peta menjadi sekitar 160 × 100 ubin (2.560 × 1.600 piksel logis, sekitar 8 × 9 layar). Periksa anggaran peta JSON (≤ 60 KB setelah gzip) dan jumlah potongan 256 × 256 per masa (sekitar 70) | Keputusan pemilik proyek 6 Nov 2026 (bagian "Keputusan ukuran peta") | Diajukan |
| C-8 | `docs/jejak-setara/PRD.md` bagian 8.3 dan 12, `Architecture.md` bagian 13 | Nilai kapasitas sampai 100 pemain per ruang (sekarang 50) dan jumlah kejadian per ronde yang lebih banyak. Peta 160 × 100 menyediakan titik untuk sekitar 48 kejadian. Gagasan untuk dinilai: satu kejadian muncul di dua titik sekaligus agar pemain tidak menumpuk | Pemilik proyek memperkirakan 50–100 pemain dan pertanyaan yang banyak serta bervariasi | Diajukan; perlu keputusan pemilik proyek bersama Sesi A dan Sesi B |
| C-6 | `docs/jejak-setara/Architecture.md` bagian 11.2 | Sepakati bentuk `manifest.ts`: kunci, ukuran dan jumlah bingkai, titik kaki, pasangan bagian atas objek, dan nomor ubin. Usul Sesi C: manifest dibuat otomatis oleh `build_jejak.py` | Usulan 10 | Diajukan (usulan 10a disetujui 6 Nov 2026). Usulan bentuknya ada di bagian "Usulan bentuk manifest"; perlu jawaban sebelum manifest dibuat |
| C-9 | `docs/jejak-setara/Architecture.md` bagian 3, 11.1, 11.1.1, dan 11.3 | Catat berkas kedua `app/jejak-setara/peta/kampung_gambar.json` (daftar nomor ubin yang dipakai, lalu lapisan tanah, tumpang, dan bayangan berisi nomor urut dalam daftar itu, dalam RLE yang sama dan dibaca `uraiRle`); arti lapisan `ubin` di `kampung.json` (kode bahan 0 sampai 7: rumput, tanah, paving, semen, pasir, aspal, air, air dalam); anggaran 60 KB gzip untuk kedua berkas bersama; dan daftar uji peta (12 titik per zona, lebar jalan 2 ubin, keterlihatan penanda) | Bentuk JS-02 hanya memuat nilai 0 sampai 63 dalam satu lapisan, sedangkan lembar ubin berisi 377 nomor dalam tiga lapisan (bagian JS-06, percobaan 1 dan 2) | Diajukan (usulan JS-06 nomor 1a disetujui 8 Nov 2026); rincian bentuk di `specs/JS-06-peta.md` P-20 sampai P-24 |
| C-10 | `docs/jejak-setara/Architecture.md` bagian 7 dan 8.2 (dan spesifikasi JS-03 atau JS-07) | Selama status `lobi`, pemain boleh bergerak di halaman lobi, sel `gerbangLobi` diperlakukan padat oleh server dan layar pemain, dan gerbang digambar `obj_gerbang_tutup`; sesudah ronde dimulai digambar `obj_gerbang_buka`. Posisi awal pemain diambil dari `titikMuncul` | `periksaGerak` JS-02 menolak gerak di luar status `main`, sedangkan JFR-05 meminta pemain bisa berjalan di halaman lobi | Diajukan |
| C-11 | `docs/jejak-setara/Design_System.md` bagian 7 (aturan peta 3) | Ubah menjadi "Dari titik mana pun, sedikitnya satu bangunan atau objek khas zona terlihat di layar", dengan daftar objek khas per zona dari JS-06 | Dengan tabel bangunan penanda saja, hanya 57,4% posisi di prototipe 160 × 100 yang memenuhi (bagian JS-06, percobaan 7) | Diajukan (usulan JS-06 nomor 5a disetujui 8 Nov 2026); daftar objek penanda di `specs/JS-06-peta.md` P-14 |
| C-12 | `docs/jejak-setara/PLAN.md`, tabel status fitur | Ubah baris JS-06 menjadi "Selesai (8 Nov 2026)" dengan tautan `specs/JS-06-peta.md` dan `tests/JS-06-hasil.md` | JS-06 selesai di Sesi C, dan statusnya baru tercatat di berkas ini | Diajukan |

## Usulan bentuk manifest (Permintaan C-6)

`build_jejak.py` menulis `app/jejak-setara/assets/manifest.ts` dari daftar asetnya, hanya untuk aset Disetujui, dengan pola impor seperti manifest Sehari Setara (setiap PNG menjadi URL berkas berhash lewat Vite). Usulan isi untuk kelompok A:

```ts
// Dibuat build_jejak.py. Jangan disunting manual.
import ava1BawahDiam from "./ava/ava_1_bawah_diam.png";
// ... 48 strip dan 8 ikon

export const TOKOH = { lebar: 16, tinggi: 24, kakiX: 8, kakiY: 21 } as const;
export const BINGKAI = { diam: 2, jalan: 4 } as const;
export const AVATAR = {
  1: { bawah: { diam: ava1BawahDiam, jalan: ava1BawahJalan },
       atas: { diam: ava1AtasDiam, jalan: ava1AtasJalan },
       kanan: { diam: ava1KananDiam, jalan: ava1KananJalan }, ikon: ikonAva1 },
  // ... 2 sampai 8
} as const;
export const KUNCI_TAS = { dasar: "#FFD23F", bayangan: "#FF9F1C" } as const;
export const WARNA_TAS = {
  sun: ["#FFD23F", "#FF9F1C"], mango: ["#FF9F1C", "#FF6B5B"], coral: ["#FF6B5B", "#8A5A33"],
  rose: ["#FF8FB8", "#FF6B5B"], berry: ["#9B5DE5", "#4A4F9C"], teal: ["#2EC4B6", "#3BA55C"],
  leaf: ["#8AD95B", "#3BA55C"], "sky-d": ["#3A86D9", "#2B3F8C"],
} as const;
```

Kelompok berikutnya menambah `UBIN`, `OBJEK`, `NPC`, `IKON`, dan `TANDA` dengan pola yang sama. Bila Sesi A membutuhkan bentuk lain (misalnya mengikuti tipe di `inti/tipe.ts`), cukup tulis jawabannya di `PLAN.md`; `build_jejak.py` menyesuaikan.

## Catatan untuk JS-06 (peta)

- JS-06 dimulai 7 November 2026, sesudah pemilik proyek mengabarkan JS-02 selesai. Entri Plan ada di bagian "JS-06 Peta: rencana".
- Ukuran peta 160 × 100 ubin dengan sedikitnya 12 titik kejadian per zona (keputusan 6 November 2026).
- Ukuran objek di bagian O dipakai untuk menata `kampung.txt` dan `objek.json`; kotak tabrakan bangunan mencakup dinding dan bagian bawah atap, sedangkan baris atap paling atas menutupi tanah yang bisa dilewati (lapisan 40).
- Letak ubin tumpang bayangan (usulan 4) dan varian rumput acak berbenih dihitung `build_peta.py`.
- Uji gaya memakai pergeseran bayangan 8 piksel ke kanan dan 4 piksel ke bawah.

## JS-06 Peta: rencana (templat AGENTS 12.1)

Ditulis 8 November 2026 di tahap Plan, sesudah pemilik proyek mengabarkan JS-02 selesai. Disetujui 8 November 2026 dengan balasan `Setuju: JS-06` (semua saran a). Spesifikasinya: [JS-06-peta.md](specs/JS-06-peta.md).

| | |
|---|---|
| Status | **Selesai** (8 Nov 2026): [spesifikasi](specs/JS-06-peta.md) dan [laporan uji](tests/JS-06-hasil.md) Lulus |
| Fitur sebelumnya | JS-02: dinyatakan selesai dan sudah di-push oleh pemilik proyek (7 Nov 2026). `PLAN.md` masih menulis "Diuji"; status itu diubah Sesi A. Di salinan ZIP 7 Nov 2026, `test:jejak` resmi (Vitest 5.0.4) lulus: 7 berkas, 294 uji |
| Memenuhi | JFR-09 (peta tampak atas 160 × 100 ubin dengan 8 zona) dan JFR-12 (bagian peta: lembar ubin per masa); data untuk JFR-05 (halaman lobi dan gerbang), JFR-11 (zona dan halte di peta mini), JFR-15 (titik kejadian per zona), JFR-23 (kotak bantuan per zona), dan JFR-25 (halte, P1); PRD 8.2, 8.3, dan 9; Design System 7 dan 14; Architecture 11.1 |
| Bergantung pada | JS-02 (bentuk `kampung.json` dan pemeriksanya, `bacaPeta`); aset kelompok U dan O1 sampai O4 (Disetujui 6 Nov 2026) |
| Migrasi D1 | Tidak ada |
| Pesan protokol baru atau berubah | Tidak ada. Peta 2.560 × 1.600 piksel masih di bawah batas protokol (8.192 piksel dan 511 ubin) |
| Aset yang dibutuhkan | Semua tersedia dan Disetujui: lembar ubin tiga masa (U), bangunan penanda (O1), pohon, semak, pagar, dan perabot (O2), properti kejadian (O3), varian rumah dan pohon (O4). Tidak ada aset baru. Bila Build ternyata memerlukannya, aset itu diajukan dulu sebagai kelompok baru |
| Dependensi baru | Tidak ada. `build_peta.py` memakai Python 3 dan Pillow seperti kit gambar; uji memakai Vitest dan zod yang sudah terpasang |
| Ukuran | L (backlog menulis M; naik karena peta 160 × 100, berkas gambar kedua, dan pemeriksaan keterlihatan) |

### Berkas yang akan dibuat atau diubah

| Berkas | Status | Isi |
|---|---|---|
| `scripts/jejak-setara/peta/kampung.txt` | Baru | 100 baris × 160 karakter, satu karakter per ubin (bahan tanah, marka, lapangan) |
| `scripts/jejak-setara/peta/objek.json` | Baru | Zona, bangunan, pohon, pagar (ditulis sebagai garis lalu dipecah menjadi ruas), titik kejadian, kotak, halte, gerbang lobi, titik muncul |
| `scripts/jejak-setara/peta/build_peta.py` | Baru | Membangun kedua berkas peta, menjalankan semua pemeriksaan, dan membuat pratinjau. Memakai `atas_ubin.py` dan `atas_objek.py` tanpa mengubahnya |
| `app/jejak-setara/peta/kampung.json` | Baru (hasil bangun) | Bentuk JS-02 persis (usulan 1) |
| `app/jejak-setara/peta/kampung_gambar.json` | Baru (hasil bangun) | Lapisan gambar untuk layar pemain (usulan 1) |
| `app/jejak-setara/__tests__/konten/peta-berkas.test.ts`, `peta-aturan.test.ts` | Baru | Uji usulan 7, dijalankan `content:check:jejak` dan `test:jejak` |
| `docs/jejak-setara/preview/peta_denah.png` | Baru (sekarang) | Denah kasar Plan |
| `docs/jejak-setara/preview/peta_pagi.png`, `peta_siang.png`, `peta_sore.png`, `peta_zona_1.png` sampai `peta_zona_8.png`, `peta_periksa.png`, `peta_hp.png`, `peta_laptop.png` | Baru (Build) | Pratinjau Design System 14 dan peta pemeriksaan |
| `docs/jejak-setara/specs/JS-06-peta.md`, `docs/jejak-setara/tests/JS-06-hasil.md` | Baru (usulan 8a disetujui 8 Nov 2026) | Spesifikasi dan laporan uji |
| `docs/jejak-setara/Daftar_Aset.md` | Diubah | Bagian ini, status, dan permintaan |

Tidak disentuh: kode gambar Sehari Setara, `atas_*.py` dan `build_jejak.py` (kecuali ada aset baru yang disetujui), `app/jejak-setara/inti/`, `package.json`, alur kerja, dan dokumen utama.

### Hasil percobaan risiko

Percobaan dijalankan di luar repositori. Prototipe peta 160 × 100 disusun dari kit yang sudah disetujui tanpa mengubah kit itu, lalu dibaca dengan kode resmi JS-02. Denahnya ada di `preview/peta_denah.png`.

1. **Bentuk JS-02 tidak bisa memuat nomor ubin.** Lapisan `ubin` hanya menerima nilai 0 sampai 63 dalam satu lapisan, sedangkan lembar ubin berisi 377 nomor dan peta perlu tiga lapisan (tanah, tumpang, bayangan). Uji: `kampung.json` yang lapisan `ubin`-nya berisi nomor ubin 338 ditolak `bacaPeta` dengan galat `PETA_CACAT`.
2. **Dua berkas berjalan dengan kode yang sudah ada.** `kampung.json` prototipe (lapisan `ubin` berisi kode bahan 0 sampai 7) lolos `bacaPeta` resmi dalam 33,9 ms. Ketiga lapisan `kampung_gambar.json` diurai `uraiRle` resmi dalam 8,6 ms, karena isinya nomor urut dalam daftar ubin yang dipakai (111 nomor: tanah 78, tumpang 23, bayangan 10; nomor terbesar 338). Isi kedua berkas diurai kembali dan cocok sel demi sel dengan susunan aslinya, termasuk daftar objek dan lapisan tabrakan. Peta lalu digambar ulang hanya dari kedua berkas itu, seperti cara layar pemain, dalam 0,23 detik di Python (potongan halaman lobi ditampilkan di balasan Plan).
3. **Ukuran.** `kampung.json` 66,8 KB (8,3 KB gzip) dan `kampung_gambar.json` 55,6 KB (4,7 KB gzip): jumlah 13,0 KB gzip dari anggaran 60 KB. Varian rumput yang disimpan langsung membuat lapisan tanah 40,7 KB sebelum gzip (1,9 KB sesudah gzip), dibanding 8,1 KB tanpa varian; selisih sesudah gzip hanya 1,1 KB, jadi varian disimpan. Sumber `kampung.txt` 16,1 KB. Prototipe memuat 839 objek dari 59 jenis.
4. **Titik kejadian.** Ke-96 titik (12 per zona) dipilih dengan ruang kosong 3 × 3 dan jarak paling dekat 6,0 ubin. Kapasitas zona dengan aturan yang sama: Z2 24, Z7 32, Z1 35, Z4 36, Z8 37, Z5 39, Z3 41, Z6 58, jumlah 302. Sekolah (Z2) paling sempit karena halaman lobi tidak boleh berisi titik.
5. **Keterjangkauan dan lobi.** Dari titik muncul, 13.672 dari 13.676 sel yang bisa dilewati terjangkau (sisanya kantong tertutup di bawah atap rumah Nara). Semua titik, kotak, dan halte terjangkau. Saat gerbang ditutup, pemain hanya bisa bergerak di 475 sel halaman lobi, dan tidak ada titik, kotak, atau halte di dalamnya.
6. **Lebar jalan.** Pemeriksaan "jalan paling sempit 2 ubin" menemukan 24 sel sempit: 17 di pantai (batang kelapa terlalu dekat dengan laut), 5 di tepi sungai Z6 (pohon dan semak terlalu dekat dengan air), 1 di Z2 (bangku di samping tembok sekolah), dan 1 di sudut tenggara. Semuanya tertangkap otomatis dan diperbaiki di Build. Bahan bertetangga (tanah dan pasir hanya di samping rumput atau air): 0 pelanggaran. Lapangan sekolah 11 × 15 dan lapangan taman 19 × 9 berlebar ganjil.
7. **Bangunan penanda selalu terlihat (Design System 7, aturan 3).** Dengan daftar bangunan penanda di tabel Design System 7, hanya 57,4% posisi yang melihat sedikitnya satu bangunan penanda di layar 320 × 180. Bila rumah warga, kantin, tembok sekolah, rambu, dan pos keamanan ikut dihitung sebagai objek khas zona, angkanya 80,4%. Tempat paling kosong ada di taman Z6 dan kapling Z3 (usulan 5).
8. **Waktu tempuh.** Dari gerbang lobi ke titik terjauh 22,9 detik berjalan; titik terdekat setiap zona 1,5 sampai 11,3 detik. Untuk pembanding, sekolah di tepi barat membuat titik terjauh berjarak 34,5 detik garis lurus, dibanding 21,2 detik dari tengah.
9. **Untuk JS-07 (Sesi A).** Peta ini sekitar 8 × 9 layar dan menjadi 70 potongan 256 × 256 per masa. Bila semua potongan disiapkan sekaligus, perlu sekitar 17,5 MB memori gambar per masa, jadi sebaiknya hanya potongan di sekitar kamera yang disimpan.
10. **Galeri.** `build:pages` sebelum dan sesudah berkas Plan ini ditambahkan: ke-178 berkas `dist-pages/` identik byte.

### Usulan

Setiap usulan berisi saran (a) dan alternatifnya. Kode KT-C11 sampai KT-C19 adalah keputusan terbuka Sesi C untuk JS-06.

1. **Berkas peta (KT-C11).**
   - (a, saran) Dua berkas hasil `build_peta.py`. `kampung.json` tetap persis bentuk JS-02, sehingga lolos `bacaPeta` tanpa perubahan kode Sesi A; lapisan `ubin`-nya berisi kode bahan 0 sampai 7 (rumput, tanah, paving, semen, pasir, aspal, air, air dalam) untuk peta mini dan pemeriksaan. Lapisan gambar ada di `kampung_gambar.json`: daftar nomor ubin yang dipakai, lalu lapisan tanah, tumpang, dan bayangan berisi nomor urut dalam daftar itu (0 berarti kosong), dalam RLE yang sama. Server tidak perlu memuat berkas kedua. JS-06 tidak menunggu Sesi A; dokumennya diajukan lewat Permintaan C-9.
   - (b) Satu berkas: Sesi A mengubah `kampung.json` menjadi versi 2 dengan tiga lapisan gambar bernilai sampai 376. Lebih rapi, tetapi `inti/peta.ts`, `tipe.ts`, dan ujinya berubah, dan Build JS-06 menunggu perubahan itu.
   - (c) Layar pemain menghitung sendiri peralihan ubin, garis lapangan, dan bayangan dari kode bahan. Berkasnya paling kecil, tetapi aturan kit gambar Python harus ditulis ulang di TypeScript dan dijaga tetap sama.
2. **Denah (KT-C12).**
   - (a, saran) Denah di `preview/peta_denah.png`: sekolah dan halaman lobi di tengah, dikelilingi jalan lingkar; laut dan pantai di utara seperti pesisir Buleleng; Z6 di barat laut, Z7 di timur laut, Z1 dan Z5 di barat, Z4 dan Z8 di timur, Z3 (persimpangan, jalan selatan, dan terminal angkot) di depan gerbang. Tepi barat, timur, dan selatan berupa semak rapat dan pohon, sehingga batas peta tampak padat. Semua pemain berangkat dari gerbang yang sama.
   - (b) Sekolah di tepi dengan jalan raya melintang di tengah: lebih mirip kampung memanjang, tetapi jarak ke zona terjauh naik dari sekitar 21 menjadi 35 detik garis lurus.
   - (c) Denah (a) dengan perbaikan yang Anda tulis bebas, misalnya "pasar dekat pantai" atau "balai warga di tengah".
3. **Titik kejadian dan tempat dalam naskah (KT-C13).** Beberapa naskah menyebut tempat khusus (K-11 di tepi sungai dan K-12 di lapangan taman, keduanya Z6), sedangkan penempatan JS-02 bisa menaruh kejadian Z6 di titik Z6 mana pun.
   - (a, saran) Titik umum per zona: setiap titik di satu zona cocok untuk semua kejadian zona itu. Zona ditata rapat sesuai temanya (di Z6 lapangan taman berada di tepi sungai; di Z3 titik berada di tepi jalan dekat zebra cross atau halte; di Z5 titik di sekitar bale), dan tokoh serta properti kejadian digambar layar pemain di ruang 3 × 3. Titik ditulis tangan di `objek.json`, lalu diperiksa otomatis.
   - (b) Titik bertanda jenis tempat (misalnya "sungai" atau "lapangan"), dan kejadian hanya ditempatkan di titik yang cocok. Lebih tepat, tetapi bentuk peta, aturan penempatan JS-02, dan penyunting kejadian di konsol ikut berubah (Sesi A).
   - (c) Titik dipilih otomatis oleh `build_peta.py` dari wilayah calon, seperti di percobaan. Lebih cepat, tetapi letaknya kurang bermakna.
4. **Jumlah titik, kotak, dan halte (KT-C14).**
   - (a, saran) 12 titik per zona (96 titik, keputusan 6 Nov 2026); kotak bantuan 3 per zona dengan isi PRD 8.5 (sepatu di Z3, Z4, dan Z6; kompas di Z1 dan Z5; buku di Z2, Z7, dan Z8), jumlah 24; 4 halte (2 di Z3, 1 di Z7, 1 di Z8). Kotak teropong dan karcis (P1) belum dimasukkan dan ditambahkan bersama JS-18.
   - (b) Sama dengan (a), tetapi kotak P1 dimasukkan sekarang (2 teropong di Z6 dan karcis di setiap halte). Peta tidak perlu dibangun ulang nanti, tetapi JS-09 wajib menyembunyikan kotak yang skillnya belum aktif.
   - (c) 16 titik per zona (128 titik, masih di bawah kapasitas terkecil 24) dan 2 kotak per zona.
5. **Bangunan penanda selalu terlihat (KT-C15).**
   - (a, saran) Aturan 3 dibaca sebagai "bangunan atau objek khas zona", dengan daftar per zona (tabel Design System 7 ditambah rumah warga, kantin, tembok sekolah, rambu, pos keamanan, dan objek sejenis). Pemeriksaan otomatis untuk semua posisi yang terjangkau, sasaran 100%; tempat kosong diisi objek khas zona. Perubahan kalimat Design System diajukan lewat Permintaan C-11.
   - (b) Aturan harfiah: setiap posisi melihat bangunan di tabel Design System 7. Perlu banyak salinan puskesmas, bale, dan warung berwifi, sehingga kampung terasa berulang.
   - (c) Tanpa pemeriksaan otomatis; dinilai dari pratinjau saja.
6. **Lobi dan gerbang (KT-C16).**
   - (a, saran) Halaman lobi semen 28 × 17 ubin di depan gedung SMP, dikelilingi tembok sekolah, dengan gerbang 4 × 2 yang bukaannya 2 ubin; 18 titik muncul; tiang bendera di halaman; tanpa titik, kotak, atau halte di dalam lobi. `kampung.json` mencatat gerbang terbuka. Selama status lobi, server dan layar pemain memperlakukan sel `gerbangLobi` sebagai padat dan menggambar `obj_gerbang_tutup` (Permintaan C-10).
   - (b) Halaman lobi lebih luas, termasuk lapangan sekolah: lebih lega untuk 100 pemain, tetapi Z2 kehilangan sekitar 8 titik dari kapasitasnya yang sudah paling kecil.
7. **Pemeriksaan dan uji (KT-C17).**
   - (a, saran) `build_peta.py` membangun dan memeriksa, lalu membuat peta pemeriksaan yang menandai setiap masalah. Uji Vitest `peta-*.test.ts` memeriksa ulang hasilnya di GitHub: bentuk (`bacaPeta`), keterjangkauan, lobi tertutup, ruang 3 × 3, jarak 6 ubin, 12 titik per zona, titik di dalam zonanya, jenis kotak per zona, lebar jalan 2 ubin, keterlihatan penanda, bahan bertetangga, ukuran gzip, keabsahan berkas gambar, dan sidik sumber (berkas peta gagal diuji bila `kampung.txt` atau `objek.json` berubah tanpa dibangun ulang).
   - (b) Hanya uji Vitest: satu tempat aturan, tetapi masalah baru terlihat sesudah berkas dibangun dan uji dijalankan.
   - (c) Hanya Python: tidak berjalan di GitHub, karena alur kerja tidak memasang Python dan Pillow.
8. **Tempat spesifikasi dan laporan uji (KT-C18).** Batas berkas Sesi C saat ini belum mencakup folder `specs/` dan `tests/`.
   - (a, saran) Izinkan dua berkas baru khusus JS-06: `docs/jejak-setara/specs/JS-06-peta.md` dan `docs/jejak-setara/tests/JS-06-hasil.md`, seperti fitur lain. Tidak bertabrakan dengan sesi lain.
   - (b) Spesifikasi dan laporan ditulis di berkas ini; berkas ini akan bertambah sekitar 400 baris.
9. **Tinjauan visual di tengah Build (KT-C19).**
   - (a, saran) Satu titik tinjau: draf peta penuh tiga masa dan potongan zona dikirim lebih dulu dengan frasa `Setuju: peta`, baru sesudahnya uji dan pratinjau akhir. Perbaikan tata letak lebih murah sebelum uji ditulis.
   - (b) Ditinjau sekali di akhir bersama laporan uji (Gerbang 3).

### Keputusan terbuka yang perlu dijawab

Dijawab 8 November 2026: KT-C11 sampai KT-C19 memakai saran (a), yaitu usulan 1a sampai 9a. KT-04 (warna tambahan khusus peta) tidak diperlukan: peta prototipe memakai 26 warna, semuanya dari palet 36 warna, tanpa piksel semi-transparan.

### Risiko

- **Kerja paralel.** Usulan 1a tidak mengubah berkas Sesi A, tetapi JS-07 perlu membaca berkas kedua. Bila Sesi A memilih 1b, Build JS-06 menunggu perubahan `inti/peta.ts`.
- **Tempat dalam naskah.** Dengan usulan 3a, kejadian yang naskahnya menyebut tempat khusus bisa muncul di titik lain zona yang sama. Dikurangi dengan menata zona rapat sesuai tema.
- **Menyusun 16.000 sel dengan tangan.** Dikurangi dengan bantuan di `build_peta.py`: pagar ditulis sebagai garis, varian rumah dan pohon dipilih berbenih, dan bayangan serta peralihan ubin dihitung otomatis.
- **Lobi.** Pemeriksa gerak JS-02 menolak gerak di luar status `main`, sedangkan JFR-05 meminta pemain bisa berjalan di lobi (Permintaan C-10).
- **Memori HP.** 70 potongan per masa bisa memakan sekitar 17,5 MB bila disiapkan sekaligus (catatan untuk JS-07).
- **Galeri.** Setiap berkas teks baru diperiksa dengan `build:pages` (178 berkas identik byte).

## Yang masih menunggu

| Hal | Menunggu | Keterangan |
|---|---|---|
| JS-06 (peta 160 × 100) | Selesai 8 Nov 2026 | Peta siap dipakai JS-03 (server memuat `kampung.json`) dan JS-07 (layar pemain memuat kedua berkas) |
| Permintaan C-9 sampai C-12 | Sesi A | Dokumen untuk berkas peta kedua, lobi, aturan penanda, dan status JS-06 di `PLAN.md`; C-9 dan C-10 perlu dibaca sebelum JS-03 dan JS-07 memakai peta |
| `manifest.ts` | Jawaban Sesi A atas Permintaan C-6 | Dibuat otomatis oleh `build_jejak.py` untuk semua aset Disetujui |
| Permintaan C-1 sampai C-8 | Sesi A | Termasuk ukuran peta (C-7) dan kapasitas pemain serta jumlah kejadian (C-8) |
| O-42 sanggah | Keputusan KT-10 | Hanya bila versi B K-02 dipilih dan pemilik proyek mengizinkan |
| Efek suara | Keputusan pemilik proyek | Bukan bagian kit gambar Sesi C |

## Cara membalas

- **Perbaikan peta sesudah JS-06** cukup ditulis bebas, misalnya "titik z6-03 pindah ke tepi sungai". Saya mengubah `kampung.txt` atau `objek.json`, menjalankan `peta:build` dan uji peta, lalu menyerahkan ZIP kecil.
- Perbaikan aset tetap bisa diminta kapan saja: tulis ID aset dan perubahannya, misalnya "N-08: rambut Pak Made lebih banyak". Aset yang diubah kembali berstatus Ditinjau sampai disetujui lagi.
