# F-03 — Skema konten, data enam adegan, pemeriksa konten

| | |
|---|---|
| Status | Disetujui 21 Oktober 2026 (`Spesifikasi disetujui: F-03`) |
| Tanggal | 21 Oktober 2026 |
| Rencana | `docs/sehari-setara/PLAN.md`, entri F-03 (disetujui 21 Oktober 2026) |

## Ringkasan

F-03 menulis naskah enam adegan sebagai data bertipe, menambahkan pemeriksa konten (`content:check`), dan membuat daftar centang verifikasi rujukan yang bisa diisi pemilik proyek tanpa menyunting kode. Naskah belum ditampilkan di layar; halaman yang terbit tidak berubah.

Seluruh naskah ada di bagian "Teks yang tampil (final)". Setiap bagian diberi tanda asal:

| Tanda | Arti |
|---|---|
| **[PRD]** | Sama persis dengan PRD bagian 8 |
| **[PRD, format]** | Kata-kata dari PRD; hanya formatnya yang disesuaikan (dibagi per layar, huruf kapital di awal, titik di akhir, tanda petik “ ”, atau satu baris dipecah dua) |
| **[Pemilik]** | Keputusan pemilik proyek di Gerbang 1 |
| **[Pratinjau]** | Susunan tokoh dari pratinjau adegan yang sudah disetujui (`scripts/game/art/build_assets.py`, `docs/sehari-setara/preview/`) |
| **[DRAF]** | Teks atau susunan baru dari agen. Mohon ditinjau |

## Kaitan PRD

| Acuan | Yang dipenuhi F-03 |
|---|---|
| FR-04 | Enam adegan berurutan sesuai PRD bagian 8, masing-masing dengan tiga pilihan |
| FR-10 | Pilihan B adegan 4 menyetel `komangDibela`; adegan 6 punya varian narasi dan pilihan B |
| FR-11 | Kuis peran di adegan 5 dan tugas keempat peran |
| Architecture bagian 5 | Semua aturan skema, diperiksa `content:check` |
| AGENTS bagian 8 | Aturan konten dan rujukan; verifikasi lewat daftar centang (keputusan Gerbang 1) |

## Perilaku

- Diberikan naskah yang memenuhi semua aturan, ketika `content:check` dijalankan, maka semua uji lulus dan laporan verifikasi rujukan dicetak.
- Diberikan naskah yang melanggar satu aturan skema, ketika `content:check` atau `test` dijalankan, maka uji gagal dengan pesan yang menyebut adegan, pilihan, dan aturannya.
- Diberikan teks pilihan, efek, tingkat, atau situasi di naskah yang berbeda dari PRD bagian 8, ketika uji dijalankan, maka uji gagal. Naskah dan PRD harus selalu sama.
- Diberikan kotak sebuah rujukan dicentang dan teksnya sama dengan naskah, ketika laporan dibuat, maka rujukan itu terverifikasi.
- Diberikan kotak belum dicentang, ketika laporan dibuat, maka rujukan itu belum terverifikasi dengan alasan "belum dicentang".
- Diberikan kotak dicentang tetapi teksnya berbeda dari naskah, ketika laporan dibuat, maka rujukan itu belum terverifikasi dengan alasan "teks di daftar berbeda".
- Diberikan kode rujukan hilang dari daftar atau barisnya rusak, ketika laporan dibuat, maka rujukan itu belum terverifikasi dengan alasan "tidak ada di daftar". Uji biasa tetap lulus, sehingga situs tetap terbit.
- Diberikan perintah dijalankan dengan `RILIS=1` dan masih ada rujukan yang belum terverifikasi, ketika `content:check` dijalankan, maka uji gagal dengan pesan "Rilis diblokir". Mode ini diaktifkan di CI pada F-11.
- Diberikan naskah asli dan reducer F-02, ketika permainan dijalankan dengan semua pilihan B, B-B-B-C-C-C, atau semua pilihan A, maka akhirnya berturut-turut `setara`, `hampir`, dan `berat`.

## Status antarmuka

Tidak ada antarmuka baru. Naskah belum diimpor oleh `Game.tsx`, jadi halaman yang terbit tetap layar kerangka F-01.

## Teks yang tampil (final)

Tanda petik di naskah diketik sebagai “ ”. Teks pilihan tidak diakhiri titik, sama seperti di PRD. "Pemeran" dan "Reaksi" menyebut tokoh, pose, posisi tengah x (0–320 piksel panggung), dan arah hadap.

Ikon emosi pada reaksi semuanya **[DRAF]** dan mengikuti satu aturan: tingkat *tepat* memakai ikon hati, *kurang tepat* ikon keringat, *berisiko* ikon seru. Ikon dipasang di atas tokoh yang paling terdampak.

### Adegan 1 — Pagi di rumah

| Bagian | Isi | Asal |
|---|---|---|
| Pengenal, jam, waktu, latar | `s1`, 06.15, pagi, `bg_s1_rumah_pagi` | [PRD]; waktu dari nama latar |
| Teks alternatif | Dapur dan ruang depan rumah Nara pukul 06.15. Ibu membawa keranjang dan berbicara kepada Nara, sementara Gita berdiri di samping kakaknya. | **[DRAF]** |
| Pemeran | Gita senang (124, kanan), Nara diam (152, kanan), Ibu bicara (206, kiri) | [Pratinjau] |
| Narasi layar 1 | Ibu harus berangkat lebih awal ke pasar. Gita, adik Nara yang kelas 3 SD, belum siap. | [PRD, format] |
| Narasi layar 2 | Ibu meminta Nara mengantar Gita ke sekolahnya yang searah. Nara khawatir terlambat piket kelas. | [PRD, format] |
| Pertanyaan | Apa yang sebaiknya Nara lakukan terhadap permintaan Ibu? | **[DRAF]** |
| Hak yang terdampak | Hak anak atas pengasuhan dan perlindungan. | [PRD, format] |
| Kewajiban terkait | Kewajiban anak menghormati orang tua dan menyayangi keluarga. | [PRD, format] |
| Rujukan | R-01, R-02 | [PRD] |

**Pilihan A** — H −10, K −15, kurang tepat [PRD]
- Teks [PRD, format]: Menolak karena “itu tugas Ibu”, lalu berangkat sendiri
- Yang terjadi **[DRAF]**: Ibu terlambat berangkat ke pasar karena harus mengantar Gita lebih dulu. Gita merasa kakaknya tidak peduli.
- Reaksi **[DRAF]**: Gita sedih (124, kanan), Nara bicara (152, kanan), Ibu sedih (206, kiri); ikon keringat di atas Ibu

**Pilihan B** — H +10, K +15, tepat [PRD]
- Teks [PRD]: Mengantar Gita, lalu memberi tahu ketua kelas akan sedikit terlambat dan mengganti piket saat istirahat
- Yang terjadi **[DRAF]**: Gita tiba di sekolah tepat waktu, dan Ibu bisa berangkat dengan tenang. Ketua kelas mengerti, dan Nara tetap menjalankan piket saat istirahat.
- Reaksi [Pratinjau]: Gita senang (124, kanan), Nara senang (152, kanan), Ibu senang (206, kiri); ikon hati di atas Gita

**Pilihan C** — H −5, K +5, kurang tepat [PRD]
- Teks [PRD]: Mengantar Gita sambil menggerutu dan memarahinya sepanjang jalan
- Yang terjadi **[DRAF]**: Gita sampai di sekolah dengan murung karena dimarahi sepanjang jalan. Nara memang membantu, tetapi tanpa hormat dan kasih sayang.
- Reaksi [Pratinjau]: Gita sedih (124, kanan), Nara bicara (152, kiri), Ibu sedih (206, kiri); ikon keringat di atas Gita

### Adegan 2 — Perjalanan ke sekolah

| Bagian | Isi | Asal |
|---|---|---|
| Pengenal, jam, waktu, latar | `s2`, 06.50, pagi, `bg_s2_jalan_pagi` | [PRD]; waktu dari nama latar |
| Teks alternatif | Tepi jalan dekat sekolah pada pagi hari. Dimas duduk di atas motor tanpa helm dan menawarkan boncengan kepada Nara yang berdiri di bahu jalan. | **[DRAF]** |
| Pemeran | Dimas di atas motor (168, kanan), Nara diam (228, kiri) | [Pratinjau] |
| Narasi | Dimas, teman sekelas, berhenti dengan motor. Ia belum punya SIM dan tidak membawa helm cadangan. Ia menawarkan boncengan agar Nara tidak terlambat. | [PRD] |
| Pertanyaan | Apa yang sebaiknya Nara lakukan terhadap tawaran Dimas? | **[DRAF]** |
| Hak yang terdampak | Hak atas pendidikan dan rasa aman. | [PRD, format] |
| Kewajiban terkait | Kewajiban menaati aturan lalu lintas. | [PRD, format] |
| Rujukan | R-03, R-04, R-05, R-06 | [PRD] |

**Pilihan A** — H −10, K −20, berisiko [PRD]
- Teks [PRD, format]: Ikut tanpa helm karena “cuma dekat”
- Yang terjadi **[DRAF]**: Nara sampai lebih cepat, tetapi berboncengan tanpa helm dengan pengendara yang belum punya SIM membahayakan keselamatan keduanya. Mereka juga melanggar aturan lalu lintas.
- Reaksi [Pratinjau]: Dimas sedih (168, kanan), Nara sedih (228, kiri); ikon seru di atas Nara

**Pilihan B** — H +10, K +15, tepat [PRD]
- Teks [PRD]: Menolak dengan sopan, berjalan cepat atau naik angkot, dan mengingatkan Dimas memakai helm
- Yang terjadi **[DRAF]**: Nara tetap sampai di sekolah dengan aman tanpa melanggar aturan. Dimas jadi berpikir ulang untuk berkendara tanpa helm dan tanpa SIM.
- Reaksi [Pratinjau]: Dimas senang (168, kanan), Nara bicara (228, kiri); ikon hati di atas Dimas

**Pilihan C** — H 0, K −5, kurang tepat [PRD]
- Teks [PRD]: Ikut setelah meminjam helm di warung
- Yang terjadi **[DRAF]**: Nara memakai helm pinjaman, tetapi Dimas tetap berkendara tanpa helm dan tanpa SIM. Bahayanya sedikit berkurang, tetapi aturan lalu lintas masih dilanggar.
- Reaksi [Pratinjau]: Dimas sedih (168, kanan), Nara sedih (228, kiri); ikon keringat di atas Nara

### Adegan 3 — Diskusi kelompok di kelas

| Bagian | Isi | Asal |
|---|---|---|
| Pengenal, jam, waktu, latar | `s3`, 09.00, siang, `bg_s3_kelas_siang` | [PRD]; waktu dari nama latar |
| Teks alternatif | Ruang kelas pukul 09.00. Nara menjelaskan usulannya kepada kelompok, Sinta memotong, dan Bu Ratih mendampingi kelompok lain di meja sebelah kanan. | **[DRAF]** |
| Pemeran | Nara bicara (140, kanan), Sinta bicara (186, kiri), Bu Ratih diam (268, kanan) | [Pratinjau] |
| Narasi | Kelompok merencanakan proyek “Kelas Ramah”. Nara mengusulkan pojok baca, tetapi Sinta memotong dan menyebut ide itu membosankan. Bu Ratih sedang mendampingi kelompok lain. | [PRD, format] |
| Pertanyaan | Apa yang sebaiknya Nara lakukan saat usulannya dipotong? | **[DRAF]** |
| Hak yang terdampak | Kebebasan menyampaikan pendapat. | [PRD, format] |
| Kewajiban terkait | Kewajiban menghormati hak orang lain dalam musyawarah. | [PRD, format] |
| Rujukan | R-07, R-08 | [PRD] |

**Pilihan A** — H −15, K −10, kurang tepat [PRD]
- Teks [PRD]: Membalas dengan mengejek usulan Sinta
- Yang terjadi **[DRAF]**: Diskusi berubah menjadi saling ejek, dan kelompok tidak menghasilkan keputusan. Sinta merasa direndahkan.
- Reaksi **[DRAF]**: Nara bicara (140, kanan), Sinta sedih (186, kiri), Bu Ratih diam (268, kanan); ikon keringat di atas Sinta

**Pilihan B** — H +15, K +10, tepat [PRD]
- Teks [PRD]: Meminta kesempatan menyelesaikan penjelasan, lalu mempersilakan Sinta memaparkan usulannya; kelompok memutuskan dengan alasan
- Yang terjadi **[DRAF]**: Kedua usulan didengar sampai selesai, lalu kelompok memilih berdasarkan alasan yang paling kuat. Semua anggota merasa dihargai.
- Reaksi [Pratinjau]: Nara senang (140, kanan), Sinta senang (186, kiri), Bu Ratih diam (268, kanan); ikon hati di atas Sinta

**Pilihan C** — H 0, K −5, kurang tepat [PRD]
- Teks [PRD]: Diam dan mengalah walau punya alasan kuat
- Yang terjadi **[DRAF]**: Diskusi tampak tenang, tetapi usulan Nara yang beralasan kuat tidak pernah dibahas. Kelompok kehilangan satu pilihan yang baik.
- Reaksi [Pratinjau]: Nara sedih (140, kanan), Sinta bicara (186, kiri), Bu Ratih diam (268, kanan); ikon keringat di atas Nara

### Adegan 4 — Jam istirahat

| Bagian | Isi | Asal |
|---|---|---|
| Pengenal, jam, waktu, latar | `s4`, 10.15, siang, `bg_s4_koridor_siang` | [PRD]; waktu dari nama latar |
| Teks alternatif | Selasar sekolah dekat kantin saat istirahat. Komang memegang sepatunya yang robek, dua siswa menertawakan dan merekamnya dari kejauhan, dan Nara melihat dari dekat kantin. | **[DRAF]** |
| Pemeran | Komang sedih (64, kanan), siswa yang merekam (150, kiri), siswi yang tertawa (184, kiri), Nara diam (236, kiri) | [Pratinjau] |
| Narasi | Komang, adik kelas VII, ditertawakan sekelompok siswa karena sepatunya robek. Salah satu dari mereka merekamnya. | [PRD] |
| Pertanyaan | Apa yang sebaiknya Nara lakukan saat melihat Komang ditertawakan? | **[DRAF]** |
| Hak yang terdampak | Hak anak atas perlindungan dari kekerasan dan diskriminasi. | [PRD, format] |
| Kewajiban terkait | Kewajiban tidak merendahkan orang lain. | [PRD, format] |
| Rujukan | R-01, R-03, R-08 | [PRD] |

**Pilihan A** — H −20, K −10, berisiko [PRD]
- Teks [PRD]: Ikut tertawa agar tidak dianggap aneh
- Yang terjadi **[DRAF]**: Tawa itu membuat Komang makin malu, dan rekaman ejekan terus beredar. Nara ikut merendahkan adik kelasnya.
- Reaksi [Pratinjau]: Komang sedih (64, kanan), siswa yang merekam (150, kiri), siswi yang tertawa (184, kiri), Nara sedih (236, kiri); ikon seru di atas Komang

**Pilihan B** — H +20, K +10, tepat, menyetel `komangDibela` [PRD]
- Teks [PRD]: Mendekati Komang, mengajaknya menjauh, lalu melapor kepada Bu Ratih (guru BK)
- Yang terjadi **[DRAF]**: Komang tidak lagi sendirian, dan Bu Ratih segera menanggapi laporan itu. Siswa yang mengejek dan merekam dipanggil untuk dibina.
- Reaksi [Pratinjau]: Komang senang (112, kanan), Nara senang (146, kiri), Bu Ratih bicara (206, kiri); ikon hati di atas Komang

**Pilihan C** — H −10, K −5, kurang tepat [PRD]
- Teks [PRD]: Pura-pura tidak melihat
- Yang terjadi **[DRAF]**: Ejekan berlanjut karena tidak ada yang menghentikannya. Komang menghadapi rasa malunya sendirian.
- Reaksi [Pratinjau]: sama dengan pilihan A; ikon keringat di atas Komang

### Adegan 5 — Sore di lingkungan rumah

| Bagian | Isi | Asal |
|---|---|---|
| Pengenal, jam, waktu, latar | `s5`, 16.30, sore, `bg_s5_kampung_sore` | [PRD]; waktu dari nama latar |
| Teks alternatif | Jalan kampung di depan warung pada sore hari; di ujung atap warung ada kamera CCTV kecil. Seorang warga menuduh Bayu, pemuda yang baru pindah, sementara Pak Made menunjuk ke depan warung tempat sepedanya diparkir. | **[DRAF]** |
| Pemeran | Bayu diam (40, kanan), warga (106, kiri), Nara diam (202, kanan), Pak Made bicara (256, kanan) | [Pratinjau] |
| Narasi | Sepeda Pak Made hilang dari depan warung. Beberapa warga langsung menuduh Bayu, pemuda yang baru pindah, dan ingin mendatanginya beramai-ramai. Nara ingat warung itu punya kamera CCTV. | [PRD] |
| Pertanyaan | Apa yang sebaiknya Nara lakukan saat warga menuduh Bayu? | **[DRAF]** |
| Hak yang terdampak | Hak atas kepastian hukum yang adil dan perlakuan yang sama di hadapan hukum. | [PRD, format] |
| Kewajiban terkait | Kewajiban menghormati proses hukum. | [PRD, format] |
| Rujukan | R-09, R-03, R-10, R-11, R-12 | [PRD]; R-11 [Pemilik] |
| Kuis peran | Jika perkara ini sampai ke pengadilan, siapa yang memeriksa, mengadili, dan memutusnya? Jawaban: hakim | [PRD] |

**Pilihan A** — H −20, K −15, berisiko [PRD]
- Teks [PRD, format]: Ikut menyebarkan foto Bayu ke grup warga dengan tulisan “pencuri”
- Yang terjadi **[DRAF]**: Foto Bayu tersebar dengan tuduhan yang belum terbukti, dan nama baiknya tercemar. Sepeda Pak Made pun belum ditemukan.
- Reaksi [Pratinjau]: Bayu diam (40, kanan), warga (106, kiri), Nara sedih (202, kanan), Pak Made sedih (256, kanan); ikon seru di atas Bayu

**Pilihan B** — H +15, K +15, tepat [PRD]
- Teks [PRD]: Menyarankan Pak Made melapor kepada Ketua RT dan polisi dengan membawa rekaman CCTV, serta mengingatkan warga agar tidak main hakim sendiri
- Yang terjadi **[DRAF]**: Polisi menerima laporan dan memeriksa rekaman CCTV, yang menunjukkan bahwa bukan Bayu yang mengambil sepeda. Warga batal main hakim sendiri, dan nama baik Bayu terjaga.
- Reaksi [Pratinjau]: Bayu senang (118, kanan), Pak Made senang (170, kiri), Nara senang (218, kiri); ikon hati di atas Bayu

**Pilihan C** — H −5, K −5, kurang tepat [PRD]
- Teks [PRD]: Pulang saja karena merasa bukan urusannya
- Yang terjadi **[DRAF]**: Warga mendatangi Bayu beramai-ramai tanpa bukti, dan tidak ada yang mengingatkan mereka. Masalahnya tidak selesai, dan suasana kampung menjadi tegang.
- Reaksi [Pratinjau]: sama dengan pilihan A; ikon keringat di atas Pak Made

### Adegan 6 — Malam, media sosial

| Bagian | Isi | Asal |
|---|---|---|
| Pengenal, jam, waktu, latar | `s6`, 20.00, malam, `bg_s6_kamar_malam` | [PRD]; waktu dari nama latar |
| Teks alternatif | Kamar Nara pukul 20.00 dengan lampu meja menyala. Nara memegang HP dan membaca pesan di grup kelas. | **[DRAF]** |
| Pemeran | Nara memegang HP (168, kanan) | [Pratinjau] |
| Narasi | Video Komang tadi siang beredar di grup kelas dengan stiker ejekan. Banyak yang membalas dengan tawa. | [PRD] |
| Narasi tambahan bila Komang dibela | Komang mengirim pesan pribadi, “Kak, videonya disebar. Aku malu besok ke sekolah.” | [PRD, format] |
| Narasi tambahan bila tidak | Malam itu Komang tidak membalas pesan siapa pun. | [PRD] |
| Pertanyaan | Apa yang sebaiknya Nara lakukan dengan video itu? | **[DRAF]** |
| Hak yang terdampak | Hak atas rasa aman, kehormatan, dan martabat. | [PRD, format] |
| Kewajiban terkait | Kewajiban menghormati privasi dan tidak merendahkan orang lain. | [PRD, format] |
| Rujukan | R-07, R-03, R-08 | [PRD]; R-08 [Pemilik] |

Reaksi adegan 6 memakai pose Nara memegang HP ditambah ikon emosi untuk sementara [Pemilik], sampai varian pakaian rumah tersedia.

**Pilihan A** — H −20, K −15, berisiko [PRD]
- Teks [PRD, format]: Meneruskan video ke grup lain karena “sudah viral”
- Yang terjadi **[DRAF]**: Video itu menyebar makin jauh, dan makin banyak orang menertawakan Komang. Sekali tersebar, video sulit ditarik kembali.
- Reaksi: Nara memegang HP (168, kanan); ikon seru di atas Nara

**Pilihan B** — H +20, K +15, tepat [PRD]
- Teks [PRD]: Tidak menyebarkan, meminta video dihapus, mendukung Komang, dan melapor kepada wali kelas atau guru BK besok pagi
- Teks bila Komang dibela [PRD, format: titik di akhir dihapus]: Membalas pesan Komang, meminta video dihapus di grup, dan melapor bersama Komang besok pagi
- Yang terjadi **[DRAF]**, berlaku untuk kedua teks: Video dihapus dari grup, dan Komang tahu ada yang membelanya. Keesokan harinya, guru membantu menyelesaikan masalah itu.
- Reaksi: Nara memegang HP (168, kanan); ikon hati di atas Nara

**Pilihan C** — H −5, K 0, kurang tepat [PRD]
- Teks [PRD]: Keluar dari grup tanpa berbuat apa-apa
- Yang terjadi **[DRAF]**: Nara tidak lagi melihat ejekan itu, tetapi video tetap beredar di grup. Komang tetap tidak mendapat bantuan.
- Reaksi: Nara memegang HP (168, kanan); ikon keringat di atas Nara

### Rujukan

Setiap pasal UUD NRI 1945 dicatat sebagai satu rujukan, karena beberapa dipakai di lebih dari satu adegan. Rujukan undang-undang ditulis seperti di PRD atau keputusan pemilik, satu baris per undang-undang. Jumlahnya 12, bukan 14 seperti perkiraan di rencana: Pasal 28J kini satu rujukan untuk adegan 3, 4, dan 6, dan pasal-pasal UU LLAJ tetap satu baris seperti di PRD.

| Kode | Teks | Dipakai di | Asal |
|---|---|---|---|
| R-01 | Pasal 28B ayat (2) UUD NRI 1945 | Adegan 1, 4 | [PRD] |
| R-02 | UU No. 23 Tahun 2002 jo. UU No. 35 Tahun 2014, Pasal 19 | Adegan 1 | [PRD] |
| R-03 | Pasal 28G ayat (1) UUD NRI 1945 | Adegan 2, 4, 5, 6 | [PRD] |
| R-04 | Pasal 31 ayat (1) UUD NRI 1945 | Adegan 2 | [PRD] |
| R-05 | Pasal 27 ayat (1) UUD NRI 1945 | Adegan 2 | [PRD] |
| R-06 | UU No. 22 Tahun 2009 tentang LLAJ, Pasal 77 ayat (1) dan Pasal 106 ayat (8) | Adegan 2 | [PRD] |
| R-07 | Pasal 28E ayat (3) UUD NRI 1945 | Adegan 3, 6 | [PRD] |
| R-08 | Pasal 28J ayat (1) UUD NRI 1945 | Adegan 3, 4, 6 | [PRD]; adegan 6 [Pemilik] |
| R-09 | Pasal 28D ayat (1) UUD NRI 1945 | Adegan 5 | [PRD] |
| R-10 | Pasal 24 UUD NRI 1945 | Adegan 5 | [PRD] |
| R-11 | UU No. 2 Tahun 2002, Pasal 13 dan Pasal 14 ayat (1) huruf g | Adegan 5 | [Pemilik] |
| R-12 | UU No. 48 Tahun 2009, Pasal 8 ayat (1) (asas praduga tak bersalah) | Adegan 5 | [PRD] |

Ketiga pilihan dalam satu adegan memakai rujukan, "Hak yang terdampak", dan "Kewajiban terkait" yang sama, sesuai baris tingkat adegan di PRD.

### Peran (kuis adegan 5)

| Peran | Tugas | Asal |
|---|---|---|
| Polisi | Menerima laporan dan menyidik. | [PRD, format] |
| Jaksa | Menuntut. | [PRD, format] |
| Advokat | Mendampingi. | [PRD, format] |
| Hakim | Memutus. | [PRD, format] |

### Pesan pemeriksa konten

| Keadaan | Pesan |
|---|---|
| Ringkasan | `Verifikasi rujukan: <n> dari 12 terverifikasi.` |
| Daftar yang belum | `- R-01 Pasal 28B ayat (2) UUD NRI 1945 (belum dicentang)` |
| Alasan lain | `(tidak ada di daftar)`, `(teks di daftar berbeda)` |
| Mode rilis gagal | `Rilis diblokir: <n> rujukan belum terverifikasi.` |
| Pelanggaran aturan | Kalimat yang menyebut adegan, pilihan, dan aturannya, misalnya `Adegan s1, narasi layar 1: lebih dari 3 kalimat.` |

## Data dan aksi

### Perubahan tipe (`engine/types.ts`)

- `Reference` menjadi `{ id: string; text: string }`. Status verifikasi tidak lagi disimpan di kode, melainkan di `docs/sehari-setara/Verifikasi_Rujukan.md`.
- `CharId` ditambah `"siswa"` (pose `merekam`, `tertawa`) dan `"warga"` (pose `a`, `b`), sesuai nama berkas `char_{tokoh}_{pose}.png`.
- Tipe baru `RoleInfo { id: RoleId; label: string; tugas: string }`.
- `fixtures.ts` F-02 menyesuaikan bentuk `Reference`. Uji F-02 tetap harus lulus.

### Berkas konten

- `content/references.ts`: kode `R-01` sampai `R-12` dengan teksnya, ditambah fungsi `ref(kode)` yang menghasilkan `Reference`. Kode diketik sebagai tipe gabungan, sehingga salah ketik tertangkap saat kompilasi.
- `content/scenes.ts`: `SCENES`, enam objek `Scene` sesuai bagian naskah di atas.
- `content/roles.ts`: `ROLES`, empat `RoleInfo` dengan urutan polisi, jaksa, advokat, hakim.
- `content/schema.ts`: skema `zod` untuk `Scene`, `Choice`, `CastSlot`, dan `Reference`, aturan lintas-adegan, penghitung kalimat, pembaca daftar centang, dan pembuat laporan verifikasi. Berkas ini hanya diimpor uji, jadi `zod` tidak ikut terbundel.

### Aturan yang diperiksa (`__tests__/content.test.ts`)

Aturan Architecture bagian 5:

1. Tepat enam adegan, `s1` sampai `s6` berurutan, dan jam naik.
2. Setiap adegan punya pilihan A, B, C berurutan, dengan minimal satu pilihan bertingkat `tepat`.
3. Efek kelipatan 5 dalam rentang −20 sampai +20.
4. `impact.rujukan` tidak kosong, dan setiap kode ada di `references.ts` dengan teks yang sama.
5. Setiap layar narasi, termasuk varian, berisi paling banyak 3 kalimat. Kalimat dihitung dari tanda `.`, `!`, atau `?` (boleh diikuti tanda petik penutup) yang diikuti spasi atau akhir teks.
6. Teks pilihan, termasuk varian, paling banyak 140 karakter.
7. Setiap bendera yang dibaca (`textIfFlag`, `narrationIfFlag`) disetel oleh pilihan di adegan sebelumnya.

Aturan tambahan F-03:

8. Berkas `assets/bg/{bg}.png`, setiap `assets/sprites/char_{tokoh}_{pose}.png` di pemeran dan reaksi, dan `assets/ui/emote_{ikon}.png` ada.
9. Tokoh pada ikon emosi ada di susunan reaksinya. Posisi x berada di 0–320.
10. Hanya adegan 5 yang punya kuis, dan jawabannya `hakim`. `ROLES` memuat keempat peran tepat sekali.
11. Kode rujukan unik dan berurutan, dan setiap rujukan dipakai minimal satu adegan.
12. Teks pilihan (termasuk varian adegan 6), efek, tingkat, bendera, situasi, pertanyaan kuis, serta baris hak dan kewajiban sama dengan PRD bagian 8. Perbandingan mengabaikan perbedaan tanda petik lurus dan “ ”, huruf kapital di awal, dan titik di akhir.
13. Naskah asli dimainkan dengan reducer F-02 sampai ketiga akhir tercapai, dan varian adegan 6 aktif bila pilihan B adegan 4 diambil.

Laporan verifikasi:

14. Membaca `docs/sehari-setara/Verifikasi_Rujukan.md` dan mencetak laporan. Uji ini selalu lulus dalam mode biasa.
15. Dengan `RILIS=1`, uji gagal bila masih ada rujukan yang belum terverifikasi.

### Format daftar centang (`docs/sehari-setara/Verifikasi_Rujukan.md`)

Bagian atas file berisi cara memakai dan aturan untuk agen. Setiap rujukan ditulis seperti ini:

```markdown
- [ ] **R-01** Pasal 28B ayat (2) UUD NRI 1945
  - Dipakai di: adegan 1 dan 4
  - Sumber JDIH:
  - Diperiksa oleh dan tanggal:
  - Catatan:
```

- Hanya baris pertama yang dibaca pemeriksa: kotak, kode, dan teks. Baris lain bebas diisi.
- Kotak yang dianggap tercentang adalah `[x]` atau `[X]`; spasi tambahan dan tanda `**` boleh ada atau tidak.
- Teks dibandingkan setelah spasi berlebih dirapikan. Huruf besar-kecil tetap dibedakan.
- Semua kotak dibuat kosong oleh agen. Untuk R-08 dan R-11, baris "Riwayat" mencatat keputusan pemilik tanggal 21 Oktober 2026.

### Skrip dan perubahan dokumen

- `package.json`: skrip `"content:check": "vitest run app/sehari-setara/__tests__/content.test.ts"`. Dependensi tidak berubah. Uji konten juga ikut berjalan di langkah "Uji game" CI, karena berada di pola uji yang sama.
- `docs/sehari-setara/Architecture.md` versi 0.4:
  - bagian 3: `references.ts` dan `Verifikasi_Rujukan.md` masuk struktur folder;
  - bagian 5: `Reference`, `CharId`, dan `RoleInfo` seperti di atas; aturan laporan menjadi "daftar rujukan yang belum dicentang di `Verifikasi_Rujukan.md`; rilis diblokir bila masih ada (pemeriksaan ketat `RILIS=1`)".
- `AGENTS.md` versi 0.4:
  - bagian 8, butir rujukan menjadi: status verifikasi dicatat di `Verifikasi_Rujukan.md`; rujukan baru ditambahkan dengan kotak kosong; agen dilarang mencentang kotak, dan hanya peninjau konten (manusia) yang boleh setelah mencocokkan dengan JDIH; bila teks rujukan berubah, agen mengosongkan kotaknya; agen tidak mengarang nomor pasal; rilis diblokir selama masih ada kotak kosong;
  - bagian 4.2, butir "Dilarang" menyesuaikan.
- `docs/sehari-setara/PRD.md`:
  - bagian 8: baris rujukan adegan 5 dan 6 mengikuti keputusan pemilik;
  - bagian 14: mitigasi "Rujukan pasal keliru" menyebut daftar centang;
  - bagian 17: dua baris keputusan tanggal 21 Oktober 2026 (perubahan rujukan dan cara verifikasi).
- `docs/sehari-setara/Daftar_Aset.md`: catatan bahwa reaksi adegan 6 untuk sementara memakai A-06 ditambah ikon emosi.
- `docs/sehari-setara/PLAN.md`:
  - status F-03 dan baris `content:check` di tabel dependensi;
  - catatan untuk Plan F-11, yaitu mengaktifkan pemeriksaan ketat `RILIS=1` di CI sebelum permainan ditautkan dari galeri.

## Aset

Tidak ada aset baru. Naskah merujuk aset yang sudah Disetujui: enam latar `bg_s1_rumah_pagi` sampai `bg_s6_kamar_malam`, sprite tokoh di `assets/sprites/`, dan empat ikon emosi `emote_hati`, `emote_keringat`, `emote_seru`, `emote_tanya`. Ikon `tanya` belum dipakai. Sprite `char_warga_b` juga belum dipakai, karena pratinjau adegan 5 hanya menampilkan satu warga (paling banyak empat tokoh per adegan).

## Di luar cakupan

- Menampilkan naskah di layar (F-04 sampai F-06), kuis (F-08), layar akhir dan rekap (F-09).
- Teks layar akhir, rekap, dan "pilihan yang paling menjaga keseimbangan" (F-09).
- `manifest.ts` (F-12). F-03 hanya memeriksa bahwa berkas yang dirujuk ada.
- Mencentang daftar verifikasi. Itu hak pemilik proyek.
- Mengaktifkan pemeriksaan ketat `RILIS=1` di CI (F-11).
- Varian pakaian rumah Nara untuk adegan 6 (pertanyaan aset terbuka).

## Kriteria penerimaan

- [ ] AC-1 `scenes.ts` memuat enam adegan dengan setiap teks, angka, posisi, dan pose sama persis dengan bagian "Teks yang tampil (final)".
- [ ] AC-2 Uji membandingkan naskah dengan PRD bagian 8 (aturan 12) dan lulus. Uji ini juga gagal bila satu teks pilihan, efek, atau tingkat sengaja diubah dalam salinan uji.
- [ ] AC-3 Aturan 1–11 lulus untuk naskah asli. Setiap aturan punya minimal satu uji yang membuktikan pelanggarannya tertangkap.
- [ ] AC-4 `references.ts` memuat R-01 sampai R-12 sesuai tabel rujukan. Setiap pilihan merujuk kode adegannya, dan R-08 serta R-11 mengikuti keputusan pemilik.
- [ ] AC-5 `Verifikasi_Rujukan.md` memuat 12 butir dengan kotak kosong, berformat seperti di atas, dan teksnya sama dengan `references.ts`.
- [ ] AC-6 Pembaca daftar centang diuji dengan contoh: `[x]` dengan teks sama menghasilkan terverifikasi; `[ ]`, teks berbeda, kode hilang, dan baris rusak menghasilkan belum terverifikasi dengan alasan yang benar, tanpa membuat uji gagal.
- [ ] AC-7 `npx pnpm@11.25.0 content:check` lulus dan mencetak "Verifikasi rujukan: 0 dari 12 terverifikasi." beserta 12 baris. Dengan `RILIS=1`, perintah yang sama gagal dengan pesan "Rilis diblokir: 12 rujukan belum terverifikasi."
- [ ] AC-8 `ROLES` sesuai tabel peran, dan kuis adegan 5 menjawab `hakim`.
- [ ] AC-9 `Reference` dan `CharId` berubah sesuai spesifikasi, `RoleInfo` ada, dan semua uji F-02 tetap lulus.
- [ ] AC-10 Dengan naskah asli dan reducer F-02, semua pilihan B berakhir `setara`, B-B-B-C-C-C berakhir `hampir`, semua pilihan A berakhir `berat`, dan varian adegan 6 muncul hanya bila pilihan B adegan 4 diambil.
- [ ] AC-11 `npx pnpm@11.25.0 test` lulus untuk semua berkas uji. `install --frozen-lockfile` berhasil, dan di `package.json` hanya bertambah skrip `content:check`.
- [ ] AC-12 `build:pages` lulus, dan halaman yang terbit tidak berubah: HTML dan daftar berkas `assets/` sama dengan hasil F-02. Naskah dan `zod` tidak ikut terbundel. Pemeriksaan browser seperti F-02 lulus.
- [ ] AC-13 `tsc --noEmit` untuk seluruh proyek tanpa galat. ESLint pada file baru dan file kode yang diubah tanpa galat dan tanpa peringatan, dan tidak ada `any`.
- [ ] AC-14 Perubahan dokumen di bagian "Skrip dan perubahan dokumen" ada dan sesuai.

## Rencana uji

| Langkah | Cara | Kriteria |
|---|---|---|
| 1 | `npx pnpm@11.25.0 install --frozen-lockfile`, lalu `npx pnpm@11.25.0 test` | AC-1 sampai AC-6, AC-8 sampai AC-11 |
| 2 | `npx pnpm@11.25.0 content:check`, lalu `RILIS=1 npx pnpm@11.25.0 content:check` (diharapkan gagal) | AC-7 |
| 3 | `npx pnpm@11.25.0 build:pages`, bandingkan dengan hasil F-02, dan cari teks naskah di JS hasil build | AC-12 |
| 4 | Pemeriksaan browser seperti F-02 lewat `serve-subpath.mjs` | AC-12 |
| 5 | `tsc --noEmit -p tsconfig.json --incremental false` dan ESLint pada file baru serta file kode yang diubah | AC-13 |
| 6 | Periksa diff dokumen dan `git diff --stat` terhadap keadaan F-02 | AC-11, AC-14 |
| 7 | Daftar periksa manual AGENTS bagian 9: belum ada butir yang berlaku, karena halaman tidak berubah | — |

Hasil ditulis di `docs/sehari-setara/tests/F-03-hasil.md` (templat 11.3).
