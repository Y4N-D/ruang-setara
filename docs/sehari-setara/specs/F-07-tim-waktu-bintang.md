# F-07 — Tim, giliran, bintang alasan, pengatur waktu, serta bunyi klik dan teks

| | |
|---|---|
| Status | Disetujui 26 Oktober 2026 (balasan `Spesifikasi disetujui: F-07`; saran S-1 sampai S-8 dipakai; S-6 menunggu jawaban). Catatan Build ditandai **[Build]** |
| Tanggal | 26 Oktober 2026 |
| Rencana | `docs/sehari-setara/PLAN.md`, entri F-07 (disetujui 26 Oktober 2026 dengan balasan `Setuju: F-07`; kesepuluh usulan diterima; durasi diskusi bawaan tetap 60 detik) |
| Tambahan pemilik proyek | Dalam balasan yang sama: bunyi teks gaya B, bunyi klik tombol gaya A, bunyi teks setiap 2 huruf, dan tinggi nada teks "Tinggi", dipilih lewat halaman "Uji suara Sehari Setara" |

## Ringkasan

F-07 membuat layar permainan `sehari-setara/#main` bisa dijalankan guru bersama tim-tim di kelas:

1. Panel kanan menampilkan papan tim: bentuk, nama, dan jumlah bintang setiap tim. Tim yang sedang bergiliran ditandai ▶, bingkai, dan tulisan "Giliran".
2. Selama diskusi, pengatur waktu di bawah papan menghitung mundur 60 detik dengan batang 12 blok dan angka menit:detik. Guru bisa menjeda, menambah 30 detik, atau melewati diskusi lewat tombol atau `P`, `T`, `S`. Saat waktu habis tampil "Waktunya memilih", dan tidak ada pilihan yang diambil otomatis.
3. Sesudah tombol "Lanjut" kartu dampak, permainan berhenti di fase bintang. Guru memberi 0, 1, atau 2 bintang alasan kepada tim yang bergiliran lewat tombol atau `0` `1` `2`. Bintang muncul dengan animasi pop 3 bingkai, lalu adegan berganti.
4. Pembaca layar mendapat pengumuman per peristiwa (diskusi dimulai, sisa 10 detik, waktu habis, jeda, tambah, lewati, bintang), tidak setiap detik.
5. Panggung disembunyikan selama kartu dampak tampil, sehingga pita panggung tipis di atas kartu (Temuan 5 laporan F-06) hilang.
6. Alamat uji `#main-3` dan `#main-4` membuka permainan yang sama dengan tiga dan empat tim.
7. Bunyi: klik untuk setiap tekanan yang diterima permainan, dan bunyi teks setiap 2 huruf saat narasi muncul per huruf, dengan nada tinggi dan volume 60%. Tombol `M` mematikan dan menyalakan suara.

Kuis peran tetap dilewati tanpa ditampilkan sampai F-08. `engine/` tidak berubah.

Asal setiap nilai ditandai:

| Tanda | Arti |
|---|---|
| **[Dokumen]** | Dari Design System, Architecture, atau PRD; bagiannya disebut |
| **[Pemilik]** | Keputusan pemilik proyek: usulan 1–10 entri F-07 `PLAN.md` (Gerbang 1) dan pilihan bunyi 26 Oktober 2026 |
| **[Ukur]** | Diukur dengan huruf asli di Chromium 153 pada empat ukuran layar, atau dengan naskah dan berkas bunyi asli, dalam percobaan di luar repositori (26 Oktober 2026) |
| **[DRAF]** | Usulan baru dari agen. Mohon ditinjau |

Maket papan tim, pengatur waktu, dan bintang alasan sudah dikirim lewat percakapan saat Plan dan tidak disimpan di repositori. Tangkapan layar hasil sebenarnya disimpan di `tests/F-07/` pada tahap Test.

## Yang diputuskan di Gerbang 2

Usulan Gerbang 1 sudah diterima, jadi daftar ini hanya memuat hal baru dari tambahan bunyi, ditambah satu konfirmasi. Spesifikasi ditulis dengan saran di kolom kedua. Sebutkan nomor butir bila memilih alternatifnya.

| No. | Hal | Saran (dipakai spesifikasi ini) | Alternatif |
|---|---|---|---|
| S-1 | Format berkas bunyi | WAV persis seperti di halaman uji (2.028 dan 1.454 byte), karena itulah bunyi yang Anda dengar dan pilih. Architecture bagian 8 dan Design System bagian 9, yang menyebut MP3, disesuaikan | MP3 64 kbps (1.088 byte per berkas). Di Chromium, panjang dan awal bunyinya sama dengan WAV, kemiripan bentuk gelombangnya 0,993 (klik) dan 1,000 (teks), dan puncak klik turun sekitar 1 dB [Ukur]. Perlu didengar ulang |
| S-2 | Kapan klik berbunyi | Sekali untuk setiap tekanan yang diterima permainan, lewat tetikus, sentuhan, maupun keyboard, termasuk pintasan. Tekanan yang diabaikan tidak berbunyi | Juga saat fokus atau arah tetikus berpindah ("Arahkan/pilih" di Design System bagian 9). Lebih ramai di kelas |
| S-3 | Kerapatan bunyi teks | Sesuai pilihan Anda: setiap 2 huruf. Teks game muncul 40 huruf per detik (F-05), jadi bunyinya sekitar 16,5 kali per detik. Di halaman uji, yang memunculkan sekitar 28,6 huruf per detik, sekitar 11,8 kali per detik [Ukur] | Setiap 3 huruf: sekitar 11,1 kali per detik, paling mirip dengan yang terdengar di halaman uji |
| S-4 | Mematikan suara | Tombol `M`, yang sudah tercantum di Architecture bagian 9, dengan pengumuman pembaca layar dan tanpa ikon baru. Bawaannya menyala | (a) Ditambah tombol ikon suara D-05 di ujung kanan bilah atas; (b) belum ada cara mematikan sampai pengaturan F-10 |
| S-5 | Tik pelan di sepuluh detik terakhir (Design System bagian 7 dan 9) | Belum di F-07, karena belum ada bunyi tik yang dipilih. Sepuluh detik terakhir tetap ditandai warna `mango` dan pengumuman | Bunyi teks gaya B bernada rendah (laju 0,85) sekali per detik selama sepuluh detik terakhir |
| S-6 | Asal bunyi dan lisensinya | **Perlu jawaban Anda:** siapa atau alat apa yang membuat bunyi di halaman uji, dan lisensinya. Jawaban ini masuk `CREDITS.md` dan Design System bagian 13 ("Efek suara dibuat dengan [nama alat], [lisensi]"). Bila bunyi itu dibuat Claude dengan kode, tulisannya "Dibuat dengan kode oleh Claude (Anthropic)" | — |
| S-7 | Durasi diskusi bawaan | Tetap 60 detik, karena balasan `Setuju: F-07` tidak menyebut durasi lain | 30 atau 90 detik: `DEFAULT_SETTINGS`, ujinya, serta PRD bagian 16 dan 17 ikut berubah (usulan 7 rencana) |
| S-8 | Status bunyi di `Daftar_Aset.md` | Bagian baru "E. Efek suara" berisi kedua bunyi dengan status "Disetujui (26 Okt)", karena keduanya Anda pilih sendiri | Hanya dicatat di `CREDITS.md` |

## Kaitan PRD

| Acuan | Yang dipenuhi F-07 |
|---|---|
| FR-05 | Pengatur waktu diskusi yang bisa dijeda, ditambah 30 detik, atau dilewati guru, lewat tombol dan `P` `T` `S`; "Waktunya memilih" tanpa pilihan otomatis |
| FR-06 | Giliran tim berotasi otomatis per adegan; tim aktif ditandai ▶, bingkai, dan tulisan "Giliran" |
| FR-09 | Guru memberi 0, 1, atau 2 bintang alasan kepada tim aktif; papan skor tim selalu terlihat, kecuali saat kartu dampak terbuka |
| FR-02 (sebagian) | Papan menampung 2–4 tim dengan warna, bentuk, dan nama dari `content/teams.ts`; durasi bawaan 60 detik. Layar pengaturan kelas tetap milik F-10 |
| FR-16 (sebagian) | `P`, `T`, `S`, `0` `1` `2`, dan `M` (Architecture bagian 9) |
| FR-19 (sebagian) | Bunyi klik. Bunyi teks per huruf adalah tambahan pemilik proyek dan belum tercantum di PRD maupun Design System bagian 9 |
| PRD bagian 9 | Bintang alasan 0–2 untuk tim aktif, satu-satunya unsur kompetitif |
| PRD bagian 10 | Empat ukuran layar, keyboard, kurangi gerak, kontras teks ≥ 4,5:1, makna tidak hanya lewat warna |
| Design System bagian 3, 7, 8, 9 | Panel kanan; pengatur waktu, papan tim, dan bintang alasan; pop bintang dan kurangi gerak; volume bawaan 60% |
| Architecture bagian 5, 6, 8, 9, 10 | `timer`, `teams`, dan `settings` di `GameState`; aksi pengatur waktu dan fase `stars`; aset lewat manifest dan dimuat setelah interaksi pertama; tombol; pengumuman dan fokus |
| Keputusan Gerbang 1 | Usulan 1–10 entri F-07 `PLAN.md` |

## Perilaku

### Urutan satu adegan

| Fase | Panel kanan | Panel bawah | Panggung | Bunyi |
|---|---|---|---|---|
| `intro` | Papan tim | Kotak narasi (F-05) | Situasi (F-05) | Bunyi teks selama teks muncul per huruf; klik untuk tekanan yang diterima |
| `discuss` | Papan tim dan pengatur waktu | Pertanyaan dan pilihan (F-05) | Situasi | Klik |
| `reaction` | Papan tim | Baris status dan pilihan terkunci (F-05) | Reaksi | Tidak ada |
| `impact` | Tertutup kartu dampak | Kosong (F-06) | Disembunyikan | Klik pada "Lanjut" kartu |
| `quiz` (adegan 5) | Tidak pernah tampil sendiri: dilewati dalam tekanan "Lanjut" kartu sampai F-08 | | | |
| `stars` | Papan tim dan bintang alasan | Baris status dan pilihan terkunci, tanpa tombol jembatan | Reaksi | Klik pada tombol bintang |
| `transition` | Papan tim; pop bintang; ▶ pindah saat adegan berganti | Kosong | Sapuan atau pudar (F-05) | Tidak ada |

- Layar kerangka, pratinjau panggung (`#adegan-N`), dan layar akhir sementara tidak menampilkan panel kanan.
- Layar kerangka dan pratinjau panggung tidak pernah berbunyi. Di layar akhir sementara, hanya tombol "Main lagi dari adegan 1" yang berbunyi klik.
- Selama pergantian adegan (sapuan atau pudar), panel kanan hanya berisi papan tim.

### Papan tim

- Panel kanan menempati bagian kanan area panggung: dari tepi kanan bingkai panggung sampai tepi kanan layar, dan dari bawah bilah atas (8u) setinggi area panggung (52u). Letaknya mencerminkan panel indikator F-06 [Pemilik, usulan 1].
- Di DOM, panel kanan berada sesudah panel bawah. Urutan Tab di fase diskusi menjadi pertanyaan, A, B, C, lalu tombol pengatur waktu, sehingga urutan F-05 tidak berubah [Pemilik, usulan 2].
- Papan berisi satu baris per tim di `state.teams`, berurutan seperti pengaturan. Sampai F-10, `#main` memakai dua tim bawaan pertama (Tim Mangga dan Tim Laut), `#main-3` tiga tim, dan `#main-4` keempat tim bawaan [Pemilik, usulan 9].
- Setiap baris berisi, dari kiri [Pemilik, usulan 1]:
  - ruang kursor ▶, yang hanya terlihat pada tim aktif;
  - ikon bentuk tim 16p × 16p dari `teamIcons[team.shape]` (D-07): lingkaran `mango`, segitiga `sky-d`, persegi `leaf`, atau bintang bersudut empat `sun`;
  - nama tim (`team.name`), dan khusus tim aktif, tulisan "Giliran" di bawahnya;
  - di ujung kanan, ikon bintang 16p × 16p (bingkai normal D-03) dan jumlah bintang tim (`team.stars`).
- Warna tim hanya tampil lewat ikon bentuk. Nama, "Giliran", dan angka selalu `ink` di atas `cream`. Tim dibedakan oleh bentuk dan nama, tidak hanya oleh warna [Dokumen: Design System bagian 7; Architecture bagian 10].
- Tim aktif ditandai tiga hal sekaligus: kursor ▶, bingkai piksel F-05 di sekeliling barisnya, dan tulisan "Giliran". Bingkai digambar di dalam baris, sehingga lebar baris dan letak ikon, nama, serta bintang tidak berubah [Pemilik, usulan 1].
- Catatan terhadap rencana [DRAF]: usulan 1 menyebut tidak ada yang bergeser saat giliran berpindah. Itu berlaku untuk bingkai. Tulisan "Giliran" menambah tinggi baris tim aktif menjadi 8,08u (baris lain 4,96–6,35u), sehingga baris di bawahnya bergeser saat giliran berpindah, sekali per adegan di tengah sapuan atau pudar. Bila setiap baris diberi tinggi baris aktif, empat tim meluap 1,65u di 1280×720 dan 3,88u di 1024×768 (dihitung dari tabel ukuran).
- Jumlah bintang paling banyak 6 (dengan dua tim, satu tim mendapat tiga giliran), jadi selalu satu angka.
- Papan tidak memakai baris judul "Tim ★ skor" dari bagan Design System bagian 3 [Pemilik, usulan 1].

### Giliran

- Tim aktif adalah `activeTeam(state)` dari F-02 (indeks tim = indeks adegan mod jumlah tim): adegan 1 milik tim pertama, adegan 2 tim kedua, dan seterusnya, lalu kembali ke tim pertama sesudah tim terakhir [Dokumen: Architecture bagian 6]:

  | Jumlah tim | Adegan 1 sampai 6 |
  |---|---|
  | 2 | Mangga, Laut, Mangga, Laut, Mangga, Laut |
  | 3 | Mangga, Laut, Daun, Mangga, Laut, Daun |
  | 4 | Mangga, Laut, Daun, Mentari, Mangga, Laut |

- ▶, bingkai, dan "Giliran" berpindah ke tim berikutnya bersamaan dengan pergantian adegan, yaitu saat `LANJUT` dikirim di tengah sapuan (200 ms) atau di akhir pudar keluar (75 ms) [Pemilik, usulan 1; Dokumen: Design System bagian 8].

### Pengatur waktu

- Pengatur waktu tampil di panel kanan, di bawah papan tim dengan celah 2u, hanya di fase `discuss` [Pemilik, usulan 2]. Isinya tiga baris:
  1. baris label: ikon jam 16p (D-04) dan tulisan keadaan;
  2. baris batang: 12 blok, lalu angka menit:detik;
  3. baris tombol: "Jeda", "+30", dan "Lewati".
- Angka menit:detik menunjukkan `timer.remaining` (`clockText`), misalnya "1:00", "0:42", dan "0:00".
- Banyak blok berisi adalah sisa × 12 ÷ durasi, dibulatkan ke atas, dengan durasi `timer.duration` (`filledBlocks`). Pada 60 detik, satu blok bernilai 5 detik: sisa 60 sampai 56 detik berarti 12 blok, sisa 5 sampai 1 detik berarti 1 blok, dan sisa 0 berarti tidak ada blok berisi. Sesudah "+30", durasi menjadi nilai terbesar antara durasi lama dan sisa baru (F-02), sehingga batang penuh lagi bila sisa melebihi durasi lama.
- Keadaan dan tampilannya (`timerTone` dan `timerStatus`) [Pemilik, usulan 2]:

  | Keadaan | Syarat | Tulisan label | Warna blok berisi | Tombol |
  |---|---|---|---|---|
  | Berjalan | sisa > 10 dan berjalan | Waktu diskusi | `sky-d` | Semua aktif |
  | Sepuluh detik terakhir | 0 < sisa ≤ 10 dan berjalan | Waktu diskusi | `mango` | Semua aktif |
  | Dijeda | sisa > 0 dan tidak berjalan | Waktu dijeda | `sky-d`, atau `mango` bila sisa ≤ 10 | "Jeda" dalam keadaan ditekan |
  | Habis | sisa = 0 | Waktunya memilih, berlatar `mango` | Tidak ada | "Jeda" dan "Lewati" nonaktif |

  Blok kosong berwarna `ink` dan menyatu dengan lintasan batang, karena `mango` di atas `cream` hanya 1,9:1.
- Diberikan layar narasi terakhir, ketika "Tampilkan pilihan" ditekan, maka fase menjadi `discuss` dan pengatur waktu mulai dari durasi penuh dan langsung berjalan (F-02).
- Diberikan pengatur waktu berjalan, maka sisa berkurang satu setiap 1.000 ms sejak pengatur waktu mulai atau berjalan lagi. Pada 999 ms angka belum berubah [Pemilik, usulan 3; Ukur].
- Diberikan sisa 0, maka fase tetap `discuss`, tidak ada pilihan yang diambil otomatis, dan pilihan A, B, C tetap bisa dipakai [Dokumen: Architecture bagian 6; Pemilik, usulan 2].
- Diberikan sisa > 0, ketika "Jeda" diklik atau `P` ditekan, maka `JEDA_WAKTU` dikirim:
  - bila sedang berjalan, pengatur waktu berhenti, "Jeda" ber-`aria-pressed="true"`, dan label menjadi "Waktu dijeda";
  - bila sedang dijeda, pengatur waktu berjalan lagi;
  - sisa pecahan detik dibuang. Sesudah berjalan lagi, sisa berkurang tepat 1.000 ms kemudian [Ukur].
- Diberikan sisa ≤ 569 detik (9:29), ketika "+30" diklik atau `T` ditekan, maka `TAMBAH_30` dikirim: sisa bertambah 30 detik, dan bila sisa sebelumnya 0, pengatur waktu berjalan lagi (F-02).
- Diberikan sisa ≥ 570 detik, maka "+30" nonaktif dan `T` diabaikan, sehingga angka tidak pernah mencapai 10:00 [Pemilik, usulan 2]. Batas ini hanya di antarmuka; reducer tidak berubah.
- Diberikan sisa > 0, ketika "Lewati" diklik atau `S` ditekan, maka `LEWATI_DISKUSI` dikirim, sisa menjadi 0, dan keadaan menjadi habis.
- Diberikan keadaan habis, maka "Jeda" dan "Lewati" nonaktif serta `P` dan `S` diabaikan, karena reducer memang mengabaikannya. "+30" tetap aktif.
- Tombol nonaktif memakai `aria-disabled="true"`, bukan atribut `disabled`, sehingga fokus tidak hilang bila tombol yang sedang berfokus menjadi nonaktif, misalnya sesudah "Lewati" ditekan. Klik, `Spasi`, dan `Enter` pada tombol nonaktif tidak berpengaruh dan tidak berbunyi [DRAF].
- `P`, `T`, dan `S`, dalam huruf kecil maupun besar, hanya berlaku di fase `discuss` [Pemilik, usulan 2].
- Diberikan pilihan diambil (`PILIH`), maka pengatur waktu berhenti (F-02) dan hilang dari panel kanan, karena fase menjadi `reaction`.
- Di adegan berikutnya, pengatur waktu mulai lagi dari durasi bawaan (`discussSeconds`), berapa pun sisa di adegan sebelumnya (F-02).

### Kait pengatur waktu

- `ui/useTimer.ts` aktif hanya bila fase `discuss`, `timer.running` benar, sisa > 0, dan adegan tidak sedang berganti [Pemilik, usulan 3].
- Saat aktif, setiap 250 ms kait menghitung detik utuh sejak titik acuan dengan `performance.now()` (`dueTicks`), mengirim `TICK` sebanyak itu, lalu memajukan titik acuan sebanyak detik yang dikirim. Titik acuan dipasang ulang setiap kali kait menjadi aktif. Dengan cara ini waktu tetap tepat walaupun peramban terlambat menjalankan pengatur waktu.
- Pengatur dibersihkan saat kait tidak aktif lagi (dijeda, habis, memilih, atau fase berganti) dan saat layar ditutup. `StrictMode` tidak menyebabkan `TICK` ganda.
- Reducer tetap tanpa pengatur waktu, dan uji F-02 AC-14 tetap memeriksa semua berkas `.ts` di `engine/`. Architecture bagian 3 dan 6 diperbarui: `useTimer.ts` berada di `ui/`, bukan `engine/` [Pemilik, usulan 3].

### Bintang alasan

- Diberikan kartu dampak siap (sesudah 600 ms), ketika "Lanjut" kartu ditekan, maka [Pemilik, usulan 4]:
  1. kartu ditutup;
  2. `bridgeActions(scene)` dikirim: `LANJUT`, dan hanya di adegan 5, `JAWAB_KUIS` dengan jawaban naskah lalu `LANJUT`;
  3. fase menjadi `stars`; tidak ada sapuan, dan panggung tetap menampilkan reaksi.
- Di fase `stars`, panel kanan berisi papan tim dan, di bawahnya dengan celah 2u, blok bintang alasan:
  - ajakan "Bintang alasan untuk {nama tim aktif}", yang boleh terbungkus menjadi dua baris;
  - tiga tombol sebaris, "0", "1", dan "2". Nama tombol bagi pembaca layar: "0 bintang", "1 bintang", dan "2 bintang".
- Panel bawah sama dengan fase reaksi: "Kelas memilih X." dan pilihan terkunci, tanpa tombol "Lanjut" jembatan [Pemilik, usulan 6].
- Diberikan fase `stars`, ketika tombol bintang n diklik atau tombol `n` ditekan (n = 0, 1, atau 2), maka:
  1. `BERI_BINTANG` n dikirim, dan fase menjadi `transition`;
  2. jumlah bintang tim aktif langsung bertambah n (dihitung dari `history`, F-02), sedangkan jumlah tim lain tetap;
  3. bila n > 0 dan kurangi gerak tidak aktif, ikon bintang di baris tim itu memainkan pop;
  4. blok bintang alasan hilang dari panel kanan;
  5. di adegan 1 sampai 5, sapuan atau pudar F-05 langsung dimulai; di adegan 6, layar akhir sementara langsung tampil.
- Bintang hanya bisa diberikan sekali per adegan. Tekanan kedua, klik ganda, dan tombol yang ditahan tidak memberi bintang lagi: tekanan selama pergantian adegan diabaikan (F-05), dan reducer menolak `BERI_BINTANG` di luar fase `stars` [Pemilik, usulan 4].
- `0`, `1`, dan `2` hanya berlaku di fase `stars`. Di fase `discuss`, `1` dan `2` tetap memilih A dan B (F-05).
- `Spasi` dan `Enter` sebagai pintasan tidak berpengaruh di fase `stars`, sehingga tekanan kedua dari tekanan ganda pada "Lanjut" kartu tidak memberi bintang. Pada tombol bintang yang berfokus, keduanya menekan tombol itu seperti tombol lain (F-05) [Pemilik, usulan 4].
- Tidak ada masa tunggu tambahan: tombol bintang langsung bekerja saat fase `stars` dimulai [Pemilik, usulan 4].
- Tombol bintang berada di 8–60u dari atas layar, jauh dari "Lanjut" kartu di kanan bawah, sehingga klik ganda pada "Lanjut" kartu tidak mengenai tombol bintang [Pemilik, usulan 4].

### Pop bintang

- Ikon bintang di baris tim yang menerima bintang memainkan strip D-03 sekali: bingkai kecil, besar berkilau, lalu normal, masing-masing 80 ms (total 240 ms, `steps(3)`), lalu tetap di bingkai normal [Pemilik, usulan 4; Dokumen: Design System bagian 7 dan 8, durasi antarmuka 120–400 ms].
- Pop dimulai bersamaan dengan bertambahnya angka. Bingkai normal sudah tampil pada 160 ms, sebelum ▶ berpindah di tengah sapuan (200 ms).
- Bintang 0 tidak memainkan pop.
- Diberikan kurangi gerak aktif, maka tidak ada pop: ikon tetap di bingkai normal tanpa animasi, dan angka langsung berubah [Dokumen: Design System bagian 8].
- Sesudah adegan 6, layar akhir sementara langsung tampil, sehingga pop terakhir tidak terlihat. Jumlah bintang akhir setiap tim ditampilkan F-09 (dicatat untuk Plan F-09).

### Fokus

- Fokus di fase `discuss` tetap seperti F-05: pertanyaan berfokus saat diskusi dimulai.
- Saat fase `stars` dimulai, fokus pindah ke ajakan bintang. Ajakan itu bisa difokus lewat kode (`tabIndex=-1`), tetapi tidak lewat Tab. Tab berikutnya berpindah ke "0", "1", lalu "2" [Pemilik, usulan 4]. Ajakan yang berfokus diberi garis fokus 2 px `ink` berjarak 4 px, sama dengan pertanyaan F-05.
- Panel pilihan yang dipasang lagi di fase `stars` tidak mengambil fokus. `ChoicePanel` mendapat properti yang mematikan fokus otomatisnya di fase ini, sehingga hasilnya tidak bergantung pada urutan efek React [DRAF].
- Sesudah bintang diberikan, fokus pindah ke tombol lanjut kotak narasi adegan berikutnya, atau ke judul layar akhir sementara sesudah adegan 6, sama dengan aturan F-05 dan F-06.
- **[Build]** Pada klik ganda di "Lanjut" kartu, klik pertama membuka fase bintang dan memfokuskan ajakan, lalu klik kedua jatuh di ruang kosong panel bawah (bukan di tombol bintang), sehingga browser memindahkan fokus dari ajakan ke halaman. Bintang tetap bisa diberikan lewat tombol atau `0` `1` `2`. Dicatat sebagai temuan di laporan uji.

### Kartu dampak dan panggung (Temuan 5 F-06)

- Selama kartu dampak tampil, area panggung disembunyikan (`visibility: hidden`), sehingga pita panggung tipis di atas kartu tidak terlihat lagi [Pemilik, usulan 8]. Pita semula 6,9 px di 1024×768, 1,5 px di 1280×720, 2,2 px di 1920×1080, dan 0 di 1366×768 [Ukur].
- Letak, ukuran, dan isi kartu tidak berubah, sehingga angka Design System bagian 7 dan uji F-06 tetap berlaku.
- Kartu menutupi panel kanan selama kartu tampil (keputusan Gerbang 1 F-06 nomor 1). Isi papan tidak terlihat di sela kartu, karena isi panel kanan mulai 11u dari atas (kartu mulai 9,2u) dan berakhir 2u dari tepi kanan layar, sama dengan tepi kanan kartu (dihitung dari letak panel kanan dan letak kartu F-06).

### Pembaca layar

- Papan tim adalah daftar `<ol>` bernama "Papan tim". Setiap butir memuat kalimat tersembunyi: `{nama}, giliran, {n} bintang.` untuk tim aktif dan `{nama}, {n} bintang.` untuk tim lain. Kursor, ikon, nama, "Giliran", dan angka yang terlihat disembunyikan dari pembaca layar [Pemilik, usulan 1].
- Pengatur waktu adalah grup bernama "Pengatur waktu" [Pemilik, usulan 5]:
  - tulisan label terbaca seperti biasa;
  - angka menit:detik memakai `role="timer"`, yang tidak diumumkan otomatis. Isinya bagi pembaca layar "Sisa {durasi}", misalnya "Sisa 42 detik", atau "Waktu habis" saat sisa 0. Angka yang terlihat disembunyikan dari pembaca layar;
  - blok batang disembunyikan dari pembaca layar;
  - nama tombol: "Jeda" (tombol alih dengan `aria-pressed`), "+30 detik", dan "Lewati diskusi". Setiap nama memuat tulisan tombol yang terlihat.
- Blok bintang alasan adalah grup yang dinamai ajakannya.
- Wilayah pengumuman kedua [Pemilik, usulan 5]:
  - elemen `role="status"` tersembunyi, terpisah dari wilayah `aria-live="polite"` narasi dan kartu dampak, sehingga pengumuman tidak saling menimpa;
  - tanpa atribut `aria-live`, sehingga pemilih uji lama `[aria-live="polite"]` tetap menunjuk wilayah narasi;
  - isinya hanya berubah pada peristiwa di tabel berikut, tidak setiap detik, dan dikosongkan saat adegan berganti.
  - **[Build]** Wilayah ini tidak dikosongkan saat adegan berganti, karena pengumuman bintang ditulis 75–200 ms sebelum `LANJUT`, sehingga pengumuman itu akan terhapus sebelum sempat dibaca. Isinya diganti pada peristiwa berikutnya (biasanya "Waktu diskusi … dimulai." di adegan berikutnya) dan dikosongkan saat "Main lagi dari adegan 1".

  | Peristiwa | Pengumuman |
  |---|---|
  | Diskusi dimulai | Waktu diskusi {durasi penuh} dimulai. |
  | Sisa masuk sepuluh detik terakhir karena `TICK` | Sisa waktu {durasi}. (biasanya "Sisa waktu 10 detik.") |
  | Sisa menjadi 0 karena `TICK` | Waktunya memilih. |
  | Dijeda | Waktu dijeda. Sisa {durasi}. |
  | Berjalan lagi | Waktu berjalan lagi. Sisa {durasi}. |
  | Ditambah 30 detik | Waktu ditambah 30 detik. Sisa {durasi}. |
  | Dilewati | Diskusi dilewati. Waktunya memilih. |
  | Bintang diberikan | {nama tim} mendapat {n} bintang. Jumlah bintangnya sekarang {jumlah}. |
  | `M` | Suara dimatikan. atau Suara dinyalakan. |

  {durasi} ditulis dengan `durationText`: di bawah 60 detik "{d} detik", kelipatan 60 detik "{m} menit", dan selain itu "{m} menit {d} detik". Contoh: "42 detik", "1 menit", dan "1 menit 12 detik".
- Saat fase `stars` dimulai, pembaca layar membacakan ajakan bintang karena fokus pindah ke sana; tidak ada pengumuman tambahan.

### Panel bawah

- F-07 tidak menambah unsur apa pun ke panel bawah. Sisa ruang di layar pilihan terpanjang (adegan 3 dan 5) tetap 3,33u (1280×720), 3,38u (1366×768), 3,32u (1920×1080), dan 3,05u (1024×768) [Pemilik, usulan 6; Ukur].
- Tombol "Lanjut" jembatan di baris status hanya tersisa sebagai pengaman fase `quiz` sampai F-08, dan tidak tampil pada pemakaian biasa.

### Alamat uji tiga dan empat tim

- `#main-3` dan `#main-4` membuka layar permainan yang sama dengan `#main`, tetapi dengan tiga atau empat tim bawaan pertama [Pemilik, usulan 9].
- Keduanya tidak ditautkan dari layar kerangka, dan akan diganti layar judul di F-10, seperti `#main`.
- Pindah antara `#main`, `#main-3`, dan `#main-4` memulai permainan baru dari adegan 1. Kembali ke layar kerangka dari ketiganya memindahkan fokus ke tautan "Coba alur permainan" (F-05).
- Alamat lain, seperti `#main-1`, `#main-2`, `#main-5`, dan `#main-4x`, tetap membuka layar kerangka.

### Bunyi

Bagian ini memuat tambahan pemilik proyek 26 Oktober 2026. Bagian ini bisa disetujui atau ditunda terpisah dari bagian lain.

#### Berkas

| Kunci manifest | Berkas | Asal di halaman uji | Isi |
|---|---|---|---|
| `sounds.klik` | `app/sehari-setara/assets/sfx/sfx_klik.wav` | `sfx_klik_a`, "Gaya A: kotak, lebih nyaring" | WAV PCM mono 22.050 Hz 16 bit, 45 ms, 2.028 byte |
| `sounds.teks` | `app/sehari-setara/assets/sfx/sfx_teks.wav` | `sfx_dialog_b`, "Gaya B: lembut" | WAV PCM mono 22.050 Hz 16 bit, 32 ms, 1.454 byte |

- Isi kedua berkas identik byte dengan data di halaman uji (SHA-256 di bagian "Aset") [Pemilik, pilihan bunyi; S-1].
- Nama berkas mengikuti pola `sfx_{peristiwa}` di Architecture bagian 8, dengan ekstensi `.wav` [DRAF].

#### Pemuatan

- Sebelum interaksi pertama di layar permainan, tidak ada `AudioContext` dan tidak ada permintaan berkas `.wav` [Dokumen: Architecture bagian 8, "dimuat setelah interaksi pertama"].
- Pada `keydown`, `pointerdown`, atau `pointerup` pertama di layar permainan saat suara menyala (didengarkan di fase tangkap pada `window`):
  1. satu `AudioContext` dibuat, dengan satu `GainNode` bernilai 0,6 yang terhubung ke tujuan konteks;
  2. kedua berkas diambil dengan `fetch` dari URL manifest (relatif dan berhash), lalu di-*decode* dengan `decodeAudioData`.
- Bila konteks berstatus `suspended` pada interaksi berikutnya, misalnya karena peramban belum menganggap sentuhan pertama sebagai interaksi, konteks dilanjutkan dengan `resume()`.
- Satu halaman hanya punya satu konteks. Meninggalkan `#main` lalu membukanya lagi tidak membuat konteks baru dan tidak mengambil ulang berkas.
- Bunyi yang diminta sebelum kedua berkas siap dilewati, tidak diantre. Akibatnya klik untuk tekanan pertama biasanya tidak terdengar, dan layar narasi pertama adegan 1 tidak berbunyi bila belum ada tombol yang ditekan [DRAF].
- Layar kerangka dan pratinjau panggung tidak memasang pendengar ini, sehingga tidak pernah membuat konteks.

#### Bunyi klik

- `sounds.klik` diputar sekali, dengan laju 1, untuk setiap tekanan yang diterima permainan [Pemilik, klik gaya A; S-2]:

  | Tekanan | Diterima bila |
  |---|---|
  | Kotak narasi atau tombolnya (klik, `Spasi`, `Enter`) | Fase `intro` dan adegan tidak sedang berganti: teks ditampilkan sekaligus, layar berikutnya tampil, atau pertanyaan tampil |
  | Pilihan (klik, `1` `2` `3`, `A` `B` `C`) | Fase `discuss` dan adegan belum dipilih |
  | "Jeda" atau `P`; "Lewati" atau `S` | Fase `discuss` dan sisa > 0 |
  | "+30" atau `T` | Fase `discuss` dan sisa ≤ 569 detik |
  | "Lanjut" kartu (klik, `Spasi`, `Enter`) | Fase `impact`, sesudah masa tunggu 600 ms, sekali per adegan |
  | Tombol bintang atau `0` `1` `2` | Fase `stars`, sekali per adegan |
  | "Lanjut" jembatan | Fase `quiz` (pengaman sampai F-08) |
  | "Main lagi dari adegan 1" | Layar akhir sementara |
  | `M` | Saat suara dinyalakan; klik diputar sesudah suara menyala |

- Tekanan lain tidak berbunyi, antara lain: tekanan selama pergantian adegan atau selama masa tunggu kartu; tekanan pada tombol nonaktif atau pada pilihan sesudah memilih; tombol yang tidak berlaku di fase berjalan; tekanan berulang karena tombol ditahan; tekanan bersama Ctrl, Alt, atau Meta; fokus yang berpindah lewat Tab; dan tetikus yang sekadar mengarah ke tombol. Tautan "Kembali ke galeri" juga tidak berbunyi, karena halaman berpindah.
- Satu tekanan menghasilkan paling banyak satu klik. Misalnya `Enter` pada pilihan yang berfokus ditangani browser sebagai klik (F-05) dan berbunyi sekali.

#### Bunyi teks

- Selama kotak narasi memunculkan teks per huruf, `sounds.teks` diputar dengan laju 1,2, yaitu nada "Tinggi" di halaman uji [Pemilik, teks gaya B, setiap 2 huruf, nada tinggi; S-3]:
  - yang dihitung hanya huruf dan angka (`\p{L}` dan `\p{N}`); spasi dan tanda baca tidak dihitung;
  - hitungan mulai dari 0 di setiap layar narasi, dan bunyi diputar saat huruf ke-0, ke-2, ke-4, dan seterusnya muncul;
  - setiap pembaruan teks (setiap 30 ms, F-05) memutar paling banyak satu bunyi, walaupun beberapa huruf muncul sekaligus (`textBlipDue`), sehingga bunyi tidak menumpuk bila peramban tersendat. Pada 40 huruf per detik keadaan ini tidak pernah terjadi;
  - akibatnya satu layar dengan h huruf dan angka berbunyi ⌈h ÷ 2⌉ kali. Misalnya layar 1 adegan 1 (66 huruf dan angka) 33 kali, dan layar 2 adegan 1 (80 huruf dan angka) 40 kali [Ukur].
- Bunyi teks dipicu dari pengatur waktu teks per huruf, bukan dari render, sehingga render ulang tidak menambah bunyi [DRAF].
- Diberikan teks masih muncul, ketika teks ditampilkan sekaligus (klik atau `Spasi`), maka bunyi teks berhenti; yang terdengar hanya klik tekanan itu.
- Diberikan teks per huruf mati (`settings.typewriter` salah) atau kurangi gerak aktif, maka teks langsung lengkap dan tidak ada bunyi teks. Klik tetap berbunyi, karena bunyi bukan gerak [DRAF].
- Pertanyaan, pilihan, kartu dampak, dan papan tim tidak berbunyi teks, karena teksnya tidak muncul per huruf.
- Jadwal pada naskah asli (9 layar narasi berbeda, 845 huruf dan angka, 424 bunyi teks) [Ukur]:

  | Keadaan | Bunyi per detik | Jarak antarbunyi |
  |---|---|---|
  | Game: 40 huruf per detik, pembaruan 30 ms, setiap 2 huruf | 16,5 | 30–120 ms, umumnya 60 ms |
  | Halaman uji: sekitar 28,6 huruf per detik, setiap 2 huruf | 11,8 | 70–175 ms, umumnya 70 ms |
  | Alternatif S-3: game, setiap 3 huruf | 11,1 | 60–150 ms, umumnya 90 ms |

  Pada laju 1,2, bunyi teks berlangsung 26,7 ms, jadi tidak pernah bertumpuk dengan bunyi teks berikutnya.

#### Volume dan mematikan suara

- Kedua bunyi melewati `GainNode` 0,6, yaitu volume bawaan 60% [Dokumen: Design System bagian 9].
- Bunyi hanya diputar bila `settings.sound` benar. Nilai bawaannya benar (F-02).
- Diberikan fase `intro` sampai `transition` dan adegan tidak sedang berganti, ketika `M` ditekan (huruf kecil maupun besar), maka `UBAH_PENGATURAN` dengan `sound` yang dibalik dikirim [Dokumen: Architecture bagian 9; S-4]:
  - sesudah suara dimatikan, tidak ada bunyi baru; bunyi yang sedang berjalan selesai sendiri, paling lama 45 ms;
  - wilayah pengumuman kedua berisi "Suara dimatikan." atau "Suara dinyalakan.";
  - saat suara dinyalakan, satu klik diputar sebagai tanda, bila berkas sudah siap.
- Pengaturan suara bertahan saat "Main lagi dari adegan 1", karena F-02 mempertahankan `settings`. Bila `#main` dibuka ulang, suara kembali menyala, karena status permainan hanya disimpan di memori (Architecture bagian 13).

#### Galat

- Bila peramban tidak punya `AudioContext`, berkas gagal diambil, atau *decode* gagal, permainan tetap berjalan tanpa bunyi, tanpa galat halaman, dan tanpa pesan konsol dari kode game. Pemuatan tidak diulang sampai halaman dimuat ulang [DRAF].

### Keyboard

| Tombol | Berlaku di | Fungsi |
|---|---|---|
| `1` `2` `3`, `A` `B` `C` | `discuss` | Memilih (F-05) |
| `Spasi`, `Enter` | `intro`, `impact` (sesudah 600 ms), `quiz` | Lanjut (F-05, F-06). Tidak lagi berlaku di `stars` |
| `P` | `discuss`, sisa > 0 | Jeda atau lanjutkan pengatur waktu |
| `T` | `discuss`, sisa ≤ 569 detik | Tambah 30 detik |
| `S` | `discuss`, sisa > 0 | Lewati diskusi |
| `0` `1` `2` | `stars` | Memberi bintang alasan |
| `M` | `intro` sampai `transition` | Suara mati atau nyala (S-4) |

- Huruf kecil dan besar sama.
- Aturan F-05 tetap berlaku: tekanan bersama Ctrl, Alt, atau Meta, tekanan berulang, huruf yang sedang disusun, tekanan di kolom isian, dan tekanan selama pergantian adegan diabaikan; `Spasi` dan `Enter` pada tombol atau tautan yang berfokus ditangani browser sebagai klik.
- `F` dan `Esc` belum berlaku (F-10 dan F-13).

### Tata letak dan ukuran [Ukur]

p adalah satu piksel antarmuka (`--ss-px`, F-05): 2 px di 1280×720, 1366×768, dan 1024×768, serta 3 px di 1920×1080.

| Ruang tampilan | 1u | k | p | Lebar panel kanan | Lebar isi |
|---|---|---|---|---|---|
| 1280×720 | 7,2 px | 2 | 2 px | 44,4u (320 px) | 40,4u |
| 1366×768 | 7,68 px | 2 | 2 px | 47,2u (362,7 px) | 43,2u |
| 1920×1080 | 10,8 px | 3 | 3 px | 44,4u (480 px) | 40,4u |
| 1024×768 (layar 1024×576) | 5,76 px | 1,664 | 2 px | 42,7u (245,8 px) | 38,7u |

Panel kanan dan papan tim [Pemilik, usulan 1]:

| Bagian | Nilai |
|---|---|
| Panel | Kiri: tepi kanan bingkai panggung (lebar layar ÷ 2 + 160k); kanan 0; atas 8u; tinggi 52u; jarak dalam 3u atas dan 2u kiri-kanan; isi bertumpuk dengan celah 2u antara papan dan blok di bawahnya |
| Papan | Daftar tanpa penanda; celah antarbaris 0,4u |
| Baris tim | Jarak dalam 0,4u atas-bawah, 2,6u kiri (ruang ▶), dan 1u kanan; ikon bentuk 16p × 16p, piksel tajam; celah 1u; kolom nama mengisi sisa lebar; kelompok bintang di kanan |
| Nama | Pixelify Sans 3,1u, tinggi baris 1,3, `ink`, satu baris |
| "Giliran" | Pixelify Sans 2,5u, tinggi baris 1,3, `ink`, di bawah nama |
| ▶ | Teks "▶" 2,2u, `ink`, 0,6u dari tepi kiri baris, sejajar tengah ikon bentuk |
| Bingkai tim aktif | Bingkai piksel F-05 di dalam baris: garis `ink` 2p, sudut terpotong p, sorotan `white` p, latar `cream` |
| Kelompok bintang | Ikon bintang 16p × 16p (bingkai normal D-03), celah 0,6u, angka Press Start 2P 2,8u dengan tinggi baris 1, `ink` |

Pengatur waktu [Pemilik, usulan 2]:

| Bagian | Nilai |
|---|---|
| Baris label | Ikon jam 16p × 16p; celah 1u; Pixelify Sans 2,5u, tinggi baris 1,3, `ink`. Saat habis, tulisan berlatar `mango` dengan jarak dalam 0,6u kiri-kanan |
| Baris batang | 0,8u di bawah baris label; celah 1,2u antara batang dan angka |
| Batang | Latar `ink`, jarak dalam p, celah antarblok p; 12 blok 5p × 10p; ukuran utuh 73p × 12p |
| Angka | Press Start 2P 2,8u, tinggi baris 1, `ink` |
| Baris tombol | 1,2u di bawah baris batang; celah antartombol 1u; satu baris |
| Tombol | Tampilan tombol lanjut F-05 (garis `ink` 2p, sudut terpotong p, sorotan `white` p, latar `cream`; fokus dan arah: `sun` dengan kursor ▶), dengan Pixelify Sans 2,5u, tinggi baris 1,3, dan jarak dalam 0,5u atas-bawah, 2,2u kiri, dan 1,2u kanan |
| "Jeda" ditekan | Latar `sun` dengan cincin dalam `ink` 2p, seperti pilihan yang dipilih |
| Tombol nonaktif | Latar `mist`, teks `dusk`, tanpa warna arah tetikus |

Bintang alasan [Pemilik, usulan 4]:

| Bagian | Nilai |
|---|---|
| Ajakan | Pixelify Sans 2,5u, tinggi baris 1,3, `ink`; boleh dua baris |
| Baris tombol | 0,8u di bawah ajakan; celah 1,2u |
| Tombol bintang | Tampilan tombol lanjut F-05 dengan Press Start 2P 2,8u, tinggi baris 1,3, jarak dalam 0,5u atas-bawah, 2,2u kiri, dan 1,6u kanan |

Hasil pengukuran dengan huruf asli:

| Ukuran | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
|---|---|---|---|---|
| Tinggi baris tim biasa | 5,24u | 4,96u | 5,24u | 6,35u (ikon 16p setinggi 5,56u) |
| Tinggi baris tim aktif | 8,08u | 8,08u | 8,08u | 8,08u |
| Tinggi papan, 2 tim / 4 tim | 13,72u / 25,00u | 13,44u / 24,17u | 13,72u / 25,00u | 14,83u / 28,33u |
| Tinggi blok pengatur waktu | 15,13u | 14,58u | 15,13u | 17,36u |
| Tinggi blok bintang, ajakan satu / dua baris | 9,80u / 13,04u | 9,72u / — | 9,80u / 13,05u | 10,07u / 13,32u |
| Sisa di bawah blok terakhir, 4 tim, diskusi | 6,87u | 8,26u | 6,86u | 1,32u |
| Sisa di bawah blok terakhir, 4 tim, bintang | 8,95u | 13,11u | 8,95u | 5,35u |
| Lebar kotak nama | 22,6u | 25,9u | 22,6u | 18,6u |

- Tidak ada teks yang terbungkus di papan dan pengatur waktu, dan tinggi setiap baris tetap, sehingga sisa 1,32u di 1024×768 tidak bergantung pada perbedaan huruf antarkomputer.
- "Tim Mentari", nama bawaan terpanjang, selebar 17,8u, jadi masih tersisa 0,7u di 1024×768. Nama yang lebih panjang, seperti "Tim Kupu-kupu" (20,7u), tidak muat di 1024×768; batas ini dicatat untuk Plan F-10.
- Angka "9:59" muat di keempat ukuran. Angka "10:00" akan meluap 1,9u di 1024×768, karena itu ada batas "+30" pada 569 detik.
- Ajakan bintang menjadi dua baris untuk "Tim Mentari" di 1280×720, 1920×1080, dan 1024×768, dan tetap muat.

### Waktu dan pengatur waktu

- Pop bintang memakai animasi CSS `ss-star-pop` 240 ms dengan `steps(3)`, diputar sekali. Elemen ikon dipasang ulang setiap kali bintang diberikan, sehingga pop berulang di adegan berikutnya.
- Waktu reaksi, kartu dampak, dan sapuan F-05 dan F-06 tidak berubah.
- Semua pengatur waktu layar permainan dibersihkan saat fase berganti atau layar ditutup. Reducer tetap tanpa `setTimeout` dan `setInterval`.

### Uji aset dan galeri

- Uji palet F-12 tetap lulus. Warna baru di `game.css` hanya token yang sudah ada (`--ss-sky-d`, `--ss-mango`, `--ss-ink`, `--ss-cream`, `--ss-white`, `--ss-sun`, `--ss-mist`, `--ss-dusk`). Tidak ada token `:root` baru.
- Uji aset mengenal kelompok manifest `sounds` [DRAF]:
  - kunci `klik` dan `teks` wajib ada;
  - setiap kunci menunjuk `sfx/sfx_{kunci}.wav`;
  - berkasnya WAV PCM 16 bit mono, paling lama 1 detik [Dokumen: Design System bagian 9, "≤ 1 detik"], dan paling besar 30 KB [Dokumen: Architecture bagian 8];
  - berkasnya tercatat di `CREDITS.md`;
  - pemeriksaan ukuran gambar tidak berlaku untuk bunyi.
- Kedua bunyi menjadi berkas berhash terpisah di `dist-pages/assets/`, tidak diselipkan ke JS, karena aturan `assetsInlineLimit` F-12 berlaku untuk semua berkas di `app/sehari-setara/assets/` [Ukur: `sfx_klik-*.wav` 2,02 kB dan `sfx_teks-*.wav` 1,45 kB, dirujuk dengan URL relatif].
- Berkas galeri tidak berubah. Uji build membandingkan `index.html`, `main-*.css`, `main-*.js`, dan `jsx-runtime-*.js` dengan build sebelum F-07 (catatan PLAN "Semua fitur").

## Status antarmuka

| Bagian | Status | Tampilan |
|---|---|---|
| Baris tim | Biasa | Ikon bentuk, nama, ikon bintang, dan angka; tanpa bingkai |
| | Giliran | ▶, bingkai piksel, dan "Giliran" di bawah nama |
| | Mode warna paksa | Sudut terpotong dimatikan seperti F-05; nama dan angka tetap terbaca |
| Ikon bintang | Diam | Bingkai normal D-03 |
| | Pop | Kecil, besar berkilau, lalu normal, masing-masing 80 ms |
| | Kurangi gerak | Selalu bingkai normal |
| Pengatur waktu | Berjalan | "Waktu diskusi", blok `sky-d` |
| | Sepuluh detik terakhir | "Waktu diskusi", blok `mango` |
| | Dijeda | "Waktu dijeda", "Jeda" ditekan |
| | Habis | "Waktunya memilih" berlatar `mango`, "0:00", semua blok kosong, "Jeda" dan "Lewati" nonaktif |
| | Mode warna paksa | Batang memakai `forced-color-adjust: none` agar blok tetap terlihat |
| Tombol pengatur waktu dan tombol bintang | Biasa | `cream` |
| | Fokus atau arah | `sun` dengan kursor ▶ |
| | Ditekan ("Jeda") | `sun` dengan cincin dalam 2p |
| | Nonaktif | `mist`, teks `dusk`, `aria-disabled="true"` |
| Ajakan bintang | Berfokus | Garis fokus 2 px `ink` berjarak 4 px |
| Panel kanan | Fase `impact` | Tertutup kartu dampak |
| | Layar kerangka, pratinjau, layar akhir sementara | Tidak tampil |
| Panggung | Fase `impact` | Disembunyikan; kartu dampak tampil |
| Bunyi | Sebelum interaksi pertama | Tidak ada konteks dan tidak ada permintaan berkas |
| | Memuat | Bunyi yang diminta dilewati |
| | Siap | Klik dan bunyi teks sesuai aturan |
| | Mati (`M`) | Tidak ada bunyi |
| | Galat | Tidak ada bunyi; permainan berjalan biasa |
| Kosong | Tidak berlaku | Selalu ada 2–4 tim; jumlah bintang 0 tampil sebagai "0" |

Kontras teks dan unsur baru:

| Pasangan | Rasio |
|---|---|
| `ink` di atas `cream` (nama, "Giliran", angka, label, ajakan, tombol biasa) | 13,3 : 1 [Dokumen] |
| `ink` di atas `sun` (tombol berfokus, "Jeda" ditekan) | 9,9 : 1 [Dokumen] |
| `ink` di atas `mango` ("Waktunya memilih") | 6,9 : 1 [Dokumen] |
| `dusk` di atas `mist` (tombol nonaktif) | 5,9 : 1 |
| Blok `sky-d` dan `mango` terhadap lintasan `ink` (bukan teks, minimal 3 : 1) | 3,8 : 1 dan 6,9 : 1 |

## Teks yang tampil (final)

Teks baru berasal dari `app/sehari-setara/content/copy.ts`. Nama tim berasal dari `content/teams.ts` tanpa perubahan.

| Tempat | Teks | Asal |
|---|---|---|
| Nama daftar papan (hanya pembaca layar) | Papan tim | Pemilik, usulan 1 |
| Penanda tim aktif | Giliran | Dokumen: Design System bagian 7 |
| Kalimat butir papan (hanya pembaca layar) | Tim Mangga, giliran, 2 bintang. / Tim Laut, 0 bintang. | Pemilik, usulan 1 |
| Nama grup pengatur waktu (hanya pembaca layar) | Pengatur waktu | DRAF |
| Label berjalan | Waktu diskusi | Pemilik, usulan 2 |
| Label dijeda | Waktu dijeda | Pemilik, usulan 2 |
| Label habis | Waktunya memilih | Dokumen: Design System bagian 7; Architecture bagian 6 |
| Angka | 1:00, 0:42, 0:00 (menit:detik) | Dokumen: Design System bagian 7 |
| Angka bagi pembaca layar | Sisa 42 detik / Sisa 1 menit / Waktu habis | Pemilik, usulan 5 |
| Tombol jeda | Jeda | Pemilik, usulan 2 |
| Tombol tambah | +30 (nama bagi pembaca layar: +30 detik) | Pemilik, usulan 2 |
| Tombol lewati | Lewati (nama bagi pembaca layar: Lewati diskusi) | Pemilik, usulan 2; nama DRAF |
| Ajakan bintang | Bintang alasan untuk Tim Mangga (nama mengikuti tim aktif) | Pemilik, usulan 4 |
| Tombol bintang | 0, 1, 2 (nama bagi pembaca layar: 0 bintang, 1 bintang, 2 bintang) | Pemilik, usulan 4 |
| Pengumuman | Kalimat di tabel bagian "Pembaca layar" | DRAF, mengikuti peristiwa usulan 5 |

Teks bilah atas, kotak narasi, pilihan, kartu dampak, layar kerangka, pratinjau, layar akhir sementara, dan naskah tidak berubah.

## Data dan aksi

`engine/` tidak berubah. `GameState`, tipe, reducer, aturan F-02, dan `DEFAULT_SETTINGS` (durasi 60 detik, suara menyala) dipakai apa adanya, dan tidak ada aksi reducer baru.

### Aksi yang dikirim layar permainan

| Saat | Aksi |
|---|---|
| Sampai "Lanjut" kartu dampak | Sama dengan F-05 dan F-06 |
| Setiap detik diskusi yang berjalan | `TICK`, dari `useTimer` |
| "Jeda" atau `P` | `JEDA_WAKTU` |
| "+30" atau `T` | `TAMBAH_30` |
| "Lewati" atau `S` | `LEWATI_DISKUSI` |
| "Lanjut" kartu dampak, sesudah 600 ms | `bridgeActions(scene)`: `LANJUT`; hanya di adegan 5, `JAWAB_KUIS` dengan `roleQuiz.answer` lalu `LANJUT` |
| Tombol bintang atau `0` `1` `2` | `BERI_BINTANG` n; lalu sapuan atau pudar (adegan 1–5), atau `LANJUT` langsung (adegan 6) |
| Tengah sapuan (200 ms) atau akhir pudar keluar (75 ms) | `LANJUT`, sama dengan F-05 |
| `M` | `UBAH_PENGATURAN` dengan `{ sound: !settings.sound }` |
| "Main lagi dari adegan 1" | Sama dengan F-05, dengan jumlah tim yang sama |
| Membuka `#main`, `#main-3`, atau `#main-4` | `startActions` dengan 2, 3, atau 4 tim bawaan pertama |

Klik dan pengumuman hanya diputar atau ditulis bila aksi itu memang mengubah keadaan, yaitu bila reducer mengembalikan objek keadaan baru, atau bila layar narasi, teks narasi, atau pergantian adegan berubah [DRAF].

### Berkas dan ekspor

`app/sehari-setara/ui/turn.ts` berisi fungsi murni yang diuji unit [Pemilik, usulan 3 dan 5]. Rencana menamainya `ui/timer.ts`; namanya diganti karena `timer.ts` dan `Timer.tsx` hanya berbeda huruf besar, sehingga di sistem berkas yang tidak membedakan huruf besar (Windows dan macOS) impor `./Timer` bisa terbaca sebagai `timer.ts` [DRAF]:

| Ekspor | Isi |
|---|---|
| `TIMER_BLOCKS`, `LAST_SECONDS`, `ADD_LIMIT`, `TIMER_POLL_MS` | 12, 10, 569, dan 250 |
| `STAR_POP_MS`, `STAR_POP_FRAMES` | 240 dan 3 |
| `clockText(seconds)` | "m:ss", misalnya "1:00", "0:42", "9:59" |
| `durationText(seconds)` | "42 detik", "1 menit", "1 menit 12 detik" |
| `filledBlocks(remaining, duration)` | ⌈sisa × 12 ÷ durasi⌉, paling banyak 12; 0 bila sisa atau durasi 0 |
| `timerTone(remaining)` | `"biasa"`, `"akhir"` (0 < sisa ≤ 10), atau `"habis"` |
| `timerStatus(timer)` | `"berjalan"`, `"dijeda"`, atau `"habis"` |
| `canAddTime(remaining)` | Benar bila sisa ≤ 569 |
| `dueTicks(elapsedMs)` | ⌊ms ÷ 1000⌋; 0 untuk nilai negatif atau bukan angka |
| `timerAnnouncement(before, after, cause)` | Kalimat pengumuman pengatur waktu menurut tabel, atau `null` bila tidak ada peristiwa. `cause`: `"mulai"`, `"tick"`, `"jeda"`, `"tambah"`, atau `"lewati"` |
| `starsAnnouncement(name, stars, total)` | Kalimat pengumuman bintang |
| `teamSentence(name, active, stars)` | Kalimat butir papan bagi pembaca layar |

`app/sehari-setara/ui/sound.ts` berisi aturan bunyi dan pemutarnya [DRAF]:

| Ekspor | Isi |
|---|---|
| `SOUND_VOLUME`, `TEXT_BLIP_EVERY`, `TEXT_BLIP_RATE`, `CLICK_RATE` | 0,6; 2; 1,2; dan 1 |
| `SoundName` | `"klik" \| "teks"` |
| `isCountedLetter(char)` | Benar untuk huruf dan angka (`\p{L}`, `\p{N}`) |
| `textBlipDue(chars, from, to, every?)` | Benar bila di antara huruf yang baru muncul (indeks `from` sampai sebelum `to`) ada huruf atau angka berurutan ke-0, ke-`every`, ke-2×`every`, dan seterusnya, dihitung dari awal layar |
| `textBlipCount(text, every?)` | ⌈banyak huruf dan angka ÷ `every`⌉ |
| `createSoundPlayer(deps)` | Pemutar dengan `unlock()`, `play(name, rate?)`, dan `ready()`. `deps` berisi pembuat konteks dan pemuat berkas, sehingga bisa diuji unit dengan konteks tiruan |
| `soundPlayer` | Satu pemutar untuk seluruh halaman, memakai `window.AudioContext` dan `fetch` dengan URL `sounds` di manifest |

Berkas lain:

| Berkas | Isi |
|---|---|
| `ui/useTimer.ts` | `useTimer(active, onTicks)`: kait pengatur waktu di bagian "Kait pengatur waktu" |
| `ui/Teams.tsx` | `Teams({ teams, activeIndex, popKey, animate })`: papan tim. **[Build]** Menjadi `Teams({ teams, activeIndex, pop })`: `pop` berisi kunci adegan dan tim penerima, atau `null` bila tidak ada pop, termasuk saat kurangi gerak aktif |
| `ui/Timer.tsx` | `Timer({ timer, onPause, onAdd, onSkip })`: pengatur waktu dan tiga tombolnya |
| `ui/StarsAward.tsx` | `StarsAward({ teamName, onGive })`: ajakan dan tombol bintang; memfokuskan ajakan saat tampil |
| `ui/PlayScreen.tsx` | Panel kanan, fase `stars`, pemberian bintang dan pop, `useTimer`, pintasan baru, wilayah pengumuman kedua, panggung yang disembunyikan selama kartu, jumlah tim dari alamat, serta pemanggilan bunyi klik dan bunyi teks |
| `ui/NarrationBox.tsx` | Properti baru untuk bunyi teks (dipanggil paling banyak sekali per pembaruan, menurut `textBlipDue`) dan untuk tekanan yang diterima (klik) |
| `ui/ChoicePanel.tsx` | Properti yang mematikan fokus otomatis di fase `stars` |
| `ui/controls.ts` | `keyCommand` mengenal `P` `T` `S` (fase `discuss`), `0` `1` `2` (fase `stars`), dan `M` (fase `intro` sampai `transition`); `Spasi` dan `Enter` tidak lagi berarti lanjut di fase `stars`; `bridgeActions` tanpa `BERI_BINTANG` |
| `ui/layout.ts` | `parseRoute` mengembalikan `{ kind: "main", teams: 2 \| 3 \| 4 }` untuk `#main`, `#main-3`, dan `#main-4` |
| `Game.tsx` | Meneruskan jumlah tim ke `PlayScreen`, dengan kunci per alamat sehingga pindah alamat memulai permainan baru |
| `content/copy.ts` | Bagian baru `teams`, `timer`, `stars`, dan `sound` berisi teks di atas |
| `assets/manifest.ts` | Kelompok baru `sounds = { klik, teks }` |
| `assets/wav.d.ts` | Tipe impor `*.wav`, seperti `png.d.ts` |
| `assets/sfx/sfx_klik.wav`, `assets/sfx/sfx_teks.wav` | Berkas bunyi |
| `assets/CREDITS.md` | Bagian baru "Efek suara (`sfx/`)", judul menjadi aset gambar dan suara |
| `styles/game.css` | Kelas panel kanan, papan, pengatur waktu, tombol, blok bintang, pop, dan aturan kurangi gerak serta mode warna paksa |
| `__tests__/asset-checks.ts`, `__tests__/assets.test.ts` | Kelompok `sounds` dan pemeriksaan WAV |

Kelas CSS baru berawalan `ss-`: `ss-side`, `ss-teams`, `ss-team`, `ss-team-icon`, `ss-team-name`, `ss-team-turn`, `ss-team-stars`, `ss-team-star`, `ss-team-count`, `ss-timer`, `ss-timer-label`, `ss-timer-icon`, `ss-timer-bar`, `ss-timer-block`, `ss-timer-value`, `ss-timer-buttons`, `ss-panel-button`, `ss-award`, `ss-award-prompt`, `ss-award-buttons`, dan `ss-award-button`. Keyframes baru: `ss-star-pop`. Tidak ada token `:root` baru. **[Build]** Ditambah `ss-timer-text` (tulisan label, yang diberi latar `mango` saat habis) dan `ss-timer-row` (baris batang dan angka).

### Perubahan dokumen (Build)

- `Design_System.md` naik ke versi 0.7:
  - bagian 3: panel kanan berisi papan tim dan, menurut fase, pengatur waktu atau bintang alasan; tanpa baris judul;
  - bagian 7, Pengatur waktu: rincian blok, warna, label, tombol, batas 9:29; catatan bahwa tik pelan belum ada (S-5);
  - bagian 7, Papan tim dan Bintang alasan: rincian baris, penanda giliran, ajakan, dan tombol;
  - bagian 8: pop bintang 240 ms dan perpindahan ▶ saat adegan berganti; kurangi gerak tanpa pop;
  - bagian 9: format WAV (S-1), kedua bunyi, bunyi teks setiap 2 huruf dengan laju 1,2 (peristiwa baru), volume 0,6, dan pemuatan sesudah interaksi pertama;
  - bagian 13: baris atribusi efek suara (S-6).
- `Architecture.md` naik ke versi 0.9:
  - bagian 3: `useTimer.ts` di `ui/`; berkas `turn.ts`, `sound.ts`, `wav.d.ts`, dan folder `sfx/` berisi WAV;
  - bagian 6: `useTimer` di `ui/`, mengirim `TICK` dari hitungan `performance.now()`;
  - bagian 7: panel kanan, fase `stars`, jembatan yang kini hanya melewati kuis, panggung tersembunyi selama kartu, dan `#main-3` serta `#main-4`;
  - bagian 8: kelompok manifest `sounds`, pola nama `sfx_{peristiwa}.wav`, format WAV atau MP3, dan anggaran 30 KB per efek;
  - bagian 9: `P` `T` `S`, `0` `1` `2`, dan `M` sudah aktif; `Spasi` dan `Enter` tidak berlaku di fase bintang;
  - bagian 10: wilayah pengumuman kedua, `role="timer"`, dan fokus di fase bintang;
  - bagian 12: cakupan uji F-07, termasuk perekam bunyi di uji ujung ke ujung.
- `AGENTS.md` bagian 5: baris F-07 juga memenuhi FR-19 sebagian (klik dan bunyi teks), atas keputusan pemilik proyek 26 Oktober 2026; baris F-13 memuat sisa FR-19 [DRAF].
- `PRD.md` bagian 17: baris 26 Oktober 2026 tentang durasi bawaan tetap 60 detik (menjawab pertanyaan terbuka bagian 16 nomor 3) dan bunyi klik serta bunyi teks yang dikerjakan di F-07 [DRAF].
- `Daftar_Aset.md`: bagian "E. Efek suara" dengan `sfx_klik.wav` dan `sfx_teks.wav` (S-8), serta catatan bahwa efek suara tidak dibuat dengan kit gambar diperbarui.
- `PLAN.md`: status F-07, tautan spesifikasi dan laporan, serta catatan untuk Plan berikutnya:
  - F-08: bagian kuis di `bridgeActions` diganti, dan fase `stars` datang sesudah kuis;
  - F-09: jumlah bintang akhir setiap tim, karena pop adegan 6 tidak terlihat;
  - F-10: lebar nama tim paling banyak 18,6u di 1024×768; pengaturan suara; durasi 30, 60, atau 90 detik;
  - F-13: bunyi konfirmasi, dampak, tik pelan, dan akhir hari; ikon suara bila alternatif S-4a tidak dipilih sekarang;
  - "Semua fitur dengan jam uji": `pauseAt` dipanggil di fase narasi sebelum diskusi dimulai, dan waktu diskusi hanya dimajukan dengan `runFor`.

Perbedaan dengan daftar file di rencana:

- Ditambah karena bunyi: `ui/sound.ts`, `assets/manifest.ts`, `assets/wav.d.ts`, `assets/sfx/`, `assets/CREDITS.md`, `ui/NarrationBox.tsx`, `__tests__/asset-checks.ts`, `__tests__/assets.test.ts`, `__tests__/sound.test.ts`, `e2e/suara.spec.ts`, `AGENTS.md`, `PRD.md`, dan `Daftar_Aset.md`. Rencana semula menyebut manifest dan `CREDITS.md` tidak disentuh.
- `ui/timer.ts` dan `__tests__/timer.test.ts` menjadi `ui/turn.ts` dan `__tests__/turn.test.ts` (alasannya di bagian "Berkas dan ekspor").
- `ui/ChoicePanel.tsx` pasti diubah (rencana: "bila perlu").
- `engine/reducer.ts` dan `__tests__/reducer.test.ts` tidak diubah, karena durasi tetap 60 detik (S-7).

## Aset

- Baru, dari halaman uji suara pemilik proyek:

  | Berkas | Byte | SHA-256 |
  |---|---|---|
  | `sfx/sfx_klik.wav` | 2.028 | `081db14eb513435591963f9a022df52d7ddc98c42bf0d12e57bd38f6eb98e611` |
  | `sfx/sfx_teks.wav` | 1.454 | `9e096aaeb5bb9262dbd786d3a0e7697e624562a07345bdc27a394b55eb45dbe5` |

  Total aset game naik dari 61,8 KB menjadi sekitar 65,2 KB dari anggaran 4 MB [Ukur].
- Dipakai ulang, sudah Disetujui (21 Oktober 2026) dan terdaftar di manifest: bentuk tim D-07 (`teamIcons`), bintang alasan D-03 (`iconStrips.star`, 3 bingkai), dan jam D-04 (`icons.clock`).
- Tidak ada PNG baru atau berubah, dan kit gambar tidak berubah. Kursor ▶ berupa teks, seperti sejak F-01. Placeholder tidak diperlukan.
- Ikon suara D-05 hanya dipakai bila alternatif S-4a dipilih.

## Di luar cakupan

- Tampilan kuis peran (F-08).
- Layar akhir dengan jumlah bintang akhir, timbangan, rekap, dan refleksi (F-09).
- Layar judul, pengaturan kelas (jumlah, nama, dan warna tim; durasi 30, 60, atau 90 detik; suara), prolog, dan `Esc` (F-10).
- Tautan dari galeri dan pemeriksaan ketat rujukan di CI (F-11).
- Bunyi konfirmasi, dampak tepat dan berisiko, tik pelan sepuluh detik terakhir (S-5), dan jingle akhir hari; ikon suara di bilah atas (S-4a); pengatur volume; layar penuh (`F`); ulangi dan kembali adegan (F-13).
- Bunyi di layar kerangka, pratinjau panggung, dan layar F-08 sampai F-10.
- Mengubah atau membatalkan bintang yang sudah diberikan.
- Sisa waktu 10:00 atau lebih, menyimpan pengaturan antarsesi, dan nama tim buatan pengguna.
- Perubahan pada `engine/`, naskah (`scenes.ts`, `references.ts`), `Verifikasi_Rujukan.md`, `content.test.ts`, `content/teams.ts`, gambar dan kit gambar, `Stage.tsx`, `Sprite.tsx`, `DayArc.tsx`, `Meters.tsx`, `ImpactCard.tsx`, `StagePreview.tsx`, file galeri, `vite.pages.config.ts`, `playwright.config.ts`, `package.json`, `pnpm-lock.yaml`, dan workflow.

## Kriteria penerimaan

- [ ] AC-1 **Panel kanan dan papan tim**, di 1280×720, 1366×768, 1920×1080, dan 1024×768, dengan 2 tim (`#main`) dan 4 tim (`#main-4`):
  - panel tampil di fase `intro` sampai `transition`, kecuali tertutup kartu di fase `impact`, dan tidak tampil di layar kerangka, pratinjau, dan layar akhir sementara;
  - kiri sama dengan tepi kanan bingkai panggung, atas 8u, kanan 0, dan tinggi 52u (±1 px);
  - baris berurutan seperti tim bawaan, masing-masing dengan ikon `ui_team_{bentuk}` 16p × 16p, nama, ikon bintang 16p × 16p pada bingkai normal, dan angka;
  - ukuran huruf sesuai tabel (±0,05u), setiap teks di papan dan pengatur waktu satu baris, dan isi panel tidak meluap ke bawah maupun ke samping pada fase diskusi dan fase bintang, termasuk dengan angka "9:59" dan ajakan bintang dua baris.
- [ ] AC-2 **Giliran**, dengan 2, 3, dan 4 tim di keenam adegan:
  - tepat satu baris punya ▶ yang terlihat, bingkai, dan "Giliran", yaitu tim sesuai tabel bagian "Giliran";
  - ▶ masih pada tim lama sebelum `LANJUT` di tengah sapuan, dan sudah pada tim baru sesudahnya;
  - semua baris sama lebar dan berawal di kiri yang sama, termasuk baris tim aktif dengan bingkainya (±1 px), dan letak kiri ikon, nama, serta ikon bintang sama di setiap baris (±1 px).
- [ ] AC-3 **Pengatur waktu**, dengan jam uji yang dijeda di fase narasi:
  - hanya tampil di fase `discuss`, dengan "Waktu diskusi", "1:00", dan 12 blok `rgb(58, 134, 217)` saat diskusi dimulai;
  - pada 999 ms angka tetap "1:00", pada 1.000 ms "0:59", dan sesudah 10 detik "0:50";
  - banyak blok berisi selalu sama dengan `filledBlocks`; pada sisa 10 sampai 1 detik blok berwarna `rgb(255, 159, 28)`;
  - pada sisa 0: "Waktunya memilih" berlatar `rgb(255, 159, 28)`, "0:00", 0 blok berisi, fase tetap `discuss`, dan ketiga pilihan tetap aktif sampai dipilih;
  - sesudah memilih, pengatur waktu tidak tampil; di adegan berikutnya mulai lagi dari "1:00", berapa pun lama fase lain berlangsung.
- [ ] AC-4 **Tombol dan pintasan pengatur waktu**:
  - "Jeda" dan `P`/`p`: waktu berhenti, `aria-pressed="true"`, label "Waktu dijeda", dan angka tetap selama 5 detik; ditekan lagi, waktu berjalan; sesudah dijeda pada 700 ms dan dilanjutkan, angka baru berkurang 1.000 ms kemudian;
  - "+30" dan `T`/`t`: sisa bertambah 30 detik; pada sisa 0 waktu berjalan lagi; pada sisa ≥ 570 detik "+30" ber-`aria-disabled="true"` dan `T` tidak berpengaruh;
  - "Lewati" dan `S`/`s`: sisa langsung 0 dengan tampilan habis; pada sisa 0, "Jeda" dan "Lewati" ber-`aria-disabled="true"`, `P` dan `S` tidak berpengaruh, dan fokus tetap di tombol yang ditekan;
  - `P`, `T`, dan `S` tidak berpengaruh di fase lain;
  - urutan Tab di fase diskusi: pertanyaan, A, B, C, "Jeda", "+30", "Lewati".
- [ ] AC-5 **Bintang alasan**:
  - sesudah "Lanjut" kartu, fase bintang tampil: ajakan "Bintang alasan untuk {tim aktif}" berfokus, tombol "0", "1", "2", serta panel bawah berisi "Kelas memilih X." dan pilihan terkunci tanpa tombol jembatan; di adegan 5, kuis tidak tampil;
  - Tab dari ajakan berpindah ke "0", "1", lalu "2";
  - dengan klik maupun `0` `1` `2`, jumlah tim aktif bertambah n, tim lain tetap, blok bintang hilang, dan sapuan atau pudar dimulai; dari adegan 6, layar akhir sementara langsung tampil;
  - `Spasi` dan `Enter` saat ajakan berfokus tidak berpengaruh; `Enter` pada tombol "2" yang berfokus memberi 2 bintang;
  - klik ganda, dua tekanan cepat, dan tekanan `repeat` hanya memberi bintang sekali; `0` `1` `2` tidak berpengaruh di fase lain;
  - pada jalur dua tim dengan bintang 2, 1, 0, 2, 1, 0 di adegan 1 sampai 6, angka di papan di setiap adegan sama dengan jumlah bintang tim itu di `history`, dan di fase bintang adegan 6 papan menunjukkan Tim Mangga 3 dan Tim Laut 3.
- [ ] AC-6 **Pop bintang**:
  - untuk bintang 1 dan 2, ikon bintang tim itu memainkan animasi `ss-star-pop` 240 ms dengan `steps(3)` sekali; bila animasi diatur ke 0, 80, dan 160 ms lewat Web Animations API, bingkai yang tampil kecil, besar berkilau, dan normal; sesudahnya bingkai normal;
  - bintang 0 tidak memainkan animasi;
  - dengan `prefers-reduced-motion: reduce`, ikon bintang tidak punya animasi sama sekali dan selalu pada bingkai normal, dan angka langsung berubah.
- [ ] AC-7 **Kartu dampak dan panggung**, di keempat ukuran:
  - selama kartu tampil, area panggung ber-`visibility: hidden`, pita panggung yang terlihat di atas kartu 0 px, dan titik tengah setiap baris papan tertutup kartu;
  - letak dan ukuran kartu sama dengan F-06 AC-7, dan sesudah kartu ditutup panggung terlihat lagi.
- [ ] AC-8 **Pembaca layar**:
  - papan berupa `<ol>` bernama "Papan tim" dengan kalimat butir sesuai `teamSentence`, sedangkan ikon, nama, "Giliran", ▶, dan angka yang terlihat tersembunyi dari pembaca layar;
  - pengatur waktu bernama "Pengatur waktu", angka ber-`role="timer"` berisi "Sisa {durasi}" atau "Waktu habis", blok tersembunyi, dan tombol bernama "Jeda", "+30 detik", dan "Lewati diskusi";
  - tombol bintang bernama "0 bintang", "1 bintang", dan "2 bintang", dalam grup yang dinamai ajakan;
  - wilayah `role="status"` berisi pengumuman tepat untuk setiap peristiwa di tabel, dan isinya tidak berubah pada detik lain (diamati 15 detik pertama diskusi dan sepuluh detik terakhir);
  - wilayah `[aria-live="polite"]` lama tetap satu dan tetap berisi narasi serta pengumuman kartu.
- [ ] AC-9 **Kontras**: rasio terukur ≥ 4,5:1 untuk nama, "Giliran", angka bintang, label dan angka pengatur waktu, tombol (biasa, berfokus, ditekan, nonaktif), dan ajakan; blok terhadap lintasan ≥ 3:1; di keempat ukuran.
- [ ] AC-10 **Panel bawah**: tidak ada unsur baru; sisa ruang layar pilihan adegan 3 dan 5 tetap ≥ 3,0u di keempat ukuran; panel bawah fase bintang sama dengan fase reaksi.
- [ ] AC-11 **Alamat uji**: `#main-3` dan `#main-4` membuka permainan dengan 3 dan 4 tim; layar kerangka hanya bertautan ke `../`, `#adegan-1`, dan `#main`; pindah alamat memulai dari adegan 1 dengan semua jumlah bintang 0; `#main-1`, `#main-2`, `#main-5`, dan `#main-4x` membuka layar kerangka.
- [ ] AC-12 **Pemuatan bunyi**:
  - sebelum tekanan pertama di `#main`: 0 `AudioContext` dan 0 permintaan `.wav`;
  - sesudah tekanan pertama: tepat 1 `AudioContext` berstatus `running`, dan tepat 2 permintaan `.wav` (`sfx_klik-*.wav` dan `sfx_teks-*.wav`, status 200, di `/ruang-setara/assets/`);
  - sesudah kembali ke layar kerangka lalu membuka `#main` lagi: tetap 1 konteks dan 2 permintaan;
  - di layar kerangka dan pratinjau, tekanan dan klik tidak membuat konteks.
- [ ] AC-13 **Bunyi klik**, dengan jam uji dijeda, sesudah satu tekanan pembuka yang tidak berpengaruh (`x`) dan kedua berkas siap:
  - urutan keyboard di adegan 1 berikut menghasilkan tepat 10 klik, satu untuk setiap tekanan yang diterima menurut tabel, dan tidak ada klik untuk tekanan yang diabaikan: `Spasi` empat kali sampai pertanyaan tampil (4 klik); `p`, `p`, `t` (3); `2` (1); `Spasi` saat reaksi (0); `Spasi` pada kartu sebelum 600 ms (0) dan sesudah 600 ms (1); `2` di fase bintang (1); `Spasi` saat sapuan (0);
  - jalur yang sama dengan tetikus menghasilkan jumlah klik yang sama;
  - setiap klik memakai bunyi 45 ms dengan laju 1.
- [ ] AC-14 **Bunyi teks**, dengan jam uji yang dijeda:
  - layar 2 adegan 1 menghasilkan tepat 40 bunyi teks 32 ms dengan laju 1,2; waktu setiap bunyi sama dengan simulasi pembaruan 30 ms dengan `textBlipDue`, yaitu saat huruf atau angka ke-0, ke-2, ke-4, dan seterusnya muncul; jarak antarbunyi paling sedikit 30 ms;
  - sesudah teks ditampilkan sekaligus, tidak ada bunyi teks lagi di layar itu;
  - dengan kurangi gerak aktif, tidak ada bunyi teks sama sekali, tetapi klik tetap berbunyi;
  - tidak ada bunyi teks di fase `discuss` sampai `transition`.
- [ ] AC-15 **Volume dan `M`**:
  - setiap bunyi terhubung ke satu `GainNode` bernilai 0,6 yang terhubung ke tujuan konteks;
  - sesudah `M`, tidak ada bunyi untuk tekanan maupun teks, dan wilayah `role="status"` berisi "Suara dimatikan.";
  - sesudah `M` lagi, wilayah berisi "Suara dinyalakan." dan tepat 1 klik diputar;
  - suara yang dimatikan tetap mati sesudah "Main lagi dari adegan 1".
- [ ] AC-16 **Bunyi gagal dimuat**: bila permintaan `.wav` digagalkan di uji, permainan tetap bisa dimainkan sampai layar akhir sementara, tanpa galat halaman, dan tanpa galat konsol selain pesan jaringan untuk permintaan `.wav` yang digagalkan.
- [ ] AC-17 **Main sampai akhir**: dengan keyboard saja di 1280×720, dengan 2 tim (jalur semua A, semua B, semua C) serta 3 dan 4 tim (jalur semua B), permainan berjalan dari adegan 1 sampai layar akhir sementara dengan bintang di setiap adegan, 0 galat konsol, 0 respons 4xx/5xx, dan 0 permintaan ke host lain.
- [ ] AC-18 **Uji unit**:
  - `turn.test.ts` lulus: konstanta; `clockText` (0, 5, 42, 60, 599); `durationText` (10, 42, 60, 72, 90); `filledBlocks` untuk 60 dan 90 detik dan sesudah "+30"; `timerTone` dan `timerStatus`; `canAddTime` (569 dan 570); `dueTicks` (−1, 0, 999, 1.000, 2.999, NaN); `timerAnnouncement` untuk setiap peristiwa dan `null` pada detik biasa; `starsAnnouncement`; `teamSentence`;
  - `sound.test.ts` lulus: konstanta; `isCountedLetter`; `textBlipDue` untuk huruf, spasi, tanda baca, dan beberapa huruf sekaligus; `textBlipCount` sama dengan 33 dan 40 untuk layar 1 dan 2 adegan 1, dan sama dengan banyak bunyi pada simulasi pembaruan 30 ms untuk setiap layar narasi naskah; `createSoundPlayer` dengan konteks tiruan (satu konteks, `resume()` saat `suspended`, bunyi dilewati sebelum siap, laju dan `GainNode` 0,6 sesudah siap, galat pemuatan tanpa pengecualian);
  - `controls.test.ts` disesuaikan: `P` `T` `S`, `0` `1` `2`, `M`, `Spasi` dan `Enter` di fase `stars`, daftar tombol tanpa pengaruh (tanpa `0` dan `p`), serta `bridgeActions` yang berhenti di fase `stars` di keenam adegan bersama reducer dan naskah asli;
  - `layout.test.ts` disesuaikan untuk `#main`, `#main-3`, `#main-4`, dan alamat yang ditolak;
  - `assets.test.ts` lulus dengan kelompok `sounds`, termasuk contoh WAV yang salah (stereo, 8 bit, lebih dari 1 detik, lebih dari 30 KB, nama salah, belum tercatat di `CREDITS.md`);
  - uji unit lain lulus tanpa perubahan, termasuk F-02 AC-14 untuk seluruh `engine/`.
- [ ] AC-19 **Uji lama**: ke-43 uji ujung ke ujung lama lulus, dengan langkah bintang sesudah setiap kartu di 24 uji yang disebut "Rencana uji".
- [ ] AC-20 **Build**:
  - `build:pages` lulus; JS permainan ≤ 150 KB gzip tanpa penanda `__THREE__`; semua `src` dan `href` HTML permainan relatif;
  - kedua bunyi menjadi berkas `sfx_klik-*.wav` dan `sfx_teks-*.wav` di `dist-pages/assets/`, tidak ada data URI `audio/` di JS, dan JS merujuknya dengan URL relatif;
  - `index.html`, `main-*.css`, `main-*.js`, dan `jsx-runtime-*.js` identik byte dengan build sebelum F-07.
- [ ] AC-21 **Pemeriksaan kode**:
  - `tsc --noEmit` seluruh proyek tanpa galat;
  - ESLint `--max-warnings 0` lulus pada semua berkas kode baru dan yang diubah;
  - tidak ada `any`;
  - `engine/` tidak berubah dan tetap tanpa pengatur waktu;
  - pengatur waktu dan pendengar layar permainan dibersihkan saat layar ditutup.
- [ ] AC-22 **Dokumen dan cakupan**:
  - perubahan dokumen sesuai bagian "Perubahan dokumen";
  - `git diff --name-status` hanya memuat berkas yang disebut spesifikasi ini dan tangkapan layar bukti di `tests/F-07/`;
  - `package.json`, `pnpm-lock.yaml`, `scenes.ts`, `references.ts`, `content.test.ts`, dan `Verifikasi_Rujukan.md` tidak berubah, sehingga tidak ada kotak yang dicentang;
  - `install --frozen-lockfile`, `content:check`, dan `test` lulus.

## Rencana uji

| Langkah | Cara | Kriteria |
|---|---|---|
| 1 | `install --frozen-lockfile`, `content:check`, lalu `test` | AC-18, AC-22 |
| 2 | `build:pages`; bandingkan berkas galeri dengan build sebelum F-07; periksa ukuran gzip, penanda three.js, path relatif, berkas `.wav`, dan tidak adanya data URI audio | AC-20 |
| 3 | `test:e2e`: ke-43 uji lama yang disesuaikan, ditambah `e2e/tim-waktu-bintang.spec.ts` dan `e2e/suara.spec.ts` | AC-1 sampai AC-17, AC-19 |
| 4 | Pengatur waktu, masa tunggu, dan bunyi teks: jam uji dijeda dengan `page.clock.pauseAt` di fase narasi, lalu waktu diskusi hanya dimajukan dengan `page.clock.runFor`, dalam dua langkah sesudah unsur tampil (catatan PLAN F-05 dan F-06). **[Build]** Uji F-07 memanggil `pauseAt` sebelum halaman dimuat, sehingga teks per huruf layar pertama juga berhenti di 0 huruf; karena itu urutan AC-13 (`Spasi` empat kali) berlaku apa adanya | AC-3, AC-4, AC-14 |
| 5 | Pop bintang: animasi dijeda dan diatur waktunya lewat `Element.getAnimations()`, karena animasi CSS tidak mengikuti jam uji | AC-6 |
| 6 | Bunyi: skrip awal halaman di uji (bukan kode game) membungkus konstruktor `AudioContext`, `decodeAudioData`, `AudioNode.prototype.connect`, dan `AudioBufferSourceNode.prototype.start`, lalu mencatat waktu, laju, panjang bunyi, keadaan konteks, dan sambungan; bunyi dibedakan dari panjangnya (45 ms klik, 32 ms teks). **[Build]** Simulasi AC-14 di `e2e/suara.spec.ts` memakai salinan aturan `textBlipDue`, karena `ui/sound.ts` mengimpor manifest gambar dan bunyi yang tidak bisa dimuat pemuat uji Playwright; aturan aslinya diuji unit di `sound.test.ts` | AC-12 sampai AC-16 |
| 7 | Salin tangkapan layar ke `docs/sehari-setara/tests/F-07/` (daftar di bawah) | Bukti AC-1 sampai AC-7 |
| 8 | `tsc --noEmit -p tsconfig.json --incremental false`, lalu ESLint | AC-21 |
| 9 | `git diff --name-status` terhadap keadaan sebelum F-07, dan periksa diff dokumen | AC-22 |
| 10 | Daftar periksa manual AGENTS bagian 9 | Tidak ada AC khusus |

Lingkungan uji [Pemilik, usulan 10]: Chromium 141 untuk `@playwright/test` 1.56.1 tidak lagi tersedia di lingkungan agen. Uji dijalankan dengan Chromium 153 lewat berkas konfigurasi pengganti di luar repositori, yang mengimpor `playwright.config.ts` dan hanya menambah jalur browser, sehingga `playwright.config.ts`, `package.json`, dan lockfile tidak berubah. Bila satu perintah terlalu lama, uji dijalankan dalam beberapa bagian dengan konfigurasi yang sama.

Penyesuaian uji lama (fungsi bersama di `e2e/bantuan.ts` menekan tombol bintang sesudah kartu):

- `e2e/alur-permainan.spec.ts`: 9 uji yang melewati kartu dampak mendapat langkah bintang. Uji "reaksi dan kartu dampak" juga memeriksa bahwa `Enter` kedua sesudah "Lanjut" kartu tidak memberi bintang.
- `e2e/kartu-dampak.spec.ts`: 15 uji mendapat langkah bintang.
- **[Build]** Di dua uji yang mengklik ganda "Lanjut" kartu (satu di tiap berkas), bintang diberikan dengan tombol `1` tanpa memeriksa fokus ajakan, karena klik kedua memindahkan fokus ke halaman (bagian "Fokus").
- `e2e/sehari-setara.spec.ts` (16 uji F-04) dan 3 uji awal F-05 tidak berubah.

Tangkapan layar di `tests/F-07/`:

| Berkas | Isi |
|---|---|
| `diskusi_2tim_1280x720.png`, `diskusi_2tim_1024x768.png`, `diskusi_2tim_1920x1080.png` | `#main`, adegan 1, sisa 0:42 |
| `diskusi_4tim_1280x720.png`, `diskusi_4tim_1024x768.png`, `diskusi_4tim_1920x1080.png` | `#main-4`, adegan 4 (giliran Tim Mentari), sisa 0:42 |
| `waktu_10detik_1280x720.png` | Blok `mango`, sisa 0:08 |
| `waktu_habis_1280x720.png` | "Waktunya memilih" |
| `waktu_dijeda_1280x720.png` | "Waktu dijeda", "Jeda" ditekan |
| `bintang_2tim_1280x720.png`, `bintang_4tim_1024x768.png` | Fase bintang; ajakan berfokus, dan ajakan dua baris untuk Tim Mentari |
| `pop_80ms_1280x720.png` | Bingkai besar berkilau pada 80 ms |
| `kartu_tanpa_pita_1024x768.png` | Kartu adegan 1 tanpa pita panggung |

Daftar periksa manual AGENTS bagian 9:

- Bisa dimainkan sampai akhir hanya dengan keyboard: dibuktikan uji AC-17.
- Mode kurangi gerak mematikan sapuan, animasi sprite, gerak indikator, angka melayang, dan pop bintang: dibuktikan uji AC-6 dan uji F-05 serta F-06.
- Tampilan rapi di 1024×768 dan 1920×1080: diperiksa dari tangkapan layar.
- Berjalan lancar di laptop kelas bawah dengan suara mati (`M`): dicatat "belum diuji", untuk dicek pemilik proyek. Selama diskusi, layar permainan digambar ulang sekali per detik.
- Teks terbaca dari jarak sekitar 8 meter di proyektor, papan tim dan pengatur waktu terbaca dari bangku belakang, serta kenyamanan bunyi di kelas: dicatat "belum diuji", untuk dicek pemilik proyek.

Hasil uji ditulis di `docs/sehari-setara/tests/F-07-hasil.md` (templat 11.3).
