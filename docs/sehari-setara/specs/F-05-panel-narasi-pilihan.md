# F-05 — Panel narasi, pertanyaan, dan tombol pilihan + kontrol keyboard

| | |
|---|---|
| Status | Ditulis 22 Oktober 2026, menunggu Gerbang 2 (`Spesifikasi disetujui: F-05`) |
| Tanggal | 22 Oktober 2026 |
| Rencana | `docs/sehari-setara/PLAN.md`, entri F-05 (disetujui 22 Oktober 2026 dengan balasan `Setuju: F-05`; keenam usulan diterima) |

## Ringkasan

F-05 membuat Sehari Setara bisa dimainkan untuk pertama kalinya. Di alamat `sehari-setara/#main`, kelas menjalani keenam adegan berurutan:

1. narasi muncul per huruf di kotak narasi;
2. pertanyaan dan tiga tombol pilihan tampil;
3. guru memilih dengan klik atau keyboard;
4. tokoh bereaksi selama 1,2 detik;
5. tombol "Lanjut" membawa kelas ke adegan berikutnya lewat sapuan blok piksel.

Sesudah adegan 6 tampil layar sementara. Mesin F-02 dan naskah F-03 dipakai apa adanya.

Tiga keputusan Gerbang 1 ikut mengubah tampilan yang sudah terbit:

- bingkai piksel kini setebal 2 piksel panggung (usulan 1);
- panel bawah menjadi 40u dan area panggung 52u, termasuk di pratinjau panggung (usulan 2);
- layar kerangka mendapat tombol ketiga "Coba alur permainan" (usulan 3).

Kartu dampak, kuis, bintang, dan layar akhir belum ada. Jembatan sementara melewati fase-fase itu (usulan 4) sampai fitur pemiliknya dibuat. Pratinjau panggung tetap ada sebagai alat tinjau (usulan 5).

Asal setiap nilai ditandai:

| Tanda | Arti |
|---|---|
| **[Dokumen]** | Dari Design System, Architecture, atau PRD; bagiannya disebut |
| **[Pemilik]** | Keputusan pemilik proyek di Gerbang 1 |
| **[Ukur]** | Diukur dengan huruf asli di Chromium, dalam percobaan di luar repositori (22 Oktober 2026) |
| **[DRAF]** | Usulan baru dari agen. Mohon ditinjau |

Maket untuk ditinjau bersama spesifikasi ini dikirim lewat percakapan dan tidak disimpan di repositori. Tangkapan layar hasil sebenarnya disimpan di `tests/F-05/` pada tahap Test.

## Kaitan PRD

| Acuan | Yang dipenuhi F-05 |
|---|---|
| FR-04 | Enam adegan berurutan, masing-masing dengan tiga pilihan, bisa dimainkan |
| FR-10 (tampilan) | Narasi tambahan dan teks pilihan B adegan 6 mengikuti bendera `komangDibela` |
| FR-16 (sebagian) | `1` `2` `3`, `A` `B` `C`, `Spasi`, dan `Enter` (Architecture bagian 9) |
| PRD bagian 9 | Reaksi tokoh berupa animasi sprite pendek |
| PRD bagian 10 | Layar 16:9 dan 4:3, empat ukuran uji, keyboard, kurangi gerak, kontras teks ≥ 4,5:1 |
| Design System bagian 2, 3, 7, 8 | Satu layar satu keputusan; tata letak; kotak narasi dan tombol pilihan; reaksi 1–1,5 detik; sapuan 400 ms atau pudar 150 ms |
| Architecture bagian 6, 9, 10 | Fase `intro` sampai `transition`; kontrol; `aria-live`, fokus, dan `altText` |
| Keputusan Gerbang 1 | Usulan 1–6 di entri F-05 `PLAN.md` |

## Perilaku

### Alamat dan layar

- Diberikan alamat `#main`, ketika halaman dibuka atau tanda pagar berubah ke `#main`, maka layar permainan tampil di fase `intro` adegan 1. Mesin memakai dua tim bawaan pertama, Tim Mangga dan Tim Laut, yang belum ditampilkan [Pemilik].
- Diberikan alamat `#adegan-N` atau `#adegan-N-a|b|c`, maka pratinjau panggung F-04 tampil seperti sebelumnya, dengan tata letak dan bingkai baru.
- Diberikan alamat lain, maka layar kerangka tampil dengan tiga tombol berurutan:
  - "Kembali ke galeri" (`../`);
  - "Lihat pratinjau panggung" (`#adegan-1`);
  - "Coba alur permainan" (`#main`).

  Tab pertama tetap memfokuskan "Kembali ke galeri".
- Diberikan layar permainan terbuka, ketika tanda pagar berubah ke alamat lain, maka permainan berakhir: keadaannya dibuang dan semua pengatur waktu dihentikan. Membuka `#main` lagi, atau memuat ulang halaman, selalu mulai dari adegan 1.
- Fokus saat berpindah layar:
  - masuk ke layar permainan: tombol lanjut di kotak narasi;
  - dari layar permainan ke layar kerangka: tombol "Coba alur permainan";
  - masuk ke pratinjau dari layar mana pun selain pratinjau: judul pratinjau, seperti F-04;
  - dari pratinjau ke layar kerangka: tombol "Lihat pratinjau panggung", seperti F-04.

### Satu adegan

Urutan fase mengikuti Architecture bagian 6:

| Fase | Panggung | Panel bawah | Berakhir saat |
|---|---|---|---|
| `intro` | Pemeran `scene.cast` | Kotak narasi | Layar narasi terakhir dilanjutkan: `NARASI_SELESAI` |
| `discuss` | Pemeran `scene.cast` | Pertanyaan dan tiga pilihan | Pilihan diambil: `PILIH` |
| `reaction` | Pemeran `choice.reaction` dan ikon emosi `choice.emote` | Baris status dan tiga pilihan terkunci | 1.200 ms berlalu: `REAKSI_SELESAI` |
| `impact`, `quiz`, `stars` | Sama dengan `reaction` | Baris status dengan tombol "Lanjut" dan tiga pilihan terkunci | "Lanjut" ditekan: aksi jembatan sampai fase `transition` |
| `transition` | Sapuan atau pudar | Kosong | Pergantian selesai; `LANJUT` dikirim di tengahnya |

Fase `quiz` dan `stars` dilewati jembatan dalam satu langkah, sehingga dalam pemakaian biasa keduanya tidak pernah tampil sendiri.

### Kotak narasi

- Layar narasi diambil dari `narrationFor(scene, flags)` (F-02). Adegan 1 dan 6 punya dua layar, adegan lain satu layar. Layar kedua adegan 6 berisi bagian `present` bila `komangDibela` sudah disetel, dan bagian `absent` bila belum.
- Tab di kiri atas kotak berisi judul adegan (`scene.title`) [DRAF]. Naskah tidak memakai penutur, jadi judul adegan menggantikan nama penutur yang disebut Design System bagian 7.
- **Teks per huruf** [DRAF]:
  - Teks muncul 40 huruf per detik bila `settings.typewriter` bernilai benar (bawaan F-02) dan kurangi gerak tidak aktif.
  - Bila kurangi gerak aktif, atau `settings.typewriter` bernilai salah, seluruh teks langsung tampil.
  - Bagian yang belum muncul tidak terlihat tetapi tetap memakan tempat, sehingga kata tidak berpindah baris di tengah jalan.
  - Panjang teks yang tampil = min(panjang teks, bawah(waktu berlalu dalam ms × 40 ÷ 1000)). Panjang dihitung per huruf, sejak layar narasi itu mulai tampil.
- Tombol lanjut di kanan bawah kotak bertuliskan "Lanjut" bila masih ada layar narasi berikutnya, dan "Tampilkan pilihan" di layar terakhir [DRAF].
- Tombol lanjut diaktifkan dengan salah satu cara berikut, dan setiap cara dihitung satu kali:
  - klik tombol, atau `Enter`/`Spasi` saat tombol berfokus;
  - `Spasi` atau `Enter` saat fokus tidak berada di tombol atau tautan;
  - klik di mana saja pada kotak narasi.
- Diberikan teks masih muncul per huruf, ketika tombol lanjut diaktifkan, maka seluruh teks langsung tampil dan layar tidak berganti.
- Diberikan teks sudah lengkap, ketika tombol lanjut diaktifkan, maka layar narasi berikutnya tampil. Di layar terakhir, `NARASI_SELESAI` dikirim dan pertanyaan tampil.

### Pertanyaan dan pilihan

- Panel menampilkan `scene.question`, lalu tiga tombol pilihan A, B, dan C yang berdampingan dan sama tinggi.
- Setiap tombol berisi kotak huruf (A, B, atau C) di kiri dan teks `choiceText(choice, flags)`. Di adegan 6, pilihan B memakai teks varian bila `komangDibela` sudah disetel (FR-10).
- Diberikan fase `discuss`, maka `PILIH` dikirim dengan pilihan yang bersangkutan ketika guru:
  - mengklik sebuah tombol;
  - menekan `Enter` atau `Spasi` pada tombol yang berfokus;
  - menekan `1`/`A`, `2`/`B`, atau `3`/`C` (huruf besar maupun kecil).
- Diberikan sebuah pilihan sudah diambil, ketika pilihan lain diklik atau ditekan, maka tidak terjadi apa-apa. Tombol sudah terkunci, dan reducer menolak `PILIH` kedua, sehingga `history` berisi tepat satu entri untuk adegan itu.

### Reaksi

- Panggung berganti ke `choice.reaction` dengan ikon emosi `choice.emote`, memakai komponen dan rumus posisi F-04.
- Label panggung menjadi `scene.altText`, spasi, lalu "Reaksi tokoh atas pilihan B." (huruf mengikuti pilihan).
- Baris pertanyaan berganti menjadi status "Kelas memilih B." (huruf mengikuti pilihan).
- Ketiga tombol terkunci: tombol yang dipilih berstatus dipilih, dan dua tombol lain berstatus nonaktif.
- Sesudah 1.200 ms, `REAKSI_SELESAI` dikirim [DRAF; Design System bagian 8 menyebut 1–1,5 detik]. Lama ini sama dengan atau tanpa kurangi gerak, karena reaksi berupa pergantian pose, bukan gerakan.

### Jembatan sementara [Pemilik]

- Di fase `impact`, `quiz`, dan `stars`, tombol "Lanjut" muncul di kanan baris status. Panggung dan tombol pilihan tetap seperti saat reaksi.
- Diberikan tombol "Lanjut" jembatan, ketika diaktifkan (klik, `Enter`/`Spasi` pada tombol, atau `Spasi`/`Enter` di luar tombol dan tautan), maka aksi berikut dikirim berurutan:
  1. `LANJUT`;
  2. hanya di adegan yang punya kuis (adegan 5): `JAWAB_KUIS` dengan jawaban naskah (`roleQuiz.answer`), lalu `LANJUT`;
  3. `BERI_BINTANG` dengan 0 bintang.

  Hasilnya fase `transition`. Dampak, kuis, dan bintang tidak ditampilkan. Indikator dan bendera tidak berubah, karena hanya `PILIH` yang mengubahnya (F-02).
- Jembatan hanya berlaku sekali per adegan. Klik ganda, atau tekanan kedua sebelum adegan berganti, diabaikan, sehingga adegan tidak pernah terlewat.

### Pergantian adegan

- Diberikan fase `transition` di adegan 1 sampai 5 dan kurangi gerak tidak aktif, maka **sapuan blok piksel** 400 ms berjalan di atas panggung [Dokumen: Design System bagian 8; rinciannya DRAF]:
  - Blok berukuran 20×20 piksel panggung, 16 kolom × 9 baris (144 blok), menutupi seluruh panggung 320×180.
  - Warna blok adalah warna langit waktu adegan berikutnya, sama dengan bilah atas: pagi `#FFD9A8`, siang `#6EC6F2`, sore `#FFC27A`, malam `#4A4F9C`.
  - Blok di kolom c dan baris r mulai terlihat pada t = bulat((c + g) × 160 ÷ 18) ms, dengan g = 0, 2, 1, 3 untuk r mod 4 = 0, 1, 2, 3, lalu terlihat selama 240 ms. Tepi sapuan bergerigi dan bergerak ke kanan, mengikuti arah matahari di busur hari.
  - Antara 160 dan 240 ms seluruh panggung tertutup. Pada 200 ms `LANJUT` dikirim, sehingga adegan, panggung, dan bilah atas berganti di balik blok.
  - Pada 400 ms blok terakhir hilang, lapisan sapuan dibuang, dan kotak narasi adegan baru muncul.
- Diberikan kurangi gerak aktif, maka panggung **memudar** keluar selama 75 ms, `LANJUT` dikirim, lalu panggung adegan baru memudar masuk selama 75 ms. Kotak narasi muncul pada 150 ms [Dokumen: Design System bagian 8].
- Selama pergantian, panel bawah kosong, dan tombol keyboard maupun klik tidak berpengaruh.
- Gambar adegan berikutnya sudah dimuat sejak adegan sebelumnya mulai, lewat `preloadScene` F-04.
- Diberikan fase `transition` di adegan 6, maka `LANJUT` langsung dikirim tanpa sapuan, dan layar akhir sementara tampil.

### Sesudah adegan 6 [Pemilik]

- Di fase `ending`, `recap`, dan `reflection`, layar akhir sementara menggantikan bilah atas, panggung, dan panel. Isinya:
  - judul "Keenam adegan selesai";
  - kalimat "Terima kasih sudah menemani Nara sampai malam.";
  - keterangan "Layar akhir, rekap, dan refleksi sedang dibuat.";
  - tombol "Main lagi dari adegan 1" dan tautan "Kembali ke galeri" (`../`).
- Fokus pindah ke judul.
- Diberikan layar akhir sementara, ketika "Main lagi dari adegan 1" diaktifkan, maka aksi `LANJUT`, `LANJUT`, `MAIN_LAGI`, `MULAI`, `SIMPAN_PENGATURAN` (dua tim bawaan), dan `LANJUT` dikirim. Permainan kembali ke fase `intro` adegan 1 dengan `history` kosong, dan fokus pindah ke tombol lanjut kotak narasi.

### Keyboard

| Tombol | Fase | Hasil |
|---|---|---|
| `1`, `a`, `A` | `discuss` | Pilih A |
| `2`, `b`, `B` | `discuss` | Pilih B |
| `3`, `c`, `C` | `discuss` | Pilih C |
| `Spasi`, `Enter` | `intro` | Sama dengan tombol lanjut kotak narasi |
| `Spasi`, `Enter` | `impact`, `quiz`, `stars` | Sama dengan tombol "Lanjut" jembatan |
| Tombol lain, atau fase lain | — | Tidak berpengaruh |

Aturan tambahan:

- Tekanan bersama Ctrl, Alt, atau Meta diabaikan, sehingga pintasan browser tetap berfungsi. Shift boleh, karena huruf besar juga memilih.
- Tekanan berulang karena tombol ditahan (`repeat`) dan tekanan saat huruf sedang disusun (`isComposing`) diabaikan.
- Tekanan di kolom isian teks diabaikan. Kolom isian belum ada di F-05; aturan ini disiapkan untuk layar pengaturan di F-10.
- `Spasi` dan `Enter` pada tombol atau tautan yang sedang berfokus ditangani browser sebagai klik, bukan oleh pintasan, agar satu tekanan tidak menjadi dua aksi.
- Tombol yang ditangani pintasan tidak menjalankan perilaku bawaannya; misalnya `Spasi` tidak menggulir halaman.
- Pintasan hanya aktif di layar permainan, tidak di layar kerangka maupun pratinjau.

### Fokus dan pembaca layar

- Fokus berpindah sebagai berikut:
  - awal permainan, dan awal setiap adegan sesudah pergantian selesai: tombol lanjut kotak narasi;
  - layar narasi berikutnya: fokus tetap di tombol lanjut;
  - pertanyaan tampil: teks pertanyaan, yang bisa difokus lewat kode. Dengan begitu `Spasi` tidak memilih tanpa sengaja, dan Tab berikutnya berurutan ke pilihan A, B, lalu C;
  - pilihan diambil: baris status;
  - tombol "Lanjut" jembatan muncul: tombol itu;
  - layar akhir sementara: judulnya.
- Teks pertanyaan dan baris status yang berfokus diberi garis fokus 2 px `ink` berjarak 4 px, sama dengan judul pratinjau F-04.
- Layar permainan memakai `<main>` dengan judul `<h1>` yang hanya terbaca pembaca layar: "Adegan 1: Pagi di rumah" (nomor dan judul mengikuti adegan). Tab judul di kotak narasi disembunyikan dari pembaca layar, karena isinya sama.
- Wilayah `aria-live="polite"` yang tidak terlihat berisi teks utuh layar narasi yang sedang tampil, sekali per layar. Di fase lain wilayah itu kosong, karena pertanyaan dan status dibacakan lewat fokus. Teks per huruf yang terlihat disembunyikan dari pembaca layar.
- Nama tombol pilihan bagi pembaca layar adalah "Pilihan B: " diikuti teks pilihannya. Tombol yang dipilih ditambah "(dipilih)".
- Bingkai panggung tetap `role="img"`, dengan label seperti di bagian "Reaksi".

### Tata letak dan bingkai piksel [Pemilik]

- Layar permainan dan pratinjau dibagi menjadi bilah atas 8u, area panggung 52u, dan panel bawah 40u.
- Skala panggung k = `stageScale((177,78 − 60)u, 52u)`. Satu piksel antarmuka p = maks(1, bulat(k)) px:

  | Ruang tampilan | 1u | k | Panggung | p | Garis bingkai |
  |---|---|---|---|---|---|
  | 1280×720 | 7,2 px | 2 | 640×360 | 2 px | 4 px |
  | 1366×768 | 7,68 px | 2 | 640×360 | 2 px | 4 px |
  | 1920×1080 | 10,8 px | 3 | 960×540 | 3 px | 6 px |
  | 1024×768 (layar 1024×576) | 5,76 px | 1,664 | 532,5×299,5 | 2 px | 4 px |

- Nilai p disimpan di variabel CSS `--ss-px` pada `.ss-screen` dan dihitung ulang setiap kali ukuran layar berubah. Variabel ini tidak berada di `:root`, sehingga tidak dianggap token oleh uji palet F-12.
- **Bingkai piksel** berlaku untuk semua panel dan tombol: `ss-button`, `ss-chip`, tombol pilihan, kotak narasi, dan tombol lanjut. Isinya:
  - garis `ink` 2p;
  - sudut terpotong p;
  - sorotan `white` p di sisi atas-dalam;
  - latar `cream`.

  Status terpilih `ss-chip` dan status dipilih tombol pilihan menambah cincin dalam `ink` 2p, tanpa mengubah ukuran tombol.
- **Panel bawah layar permainan** [Ukur, DRAF]:

  | Bagian | Nilai |
  |---|---|
  | Panel | Jarak tepi 1,2u atas-bawah dan 4u kiri-kanan; celah antarbagian 1,2u; isi tidak pernah meluap |
  | Kotak narasi | Mengisi sisa tinggi panel; jarak atas 1,6u untuk tab; jarak dalam 3,6u atas, 2,4u kiri-kanan, 1,6u bawah |
  | Tab judul adegan | Press Start 2P 2,8u, tinggi baris 1,3; latar `ink`, teks `cream`; jarak dalam 0,8u × 1,6u; sudut terpotong p; 2,4u dari tepi kiri kotak, tepat di tengah garis atas kotak |
  | Teks narasi | Pixelify Sans 3,6u, tinggi baris 1,35, `ink`; lebar paling banyak 60ch |
  | Tombol lanjut | Pixelify Sans 2,8u, tinggi baris 1,3; jarak dalam 0,8u atas-bawah (0,5u di baris status), 2u kanan, 2,8u kiri sebagai ruang kursor; di kanan bawah kotak narasi atau di kanan baris status |
  | Baris pertanyaan atau status | Tinggi tetap 5,8u; Pixelify Sans 3,6u, tinggi baris 1,35, `ink`; rata kiri |
  | Tiga pilihan | Tiga kolom sama lebar, celah 1,5u, sama tinggi |
  | Tombol pilihan | Pixelify Sans 3,1u, tinggi baris 1,3; jarak dalam 1u atas-bawah, 1,2u kanan, 2,6u kiri sebagai ruang kursor; celah kotak huruf ke teks 1,2u; teks rata kiri |
  | Kotak huruf | Press Start 2P 2,8u, tinggi baris 1; jarak dalam 0,6u; latar `ink`, huruf `cream` |
  | Kursor ▶ | 0,7 kali ukuran huruf tombolnya, 0,6u dari kiri; pada tombol pilihan 1,6u dari atas |

- **Ruang cadangan** [Ukur]: dengan nilai di atas, layar pilihan dan layar jembatan paling penuh ada di adegan 3 dan 5, karena pilihan B terbungkus 6 baris. Sisa ruangnya 3,3u di 1280×720, 1366×768, dan 1920×1080, serta 3,05u di 1024×768. Itu kurang dari satu baris pilihan (4,03u), jadi bila teks pilihan kelak diperpanjang, uji ujung ke ujung akan menangkap luapannya.
- Panel bawah pratinjau tetap memakai jarak dan susunan F-04; hanya tingginya yang menjadi 40u.

### Uji aset dan galeri

- Uji palet F-12 tetap lulus. Warna baru di `game.css` hanya warna langit yang sudah ada di palet, dan `--ss-px` bukan token.
- Berkas galeri tidak berubah. Uji build membandingkan `index.html`, `main-*.css`, `main-*.js`, dan `jsx-runtime-*.js` dengan build sebelum F-05 (catatan PLAN "Semua fitur").

## Status antarmuka

| Bagian | Status | Tampilan |
|---|---|---|
| Tombol pilihan | Biasa | Latar `cream`, teks `ink`, kotak huruf `ink` berhuruf `cream`, bingkai piksel |
| | Fokus (`:focus-visible`) atau arah (tetikus, hanya di perangkat ber-*hover*) | Latar `sun`, kursor ▶ terlihat di kiri kotak huruf |
| | Dipilih | Latar `sun` dan garis tampak 4p (bingkai 2p ditambah cincin 2p), tanpa kursor, tidak bisa diklik; pembaca layar membaca "(dipilih)" |
| | Nonaktif | Latar `mist`, teks `dusk`, kotak huruf `dusk` berhuruf `cream`; tidak bisa diklik |
| | Mode warna paksa | Sudut terpotong dimatikan; fokus terlihat lewat garis warna sistem |
| Tombol lanjut (narasi dan jembatan) | Biasa, fokus/arah, mode warna paksa | Seperti `ss-chip`: latar `cream`; saat fokus atau arah, latar `sun` dengan kursor ▶ |
| Kotak narasi | Teks muncul per huruf | Bagian yang belum muncul tidak terlihat tetapi memakan tempat; tombol lanjut sudah tampil |
| | Teks lengkap | Seluruh teks terlihat |
| Baris status | Reaksi | "Kelas memilih B." tanpa tombol |
| | Jembatan | "Kelas memilih B." dengan tombol "Lanjut" di kanan |
| Panel bawah | Pergantian adegan | Kosong |
| Panggung | Sapuan | Blok warna langit adegan berikutnya, di atas latar dan tokoh, di bawah garis pindai |
| | Pudar (kurangi gerak) | Panggung memudar keluar, lalu adegan baru memudar masuk |
| | Sebelum latar termuat, atau gambar gagal dimuat | Seperti F-04 |
| Layar akhir sementara | — | Tata letak layar kerangka F-01: judul, kalimat, keterangan, dan dua tombol berbingkai |
| Kosong | — | Tidak berlaku: setiap adegan punya narasi, pertanyaan, dan tiga pilihan |
| Galat | — | Tidak ada tampilan galat baru; gambar yang gagal dimuat ditangkap uji ujung ke ujung sebagai respons 4xx |

Kontras teks baru [Ukur]:

| Pasangan | Rasio |
|---|---|
| `ink` di atas `cream` | 13,3:1 |
| `cream` di atas `ink` (tab dan kotak huruf) | 13,3:1 |
| `ink` di atas `sun` (fokus dan dipilih) | 9,9:1 |
| `dusk` di atas `mist` (pilihan nonaktif) | 5,9:1 |
| `cream` di atas `dusk` (kotak huruf nonaktif) | 8,2:1 |

## Teks yang tampil (final)

Teks baru berasal dari `app/sehari-setara/content/copy.ts`. Judul adegan, narasi, pertanyaan, dan pilihan berasal dari `scenes.ts`. Semua teks baru **[DRAF]**.

| Tempat | Teks |
|---|---|
| Tombol ketiga layar kerangka | Coba alur permainan |
| Judul layar permainan (hanya pembaca layar) | Adegan 1: Pagi di rumah (nomor dan judul mengikuti adegan) |
| Tab kotak narasi | Judul adegan, misalnya "Pagi di rumah" |
| Tombol lanjut narasi, bila masih ada layar narasi | Lanjut |
| Tombol lanjut narasi, di layar narasi terakhir | Tampilkan pilihan |
| Awal nama tombol pilihan (hanya pembaca layar) | Pilihan A: (B, C) |
| Penanda tombol yang dipilih (hanya pembaca layar) | (dipilih) |
| Baris status sesudah memilih | Kelas memilih A. (B, C) |
| Tombol jembatan | Lanjut |
| Tambahan label panggung saat reaksi | Reaksi tokoh atas pilihan A. (B, C) |
| Judul layar akhir sementara | Keenam adegan selesai |
| Kalimat layar akhir sementara | Terima kasih sudah menemani Nara sampai malam. |
| Keterangan layar akhir sementara | Layar akhir, rekap, dan refleksi sedang dibuat. |
| Tombol layar akhir sementara | Main lagi dari adegan 1 |
| Tautan layar akhir sementara | Kembali ke galeri (teks F-01) |

Teks bilah atas, judul tab, dan deskripsi halaman tidak berubah.

## Data dan aksi

`engine/` tidak berubah. `GameState`, tipe, reducer, dan aturan F-02 dipakai apa adanya.

### Aksi yang dikirim layar permainan

| Saat | Aksi |
|---|---|
| Layar permainan dibuka (keadaan awal dibuat sekaligus) | `MULAI`, `SIMPAN_PENGATURAN { teams: PLAY_TEAMS, settings: {} }`, `LANJUT` |
| Layar narasi terakhir dilanjutkan | `NARASI_SELESAI` |
| Pilihan diambil | `PILIH { choice }` |
| 1.200 ms sesudah `PILIH` | `REAKSI_SELESAI` |
| Tombol "Lanjut" jembatan | `bridgeActions(scene)`, sesuai bagian "Jembatan sementara" |
| Tengah sapuan (200 ms) atau akhir pudar keluar (75 ms) | `LANJUT` |
| Fase `transition` di adegan 6 | `LANJUT` |
| "Main lagi dari adegan 1" | `LANJUT`, `LANJUT`, `MAIN_LAGI`, lalu ketiga aksi awal |

Catatan:

- Pengatur waktu diskusi di mesin berstatus berjalan sejak `NARASI_SELESAI`, tetapi tidak ada yang mengirim `TICK` sampai F-07.
- `settings.reducedMotion` (bawaan salah) digabung dengan `prefers-reduced-motion`: kurangi gerak aktif bila salah satunya benar.

### Berkas dan ekspor

`app/sehari-setara/ui/controls.ts` berisi fungsi murni yang diuji unit:

| Ekspor | Isi |
|---|---|
| `REACTION_MS`, `WIPE_MS`, `WIPE_COVER_MS`, `FADE_MS`, `TYPE_CPS` | 1200, 400, 200, 150, dan 40 |
| `WIPE` | `{ block: 20, cols: 16, rows: 9, offsets: [0, 2, 1, 3], showMs: 240 }` |
| `PlayCommand` | `{ type: "pilih"; choice: ChoiceId } \| { type: "lanjut" }` |
| `keyCommand(phase, key)` | Perintah menurut tabel "Keyboard", atau `null` |
| `KeyContext`, `shouldHandleKey(ctx)` | `KeyContext` = `{ key, ctrlKey, altKey, metaKey, repeat, isComposing, target: "isian" \| "tombol" \| "lain" }`; `shouldHandleKey` bernilai salah untuk tekanan yang diabaikan |
| `typedLength(elapsedMs, total, cps?)` | Panjang teks per huruf yang tampil |
| `wipeSchedule()` | 144 butir `{ col, row, delayMs }` |
| `startActions(teams)`, `bridgeActions(scene)`, `restartActions(teams)` | Daftar `GameAction` sesuai tabel aksi |

Berkas lain:

| Berkas | Isi |
|---|---|
| `content/teams.ts` | `DEFAULT_TEAMS`: empat tim Design System bagian 7, dengan id `mangga`, `laut`, `daun`, `mentari`, warna `mango`, `sky-d`, `leaf`, `sun`, dan bentuk lingkaran, segitiga, persegi, bintang. `PLAY_TEAMS`: dua tim pertama |
| `ui/hooks.ts` | `usePrefersReducedMotion()` dan `useStageScale(ref)`, dipindahkan dari `StagePreview.tsx` tanpa perubahan perilaku |
| `ui/layout.ts` | `LAYOUT` menjadi `{ screenU, barU: 8, stageU: 52, bottomU: 40, sideU: 30 }`. Ekspor baru `uiPixel(k)` dan `parseRoute(hash, sceneCount)`, yang menghasilkan `{ kind: "main" }`, `{ kind: "pratinjau", preview }`, atau `null` |
| `ui/PlayScreen.tsx` | `PlayScreen({ scale })`: `useReducer(createReducer(SCENES))` dengan keadaan awal dari `startActions`; tampilan per fase, pengatur waktu reaksi dan pergantian, pintasan keyboard, fokus, wilayah `aria-live`, pramuat, jembatan, dan layar akhir sementara |
| `ui/NarrationBox.tsx` | `NarrationBox({ title, text, isLast, typewriter, onNext })` |
| `ui/ChoicePanel.tsx` | `ChoicePanel({ question, choices, flags, chosen, onChoose, bridgeReady, onBridge })` |
| `ui/SceneWipe.tsx` | `SceneWipe({ timeOfDay, scale })`: 144 blok `ss-wipe-block` |
| `Game.tsx` | Memakai `parseRoute`; mengukur layar dengan `useStageScale`; menyetel `--ss-px`; meneruskan `scale` ke pratinjau dan layar permainan |
| `ui/StagePreview.tsx` | Menerima `scale` dari `Game.tsx` alih-alih mengukur sendiri |

Kelas CSS baru berawalan `ss-`: `ss-play`, `ss-play-panel`, `ss-narration-wrap`, `ss-narration`, `ss-narration-tab`, `ss-narration-text`, `ss-narration-rest`, `ss-next`, `ss-question-row`, `ss-question`, `ss-status`, `ss-choices`, `ss-choice`, `ss-choice-key`, `ss-choice-text`, `ss-stage-holder`, `ss-wipe`, `ss-wipe-block`, `ss-play-end`, dan `ss-sr` (hanya terbaca pembaca layar). Keyframes baru: `ss-wipe-show`, `ss-fade-out`, dan `ss-fade-in`. Tidak ada token `:root` baru.

### Perubahan dokumen (Build)

- `Design_System.md` naik ke versi 0.5:
  - bagian 3: panel bawah sekitar 40% dan area panggung 52%, beserta skala 1,664 di 1024×768;
  - bagian 7: bingkai piksel dalam piksel panggung (p), tab kotak narasi berisi judul adegan, dan rincian status tombol pilihan;
  - bagian 8: rincian sapuan (blok 20×20, warna langit adegan berikutnya, jadwal 400 ms) dan lama reaksi 1,2 detik.
- `Architecture.md` naik ke versi 0.7:
  - bagian 3: berkas baru;
  - bagian 7: tata letak 8u/52u/40u, `uiPixel`, layar permainan `#main`, sapuan, dan jembatan sementara;
  - bagian 9: tombol yang sudah aktif dan aturan pengabaian;
  - bagian 12: cakupan uji ujung ke ujung F-05.
- `PLAN.md`: status F-05, serta tautan spesifikasi dan laporan.

Tambahan terhadap daftar file di rencana:

- `e2e/bantuan.ts` (baru): fungsi uji bersama (`watch`, `expectClean`, `settle`, `contrast`) dipindahkan dari `e2e/sehari-setara.spec.ts`, agar bisa dipakai kedua berkas uji.
- `Design_System.md` bagian 8 dan `Architecture.md` bagian 12 ikut diperbarui.

## Aset

Tidak ada aset baru, dan tidak ada PNG yang berubah. Layar permainan memakai aset yang sudah Disetujui lewat manifest:

- keenam latar adegan;
- strip tokoh di `cast` dan `reaction`;
- ikon emosi;
- `ui_matahari` dan `ui_bulan` di busur hari.

Huruf A/B/C, kursor ▶, dan blok sapuan dibuat oleh antarmuka, bukan gambar. Placeholder tidak diperlukan.

## Di luar cakupan

- Kartu dampak, indikator, dan angka melayang (F-06).
- Papan tim, giliran, bintang alasan, pengatur waktu, `useTimer`, serta tombol `P`, `T`, `S`, dan `0` `1` `2` di fase bintang (F-07).
- Tampilan kuis peran (F-08).
- Layar akhir, rekap, refleksi, timbangan, dan "Main lagi" yang sebenarnya (F-09).
- Layar judul, pengaturan kelas, prolog, `Esc`, dan pengaturan teks per huruf (F-10).
- Tautan dari galeri (F-11).
- Suara, layar penuh, pengaturan kurangi gerak di dalam game, `F`, `M`, ulangi adegan, dan kembali ke adegan sebelumnya (F-13).
- Navigasi pilihan dengan tombol panah, gerakan usap, dan penyimpanan `sessionStorage`.
- Layar 4:3 yang memakai tinggi penuh (alternatif usulan 2 yang tidak dipilih).
- Perubahan pada `engine/`, naskah, aset, kit gambar, `Stage.tsx`, `Sprite.tsx`, `DayArc.tsx`, file galeri, `vite.pages.config.ts`, `package.json`, `pnpm-lock.yaml`, dan workflow.

## Kriteria penerimaan

- [ ] AC-1 **Alamat dan layar kerangka**:
  - layar kerangka memuat tiga tautan berurutan: "Kembali ke galeri" (`../`), "Lihat pratinjau panggung" (`#adegan-1`), dan "Coba alur permainan" (`#main`); Tab pertama memfokuskan "Kembali ke galeri";
  - "Coba alur permainan" membuka layar permainan di layar narasi 1 adegan 1 tanpa memuat ulang halaman, dengan fokus di tombol lanjut;
  - tombol Kembali browser ke layar kerangka memindahkan fokus ke "Coba alur permainan";
  - membuka `#main` lagi dan memuat ulang halaman selalu mulai dari layar narasi 1 adegan 1;
  - ke-24 alamat pratinjau dan alamat yang tidak dikenal tetap berperilaku seperti F-04.
- [ ] AC-2 **Kotak narasi**:
  - di keenam adegan, jumlah dan isi layar narasi sama dengan `narrationFor`, termasuk bagian `present` atau `absent` adegan 6 sesuai pilihan di adegan 4;
  - tab berisi judul adegan;
  - tombol lanjut bertuliskan "Lanjut", kecuali di layar terakhir ("Tampilkan pilihan");
  - tanpa kurangi gerak, sesaat setelah layar tampil, teks yang terlihat lebih pendek dari teks utuh. Satu kali `Spasi` menampilkan seluruh teks tanpa berganti layar, dan `Spasi` berikutnya berganti layar;
  - klik pada kotak narasi berperilaku sama dengan satu kali tombol lanjut;
  - wilayah `aria-live` berisi teks utuh layar yang sedang tampil.
- [ ] AC-3 **Pertanyaan dan pilihan**:
  - pertanyaan dan teks ketiga pilihan sama dengan naskah (`choiceText`), termasuk varian pilihan B adegan 6;
  - kotak huruf berisi A, B, dan C, dan nama tombol bagi pembaca layar diawali "Pilihan A: ", "Pilihan B: ", dan "Pilihan C: ";
  - fokus berada di pertanyaan, lalu Tab berurutan ke A, B, dan C;
  - pilihan yang berfokus berlatar `rgb(255, 210, 63)` dengan kursor ▶ terlihat; pilihan biasa berlatar `rgb(255, 246, 224)`.
- [ ] AC-4 **Memilih dan mengunci**:
  - klik, `Enter` pada tombol yang berfokus, `1`/`2`/`3`, `a`/`b`/`c`, dan `A`/`B`/`C` masing-masing memilih pilihan yang benar; setiap cara diuji minimal sekali;
  - sesudah memilih: status "Kelas memilih X."; tombol terpilih berstatus dipilih (latar `sun`, cincin 2p); dua tombol lain nonaktif (latar `mist`, teks `dusk`); ketiganya terkunci (`disabled`);
  - tekanan atau klik pilihan kedua tidak mengubah status maupun panggung.
- [ ] AC-5 **Reaksi**:
  - urutan `data-char`/`data-pose` sprite sama dengan `choice.reaction`;
  - ikon emosi sesuai `choice.emote`;
  - posisi sprite dan ikon sesuai rumus F-04 (±1 px);
  - label panggung diakhiri "Reaksi tokoh atas pilihan X.";
  - tombol "Lanjut" jembatan muncul dan mendapat fokus 1.200 ms sesudah memilih (toleransi −50 ms sampai +400 ms).
- [ ] AC-6 **Jembatan**:
  - "Lanjut" (klik, `Enter`, atau `Spasi`) membawa ke adegan berikutnya, terlihat dari bilah atas "Adegan n+1/6";
  - di adegan 5 tidak ada kuis yang tampil;
  - klik ganda, atau dua kali `Enter` dengan cepat, hanya memajukan satu adegan.
- [ ] AC-7 **Sapuan**, tanpa kurangi gerak, sesudah "Lanjut":
  - lapisan sapuan berisi 144 blok 20×20 piksel panggung dengan `data-time` waktu adegan berikutnya dan warna sesuai tabel; jeda animasi setiap blok sama dengan `wipeSchedule()`, dan durasinya 240 ms;
  - dengan jam uji dan animasi yang dijeda: pada 100 ms dan 300 ms, blok yang terlihat sama dengan jadwal; pada 100 ms panggung masih menampilkan adegan lama, pada 300 ms sudah adegan baru;
  - lapisan hilang dan kotak narasi adegan baru tampil paling lambat 600 ms sesudah "Lanjut";
  - selama pergantian, panel bawah kosong, dan `Spasi`, `Enter`, serta angka tidak berpengaruh;
  - dari adegan 6 tidak ada sapuan, dan layar akhir sementara langsung tampil.
- [ ] AC-8 **Kurangi gerak**, dengan `prefers-reduced-motion: reduce`:
  - teks narasi langsung lengkap;
  - tidak ada blok sapuan; panggung memakai animasi `ss-fade-out` lalu `ss-fade-in`, masing-masing 75 ms;
  - di luar pergantian adegan, `document.getAnimations()` kosong di layar permainan.
- [ ] AC-9 **Layar akhir sementara**:
  - sesudah "Lanjut" di adegan 6, judul, kalimat, keterangan, tombol, dan tautan sesuai teks final, dan fokus berada di judul;
  - "Main lagi dari adegan 1" kembali ke layar narasi 1 adegan 1 dengan fokus di tombol lanjut;
  - permainan berikutnya mulai bersih: varian adegan 6 hanya mengikuti pilihan adegan 4 di permainan baru.
- [ ] AC-10 **Aturan keyboard**:
  - Ctrl+2, Alt+2, dan Meta+2 tidak memilih;
  - tekanan berulang (`repeat`) tidak memilih;
  - `Spasi` pada tombol pilihan yang berfokus memilih tepat satu kali;
  - tombol lain, misalnya `4`, `d`, dan `Escape`, tidak berpengaruh;
  - halaman tidak bergulir.
- [ ] AC-11 **Tata letak**, di 1280×720, 1366×768, 1920×1080, dan 1024×768, untuk layar permainan dan pratinjau:
  - bilah atas 8u, area panggung 52u, dan panel bawah 40u (±1 px);
  - bingkai panggung 320k × 180k dengan k = 2, 2, 3, dan 1,664 (±0,005), di tengah area;
  - di keenam adegan, termasuk kedua varian adegan 6, panel bawah tidak meluap di setiap layar narasi, layar pilihan, dan layar jembatan;
  - tidak ada bilah gulir.
- [ ] AC-12 **Bingkai piksel**:
  - `--ss-px` bernilai 2, 2, 3, dan 2 px di keempat ukuran;
  - garis `ss-button`, `ss-chip`, tombol pilihan, kotak narasi, dan tombol lanjut 4, 4, 6, dan 4 px;
  - cincin dipilih dan terpilih 2p;
  - lebar tombol sama saat biasa dan saat fokus.
- [ ] AC-13 **Aksesibilitas**:
  - `<h1>` tersembunyi berbunyi "Adegan n: judul";
  - panggung `role="img"` dengan label sesuai;
  - wilayah `aria-live="polite"` ada;
  - fokus berpindah sesuai bagian "Fokus dan pembaca layar";
  - kontras terukur setiap pasangan teks dan latar ≥ 4,5:1.
- [ ] AC-14 **Main sampai akhir**:
  - dengan keyboard saja di 1280×720, tiga jalur naskah (semua B, B-B-B-C-C-C, dan semua A) berjalan dari adegan 1 sampai layar akhir sementara;
  - varian adegan 6 muncul hanya di jalur yang memilih B di adegan 4;
  - 0 galat konsol, 0 respons 4xx/5xx, dan 0 permintaan ke host lain.
- [ ] AC-15 **Uji unit**:
  - `controls.test.ts` lulus: perintah keyboard, aturan pengabaian, teks per huruf, jadwal sapuan, serta aksi awal, jembatan, dan main lagi bersama reducer dan naskah asli;
  - tambahan `layout.test.ts` lulus: `stageScaleForScreen(576)` ≈ 1,664, `uiPixel`, dan `parseRoute`.
- [ ] AC-16 **Uji F-04 yang disesuaikan**: semua uji ujung ke ujung F-04 lulus dengan harapan baru (panel 40u, k = 1,664 di 1024×768, dan tiga tombol layar kerangka). Perilaku pratinjau lainnya tidak berubah.
- [ ] AC-17 **Build**:
  - `build:pages` lulus;
  - JS permainan ≤ 150 KB gzip, tanpa penanda `__THREE__`;
  - semua `src`/`href` HTML permainan relatif;
  - `index.html`, `main-*.css`, `main-*.js`, dan `jsx-runtime-*.js` identik byte dengan build sebelum F-05.
- [ ] AC-18 **Pemeriksaan kode**:
  - `tsc --noEmit` seluruh proyek tanpa galat;
  - ESLint `--max-warnings 0` lulus pada semua file kode baru dan yang diubah;
  - tidak ada `any`;
  - `engine/` tidak berubah dan tetap tanpa `setTimeout`.
- [ ] AC-19 **Dokumen dan cakupan**:
  - perubahan dokumen sesuai bagian "Perubahan dokumen";
  - `git diff --name-status` hanya memuat file yang disebut spesifikasi ini dan tangkapan layar bukti di `tests/F-05/`;
  - `package.json` dan `pnpm-lock.yaml` tidak berubah, dan `install --frozen-lockfile` berhasil;
  - `content:check` dan `test` lulus.

## Rencana uji

| Langkah | Cara | Kriteria |
|---|---|---|
| 1 | `install --frozen-lockfile`, `content:check`, lalu `test` | AC-15, AC-19 |
| 2 | `build:pages`; bandingkan berkas galeri dengan build sebelum F-05; periksa ukuran gzip, penanda three.js, dan path relatif | AC-17 |
| 3 | `test:e2e`: uji F-04 yang disesuaikan dan `e2e/alur-permainan.spec.ts` | AC-1 sampai AC-14, AC-16 |
| 4 | Sapuan pada 100 ms dan 300 ms: jam uji Playwright (`page.clock`) menahan pengatur waktu, sedangkan animasi CSS dijeda dan diatur waktunya lewat Web Animations API | AC-7 |
| 5 | Salin tangkapan layar ke `docs/sehari-setara/tests/F-05/` (daftar di bawah) | Bukti AC-2 sampai AC-12 |
| 6 | `tsc --noEmit -p tsconfig.json --incremental false`, lalu ESLint | AC-18 |
| 7 | `git diff --name-status` terhadap keadaan F-04, dan periksa diff dokumen | AC-18, AC-19 |
| 8 | Daftar periksa manual AGENTS bagian 9 | — |

Tangkapan layar di `tests/F-05/`:

| Berkas | Isi |
|---|---|
| `kerangka_1280x720.png` | Layar kerangka dengan tiga tombol |
| `adegan_1_narasi_1280x720.png`, `adegan_1_narasi_1024x768.png` | Kotak narasi dengan teks lengkap |
| `adegan_5_pilihan_1280x720.png`, `adegan_5_pilihan_1024x768.png`, `adegan_5_pilihan_1920x1080.png` | Layar pilihan terpanjang, fokus di B |
| `adegan_4_jembatan_b_1280x720.png` | Reaksi B dan tombol "Lanjut" jembatan |
| `sapuan_2_ke_3_100ms_1280x720.png`, `sapuan_2_ke_3_300ms_1280x720.png` | Sapuan dari adegan 2 ke 3 |
| `akhir_sementara_1280x720.png` | Layar akhir sementara |
| `pratinjau_adegan_3_1280x720.png` | Pratinjau dengan tata letak dan bingkai baru |

Daftar periksa manual AGENTS bagian 9:

- Bisa dimainkan sampai akhir hanya dengan keyboard: dibuktikan uji AC-14.
- Mode kurangi gerak mematikan sapuan dan animasi sprite: dibuktikan uji AC-8.
- Tampilan rapi di 1024×768 dan 1920×1080: diperiksa dari tangkapan layar.
- Teks terbaca dari jarak sekitar 8 meter di proyektor, dan berjalan lancar di laptop kelas bawah: dicatat "belum diuji", untuk dicek pemilik proyek.

Hasil uji ditulis di `docs/sehari-setara/tests/F-05-hasil.md` (templat 11.3).
