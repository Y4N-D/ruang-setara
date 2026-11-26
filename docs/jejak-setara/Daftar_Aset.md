# Daftar Aset — Jejak Setara

| | |
|---|---|
| Versi | 1.6 |
| Diperbarui | 26 November 2026 |
| Tahap saat ini | Penutup PC-1 dan PC-2 (26 November 2026, bagian "Gambar medan peta dan kotak P1"): pemilik proyek membalas `Setuju: G-01 sampai G-03, letak kotak`, jadi gambar medan G-01 sampai G-03 dan letak tujuh kotak P1 Disetujui. G-01 sampai G-03 masuk `CREDITS.md` dan kelompok `PETA` di `manifest.ts` lewat `PC-1-penutup.zip`; sesudah ZIP itu di-commit, syarat PC-1 untuk JS-23 terpenuhi (JS-23 juga menunggu JS-21 Selesai). Letak kotak tetap di `PC-2-kotak.zip`, yang disimpan untuk Build JS-18 (KT-C34 a). Permintaan C-19 dan C-20 diajukan. Permintaan C-14, C-15, C-16, dan C-18 sudah Diterapkan Sesi A (Plan JS-13 dan Gerbang 1 JS-15). Sebelumnya, aset tambahan selesai (22 November 2026, bagian "Aset tambahan untuk naskah tambahan"): prasasti O-52 untuk K-32, serta kandang kukang O-53 dan penjual N-21 untuk K-33 Disetujui dan tercatat di `CREDITS.md` dan `manifest.ts`, sehingga ada 243 aset gambar Disetujui. Commit penutupnya (409ceab) masuk tanpa kunci A-17, sehingga "Jejak: uji" #105 gagal. Perbaikan 23 November 2026 menambah ketiga kunci di `kunci-aset.ts` atas permintaan pemilik proyek (C-17 dan A-17 selesai). Efek suara selesai 21 November 2026 (bagian "Efek suara"): S-01 sampai S-08 dan musik latar M-01 Disetujui dan tercatat di `CREDITS.md`; S-01 sampai S-08 serta salinan klik dan bunyi teks ada di kelompok `SUARA` di `manifest.ts`. Permintaan C-1 sampai C-18 sudah diterapkan atau selesai. Semua 239 aset gambar dalam rencana Disetujui (6 November 2026); `manifest.ts` (C-6) dan JS-06 selesai 8 November 2026 |
| Dikerjakan | Sesi C (aset dan peta), lihat `PLAN.md` bagian "Pembagian kerja tiga sesi". Efek suara dikerjakan Sesi C atas permintaan pemilik proyek, 21 November 2026 |
| Acuan | ZIP `main` yang dilampirkan pemilik proyek 25 November 2026, sesudah rilis v1.0 dan Gerbang 1 rencana v1.1, ditambah isi `PC-1-2-plan.zip` dan `PC-1-gambar.zip` yang sudah di-commit |
| Cara membuat | Gambar: digambar dengan kode di `scripts/game/art/` (berkas `atas_*.py`), mengikuti `Design_System.md` bagian 14. Efek suara: dibuat dengan kode di `scripts/game/suara/` (`chip.py` dan `efek.py`), hanya dengan pustaka bawaan Python |
| Cara membangun | `npx pnpm@11.25.0 assets:build:jejak` (menjalankan `python scripts/game/art/build_jejak.py`), yang membangun gambar dan efek suara sekaligus |
| Berkas yang boleh diubah Sesi C | `scripts/game/art/atas_*.py`, `scripts/game/art/build_jejak.py`, `app/jejak-setara/assets/`, `docs/jejak-setara/Daftar_Aset.md`, `docs/jejak-setara/preview/`. Sesudah kabar "JS-02 selesai": juga `scripts/jejak-setara/peta/`, `app/jejak-setara/peta/`, dan uji berawalan `peta-` di `app/jejak-setara/__tests__/konten/` (izin 7 Nov 2026), serta `docs/jejak-setara/specs/JS-06-peta.md` dan `docs/jejak-setara/tests/JS-06-hasil.md` (usulan JS-06 nomor 8a, 8 Nov 2026). Untuk `manifest.ts`: uji berawalan `aset-` di `app/jejak-setara/__tests__/konten/` (izin 8 Nov 2026). Untuk efek suara (izin 21 Nov 2026): juga `scripts/game/suara/` (baru), bersama `build_jejak.py`, `app/jejak-setara/assets/` (termasuk `sfx/`, `manifest.ts`, dan `CREDITS.md`), berkas ini, dan `docs/jejak-setara/preview/`; serta `app/jejak-setara/__tests__/konten/aset-manifest.test.ts` untuk kelompok `SUARA` (usulan KT-C24 a, 21 Nov 2026). Untuk aset tambahan (22 Nov 2026): `scripts/game/art/atas_*.py` (termasuk `atas_tambahan.py` yang baru), `build_jejak.py`, `app/jejak-setara/assets/`, berkas ini, dan `docs/jejak-setara/preview/`, tanpa mengubah aset Sehari Setara. Kunci di `kunci-aset.ts` lewat Permintaan A-17 Sesi A, sedangkan `CREDITS.md` dan `manifest.ts` ditulis `build_jejak.py` di giliran penutup; keduanya di-commit bersama (KT-C31 a). Perbaikan 23 Nov 2026: juga `app/jejak-setara/inti/konten/kunci-aset.ts`, satu kali, atas permintaan pemilik proyek sesudah "Jejak: uji" #105 gagal. Untuk PC-1 dan PC-2 (25 Nov 2026): `scripts/game/art/` (`atas_*.py` dan `build_jejak.py`), `scripts/jejak-setara/peta/`, `app/jejak-setara/peta/`, `app/jejak-setara/assets/` (folder baru `peta/`, `manifest.ts`, dan `CREDITS.md`), berkas ini, dan `docs/jejak-setara/preview/`, tanpa mengubah aset atau peta Sehari Setara; perubahan di luar itu ditulis sebagai Permintaan untuk Sesi A. KT-C33 a (25 Nov 2026): juga `peta-medan.test.ts` (baru), `peta-aturan.test.ts`, dan `aset-manifest.test.ts` di `app/jejak-setara/__tests__/konten/`, serta bagian "Perubahan sesudah JS-06" di `docs/jejak-setara/specs/JS-06-peta.md` |

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
| 8 Nov 2026 | Build manifest (C-6) | `build_jejak.py` kini juga menulis `app/jejak-setara/assets/manifest.ts` dengan bentuk Architecture 11.2 (usulan 11a JS-07): 239 aset Disetujui. Uji baru `aset-manifest.test.ts` (16 uji) lulus dengan penjalan pengganti, dan 16 salinan rusak ditolak (bagian "Manifest aset"). Status C-1 sampai C-12 diperbarui sesuai tanggapan Sesi A di `PLAN.md`; C-8 ternyata baru diterapkan sebagian, dan Permintaan C-13 diajukan |
| 21 Nov 2026 | Plan efek suara | Atas permintaan pemilik proyek, Sesi C merencanakan delapan efek suara Design System 12 untuk JS-14. Percobaan di luar repositori: kit suara dengan pustaka bawaan Python, contoh `sfx_tepat` (lulus pemeriksaan), ukuran berkas, dan keras-pelan dibanding klik dan bunyi teks Sehari Setara. Entri Plan dan usulan KT-C20 sampai KT-C26 ditulis di bagian "Efek suara"; contoh `sfx_tepat.wav` dan berkas banding dikirim di balasan, tidak di repositori. Status C-13 dan C-8 diubah menjadi Diterapkan sesuai tanggapan Sesi A di `PLAN.md`; C-14 dan C-15 disiapkan. Menunggu `Setuju: suara` |
| 21 Nov 2026 | Plan efek suara | Pemilik proyek membalas `Setuju: suara`: semua saran (a) diterima (usulan 1a sampai 7a, KT-C20 sampai KT-C26). Permintaan C-14 dan C-15 diajukan |
| 21 Nov 2026 | Efek suara giliran 1 | Kit suara `scripts/game/suara/` (`chip.py` dan `efek.py`) dibuat dan dipanggil `build_jejak.py`. S-01 sampai S-07 diserahkan, menunggu persetujuan per efek: semua lulus pemeriksaan dan berada dalam 1 LU dari sasaran keras terdengar. `CREDITS.md` dan `manifest.ts` belum berubah, karena hanya memuat efek Disetujui |
| 21 Nov 2026 | Efek suara giliran 1 | Pemilik proyek membalas `Setuju: S-01 sampai S-07`: ketujuh efek Disetujui. Pemilik proyek juga meminta contoh musik latar dibuat sekarang, bersama giliran 2 (KT-C26 a) |
| 21 Nov 2026 | Efek suara giliran 2 | S-01 sampai S-07, serta salinan klik dan bunyi teks, masuk `CREDITS.md` dan kelompok `SUARA` di `manifest.ts` (9 efek); `aset-manifest.test.ts` diperluas (4 uji baru; 6 salinan rusak ditolak). S-08 dan M-01 (`musik.py` baru) diserahkan, Ditinjau. `content:check:jejak` 258 uji, `test:jejak` 1.009 uji, dan `build:jejak` lulus; galeri 178 berkas identik |
| 21 Nov 2026 | Efek suara giliran 2 | Pemilik proyek membalas `Setuju: S-08, M-01`: jingle akhir dan musik latar Disetujui |
| 21 Nov 2026 | Penutup efek suara | S-08 dan M-01 masuk `CREDITS.md`; S-08 masuk `SUARA` (10 bunyi), sedangkan musik latar tidak, karena diimpor langsung oleh layar kelas. `aset-manifest.test.ts` memeriksa musik latar (1 uji baru; 3 salinan rusak ditolak). `content:check:jejak` 259 uji, `test:jejak` 1.010 uji, dan `build:jejak` lulus; galeri 178 berkas identik. Permintaan C-16 diajukan |
| 22 Nov 2026 | Plan aset tambahan | Atas permintaan pemilik proyek, Sesi C merencanakan aset baru untuk naskah tambahan: prasasti (K-32), serta kukang dalam kandang dan penjualnya (K-33), sesuai usulan 7a Plan naskah tambahan (KT-B14), ditambah pedagang kedua (K-26) yang disarankan. Percobaan di luar repositori: kit dibangun ulang (sama piksel), prototipe lima berkas (lulus pemeriksaan), dan simulasi uji kunci, kredit, dan manifest di salinan terpisah. Ditemukan bahwa permintaan pedagang kedua sudah dicabut 22 Nov 2026 di `naskah/STATUS.md` (usulan 4). Entri Plan, usulan KT-C27 sampai KT-C31, dan lembar uji gaya `preview/uji_gaya_tambahan.png` diserahkan; Permintaan C-17 disiapkan. Menunggu `Setuju: aset tambahan` |
| 22 Nov 2026 | Plan aset tambahan | Pemilik proyek membalas `Setuju: aset tambahan`: semua saran (a) diterima (KT-C27 sampai KT-C31). Pedagang kedua (N-22) tidak dibuat, dan Permintaan C-17 diajukan |
| 22 Nov 2026 | Aset tambahan, giliran gambar | Kode dipindah dari prototipe ke kit: `atas_tambahan.py` (baru, O-52 dan O-53), `atas_tokoh.py` (N-21), dan `build_jejak.py`. Empat PNG baru (1.834 B) sama byte dengan prototipe lembar uji gaya; pratinjau `tambahan_lembar.png` dan `tambahan_set.png` dibuat, dan `uji_gaya_tambahan.png` kini dibangun `build_jejak.py` dengan hasil sama byte. Perubahan dari rencana: O-52 dan O-53 tidak ditulis di `atas_objek.py`, karena berkas itu termasuk sidik sumber peta. Aset lama, `CREDITS.md`, `manifest.ts`, dan peta tidak berubah. `content:check:jejak` 259 uji, `test:jejak` 1.172 uji, dan `build:jejak` lulus; galeri 178 berkas identik. Permintaan C-18 diajukan. Menunggu `Setuju: O-52, O-53, N-21` |
| 22 Nov 2026 | Aset tambahan, giliran gambar | Pemilik proyek membalas `Setuju: O-52, O-53, N-21`: ketiga aset Disetujui |
| 22 Nov 2026 | Penutup aset tambahan | `DISETUJUI_TAMBAHAN` di `build_jejak.py` diisi. `CREDITS.md` mendapat 4 baris (254 aset), dan `manifest.ts` memuat 243 gambar (`OBJEK` 71, `NPC` 34); tabel O5 dan N3 ditambahkan. `content:check:jejak` 259 uji dan `build:jejak` lulus, dan keempat PNG menjadi berkas berhash. `test:jejak` 1.171 dari 1.172 uji lulus: satu-satunya yang gagal, `aturan-bank`, lulus begitu tiga kunci A-17 masuk (dicoba di salinan terpisah: 1.172 uji). Galeri 178 berkas identik. ZIP penutup di-commit bersama ZIP A-17 (C-17) |
| 23 Nov 2026 | Perbaikan uji aset tambahan | Commit 409ceab hanya berisi enam berkas ZIP penutup, tanpa `kunci-aset.ts` dari A-17, sehingga "Jejak: uji" #105 gagal di langkah "Uji Jejak": uji `aturan-bank` ("daftar kunci aset server sama dengan berkas aset dan kredit Disetujui") gagal, 1.171 dari 1.172 uji lulus. Atas permintaan pemilik proyek, Sesi C menambah `npc_penjual_bawah_diam`, `obj_kandang_kukang`, dan `obj_prasasti` ke `kunci-aset.ts` (berkas Sesi A), jadi A-17 dan C-17 selesai. Diperiksa di salinan repositori 409ceab: `content:check:jejak` 259 uji, `test:jejak` 1.172 uji, `test:jejak:server` 65 uji, dan `build:jejak` lulus; galeri 178 berkas identik |
| 25 Nov 2026 | Plan PC-1 dan PC-2 | Atas Permintaan PC-1 dan PC-2 rencana v1.1 di `PLAN.md` (final sesudah Gerbang 1, 25 Nov 2026), Sesi C merencanakan tiga gambar medan dan tujuh kotak P1. Percobaan di luar repositori: dua cara mengecilkan, keterbacaan jalan, ukuran, letak kotak di peta sementara, dan uji yang terpengaruh (bagian "Gambar medan peta dan kotak P1"). Usulan KT-C32 sampai KT-C34 ditulis, Permintaan C-19 dan C-20 disiapkan, dan pratinjau awal `peta_medan_2.png` dikirim di balasan (tidak disimpan di repositori). Status C-14, C-15, C-16, dan C-18 diubah menjadi Diterapkan sesuai tanggapan Sesi A di `PLAN.md`. Menunggu `Setuju: PC-1 dan PC-2` |
| 25 Nov 2026 | Plan PC-1 dan PC-2 | Pemilik proyek membalas `Setuju: PC-1 dan PC-2`: semua saran (a) diterima (KT-C32 sampai KT-C34). Batas berkas Sesi C bertambah dengan tiga uji dan catatan spesifikasi JS-06 (KT-C33 a) |
| 26 Nov 2026 | Giliran gambar dan letak | `build_peta.py` kini juga membangun G-01 sampai G-03 (1,8 KB, 4,0 KB, dan 9,9 KB; bertiga 15,6 KB) dan pratinjau `peta_medan.png`; `build_jejak.py` memeriksanya; uji baru `peta-medan.test.ts`. Tujuh kotak P1 ditambahkan dengan aturan baru di `build_peta.py` dan `peta-aturan.test.ts`. Semua uji lulus di keadaan PC-1; di keadaan PC-2 hanya `skill-ruang` (Sesi A, C-19) yang gagal, sesuai rencana. Diserahkan sebagai `PC-1-gambar.zip` (di-commit) dan `PC-2-kotak.zip` (disimpan untuk Build JS-18); menunggu `Setuju: G-01 sampai G-03, letak kotak` |
| 26 Nov 2026 | Giliran gambar dan letak | Pemilik proyek membalas `Setuju: G-01 sampai G-03, letak kotak`: ketiga gambar medan dan letak tujuh kotak P1 Disetujui |
| 26 Nov 2026 | Penutup PC-1 | `DISETUJUI_PETA` di `build_jejak.py` diisi. `CREDITS.md` mendapat bagian "Gambar medan peta" (3 baris, kini 257 aset), dan `manifest.ts` memuat kelompok `PETA` (`medan1`, `medan2`, dan `medan4`; kini 246 gambar). `aset-manifest.test.ts` memeriksa folder `peta/` dan `PETA` (1 uji baru; 6 salinan rusak ditolak). `content:check:jejak` 393 uji, `test:jejak` 1.384 uji, `test:jejak:server` 70 uji, `tsc`, ESLint, dan `build:jejak` lulus; galeri 178 berkas identik. Permintaan C-19 dan C-20 diajukan. `PC-2-kotak.zip` tetap disimpan untuk Build JS-18 dan tidak perlu dibangun ulang |

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

Status 6 November 2026: semua kelompok Disetujui. Aset tambahan untuk naskah tambahan (O5 dan N3) Disetujui 22 November 2026.

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
| O5 dan N3 (22 Nov 2026) | Aset tambahan untuk naskah tambahan | 4 | 1,8 KB |
| **Jumlah** | | **243** | **102,1 KB** |

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
| Kredit dan manifest | `CREDITS.md` dibuat otomatis sesudah "Setuju: aset A" (56 aset). `manifest.ts` dibuat otomatis 8 Nov 2026 (bagian "Manifest aset") |

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

Properti untuk naskah tambahan, yaitu prasasti (O-52) dan kandang kukang (O-53), Disetujui 22 Nov 2026 dan tercatat di O5 di bawah. Kodenya di `atas_tambahan.py`, bukan di `atas_objek.py`; alasannya ada di bagian "Aset tambahan untuk naskah tambahan".

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

### O5. Properti naskah tambahan

Properti set tokoh untuk naskah tambahan, digambar di `atas_tambahan.py`. Rencana, pemeriksaan, dan penutupnya ada di bagian "Aset tambahan untuk naskah tambahan".

| ID | Berkas | Ukuran (ubin) | Isi | Kejadian | Status |
|---|---|---|---|---|---|
| O-52 | `obj_prasasti`, `obj_prasasti_atas` | 2 × 2 | Prasasti tua dari batu alam bertulisan samar tanpa huruf dan berlumut, dengan papan keterangan cagar budaya bergaris tanpa huruf; tanpa tanda keagamaan. Padat di baris ubin bawah; puncak batu dan papan di lapisan atas | K-32 | Disetujui (22 Nov) |
| O-53 | `obj_kandang_kukang` | 1 × 1 | Kandang kawat kecil beralas papan; kukang duduk tenang memeluk dahan, mata besar terbuka, tanpa luka dan tanpa warna merah | K-33 | Disetujui (22 Nov) |

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

Penjual kukang (N-21) untuk naskah tambahan Disetujui 22 Nov 2026 dan tercatat di N3 di bawah. Pedagang kedua (N-22) tidak dibuat (KT-C30 a).

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

### N3. Tokoh naskah tambahan

Tokoh set kejadian untuk naskah tambahan, digambar di `atas_tokoh.py` (`NPC3`). Rencana, pemeriksaan, dan penutupnya ada di bagian "Aset tambahan untuk naskah tambahan".

| ID | Tokoh | Berkas | Ciri | Kejadian | Status |
|---|---|---|---|---|---|
| N-21 | Penjual kukang | `npc_penjual_bawah_diam` (16 × 26) | Warga dewasa yang tampak biasa dan ramah: `skin-2`, topi bundar `sky-d`, kaus `teal`, celana `dusk`, sandal, dan tas selempang cokelat (bukan tas punggung); diam menghadap bawah | K-33 | Disetujui (22 Nov) |

- Titik kaki (8, 23), sama dengan tokoh dewasa lain. Badan, kaki, dan kepalanya memakai bagian kelompok N2; yang baru hanya topi bundar dan tas selempang.
- Pedagang kedua (N-22) tidak dibuat (KT-C30 a). Cirinya hanya tercatat di `NPC3` untuk membangun ulang lembar uji gaya, tanpa pose dan tanpa PNG.

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

Delapan efek suara Design System bagian 12, ditambah contoh musik latar layar kelas (M-01, P1), dibuat dengan kode (bukan dengan kit gambar) dan disimpan di `app/jejak-setara/assets/sfx/`. Rencana dan usulannya ada di bawah tabel. Untuk efek suara, pratinjaunya adalah berkas WAV yang dilampirkan di balasan. Setiap efek berstatus Ditinjau sampai pemilik proyek mendengarnya dan membalas, lalu menjadi Disetujui.

| ID | Berkas | Peristiwa | Karakter (Design System 12) | Isi | Lama | Status |
|---|---|---|---|---|---|---|
| S-01 | `sfx_kejadian.wav` | Kejadian pertama kali terlihat | Dua nada naik pendek | "Pip-ting": segitiga, G5 lalu C6 dengan jeda kecil, ditemani sedikit pulsa 25% agar jelas di speaker HP | 0,262 detik | Disetujui (21 Nov) |
| S-02 | `sfx_kotak.wav` | Ambil kotak | Denting naik | "Tring": pulsa 25% meluncur cepat dari A5 ke E6 lalu berdering, dengan segitiga satu oktaf di bawah dan kilau pulsa 12,5% di B6 | 0,362 detik | Disetujui (21 Nov) |
| S-03 | `sfx_skill.wav` | Skill aktif | Desir pendek | "Wus": desis yang makin terang, ditemani segitiga yang meluncur naik dari E4 ke E5 | 0,352 detik | Disetujui (21 Nov) |
| S-04 | `sfx_tepat.wav` | Jawaban tepat | Arpeggio ceria | C5, E5, G5, lalu C6, 70 ms per nada: pulsa 25% ditemani segitiga satu oktaf di bawah; nada terakhir berdering dengan getar halus | 0,552 detik | Disetujui (21 Nov) |
| S-05 | `sfx_lembut.wav` | Kurang tepat atau berisiko | Nada rendah lembut, tidak mengagetkan | Dua nada turun pelan seperti "hmm": segitiga G4 lalu E4 dengan awal lembut, ditemani sedikit pulsa 50% yang disaring rendah agar terdengar di speaker HP; tanpa dengung atau nada turun bertangga | 0,462 detik | Disetujui (21 Nov) |
| S-06 | `sfx_hitung.wav` | Hitung mundur (3, 2, 1) | Tik per angka | Tik bersih: pulsa 50% di C6 yang tetap, berbeda dari klik yang berpulsa 25% dan nadanya turun | 0,062 detik | Disetujui (21 Nov) |
| S-07 | `sfx_peringatan.wav` | Dua menit terakhir | Dua tik pelan | Dua tik tenang: segitiga, E5 dua kali, berjarak 0,22 detik | 0,302 detik | Disetujui (21 Nov) |
| S-08 | `sfx_akhir.wav` | Akhir ronde (layar kelas) | Jingle 3–4 detik | Jingle hangat bernuansa malam: melodi pulsa 25% naik G4–C5–E5–G5, turun F5–E5–D5, lalu berhenti di C5 dengan getar halus (kadens IV–V–I); suara kedua pulsa 12,5%, bas segitiga C–F–G–C, desis halus di ketukan, dan dua kerlip tinggi di akhir seperti bintang malam | 3,262 detik | Disetujui (21 Nov) |
| M-01 | `musik_kelas.wav` | Musik latar layar kelas (P1, JS-21) | Musik latar chiptune berulang | Lagu tenang 16 birama dalam C mayor pentatonik, 100 ketukan per menit, berulang mulus: melodi pulsa 25% lembut, bas segitiga, dan ketukan desis halus; 11.025 Hz | 38,4 detik | Disetujui (21 Nov) |
| — | `sfx_klik.wav`, `sfx_teks.wav` | Tekanan yang diterima; teks muncul per huruf | Dipakai ulang dari Sehari Setara tanpa perubahan | Disalin identik byte ke `sfx/` oleh `build_jejak.py` (KT-C25 a) | 45 ms, 32 ms | Disetujui (salinan identik; dipilih dan disetujui YAN 26 Okt 2026 di Sehari Setara) |

- Semua nada memakai tangga nada C mayor, seperti klik (sekitar E6) dan bunyi teks (sekitar C5), tanpa nada sumbang.
- Bunyi jawaban kurang tepat sengaja tidak memakai dengung rendah, desis keras, atau nada turun bertangga yang biasa menandai "gagal", agar tidak mempermalukan pemain di kelas.

### Rincian giliran 1 (21 November 2026)

| | |
|---|---|
| Kode | `scripts/game/suara/chip.py` (alat: gelombang, selubung, saringan, penulis WAV, pengukur keras, dan pemeriksaan) dan `scripts/game/suara/efek.py` (resep S-01 sampai S-07 dan daftar `EFEK`). `build_jejak.py` memanggil keduanya |
| Berkas | Tujuh WAV di `app/jejak-setara/assets/sfx/`, jumlah 104.120 byte (101,7 KB) |
| Pemeriksaan `build_jejak.py` | Lulus: WAV PCM mono 16 bit 22.050 Hz dengan kepala 44 byte, paling lama 0,65 detik, paling besar 30 KB, puncak sesuai daftar, sampel pertama dan terakhir 0, tanpa geser DC, tanpa terpotong, dan keras terdengar dalam 1 LU dari sasaran. Dibangun dua kali dengan hasil sama byte. `CREDITS.md` dan `manifest.ts` hasil bangun sama byte dengan yang ada |
| Ukuran seluruh aset | 201,9 KB (gambar dan suara), anggaran 2 MB |

| ID | Berkas | Lama | Ukuran | Puncak | Keras terdengar (sasaran) |
|---|---|---|---|---|---|
| S-01 | `sfx_kejadian.wav` | 0,262 detik | 11.598 B | −5,5 dBFS | −17,9 LUFS (−18) |
| S-02 | `sfx_kotak.wav` | 0,362 detik | 16.008 B | −3,0 dBFS | −18,6 LUFS (−18) |
| S-03 | `sfx_skill.wav` | 0,352 detik | 15.568 B | −6,0 dBFS | −18,2 LUFS (−18) |
| S-04 | `sfx_tepat.wav` | 0,552 detik | 24.388 B | −7,5 dBFS | −18,0 LUFS (−18) |
| S-05 | `sfx_lembut.wav` | 0,462 detik | 20.418 B | −11,5 dBFS | −21,0 LUFS (−21) |
| S-06 | `sfx_hitung.wav` | 0,062 detik | 2.778 B | −4,0 dBFS | −21,2 LUFS (−21) |
| S-07 | `sfx_peringatan.wav` | 0,302 detik | 13.362 B | −7,5 dBFS | −22,8 LUFS (−23) |

- S-04 memakai resep contoh Plan dengan puncak −7,5 dBFS (KT-C23 a), jadi bunyinya sama dengan versi seimbang di berkas banding Plan. Selisih sampel paling besar 2 dari 32.767 dan tidak terdengar: tabel puncak kini dihitung dengan rumus yang sama untuk semua efek, dan penjumlahan dibuat berurutan agar hasilnya sama di setiap versi Python.
- S-02 tidak memakai dua nada B5 lalu E6 seperti rancangan Plan, karena urutan itu mirip bunyi koin sebuah game terkenal. Penggantinya luncuran cepat dari A5 ke E6 yang berdering, sejalan dengan aturan "tidak mirip game yang sudah ada" (Design System 14).
- S-02 sudah memakai puncak tertinggi (−3 dBFS), jadi tetap 0,6 LU di bawah sasaran; masih di dalam batas 1 LU.
- S-05 ditemani sedikit pulsa 50% yang disaring rendah, karena segitiga G4 dan E4 saja terlalu tipis di speaker HP.
- `CREDITS.md` dan `manifest.ts` belum berubah, karena keduanya hanya memuat efek Disetujui. Sesudah S-01 sampai S-07 disetujui, giliran 2 menambahkan bagian efek suara di `CREDITS.md`, kelompok `SUARA` di `manifest.ts`, dan penyesuaian `aset-manifest.test.ts`.

### Rincian giliran 2 (21 November 2026)

| | |
|---|---|
| Kode | `scripts/game/suara/musik.py` (baru, resep M-01); `efek.py` (S-08, M-01 di daftar `EFEK`, serta laju sampel dan layar per efek); `chip.py` (pilihan laju sampel; S-01 sampai S-07 tetap sama byte); `build_jejak.py` (salinan klik dan teks, kredit, kelompok `SUARA`, dan anggaran terpisah untuk layar kelas) |
| Berkas baru | `sfx_akhir.wav` (143.898 B), `musik_kelas.wav` (846.764 B), serta salinan `sfx_klik.wav` (2.028 B) dan `sfx_teks.wav` (1.454 B) |
| Kredit dan manifest | `CREDITS.md` bagian "Efek suara" berisi 9 berkas: S-01 sampai S-07, klik, dan teks. `manifest.ts` mendapat kelompok `SUARA` berkunci `hitung`, `kejadian`, `klik`, `kotak`, `lembut`, `peringatan`, `skill`, `teks`, dan `tepat`, serta tipe `NamaSuara`. S-08 dan M-01 menyusul sesudah Disetujui |
| Uji | `aset-manifest.test.ts` (4 uji baru): impor WAV dari `sfx/`, kunci dan berkas, format WAV, lama dan ukuran, salinan klik dan teks identik dengan Sehari Setara, dan kecocokan dengan `CREDITS.md`. Enam salinan yang sengaja dirusak ditolak: baris kredit hilang, salinan teks berbeda, berkas 11.025 Hz yang terlalu panjang, impor di luar `sfx/`, efek Disetujui yang hilang dari `SUARA`, dan WAV dua kanal. `content:check:jejak` 10 berkas, 258 uji; `test:jejak` 62 berkas, 1.009 uji |
| Build | `build:jejak` lulus: kesembilan WAV menjadi berkas berhash di `dist-jejak/client/assets/`, tanpa data URI audio; `sfx_klik-FHxxz5EV.wav` bernama sama dengan hasil build Sehari Setara. Belum ada kode yang memakai `SUARA`, jadi kode layar pemain tidak bertambah |
| Ukuran | Aset layar pemain 205,3 KB (anggaran 2 MB); khusus layar kelas 967,4 KB (S-08 dan M-01) |

| ID | Berkas | Lama | Ukuran | Puncak | Keras terdengar (sasaran) |
|---|---|---|---|---|---|
| S-08 | `sfx_akhir.wav` | 3,262 detik | 143.898 B | −6,5 dBFS | −16,2 LUFS (−16) |
| M-01 | `musik_kelas.wav` | 38,400 detik, 11.025 Hz | 846.764 B | −14,5 dBFS | −24,1 LUFS (−24) |

- M-01 berulang mulus: semua nada selesai 0,1 detik sebelum akhir lagu, dan 0,15 detik terakhirnya paling keras 38 dari 32.767, sehingga ujung lagu bersambung ke awalnya tanpa bunyi letup. Bagi pendengar, sambungan itu terdengar seperti jeda napas di akhir kalimat musik.
- M-01 sekitar −24 LUFS, 6 LU di bawah efek utama, jadi JS-21 tidak perlu mengatur volume khusus. Berhenti saat jeda, hitung mundur, dan jingle akhir (KT-C26 a) diatur kode JS-21.
- M-01 tidak masuk `SUARA`, karena hanya layar kelas yang memutarnya, dan layar kelas mengimpor WAV langsung (P-35 JS-10). Nama `musik_kelas.wav` belum ada di pola nama Design System 14, jadi dicatat lewat Permintaan C-16.
- Walaupun M-01 disetujui, musik baru terdengar sesudah JS-21 (P1) dibangun.

### Penutup (21 November 2026)

| | |
|---|---|
| Kredit | `CREDITS.md` bagian "Efek suara dan musik latar" berisi 11 berkas: S-01 sampai S-08, M-01, klik, dan teks |
| Manifest | Kelompok `SUARA` berisi 10 bunyi: `akhir`, `hitung`, `kejadian`, `klik`, `kotak`, `lembut`, `peringatan`, `skill`, `teks`, dan `tepat`, dengan tipe `NamaSuara`. `musik_kelas.wav` tidak masuk `SUARA`; layar kelas mengimpornya langsung (P-35 JS-10) |
| Uji | `aset-manifest.test.ts` memeriksa musik latar Disetujui di `CREDITS.md`: WAV PCM mono 16 bit 11.025 Hz, 30–45 detik, paling besar 1 MB, dan tidak ada di `SUARA` (1 uji baru). Tiga salinan rusak ditolak: baris kredit musik hilang, musik diganti berkas 22.050 Hz yang pendek, dan musik dimasukkan ke `SUARA`. `content:check:jejak` 10 berkas, 259 uji; `test:jejak` 62 berkas, 1.010 uji |
| Build | `build:jejak` lulus: kesepuluh WAV di `SUARA` menjadi berkas berhash, termasuk `sfx_akhir`, tanpa data URI audio. `musik_kelas.wav` baru ikut build sesudah layar kelas mengimpornya di JS-21 |
| Berkas WAV | Tidak berubah sejak giliran 2 |

### Rencana (templat AGENTS 12.1)

Ditulis 21 November 2026 di tahap Plan, atas permintaan pemilik proyek: Sesi A sedang mengerjakan JS-09 dan Sesi B menulis naskah kejadian tambahan, sedangkan JS-14 membutuhkan efek suara. Menunggu `Setuju: suara`.

| | |
|---|---|
| Status | **Selesai** (21 Nov 2026): rencana disetujui (`Setuju: suara`, semua saran a); S-01 sampai S-08 dan M-01 Disetujui; kredit dan manifest lengkap |
| Memenuhi | Design System 12 (delapan efek); bahan suara untuk JFR-55 (pengaturan suara pemain, dibangun di JS-14); Design System 15 (asal dan lisensi efek suara dicatat per berkas di `CREDITS.md`) |
| Bergantung pada | Tidak ada untuk membuat bunyi. JS-14 (Sesi A) memakainya; catatan Plan JS-14 di `PLAN.md` sudah menyebut `sfx_kotak` dan `sfx_skill` |
| Berkas yang dibuat atau diubah | Plan: berkas ini saja; contoh `sfx_tepat.wav` dikirim di balasan dan tidak masuk repositori. Giliran 1: `scripts/game/suara/chip.py` dan `scripts/game/suara/efek.py` (baru); `scripts/game/art/build_jejak.py` (diubah: memanggil kit suara dan memeriksa hasilnya); tujuh WAV di `app/jejak-setara/assets/sfx/` (baru). Giliran 2: `scripts/game/suara/musik.py` (baru); `chip.py`, `efek.py`, dan `build_jejak.py` (diubah); `sfx_akhir.wav`, `musik_kelas.wav`, dan salinan `sfx_klik.wav` serta `sfx_teks.wav` (baru); `app/jejak-setara/assets/CREDITS.md`, `app/jejak-setara/assets/manifest.ts`, dan `app/jejak-setara/__tests__/konten/aset-manifest.test.ts` (diubah) |
| Migrasi D1 | Tidak ada |
| Pesan protokol baru atau berubah | Tidak ada |
| Aset yang dibutuhkan | Delapan efek baru (tabel di atas). Klik dan bunyi teks Sehari Setara dipakai ulang tanpa perubahan |
| Dependensi baru | Tidak ada. Kit suara hanya memakai pustaka bawaan Python (`wave` dan `struct`); `build_jejak.py` tetap memakai Pillow seperti sekarang |
| Ukuran | M: delapan berkas kecil, dua berkas kode baru, dan perubahan `build_jejak.py` |

### Acuan bunyi Sehari Setara

Dibaca dari `app/sehari-setara/assets/sfx/` tanpa diubah. Keras terdengar diukur dalam LUFS sesaat (pembobotan K ITU-R BS.1770, jendela 400 ms): makin mendekati 0, makin keras. Untuk bunyi sependek klik, jendela 400 ms membuat angkanya beberapa dB lebih rendah daripada yang terdengar.

| Berkas | Format | Isi | Puncak | Keras terdengar |
|---|---|---|---|---|
| `sfx_klik.wav` (gaya A) | WAV PCM mono 16 bit, 22.050 Hz, 2.028 byte | Pulsa 25% tanpa geser DC, sekitar 1,3 kHz yang turun ke 0,9 kHz, 45 ms, luruh cepat | −6,9 dBFS | −25,4 LUFS |
| `sfx_teks.wav` (gaya B) | Sama, 1.454 byte | Segitiga sekitar 520 Hz, 32 ms | −8,0 dBFS | −27,3 LUFS |

Jadi keluarga bunyinya: pulsa 25% untuk bunyi yang tegas, segitiga untuk bunyi yang lembut, serangan cepat, luruh lembut, dan nada di sekitar C5 sampai E6.

### Hasil percobaan

Dijalankan di luar repositori pada 21 November 2026, dengan kit suara percobaan (calon `chip.py` dan `efek.py`).

1. **Contoh `sfx_tepat` (S-04).** 0,552 detik, 24.388 byte, puncak tepat −3,00 dBFS (sampel terbesar 23.197 dari 32.767), keras terdengar −13,5 LUFS. Sampel pertama dan terakhir bernilai 0, dengan pudar 2 ms di awal dan 8 ms di akhir; tanpa geser DC dan tanpa terpotong. Dibangun dua kali dalam 0,2 detik dengan hasil sama byte demi byte. SHA-256 `547b13a2eb17783e633e3c776c4d3204c3686e2cec97ef57e0c785919d9295d0`.
2. **Sama di setiap komputer.** Perhitungan sampel hanya memakai tambah, kurang, kali, dan bagi. Tinggi nada dihitung dari rasio satu semiton yang ditulis sebagai angka, tanpa sin, exp, atau pow, yang hasilnya bisa sedikit berbeda antarkomputer. WAV tidak dimampatkan, jadi hasil bangun ulang di Windows sama byte dengan di Linux. Ini berbeda dengan PNG, yang bisa berbeda byte karena pemampatan (bagian "Manifest aset").
3. **Batas 30 KB lebih ketat daripada batas 1 detik.** WAV mono 16 bit pada 22.050 Hz memakai 44.100 byte per detik, jadi 30 KB (30.720 byte) hanya cukup untuk 0,69 detik. Semua efek pendek dalam rancangan 0,08 sampai 0,6 detik, jadi tetap di bawah 30 KB. Jingle akhir tidak: draf jingle 3,212 detik berukuran 141.694 byte (138 KB). Agar jingle 3,2 detik muat 30 KB, laju sampelnya harus di bawah 4.800 Hz, dan bunyinya menjadi seperti telepon tua (usulan 3).
4. **Puncak yang sama tidak berarti keras yang sama.** Pada puncak −3 dBFS: `sfx_tepat` −13,5 LUFS, draf `sfx_lembut` −12,5 LUFS (nadanya panjang dan rata, jadi justru paling keras), draf `sfx_hitung` −18,5 LUFS, dan draf `sfx_peringatan` −18,6 LUFS. Draf `sfx_lembut` pada −9 dBFS −18,5 LUFS. Contoh `sfx_tepat` pada puncak −7,5 dBFS −18,0 LUFS (usulan 4).
5. **Manifest dan uji.** Architecture 11.2 menyebut kelompok `suara` di `manifest.ts`, ditambahkan di JS-14. `aset-manifest.test.ts` hanya menerima impor PNG dari folder `ava`, `ikon`, `npc`, `obj`, dan `ubin`, jadi impor WAV di manifest membuat uji itu gagal. Pembaca `CREDITS.md` yang lain (`aset-manifest`, `bank-aset`, dan `naskah-urai.ts`) hanya membaca baris PNG, jadi baris WAV di `CREDITS.md` aman. Deklarasi tipe `*.wav` sudah ada di `app/sehari-setara/assets/wav.d.ts` dan berlaku untuk seluruh repositori, seperti `png.d.ts` yang sudah dipakai manifest Jejak Setara, jadi tidak perlu deklarasi baru (usulan 5).
6. **Layar kelas.** Uji JS-10 (P-35, AC-23) melarang layar kelas dan halaman konsol mengimpor `manifest.ts`; ikonnya diimpor langsung dari berkas PNG. Layar kelas, yang memutar hitung mundur, peringatan, dan jingle, akan mengimpor WAV langsung dengan cara yang sama.
7. **`CREDITS.md` ditulis ulang.** `build_jejak.py` menulis ulang seluruh `CREDITS.md` setiap kali dijalankan tanpa `--only`. Bila kredit suara ditulis skrip lain, barisnya hilang saat aset gambar dibangun ulang, jadi daftar suara harus diketahui `build_jejak.py` (usulan 1).
8. **Berkas berhash.** `vite.jejak.config.ts` mengatur `assetsInlineLimit` sehingga semua berkas di `app/jejak-setara/assets/`, termasuk WAV di `sfx/`, menjadi berkas berhash, bukan data URI (C-13 sudah diterapkan).
9. **Galeri.** `build:pages` sebelum dan sesudah berkas ini diubah: ke-178 berkas `dist-pages/` identik byte.

### Usulan (disetujui 21 November 2026: semua saran a)

Setiap usulan berisi saran (a) dan alternatifnya. Kode KT-C20 sampai KT-C26 adalah keputusan Sesi C untuk efek suara. Pemilik proyek membalas `Setuju: suara` pada 21 November 2026, jadi semua saran (a) dipakai. KT-C26 (musik latar) dicatat sebagai arah untuk JS-21; atas permintaan pemilik proyek, contohnya (M-01) dibuat di giliran 2.

1. **Letak dan cara membuat (KT-C20).**
   - (a, saran) Kit suara di folder baru `scripts/game/suara/`: `chip.py` (alat: gelombang pulsa, segitiga, dan desis, selubung, saringan, penulis WAV, dan pemeriksaan) dan `efek.py` (resep delapan efek, satu fungsi per efek). `build_jejak.py` memanggilnya, menulis WAV ke `app/jejak-setara/assets/sfx/`, memeriksanya, dan mencatat kreditnya, sehingga `assets:build:jejak` membangun gambar dan suara sekaligus tanpa mengubah `package.json`. Kit suara hanya memakai `wave` dan `struct`.
   - (b) Semuanya ditulis di `build_jejak.py`, yang sudah 1.649 baris dan memakai Pillow.
   - (c) Kit suara dijalankan terpisah dengan perintahnya sendiri. Tidak disarankan: kreditnya terhapus setiap kali `build_jejak.py` berjalan (percobaan 7), dan perintah pnpm baru harus ditambahkan Sesi A.
2. **Format (KT-C21).**
   - (a, saran) WAV PCM mono 16 bit 22.050 Hz, sama dengan klik dan bunyi teks. Efek pendek paling lama 0,65 detik, jadi paling besar 28,7 KB.
   - (b) 16.000 Hz, sehingga efek pendek bisa sampai 0,95 detik dalam 30 KB, tetapi lajunya berbeda dari klik dan bunyi teks. Rancangan sekarang tidak membutuhkannya.
3. **Jingle akhir (KT-C22).**
   - (a, saran) 22.050 Hz, sekitar 3,2 detik dan 140 KB, dengan pengecualian "jingle akhir paling besar 160 KB". Jingle hanya diputar di layar kelas, jadi HP pemain tidak pernah memuatnya. Pengecualian ini dicatat Sesi A di Design System 12 dan Architecture 11.3 (Permintaan C-14).
   - (b) 11.025 Hz, sekitar 70 KB dan lebih redup, dengan pengecualian "paling besar 80 KB".
   - (c) Jingle dipendekkan menjadi paling lama 0,69 detik agar muat 30 KB, sehingga tidak lagi 3–4 detik.
   - (d, tidak disarankan) Tetap 3–4 detik dan 30 KB: laju sampel di bawah 4.800 Hz.
4. **Volume (KT-C23).**
   - (a, saran) Puncak paling tinggi −3 dBFS, dan keras terdengar diseimbangkan dengan sasaran: S-01 sampai S-04 sekitar −18 LUFS (sedikit di atas klik), S-05 dan S-06 sekitar −21 LUFS, S-07 sekitar −23 LUFS, dan S-08 sekitar −16 LUFS. Puncak setiap berkas mengikuti sasarannya, jadi bisa di bawah −3 dBFS. Yang didengar pemilik proyek sama dengan yang diputar game, dan efek yang disebut "lembut" atau "pelan" memang terdengar pelan. Contoh `sfx_tepat` dengan sasaran ini (puncak −7,5 dBFS, −18,0 LUFS) dikirim di balasan sebagai berkas banding.
   - (b) Semua berkas berpuncak tepat −3 dBFS, sehingga rasa hanya datang dari bentuk nada. Bunyi lembut bisa terdengar paling keras (percobaan 4), kecuali JS-14 mengatur volume per efek.
5. **Pendaftaran di manifest (KT-C24).**
   - (a, saran) `build_jejak.py` menulis kelompok `SUARA` di `manifest.ts` untuk efek yang sudah Disetujui: kunci `kejadian`, `kotak`, `skill`, `tepat`, `lembut`, `hitung`, `peringatan`, dan `akhir`, berisi URL berkas, seperti `sounds` di manifest Sehari Setara. Sesi C menyesuaikan `aset-manifest.test.ts`: impor WAV dari `sfx/`, format, lama, ukuran, dan kecocokan dengan `CREDITS.md`. Ini perlu izin tambahan, karena batas berkas sesi ini belum memuat uji itu, walaupun header berkas ini mencatat izin 8 Nov 2026 untuk uji berawalan `aset-`. Sesi A mencatat bentuk `SUARA` di Architecture 11.2 (Permintaan C-15).
   - (b) Ditunda: sekarang hanya WAV dan `CREDITS.md`. Bentuk `SUARA` ditetapkan di Plan JS-14, lalu Sesi C menambahkannya.
   - (c) Berkas terpisah `app/jejak-setara/assets/suara.ts` yang bisa diimpor layar pemain dan layar kelas. Architecture 11.2 ("satu-satunya pintu masuk aset") harus diubah.
6. **Klik dan bunyi teks Sehari Setara (KT-C25).**
   - (a, saran) `build_jejak.py` menyalin keduanya identik byte ke `app/jejak-setara/assets/sfx/`, seperti ikon I-19 yang dipakai ulang, sehingga Jejak Setara punya satu pintu masuk aset dan tidak mengimpor dari folder Sehari Setara. Kreditnya mengikuti catatan Sehari Setara; pembuat dan lisensi kedua bunyi itu masih menunggu keterangan pemilik proyek (butir S-6 spesifikasi F-07 Sehari Setara).
   - (b) JS-14 mengimpor keduanya langsung dari `app/sehari-setara/assets/sfx/`.
7. **Musik latar P1 (KT-C26).** Usulan untuk JS-21; tidak dibuat sebelum disetujui.
   - (a, saran) Satu lagu chiptune tenang 16 birama (sekitar 38 detik, sekitar 100 ketukan per menit) yang berulang mulus, dengan tiga suara: melodi pulsa lembut, bas segitiga, dan ketukan desis halus, dalam tangga nada C mayor pentatonik. Dibuat dengan kit suara yang sama sebagai WAV mono 16 bit 11.025 Hz, sekitar 0,8 MB, dan hanya diputar di layar kelas. Musik diputar pelan di bawah efek dan berhenti saat jeda, hitung mundur, dan jingle akhir.
   - (b) Tanpa berkas musik: kit suara menulis not lagu, dan layar kelas memainkannya dengan Web Audio (kode Sesi A). Berkasnya sangat kecil dan lagu bisa lebih panjang, tetapi bunyinya bisa sedikit berbeda dari pratinjau.
   - (c) Tiga variasi lagu yang sama untuk pagi, siang, dan sore, sesuai ciri "Kampung sehari", dengan ukuran tiga kali lipat.

### Urutan pengerjaan

Sesudah `Setuju: suara`, efek dikirim dalam dua giliran. Setiap giliran melampirkan WAV di balasan dan menyerahkan ZIP kecil. `CREDITS.md` dan manifest hanya memuat efek berstatus Disetujui, sama seperti aset gambar. Permintaan C-14 dan C-15 diajukan 21 November 2026, langsung sesudah `Setuju: suara`, karena isinya sudah diputuskan.

| Giliran | Isi | Balasan |
|---|---|---|
| 1 (Disetujui 21 Nov 2026) | Kit suara, `build_jejak.py`, dan S-01 sampai S-07 (efek pendek), semuanya Ditinjau | `Setuju: S-01 sampai S-07`, atau perbaikan per efek, misalnya "S-05: lebih pelan" |
| 2 (Disetujui 21 Nov 2026) | S-08 (format sesuai KT-C22) dan contoh musik latar M-01 (atas permintaan pemilik proyek); S-01 sampai S-07, klik, dan teks masuk `CREDITS.md` dan manifest | `Setuju: S-08, M-01`, atau perbaikan |
| Penutup (diserahkan 21 Nov 2026) | S-08 masuk `CREDITS.md` dan manifest; M-01 masuk `CREDITS.md`; Permintaan C-16 diajukan | — |

### Risiko

- Rasa bunyi dinilai dengan telinga, jadi nada dan panjang bisa berubah sesudah didengar. Setiap efek tetap Ditinjau sampai disetujui.
- Speaker HP lemah di nada rendah (di bawah sekitar 400 Hz). `sfx_lembut` memakai segitiga, yang punya nada atas di sekitar 1 sampai 2 kHz, sehingga tetap terdengar di HP.
- Pengecualian ukuran jingle (KT-C22) dan bentuk `SUARA` (KT-C24) mengubah dokumen Sesi A (Permintaan C-14 dan C-15).
- Galeri: setiap berkas teks baru diperiksa dengan `build:pages` (178 berkas identik byte).

## Aset tambahan untuk naskah tambahan (K-26, K-32, K-33)

Aset baru untuk set tokoh kejadian tambahan, sesuai usulan 7a Plan naskah tambahan (KT-B14) di `naskah/STATUS.md`. Semuanya dipakai lewat set tokoh kejadian, bukan sebagai objek peta. Rencana, hasil percobaan, dan usulannya ada di bawah tabel, dan lembar uji gayanya `preview/uji_gaya_tambahan.png`. Plan disetujui 22 November 2026 (`Setuju: aset tambahan`, semua saran a), dan ketiga aset Disetujui pada hari yang sama (`Setuju: O-52, O-53, N-21`). Keduanya juga tercatat di tabel O5 dan N3.

| ID | Berkas (nama final) | Ukuran | Isi | Kejadian | Status |
|---|---|---|---|---|---|
| O-52 | `obj_prasasti.png` dan `obj_prasasti_atas.png` | 2 × 2 ubin: gambar 34 × 34 dipotong di baris 17 menjadi dua berkas 34 × 17 | Prasasti tua dari batu alam: bidang atas terang, muka depan berisi enam deret goresan samar tanpa huruf, retak kecil, dan lumut di kaki batu. Papan keterangan cagar budaya berdiri di kanannya: dua tiang kayu, bingkai kayu, dan panel `cream` bergaris tanpa huruf. Tanpa sesaji, kain, payung, atap, atau tanda keagamaan | K-32 | Disetujui (22 Nov) |
| O-53 | `obj_kandang_kukang.png` | 1 × 1 ubin (18 × 18) | Kandang kawat kecil beralas papan. Kukang duduk tenang memeluk dahan berdaun, dengan mata bulat besar yang terbuka, cincin gelap di sekitar mata, dan garis terang di antara mata; tanpa luka dan tanpa warna merah. Jeruji tidak menutupi wajahnya | K-33 | Disetujui (22 Nov) |
| N-21 | `npc_penjual_bawah_diam.png` | Strip 2 bingkai dewasa 16 × 26 (32 × 26), titik kaki (8, 23) | Penjual kukang, warga dewasa yang tampak biasa dan ramah: `skin-2`, topi bundar `sky-d`, kaus `teal`, celana `dusk`, sandal, dan tas selempang cokelat (bukan tas punggung). Diam menghadap bawah | K-33 | Disetujui (22 Nov) |
| N-22 | — (tidak ada berkas) | — | Pedagang kedua: `skin-4`, rambut `hair-1` diikat, baju lengan panjang `sky-d`, celemek `leaf`, rok panjang cokelat, dan sandal; berbeda dari pedagang N-14 dan Ibu | K-26 | Tidak dibuat (KT-C30 a, 22 Nov 2026): permintaannya dicabut; hanya draf di lembar uji gaya |

- Kunci set tokoh sama dengan kunci usulan di naskah K-32 dan K-33: `obj_prasasti`, `obj_kandang_kukang`, dan `npc_penjual_bawah_diam`. Jadi isi set tokoh di naskah tidak perlu diganti; Sesi B cukup mencatatnya sebagai kunci final. Teman di K-32 tetap siswa umum S2 (`npc_siswa2_bawah_diam`), dan Ibu di K-26 tetap `npc_ibu_bawah_diam`.
- N-22 tidak dibuat (KT-C30 a). Cirinya tetap tercatat di `NPC3` (`atas_tokoh.py`) tanpa pose dan tanpa PNG, hanya agar `uji_gaya_tambahan.png` bisa dibangun ulang sama byte. Bila kelak dibutuhkan, kuncinya `npc_pedagang2_bawah_diam`, dan kunci itu juga harus masuk `kunci-aset.ts` begitu Disetujui (percobaan 6).
- Kotak padat dan bayangan di `OBJEK_TAMBAHAN`: prasasti padat di baris ubin bawah, kandang padat di ubinnya, dan keduanya berbayangan kecil (U-14), seperti properti O3. Bayangan itu hanya dipakai bila kelak keduanya diletakkan sebagai objek peta.

### Rincian giliran gambar (22 November 2026)

| | |
|---|---|
| Kode | `scripts/game/art/atas_tambahan.py` (baru: O-52 dan O-53, `OBJEK_TAMBAHAN`, dan `KODE_TAMBAHAN`); `atas_tokoh.py` (bagian baru `NPC3`, `POSE_NPC3`, `npc3()`, dan `strip_npc3()`, dengan gaya kepala `topi_bundar` dan tas selempang; tokoh lama tidak berubah); `build_jejak.py` (menggabungkan objek tambahan ke daftar objeknya, mendaftarkan N-21, kode ID, titik kaki `NPC3` di manifest, `DISETUJUI_TAMBAHAN` yang masih kosong, dan tiga pratinjau) |
| Berkas | Empat PNG baru: `obj/obj_prasasti.png` (34 × 17, 423 B), `obj/obj_prasasti_atas.png` (34 × 17, 447 B), `obj/obj_kandang_kukang.png` (18 × 18, 352 B), dan `npc/npc_penjual_bawah_diam.png` (32 × 26, 612 B); jumlah 1.834 B |
| Pemeriksaan `build_jejak.py` | Lulus: hanya warna palet, tanpa piksel semi-transparan, dan ukuran sesuai. Keempat PNG sama byte dengan prototipe lembar uji gaya, dan dua kali dibangun dengan hasil sama byte. Aset layar pemain 206,6 KB (anggaran 2 MB) |
| Yang tidak berubah | Ke-239 PNG aset lama (sama piksel), `CREDITS.md` dan `manifest.ts` (sama byte, karena aset tambahan masih Ditinjau), ke-31 pratinjau lama (sama piksel), kedua GIF dan ke-11 WAV (sama byte). `atas_objek.py` tidak berubah, jadi sidik sumber peta tetap cocok (`build_peta.py --periksa` lulus). `build_assets.py` Sehari Setara: ke-65 PNG sama piksel |
| Pratinjau | `preview/tambahan_lembar.png` (aset ×5 dan ×10, kedua bagian prasasti, dan ukuran asli di atas rumput, paving, dan semen); `preview/tambahan_set.png` (set K-32 dan K-33 di tiga masa, lapisan atas prasasti, pemain di dekat penjual, dan pandangan pemain sore); `preview/uji_gaya_tambahan.png` kini dibangun `build_jejak.py`, dengan hasil sama byte dengan lembar Plan |
| Uji | `content:check:jejak` 10 berkas, 259 uji; `test:jejak` 78 berkas, 1.172 uji; `build:jejak` lulus; galeri (`build:pages`) 178 berkas identik byte |
| Simulasi penutup | Di salinan terpisah, keempat berkas ditandai Disetujui di `DISETUJUI_TAMBAHAN`: `CREDITS.md` mendapat 4 baris, dan manifest memuat `OBJEK` 71 dan `NPC` 34. `aset-manifest` dan `peta-berkas` lulus, sedangkan `aturan-bank` baru lulus sesudah tiga kunci masuk `kunci-aset.ts`. Sesudah itu ke-78 berkas uji lulus (1.172 uji) |

- **Perubahan dari rencana:** O-52 dan O-53 ditulis di berkas baru `atas_tambahan.py`, bukan di `atas_objek.py`. `atas_objek.py` termasuk sidik sumber peta (spesifikasi JS-06, P-23). Begitu berkas itu berubah, uji `peta-berkas` ("sidik sumber cocok dengan kelima berkas sumber") gagal sampai `kampung_gambar.json` dibangun ulang, padahal isi peta tidak berubah dan berkas peta di luar batas berkas tugas ini. `build_jejak.py` menggabungkan objek tambahan ke daftarnya untuk aset, pratinjau, dan manifest, sedangkan `build_peta.py` tetap hanya membaca `atas_objek.py`. Permintaan C-18 meminta Sesi A mencatat berkas baru ini di Design System 14.
- Prasasti dipotong di baris 17: puncak batu dan papan menutupi pemain yang berjalan di belakangnya, dan baris ubin bawahnya padat (panel "Lapisan atas prasasti" di `tambahan_set.png`).
- Di giliran ini `CREDITS.md` dan `manifest.ts` belum berubah, karena ketiga aset masih Ditinjau; keduanya ditulis di giliran penutup.

### Penutup (22 November 2026)

| | |
|---|---|
| Kode | Hanya `DISETUJUI_TAMBAHAN` di `build_jejak.py` yang diisi (tanggal 22 November 2026), dan judul kedua pratinjau menjadi "disetujui 22 Nov 2026". Gambar tidak berubah |
| Kredit | `CREDITS.md` mendapat 4 baris: `obj/obj_kandang_kukang.png` (O-53), `obj/obj_prasasti.png` dan `obj/obj_prasasti_atas.png` (O-52), serta `npc/npc_penjual_bawah_diam.png` (N-21), dengan atribusi "Digambar dengan kode (kit Sehari Setara) oleh Claude, disetujui YAN, 22 November 2026". Jumlahnya kini 254 aset (243 gambar dan 11 suara) |
| Manifest | 243 gambar. `OBJEK` 71 jenis: ditambah `prasasti` (bagian bawah dan atas, jejak kaki 2 × 2 ubin) dan `kandang_kukang` (1 × 1, tanpa bagian atas). `NPC` 34 strip: ditambah `npc_penjual_bawah_diam` (2 bingkai 16 × 26, titik kaki (8, 23)). Bagian lain tidak berubah |
| Uji | `content:check:jejak` 10 berkas, 259 uji lulus. `test:jejak` 1.171 dari 1.172 uji lulus; satu-satunya yang gagal, `aturan-bank` ("daftar kunci aset server sama dengan berkas aset dan kredit Disetujui"), menunggu tiga kunci A-17. Di salinan terpisah yang sudah memuat ketiga kunci itu, ke-78 berkas uji lulus (1.172 uji) |
| Build | `build:jejak` lulus: keempat PNG baru menjadi berkas berhash di `dist-jejak/client/assets/`, tanpa data URI |
| Galeri | `build:pages` 178 berkas identik byte |
| Commit | ZIP penutup hanya di-commit bersama ZIP A-17 Sesi A (KT-C31 a, Permintaan C-17). Bila di-commit sendiri, "Jejak: uji" merah di uji `aturan-bank`. Commit 409ceab masuk sendiri; perbaikannya ada di bawah |

- Kunci final set tokoh sama dengan kunci usulan di naskah: `obj_prasasti` (K-32), serta `obj_kandang_kukang` dan `npc_penjual_bawah_diam` (K-33). Sesi B cukup mencatatnya sebagai kunci final sebelum semai tambahan.
- Sesudah perbaikan 23 November 2026 di-commit, syarat aset untuk Build semai tambahan Sesi B terpenuhi (KT-B15a); syarat lain (A-15 dan A-18) di luar bagian ini.

### Perbaikan (23 November 2026)

| | |
|---|---|
| Penyebab | Commit 409ceab (22 Nov 2026) hanya berisi enam berkas ZIP penutup. `kunci-aset.ts` dari A-17 tidak ikut, jadi "Jejak: uji" #105 gagal di langkah "Uji Jejak": uji `aturan-bank` ("daftar kunci aset server sama dengan berkas aset dan kredit Disetujui") menemukan 105 aset Disetujui tetapi hanya 102 kunci. Uji lain lulus (1.171 dari 1.172) |
| Perbaikan | `npc_penjual_bawah_diam`, `obj_kandang_kukang`, dan `obj_prasasti` ditambahkan ke `KUNCI_ASET_DISETUJUI` di `app/jejak-setara/inti/konten/kunci-aset.ts`, sesuai urutan abjad (105 kunci). Berkas itu biasanya diubah Sesi A; kali ini diubah Sesi C atas permintaan pemilik proyek, jadi Permintaan A-17 dan C-17 selesai |
| Pemeriksaan | Di salinan repositori 409ceab dengan perbaikan ini, semua langkah "Jejak: uji" lulus: `content:check:jejak` 10 berkas, 259 uji; `test:jejak` 78 berkas, 1.172 uji; `test:jejak:server` 11 berkas, 65 uji; `build:jejak` lulus, dan keempat PNG baru menjadi berkas berhash. Galeri (`build:pages`) 178 berkas identik byte dengan 409ceab |

- Sesi A perlu kabar bahwa A-17 sudah selesai, supaya tidak dikerjakan dua kali dan statusnya dicatat di `PLAN.md`. Sesi B perlu kabar yang sama untuk `naskah/STATUS.md`.

### Rencana (templat AGENTS 12.1)

Ditulis 22 November 2026 di tahap Plan, atas permintaan pemilik proyek: naskah K-26, K-32, dan K-33 sudah disetujui, dan Build semai tambahan Sesi B menunggu aset K-32 dan K-33 beserta Permintaan A-17. Menunggu `Setuju: aset tambahan`.

| | |
|---|---|
| Status | **Selesai** (22 Nov 2026): Plan disetujui (`Setuju: aset tambahan`, semua saran a); O-52, O-53, dan N-21 Disetujui (`Setuju: O-52, O-53, N-21`); kredit dan manifest lengkap. Kunci di `kunci-aset.ts` masuk lewat perbaikan 23 Nov 2026 (A-17 dan C-17 selesai) |
| Memenuhi | Usulan 7a Plan naskah tambahan (KT-B14): prasasti untuk K-32, serta kukang dalam kandang dan penjualnya untuk K-33; syarat Build semai tambahan (KT-B15a dan Permintaan A-17). Pedagang kedua K-26 hanya bila usulan 4b atau 4c dipilih |
| Bergantung pada | Tidak ada untuk menggambar. Naskah K-32 dan K-33 (disetujui 22 Nov 2026) sudah memakai kunci yang sama dengan nama berkas di tabel |
| Berkas yang dibuat atau diubah | Plan: berkas ini dan `preview/uji_gaya_tambahan.png` (baru). Giliran gambar: `scripts/game/art/atas_tambahan.py` (baru: O-52 dan O-53; rencana awal menyebut `atas_objek.py`, lihat "Perubahan dari rencana" di rincian giliran gambar), `atas_tokoh.py` (diubah: bagian baru `NPC3` untuk N-21), dan `build_jejak.py` (diubah: daftar aset, kode ID, titik kaki tokoh baru di manifest, dan pratinjau); PNG baru di `app/jejak-setara/assets/obj/` dan `npc/`; pratinjau baru `preview/tambahan_lembar.png` dan `preview/tambahan_set.png`. Penutup: `app/jejak-setara/assets/CREDITS.md` dan `manifest.ts`, keduanya ditulis `build_jejak.py` |
| Migrasi D1 | Tidak ada |
| Pesan protokol baru atau berubah | Tidak ada |
| Aset yang dibutuhkan | Tiga aset baru (empat berkas PNG); satu aset lagi bila usulan 4b atau 4c dipilih |
| Dependensi baru | Tidak ada |
| Risiko | Bagian "Risiko" di bawah |
| Ukuran | S: tiga aset, satu lembar uji gaya, dan dua pratinjau |

### Hasil percobaan

Dijalankan di luar repositori pada 22 November 2026. Prototipe memakai fungsi kit (`pixelart.py`, `atas_objek.py`, `atas_tokoh.py`, dan `build_jejak.py`) tanpa mengubahnya.

1. **Kit tetap sama.** `build_assets.py` dibangun ulang ke folder sementara: ke-65 PNG Sehari Setara sama piksel dengan repositori (29 sama byte, dan 36 hanya berbeda pemampatan, seperti catatan 8 November di bagian "Manifest aset"). `build_jejak.py` ke folder sementara: ke-239 PNG sama piksel (208 sama byte, 31 hanya berbeda pemampatan), ke-31 pratinjau PNG sama piksel, kedua GIF, `manifest.ts`, `CREDITS.md`, dan ke-11 WAV sama byte; semua pemeriksaan lulus.
2. **Lembar uji gaya.** Lima berkas prototipe (O-52 dua bagian, O-53, N-21, dan draf N-22): 0 piksel di luar palet atau semi-transparan, ukuran sesuai tabel, dan 9–12 warna per berkas. Tokoh baru memakai bagian badan, kaki, dan kepala kelompok N2 apa adanya; yang baru hanya topi bundar dan tas selempang. Hasilnya `preview/uji_gaya_tambahan.png`.
3. **Ukuran berkas.** `obj_prasasti` 423 B, `obj_prasasti_atas` 447 B, `obj_kandang_kukang` 352 B, `npc_penjual_bawah_diam` 612 B, dan draf `npc_pedagang2_bawah_diam` 482 B: jumlah 2,3 KB, atau 1,8 KB tanpa N-22. Aset layar pemain naik dari 204,8 KB menjadi sekitar 206,6 KB, jauh di bawah anggaran 2 MB.
4. **Keterbacaan.** Di pandangan pemain 320 × 180 piksel logis (×1 dan ×2), prasasti tetap terbaca sebagai batu bertulisan dengan papan, dan berbeda dari batu biasa O-51 di tepi sungai. Penjual mudah dibedakan dari warga, pedagang N-14, dan polisi lewat siluet topi bundar dan warna bajunya. Kukang dikenali dari mata besar bercincin gelap, dan teks situasi tetap menyebut "kukang".
5. **Kepekaan (AGENTS bagian 8 dan catatan peninjauan naskah).** Prasasti tanpa sesaji, kain, payung, atap, atau tanda keagamaan, dan berupa batu alam tak beraturan, bukan lempeng bundar seperti nisan. Tulisan dan papan tanpa huruf, logo, atau lambang instansi (Design System 14). Kukang tanpa luka dan tanpa warna merah, duduk tenang, matanya terbuka, dan tidak berdesakan di kandang. Penjual digambarkan sebagai warga biasa, tanpa ciri suku atau agama dan tanpa tampang jahat. Tokoh baru tidak bertas punggung (usulan 9a), jadi tidak tertukar dengan pemain.
6. **Kunci, kredit, dan manifest saling mengunci.** Dicoba dengan Vitest di salinan repositori terpisah:
   - PNG baru yang belum tercatat Disetujui (status Ditinjau) tidak memengaruhi uji: `aset-manifest`, `aturan-bank`, dan `bank-aset` lulus (45 uji).
   - Bila aset itu ditandai Disetujui di `build_jejak.py`, `CREDITS.md` dan `manifest.ts` ditulis bersama, dan `aset-manifest` lulus. Namun `aturan-bank` gagal di uji "daftar kunci aset server sama dengan berkas aset dan kredit Disetujui" sampai ketiga kuncinya masuk `KUNCI_ASET_DISETUJUI` di `kunci-aset.ts`.
   - Sesudah ketiga kunci ditambahkan, ke-78 berkas uji `test:jejak` lulus (1.172 uji), sama dengan `main`.
   - `CREDITS.md` dan `manifest.ts` tidak bisa dipisah: uji "hanya aset Disetujui" mewajibkan keduanya memuat aset yang sama, dan baris pertama `manifest.ts` berbunyi "Dibuat build_jejak.py. Jangan disunting manual." Jadi `CREDITS.md`, `manifest.ts`, dan `kunci-aset.ts` harus masuk dalam satu commit (usulan 5).
7. **Galeri.** `build:pages` sebelum dan sesudah berkas ini diubah: ke-178 berkas `dist-pages/` identik byte.

### Usulan (disetujui 22 November 2026: semua saran a)

Setiap usulan berisi saran (a) dan alternatifnya. Kode KT-C27 sampai KT-C31 adalah keputusan Sesi C untuk aset tambahan. Pemilik proyek membalas `Setuju: aset tambahan` pada 22 November 2026, jadi semua saran (a) dipakai: N-22 tidak dibuat, dan Permintaan C-17 diajukan.

1. **Bentuk prasasti (KT-C27).**
   - (a, saran) Batu alam tak beraturan dan berlumut seperti di lembar uji gaya: bidang atas terang, muka depan bertulisan samar enam deret, retak kecil, dan sisi kanan teduh. Terbaca sebagai prasasti tua, bukan nisan atau tempat ibadah.
   - (b) Tugu batu tegak bersegi empat dengan lempeng bertulisan samar: lebih rapi, tetapi lebih mirip tugu peringatan baru daripada prasasti tua.
2. **Papan keterangan (KT-C28).**
   - (a, saran) Satu gambar bersama prasasti (O-52) dengan satu kunci, `obj_prasasti`. Set K-32 tidak berubah, dan petunjuk "Perhatikan papan di dekat prasasti" selalu tepat, karena papan selalu berdiri di samping batunya.
   - (b) Objek terpisah `obj_papan_cagar` (1 × 2 ubin) yang bisa dipakai kejadian lain. Sesi B harus menambah kunci kedua di set K-32 (naskah dan semai), dan papan bisa terletak jauh dari prasasti.
3. **Kukang dan penjual (KT-C29).**
   - (a, saran) Dua gambar sesuai kunci naskah: kandang 1 × 1 ubin di tanah (O-53) dan penjual yang berdiri diam di sampingnya (N-21).
   - (b) Penjual memegang kandang dalam satu pose khusus, `npc_penjual_bawah_kandang`, dengan satu kunci. Naskah K-33 harus diubah, dan kandang di tangan hanya selebar sekitar 6 piksel, sehingga kukang sulit dikenali.
4. **Pedagang kedua untuk K-26 (KT-C30).**
   - (a, saran) Tidak dibuat, sesuai pencabutan 22 November 2026: penjual K-26 tidak tampil di set (`naskah/STATUS.md`, bagian "Untuk Sesi C", dan catatan peninjauan K-26). Draf di lembar uji gaya tidak masuk repositori sebagai aset.
   - (b) Dibuat sebagai N-22 untuk kejadian lain kelak, tanpa mengubah set K-26. Kuncinya ikut ditambahkan lewat A-17.
   - (c) Dibuat dan dipakai di set K-26 sebagai penjual lapak sebelah yang meminjamkan timbangan. Sesi B menambah kuncinya di naskah K-26 dan semai tambahan.
5. **Kunci, kredit, dan manifest (KT-C31).**
   - (a, saran) Satu commit bersama. Di giliran penutup, `build_jejak.py` menulis `CREDITS.md` dan `manifest.ts` seperti untuk 239 aset sebelumnya, jadi Sesi A tidak menyunting `manifest.ts`, dan A-17 cukup menambah kunci di `kunci-aset.ts`. Sesi A mengerjakan A-17 dengan ZIP penutup Sesi C terlampir. Sesudah keduanya selesai, pemilik proyek memasukkan kedua ZIP ke folder repositori lalu melakukan satu commit, sehingga "Jejak: uji" tetap hijau. Untuk itu Permintaan C-17 diajukan sesudah `Setuju: aset tambahan`.
   - (b) Sesi C juga menambah ketiga kunci di `kunci-aset.ts` dalam ZIP penutup: satu ZIP dan satu commit, dan A-17 selesai tanpa kerja Sesi A. Perlu izin tertulis, karena berkas itu di luar batas berkas Sesi C dan berada di folder `inti/konten/`, yang menurut Sesi B diubah lewat Sesi A.
   - (c) Dua commit: ZIP penutup Sesi C di-commit lebih dulu, lalu A-17 menyusul. Selama A-17 belum masuk, "Jejak: uji" merah di uji `aturan-bank`.

### Urutan pengerjaan

Sesudah `Setuju: aset tambahan`, aset diserahkan dalam dua giliran. Setiap giliran menampilkan pratinjau di balasan dan menyerahkan ZIP kecil. `CREDITS.md` dan `manifest.ts` hanya memuat aset Disetujui, sama seperti aset sebelumnya.

| Giliran | Isi | Balasan |
|---|---|---|
| Plan (disetujui 22 Nov 2026) | Daftar aset, usulan KT-C27 sampai KT-C31, dan lembar uji gaya | `Setuju: aset tambahan`, atau dengan alternatif, misalnya `Setuju: aset tambahan, 4b` |
| 1. Gambar (diserahkan 22 Nov 2026) | Kode di `atas_tambahan.py` (baru), `atas_tokoh.py`, dan `build_jejak.py`; PNG O-52, O-53, dan N-21, semuanya Ditinjau; pratinjau `tambahan_lembar.png` dan `tambahan_set.png`. `uji_gaya_tambahan.png` kini dibangun `build_jejak.py`, dengan hasil sama byte dengan lembar Plan | `Setuju: O-52, O-53, N-21`, atau perbaikan per aset, misalnya "O-53: kukang lebih besar" |
| 2. Penutup (diserahkan 22 Nov 2026) | Aset Disetujui masuk `CREDITS.md` dan `manifest.ts`; tabel O5 dan N3 ditambahkan; nama berkas final dicatat untuk A-17 (Sesi A) dan untuk naskah (Sesi B). Di-commit bersama ZIP A-17 | — |

### Risiko

- Prasasti bisa terbaca sebagai nisan atau benda suci. Bentuk batu alam, papan keterangan, dan tidak adanya tanda keagamaan mengurangi risiko itu; pemilik proyek menilainya lewat lembar uji gaya.
- Kukang yang lebarnya 8 piksel bisa tidak dikenali di HP. Mata besar bercincin gelap menjadi cirinya, dan teks situasi menyebut "kukang".
- Gambar hewan di kandang bisa terkesan disakiti. Kukang digambar tenang, tanpa luka dan warna merah, dan tidak berdesakan.
- Bila `CREDITS.md`, `manifest.ts`, dan `kunci-aset.ts` tidak masuk bersama, "Jejak: uji" merah (percobaan 6, usulan 5).
- `build_jejak.py` di lingkungan Sesi C menulis ulang 31 PNG lama dengan pemampatan yang berbeda. ZIP hanya memuat berkas baru dan berkas yang isinya berubah, jadi PNG lama tidak ikut, seperti catatan 8 November.
- Galeri: setiap berkas teks baru diperiksa dengan `build:pages` (178 berkas identik byte).

## Gambar medan peta dan kotak P1 (PC-1 dan PC-2, v1.1)

Menjawab Permintaan PC-1 dan PC-2 di `PLAN.md`, entri "Rencana v1.1 — JS-21, JS-23, dan JS-18", bagian "Permintaan untuk Sesi C". Gerbang 1 rencana v1.1 (25 Nov 2026) memilih semua saran, jadi kedua permintaan sudah final, dan PC-3 tidak diperlukan (KT-18 a). PC-1 dibutuhkan Build JS-23 (peta bermedan), PC-2 dibutuhkan Build JS-18 (Teropong dan Angkot). Plan ditulis 25 November 2026 dalam mode ZIP dari ZIP `main` 25 Nov 2026.

### Rencana (templat AGENTS 12.1)

| | |
|---|---|
| Status | **PC-1 selesai; PC-2 Disetujui, masuk bersama Build JS-18** (26 Nov 2026). Plan disetujui 25 Nov 2026 (`Setuju: PC-1 dan PC-2`, semua saran a). G-01 sampai G-03 dan letak tujuh kotak Disetujui 26 Nov 2026 (`Setuju: G-01 sampai G-03, letak kotak`). Kredit dan kelompok `PETA` ditulis di penutup (`PC-1-penutup.zip`); `PC-2-kotak.zip` dilampirkan ke sesi Build JS-18 (KT-C34 a) |
| Memenuhi | PC-1: gambar medan untuk peta mini, peta besar, dan peta kelas (JFR-11 dan JFR-28; usulan 3a, 4a, dan 5a rencana v1.1). PC-2: kotak teropong dan karcis di `kampung.json` (PRD 8.5 dan 9; JFR-25) |
| Bergantung pada | Kit, lembar ubin, dan objek yang sudah Disetujui (kelompok U dan O1 sampai O4) serta peta JS-06. Gambar kotak dan ikonnya sudah Disetujui 6 Nov 2026 (T-07, T-08, I-04, dan I-05), jadi PC-2 tidak memerlukan aset baru |
| Berkas yang dibuat atau diubah | **PC-1:** `scripts/jejak-setara/peta/build_peta.py` (gambar medan, sidik di PNG, dan `--periksa`); `scripts/game/art/build_jejak.py` (daftar G-01 sampai G-03, pemeriksaan, lalu kredit dan kelompok `PETA` sesudah Disetujui); baru `app/jejak-setara/assets/peta/peta_medan_1.png`, `peta_medan_2.png`, dan `peta_medan_4.png`; `app/jejak-setara/peta/kampung_gambar.json` (hanya `sumber`, karena `build_peta.py` termasuk sidik sumber); baru `docs/jejak-setara/preview/peta_medan.png`; di giliran penutup `CREDITS.md` dan `manifest.ts`. **PC-2:** `scripts/jejak-setara/peta/objek.json` (tujuh kotak), `build_peta.py` (aturan kotak P1 dan warna kotak di pratinjau), `kampung.json` (daftar `kotak`), `kampung_gambar.json` (`sumber`), ketiga gambar medan (sidik baru, piksel sama), serta `preview/peta_periksa.png` dan `peta_denah.png`. **Keduanya:** berkas ini. Uji dan spesifikasi: KT-C33 |
| Migrasi D1 | Tidak ada |
| Pesan protokol baru atau berubah | Tidak ada |
| Aset yang dibutuhkan | Tiga PNG baru: G-01 `peta_medan_1.png`, G-02 `peta_medan_2.png`, dan G-03 `peta_medan_4.png` |
| Dependensi baru | Tidak ada. Python 3 dan Pillow seperti kit gambar; uji memakai Vitest yang sudah terpasang |
| Ukuran | M |

### Hasil percobaan

Dijalankan 25 November 2026 di luar repositori, pada salinan ZIP `main` dengan dependensi terpasang. Berkas repositori tidak diubah.

1. **Sumber gambar.** `build_peta.py` sudah menggambar dunia penuh 2.560 × 1.600 dari kedua berkas peta, `ubin_siang.png`, dan sprite objek, sama seperti layar pemain (`gambar_peta`, pratinjau `peta_siang.png`). Untuk medan, dunia itu digambar tanpa avatar contoh; gerbang lobi tetap `gerbang_buka`, dan kotak, titik, penanda, serta tulisan memang tidak pernah digambar di sana. `peta:build --periksa` pada salinan `main` lulus.
2. **Cara mengecilkan.** Dengan warna terbanyak per blok (cara percobaan 1 rencana v1.1), tajuk pohon dan semak berwarna `leaf`, sama dengan rumput, sehingga hilang. Di 1 px per ubin hanya 19 dari 106 pohon, 8 dari 36 kelapa, dan 0 dari 399 semak yang tampak; di 2 px per ubin 55 dari 106 pohon dan 0 semak. Dengan cara usulan KT-C32 a, ke-106 pohon, 36 kelapa, 7 pohon pisang, dan 399 semak tampak di ketiga ukuran.
3. **Ukuran dan warna** (cara usulan): `peta_medan_1.png` 1,8 KB (18 warna), `peta_medan_2.png` 4,0 KB (22 warna), dan `peta_medan_4.png` 10,1 KB (25 warna), bertiga 15,9 KB dari anggaran 32 KB. Semuanya PNG palet dengan warna palet 36 saja, tanpa transparansi. Menggambar ketiganya menambah sekitar 4 detik pada `peta:build` (sekarang sekitar 3 detik bersama pratinjau).
4. **Keterbacaan.** Jalan aspal (1.069 sel, satu jaringan), paving gang (tiga jaringan), dan tanah setapak (enam jaringan) tetap bersambung di ketiga ukuran: setiap sel yang tidak tertutup objek terhubung ke jaringannya lewat piksel berwarna jalan. Sel tanpa piksel jalan hanya ada di bawah tiga angkot yang parkir dan meja panitia. Laut, sungai, pantai, dan atap khas setiap zona terbaca di pratinjau awal. Zebra cross dan garis lapangan baru tampak utuh di 4 px per ubin; di 1 dan 2 px per ubin bobotnya kecil, agar jalan di peta mini tidak terpotong garis putih.
5. **Kotak PC-2.** Letak usulan di bawah lolos semua pemeriksaan `build_peta.py` dengan aturan kotak yang disesuaikan: 31 kotak, keterjangkauan, lebar jalan, dan ukuran (kedua berkas peta 13,7 KB gzip dari 60 KB). Objek, tabrakan, bahan, dan lapisan gambar sama persis dengan `main`, karena ruang 3 × 3 kotak baru tidak menyentuh objek sebaran; yang berubah hanya daftar `kotak` dan `sumber`.
6. **Uji yang terpengaruh.** Dengan peta 31 kotak, `test:jejak` gagal di 2 dari 1.377 uji: `peta-aturan` ("tiga kotak per zona …", berkas Sesi C) dan `skill-ruang` ("kampung.json: 24 kotak …", berkas Sesi A), sedangkan `test:jejak:server` lulus (70 uji). Dengan kelompok `PETA` di `manifest.ts` dan tiga baris kredit, `aset-manifest` gagal di 2 uji (pola impor dan "hanya aset Disetujui"). `bank-aset` dan `bank-aturan` tetap lulus, karena kunci aset hanya diambil dari `npc/` dan `obj/`, jadi `kunci-aset.ts` tidak berubah.
7. **Sidik.** Alur kerja "Jejak: uji" tidak memasang Python (D-6 JS-06), jadi sidik `sumber` yang sama dengan `kampung_gambar.json` ditulis di potongan teks setiap PNG medan (`tEXt`, kunci `sumber`). Uji TypeScript cukup membaca potongan itu, ukuran, dan palet PNG, tanpa membuka pikselnya.
8. **Galeri.** `build:pages` sebelum dan sesudah berkas ini diubah: ke-178 berkas `dist-pages/` identik byte.

### Cara membangun (usulan)

- `peta:build` membangun `kampung.json`, `kampung_gambar.json`, dan ketiga gambar medan sekaligus, dari sumber dan kit yang sama, dengan sidik yang sama. Ubin (x, y) tepat menempati piksel x·n sampai (x+1)·n − 1 dan y·n sampai (y+1)·n − 1.
- `assets:build:jejak` tidak menggambar ulang medan, tetapi memeriksa ketiganya (ukuran 160n × 100n, hanya warna palet, tanpa transparansi, anggaran 4, 8, dan 20 KB serta bertiga 32 KB, dan sidik sama dengan `kampung_gambar.json`), lalu mencatat kredit dan kelompok `PETA` sesudah Disetujui.
- Bila sumber peta berubah tanpa dibangun ulang, `peta:build --periksa` gagal (piksel atau sidik tidak sama), dan uji baru `peta-medan.test.ts` gagal di GitHub (sidik di PNG tidak sama dengan `kampung_gambar.json`, yang sidiknya sudah diperiksa `peta-berkas` terhadap kelima berkas sumber).
- PNG hanya ditulis bila isinya berubah (ukuran, palet, piksel, atau sidik), agar Pillow dengan pemampatan lain tidak membuat perubahan palsu di GitHub Desktop.
- Manifest di giliran penutup memakai contoh PC-1: `export const PETA = { medan1, medan2, medan4 } as const`, berisi URL. Bentuk akhirnya boleh disesuaikan di Plan lanjutan JS-23.

### Usulan letak kotak (PC-2)

| Kotak | Jenis | Sel (x, y) | Tempat |
|---|---|---|---|
| `k-z6-4` | teropong | (26, 7) | Z6 barat: pasir pantai di barat muara sungai |
| `k-z6-5` | teropong | (51, 7) | Z6 tengah: pasir pantai |
| `k-z6-6` | teropong | (76, 7) | Z6 timur: pasir pantai |
| `k-z3-4` | karcis | (57, 64) | Trotoar, 2 ubin di kanan titik `halte-1` (55, 64) |
| `k-z3-5` | karcis | (86, 88) | Trotoar, 2 ubin di kanan titik `halte-2` (84, 88) |
| `k-z7-4` | karcis | (107, 25) | Trotoar, 2 ubin di kanan titik `halte-3` (105, 25) |
| `k-z8-4` | karcis | (116, 75) | Trotoar, 2 ubin di bawah titik `halte-4` (116, 73) |

Aturan kotak yang diusulkan untuk `build_peta.py` dan `peta-aturan.test.ts`: kotak sepatu, kompas, dan buku tetap tiga per zona dengan isi PRD 8.5. Teropong tepat tiga, semuanya di Z6, dengan aturan kotak yang sama (sedikitnya 3 ubin dari titik kejadian dan 6 ubin dari kotak lain). Karcis tepat satu di dekat setiap halte, 1–3 ubin dari titik halte dan bukan di titik itu, di luar ruang 3 × 3 titik kejadian, dan sedikitnya 2 ubin dari kotak lain (aturan PC-2). Semua kotak berada di sel bebas yang bukan aspal atau air, tidak tertutup objek, di zonanya, di luar lobi, dan terjangkau. Letak usulan juga berjarak sedikitnya 3 ubin dari titik kejadian.

### Usulan (disetujui 25 November 2026: semua saran a)

Pemilik proyek membalas `Setuju: PC-1 dan PC-2` pada 25 November 2026, jadi KT-C32 a (denah berbobot), KT-C33 a (Sesi C mengubah tiga uji dan menulis catatan di spesifikasi JS-06), dan KT-C34 a (`PC-2-kotak.zip` masuk bersama Build JS-18) dipakai.

1. **Cara mengecilkan (KT-C32).**
   - (a, saran) Denah berbobot. Untuk setiap blok n × n piksel, warna yang menang adalah warna terbanyak dengan bobot: piksel objek dua kali piksel tanah, garis luar `ink` sekali; detail acak (bunga, kerikil, retakan, dan batu kecil) tidak dihitung; marka (zebra dan garis lapangan) berbobot kecil di 1 dan 2 px per ubin dan penuh di 4 px per ubin; bayangan ikut bila mengisi separuh blok. Piksel objek yang sewarna dengan tanah di bawahnya memakai warna terbanyak berikutnya di sprite itu (selain `ink`). Untuk tajuk pohon dan semak di atas rumput warnanya `grass`, sehingga pohon tampak sebagai gumpal hijau tua.
   - (b) Warna terbanyak per blok, tanpa bobot: sederhana, tetapi kebanyakan pohon dan semua semak hilang di peta mini (percobaan 2).
2. **Uji dan spesifikasi yang ikut berubah (KT-C33).** Tanpa perubahan uji, "Jejak: uji" merah begitu kotak baru atau kelompok `PETA` masuk (percobaan 6).
   - (a, saran) Izinkan Sesi C mengubah tiga uji berawalan `peta-` dan `aset-` yang dulu ditulis Sesi C (izin 7, 8, dan 21 Nov 2026), dan menambah catatan di spesifikasi JS-06: `peta-medan.test.ts` (baru: sidik, ukuran, warna palet, dan anggaran gambar medan), `peta-aturan.test.ts` (aturan kotak teropong dan karcis), `aset-manifest.test.ts` (folder `peta/` dan kelompok `PETA`, di giliran penutup), serta bagian "Perubahan sesudah JS-06" di `specs/JS-06-peta.md`.
   - (b) Semuanya ditulis sebagai Permintaan untuk Sesi A, lalu ZIP kedua sesi di-commit bersama.
3. **Kapan PC-2 masuk `main` (KT-C34).** Peta 31 kotak membuat uji Sesi A `skill-ruang` gagal (percobaan 6).
   - (a, saran) `PC-2-kotak.zip` diserahkan terpisah dan **tidak di-commit sendiri**. Pemilik proyek melampirkannya ke sesi Build JS-18, lalu Sesi A memasukkan isinya ke commit JS-18 bersama perubahan ujinya (Permintaan C-19). Kotak baru masuk `main` bersamaan dengan kode yang memakainya.
   - (b) Sesi A lebih dulu mengubah uji `skill-ruang` (ZIP kecil), lalu `PC-2-kotak.zip` di-commit sendiri.
   - (c) Pemilik proyek mengizinkan Sesi C mengubah uji Sesi A itu sekali, lalu `PC-2-kotak.zip` langsung di-commit. Lebih cepat, tetapi kotak baru masuk `main` saat Sesi A masih mengerjakan JS-21, dan uji ujung ke ujung `skill.uji.ts` yang memakai `kampung.kotak` belum diperiksa.

### Urutan pengerjaan

| Giliran | Isi | ZIP | Balasan |
|---|---|---|---|
| Plan (disetujui 25 Nov 2026) | Bagian ini, status C-14, C-15, C-16, dan C-18, serta pratinjau awal `peta_medan_2.png` di balasan | `PC-1-2-plan.zip`, di-commit | `Setuju: PC-1 dan PC-2`, atau dengan alternatif, misalnya `Setuju: PC-1 dan PC-2, KT-C34 b` |
| 1. Gambar dan letak (disetujui 26 Nov 2026) | PC-1: kode, G-01 sampai G-03 (Ditinjau saat diserahkan), `peta-medan.test.ts`, dan `preview/peta_medan.png` (ketiga gambar diperbesar, tiruan peta mini 112 × 75 px pada rasio 1 dan 2,625, peta besar 3 px per ubin, dan peta kelas 1024 × 768). PC-2: tujuh kotak, aturan, `peta-aturan.test.ts`, dan gambar letak kotak di balasan | `PC-1-gambar.zip` di-commit (uji tetap hijau, karena kredit dan manifest belum berubah); `PC-2-kotak.zip` disimpan dulu (KT-C34 a) | `Setuju: G-01 sampai G-03, letak kotak`, atau perbaikan, misalnya "teropong barat pindah ke dekat jembatan" |
| 2. Penutup (diserahkan 26 Nov 2026) | G-01 sampai G-03 masuk `CREDITS.md` dan `PETA` di `manifest.ts`; `aset-manifest.test.ts` diperluas; status Disetujui; Permintaan C-19 dan C-20 diajukan | `PC-1-penutup.zip`, di-commit; syarat PC-1 untuk JS-23 terpenuhi | — |
| Build JS-18 (Sesi A) | Isi `PC-2-kotak.zip` masuk commit JS-18 bersama uji Sesi A (C-19) | Bagian dari ZIP JS-18 | — |

### G. Gambar medan

| ID | Berkas | Ukuran | Isi | Status |
|---|---|---|---|---|
| G-01 | `peta/peta_medan_1.png` | 160 × 100 (1 px per ubin) | Kampung masa siang untuk peta mini di layar berasio di bawah 2: 18 warna, 1,8 KB | Disetujui (26 Nov 2026) |
| G-02 | `peta/peta_medan_2.png` | 320 × 200 (2 px per ubin) | Peta mini di layar berasio 2 ke atas: 22 warna, 4,0 KB | Disetujui (26 Nov 2026) |
| G-03 | `peta/peta_medan_4.png` | 640 × 400 (4 px per ubin) | Peta besar dan peta kelas; zebra cross dan garis lapangan tampak: 25 warna, 9,9 KB | Disetujui (26 Nov 2026) |
| — | Letak tujuh kotak P1 di `objek.json` dan `kampung.json` | — | Tabel "Usulan letak kotak (PC-2)" di atas | Disetujui (26 Nov 2026); masuk `main` bersama Build JS-18 lewat `PC-2-kotak.zip` |

### Rincian giliran gambar dan letak (26 November 2026)

| | |
|---|---|
| Kode PC-1 | `build_peta.py`: bagian baru "gambar medan" (`bangun_medan`, lapisan dunia, pewarnaan tajuk, suara berbobot, PNG bersidik, `medan_sama`, dan pemeriksaan jalan), galat 12 dan 13, `--periksa` untuk gambar medan, ringkasan keluaran, dan pratinjau `peta_medan.png` (spesifikasi JS-06 P-32 sampai P-36). `build_jejak.py`: daftar `MEDAN` (G-01 sampai G-03), `periksa_medan`, serta kredit dan kelompok `PETA` yang baru ditulis bila `DISETUJUI_PETA` diisi (kosong di giliran ini, diisi di penutup) |
| Kode PC-2 | `objek.json` (tujuh kotak), `build_peta.py` (galat 7 untuk teropong dan karcis, warna kotak P1 di `peta_periksa.png` dan `peta_denah.png`), dan `peta-aturan.test.ts` (dua uji baru) |
| Pemeriksaan `build_peta.py` | Lulus di kedua keadaan. Ke-548 pohon, kelapa, pisang, dan semak tampak di ketiga ukuran; jalan aspal, paving, dan tanah setapak bersambung. Dua kali dibangun dengan hasil sama byte; `--periksa` lulus, dan gagal bila satu piksel gambar medan diubah atau `kampung.txt` diubah tanpa dibangun ulang. Untuk PC-2, dua letak rusak (karcis jauh dari halte, teropong 4 ubin dari kotak sepatu) ditolak dengan pesan yang menyebut kotaknya. Bangun penuh bersama pratinjau sekitar 9,5 detik |
| Pemeriksaan `build_jejak.py` | Lulus (dijalankan ke folder sementara): G-01 sampai G-03 berukuran sesuai, PNG palet tanpa transparansi, warna palet saja, sidik sama, dan dalam anggaran. `CREDITS.md` dan `manifest.ts` sama byte dengan `main`; ke-246 PNG sama piksel (31 hanya berbeda pemampatan dan tidak ikut ZIP). Aset layar pemain 222,2 KB menurut `build_jejak.py` |
| Uji PC-1 | `content:check:jejak` 13 berkas, 392 uji; `test:jejak` 91 berkas, 1.383 uji; `test:jejak:server` 13 berkas, 70 uji; `tsc --noEmit` dan ESLint (berkas uji baru) tanpa masalah; `build:jejak` lulus; `anggaran.mjs` sama dengan `main` (kode layar pemain 140,52 KB, aset 233,46 KB), karena manifest belum memuat gambar medan. Delapan salinan rusak ditolak `peta-medan.test.ts`: warna di luar palet, transparansi, ukuran salah, sidik lama, tanpa sidik, PNG RGB, sumber berubah tanpa dibangun ulang, dan berkas kebesaran |
| Uji PC-2 | `content:check:jejak` 13 berkas, 394 uji. `test:jejak` 1 dari 1.385 uji gagal, sesuai percobaan 6: `skill-ruang` ("24 kotak", berkas Sesi A, Permintaan C-19). Di salinan terpisah, uji itu lulus begitu dua barisnya diubah menjadi 31 kotak (9 sepatu, 6 kompas, 9 buku, 3 teropong, 4 karcis). `test:jejak:server` 70 uji lulus; `tsc` dan ESLint tanpa masalah; `build:jejak` lulus, kode layar pemain 140,58 KB (+0,06 KB, karena daftar kotak ikut kode) dan kedua berkas peta 13,55 KB gzip. Sembilan salinan rusak ditolak `peta-aturan.test.ts`: teropong di luar Z6, empat teropong, teropong terlalu dekat kotak sepatu, karcis jauh dari halte, karcis di titik halte, karcis di aspal, karcis di ruang 3 × 3 titik kejadian, karcis hilang, dan dua karcis di satu halte |
| Pratinjau | `preview/peta_medan.png` (baru, PC-1); `peta_periksa.png` dan `peta_denah.png` (PC-2, menandai teropong `dusk` dan karcis `sun`). Pratinjau lain sama piksel dan tidak ikut ZIP. Gambar letak kotak dikirim di balasan, tidak disimpan |
| ZIP | `PC-1-gambar.zip` (di-commit sekarang): `build_peta.py`, `build_jejak.py`, ketiga gambar medan, `kampung_gambar.json` (`sumber`), `peta-medan.test.ts`, `specs/JS-06-peta.md`, `preview/peta_medan.png`, dan berkas ini. `PC-2-kotak.zip` (disimpan untuk Build JS-18): `objek.json`, `build_peta.py`, `kampung.json`, `kampung_gambar.json`, ketiga gambar medan bersidik baru (piksel sama), `peta-aturan.test.ts`, `specs/JS-06-peta.md`, `peta_periksa.png`, dan `peta_denah.png` |

- **Perubahan dari rencana:** warna tanah di bawah objek diambil dari lapisan tanah saja, tanpa marka dan bayangan, sehingga `peta_medan_4.png` 9,9 KB (percobaan Plan 10,1 KB). Bobot ditulis sebagai bilangan bulat (tanah 4, objek 8, `ink` objek 4), dengan perbandingan sama seperti usulan KT-C32 a.
- **Sidik.** Setiap perubahan `build_peta.py` mengubah sidik, jadi baris `sumber` di `kampung_gambar.json` dan ketiga gambar medan ikut berubah, walaupun pikselnya sama. Karena itu `PC-2-kotak.zip` memuat ketiga gambar lagi.
- **`PC-2-kotak.zip` jangan di-commit sendiri** (KT-C34 a): `skill-ruang` akan gagal. Isinya disalin sesudah `PC-1-gambar.zip` dan `PC-1-penutup.zip`. Bila sumber peta berubah sebelum Build JS-18, Sesi C membangun ulang ZIP itu.

### Penutup (26 November 2026)

| | |
|---|---|
| Kode | Hanya `DISETUJUI_PETA` di `build_jejak.py` yang diisi (ketiga gambar medan, tanggal 26 November 2026). Gambar medan, sumber peta, dan pratinjau tidak berubah, jadi `PC-2-kotak.zip` tetap berlaku tanpa dibangun ulang |
| Kredit | `CREDITS.md` mendapat bagian "Gambar medan peta (`peta/`)" dengan 3 baris: `peta/peta_medan_1.png` (G-01), `peta/peta_medan_2.png` (G-02), dan `peta/peta_medan_4.png` (G-03), dengan atribusi "Digambar dengan kode (kit Sehari Setara) oleh Claude, disetujui YAN, 26 November 2026". Jumlahnya kini 257 aset (246 gambar dan 11 suara) |
| Manifest | 246 gambar. Kelompok baru `PETA = { medan1, medan2, medan4 }` berisi URL ketiga gambar medan, diimpor dari folder `peta/`. Bagian lain tidak berubah |
| Uji | `content:check:jejak` 13 berkas, 393 uji; `test:jejak` 91 berkas, 1.384 uji; `test:jejak:server` 13 berkas, 70 uji; `tsc --noEmit` dan ESLint tanpa masalah. Di `aset-manifest.test.ts`, pola impor dan daftar URL kini memuat folder `peta/`, ditambah uji "PETA" (kunci `medan1`, `medan2`, dan `medan4`; berkas `peta/peta_medan_{n}.png`; ukuran peta kampung kali n). Enam salinan rusak ditolak: `PETA` tanpa `medan2`, `medan1` menunjuk berkas G-02, kredit `peta_medan_4.png` hilang, kredit G-02 tanpa kata disetujui, impor dari luar folder aset, dan kunci tambahan `medan8` |
| Build | `build:jejak` lulus: ketiga gambar medan menjadi berkas berhash di `dist-jejak/client/assets/`, tanpa data URI. Kode layar pemain belum memakai `PETA`, jadi `anggaran.mjs` sama dengan sebelumnya (kode layar pemain 140,52 KB, aset 233,46 KB); sesudah JS-23 aset layar pemain bertambah paling banyak 15,6 KB |
| Galeri | `build:pages` 178 berkas identik byte |
| Bersama PC-2 | Di salinan terpisah, isi `PC-2-kotak.zip` disalin sesudah penutup: `build_jejak.py` menghasilkan `CREDITS.md` dan `manifest.ts` yang sama byte, `peta:build --periksa` lulus, `content:check:jejak` 395 uji lulus, dan `test:jejak` hanya gagal di `skill-ruang` (1 dari 1.386 uji, Permintaan C-19), sesuai rencana |
| Commit | `PC-1-penutup.zip` di-commit sendiri; "Jejak: uji" tetap hijau. Sesudah di-push, syarat PC-1 untuk JS-23 (Sesi A) terpenuhi; JS-23 juga menunggu JS-21 Selesai. `PC-2-kotak.zip` tetap tidak di-commit sendiri (KT-C34 a) |

- Untuk JS-23 (pemakaian menurut tabel G; bentuk akhirnya ditetapkan Plan lanjutan JS-23): `PETA.medan1` dan `PETA.medan2` untuk peta mini (layar berasio di bawah 2 dan 2 ke atas), `PETA.medan4` untuk peta besar; layar kelas tidak memakai manifest, jadi mengimpor `peta_medan_4.png` langsung (P-35 JS-10). Ubin (x, y) menempati piksel x·n sampai (x+1)·n − 1 (P-32).

### Risiko

- "Jejak: uji" merah bila kotak baru masuk tanpa perubahan uji Sesi A, atau `PETA` tanpa perubahan `aset-manifest` (percobaan 6, KT-C33, dan KT-C34).
- `PC-2-kotak.zip` memuat `build_peta.py`, kedua berkas peta, dan gambar medan bersidik baru, jadi isinya disalin sesudah `PC-1-gambar.zip` dan `PC-1-penutup.zip`. Bila sumber peta berubah lagi sebelum JS-18, Sesi C membangun ulang ZIP itu.
- Gambar medan tertinggal saat sumber peta berubah: ditangkap `peta:build --periksa` dan `peta-medan.test.ts`.
- Peta mini di laptop berasio 1 (0,7 px per ubin) membuang sebagian piksel `peta_medan_1.png`; jalan 2 ubin tetap sedikitnya 1 px. Diperiksa di tiruan peta mini dan tangkapan layar JS-23.
- Galeri: setiap berkas teks baru diperiksa dengan `build:pages` (178 berkas identik byte).

## Catatan teknis untuk Sesi A

- **Tokoh:** bingkai 16 × 24 dengan titik kaki di x 8, y 21 (baris tepat di bawah sepatu). Strip mendatar, bingkai berurutan dari kiri. Arah kiri dicerminkan dari arah kanan.
- **Tas:** warna kunci `sun` dan `mango` diganti serentak saat memuat (tabel "Warna tas").
- **Objek dua bagian:** `obj_{nama}.png` dan `obj_{nama}_atas.png` berasal dari satu gambar yang dipotong di satu baris. Keduanya digambar di titik yang sama, dengan bagian atas tepat di atas bagian bawah.
- **Bayangan objek:** berupa ubin tumpang lapisan 10 di lembar ubin (usulan 4). Letaknya dihitung `build_peta.py`, jadi antarmuka tidak menggambar bayangan objek sendiri.
- **Lembar ubin:** nomor ubin = baris × 16 + kolom. Ubin lapisan 0 selalu penuh; ubin tumpang berlatar transparan. `kampung.json` (JS-06) memuat nomor ubin per lapisan (tanah, tumpang, bayangan), jadi antarmuka cukup menyalin potongan 16 × 16 dari lembar masa yang aktif. Saat masa berganti, hanya lembar yang ditukar.
- **Siluet pemain:** pemain sendiri di belakang objek atas sebaiknya bergaris ganda (Permintaan C-4).
- **Manifest:** semua gambar dimuat lewat `app/jejak-setara/assets/manifest.ts` (bagian "Manifest aset"). `lebar` dan `tinggi` di setiap `Gambar` adalah ukuran satu bingkai, jadi bingkai ke-i berada di x = i × `lebar` pada strip mendatar.
- **Berkas berhash:** sejak Build JS-07 (Permintaan C-13), semua berkas di `app/jejak-setara/assets/`, termasuk WAV di `sfx/` nanti, menjadi berkas berhash, bukan data URI.
- **Suara (untuk Plan JS-14):** rencana efek suara ada di bagian "Efek suara". Titik pemicu `sfx_kotak` dan `sfx_skill` sudah ditetapkan di Specify JS-09 (catatan Plan JS-14 di `PLAN.md`). Layar kelas mengimpor WAV langsung dari berkasnya, karena tidak boleh mengimpor `manifest.ts` (P-35 JS-10). Semua efek mulai dan berakhir di sampel 0, jadi bisa diputar dan dihentikan tanpa bunyi letup. Tik `sfx_hitung` jauh lebih pendek dari 1 detik, jadi tiga tik hitung mundur tidak bertumpuk. KT-C23 (a) dipakai: keras-pelan sudah seimbang di berkasnya, sehingga satu `GainNode` 60% seperti Sehari Setara sudah cukup. `manifest.ts` memuat kelompok `SUARA` (S-01 sampai S-08, klik, dan teks) dan tipe `NamaSuara`; `musik_kelas.wav` (M-01) diimpor langsung oleh layar kelas di JS-21.
- **Aset tambahan (K-32, K-33):** prasasti (`obj_prasasti`, dua bagian, jejak kaki 2 × 2 ubin) dan kandang kukang (`obj_kandang_kukang`, 1 × 1) ada di `atas_tambahan.py`, sedangkan penjual (`npc_penjual_bawah_diam`, dewasa, titik kaki (8, 23)) ada di `atas_tokoh.py`. `build_jejak.py` menggabungkan objek tambahan ke daftar objeknya, dan sejak penutup 22 Nov 2026 ketiganya ada di `OBJEK` dan `NPC` di `manifest.ts` dengan bentuk yang sama seperti aset lain; `build_peta.py` dan sidik sumber peta tidak terpengaruh. Kuncinya ada di `kunci-aset.ts` sejak perbaikan 23 Nov 2026 (A-17 dan C-17 selesai). Bila Sesi C kelak menambah aset tokoh atau properti lagi, `CREDITS.md`, `manifest.ts`, dan `kunci-aset.ts` tetap harus masuk dalam satu commit.

## Permintaan untuk Sesi A

| Kode | Berkas | Permintaan | Alasan | Status |
|---|---|---|---|---|
| C-1 | `docs/jejak-setara/PRD.md` bagian 15 | Ubah "empat masa (pagi, siang, sore, malam)" menjadi "tiga masa (pagi, siang, sore)" | Design System bagian 4 dan instruksi pemilik proyek memakai tiga masa (usulan 3) | Diterapkan: PRD 15 (`JS-03-dokumen-bc.zip`, 7 Nov 2026; tanggapan Sesi A di Plan JS-07) |
| C-2 | `docs/jejak-setara/Design_System.md` bagian 4 | Tambahkan: hanya lembar ubin yang berganti per masa; bayangan objek berupa ubin tumpang lapisan 10; objek, tokoh, dan ikon satu berkas untuk semua masa. Tambahkan juga baris bahan baru yang disetujui: tanah setapak (`skin-2`, kerikil `wood`), paving gang (bata `wood`, nat `wood-d`), semen (`mist`, tepi `slate`), dan pinggir aspal (bayangan kerb `dusk`, garis tepi = marka); semuanya tidak berganti per masa | Usulan 4 dan kelompok U (tabel "Bahan per masa" di bagian U) | Diterapkan: Design System 4 (`JS-03-dokumen-bc.zip`, 7 Nov 2026) |
| C-3 | `docs/jejak-setara/Design_System.md` bagian 8 dan `Architecture.md` bagian 9 | Catat warna kunci tas `sun` dan `mango`, tabel delapan pasangan warna, dan penggantian serentak saat memuat | Usulan 5 | Diterapkan: Design System 8 dan Architecture 9 (`JS-03-dokumen-bc.zip`, 7 Nov 2026) |
| C-4 | `docs/jejak-setara/Design_System.md` bagian 7 (lapisan 60) | Siluet pemain sendiri bergaris ganda: garis dalam `ink` 1 piksel, lalu garis luar `sun` 1 piksel | Garis `sun` saja 1,0–2,9 : 1 di enam dari tujuh warna atap (percobaan 4); dengan garis ganda salah satu garis selalu ≥ 3 : 1 | Diterapkan: Design System 7, lapisan 60 (`JS-03-dokumen-bc.zip`, 7 Nov 2026) |
| C-5 | `docs/jejak-setara/Design_System.md` bagian 14 (penamaan) | Tambahkan pola `obj_{nama}_atas.png`, `ikon_ava_{n}.png`, `tanda_debu.png`, dan `tanda_kilau.png`; arah tokoh `bawah`, `atas`, dan `kanan`; tanpa berkas arah kiri | Usulan 6 dan 7 | Diterapkan: Design System 14 (`JS-03-dokumen-bc.zip`, 7 Nov 2026) |
| C-7 | `docs/jejak-setara/PRD.md` JFR-09, `Design_System.md` bagian 3.2, dan `Architecture.md` bagian 9 dan 11.3 | Ubah ukuran peta menjadi sekitar 160 × 100 ubin (2.560 × 1.600 piksel logis, sekitar 8 × 9 layar). Periksa anggaran peta JSON (≤ 60 KB setelah gzip) dan jumlah potongan 256 × 256 per masa (sekitar 70) | Keputusan pemilik proyek 6 Nov 2026 (bagian "Keputusan ukuran peta") | Diterapkan: PRD JFR-09, Design System 3.2, Architecture 9, 11.1, dan 11.3 (`JS-03-dokumen-bc.zip`, 7 Nov 2026). Sesi A mengukur di Plan JS-07: 5 sampai 9 potongan di sekitar kamera, sekitar 4,7 MB untuk dua lapis |
| C-8 | `docs/jejak-setara/PRD.md` bagian 8.3 dan 12, `Architecture.md` bagian 13 | Nilai kapasitas sampai 100 pemain per ruang (sekarang 50) dan jumlah kejadian per ronde yang lebih banyak. Peta 160 × 100 menyediakan titik untuk sekitar 48 kejadian. Gagasan untuk dinilai: satu kejadian muncul di dua titik sekaligus agar pemain tidak menumpuk | Pemilik proyek memperkirakan 50–100 pemain dan pertanyaan yang banyak serta bervariasi | Diterapkan. Diputuskan di Gerbang 1 JS-03 (usulan 11a): bawaan 40, paling banyak 100 pemain; dua titik aktif per kejadian di ruang lebih dari 50 pemain (dibangun di JS-08); Paket inti 16 untuk rilis 1.0. Sudah ada di Architecture 5.1 dan 13.1 serta protokol (`pemainMaks` 100). Sisa di PRD JFR-01, 8.3, 12, dan 21 (temuan Sesi C 8 Nov 2026) diterapkan Sesi A di ZIP Gerbang 1 JS-08 (9 Nov 2026; `PLAN.md`, entri JS-08, bagian "Tanggapan permintaan Sesi B dan C") |
| C-6 | `docs/jejak-setara/Architecture.md` bagian 11.2 | Sepakati bentuk `manifest.ts`: kunci, ukuran dan jumlah bingkai, titik kaki, pasangan bagian atas objek, dan nomor ubin. Usul Sesi C: manifest dibuat otomatis oleh `build_jejak.py` | Usulan 10 | Selesai 8 Nov 2026: bentuk disetujui di Gerbang 1 JS-03 dan dirinci di usulan 11a JS-07 (Architecture 11.2); `manifest.ts` dibuat `build_jejak.py` dan diperiksa `aset-manifest.test.ts` (bagian "Manifest aset") |
| C-9 | `docs/jejak-setara/Architecture.md` bagian 3, 11.1, 11.1.1, dan 11.3 | Catat berkas kedua `app/jejak-setara/peta/kampung_gambar.json` (daftar nomor ubin yang dipakai, lalu lapisan tanah, tumpang, dan bayangan berisi nomor urut dalam daftar itu, dalam RLE yang sama dan dibaca `uraiRle`); arti lapisan `ubin` di `kampung.json` (kode bahan 0 sampai 7: rumput, tanah, paving, semen, pasir, aspal, air, air dalam); anggaran 60 KB gzip untuk kedua berkas bersama; dan daftar uji peta (12 titik per zona, lebar jalan 2 ubin, keterlihatan penanda) | Bentuk JS-02 hanya memuat nilai 0 sampai 63 dalam satu lapisan, sedangkan lembar ubin berisi 377 nomor dalam tiga lapisan (bagian JS-06, percobaan 1 dan 2) | Diterapkan: Architecture 3, 11.1, 11.1.1, dan 11.3 (ZIP Gerbang 1 JS-07, 8 Nov 2026); rincian bentuk di `specs/JS-06-peta.md` P-20 sampai P-24 |
| C-10 | `docs/jejak-setara/Architecture.md` bagian 7 dan 8.2 (dan spesifikasi JS-03 atau JS-07) | Selama status `lobi`, pemain boleh bergerak di halaman lobi, sel `gerbangLobi` diperlakukan padat oleh server dan layar pemain, dan gerbang digambar `obj_gerbang_tutup`; sesudah ronde dimulai digambar `obj_gerbang_buka`. Posisi awal pemain diambil dari `titikMuncul` | `periksaGerak` JS-02 menolak gerak di luar status `main`, sedangkan JFR-05 meminta pemain bisa berjalan di halaman lobi | Diterapkan di dokumen: Architecture 7 dan 8.2, bersama spesifikasi JS-07 (rincian usulan 6 JS-07, disetujui 8 Nov 2026). Kodenya dibangun di Build JS-07 |
| C-11 | `docs/jejak-setara/Design_System.md` bagian 7 (aturan peta 3) | Ubah menjadi "Dari titik mana pun, sedikitnya satu bangunan atau objek khas zona terlihat di layar", dengan daftar objek khas per zona dari JS-06 | Dengan tabel bangunan penanda saja, hanya 57,4% posisi di prototipe 160 × 100 yang memenuhi (bagian JS-06, percobaan 7) | Diterapkan: Design System 7 aturan 3 (ZIP Gerbang 1 JS-07, 8 Nov 2026); daftar objek penanda di `specs/JS-06-peta.md` P-14 |
| C-12 | `docs/jejak-setara/PLAN.md`, tabel status fitur | Ubah baris JS-06 menjadi "Selesai (8 Nov 2026)" dengan tautan `specs/JS-06-peta.md` dan `tests/JS-06-hasil.md` | JS-06 selesai di Sesi C, dan statusnya baru tercatat di berkas ini | Diterapkan: tabel status `PLAN.md` (ZIP Gerbang 1 JS-07, 8 Nov 2026) |
| C-13 | `vite.jejak.config.ts` | Tambahkan `build.assetsInlineLimit` yang mengembalikan `false` untuk berkas di `app/jejak-setara/assets/`, seperti `vite.pages.config.ts` untuk Sehari Setara, sehingga setiap PNG yang diimpor `manifest.ts` menjadi berkas berhash | Architecture 11.2 menulis "Aset selalu menjadi berkas berhash, bukan data URI", tetapi `vite.jejak.config.ts` belum mengatur `assetsInlineLimit`, sehingga Vite memakai batas bawaannya, 4 KB. Begitu layar pemain mengimpor manifest, sampai 236 dari 239 PNG (semua kecuali tiga lembar ubin, bila semua kelompok dipakai) diselipkan ke kode sebagai data URI: sekitar 116 KB teks atau 71 KB gzip, dari anggaran kode layar pemain 200 KB gzip (Architecture 11.3). Diukur Sesi C dengan esbuild, 8 Nov 2026. Ikon avatar di `pemain/avatar.ts` (JS-03) sudah terkena aturan yang sama | Diterapkan: `vite.jejak.config.ts` (Build JS-07, 9 Nov 2026; tanggapan Sesi A di `PLAN.md`, bagian "Tanggapan permintaan (Build JS-07, 9 Nov 2026)"). Diperiksa Sesi C 21 Nov 2026: `assetsInlineLimit` mengembalikan `false` untuk semua berkas di `app/jejak-setara/assets/`, termasuk WAV di `sfx/` |
| C-14 | `docs/jejak-setara/Design_System.md` bagian 12, 14, dan 15; `Architecture.md` bagian 11.3 | Catat format efek suara (WAV PCM mono 16 bit 22.050 Hz; efek pendek paling lama 0,65 detik dan paling besar 30 KB), aturan volume (KT-C23 a: puncak paling tinggi −3 dBFS dan keras terdengar diseimbangkan, sekitar −18 LUFS untuk kejadian, kotak, skill, dan tepat; −21 LUFS untuk lembut dan hitung; −23 LUFS untuk peringatan; −16 LUFS untuk jingle akhir), pengecualian ukuran jingle akhir (KT-C22 a: paling besar 160 KB, hanya dimuat layar kelas), kit suara di `scripts/game/suara/` (KT-C20 a), dan kalimat kredit layar "Tentang": "Efek suara dibuat dengan kode oleh Claude (Anthropic) berdasarkan arahan dan persetujuan YAN." | Bagian "Efek suara" (percobaan 3 dan 4; usulan disetujui 21 Nov 2026) | Diterapkan: Design System 12, 14, dan 15 serta Architecture 3 dan 11.3 (ZIP Gerbang 1 JS-13, 21 Nov 2026; tanggapan Sesi A di `PLAN.md`, Plan JS-13) |
| C-15 | `docs/jejak-setara/Architecture.md` bagian 11.2; `AGENTS.md` bagian 6 dan 9 | Bentuk kelompok `SUARA` di `manifest.ts` (KT-C24 a): kunci `kejadian`, `kotak`, `skill`, `tepat`, `lembut`, `hitung`, `peringatan`, `akhir`, `klik`, dan `teks` (klik dan teks berupa salinan identik dari Sehari Setara, KT-C25 a), berisi URL berkas, hanya untuk efek Disetujui; layar kelas mengimpor WAV langsung (P-35 JS-10). `assets:build:jejak` juga membangun efek suara. Format kredit efek suara: "Dibuat dengan kode oleh Claude, disetujui [nama], [tanggal]" | Bagian "Efek suara" (usulan 1, 5, dan 6) | Diterapkan: Architecture 11.2 serta AGENTS 6 dan 9, AGENTS versi 0.7 (ZIP Gerbang 1 JS-13, 21 Nov 2026; tanggapan Sesi A di `PLAN.md`, Plan JS-13) |
| C-16 | `docs/jejak-setara/Design_System.md` bagian 12 dan 14; `Architecture.md` bagian 11.3; catatan JS-21 di `PLAN.md` | Catat musik latar layar kelas M-01: berkas `sfx/musik_kelas.wav` (pola nama baru `musik_{nama}.wav`), WAV PCM mono 16 bit 11.025 Hz, 38,4 detik yang berulang mulus, paling besar 1 MB, hanya dimuat layar kelas, sekitar −24 LUFS. Musik berhenti saat jeda, hitung mundur, dan jingle akhir, dan layar kelas mengimpor berkasnya langsung (P-35 JS-10) | Bagian "Efek suara" (KT-C26 a; rincian giliran 2) | Diterapkan: Design System 12 dan 14, Architecture 11.3, dan catatan JS-21 di `PLAN.md` (ZIP Gerbang 1 JS-13, 21 Nov 2026). Kini dipakai rencana rinci JS-21 (rencana v1.1) |
| C-17 | `app/jejak-setara/inti/konten/kunci-aset.ts` (Permintaan A-17 dari Sesi B) | Kerjakan A-17 hanya di `kunci-aset.ts`: tambahkan `npc_penjual_bawah_diam`, `obj_kandang_kukang`, dan `obj_prasasti` ke `KUNCI_ASET_DISETUJUI`, menurut urutan abjad daftar itu. Ketiga aset Disetujui 22 Nov 2026. `manifest.ts` tidak disunting manual, karena isinya sudah ditulis `build_jejak.py` di ZIP penutup aset tambahan (`aset-tambahan-penutup.zip`). Kerjakan dengan ZIP penutup itu terlampir; ZIP A-17 dan ZIP penutup di-commit bersama | Uji "hanya aset Disetujui" (`aset-manifest`) dan "daftar kunci aset server sama dengan berkas aset dan kredit Disetujui" (`aturan-bank`) saling mengunci (bagian "Aset tambahan untuk naskah tambahan", percobaan 6 dan penutup) | **Selesai** (23 Nov 2026): commit 409ceab masuk tanpa A-17, jadi ketiga kunci ditambahkan Sesi C atas permintaan pemilik proyek (bagian "Aset tambahan untuk naskah tambahan", perbaikan). Sesi A tidak perlu mengerjakan A-17 lagi |
| C-18 | `docs/jejak-setara/Design_System.md` bagian 14 (tabel "Kit gambar") | Tambahkan baris `atas_tambahan.py`: properti tambahan untuk set kejadian (O-52 prasasti dan O-53 kandang kukang), terpisah dari `atas_objek.py` karena `atas_objek.py` termasuk sidik sumber peta (JS-06 P-23); `build_jejak.py` menggabungkannya ke daftar objek. Di baris `atas_tokoh.py`, tambahkan "tokoh aset tambahan (penjual kukang N-21)" | Berkas kit baru (bagian "Aset tambahan untuk naskah tambahan", rincian giliran gambar) | Diterapkan: Design System 14, tabel "Kit gambar", termasuk penjual kukang N-21 di baris `atas_tokoh.py` (ZIP Gerbang 1 JS-15, 23 Nov 2026; tanggapan Sesi A di `PLAN.md`, Plan JS-15) |
| C-19 | `app/jejak-setara/__tests__/skill/skill-ruang.test.ts`; periksa juga `e2e/jejak-setara/skill.uji.ts`, `KOTAK_MENUNGGU_MAKS` di `server/jejak-setara/src/ruang/skill-ruang.ts`, dan komentar "ke-24 kotak" di `peta-kampung.ts` dan `pemain/dunia/petaKampung.ts` | Di Build JS-18, dalam commit yang sama dengan `PC-2-kotak.zip` Sesi C: ubah uji "kampung.json: 24 kotak …" menjadi 31 kotak (9 sepatu, 6 kompas, 9 buku, 3 teropong, 4 karcis). Uji ujung ke ujung yang memakai `kampung.kotak` (misalnya hitungan kotak tampak di ruang tanpa Petunjuk) perlu menyaring kotak yang skillnya tidak aktif | Bagian "Gambar medan peta dan kotak P1", percobaan 6: dengan 31 kotak, uji itu (dan `peta-aturan` Sesi C) gagal; `test:jejak:server` lulus. Mengikuti KT-C34 a | **Diajukan** (26 Nov 2026; letak kotak Disetujui). Dikerjakan di Build JS-18 dengan `PC-2-kotak.zip` terlampir |
| C-20 | `docs/jejak-setara/Design_System.md` bagian 14; `Architecture.md` bagian 3, 11.2, dan 11.3 | Catat gambar medan: folder `app/jejak-setara/assets/peta/`, pola nama `peta_medan_{n}.png` (n piksel per ubin), dibangun `peta:build` dari sumber peta dengan sidik yang sama dengan `kampung_gambar.json`, kelompok `PETA` di `manifest.ts`, dan anggaran 4, 8, dan 20 KB (bertiga 32 KB). Bentuk akhir `PETA` boleh disesuaikan di Plan lanjutan JS-23 | Bagian "Gambar medan peta dan kotak P1" (PC-1) | **Diajukan** (26 Nov 2026; G-01 sampai G-03 Disetujui, dan `PETA` ada di `manifest.ts` sejak penutup PC-1) |

## Manifest aset (Permintaan C-6)

Selesai 8 November 2026. `build_jejak.py` menulis `app/jejak-setara/assets/manifest.ts` setiap kali dijalankan tanpa `--only`, dari daftar aset yang sama dengan `CREDITS.md`, dan hanya untuk aset Disetujui. Bentuknya persis Architecture 11.2 (usulan 11a JS-07, disetujui 8 Nov 2026). Usulan awal Sesi C di bagian ini (6 Nov 2026) sudah digantikan bentuk itu.

| Kelompok | Isi | Kunci |
|---|---|---|
| `UBIN` | `ukuran` 16, `kolom` 16, `jumlah` 377, dan URL lembar `pagi`, `siang`, dan `sore` | — |
| `TOKOH` | Bingkai avatar 16 × 24 dengan titik kaki (8, 21) | — |
| `AVATAR` | 8 butir berurutan A1–A8. Setiap butir berisi `bawah`, `atas`, dan `kanan`, masing-masing `diam` (2 bingkai) dan `jalan` (4 bingkai), ditambah `ikon` (ikon kepala) | Indeks 0–7 = nomor avatar di protokol |
| `KUNCI_TAS`, `WARNA_TAS` | Warna kunci `#FFD23F` dan `#FF9F1C`, serta delapan pasangan `[dasar, bayangan]` dari tabel Design System 8 | Sama dengan `WarnaTas` |
| `OBJEK` | 71 jenis (69 sejak 8 Nov 2026, ditambah `prasasti` dan `kandang_kukang` pada 22 Nov 2026): `bawah`, `atas` (atau `null` untuk objek satu berkas), dan jejak kaki `lebar` × `tinggi` dalam ubin menurut aturan JS-06 | Jenis di `kampung.json`, yaitu nama berkas tanpa `obj_`; properti set yang tidak ada di peta memakai aturan yang sama |
| `NPC` | 34 strip (ditambah `npc_penjual_bawah_diam` pada 22 Nov 2026), masing-masing 2 bingkai dengan titik kaki: siswa dan lansia (8, 21), dewasa (8, 23), anak (7, 17), Dimas di motor (17, 28) | Nama berkas tanpa `.png` |
| `IKON` | 33 ikon; `ikon_bintang` 3 bingkai dan `ikon_menyambung` 2 bingkai. Ikon kepala avatar hanya ada di `AVATAR` | Nama berkas tanpa `.png` |
| `TANDA` | 12 penanda dan efek; berkasnya di folder `ikon/`, dan urutan bingkainya di bagian T | Nama berkas tanpa `.png` |

- `Gambar` berisi `url`, `lebar` dan `tinggi` satu bingkai dalam piksel, dan jumlah `bingkai` pada strip mendatar. Tipe `Gambar`, `GambarAvatar`, `GambarObjek`, `GambarNpc`, dan `KunciWarnaTas` ikut diekspor.
- Setiap PNG diimpor sebagai URL lewat Vite dengan pola manifest Sehari Setara, dan manifest tidak mengimpor apa pun dari `inti/`. Urutan kunci tetap (A1–A8, urutan `WarnaTas`, lalu abjad), sehingga bangun ulang menghasilkan berkas yang sama byte demi byte.
- `build_jejak.py` tidak menulis manifest bila ada masalah: aset yang belum Disetujui, lebar strip yang tidak habis dibagi jumlah bingkai, jejak kaki objek yang tidak bulat, titik kaki di luar bingkai, jenis di `kampung.json` atau `gerbang_tutup` yang tidak ada, atau aset Disetujui yang tertinggal.
- Uji `app/jejak-setara/__tests__/konten/aset-manifest.test.ts` (16 uji, dijalankan `content:check:jejak` dan `test:jejak`) memeriksa ulang hasilnya tanpa Python. 16 salinan manifest yang sengaja dirusak (misalnya bingkai salah, A1 dan A2 tertukar, `gerbang_tutup` hilang, impor dari `inti/`, warna tas salah, aset yang belum Disetujui) semuanya ditolak.
- Untuk Sesi B: kunci `setTokoh` `npc_…` dicocokkan langsung ke `NPC`, dan `obj_…` ke `OBJEK` tanpa awalan `obj_`. Ke-37 kunci berbeda di bank awal (26 tokoh, 11 properti) semuanya ada di manifest.
- Saat dibangun ulang di lingkungan Sesi C 8 November 2026 (Pillow 12.3 dengan zlib-ng), semua PNG sama piksel dengan yang ada di repositori, tetapi 31 PNG aset dan 31 pratinjau berbeda byte karena pemampatan yang lain. Berkas lama dipertahankan, jadi gambar di repositori tidak berubah.
- Pemeriksaan 8 November 2026 dijalankan di lingkungan Sesi C yang tidak bisa memasang paket. `assets:build:jejak` dijalankan dengan perintah yang sama tanpa pnpm dan lulus; `build_assets.py` lulus dengan hasil sama byte. Uji memakai penjalan pengganti Vitest di atas `tsx`: folder `content:check:jejak` 10 berkas, 254 uji, dan pola `test:jejak` 23 berkas, 610 uji, semuanya lulus. tsc memakai TypeScript 6.0.3 dan 7.0.2 (0 galat), ESLint memakai aturan inti ESLint 10 (0 masalah), dan `build:jejak` serta `build:pages` diganti perbandingan bundel esbuild dan CSS galeri dari Tailwind 4.3.3 (keduanya identik dengan `main`). Perintah resmi berjalan di alur kerja "Jejak: uji" sesudah push.

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
| `manifest.ts` (C-6) | Selesai 8 Nov 2026 | Build JS-07 (Sesi A) bisa dimulai sesudah ZIP manifest di-commit dan di-push |
| Permintaan C-8 | Diterapkan 9 Nov 2026 | PRD JFR-01, 8.3, 12, dan 21 diperbarui Sesi A di ZIP Gerbang 1 JS-08 |
| Permintaan C-13 | Diterapkan 9 Nov 2026 | `assetsInlineLimit` di `vite.jejak.config.ts` (Build JS-07); berlaku juga untuk WAV di `sfx/` |
| O-42 sanggah | Keputusan KT-10 | Hanya bila versi B K-02 dipilih dan pemilik proyek mengizinkan |
| Efek suara giliran 1 | Disetujui 21 Nov 2026 | S-01 sampai S-07 ada di `CREDITS.md` dan `SUARA` |
| Efek suara giliran 2 | Disetujui 21 Nov 2026 | S-08 ada di `CREDITS.md` dan `SUARA`; M-01 di `CREDITS.md` |
| Musik latar M-01 (KT-C26 a) | JS-21 (P1, Sesi A) | Disetujui 21 Nov 2026; baru diputar sesudah JS-21 dibangun |
| Permintaan C-14, C-15, dan C-16 | Diterapkan 21 Nov 2026 | Dokumen efek suara dan musik latar (ZIP Gerbang 1 JS-13); C-16 kini dipakai JS-21 |
| Kabar A-17 selesai | Sesi A dan Sesi B | Kunci aset tambahan masuk `kunci-aset.ts` lewat perbaikan 23 Nov 2026; dicatat di `PLAN.md` (Sesi A) dan `naskah/STATUS.md` (Sesi B). Syarat aset Build semai tambahan untuk K-32 dan K-33 terpenuhi |
| Permintaan C-18 | Diterapkan 23 Nov 2026 | `atas_tambahan.py` di tabel kit gambar Design System 14 (ZIP Gerbang 1 JS-15) |
| PC-1 gambar medan (v1.1) | Selesai 26 Nov 2026 | G-01 sampai G-03 Disetujui dan tercatat di `CREDITS.md` serta `PETA` di `manifest.ts`. Sesudah `PC-1-penutup.zip` di-commit dan di-push, JS-23 (Sesi A) tinggal menunggu JS-21 Selesai |
| PC-2 kotak P1 (v1.1) | Build JS-18 (Sesi A) | Letak tujuh kotak Disetujui 26 Nov 2026. Pemilik proyek melampirkan `PC-2-kotak.zip` ke sesi Build JS-18; ZIP itu tidak di-commit sendiri (KT-C34 a). Bila sumber peta berubah sebelum itu, Sesi C membangun ulang ZIP itu |
| Permintaan C-19 dan C-20 | Diajukan 26 Nov 2026 | C-19 (uji kotak) dikerjakan Sesi A di Build JS-18 bersama `PC-2-kotak.zip`; C-20 (dokumen gambar medan) dikerjakan Sesi A di JS-23 |

## Cara membalas

- **Perbaikan peta sesudah JS-06** cukup ditulis bebas, misalnya "titik z6-03 pindah ke tepi sungai". Saya mengubah `kampung.txt` atau `objek.json`, menjalankan `peta:build` dan uji peta, lalu menyerahkan ZIP kecil.
- Perbaikan aset tetap bisa diminta kapan saja: tulis ID aset dan perubahannya, misalnya "N-08: rambut Pak Made lebih banyak". Aset yang diubah kembali berstatus Ditinjau sampai disetujui lagi.
- **Efek suara:** balas `Setuju: suara` untuk semua saran (a) di bagian "Efek suara", atau sebutkan alternatifnya, misalnya `Setuju: suara, 3b, 5b`. Sesudah setiap giliran efek, balas misalnya `Setuju: S-01 sampai S-07`, atau tulis perbaikan per efek, misalnya "S-05: lebih pelan" atau "S-02: lebih pendek". Efek yang diubah kembali berstatus Ditinjau. Untuk giliran 2: `Setuju: S-08, M-01`, atau perbaikan seperti "M-01: lebih pelan".
- **Aset tambahan:** O-52, O-53, dan N-21 Disetujui 22 November 2026. Perbaikan tetap bisa diminta dengan ID aset, misalnya "O-52: lumut lebih banyak" atau "N-21: topi warna lain". Aset yang diubah kembali Ditinjau sampai disetujui lagi, dan kredit serta manifestnya diperbarui sesudah itu.
- **Gambar medan dan kotak P1:** balas `Setuju: PC-1 dan PC-2` untuk semua saran (a) di bagian "Gambar medan peta dan kotak P1", atau sebutkan alternatifnya, misalnya `Setuju: PC-1 dan PC-2, KT-C34 b`. Letak kotak bisa diperbaiki bebas, misalnya "karcis halte-2 pindah ke kiri halte". Sesudah giliran gambar, balas `Setuju: G-01 sampai G-03, letak kotak`, atau perbaikan per gambar, misalnya "G-02: pohon kurang gelap". G-01 sampai G-03 dan letak kotak Disetujui 26 November 2026; perbaikan tetap bisa diminta dengan cara yang sama. Gambar atau letak yang diubah kembali Ditinjau sampai disetujui lagi, dan `PC-2-kotak.zip` dibangun ulang bila sumber peta berubah.
