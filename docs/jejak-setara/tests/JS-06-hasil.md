# JS-06: Hasil uji

| | |
|---|---|
| Tanggal | 8 November 2026 |
| Commit | Belum ada. Diuji pada salinan ZIP `main` 7 November 2026 ditambah berkas Gerbang 1, Gerbang 2, dan Build JS-06 |
| Spesifikasi | [JS-06-peta.md](../specs/JS-06-peta.md) |
| Dikerjakan | Sesi C (aset dan peta) |
| Ringkasan | **Lulus** |

## Lingkungan

Linux, Node 22.23.4, pnpm 11.25.0 (lewat `npx`), Python 3.12.3, Pillow 13.0.0, Vitest 5.0.4, dan Chromium 1243 lewat `JEJAK_CHROMIUM`. Dependensi dipasang dengan `pnpm install --frozen-lockfile` dari `pnpm-lock.yaml` di repositori, tanpa mengubah berkas kunci.

## Kriteria penerimaan

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 Sumber | Lulus | `kampung.txt` 100 × 160 karakter legenda; `objek.json` sah; bahan bertetangga 0 pelanggaran; lapangan sekolah 11 × 15 dan lapangan taman 19 × 9 berlebar ganjil; pagar tanpa cabang; tidak ada benda kejadian |
| AC-2 `kampung.json` | Lulus | Lolos `bacaPeta` resmi; 160 × 100; delapan zona bernama PRD menutup seluruh peta tanpa tumpang tindih; `ubin` 0 sampai 7; `gerbang-lobi` tercatat `gerbang_buka` |
| AC-3 `kampung_gambar.json` | Lulus | Kunci tepat; `daftar` 115 nomor ubin ditambah `null`; ketiga lapisan terurai `uraiRle` dengan nomor di rentang P-21; sidik sumber cocok |
| AC-4 Determinisme | Lulus | Dua kali `peta:build` menghasilkan SHA-256 yang sama untuk kedua berkas; `build_peta.py --periksa` lulus |
| AC-5 Keterjangkauan dan lobi | Lulus | Tepi peta padat; semua titik, kotak, dan halte terjangkau; dengan gerbang ditutup, pemain hanya bergerak di 475 sel halaman lobi |
| AC-6 Titik kejadian | Lulus | 96 titik (12 per zona), ruang 3 × 3 kosong, jarak antartitik sedikitnya 6 ubin, sedikitnya 7 ubin dari gerbang, tidak ada di lobi |
| AC-7 Kotak dan halte | Lulus | 24 kotak (3 per zona, isi menurut PRD 8.5); 4 halte (Z3 dua, Z7 satu, Z8 satu), masing-masing paling jauh 2 ubin dari bangunan halte |
| AC-8 Lebar jalan | Lulus | 0 sel terjangkau yang lebih sempit dari 2 ubin |
| AC-9 Penanda | Lulus | 100% dari 13.406 posisi terjangkau melihat sedikitnya satu objek penanda |
| AC-10 Objek | Lulus | 887 objek dari 58 jenis, semuanya punya sprite yang tercatat Disetujui di `CREDITS.md`; jejak kaki di dalam peta dan tidak tumpang tindih; tidak ada ubin padat di air kecuali jembatan |
| AC-11 Ukuran | Lulus | `kampung.json` 74.392 B (9.122 B gzip) dan `kampung_gambar.json` 53.433 B (4.727 B gzip); jumlah 13,5 KB gzip dari 60 KB |
| AC-12 Pratinjau | Lulus | Semua berkas P-30 dibuat; titik tinjau dilewati dengan balasan `Setuju: peta` (8 Nov 2026), tanpa perubahan |
| AC-13 Uji | Lulus | `content:check:jejak` menjalankan 25 uji peta dan lulus; `test:jejak` 319 uji lulus (294 lama ditambah 25 baru); 12 dari 12 salinan rusak ditolak |
| AC-14 Lainnya tidak berubah | Lulus | `build:jejak` dan `test:e2e:jejak` (18 uji) lulus; `build:pages` menghasilkan 178 berkas `dist-pages/` yang identik byte; perubahan hanya di berkas spesifikasi |
| AC-15 Dokumen | Lulus | `Daftar_Aset.md` diperbarui (status, riwayat, Permintaan C-12); laporan ini ditulis |
| Daftar periksa manual (AGENTS 9) | Tidak berlaku | Peta baru bisa dimainkan sesudah JS-07; penilaian visual dilakukan pemilik proyek di titik tinjau |
| Simulasi beban | Tidak berlaku | `test:jejak:server` dan `sim:beban` masih "Belum tersedia" (dibuat di JS-03) |

## Perintah yang dijalankan

| Perintah | Hasil |
|---|---|
| `npx pnpm@11.25.0 install --frozen-lockfile` | Selesai |
| `npx pnpm@11.25.0 peta:build` (dua kali) | Semua pemeriksaan peta lulus; satu peringatan kantong tertutup; hasil identik byte |
| `python scripts/jejak-setara/peta/build_peta.py --periksa` | Lulus, kode 0 |
| `npx pnpm@11.25.0 content:check:jejak` | 2 berkas, 25 uji lulus |
| `npx pnpm@11.25.0 test:jejak` | 9 berkas, 319 uji lulus |
| Uji 12 salinan rusak (tabel berikut) | 12 ditolak, lalu 25 uji lulus lagi sesudah dipulihkan |
| `npx pnpm@11.25.0 build:jejak` | Lulus |
| `npx pnpm@11.25.0 test:e2e:jejak` dengan `JEJAK_CHROMIUM` | 18 uji lulus |
| `npx pnpm@11.25.0 exec tsc --noEmit -p tsconfig.json --incremental false` | 0 galat di seluruh repositori |
| `npx pnpm@11.25.0 exec eslint app/jejak-setara/__tests__/konten --max-warnings 0` | 0 masalah |
| `npx pnpm@11.25.0 build:pages` dan SHA-256 ke-178 berkas `dist-pages/` | Identik byte dengan `main` |
| `git status` dan `git diff --name-status` | Hanya berkas di bagian "Berkas yang dibuat dan diubah" |

## Uji salinan rusak (AC-13)

Setiap salinan dirusak satu hal saja, lalu diuji dengan `vitest run` pada folder `__tests__/konten/`, kemudian dipulihkan.

| Kerusakan | Uji yang gagal |
|---|---|
| 1. Jembatan tidak bisa dilewati | Keterjangkauan titik, kotak, dan halte |
| 2. Titik dipindah ke halaman lobi | Lobi tertutup; letak titik |
| 3. Pohon di ruang 3 × 3 titik | Letak titik; urutan objek |
| 4. Bukaan gerbang dipersempit | Titik muncul dan sel gerbang; lebar jalan; gerbang tercatat terbuka |
| 5. Penanda di Z8 dihapus | Keterlihatan penanda; halte |
| 6. `kampung.txt` diubah tanpa `peta:build` | Sidik sumber |
| 7. Isi kotak salah | Kotak per zona |
| 8. Halte dipindah jauh dari bangunan halte | Halte |
| 9. Tembok lobi dibuka | Lobi tertutup; lebar jalan |
| 10. Lapisan tanah berisi kosong | Rentang lapisan gambar |
| 11. Kode bahan di luar 0 sampai 7 | Kode bahan |
| 12. Zona Z5 tinggal 11 titik | Jumlah titik per zona |

## Angka peta

| Hal | Nilai |
|---|---|
| Objek | 887 dari 58 jenis: 504 tertulis, 192 ruas pagar, 191 hasil sebar |
| Nomor ubin yang dipakai | 115 (tanah 82, tumpang 23, bayangan 10) |
| Sel bebas dan terjangkau | 13.410 bebas, 13.406 terjangkau |
| Waktu tempuh | 23,3 detik berjalan dari gerbang lobi ke titik kejadian terjauh |
| Pratinjau | 18 berkas `peta_*.png`, sekitar 1,6 MB di `docs/jejak-setara/preview/` (tidak terkirim ke pemain) |

## Temuan

1. Satu peringatan tetap ada sesuai D-4: kantong 4 sel di bawah atap rumah Nara yang berpagar tidak terjangkau. Kantong ini tidak memengaruhi permainan.
2. Titik kejadian dan kotak disusun bertema per zona dengan alat bantu di luar repositori, lalu dibekukan sebagai angka di `objek.json` (P-13). `build_peta.py` tidak memilih titik sendiri.
3. Jumlah `sebar` disesuaikan dengan yang benar-benar tertaruh, sehingga bangun tidak memunculkan peringatan kekurangan.
4. Pratinjau HP dan laptop memakai tiruan HUD sederhana dari ikon yang sudah disetujui. Tata letak HUD final tetap bagian JS-07.
5. Pemeriksaan galeri pertama menemukan bahwa id pendek titik halte (pola huruf h, tanda hubung, dan angka) terbaca Tailwind sebagai kelas tinggi, sehingga CSS galeri berubah. Id diganti menjadi `halte-{n}` (spesifikasi B-8), lalu galeri kembali identik byte.
6. Permintaan C-9, C-10, dan C-11 masih menunggu Sesi A. Ketiganya tidak menghalangi JS-06, tetapi C-9 dan C-10 perlu dibaca sebelum JS-03 dan JS-07 memakai peta. Permintaan C-12 meminta baris JS-06 di `PLAN.md` diubah menjadi Selesai.

## Keputusan

**Lulus.** JS-06 selesai dan siap dipakai JS-03 (server memuat `kampung.json`) dan JS-07 (layar pemain memuat kedua berkas).
