# JS-05 — Konten

| | |
|---|---|
| Status | Disetujui 7 November 2026; dibangun dan diuji 7 November 2026 ([laporan](../tests/JS-05-hasil.md)) |
| Sesi | B (Naskah dan rujukan). Rencana dan status ada di `docs/jejak-setara/naskah/STATUS.md`, bagian "JS-05 — Konten", bukan di `PLAN.md` (AGENTS bagian 4.1) |
| Keputusan Gerbang 1 | Balasan `Setuju: JS-05` (7 Nov 2026): semua saran (a) diterima, yaitu usulan 1a sampai 10a |
| Keputusan Gerbang 2 | Balasan `Spesifikasi disetujui: JS-05` (7 Nov 2026): D-1 sampai D-5 diterima tanpa perubahan |
| Batas berkas | `docs/jejak-setara/naskah/`, `app/jejak-setara/inti/konten/`, `server/jejak-setara/seed/`, `scripts/jejak-setara/semai.mjs`, berkas berawalan `naskah-` atau `bank-` di `app/jejak-setara/__tests__/konten/`, serta spesifikasi dan laporan uji ini (usulan 10a). Perubahan berkas lain ditulis sebagai Permintaan untuk Sesi A di `STATUS.md` |

## Ringkasan

JS-05 mengubah 16 naskah kejadian yang sudah disetujui menjadi data yang bisa dipakai game:

1. **Skema dan aturan konten** di `app/jejak-setara/inti/konten/`: satu skema `zod` dan satu pemeriksa untuk bank awal dan untuk isian konsol kelak (JS-12), sesuai Architecture 5.4.
2. **Bank awal** `server/jejak-setara/seed/bank-awal.json`: 23 rujukan, 16 kejadian, dan Paket inti 16, dengan teks yang sama huruf demi huruf dengan naskah.
3. **Skrip semai** `scripts/jejak-setara/semai.mjs`: menyusun SQL dan menjalankannya ke D1 lewat `wrangler`, sekali per basis data, dengan semua rujukan berstatus `belum`.
4. **Uji konten** di `app/jejak-setara/__tests__/konten/`, yang dijalankan `content:check:jejak`.

Sesudah JS-05 belum ada layar baru, perubahan server, perubahan protokol, maupun migrasi. Tabel D1 dan alur kerja semai dibuat Sesi A di JS-03 (Permintaan A-5). Sampai D1 ada, perintah semai mencetak "Belum tersedia: …" lalu selesai tanpa galat.

## Kaitan PRD

| Acuan | Yang dipenuhi di JS-05 |
|---|---|
| JFR-15 | 16 kejadian, dua di setiap zona, dengan zona yang dipakai penempatan acak per ruang (`tempatkanKejadian` JS-02) |
| JFR-16 | Isi dialog dua langkah: situasi, Langkah 1 (4 pilihan, satu benar, umpan balik), petunjuk, Langkah 2 (3 pilihan bertingkat, "yang terjadi"), dan kartu dampak |
| JFR-21 | Urutan yang dilihat pemain tetap diacak per pemain di JS-08. Urutan yang **disimpan** diacak sekali (usulan 3a), agar pembahasan dan pratinjau tidak memperlihatkan pola |
| JFR-43 | Status awal kejadian bank awal: `tinjau` (Siap tinjau), dengan satu versi `kerja` (usulan 8a) |
| JFR-45 | Pustaka 23 rujukan: teks, sumber JDIH, catatan untuk Peninjau, padanan Sehari Setara, dan status `belum` |
| JFR-46 | Paket inti 16, aktif |
| PRD 10 | Bank kejadian awal dan "Aturan menulis kejadian", diperiksa otomatis |
| Architecture 5.1, 5.4 | Bentuk `IsiKejadian` dan aturan validasi konten, satu skema untuk bank awal dan konsol |
| Architecture JA-10, 10.5, 10.6 | Bank awal disemai dari repositori ke D1; sesudah itu konsol tempat menyunting; agen dan skrip tidak pernah menyemai `terverifikasi` |
| Architecture 14 | Uji konten: bank awal, kecocokan rujukan dengan pustaka awal, dan kecukupan titik per zona |
| AGENTS 7 dan 8 | Inti murni (aturan 1); rujukan tidak pernah disemai atau ditandai terverifikasi (aturan 7 dan bagian 8) |

## Berkas yang dibuat dan diubah

| Berkas | Baru atau diubah | Tahap | Isi |
|---|---|---|---|
| `docs/jejak-setara/naskah/K-02.md` | Diubah | Gerbang 1 | KT-10: hanya situasi versi A |
| `docs/jejak-setara/specs/JS-05-konten.md` | Baru | Gerbang 2 | Spesifikasi ini |
| `docs/jejak-setara/naskah/STATUS.md` | Diubah | Gerbang 1, Gerbang 2, Build, Test | Entri JS-05, riwayat, perbaikan daftar cek rujukan, Permintaan A-5 sampai A-9 |
| `app/jejak-setara/inti/konten/skema.ts` | Baru | Build | Skema `zod`, batas, dan pola konten |
| `app/jejak-setara/inti/konten/periksa.ts` | Baru | Build | Aturan konten dan kode temuan |
| `server/jejak-setara/seed/bank-awal.json` | Baru | Build | Bank awal |
| `server/jejak-setara/seed/kontrak-d1.sql` | Baru | Build | Kontrak tabel untuk uji semai sebelum migrasi JS-03 ada (bukan migrasi) |
| `scripts/jejak-setara/semai.mjs` | Baru | Build | Skrip semai |
| `app/jejak-setara/__tests__/konten/naskah-urai.ts` | Baru | Build | Pembantu uji: pengurai naskah dan tabel `NASKAH.md` |
| `app/jejak-setara/__tests__/konten/bank-skema.test.ts`, `bank-aturan.test.ts`, `bank-protokol.test.ts`, `bank-aset.test.ts`, `bank-semai.test.ts`, `bank-peta.test.ts`, `naskah-cocok.test.ts` | Baru | Build | Tujuh berkas uji (usulan 9a) |
| `docs/jejak-setara/naskah/NASKAH.md` | Diubah | Gerbang 1, Build | Status dan properti K-02 (KT-10); bagian baru "Set tokoh dan latar titik (bank awal)" (D-1 dan D-2) |
| `docs/jejak-setara/tests/JS-05-hasil.md` | Baru | Test | Laporan uji |

Tidak disentuh: `package.json`, lockfile, alur kerja, `server/jejak-setara/wrangler.jsonc`, folder migrasi, berkas `inti/` lain (termasuk `tipe.ts` dan `protokol.ts`), `teks.ts`, keempat dokumen utama, aset, kode dan dokumen Sehari Setara, galeri, dan `deploy-pages.yml`.

## Perilaku

### Skema konten (`inti/konten/skema.ts`)

- **P-1** Diberikan satu kejadian berbentuk `IsiKejadian` yang memenuhi semua batas, ketika diperiksa dengan `skemaIsiKejadian`, maka hasilnya lolos dan datanya sama persis dengan masukan.
- **P-2** Diberikan kolom yang tidak dikenal di tingkat mana pun (misalnya `status` di kejadian atau `gambar` di pilihan), maka skema menolaknya. Semua objek konten ketat (`.strict()`).
- **P-3** Panjang teks dihitung sebagai `length` JavaScript, sama dengan protokol JS-02. Batasnya ada di tabel `PANJANG_KONTEN` (bagian "Data"). Batas yang sudah ada di `PANJANG_TEKS` protokol diambil dari sana, bukan ditulis ulang.
- **P-4** Diberikan teks konten, maka teks itu harus **teks polos**: tidak kosong; tanpa spasi di awal atau akhir dan tanpa dua spasi berturut-turut; tanpa karakter kendali atau karakter tak terlihat (kategori Unicode Cc dan Cf, termasuk ganti baris dan tab); tanpa `<`, `>`, `*`, `_`, `` ` ``, `#`, `[`, `]`; dan tanpa `http:`, `https:`, atau `www.` (huruf besar maupun kecil). Aturan ini berlaku untuk semua teks kejadian, teks dan catatan rujukan, serta nama dan deskripsi paket. Sumber rujukan memakai aturan sendiri (P-6).
- **P-5** Kode dan kunci mengikuti pola: kode kejadian `K-01` (`^K-\d{2,3}$`), id rujukan `JR-01` (`^JR-\d{2,3}$`), kode Sehari Setara `R-01` (`^R-\d{2}$`), kunci aset `^(npc|obj)_[a-z0-9_]{1,28}$` (paling banyak 32 karakter, cocok dengan pola id protokol), id pilihan Langkah 1 `1a`–`1d`, dan id pilihan Langkah 2 `2a`–`2c`.
- **P-6** Sumber rujukan berupa 1–3 alamat `https://` tanpa spasi, dipisah " · " (spasi, titik tengah U+00B7, spasi), paling banyak 400 karakter.
- **P-7** Jumlah: tepat 4 pilihan Langkah 1 dan tepat 3 pilihan Langkah 2; `setTokoh` 1–4 kunci; rujukan kejadian 1–4 id; isi paket 1–64 kode (64 = `BATAS_PESAN.kejadianMaks`, batas rekap pesan `selesai`); daftar rujukan, kejadian, dan paket di bank masing-masing sedikitnya satu.
- **P-8** Rujukan di berkas bank awal berisi `id`, `teks`, `sumber`, `kodeSehari` (kode R-xx atau `null`), dan `catatan`. Rujukan **tidak punya kolom status**; bila ada, bank ditolak (temuan `RUJUKAN_BERSTATUS`, P-14).
- **P-9** `skemaIsiKejadian` bertipe `z.ZodType<IsiKejadian>`, sehingga perubahan `IsiKejadian` di `tipe.ts` yang tidak diikuti skema membuat kompilasi gagal.
- **P-10** Seperti `protokol.ts`, skema di tingkat atas modul dibuat oleh fungsi dan ditandai `/* @__PURE__ */`.

### Pemeriksaan (`inti/konten/periksa.ts`)

- **P-11** Ketika `periksaKejadian(isi, konteks)` dipanggil dengan kejadian yang sah, maka hasilnya daftar kosong. Bila tidak sah, hasilnya daftar `Temuan` (`kode`, `tingkat`, `letak`, `pesan`): temuan skema lebih dulu menurut urutan `zod`, lalu temuan aturan menurut urutan tabel kode temuan.
- **P-12** Aturan tetap dijalankan walaupun skema gagal, selama kolom yang dibutuhkan aturan itu berjenis benar. Konsol (JS-12) bisa menampilkan semua masalah sekaligus.
- **P-13** Aturan satu kejadian (rincian di tabel kode temuan):
  - situasi berisi 1–3 kalimat. Satu kalimat diakhiri `.`, `!`, atau `?` (boleh berulang, boleh diikuti tanda petik atau kurung tutup) sebelum spasi atau akhir teks; situasi tanpa tanda akhir berarti 0 kalimat;
  - tepat satu pilihan benar di Langkah 1, dan sedikitnya satu pilihan bertingkat `tepat` di Langkah 2 (Architecture 5.4);
  - id pilihan tidak kembar, dan teks pilihan di satu langkah tidak kembar (tanpa membedakan huruf besar dan kecil);
  - petunjuk tidak menyalin pilihan benar: potongan sama terpanjang antara petunjuk dan setiap pilihan benar, tanpa membedakan huruf besar dan kecil, paling banyak 20 karakter;
  - setiap rujukan kejadian ada di pustaka konteks dan tidak disebut dua kali;
  - kunci `setTokoh` tidak kembar, dan bila `konteks.kunciAset` diberikan, setiap kunci ada di dalamnya;
  - huruf kapital di tengah kalimat menjadi **peringatan** `KAPITAL_TENGAH`, bukan galat (Architecture 5.4). Yang dikecualikan: kata pertama teks, kata sesudah `.`, `!`, atau `?`, kata yang diawali tanda petik pembuka atau kurung buka, singkatan (huruf sebelum tanda hubung pertama semuanya huruf besar, misalnya SD, SMP, HP, PR, SIM, BK, VII), dan nama di `NAMA_DIRI`. Yang diperiksa: judul, situasi, kedua pertanyaan, teks dan umpan balik setiap pilihan, petunjuk, "yang terjadi", hak, kewajiban, dan topik. Teks dan catatan rujukan tidak diperiksa.
- **P-14** Ketika `periksaBank(bank, { kunciAset })` dipanggil, maka seluruh berkas diperiksa dengan `skemaBankAwal`, setiap kejadian diperiksa dengan aturan P-13 memakai pustaka berupa id rujukan di berkas yang sama, lalu aturan bank dijalankan: kode kejadian, id rujukan, dan nama paket tidak kembar; isi paket hanya kode yang ada dan tidak kembar; rujukan yang tidak dipakai kejadian mana pun menjadi peringatan; dan kolom `status` pada rujukan dilaporkan sekali sebagai `RUJUKAN_BERSTATUS` (bukan juga `KOLOM_ASING`).
- **P-15** `letak` berbentuk `{nama}/{jalur}`: nama adalah kode kejadian (bila sah), id rujukan (bila sah), `kejadian[i]`, `rujukan[i]`, `paket[i]`, atau `bank`; jalur adalah kolom yang disambung titik, misalnya `K-03/langkah1.opsi.2.teks`, `JR-04/catatan`, `paket[0]/kejadian`, atau `bank/versi`. Jalur kosong menunjuk seluruh kejadian atau rujukan, misalnya `K-03/` (id pilihan kembar) atau `JR-24/` (rujukan tidak dipakai).
- **P-16** Ketika `periksaPaketPeta(zonaKejadian, titikPerZona, letak)` dipanggil, maka setiap zona yang kejadiannya lebih banyak daripada titik kejadiannya di peta menghasilkan `PAKET_TITIK_KURANG` (Architecture 5.4, aturan paket), berurutan menurut zona.
- **P-17** `adaGalat(temuan)` benar bila ada sedikitnya satu temuan bertingkat galat. Peringatan tidak menghalangi apa pun.
- **P-18** Semua fungsi murni dan tetap: masukan yang sama selalu memberi hasil yang sama, tanpa jam, acak, atau pengaturan bahasa sistem.

### Bank awal (`server/jejak-setara/seed/bank-awal.json`)

- **P-19** Bank berisi `versi: 1`, 23 rujukan JR-01 sampai JR-23 berurutan, 16 kejadian K-01 sampai K-16 berurutan, dan 1 paket.
- **P-20** Setiap teks kejadian sama huruf demi huruf dengan naskahnya di `naskah/K-xx.md`: judul dari baris judul, situasi, kedua pertanyaan, teks pilihan, umpan balik, petunjuk, "yang terjadi", hak, kewajiban, dan topik. `zona` diambil dari baris "Zona" (`Z7` menjadi `z7`), `jenis` dari baris "Jenis" (Pelanggaran hak → `pelanggaran_hak`, Pengabaian kewajiban → `pengabaian_kewajiban`, Keduanya → `keduanya`), dan `kartu.rujukan` mengikuti urutan tabel rujukan naskah.
- **P-21** Urutan pilihan setiap langkah diacak sekali lalu tetap (usulan 3a): Langkah 1 memakai `kocok([0, 1, 2, 3], benih("bank-awal", kode, "langkah1"))` dan Langkah 2 memakai `kocok([0, 1, 2], benih("bank-awal", kode, "langkah2"))` dari `acak.ts` JS-02. Unsur ke-p hasil kocok adalah nomor baris pilihan di tabel naskah (mulai 0) yang disimpan di posisi p. Id diberikan menurut posisi: `1a`, `1b`, `1c`, `1d` dan `2a`, `2b`, `2c`. Hasilnya ada di tabel urutan (bagian "Data").
- **P-22** `setTokoh` setiap kejadian sama dengan D-1.
- **P-23** Setiap rujukan: `teks` sama dengan kolom "Teks rujukan" pustaka `NASKAH.md`; `sumber` sama dengan tautan dokumennya di tabel "Dokumen sumber" `NASKAH.md`; `kodeSehari` sama dengan kolom "Padanan Sehari" bila berupa R-xx, atau `null` bila "Baru"; `catatan` sama dengan D-4. Teks yang berpadanan R-xx sama persis dengan `app/sehari-setara/content/references.ts` (KT-B4a).
- **P-24** Paket: nama dan deskripsi menurut D-3, berisi K-01 sampai K-16 berurutan.
- **P-25** Berkas berformat UTF-8 tanpa BOM, indentasi dua spasi, dan diakhiri satu baris baru. Kata "terverifikasi" tidak ada di berkas ini.

### Semai (`scripts/jejak-setara/semai.mjs`)

- **P-26** Ketika `node scripts/jejak-setara/semai.mjs --sql` dijalankan, maka skrip membaca dan memeriksa bentuk dasar bank, mencetak SQL semai ke layar (stdout), lalu selesai dengan kode 0. Tidak ada basis data atau `wrangler` yang disentuh. Bila pembaca keluaran berhenti lebih awal (misalnya `| more`), skrip tetap selesai tanpa pesan galat.
- **P-27** SQL semai selalu sama untuk bank yang sama. Isinya satu baris keterangan, lalu 73 pernyataan berurutan: 23 rujukan; untuk setiap kejadian, satu baris `kejadian` lalu satu versi; satu paket lalu 16 baris isi paket; dan terakhir penanda. Bentuk setiap pernyataan ada di bagian "Data".
- **P-28** **Sekali per basis data.** Setiap pernyataan, kecuali penanda, hanya berlaku selama baris `pengaturan` berkunci `semai_bank_awal` belum ada, dan setiap sisipan yang bertabrakan dengan baris yang sudah ada tidak melakukan apa pun. Sesudah penanda ada, menjalankan semai lagi tidak mengubah satu baris pun: rujukan yang sudah ditandai Terverifikasi, teks yang disunting di konsol, kejadian yang dihapus, dan paket yang dinonaktifkan tetap seperti itu.
- **P-29** **Semai terputus.** Bila semai berhenti sebelum penanda tertulis, menjalankannya lagi melengkapi baris yang belum ada tanpa mengubah baris yang sudah ada, lalu menulis penanda.
- **P-30** Nilai yang ditulis:
  - rujukan: `status` selalu `'belum'`, ditulis langsung di SQL dan tidak pernah diambil dari bank;
  - kejadian: `status` `'tinjau'`, `versi_terbit_id` dan `pemilik_id` kosong (`NULL`);
  - versi: `nomor` 1, `jenis` `'kerja'`, `isi_json` berupa `JSON.stringify` kejadian (padat, urutan kolom seperti di berkas), `dibuat_oleh` kosong, `catatan_perubahan` menurut D-3;
  - waktu (`diubah_pada`, `dibuat_pada`): milidetik dari jam basis data saat semai, dibulatkan ke detik: `CAST(strftime('%s', 'now') AS INTEGER) * 1000`;
  - paket: `aktif` 1, `urutan` 1–16 menurut urutan di bank;
  - penanda: `{"versi":1,"rujukan":23,"kejadian":16,"paket":1}`.
- **P-31** Semua teks masuk SQL lewat satu fungsi `kutip`: dibungkus tanda kutip tunggal, tanda kutip tunggal di dalamnya digandakan, dan `null` menjadi `NULL`. Teks berisi karakter NUL ditolak.
- **P-32** SQL tidak memuat `BEGIN`, `COMMIT`, atau kata "terverifikasi"; setiap `INSERT … SELECT` memiliki `WHERE` (aturan penguraian *upsert* SQLite); setiap pernyataan paling besar 100.000 byte (batas D1).
- **P-33** Ketika `node scripts/jejak-setara/semai.mjs --jalankan [-- <bendera>]` dijalankan, maka berurutan:
  1. bank dibaca dan diperiksa bentuk dasarnya; bila berkas tidak ada atau tidak sah, pesan galat dicetak dan skrip selesai dengan kode 1;
  2. bila `server/jejak-setara/wrangler.jsonc` belum memuat kunci `d1_databases` di luar komentar, skrip mencetak "Belum tersedia: …" dan selesai dengan kode 0 tanpa menjalankan apa pun;
  3. bila `node_modules/wrangler/bin/wrangler.js` tidak ada, pesan galat dicetak dan skrip selesai dengan kode 1;
  4. SQL ditulis ke berkas sementara di folder sementara sistem, lalu dijalankan dengan `node node_modules/wrangler/bin/wrangler.js d1 execute DB --config server/jejak-setara/wrangler.jsonc --file <berkas> --yes`, ditambah `--local` bila bendera tidak memuat `--local` maupun `--remote`, lalu bendera sesudah `--` apa adanya (misalnya `--remote --env uji` atau `--persist-to <folder>`). Perintah dijalankan dari folder repositori tanpa *shell*, sehingga jalur berspasi aman di Windows;
  5. folder sementara dihapus, berhasil ataupun gagal; kode keluar mengikuti `wrangler`, dan pesan selesai atau gagal dicetak.
- **P-34** Basis data yang dituju hanya ditentukan oleh bendera yang diberikan. Agen **tidak pernah** menjalankan semai dengan `--remote` (AGENTS 4.5 dan aturan wajib 15); semai jarak jauh hanya dijalankan alur kerja yang disiapkan Sesi A (Permintaan A-5).
- **P-35** Argumen lain, termasuk tanpa argumen, mencetak cara pakai dan selesai dengan kode 1.
- **P-36** Mengimpor `semai.mjs` (misalnya dari uji) tidak menjalankan apa pun; perintah hanya berjalan bila berkas itu yang dijalankan `node`.

### Uji konten (`content:check:jejak`)

- **P-37** Begitu folder `app/jejak-setara/__tests__/konten/` ada, `content:check:jejak` (lewat `bila-ada.mjs` JS-01) menjalankan semua uji di folder itu, termasuk uji peta Sesi C kelak. `test:jejak` juga menjalankannya.
- **P-38** Selama `app/jejak-setara/peta/kampung.json` belum ada, uji `bank-peta` dilaporkan dilewati dengan nama "Belum tersedia: app/jejak-setara/peta/kampung.json belum ada (dibuat di JS-06)." Uji lain tetap berjalan.
- **P-39** Uji `bank-semai` membuat basis data SQLite kosong di memori (`node:sqlite`, bawaan Node 22.13 ke atas). Bila `server/jejak-setara/migrations/` berisi berkas `.sql`, semuanya dijalankan berurutan nama; bila belum, `server/jejak-setara/seed/kontrak-d1.sql` yang dijalankan. Nama uji menyebut sumber tabel yang dipakai. Bila `node:sqlite` tidak tersedia, skenario SQL dilaporkan dilewati dengan nama "Dilewati: node:sqlite tidak tersedia (perlu Node 22.13 atau lebih baru)."

## Beberapa pemain sekaligus

Tidak berlaku: JS-05 tidak mengubah ruang atau protokol. Untuk semai, dua semai yang berjalan bersamaan pada basis data yang sama tetap aman: sisipan yang bertabrakan tidak melakukan apa pun, dan penanda ditulis sekali. Alur kerja "Jejak: uji" juga tidak berjalan ganda (`concurrency`).

## Status antarmuka

JS-05 tidak punya layar. Status perintah semai:

| Status | Kapan | Keluaran | Kode keluar |
|---|---|---|---|
| Biasa | `--sql` | SQL di stdout | 0 |
| Berhasil | `--jalankan`, `wrangler` selesai dengan kode 0 | Pesan `wrangler`, lalu pesan selesai | 0 |
| Belum tersedia | `--jalankan`, D1 belum ada di `wrangler.jsonc` | Pesan "Belum tersedia" | 0 |
| Bank tidak ditemukan | Berkas bank tidak ada | Pesan galat | 1 |
| Bank tidak sah | Bentuk dasar bank salah | Pesan galat beserta alasannya | 1 |
| `wrangler` belum terpasang | `--jalankan`, D1 ada, `node_modules` belum dipasang | Pesan galat | 1 |
| Gagal | `wrangler` selesai dengan kode bukan 0 | Pesan `wrangler`, lalu pesan gagal | Kode `wrangler` (1 bila tidak ada) |
| Argumen salah | Argumen lain | Cara pakai | 1 |

Status uji konten: **lulus**; **gagal** dengan daftar temuan (`kode`, `letak`, `pesan`) atau perbedaan yang ditemukan; **dilewati** untuk `bank-peta` (P-38) dan skenario SQL tanpa `node:sqlite` (P-39).

## Teks yang tampil (final)

1. **Isi 16 kejadian:** persis naskah yang sudah disetujui (`naskah/K-01.md` sampai `K-16.md`, K-02 versi A). JS-05 tidak menambah atau mengubah satu kata pun; hanya urutan pilihan yang disimpan berubah (P-21).
2. **Paket, catatan versi, dan catatan rujukan:** D-3 dan D-4. Teks ini tampil di konsol (daftar paket, riwayat versi, pustaka rujukan).
3. **Pesan perintah semai** (untuk pengembang dan log alur kerja):

| Status | Teks |
|---|---|
| Keterangan di baris pertama SQL | `-- Semai bank awal Jejak Setara (JS-05), dibuat oleh scripts/jejak-setara/semai.mjs dari server/jejak-setara/seed/bank-awal.json.` |
| Belum tersedia (stdout) | `Belum tersedia: D1 belum disiapkan di server/jejak-setara/wrangler.jsonc (dibuat di JS-03).` |
| Bank tidak ditemukan (stderr) | `Bank awal tidak ditemukan: server/jejak-setara/seed/bank-awal.json.` |
| Bank tidak sah (stderr) | `Bank awal tidak sah: {alasan}. Jalankan content:check:jejak untuk rinciannya.` Alasan: `berkas bukan JSON yang sah`, `versi bank harus 1`, `daftar {rujukan, kejadian, atau paket} kosong atau tidak ada`, `rujukan {id} tidak lengkap`, `rujukan {id} punya kolom status`, `ada kejadian tanpa kode`, atau `paket {nama} tidak lengkap` (`?` bila id atau nama tidak terbaca) |
| `wrangler` belum terpasang (stderr) | `wrangler belum terpasang. Pasang dependensi lebih dulu (npx pnpm@11.25.0 install).` |
| Gagal (stderr) | `Semai gagal (kode keluar {n}). Lihat pesan wrangler di atas.` (`{n}` menjadi `tidak ada` bila proses berhenti tanpa kode) |
| Berhasil (stdout) | `Semai selesai. Bank awal (23 rujukan, 16 kejadian, 1 paket) hanya ditulis bila basis data ini belum pernah disemai.` (angka diambil dari bank) |
| Cara pakai (stderr) | Tiga baris: `Pemakaian:`, `  node scripts/jejak-setara/semai.mjs --sql`, `  node scripts/jejak-setara/semai.mjs --jalankan [-- <bendera wrangler>]` |

4. **Pesan temuan** ada di kolom "Pesan" tabel kode temuan. Pesan ini untuk pengembang dan laporan uji; kalimat yang tampil di konsol ditetapkan di JS-12.

## Data, protokol, API, dan migrasi

### Bentuk `bank-awal.json`

| Kolom | Isi |
|---|---|
| `versi` | `1` |
| `rujukan[]` | `id`, `teks`, `sumber`, `kodeSehari`, `catatan`, berurutan seperti ini |
| `kejadian[]` | Persis `IsiKejadian` (Architecture 5.1), dengan urutan kolom `kode`, `judul`, `zona`, `setTokoh`, `situasi`, `langkah1` (`pertanyaan`, `opsi`, `petunjuk`), `langkah2` (`pertanyaan`, `opsi`), `kartu` (`hak`, `kewajiban`, `rujukan`), `topik`, `jenis`. Pilihan Langkah 1: `id`, `teks`, `benar`, `umpanBalik`. Pilihan Langkah 2: `id`, `teks`, `tingkat`, `terjadi` |
| `paket[]` | `nama`, `deskripsi`, `kejadian` (kode berurutan) |

Contoh satu kejadian (K-14, salinan persis dari bank):

```json
{
  "kode": "K-14",
  "judul": "Berhenti sekolah?",
  "zona": "z7",
  "setTokoh": ["npc_wayan_bawah_diam", "obj_gerobak"],
  "situasi": "Di depan kantor desa, Wayan, teman sekelasmu, sedang menjaga gerobak dagangan orang tuanya. Ia berkata akan berhenti sekolah agar bisa membantu berdagang setiap hari. “Aku tidak tega melihat Bapak dan Ibu bekerja sendiri,” katanya.",
  "langkah1": {
    "pertanyaan": "Apa hak dan kewajiban Wayan yang berkaitan dengan sekolah?",
    "opsi": [
      { "id": "1a", "teks": "Hanya berhak bersekolah bila orang tuanya mampu membayar biayanya", "benar": false, "umpanBalik": "Hak atas pendidikan berlaku bagi setiap warga negara. Untuk pendidikan dasar, pemerintah bahkan wajib membiayainya." },
      { "id": "1b", "teks": "Wajib bekerja membantu orang tua walaupun harus meninggalkan sekolah", "benar": false, "umpanBalik": "Membantu orang tua itu baik, tetapi tidak harus dengan meninggalkan sekolah. Wayan tetap bisa membantu di luar jam sekolah." },
      { "id": "1c", "teks": "Berhak berhenti sekolah kapan saja karena itu keputusannya sendiri", "benar": false, "umpanBalik": "Pendapat Wayan perlu didengar, tetapi pendidikan dasar adalah kewajiban setiap warga negara, bukan sekadar pilihan." },
      { "id": "1d", "teks": "Berhak mendapat pendidikan dan wajib mengikuti pendidikan dasar", "benar": true, "umpanBalik": "Wayan masih SMP, jenjang pendidikan dasar. Sekolah adalah haknya sekaligus kewajibannya, dan pemerintah wajib membiayainya." }
    ],
    "petunjuk": "Pikirkan apakah sekolah hanya hak yang boleh dilepas, atau juga kewajiban yang dijamin negara."
  },
  "langkah2": {
    "pertanyaan": "Apa yang kamu lakukan?",
    "opsi": [
      { "id": "2a", "teks": "Mengajak Wayan menemui wali kelas atau guru BK untuk mencari bantuan agar ia tetap bisa sekolah", "tingkat": "tepat", "terjadi": "Bu Ratih, guru BK, menemui orang tua Wayan dan membantu mengurus bantuan pendidikan. Wayan tetap sekolah dan membantu berdagang sepulang sekolah." },
      { "id": "2b", "teks": "Menghormati keputusannya dan berjanji meminjamkan catatan pelajaran supaya ia tidak tertinggal", "tingkat": "kurang", "terjadi": "Wayan merasa didukung, tetapi ia tetap berhenti sekolah. Catatan pinjaman tidak bisa menggantikan haknya untuk belajar di kelas." },
      { "id": "2c", "teks": "Mendukung Wayan berhenti sekolah karena menurutmu berdagang lebih berguna daripada belajar", "tingkat": "berisiko", "terjadi": "Wayan makin yakin berhenti sekolah. Ia kehilangan kesempatan belajar yang sebenarnya bisa dipertahankan dengan bantuan." }
    ]
  },
  "kartu": { "hak": "Hak mendapat pendidikan.", "kewajiban": "Kewajiban mengikuti pendidikan dasar, yang wajib dibiayai pemerintah.", "rujukan": ["JR-06", "JR-23"] },
  "topik": "Hak atas pendidikan",
  "jenis": "keduanya"
}
```

Di berkas sungguhan setiap larik dan objek ditulis dengan indentasi dua spasi (P-25); contoh di atas dirapatkan agar mudah dibaca.

### Urutan pilihan yang disimpan

Angka di kolom urutan adalah nomor baris di tabel naskah (mulai 1). Di naskah, baris 1 Langkah 1 selalu pilihan benar, dan baris Langkah 2 selalu berurutan berisiko, tepat, kurang tepat.

| Kode | Langkah 1: baris naskah di 1a, 1b, 1c, 1d | Pilihan benar | Langkah 2: baris naskah di 2a, 2b, 2c | Tingkat 2a · 2b · 2c |
|---|---|---|---|---|
| K-01 | 3, 1, 4, 2 | 1b | 3, 2, 1 | kurang · tepat · berisiko |
| K-02 | 4, 3, 2, 1 | 1d | 3, 1, 2 | kurang · berisiko · tepat |
| K-03 | 3, 2, 4, 1 | 1d | 2, 3, 1 | tepat · kurang · berisiko |
| K-04 | 3, 4, 2, 1 | 1d | 1, 3, 2 | berisiko · kurang · tepat |
| K-05 | 1, 4, 2, 3 | 1a | 3, 1, 2 | kurang · berisiko · tepat |
| K-06 | 4, 1, 2, 3 | 1b | 2, 1, 3 | tepat · berisiko · kurang |
| K-07 | 1, 2, 4, 3 | 1a | 2, 1, 3 | tepat · berisiko · kurang |
| K-08 | 2, 1, 3, 4 | 1b | 1, 2, 3 | berisiko · tepat · kurang |
| K-09 | 4, 2, 3, 1 | 1d | 2, 3, 1 | tepat · kurang · berisiko |
| K-10 | 1, 4, 2, 3 | 1a | 1, 3, 2 | berisiko · kurang · tepat |
| K-11 | 2, 1, 4, 3 | 1b | 2, 1, 3 | tepat · berisiko · kurang |
| K-12 | 2, 3, 1, 4 | 1c | 1, 3, 2 | berisiko · kurang · tepat |
| K-13 | 3, 1, 4, 2 | 1b | 1, 2, 3 | berisiko · tepat · kurang |
| K-14 | 4, 3, 2, 1 | 1d | 2, 3, 1 | tepat · kurang · berisiko |
| K-15 | 2, 4, 1, 3 | 1c | 1, 3, 2 | berisiko · kurang · tepat |
| K-16 | 1, 3, 2, 4 | 1a | 3, 2, 1 | kurang · tepat · berisiko |

Sebaran: pilihan benar Langkah 1 di 1a 4 kali, 1b 5 kali, 1c 2 kali, dan 1d 5 kali; pilihan tepat Langkah 2 di 2a 6 kali, 2b 4 kali, dan 2c 6 kali.

### `inti/konten/skema.ts`

| Ekspor | Isi |
|---|---|
| `VERSI_BANK` | `1` |
| `PANJANG_KONTEN` | Panjang teks paling banyak: judul 32, situasi 280, pertanyaan 100, pilihan Langkah 1 90, umpan balik 160, petunjuk 120, pilihan Langkah 2 140, "yang terjadi" 160, hak 120, kewajiban 120, teks rujukan 160 (semuanya dari `PANJANG_TEKS` protokol); topik 40, sumber 400, catatan rujukan 600, nama paket 40, deskripsi paket 160 (D-5) |
| `BATAS_KONTEN` | Kalimat situasi 1–3, `setTokoh` 1–4, rujukan per kejadian 1–4, potongan petunjuk paling banyak 20, isi paket paling banyak 64 |
| `POLA_KONTEN` | Pola P-5 dan P-6 |
| `alasanTidakPolos(teks)` | `null` bila teks polos (P-4), atau alasannya |
| `RujukanBank`, `PaketBank`, `BankAwal` | Tipe isi berkas bank |
| `skemaIsiKejadian`, `skemaRujukanBank`, `skemaPaketBank`, `skemaBankAwal` | Skema `zod` bertipe `z.ZodType<…>` |

`skema.ts` hanya mengimpor `zod`, `../protokol` (`PANJANG_TEKS`, `BATAS_PESAN`), dan tipe dari `../tipe`.

### `inti/konten/periksa.ts`

| Ekspor | Isi |
|---|---|
| `KODE_TEMUAN`, `KodeTemuan` | 27 kode di tabel di bawah |
| `KODE_PERINGATAN` | `KAPITAL_TENGAH` dan `RUJUKAN_TIDAK_DIPAKAI`; kode lain adalah galat |
| `Temuan` | `{ kode, tingkat: "galat" \| "peringatan", letak, pesan }` |
| `KonteksKejadian` | `{ rujukan: ReadonlySet<string>; kunciAset?: ReadonlySet<string> }` |
| `periksaKejadian(isi: unknown, konteks)` | P-11 sampai P-13 |
| `periksaBank(bank: unknown, konteks?: { kunciAset? })` | P-14 |
| `periksaPaketPeta(zonaKejadian, titikPerZona, letak = "paket")` | P-16 |
| `adaGalat(temuan)` | P-17 |
| `hitungKalimat(teks)`, `potonganSamaTerpanjang(a, b)`, `kataKapitalTengah(teks)` | Fungsi teks P-13 |
| `NAMA_DIRI` | 15 nama dan sapaan (D-5) |

| Kode | Tingkat | Kapan | Pesan |
|---|---|---|---|
| `BENTUK` | galat | Jenis data salah atau kolom wajib tidak ada | `Kolom wajib tidak ada.` · `Jenis data {didapat}, seharusnya {diharapkan}.` |
| `KOLOM_ASING` | galat | Kolom tidak dikenal | `Kolom tidak dikenal: {kolom}.` |
| `TEKS_KOSONG` | galat | Teks kosong | `Teks kosong.` |
| `TEKS_PANJANG` | galat | Teks melebihi batas | `Teks {n} karakter, batasnya {batas}.` |
| `TEKS_POLOS` | galat | Melanggar P-4 | `Bukan teks polos: {alasan}.` Alasan: `spasi di awal, di akhir, atau spasi ganda`; `karakter kendali atau karakter tak terlihat`; `tanda HTML atau Markdown, atau tautan` |
| `FORMAT` | galat | Tidak cocok dengan pola P-5 atau P-6 | `Kode kejadian berbentuk K-01.` · `Id rujukan berbentuk JR-01.` · `Kode Sehari Setara berbentuk R-01.` · `Kunci aset berbentuk npc_… atau obj_…, huruf kecil, paling banyak 32 karakter.` · `Id pilihan Langkah 1 adalah 1a, 1b, 1c, atau 1d.` · `Id pilihan Langkah 2 adalah 2a, 2b, atau 2c.` · `Sumber berupa 1–3 alamat https:// yang dipisah " · ".` |
| `JUMLAH` | galat | Jumlah unsur di luar P-7 | `Jumlah {n}, paling sedikit {min}.` · `Jumlah {n}, paling banyak {maks}.` |
| `NILAI` | galat | Nilai pilihan tetap salah (zona, tingkat, jenis, versi) | `Nilai "{nilai}" tidak dikenal; pilihannya {daftar}.` · `Nilai harus {nilai}.` |
| `SITUASI_KALIMAT` | galat | Situasi di luar 1–3 kalimat | `Situasi {n} kalimat; seharusnya 1–3 kalimat yang diakhiri tanda titik, tanya, atau seru.` |
| `OPSI_BENAR` | galat | Pilihan benar Langkah 1 bukan tepat satu | `{n} pilihan benar; seharusnya tepat satu.` |
| `OPSI_TEPAT` | galat | Tidak ada pilihan tepat di Langkah 2 | `Tidak ada pilihan bertingkat tepat; seharusnya sedikitnya satu.` |
| `OPSI_ID` | galat | Id pilihan kembar | `Id pilihan "{id}" dipakai lebih dari sekali.` |
| `OPSI_KEMBAR` | galat | Dua pilihan berteks sama di satu langkah | `Dua pilihan berteks sama: "{teks}".` |
| `PETUNJUK_MENYALIN` | galat | Potongan sama dengan pilihan benar lebih dari 20 karakter | `Petunjuk menyalin {n} karakter pilihan benar ("{potongan}"); paling banyak 20.` |
| `RUJUKAN_TIDAK_ADA` | galat | Rujukan tidak ada di pustaka | `Rujukan {id} tidak ada di pustaka.` |
| `RUJUKAN_KEMBAR` | galat | Rujukan disebut dua kali di satu kejadian | `Rujukan {id} disebut lebih dari sekali.` |
| `SET_TOKOH_KEMBAR` | galat | Kunci set kembar | `Kunci {kunci} disebut lebih dari sekali.` |
| `SET_TOKOH_TIDAK_ADA` | galat | Kunci tidak ada di daftar aset konteks | `Kunci {kunci} tidak ada di daftar aset.` |
| `KAPITAL_TENGAH` | peringatan | Huruf kapital di tengah kalimat (P-13) | `Huruf kapital di tengah kalimat: {kata}. Bila ini nama diri, abaikan peringatan ini.` |
| `KODE_KEMBAR` | galat | Kode kejadian kembar di bank | `Kode kejadian {kode} dipakai lebih dari sekali.` |
| `RUJUKAN_ID_KEMBAR` | galat | Id rujukan kembar di bank | `Id rujukan {id} dipakai lebih dari sekali.` |
| `RUJUKAN_BERSTATUS` | galat | Rujukan bank punya kolom `status` | `Rujukan di bank awal tidak boleh punya kolom status; semai selalu menulis status belum.` |
| `RUJUKAN_TIDAK_DIPAKAI` | peringatan | Rujukan tidak dipakai kejadian mana pun | `Rujukan {id} tidak dipakai kejadian mana pun di bank.` |
| `PAKET_NAMA_KEMBAR` | galat | Nama paket kembar | `Nama paket "{nama}" dipakai lebih dari sekali.` |
| `PAKET_KEJADIAN_TIDAK_ADA` | galat | Isi paket menyebut kode yang tidak ada | `Kejadian {kode} tidak ada di bank.` |
| `PAKET_KEJADIAN_KEMBAR` | galat | Kode disebut dua kali di satu paket | `Kejadian {kode} disebut lebih dari sekali.` |
| `PAKET_TITIK_KURANG` | galat | Kejadian per zona melebihi titik zona | `Zona {zona}: {n} kejadian, tetapi hanya {titik} titik kejadian di peta.` |

### SQL semai

Bagian berulang: `{belum}` = `NOT EXISTS (SELECT 1 FROM pengaturan WHERE kunci = 'semai_bank_awal')` dan `{waktu}` = `CAST(strftime('%s', 'now') AS INTEGER) * 1000`. Nilai `{…}` lain melewati `kutip`.

```sql
INSERT INTO rujukan (id, teks, sumber, status, catatan, kode_sehari) SELECT {id}, {teks}, {sumber}, 'belum', {catatan}, {kodeSehari} WHERE {belum} ON CONFLICT (id) DO NOTHING;
INSERT INTO kejadian (kode, status, versi_terbit_id, pemilik_id, diubah_pada) SELECT {kode}, 'tinjau', NULL, NULL, {waktu} WHERE {belum} ON CONFLICT (kode) DO NOTHING;
INSERT INTO kejadian_versi (kejadian_id, nomor, isi_json, jenis, dibuat_oleh, dibuat_pada, catatan_perubahan) SELECT k.id, 1, {isi_json}, 'kerja', NULL, {waktu}, 'Bank awal dari repositori (JS-05)' FROM kejadian k WHERE k.kode = {kode} AND {belum} AND NOT EXISTS (SELECT 1 FROM kejadian_versi v WHERE v.kejadian_id = k.id);
INSERT INTO paket (nama, deskripsi, aktif) SELECT {nama}, {deskripsi}, 1 WHERE {belum} ON CONFLICT (nama) DO NOTHING;
INSERT INTO paket_kejadian (paket_id, kejadian_id, urutan) SELECT p.id, k.id, {urutan} FROM paket p, kejadian k WHERE p.nama = {nama} AND k.kode = {kode} AND {belum} ON CONFLICT DO NOTHING;
INSERT INTO pengaturan (kunci, nilai_json) VALUES ('semai_bank_awal', '{"versi":1,"rujukan":23,"kejadian":16,"paket":1}') ON CONFLICT (kunci) DO NOTHING;
```

Agar `ON CONFLICT` berfungsi, tabel D1 memerlukan kunci unik pada `rujukan.id`, `kejadian.kode`, `paket.nama`, `pengaturan.kunci`, dan pasangan `(paket_id, kejadian_id)`, sedangkan `kejadian.id`, `kejadian_versi.id`, dan `paket.id` terisi otomatis. Kontraknya ada di `kontrak-d1.sql` (Permintaan A-5).

Penyusunan SQL sebagai teks adalah pengecualian dari Architecture 17 ("tanpa menyambung string SQL"), sama seperti berkas migrasi: isinya berasal dari berkas di repositori, bukan dari pengguna, dan semua teks lewat satu fungsi `kutip` yang diuji (Permintaan A-7).

### `server/jejak-setara/seed/kontrak-d1.sql`

```sql
-- Kontrak tabel D1 untuk semai bank awal (spesifikasi JS-05; Permintaan A-5 di docs/jejak-setara/naskah/STATUS.md).
-- BUKAN migrasi: jangan dijalankan ke D1. Berkas ini hanya dipakai uji bank-semai selama
-- server/jejak-setara/migrations/ belum berisi migrasi. Sesudah migrasi JS-03 ada, uji memakai migrasi itu.
-- Isinya hanya tabel dan kolom yang disentuh semai (Architecture 5.2).
CREATE TABLE rujukan (
  id TEXT PRIMARY KEY,
  teks TEXT NOT NULL,
  sumber TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'belum' CHECK (status IN ('belum', 'terverifikasi')),
  diverifikasi_oleh TEXT,
  diverifikasi_pada INTEGER,
  catatan TEXT,
  kode_sehari TEXT
);
CREATE TABLE kejadian (
  id INTEGER PRIMARY KEY,
  kode TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('draf', 'tinjau', 'terbit', 'arsip')),
  versi_terbit_id INTEGER,
  pemilik_id TEXT,
  diubah_pada INTEGER NOT NULL
);
CREATE TABLE kejadian_versi (
  id INTEGER PRIMARY KEY,
  kejadian_id INTEGER NOT NULL REFERENCES kejadian (id),
  nomor INTEGER NOT NULL,
  isi_json TEXT NOT NULL CHECK (json_valid(isi_json)),
  jenis TEXT NOT NULL CHECK (jenis IN ('kerja', 'terbit')),
  dibuat_oleh TEXT,
  dibuat_pada INTEGER NOT NULL,
  catatan_perubahan TEXT
);
CREATE TABLE paket (
  id INTEGER PRIMARY KEY,
  nama TEXT NOT NULL UNIQUE,
  deskripsi TEXT,
  aktif INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE paket_kejadian (
  paket_id INTEGER NOT NULL REFERENCES paket (id),
  kejadian_id INTEGER NOT NULL REFERENCES kejadian (id),
  urutan INTEGER NOT NULL,
  PRIMARY KEY (paket_id, kejadian_id)
);
CREATE TABLE pengaturan (
  kunci TEXT PRIMARY KEY,
  nilai_json TEXT NOT NULL
);
```

Kata "terverifikasi" di berkas ini hanya nilai yang diizinkan kolom `status` (Architecture 5.2), bukan data yang disemai.

### `scripts/jejak-setara/semai.mjs`

| Ekspor | Isi |
|---|---|
| `JALUR_BANK`, `JALUR_WRANGLER`, `BINDING_D1` (`"DB"`), `PENANDA` (`"semai_bank_awal"`), `CATATAN_VERSI`, `PESAN_BELUM` | Tetapan |
| `kutip(nilai)` | P-31 |
| `bacaBank(isiBerkas)` | Mengurai JSON dan memeriksa bentuk dasar; melempar galat beralasan (P-33 langkah 1) |
| `sqlSemai(bank)` | Larik 73 pernyataan (P-27) |
| `teksSql(bank)` | Baris keterangan, pernyataan, dan baris baru di akhir |
| `buangKomentar(jsonc)`, `adaD1(isiWrangler)` | Pemeriksa `d1_databases` di luar komentar `//` dan `/* … */`; teks berkutip dibiarkan utuh |
| `argumenWrangler(berkasSql, bendera)` | Argumen `wrangler` (P-33 langkah 4) |
| `utama(argumen)` | Titik masuk; mengembalikan kode keluar |

Skrip memakai modul bawaan Node saja (`node:fs`, `node:os`, `node:path`, `node:child_process`, `node:url`).

Contoh pemakaian untuk Sesi A (Permintaan A-5): `db:semai:lokal` = `node scripts/jejak-setara/semai.mjs --jalankan -- --local`; langkah alur kerja uji = `node scripts/jejak-setara/semai.mjs --jalankan -- --remote --env uji`; produksi = `… --remote --env produksi`.

### Protokol, API, dan migrasi

- **Protokol:** tidak ada pesan baru atau berubah. Isi bank diperiksa terhadap skema pesan JS-02 yang sudah ada: `kejadian_terbuka`, `petunjuk`, `hasil_1`, `hasil_2`, `selesai` (pemain) dan `data_pembahasan` (layar kelas). Teks rujukan di kartu dampak berasal dari `teks` pustaka (≤ 160 karakter).
- **API:** tidak ada.
- **Migrasi D1:** tidak ada. Tabel dibuat Sesi A di JS-03 menurut kontrak di atas (Permintaan A-5).

## Aset

Tidak ada aset baru. `setTokoh` memakai 37 kunci berbeda (26 tokoh dan 11 properti, total 44 kunci di 16 kejadian), semuanya berkas yang Disetujui 6 November 2026 dan tercatat di `app/jejak-setara/assets/CREDITS.md`. Kunci adalah nama berkas tanpa `.png`; bagian atas objek dua bagian (`obj_…_atas`) tidak dipakai sebagai kunci, karena digambar bersama bagian bawahnya. Pencarian kunci di `manifest.ts` menunggu jawaban Permintaan A-6; sampai itu, uji `bank-aset` memeriksa berkas dan kreditnya (usulan 5a).

## Keamanan dan privasi

- Tidak ada data pribadi siswa. Isi bank adalah naskah dan rujukan.
- Rujukan selalu disemai `belum`. Bank tidak bisa memuat kolom status (P-8), nilai `'belum'` ditulis langsung di SQL (P-30), dan uji memeriksa kata "terverifikasi" tidak ada di bank maupun di SQL (P-25, P-32). Hanya akun Peninjau di konsol yang bisa menandai terverifikasi (Architecture 10.6).
- Tidak ada rahasia di repositori, log, atau ZIP. `semai.mjs` tidak membaca token apa pun; kredensial Cloudflare untuk semai jarak jauh hanya ada di rahasia GitHub dan dipakai `wrangler` di alur kerja.
- SQL disusun dari berkas repositori lewat satu fungsi pengutip yang diuji dengan tanda kutip tunggal dan potongan perintah SQL (P-31).
- Berkas SQL sementara ditulis di folder sementara sistem dan selalu dihapus (P-33).
- Agen tidak pernah menjalankan semai ke basis data jarak jauh (P-34).

## Di luar cakupan

- Layar konsol: daftar dan penyunting kejadian, pustaka rujukan, tombol verifikasi, dan paket (JS-12). JS-05 hanya menyediakan skema dan pemeriksa yang akan dipakainya.
- Migrasi D1, binding D1 di `wrangler.jsonc`, skrip `package.json`, dan langkah semai di alur kerja (Sesi A, JS-03, Permintaan A-5).
- Pencarian kunci di `manifest.ts` (Permintaan A-6) dan pemeriksaan kunci ke manifest. Begitu manifest ada, `bank-aset` ditambah pemeriksaan itu oleh Sesi B.
- Penataan titik kejadian di peta (Sesi C, JS-06). JS-05 hanya menulis latar titik per zona (D-2) dan uji `bank-peta`.
- Memperbarui basis data yang sudah disemai. Mengubah `bank-awal.json` sesudah semai tidak mengubah basis data itu (P-28); perbaikan sesudahnya dilakukan di konsol (JA-10). Bank awal versi berikutnya, bila kelak diperlukan, direncanakan di fitur sendiri.
- Impor dan ekspor bank lewat konsol (JS-19).
- Perubahan Architecture dan PRD: diminta lewat Permintaan A-7 dan A-8.

## DRAF untuk ditinjau pemilik proyek

### D-1 Set tokoh setiap kejadian

Aturan (usulan 4a): paling banyak 4 kunci; tokoh sesuai naskah dan pratinjau O3 Sesi C yang sudah disetujui; bangunan dan objek peta tidak masuk set; benda yang dipegang tokoh sudah ada di posenya. Siswa umum mengikuti keputusan KT-C9a Sesi C: S1–S4 berbaju bebas untuk kejadian di luar sekolah, S5–S6 berseragam untuk Z2 dan K-13.

| Kode | Zona | Kunci `setTokoh` | Catatan |
|---|---|---|---|
| K-01 | Z1 | `npc_nara_bawah_diam`, `npc_gita_bawah_diam`, `npc_siswa1_bawah_diam` | Seperti pratinjau; pagar adalah objek peta |
| K-02 | Z1 | `npc_made_bawah_diam`, `npc_dimas_bawah_diam`, `obj_pengeras_suara` | Seperti pratinjau |
| K-03 | Z2 | `npc_komang_bawah_menunduk`, `npc_siswa5_bawah_hp`, `npc_siswa6_bawah_diam` | Kotak bekal ada di pose Komang menunduk |
| K-04 | Z2 | `npc_raka_bawah_kursiroda`, `npc_siswa5_bawah_diam` | Naskah punya satu teman. S2 di pratinjau berbaju bebas, sedangkan K-04 di sekolah, jadi yang dipakai S5. S5 juga tampil di K-03 dengan pose lain, karena siswa berseragam hanya dua. Kursi roda ada di pose Raka |
| K-05 | Z3 | `npc_dimas_kanan_motor` | Halte adalah objek peta |
| K-06 | Z3 | `npc_nenek_bawah_diam` | Naskah hanya menyebut nenek; "kamu" adalah pemain. S4 di pratinjau dilepas |
| K-07 | Z4 | `npc_bayu_bawah_diam`, `npc_pedagang_bawah_diam`, `npc_warga1_bawah_menunjuk`, `obj_tiang_kamera` | Lapak menjadi objek peta Z4 |
| K-08 | Z4 | `npc_nara_bawah_diam`, `npc_siswa2_bawah_diam`, `obj_dompet`, `obj_bangku_pasar` | Pos keamanan menjadi objek peta Z4 |
| K-09 | Z5 | `npc_sinta_bawah_diam`, `npc_siswa4_bawah_diam`, `obj_meja_panitia` | Seperti pratinjau |
| K-10 | Z5 | `npc_siswa2_bawah_menunduk`, `npc_siswa3_bawah_diam`, `npc_warga2_bawah_diam`, `obj_meja_panitia` | Peserta baru (menunduk), panitia remaja, penonton |
| K-11 | Z6 | `npc_siswa3_bawah_diam`, `npc_siswa4_bawah_diam`, `obj_sisa_piknik`, `obj_tempat_sampah` | Seperti pratinjau |
| K-12 | Z6 | `npc_gita_bawah_diam`, `npc_anak1_bawah_diam`, `obj_bola`, `obj_tali_lompat` | Satu anak SD selain Gita (usulan 4a) |
| K-13 | Z7 | `npc_ibubayi_bawah_diam`, `npc_siswa5_bawah_diam`, `npc_petugas_bawah_diam`, `obj_bangku_antrean` | Seperti pratinjau |
| K-14 | Z7 | `npc_wayan_bawah_diam`, `obj_gerobak` | Seperti pratinjau |
| K-15 | Z8 | `npc_siswa4_bawah_diam` | Teman di pojok gawai. Pose memegang HP dipakai K-16, agar Z8 tidak memuat tokoh yang sama dua kali |
| K-16 | Z8 | `npc_siswa1_bawah_hp` | Teman yang menunjukkan pesan berantai di HP |

### D-2 Latar titik setiap zona

Tabel usulan 6a menjadi bagian `NASKAH.md` dan pegangan Sesi C di JS-06:

| Zona | Latar di naskah | Yang dibutuhkan setiap titik kejadian |
|---|---|---|
| Z1 | K-01 pagar rumah Nara; K-02 teras dekat rumah Pak Made | Gang berpagar di antara rumah |
| Z2 | K-03 dekat kantin; K-04 percakapan tentang lab lantai dua | Halaman sekolah dekat kantin |
| Z3 | K-05 menunggu angkot di halte; K-06 zebra cross dekat halte | Dekat halte dan zebra cross |
| Z4 | K-07 lapak dengan kamera; K-08 bangku pasar, pos keamanan di ujung lorong | Lorong pasar |
| Z5 | K-09 dan K-10 di balai warga | Sekitar bale |
| Z6 | K-11 tepi sungai; K-12 lapangan taman | Lapangan taman di tepi sungai |
| Z7 | K-13 ruang tunggu puskesmas; K-14 depan kantor desa | Halaman bersama puskesmas dan kantor desa |
| Z8 | K-15 dan K-16 di pojok gawai | Sekitar warung berwifi |

### D-3 Teks paket dan catatan versi

| Teks | Isi |
|---|---|
| Nama paket | Paket inti 16 |
| Deskripsi paket | Enam belas kejadian bank awal, dua di setiap zona. |
| Catatan perubahan versi pertama | Bank awal dari repositori (JS-05) |

### D-4 Catatan rujukan untuk Peninjau

Catatan menjelaskan apa yang dibutuhkan kejadian dari pasal itu dan hal yang perlu dipastikan saat membaca naskah resmi. Isinya diambil dari daftar cek rujukan di `STATUS.md`, tanpa hasil pra-pemeriksaan agen dan tanpa tautan (tautan ada di kolom sumber). Catatan tidak pernah menyatakan rujukan sudah diverifikasi.

Kalimat yang berulang:

- **(Padanan R-xx)** "Padanan Sehari Setara: R-xx, dicek pemilik proyek untuk Sehari Setara pada 5 November 2026; cukup pastikan isinya cocok dengan kejadian yang memakainya."
- **(Baru)** "Rujukan baru: baca pasalnya penuh di naskah resmi."
- **(Perubahan Kedua)** "Cocokkan bunyi pasal dengan naskah Perubahan Kedua (2000), bukan naskah gabungan UUD 1945 di JDIH Kemenkeu yang memuat beberapa salah ketik di Bab XA."
- **(Perubahan Keempat)** "Cocokkan bunyi pasal dengan naskah Perubahan Keempat (2002)."
- **(Naskah asli)** "Bunyi pasal ada di naskah asli 1945; pastikan juga di naskah gabungan bahwa ayat ini tidak diubah."
- **(Sekunder)** "Pra-pemeriksaan agen hanya memakai sumber sekunder, jadi bunyinya perlu dibaca langsung."

Setiap catatan diawali "Yang dibutuhkan kejadian: …." lalu kalimat berulang yang disebut di kolom terakhir, berurutan, dipisah satu spasi:

| JR | Yang dibutuhkan kejadian | Lanjutan catatan |
|---|---|---|
| JR-01 | perlindungan dan tumbuh kembang Gita (K-01); perlindungan Komang dari kekerasan psikis dan diskriminasi (K-03) | (Padanan R-01) (Perubahan Kedua) |
| JR-02 | kebebasan memeluk agama dan beribadat (K-02) | (Baru) (Perubahan Kedua) |
| JR-03 | jaminan negara atas kemerdekaan beribadat (K-02) | (Baru) (Naskah asli) |
| JR-04 | kewajiban menghormati hak asasi orang lain | "Dipakai di sebelas kejadian bank awal: K-02, K-03, K-04, K-06, K-08, K-09, K-10, K-12, K-13, K-15, dan K-16." (Padanan R-08) (Perubahan Kedua) |
| JR-05 | kehormatan dan martabat (K-03, K-15); rasa aman dan keselamatan di jalan (K-05); nama baik dan rasa aman Bayu (K-07) | (Padanan R-03) (Perubahan Kedua) |
| JR-06 | hak atas pendidikan (K-04, K-14) | (Padanan R-04) (Perubahan Keempat) |
| JR-07 | kemudahan atau perlakuan khusus agar Raka mendapat kesempatan yang sama (K-04) | (Baru) (Perubahan Kedua) |
| JR-08 | kewajiban menjunjung hukum, termasuk aturan lalu lintas (K-05) | (Padanan R-05) (Naskah asli) |
| JR-09 | kepastian hukum yang adil dan perlakuan yang sama di hadapan hukum (K-07) | (Padanan R-09) (Perubahan Kedua) |
| JR-10 | hak milik pribadi tidak boleh diambil alih secara sewenang-wenang (K-08) | (Baru) (Perubahan Kedua) |
| JR-11 | kebebasan mengeluarkan pendapat (K-09) | (Padanan R-07) (Perubahan Kedua) |
| JR-12 | bebas dari perlakuan yang diskriminatif (K-10) | (Baru) (Perubahan Kedua) |
| JR-13 | lingkungan hidup yang baik dan sehat (K-11); pelayanan kesehatan (K-13) | (Baru) (Perubahan Kedua) |
| JR-14 | hak berkomunikasi dan memperoleh informasi (K-16) | (Baru) (Perubahan Kedua) |
| JR-15 | pembatasan hak dengan undang-undang demi hak orang lain dan ketertiban umum (K-16) | (Baru) (Perubahan Kedua) |
| JR-16 | kewajiban anak menghormati orang tua dan menyayangi keluarga (K-01) | (Padanan R-02) "Sumbernya dua: UU 23/2002 dan UU 35/2014 yang mengubahnya." |
| JR-17 | hak anak beristirahat, bermain, dan bergaul dengan teman sebaya (K-12) | (Baru) "Pastikan apakah Pasal 11 termasuk pasal yang diubah UU 35/2014 (lihat Pasal I UU 35/2014)." |
| JR-18 | wajib punya SIM; pengemudi dan penumpang sepeda motor wajib berhelm (K-05) | (Padanan R-06) "Seperti catatan R-06, pastikan Pasal 77 dan Pasal 106 tidak diubah UU Cipta Kerja." |
| JR-19 | pejalan kaki didahulukan saat menyeberang di tempat penyeberangan (K-06) | (Baru) (Sekunder) "Pastikan juga Pasal 131 tidak diubah UU Cipta Kerja." |
| JR-20 | Bayu dianggap tidak bersalah selama belum ada putusan pengadilan (K-07) | (Padanan R-12) |
| JR-21 | polisi menerima laporan dan menyelidiki (K-07) | (Padanan R-11) "Menurut catatan R-11 (5 November 2026), UU 5/2026 sedang diuji di Mahkamah Konstitusi; bila dibatalkan, rujukan ini ditinjau ulang." |
| JR-22 | kewajiban setiap orang menjaga kelestarian lingkungan dan mencegah pencemaran (K-11) | (Baru) (Sekunder) "Halaman JDIH BPK mencatat UU ini diubah lewat UU Cipta Kerja; pastikan Pasal 67 tidak termasuk yang diubah." |
| JR-23 | kewajiban mengikuti pendidikan dasar, dan kewajiban pemerintah membiayainya (K-14) | (Baru) (Perubahan Keempat) |

Contoh hasil lengkap, JR-19: "Yang dibutuhkan kejadian: pejalan kaki didahulukan saat menyeberang di tempat penyeberangan (K-06). Rujukan baru: baca pasalnya penuh di naskah resmi. Pra-pemeriksaan agen hanya memakai sumber sekunder, jadi bunyinya perlu dibaca langsung. Pastikan juga Pasal 131 tidak diubah UU Cipta Kerja." Panjang ke-23 catatan 221–482 karakter.

### D-5 Batas dan aturan yang belum tertulis di Architecture 5.4

| Hal | Usulan | Alasan |
|---|---|---|
| Topik | ≤ 40 karakter | Topik terpanjang di bank 36 karakter |
| Teks rujukan | ≤ 160 karakter | Sama dengan batas teks rujukan di pesan protokol JS-02 |
| Sumber rujukan | ≤ 400 karakter; 1–3 alamat `https://` dipisah " · " | Sumber terpanjang 124 karakter; dua rujukan memakai dua alamat |
| Catatan rujukan | ≤ 600 karakter, teks polos | Catatan terpanjang 482 karakter |
| Nama dan deskripsi paket | ≤ 40 dan ≤ 160 karakter | Cukup untuk "Paket inti 16" dan deskripsinya |
| Set tokoh | Sedikitnya 1 kunci | Setiap naskah punya tokoh, dan titik kejadian perlu sesuatu untuk digambar |
| Id pilihan | `1a`–`1d` dan `2a`–`2c`, tidak kembar | Id tetap per pilihan, sehingga penyunting kelak bisa mengubah urutan tanpa mengganti id |
| Teks pilihan | Tidak kembar di satu langkah | Dua pilihan yang sama membingungkan dan membuat statistik pilihan tidak bermakna |
| Petunjuk | Potongan sama dengan pilihan benar paling banyak 20 karakter | Usulan 1a; naskah sekarang paling banyak 19 karakter |
| Kalimat | Diakhiri `.`, `!`, atau `?` sebelum spasi atau akhir teks | Cara menghitung "1–3 kalimat" |
| `NAMA_DIRI` | Bapak, Bayu, Bu, Dimas, Gita, Ibu, Komang, Made, Nara, Nenek, Pak, Raka, Ratih, Sinta, Wayan | Ke-15 nama ini muncul 114 kali di tengah kalimat naskah; tanpa daftar ini bank mendapat 80 peringatan yang keliru |
| Isi paket | ≤ 64 kejadian | Batas rekap di pesan `selesai` |

Batas ini diminta masuk Architecture 5.4 lewat Permintaan A-7.

## Catatan Build (7 November 2026)

- **B-1** `naskah-urai.ts` juga berisi pembaca bank (`bacaBankAwal`) dan daftar kunci aset Disetujui (`kunciAsetDisetujui`), yang dipakai beberapa uji. Keduanya pembantu uji di dalam batas berkas.
- **B-2** `semai.mjs` menyertakan galat asal (`cause`) pada galat "Bank awal tidak sah" (aturan ESLint `preserve-caught-error`). Pesan yang tampil tidak berubah.
- **B-3** `bank-aturan` memuat contoh tambahan di luar tabel rencana uji: situasi berupa angka, petunjuk berisi ganti baris, id rujukan `R-08`, aturan yang tetap berjalan walaupun skema gagal (P-12), bentuk `letak` (P-15), kunci aset tanpa daftar aset, dan bank yang bukan objek. Semuanya mengikuti perilaku spesifikasi.
- **B-4** `bank-semai` juga mencocokkan SQL setiap rujukan dan baris `kejadian` pertama huruf demi huruf dengan bentuk di bagian "SQL semai", dan menguji bank yang tidak ada (status "Bank tidak ditemukan").
- **B-5** Sebelum `kampung.json` ada, uji `bank-peta` dicoba dengan dua peta sementara di salinan kerja: peta dengan titik cukup (4 uji lulus) dan peta dengan satu titik di z3 (4 uji gagal, seperti seharusnya). Kedua peta dihapus dan tidak ikut ZIP.

## Kriteria penerimaan

- [ ] AC-1 **Kemurnian dan tipe.** `skema.ts` dan `periksa.ts` lolos `kemurnian.test.ts` (dipindai otomatis bersama berkas `inti/` lain). Pemeriksaan tipe ketat `tsc` 0 galat untuk kedua berkas dan uji konten. `skemaIsiKejadian` bertipe `z.ZodType<IsiKejadian>`.
- [ ] AC-2 **Bank lolos.** `periksaBank(bank, { kunciAset })` untuk `bank-awal.json` mengembalikan daftar kosong (0 galat dan 0 peringatan), dengan `kunciAset` berupa kunci berkas `npc/` dan `obj/` yang tercatat Disetujui di `CREDITS.md`. Bank berisi versi 1, 23 rujukan JR-01 sampai JR-23 berurutan, 16 kejadian K-01 sampai K-16 berurutan dengan tepat dua kejadian di setiap zona z1–z8, dan satu paket.
- [ ] AC-3 **Setiap aturan menangkap cacat.** Untuk ke-27 kode temuan ada sedikitnya satu contoh cacat yang menghasilkan kode itu dengan tingkat menurut tabel. Contoh yang sah tidak menghasilkan temuan. Kolom status rujukan dilaporkan sekali sebagai `RUJUKAN_BERSTATUS`. `periksaPaketPeta` melaporkan zona yang kekurangan titik dengan letak `paket/z3` untuk contoh di rencana uji, dan 0 temuan bila titik cukup.
- [ ] AC-4 **Sama dengan naskah.** Setiap teks, zona, jenis, topik, dan urutan rujukan ke-16 kejadian sama dengan naskahnya (P-20). Angka di tabel "Pemeriksaan panjang" setiap naskah sama dengan panjang teks yang dihitung ulang.
- [ ] AC-5 **Urutan pilihan.** Urutan dan id pilihan sama dengan aturan P-21 dan tabel urutan, termasuk sebarannya.
- [ ] AC-6 **Pustaka rujukan.** `teks`, `sumber`, dan `kodeSehari` sama dengan pustaka dan tabel "Dokumen sumber" `NASKAH.md`; ke-11 teks yang berpadanan R-xx sama persis dengan `references.ts`; `catatan` sama dengan D-4; kolom "Dipakai di" `NASKAH.md` sama dengan pemakaian di bank. Tidak ada rujukan berkolom status, dan kata "terverifikasi" tidak ada di `bank-awal.json`.
- [ ] AC-7 **Protokol JS-02.** Dari setiap kejadian dibangun `kejadian_terbuka`, `petunjuk`, `hasil_1`, `hasil_2`, dan `data_pembahasan`, ditambah satu `selesai` berisi 16 rekap. Ke-81 pesan lolos skema `protokol.ts` yang ada.
- [ ] AC-8 **Aset.** `setTokoh` sama dengan D-1: 44 kunci, 37 berbeda (26 `npc_` dan 11 `obj_`). Setiap kunci punya berkas `npc/{kunci}.png` atau `obj/{kunci}.png` dan baris di `CREDITS.md` yang memuat jalur itu dan kata "disetujui"; tidak ada kunci berakhiran `_atas`. Tabel set tokoh di `NASKAH.md` sama dengan bank.
- [ ] AC-9 **SQL.** `teksSql(bank)` selalu sama untuk bank yang sama, berisi baris keterangan dan 73 pernyataan; tanpa `BEGIN`, `COMMIT`, atau kata "terverifikasi"; setiap pernyataan ≤ 100.000 byte; setiap `INSERT … SELECT` memiliki `WHERE`.
- [ ] AC-10 **Semai pertama.** Di SQLite kosong dengan tabel dari migrasi JS-03 (bila ada) atau `kontrak-d1.sql`, semai menghasilkan 23 rujukan, 16 kejadian, 16 versi, 1 paket, 16 isi paket, dan 1 penanda. Semua rujukan `belum` dengan teks, sumber, catatan, dan kode Sehari sama dengan bank; semua kejadian `tinjau`; semua versi bernomor 1, `kerja`, tanpa pembuat, dengan catatan D-3 dan `isi_json` sama persis dengan `JSON.stringify` kejadiannya; paket aktif dengan urutan K-01 sampai K-16; waktu dalam 5 detik dari jam uji; penanda sesuai P-30.
- [ ] AC-11 **Sekali per basis data.** Sesudah simulasi kerja di konsol (JR-04 ditandai terverifikasi oleh akun peninjau uji, teks JR-02 dan judul K-01 disunting, paket dinonaktifkan, K-05 dan JR-23 dihapus), semai ulang tidak mengubah satu baris pun.
- [ ] AC-12 **Semai terputus.** Semai yang berhenti sesudah 1, 23, 24, 36, atau 72 pernyataan, lalu dijalankan ulang penuh, menghasilkan isi yang sama dengan AC-10.
- [ ] AC-13 **Pengutip.** Catatan berisi tanda kutip tunggal, tanda kutip ganda dua kali, dan potongan `; DROP TABLE rujukan; --` tersimpan utuh dan tabel tetap berisi 23 baris. `kutip(null)` menghasilkan `NULL`, `kutip("it's")` menghasilkan `'it''s'`, dan teks berisi karakter NUL ditolak.
- [ ] AC-14 **Perintah semai.** Dijalankan sebagai proses Node: `--sql` keluar 0 dengan keluaran sama persis `teksSql(bank)`; tanpa argumen dan dengan argumen salah keluar 1 dan mencetak cara pakai. Pada salinan sementara repositori: tanpa `d1_databases`, `--jalankan -- --local` keluar 0 dengan pesan "Belum tersedia" persis; dengan `d1_databases` tetapi tanpa `node_modules`, keluar 1 dengan pesan `wrangler` belum terpasang; dengan bank ber-`versi` 2, keluar 1 dengan pesan bank tidak sah. `adaD1` benar untuk delapan contoh di rencana uji, dan `argumenWrangler` menghasilkan argumen P-33. `bacaBank` menolak JSON rusak, bank tanpa daftar, dan rujukan berkolom status.
- [ ] AC-15 **Peta.** Selama `kampung.json` belum ada, `bank-peta` dilaporkan dilewati dengan nama P-38. Begitu ada, `bacaPeta` menerima peta itu, `periksaPaketPeta` untuk Paket inti 16 memberi 0 temuan, dan `tempatkanKejadian` berhasil menempatkan ke-16 kejadian di titik zonanya untuk tiga benih berbeda.
- [ ] AC-16 **Perintah repositori.** `content:check:jejak` dan `test:jejak` lulus; `build:jejak` tetap lulus. Bila perintah ini tidak bisa dijalankan di lingkungan agen, pengganti yang dipakai dan alasannya dicatat di laporan uji, dan hasil pastinya dibaca di alur kerja "Jejak: uji" sesudah push.
- [ ] AC-17 **Galeri dan batas berkas.** Berkas baru dan berubah tidak menambah kelas Tailwind di CSS galeri (`build:pages` menghasilkan 178 berkas identik byte, atau pemeriksaan pengganti 0 kelas baru). Hanya berkas di tabel "Berkas yang dibuat dan diubah" yang berubah.
- [ ] AC-18 **Dokumen.** `NASKAH.md` memuat bagian "Set tokoh dan latar titik (bank awal)" dengan tabel D-1 dan D-2 yang disetujui; `STATUS.md` mencatat Build dan Test; laporan `tests/JS-05-hasil.md` memuat setiap kriteria.

## Rencana uji

### Uji konten (Vitest di Node, `app/jejak-setara/__tests__/konten/`)

| Berkas | Isi |
|---|---|
| `naskah-urai.ts` | Pembantu, bukan uji: mengurai `K-xx.md` (judul, tabel "Ringkasan", situasi satu paragraf, kedua langkah, petunjuk, kartu dampak, tabel rujukan, tabel "Pemeriksaan panjang") serta tabel pustaka, "Dokumen sumber", dan "Set tokoh dan latar titik" di `NASKAH.md`. Bentuk yang tidak dikenali menjadi galat yang menyebut berkas dan bagiannya |
| `bank-skema.test.ts` | AC-2: bank lolos skema dan `periksaBank` tanpa temuan; isi dan urutan 23/16/1; dua kejadian per zona |
| `bank-aturan.test.ts` | AC-3: satu kejadian sah (salinan K-03) tanpa temuan; contoh cacat per kode (di bawah); contoh bank cacat; `periksaPaketPeta`; `adaGalat`; fungsi teks |
| `bank-protokol.test.ts` | AC-7 |
| `bank-aset.test.ts` | AC-8 (bagian berkas dan kredit) |
| `bank-semai.test.ts` | AC-9 sampai AC-14 dan bagian SQL AC-6 |
| `bank-peta.test.ts` | AC-15 |
| `naskah-cocok.test.ts` | AC-4, AC-5, AC-6 (pustaka), dan tabel set tokoh di `NASKAH.md` (AC-8) |

Contoh cacat minimal di `bank-aturan` (setiap baris mengubah salinan K-03, kecuali disebut lain):

| Kode | Contoh |
|---|---|
| `BENTUK` | Kolom `judul` dihapus |
| `KOLOM_ASING` | Kolom `status: "terbit"` ditambahkan |
| `TEKS_KOSONG` | `topik` = "" |
| `TEKS_PANJANG` | `judul` 33 karakter |
| `TEKS_POLOS` | Situasi berisi `<b>`; situasi berisi `https://contoh.id`; judul berspasi ganda; judul berisi U+200B |
| `FORMAT` | `kode` = "K13"; kunci `NPC_Bayu`; id pilihan "x1" |
| `JUMLAH` | Tiga pilihan Langkah 1; `setTokoh` kosong; lima kunci; rujukan kosong |
| `NILAI` | `zona` = "z9"; tingkat "baik" |
| `SITUASI_KALIMAT` | "Satu. Dua. Tiga. Empat."; situasi tanpa tanda akhir |
| `OPSI_BENAR` | Empat pilihan benar; tidak ada pilihan benar |
| `OPSI_TEPAT` | Ketiga pilihan Langkah 2 bertingkat `kurang` |
| `OPSI_ID` | Id pilihan kedua sama dengan pilihan pertama |
| `OPSI_KEMBAR` | Teks pilihan Langkah 2 kedua = teks pilihan pertama dalam huruf besar |
| `PETUNJUK_MENYALIN` | Petunjuk memuat 25 karakter pertama pilihan benar |
| `RUJUKAN_TIDAK_ADA` | Rujukan `JR-99` |
| `RUJUKAN_KEMBAR` | Rujukan `JR-01` dua kali |
| `SET_TOKOH_KEMBAR` | `obj_bola` dua kali |
| `SET_TOKOH_TIDAK_ADA` | `npc_naga_bawah_diam` |
| `KAPITAL_TENGAH` | "Kamu melihat Tono di dekat kantin." (peringatan) |
| `KODE_KEMBAR`, `RUJUKAN_ID_KEMBAR`, `RUJUKAN_BERSTATUS`, `RUJUKAN_TIDAK_DIPAKAI`, `PAKET_NAMA_KEMBAR`, `PAKET_KEJADIAN_TIDAK_ADA`, `PAKET_KEJADIAN_KEMBAR` | Salinan bank: rujukan pertama diberi status, id rujukan kedua disamakan, kode kejadian kedua disamakan, paket digandakan, isi paket ditambah `K-99` dan `K-01`, rujukan `JR-24` yang tidak dipakai ditambahkan |
| `PAKET_TITIK_KURANG` | Zona Paket inti 16 dengan titik z3 = 1 (titik zona lain 2): satu temuan berletak `paket/z3` |

Fungsi teks: `hitungKalimat("Satu. “Dua!” Tiga?")` = 3; `potonganSamaTerpanjang("Perhatikan ibu itu", "IBU ITU sakit")` = "ibu itu"; `kataKapitalTengah("Saya dan Tono ke SD. Lalu “Ayo!” kata Pak Made.")` = ["Tono"].

Contoh `adaD1` di `bank-semai`: komentar baris berisi `"d1_databases"` → salah; komentar blok berisi `"d1_databases"` → salah; komentar di ujung baris yang menyebut `"d1_databases"` → salah; teks berkutip berisi `\"d1_databases\":` → salah; `"$schema"` berisi `https://` lalu `"d1_databases": []` di baris yang sama → benar; `{ "d1_databases": [] }` → benar; `d1_databases` di dalam `env.uji` dengan komentar di ujung baris → benar; `wrangler.jsonc` JS-01 → salah.

Uji perintah semai memakai salinan sementara berisi `scripts/jejak-setara/semai.mjs`, `server/jejak-setara/seed/bank-awal.json`, dan `server/jejak-setara/wrangler.jsonc`, sehingga hasilnya tidak bergantung pada isi `wrangler.jsonc` repositori dan tidak pernah menjalankan `wrangler`. Folder sementara dihapus sesudah uji.

### Perintah di tahap Test

1. `content:check:jejak`, `test:jejak` (termasuk `kemurnian.test.ts`), dan `build:jejak`.
2. `tsc --noEmit` untuk berkas baru, dan ESLint `--max-warnings 0` untuk `app/jejak-setara/inti/konten` serta uji konten.
3. `node scripts/jejak-setara/semai.mjs --sql` dan `--jalankan -- --local` (harus "Belum tersedia" sampai JS-03).
4. Pemeriksaan galeri (`build:pages` 178 berkas identik byte, atau pengganti `compile` tailwindcss seperti di Plan).
5. `test:e2e:jejak` dan `sim:beban` tidak diwajibkan: JS-05 tidak mengubah layar, protokol, inti ruang, atau kiriman ke D1 (AGENTS 4.4 langkah 6). Bila lingkungan memungkinkan, `test:e2e:jejak` tetap dijalankan untuk memastikan tidak ada yang berubah.

Lingkungan agen tidak bisa memasang paket, jadi `vitest`, `tsc`, ESLint, dan `build:pages` dijalankan dengan pengganti seperti Test JS-02 (`zod`, `tsx`, `typescript`, dan `tailwindcss` dari alat global), dan setiap pengganti dicatat di laporan. Hasil pastinya terlihat di alur kerja "Jejak: uji" sesudah push.

### Daftar periksa manual

Tidak ada daftar periksa layar (AGENTS bagian 9) yang berlaku, karena JS-05 tidak punya layar. Pemeriksaan manual oleh pemilik proyek: D-1 sampai D-5 di spesifikasi ini, dan kecocokan catatan rujukan saat Peninjau memverifikasi di konsol (JS-12).

## Hasil pemeriksaan prototipe (7 November 2026)

Diperiksa dengan prototipe di luar repositori (Node 22.23.4, `zod` 3.25.76, `tsx` 4.23.12, TypeScript 6.0.3, SQLite 3.53.4 bawaan Node), memakai `acak.ts` dan `protokol.ts` JS-02 yang asli:

- Bank prototipe 67.554 byte (13.329 byte sesudah gzip). `periksaBank` 0 temuan dalam sekitar 10–18 ms. Ke-30 contoh cacat kejadian, 7 contoh cacat bank, dan 2 contoh peta tertangkap semua.
- Ke-16 kejadian sama dengan naskahnya; ke-11 teks R-xx sama dengan Sehari Setara; ke-81 pesan protokol lolos (terbesar: `data_pembahasan` 2.207 byte dan `selesai` 9.369 byte).
- SQL 73 pernyataan, 71.682 byte, pernyataan terpanjang 3.131 byte. Semai pertama, semai ulang sesudah suntingan, lima skenario semai terputus, dan uji tanda kutip berhasil di tabel `kontrak-d1.sql`.
- Perintah semai: semua status di tabel "Status antarmuka" yang tidak menjalankan `wrangler` sudah dicoba. Prototipe menemukan satu masalah, yaitu galat EPIPE saat keluaran `--sql` dipotong (`| head`), yang kini ditangani (P-26).
- Kemurnian: `skema.ts` dan `periksa.ts` lolos pemindai `kemurnian.test.ts`. `tsc --strict` 0 galat dengan target ES2017 seperti `tsconfig.json`.
- Galeri: kelima berkas baru prototipe menambah 0 kelas Tailwind.
