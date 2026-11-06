# STATUS — Sesi B (Naskah kejadian Jejak Setara)

| | |
|---|---|
| Tahap saat ini | Naskah Giliran 7 (Z6: K-11 dan K-12), menunggu balasan "Setuju: naskah Z6"; versi situasi K-02 menunggu pilihan (KT-10), paling lambat sebelum JS-05 |
| Pekerjaan | Naskah final 16 kejadian dan daftar rujukannya (bagian naskah dari JS-05) |
| Tanggal | 5 November 2026 |
| Acuan | ZIP repositori 5 November 2026 (JS-01 selesai) |
| Berkas yang boleh diubah sesi ini | Hanya folder `docs/jejak-setara/naskah/` |

## Riwayat

| Tanggal | Tahap | Kejadian |
|---|---|---|
| 5 Nov 2026 | Plan | Usulan Plan pertama ditulis, menunggu persetujuan "Setuju: naskah" |
| 5 Nov 2026 | Plan | Usulan diperiksa ulang terhadap ZIP repositori terbaru dan diperbaiki (lihat "Perubahan dari usulan pertama"); tetap menunggu "Setuju: naskah" |
| 5 Nov 2026 | Plan | Pemilik proyek membalas "Setuju: naskah": semua saran diterima (usulan 1a sampai 7a) |
| 5 Nov 2026 | Naskah | Giliran 1: `K-13.md`, `K-14.md`, dan `NASKAH.md` diserahkan untuk dinilai, menunggu "Setuju: naskah Z7" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z7": K-13 dan K-14 disetujui |
| 5 Nov 2026 | Naskah | Giliran 2: `K-01.md` dan `K-02.md` (dua versi situasi untuk KT-10) diserahkan, menunggu "Setuju: naskah Z1" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z1" tanpa menyebut versi K-02: K-01 disetujui; K-02 disetujui, dan kedua versi situasinya tetap disimpan sampai KT-10 diputuskan |
| 5 Nov 2026 | Naskah | Giliran 3: `K-03.md` dan `K-04.md` diserahkan, menunggu "Setuju: naskah Z2" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z2": K-03 dan K-04 disetujui, termasuk tambahan JR-04 di K-04 (Permintaan A-3 aktif) |
| 5 Nov 2026 | Naskah | Giliran 4: `K-05.md` dan `K-06.md` diserahkan, menunggu "Setuju: naskah Z3" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z3": K-05 dan K-06 disetujui, termasuk tambahan JR-05 di K-05 (Permintaan A-4 aktif) |
| 5 Nov 2026 | Naskah | Giliran 5: `K-07.md` dan `K-08.md` diserahkan, menunggu "Setuju: naskah Z4" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z4": K-07 dan K-08 disetujui |
| 5 Nov 2026 | Naskah | Giliran 6: `K-09.md` dan `K-10.md` diserahkan, menunggu "Setuju: naskah Z5" |
| 5 Nov 2026 | Naskah | Pemilik proyek membalas "Setuju: naskah Z5": K-09 dan K-10 disetujui |
| 5 Nov 2026 | Naskah | Giliran 7: `K-11.md` dan `K-12.md` diserahkan, menunggu "Setuju: naskah Z6" |

## Ringkasan rencana (templat AGENTS 12.1)

| | |
|---|---|
| Status | Disetujui 5 Nov 2026 ("Setuju: naskah"); Giliran 1–6 disetujui (versi situasi K-02 menunggu KT-10); Giliran 7 diserahkan |
| Memenuhi | Bagian naskah JS-05: 16 kejadian dan rujukannya (PRD bagian 10), sebagai data untuk JFR-15, JFR-16, dan JFR-45 |
| Bergantung pada | PRD bagian 10 serta Architecture bagian 5.1 dan 5.4. Tidak menunggu JS-02; JS-02 baru diperlukan untuk bagian kode JS-05 |
| Berkas yang dibuat atau diubah | Sekarang: `naskah/STATUS.md`. Sesudah disetujui: `naskah/NASKAH.md` dan `naskah/K-01.md` sampai `naskah/K-16.md` |
| Migrasi D1 | Tidak ada |
| Pesan protokol baru atau berubah | Tidak ada |
| Aset yang dibutuhkan | Tidak ada untuk naskah. Bagian "Tokoh dan wataknya" menjadi masukan bagi Sesi C |
| Dependensi baru | Tidak ada |
| Risiko | Jawaban bisa ditebak dari panjang pilihan (KT-B6); stereotip di kejadian bertema agama, disabilitas, dan suku (KT-B5, peninjauan khusus); 12 rujukan baru belum pernah dicek |
| Ukuran | M (16 kejadian dalam 8 giliran) |

## Hasil percobaan dan pemeriksaan

Percobaan dijalankan dengan skrip kecil di luar repositori.

1. **Contoh K-13 terhadap batas Architecture 5.4.** Ke-21 bagian contoh K-13 di PRD bagian 10 lolos semua batas: judul 17/32 karakter, situasi 167/280 karakter dalam 3 kalimat, pilihan Langkah 1 terpanjang 70/90, pilihan Langkah 2 terpanjang 94/140, dan umpan balik terpanjang 98/160. Petunjuknya tidak menyalin pilihan benar. Format dan batasnya bisa dipakai.
2. **Panjang pilihan menjadi petunjuk jawaban.** Di keenam adegan Sehari Setara, pilihan "tepat" selalu yang terpanjang (77–139 karakter, sedangkan pilihan lain 23–65 karakter). Contoh K-13 sama: pilihan benar Langkah 1 berpanjang 70 karakter, sedangkan ketiga pengecohnya 30–43 karakter; pilihan tepat Langkah 2 berpanjang 94 karakter, sedangkan dua lainnya 33 dan 43. Di Sehari Setara kelas berdiskusi bersama, jadi pola ini tidak banyak berpengaruh. Di Jejak Setara siswa menjawab sendiri dan bersaing, sehingga kebiasaan "pilih yang terpanjang" bisa memberi skor tanpa berpikir (PRD bagian 18). Lihat usulan 6.
3. **Jumlah rujukan.** PRD bagian 10 memuat 23 rujukan berbeda: 11 berpadanan dengan rujukan Sehari Setara yang sudah Anda cek pada 5 November 2026, dan 12 baru. Setiap kejadian memakai 2–4 rujukan (terbanyak K-07, yaitu 4), masih dalam batas 1–4. Pencocokan otomatis ke-16 baris PRD dengan daftar di bawah: semuanya cocok.
4. **Tokoh.** Raka (K-04, juga K-13 di contoh PRD), Wayan (K-14), dan siswa SMP umum (K-03, K-10, K-11, K-12, K-16) belum tercantum di Design System bagian 8 maupun PRD bagian 15. Sesi C perlu mengetahuinya sebelum menggambar (Permintaan A-1).

## Perubahan dari usulan pertama

| Bagian | Usulan pertama | Sekarang | Alasan |
|---|---|---|---|
| Daftar rujukan | 22 rujukan | 23 rujukan: Pasal 31 ayat (2) UUD NRI 1945 (K-14) ditambahkan sebagai JR-23 | Terlewat; ada di PRD bagian 10, baris K-14 |
| Tautan | perpu.id dan `jdih.bpk.go.id/pencarian?q=…` | Alamat sumber resmi per dokumen | Alamat lama tidak bisa dibuka untuk dipastikan, dan perpu.id bukan situs JDIH pemerintah. Alamat baru sama dengan yang dipakai di `docs/sehari-setara/Verifikasi_Rujukan.md`, ditambah halaman UU 32/2009 di Database Peraturan JDIH BPK |
| Judul UU 32/2009 | Pengelolaan Lingkungan Hidup | Perlindungan dan Pengelolaan Lingkungan Hidup | Judul resmi di JDIH BPK |
| Format: jenis | pelanggaran hak / pengabaian kewajiban / peran lembaga | pelanggaran hak / pengabaian kewajiban / keduanya | Nilai yang ada di Architecture 5.1. "Peran lembaga" adalah hal yang ditanyakan Langkah 1, jadi dicatat di baris tersendiri |
| Format: batas | Tanpa batas judul dan jumlah rujukan | Judul ≤ 32 karakter; 1–4 rujukan per kejadian | Architecture 5.4 |
| Padanan JR-02 | "R-08 bagian (baru, bukan R yang sama persis)" | Baru | R-08 di `references.ts` hanya Pasal 28J ayat (1) |
| KT-B4 | Apakah Pasal 28E ayat (1) diberi kode sendiri? | Diganti: teks rujukan yang berpadanan dengan Sehari Setara | Pertanyaan lama bukan pilihan, karena setiap pasal yang berbeda memang mendapat kode sendiri |
| Tambahan | — | Hasil percobaan, pegangan gaya, tokoh dan wataknya, KT-B5 sampai KT-B7, Permintaan A-1 dan A-2 | AGENTS bagian 4.1 (langkah 6 dan 8) dan bagian 8 |

## Keputusan Gerbang naskah (5 November 2026)

| Kode | Keputusan |
|---|---|
| KT-B1 | 1a: satu berkas per kejadian (`K-01.md` sampai `K-16.md`) ditambah `NASKAH.md` |
| KT-B2 | 2a: dua kejadian per giliran, mulai Z7, lalu Z1 sampai Z8 |
| KT-B3 | 3a: JR-01 sampai JR-23 menjadi nomor tetap |
| KT-B4 | 4a: teks rujukan yang berpadanan R-xx sama persis dengan Sehari Setara; Permintaan A-2 diajukan |
| KT-B5 | 5a: penyerobot di K-13 menjadi teman sekelas tanpa nama; Raka hanya di K-04 |
| KT-B6 | 6a: selisih pilihan paling banyak 20 karakter (Langkah 1) dan 35 karakter (Langkah 2); pilihan benar atau tepat tidak selalu terpanjang |
| KT-B7 | 7a: rujukan baru dipra-periksa di sumber resmi setiap giliran |
| KT-10 PRD | Menunggu pilihan peninjau konten: versi A (umum, saran) atau versi B (bernuansa Bali) situasi K-02; kedua versi tetap di `K-02.md`. Diperlukan paling lambat sebelum JS-05 (semai bank awal) |

## Usulan Plan (disetujui 5 November 2026)

Setiap usulan berisi saran (a) dan alternatifnya. Kode KT-B di judul adalah keputusan terbuka yang dijawab di gerbang ini.

### 1. Format naskah (KT-B1)

(a, saran) Satu berkas Markdown per kejadian, `naskah/K-01.md` sampai `naskah/K-16.md`, ditambah `naskah/NASKAH.md` berisi daftar 16 kejadian beserta statusnya dan pustaka rujukan JR. Strukturnya tetap, agar di JS-05 isinya bisa dipindahkan ke `server/jejak-setara/seed/bank-awal.json` dan dicocokkan otomatis:

```markdown
# K-xx — [Judul, ≤ 32 karakter]
## Ringkasan
| | |
|---|---|
| Zona | Zx Nama zona |
| Set tokoh dan properti | Paling banyak 4 tokoh; kunci manifest diisi di JS-05 |
| Langkah 1 menanyakan | Hak yang terganggu / kewajiban yang diabaikan / peran lembaga |
| Topik | Misalnya "Hak atas kesehatan" |
| Jenis | Pelanggaran hak / pengabaian kewajiban / keduanya |
## Situasi
1–3 kalimat, ≤ 280 karakter, teks polos.
## Langkah 1 — Kenali
Pertanyaan (≤ 100 karakter), lalu tabel 4 pilihan (≤ 90 karakter, tepat satu benar)
dengan umpan balik per pilihan (≤ 160 karakter).
## Petunjuk
≤ 120 karakter; tidak menyalin teks pilihan benar.
## Langkah 2 — Bertindak
Pertanyaan (≤ 100 karakter), lalu tabel 3 pilihan (≤ 140 karakter: satu tepat,
satu kurang tepat, satu berisiko) dengan "yang terjadi" per pilihan (≤ 160 karakter).
## Kartu dampak
Hak yang terdampak (≤ 120 karakter) dan kewajiban terkait (≤ 120 karakter).
## Rujukan (perlu verifikasi)
1–4 kode JR beserta teksnya; rujukan baru disertai pra-pemeriksaan agen (KT-B7).
## Pemeriksaan panjang
Jumlah karakter setiap bagian terhadap batasnya, dihitung dengan skrip di luar repositori.
## Catatan peninjauan
Wajib untuk K-02 (agama), K-04 (disabilitas), dan K-10 (suku): risiko stereotip dan cara
menghindarinya. Kejadian lain mendapat catatan kepekaan bila perlu.
```

- (b) Satu berkas besar `NASKAH.md`: mudah dibaca sekali jalan, tetapi sulit dinilai per kejadian, dan satu perbaikan kecil menyentuh berkas besar.
- (c) Langsung JSON sesuai skema: terlalu dini, karena skema baru dibuat di JS-05.

**Pegangan gaya** (dari naskah Sehari Setara, Design System bagian 3.5, dan AGENTS bagian 8):

- Bahasa Indonesia baku yang ramah remaja dan berkalimat pendek. Huruf kapital hanya di awal kalimat dan pada nama diri, termasuk di judul.
- Pemain disapa "kamu", seperti contoh K-13. K-01 dan K-08 berpusat pada Nara, jadi pertanyaannya memakai "Nara", seperti di Sehari Setara.
- Pilihan berupa frasa kerja tanpa titik di akhir. Ucapan tokoh memakai tanda petik “ ”.
- Umpan balik dan "yang terjadi" berupa 1–2 kalimat yang menjelaskan alasan dengan nada mengajak. Umpan balik tidak diawali "Benar." atau "Salah.", karena pita "Tepat" atau "Belum tepat" sudah tampil di atasnya.
- Pengecoh Langkah 1 berupa anggapan keliru yang umum. Tidak ada pilihan, umpan balik, atau "yang terjadi" yang menyalahkan korban.
- Tanpa kekerasan fisik. Tokoh berwenang (guru, petugas, polisi) digambarkan membantu. Bayu tidak bersalah dan digambarkan netral.
- Kartu dampak ditulis seperti Sehari Setara: "Hak …." dan "Kewajiban …."

**Cara menyerahkan setiap giliran:** naskah dua kejadian tampil di balasan untuk dinilai, ditambah ZIP kecil berisi kedua berkas `K-xx.md`, `NASKAH.md`, dan `STATUS.md`. Frasa persetujuan per giliran: "Setuju: naskah Z7", "Setuju: naskah Z1", dan seterusnya. Permintaan revisi cukup ditulis bebas.

### 2. Urutan pengerjaan per zona (KT-B2)

(a, saran) Dua kejadian (satu zona) per giliran, dimulai dari zona yang contohnya sudah ada:

| Giliran | Kejadian | Zona | Catatan |
|---|---|---|---|
| 1 | K-13, K-14 | Z7 Puskesmas dan kantor desa | Kalibrasi gaya dari contoh K-13; memakai jawaban KT-B5 dan KT-B6 |
| 2 | K-01, K-02 | Z1 Rumah dan gang | K-02 peninjauan khusus (agama); KT-10 PRD diputuskan di sini |
| 3 | K-03, K-04 | Z2 Sekolah | K-04 peninjauan khusus (disabilitas) |
| 4 | K-05, K-06 | Z3 Jalan dan halte | |
| 5 | K-07, K-08 | Z4 Pasar | K-07 menanyakan peran lembaga |
| 6 | K-09, K-10 | Z5 Balai warga | K-10 peninjauan khusus (suku) |
| 7 | K-11, K-12 | Z6 Taman, sungai, dan pantai | |
| 8 | K-15, K-16 | Z8 Pojok gawai | |

- (b) Urutan per tingkat kesulitan atau per topik: mengganggu penilaian per zona dan menyulitkan Sesi C yang menyiapkan properti per zona.
- KT-10 PRD (nuansa lokal Bali di kejadian toleransi) diputuskan peninjau konten saat naskah ditulis. Untuk K-02 saya mengirim dua versi situasi: satu umum tanpa menyebut agama atau hari suci tertentu, dan satu bernuansa Bali. Peninjau memilih salah satunya.

### 3. Nomor rujukan JR (KT-B3)

- (a, saran) Nomor JR-01 sampai JR-23 di bagian "Daftar rujukan" langsung menjadi nomor tetap di naskah dan di semai JS-05, agar tidak ada penomoran ulang yang bisa keliru. Nomor tidak harus berurutan menurut kejadian; JR-23 ditambahkan di akhir supaya nomor lama tidak bergeser.
- (b) Nomor sementara, ditetapkan ulang di JS-05.

### 4. Teks rujukan yang berpadanan dengan Sehari Setara (KT-B4)

- (a, saran) Rujukan yang berpadanan R-xx memakai teks yang sama persis dengan `app/sehari-setara/content/references.ts`, dan rujukan baru dari undang-undang yang sama mengikuti gaya itu. Hasil pemeriksaan Sehari Setara pun langsung bisa dipakai sebagai pembanding. Akibatnya tiga teks sedikit berbeda dari PRD bagian 10: JR-18 dan JR-19 memakai "UU No. 22 Tahun 2009 tentang LLAJ", dan JR-20 diakhiri "(asas praduga tak bersalah)" (Permintaan A-2).
- (b) Semua teks persis seperti PRD bagian 10.

### 5. Tokoh penyerobot di K-13 (KT-B5)

Contoh K-13 di PRD memakai Raka sebagai tokoh yang menyerobot antrean lalu "menarikmu ikut", sedangkan K-04 memperkenalkan Raka sebagai teman berkursi roda. Bila keduanya orang yang sama, satu-satunya tokoh berkursi roda tampil sebagai pelanggar. Pelajaran K-13 juga bisa kabur, karena di banyak layanan umum penyandang disabilitas memang mendapat antrean prioritas.

- (a, saran) Penyerobot di K-13 menjadi teman sekelas tanpa nama (siswa SMP umum), dan Raka hanya muncul di K-04. PRD tidak perlu diubah, karena K-13 di PRD disebut sebagai contoh.
- (b) Raka tetap di K-13 sebagai orang yang sama, berkursi roda. Kalimat "menarikmu ikut" disesuaikan, dan peninjauan khusus K-04 ikut menilai K-13.
- (c) Memakai Dimas, yang di Sehari Setara pernah mengambil jalan pintas. Risikonya, Dimas menjadi pemberi pengaruh kurang baik di tiga kejadian (K-02, K-05, K-13).

### 6. Panjang pilihan (KT-B6)

- (a, saran) Panjang pilihan dibuat mirip: selisih pilihan terpanjang dan terpendek paling banyak 20 karakter di Langkah 1 dan 35 karakter di Langkah 2, dan pilihan benar atau tepat tidak selalu yang terpanjang. Setiap naskah mencantumkan angkanya di "Pemeriksaan panjang". Akibatnya pengecoh contoh K-13 diperpanjang sedikit (misalnya diberi alasan yang terdengar masuk akal), sehingga teks pilihannya tidak lagi persis sama dengan PRD.
- (b) Mengikuti gaya Sehari Setara apa adanya: lebih mudah ditulis, tetapi jawaban bisa ditebak dari panjangnya.
- (c) Hanya mengandalkan pengacakan urutan pilihan (JFR-21). Cara ini tidak menolong, karena yang ditebak adalah panjangnya, bukan letaknya.

### 7. Pra-pemeriksaan rujukan baru (KT-B7)

- (a, saran) Setiap giliran, rujukan **baru** di kedua kejadian itu saya pra-periksa di sumber resmi (bunyi pasal dan kecocokannya dengan kejadian), seperti catatan pra-pemeriksaan di `Verifikasi_Rujukan.md` Sehari Setara, agar Anda lebih cepat mencocokkan. Pra-pemeriksaan bukan verifikasi: statusnya tetap "perlu verifikasi".
- (b) Tanpa pra-pemeriksaan agen.

## Daftar rujukan untuk dicek di JDIH

Semua rujukan berstatus **perlu verifikasi**. Daftar ini persis rujukan usulan PRD bagian 10, tanpa nomor pasal baru. Memverifikasi berarti memastikan dua hal: bunyi pasal di naskah resmi sama, dan isinya cocok dengan kejadian yang memakainya.

- **11 rujukan berpadanan R-xx** sudah Anda cek untuk Sehari Setara pada 5 November 2026 (`docs/sehari-setara/Verifikasi_Rujukan.md`). Untuk rujukan ini cukup pastikan isinya cocok dengan kejadian Jejak Setara yang memakainya.
- **12 rujukan baru** (ditandai **baru**) perlu dibaca penuh.
- Pemeriksaan sekarang dipakai untuk menyetujui naskah. Tanda "Terverifikasi" resmi tetap diberikan akun Peninjau di pustaka rujukan konsol (JFR-45, dibangun di JS-12). Bank awal disemai dengan semua rujukan berstatus `belum`, dan agen tidak pernah menandai rujukan terverifikasi.
- Hasil pra-pemeriksaan agen (usulan 7a) dicatat per giliran di berkas `K-xx.md` dan di pustaka rujukan `NASKAH.md`.
- Untuk Pasal 28A–28J, cocokkan bunyi pasal dengan naskah Perubahan Kedua di peraturan.go.id. Naskah gabungan UUD 1945 di JDIH Kemenkeu memuat beberapa salah ketik di Bab XA (misalnya Pasal 28H ayat (2) dan 28I ayat (2)), jadi naskah itu hanya dipakai untuk melihat pasal mana yang pernah diubah.
- Kolom "Teks rujukan" mengikuti usulan 4a. Kolom "Yang dibutuhkan kejadian" adalah isi yang harus ada di pasal itu agar cocok, bukan kutipan bunyi pasal.
- Bila sebuah tautan tidak terbuka, buka https://peraturan.bpk.go.id (Database Peraturan JDIH BPK), lalu ketik jenis, nomor, dan tahunnya di kotak pencarian, misalnya "UU 32 Tahun 2009".

### A. UUD NRI 1945

| Naskah yang dibuka | Tautan | Pasal yang dicek di naskah ini |
|---|---|---|
| Perubahan Kedua (2000) | https://peraturan.go.id/files/UUD+1945+Perubahan+Kedua.pdf | Pasal 28B, 28D, 28E, 28F, 28G, 28H, 28I, dan 28J |
| Perubahan Keempat (2002) | https://jdih.setkab.go.id/PUUdoc/16953/UUD1945PerubahanKeempat.pdf | Pasal 31 |
| Naskah asli 1945 | https://jdih.kemenkeu.go.id/FullText/1945/UUDTAHUN~1945UUD.HTM | Pasal 27 ayat (1) dan Pasal 29 ayat (2) |

| JR | Teks rujukan | Dipakai di | Padanan Sehari | Yang dibutuhkan kejadian |
|---|---|---|---|---|
| JR-01 | Pasal 28B ayat (2) UUD NRI 1945 | K-01, K-03 | R-01 | Perlindungan dan tumbuh kembang Gita (K-01); perlindungan Komang dari kekerasan psikis dan diskriminasi (K-03) |
| JR-02 | Pasal 28E ayat (1) UUD NRI 1945 | K-02 | **baru** | Kebebasan memeluk agama dan beribadat |
| JR-03 | Pasal 29 ayat (2) UUD NRI 1945 | K-02 | **baru** | Jaminan negara atas kemerdekaan beribadat |
| JR-04 | Pasal 28J ayat (1) UUD NRI 1945 | K-02, K-03, K-06, K-08, K-09, K-10, K-12, K-13, K-15, K-16 | R-08 | Kewajiban menghormati hak asasi orang lain |
| JR-05 | Pasal 28G ayat (1) UUD NRI 1945 | K-03, K-07, K-15 | R-03 | Kehormatan dan martabat (K-03, K-15); nama baik dan rasa aman Bayu (K-07) |
| JR-06 | Pasal 31 ayat (1) UUD NRI 1945 | K-04, K-14 | R-04 | Hak atas pendidikan |
| JR-07 | Pasal 28H ayat (2) UUD NRI 1945 | K-04 | **baru** | Kemudahan atau perlakuan khusus agar Raka mendapat kesempatan yang sama |
| JR-08 | Pasal 27 ayat (1) UUD NRI 1945 | K-05 | R-05 | Kewajiban menjunjung hukum, termasuk aturan lalu lintas |
| JR-09 | Pasal 28D ayat (1) UUD NRI 1945 | K-07 | R-09 | Kepastian hukum yang adil dan perlakuan yang sama di hadapan hukum |
| JR-10 | Pasal 28H ayat (4) UUD NRI 1945 | K-08 | **baru** | Hak milik pribadi tidak boleh diambil sewenang-wenang |
| JR-11 | Pasal 28E ayat (3) UUD NRI 1945 | K-09 | R-07 | Kebebasan mengeluarkan pendapat |
| JR-12 | Pasal 28I ayat (2) UUD NRI 1945 | K-10 | **baru** | Bebas dari perlakuan diskriminatif |
| JR-13 | Pasal 28H ayat (1) UUD NRI 1945 | K-11, K-13 | **baru** | Lingkungan hidup yang baik dan sehat (K-11); pelayanan kesehatan (K-13) |
| JR-14 | Pasal 28F UUD NRI 1945 | K-16 | **baru** | Hak berkomunikasi dan memperoleh informasi |
| JR-15 | Pasal 28J ayat (2) UUD NRI 1945 | K-16 | **baru** | Pembatasan hak dengan undang-undang demi hak orang lain dan ketertiban umum |
| JR-23 | Pasal 31 ayat (2) UUD NRI 1945 | K-14 | **baru** | Kewajiban mengikuti pendidikan dasar, dan kewajiban pemerintah membiayainya |

### B. UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014 (Perlindungan Anak)

Tautan: https://peraturan.bpk.go.id/Details/44473/uu-no-23-tahun-2002 · UU 35/2014: https://peraturan.go.id/files/uu35-2014bt.pdf

| JR | Teks rujukan | Dipakai di | Padanan Sehari | Yang dibutuhkan kejadian |
|---|---|---|---|---|
| JR-16 | UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 19 | K-01 | R-02 | Kewajiban anak menghormati orang tua dan menyayangi keluarga |
| JR-17 | UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 11 | K-12 | **baru** | Hak anak beristirahat, bermain, dan bergaul dengan teman sebaya |

Catatan: pastikan apakah Pasal 11 termasuk pasal yang diubah UU 35/2014 (lihat Pasal I UU 35/2014). Menurut catatan R-02, perubahan terakhir UU 23/2002, yaitu UU 17/2016, hanya menyentuh Pasal 81, 81A, 82, dan 82A.

### C. UU No. 22 Tahun 2009 tentang Lalu Lintas dan Angkutan Jalan

Tautan: https://peraturan.bpk.go.id/Details/38654/uu-no-22-tahun-2009 · teks lengkap: https://jdih.kemenkeu.go.id/fullText/2009/22TAHUN2009UU.htm

| JR | Teks rujukan | Dipakai di | Padanan Sehari | Yang dibutuhkan kejadian |
|---|---|---|---|---|
| JR-18 | UU No. 22 Tahun 2009 tentang LLAJ, Pasal 77 ayat (1) dan Pasal 106 ayat (8) | K-05 | R-06 | Wajib punya SIM; pengemudi dan penumpang sepeda motor wajib berhelm |
| JR-19 | UU No. 22 Tahun 2009 tentang LLAJ, Pasal 131 ayat (2) | K-06 | **baru** | Pejalan kaki didahulukan saat menyeberang di tempat penyeberangan |

Catatan: UU 22/2009 pernah diubah lewat UU Cipta Kerja; pastikan Pasal 131 tidak termasuk yang diubah. Catatan R-06 menyebut hal yang sama untuk Pasal 77 dan 106.

### D. UU No. 48 Tahun 2009 tentang Kekuasaan Kehakiman

Tautan: https://peraturan.go.id/files/uu48-2009.pdf · https://peraturan.bpk.go.id/Details/38793/uu-no-48-tahun-2009

| JR | Teks rujukan | Dipakai di | Padanan Sehari | Yang dibutuhkan kejadian |
|---|---|---|---|---|
| JR-20 | UU No. 48 Tahun 2009, Pasal 8 ayat (1) (asas praduga tak bersalah) | K-07 | R-12 | Bayu dianggap tidak bersalah selama belum ada putusan pengadilan |

### E. UU No. 2 Tahun 2002 dan UU No. 5 Tahun 2026 (Kepolisian)

Tautan: https://peraturan.bpk.go.id/Details/44418/uu-no-2-tahun-2002 · UU 5/2026: https://peraturan.bpk.go.id/Details/350096/uu-no-5-tahun-2026

| JR | Teks rujukan | Dipakai di | Padanan Sehari | Yang dibutuhkan kejadian |
|---|---|---|---|---|
| JR-21 | UU No. 2 Tahun 2002 sebagaimana telah diubah terakhir dengan UU No. 5 Tahun 2026, Pasal 13 dan Pasal 14 ayat (1) huruf g | K-07 | R-11 | Polisi menerima laporan dan menyelidiki |

Catatan: menurut catatan R-11 (5 Nov 2026), UU 5/2026 sedang diuji di Mahkamah Konstitusi. Bila kelak dibatalkan, rujukan ini ditinjau ulang.

### F. UU No. 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup

Tautan: https://peraturan.bpk.go.id/Details/38771/uu-no-32-tahun-2009

| JR | Teks rujukan | Dipakai di | Padanan Sehari | Yang dibutuhkan kejadian |
|---|---|---|---|---|
| JR-22 | UU No. 32 Tahun 2009, Pasal 67 | K-11 | **baru** | Kewajiban setiap orang menjaga kelestarian lingkungan dan mencegah pencemaran |

Catatan: halaman JDIH BPK mencatat UU ini diubah lewat UU Cipta Kerja (UU 11/2020, Perppu 2/2022, dan UU 6/2023). Pastikan Pasal 67 tidak termasuk yang diubah.

## Tokoh dan wataknya

Pegangan agar tokoh Sehari Setara muncul dengan watak yang sama (AGENTS bagian 8). Watak diambil dari naskah Sehari Setara, dan ciri visual dari Design System bagian 8. "Muncul di" mengikuti garis besar PRD bagian 10.

| Tokoh | Watak dan ciri tetap | Muncul di | Ada di Design System bagian 8? |
|---|---|---|---|
| Nara | Siswa kelas IX, tokoh utama Sehari Setara; di Jejak Setara menjadi tokoh bukan pemain; tas `sun` bertali `mango` | K-01, K-08 | Ya |
| Ibu | Ibu Nara; pagi-pagi berangkat ke pasar (adegan 1) | K-01 | Ya |
| Gita | Adik Nara, kelas 3 SD (adegan 1) | K-01, K-12 | Ya |
| Dimas | Teman sekelas; menawarkan boncengan tanpa SIM dan helm cadangan, lalu berpikir ulang sesudah diingatkan (adegan 2) | K-02, K-05 | Ya |
| Sinta | Teman sekelas yang aktif berpendapat (adegan 3); berkerudung putih | K-09 | Ya |
| Bu Ratih | Guru BK yang segera menanggapi laporan (adegan 4); batik `teal`, berkacamata | K-03, K-14 | Ya |
| Komang | Adik kelas VII yang pernah ditertawakan dan videonya disebar (adegan 4 dan 6); digambarkan bermartabat, bukan untuk dikasihani | K-03, K-15 | Ya |
| Pak Made | Pemilik warung (adegan 5); kaus `mango`, sarung kotak-kotak | K-02 | Ya |
| Bayu | Pemuda yang baru pindah; dituduh tanpa bukti dan ternyata tidak bersalah (adegan 5); netral dan ramah; kaus `mist` | K-07 | Ya |
| Raka | Teman sekelas berkursi roda | K-04 | Belum; baru ada pose "duduk di kursi roda" dan objek kursi roda |
| Wayan | Teman sekelas yang ingin membantu orang tuanya berdagang | K-14 | Belum |
| Warga umum | Ibu menggendong bayi dan petugas puskesmas (K-13), lansia (K-06), pedagang dan polisi (K-07), anak SD (K-12) | — | Ya |
| Siswa SMP umum | Pengejek (K-03), peserta dan panitia lomba (K-10), remaja piknik (K-11), remaja bermain bola (K-12), teman yang menyerobot antrean (K-13), teman (K-16, mungkin juga K-01) | — | Belum |

## Permintaan untuk Sesi A

| Kode | Berkas | Permintaan | Alasan | Status |
|---|---|---|---|---|
| A-1 | `docs/jejak-setara/Design_System.md` bagian 8 dan `docs/jejak-setara/PRD.md` bagian 15 | Tambahkan ke daftar tokoh bukan pemain: Raka (teman sekelas berkursi roda, K-04), Wayan (teman sekelas, K-14), dan siswa SMP umum untuk K-03, K-10, K-11, K-12, K-13, dan K-16. Ciri visualnya ditetapkan pemilik proyek bersama Sesi C | Garis besar PRD bagian 10 dan naskah K-13 serta K-14 memakai tokoh-tokoh ini, tetapi kedua daftar belum memuatnya | Diajukan |
| A-2 | `docs/jejak-setara/PRD.md` bagian 10 | Samakan teks rujukan di baris K-05 dan K-06 menjadi "UU No. 22 Tahun 2009 tentang LLAJ, …", dan di baris K-07 menjadi "UU No. 48 Tahun 2009, Pasal 8 ayat (1) (asas praduga tak bersalah)" | Agar PRD dan pustaka rujukan memakai teks yang sama (KT-B4 dijawab a) | Diajukan |
| A-3 | `docs/jejak-setara/PRD.md` bagian 10 | Tambahkan "Pasal 28J ayat (1) UUD NRI 1945 (R-08)" ke rujukan usulan baris K-04 | Kewajiban di kartu dampak K-04 perlu rujukan; usulan ada di `K-04.md`, bagian catatan peninjauan | Diajukan (disetujui pemilik proyek, 5 Nov 2026) |
| A-4 | `docs/jejak-setara/PRD.md` bagian 10 | Tambahkan "Pasal 28G ayat (1) UUD NRI 1945 (R-03)" ke rujukan usulan baris K-05 | Hak di kartu dampak K-05 perlu rujukan; adegan 2 Sehari Setara memakai R-03 untuk hak yang sama (lihat `K-05.md`) | Diajukan (disetujui pemilik proyek, 5 Nov 2026) |

## Catatan untuk JS-05

- JS-05 baru dimulai sesudah pemilik proyek mengabarkan bahwa JS-02 selesai.
- `content:check:jejak` menjalankan uji di `app/jejak-setara/__tests__/konten/` (AGENTS bagian 6). Folder itu belum termasuk izin JS-05 dari pemilik proyek (5 Nov 2026), jadi izinnya akan saya minta di Plan JS-05.

## Cara membalas (Giliran 7)

- **"Setuju: naskah Z6"** berarti K-11 dan K-12 disetujui. Giliran ini tidak membawa usulan tambahan rujukan.
- Versi situasi K-02 (KT-10) boleh dijawab kapan saja sebelum JS-05, misalnya dengan menambahkan "K-02 versi A" di balasan.
- Bila ada yang perlu diubah, tulis bebas. Saya memperbaikinya, lalu menyerahkannya lagi.

## Langkah berikutnya sesudah "Setuju: naskah Z6"

1. Menandai K-11 dan K-12 "Disetujui" di `NASKAH.md`.
2. Menulis Giliran 8, giliran terakhir: K-15 dan K-16 (Z8 Pojok gawai).
   - K-15 memakai rujukan padanan (JR-05 dan JR-04), dengan watak Komang yang sama seperti di Sehari Setara.
   - K-16 memakai JR-14 (Pasal 28F), JR-04, dan JR-15 (Pasal 28J ayat (2)). JR-14 dan JR-15 dipra-periksa di naskah Perubahan Kedua.
3. Sesudah Giliran 8 disetujui, saya menyerahkan ringkasan akhir 16 naskah, termasuk hal yang masih ditunggu sebelum JS-05 (KT-10 dan Permintaan A-1 sampai A-4).
