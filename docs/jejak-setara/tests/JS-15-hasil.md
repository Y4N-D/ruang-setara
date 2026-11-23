# Laporan uji JS-15 — Uji beban dan ketahanan jaringan, anggaran ukuran, perbaikan kinerja

| | |
|---|---|
| Spesifikasi | [specs/JS-15-beban.md](../specs/JS-15-beban.md) (disetujui 23 November 2026 dengan `Spesifikasi disetujui: JS-15`; D-1 sampai D-4 = a; selama Build dan Test diputuskan D-5 a, D-6 a, D-7 a, D-9 a, dan D-10 a) |
| Tanggal | 23 November 2026 |
| Sesi | Sesi A (mesin), mode ZIP dari `main` commit `e3e24a5` ditambah ZIP Gerbang 1 dan 2, ZIP Build, dan ZIP perbaikan-1 sampai perbaikan-8 JS-15 |
| Lingkungan | Uji lokal: Node 22.23.5, pnpm 11.25.0, Chromium 1243 (Playwright, lewat `JEJAK_CHROMIUM`), Miniflare dari dependensi terkunci, mesin 1 vCPU. Uji beban jarak jauh: alur kerja "Jejak: uji beban" di mesin GitHub `ubuntu-24.04` (4 vCPU) menuju Worker `jejak-setara-uji` (Workers Paid sejak 23 November 2026, ruang di Asia Pasifik) |
| Status | Menunggu `Diterima: JS-15`. Semua kriteria otomatis lulus, dan s2 serta s3 lulus menurut D-10 a. Satu penyimpangan perlu diterima: ekspor CSV ruang 100 pemain di lingkungan uji tidak dijalankan (AC-11; bagian "Penyimpangan") |

## Ringkasan

JS-15 membuktikan kapasitas Jejak Setara di Cloudflare sungguhan, sesudah Workers Paid aktif. Hasil utamanya:

- **1 ruang × 50 pemain lulus semua ambang.**
- **1 ruang × 100 pemain**, batas aplikasi, lulus ambang kapasitas: 0 putus, semua 100 menerima hasil, dan 100 peserta tercatat.
- **10 ruang × 50 pemain** berjalan bersamaan 15 menit tanpa kehilangan data, dua kali di Cloudflare dan sekali bersih total di Worker lokal.
- Selama seluruh uji: Errors 0, CPU tertinggi sekitar 48 ms dari batas 1.000 ms, dan tagihan US$0,00 di luar langganan.

Perbaikan kinerja juga terbukti:
- layar Kode di HP lambat siap dalam 1,20 detik (sebelumnya 4,25 detik);
- data lobi turun dari 5,88 menjadi 2,84 MB per pemain per 15 menit;
- kode konsol turun 5,7 KB.

Uji beban jarak jauh menemukan satu masalah sungguhan di server, dan sudah diperbaiki (D-7 a): pengaman banjir pesan memutus HP yang jujur sesudah jaringan tersendat beberapa detik. Selain itu ditemukan sejumlah kekurangan di alat uji saya sendiri, juga sudah diperbaiki (bagian "Catatan penerapan").

Angka yang peka jaringan dari mesin GitHub di Amerika (persen sambung ulang, pesan ditolak, koreksi, dan kenaikan waktu pulang-pergi) tidak bisa dinilai adil di s2 dan s3. Menurut D-10 a, angka itu dicatat sebagai informasi, lengkap dengan rincian per mesin.

## Kriteria penerimaan

| AC | Status | Bukti |
|---|---|---|
| AC-1 Pengaturan lingkungan uji | Lulus | `kerangka.test.ts` (`limits.cpu_ms` 1.000, `RUANG_AKTIF_MAKS` 12, `ITERASI_SANDI` 100.000; tingkat atas tidak berubah); "Jejak: uji" hijau dan `/api/sehat` menjawab protokol 4 (bot membaca versi 4 di setiap run) |
| AC-2 Hash 100.000 iterasi | Lulus | `api-akun.test.ts` (4.000 → 100.000 saat masuk); D1 uji dibaca lewat konektor 23 Nov 2026: akun admin uji beban, yang dibuat dengan 4.000 iterasi, kini 100.000 |
| AC-3 Perkiraan dan pengaman biaya | Lulus | `beban/biaya.test.ts`; skrip menolak tanpa `--saya-paham-biaya` dan di atas 400.000 permintaan (kode keluar 1, diperiksa langsung) |
| AC-4 Bergabung bertahap, pengukur sepi, jam mulai bersama, pemakaian, dan penghapusan | Lulus | Jalur lingkungan uji dijalankan utuh terhadap Worker lokal; di Cloudflare: kesepuluh ruang s2 `main` bersamaan 15 menit, dan semua ruang uji beban terhapus atau tertutup |
| AC-5 Alur kerja "Jejak: uji beban" | Lulus | `kerangka.test.ts` (pemicu, konfirmasi, izin, `concurrency`, batas 40 menit, alamat uji saja, matriks, artifact); `beban/gabung.test.ts` (setiap ambang lulus dan gagal) |
| AC-6 `singkat` | Lulus | Semua ambang lulus (tabel "Beban") |
| AC-7 `s1` | Lulus | Run keenam lulus semua ambang |
| AC-8 `s2` | Lulus (D-10 a) | Dua run: semua ambang kapasitas lulus; angka jaringan dicatat |
| AC-9 `s3` | Lulus (D-10 a) | Semua ambang kapasitas lulus; kenaikan waktu pulang-pergi dicatat |
| AC-10 `lokal-10x50` | Lulus | Semua ambang lulus; catatan AC-20 JS-03 tertutup |
| AC-11 Metrics, tagihan, dan ekspor CSV | Lulus sebagian | Tangkapan layar pemilik proyek 23 Nov 2026: Errors by version 0 untuk ke-16 versi selama 24 jam; CPU Time P999 tertinggi sekitar 48 ms; Billable usage US$0,00. Ekspor CSV ruang 100 pemain di lingkungan uji tidak dijalankan (bagian "Penyimpangan") |
| AC-12 Putus 30 detik | Lulus | `jaringan.uji.ts` |
| AC-13 Putus 2 menit | Lulus | `jaringan.uji.ts` (pemain lain tetap tersambung; sisa waktu berkurang ≥ 115 detik) |
| AC-14 Latensi 300 ms | Lulus | `jaringan.uji.ts` (28 gerak, 1 koreksi; bergabung lewat Worker lokal HTTP/1.1 dalam 16,5 detik); `sim:beban` lokal 1 × 50 dengan `--latensi-ms 300 --jitter-ms 50`: 21.924 gerak, 0 dikoreksi |
| AC-15 Layar kelas ditutup 60 detik | Lulus | `jaringan.uji.ts` |
| AC-16 Pemeriksa anggaran | Lulus | `beban/anggaran.test.ts`; langkah "Periksa anggaran ukuran" di "Jejak: uji" |
| AC-17 Build di bawah anggaran | Lulus | Tabel "Ukuran dan kinerja" |
| AC-18 Layar Kode lebih dulu | Lulus | `ukur-muat.mjs`: 1,20 detik pada CPU 4× (batas 2) dan 1,05 detik pada CPU normal (batas 1,2); `beban/penjadwal.test.ts`; uji JS-07 lulus |
| AC-19 Kiriman lobi | Lulus (D-5 a) | `sim:beban` lokal 1 × 50 dengan bot yang terus berjalan di lobi: 4,85 `dunia` per detik dan 2,84 MB per 15 menit; uji tunda per status; uji JS-07 lulus |
| AC-20 Layar kelas dimuat dinamis | Lulus | Potongan `LayarKelas` 7,94 KB; kode konsol awal 135,54 KB (sebelum JS-15 141,17 KB); layar kelas terbuka di `jaringan.uji.ts` dan `kelas.uji.ts` |
| AC-21 Banner versi konsol | Lulus | `kinerja.uji.ts`; `beban/versi.test.ts` |
| AC-22 Waktu pulang-pergi HP | Lulus | `protokol.test.ts`, `beban/rtt.test.ts`, `biaya.uji-server.ts`, `kinerja.uji.ts`; di Cloudflare, p95 per ruang terbaca di setiap run |
| AC-23 Versi protokol 3 ditolak | Lulus | Uji versi yang diperbarui ke 4 |
| AC-24 Dokumen | Lulus | Architecture 4, 6, 9, 11.3, 13 (termasuk 13.5), 14, 18; PRD 12, 14, 21, dan catatan keputusan; AGENTS 0, 5, 6, dan 7 butir 16; `PLAN.md` |
| AC-25 Semua pemeriksaan | Lulus | Bagian "Perintah yang dijalankan" |

## Perintah yang dijalankan

Pada kode final, sesudah semua perbaikan Test:

| Perintah | Hasil |
|---|---|
| `content:check:jejak` | 259 uji lulus |
| `test:jejak` | 84 berkas, 1.213 uji lulus |
| `test:jejak:server` | 11 berkas, 66 uji lulus (dalam tiga kelompok, karena batas 300 detik per perintah) |
| `test:e2e:jejak` | 14 berkas, 61 uji lulus. Dua uji yang peka beban mesin gagal sekali dan lulus saat diulang: jarak "Lari cepat" `skill.uji.ts` (rasio 1,37, lalu 1,56; batas 1,4) dan bingkai di atas 50 ms saat berjalan dengan CPU 6× `dunia.uji.ts` (1,26%, lalu 0%; batas 1%). Serah terima Build keliru menulis 63 uji |
| ESLint (`app/jejak-setara`, `server/jejak-setara`, `e2e/jejak-setara`, `scripts/jejak-setara`) | Bersih |
| `tsc --noEmit` | Bersih, sesudah satu kesalahan tipe di `beban/gabung.test.ts` dari perbaikan-8 diperbaiki di ZIP ini; "Jejak: uji" tidak menjalankan pemeriksaan tipe, jadi kesalahan itu tidak terlihat di sana |
| `build:pages` | 178 berkas identik byte dengan galeri |

## Ukuran dan kinerja

Anggaran ukuran (`anggaran.mjs`, gzip level 9, build final):

| Butir | Ukuran | Batas |
|---|---|---|
| Kode layar pemain | 139,57 KB | 200 KB |
| Kode konsol admin, awal | 135,54 KB (ditambah potongan layar kelas 7,94 KB saat dibuka) | 350 KB |
| Seluruh aset layar pemain | 242,36 KB (253 berkas) | 2 MB |
| Lembar ubin terbesar | 5,84 KB | 60 KB |
| Strip avatar atau tokoh terbesar | 0,68 KB | 6 KB |
| Efek suara pendek terbesar | 23,82 KB | 30 KB |
| `sfx_akhir.wav` | 140,53 KB | 160 KB |
| Kedua berkas peta JSON | 13,49 KB | 60 KB |

Waktu muat layar pemain (`ukur-muat.mjs`, median tiga kali, cara yang sama sebelum dan sesudah):

| Profil | Layar Kode siap, sebelum → sesudah | 95% gambar dunia termuat, sebelum → sesudah |
|---|---|---|
| 10 Mbps, 40 ms, CPU normal | 0,99 → 1,05 detik | 2,86 → 2,98 detik |
| 10 Mbps, 40 ms, CPU 4× lebih lambat | 4,25 → **1,20 detik** | 3,07 → 5,18 detik |
| 3 Mbps, 150 ms, CPU 4× lebih lambat | 3,04 → 2,33 detik | 8,21 → 8,51 detik |

Gambar dunia selesai lebih lambat di HP lambat, karena kini dimuat sesudah layar Kode tampil, paling banyak 6 sekaligus. Bergabung lewat `?kode=` menunggu gambar itu, sehingga uji ujung ke ujung kini menunggu layar nama sampai 20 detik.

Data lobi, `sim:beban` lokal 1 × 50 dengan bot yang terus berjalan di lobi:

| Pengaturan | `dunia` per pemain per detik | MB per 15 menit |
|---|---|---|
| Sebelum JS-15 (100 ms) | 11,85 | 5,88 |
| D-4 a (200 ms) | 5,75 | 3,67 |
| **D-5 a (300 ms, kerangka penuh 3 detik), final** | **4,85** | **2,84** |

## Beban

Uji beban jarak jauh lewat "Jejak: uji beban" (lingkungan uji Cloudflare), dijalankan pemilik proyek 23 November 2026, beserta `lokal-10x50`:

| Skenario | Hasil | Angka utama |
|---|---|---|
| `singkat` (1 × 50, 2 menit) | Lulus | 0 putus, 0 ditolak, 50 dari 50 `selesai`, 1,81 MB, kenaikan 44 ms, 3.129 permintaan (perkiraan 3.132) |
| `s1` (1 × 50, 15 menit), run keenam | Lulus | 0 putus, 0 sambung ulang, 0 ditolak, koreksi 0,02%, 50 dari 50, 1,11 MB, kenaikan bersih 42 ms (mentah 53, jeda event loop 11), 21.506 permintaan (perkiraan 20.097) |
| `s2` (10 × 50 serentak), run pertama | Lulus (D-10 a) | 10 ruang `main` bersamaan 15 menit, 500 peserta, 0 tidak pulih, 0 ditolak, koreksi 0,021%, 1,11 MB, 218.765 permintaan; informasi: 40 sambung ulang (1006), 498 dari 500 `selesai` (sebelum skrip menunggu bot yang menyambung ulang), kenaikan bersih 87 ms |
| `s2`, run kedua | Lulus (D-10 a) | Sama kuatnya: 500 dari 500 `selesai`, 500 peserta, 0 tidak pulih, 213.624 permintaan; informasi: 300 sambung ulang (294 × 1006, 6 × 1008), 405 ping tersendat (terlama 29,9 detik), koreksi 1,1%, 7 ditolak, kenaikan bersih sampai 512 ms di satu mesin. Mesin 3 (2 ruang) bersih total; mesin 5 menyumbang 222 dari 300 sambung ulang; 182 putus terjadi 4–5 menit sebelum ronde mulai |
| `s3` (1 × 100, batas aplikasi) | Lulus (D-10 a) | 0 putus, 0 sambung ulang, 0 ditolak, koreksi 0,33%, 100 dari 100 `selesai`, 100 peserta, 1,27 MB, 28.949 permintaan (perkiraan 24.602, +17,7%); informasi: kenaikan bersih 95 ms (mentah 106), 103 ping tersendat (terlama 14,1 detik), p95 menurut server 280 ms |
| `lokal-10x50` (Worker lokal di mesin GitHub) | Lulus | 0 putus, 0 ditolak, 0% koreksi, 500 dari 500, 10 × 50 peserta, 1,26 MB, p95 119 ms, terlama 196 ms, 0 ping tersendat |

- Beban yang sama dengan s2 berjalan bersih total di `lokal-10x50`, dan satu mesin s2 juga bersih total. Ini menunjukkan gejolak s2 berasal dari jalur jaringan mesin GitHub menuju Cloudflare, bukan dari server (D-10).
- Kenaikan waktu pulang-pergi di 100 pemain (95 ms) lebih besar daripada di 50 pemain (42 ms). Sebagian berasal dari jaringan; sebagian bisa jadi kerja tambahan server untuk 100 pemain di satu ruang. Data ini belum cukup untuk memisahkan keduanya.

**Biaya.** Semua run memakai sekitar 57% kuota permintaan Durable Object bulan ini (periode 23 Nov – 22 Des). Billable usage US$0,00. Batas pakai Workers 3 USD dan Durable Objects 5 USD, ditambah peringatan anggaran 3 USD, terpasang.

## Acuan batas pemain per ruang

Untuk rencana pemilik proyek: satu ruang dengan banyak pemain.

- **Sampai 50 pemain:** terbukti bersih di semua ambang, termasuk yang ketat.
- **Sampai 100 pemain** (batas aplikasi, `BATAS.pemainMaks`): tidak ada yang putus, tidak ada data yang hilang, dan semua pemain menerima hasil. Waktu pulang-pergi sedikit lebih tinggi daripada 50 pemain. Ruang di atas 50 pemain memakai dua titik per kejadian (paling banyak 6 kejadian per zona) dan 6 gerak per detik, dan mode nama nomor absen hanya sampai 50 pemain.
- **Satu jaringan sekolah aman:** pembatas mengizinkan 300 pemeriksaan kode dan 300 sambungan per menit dari satu alamat.
- Waktu pulang-pergi di atas diukur dari Amerika. Angka wifi sekolah di Bali, yang lebih dekat ke server Asia Pasifik, dibaca dari bagian "Pemakaian ronde ini" sesudah uji coba kelas.

## Penyimpangan dan keputusan yang diminta

1. **AC-11, ekspor CSV ruang 100 pemain di lingkungan uji tidak dijalankan.** Run s3 menghapus ruangnya, seperti bawaan P-8, dan alur kerja tidak menyediakan pilihan `--simpan-ruang`.
   - Bukti pengganti: uji server ekspor CSV (`hasil.uji-server.ts`); Build JS-11 mengukur ekspor 100 pemain × 64 kejadian sekitar 18 ms CPU; dan CPU Worker uji paling tinggi sekitar 48 ms dari batas 1.000 ms.
   - (a, saran) Diterima. Ekspor CSV diperiksa saat uji coba kelas pemilik proyek: sesudah ronde, unduh CSV dari halaman Hasil.
   - (b) Pilihan `simpan_ruang` ditambahkan ke alur kerja, lalu s3 diulang, dengan biaya sekitar 3% kuota bulanan.
2. **s2 dan s3 dinilai menurut D-10 a**, sudah diputuskan pemilik proyek 23 November 2026.
3. **Dua uji ujung ke ujung peka beban mesin** (bagian "Perintah yang dijalankan"). Keduanya lulus saat diulang. Saran untuk Plan berikutnya: jalankan keduanya terpisah dari berkas lain, atau longgarkan cara ukurnya.

## Catatan penerapan

Temuan selama Test, dan semuanya sudah diperbaiki di ZIP perbaikan yang sudah di-push, kecuali dua butir terakhir yang ada di ZIP ini:

- **Perbaikan-1, alat uji.** Tajuk `CF-Connecting-IP` tiruan membuat Cloudflare menolak permintaan dengan 403 (galat 1000). Sambungan pengukur saat sepi juga memakai satu tempat ruang dan membuat bot terakhir ditolak `RUANG_PENUH`.
- **Perbaikan-2, D-5 a.** Kiriman lobi 300 ms dengan kerangka penuh 3 detik, dan tunda tampilan lobi 320 ms.
- **Perbaikan-3, D-6 a.** Bot menyambung ulang seperti HP.
- **Perbaikan-4, D-7 a, server.** Cadangan lonjakan pesan per sambungan naik dari 40 menjadi 200. Percobaan proksi tersendat 6 detik: cadangan 40 memutus 23 dari 30 bot dengan 1008; cadangan 200 tidak memutus satu pun. Bot juga dibetulkan agar meniru HP: menyambung ulang sesudah 1008 dan melewati gerak saat `bufferedAmount > 0`. Ambang sambung ulang menjadi 5%.
- **Perbaikan-5, alat uji.** Layar kelas tiruan menyambung ulang seperti layar kelas konsol, dan `akhiri` dipastikan sampai. Run s1 keempat juga berhenti karena layar kelas ruang uji dibuka di peramban (kode 4001); pemilik proyek kini tahu untuk tidak membukanya selama run.
- **Perbaikan-6, D-9 a.** Kenaikan waktu pulang-pergi bersih (dikurangi jeda event loop mesin bot), dengan 60 ping saat sepi.
- **Perbaikan-7, alat uji.** Pembantu `d1()` uji server mencoba lagi saat SQLite lokal terkunci (`SQLITE_BUSY`), sesudah satu kegagalan uji masa simpan JS-11 di "Jejak: uji".
- **Perbaikan-8, alat uji.** Rincian per pekerjaan, per ruang, dan per menit di ringkasan, dan menunggu bot yang sedang menyambung ulang sebelum menghitung `selesai`.
- **ZIP ini:** kesalahan tipe di `beban/gabung.test.ts`, dan uji ujung ke ujung yang kini menunggu layar nama sampai 20 detik (akibat P-23).

## Tangkapan layar

- [konsol-versi-1280x720.png](JS-15/konsol-versi-1280x720.png): banner versi konsol.
- [konsol-pemakaian-1280x720.png](JS-15/konsol-pemakaian-1280x720.png): "Pemakaian ronde ini" dengan persen kuota bulanan Workers Paid dan waktu pulang-pergi HP.
- Tangkapan layar Cloudflare dari pemilik proyek (Errors by version, CPU Time, Billable usage, dan Spend limits) tidak disimpan di repositori, karena memuat alamat email akun dan repositorinya publik. Angkanya dicatat di laporan ini.

## Uji manual pemilik proyek

Belum dijalankan. Disarankan di lingkungan uji, atau saat uji coba kelas JS-16:

1. Wifi HP dimatikan 30 detik saat ronde, lalu dinyalakan lagi: pemain kembali dengan skor yang sama.
2. Konsol yang terbuka saat deploy: banner versi muncul sesudah tab kembali terlihat atau menu dipindah.
3. Layar Kode di HP pemilik proyek terasa langsung tampil.
4. "Pemakaian ronde ini" menampilkan waktu pulang-pergi HP. Ambil tangkapan layarnya sesudah ronde selesai.
5. Ekspor CSV dari halaman Hasil sesudah ronde dengan banyak pemain (penyimpangan 1).
