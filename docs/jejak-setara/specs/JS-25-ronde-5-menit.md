# JS-25 — Waktu main 5 menit

Status: **Disetujui (28 Nov 2026)**: `Setuju: JS-24, JS-25` dan `Spesifikasi disetujui: JS-24, JS-25`, dengan D-1, D-2, dan D-3 = a. Dibangun dan diuji 28 Nov 2026 ([laporan](../tests/JS-25-hasil.md)).

## Ringkasan

Guru dapat memilih waktu main 5 menit di dialog Ruang baru, di samping 10, 15 (bawaan), dan 20 menit. Ronde 5 menit memakai aturan yang sama dengan ronde lain: masa pagi, siang, dan sore menurut bagian ronde, hitung mundur 3 detik, skill dan kotak bantuan, tambah 2 menit, jeda, dan musik latar. Satu-satunya perbedaan permainan adalah peringatan akhir ronde, yang mulai 1 menit sebelum waktu habis dengan pita "Satu menit lagi".

Dialog Ruang baru menampilkan catatan bila paket yang dipilih memuat lebih dari 8 kejadian. Riwayat ruang, kartu Sesi terakhir, dan kedua berkas CSV menampilkan durasi, dan rata-rata skor di ringkasan dasbor tidak menghitung ronde 5 menit.

`PROTOKOL_VERSI` tetap 6, sehingga rilis tidak memaksa HP memuat ulang. HP yang tabnya masih memakai kode lama dan mencoba masuk ruang 5 menit langsung menerima "Ada pembaruan. Muat ulang halaman.", sedangkan ruang 10, 15, dan 20 menit tetap menerima kode lama. Tanpa migrasi D1.

## Kaitan PRD

- JFR-01 (durasi ruang), JFR-29 (tambah 2 menit), JFR-37 (dasbor), JFR-38 (riwayat ruang), JFR-49 dan JFR-53 (hasil dan CSV), dan JFR-50 (statistik per kejadian).
- PRD 3 (tujuan sedikitnya 10 kejadian per sesi 15 menit), 8.1 (waktu dan langit sehari), 8.5 (skill dan kotak), 11.2 (definisi statistik), 12 (data seluler), 16 (ukuran keberhasilan), 17 (ruang lingkup rilis), dan 20 (KT-12: durasi bawaan 15 menit dan 16 kejadian).
- Spesifikasi JS-03 (siklus ruang dan kode tutup 4005), JS-07 P-30 sampai P-32 (langit dan dua menit terakhir), JS-10 (dialog Ruang baru dan layar kelas), JS-11 P-14 sampai P-30 (hasil, riwayat, dan CSV), JS-13 P-24 sampai P-27 (dasbor), dan JS-14 P-31 (bunyi peringatan layar kelas).

## Berkas

| Berkas | Jenis | Isi |
|---|---|---|
| `app/jejak-setara/inti/ruang.ts` | Diubah | `DURASI_RUANG` [5, 10, 15, 20], `skemaRuangBaru`, dan fungsi murni tambahan protokol yang diperlukan ruang (P-1, P-9) |
| `app/jejak-setara/inti/tipe.ts` | Diubah | `PengaturanRuang.durasiMenit` 5, 10, 15, atau 20 (P-1) |
| `app/jejak-setara/inti/protokol.ts` dan `inti/protokol-kelas.ts` | Diubah | `pengaturan.durasiMenit` di `selamat_datang` dan `durasiMenit` di `info_kelas` menerima 5 (P-8) |
| `app/jejak-setara/inti/versi.ts` | Diubah | `PROTOKOL_TAMBAHAN` 1; `PROTOKOL_VERSI` tetap 6 (P-8) |
| `app/jejak-setara/inti/aturan.ts` | Diubah | `BATAS.durasiMenit`, ambang peringatan akhir ronde per durasi (P-6) |
| `app/jejak-setara/pemain/App.tsx` | Diubah | Alamat WebSocket dengan `?tambahan=1` (P-8) |
| `app/jejak-setara/pemain/dunia/langit.ts`, `pemain/LayarDunia.tsx`, `teks.ts` | Diubah | Peringatan akhir ronde menurut durasi dan pita "Satu menit lagi" (P-6) |
| `app/jejak-setara/admin/halaman/Ruang.tsx` | Diubah | Tombol "5 menit" dan catatan paket (P-1, P-2) |
| `app/jejak-setara/admin/halaman/RiwayatRuang.tsx` dan `admin/halaman/Dasbor.tsx` | Diubah | Kolom Durasi, durasi di Sesi terakhir, dan catatan ringkasan (P-13 sampai P-15) |
| `app/jejak-setara/admin/kelas/suara-kelas.ts` dan `admin/kelas/LayarKelas.tsx` | Diubah | Bunyi peringatan layar kelas menurut durasi (P-6) |
| `app/jejak-setara/inti/hasil.ts`, `inti/akun.ts`, `teks-konsol.ts` | Diubah | Skema jawaban API konsol (isian baru tidak wajib) dan teks konsol (P-13 sampai P-17) |
| `server/jejak-setara/src/ruang/RuangJejak.ts` | Diubah | Penjaga tambahan protokol saat sambungan pemain dibuka (P-9) |
| `server/jejak-setara/src/index.ts` | Diubah | `/api/sehat` memuat `tambahan` (P-8) |
| `server/jejak-setara/src/api/ruang.ts`, `api/dasbor.ts`, `db/ruang.ts`, `ekspor/csv.ts` | Diubah | Durasi di riwayat, Sesi terakhir, ringkasan, dan CSV (P-13 sampai P-17) |
| `scripts/jejak-setara/simulasi-beban.mjs` | Diubah | Pilihan `--durasi-ruang`, alamat dengan `?tambahan=1`, ronde yang berakhir sendiri, dan antrean tunda yang menjaga urutan (P-19) |
| Uji unit, uji server, dan uji ujung ke ujung | Baru dan diubah | Rencana uji di bawah; berkas baru `e2e/jejak-setara/ronde-5-menit.uji.ts` |
| `docs/jejak-setara/tests/JS-25-hasil.md`, `docs/jejak-setara/tests/JS-25/`, dan `docs/jejak-setara/rilis/v1.2.md` | Baru | Laporan, tangkapan layar, dan catatan rilis v1.2 |
| Dokumen utama | Diubah | P-18 |

Tidak disentuh: migrasi D1, `package.json`, lockfile, alur kerja, `wrangler.jsonc`, aset dan `manifest.ts`, berkas Sesi B (`naskah/`, `seed/`, `semai.mjs`) dan Sesi C, Sehari Setara, dan galeri.

## Perilaku

### A. Membuat ruang 5 menit

- **P-1. Pilihan durasi.** `DURASI_RUANG` menjadi 5, 10, 15, dan 20 menit, dengan bawaan tetap 15 (KT-12). Kelompok Durasi di dialog Ruang baru memuat empat tombol berurutan "5 menit", "10 menit", "15 menit", dan "20 menit", dengan `aria-pressed` seperti sekarang. `POST /api/ruang` menerima `durasiMenit` 5. Nilai lain di luar keempat nilai itu tetap ditolak 400 `ISI_SALAH`. Pengaturan ruang tetap disimpan di `pengaturan_json`.
- **P-2. Catatan paket.** Diberikan durasi "5 menit" terpilih dan paket yang dipilih memuat lebih dari 8 kejadian, maka tepat di bawah tombol durasi tampil catatan bergaya petunjuk konsol (`js-konsol-petunjuk`) berisi teks `ruangBaru.catatanLimaMenit` dengan jumlah kejadian paket (DRAF D-1). Catatan itu tidak menolak dan tidak menonaktifkan tombol "Buat ruang". Tombol "5 menit" merujuk catatan itu lewat `aria-describedby` selama catatan tampil. Catatan hilang begitu durasi lain dipilih atau paket berisi paling banyak 8 kejadian dipilih.

### B. Ronde 5 menit

- **P-3. Siklus ruang.** Aturan siklus tidak berubah: hitung mundur 3 detik, lalu `berakhirPada` = `mulaiPada` + 5 × 60.000 ms. Tambah 2 menit, jeda, lanjut, dan akhiri bekerja seperti di ronde lain, dan ronde selesai sendiri saat sisa waktu habis.
- **P-4. Batas bergabung terlambat.** Isian tetap 0 sampai 10 menit dengan bawaan 5. Di ronde 5 menit, nilai 5 menit atau lebih berarti pemain boleh bergabung sampai ronde berakhir. Tidak ada perubahan otomatis; hal ini dijelaskan di panduan guru.
- **P-5. Masa dan jam cerita.** Kemajuan tetap 1 − sisa ÷ durasi (P-30 JS-07), dengan ambang yang sama: pagi sampai 0,3, siang sampai 0,65, lalu sore. Di ronde 5 menit tanpa tambah waktu, siang mulai 1 menit 30 detik sesudah mulai dan sore mulai 3 menit 15 detik sesudah mulai. Jam cerita tetap 06.00 sampai 18.00.
- **P-6. Peringatan akhir ronde.** Ambang peringatan adalah 60 detik untuk ronde 5 menit dan 120 detik untuk ronde 10, 15, dan 20 menit, dihitung dari `durasiMenit` pengaturan ruang. Diberikan sisa waktu turun ke ambang itu atau di bawahnya (dan masih lebih dari 0), maka:
  - di layar pemain, sisa waktu berlatar `mango`, busur hari berdenyut (tanpa denyut bila kurangi gerak), dan pita tampil 3 detik serta diumumkan sekali: "Satu menit lagi" di ronde 5 menit, atau "Dua menit lagi" di ronde lain (P-32 JS-07);
  - di layar kelas, bunyi `peringatan` berbunyi sekali saat sisa waktu turun melewati ambang selama `main` (P-31 JS-14).

  Pita dan bunyinya muncul lagi bila tambah waktu membuat sisa waktu naik di atas ambang lalu turun lagi. Atribut uji `data-dua-menit` pada sisa waktu tetap bernama sama dan kini berarti "peringatan akhir ronde".
- **P-7. Aturan lain tetap.** Kotak bantuan muncul lagi 90 detik sesudah diambil, masa aktif skill tetap (Lari cepat 6 detik, Kompas 20 detik, dan Teropong 30 detik), muatan paling banyak tetap, jeda antarpemakaian 2 detik, dan Kompas +1 untuk jawaban tepat. Musik latar layar kelas tetap berbunyi di lobi dan selama ronde (JS-21). Pembahasan tetap memuat semua kejadian paket.

### C. Kode lama di HP

- **P-8. Tambahan protokol.** `inti/versi.ts` mendapat `PROTOKOL_TAMBAHAN` bernilai 1, sedangkan `PROTOKOL_VERSI` tetap 6. Tambahan protokol naik bila pesan yang sudah ada mendapat nilai baru yang tidak dikenal kode lama, tetapi kode lama tetap sah untuk ruang yang tidak memakai nilai baru itu. Untuk JS-25, nilai barunya adalah `durasiMenit` 5 di `selamat_datang` dan `info_kelas`.
  - Layar pemain menyambung ke `/ws/ruang/{KODE}?tambahan=1`.
  - `/api/sehat` menjawab `{"ok":true,"protokol":6,"tambahan":1,"lingkungan":…}` (ditambah `darurat` seperti sekarang), sehingga pemilik proyek bisa memastikan v1.2 terpasang walaupun protokol tetap 6.
- **P-9. Penjaga ruang 5 menit.** Durable Object membaca angka `tambahan` dari alamat sambungan pemain (tidak ada atau tidak sah berarti 0). Diberikan ruang berdurasi 5 menit, ketika sambungan pemain dibuka dengan `tambahan` kurang dari 1, maka Durable Object mengirim `galat` dengan kode `VERSI_BERBEDA` dan teks "Ada pembaruan. Muat ulang halaman." (amplop versi 6), lalu menutup sambungan dengan kode 4005. Pesan lain dari sambungan itu tidak diproses, dan keadaan ruang (pemain, batas halo, dan pemakaian) tidak berubah selain hitungan sambungan. Ruang 10, 15, dan 20 menit tidak memeriksa `tambahan`.
- **P-10. Yang dilihat HP dengan kode lama.** Kode v1.1 menerima `galat` itu sebagai galat yang sah, berhenti menyambung ulang, lalu menampilkan "Ada pembaruan. Muat ulang halaman." dengan tombol "Muat ulang" (perilaku yang sudah ada, dibuktikan di percobaan Plan). Sesudah dimuat ulang, HP memakai kode baru dan bisa masuk. Tanpa penjaga ini, kode v1.1 menolak `selamat_datang` berdurasi 5 dan tertahan di "Menghubungkan…".
- **P-11. Layar kelas dan konsol.** Layar kelas selalu dibuka di tab baru dari konsol, sehingga memakai kode terbaru. Konsol yang masih terbuka sejak sebelum rilis tidak punya tombol "5 menit" dan diingatkan memuat ulang oleh penanda versi konsol (P-26 JS-15). Karena itu sambungan layar kelas tidak memakai penjaga P-9. `info_kelas` ruang 5 menit memuat `durasiMenit` 5, dan lobi layar kelas menulis "… · 5 menit · …" lewat teks `kelas.info` yang sudah ada.

### D. Hasil, riwayat, dasbor, statistik, dan CSV

- **P-12. Hasil per ruang.** Baris "Durasi" di halaman Hasil menulis "5 menit" lewat teks yang sudah ada (JS-11).
- **P-13. Riwayat ruang.** Tabel riwayat mendapat kolom "Durasi" sesudah kolom "Kode" (DRAF D-2), berisi "{n} menit". Di tampilan HP konsol, kolom itu tampil seperti kolom lain dengan label "Durasi". `GET /api/ruang/riwayat` memuat `durasiMenit` setiap ruang, dibaca dari `pengaturan_json`; nilai yang tidak ada atau tidak sah dianggap 15, seperti halaman Hasil.
- **P-14. Sesi terakhir di dasbor.** Setiap butir kartu "Sesi terakhir" memuat durasi: "{tanggal} · {kelas} · {durasi} menit · {n} pemain · rata-rata {rata}", dan untuk admin "{tanggal} · {kelas} · {guru} · {durasi} menit · {n} pemain · rata-rata {rata}". `GET /api/dasbor` memuat `durasiMenit` setiap sesi.
- **P-15. Ringkasan 30 hari di dasbor.** "Sesi kelas", "Pemain", "Ketepatan Langkah 1", dan sebaran Langkah 2 tetap menghitung semua ruang bukan uji, termasuk ronde 5 menit. "Rata-rata skor" hanya menghitung ruang berdurasi 10 menit atau lebih. Bila ada ruang 5 menit dalam 30 hari itu, kalimat "Rata-rata skor tanpa ronde 5 menit." (DRAF D-3) tampil sesudah "Ruang uji tidak dihitung." di catatan kartu. Bila semua ruang dalam 30 hari itu berdurasi 5 menit, rata-rata skor tampil "–". `GET /api/dasbor` memuat jumlah sesi 5 menit di ringkasan.
- **P-16. Statistik per kejadian.** Halaman Statistik (JS-13) tetap menghitung jawaban dari semua ruang bukan uji, termasuk ronde 5 menit, karena semua ukurannya dihitung per jawaban (persentase benar, sebaran tingkat, median waktu menjawab, indeks kesulitan, dan pilihan keliru terbanyak). PRD 11.2 mencatat hal ini.
- **P-17. CSV.** Kedua berkas CSV (peserta dan jawaban) mendapat kolom terakhir "Durasi (menit)" berisi durasi ruang sebagai bilangan bulat di setiap baris, sesudah kolom terakhir yang sekarang. Urutan kolom lama tidak berubah, seperti kolom "Petunjuk dipakai" JS-09.

### E. Dokumen dan simulasi

- **P-18. Dokumen.** Sesudah kedua gerbang, isi spesifikasi ini dicatat di PRD (JFR-01, 8.1, 11.2, 16, 17, 20, dan 21), Design System (pita peringatan akhir ronde), Architecture (pengaturan ruang, 6.2 tambahan protokol, 6.3, rute dasbor dan riwayat, dan CSV), AGENTS (bagian 5 dan bagian 7 butir 14 tentang tambahan protokol), dan `PLAN.md`. Perubahan dokumen utama ikut ZIP Build.
- **P-19. Simulasi beban.** `simulasi-beban.mjs` mendapat pilihan `--durasi-ruang` (5, 10, 15, atau 20; bawaan tetap 20), menyambung dengan `?tambahan=1`, dan bila durasi ruang lebih pendek dari lama simulasi, membiarkan ronde berakhir sendiri lalu menunggu `selesai` untuk semua bot. Antrean tunda bot dibuat menjaga urutan pesan seperti TCP, dengan satu pewaktu untuk antrean (Temuan 3 JS-18).

## Beberapa pemain sekaligus

- Semua pemain di satu ruang memakai durasi yang sama dan menerima ambang peringatan yang sama, karena keduanya dihitung dari `pengaturan` ruang dan jam server.
- Pemain dengan kode lama dan pemain dengan kode baru bisa berada di ruang 10, 15, atau 20 menit yang sama. Di ruang 5 menit, hanya pemain dengan kode baru yang bisa masuk (P-9).
- Penjaga P-9 berjalan sebelum `halo`, sehingga pemain dengan kode lama tidak tercatat sebagai pemain dan tidak memakan batas pemain.

## Status antarmuka

| Layar | Keadaan | Tampilan |
|---|---|---|
| Dialog Ruang baru | "5 menit" terpilih, paket lebih dari 8 kejadian | Catatan P-2 di bawah tombol durasi |
| Dialog Ruang baru | "5 menit" terpilih, paket paling banyak 8 kejadian | Tanpa catatan |
| Layar pemain | Sisa waktu lebih dari ambang | Seperti sekarang |
| Layar pemain | Sisa waktu 1 sampai 60 detik di ronde 5 menit | Sisa waktu `mango`, busur berdenyut, pita "Satu menit lagi" 3 detik |
| Layar pemain | Jeda selama peringatan | Sisa waktu berhenti, tetap `mango`; busur tidak berdenyut (P-34 JS-07) |
| Layar pemain dengan kode lama | Masuk ruang 5 menit | "Ada pembaruan. Muat ulang halaman." dan tombol "Muat ulang" |
| Layar kelas | Ruang 5 menit | Lobi "… · 5 menit · …"; bunyi peringatan di sisa 60 detik |
| Riwayat ruang | Ruang mana pun | Kolom "Durasi" berisi "{n} menit" |
| Dasbor | Ada ruang 5 menit dalam 30 hari | Catatan "Rata-rata skor tanpa ronde 5 menit." |

## Teks yang tampil (final)

Kelompok `dunia` di `TEKS` (layar pemain):

| Kunci | Teks |
|---|---|
| `dunia.satuMenit` | Satu menit lagi |

`TEKS_KONSOL`:

| Kunci | Teks |
|---|---|
| `ruangBaru.catatanLimaMenit` | Paket ini memuat {n} kejadian. Dalam ronde 5 menit, setiap siswa biasanya sempat menjawab 3 sampai 4 kejadian, jadi paket berisi sekitar 8 kejadian lebih mudah dibahas. |
| `riwayatRuang.kolomDurasi` | Durasi |
| `dasbor.sesiItem` (diubah) | {tanggal} · {kelas} · {durasi} menit · {n} pemain · rata-rata {rata} |
| `dasbor.sesiItemGuru` (diubah) | {tanggal} · {kelas} · {guru} · {durasi} menit · {n} pemain · rata-rata {rata} |
| `dasbor.ringkasanTanpaPendek` | Rata-rata skor tanpa ronde 5 menit. |
| `csv.durasi` | Durasi (menit) |

Teks yang dipakai ulang: `ruangBaru.durasiOpsi` ("{n} menit"), `hasil.durasiIsi` ("{n} menit", juga untuk sel riwayat), `kelas.info`, dan `galat.VERSI_BERBEDA` ("Ada pembaruan. Muat ulang halaman.").

## Data, protokol, API, dan migrasi

- **Protokol.** `PROTOKOL_VERSI` tetap 6. Skema `selamat_datang.pengaturan.durasiMenit` dan `info_kelas.durasiMenit` menjadi 5, 10, 15, atau 20. Perubahan ini aman bagi kode lama karena penjaga P-9 dan karena layar kelas selalu memuat kode terbaru (P-11). Tidak ada pesan baru.
- **Alamat sambungan.** `/ws/ruang/{KODE}?tambahan=1`. Worker meneruskan alamat lengkap ke Durable Object seperti sekarang; Worker v1.1 mengabaikan parameter ini, sehingga HP dengan kode baru tetap bisa masuk bila produksi dikembalikan ke v1.1.
- **API.**
  - `POST /api/ruang`: `durasiMenit` 5 diterima.
  - `GET /api/ruang/riwayat`: setiap ruang mendapat `durasiMenit`.
  - `GET /api/dasbor`: setiap sesi mendapat `durasiMenit`, dan ringkasan mendapat jumlah sesi 5 menit; `rataSkor` ringkasan hanya dari ruang 10 menit atau lebih.
  - CSV peserta dan jawaban: kolom terakhir "Durasi (menit)".
  - Isian baru di skema jawaban konsol tidak wajib, dan skemanya tidak ketat, sehingga konsol yang belum dimuat ulang tetap bisa membaca jawabannya.
- **D1.** Tanpa migrasi. Durasi dibaca dari `ruang.pengaturan_json` dengan `json_extract`. Kueri ringkasan dasbor tetap membaca `ringkasan_json` tanpa membaca tabel `jawaban` (P-24 sampai P-26 JS-13).
- **Fungsi murni untuk uji unit:** ambang peringatan akhir ronde per durasi, keadaan peringatan dari sisa waktu dan durasi, tambahan protokol yang diperlukan sebuah ruang, dan bunyi peringatan layar kelas saat sisa waktu melewati ambang. Nama akhirnya ditetapkan saat Build.

## Aset

Tidak ada aset baru. Bunyi peringatan `sfx_peringatan.wav` (S-07, Disetujui 21 Nov 2026) dipakai ulang. Daftar_Aset menyebut kegunaannya "Dua menit terakhir"; sejak JS-25 bunyi itu menandai peringatan akhir ronde, juga di ronde 5 menit. Catatan itu milik Sesi C dan bisa diperbarui di giliran Sesi C berikutnya.

## Keamanan dan privasi

- Parameter `tambahan` hanya angka kecil yang menyatakan kemampuan kode. Nilai yang tidak sah dianggap 0, dan tidak ada data pemain yang ditambahkan.
- CSV hanya mendapat durasi ruang. Tidak ada data pribadi baru.
- Penjaga P-9 menolak sebelum `halo`, sehingga token pemain dari kode lama tidak diproses di ruang 5 menit.

## Di luar cakupan

- Paket bawaan baru untuk ronde 5 menit di data semai (Sesi B). Admin bisa menyusun paket kecil sendiri lewat halaman Paket di konsol.
- Pengurutan pembahasan menurut jumlah penjawab, atau pembahasan yang hanya memuat kejadian yang dijawab.
- Waktu muncul ulang kotak, masa aktif skill, atau batas terlambat yang berbeda untuk ronde 5 menit.
- Durasi lain selain 5, 10, 15, dan 20 menit, serta durasi bawaan selain 15 menit.
- Saringan durasi di halaman Statistik.
- Penanda versi atau penjaga untuk layar kelas.

## DRAF untuk ditinjau pemilik proyek

- **D-1. Catatan di dialog Ruang baru.**
  - (a, saran) Teks di tabel di atas, tampil bila paket lebih dari 8 kejadian. Angka 3 sampai 4 kejadian diturunkan dari sasaran PRD 16 (sedikitnya 10 kejadian per 15 menit) dan ditinjau lagi sesudah uji coba kelas.
  - (b) Lebih pendek dan tanpa angka: "Ronde 5 menit cocok untuk pemanasan. Paket kecil lebih mudah dibahas."
- **D-2. Letak kolom Durasi di riwayat.**
  - (a, saran) Sesudah "Kode".
  - (b) Tepat sebelum "Rata-rata skor", agar keduanya berdampingan.
- **D-3. Catatan ringkasan dasbor.**
  - (a, saran) "Rata-rata skor tanpa ronde 5 menit."
  - (b) "Rata-rata skor hanya dari ronde 10 menit atau lebih."

## Kriteria penerimaan

- [ ] AC-1 **Pilihan durasi.** P-1: keempat tombol berurutan di dialog, satu baris di 1280 × 720 dan tanpa luapan di 360 × 640; `POST /api/ruang` menerima 5 serta menolak 0, 7, 25, dan teks; `skemaRuangBaru` dan `DURASI_RUANG` diuji unit.
- [ ] AC-2 **Catatan paket.** P-2: tampil untuk "5 menit" dengan Paket inti 16, hilang untuk durasi lain, terhubung lewat `aria-describedby`, dan tidak menahan "Buat ruang"; aturan "lebih dari 8" diuji di unit atau ujung ke ujung dengan paket tiruan 8 dan 9 kejadian.
- [ ] AC-3 **Siklus.** P-3 di uji inti ruang dengan jam tiruan: ronde 5 menit berakhir 300.000 ms sesudah `mulaiPada`, tambah waktu memundurkannya 120.000 ms, dan jeda tidak mengurangi sisa waktu.
- [ ] AC-4 **Masa dan peringatan.** P-5 dan P-6:
  - uji unit untuk masa di 89,9, 90, 194,9, dan 195 detik ronde 5 menit;
  - ambang 60 detik untuk 5 menit dan 120 detik untuk 10, 15, dan 20 menit, termasuk sesudah tambah waktu;
  - uji ujung ke ujung dengan jam tiruan peramban: siang, sore, lalu "Satu menit lagi", sisa waktu `mango`, dan busur berdenyut di ronde 5 menit; ronde 10 menit tetap "Dua menit lagi" (uji `dunia.uji.ts` lama);
  - bunyi peringatan layar kelas di 60 detik untuk 5 menit dan 120 detik untuk ronde lain (uji unit).
- [ ] AC-5 **Aturan lain tetap.** P-7: uji skill, kotak, musik, dan pembahasan yang sudah ada lulus tanpa diubah, selain daftar durasi.
- [ ] AC-6 **Tambahan dan penjaga.** P-8 dan P-9:
  - `/api/sehat` memuat `tambahan` 1 dan `protokol` 6;
  - layar pemain menyambung dengan `?tambahan=1`;
  - sambungan tanpa `tambahan` ke ruang 5 menit menerima `galat` `VERSI_BERBEDA` lalu ditutup 4005, dan jumlah pemain ruang tidak berubah;
  - sambungan dengan `tambahan=1` ke ruang 5 menit menerima `selamat_datang`;
  - sambungan tanpa `tambahan` ke ruang 15 menit tetap diterima.
- [ ] AC-7 **Kode lama.** P-10 di uji unit klien: `galat` `VERSI_BERBEDA` versi 6 lalu tutup 4005 membuat klien berhenti dengan galat itu, dan `selamat_datang` berdurasi 5 lolos skema klien baru.
- [ ] AC-8 **Layar kelas.** P-11: `info_kelas` berdurasi 5 lolos skema, dan lobi layar kelas menulis "5 menit".
- [ ] AC-9 **Hasil, riwayat, dan Sesi terakhir.** P-12 sampai P-14 di uji server dan ujung ke ujung, termasuk ruang lama tanpa `durasiMenit` yang tampil 15 menit.
- [ ] AC-10 **Ringkasan dasbor.** P-15 di uji server dengan ruang 5 dan 15 menit: rata-rata skor hanya dari ruang 15 menit, sesi dan pemain dari keduanya, catatan tampil hanya bila ada ruang 5 menit, dan "–" bila semuanya 5 menit.
- [ ] AC-11 **Statistik per kejadian.** P-16: jawaban dari ruang 5 menit ikut dihitung (uji server).
- [ ] AC-12 **CSV.** P-17: kolom terakhir kedua berkas "Durasi (menit)" dengan nilai 5, dan kolom lain tidak bergeser (uji unit `csv.ts` dan unduhan di uji ujung ke ujung).
- [ ] AC-13 **Beban.** `sim:beban` satu ruang 5 menit × 50 bot sampai ronde berakhir sendiri, sekali tanpa tunda dan sekali dengan `--latensi-ms 80 --jitter-eksp-ms 40`:
  - tanpa sambungan putus tak terduga, pelanggaran, dan galat;
  - 50 dari 50 bot menerima `selesai` dengan rekap yang lolos skema;
  - ronde berakhir 300 detik ± 1 detik sesudah status `main`;
  - lalu lintas turun paling banyak 3 MB per pemain per 15 menit;
  - pada simulasi Angkot dengan tunda seperti JS-18, gerak yang dikoreksi dalam 1 detik sesudah pindah 0 (antrean tunda yang menjaga urutan).
- [ ] AC-14 **Ukuran.** Dibandingkan dengan keadaan sesudah JS-24 (gzip level 9, tiga build): kode layar pemain naik paling banyak 0,6 KB; kode konsol awal naik paling banyak 0,8 KB, termasuk potongan bersama `protokol.js` dan `protokol.css`; potongan layar kelas naik paling banyak 0,3 KB.
- [ ] AC-15 **Perintah resmi.** `content:check:jejak`, `test:jejak`, `test:jejak:server`, `build:jejak`, dan `test:e2e:jejak` lulus; `tsc --noEmit` dan ESLint Jejak bersih; `build:pages` menghasilkan 178 berkas yang identik byte.
- [ ] AC-16 **Tangkapan layar.** `tests/JS-25/` memuat dialog Ruang baru dengan catatan (1280 × 720 dan 360 × 640), HP 731 × 411 dengan "Satu menit lagi", lobi layar kelas ruang 5 menit (1280 × 720), riwayat dengan kolom Durasi, dan dasbor dengan durasi di Sesi terakhir.
- [ ] AC-17 **Manual di lingkungan uji.** Butir "Manual di lingkungan uji" di rencana uji diperiksa pemilik proyek.
- [ ] AC-18 **Dokumen dan rilis.** P-18, dan `rilis/v1.2.md` (templat 12.4) memuat JS-24 dan JS-25.

## Rencana uji

### Unit (`test:jejak`)

- `inti/aturan.test.ts`: `BATAS.durasiMenit`, ambang peringatan per durasi, dan keadaan peringatan di sisa 0, 1, 60, 61, 120, dan 121 detik.
- `dunia/langit.test.ts`: masa dan peringatan untuk ronde 5 menit, termasuk jeda dan tambah waktu.
- `inti/protokol.test.ts`: `selamat_datang` dan `info_kelas` berdurasi 5 lolos; 12 tetap ditolak.
- `kelas/api-ruang.test.ts` dan uji ruang baru: `DURASI_RUANG`, `skemaRuangBaru`, dan tambahan protokol yang diperlukan per durasi.
- `ruang/inti-ruang.test.ts`: siklus ronde 5 menit dengan jam tiruan.
- `ruang/jaringan.test.ts`: alamat sambungan dengan `?tambahan=1`, dan perilaku klien terhadap `galat` `VERSI_BERBEDA` lalu 4005.
- `pengaturan/suara.test.ts`: bunyi peringatan layar kelas melewati 60 dan 120 detik.
- `hasil/` atau uji ekspor: kolom "Durasi (menit)" di kedua CSV.
- `kerangka.test.ts`: teks final JS-25 dan isi `/api/sehat`.

### Server (`test:jejak:server`)

- Penjaga P-9 lewat WebSocket sungguhan: ruang 5 menit tanpa dan dengan `tambahan`, serta ruang 15 menit tanpa `tambahan`.
- `POST /api/ruang` dengan 5 dan nilai yang ditolak.
- Riwayat, Sesi terakhir, dan ringkasan dasbor dengan ruang 5 dan 15 menit yang dimasukkan lewat kait uji dan D1 lokal.
- Statistik per kejadian yang memuat jawaban dari ruang 5 menit.

### Ujung ke ujung (`test:e2e:jejak`), berkas `ronde-5-menit.uji.ts`

1. Konsol 1280 × 720 dan 360 × 640: dialog Ruang baru dengan empat tombol, catatan P-2, lalu ruang uji 5 menit dibuat.
2. HP 731 × 411 dan laptop 1280 × 720 bergabung, layar kelas dibuka dari konsol (lobi menulis "5 menit"), lalu ronde dimulai. Dengan jam tiruan peramban seperti uji `dunia.uji.ts`: sisa waktu awal "05:00" atau "04:5x", pagi, lalu siang, sore, dan "Satu menit lagi" dengan sisa waktu `mango`.
3. Guru mengakhiri ronde, lalu Hasil menulis "5 menit", kedua CSV berakhir dengan kolom "Durasi (menit)" bernilai 5, riwayat menampilkan kolom Durasi, dan Sesi terakhir menulis "5 menit".

### Beban

- AC-13, dengan `--durasi-ruang 5` dan lama simulasi sekitar 330 detik, sekali tanpa tunda dan sekali dengan tunda. Satu run JS-18 (Angkot, dengan tunda) diulang untuk memeriksa antrean tunda yang menjaga urutan.

### Manual di lingkungan uji

1. Muat ulang konsol, buka "+ Ruang baru", lalu pilih "5 menit": catatan tampil untuk Paket inti 16. Buat ruang uji 5 menit, lalu buka layar kelas.
2. Gabung dengan dua HP. Mulai ronde: sisa waktu 05:00. Sekitar 1 menit 30 detik kemudian langit berganti siang, dan sekitar 3 menit 15 detik sesudah mulai berganti sore.
3. Pada sisa waktu 01:00: pita "Satu menit lagi" tampil di HP, sisa waktu berwarna oranye, dan layar kelas berbunyi peringatan.
4. Biarkan ronde berakhir sendiri: podium tampil, dan HP menampilkan rekap.
5. Di konsol: halaman Hasil menulis "Durasi 5 menit"; kedua CSV punya kolom terakhir "Durasi (menit)"; riwayat ruang punya kolom Durasi; Sesi terakhir di dasbor menulis "5 menit".
6. Ulangi satu ronde 10 menit sebentar, lalu akhiri: peringatan tetap "Dua menit lagi" bila sisa waktu turun ke 02:00.

## Bahan panduan guru (JS-16d)

- Pilih "5 menit" untuk pemanasan atau sisa jam pelajaran. Dalam 5 menit, setiap siswa biasanya sempat menjawab 3 sampai 4 kejadian, jadi paket kecil lebih mudah dibahas. Admin bisa menyusun paket kecil, misalnya delapan kejadian, satu per zona, di halaman Paket konsol.
- Di ronde 5 menit, peringatan "Satu menit lagi" muncul 1 menit sebelum waktu habis.
- Batas bergabung terlambat 5 menit berarti siswa boleh bergabung sepanjang ronde 5 menit. Isi 2 bila ingin membatasinya.
- Riwayat ruang dan CSV memuat durasi. Rata-rata skor di ringkasan dasbor tidak menghitung ronde 5 menit, karena skor ronde pendek tidak sebanding dengan ronde yang lebih panjang.
- HP yang tabnya terbuka sejak sebelum pembaruan diminta memuat ulang saat masuk ruang 5 menit. Ruang 10, 15, dan 20 menit tidak memintanya.

## Catatan Build (28 Nov 2026)

- Kunci teks `riwayat.kolomDurasi` di tabel "Teks yang tampil (final)" ditulis `riwayatRuang.kolomDurasi`, karena halaman Riwayat ruang memakai kelompok `riwayatRuang` (kelompok `riwayat` milik riwayat versi kejadian). Teksnya tetap "Durasi".
- Nama akhir: `PROTOKOL_TAMBAHAN` (`inti/versi.ts`), `tambahanDiperlukan`, `bacaTambahan`, dan `durasiSah` (`inti/ruang.ts`), `ambangPeringatanDetik` dan `peringatanAkhir` (`inti/aturan.ts`), `lewatPeringatan` (`admin/kelas/suara-kelas.ts`), dan `alamatSambungan` (`pemain/jaringan.ts`, agar alamat dengan `?tambahan=1` bisa diuji unit). Isian `Langit.duaMenit` dan atribut `data-dua-menit` tetap bernama sama dan berarti peringatan akhir ronde.
- Isian baru di skema jawaban konsol (`durasiMenit` di riwayat dan sesi dasbor, `sesiPendek` di ringkasan) dibuat tidak wajib; konsol menganggap durasi yang tidak ada 15, seperti halaman Hasil.
- Ruang yang ditolak penjaga P-9 memakai `WebSocket.accept()` biasa, bukan soket berhibernasi, sehingga pesannya tidak pernah sampai ke penanganan pesan ruang.
- Uji server ringkasan dasbor memakai ruang uji yang ditandai bukan uji lewat D1 sesudah ditutup, karena paket bawaan belum siap untuk ruang biasa di server uji.
- Uji ujung ke ujung memeriksa bunyi peringatan layar kelas lewat uji unit `lewatPeringatan` dan pemakaian `info.durasiMenit` di layar kelas; bunyinya didengar pemilik proyek di AC-15.
- `simulasi-beban.mjs` juga mencatat lama ronde dari sisi bot (`lamaRondeBotMs`) di samping lama ronde dari sisi layar kelas (`lamaRondeMs`).

