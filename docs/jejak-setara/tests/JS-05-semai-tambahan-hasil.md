# Hasil uji semai tambahan (lanjutan JS-05) — 23 November 2026

Spesifikasi: [`specs/JS-05-semai-tambahan.md`](../specs/JS-05-semai-tambahan.md), dengan Revisi 1. Salinan kerja berasal dari ZIP repositori `main` pemilik proyek, commit `38985d0` (23 November 2026). ZIP itu sudah memuat:

- Permintaan A-14, A-15 (beserta angka 16 di `bank-aturan.test.ts`), A-16, dan A-18 dari Sesi A;
- aset K-32 dan K-33 beserta A-17 dari Sesi C;
- kunci aset final di naskah (P-24).

Di atasnya ditambahkan berkas Build Sesi B. Lingkungan: Linux, Node 22.23.5, dan wrangler 4.92.0. Semua perintah dijalankan tanpa simulasi. Agen tidak pernah menjalankan `--remote` dan tidak menandai rujukan apa pun terverifikasi.

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 Berkas bank tambahan | Lulus | `server/jejak-setara/seed/bank-tambahan-1.json`: 20 rujukan, 24 kejadian, dan 2 paket, 97.938 byte. Uji `bank-tambahan.test.ts` memeriksa skema, format, dan urutan kunci P-7 |
| AC-2 Sama dengan naskah | Lulus | `naskah-tambahan-cocok.test.ts` (75 uji) mencocokkan isi kejadian per naskah, urutan pilihan, set tokoh, pustaka rujukan, dan angka "Pemeriksaan panjang" yang dihitung ulang. Bank yang dibuat ulang dari naskah di `main` sama persis dengan berkas di atas |
| AC-3 `periksaBank` gabungan | Lulus | Gabungan bank awal dan tambahan: 0 galat dan 0 peringatan, tanpa kode, id, atau nama paket kembar. Sebelum A-15 dan A-17 masuk, uji ini gagal karena peringatan "Tuli" dan tiga kunci aset yang belum ada |
| AC-4 Paket | Lulus | Teks kedua paket sesuai D-1. Paket lanjutan 24 berisi 3 kejadian per zona, dan Paket lengkap 40 berisi 5 per zona. Keduanya lolos `periksaPaketPeta`, dan `tempatkanKejadian` menempatkan semua kejadiannya untuk tiga benih ruang |
| AC-5 SQL | Lulus | 137 pernyataan, sama setiap kali dibuat, dengan total 128.391 byte. Pernyataan terpanjang 3.360 byte (batas 100.000). Tidak ada `BEGIN`, `COMMIT`, atau "terverifikasi" |
| AC-6 Skenario SQLite | Lulus | Keenam skenario P-22 lulus di `bank-tambahan.test.ts`, termasuk bentrokan ganda dan semai yang terputus di lima titik |
| AC-7 Status dan pesan | Lulus | Tabel nilai dan teks P-15 lulus, termasuk awalan `::warning title=Semai tambahan::` bila `GITHUB_ACTIONS` bernilai `true`. Pesan yang sama terlihat di semai lokal sungguhan (di bawah) |
| AC-8 Perilaku JS-05 | Lulus | `--sql` menghasilkan 73.724 byte, sama persis dengan `semai.mjs` di `main`. Cara pakai dan kode keluarnya juga sama persis. Uji bank awal lulus tanpa diubah Sesi B; satu-satunya perubahan adalah angka nama diri di `bank-aturan.test.ts`, yang diubah Sesi A bersama A-15. Bank tambahan yang tidak sah menghasilkan pesan dan kode 1 tanpa memanggil wrangler |
| AC-9 Pengurai naskah | Lulus | `naskah-cocok.test.ts` (63 uji) lulus tanpa diubah |
| AC-10 Perintah resmi | Lulus | `content:check:jejak`, `test:jejak`, `test:jejak:server`, dan `build:jejak` lulus. Rinciannya di bagian berikut |
| AC-11 Semai lokal sungguhan | Lulus | Basis data A: semai pertama menulis semuanya, dan semai kedua tidak mengubah satu baris pun (potret isi sama). Basis data B, yang diberi K-17 buatan sendiri: semai mencetak "ditunda" yang menyebut K-17 dan tidak menulis apa pun. Sesudah K-17 itu dihapus, semai berikutnya selesai |
| AC-12 Sesudah push | Lulus | Sesudah commit dan push, pemilik proyek menjalankan daftar periksa manual di bawah dan membalas "Diterima: semai tambahan" (23 November 2026). Artinya alur kerja hijau dan ketiga hal di konsol uji terlihat |
| AC-13 Batas berkas | Lulus | Berkas yang berubah terhadap `main` hanya yang ada di daftar berkas spesifikasi (lihat "Berkas yang diserahkan"). `bank-awal.json` tidak berubah |
| AC-14 Variabel server uji lokal | Lulus | Uji perintah P-17a lulus. Di basis data C, semai dengan `JEJAK_SEMAI_TANPA_TAMBAHAN=1` menghasilkan 23 rujukan, 16 kejadian, dan 1 paket, lalu semai tanpa variabel di folder yang sama menulis kejadian tambahan. Server uji lokal di `main` memasang variabel ini (A-18), dan uji `kerangka.test.ts` dari Sesi A memastikannya |

## Perintah yang dijalankan dan hasilnya

| Perintah | Hasil |
|---|---|
| `content:check:jejak` | 12 berkas, 386 uji lulus (9 detik) |
| `test:jejak` | 80 berkas, 1.306 uji lulus (21 detik) |
| `test:jejak:server` | 11 berkas, 65 uji lulus (262 detik), tanpa variabel apa pun di lingkungan agen |
| `build:jejak` | Berhasil |
| ESLint untuk berkas kode yang berubah | Bersih |
| `tsc --noEmit`, seluruh repositori | Lulus, 0 galat (Temuan 5) |

Uji konten per berkas:

| Berkas | Uji | Keterangan |
|---|---|---|
| `naskah-tambahan-cocok.test.ts` | 75 | Baru |
| `bank-tambahan.test.ts` | 52 | Baru |
| `naskah-cocok.test.ts` | 63 | Tidak diubah |
| `bank-semai.test.ts` | 47 | Tidak diubah |
| `bank-aturan.test.ts` | 57 | Hanya angka nama diri 16 (Sesi A, A-15) |
| `aset-manifest`, `bank-aset`, `bank-peta`, `bank-protokol`, `bank-skema`, `peta-aturan`, `peta-berkas` | 92 | Tidak diubah |

### Semai lokal sungguhan

Perintahnya `node scripts/jejak-setara/semai.mjs --jalankan -- --local --persist-to <folder sementara>`, sesudah migrasi D1 lokal. Setiap basis data memakai folder sementara baru, yang dihapus sesudahnya.

```
A. Basis data baru
   semai pertama : Semai selesai. Bank awal (23 rujukan, 16 kejadian, 1 paket) hanya ditulis bila basis data ini belum pernah disemai.
                   Semai tambahan selesai. Kejadian tambahan (20 rujukan, 24 kejadian, 2 paket) sudah ada di basis data ini; baris yang sudah ada tidak pernah ditimpa.
                   rujukan 43 (semuanya belum), kejadian 40, versi 40, paket 3 (16, 24, dan 40 kejadian), penanda semai_bank_awal dan semai_tambahan_1
                   K-17 sampai K-40 berstatus tinjau (Siap tinjau); JR-24 sampai JR-43 belum, tanpa kode Sehari
   semai kedua   : pesan yang sama, kode 0, potret isi sama persis (tidak ada yang berubah)

B. Basis data berisi bank awal dan K-17 buatan sendiri
   semai         : Semai tambahan ditunda: K-17 sudah ada di basis data ini. Hapus di konsol bila itu hanya percobaan; deploy berikutnya akan mencoba lagi.
                   kode 0, potret isi sama persis (tidak ada yang ditulis)
   GITHUB_ACTIONS=true : ::warning title=Semai tambahan::Semai tambahan ditunda: K-17 sudah ada di basis data ini. …
   K-17 dihapus, lalu semai : Semai tambahan selesai. … (43 rujukan, 40 kejadian, 3 paket)

C. Variabel server uji lokal (AC-14)
   JEJAK_SEMAI_TANPA_TAMBAHAN=1 : Semai tambahan dilewati (JEJAK_SEMAI_TANPA_TAMBAHAN=1).  23 rujukan, 16 kejadian, 1 paket
   tanpa variabel               : Semai tambahan selesai. …  43 rujukan, 40 kejadian, 3 paket
```

### Riwayat uji selama Build

| Tanggal | Dasar | Hasil |
|---|---|---|
| 22 Nov 2026 | ZIP `main` 21 Nov | `test:jejak:server` gagal di 3 dari 61 uji, karena server uji lokal ikut menyemai kejadian tambahan. Spesifikasi kembali ke Specify (Revisi 1: P-17a dan A-18). Dengan variabel itu di lingkungan, 61 dari 61 lulus |
| 23 Nov 2026, dini hari | ZIP `main` sesudah JS-13, JS-14, dan aset Sesi C | `content:check:jejak` dan `test:jejak` masing-masing gagal 1 uji, yaitu peringatan "Tuli" yang menunggu A-15. Tanpa A-18, `test:jejak:server` gagal di 2 dari 65 uji. Dengan A-15 dan A-18 disimulasikan, semuanya lulus |
| 23 Nov 2026 | ZIP `main` commit `38985d0` | Semua lulus tanpa simulasi (laporan ini) |

## Simulasi beban (bila wajib)

Tidak wajib, karena protokol, inti ruang, dan kiriman ruang ke D1 tidak berubah (AGENTS 4.4 butir 6). Sesuai rencana uji spesifikasi, `test:e2e:jejak` juga tidak dijalankan: tidak ada layar yang berubah, dan server uji lokalnya tetap menyemai bank awal saja (A-18).

## Anggaran ukuran dan kinerja

- Tidak ada kode halaman, aset, protokol, atau Worker yang berubah. Berkas data baru tidak diimpor halaman maupun Worker: tidak ada impor `seed/` di `app/jejak-setara` (selain uji), `server/jejak-setara/src`, dan `web/jejak-setara`, dan hasil `build:jejak` tidak memuat "K-17", "JR-24", atau "bank-tambahan". Anggaran Architecture 11.3 dan sasaran 13.1 tidak tersentuh.
- Isi D1 bertambah 20 rujukan, 24 kejadian, 24 versi, 2 paket, dan 64 baris isi paket. Dasarnya berkas data 97.938 byte, dan SQL-nya 128.391 byte dalam 137 pernyataan.

## Daftar periksa manual (pemilik proyek, AC-12)

1. Sesudah push, buka tab **Actions** dan pastikan "Jejak: uji" hijau.
2. Buka hasil jalannya. Di ringkasan, lihat apakah ada peringatan "Semai tambahan".
3. Masuk ke konsol uji dengan akun Peninjau atau Admin, lalu lihat tanpa mengubah apa pun:
   - menu **Kejadian**: K-17 sampai K-40 ada dan berstatus Siap tinjau;
   - menu **Rujukan**: JR-24 sampai JR-43 ada dan belum diverifikasi;
   - menu **Paket**: Paket lanjutan 24 dan Paket lengkap 40 ada.
4. Bila ringkasan memuat peringatan "Semai tambahan ditunda", kirim tangkapan layarnya ke Sesi B. Peringatan itu menyebut kode yang bentrok.

## Temuan

1. **Server uji lokal (Revisi 1).** Server uji lokal menyemai D1-nya dengan `semai.mjs`, jadi tanpa P-17a dan A-18 uji server ikut mendapat kejadian tambahan. Kini sudah tertangani, dan uji `kerangka.test.ts` dari Sesi A menjaga variabel itu tetap ada di server uji lokal dan tidak ada di `db:semai:lokal` maupun alur kerja.
2. **Angka nama diri.** A-15 memerlukan perubahan angka 15 menjadi 16 di `bank-aturan.test.ts`. Sesi A mengubahnya di commit yang sama, atas izin Sesi B.
3. **Peringatan zona padat A-14.** Peringatan baru di penyusun paket konsol muncul bila kejadian sebuah zona lebih dari separuh titiknya. Setiap zona peta punya 12 titik. Diperiksa dengan `zonaPadatRuangBesar`: Paket inti 16, Paket lanjutan 24, dan Paket lengkap 40 tidak memicu peringatan itu.
4. **Sesudah semai.** K-17 sampai K-40 baru bisa dipakai di ruang biasa sesudah Peninjau memverifikasi JR-24 sampai JR-43 dan menerbitkan kejadiannya. Langkahnya ada di `naskah/STATUS.md`, bagian "Sesudah semai: pekerjaan di konsol". Paket inti 16 tidak terpengaruh.
5. **Pemeriksaan tipe.** `tsc --noEmit` mula-mula menemukan 7 galat tipe di `bank-tambahan.test.ts`. Penyebabnya: parameter lingkungan `barisCetakStatus` dan `tambahanDilewati` di `semai.mjs` terbaca bertipe `ProcessEnv`, yang menolak objek biasa. Kedua fungsi diberi tipe JSDoc `Record<string, string | undefined>`. Perilakunya tidak berubah, dan semua perintah di atas dijalankan ulang sesudahnya. `tsc` bukan perintah resmi, tetapi Sesi A memakainya.

## Berkas yang diserahkan

Baru: `server/jejak-setara/seed/bank-tambahan-1.json`, `app/jejak-setara/__tests__/konten/bank-tambahan.test.ts`, `app/jejak-setara/__tests__/konten/naskah-tambahan-cocok.test.ts`, dan laporan ini.

Diubah: `scripts/jejak-setara/semai.mjs`, `app/jejak-setara/__tests__/konten/naskah-urai.ts`, `docs/jejak-setara/specs/JS-05-semai-tambahan.md`, dan `docs/jejak-setara/naskah/STATUS.md`. Kunci final di `NASKAH-TAMBAHAN.md`, `K-32.md`, dan `K-33.md` (P-24) sudah masuk `main` lebih dulu, lewat `kunci-final-semai-tambahan.zip`.

## Keputusan: Lulus

AC-1 sampai AC-14 lulus. AC-12 dikonfirmasi pemilik proyek 23 November 2026 dengan balasan "Diterima: semai tambahan".
