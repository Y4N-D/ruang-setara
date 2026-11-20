# Hasil uji JS-11 — 20 November 2026

Spesifikasi: [JS-11-akhir-ronde.md](../specs/JS-11-akhir-ronde.md), disetujui 20 November 2026 (D-1 a, D-2 a, D-3 a, D-4 a). Dibangun dalam mode ZIP dari `main` sesudah commit 5edde25. Mesin agen: Linux, Node 22.23, Chromium (`google-chrome`) tanpa jendela, server lokal Wrangler dengan D1 dan Durable Object lokal.

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 Isi rekap | Lulus | `inti-akhir-ronde.test.ts` (urutan kejadian ruang, hanya Langkah 1 yang dikunci, teks dari id asli, Langkah 2 kosong bernilai `null`, paling banyak 64 butir); `kejadian.uji-server.ts` dan `hasil.uji-server.ts` (rekap dari ronde sungguhan) |
| AC-2 Pengiriman rekap | Lulus | `inti-akhir-ronde.test.ts` (menyambung ulang di `pembahasan`, sesudah perubahan peringkat); `hasil.uji-server.ts` (ketiga `selesai` lolos `skemaServerPemain`); `PROTOKOL_VERSI` tetap 2 |
| AC-3 Layar rekap | Lulus | `rekap-pemain.test.tsx` (susunan, tanda berikon, "Belum dijawab", catatan ruang uji, rekap kosong, skor 0); `hasil.uji.ts` (HP 731 × 411 dan laptop 1280 × 720 tanpa luapan mendatar; tangkapan layar) |
| AC-4 Refleksi | Lulus | Teks Pasangan 1 (D-1) di `teks.ts` dan uji teks AC-21; `hasil.uji.ts`: Tab ke "Langsung ke refleksi", Enter, fokus di judul Refleksi |
| AC-5 Rekap saat menyambung ulang | Lulus | `rekap-pemain.test.tsx` (pita `mango`, tanpa lapisan); layar lain tetap memakai lapisan JS-07 (`dunia.uji.ts` dan `gabung.uji.ts` lulus) |
| AC-6 Rekap sesudah sambungan berakhir | Lulus | `rekap-pemain.test.tsx` (pita dan tombol untuk setiap penyebab; dikeluarkan tetap ke layar galat); token tetap diatur `KlienRuang` JS-03 dan JS-22 tanpa perubahan; `hasil.uji.ts` dan `gabung.uji.ts` (tutup ruang: pita, "Tunggu arahan guru." hilang, tombol Kembali) |
| AC-7 Aksesibilitas rekap | Lulus | `rekap-pemain.test.tsx` (h1, h2, h3, daftar bernomor dan biasa); `hasil.uji.ts` (tautan dan tombol setinggi sedikitnya 48 px, papan ketik saja); pita diumumkan lewat `umumkan` yang sudah ada |
| AC-8 Migrasi | Lulus | `migrasi.test.ts` (0002 di atas 0001, baris lama bernilai 0, CHECK); server lokal menerapkan 0001 dan 0002; uji semai bank awal lulus |
| AC-9 Hasil akhir di D1 | Lulus | `inti-akhir-ronde.test.ts` (keluarkan di lobi, main, dan pembahasan; nama baru saat pembahasan; tutup dari main dan jeda); `hasil.uji-server.ts` (kolom `dikeluarkan` dan peringkat akhir di D1; berhenti paksa dari `main` lewat kait `pengaman`) |
| AC-10 Ringkasan hasil | Lulus | `hasil.uji-server.ts`: `ringkasan_json` berisi `pemakaian` dan `hasil`, dan angka `hasil` sama dengan ringkasan API hasil; berhenti paksa juga menulis `hasil` |
| AC-11 Kiriman tertunda | Lulus | `RuangJejak` melaporkan `kirimanTertunda`; `hasil.uji-server.ts` menunggu nilainya menjadi `false` sesudah setiap perubahan; `hasil-konsol.test.tsx` (pesan tampil di atas hasil yang dimuat); `hasil.uji.ts` (tabel Dikeluarkan muncul sesudah Keluarkan tanpa memuat ulang halaman) |
| AC-12 Rute dan tab | Lulus | `rute.test.ts` (`#/ruang/riwayat`); `hasil.uji.ts` (`aria-current` tab, menu Ruang aktif, "← Riwayat ruang" untuk ruang ditutup) |
| AC-13 API riwayat | Lulus | `api-hasil.test.ts` (hanya ruang ditutup, kepemilikan, saringan tanggal dan label, guru untuk admin, penanda halaman, `dimainkan`); `hasil-inti.test.ts` (saringan dan ronde dimainkan) |
| AC-14 Halaman riwayat | Lulus | `hasil.uji.ts` (galat tanggal tanpa permintaan API, saringan label, tampilan kosong, Atur ulang, tabel 1280 × 720 dan kartu 360 × 640) |
| AC-15 API hasil dan rincian | Lulus | `api-hasil.test.ts` (angka, urutan, 409, 404, huruf menurut urutan acak); `hasil.uji-server.ts` (data ronde sungguhan) |
| AC-16 Halaman hasil | Lulus | `hasil.uji.ts` (ringkasan, tabel peringkat dan Dikeluarkan, rincian, kepala tabel tetap di atas saat digulir, tanpa luapan di 1280 × 720 dan 360 × 640) |
| AC-17 CSV | Lulus | `csv.test.ts` (BOM, titik koma, CRLF, koma desimal, kutip, keenam awalan rumus, WITA, kolom, nama berkas); `api-hasil.test.ts` dan `hasil.uji-server.ts` (tajuk, izin, status); `hasil.uji.ts` (unduh dari tombol) |
| AC-18 Cetak | Lulus | `hasil.uji.ts`: media cetak hanya menampilkan bagian P-31; ruang 40 pemain menjadi PDF A4 satu halaman |
| AC-19 Hapus data ruang | Lulus | `api-hasil.test.ts` (guru 403, 409, satu batch, satu baris audit, dua penghapusan bersamaan); `hasil.uji-server.ts`; `hasil.uji.ts` (tombol aktif hanya bila label cocok, kembali ke Riwayat) |
| AC-20 Ikon centang | Lulus | `hasil.uji.ts` dan `kelas.uji.ts` (ikon, angka, teks pembaca layar, tanpa huruf ✓); tangkapan layar kelas |
| AC-21 Teks | Lulus | `kerangka.test.ts` (tabel teks JS-11, termasuk "Teks JS-10 yang berubah" untuk uji AC-25 JS-10) |
| AC-22 Ukuran dan kinerja | Lulus dengan catatan, diterima pemilik proyek (20 Nov 2026, pilihan a) | Konsol 130,4 KB gzip (batas 350 KB); aturan impor konsol (`tampilan-kelas.test.ts`); CSV 100 × 16: 2,1 ms (batas 5 ms). **Catatan:** kode layar pemain naik 1,33 KB gzip, di atas batas 1 KB (bagian "Anggaran ukuran dan kinerja") |
| AC-23 Beban | Lulus | `sim:beban` 1 × 50: 50 bot menerima `selesai`, 50 rekap lolos skema, 0 putus tak terduga, 0 pesan ditolak (bagian "Simulasi beban") |
| AC-24 Tanpa regresi | Lulus | Semua perintah di bawah; `build:pages` 178 berkas identik byte |

## Perintah yang dijalankan dan hasilnya

| Perintah | Hasil |
|---|---|
| `content:check:jejak` | 10 berkas, 254 uji lulus |
| `test:jejak` | 62 berkas, 1.005 uji lulus |
| `test:jejak:server` | 8 berkas, 57 uji lulus |
| `test:e2e:jejak` | 44 uji lulus, dijalankan per kelompok seperti JS-10: 31 uji dalam satu perintah, lalu 13 uji `konsol.uji.ts` tersendiri. Dalam satu perintah penuh, uji JS-04 pertama gagal karena dasbor admin memuat ruang yang ditinggalkan uji lain (bagian "Temuan"); `hasil.uji.ts` dijalankan lagi tersendiri sesudah pemeriksaan papan ketik dan target sentuh ditambahkan |
| `sim:beban` | 1 ruang × 50 bot sampai ronde berakhir; lihat di bawah |
| `build:jejak` | Berhasil; Worker 410,31 KB (101,27 KB gzip) |
| `build:pages` | 178 berkas, identik byte dengan `main` sebelum Build |
| `tsc --noEmit` | 0 galat |
| ESLint untuk berkas Jejak Setara (`app/jejak-setara`, `server/jejak-setara`, `e2e/jejak-setara`, `scripts/jejak-setara`, `web/jejak-setara`, dan konfigurasi Jejak) | 0 masalah |

## Simulasi beban

`sim:beban` dengan 1 ruang × 50 bot di Worker lokal, dengan layar kelas tersambung, sampai ronde diakhiri dan ruang ditutup:

- 50 dari 50 bot menerima `selesai`, dan 50 rekap lolos skema `skemaServerPemain` (dimuat dari `inti/protokol.ts`).
- Rata-rata 2,12 butir rekap per bot. Ukuran `selesai` rata-rata 1.316 bita dan paling besar 3.136 bita.
- Baris D1 akhir sesudah antrean kosong: 50 peserta, 50 berperingkat, 106 jawaban dengan Langkah 1 dikunci. Ringkasan: 50 pemain, rata-rata skor 82,5, ketepatan Langkah 1 26,4%, tingkat 31,1% tepat, 38,7% kurang tepat, dan 30,2% berisiko.
- 0 sambungan putus tak terduga dan 0 pesan ditolak server.

Perkiraan Specify untuk 16 kejadian tetap berlaku: sekitar 9,3–9,5 KB per pesan `selesai` bila pemain menjawab semuanya.

## Anggaran ukuran dan kinerja

Ukuran gzip (zlib tingkat 9) berkas yang dimuat setiap halaman, dibandingkan dengan build `main` sebelum Build:

| Bagian | Sebelum | Sesudah | Selisih |
|---|---|---|---|
| Kode layar pemain (`/`) | 120,91 KB | 122,24 KB | +1,33 KB (batas JS-11: 1 KB; anggaran Architecture 11.3: 200 KB) |
| Gaya layar pemain | 5,50 KB | 5,82 KB | +0,32 KB |
| Kode konsol (`/admin/`) | 113,88 KB | 119,92 KB | +6,04 KB |
| Gaya konsol | 9,17 KB | 10,46 KB | +1,29 KB; konsol seluruhnya 130,4 KB (batas 350 KB) |
| Worker | 92,11 KB | 101,27 KB | +9,16 KB |

Rincian kenaikan kode layar pemain, dari build percobaan dengan layar rekap dikosongkan: layar rekap `Rekap.tsx` 0,88 KB; teks rekap dan refleksi di `teks.ts` 0,27 KB (potongan bersama); logika rekap di `App.tsx` dan `rekapKeadaan.ts`, dikurangi layar lama yang dihapus, 0,21 KB. Percobaan selama Build: menulis ulang `Rekap.tsx` lebih ringkas mengurangi 0,9 KB sebelum gzip tetapi tidak mengubah ukuran gzip, dan membuang nama kelas yang bisa diganti pemilih CSS hanya menghemat 0,05 KB. Memuat layar rekap sebagai potongan terpisah tidak dicoba lagi, karena pengukuran JS-12 menunjukkan pemuat potongan Vite menambah sekitar 0,8 KB.

Penyusun CSV jawaban di Node (median 20 kali di mesin agen, `rincianJawaban` lalu `csvJawaban`):

| Data | Ukuran berkas | CSV saja | Rincian dan CSV |
|---|---|---|---|
| 40 pemain × 16 kejadian | 168 KB | 1,1 ms | 2,6 ms |
| 100 × 16 | 420 KB | 2,1 ms | 4,3 ms |
| 100 × 64 | 1.678 KB | 9,8 ms | 17,9 ms |

CSV peserta 100 baris: 0,2 ms (8,8 KB). Ekspor 100 × 64 bisa melewati batas CPU 10 ms paket gratis; Paket inti 16 tetap di bawahnya (catatan untuk Plan JS-15).

## Tangkapan layar

`docs/jejak-setara/tests/JS-11/`:

- Rekap di HP dan laptop: `rekap-berisi-731x411.png`, `rekap-berisi-1280x720.png`, `rekap-kosong-731x411.png`, `rekap-kosong-1280x720.png`, `rekap-ditutup-731x411.png`, `rekap-ditutup-1280x720.png`.
- Konsol: `konsol-riwayat-1280x720.png`, `konsol-riwayat-360x640.png`, `konsol-hasil-1280x720.png` (dengan rincian terbuka), `konsol-hasil-360x640.png`, `konsol-hasil-pembahasan-1280x720.png` (ruang yang belum ditutup), `konsol-hapus-1280x720.png`, `konsol-cetak-a4.png` (tampilan cetak).
- Layar kelas dengan ikon centang: `kelas-bermain-1024x768.png`, `kelas-bermain-1920x1080.png`, `kelas-pembahasan-1024x768.png`, `kelas-pembahasan-1920x1080.png`.

## Pemeriksaan manual (AGENTS 9)

- Tidak ada nama asli siswa: layar dan CSV hanya memuat nama samaran, dan log audit `ruang.hapus` hanya memuat kode, label kelas, waktu dibuat, dan jumlah baris yang dihapus.
- Rekap dan refleksi bisa dibaca sampai akhir dengan papan ketik saja di laptop (halaman digulir biasa; tautan dan tombol bisa difokus dengan fokus terlihat).
- 10 besar dan pembahasan di layar kelas terbaca dengan ikon centang (tangkapan layar).
- Pemeriksaan Excel berbahasa Indonesia dan pratinjau cetak di Windows dilakukan pemilik proyek (langkah 4 dan 5 di spesifikasi, bagian "Rencana uji"); hasilnya di bagian "Pemeriksaan di lingkungan uji".

## Pemeriksaan di lingkungan uji (20 November 2026)

Dijalankan pemilik proyek sesudah ZIP Build JS-11 di-push (commit `e2e2a43`):

| Langkah | Hasil |
|---|---|
| 1. "Jejak: uji" untuk commit `e2e2a43`, termasuk migrasi D1 `0002` | Hijau |
| 2. Ronde pendek dengan 5 HP: rekap tampil, satu kalimat refleksi disalin, lalu ruang ditutup dan rekap tetap tampil dengan pita | Berhasil |
| 3. Tab Riwayat, saringan, hasil ruang, dan satu rincian | Berhasil |
| 4. CSV peserta dan CSV jawaban di Excel: kolom terpisah, huruf Indonesia, dan desimal koma | Benar |
| 5. Cetak atau simpan sebagai PDF | Rapi |
| 6. Hapus data satu ruang uji sebagai admin, lalu ruang itu hilang dari Riwayat | Berhasil |

Pemeriksaan rujukan di konsol uji (catatan Specify JS-11 untuk Plan JS-16): K-06 dan K-11 berstatus Terbit. Kode rujukan yang tampil di saringan "Belum" belum tercatat, karena pesan pemilik proyek masih memuat teks contoh "[kode rujukan, misalnya JR-xx dan JR-yy]"; kodenya diminta lagi dan dicatat di `PLAN.md` untuk Plan JS-16.

## Temuan

1. **AC-22, ukuran kode layar pemain.** Naik 1,33 KB gzip, di atas batas 1 KB. Seluruh kenaikan berasal dari isi yang diminta spesifikasi (layar rekap, teks, dan logika sambungan berakhir). Pilihan: (a, saran) terima kenaikan ini dan catat di PRD 21, karena layar pemain masih 122 KB dari anggaran 200 KB; (b) kembali ke Specify untuk mengurangi isi rekap di HP, misalnya tanpa daftar rujukan, dengan penghematan kecil.
2. **Urutan uji ujung ke ujung (di luar JS-11).** Bila semua uji dijalankan dalam satu perintah, uji JS-04 "admin 1280 × 720" gagal: dasbor admin menampilkan ruang yang ditinggalkan uji lain, dan tautan ruang di kartu "Ruang yang sedang berjalan" setinggi 44 px, di bawah 48 px yang diperiksa uji itu. Saat `konsol.uji.ts` dijalankan tersendiri, semua lulus. Dicatat untuk Plan berikutnya: tinggi tautan kartu dasbor (JS-10) dan pembersihan ruang di uji.

## Keputusan

Lulus dengan catatan AC-22 (ukuran kode layar pemain). Menunggu keputusan pemilik proyek untuk temuan 1.

**Keputusan pemilik proyek (20 Nov 2026):** AC-22 (a), kenaikan 1,33 KB diterima dan dicatat di PRD bagian 21. Keenam langkah di lingkungan uji berhasil (bagian "Pemeriksaan di lingkungan uji"). **Lulus; JS-11 Selesai.** Temuan 2 tetap dicatat di `PLAN.md` untuk Plan berikutnya yang menyentuh dasbor atau uji.
