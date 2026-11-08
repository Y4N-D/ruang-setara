# JS-06: Peta kampung

| | |
|---|---|
| Status | Spesifikasi ditulis 8 November 2026, menunggu `Spesifikasi disetujui: JS-06` |
| Rencana | `docs/jejak-setara/Daftar_Aset.md`, bagian "JS-06 Peta: rencana" |
| Keputusan Gerbang 1 | Balasan `Setuju: JS-06` (8 Nov 2026): semua saran (a), yaitu usulan 1a sampai 9a (KT-C11 sampai KT-C19) |
| Dikerjakan | Sesi C (aset dan peta) |

## Ringkasan

JS-06 menyusun peta kampung Nara berukuran 160 × 100 ubin sebagai teks, lalu membangunnya menjadi dua berkas yang dipakai permainan:

- `app/jejak-setara/peta/kampung.json`, persis bentuk JS-02 (Architecture 11.1.1), dibaca server dan layar pemain;
- `app/jejak-setara/peta/kampung_gambar.json`, nomor ubin untuk menggambar peta, hanya dibaca layar pemain.

Sumbernya `scripts/jejak-setara/peta/kampung.txt` (tanah, satu karakter per ubin) dan `objek.json` (zona, objek, pagar, titik, kotak, halte, dan lobi). `build_peta.py` membangun kedua berkas, memeriksa semua aturan peta, dan membuat pratinjau. Uji Vitest berawalan `peta-` memeriksa ulang hasilnya di GitHub tanpa Python. Sesudah JS-06 belum ada perubahan yang terlihat di permainan; peta mulai dipakai di JS-03 (lobi dan server) dan JS-07 (penjelajah).

## Kaitan PRD

| Acuan | Yang dipenuhi di JS-06 |
|---|---|
| JFR-09 | Peta tampak atas 160 × 100 ubin (keputusan pemilik proyek 6 Nov 2026) dengan 8 zona |
| JFR-12 | Lembar ubin tiga masa dipakai lewat nomor ubin yang sama; layar pemain cukup menukar lembar |
| JFR-05 | Halaman lobi bertembok di depan sekolah dengan gerbang dan 18 titik muncul |
| JFR-11 | Batas zona dan kode bahan per sel untuk peta mini; halte di peta |
| JFR-15, PRD 8.3 | 12 titik kejadian per zona, sehingga setiap kejadian punya sedikitnya dua titik di zonanya |
| JFR-23, PRD 8.5 | 3 kotak bantuan per zona dengan isi menurut tempatnya |
| JFR-25 (P1) | 4 titik halte untuk Angkot |
| PRD 8.2 | Bangunan, air, batang pohon, dan pagar padat; jembatan bisa dilewati |
| Design System 7 | Aturan peta 1 sampai 7, lapisan, bayangan ke kanan bawah, dan zona |
| Design System 14 | Pratinjau peta penuh per masa, potongan zona ×4 dengan garis pindai, tiruan layar HP dan laptop |
| Architecture 11.1 dan 11.3 | Sumber teks, `build_peta.py`, uji peta, anggaran peta 60 KB gzip |

## Berkas yang dibuat dan diubah

| Berkas | Status | Isi |
|---|---|---|
| `scripts/jejak-setara/peta/kampung.txt` | Baru | 100 baris × 160 karakter (P-1 sampai P-4) |
| `scripts/jejak-setara/peta/objek.json` | Baru | Sumber objek dan titik (P-5 sampai P-14) |
| `scripts/jejak-setara/peta/build_peta.py` | Baru | Bangun, periksa, dan pratinjau (P-15 sampai P-31) |
| `app/jejak-setara/peta/kampung.json` | Baru, hasil bangun | Bentuk JS-02 (P-15 sampai P-19) |
| `app/jejak-setara/peta/kampung_gambar.json` | Baru, hasil bangun | Lapisan gambar (P-20 sampai P-24) |
| `app/jejak-setara/__tests__/konten/peta-berkas.test.ts` | Baru | Uji bentuk dan isi kedua berkas |
| `app/jejak-setara/__tests__/konten/peta-aturan.test.ts` | Baru | Uji aturan peta |
| `docs/jejak-setara/preview/peta_*.png` | Baru, dan `peta_denah.png` diperbarui | Pratinjau (P-30) |
| `docs/jejak-setara/specs/JS-06-peta.md` | Baru | Spesifikasi ini |
| `docs/jejak-setara/tests/JS-06-hasil.md` | Baru (Test) | Laporan uji |
| `docs/jejak-setara/Daftar_Aset.md` | Diubah | Status, riwayat, dan permintaan |

Tidak disentuh: `app/jejak-setara/inti/`, `app/jejak-setara/assets/` (tidak ada aset baru), `scripts/game/art/` (kit dipakai tanpa diubah), `package.json`, `pnpm-lock.yaml`, alur kerja, dokumen utama, serta kode dan aset Sehari Setara. Skrip `peta:build` dan `content:check:jejak` sudah ada sejak JS-01 dan langsung berjalan begitu berkasnya ada.

## Perilaku

### Sumber: `kampung.txt`

- **P-1. Bentuk.** Diberikan `kampung.txt`, ketika `build_peta.py` membacanya, maka berkas harus berisi tepat 100 baris dengan masing-masing tepat 160 karakter dari legenda P-2. Baris pertama adalah y = 0 (utara) dan karakter pertama adalah x = 0 (barat). Akhir baris LF atau CRLF diterima (CR dibuang), dan baris kosong di akhir berkas diabaikan. Selain itu bangun gagal dengan galat yang menyebut nomor baris dan kolom.
- **P-2. Legenda.** Setiap karakter menentukan bahan lapisan 0 dan ubin tumpang lapisan 10:

  | Karakter | Bahan (lapisan 0) | Ubin tumpang (lapisan 10) |
  |---|---|---|
  | `.` | rumput | detail acak berbenih (P-24) |
  | `*` `+` `^` `d` | rumput | bunga merah muda, bunga putih, rumput tinggi, daun gugur |
  | `g` | rumput | garis lapangan (lapangan taman) |
  | `t` | tanah setapak | detail acak berbenih (P-24) |
  | `k` `o` | tanah setapak | kerikil, genangan |
  | `p` | paving gang | tidak ada |
  | `s` | semen | tidak ada |
  | `c` | semen | garis lapangan (lapangan sekolah) |
  | `a` | aspal | detail acak berbenih (P-24) |
  | `-` `\|` | aspal | garis tengah mendatar, garis tengah tegak |
  | `z` | aspal | zebra cross untuk jalan mendatar (`zebra_datar`) |
  | `Z` | aspal | zebra cross untuk jalan tegak (`zebra_tegak`) |
  | `b` | pasir | detail acak berbenih (P-24) |
  | `B` | pasir | batu kecil |
  | `w` | air (padat) | tidak ada |
  | `W` | air dalam (padat) | tidak ada |

- **P-3. Bahan bertetangga.** Sel tanah setapak dan pasir hanya boleh bersebelahan (8 tetangga) dengan bahan yang sama, rumput, air, atau air dalam, karena pita tepinya memakai warna rumput. Pelanggaran adalah galat.
- **P-4. Lapangan.** Setiap wilayah `g` atau `c` yang bersambung (4 tetangga) harus persegi panjang penuh, lebarnya ganjil dan paling kecil 5, dan tingginya paling kecil 3. Garis lapangan dihitung seperti pratinjau kelompok U: sisi, sudut, garis tengah tegak di kolom tengah, dan pertemuan garis tengah dengan sisi.

### Sumber: `objek.json`

- **P-5. Bentuk.** `objek.json` adalah satu objek JSON dengan kunci tepat: `versi` (1), `benih` (bilangan bulat, nilai awal 2026), `zona`, `lobi`, `gerbangLobi`, `titikMuncul`, `objek`, `pagar`, `sebar`, `titikKejadian`, `kotak`, `halte`, dan `penanda`. Kunci lain, nilai yang salah jenis, dan koordinat di luar peta adalah galat.
- **P-6. Zona.** Delapan zona dengan nama PRD bagian 9, menutup seluruh peta tanpa tumpang tindih. Batas awalnya dari denah yang disetujui (usulan 2a):

  | Id | Nama | Kiri | Atas | Kanan | Bawah |
  |---|---|---|---|---|---|
  | z1 | Rumah dan gang | 0 | 30 | 52 | 62 |
  | z2 | Sekolah | 53 | 30 | 106 | 62 |
  | z3 | Jalan dan halte | 53 | 63 | 106 | 99 |
  | z4 | Pasar | 107 | 30 | 159 | 62 |
  | z5 | Balai warga | 0 | 63 | 52 | 99 |
  | z6 | Taman, sungai, dan pantai | 0 | 0 | 99 | 29 |
  | z7 | Puskesmas dan kantor desa | 100 | 0 | 159 | 29 |
  | z8 | Pojok gawai | 107 | 63 | 159 | 99 |

  Bila penataan di Build memerlukan batas lain, perubahannya ditunjukkan di titik tinjau `Setuju: peta` (P-31).
- **P-7. Objek.** Setiap entri `objek` berisi `jenis`, `x`, `y` (pojok kiri atas, dalam ubin), dan `id` opsional. `jenis` adalah nama objek di `atas_objek.OBJEK` (berkas `obj_{jenis}.png`) atau satu kelompok varian:

  | Kelompok | Pilihan | Ukuran sama |
  |---|---|---|
  | `pohon_acak` | `pohon`, `pohon_b`, `pohon_c` | 3 × 3, batang di tengah bawah |
  | `semak_acak` | `semak`, `semak_b` | 1 × 1 |
  | `tenda_acak` | `tenda_a`, `tenda_b` | 3 × 3 |
  | `rumah_kecil_acak` | `rumah_b`, `rumah_d` | 3 × 3 |

  Pilihan varian ditentukan berbenih dari posisinya: indeks = ⌊`acakBerbenih(benih("varian", benihPeta, x, y))()` × jumlah pilihan⌋, sehingga varian tetap sama selama posisinya tidak berubah. `benih` dan `acakBerbenih` di `build_peta.py` sama persis dengan `inti/acak.ts` dan diperiksa sendiri dengan angka uji `acak.test.ts` setiap kali skrip berjalan.
- **P-8. Jejak kaki objek.** Jejak kaki adalah kotak ukuran ubin objek itu. Jejak kaki harus di dalam peta dan tidak boleh tumpang tindih dengan jejak kaki objek lain, termasuk ruas pagar dan hasil sebar. `id` tertulis harus memenuhi pola `^[a-z0-9-]{1,32}$` dan unik; objek tanpa `id` diberi `o-{x}-{y}`. Objek bernama wajib: `gerbang-lobi` berjenis `gerbang_buka`.
- **P-9. Air dan jembatan.** Ubin padat objek, selain jembatan, tidak boleh berada di air atau air dalam. Setiap jembatan menutup sedikitnya satu ubin air, dan semua ubin jembatan bisa dilewati walaupun di atas air.
- **P-10. Benda kejadian.** Benda kecil properti kejadian (kotak bekal, dompet, bola, tali lompat, sisa piknik, pengeras suara, dan kursi roda kosong) tidak ditaruh di peta. Benda itu digambar bersama tokoh kejadian di titik kejadian (JS-08). Properti yang juga wajar sebagai pemandangan (lapak, bangku pasar, pos keamanan, meja panitia, bangku antrean, dan tiang kamera) boleh ditaruh.
- **P-11. Pagar.** Setiap entri `pagar` berisi `gaya` (`bambu` atau `sekolah`) dan `titik`, yaitu garis berpatah dengan sedikitnya dua titik dan setiap ruasnya mendatar atau tegak. Garis dipecah menjadi ruas 1 × 1. Jenis ruas dihitung dari ruas pagar segaya yang bersebelahan (4 tetangga) dan harus salah satu dari delapan ruas yang sudah disetujui: datar, tegak, empat sudut, ujung kiri, dan ujung kanan. Karena itu pagar tidak boleh bercabang atau bersilang, dan garis tegak tidak boleh berakhir tanpa sudut. Pelanggaran adalah galat.
- **P-12. Sebar.** Setiap entri `sebar` berisi daftar `jenis`, kotak wilayah (`kiri`, `atas`, `kanan`, `bawah`), dan `jumlah`. Objek ditaruh satu per satu dengan pembangkit `acakBerbenih(benih("sebar", benihPeta, nomorEntri))`: jenis dipilih dari daftar, lalu posisi dipilih di dalam wilayah. Satu posisi diterima bila semua ubin jejak kakinya rumput tanpa objek, ubin padatnya berjarak sedikitnya 2 ubin dari ubin padat lain, dan jejak kakinya tidak menyentuh ruang 3 × 3 titik kejadian, kotak, atau halte, maupun halaman lobi. Percobaan berhenti sesudah `jumlah` objek atau 80 × `jumlah` kali coba; kekurangan dicatat sebagai peringatan.
- **P-13. Titik.** `titikKejadian` (id `t-z{n}-{nn}`), `kotak` (id `k-z{n}-{n}`, dengan `jenis`), dan `halte` (id `h-{n}`) ditulis tangan (usulan 3a), masing-masing dengan `zona`, `x`, dan `y`. Penataan setiap zona mengikuti temanya, agar setiap titik cocok untuk semua kejadian zona itu:

  | Zona | Tempat titik kejadian |
  |---|---|
  | Z1 | Halaman depan rumah, gang paving, dekat pagar bambu rumah Nara dan warung Pak Made |
  | Z2 | Sekitar gedung SMP di luar halaman lobi: lapangan sekolah, kantin, sisi dan belakang gedung |
  | Z3 | Trotoar dan rumput di tepi jalan, dekat zebra cross, halte, dan terminal angkot |
  | Z4 | Lorong di antara tenda dan los, parkir, dekat pos keamanan |
  | Z5 | Sekitar bale, pos ronda, dan pelataran tanah |
  | Z6 | Tepi sungai, lapangan taman di tepi sungai, dan pantai |
  | Z7 | Halaman puskesmas dan kantor desa |
  | Z8 | Sekitar warung berwifi dan bangkunya |

- **P-14. Lobi dan penanda.** `lobi` adalah kotak halaman lobi termasuk temboknya (awal: 65, 43, 94, 61; bagian dalam 28 × 17 ubin). `gerbangLobi` adalah bukaan gerbang (awal: 79, 61, 80, 61). `titikMuncul` berisi 18 titik di halaman lobi (awal: x 69, 73, 77, 82, 86, 90 pada y 50, 54, 58). `penanda` berisi daftar objek khas per zona (usulan 5a):

  | Zona | Objek penanda |
  |---|---|
  | Z1 | `rumah_nara`, `warung_made`, `rumah_a`, `rumah_b`, `rumah_c`, `rumah_d`, ruas `pagar_bambu_*` |
  | Z2 | `sekolah`, `kantin`, `tiang_bendera`, `gerbang_buka`, ruas `pagar_sekolah_*` |
  | Z3 | `halte`, `angkot`, `rambu_seberang`, `rambu_halte` |
  | Z4 | `tenda_a`, `tenda_b`, `los`, `gerobak`, `lapak`, `pos_keamanan` |
  | Z5 | `bale`, `pos_ronda` |
  | Z6 | `kelapa`, `jembatan_datar`, `jembatan_tegak` |
  | Z7 | `puskesmas`, `kantor_desa`, `bangku_antrean` |
  | Z8 | `warung_wifi` |

### Hasil: `kampung.json`

- **P-15. Bentuk.** Diberikan sumber yang sah, ketika `peta:build` dijalankan, maka `kampung.json` berbentuk `PetaJejak<string>` persis Architecture 11.1.1 dan lolos `bacaPeta` tanpa perubahan kode JS-02: `versi` 1, `lebar` 160, `tinggi` 100, `ukuranUbin` 16.
- **P-16. Lapisan.** `ubin` berisi kode bahan per sel: 0 rumput, 1 tanah setapak, 2 paving, 3 semen, 4 pasir, 5 aspal, 6 air, 7 air dalam. `tabrakan` bernilai 1 untuk air dan air dalam yang tidak ditutup jembatan, dan untuk ubin padat objek menurut `atas_objek.OBJEK`; selain itu 0.
- **P-17. Daftar.** `objek` berisi `id`, `jenis` (nama sprite, varian sudah dipilih), `x`, dan `y`, urut menurut y lalu x. `zona` urut z1 sampai z8. `titikKejadian`, `kotak`, dan `halte` urut menurut id. Gerbang lobi tercatat terbuka (`gerbang_buka`), dan sel `gerbangLobi` bernilai 0 di `tabrakan`.
- **P-18. Teks berkas.** JSON UTF-8 dengan akhir baris LF. Setiap unsur larik objek berada di satu baris, sehingga perubahan peta mudah dibaca di GitHub Desktop.
- **P-19. Determinisme.** Diberikan sumber yang sama, ketika `peta:build` dijalankan dua kali, maka kedua berkas hasil sama persis sampai ke byte.

### Hasil: `kampung_gambar.json`

- **P-20. Bentuk.** Satu objek JSON dengan kunci tepat:

  ```json
  {
    "versi": 1,
    "lebar": 160,
    "tinggi": 100,
    "kolom": 16,
    "jumlahUbin": 377,
    "sumber": "64 karakter heksadesimal",
    "daftar": [null, 0, 1, 2],
    "tanah": "1x12;5x3;",
    "tumpang": "0x40;7x1;",
    "bayangan": "0x80;"
  }
  ```

- **P-21. Daftar dan lapisan.** `daftar[0]` bernilai `null` (kosong); unsur lain adalah nomor ubin di lembar (0 sampai 376), unik, urut naik, dan panjang `daftar` paling banyak 256, sehingga lapisan bisa diurai `uraiRle` JS-02. Setiap lapisan berisi nomor urut dalam `daftar` untuk 160 × 100 sel, dalam RLE Architecture 11.1.1:
  - `tanah` tidak pernah 0, dan nomor ubinnya selalu ubin lapisan 0 (0 sampai 3, 40 sampai 46, atau 48 sampai 376), dihitung `atas_ubin.nomor_tanah`;
  - `tumpang` bernilai 0 atau ubin detail, marka, dan garis lapangan (4 sampai 11 atau 22 sampai 39);
  - `bayangan` bernilai 0 atau ubin bayangan (12 sampai 21).
- **P-22. Bayangan.** Bayangan dihitung dari daftar objek dengan aturan pratinjau kelompok U dan O: bangunan memakai bayangan bangunan di kanan dan bawah tapaknya, pohon memakai bayangan pohon 2 × 2 di bawah tajuk, dan objek kecil memakai bayangan kecil di ubin batangnya. Bayangan tidak digambar di air. Bila dua bayangan jatuh di sel yang sama, bayangan objek yang lebih dulu di `objek` yang dipakai.
- **P-23. Sidik sumber.** `sumber` adalah SHA-256 (heksadesimal huruf kecil) atas gabungan lima berkas dengan urutan tetap: `scripts/jejak-setara/peta/kampung.txt`, `scripts/jejak-setara/peta/objek.json`, `scripts/jejak-setara/peta/build_peta.py`, `scripts/game/art/atas_ubin.py`, dan `scripts/game/art/atas_objek.py`. Setiap berkas disumbang sebagai jalurnya, satu LF, isinya dengan CRLF diganti LF, lalu satu LF. Dengan begitu uji di GitHub gagal bila sumber diubah tanpa `peta:build`.
- **P-24. Detail acak.** Untuk sel `.`, `t`, `a`, dan `b` yang tidak tertutup jejak kaki objek: v = `benih("detail", benihPeta, x, y)`. Bila v mod 1000 kurang dari peluang bahannya, ubin tumpang = pilihan ke-((v div 1000) mod jumlah pilihan):

  | Bahan | Peluang per 1000 sel | Pilihan |
  |---|---|---|
  | Rumput | 50 | bunga merah muda, bunga putih, rumput tinggi, daun gugur |
  | Tanah setapak | 60 | kerikil, genangan |
  | Aspal | 20 | retakan |
  | Pasir | 30 | batu kecil |

### Cara layar pemain menggambar (untuk JS-07)

- Per sel: `tanah`, lalu `tumpang`, lalu `bayangan`, dari lembar `ubin_{masa}.png` yang aktif. Ubin nomor n berada di kolom n mod 16 dan baris n div 16 lembar. Saat masa berganti, hanya lembarnya yang ditukar.
- Objek mengikuti lapisan Design System 7: bagian bawah (`obj_{jenis}.png`) di lapisan 20, tokoh di lapisan 30, dan bagian atas (`obj_{jenis}_atas.png`) di lapisan 40, diurutkan menurut tepi bawah jejak kaki. Bagian atas digambar di piksel (16x − 1, 16y − 1), dan bagian bawah di (16x − 1, 16y − 1 + tinggi bagian atas); objek tanpa bagian atas digambar di (16x − 1, 16y − 1).
- Selama status lobi, sel `gerbangLobi` padat dan gerbang digambar `obj_gerbang_tutup` (Permintaan C-10).

### Pemeriksaan

- **P-25. Galat.** Diberikan sumber yang melanggar salah satu aturan berikut, ketika `peta:build` dijalankan, maka berkas hasil tidak ditulis, setiap pelanggaran dicetak dengan koordinatnya di bawah judul `MASALAH:`, dan skrip selesai dengan kode 1:
  1. bentuk sumber (P-1, P-5, P-7, P-8, P-11) dan aturan P-3, P-4, P-9, P-10;
  2. zona tidak menutup seluruh peta atau saling tumpang tindih;
  3. sel di tepi peta (baris dan kolom terluar) tidak padat;
  4. titik kejadian, kotak, atau halte tidak terjangkau dari titik muncul lewat sel bebas (4 tetangga) dengan gerbang terbuka;
  5. dengan sel `gerbangLobi` padat, pemain dari titik muncul bisa keluar dari kotak `lobi` atau mencapai titik, kotak, atau halte; titik muncul tidak 18, tidak di sel bebas di dalam halaman lobi, atau ganda; sel `gerbangLobi` padat, atau tidak berada di baris bawah objek `gerbang-lobi`;
  6. titik kejadian: kurang dari 12 per zona; berada di luar kotak zonanya atau di dalam kotak `lobi`; ruang 3 × 3 di sekitarnya memuat sel padat, jejak kaki objek, aspal, air, atau air dalam; berjarak kurang dari 6 ubin dari titik lain; atau kurang dari 7 ubin dari tengah gerbang lobi;
  7. kotak: tidak tepat 3 per zona; jenisnya tidak sesuai zona (sepatu di Z3, Z4, dan Z6; kompas di Z1 dan Z5; buku di Z2, Z7, dan Z8); selnya padat, aspal, air, air dalam, atau tertutup jejak kaki objek; berada di luar zonanya atau di dalam kotak `lobi`; berjarak kurang dari 3 ubin dari titik kejadian; atau kurang dari 6 ubin dari kotak lain;
  8. halte: tidak tepat 4 (dua di Z3, satu di Z7, satu di Z8); selnya padat; berada di luar zonanya; atau berjarak lebih dari 2 ubin dari jejak kaki objek `halte`;
  9. lebar jalan: ada sel terjangkau yang tidak termasuk satu pun blok 2 × 2 sel bebas (Design System 7, aturan 1);
  10. keterlihatan penanda: ada sel terjangkau yang, bila pemain berdiri di tengah sel itu dan kamera 320 × 180 berpusat padanya lalu dijepit ke tepi peta, tidak melihat satu ubin pun dari jejak kaki objek penanda zona mana pun (P-14). Sasaran 100% sel terjangkau;
  11. `daftar` lebih dari 256 nomor, atau jumlah ukuran gzip kedua berkas lebih dari 60 KB (61.440 byte, gzip tingkat 9).
- **P-26. Peringatan.** Hal berikut dicetak di bawah judul `PERINGATAN:` dan ditandai di peta pemeriksaan, tanpa menggagalkan bangun: kantong sel bebas yang tidak terjangkau (misalnya di bawah atap rumah yang berpagar); lorong buntu selebar 2 ubin yang lebih panjang dari 6 ubin tanpa titik kejadian, kotak, atau halte (Design System 7, aturan 1); dan sebar yang tidak mencapai `jumlah`. Lorong buntu dihitung dari rantai blok 2 × 2 yang tersisa sesudah blok bertetangga satu dipangkas berulang.
- **P-27. Uji Vitest.** Diberikan kedua berkas hasil, ketika `content:check:jejak` atau `test:jejak` dijalankan (juga di alur kerja "Jejak: uji"), maka uji `peta-*.test.ts` memeriksa ulang P-15 sampai P-23 dan galat 2 sampai 11 dari P-25 dengan kode TypeScript sendiri. Jejak kaki objek dihitung dari ukuran PNG yang sudah disetujui (lebar = 16 × lebar ubin + 2; tinggi bagian bawah ditambah bagian atas = 16 × tinggi ubin + 2). Daftar penanda dan kotak `lobi` dibaca dari `objek.json`.

### Perintah dan keluaran `build_peta.py`

- **P-28. Perintah.** `npx pnpm@11.25.0 peta:build` menjalankan `python scripts/jejak-setara/peta/build_peta.py`. Pilihan tambahan: `--periksa` (bangun di memori, bandingkan dengan berkas di repositori, tanpa menulis apa pun; kode 1 bila berbeda atau ada galat), `--tanpa-pratinjau`, dan `--keluar <folder>` (menulis hasil ke folder lain untuk percobaan). Skrip memakai Python 3 dan Pillow, sama dengan kit gambar, tanpa jaringan.
- **P-29. Keluaran.** Bila semua pemeriksaan lulus, skrip mencetak ringkasan lalu kalimat penutup, dengan angka dari peta sebenarnya, misalnya:

  ```text
  Peta 160 × 100 ubin: 96 titik kejadian, 24 kotak, 4 halte, 812 objek.
  kampung.json 66,8 KB (8,3 KB gzip) · kampung_gambar.json 55,6 KB (4,7 KB gzip) · jumlah gzip 13,0 KB dari 60 KB
  Keterlihatan penanda: 100,0% posisi.
  Dari gerbang lobi ke titik kejadian terjauh: 22,9 detik berjalan.
  Semua pemeriksaan peta lulus.
  ```

  Bila ada galat, judul `MASALAH:` diikuti satu baris per pelanggaran, misalnya `- titik t-z3-04 (60, 70): ruang 3 × 3 terhalang objek o-61-70`, dan skrip selesai dengan kode 1.
- **P-30. Pratinjau.** Disimpan di `docs/jejak-setara/preview/`:

  | Berkas | Isi |
  |---|---|
  | `peta_pagi.png`, `peta_siang.png`, `peta_sore.png` | Peta penuh ×1 (2.560 × 1.600) per masa, dengan delapan avatar contoh di halaman lobi |
  | `peta_zona_1.png` sampai `peta_zona_8.png` | Satu layar 320 × 180 di sekitar bangunan penanda setiap zona, ×4 dengan garis pindai (1.280 × 720), siang |
  | `peta_periksa.png` | Peta penuh ×1 yang dipucatkan, dengan batas zona, titik kejadian bernomor beserta ruang 3 × 3, kotak, halte, halaman lobi, gerbang, titik muncul, kisi koordinat setiap 10 ubin, dan tanda untuk setiap masalah dan peringatan |
  | `peta_hp.png` | 1.920 × 1.080, yaitu pandangan 320 × 180 ×6 (HP 731 × 411 px CSS berasio piksel 2,625), di depan gerbang, dengan tiruan HUD dari ikon yang sudah disetujui |
  | `peta_laptop.png` | 960 × 540 (×3), tempat yang sama |
  | `peta_denah.png` | Denah Plan, dibuat ulang dari peta akhir |

- **P-31. Titik tinjau (usulan 9a).** Diberikan peta yang sudah lulus semua pemeriksaan `build_peta.py`, ketika draf selesai, maka `peta_siang.png`, `peta_pagi.png`, `peta_sore.png`, kedelapan potongan zona, dan `peta_periksa.png` dikirim di balasan tanpa ZIP. Uji Vitest, pratinjau akhir, dan laporan baru dikerjakan sesudah pemilik proyek membalas `Setuju: peta`. Perbaikan bisa ditulis bebas, misalnya "titik t-z6-03 pindah ke tepi sungai" atau "pasar lebih rapat".

## Beberapa pemain sekaligus

- Peta sama untuk semua ruang dan semua pemain. Server memilih titik untuk setiap kejadian dari 12 titik zonanya dengan benih ruang (JS-02, P-20), sehingga satu ruang sama untuk semua pemainnya dan antarruang berbeda.
- 96 titik cukup untuk sekitar 48 kejadian dengan dua titik masing-masing (keputusan 6 Nov 2026), di bawah kapasitas 302 titik yang diukur di Plan.
- Halaman lobi berukuran dalam 28 × 17 ubin dengan 18 titik muncul. Pemain saling tembus, jadi 50 pemain (atau 100 bila Permintaan C-8 disetujui) boleh berbagi titik muncul; pembagiannya diatur JS-03.
- Kotak bantuan terpisah per pemain (JS-02, P-18); peta hanya menyediakan letaknya.

## Status antarmuka

Tidak ada antarmuka baru. Halaman `/` dan `/admin/` JS-01 tidak berubah. Status layar seperti memuat, galat, terputus, dan dijeda berlaku di JS-03 dan JS-07, yang memakai peta ini.

## Teks yang tampil (final)

- Nama zona di `kampung.json` sama dengan PRD bagian 9 dan bisa tampil di peta mini atau dialog: "Rumah dan gang", "Sekolah", "Jalan dan halte", "Pasar", "Balai warga", "Taman, sungai, dan pantai", "Puskesmas dan kantor desa", dan "Pojok gawai".
- Tidak ada tulisan di dalam gambar peta (Design System 3.2).
- Keluaran `build_peta.py` untuk pemilik proyek dan agen ada di P-29; kalimat penutupnya "Semua pemeriksaan peta lulus.", dan judul daftarnya `MASALAH:` serta `PERINGATAN:`.

## Data, protokol, API, dan migrasi

- `kampung.json` memakai bentuk JS-02 tanpa perubahan. `kampung_gambar.json` adalah berkas baru (P-20 sampai P-24), dicatat di Architecture lewat Permintaan C-9.
- Server (mulai JS-03) cukup memuat `kampung.json`: tabrakan, titik kejadian, kotak, halte, gerbang lobi, dan titik muncul. Layar pemain (JS-07) memuat kedua berkas.
- Protokol tidak berubah. Peta 160 × 100 (2.560 × 1.600 piksel) berada di bawah batas `koordinatUbinMaks` 511 dan `koordinatPxMaks` 8.192 di `protokol.ts`; `PROTOKOL_VERSI` tetap 1.
- Tidak ada rute API dan tidak ada migrasi D1.

## Aset

- Tidak ada aset baru. Yang dipakai: `ubin_pagi.png`, `ubin_siang.png`, dan `ubin_sore.png` (kelompok U), serta objek kelompok O1, O2, O3 (hanya yang boleh menurut P-10), dan O4, semuanya Disetujui 6 November 2026.
- Uji memeriksa bahwa setiap `jenis` di `kampung.json` punya `obj_{jenis}.png` di `app/jejak-setara/assets/obj/` dan tercatat di `CREDITS.md`.
- Bila Build ternyata memerlukan aset baru (misalnya dermaga atau perahu), pekerjaan berhenti dan aset itu diajukan sebagai kelompok baru dengan pratinjau, sebelum dipakai.
- `manifest.ts` tetap menunggu Permintaan C-6 dan bukan bagian JS-06.

## Keamanan dan privasi

- Peta tidak memuat data pribadi apa pun.
- Kedua berkas peta ikut terkirim ke layar pemain, jadi 96 titik calon bisa dibaca siapa saja. Kejadian mana yang ada di titik mana tetap dipilih server per ruang dan baru dikirim saat titiknya tampak di layar (Architecture 8.3), sama dengan rancangan JS-02.
- `build_peta.py` hanya membaca dan menulis berkas di repositori, tanpa jaringan.

## Di luar cakupan

- Menggambar peta di peramban, kamera, peta mini, dan penukaran lembar per masa saat bermain (JS-07).
- Membuka dan menutup gerbang menurut status ruang, serta membagi titik muncul (JS-03 dan JS-07, Permintaan C-10).
- Tokoh dan properti kejadian di titik kejadian (JS-08); menyembunyikan kotak yang skillnya dimatikan (JS-09).
- Kotak teropong dan karcis, serta perjalanan Angkot antarhalte (P1, JS-18).
- Perubahan `app/jejak-setara/inti/`, `package.json`, dan alur kerja, termasuk memasang Python di GitHub Actions.
- Perubahan PRD, Design System, dan Architecture (Permintaan C-7, C-9, dan C-11 untuk Sesi A).
- `manifest.ts` (C-6), aset baru, dan suara.

## DRAF untuk ditinjau pemilik proyek

- **D-1. Legenda `kampung.txt`.** (a, saran) Legenda P-2: detail rumput, tanah, aspal, dan pasir disebar otomatis berbenih, dengan beberapa karakter untuk memaksa detail tertentu. (b) Semua detail ditulis tangan: lebih terkendali, tetapi sekitar 600 karakter tambahan harus disusun. (c) Tanpa detail: peta lebih tenang, tetapi rumput yang luas tampak berulang.
- **D-2. Daftar penanda (P-14).** (a, saran) Tabel P-14 dipakai untuk pemeriksaan keterlihatan 100%, dan tabel yang sama diajukan ke Design System lewat Permintaan C-11. (b) Rumah warga tidak dihitung, karena rumah juga ada di luar Z1: lebih ketat, dan Z5 serta Z8 memerlukan lebih banyak bale dan warung berwifi. (c) Tambahkan tiang lampu dan pohon kelapa di semua zona: sasaran 100% lebih mudah, tetapi kurang membantu mengenali zona.
- **D-3. Jarak dan ruang.** (a, saran) Titik kejadian sedikitnya 7 ubin dari tengah gerbang, agar pemain yang keluar bersamaan tidak langsung berdiri di atas penanda; kotak sedikitnya 3 ubin dari titik kejadian dan 6 ubin dari kotak lain; halte paling jauh 2 ubin dari bangunan halte. (b) Tanpa batas jarak dari gerbang: titik terdekat bisa berada tepat di depan gerbang.
- **D-4. Peringatan, bukan galat.** (a, saran) Kantong tertutup, lorong buntu, dan sebar yang kurang hanya peringatan (P-26), karena tidak merusak permainan dan tetap terlihat di peta pemeriksaan. (b) Ketiganya galat: lebih ketat, tetapi rumah berpagar seperti rumah Nara harus diberi celah di belakangnya.
- **D-5. Pratinjau (P-30).** (a, saran) Seluruh daftar P-30, sekitar 1,5 MB di folder pratinjau (tidak ikut terkirim ke pemain). (b) Peta penuh pagi dan sore diganti potongan zona pagi dan sore: sekitar 0,9 MB, tetapi pergantian masa hanya terlihat sepotong.
- **D-6. Pemeriksaan di GitHub tanpa Python.** (a, saran) Uji TypeScript memeriksa ulang aturan dan sidik sumber (P-23, P-27). (b) Minta Sesi A memasang Python dan Pillow di alur kerja "Jejak: uji" lalu menjalankan `peta:build --periksa`: satu tempat aturan, tetapi alur kerja lebih lama dan berkasnya milik Sesi A. (c) Tanpa sidik sumber: perubahan sumber yang lupa dibangun ulang tidak tertangkap.
- **D-7. Isi titik tinjau (P-31).** (a, saran) Tiga peta penuh, delapan potongan zona, dan peta pemeriksaan sebagai gambar di balasan, tanpa ZIP. (b) Sekaligus ZIP berisi draf untuk di-commit: perubahan tersimpan lebih awal, tetapi peta yang belum disetujui masuk ke `main`.

## Kriteria penerimaan

- [ ] AC-1 **Sumber.** `kampung.txt` 100 × 160 dengan karakter legenda saja; `objek.json` sah menurut P-5 sampai P-14; P-3, P-4, P-9, P-10, dan P-11 terpenuhi.
- [ ] AC-2 **`kampung.json`.** Lolos `bacaPeta` resmi; 160 × 100; delapan zona dengan nama PRD menutup seluruh peta tanpa tumpang tindih; `ubin` hanya 0 sampai 7; gerbang tercatat terbuka (P-15 sampai P-18).
- [ ] AC-3 **`kampung_gambar.json`.** Kunci tepat; `daftar` paling banyak 256 nomor dengan `daftar[0]` = `null`; ketiga lapisan terurai `uraiRle` dan nomornya di rentang P-21; `sumber` sama dengan SHA-256 kelima berkas sumber (P-20 sampai P-23).
- [ ] AC-4 **Determinisme.** Dua kali `peta:build` menghasilkan berkas yang sama persis; `peta:build --periksa` lulus.
- [ ] AC-5 **Keterjangkauan dan lobi.** Galat 3, 4, dan 5 dari P-25 tidak terjadi: tepi peta padat, semua titik, kotak, dan halte terjangkau, dan dengan gerbang tertutup pemain hanya bergerak di halaman lobi.
- [ ] AC-6 **Titik kejadian.** 12 titik atau lebih di setiap zona dengan semua syarat galat 6.
- [ ] AC-7 **Kotak dan halte.** 24 kotak dan 4 halte dengan semua syarat galat 7 dan 8.
- [ ] AC-8 **Lebar jalan.** Setiap sel terjangkau termasuk sedikitnya satu blok 2 × 2 sel bebas.
- [ ] AC-9 **Penanda.** 100% sel terjangkau melihat sedikitnya satu objek penanda.
- [ ] AC-10 **Objek.** Setiap `jenis` punya sprite Disetujui dan tercatat di `CREDITS.md`; jejak kaki di dalam peta dan tidak tumpang tindih; tidak ada benda kejadian P-10; tidak ada ubin padat di air kecuali jembatan yang bisa dilewati.
- [ ] AC-11 **Ukuran.** Jumlah gzip kedua berkas paling banyak 60 KB, dicatat di laporan.
- [ ] AC-12 **Pratinjau.** Semua berkas P-30 dibuat; titik tinjau dilewati dengan balasan `Setuju: peta`.
- [ ] AC-13 **Uji.** `content:check:jejak` menjalankan kedua berkas `peta-*.test.ts` dan lulus; `test:jejak` lulus (294 uji yang ada ditambah uji baru). Sedikitnya delapan salinan peta yang sengaja dirusak (misalnya jembatan dihapus, titik dipindah ke lobi, pohon di ruang 3 × 3, lorong dipersempit, penanda dihapus, sumber diubah tanpa dibangun ulang) ditolak uji.
- [ ] AC-14 **Lainnya tidak berubah.** `build:jejak` dan `test:e2e:jejak` lulus; `build:pages` lulus dan ke-178 berkas `dist-pages/` identik byte dengan `main`; perubahan hanya di berkas bagian "Berkas yang dibuat dan diubah".
- [ ] AC-15 **Dokumen.** `Daftar_Aset.md` diperbarui (status, riwayat, dan tautan laporan); laporan `tests/JS-06-hasil.md` ditulis.

## Rencana uji

### Pemeriksaan di `build_peta.py`

Semua aturan P-1 sampai P-14 dan P-25, ditambah pemeriksaan sendiri `benih` dan `acakBerbenih` dengan angka uji `acak.test.ts` (misalnya `benih("a", "b")` = 851547125). Setiap masalah ditandai di `peta_periksa.png`.

### Uji Vitest (`app/jejak-setara/__tests__/konten/`)

- `peta-berkas.test.ts`: `bacaPeta` dan ukuran; zona, nama, dan cakupan; kode bahan; objek, sprite, kredit, jejak kaki, dan benda kejadian; bentuk `kampung_gambar.json`, rentang lapisan, dan `uraiRle`; sidik sumber; ukuran gzip (AC-2, AC-3, AC-10, AC-11).
- `peta-aturan.test.ts`: tepi padat; keterjangkauan; lobi tertutup dan titik muncul; titik kejadian; kotak; halte; lebar jalan; keterlihatan penanda; bahan bertetangga (AC-5 sampai AC-9).

### Perintah di tahap Test

`install --frozen-lockfile`; `peta:build` dua kali dan perbandingan byte; `peta:build --periksa`; `content:check:jejak`; `test:jejak`; uji salinan rusak (AC-13); `build:jejak`; `test:e2e:jejak` dengan `JEJAK_CHROMIUM`; `build:pages` dan perbandingan SHA-256 ke-178 berkas; `tsc --noEmit -p tsconfig.json`; ESLint pada kedua berkas uji; `git status` dan `git diff --name-status`. `test:jejak:server` dan `sim:beban` masih "Belum tersedia" (JS-03), jadi tidak wajib. Tangkapan layar diganti pratinjau P-30, karena belum ada layar permainan.

### Daftar periksa manual (AGENTS bagian 9)

Belum ada butir yang berlaku, karena peta baru bisa dimainkan sesudah JS-07. Penilaian visual dilakukan pemilik proyek di titik tinjau (P-31).
