# JS-05 — Semai tambahan

| | |
|---|---|
| Status | Spesifikasi (22 November 2026), menunggu "Spesifikasi disetujui: semai tambahan" |
| Sesi | B (Naskah dan rujukan). Rencana dan status ada di `docs/jejak-setara/naskah/STATUS.md`, bagian "Plan semai tambahan (lanjutan JS-05)", bukan di `PLAN.md` (AGENTS bagian 4.1) |
| Keputusan Gerbang 1 | Balasan "Setuju: semai tambahan" (22 Nov 2026): semua saran (a), yaitu KT-B15 sampai KT-B19 dijawab a, dan Permintaan A-16 serta A-17 diajukan |
| Batas berkas | `docs/jejak-setara/naskah/`, `server/jejak-setara/seed/`, `scripts/jejak-setara/semai.mjs`, berkas berawalan `naskah-` atau `bank-` di `app/jejak-setara/__tests__/konten/`, serta spesifikasi ini dan laporan ujinya (Plan semai tambahan, disetujui 22 Nov 2026). Perubahan berkas lain ditulis sebagai Permintaan untuk Sesi A di `STATUS.md` |
| Syarat sebelum Build diserahkan | (1) Permintaan A-15 diterapkan ("Tuli" di `NAMA_DIRI`). (2) Aset prasasti, kukang dalam kandang, dan penjualnya Disetujui di `CREDITS.md`, dan kuncinya masuk `KUNCI_ASET_DISETUJUI` (A-17). (3) Kunci final itu dicatat di naskah (P-24). Build boleh dimulai sesudah Gerbang 2, tetapi ZIP-nya baru diserahkan sesudah ketiga syarat ini terpenuhi (KT-B15a) |

## Ringkasan

Semai tambahan memasukkan ke-24 kejadian tambahan (K-17 sampai K-40), 20 rujukan barunya (JR-24 sampai JR-43), Paket lanjutan 24, dan Paket lengkap 40 ke D1. Semai ini berjalan sekali per basis data, lewat langkah semai yang sudah ada. Isinya empat bagian:

1. **Berkas data** `server/jejak-setara/seed/bank-tambahan-1.json`, berbentuk sama dengan bank awal dan sama huruf demi huruf dengan naskah di `naskah/tambahan/`.
2. **Semai tambahan** di `scripts/jejak-setara/semai.mjs`. Semai ini "semua atau tidak sama sekali": tidak menulis apa pun bila kodenya sudah terpakai atau bank awal belum disemai, lalu mencetak status sesudah semai.
3. **Uji konten**: dua berkas uji baru, dan satu pembantu uji yang diperluas tanpa mengubah perilaku lamanya.
4. **Naskah**: kunci aset final K-32 dan K-33, dicatat di naskah sebelum Build diserahkan.

Tidak ada layar baru, perubahan server, perubahan protokol, migrasi, atau perubahan alur kerja. Langkah "Semai bank awal" di "Jejak: uji" sudah menjalankan `semai.mjs --jalankan`, jadi semai tambahan ikut berjalan sesudah push. Bank awal (`bank-awal.json`) dan SQL semai bank awal tidak berubah.

## Kaitan PRD

| Acuan | Yang dipenuhi |
|---|---|
| JFR-15 | 24 kejadian tambahan, tiga di setiap zona |
| JFR-16 | Isi dialog dua langkah dan kartu dampak, persis naskah yang disetujui |
| JFR-21 | Urutan pilihan yang disimpan mengikuti naskah (D-3); urutan yang dilihat pemain tetap diacak per pemain (JS-08) |
| JFR-43 | Status awal kejadian tambahan `tinjau` (Siap tinjau), dengan satu versi `kerja`, seperti bank awal |
| JFR-45 | 20 rujukan baru: teks, sumber, catatan untuk Peninjau, dan status `belum` |
| JFR-46 | Paket lanjutan 24 dan Paket lengkap 40, aktif (KT-B11, KT-B18) |
| Architecture JA-10, 10.6 | Isi bank masuk dari repositori sekali per basis data, lalu disunting di konsol; agen dan skrip tidak pernah menyemai `terverifikasi`. Catatan semai tambahan untuk bagian 10.6 diminta di A-16 |
| AGENTS 7 dan 8 | Rujukan tidak pernah disemai atau ditandai terverifikasi (aturan 7) |

## Berkas yang dibuat dan diubah

| Berkas | Baru atau diubah | Tahap | Isi |
|---|---|---|---|
| `docs/jejak-setara/specs/JS-05-semai-tambahan.md` | Baru | Gerbang 2 | Spesifikasi ini |
| `docs/jejak-setara/naskah/STATUS.md` | Diubah | Gerbang 1, Gerbang 2, Build, Test | Keputusan, riwayat, Permintaan untuk Sesi A |
| `docs/jejak-setara/naskah/tambahan/NASKAH-TAMBAHAN.md`, `K-32.md`, `K-33.md` | Diubah | Build | Kunci aset final K-32 dan K-33 (P-24) |
| `server/jejak-setara/seed/bank-tambahan-1.json` | Baru | Build | Bank tambahan (P-1 sampai P-7) |
| `scripts/jejak-setara/semai.mjs` | Diubah | Build | Semai tambahan dan status (P-9 sampai P-18); bagian bank awal tidak berubah |
| `app/jejak-setara/__tests__/konten/naskah-urai.ts` | Diubah | Build | Pengurai menerima folder naskah tambahan, serta pembaca `NASKAH-TAMBAHAN.md` dan bank tambahan (P-23) |
| `app/jejak-setara/__tests__/konten/naskah-tambahan-cocok.test.ts` | Baru | Build | Bank tambahan sama dengan naskah (P-20) |
| `app/jejak-setara/__tests__/konten/bank-tambahan.test.ts` | Baru | Build | Aturan, paket, SQL, skenario SQLite, dan perintah (P-21) |
| `docs/jejak-setara/tests/JS-05-semai-tambahan-hasil.md` | Baru | Test | Laporan uji |

Tidak disentuh: `bank-awal.json`, uji bank awal yang sudah ada (`bank-*.test.ts` dan `naskah-cocok.test.ts`), `app/jejak-setara/inti/` (termasuk `inti/konten/`), `package.json`, lockfile, alur kerja, `wrangler.jsonc`, migrasi, keempat dokumen utama, `PLAN.md`, aset, serta kode dan dokumen Sehari Setara.

## Perilaku

### Bank tambahan (`server/jejak-setara/seed/bank-tambahan-1.json`)

- **P-1** Bank berisi `versi: 1`, 20 rujukan JR-24 sampai JR-43 berurutan, 24 kejadian K-17 sampai K-40 berurutan, dan 2 paket menurut D-1, berurutan Paket lanjutan 24 lalu Paket lengkap 40.
- **P-2** Setiap teks kejadian sama huruf demi huruf dengan naskahnya di `naskah/tambahan/K-xx.md`, dengan aturan yang sama seperti spesifikasi JS-05 P-20. Bagian yang dibandingkan: judul, situasi, kedua pertanyaan, teks pilihan, umpan balik, petunjuk, "yang terjadi", hak, kewajiban, topik, `zona`, `jenis`, dan `kartu.rujukan`.
- **P-3** Urutan pilihan yang disimpan sama dengan urutan baris tabel naskah (D-3). Id diberikan menurut posisi: `1a` sampai `1d` untuk Langkah 1, dan `2a` sampai `2c` untuk Langkah 2. "Ya" di kolom Benar menjadi `benar: true`. Tingkat mengikuti JS-05: Tepat → `tepat`, Kurang tepat → `kurang`, Berisiko → `berisiko`.
- **P-4** `setTokoh` setiap kejadian sama dengan kolom kunci di tabel "Set tokoh dan latar titik" `NASKAH-TAMBAHAN.md`, berurutan seperti di tabel itu dan tanpa tanda *(usulan)*.
- **P-5** Setiap rujukan:
  - `teks` sama dengan kolom "Teks rujukan" pustaka `NASKAH-TAMBAHAN.md`;
  - `sumber` dan `catatan` sama dengan kolom "Sumber" dan "Catatan untuk Peninjau" di tabel "Sumber dan catatan untuk pustaka konsol";
  - `kodeSehari` berisi `null`, karena kolom "Padanan Sehari" ke-20 rujukan itu "Baru".
- **P-6** Kedua paket memakai nama dan deskripsi D-1. Isinya kode berurutan: K-17 sampai K-40 untuk Paket lanjutan 24, dan K-01 sampai K-40 untuk Paket lengkap 40.
- **P-7** Format berkas sama dengan JS-05 P-25: UTF-8 tanpa BOM, indentasi dua spasi, diakhiri satu baris baru, dan tanpa kata "terverifikasi". Urutan kolom sama dengan bank awal (bagian "Data").
- **P-8** Gabungan bank awal dan bank tambahan diperiksa `periksaBank` dengan `KUNCI_ASET_DISETUJUI`. Gabungan itu berisi rujukan, kejadian, dan paket kedua berkas, berurutan bank awal lalu tambahan. Hasilnya harus 0 galat dan 0 peringatan. Kode kejadian, id rujukan, dan nama paket tambahan tidak sama dengan milik bank awal. Setiap paket memuat paling banyak 6 kejadian per zona (A-14) dan lolos `periksaPaketPeta` terhadap `app/jejak-setara/peta/kampung.json`.

### SQL semai tambahan

- **P-9** `sqlSemaiTambahan(bank)` selalu menghasilkan pernyataan yang sama untuk bank yang sama. Untuk bank tambahan 1 jumlahnya 137, berurutan:
  1. satu izin;
  2. 20 rujukan;
  3. untuk setiap kejadian, satu baris `kejadian` lalu satu versi;
  4. untuk setiap paket, satu paket lalu isinya (24 dan 40 baris);
  5. penanda;
  6. penghapusan izin.

  Bentuk setiap pernyataan ada di bagian "Data".
- **P-10** **Izin.** Izin (`semai_tambahan_1_izin` di tabel `pengaturan`) hanya ditulis bila tiga syarat terpenuhi bersama:
  - penanda `semai_tambahan_1` belum ada;
  - penanda `semai_bank_awal` sudah ada;
  - basis data belum memuat satu pun kode kejadian, id rujukan, atau nama paket dari bank tambahan.
- **P-11** **Semua atau tidak sama sekali.** Setiap pernyataan sisipan selain izin dan penanda hanya berlaku bila izin ada dan penanda belum ada. Sisipan yang bertabrakan dengan baris yang sudah ada tidak melakukan apa pun (`ON CONFLICT DO NOTHING`). Penanda hanya ditulis bila izin ada. Pernyataan terakhir menghapus izin.

  Akibatnya:
  - bila salah satu syarat P-10 tidak terpenuhi, tidak ada baris yang ditulis, dan penanda tidak terpasang, sehingga semai berikutnya mencoba lagi;
  - bila penanda sudah ada, semai ulang tidak mengubah satu baris pun, termasuk suntingan konsol;
  - basis data di luar bank tambahan tidak berubah.
- **P-12** **Semai terputus.** Bila semai berhenti sesudah izin tertulis tetapi sebelum penanda, izin masih ada. Semai berikutnya melengkapi baris yang belum ada tanpa mengubah baris yang sudah ada, menulis penanda, lalu menghapus izin.
- **P-13** **Nilai yang ditulis.** Sama dengan JS-05 P-30, dengan empat perbedaan:
  - id menurut P-40 JS-05, memakai `DASAR_ID` yang sama dan nama `kejadian/K-xx`, `kejadian_versi/K-xx/1`, serta `paket/<nama>`;
  - `catatan_perubahan` versi menurut D-2;
  - isi paket berurutan 1–24 dan 1–40;
  - nilai penanda `{"versi":1,"rujukan":20,"kejadian":24,"paket":2}`, dan nilai izin `{}`.
- **P-14** Aturan teks SQL JS-05 P-31 dan P-32 berlaku:
  - semua teks lewat `kutip`;
  - tidak ada `BEGIN`, `COMMIT`, atau kata "terverifikasi";
  - setiap `INSERT … SELECT` memiliki `WHERE`;
  - setiap pernyataan paling besar 100.000 byte.
- **P-15** `sqlStatusTambahan(bank)` menghasilkan satu kueri `SELECT` yang mengembalikan satu baris dengan tiga kolom:
  - `sudah`: 1 bila penanda tambahan ada, 0 bila belum;
  - `awal`: 1 bila penanda bank awal ada, 0 bila belum;
  - `ada`: kode kejadian, id rujukan, dan nama paket dari bank tambahan yang sudah ada di basis data, dipisah ", ", atau `NULL` bila tidak ada.

### Perintah semai

- **P-16** `--sql`, cara pakai, dan semua status perintah JS-05 tidak berubah. `--sql` tetap mencetak SQL bank awal saja.
- **P-17** Ketika `semai.mjs --jalankan [-- <bendera>]` dijalankan, maka berurutan:
  1. Langkah 1 sampai 3 JS-05 P-33 dijalankan apa adanya: bank awal, `d1_databases`, dan `wrangler`.
  2. Bila `server/jejak-setara/seed/bank-tambahan-1.json` ada, berkas itu dibaca dengan `bacaBank`. Bila tidak sah, pesan "Bank tambahan tidak sah" dicetak, dan skrip selesai dengan kode 1 sebelum apa pun dijalankan.
  3. Berkas SQL sementara berisi `teksSql(bank awal)` lalu `teksSqlTambahan(bank tambahan)`, dan dijalankan seperti JS-05 P-33 langkah 4. Bila `wrangler` gagal, pesan gagal JS-05 dicetak, kueri status tidak dijalankan, dan kode keluarnya mengikuti `wrangler`.
  4. Bila berhasil, pesan selesai bank awal dicetak tanpa perubahan. Lalu `sqlStatusTambahan` dijalankan dengan `wrangler d1 execute DB --config server/jejak-setara/wrangler.jsonc --command <kueri> --json --yes`, ditambah bendera lokasi dan bendera sesudah `--` yang sama seperti langkah 3.
  5. Pesan status tambahan dicetak ke stdout menurut `pesanStatusTambahan` (tabel teks). Kueri status yang gagal, atau keluaran yang tidak bisa dibaca, menghasilkan pesan "tidak terbaca". Kode keluar tetap 0, karena hasil kueri status tidak pernah mengubah kode keluar.
  6. Folder sementara dihapus, berhasil ataupun gagal.

  Bila berkas bank tambahan tidak ada, perintah berjalan persis seperti JS-05.
- **P-18** **Peringatan di GitHub.** Bila variabel lingkungan `GITHUB_ACTIONS` bernilai `true`, pesan status yang berupa peringatan diawali `::warning title=Semai tambahan::`. Dengan begitu pesan itu tampil di ringkasan alur kerja, tanpa membuat alur kerja merah (KT-B16a).
- **P-19** Basis data yang dituju hanya ditentukan oleh bendera. Agen tidak pernah menjalankan semai dengan `--remote` (JS-05 P-34).

### Uji dan pembantu uji

- **P-20** Uji `naskah-tambahan-cocok` membaca ke-24 naskah di `naskah/tambahan/` dan `NASKAH-TAMBAHAN.md`. Uji ini memastikan:
  - setiap naskah tercantum di tabel "Kejadian" dengan judul yang sama dan status "Disetujui";
  - isi bank tambahan memenuhi P-2 sampai P-6;
  - angka di "Pemeriksaan panjang" setiap naskah sama dengan hitungan ulang;
  - setiap teks rujukan di naskah sama dengan pustaka.
- **P-21** Uji `bank-tambahan` memeriksa:
  - skema bank tambahan dan P-8;
  - bentuk SQL (P-9 sampai P-14);
  - skenario SQLite (P-22);
  - `sqlStatusTambahan` dan `pesanStatusTambahan` di setiap skenario;
  - perintah `--jalankan` pada salinan sementara repositori: bank tambahan tidak sah, dan bank tambahan tidak ada.
- **P-22** Skenario SQLite memakai `node:sqlite` dan semua migrasi, seperti JS-05 P-39, dengan skenario dan kondisi lewati yang sama:
  1. **Semai pertama:** bank awal lalu tambahan menghasilkan 43 rujukan berstatus `belum`, 40 kejadian `tinjau`, 40 versi `kerja` yang isinya sama dengan berkas, 3 paket (16, 24, dan 40 isi), serta dua penanda, tanpa izin.
  2. **Ulang:** semai ulang tidak mengubah apa pun.
  3. **Suntingan konsol:** rujukan ditandai terverifikasi, isi versi diubah, kejadian diarsipkan, dan isi paket dikurangi. Semua suntingan itu bertahan sesudah semai diulang.
  4. **Tabrakan:** dicoba satu per satu dengan kejadian K-17, rujukan JR-24, dan paket bernama "Paket lanjutan 24" yang sudah ada. Tidak ada baris tambahan yang ditulis, penanda dan izin tidak ada, dan `ada` menyebut baris yang bentrok. Sesudah baris itu dihapus, semai berikutnya menulis semuanya.
  5. **Bank awal belum disemai:** tambahan saja tidak menulis apa pun. Sesudah bank awal lalu tambahan dijalankan, hasilnya sama dengan skenario 1.
  6. **Terputus:** izin dan sebagian baris tambahan sudah ada. Semai berikutnya melengkapi semuanya, sehingga hasilnya sama dengan skenario 1.
- **P-23** `naskah-urai.ts` dipakai untuk bank awal maupun tambahan:
  - `uraiNaskah(kode, folder)` menerima folder naskah, dengan nilai bawaan `docs/jejak-setara/naskah`, sehingga pemanggilan yang sudah ada tidak berubah;
  - pembantu baru membaca tabel `NASKAH-TAMBAHAN.md` dan bank tambahan;
  - uji bank awal yang sudah ada tidak diubah dan tetap lulus.

### Naskah

- **P-24** Sebelum Build diserahkan, Sesi B mengganti kunci usulan K-32 dan K-33 dengan nama berkas aset yang Disetujui:
  - di tabel "Set tokoh dan latar titik" `NASKAH-TAMBAHAN.md`, sekaligus menghapus tanda *(usulan)* dan kalimat penjelasnya;
  - di catatan "Untuk Sesi C" `K-32.md` dan `K-33.md`.

  Bila Sesi C memakai nama yang diusulkan, cukup tandanya yang dihapus. Teks yang tampil bagi pemain tidak berubah.

## Beberapa pemain sekaligus

Tidak berlaku: semai tambahan tidak menyentuh ruang atau protokol. Dua semai yang berjalan bersamaan pada basis data yang sama tetap aman. Sisipan yang bertabrakan tidak melakukan apa pun, penanda ditulis sekali, dan alur kerja "Jejak: uji" tidak berjalan ganda (`concurrency`).

## Status antarmuka

Tidak ada layar. Status perintah semai yang baru atau berubah (status JS-05 lainnya tetap):

| Status | Kapan | Keluaran | Kode keluar |
|---|---|---|---|
| Bank tambahan tidak sah | `--jalankan`, berkas bank tambahan ada tetapi bentuk dasarnya salah | Pesan galat beserta alasannya | 1 |
| Berhasil, tambahan selesai | `wrangler` berhasil, penanda tambahan ada | Pesan selesai bank awal, lalu pesan selesai tambahan | 0 |
| Berhasil, tambahan ditunda | `wrangler` berhasil, penanda tambahan belum ada | Pesan selesai bank awal, lalu peringatan "ditunda" | 0 |
| Berhasil, status tidak terbaca | `wrangler` berhasil, kueri status gagal atau keluarannya tidak terbaca | Pesan selesai bank awal, lalu peringatan "tidak terbaca" | 0 |
| Tanpa bank tambahan | Berkas bank tambahan tidak ada | Persis JS-05 | Seperti JS-05 |

## Teks yang tampil (final)

1. **Isi 24 kejadian dan 20 rujukan:** persis naskah yang sudah disetujui. Semai tambahan tidak menambah atau mengubah satu kata pun.
2. **Paket dan catatan versi:** D-1 dan D-2. Teks ini tampil di konsol (daftar paket dan riwayat versi), dan nama paket juga tampil di dialog ruang baru.
3. **Pesan perintah semai**, untuk pengembang dan log alur kerja (D-4):

| Status | Teks |
|---|---|
| Keterangan di baris pertama SQL tambahan | `-- Semai tambahan Jejak Setara (lanjutan JS-05), dibuat oleh scripts/jejak-setara/semai.mjs dari server/jejak-setara/seed/bank-tambahan-1.json.` |
| Bank tambahan tidak sah (stderr) | `Bank tambahan tidak sah: {alasan}. Jalankan content:check:jejak untuk rinciannya.` Alasannya sama dengan JS-05 (`bacaBank`) |
| Tambahan selesai (stdout) | `Semai tambahan selesai. Kejadian tambahan (20 rujukan, 24 kejadian, 2 paket) sudah ada di basis data ini; baris yang sudah ada tidak pernah ditimpa.` (angka diambil dari bank) |
| Ditunda, kode sudah terpakai (stdout, peringatan) | `Semai tambahan ditunda: {daftar} sudah ada di basis data ini. Hapus di konsol bila itu hanya percobaan; deploy berikutnya akan mencoba lagi.` `{daftar}` berisi kode yang bentrok, dipisah koma, berurutan seperti di bank: kejadian, rujukan, lalu paket |
| Ditunda, bank awal belum disemai (stdout, peringatan) | `Semai tambahan ditunda: bank awal belum disemai di basis data ini.` |
| Status tidak terbaca (stdout, peringatan) | `Status semai tambahan tidak terbaca. Lihat daftar kejadian di konsol untuk memastikan K-17 sampai K-40 sudah ada.` |

Bila `GITHUB_ACTIONS` bernilai `true`, setiap teks peringatan diawali `::warning title=Semai tambahan::` (P-18).

## Data, protokol, API, dan migrasi

### Bentuk `bank-tambahan-1.json`

Sama dengan `bank-awal.json` (spesifikasi JS-05, bagian "Bentuk `bank-awal.json`"):
- `versi` 1;
- `rujukan[]` berisi `id`, `teks`, `sumber`, `kodeSehari`, dan `catatan`;
- `kejadian[]` persis `IsiKejadian`, dengan urutan kolom yang sama;
- `paket[]` berisi `nama`, `deskripsi`, dan `kejadian`.

Prototipe Plan, yang disusun dari naskah, berukuran sekitar 98 KB.

### SQL semai tambahan

Bagian berulang (nilai `{…}` lain melewati `kutip`; `{waktu}` sama dengan JS-05):

- `{belum}` = `NOT EXISTS (SELECT 1 FROM pengaturan WHERE kunci = 'semai_tambahan_1')`
- `{izin}` = `EXISTS (SELECT 1 FROM pengaturan WHERE kunci = 'semai_tambahan_1_izin')`
- `{awal}` = `EXISTS (SELECT 1 FROM pengaturan WHERE kunci = 'semai_bank_awal')`
- `{bebas}` = `NOT EXISTS (SELECT 1 FROM kejadian WHERE kode IN ({kode})) AND NOT EXISTS (SELECT 1 FROM rujukan WHERE id IN ({id})) AND NOT EXISTS (SELECT 1 FROM paket WHERE nama IN ({nama}))`, dengan `{kode}`, `{id}`, dan `{nama}` berupa daftar semua kode kejadian, id rujukan, dan nama paket bank tambahan, berurutan seperti di bank

```sql
INSERT INTO pengaturan (kunci, nilai_json) SELECT 'semai_tambahan_1_izin', '{}' WHERE {belum} AND {awal} AND {bebas} ON CONFLICT (kunci) DO NOTHING;
INSERT INTO rujukan (id, teks, sumber, status, catatan, kode_sehari) SELECT {id}, {teks}, {sumber}, 'belum', {catatan}, {kodeSehari} WHERE {belum} AND {izin} ON CONFLICT (id) DO NOTHING;
INSERT INTO kejadian (id, kode, status, versi_terbit_id, pemilik_id, diubah_pada) SELECT {idKejadian}, {kode}, 'tinjau', NULL, NULL, {waktu} WHERE {belum} AND {izin} ON CONFLICT DO NOTHING;
INSERT INTO kejadian_versi (id, kejadian_id, nomor, isi_json, jenis, dibuat_oleh, dibuat_pada, catatan_perubahan) SELECT {idVersi}, k.id, 1, {isi_json}, 'kerja', NULL, {waktu}, 'Kejadian tambahan dari repositori (semai tambahan 1)' FROM kejadian k WHERE k.kode = {kode} AND {belum} AND {izin} AND NOT EXISTS (SELECT 1 FROM kejadian_versi v WHERE v.kejadian_id = k.id) ON CONFLICT DO NOTHING;
INSERT INTO paket (id, nama, deskripsi, aktif) SELECT {idPaket}, {nama}, {deskripsi}, 1 WHERE {belum} AND {izin} ON CONFLICT DO NOTHING;
INSERT INTO paket_kejadian (paket_id, kejadian_id, urutan) SELECT p.id, k.id, {urutan} FROM paket p, kejadian k WHERE p.id = {idPaket} AND k.kode = {kode} AND {belum} AND {izin} ON CONFLICT DO NOTHING;
INSERT INTO pengaturan (kunci, nilai_json) SELECT 'semai_tambahan_1', '{"versi":1,"rujukan":20,"kejadian":24,"paket":2}' WHERE {izin} ON CONFLICT (kunci) DO NOTHING;
DELETE FROM pengaturan WHERE kunci = 'semai_tambahan_1_izin';
```

Isi Paket lengkap 40 mencari K-01 sampai K-16 lewat kodenya. Bila salah satunya sudah dihapus di konsol, baris isi paket itu dilewati. Kueri status:

```sql
SELECT (SELECT count(*) FROM pengaturan WHERE kunci = 'semai_tambahan_1') AS sudah, (SELECT count(*) FROM pengaturan WHERE kunci = 'semai_bank_awal') AS awal, (SELECT group_concat(x, ', ') FROM (SELECT kode AS x FROM kejadian WHERE kode IN ({kode}) UNION ALL SELECT id FROM rujukan WHERE id IN ({id}) UNION ALL SELECT nama FROM paket WHERE nama IN ({nama}))) AS ada;
```

`pesanStatusTambahan` menyusun `{daftar}` dari isi `ada`, berurutan seperti di bank. Contoh id: K-17 → `1460701d-71cc-5288-870d-536a4df549b5`, versi kerja K-17 → `0d432993-63d1-5a63-a86e-0f5df3e33a29`, Paket lanjutan 24 → `e32f69ae-02ce-5a3f-aa1f-59617a4ba7b5`, dan Paket lengkap 40 → `15f2b22e-8edd-5588-8d6f-51385e459d68`.

Penyusunan SQL sebagai teks tetap pengecualian Architecture 17, seperti JS-05: isinya berasal dari berkas di repositori, dan semua teks lewat `kutip`.

### `scripts/jejak-setara/semai.mjs`

Ekspor JS-05 tetap, dengan isi dan keluaran yang sama. Ekspor baru:

| Ekspor | Isi |
|---|---|
| `JALUR_TAMBAHAN` | `"server/jejak-setara/seed/bank-tambahan-1.json"` |
| `PENANDA_TAMBAHAN`, `IZIN_TAMBAHAN` | `"semai_tambahan_1"` dan `"semai_tambahan_1_izin"` |
| `CATATAN_VERSI_TAMBAHAN` | D-2 |
| `sqlSemaiTambahan(bank)` | Larik pernyataan (P-9) |
| `teksSqlTambahan(bank)` | Baris keterangan, pernyataan, dan baris baru di akhir |
| `sqlStatusTambahan(bank)` | Kueri status (P-15) |
| `barisStatus(stdout)` | Baris pertama hasil kueri dari keluaran `--json` wrangler, atau `null` bila tidak bisa dibaca. Keluaran dibaca sebagai JSON; yang diambil adalah objek pertama yang memiliki larik `results` |
| `pesanStatusTambahan(baris, bank)` | `{ teks, peringatan }` menurut tabel teks. Bila `baris` berisi `null`, hasilnya "tidak terbaca" |

Skrip tetap hanya memakai modul bawaan Node. Format `--json` wrangler 4.92.0 dipastikan di Build dengan D1 lokal (AC-11); bentuk lain yang tidak terbaca selalu berakhir di pesan "tidak terbaca", tidak pernah galat.

### Protokol, API, dan migrasi

Tidak ada. Tabelnya dari `0001_awal.sql`.

## Aset

Tidak ada aset yang dibuat di sini. K-32 memakai prasasti, dan K-33 memakai kukang dalam kandang dan penjualnya; ketiganya dibuat Sesi C. Kuncinya masuk `KUNCI_ASET_DISETUJUI` lewat A-17 sebelum Build diserahkan. Kejadian lain memakai aset yang sudah Disetujui.

## Keamanan dan privasi

- Tidak ada data pribadi, akun, atau rahasia di berkas data maupun SQL.
- Rujukan selalu disemai berstatus `belum`, dan kata "terverifikasi" tidak ada di bank maupun SQL (AGENTS 7).
- Agen tidak pernah menjalankan semai dengan `--remote`. Semai jarak jauh hanya dijalankan alur kerja milik Sesi A.
- Pesan status hanya menyebut kode kejadian, id rujukan, dan nama paket, bukan isi basis data lainnya.

## Di luar cakupan

- Langkah semai produksi dan `jejak-produksi.yml` (A-5, Sesi A).
- Peringatan paket di konsol (A-14), dan perubahan konsol lainnya.
- Catatan Architecture 10.6 dan `PLAN.md` (A-16), serta kunci aset (A-17).
- Gambar K-32 dan K-33 (Sesi C).
- Verifikasi rujukan dan penerbitan kejadian (Peninjau, di konsol).
- Perubahan bank awal, dan impor bank JS-19.

## DRAF untuk ditinjau pemilik proyek

### D-1 Teks paket

| Nama paket | Deskripsi | Isi |
|---|---|---|
| Paket lanjutan 24 | Dua puluh empat kejadian tambahan, tiga di setiap zona. | K-17 sampai K-40 |
| Paket lengkap 40 | Empat puluh kejadian bank awal dan tambahan, lima di setiap zona. | K-01 sampai K-40 |

Nama mengikuti KT-B11. Deskripsi (paling banyak 160 karakter) dibuat mirip deskripsi Paket inti 16: "Enam belas kejadian bank awal, dua di setiap zona."

### D-2 Catatan versi

Catatan perubahan versi pertama setiap kejadian tambahan: `Kejadian tambahan dari repositori (semai tambahan 1)`. Teks ini tampil di riwayat versi konsol, di samping "Bank awal dari repositori (JS-05)" untuk K-01 sampai K-16.

### D-3 Urutan pilihan disimpan menurut naskah

Bank awal menyimpan urutan pilihan yang diacak sekali (JS-05 P-21), karena naskahnya selalu menaruh pilihan benar di baris pertama. Naskah tambahan berbeda: letak pilihan benar dan tepat sudah direncanakan dan dibagi rata di "Rencana posisi pilihan" `NASKAH-TAMBAHAN.md`. Pilihan benar ada di 1a, 1b, 1c, dan 1d masing-masing 6 kali, dan pilihan tepat di 2a, 2b, dan 2c masing-masing 8 kali. Karena itu urutan disimpan apa adanya. Mengacak lagi akan merusak sebaran yang sudah dibagi rata itu. Pemain tetap melihat urutan yang diacak per pemain (JS-08).

### D-4 Pesan semai tambahan

Teks di tabel "Teks yang tampil", butir 3. Pesan ini terbaca di log dan ringkasan alur kerja "Jejak: uji", bukan oleh siswa atau guru.

## Kriteria penerimaan

- [ ] AC-1 `bank-tambahan-1.json` ada, sah menurut skema, dan berisi 20 rujukan, 24 kejadian, serta 2 paket berurutan, dengan format P-7 (P-1, P-7).
- [ ] AC-2 Isi bank tambahan sama huruf demi huruf dengan naskah dan `NASKAH-TAMBAHAN.md`, termasuk urutan pilihan dan id, dan angka "Pemeriksaan panjang" sama dengan hitungan ulang (P-2 sampai P-6, P-20).
- [ ] AC-3 Gabungan bank awal dan tambahan lolos `periksaBank` dengan 0 galat dan 0 peringatan, tanpa kode, id, atau nama paket kembar (P-8). Kriteria ini memerlukan A-15 dan A-17.
- [ ] AC-4 Kedua paket sesuai D-1, memuat paling banyak 6 kejadian per zona, lolos `periksaPaketPeta`, dan `tempatkanKejadian` menempatkan semua kejadiannya untuk tiga benih ruang (P-6, P-8).
- [ ] AC-5 SQL tambahan sesuai P-9 sampai P-14: 137 pernyataan, selalu sama, tiap pernyataan paling besar 100.000 byte, tanpa `BEGIN`, `COMMIT`, atau "terverifikasi".
- [ ] AC-6 Keenam skenario SQLite P-22 lulus.
- [ ] AC-7 Di setiap skenario, `sqlStatusTambahan` dan `pesanStatusTambahan` menghasilkan nilai dan teks menurut tabel teks, termasuk awalan `::warning` bila `GITHUB_ACTIONS` bernilai `true` (P-15, P-17, P-18).
- [ ] AC-8 `--sql`, cara pakai, dan perilaku perintah JS-05 tidak berubah, dan uji bank awal yang sudah ada lulus tanpa diubah. Bank tambahan yang tidak sah menghasilkan pesan dan kode 1 (P-16, P-17).
- [ ] AC-9 `naskah-urai.ts` tetap mengurai naskah bank awal seperti sebelumnya, dan uji `naskah-cocok` lulus tanpa diubah (P-23).
- [ ] AC-10 Perintah resmi lulus: `content:check:jejak`, `test:jejak`, `test:jejak:server`, dan `build:jejak`.
- [ ] AC-11 Semai lokal sungguhan dengan `wrangler` 4.92.0, `--local`, dan folder sementara:
  - semai pertama menulis semuanya dan mencetak "Semai tambahan selesai";
  - semai kedua tidak mengubah apa pun;
  - di basis data lokal yang sudah berisi K-17 buatan sendiri, semai mencetak peringatan "ditunda" yang menyebut K-17.

  Bila lingkungan agen tidak bisa menjalankan D1 lokal, laporan uji mencatatnya, dan AC-12 menjadi buktinya.
- [ ] AC-12 Sesudah pemilik proyek push, "Jejak: uji" hijau, dan salah satu dari dua hal berikut terlihat:
  - konsol uji menampilkan K-17 sampai K-40 Siap tinjau, JR-24 sampai JR-43 belum diverifikasi, serta kedua paket;
  - ringkasan alur kerja memuat peringatan "Semai tambahan ditunda" yang menyebut kode yang bentrok.
- [ ] AC-13 Tidak ada berkas di luar batas berkas yang berubah, dan `bank-awal.json` tetap sama.

## Rencana uji

### Uji konten (Vitest di Node, `app/jejak-setara/__tests__/konten/`)

| Berkas | Isi |
|---|---|
| `naskah-tambahan-cocok.test.ts` | P-20: daftar dan status naskah, isi kejadian per naskah (24 uji), set tokoh, pustaka (teks, sumber, catatan, padanan), dan angka "Pemeriksaan panjang" |
| `bank-tambahan.test.ts` | P-7, P-8, D-1; bentuk dan aturan SQL (P-9 sampai P-14); skenario SQLite P-22; status dan pesan (P-15, P-17, P-18); perintah pada salinan sementara repositori, untuk bank tambahan tidak sah dan bank tambahan tidak ada |
| Uji bank awal yang sudah ada | Dijalankan tanpa perubahan, sebagai bukti AC-8 dan AC-9 |

### Perintah di tahap Test

1. `content:check:jejak`
2. `test:jejak`
3. `test:jejak:server`
4. `build:jejak`
5. Semai lokal sungguhan (AC-11): `node scripts/jejak-setara/semai.mjs --jalankan -- --local --persist-to <folder sementara>`, dijalankan dua kali, lalu sekali lagi di folder lain yang sudah diberi K-17. Agen tidak menjalankan `--remote`.

`test:e2e:jejak` dan `sim:beban` tidak diperlukan, karena tidak ada layar, protokol, atau inti ruang yang berubah (AGENTS 4.4 butir 6).

### Daftar periksa manual (pemilik proyek)

- Sesudah push, buka tab Actions dan pastikan "Jejak: uji" hijau. Lihat juga apakah ringkasannya memuat peringatan "Semai tambahan".
- Buka konsol uji. Pastikan K-17 sampai K-40 berstatus Siap tinjau, JR-24 sampai JR-43 belum diverifikasi, dan Paket lanjutan 24 serta Paket lengkap 40 ada. Lihat saja, tanpa mengubah apa pun. Verifikasi dan penerbitan dilakukan Peninjau sesudahnya.
