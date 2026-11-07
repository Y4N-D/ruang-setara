# NASKAH — Bank kejadian awal Jejak Setara

Daftar 16 kejadian Paket inti beserta status naskahnya, pemantauan panjang pilihan, set tokoh dan latar titik bank awal, dan pustaka rujukan JR. Teks setiap naskah disalin huruf demi huruf ke `server/jejak-setara/seed/bank-awal.json` (JS-05), dan uji `naskah-cocok` memastikan keduanya tetap sama. Format dan pegangan gaya ada di `STATUS.md` (usulan 1, disetujui 5 November 2026). Setiap giliran menyerahkan dua kejadian (satu zona) untuk dinilai pemilik proyek.

Semua rujukan berstatus **perlu verifikasi**. Tanda "Terverifikasi" hanya diberikan akun Peninjau di pustaka rujukan konsol (JFR-45), dan bank awal disemai dengan semua rujukan berstatus `belum`.

## Kejadian

| Kode | Zona | Judul | Giliran | Status | Berkas |
|---|---|---|---|---|---|
| K-01 | Z1 | Menjaga adik | 2 | Disetujui 5 Nov 2026 | [K-01.md](K-01.md) |
| K-02 | Z1 | Hari suci tetangga | 2 | Disetujui 5 Nov 2026; versi situasi A dipilih 7 Nov 2026 (KT-10) | [K-02.md](K-02.md) |
| K-03 | Z2 | Bekal yang diejek | 3 | Disetujui 5 Nov 2026 | [K-03.md](K-03.md) |
| K-04 | Z2 | Kelas di lantai dua | 3 | Disetujui 5 Nov 2026 | [K-04.md](K-04.md) |
| K-05 | Z3 | Bonceng tanpa helm | 4 | Disetujui 5 Nov 2026 | [K-05.md](K-05.md) |
| K-06 | Z3 | Zebra cross | 4 | Disetujui 5 Nov 2026 | [K-06.md](K-06.md) |
| K-07 | Z4 | Tuduhan di pasar | 5 | Disetujui 5 Nov 2026 | [K-07.md](K-07.md) |
| K-08 | Z4 | Dompet tertinggal | 5 | Disetujui 5 Nov 2026 | [K-08.md](K-08.md) |
| K-09 | Z5 | Rapat lomba | 6 | Disetujui 5 Nov 2026 | [K-09.md](K-09.md) |
| K-10 | Z5 | Logat yang diejek | 6 | Disetujui 5 Nov 2026 | [K-10.md](K-10.md) |
| K-11 | Z6 | Sampah di sungai | 7 | Disetujui 5 Nov 2026 | [K-11.md](K-11.md) |
| K-12 | Z6 | Lapangan untuk semua | 7 | Disetujui 5 Nov 2026 | [K-12.md](K-12.md) |
| K-13 | Z7 | Antrean puskesmas | 1 | Disetujui 5 Nov 2026 | [K-13.md](K-13.md) |
| K-14 | Z7 | Berhenti sekolah? | 1 | Disetujui 5 Nov 2026 | [K-14.md](K-14.md) |
| K-15 | Z8 | Video yang disebar | 8 | Disetujui 5 Nov 2026 | [K-15.md](K-15.md) |
| K-16 | Z8 | Kabar menakutkan | 8 | Disetujui 5 Nov 2026 | [K-16.md](K-16.md) |

## Pemantauan panjang pilihan (KT-B6)

Sasaran: selisih pilihan terpanjang dan terpendek paling banyak 20 karakter di Langkah 1 dan 35 karakter di Langkah 2, dan pilihan benar atau tepat tidak selalu yang terpanjang.

| Kejadian | Selisih Langkah 1 | Pilihan benar terpanjang? | Selisih Langkah 2 | Pilihan tepat terpanjang? |
|---|---|---|---|---|
| K-01 | 8 | Tidak | 5 | Tidak |
| K-02 | 4 | Tidak | 6 | Ya |
| K-03 | 6 | Tidak | 16 | Tidak |
| K-04 | 6 | Tidak | 5 | Ya |
| K-05 | 12 | Tidak | 10 | Tidak |
| K-06 | 7 | Tidak | 5 | Tidak |
| K-07 | 7 | Tidak | 5 | Tidak |
| K-08 | 4 | Tidak | 8 | Tidak |
| K-09 | 13 | Tidak | 6 | Tidak |
| K-10 | 10 | Tidak | 3 | Tidak |
| K-11 | 3 | Tidak | 12 | Tidak |
| K-12 | 7 | Tidak | 9 | Tidak |
| K-13 | 9 | Tidak | 14 | Tidak |
| K-14 | 5 | Tidak | 5 | Ya |
| K-15 | 2 | Tidak | 11 | Tidak |
| K-16 | 7 | Tidak | 12 | Tidak |

Pilihan benar menjadi yang terpanjang di 0 dari 16 kejadian (Langkah 1), dan pilihan tepat di 3 dari 16 kejadian (Langkah 2).

## Tokoh dan properti per kejadian

Diambil dari baris "Set tokoh dan properti" setiap naskah, sebagai masukan bagi Sesi C dan bagi kunci manifest di JS-05. Tokoh yang belum ada di Design System bagian 8 tercakup Permintaan A-1 di `STATUS.md`.

| Kode | Zona | Tokoh | Properti |
|---|---|---|---|
| K-01 | Z1 | Nara, Gita, seorang teman (siswa SMP umum) | pagar bambu rumah Nara |
| K-02 | Z1 | Dimas, Pak Made | pengeras suara |
| K-03 | Z2 | Komang, siswa pengejek (siswa SMP umum), siswa yang memotret (siswa SMP umum) | kotak bekal |
| K-04 | Z2 | Raka (tokoh baru menurut Permintaan A-1), teman sekelas (siswa SMP umum) | tangga ke lantai dua, kursi roda |
| K-05 | Z3 | Dimas | sepeda motor, halte angkot |
| K-06 | Z3 | Nenek bertongkat (warga lansia) | zebra cross, halte angkot, kendaraan yang melintas |
| K-07 | Z4 | Bayu, pedagang, warga (dewasa) | kamera keamanan di tiang, lapak |
| K-08 | Z4 | Nara, seorang teman (siswa SMP umum) | dompet, bangku pasar, pos keamanan pasar |
| K-09 | Z5 | Sinta, anggota panitia (siswa SMP umum) | kertas rencana lomba di bale warga |
| K-10 | Z5 | Peserta yang baru pindah (siswa SMP umum), panitia remaja (siswa SMP umum), penonton (warga umum) | bale warga, meja panitia |
| K-11 | Z6 | Teman-teman (dua siswa SMP umum) | tepi sungai, tempat sampah, sisa piknik |
| K-12 | Z6 | Gita, anak SD (warga umum), teman (siswa SMP umum) | bola, tali lompat, lapangan taman |
| K-13 | Z7 | Ibu menggendong bayi, teman sekelas (siswa SMP umum), petugas puskesmas | bangku antrean |
| K-14 | Z7 | Wayan (tokoh baru menurut Permintaan A-1) | gerobak dagangan |
| K-15 | Z8 | Komang (hanya di dalam video), teman (siswa SMP umum) | HP berisi grup kelas, warung berwifi |
| K-16 | Z8 | Teman (siswa SMP umum) | HP dengan pesan berantai, warung berwifi |

## Set tokoh dan latar titik (bank awal)

Kunci `setTokoh` setiap kejadian di `server/jejak-setara/seed/bank-awal.json` (spesifikasi JS-05, D-1, disetujui 7 November 2026). Kunci adalah nama berkas aset Disetujui tanpa `.png`, paling banyak 4 per kejadian. Bangunan dan objek peta (pagar, halte, zebra cross, lapak, pos keamanan, bale, lapangan, tepi sungai, warung berwifi) tidak masuk set karena sudah menjadi bagian peta JS-06, dan benda yang dipegang tokoh sudah ada di posenya. Siswa umum mengikuti KT-C9a Sesi C: S1–S4 berbaju bebas untuk kejadian di luar sekolah, S5–S6 berseragam untuk Z2 dan K-13. Uji `naskah-cocok` memastikan tabel ini sama dengan bank.

| Kode | Zona | Kunci `setTokoh` | Catatan |
|---|---|---|---|
| K-01 | Z1 | `npc_nara_bawah_diam`, `npc_gita_bawah_diam`, `npc_siswa1_bawah_diam` | Pagar adalah objek peta |
| K-02 | Z1 | `npc_made_bawah_diam`, `npc_dimas_bawah_diam`, `obj_pengeras_suara` | |
| K-03 | Z2 | `npc_komang_bawah_menunduk`, `npc_siswa5_bawah_hp`, `npc_siswa6_bawah_diam` | Kotak bekal ada di pose Komang menunduk |
| K-04 | Z2 | `npc_raka_bawah_kursiroda`, `npc_siswa5_bawah_diam` | Teman berseragam (S5), karena K-04 di sekolah. Kursi roda ada di pose Raka |
| K-05 | Z3 | `npc_dimas_kanan_motor` | Halte adalah objek peta |
| K-06 | Z3 | `npc_nenek_bawah_diam` | Naskah hanya menyebut nenek; "kamu" adalah pemain |
| K-07 | Z4 | `npc_bayu_bawah_diam`, `npc_pedagang_bawah_diam`, `npc_warga1_bawah_menunjuk`, `obj_tiang_kamera` | Lapak adalah objek peta Z4 |
| K-08 | Z4 | `npc_nara_bawah_diam`, `npc_siswa2_bawah_diam`, `obj_dompet`, `obj_bangku_pasar` | Pos keamanan adalah objek peta Z4 |
| K-09 | Z5 | `npc_sinta_bawah_diam`, `npc_siswa4_bawah_diam`, `obj_meja_panitia` | |
| K-10 | Z5 | `npc_siswa2_bawah_menunduk`, `npc_siswa3_bawah_diam`, `npc_warga2_bawah_diam`, `obj_meja_panitia` | Peserta baru (menunduk), panitia remaja, penonton |
| K-11 | Z6 | `npc_siswa3_bawah_diam`, `npc_siswa4_bawah_diam`, `obj_sisa_piknik`, `obj_tempat_sampah` | |
| K-12 | Z6 | `npc_gita_bawah_diam`, `npc_anak1_bawah_diam`, `obj_bola`, `obj_tali_lompat` | Satu anak SD selain Gita |
| K-13 | Z7 | `npc_ibubayi_bawah_diam`, `npc_siswa5_bawah_diam`, `npc_petugas_bawah_diam`, `obj_bangku_antrean` | |
| K-14 | Z7 | `npc_wayan_bawah_diam`, `obj_gerobak` | |
| K-15 | Z8 | `npc_siswa4_bawah_diam` | Pose memegang HP dipakai K-16, agar Z8 tidak memuat tokoh yang sama dua kali |
| K-16 | Z8 | `npc_siswa1_bawah_hp` | Teman yang menunjukkan pesan berantai di HP |

Latar setiap titik kejadian (spesifikasi JS-05, D-2, disetujui 7 November 2026). Penempatan kejadian memilih titik acak dari semua titik zonanya, jadi setiap titik kejadian di sebuah zona harus cocok dengan latar kedua kejadiannya. Tabel ini pegangan Sesi C saat menata titik di JS-06. Kejadian baru dari konsol kelak juga perlu memakai latar yang ada di semua titik zonanya (Permintaan A-8).

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

## Pustaka rujukan

Teks mengikuti usulan 4a: rujukan yang berpadanan R-xx sama persis dengan `app/sehari-setara/content/references.ts`. Nomor JR tetap (usulan 3a).

| JR | Teks rujukan | Dokumen sumber | Padanan Sehari | Dipakai di | Pra-pemeriksaan agen | Status |
|---|---|---|---|---|---|---|
| JR-01 | Pasal 28B ayat (2) UUD NRI 1945 | UUD Perubahan Kedua | R-01 | K-01, K-03 | — | Perlu verifikasi |
| JR-02 | Pasal 28E ayat (1) UUD NRI 1945 | UUD Perubahan Kedua | Baru | K-02 | 5 Nov 2026 (K-02.md) | Perlu verifikasi |
| JR-03 | Pasal 29 ayat (2) UUD NRI 1945 | UUD naskah asli | Baru | K-02 | 5 Nov 2026 (K-02.md) | Perlu verifikasi |
| JR-04 | Pasal 28J ayat (1) UUD NRI 1945 | UUD Perubahan Kedua | R-08 | K-02, K-03, K-04, K-06, K-08, K-09, K-10, K-12, K-13, K-15, K-16 | — | Perlu verifikasi |
| JR-05 | Pasal 28G ayat (1) UUD NRI 1945 | UUD Perubahan Kedua | R-03 | K-03, K-05, K-07, K-15 | — | Perlu verifikasi |
| JR-06 | Pasal 31 ayat (1) UUD NRI 1945 | UUD Perubahan Keempat | R-04 | K-04, K-14 | — | Perlu verifikasi |
| JR-07 | Pasal 28H ayat (2) UUD NRI 1945 | UUD Perubahan Kedua | Baru | K-04 | 5 Nov 2026 (K-04.md) | Perlu verifikasi |
| JR-08 | Pasal 27 ayat (1) UUD NRI 1945 | UUD naskah asli | R-05 | K-05 | — | Perlu verifikasi |
| JR-09 | Pasal 28D ayat (1) UUD NRI 1945 | UUD Perubahan Kedua | R-09 | K-07 | — | Perlu verifikasi |
| JR-10 | Pasal 28H ayat (4) UUD NRI 1945 | UUD Perubahan Kedua | Baru | K-08 | 5 Nov 2026 (K-08.md) | Perlu verifikasi |
| JR-11 | Pasal 28E ayat (3) UUD NRI 1945 | UUD Perubahan Kedua | R-07 | K-09 | — | Perlu verifikasi |
| JR-12 | Pasal 28I ayat (2) UUD NRI 1945 | UUD Perubahan Kedua | Baru | K-10 | 5 Nov 2026 (K-10.md) | Perlu verifikasi |
| JR-13 | Pasal 28H ayat (1) UUD NRI 1945 | UUD Perubahan Kedua | Baru | K-11, K-13 | 5 Nov 2026 (K-13.md) | Perlu verifikasi |
| JR-14 | Pasal 28F UUD NRI 1945 | UUD Perubahan Kedua | Baru | K-16 | 5 Nov 2026 (K-16.md) | Perlu verifikasi |
| JR-15 | Pasal 28J ayat (2) UUD NRI 1945 | UUD Perubahan Kedua | Baru | K-16 | 5 Nov 2026 (K-16.md) | Perlu verifikasi |
| JR-16 | UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 19 | UU 23/2002 dan UU 35/2014 | R-02 | K-01 | — | Perlu verifikasi |
| JR-17 | UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 11 | UU 23/2002 dan UU 35/2014 | Baru | K-12 | 5 Nov 2026 (K-12.md) | Perlu verifikasi |
| JR-18 | UU No. 22 Tahun 2009 tentang LLAJ, Pasal 77 ayat (1) dan Pasal 106 ayat (8) | UU 22/2009 | R-06 | K-05 | — | Perlu verifikasi |
| JR-19 | UU No. 22 Tahun 2009 tentang LLAJ, Pasal 131 ayat (2) | UU 22/2009 | Baru | K-06 | 5 Nov 2026, sumber sekunder (K-06.md) | Perlu verifikasi |
| JR-20 | UU No. 48 Tahun 2009, Pasal 8 ayat (1) (asas praduga tak bersalah) | UU 48/2009 | R-12 | K-07 | — | Perlu verifikasi |
| JR-21 | UU No. 2 Tahun 2002 sebagaimana telah diubah terakhir dengan UU No. 5 Tahun 2026, Pasal 13 dan Pasal 14 ayat (1) huruf g | UU 2/2002 dan UU 5/2026 | R-11 | K-07 | — | Perlu verifikasi |
| JR-22 | UU No. 32 Tahun 2009, Pasal 67 | UU 32/2009 | Baru | K-11 | 5 Nov 2026, sumber sekunder (K-11.md) | Perlu verifikasi |
| JR-23 | Pasal 31 ayat (2) UUD NRI 1945 | UUD Perubahan Keempat | Baru | K-14 | 5 Nov 2026 (K-14.md) | Perlu verifikasi |

### Dokumen sumber

| Dokumen | Tautan |
|---|---|
| UUD Perubahan Kedua | https://peraturan.go.id/files/UUD+1945+Perubahan+Kedua.pdf |
| UUD Perubahan Keempat | https://jdih.setkab.go.id/PUUdoc/16953/UUD1945PerubahanKeempat.pdf |
| UUD naskah asli | https://jdih.kemenkeu.go.id/FullText/1945/UUDTAHUN~1945UUD.HTM |
| UU 23/2002 dan UU 35/2014 | https://peraturan.bpk.go.id/Details/44473/uu-no-23-tahun-2002 · https://peraturan.go.id/files/uu35-2014bt.pdf |
| UU 22/2009 | https://peraturan.bpk.go.id/Details/38654/uu-no-22-tahun-2009 |
| UU 48/2009 | https://peraturan.go.id/files/uu48-2009.pdf |
| UU 2/2002 dan UU 5/2026 | https://peraturan.bpk.go.id/Details/44418/uu-no-2-tahun-2002 · https://peraturan.bpk.go.id/Details/350096/uu-no-5-tahun-2026 |
| UU 32/2009 | https://peraturan.bpk.go.id/Details/38771/uu-no-32-tahun-2009 |
