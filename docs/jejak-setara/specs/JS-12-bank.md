# JS-12 — Bank kejadian di konsol

| | |
|---|---|
| Status | Ditulis 15 November 2026 di tahap Specify, sesudah `Setuju: JS-12` (usulan 1a sampai 16a). Menunggu `Spesifikasi disetujui: JS-12` beserta pilihan DRAF D-1 sampai D-4 |
| Rencana | `PLAN.md`, bagian "JS-12 — Bank kejadian di konsol" |
| Sesi | Sesi A (mesin) |
| Bergantung pada | JS-04 (akun, peran, Peninjau) dan JS-05 (skema dan aturan konten), keduanya Selesai |

Ralat dari Plan: jumlah kode temuan validasi di `inti/konten/periksa.ts` adalah **28** (8 dari skema, 11 aturan satu kejadian, 9 aturan bank dan paket), bukan 48.

## Ringkasan

JS-12 memindahkan pengelolaan bank kejadian ke konsol. Admin dan guru melihat daftar kejadian dengan saringan, membuka penyunting berbagian dengan validasi langsung dan pratinjau seperti di HP, lalu menyimpan versi kerja. Kejadian berjalan dari Draf ke Siap tinjau, lalu Admin menerbitkannya menjadi versi tetap bernomor, bila validasi lulus dan semua rujukannya terverifikasi. Pustaka rujukan memuat teks, sumber JDIH, dan status; hanya akun bertanda Peninjau yang menandai Terverifikasi. Admin menyusun paket kejadian. Setiap perubahan bank dicatat di log audit. Sesudah 23 rujukan bank awal diverifikasi dan 16 kejadiannya terbit, dialog ruang baru JS-10 otomatis membolehkan ruang biasa.

## Kaitan

| Kebutuhan | Dipenuhi oleh |
|---|---|
| JFR-41 Daftar dengan saringan dan pencarian | P-4, P-5 |
| JFR-42 Penyunting, validasi langsung, pratinjau | P-6 sampai P-12 |
| JFR-43 Status; hanya Admin menerbitkan, syarat validasi dan rujukan terverifikasi | P-13 sampai P-15 |
| JFR-44 Versi tetap per terbitan | P-13, P-16 |
| JFR-45 Pustaka rujukan dan verifikasi Peninjau | P-17 sampai P-20 |
| JFR-46 Paket | P-21 sampai P-23 |
| PRD 11.1 dan KT-03 (dijawab 15 Nov 2026) | P-2 |
| Architecture 5.4, 10.5, 10.6; Permintaan A-7 | P-8, P-13 sampai P-20 |
| Plan usulan 1a sampai 16a | Seluruh dokumen |

## Berkas yang dibuat dan diubah

| Berkas | Baru/ubah | Isi |
|---|---|---|
| `app/jejak-setara/inti/bank.ts` | Baru | Skema isi API bank (kejadian, rujukan, paket), aturan status dan izin murni, pemetaan letak temuan ke kolom |
| `server/jejak-setara/src/api/bank.ts` | Baru | Rute `/api/kejadian…`, `/api/rujukan…`, dan `/api/paket…` (P-24) |
| `server/jejak-setara/src/db/bank.ts` | Baru | Kueri D1 bank (daftar, baca, simpan bersyarat, terbitkan, arsipkan, hapus, rujukan, paket, audit) |
| `server/jejak-setara/src/auth/izin.ts` | Ubah | Aksi bank (P-2) |
| `server/jejak-setara/src/index.ts` | Ubah | Rute bank |
| `app/jejak-setara/admin/rute.ts`, `App.tsx`, `Kerangka.tsx` | Ubah | Menu dan rute Kejadian, Rujukan, Paket (P-3) |
| `app/jejak-setara/admin/bank/` | Baru | `DaftarKejadian.tsx`, `Penyunting.tsx`, `BagianPenyunting.tsx`, `Pratinjau.tsx`, `Riwayat.tsx`, `Rujukan.tsx`, `DaftarPaket.tsx`, `PenyusunPaket.tsx`, `aset-tokoh.ts` (gambar kecil tokoh dan properti lewat `import.meta.glob`, tanpa `manifest.ts`) |
| `app/jejak-setara/admin/halaman/Dasbor.tsx` | Ubah | Kartu rujukan menautkan ke `#/rujukan` |
| `app/jejak-setara/pemain/pratinjau.ts`, `pemain/LayarPratinjau.tsx`, `pemain/App.tsx` | Baru dan ubah | Mode pratinjau layar pemain (P-11, P-12) |
| `app/jejak-setara/teks-konsol.ts`, `teks.ts` | Ubah | Teks bagian "Teks yang tampil (final)" |
| `app/jejak-setara/styles/kelas.css` | Ubah | Gaya halaman bank (hanya konsol) |
| Uji | Baru dan ubah | Bagian "Rencana uji" |
| `docs/jejak-setara/Architecture.md`, `PRD.md`, `PLAN.md`, `tests/JS-12-hasil.md` | Ubah dan baru | Architecture 3, 4.5, 10.1, 10.2, 10.5, 10.6; PRD 21 |

Tidak disentuh: Sehari Setara, galeri, `deploy-pages.yml`, migrasi D1 (semua tabel sudah ada), `semai.mjs`, berkas naskah Sesi B, dan berkas Sesi C.

## Perilaku

### Peran, menu, dan rute

- **P-1. Data awal.** Bank awal disemai sekali per basis data (JS-05): 16 kejadian berstatus `tinjau` dengan satu versi `kerja` dan `pemilik_id` kosong, 23 rujukan `belum`, dan Paket inti 16. Kejadian tanpa pemilik tampil sebagai milik "Bank awal" (D-4).
- **P-2. Izin (PRD 11.1, KT-03, usulan 2a).**

  | Aksi | Admin | Guru |
  |---|---|---|
  | Melihat daftar, isi, riwayat, dan pratinjau semua kejadian | Ya | Ya |
  | Membuat kejadian baru | Ya | Ya (pemiliknya) |
  | Menyimpan versi kerja dan mengajukan | Semua kejadian kecuali arsip | Hanya miliknya, berstatus Draf atau Siap tinjau |
  | Mengembalikan ke Draf, menerbitkan, mengarsipkan, memulihkan | Ya | Tidak |
  | Menghapus draf yang belum pernah terbit dan belum pernah dipakai ruang | Ya | Hanya miliknya |
  | Melihat pustaka rujukan | Ya | Ya |
  | Menambah rujukan | Ya | Ya (D-1) |
  | Mengubah dan menghapus rujukan | Ya | Tidak (D-1) |
  | Menandai dan membatalkan Terverifikasi | Bila bertanda Peninjau | Bila bertanda Peninjau |
  | Menyusun paket | Ya | Tidak |

  Aksi baru di `IZIN`: `kejadian.lihat`, `kejadian.sunting`, `kejadian.terbitkan`, `rujukan.lihat`, `rujukan.tambah`, `rujukan.sunting`, `paket.kelola`. Verifikasi memakai tanda Peninjau (JS-04), bukan peran. Kepemilikan guru diperiksa di server; yang tidak berwenang mendapat 403 `TIDAK_BERWENANG`.
- **P-3. Menu dan rute.** Menu konsol: Dasbor, Ruang, **Kejadian**, **Rujukan**, **Paket** (admin), Akun (admin), Sandi saya. Rute: `#/kejadian`, `#/kejadian/{kode}` (`K-` dan angka), `#/kejadian/baru`, `#/rujukan`, `#/paket`, `#/paket/{id}` (UUID). Bentuk lain menjadi dasbor (aturan JS-04). Kartu dasbor "Rujukan belum terverifikasi" menautkan ke `#/rujukan`.

### Daftar kejadian (JFR-41)

- **P-4. Isi daftar.** `GET /api/kejadian` mengembalikan semua kejadian (puluhan baris, tanpa halaman bertingkat): kode, judul (dari versi kerja), zona, topik, jenis, status, `adaPerubahan` (status Terbit dan isi versi kerja berbeda dari versi terbit), jumlah rujukan versi kerja yang belum terverifikasi, pemilik (nama tampilan atau "Bank awal"), `milikSaya`, dan waktu ubah.
- **P-5. Halaman `#/kejadian`.** Baris atas: "{n} kejadian" dan "+ Kejadian baru". Saringan zona, topik (dari topik yang ada), status, dan kotak "Milik saya"; kotak cari judul (tanpa membedakan huruf besar dan kecil). Tabel berkolom Kode, Judul, Zona (ikon dan nama), Topik, Status (dengan tanda "Ada perubahan belum terbit" bila perlu), Rujukan ("Lengkap" atau "{n} belum"), Pemilik, dan Diubah; baris menautkan ke penyunting. Di bawah 1024 px tabel menjadi kartu. Saringan disimpan di memori halaman selama sesi.

### Penyunting (JFR-42)

- **P-6. Halaman `#/kejadian/{kode}`.** Kepala: kode, judul, status, tanda "Ada perubahan belum terbit", dan pemilik. Bilah aksi sesuai peran dan status (P-14). Isian berbagian:
  1. **Identitas:** judul, zona (8 pilihan), topik, jenis (Pelanggaran hak, Pengabaian kewajiban, Keduanya).
  2. **Tokoh dan properti:** kisi pilihan dari kunci aset Disetujui (`npc_…`, `obj_…`) dengan gambar kecil dan nama, paling banyak 4, urutan pilihan dipertahankan.
  3. **Situasi.**
  4. **Langkah 1:** pertanyaan; empat pilihan, masing-masing dengan teks, tombol radio "Kunci", dan umpan balik; lalu petunjuk.
  5. **Langkah 2:** pertanyaan; tiga pilihan, masing-masing dengan teks, tingkat (Tepat, Kurang tepat, Berisiko), dan "yang terjadi".
  6. **Kartu dampak:** hak, kewajiban, dan 1–4 rujukan dari pustaka (pilihan dengan pencarian, menampilkan status setiap rujukan).
  7. **Riwayat versi** (P-16).

  Setiap kolom teks menampilkan hitungan "{n}/{batas}" sesuai Architecture 5.4. Guru yang tidak berwenang melihat semua isian dalam keadaan hanya baca, dengan keterangan alasannya.
- **P-7. Kejadian baru (D-3).** "+ Kejadian baru" membuka `#/kejadian/baru` dengan isian kosong dan zona pertama. Kejadian belum ada di server sampai Simpan pertama yang lolos validasi: server memberi kode berikutnya (`K-` dan angka terbesar + 1, dicoba ulang bila bentrok), status Draf, `pemilik_id` pembuatnya, dan satu versi kerja, lalu konsol pindah ke `#/kejadian/{kode}`.
- **P-8. Validasi langsung (Permintaan A-7).** Sesudah berhenti mengetik 300 ms, konsol menjalankan `periksaKejadian` (`inti/konten/periksa.ts`) dengan id rujukan dari pustaka dan kunci aset dari `GET /api/kejadian/pilihan`. Setiap temuan dipetakan dari `letak` ke kolomnya dan tampil di bawah kolom itu dengan kalimat tetap dari `TEKS_KONSOL.temuan` (28 kode, tabel di bawah). Galat menahan Simpan dan Ajukan; peringatan (`KAPITAL_TENGAH`, `RUJUKAN_TIDAK_DIPAKAI`) tidak menahan. Ringkasan di bilah aksi: "{n} galat" atau "Semua isian sah". Server menjalankan pemeriksaan yang sama saat Simpan, dan menolak dengan 400 `TEMUAN` beserta daftar temuan bila ada galat.
- **P-9. Simpan.** `PUT /api/kejadian/{kode}/kerja` dengan isi dan `diubahPada` versi kerja yang dibaca. Bila versi kerja sudah berubah sejak dibaca, server menjawab 409 `SUDAH_DIUBAH` dan konsol menampilkan "Kejadian ini sudah diubah orang lain. Muat ulang untuk melihat perubahannya." tanpa menimpa apa pun (usulan 12a). Berhasil: versi kerja diperbarui, `kejadian.diubah_pada` diisi, pemberitahuan "Tersimpan.", dan catatan audit `kejadian.simpan`. Menyimpan kejadian Terbit tidak mengubah statusnya; daftar dan kepala menandai "Ada perubahan belum terbit" (usulan 3a).
- **P-10. Perubahan belum tersimpan.** Selama ada perubahan yang belum disimpan, judul bilah aksi menampilkan "Belum disimpan", peramban memperingatkan saat tab ditutup, dan berpindah halaman di konsol meminta konfirmasi "Tinggalkan halaman? Perubahan yang belum disimpan akan hilang."
- **P-11. Pratinjau (usulan 8a).** Panel kanan penyunting (di bawah 1280 px: tombol "Pratinjau" yang membuka panel penuh) berisi bingkai `iframe` ke `/?pratinjau=1`, seukuran HP tegak 360 × 640 atau mendatar 731 × 411 (tombol "Tegak" dan "Mendatar"). Konsol mengirim `{ jenis: "jejak-pratinjau", isi, rujukan: [teks], bentuk }` lewat `postMessage` ke asal yang sama setiap kali isi berubah (sesudah jeda 300 ms yang sama) dan saat tombol "Mulai ulang" ditekan. Pratinjau menampilkan isi versi kerja yang sedang disunting, termasuk yang belum lolos validasi selama bentuknya bisa digambar; bila tidak, bingkai menampilkan "Lengkapi isian untuk melihat pratinjau."
- **P-12. Mode pratinjau layar pemain.** Bila halaman dibuka dengan `?pratinjau=1`, layar pemain tidak menyambung ke ruang, tidak memuat peta, dan hanya menerima pesan `postMessage` yang asalnya sama dan bentuknya sah. Ia menampilkan `DialogKejadian` dan `KartuDampak` yang sungguhan: Langkah 1 dengan pilihan dalam urutan asli A–D (D-2), umpan balik dan poin setempat (40 bila benar), Langkah 2, "yang terjadi" dan poin tingkat (60, 25, 0), lalu kartu dampak dengan teks rujukan. Pita kecil di atas berbunyi "Pratinjau. Di ronde, urutan pilihan diacak untuk setiap pemain." Tambahan kode layar pemain paling banyak 0,4 KB gzip.

### Status, versi, dan aksi (JFR-43, JFR-44)

- **P-13. Versi.** Setiap kejadian punya tepat satu versi `kerja` yang bisa diubah. **Terbitkan** menyalin isi versi kerja menjadi versi `terbit` baru bernomor (nomor terbit terbesar + 1, mulai 1) dengan penerbit, waktu, dan catatan perubahan; versi terbit tidak pernah diubah atau dihapus selama kejadiannya ada. `kejadian.versi_terbit_id` menunjuk versi terbit terbaru. Ruang baru memakai versi terbit (ruang biasa) atau versi kerja (ruang uji) yang berlaku saat ruang dibuat (JS-10 P-3).
- **P-14. Aksi** (`POST /api/kejadian/{kode}/aksi` dengan `{ aksi, catatan? }`):

  | Aksi | Dari status | Ke status | Syarat | Siapa |
  |---|---|---|---|---|
  | Ajukan | Draf | Siap tinjau | Validasi versi kerja lulus | Pemilik atau admin |
  | Kembalikan ke draf | Siap tinjau | Draf | — | Admin |
  | Terbitkan | Draf, Siap tinjau, atau Terbit dengan perubahan | Terbit | Validasi lulus dan semua rujukan versi kerja terverifikasi; catatan perubahan 1–200 karakter | Admin |
  | Arsipkan | Draf, Siap tinjau, atau Terbit | Arsip | Kejadian dikeluarkan dari semua paket | Admin |
  | Pulihkan dari arsip | Arsip | Draf | — | Admin |
  | Hapus | Draf atau Siap tinjau | (dihapus) | Belum pernah terbit dan belum pernah dipakai ruang (tidak ada baris `jawaban` untuk versinya) | Admin, atau guru pemilik |

  Tombol yang tidak berlaku tidak ditampilkan. Terbitkan yang belum memenuhi syarat ditampilkan nonaktif dengan alasan: daftar rujukan yang belum terverifikasi, atau "Masih ada {n} galat." Terbitkan, Arsipkan, dan Hapus memakai dialog konfirmasi (P-15). Setiap aksi dicatat di `log_audit` (P-25).
- **P-15. Konfirmasi.** Terbitkan: "Terbitkan {kode}?" dengan kolom "Catatan perubahan" (wajib). Arsipkan: "Arsipkan {kode}?" dengan isi "Kejadian ini keluar dari semua paket dan tidak bisa dipakai ruang baru. Statistiknya tetap tersimpan." Hapus: "Hapus {kode}?" dengan isi "Kejadian dan versi kerjanya dihapus permanen."
- **P-16. Riwayat versi.** Bagian Riwayat menampilkan setiap versi terbit (nomor, tanggal, penerbit, catatan perubahan), dengan tombol "Lihat" yang membuka isi versi itu di pratinjau dan dalam isian hanya baca. Kejadian yang belum pernah terbit: "Belum pernah terbit."

### Pustaka rujukan (JFR-45)

- **P-17. Halaman `#/rujukan`.** Daftar semua rujukan: id, teks, sumber (tautan, dibuka di tab baru), status ("Terverifikasi oleh {nama}, {tanggal}" atau "Belum"), dan jumlah kejadian yang memakainya (versi kerja atau terbit), dengan pencarian teks dan saringan status. Baris atas: "{n} rujukan, {m} belum terverifikasi" dan "+ Rujukan baru".
- **P-18. Tambah dan ubah.** Dialog berisi teks (≤ 160), sumber (1–3 alamat `https://`, satu per baris; disimpan dipisah " · ", ≤ 400), catatan (≤ 600, teks polos), dan kode Sehari Setara (pilihan, bentuk `R-` dan angka). Aturan Architecture 5.4 diperiksa di konsol dan server. Rujukan baru mendapat id `JR-` berikutnya (dua angka atau lebih) dan status `belum`. Mengubah **teks** rujukan yang terverifikasi mengembalikan statusnya ke `belum`, mengosongkan nama dan tanggal verifikasi, dan menampilkan peringatan sebelum simpan: "Mengubah teks membatalkan verifikasi. Kejadian yang memakainya tidak bisa terbit sampai rujukan ini diverifikasi ulang." Mengubah sumber, catatan, atau kode tidak mengubah status.
- **P-19. Verifikasi.** Akun bertanda Peninjau melihat tombol "Tandai terverifikasi" (dengan konfirmasi "Anda sudah memeriksa teks dan sumber rujukan ini?") dan "Batalkan verifikasi". `diverifikasi_oleh` dan `diverifikasi_pada` diisi atau dikosongkan otomatis. Akun tanpa tanda Peninjau tidak melihat kedua tombol, dan server menjawab 403 bila tetap dipanggil.
- **P-20. Hapus rujukan.** Hanya admin, dan hanya rujukan yang tidak dipakai versi mana pun ("Hapus JR-xx?").

### Paket (JFR-46)

- **P-21. Halaman `#/paket`** (admin): daftar paket (nama, jumlah kejadian, aktif, dan tanda "Siap untuk ruang biasa" dari `paketSiapRuangBiasa`), dan "+ Paket baru".
- **P-22. Penyusun `#/paket/{id}`.** Nama (≤ 40, unik), deskripsi (≤ 160), aktif; daftar kejadian berurutan dengan tombol "Naik", "Turun", dan "Keluarkan" per baris; pilihan "Tambah kejadian" berisi kejadian berstatus Siap tinjau atau Terbit yang belum ada di paket. Validasi Architecture 5.4: 1–64 kejadian tanpa kembar, dan jumlah kejadian per zona tidak melebihi titik zona itu (titik per zona dari `GET /api/kejadian/pilihan`). Simpan: `PUT /api/paket/{id}` dengan seluruh isi (kejadian sebagai daftar kode berurutan).
- **P-23. Paket nonaktif** tidak muncul di dialog ruang baru (JS-10). Paket tidak dihapus; menonaktifkan menggantikan hapus.

### API, audit, dan kinerja

- **P-24. Rute API** (semua `POST`, `PUT`, dan `DELETE` memeriksa CSRF; galat berbentuk `{ galat: { kode, pesan } }`):

  | Rute | Izin | Isi |
  |---|---|---|
  | `GET /api/kejadian` | `kejadian.lihat` | Daftar P-4 |
  | `GET /api/kejadian/pilihan` | `kejadian.lihat` | Zona, topik yang ada, kunci aset Disetujui, pustaka rujukan (id, teks, status), titik per zona |
  | `GET /api/kejadian/{kode}` | `kejadian.lihat` | Kejadian, versi kerja (isi, `diubahPada`), versi terbit terbaru, riwayat, temuan server, `bolehSunting`, `aksi` yang boleh |
  | `GET /api/kejadian/{kode}/versi/{nomor}` | `kejadian.lihat` | Isi satu versi terbit |
  | `POST /api/kejadian` | `kejadian.sunting` | Buat (P-7) |
  | `PUT /api/kejadian/{kode}/kerja` | `kejadian.sunting` + kepemilikan | Simpan (P-9) |
  | `POST /api/kejadian/{kode}/aksi` | Sesuai P-14 | Aksi |
  | `GET /api/rujukan` | `rujukan.lihat` | Daftar P-17 |
  | `POST /api/rujukan` | `rujukan.tambah` | Tambah |
  | `PUT /api/rujukan/{id}` | `rujukan.sunting` | Ubah |
  | `POST /api/rujukan/{id}/verifikasi` | Tanda Peninjau | `{ terverifikasi: boolean }` |
  | `DELETE /api/rujukan/{id}` | `rujukan.sunting` (admin) | Hapus |
  | `GET /api/paket`, `GET /api/paket/{id}` | `paket.kelola` | Daftar dan isi |
  | `POST /api/paket`, `PUT /api/paket/{id}` | `paket.kelola` | Buat dan simpan |

  Kode galat baru: `TEMUAN` (400), `SUDAH_DIUBAH` (409), `STATUS_KEJADIAN` (409), `BELUM_TERVERIFIKASI` (409), `MASIH_DIPAKAI` (409), `KEJADIAN_TIDAK_ADA` (404), `RUJUKAN_TIDAK_ADA` (404), `PAKET_TIDAK_ADA` (404), `NAMA_DIPAKAI` (409).
- **P-25. Log audit.** Setiap perubahan menulis satu baris `log_audit`: `pengguna_id`, `aksi` (`kejadian.buat`, `kejadian.simpan`, `kejadian.ajukan`, `kejadian.kembalikan`, `kejadian.terbitkan`, `kejadian.arsipkan`, `kejadian.pulihkan`, `kejadian.hapus`, `rujukan.tambah`, `rujukan.ubah`, `rujukan.verifikasi`, `rujukan.batal_verifikasi`, `rujukan.hapus`, `paket.buat`, `paket.simpan`), `sasaran` (kode, id rujukan, atau id paket), `rincian_json` ringkas (misalnya nomor versi atau status lama dan baru, tanpa isi kejadian), dan waktu. Halaman log audit menyusul (JFR-39).
- **P-26. Kinerja dan ukuran.** Setiap halaman memuat datanya sekali; daftar dan pustaka berisi puluhan baris. Konsol tetap di bawah 350 KB gzip; kode bank konsol tidak mengimpor `assets/manifest.ts`, `bersama/`, `permainan/`, atau `TEKS` (selain `isiTeks`). Layar pemain naik paling banyak 0,4 KB gzip.

## Beberapa pengguna sekaligus

- Diberikan admin dan guru pemilik membuka kejadian yang sama, ketika admin menyimpan lebih dulu, maka Simpan guru ditolak 409 dengan pesan muat ulang, dan suntingan admin tidak tertimpa.
- Diberikan dua guru membuat kejadian baru bersamaan, maka keduanya mendapat kode berbeda (pembuatan kode dicoba ulang saat bentrok).
- Diberikan Peninjau membatalkan verifikasi rujukan saat admin menerbitkan kejadian yang memakainya, maka server memeriksa status rujukan di pernyataan yang sama dengan penerbitan, sehingga kejadian tidak terbit dengan rujukan `belum`.
- Diberikan ruang sedang berjalan dengan versi terbit lama, ketika admin menerbitkan versi baru, maka ruang itu tetap memakai versi lamanya (isi disalin ke Durable Object saat ruang dibuat).

## Status antarmuka

| Tempat | Status | Tampilan |
|---|---|---|
| Daftar kejadian, rujukan, paket | Memuat / kosong / galat | "Memuat…" / teks kosong / pesan galat dengan "Coba lagi" |
| Penyunting | Memuat / tidak ada / hanya baca / belum disimpan / menyimpan / tersimpan / bentrok | Sesuai P-6 sampai P-10 |
| Penyunting | Validasi | Galat di bawah kolom; ringkasan di bilah aksi |
| Pratinjau | Belum lengkap / siap / versi lama | "Lengkapi isian untuk melihat pratinjau." / dialog / pita "Versi {nomor}" |
| Rujukan | Peninjau / bukan Peninjau | Tombol verifikasi tampil / tidak |

## Teks yang tampil (final)

**Konsol** (`TEKS_KONSOL`)

| Kunci | Teks |
|---|---|
| `menu.kejadian` / `menu.rujukan` / `menu.paket` | Kejadian / Rujukan / Paket |
| `bank.memuat` | Memuat… |
| `bank.gagal` | Data gagal dimuat. |
| `bank.cobaLagi` | Coba lagi |
| `bank.statusDraf` / `bank.statusTinjau` / `bank.statusTerbit` / `bank.statusArsip` | Draf / Siap tinjau / Terbit / Arsip |
| `bank.jenisPelanggaran` / `bank.jenisPengabaian` / `bank.jenisKeduanya` | Pelanggaran hak / Pengabaian kewajiban / Keduanya |
| `bank.tingkatTepat` / `bank.tingkatKurang` / `bank.tingkatBerisiko` | Tepat / Kurang tepat / Berisiko |
| `bank.bankAwal` | Bank awal |
| `bank.adaPerubahan` | Ada perubahan belum terbit |
| `daftar.judul` | Kejadian |
| `daftar.ringkasan` | {n} kejadian |
| `daftar.baru` | + Kejadian baru |
| `daftar.cari` | Cari judul |
| `daftar.semuaZona` / `daftar.semuaTopik` / `daftar.semuaStatus` | Semua zona / Semua topik / Semua status |
| `daftar.milikSaya` | Milik saya |
| `daftar.kosong` | Tidak ada kejadian yang cocok. |
| `daftar.kolomKode` / `daftar.kolomJudul` / `daftar.kolomZona` / `daftar.kolomTopik` | Kode / Judul / Zona / Topik |
| `daftar.kolomStatus` / `daftar.kolomRujukan` / `daftar.kolomPemilik` / `daftar.kolomDiubah` | Status / Rujukan / Pemilik / Diubah |
| `daftar.rujukanLengkap` / `daftar.rujukanBelum` | Lengkap / {n} belum |
| `sunting.kembali` | ← Semua kejadian |
| `sunting.baru` | Kejadian baru |
| `sunting.bagianIdentitas` / `sunting.bagianTokoh` / `sunting.bagianSituasi` | Identitas / Tokoh dan properti / Situasi |
| `sunting.bagianLangkah1` / `sunting.bagianLangkah2` / `sunting.bagianKartu` / `sunting.bagianRiwayat` | Langkah 1 / Langkah 2 / Kartu dampak / Riwayat versi |
| `sunting.judul` / `sunting.zona` / `sunting.topik` / `sunting.jenis` | Judul / Zona / Topik / Jenis |
| `sunting.tokohPetunjuk` | Pilih 1–4 tokoh atau properti. Urutan pilihan menentukan letaknya di titik kejadian. |
| `sunting.situasi` | Situasi (1–3 kalimat) |
| `sunting.pertanyaan` | Pertanyaan |
| `sunting.pilihan` | Pilihan {huruf} |
| `sunting.kunci` | Kunci |
| `sunting.umpanBalik` | Umpan balik |
| `sunting.petunjuk` | Kalimat petunjuk |
| `sunting.tingkat` | Tingkat |
| `sunting.terjadi` | Yang terjadi |
| `sunting.hak` / `sunting.kewajiban` / `sunting.rujukan` | Hak yang terdampak / Kewajiban terkait / Rujukan |
| `sunting.rujukanCari` | Cari rujukan |
| `sunting.hitung` | {n}/{batas} |
| `sunting.hanyaBaca` | Anda hanya bisa membaca kejadian ini: penyuntingnya admin atau pemiliknya. |
| `sunting.hanyaBacaArsip` | Kejadian arsip hanya bisa dibaca. Pulihkan dulu untuk menyunting. |
| `sunting.belumDisimpan` | Belum disimpan |
| `sunting.tinggalkan` | Tinggalkan halaman? Perubahan yang belum disimpan akan hilang. |
| `sunting.ringkasGalat` | {n} galat |
| `sunting.ringkasSah` | Semua isian sah |
| `sunting.simpan` / `sunting.menyimpan` / `sunting.tersimpan` | Simpan / Menyimpan… / Tersimpan. |
| `sunting.bentrok` | Kejadian ini sudah diubah orang lain. Muat ulang untuk melihat perubahannya. |
| `sunting.muatUlang` | Muat ulang |
| `sunting.tidakAda` | Kejadian tidak ditemukan. |
| `aksi.ajukan` / `aksi.kembalikan` / `aksi.terbitkan` / `aksi.arsipkan` / `aksi.pulihkan` / `aksi.hapus` | Ajukan / Kembalikan ke draf / Terbitkan / Arsipkan / Pulihkan dari arsip / Hapus |
| `aksi.alasanRujukan` | Belum bisa terbit: rujukan {daftar} belum terverifikasi. |
| `aksi.alasanGalat` | Belum bisa terbit: masih ada {n} galat. |
| `aksi.terbitkanJudul` | Terbitkan {kode}? |
| `aksi.catatan` | Catatan perubahan |
| `aksi.arsipkanJudul` | Arsipkan {kode}? |
| `aksi.arsipkanIsi` | Kejadian ini keluar dari semua paket dan tidak bisa dipakai ruang baru. Statistiknya tetap tersimpan. |
| `aksi.hapusJudul` | Hapus {kode}? |
| `aksi.hapusIsi` | Kejadian dan versi kerjanya dihapus permanen. |
| `aksi.batal` | Batal |
| `aksi.okAjukan` / `aksi.okKembalikan` / `aksi.okTerbitkan` | {kode} diajukan. / {kode} dikembalikan ke draf. / {kode} terbit sebagai versi {nomor}. |
| `aksi.okArsipkan` / `aksi.okPulihkan` / `aksi.okHapus` | {kode} diarsipkan. / {kode} dipulihkan ke draf. / {kode} dihapus. |
| `riwayat.kosong` | Belum pernah terbit. |
| `riwayat.baris` | Versi {nomor} · {tanggal} · {nama} |
| `riwayat.lihat` | Lihat |
| `riwayat.kembaliKerja` | Kembali ke versi kerja |
| `pratinjau.judul` | Pratinjau |
| `pratinjau.tegak` / `pratinjau.mendatar` | Tegak / Mendatar |
| `pratinjau.ulang` | Mulai ulang |
| `pratinjau.belumLengkap` | Lengkapi isian untuk melihat pratinjau. |
| `pratinjau.versi` | Versi {nomor} |
| `pustaka.judul` | Rujukan |
| `pustaka.ringkasan` | {n} rujukan, {m} belum terverifikasi |
| `pustaka.baru` | + Rujukan baru |
| `pustaka.cari` | Cari teks rujukan |
| `pustaka.semuaStatus` / `pustaka.statusBelum` / `pustaka.statusTerverifikasi` | Semua status / Belum / Terverifikasi |
| `pustaka.terverifikasiOleh` | Terverifikasi oleh {nama}, {tanggal} |
| `pustaka.dipakai` | {n} kejadian |
| `pustaka.teks` / `pustaka.sumber` / `pustaka.catatan` / `pustaka.kodeSehari` | Teks / Sumber JDIH (satu alamat per baris) / Catatan / Kode Sehari Setara |
| `pustaka.ubah` / `pustaka.simpan` | Ubah / Simpan |
| `pustaka.peringatanTeks` | Mengubah teks membatalkan verifikasi. Kejadian yang memakainya tidak bisa terbit sampai rujukan ini diverifikasi ulang. |
| `pustaka.tandai` / `pustaka.batalkan` | Tandai terverifikasi / Batalkan verifikasi |
| `pustaka.tandaiJudul` | Anda sudah memeriksa teks dan sumber rujukan ini? |
| `pustaka.hapusJudul` | Hapus {id}? |
| `pustaka.okSimpan` / `pustaka.okTandai` / `pustaka.okBatal` / `pustaka.okHapus` | {id} tersimpan. / {id} terverifikasi. / Verifikasi {id} dibatalkan. / {id} dihapus. |
| `pustaka.kosong` | Tidak ada rujukan yang cocok. |
| `paket.judul` | Paket |
| `paket.baru` | + Paket baru |
| `paket.kolomNama` / `paket.kolomJumlah` / `paket.kolomAktif` / `paket.kolomSiap` | Nama / Kejadian / Aktif / Siap untuk ruang biasa |
| `paket.nama` / `paket.deskripsi` / `paket.aktif` | Nama paket / Deskripsi / Aktif (bisa dipilih saat membuat ruang) |
| `paket.tambah` | Tambah kejadian |
| `paket.naik` / `paket.turun` / `paket.keluarkan` | Naik / Turun / Keluarkan |
| `paket.ya` / `paket.tidak` | Ya / Tidak |
| `paket.simpan` / `paket.okSimpan` | Simpan paket / Paket tersimpan. |
| `paket.kosong` | Belum ada kejadian di paket ini. |
| `galat.TEMUAN` | Isian belum sah. Perbaiki kolom yang ditandai. |
| `galat.SUDAH_DIUBAH` | Kejadian ini sudah diubah orang lain. Muat ulang untuk melihat perubahannya. |
| `galat.BELUM_TERVERIFIKASI` | Belum bisa terbit: ada rujukan yang belum terverifikasi. |
| `galat.MASIH_DIPAKAI` | Tidak bisa dihapus karena masih dipakai. |
| `galat.KEJADIAN_TIDAK_ADA` / `galat.RUJUKAN_TIDAK_ADA` / `galat.PAKET_TIDAK_ADA` | Kejadian tidak ditemukan. / Rujukan tidak ditemukan. / Paket tidak ditemukan. |
| `galat.NAMA_DIPAKAI` | Nama paket ini sudah dipakai. |
| `galat.STATUS_KEJADIAN` | Aksi ini tidak berlaku untuk status kejadian sekarang. |

**Kalimat temuan validasi** (`TEKS_KONSOL.temuan`, Permintaan A-7)

| Kunci | Teks |
|---|---|
| `temuan.BENTUK` | Isian ini tidak sesuai bentuk yang diharapkan. |
| `temuan.KOLOM_ASING` | Ada isian yang tidak dikenal. Muat ulang halaman, lalu coba lagi. |
| `temuan.TEKS_KOSONG` | Isian ini wajib diisi. |
| `temuan.TEKS_PANJANG` | Terlalu panjang: paling banyak {batas} karakter. |
| `temuan.TEKS_POLOS` | Gunakan teks polos, tanpa HTML, Markdown, atau tautan. |
| `temuan.FORMAT` | Formatnya tidak sesuai. |
| `temuan.JUMLAH` | Jumlahnya tidak sesuai aturan. |
| `temuan.NILAI` | Pilihan ini tidak sah. |
| `temuan.SITUASI_KALIMAT` | Situasi harus 1–3 kalimat. |
| `temuan.OPSI_BENAR` | Tandai tepat satu pilihan Langkah 1 sebagai kunci. |
| `temuan.OPSI_TEPAT` | Sedikitnya satu pilihan Langkah 2 harus bertingkat Tepat. |
| `temuan.OPSI_ID` | Urutan pilihan rusak. Muat ulang halaman. |
| `temuan.OPSI_KEMBAR` | Dua pilihan tidak boleh sama persis. |
| `temuan.PETUNJUK_MENYALIN` | Petunjuk terlalu mirip dengan jawaban yang tepat (paling banyak 20 karakter yang sama). |
| `temuan.RUJUKAN_TIDAK_ADA` | Rujukan ini tidak ada di pustaka. |
| `temuan.RUJUKAN_KEMBAR` | Rujukan yang sama dipilih dua kali. |
| `temuan.SET_TOKOH_KEMBAR` | Tokoh atau properti yang sama dipilih dua kali. |
| `temuan.SET_TOKOH_TIDAK_ADA` | Tokoh atau properti ini tidak ada di daftar aset. |
| `temuan.KAPITAL_TENGAH` | Periksa huruf kapital di tengah kalimat; boleh untuk nama diri dan singkatan. |
| `temuan.KODE_KEMBAR` | Kode kejadian ini sudah dipakai. |
| `temuan.RUJUKAN_ID_KEMBAR` | Id rujukan ini sudah dipakai. |
| `temuan.RUJUKAN_BERSTATUS` | Status rujukan hanya diubah lewat tombol verifikasi. |
| `temuan.RUJUKAN_TIDAK_DIPAKAI` | Rujukan ini belum dipakai kejadian mana pun. |
| `temuan.PAKET_NAMA_KEMBAR` | Nama paket ini sudah dipakai. |
| `temuan.PAKET_KEJADIAN_TIDAK_ADA` | Kejadian ini tidak ada di bank. |
| `temuan.PAKET_KEJADIAN_KEMBAR` | Kejadian yang sama ada dua kali di paket. |
| `temuan.PAKET_TITIK_KURANG` | Terlalu banyak kejadian di satu zona untuk titik yang tersedia di peta. |

**Layar pemain, mode pratinjau** (`TEKS`)

| Kunci | Teks |
|---|---|
| `pratinjau.pita` | Pratinjau. Di ronde, urutan pilihan diacak untuk setiap pemain. |
| `pratinjau.menunggu` | Menunggu isi kejadian… |

## Data, protokol, API, dan migrasi

- **D1:** tidak ada migrasi. Kueri baru di `db/bank.ts`. Penerbitan memakai satu `batch`: sisip versi terbit, perbarui `kejadian`, dan sisip `log_audit`, dengan syarat semua rujukan versi kerja berstatus `terverifikasi` di pernyataan sisip (bila tidak, tidak ada yang ditulis dan server menjawab 409 `BELUM_TERVERIFIKASI`). Simpan versi kerja memakai `UPDATE … WHERE dibuat_pada = ?` untuk P-9.
- **Protokol real-time:** tidak berubah; `PROTOKOL_VERSI` tetap 2.
- **Pratinjau:** pesan `postMessage` `{ jenis: "jejak-pratinjau", isi: IsiKejadian, rujukan: string[], bentuk: "panel" | "lembar" }` dan `{ jenis: "jejak-pratinjau-ulang" }`, hanya dari asal yang sama.

## Aset

Tidak ada aset baru. Penyunting memakai gambar tokoh dan properti Disetujui (`npc_…`, `obj_…`) yang dimuat konsol lewat `import.meta.glob` sebagai URL, serta `ikon_zona_1` sampai `ikon_zona_8`, `ikon_peringatan`, `ikon_centang`, dan `ikon_arsip`.

## Keamanan dan privasi

- Semua aturan izin diperiksa di server; konsol hanya menyembunyikan tombol.
- Verifikasi hanya untuk tanda Peninjau, dengan nama dan tanggal otomatis; agen dan skrip tidak pernah menulis status `terverifikasi` (Architecture 10.6).
- Isi kejadian divalidasi sebagai teks polos di konsol dan server; pratinjau hanya menerima pesan dari asal yang sama dan tidak pernah memakai HTML mentah.
- Log audit tidak menyimpan isi kejadian, hanya aksi, sasaran, dan ringkasan.

## Di luar cakupan

Impor dan ekspor JSON (JFR-48), statistik per kejadian dan per versi (JS-13), halaman log audit (JFR-39), pengaturan umum (JFR-40), menyunting kunci aset atau peta, dan menyalin naskah repositori ke D1 sesudah semai.

## DRAF untuk ditinjau pemilik proyek

- **D-1. Rujukan untuk guru.** (a, saran) Guru boleh menambah rujukan baru (status Belum), tetapi hanya admin yang mengubah dan menghapus. (b) Hanya admin yang menambah, mengubah, dan menghapus rujukan.
- **D-2. Urutan pilihan di pratinjau.** (a, saran) Urutan asli A–D, dengan pita yang menjelaskan bahwa ronde mengacaknya. (b) Diacak seperti di ronde.
- **D-3. Saat kode kejadian baru dibuat.** (a, saran) Saat Simpan pertama yang lolos validasi, sehingga tidak ada draf kosong di bank. (b) Saat menekan "+ Kejadian baru", dengan draf kosong yang langsung tersimpan.
- **D-4. Pemilik kejadian bank awal.** (a, saran) Tetap tanpa pemilik ("Bank awal"), sehingga hanya admin yang menyuntingnya. (b) Dialihkan ke admin pertama.

## Kriteria penerimaan

- [ ] AC-1 **Izin.** P-2: tabel izin sesuai di uji unit dan uji server, termasuk guru pada kejadian bukan miliknya (403) dan tombol verifikasi hanya untuk Peninjau.
- [ ] AC-2 **Menu dan rute.** P-3: menu per peran; rute dikenali; bentuk lain menjadi dasbor.
- [ ] AC-3 **Daftar.** P-4, P-5: kolom, saringan zona, topik, status, dan "Milik saya", pencarian, tanda perubahan belum terbit, jumlah rujukan belum; kartu di HP.
- [ ] AC-4 **Penyunting.** P-6: semua bagian dan kolom; hitungan karakter; pilihan tokoh dengan gambar dan batas 4; hanya baca untuk yang tidak berwenang.
- [ ] AC-5 **Kejadian baru.** P-7: kode berikutnya saat Simpan pertama, termasuk dua pembuatan serentak.
- [ ] AC-6 **Validasi.** P-8: ke-28 kode temuan punya kalimat dan tampil di kolom yang benar (uji pemetaan `letak` per kode); galat menahan Simpan; peringatan tidak; server menolak dengan `TEMUAN`.
- [ ] AC-7 **Simpan.** P-9, P-10: versi kerja tersimpan; 409 `SUDAH_DIUBAH` tanpa menimpa; peringatan perubahan belum tersimpan.
- [ ] AC-8 **Pratinjau.** P-11, P-12: bingkai tegak dan mendatar; pesan hanya dari asal yang sama; dialog, umpan balik, Langkah 2, dan kartu dampak tampil sesuai isi; layar pemain tidak menyambung ke ruang; tambahan kode ≤ 0,4 KB gzip.
- [ ] AC-9 **Status dan aksi.** P-13 sampai P-15: setiap aksi pada status yang berlaku dan ditolak pada status lain; syarat terbit (validasi dan rujukan) termasuk balapan dengan pembatalan verifikasi; arsip mengeluarkan dari paket; hapus hanya draf yang belum pernah terbit atau dipakai.
- [ ] AC-10 **Versi.** P-13, P-16: versi terbit bernomor dan tidak berubah; ruang baru memakai versi terbit; riwayat dan "Lihat".
- [ ] AC-11 **Pustaka.** P-17 sampai P-20: tambah dan ubah dengan aturan 5.4; ubah teks membatalkan verifikasi; verifikasi dan pembatalan oleh Peninjau dengan nama dan tanggal; hapus hanya yang tidak dipakai.
- [ ] AC-12 **Paket.** P-21 sampai P-23: penyusun dengan urutan, aturan 1–64 dan titik per zona, nama unik, tanda siap; paket nonaktif tidak muncul di dialog ruang baru.
- [ ] AC-13 **Ruang biasa.** Sesudah semua rujukan Paket inti 16 diverifikasi dan 16 kejadiannya terbit di basis data uji, dialog ruang baru membolehkan ruang biasa dan ruangnya memakai versi terbit (uji server).
- [ ] AC-14 **Audit.** P-25: setiap aksi menulis satu baris `log_audit` tanpa isi kejadian.
- [ ] AC-15 **Tampilan.** Halaman bank tidak meluap di 1280 × 720 dan HP 360 × 640; penyunting dan pratinjau berdampingan di 1280 × 720.
- [ ] AC-16 **Teks.** Isi `TEKS_KONSOL` dan `TEKS` sama dengan bagian "Teks yang tampil (final)".
- [ ] AC-17 **Tanpa regresi.** Semua uji JS-01 sampai JS-22 lulus; konsol < 350 KB gzip; galeri identik.

## Rencana uji

### Uji unit (`test:jejak`)

- `inti/bank.ts`: aturan izin per peran, kepemilikan, dan tanda Peninjau; tabel transisi status P-14; pemetaan `letak` temuan ke kolom untuk ke-28 kode.
- Teks: tabel spesifikasi sama dengan `TEKS_KONSOL` dan `TEKS`.
- API bank dengan D1 tiruan: buat (kode berikutnya, serentak), simpan (409), terbitkan (syarat rujukan, nomor versi), arsipkan (keluar paket), hapus (syarat), rujukan (ubah teks membatalkan verifikasi), paket (aturan 5.4), dan audit.
- Pratinjau: penerjemah isi ke keadaan dialog (`pemain/pratinjau.ts`), dan penolakan pesan dari asal lain atau berbentuk salah.

### Uji server (`test:jejak:server`)

- Alur penuh di Worker lokal: guru membuat dan mengajukan kejadian; Peninjau memverifikasi rujukannya; admin menerbitkan; admin menyusun paket dari kejadian terbit; dialog ruang baru membolehkan ruang biasa; ruangnya memakai versi terbit.

### Uji ujung ke ujung (`test:e2e:jejak`)

- Guru menyunting kejadian miliknya dengan validasi langsung (galat tampil dan hilang), melihat pratinjau tegak dan mendatar, menyimpan, dan mengajukan; admin menerbitkan; Peninjau memverifikasi rujukan; tangkapan layar daftar, penyunting dengan pratinjau, pustaka, dan paket di 1280 × 720 dan HP 360 × 640.

### Manual (AGENTS 9) dan lingkungan uji

1. Sesudah push, "Jejak: uji" hijau.
2. Pemilik proyek (akun bertanda Peninjau) memeriksa dan menandai 23 rujukan bank awal di `#/rujukan`.
3. Sebagai admin, menerbitkan 16 kejadian bank awal satu per satu dengan catatan perubahan "Terbit pertama".
4. Membuat satu ruang dengan kotak "Ruang uji" tidak dicentang, lalu mengirim tangkapan layar dialognya.
