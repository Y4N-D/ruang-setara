# Panduan guru Jejak Setara (draf)

| | |
|---|---|
| Untuk | Plan JS-16: panduan guru satu halaman (PRD bagian 16) |
| Ditulis | Sesi B, 20 November 2026 |
| Cakupan | Fitur yang sudah Selesai: JS-01 sampai JS-08, JS-10, JS-12, dan JS-22 (tombol darurat). Bagian yang menunggu JS-11 dan JS-09 bertanda [menyusul] |
| Status | Draf; dibaca Sesi A di Plan JS-16 (Permintaan A-13 di `STATUS.md`) |

## Halaman untuk guru

### Jejak Setara: panduan guru

Siswa bermain di HP; papan skor dan pembahasan tampil di proyektor. Satu sesi sekitar 30–40 menit.

#### 1. Persiapan

- **Perangkat.** Laptop guru (Chrome atau Edge) tersambung ke proyektor dalam mode **Perluas** (`Windows`+`P`), agar konsol tidak ikut tampil. Siswa memakai HP Android (Chrome, mendatar) atau laptop.
- **Sinyal.** Wifi sekolah atau data seluler (sekitar 5 MB per HP per sesi); coba dulu di kelas.
- **Akun.** Minta akun guru kepada admin, lalu ganti sandi sementara saat pertama masuk ke konsol.
- **Privasi.** Sampaikan bahwa siswa hanya memakai nama samaran, tanpa nama asli, foto, atau obrolan.

#### 2. Membuat ruang

Buka menu **Ruang**, klik **+ Ruang baru**, isi **Label kelas** (misalnya IX B), pilih **Paket inti 16**, lalu klik **Buat ruang**. Bawaannya 15 menit dan 40 pemain. Biarkan **Ruang uji** kosong untuk kelas sungguhan, dan centang **Minta nomor absen** hanya dengan persetujuan sekolah. Pilihan skill per ruang [menyusul].

#### 3. Membuka layar kelas

Di halaman detail ruang, klik **Buka layar kelas**, pindahkan tab itu ke layar proyektor, lalu tekan `F` (layar penuh). Bila tab itu tertutup, ronde tetap berjalan; buka lagi dari detail ruang.

#### 4. Alur satu ronde

| Tahap | Guru | Siswa |
|---|---|---|
| Lobi, 3–5 menit | Menunggu semua siswa masuk, lalu **Kunci ruang** (`L`) dan **Mulai ▶** (`Spasi`) | Membuka alamat di layar, mengetik kode, memilih nama samaran dan avatar |
| Bermain, 15 menit | Memantau 10 besar; **Jeda** dan **Lanjut** (`Spasi`), **+2 menit** (`T`), **Akhiri** (`A`) | Memeriksa tanda "!" dan menjawab dua langkah dengan **Kunci jawaban**. Skill [menyusul] |
| Podium, 1–2 menit | Mengumumkan tiga besar, lalu **Pembahasan ▶** (`→`) | Melihat skor dan peringkat sendiri. Rekap dan refleksi [menyusul] |
| Pembahasan, 10–15 menit | Membahas sebaran pilihan dan kartu dampak (`←` `→`), lalu **Tutup ruang** | Menjelaskan alasan pilihannya |

Riwayat, hasil ruang, dan CSV [menyusul]; sebelum itu, hasil tidak bisa dilihat sesudah ruang ditutup.

#### 5. Tips mengelola kelas

- Skor berasal dari ketepatan, bukan kecepatan. Ajak siswa membaca dengan teliti.
- Proyektor hanya menampilkan 10 besar. Hindari menyebut siswa yang skornya rendah.
- Keluarkan pemain yang mengganggu atau ganda (dua tab) dari detail ruang, bukan di depan kelas.
- Di pembahasan, dahulukan kejadian yang banyak dijawab keliru.

#### 6. Bila ada masalah

- **HP terputus.** HP menyambung ulang sendiri tanpa kehilangan skor; tombol **Muat ulang** dan **Coba lagi** aman ditekan. Siswa yang menutup tab atau berganti HP masuk lagi sebagai pemain baru dengan skor nol, selama ruang tidak dikunci, belum penuh, dan batas terlambat (bawaan 5 menit) belum lewat.
- **Kuota paket gratis** (selama layanan masih memakai paket gratis). Kuota harian dipakai bersama semua ruang; patokannya 5 ronde sehari untuk kelas 40 siswa, atau 7 ronde untuk 30 siswa. Bila habis, permainan tidak bisa dipakai sampai pukul 08.00 WITA berikutnya; laporkan kepada admin.
- **Tombol darurat.** Di kelas, pakai **Jeda** atau **Akhiri**. Untuk menghentikan seluruh layanan, admin menjalankan "Jejak: hentikan" di GitHub; dalam beberapa menit semua ruang ditutup, dan HP menampilkan "Ruang ditutup" atau "Layanan berhenti sementara". Sesudah pulih, buat ruang baru.

## Catatan penyusunan (bukan bagian halaman)

**Sumber setiap bagian.** Label tombol dan pesan disalin dari `app/jejak-setara/teks.ts` dan `teks-konsol.ts` di ZIP `main` sesudah JS-12 dan JS-22.

| Bagian | Sumber |
|---|---|
| Pembuka dan 1. Persiapan | PRD bagian 4, 12, 13, dan 18; Architecture bagian 15 ("Sebelum kelas"); spesifikasi JS-04 (sandi sementara wajib diganti saat masuk pertama); `PLAN.md` entri JS-10, risiko mode layar cermin. Angka 5 MB dijumlahkan dari dua anggaran PRD bagian 12: lalu lintas permainan paling banyak 3 MB per ronde dan aset pemain paling banyak 2 MB yang dimuat sekali |
| 2. Membuat ruang | Spesifikasi JS-10 P-2 sampai P-5; JS-12 (Paket inti 16 siap untuk ruang biasa sesudah 16 kejadian terbit dengan rujukan terverifikasi, `PLAN.md` "Lingkungan uji JS-12") |
| 3. Membuka layar kelas | Spesifikasi JS-10 P-9, P-13, P-15, dan P-23; Architecture bagian 10.9 |
| 4. Alur satu ronde | PRD bagian 6 dan 8.6; spesifikasi JS-03 P-19, JS-08 P-43 dan P-59, serta JS-10 P-24 sampai P-30. Waktu per tahap adalah perkiraan: target bergabung paling lama 3 menit (PRD bagian 16) dan durasi bawaan 15 menit |
| 5. Tips | PRD bagian 8.4, 8.6, dan 18; spesifikasi JS-10 P-30 (mengeluarkan pemain hanya di detail ruang) |
| 6. Bila ada masalah | Spesifikasi JS-03 P-19, P-26, P-29, dan P-30; JS-22 P-8, P-9, P-11 sampai P-13, dan "Beberapa pemain sekaligus"; Architecture bagian 13.4; `PLAN.md` entri JS-22, "Perkiraan ronde per hari di paket gratis" |

**Bagian [menyusul].**

| Bagian | Menunggu |
|---|---|
| Pilihan skill per ruang (bagian 2); skill dan kotak bantuan (bagian 4) | JS-09 |
| Rekap pribadi dan refleksi (bagian 4); riwayat, hasil ruang, dan unduhan CSV (sesudah tabel bagian 4) | JS-11 (kalimat refleksi: `naskah/refleksi.md`) |

**Dipangkas agar muat satu halaman**, dan bisa dikembalikan di Plan JS-16 bila tata letaknya mengizinkan: alamat konsol berakhiran `/admin/`; tombol **Keluar** untuk laptop yang dipakai bergantian; poin skor (Langkah 1 benar 40; Langkah 2 tepat 60, kurang tepat 25, berisiko 0); batas bergabung terlambat bawaan 5 menit di bagian 2; satu ruang terbuka per guru; nomor absen hanya untuk paling banyak 50 pemain; pesan "Layar kelas dibuka di tab lain." dengan tombol **Pakai tab ini**; pesan "Sesi berakhir. Silakan masuk lagi." di layar kelas; serta tahapan sambung ulang HP (kalimat wifi sesudah 30 detik, **Muat ulang** sesudah 2 menit, dan **Coba lagi** sesudah 10 menit).

**Sengaja tidak dimuat**, karena fiturnya belum ada atau bukan untuk guru: kode QR dan kode masuk ulang (JS-17); suara, pengaturan pemain, dan pemberitahuan privasi di layar (JS-14); statistik (JS-13); bank kejadian dan verifikasi rujukan (untuk admin dan Peninjau, JS-12); bagian "Pemakaian ronde ini" (hanya admin, JS-22).

**Diperiksa ulang di Plan JS-16:**

1. Alamat konsol dan alamat untuk HP mengikuti keputusan domain (KT-06). Lingkungan uji kini memakai `jejak-setara-uji.ruangsetara.workers.dev`.
2. Bagian kuota paket gratis diganti atau dihapus sesudah Workers Paid aktif, yang dijadwalkan sebelum JS-15 atau uji coba kelas pertama. Tampilan di HP saat kuota habis belum pernah diamati, sehingga halaman ini hanya menyebut akibatnya.
3. "Jejak: hentikan" mendapat pilihan produksi di JS-15.
4. Urutan menutup ruang dan rekap pribadi: saat ruang ditutup, HP pindah ke layar "Ruang ditutup" (JS-03). Specify JS-11 perlu memastikan siswa sempat membaca rekap dan menyalin kalimat refleksi sebelum guru menekan **Tutup ruang**, lalu baris Pembahasan di tabel bagian 4 disesuaikan.
5. Siswa yang menutup tab atau berganti HP tetap tercatat sebagai pemain terputus dan ikut dihitung dalam batas pemain (JS-03 P-19), sehingga di kelas yang jumlah siswanya sama dengan batas pemain ia tidak bisa masuk lagi. Plan JS-16 bisa menyarankan batas pemain sedikit di atas jumlah siswa; kode masuk ulang (JS-17, JFR-07) ditujukan untuk kasus ini.
6. Angka data per HP diukur ulang di JS-15, dan waktu per tahap ditinjau sesudah uji coba kelas (KT-12).
7. Panjang: bagian "Halaman untuk guru" (470 kata) muat satu halaman A4 dengan margin 2 cm dan huruf setara Calibri 11 pt (dicetak percobaan dengan Chromium, 20 November 2026). Dengan huruf yang lebih lebar, misalnya Arial 11 pt, isinya sekitar 1,2 halaman, jadi tata letak akhir di JS-16 perlu memperhitungkannya.
