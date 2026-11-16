# Laporan uji JS-12 — Bank kejadian di konsol

| | |
|---|---|
| Fitur | JS-12 Bank kejadian di konsol |
| Spesifikasi | [JS-12-bank.md](../specs/JS-12-bank.md), disetujui 15 November 2026 (D-1 sampai D-4 = a) |
| Tanggal | 16 November 2026 |
| Lingkungan | Mesin agen (mode ZIP): Node 22.23.4, pnpm 11.25.0, Wrangler 4.92.0, Chromium untuk Playwright, 2 vCPU |
| Keputusan | **Lulus**: AC-8 diterima pemilik proyek (16 Nov 2026, kenaikan 0,85 KB) |

## Kriteria penerimaan

| Kriteria | Status | Bukti |
|---|---|---|
| AC-1 Izin | Lulus | `__tests__/bank/aturan-bank.test.ts` (tabel izin dan aksi), `api-bank.test.ts` (403 guru pada bank awal dan untuk terbitkan, arsipkan, ubah rujukan, paket; verifikasi hanya Peninjau), `bank.uji-server.ts` |
| AC-2 Menu dan rute | Lulus | `__tests__/akun/rute.test.ts`; `konsol.uji.ts` (menu admin dan guru); `bank.uji.ts` |
| AC-3 Daftar | Lulus | `bank.uji.ts` (saringan status, kartu di 360 × 640 tanpa meluap); `api-bank.test.ts` (tanda perubahan, rujukan belum, pemilik) |
| AC-4 Penyunting | Lulus | `bank.uji.ts` (bagian, hitungan karakter, hanya baca); gambar `tests/JS-12/konsol-penyunting-*.png` |
| AC-5 Kejadian baru | Lulus | `api-bank.test.ts` (K-04 milik guru; dua pembuatan serentak mendapat kode berbeda); `bank.uji-server.ts` |
| AC-6 Validasi | Lulus | 27 kode temuan berkalimat (`aturan-bank.test.ts`); galat judul tampil di kolomnya dan menahan Simpan (`bank.uji.ts`); server menolak `TEMUAN` dengan letak kolom (`api-bank.test.ts`) |
| AC-7 Simpan | Lulus | `api-bank.test.ts` (409 `SUDAH_DIUBAH` tanpa menimpa); `bank.uji.ts` ("Tersimpan."); peringatan perubahan belum tersimpan di penyunting |
| AC-8 Pratinjau | Lulus dengan catatan | `bank.uji.ts` (bingkai tegak dan mendatar, pita, isi berubah saat mengetik); `pratinjau.test.ts` (pesan asal sama, urutan asli, poin, kartu). Tambahan kode layar pemain 0,85 KB gzip, di atas perkiraan 0,4 KB |
| AC-9 Status dan aksi | Lulus | `aturan-bank.test.ts`; `api-bank.test.ts` (ajukan, kembalikan, terbitkan, arsipkan keluar paket, pulihkan, hapus); syarat rujukan diperiksa dalam pernyataan penerbitan |
| AC-10 Versi | Lulus | `api-bank.test.ts` (versi 1 dan 2, riwayat, `versi/1` tetap berisi judul lama); `bank.uji-server.ts` |
| AC-11 Pustaka | Lulus | `api-bank.test.ts` (tambah oleh guru, ubah teks membatalkan verifikasi, hapus hanya yang tidak dipakai); `bank.uji.ts` (tanpa tombol verifikasi untuk admin bukan Peninjau) |
| AC-12 Paket | Lulus | `api-bank.test.ts` (urutan, kejadian draf ditolak, nama unik, arsip keluar paket); `bank.uji.ts` |
| AC-13 Ruang biasa | Lulus | `bank.uji-server.ts`: paket dari kejadian terbit siap, ruang biasa dibuat |
| AC-14 Audit | Lulus | `api-bank.test.ts` dan `bank.uji-server.ts`: satu baris per aksi, tanpa isi kejadian |
| AC-15 Tampilan | Lulus | `bank.uji.ts`: 1280 × 720 dan 360 × 640 tanpa meluap; penyunting dan pratinjau berdampingan di 1280 × 720 |
| AC-16 Teks | Lulus | `kerangka.test.ts` membaca tabel teks spesifikasi JS-12 |
| AC-17 Tanpa regresi | Lulus | Semua perintah di bawah; konsol 116,34 KB gzip (batas 350 KB); galeri identik |

## Perintah resmi

| Perintah | Hasil |
|---|---|
| `test:jejak` | 55 berkas, 950 uji lulus |
| `test:jejak:server` | 7 berkas, 55 uji lulus, termasuk `bank.uji-server.ts` |
| `content:check:jejak` | 10 berkas, 254 uji lulus |
| `test:e2e:jejak` (per kelompok) | bank 1, konsol 13, kerangka 14, gabung 5, kejadian 4, kelas 1, dunia 5 (termasuk kinerja 40 pemain): 43 lulus |
| `build:jejak` | Berhasil; Worker 374,51 KB (92,07 KB gzip) |
| `build:pages` | 178 berkas, identik byte |
| `tsc --noEmit` dan ESLint | 0 galat, 0 masalah |

## Ukuran kode (gzip)

| Bagian | Sebelum JS-12 | Sesudah | Selisih |
|---|---|---|---|
| Layar pemain (`/`) | 122,72 KB | 123,57 KB | +0,85 KB (mode pratinjau; perkiraan spesifikasi 0,4 KB) |
| Konsol (`/admin/`) | 98,78 KB | 116,34 KB | +17,6 KB (aturan validasi konten, halaman bank, gambar kecil tokoh); batas 350 KB |
| Worker | 77,38 KB | 92,07 KB | Validasi konten berjalan di server |

Percobaan selama Build: memuat mode pratinjau sebagai potongan terpisah tetap menambah 0,79 KB, karena pemuat potongan Vite ikut masuk layar pemain; merampingkan kode pratinjau hanya mengurangi sedikit.

## Tangkapan layar

`docs/jejak-setara/tests/JS-12/`: `konsol-kejadian-1280x720.png`, `konsol-penyunting-1280x720.png`, `konsol-pratinjau-mendatar.png`, `konsol-rujukan-1280x720.png`, `konsol-paket-1280x720.png`, `konsol-kejadian-360x640.png`, `konsol-penyunting-360x640.png`.

## Pemeriksaan manual

- [x] Tampilan penyunting dan pratinjau diperiksa dari tangkapan layar (dialog lembar terbaca di 360 dan 731 piksel).
- [x] Sesudah push (16 Nov 2026): konsol lingkungan uji menampilkan menu dan halaman JS-12.
- [x] Penyunting dan pratinjau di lingkungan uji (pemilik proyek, 16 Nov 2026): judul yang diketik langsung tampil di pratinjau.
- [x] Verifikasi rujukan dan penerbitan (pemilik proyek, 16 Nov 2026): 21 dari 23 rujukan diverifikasi akun YAN; 16 kejadian Paket inti 16 terbit; dialog Ruang baru tidak lagi menyatakan paket belum siap.

## Temuan

1. Tajuk `frame-ancestors 'none'` melarang bingkai pratinjau; diubah menjadi `'self'` (situs lain tetap tidak bisa membingkai).
2. Dialog berbentuk panel terpotong di bingkai sempit; pratinjau memakai bentuk lembar seperti di HP.
3. Saringan daftar meluap 2 piksel di 360 piksel; diperbaiki.
4. Jumlah kode temuan 27, bukan 28 (Catatan Build spesifikasi).

## Keputusan

Semua kriteria lulus kecuali catatan AC-8: kode layar pemain naik 0,85 KB gzip untuk mode pratinjau. Pilihan: (a, saran) terima, karena pratinjau memakai dialog layar pemain yang sungguhan sehingga tampilannya sama dengan di HP; (b) ganti dengan pratinjau tiruan di konsol, tanpa kenaikan di layar pemain, tetapi tampilannya bisa berbeda dari HP.

**Keputusan pemilik proyek (16 Nov 2026):** AC-8 (a), kenaikan 0,85 KB diterima.
