# Hasil uji JS-18 — 27 November 2026

Dibangun dan diuji dalam mode ZIP dari ZIP `main` sesudah commit `6ec9f96`, ditambah isi `PC-2-kotak.zip` (Sesi C) yang disalin apa adanya. Mesin agen: Linux tanpa GPU, Chromium 1243 lewat `JEJAK_CHROMIUM`, Worker dan D1 lokal. Pembanding ukuran: build `main` yang sama ditambah isi `PC-2-kotak.zip`, sebelum perubahan Sesi A.

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 Aturan inti | Lulus | `aturan-skill.test.ts`: urutan `SKILL_URUT`; `halteDekat` pada 24 dan 24,01 px (klien) serta 32 dan 32,01 px (server), seri (id terkecil), dan tanpa halte; `titikHalte`; `dalamTeropong` pada 192 dan 192,01 px; `melompat` tepat di ambang untuk dtMs 100 dan 500; Teropong yang aktif tidak bisa dipakai lagi. `inti/kemurnian.test.ts` tetap lulus |
| AC-2 Skill per ruang | Lulus | `ruang-baru-skill.test.ts` dan `kelas/api-ruang.test.ts`; `skill.uji-server.ts` (Teropong dan Angkot diterima; 400 `ISI_SALAH` untuk nilai lain, duplikat, lebih dari 5 butir, dan bukan larik; tanpa isian berarti kelima skill); `ruang.uji-server.ts` (kelima skill di `pengaturan_json`); `teropong-angkot.uji.ts` uji 3 (lima kotak centang tercentang, lima ikon, tinggi ≥ 48 px; baris "Skill Lari cepat, Kompas kejadian, Petunjuk, Teropong, Angkot"); `skill.uji.ts` (`skillAktif` tanpa Petunjuk di permintaan, baris Skill empat nama, tidak dicetak). Ruang yang menyimpan tiga skill tetap tanpa Teropong dan Angkot (`ruang-baru-skill.test.ts`, `inti-ruang-js18.test.ts`) |
| AC-3 Peta 31 kotak (C-19) | Lulus | `skill-ruang.test.ts`: 31 kotak (9, 6, 9, 3, 4) urut menurut id dan sama dengan `PETA_KAMPUNG.kotak`, letak ketujuh kotak baru, `KOTAK_MENUNGGU_MAKS` sama dengan jumlah kotak; `peta:build --periksa` dan `peta-aturan.test.ts` (Sesi C) lulus; kesebelas berkas `PC-2-kotak.zip` sama byte dengan berkas di ZIP Build |
| AC-4 Kotak teropong dan karcis | Lulus | `inti-ruang-js18.test.ts` dan `skill-ruang.test.ts` (muatan sampai 1, `pribadi` lalu `kotak_teropong` atau `kotak_angkot`, tidak terambil bila skill mati atau muatan penuh); `klien-skill.test.ts` (kotak hanya tergambar bila skill aktif, pita "… sudah penuh." sekali per kotak); `teropong-angkot.uji.ts` ("+1 Teropong", lencana dan nama aksesibel, lalu "Teropong sudah penuh." di kotak kedua; "+1 Angkot"); `skill.uji.ts` (`data-kotak` menyaring kotak yang skillnya tidak aktif) |
| AC-5 Teropong di server | Lulus | `inti-ruang-js18.test.ts`: `pribadi` lolos skema, pengungkapan di putaran berikutnya menurut kode lalu id titik, titik di luar radius, kejadian selesai, dan titik yang sudah terlihat tidak dikirim, radius mengikuti posisi, tanpa pengungkapan sesudah 30 detik, selama jeda, dan di ruang tanpa Teropong, kedua titik di ruang 80 pemain, 40 pemain ber-Teropong, satu baris `skill` per pemakaian dan tanpa tulisan saat berakhir; `teropong-angkot.uji-server.ts` (Teropong mengungkap kejadian di luar layar) |
| AC-6 Teropong di layar pemain | Lulus | `teropong-angkot.uji.ts`: penanda kejadian bertambah di peta mini dan peta besar; `data-teropong` "ya" lalu "tidak" sesudah 31 detik; lingkaran peta besar berdiameter 24s + 2 px (s = 3: 74 px), berpusat di "Kamu di sini" (selisih 0 px), garis 2 px `sun`, di lapisan label zona dan di bawah halte; pengumuman "Teropong aktif selama 30 detik." dan "Teropong selesai."; sesudah halaman HP dimuat ulang selama Teropong aktif, pemain masuk lagi di posisi yang sama, `data-teropong` tetap "ya", tombol Teropong tetap aktif, dan jumlah penanda kejadian sama |
| AC-7 Tombol Angkot dan mode pilih halte | Lulus | `klien-skill.test.ts` (empat status tombol, tiga hasil tekanan, `4` dan `5`); `teropong-angkot.uji.ts`: pita "Naik angkot dari halte.", `data-dekat="ya"` dan nama "Angkot, 1 muatan, di halte"; mode dengan judul, ringkasan, "Batal", tiga tombol halte 48 × 48 px di lapisan 4 (di atas "Kamu di sini" lapisan 3), dan daftar tiga baris setinggi 51–68 px tanpa luapan di HP 731 × 411, dunia 610 × 343, HP 640 × 360 rasio 3, dan laptop 1280 × 720; fokus awal di baris pertama, `Tab` berputar, `Shift+Tab` ke "Batal", `Esc`, `P`, `Numpad5`, `1` (halte asal) diabaikan, dan `4` memilih; keadaan menunggu (semua tombol `aria-disabled`, dua tombol `data-dipilih`); tertutup sendiri tanpa pita saat jeda, saat HP tegak, dan saat menyambung ulang (soket ditutup dari halaman), lalu tombol Angkot kembali dengan muatan 1 |
| AC-8 Pindah halte di server | Lulus | `inti-ruang-js18.test.ts`: syarat (status, dialog, muatan, jeda, 32 dan 32,01 px, halte sama atau tidak ada), urutan `koreksi` (seq terakhir), `pribadi`, `angkot_tiba`, posisi di `titikHalte`, laporan lama ditolak dengan `koreksi` ke tujuan, laporan pertama dari tujuan diterima (juga saat berlari), kotak di sepanjang garis tidak terambil, Kompas tiba di putaran berikutnya, pemakaian ditolak tanpa jawaban, satu baris `skill`; `teropong-angkot.uji-server.ts` (alur lengkap lewat WebSocket) |
| AC-9 Tiba | Lulus | `teropong-angkot.uji.ts`: peta tertutup 155 ms sesudah halte diketuk (run sebelumnya 221 ms; batas uji 1,5 detik dari ketukan, sedangkan P-21 butir 6 dihitung dari `angkot_tiba`), pita dan pengumuman "Tiba di Halte 3." dan "Tiba di Halte 4.", fokus di tombol Angkot; tanpa jawaban: mode tertutup tanpa pita sesudah ≥ 1,9 detik (terukur 3,0 detik termasuk jeda pemeriksaan uji), muatan dan posisi tetap; `klien-skill.test.ts` (`selesaiTiba` menunggu bingkai pertama sesudah `koreksi`, paling lama 1 detik) |
| AC-10 Pemain lain dan layar kelas | Lulus, dengan Temuan 2 | `teropong-angkot.uji.ts`: wilayah halte asal di layar pengamat B sama dengan halte kosong 165 ms sesudah ketukan (run sebelumnya 217 ms; batas 500 ms); pengamat C di halte tujuan mencatat posisi A hanya di titik halte; titik layar kelas ber-`data-lompat="ya"` dengan transisi 0 detik, titik lain tetap 0,5 detik, dan tanda hilang di pembaruan berikutnya; `pemainLain.test.ts` (`melompat` mengganti penyangga, tepat di ambang bukan lompatan); `inti-ruang-js18.test.ts` (butir perpisahan sekali, di luar 24 terdekat, batas 64 butir, pengamat jauh, pemulihan Durable Object); `tampilan-kelas.test.ts` |
| AC-11 HUD | Lulus | `teropong-angkot.uji.ts` uji 1: HP 731 × 411, 915 × 356, dan 640 × 360 rasio 3 memakai lengkung lima tombol tanpa tumpang tindih (jarak antartombol terkecil 10 px, ke Periksa ≥ 20 px, ke peta mini ≥ 79,8 px, ke bilah atas ≥ 166,8 px); laptop 1280 × 720 dan 1024 × 768 satu kolom `1` sampai `5` (309 dan 129 px di bawah peta mini); laptop 700 × 400 dua kolom (65 px di bawah peta mini); kotak aman tidak bertumpuk dengan tombol, lencana, dan tanda di keenam ukuran; pita "Cari kotak teropong." (222 px) dan "Naik angkot dari halte." (249 px) satu baris di HUD 610 px; `klien-skill.test.ts` (`batasPanah`, `susunanLaptop`, `letakTombol`) |
| AC-12 Teks, bunyi, dan pengumuman | Lulus | `kerangka.test.ts` ("TEKS dan TEKS_KONSOL memuat tepat teks spesifikasi JS-18"; uji `TEKS` utama, kelompok `skill.*` JS-09, dan teks konsol JS-04 mengecualikan kunci JS-18 seperti kunci JS-11 dan JS-12); `klien-skill.test.ts` (`bunyiSkill` dengan pemutar tiruan: kotak teropong dan karcis berbunyi `kotak`, Teropong mulai berbunyi `skill`; tiba berbunyi `skill` lewat `selesaiTiba`) |
| AC-13 Protokol dan kompatibilitas | Lulus | `inti/protokol.test.ts` dan `kerangka.test.ts` (`PROTOKOL_VERSI` 6, sama dengan jawaban Worker); setiap pesan server di uji unit JS-18 lolos skema; `halteId` yang tidak sesuai pola ditolak skema; kode `pemberitahuan` tak dikenal diabaikan (`klien-skill.test.ts`); pemulihan tanpa baris `skill` tetap berjalan (`inti-ruang-js18.test.ts`); `sim:beban` memakai versi 6 (rekap lolos skema) |
| AC-14 Beban | Lulus, dengan Temuan 3 | Bagian "Simulasi beban": tanpa putus tak terduga, pelanggaran, dan galat; kelima jenis kotak terambil; Teropong dipakai 28 sampai 38 kali dan Angkot 30 sampai 62 kali per run; gerak dikoreksi di luar 1 detik sesudah pindah 0 tanpa tunda, dan dengan tunda 0,051% (34 dari 66.249) di run 1 serta 0 di run 2 dan dua run ulang bercatatan; lalu lintas turun paling banyak 2,86 MB per pemain per 15 menit (lobi); waktu putaran, ukuran `pribadi`, dan baris tulis tercatat |
| AC-15 Ukuran dan kinerja | Lulus, kecuali konsol awal (Temuan 1, diterima pemilik proyek 27 Nov 2026, pilihan a) | Bagian "Anggaran ukuran dan kinerja": layar pemain +1,90 KB (batas +5), gaya +0,29 KB (batas +0,6), potongan layar kelas +0,14 KB (batas +0,3), konsol awal +0,64 KB (batas +0,3); `kerangka.test.ts` (layar pemain tidak mengimpor `teks-konsol.ts`); waktu server jauh di bawah 5 ms; bingkai HP sesudah pindah halte tercatat; uji kinerja JS-07 dan JS-08 (`dunia.uji.ts`, 40 pemain tiruan) dan JS-09 (`skill.uji.ts`) lulus. Kunci manifest (misalnya `ubin_siang`) hanya ada di `pemain-*.js`, tidak di `admin-*.js`, potongan bersama, dan `LayarKelas-*.js` |
| AC-16 Tanpa regresi | Lulus | Semua uji unit, server, dan ujung ke ujung lulus (bagian "Perintah yang dijalankan"); uji lama hanya diubah untuk lima skill (misalnya Teropong kini diterima `POST /api/ruang`) dan 31 kotak; `build:pages` 178 berkas identik byte; `tsc --noEmit` dan ESLint Jejak tanpa masalah |
| AC-17 Tangkapan layar | Lulus | 16 berkas di [JS-18/](JS-18/) (bagian "Tangkapan layar") |
| AC-18 Pemeriksaan manual | Lulus | Pemilik proyek, 27 Nov 2026, di lingkungan uji sesudah "Jejak: uji" hijau untuk commit `69f5e57`: Teropong (kotak, lingkaran, dan kejadian terlihat di peta) dan Angkot (karcis, halte, dan pindah halte) berhasil. Pemeriksaan sesudah rilis v1.1 di produksi dengan dua HP juga baik (bagian "Penutupan") |
| AC-19 Dokumen | Lulus | PRD 21, Architecture 6.2 (versi 6, "6 sejak JS-18"), spesifikasi (status dan Catatan Build), `PLAN.md`, dan `rilis/v1.1.md`. Bagian lain PRD, Design System, dan Architecture sudah diubah di ZIP Gerbang 2 |

## Perintah yang dijalankan dan hasilnya

| Perintah | Hasil |
|---|---|
| Perbandingan byte kesebelas berkas `PC-2-kotak.zip` dengan salinan kerja | Lulus, 11 berkas sama |
| `peta:build --periksa` | Lulus; peringatan kantong tertutup 4 sel di Z1 sudah ada di `main` |
| `content:check:jejak` | Lulus, 13 berkas, 395 uji |
| `test:jejak` | Lulus, 93 berkas, 1.459 uji |
| `test:jejak:server`, dalam dua perintah | Lulus, 14 berkas, 73 uji: (1) akun, bank, biaya, dunia, hasil, kejadian, dan kelas: 46 uji (170 detik); (2) masuk-ulang, nama, produksi, ruang, skill, statistik, dan teropong-angkot: 27 uji (163 detik) |
| `build:jejak`, lalu `scripts/jejak-setara/anggaran.mjs` | Lulus, semua di bawah batas |
| `tsc --noEmit` | Lulus |
| ESLint `app/`, `server/`, `scripts/`, dan `e2e/` Jejak, `--max-warnings 0` | Lulus, 0 masalah |
| `test:e2e:jejak`, dalam tujuh perintah | Lulus, 68 uji di 17 berkas: (1) `bank`, `dunia` tanpa uji kinerja, `gabung`, dan `hasil`: 12 (2,8 menit); (2) uji kinerja `dunia.uji.ts` sendiri: 1 (3,8 menit); (3) `jaringan.uji.ts`: 4 (4,9 menit); (4) `skill.uji.ts`: 4 (2,4 menit); (5) `kinerja.uji.ts`: 2; (6) `kejadian`, `kelas`, `kerangka`, `konsol`, `masuk-ulang`, dan `medan`: 36 (4,3 menit); (7) `nama`, `pengaturan`, `statistik`, dan `teropong-angkot`: 9 (2,5 menit) |
| `build:pages` | Lulus, 178 berkas identik byte dengan build dasar |
| `sim:beban` 1 × 50, 180 detik: sekali tanpa tunda, dan dua kali dengan `--latensi-ms 80 --jitter-eksp-ms 40` | Lulus, dengan Temuan 3 (bagian "Simulasi beban") |
| Waktu server di Node (median 20 kali, tiga kali jalan) | Dicatat (bagian "Anggaran ukuran dan kinerja") |

## Simulasi beban (AC-14)

Satu ruang dengan 50 bot selama 180 detik menjelajah, di server lokal.

| Ukuran | Tanpa tunda | Tunda 80 ms + jitter 40 ms, run 1 | Tunda, run 2 |
|---|---|---|---|
| Kotak terambil (sepatu, kompas, buku, teropong, karcis) | 58, 43, 57, 29, 62 | 77, 37, 60, 36, 31 | 68, 42, 55, 40, 54 |
| Skill dipakai (Lari cepat, Kompas, Petunjuk, Teropong, Angkot) | 58, 118, 49, 28, 62 | 77, 126, 48, 35, 30 | 67, 94, 41, 38, 49 |
| `angkot_tiba` | 62 | 30 | 49 |
| `kejadian_terlihat` selama Teropong aktif, di luar pandangan bot | 28 | 62 | 52 |
| Gerak dikoreksi di luar 1 detik sesudah pindah | 0 dari 67.647 | 34 dari 66.249 (0,051%) | 0 dari 66.209 |
| Gerak dikoreksi dalam 1 detik sesudah pindah | 0 | 3 | 1 |
| Gerak dikoreksi selama lari atau sampai 1 detik sesudahnya | 0 | 0 | 0 |
| Pelanggaran, pesan ditolak server, dan sambungan putus tak terduga | 0, 0, 0 | 0, 0, 0 | 0, 0, 0 |
| Selang putaran server rata-rata selama menjelajah | 100,9 ms (1.785 putaran) | 101,1 ms (1.781 putaran) | 100,7 ms |
| Ukuran rata-rata `pribadi` | 311 bita | 312 bita | 300 bita |
| Lalu lintas turun per pemain per 15 menit (lobi; menjelajah) | 2,86 MB; 1,52 MB | 2,67 MB; 1,36 MB | 2,70 MB; 1,27 MB |
| Baris tulis SQLite ruang dan D1 | 5.019 dan 1.434 | 5.268 dan 1.515 | 4.753 dan 1.381 |
| Waktu pulang-pergi p95 | 34 ms | 372 ms | 374 ms |
| Bot yang menerima `selesai` dan rekapnya lolos skema | 50 dari 50 | 50 dari 50 | 50 dari 50 |

Di antara run 1 dan run 2, run dengan tunda juga diulang dua kali memakai salinan skrip yang hanya ditambah catatan keadaan bot di setiap koreksi (salinan itu tidak ikut ZIP). Hasilnya: gerak dikoreksi di luar 1 detik sesudah pindah 0 dari 65.428 dan 0 dari 65.964, dan dalam 1 detik sesudah pindah 4 dan 2 (Temuan 3). Angkot dipakai 47 dan 40 kali, dan Teropong 16 dan 28 kali.

Penolakan nama `NAMA_DIPAKAI` (6 dan 5) terjadi saat beberapa bot memilih saran nama yang sama bersamaan; bot lalu memakai saran berikutnya (perilaku JS-03). Penolakan ini bukan galat ruang.

## Anggaran ukuran dan kinerja (AC-15)

| Butir (gzip) | Sebelum (`main` + PC-2) | Sesudah | Batas kenaikan (P-39) | Batas |
|---|---|---|---|---|
| Kode layar pemain (JS) | 134,46 KB | 136,36 KB (+1,90) | +5 KB | — |
| Gaya layar pemain (CSS) | 6,79 KB | 7,08 KB (+0,29) | +0,6 KB | — |
| Kode layar pemain (JS + CSS, `anggaran.mjs`) | 141,25 KB | 143,44 KB (+2,19) | — | 200 KB |
| Kode konsol awal (JS + CSS, `anggaran.mjs`) | 137,09 KB | 137,72 KB (+0,64) | +0,3 KB | 350 KB |
| Potongan layar kelas | 11,21 KB | 11,35 KB (+0,14) | +0,3 KB | — |
| Seluruh aset layar pemain | 249,07 KB (254 berkas) | 249,07 KB (254 berkas) | — | 2 MB |
| Kedua berkas peta JSON | 13,55 KB | 13,55 KB | — | 60 KB |

Rincian konsol awal per berkas (bita gzip-9): `admin.js` +57, `admin.css` +13, potongan bersama `protokol.js` +287 (teks layar pemain JS-18 +126, selebihnya fungsi `inti/aturan.ts` dan nama hasil pemadatan), dan gaya bersama `protokol.css` +296 (gaya layar pemain JS-18).

Waktu server di Node (median 20 kali, mesin agen diam, tiga kali jalan; sasaran Architecture 13.1: satu putaran untuk 50 pemain ≤ 5 ms):

| Ukuran | 50 pemain | 100 pemain |
|---|---|---|
| Putaran tanpa Teropong | 0,058–0,068 ms | 0,135–0,176 ms |
| Putaran, semua pemain ber-Teropong aktif | 0,20–0,31 ms | 0,48–0,59 ms |
| Satu `pakai_skill` Angkot | 11–23 µs | 6–8 µs |
| Putaran sesudah pindah halte (20 pengamat, butir perpisahan) | 0,079–0,091 ms | 0,16–0,19 ms |

Bingkai layar HP 731 × 411 sesudah pindah halte (histogram waktu kode gambar JS-08, sekitar 3 detik sesudah tiba): CPU biasa 209 bingkai, p95 paling lama 4 ms, dan bingkai terlama paling lama 25 ms (run sebelumnya 211, 3 ms, dan 16 ms); CPU 6 kali lebih lambat 60 bingkai, p95 paling lama 25 ms, dan bingkai terlama paling lama 50 ms (run sebelumnya 58, 50 ms, dan 50 ms). Angka mutlak mesin agen tanpa GPU tidak mewakili HP. Pemeriksaan di HP sungguhan menjadi bagian AC-18.

Uji kinerja lama tetap lulus dengan kode JS-18:

- `dunia.uji.ts`, 40 pemain tiruan di ukuran HP (JS-07 dengan ambang JS-08):
  - CPU biasa: 307 bingkai dalam 5 detik, p95 paling lama 3 ms, dan bingkai terlama paling lama 12 ms;
  - CPU 6 kali lebih lambat: p95 paling lama 12 ms di lobi, 16 ms saat berjalan, 16 ms dekat kejadian, dan 12 ms saat pergantian masa, tanpa bingkai 100 ms ke atas.
- `skill.uji.ts` (JS-09): 243 bingkai, p95 paling lama 4 ms, dan bingkai terlama paling lama 8 ms.

## Tangkapan layar (AC-17)

Di [JS-18/](JS-18/):

- HUD lima tombol: `hud-hp-731x411.png`, `hud-hp-640x360-r3.png`, `hud-hp-915x356.png`, `hud-1280x720.png`, `hud-1024x768.png`, dan `hud-700x400.png`;
- tombol Angkot dekat halte: `angkot-dekat-731x411.png`;
- lingkaran Teropong: `teropong-mini-731x411.png` dan `teropong-besar-731x411.png`;
- mode "Pilih halte tujuan": `pilih-halte-731x411.png`, `pilih-halte-610x343.png`, dan `pilih-halte-1280x720.png`;
- pita "Tiba di Halte 3.": `tiba-731x411.png`;
- dialog Ruang baru dengan lima skill: `konsol-ruang-baru-1280x720.png`;
- layar kelas: `kelas-1024x768.png` dan `kelas-1920x1080.png`.

## Temuan

1. **Konsol awal naik 0,64 KB, di atas batas kenaikan 0,3 KB (P-39).**
   - Kenaikan milik konsol sendiri hanya 0,07 KB (`admin.js` dan `admin.css`).
   - Sisanya berasal dari dua potongan bersama yang juga dimuat konsol: gaya layar pemain `protokol.css` (+0,29 KB) dan `protokol.js` (+0,28 KB), yang memuat seluruh `TEKS` layar pemain dan fungsi `inti/aturan.ts`.
   - Konsol tetap jauh di bawah batas 350 KB (137,72 KB).
   - Saran: diterima, seperti kenaikan konsol JS-21. Bila ukuran konsol kelak perlu ditekan, Plan berikutnya bisa memisahkan teks dan gaya layar pemain dari potongan bersama.
2. **Penyangga lama di layar pengamat (P-24).**
   - Uji ujung ke ujung pertama gagal di pemeriksaan pengamat C di halte tujuan. Layar C mencatat A satu kali di 11 px sebelum titik halte 3, di garis dari halte 1.
   - Penyebabnya: C terakhir melihat A sekitar 10 detik sebelumnya. Untuk selang itu, ambang `melompat` (P-5) adalah 64 + 144 × 10 = 1.504 px, sedangkan jarak halte 1 ke halte 3 sekitar 1.015 px. Jadi butir baru tidak dianggap lompatan, dan layar C menginterpolasi dari posisi lama selama tunda tampil (120–250 ms).
   - Ini sesuai bunyi P-24, karena dtMs diambil dari selisih `w`. Kode tidak diubah.
   - Uji kini memindah C tepat sebelum A memilih halte, sehingga butir lama berumur jauh di bawah 6,6 detik (Catatan Build spesifikasi).
   - Besarnya di kelas: hal ini hanya terjadi bila pengamat di halte tujuan terakhir melihat pemain itu lebih dari 3,5 sampai 7 detik sebelumnya (menurut jarak kedua halte). Avatar lalu tampil paling jauh sekitar 40 px (2,5 ubin) di depan titik halte, dan bergerak ke titik itu paling lama 0,25 detik, secepat lari biasa. Makin lama selangnya, makin kecil gesernya. Pemain yang belum pernah terlihat langsung tampil di titik halte.
   - Saran: diterima untuk v1.1. Bila ingin dihilangkan, spesifikasi berikutnya dapat menambah syarat ini pada P-24: butir baru juga mengganti penyangga bila pemain itu sedang tersembunyi (tidak muncul di `dunia` lebih dari 2,5 detik).
3. **Gerak dikoreksi pada `sim:beban` dengan tunda.**
   - Run 1 mencatat 34 koreksi di luar 1 detik sesudah pindah (0,051%, ambang 0,05%). Run 2 dan dua run ulang bercatatan mencatat 0. JS-09 dengan tunda yang sama mencatat 0.
   - Run ulang dengan catatan keadaan bot tidak menangkap koreksi semacam itu, jadi penyebab ke-34 koreksi belum terbukti; kemungkinan besar satu kejadian jarang. Satu dugaan: sesudah pindah halte anggaran jarak di server dimulai dari 0 (P-22), sehingga bot yang langsung berjalan lebih peka terhadap pesan yang tertunda bergerombol selama 1–3 detik.
   - Koreksi dalam 1 detik sesudah pindah (3, 4, 2, dan 1) adalah buatan simulasi. Antrean tunda bot menjadwalkan dua pesan berurutan pada waktu yang sama, dan `setTimeout` Node membulatkan waktu tunggu ke milidetik penuh, sehingga urutannya kadang tertukar. Akibatnya `pakai_skill` Angkot diproses sebelum laporan berhenti yang dikirim tepat sebelumnya, dan laporan itu ditolak dari posisi baru.
   - Di HP sungguhan urutan pesan dalam satu WebSocket selalu terjaga, jadi hal ini tidak terjadi.
   - Saran: diterima. Di kelas, satu koreksi berarti avatar siswa kembali beberapa piksel satu kali. Antrean tunda `simulasi-beban.mjs` bisa dibuat menjaga urutan di pekerjaan berikutnya.
4. **Tangkapan layar fitur lama** (misalnya `tests/JS-09/`) ikut ditulis ulang oleh uji ujung ke ujung. Berkas itu dikembalikan dan tidak disertakan di ZIP.
5. **Uji server yang sempat gagal sekali.** Di run awal Build, `ruang.uji-server.ts` sekali gagal saat menerapkan ulang migrasi wrangler di bawah beban mesin (status 1). Berkas itu lulus saat dijalankan sendiri, dan run lengkap terakhir lulus semua.

## Keputusan: Lulus

Semua kriteria yang bisa diuji agen lulus. Saat laporan ini ditulis, yang masih menunggu pemilik proyek:

- **Temuan 1:** konsol awal +0,64 KB, di atas batas kenaikan +0,3 KB. Saran: diterima.
- **Temuan 2 dan 3:** catatan pada AC-10 dan AC-14. Saran: diterima untuk v1.1, lalu ditangani di pekerjaan berikutnya (`PLAN.md`, "Catatan untuk Plan berikutnya").
- **AC-18:** pemeriksaan manual di lingkungan uji dengan dua HP.

## Penutupan (27 November 2026)

Menurut laporan pemilik proyek di awal sesi Sesi A berikutnya:

- "Jejak: uji" untuk commit `69f5e57` hijau.
- **AC-18 lulus** di lingkungan uji: Teropong (kotak, lingkaran, dan kejadian terlihat di peta) dan Angkot (karcis, halte, dan pindah halte) berhasil.
- **Temuan 1 diterima** (pilihan a). Temuan 2 dan 3 tetap menjadi catatan untuk pekerjaan berikutnya.
- **Rilis v1.1** terpasang di produksi pada 27 November 2026 lewat "Jejak: produksi". `/api/sehat` produksi menjawab `{"ok":true,"protokol":6,"lingkungan":"produksi"}`, dan pemeriksaan sesudah rilis di [rilis/v1.1.md](../rilis/v1.1.md) semuanya baik.
- Dua masalah kontrol di HP yang sudah ada sejak v1.0 (tombol layar penuh hanya di lobi, dan tombol HUD yang tidak bereaksi pada jari kedua selama analog dipegang) dikerjakan di JS-24, bukan di JS-18.

**JS-18 Selesai.**
