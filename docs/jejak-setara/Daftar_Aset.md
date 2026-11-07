# Daftar Aset — Jejak Setara

| | |
|---|---|
| Versi | 0.3 |
| Diperbarui | 6 November 2026 |
| Tahap saat ini | Kelompok A disetujui. Kelompok U (ubin per masa) diserahkan: menunggu "Setuju: aset U" |
| Dikerjakan | Sesi C (aset dan peta), lihat `PLAN.md` bagian "Pembagian kerja tiga sesi" |
| Acuan | ZIP repositori 6 November 2026 (JS-01 selesai, naskah 16 kejadian disetujui) |
| Cara membuat | Digambar dengan kode di `scripts/game/art/` (berkas `atas_*.py`), mengikuti `Design_System.md` bagian 14 |
| Cara membangun | `npx pnpm@11.25.0 assets:build:jejak` (menjalankan `python scripts/game/art/build_jejak.py`) |
| Berkas yang boleh diubah Sesi C | `scripts/game/art/atas_*.py`, `scripts/game/art/build_jejak.py`, `app/jejak-setara/assets/`, `docs/jejak-setara/Daftar_Aset.md`, `docs/jejak-setara/preview/`. Sesudah kabar "JS-02 selesai": juga `scripts/jejak-setara/peta/` dan `app/jejak-setara/peta/` |

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

## Ringkasan rencana (templat AGENTS 12.1)

| | |
|---|---|
| Status | Disetujui 6 Nov 2026 (semua saran a). Kelompok A Disetujui 6 Nov 2026; kelompok U diserahkan, menunggu "Setuju: aset U" |
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
| 9 | I — Ikon | I-01 sampai I-19 | sekitar 35 | JS-07, JS-09, JS-10, JS-12 | `Setuju: aset I` |

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
| U-01 | Rumput dasar, 4 varian yang dipilih berbenih menurut posisi agar pola tidak berulang | 0 | 4 | Semua | Ditinjau (kelompok U) |
| U-02 | Detail rumput: bunga merah muda, bunga putih, rumput tinggi, daun gugur | 10 | 4 | Semua | Ditinjau (kelompok U) |
| U-03 | Tanah setapak (`skin-2`, kerikil `wood`) dan peralihannya | 0 | 48 | Z1, Z6 | Ditinjau (kelompok U) |
| U-04 | Paving gang (bata `wood`, nat `wood-d`) dan peralihannya | 0 | 48 | Z1 | Ditinjau (kelompok U) |
| U-05 | Aspal dan peralihannya; pinggir jalan berisi bayangan kerb dan garis tepi; garis tengah putus-putus mendatar dan tegak | 0 dan 10 | 48 + 2 | Z3 | Ditinjau (kelompok U) |
| U-06 | Zebra cross mendatar dan tegak | 10 | 2 | Z3 | Ditinjau (kelompok U) |
| U-07 | Trotoar dan kerb: trotoar memakai semen (U-10), kerb menjadi pinggir aspal (U-05) | — | — | Z3, Z4 | Digabung ke U-05 dan U-10 |
| U-08 | Air dan air dalam, masing-masing dengan peralihannya (garis tepi dan buih; air dalam berpola papan catur ke air) | 0 | 48 + 48 | Z6 | Ditinjau (kelompok U) |
| U-09 | Pasir dan peralihannya dengan rumput; tepi air ke pasir digambar oleh ubin air | 0 | 48 | Z6 | Ditinjau (kelompok U) |
| U-10 | Semen (`mist`) untuk halaman sekolah, trotoar, pasar, dan halaman puskesmas, dengan peralihannya | 0 | 48 | Z2, Z3, Z4, Z7 | Ditinjau (kelompok U) |
| U-11 | Lantai pasar memakai semen (U-10); lantai papan bale menjadi bagian objek bale (O-14) | — | — | Z4, Z5 | Digabung ke U-10 dan O-14 |
| U-12 | Garis lapangan: empat sisi, empat sudut, garis tengah mendatar dan tegak, dan pertemuan garis tengah dengan sisi; dipakai di atas rumput (taman) maupun semen (sekolah) | 10 | 14 | Z2, Z6 | Ditinjau (kelompok U) |
| U-13 | Bayangan bangunan: kanan atas, kanan, sudut, bawah kiri, bawah | 10 | 5 | Semua | Ditinjau (kelompok U) |
| U-14 | Bayangan pohon (2 × 2) dan objek kecil (1 × 1) | 10 | 5 | Semua | Ditinjau (kelompok U) |
| U-15 | Detail tanah: batu, kerikil, retakan, genangan | 10 | 4 | Semua | Ditinjau (kelompok U) |


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

**Bahan per masa.** Baris bertanda "usulan" belum ada di Design System bagian 4. Pemetaannya diusulkan bersama pratinjau kelompok U; sesudah disetujui, diajukan ke Sesi A (Permintaan C-2).

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
| Tanah setapak | `skin-2`, kerikil `wood` | sama | sama | Usulan kelompok U, tidak ditukar |
| Paving gang | bata `wood`, nat `wood-d` | sama | sama | Usulan kelompok U, tidak ditukar |
| Semen (halaman, trotoar, lantai pasar) | `mist`, bintik dan tepi `slate` | sama | sama | Usulan kelompok U, tidak ditukar |
| Kerb dan pinggir aspal | bayangan kerb `dusk`, garis tepi = marka | sama | sama | Usulan kelompok U |

## O. Objek dan bangunan

Bangunan dan pohon terdiri atas `obj_{nama}.png` dan `obj_{nama}_atas.png` (usulan 6). Semua tanpa tulisan, logo, merek, lambang instansi, atau lambang palang merah dan bulan sabit merah.

### O1. Bangunan penanda zona

| ID | Berkas | Ukuran (ubin) | Isi | Zona dan kejadian | Status |
|---|---|---|---|---|---|
| O-01 | `obj_rumah_nara` | 4 × 4 | Rumah Nara: atap limasan `coral`, dinding `cream`, jendela bertirai `rose` seperti rumah Nara di Sehari Setara, pagar bambu di depan (O-23) | Z1, K-01 | Belum |
| O-02 | `obj_rumah_a`, `obj_rumah_b` | 4 × 4, 3 × 3 | Rumah warga, dua varian; uji gaya memakai bentuk varian a | Z1 | Ditinjau: varian a (uji gaya) disetujui sebagai acuan 6 Nov; status akhir di kelompok O1 |
| O-03 | `obj_warung_made` | 3 × 3 | Warung Pak Made beratap `coral` dengan etalase jajanan polos | Z1, K-02 | Belum |
| O-04 | `obj_sekolah` | 10 × 6 | Gedung SMP dua lantai, dinding `cream`, atap `sky-d`, tangga ke lantai dua terlihat di depan | Z2, K-04 | Belum |
| O-05 | `obj_kantin` | 4 × 3 | Kantin sekolah beratap `sky-d` | Z2, K-03 | Belum |
| O-06 | `obj_tiang_bendera` | 1 × 3 | Tiang bendera merah putih (`coral` dan `white`, seperti Sehari Setara) | Z2 | Belum |
| O-07 | `obj_gerbang_tutup`, `obj_gerbang_buka` | 4 × 2 | Gerbang halaman lobi di depan sekolah, tertutup dan terbuka | Z2, lobi | Belum |
| O-08 | `obj_halte` | 3 × 2 | Halte beratap `teal` dengan bangku | Z3, K-05, K-06 | Belum |
| O-09 | `obj_angkot` | 3 × 2 | Angkot berhenti | Z3, K-06 | Belum |
| O-10 | `obj_rambu_seberang`, `obj_rambu_halte` | 1 × 2 | Rambu hanya bergambar: penyeberangan dan angkot | Z3 | Belum |
| O-11 | `obj_tenda_a`, `obj_tenda_b` | 3 × 3 | Tenda pasar bergaris `mango` dan `sun`, dua varian | Z4 | Belum |
| O-12 | `obj_los` | 6 × 3 | Los pedagang beratap | Z4, K-07 | Belum |
| O-13 | `obj_gerobak` | 2 × 2 | Gerobak dagangan beroda | Z4, K-14 | Belum |
| O-14 | `obj_bale` | 5 × 4 | Bale kayu terbuka (`wood`) beratap `wood-d` | Z5, K-09, K-10 | Belum |
| O-15 | `obj_pos_ronda` | 3 × 3 | Pos ronda dengan kentongan | Z5 | Belum |
| O-16 | `obj_jembatan_datar`, `obj_jembatan_tegak` | 3 × 2, 2 × 3 | Jembatan kayu di atas sungai (bisa dilewati) | Z6 | Belum |
| O-17 | `obj_kelapa` | batang 1, tajuk 3 × 3 | Pohon kelapa | Z6 | Belum |
| O-18 | `obj_puskesmas` | 6 × 4 | Puskesmas: dinding `white`, atap `teal`, papan bergambar hati `leaf` | Z7, K-13 | Belum |
| O-19 | `obj_kantor_desa` | 6 × 4 | Kantor desa dengan tiang bendera kecil | Z7, K-14 | Belum |
| O-20 | `obj_warung_wifi` | 4 × 3 | Warung beratap `berry` dengan antena, bangku panjang, dan colokan | Z8, K-15, K-16 | Belum |

### O2. Objek umum

| ID | Berkas | Ukuran (ubin) | Isi | Zona dan kejadian | Status |
|---|---|---|---|---|---|
| O-21 | `obj_pohon` | batang 1, tajuk 2 × 2 | Pohon rindang (Design System bagian 7) | Semua | Belum |
| O-22 | `obj_semak` | 1 × 1 | Semak | Semua | Belum |
| O-23 | `obj_pagar_bambu_datar`, `_tegak`, `_sudut` | 1 × 1 | Pagar bambu `wood` | Z1, K-01 | Belum |
| O-24 | `obj_pagar_sekolah_datar`, `_tegak`, `_sudut` | 1 × 1 | Pagar tembok sekolah | Z2 | Belum |
| O-25 | `obj_bangku` | 2 × 1 | Bangku panjang kayu | Z6, Z7, Z8 | Belum |
| O-26 | `obj_tempat_sampah` | 1 × 1 | Tempat sampah | Semua, K-11 | Belum |
| O-27 | `obj_motor` | 2 × 1 | Motor parkir tanpa merek dan pelat | Z3, Z4, K-05 | Belum |
| O-28 | `obj_tiang_lampu` | 1 × 2 | Tiang lampu jalan | Z1, Z3 | Belum |

### O3. Properti kejadian

Diambil dari tabel "Tokoh dan properti per kejadian" di `naskah/NASKAH.md`. Properti yang dipegang tokoh (HP, tali lompat yang sedang dipakai) digambar sebagai pose tokoh di kelompok N.

| ID | Berkas | Ukuran | Isi | Kejadian | Status |
|---|---|---|---|---|---|
| O-29 | `obj_pengeras_suara` | 1 × 1 | Pengeras suara | K-02 | Belum |
| O-30 | `obj_kotak_bekal` | ½ ubin | Kotak bekal | K-03 | Belum |
| O-31 | `obj_kursi_roda` | 1 × 1 | Kursi roda kosong; Raka yang duduk di kursi roda ada di N-17 | K-04 | Belum |
| O-32 | `obj_tiang_kamera` | 1 × 2 | Tiang dengan kamera keamanan kecil | K-07 | Belum |
| O-33 | `obj_lapak` | 2 × 2 | Lapak sayur dan buah | K-07 | Belum |
| O-34 | `obj_dompet` | ½ ubin | Dompet | K-08 | Belum |
| O-35 | `obj_bangku_pasar` | 2 × 1 | Bangku pasar | K-08 | Belum |
| O-36 | `obj_pos_keamanan` | 2 × 2 | Pos keamanan pasar | K-08 | Belum |
| O-37 | `obj_meja_panitia` | 2 × 1 | Meja panitia dengan kertas rencana tanpa tulisan | K-09, K-10 | Belum |
| O-38 | `obj_sisa_piknik` | 2 × 1 | Tikar dan bungkus plastik | K-11 | Belum |
| O-39 | `obj_bola` | ½ ubin | Bola | K-12 | Belum |
| O-40 | `obj_tali_lompat` | 1 × 1 | Tali lompat di tanah | K-12 | Belum |
| O-41 | `obj_bangku_antrean` | 3 × 1 | Bangku antrean | K-13 | Belum |
| O-42 | `obj_sanggah` | — | Sanggah keluarga untuk K-02 versi B | K-02 | Ditunda: hanya bila KT-10 memilih versi B dan pemilik proyek mengizinkan, karena Design System bagian 7 aturan 6 tidak menggambar tempat ibadah sebagai penanda zona |

## T. Penanda dan efek

Berkas `tanda_*.png` disimpan di folder `ikon/`, karena Architecture bagian 3 tidak mempunyai folder `tanda/`; di manifest tetap kelompok `tanda`.

| ID | Berkas | Ukuran | Isi | Status |
|---|---|---|---|---|
| T-01 | `tanda_kejadian.png` | 12 × 12 | Gelembung `sun` bertanda "!" bergaris luar `ink`. Naik-turun 1 piksel dilakukan antarmuka | Belum |
| T-02 | `tanda_dibuka.png` | 12 × 12 | Gelembung `mist` bertanda "…" | Belum |
| T-03 | `tanda_selesai.png` | 10 × 10 | Gelembung kecil `leaf` bertanda ✓ | Belum |
| T-04 | `tanda_kotak_sepatu.png` | 3 × 12 × 10 | Peti `wood` berikon sepatu; strip pop: kecil, besar berkilau, normal | Belum |
| T-05 | `tanda_kotak_kompas.png` | 3 × 12 × 10 | Peti berikon kompas | Belum |
| T-06 | `tanda_kotak_buku.png` | 3 × 12 × 10 | Peti berikon buku | Belum |
| T-07 | `tanda_kotak_teropong.png` | 3 × 12 × 10 | Peti berikon teropong (P1) | Belum |
| T-08 | `tanda_kotak_karcis.png` | 3 × 12 × 10 | Peti berikon karcis (P1) | Belum |
| T-09 | `tanda_kompas.png` | 16 × 7 × 7 | Panah `teal` bergaris luar `ink`: 8 arah × 2 bingkai denyut | Belum |
| T-10 | `tanda_diri.png` | 4 × 7 × 7 | Panah `sun` bergaris luar `ink` untuk peta mini, 4 arah | Belum |
| T-11 | `tanda_debu.png` | 2 × 8 × 6 | Debu lari | Belum |
| T-12 | `tanda_kilau.png` | 2 × 8 × 8 | Kilau kotak | Belum |
| — | Titik pemain di peta kelas | 3 × 3 | Digambar antarmuka dengan warna tas; tanpa berkas | — |

## N. Tokoh bukan pemain

Tampak atas, menghadap bawah, diam 2 bingkai (`npc_{tokoh}_bawah_diam.png`), ditambah pose khusus yang diperlukan kejadian. Ukuran bingkai: siswa dan lansia 16 × 24, dewasa 16 × 26, anak SD 14 × 20 (Design System bagian 8). Ciri tokoh Sehari Setara sama dengan `docs/sehari-setara/Daftar_Aset.md` bagian A.

### N1. Tokoh Sehari Setara

| ID | Tokoh | Ciri | Pose khusus | Kejadian | Status |
|---|---|---|---|---|---|
| N-01 | Nara | Rambut berponi `hair-1`, `skin-2`, seragam, tas `sun` bertali `mango` | — | K-01, K-08 | Belum |
| N-02 | Ibu | `skin-3`, rambut `hair-2` bersanggul, daster `rose` | — | Tidak ada di set peta naskah; Design System bagian 8 | Belum |
| N-03 | Gita | `skin-1`, rambut dikuncir berikat `coral`, kemeja putih, rok `coral` | — | K-01, K-12 | Belum |
| N-04 | Dimas | `skin-4`, rambut cepak, jaket `sky-d` | Di atas motor (`npc_dimas_kanan_motor.png`) | K-02, K-05 | Belum |
| N-05 | Sinta | `skin-3`, kerudung putih, lengan panjang, rok panjang `navy` | — | K-09 | Belum |
| N-06 | Bu Ratih | `skin-4`, rambut bob, kacamata, batik `teal` | — | Disebut di pilihan K-03 dan K-14; Design System bagian 8 | Belum |
| N-07 | Komang | `skin-2`, potongan mangkuk, seragam kebesaran | Menunduk memegang kotak bekal | K-03 (K-15 hanya di dalam video, tidak di peta) | Belum |
| N-08 | Pak Made | `skin-4`, rambut menipis kelabu, kumis, kaus `mango`, sarung kotak-kotak | — | K-02 | Belum |
| N-09 | Bayu | `skin-2`, rambut rapi `hair-2`, kaus `mist`, jin `sky-d`; netral dan ramah | — | K-07 | Belum |

### N2. Warga dan tokoh baru

| ID | Tokoh | Ciri | Pose khusus | Kejadian | Status |
|---|---|---|---|---|---|
| N-10 | Warga dewasa 1–3 | Tiga variasi kulit, rambut, dan baju | Menunjuk sambil bicara, tanpa kekerasan | K-07, K-10 | Belum |
| N-11 | Nenek bertongkat | Lansia sedikit membungkuk | — | K-06 | Belum |
| N-12 | Ibu menggendong bayi | Dewasa menggendong bayi | — | K-13 | Belum |
| N-13 | Anak SD 1–2 | Dua anak SD | Lompat tali (bila diperlukan) | K-12 | Belum |
| N-14 | Pedagang | Pedagang pasar bercelemek | — | K-07 | Belum |
| N-15 | Petugas puskesmas | Berseragam putih dengan tanda hati `leaf`, ramah | — | K-13 | Belum |
| N-16 | Polisi | Seragam cokelat rapi, sikap membantu, tanpa lambang instansi | — | Design System bagian 8 | Belum |
| N-17 | Raka | Teman sekelas pengguna kursi roda; ciri diusulkan di pratinjau N2 | Duduk di kursi roda | K-04 | Belum |
| N-18 | Wayan | Teman sekelas; ciri diusulkan di pratinjau N2 | — | K-14 | Belum |
| N-19 | Siswa umum S1–S4 | Baju bebas, tanpa tas (usulan 9) | Memegang HP; menunduk | K-01, K-08, K-09, K-10, K-11, K-12, K-15, K-16 | Belum |
| N-20 | Siswa umum S5–S6 | Berseragam, tanpa tas (usulan 9) | Memegang HP | K-03, K-04, K-13 | Belum |

## I. Ikon

| ID | Berkas | Ukuran | Isi | Status |
|---|---|---|---|---|
| I-01 | `ikon_lari.png` | 16 × 16 | Sepatu (Lari cepat) | Belum |
| I-02 | `ikon_kompas.png` | 16 × 16 | Kompas (Kompas kejadian) | Belum |
| I-03 | `ikon_petunjuk.png` | 16 × 16 | Buku terbuka (Petunjuk) | Belum |
| I-04 | `ikon_teropong.png` | 16 × 16 | Teropong (P1) | Belum |
| I-05 | `ikon_karcis.png` | 16 × 16 | Karcis angkot (P1) | Belum |
| I-06 sampai I-13 | `ikon_zona_1.png` sampai `ikon_zona_8.png` | 16 × 16 | Ikon zona: rumah, buku, rambu, keranjang, kentongan, pohon kelapa, hati, gelombang sinyal | Belum |
| I-14 | `ikon_mini_kejadian.png`, `ikon_mini_selesai.png`, `ikon_mini_halte.png` | 7 × 7 (usulan) | Peta mini: "!" `sun`, ✓ `leaf`, dan halte `teal` (P1); ukuran dipastikan bersama JS-07 | Belum |
| I-15 | `ikon_menyambung.png` | 2 × 16 × 16 | Jam berputar untuk layar menyambung ulang | Belum |
| I-16 | `ikon_putar_hp.png` | 32 × 32 | Ajakan memutar HP ke posisi mendatar | Belum |
| I-17 | `ikon_jejak.png` | 32 × 32 | Ikon tab halaman pemain dan konsol | Belum |
| I-18 | Ikon status konsol | 16 × 16 | Arsip, rujukan belum diverifikasi, terverifikasi | Belum |
| I-19 | Ikon Sehari Setara yang dipakai ulang | 16 × 16 dan 8 × 8 | Bintang (3 bingkai), jam, suara nyala dan mati, layar penuh, matahari, bulan, dan empat ikon emosi; dibangun ulang tanpa perubahan dari `ikon.py` dengan nama Jejak Setara (misalnya `ikon_bintang.png`, `ikon_emosi_hati.png`) | Belum (dipakai ulang) |

Daftar akhir I-15 sampai I-18 mengikuti spesifikasi JS-07 sampai JS-12.

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
| C-2 | `docs/jejak-setara/Design_System.md` bagian 4 | Tambahkan: hanya lembar ubin yang berganti per masa; bayangan objek berupa ubin tumpang lapisan 10; objek, tokoh, dan ikon satu berkas untuk semua masa. Bahan baru (tanah, paving, lantai) menyusul sesudah kelompok U disetujui | Usulan 4 | Diajukan (usulan 4a disetujui 6 Nov 2026) |
| C-3 | `docs/jejak-setara/Design_System.md` bagian 8 dan `Architecture.md` bagian 9 | Catat warna kunci tas `sun` dan `mango`, tabel delapan pasangan warna, dan penggantian serentak saat memuat | Usulan 5 | Diajukan (usulan 5a disetujui 6 Nov 2026) |
| C-4 | `docs/jejak-setara/Design_System.md` bagian 7 (lapisan 60) | Siluet pemain sendiri bergaris ganda: garis dalam `ink` 1 piksel, lalu garis luar `sun` 1 piksel | Garis `sun` saja 1,0–2,9 : 1 di enam dari tujuh warna atap (percobaan 4); dengan garis ganda salah satu garis selalu ≥ 3 : 1 | Diajukan |
| C-5 | `docs/jejak-setara/Design_System.md` bagian 14 (penamaan) | Tambahkan pola `obj_{nama}_atas.png`, `ikon_ava_{n}.png`, `tanda_debu.png`, dan `tanda_kilau.png`; arah tokoh `bawah`, `atas`, dan `kanan`; tanpa berkas arah kiri | Usulan 6 dan 7 | Diajukan (usulan 6a dan 7a disetujui 6 Nov 2026) |
| C-6 | `docs/jejak-setara/Architecture.md` bagian 11.2 | Sepakati bentuk `manifest.ts`: kunci, ukuran dan jumlah bingkai, titik kaki, pasangan bagian atas objek, dan nomor ubin. Usul Sesi C: manifest dibuat otomatis oleh `build_jejak.py` | Usulan 10 | Diajukan (usulan 10a disetujui 6 Nov 2026). Usulan bentuknya ada di bagian "Usulan bentuk manifest"; perlu jawaban sebelum manifest dibuat |

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

- JS-06 dimulai sesudah pemilik proyek mengabarkan "JS-02 selesai". Entri Plan JS-06 (templat 12.1) ditulis di berkas ini pada saat itu.
- Ukuran objek di bagian O dipakai untuk menata `kampung.txt` dan `objek.json`; kotak tabrakan bangunan mencakup dinding dan bagian bawah atap, sedangkan baris atap paling atas menutupi tanah yang bisa dilewati (lapisan 40).
- Letak ubin tumpang bayangan (usulan 4) dan varian rumput acak berbenih dihitung `build_peta.py`.
- Uji gaya memakai pergeseran bayangan 8 piksel ke kanan dan 4 piksel ke bawah.

## Cara membalas

- **"Setuju: aset U"** berarti ketiga lembar ubin dan pemetaan bahan barunya disetujui. Statusnya menjadi Disetujui, kreditnya ditambahkan, pemetaan bahan diajukan ke Sesi A (Permintaan C-2), dan saya lanjut ke kelompok O1 (bangunan penanda zona).
- Perbaikan cukup ditulis bebas per bahan, misalnya "tanah terlalu terang" atau "air sore terlalu jingga". Bahan lain yang tidak disebut tetap seperti sekarang.
