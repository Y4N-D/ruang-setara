# Design System — Jejak Setara

| | |
|---|---|
| Versi | 0.1 (draf) |
| Tanggal | 4 November 2026 |
| Turunan dari | `docs/sehari-setara/Design_System.md` versi 0.9 |
| Berlaku untuk | Layar pemain, layar kelas, konsol admin, aset visual, animasi, dan suara Jejak Setara |
| Dokumen terkait | `PRD.md`, `Architecture.md`, `AGENTS.md` (di `docs/jejak-setara/`) |

---

## 0. Hubungan dengan Design System Sehari Setara

Jejak Setara harus terasa **sekeluarga** dengan Sehari Setara. Karena itu sebagian besar aturan diwarisi apa adanya.

| Diwarisi tanpa perubahan (lihat dokumen Sehari Setara) | Ditetapkan baru di dokumen ini |
|---|---|
| Palet 36 warna dan aturan kontras (bagian 4) | Perspektif tampak atas 3/4, ubin, dan lapisan dunia |
| Huruf VT323 lewat token `--js-huruf-judul` dan `--js-huruf-teks` (bagian 5; sejak JS-16b tidak lagi sama dengan Sehari Setara) | Tukar palet per masa untuk peta |
| Garis pindai, piksel tajam, tanpa kedip (bagian 6) | Tokoh tampak atas dan avatar pemain |
| Bingkai piksel, tombol pilihan, dan kartu dampak (bagian 7) | Tata letak HP, layar kelas, dan konsol admin |
| Aturan menulis (*sentence case*, kalimat pendek) | Penanda kejadian, kotak bantuan, dan ikon skill |
| Aturan menggambar dengan kode dan daftar periksa aset (bagian 12) | Suara bawaan mati di HP |

- Untuk Jejak Setara, dokumen ini yang berlaku bila ada pertentangan. Untuk Sehari Setara, dokumennya sendiri tetap berlaku.
- Token CSS memakai awalan `--js-` dan kelas memakai awalan `js-`. Nilainya sama dengan token `--ss-` Sehari Setara.
- Mengubah warna palet atau menambah huruf memerlukan persetujuan pemilik proyek.

## 1. Arah visual

**Retro 8-bit yang cerah dan bersahabat, kini dilihat dari atas.** Rasanya sama dengan Sehari Setara: piksel besar dan tegas, warna datar dari palet terbatas, garis pindai tipis, garis luar biru tinta `ink`, wajah sederhana, serta suasana kampung dan sekolah yang terang dan ramah.

**Yang berubah dari Sehari Setara**

| Sehari Setara | Jejak Setara |
|---|---|
| Panggung: ruangan dilihat dari depan, tokoh berdiri di satu garis lantai | Tampak atas 3/4: tanah dilihat dari atas, sedangkan bangunan memperlihatkan atap dan dinding depannya |
| Enam latar tetap 320×180 | Satu peta kampung yang bisa dijelajah, tersusun dari ubin 16×16 |
| Tokoh besar (siswa 26×62) dengan ekspresi wajah | Tokoh kecil (siswa 16×24); ekspresi dibaca dari sikap tubuh dan ikon emosi |
| Satu layar proyektor | HP pemain, layar kelas di proyektor, dan konsol admin |

### Ciri khas yang paling diingat: "Kampung sehari"

Ciri "Langit sehari" Sehari Setara diteruskan. Ronde dipetakan ke satu hari: **pagi** keemasan, **siang** terang, dan **sore** jingga. Warna peta berganti lewat **tukar palet** (bagian 4), dan busur hari di bilah atas menunjukkan jam cerita. Layar akhir dan pembahasan bernuansa **malam** dengan lampu hangat, seperti akhir hari Nara. Elemen lain dibuat tenang agar ciri ini menonjol.

## 2. Prinsip

1. **Terbaca di HP dan dari bangku belakang.** Teks HP minimal 13 px CSS; teks layar kelas mengikuti skala proyektor Sehari Setara. Bila ragu, perbesar.
2. **Satu sentuhan, satu aksi.** Tombol besar dengan jarak cukup. Jawaban perlu dikunci, agar sentuhan tak sengaja tidak menjadi jawaban.
3. **Adil untuk semua.** Semua pemain melihat dunia dengan pandangan yang sama besar (320×180 piksel logis). Layar yang lebih lebar tidak memperlihatkan peta lebih banyak.
4. **Ramah, bukan menghakimi.** Persaingan tanpa mempermalukan: proyektor hanya menampilkan 10 besar, dan pilihan yang kurang tepat dijelaskan dengan nada mengajak.
5. **Retro sebagai rasa, bukan hambatan.** Efek retro tidak boleh mengurangi keterbacaan, aksesibilitas, atau kelancaran di HP kelas bawah.

## 3. Permukaan dan tata letak

### 3.1 Tiga permukaan

| Permukaan | Perangkat | Isi | Gaya |
|---|---|---|---|
| **Layar pemain** | HP mendatar, laptop | Dunia, HUD, dialog kejadian, rekap pribadi | Retro penuh |
| **Layar kelas** | Laptop guru yang tersambung ke proyektor | Lobi, papan skor langsung, podium, pembahasan | Retro penuh, skala proyektor |
| **Konsol admin** | Laptop atau PC; HP hanya untuk melihat | Dasbor, ruang, bank kejadian, rujukan, statistik, akun | Retro ringan: token dan bingkai sama, isi padat dan tenang |

### 3.2 Kanvas dunia

| Properti | Nilai |
|---|---|
| Pandangan logis | **320 × 180** piksel (16:9), sama untuk semua pemain |
| Ubin | 16 × 16 piksel logis; grid dasar 4 piksel |
| Peta | Sekitar **160 × 100 ubin** (2.560 × 1.600 piksel logis), kira-kira 8 × 9 layar HP (keputusan pemilik proyek, 6 Nov 2026) |
| Skala | Bilangan bulat terbesar yang muat, **dihitung dalam piksel perangkat** (memperhitungkan `devicePixelRatio`). Pandangan boleh terpotong paling banyak 2 piksel logis di setiap sisi (pandangan sedikitnya 316 × 176), agar HP dengan bilah alamat peramban tidak turun satu skala hanya karena kurang beberapa piksel (keputusan Gerbang 1 JS-07, 8 Nov 2026). Sisa ruang menjadi bingkai `ink` atau tempat HUD. Tidak pernah memakai skala pecahan |
| Kamera | Mengikuti pemain dengan zona mati 24 × 16 piksel di tengah; dijepit ke tepi peta; posisinya selalu bilangan bulat piksel logis |
| Teks di dalam gambar | **Tidak ada.** Nama samaran dan semua tulisan ditampilkan oleh antarmuka |

Contoh skala: HP 412 × 915 CSS px dengan rasio piksel 2,625 dalam posisi mendatar memiliki tinggi sekitar 1.080 piksel perangkat, sehingga skalanya ×6 (pandangan 1.920 × 1.080 piksel perangkat, yaitu 731 × 411 px CSS). Laptop 1366×768 dengan rasio 1 dan bilah peramban (tampilan sekitar 1366 × 657 px) memakai ×3 (960 × 540); dalam layar penuh, ×4 (1280 × 720).

### 3.3 Layar pemain di HP (mendatar)

```
┌─────────────────────────────────────────────────────────────┐
│ ☀─●──○──○ 10.24    ⏱ 11:32         ★ 340  #5   ┌─────────┐ │
│                                                │ peta    │ │
│                                                │ mini    │ │
│                                                └─────────┘ │
│                     DUNIA 320×180                          │
│                     (skala bulat)                          │
│                                                    (⚡2)    │
│                                              (➤1)          │
│   ╭─────╮                                                   │
│   │  ◎  │ joystick                       (?0)  ( PERIKSA )  │
│   ╰─────╯                                                   │
└─────────────────────────────────────────────────────────────┘
```

- **Bilah atas** (tinggi 28 px CSS, menimpa tepi atas dunia): busur hari mini dengan tiga titik masa dan jam cerita di kiri, sisa waktu di tengah, skor dan peringkat di kanan. Selama skor masih 0, peringkat tampil "#–" (keputusan Gerbang 1 JS-08).
- **Peta mini** di kanan atas, 112 × 75 px CSS. Mengetuknya membuka peta besar yang menutupi dunia; permainan tetap berjalan.
- **Joystick sentuh** muncul di titik sentuhan pertama pada separuh kiri layar (radius 48 px, kenop 24 px), dan hilang saat jari diangkat.
- **Tombol Periksa** bulat 64 px di kanan bawah. Tiga **tombol skill** bulat 48 px membentuk lengkung di sekitarnya (JS-09): Lari cepat di atas Periksa (`right: 24px; bottom: 100px`), Kompas kejadian serong kiri atas (`right: 78px; bottom: 78px`), dan Petunjuk di kiri (`right: 100px; bottom: 24px`), diukur dari tepi kanan dan bawah dunia yang tampil. Letak setiap skill tetap walaupun skill lain dimatikan. Jarak antartombol sedikitnya 10 px, ke Periksa 20 px, dan ke peta mini sedikitnya 70 px. Kolom tiga tombol di atas Periksa (rancangan awal) menabrak peta mini di HP 640 × 360 dan HP dengan bilah peramban (maket Plan JS-09). Tombol skill hanya tampil saat ronde berjalan, tidak selama dialog, peta besar, lapisan menyambung ulang, atau ajakan memutar HP.
- Pada HP yang lebih lebar dari 16:9, sisa ruang kiri-kanan menjadi bingkai `ink` dan kontrol boleh menempati bingkai itu. Pada layar 16:9, kontrol menimpa sudut dunia; pemain sendiri selalu berada di tengah, jauh dari kontrol.
- HP tegak menampilkan ajakan "Putar HP ke posisi mendatar" dengan ikon, tanpa dunia di belakangnya.
- Tombol "Layar penuh" di lobi memakai layar penuh peramban dan mengunci orientasi mendatar bila perangkat mendukung.
- **Menu dan suara (JS-14):** kelompok tombol di kiri atas dunia (`left: 8px; top: 36px`): "Menu" (tulisan huruf teks 16 px) lalu tombol suara (`ikon_suara_nyala` atau `ikon_suara_mati` pada skala 2), masing-masing setinggi 48 px, bergaris `ink` 4 px, berlatar `cream`, dan berjarak 8 px. Di laptop, tanda `Esc` dan `M` berada di dalam tombolnya. Keduanya tampil di lobi, hitung mundur, ronde, dan di atas lapisan jeda, dan tersembunyi selama dialog, peta besar, lapisan menyambung ulang, ajakan memutar HP, atau panel terbuka. Di layar identitas keduanya berada di baris kaki di kiri "Gabung", dan di rekap di kanan judul. Panah Kompas tidak menutupi kelompok ini (spesifikasi JS-14, P-4 sampai P-7).

### 3.4 Layar pemain di laptop

Tata letaknya sama, tetapi kontrol sentuh disembunyikan bila perangkat tidak memakai layar sentuh, dan saat pemain berada dalam jangkauan kejadian, tampil ajakan "`E` Periksa" di bawah tengah dunia. Tombol skill membentuk kolom di kanan bawah (JS-09): `right: 16px`, dengan `bottom` 132, 74, dan 16 px untuk Lari cepat, Kompas kejadian, dan Petunjuk bila ketiganya aktif. Skill yang dimatikan tidak memakan tempat, dan tombol yang tersisa turun ke bawah dengan urutan yang sama. Tanda tombol `1` `2` `3` bergaya ajakan "E Periksa" (Press Start 2P 12 px, garis `ink` 2 px, latar `sun`) tampil 8 px di kiri setiap tombol, tetap menurut skillnya walaupun skill lain dimatikan.

### 3.5 Dialog kejadian

- **HP:** lembar yang menutupi area dunia di bawah bilah atas, sehingga sisa waktu tetap terlihat (JS-08). **Laptop:** panel di tengah selebar 70% pandangan, di bawah bilah atas. Dunia di belakangnya tetap berjalan, tetapi avatar pemain diam.
- **Kepala:** ikon zona, judul kejadian (huruf judul), dan chip langkah "Langkah 1 dari 2".
- **Isi:** kotak situasi bergaya kotak narasi Sehari Setara, pertanyaan, lalu pilihan:
  - Langkah 1: empat tombol pilihan A–D, berbentuk kisi 2 × 2 di layar mendatar.
  - Langkah 2: tiga tombol pilihan A–C bersusun, karena teksnya lebih panjang; isi bisa digulir.
- **Kaki:** "Tutup" di kiri, "Petunjuk (n)" di tengah (hanya Langkah 1), dan "Kunci jawaban" di kanan (nonaktif sampai ada pilihan). Sejak JS-09, urutannya Tutup, Situasi (hanya di tampilan ringkas), Petunjuk, lalu Kunci jawaban, tetap satu baris dengan setiap tombol setinggi 48 px di dunia 610 × 343 sampai 1280 × 720. Tombol Petunjuk hanya tampil di tampilan Langkah 1 yang memuat pilihan, bila Petunjuk aktif di ruang; tanpa muatan tampak nonaktif (`mist`), dan sesudah dipakai bertuliskan "Petunjuk dipakai".
- **Petunjuk** (JS-09): kotak petunjuk berikon buku (16 px di lembar, 32 px di panel) dengan kalimat seukuran teks pertanyaan, latar `white`, dan garis kiri 4 px `sky-d`. Di tampilan penuh, kotak itu berada di antara pertanyaan dan pilihan; di tampilan ringkas, kotak itu menggantikan pertanyaan di tampilan pilihan. Pilihan yang dicoret bergaris coret, berlatar `mist` dengan teks `dusk`, tanpa ▶, tetap bisa difokus, dan dibacakan "{huruf}. {teks}, dicoret Petunjuk".
- **Sesudah Langkah 1:** pita umpan balik `leaf` dengan ikon hati ("Tepat") atau `mango` dengan ikon tanda tanya ("Belum tepat"), diikuti kalimat penjelasan, lalu tombol "Lanjut ke Langkah 2".
- **Sesudah Langkah 2:** kartu dampak dengan susunan Sehari Setara (kepala berwarna tingkat dengan ikon dan tulisan tingkat, lalu "Yang terjadi", "Hak yang terdampak", "Kewajiban terkait", dan "Rujukan"), angka skor melayang, serta tombol "Lanjut menjelajah".
- **Tampilan ringkas** (keputusan Gerbang 1 JS-08): dipakai bila tinggi area dialog kurang dari 560 px CSS, yaitu HP mendatar dan laptop yang dunianya 960 × 540. Kepala dan kaki dialog tetap. Langkah 1 dibagi dua tampilan: situasi dan pertanyaan dengan tombol "Lihat pilihan", lalu pertanyaan dan pilihan dengan tombol "Situasi". Umpan balik hanya menampilkan pita, pilihanmu, dan jawaban tepat. Langkah 2 menampilkan pertanyaan dan pilihan dengan tombol "Situasi". Kartu dampak boleh digulir, dengan tombol tetap terlihat. Rinciannya di spesifikasi JS-08.

### 3.6 Layar kelas (proyektor)

Memakai satuan `--u: min(1vh, 0.5625vw)` dan skala huruf proyektor Sehari Setara (1u = 7,2 px pada 1280×720). Rancangan acuan 1280×720, diuji juga pada 1024×768 dan 1920×1080.

**Lobi**

```
┌──────────────────────────────────────────────────────────┐
│ Jejak Setara · IX B                          23 pemain   │
├───────────────────────────────┬──────────────────────────┤
│  Buka: jejak.namadomain.id    │   ┌────────┐             │
│  Kode ruang                   │   │   QR   │             │
│      K 7 M P A                │   └────────┘             │
├───────────────────────────────┴──────────────────────────┤
│ [ava] Kancil Jingga  [ava] Jalak Biru  [ava] Anoa Hijau …│
├──────────────────────────────────────────────────────────┤
│ [Kunci ruang]                              [ Mulai ▶ ]   │
└──────────────────────────────────────────────────────────┘
```

**Saat bermain**

```
┌──────────────────────────────────────────────────────────┐
│ ☀ ─●──●──○  Siang 11.40            Sisa  08:12           │
├──────────────────────────────┬───────────────────────────┤
│                              │ 10 besar                  │
│   PETA KELAS                 │ 1 [ava] Jalak Biru   480 ✓6│
│   (titik pemain,             │ 2 [ava] Anoa Hijau   440 ✓5│
│    tanpa lokasi kejadian)    │ …                         │
├──────────────────────────────┴───────────────────────────┤
│ Kemajuan kelas ▮▮▮▮▮▮▯▯▯▯ 38%   [Jeda] [+2 menit] [Akhiri]│
└──────────────────────────────────────────────────────────┘
```

- Kode ruang memakai huruf judul 10u dengan jarak antarhuruf lebar. Tautan memakai huruf teks 3,6u.
- Papan 10 besar: peringkat, ikon avatar 16p, nama samaran (3,1u), skor (huruf judul 2,8u), dan jumlah kejadian selesai. Baris yang naik peringkat tidak dianimasikan, cukup berganti isi. Sejak JS-11, tanda ✓ pada jumlah kejadian selesai berupa ikon `ikon_centang` setinggi 2,5u diikuti angka, dengan teks pembaca layar "{n} kejadian selesai"; sketsa di atas tetap memakai ✓ sebagai lambang.
- **Jeda:** lapisan `ink` 70% di atas layar dengan tulisan "Dijeda" (huruf judul 4,4u, `cream`).
- **Podium:** tiga avatar di atas balok berwarna `sun` (1), `mist` (2), dan `wood` (3; token `--js-wood` sejak JS-10), masing-masing dengan angka peringkat, nama samaran, dan skor; daftar 4–10 di sampingnya. Latar bernuansa malam (`#4A4F9C`) dengan teks `cream`. Yang tampil hanya pemain yang sudah mendapat skor.
- **Pembahasan:** satu kartu per kejadian berisi judul, situasi, grafik batang Langkah 1 (empat pilihan dengan persentase; pilihan yang benar diberi ikon `ikon_centang` dan tulisan "Jawaban tepat", sejak JS-11), grafik batang Langkah 2 (tingkat tepat, kurang tepat, dan berisiko dengan ikon dan tulisan), lalu kartu dampak. Navigasi "Sebelumnya" dan "Berikutnya". Sejak Build JS-10, batang persen menjadi latar kotak opsinya (warna tingkat atau `leaf` untuk jawaban tepat, sebagian tembus), agar setiap opsi hanya satu blok dan kejadian bank awal muat di layar 16:9 tanpa digulir; isi yang lebih panjang digulir di dalam kartu.
- **Lobi (JS-10):** daftar nama lima kolom (avatar 4,4u, nama 2,8u; nama panjang mengecil sampai 2,5u lalu dipotong), urut bergabung, paling banyak 40 nama lalu "+n lainnya". Sejak JS-16b (P-8, P-9, P-17; D-1a), kotak kanan berisi kode QR alamat gabung (sedikitnya 36u, modul `ink` di atas putih dengan zona tenang 4 modul), satu kalimat keterangan, dan tombol "Perbesar QR" (`Q`) yang membuka lapisan setinggi layar; tiga langkah bergabung tidak dipakai lagi. Tombol "Kunci ruang" dan "Mulai" sedikitnya 48 px.
- **Peta kelas (JS-10):** delapan kotak zona berwarna (sebagian tembus) dengan ikon zona, dan titik 2,5 ubin berwarna tas bergaris `ink`; warna tas rose dan berry memakai nilai palet aksen bagian 8 karena belum punya token. Letak kejadian tidak digambar.
- **Suara dan kelola pemain (JS-14):** tombol suara 48 × 48 di kepala, di kanan jumlah pemain, dengan tulisan "Klik untuk menyalakan suara" di kirinya bila peramban menahan suara. Nama di daftar lobi menjadi tombol yang membuka menu "Ganti nama", "Keluarkan", dan "Batal" (butir 48 px, bergaris `ink` 3 px, "Keluarkan" berlatar `coral`). Tombol "Pemain" dengan tanda `P` di baris kontrol membuka panel lima kolom berisi semua nama, tanpa skor dan peringkat. Konfirmasi dan pita di proyektor tidak pernah memuat nama pemain.
- **Musik (JS-21):** tombol bertulisan "Musik" (huruf teks 2,5u) setinggi dan selebar sedikitnya 48 px, bergaris `ink` 3 px, dan berlatar `cream`; saat musik mati, latarnya `mist` dan tulisannya bercoret (DRAF D-1 JS-21). Tombol Musik dan tombol suara berada dalam satu kelompok di kanan atas (`top` 0,4u, `right` 6u), dengan tombol Musik di kiri. Tulisan "Klik untuk menyalakan suara" menjadi unsur pertama kelompok itu, sehingga kedua tombol tidak bergeser. Kepala dan bilah saat bermain memakai ruang kanan 24u agar kelompok itu tidak menutupi isinya (spesifikasi JS-21, P-7 sampai P-9).

### 3.7 Konsol admin

```
┌──────────────┬──────────────────────────────────────────────┐
│ Jejak Setara │ Bank kejadian                 YAN · Admin ⏻ │
│              ├──────────────────────────────────────────────┤
│ Dasbor       │ [Cari judul…] [Zona ▾] [Topik ▾] [Status ▾]  │
│ Ruang        │ ┌──────┬──────────────┬──────┬────────┬────┐ │
│ Riwayat      │ │ Kode │ Judul        │ Zona │ Status │ v  │ │
│ Bank kejadian│ ├──────┼──────────────┼──────┼────────┼────┤ │
│ Paket        │ │ K-13 │ Antrean …    │ Z7   │ Terbit │ 3  │ │
│ Rujukan      │ └──────┴──────────────┴──────┴────────┴────┘ │
│ Statistik    │                                [+ Kejadian]  │
│ Akun         │                                              │
│ Pengaturan   │                                              │
│ Log audit    │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

- Lebar ≥ 1280 px: navigasi samping 240 px dan isi paling lebar 1.200 px. Lebar 768–1279 px: navigasi bisa diciutkan. HP: dasbor dan hasil bisa dilihat, sedangkan penyuntingan disarankan di laptop.
- Penyunting kejadian dibagi dua kolom: formulir di kiri, **pratinjau HP** di kanan yang memakai komponen dialog kejadian yang sama dengan layar pemain.
- Halaman **layar kelas** dibuka dari konsol di tab atau jendela baru, untuk ditampilkan di proyektor.
- **Halaman masuk** (JS-04): panel bingkai piksel di tengah layar `ink` berisi merek "Jejak Setara", kolom email dan sandi, dan tombol Masuk; di bawahnya penanda server dan kredit bagian 15.
- **Kerangka** (JS-04): navigasi samping `ink`, kepala `cream` dengan judul halaman, nama dan peran, serta tombol Keluar, dan area isi `white` dengan panel `cream`. Menu hanya memuat halaman yang sudah dibangun (Gerbang 1 JS-04). Navigasi samping tampil di lebar 1024 px ke atas; di bawahnya diganti tombol "Menu" di kepala (spesifikasi JS-04, D-2).
- **Ruang, riwayat, dan hasil** (JS-11): halaman Ruang punya dua tab di bawah judul, "Berjalan" dan "Riwayat"; tab aktif memakai pola butir menu aktif (`sun`, ▶, `aria-current="page"`). Riwayat memuat saringan dalam satu baris yang membungkus dan tabel yang menjadi kartu di bawah 1024 px. Bagian "Hasil ronde" di halaman ruang berisi daftar istilah dua kolom, baris tombol unduh CSV dan Cetak, tabel peringkat dengan kepala tetap di atas saat digulir, tabel "Dikeluarkan", dan rincian yang terbuka di bawah baris pemainnya. Cetakan A4 tegak hanya memuat kepala cetak, ringkasan, dan tabel, dengan huruf sistem 10 pt dan garis 1 px `ink`.


- **Dasbor (JS-13):** salam, lalu empat kartu bingkai piksel dalam kisi dua kolom (satu kolom di bawah 1024 px): Peringatan (tautan setinggi 48 px dengan `ikon_peringatan` dan garis kiri `mango`), Ruang yang sedang berjalan, Sesi terakhir (tautan ke detail ruang, tanda `mist` "Uji"), dan Ringkasan 30 hari terakhir (angka Press Start 2P 16 px, batang tiga tingkat dengan kalimat persennya).
- **Halaman Statistik (JS-13):** saringan dalam satu baris yang membungkus, tabel 14 px dengan baris berselang `white` dan `cream`, dan rincian per baris. Di 1280 px ke atas tabel memuat sembilan kolom; di 1024–1279 px kolom Langkah 2, Keliru terbanyak, dan Petunjuk disembunyikan (isinya ada di rincian); di bawah 1024 px setiap baris menjadi kartu. Wadah tabel memakai `position: relative`, agar teks pembaca layar tidak meluapkan halaman.
- **Nama pemain (JS-14):** dialog Ruang baru mendapat kelompok "Nama pemain" (dua pilihan 48 px dengan keterangan, pola kelompok Skill). Halaman ruang mendapat baris "Nama pemain" di kepala, tombol "Ganti nama" di kiri "Keluarkan" pada setiap pemain, dan, di ruang nama buatan siswa, tombol "Ganti semua nama" dengan konfirmasi berbahaya.

## 4. Warna

Palet **36 warna** Sehari Setara berlaku penuh. Sumber tunggalnya tetap `scripts/game/art/palette.json`. Aset gambar hanya boleh memakai warna palet itu, tanpa piksel semi-transparan.

### Token antarmuka (CSS)

```css
:root {
  /* Sama nilainya dengan token --ss- Sehari Setara */
  --js-ink: #1F2A44;  --js-dusk: #3A4A6B;  --js-mist: #C9D4E5;
  --js-cream: #FFF6E0; --js-white: #FFFFFF;
  --js-sun: #FFD23F;  --js-mango: #FF9F1C; --js-coral: #FF6B5B;
  --js-leaf: #8AD95B; --js-teal: #2EC4B6;  --js-sky-d: #3A86D9;
  --js-malam: #4A4F9C;
  --js-wood: #C98B4F; /* Balok podium ke-3 (JS-10) */

  /* Peran */
  --js-surface: var(--js-cream);
  --js-text: var(--js-ink);
  --js-text-2: var(--js-dusk);
  --js-focus: var(--js-sun);
  --js-tier-tepat: var(--js-leaf);
  --js-tier-kurang: var(--js-mango);
  --js-tier-berisiko: var(--js-coral);
  --js-marker: var(--js-sun);          /* penanda kejadian belum diperiksa */
  --js-marker-selesai: var(--js-leaf); /* kejadian yang sudah dijawab */
  --js-diri: var(--js-sun);            /* panah diri di peta mini */
  --js-kompas: var(--js-teal);         /* panah skill Kompas */
  --js-status-draf: var(--js-mist);
  --js-status-tinjau: var(--js-sun);
  --js-status-terbit: var(--js-leaf);
  --js-status-perhatian: var(--js-mango);
}
```

### Tukar palet per masa

Ubin peta digambar dengan **kunci bahan**, lalu kit gambar mengekspor satu lembar ubin per masa dengan pemetaan bahan ke warna palet. Tabel ini adalah titik awal; pemetaan akhir ditetapkan lewat pratinjau di fitur aset peta.

| Bahan | Pagi | Siang | Sore |
|---|---|---|---|
| Rumput | `leaf` | `leaf` | `leaf` |
| Tekstur rumput, daun | `grass` | `grass` | `grass` |
| Kilau (sisi yang kena cahaya) | `PAGI2` `#FFF1C9` | `white` | `SORE1` `#FFE3A3` |
| Bayangan bangunan dan pohon (papan catur) | `dusk` | `dusk` | `wood-d` |
| Aspal | `slate` | `slate` | `slate` |
| Marka, zebra cross, dan garis lapangan | `cream` | `white` | `cream` |
| Air | `PAGI1` `#9ED8F5` | `SIANG1` `#6EC6F2` | `SORE3` `#FF9E6B` |
| Air dalam | `sky-d` | `sky-d` | `sky-d` |
| Pasir | `PAGI2` | `cream` | `SORE1` |
| Dinding | `cream` | `cream` | `cream` |
| Tanah setapak | `skin-2`, kerikil `wood` | sama | sama |
| Paving gang | bata `wood`, nat `wood-d` | sama | sama |
| Semen (halaman, trotoar, lantai pasar) | `mist`, bintik dan tepi `slate` | sama | sama |
| Pinggir aspal | bayangan kerb `dusk`, garis tepi mengikuti marka | sama | sama |

Atap, kayu, kulit, rambut, pakaian, dan ikon tidak ikut ditukar. Bila 36 warna terbukti tidak cukup (misalnya untuk tajuk pohon yang lebih gelap), ajukan paling banyak 4 warna tambahan khusus peta lewat keputusan terbuka KT-04. Jangan menambah warna sebelum disetujui.

Aturan tukar palet yang disetujui bersama aset kelompok U (6 November 2026):

- Hanya lembar ubin yang berganti per masa: `ubin_pagi.png`, `ubin_siang.png`, dan `ubin_sore.png`, dengan nomor ubin yang sama di ketiganya.
- Bayangan bangunan, pohon, dan objek besar berupa **ubin tumpang lapisan 10** di lembar ubin, sehingga ikut berganti warna. Letaknya dihitung `build_peta.py`.
- Objek, tokoh, dan ikon cukup satu berkas untuk semua masa, dengan warna tetap.
- Layar akhir dan pembahasan bernuansa malam memakai warna antarmuka `#4A4F9C`, bukan lembar ubin malam.

### Kontras tambahan (sudah dihitung)

| Pasangan | Rasio | Status |
|---|---|---|
| `ink` di atas `berry` | 3,5 : 1 | **Jangan** untuk teks; `berry` hanya dekorasi |
| `ink` di atas `rose` | 6,7 : 1 | Boleh untuk label |
| `ink` di atas `wood` | 5,0 : 1 | Label di balok podium ke-3 |
| `cream` di atas `#4A4F9C` (malam) | 6,8 : 1 | Teks podium dan pembahasan |
| `ink` di atas `grass` | 4,6 : 1 | Garis luar penanda di atas rumput; bukan untuk teks kecil |
| `ink` di atas `slate` | 3,3 : 1 | Garis luar penanda di atas aspal; **jangan** untuk teks |
| `sun` di atas `grass` | 2,2 : 1 | Tidak cukup sendirian, jadi penanda `sun` **wajib** bergaris luar `ink` |
| `cream` di atas `grass` | 2,9 : 1 | **Jangan** untuk teks |

Aturan praktis Sehari Setara tetap berlaku: **teks di atas warna aksen selalu `ink`.** Objek grafis penting (penanda, panah kompas, tombol) harus kontras ≥ 3 : 1 terhadap latarnya.

## 5. Tipografi

| Peran | Huruf | Catatan |
|---|---|---|
| Judul layar, judul kejadian, angka (skor, waktu, kode ruang) | **VT323** lewat `--js-huruf-judul`, dengan `font-size-adjust: cap-height 1` (`--js-huruf-judul-sesuai`) | Maksimal 6 kata; tidak untuk paragraf. Tanda minus boleh dipakai sejak JS-16b (P-5) |
| Situasi, pilihan, label, tombol | **VT323** lewat `--js-huruf-teks`, dengan `font-size-adjust: cap-height 0.64` (`--js-huruf-teks-sesuai`; tinggi huruf kecil sama dengan huruf teks lama) | Label nama di kanvas memakai ukuran × 8/7, karena kanvas tidak mengenal `font-size-adjust` (JS-16b, P-3; penyimpangan 1 Test JS-16b) |
| Tabel dan formulir konsol admin | Huruf sistem (`system-ui, "Segoe UI", Roboto, "Noto Sans", sans-serif`) | Diputuskan pemilik proyek 14 Nov 2026 (KT-05, Gerbang 1 JS-04): ya. Judul, menu, dan tombol memakai huruf teks |

Sejak JS-16b (P-1 sampai P-5), nama huruf Jejak Setara hanya ditulis di empat token `:root` di `jejak.css`, dan paket hurufnya `@fontsource/vt323` 5.3.0 (subset latin, berbobot 400). Angka ukuran di tabel berikut tetap berlaku, karena `font-size-adjust` menyamakan ukuran VT323 dengan huruf lama: tinggi huruf kapital 1,0 em untuk judul, dan untuk teks tinggi huruf kecil yang sama dengan huruf teks lama (tinggi kapital 0,64 em). Aturan yang dulu memakai tinggi baris `normal` memakai token `--js-huruf-judul-baris` (1) dan `--js-huruf-teks-baris` (1,2), agar tata letak tidak bergeser. Sehari Setara tetap memakai Press Start 2P dan Pixelify Sans.
| Cadangan | `monospace` | Bila huruf gagal dimuat |

### Skala ukuran

| Gaya | HP (px CSS) | Laptop (px CSS) | Layar kelas | Konsol |
|---|---|---|---|---|
| Judul layar | 16 | 22 | 4,4u | 22 (huruf teks) |
| Judul kejadian | 13 | 16 | 2,8u | — |
| Teks situasi | 17 | 20 | 3,6u | 16 |
| Teks pilihan | 16 | 18 | 3,1u | 15 |
| Label kecil | 13 (batas minimum) | 14 | 2,5u | 13 |
| Angka HUD | 12 (huruf judul) | 14 | 2,8u | — |
| Kode ruang | — | — | 10u | 20 |

Aturan menulis Sehari Setara berlaku: huruf kapital hanya di awal kalimat, satu baris paling banyak sekitar 60 karakter, dan situasi paling banyak 3 kalimat.

## 6. Efek layar

- **Garis pindai:** hanya di atas kanvas dunia, berupa lapisan CSS (bukan bagian aset): garis 1 px CSS setiap 3 px CSS, warna `ink` dengan opasitas 10%. Tidak ada garis pindai di HUD, dialog, layar kelas, atau konsol.
- **Vinyet:** tidak dipakai di HP; boleh di laptop dengan opasitas ≤ 12%.
- **Tanpa kedip dan tanpa guncangan.** Tidak ada efek layar berkedip, *glitch*, guncangan kamera, atau zoom mendadak.
- **Piksel tajam:** `imageSmoothingEnabled = false` di kanvas, skala bilangan bulat (bagian 3.2), dan posisi gambar dibulatkan ke piksel logis.

## 7. Dunia: perspektif, ubin, lapisan, dan zona

### Perspektif tampak atas 3/4

- Tanah, jalan, dan lantai dilihat lurus dari atas.
- Bangunan memperlihatkan **atap** dari atas dan **dinding depan** setinggi 1–2 ubin. Pintu selalu di dinding depan agar pemain tahu arah masuk.
- Pohon: batang 1 ubin di tanah (tidak bisa ditembus) dan tajuk 2 × 2 ubin di lapisan atas.
- Cahaya datang dari kiri atas. Bayangan jatuh ke kanan bawah sebagai pola papan catur.

### Lapisan (urutan tumpukan)

| z | Lapisan |
|---|---|
| 0 | Tanah (rumput, jalan, air, pasir) |
| 10 | Detail tanah (marka, bunga, retakan) |
| 20 | Objek bawah (pagar, meja, tempat sampah, kursi roda) |
| 30 | Tokoh, avatar, penanda, dan kotak, diurutkan menurut baris kaki (y) |
| 40 | Objek atas (atap, tajuk pohon) |
| 50 | Efek (debu lari, kilau kotak) |
| 60 | Siluet avatar pemain sendiri saat tertutup objek atas: garis dalam `ink` 1 piksel, lalu garis luar `sun` 1 piksel, agar salah satunya selalu kontras ≥ 3 : 1 terhadap atap |
| 70 | Garis pindai (CSS) |
| 80+ | HUD dan dialog (HTML) |

### Zona

Setiap zona punya bangunan penanda dan bahan dominan agar pemain bisa mengenali tempat tanpa membaca tulisan.

| Zona | Bahan dan warna dominan | Bangunan penanda | Ikon zona (16×16) |
|---|---|---|---|
| Z1 Rumah dan gang | Atap `coral`, pagar bambu `wood` | Rumah Nara, warung Pak Made | Rumah |
| Z2 Sekolah | Dinding `cream`, atap `sky-d`, lapangan bergaris `white` | Gedung SMP dua lantai, tiang bendera | Buku |
| Z3 Jalan dan halte | Aspal `slate`, zebra cross, halte beratap `teal` | Persimpangan, angkot berhenti | Rambu |
| Z4 Pasar | Tenda bergaris `mango` dan `sun` | Los pedagang, gerobak | Keranjang |
| Z5 Balai warga | Bale kayu `wood` beratap `wood-d` | Pos ronda dengan kentongan | Kentongan |
| Z6 Taman, sungai, dan pantai | Air, pasir, rumput | Jembatan kayu, pohon kelapa | Pohon kelapa |
| Z7 Puskesmas dan kantor desa | Dinding `white`, atap `teal` | Puskesmas dengan ikon hati | Hati |
| Z8 Pojok gawai | Warung beratap `berry` | Antena dan bangku panjang | Gelombang sinyal |

### Aturan peta

1. Jalan yang bisa dilewati paling sempit 2 ubin. Hindari jalan buntu yang lebih panjang dari 6 ubin tanpa tujuan.
2. Yang tidak bisa ditembus harus tampak padat (dinding, batang, pagar, air); yang bisa dilewati tampak datar.
3. Dari titik mana pun, sedikitnya satu bangunan atau objek khas zona terlihat di layar (Permintaan C-11, usulan JS-06 nomor 5a, disetujui 8 Nov 2026). Objek khas per zona: Z1 rumah Nara, warung Pak Made, rumah A–D, dan pagar bambu; Z2 gedung sekolah, kantin, tiang bendera, gerbang, dan pagar sekolah; Z3 halte, angkot, rambu penyeberangan, dan rambu halte; Z4 tenda, los, gerobak, lapak, dan pos keamanan; Z5 bale dan pos ronda; Z6 pohon kelapa dan jembatan; Z7 puskesmas, kantor desa, dan bangku antrean; Z8 warung berwifi. Daftar nama berkasnya di spesifikasi JS-06 P-14.
4. Rambu dan papan hanya memakai ikon, tanpa tulisan.
5. **Jangan** memakai lambang palang merah atau bulan sabit merah untuk puskesmas, karena lambang itu dilindungi hukum. Pakai ikon hati atau tanda tambah berwarna `leaf`.
6. Tempat ibadah tidak digambar sebagai penanda zona. Kejadian bertema toleransi terjadi di lingkungan rumah dan balai warga.
7. Sekitar setiap titik kejadian disediakan ruang kosong 3 × 3 ubin untuk tokoh dan properti kejadian. Tokoh dan properti `setTokoh` ditata otomatis di ruang itu dan bisa dilewati (JS-08).

## 8. Tokoh tampak atas

### Proporsi

| Jenis | Kanvas (termasuk margin 1 px) | Catatan |
|---|---|---|
| Siswa SMP dan avatar pemain | 16 × 24 | Kepala sekitar 12 × 10, badan 10 × 8, kaki 2 piksel |
| Dewasa | 16 × 26 | Badan lebih tinggi 2 piksel |
| Anak SD | 14 × 20 | |
| Lansia | 16 × 24 | Sedikit membungkuk, boleh bertongkat |

- Gaya *chibi*: kepala sekitar separuh tinggi tokoh, agar terbaca di HP.
- Garis luar 1 piksel `ink` hanya di tepi siluet. Mata 1 × 2 piksel `ink`. Setiap bahan paling banyak 3 tingkat warna.
- **Bayangan kaki:** elips 10 × 4 berpola papan catur `ink` (bukan piksel semi-transparan).
- **Arah:** bawah, atas, dan samping kanan; kiri adalah cermin samping kanan, kecuali detail asimetris yang jelas.
- **Bingkai:** diam 2 (bernapas, 2 fps), jalan 4 (8 fps), lari memakai bingkai jalan pada 12 fps.
- Ekspresi dibaca dari sikap tubuh dan **ikon emosi** 8×8 Sehari Setara (hati, tetes keringat, tanda tanya, tanda seru) di atas kepala.

### Avatar pemain

- **Delapan desain dasar** (A1–A8) dengan seragam SMP (kemeja putih, celana atau rok `navy`) dan variasi warna kulit (`skin-1` sampai `skin-4`), rambut (`hair-1`, `hair-2`; pendek, panjang dikuncir), kerudung putih, dan kacamata.
- **Tas punggung** berwarna penanda pemain dari delapan aksen: `sun`, `mango`, `coral`, `rose`, `berry`, `teal`, `leaf`, `sky-d`. Warna tas dipilih otomatis agar pemain berdekatan tidak berwarna sama.
- Tas digambar dengan dua **warna kunci**, `sun` (dasar) dan `mango` (bayangan), yang tidak dipakai bagian lain avatar. Saat memuat, antarmuka membuat salinan avatar untuk setiap warna tas dengan mengganti kedua warna kunci **serentak** (bukan berurutan), memakai pasangan berikut:

  | Warna tas | Dasar | Bayangan |
  |---|---|---|
  | sun | `sun` | `mango` |
  | mango | `mango` | `coral` |
  | coral | `coral` | `wood-d` |
  | rose | `rose` | `coral` |
  | berry | `berry` | `malam` (`#4A4F9C`) |
  | teal | `teal` | `grass` |
  | leaf | `leaf` | `grass` |
  | sky-d | `sky-d` | `navy` |

- Label nama samaran ditampilkan antarmuka di atas kepala, paling banyak 8 label terdekat sekaligus. Label pemain sendiri disembunyikan.

### Tokoh bukan pemain

- Tokoh Sehari Setara versi tampak atas dengan ciri visual yang sama: Nara (tas `sun` bertali `mango`), Ibu, Gita, Dimas, Sinta (berkerudung putih), Bu Ratih (batik `teal`, kacamata), Komang, Pak Made (kaus `mango`, sarung kotak-kotak), dan Bayu (kaus `mist`, digambarkan netral dan ramah).
- Warga umum: dewasa (3 variasi), lansia, ibu menggendong bayi, anak SD (2), pedagang, petugas puskesmas, dan polisi yang bersikap membantu.
- Tokoh baru Jejak Setara (disetujui bersama aset kelompok N2, 6 November 2026): **Raka**, teman sekelas berkursi roda (`skin-3`, rambut belah tengah `hair-2`, seragam tanpa tas, tangan di pelek roda; K-04); **Wayan**, teman sekelas yang membantu orang tuanya berdagang (`skin-4`, rambut belah tengah, kaus `leaf`, celana pendek cokelat, sandal; K-14); dan **siswa SMP umum** S1–S6, empat berbaju bebas dan dua berseragam (K-03, K-10, K-11, K-12, K-13, K-16).
- Tokoh bukan pemain tidak memakai tas punggung, kecuali Nara, agar tidak tertukar dengan avatar pemain.
- Tokoh bukan pemain cukup berpose diam menghadap bawah (2 bingkai), ditambah pose khusus bila kejadian memerlukannya (menunjuk, menunduk, duduk di kursi roda).

Semua aturan tokoh Sehari Setara tetap berlaku: tokoh orisinal, warna kulit beragam, tanpa stereotip, perundungan ditunjukkan lewat jarak dan sikap tubuh, bukan pukulan, dan tokoh berwenang digambarkan membantu.

## 9. Penanda dan ikon dunia

| Penanda | Bentuk | Warna | Arti |
|---|---|---|---|
| Kejadian belum diperiksa | Gelembung bulat 12 × 12 bertanda "!" | `sun`, garis luar `ink` | Ada kejadian yang bisa diperiksa |
| Kejadian sedang dibuka pemain sendiri | Gelembung "…" | `mist`, garis luar `ink` | Dialog terbuka |
| Kejadian selesai | Gelembung kecil bertanda ✓ | `leaf`, garis luar `ink` | Sudah dijawab pemain ini |
| Kotak bantuan | Peti 14 × 12 dengan ikon skill di tutupnya; strip tiga bingkai (kecil, besar berkilau, biasa). Tergambar di lapisan tokoh dan diurutkan menurut baris kaki 16y + 14 (JS-09) | `wood`, ikon skill | Ambil dengan melewatinya |
| Halte | Tiang dengan ikon angkot | `teal` | Halte angkot (P1) |
| Panah kompas | Panah 7 × 7 dalam 8 arah, digambar dua kali lebih besar (14 × 14 piksel logis, skala bulat) di tepi kotak aman pandangan, yang tidak tertutup bilah atas, peta mini, tombol skill, Periksa, dan ajakan "E Periksa" (JS-09) | `teal`, garis luar `ink` | Arah titik sasaran Kompas; disembunyikan selama titik itu tampak |
| Diri di peta mini | Panah | `sun`, garis luar `ink` | Posisi dan arah pemain |
| Pemain lain di peta kelas | Titik 3 × 3 | Warna tas, garis luar `ink` | Posisi pemain |

- Penanda kejadian selalu dibedakan dengan **bentuk dan tanda**, bukan hanya warna.
- Ikon skill (16 × 16): sepatu untuk Lari cepat, kompas untuk Kompas kejadian, buku terbuka untuk Petunjuk, teropong, dan karcis untuk Angkot.

## 10. Komponen antarmuka

Semua panel memakai **bingkai piksel** Sehari Setara: garis `ink` 2 piksel antarmuka, sudut terpotong, sorotan `white` di sisi atas-dalam, dan latar `cream`. Di HP, satu piksel antarmuka sama dengan 2 px CSS.

### Layar pemain

| Komponen | Isi dan status |
|---|---|
| **Bilah atas** | Busur hari mini (tiga titik masa; ikon matahari di titik berjalan), jam cerita, sisa waktu (angka berlatar `mango` dengan teks `ink` pada dua menit terakhir), skor dengan ikon bintang, dan peringkat "#n". Latarnya mengikuti masa: pagi `#FFD9A8`, siang `#6EC6F2`, sore `#FFC27A`, teks `ink` |
| **Joystick** | Lingkaran `cream` 85% bergaris `ink`, kenop `sun`. Tidak tampil di perangkat tanpa layar sentuh |
| **Tombol Periksa** | Biasa: `mist` dengan teks `dusk` ("Periksa"), nonaktif `aria-disabled`. Dalam jangkauan: `sun` dengan teks `ink`. Ditekan: geser keras 1 piksel antarmuka |
| **Tombol skill** | Bulat 48 px bergaris `ink` 4 px dengan ikon skill 16 × 16 pada skala 2, dan lencana muatan 22 × 22 (garis `ink` 2 px, latar `white`, angka huruf judul 12 px di perangkat sentuh dan 14 px di laptop) di sudut kiri atas. Bermuatan: `cream`. Tanpa muatan: `mist`, lencana "0", `aria-disabled`. Sedang aktif (Lari cepat dan Kompas): cincin dalam `sun` 4 px, nonaktif sampai skill selesai. Jeda 2 detik: blok `ink` 70% yang menyusut dari atas ke bawah dalam 8 langkah. Ditekan: geser 1 piksel antarmuka sampai jawaban tiba, paling lama 2 detik. Fokus: garis luar `sun` 4 px seperti Periksa (JS-09) |
| **Peta mini** | Bingkai piksel; zona dalam warna dominannya; panah diri; penanda kejadian yang sudah terlihat; halte |
| **Pemberitahuan** | Pita di atas tengah selama 3 detik, misalnya "+1 Lari cepat" atau "Dua menit lagi". Sejak JS-09, lebar luarnya paling besar lebar dunia yang tampil dikurangi 256 px (berjarak sedikitnya 4 px dari peta mini), teks panjang terbungkus menjadi dua baris rata tengah, dan pita tampil satu per satu dalam antrean paling banyak 3 butir. Pita skill tidak tampil selama dialog. Diumumkan ke pembaca layar; pita skill tidak memakai `role="status"`, karena teksnya masuk antrean pengumuman |
| **Tombol pilihan A–D** | Aturan tombol pilihan Sehari Setara: biasa `cream`, fokus atau terpilih `sun` dengan ▶ dan cincin dalam, nonaktif `mist`. Sesudah dikunci: pilihan benar `leaf` berlabel "Jawaban tepat", pilihan pemain yang keliru `mango` berlabel "Pilihanmu". Dicoret Petunjuk (JS-09): `mist`, teks `dusk` bergaris coret, tanpa ▶. Selalu dengan tulisan, bukan hanya warna |
| **Kartu dampak** | Susunan kartu dampak Sehari Setara, satu kolom di HP, ditambah angka poin "+60". Sejak JS-09, jawaban "tepat" yang menambah muatan Kompas menampilkan "+1 Kompas" berikon kompas 16 × 16 di kanan angka poin |
| **Layar menyambung** | Lapisan `ink` 70% dengan "Menyambung ulang…" dan ikon jam berputar 2 bingkai. Sesudah 30 detik ditambah "Periksa wifi atau data selulermu." |
| **Layar jeda** | "Dijeda oleh guru" di atas lapisan `ink` 70% |
| **Lobi pemain** | Kode ruang, nama samaran, avatar, dan "Menunggu guru memulai…"; pemain bisa berjalan di halaman lobi |
| **Rekap pribadi** | Skor, peringkat, lalu daftar kejadian yang dijawab dengan pilihan pemain, pilihan yang tepat, dan rujukan; dua kalimat refleksi di akhir. Sejak JS-11: halaman digulir biasa selebar paling banyak 560 px; tanda Langkah 1 dan tingkat Langkah 2 berikon emosi dan bertulisan (`leaf`, `mango`, `coral`; "Belum dijawab" `mist`); pita `mango` saat menyambung ulang dan pita `mist` dengan satu tombol sesudah ruang ditutup atau sambungan berhenti, tanpa lapisan yang menutup isi |

- **Komponen JS-14:** panel Pengaturan, Privasi, dan Tentang memakai bingkai piksel di tengah layar di atas lapisan `ink` 70% (lebar paling besar 640 px), dengan kelompok pilihan dua tombol (pola tombol pilihan, 48 px) dalam dua kolom bila lebar panel ≥ 520 px. Isian nama pemain memakai gaya isian layar gabung dengan penghitung "n/14" di kanan label. Pita "Gurumu mengganti namamu menjadi …" memakai antrean pita JS-09.

### Layar kelas

Kode ruang besar, kartu pemain lobi, papan 10 besar, bilah kemajuan kelas (12 blok seperti pengatur waktu Sehari Setara), tombol kontrol (tampilan tombol lanjut Sehari Setara), podium, dan kartu pembahasan dengan grafik batang (bagian 3.6). Grafik batang selalu menuliskan persentase dan label di samping batangnya. Tanda centang di layar kelas memakai ikon `ikon_centang`, bukan huruf ✓, karena huruf itu tampil berbeda di peramban Windows (JS-11).

### Konsol admin

| Komponen | Isi dan status |
|---|---|
| **Navigasi samping** | Butir aktif: latar `sun`, ▶, dan teks `ink` |
| **Tabel** | Kepala `mist`, baris berselang `cream` dan `white`, baris yang difokus bergaris `ink` |
| **Label status** | Draf (`mist`), Siap tinjau (`sun`), Terbit (`leaf`), Arsip (`mist` dengan ikon kotak arsip), Rujukan belum diverifikasi (`mango` dengan ikon tanda seru), Terverifikasi (`leaf` dengan ikon centang). Tanda "Petunjuk" di rincian jawaban (`white` dengan ikon buku, JS-09). Teks selalu `ink` dan selalu disertai tulisan |
| **Formulir** | Label di atas kolom; penghitung karakter "86/90"; galat validasi `coral` dengan ikon dan kalimat perbaikan di bawah kolom. Kelompok kotak centang berlegenda, misalnya "Skill" di dialog Ruang baru (JS-09): setiap pilihan setinggi 48 px dengan ikon 16 × 16 dan nama, lalu satu kalimat keterangan |
| **Pemilih rujukan** | Daftar rujukan dari pustaka dengan status verifikasinya; rujukan baru dibuat di halaman Rujukan |
| **Pratinjau** | Bingkai HP mendatar berisi dialog kejadian persis seperti di layar pemain |
| **Grafik** | Batang mendatar dengan label dan angka; warna tingkat `leaf`, `mango`, `coral`, sedangkan pilihan netral `sky-d` |
| **Konfirmasi berbahaya** | Dialog dengan judul "Hapus data ruang IX B?", penjelasan akibat, dan tombol `coral` bertuliskan aksinya ("Hapus data"), bukan "OK". Untuk hapus data ruang (JS-11), tombol baru aktif sesudah label kelas diketik ulang, dan fokus awal ada di isian itu |
| **Tab halaman** | Tautan bergaya tab di bawah judul halaman (JS-11: "Berjalan" dan "Riwayat" di halaman Ruang). Tab aktif berlatar `sun` dengan ▶ dan `aria-current="page"`; tab lain `white` bergaris `ink` |
| **Keadaan kosong** | Ikon, satu kalimat, dan satu tombol aksi (misalnya "Belum ada ruang. Buat ruang pertama.") |


- **Grafik batang statistik (JS-13):** batang 12 px bergaris `ink` 2 px berisi `sky-d`, atau warna tingkat untuk Langkah 2; pilihan yang benar `leaf` dengan tanda `ikon_centang` "Jawaban tepat". Angka "{n} ({p}%)" selalu tertulis, dan batang hanya hiasan bagi pembaca layar. Batang bertumpuk tiga tingkat (`leaf`, `mango`, `coral`) memakai tinggi dan garis yang sama.
- **Label kategori indeks kesulitan (JS-13):** tanda bergaris `ink` dengan teks `ink` "Sulit" (`coral`, indeks di bawah 0,30), "Sedang" (`sun`, 0,30 sampai 0,70), atau "Mudah" (`leaf`, di atas 0,70). Kategori selalu tertulis di samping angkanya.
## 11. Gerak dan animasi

| Hal | Aturan |
|---|---|
| Karakter gerak | Bertahap (`steps()`), bukan halus |
| Avatar | Jalan 8 fps, lari 12 fps, diam 2 fps |
| Penanda kejadian | Naik-turun 1 piksel setiap 0,5 detik (2 bingkai) |
| Kotak bantuan | Kotak yang muncul lagi di depan mata pemain: pop 3 bingkai (kecil, besar berkilau, biasa) masing-masing 80 ms. Kotak yang diambil langsung hilang, diganti `tanda_kilau` 2 bingkai masing-masing 80 ms. Kotak yang tampil saat ronde mulai atau saat layar dimuat tidak diberi pop (JS-09) |
| Skor melayang | "+60" naik 4 piksel dalam dua langkah selama 240 ms di samping skor pada bilah atas, lalu hilang sesudah 1 detik (JS-08) |
| Lari cepat | Langkah 12 fps dan debu 2 bingkai (`tanda_debu`) 7 piksel di belakang kaki saat menghadap kanan atau kiri, atau 2 piksel di bawah kaki saat menghadap atas atau bawah; pemain lain tampak berlari bila dalam 500 ms terakhir bergerak lebih dari 45 piksel (JS-09) |
| Kompas | Panah berdenyut 2 bingkai (biasa dan terang) setiap 0,5 detik |
| Ganti masa | Palet peta dan warna bilah atas langsung berganti, tanpa sapuan |
| Hitung mundur | Angka 3, 2, 1 besar di tengah, masing-masing 1 detik, tanpa membesar halus |
| Podium | Balok naik dalam 3 langkah selama 300 ms, sekali |
| Kamera | Tanpa guncangan dan tanpa zoom |
| Dialog | Muncul langsung. Tombol maju baru bekerja 600 ms sesudah tampil, agar tekanan ganda tidak melewatkan isi (aturan Sehari Setara) |
| Durasi antarmuka | 120–400 ms |

**Kurangi gerak** (`prefers-reduced-motion` atau pengaturan): penanda dan panah diam, tanpa pop, tanpa kilau, tanpa skor melayang (skor langsung berganti), tanpa debu, podium langsung di tempatnya, dan sprite tetap di bingkai pertama walaupun avatar berpindah. Blok jeda tombol skill tampil penuh selama 2 detik lalu hilang, tanpa menyusut bertahap (JS-09). Masa tunggu 600 ms tetap berlaku. Sejak JS-14, pengaturan Kurangi gerak di layar pemain menggantikan pengaturan perangkat untuk tab itu (atribut `data-kurangi-gerak` di `<html>`), sedangkan layar kelas dan konsol tetap mengikuti perangkat. Teks muncul per huruf tidak terpengaruh kurangi gerak.

## 12. Suara

- Bawaan **mati** di layar pemain (kelas berisi puluhan HP); bawaan **nyala** 60% di layar kelas. Tombol `M` dan ikon suara mengubahnya. Sejak JS-14, HP baru mengunduh berkas suara saat pemain menyalakan suara, dan layar kelas menampilkan "Klik untuk menyalakan suara" bila peramban menahan bunyi. Pemicu setiap bunyi ada di spesifikasi JS-14 (P-22 untuk layar pemain, P-31 untuk layar kelas).
- Bunyi klik (gaya A) dan bunyi teks (gaya B) Sehari Setara dipakai ulang tanpa perubahan, sebagai salinan identik byte `sfx_klik.wav` dan `sfx_teks.wav` di `app/jejak-setara/assets/sfx/` (Permintaan C-15).

| Peristiwa | Karakter bunyi | Berkas | Keras terdengar |
|---|---|---|---|
| Kejadian pertama kali terlihat | Dua nada naik pendek | `sfx_kejadian.wav` | sekitar −18 LUFS |
| Ambil kotak | Denting naik | `sfx_kotak.wav` | sekitar −18 LUFS |
| Skill aktif | Desir pendek | `sfx_skill.wav` | sekitar −18 LUFS |
| Jawaban tepat | Arpeggio ceria | `sfx_tepat.wav` | sekitar −18 LUFS |
| Kurang tepat atau berisiko | Nada rendah lembut, tidak mengagetkan | `sfx_lembut.wav` | sekitar −21 LUFS |
| Hitung mundur | Tik per angka | `sfx_hitung.wav` | sekitar −21 LUFS |
| Dua menit terakhir | Dua tik pelan | `sfx_peringatan.wav` | sekitar −23 LUFS |
| Akhir ronde | Jingle 3–4 detik (layar kelas) | `sfx_akhir.wav` | sekitar −16 LUFS |
| Musik latar (P1, JS-21; layar kelas) | Lagu chiptune tenang 16 birama yang berulang mulus | `musik_kelas.wav` | sekitar −24 LUFS |

Ketentuan berkas suara (Permintaan C-14 dan C-16; usulan Sesi C KT-C20 sampai KT-C26 pilihan a, disetujui pemilik proyek 21 November 2026):

- **Format:** WAV PCM mono 16 bit 22.050 Hz, sama dengan klik dan bunyi teks. Efek pendek paling lama 0,65 detik dan paling besar 30 KB.
- **Jingle akhir** `sfx_akhir.wav`: pengecualian ukuran, paling besar 160 KB (sekitar 3,2 detik), karena hanya dimuat layar kelas dan tidak pernah dimuat HP pemain.
- **Musik latar** `musik_kelas.wav` (M-01): WAV PCM mono 16 bit 11.025 Hz, 38,4 detik yang berulang mulus, paling besar 1 MB, dan hanya dimuat layar kelas. Musik diputar pelan di bawah efek dan berhenti saat jeda, hitung mundur, dan jingle akhir. Layar kelas mengimpor berkasnya langsung (P-35 JS-10). Sejak JS-21, musik berbunyi di lobi dan selama ronde, berhenti saat hitung mundur, jeda, dan sejak ronde selesai (jingle, podium, dan pembahasan), lalu lanjut dari posisi terakhir. Guru mematikan musik saja lewat tombol "Musik" atau `U`, atau semua bunyi lewat tombol suara atau `M`. Penguat musik sendiri hanya dipakai untuk masuk dan keluar pelan 80 ms, bukan volume tersendiri (spesifikasi JS-21).
- **Volume:** puncak paling tinggi −3 dBFS, dan keras terdengar setiap berkas diseimbangkan dengan sasaran di tabel, sehingga bunyi yang disebut lembut atau pelan memang terdengar pelan. Pemutar cukup memakai satu pengatur volume bersama (60% di layar kelas, seperti Sehari Setara), tanpa volume per efek.
- Semua bunyi mulai dan berakhir di sampel 0, sehingga bisa diputar dan dihentikan tanpa bunyi letup, dan memakai tangga nada C mayor tanpa nada sumbang. Bunyi kurang tepat sengaja tidak memakai dengung atau nada turun bertangga yang biasa menandai "gagal", agar tidak mempermalukan pemain di kelas.
- Rincian setiap berkas (ID S-01 sampai S-08 dan M-01, lama, ukuran, dan hasil ukur) ada di `Daftar_Aset.md`, bagian "Efek suara".

## 13. Aksesibilitas

- **Target sentuh** ≥ 48 × 48 px CSS dengan jarak antartombol ≥ 8 px.
- **Kontras** teks ≥ 4,5 : 1 dan objek grafis penting ≥ 3 : 1 (bagian 4).
- **Makna tidak hanya lewat warna:** tingkat, status, benar-keliru, dan penanda selalu memakai bentuk, ikon, dan tulisan.
- **Keyboard penuh di laptop:** `WASD` atau panah untuk bergerak, `E` atau `Enter` untuk Periksa, `1` `2` `3` untuk skill di luar dialog (baris angka atau papan angka; tekanan berulang karena tombol ditahan diabaikan), `1`–`4` dan `Enter` di dialog, `M` untuk suara, `Esc` untuk menu. Di dalam dialog tidak ada pintasan Petunjuk; tombol Petunjuk dicapai dengan `Tab` lalu `Enter` atau `Spasi` (JS-09). Fokus selalu terlihat (latar `sun` dan ▶).
- **Pembaca layar:** dialog kejadian, rekap, layar kelas, dan konsol adalah HTML dengan struktur judul yang benar. Peristiwa penting (kejadian terlihat, skor berubah, waktu tinggal dua menit, jeda) diumumkan lewat wilayah `aria-live="polite"` dengan jarak minimal 2 detik antarpengumuman. Sejak JS-09 juga: kotak terambil ("Dapat satu muatan Lari cepat."), skill mulai aktif ("Lari cepat aktif selama 6 detik.") dan selesai, Petunjuk dengan kalimatnya, +1 Kompas, dan setiap pita skill. Label tombol skill memuat nama lengkap skill dan muatannya ("Kompas kejadian, 1 muatan", ditambah ", sedang aktif"), dan di laptop tombol ber-`aria-keyshortcuts`. Dunia kanvas dilengkapi daftar "Kejadian terdekat" dan bantuan gerak (JFR-13, P1).
- **Kurangi gerak** (bagian 11) dan **tanpa kedip** (bagian 6).
- **Ukuran label nama** bisa diperbesar di pengaturan pemain: Biasa 13 px dan Besar 17 px CSS (JS-14).
- **Panel dan menu (JS-14):** panel Pengaturan, Privasi, dan Tentang di layar pemain, serta panel Pemain, menu nama, dan konfirmasi di layar kelas, memakai pola dialog: judul, jebakan Tab, `Esc`, dan fokus kembali ke pembukanya. `Esc` membuka dan menutup Menu di luar dialog dan peta besar, `M` menyalakan atau mematikan suara di layar pemain dan layar kelas, dan `P` membuka panel Pemain di layar kelas. Sejak JS-21, `U` menyalakan atau mematikan musik di layar kelas. Pemeriksaan manual memakai Narator Windows.
- `<html lang="id">`.

## 14. Pembuatan aset dengan kode

Semua aset gambar digambar lewat kode (Python + Pillow) oleh Claude di proyek claude.ai, lalu disetujui pemilik proyek. **Kode adalah sumber utama**; PNG hanyalah hasil bangun dan tidak boleh disunting manual. Aturan menggambar dan daftar periksa Sehari Setara (bagian 12) berlaku penuh, ditambah aturan di bawah ini.

### Kit gambar

Kit Jejak Setara berada di `scripts/game/art/` dan memakai ulang `palette.json` serta `pixelart.py`.

| Berkas | Isi |
|---|---|
| `atas_tokoh.py` | Avatar A1–A8, tokoh Sehari Setara versi tampak atas, warga umum, tokoh aset tambahan (penjual kukang N-21); parameter arah, pose, dan bingkai |
| `atas_ubin.py` | Ubin tanah, jalan, air, dan pasir dengan kunci bahan; pemetaan bahan per masa (bagian 4) |
| `atas_objek.py` | Bangunan, pohon, pagar, properti kejadian, kotak bantuan, halte |
| `atas_tambahan.py` | Properti tambahan untuk set kejadian: O-52 prasasti dan O-53 kandang kukang. Dipisah dari `atas_objek.py` karena `atas_objek.py` termasuk sidik sumber peta (JS-06 P-23); `build_jejak.py` menggabungkannya ke daftar objek (Permintaan C-18) |
| `atas_ikon.py` | Penanda kejadian, ikon skill, ikon zona, ikon peta mini |
| `build_jejak.py` | Daftar aset Jejak Setara, ekspor PNG ke `app/jejak-setara/assets/`, pratinjau, dan pemeriksaan |

**Kit suara** (Permintaan C-14): efek suara dan musik latar dibuat dengan kode di `scripts/game/suara/`, hanya dengan pustaka bawaan Python (`wave` dan `struct`): `chip.py` (gelombang, selubung, saringan, penulis WAV, pengukur keras terdengar, dan pemeriksaan), `efek.py` (resep setiap efek), dan `musik.py` (musik latar). `build_jejak.py` memanggilnya, menulis WAV ke `app/jejak-setara/assets/sfx/`, memeriksanya, dan mencatat kreditnya, sehingga `assets:build:jejak` membangun gambar dan suara sekaligus. WAV tidak dimampatkan, jadi hasil bangun ulang sama byte di setiap komputer.

**Gambar medan peta** (Permintaan C-20): `peta_medan_1.png`, `peta_medan_2.png`, dan `peta_medan_4.png` di `app/jejak-setara/assets/peta/` tidak digambar kit di atas, tetapi dibangun `peta:build` (`scripts/jejak-setara/peta/build_peta.py`) dari sumber peta, lembar ubin siang, dan sprite objek yang sama dengan dunia. Isinya kampung masa siang dengan n piksel per ubin, dengan gerbang lobi terbuka, tanpa tokoh, penanda, kotak, titik kejadian, tulisan, dan garis pindai. Ubin (x, y) tepat menempati piksel x·n sampai (x+1)·n − 1 dan y·n sampai (y+1)·n − 1. Hanya warna palet tanpa transparansi, dan sidik `sumber` di potongan teks PNG sama dengan `kampung_gambar.json`, sehingga gambar yang tertinggal dari sumber peta membuat `peta:build --periksa` dan uji `peta-medan` gagal. `assets:build:jejak` memeriksa ukuran, warna, sidik, dan anggarannya (Architecture 11.3), lalu mencatat kredit dan kelompok `PETA` sesudah Disetujui. Pratinjaunya `preview/peta_medan.png`.

### Penamaan berkas

| Jenis | Pola | Contoh |
|---|---|---|
| Lembar ubin per masa | `ubin_{masa}.png` | `ubin_sore.png` |
| Objek (bagian bawah, lapisan 20) | `obj_{nama}.png` | `obj_puskesmas.png` |
| Bagian atas bangunan dan pohon (lapisan 40) | `obj_{nama}_atas.png` | `obj_puskesmas_atas.png` |
| Avatar | `ava_{n}_{arah}_{pose}.png` | `ava_3_bawah_jalan.png` |
| Tokoh bukan pemain | `npc_{tokoh}_{arah}_{pose}.png` | `npc_bayu_bawah_diam.png` |
| Ikon | `ikon_{nama}.png` | `ikon_kompas.png` |
| Ikon kepala avatar | `ikon_ava_{n}.png` | `ikon_ava_3.png` |
| Penanda dan efek | `tanda_{nama}.png` | `tanda_kejadian.png`, `tanda_debu.png`, `tanda_kilau.png` |
| Suara | `sfx_{peristiwa}.wav` | `sfx_kotak.wav` |
| Musik latar (C-16) | `musik_{nama}.wav` | `musik_kelas.wav` |
| Gambar medan peta (C-20), di folder `peta/` | `peta_medan_{n}.png`, n piksel per ubin | `peta_medan_4.png` |

- Arah tokoh dan avatar hanya `bawah`, `atas`, dan `kanan`. Arah kiri tidak punya berkas, karena antarmuka mencerminkan arah kanan.
- Berkas `tanda_*.png` disimpan di folder `ikon/`, tetapi tetap kelompok `tanda` di manifest.

### Pratinjau untuk persetujuan

Disimpan di `docs/jejak-setara/preview/`:

- Peta penuh ×1 untuk setiap masa, dan potongan setiap zona ×4 dengan garis pindai.
- Lembar avatar dan tokoh ×6 (semua arah dan pose).
- Tiruan layar HP 731 × 411 dan laptop 960 × 540 dengan HUD, untuk memeriksa keterbacaan.
- Efek suara dan musik latar: berkas WAV yang dilampirkan di balasan, karena dinilai dengan telinga; tidak disimpan di `preview/`.

### Daftar periksa tambahan setiap aset

- [ ] `build_jejak.py` lulus: hanya warna palet, tanpa piksel semi-transparan, ukuran sesuai tabel, total dalam anggaran (Architecture bagian 11).
- [ ] Terbaca pada skala HP: avatar bisa dibedakan satu sama lain dari warna tas dan siluetnya.
- [ ] Ubin bersambung tanpa jahitan terlihat, di ketiga masa.
- [ ] Bentuk padat dan bentuk datar sesuai dengan peta tabrakan.
- [ ] Bangunan penanda setiap zona mudah dibedakan.
- [ ] Tanpa lambang palang merah atau bulan sabit merah, tanpa tulisan, logo, atau merek.
- [ ] Tidak mirip tokoh, maskot, atau peta dari game yang sudah ada.

Status setiap aset dicatat di `docs/jejak-setara/Daftar_Aset.md` dengan format yang sama seperti `Daftar_Aset.md` Sehari Setara.

## 15. Kredit dan atribusi

Cantumkan di layar "Tentang" Jejak Setara dan di halaman masuk konsol:

- Aset visual digambar dengan kode oleh Claude (Anthropic) berdasarkan arahan dan persetujuan YAN.
- Huruf VT323, SIL Open Font License 1.1. (Sejak JS-16b; Sehari Setara tetap memakai Press Start 2P dan Pixelify Sans.)
- Efek suara dibuat dengan kode oleh Claude (Anthropic) berdasarkan arahan dan persetujuan YAN (Permintaan C-14). Asal dan lisensi setiap berkas dicatat di `app/jejak-setara/assets/CREDITS.md` dengan format "Dibuat dengan kode oleh Claude, disetujui [nama], [tanggal]". Bunyi klik dan bunyi teks mengikuti catatan Sehari Setara (butir S-6 spesifikasi F-07).
