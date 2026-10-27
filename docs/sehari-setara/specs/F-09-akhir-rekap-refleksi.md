# F-09 — Layar akhir, rekap, refleksi

| | |
|---|---|
| Status | Ditulis 27 Oktober 2026, menunggu Gerbang 2 (balasan `Spesifikasi disetujui: F-09`) |
| Tanggal | 27 Oktober 2026 |
| Rencana | `docs/sehari-setara/PLAN.md`, entri F-09 (disetujui 27 Oktober 2026 dengan balasan `Setuju: F-09`; saran setiap usulan diterima; usulan 4a, 6b dengan 6e, dan 12d; izin tertulis "Izinkan dependensi: modern-screenshot 4.7.0"; unduhan PNG dan PDF A4 dikerjakan di F-09) |

## Ringkasan

F-09 menutup satu hari permainan di layar `sehari-setara/#main`, menggantikan layar akhir sementara F-05:

1. **Layar akhir.** Sesudah bintang alasan adegan 6, layar akhir langsung tampil di tata letak layar permainan. Isinya ilustrasi akhir dengan timbangan piksel yang berayun ke posisi akhirnya, judul akhir, dua kalimat pesan, nilai akhir kedua indikator, dan papan tim dengan tanda "Bintang terbanyak". Tidak ada layar "kalah".
2. **Rekap.** Empat halaman menurut waktu adegan (pagi, siang, sore, malam). Setiap adegan tampil sebagai satu kotak berisi pilihan kelas dan tanda tingkatnya, tim dan bintangnya, hasil kuis di adegan 5, pilihan yang paling menjaga keseimbangan (pilihan bertingkat "Tepat"), dan rujukannya apa adanya.
3. **Refleksi.** Tiga kalimat pemantik untuk ditulis siswa di buku, lalu "Main lagi", "Kembali ke galeri", "Unduh gambar", dan "Unduh PDF".
4. **Unduh rekap (FR-20).** Satu lembar rekap A4 diunduh sebagai PNG, dibuat dengan `modern-screenshot` 4.7.0, atau sebagai PDF A4, dibuat kode sendiri tanpa pustaka PDF.
5. **Mesin.** Jawaban kuis peran ikut disimpan di entri `history` adegan 5, agar rekap bisa menampilkannya. Selain itu `engine/` tidak berubah.

Asal setiap nilai ditandai:

| Tanda | Arti |
|---|---|
| **[Dokumen]** | Dari PRD, Design System, atau Architecture; bagiannya disebut |
| **[Pemilik]** | Keputusan pemilik proyek: usulan 1–13 dan tambahan Gerbang 1 entri F-09 `PLAN.md` (27 Oktober 2026) |
| **[Ukur]** | Diukur dengan huruf asli di Chromium 153 pada empat ukuran layar, memakai maket yang berisi nilai CSS spesifikasi ini. Maket disuntikkan ke hasil build `main` (ZIP 27 Oktober 2026, sesudah F-08) di luar repositori, 27 Oktober 2026 |
| **[Coba]** | Perilaku peramban atau pustaka yang dicoba di Chromium 153 dengan halaman uji kecil di luar repositori (27 Oktober 2026) |
| **[DRAF]** | Rincian baru dari agen di tahap ini. Mohon ditinjau |

Maket dikirim lewat percakapan dan tidak disimpan di repositori. Tangkapan layar hasil sebenarnya disimpan di `tests/F-09/` pada tahap Test.

## Yang perlu ditinjau di Gerbang 2

Usulan Gerbang 1 sudah diputuskan. Daftar ini hanya memuat rincian baru dari tahap Specify. Spesifikasi ditulis dengan saran di kolom kedua; sebutkan nomornya bila memilih alternatif.

| No. | Hal | Saran (dipakai spesifikasi ini) | Alternatif |
|---|---|---|---|
| A-1 | Letak tanda "Bintang terbanyak" di papan tim layar akhir | Baris sendiri di bawah nama dan bintang tim itu, sejajar nama, berlatar `sun` dengan teks `ink`. Lebarnya 24,7u dan muat di keempat ukuran, juga dengan empat tim [Ukur] | Di bawah nama seperti "Giliran", tanpa latar. Pada 1024×768 tulisan bisa melewati kolom nama |
| A-2 | Nilai seri dan nol bintang | Semua tim dengan jumlah bintang tertinggi mendapat tanda, asalkan jumlah itu lebih dari 0. Bila semua tim 0 bintang, tidak ada tanda | Tanda hanya bila tepat satu tim tertinggi |
| A-3 | Isi lembar unduhan | Judul dan tanggal unduh ("Selasa, 27 Oktober 2026"), akhir hari dan nilai kedua indikator, papan tim dengan tanda "Bintang terbanyak", keenam kotak adegan persis seperti rekap, kalimat pemantik refleksi, dan baris kaki | Tanpa tanggal; atau tanpa kalimat pemantik |
| A-4 | Tulisan tombol dan kabar unduhan | "Unduh gambar" dan "Unduh PDF". Kabar: "Menyiapkan gambar rekap…", lalu "Gambar rekap siap. Periksa folder unduhan." Kata "siap" dipakai karena peramban bisa meminta tempat simpan dan guru bisa membatalkannya, sehingga game tidak tahu pasti berkas sudah tersimpan | Tombol "Unduh rekap (PNG)" dan "Unduh rekap (PDF)"; kabar "… sudah diunduh." |
| A-5 | Nama berkas | `rekap-sehari-setara-2026-10-27.png` dan `.pdf`, memakai tanggal komputer | Tanpa tanggal |
| A-6 | "Main lagi" saat lembar sedang disiapkan | Penyiapan dibatalkan: tidak ada berkas dan tidak ada kabar | "Main lagi" tertahan sampai unduhan selesai |
| A-7 | Batas waktu penyiapan | 15 detik; lewat dari itu muncul kabar gagal, dan tombol bisa ditekan lagi | Tanpa batas waktu |
| A-8 | Tulisan baris kuis di rekap | Teks rencana (usulan 5): "Kuis peran: jawaban kelas Advokat, jawaban tepat Hakim." dan "Kuis peran: jawaban kelas Hakim, tepat." | Gaya kepala kuis F-08 (K-6): "Kuis peran. Jawaban kelas: Advokat. Jawaban tepat: Hakim." |
| A-9 | Klik ganda pada "Sebelumnya" | Klik kedua dari satu klik ganda diabaikan, sehingga rekap hanya mundur satu halaman. Tanpa aturan ini, klik ganda di halaman 3 atau 4 mundur dua halaman, karena klik kedua jatuh di "Sebelumnya" halaman sebelumnya | Setiap klik mundur satu halaman |

## Kaitan PRD

| Acuan | Yang dipenuhi F-09 |
|---|---|
| FR-12 | Tiga akhir menurut `endingFor` (PRD bagian 9) dengan ilustrasi C-02 sampai C-04, judul, pesan, nilai akhir indikator, dan timbangan D-10 |
| FR-13 | Rekap enam pilihan kelas, pilihan yang paling menjaga keseimbangan, dan rujukannya |
| FR-14 | Layar refleksi dengan kalimat pemantik untuk ditulis di buku |
| FR-15 (sebagian) | "Main lagi" dan "Kembali ke galeri" (`href="../"`). Tautan dari galeri tetap milik F-11 |
| FR-16 (sebagian) | `Spasi` dan `Enter` di layar akhir dan rekap; `M` di ketiga layar penutup |
| FR-20 | Rekap kelas diunduh sebagai gambar PNG atau PDF A4 (P2, dimajukan pemilik proyek di Gerbang 1) |
| PRD bagian 5 dan 6 | TP 2 dan TP 5; alur "Akhir hari → Rekap pilihan → Refleksi tertulis → Main lagi / kembali ke galeri" |
| PRD bagian 9 | Tiga akhir dan pesan intinya; "Tidak ada kalah. Setiap akhir langsung diikuti rekap yang menunjukkan alternatif yang lebih baik"; bintang alasan sebagai satu-satunya unsur kompetitif |
| PRD bagian 10 | Empat ukuran layar, keyboard, kurangi gerak, kontras teks ≥ 4,5:1, makna tidak hanya lewat warna, tanpa layanan pihak ketiga, tanpa data siswa |
| Design System bagian 2, 3, 7, 8 | Nada ramah tanpa "kalah"; judul layar rata tengah; komponen "Layar akhir" dan "Rekap"; timbangan sebagai satu-satunya animasi besar ("Momen utama") |
| Architecture bagian 1, 3, 6, 8, 9, 10, 11, 13 | Dependensi baru dicatat sebagai keputusan; `Ending.tsx`, `Recap.tsx`, `Reflection.tsx`, dan `content/endings.ts`; fase `ending`, `recap`, `reflection`, dan `MAIN_LAGI`; pramuat; tombol; aksesibilitas; tautan galeri; tanpa jaringan luar |
| Keputusan Gerbang 1 | Usulan 1–13 dan tambahan unduhan entri F-09 `PLAN.md` |

## Perilaku

### Urutan sesudah adegan 6

| Fase | Layar | Bilah atas | Panel kiri | Tengah | Panel kanan | Bawah |
|---|---|---|---|---|---|---|
| `ending` | Layar akhir | Pukul 20.00, "Akhir hari" | Indikator, nilai akhir | Ilustrasi akhir dan timbangan | Papan tim dengan jumlah akhir | Judul, pesan, "Lihat rekap" |
| `recap` | Rekap, halaman 1–4 | Kepala rekap berwarna langit halaman itu | — | Kotak adegan | — | "Sebelumnya", "Berikutnya" atau "Lanjut ke refleksi" |
| `reflection` | Refleksi | Kepala "Refleksi" berwarna malam | — | Kalimat pemantik | — | "Main lagi", "Kembali ke galeri", "Unduh gambar", "Unduh PDF" |

- Diberikan fase bintang adegan 6, ketika guru memberi 0, 1, atau 2 bintang (tombol atau `0` `1` `2`), maka `BERI_BINTANG` lalu `LANJUT` dikirim seperti sekarang (F-07), fase menjadi `ending`, dan layar akhir langsung tampil tanpa sapuan dan tanpa pudar [Pemilik, usulan 1].
- Rekap dan refleksi menutupi seluruh layar 16:9 [Pemilik, usulan 3 dan 7]. Bilah atas, panel indikator, panggung, panel bawah, dan panel kanan dengan papan tim tidak dipasang di kedua layar itu (tidak ada di DOM), bukan hanya tertutup, sehingga tidak dibaca pembaca layar dan tidak masuk urutan Tab [DRAF].
- Ketiga layar berada di dalam `<main>` layar permainan yang sama. Wilayah `aria-live="polite"` dan `role="status"` dipasang sekali dan tetap elemen yang sama sejak adegan 1 sampai refleksi, sehingga pengumuman di ketiga layar terbaca. Wilayah yang baru dipasang bersama isinya sering tidak dibacakan pembaca layar [DRAF].
- Layar kerangka, pratinjau panggung (`#adegan-N`), dan alamat `#main-3` serta `#main-4` tidak berubah, kecuali bahwa permainan kini berakhir di ketiga layar ini.

### Layar akhir

**Isi** [Pemilik, usulan 1]

- Jenis akhir: `endingFor(state.meters)` (F-02): Warga Setara bila H ≥ 75 dan K ≥ 75; Hari yang Berat bila H < 40 atau K < 40; selain itu Hampir Seimbang.
- Bilah atas: busur hari F-04 tetap pada pukul 20.00 dengan bulan di titik keenam. Tulisan kanan "Akhir hari" menggantikan "Adegan 6/6", dan label pembaca layar bilah menjadi "Pukul 20.00, akhir hari".
- Panel kiri: indikator F-06 dengan nilai akhir `state.meters`, tanpa gerak dan tanpa angka melayang.
- Tengah: bingkai panggung F-04 berukuran 320 × 180 piksel logis kali k, dengan garis pindai dan vinyet yang sama, berisi:
  - latar `endings[id]` (C-02 sampai C-04), tanpa tokoh, bayangan kaki, dan ikon emosi;
  - timbangan D-10 (`iconStrips.timbangan`) berukuran 48 × 32 piksel logis di x 232, y 16, yaitu di tengah `END_SCALE_ZONE` (x 220–292, y 8–56), pada lapisan 30 (efek), di bawah garis pindai.

  Bingkai panggung memakai `role="img"` dengan label teks alternatif ilustrasi, disusul kalimat timbangan (bagian "Teks yang tampil").
- Panel kanan: papan tim F-07 dengan jumlah bintang akhir. Tidak ada ▶, bingkai giliran, maupun tulisan "Giliran". Tidak ada pengatur waktu dan bintang alasan.
- Panel bawah, rata tengah (Design System bagian 3): judul akhir, dua kalimat pesan dalam satu paragraf, lalu tombol "Lihat rekap" di kanan bawah, di tempat tombol lanjut F-05.

**Timbangan: posisi akhir** [Pemilik, usulan 2, pilihan a]

- Bingkai strip D-10: 0 miring kiri, 1 sedikit kiri, 2 seimbang, 3 sedikit kanan, 4 miring kanan. Piring kiri adalah sisi indikator hak orang lain terjaga (hati `teal`), dan piring kanan sisi indikator kewajiban dijalankan (centang `sky-d`) [Dokumen: Daftar_Aset D-10].
- Besar kemiringan mengikuti jenis akhir: Warga Setara seimbang, Hampir Seimbang sedikit miring, dan Hari yang Berat miring.
- Arah kemiringan: sisi indikator yang nilainya lebih tinggi turun, seperti timbangan sungguhan. Bila H = K, timbangan miring ke kanan, sehingga sisi hak orang lain yang terangkat.

  | Akhir | H > K | H < K | H = K |
  |---|---|---|---|
  | Warga Setara | 2 | 2 | 2 |
  | Hampir Seimbang | 1 | 3 | 3 |
  | Hari yang Berat | 0 | 4 | 4 |

  Contoh jalur: semua B (100/100) bingkai 2; A-A-B-B-B-B (100/65) bingkai 1; B-B-B-C-C-C (65/80) bingkai 3; A-B-A-B-B-A (50/50) bingkai 3; A-A-B-B-A-B (65/35) bingkai 0; semua A (0/0) bingkai 4; semua C (25/35) bingkai 4.

**Timbangan: gerak** [Pemilik, usulan 2]

- Tanpa kurangi gerak, timbangan berayun lalu berhenti di bingkai akhir, dengan satu animasi CSS bertahap (`step-end`) pada `background-position-x`: jeda 300 ms sejak layar akhir tampil, 200 ms per bingkai, sekali, dengan `animation-fill-mode: both`. Selama jeda timbangan menampilkan bingkai 2, dan sesudah selesai tetap di bingkai akhir.

  | Bingkai akhir | Nama gerak (`data-gerak`) | Urutan bingkai | Lama | Selesai pada |
  |---|---|---|---|---|
  | 2 | `seimbang` | 2, 1, 3, 2 | 800 ms | 1,1 detik |
  | 3 | `sedikit-kanan` | 2, 1, 3 | 600 ms | 0,9 detik |
  | 1 | `sedikit-kiri` | 2, 3, 1 | 600 ms | 0,9 detik |
  | 4 | `miring-kanan` | 2, 1, 3, 4 | 800 ms | 1,1 detik |
  | 0 | `miring-kiri` | 2, 3, 1, 0 | 800 ms | 1,1 detik |

- Keyframes (`ss-scale-{nama gerak}`): bingkai ke-i urutan (mulai 0) berada pada offset i/n, dengan n panjang urutan, dan keyframe 100% berisi bingkai akhir. Urutan 4 bingkai memakai 0%, 25%, 50%, 75%, dan 100%; urutan 3 bingkai memakai 0%, 33,333%, 66,667%, dan 100%. Dengan `step-end`, setiap bingkai tampil 200 ms, dan bingkai akhir tampil sejak 300 + 200 × (n − 1) ms.
- Bingkai yang tampil pada waktu tertentu sejak layar akhir tampil. Waktu contoh dipilih di tengah bingkai, jauh dari saat pergantian:

  | Gerak | 0 ms | 299 ms | 400 ms | 600 ms | 800 ms | 1.000 ms | Sesudah selesai |
  |---|---|---|---|---|---|---|---|
  | `seimbang` | 2 | 2 | 2 | 1 | 3 | 2 | 2 |
  | `sedikit-kanan` | 2 | 2 | 2 | 1 | 3 | 3 | 3 |
  | `sedikit-kiri` | 2 | 2 | 2 | 3 | 1 | 1 | 1 |
  | `miring-kanan` | 2 | 2 | 2 | 1 | 3 | 4 | 4 |
  | `miring-kiri` | 2 | 2 | 2 | 3 | 1 | 0 | 0 |

- Animasi diputar sekali per layar akhir. Menggambar ulang layar, misalnya karena `M` atau ukuran jendela berubah, tidak mengulangnya.
- Dengan kurangi gerak (`prefers-reduced-motion` atau `settings.reducedMotion`), timbangan langsung tampil di bingkai akhir tanpa animasi, dan `getAnimations()` pada timbangan kosong.

**Papan tim di layar akhir** [Pemilik, usulan 6b dan 6e]

- Urutan tim sama dengan pengaturan, tanpa peringkat. Jumlah bintang setiap tim sudah termasuk bintang adegan 6.
- Pop bintang adegan 6 (F-07) diputar di papan ini, pada tim yang menerima bintang, bila bintangnya 1 atau 2 dan kurangi gerak tidak aktif.
- Tanda "Bintang terbanyak" [DRAF A-1 dan A-2]:
  - tampil pada setiap tim yang jumlah bintangnya sama dengan jumlah tertinggi, asalkan jumlah itu lebih dari 0. Bila seri, beberapa tim mendapat tanda; bila semua tim 0 bintang, tidak ada tanda;
  - berupa baris sendiri di bawah nama dan bintang tim itu, sejajar dengan awal nama, berlatar `sun` dengan teks `ink`;
  - baris tim bertanda memakai atribut `data-terbanyak`.
- Kalimat pembaca layar setiap tim: "{nama}, {n} bintang." atau, untuk tim bertanda, "{nama}, {n} bintang, bintang terbanyak." Tanda yang terlihat disembunyikan dari pembaca layar, seperti bagian lain papan (F-07).
- Wilayah `role="status"` tetap berisi pengumuman bintang adegan 6 dari F-07 ("{nama} mendapat {n} bintang. Jumlah bintangnya sekarang {total}."), karena wilayah itu tidak dipasang ulang (laporan F-07, Temuan 2).

**"Lihat rekap"**

- Diberikan layar akhir sudah tampil 600 ms, ketika "Lihat rekap" diaktifkan (klik, `Enter` atau `Spasi` pada tombol, atau `Spasi` atau `Enter` sebagai pintasan saat fokus tidak di tombol atau tautan), maka `LANJUT` dikirim satu kali, fase menjadi `recap`, halaman 1 rekap tampil, dan bunyi klik diputar satu kali.
- Sebelum 600 ms, tekanan itu diabaikan tanpa bunyi (bagian "Masa tunggu").

### Rekap

**Halaman** [Pemilik, usulan 3]

- Empat halaman menurut `timeOfDay` naskah, yaitu adegan berurutan dengan waktu yang sama: pagi (adegan 1 dan 2), siang (3 dan 4), sore (5), dan malam (6).
- Nomor halaman adalah keadaan tampilan di `PlayScreen`, bukan keadaan mesin. Nilainya 1 saat fase `recap` dimulai.
- Setiap halaman berisi, dari atas:
  - **kepala** setinggi 8u berwarna langit waktu halaman itu (pagi `#FFD9A8`, siang `#6EC6F2`, dan sore `#FFC27A` dengan teks `ink`; malam `#4A4F9C` dengan teks `cream`, sama dengan bilah atas F-04). Di kiri, judul "Rekap pilihan kelas"; di kanan, misalnya "Pagi · halaman 1 dari 4";
  - **judul kolom** sekali per halaman: "Pilihan kelas", "Pilihan yang paling menjaga keseimbangan", dan "Rujukan";
  - **daftar** satu kotak berbingkai piksel per adegan di halaman itu;
  - **kaki** di kanan bawah: "Sebelumnya" (mulai halaman 2), lalu "Berikutnya", atau "Lanjut ke refleksi" di halaman 4.

**Isi satu kotak adegan** [Pemilik, usulan 3, 4a, 5c, dan 6e]

- Baris kepala: kotak nomor adegan (seperti kotak A/B/C F-05), judul adegan, "Pukul {jam}", lalu di kanan ikon bentuk tim yang bergiliran di adegan itu dan "{nama tim}, {n} bintang". Tim dan bintang dibaca dari entri `history` adegan itu (`teamId` dan `stars`).
- Tiga kolom berbanding 1 : 1 : 1,3:
  1. **Pilihan kelas:** kotak huruf dan teks pilihan; di bawahnya tanda tingkat, yaitu ikon emosi F-06 (hati, keringat, atau seru) dan tulisan "Tepat", "Kurang tepat", atau "Berisiko" di atas warna tingkat (`leaf`, `mango`, `coral`) dengan teks `ink`. Di adegan 5 ada baris hasil kuis (bagian "Teks yang tampil").
  2. **Pilihan yang paling menjaga keseimbangan:** kotak huruf dan teks pilihan bertingkat "Tepat". Bila kelas sudah memilihnya, kolom ini berisi ikon hati dan "Sama dengan pilihan kelas."
  3. **Rujukan:** `impact.rujukan` pilihan yang paling menjaga keseimbangan, berurutan dan apa adanya, dengan butir seperti kartu dampak. Rujukan ketiga pilihan satu adegan memang sama (PRD bagian 8).
- Pilihan yang paling menjaga keseimbangan adalah pilihan bertingkat `tepat` di adegan itu [Pemilik, usulan 4a]. Dengan naskah sekarang, itu B di keenam adegan. Uji unit memastikan setiap adegan punya tepat satu pilihan bertingkat `tepat`; bila kelak ada dua, uji gagal dan pemilik proyek memutuskan.
- Teks kedua pilihan memakai `choiceText` dengan bendera akhir (`state.flags`), seperti rencana. Jadi varian teks B adegan 6 tampil bila B dipilih di adegan 4 (FR-10). Hasilnya sama dengan teks saat adegan itu dimainkan: aturan 7 pemeriksa konten (`content/schema.ts`) mewajibkan bendera yang dibaca sudah disetel di adegan sebelumnya, dan dengan naskah sekarang satu-satunya bendera, `komangDibela`, hanya disetel pilihan B adegan 4. Uji unit memeriksa kesamaan itu untuk ke-729 jalur; bila kelak naskah membuatnya berbeda, uji gagal dan pemilik proyek memutuskan.
- Rujukan tampil tanpa tanda "perlu verifikasi" sampai F-11 (keputusan Gerbang 1 F-06 nomor 7). `Verifikasi_Rujukan.md` tidak diubah.

**Navigasi**

- Diberikan halaman p sudah tampil 600 ms, ketika "Berikutnya" diaktifkan (klik, `Enter` atau `Spasi` pada tombol, atau `Spasi` atau `Enter` sebagai pintasan), maka halaman p + 1 tampil dan bunyi klik diputar. Fase tetap `recap`.
- Di halaman 4, "Lanjut ke refleksi" dengan cara yang sama mengirim `LANJUT` satu kali; fase menjadi `reflection`.
- "Sebelumnya" (mulai halaman 2) langsung menampilkan halaman p − 1, tanpa masa tunggu, dengan bunyi klik. Masa tunggu halaman p − 1 dihitung lagi sejak halaman itu tampil.
- Klik kedua dan seterusnya dari satu klik ganda pada "Sebelumnya" (`event.detail > 1`) diabaikan tanpa bunyi, sehingga klik ganda hanya mundur satu halaman [DRAF A-9]. Klik tunggal (`detail` 1) dan tekanan `Enter` atau `Spasi` (`detail` 0) diterima [Coba]. Klik ganda itu jatuh di "Sebelumnya" halaman sebelumnya, karena letaknya sama di halaman 2 dan 3, dan "Sebelumnya" halaman 4 bertumpang sebagian dengannya (bagian "Tata letak").
- Tidak ada jalan kembali dari rekap ke layar akhir, atau dari refleksi ke rekap.

### Refleksi

[Pemilik, usulan 7 dan 8; tambahan Gerbang 1]

- Kepala setinggi 8u berwarna malam (`#4A4F9C`, teks `cream`) dengan judul "Refleksi".
- Isi: "Tulis jawabanmu di buku catatan.", lalu satu kotak berbingkai piksel berisi tiga kalimat pemantik bernomor 1 sampai 3, dengan kotak nomor seperti kotak A/B/C. Kalimatnya sama untuk ketiga akhir.
- Kaki:
  - kiri: "Main lagi" (tombol) dan "Kembali ke galeri" (tautan `href="../"`);
  - kanan: satu baris kabar unduhan (kosong bila belum ada unduhan), lalu tombol "Unduh gambar" dan "Unduh PDF".
- `Spasi` dan `Enter` bukan pintasan di layar ini, agar "Main lagi" tidak tertekan tanpa sengaja [Pemilik, usulan 9]. Keduanya hanya bekerja sebagai klik pada tombol yang berfokus. Tautan "Kembali ke galeri" yang berfokus hanya diaktifkan `Enter`; `Spasi` padanya tidak menghasilkan klik, seperti tautan biasa di peramban [Coba].

### "Main lagi" dan "Kembali ke galeri"

[Pemilik, usulan 8]

- Diberikan layar refleksi sudah tampil 600 ms, ketika "Main lagi" diaktifkan, maka:
  1. `replayActions(tim)` dikirim: `MAIN_LAGI`, lalu `startActions` dengan tim bawaan sebanyak alamat (`#main` 2 tim, `#main-3` 3 tim, dan `#main-4` 4 tim);
  2. reducer kembali ke fase `title` dengan `settings` tetap (F-02), lalu `startActions` membawa permainan ke narasi adegan 1 dengan tim yang sama, 0 bintang, `history` kosong, dan `quizAnswer` kosong;
  3. pengaturan suara tetap: bila suara dimatikan dengan `M`, permainan baru tetap tanpa bunyi;
  4. fokus pindah ke tombol lanjut kotak narasi adegan 1 (F-05);
  5. bunyi klik diputar satu kali (bila suara menyala);
  6. `round` dinaikkan satu, seperti `restart()` sekarang, sehingga pengaman sekali per adegan yang berkunci `${round}-${sceneIndex}` (`cardUsed`, `quizUsed`, dan `starsUsed`), layar narasi, dan isi wilayah `role="status"` dari permainan sebelumnya tidak berlaku lagi;
  7. nomor halaman rekap, kabar unduhan, pengumuman, dan pop bintang dikosongkan untuk permainan baru;
  8. `Enter` atau `Spasi` yang masih ditahan sesudah "Main lagi" tidak menekan tombol narasi (bagian "Keyboard").

  Di F-10, bagian `startActions` dibuang agar "Main lagi" berhenti di layar judul.
- "Kembali ke galeri" adalah tautan `<a href="../">` (Architecture bagian 11) bertuliskan "Kembali ke galeri". Tautan itu tidak berbunyi, karena halaman berpindah (F-07). Selama masa tunggu, tautan ber-`aria-disabled="true"`, dan klik atau `Enter` padanya dibatalkan (`preventDefault()`).

### Unduh rekap

[Pemilik, tambahan Gerbang 1; DRAF A-3 sampai A-7]

**Alur**

- Diberikan layar refleksi sudah tampil 600 ms dan tidak ada unduhan yang sedang disiapkan, ketika "Unduh gambar" atau "Unduh PDF" diaktifkan, maka:
  1. bunyi klik diputar satu kali;
  2. kedua tombol unduh menjadi nonaktif (`aria-disabled="true"`, latar `mist`, teks `dusk`), dan kelompok unduh (`.ss-download`) diberi `data-sibuk` bernilai `png` atau `pdf`;
  3. kabar "Menyiapkan gambar rekap…" atau "Menyiapkan PDF rekap…" tampil di baris kabar dan ditulis ke wilayah `role="status"`;
  4. lembar unduhan dipasang di luar layar (bagian "Lembar unduhan"). Sesudah lembar tergambar dan `document.fonts.ready` selesai, lembar digambar menjadi kanvas 1.240 px dengan `domToCanvas` dari `modern-screenshot` (`scale: 1`, `timeout: 10000`), yang memuat sendiri huruf dan ikon dari situs. [Diubah di Build, 27 Okt 2026: pilihan `font: { preferredFormat: "woff2" }` dibuang, karena di versi 4.7.0 pilihan itu menghapus sumber huruf kedua (Pixelify Sans) sehingga lembar memakai huruf pengganti. Percobaan [Coba] di bagian "Lembar unduhan" memang dijalankan tanpa pilihan itu. Laporan uji F-09, Temuan 1];
  5. untuk gambar, kanvas disimpan sebagai PNG (`toBlob("image/png")`). Untuk PDF, isi kanvas dijadikan PDF A4 oleh `ui/pdf.ts`;
  6. berkas diserahkan ke peramban lewat tautan `blob:` sementara dengan atribut `download`, bernama `rekap-sehari-setara-{YYYY-MM-DD}.png` atau `.pdf` menurut tanggal komputer. URL blob dilepas sesudahnya;
  7. lembar dilepas, kedua tombol aktif lagi, dan kabar menjadi "Gambar rekap siap. Periksa folder unduhan." atau "PDF rekap siap. Periksa folder unduhan.", juga di wilayah `role="status"`.
- Selama lembar disiapkan, tekanan pada kedua tombol unduh diabaikan tanpa bunyi, sehingga klik ganda hanya menghasilkan satu berkas.
- Kabar terakhir tetap tampil sampai unduhan berikutnya atau sampai layar refleksi ditinggalkan. Unduhan boleh diulang berapa kali pun.

**Galat dan pembatalan**

- Bila penyiapan gagal, misalnya `modern-screenshot` melempar galat, `toBlob` menghasilkan `null`, `CompressionStream` tidak tersedia (PDF), atau penyiapan lebih dari 15 detik, maka tidak ada berkas, kedua tombol aktif lagi, dan kabar menjadi "Rekap gagal dibuat. Coba lagi." Permainan tidak terganggu dan tidak ada galat halaman.
- Bila "Main lagi" diaktifkan atau layar refleksi ditinggalkan selama penyiapan, penyiapan dibatalkan: tidak ada berkas, tidak ada kabar, dan lembar dilepas [DRAF A-6].
- Gambar ikon yang gagal dimuat diganti ruang kosong oleh `modern-screenshot` (`placeholderImage` bawaan), sehingga lembar tetap jadi.

**Lembar unduhan** [DRAF A-3]

- Lembar adalah elemen DOM bergaya sendiri, selebar 1.240 px dan paling rendah 1.754 px (A4 pada 150 dpi), yang dipasang lewat portal ke `document.body` di `left: -100000px` (`position: fixed`), dengan `aria-hidden="true"` dan `inert`. Lembar tidak pernah terlihat dan tidak bisa difokus [Coba: `domToCanvas` menggambar lembar di luar layar sama dengan tangkapan layar lembar yang terlihat; beda piksel 0,28%, di tepi beberapa huruf dan garis bingkai].
- Isinya, dari atas: kepala malam berisi "Sehari Setara · Rekap pilihan kelas" dan tanggal unduh; ringkasan berisi "Akhir hari: {judul}", kedua indikator dengan batang 10 segmen dan nilai, serta papan tim (bentuk, nama, bintang, jumlah, dan tanda "Bintang terbanyak"); judul kolom; keenam kotak adegan dengan komponen yang sama dengan rekap; kotak "Refleksi" berisi "Tulis jawabanmu di buku catatan." dan ketiga kalimat pemantik; baris kaki "Ruang Setara · Pendidikan Pancasila kelas IX".
- Lembar tidak memuat data siswa: hanya nama tim dari daftar bawaan, pilihan kelas, bintang, dan teks naskah (Architecture bagian 13).
- Dengan naskah sekarang, isi lembar setinggi 1.619–1.735 px, jadi PNG selalu 1.240 × 1.754 px [Ukur]. Bila isinya lebih tinggi, misalnya karena huruf di komputer lain lebih lebar, lembar ikut memanjang, PNG lebih tinggi, dan PDF mengecilkan gambar agar muat satu halaman.

**PDF** [Pemilik, tambahan Gerbang 1]

- PDF 1.4 satu halaman A4 tegak (595,28 × 841,89 pt). Gambar lembar disimpan sebagai RGB 8 bit tanpa kompresi yang menurunkan mutu (`/FlateDecode` lewat `CompressionStream("deflate")`), diletakkan rata atas dan selebar mungkin tanpa melewati halaman, dengan `/Interpolate false` agar piksel tetap tajam.
- Tidak ada pustaka PDF. Kodenya di `ui/pdf.ts`, sekitar 0,9 KB gzip [Ukur]. PDF contoh lolos `qpdf --check` dan `pdfinfo` membacanya sebagai satu halaman A4 [Coba].

### Masa tunggu dan tekanan ganda

[Pemilik, usulan 9]

- Tombol maju di ketiga layar baru bekerja 600 ms sesudah layar atau halaman itu tampil: "Lihat rekap", "Berikutnya", "Lanjut ke refleksi", "Main lagi", "Kembali ke galeri", "Unduh gambar", dan "Unduh PDF", termasuk pintasan `Spasi` dan `Enter`. "Sebelumnya" tidak punya masa tunggu.
- Selama masa tunggu, tombol dan tautan itu tampil biasa (`cream`; saat `:focus-visible`, `sun` dengan kursor ▶), ber-`aria-disabled="true"`, dan tidak berubah warna saat diarahkan tetikus, sama dengan "Lanjut" kartu dampak F-06.
- Masa tunggu dihitung dengan `performance.now()` sejak layar atau halaman itu pertama kali digambar, dan diperiksa saat tekanan diterima, bukan dari tampilan tombol. Jadi tekanan pada 600 ms diterima walaupun tampilan tombol belum diperbarui. Satu pengatur waktu hanya memperbarui `aria-disabled`, dan dibersihkan saat layar atau halaman berganti atau layar ditutup. Reducer tetap tanpa `setTimeout`.
- Masa tunggu sama dengan atau tanpa kurangi gerak.
- Akibatnya [Ukur, letak tombol di bagian "Tata letak"]:
  - klik ganda "Lihat rekap" jatuh di "Berikutnya" halaman 1, yang masih tertahan;
  - klik ganda "Berikutnya" jatuh di "Berikutnya" atau "Lanjut ke refleksi" halaman berikutnya, yang masih tertahan;
  - klik ganda "Lanjut ke refleksi" jatuh di "Unduh PDF" atau ruang kosong, sehingga tidak ada berkas yang diunduh;
  - klik ganda "Sebelumnya" jatuh di "Sebelumnya" halaman sebelumnya atau ruang kosong, dan klik keduanya diabaikan (bagian "Navigasi");
  - `Enter` atau `Spasi` kedua sebagai pintasan diabaikan karena masa tunggu;
  - `Enter` yang ditahan pada tombol berfokus tidak menekannya lagi sesudah masa tunggu lewat (bagian "Keyboard").

  Tidak ada halaman yang terlewat, permainan tidak dimulai ulang, dan halaman tidak ditinggalkan tanpa sengaja.
- Klik ganda pada tombol bintang adegan 6: klik kedua jatuh di papan tim layar akhir, yang tidak berisi tombol, sehingga fokus bisa pindah dari judul ke halaman. Ini mengikuti keputusan F-08 usulan 6a (dibiarkan, dicatat untuk F-13). `Spasi` dan `Enter` tetap berarti "Lihat rekap".

### Fokus

- Setiap kali layar atau halaman berganti, fokus pindah ke judul yang terlihat. Judul itu berupa `<h2>` dengan `tabIndex=-1`, yaitu judul akhir, "Rekap pilihan kelas", atau "Refleksi". Saat `:focus-visible`, judul diberi garis fokus 2 px berjarak 4 px: `ink` untuk judul akhir, dan warna teks kepala untuk judul rekap dan refleksi (`ink`, atau `cream` di kepala malam) [Pemilik, usulan 9; DRAF warna garis di kepala malam, karena `ink` di atas `#4A4F9C` hanya 2,0:1].
- `<main>` diberi nama dari `<h1>` tersembunyi (`ss-sr`) yang isinya mengikuti layar: "Akhir hari", "Rekap pilihan kelas", atau "Refleksi".
- Urutan Tab:
  - layar akhir: "Lihat rekap" (papan tim tidak berisi tombol);
  - rekap: "Sebelumnya" (mulai halaman 2), lalu "Berikutnya" atau "Lanjut ke refleksi";
  - refleksi: "Main lagi", "Kembali ke galeri", "Unduh gambar", lalu "Unduh PDF".
- Ketiga layar bukan dialog, jadi fokus tidak dikunci.
- Mengubah ukuran jendela hanya mengubah letak dan ukuran. Fokus, halaman, masa tunggu, isi wilayah pengumuman, kabar unduhan, dan gerak timbangan tidak berubah, dan fokus tidak dipindah ke judul lagi.

### Pembaca layar

- Pengumuman layar memakai wilayah `aria-live="polite"` yang sama dengan narasi, kartu dampak, dan kuis. Isinya ditulis satu kali saat layar atau halaman tampil, utuh, dan tidak diulang saat layar digambar ulang:
  - layar akhir: pengumuman akhir;
  - setiap halaman rekap: pengumuman halaman;
  - refleksi: pengumuman refleksi.

  Teksnya ada di bagian "Teks yang tampil".
- Wilayah `role="status"` F-07 dipakai untuk peristiwa: bintang adegan 6, `M`, dan kabar unduhan.
- Rekap: daftar setiap halaman adalah `<ol>` bernama "Rekap pilihan kelas", satu butir per adegan. Kotak nomor, kotak huruf, dan ikon disembunyikan dari pembaca layar. Awalan tersembunyi (`ss-sr`) menggantikan maknanya: "Adegan {n}: " di depan judul adegan, lalu "Pilihan kelas {X}: ", "Pilihan yang paling menjaga keseimbangan {Y}: " (atau tanpa huruf bila sama dengan pilihan kelas), dan "Rujukan: " di depan isi ketiga kolom, sehingga butir tetap bermakna bila dibaca berurutan.
- Refleksi: kalimat pemantik adalah `<ol>` bernama "Kalimat pemantik"; kotak nomor disembunyikan.
- Tombol unduh punya nama yang diawali tulisannya: "Unduh gambar rekap (PNG)" dan "Unduh PDF rekap (A4)" (WCAG 2.5.3).
- Timbangan, ilustrasi, ikon tim, ikon bintang, dan tanda "Bintang terbanyak" yang terlihat disembunyikan dari pembaca layar, karena maknanya sudah ada di label panggung, pengumuman akhir, dan kalimat papan tim.

### Makna tidak hanya lewat warna

- Jenis akhir: judul dan kalimat. Arah timbangan: kalimat timbangan dan nilai kedua indikator.
- Tingkat pilihan: ikon dan tulisan "Tepat", "Kurang tepat", atau "Berisiko".
- "Sama dengan pilihan kelas.": ikon hati dan tulisan.
- Waktu halaman rekap: tulisan "Pagi", "Siang", "Sore", atau "Malam" di kepala; warna kepala hanya penanda tambahan.
- "Bintang terbanyak": tulisan, bukan hanya warna `sun`.
- Unduhan yang sedang disiapkan: kabar tertulis, bukan hanya warna tombol.
- Mode warna paksa (`forced-colors: active`): sudut terpotong kotak adegan, kotak kalimat pemantik, dan tombol dimatikan seperti F-05. Blok `@media (forced-colors: active)` ditulis sesudah aturan `clip-path`-nya (pelajaran laporan F-08, Temuan 1). Latar warna diganti warna sistem, dan semua makna di atas tetap terbaca dari tulisan.

### Keyboard

| Tombol | Fase | Fungsi |
|---|---|---|
| `Spasi`, `Enter` | `ending` | "Lihat rekap", sesudah 600 ms |
| `Spasi`, `Enter` | `recap` | "Berikutnya", atau "Lanjut ke refleksi" di halaman 4, sesudah 600 ms |
| `M` | `ending`, `recap`, `reflection` | Suara mati atau nyala (F-07), dengan pengumuman di wilayah `role="status"` |

- `Spasi` dan `Enter` sebagai pintasan hanya berlaku bila fokus tidak di tombol atau tautan (aturan F-05). Pada tombol yang berfokus, keduanya ditangani peramban sebagai klik tombol itu. Pada tautan yang berfokus ("Kembali ke galeri"), hanya `Enter` yang mengaktifkannya; `Spasi` tidak berpengaruh. Di fase `reflection`, keduanya bukan pintasan.
- Tombol yang ditahan [DRAF, mengikuti `RoleQuiz.tsx` F-08]: peramban mengubah setiap pengulangan `keydown` `Enter` pada tombol berfokus menjadi klik, sedangkan `Spasi` hanya mengklik sekali saat dilepas [Coba]. Karena itu, di fase `ending`, `recap`, dan `reflection`, `PlayScreen` membatalkan (`preventDefault()`) setiap `keydown` `Enter` atau `Spasi` yang berulang (`event.repeat`), di mana pun fokusnya. Menahan tombol tidak pernah menekan tombol lagi, juga sesudah masa tunggu lewat atau sesudah unduhan selesai. Membatalkan pengulangan `Spasi` tidak mengubah klik saat dilepas [Coba].
- Sesudah "Main lagi", pembatalan yang sama tetap berlaku di narasi adegan 1 sampai ada `keyup` atau `keydown` baru yang tidak berulang, agar `Enter` yang masih ditahan tidak melewati layar narasi. Sesudah itu, aturan F-05 di narasi berlaku seperti biasa.
- Di ketiga fase, tombol lain tidak berpengaruh dan tidak berbunyi, termasuk angka, huruf lain, `P` `T` `S`, panah, dan `Escape` (arti `Esc` di F-10).
- Aturan F-05 tetap berlaku: tekanan bersama Ctrl, Alt, atau Meta, tekanan berulang karena tombol ditahan, huruf yang sedang disusun, dan tekanan di kolom isian diabaikan.

### Bunyi

- Bunyi klik F-07 diputar sekali untuk setiap tekanan yang diterima: "Lihat rekap", "Berikutnya", "Sebelumnya", "Lanjut ke refleksi", "Main lagi", "Unduh gambar", dan "Unduh PDF".
- Tekanan yang diabaikan tidak berbunyi, termasuk selama masa tunggu dan selama lembar disiapkan. "Kembali ke galeri" tidak berbunyi.
- Tidak ada bunyi baru. Jingle akhir hari milik F-13.

### Kurangi gerak

- Timbangan langsung di bingkai akhir; pop bintang adegan 6 tidak diputar (F-07); denyut bulan di bilah atas berhenti (F-04).
- Rekap dan refleksi tidak punya animasi.
- Masa tunggu tetap 600 ms, dan bunyi klik tetap ada.

### Layar akhir sementara dihapus

[Pemilik, usulan 11]

- Yang diganti di `PlayScreen.tsx`: `END_PHASES`, `ended`, blok `<main className="ss-placeholder ss-play-end">`, `restart()`, `endTitleRef` dan efek yang memfokuskan judulnya, serta komentar kepala berkas yang menyebut layar akhir sementara.
- Yang dihapus:
  - `restartActions` di `ui/controls.ts`, diganti `replayActions`;
  - `copy.play.endTitle`, `endLead`, `endStatus`, dan `playAgain`;
  - aturan CSS `.ss-play-end .ss-placeholder-title:focus` dan `:focus-visible`;
  - uji "main lagi dari layar akhir" di `controls.test.ts`, diganti uji `replayActions`;
  - pemilih `.ss-play-end` dan tulisan "Main lagi dari adegan 1" di uji ujung ke ujung lama;
  - uraian "Layar akhir sementara" di Architecture bagian 7.
- Yang tetap, karena milik F-10: `startActions` dan keadaan awal yang melewati judul, pengaturan, dan prolog; alamat `#main`, `#main-3`, dan `#main-4`; layar kerangka; dan pratinjau panggung.

### Galeri dan aset

- Uji palet F-12 tetap lulus. Warna di aturan CSS baru hanya token yang sudah ada (`--ss-ink`, `--ss-dusk`, `--ss-mist`, `--ss-cream`, `--ss-white`, `--ss-sun`, `--ss-leaf`, `--ss-mango`, `--ss-coral`, `--ss-teal`, `--ss-sky-d`) dan keempat warna langit bilah atas yang sudah ada di `game.css`. Tidak ada token `:root` baru.
- Berkas galeri tidak berubah. Galeri tidak mengimpor `modern-screenshot`.

## Status antarmuka

| Bagian | Status | Tampilan |
|---|---|---|
| Layar akhir | Tampil (0–300 ms) | Timbangan di bingkai 2; "Lihat rekap" tertahan; judul berfokus |
| | Timbangan bergerak (300 ms sampai 0,9 atau 1,1 detik) | Bingkai berganti setiap 200 ms menurut urutan gerak |
| | Diam | Timbangan di bingkai akhir; sesudah 600 ms "Lihat rekap" siap |
| | Kurangi gerak | Timbangan langsung di bingkai akhir; tanpa pop bintang |
| | Ilustrasi gagal dimuat | Bingkai panggung berlatar `mist` dengan timbangan; judul, pesan, indikator, papan, dan tombol tetap |
| | Timbangan gagal dimuat | Kotak timbangan kosong; kalimat timbangan tetap ada di label panggung dan pengumuman |
| Papan tim (layar akhir) | Biasa | Baris tim tanpa ▶, bingkai, dan "Giliran" |
| | Bertanda | Baris kedua "Bintang terbanyak" berlatar `sun` |
| | Semua 0 bintang | Tidak ada tanda |
| Rekap | Halaman 1 | Tanpa "Sebelumnya"; "Berikutnya" |
| | Halaman 2 dan 3 | "Sebelumnya" dan "Berikutnya" |
| | Halaman 4 | "Sebelumnya" dan "Lanjut ke refleksi" |
| | Ikon tim, tingkat, atau hati gagal dimuat | Tulisan tetap; ruang ikon kosong |
| Refleksi | Biasa | Baris kabar kosong; empat tombol |
| Tombol maju | Tertahan (0–600 ms) | Tampilan biasa (`cream`; `:focus-visible` `sun` dengan ▶), `aria-disabled="true"`, tanpa warna arah tetikus |
| | Siap | Seperti `ss-next` atau `ss-button`: `cream`; saat `:focus-visible` atau arah tetikus, `sun` dengan kursor ▶ |
| Tombol unduh | Disiapkan | Keduanya `mist` dengan teks `dusk`, `aria-disabled="true"`; kelompok unduh ber-`data-sibuk` (`png` atau `pdf`); saat `:focus-visible`, kursor ▶ dan garis fokus 2 px `ink` berjarak 2 px, seperti tombol nonaktif F-07 |
| | Selesai | Aktif lagi; kabar "… siap. Periksa folder unduhan." |
| | Gagal | Aktif lagi; kabar "Rekap gagal dibuat. Coba lagi." |
| "Kembali ke galeri" | Tertahan | Tampilan biasa, `aria-disabled="true"`, klik dibatalkan |
| Judul layar | `:focus-visible` | Garis fokus 2 px berjarak 4 px (`ink`; `cream` di kepala malam) |
| Mode warna paksa | Semua layar | Sudut terpotong dimatikan; latar diganti warna sistem; tulisan tetap |
| Kosong | Tidak berlaku | `history` selalu berisi enam entri saat fase `ending` dimulai (reducer F-02), dan naskah selalu punya tepat satu pilihan `tepat` per adegan (diuji unit) |

Kontras teks [Dokumen: Design System bagian 4]:

| Pasangan | Rasio |
|---|---|
| `ink` di atas `cream` (judul, pesan, isi rekap, kalimat pemantik, tombol) | 13,3 : 1 |
| `dusk` di atas `cream` (jam, judul kolom, kabar unduhan) | 8,2 : 1 |
| `ink` di atas kepala pagi, siang, dan sore | 10,7 / 7,5 / 9,0 : 1 |
| `cream` di atas kepala malam | 6,8 : 1 |
| `ink` di atas `leaf`, `mango`, dan `coral` (tanda tingkat) | 8,3 / 6,9 / 5,1 : 1 |
| `ink` di atas `sun` (fokus, "Bintang terbanyak") | 9,9 : 1 |
| `cream` di atas `ink` (kotak nomor dan huruf) | 13,3 : 1 (kebalikan `ink` di atas `cream`, sudah dipakai kotak A/B/C F-05) |
| `dusk` di atas `mist` (tombol unduh saat disiapkan) | 5,9 : 1 |

## Tata letak dan ukuran

p adalah satu piksel antarmuka (`--ss-px`, F-05): 2 px di 1280×720, 1366×768, dan 1024×768, serta 3 px di 1920×1080. Semua ukuran huruf memakai u kecuali di lembar unduhan, yang memakai px tetap.

### Layar akhir

| Bagian | Nilai |
|---|---|
| Tata letak | Layar permainan F-05: bilah atas 8u, area panggung 52u, panel bawah 40u; panel kiri dan kanan seperti F-06 dan F-07 |
| Bilah atas | Sama dengan F-04 pada waktu malam; "Akhir hari" Pixelify Sans 3,1u, selebar 14,8u [Ukur] |
| Panggung | Bingkai, skala k, garis pindai, dan vinyet F-04; latar ilustrasi akhir 320 × 180 piksel logis |
| Timbangan | 48 × 32 piksel logis di x 232, y 16, lapisan 30, `image-rendering: pixelated`; latar strip 240 × 32 piksel logis; bingkai f di `background-position-x: −48f px` (piksel logis) |
| Papan tim | Seperti F-07. Baris bertanda: `flex-wrap`, celah baris 0,4u; tanda menjorok 16p + 1u, jarak dalam 0 × 0,6u, latar `sun`, Pixelify Sans 2,5u, tinggi baris 1,3, satu baris |
| Panel bawah | Kolom rata tengah, celah 1,6u, jarak atas 1,6u. Judul Press Start 2P 4,4u, tinggi baris 1,2. Pesan Pixelify Sans 3,6u, tinggi baris 1,35, lebar paling banyak 150u, `text-wrap: balance`. "Lihat rekap": `ss-next` F-05, di kanan bawah |

Hasil pengukuran [Ukur]:

| | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
|---|---|---|---|---|
| Lebar judul ("Warga Setara" / dua judul lain), satu baris | 52,8u / 66u | 52,8u / 66u | 52,8u / 66u | 52,8u / 66u |
| Atas judul | 62,8u | 62,8u | 62,8u | 62,8u |
| Baris pesan: Warga Setara dan Hampir Seimbang / Hari yang Berat | 2 / 3 | 2 / 3 | 2 / 3 | 2 / 3 |
| Sisa di atas "Lihat rekap": dua akhir pertama / Hari yang Berat | 11,5u / 6,6u | 11,5u / 6,7u | 11,5u / 6,6u | 11,2u / 6,3u |
| "Lihat rekap" (atas–bawah; kiri–kanan) | 92,5–98,8u; 151,8–173,8u | 92,5–98,8u; 151,8–173,8u | 92,5–98,8u; 151,8–173,8u | 92,2–98,8u; 151,5–173,8u |
| Timbangan di bingkai panggung (kiri, atas, lebar × tinggi) | 464, 32, 96 × 64 px | 464, 32, 96 × 64 px | 696, 48, 144 × 96 px | 386, 27, 80 × 53 px |
| Lebar tanda "Bintang terbanyak"; jarak ke tepi isi panel kanan | 24,7u; 7,7u | 24,6u; 10,8u | 24,7u; 7,7u | 24,7u; 4,9u |
| Bawah papan: 2 tim, satu tanda / 4 tim, dua tanda | 25,5u / 40,5u | 25,0u / 39,3u | 25,5u / 40,5u | 28,1u / 45,6u |
| Bawah papan bila semua tim seri: 3 tim, tiga tanda / 4 tim, empat tanda | 38,5u / 47,8u | 37,6u / 46,6u | 38,5u / 47,8u | 42,8u / 53,6u |

- Panel kanan berakhir pada 60u, jadi papan tetap muat juga pada kasus terpanjang, empat tim seri dengan empat tanda (sisa 6,4u di 1024×768). Jarak tanda ke tepi isi panel kanan sama dengan satu tanda.
- Tidak ada teks yang meluap.

### Rekap

| Bagian | Nilai |
|---|---|
| Layar | Menutupi `.ss-screen` (lapisan 100), latar `cream`; kolom kepala, isi, dan kaki |
| Kepala | Tinggi 8u, jarak dalam 0 × 4u, celah 2,4u. Judul Press Start 2P 2,8u, tinggi baris 1,3. Keterangan halaman Pixelify Sans 2,5u, tinggi baris 1,3, di kanan |
| Isi | Jarak dalam 1,2u atas, 4u kiri-kanan, 0 bawah; celah 1,2u; `overflow: hidden` |
| Judul kolom | Kolom 1 : 1 : 1,3 dengan celah 2,4u, menjorok 1,6u + 2p agar sejajar isi kotak; Pixelify Sans 2,5u `dusk` |
| Kotak adegan | Bingkai piksel F-05 (garis `ink` 2p, sudut terpotong p, sorotan `white` p), latar `cream`; jarak dalam 0,8u atas, 1,6u kiri-kanan, 1u bawah; celah 0,6u; antarkotak 1,2u |
| Baris kepala kotak | Celah 1,2u. Kotak nomor sama dengan kotak A/B/C F-05 (Press Start 2P 2,8u). Judul adegan Pixelify Sans 3,1u. "Pukul {jam}" 2,5u `dusk`. Tim di kanan: ikon bentuk 16p, celah 0,8u, teks 2,5u; satu baris |
| Kolom isi | Tiga kolom 1 : 1 : 1,3, celah 2,4u; isi kolom bertumpuk dengan celah 0,5u |
| Teks pilihan | Kotak huruf Press Start 2P 2,5u (jarak dalam 0,5u, `cream` di atas `ink`), celah 1,2u, teks Pixelify Sans 3,1u, tinggi baris 1,3 |
| Tanda tingkat | Garis `ink` p, jarak dalam 0 × 0,8u, celah 0,6u; ikon emosi 8p × 8p; Pixelify Sans 2,5u |
| Baris kuis | Pixelify Sans 2,5u, tinggi baris 1,3 |
| "Sama dengan pilihan kelas." | Ikon hati 16p, celah 0,8u, Pixelify Sans 3,1u |
| Rujukan | Pixelify Sans 3,1u, tinggi baris 1,3, celah 0,4u, menjorok 1,6u dengan penanda kotak `ink` 2p di tengah baris pertama |
| Kaki | Rata kanan, celah 2u, jarak dalam 1,2u × 4u; tombol `ss-next` F-05 |

Hasil pengukuran [Ukur], dengan jalur semua A, semua B, semua C, B-B-B-C-C-C, dan C-C-C-A-A-A (teks pilihan kelas terpanjang tanpa B), dengan 2 dan 4 tim, ditambah kasus "Tim Mentari" di setiap kotak dan jawaban kuis Hakim:

| | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
|---|---|---|---|---|
| Sisa terkecil di bawah kotak terakhir, semua halaman | 8,4u | 9,2u | 8,4u | 5,0u |
| "Berikutnya" (atas–bawah; kiri–kanan) | 92,5–98,8u; 152,3–173,8u | 92,5–98,8u; 152,3–173,8u | 92,5–98,8u; 152,3–173,8u | 92,2–98,8u; 152,0–173,8u |
| "Sebelumnya" di halaman 2 dan 3 (kiri–kanan) | 128,4–150,3u | 128,5–150,3u | 128,4–150,3u | 127,9–150,0u |
| "Sebelumnya" di halaman 4 (kiri–kanan) | 119,7–141,5u | 119,8–141,6u | 119,7–141,5u | 119,2–141,3u |
| "Lanjut ke refleksi" (kiri–kanan) | 143,5–173,8u | 143,6–173,8u | 143,5–173,8u | 143,3–173,8u |

- Sisa per halaman dari semua kasus: halaman pagi 8,3–15,7u, siang 5,0–17,7u, sore 18,4–20,5u, dan malam 44,2–46,7u. Sisa 5,0u cukup untuk satu baris teks pilihan tambahan (4,03u) bila pemenggalan baris di komputer lain berbeda.
- Tidak ada teks yang meluap ke samping, dan keterangan tim tidak menabrak judul adegan maupun jam di semua kasus.

### Refleksi

| Bagian | Nilai |
|---|---|
| Kepala | Tinggi 8u, latar `#4A4F9C`, teks `cream`, jarak dalam 0 × 4u; judul Press Start 2P 2,8u |
| Isi | Jarak dalam 3u atas, 12u kiri-kanan; celah 2,4u. Kalimat pembuka Pixelify Sans 3,6u, tinggi baris 1,35 |
| Kotak kalimat pemantik | Bingkai piksel F-05; jarak dalam 2u × 2,4u; celah 2u. Setiap kalimat: kotak nomor seperti kotak A/B/C, celah 1,6u, Pixelify Sans 3,6u, tinggi baris 1,35 |
| Kaki | Jarak dalam 1,2u atas, 12u kiri-kanan, 3u bawah; kiri dan kanan berjauhan (`space-between`), rata bawah. Kiri: dua `ss-button` dengan celah 3u. Kanan: baris kabar (Pixelify Sans 2,5u `dusk`, tinggi satu baris selalu dicadangkan, rata kanan) di atas dua `ss-button` dengan celah 3u |

Hasil pengukuran [Ukur]:

| | 1280×720 | 1366×768 | 1920×1080 | 1024×768 |
|---|---|---|---|---|
| Baris kalimat pemantik | 1 + 2 + 2 | 1 + 2 + 2 | 1 + 2 + 2 | 1 + 2 + 2 |
| Sisa di bawah kotak kalimat | 31,8u | 31,9u | 31,8u | 31,2u |
| "Main lagi" (atas–bawah; kiri–kanan) | 88,9–97,0u; 12,0–39,1u | 88,9–97,0u; 12,0–39,0u | 88,9–97,0u; 12,0–39,1u | 88,6–97,0u; 12,0–39,3u |
| "Kembali ke galeri" (kiri–kanan) | 42,1–80,9u | 42,0–80,8u | 42,1–80,9u | 42,3–81,4u |
| "Unduh gambar" (kiri–kanan) | 97,6–133,3u | 97,7–133,4u | 97,6–133,3u | 97,0–133,0u |
| "Unduh PDF" (kiri–kanan) | 136,3–165,8u | 136,4–165,8u | 136,3–165,8u | 136,0–165,8u |
| Kabar terpanjang ("Gambar rekap siap. Periksa folder unduhan."), satu baris | 52,7u | 52,7u | 52,7u | 52,7u |
| Jarak antara kelompok kiri dan kanan | 16,7u | 16,9u | 16,7u | 15,6u |

Tidak ada yang meluap, dan letak tombol tidak berubah karena kabar.

### Lembar unduhan

| Bagian | Nilai (px tetap) |
|---|---|
| Lembar | Lebar 1.240, tinggi paling rendah 1.754; jarak dalam 24 × 40; kolom dengan celah 8; latar `cream`; `--u: 6px` dan `--ss-px: 2px` di lembar, sehingga kotak adegan memakai aturan rekap dengan ukuran tetap (3,1u = 18,6 px; 2,5u = 15 px; 2,8u = 16,8 px) |
| Kepala | Latar `#4A4F9C`, teks `cream`, jarak dalam 12 × 20; judul Press Start 2P 22, tinggi baris 1,3; tanggal Pixelify Sans 18 di kanan |
| Ringkasan | Bingkai piksel (garis 4, sorotan 2); jarak dalam 10 × 18; dua kolom sama lebar, celah 24. Kiri: "Akhir hari: {judul}" Press Start 2P 18, lalu dua baris indikator (nama 18 selebar 220, batang 10 segmen F-06 dengan p = 2 px, nilai 18). Kanan: tim dalam dua kolom, celah 6 × 16, huruf 18; ikon bentuk dan bintang 32 × 32; tanda "Bintang terbanyak" 15 berlatar `sun` |
| Judul kolom dan kotak adegan | Sama dengan rekap, dengan `--u: 6px` |
| Kotak "Refleksi" | Bingkai piksel; jarak dalam 10 × 18; "Refleksi" Press Start 2P 16 dan kalimat pembuka 18 dalam satu baris; kalimat pemantik bernomor 18, tinggi baris 1,35, celah 4 |
| Kaki | Pixelify Sans 15 `dusk`, di dasar lembar |

Hasil pengukuran [Ukur]:

| Kasus | Tinggi isi |
|---|---|
| Kelima jalur rekap dengan 2, 3, dan 4 tim, bintang 2, 1, 0, 2, 1, 2 | 1.619–1.708 px |
| Semua tim seri sehingga setiap tim bertanda (3 tim dan 4 tim), jalur semua B, B-B-B-C-C-C, dan C-C-C-A-A-A | 1.661–1.735 px |

Tertinggi: semua B dengan semua tim seri, 1.735 px, sisa 19 px. Tidak ada luapan ke samping. Jadi lembar selalu 1.240 × 1.754 px.

## Teks yang tampil (final)

Judul, kalimat, dan teks alternatif ketiga akhir ada di `app/sehari-setara/content/endings.ts`, yang sudah tercantum di Architecture bagian 3. Teks lain ada di `content/copy.ts`. Judul adegan, jam, teks pilihan, tingkat, dan rujukan berasal dari naskah tanpa perubahan.

**Ketiga akhir** [judul: PRD bagian 9; kalimat dan teks alternatif: Pemilik, usulan 1, draf baru]

| Akhir | Judul | Pesan (dua kalimat) | Teks alternatif ilustrasi |
|---|---|---|---|
| `setara` | Warga Setara | Hak orang lain terjaga dan kewajiban dijalankan, sehingga timbangan Nara seimbang. Mari lihat rekap untuk mengingat alasan di balik setiap pilihan. | Nara duduk tersenyum di bangku teras sambil menggenggam teh hangat. Malam cerah, bulan dan banyak bintang bersinar. |
| `hampir` | Hampir Seimbang | Banyak pilihan kelas sudah baik, tetapi ada yang masih bisa diperbaiki. Mari lihat rekap untuk menemukan pilihan yang lebih menjaga keseimbangan. | Nara duduk merenung di bangku teras sambil bertopang dagu. Sebagian langit berawan, dan bulan setengah tertutup. |
| `berat` | Hari yang Berat | Pilihan kecil ternyata berdampak besar bagi orang-orang di sekitar Nara. Ini kesempatan untuk belajar: mari lihat rekap untuk menemukan pilihan yang lebih menjaga keseimbangan. | Nara duduk di bangku teras dan menatap langit yang berawan. Ada bintang jatuh, dan Nara tersenyum kecil penuh harapan. |

Tidak ada kata "kalah", "gagal", atau "salah" di ketiga akhir (Design System bagian 2 nomor 3).

**Kalimat timbangan** [Pemilik, usulan 2, draf baru]

| Keadaan | Kalimat |
|---|---|
| Seimbang | Timbangan seimbang. |
| Sedikit miring, H > K | Timbangan sedikit miring ke sisi hak orang lain terjaga. |
| Sedikit miring, H < K | Timbangan sedikit miring ke sisi kewajiban dijalankan. |
| Miring, H > K | Timbangan miring ke sisi hak orang lain terjaga. |
| Miring, H < K | Timbangan miring ke sisi kewajiban dijalankan. |
| Sedikit miring, H = K | Timbangan sedikit miring. |
| Miring, H = K | Timbangan miring. |

Nama indikator ditulis huruf kecil di dalam kalimat (AGENTS bagian 8: huruf kapital hanya di awal kalimat).

**Teks lain**

| Tempat | Teks | Asal |
|---|---|---|
| Bilah atas layar akhir | Akhir hari | Pemilik, usulan 1 (draf baru) |
| Label bilah atas layar akhir (pembaca layar) | Pukul 20.00, akhir hari | Pemilik, usulan 1 (draf baru) |
| Judul `<h1>` tersembunyi | Akhir hari / Rekap pilihan kelas / Refleksi | DRAF |
| Tombol layar akhir | Lihat rekap | Pemilik, usulan 1 (draf baru) |
| Tanda papan tim | Bintang terbanyak | Pemilik, usulan 6b |
| Kalimat papan tim (pembaca layar) | {nama}, {n} bintang. / {nama}, {n} bintang, bintang terbanyak. | F-07, ditambah DRAF A-1 |
| Judul rekap | Rekap pilihan kelas | Pemilik, usulan 3 (draf baru) |
| Keterangan halaman | {Pagi, Siang, Sore, Malam} · halaman {p} dari 4 | Pemilik, usulan 3 (draf baru) |
| Judul kolom | Pilihan kelas; Pilihan yang paling menjaga keseimbangan; Rujukan | Pemilik, usulan 3 (draf baru); "Pilihan yang paling menjaga keseimbangan" dari FR-13 |
| Jam | Pukul {jam}, misalnya "Pukul 06.15" | Pemilik, usulan 3 |
| Tim di kotak adegan | {nama tim}, {n} bintang | Pemilik, usulan 6e |
| Tanda tingkat | Tepat; Kurang tepat; Berisiko | F-06 (`copy.impact.tier`) |
| Pilihan terbaik sama | Sama dengan pilihan kelas. | Pemilik, usulan 3 (draf baru) |
| Baris kuis, jawaban lain | Kuis peran: jawaban kelas {peran}, jawaban tepat {peran tepat}. | Pemilik, usulan 5 (draf baru); DRAF A-8 |
| Baris kuis, jawaban tepat | Kuis peran: jawaban kelas {peran tepat}, tepat. | Pemilik, usulan 5 (draf baru); DRAF A-8 |
| Tombol rekap | Sebelumnya; Berikutnya; Lanjut ke refleksi | Pemilik, usulan 3 (draf baru) |
| Nama daftar rekap (pembaca layar) | Rekap pilihan kelas | Pemilik, usulan 9 |
| Awalan tersembunyi di kotak adegan | Adegan {n}: ; Pilihan kelas {X}: ; Pilihan yang paling menjaga keseimbangan {Y}: ; Pilihan yang paling menjaga keseimbangan: ; Rujukan: | DRAF |
| Judul refleksi | Refleksi | Pemilik, usulan 7 (draf baru) |
| Kalimat pembuka | Tulis jawabanmu di buku catatan. | Pemilik, usulan 7 (draf baru) |
| Kalimat pemantik 1 | Pilihan mana yang paling sulit diputuskan kelasmu hari ini, dan mengapa? | Pemilik, usulan 7 (draf baru) |
| Kalimat pemantik 2 | Hak siapa yang terdampak oleh pilihan itu, dan pasal mana di rekap yang berkaitan dengannya? | Pemilik, usulan 7 (draf baru) |
| Kalimat pemantik 3 | Bila kamu mengalami situasi serupa, apa yang akan kamu lakukan agar hak orang lain terjaga dan kewajibanmu tetap dijalankan? | Pemilik, usulan 7 (draf baru) |
| Nama daftar kalimat pemantik (pembaca layar) | Kalimat pemantik | DRAF |
| Tombol refleksi | Main lagi; Kembali ke galeri | FR-15; teks F-01 `copy.backToGallery` |
| Tombol unduh | Unduh gambar; Unduh PDF | DRAF A-4 |
| Nama tombol unduh (pembaca layar) | Unduh gambar rekap (PNG); Unduh PDF rekap (A4) | DRAF A-4 |
| Kabar unduhan | Menyiapkan gambar rekap… / Menyiapkan PDF rekap… / Gambar rekap siap. Periksa folder unduhan. / PDF rekap siap. Periksa folder unduhan. / Rekap gagal dibuat. Coba lagi. | DRAF A-4 |
| Nama berkas | rekap-sehari-setara-{YYYY-MM-DD}.png dan .pdf | DRAF A-5 |
| Lembar: judul | Sehari Setara · Rekap pilihan kelas | DRAF A-3 |
| Lembar: tanggal | Tanggal komputer, misalnya "Selasa, 27 Oktober 2026" (`Intl.DateTimeFormat("id-ID")`, hari, tanggal, bulan, dan tahun) | DRAF A-3 |
| Lembar: ringkasan | Akhir hari: {judul}; Hak orang lain terjaga; Kewajiban dijalankan | DRAF A-3; nama indikator dari F-06 |
| Lembar: kaki | Ruang Setara · Pendidikan Pancasila kelas IX | DRAF A-3 |

{peran} dan {peran tepat} adalah label peran dari `content/roles.ts`; {peran tepat} adalah peran `roleQuiz.answer` adegan 5, yaitu Hakim dengan naskah sekarang.

**Pengumuman di wilayah `aria-live`** [Pemilik, usulan 9; susunan rinci DRAF]

1. Layar akhir: `Akhir hari: {judul}.` `{kalimat 1}` `{kalimat 2}` `Hak orang lain terjaga {H}.` `Kewajiban dijalankan {K}.` `{kalimat timbangan}`, dipisahkan satu spasi. Contoh B-B-B-C-C-C:

   > Akhir hari: Hampir Seimbang. Banyak pilihan kelas sudah baik, tetapi ada yang masih bisa diperbaiki. Mari lihat rekap untuk menemukan pilihan yang lebih menjaga keseimbangan. Hak orang lain terjaga 65. Kewajiban dijalankan 80. Timbangan sedikit miring ke sisi kewajiban dijalankan.

2. Halaman rekap: `Rekap pilihan kelas, {waktu}, halaman {p} dari 4.`, lalu untuk setiap adegan di halaman itu: `Adegan {n}, {judul}, pukul {jam}.` `{nama tim}, {b} bintang.` `Pilihan kelas {X}: {teks}.` `{Tingkat}.` `{baris kuis}` (adegan 5) `Pilihan yang paling menjaga keseimbangan {Y}: {teks}.` atau `Pilihan yang paling menjaga keseimbangan: sama dengan pilihan kelas.`, lalu `Rujukan: {r1}; {r2}; … .` Waktu ditulis huruf kecil. Contoh halaman 1, jalur semua B, dua tim, bintang 2 dan 1:

   > Rekap pilihan kelas, pagi, halaman 1 dari 4. Adegan 1, Pagi di rumah, pukul 06.15. Tim Mangga, 2 bintang. Pilihan kelas B: Mengantar Gita, lalu memberi tahu ketua kelas akan sedikit terlambat dan mengganti piket saat istirahat. Tepat. Pilihan yang paling menjaga keseimbangan: sama dengan pilihan kelas. Rujukan: Pasal 28B ayat (2) UUD NRI 1945; UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 14 ayat (1); UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 19. Adegan 2, Perjalanan ke sekolah, pukul 06.50. Tim Laut, 1 bintang. Pilihan kelas B: Menolak dengan sopan, berjalan cepat atau naik angkot, dan mengingatkan Dimas memakai helm. Tepat. Pilihan yang paling menjaga keseimbangan: sama dengan pilihan kelas. Rujukan: Pasal 28G ayat (1) UUD NRI 1945; Pasal 31 ayat (1) UUD NRI 1945; Pasal 27 ayat (1) UUD NRI 1945; UU No. 22 Tahun 2009 tentang LLAJ, Pasal 77 ayat (1) dan Pasal 106 ayat (8).

   Isi rujukan dan teks pilihan pada contoh disalin dari naskah saat spesifikasi ditulis; uji memakai fungsi pengumuman dengan naskah asli, bukan salinan ini.

3. Refleksi: `Refleksi. Tulis jawabanmu di buku catatan. 1. {kalimat 1} 2. {kalimat 2} 3. {kalimat 3}`.

Teks layar kerangka, pratinjau, bilah atas di adegan 1–6, kotak narasi, pilihan, kartu dampak, kuis, pengatur waktu, bintang alasan, dan naskah tidak berubah. Yang dihapus: `copy.play.endTitle`, `endLead`, `endStatus`, dan `playAgain`.

## Data dan aksi

### Mesin

[Pemilik, usulan 5c dan 10]

- `HistoryEntry` mendapat bidang opsional `quizAnswer?: RoleId`.
- Di fase `quiz`, `JAWAB_KUIS` yang diterima (bila `quizAnswer` masih `null`) mengisi `state.quizAnswer` seperti F-02, dan juga mengisi `quizAnswer` pada entri `history` adegan berjalan, dengan objek dan larik baru (reducer tetap murni). Bila entri itu tidak ada, hanya `state.quizAnswer` yang diisi. Indikator, bendera, dan bintang tidak berubah.
- Jawaban kedua tetap ditolak (keadaan yang sama dikembalikan). `MAIN_LAGI` mengosongkan `history`, jadi jawaban ikut hilang; memotong `history` (FR-18, F-13) juga membuangnya.
- Tidak ada aksi atau fase baru. `endingFor`, `metersFromHistory`, `flagsFromHistory`, `starsByTeam`, dan `choiceText` dipakai apa adanya. Reducer tetap tanpa pengatur waktu, tanggal, dan bilangan acak (F-02 AC-14).

### Aksi yang dikirim layar permainan

| Saat | Aksi |
|---|---|
| Sampai bintang adegan 6 | Sama dengan F-05 sampai F-08; `JAWAB_KUIS` kini juga dicatat di `history` oleh reducer |
| "Lihat rekap" atau `Spasi`/`Enter`, fase `ending`, sesudah 600 ms, sekali | `LANJUT` (`ending` ke `recap`) |
| "Berikutnya" dan "Sebelumnya" | Tidak ada aksi; hanya nomor halaman di `PlayScreen` |
| "Lanjut ke refleksi" atau `Spasi`/`Enter` di halaman 4, sesudah 600 ms, sekali | `LANJUT` (`recap` ke `reflection`) |
| "Main lagi", fase `reflection`, sesudah 600 ms, sekali | `replayActions(tim)`: `MAIN_LAGI`, `MULAI`, `SIMPAN_PENGATURAN` (tim bawaan sebanyak alamat, `settings: {}`), `LANJUT` |
| `M` di ketiga fase | `UBAH_PENGATURAN` dengan `sound` dibalik (F-07) |
| Unduhan | Tidak ada aksi |

Klik dan pengumuman hanya diputar atau ditulis bila tekanan itu diterima (aturan F-07).

### Berkas dan ekspor

`app/sehari-setara/ui/closing.ts` berisi fungsi murni ketiga layar penutup, diuji di `__tests__/closing.test.ts`. Namanya bukan `ending.ts` atau `recap.ts`, agar tidak tertukar dengan `Ending.tsx` dan `Recap.tsx` di sistem berkas yang tidak membedakan huruf besar.

| Ekspor | Isi |
|---|---|
| `CLOSING_GUARD_MS` | 600 |
| `SCALE_BOX` | `{ left: 232, top: 16, w: 48, h: 32 }` (piksel logis) |
| `SCALE_DELAY_MS`, `SCALE_FRAME_MS` | 300 dan 200 |
| `ScaleFrame` | `0 \| 1 \| 2 \| 3 \| 4` |
| `ScaleView` | `{ frame: ScaleFrame; tilt: "seimbang" \| "sedikit" \| "miring"; side: "hak" \| "kewajiban" \| null; motion: "seimbang" \| "sedikit-kiri" \| "sedikit-kanan" \| "miring-kiri" \| "miring-kanan"; sequence: readonly ScaleFrame[] }`. `side` bernilai `null` bila seimbang atau H = K |
| `scaleView(meters)` | Posisi akhir dan gerak timbangan menurut tabel di bagian "Timbangan" |
| `scaleSentence(view)` | Kalimat timbangan |
| `bestChoice(scene)` | Pilihan bertingkat `tepat` pertama di adegan itu |
| `RecapRow` | `{ scene: Scene; number: number; choice: Choice; choiceText: string; best: Choice; bestText: string; same: boolean; references: readonly Reference[]; team: { id: string; name: string; shape: Team["shape"] } \| null; stars: Stars; quiz: { answer: RoleId; correct: boolean } \| null }` |
| `recapRows(history, scenes, teams, flags)` | Satu `RecapRow` per entri `history`, berurutan menurut adegan; teks pilihan dengan `choiceText(pilihan, flags)`, dan `PlayScreen` mengirim `state.flags` |
| `recapPages(scenes)` | Indeks adegan per halaman, dikelompokkan menurut `timeOfDay` yang berurutan: `[[0, 1], [2, 3], [4], [5]]` |
| `quizLine(quiz, roles, correctId)` | Teks baris kuis |
| `topTeamIds(teams)` | Id tim dengan jumlah bintang tertinggi, bila jumlah itu lebih dari 0; selain itu kosong |
| `endingAnnouncement(id, meters, view)` | Pengumuman layar akhir |
| `recapPageAnnouncement(rows, pages, page)` | Pengumuman satu halaman rekap |
| `reflectionAnnouncement()` | Pengumuman refleksi |

`app/sehari-setara/ui/download.ts`: alur unduhan dan fungsi murninya, diuji di `__tests__/download.test.ts`.

| Ekspor | Isi |
|---|---|
| `DOWNLOAD_TIMEOUT_MS` | 15.000 |
| `SHEET_SIZE` | `{ w: 1240, h: 1754 }` |
| `DownloadKind` | `"png" \| "pdf"` |
| `downloadFileName(kind, date)` | `rekap-sehari-setara-{YYYY-MM-DD}.{kind}`, dengan tanggal waktu setempat dan bulan serta tanggal dua angka |
| `sheetDate(date)` | Tanggal panjang Indonesia, misalnya "Selasa, 27 Oktober 2026" |
| `withTimeout(promise, ms)` | Promise yang ditolak bila `promise` belum selesai sesudah `ms` |
| `renderSheet(node)` | `domToCanvas(node, { scale: 1, timeout: 10000 })` (diubah di Build; lihat Alur langkah 4) |
| `saveBlob(blob, name)` | Tautan `blob:` sementara dengan atribut `download`; URL dilepas sesudah klik |

`app/sehari-setara/ui/pdf.ts`: PDF tanpa pustaka, diuji di `__tests__/pdf.test.ts`.

| Ekspor | Isi |
|---|---|
| `A4_PT` | `{ w: 595.28, h: 841.89 }` |
| `pdfPlacement(w, h)` | Letak gambar dalam pt: diperkecil sebanding sampai muat lebar dan tinggi A4, rata atas dan rata tengah mendatar |
| `pdfFromRgb(w, h, rgb)` | `Promise<Uint8Array>`: PDF 1.4 dengan objek katalog, halaman, gambar (`/DeviceRGB`, 8 bit, `/FlateDecode`, `/Interpolate false`), dan isi halaman, ditambah tabel `xref` dengan posisi byte yang benar |
| `canvasToPdf(canvas)` | `Promise<Blob>` (`application/pdf`): RGBA kanvas diubah menjadi RGB, lalu `pdfFromRgb` |

Berkas lain:

| Berkas | Isi |
|---|---|
| `content/endings.ts` (baru) | `ENDINGS: Record<EndingId, { title: string; message: readonly [string, string]; alt: string }>` |
| `ui/Ending.tsx` (baru) | `EndingStage({ id, view, scale, animate })`: bingkai panggung dengan ilustrasi dan timbangan; `data-bingkai` selalu, `data-gerak` hanya bila `animate`. `EndingPanel({ id, ready, onNext })`: judul (berfokus sekali saat tampil), pesan, dan "Lihat rekap" |
| `ui/Recap.tsx` (baru) | `Recap({ rows, pages, page, ready, onPrev, onNext })`: satu halaman rekap; judul berfokus setiap kali halaman berganti. `RecapItem({ row })`: satu kotak adegan, dipakai juga lembar unduhan |
| `ui/Reflection.tsx` (baru) | `Reflection({ ready, download, onReplay, onDownload })`: judul berfokus sekali, kalimat pemantik, tombol, tautan galeri, dan baris kabar |
| `ui/RecapSheet.tsx` (baru) | `RecapSheet({ id, meters, teams, topIds, rows, date })`: lembar unduhan, dipasang lewat portal ke `document.body` hanya selama penyiapan |
| `ui/PlayScreen.tsx` | Ketiga layar penutup menurut fase di dalam `<main>` yang sama; di `recap` dan `reflection`, bilah atas, indikator, panggung, panel bawah, dan panel kanan tidak dipasang; nomor halaman rekap; masa tunggu (ref waktu mulai dan satu pengatur waktu tampilan) untuk setiap layar dan halaman; "Sebelumnya" mengabaikan `event.detail > 1`; keadaan unduhan (`idle`, `menyiapkan`, `selesai`, `gagal`, dengan jenisnya) dan tanda pembatalan; `replay()` yang juga menaikkan `round`; pengumuman; pramuat akhir saat adegan 6 dimulai; pintasan `Spasi`/`Enter` di `ending` dan `recap`; pembatalan `keydown` berulang di ketiga fase dan sesudah "Main lagi" (dengan pendengar `keyup` di `window`); `data-akhir` pada `<main>` di fase `ending`; layar akhir sementara dihapus |
| `ui/controls.ts` | `NEXT_PHASES` ditambah `ending` dan `recap`; `SOUND_PHASES` ditambah `ending`, `recap`, dan `reflection`; `replayActions(teams)` menggantikan `restartActions` |
| `ui/DayArc.tsx` | Properti `ending` (bawaan `false`): tulisan "Akhir hari" dan label "Pukul {jam}, akhir hari" |
| `ui/Teams.tsx` | Properti `topIds` (bawaan kosong): `data-terbanyak`, baris tanda, dan kalimat dengan "bintang terbanyak". `activeIndex` −1 berarti tidak ada tim yang bergiliran |
| `ui/turn.ts` | `teamSentence(name, active, stars, top = false)` |
| `ui/preload.ts` | `preloadEnding()`: ketiga ilustrasi akhir dan strip timbangan, dengan aturan yang sama (setiap URL sekali per halaman, kegagalan diabaikan). Dipanggil saat adegan 6 dimulai |
| `content/copy.ts` | Teks baru di bagian `closing` dan `topBar`/`teams`; teks layar akhir sementara dihapus |
| `styles/game.css` | Kelas di bawah; aturan `.ss-play-end` dihapus |
| `engine/types.ts`, `engine/reducer.ts` | Usulan 5c (bagian "Mesin") |
| `package.json`, `pnpm-lock.yaml` | Dependensi aplikasi `"modern-screenshot": "4.7.0"` (versi tepat, seperti dependensi game lain) |

### Kelas CSS

Kelas baru berawalan `ss-`:

- layar akhir: `ss-scale` (dengan `data-bingkai` dan `data-gerak`), `ss-ending`, `ss-ending-title`, `ss-ending-message`, dan `ss-team-top`; atribut `data-akhir` pada `.ss-play` dan `data-terbanyak` pada `.ss-team`;
- rekap: `ss-recap` (dengan `data-halaman`), `ss-recap-head` (dengan `data-time`), `ss-recap-title`, `ss-recap-page`, `ss-recap-body`, `ss-recap-cols`, `ss-recap-label`, `ss-recap-list`, `ss-recap-row` (dengan `data-adegan`), `ss-recap-row-head`, `ss-recap-scene`, `ss-recap-clock`, `ss-recap-team`, `ss-recap-icon`, `ss-recap-grid`, `ss-recap-cell`, `ss-recap-choice`, `ss-recap-key`, `ss-recap-tier` (dengan `data-tier`), `ss-recap-quiz`, `ss-recap-same`, `ss-recap-refs`, dan `ss-recap-foot`;
- refleksi: `ss-reflection`, `ss-reflection-head`, `ss-reflection-title`, `ss-reflection-body`, `ss-reflection-lead`, `ss-reflection-prompts`, `ss-reflection-prompt`, `ss-reflection-foot`, `ss-reflection-actions`, `ss-download`, `ss-download-status`, dan `ss-download-buttons`; atribut `data-unduh` (`png` atau `pdf`) pada tombol unduh, dan `data-sibuk` (`png` atau `pdf`) pada `.ss-download` selama lembar disiapkan;
- lembar: `ss-sheet`, `ss-sheet-head`, `ss-sheet-title`, `ss-sheet-date`, `ss-sheet-summary`, `ss-sheet-ending`, `ss-sheet-meter`, `ss-sheet-meter-name`, `ss-sheet-teams`, `ss-sheet-team`, `ss-sheet-top`, `ss-sheet-reflection`, dan `ss-sheet-foot`.

Kotak nomor memakai `ss-choice-key` F-05, batang indikator lembar memakai `ss-meter-bar` dan `ss-meter-seg` F-06, ikon bintang memakai `ss-team-star` F-07, dan tombol memakai `ss-next` serta `ss-button`. Keyframes baru: `ss-scale-seimbang`, `ss-scale-sedikit-kiri`, `ss-scale-sedikit-kanan`, `ss-scale-miring-kiri`, dan `ss-scale-miring-kanan`. Tidak ada token `:root` baru.

### Perubahan dokumen (Build)

- `Design_System.md` naik ke versi 0.9:
  - bagian 3: layar akhir memakai tata letak layar permainan dengan papan tim di panel kanan; rekap dan refleksi menutupi seluruh layar;
  - bagian 7: baris "Layar akhir" dan "Rekap" diperinci, ditambah baris "Refleksi" dan "Lembar unduhan"; baris "Papan tim" ditambah tanda "Bintang terbanyak" di layar akhir;
  - bagian 8: "Momen utama" diperinci (jeda 300 ms, 200 ms per bingkai, urutan gerak), ditambah masa tunggu 600 ms di layar penutup dan perilaku kurangi gerak.
- `Architecture.md` naik ke versi 0.11:
  - bagian 1: keputusan A12, `modern-screenshot` 4.7.0 untuk gambar rekap, dengan PDF dari kode sendiri (disetujui 27 Okt 2026, F-09);
  - bagian 3: `Ending.tsx`, `Recap.tsx`, dan `Reflection.tsx` (F-09), ditambah `closing.ts`, `RecapSheet.tsx`, `download.ts`, `pdf.ts`, dan `akhir-rekap-refleksi.spec.ts`;
  - bagian 4: dependensi aplikasi baru `modern-screenshot`;
  - bagian 5 dan 6: `HistoryEntry.quizAnswer` dan `JAWAB_KUIS` yang juga mencatat jawaban di `history`;
  - bagian 7: uraian "Layar akhir sementara" diganti uraian layar penutup dan unduhan rekap;
  - bagian 8: pramuat ilustrasi akhir dan timbangan saat adegan 6;
  - bagian 9: `Spasi`/`Enter` di layar akhir dan rekap, `M` di ketiga layar penutup, dan pembatalan `Enter`/`Spasi` yang ditahan di ketiga layar penutup dan sesudah "Main lagi";
  - bagian 10: fokus dan pengumuman layar penutup, wilayah pengumuman yang tetap, dan kabar unduhan;
  - bagian 12: cakupan uji F-09;
  - bagian 13: unduhan hanya membaca berkas situs sendiri, dan lembar tidak memuat data siswa.
- `PRD.md`:
  - bagian 13: versi 1.0 juga memuat FR-20 (keputusan pemilik proyek 27 Okt 2026);
  - bagian 17: tiga catatan keputusan 27 Okt 2026, yaitu FR-20 dikerjakan sejak versi 1.0 sebagai unduhan PNG dan PDF A4 (menjawab bagian 16 nomor 4), pilihan yang paling menjaga keseimbangan di rekap adalah pilihan bertingkat "Tepat", dan papan tim di layar akhir menandai "Bintang terbanyak" tanpa peringkat.
- `PLAN.md`: status F-09, tautan laporan uji, dan "Catatan untuk Plan berikutnya":
  - catatan "Plan F-09" dan bagian layar akhir di catatan "Plan F-06 sampai F-10" ditandai selesai;
  - Plan F-10: "Main lagi" sementara memanggil `startActions`, dan F-10 membuatnya berhenti di layar judul;
  - Plan F-11: lembar unduhan memuat rujukan apa adanya, sama dengan rekap;
  - Plan F-13: jingle akhir hari, arti `Esc`, dan klik ganda tombol bintang adegan 6.
- `AGENTS.md`, `Daftar_Aset.md`, `Verifikasi_Rujukan.md`, dan `CREDITS.md` tidak berubah.

### Perbedaan dengan daftar file di rencana

- Baru `content/endings.ts` untuk judul, kalimat, dan teks alternatif ketiga akhir, karena Architecture bagian 3 sudah menyediakannya; teks lain tetap di `copy.ts`.
- `ui/Teams.tsx` dan `ui/turn.ts` ikut berubah, karena usulan 6b dipilih. Rencana menulis `Teams.tsx` tidak disentuh, sebelum usulan 6 diputuskan.
- `ui/Recap.tsx` juga mengekspor `RecapItem`, yang dipakai `RecapSheet.tsx`.
- Berkas tambahan Gerbang 1 (`RecapSheet.tsx`, `download.ts`, `pdf.ts`, ujinya, `package.json`, dan `pnpm-lock.yaml`) sesuai catatan tambahan di entri rencana.

Berkas lain sama dengan rencana.

## Aset

Tidak ada aset baru, dan tidak ada PNG yang berubah. F-09 memakai aset yang sudah Disetujui (21 Oktober 2026) lewat manifest:

- `endings.setara`, `endings.hampir`, dan `endings.berat` (`end/end_{jenis}.png`, 320×180, C-02 sampai C-04);
- `iconStrips.timbangan` (`ui/ui_timbangan.png`, 5 × 48×32, D-10). F-09 adalah fitur pertama yang menampilkannya;
- `emoteIcons.hati`, `keringat`, dan `seru` (D-09) untuk tanda tingkat dan "Sama dengan pilihan kelas.";
- `teamIcons` (D-07) dan `iconStrips.star` (D-03) untuk papan dan kotak adegan;
- `icons.hak` dan `icons.kewajiban` lewat panel indikator F-06.

`manifest.ts`, `CREDITS.md`, `Daftar_Aset.md`, dan kit gambar tidak berubah. Placeholder tidak diperlukan.

## Di luar cakupan

- Layar judul, pengaturan kelas, dan prolog; "Main lagi" yang berhenti di layar judul (F-10).
- Tautan dari galeri, pemeriksaan ketat rujukan, dan tanda "perlu verifikasi" di rekap atau lembar (F-11).
- Jingle akhir hari, bunyi lain FR-19, arti `Esc`, layar penuh, pengaturan kurangi gerak di layar, ulangi adegan, dan perbaikan klik ganda tombol bintang (F-13).
- Kembali dari rekap ke layar akhir, atau dari refleksi ke rekap; pindah halaman rekap dengan panah.
- Peringkat tim, papan tim di rekap dan refleksi, dan jumlah total bintang di kotak adegan.
- Cetak lewat dialog peramban (`window.print`), pustaka PDF, dan pengaturan DPI di berkas PNG.
- Menyimpan rekap di peramban atau di server; data siswa.
- Mengubah naskah, rujukan, `Verifikasi_Rujukan.md`, `content.test.ts`, aset, kit gambar, `manifest.ts`, `CREDITS.md`, `Meters.tsx`, `ImpactCard.tsx`, `RoleQuiz.tsx`, `Timer.tsx`, `StarsAward.tsx`, `NarrationBox.tsx`, `ChoicePanel.tsx`, `Stage.tsx`, `Sprite.tsx`, `StagePreview.tsx`, `Game.tsx`, `layout.ts`, file galeri, `vite.pages.config.ts`, `playwright.config.ts`, dan workflow.

## Kriteria penerimaan

- [ ] AC-1 **Urutan layar.** Dengan keyboard saja di 1280×720: bintang adegan 6 langsung membuka layar akhir (fase `ending`) tanpa sapuan dan tanpa pudar; "Lihat rekap" membuka rekap halaman 1; "Berikutnya" tiga kali sampai halaman 4; "Lanjut ke refleksi" membuka refleksi; "Main lagi" membuka narasi adegan 1. `.ss-play-end`, "Keenam adegan selesai", "Layar akhir, rekap, dan refleksi sedang dibuat.", dan "Main lagi dari adegan 1" tidak ada lagi di halaman maupun di `app/`.
- [ ] AC-2 **Isi layar akhir** untuk jalur semua B, B-B-B-C-C-C, semua A, semua C, A-A-B-B-B-B, dan A-A-B-B-A-B:
  - latar panggung `end_{id}` sesuai `endingFor`, tanpa tokoh, bayangan, dan ikon emosi;
  - judul dan pesan persis sesuai tabel; tidak ada kata "kalah", "gagal", atau "salah" di halaman;
  - `aria-valuenow` kedua indikator sama dengan `state.meters` jalur itu, tanpa angka melayang;
  - `data-bingkai` dan `background-position-x` timbangan sesuai tabel arah (bingkai 2, 3, 4, 4, 1, dan 0);
  - bilah atas malam, tulisan "Akhir hari", label "Pukul 20.00, akhir hari", dan lima titik terisi;
  - label panggung adalah teks alternatif ditambah kalimat timbangan.
- [ ] AC-3 **Letak layar akhir** di keempat ukuran untuk ketiga akhir: judul satu baris, Press Start 2P 4,4u; pesan Pixelify Sans 3,6u dengan lebar ≤ 150u, dua baris (tiga untuk Hari yang Berat); tidak ada luapan; timbangan dengan ukuran dan letak sesuai tabel (±1 px); "Lihat rekap" dalam ±0,5u dari tabel.
- [ ] AC-4 **Papan tim di layar akhir:**
  - tanpa ▶, `data-giliran`, dan "Giliran"; jumlah bintang sama dengan jumlah bintang setiap tim di `history`;
  - tanda "Bintang terbanyak" sesuai A-2 untuk kasus satu tim tertinggi, seri, semua 0, empat tim dengan dua tim seri, serta semua tim seri dengan 3 dan 4 tim; di keempat ukuran, setiap tanda berada di dalam isi panel kanan dan bawah papan ≤ 60u, termasuk empat tim seri di 1024×768;
  - kalimat pembaca layar setiap tim sesuai bagian "Teks yang tampil";
  - tanpa kurangi gerak, bintang adegan 6 yang lebih dari 0 memutar pop sekali pada tim penerima (Web Animations API); 0 bintang tidak memutar pop;
  - wilayah `role="status"` berisi pengumuman bintang adegan 6.
- [ ] AC-5 **Gerak timbangan:**
  - tanpa kurangi gerak, `.ss-scale` punya tepat satu animasi CSS bernama `ss-scale-{data-gerak}` dengan jeda 300 ms, lama 200 ms × panjang urutan, sekali, `step-end`, dan `fill: both`; offset keyframes sesuai bagian "Timbangan: gerak";
  - untuk kelima gerak (jalur semua B, B-B-B-C-C-C, A-A-B-B-B-B, semua C, dan A-A-B-B-A-B), animasi dijeda lewat Web Animations API lalu `currentTime` disetel ke 0, 299, 400, 600, 800, dan 1.000 ms serta sesudah selesai; bingkai yang tampil (dari `background-position-x`) sama persis dengan tabel bingkai per waktu, dan sesudah selesai tetap di bingkai akhir;
  - `M` dan perubahan ukuran jendela tidak memulai ulang animasi;
  - dengan `prefers-reduced-motion: reduce`, timbangan langsung di bingkai akhir dan `document.getAnimations()` kosong di layar akhir.
- [ ] AC-6 **Isi rekap** untuk jalur semua B, B-B-B-C-C-C, semua A, dan semua C, dengan 2 tim (bintang 2, 1, 0, 2, 1, 2), 3 tim, dan 4 tim:
  - empat halaman dengan kepala berwarna `rgb(255, 217, 168)`, `rgb(110, 198, 242)`, `rgb(255, 194, 122)`, dan `rgb(74, 79, 156)`, keterangan "Pagi · halaman 1 dari 4" dan seterusnya, serta judul kolom;
  - setiap kotak: nomor, judul, "Pukul {jam}", tim dan bintang dari `history`, huruf dan teks pilihan kelas (dengan varian adegan 6 bila B di adegan 4), tanda tingkat dengan ikon dan warna, pilihan B dan teksnya atau "Sama dengan pilihan kelas." dengan ikon hati, serta rujukan yang sama persis dan berurutan dengan kartu dampak pilihan itu;
  - baris kuis di adegan 5 untuk keempat jawaban kuis, dan tidak ada baris kuis di adegan lain.
- [ ] AC-7 **Letak rekap** di keempat ukuran, termasuk kasus terburuk: sisa di bawah kotak terakhir ≥ 4u; tidak ada luapan ke samping; keterangan tim tidak menabrak jam; ukuran huruf sesuai tabel (±0,05u); tombol kaki dalam ±0,5u dari tabel.
- [ ] AC-8 **Navigasi rekap:** "Berikutnya" dan pintasan maju satu halaman; "Sebelumnya" tidak ada di halaman 1 dan mundur satu halaman tanpa masa tunggu, dengan klik, `Enter`, maupun `Spasi`; klik ganda (`dblclick`) "Sebelumnya" di halaman 3 dan di halaman 4 hanya mundur satu halaman dengan satu bunyi klik; halaman 4 menampilkan "Lanjut ke refleksi"; perubahan ukuran jendela mempertahankan halaman.
- [ ] AC-9 **Refleksi:** kepala malam bertuliskan "Refleksi", kalimat pembuka, dan tiga kalimat pemantik persis; letak dan ukuran sesuai tabel di keempat ukuran tanpa luapan, juga dengan kabar terpanjang; `Spasi` dan `Enter` saat fokus di judul tidak berpengaruh; `M` bekerja.
- [ ] AC-10 **Masa tunggu**, dengan jam uji dijeda sebelum halaman dimuat dan dimajukan dua langkah sesudah unsur tampil:
  - di layar akhir, setiap halaman rekap, dan refleksi, pada 599 ms tombol maju ber-`aria-disabled="true"` dan klik, `Spasi`, serta `Enter` padanya (dan sebagai pintasan) tidak berpengaruh dan tidak berbunyi; sesudah 1 ms lagi satu tekanan diterima. Untuk tautan "Kembali ke galeri", tekanan yang diterima adalah klik atau `Enter`; `Spasi` pada tautan itu tidak menghasilkan `click` dan tidak memindah halaman, sebelum maupun sesudah masa tunggu;
  - "Sebelumnya" bekerja langsung;
  - klik ganda dan dua `Enter` cepat pada "Lihat rekap", "Berikutnya", dan "Lanjut ke refleksi" hanya maju satu langkah;
  - klik ganda "Lanjut ke refleksi" tidak memulai unduhan: baris kabar tetap kosong, dan `.ss-download` tidak ber-`data-sibuk`;
  - pada "Kembali ke galeri", `click` yang dikirim pada 599 ms ber-`defaultPrevented` benar, dan pada 600 ms salah.
- [ ] AC-11 **Fokus dan Tab:** judul yang terlihat berfokus saat layar akhir, setiap halaman rekap, dan refleksi tampil; garis fokusnya sesuai bagian "Fokus" bila dibuka dengan keyboard; urutan Tab sesuai bagian "Fokus"; tombol yang berfokus lewat Tab berlatar `sun` dengan kursor ▶; perubahan ukuran jendela tidak memindahkan fokus.
- [ ] AC-12 **Pembaca layar:**
  - wilayah `aria-live` berisi teks persis sesuai fungsi pengumuman untuk layar akhir, keempat halaman, dan refleksi, pada jalur semua B dan B-B-B-C-C-C;
  - wilayah `aria-live` dan `role="status"` adalah elemen yang sama sejak adegan 1 sampai refleksi (ditandai atribut uji di adegan 1, lalu diperiksa di refleksi);
  - `<main>` bernama "Akhir hari", "Rekap pilihan kelas", atau "Refleksi"; daftar rekap bernama "Rekap pilihan kelas" dengan awalan tersembunyi "Adegan {n}: ", "Pilihan kelas {X}: ", "Pilihan yang paling menjaga keseimbangan…", dan "Rujukan: " (cuplikan ARIA); daftar kalimat pemantik bernama "Kalimat pemantik";
  - kotak nomor, kotak huruf, ikon, timbangan, dan tanda "Bintang terbanyak" tersembunyi dari pembaca layar;
  - di setiap halaman rekap dan di refleksi, jumlah `.ss-topbar`, `.ss-meters`, `.ss-stage-area`, `.ss-play-panel`, `.ss-side`, dan `.ss-teams` di halaman adalah 0;
  - nama tombol unduh "Unduh gambar rekap (PNG)" dan "Unduh PDF rekap (A4)".
- [ ] AC-13 **Keyboard:**
  - `Spasi` dan `Enter` sesuai tabel di ketiga fase; `M` di ketiga fase; `0`, `1`, `4`, `a`, `p`, `t`, `s`, `ArrowRight`, dan `Escape` tidak berpengaruh dan tidak berbunyi; tekanan bersama Ctrl, Alt, atau Meta dan tekanan berulang sebagai pintasan diabaikan;
  - tombol yang ditahan, dengan `keyboard.down("Enter")` yang diulang (Playwright mengirim `repeat: true` mulai `keydown` kedua) lalu `keyboard.up("Enter")`: di rekap halaman 1 dengan jam dijeda, `Enter` ditekan pada "Berikutnya" yang berfokus pada 599 ms dan diulang sesudah 600 ms tidak memindah halaman, sedangkan tekanan baru sesudah dilepas memindah satu halaman; di refleksi, `Enter` yang ditahan pada "Unduh gambar" menghasilkan tepat satu unduhan dan satu bunyi klik, juga bila pengulangan dikirim sesudah unduhan itu selesai; `Enter` yang ditahan pada "Main lagi" memulai satu permainan, dan pengulangannya tidak mengubah layar narasi adegan 1 (dengan kurangi gerak, teks layar pertama tetap), sedangkan `Enter` baru sesudah dilepas membuka layar narasi kedua.
- [ ] AC-14 **Bunyi**, dengan perekam bunyi F-07: setiap tekanan yang diterima di ketiga layar menghasilkan tepat satu klik; tekanan yang diabaikan (masa tunggu, unduhan yang sedang disiapkan, tombol yang tidak berlaku) dan "Kembali ke galeri" menghasilkan 0 klik.
- [ ] AC-15 **"Main lagi":**
  - dari refleksi sesudah 600 ms, narasi adegan 1 tampil dengan tombol lanjutnya berfokus, papan tim 0 bintang dengan tim sebanyak alamat (`#main`, `#main-3`, dan `#main-4`), dan kuis adegan 5 kembali belum dijawab;
  - suara yang dimatikan tetap mati;
  - dua permainan berturut-turut dengan jalur berbeda: di permainan kedua, kartu dampak, kuis, dan bintang alasan bekerja di keenam adegan seperti permainan pertama (pengaman sekali per adegan berkunci `round` yang baru), wilayah `role="status"` kosong saat narasi adegan 1 tampil, dan rekap permainan kedua hanya berisi pilihan permainan kedua.
- [ ] AC-16 **"Kembali ke galeri"** adalah tautan `href="../"` bertuliskan "Kembali ke galeri", tanpa bunyi.
- [ ] AC-17 **Unduh gambar**, tanpa jam uji yang dijeda:
  - satu peristiwa unduhan bernama `rekap-sehari-setara-{tanggal}.png`;
  - berkas berawalan tanda tangan PNG, 1.240 × 1.754 px; titik (10, 10) berwarna `cream`, dan titik (45, 30), di jarak dalam kepala lembar, berwarna malam `#4A4F9C`;
  - kabar "Menyiapkan gambar rekap…" lalu "Gambar rekap siap. Periksa folder unduhan." di baris kabar dan wilayah `role="status"`; selama disiapkan, kedua tombol unduh ber-`aria-disabled="true"` dan `.ss-download` ber-`data-sibuk="png"`, lalu keduanya aktif lagi. Keadaan sementara ini diperiksa dari catatan perekam `MutationObserver` (bagian "Rencana uji"), bukan dengan menunggu keadaannya tampil;
  - klik ganda hanya menghasilkan satu unduhan dan satu klik bunyi;
  - selama unduhan, permintaan hanya ke `127.0.0.1` (berkas huruf dan ikon) dan tidak ada galat konsol.
- [ ] AC-18 **Unduh PDF:** satu peristiwa unduhan bernama `rekap-sehari-setara-{tanggal}.pdf`; berkas berawalan `%PDF-1.4` dan berakhir `%%EOF`; tepat satu `/Type /Page`, `/MediaBox [0 0 595.28 841.89]`, gambar `/Width 1240 /Height 1754` dengan `/FlateDecode`; setiap posisi di tabel `xref` menunjuk awal objeknya. Di tahap Test, berkas yang sama juga diperiksa `qpdf --check` dan `pdfinfo` di luar repositori.
- [ ] AC-19 **Galat dan pembatalan unduhan:**
  - tanpa `CompressionStream`, "Unduh PDF" menghasilkan kabar "Rekap gagal dibuat. Coba lagi.", tanpa berkas dan tanpa galat halaman, sedangkan "Unduh gambar" tetap berhasil;
  - bila `toBlob` menghasilkan `null`, "Unduh gambar" gagal dengan kabar yang sama;
  - "Main lagi" selama penyiapan tidak menghasilkan berkas maupun kabar;
  - sesudah gagal, tombol bisa ditekan lagi.
- [ ] AC-20 **Pramuat dan aset gagal:**
  - ketiga ilustrasi akhir dan strip timbangan diminta saat adegan 6 dimulai, sebelum layar akhir tampil;
  - bila permintaan `end_*.png` atau `ui_timbangan*.png` digagalkan, layar akhir tetap menampilkan teks, indikator, papan, dan tombol, dan permainan bisa dilanjutkan sampai refleksi tanpa galat halaman; galat konsol hanya pesan jaringan untuk berkas yang digagalkan.
- [ ] AC-21 **Kurangi gerak:** dengan `prefers-reduced-motion: reduce`, tidak ada animasi di ketiga layar (`document.getAnimations()` kosong), dan masa tunggu tetap 600 ms.
- [ ] AC-22 **Kontras:** rasio terukur ≥ 4,5:1 untuk semua teks di ketiga layar di keempat ukuran, termasuk kepala keempat waktu, tanda tingkat, "Bintang terbanyak", kabar unduhan, dan tombol dalam keadaan tertahan, siap, berfokus, dan disiapkan.
- [ ] AC-23 **Mode warna paksa:** dengan `forced-colors: active`, `clip-path` kotak adegan, kotak kalimat pemantik, dan tombol bernilai `none`, dan semua tulisan tetap ada.
- [ ] AC-24 **Uji unit:**
  - `closing.test.ts` lulus: `scaleView` untuk ketiga akhir dengan H > K, H < K, dan H = K, dan untuk ke-729 jalur naskah; `scaleSentence`; urutan gerak; `bestChoice` adalah B di keenam adegan, dan setiap adegan punya tepat satu pilihan `tepat`; `recapRows` untuk keempat jalur, termasuk varian adegan 6, tim, bintang, dan jawaban kuis; untuk ke-729 jalur, teks pilihan kelas dan pilihan terbaik dengan bendera akhir sama dengan teks yang memakai `flagsFromHistory` entri sebelum adegan itu; `recapPages`; `quizLine` untuk keempat jawaban, dengan label peran dari `ROLES` dan peran tepat dari `roleQuiz.answer`; `topTeamIds` untuk kasus A-2; ketiga pengumuman sesuai susunan di bagian "Teks yang tampil", dan kedua contoh persis sama; `ENDINGS` berjudul sesuai PRD bagian 9 dan tanpa kata "kalah", "gagal", dan "salah";
  - `pdf.test.ts` lulus: struktur PDF dari gambar kecil, posisi `xref`, ukuran halaman, `pdfPlacement`, dan isi gambar yang diurai ulang dengan `node:zlib` sama dengan masukan;
  - `download.test.ts` lulus: `downloadFileName` (termasuk bulan dan tanggal satu angka), `sheetDate`, dan `withTimeout` dengan pewaktu palsu;
  - `controls.test.ts` disesuaikan: `Spasi`/`Enter` di `ending` dan `recap` tetapi tidak di `reflection`; `M` di ketiga fase; `replayActions` dari fase `reflection` membawa ke `intro` adegan 1 dengan `history` kosong, tim yang sama, dan pengaturan tetap; uji kuis F-08 kini mengharapkan `quizAnswer` di entri `history` adegan 5;
  - `reducer.test.ts`: jawaban kuis di entri `history` adegan 5, jawaban kedua ditolak, `MAIN_LAGI` mengosongkannya, dan indikator tetap;
  - uji unit lain lulus tanpa perubahan, termasuk F-02 AC-14 untuk seluruh `engine/`.
- [ ] AC-25 **Uji lama:** ke-80 uji ujung ke ujung lama lulus. Uji yang memakai layar akhir sementara (27 uji menurut percobaan Plan) memakai langkah penutup bersama di `e2e/bantuan.ts`.
- [ ] AC-26 **Build:** `build:pages` lulus; JS permainan ≤ 150 KB gzip tanpa penanda `__THREE__`; semua `src` dan `href` HTML permainan relatif; `index.html`, `main-*.css`, `main-*.js`, dan `jsx-runtime-*.js` identik byte dengan build sebelum F-09.
- [ ] AC-27 **Pemeriksaan kode:** `tsc --noEmit` tanpa galat; ESLint `--max-warnings 0` pada semua berkas kode baru dan yang diubah; tidak ada `any`; `engine/` hanya berubah untuk usulan 5c dan tetap tanpa pengatur waktu; sesudah meninggalkan `#main` saat layar akhir, rekap, refleksi, dan masa tunggu, tidak ada `setTimeout` maupun `setInterval` yang masih aktif, dan pendengar `keydown`, `keyup`, `pointerdown`, serta `pointerup` di `window` kembali 0; sesudah meninggalkan `#main` saat lembar disiapkan, lembar dilepas dari `document.body`, pewaktu batas waktu unduhan dibersihkan, dan tidak ada berkas yang diunduh.
- [ ] AC-28 **Dependensi:** `package.json` memuat `"modern-screenshot": "4.7.0"` di `dependencies`; `pnpm-lock.yaml` hanya bertambah paket itu; tidak ada dependensi lain yang berubah; `install --frozen-lockfile` lulus.
- [ ] AC-29 **Dokumen dan cakupan:** perubahan dokumen sesuai bagian "Perubahan dokumen"; `git diff --name-status` hanya memuat berkas yang disebut spesifikasi ini dan tangkapan layar bukti di `tests/F-09/`; `scenes.ts`, `roles.ts`, `references.ts`, `content.test.ts`, dan `Verifikasi_Rujukan.md` tidak berubah, sehingga tidak ada kotak yang dicentang; `content:check` dan `test` lulus.

## Rencana uji

| Langkah | Cara | Kriteria |
|---|---|---|
| 1 | `install --frozen-lockfile`, `content:check`, lalu `test` | AC-24, AC-28, AC-29 |
| 2 | `build:pages`; bandingkan berkas galeri dengan build sebelum F-09, juga sesudah semua dokumen F-09 ditulis; periksa ukuran gzip, penanda three.js, dan path relatif | AC-26 |
| 3 | `test:e2e`: ke-80 uji lama yang disesuaikan, ditambah `e2e/akhir-rekap-refleksi.spec.ts` | AC-1 sampai AC-23, AC-25 |
| 4 | Masa tunggu: jam uji dijeda dengan `page.clock.pauseAt` sebelum halaman dimuat, lalu dimajukan hanya dengan `page.clock.runFor`, dalam dua langkah sesudah unsur tampil: layar atau halaman tampil, lalu 599 dan 1 ms | AC-10 |
| 5 | Gerak timbangan dan pop bintang: `getAnimations()`, `pause()`, dan `currentTime` (Web Animations API), seperti uji sapuan F-05 dan pop F-07 | AC-4, AC-5 |
| 6 | Bunyi: perekam bunyi skrip awal halaman uji F-07 (`e2e/suara.spec.ts`) | AC-14 |
| 7 | Unduhan: `page.waitForEvent("download")`, `suggestedFilename()`, lalu baca berkas; PNG diperiksa tanda tangan, ukuran, dan warna titik; PDF diperiksa sebagai teks dan bita. Keadaan sementara selama penyiapan dibaca dari perekam `MutationObserver`. Uji unduhan tidak memasang jam uji, karena jam palsu juga menghentikan pewaktu `modern-screenshot`. Galat dibuat dengan `delete window.CompressionStream` dan `HTMLCanvasElement.prototype.toBlob` tiruan lewat `page.evaluate` | AC-13, AC-17 sampai AC-19 |
| 8 | Pembaca layar: isi wilayah `aria-live` dan `role="status"`, nama lewat `toHaveAccessibleName`, cuplikan ARIA daftar | AC-12 |
| 9 | Salin tangkapan layar ke `docs/sehari-setara/tests/F-09/` (daftar di bawah), juga PNG dan halaman PDF hasil unduhan yang diubah ke PNG di luar repositori | Bukti AC-2 sampai AC-9, AC-17, AC-18 |
| 10 | `tsc --noEmit -p tsconfig.json --incremental false`, lalu ESLint; cari `ss-play-end`, `restartActions`, `endTitle`, dan "Main lagi dari adegan 1" di `app/` dan `e2e/` | AC-1, AC-27 |
| 11 | `git diff --name-status` terhadap keadaan sebelum F-09, dan periksa diff dokumen | AC-29 |
| 12 | Daftar periksa manual AGENTS bagian 9 | Tidak ada AC khusus |

Lingkungan uji: Chromium 141 untuk `@playwright/test` 1.56.1 tidak tersedia di lingkungan agen. Uji dijalankan dengan Chromium 153 lewat berkas konfigurasi pengganti di luar repositori, yang mengimpor `playwright.config.ts` dan hanya menambah jalur browser (keputusan Gerbang 1 F-07 nomor 10). Bila satu perintah terlalu lama, uji dijalankan dalam beberapa bagian dengan konfigurasi yang sama, dan tangkapan layar disalin sesudah bagian yang membuatnya.

Cara uji yang perlu diperhatikan:

- Klik pada tombol ber-`aria-disabled` memakai `click({ force: true })`, karena Playwright menunggu tombol seperti itu aktif (uji F-06 dan F-08).
- Keadaan sementara unduhan (`data-sibuk`, `aria-disabled` kedua tombol unduh, dan kabar "Menyiapkan…") bisa hanya berlangsung puluhan milidetik. Sebelum klik, uji memasang perekam `MutationObserver` lewat `page.evaluate` pada `.ss-download` (atribut, isi teks, dan subpohon) dan pada wilayah `role="status"`, yang mencatat keadaan sesudah setiap perubahan. Sesudah unduhan selesai, urutan catatan diperiksa: `data-sibuk`, kedua `aria-disabled="true"`, dan kabar "Menyiapkan…" muncul, lalu hilang ketika kabar "… siap. Periksa folder unduhan." tampil. Uji tidak menunggu keadaan sementara itu dengan `expect` biasa, yang bisa terlewat.
- Tombol yang ditahan diuji dengan `keyboard.down("Enter")` berulang: Playwright mengirim `keydown` kedua dan seterusnya dengan `repeat: true`, dan Chromium mengubah setiap pengulangan itu menjadi klik tombol berfokus, seperti saat tombol ditahan sungguhan [Coba]. Sesudahnya `keyboard.up("Enter")`.
- Klik ganda memakai `dblclick()`, yang mengirim dua klik dengan `detail` 1 dan 2 [Coba].
- "Kembali ke galeri" tidak dibiarkan berpindah halaman, agar uji tidak memuat galeri 3D. Uji memasang pendengar `click` di `window` (fase gelembung, sesudah pendengar React) yang mencatat `defaultPrevented` lalu memanggil `preventDefault()`, kemudian mengklik tautan itu.
- Uji yang mengukur atau memotret menunggu gambar latar `.ss-stage-bg`, `.ss-scale`, `.ss-recap-icon`, dan ikon papan termuat dan ter-*decode*, dengan cara fungsi `waitImages` uji F-06 sampai F-08.
- Tanggal di nama berkas dibandingkan dengan tanggal yang dihitung dari `new Date()` di halaman pada saat yang sama.

Penyesuaian uji lama: `e2e/bantuan.ts` mendapat pemilih ketiga layar dan dua fungsi bersama:

- `finishDay(page, paused)`: dari layar akhir, menunggu judul berfokus, menunggu masa tunggu (waktu sebenarnya, atau `page.clock.runFor(600)` sesudah layar tampil bila jam dijeda), lalu `Enter`; empat kali hal yang sama di rekap; berhenti di refleksi dengan judul berfokus;
- `playAgain(page, paused)`: di refleksi, menunggu masa tunggu, `Tab` ke "Main lagi", lalu `Enter`, dan menunggu tombol lanjut narasi berfokus.

Berkas lama yang disesuaikan (hasil percobaan Plan): `alur-permainan.spec.ts` (6 uji), `kartu-dampak.spec.ts` (13), `tim-waktu-bintang.spec.ts` (5), `suara.spec.ts` (2), dan `kuis-peran.spec.ts` (1). Pemeriksaan `.ss-play-end` diganti pemeriksaan layar akhir (`.ss-play[data-akhir]` dan judulnya berfokus). Pemeriksaan "`.ss-side` tidak ada di akhir" diganti pemeriksaan papan tim layar akhir. Uji "tiga jalur sampai akhir … layar akhir sementara, dan main lagi" menjadi "… layar akhir, rekap, refleksi, dan main lagi". `e2e/sehari-setara.spec.ts` dan uji lain tidak berubah.

Tangkapan layar di `tests/F-09/`:

| Berkas | Isi |
|---|---|
| `akhir_setara_1280x720.png`, `akhir_hampir_1280x720.png`, `akhir_berat_1280x720.png` | Layar akhir ketiga akhir, timbangan diam |
| `akhir_hampir_1024x768.png`, `akhir_berat_1920x1080.png` | Layar akhir di ukuran lain |
| `akhir_4tim_1024x768.png` | Empat tim dengan dua tanda "Bintang terbanyak" |
| `akhir_4tim_seri_1024x768.png` | Empat tim seri dengan empat tanda (papan terpanjang) |
| `akhir_timbangan_gerak_1280x720.png` | Timbangan di tengah gerak (bingkai berbeda dari bingkai akhir) |
| `akhir_kurangi_gerak_1280x720.png` | Layar akhir dengan kurangi gerak |
| `rekap_hal1_1280x720.png` sampai `rekap_hal4_1280x720.png` | Keempat halaman rekap, jalur B-B-B-C-C-C |
| `rekap_hal3_1024x768.png`, `rekap_hal2_1920x1080.png` | Halaman rekap di ukuran lain, jalur terburuk |
| `refleksi_1280x720.png`, `refleksi_1024x768.png`, `refleksi_1920x1080.png` | Layar refleksi |
| `refleksi_fokus_main_lagi_1280x720.png` | Fokus pada "Main lagi" |
| `refleksi_unduh_siap_1280x720.png` | Kabar sesudah unduhan gambar |
| `unduhan_rekap.png`, `unduhan_rekap_pdf.png` | PNG hasil unduhan dan halaman PDF yang diubah ke PNG |

Daftar periksa manual AGENTS bagian 9:

- Bisa dimainkan sampai akhir hanya dengan keyboard: dibuktikan uji AC-1 dan AC-15.
- Mode kurangi gerak mematikan animasi: dibuktikan uji AC-5 dan AC-21.
- Tampilan rapi di 1024×768 dan 1920×1080: diperiksa dari tangkapan layar.
- Keterbacaan rekap dan kalimat pemantik dari bangku belakang, hasil cetak lembar unduhan, unduhan di Edge, Firefox, dan Safari iPad, serta kelancaran di laptop kelas bawah: dicatat "belum diuji", untuk dicek pemilik proyek.

Hasil uji ditulis di `docs/sehari-setara/tests/F-09-hasil.md` (templat 11.3).
