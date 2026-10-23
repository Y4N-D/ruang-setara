# F-06 — Indikator dan kartu dampak

| | |
|---|---|
| Status | Disetujui 23 Oktober 2026 (balasan `Spesifikasi disetujui: F-06`). Dua catatan Build ditandai **[Build]** |
| Tanggal | 23 Oktober 2026 |
| Rencana | `docs/sehari-setara/PLAN.md`, entri F-06 (disetujui 23 Oktober 2026 dengan balasan `Setuju: F-06`; kesembilan usulan diterima) |

## Ringkasan

F-06 menampilkan akibat setiap pilihan. Di layar permainan `sehari-setara/#main`:

1. panel kiri selalu menampilkan dua indikator, "Hak orang lain terjaga" dan "Kewajiban dijalankan", masing-masing berupa batang 10 segmen dengan angka nilai;
2. sesudah reaksi tokoh (1,2 detik), kartu dampak muncul dan menutupi panggung, panel kanan, serta panel bawah;
3. bersamaan dengan munculnya kartu, kedua batang bergerak per setengah segmen ke nilai baru, dan angka melayang seperti "+15" atau "−10" muncul di bawah ujung batang;
4. tombol "Lanjut" di kartu, yang aktif 0,6 detik sesudah kartu muncul, membawa kelas ke adegan berikutnya lewat sapuan atau pudar F-05.

Kuis peran dan bintang alasan tetap dilewati tanpa ditampilkan sampai F-08 dan F-07. Mesin F-02, naskah F-03, dan aset yang sudah Disetujui dipakai apa adanya.

Asal setiap nilai ditandai:

| Tanda | Arti |
|---|---|
| **[Dokumen]** | Dari Design System, Architecture, atau PRD; bagiannya disebut |
| **[Pemilik]** | Keputusan pemilik proyek di Gerbang 1 (usulan 1–9 entri F-06 `PLAN.md`) |
| **[Ukur]** | Diukur dengan huruf asli di Chromium 141 pada empat ukuran layar, dalam percobaan di luar repositori (23 Oktober 2026) |
| **[DRAF]** | Usulan baru dari agen. Mohon ditinjau |

Maket untuk ditinjau bersama spesifikasi ini dikirim lewat percakapan dan tidak disimpan di repositori. Tangkapan layar hasil sebenarnya disimpan di `tests/F-06/` pada tahap Test.

## Kaitan PRD

| Acuan | Yang dipenuhi F-06 |
|---|---|
| FR-07 | Sesudah reaksi tokoh, kartu dampak berisi akibat, hak yang terdampak, kewajiban terkait, dan rujukan pasal |
| FR-08 | Dua indikator 0–100 (awal 50) bergerak naik atau turun sesuai efek pilihan |
| PRD bagian 5 | TP 2 (dampak pelanggaran hak dan pengabaian kewajiban) dan TP 3 (rujukan pasal) di setiap adegan |
| PRD bagian 6 | Urutan "animasi reaksi tokoh", lalu "kartu dampak + indikator bergerak" |
| PRD bagian 10 | Empat ukuran layar, keyboard, kurangi gerak, kontras teks ≥ 4,5:1, makna tidak hanya lewat warna |
| Design System bagian 2, 3, 4, 7, 8 | Terbaca dari bangku belakang; panel kiri untuk indikator; token warna tingkat dan indikator; komponen indikator dan kartu dampak; gerak dan kurangi gerak |
| Architecture bagian 6, 9, 10 | Fase `impact`; `Spasi` dan `Enter`; dialog, `aria-live`, serta ikon dan teks tingkat |
| Keputusan Gerbang 1 | Usulan 1–9 entri F-06 `PLAN.md` |

## Perilaku

### Urutan satu adegan

| Fase | Panel indikator | Panggung | Panel bawah | Kartu dampak |
|---|---|---|---|---|
| `intro`, `discuss` | Nilai sekarang (`state.meters`) | Seperti F-05 | Seperti F-05 | Tidak tampil |
| `reaction` | Nilai sebelum memilih | Reaksi, seperti F-05 | Baris status dan pilihan terkunci, seperti F-05 | Tidak tampil |
| `impact` | Bergerak dari nilai sebelum ke nilai sesudah, dengan angka melayang | Tertutup kartu | Kosong | Tampil |
| `quiz`, `stars` | Nilai sesudah | Tidak pernah tampil sendiri, karena dilewati dalam tekanan yang sama | Kosong | Tidak tampil |
| `transition` | Nilai sesudah, tanpa angka melayang | Sapuan atau pudar, seperti F-05 | Kosong | Tidak tampil |

- "Nilai sebelum memilih" dihitung ulang dari `history` tanpa entri adegan berjalan (`metersBefore`), sehingga indikator tidak melompat saat reaksi dimulai [Pemilik, usulan 5]. `engine/` tidak berubah.
- "Nilai sesudah" adalah `state.meters`, yang sudah dibatasi 0–100 per langkah oleh F-02.
- Di layar akhir sementara (fase `ending`, `recap`, dan `reflection`), panel indikator tidak tampil, sama seperti bilah atas dan panggung (F-05). Posisi akhir indikator ditampilkan F-09.
- Pratinjau panggung (`#adegan-N`) dan layar kerangka tidak berubah.

### Panel indikator

- Panel menempati bagian kiri area panggung: dari tepi kiri layar sampai tepi kiri bingkai panggung, dan dari bawah bilah atas (8u) setinggi area panggung (52u) [Dokumen: Design System bagian 3].
- Panel berisi dua indikator berurutan [Dokumen: Design System bagian 7]:
  - "Hak orang lain terjaga", dengan ikon `ui_hak` dan warna `--ss-meter-hak` (`teal`);
  - "Kewajiban dijalankan", dengan ikon `ui_kewajiban` dan warna `--ss-meter-kewajiban` (`sky-d`).
- Setiap indikator terdiri atas baris label (ikon, lalu nama indikator) dan baris batang (batang 10 segmen, lalu angka nilai).
- Satu segmen bernilai 10. Segmen ke-i (i = 1 sampai 10) **penuh** bila nilai ≥ 10i, **separuh** bila 10i − 5 ≤ nilai < 10i, dan **kosong** bila nilai lebih kecil [Pemilik, usulan 4]. Contoh: 65 menjadi enam segmen penuh, satu separuh, dan tiga kosong; 100 menjadi sepuluh penuh; 0 menjadi sepuluh kosong.
- Angka nilai sama dengan nilai yang sedang ditampilkan batang, tanpa satuan.

### Kartu dampak

- Diberikan fase `reaction`, ketika 1.200 ms berlalu dan `REAKSI_SELESAI` dikirim (F-05), maka fase menjadi `impact` dan kartu dampak langsung tampil, tanpa animasi masuk [DRAF].
- Letak kartu [Pemilik, usulan 1; Ukur]:
  - kiri: tepi kiri bingkai panggung, yaitu lebar layar ÷ 2 − 160k;
  - atas: 9,2u, yaitu 1,2u di bawah bilah atas;
  - kanan: 2u dari tepi kanan layar;
  - bawah: 1,2u dari tepi bawah layar.

  Kartu menutupi panggung, panel kanan, dan panel bawah. Bilah atas dan panel indikator tetap terlihat. Papan tim F-07 kelak juga tertutup selama kartu tampil, sesuai bacaan FR-09 di keputusan Gerbang 1.
- Kepala kartu [Dokumen: Design System bagian 7; ikon: Pemilik, usulan 2]:
  - latar warna tingkat: `--ss-tier-tepat` (`leaf`), `--ss-tier-kurang` (`mango`), atau `--ss-tier-berisiko` (`coral`);
  - ikon tingkat dari ikon emosi D-09: `hati` untuk tepat, `keringat` untuk kurang tepat, dan `seru` untuk berisiko. Ikon 8×8 itu ditampilkan selebar 16 piksel antarmuka (dua kali lipat). Aturan ini sama dengan ikon reaksi di naskah F-03;
  - tulisan tingkat;
  - di kanan, "Kelas memilih X." (teks F-05).
- Isi kartu dua kolom [Pemilik, usulan 1]:
  - kolom kiri: "Yang terjadi" (`choice.impact.terjadi`), "Hak yang terdampak" (`impact.hak`), dan "Kewajiban terkait" (`impact.kewajiban`);
  - kolom kanan: "Rujukan", berisi `impact.rujukan` berurutan, satu butir per rujukan, dengan teks persis seperti `references.ts` [Pemilik, usulan 7: tanpa tanda "perlu verifikasi"].
- Kaki kartu berisi tombol "Lanjut" di kanan.
- Isi kartu tidak bergantung pada bendera. Varian adegan 6 hanya mengubah narasi dan teks pilihan B (F-05).

### Gerak indikator dan angka melayang

- Diberikan kartu baru tampil dan kurangi gerak tidak aktif, maka kedua batang bergerak bersamaan dari nilai sebelum ke nilai sesudah, satu setengah segmen (5 poin) setiap 100 ms [Pemilik, usulan 5; 100 ms: DRAF]:
  - nilai pada waktu t = sebelum + arah × 5 × min(langkah, bawah(t ÷ 100)), dengan langkah = |sesudah − sebelum| ÷ 5 dan arah +1 atau −1;
  - langkah paling banyak 4, karena efek terbesar 20, sehingga gerak selesai paling lambat 400 ms sesudah kartu tampil;
  - angka nilai ikut berubah pada setiap langkah;
  - indikator yang nilainya tidak berubah tidak bergerak.
- Bersamaan dengan itu, angka melayang tampil di bawah ujung kanan baris batang setiap indikator [Pemilik, usulan 3]:
  - teksnya adalah efek pilihan menurut naskah (`choice.effects`): "+15" untuk efek positif, "−10" untuk efek negatif (tanda minus U+2212), dan "0" untuk efek nol;
  - teks itu tetap sama walaupun batang sudah mentok di 0 atau 100. Contoh: pada jalur semua B, hak di adegan 5 tetap 100 dengan angka "+15";
  - latar kotak angka `leaf` untuk efek positif, `coral` untuk negatif, dan `mist` untuk nol, dengan teks `ink`. Makna tetap terbaca dari tanda + atau − dan angkanya, tidak hanya dari warna;
  - huruf Pixelify Sans, karena Press Start 2P tidak memuat tanda minus U+2212 [Ukur];
  - kotak angka muncul sambil naik 4 piksel antarmuka dalam dua langkah selama 240 ms, lalu tetap terlihat sampai kartu ditutup [DRAF].
- Diberikan kurangi gerak aktif, maka batang dan angka nilai langsung menunjukkan nilai sesudah saat kartu tampil, dan angka melayang tidak tampil [Dokumen: Design System bagian 8].

### Tombol "Lanjut" kartu dan pengaman tekanan ganda

- Selama 600 ms pertama sejak kartu tampil, tombol "Lanjut" tidak menerima klik, `Enter` atau `Spasi` pada tombol, maupun `Spasi` atau `Enter` saat fokus tidak di tombol [Pemilik, usulan 6]. Nilai 600 ms dipilih tetap agar gerak indikator, yang paling lama 400 ms, selalu sudah selesai [DRAF].
  - Selama masa tunggu, tombol tetap terlihat dengan tampilan biasa, diberi `aria-disabled="true"`, dan tidak berubah warna saat diarahkan tetikus.
  - Masa tunggu yang sama berlaku dengan atau tanpa kurangi gerak.
- Diberikan 600 ms sudah berlalu, ketika "Lanjut" diaktifkan (klik; `Enter` atau `Spasi` pada tombol yang berfokus; `Spasi` atau `Enter` saat fokus tidak di tombol atau tautan), maka [Pemilik, usulan 8]:
  1. kartu ditutup dan angka melayang hilang;
  2. aksi `bridgeActions(scene)` dikirim berurutan: `LANJUT`; hanya di adegan 5, `JAWAB_KUIS` dengan jawaban naskah lalu `LANJUT`; kemudian `BERI_BINTANG` 0;
  3. di adegan 1 sampai 5, sapuan atau pudar F-05 berjalan ke adegan berikutnya; di adegan 6, layar akhir sementara langsung tampil.
- Tombol "Lanjut" kartu hanya berlaku sekali per adegan. Klik ganda, tekanan kedua, atau tombol yang ditahan (`repeat`) tidak melewati adegan.
- Tombol "Lanjut" jembatan di baris status (F-05) tidak muncul lagi pada pemakaian biasa, karena fase `quiz` dan `stars` dilewati dalam tekanan yang sama. Kode jembatan untuk kedua fase itu tetap ada sebagai pengaman sampai F-07 dan F-08.
- Selama kartu tampil, `Esc`, angka, dan huruf tidak berpengaruh.

### Fokus, dialog, dan pembaca layar

- Kartu memakai `role="dialog"` dan `aria-modal="true"`. Namanya diambil dari judul kartu, misalnya "Kartu dampak: Tepat"; awalan "Kartu dampak: " hanya terbaca pembaca layar [Dokumen: Architecture bagian 10].
- Saat kartu tampil, fokus pindah ke judul kartu, yang bisa difokus lewat kode, sehingga `Spasi` tidak menekan tombol tanpa sengaja. Tab berikutnya berpindah ke "Lanjut". Selama kartu tampil, Tab dan Shift+Tab selalu kembali ke "Lanjut", sehingga fokus tidak keluar dari kartu [DRAF].
- Judul kartu yang berfokus diberi garis fokus 2 px `ink` berjarak 4 px, sama dengan pertanyaan F-05.
- Sesudah "Lanjut", fokus pindah ke tombol lanjut kotak narasi adegan berikutnya, atau ke judul layar akhir sementara sesudah adegan 6, sama dengan aturan F-05. Architecture bagian 10 meminta fokus kembali ke tombol pemicu; kartu dampak tidak punya tombol pemicu karena muncul sendiri, jadi bagian itu diperjelas [DRAF].
- Wilayah `aria-live="polite"` layar permainan berisi pengumuman kartu satu kali, saat kartu tampil, dengan atau tanpa kurangi gerak [Dokumen: Architecture bagian 10; Pemilik, usulan 3]. Susunannya ada di bagian "Teks yang tampil".
- Setiap indikator memakai `role="meter"` dengan `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` sama dengan nilai yang sedang tampil, `aria-valuetext` seperti "60 dari 100", dan nama dari labelnya. Panel indikator adalah grup bernama "Indikator".
- Segmen, ikon, dan angka melayang disembunyikan dari pembaca layar, karena isinya sudah ada di nilai indikator dan pengumuman. Ikon tingkat dan ikon indikator bersifat hiasan, karena tulisannya sudah ada. **[Build]** Keduanya dipasang sebagai gambar latar dengan `aria-hidden="true"`, bukan `<img alt="">`, karena aturan ESLint repositori menolak elemen `<img>`.
- Judul kartu memakai `<h2>` dan judul bagian `<h3>`, di bawah `<h1>` tersembunyi F-05.

### Tata letak dan ukuran [Ukur]

p adalah satu piksel antarmuka (`--ss-px`, F-05): 2 px di 1280×720, 1366×768, dan 1024×768, serta 3 px di 1920×1080.

| Ruang tampilan | 1u | k | p | Lebar panel indikator = tepi kiri kartu |
|---|---|---|---|---|
| 1280×720 | 7,2 px | 2 | 2 px | 44,4u (320 px) |
| 1366×768 | 7,68 px | 2 | 2 px | 47,2u (362,7 px) |
| 1920×1080 | 10,8 px | 3 | 3 px | 44,4u (480 px) |
| 1024×768 (layar 1024×576) | 5,76 px | 1,664 | 2 px | 42,7u (245,8 px) |

Panel indikator:

| Bagian | Nilai |
|---|---|
| Panel | Kiri 0; atas 8u; lebar sampai tepi kiri bingkai panggung; tinggi 52u; jarak dalam 3u atas dan 2u kiri-kanan |
| Antarindikator | Celah 7u, sebagai tempat angka melayang indikator pertama. **[Build]** Semula 6u; diubah 23 Oktober 2026 dengan persetujuan pemilik proyek, karena angka melayang yang sedang naik sempat menyentuh label kedua di 1920×1080 dan 1024×768 |
| Baris label | Ikon 16p × 16p, piksel tajam; celah 1u; Pixelify Sans 2,5u, tinggi baris 1,3, `ink` |
| Baris batang | 0,8u di bawah baris label; celah batang ke angka nilai 1,2u |
| Batang | Latar `ink`, jarak dalam p, celah antarsegmen p; segmen 6p × 10p; ukuran utuh 71p × 12p |
| Segmen | Kosong `cream`; penuh warna indikator; separuh: 3p kiri warna indikator dan 3p kanan `cream` |
| Angka nilai | Press Start 2P 2,8u, tinggi baris 1, `ink` |
| Angka melayang | Rata kanan dengan baris batang, 0,6u di bawahnya; garis `ink` p; jarak dalam 0,3u × 0,8u; Pixelify Sans 3,1u, tinggi baris 1,1 |

Hasil pengukuran panel indikator:

- ruang dalam panel 38,7u (1024×768), 40,4u (1280×720 dan 1920×1080), dan 43,3u (1366×768);
- baris batang terlebar (nilai 100) 28,3u sampai 34,2u, jadi selalu muat;
- kedua label muat dalam satu baris di keempat ukuran;
- dengan celah 6u semula, jarak angka melayang pertama ke label kedua 0,7u sampai 0,9u saat diam, tetapi kurang dari tinggi geraknya (4p); dengan celah 7u, uji ujung ke ujung memastikan keduanya tidak bertumpuk di keempat ukuran;
- angka melayang kedua berakhir paling bawah sekitar 44,3u dari atas layar, masih di dalam area panggung yang berakhir di 60u.

Kartu dampak:

| Bagian | Nilai |
|---|---|
| Kartu | Bingkai piksel F-05: garis `ink` 2p, sudut terpotong p, sorotan `white` p, latar `cream` |
| Kepala | Jarak dalam 0,9u atas-bawah dan 2,4u kiri-kanan; garis bawah `ink` 2p; celah 1,2u |
| Ikon tingkat | 16p × 16p, piksel tajam |
| Tulisan tingkat | Press Start 2P 2,8u, tinggi baris 1,3, `ink` |
| "Kelas memilih X." | Pixelify Sans 2,8u, tinggi baris 1,3, `ink`, di ujung kanan kepala |
| Isi | Dua kolom dengan perbandingan lebar 1,1 : 1; celah kolom 3u; celah antarbagian 1,2u; jarak dalam 1,4u atas, 2,4u kiri-kanan, 0,6u bawah |
| Judul bagian | Pixelify Sans 2,5u, tinggi baris 1,3, `dusk`; celah 0,3u ke teksnya |
| Teks "Yang terjadi" | Pixelify Sans 3,6u (sama dengan narasi), tinggi baris 1,35, `ink` |
| Teks hak, kewajiban, dan rujukan | Pixelify Sans 3,1u, tinggi baris 1,3, `ink` |
| Butir rujukan | Celah antarbutir 0,6u; menjorok 1,8u; penanda kotak `ink` 2p × 2p di tengah baris pertama |
| Kaki | Jarak dalam 0,4u atas, 2,4u kiri-kanan, dan 1,2u bawah; tombol `ss-next` F-05 di kanan |

Hasil pengukuran ke-18 kartu di keempat ukuran: isi tidak pernah meluap. Sisa ruang terkecil 15,7u (1024×768, adegan 5 pilihan B) sampai 17,5u (1280×720 dan 1920×1080), dan tidak ada kata yang meluap ke samping.

### Waktu dan pengatur waktu

- Gerak indikator dihitung dari waktu berlalu sejak kartu tampil (`performance.now()`), seperti teks per huruf F-05, sehingga nilai tetap benar walaupun peramban terlambat menjalankan pengatur waktu.
- Pengatur waktu gerak dan pengaman 600 ms ada di `PlayScreen.tsx`, dibersihkan saat fase berganti atau layar ditutup, dan tidak mengirim aksi dua kali walaupun `StrictMode` menjalankan efek dua kali. Reducer tetap tanpa `setTimeout`.

### Uji aset dan galeri

- Uji palet F-12 tetap lulus. Warna baru di `game.css` hanya token yang sudah ada (`--ss-meter-*`, `--ss-tier-*`, `--ss-leaf`, `--ss-coral`, `--ss-mist`, `--ss-ink`, `--ss-cream`, `--ss-dusk`).
- Berkas galeri tidak berubah. Uji build membandingkan `index.html`, `main-*.css`, `main-*.js`, dan `jsx-runtime-*.js` dengan build sebelum F-06 (catatan PLAN "Semua fitur").

## Status antarmuka

| Bagian | Status | Tampilan |
|---|---|---|
| Indikator | Diam | Segmen sesuai nilai, angka nilai di kanan batang |
| | Bergerak | Segmen berubah satu setengah segmen setiap 100 ms, dan angka nilai ikut berubah |
| | Mentok di 0 atau 100 | Batang tidak bergerak; angka melayang tetap menampilkan efek naskah |
| | Kurangi gerak | Langsung nilai sesudah, tanpa angka melayang |
| | Mode warna paksa | Batang memakai `forced-color-adjust: none` agar segmen tetap terlihat; angka nilai tetap terbaca |
| Angka melayang | Naik, turun, nol | Latar `leaf` dengan "+n", `coral` dengan "−n", `mist` dengan "0"; teks `ink` |
| Kartu | Tepat | Kepala `leaf`, ikon hati, "Tepat" |
| | Kurang tepat | Kepala `mango`, ikon keringat, "Kurang tepat" |
| | Berisiko | Kepala `coral`, ikon seru, "Berisiko" |
| | Mode warna paksa | Sudut terpotong dimatikan seperti F-05; tulisan tingkat tetap terbaca |
| Tombol "Lanjut" kartu | Tertahan (0–600 ms) | Tampilan biasa `cream`, `aria-disabled="true"`, tanpa warna arah tetikus |
| | Siap | Seperti `ss-next` F-05: `cream`; saat fokus atau arah, `sun` dengan kursor ▶ |
| Judul kartu | Berfokus | Garis fokus 2 px `ink` berjarak 4 px |
| Panel bawah | Fase `impact` | Kosong, dan tertutup kartu |
| Kosong | Tidak berlaku | Setiap pilihan punya isi dampak dan minimal satu rujukan (aturan skema F-03) |
| Galat | Ikon gagal dimuat | Tulisan tingkat dan nama indikator tetap tampil; gambar yang gagal ditangkap uji ujung ke ujung sebagai respons 4xx |

Kontras teks baru:

| Pasangan | Rasio |
|---|---|
| `ink` di atas `leaf`, `mango`, `coral` (tulisan tingkat, "Kelas memilih X.", angka melayang) | 8,3 : 1, 6,9 : 1, dan 5,1 : 1 [Dokumen] |
| `ink` di atas `mist` (angka melayang nol) | 9,5 : 1 |
| `dusk` di atas `cream` (judul bagian) | 8,2 : 1 [Dokumen] |
| `ink` di atas `cream` (isi kartu, label, dan angka nilai) | 13,3 : 1 [Dokumen] |

## Teks yang tampil (final)

Teks baru berasal dari `app/sehari-setara/content/copy.ts`. Isi kartu berasal dari `scenes.ts` dan `references.ts` tanpa perubahan.

| Tempat | Teks | Asal |
|---|---|---|
| Nama grup panel indikator (hanya pembaca layar) | Indikator | DRAF |
| Label indikator pertama | Hak orang lain terjaga | Dokumen: Design System bagian 7 |
| Label indikator kedua | Kewajiban dijalankan | Dokumen: Design System bagian 7 |
| Nilai indikator bagi pembaca layar | 60 dari 100 (angka mengikuti nilai) | DRAF |
| Angka melayang | +15, −10, atau 0 (angka mengikuti efek; tanda minus U+2212) | Dokumen: Design System bagian 7; Pemilik, usulan 3 |
| Awalan judul kartu (hanya pembaca layar) | Kartu dampak: | DRAF |
| Tulisan tingkat tepat | Tepat | DRAF; kata dari PRD bagian 8 |
| Tulisan tingkat kurang tepat | Kurang tepat | DRAF; kata dari PRD bagian 8 |
| Tulisan tingkat berisiko | Berisiko | DRAF; kata dari PRD bagian 8 |
| Kanan kepala kartu | Kelas memilih A. (B, C) | Teks F-05 |
| Judul bagian | Yang terjadi; Hak yang terdampak; Kewajiban terkait; Rujukan | Dokumen: Design System bagian 7 |
| Tombol kartu | Lanjut | Teks F-05 |

Pengumuman kartu di wilayah `aria-live` [DRAF] disusun dari bagian berikut, dipisahkan satu spasi:

1. `Kartu dampak: {tulisan tingkat}.`
2. Kalimat indikator hak, lalu kalimat indikator kewajiban: `{nama indikator} {angka melayang}, menjadi {nilai sesudah}.` Bila nilai sesudah sama dengan nilai sebelum: `{nama indikator} {angka melayang}, tetap {nilai}.`
3. `Yang terjadi: {terjadi}` `Hak yang terdampak: {hak}` `Kewajiban terkait: {kewajiban}`
4. `Rujukan: {rujukan 1}; {rujukan 2}; …; {rujukan terakhir}.`

Contoh, adegan 2 pilihan A pada jalur semua A:

> Kartu dampak: Berisiko. Hak orang lain terjaga −10, menjadi 30. Kewajiban dijalankan −20, menjadi 15. Yang terjadi: Nara sampai lebih cepat, tetapi berboncengan tanpa helm dengan pengendara yang belum punya SIM membahayakan keselamatan keduanya. Mereka juga melanggar aturan lalu lintas. Hak yang terdampak: Hak atas pendidikan dan rasa aman. Kewajiban terkait: Kewajiban menaati aturan lalu lintas. Rujukan: Pasal 28G ayat (1) UUD NRI 1945; Pasal 31 ayat (1) UUD NRI 1945; Pasal 27 ayat (1) UUD NRI 1945; UU No. 22 Tahun 2009 tentang LLAJ, Pasal 77 ayat (1) dan Pasal 106 ayat (8).

Contoh kalimat indikator yang mentok, adegan 5 pilihan B pada jalur semua B: "Hak orang lain terjaga +15, tetap 100. Kewajiban dijalankan +15, tetap 100."

Teks bilah atas, layar kerangka, pratinjau, layar akhir sementara, dan naskah tidak berubah.

## Data dan aksi

`engine/` tidak berubah. `GameState`, tipe, reducer, dan aturan F-02 dipakai apa adanya, dan tidak ada aksi reducer baru.

### Aksi yang dikirim layar permainan

| Saat | Aksi |
|---|---|
| Sampai `REAKSI_SELESAI` | Sama dengan F-05 |
| "Lanjut" kartu dampak, sesudah 600 ms | `bridgeActions(scene)`: `LANJUT`; hanya di adegan 5, `JAWAB_KUIS` dengan `roleQuiz.answer` lalu `LANJUT`; kemudian `BERI_BINTANG` 0 |
| Tengah sapuan (200 ms), akhir pudar keluar (75 ms), atau fase `transition` adegan 6 | `LANJUT`, sama dengan F-05 |
| "Main lagi dari adegan 1" | Sama dengan F-05; indikator kembali 50 dan 50 karena `history` kosong |

Catatan terhadap rencana [DRAF]: entri F-06 di `PLAN.md` menyebut `bridgeActions` dipecah. Ternyata urutan aksinya sudah tepat untuk tombol kartu, sehingga yang berubah hanya pemicunya. Akibatnya `ui/controls.ts`, `__tests__/controls.test.ts`, dan `ui/layout.ts` tidak perlu diubah. `keyCommand` F-05 sudah memetakan `Spasi` dan `Enter` di fase `impact` ke perintah lanjut.

### Berkas dan ekspor

`app/sehari-setara/ui/impact.ts` berisi fungsi murni yang diuji unit:

| Ekspor | Isi |
|---|---|
| `METER_STEP_MS`, `IMPACT_GUARD_MS`, `METER_SEGMENTS` | 100, 600, dan 10 |
| `TIER_ICON` | `{ tepat: "hati", kurang: "keringat", berisiko: "seru" }`, berupa kunci `emoteIcons` di manifest |
| `SegmentFill` | `"penuh" \| "separuh" \| "kosong"` |
| `segmentFills(value)` | Sepuluh `SegmentFill` sesuai aturan di bagian "Panel indikator" |
| `metersBefore(history, scenes, sceneId)` | Indikator dari `history` tanpa entri `sceneId`, memakai `metersFromHistory` F-02 |
| `meterSteps(before, after)` | \|sesudah − sebelum\| ÷ 5 |
| `meterValueAt(before, after, elapsedMs, stepMs?)` | Nilai yang tampil pada waktu itu, sesuai rumus di bagian "Gerak indikator" |
| `effectText(effect)` | "+15", "−10", atau "0" |
| `effectDirection(effect)` | `"naik"`, `"turun"`, atau `"nol"` |
| `meterSentence(label, effect, before, after)` | Kalimat indikator untuk pengumuman |
| `impactAnnouncement(choice, before, after)` | Pengumuman kartu lengkap |

Berkas lain:

| Berkas | Isi |
|---|---|
| `ui/Meters.tsx` | `Meters({ values, effects, scale })`: panel indikator. `values` adalah nilai yang tampil; angka melayang tampil bila `effects` tidak `null` |
| `ui/ImpactCard.tsx` | `ImpactCard({ choice, scale, ready, onNext })`: kartu dampak sebagai dialog; memfokuskan judulnya saat tampil; menahan Tab di dalam kartu; tombol "Lanjut" bekerja hanya bila `ready` |
| `ui/PlayScreen.tsx` | Menghitung nilai tampil (sebelum, bergerak, atau sesudah); pengatur waktu gerak dan pengaman 600 ms; kartu di fase `impact` dengan panel bawah kosong; `BRIDGE_PHASES` menjadi `quiz` dan `stars`; pengumuman `aria-live` |
| `content/copy.ts` | Bagian baru `meters` dan `impact` berisi teks di atas |
| `styles/game.css` | `.ss-play` mendapat `position: relative`; kelas panel indikator dan kartu; keyframes `ss-delta-rise`; aturan kurangi gerak |

Kelas CSS baru berawalan `ss-`: `ss-meters`, `ss-meter`, `ss-meter-label`, `ss-meter-icon`, `ss-meter-name`, `ss-meter-row`, `ss-meter-bar`, `ss-meter-seg`, `ss-meter-value`, `ss-meter-delta`, `ss-impact`, `ss-impact-head`, `ss-impact-icon`, `ss-impact-title`, `ss-impact-choice`, `ss-impact-body`, `ss-impact-col`, `ss-impact-part`, `ss-impact-label`, `ss-impact-terjadi`, `ss-impact-text`, `ss-impact-refs`, dan `ss-impact-foot`. Keyframes baru: `ss-delta-rise`. Tidak ada token `:root` baru.

### Perubahan dokumen (Build)

- `Design_System.md` naik ke versi 0.6:
  - bagian 7, Indikator: ukuran segmen dan batang dalam piksel antarmuka, setengah segmen, serta letak dan warna angka melayang;
  - bagian 7, Kartu dampak: letak lebar, dua kolom, ukuran huruf, ikon tingkat dari ikon emosi, pengaman 600 ms, dan bacaan FR-09 "papan tim selalu terlihat, kecuali saat sebuah dialog terbuka" [Pemilik, usulan 1];
  - bagian 8: gerak indikator 100 ms per setengah segmen (paling lama 400 ms), angka melayang 240 ms, dan perilaku kurangi gerak.
- `Architecture.md` naik ke versi 0.8:
  - bagian 3: berkas `ui/impact.ts`;
  - bagian 7: panel indikator, kartu dampak, nilai sebelum memilih, dan jembatan sementara yang kini hanya melewati kuis dan bintang;
  - bagian 9: `Spasi` dan `Enter` di fase `impact`;
  - bagian 10: fokus kartu dampak yang tidak punya tombol pemicu, dan isi pengumuman kartu;
  - bagian 12: cakupan uji ujung ke ujung F-06.
- `PLAN.md`: status F-06, tautan spesifikasi dan laporan, serta catatan untuk Plan berikutnya:
  - F-07: papan tim tertutup kartu dampak selama kartu tampil (bacaan FR-09), dan bagian bintang di `bridgeActions` diganti;
  - F-08: bagian kuis di `bridgeActions` diganti.

Perbedaan dengan daftar file di rencana:

- Tidak diubah: `ui/controls.ts`, `__tests__/controls.test.ts`, dan `ui/layout.ts` (lihat catatan di "Aksi yang dikirim layar permainan").
- Ditambah: `e2e/bantuan.ts`, untuk fungsi uji bersama yang menunggu kartu dan menekan "Lanjut" sesudah masa tunggu.

## Aset

Tidak ada aset baru, dan tidak ada PNG yang berubah. F-06 memakai aset yang sudah Disetujui lewat manifest:

- `icons.hak` (`ui_hak`, D-01) dan `icons.kewajiban` (`ui_kewajiban`, D-02) untuk panel indikator;
- `emoteIcons.hati`, `emoteIcons.keringat`, dan `emoteIcons.seru` (D-09) untuk ikon tingkat.

Ikon tingkat setiap pilihan sama dengan ikon emosi reaksinya, sehingga gambarnya sudah dimuat sejak reaksi. `manifest.ts`, `CREDITS.md`, `Daftar_Aset.md`, dan kit gambar tidak berubah. Placeholder tidak diperlukan.

## Di luar cakupan

- Papan tim, giliran, bintang alasan, pengatur waktu, serta tombol `P`, `T`, `S`, dan `0` `1` `2` (F-07).
- Tampilan kuis peran (F-08).
- Layar akhir, posisi akhir indikator, timbangan, rekap, dan refleksi (F-09).
- Layar judul, pengaturan, prolog, `Esc`, dan pengaturan kurangi gerak di dalam game (F-10).
- Tautan dari galeri dan pemeriksaan ketat rujukan di CI (F-11).
- Efek suara dampak positif dan negatif (F-13, P1).
- Menutup kartu tanpa melanjutkan, atau kembali ke kartu adegan sebelumnya (FR-18, F-13).
- Garis ambang 40 dan 75 pada batang, angka efek di dalam kartu, tanda "perlu verifikasi" pada rujukan, dan indikator di pratinjau panggung.
- Perubahan pada `engine/`, naskah, rujukan, `Verifikasi_Rujukan.md`, aset, kit gambar, `Stage.tsx`, `Sprite.tsx`, `DayArc.tsx`, `StagePreview.tsx`, `controls.ts`, `layout.ts`, file galeri, `vite.pages.config.ts`, `package.json`, `pnpm-lock.yaml`, dan workflow.

## Kriteria penerimaan

- [ ] AC-1 **Panel indikator**, di 1280×720, 1366×768, 1920×1080, dan 1024×768:
  - tampil di fase `intro` sampai `transition` di keenam adegan, dan tidak tampil di layar kerangka, pratinjau, dan layar akhir sementara;
  - kiri 0, atas 8u, lebar sampai tepi kiri bingkai panggung, dan tinggi 52u (±1 px);
  - dua indikator berurutan berlabel "Hak orang lain terjaga" dan "Kewajiban dijalankan", masing-masing satu baris, dengan ikon `ui_hak` dan `ui_kewajiban` berukuran 16p × 16p;
  - batang 71p × 12p berisi sepuluh segmen 6p × 10p, dan isi panel tidak meluap.
- [ ] AC-2 **Nilai yang tampil**, pada jalur semua A, semua B, dan semua C:
  - di fase `intro` dan `discuss` adegan n, angka nilai dan `aria-valuenow` sama dengan `metersFromHistory` pilihan sebelum adegan n (50 dan 50 di adegan 1);
  - selama reaksi, nilai masih sama dengan nilai sebelum memilih;
  - sesudah gerak selesai dan selama pergantian adegan, nilai sama dengan indikator sesudah memilih.
- [ ] AC-3 **Segmen**: `data-isi` kesepuluh segmen selalu sama dengan `segmentFills(nilai yang tampil)`. Misalnya nilai 65 tampil sebagai 6 penuh, 1 separuh, dan 3 kosong, dengan warna indikator tepat di 3p kiri segmen separuh.
- [ ] AC-4 **Gerak indikator**, dengan jam uji yang dijeda: pada 0, 100, 200, 300, dan 400 ms sesudah kartu tampil, nilai kedua indikator sama dengan `meterValueAt`; kedua indikator bergerak bersamaan; sesudah 400 ms nilainya tidak berubah lagi.
- [ ] AC-5 **Angka melayang**:
  - teks kedua angka sama dengan `effectText` efek pilihan, termasuk "0" (hak pada 2C dan 3C, kewajiban pada 6C) dan "+15" ketika batang tetap 100 (jalur semua B, adegan 5);
  - tanda minus adalah U+2212, dengan huruf Pixelify Sans;
  - latar `rgb(138, 217, 91)`, `rgb(255, 107, 91)`, atau `rgb(201, 212, 229)` menurut arah, dengan teks `rgb(31, 42, 68)`;
  - animasi `ss-delta-rise` selama 240 ms dengan `steps(2)`; angka tetap terlihat sampai kartu ditutup, lalu hilang;
  - angka melayang pertama tidak bertumpuk dengan label indikator kedua.
- [ ] AC-6 **Isi kartu**, untuk ke-18 pilihan (jalur semua A, semua B, dan semua C):
  - kartu tampil 1.200 ms sesudah memilih (toleransi −50 sampai +400 ms);
  - kepala berlatar `rgb(138, 217, 91)` untuk tepat, `rgb(255, 159, 28)` untuk kurang tepat, dan `rgb(255, 107, 91)` untuk berisiko; ikon `emote_hati`, `emote_keringat`, atau `emote_seru`; tulisan "Tepat", "Kurang tepat", atau "Berisiko"; dan "Kelas memilih X.";
  - judul bagian sesuai teks final, isi bagian sama dengan `choice.impact`, dan butir rujukan sama dengan `impact.rujukan` berurutan.
- [ ] AC-7 **Letak dan ukuran kartu**, di keempat ukuran:
  - kiri sama dengan tepi kiri bingkai panggung, atas 9,2u, jarak kanan 2u, dan jarak bawah 1,2u (±1 px);
  - ukuran huruf sesuai tabel kartu dampak (±0,05u);
  - isi ke-18 kartu tidak meluap ke bawah maupun ke samping;
  - panel bawah tidak menampilkan apa pun selama fase `impact`, sedangkan bilah atas dan panel indikator tidak tertutup.
- [ ] AC-8 **Fokus dan dialog**:
  - kartu ber-`role="dialog"` dan `aria-modal="true"`, dengan nama "Kartu dampak: " diikuti tulisan tingkat;
  - fokus berada di judul kartu saat kartu tampil; Tab berpindah ke "Lanjut", lalu Tab dan Shift+Tab berikutnya tetap di "Lanjut";
  - `Escape`, `1`, dan `b` tidak berpengaruh;
  - sesudah "Lanjut", fokus berada di tombol lanjut kotak narasi adegan berikutnya, atau di judul layar akhir sementara sesudah adegan 6.
- [ ] AC-9 **Pengaman tekanan ganda**, dengan jam uji yang dijeda:
  - pada 599 ms, "Lanjut" ber-`aria-disabled="true"`, dan klik, `Spasi`, maupun `Enter` tidak berpengaruh;
  - pada 600 ms, satu `Spasi` melanjutkan permainan;
  - klik ganda atau dua `Enter` cepat sesudah masa tunggu hanya memajukan satu adegan;
  - tekanan `repeat` diabaikan.
- [ ] AC-10 **Lanjut ke adegan berikutnya**:
  - dari adegan 1 sampai 5, sapuan atau pudar F-05 berjalan dan narasi adegan berikutnya tampil;
  - di adegan 5, kuis tidak tampil;
  - dari adegan 6, layar akhir sementara langsung tampil;
  - tombol "Lanjut" jembatan di baris status tidak pernah tampil.
- [ ] AC-11 **Kurangi gerak**, dengan `prefers-reduced-motion: reduce`:
  - nilai langsung menjadi nilai sesudah saat kartu tampil;
  - angka melayang tidak tampil;
  - `document.getAnimations()` kosong selama kartu tampil;
  - pengaman 600 ms tetap berlaku.
- [ ] AC-12 **Pembaca layar**:
  - wilayah `aria-live` berisi `impactAnnouncement` satu kali saat kartu tampil, dengan atau tanpa kurangi gerak;
  - setiap indikator ber-`role="meter"` dengan `aria-valuemin` 0, `aria-valuemax` 100, serta `aria-valuenow` dan `aria-valuetext` sesuai nilai yang tampil;
  - panel indikator bernama "Indikator";
  - segmen, ikon, dan angka melayang tersembunyi dari pembaca layar;
  - judul kartu `<h2>` dan judul bagian `<h3>`.
- [ ] AC-13 **Kontras**: rasio terukur ≥ 4,5:1 untuk tulisan tingkat, "Kelas memilih X.", judul bagian, isi kartu, label dan angka nilai indikator, serta angka melayang, di keempat ukuran.
- [ ] AC-14 **Main sampai akhir**: dengan keyboard saja di 1280×720, jalur semua A, semua B, semua C, dan B-B-B-C-C-C berjalan dari adegan 1 sampai layar akhir sementara, dengan 0 galat konsol, 0 respons 4xx/5xx, dan 0 permintaan ke host lain.
- [ ] AC-15 **Uji unit**: `impact.test.ts` lulus, mencakup:
  - konstanta;
  - `segmentFills` untuk 0, 5, 10, 45, 50, 65, 75, 95, dan 100;
  - `meterSteps` dan `meterValueAt` untuk nilai naik, turun, mentok, dan efek nol;
  - `effectText` dan `effectDirection`;
  - `metersBefore` dengan naskah asli pada tiga jalur;
  - `meterSentence` dan `impactAnnouncement`, termasuk kedua contoh di bagian "Teks yang tampil";
  - `TIER_ICON` sama dengan ikon emosi reaksi ke-18 pilihan;
  - `IMPACT_GUARD_MS` ≥ 4 × `METER_STEP_MS`.

  Uji unit lain lulus tanpa perubahan.
- [ ] AC-16 **Uji F-04 dan F-05 yang disesuaikan**: ke-28 uji ujung ke ujung lama lulus dengan penyesuaian di bagian "Rencana uji".
- [ ] AC-17 **Build**:
  - `build:pages` lulus;
  - JS permainan ≤ 150 KB gzip, tanpa penanda `__THREE__`;
  - semua `src` dan `href` HTML permainan relatif;
  - `index.html`, `main-*.css`, `main-*.js`, dan `jsx-runtime-*.js` identik byte dengan build sebelum F-06.
- [ ] AC-18 **Pemeriksaan kode**:
  - `tsc --noEmit` seluruh proyek tanpa galat;
  - ESLint `--max-warnings 0` lulus pada semua berkas kode baru dan yang diubah;
  - tidak ada `any`;
  - `engine/` tidak berubah dan tetap tanpa `setTimeout`;
  - pengatur waktu layar permainan dibersihkan saat layar ditutup.
- [ ] AC-19 **Dokumen dan cakupan**:
  - perubahan dokumen sesuai bagian "Perubahan dokumen";
  - `git diff --name-status` hanya memuat berkas yang disebut spesifikasi ini dan tangkapan layar bukti di `tests/F-06/`;
  - `package.json`, `pnpm-lock.yaml`, `scenes.ts`, `references.ts`, `content.test.ts`, dan `Verifikasi_Rujukan.md` tidak berubah, sehingga tidak ada kotak yang dicentang;
  - `install --frozen-lockfile`, `content:check`, dan `test` lulus.

## Rencana uji

| Langkah | Cara | Kriteria |
|---|---|---|
| 1 | `install --frozen-lockfile`, `content:check`, lalu `test` | AC-15, AC-19 |
| 2 | `build:pages`; bandingkan berkas galeri dengan build sebelum F-06; periksa ukuran gzip, penanda three.js, dan path relatif | AC-17 |
| 3 | `test:e2e`: uji F-04 dan F-05 yang disesuaikan, ditambah `e2e/kartu-dampak.spec.ts` | AC-1 sampai AC-14, AC-16 |
| 4 | Gerak indikator dan masa tunggu: jam uji Playwright dijeda dengan `page.clock.pauseAt`, lalu dimajukan hanya dengan `page.clock.runFor` (catatan PLAN "Semua fitur") | AC-4, AC-9 |
| 5 | Salin tangkapan layar ke `docs/sehari-setara/tests/F-06/` (daftar di bawah) | Bukti AC-1 sampai AC-12 |
| 6 | `tsc --noEmit -p tsconfig.json --incremental false`, lalu ESLint | AC-18 |
| 7 | `git diff --name-status` terhadap keadaan sebelum F-06, dan periksa diff dokumen | AC-19 |
| 8 | Daftar periksa manual AGENTS bagian 9 | Tidak ada AC khusus |

Penyesuaian uji F-05 di `e2e/alur-permainan.spec.ts`:

- Tombol jembatan di baris status diganti tombol "Lanjut" kartu dampak, dan setiap langkah lanjut menunggu masa tunggu 600 ms.
- Uji "reaksi dan jembatan" (AC-5 dan AC-6 F-05) menjadi: kartu tampil 1.200 ms sesudah memilih dengan judul berfokus, lalu klik ganda pada "Lanjut" kartu hanya memajukan satu adegan.
- Uji tata letak (AC-11 F-05): "layar jembatan" diganti "layar kartu", dengan panel bawah kosong dan kartu tidak meluap.
- Tangkapan `adegan_4_jembatan_b_1280x720.png` tidak dibuat lagi. Berkas lama di `tests/F-05/` tetap disimpan sebagai bukti F-05.
- Uji F-04 di `e2e/sehari-setara.spec.ts` tidak berubah.

Tangkapan layar di `tests/F-06/`:

| Berkas | Isi |
|---|---|
| `kartu_tepat_adegan_5b_1280x720.png`, `kartu_tepat_adegan_5b_1024x768.png`, `kartu_tepat_adegan_5b_1920x1080.png` | Jalur semua B: kartu terpanjang, batang mentok 100 dengan angka "+15" |
| `kartu_berisiko_adegan_2a_1280x720.png` | Jalur semua A: angka "−10" dan "−20" |
| `kartu_kurang_adegan_3c_1280x720.png` | Jalur semua C: angka "0" dan setengah segmen |
| `indikator_reaksi_adegan_1_1280x720.png` | Nilai sebelum memilih selama reaksi |
| `kartu_kurangi_gerak_1280x720.png` | Kartu tanpa angka melayang |

Daftar periksa manual AGENTS bagian 9:

- Bisa dimainkan sampai akhir hanya dengan keyboard: dibuktikan uji AC-14.
- Mode kurangi gerak mematikan sapuan, animasi sprite, gerak indikator, dan angka melayang: dibuktikan uji AC-11 dan uji F-05.
- Tampilan rapi di 1024×768 dan 1920×1080: diperiksa dari tangkapan layar.
- Teks terbaca dari jarak sekitar 8 meter di proyektor, dan berjalan lancar di laptop kelas bawah: dicatat "belum diuji", untuk dicek pemilik proyek.

Hasil uji ditulis di `docs/sehari-setara/tests/F-06-hasil.md` (templat 11.3).
