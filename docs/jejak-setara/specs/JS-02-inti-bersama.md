# JS-02 — Inti bersama

| | |
|---|---|
| Status | Disetujui 7 November 2026; dibangun dan diuji 7 November 2026 ([laporan](../tests/JS-02-hasil.md)) |
| Rencana | `docs/jejak-setara/PLAN.md`, entri JS-02 |
| Keputusan Gerbang 1 | Balasan `Setuju: JS-02` (6 Nov 2026) |
| Keputusan Gerbang 2 | Pemilik proyek, 7 Nov 2026: Gerbang 1 dan 2 selesai, lanjut ke tahap berikutnya. Diperlakukan sebagai `Spesifikasi disetujui: JS-02` dengan saran D-1 sampai D-6 |

## Ringkasan

JS-02 mengisi `app/jejak-setara/inti/` dengan seluruh aturan permainan yang murni: tipe bersama, skema protokol, aturan skor, peringkat, skill, kotak, masa, gerak dan tabrakan, pembaca peta, dan acak berbenih. Inti ini dipakai klien dan server, tidak menyentuh DOM, React, jam, atau acak langsung, dan diuji dengan Vitest di Node.

Sesudah JS-02, belum ada layar, server, WebSocket, D1, atau perubahan perilaku yang terlihat. Semua perilaku di bawah diuji sebagai fungsi murni; yang memakainya baru JS-03 dan sesudahnya.

## Kaitan PRD

| Acuan | Yang dipenuhi di JS-02 |
|---|---|
| PRD 8.1 | Pemetaan waktu ronde ke jam cerita 06.00–18.00, tiga masa (pagi, siang, sore), tanda dua menit terakhir |
| PRD 8.2 | Kecepatan jalan 4,5 ubin/detik (72 px logis/detik), diagonal tidak lebih cepat, tabrakan bangunan/air/pohon/pagar, pemain saling tembus; pemeriksaan kecepatan server |
| PRD 8.3 | Syarat jarak "Periksa" (≤ 1,5 ubin + toleransi), keterlihatan penanda di layar, penempatan kejadian acak berbenih per ruang |
| PRD 8.4 | Poin 40/60/25/0, paling banyak 100 per kejadian, empat tingkat urutan peringkat |
| PRD 8.5 | Muatan dan lama skill, jeda 2 detik, Kompas +1 muatan, kotak muncul lagi 90 detik, jangkauan ambil 12 px |
| JFR-19, JFR-20 | Skor dan peringkat dihitung di inti bersama, dipakai server |
| JFR-21 | Fungsi pengacak urutan pilihan berbenih per pemain; huruf A–D ditentukan lapisan tampilan |
| JFR-23, JFR-24 | Aturan kotak dan skill P0 |
| Architecture JA-07 | Satu definisi tipe dan skema `zod` untuk klien dan server |
| Architecture JA-11 | Inti murni dapat diuji dengan Vitest tanpa runtime Workers |

## Berkas yang dibuat dan diubah

| Berkas | Status | Isi |
|---|---|---|
| `app/jejak-setara/inti/tipe.ts` | Baru | Semua tipe bersama (bagian "Data dan protokol") |
| `app/jejak-setara/inti/acak.ts` | Baru | `benih`, `acakBerbenih`, `kocok`, `pilih`, `bulat` |
| `app/jejak-setara/inti/aturan.ts` | Baru | `POIN`, `bandingkanPeringkat`, `hitungPeringkat`, masa dan jam cerita, `SKILL`, aturan kotak, `BATAS`, penempatan kejadian, keterlihatan, kejadian terdekat |
| `app/jejak-setara/inti/gerak.ts` | Baru | Kecepatan, kotak kaki, tabrakan, `periksaGerak`, `koreksi` |
| `app/jejak-setara/inti/peta.ts` | Baru | Tipe `PetaJejak`, `bacaPeta`, `uraiRle`, `selPadat`, bantuan ubin↔piksel |
| `app/jejak-setara/inti/protokol.ts` | Diubah | Skema `zod` semua pesan v1; `PROTOKOL_VERSI` tetap 1 |
| `app/jejak-setara/__tests__/inti/acak.test.ts` | Baru | Uji acak berbenih |
| `app/jejak-setara/__tests__/inti/aturan.test.ts` | Baru | Uji skor, peringkat, masa, skill, kotak, penempatan |
| `app/jejak-setara/__tests__/inti/gerak.test.ts` | Baru | Uji gerak, tabrakan, pemeriksaan kecepatan |
| `app/jejak-setara/__tests__/inti/peta.test.ts` | Baru | Uji RLE dan `bacaPeta` |
| `app/jejak-setara/__tests__/inti/protokol.test.ts` | Baru | Uji skema pesan |
| `app/jejak-setara/__tests__/inti/kemurnian.test.ts` | Baru | Memindai impor dan panggilan terlarang di `inti/` |
| `docs/jejak-setara/specs/JS-02-inti-bersama.md` | Baru | Spesifikasi ini |
| `docs/jejak-setara/tests/JS-02-hasil.md` | Baru (Test) | Laporan uji |
| `docs/jejak-setara/Architecture.md` | Diubah | Bagian 5.1 (tipe baru) dan 11.1 (bentuk `kampung.json`); saat Build juga 6.8, 8.2, dan 8.4 (catatan B-5, B-8, dan B-9) |
| `docs/jejak-setara/PLAN.md` | Diubah | Status JS-02 dan riwayat |

Tidak disentuh: `app/jejak-setara/teks.ts`, `package.json`, `pnpm-lock.yaml`, `.gitignore`, alur kerja, `app/jejak-setara/inti/konten/` (JS-05), kode dan dokumen Sehari Setara, galeri, `web/`, dan `server/`.

## Perilaku

### Acak berbenih (`acak.ts`)

- P-1. `benih(...bagian: (string | number)[]): number` menyambung setiap bagian dengan `String(bagian)` dan pemisah `;`, lalu menghitung FNV-1a 32 bit atas kode unit string itu (`h ^= kodeUnit; h = Math.imul(h, 16777619) >>> 0; h ^= h >>> 13`), dan mengembalikan bilangan bulat 0–4.294.967.295. Bagian yang sama selalu menghasilkan benih yang sama, di mesin mana pun.
- P-2. `acakBerbenih(benih: number): () => number` mengembalikan pembangkit mulberry32. Setiap angka berada di 0 ≤ x < 1. Pembangkit yang sama dengan benih sama menghasilkan urutan angka yang sama; dua benih berbeda menghasilkan urutan berbeda pada praktiknya.
- P-3. `kocok(larik, benih)` mengembalikan larik baru berisi semua unsur dengan urutan diacak Fisher–Yates; larik asal tidak diubah. `pilih(larik, benih)` mengembalikan satu unsur. `bulat(benih, min, maks)` mengembalikan bilangan bulat min–maks.
- P-4. Tidak ada `Math.random` di `inti/`. Semua pengacakan menerima benih dari luar.

### Masa dan jam cerita (`aturan.ts`)

- P-5. `kemajuan(now, mulaiPada, jedaMs, durasiMs)` = (now − mulaiPada − jedaMs) ÷ durasiMs, dijepit ke 0–1.
- P-6. `menitCerita(kemajuan)` = 360 + ⌊720 × kemajuan⌋ menit, yaitu 06.00 sampai 18.00. Nilai yang diuji: kemajuan 0 → 06.00; 0,3 → 09.36; 0,65 → 13.48; 1 → 18.00. Pembulatan selalu ke bawah.
- P-7. `masa(kemajuan)`: `pagi` bila kemajuan < 0,3; `siang` bila 0,3 ≤ kemajuan < 0,65; `sore` bila 0,65 ≤ kemajuan ≤ 1. Batas bawah inklusif, batas atas eksklusif. `malam` bukan hasil fungsi ini; itu status layar akhir.
- P-8. `formatJam(menit)` mengembalikan `"HH.MM"` dengan titik, misalnya 576 → `"09.36"`; jam 0–23, menit 00–59 dua digit.
- P-9. `duaMenitTerakhir(sisaDetik)` benar bila sisa ≤ 120 detik dan ronde belum selesai.

### Skor dan peringkat (`aturan.ts`)

- P-10. `POIN` = `{ langkah1Benar: 40, tepat: 60, kurang: 25, berisiko: 0 }`, tidak dapat diubah (`as const`).
- P-11. `poinKejadian(langkah1Benar, tingkat)` = (40 bila benar, 0 bila keliru) + poin tingkat; hasilnya 0–100.
- P-12. `bandingkanPeringkat(a, b)` memakai urutan Architecture 8.4: skor lebih tinggi; lalu `waktuSkorMs` lebih kecil; lalu `langkah1Benar` lebih banyak; lalu `urutanGabung` lebih kecil. Fungsi ini dipakai `Array.prototype.sort`.
- P-13. `hitungPeringkat(pemain[])` mengembalikan salinan berurut dan nomor peringkat 1..n. Karena `urutanGabung` selalu berbeda di dalam satu ruang, tidak ada peringkat kembar; pemain dengan empat nilai sama dianggap tidak mungkin dan diuji sebagai kesalahan pemakaian.

### Skill dan kotak (`aturan.ts`)

- P-14. `SKILL` berisi muatan maks dan lama aktif: Lari cepat muatan 2, 6.000 ms; Kompas kejadian muatan 2, 20.000 ms; Petunjuk muatan 2, tanpa lama (sekali pakai); Teropong muatan 1, 30.000 ms; Angkot muatan 1, tanpa lama.
- P-15. `bolehPakaiSkill(permintaan)` benar hanya bila: skill ada di `skillAktif` ruang; muatan > 0; `now − terakhirPakaiMs ≥ 2000`; dan tidak ada dialog terbuka, kecuali Petunjuk.
- P-16. `pakaiSkill(muatan, terakhirPakaiMs, now)` mengembalikan muatan − 1 dan `terakhirPakaiMs = now`. Pemakaian yang ditolak tidak mengubah keadaan.
- P-17. `tambahMuatanKompas(muatan)` = min(2, muatan + 1), dipanggil hanya pada jawaban Langkah 2 "tepat".
- P-18. `kotakSiap(waktuAmbilMs, now, sudahDiambil)` benar bila kotak belum pernah diambil atau `now − waktuAmbilMs ≥ 90.000`. Jangkauan ambil: jarak pusat avatar ke pusat kotak ≤ 12 px.
- P-19. Skill yang dimatikan guru berasal dari `PengaturanRuang.skillAktif`; inti tidak menyimpan keadaan ruang.

### Kejadian: penempatan, keterlihatan, jangkauan (`aturan.ts`)

- P-20. `tempatkanKejadian(benihRuang, titikPerZona, kejadian[])` memberi satu titik untuk setiap kejadian dari titik-titik zonanya, tanpa titik terpakai dua kali di zona yang sama, memakai `kocok` dengan benih `(benihRuang, kodeKejadian)`. Urutan hasil sama untuk benih ruang dan daftar yang sama. Bila titik di satu zona lebih sedikit daripada kejadian di zona itu, fungsi mengembalikan galat `TITIK_TIDAK_CUKUP` (bukan menebak).
- P-21. `terlihatDiLayar(posPemain, titik, lebarPetaPx, tinggiPetaPx)` benar bila titik berada di dalam kotak pandangan 320 × 180 px yang berpusat di posisi pemain dan dijepit ke tepi peta. Titik dianggap terlihat bila berada di tepi (inklusif).
- P-22. `kejadianTerdekat(posPemain, daftar)` mengembalikan kejadian belum selesai dengan jarak lurus terdekat; bila jarak sama, kode terkecil menang. Mengembalikan `null` bila tidak ada.
- P-23. `dapatMemeriksa(jarakPx)` benar bila jarak ≤ 32 px (24 px = 1,5 ubin, ditambah toleransi 8 px).

### Gerak, tabrakan, pemeriksaan kecepatan (`gerak.ts`)

- P-24. `KECEPATAN = 72` px logis/detik (4,5 ubin). `KECEPATAN_LARI = 115,2` (×1,6).
- P-25. Posisi pemain adalah titik kaki: x di tengah, y di bawah. Kotak kaki 10 × 8 px: x − 5 sampai x + 5, y − 8 sampai y. Kotak diuji per ubin 16 px; ubin padat atau di luar peta menolak posisi.
- P-26. Gerak laporan klien: `periksaGerak({ posisi, dx, dy, dtMs, lari, status, dialogTerbuka, peta, seq, seqTerakhir })`.
  - Tolak bila `seq ≤ seqTerakhir`, status bukan `main`, dialog terbuka, atau `dtMs ≤ 0`.
  - `dtMs` dipakai apa adanya sampai paling besar 1.000 ms; nilai lebih besar dianggap 1.000 ms, agar jeda panjang tidak menjadi lompatan (D-2).
  - Panjang gerak (dx, dy) dinormalisasi bila melebihi 1; jarak ≤ kecepatan × dt ÷ 1.000 × 1,25 + 4 px. Pelanggaran menolak pesan seluruhnya.
  - Gerak diterapkan per sumbu: X dahulu, lalu Y; sumbu yang menabrak tidak diterapkan, sumbu lain tetap, sehingga avatar meluncur di dinding. Bila kedua sumbu tertahan, pesan ditolak.
  - Hasil: `{ diterima: boolean, x, y, arah, seq }`; `x`, `y` adalah posisi sah terakhir bila ditolak, dan `arah` mengikuti arah gerak yang diterima.
- P-27. `koreksi` memakai hasil P-26: server mengirim posisi sah terakhir bila pesan ditolak karena kecepatan, tabrakan, atau jarak. Penolakan karena status atau seq tidak mengirim koreksi.
- P-28. Gerak diagonal dengan (dx, dy) sama besar menghasilkan perpindahan sepanjang kecepatan yang sama, bukan √2 kali.

### Peta (`peta.ts`)

- P-29. `bacaPeta(nilai: unknown): PetaJejak` memeriksa dengan `zod` `.strict()`: `versi` = 1; `lebar`, `tinggi` bilangan 1–512; `ukuranUbin` = 16; `ubin` dan `tabrakan` string RLE sah; jumlah sel setiap lapisan tepat `lebar × tinggi`; `ubin` bernilai 0–63; `tabrakan` bernilai 0 atau 1; semua koordinat di dalam peta; `zona` ber-id z1–z8 unik; id titik, kotak, halte unik; `kotak.jenis` salah satu `sepatu`, `kompas`, `buku`, `teropong`, `karcis`.
- P-30. RLE: potongan `"<nilai>x<jumlah>;"`; nilai 0–255, jumlah ≥ 1; contoh `"0x5;1x2;"`. `uraiRle(teks, panjangDiharapkan): Uint8Array` menolak teks cacat atau jumlah yang tidak cocok, dengan galat `PETA_CACAT`.
- P-31. `selPadat(peta, ubinX, ubinY)` benar untuk ubin padat dan untuk koordinat di luar peta. `ubinKePiksel(n)` = n × 16; pusat ubin = n × 16 + 8.
- P-32. Bentuk `kampung.json` yang harus dihasilkan `build_peta.py` (Sesi C, JS-06) tercantum di Architecture 11.1 dan `tipe.ts`; `bacaPeta` adalah pemeriksa resminya.

### Protokol (`protokol.ts`)

- P-33. Setiap pesan berbentuk `{ v: 1, t: "<tipe>", … }`. `v` harus sama dengan `PROTOKOL_VERSI` (1). Semua skema memakai `.strict()`, sehingga kunci tambahan ditolak.
- P-34. Skema pesan pemain ke server: `halo` (peran `pemain`, `token?` 43 karakter base64url, `nomorAbsen?` 1–50), `pilih_identitas` (`nama` 1–24 karakter, `avatar` 0–7), `gerak` (x, y di dalam peta, `arah`, `jalan`, `seq` 0–1.000.000.000), `periksa`, `kunci_1`, `kunci_2`, `tutup_dialog`, `pakai_skill` (skill P0–P1, `kejadianId?`), `ambil_kotak`, `ping` (`tKlien`). Skema dikirim sebagai `skemaPemain`.
- P-35. Skema pesan layar kelas ke server: `halo` peran `guru`; `mulai`, `jeda`, `lanjut`, `akhiri`; `tambah_waktu` (`detik` 1–600); `kunci_ruang` (`kunci` boolean); `keluarkan` (`pemainId`); `kode_masuk_ulang` (`pemainId`); `pembahasan` (`kejadianId`); `tutup_ruang`. Skema dikirim sebagai `skemaKelas`.
- P-36. Skema pesan server ke pemain: `selamat_datang`, `status_ruang`, `dunia` (paling banyak 64 pemain), `pemain_baru`, `pemain_pergi`, `pribadi`, `kejadian_terlihat`, `kompas`, `kejadian_terbuka`, `petunjuk`, `hasil_1`, `hasil_2`, `koreksi`, `pemberitahuan`, `selesai`, `galat`, `pong`. Skema dikirim sebagai `skemaServerPemain`.
- P-37. Skema pesan server ke layar kelas: `lobi` (paling banyak 50 pemain), `dunia_kelas` (paling banyak 50), `papan` (paling banyak 50), `kemajuan`, `data_pembahasan`, `status_ruang`, `galat`. Skema dikirim sebagai `skemaServerKelas`.
- P-38. Batas isi pesan mengikuti Architecture 5.4 dan 6.6: teks judul ≤ 32, situasi ≤ 280, pertanyaan ≤ 100, opsi ≤ 140, umpan balik/terjadi ≤ 160, petunjuk ≤ 120, hak/kewajiban ≤ 120, nama samaran ≤ 24. Id memakai `^[A-Za-z0-9_-]{1,32}$`. Pesan lebih dari 2.048 byte ditolak di tingkat sambungan (JS-03), bukan oleh `zod`.
- P-39. `BATAS` di `aturan.ts`: `pesanByte` 2.048; `pesanPerDetik` 20; `lonjakan` 40; `pelanggaranGalat` 3 dalam 10 detik; `pelanggaranTutup` 10; `pemainMaks` 50; `durasiMenit` [10, 15, 20]; `terlambatMenit` bawaan 5; `nomorAbsen` 1–50.

## Beberapa pemain sekaligus

- Aturan di atas murni: keadaan per pemain (muatan, waktu kotak, seq) dipegang pemanggil, sehingga 50 pemain diuji sebagai 50 keadaan terpisah tanpa saling memengaruhi.
- Urutan pilihan berbeda antarpemain karena benih menyertakan id pemain; penempatan kejadian sama untuk semua pemain di satu ruang karena memakai benih ruang saja.
- Peringkat adalah urutan total; tidak ada dua pemain berperingkat sama di satu ruang.
- Batas ukuran larik skema (`dunia` 64, `lobi` 50, `papan` 50) menjaga pesan tetap kecil untuk 50 pemain.

## Status antarmuka

Tidak ada antarmuka baru di JS-02. Halaman `/` dan `/admin/` dari JS-01 tidak berubah, dan semua status layar (biasa, fokus, nonaktif, kosong, memuat, galat, terputus, menyambung ulang, dijeda, ruang penuh, ruang terkunci) belum berlaku sampai JS-03 dan JS-07.

## Teks yang tampil (final)

Tidak ada teks baru. `app/jejak-setara/teks.ts` tidak diubah. Kode galat protokol (Architecture 6.7) disimpan sebagai konstanta, dan kalimat yang tampil dipetakan di JS-03.

## Data, protokol, API, dan migrasi

### Tipe (`tipe.ts`)

Architecture 5.1 menjadi acuan. Ditambahkan tipe: `KotakJenis` (`sepatu` | `kompas` | `buku` | `teropong` | `karcis`), `TitikPeta` (`id`, `zona`, `x`, `y` dalam ubin), `PetaJejak` (bentuk Architecture 11.1), `PemainRingkas` (`id`, `nama`, `avatar`, `warnaTas`, `skor`, `waktuSkorMs`, `langkah1Benar`, `urutanGabung`, `terhubung`), `KeadaanSkill` (`muatan: Record<SkillId, number>`, `aktifSampaiMs: Partial<Record<SkillId, number>>`, `terakhirPakaiMs: Partial<Record<SkillId, number>>`), `StatusPemainKejadian` (`belum` | `langkah1` | `langkah2` | `selesai`), dan `HasilPeriksaGerak`.

### Protokol

`PROTOKOL_VERSI` tetap 1. Skema pesan lengkap ada di `protokol.ts` dan diuji dengan contoh sah dan contoh cacat. Perubahan yang tidak kompatibel menaikkan `PROTOKOL_VERSI` (aturan wajib 14).

### API dan migrasi

Tidak ada rute API baru dan tidak ada migrasi D1. Server memakai skema dan fungsi ini mulai JS-03.

## Aset

Tidak ada aset gambar, suara, atau huruf baru.

## Keamanan dan privasi

- Inti tidak menyimpan rahasia, token, atau data pribadi; token hanya diperiksa bentuknya (43 karakter base64url).
- Semua masukan yang masuk ke inti berasal dari luar (posisi, seq, waktu) dan diperiksa sebelum dipakai; tidak ada nilai dari klien yang langsung dipercaya sebagai skor atau peringkat (aturan wajib 2).
- `.strict()` menolak kunci tambahan, sehingga payload tak dikenal tidak lolos diam-diam.
- Inti tidak memakai `fetch`, `crypto`, penyimpanan peramban, atau jam langsung; uji kemurnian menjaga hal ini.

## Di luar cakupan

- Worker, Durable Object, WebSocket, sambung ulang, batas pesan di tingkat sambungan (JS-03).
- D1, migrasi, seed bank kejadian (JS-03, JS-05).
- Skema konten dan batas panjang isi kejadian sebagai berkas (JS-05, `inti/konten/skema.ts`).
- Isi `kampung.txt`, `objek.json`, `build_peta.py`, uji keterjangkauan (JS-06).
- Kanvas, kamera, HUD, dialog, kartu dampak, rekap (JS-07 dan sesudahnya).
- Pemetaan kode galat protokol ke kalimat yang tampil (JS-03).
- Uji beban `sim:beban` (JS-03); skripnya masih mencetak "Belum tersedia".

## DRAF untuk ditinjau pemilik proyek

- **D-1. Bentuk `kampung.json`.** (a, saran) satu JSON berversi dengan `ubin` dan `tabrakan` sebagai teks RLE, koordinat dalam ubin, dan daftar objek/zone/titik/kotak/halte. Ukuran jauh lebih kecil daripada larik angka (percobaan Plan: 1.526 B vs 19.201 B pada peta sintetis) dan mudah ditinjau di GitHub Desktop. (b) Larik angka per lapisan: lebih mudah dibaca manusia, tetapi hampir menyentuh anggaran 60 KB. (c) Bitmask base64: paling kecil, tetapi sulit ditinjau dan dibuat.
- **D-2. Pemeriksaan kecepatan.** (a, saran) rumus Architecture 8.2 (kecepatan × selang × 1,25 + 4 px), dengan `dtMs` dibatasi 1.000 ms agar jeda panjang tidak menjadi lompatan. (b) Tanpa batas 1.000 ms: klien yang tertidur 30 detik bisa melaporkan lompatan besar dan tetap diterima. (c) Tanpa toleransi 1,25 + 4 px: di jaringan lambat pemain sering dikoreksi dan terasa tersentak.
- **D-3. Acak berbenih.** (a, saran) FNV-1a 32 bit atas string bagian bergabung `;`, lalu mulberry32; hasil sama di semua mesin, cepat (97 juta angka/detik di percobaan), dan sebaran baik. (b) `xorshift128+`: periode lebih panjang, keadaan lebih besar. (c) `crypto.getRandomValues`: tidak bisa diulang, sehingga penempatan tidak sama antarpemain.
- **D-4. Skema protokol.** (a, saran) semua pesan v1 dengan `.strict()` dan batas teks Architecture 5.4; klien memakai `safeParse` mulai JS-03, dengan tambahan ±14,6 KB gzip (perkiraan Plan, diukur lagi di JS-03). (b) Klien hanya memakai tipe: hemat 14,6 KB, tetapi pesan cacat tidak tertangkap. (c) Skema hanya di server: klien dan server bisa berbeda paham.
- **D-5. Batas masa.** (a, saran) 0,3 tepat sudah `siang`, 0,65 tepat sudah `sore`, jam dibulatkan ke bawah. (b) Batas atas inklusif: satu detik di perbatasan bisa masuk masa sebelumnya; tidak dipilih karena tabel PRD 8.1 memakai "0–30%", "30–65%", "65–100%".
- **D-6. Kotak kaki pemain.** (a, saran) 10 × 8 px di titik kaki, pemisahan sumbu. (b) 12 × 8: lebih sulit melewati celah sempit. (c) Tabrakan titik: avatar setengah masuk dinding.

Teks, warna, huruf, dan tata letak tidak berubah, sehingga tidak ada draf visual.

## Catatan Build (7 November 2026)

Penjelasan dan penyesuaian kecil yang ditemukan saat Build. Perilaku yang tertulis di atas tidak berubah, kecuali yang disebut di sini.

- **B-1. AC-4.** Kombinasi Langkah 1 (40 atau 0) dan tingkat (60, 25, atau 0) hanya menghasilkan 0, 25, 40, 60, 65, dan 100. Angka 85 di AC-4 salah tulis; uji memakai keenam nilai itu, dan poin tetap mengikuti PRD 8.4.
- **B-2. P-1.** Nilai awal hash adalah basis FNV 2.166.136.261. Langkah `h ^= h >>> 13` dijalankan sekali sesudah putaran, lalu hasilnya dijadikan bilangan tak bertanda (`>>> 0`). Nilai `benih` dan urutan `acakBerbenih` diuji dengan angka tetap yang juga dihitung implementasi rujukan terpisah.
- **B-3. P-15 dan P-16.** `bolehPakaiSkill` dan `pakaiSkill` menerima `{ skill, now, skillAktif, keadaan: KeadaanSkill, langkahDialog: 1 | 2 | null }`. `pakaiSkill` mengembalikan `{ diterima, keadaan }`: muatan berkurang 1, `terakhirPakaiMs` menjadi `now`, dan skill berdurasi aktif sampai `now + lama`. Pemakaian yang ditolak mengembalikan objek keadaan yang sama. Petunjuk hanya bisa dipakai saat dialog Langkah 1 terbuka (PRD 8.5, Design System 3.5); skill lain hanya tanpa dialog.
- **B-4. P-18.** Jarak kotak diukur dari posisi pemain (titik kaki, P-25) ke pusat ubin kotak, lewat `dapatMengambilKotak(jarakPx)`.
- **B-5. P-26 sampai P-28.** Dibuat dua fungsi. `langkahGerak` menggerakkan avatar di layar pemain: arah masukan yang lebih panjang dari 1 dinormalisasi, gerak dibagi menjadi langkah ≤ 4 piksel, dan di setiap langkah X diterapkan dahulu lalu Y, sehingga avatar meluncur di dinding dan tidak menembus ubin walau selangnya 1 detik. `periksaGerak` memeriksa laporan `gerak` di server: masukannya posisi sah terakhir dan isi pesan (x, y, arah, seq), bukan dx dan dy. Laporan ditolak bila seq, status, dialog, atau selang tidak sah (tanpa koreksi); bila jaraknya melebihi batas (`kecepatan`); atau bila tujuannya menabrak atau tidak bisa dicapai lewat garis lurus, "X lalu Y", maupun "Y lalu X" (`tabrakan`). Dengan begitu, avatar yang meluncur atau berbelok di sudut diterima, sedangkan lompatan menembus dinding ditolak. `HasilPeriksaGerak` ditambah `alasan`, dan `koreksi(hasil)` mengembalikan `{ x, y, seq }` hanya untuk `kecepatan` dan `tabrakan`. Architecture 8.2 disesuaikan.
- **B-6. Galat.** `GalatInti` (di `aturan.ts`) dilempar dengan `kode` `TITIK_TIDAK_CUKUP` atau `PETA_CACAT`. Kesalahan pemakaian (larik kosong di `pilih`, batas `bulat` yang salah, durasi ≤ 0, peringkat kembar, kode kejadian ganda) dilempar sebagai `RangeError`.
- **B-7. Tipe.** Ditambah `Posisi` (piksel logis) dan `WarnaTas` (delapan aksen Design System bagian 8). `PetaJejak<Lapisan = Uint8Array>`: `kampung.json` berbentuk `PetaJejak<string>`, dan `bacaPeta` mengembalikan `PetaJejak` dengan lapisan terurai. `gerbangLobi` berupa batas ubin `{ kiri, atas, kanan, bawah }`; `titikMuncul` daftar `{ x, y }`; `arah` objek boleh tidak ada; nama zona 1–32 karakter; jenis objek `^[a-z0-9_]{1,32}$`. Id titik kejadian, kotak, dan halte unik bersama, id objek unik, dan titik, kotak, serta halte harus memakai zona yang ada. Architecture 5.1 dan 11.1.1 memuat bentuk ini.
- **B-8. Protokol.** Nama isian pesan yang di Architecture 6.3 dan 6.4 hanya diringkas (misalnya `selamat_datang`, `pribadi`, `hasil_1`, `selesai`, `papan`, `data_pembahasan`) ditetapkan di `protokol.ts`. Posisi `gerak`, `dunia`, dan `koreksi` dalam piksel (0–8.192); posisi `kejadian_terlihat` dan `kompas` dalam ubin. Opsi Langkah 1 ≤ 90 dan Langkah 2 ≤ 140 karakter (Architecture 5.4). `opsiTepat` berupa daftar, karena Langkah 2 boleh punya lebih dari satu pilihan tepat. Token 43 karakter base64url berarti 32 byte acak, sehingga Architecture 6.8 ("128 bit") disesuaikan menjadi 256 bit.
- **B-9. Ukuran halaman (AC-12).** Skema di `protokol.ts` dibuat lewat fungsi dan ditandai `/* @__PURE__ */`, dan skema peta dibuat di dalam `bacaPeta`. Halaman yang hanya mengimpor `PROTOKOL_VERSI` tidak membawa zod. `bandingkanPeringkat` di Architecture 8.4 memakai tipe `DataPeringkat` (bagian dari `PemainRingkas`).
- **B-10. Kemurnian.** Selain daftar AC-1, uji kemurnian juga menolak `new Date()` tanpa argumen dan modul Node tanpa awalan `node:` (misalnya `fs`, `path`).
- **B-11. P-6.** `menitCerita` menambah 1e-9 sebelum dibulatkan ke bawah, agar galat pembulatan biner (misalnya 720 × 0,7 = 503,99999999999994) tidak menurunkan jam satu menit.
- **B-12. P-20.** Kejadian diproses menurut kode, sehingga urutan daftar masukan tidak memengaruhi titik yang didapat setiap kejadian. Kode kejadian ganda adalah kesalahan pemakaian.
- **B-13. P-39.** `BATAS` ditambah `jendelaPelanggaranMs` (10.000), `nomorAbsenMin` (1), dan `nomorAbsenMaks` (50).
- **B-14. Lingkungan uji.** Sesi Build ini tidak bisa memasang paket (jaringan mati), sehingga sebagian perintah tahap Test diganti pemeriksaan setara. Rinciannya ada di laporan uji.

## Kriteria penerimaan

- [ ] AC-1 **Kompilasi dan kemurnian.** `tsc --noEmit -p tsconfig.json --incremental false` 0 galat; ESLint `--max-warnings 0` pada `app/jejak-setara/inti` dan ujinya 0 masalah; `kemurnian.test.ts` gagal bila `inti/` mengimpor `react`, `next`, `node:*`, `@cloudflare/*`, `server/`, `app/jejak-setara/pemain`, `admin`, atau `bersama`, atau memanggil `Date.now`, `Math.random`, `performance.now`, `crypto`, `fetch`, `localStorage`, `sessionStorage`, `document`, atau `window` (komentar diabaikan saat memindai).
- [ ] AC-2 **Acak.** P-1 sampai P-4: benih sama → urutan sama (diuji dengan dua salinan modul yang diimpor ulang); `kocok` menghasilkan permutasi penuh dan tidak mengubah larik asal; `bulat` selalu di dalam batas; 10.000 benih gabungan berbeda tidak menghasilkan tabrakan pada uji contoh.
- [ ] AC-3 **Masa dan jam.** P-5 sampai P-9: nilai batas 0, 0,3, 0,65, 1; jam 06.00, 09.36, 13.48, 18.00; `formatJam` dua digit; jepitan 0–1; tanda dua menit.
- [ ] AC-4 **Skor dan peringkat.** P-10 sampai P-13: seluruh kombinasi Langkah 1 dan tingkat menghasilkan 0, 25, 40, 60, 65, 85, 100; pembanding memutus seri pada keempat tingkat; `hitungPeringkat` memberi 1..n dan tidak mengubah larik asal. **[Build]** Nilai 85 tidak mungkin dicapai dengan poin PRD 8.4; keenam kombinasi menghasilkan 0, 25, 40, 60, 65, dan 100 (catatan B-1).
- [ ] AC-5 **Skill.** P-14 sampai P-17 dan P-19: muatan maks, lama, jeda 2 detik, Petunjuk saat dialog, skill mati guru, Kompas berhenti di 2.
- [ ] AC-6 **Kotak.** P-18: muncul lagi tepat pada 90.000 ms, jangkauan 12 px (12,0 diterima; 12,1 ditolak), kotak tiap pemain terpisah.
- [ ] AC-7 **Gerak.** P-24 sampai P-28: kecepatan 72 dan 115,2; diagonal tidak lebih cepat; toleransi 1,25 + 4 px diterima, lebih ditolak; peluncuran di dinding; penolakan karena status, dialog, seq; `dtMs` > 1.000 dianggap 1.000; koreksi hanya untuk penolakan posisi.
- [ ] AC-8 **Peta.** P-29 sampai P-32: contoh peta sah terbaca; RLE cacat, jumlah sel salah, id zona ganda, koordinat di luar peta, dan kunci tambahan ditolak; `selPadat` benar di tepi dan luar peta; `uraiRle` mengembalikan larik yang tepat.
- [ ] AC-9 **Protokol.** P-33 sampai P-38: setiap pesan di Architecture 6.3 dan 6.4 punya contoh sah yang lolos dan satu contoh cacat yang ditolak; `v` selain 1 ditolak; kunci tambahan ditolak; nilai di luar batas ditolak; `PROTOKOL_VERSI` tetap 1.
- [ ] AC-10 **Kejadian.** P-20 sampai P-23: penempatan deterministik, tanpa titik ganda di zona, galat `TITIK_TIDAK_CUKUP`; keterlihatan di tepi pandangan; kejadian terdekat dan seri kode terkecil; jangkauan periksa 32 px.
- [ ] AC-11 **Uji.** `test:jejak` lulus, termasuk 23 uji JS-01 dan semua uji baru. `test` Sehari Setara tetap 14 berkas, 296 lulus, 1 dilewati. `RILIS=1 content:check` lulus.
- [ ] AC-12 **Build dan anggaran.** `build:jejak` lulus; kode layar pemain tetap sama dengan JS-01 (≈61 KB gzip, `zod` belum diimpor halaman mana pun); angka tercatat di laporan.
- [ ] AC-13 **Halaman tidak berubah.** `test:e2e:jejak` lulus (18 uji JS-01) dan halaman `/` serta `/admin/` tampil sama di empat ukuran.
- [ ] AC-14 **Galeri dan Sehari Setara.** `build:pages` lulus dan ke-178 berkas `dist-pages/` identik byte dengan `main`; `git diff --name-status` hanya memuat berkas di bagian "Berkas yang dibuat dan diubah".
- [ ] AC-15 **Dokumen.** Architecture 5.1 dan 11.1 memuat tipe dan bentuk `kampung.json` persis seperti spesifikasi ini; `PLAN.md` diperbarui; `teks.ts` tidak berubah.

## Rencana uji

### Uji unit (Vitest di Node, `app/jejak-setara/__tests__/inti/`)

- `acak.test.ts`: P-1 sampai P-4 (AC-2).
- `aturan.test.ts`: masa dan jam (P-5–P-9), skor dan peringkat (P-10–P-13), skill (P-14–P-17, P-19), kotak (P-18), kejadian (P-20–P-23) (AC-3 sampai AC-6, AC-10).
- `gerak.test.ts`: kecepatan, diagonal, toleransi, tabrakan dan peluncuran, status/dialog/seq, batas dt, koreksi (P-24–P-28) (AC-7).
- `peta.test.ts`: contoh peta sah, kasus cacat, RLE, `selPadat` (P-29–P-31) (AC-8).
- `protokol.test.ts`: setiap pesan dalam dua contoh (sah dan cacat), versi, kunci tambahan, batas angka (P-33–P-38) (AC-9).
- `kemurnian.test.ts`: pemindaian impor dan panggilan terlarang (AC-1).

### Perintah di tahap Test

`install --frozen-lockfile`; `test:jejak`; `test`; `RILIS=1 content:check`; `content:check:jejak` (mencetak "Belum tersedia"); `build:jejak`; pengukuran gzip bundel pemain dan konsol; `test:e2e:jejak` dengan `JEJAK_CHROMIUM`; `build:pages` dan perbandingan SHA-256 ke-178 berkas; `tsc --noEmit`; ESLint; `git status --ignored`; `git diff --name-status`. `sim:beban` tidak wajib: JS-02 belum punya ruang, dan skripnya masih "Belum tersedia" sampai JS-03. Tangkapan layar tidak diperlukan karena tidak ada perubahan tampilan; halaman JS-01 dibuktikan tidak berubah oleh `test:e2e:jejak`.

### Daftar periksa manual (AGENTS bagian 9)

Tidak ada butir yang berlaku: belum ada permainan, jaringan, atau perangkat. Butir privasi terpenuhi dengan sendirinya karena inti tidak menyimpan data.
