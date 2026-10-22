# Daftar Aset — Sehari Setara

| | |
|---|---|
| Versi | 0.1 |
| Diperbarui | 22 Oktober 2026 |
| Cara membuat | Digambar dengan kode di `scripts/game/art/` (lihat `Design_System.md` bagian 12) |
| Cara membangun | `python scripts/game/art/build_assets.py` |

Status: **Disetujui** (pratinjau sudah diterima pengembang) · **Ditinjau** (pratinjau sudah dikirim, menunggu keputusan) · **Belum**.

Perbarui tabel ini setiap kali sebuah aset selesai atau berubah status. Ukuran tokoh sudah termasuk margin 1 px untuk garis luar.

## Urutan pengerjaan

1. **Kelompok A — Tokoh:** semua tokoh dengan pose dasarnya, agar gaya seragam sejak awal.
2. **Kelompok B — Latar adegan 2–6.**
3. **Kelompok C — Layar judul dan tiga layar akhir.**
4. **Kelompok D — Antarmuka:** ikon, ikon peran, ikon emosi, timbangan.

## A. Tokoh

| ID | File | Bingkai | Ukuran per bingkai | Keterangan | Adegan | Status |
|---|---|---|---|---|---|---|
| A-01 | `char_nara_idle.png` | 2 | 26×62 | Diam, bernapas | Semua | Disetujui (19 Okt) |
| A-02 | `char_nara_talk.png` | 2 | 26×62 | Bicara | Semua | Disetujui (19 Okt) |
| A-03 | `char_nara_happy.png` | 1 | 26×62 | Senang, tangan terangkat | Semua | Disetujui (19 Okt) |
| A-04 | `char_nara_sad.png` | 1 | 26×62 | Sedih/khawatir | Semua | Disetujui (19 Okt) |
| A-05 | `char_nara_walk.png` | 4 | 26×62 | Berjalan | Transisi | Disetujui (19 Okt) |
| A-06 | `char_nara_phone.png` | 2 | 26×62 | Memegang HP di kamar, tanpa tulisan di layar; pakaian rumah: kaus `teal`, celana `dusk`, tanpa tas | 6 | Disetujui (21 Okt) |
| A-07 | `char_ibu_talk.png` | 2 | 30×68 | Bicara sambil membawa keranjang | 1 | Disetujui (19 Okt) |
| A-08 | `char_ibu_happy.png` | 1 | 30×68 | Senang, melambai | 1 | Disetujui (21 Okt) |
| A-09 | `char_ibu_sad.png` | 1 | 30×68 | Khawatir, tangan di dada | 1 | Disetujui (21 Okt) |
| A-10 | `char_gita_idle.png` | 1 | 24×48 | Diam | 1 | Disetujui (19 Okt) |
| A-11 | `char_gita_happy.png` | 1 | 24×48 | Senang, melambai | 1 | Disetujui (19 Okt) |
| A-12 | `char_gita_sad.png` | 1 | 24×48 | Sedih (dimarahi), tangan bertaut, setetes air mata | 1 | Disetujui (21 Okt) |
| A-13 | `char_dimas_motor.png` | 2 | 56×62 | Duduk di motor matik `mango` (tanpa merek/pelat), tanpa helm, menepuk jok belakang sambil bicara (menawarkan boncengan); jaket `sky-d` | 2 | Disetujui (21 Okt) |
| A-14 | `char_dimas_happy.png` / `_sad.png` | 1+1 | 56×62 | Reaksi di atas motor: jempol / menunduk dengan kedua tangan di stang | 2 | Disetujui (21 Okt) |
| A-15 | `char_sinta_idle.png` / `_talk.png` | 2+2 | 26×62 | Siswi berkerudung putih, kemeja lengan panjang, rok panjang `navy` | 3 | Disetujui (21 Okt) |
| A-16 | `char_sinta_happy.png` / `_sad.png` | 1+1 | 26×62 | Reaksi: tangan bertaut di dada / khawatir | 3 | Disetujui (21 Okt) |
| A-17 | `char_ratih_idle.png` / `_talk.png` | 2+2 | 30×68 | Guru BK, kemeja batik `teal`, kacamata, rambut bob, rok cokelat, memeluk buku; senyum ramah, tangan menjelaskan saat bicara | 3, 4 | Disetujui (21 Okt) |
| A-18 | `char_komang_idle.png` | 2 | 26×62 | Adik kelas VII (2 px lebih pendek), seragam sedikit kebesaran, sepatu depan robek | 4, 6 | Disetujui (21 Okt) |
| A-19 | `char_komang_sad.png` | 2 | 26×62 | Menunduk memegang sepatu robek, kaki berkaus kaki | 4 | Disetujui (21 Okt) |
| A-20 | `char_komang_happy.png` | 1 | 26×62 | Lega: mata terpejam, senyum | 4, 6 | Disetujui (21 Okt) |
| A-21 | `char_siswa_merekam.png` | 2 | 26×62 | Siswa yang merekam dengan HP (layar polos, lampu rekam), tertawa (tanpa kekerasan) | 4 | Disetujui (21 Okt) |
| A-22 | `char_siswa_tertawa.png` | 2 | 26×62 | Siswi yang ikut menertawakan, telapak menutup mulut | 4 | Disetujui (21 Okt) |
| A-23 | `char_made_talk.png` | 2 | 30×68 | Tetangga, kaus `mango`, sarung kotak-kotak `navy`/`sky-d`, rambut dan kumis kelabu; bicara cemas sambil menunjuk ke arah tempat sepedanya diparkir | 5 | Disetujui (21 Okt) |
| A-24 | `char_made_happy.png` / `_sad.png` | 1+1 | 30×68 | Reaksi: lega dengan telapak di dada / menunduk sedih | 5 | Disetujui (21 Okt) |
| A-25 | `char_bayu_idle.png` | 2 | 30×68 | Pemuda yang baru pindah, kaus `mist`, jin `sky-d`, sepatu kets putih; bingung sambil menggaruk kepala; netral dan ramah | 5 | Disetujui (21 Okt) |
| A-26 | `char_bayu_happy.png` | 1 | 30×68 | Lega sambil melambai | 5 | Disetujui (21 Okt) |
| A-27 | `char_warga_a.png` / `char_warga_b.png` | 2+2 | 30×68 | Dua warga yang ikut menuduh tanpa kekerasan: menunjuk sambil bicara keras / bersedekap | 5 | Disetujui (21 Okt) |

## B. Latar adegan (320×180)

| ID | File | Isi wajib | Waktu | Status |
|---|---|---|---|---|
| B-01 | `bg_s1_rumah_pagi.png` | Dapur dan ruang depan, jendela pagi, jam 06.15, gambar anak | Pagi | Disetujui (19 Okt) |
| B-02 | `bg_s2_jalan_pagi.png` | Tepi jalan dekat sekolah, trotoar, rambu tanpa tulisan, angkot di kejauhan. Digambar: trotoar dan kerb hitam-putih, tokoh berdiri di bahu jalan dengan marka tepi di depannya, rambu zona sekolah berpiktogram, angkot di jalan cabang menuju matahari pagi, sekolah berpagar dengan tiang bendera, rumah warga | Pagi | Disetujui (21 Okt) |
| B-03 | `bg_s3_kelas_siang.png` | Ruang kelas, papan tulis kosong, meja kelompok. Digambar: dua meja kelompok di kiri dan kanan, jam 09.00, papan pajangan tanpa tulisan, jendela langit siang dengan cahaya di lantai, tanaman pot di sudut | Siang | Disetujui (21 Okt) |
| B-04 | `bg_s4_koridor_siang.png` | Koridor/kantin sekolah, tanaman, papan pengumuman tanpa tulisan. Digambar: selasar bertiang dengan pemandangan halaman dan langit siang, papan pengumuman berisi kertas warna tanpa tulisan, dua pot tanaman dan dua pot gantung, jendela layan kantin dengan jajanan polos tanpa merek | Siang | Disetujui (21 Okt) |
| B-05 | `bg_s5_kampung_sore.png` | Warung dengan kamera CCTV kecil, pos ronda, langit jingga. Digambar: warung dengan kamera CCTV kecil di ujung atap yang mengarah ke depan warung, pos ronda dengan kentongan, rumah Bayu dengan kardus pindahan, tiang listrik, awan senja | Sore | Disetujui (21 Okt) |
| B-06 | `bg_s6_kamar_malam.png` | Kamar Nara, meja belajar, lampu meja hangat, jendela langit malam. Digambar: ruang hangat dengan panel dan lantai kayu seperti rumah di adegan 1, langit malam hanya di jendela, lampu meja menyala, jam 20.00, tempat tidur, rak buku, gambar buatan Gita; layar HP yang menyala ada pada sprite A-06 | Malam | Disetujui (21 Okt) |

## C. Layar judul dan akhir (320×180)

| ID | File | Isi | Status |
|---|---|---|---|
| C-01 | `bg_title.png` | Jalan kampung pagi, rumah, sekolah di kejauhan, matahari terbit. Digambar: rumah Nara di kiri (dinding dan gorden sama dengan ilustrasi akhir), rumah tetangga di kanan, sawah dan jalan setapak menuju sekolah yang tampak kecil di depan matahari terbit; langit atas tenang untuk judul, jalan kampung kosong untuk tokoh dan tombol | Disetujui (21 Okt) |
| C-02 | `end_setara.png` | Nara duduk di bangku teras malam, bahagia; timbangan seimbang ditampilkan antarmuka (D-10), bukan digambar di ilustrasi. Digambar: malam cerah, bulan bercahaya, banyak bintang, kunang-kunang, bunga mekar; Nara tersenyum menggenggam teh hangat | Disetujui (21 Okt) |
| C-03 | `end_hampir.png` | Nara duduk merenung; timbangan sedikit miring ditampilkan antarmuka (D-10). Digambar: sebagian langit berawan, bulan setengah tertutup; Nara bertopang dagu | Disetujui (21 Okt) |
| C-04 | `end_berat.png` | Nara duduk termenung tetapi berharap; timbangan miring ditampilkan antarmuka (D-10). Digambar: lebih banyak awan tetapi ada bintang jatuh; Nara menatap ke atas dengan mata berbinar dan senyum kecil, rumah tetap hangat | Disetujui (21 Okt) |

## D. Antarmuka

| ID | File | Ukuran | Isi | Status |
|---|---|---|---|---|
| D-01 | `ui_hak.png` | 16×16 | Perisai-hati (indikator Hak orang lain terjaga): perisai `teal`, hati putih | Disetujui (21 Okt) |
| D-02 | `ui_kewajiban.png` | 16×16 | Tangan-centang (indikator Kewajiban dijalankan): telapak terbuka `sky-d`, centang putih | Disetujui (21 Okt) |
| D-03 | `ui_star.png` | 3 × 16×16 | Bintang alasan bersudut lima; strip animasi pop sesuai `Design_System.md` bagian 7: kecil, besar berkilau, normal | Disetujui (21 Okt) |
| D-04 | `ui_clock.png` | 16×16 | Pengatur waktu: stopwatch dengan jarum, tanpa angka | Disetujui (21 Okt) |
| D-05 | `ui_sound_on.png` / `ui_sound_off.png` | 16×16 | Suara: pengeras suara dengan gelombang / dengan tanda silang `coral` | Disetujui (21 Okt) |
| D-06 | `ui_fullscreen.png` | 16×16 | Layar penuh: empat sudut siku | Disetujui (21 Okt) |
| D-07 | `ui_team_lingkaran/segitiga/persegi/bintang.png` | 16×16 | Bentuk tim berwarna tim: lingkaran `mango`, segitiga `sky-d`, persegi `leaf`, bintang bersudut empat `sun` (Tim Mentari, agar beda dari bintang alasan) | Disetujui (21 Okt) |
| D-08 | `role_polisi/jaksa/advokat/hakim.png` | 32×32 | Ikon peran penegak hukum: potret setengah badan dalam lencana bundar, tanpa lambang instansi. Polisi berseragam dan bertopi cokelat dengan buku laporan; jaksa bertoga hitam, simare hitam, bef putih, dengan berkas tuntutan; advokat bertoga sama dengan tas kerja; hakim bertoga bersimare merah dan berpeci dengan palu sidang | Disetujui (21 Okt) |
| D-09 | `emote_hati/keringat/tanya/seru.png` | 8×8 | Ikon emosi di atas kepala: hati `coral`, tetes `sky`, tanda tanya putih, tanda seru `sun`, semuanya bergaris luar | Disetujui (21 Okt) |
| D-10 | `ui_timbangan.png` | 5 × 48×32 | Strip: miring kiri, sedikit kiri, seimbang, sedikit kanan, miring kanan (kemiringan 22°, 10°, 0°). Piring kiri Hak (hati `teal`), piring kanan Kewajiban (centang `sky-d`) | Disetujui (21 Okt) |
| D-11 | `ui_matahari.png` / `ui_bulan.png` | 16×16 | Penanda titik jam berjalan di busur hari (F-04): matahari `sun` dengan bayangan `mango`, kilau putih, dan delapan sinar untuk adegan pagi sampai sore; bulan sabit `cream` dengan lengkung dalam `lampu` untuk adegan malam; keduanya bergaris luar `ink` | Disetujui (22 Okt) |

## Catatan

- 21 Okt 2026: semua aset kelompok A–D disetujui pengembang (YAN). Atribusi setiap aset ada di `app/sehari-setara/assets/CREDITS.md`.
- Total ukuran aset saat ini: sekitar 61,4 KB dari anggaran 4 MB.
- Warna kulit tokoh (usulan Batch A2, dipakai mulai A3): `skin-4` juga untuk tokoh yang membantu (Bu Ratih); dua siswa di adegan 4 memakai `skin-3` dan `skin-1`, Komang `skin-2`, agar tidak ada kesan perundungan karena warna kulit. Di adegan 5, Bayu memakai `skin-2` seperti Nara, dua warga `skin-3` dan `skin-1`, Pak Made `skin-4`.
- Temuan Batch A1 (20 Okt): pada semua pose Ibu (A-07, A-08, A-09) sisi kanan keranjang menyentuh tepi kanvas, dan pada A-07/A-08 puncak sanggul juga, sehingga garis luar di bagian itu tidak tergambar. Usulan perbaikan menunggu persetujuan karena A-07 sudah Disetujui.
- Posisi tokoh pada pratinjau Batch B1 (usulan untuk `cast`): adegan 2 — Dimas x 168 menghadap kanan, Nara x 228 menghadap kiri; adegan 3 — Nara x 140 menghadap kanan, Sinta x 186 menghadap kiri, Bu Ratih x 268 menghadap kanan (sedang mendampingi kelompok lain). Tiang bendera dan tanaman ditata agar tidak tampak menancap di kepala tokoh pada posisi ini.
- Posisi tokoh pada pratinjau Batch B2 (usulan, paling banyak 4 tokoh): adegan 4 — Komang x 64 menghadap kanan, dua siswa x 150 dan 184, Nara x 236, ketiganya menghadap kiri; reaksi tepat: Komang 112, Nara 146, Bu Ratih 206. Adegan 5 — Bayu x 40 menghadap kanan, warga A x 106 menghadap kiri, Nara x 202 dan Pak Made x 256 menghadap kanan; reaksi tepat: Bayu 118, Pak Made 170, Nara 218. Adegan 6 — Nara x 168 menghadap kanan. Tiang listrik adegan 5 (x 87) sengaja berada di sela posisi ini.
- Perbaikan B-02 (20 Okt, Batch B2): atap rumah dan gedung sekolah semula berbentuk trapesium terbalik (lebih lebar di atas); kini lebih lebar di bagian bawah. Perubahan hanya di y 60–73.
- Pertanyaan terbuka: reaksi Nara di adegan 6 (dan mungkin adegan 5 pukul 16.30) hanya tersedia dalam seragam (A-01 s.d. A-04), sedangkan A-06 memakai pakaian rumah. Usulan: varian pakaian rumah untuk pose senang dan sedih (dan bila perlu diam/bicara).
- 21 Okt 2026 (F-03): untuk sementara, reaksi Nara di adegan 6 memakai A-06 (memegang HP) ditambah ikon emosi, sampai varian pakaian rumah tersedia (keputusan pemilik proyek).
- Keputusan 20 Okt untuk kelompok C: (1) ilustrasi akhir tidak memuat timbangan; timbangan D-10 dianimasikan antarmuka sesuai `Design_System.md` bagian 7–8, dan ilustrasi menyisakan bidang langit yang tenang untuknya; (2) Nara digambar duduk di bangku teras. Kelompok B2 dikerjakan sebelum C.
- Bidang antarmuka (Batch C, konstanta di `latar.py`): judul di `bg_title` memakai `TITLE_ZONE` x 64–256, y 6–56; timbangan D-10 di ilustrasi akhir memakai `END_SCALE_ZONE` x 220–292, y 8–56. Kedua bidang hanya berisi warna langit polos; `build_assets.py` memeriksanya otomatis (`CALM_ZONES`). Nara pada ilustrasi akhir berada di x 84–116, bangku x 66–140.
- Pose duduk Nara (Batch C) hanya dipakai di ilustrasi akhir, bukan strip sprite tersendiri. Pakaiannya mengikuti `NARA_RUMAH` (sama dengan A-06), jadi bila warna pakaian rumah diubah, ilustrasi akhir ikut berubah saat dibangun ulang.
- Keputusan 21 Okt untuk kelompok D: (1) D-10 menjadi 5 bingkai agar akhir "Hampir Seimbang" punya posisi "sedikit miring"; bingkai antara juga dipakai untuk gerak timbangan menuju posisi akhir; (2) bentuk Tim Mentari memakai bintang bersudut empat, bintang alasan tetap bersudut lima; (3) ikon peran berupa potret tokoh dengan alat perannya.
- Pakaian sidang pada D-08 mengikuti PP 27/1983 Pasal 4 (hakim, penuntut umum, dan penasihat hukum bertoga hitam berlengan lebar dengan simare dan bef; perbedaannya pada ukuran dan warna simare dan bef). Warna simare merah untuk hakim pengadilan negeri/tinggi dan hitam untuk jaksa dan advokat diambil dari hukumonline.com; perlu dicek peninjau konten.
- Ikon antarmuka digambar di file kit `scripts/game/art/ikon.py`. File ini sudah dicatat di `Design_System.md` bagian 12 dan `Architecture.md` bagian 3 dan 8 (F-12, 21 Okt 2026).
- Efek suara (P1) tidak dibuat dengan kit gambar; lihat `Design_System.md` bagian 9.
