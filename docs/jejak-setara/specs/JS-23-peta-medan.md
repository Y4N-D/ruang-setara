# JS-23 — Peta bermedan

Status: **Disetujui (26 Nov 2026)**, `Spesifikasi disetujui: JS-23` (D-1 sampai D-3 = a). Diuji: [JS-23-hasil.md](../tests/JS-23-hasil.md). Dasar: Plan lanjutan JS-23 di `PLAN.md` (`Setuju: JS-23`, usulan 1 sampai 9 = a, 26 Nov 2026), Gerbang 1 rencana v1.1 (usulan 3a sampai 6a), gambar medan G-01 sampai G-03 (PC-1, Disetujui 26 Nov 2026), serta spesifikasi JS-07 (P-35 sampai P-39) dan JS-10 (P-26, P-31, dan P-35).

## Ringkasan

Peta mini dan peta besar di layar pemain serta peta kelas di layar kelas memakai gambar medan kampung masa siang buatan Sesi C, menggantikan kotak zona berwarna. Peta mini memakai gambar 1 atau 2 px per ubin menurut rasio layar, sedangkan peta besar dan peta kelas memakai gambar 4 px per ubin, semuanya tanpa penghalusan. Halte, penanda kejadian yang sudah terlihat, panah diri, label zona, dan titik pemain tetap tampil di atas medan. Kejadian yang belum terlihat tetap tersembunyi, dan peta kelas tetap tanpa letak kejadian. Label zona di peta besar pindah ke sudut kiri atas zonanya, di bawah halte dan penanda. Titik pemain di peta kelas menjadi 3 ubin bergaris putih dan `ink`. Dua galat ESLint lama ikut diperbaiki. Server, protokol, basis data, manifest, teks, dan gambar medan tidak berubah.

## Kaitan PRD

- JFR-11, ditulis ulang di ZIP ini: peta mini pribadi bermedan dengan posisi sendiri, halte, dan kejadian yang sudah pernah terlihat; peta besar memakai medan yang sama dengan nama zona.
- JFR-28, ditulis ulang di ZIP ini: peta kelas bermedan berisi titik pemain tanpa lokasi kejadian.
- PRD 17: peta bermedan masuk versi 1.1.
- Design System 3.3, 3.6, 9, 10, 13, dan 14; Architecture 9, 10.9, 11.2, dan 11.3.
- Spesifikasi JS-07 P-35 sampai P-39 (D-3 diubah usulan 5a, D-4 menjadi cadangan), JS-08 P-18 dan P-19, serta JS-10 P-26, P-31, dan P-35.
- Permintaan C-20 Sesi C (diterapkan di ZIP Gerbang 1) dan catatan Plan dari Test JS-21 (ESLint, batas kenaikan konsol, dan uji dalam kelompok kecil).

## Berkas

| Berkas | Jenis | Isi |
|---|---|---|
| `app/jejak-setara/pemain/dunia/medan.ts` | Baru | Fungsi murni `pilihMedan`, `ukuranMedanMini`, dan `letakLabelZona`, serta pemuat gambar medan sekali per halaman dengan satu kali coba ulang (P-2 sampai P-7 dan P-12) |
| `app/jejak-setara/pemain/PetaMini.tsx` | Diubah | Medan dari kanvas simpanan dan warna zona sebagai cadangan (P-7 sampai P-10) |
| `app/jejak-setara/pemain/PetaBesar.tsx` | Diubah | `medan4` di kanvas, label zona di sudut, dan urutan lapisan (P-11 sampai P-15) |
| `app/jejak-setara/pemain/LayarDunia.tsx` | Diubah | Mulai memuat gambar saat layar dunia terpasang, dan kunci gambar ulang peta mini memuat keadaan gambar (P-4 dan P-10) |
| `app/jejak-setara/styles/jejak.css` | Diubah | Urutan lapisan dan letak label zona (P-12 dan P-13) |
| `app/jejak-setara/admin/kelas/PetaKelas.tsx` | Diubah | Gambar medan, ikon zona, dan titik bergaris ganda (P-16 dan P-17) |
| `app/jejak-setara/admin/kelas/tampilan-kelas.ts` | Diubah | Fungsi murni `letakTitikKelas` (P-17) |
| `app/jejak-setara/admin/kelas/LayarKelas.tsx` | Diubah | Memuat gambar medan saat layar kelas terbuka, dan Perbesar QR sebagai nilai turunan (P-18 dan P-21) |
| `app/jejak-setara/admin/halaman/DetailRuang.tsx` | Diubah | Waktu sekarang diisi saat kode masuk ulang diterima (P-20) |
| `app/jejak-setara/styles/kelas.css` | Diubah | Gambar medan, titik bergaris ganda, dan latar cadangan; gaya kotak zona berwarna dihapus (P-16 sampai P-18) |
| `app/jejak-setara/__tests__/dunia/medan.test.ts` | Baru | Uji unit P-2 sampai P-7 dan P-12 |
| `app/jejak-setara/__tests__/kelas/tampilan-kelas.test.ts` | Diubah | Uji `letakTitikKelas` |
| `app/jejak-setara/__tests__/kerangka.test.ts` | Diubah | Teks yang dipakai tetap, dan aturan impor peta kelas |
| `e2e/jejak-setara/dunia.uji.ts` dan `kelas.uji.ts` | Diubah | Uji ujung ke ujung dan tangkapan layar |
| `docs/jejak-setara/tests/JS-23-hasil.md` dan `docs/jejak-setara/tests/JS-23/` | Baru | Laporan dan tangkapan layar Test |

Tidak disentuh: server, `inti/`, protokol, `assets/manifest.ts`, `CREDITS.md`, gambar medan dan sumber peta (berkas Sesi C), `teks.ts` dan `teks-konsol.ts`, `scripts/jejak-setara/anggaran.mjs` (aset baru terhitung sendiri), `package.json`, lockfile, alur kerja, `wrangler.jsonc`, berkas Sesi B, Sehari Setara, dan galeri.

## Perilaku

### A. Gambar medan

- **P-1. Sumber.** Layar pemain memakai `PETA.medan1`, `PETA.medan2`, dan `PETA.medan4` dari `assets/manifest.ts`. Layar kelas mengimpor `assets/peta/peta_medan_4.png` langsung, karena konsol tidak mengimpor manifest (P-35 JS-10). Di gambar n piksel per ubin, ubin (x, y) menempati piksel x·n sampai (x+1)·n − 1 dan y·n sampai (y+1)·n − 1.
- **P-2. Gambar peta mini.** Diberikan rasio piksel perangkat r (`window.devicePixelRatio`, atau 1 bila tidak tersedia), maka peta mini memakai `medan2` bila r ≥ 2 dan `medan1` bila r < 2 (`pilihMedan`). Rasio diambil dari keadaan layar yang sudah ada, yang diperbarui saat ukuran jendela berubah. Bila rasio berubah melewati 2, gambar yang sesuai dimuat (P-4) dan dipakai sesudah siap; sementara itu peta mini memakai cadangan (P-9).
- **P-3. Gambar peta besar dan peta kelas.** Peta besar dan peta kelas selalu memakai gambar 4 px per ubin.
- **P-4. Pemuatan di layar pemain.** Ketika layar dunia terpasang (lobi, hitung mundur, atau ronde, termasuk sesudah menyambung ulang), layar pemain mulai memuat gambar peta mini untuk rasio saat itu dan `medan4`. Setiap gambar dimuat sekali per halaman, ditambah satu kali coba ulang bila gagal (P-5), lalu disimpan untuk dipakai ulang. Tombol Masuk tidak menunggu gambar ini, dan HP tidak memuat gambar peta mini untuk rasio lain kecuali rasionya berubah melewati 2.
- **P-5. Gagal memuat.** Bila sebuah gambar gagal dimuat, peta yang memakainya menampilkan cadangan tanpa pesan. Gambar itu dicoba sekali lagi paling cepat 10 detik sesudah gagal, saat gambar itu dibutuhkan lagi (peta mini digambar ulang atau peta besar dibuka). Sesudah gagal kedua, gambar itu tidak dicoba lagi sampai halaman dimuat ulang (DRAF D-3).
- **P-6. Tanpa penghalusan.** Gambar medan digambar dengan `imageSmoothingEnabled = false` di kanvas dan `image-rendering: pixelated` di peta kelas, sehingga hanya warna palet yang tampil.

### B. Peta mini

- **P-7. Kanvas simpanan.** Diberikan gambar peta mini sudah siap, maka gambar itu diubah ukurannya sekali ke kanvas simpanan berukuran round(160 × 0,7r) × round(100 × 0,7r) piksel perangkat (`ukuranMedanMini`): 112 × 70 pada r = 1, 168 × 105 pada r = 1,5, 294 × 184 pada r = 2,625, dan 336 × 210 pada r = 3. Kanvas simpanan dibuat ulang hanya bila gambar sumber atau ukurannya berubah.
- **P-8. Urutan gambar.** Setiap kali peta mini digambar ulang: latar `ink` seluas kanvas (pita atas dan bawah 2,5 px CSS seperti v1.0), kanvas simpanan di y = round(2,5r), ikon halte, penanda kejadian yang sudah terlihat (yang selesai lebih dulu, JS-08 P-18), lalu panah diri. Ukuran dan letak ikon sama dengan v1.0. Batas zona tidak digambar (usulan 3a).
- **P-9. Cadangan.** Selama gambar peta mini belum siap, gagal, atau sedang diganti karena rasio berubah, peta mini menampilkan delapan zona berwarna dominan dengan garis batas `ink` seperti v1.0 (D-4 JS-07), di bawah halte, penanda, dan panah diri.
- **P-10. Kapan digambar ulang.** Peta mini tetap digambar ulang hanya saat pemain pindah ubin, berbelok, ukuran kanvas berubah, atau penanda kejadian berubah (v1.0), ditambah sekali saat gambar medannya menjadi siap atau berganti.

### C. Peta besar

- **P-11. Kanvas medan.** Skala peta besar tetap seperti JS-07 P-38 (`skalaPetaBesar`: bilangan bulat terbesar yang muat, paling kecil 2 px CSS per ubin). Diberikan `medan4` siap, maka kanvas peta besar (160s × 100s px CSS, dikali rasio) diisi `medan4` yang diperbesar ke seluruh kanvas tanpa penghalusan. Selama `medan4` belum siap atau gagal, kanvas berisi zona berwarna v1.0. Bila `medan4` menjadi siap selama peta besar terbuka, kanvas langsung digambar ulang dengan medan tanpa menutup peta.
- **P-12. Label zona.** Setiap label (ikon zona 16 × 16 dan nama zona, dengan gaya v1.0) diletakkan dengan pojok kiri atasnya di (kiri × s + 3, atas × s + 3) px dari pojok peta, tanpa digeser ke tengah. Lebar luar label, termasuk garis dan jarak dalamnya, paling besar lebar zona × s − 6 px dan tidak lebih lebar daripada label v1.0, sedangkan nama yang tidak muat terbungkus (`letakLabelZona`; DRAF D-1). Pada skala 2, label Z1 dan Z3 menjadi dua baris; pada skala 3 ke atas, lebar dan tinggi semua label sama dengan v1.0.
- **P-13. Urutan lapisan.** Dari bawah ke atas: kanvas medan, label zona, ikon halte, penanda kejadian (yang selesai lebih dulu), lalu "Kamu di sini". Penanda kejadian dan halte tidak pernah tertutup label zona.
- **P-14. Tanpa garis batas zona** (usulan 3a). Daerah zona terbaca dari medan dan labelnya.
- **P-15. Yang tetap.** Judul "Peta kampung", ringkasan "Kejadian terlihat {n}, selesai {m}.", tombol "Tutup peta", cara membuka dan menutup (`P`, ketuk atau klik peta mini, dan `Esc`), fokus, serta pemain yang berhenti selama peta terbuka tetap seperti JS-07 P-37 sampai P-39 dan JS-08 P-19.

### D. Peta kelas

- **P-16. Isi peta.** Peta kelas berukuran 160 × 100 satuan berisi, dari bawah: gambar `peta_medan_4.png` selebar dan setinggi peta (tanpa menjaga perbandingan, karena perbandingannya sudah sama, dan dengan `image-rendering: pixelated`), delapan ikon zona 7 × 7 satuan dengan pojok kiri atas di (kiri + 1,5, atas + 1,5) seperti v1.0, lalu titik pemain. Kotak zona berwarna dan garis batas zona tidak digambar, dan letak kejadian tetap tidak pernah digambar (JFR-28).
- **P-17. Titik pemain.** Setiap pemain di `dunia_kelas` digambar sebagai satu kelompok berisi kotak 3 × 3 satuan, digeser ke (x/16 − 1,5, y/16 − 2,25), sehingga pusatnya 0,75 ubin di atas titik kaki (`letakTitikKelas`). Isinya warna tas pemain. Garisnya bertebal tetap dalam piksel layar (`vector-effect: non-scaling-stroke`): garis `ink` 5 px di belakang, lalu garis `white` 2 px di depan, sehingga tampak garis dalam putih 2 px dan garis luar `ink` 1,5 px. Pemain terputus tampil 40% seperti v1.0. Titik tetap bergerak halus 0,5 detik di antara dua kiriman `dunia_kelas`, dan urutan gambarnya mengikuti urutan pemain di pesan itu.
- **P-18. Pemuatan di layar kelas.** Ketika layar kelas terpasang di lobi, `peta_medan_4.png` mulai dimuat sekali per tab, sehingga biasanya sudah siap saat ronde dimulai. Selama gambar belum siap atau gagal, latar peta berwarna `mist` polos dengan ikon zona dan titik pemain di atasnya (DRAF D-2). Gambar yang gagal dimuat lagi saat halaman layar kelas dimuat ulang.
- **P-19. Label pembaca layar** tetap "Peta kampung dengan {n} pemain. Letak kejadian tidak ditampilkan." (JS-10 P-31).

### E. Perbaikan dua galat ESLint lama

- **P-20. Detail ruang.** Saat kode masuk ulang diterima dari server, halaman detail ruang mengisi waktu sekarang bersama kode itu. Efek pewaktu hanya memasang dan melepas detik berjalan, tanpa mengubah keadaan secara langsung. Hitung mundur 10 menit tampil sama seperti JS-16b.
- **P-21. Perbesar QR.** QR besar tampil bila guru memilihnya dan status ruang `lobi`, dihitung langsung dari kedua nilai itu, bukan lewat efek yang mengubah keadaan. Perilakunya sama seperti JS-16b: QR besar hilang saat ronde dimulai.
- **P-22. Tanpa perubahan lain.** Server, protokol (`PROTOKOL_VERSI` tetap 5), migrasi D1, `manifest.ts`, gambar medan, dan teks tidak berubah.

## Beberapa pemain sekaligus

- Setiap HP memuat gambar medannya sendiri sebagai berkas statis berhash, seperti ikon dan lembar ubin, tanpa pesan atau tulisan baru ke server. Satu HP mengunduh paling banyak 14 KB, jadi 100 pemain sekitar 1,4 MB untuk satu ruang, sekali per halaman.
- Di peta kelas dengan 100 pemain, titik yang bertumpuk tetap terpisah oleh garis putih dan `ink`, dan urutan gambarnya mengikuti urutan pemain di `dunia_kelas`.
- Peta mini dan peta besar setiap pemain tetap hanya menampilkan kejadian yang sudah terlihat oleh pemain itu (JFR-11).
- Pemain yang menyambung ulang memakai gambar yang sudah tersimpan di halamannya, dan layar kelas yang menyambung ulang tidak memuat ulang gambar.

## Status antarmuka

| Keadaan | Peta mini | Peta besar | Peta kelas |
|---|---|---|---|
| Biasa | Medan, halte, penanda, dan panah diri | Medan, label zona di sudut, halte, penanda, dan "Kamu di sini" | Medan, ikon zona, dan titik pemain |
| Memuat gambar | Zona berwarna v1.0 (P-9) | Zona berwarna v1.0 (P-11) | Latar `mist` (P-18) |
| Galat memuat | Zona berwarna, dicoba sekali lagi (P-5) | Zona berwarna, dicoba sekali lagi (P-5) | Latar `mist` sampai halaman dimuat ulang |
| Kosong | Belum ada kejadian terlihat: medan, halte, dan panah diri | Ringkasan "Kejadian terlihat 0, selesai 0." | Belum ada pemain: medan dan ikon zona |
| Fokus | Seperti v1.0 (garis `sun` dan ▶) | Fokus awal di "Tutup peta" (v1.0) | Tidak bisa difokus (v1.0) |
| Nonaktif | Tidak relevan | Tidak relevan | Tidak relevan |
| Dijeda | Seperti v1.0 | Seperti v1.0 | Di bawah lapisan jeda (v1.0) |
| Terputus dan menyambung ulang | Tertutup lapisan menyambung (v1.0) | Tertutup lapisan menyambung (v1.0) | Tetap tampil dengan pita menyambung ulang (v1.0) |
| HP tegak | Tidak tampil (v1.0) | Tidak tampil (v1.0) | Tidak relevan |
| Ruang penuh dan ruang terkunci | Tidak relevan | Tidak relevan | Tidak relevan |

## Teks yang tampil (final)

Tidak ada teks baru atau berubah. Teks yang tampil di ketiga peta tetap:

| Kunci | Teks |
|---|---|
| `peta.bukaBesar` | Buka peta besar |
| `peta.judul` | Peta kampung |
| `peta.tutup` | Tutup peta |
| `peta.kamuDiSini` | Kamu di sini |
| `peta.halte` | Halte |
| `peta.ringkasanKejadian` | Kejadian terlihat {n}, selesai {m}. |
| `kelas.petaLabel` | Peta kampung dengan {n} pemain. Letak kejadian tidak ditampilkan. |

Enam kunci pertama ada di `TEKS` (`teks.ts`), dan `kelas.petaLabel` di `TEKS_KONSOL` (`teks-konsol.ts`). Nama zona di label peta besar diambil dari `kampung.json` seperti v1.0.

## Data, protokol, API, dan migrasi

Tidak ada. `PROTOKOL_VERSI` tetap 5, dan peta kelas memakai `dunia_kelas` yang sudah ada. `PETA` di manifest tetap berbentuk `{ medan1, medan2, medan4 }` berisi alamat berkas (usulan 1a; Architecture 11.2).

## Aset

| ID | Berkas | Dipakai di | Status |
|---|---|---|---|
| G-01 | `assets/peta/peta_medan_1.png` (160 × 100 px, 1,8 KB) | Peta mini, rasio di bawah 2 | Disetujui 26 Nov 2026 |
| G-02 | `assets/peta/peta_medan_2.png` (320 × 200 px, 4,0 KB) | Peta mini, rasio 2 ke atas | Disetujui 26 Nov 2026 |
| G-03 | `assets/peta/peta_medan_4.png` (640 × 400 px, 9,9 KB) | Peta besar dan peta kelas | Disetujui 26 Nov 2026 |
| — | `ikon_zona_1` sampai `ikon_zona_8`, `ikon_mini_halte`, `ikon_mini_kejadian`, `ikon_mini_selesai`, dan `tanda_diri` | Seperti v1.0 | Disetujui 6 Nov 2026 |

Tidak ada aset baru, dan `CREDITS.md` tidak berubah.

## Keamanan dan privasi

- Gambar medan tidak memuat titik kejadian, penanda, kotak, atau tulisan (PC-1), jadi tidak membuka letak kejadian. Kejadian yang belum terlihat tetap tidak digambar di peta mini dan peta besar, dan peta kelas tetap tanpa letak kejadian.
- Tidak ada data pemain baru, layanan luar, atau CDN; gambar berasal dari aset Worker sendiri (AGENTS 7 butir 4).

## Di luar cakupan

- Lingkaran Teropong, mode "Pilih halte tujuan", serta kotak teropong dan karcis (JS-18 dan PC-2).
- Gambar medan masa pagi dan sore (usulan 4a rencana v1.1), serta perubahan gambar atau sumber peta.
- Perubahan skala peta besar atau ukuran peta mini.
- Garis batas zona (usulan 3a), serta nama zona di peta mini atau peta kelas.
- Bantuan gerak dan daftar "Kejadian terdekat" (JS-24), dan halte tambahan di sisi barat (KT-18 a).

## DRAF untuk ditinjau pemilik proyek

- **D-1. Lebar label zona di peta besar** (P-12). — (a, saran) Lebar luar label paling besar lebar zonanya dikurangi 6 px, dan tidak lebih lebar daripada v1.0; nama yang tidak muat terbungkus. Diukur di salinan percobaan (26 Nov 2026): dengan lebar v1.0, pada skala 2 (HP 640 × 360 dan dunia 610 × 343), label Z1 dan Z3 menjorok 16 dan 20 px ke zona sebelahnya dan menabrak label Z2 dan Z8. Dengan batas zona, tidak ada label yang keluar dari zonanya di keenam ukuran uji. — (b) Lebar tetap seperti v1.0: label lebih pendek, tetapi label Z1 dan Z3 bertumpuk dengan label Z2 dan Z8 di HP kecil.
- **D-2. Peta kelas sebelum gambar medan siap** (P-18). — (a, saran) Latar `mist` polos dengan ikon zona dan titik pemain; gambar 9,9 KB biasanya sudah termuat sejak lobi. — (b) Kotak zona berwarna v1.0 sebagai cadangan: peta tidak pernah polos, tetapi gaya kotak zona tetap harus dipertahankan di `kelas.css`.
- **D-3. Coba ulang bila gambar gagal dimuat** (P-5). — (a, saran) Sekali lagi, paling cepat 10 detik sesudah gagal, saat gambar dibutuhkan lagi, seperti musik JS-21 yang dicoba sekali lagi. — (b) Tanpa coba ulang: cadangan tampil sampai halaman dimuat ulang.

## Kriteria penerimaan

- [ ] AC-1 **Pilihan gambar.** P-2 dan P-3: `pilihMedan` memberi 1 untuk rasio 1, 1,5, dan 1,99, serta 2 untuk rasio 2, 2,625, dan 3; peta besar dan peta kelas memakai gambar 4 px per ubin.
- [ ] AC-2 **Pemuatan.** P-4 dan P-18: HP rasio 2,625 meminta `peta_medan_2` dan `peta_medan_4` masing-masing tepat sekali dan tidak meminta `peta_medan_1`; laptop rasio 1 meminta `peta_medan_1` dan `peta_medan_4`; tombol Masuk tidak menunggu gambar medan; layar kelas meminta `peta_medan_4` sekali di lobi; halaman konsol tanpa layar kelas tidak memintanya.
- [ ] AC-3 **Peta mini bermedan.** P-6 sampai P-8: di HP 731 × 411 rasio 2,625 dan laptop 1280 × 720 rasio 1, piksel peta mini di tengah sel aspal yang dikelilingi aspal berwarna `#6B7A99`; wilayah medan hanya berisi warna palet; halte, penanda kejadian yang sudah terlihat, dan panah diri tampil di atas medan.
- [ ] AC-4 **Kanvas simpanan.** P-7 dan P-10: `ukuranMedanMini` memberi 112 × 70, 168 × 105, 294 × 184, dan 336 × 210 untuk rasio 1, 1,5, 2,625, dan 3; kanvas simpanan dibuat sekali selama rasio tetap (uji unit dengan kanvas tiruan), dan peta mini digambar ulang sekali saat gambar menjadi siap.
- [ ] AC-5 **Cadangan dan coba ulang.** P-5 dan P-9: bila permintaan `peta_medan_*` digagalkan, peta mini dan peta besar menampilkan zona berwarna v1.0 tanpa pesan; uji unit dengan gambar tiruan menunjukkan satu kali coba ulang paling cepat 10 detik sesudah gagal, dan tidak ada coba ulang sesudah gagal kedua.
- [ ] AC-6 **Peta besar bermedan.** P-11 dan P-14: skala sama dengan `skalaPetaBesar` v1.0 di keenam ukuran uji; piksel kanvas di tengah sel aspal berwarna `#6B7A99`; tanpa garis batas zona; medan muncul tanpa menutup peta bila gambar siap sesudah peta dibuka.
- [ ] AC-7 **Label dan lapisan.** P-12 dan P-13: setiap label berpojok kiri atas di (kiri × s + 3, atas × s + 3) dan seluruhnya berada di dalam zonanya di keenam ukuran uji; di HP 640 × 360, label Z1 dan Z3 tidak bertumpuk dengan label Z2 dan Z8; `elementFromPoint` di tengah setiap penanda kejadian dan halte yang bertumpuk dengan label mengembalikan penanda atau halte itu.
- [ ] AC-8 **Peta kelas bermedan.** P-16 dan P-19: peta kelas memuat gambar `peta_medan_4` 160 × 100 satuan dengan `image-rendering: pixelated`, delapan ikon zona di sudut, tanpa kotak zona, tanpa letak kejadian, dan dengan label pembaca layar yang tetap.
- [ ] AC-9 **Titik pemain.** P-17: `letakTitikKelas` memberi pergeseran (x/16 − 1,5, y/16 − 2,25); setiap titik berisi warna tas dengan garis `white` 2 px dan garis `ink` 5 px bertebal tetap; pemain terputus 40%; lebar titik sekitar 9,4, 11,8, dan 17,7 px di 1024 × 768, 1280 × 720, dan 1920 × 1080.
- [ ] AC-10 **Cadangan peta kelas.** P-18: bila `peta_medan_4` digagalkan, peta kelas berlatar `mist` dengan ikon zona dan titik pemain, tanpa galat halaman.
- [ ] AC-11 **Kejadian tetap tersembunyi.** JFR-11 dan JFR-28: peta mini dan peta besar hanya menampilkan kejadian yang sudah terlihat (uji JS-08 dan JS-09 tetap lulus), dan peta kelas tidak memuat penanda kejadian.
- [ ] AC-12 **Perbaikan ESLint.** P-20 dan P-21: ESLint untuk `app/jejak-setara`, `server/jejak-setara`, `e2e/jejak-setara`, dan `scripts/jejak-setara` menghasilkan 0 galat; uji ujung ke ujung kode masuk ulang dan Perbesar QR JS-16b tetap lulus.
- [ ] AC-13 **Ukuran.** Kode layar pemain naik paling banyak 1 KB gzip, kode konsol awal paling banyak 0,2 KB, potongan layar kelas paling banyak 0,5 KB, dan aset layar pemain paling banyak 16 KB; `anggaran.mjs` tetap lulus.
- [ ] AC-14 **Uji lama.** Uji peta mini, peta besar, penanda kejadian, HUD skill, dan layar kelas JS-07 sampai JS-21 tetap lulus tanpa melonggarkan ambangnya.
- [ ] AC-15 **Perintah resmi.** `content:check:jejak`, `test:jejak`, `test:jejak:server`, `build:jejak`, `test:e2e:jejak`, `tsc --noEmit`, dan `build:pages` (178 berkas identik byte) lulus; tidak ada galat konsol atau respons 4xx dan 5xx yang tidak diharapkan, kecuali kegagalan yang sengaja dibuat uji cadangan.
- [ ] AC-16 **Tangkapan layar.** Di `tests/JS-23/`: peta mini di HP 731 × 411 (rasio 2,625), HP 640 × 360 (rasio 3), dan laptop 1280 × 720; peta besar di HP 731 × 411, dunia 610 × 343, 1024 × 768, 1280 × 720, dan 1920 × 1080; peta kelas di 1024 × 768, 1280 × 720, dan 1920 × 1080.
- [ ] AC-17 **Pemeriksaan manual.** Pemilik proyek di lingkungan uji: peta mini dan peta besar di HP sungguhan, serta peta kelas di proyektor dengan titik pemain yang terlihat dari sekitar 8 m (juga dicatat untuk uji coba kelas).
- [ ] AC-18 **Dokumen.** PRD JFR-11, JFR-28, dan 21; Design System 3.3, 3.6, 9, dan 10; serta Architecture 9, 10.9, dan 11.2 sesuai spesifikasi ini (diubah di ZIP Gerbang 2), dan `PLAN.md` diperbarui di Test.

## Rencana uji

### Uji unit (`test:jejak`)

- `__tests__/dunia/medan.test.ts`: `pilihMedan` (AC-1), `ukuranMedanMini` (AC-4), `letakLabelZona` untuk kedelapan zona pada skala 2 sampai 9 (letak, lebar paling besar, dan label di dalam zona; AC-7), serta pemuat gambar dengan gambar tiruan (sekali per halaman, coba ulang sesudah 10 detik, dan berhenti sesudah gagal kedua; AC-5).
- `__tests__/kelas/tampilan-kelas.test.ts`: `letakTitikKelas` (AC-9), dan `ZONA_KELAS` tetap sama dengan `kampung.json`.
- `__tests__/kerangka.test.ts`: teks di tabel spesifikasi ini sama dengan `TEKS` dan `TEKS_KONSOL`, dan `PetaKelas.tsx` mengimpor `peta_medan_4.png` langsung, bukan `manifest.ts` (P-35 JS-10).

### Uji ujung ke ujung (`test:e2e:jejak`)

- `dunia.uji.ts`: gambar yang diminta per rasio (AC-2), piksel aspal di peta mini dan peta besar (AC-3 dan AC-6), letak label dan `elementFromPoint` (AC-7), cadangan dengan permintaan gambar yang digagalkan (AC-5), serta buka dan tutup peta besar seperti v1.0.
- `kelas.uji.ts`: isi peta kelas, gaya titik, permintaan `peta_medan_4` di lobi, dan cadangan `mist` (AC-8 sampai AC-10), serta tangkapan layar.
- Dijalankan dalam kelompok kecil (catatan Test JS-21) dengan `JEJAK_CHROMIUM`.

### Ukuran dan beban

- `build:jejak`, lalu `anggaran.mjs` (AC-13). `sim:beban` tidak wajib, karena protokol, inti ruang, dan kiriman ke D1 tidak berubah (AGENTS 4.4 butir 6).

### Manual (AGENTS 9)

- HP sungguhan di lingkungan uji: peta mini dan peta besar terbaca, dan kejadian baru muncul di peta sesudah terlihat.
- Proyektor: titik pemain terlihat dari sekitar 8 m, dan peta tidak kabur di laptop guru.

## Catatan Build (26 November 2026)

Ditulis Sesi A saat Build. Perilaku dan kriteria di atas tidak berubah.

- **Berkas uji ujung ke ujung.** Uji JS-23 ditulis di berkas baru `e2e/jejak-setara/medan.uji.ts`, bukan dengan mengubah `dunia.uji.ts` dan `kelas.uji.ts` seperti di tabel Berkas dan Rencana uji, sehingga uji lama tetap utuh dan bisa dijalankan sendiri. Isinya sama dengan rencana uji: gambar per rasio, piksel medan, cadangan, label dan lapisan, peta kelas, dan tangkapan layar.
- **Pemeriksaan piksel medan (AC-3 dan AC-6).** Untuk setiap sel yang bloknya dan kedelapan tetangganya satu warna di gambar sumber, piksel peta di tengah sel harus berwarna sama, jauh dari halte dan titik muncul. Jalan aspal selebar 2 ubin tidak pernah punya tetangga yang semuanya aspal, jadi warna aspal `#6B7A99` diperiksa di titik sudut bersama blok 2 × 2 ubin yang seluruhnya aspal.
- **Ikon zona peta kelas** mendapat kelas `js-kelas-ikon-zona` agar bisa dihitung uji. Tampilannya sama dengan v1.0.
- **Lebar label zona (P-12).** Lebar luar label v1.0 adalah 196 px (isi 180 px, jarak dalam 6 px, dan garis 2 px di kedua sisi), jadi `letakLabelZona` memakai batas `LEBAR_LABEL_V10` = 196, dan label kini diukur dengan lebar luar.
- **Pemuat gambar bersama.** `MEDAN` di `pemain/dunia/medan.ts` dipakai bersama peta mini dan peta besar, sehingga satu gambar hanya dimuat sekali per halaman. Peta besar digambar ulang lewat pendengar `dengar` saat `medan4` menjadi siap.
