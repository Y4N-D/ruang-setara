# JS-22 — Pengaman biaya

| | |
|---|---|
| Status | Disetujui 15 November 2026 (`Spesifikasi disetujui: JS-22. D-1 a, D-2 a, D-3 a.`). Dibangun dan diuji 15 November 2026; penyesuaian saat Build ada di bagian "Catatan Build" |
| Rencana | `PLAN.md`, bagian "JS-22 — Pengaman biaya" |
| Sesi | Sesi A (mesin) |
| Bergantung pada | JS-10 (Selesai, 15 November 2026) |

## Ringkasan

JS-22 menambah pengaman agar biaya Cloudflare tidak membengkak karena kesalahan program atau kelalaian, sebelum uji coba kelas dan sebelum paket berbayar aktif. Durable Object ruang mendapat batas bawah waktu alarm, pergeseran untuk alarm yang berulang, anggaran alarm per ruang, batas percobaan ulang kiriman ke D1, dan penghapusan paksa sesudah 7 hari. HP pemain berhenti menyambung ulang bila ruang sudah tidak ada atau sesudah 10 menit gagal. Alur kerja "Jejak: hentikan" menghentikan dan memulihkan seluruh layanan Jejak Setara di lingkungan uji dengan satu klik. Durable Object menghitung pemakaian setiap ronde, dan admin melihatnya di halaman detail ruang. Konfigurasi log lingkungan uji tidak lagi merekam rincian permintaan, alur kerja Jejak naik ke Node 24, dan biaya permintaan pertama di isolat baru diselidiki dengan batas waktu. Langkah Spend Management di dasbor Cloudflare dicatat untuk saat paket berbayar.

## Kaitan

| Kebutuhan | Dipenuhi oleh |
|---|---|
| Usulan 14a JS-10 butir 1 (pengaman alarm dan percobaan ulang) | P-1 sampai P-7 |
| Temuan Plan JS-22 nomor 4 (sambung ulang HP tanpa batas) | P-8 sampai P-10 |
| Usulan 14a JS-10 butir 2 ("Jejak: hentikan") | P-11 sampai P-14 |
| Usulan 14a JS-10 butir 4 (pemakaian per ruang) | P-15 sampai P-18 |
| Usulan 14a JS-10 butir 5 (batas biaya), temuan Plan nomor 1 | P-19 |
| Plan usulan 7 (log lingkungan uji) | P-20 |
| Plan usulan 8 (biaya permintaan pertama, penutupan JS-04) | P-21 |
| Plan usulan 9 (alur kerja Jejak) | P-22 |
| Plan usulan 10 (`limits.cpu_ms`) | P-23 |
| Architecture 7, 12, dan 13; PRD 13 | Seluruh dokumen |

## Berkas yang dibuat dan diubah

| Berkas | Baru/ubah | Isi |
|---|---|---|
| `server/jejak-setara/src/ruang/RuangJejak.ts` | Ubah | Pengaman alarm, anggaran alarm, berhenti paksa, darurat, penghitung pemakaian, `getAlarm()` sesudah bangun (P-1 sampai P-7, P-13, P-15, P-16) |
| `server/jejak-setara/src/ruang/inti-ruang.ts` | Ubah | Tenggat penghapusan paksa 7 hari dan jeda percobaan ulang kiriman (P-4, P-5) |
| `server/jejak-setara/src/ruang/pengaman.ts` | Baru | Aturan murni pengaman alarm dan kiriman, diuji dengan jam tiruan |
| `server/jejak-setara/src/index.ts`, `src/env.ts` | Ubah | Jawaban 503 saat darurat; variabel `DARURAT` (P-12) |
| `server/jejak-setara/src/api/ruang.ts` | Ubah | Pemakaian dan peringatan kiriman di detail ruang untuk admin (P-17, P-18) |
| `app/jejak-setara/inti/ruang.ts`, `inti/akun.ts` | Ubah | Skema pemakaian di detail ruang; kode galat `LAYANAN_BERHENTI` |
| `app/jejak-setara/pemain/jaringan.ts`, `pemain/App.tsx` | Ubah | Sambung ulang HP yang berhenti (P-8 sampai P-10) |
| `app/jejak-setara/admin/halaman/DetailRuang.tsx` | Ubah | Bagian "Pemakaian ronde ini" dan peringatan kiriman (P-17, P-18) |
| `app/jejak-setara/teks.ts`, `teks-konsol.ts` | Ubah | Teks bagian "Teks yang tampil (final)" |
| `server/jejak-setara/wrangler.jsonc` | Ubah | `observability` lingkungan uji (P-20) |
| `.github/workflows/jejak-hentikan.yml` | Baru | Alur kerja "Jejak: hentikan" (P-11, P-14) |
| `.github/workflows/jejak-uji.yml`, `jejak-admin-awal.yml` | Ubah | `actions/checkout@v5`, `actions/setup-node@v5`, runner `ubuntu-24.04` (P-22) |
| Uji | Baru dan ubah | Bagian "Rencana uji" |
| `docs/jejak-setara/Architecture.md`, `PRD.md`, `PLAN.md`, `tests/JS-22-hasil.md` | Ubah dan baru | Architecture 4.5, 7, 12, dan 13; PRD 21 |

Tidak disentuh: Sehari Setara, galeri, `deploy-pages.yml`, migrasi D1 yang ada (kolom `ruang.ringkasan_json` sudah ada), berkas Sesi B, dan berkas Sesi C.

## Perilaku

### Pengaman alarm dan kiriman di Durable Object (usulan 2)

- **P-1. Batas bawah waktu alarm.** Setiap alarm yang dipasang paling cepat 1 detik dari sekarang: tenggat yang lebih awal atau sudah lewat dipasang pada sekarang + 1 detik.
- **P-2. Alarm berulang.** Diberikan alarm berjalan dan tenggat berikutnya sudah lewat serta sama dengan tenggat alarm yang baru saja berjalan, maka penghitung "berulang" bertambah. Pada hitungan kelima berturut-turut, alarm digeser 60 detik dan Worker menulis log galat `ALARM_BERULANG` (kode ruang, tenggat, status). Penghitung kembali ke nol saat tenggat berubah.
- **P-3. Anggaran alarm.** Setiap ruang paling banyak menjalankan 200 alarm (D-1); ruang normal memakai kurang dari 20. Hitungan disimpan di tabel `meta` setiap kali alarm berjalan. Alarm ke-201 menjalankan **berhenti paksa** (P-6) dengan log galat `ANGGARAN_ALARM`.
- **P-4. Percobaan ulang kiriman ke D1.** Jeda percobaan ulang 30 detik, 1, 2, 4, 8, 16, dan 32 menit, lalu 60 menit untuk setiap percobaan berikutnya. Sesudah 24 jam sejak kegagalan pertama, percobaan berhenti: antrean dibiarkan, Worker menulis log galat `KIRIMAN_BERHENTI`, dan tanda `kirimanBerhenti` disimpan di `meta` (P-18). Kiriman yang berhasil mengosongkan hitungan kegagalan.
- **P-5. Penghapusan paksa.** Penyimpanan ruang dihapus paling lambat 7 hari sesudah ruang dibuat, walaupun antrean kiriman belum kosong. Tenggat ini ikut dihitung `tenggatBerikut`, jadi alarm tetap terpasang selama penyimpanan ada.
- **P-6. Berhenti paksa** (dipakai P-3 dan P-13). Bila status belum `ditutup`, ruang ditutup lewat inti ruang: status menjadi `ditutup`, pemain dan layar kelas menerima `status_ruang`, dan semua sambungan ditutup dengan kode 4000. Antrean kiriman dicoba dikirim sekali, tanpa percobaan ulang. Lalu alarm dihapus, seluruh penyimpanan Durable Object dihapus (`deleteAll`), dan sisa umur objek itu menolak pesan dan alarm berikutnya tanpa memasang alarm lagi.
- **P-7. Alarm sesudah bangun.** Saat Durable Object dibangunkan, `getAlarm()` dibaca sekali sebelum alarm pertama dipasang, sehingga alarm dengan tenggat yang sama tidak ditulis ulang.

### Sambung ulang HP pemain (usulan 3)

- **P-8. Pemeriksaan ruang sesudah 10 kali gagal.** Diberikan HP gagal menyambung 10 kali berturut-turut (kode tutup selain kode akhir JS-03), maka HP memanggil `GET /api/publik/ruang/{KODE}` sekali:
  - 404 `RUANG_TIDAK_ADA`: HP berhenti, token dihapus, dan layar "Ruang ditutup" (JS-03) tampil.
  - 503 `LAYANAN_BERHENTI`: HP berhenti dan layar "Layanan berhenti sementara" tampil (P-10).
  - 200 atau galat jaringan: percobaan berlanjut dengan jeda 30 detik, dan ruang diperiksa lagi setiap 10 percobaan berikutnya.
- **P-9. Batas 10 menit.** Sesudah 10 menit gagal terus sejak kegagalan pertama, HP berhenti dan menampilkan layar "Sambungan terputus terlalu lama" dengan tombol "Coba lagi" (D-2). Tombol itu memuat ulang halaman; token tetap tersimpan, jadi pemain kembali dengan nama dan skornya bila ruang masih berjalan.
- **P-10. Tampilan.** Layar berhenti P-8 dan P-9 memakai kerangka layar galat JS-03 (judul, isi, dan satu tombol), dengan teks di bagian "Teks yang tampil (final)". Lapisan "Menyambung ulang…" JS-07 tetap tampil sebelum batas tercapai.

### Alur kerja darurat "Jejak: hentikan" (usulan 4)

- **P-11. Alur kerja.** `.github/workflows/jejak-hentikan.yml` dijalankan manual dengan dua pilihan: `lingkungan` (`uji`; `produksi` ditambahkan di JS-15) dan `aksi` (`hentikan` atau `pulihkan`). "Hentikan" menyimpan rahasia Worker `DARURAT` bernilai `1` lewat `wrangler secret put`; "pulihkan" menghapusnya lewat `wrangler secret delete`. Alur kerja memakai rahasia GitHub yang sudah dipakai "Jejak: uji".
- **P-12. Worker saat darurat.** Diberikan `DARURAT` bernilai `1`, maka Worker menjawab 503 `LAYANAN_BERHENTI` untuk semua `/api/*` kecuali `/api/sehat`, dan untuk semua `/ws/*`, sebelum menyentuh D1 atau Durable Object. Halaman statis (layar pemain dan konsol) tetap tampil; permintaan API pertama dari halaman itu menampilkan pesan layanan berhenti. `/api/sehat` menjawab seperti biasa dengan tambahan `"darurat": true`.
- **P-13. Durable Object saat darurat.** Durable Object yang bangun karena alarm atau pesan WebSocket dan melihat `DARURAT` bernilai `1` menjalankan berhenti paksa (P-6) dengan log galat `DARURAT`. Durable Object yang sedang berjalan baru membaca rahasia baru sesudah pindah ke versi baru, biasanya dalam beberapa menit.
- **P-14. Pemeriksaan dan ringkasan.** Sesudah mengubah rahasia, alur kerja membaca alamat Worker uji dari subdomain `workers.dev` akun (API Cloudflare) dan memeriksa `/api/sehat` sampai `darurat` sesuai aksi, paling lama 2 menit. Ringkasan run berbunyi "Layanan uji dihentikan." atau "Layanan uji dipulihkan.", atau galat bila pemeriksaan tidak cocok. Rahasia `DARURAT` tidak tersentuh deploy biasa, jadi layanan tetap berhenti sampai dipulihkan.

### Penghitung pemakaian per ruang (usulan 5)

- **P-15. Hitungan.** Durable Object menghitung sambungan WebSocket yang diterima (pemain dan layar kelas), pesan masuk, alarm yang berjalan, baris SQLite yang ditulis, dan baris D1 yang ditulis (jumlah `meta.rows_written` hasil `batch` kiriman). Perkiraan permintaan Durable Object = sambungan + pesan masuk ÷ 20 (dibulatkan ke atas) + alarm + permintaan internal dari Worker (inisialisasi, kelola, tiket kelas).
- **P-16. Penyimpanan.** Hitungan disimpan di baris `meta` `pemakaian` setiap kali kiriman berhasil dan saat ruang ditutup, sehingga bertahan saat Durable Object tidur. Saat ruang ditutup, kiriman terakhir menulis `ruang.ringkasan_json` = `{ "pemakaian": { … } }` di D1 (JS-11 menambah kunci lain di objek yang sama).
- **P-17. Tampilan untuk admin.** `GET /api/ruang/{id}` menyertakan `pemakaian` hanya bila yang meminta admin: dari Durable Object untuk ruang yang belum ditutup, atau dari `ringkasan_json` untuk ruang yang sudah ditutup. Halaman detail ruang menampilkan bagian "Pemakaian ronde ini" dengan lima baris (permintaan Durable Object, baris D1 ditulis, baris penyimpanan ruang ditulis, sambungan, dan alarm). Tiga baris pertama disertai persen kuota harian paket gratis (100.000 per hari masing-masing; D-3), dengan satu angka di belakang koma. Guru tidak melihat bagian ini.
- **P-18. Peringatan kiriman.** Bila `kirimanBerhenti` tercatat (P-4), halaman detail ruang menampilkan peringatan "Sebagian data ronde ini gagal disimpan ke basis data." untuk admin dan guru pemilik.

### Batas biaya Cloudflare (usulan 6)

- **P-19. Langkah dasbor Spend Management**, dicatat di Architecture 13 dan laporan JS-22, dijalankan pemilik proyek tepat sebelum mengaktifkan Workers Paid (JS-15):
  1. Dasbor Cloudflare → **Manage Account → Billing → Billable Usage** → **Create budget alert**: ambang 3 USD (hanya email).
  2. **Billing → Spend Management** → baris **Workers** → **Edit the spending limit**: 5 USD, simpan, pastikan **On**. Ulangi untuk baris **Durable Objects**.
  3. Bila kolom email tersedia, isi email pemberitahuan. Batas yang dibuat di dasbor tidak otomatis punya penerima email.
  4. Batas Workers berlaku untuk semua Worker di akun dan menghentikan pemanggilan baru sampai periode tagihan berikutnya atau sampai batas dinaikkan, dimatikan, atau dihapus. Biaya langganan Workers Paid tidak dihitung, dan pemblokiran tidak seketika.

### Log, permintaan pertama, alur kerja, dan batas CPU

- **P-20. Observability lingkungan uji.** `wrangler.jsonc` lingkungan uji menetapkan `"observability": { "enabled": true, "logs": { "enabled": true, "invocation_logs": false }, "traces": { "enabled": false } }`. Workers Logs hanya menyimpan log galat buatan aplikasi (P-2 sampai P-4, P-6, P-13), tanpa header, cookie, alamat IP, atau URL permintaan. Setiap deploy menimpa setelan dasbor. Untuk diagnosis CPU per permintaan, invocation log dinyalakan sementara di dasbor, dengan pilihan penyamaran query string bila tersedia, dan mati lagi di deploy berikutnya. Lingkungan lokal tidak berubah.
- **P-21. Biaya permintaan pertama.** Investigasi berbatas waktu dalam Build: profil CPU lokal (Node `--cpu-prof`, Worker hasil build, D1 tiruan) pada permintaan pertama `POST /api/masuk`, `POST /api/sandi`, `POST /api/ruang`, dan `GET /api/ruang/{id}`, lalu perbaikan pada bagian yang paling berat. Perubahan hanya dipertahankan bila CPU permintaan pertama turun sedikitnya 15% di pengukuran lokal tanpa menaikkan permintaan hangat dan semua uji lulus. Hasilnya (sebelum, sesudah, dan bagian yang diubah atau alasan tidak diubah) dicatat di laporan, walau tidak ada perbaikan yang dipertahankan.
- **P-22. Alur kerja Jejak.** `jejak-uji.yml`, `jejak-admin-awal.yml`, dan `jejak-hentikan.yml` memakai `actions/checkout@v5`, `actions/setup-node@v5`, dan `runs-on: ubuntu-24.04`. `deploy-pages.yml` (galeri) tidak berubah.
- **P-23. `limits.cpu_ms`.** Tidak dipasang di JS-22. `PLAN.md` mencatatnya di daftar langkah JS-15: 1.000 ms untuk Worker uji dan produksi sesudah paket berbayar aktif.

## Beberapa pemain sekaligus

- Diberikan 40 HP di ruang yang dihapus saat tab masih terbuka, maka setiap HP berhenti sesudah 10 percobaan dan satu pemeriksaan ruang (sekitar 1 menit), bukan mencoba setiap 8 detik tanpa batas.
- Diberikan "Jejak: hentikan" dijalankan saat tiga ruang sedang bermain, maka permintaan baru langsung dijawab 503; dalam beberapa menit setiap Durable Object yang bangun menutup ruangnya, mengirim sisa data sekali, dan berhenti. HP pemain menampilkan "Ruang ditutup" (kode 4000) atau "Layanan berhenti sementara".
- Diberikan admin dan guru membuka detail ruang yang sama, maka hanya admin yang melihat "Pemakaian ronde ini".

## Status antarmuka

| Tempat | Status | Tampilan |
|---|---|---|
| HP pemain | Menyambung ulang | Lapisan JS-07 "Menyambung ulang…" (tidak berubah) |
| HP pemain | Ruang sudah tidak ada | Layar "Ruang ditutup" JS-03 |
| HP pemain | Layanan dihentikan | Layar galat "Layanan berhenti sementara" |
| HP pemain | Putus 10 menit | Layar galat "Sambungan terputus terlalu lama" dengan "Coba lagi" |
| Konsol | API dijawab `LAYANAN_BERHENTI` | Pesan galat konsol (teks `galat.LAYANAN_BERHENTI`) |
| Detail ruang (admin) | Pemakaian ada / belum ada | Tabel lima baris / bagian tidak tampil |
| Detail ruang | Kiriman berhenti | Peringatan P-18 |

## Teks yang tampil (final)

**Layar pemain** (`TEKS`, `app/jejak-setara/teks.ts`)

| Kunci | Teks |
|---|---|
| `api.LAYANAN_BERHENTI` | Layanan sedang dihentikan sementara. Coba lagi nanti. |
| `berhenti.layananJudul` | Layanan berhenti sementara |
| `berhenti.layananIsi` | Guru atau admin sedang menghentikan layanan. Coba lagi nanti. |
| `berhenti.putusJudul` | Sambungan terputus terlalu lama |
| `berhenti.putusIsi` | Periksa internet HP, lalu ketuk Coba lagi. |
| `berhenti.cobaLagi` | Coba lagi |

**Konsol** (`TEKS_KONSOL`, `app/jejak-setara/teks-konsol.ts`)

| Kunci | Teks |
|---|---|
| `galat.LAYANAN_BERHENTI` | Layanan sedang dihentikan sementara oleh admin. Coba lagi nanti. |
| `detail.pemakaianJudul` | Pemakaian ronde ini |
| `detail.pemakaianPermintaan` | Permintaan Durable Object (perkiraan) |
| `detail.pemakaianD1` | Baris D1 ditulis |
| `detail.pemakaianSqlite` | Baris penyimpanan ruang ditulis |
| `detail.pemakaianSambungan` | Sambungan |
| `detail.pemakaianAlarm` | Alarm |
| `detail.pemakaianNilai` | {n} ({p}% kuota harian paket gratis) |
| `detail.pemakaianCatatan` | Angka perkiraan dari server ruang. Bandingkan dengan dasbor Cloudflare bila perlu. |
| `detail.kirimanGagal` | Sebagian data ronde ini gagal disimpan ke basis data. |

**Alur kerja** (`TEKS_KONSOL.alur…`, ringkasan run "Jejak: hentikan")

| Kunci | Teks |
|---|---|
| `alurHentikan.berhenti` | Layanan uji dihentikan. |
| `alurHentikan.pulih` | Layanan uji dipulihkan. |
| `alurHentikan.galat` | Pemeriksaan sesudah perubahan tidak cocok. Lihat log langkah "Periksa". |

## Data, protokol, API, dan migrasi

- **API:** `GET /api/ruang/{id}` mendapat `pemakaian` (admin saja; P-17) dan `kirimanBerhenti` (P-18). `GET /api/sehat` mendapat `darurat`. Kode galat baru `LAYANAN_BERHENTI` (503) di Worker untuk semua rute API dan WebSocket saat darurat.
- **Protokol:** tidak berubah; `PROTOKOL_VERSI` tetap 2.
- **D1:** tidak ada migrasi. `ruang.ringkasan_json` (sudah ada) diisi `{ "pemakaian": { … } }` saat ruang ditutup.
- **SQLite Durable Object:** baris `meta` baru `alarmDipakai`, `alarmBerulang`, `kirimanGagalSejak`, `kirimanBerhenti`, dan `pemakaian`.
- **Variabel dan rahasia:** rahasia Worker `DARURAT` (hanya ada saat dihentikan).

## Aset

Tidak ada aset baru. Layar berhenti HP memakai ikon `ikon_peringatan` yang sudah dipakai layar galat JS-03.

## Keamanan dan privasi

- Log lingkungan uji tidak lagi menyimpan header, cookie sesi, alamat IP, atau URL (termasuk tiket layar kelas).
- "Jejak: hentikan" hanya bisa dijalankan pemilik repositori, memakai rahasia yang sudah ada, dan tidak mencetak nilai rahasia.
- Pemakaian per ruang hanya angka teknis tanpa data pemain, dan hanya terlihat oleh admin.

## Di luar cakupan

Batas biaya produk lain, domain sendiri, `limits.cpu_ms` (JS-15), Worker produksi dan alur kerja produksinya (JS-15), batas ruang aktif (JS-10), dan pemakaian AI.

## DRAF untuk ditinjau pemilik proyek

- **D-1. Anggaran alarm per ruang.** (a, saran) 200 alarm, lebih dari sepuluh kali pemakaian normal. (b) 500 alarm.
- **D-2. Batas waktu menyambung ulang di HP.** (a, saran) 10 menit, sama dengan layar kelas. (b) 5 menit.
- **D-3. Dasar persen pemakaian.** (a, saran) Kuota harian paket gratis (100.000 permintaan atau baris per hari). (b) Kuota bulanan Workers Paid (1 juta permintaan Durable Object per bulan).

## Kriteria penerimaan

- [ ] AC-1 **Batas bawah alarm.** P-1: tenggat lewat atau kurang dari 1 detik dipasang pada sekarang + 1 detik (uji jam tiruan).
- [ ] AC-2 **Alarm berulang.** P-2: kelima kalinya digeser 60 detik dengan log `ALARM_BERULANG`; penghitung kembali ke nol saat tenggat berubah.
- [ ] AC-3 **Anggaran alarm.** P-3 dan P-6: alarm ke-201 menutup ruang (kode 4000), mengirim antrean sekali, menghapus penyimpanan, dan tidak memasang alarm lagi.
- [ ] AC-4 **Percobaan ulang kiriman.** P-4: urutan jeda sampai 60 menit; berhenti sesudah 24 jam dengan `kirimanBerhenti`; berhasil mengosongkan hitungan.
- [ ] AC-5 **Penghapusan paksa.** P-5: penyimpanan dihapus 7 hari sesudah dibuat walau antrean belum kosong.
- [ ] AC-6 **Alarm sesudah bangun.** P-7: `getAlarm()` dibaca, dan alarm dengan tenggat yang sama tidak ditulis ulang.
- [ ] AC-7 **Sambung ulang HP.** P-8 sampai P-10: pemeriksaan ruang sesudah 10 kali gagal (404, 503, 200, galat jaringan), jeda 30 detik, berhenti sesudah 10 menit, dan ketiga layar berhenti (uji klien murni dan uji ujung ke ujung).
- [ ] AC-8 **Worker saat darurat.** P-12: 503 `LAYANAN_BERHENTI` untuk `/api/*` (kecuali `/api/sehat`) dan `/ws/*` tanpa menyentuh D1; halaman statis tetap; `/api/sehat` dengan `darurat: true`.
- [ ] AC-9 **Durable Object saat darurat.** P-13: bangun karena alarm atau pesan menjalankan berhenti paksa.
- [ ] AC-10 **Alur kerja "Jejak: hentikan".** P-11 dan P-14: pilihan, `wrangler secret put` dan `delete`, pemeriksaan, dan ringkasan, diuji dengan `wrangler` dan `curl` tiruan seperti JS-04; tidak ada nilai rahasia di log.
- [ ] AC-11 **Pemakaian.** P-15 sampai P-17: hitungan sesuai di uji inti dan uji server; tersimpan di `meta` dan `ringkasan_json`; tampil untuk admin dengan persen, tidak untuk guru.
- [ ] AC-12 **Peringatan kiriman.** P-18 tampil untuk admin dan guru pemilik.
- [ ] AC-13 **Spend Management.** P-19 tertulis di Architecture 13 dan laporan.
- [ ] AC-14 **Observability.** P-20: `wrangler.jsonc` lingkungan uji sesuai (uji kerangka dan `wrangler deploy --dry-run`).
- [ ] AC-15 **Permintaan pertama.** P-21: laporan memuat angka sebelum dan sesudah; perubahan dipertahankan hanya bila memenuhi syaratnya.
- [ ] AC-16 **Alur kerja Jejak.** P-22: versi aksi dan runner sesuai; `deploy-pages.yml` identik byte.
- [ ] AC-17 **Teks.** Isi `TEKS` dan `TEKS_KONSOL` sama dengan bagian "Teks yang tampil (final)".
- [ ] AC-18 **Tanpa regresi.** Semua uji JS-01 sampai JS-10 lulus; kode layar pemain naik paling banyak 0,3 KB gzip; galeri identik; `sim:beban` 1 ruang × 50 bot tanpa galat dengan pemakaian ronde tercatat dan dibandingkan dengan perkiraan JS-10.

## Rencana uji

### Uji unit (`test:jejak`)

- `pengaman.ts`: batas bawah alarm, alarm berulang, anggaran, urutan jeda kiriman, batas 24 jam, dan tenggat hapus paksa, semuanya dengan jam tiruan.
- Inti ruang: `tenggatBerikut` dengan hapus paksa 7 hari.
- `jaringan.ts` (klien murni dengan jam dan `fetch` tiruan): pemeriksaan ruang sesudah 10 kali gagal untuk keempat jawaban, jeda 30 detik, dan batas 10 menit.
- Worker: rute darurat (P-12) dan `/api/sehat`.
- API ruang dengan D1 tiruan: `pemakaian` hanya untuk admin, dan `kirimanBerhenti`.
- Kerangka: `wrangler.jsonc` lingkungan uji, `jejak-hentikan.yml` (dengan `wrangler` dan `curl` tiruan), versi aksi dan runner, `deploy-pages.yml` tidak berubah, dan teks.

### Uji server (`test:jejak:server`)

- Satu ronde pendek lewat layar kelas, lalu tutup ruang: `ringkasan_json` berisi pemakaian, dan detail ruang admin menampilkannya.
- Darurat di Worker lokal dengan `DARURAT=1` (server kedua): 503 untuk API dan WebSocket, `/api/sehat` dengan `darurat: true`, dan Durable Object yang bangun karena pesan WebSocket menutup ruangnya.
- Uji server JS-03 sampai JS-10 tetap lulus.

### Uji ujung ke ujung (`test:e2e:jejak`)

- HP pemain di ruang yang ditutup dari konsol saat sambungannya diputus paksa: layar "Ruang ditutup" sesudah pemeriksaan ruang. Batas 10 menit diuji di uji klien murni.
- Detail ruang admin menampilkan "Pemakaian ronde ini"; guru tidak.
- Uji ujung ke ujung JS-03 sampai JS-10 tetap lulus.

### Beban dan ukuran

- `sim:beban` 1 ruang × 50 bot: pemakaian ronde dari ringkasan dibandingkan dengan perkiraan JS-10 (sekitar 18.000 permintaan Durable Object per ronde 15 menit).
- Ukuran kode layar pemain dibandingkan dengan `main` sebelum Build.

### Manual (AGENTS 9) dan lingkungan uji

1. Sesudah push, "Jejak: uji" hijau.
2. Pemilik proyek menjalankan "Jejak: hentikan" dengan aksi `hentikan`, membuka layar pemain dan memastikan pesan layanan berhenti tampil saat memasukkan kode ruang, lalu menjalankan aksi `pulihkan`.
3. Pemilik proyek menjalankan satu ronde pendek, menutup ruang, lalu membuka detail ruang dan mengirim tangkapan layar bagian "Pemakaian ronde ini".

## Catatan Build (15 November 2026)

- **P-16, pemicu ringkasan.** `ringkasan_json` ditulis langsung ke D1 (sekali, tanpa antrean) saat inti ruang mengantrekan status `ditutup`, dan sekali lagi sebelum penyimpanan dihapus, bukan lewat antrean kiriman. Antrean kiriman memakai kunci per baris, jadi baris ringkasan terpisah lebih sederhana dan tidak mengubah urutan kiriman.
- **P-17, kuota.** Konstanta `KUOTA_HARIAN_GRATIS` ada di `app/jejak-setara/inti/ruang.ts` agar konsol tidak mengimpor kode server.
- **Kait uji lokal baru** `/api/uji/ruang/{KODE}/pengaman` (POST `{ "alarmDipakai": n }`) agar anggaran alarm bisa diuji di server lokal tanpa menunggu 200 alarm. Hanya ada di lingkungan lokal, seperti kait JS-10.
- **Rencana uji, darurat di Durable Object.** Server lokal tidak bisa dinyalakan dengan rahasia `DARURAT`, jadi uji server kedua dengan `DARURAT=1` tidak dibuat. Gerbang darurat Worker diuji di uji unit, dan jalur berhenti paksa Durable Object (dipakai bersama anggaran alarm) diuji di uji server anggaran. Pemeriksaan darurat ujung ke ujung dilakukan pemilik proyek dengan "Jejak: hentikan" di lingkungan uji.
- **Rencana uji, HP di ruang yang hilang.** Uji ujung ke ujung tidak bisa memastikan HP lewat jalur pemeriksaan ruang (penutupan ruang juga mengirim `status_ruang` lebih dulu), jadi jalur itu diuji di uji klien murni (`__tests__/biaya/jaringan-berhenti.test.ts`).
- **P-21, permintaan pertama.** Calon perbaikan (menyimpan kunci HMAC yang sudah diimpor per isolat) diukur dan tidak dipertahankan, karena tidak menurunkan CPU permintaan pertama sedikitnya 15% (rincian di laporan).
- **AC-18, ukuran kode.** Kode layar pemain naik 0,59 KB gzip, melewati perkiraan 0,3 KB di spesifikasi: logika pemeriksaan ruang dan batas 10 menit di `jaringan.ts`, layar berhenti, dan teks baru. Keputusan pemilik proyek diperlukan (laporan JS-22).
