# Hasil uji JS-05 — 7 November 2026, uji ulang Revisi 1 8 November 2026

## Uji ulang Revisi 1 (8 November 2026)

Spesifikasi: [`specs/JS-05-konten.md`](../specs/JS-05-konten.md), bagian "Revisi 1". Salinan kerja dari ZIP repositori `main` 8 November 2026, yang sudah memuat ZIP akhir JS-05 dan pekerjaan JS-03 (Sesi A). Isi ke-18 berkas JS-05 di ZIP itu sama persis dengan ZIP akhir JS-05.

**Yang terjadi.** Sesudah ZIP akhir JS-05 di-push, alur kerja "Jejak: uji" gagal di langkah "Periksa konten Jejak" (Vitest 5.0.4 sungguhan). 35 dari 43 uji `bank-semai` lulus, tetapi 8 uji SQLite gagal dengan "NOT NULL constraint failed: kejadian_versi.kejadian_id". Uji lain di ketujuh berkas konten lulus, sama dengan hasil penjalan pengganti 7 November 2026. Uji SQLite itu memakai `0001_awal.sql` dari JS-03, yang belum ada di ZIP dasar JS-05. Di migrasi itu, id kejadian, versi, dan paket berupa teks UUID tanpa nilai bawaan, sedangkan semai mengandaikan id terisi otomatis. Kegagalan yang sama terulang di salinan kerja (35 lulus, 8 gagal, pesan sama).

**Dampak.** Tidak ada basis data yang tersentuh. Job "Deploy uji" memerlukan job "Uji" lulus (`needs: uji`), alur kerja belum punya langkah semai, dan `database_id` uji masih berisi tempat isian.

**Keputusan sebelum perbaikan.** Penyebabnya anggapan yang salah di spesifikasi, jadi JS-05 kembali ke Specify (AGENTS 4.4). Spesifikasi mendapat Revisi 1, lalu dibangun dan diuji ulang.

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-9 SQL | Lulus | 73 pernyataan berurutan, sama setiap kali dicetak, tanpa `BEGIN`, `COMMIT`, atau "terverifikasi". Pernyataan terpanjang 3.198 byte. Bentuk pernyataan kejadian, versi, paket, dan isi paket pertama sama huruf demi huruf dengan bagian "SQL semai" |
| AC-10 Semai pertama | Lulus | Tabel dari `0001_awal.sql`, dengan kunci asing aktif: 23/16/16/1/16/1 baris. Id kejadian, versi, dan paket sama dengan P-40, dan ke-16 versi menunjuk id kejadiannya. Status, isi, waktu, dan penanda sesuai |
| AC-11 Sekali per basis data | Lulus | Akun peninjau uji dibuat di `pengguna`, JR-04 ditandai terverifikasi olehnya, lalu suntingan dan penghapusan lain dilakukan. Semai ulang tidak mengubah satu baris pun |
| AC-12 Semai terputus | Lulus | Berhenti sesudah 1, 23, 24, 36, dan 72 pernyataan lalu diulang: isi, termasuk id, sama dengan semai utuh |
| AC-13 Pengutip | Lulus | Tanda kutip dan potongan perintah SQL tersimpan utuh di tabel migrasi |
| AC-14 Perintah semai | Lulus | Semua uji perintah lulus seperti sebelumnya. `node scripts/jejak-setara/semai.mjs --sql` keluar 0 dengan 73.724 byte. Kini `wrangler.jsonc` sudah memuat D1, jadi `--jalankan -- --local --persist-to .wrangler/state` di lingkungan agen berhenti di "wrangler belum terpasang" (kode 1), sesuai P-33 langkah 3 |
| AC-16 Perintah repositori | Lulus (pengganti) | `bila-ada.mjs` dengan penjalan pengganti: 7 berkas konten, 214 uji, 209 lulus dan 5 dilewati (kode 0). Seluruh pola `test:jejak`, kini 20 berkas termasuk uji JS-03: 570 uji, 565 lulus, 5 dilewati |
| AC-17 Galeri dan batas berkas | Lulus (pengganti) | Pemeriksaan token Tailwind: 0 kelas baru. Daftar berkas di bawah, termasuk `kontrak-d1.sql` yang dihapus |
| AC-19 Id bank awal | Lulus | `uuid5` sama dengan contoh dokumentasi Python (`886313e1-3b8a-5372-9b90-0c9aee199e5d`) dan dengan modul `uuid` Python untuk ketiga id contoh P-40. Ke-33 id berbentuk UUID versi 5 dan berbeda satu sama lain |
| AC-1 sampai AC-8, AC-15, AC-18 | Lulus | Berkas yang diuji kriteria ini tidak berubah, dan ujinya lulus lagi di salinan kerja baru |

| Perintah | Hasil |
|---|---|
| Penjalan pengganti, `test:jejak` (20 berkas) | 565 lulus, 0 gagal, 5 dilewati. `bank-semai` 47 uji (sebelumnya 43): 1 uji bentuk SQL dan 3 uji id ditambahkan. Penjalan pengganti kini juga mengenal `expect.arrayContaining` dan pencocok sejenis, yang dipakai uji JS-03 `nama-samaran`. Uji dirinya: 13 dari 13 harapan yang sengaja salah dilaporkan gagal |
| TypeScript 6.0.3, pilihan ketat seperti Test 7 November | 0 galat untuk `inti/**` dan kedelapan berkas `__tests__/konten/` |
| ESLint 10.1.0, 66 aturan inti | 0 masalah pada `semai.mjs` dan keluaran esbuild `bank-semai.test.ts` |
| Uji mutasi `semai.mjs` | 13 dari 13 tertangkap, termasuk "id kejadian tidak diisi", yang meniru kegagalan alur kerja persis (9 uji gagal) |
| Pemeriksaan token Tailwind | 0 kelas baru dari semua berkas yang berubah di Revisi 1 |

`git diff --name-status` terhadap ZIP `main` 8 November 2026:

```
M  app/jejak-setara/__tests__/konten/bank-semai.test.ts
M  docs/jejak-setara/naskah/STATUS.md
M  docs/jejak-setara/specs/JS-05-konten.md
M  docs/jejak-setara/tests/JS-05-hasil.md
M  scripts/jejak-setara/semai.mjs
D  server/jejak-setara/seed/kontrak-d1.sql
```

**Temuan Revisi 1.**
1. Uji `bank-semai` bekerja seperti dirancang. Begitu migrasi JS-03 ada, uji itu memakainya dan langsung merah karena tabelnya tidak cocok dengan semai, sebelum semai pernah dijalankan ke D1.
2. Kegagalan seperti ini bisa berulang bila Sesi A dan Sesi B bekerja dari ZIP yang berbeda. Sesudah `main` berubah, ZIP dasar berikutnya sebaiknya ZIP `main` terbaru (AGENTS 11.3).
3. Pemeriksaan pengganti tidak bisa menjalankan `test:jejak:server` (Workers) dan `build:jejak`. Revisi 1 tidak mengubah berkas yang dipakai keduanya.

## Keputusan: Lulus (Revisi 1)

Lulus dengan pemeriksaan pengganti untuk AC-16 dan AC-17. Keputusan ini menjadi final bila Revisi 1 disetujui dan "Jejak: uji" hijau sesudah push.

## Uji pertama (7 November 2026)

Bagian di bawah ini laporan uji pertama, sebelum Revisi 1. Keputusannya Lulus di sesi agen, tetapi alur kerja "Jejak: uji" gagal sesudah push (bagian di atas).

Spesifikasi: [`specs/JS-05-konten.md`](../specs/JS-05-konten.md) (disetujui 7 November 2026, D-1 sampai D-5 tanpa perubahan). Sesi B, salinan kerja dari ZIP repositori 7 November 2026 ditambah ZIP Gerbang 1 dan Gerbang 2 JS-05.

**Catatan penting tentang lingkungan.** Seperti Test JS-02, sesi ini tidak bisa memasang dependensi karena pemasangan paket tertutup. Perintah yang memerlukan `vitest`, `vite`, `eslint-config-next`, atau `@playwright/test` diganti pemeriksaan setara dengan alat yang ada di lingkungan agen (tabel "Perintah"). Kode, uji, dan dokumen tidak berbeda karena hal ini; yang berbeda hanya alat penjalannya. Alur kerja "Jejak: uji" di GitHub menjalankan `content:check:jejak`, `test:jejak` (Vitest sungguhan), dan `build:jejak` sesudah push.

**Semai tidak dijalankan ke basis data mana pun.** Yang dijalankan hanya `--sql` dan `--jalankan -- --local`, yang mencetak "Belum tersedia" karena D1 belum ada. Skenario semai diuji di SQLite bawaan Node.

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 Kemurnian dan tipe | Lulus (pengganti) | `kemurnian.test.ts` kini memindai 8 berkas `inti/` (45 uji lulus, sebelumnya 43), termasuk `konten/skema.ts` dan `konten/periksa.ts`, tanpa impor atau panggilan terlarang. TypeScript 6.0.3 dengan pilihan `tsconfig.json` akar ditambah `noUnusedLocals` dan `noUnusedParameters`, pada seluruh `inti/**` dan kedelapan berkas `__tests__/konten/`: 0 galat. `skemaIsiKejadian` bertipe `z.ZodType<IsiKejadian>`. Tidak ada `any`, `@ts-ignore`, atau `eslint-disable` di berkas baru |
| AC-2 Bank lolos | Lulus | `bank-skema.test.ts` 8 uji: `periksaBank` dengan 102 kunci aset Disetujui mengembalikan daftar kosong; versi 1; JR-01 sampai JR-23 dan K-01 sampai K-16 berurutan; dua kejadian di setiap zona; satu paket; format berkas (UTF-8 tanpa BOM, dua spasi, satu baris baru di akhir) dan urutan kolom |
| AC-3 Setiap aturan menangkap cacat | Lulus | `bank-aturan.test.ts` 57 uji: 33 contoh cacat satu kejadian, 7 contoh cacat bank, 2 contoh peta; ke-27 kode muncul, masing-masing dengan tingkat menurut tabel; status rujukan dilaporkan sekali sebagai `RUJUKAN_BERSTATUS` (letak `JR-01/`); `PAKET_TITIK_KURANG` berletak `paket/z3`; contoh fungsi teks spesifikasi memberi hasil yang sama |
| AC-4 Sama dengan naskah | Lulus | `naskah-cocok.test.ts`: ke-16 kejadian sama dengan naskahnya (teks, zona, jenis, topik, urutan rujukan); 336 angka "Pemeriksaan panjang" (21 per naskah) sama dengan hitungan ulang, termasuk kolom batas |
| AC-5 Urutan pilihan | Lulus | Urutan dan id ke-16 kejadian sama dengan aturan P-21; sebaran pilihan benar 1a ×4, 1b ×5, 1c ×2, 1d ×5; pilihan tepat 2a ×6, 2b ×4, 2c ×6 |
| AC-6 Pustaka rujukan | Lulus | 23 rujukan: teks, sumber, dan kode Sehari sama dengan `NASKAH.md`; kolom "Dipakai di" sama dengan pemakaian di bank; ke-11 teks R-xx sama persis dengan `REFERENCE_TEXT` Sehari Setara (dibaca saja); ke-23 catatan sama dengan D-4; tanpa kolom status; kata "terverifikasi" tidak ada di `bank-awal.json` |
| AC-7 Protokol JS-02 | Lulus | `bank-protokol.test.ts` 17 uji: 80 pesan dari ke-16 kejadian dan 1 pesan `selesai` berisi 16 rekap, semuanya lolos skema `protokol.ts` |
| AC-8 Aset | Lulus | `bank-aset.test.ts` 17 uji: 44 kunci, 37 berbeda (26 `npc_`, 11 `obj_`), semuanya punya PNG dan baris "disetujui" di `CREDITS.md`, tanpa `_atas`; tabel set tokoh `NASKAH.md` sama dengan bank (`naskah-cocok`) |
| AC-9 SQL | Lulus | `bank-semai.test.ts`: SQL sama untuk bank yang sama, baris keterangan dan 73 pernyataan berurutan, tanpa `BEGIN`, `COMMIT`, atau "terverifikasi"; pernyataan terpanjang 3.131 byte; setiap pernyataan kecuali penanda memuat syarat penanda dan `WHERE` |
| AC-10 Semai pertama | Lulus | SQLite 3.53.4, tabel dari `kontrak-d1.sql` (migrasi JS-03 belum ada): 23/16/16/1/16/1 baris; rujukan `belum`, kejadian `tinjau`, versi 1 `kerja` tanpa pembuat dengan catatan D-3, `isi_json` sama persis; paket aktif berurutan K-01 sampai K-16; waktu dalam 5 detik dari jam uji dan dibulatkan ke detik; penanda sesuai P-30 |
| AC-11 Sekali per basis data | Lulus | Sesudah JR-04 ditandai terverifikasi, teks JR-02 dan judul K-01 disunting, paket dinonaktifkan, serta K-05 dan JR-23 dihapus, semai ulang tidak mengubah satu baris pun |
| AC-12 Semai terputus | Lulus | Berhenti sesudah 1, 23, 24, 36, dan 72 pernyataan lalu diulang: isi sama dengan semai utuh |
| AC-13 Pengutip | Lulus | Catatan berisi tanda kutip tunggal, kutip ganda dua kali, dan `; DROP TABLE rujukan; --` tersimpan utuh, tabel tetap 23 baris; `kutip(null)`, `kutip("it's")`, NUL, dan bukan teks sesuai spesifikasi |
| AC-14 Perintah semai | Lulus | Proses Node sungguhan: `--sql` kode 0 dan keluarannya sama persis dengan `teksSql`; empat argumen salah kode 1 dengan cara pakai persis. Pada salinan sementara: tanpa D1 kode 0 dengan "Belum tersedia" persis; dengan D1 tanpa `node_modules` kode 1 dengan pesan `wrangler` belum terpasang; bank ber-versi 2 kode 1 (`--sql` dan `--jalankan`); bank tidak ada kode 1. `adaD1` 8 contoh, `buangKomentar`, `argumenWrangler`, dan 9 penolakan `bacaBank` lulus |
| AC-15 Peta | Lulus | `bank-peta` dilaporkan dilewati dengan nama "Belum tersedia: app/jejak-setara/peta/kampung.json belum ada (dibuat di JS-06)." Dicoba dengan peta sementara: titik cukup 4 lulus; satu titik di z3 4 gagal (catatan Build B-5) |
| AC-16 Perintah repositori | Lulus (pengganti) | `bila-ada.mjs` kini menemukan folder uji konten dan menjalankan perintahnya (kode 0). Penjalan pengganti: uji konten 7 berkas, 205 lulus dan 5 dilewati; seluruh pola `test:jejak` 14 berkas, 501 lulus dan 5 dilewati. `build:jejak`: esbuild menunjukkan halaman pemain, konsol, dan Worker tidak memuat satu pun berkas JS-05 |
| AC-17 Galeri dan batas berkas | Lulus (pengganti) | Pemeriksaan token Tailwind: 0 kelas baru dari semua berkas baru dan berubah. `git diff --name-status` terhadap ZIP 7 November 2026 hanya memuat berkas di tabel spesifikasi (daftar di bawah) |
| AC-18 Dokumen | Lulus | `NASKAH.md` memuat bagian "Set tokoh dan latar titik (bank awal)" dengan tabel D-1 dan D-2; `STATUS.md` mencatat Gerbang 2, Build, dan Test serta Permintaan A-10; laporan ini |

## Perintah yang dijalankan dan hasilnya

| Perintah resmi | Hasil di sesi ini | Pengganti dan hasilnya |
|---|---|---|
| `npx pnpm@11.25.0 install --frozen-lockfile` | Tidak dicoba: pemasangan paket tertutup | `zod` 3.25.76 (versi sama dengan `package.json`) ditautkan dari folder alat agen ke `node_modules` salinan kerja, yang diabaikan git dan tidak ikut ZIP |
| `content:check:jejak` | Tidak bisa (Vitest tidak terpasang) | `bila-ada.mjs` dengan penjalan pengganti sebagai perintahnya: kode 0, 7 berkas, 210 uji (205 lulus, 5 dilewati) |
| `test:jejak` | Tidak bisa (Vitest tidak terpasang) | Penjalan pengganti kecil (`describe`, `it`, `it.each`, `skip`, `skipIf`, `runIf`, kait sebelum dan sesudah, `expect` dengan pesan, `vi.resetModules` tanpa efek) di atas `tsx` 4.23.12: 14 berkas, 506 uji, 501 lulus, 5 dilewati. Uji JS-01 dan JS-02 lulus semua: 296 uji, yaitu 294 seperti laporan JS-02 ditambah 2 pemindaian kemurnian untuk berkas `inti/konten/`. Pengganti diuji dulu: 12 dari 12 harapan yang sengaja salah dilaporkan gagal, dan uji yang dilewati tidak dijalankan |
| `build:jejak` | Tidak bisa (Vite tidak terpasang) | esbuild 0.28.2: Worker (12 masukan), halaman pemain dan konsol (28 masukan masing-masing, huruf `@fontsource` diganti kosong) tidak memuat berkas `inti/konten/`, `seed/`, atau `semai.mjs`, jadi hasil build tidak berubah |
| `tsc --noEmit -p tsconfig.json` | Tidak bisa untuk seluruh repositori | TypeScript 6.0.3, `@types/node` 26.6.3 dari alat agen (repositori memakai 22.19.19), dan tipe pengganti untuk modul `vitest`: 0 galat |
| ESLint `--max-warnings 0` | Tidak bisa (`eslint-config-next` tidak terpasang) | 66 aturan inti ESLint 10.1.0 (semua aturan disarankan, ditambah `prefer-const` dan `no-var`) pada keluaran esbuild 10 berkas TypeScript baru dan pada `semai.mjs`: 0 masalah sesudah perbaikan B-2. Contoh berkas yang sengaja salah ditandai 4 masalah |
| `test:e2e:jejak` | Tidak dijalankan | Tidak diwajibkan (spesifikasi, Rencana uji 5): JS-05 tidak mengubah layar, dan berkas JS-05 tidak masuk bundel halaman |
| `sim:beban` | Tidak dijalankan | Tidak diwajibkan: protokol, inti ruang, dan kiriman ke D1 tidak berubah |
| `build:pages` dan SHA-256 ke-178 berkas | Tidak bisa (Vite dan Tailwind PostCSS) | Pemeriksaan token Tailwind (bagian "Galeri") |
| `node scripts/jejak-setara/semai.mjs --sql` | Kode 0, 71.687 byte | — |
| `node scripts/jejak-setara/semai.mjs --jalankan -- --local` | Kode 0: "Belum tersedia: D1 belum disiapkan di server/jejak-setara/wrangler.jsonc (dibuat di JS-03)." | — |
| `node scripts/jejak-setara/semai.mjs` | Kode 1, cara pakai | — |
| `git diff --name-status` | Lulus | Daftar di bawah |

`git diff --name-status` terhadap ZIP 7 November 2026 (sebelum Gerbang 1 JS-05):

```
A  app/jejak-setara/__tests__/konten/bank-aset.test.ts
A  app/jejak-setara/__tests__/konten/bank-aturan.test.ts
A  app/jejak-setara/__tests__/konten/bank-peta.test.ts
A  app/jejak-setara/__tests__/konten/bank-protokol.test.ts
A  app/jejak-setara/__tests__/konten/bank-semai.test.ts
A  app/jejak-setara/__tests__/konten/bank-skema.test.ts
A  app/jejak-setara/__tests__/konten/naskah-cocok.test.ts
A  app/jejak-setara/__tests__/konten/naskah-urai.ts
A  app/jejak-setara/inti/konten/periksa.ts
A  app/jejak-setara/inti/konten/skema.ts
M  docs/jejak-setara/naskah/K-02.md
M  docs/jejak-setara/naskah/NASKAH.md
M  docs/jejak-setara/naskah/STATUS.md
A  docs/jejak-setara/specs/JS-05-konten.md
A  docs/jejak-setara/tests/JS-05-hasil.md
A  scripts/jejak-setara/semai.mjs
A  server/jejak-setara/seed/bank-awal.json
A  server/jejak-setara/seed/kontrak-d1.sql
```

## Uji konten per berkas

| Berkas | Uji | Hasil |
|---|---|---|
| `bank-skema.test.ts` | 8 | 8 lulus |
| `bank-aturan.test.ts` | 57 | 57 lulus |
| `bank-protokol.test.ts` | 17 | 17 lulus |
| `bank-aset.test.ts` | 17 | 17 lulus |
| `bank-semai.test.ts` | 43 | 43 lulus |
| `bank-peta.test.ts` | 5 | 5 dilewati sampai `kampung.json` ada |
| `naskah-cocok.test.ts` | 63 | 63 lulus |

**Uji mutasi.** Dua puluh kesalahan sengaja dimasukkan satu per satu ke salinan kerja, lalu uji terkait dijalankan dan berkas dipulihkan. Semua 20 tertangkap:
- di `semai.mjs`: status rujukan `'terverifikasi'`, sisipan kejadian tanpa syarat penanda, pengutip tanpa penggandaan, penanda tidak ditulis, `adaD1` tanpa membuang komentar, `--local` selalu ditambahkan, keluaran `--sql` berlebih satu baris, dan versi kerja bernomor 2;
- di `skema.ts` dan `periksa.ts`: kalimat hanya diakhiri titik, ambang petunjuk 30, rujukan tidak dipakai menjadi galat, kejadian tidak ketat, tautan dianggap teks polos, kutipan tidak dianggap awal kalimat, dan set tokoh tanpa batas bawah;
- di data: urutan pilihan K-05 ditukar, satu kata catatan JR-07 berubah, JR-01 diberi status, set tokoh K-15 diganti, dan kolom "Dipakai di" JR-04 kurang satu kejadian.

## Simulasi beban (bila wajib)

Tidak wajib. JS-05 tidak mengubah protokol, inti ruang, atau kiriman ke D1 (AGENTS 4.4 langkah 6).

## Anggaran ukuran dan kinerja

| Hal | Ukuran | Keterangan |
|---|---|---|
| `bank-awal.json` | 67.554 byte (sekitar 13 KB sesudah gzip) | Berkas server; tidak masuk bundel halaman maupun Worker |
| SQL semai | 71.687 byte, 73 pernyataan, terpanjang 3.131 byte | Batas D1 100.000 byte per pernyataan |
| `periksaBank` seluruh bank | Sekitar 10–20 ms | Di Node, mesin agen |
| Uji konten | Sekitar 0,6 detik untuk ketujuh berkas | Penjalan pengganti; skenario SQLite dan proses anak termasuk |
| Halaman pemain, konsol, dan Worker | Tidak berubah | Berkas JS-05 tidak ada di grafik impor ketiganya |

## Galeri

Tailwind galeri membaca semua berkas yang tidak diabaikan git (keputusan 13a JS-01). Pengganti `build:pages` sama dengan Test JS-02: setiap token di 18 berkas baru dan berubah yang tidak ada di berkas lain repositori dicoba satu per satu dengan kompilator Tailwind 4.3.3 (repositori memakai 4.2.1) dan `app/globals.css` galeri. Hasilnya 0 kelas baru, jadi CSS galeri tidak berubah. Uji kewarasan alat ini menangkap 2 dari 2 kelas contoh (Plan JS-05).

## Daftar periksa manual (AGENTS bagian 9)

Tidak berlaku: JS-05 tidak punya layar. Tangkapan layar tidak dibuat untuk alasan yang sama.

## Temuan

1. **Lingkungan tanpa pemasangan paket.** Lima perintah tahap Test diganti pemeriksaan setara (tabel "Perintah"). Batas pengganti: TypeScript 6.0.3, `@types/node` 26.6.3, dan Tailwind 4.3.3 dipakai sebagai ganti 5.9.3, 22.19.19, dan 4.2.1; modul `vitest` diberi tipe pengganti; ESLint memakai aturan inti saja; penjalan uji adalah pengganti kecil, bukan Vitest. Perintah resmi dijalankan alur kerja "Jejak: uji" sesudah push dan diminta dijalankan lagi di Plan JS-03 (Permintaan A-10).
2. **ESLint `preserve-caught-error`** menandai `semai.mjs` yang melempar galat baru di dalam `catch` tanpa galat asal. Sudah diperbaiki dengan `{ cause }` (catatan Build B-2).
3. **Peringatan `node:sqlite`.** Node 22 mencetak "ExperimentalWarning: SQLite is an experimental feature" saat `bank-semai` berjalan. Peringatan ini tidak menggagalkan uji.
4. **Uji konten berjalan dua kali di CI.** `content:check:jejak` dan `test:jejak` sama-sama menjalankan folder `__tests__/konten/` (sesuai Architecture 4.3). Tambahan waktunya sekitar satu detik.
5. **Tabel D1 belum ada.** `bank-semai` memakai `kontrak-d1.sql` sampai migrasi JS-03 ada. Begitu migrasi masuk, uji memakai migrasi itu, dan perbedaan kolom akan langsung membuat uji merah (Permintaan A-5).
6. **Semai sekali per basis data.** Mengubah `bank-awal.json` sesudah sebuah basis data disemai tidak mengubah basis data itu. Hal ini dicatat di `STATUS.md`, bagian "Catatan untuk JS-05".

## Keputusan uji pertama: Lulus di sesi agen, lalu kembali ke Specify (Revisi 1)

Lulus, dengan pemeriksaan pengganti untuk AC-1, AC-16, dan AC-17. Keputusan ini menjadi final bila alur kerja "Jejak: uji" hijau sesudah push. Bila gagal karena kode JS-05, JS-05 kembali ke Build.
