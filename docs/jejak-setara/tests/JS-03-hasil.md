# JS-03 — Hasil uji

| | |
|---|---|
| Fitur | JS-03 Server ruang |
| Spesifikasi | [specs/JS-03-server-ruang.md](../specs/JS-03-server-ruang.md), disetujui 7 November 2026 dengan semua saran DRAF D-1 sampai D-7 |
| Tanggal | 7 November 2026 |
| Lingkungan | Lingkungan agen: Node 22.23.4, pnpm 11.25.0, `wrangler` 4.92.0, `@cloudflare/vite-plugin` 1.37.1, Chromium 153; 1 vCPU Xeon 2,1 GHz |
| Keputusan | **Lulus dengan catatan**: skenario beban 10 ruang × 50 bot (AC-20) belum sah di mesin agen |

## Perintah resmi

| Perintah | Hasil |
|---|---|
| `install --frozen-lockfile` | Lulus; lockfile tidak berubah, tanpa dependensi baru |
| `content:check:jejak` | Kode 0: "Belum tersedia" (JS-05 dan JS-06 belum ada) |
| `test:jejak` | Lulus: 13 berkas, 354 uji (294 lama, termasuk yang disesuaikan, dan 60 baru) |
| `test:jejak:server` | Lulus: 12 uji Worker, Durable Object, dan D1 lewat HTTP dan WebSocket sungguhan |
| `test:e2e:jejak` (`JEJAK_CHROMIUM`) | Lulus: 19 uji (5 uji alur gabung baru dan 14 uji kerangka) |
| `test` (Sehari Setara) | Lulus: 14 berkas, 296 uji, 1 dilewati |
| `RILIS=1 content:check` | Lulus: 43 uji; "Verifikasi rujukan: 14 dari 14 terverifikasi." |
| `playwright test --list` (Sehari Setara) | 160 uji di 9 berkas, tidak berubah |
| `build:jejak` | Lulus. Layar pemain sekitar 84,8 KB gzip (potongan bersama 60,8 KB tanpa zod, `pemain` 21,8 KB dengan zod, CSS 2,2 KB); konsol sekitar 61,2 KB tanpa zod; Worker 36,9 KB gzip |
| `build:pages` | Lulus; ke-178 berkas identik byte dengan garis dasar |
| `tsc --noEmit` dan ESLint `--max-warnings 0` | 0 galat dan 0 masalah |
| Kedua alur kerja | Terbaca sebagai YAML sah dengan nama, pekerjaan, dan langkah sesuai spesifikasi |
| Build `CLOUDFLARE_ENV=uji` dan `wrangler deploy --dry-run` | Binding `RUANG`, `DB` (`jejak-setara-uji`), `BATAS_PUBLIK` dan `BATAS_WS` (300 per 60 detik), `ASSETS`, dan `LINGKUNGAN` = `uji`; unggahan 162,8 KiB, 36,2 KiB gzip |

## Kriteria penerimaan

| AC | Hasil | Bukti |
|---|---|---|
| AC-1 Migrasi | Lulus | Uji server: 13 tabel, `foreign_key_check` kosong, `CHECK` menolak status salah, menjalankan ulang "No migrations to apply" |
| AC-2 Ruang coba | Lulus | Uji server (lokal 201, isi salah 400, nomor absen untuk lebih dari 50 pemain 400, baris D1 sesuai P-4); uji unit (`uji` tanpa atau dengan kunci salah 403, `produksi` 404, kait uji di `uji` 404) |
| AC-3 Kode ruang | Lulus | 100.000 kode sesuai pola, chi² di bawah 50,89; byte ≥ 248 dibuang; normalisasi |
| AC-4 Pemeriksaan kode dan pembatas | Lulus | 200, 404, dan 405; hanya membaca D1; 305 permintaan dari satu alamat: 5 terakhir 429 |
| AC-5 Rute WebSocket | Lulus dengan catatan | 426 dan tajuk `X-Jejak-*` dibuang (uji server); 403 tanpa Origin (uji unit). `vite preview` memutus soket untuk upgrade yang ditolak, jadi kode 403/404 itu baru terlihat di Cloudflare |
| AC-6 Batas sambungan | Lulus dengan catatan | Pelanggaran ke-3 galat, ke-10 tutup 1008 (uji server dan unit). Sambungan tanpa `halo` ditutup ruang sesudah 10 detik lewat alarm; runtime lokal tidak meneruskan kode 4002 dari alarm ke klien, jadi penerimaannya diperiksa di lingkungan uji |
| AC-7 Bergabung | Lulus | Uji unit, server, dan ujung ke ujung |
| AC-8 Batas masuk | Lulus | Penuh, terkunci, terlambat, selesai, dan nomor absen (uji unit; penuh dan nomor absen juga di peramban) |
| AC-9 Sambung ulang | Lulus | Token, 4001, jadwal klien, lapisan 30 detik dan 2 menit (unit); putus dan muat ulang di peramban; muat ulang Durable Object (uji server) |
| AC-10 Sinkron jam | Lulus | Median lima sampel dengan jam tiruan |
| AC-11 Siklus ruang | Lulus | Jam tiruan (unit), kait uji (server dan peramban) |
| AC-12 Kunci dan keluarkan | Lulus | Unit, server, dan peramban |
| AC-13 Gerak dan `dunia` | Lulus | Peta uji lolos `bacaPeta`; koreksi; 24 terdekat; `n`; `frekuensiGerak` |
| AC-14 Penyimpanan | Lulus | Tidak ada tulisan untuk `gerak`; model sesi 40 bot di bawah 500 baris; Durable Object yang dimuat ulang melanjutkan keadaan |
| AC-15 Kiriman ke D1 | Lulus | Baris peserta dalam 30 detik; peserta, peringkat, dan waktu sesudah ronde selesai |
| AC-16 Protokol | Lulus | Pesan dan batas baru beserta ujinya; `PROTOKOL_VERSI` tetap 1; 11, 11, 18, dan 7 pesan |
| AC-17 Halaman | Lulus | Empat ukuran (tangkapan layar di bawah); keyboard saja; tanpa galat konsol, tanpa pelanggaran CSP |
| AC-18 Beberapa pemain | Lulus dengan catatan | Semua skenario di peramban, kecuali "dua pemain memilih nama yang sama bersamaan", yang diuji di tingkat inti ruang |
| AC-19 Deploy dan alur kerja | Lulus | YAML dan `--dry-run`; jalannya di GitHub dilihat sesudah push |
| AC-20 Simulasi beban | **Sebagian** | Lihat bagian berikut |
| AC-21 Uji | Lulus | Tabel perintah resmi |
| AC-22 Kode | Lulus | `tsc`, ESLint (dua baris pengecualian aturan Next.js `no-img-element`, dengan alasan), uji kemurnian mencakup keempat berkas murni server |
| AC-23 Anggaran | Lulus | Layar pemain sekitar 84,8 KB dari 200 KB |
| AC-24 Galeri dan berkas | Lulus | 178 berkas identik; berkas yang berubah sesuai daftar, ditambah deviasi di bawah |
| AC-25 Dokumen | Lulus | Perubahan Gerbang 2, ditambah koreksi Build di bawah |

## Simulasi beban (wajib)

Semua terhadap Worker lokal (`vite preview`), jeda acak 50 ms per laporan, sekitar 40–50 detik per skenario.

| Skenario | Pesan naik per pemain per detik | Turun per pemain per 15 menit | p95 pulang-pergi | Gerak jujur dikoreksi | Putus tak terduga | Baris SQLite per ruang | Permintaan Durable Object per sesi 15 menit |
|---|---|---|---|---|---|---|---|
| 1 ruang × 50 bot | 7,02 | 1,73 MB | 68 ms | 0,088% | 0 | 371 | ±15.900 |
| 1 ruang × 100 bot (`gerak` 6 per detik) | 4,07 | 1,87 MB | 81 ms | 0,135% | 0 | 739 | ±18.400 |
| 10 ruang × 10 bot | 7,20 | 0,55 MB | 83 ms | 0% | 0 | 86–87 | ±3.200 |
| 10 ruang × 50 bot | Tidak sah | — | 5,6 detik | — | 494 | 408–420 | — |

- Ketiga skenario pertama memenuhi AC-20: lalu lintas jauh di bawah 3 MB, koreksi di bawah 1%, dan tidak ada pesan yang ditolak skema.
- Skenario 10 × 50 menjalankan 500 bot dan 10 ruang di satu vCPU yang sama. Proses bot tertahan, lalu mengirim pesan berdempet yang melewati ember token, sehingga sambungan ditutup 1008. Hasil ini menggambarkan mesin uji yang kewalahan, bukan kapasitas Cloudflare, dan diulang di mesin yang lebih kuat (catatan Plan JS-15).
- Temuan dari skenario itu: klien yang jaringannya tersendat juga bisa mengirim pesan berdempet. Karena itu klien kini menyambung ulang sesudah 1008 (P-29), dan Plan JS-07 mencatat agar `gerak` tidak diantrekan.

## Tangkapan layar

`tests/JS-03/`: layar Kode, Nomor absen, Identitas, Lobi, Menyambung ulang, Dijeda, Ronde berjalan, dan Galat ruang penuh, masing-masing di 731 × 411, 1280 × 720, 1024 × 768, dan 1920 × 1080 (32 berkas).

## Deviasi dari spesifikasi dan koreksi Build

1. Petunjuk lokasi Durable Object `apac`, karena `apac-se` tidak sah di Cloudflare; Architecture JA-13 dan 4.2 serta spesifikasi P-5 dikoreksi.
2. Batas `halo` 10 detik dijaga lewat alarm, bukan pengatur waktu, karena pengatur waktu hilang saat ruang beristirahat. Biayanya 1–2 baris tulis per sambungan.
3. Kait uji lokal ketiga, `POST /api/ruang-coba/{KODE}/putuskan`, untuk menguji putus dan menyambung ulang; mati di `uji` dan `produksi`.
4. `bersama/PenandaServer.tsx` dipisah dari `HalamanKerangka.tsx`, dan `PROTOKOL_VERSI` dipindah ke `inti/versi.ts` (diekspor ulang `protokol.ts`), agar konsol tidak membawa zod.
5. `pemain/avatar.ts` mengimpor `ikon_ava_n.png` langsung karena `manifest.ts` belum ada.
6. `pemain_baru` dan `status_ruang` dikirim ke semua sambungan yang punya pemain, termasuk yang masih memilih identitas, agar jumlah lobi selalu benar.
7. Alur kerja "Jejak: uji": grup `concurrency` dipindah ke tingkat pekerjaan, agar deploy tidak dibatalkan push berikutnya.
8. `sim:beban` lokal memberi setiap ruang alamat IP sendiri (`CF-Connecting-IP`), karena pembatas 300 per menit per alamat menahan 500 sambungan dari satu alamat.

## Temuan lain

- `env.uji` masih memakai `ISI_DATABASE_ID_UJI`; deploy dilewati dengan pemberitahuan sampai Database ID dikirim. (Diisi 8 November 2026; lihat bagian berikut.)
- Runtime lokal tidak meneruskan penutupan yang dimulai alarm, dan upgrade yang ditolak tampil sebagai soket diputus. Keduanya diperiksa ulang di lingkungan uji.

## Pemeriksaan di lingkungan uji (8 November 2026)

Sesudah commit `JS-03: isi Database ID lingkungan uji` (Database ID `jejak-setara-uji` diisi di `wrangler.jsonc`), pemilik proyek menjalankan pemeriksaan berikut dengan paket gratis Cloudflare.

| Pemeriksaan | Hasil |
|---|---|
| Alur kerja "Jejak: uji": pekerjaan Uji dan Deploy uji (migrasi D1 uji dan deploy pertama) | Berhasil; `https://jejak-setara-uji.ruangsetara.workers.dev/api/sehat` menjawab `{"ok":true,"protokol":1,"lingkungan":"uji"}` |
| Alur kerja "Jejak: ruang coba" | Berhasil; kode dan tautan ruang tampil di ringkasan alur kerja |
| Bergabung dari HP dan dari laptop sebagai pemain kedua | Berhasil, dilaporkan pemilik proyek |
| Butir manual AGENTS 9: wifi HP dimatikan 30 detik lalu dinyalakan | Tersambung kembali sendiri ke lobi, dilaporkan pemilik proyek |
| Kode 4002 dari alarm sampai ke klien (catatan AC-6) | Berhasil: sambungan dari Console peramban di laptop yang tidak mengirim `halo` ditutup dengan kode 4002 sekitar 10 detik sesudah tersambung. Penutupan otomatis ruang (kode 4000) memakai jalur alarm yang sama (`tutupSoket` dari `alarm()`), jadi ikut terbukti sampai ke klien |

Temuan saat mengisi Database ID: uji `kerangka.test.ts` mencocokkan `wrangler.jsonc` huruf demi huruf, jadi ikut diperbarui. Di berkas yang sama ada satu galat tipe (`tsc --noEmit`, baris 88, larik tajuk di uji ruang coba), padahal tabel di atas mencatat 0 galat. Galat itu tidak memengaruhi permainan maupun alur kerja (Vitest tidak memeriksa tipe), dan diperbaiki di commit yang sama: `tsc --noEmit` seluruh repositori kini 0 galat.

Pemilik proyek menerima catatan AC-20: skenario 10 ruang × 50 bot diulang di JS-15. JS-03 Selesai (8 Nov 2026).

## Keputusan

Lulus dengan catatan. Semua kriteria terpenuhi kecuali skenario 10 ruang × 50 bot (AC-20), yang tidak bisa dijalankan dengan sah di mesin agen 1 vCPU. Saran: terima JS-03 dengan catatan ini dan ulangi skenario itu di JS-15 (atau lebih awal lewat mesin GitHub). JS-03 berstatus Diuji sampai alur kerja "Jejak: uji" hijau sesudah push dan pemilik proyek menerima catatan ini.
