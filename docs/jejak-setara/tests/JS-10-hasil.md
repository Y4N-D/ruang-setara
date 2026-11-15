# Laporan uji JS-10 — Layar kelas

| | |
|---|---|
| Fitur | JS-10 Layar kelas |
| Spesifikasi | [JS-10-kelas.md](../specs/JS-10-kelas.md), disetujui 14 November 2026 (D-1 sampai D-4 = a) |
| Tanggal | 14 November 2026 |
| Lingkungan | Mesin agen (mode ZIP): Node 22.23.4, pnpm 11.25.0, Wrangler 4.92.0, Chromium untuk Playwright, 2 vCPU |
| Keputusan | **Lulus** di lingkungan agen. Langkah pemilik proyek di lingkungan uji (bagian "Pemeriksaan manual") dijalankan sesudah push |

## Kriteria penerimaan

| Kriteria | Status | Bukti |
|---|---|---|
| AC-1 Rute dan menu | Lulus | `__tests__/akun/rute.test.ts` (rute dengan id, pengalihan, menu per peran); `kelas.uji.ts` (menu Ruang, tab layar kelas); `konsol.uji.ts` (menu dan urutan Tab) |
| AC-2 Dialog ruang baru | Lulus | `inti/ruang.ts` diuji lewat uji server dan API; `kelas.uji.ts`: galat label, nomor absen nonaktif di atas 50 pemain, kotak ruang uji terkunci dengan penjelasan, berhasil membuka detail ruang |
| AC-3 Kesiapan paket | Lulus | `__tests__/kelas/api-ruang.test.ts` (terbit dan terverifikasi, rujukan `belum`, kejadian draf, arsip tidak dihitung, `PAKET_BELUM_SIAP`); `kelas.uji-server.ts` (Paket inti 16 belum siap) |
| AC-4 Batas ruang | Lulus | `api-ruang.test.ts` (batas 2, dua permintaan serentak dengan batas 1 menghasilkan tepat satu 201, nilai tidak sah dianggap 3); `kelas.uji-server.ts` (guru kedua kalinya `RUANG_MASIH_ADA` beserta kodenya) |
| AC-5 Pembuatan | Lulus | `ruang.uji-server.ts` (baris D1); `api-ruang.test.ts` (isi `/inisialisasi`, inisialisasi gagal menandai ruang ditutup) |
| AC-6 Daftar ruang | Lulus | `kelas.uji-server.ts` (daftar admin dan guru); `kelas.uji.ts` (tabel 1280 × 720 dan kartu di HP 360 × 640) |
| AC-7 Detail dan kelola | Lulus | `kelas.uji-server.ts` (detail langsung, kunci, keluarkan, tutup hanya di lobi, selesai, dan pembahasan; ruang guru lain 404); `kelas.uji.ts` (keluarkan dengan konfirmasi dari detail ruang) |
| AC-8 Dasbor | Lulus | `kelas.uji-server.ts` (paling banyak 5 ruang dan jumlah seluruhnya); `api-akun.test.ts` |
| AC-9 Tiket | Lulus | `__tests__/kelas/tiket.test.ts`; `kerangka.test.ts` (tanpa Upgrade 426, Origin asing 403, tiket tidak sah 403, id bukan UUID 404); `kelas.uji-server.ts` (tiket sekali pakai); `api-ruang.test.ts` (tanpa `KUNCI_TIKET` 503) |
| AC-10 Satu layar kelas | Lulus | `kelas.uji-server.ts` (sambungan kedua menutup yang pertama dengan 4001; ruang ditutup 4000) |
| AC-11 Menyambung ulang | Lulus | `__tests__/kelas/tampilan-kelas.test.ts` (jeda 1, 2, 4, 8, 15 detik; kode berhenti; batas 10 menit) |
| AC-12 Kontrol | Lulus | `inti-kelas.test.ts`; `kelas.uji.ts` (Spasi, T, A dengan konfirmasi, L; pintasan diabaikan saat dialog terbuka) |
| AC-13 Protokol | Lulus | `protokol.test.ts` (skema kelas baru, papan 10 besar); `inti-kelas.test.ts` (papan hanya saat berubah, dunia_kelas setiap putaran ke-5, tidak saat jeda); uji protokol pemain JS-02 sampai JS-08 tetap lulus |
| AC-14 Pembahasan | Lulus | `inti-kelas.test.ts` (sebaran menurut urutan asli, pemain yang dikeluarkan tidak dihitung); `kelas.uji.ts` (1 pemain menjawab, 100% pada pilihannya, navigasi `→`) |
| AC-15 Lobi | Lulus | `kelas.uji.ts`; `tampilan-kelas.test.ts` (40 nama lalu "+n lainnya") |
| AC-16 Saat bermain dan jeda | Lulus | `kelas.uji.ts` (hitung mundur, sisa waktu, papan dengan ✓1, kemajuan 1%, lapisan jeda) |
| AC-17 Podium | Lulus | `kelas.uji.ts`; `tampilan-kelas.test.ts` (urutan 2–1–3, kurang dari tiga pemain, 4–10) |
| AC-18 Empat ukuran | Lulus | `kelas.uji.ts`: lobi, saat bermain, jeda, podium, dan pembahasan di 1024 × 768, 1280 × 720, dan 1920 × 1080 tanpa luapan (isi kartu pembahasan bank awal muat tanpa digulir); halaman Ruang di 1280 × 720 dan 360 × 640 tanpa gulir menyamping |
| AC-19 Aksesibilitas | Lulus dengan catatan | Tombol berlabel, cincin fokus 3 px, `aria-live` untuk status dan kunci, label pembaca layar untuk peta, pemain terputus, dan jumlah selesai; tingkat dengan ikon dan tulisan. Pemeriksaan dengan pembaca layar sungguhan belum dilakukan |
| AC-20 Pensiun ruang coba | Lulus | `kerangka.test.ts` (rute lama 404 di semua lingkungan, kait baru hanya lokal, kedua alur kerja tidak ada); seluruh uji JS-03, JS-07, dan JS-08 lulus dengan ruang dari `POST /api/ruang` |
| AC-21 Izin | Lulus | `izin.test.ts`; `kelas.uji-server.ts` (guru tanpa kepemilikan 404 untuk detail dan tiket) |
| AC-22 Konfigurasi | Lulus | `kerangka.test.ts` (`wrangler.jsonc`, `KUNCI_TIKET` di "Siapkan kunci Worker"); `wrangler deploy --dry-run` uji: `RUANG_AKTIF_MAKS` = `3` |
| AC-23 Ukuran kode | Lulus | Kode layar pemain 122,13 KB gzip (semula 121,65 KB, naik 0,48 KB), CSS layar pemain 5,60 KB (naik 0,01 KB); konsol 98,00 KB gzip; uji aturan impor kode JS-10 |
| AC-24 Beban | Lulus | Bagian "Simulasi beban" |
| AC-25 Teks | Lulus | `kerangka.test.ts` membaca tabel teks spesifikasi JS-10 dan membandingkannya dengan `TEKS_KONSOL` |
| AC-26 Galeri | Lulus | `build:pages`: 178 berkas, identik byte dengan `main` sebelum Build |

## Perintah resmi

| Perintah | Hasil |
|---|---|
| `content:check:jejak` | 10 berkas, 254 uji lulus |
| `test:jejak` | 49 berkas, 911 uji lulus |
| `test:jejak:server` | 5 berkas, 52 uji lulus (228 detik), termasuk `kelas.uji-server.ts` (5 uji) |
| `test:e2e:jejak` | 42 uji lulus, dijalankan per kelompok karena batas waktu satu perintah di mesin agen: `kelas` 1, `gabung` 5, `kerangka` 14, `dunia` 5 (termasuk uji kinerja 40 pemain), `kejadian` 4, dan `konsol` 13 |
| `build:jejak` | Berhasil; Worker 302,50 KB (73,84 KB gzip) |
| Build `CLOUDFLARE_ENV=uji` dan `wrangler deploy --dry-run` | Unggahan 295,41 KiB (71,83 KiB gzip); `LINGKUNGAN` = `uji`, `ITERASI_SANDI` = `4000`, `RUANG_AKTIF_MAKS` = `3` |
| `build:pages` | 178 berkas, identik byte |
| `tsc --noEmit` | 0 galat |
| ESLint (`app/`, `server/`, `e2e/`, `scripts/`, dan `web/` Jejak Setara) | 0 masalah |

## Simulasi beban

`sim:beban` lokal dengan satu layar kelas tersambung, 20 detik di lobi dan 60 detik menjelajah.

| Ukuran | 1 ruang × 50 bot | 1 ruang × 100 bot |
|---|---|---|
| Semua bergabung | 931 ms | 2.052 ms |
| Putus tak terduga, pesan ditolak, gerak dikoreksi | 0, 0, 0% | 0, 0, 0% |
| Lobi diam: `dunia` dan pengatur waktu putaran | 0 dan tidak ada | 0 dan tidak ada |
| RTT p50 / p95 | 10 / 15 ms | 18 / 124 ms |
| Pesan naik per pemain per detik; byte turun per pemain per detik | 8,18; 2.931 | 5 (gerak 6 kali per detik); 2.581 |
| Jawaban selesai (bot yang menjawab) | 36 (28) | 152 (90) |
| `dunia_kelas`: jumlah selama 60 detik, rata-rata byte | 120 (2 per detik), 1.406 | 120 (2 per detik), 2.761 |
| `papan`: jumlah, rata-rata byte | 18, 1.108 | 33, 1.111 |
| `kemajuan`: jumlah, rata-rata byte | 23, 54 | 49, 55 |
| `lobi` saat bergabung: jumlah, rata-rata dan terbesar | 51, 2.193 dan 4.352 byte | 101, 4.357 dan 8.696 byte |
| Seluruh pesan ke layar kelas (server) | 216 pesan, 303 KB | 307 pesan, 812 KB |
| Perkiraan permintaan Durable Object per sesi 15 menit | 18.455 | 22.600 |

Saat bermain dengan 100 pemain, layar kelas menerima sekitar 6 KB per detik (`dunia_kelas` dan `papan`), atau sekitar 5,4 MB per ronde 15 menit, sesuai perkiraan Plan (4,8 MB untuk `dunia_kelas` saja). CPU putaran tidak terukur langsung di runtime lokal; penyusunan pesan kelas untuk 100 pemain di bawah 0,1 ms di Node (percobaan Plan), dan RTT tidak memburuk dibanding JS-08.

## Ukuran kode

| Halaman | JS gzip | CSS gzip | Keterangan |
|---|---|---|---|
| Layar pemain (`/`) | 122,13 KB (semula 121,65 KB) | 5,60 KB (semula 5,59 KB) | Naik 0,48 KB JS karena modul `inti` kini dipakai bersama konsol; gaya layar kelas di `kelas.css` hanya dimuat konsol |
| Konsol (`/admin/`) | 98,00 KB (semula 83,97 KB) | 8,25 KB | Di bawah batas 350 KB |

Diukur dengan gzip tingkat 9 atas semua berkas JS dan CSS yang dimuat halaman, dari build lokal yang sama.

## Tangkapan layar

Di [tests/JS-10/](JS-10/): `kelas-lobi`, `kelas-bermain`, `kelas-jeda`, `kelas-podium`, dan `kelas-pembahasan`, masing-masing di 1024 × 768, 1280 × 720, dan 1920 × 1080; `konsol-ruang-1280x720`, `konsol-ruang-360x640`, `konsol-ruang-baru-1280x720`, dan `konsol-detail-1280x720`.

## Pemeriksaan manual

- [x] Tampilan diperiksa dari tangkapan layar di ketiga ukuran layar kelas.
- [ ] Lingkungan uji sesudah push: "Jejak: uji" hijau dan langkah "Siapkan kunci Worker" menulis "Kunci Worker baru: KUNCI_TIKET." (pemilik proyek).
- [ ] Rahasia `KUNCI_COBA` dihapus dari Worker uji (pemilik proyek).
- [ ] Satu ronde pendek dari konsol dengan layar kelas di proyektor atau layar lebar dan dua atau tiga HP (pemilik proyek).

## Temuan

1. Pintasan papan ketik sempat memakai keadaan lama saat tombol ditekan cepat (L kedua mengunci lagi). Penangan kini dipasang ulang dengan `useLayoutEffect` sesudah setiap render.
2. Kartu pembahasan sempat perlu digulir di layar 16:9. Batang persen kini menjadi latar kotak opsi.
3. Penyesuaian lain terhadap spesifikasi tercatat di bagian "Catatan Build" spesifikasi JS-10: `RUANG_AKTIF_MAKS` lokal 1000, tabel pesan galat API ruang, berkas tambahan, warna tas rose dan berry, podium hanya untuk pemain berskor, dan cakupan uji aturan impor.
4. `sim:beban` di lingkungan uji kini butuh akun konsol (`JEJAK_UJI_EMAIL`, `JEJAK_UJI_SANDI`), bukan `JEJAK_KUNCI_COBA`.

## Keputusan: Lulus

Semua kriteria lulus di lingkungan agen; AC-19 dengan catatan pemeriksaan pembaca layar. Langkah pemilik proyek di lingkungan uji dijalankan sesudah push.
