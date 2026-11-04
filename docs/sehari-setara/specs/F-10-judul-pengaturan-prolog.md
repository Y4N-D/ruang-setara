# F-10 — Layar judul, pengaturan, prolog

| | |
|---|---|
| Status | Ditulis 4 November 2026, menunggu Gerbang 2 (balasan `Spesifikasi disetujui: F-10`) |
| Tanggal | 4 November 2026 |
| Rencana | `docs/sehari-setara/PLAN.md`, entri F-10 (disetujui 4 November 2026 dengan balasan `Setuju: F-10`; saran setiap usulan diterima, alternatifnya tidak dipilih) |
| Dasar | ZIP `main` 4 November 2026, commit `d9212ad`, yang sudah memuat entri rencana F-10 |

## Ringkasan

F-10 menjadikan halaman `sehari-setara/` permainan utuh yang dimulai dari layar judul. Layar ini menggantikan layar kerangka F-01 dan pintu sementara `#main`:

1. **Layar judul (FR-01).** Latar `bg_title` memenuhi layar 16:9 dan Nara berjalan di jalan kampung. Judul "Sehari Setara" dan kalimat pengantar tampil di bidang langit yang disisakan gambar, lalu tombol "Mulai", "Cara bermain", dan "Kembali ke galeri".
2. **Cara bermain.** Dialog satu layar penuh berisi enam langkah bermain dan daftar tombol keyboard untuk guru. Teks yang sama menjadi dasar panduan guru satu halaman, yang dibuat sesudah F-10.
3. **Pengaturan kelas (FR-02).** Guru memilih jumlah tim 2–4; tim diambil berurutan dari daftar bawaan dan jadwal gilirannya ditampilkan. Guru juga memilih durasi diskusi 30, 60, atau 90 detik dan suara nyala atau mati. Kakinya berisi tombol "Kembali" ke layar judul dan "Mulai permainan".
4. **Prolog (FR-03).** Tiga layar di tata letak permainan memperkenalkan Nara, kedua indikator, giliran, dan bintang alasan, lalu sapuan membawa kelas ke adegan 1.
5. **Dialog pengaturan.** Dibuka dengan `Esc` atau tombol "Pengaturan" di bilah atas selama prolog, narasi, diskusi, dan fase bintang. Isinya suara, kurangi gerak, teks muncul per huruf, dan durasi diskusi. Selama dialog terbuka, pengatur waktu diskusi dan teks per huruf berhenti.
6. **Kurangi gerak di dalam game (FR-17 sebagian).** Pengaturan game hanya menambah permintaan komputer, tidak pernah membatalkannya.
7. **Yang diganti.** Layar kerangka, `#main`, `#main-3`, dan `#main-4` dihapus. Pratinjau panggung `#adegan-N` tetap ada sebagai alat tinjau tak bertaut, dan "Main lagi" berhenti di layar judul.
8. **Mesin.** Ada satu aksi baru, `BATAL_PENGATURAN`, untuk tombol "Kembali" di pengaturan kelas. Selebihnya `engine/` tidak berubah.

F-10 tidak menambah aset, dependensi, atau data yang disimpan.

Asal setiap nilai ditandai:

| Tanda | Arti |
|---|---|
| **[Dokumen]** | Dari PRD, Design System, atau Architecture; bagiannya disebut |
| **[Pemilik]** | Keputusan pemilik proyek: usulan 1–11 entri F-10 `PLAN.md` (4 November 2026) |
| **[Ukur]** | Diukur dengan huruf asli di Chromium 153.0.8010.12 pada empat ukuran layar, memakai maket yang berisi nilai CSS spesifikasi ini. Maket disuntikkan ke hasil build `main` commit `d9212ad` di `/ruang-setara/sehari-setara/`, di luar repositori, 4 November 2026 |
| **[Rencana]** | Angka dari percobaan Plan (1 November 2026) yang masih berlaku, karena teks dan tata letaknya tidak berubah |
| **[DRAF]** | Rincian baru dari agen di tahap ini. Mohon ditinjau |

Maket dikirim lewat percakapan dan tidak disimpan di repositori. Tangkapan layar hasil sebenarnya disimpan di `tests/F-10/` pada tahap Test.

## Yang perlu ditinjau di Gerbang 2

Usulan Gerbang 1 sudah diputuskan. Daftar ini hanya memuat rincian baru dari tahap Specify. Spesifikasi ditulis dengan saran di kolom ketiga; sebutkan nomornya bila memilih alternatif.

| No. | Hal | Saran (dipakai spesifikasi ini) | Alternatif |
|---|---|---|---|
| J-1 | Klik ganda pada "Tutup" dialog pengaturan | Lapisan bening tetap terpasang 600 ms sesudah dialog ditutup, sehingga klik kedua tidak jatuh di tombol permainan. Di 1280×720, "Tutup" (125,9–149,5u × 70,5–78,6u) menumpuk di atas tombol pilihan C saat diskusi, dan di atas kotak narasi saat narasi dan prolog [Ukur] | Hanya klik kedua dari klik ganda (`event.detail > 1`) yang dibatalkan; atau tanpa pengaman |
| J-2 | Klik di luar dialog pengaturan | Tidak berpengaruh: lapisan bening menahan klik, dialog tetap terbuka, dan fokus tetap di dalam dialog | Klik di luar menutup dialog |
| J-3 | Pilihan pengaturan kelas sesudah "Kembali" | Jumlah tim dan durasi yang belum disimpan tetap terlihat saat pengaturan kelas dibuka lagi. Mesin tidak berubah. Pilihan kembali ke nilai mesin pada permainan baru, yaitu saat halaman dimuat dan sesudah "Main lagi" | Setiap kali dibuka, pengaturan kelas menampilkan nilai mesin |
| J-4 | Fokus sesudah dialog pengaturan ditutup | Fokus kembali ke pemicunya: tombol "Pengaturan", atau unsur yang berfokus saat `Esc` ditekan. Bila saat itu tidak ada unsur yang berfokus, fokus pindah ke tombol "Pengaturan" | Fokus kembali ke halaman (`body`) |
| J-5 | Letak tombol "Pengaturan" | Tetap 22u dari tepi kanan layar, sehingga tidak bergeser saat tulisan kanan berganti. Celah terkecilnya ke tulisan kanan 2,2u ("Adegan 6/6") [Ukur] | Menempel 2u di kiri tulisan kanan, sehingga bergeser antara "Prolog", "Adegan n/6", dan "Akhir hari" |
| J-6 | Pilihan yang sedang aktif ditekan lagi | Tidak ada yang berubah: tanpa bunyi klik dan tanpa pengumuman | Bunyi klik tetap diputar |
| J-7 | Pengumuman di layar pembuka dan dialog | Hanya perubahan jumlah tim yang ditulis ke wilayah `role="status"`. Perubahan suara, durasi, dan pilihan dialog terbaca dari `aria-pressed` tombol yang berfokus. Wilayah itu dikosongkan saat "Mulai permainan" diterima | Setiap perubahan pilihan diumumkan |
| J-8 | Latar layar judul bagi pembaca layar | Hiasan yang disembunyikan, karena judul dan kalimat pengantar sudah menjelaskan layar | Diberi teks alternatif |
| J-9 | Teks alternatif panggung prolog (draf baru) | Satu teks per layar, sesuai pose Nara (bagian "Teks yang tampil") | Satu teks yang sama untuk ketiga layar |
| J-10 | Tanda pagar selain `#adegan-N` saat bermain | Tidak berpengaruh, dan permainan berjalan terus. `#adegan-N` membuka pratinjau dan mengakhiri permainan, seperti meninggalkan `#main` sekarang | Setiap perubahan tanda pagar memulai permainan baru dari layar judul |
| J-11 | Tombol yang ditahan di layar pembuka | Pengulangan `Enter` dan `Spasi` dibatalkan di fase `title`, `setup`, dan `prolog` serta di dalam dialog pengaturan. Sesudah dialog ditutup, pembatalan berlaku sampai tombol dilepas, seperti layar penutup F-09 | Hanya masa tunggu 600 ms |

Semua teks baru di bagian "Teks yang tampil" berstatus draf baru sampai Gerbang 2. Teks langkah bermain, tombol keyboard, dan prolog sama persis dengan rencana.

## Kaitan PRD

| Acuan | Yang dipenuhi F-10 |
|---|---|
| FR-01 | Layar judul dengan tombol "Mulai" dan "Cara bermain" |
| FR-02 | Pengaturan kelas: jumlah tim 2–4 dengan nama, warna, dan bentuk dari daftar bawaan, durasi 30/60/90 detik, serta suara nyala atau mati, tanpa kolom isian |
| FR-03 | Prolog tiga layar yang memperkenalkan Nara dan dua indikator |
| FR-15 (sebagian) | "Kembali ke galeri" (`href="../"`) di layar judul, dan "Main lagi" kembali ke awal. Tautan dari galeri tetap milik F-11 |
| FR-16 (sebagian) | `Esc` membuka pengaturan; `Spasi`, `Enter`, dan `M` di prolog |
| FR-17 (sebagian) | Pengaturan "kurangi gerak" di dalam game. Tombol layar penuh tetap milik F-13 |
| PRD bagian 6 | Alur "Layar judul → Pengaturan kelas → Prolog → Adegan 1–6" dan "Main lagi" ke awal |
| PRD bagian 10 | Empat ukuran layar, keyboard, kurangi gerak, kontras ≥ 4,5:1, makna tidak hanya lewat warna, nama tim dari daftar, tanpa data siswa |
| PRD bagian 12 | Teks cara bermain menjadi dasar panduan guru satu halaman, yang dibuat sesudah F-10 |
| Design System bagian 2, 3, 5, 7, 8, 9 | Terbaca dari bangku belakang; layar 16:9; ukuran huruf; komponen "Pengaturan"; gerak dan masa tunggu; suara |
| Architecture bagian 3, 6, 9, 10, 13 | `Title.tsx`, `Setup.tsx`, dan `Settings.tsx`; fase `title`, `setup`, dan `prolog`, `MAIN_LAGI` ke `title`, dan `UBAH_PENGATURAN`; `Esc`; dialog dengan fokus terkunci; status hanya di memori |
| Keputusan Gerbang 1 | Usulan 1–11 entri F-10 `PLAN.md` |

## Perilaku

### Urutan layar

| Fase | Layar | Yang tampil | Fokus saat tampil |
|---|---|---|---|
| `title` | Layar judul | Latar `bg_title`, Nara berjalan, judul, kalimat pengantar, dan tiga tombol | "Mulai" |
| `title` | Dialog "Cara bermain" di atas layar judul | Langkah bermain, tombol keyboard, dan "Tutup" | Judul dialog |
| `setup` | Pengaturan kelas | Kepala pagi, tiga baris pilihan, daftar tim, "Kembali", dan "Mulai permainan" | Judul "Pengaturan kelas" |
| `prolog` | Prolog layar 1–3 | Tata letak permainan pukul 06.15 dengan tulisan "Prolog" | Tombol lanjut kotak narasi |
| `intro` | Narasi adegan 1 | Seperti sekarang | Tombol lanjut kotak narasi (F-05) |

- Diberikan halaman `sehari-setara/` dibuka tanpa tanda pagar, maka fase `title` tampil dengan keadaan awal mesin: belum ada tim, dan `settings` bawaan F-02 (suara nyala, kurangi gerak mati, teks per huruf nyala, 60 detik).
- Diberikan layar judul sudah tampil 600 ms, ketika "Mulai" diaktifkan, maka `MULAI` dikirim, fase menjadi `setup`, dan pengaturan kelas tampil.
- Diberikan pengaturan kelas sudah tampil 600 ms, ketika "Mulai permainan" diaktifkan, maka `SIMPAN_PENGATURAN` dikirim dengan tim dan durasi pilihan, fase menjadi `prolog`, dan prolog layar 1 tampil.
- Diberikan pengaturan kelas sudah tampil 600 ms, ketika "Kembali" diaktifkan, maka `BATAL_PENGATURAN` dikirim, fase menjadi `title`, dan layar judul tampil lagi dengan fokus di "Mulai".
- Diberikan prolog layar 3 dengan teks lengkap dan masa tunggu yang sudah lewat, ketika "Mulai adegan 1" diaktifkan, maka sapuan ke langit pagi diputar (pudar bila kurangi gerak), `LANJUT` dikirim di tengah pergantian, dan narasi adegan 1 tampil.
- Diberikan layar refleksi sudah tampil 600 ms, ketika "Main lagi" diaktifkan, maka `MAIN_LAGI` dikirim dan layar judul tampil dengan fokus di "Mulai" (bagian "Main lagi").
- Layar judul dan pengaturan kelas menutupi seluruh layar 16:9. Bilah atas, indikator, panggung permainan, panel bawah, dan panel kanan tidak dipasang di kedua layar itu, seperti rekap dan refleksi (F-09). Prolog memakai tata letak permainan.
- Semua layar berada di dalam `<main>` layar permainan yang sama. Wilayah `aria-live="polite"` dan `role="status"` dipasang sekali dan tetap elemen yang sama sejak layar judul sampai refleksi, juga sesudah "Main lagi".

### Alamat halaman

[Pemilik, usulan 7]

| Tanda pagar | Yang tampil |
|---|---|
| Tanpa tanda pagar, `#`, `#main`, `#main-3`, `#main-4`, dan alamat lain yang tidak dikenal (misalnya `#lain` dan `#Main`) | Permainan, mulai dari layar judul |
| `#adegan-N` dan `#adegan-N-a`, `-b`, atau `-c` (N = 1–6) | Pratinjau panggung F-04, tidak berubah |

- `#main`, `#main-3`, dan `#main-4` tidak punya arti lagi; ketiganya membuka layar judul seperti alamat tanpa tanda pagar.
- Selama bermain, tanda pagar yang berubah ke alamat lain yang bukan pratinjau tidak berpengaruh, dan permainan berjalan terus [DRAF J-10]. Berpindah ke `#adegan-N` membuka pratinjau dan mengakhiri permainan, karena tidak ada yang disimpan. Kembali dari pratinjau lewat "Tutup pratinjau" (`href="#"`) membuka layar judul dengan fokus di "Mulai".
- Memuat ulang halaman selalu membuka layar judul dengan pengaturan bawaan (usulan 8a).

### Layar judul

**Isi** [Pemilik, usulan 1]

- Latar `bg_title` (C-01) memenuhi seluruh layar 16:9 dengan skala kj = tinggi layar ÷ 180. Nilainya 4, 4,267, 6, dan 3,2 di 1280×720, 1366×768, 1920×1080, dan 1024×768 (layar 16:9 selebar 1024 di layar 4:3). Skala boleh pecahan, dengan `image-rendering: pixelated`. Garis pindai dan vinyet sama dengan panggung F-04. Di layar 4:3, sisa ruang tetap menjadi bingkai `ink` di atas dan bawah, seperti sekarang.
- Nara berjalan (`sprites.nara.walk`, 4 bingkai, 8 fps) di x 96 piksel logis, menghadap kanan, dan berdiri di garis lantai dengan bayangan kaki `wood`, sama dengan pratinjau `judul` yang disetujui. Dengan kurangi gerak, Nara diam di bingkai pertama.
- Bidang judul adalah `TITLE_ZONE` (x 64–256 dan y 6–56 piksel logis, sama dengan `latar.py`), yang selalu berukuran 106,7u × 27,8u. Isinya rata tengah di tengah bidang:
  - judul "Sehari Setara": Press Start 2P 7u, satu baris, `ink`;
  - kalimat pengantar: Pixelify Sans 3,1u, `ink`.

  Ukuran 7u adalah gaya baru "Judul permainan" di Design System bagian 5, hanya untuk layar ini.
- Tombol "Mulai", "Cara bermain", dan "Kembali ke galeri" berada dalam satu baris rata tengah di pita jalan kampung (y 157–180 piksel logis), di bawah kaki Nara. Gayanya `ss-button` F-01 (Pixelify Sans 3,1u).
- Latar dan Nara adalah hiasan dan disembunyikan dari pembaca layar [DRAF J-8].

**Tombol**

- "Mulai" mengirim `MULAI` dan memutar bunyi klik.
- "Cara bermain" membuka dialog "Cara bermain" dan memutar bunyi klik. Fase tetap `title`.
- "Kembali ke galeri" adalah tautan `<a href="../">` (Architecture bagian 11). Tautan ini tidak berbunyi karena halaman berpindah (F-07), sama dengan di refleksi (F-09).
- Ketiganya baru bekerja 600 ms sesudah layar judul tampil (bagian "Masa tunggu dan klik ganda").
- `Spasi` dan `Enter` bukan pintasan di layar ini; keduanya hanya bekerja sebagai klik pada tombol yang berfokus. Tautan "Kembali ke galeri" yang berfokus hanya diaktifkan `Enter`, seperti tautan biasa (F-09).

### Cara bermain

[Pemilik, usulan 2]

- Dialog ini menutupi seluruh layar 16:9 di atas layar judul dan dibuka dengan tombol "Cara bermain". Dialog memakai `role="dialog"` dan `aria-modal="true"`, dan bernama "Cara bermain" lewat judulnya.
- Kepala setinggi 8u berwarna pagi (`#FFD9A8`, teks `ink`) berisi judul "Cara bermain". Isinya dua kolom sama lebar:
  - kiri, "Langkah bermain": enam langkah bernomor, dengan kotak nomor seperti kotak A/B/C F-05;
  - kanan, "Tombol keyboard untuk guru": sembilan baris, masing-masing berisi tombol dalam kotak berbingkai lalu keterangannya.

  Kaki kanan berisi tombol "Tutup".
- Saat dialog dibuka, fokus pindah ke judulnya. Fokus terkunci di dalam dialog: `Tab` dan `Shift+Tab` hanya beredar antara judul dan "Tutup". Dialog sendiri bisa difokus lewat kode, sehingga klik di ruang kosong tidak membuang fokus (pola kuis F-08).
- "Tutup" (klik, atau `Enter` dan `Spasi` pada tombol) dan `Esc` menutup dialog dengan satu bunyi klik, lalu fokus kembali ke tombol "Cara bermain". Masa tunggu layar judul dihitung lagi sejak dialog ditutup. "Tutup" sendiri tidak punya masa tunggu.
- Selama dialog terbuka, pintasan permainan tidak berlaku dan tidak berbunyi. Isi dialog tidak bergantung pada fase atau pengaturan.
- Teks dialog ini menjadi dasar panduan guru satu halaman (PRD bagian 12). Panduan itu dibuat sesudah F-10 sebagai dokumen tersendiri, sebelum uji coba M3 (usulan 2a), dan berada di luar cakupan F-10.

### Pengaturan kelas

**Isi** [Pemilik, usulan 3]

- Kepala setinggi 8u berwarna pagi berisi judul "Pengaturan kelas". Isinya tiga baris, dengan label di kiri dan pilihan di kanan:
  1. "Jumlah tim": "2 tim", "3 tim", "4 tim". Di bawahnya tampil daftar tim yang bermain dalam dua kolom, berisi ikon bentuk D-07, nama, dan jadwal giliran, misalnya "Adegan 1, 4".
  2. "Durasi diskusi": "30 detik", "60 detik", "90 detik".
  3. "Suara": "Nyala", "Mati", dengan keterangan "Bunyi klik dan bunyi teks.".
- Kaki berisi "Kembali" di kiri dan "Mulai permainan" di kanan.
- Setiap baris adalah grup (`role="group"`) yang dinamai labelnya. Setiap pilihan adalah tombol dengan `aria-pressed`, dan tepat satu tombol per grup bernilai `"true"`. Pilihan yang aktif berlatar `sun` dengan cincin dalam `ink` 2p, seperti "Jeda" yang ditekan (F-07). Fokus tetap `sun` dengan kursor ▶ (`ss-button`).
- Tidak ada kolom isian. Nama, warna, dan bentuk tim hanya berasal dari `DEFAULT_TEAMS` di `content/teams.ts` (AGENTS bagian 7 aturan 3).

**Tim dan jadwal giliran** [Pemilik, usulan 3]

- Tim diambil berurutan dari `DEFAULT_TEAMS`: 2 tim berarti Tim Mangga dan Tim Laut, 3 tim ditambah Tim Daun, dan 4 tim ditambah Tim Mentari. Guru tidak memilih tim tertentu.
- Jadwal giliran setiap tim adalah nomor adegan n (1–6) yang `activeTeamIndex(n − 1, jumlah tim)`-nya sama dengan urutan tim itu. Jadi jadwal selalu sama dengan giliran yang dipakai permainan:

  | Jumlah tim | Tim Mangga | Tim Laut | Tim Daun | Tim Mentari |
  |---|---|---|---|---|
  | 2 | Adegan 1, 3, 5 | Adegan 2, 4, 6 | — | — |
  | 3 | Adegan 1, 4 | Adegan 2, 5 | Adegan 3, 6 | — |
  | 4 | Adegan 1, 5 | Adegan 2, 6 | Adegan 3 | Adegan 4 |

**Nilai yang tampil saat layar dibuka** [DRAF J-3]

- Jumlah tim dan durasi adalah pilihan sementara (keadaan tampilan di `PlayScreen`) sampai "Mulai permainan" ditekan. Nilai awalnya diambil dari mesin setiap kali permainan baru dimulai, yaitu saat halaman dimuat dan sesudah "Main lagi":
  - jumlah tim sama dengan banyak tim di `state.teams` bila 2–4, selain itu 3 (bawaan, usulan 3);
  - durasi sama dengan `settings.discussSeconds`.
- Jadi saat halaman pertama dibuka, pilihannya 3 tim dan 60 detik. Sesudah "Main lagi", pilihannya sama dengan permainan sebelumnya, termasuk durasi yang diubah lewat dialog pengaturan.
- "Kembali" tidak membuang pilihan sementara. Bila pengaturan kelas dibuka lagi dari layar judul, pilihan terakhir tetap terlihat, dan mesin tidak berubah karena "Kembali".
- Suara bukan pilihan sementara: tombolnya selalu menampilkan `settings.sound`.

**Menekan pilihan**

- Diberikan pengaturan kelas sudah tampil 600 ms, ketika guru menekan pilihan jumlah tim atau durasi yang belum aktif, maka pilihan itu menjadi aktif dan bunyi klik diputar. Untuk jumlah tim, daftar tim ikut berubah, dan pengumuman jumlah tim ditulis ke wilayah `role="status"` [DRAF J-7].
- Ketika guru menekan "Mati" saat suara nyala, maka `UBAH_PENGATURAN` dengan `sound: false` langsung dikirim tanpa bunyi.
- Ketika guru menekan "Nyala" saat suara mati, maka `UBAH_PENGATURAN` dengan `sound: true` dikirim, pemutar bunyi dibuka (`unlock`), dan satu bunyi klik diputar sebagai tanda, sama dengan `M` (F-07). Klik "Mulai permainan" sesudahnya sudah mengikuti pilihan itu.
- Menekan pilihan yang sudah aktif tidak mengubah apa pun, sehingga tidak ada bunyi dan pengumuman [DRAF J-6].

**"Mulai permainan" dan "Kembali"**

- "Mulai permainan" mengirim `SIMPAN_PENGATURAN` dengan `teams` berupa tim sebanyak jumlah pilihan dan `settings` berupa `{ discussSeconds }`. Tombol ini memutar bunyi klik (bila suara nyala) dan mengosongkan wilayah `role="status"` [DRAF J-7]. Reducer F-02 menyimpan tim dengan 0 bintang dan durasi itu, lalu membuka fase `prolog`.
- "Kembali" mengirim `BATAL_PENGATURAN` dan memutar bunyi klik. Reducer kembali ke fase `title` tanpa mengubah tim dan pengaturan (bagian "Data dan aksi").
- Durasi baru dipakai saat diskusi adegan 1 dimulai, karena `NARASI_SELESAI` membuat pengatur waktu dari `settings.discussSeconds`. Jadi pengatur waktu adegan 1 mulai dari 0:30, 1:00, atau 1:30. Pengatur waktu tidak tampil sebelum diskusi.
- `Esc` tidak berpengaruh di layar ini, dan pintasan permainan tidak berlaku.

### Prolog

**Isi** [Pemilik, usulan 4]

Prolog memakai tata letak permainan F-05 sampai F-07, sehingga sekaligus memperkenalkan letak layar sebelum adegan 1:

- bilah atas pagi seperti adegan 1 (pukul 06.15, matahari di titik pertama). Tulisan kanan "Prolog" menggantikan "Adegan 1/6", dan label pembaca layarnya "Pukul 06.15, prolog" (pola "Pukul 20.00, akhir hari" F-09);
- panggung berlatar `bg_title` dengan Nara di x 160 menghadap kanan: bicara (`talk`) di layar 1, diam (`idle`) di layar 2, dan senang (`happy`) di layar 3. `Stage.tsx` tidak berubah, karena prolog memberinya adegan semu berlatar `bg_title` (bagian "Data dan aksi");
- panel indikator F-06 dengan nilai 50 dan 50, tanpa angka melayang;
- papan tim F-07 dengan 0 bintang. Tim pertama bertanda ▶, bingkai, dan "Giliran", karena tim itu bergiliran di adegan 1. Pengatur waktu dan bintang alasan tidak tampil;
- kotak narasi F-05 dengan tab "Prolog", teks per huruf, serta `Spasi` dan `Enter` seperti narasi. Tombolnya "Lanjut", atau "Mulai adegan 1" di layar 3.

Teks ketiga layar ada di `content/prolog.ts` (bagian "Teks yang tampil"). Setiap layar paling banyak tiga kalimat (AGENTS bagian 8), dan uji unit memeriksanya dengan `countSentences` yang sama dengan pemeriksa naskah. Label panggung (`role="img"`) setiap layar adalah teks alternatif prolog [DRAF J-9].

**Layar dan tombol**

- Nomor layar prolog yang tampil (1–3) adalah keadaan tampilan di `PlayScreen`, bukan keadaan mesin. Nilainya 1 saat fase `prolog` dimulai.
- Diberikan layar prolog p sudah tampil 600 ms, ketika tombol lanjut diaktifkan, maka hasilnya sama dengan narasi F-05: teks yang masih muncul ditampilkan sekaligus, atau, bila teks sudah lengkap, layar p + 1 tampil. Tombol bisa diaktifkan dengan klik, `Enter` atau `Spasi` pada tombol, klik di kotak narasi, atau `Spasi`/`Enter` sebagai pintasan. Setiap tekanan yang diterima memutar satu bunyi klik.
- Di layar 3 dengan teks lengkap, "Mulai adegan 1" memulai pergantian ke adegan 1. Pergantiannya berupa sapuan blok piksel 400 ms berwarna langit pagi dengan `LANJUT` pada 200 ms, atau pudar 75 + 75 ms bila kurangi gerak (F-05). Fase menjadi `intro` adegan 1, dan narasi adegan 1 tampil dengan fokus di tombol lanjutnya. Selama pergantian, panel bawah kosong dan tekanan lain diabaikan, seperti pergantian adegan.
- Sebelum 600 ms sejak layar prolog itu tampil, semua tekanan pada tombol lanjut dan kotak narasi, termasuk pintasan, diabaikan tanpa bunyi (bagian "Masa tunggu dan klik ganda").
- Tidak ada jalan mundur dari prolog ke pengaturan kelas.
- `M` mematikan atau menyalakan suara (F-07). `Esc` dan tombol "Pengaturan" membuka dialog pengaturan.
- Bunyi teks per huruf sama dengan narasi (F-07).

### Dialog pengaturan

**Pemicu dan fase** [Pemilik, usulan 5]

- Dialog dibuka dengan `Esc` atau tombol "Pengaturan" di bilah atas. Tombol itu terletak di kiri tulisan "Prolog", "Adegan n/6", atau "Akhir hari" (Pixelify Sans 2,5u). Di DOM, tombol berada di luar elemen bilah atas yang ber-`role="img"` dan sesudah panel kanan, sehingga urutan Tab F-05 dan F-07 tidak berubah.
- Dialog bisa dibuka di fase `prolog`, `intro`, `discuss`, dan `stars`, selama tidak ada pergantian adegan (sapuan atau pudar).
- Selama reaksi tokoh, kartu dampak, kuis peran, pergantian adegan, dan di layar akhir, `Esc` tidak berpengaruh. Tombol "Pengaturan" tampil nonaktif (latar `mist`, teks `dusk`, `aria-disabled="true"`), dan tekanan padanya tidak berpengaruh dan tidak berbunyi.
- Rekap, refleksi, layar judul, dan pengaturan kelas tidak punya bilah atas, jadi tombol "Pengaturan" tidak ada di sana, dan `Esc` tidak berpengaruh.
- Membuka dialog memutar satu bunyi klik.

**Isi**

- Dialog berupa kotak berbingkai piksel F-05 di tengah layar 16:9, tanpa lapisan gelap di belakangnya, seperti kartu dampak dan kuis. Dialog memakai `role="dialog"` dan `aria-modal="true"`, dan bernama "Pengaturan" lewat judulnya.
- Isinya judul "Pengaturan", lalu empat baris dengan label di kiri dan tombol pilihan di kanan, lalu "Tutup" di kanan bawah:

  | Baris | Pilihan | Catatan di bawah pilihan |
  |---|---|---|
  | Suara | Nyala, Mati | — |
  | Kurangi gerak | Nyala, Mati | "Menyala karena komputer meminta gerak dikurangi.", bila pengaturan komputer meminta gerak dikurangi |
  | Teks muncul per huruf | Nyala, Mati | "Teks langsung lengkap selama kurangi gerak menyala.", bila kurangi gerak menyala dari komputer atau dari game |
  | Durasi diskusi | 30 detik, 60 detik, 90 detik | "Berlaku mulai diskusi berikutnya." (selalu) |

- Jumlah, nama, dan urutan tim tidak tampil dan tidak bisa diubah, karena giliran dan `history` bergantung padanya.
- Pilihan memakai tombol dan `aria-pressed` yang sama dengan pengaturan kelas. Catatan dikaitkan ke grup barisnya dengan `aria-describedby`.
- Bila pengaturan komputer meminta gerak dikurangi, baris "Kurangi gerak" menampilkan "Nyala" sebagai pilihan aktif, dan kedua tombolnya nonaktif: latar `mist`, teks `dusk`, cincin dalam `ink` pada "Nyala", dan `aria-disabled="true"`. Tekanan padanya tidak berpengaruh dan tidak berbunyi, karena pengaturan game hanya boleh menambah permintaan komputer (usulan 6a1; Design System bagian 8).
- Tombol "Teks muncul per huruf" tetap bisa diubah walaupun kurangi gerak menyala. Nilainya berlaku lagi bila kurangi gerak dimatikan.

**Perubahan langsung berlaku, tanpa tombol "Simpan"**

Setiap pilihan yang berubah langsung mengirim `UBAH_PENGATURAN` dan memutar bunyi klik (kecuali bila suara dimatikan):

| Pilihan | Kapan berlaku |
|---|---|
| Suara | Langsung, sama dengan `M`: "Mati" tanpa bunyi; "Nyala" membuka pemutar dan memutar satu klik sebagai tanda |
| Kurangi gerak | Langsung: animasi tokoh, denyut busur hari, pop bintang, dan angka melayang berhenti; pergantian adegan berikutnya memakai pudar; timbangan layar akhir tanpa gerak |
| Teks muncul per huruf | Mulai layar narasi atau prolog berikutnya. Layar yang sedang tampil tetap seperti saat dibuka |
| Durasi diskusi | Mulai diskusi berikutnya. Diskusi yang sedang berjalan tidak berubah, dan guru tetap punya "+30" dan "Lewati" |

- Bila dialog dibuka saat narasi atau prolog, "diskusi berikutnya" adalah diskusi adegan yang sedang berjalan, karena pengatur waktu baru dibuat saat diskusi dimulai.
- Menekan pilihan yang sudah aktif tidak mengubah apa pun, sehingga tidak berbunyi [DRAF J-6].
- Perubahan tidak ditulis ke wilayah pengumuman; tombol yang berfokus membacakan `aria-pressed`-nya [DRAF J-7].

**Pengatur waktu dan teks per huruf selama dialog terbuka** [Pemilik, usulan 5a]

- Pengatur waktu diskusi berhenti tanpa mengubah keadaan mesin. `useTimer` tidak aktif selama dialog terbuka, sehingga tidak ada `TICK`, tombol "Jeda" tidak berubah, dan tidak ada pengumuman "Waktu dijeda". Sesudah dialog ditutup, hitungan berlanjut dari detik yang sama, dan sisa pecahan detik dibuang, seperti jeda F-07.
- Teks per huruf di kotak narasi dan prolog berhenti di huruf yang sama, dan bunyi teks tidak terdengar. Sesudah dialog ditutup, teks berlanjut dari huruf itu.
- Saat dialog bisa dibuka, tidak ada pengatur waktu lain yang sedang berjalan (reaksi, sapuan, masa tunggu kartu dan kuis, serta layar penutup), kecuali masa tunggu prolog, yang tetap dihitung dari waktu sebenarnya.

**Menutup dan fokus** [Pemilik, usulan 5; DRAF J-4]

- Saat dialog dibuka, fokus pindah ke judulnya. `Tab` dan `Shift+Tab` beredar di kesepuluh tombol dialog: dua tombol suara, dua kurangi gerak, dua teks per huruf, tiga durasi, dan "Tutup". Tombol nonaktif tetap bisa difokus, dan dialog sendiri bisa difokus lewat kode.
- "Tutup" dan `Esc` menutup dialog dengan satu bunyi klik. Fokus kembali ke pemicunya: tombol "Pengaturan" bila dialog dibuka dengan tombol itu, atau unsur yang berfokus saat `Esc` ditekan, misalnya tombol lanjut kotak narasi, tombol pilihan, atau ajakan bintang. Bila tidak ada unsur yang berfokus saat `Esc` ditekan (fokus di `body`), fokus pindah ke tombol "Pengaturan".
- Selama dialog terbuka, pintasan permainan tidak berlaku dan tidak berbunyi, termasuk `M`, angka, huruf, `P` `T` `S`, serta `Spasi` dan `Enter` sebagai pintasan.

**Lapisan bening** [DRAF J-1 dan J-2]

- Selama dialog terbuka, lapisan bening tanpa warna menutupi seluruh layar 16:9 di bawah dialog. Klik atau sentuhan pada lapisan itu tidak berpengaruh, tidak menutup dialog, dan tidak berbunyi. Jadi pilihan, tombol pengatur waktu, dan kotak narasi di belakang dialog tidak bisa tertekan.
- Lapisan tetap terpasang 600 ms sesudah dialog ditutup, dengan cara apa pun dialog ditutup. Klik kedua dari klik ganda pada "Tutup" jatuh di lapisan itu, bukan di pilihan C atau kotak narasi di bawah "Tutup" (bagian "Tata letak"). Keyboard tidak terpengaruh lapisan.

### Kurangi gerak

[Pemilik, usulan 6a1]

- Kurangi gerak berlaku bila `prefers-reduced-motion` komputer atau `settings.reducedMotion` menyala. Keduanya sudah digabung di `PlayScreen` sejak F-05. Dengan salah satunya:
  - sapuan menjadi pudar, tanpa angka melayang dan tanpa pop bintang;
  - sprite tetap di bingkai pertama, termasuk Nara di layar judul dan prolog;
  - denyut busur hari berhenti, dan timbangan langsung di bingkai akhir;
  - teks langsung lengkap.
- `.ss-play` diberi atribut `data-kurangi-gerak` bila `settings.reducedMotion` menyala. Keempat blok `@media (prefers-reduced-motion: reduce)` di `game.css` (sprite dan ikon busur, angka melayang, pop bintang, dan timbangan) mendapat pasangan aturan berbasis atribut itu. Jadi CSS juga menghentikan animasi bila hanya pengaturan game yang menyala.
- Pengaturan komputer tidak bisa dibatalkan dari game (bagian "Dialog pengaturan").
- Masa tunggu tetap 600 ms, dan bunyi klik tetap ada.
- Di AGENTS bagian 5, FR-17 dibagi: kurangi gerak dikerjakan di F-10, dan layar penuh tetap di F-13 (bagian "Perubahan dokumen").

### "Main lagi"

[Pemilik, usulan 7]

Diberikan refleksi sudah tampil 600 ms, ketika "Main lagi" diaktifkan, maka:

1. `replayActions()` dikirim, yang kini hanya berisi `MAIN_LAGI`. Reducer kembali ke fase `title` dengan `settings` tetap dan tim yang sama dengan 0 bintang (F-02);
2. `round` dinaikkan, seperti F-09, sehingga pengaman sekali per adegan, layar narasi, layar prolog, isi wilayah `role="status"`, dan masa tunggu dari permainan sebelumnya tidak berlaku lagi;
3. pilihan sementara pengaturan kelas diambil lagi dari mesin (bagian "Pengaturan kelas");
4. layar judul tampil dengan fokus di "Mulai", dan masa tunggu layar judul dimulai;
5. bunyi klik diputar satu kali (bila suara menyala);
6. `Enter` atau `Spasi` yang masih ditahan tidak menekan "Mulai" (bagian "Keyboard").

`startActions` dihapus.

### Layar kerangka dan alamat uji dihapus

[Pemilik, usulan 7a]

Yang dihapus:

- `Placeholder`, tipe `Focus` dengan nilai `preview-link` dan `play-link`, dan pengatur fokusnya di `Game.tsx`;
- `copy.placeholder`. Kalimat pengantarnya pindah ke `copy.title.lead`; status "Permainan ini sedang dibuat." dan kedua teks tautan dihapus;
- aturan `.ss-placeholder`, `.ss-placeholder-title`, `.ss-placeholder-lead`, `.ss-placeholder-status`, dan `.ss-placeholder-actions` di `game.css`;
- `PLAY_HASH`, `PLAY_HASHES`, `TeamCount`, dan rute `{ kind: "main" }` di `layout.ts`;
- `PLAY_TEAMS` di `content/teams.ts`;
- `startActions` di `controls.ts`, serta `initialPlayState`, `teamsFor`, dan prop `teamCount` di `PlayScreen.tsx`;
- komentar kepala berkas yang menyebut `#main` sebagai pintu sementara.

### Pratinjau panggung

[Pemilik, usulan 7a]

- `#adegan-N` dan `#adegan-N-a`, `-b`, atau `-c` tetap membuka pratinjau F-04 tanpa mesin permainan, sebagai alat tinjau tak bertaut. Layar judul tidak punya tautan ke pratinjau.
- "Tutup pratinjau" (`href="#"`) dan "Kembali ke galeri" di pratinjau tidak berubah. "Tutup pratinjau" kini membuka layar judul dengan fokus di "Mulai".
- `StagePreview.tsx` tidak berubah.

### Masa tunggu dan klik ganda

[Pemilik, usulan 9a]

Tombol berikut baru bekerja 600 ms sesudah layarnya tampil, termasuk pintasan `Spasi` dan `Enter` di prolog:

| Layar | Tombol | Dihitung sejak |
|---|---|---|
| Judul | "Mulai", "Cara bermain", "Kembali ke galeri" | Layar judul tampil: halaman dimuat, sesudah "Main lagi", sesudah "Kembali", sesudah pratinjau ditutup, dan sesudah dialog "Cara bermain" ditutup |
| Pengaturan kelas | Semua pilihan, "Kembali", "Mulai permainan" | Pengaturan kelas tampil |
| Prolog | Tombol lanjut dan kotak narasi di setiap layar | Layar prolog itu tampil |

- Selama masa tunggu, tombol tampil biasa (`cream`, atau `sun` dengan kursor ▶ saat `:focus-visible`), ber-`aria-disabled="true"`, dan tidak berubah warna saat diarahkan tetikus, sama dengan layar penutup F-09. Pilihan aktif tetap berlatar `sun` dengan cincin. Tekanan diabaikan tanpa bunyi, dan klik atau `Enter` pada tautan "Kembali ke galeri" dibatalkan (`preventDefault()`).
- Masa tunggu dihitung dengan `performance.now()` sejak layar pertama kali digambar, dan diperiksa saat tekanan diterima. Satu pengatur waktu hanya memperbarui `aria-disabled`, dan dibersihkan saat layar berganti atau ditutup. Reducer tetap tanpa `setTimeout`.
- Masa tunggu sama dengan atau tanpa kurangi gerak.
- Dialog "Cara bermain" dan dialog pengaturan tidak punya masa tunggu. Dialog pengaturan memakai lapisan bening (J-1).

Akibatnya, dengan letak tombol di bagian "Tata letak dan ukuran" (1280×720) [Ukur]:

| Klik ganda pada | Klik kedua jatuh di | Pengaman |
|---|---|---|
| "Mulai" di layar judul (37,9–60,0u) | Ruang kosong pengaturan kelas, di kanan "Kembali" (8,0–33,5u) | Masa tunggu pengaturan kelas |
| "Cara bermain" (63,0–98,0u) | Teks langkah di dialog, bukan tombol | — |
| "Tutup" cara bermain (146,2–169,8u × 88,9–97,0u) | Ruang kosong di kanan "Kembali ke galeri" (101,0–139,8u). Bila tombol "Tentang" kelak ditambahkan (F-11), klik itu bisa jatuh di tombol keempat | Masa tunggu layar judul |
| "Kembali" (8,0–33,5u) | Ruang kosong layar judul | Masa tunggu layar judul |
| "Mulai permainan" (131,2–169,8u × 87,9–96,0u) | "Lanjut" prolog layar 1 (155,2–170,8u × 90,3–96,6u) | Masa tunggu prolog |
| "Lanjut" prolog | "Lanjut" atau "Mulai adegan 1" di layar berikutnya | Masa tunggu prolog |
| "Mulai adegan 1" (145,9–170,8u) | Panel bawah yang kosong selama pergantian | — |
| "Main lagi" di refleksi (12,0–39,1u × 88,9–97,0u, F-09) | Tepi kiri "Mulai" (37,9–60,0u × 89,5–97,7u), tumpang tindih 1,2u | Masa tunggu layar judul |
| "Pengaturan" di bilah atas (1,0–7,0u dari atas) | Lapisan bening di luar dialog, karena dialog mulai 18,5u dari atas | Lapisan bening |
| "Tutup" dialog pengaturan (125,9–149,5u × 70,5–78,6u) | Tombol pilihan C (diskusi, atas 68,2u) atau kotak narasi (narasi dan prolog) | Lapisan bening 600 ms (J-1) |

Tidak ada layar yang terlewat, permainan tidak dimulai tanpa sengaja, dan halaman tidak ditinggalkan tanpa sengaja.

### Fokus

- Layar judul: "Mulai" berfokus saat halaman dimuat, sesudah "Main lagi", sesudah "Kembali", dan sesudah pratinjau ditutup. Sesudah dialog "Cara bermain" ditutup, fokus berada di tombol "Cara bermain".
- Dialog "Cara bermain" dan dialog pengaturan: fokus di judul dialog, lalu kembali ke pemicunya (bagian di atas).
- Pengaturan kelas: fokus di judul "Pengaturan kelas" (`<h2>` ber-`tabIndex=-1`), sehingga `Spasi` tidak menekan pilihan tanpa sengaja.
- Prolog: fokus di tombol lanjut kotak narasi di setiap layar (F-05).
- Adegan 1: fokus di tombol lanjut kotak narasi, seperti sekarang.
- Judul yang berfokus diberi garis fokus 2 px `ink` berjarak 4 px saat `:focus-visible`, seperti judul rekap. Tombol yang berfokus berlatar `sun` dengan kursor ▶.
- Urutan Tab:
  - layar judul: "Mulai", "Cara bermain", "Kembali ke galeri";
  - pengaturan kelas: "2 tim", "3 tim", "4 tim", "30 detik", "60 detik", "90 detik", "Nyala", "Mati", "Kembali", "Mulai permainan";
  - prolog: tombol lanjut, lalu "Pengaturan";
  - adegan: seperti F-05 sampai F-08, ditambah "Pengaturan" paling akhir.
- Layar judul dan pengaturan kelas bukan dialog, jadi fokusnya tidak dikunci.
- Mengubah ukuran jendela hanya mengubah letak dan ukuran. Fokus, layar, masa tunggu, dan isi wilayah pengumuman tidak berubah.

### Pembaca layar

- `<main>` dinamai judul layarnya:
  - layar judul: `<h1>` yang terlihat, "Sehari Setara";
  - pengaturan kelas dan prolog: `<h1>` tersembunyi (`ss-sr`), "Pengaturan kelas" dan "Prolog";
  - adegan dan layar penutup: seperti sekarang.
- Layar judul dan pengaturan kelas tidak menulis pengumuman saat tampil. Judul dan isinya terbaca lewat urutan baca, dan fokus jatuh di tombol atau judul.
- Prolog: teks setiap layar ditulis utuh ke wilayah `aria-live="polite"` satu kali, seperti narasi.
- Wilayah `role="status"` berisi pengumuman jumlah tim di pengaturan kelas, yang dikosongkan saat "Mulai permainan". Sesudah itu, wilayah ini dipakai untuk peristiwa seperti sekarang (`M`, pengatur waktu, dan bintang) [DRAF J-7].
- Kedua dialog bernama lewat judulnya. Grup pilihan bernama labelnya, dan catatannya dikaitkan dengan `aria-describedby`.
- Daftar tim di pengaturan kelas adalah `<ul>` bernama "Tim yang bermain". Setiap butir punya kalimat tersembunyi, misalnya "Tim Mangga, giliran adegan 1 dan 4.". Ikon, nama, dan jadwal yang terlihat disembunyikan dari pembaca layar, seperti papan tim F-07 [DRAF].
- Daftar tombol keyboard adalah `<dl>`. Setiap kotak tombol punya teks tersembunyi yang mudah dibacakan, misalnya "Spasi atau Enter" untuk "Spasi / Enter", sedangkan kotak yang terlihat disembunyikan [DRAF].
- Langkah bermain adalah `<ol>` dengan `role="list"` (pola F-09), dan kotak nomornya disembunyikan.
- Latar dan Nara di layar judul disembunyikan (J-8). Label panggung prolog adalah teks alternatif prolog (J-9).
- Tombol "Pengaturan" yang nonaktif memakai `aria-disabled="true"`, sehingga tetap terbaca dan bisa difokus.

### Makna tidak hanya lewat warna

- Pilihan aktif ditandai cincin dalam `ink` dan `aria-pressed`, bukan hanya latar `sun`.
- Tim ditandai bentuk dan nama, bukan hanya warna ikon.
- Tombol nonaktif ditandai `aria-disabled` dan latar `mist`. Baris "Kurangi gerak" yang terkunci juga punya catatan tertulis.
- Dalam mode warna paksa (`forced-colors: active`), sudut terpotong dialog pengaturan dan kotak tombol keyboard dimatikan seperti F-05. Blok `@media (forced-colors: active)` ditulis sesudah aturan `clip-path`-nya (pelajaran laporan F-08, Temuan 1). Tombol pilihan sudah diatur aturan `ss-button` F-05. Semua makna tetap terbaca dari tulisan dan `aria-pressed`.

### Keyboard

| Tombol | Fase atau layar | Fungsi |
|---|---|---|
| `Tab`, `Shift+Tab` | Semua | Memindah fokus; terkunci di dalam kedua dialog |
| `Enter`, `Spasi` pada tombol yang berfokus | Semua | Klik peramban; pada tautan hanya `Enter` |
| `Spasi`, `Enter` sebagai pintasan | `prolog` | Tombol lanjut kotak narasi, sesudah masa tunggu |
| `M` | `prolog` (baru), dan fase yang sudah ada sejak F-07 dan F-09 | Suara mati atau nyala (F-07) |
| `Esc` | `prolog`, `intro`, `discuss`, `stars`, bila tidak ada pergantian adegan | Membuka dialog pengaturan |
| `Esc` | Dialog pengaturan, dialog "Cara bermain" | Menutup dialog |
| `Esc` | `title` tanpa dialog, `setup`, `reaction`, `impact`, `quiz`, `transition`, `ending`, `recap`, `reflection` | Tidak berpengaruh |

- Di layar judul, dialog "Cara bermain", pengaturan kelas, dan dialog pengaturan, pintasan permainan tidak berlaku dan tidak berbunyi: angka, huruf, `M`, `P` `T` `S`, `0` `1` `2`, panah, serta `Spasi` dan `Enter` sebagai pintasan.
- Tombol yang ditahan [DRAF J-11]. Di fase `title`, `setup`, dan `prolog`, dan selama dialog pengaturan terbuka, setiap `keydown` `Enter` atau `Spasi` yang berulang (`event.repeat`) dibatalkan (`preventDefault()`) di mana pun fokusnya, seperti layar penutup F-09. Sesudah dialog pengaturan ditutup, pembatalan yang sama berlaku sampai ada `keyup`, atau `keydown` baru yang tidak berulang. Jadi `Enter` yang ditahan pada "Tutup" tidak menekan unsur yang kembali berfokus. `Esc` yang berulang juga diabaikan, sehingga menahan `Esc` tidak membuka dan menutup dialog berulang kali.
- Aturan F-05 tetap berlaku: tekanan bersama Ctrl, Alt, atau Meta, tekanan berulang sebagai pintasan, huruf yang sedang disusun, dan tekanan di kolom isian diabaikan.
- `F` (layar penuh) milik F-13.

### Bunyi

- Bunyi klik F-07 diputar sekali untuk setiap tekanan yang diterima di layar baru: "Mulai", "Cara bermain", "Tutup" di kedua dialog, pilihan yang berubah, "Kembali", "Mulai permainan", setiap tekanan lanjut di prolog, "Pengaturan", serta `Esc` yang membuka atau menutup dialog.
- Tekanan yang diabaikan tidak berbunyi: selama masa tunggu, pada pilihan yang sudah aktif, pada tombol nonaktif, dan pada lapisan bening. "Kembali ke galeri" tidak berbunyi.
- Pemutar bunyi tetap dibuat pada interaksi pertama di layar permainan, yang kini dimulai dari layar judul. Klik pertama sesudah halaman dimuat bisa tanpa bunyi bila kedua berkas bunyi belum siap, karena bunyi tidak diantre (F-07) [Rencana].
- Pilihan "Mati" di pengaturan kelas sudah berlaku sebelum klik "Mulai permainan".
- Tidak ada bunyi baru. Bunyi lain FR-19 milik F-13.

### Privasi

[Pemilik, usulan 8a]

- Semua layar tanpa kolom isian: tidak ada `input`, `textarea`, `select`, atau unsur `contenteditable`.
- Tidak ada yang disimpan. Pengaturan hanya ada di memori selama halaman terbuka; `localStorage`, `sessionStorage`, IndexedDB, dan kuki tidak dipakai. Memuat ulang halaman mengembalikan pengaturan bawaan.
- Halaman hanya meminta berkas dari situs sendiri (AGENTS bagian 7 aturan 2 dan 3; Architecture bagian 13).

### Galeri dan aset

- Warna di aturan CSS baru hanya token yang sudah ada (`--ss-ink`, `--ss-dusk`, `--ss-mist`, `--ss-cream`, `--ss-white`, `--ss-sun`) dan warna langit pagi bilah atas (`#FFD9A8`) yang sudah ada di `game.css`. Tidak ada token `:root` baru, dan uji palet F-12 tetap lulus.
- Berkas galeri tidak berubah.

## Status antarmuka

| Bagian | Status | Tampilan |
|---|---|---|
| Layar judul | Tertahan (0–600 ms) | Tombol tampil biasa dengan `aria-disabled="true"`; "Mulai" berfokus |
| | Siap | Tombol `cream`; saat fokus atau diarahkan tetikus, `sun` dengan kursor ▶ |
| | Kurangi gerak | Nara di bingkai pertama |
| | Latar gagal dimuat | Layar `mist` dengan judul, kalimat, dan tombol tetap ada (`ink` di atas `mist` 9,5:1) |
| | Nara gagal dimuat | Ruang kosong; tombol tetap bekerja |
| Cara bermain | Terbuka | Menutupi layar judul; judul dialog berfokus |
| Pengaturan kelas | Tertahan, siap | Seperti layar judul |
| | 2, 3, atau 4 tim | Daftar tim satu atau dua baris |
| | Pilihan aktif | `sun`, cincin dalam `ink` 2p, `aria-pressed="true"` |
| | Ikon tim gagal dimuat | Ruang ikon kosong; nama dan jadwal tetap ada |
| Prolog | Tertahan (0–600 ms) | Teks berjalan seperti biasa; tombol lanjut tampil biasa dengan `aria-disabled="true"` |
| | Teks berjalan | Tekanan pertama menampilkan teks sekaligus |
| | Teks lengkap | Tekanan membuka layar berikutnya, atau memulai pergantian di layar 3 |
| | Dijeda karena dialog | Teks berhenti di huruf yang sama, tanpa bunyi teks |
| Tombol "Pengaturan" | Aktif | `cream`; fokus `sun` dengan ▶ |
| | Nonaktif | `mist`, teks `dusk`, `aria-disabled="true"`. Saat `:focus-visible`, kursor ▶ dan garis fokus 2 px `ink`, seperti tombol nonaktif F-07 |
| Dialog pengaturan | Biasa | Hanya catatan durasi |
| | Kurangi gerak dari komputer | "Kurangi gerak" terkunci dengan catatannya, ditambah catatan teks per huruf |
| | Kurangi gerak dari game | Catatan teks per huruf |
| | 600 ms sesudah ditutup | Lapisan bening masih menahan klik |
| Kosong | Tidak berlaku | Daftar tim selalu berisi 2–4 tim |
| Galat | Bunyi gagal dimuat | Permainan berjalan tanpa bunyi (F-07) |

Kontras teks [Dokumen: Design System bagian 4; Ukur]:

| Pasangan | Rasio |
|---|---|
| `ink` di atas langit pagi `#9ED8F5` dan `#FFF1C9` (judul dan kalimat pengantar). Hanya dua warna itu yang ada di `TITLE_ZONE` `bg_title` [Ukur]. Pasangan baru untuk Design System bagian 4 | 9,2 / 12,7 : 1 |
| `ink` di atas `cream` (tombol, langkah, isi dialog) | 13,3 : 1 |
| `ink` di atas `sun` (fokus, pilihan aktif) | 9,9 : 1 |
| `ink` di atas kepala pagi `#FFD9A8` | 10,7 : 1 |
| `dusk` di atas `cream` (jadwal, catatan, judul kolom) | 8,2 : 1 |
| `dusk` di atas `mist` (tombol nonaktif) | 5,9 : 1 |
| `cream` di atas `ink` (kotak nomor langkah) | 13,3 : 1 |
| `ink` di atas `mist` (latar judul gagal dimuat) | 9,5 : 1 |

## Tata letak dan ukuran

p adalah satu piksel antarmuka (`--ss-px`, F-05): 2 px di 1280×720, 1366×768, dan 1024×768, serta 3 px di 1920×1080. kj adalah skala layar judul (tinggi layar ÷ 180). Semua ukuran huruf memakai u.

### Layar judul

| Bagian | Nilai |
|---|---|
| Layar | Menutupi `.ss-screen` (lapisan 100), latar `mist` bila gambar gagal dimuat |
| Latar | Bingkai panggung F-04 berukuran 320kj × 180kj (seluruh layar 16:9), isinya panggung logis 320 × 180 berskala kj, dengan garis pindai dan vinyet F-04 |
| Nara | `walk` di x 96 menghadap kanan; kotak sprite 26 × 62 di kiri 83 dan atas 95; bayangan 20 × 2 di kiri 86 dan atas 155, warna `wood` (piksel logis) |
| Bidang judul | Mutlak di x 64kj, y 6kj, berukuran 192kj × 50kj (lapisan 50). Kolom rata tengah di tengah bidang, celah 1,2u |
| Judul | Press Start 2P 7u, tinggi baris 1,2, satu baris tanpa pemenggalan |
| Kalimat pengantar | Pixelify Sans 3,1u, tinggi baris 1,3, lebar paling banyak lebar bidang, `text-wrap: balance` |
| Pita tombol | Mutlak di y 157kj setinggi 23kj, selebar layar; tombol rata tengah dengan celah 3u; `ss-button` F-01 |

Hasil pengukuran [Ukur]:

| | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
|---|---|---|---|---|
| Bidang judul (kiri–kanan; atas–bawah) | 35,6–142,2u; 3,3–31,1u | sama | sama | sama |
| Lebar judul, satu baris (sisa di bidang) | 91,0u (15,7u) | sama | sama | sama |
| Lebar kalimat pengantar, satu baris (sisa) | 104,5u (2,2u) | sama | sama | sama |
| Tinggi isi bidang, dari atas judul sampai bawah kalimat | 13,6u dari 27,8u | sama | sama | sama |
| Atas–bawah tombol | 89,5–97,7u | 89,6–97,6u | 89,5–97,7u | 89,4–97,8u |
| "Mulai" (kiri–kanan) | 37,9–60,0u | 38,1–60,0u | 37,9–60,0u | 37,5–59,9u |
| "Cara bermain" | 63,0–98,0u | 63,0–98,0u | 63,0–98,0u | 62,9–98,1u |
| "Kembali ke galeri" | 101,0–139,8u | 101,0–139,7u | 101,0–139,8u | 101,1–140,2u |
| Nara (kiri–kanan; atas–bawah) | 46,1–60,6u; 52,8–87,2u | sama | sama | sama |

- Pita tombol 87,2–100u, sehingga kaki Nara (87,2u) tepat di atas pita, dan tombol berjarak 2,2–2,4u dari tepi bawah layar.
- Bila kalimat pengantar terbungkus dua baris di komputer lain, isi bidang naik sekitar 4u dan tetap di bawah 27,8u [Rencana].
- Dengan empat tombol (F-11, "Tentang"), baris tombol selebar 129,9–131,3u dan tetap muat [Rencana].

### Cara bermain

| Bagian | Nilai |
|---|---|
| Dialog | Menutupi `.ss-screen` (lapisan 110), latar `cream`; kolom kepala, isi, dan kaki |
| Kepala | Tinggi 8u, jarak dalam 0 × 4u, latar `#FFD9A8`; judul Press Start 2P 2,8u, tinggi baris 1,3 |
| Isi | Jarak dalam 3u atas, 8u kiri-kanan, 0 bawah; dua kolom sama lebar dengan celah 6u; `overflow: hidden` |
| Judul kolom | Pixelify Sans 2,5u `dusk`, tinggi baris 1,3, jarak bawah 1,6u |
| Langkah | Daftar dengan celah 1,6u. Setiap langkah: kotak nomor `ss-choice-key` F-05 (Press Start 2P 2,8u), celah 1,6u, teks Pixelify Sans 3,1u, tinggi baris 1,3 |
| Tombol keyboard | Dua kolom (lebar kotak sesuai isi, lalu keterangan), celah 1,2u × 2u. Kotak: garis `ink` p dengan sudut terpotong p, jarak dalam 0,5u × 1u, Press Start 2P 2,5u, tinggi baris 1,3, satu baris. Keterangan Pixelify Sans 3,1u, tinggi baris 1,3 |
| Kaki | Jarak dalam 1,2u atas, 8u kiri-kanan, 3u bawah; "Tutup" (`ss-button`) rata kanan |

Hasil pengukuran [Ukur]:

| | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
|---|---|---|---|---|
| Baris setiap langkah | 2 | 2 | 2 | 2 |
| Baris keterangan tombol | 1, kecuali "Jeda atau lanjutkan waktu" 2 | sama | sama | sama |
| Sisa di bawah kolom kiri / kanan | 15,5u / 15,8u | 15,5u / 16,1u | 15,5u / 15,8u | 15,2u / 14,4u |
| Lebar kolom kotak tombol | 35,1u | 35,0u | 35,1u | 35,2u |
| "Tutup" (atas–bawah; kiri–kanan) | 88,9–97,0u; 146,2–169,8u | 88,9–97,0u; 146,3–169,8u | 88,9–97,0u; 146,2–169,8u | 88,6–97,0u; 145,9–169,8u |

Tidak ada teks yang meluap. Sisa terkecil 14,4u cukup untuk tiga baris tambahan, misalnya baris `F` dari F-13.

### Pengaturan kelas

| Bagian | Nilai |
|---|---|
| Layar | Menutupi `.ss-screen` (lapisan 100), latar `cream`; kolom kepala, isi, dan kaki |
| Kepala | Sama dengan kepala cara bermain; judul "Pengaturan kelas" |
| Isi | Jarak dalam 4u atas, 8u kiri-kanan, 0 bawah; celah antarbaris 3u; `overflow: hidden` |
| Baris | Kolom label 30u dan kolom pilihan, celah 2u, rata atas. Label Pixelify Sans 3,1u, setinggi satu tombol dan rata tengah tegak |
| Pilihan | `ss-button` F-01 (tinggi 8,07–8,41u), celah 2u, boleh berlipat ke bawah |
| Daftar tim | Jarak atas 1,6u; dua kolom selebar isi, celah 1,2u × 6u. Setiap tim: ikon bentuk 16p, celah 1u, nama Pixelify Sans 3,1u satu baris, dan di bawah nama jadwal Pixelify Sans 2,5u `dusk` satu baris |
| Keterangan suara | Pixelify Sans 2,5u `dusk`, jarak atas 0,8u |
| Kaki | Jarak dalam 1,2u atas, 8u kiri-kanan, 4u bawah; "Kembali" di kiri dan "Mulai permainan" di kanan (`ss-button`) |

Hasil pengukuran [Ukur]:

| | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
|---|---|---|---|---|
| Sisa di bawah isi: 2 tim / 3 dan 4 tim | 30,9u / 22,1u | 31,4u / 22,8u | 30,9u / 22,1u | 28,7u / 18,7u |
| Nama tim terlebar ("Tim Mentari") | 17,8u | 17,8u | 17,8u | 17,8u |
| Tepi kanan pilihan terjauh ("90 detik") | 124,9u | 124,7u | 124,9u | 125,7u |
| "Kembali" (kiri–kanan) | 8,0–33,5u | 8,0–33,4u | 8,0–33,5u | 8,0–33,7u |
| "Mulai permainan" (kiri–kanan) | 131,2–169,8u | 131,3–169,8u | 131,2–169,8u | 131,0–169,8u |
| Atas–bawah tombol kaki | 87,9–96,0u | 87,9–96,0u | 87,9–96,0u | 87,6–96,0u |

- Nama tim terlebar 17,8u, di bawah batas 18,6u papan tim (catatan Plan F-10 nomor 1). Setiap jadwal tidak lebih lebar dari nama timnya.
- Tidak ada teks yang meluap, dan keterangan suara satu baris.

### Prolog

| Bagian | Nilai |
|---|---|
| Tata letak | Layar permainan F-05: bilah atas 8u, area panggung 52u, panel bawah 40u; panel kiri dan kanan seperti F-06 dan F-07 |
| Bilah atas | Sama dengan adegan 1 (pagi); tulisan kanan "Prolog" Pixelify Sans 3,1u, selebar 9,5u [Ukur] |
| Panggung | Bingkai, skala k, garis pindai, dan vinyet F-04; latar `bg_title`; Nara di x 160 (kotak sprite di kiri 147 dan atas 95; bayangan di kiri 150 dan atas 155, warna `wood`) |
| Kotak narasi | F-05, tanpa perubahan ukuran; tab "Prolog" |

Hasil pengukuran [Ukur]:

| | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
|---|---|---|---|---|
| Baris teks layar 1 / 2 / 3 | 2 / 3 / 3 | 2 / 3 / 3 | 2 / 3 / 3 | 2 / 3 / 3 |
| Sisa di atas tombol: layar 1 / layar 2 dan 3 | 13,6u / 8,8u | 13,8u / 8,9u | 13,6u / 8,8u | 13,1u / 8,2u |
| "Lanjut" (atas–bawah; kiri–kanan) | 90,3–96,6u; 155,2–170,8u | 90,4–96,7u; 155,3–170,9u | 90,3–96,6u; 155,2–170,8u | 89,9–96,5u; 154,7–170,7u |
| "Mulai adegan 1" (kiri–kanan) | 145,9–170,8u | 146,0–170,9u | 145,9–170,8u | 145,5–170,7u |

### Tombol "Pengaturan" dan dialog pengaturan

| Bagian | Nilai |
|---|---|
| Tombol "Pengaturan" | `ss-button` dengan Pixelify Sans 2,5u dan jarak dalam 0,8u × 3u; mutlak 1u dari atas dan 22u dari tepi kanan layar (lapisan 60), di atas bilah atas |
| Lapisan bening | Mutlak menutupi `.ss-screen` (lapisan 119), tanpa warna |
| Dialog | Mutlak di tengah `.ss-screen` (lapisan 120), lebar dan tinggi sesuai isi, paling lebar layar dikurangi 8u. Bingkai piksel F-05 (garis `ink` 2p, sudut terpotong p, sorotan `white` p), latar `cream`, jarak dalam 2,4u × 4u, kolom dengan celah 2u |
| Judul | Press Start 2P 2,8u, tinggi baris 1,3 |
| Baris | Dua kolom selebar isi (label, lalu pilihan dengan catatannya), celah 1,6u × 3u, rata atas. Label Pixelify Sans 3,1u setinggi satu tombol; pilihan `ss-button` dengan celah 2u |
| Catatan | Pixelify Sans 2,5u `dusk`, tinggi baris 1,3, jarak atas 0,8u |
| Kaki | "Tutup" (`ss-button`) rata kanan |

Hasil pengukuran [Ukur]:

| | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
|---|---|---|---|---|
| Tombol "Pengaturan" (kiri–kanan; atas–bawah) | 128,0–155,8u; 1,0–7,0u | 128,1–155,8u; 1,0–6,9u | 128,0–155,8u; 1,0–7,0u | 127,8–155,8u; 1,0–7,2u |
| Celah ke tulisan kanan: "Prolog" / "Adegan 1/6" / "Adegan 6/6" / "Akhir hari" | 9,5 / 2,7 / 2,2 / 4,2u | sama | sama | sama |
| Celah ke busur hari | 70,2u | 72,7u | 70,2u | 68,5u |
| Dialog biasa (lebar × tinggi; atas–bawah) | 130,3 × 63,1u; 18,5–81,5u | 130,0 × 62,7u; 18,7–81,3u | 130,3 × 63,1u; 18,5–81,5u | 131,4 × 64,7u; 17,6–82,4u |
| Dialog dengan kurangi gerak dari komputer (tinggi; sisa atas dan bawah) | 71,2u; 14,4u | 70,8u; 14,6u | 71,2u; 14,4u | 72,8u; 13,6u |
| Lebar kolom label ("Teks muncul per huruf") | 33,3u | 33,3u | 33,3u | 33,3u |
| "Tutup" dialog biasa (kiri–kanan; atas–bawah) | 125,9–149,5u; 70,5–78,6u | 125,9–149,4u; 70,3–78,4u | 125,9–149,5u; 70,5–78,6u | 126,0–149,9u; 70,9–79,3u |

- Setiap catatan satu baris, dan tidak ada teks yang meluap.
- Saat diskusi di keempat ukuran, "Tutup" dialog biasa menumpuk di atas tombol pilihan C (atas 68,2u). Inilah alasan lapisan bening 600 ms (J-1).
- Tombol "Pengaturan" tidak menyentuh busur hari maupun tulisan kanan.

## Teks yang tampil (final)

Teks ketiga layar prolog dan teks alternatifnya ada di `app/sehari-setara/content/prolog.ts` (baru). Teks lain ada di `content/copy.ts`. Nama tim berasal dari `content/teams.ts` tanpa perubahan.

**Layar judul**

| Tempat | Teks | Asal |
|---|---|---|
| Judul `<h1>` | Sehari Setara | F-01 (`copy.gameName`) |
| Kalimat pengantar | Temani Nara menjalani satu hari dan pilih tindakannya bersama kelas. | F-01, pindah dari `copy.placeholder.lead` |
| Tombol | Mulai; Cara bermain | FR-01 |
| Tautan | Kembali ke galeri | F-01 (`copy.backToGallery`) |

**Cara bermain** [Pemilik, usulan 2; draf baru]

| Tempat | Teks |
|---|---|
| Judul dialog | Cara bermain |
| Judul kolom kiri | Langkah bermain |
| Judul kolom kanan | Tombol keyboard untuk guru |
| Tombol | Tutup |

| No. | Langkah bermain |
|---|---|
| 1 | Kelas dibagi menjadi 2 sampai 4 tim. Setiap adegan, satu tim mendapat giliran. |
| 2 | Bacalah situasinya bersama, lalu diskusikan pilihan sebelum waktu habis. |
| 3 | Tim yang mendapat giliran menyebutkan pilihan A, B, atau C beserta alasannya. |
| 4 | Kartu dampak menjelaskan hak, kewajiban, dan pasal yang berkaitan. |
| 5 | Guru memberi 0, 1, atau 2 bintang untuk alasan tim, bukan untuk tebakan cepat. |
| 6 | Tidak ada yang kalah. Di akhir hari, kelas melihat rekap dan menulis refleksi. |

| Kotak tombol | Dibacakan pembaca layar [DRAF] | Keterangan |
|---|---|---|
| Spasi / Enter | Spasi atau Enter | Lanjut |
| 1 2 3 / A B C | 1, 2, 3, atau A, B, C | Memilih |
| P | P | Jeda atau lanjutkan waktu |
| T | T | Tambah 30 detik |
| S | S | Lewati diskusi |
| 0 1 2 | 0, 1, atau 2 | Memberi bintang alasan |
| 1 2 3 4 | 1, 2, 3, atau 4 | Menjawab kuis peran |
| M | M | Suara nyala atau mati |
| Esc | Esc | Pengaturan |

Baris `F` (layar penuh) ditambahkan di F-13. Kata "kalah" hanya muncul dalam kalimat "Tidak ada yang kalah", di langkah 6 dan prolog layar 3, sesuai PRD bagian 9.

**Pengaturan kelas** [Pemilik, usulan 3]

| Tempat | Teks | Asal |
|---|---|---|
| Judul | Pengaturan kelas | FR-02 |
| Label baris | Jumlah tim; Durasi diskusi; Suara | Draf baru |
| Pilihan | 2 tim; 3 tim; 4 tim / 30 detik; 60 detik; 90 detik / Nyala; Mati | Draf baru |
| Jadwal giliran | Adegan {nomor}, dengan nomor dipisah koma, misalnya "Adegan 1, 4" atau "Adegan 1, 3, 5" | Draf baru |
| Keterangan suara | Bunyi klik dan bunyi teks. | Draf baru |
| Tombol kaki | Kembali; Mulai permainan | Draf baru |
| Nama daftar tim (pembaca layar) | Tim yang bermain | DRAF |
| Kalimat setiap tim (pembaca layar) | {nama}, giliran adegan {nomor}., dengan "dan" sebelum nomor terakhir, misalnya "Tim Mangga, giliran adegan 1 dan 4.", "Tim Mangga, giliran adegan 1, 3, dan 5.", dan "Tim Daun, giliran adegan 3." | DRAF |
| Pengumuman jumlah tim | {n} tim: {nama tim}., dengan "dan" sebelum nama terakhir: "2 tim: Tim Mangga dan Tim Laut.", "3 tim: Tim Mangga, Tim Laut, dan Tim Daun.", dan "4 tim: Tim Mangga, Tim Laut, Tim Daun, dan Tim Mentari." | Draf baru (usulan 3) |

**Prolog** [Pemilik, usulan 4; draf baru]

| Tempat | Teks |
|---|---|
| Tab kotak narasi dan tulisan kanan bilah atas | Prolog |
| Label bilah atas (pembaca layar) | Pukul 06.15, prolog |
| Judul `<h1>` tersembunyi | Prolog |
| Tombol lanjut | Lanjut (layar 1 dan 2); Mulai adegan 1 (layar 3) |

| Layar | Pose Nara | Teks | Teks alternatif panggung [DRAF J-9] |
|---|---|---|---|
| 1 | `talk` | Ini Nara, siswa kelas IX. Hari ini kalian menemani Nara dari pagi sampai malam. Di setiap adegan, kelas membantu Nara memilih tindakan. | Jalan kampung pada pagi hari, dengan rumah dan sekolah di kejauhan serta matahari terbit. Nara berdiri di tengah jalan sambil berbicara. |
| 2 | `idle` | Lihat dua indikator di kiri: hak orang lain terjaga dan kewajiban dijalankan. Keduanya mulai dari 50 dan bergerak sesuai pilihan kelas. Indikator ini milik seluruh kelas, jadi semua tim menjaganya bersama. | Jalan kampung pada pagi hari, dengan rumah dan sekolah di kejauhan. Nara berdiri tenang di tengah jalan. |
| 3 | `happy` | Tim yang mendapat giliran memutuskan pilihan, dan guru memberi bintang untuk alasan yang baik. Tidak ada yang kalah dalam permainan ini. Hari Nara dimulai sekarang! | Jalan kampung pada pagi hari, dengan rumah dan sekolah di kejauhan. Nara tersenyum senang di tengah jalan. |

Kalimat layar 2 bersumber dari PRD bagian 9 ("milik seluruh kelas"), dan layar 3 dari PRD bagian 3 nomor 3 dan bagian 9 ("tidak ada kalah"). Nama indikator ditulis huruf kecil di dalam kalimat (AGENTS bagian 8).

**Dialog pengaturan** [Pemilik, usulan 5; draf baru]

| Tempat | Teks |
|---|---|
| Tombol pemicu di bilah atas | Pengaturan |
| Judul dialog | Pengaturan |
| Label baris | Suara; Kurangi gerak; Teks muncul per huruf; Durasi diskusi |
| Pilihan | Nyala; Mati / 30 detik; 60 detik; 90 detik |
| Catatan durasi | Berlaku mulai diskusi berikutnya. |
| Catatan kurangi gerak dari komputer | Menyala karena komputer meminta gerak dikurangi. |
| Catatan teks per huruf saat kurangi gerak menyala | Teks langsung lengkap selama kurangi gerak menyala. |
| Tombol | Tutup |

**Pengumuman**

- Prolog: teks layar ditulis utuh ke wilayah `aria-live="polite"`, sama dengan teks yang tampil.
- Pengaturan kelas: pengumuman jumlah tim ditulis ke wilayah `role="status"`.
- Layar judul, kedua dialog, dan perubahan pilihan lain tidak menulis pengumuman [DRAF J-7].

Teks yang dihapus: "Permainan ini sedang dibuat.", "Lihat pratinjau panggung", dan "Coba alur permainan". Naskah, kartu dampak, kuis, layar penutup, dan pratinjau panggung tidak berubah.

## Data dan aksi

### Mesin

[Pemilik, usulan 3 "Kembali" pilihan a, dan usulan 10]

- `GameAction` mendapat `{ type: "BATAL_PENGATURAN" }`.
- Di fase `setup`, `BATAL_PENGATURAN` mengembalikan `{ ...state, phase: "title" }`, sehingga tim, pengaturan, pengatur waktu, dan `history` tetap. Di fase lain, aksi itu mengembalikan objek keadaan yang sama.
- Diagram Architecture bagian 6 mendapat panah `setup --> title: BATAL_PENGATURAN`.
- Tidak ada perubahan lain. `MULAI`, `SIMPAN_PENGATURAN` (2–4 tim, id unik, nama tidak kosong), `LANJUT` dari `prolog` ke `intro`, `MAIN_LAGI` ke `title`, dan `UBAH_PENGATURAN` di semua fase sudah ada sejak F-02. Reducer tetap tanpa pengatur waktu, tanggal, dan bilangan acak (F-02 AC-14).

### Aksi yang dikirim layar permainan

| Saat | Aksi |
|---|---|
| "Mulai" di fase `title`, sesudah 600 ms, sekali | `MULAI` |
| Pilihan jumlah tim dan durasi di pengaturan kelas | Tidak ada aksi; pilihan sementara di `PlayScreen` |
| "Nyala" atau "Mati" suara (pengaturan kelas dan dialog) | `UBAH_PENGATURAN` dengan `sound` |
| "Mulai permainan", sesudah 600 ms, sekali | `setupActions(draft)`: `SIMPAN_PENGATURAN` dengan `teams: teamsForCount(n)` dan `settings: { discussSeconds }` |
| "Kembali", sesudah 600 ms, sekali | `BATAL_PENGATURAN` |
| Lanjut di prolog layar 1 dan 2 | Tidak ada aksi; nomor layar prolog di `PlayScreen` |
| "Mulai adegan 1" | Pergantian; `LANJUT` pada 200 ms (sapuan) atau 75 ms (pudar) |
| Kurangi gerak, teks per huruf, dan durasi di dialog | `UBAH_PENGATURAN` dengan `reducedMotion`, `typewriter`, atau `discussSeconds` |
| `M` di fase `prolog` | `UBAH_PENGATURAN` dengan `sound` dibalik (F-07) |
| "Main lagi" | `replayActions()`: `MAIN_LAGI` |
| Membuka dan menutup kedua dialog | Tidak ada aksi |

Klik dan pengumuman hanya diputar atau ditulis bila tekanan itu diterima (aturan F-07).

### Berkas dan ekspor

`app/sehari-setara/ui/opening.ts` (baru) berisi fungsi murni ketiga layar pembuka dan dialog pengaturan, dan diuji di `__tests__/opening.test.ts`. Namanya bukan `setup.ts` atau `settings.ts`, agar tidak tertukar dengan `Setup.tsx` dan `Settings.tsx` di sistem berkas yang tidak membedakan huruf besar (pelajaran F-07, `turn.ts`), dan sepasang dengan `closing.ts` F-09.

| Ekspor | Isi |
|---|---|
| `OPENING_GUARD_MS` | 600 |
| `TeamCount` | `2 \| 3 \| 4` |
| `TEAM_COUNTS`, `DEFAULT_TEAM_COUNT` | `[2, 3, 4]` dan 3 |
| `DISCUSS_CHOICES` | `[30, 60, 90]` |
| `SetupDraft` | `{ count: TeamCount; seconds: Settings["discussSeconds"] }` |
| `setupDraftFrom(state)` | Pilihan awal pengaturan kelas: banyak tim di `state.teams` bila 2–4 (selain itu 3), dan `state.settings.discussSeconds` |
| `teamsForCount(count, list = DEFAULT_TEAMS)` | `count` tim pertama dari daftar |
| `turnScenes(index, count, sceneCount)` | Nomor adegan (mulai 1) dengan `activeTeamIndex(n − 1, count)` sama dengan `index` |
| `turnText(scenes)` | Jadwal yang terlihat, misalnya "Adegan 1, 4" |
| `listText(items)` | Daftar dengan "dan": "A", "A dan B", "A, B, dan C" |
| `teamTurnSentence(name, scenes)` | Kalimat pembaca layar setiap tim, misalnya "Tim Mangga, giliran adegan 1 dan 4." |
| `teamCountAnnouncement(teams)` | Pengumuman jumlah tim, misalnya "3 tim: Tim Mangga, Tim Laut, dan Tim Daun." |
| `setupActions(draft, list = DEFAULT_TEAMS)` | `[{ type: "SIMPAN_PENGATURAN", teams, settings: { discussSeconds } }]` |
| `SETTINGS_PHASES` | Fase `prolog`, `intro`, `discuss`, dan `stars` |
| `settingsOpenable(phase, changing)` | Benar bila fase ada di `SETTINGS_PHASES` dan tidak ada pergantian adegan |
| `SettingsView` | `{ sound: boolean; motion: { on: boolean; locked: boolean }; typewriter: { on: boolean; note: boolean }; seconds: Settings["discussSeconds"] }` |
| `settingsView(settings, systemReduced)` | Keadaan setiap baris dialog: `motion.on` = komputer atau game, `motion.locked` = komputer, `typewriter.note` = `motion.on` |
| `TITLE_NARA_X`, `PROLOG_NARA_X` | 96 dan 160 (piksel logis) |
| `openingScene(base, pose, x, altText)` | Adegan semu untuk `Stage`: `base` (adegan 1) dengan `bg: "bg_title"`, `cast` berisi satu Nara (`pose`, `x`, menghadap kanan), dan `altText` |

Berkas lain:

| Berkas | Isi |
|---|---|
| `content/prolog.ts` (baru) | `PROLOG: readonly { text: string; pose: "talk" \| "idle" \| "happy"; altText: string }[]`, tiga layar |
| `ui/Title.tsx` (baru) | `TitleScreen`: latar (`Stage` dengan adegan semu, di dalam pembungkus ber-`aria-hidden`), bidang judul, pita tombol, dan "Mulai" yang berfokus setiap kali layar judul tampil. `HowToDialog`: dialog "Cara bermain" dengan kunci fokus dan `Esc` |
| `ui/Setup.tsx` (baru) | `SetupScreen`: kepala, tiga grup pilihan, daftar tim dengan jadwal, kaki; judul berfokus saat tampil |
| `ui/Settings.tsx` (baru) | `SettingsButton` (tombol di bilah atas, aktif atau nonaktif), `SettingsDialog` (isi menurut `SettingsView`, kunci fokus, pembatalan `Enter` dan `Spasi` yang berulang), dan lapisan bening |
| `ui/PlayScreen.tsx` | Keadaan awal `createInitialState()` (fase `title`); prop `titleScale`; ketiga layar pembuka; pilihan sementara pengaturan kelas; nomor layar prolog; masa tunggu layar pembuka (ref waktu mulai dan satu pengatur waktu tampilan); dialog pengaturan (terbuka atau tidak, pemicu, lapisan 600 ms); `useTimer` tidak aktif dan `NarrationBox` dijeda selama dialog; `Esc`; pembatalan tombol yang ditahan; `replay()` hanya `MAIN_LAGI`; `<h1>` dan pengumuman menurut layar; wilayah `role="status"` dikosongkan saat "Mulai permainan"; atribut `data-fase`, `data-prolog`, dan `data-kurangi-gerak` pada `<main>`; `teamCount`, `initialPlayState`, dan `teamsFor` dihapus |
| `ui/controls.ts` | `NEXT_PHASES` dan `SOUND_PHASES` ditambah `prolog`; `PlayCommand` ditambah `{ type: "pengaturan" }` untuk `Escape` di `SETTINGS_PHASES`; `startActions` dihapus; `replayActions()` mengembalikan `[{ type: "MAIN_LAGI" }]` |
| `ui/layout.ts` | `TITLE_ZONE = { x0: 64, y0: 6, x1: 256, y1: 56 }` (sama dengan `latar.py`); `TITLE_BAND = { top: 157, bottom: 180 }`; `titleScaleForScreen(tinggi) = tinggi ÷ 180`; `ScreenRoute` hanya rute pratinjau, dan `parseRoute` mengembalikan rute pratinjau atau `null`; `PLAY_HASH`, `PLAY_HASHES`, dan `TeamCount` dihapus |
| `ui/hooks.ts` | `useTitleScale(ref)`: kj dari tinggi layar 16:9, dihitung ulang saat ukurannya berubah, seperti `useStageScale` |
| `ui/DayArc.tsx` | Prop `prolog` (bawaan `false`): tulisan "Prolog" dan label "Pukul {jam}, prolog" |
| `ui/NarrationBox.tsx` | Prop `nextLabel` (tulisan tombol lanjut; bawaan seperti sekarang), `paused` (teks per huruf berhenti di huruf yang sama dan bunyi teks tidak diputar), `ready` (untuk `aria-disabled`), dan `canPress` (diperiksa saat tekanan diterima; bila salah, tekanan diabaikan tanpa `onPress`) |
| `Game.tsx` | Rute pratinjau atau permainan; `PlayScreen` dengan `scale` dan `titleScale`; fokus judul pratinjau; `Placeholder` dihapus |
| `content/copy.ts` | Teks baru di bagian `title`, `howTo`, `setup`, `settings`, dan `prolog`, serta `topBar.prolog` dan `topBar.prologLabel`; `placeholder` dihapus |
| `content/teams.ts` | `PLAY_TEAMS` dihapus; `DEFAULT_TEAMS` tidak berubah |
| `engine/types.ts`, `engine/reducer.ts` | `BATAL_PENGATURAN` (bagian "Mesin") |
| `styles/game.css` | Kelas di bawah; aturan `.ss-placeholder*` dihapus; pasangan kurangi gerak; blok mode warna paksa |

Uji:

| Berkas | Isi |
|---|---|
| `__tests__/opening.test.ts` (baru) | Fungsi `opening.ts`, isi `PROLOG`, dan kesamaan `TITLE_ZONE` dengan `latar.py` (bagian "Rencana uji") |
| `__tests__/controls.test.ts` | Disesuaikan untuk fase `title`, `setup`, dan `prolog`, `Escape`, dan `replayActions` |
| `__tests__/layout.test.ts` | `parseRoute` tanpa `#main`, `TITLE_ZONE`, `TITLE_BAND`, dan `titleScaleForScreen` |
| `__tests__/reducer.test.ts` | `BATAL_PENGATURAN` |
| `e2e/judul-pengaturan-prolog.spec.ts` (baru) | Uji ujung ke ujung F-10 |
| `e2e/bantuan.ts` dan ketujuh berkas uji lama | Fungsi bersama pembuka permainan (bagian "Rencana uji") |

### Kelas CSS

Kelas baru berawalan `ss-`:

- layar judul: `ss-title`, `ss-title-backdrop`, `ss-title-zone`, `ss-title-name`, `ss-title-lead`, dan `ss-title-actions`;
- cara bermain: `ss-howto`, `ss-howto-head`, `ss-howto-title`, `ss-howto-body`, `ss-howto-col`, `ss-howto-label`, `ss-howto-steps`, `ss-howto-step`, `ss-howto-keys`, `ss-key`, dan `ss-howto-foot`;
- pengaturan kelas: `ss-setup`, `ss-setup-head`, `ss-setup-title`, `ss-setup-body`, `ss-setup-row`, `ss-setup-label`, `ss-setup-teams`, `ss-setup-team`, `ss-setup-team-icon`, `ss-setup-team-name`, `ss-setup-turns`, `ss-setup-note`, dan `ss-setup-foot`;
- pilihan bersama: `ss-options` dan `ss-option`, dengan `aria-pressed` dan `data-nonaktif`;
- dialog pengaturan: `ss-settings-button` (dengan `data-nonaktif`), `ss-settings-layer`, `ss-settings`, `ss-settings-title`, `ss-settings-rows`, `ss-settings-label`, `ss-settings-cell`, `ss-settings-note`, dan `ss-settings-foot`;
- atribut pada `.ss-play`: `data-fase` (nama fase), `data-prolog` (fase `prolog`), dan `data-kurangi-gerak` (`settings.reducedMotion` menyala).

Kotak nomor langkah memakai `ss-choice-key` F-05, panggung memakai kelas F-04, dan tombol memakai `ss-button`. Aturan arah tetikus selama masa tunggu mengikuti F-09. Tidak ada token `:root` baru.

### Perubahan dokumen (Build)

- `Design_System.md` naik ke versi 0.10:
  - bagian 3: letak layar judul (`bg_title` memenuhi 16:9 dengan kj, judul di `TITLE_ZONE`, dan tombol di pita y 157–180); cara bermain dan pengaturan kelas menutupi seluruh layar; prolog memakai tata letak permainan; dialog pengaturan di tengah layar dengan lapisan bening; tombol "Pengaturan" di bilah atas; lapisan 100 sampai 120;
  - bagian 4: kontras `ink` di atas langit pagi `#9ED8F5` (9,2:1) dan `#FFF1C9` (12,7:1) untuk judul;
  - bagian 5: gaya "Judul permainan", Press Start 2P 7u dengan tinggi baris 1,2, hanya untuk layar judul;
  - bagian 7: baris baru "Layar judul", "Cara bermain", "Pengaturan kelas", dan "Prolog", baris "Pengaturan" yang diperinci, serta tombol "Mulai adegan 1" di kotak narasi;
  - bagian 8: masa tunggu 600 ms di layar pembuka, Nara berjalan di layar judul, sapuan dari prolog ke adegan 1, kurangi gerak dari pengaturan game, dan lapisan bening 600 ms sesudah dialog pengaturan ditutup;
  - bagian 9: pilihan suara di pengaturan kelas dan dialog pengaturan memakai `settings.sound` yang sama dengan `M`.
- `Architecture.md` naik ke versi 0.12:
  - bagian 3: `Title.tsx`, `Setup.tsx`, dan `Settings.tsx` (F-10), `opening.ts`, `content/prolog.ts`, dan `judul-pengaturan-prolog.spec.ts`; `PlayScreen.tsx` tidak lagi disebut layar `#main` sementara;
  - bagian 6: `BATAL_PENGATURAN` di diagram dan di daftar aksi tambahan;
  - bagian 7: layar pembuka (F-10), skala layar judul, halaman yang dibuka dari layar judul, pratinjau sebagai alat tinjau tak bertaut, dan "Main lagi" yang hanya mengirim `MAIN_LAGI`;
  - bagian 9: `Esc`, pintasan yang tidak aktif di layar pembuka, dan tombol yang ditahan;
  - bagian 10: fokus dan pengumuman layar pembuka, kedua dialog, `aria-pressed`, dan wilayah pengumuman yang tetap sejak layar judul;
  - bagian 12: cakupan uji F-10;
  - bagian 13: pengaturan tidak disimpan (keputusan 4 November 2026), tanpa kolom isian.
- `PRD.md` bagian 17: keputusan 4 November 2026, yaitu tim diambil berurutan dari daftar dengan bawaan 3 tim dan jadwal giliran; panduan guru satu halaman dibuat sesudah F-10 dari teks cara bermain; kurangi gerak dikerjakan di F-10 sedangkan layar penuh tetap di F-13; layar "Tentang" dikerjakan di F-11; dan pengaturan tidak disimpan antarsesi.
- `AGENTS.md` naik ke versi 0.5. Bagian 5: baris F-10 ditambah "FR-17 sebagian (kurangi gerak)", baris F-11 ditambah "layar Tentang", dan baris F-13 menyebut FR-17 hanya untuk layar penuh.
- `PLAN.md`: status F-10, tautan laporan uji, dan "Catatan untuk Plan berikutnya":
  - catatan "Plan F-05" (pratinjau), "Plan F-06 sampai F-10" (layar kerangka dan `#main`), dan "Plan F-10" ditandai selesai;
  - Plan F-11: layar "Tentang" dengan tombol keempat di layar judul (ruangnya sudah diukur), jawaban S-6, dan nama di Design System bagian 13;
  - Plan F-13: `Esc` dan layar penuh, baris `F` di cara bermain, dan ikon suara D-05;
  - panduan guru satu halaman: dibuat sesudah F-10, sebelum M3.
- `Daftar_Aset.md`, `CREDITS.md`, dan `Verifikasi_Rujukan.md` tidak berubah.

### Perbedaan dengan daftar file di rencana

- `ui/hooks.ts` ikut berubah, untuk kait `useTitleScale`. Skala layar judul (tinggi layar ÷ 180) tidak bisa dihitung dari skala panggung, karena skala panggung dibulatkan.
- `Design_System.md` bagian 5 ikut berubah, karena usulan 1 menambah gaya "Judul permainan" 7u. Daftar rencana hanya menyebut bagian 3, 4, 7, 8, dan 9.
- `engine/types.ts`, `engine/reducer.ts`, dan `reducer.test.ts` berubah, karena usulan 3 "Kembali" pilihan (a) dipilih.
- `AGENTS.md` bagian 5 berubah, karena usulan 6a1 dan 6b1 dipilih.
- `StagePreview.tsx` tidak berubah, karena pratinjau dipertahankan (usulan 7a).
- `Stage.tsx` tidak berubah, tetapi kini juga dipakai layar judul dengan adegan semu, selain prolog.

Berkas lain sama dengan rencana.

## Aset

Tidak ada aset baru, dan tidak ada PNG yang berubah. F-10 memakai aset yang sudah Disetujui lewat manifest:

- `backgrounds.bg_title` (`bg/bg_title.png`, 320×180, C-01), dengan bidang langit tenang `TITLE_ZONE` yang diperiksa `build_assets.py` (`CALM_ZONES`) dan warna bayangan kaki `wood` di `floorShadows`. F-10 adalah fitur pertama yang menampilkan latar ini;
- `sprites.nara.walk` di layar judul, serta `talk`, `idle`, dan `happy` di prolog;
- `teamIcons` (D-07) di pengaturan kelas dan papan tim, `iconStrips.star` (D-03) lewat papan tim F-07, `icons.hak` dan `icons.kewajiban` (D-01 dan D-02) lewat panel indikator F-06, serta `icons.matahari` (D-11) lewat busur hari.

Kursor ▶ dan kotak nomor berupa teks. Ikon suara D-05 dan ikon layar penuh tidak dipakai. `manifest.ts`, `CREDITS.md`, `Daftar_Aset.md`, kit gambar, dan pramuat (`ui/preload.ts`) tidak berubah. Placeholder tidak diperlukan.

## Di luar cakupan

- Layar "Tentang" dan tombol keempat di layar judul, tautan dari galeri, dan pemeriksaan ketat rujukan (F-11).
- Panduan guru satu halaman, yang dibuat sesudah F-10 sebagai dokumen tersendiri (usulan 2a).
- Tombol layar penuh dan `F`, sisa bunyi FR-19, ikon suara D-05, pengatur volume, ulangi adegan dan kembali ke adegan sebelumnya, serta perbaikan klik ganda tombol bintang (F-13).
- Arti `Esc` di luar yang tertulis di sini: `Esc` di kartu dampak, kuis peran, dan layar penutup tetap tidak berpengaruh.
- Memilih tim tertentu, mengubah urutan giliran, nama tim baru, dan kolom isian apa pun.
- Mengubah jumlah tim di tengah permainan.
- Menyimpan pengaturan atau permainan di peramban, dan melanjutkan permainan sesudah halaman dimuat ulang (usulan 8a).
- "Kembali ke layar judul" atau "Akhiri permainan" di dialog pengaturan.
- Mengubah naskah, rujukan, `Verifikasi_Rujukan.md`, `content.test.ts`, aset, kit gambar, `manifest.ts`, `CREDITS.md`, `Daftar_Aset.md`, `Stage.tsx`, `Sprite.tsx`, `Meters.tsx`, `Teams.tsx`, `Timer.tsx`, `StarsAward.tsx`, `ImpactCard.tsx`, `RoleQuiz.tsx`, `Ending.tsx`, `Recap.tsx`, `Reflection.tsx`, `RecapSheet.tsx`, `StagePreview.tsx`, `ui/preload.ts`, file galeri, `vite.pages.config.ts`, `playwright.config.ts`, `package.json`, `pnpm-lock.yaml`, dan workflow.

## Kriteria penerimaan

- [ ] AC-1 **Alur dan alamat:**
  - `sehari-setara/`, `#`, `#main`, `#main-3`, `#main-4`, `#lain`, dan `#Main` membuka layar judul (`.ss-play[data-fase="title"]`) dengan "Mulai" berfokus;
  - dengan `Tab`, `Enter`, dan `Spasi` saja di 1280×720, layar judul, pengaturan kelas, ketiga layar prolog, dan narasi adegan 1 tampil berurutan, lalu tombol lanjut narasi adegan 1 berfokus;
  - di tengah diskusi, mengubah tanda pagar ke `#main` atau `#lain` tidak mengubah fase, adegan, maupun pengatur waktu; `#adegan-2` membuka pratinjau, dan "Tutup pratinjau" membuka layar judul dengan "Mulai" berfokus;
  - `.ss-placeholder`, "Permainan ini sedang dibuat.", "Lihat pratinjau panggung", dan "Coba alur permainan" tidak ada lagi di halaman. `Placeholder`, `PLAY_HASH`, `PLAY_HASHES`, `PLAY_TEAMS`, `startActions`, `initialPlayState`, dan `teamsFor` tidak ada lagi di `app/`.
- [ ] AC-2 **Layar judul** di keempat ukuran:
  - bingkai latar seukuran layar 16:9 (±1 px), berlatar `bg_title`, dengan garis pindai dan vinyet;
  - Nara `walk` beranimasi `ss-strip` 0,5 detik dengan `steps(4)` berulang; kotak sprite dan bayangan `wood` berada di letak tabel kali kj (±1 px);
  - judul Press Start 2P 7u dan kalimat pengantar Pixelify Sans 3,1u masing-masing satu baris, rata tengah di dalam `TITLE_ZONE`, dalam ±0,5u dari tabel;
  - tombol "Mulai", "Cara bermain", dan tautan "Kembali ke galeri" (`href="../"`) berurutan di dalam pita tombol, dalam ±0,5u dari tabel, tanpa luapan;
  - latar dan Nara tersembunyi dari pembaca layar, dan `<main>` bernama "Sehari Setara".
- [ ] AC-3 **Kurangi gerak di layar judul:** dengan `prefers-reduced-motion: reduce`, dan secara terpisah dengan kurangi gerak dari dialog pengaturan yang terbawa lewat "Main lagi", Nara tampil di bingkai pertama dan `document.getAnimations()` kosong.
- [ ] AC-4 **Masa tunggu layar judul**, dengan jam uji dijeda sebelum halaman dimuat dan dimajukan dalam dua langkah:
  - pada 599 ms, ketiga kontrol ber-`aria-disabled="true"`, dan klik, `Enter`, serta `Spasi` padanya tidak berpengaruh dan tidak berbunyi; sesudah 1 ms lagi, satu tekanan diterima;
  - `click` pada "Kembali ke galeri" ber-`defaultPrevented` benar pada 599 ms dan salah pada 600 ms;
  - aturan yang sama berlaku sesudah "Main lagi", sesudah "Kembali", dan sesudah dialog "Cara bermain" ditutup.
- [ ] AC-5 **Cara bermain:**
  - "Cara bermain" membuka dialog ber-`role="dialog"` dan `aria-modal="true"` bernama "Cara bermain", dan judulnya berfokus;
  - judul kolom, keenam langkah, kesembilan kotak tombol beserta teks pembaca layarnya, keterangan, dan "Tutup" persis sesuai bagian "Teks yang tampil";
  - `Tab` dan `Shift+Tab` hanya beredar antara judul dan "Tutup". "Tutup" dan `Esc` menutup dialog dengan satu bunyi klik, lalu fokus kembali ke "Cara bermain";
  - di keempat ukuran, banyak baris langkah dan keterangan sesuai tabel, sisa di bawah setiap kolom ≥ 14u, "Tutup" dalam ±0,5u dari tabel, dan tidak ada luapan;
  - `1`, `a`, `m`, `p`, `0`, serta `Spasi` dan `Enter` saat judul berfokus tidak berpengaruh dan tidak berbunyi.
- [ ] AC-6 **Pengaturan kelas, isi dan letak:**
  - saat pertama dibuka, "3 tim", "60 detik", dan "Nyala" ber-`aria-pressed="true"`, dan tombol lain `"false"`. Judul "Pengaturan kelas" berfokus, dan `<main>` bernama "Pengaturan kelas";
  - untuk 2, 3, dan 4 tim, daftar tim berisi nama, ikon bentuk, dan jadwal yang persis sesuai tabel, beserta kalimat pembaca layarnya; daftar bernama "Tim yang bermain";
  - ketiga grup bernama labelnya, dan grup suara dikaitkan dengan keterangannya;
  - di keempat ukuran dengan 2, 3, dan 4 tim, tidak ada luapan; sisa di bawah isi sesuai tabel (±0,5u), ukuran huruf sesuai tabel (±0,05u), dan tombol kaki dalam ±0,5u dari tabel;
  - urutan Tab sesuai bagian "Fokus".
- [ ] AC-7 **Pilihan dan pengumuman:**
  - memilih jumlah tim lain mengubah daftar tim, menulis pengumuman jumlah tim persis ke wilayah `role="status"`, dan memutar satu bunyi klik;
  - memilih durasi lain memutar satu bunyi klik tanpa pengumuman. Menekan pilihan yang sudah aktif tidak berbunyi dan tidak menulis pengumuman;
  - `Esc`, `M`, angka, dan huruf di layar ini tidak berpengaruh dan tidak berbunyi;
  - wilayah `role="status"` kosong saat prolog layar 1 tampil.
- [ ] AC-8 **"Kembali":** sesudah 600 ms, "Kembali" membuka layar judul dengan "Mulai" berfokus. Bila pengaturan kelas dibuka lagi, pilihan terakhir (misalnya 4 tim dan 30 detik) masih aktif, dan permainan yang dimulai sesudahnya memakai pilihan itu.
- [ ] AC-9 **"Mulai permainan"**, untuk 2, 3, dan 4 tim dan untuk 30, 60, dan 90 detik:
  - papan tim di prolog dan adegan 1 berisi tim pilihan berurutan dengan 0 bintang, dan Tim Mangga bertanda "Giliran";
  - pengatur waktu adegan 1 mulai dari 0:30, 1:00, atau 1:30, dengan isi `role="timer"` "Sisa 30 detik", "Sisa 1 menit", atau "Sisa 1 menit 30 detik", dan pengumuman "Waktu diskusi {durasi} dimulai.".
- [ ] AC-10 **Suara di pengaturan kelas**, dengan perekam bunyi F-07: sesudah "Mati", klik "Mulai permainan", tekanan di prolog, dan adegan 1 tidak menghasilkan bunyi. Sesudah "Nyala", tepat satu klik diputar sebagai tanda, lalu setiap tekanan yang diterima berbunyi lagi.
- [ ] AC-11 **Isi prolog** di keempat ukuran:
  - bilah atas berlatar pagi `rgb(255, 217, 168)` dengan jam 06.15, matahari di titik pertama, tulisan "Prolog", dan label "Pukul 06.15, prolog";
  - panggung berlatar `bg_title` dengan Nara di x 160: `talk`, `idle`, dan `happy` di layar 1, 2, dan 3, dan label panggung sesuai teks alternatif;
  - indikator bernilai 50 dan 50, papan tim dengan tim pertama ber-`data-giliran`, tanpa pengatur waktu dan bintang alasan;
  - tab "Prolog", teks ketiga layar yang persis, isi wilayah `aria-live` yang sama dengan teks, dan tombol "Lanjut", "Lanjut", "Mulai adegan 1";
  - banyak baris teks, sisa di atas tombol, dan letak tombol sesuai tabel (±0,5u), tanpa luapan;
  - teks per huruf 40 huruf per detik dengan bunyi teks seperti narasi; `Spasi` dan `Enter` menampilkan teks sekaligus lalu maju; `M` bekerja; `<main>` bernama "Prolog".
- [ ] AC-12 **Dari prolog ke adegan 1:** tanpa kurangi gerak, "Mulai adegan 1" memutar sapuan berwarna langit pagi (`.ss-wipe[data-time="pagi"]`). Dengan jam uji, panggung masih berlatar `bg_title` pada 100 ms dan sudah adegan 1 pada 300 ms. Dengan kurangi gerak, pergantiannya pudar 75 + 75 ms tanpa sapuan. Sesudahnya bilah atas bertuliskan "Adegan 1/6", dan tombol lanjut narasi adegan 1 berfokus.
- [ ] AC-13 **Masa tunggu prolog dan tekanan ganda:**
  - di setiap layar prolog pada 599 ms, tombol lanjut ber-`aria-disabled="true"`, dan klik, `Enter`, `Spasi`, klik di kotak narasi, serta pintasan tidak berpengaruh dan tidak berbunyi; pada 600 ms satu tekanan diterima;
  - klik ganda pada "Mulai permainan" berakhir di prolog layar 1. Dengan teks per huruf menyala, teksnya tetap muncul per huruf; dengan kurangi gerak, layar 1 tetap tampil;
  - klik ganda pada "Main lagi" berakhir di layar judul tanpa membuka pengaturan kelas;
  - `Enter` yang ditahan (`keyboard.down` berulang) pada "Mulai" sesudah masa tunggu hanya membuka pengaturan kelas, dan pada "Mulai permainan" hanya membuka prolog layar 1. Di prolog, setiap tekanan baru hanya memajukan satu langkah.
- [ ] AC-14 **Dialog pengaturan, membuka dan menutup:**
  - `Esc` dan tombol "Pengaturan" membuka dialog di fase `prolog`, `intro`, `discuss`, dan `stars`, dengan satu bunyi klik. Dialog ber-`role="dialog"` dan `aria-modal="true"`, bernama "Pengaturan", dan judulnya berfokus;
  - `Tab` dan `Shift+Tab` beredar di kesepuluh tombol dialog. "Tutup" dan `Esc` menutupnya dengan satu bunyi klik;
  - fokus kembali ke tombol "Pengaturan" bila dialog dibuka dengan tombol itu, ke tombol lanjut narasi atau ajakan bintang bila dibuka dengan `Esc` dari sana, dan ke tombol "Pengaturan" bila `Esc` ditekan saat fokus di `body`;
  - di fase `reaction`, `impact`, dan `quiz`, selama sapuan atau pudar, dan di layar akhir, `Esc` tidak berpengaruh. Tombol "Pengaturan" ber-`data-nonaktif` dan `aria-disabled="true"`, dan tidak berbunyi saat ditekan. Di layar judul, pengaturan kelas, rekap, dan refleksi, tombol itu tidak ada;
  - letak dan ukuran dialog serta tombol "Pengaturan" sesuai tabel (±0,5u) di keempat ukuran, juga dengan kedua catatan tambahan, tanpa luapan. Setiap catatan satu baris. Tombol "Pengaturan" tidak menyentuh busur hari maupun tulisan kanan "Prolog", "Adegan 1/6" sampai "Adegan 6/6", dan "Akhir hari".
- [ ] AC-15 **Lapisan bening:**
  - selama dialog terbuka, klik pada letak tombol pilihan C, tombol pengatur waktu, dan kotak narasi tidak berpengaruh dan tidak berbunyi, dan dialog tetap terbuka;
  - klik ganda pada "Tutup" saat diskusi tidak memilih apa pun (`history` tetap kosong dan fase tetap `discuss`), dan saat narasi tidak mengubah layar narasi;
  - dengan jam uji, klik pada pilihan C 599 ms sesudah dialog ditutup tidak berpengaruh, sedangkan klik pada 600 ms memilih C.
- [ ] AC-16 **Perubahan di dialog:**
  - suara "Mati" membuat tekanan berikutnya tanpa bunyi, dan "Nyala" memutar tepat satu klik;
  - kurangi gerak "Nyala" memberi `.ss-play` atribut `data-kurangi-gerak`, langsung menghentikan animasi sprite dan ikon busur hari, dan membuat pergantian adegan berikutnya pudar tanpa angka melayang dan pop bintang;
  - teks per huruf "Mati" membiarkan layar narasi yang sedang tampil tetap per huruf, sedangkan layar berikutnya langsung lengkap tanpa bunyi teks;
  - durasi "30 detik" yang dipilih saat narasi membuat diskusi adegan itu mulai dari 0:30. Durasi yang dipilih saat diskusi tidak mengubah diskusi itu, dan diskusi adegan berikutnya mulai dari durasi baru;
  - menekan pilihan yang sudah aktif tidak berbunyi;
  - dialog tidak berisi pilihan tim, dan papan tim tidak berubah.
- [ ] AC-17 **Berhenti selama dialog:**
  - saat diskusi berjalan, dialog dibuka lalu jam uji dimajukan 10 detik. Angka pengatur waktu dan isi `role="timer"` tidak berubah, tidak ada pengumuman baru, dan "Jeda" tidak ber-`aria-pressed="true"`;
  - sesudah dialog ditutup, 999 ms tidak mengubah angka, dan 1 ms lagi mengurangi satu detik;
  - saat teks per huruf berjalan, 5 detik dengan dialog terbuka tidak menambah huruf maupun bunyi teks, dan teks berlanjut sesudah dialog ditutup.
- [ ] AC-18 **Kurangi gerak dari komputer:** dengan `prefers-reduced-motion: reduce`, baris "Kurangi gerak" menampilkan "Nyala" ber-`aria-pressed="true"`, kedua tombolnya ber-`data-nonaktif` dan `aria-disabled="true"`, dan kedua catatan tambahan tampil. Menekan kedua tombol itu tidak berpengaruh dan tidak berbunyi, dan `.ss-play` tidak mendapat `data-kurangi-gerak`.
- [ ] AC-19 **"Main lagi"**, sesudah 600 ms di refleksi:
  - layar judul tampil dengan "Mulai" berfokus, dan wilayah `role="status"` kosong;
  - pengaturan kelas menampilkan jumlah tim dan durasi permainan sebelumnya, termasuk durasi yang diubah lewat dialog, dan suara yang dimatikan tetap mati;
  - permainan kedua memakai tim dari pengaturan baru dengan `history` kosong dan kuis yang belum dijawab, dan kartu dampak, kuis, serta bintang bekerja di keenam adegan;
  - `Enter` yang ditahan sesudah "Main lagi" tidak menekan "Mulai".
- [ ] AC-20 **Permainan penuh dengan keyboard.** Kesembilan pasangan berikut dimainkan dari layar judul sampai refleksi di 1280×720, dengan keyboard saja dan jam uji dijeda:

  | Jumlah tim | 30 detik | 60 detik | 90 detik |
  |---|---|---|---|
  | 2 | Warga Setara (semua B) | Hampir Seimbang (B-B-B-C-C-C) | Hari yang Berat (semua A) |
  | 3 | Hampir Seimbang | Hari yang Berat | Warga Setara |
  | 4 | Hari yang Berat | Warga Setara | Hampir Seimbang |

  Di setiap adegan, tim yang bergiliran sesuai jadwal dan angka awal pengatur waktu sesuai durasi. Di adegan 2 setiap permainan, waktu dihabiskan dengan `runFor` sampai tampil "Waktunya memilih". Jenis akhir sesuai tabel. Dua permainan dimulai lewat "Main lagi" dari permainan sebelumnya dengan pengaturan lain.
- [ ] AC-21 **Keyboard di layar pembuka:** di layar judul, dialog "Cara bermain", pengaturan kelas, dan dialog pengaturan, tombol `1`, `2`, `a`, `p`, `t`, `s`, `0`, `m`, dan `ArrowRight`, serta `Spasi` dan `Enter` saat fokus tidak di tombol, tidak berpengaruh dan tidak berbunyi. `Esc` di layar judul tanpa dialog dan di pengaturan kelas tidak berpengaruh. Tekanan bersama Ctrl, Alt, atau Meta diabaikan. `Esc` yang ditahan tidak membuka dan menutup dialog berulang kali.
- [ ] AC-22 **Fokus terlihat dan kontras:**
  - setiap tombol baru yang berfokus lewat `Tab` berlatar `sun` dengan kursor ▶, dan judul yang berfokus bergaris 2 px sesuai bagian "Fokus";
  - rasio kontras terukur ≥ 4,5:1 untuk semua teks di layar baru di keempat ukuran, termasuk pilihan aktif, tombol tertahan, tombol nonaktif, dan catatan;
  - warna piksel `bg_title` di dalam `TITLE_ZONE` hanya `#9ED8F5` dan `#FFF1C9`, dengan kontras terhadap `ink` ≥ 9:1.
- [ ] AC-23 **Pembaca layar:**
  - nama `<main>` sesuai bagian "Pembaca layar" di setiap layar;
  - wilayah `aria-live` dan `role="status"` tetap elemen yang sama sejak layar judul sampai refleksi (ditandai atribut uji di layar judul, lalu diperiksa di refleksi);
  - nama kedua dialog, grup pilihan, dan daftar tim; `aria-describedby` catatan; serta kalimat tim dan teks kotak tombol sesuai cuplikan ARIA.
- [ ] AC-24 **Bunyi**, dengan perekam bunyi F-07: setiap tekanan yang diterima di layar baru (bagian "Bunyi") menghasilkan tepat satu klik. Tekanan yang diabaikan dan "Kembali ke galeri" menghasilkan 0 klik.
- [ ] AC-25 **Mode warna paksa:** dengan `forced-colors: active`, `clip-path` dialog pengaturan, kotak tombol keyboard, dan tombol pilihan bernilai `none`, dan semua tulisan tetap ada.
- [ ] AC-26 **Pratinjau panggung:** ke-24 alamat pratinjau tetap lulus uji F-04 yang disesuaikan, dan "Tutup pratinjau" membuka layar judul.
- [ ] AC-27 **Uji unit:**
  - `opening.test.ts` lulus:
    - `teamsForCount` untuk 2, 3, dan 4 tim;
    - `turnScenes` sama dengan `activeTeamIndex` untuk keenam adegan dan ketiga jumlah tim, dan `turnText`, `listText`, serta `teamTurnSentence` sesuai bagian "Teks yang tampil";
    - `teamCountAnnouncement` untuk 2, 3, dan 4 tim;
    - `setupDraftFrom` untuk keadaan awal (3 tim, 60 detik), sesudah "Main lagi" dengan 2 dan 4 tim, dan untuk durasi yang diubah;
    - `setupActions` yang dijalankan reducer menghasilkan fase `prolog` dengan tim dan durasi itu;
    - `settingsOpenable` untuk semua fase, dengan dan tanpa pergantian adegan;
    - `settingsView` untuk keempat kombinasi pengaturan komputer dan game;
    - `openingScene` tidak mengubah adegan asalnya;
    - setiap teks `PROLOG` paling banyak tiga kalimat menurut `countSentences`;
    - `TITLE_ZONE` sama dengan `TITLE_ZONE` di `scripts/game/art/latar.py`;
  - `controls.test.ts` disesuaikan:
    - tanpa pintasan di fase `title` dan `setup`;
    - `Spasi`, `Enter`, dan `M` berlaku di fase `prolog`;
    - `Escape` menghasilkan perintah `pengaturan` hanya di fase `prolog`, `intro`, `discuss`, dan `stars`;
    - `replayActions()` hanya berisi `MAIN_LAGI`;
    - dari `title`, `MULAI`, `setupActions` (2, 3, dan 4 tim; 30, 60, dan 90 detik), dan `LANJUT` membawa keadaan ke `intro` adegan 1, lalu `NARASI_SELESAI` membuat pengatur waktu sesuai durasi;
  - `layout.test.ts` disesuaikan: `parseRoute` mengembalikan `null` untuk `""`, `#`, `#main`, `#main-3`, `#main-4`, dan `#lain`, dan rute pratinjau untuk `#adegan-N`; `TITLE_BAND`; dan `titleScaleForScreen` untuk keempat tinggi layar;
  - `reducer.test.ts`: `BATAL_PENGATURAN` membawa `setup` ke `title` dengan tim, pengaturan, dan pengatur waktu tetap, dan di fase lain mengembalikan objek yang sama;
  - uji unit lain lulus tanpa perubahan, termasuk F-02 AC-14 untuk seluruh `engine/`.
- [ ] AC-28 **Uji lama dan build:**
  - semua uji ujung ke ujung lama yang disesuaikan lulus;
  - `build:pages` lulus; JS permainan ≤ 150 KB gzip tanpa penanda `__THREE__`; semua `src` dan `href` HTML permainan relatif;
  - keempat berkas galeri (`index.html`, `main-*.css`, `main-*.js`, dan `jsx-runtime-*.js`) identik byte dengan build `main` commit `d9212ad`, juga sesudah semua dokumen F-10 ditulis.
- [ ] AC-29 **Kode, privasi, dan cakupan:**
  - `tsc --noEmit` tanpa galat, dan ESLint `--max-warnings 0` pada semua berkas kode baru dan yang diubah; tidak ada `any`; `engine/` hanya berubah untuk `BATAL_PENGATURAN` dan tetap tanpa pengatur waktu;
  - sesudah berpindah ke `#adegan-1` saat masa tunggu, saat dialog terbuka, dan saat lapisan bening 600 ms, tidak ada `setTimeout` maupun `setInterval` yang masih aktif, dan pendengar `keydown`, `keyup`, `pointerdown`, serta `pointerup` di `window` kembali 0;
  - di semua layar tidak ada `input`, `textarea`, `select`, atau unsur `contenteditable`. Selama satu permainan penuh, `Storage.prototype.setItem` dan `indexedDB.open` tidak pernah dipanggil, tidak ada permintaan ke luar situs, dan tidak ada galat konsol maupun respons 4xx/5xx;
  - `git diff --name-status` hanya memuat berkas yang disebut spesifikasi ini dan tangkapan layar di `tests/F-10/`. `scenes.ts`, `roles.ts`, `references.ts`, `endings.ts`, `content.test.ts`, `Verifikasi_Rujukan.md`, `package.json`, dan `pnpm-lock.yaml` tidak berubah, sehingga tidak ada kotak yang dicentang. `content:check` dan `test` lulus.

## Rencana uji

| Langkah | Cara | Kriteria |
|---|---|---|
| 1 | `install --frozen-lockfile`, `content:check`, lalu `test` | AC-27, AC-29 |
| 2 | `build:pages`. Bandingkan berkas galeri dengan build `main` commit `d9212ad`, juga sesudah semua dokumen F-10 ditulis. Periksa ukuran gzip, penanda three.js, dan path relatif | AC-28 |
| 3 | `test:e2e`: uji lama yang disesuaikan, ditambah `e2e/judul-pengaturan-prolog.spec.ts` | AC-1 sampai AC-26, AC-28 |
| 4 | Jam uji: `page.clock.pauseAt` sebelum halaman dimuat, waktu hanya dimajukan dengan `page.clock.runFor`, dalam dua langkah sesudah unsur tampil (layar tampil, lalu 599 ms dan 1 ms) | AC-4, AC-12, AC-13, AC-15, AC-17 |
| 5 | Animasi: `getAnimations()` dan Web Animations API, seperti uji sapuan F-05 dan pop F-07 | AC-3, AC-12, AC-16 |
| 6 | Bunyi: perekam bunyi skrip awal halaman uji F-07 (`e2e/suara.spec.ts`) | AC-10, AC-11, AC-16, AC-24 |
| 7 | Pembaca layar: isi wilayah `aria-live` dan `role="status"`, nama lewat `toHaveAccessibleName`, dan cuplikan ARIA | AC-23 |
| 8 | Kesembilan permainan penuh (bujur sangkar latin di AC-20) | AC-20 |
| 9 | Salin tangkapan layar ke `docs/sehari-setara/tests/F-10/` (daftar di bawah) | Bukti AC-2, AC-5, AC-6, AC-11, AC-14 |
| 10 | `tsc --noEmit -p tsconfig.json --incremental false`, lalu ESLint; cari nama dan teks yang dihapus di `app/` dan `e2e/` | AC-1, AC-29 |
| 11 | `git diff --name-status` terhadap keadaan sebelum F-10, dan periksa diff dokumen | AC-29 |
| 12 | Daftar periksa manual AGENTS bagian 9 | Tidak ada AC khusus |

Lingkungan uji: Chromium 141 untuk `@playwright/test` 1.56.1 tidak tersedia di lingkungan agen. Uji dijalankan dengan Chromium 153 lewat berkas konfigurasi pengganti di luar repositori, yang mengimpor `playwright.config.ts` dan hanya menambah jalur browser (keputusan Gerbang 1 F-07 nomor 10). Bila satu perintah terlalu lama, uji dijalankan dalam beberapa bagian dengan konfigurasi yang sama, dan tangkapan layar disalin sesudah bagian yang membuatnya.

Cara uji yang perlu diperhatikan:

- Klik pada tombol ber-`aria-disabled` memakai `click({ force: true })`, karena Playwright menunggu tombol seperti itu aktif (uji F-06 sampai F-09).
- Klik ganda memakai `dblclick()`. Klik pada lapisan bening memakai `page.mouse.click(x, y)` di tengah kotak tombol pilihan C, kotak tombol pengatur waktu, atau kotak narasi yang diukur sebelum dialog dibuka.
- Tombol yang ditahan diuji dengan `keyboard.down("Enter")` berulang, lalu `keyboard.up("Enter")` (F-09).
- Untuk `Esc` dengan fokus di `body`, fokus dilepas lebih dulu dengan `document.activeElement.blur()` lewat `page.evaluate`.
- "Kembali ke galeri" tidak dibiarkan berpindah halaman. Uji memasang pendengar `click` di `window` yang mencatat `defaultPrevented` lalu memanggil `preventDefault()` (F-09).
- Penyimpanan diperiksa lewat skrip awal halaman (`addInitScript`) yang mencatat setiap panggilan `Storage.prototype.setItem` dan `indexedDB.open`.
- Warna `TITLE_ZONE` diperiksa dengan menggambar `bg_title` ke kanvas di halaman, lalu membaca piksel x 64–256 dan y 6–56.
- Uji yang mengukur atau memotret menunggu gambar termuat dan ter-*decode* dengan fungsi `settle`, yang kini juga mencakup latar dan sprite layar judul serta ikon tim di pengaturan kelas.
- Uji yang menghitung bunyi sejak adegan 1 mengosongkan catatan perekam bunyi sesudah langkah pembuka.

Penyesuaian uji lama: `e2e/bantuan.ts` mendapat dua fungsi bersama.

- `startGame(page, { teams = 2, seconds = 60, paused = false })` berjalan dari layar judul sampai narasi adegan 1:
  1. menunggu "Mulai" berfokus, menunggu masa tunggu (`page.clock.runFor(600)` sesudah layar tampil bila jam dijeda), lalu `Enter`;
  2. di pengaturan kelas, menunggu judul berfokus dan masa tunggu, lalu memilih jumlah tim dan durasi dengan `Tab` dan `Enter` bila belum aktif, kemudian `Tab` ke "Mulai permainan" dan `Enter`;
  3. di setiap layar prolog, menunggu masa tunggu lalu `Enter` (dua kali bila teks per huruf masih berjalan);
  4. sesudah "Mulai adegan 1", menunggu pergantian selesai (`runFor(400)` bila jam dijeda) sampai tombol lanjut narasi adegan 1 berfokus.

  Nilai bawaan `teams = 2` sama dengan `#main` lama.
- `playAgain(page, paused, options)`: menekan "Main lagi" seperti sekarang, lalu `startGame` dengan `options`, sehingga uji yang memanggilnya tetap berakhir di narasi adegan 1.

Keenam fungsi `openPlay` di berkas uji lama memanggil `startGame`. `#main-3` dan `#main-4` menjadi `teams: 3` dan `teams: 4`. Pemeriksaan layar kerangka diganti pemeriksaan layar judul. Uji bunyi menghitung klik sejak adegan 1. Uji yang memakai "Main lagi" atau memuat ulang halaman berlanjut lewat layar judul, dan uji yang berpindah jumlah tim di tengah uji membuka halaman lagi. Berkas yang disesuaikan: `sehari-setara.spec.ts`, `alur-permainan.spec.ts`, `kartu-dampak.spec.ts`, `kuis-peran.spec.ts`, `suara.spec.ts`, `tim-waktu-bintang.spec.ts`, dan `akhir-rekap-refleksi.spec.ts`. Menurut percobaan Plan, fungsi bersama saja sudah membuat 62 uji lulus, dan 35 uji lain memerlukan penyesuaian di atas [Rencana].

Tangkapan layar di `tests/F-10/`:

| Berkas | Isi |
|---|---|
| `judul_1280x720.png`, `judul_1024x768.png`, `judul_1920x1080.png` | Layar judul dengan "Mulai" berfokus |
| `cara_bermain_1280x720.png`, `cara_bermain_1024x768.png`, `cara_bermain_1920x1080.png` | Dialog "Cara bermain" |
| `pengaturan_kelas_2tim_1280x720.png`, `pengaturan_kelas_4tim_1280x720.png`, `pengaturan_kelas_4tim_1024x768.png`, `pengaturan_kelas_4tim_1920x1080.png` | Pengaturan kelas dengan 2 dan 4 tim |
| `prolog_1_1280x720.png`, `prolog_2_1280x720.png`, `prolog_3_1280x720.png`, `prolog_3_1024x768.png`, `prolog_1_1920x1080.png` | Ketiga layar prolog |
| `dialog_pengaturan_1280x720.png`, `dialog_pengaturan_1024x768.png`, `dialog_pengaturan_1920x1080.png` | Dialog pengaturan saat diskusi |
| `dialog_pengaturan_kurangi_gerak_komputer_1280x720.png` | Dialog pengaturan dengan kedua catatan tambahan |
| `pengaturan_nonaktif_kartu_1280x720.png` | Tombol "Pengaturan" nonaktif selama kartu dampak |

Daftar periksa manual AGENTS bagian 9:

- Bisa dimainkan sampai akhir hanya dengan keyboard: dibuktikan uji AC-1 dan AC-20.
- Mode kurangi gerak mematikan sapuan dan animasi sprite: dibuktikan uji AC-3, AC-16, dan AC-18.
- Tampilan rapi di 1024×768 dan 1920×1080: diperiksa dari tangkapan layar.
- Keterbacaan layar judul, pengaturan kelas, dan cara bermain dari bangku belakang, kenyamanan teks cara bermain dan prolog bagi guru dan siswa, kelancaran di laptop kelas bawah, dan peramban lain: dicatat "belum diuji", untuk dicek pemilik proyek.

Hasil uji ditulis di `docs/sehari-setara/tests/F-10-hasil.md` (templat 11.3).
