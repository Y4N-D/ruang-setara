# Hasil uji JS-09: skill dan kotak bantuan

| | |
|---|---|
| Fitur | JS-09 Skill dan kotak bantuan |
| Spesifikasi | [specs/JS-09-skill.md](../specs/JS-09-skill.md) |
| Sesi | A (Mesin), mode ZIP |
| Tanggal | 21 November 2026 |
| Dasar kode | ZIP `main` sesudah commit 2c559b1 (20 November 2026) |
| Hasil | **Lulus dengan catatan AC-23.** Semua perintah uji hijau. Kode layar pemain naik 4,64 KB gzip, di atas batas 4 KB (bagian "Temuan"); keputusan ada di tangan pemilik proyek |

## Ringkasan

Tiga skill P0 kini bisa dipakai di dunia. Lari cepat mempercepat avatar 1,6 kali selama 6 detik, Kompas kejadian menunjuk titik kejadian terdekat selama 20 detik, dan Petunjuk mencoret satu pilihan keliru di Langkah 1 disertai kalimat petunjuk. Muatan didapat dari 24 kotak bantuan yang diambil server dari ruas gerak, dan jawaban "tepat" memberi +1 Kompas. Guru memilih skill per ruang di dialog Ruang baru; baris Skill tampil di kepala ruang dan ringkasan hasil, dan CSV jawaban mendapat kolom ke-18 "Petunjuk dipakai". Tautan dasbor kini setinggi 48 px dan setiap uji menutup ruang buatannya, sehingga seluruh 48 uji ujung ke ujung lulus dalam satu perintah.

## Perintah dan hasil

| Perintah | Hasil |
|---|---|
| `npm run content:check:jejak` | 10 berkas, 254 uji lulus |
| `npm run test:jejak` | 68 berkas, 1.092 uji lulus (di antaranya enam berkas baru di `__tests__/skill/`) |
| `npm run test:jejak:server` | 9 berkas, 61 uji lulus (termasuk empat uji baru di `skill.uji-server.ts`) |
| `npm run build:jejak` | Berhasil |
| `npm run test:e2e:jejak` | **48 uji lulus dalam satu perintah** (11,9 menit), termasuk empat uji baru di `skill.uji.ts`. Sesudahnya, ke-23 ruang uji di D1 lokal berstatus `ditutup` |
| `npx tsc --noEmit -p .` | Tanpa galat (mencakup `e2e/`) |
| ESLint untuk `app/jejak-setara`, `server/jejak-setara`, `e2e/jejak-setara`, dan `scripts/jejak-setara` | Tanpa galat dan tanpa peringatan |
| `npm run build:pages` | 178 berkas, identik dengan galeri sebelum Build (SHA-256 per berkas) |
| `node scripts/jejak-setara/simulasi-beban.mjs --ruang 1 --bot 50 --detik 180 --tanpa-build` | Lulus, tanpa tunda dan dengan `--latensi-ms 80 --jitter-eksp-ms 40` (bagian "Simulasi beban") |

`npm run lint` untuk seluruh repositori melaporkan galat di folder hasil build (`dist-pages`, `dist-jejak`), di `public/stories`, dan di halaman galeri `app/*.tsx`; tidak satu pun di berkas Jejak Setara atau berkas yang diubah JS-09. Alur kerja CI tidak menjalankan perintah itu.

## Ukuran (AC-23)

Diukur dengan gzip tingkat 9 dari `dist-jejak`, dibandingkan dengan build `main` sebelum Build.

| Bagian | Sebelum | Sesudah | Selisih | Batas JS-09 |
|---|---|---|---|---|
| JavaScript layar pemain | 122,46 KB | 127,10 KB | +4,64 KB | +4 KB: **terlampaui** |
| CSS layar pemain | 5,87 KB | 6,28 KB | +0,41 KB | +0,6 KB: lulus |
| Konsol (JavaScript dan CSS) | 130,64 KB | 132,11 KB | +1,47 KB | Di bawah 350 KB: lulus |
| Worker (gzip) | 98,02 KB | 104,05 KB | +6,03 KB | Tidak dibatasi P-51 |

Aturan impor tetap terpenuhi: layar pemain tidak memuat `teks-konsol.ts`, dan konsol tidak memuat manifest aset (uji `kerangka.test.ts`). Rincian kenaikan layar pemain ada di bagian "Temuan".

## Waktu server (P-51)

Diukur di Node 22 dengan modul server yang sama, median 20 kali pengulangan.

| Ukuran | Hasil |
|---|---|
| Pemeriksaan satu ruas gerak terhadap 24 kotak (`ambilKotak`) | 2,09 µs |
| Pemilihan sasaran Kompas, 16 titik aktif (ruang ≤ 50 pemain) | 0,91 µs |
| Pemilihan sasaran Kompas, 32 titik aktif (ruang > 50 pemain) | 3,29 µs |
| Pemeriksaan tiba Kompas, per pemain | 28 ns |
| Satu pesan `gerak` di ruang 100 pemain, dengan ketiga skill | 2,67 µs (tanpa skill 0,42 µs) |
| Satu putaran 100 ms, 50 pemain yang semuanya ber-Kompas aktif | 0,08 ms (tanpa skill 0,11 ms) |
| Satu putaran 100 ms, 100 pemain yang semuanya ber-Kompas aktif | 0,24 ms (tanpa skill 0,21 ms) |

Sasaran Architecture 13.1 tetap terpenuhi dengan jarak lebar: paling lama 1 ms per pesan gerak dan 5 ms waktu CPU per putaran untuk 50 pemain.

## Kinerja layar pemain (AC-23)

HP 731 × 411 (rasio 2,625) berlari bolak-balik selama 4,3 detik dengan panah Kompas tampil dan satu kotak di pandangan pada setiap contoh: 243 bingkai (56 bingkai per detik), p95 waktu kode gambar paling lama 3 ms, dan bingkai terlama paling lama 6 ms. Ambang JS-08 P-69 untuk CPU normal (p95 ≤ 4 ms, bingkai terlama ≤ 25 ms, ≥ 50 bingkai per detik) terpenuhi. Uji kinerja JS-07 dan JS-08 di `dunia.uji.ts` juga tetap lulus.

## Simulasi beban (AC-24)

Satu ruang dengan 50 bot selama 180 detik, di server lokal.

| Ukuran | Tanpa tunda | Tunda 80 ms + jitter 40 ms |
|---|---|---|
| Kotak terambil (sepatu, kompas, buku) | 81, 43, 79 | 75, 38, 72 |
| Skill dipakai (Lari cepat, Kompas, Petunjuk) | 81, 98, 52 | 74, 122, 63 |
| Pesan `kompas` dan `petunjuk` | 98 dan 52 | 122 dan 63 |
| +1 Kompas dari jawaban "tepat" | 55 | 84 |
| `kompas_tanpa_sasaran` | 0 | 0 |
| Gerak dikoreksi (semua; selama lari atau sampai 1 detik sesudahnya) | 0 dari 70.045; 0 | 0 dari 65.904; 0 |
| Pelanggaran dan sambungan putus tak terduga | 0 dan 0 | 0 dan 0 |
| Ukuran rata-rata `pribadi` | 277 bita | 286 bita |
| Lalu lintas turun per pemain per 15 menit | 1,46 MB | 1,39 MB |
| Baris tulis SQLite ruang dan D1 | 4.148 dan 1.181 | 5.193 dan 1.573 |
| Kejadian dijawab kedua langkahnya | 169 | 237 |
| Bot yang menerima `selesai` dan rekapnya lolos skema | 50 dari 50 | 50 dari 50 |

Ketiga jenis kotak dan ketiga skill masing-masing lebih dari 10 kali per ruang, tanpa koreksi dan tanpa pelanggaran, dan lalu lintas turun jauh di bawah 3 MB per pemain per 15 menit.

## Kriteria penerimaan

| AC | Hasil | Bukti |
|---|---|---|
| AC-1 Aturan bersama | Lulus | `aturan-skill.test.ts`, `aturan.test.ts` (D-1a: skill berdurasi tidak bisa dipakai lagi selama aktif) |
| AC-2 Modul skill-ruang | Lulus | `skill-ruang.test.ts`: ruas, keempat syarat kotak, dua kotak dalam satu ruas, muatan penuh, pemakaian, sasaran dan tiba Kompas, pilihan dicoret untuk 300 pemain, `isi_json` bolak-balik |
| AC-3 Skill per ruang | Lulus | `ruang-baru-skill.test.ts`; `skill.uji-server.ts` (400 `ISI_SALAH`, urutan tersimpan, bawaan tiga skill); `skill.uji.ts` (kelompok Skill dengan tiga kotak centang 48 px, ikon, keterangan, `skillAktif` di permintaan, baris Skill di kepala ruang dan ringkasan hasil, tidak dicetak); cetakan 40 pemain JS-11 tetap satu halaman (`hasil.uji.ts`) |
| AC-4 Keadaan dan `pribadi` | Lulus | `inti-ruang-skill.test.ts`, `skill-ruang.test.ts`, `skill.uji-server.ts` |
| AC-5 Jeda, sambung ulang, pemulihan | Lulus | `inti-ruang-skill.test.ts` (jeda dan lanjut, sambung ulang, pemulihan dengan dan tanpa baris skill); `klien-skill.test.ts`; `skill.uji-server.ts` (jeda 3 detik menggeser semua waktu dalam ±100 ms; sambung ulang memberi `pribadi` dan `kompas` yang sama) |
| AC-6 Penyimpanan | Lulus | `inti-ruang-skill.test.ts`: satu baris per perubahan, waktu habis tanpa tulis, `CREATE TABLE IF NOT EXISTS` |
| AC-7 Mengambil kotak | Lulus | `inti-ruang-skill.test.ts` (hanya di `main`, gerak ditolak, `koreksi`, dan `pindahkan` tidak mengambil; urutan `pribadi` lalu `pemberitahuan`); `skill.uji-server.ts` (`ambil_kotak` diabaikan tanpa pelanggaran) |
| AC-8 Kotak di layar pemain | Lulus | `klien-skill.test.ts` (tampil di `main` dan `jeda`, skill aktif saja, pop hanya untuk kotak yang muncul lagi, kilau, kurangi gerak); `skill.uji.ts` (`data-kotak` 0 di lobi, sama dengan hitungan dari peta, berkurang satu sesudah diambil; ruang tanpa Petunjuk tanpa kotak buku; ruang tanpa skill 0) |
| AC-9 Lari cepat | Lulus | `inti-ruang-skill.test.ts` (batas 500 ms); `skill.uji-server.ts` (5,5 detik zigzag 130 px/detik tanpa koreksi); `klien-skill.test.ts` (12 fps, debu, ambang pemain lain); `skill.uji.ts` (tombol di HP, tombol 1 di laptop, `data-lari`, jarak 3 detik 348 px berlari dan 214 px berjalan, rasio 1,63) |
| AC-10 Kompas kejadian | Lulus | `inti-ruang-skill.test.ts` (ruang 80 pemain, sasaran baru, tiba, waktu habis); `klien-skill.test.ts` (8 arah, 14 × 14, kotak aman di empat ukuran dunia, denyut); `skill.uji-server.ts`; `skill.uji.ts` (arah panah sama dengan hitungan dari peta, tersembunyi saat sasaran tampak, selesai saat tiba, peta besar tidak menandai sasaran) |
| AC-11 Petunjuk | Lulus | `dialog-petunjuk.test.ts`; `inti-ruang-skill.test.ts`; `skill.uji-server.ts`; `skill.uji.ts`: kaki satu baris 48 px di dunia 610 × 343, 640 × 360, 731 × 411, 960 × 540, dan 1280 × 720; pilihan dicoret tidak bisa dipilih lewat ketuk, angka, atau Enter; fokus tetap di tombol Petunjuk; dikirim ulang saat dibuka lagi; luapan 6 px di 610 × 343 dan 0 di ukuran lain |
| AC-12 +1 Kompas | Lulus | `inti-ruang-skill.test.ts` (urutan `hasil_2`, `pemberitahuan`, `pribadi`; muatan penuh dan skill mati tanpa tambahan); `skill.uji.ts` ("+1 Kompas" di kartu HP; tidak ada untuk jawaban bukan "tepat" dan di ruang tanpa skill) |
| AC-13 Tombol skill | Lulus | `skill.uji.ts`: lengkung di HP dan kolom bertanda 1 2 3 di laptop; tombol 48 × 48; tidak bertumpuk dan berjarak ≥ 8 px di 731 × 411, 640 × 360, 915 × 356, 960 × 540, dan 1280 × 720 (antartombol 10,3 px, ke Periksa 20,0–20,4 px, ke peta mini ≥ 79,8 px di perangkat sentuh); status bermuatan, tanpa muatan, aktif, dan jeda; `klien-skill.test.ts` (status ditekan) |
| AC-14 Menekan tombol dan papan ketik | Lulus | `klien-skill.test.ts`; `skill.uji.ts` (1, 2, 3 di luar dialog; tekanan berulang diabaikan; angka di dialog tetap memilih jawaban; Petunjuk lewat Tab lalu Enter; 3 di ruang tanpa Petunjuk diam) |
| AC-15 Aksesibilitas | Lulus | `skill.uji.ts` (label dan `aria-keyshortcuts`; sepuluh pengumuman P-39 berurutan, berjarak ≥ 1,9 detik; pita skill tanpa `role="status"`; blok jeda penuh saat kurangi gerak; laptop dimainkan hanya dengan papan ketik); `klien-skill.test.ts` (kurangi gerak tanpa debu, pop, kilau, dan denyut) |
| AC-16 Pita | Lulus | `skill.uji.ts`: lebar luar ≤ lebar HUD − 256 px dan ≥ 4 px dari peta mini di HUD 610, 640, 731, 960, dan 1280; "Petunjuk dipakai di Langkah 1." dua baris di HUD 610 dan satu baris di HUD 731; antrean satu per satu; `klien-skill.test.ts` (antrean 3 butir, tanpa duplikat, dibuang selama dialog); "Dua menit lagi" (`dunia.uji.ts`) |
| AC-17 Pratinjau penyunting | Lulus | `dialog-petunjuk.test.ts`; `skill.uji.ts` ("Petunjuk (2)", kalimat dan pilihan keliru pertama, "Petunjuk dipakai", Mulai ulang, isi baru, kalimat kosong) |
| AC-18 Hasil dan CSV | Lulus | `csv.test.ts`; `skill.uji-server.ts` (D1 1 dan 0, `petunjukDipakai` di rincian, CSV Ya dan Tidak); `hasil.uji-server.ts` dan `hasil.uji.ts` (18 kolom); `skill.uji.ts` (tanda Petunjuk berikon di rincian, CSV Ya dan Tidak) |
| AC-19 Skill dimatikan | Lulus | `inti-ruang-skill.test.ts`; `skill.uji-server.ts`; `skill.uji.ts` (ruang tanpa Petunjuk: dua tombol yang turun ke bawah, tanpa kotak buku, tanpa Petunjuk di dialog; ruang tanpa skill: tanpa tombol dan kotak, tombol angka diam, tanpa +1 Kompas) |
| AC-20 Dasbor dan uji ujung ke ujung | Lulus | Tautan dasbor ≥ 48 px saat ruang tampil (`skill.uji.ts`); 48 uji lulus dalam satu perintah; semua ruang uji `ditutup` sesudahnya |
| AC-21 Teks | Lulus | `kerangka.test.ts` (21 kunci layar pemain, 6 kunci konsol, 1 kunci CSV) |
| AC-22 Protokol | Lulus | `PROTOKOL_VERSI` tetap 2; semua pesan baru lolos skema (`inti-ruang-skill.test.ts`); layar pemain mengabaikan kode `pemberitahuan` yang tidak dikenal (`klien-skill.test.ts`); ruang lama pulih dengan muatan 0 |
| AC-23 Ukuran dan kinerja | **Lulus dengan catatan** | CSS +0,41 KB, konsol 132,11 KB, waktu server, dan kinerja HP lulus; JavaScript layar pemain +4,64 KB (batas 4 KB), lihat "Temuan" |
| AC-24 Beban | Lulus | Bagian "Simulasi beban" |
| AC-25 Tangkapan layar | Lulus | Bagian "Tangkapan layar" |
| AC-26 Tanpa regresi | Lulus | Semua perintah di atas hijau; `build:pages` identik; dokumen utama dan PLAN.md diperbarui |

## Tangkapan layar

Semua di [JS-09/](JS-09/), dibuat oleh `skill.uji.ts`.

| Berkas | Isi |
|---|---|
| `hud-skill-731x411.png`, `hud-skill-640x360.png`, `hud-skill-915x356.png`, `hud-skill-1280x720.png` | Tombol skill bermuatan (Lari cepat), aktif (Kompas), dan tanpa muatan (Petunjuk) di HP 731 × 411, HP 640 × 360 (rasio 3), HP dengan bilah peramban 915 × 356, dan laptop 1280 × 720 |
| `kotak-731x411.png`, `pita-lari-731x411.png` | Kotak bantuan di pandangan, lalu pita "+1 Lari cepat" sesudah kotak sepatu diambil |
| `panah-kompas-731x411.png` | Panah Kompas saat berlari, dengan debu di kaki |
| `pita-dua-baris-915x356.png` | "Petunjuk dipakai di Langkah 1." terbungkus dua baris di HUD 610 |
| `dialog-petunjuk-ringkas-731x411.png`, `dialog-petunjuk-penuh-1280x720.png` | Dialog dengan kotak petunjuk, pilihan dicoret, dan "Petunjuk dipakai" |
| `kartu-kompas-731x411.png` | Kartu dampak jawaban tepat dengan "+1 Kompas" |
| `konsol-ruang-baru-1280x720.png`, `konsol-hasil-1280x720.png` | Dialog Ruang baru dengan kelompok Skill, dan hasil ruang dengan baris Skill serta tanda Petunjuk di rincian |
| `konsol-pratinjau-petunjuk.png` | Pratinjau penyunting sesudah "Petunjuk (2)" ditekan |
| `kelas-1024x768.png`, `kelas-1920x1080.png` | Layar kelas (podium), tanpa perubahan |

## Temuan

### 1. Kode layar pemain naik 4,64 KB gzip, di atas batas 4 KB (AC-23)

Garis dasarnya 122,46 KB, diukur dari build `main` sesudah commit 2c559b1 (P-51 menulis 122,24 KB, angka dari laporan JS-11). Sesudah Build, layar pemain 127,10 KB, masih jauh di bawah anggaran 200 KB. Perkiraan sumber kenaikan dari peta sumber build (pembulatan; gzip tidak bisa dibagi persis per modul):

| Bagian | Perkiraan |
|---|---|
| `pemain/dunia/skill.ts` (baru: tombol, kotak, panah, pita, pengumuman) | 1,38 KB |
| Tambahan di `pemain/dunia/mesin.ts` (kotak, debu, kilau, panah, pesan skill) | 0,70 KB |
| Tambahan di `pemain/LayarDunia.tsx` (tombol angka, pita, data uji) | 0,38 KB |
| `pemain/TombolSkill.tsx` (baru) | 0,32 KB |
| Aturan skill di `inti/aturan.ts` | 0,24 KB |
| Data 24 kotak dari `kampung.json` | 0,20 KB |
| Petunjuk di `bersama/dialogKeadaan.ts` | 0,20 KB |
| 21 teks baru di `teks.ts` | 0,19 KB |
| `pemain/App.tsx` dan `bersama/DialogKejadian.tsx` | 0,23 KB |
| Nama aset yang berubah, pemadatan, dan perubahan kecil lain | sekitar 0,8 KB |

Kode sudah dipadatkan sekali di Build (kenaikan semula 5,68 KB). Memangkas lebih jauh berarti mengurangi perilaku yang sudah disetujui.

Pilihan untuk pemilik proyek:

- **(a) Terima kenaikan 4,64 KB** dan catat di PRD 21 saat penutupan, seperti AC-22 JS-11. Layar pemain menjadi 127,10 KB dari anggaran 200 KB. *Saran.*
- **(b) Kembali ke Specify** untuk mengurangi fitur yang sudah disetujui sampai kenaikan di bawah 4 KB (sekitar 0,7 KB), misalnya pita bantuan muatan D-2 atau tampilan berlari pemain lain (P-23). Fitur yang dipangkas perlu dipilih dan diukur dulu.

### 2. Ukuran dunia di HP 731 × 411 (catatan, bukan kegagalan)

HP 731 × 411 dengan rasio 2,625 menampilkan dunia skala 6 (731 × 411), bukan 610 × 343 seperti tertulis di P-29 butir 2 dan catatan Specify. Dunia 610 × 343 tampil di HP 640 × 360 dengan rasio 2,625 dan di HP dengan bilah peramban 915 × 356. Uji memakai ukuran yang benar untuk setiap ukuran dunia (spesifikasi, "Catatan Build"). Semua batas AC-11, AC-13, dan AC-16 tetap terpenuhi.

## Catatan

- Uji ujung ke ujung yang lama juga membuat tangkapan layar di `tests/JS-10/`, `tests/JS-11/`, dan `tests/JS-12/`. Tangkapan layar itu dikembalikan ke isinya sebelum Build dan tidak ikut ZIP, karena merekam fitur masing-masing.
- Nama aksesibel pilihan yang dicoret di Chromium memuat spasi sebelum koma ("… , dicoret Petunjuk"); dibacakan sama, jadi kodenya tidak diubah.
- Simulasi beban dijalankan di server lokal, tidak di lingkungan uji, sesuai AGENTS selama paket gratis.
