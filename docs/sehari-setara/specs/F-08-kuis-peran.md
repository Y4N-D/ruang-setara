# F-08 — Kuis peran penegak hukum

| | |
|---|---|
| Status | Disetujui 27 Oktober 2026 (balasan `Spesifikasi disetujui: F-08`; saran K-1 sampai K-6 dipakai). Catatan Build ditandai **[Build]** |
| Tanggal | 27 Oktober 2026 |
| Rencana | `docs/sehari-setara/PLAN.md`, entri F-08 (disetujui 26 Oktober 2026 dengan balasan `Setuju: F-08`; saran usulan 1–7, 9, dan 10 diterima; usulan 6: Temuan 1 F-07 dibiarkan; usulan 8 tetap terbuka untuk Plan F-09) |

## Ringkasan

F-08 menampilkan kuis peran penegak hukum di adegan 5 layar permainan `sehari-setara/#main`:

1. Sesudah "Lanjut" kartu dampak adegan 5, dialog "Kuis peran" tampil di tempat kartu dampak. Isinya pertanyaan naskah dan empat kartu peran bernomor 1 sampai 4 (Polisi, Jaksa, Advokat, Hakim) dengan ikon peran yang sudah Disetujui.
2. Kelas menjawab bersama, lalu guru mengklik kartu atau menekan `1` sampai `4`. Keempat kartu langsung terbuka dan menampilkan tugas masing-masing. Jawaban tepat dan pilihan kelas ditandai dengan tulisan, dan pita umpan balik memuat dua kalimat yang ramah.
3. Tombol "Lanjut" kuis bekerja 0,6 detik sesudah jawaban, lalu fase bintang alasan F-07 dimulai.
4. Kuis tidak mengubah indikator, bintang, giliran, maupun papan tim. `engine/` tidak berubah.
5. Jembatan sementara F-05 dihapus seluruhnya, karena tidak ada lagi fase yang dilewati tanpa ditampilkan.

Asal setiap nilai ditandai:

| Tanda | Arti |
|---|---|
| **[Dokumen]** | Dari PRD, Design System, atau Architecture; bagiannya disebut |
| **[Pemilik]** | Keputusan pemilik proyek: usulan 1–10 entri F-08 `PLAN.md` (Gerbang 1, 26 Oktober 2026) |
| **[Ukur]** | Diukur dengan huruf asli di Chromium 153 pada empat ukuran layar, dengan maket yang memakai nilai CSS spesifikasi ini, disuntikkan ke kartu dampak adegan 5 hasil build `main` (commit `7b6b7f8`), di luar repositori (27 Oktober 2026) |
| **[Coba]** | Perilaku peramban yang dicoba di Chromium 153 dengan halaman uji kecil di luar repositori (27 Oktober 2026) |
| **[DRAF]** | Usulan baru dari agen di tahap ini. Mohon ditinjau |

Maket dikirim lewat percakapan dan tidak disimpan di repositori. Tangkapan layar hasil sebenarnya disimpan di `tests/F-08/` pada tahap Test.

## Yang perlu ditinjau di Gerbang 2

Usulan Gerbang 1 sudah diterima. Daftar ini hanya memuat rincian baru dari tahap Specify, ditambah satu usulan perubahan teks Gerbang 1 (K-6). Spesifikasi ditulis dengan saran di kolom kedua; sebutkan nomornya bila memilih alternatif.

| No. | Hal | Saran (dipakai spesifikasi ini) | Alternatif |
|---|---|---|---|
| K-1 | Nama kartu bagi pembaca layar | "Peran 1: Polisi". Sesudah dijawab: "Peran 1: Polisi. Menerima laporan dan menyidik.", ditambah "Jawaban tepat." dan/atau "Pilihan kelas." pada kartu yang ditandai | Tanpa awalan "Peran 1:", sehingga nama kartu hanya "Polisi"; nomor tetap terlihat di kartu |
| K-2 | Nama grup keempat kartu bagi pembaca layar | "Peran penegak hukum" | Pertanyaan kuis, seperti grup pilihan F-05 |
| K-3 | Pengantar daftar tugas di pengumuman hasil | "Tugas setiap peran." (kalimat sendiri; rencana menulis "Tugas setiap peran:" dengan titik dua, sehingga terdengar dua titik dua berturut-turut) | Titik dua seperti di rencana |
| K-4 | Kartu Hakim bila kelas menjawab Hakim | Latar `leaf`, cincin pilihan kelas, dan satu label "Jawaban tepat". Dua label sebaris selebar 36,6u, sedangkan ruang dalam kartu 24,7–25,4u [Ukur]. Pembaca layar tetap mendengar "Jawaban tepat. Pilihan kelas.", dan kepala dialog menyebut "Jawaban kelas: Hakim." | Kedua label bertumpuk; setiap kartu bertambah tinggi sekitar 3,9u |
| K-5 | Titik mulai masa tunggu "Lanjut" kuis | Saat keadaan sudah dijawab pertama kali digambar, sama dengan masa tunggu kartu dampak F-06 (laporan F-06, Temuan 3) | Saat tekanan jawaban diterima |
| K-6 | Teks kepala kanan dan pengumuman hasil, sesudah dijawab | "Jawaban kelas: Advokat." Teks rencana, "Kelas menjawab Advokat.", bisa terbaca "kelas membalas advokat", dan menulis nama peran berhuruf kapital di tengah kalimat. Dengan titik dua, nama peran tampil sebagai label, sama dengan di kartu. Teks terpanjang selebar 33,1u, tetap satu baris di keempat ukuran [Ukur] | "Kelas menjawab Advokat." seperti di rencana (usulan 3) |

## Kaitan PRD

| Acuan | Yang dipenuhi F-08 |
|---|---|
| FR-11 | Kuis peran penegak hukum di adegan 5, empat peran, satu jawaban |
| PRD bagian 5, TP 4 | Membedakan peran polisi, jaksa, hakim, dan advokat lewat kuis dan tugas keempat peran |
| PRD bagian 8, adegan 5 | Kuis sesudah kartu dampak; pertanyaan, pilihan, dan jawaban naskah; sesudah dijawab tampil kartu empat peran; kuis tidak memengaruhi indikator |
| PRD bagian 10 | Empat ukuran layar, keyboard, kurangi gerak, kontras teks ≥ 4,5:1, makna tidak hanya lewat warna |
| FR-16 (sebagian) | Pintasan `1` `2` `3` `4` (Architecture bagian 9) |
| Design System bagian 2, 3, 4, 7, 8 | Nada ramah tanpa "kalah"; letak seperti kartu dampak; token warna; komponen "Kuis peran"; gerak dan kurangi gerak |
| Architecture bagian 6, 8, 9, 10 | Fase `quiz`, `JAWAB_KUIS`, dan `LANJUT` sesudah dijawab; pramuat gambar; tombol; dialog dengan fokus terkunci dan `aria-live` |
| Keputusan Gerbang 1 | Usulan 1–10 entri F-08 `PLAN.md` |

## Perilaku

### Urutan adegan 5

| Fase | Panel indikator | Panggung | Panel kanan | Panel bawah | Dialog |
|---|---|---|---|---|---|
| `impact` | Bergerak ke nilai sesudah (F-06) | Disembunyikan | Tertutup | Kosong | Kartu dampak |
| `quiz`, belum dijawab | Nilai sesudah | Disembunyikan | Tertutup | Kosong | Kuis, kartu tertutup |
| `quiz`, sudah dijawab | Nilai sesudah | Disembunyikan | Tertutup | Kosong | Kuis, kartu terbuka |
| `stars` | Nilai sesudah | Reaksi pilihan adegan 5 | Papan tim dan bintang alasan | "Kelas memilih X." dan pilihan terkunci | Tidak ada |

- Di adegan 1 sampai 4 dan 6, "Lanjut" kartu dampak tetap langsung membuka fase `stars` (F-07). Kuis hanya ada di adegan yang punya `roleQuiz`, yaitu adegan 5 (aturan naskah F-03).
- Layar kerangka, pratinjau panggung (`#adegan-N`), dan layar akhir sementara tidak menampilkan kuis.

### Masuk ke kuis

- Diberikan kartu dampak adegan 5 sudah siap (sesudah masa tunggu 600 ms F-06), ketika "Lanjut" kartu diaktifkan (klik, `Enter` atau `Spasi` pada tombol, atau `Spasi` atau `Enter` sebagai pintasan), maka [Pemilik, usulan 1 dan 7]:
  1. `LANJUT` dikirim satu kali, dan fase menjadi `quiz`;
  2. kartu dampak ditutup, dan dialog kuis langsung tampil di tempat yang sama, tanpa animasi masuk dan tanpa sapuan;
  3. fokus pindah ke judul "Kuis peran" [Pemilik, usulan 6];
  4. wilayah `aria-live="polite"` berisi pengumuman pembuka [Pemilik, usulan 5];
  5. bunyi klik F-07 diputar satu kali, karena tekanan itu diterima.
- Selama kuis, panggung disembunyikan (`visibility: hidden`), panel bawah kosong, dan panel kanan tertutup dialog. Bilah atas dan panel indikator tetap terlihat [Pemilik, usulan 1; risiko "Fokus" dan "Pita panggung" di rencana].
- Ikon kuis sudah dimuat sebelum kuis tampil. Saat adegan 4 dimulai, layar permainan memuat gambar adegan 5 lebih dulu (Architecture bagian 8). Sejak F-08, pemuatan itu juga mencakup keempat ikon peran serta ikon hati dan tanda tanya, karena adegan 5 punya `roleQuiz` [DRAF].

### Dialog kuis

- Dialog menempati kotak yang sama dengan kartu dampak F-06: kiri di tepi kiri bingkai panggung (lebar layar ÷ 2 − 160k), atas 9,2u, kanan 2u, dan bawah 1,2u, dengan bingkai piksel F-05 [Pemilik, usulan 1].
- Dari atas ke bawah [Pemilik, usulan 1]:
  - **kepala** berlatar `mist`: judul "Kuis peran" di kiri. Sesudah dijawab, di kanan: "Jawaban kelas: {nama peran}." [K-6]. Sebelum dijawab, kepala kanan belum ada di halaman;
  - **pertanyaan**: `roleQuiz.question` adegan 5, tanpa perubahan;
  - **empat kartu peran** sebaris dengan urutan `ROLES` (Polisi, Jaksa, Advokat, Hakim), sama lebar dan sama tinggi, tidak diacak [Pemilik, usulan 2];
  - **pita umpan balik**, hanya sesudah dijawab (usulan 3);
  - **kaki** berisi tombol "Lanjut" di kanan, di tempat yang sama dengan "Lanjut" kartu dampak.
- Setiap kartu peran berisi, dari atas:
  - baris berisi kotak nomor (1 sampai 4, sama dengan kotak A/B/C pilihan F-05) dan ikon peran D-08 `roleIcons[id]` berukuran 32p × 32p;
  - nama peran (`ROLES[i].label`);
  - ruang tugas setinggi tiga baris. Sebelum dijawab, ruang itu berupa kotak `mist` bertanda "?", dan teks tugas belum ada di halaman. Sesudah dijawab, ruang itu berisi `ROLES[i].tugas`;
  - ruang label setinggi satu baris, yang berisi "Jawaban tepat" atau "Pilihan kelas" bila kartu itu ditandai, dan kosong bila tidak.

  Karena ruang tugas dan label selalu dicadangkan, ukuran dan letak kartu sama sebelum dan sesudah dijawab.
- Kuis tidak punya pengatur waktu [Pemilik, usulan 2].

### Menjawab

- Diberikan kuis belum dijawab, ketika sebuah kartu peran diklik, `Enter` atau `Spasi` ditekan pada kartu yang berfokus, atau `1`, `2`, `3`, atau `4` ditekan (peran ke-n di `ROLES`), maka [Pemilik, usulan 2, 3, 4, dan 6]:
  1. `JAWAB_KUIS` dengan id peran itu dikirim, dan `quizAnswer` menjadi peran itu (F-02);
  2. keempat kartu terbuka serentak dan menampilkan tugasnya;
  3. kartu Hakim (`roleQuiz.answer`) berlatar `leaf` dengan label "Jawaban tepat";
  4. kartu pilihan kelas mendapat cincin dalam `ink` 2p, seperti pilihan yang diambil F-05. Bila pilihan itu bukan Hakim, kartunya juga berlatar `sun` dengan label "Pilihan kelas" [K-4];
  5. kartu lain tetap `cream`;
  6. kepala kanan menampilkan "Jawaban kelas: {nama peran}." [K-6];
  7. pita umpan balik tampil di bawah kartu: latar `leaf` dengan ikon hati bila tepat, atau `mango` dengan ikon tanda tanya bila keliru, berisi dua kalimat (bagian "Teks yang tampil");
  8. keempat kartu terkunci (`disabled`), sama dengan pilihan yang sudah diambil F-05;
  9. "Lanjut" kuis berubah dari nonaktif menjadi tertahan, dan fokus pindah ke tombol itu;
  10. wilayah `aria-live` berisi pengumuman hasil;
  11. bunyi klik diputar satu kali.
- Hanya jawaban pertama yang diterima (F-02). Sesudah dijawab, angka `1` sampai `4` tidak berpengaruh dan tidak berbunyi, dan kartu yang terkunci tidak bisa diklik.
- Pada klik ganda sebuah kartu, klik pertama menjawab, dan klik kedua jatuh di kartu yang sudah terkunci. Chromium tidak mengirim `mousedown` ke tombol yang terkunci dan memindahkan fokus dari "Lanjut" ke dialog itu sendiri [Coba]. Jawaban dan bunyi tetap satu, dan fokus tetap di dalam dialog (bagian "Fokus dan dialog").
- Menahan `Enter` pada kartu yang berfokus hanya menjawab sekali (bagian "Keyboard", tombol yang ditahan).
- Kuis tidak mengubah `meters`, `flags`, `history`, bintang tim, maupun giliran. Mesin hanya menyimpan `quizAnswer`, yang dikosongkan saat adegan 6 dimulai dan saat "Main lagi" (F-02) [Pemilik, usulan 2].

### "Lanjut" kuis dan masa tunggu

- Sebelum dijawab, "Lanjut" kuis nonaktif [Pemilik, usulan 6]:
  - tombol ber-`aria-disabled="true"` dan `data-nonaktif`, tetap terlihat dengan latar `mist` dan teks `dusk`, bisa difokus, dan tidak berubah warna saat diarahkan tetikus;
  - saat berfokus lewat keyboard (`:focus-visible`), tombol tetap `mist` dengan teks `dusk`, ditambah kursor ▶ dan garis fokus 2 px `ink` berjarak 2 px, sama dengan tombol nonaktif F-07 [Ukur];
  - klik, `Enter`, dan `Spasi` padanya, serta `Spasi` dan `Enter` sebagai pintasan, tidak berpengaruh dan tidak berbunyi.
- Sesudah dijawab, `data-nonaktif` hilang, dan tombol tertahan selama 600 ms [Pemilik, usulan 6; Dokumen: Design System bagian 8, masa tunggu kartu dampak]:
  - tombol tampil biasa (`cream`; saat `:focus-visible`, `sun` dengan kursor ▶, sama dengan "Lanjut" kartu dampak selama masa tunggu), tetap ber-`aria-disabled="true"`, dan tidak berubah warna saat diarahkan tetikus;
  - masa tunggu dihitung dengan `performance.now()`, mulai saat keadaan sudah dijawab pertama kali digambar [K-5];
  - waktu diperiksa saat tekanan diterima (`continueFromQuiz` di `PlayScreen.tsx`), bukan dari tampilan tombol, sama dengan pengaman "Lanjut" kartu dampak F-06. Jadi tekanan pada 600 ms diterima walaupun tampilan tombol belum diperbarui;
  - tampilan tombol (`aria-disabled`) diperbarui oleh satu pengatur waktu yang dibersihkan saat fase berganti atau layar ditutup. Reducer tetap tanpa `setTimeout`;
  - masa tunggu yang sama berlaku dengan atau tanpa kurangi gerak.
- Diberikan sudah dijawab dan 600 ms berlalu, ketika "Lanjut" kuis diaktifkan (klik, `Enter` atau `Spasi` pada tombol, atau `Spasi` atau `Enter` sebagai pintasan saat fokus tidak di tombol, misalnya di judul atau di dialog), maka:
  1. `LANJUT` dikirim satu kali, dan fase menjadi `stars`;
  2. dialog ditutup, panggung terlihat lagi dengan reaksi pilihan adegan 5, panel kanan berisi papan tim dan bintang alasan, dan panel bawah berisi "Kelas memilih X." dengan pilihan terkunci (F-07);
  3. fokus pindah ke ajakan bintang (F-07);
  4. bunyi klik diputar satu kali.
- "Lanjut" kuis hanya berlaku sekali per adegan. Klik ganda dan tekanan kedua tidak berpengaruh lagi, dan tombol yang ditahan tidak mengklik berulang (bagian "Keyboard"). Di fase `stars`, `Spasi` dan `Enter` tidak memberi bintang (F-07).
- Temuan 1 F-07 dibiarkan [Pemilik, usulan 6a]: pada klik ganda "Lanjut" kuis, klik kedua jatuh di panel bawah fase bintang, sehingga fokus bisa pindah dari ajakan ke halaman. Bintang tetap bisa diberikan lewat tombol atau `0` `1` `2`.

### Pengaman klik ganda saat masuk

- Kartu peran berada 28,0–65,6u dari atas layar, sedangkan "Lanjut" kartu dampak berada 90,3–97,1u. Jaraknya paling sedikit 24,7u (1024×768) [Ukur].
- Di tempat "Lanjut" kartu dampak ada "Lanjut" kuis, yang masih nonaktif. Klik kedua dari klik ganda pada "Lanjut" kartu dampak jatuh di tombol itu, sehingga tidak berpengaruh, tidak berbunyi, dan fokus tetap di dalam dialog [Pemilik, usulan 6].
- `Enter` atau `Spasi` kedua sebelum dijawab tidak berpengaruh, karena `LANJUT` di fase `quiz` ditolak sebelum `JAWAB_KUIS` (F-02) dan tidak ada lagi jembatan yang menjawab dari naskah.
- Tidak ada masa tunggu di awal kuis.

### Fokus dan dialog

- Kuis memakai `role="dialog"` dan `aria-modal="true"`, bernama "Kuis peran" (dari judulnya). Judul berupa `<h2>`, di bawah `<h1>` tersembunyi F-05 [Dokumen: Architecture bagian 10].
- Saat kuis tampil, fokus berada di judul, yang bisa difokus lewat kode (`tabIndex=-1`) tetapi tidak lewat Tab. Saat `:focus-visible`, judul diberi garis fokus 2 px `ink` berjarak 4 px, sama dengan judul kartu dampak. Sesudah klik tetikus, peramban boleh tidak menampilkan garis itu.
- Fokus terkunci di dalam dialog [Pemilik, usulan 1]:
  - sebelum dijawab, urutan Tab adalah kartu 1, 2, 3, 4, lalu "Lanjut" (nonaktif), lalu kembali ke kartu 1; Shift+Tab berjalan sebaliknya;
  - dari judul, Tab berpindah ke kartu 1 dan Shift+Tab ke "Lanjut";
  - sesudah dijawab, keempat kartu terkunci, sehingga Tab dan Shift+Tab tetap di "Lanjut", seperti di kartu dampak;
  - dialog sendiri bisa difokus lewat kode (`tabIndex=-1`), sehingga klik di ruang kosong dialog (misalnya pada pertanyaan atau di bawah kartu) memindahkan fokus ke dialog, bukan keluar dari dialog [Coba]; dialog yang berfokus tidak diberi garis fokus. Dari situ, Tab berpindah ke elemen pertama yang bisa difokus, dan Shift+Tab ke elemen terakhir;
  - sesudah klik ganda pada kartu, fokus berada di dialog (bagian "Menjawab"). Karena keempat kartu sudah terkunci, Tab dan Shift+Tab memindahkan fokus ke "Lanjut", dan `Spasi` atau `Enter` berlaku sebagai pintasan "Lanjut" kuis sesudah masa tunggu.
- Kartu yang berfokus lewat keyboard (`:focus-visible`) atau diarahkan tetikus (sebelum dijawab) berlatar `sun` dengan kursor ▶, sama dengan pilihan F-05 [Dokumen: Architecture bagian 9, "Fokus keyboard selalu terlihat"].
- Mengubah ukuran jendela selama kuis, misalnya saat masuk layar penuh, hanya mengubah letak dan ukuran dialog. Jawaban, fokus, isi wilayah `aria-live`, dan masa tunggu tidak berubah, dan fokus tidak dipindah ke judul lagi [DRAF].
- Kuis muncul sendiri tanpa tombol pemicu, jadi aturan "fokus kembali ke tombol pemicu" di Architecture bagian 10 diperjelas seperti untuk kartu dampak: sesudah "Lanjut" kuis, fokus pindah ke ajakan bintang [Pemilik, usulan 1].

### Pembaca layar

- Pengumuman memakai wilayah `aria-live="polite"` yang sama dengan narasi dan kartu dampak, bukan wilayah `role="status"` F-07 [Pemilik, usulan 5]:
  - saat kuis tampil: pengumuman pembuka;
  - sesudah dijawab: pengumuman hasil, yang menggantikan pengumuman pembuka.

  Keduanya ditulis satu kali, utuh, dan tidak diulang saat layar digambar ulang.
- Keempat kartu berada dalam grup bernama "Peran penegak hukum" [K-2]. Nama setiap kartu ditetapkan lewat `aria-label` dari fungsi `quizCardName`, sehingga isinya pasti [K-1]:
  - sebelum dijawab: "Peran {n}: {nama}", misalnya "Peran 1: Polisi";
  - sesudah dijawab: "Peran {n}: {nama}. {tugas}", ditambah " Jawaban tepat." pada kartu jawaban dan " Pilihan kelas." pada kartu pilihan kelas, misalnya "Peran 4: Hakim. Memutus. Jawaban tepat. Pilihan kelas.".

  Setiap nama memuat nama peran yang terlihat.
- Kotak nomor, ikon, dan "?" disembunyikan dari pembaca layar. Ikon emosi di pita umpan balik bersifat hiasan (`aria-hidden="true"`), karena kata "Tepat!" atau "Belum tepat." sudah ada. Ikon dipasang sebagai gambar latar, seperti ikon F-06 (aturan ESLint `@next/next/no-img-element`).
- Wilayah `role="status"` F-07 tidak dipakai kuis, sehingga isinya tidak berubah karena kuis. Satu-satunya yang ditulis di situ selama kuis adalah pengumuman `M`, yang tetap berlaku (F-07).

### Tepat atau keliru tidak hanya lewat warna

- Hasil jawaban selalu tampil sebagai tulisan dan ikon [Pemilik, usulan 3 dan 5; Dokumen: Architecture bagian 10]:
  - kata pembuka "Tepat!" atau "Belum tepat." di pita umpan balik;
  - ikon hati atau tanda tanya;
  - label "Jawaban tepat" dan "Pilihan kelas" di kartu;
  - "Jawaban kelas: {nama peran}." di kepala [K-6].
- Dalam mode warna paksa (`forced-colors: active`):
  - sudut terpotong dimatikan seperti F-05, dan latar diganti warna sistem;
  - cincin pilihan kelas hilang, karena peramban menghapus `box-shadow` dalam mode ini, sama dengan pilihan yang diambil F-05;
  - makna tetap terbaca dari label "Jawaban tepat" dan "Pilihan kelas", kepala kanan, dan kalimat umpan balik. Bila kelas menjawab Hakim, pilihan kelas terbaca dari kepala kanan "Jawaban kelas: Hakim." dan kata "Tepat!" (K-4).

### Keyboard

| Tombol | Berlaku di | Fungsi |
|---|---|---|
| `1` `2` `3` `4` | `quiz`, belum dijawab | Menjawab Polisi, Jaksa, Advokat, atau Hakim (peran ke-n di `ROLES`) [Pemilik, usulan 4] |
| `Spasi`, `Enter` | `quiz`, sudah dijawab, sesudah 600 ms | "Lanjut" kuis, bila fokus tidak di tombol. Pada tombol yang berfokus, keduanya ditangani browser sebagai klik tombol itu (F-05) |
| `M` | `intro` sampai `transition`, termasuk `quiz` | Suara mati atau nyala (F-07) |

- Di fase `quiz`, tombol lain tidak berpengaruh dan tidak berbunyi, antara lain `0`, `5` sampai `9`, huruf (termasuk `a` `b` `c` dan `p` `t` `s`), dan `Escape`. Arti `Esc` selama dialog diputuskan di F-10.
- `1` `2` `3` tetap hanya memilih di fase `discuss`, dan `0` `1` `2` tetap hanya memberi bintang di fase `stars`. `4` tidak berpengaruh di fase lain.
- Aturan F-05 tetap berlaku: tekanan bersama Ctrl, Alt, atau Meta, tekanan berulang karena tombol ditahan, huruf yang sedang disusun, tekanan di kolom isian, dan tekanan selama pergantian adegan diabaikan.
- Tombol yang ditahan [DRAF; Coba]:
  - aturan F-05 di atas hanya berlaku untuk pintasan. Pada tombol yang berfokus, peramban mengubah setiap pengulangan `Enter` menjadi klik. Menahan `Enter` pada kartu menghasilkan satu jawaban, lalu satu klik "Lanjut" untuk setiap pengulangan, karena fokus sudah pindah ke "Lanjut". Pengulangan sesudah 600 ms akan melewati umpan balik;
  - karena itu, dialog kuis membatalkan (`preventDefault()`) setiap `keydown` `Enter` atau `Spasi` yang bertanda `repeat`, di elemen mana pun di dalam dialog;
  - tekanan pertama tetap bekerja biasa, dan `Spasi` yang ditahan tetap menghasilkan satu klik saat dilepas.

### Bunyi

- Bunyi klik F-07 diputar sekali untuk setiap tekanan yang diterima kuis: jawaban (klik, `Enter` atau `Spasi` pada kartu, atau `1` sampai `4`) dan "Lanjut" kuis sesudah masa tunggu [Pemilik, usulan 6; Dokumen: keputusan Gerbang 2 F-07, S-2].
- Tekanan yang diabaikan tidak berbunyi, termasuk "Lanjut" kuis sebelum dijawab atau selama masa tunggu, angka sesudah dijawab, dan tombol yang tidak berlaku.
- Tidak ada bunyi baru. Bunyi jawaban tepat dan keliru milik F-13.

### Kurangi gerak

- Kuis tidak punya animasi. Kartu terbuka serentak tanpa gerak, sehingga tampilan dan perilaku kuis sama dengan atau tanpa kurangi gerak [Pemilik, usulan 5].
- Masa tunggu "Lanjut" kuis tetap 600 ms, dan bunyi klik tetap ada, karena bunyi bukan gerak (F-07).

### Jembatan sementara dihapus

[Pemilik, usulan 7]

- "Lanjut" kartu dampak hanya mengirim `LANJUT`, sehingga fase berikutnya ditentukan reducer: `quiz` di adegan 5 dan `stars` di adegan lain.
- Yang dihapus:
  - `bridgeActions` di `ui/controls.ts`;
  - `BRIDGE_PHASES` dan `bridge()` di `PlayScreen.tsx`, termasuk `Spasi` dan `Enter` di fase `quiz` yang dulu menjawab dari naskah;
  - tombol "Lanjut" jembatan di baris status `ChoicePanel` (properti `bridgeReady` dan `onBridge`);
  - teks `copy.play.bridgeNext`;
  - aturan CSS `.ss-question-row .ss-next`;
  - fase `quiz` di `CHOICE_PHASES`;
  - uji jembatan di `controls.test.ts`, serta nama dan pemilih tombol jembatan di uji ujung ke ujung (bagian "Rencana uji");
  - komentar yang menyebut jembatan: kepala berkas `ChoicePanel.tsx` dan `PlayScreen.tsx`, keterangan `BRIDGE_PHASES` dan `bridge()`, serta keterangan `NEXT_PHASES` di `controls.ts`, yang kini berbunyi "narasi, kartu dampak, dan kuis".
- Ref `bridgeUsed` di `PlayScreen.tsx` diganti nama menjadi `cardUsed`, karena kini hanya menjaga "Lanjut" kartu dampak sekali per adegan.
- Yang tetap ada karena milik fitur lain: `startActions` beserta `#main`, `#main-3`, dan `#main-4` (F-10), serta layar akhir sementara dan `restartActions` (F-09).

### Galeri dan aset

- Uji palet F-12 tetap lulus. Warna di aturan CSS baru hanya token yang sudah ada (`--ss-ink`, `--ss-dusk`, `--ss-mist`, `--ss-cream`, `--ss-white`, `--ss-sun`, `--ss-leaf`, `--ss-mango`). Tidak ada token `:root` baru.
- Berkas galeri tidak berubah. Uji build membandingkan `index.html`, `main-*.css`, `main-*.js`, dan `jsx-runtime-*.js` dengan build sebelum F-08 (catatan PLAN "Semua fitur").

## Status antarmuka

| Bagian | Status | Tampilan |
|---|---|---|
| Dialog kuis | Belum dijawab | Kepala `mist` dengan judul saja; pertanyaan; empat kartu tertutup; tanpa pita umpan balik; "Lanjut" nonaktif |
| | Tepat | Kepala kanan "Jawaban kelas: Hakim."; kartu terbuka; kartu Hakim `leaf` dengan cincin dan "Jawaban tepat"; pita `leaf` dengan ikon hati |
| | Belum tepat | Kepala kanan "Jawaban kelas: {peran}."; kartu Hakim `leaf` dengan "Jawaban tepat"; kartu pilihan kelas `sun` dengan cincin dan "Pilihan kelas"; pita `mango` dengan ikon tanda tanya |
| | Berfokus (klik di ruang kosong, atau klik ganda pada kartu) | Tanpa garis fokus; Tab berikutnya masuk ke elemen pertama yang bisa difokus, dan Shift+Tab ke elemen terakhir |
| | Mode warna paksa | Sudut terpotong dimatikan; latar diganti warna sistem; cincin pilihan kelas hilang; label, kepala kanan, dan kalimat umpan balik tetap terbaca |
| Kartu peran | Biasa (belum dijawab) | `cream`; nomor, ikon, nama, dan kotak `mist` bertanda "?" (`dusk`) |
| | `:focus-visible` atau arah tetikus (belum dijawab) | `sun` dengan kursor ▶ |
| | Terbuka | `cream` dengan teks tugas; terkunci, tanpa warna arah tetikus, kursor biasa |
| | Jawaban tepat | `leaf` dengan label "Jawaban tepat" |
| | Pilihan kelas yang keliru | `sun` dengan cincin dalam `ink` 2p dan label "Pilihan kelas" |
| | Pilihan kelas yang tepat | `leaf` dengan cincin dalam `ink` 2p dan label "Jawaban tepat" |
| "Lanjut" kuis | Nonaktif (belum dijawab) | `mist`, teks `dusk`, `aria-disabled="true"`, dan `data-nonaktif`; saat `:focus-visible`, kursor ▶ dan garis fokus 2 px `ink` berjarak 2 px, seperti tombol nonaktif F-07; tanpa warna arah tetikus |
| | Tertahan (0–600 ms sesudah jawaban) | Tampilan biasa `cream` (saat `:focus-visible`, `sun` dengan kursor ▶), `aria-disabled="true"` tanpa `data-nonaktif`, tanpa warna arah tetikus |
| | Siap | Seperti `ss-next` F-05: `cream`; saat `:focus-visible` atau arah tetikus, `sun` dengan kursor ▶ |
| Judul | `:focus-visible` | Garis fokus 2 px `ink` berjarak 4 px |
| Panggung, panel kanan, panel bawah | Fase `quiz` | Panggung disembunyikan, panel kanan tertutup dialog, panel bawah kosong |
| Kosong | Tidak berlaku | Naskah selalu punya `roleQuiz` di adegan 5 dan tepat empat peran (aturan skema F-03, diperiksa `content:check`) |
| Galat | Ikon peran atau ikon tanda tanya gagal dimuat | Nomor, nama, tugas, label, dan kalimat tetap tampil, dan kuis tetap bisa dijawab dan dilanjutkan. Diuji dengan permintaan ikon yang digagalkan (AC-3) |

Kontras teks [Ukur]:

| Pasangan | Rasio |
|---|---|
| `ink` di atas `cream` (pertanyaan, nama, tugas, "Lanjut") | 13,3 : 1 [Dokumen] |
| `cream` di atas `ink` (nomor, label) | 13,3 : 1 |
| `ink` di atas `mist` (judul dan kepala kanan) | 9,5 : 1 |
| `ink` di atas `sun` (fokus, pilihan kelas yang keliru) | 9,9 : 1 [Dokumen] |
| `ink` di atas `leaf` (jawaban tepat, pita tepat) | 8,3 : 1 [Dokumen] |
| `ink` di atas `mango` (pita belum tepat) | 6,9 : 1 [Dokumen] |
| `dusk` di atas `mist` ("?" dan "Lanjut" nonaktif, juga saat berfokus) | 5,9 : 1 [Dokumen] |

## Tata letak dan ukuran [Ukur]

p adalah satu piksel antarmuka (`--ss-px`, F-05): 2 px di 1280×720, 1366×768, dan 1024×768, serta 3 px di 1920×1080.

| Bagian | Nilai |
|---|---|
| Dialog | Letak sama dengan kartu dampak F-06; bingkai piksel F-05 (garis `ink` 2p, sudut terpotong p, sorotan `white` p), latar `cream`; lapisan sama dengan kartu dampak (z 60) |
| Kepala | Latar `mist`; jarak dalam 0,9u atas-bawah dan 2,4u kiri-kanan; garis bawah `ink` 2p; celah 1,2u. Judul Press Start 2P 2,8u, tinggi baris 1,3. Kepala kanan Pixelify Sans 2,8u, tinggi baris 1,3, satu baris |
| Isi | Jarak dalam 1,4u atas, 2,4u kiri-kanan, dan 0,6u bawah; celah antarbagian 1,2u |
| Pertanyaan | Pixelify Sans 3,6u, tinggi baris 1,35 (sama dengan pertanyaan F-05) |
| Baris kartu | Empat kolom sama lebar, celah 1,5u, tinggi kartu disamakan |
| Kartu | Bingkai piksel F-05, latar `cream`; jarak dalam 1u atas-bawah, 2,6u kiri (ruang ▶), dan 1,2u kanan; isi bertumpuk dengan celah 0,6u |
| Kotak nomor | Sama dengan kotak A/B/C F-05: jarak dalam 0,6u, Press Start 2P 2,8u, tinggi baris 1, `cream` di atas `ink`; celah 1,2u ke ikon |
| Ikon peran | 32p × 32p, piksel tajam |
| ▶ | 2,2u, 0,6u dari tepi kiri kartu, sejajar tengah ikon; hanya terlihat saat `:focus-visible` atau arah tetikus |
| Nama peran | Press Start 2P 2,8u, tinggi baris 1,3, satu baris |
| Ruang tugas | Pixelify Sans 3,6u, tinggi baris 1,3, tinggi minimal tiga baris (14,04u). Saat tertutup: kotak `mist` selebar kartu dengan "?" Press Start 2P 2,8u `dusk` di tengah |
| Label | Pixelify Sans 2,5u, tinggi baris 1,3, jarak dalam 0,6u kiri-kanan, `cream` di atas `ink`, satu baris; ruangnya selalu dicadangkan (3,25u) |
| Pita umpan balik | Jarak dalam 0,6u atas-bawah dan 1,2u kiri-kanan; celah 1,2u; ikon emosi D-09 16p × 16p, 0,4u dari atas; dua kalimat Pixelify Sans 3,1u, tinggi baris 1,3, berjarak 0,4u |
| Kaki | Jarak dalam 0,4u atas, 2,4u kiri-kanan, dan 1,2u bawah; tombol `ss-next` F-05 di kanan |

Hasil pengukuran:

| | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
|---|---|---|---|---|
| Kiri dialog (tepi kiri bingkai panggung) | 44,4u | 47,2u | 44,4u | 42,7u |
| Kepala | 9,8–15,8u | 9,7–15,7u | 9,8–15,8u | 9,9–16,0u |
| Lebar kepala kanan terpanjang ("Jawaban kelas: Advokat."), satu baris | 33,1u | 33,1u | 33,1u | 33,1u |
| Pertanyaan, dua baris | 17,2–26,9u | 17,1–26,8u | 17,2–26,9u | 17,4–27,1u |
| Kartu (atas–bawah) | 28,1–62,8u | 28,0–62,1u | 28,1–62,8u | 28,3–65,6u |
| Lebar × tinggi kartu | 30,2 × 34,7u | 29,6 × 34,1u | 30,2 × 34,7u | 30,6 × 37,2u |
| Ikon peran | 64 px | 64 px | 96 px | 64 px |
| Pita umpan balik, sesudah dijawab | 64,0–73,6u | 63,3–72,9u | 64,0–73,6u | 66,8–76,4u |
| "Lanjut" kuis, sama dengan "Lanjut" kartu dampak (atas–bawah; kiri–kanan) | 90,7–97,1u; 157,2–172,8u | 90,8–97,1u; 157,3–172,9u | 90,7–97,1u; 157,2–172,8u | 90,3–96,9u; 156,7–172,7u |
| Jarak bawah kartu ke "Lanjut" kartu dampak | 27,9u | 28,7u | 27,9u | 24,7u |
| Sisa di bawah isi: belum dijawab / sudah dijawab | 26,9u / 16,1u | 27,7u / 16,9u | 26,9u / 16,1u | 23,7u / 12,9u |

- Tidak ada teks yang meluap ke samping. Tugas polisi tiga baris, tugas lain satu baris, dan setiap kalimat umpan balik satu baris.
- Bila di komputer lain pertanyaan dan kedua kalimat umpan balik masing-masing bertambah satu baris (+12,9u), isi masih muat di 1024×768.
- Panel indikator kiri tidak tertutup: tepi kanannya sama dengan tepi kiri dialog.

## Teks yang tampil (final)

Teks baru berasal dari `app/sehari-setara/content/copy.ts`. Pertanyaan berasal dari `scenes.ts`, dan nama serta tugas peran dari `roles.ts`, tanpa perubahan.

| Tempat | Teks | Asal |
|---|---|---|
| Judul dialog (juga nama dialog) | Kuis peran | Pemilik, usulan 1 (draf baru) |
| Pertanyaan | Jika perkara ini sampai ke pengadilan, siapa yang memeriksa, mengadili, dan memutusnya? | PRD bagian 8 (`roleQuiz.question`) |
| Nomor kartu | 1, 2, 3, 4 | Pemilik, usulan 4 |
| Nama peran | Polisi, Jaksa, Advokat, Hakim | PRD bagian 8 (`ROLES`) |
| Tugas peran | Menerima laporan dan menyidik. / Menuntut. / Mendampingi. / Memutus. | PRD bagian 8 (`ROLES`) |
| Tanda kartu tertutup | ? | Pemilik, usulan 1 |
| Label | Jawaban tepat; Pilihan kelas | Pemilik, usulan 3 (draf baru) |
| Kepala kanan, sesudah dijawab | Jawaban kelas: {nama peran}. (misalnya "Jawaban kelas: Advokat.") | DRAF (K-6), mengganti "Kelas menjawab {nama peran}." dari usulan 3 |
| Umpan balik, jawaban Hakim | Tepat! Hakimlah yang memeriksa, mengadili, dan memutus perkara. | Pemilik, usulan 3 (draf baru) |
| Umpan balik, jawaban lain | Belum tepat. Hakimlah yang memeriksa, mengadili, dan memutus perkara. | Pemilik, usulan 3 (draf baru) |
| Kalimat kedua, untuk semua jawaban | Setiap peran punya tugas sendiri agar perkara diproses dengan adil. | Pemilik, usulan 3 (draf baru) |
| Tombol | Lanjut | Teks F-05 |
| Nama grup kartu (hanya pembaca layar) | Peran penegak hukum | DRAF (K-2) |
| Nama kartu (hanya pembaca layar) | Peran 1: Polisi / Peran 1: Polisi. Menerima laporan dan menyidik. / … Jawaban tepat. / … Pilihan kelas. | DRAF (K-1), memperinci usulan 5 |

Pengumuman di wilayah `aria-live`:

1. Pengumuman pembuka [Pemilik, usulan 5]:

   > Kuis peran. Jika perkara ini sampai ke pengadilan, siapa yang memeriksa, mengadili, dan memutusnya? Pilihannya: 1 Polisi, 2 Jaksa, 3 Advokat, 4 Hakim.

2. Pengumuman hasil [Pemilik, usulan 5; pengantar "Tugas setiap peran." DRAF K-3; "Jawaban kelas: {nama peran}." DRAF K-6], disusun dari bagian berikut dan dipisahkan satu spasi: `{Tepat! atau Belum tepat.}` `Jawaban kelas: {nama peran}.` `Hakimlah yang memeriksa, mengadili, dan memutus perkara.` `Tugas setiap peran.` `{nama}: {tugas}` untuk keempat peran berurutan, lalu `Setiap peran punya tugas sendiri agar perkara diproses dengan adil.` Contoh jawaban Advokat:

   > Belum tepat. Jawaban kelas: Advokat. Hakimlah yang memeriksa, mengadili, dan memutus perkara. Tugas setiap peran. Polisi: Menerima laporan dan menyidik. Jaksa: Menuntut. Advokat: Mendampingi. Hakim: Memutus. Setiap peran punya tugas sendiri agar perkara diproses dengan adil.

Teks "Hakimlah" menyebut jawaban naskah (`roleQuiz.answer`, hakim). Uji unit memastikan kalimat itu diawali nama peran jawaban, sehingga perubahan jawaban naskah di kemudian hari langsung ketahuan.

Teks bilah atas, kotak narasi, pilihan, kartu dampak, papan tim, bintang alasan, layar kerangka, pratinjau, layar akhir sementara, dan naskah tidak berubah. Satu teks dihapus: `copy.play.bridgeNext` ("Lanjut" jembatan).

## Data dan aksi

`engine/` tidak berubah. `GameState`, tipe, reducer, dan aturan F-02 dipakai apa adanya, termasuk `quizAnswer` dan `isQuizCorrect`. Tidak ada aksi reducer baru.

### Aksi yang dikirim layar permainan

| Saat | Aksi |
|---|---|
| Sampai "Lanjut" kartu dampak | Sama dengan F-05, F-06, dan F-07 |
| "Lanjut" kartu dampak, sesudah 600 ms, sekali per adegan | `LANJUT` saja: adegan 5 ke fase `quiz`, adegan lain ke fase `stars`. Sebelumnya `bridgeActions(scene)` |
| Kartu peran (klik, `Enter` atau `Spasi`) atau `1` sampai `4`, fase `quiz`, belum dijawab | `JAWAB_KUIS` dengan id peran |
| "Lanjut" kuis, sudah dijawab, sesudah 600 ms, sekali per adegan | `LANJUT` (fase `quiz` ke `stars`) |
| Tombol bintang atau `0` `1` `2`, dan seterusnya | Sama dengan F-07 |

Klik dan pengumuman hanya diputar atau ditulis bila aksinya memang mengubah keadaan, yaitu bila reducer mengembalikan objek keadaan baru (aturan F-07).

### Berkas dan ekspor

`app/sehari-setara/ui/quiz.ts` berisi fungsi murni yang diuji unit:

| Ekspor | Isi |
|---|---|
| `QUIZ_GUARD_MS` | 600, sama dengan `IMPACT_GUARD_MS` F-06 |
| `QuizCard` | `{ role: RoleInfo; number: 1 \| 2 \| 3 \| 4; open: boolean; correct: boolean; chosen: boolean; mark: "tepat" \| "pilihan" \| null }` |
| `roleForNumber(number, roles)` | Peran ke-n (1 sampai 4) di `roles`, atau `undefined` |
| `quizCards(roles, answer, correctId)` | Empat `QuizCard` berurutan. Sebelum dijawab semuanya tertutup tanpa tanda; sesudah dijawab semuanya terbuka, `correct` hanya pada `correctId`, `chosen` hanya pada `answer`, dan `mark` bernilai `"tepat"` pada kartu jawaban, `"pilihan"` pada pilihan kelas yang keliru, dan `null` pada kartu lain |
| `quizFeedback(isCorrect)` | Dua kalimat umpan balik; `isCorrect` benar bila kelas menjawab peran `roleQuiz.answer` (`isQuizCorrect` F-02) |
| `quizCardName(card)` | Nama kartu bagi pembaca layar (bagian "Pembaca layar") |
| `quizStartAnnouncement(question, roles)` | Pengumuman pembuka |
| `quizResultAnnouncement(roles, answer, isCorrect)` | Pengumuman hasil |

Berkas lain:

| Berkas | Isi |
|---|---|
| `ui/RoleQuiz.tsx` | `RoleQuiz({ question, roles, answer, correctId, scale, ready, onAnswer, onNext })`: dialog kuis. Memfokuskan judul sekali saat tampil dan "Lanjut" sekali saat jawaban pertama tampil, tidak setiap kali digambar ulang (misalnya karena ukuran jendela berubah); mengunci Tab di dalam dialog; membatalkan `keydown` `Enter` dan `Spasi` yang bertanda `repeat`. "Lanjut" memanggil `onNext` setiap kali diaktifkan sesudah dijawab; `ready` hanya mengatur `aria-disabled` dan tampilan tombol |
| `ui/PlayScreen.tsx` | "Lanjut" kartu mengirim `LANJUT`; dialog kuis di fase `quiz`; `answerQuiz`; `continueFromQuiz`, yang memeriksa fase, jawaban, sekali per adegan, dan masa tunggu dengan `performance.now()`; ref waktu mulai masa tunggu dan satu pengatur waktu untuk tampilan tombol; pintasan `1` sampai `4`; pengumuman kuis; atribut `data-kuis` pada `.ss-play` selama fase `quiz`; `CHOICE_PHASES` tanpa `quiz`; jembatan dihapus dan `bridgeUsed` menjadi `cardUsed`; komentar kepala berkas menyebut F-08 |
| `ui/controls.ts` | `PlayCommand` ditambah `{ type: "jawab"; nomor: 1 \| 2 \| 3 \| 4 }`; `keyCommand` memetakan `1` sampai `4` di fase `quiz`; `bridgeActions` dihapus; keterangan `NEXT_PHASES` diperbarui |
| `ui/ChoicePanel.tsx` | Tanpa tombol jembatan, `bridgeReady`, `onBridge`, dan `bridgeRef`; fokus otomatis ke pertanyaan atau baris status seperti sebelumnya, dan tetap mati di fase `stars`; komentar kepala berkas diperbarui |
| `ui/preload.ts` | `preloadScene(scene)` juga memuat dan men-*decode* `roleIcons` keempat peran serta `emoteIcons.hati` dan `emoteIcons.tanya` bila adegan itu punya `roleQuiz`, dengan aturan yang sama: setiap URL sekali per halaman, dan kegagalan diabaikan. Karena PlayScreen memanggilnya untuk adegan berikutnya, ikon kuis dimuat saat adegan 4 dimulai |
| `content/copy.ts` | Bagian baru `quiz` berisi teks di atas; `play.bridgeNext` dihapus |
| `styles/game.css` | Kelas dialog dan kartu kuis; tampilan "Lanjut" kuis yang nonaktif (`[data-nonaktif]`) dan tertahan; `.ss-play[data-kuis] .ss-stage-area { visibility: hidden }`; mode warna paksa untuk `.ss-quiz` dan `.ss-quiz-card`; aturan `.ss-question-row .ss-next` dihapus |

Kelas CSS baru berawalan `ss-`: `ss-quiz`, `ss-quiz-head`, `ss-quiz-title`, `ss-quiz-answer`, `ss-quiz-body`, `ss-quiz-question`, `ss-quiz-cards`, `ss-quiz-card`, `ss-quiz-card-top`, `ss-quiz-icon`, `ss-quiz-role`, `ss-quiz-duty`, `ss-quiz-mark`, `ss-quiz-feedback`, `ss-quiz-feedback-icon`, `ss-quiz-feedback-text`, dan `ss-quiz-foot`. Kotak nomor memakai `ss-choice-key` F-05, dan tombol "Lanjut" memakai `ss-next`. Atribut: `data-hasil` (`tepat` atau `belum`) pada dialog; `data-peran`, `data-terbuka`, `data-tepat`, dan `data-pilihan` pada kartu; serta `data-nonaktif` pada "Lanjut" sebelum dijawab, yang membedakan tampilan nonaktif dari tampilan tertahan (keduanya ber-`aria-disabled="true"`). Tidak ada keyframes baru dan tidak ada token `:root` baru.

### Perubahan dokumen (Build)

- `Design_System.md` naik ke versi 0.8:
  - bagian 3: kuis menutupi panggung, panel kanan, dan panel bawah seperti kartu dampak, dan panggung disembunyikan selama kuis;
  - bagian 4: baris kontras `ink` di atas `mist` (9,5 : 1) untuk kepala kuis;
  - bagian 7, "Kuis peran": letak, susunan kartu, tanda jawaban, pita umpan balik, ukuran huruf, dan "Lanjut" yang nonaktif lalu tertahan;
  - bagian 8: kuis tanpa animasi, masa tunggu "Lanjut" kuis 600 ms, dan perilaku saat kurangi gerak.
- `Architecture.md` naik ke versi 0.10:
  - bagian 3: `RoleQuiz.tsx` (F-08) dan `quiz.ts`, serta `kuis-peran.spec.ts` di daftar `e2e/`;
  - bagian 7: uraian "Jembatan sementara" diganti uraian kuis peran (F-08); panel bawah hanya memakai `ChoicePanel` di fase `discuss`, `reaction`, dan `stars`;
  - bagian 8: pramuat adegan berkuis juga memuat ikon peran dan ikon emosi kuis;
  - bagian 9: baris "`1` `2` `3` `4`: menjawab kuis peran (fase kuis)" dan keterangan tombol yang sudah aktif;
  - bagian 10: fokus dan pengumuman kuis;
  - bagian 12: cakupan uji ujung ke ujung F-08.
- `PLAN.md`: status F-08, tautan laporan uji, dan "Catatan untuk Plan berikutnya":
  - catatan "Plan F-08" dan bagian kuis di catatan "Plan F-06 sampai F-10" ditandai selesai;
  - Plan F-09: pilihan hasil kuis di rekap masih terbuka (usulan 8), dan `quizAnswer` dikosongkan saat adegan 6 dimulai;
  - Plan F-10: arti `Esc` selama dialog kartu dampak dan kuis;
  - Plan F-13: Temuan 1 F-07 juga berlaku untuk "Lanjut" kuis.
- `PRD.md`, `AGENTS.md`, `Daftar_Aset.md`, dan `Verifikasi_Rujukan.md` tidak berubah.

Perbedaan dengan daftar file di rencana:

- `ui/preload.ts` juga berubah (pramuat ikon kuis);
- `Design_System.md` juga berubah di bagian 4 (satu baris kontras), dan `Architecture.md` di bagian 8 (pramuat);
- rencana menulis bahwa tiga pemeriksaan "kuis tidak tampil" di uji lama dibalik. Pemeriksaan itu ternyata tetap benar, karena dilakukan saat kartu dampak tampil atau di fase bintang. Jadi pemeriksaan itu dipertahankan, dan pemeriksaan "kuis tampil" ditambahkan sesudah "Lanjut" kartu adegan 5 (bagian "Rencana uji").

Berkas lain sama dengan rencana.

## Aset

Tidak ada aset baru, dan tidak ada PNG yang berubah. F-08 memakai aset yang sudah Disetujui (21 Oktober 2026) lewat manifest:

- `roleIcons.polisi`, `roleIcons.jaksa`, `roleIcons.advokat`, dan `roleIcons.hakim` (`ui/role_{peran}.png`, 32×32, D-08);
- `emoteIcons.hati` dan `emoteIcons.tanya` (`ui/emote_hati.png` dan `ui/emote_tanya.png`, 8×8, D-09), ditampilkan 16p × 16p.

`manifest.ts`, `CREDITS.md`, `Daftar_Aset.md`, dan kit gambar tidak berubah. Placeholder tidak diperlukan. Warna toga dan simare D-08 tetap menjadi tugas pengecekan pemilik proyek (usulan 9), tanpa menghambat F-08.

## Di luar cakupan

- Hasil kuis di rekap (F-09; usulan 8 masih terbuka).
- Bunyi jawaban tepat dan keliru (F-13).
- Animasi kartu terbuka, pengatur waktu kuis, bintang otomatis dari kuis, dan rujukan pasal di dialog kuis.
- Kuis di adegan lain, urutan kartu acak, mengubah jawaban, dan menutup kuis tanpa menjawab.
- Arti `Esc` selama dialog (F-10).
- Perbaikan Temuan 1 F-07 (dibiarkan; tetap dicatat untuk F-13).
- Pembatalan tombol yang ditahan di luar dialog kuis. Perilaku kartu dampak, pilihan, dan tombol bintang (F-05 sampai F-07) tidak berubah.
- Kuis di pratinjau panggung.
- Perubahan ikon D-08 (tugas pengecekan pemilik proyek, usulan 9).
- Perubahan pada `engine/`, naskah (`scenes.ts`, `roles.ts`, `references.ts`), `Verifikasi_Rujukan.md`, `content.test.ts`, aset dan kit gambar, `manifest.ts`, `CREDITS.md`, `ImpactCard.tsx`, `StarsAward.tsx`, `Teams.tsx`, `Timer.tsx`, `Meters.tsx`, `NarrationBox.tsx`, `Stage.tsx`, `Sprite.tsx`, `DayArc.tsx`, `StagePreview.tsx`, `Game.tsx`, `layout.ts`, file galeri, `vite.pages.config.ts`, `playwright.config.ts`, `package.json`, `pnpm-lock.yaml`, dan workflow.

## Kriteria penerimaan

- [ ] AC-1 **Kapan kuis tampil**:
  - di adegan 5, sesudah "Lanjut" kartu dampak (sesudah 600 ms), fase `quiz` dan dialog kuis tampil langsung tanpa sapuan, dalam keadaan belum dijawab;
  - di adegan 1 sampai 4 dan 6, "Lanjut" kartu langsung membuka fase bintang;
  - baris status panel bawah tidak pernah berisi tombol (tombol jembatan sudah dihapus), dan layar kerangka, pratinjau, serta layar akhir sementara tidak menampilkan kuis.
- [ ] AC-2 **Letak dan ukuran**, di 1280×720, 1366×768, 1920×1080, dan 1024×768, dalam keadaan belum dijawab, tepat, dan belum tepat:
  - dialog kiri di tepi kiri bingkai panggung, atas 9,2u, jarak kanan 2u, dan jarak bawah 1,2u (±1 px);
  - bilah atas dan panel indikator tidak tertutup; area panggung ber-`visibility: hidden`; panel bawah kosong; titik tengah setiap baris papan tim tertutup dialog;
  - empat kartu sebaris dalam urutan Polisi, Jaksa, Advokat, Hakim, sama lebar dan sama tinggi (±1 px), dengan ikon 32p × 32p;
  - ukuran huruf sesuai tabel tata letak (±0,05u);
  - isi tidak meluap ke bawah maupun ke samping;
  - letak dan ukuran setiap kartu sama sebelum dan sesudah dijawab (±1 px).
- [ ] AC-3 **Isi sebelum dijawab dan ikon**:
  - pertanyaan sama dengan `roleQuiz.question`;
  - nomor, nama, dan ikon `role_{id}` setiap kartu sesuai `ROLES`;
  - ruang tugas berisi "?", teks tugas belum ada di halaman, kepala kanan (`.ss-quiz-answer`) belum ada, pita umpan balik tidak ada, dan "Lanjut" ber-`data-nonaktif`;
  - keempat ikon peran dan ikon tanda tanya sudah diminta sebelum adegan 5 dimulai (pramuat saat adegan 4);
  - bila permintaan `role_*.png` dan `emote_tanya*.png` digagalkan, nomor, nama, tugas, label, dan kalimat tetap tampil, kuis tetap bisa dijawab dan dilanjutkan, tidak ada galat halaman, dan galat konsol hanya pesan jaringan untuk berkas yang digagalkan.
- [ ] AC-4 **Menjawab**, untuk keempat jawaban dan dengan ketiga cara (klik, `Enter` pada kartu berfokus, dan `1` sampai `4`):
  - keempat kartu terbuka serentak dengan tugas dari `ROLES`;
  - kartu Hakim berlatar `rgb(138, 217, 91)` dengan label "Jawaban tepat";
  - kartu pilihan kelas bercincin, dan bila bukan Hakim, berlatar `rgb(255, 210, 63)` dengan label "Pilihan kelas"; kartu lain `rgb(255, 246, 224)` tanpa label;
  - kepala kanan "Jawaban kelas: {nama peran}.";
  - pita umpan balik berlatar `rgb(138, 217, 91)` dengan ikon hati dan kalimat tepat untuk Hakim, atau `rgb(255, 159, 28)` dengan ikon tanda tanya dan kalimat belum tepat untuk peran lain, ditambah kalimat kedua;
  - keempat kartu ber-`disabled`, dan "Lanjut" tidak lagi ber-`data-nonaktif`.
- [ ] AC-5 **Hanya jawaban pertama**:
  - sesudah dijawab, angka `1` sampai `4` lain, klik pada kartu lain, dan tekanan berulang tidak mengubah jawaban, tampilan, pengumuman, maupun bunyi;
  - klik ganda pada sebuah kartu menjawab sekali dengan satu bunyi; fokus tetap di dalam dialog, dan Tab memindahkan fokus ke "Lanjut";
  - `Enter` yang ditahan pada kartu berfokus (`keyboard.down("Enter")` diulang, sehingga pengulangan bertanda `repeat`), dengan pengulangan sebelum dan sesudah masa tunggu lewat, hanya menjawab sekali dan tidak membuka fase bintang. Hal yang sama berlaku untuk `Spasi`.
- [ ] AC-6 **Tidak memengaruhi permainan**: untuk keempat jawaban, nilai dan `aria-valuenow` kedua indikator, jumlah bintang setiap tim, tim yang bergiliran, dan bendera sama sebelum dan sesudah kuis.
- [ ] AC-7 **"Lanjut" kuis dan masa tunggu**, dengan jam uji yang dijeda:
  - sebelum dijawab, tombol ber-`data-nonaktif` dan `aria-disabled="true"`, berlatar `rgb(201, 212, 229)` dengan teks `rgb(58, 74, 107)`. Saat berfokus lewat Tab, latar dan teksnya tetap, kursor ▶ terlihat, dan garisnya `solid 2px rgb(31, 42, 68)` berjarak 2 px. Klik, `Enter`, maupun `Spasi` padanya tidak berpengaruh;
  - sesudah dijawab, pada 599 ms tombol masih ber-`aria-disabled="true"`, dan klik serta `Spasi` padanya tidak berpengaruh. Sesudah jam dimajukan 1 ms lagi, satu `Spasi` pada tombol yang berfokus langsung membuka fase bintang;
  - dengan fokus di dialog (sesudah klik ganda pada kartu), `Enter` pada 599 ms tidak berpengaruh, dan pada 600 ms membuka fase bintang;
  - klik ganda atau dua `Enter` cepat sesudah masa tunggu hanya membuka satu fase bintang, dan tidak memberi bintang;
  - di fase bintang, dialog hilang, ajakan bintang berfokus, panggung terlihat dengan reaksi adegan 5, dan panel bawah sama dengan fase bintang adegan lain.
- [ ] AC-8 **Fokus dan dialog**:
  - dialog ber-`role="dialog"` dan `aria-modal="true"`, bernama "Kuis peran", dengan judul `<h2>` yang berfokus saat kuis tampil. Bila kuis dibuka dengan keyboard, judul menampilkan garis fokus 2 px `ink` berjarak 4 px;
  - sebelum dijawab, Tab dari judul berurutan ke kartu 1, 2, 3, 4, "Lanjut", lalu kembali ke kartu 1; Shift+Tab berjalan sebaliknya;
  - sesudah dijawab, fokus berada di "Lanjut", dan Tab serta Shift+Tab tetap di "Lanjut";
  - klik di ruang kosong dialog dan klik ganda pada kartu membuat fokus tetap berada di dalam dialog;
  - kartu yang berfokus lewat Tab berlatar `sun` dengan kursor ▶ terlihat;
  - ukuran jendela diubah dari 1280×720 ke 1024×768 lalu kembali, sebelum dan sesudah dijawab: dialog mengikuti letak di AC-2, sedangkan jawaban, elemen yang berfokus, isi wilayah `aria-live`, dan masa tunggu tidak berubah.
- [ ] AC-9 **Klik ganda saat masuk**:
  - klik ganda pada "Lanjut" kartu dampak adegan 5 membuka kuis yang belum dijawab, tanpa kartu terbuka, tanpa bunyi kedua, dan dengan fokus di dalam dialog;
  - dua `Enter` cepat pada "Lanjut" kartu yang berfokus juga membuka kuis yang belum dijawab;
  - jarak bawah kartu peran ke tepi atas "Lanjut" kartu dampak paling sedikit 20u di keempat ukuran.
- [ ] AC-10 **Keyboard**:
  - `1` sampai `4` menjawab hanya di fase `quiz` sebelum dijawab;
  - `0`, `5`, `9`, `a`, `b`, `p`, `t`, `s`, dan `Escape` tidak berpengaruh di fase `quiz`;
  - `M` mematikan dan menyalakan suara di fase `quiz`;
  - `4` tidak berpengaruh di fase lain; `1` `2` `3` tetap memilih di fase `discuss` dan `0` `1` `2` tetap memberi bintang di fase `stars`;
  - tekanan bersama Ctrl, Alt, atau Meta dan tekanan `repeat` diabaikan;
  - `keydown` `Enter` dan `Spasi` bertanda `repeat` di dalam dialog kuis dibatalkan (`defaultPrevented` benar). `keydown` pertama pada kartu atau "Lanjut" yang berfokus tidak dibatalkan, sehingga tetap menjadi klik.
- [ ] AC-11 **Pembaca layar**:
  - wilayah `[aria-live="polite"]` tetap satu, berisi pengumuman pembuka saat kuis tampil dan pengumuman hasil sesudah dijawab, dengan teks persis sesuai bagian "Teks yang tampil", untuk keempat jawaban;
  - grup kartu bernama "Peran penegak hukum", dan nama setiap kartu sesuai `quizCardName` sebelum dan sesudah dijawab;
  - kotak nomor, ikon, "?", dan ikon emosi tersembunyi dari pembaca layar;
  - wilayah `role="status"` tidak berubah selama kuis, kecuali saat `M` ditekan.
- [ ] AC-12 **Kontras**: rasio terukur ≥ 4,5:1 untuk judul, kepala kanan, pertanyaan, nomor, nama, tugas, "?", label, kalimat umpan balik, dan "Lanjut" (nonaktif, nonaktif berfokus, tertahan, siap, dan berfokus), di keempat ukuran.
- [ ] AC-13 **Tanpa animasi dan kurangi gerak**:
  - tanpa kurangi gerak, `getAnimations({ subtree: true })` pada dialog kuis kosong, sebelum maupun sesudah dijawab;
  - dengan `prefers-reduced-motion: reduce`, `document.getAnimations()` kosong selama kuis, dan isi dialog (`innerHTML`) sama dengan tanpa kurangi gerak pada keadaan yang sama;
  - masa tunggu tetap 600 ms.
- [ ] AC-14 **Bunyi**, dengan perekam bunyi F-07: "Lanjut" kartu dampak yang membuka kuis, jawaban, dan "Lanjut" kuis yang diterima masing-masing menghasilkan tepat satu klik, termasuk jawaban dengan `Enter` yang ditahan. Tekanan yang diabaikan menghasilkan 0 klik: "Lanjut" kuis sebelum dijawab dan selama masa tunggu, angka sesudah dijawab, `0`, dan `Escape`.
- [ ] AC-15 **Main sampai akhir**:
  - dengan keyboard saja di 1280×720, dengan 2 tim (jalur semua A, semua B, dan semua C, termasuk sesudah "Main lagi") serta 3 dan 4 tim (`#main-3` dan `#main-4`, jalur semua B), permainan berjalan dari adegan 1 sampai layar akhir sementara dengan kuis di adegan 5;
  - sesudah "Main lagi", kuis adegan 5 kembali belum dijawab;
  - 0 galat konsol, 0 respons 4xx/5xx, dan 0 permintaan ke host lain.
- [ ] AC-16 **Uji unit**:
  - `quiz.test.ts` lulus: konstanta; `roleForNumber` untuk 1 sampai 4 (Polisi, Jaksa, Advokat, Hakim, sesuai urutan PRD) dan untuk 0, 5, serta `NaN`; `quizCards` sebelum dijawab dan untuk keempat jawaban; `quizFeedback`; kalimat jawaban diawali nama peran `roleQuiz.answer`; `quizCardName` untuk setiap tanda; `quizStartAnnouncement` dan `quizResultAnnouncement` persis sama dengan contoh, dengan naskah asli;
  - `controls.test.ts` disesuaikan:
    - fungsi bantu `playScene` mengirim `LANJUT` dari fase `impact`, lalu `JAWAB_KUIS` dan `LANJUT` bila adegan punya `roleQuiz`, sebagai ganti `bridgeActions`;
    - uji `1` `2` `3` (memilih di fase `discuss`), uji `0` `1` `2` (bintang di fase `stars`), dan uji "tombol lain" (yang memuat `4`) tidak lagi mengharapkan `null` untuk `1` sampai `4` di fase `quiz`;
    - uji baru: `1` sampai `4` menghasilkan `{ type: "jawab", nomor }` hanya di fase `quiz`; `0`, `5` sampai `9`, dan huruf tidak berpengaruh di fase `quiz`;
    - uji `Spasi` dan `Enter` tetap (lanjut di fase `intro`, `impact`, dan `quiz`), dengan judul yang tidak lagi menyebut jembatan;
    - kedua uji jembatan diganti uji dengan reducer dan naskah asli: `LANJUT` dari fase `impact` membuka `quiz` di adegan 5 dan `stars` di adegan lain; `JAWAB_KUIS` untuk keempat peran lalu `LANJUT` membuka `stars` tanpa mengubah indikator, bendera, bintang, dan `history`; bintang kedua di adegan yang sama tetap ditolak;
  - uji unit lain lulus tanpa perubahan, termasuk F-02 AC-14 untuk seluruh `engine/`.
- [ ] AC-17 **Uji lama**: ke-64 uji ujung ke ujung lama lulus.
  - Ke-31 uji yang melewati kartu dampak adegan 5 mendapat langkah kuis.
  - Pemeriksaan "kuis tidak tampil" saat kartu dampak tampil dan di fase bintang tetap ada, dan pemeriksaan "kuis tampil" ditambahkan sesudah "Lanjut" kartu adegan 5.
  - Nama `bridgeNext` dan pemilih `.ss-question-row .ss-next` diganti pemeriksaan bahwa baris status tidak berisi tombol (`.ss-question-row button`).
- [ ] AC-18 **Build**:
  - `build:pages` lulus;
  - JS permainan ≤ 150 KB gzip tanpa penanda `__THREE__`;
  - semua `src` dan `href` HTML permainan relatif;
  - `index.html`, `main-*.css`, `main-*.js`, dan `jsx-runtime-*.js` identik byte dengan build sebelum F-08.
- [ ] AC-19 **Pemeriksaan kode**:
  - `tsc --noEmit` seluruh proyek tanpa galat;
  - ESLint `--max-warnings 0` lulus pada semua berkas kode baru dan yang diubah;
  - tidak ada `any`;
  - `engine/` tidak berubah dan tetap tanpa pengatur waktu;
  - sesudah meninggalkan `#main` saat kuis belum dijawab dan saat masa tunggu, tidak ada `setTimeout` maupun `setInterval` yang masih aktif, dan pendengar `keydown`, `pointerdown`, serta `pointerup` di `window` kembali 0.
- [ ] AC-20 **Jembatan dihapus**:
  - pencarian `bridge` dan `jembatan` (huruf besar atau kecil) di `app/` tidak menemukan apa pun, termasuk `bridgeActions`, `BRIDGE_PHASES`, `bridgeReady`, `onBridge`, `bridgeRef`, `bridgeUsed`, `bridgeNext`, dan komentar;
  - aturan `.ss-question-row .ss-next` tidak ada lagi di `game.css`;
  - di `e2e/`, nama dan pemilih tombol jembatan sudah diganti (AC-17).
- [ ] AC-21 **Dokumen dan cakupan**:
  - perubahan dokumen sesuai bagian "Perubahan dokumen";
  - `git diff --name-status` hanya memuat berkas yang disebut spesifikasi ini dan tangkapan layar bukti di `tests/F-08/`;
  - `package.json`, `pnpm-lock.yaml`, `scenes.ts`, `roles.ts`, `references.ts`, `content.test.ts`, `engine/`, dan `Verifikasi_Rujukan.md` tidak berubah, sehingga tidak ada kotak yang dicentang;
  - `install --frozen-lockfile`, `content:check`, dan `test` lulus.

## Rencana uji

| Langkah | Cara | Kriteria |
|---|---|---|
| 1 | `install --frozen-lockfile`, `content:check`, lalu `test` | AC-16, AC-21 |
| 2 | `build:pages`; bandingkan berkas galeri dengan build sebelum F-08, juga sesudah semua dokumen F-08 ditulis; periksa ukuran gzip, penanda three.js, dan path relatif | AC-18 |
| 3 | `test:e2e`: ke-64 uji lama yang disesuaikan, ditambah `e2e/kuis-peran.spec.ts`, termasuk tombol yang ditahan, klik ganda pada kartu, perubahan ukuran jendela, pramuat ikon, dan ikon yang gagal dimuat | AC-1 sampai AC-15, AC-17 |
| 4 | Masa tunggu: jam uji dijeda dengan `page.clock.pauseAt` sebelum halaman dimuat, lalu dimajukan hanya dengan `page.clock.runFor`, dalam dua langkah sesudah unsur tampil (catatan PLAN "Semua fitur dengan jam uji"): kuis tampil, jawaban tampil, lalu 599 dan 1 ms | AC-7 |
| 5 | Bunyi: perekam bunyi skrip awal halaman uji F-07 (`e2e/suara.spec.ts`), dengan klik dibedakan dari panjang bunyinya | AC-14 |
| 6 | Pembaca layar: isi wilayah `aria-live` dan cuplikan ARIA dialog dan kartu (`toMatchAriaSnapshot` atau `toHaveAccessibleName`) | AC-8, AC-11 |
| 7 | Salin tangkapan layar ke `docs/sehari-setara/tests/F-08/` (daftar di bawah) | Bukti AC-2 sampai AC-8 |
| 8 | `tsc --noEmit -p tsconfig.json --incremental false`, lalu ESLint; cari `bridge` dan `jembatan` di `app/`, serta `bridgeNext` dan `.ss-question-row .ss-next` di `e2e/` | AC-19, AC-20 |
| 9 | `git diff --name-status` terhadap keadaan sebelum F-08, dan periksa diff dokumen | AC-21 |
| 10 | Daftar periksa manual AGENTS bagian 9 | Tidak ada AC khusus |

Lingkungan uji [Pemilik, usulan 10]: Chromium 141 untuk `@playwright/test` 1.56.1 tidak tersedia di lingkungan agen. Uji dijalankan dengan Chromium 153 lewat berkas konfigurasi pengganti di luar repositori, yang mengimpor `playwright.config.ts` dan hanya menambah jalur browser, sehingga `playwright.config.ts`, `package.json`, dan lockfile tidak berubah. Bila satu perintah terlalu lama, uji dijalankan dalam beberapa bagian dengan konfigurasi yang sama.

Cara uji yang perlu diperhatikan:

- Klik pada kartu yang terkunci dan pada "Lanjut" yang ber-`aria-disabled` memakai `click({ force: true })`, karena Playwright menunggu tombol seperti itu aktif (sama dengan uji F-06).
- Tombol yang ditahan: `page.keyboard.down` diulang tanpa `up`, sehingga Playwright mengirim `keydown` bertanda `repeat` [Coba].
- Ikon gagal dimuat: `page.route` menggagalkan permintaan `role_*.png` dan `emote_tanya*.png`, seperti uji "bunyi gagal dimuat" F-07.
- Pramuat: permintaan ikon dicatat dengan `page.on("request")` sebelum adegan 5 dimulai.
- Uji yang mengukur atau memotret kuis menunggu gambar latar `.ss-quiz-icon` dan `.ss-quiz-feedback-icon` termuat dan ter-*decode*, dengan cara fungsi `waitImages` di uji F-06 dan F-07.
- **[Build]** Uji bunyi klik di kuis (AC-14) ditambahkan ke `e2e/suara.spec.ts`, karena perekam bunyinya ada di berkas itu; `kuis-peran.spec.ts` berisi uji AC-1 sampai AC-13. `e2e/bantuan.ts` juga mendapat `sceneNumber`, yang membaca nomor adegan dari bilah atas, sehingga fungsi bantu `toStars` dan `playScene` menjawab kuis hanya di adegan 5. Permainan baru dalam satu uji dimulai lewat layar kerangka lalu `#main` lagi, tanpa memuat ulang halaman (F-07 AC-11).

Penyesuaian uji lama: `e2e/bantuan.ts` mendapat pemilih dialog kuis dan fungsi bersama yang menunggu judul kuis berfokus, menekan `4`, menunggu kartu terbuka, menunggu masa tunggu (waktu sebenarnya, atau `page.clock.runFor` di uji dengan jam dijeda), lalu menekan `Enter`. Fungsi ini dipakai sesudah "Lanjut" kartu adegan 5 di ke-31 uji berikut (hasil percobaan Plan). Pemeriksaan "kuis tidak tampil" yang sudah ada dipertahankan, karena dilakukan saat kartu dampak tampil atau di fase bintang. Nama `bridgeNext` dan pemilih `.ss-question-row .ss-next` diganti pemeriksaan bahwa baris status tidak berisi tombol (`.ss-question-row button`).

- `e2e/alur-permainan.spec.ts` (7 uji): "reaksi dan kartu dampak", "sapuan tepat waktu dan tanpa sapuan sesudah adegan 6", "tiga jalur sampai akhir", dan "tata letak, bingkai, dan kontras" di empat ukuran. Uji "reaksi dan kartu dampak" kini juga memeriksa bahwa kuis tampil sesudah "Lanjut" kartu adegan 5;
- `e2e/kartu-dampak.spec.ts` (13 uji): "kartu dan indikator" di empat ukuran dengan tiga jalur, serta "fokus, dialog, keyboard, dan pengaman tekanan ganda", yang kini juga memeriksa bahwa kuis tampil di adegan 5;
- `e2e/tim-waktu-bintang.spec.ts` (9 uji): "panel kanan" di empat ukuran, "giliran dengan 2, 3, dan 4 tim", "bintang alasan", yang kini juga memeriksa bahwa kuis tampil di adegan 5, dan "main sampai akhir dengan keyboard" untuk 2, 3, dan 4 tim;
- `e2e/suara.spec.ts` (2 uji): "volume 60% dan tombol M" dan "bunyi gagal dimuat", lewat fungsi `playScene`;
- `e2e/sehari-setara.spec.ts` (16 uji F-04) dan 17 uji lain tidak berubah.

Tangkapan layar di `tests/F-08/`:

| Berkas | Isi |
|---|---|
| `kuis_tertutup_1280x720.png`, `kuis_tertutup_1024x768.png`, `kuis_tertutup_1920x1080.png` | Kuis baru tampil, judul berfokus |
| `kuis_fokus_1280x720.png` | Kartu 2 berfokus (latar `sun` dan kursor ▶) |
| `kuis_lanjut_nonaktif_1280x720.png` | "Lanjut" nonaktif berfokus lewat Tab (kursor ▶ dan garis fokus) |
| `kuis_tepat_1280x720.png`, `kuis_tepat_1024x768.png`, `kuis_tepat_1920x1080.png` | Sudah dijawab Hakim (tepat) |
| `kuis_belum_tepat_1280x720.png`, `kuis_belum_tepat_1024x768.png`, `kuis_belum_tepat_1920x1080.png` | Sudah dijawab Advokat (belum tepat) |
| `bintang_sesudah_kuis_1280x720.png` | Fase bintang adegan 5 sesudah "Lanjut" kuis, ajakan berfokus |

Daftar periksa manual AGENTS bagian 9:

- Bisa dimainkan sampai akhir hanya dengan keyboard: dibuktikan uji AC-15.
- Mode kurangi gerak mematikan sapuan dan animasi: dibuktikan uji AC-13 dan uji F-05 sampai F-07.
- Tampilan rapi di 1024×768 dan 1920×1080: diperiksa dari tangkapan layar.
- Teks kuis terbaca dari jarak sekitar 8 meter di proyektor, dan berjalan lancar di laptop kelas bawah: dicatat "belum diuji", untuk dicek pemilik proyek.

Hasil uji ditulis di `docs/sehari-setara/tests/F-08-hasil.md` (templat 11.3).
