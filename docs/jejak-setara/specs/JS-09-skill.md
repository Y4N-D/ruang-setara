# JS-09 — Skill dan kotak bantuan

| | |
|---|---|
| Status | Disetujui 21 November 2026 (`Spesifikasi disetujui: JS-09`, dibaca sebagai D-1 a, D-2 a, D-3 a). Dibangun dan diuji 21 November 2026; laporan [JS-09-hasil.md](../tests/JS-09-hasil.md). Penyesuaian saat Build ada di bagian "Catatan Build" |
| Rencana | `PLAN.md`, entri JS-09 (Plan 20 November 2026; disetujui dengan `Setuju: JS-09 (usulan 1a sampai 16a)`) |
| Sesi | Sesi A (mesin) |
| Bergantung pada | JS-08 (Selesai, 13 November 2026); memakai juga JS-10, JS-11, dan JS-12 (semuanya Selesai) |

## Ringkasan

JS-09 menghidupkan tiga skill P0 yang aturannya sudah ada di `inti/aturan.ts` sejak JS-02: Lari cepat, Kompas kejadian, dan Petunjuk. Siswa mengisi muatan skill dengan berjalan melewati 24 kotak bantuan di delapan zona, dan setiap jawaban "tepat" di Langkah 2 menambah satu muatan Kompas. Setiap skill paling banyak bermuatan 2, dan ronde dimulai dengan muatan 0.

Server ruang tetap berwenang atas semuanya. Server mendeteksi kotak yang dilewati dari laporan gerak, memeriksa kecepatan lari, memilih sasaran Kompas, dan memilih pilihan keliru yang dicoret Petunjuk dengan pembangkit berbenih. Keadaan skill disimpan di dua tabel baru penyimpanan ruang dan tetap utuh saat pemain menyambung ulang, saat ronde dijeda, dan saat Durable Object dibangunkan ulang. Protokol tidak berubah (`PROTOKOL_VERSI` tetap 2), karena semua pesan yang dibutuhkan sudah ada di skema JS-02.

Di layar pemain, tombol skill tampil dalam lengkung di sekitar tombol Periksa di perangkat sentuh, dan dalam kolom bertanda tombol `1`, `2`, dan `3` di laptop. Kotak bantuan, panah Kompas, debu lari, kilau kotak, pita pemberitahuan, kotak petunjuk, dan pilihan yang dicoret memakai sembilan aset yang sudah Disetujui. Pratinjau penyunting kejadian ikut menampilkan Petunjuk.

Di konsol, guru memilih skill yang aktif saat membuat ruang (JFR-26). Detail ruang dan ringkasan hasil menulis skill yang aktif, rincian jawaban menandai Petunjuk yang dipakai, dan CSV jawaban mendapat kolom "Petunjuk dipakai" di ujung kanan. Dua perbaikan kecil dari Build JS-11 ikut dikerjakan: tautan di kartu dasbor menjadi setinggi 48 px, dan uji ujung ke ujung menutup ruang yang dibuatnya.

## Kaitan PRD

| Kebutuhan | Dipenuhi oleh |
|---|---|
| JFR-23 Kotak bantuan di setiap zona, diambil dengan melewatinya, milik setiap pemain, muncul lagi 90 detik sesudah diambil | P-3, P-16 sampai P-18 |
| JFR-24 Lari cepat, Kompas kejadian, dan Petunjuk; paling banyak 2 muatan per skill; +1 muatan Kompas untuk jawaban "tepat" di Langkah 2 | P-2, P-4, P-5, P-19 sampai P-32 |
| JFR-26 Guru dapat mematikan skill tertentu untuk satu ruang | P-7 sampai P-10 |
| PRD 8.4 Petunjuk tidak mengurangi skor; batasnya jumlah muatan | P-31 |
| PRD 8.5 Efek, sumber, muatan, jeda 2 detik, dan larangan memakai skill selama dialog kecuali Petunjuk | P-1, P-2, P-15 sampai P-32 |
| PRD 12 dan 13 (kinerja, privasi) | P-51, bagian "Keamanan dan privasi" |
| Architecture 5.3 (status Durable Object), 6.3 (`pakai_skill`, `pribadi`, `kompas`, `petunjuk`, `pemberitahuan`), 8.2 (kecepatan Lari cepat), dan 8.5 (skill dan kotak) | P-11 sampai P-28, P-42 |
| Design System 3.3, 3.4, 3.5, 9, 10, 11, dan 13 | P-18, P-22, P-26, P-27, P-29, P-33 sampai P-41 |
| Catatan Plan JS-09 dari JS-08 (dua titik aktif di ruang lebih dari 50 pemain) dan dari Specify JS-11 (kolom CSV di ujung kanan) | P-24, P-47 |
| Catatan "Plan berikutnya yang menyentuh dasbor atau uji" dari Build JS-11 | P-48, P-49 |
| `PLAN.md` usulan 1a sampai 16a | Seluruh dokumen |

## Berkas yang dibuat dan diubah

| Berkas | Baru/ubah | Isi |
|---|---|---|
| `app/jejak-setara/inti/aturan.ts` | Ubah | `SKILL_P0`, `SKILL_KOTAK`, `TOLERANSI_LARI_MS`, `lariBerlaku`, `jarakRuas`, `kotakDilewati`, `sasaranKompas`, dan `kompasTiba`; syarat skill yang sedang aktif di `bolehPakaiSkill` (P-1 sampai P-5) |
| `app/jejak-setara/inti/ruang.ts` | Ubah | `skillAktif` di `skemaRuangBaru` dan `skemaRingkasanRuang` (P-8, P-9) |
| `app/jejak-setara/inti/hasil.ts` | Ubah | `petunjukDipakai` di `skemaJawabanRincian` (P-46) |
| `server/jejak-setara/src/ruang/skill-ruang.ts` | Baru | Aturan skill ruang yang murni: keadaan per pemain, kotak dari ruas gerak, pakai skill, sasaran dan tiba Kompas, pilihan yang dicoret, waktu ronde ke jam server, dan isi baris `skill` (P-6, P-11 sampai P-32) |
| `server/jejak-setara/src/ruang/inti-ruang.ts` | Ubah | `pakai_skill`, kotak pada `gerak`, lari di `periksaGerak`, tiba Kompas di putaran 100 ms, `pribadi` berisi skill, +1 Kompas, Petunjuk saat dialog dibuka ulang, dan pemulihan |
| `server/jejak-setara/src/ruang/kejadian-ruang.ts` | Ubah | `petunjukDipakai` di baris jawaban D1 dan pesan `petunjuk` (P-28, P-45) |
| `server/jejak-setara/src/ruang/RuangJejak.ts` | Ubah | Tabel `skill` dan `petunjuk`, penulisan, dan pemulihan (P-14) |
| `server/jejak-setara/src/ruang/peta-kampung.ts` | Ubah | `KOTAK_KAMPUNG` dari `kampung.json` (P-16) |
| `server/jejak-setara/src/api/ruang.ts` | Ubah | `skillAktif` dari permintaan dan di ringkasan ruang; `petunjukDipakai` di rincian (P-8, P-9, P-46) |
| `server/jejak-setara/src/db/ruang.ts` | Ubah | `petunjuk_dipakai` di kueri jawaban hasil (P-45) |
| `server/jejak-setara/src/ekspor/csv.ts` | Ubah | Kolom ke-18 CSV jawaban dan `petunjukDipakai` di rincian (P-46, P-47) |
| `app/jejak-setara/pemain/dunia/skill.ts` | Baru | Keadaan skill layar pemain yang murni: waktu efektif, status tombol, kotak yang tampil, panah Kompas, lari pemain lain, dan pita D-2 (P-18, P-20, P-23, P-26, P-36, P-37) |
| `app/jejak-setara/pemain/TombolSkill.tsx` | Baru | Tombol skill di HUD (P-33 sampai P-36, P-39) |
| `app/jejak-setara/pemain/App.tsx` | Ubah | Pesan skill, `pakai_skill`, pita, pengumuman, dan Petunjuk di dialog |
| `app/jejak-setara/pemain/LayarDunia.tsx` | Ubah | Tombol skill, antrean pita, tombol `1` sampai `3`, dan atribut data kanvas untuk uji |
| `app/jejak-setara/pemain/LayarPratinjau.tsx`, `pemain/pratinjau.ts` | Ubah | Petunjuk di pratinjau penyunting (P-44) |
| `app/jejak-setara/pemain/dunia/mesin.ts`, `gerakDiri.ts`, `pemainLain.ts`, `penggambar.ts`, `petaKampung.ts`, `aset.ts` | Ubah | Lari, kotak, panah, debu, dan kilau di dunia (P-18 sampai P-26) |
| `app/jejak-setara/bersama/dialogKeadaan.ts`, `DialogKejadian.tsx`, `TombolPilihan.tsx`, `KartuDampak.tsx` | Ubah | Petunjuk di dialog dan +1 Kompas di kartu dampak (P-27 sampai P-32) |
| `app/jejak-setara/teks.ts`, `teks-konsol.ts` | Ubah | Teks bagian "Teks yang tampil (final)" |
| `app/jejak-setara/styles/jejak.css` | Ubah | Tombol skill, lencana muatan, pita, kotak petunjuk, coretan, dan +1 Kompas (layar pemain) |
| `app/jejak-setara/admin/halaman/Ruang.tsx`, `DetailRuang.tsx`, `HasilRuang.tsx`, `admin/kelas/ikon-kelas.ts` | Ubah | Pilihan skill, baris "Skill", dan tanda Petunjuk (P-7, P-9, P-46) |
| `app/jejak-setara/styles/kelas.css` | Ubah | Gaya konsol baru dan tautan kartu dasbor 48 px (P-48) |
| `scripts/jejak-setara/simulasi-beban.mjs` | Ubah | Bot yang mengambil kotak dan memakai skill (P-50) |
| `e2e/jejak-setara/ruang-uji.ts` dan berkas uji ujung ke ujung yang membuat ruang | Ubah | Penutupan ruang di akhir uji (P-49) |
| Uji | Baru dan ubah | Bagian "Rencana uji" |
| `docs/jejak-setara/Architecture.md`, `Design_System.md`, `PRD.md`, `PLAN.md`, `tests/JS-09-hasil.md`, `tests/JS-09/` | Ubah dan baru | Architecture 5.3, 6.3, 8.2, dan 8.5; Design System 3.3, 3.4, 9, 10, 11, dan 13; PRD 21; laporan uji dan tangkapan layar |

Tidak disentuh: `package.json` dan lockfile (tanpa dependensi baru), alur kerja, `server/jejak-setara/wrangler.jsonc`, migrasi D1, skema pesan `inti/protokol.ts` (`PROTOKOL_VERSI` tetap 2), kode dan dokumen Sehari Setara, galeri, `deploy-pages.yml`, berkas Sesi B (`naskah/`, `inti/konten/`, `seed/`, `semai.mjs`), dan berkas Sesi C (termasuk `kampung.json` dan aset).

## Perilaku

### Aturan bersama di `inti/` (usulan 1a, 3a, 4a, dan 5a)

- **P-1. Skill P0 dan isi kotak.** `SKILL_P0 = ["lari", "kompas", "petunjuk"]` pindah ke `inti/aturan.ts` (menggantikan konstanta lokal `SKILL_P0` di `api/ruang.ts`), dan urutannya menjadi urutan tampil di semua tempat: HUD, dialog Ruang baru, detail ruang, dan hasil. `SKILL_KOTAK` memetakan jenis kotak ke skill: sepatu ke `lari`, kompas ke `kompas`, buku ke `petunjuk`, teropong ke `teropong`, dan karcis ke `angkot`. Kotak teropong dan karcis belum ada di `kampung.json` (JS-18).

- **P-2. Syarat memakai skill.** `bolehPakaiSkill` JS-02 tetap berlaku: skill aktif di ruang, muatannya ada, jeda 2 detik sejak pemakaian skill yang sama sudah lewat, Petunjuk hanya di Langkah 1 dialog, dan skill lain hanya saat tidak ada dialog. Sesuai D-1a, ditambah satu syarat: skill berdurasi (Lari cepat dan Kompas) tidak bisa dipakai lagi selama masih aktif (`aktifSampaiMs[skill] > now`). `pakaiSkill` dan `tambahMuatanKompas` tidak berubah. Satuan `now` mengikuti pemanggilnya: server memakai waktu ronde (P-11), dan layar pemain memakai waktu efektif (P-20).

- **P-3. Kotak yang dilewati.** `jarakRuas(a, b, p)` mengembalikan jarak terdekat dari titik `p` ke ruas lurus `a` ke `b` dalam piksel logis; ruas sepanjang 0 diperlakukan sebagai titik `a`. `kotakDilewati(dari, ke, kotak)` benar bila `jarakRuas(dari, ke, pusat)` paling besar `KOTAK.jangkauanPx` (12), dengan `pusat` = pusat ubin kotak (16x + 8, 16y + 8) dan `dari` serta `ke` berupa titik kaki pemain.

- **P-4. Toleransi akhir Lari cepat.** `TOLERANSI_LARI_MS = 500`. `lariBerlaku(aktifSampai, now)` benar bila `aktifSampai` ada dan `now ≤ aktifSampai + 500`.

- **P-5. Sasaran dan tiba Kompas.** `sasaranKompas(pos, daftar)` menerima kejadian berbentuk `{ kode, selesai, titik: { id, x, y }[] }` dan mengembalikan `{ kode, titikId, x, y }` untuk titik dengan jarak lurus terkecil dari `pos` ke pusat titik (16x + 8, 16y + 8), di antara semua titik kejadian yang `selesai`-nya salah; seri diputus dengan kode kejadian terkecil, lalu id titik terkecil. Hasilnya `null` bila tidak ada kejadian yang belum selesai. Fungsi ini memakai `kejadianTerdekat` JS-02 atas daftar titik yang diurutkan menurut kode lalu id. `kompasTiba(pos, titik)` benar bila jarak `pos` ke pusat titik paling besar `JANGKAUAN_PERIKSA_PX` (32).

- **P-6. Pilihan yang dicoret Petunjuk.** Server ruang (`skill-ruang.ts`, bukan `inti/`, karena memakai benih ruang) memilih satu dari tiga pilihan keliru Langkah 1 menurut urutan asli isi kejadian: indeks `floor(acak() × 3)` dari `acakBerbenih(benih(benihRuang, pemainId, kode, "petunjuk"))` (Architecture 8.5). Pilihan yang benar tidak pernah dicoret. Hasilnya selalu sama untuk pemain dan kejadian yang sama di ruang yang sama, dan pemain lain bisa mendapat pilihan dicoret yang berbeda.

### Skill per ruang (usulan 11a)

- **P-7. Pilihan di dialog Ruang baru.** Dialog Ruang baru (JS-10) mendapat kelompok `fieldset` berjudul "Skill" sesudah baris berisi "Batas pemain" dan "Batas bergabung terlambat", sebelum kotak centang "Minta nomor absen". Isinya tiga kotak centang `.js-konsol-centang` menurut urutan P-1, masing-masing dengan ikon skill 16 × 16 (skala 1; `ikon_lari`, `ikon_kompas`, dan `ikon_petunjuk` diimpor langsung lewat `admin/kelas/ikon-kelas.ts`, bukan lewat manifest) dan nama skill, lalu keterangan "Hapus centang untuk mematikan skill di ruang ini.". Kotak centang tersusun dalam satu baris yang membungkus ke baris berikutnya bila tidak muat, dan setiap target setinggi sedikitnya 48 px. Ketiganya tercentang setiap kali dialog dibuka. Ruang boleh dibuat tanpa skill satu pun, dan kelompok ini tidak punya pesan galat. Formulir mengirim `skillAktif` berisi skill yang dicentang menurut urutan P-1.

- **P-8. API membuat ruang.** `POST /api/ruang` menerima `skillAktif` opsional: larik tanpa duplikat dari `"lari"`, `"kompas"`, dan `"petunjuk"`, paling banyak 3 butir. Nilai lain (termasuk `"teropong"` dan `"angkot"`), duplikat, atau isian yang bukan larik dijawab 400 `ISI_SALAH`, dan ruang tidak dibuat. Permintaan tanpa `skillAktif` memakai ketiga skill, sehingga pembantu uji dan `sim:beban` yang ada tetap berjalan. Server menyimpan `skillAktif` menurut urutan P-1 di `ruang.pengaturan_json` dan di data ruang Durable Object; nilainya tetap selama ruang hidup. `selamat_datang` sudah membawa `pengaturan.skillAktif` sejak JS-02.

- **P-9. Skill yang aktif di konsol.** `skemaRingkasanRuang` mendapat `skillAktif` (larik skill P0), dibaca dari `pengaturan_json`: butir yang bukan skill P0 dibuang, dan pengaturan yang tidak terbaca menghasilkan ketiga skill. Kepala halaman ruang (`#/ruang/{id}`) mendapat baris "Skill" sesudah kode ruang (dan sesudah baris "Buka di HP" bila baris itu tampil), berisi nama skill yang aktif dipisah koma menurut urutan P-1 (misalnya "Lari cepat, Kompas kejadian, Petunjuk"), atau "Tidak ada". Ringkasan hasil (JS-11 P-22) mendapat baris "Skill" dengan isi yang sama sesudah baris "Durasi". Baris itu tidak dicetak, sehingga cetakan JS-11 (P-31) tidak berubah.

- **P-10. Skill yang dimatikan.** Untuk skill yang tidak ada di `skillAktif`: tombolnya tidak tampil di HUD (P-33), tombol Petunjuk tidak tampil di dialog (P-27), kotaknya tidak digambar dan tidak bisa diambil (P-16, P-18), `pakai_skill` untuk skill itu diabaikan (P-15), dan Kompas tidak mendapat +1 dari jawaban "tepat" (P-32). Ruang tanpa skill sama sekali bermain seperti sebelum JS-09: `pribadi` berisi muatan 0, `aktifSampai` kosong, dan `kotakMenunggu` kosong.

### Keadaan skill di server ruang (usulan 2a dan 12a)

- **P-11. Keadaan per pemain.** Inti ruang menyimpan keadaan skill setiap pemain berkeidentitas: muatan (`KeadaanSkill.muatan`), akhir masa aktif dan waktu pakai terakhir (`aktifSampaiMs`, `terakhirPakaiMs`), waktu ambil setiap kotak, dan sasaran Kompas (kode kejadian dan id titik). Semua waktu itu dinyatakan dalam **waktu ronde**, yaitu milidetik ronde tanpa jeda (`waktuRonde`, JS-08), bukan jam server. Ronde dimulai dengan muatan 0 untuk semua skill dan semua kotak siap (usulan 2a). Pemain yang bergabung terlambat juga mulai dari muatan 0 dengan semua kotak siap.

- **P-12. Jeda, sambung ulang, dan pemulihan.**
  1. **Jeda.** Selama `jeda`, waktu ronde berhenti, sehingga skill yang aktif tidak habis, jeda 2 detik tidak berjalan, dan kotak tidak muncul lagi. Sesudah `lanjut`, semuanya berlanjut dari sisa waktunya. Hasilnya sama dengan menggeser semua waktu itu sebesar lama jeda, seperti `berakhirPada` (usulan 2a), tanpa menulis ulang baris apa pun. `lanjut` sudah mengirim `pribadi` kepada semua pemain (JS-08), kini dengan waktu yang sudah bergeser.
  2. **Sambung ulang.** Muatan, masa aktif, sasaran Kompas, kotak yang sudah diambil, dan Petunjuk yang sudah dipakai tetap. Sesudah `selamat_datang`, pemain menerima kejadian yang sudah terlihat dan `pribadi` seperti biasa (JS-08 P-12), lalu `kompas` bila Kompasnya masih aktif.
  3. **Pemulihan.** Saat Durable Object dibangunkan, keadaan skill dibaca ulang dari tabel `skill` dan `petunjuk` (P-14). Sasaran Kompas yang masa aktifnya sudah lewat diabaikan.

- **P-13. Isi `pribadi`.**
  - `muatan`: muatan Lari cepat, Kompas, dan Petunjuk; `teropong` dan `angkot` selalu 0.
  - `aktifSampai`: Lari cepat dan Kompas yang masih aktif, dalam jam server. Waktu ronde `t` diubah menjadi `mulaiPada + jedaMs + t`, dengan `jedaMs` = jumlah lama jeda yang sudah dilanjutkan; rumus itu benar di status `main` maupun `jeda`. Skill yang tidak aktif tidak dicantumkan, dan Petunjuk tidak pernah dicantumkan.
  - `kotakMenunggu`: setiap kotak yang sudah diambil pemain itu dan belum muncul lagi, berbentuk `{ id, siapPada }` dengan `siapPada` = jam server untuk waktu ambil + 90.000, urut menurut id, paling banyak 24 butir.
  - `pribadi` tetap dikirim pada saat-saat JS-08 (skor berubah, peringkat berubah paling sering sekali per 2 detik, status menjadi `main`, `lanjut`, dan sesudah sambung ulang), dan kini juga langsung kepada pemain itu saat muatannya berubah, saat skill mulai aktif, saat Kompas berakhir karena tiba atau kehabisan sasaran, dan saat kotak diambil (P-16, P-19, P-24, P-25, P-28, P-32). Skill yang habis karena waktu dan kotak yang muncul lagi tidak memicu `pribadi`, karena layar pemain menghitungnya dari `aktifSampai` dan `siapPada`.

- **P-14. Penyimpanan ruang.** Dua tabel baru dibuat dengan `CREATE TABLE IF NOT EXISTS` di `siapkanTabel`, sehingga ruang yang dibuat sebelum JS-09 tetap jalan (definisi di bagian "Data, protokol, API, dan migrasi"):
  - `skill`: satu baris per pemain berisi seluruh keadaan P-11 sebagai JSON.
  - `petunjuk`: satu baris per pemain per kejadian yang Petunjuknya dipakai, berisi id asli pilihan yang dicoret.

  Satu perubahan menulis satu baris `skill`: kotak diambil (sekali per laporan gerak, walaupun dua kotak terambil), Lari cepat atau Kompas dipakai, +1 Kompas, sasaran Kompas berganti, dan Kompas berakhir karena tiba atau kehabisan sasaran. Petunjuk menulis satu baris `skill` (muatan) dan satu baris `petunjuk`, lalu baris jawaban yang sama diantrekan ulang ke D1 (P-45). Skill yang habis karena waktu tidak menulis apa pun. Tabel yang sudah ada tidak berubah.

- **P-15. Status yang menerima skill.** `pakai_skill` hanya diproses di status `main` selama waktu ronde belum habis (`bolehMenjawab`, JS-08), dari pemain berkeidentitas yang punya posisi. Di status lain pesan itu diabaikan. Pemakaian yang ditolak (P-2, P-15, P-24, P-28) tidak mengubah apa pun dan tidak dijawab, kecuali Kompas tanpa sasaran (P-24). `pakai_skill` untuk Teropong dan Angkot diabaikan.

### Kotak bantuan (usulan 3a)

- **P-16. Mengambil kotak.** Untuk setiap `gerak` yang diterima di status `main`, server memeriksa ke-24 kotak `kampung.json` (`KOTAK_KAMPUNG`) dengan ruas dari posisi sah sebelumnya ke posisi baru (P-3). Kotak terambil bila keempat syarat ini terpenuhi:
  1. ruas lewat paling jauh 12 piksel dari pusat ubin kotak;
  2. kotak itu siap bagi pemain itu: belum pernah diambilnya, atau sudah lewat 90 detik waktu ronde sejak diambil (`kotakSiap`, JS-02);
  3. skill isinya (P-1) aktif di ruang;
  4. muatan skill itu kurang dari 2.

  Kotak diperiksa menurut urutan id. Untuk setiap kotak yang terambil, muatan bertambah 1 dan waktu ambilnya dicatat; sesudah semua kotak diperiksa, satu baris `skill` ditulis, lalu pemain itu menerima `pribadi` dan satu `pemberitahuan` per kotak (`kotak_lari`, `kotak_kompas`, atau `kotak_petunjuk`), menurut urutan itu. Kotak yang muatannya penuh tidak terambil, tetap siap, dan tetap tergambar. Gerak yang ditolak, posisi awal dan `koreksi` dari server, kait uji lokal `pindahkan`, serta gerak di status `lobi` dan `hitung_mundur` tidak mengambil kotak.

- **P-17. `ambil_kotak`.** Pesan ini tetap di skema protokol, tetapi layar pemain tidak mengirimnya, dan server mengabaikannya tanpa mencatat pelanggaran. Pembatas frekuensi pesan JS-03 tetap berlaku untuk semua pesan.

- **P-18. Kotak di layar pemain.**
  1. **Kapan tergambar.** Hanya di status `main` dan `jeda`, untuk kotak yang skillnya aktif di ruang dan siap bagi pemain ini: tidak ada di `kotakMenunggu` dari `pribadi` terakhir, atau `siapPada`-nya sudah dicapai waktu efektif (P-20). Di status `lobi` dan `hitung_mundur`, kotak tidak digambar.
  2. **Gambar.** Strip `tanda_kotak_sepatu`, `tanda_kotak_kompas`, atau `tanda_kotak_buku` (14 × 12, skala dunia), bingkai ketiga (biasa) saat diam, dengan sudut kiri atas di (16x + 1, 16y + 2). Kotak masuk lapisan tokoh (z 30) dan diurutkan bersama tokoh menurut baris kaki 16y + 14 (Design System 7).
  3. **Muncul lagi.** Kotak yang menjadi siap di depan mata pemain diberi pop tiga bingkai masing-masing 80 ms: bingkai pertama (kecil) selama 80 ms pertama sesudah `siapPada`, bingkai kedua (besar berkilau) sampai 160 ms, lalu bingkai biasa (Design System 11). Kotak yang tampil saat ronde mulai atau saat layar dimuat tidak diberi pop.
  4. **Diambil.** Kotak yang id-nya baru muncul di `kotakMenunggu` langsung hilang, dan `tanda_kilau` (8 × 8) tampil dua bingkai masing-masing 80 ms di lapisan efek (z 50), berpusat di pusat ubin kotak.
  5. **Jeda.** Kotak diam di bingkai biasa dan tidak muncul lagi, karena waktu efektif berhenti.
  6. **Kurangi gerak.** Tanpa pop dan tanpa kilau; kotak langsung tampil atau hilang.
  7. **Peta.** Kotak tidak ditandai di peta mini dan peta besar.
  8. **Atribut data kanvas untuk uji.** `data-kotak` berisi jumlah kotak yang tergambar di dalam pandangan, ditulis bersama ringkasan 500 ms JS-07.

### Lari cepat (usulan 4a)

- **P-19. Memakai Lari cepat.** Untuk pemakaian yang memenuhi P-2 dan P-15, server mengurangi muatan Lari cepat 1, mencatat waktu pakai, menetapkan akhir masa aktif di waktu ronde sekarang + 6.000, menulis baris `skill`, lalu mengirim `pribadi` dengan `aktifSampai.lari`.

- **P-20. Waktu efektif dan lari di layar pemain.**
  1. **Waktu efektif** adalah perkiraan jam server (`Date.now()` ditambah selisih jam JS-07) di status `main`, dan `jedaSejak` selama `jeda`. Semua waktu skill, `berakhirPada` Kompas, dan `siapPada` kotak di layar pemain dibandingkan dengan waktu efektif.
  2. Saat status berubah dari `jeda` ke `main`, layar pemain menggeser sendiri `aktifSampai`, `berakhirPada` Kompas, dan `siapPada` sebesar perkiraan jam server dikurangi `jedaSejak` sebelumnya, lalu memakai nilai dari `pribadi` berikutnya. Dengan begitu, Lari cepat dan Kompas tidak tampak berakhir sesaat sebelum `pribadi` sesudah `lanjut` tiba.
  3. Avatar sendiri bergerak dengan `KECEPATAN_LARI` (115,2 piksel logis per detik) sejak `pribadi` dengan `aktifSampai.lari` yang masih di depan waktu efektif tiba, sampai waktu efektif mencapai `aktifSampai.lari`. Layar pemain tidak mulai berlari sebelum jawaban server tiba (usulan 4a).
  4. Sesudah menyambung ulang, lari berlanjut bila `pribadi` masih memuat `aktifSampai.lari` di depan waktu efektif.
  5. Frekuensi laporan `gerak` tidak berubah (JS-07).
  6. **Atribut data kanvas untuk uji.** `data-lari` bernilai `ya` selama avatar sendiri memakai kecepatan lari, selain itu `tidak`.

- **P-21. Pemeriksaan gerak di server.** `periksaGerak` dipanggil dengan `lari = lariBerlaku(akhir masa aktif Lari cepat pemain, waktu ronde sekarang)` (P-4), sehingga anggaran jarak JS-07 (P-52) memakai kecepatan lari sampai 500 ms sesudah masa aktifnya berakhir. Percobaan Plan JS-09 dengan jaringan buruk (80 ms ditambah jitter rata-rata 40 ms) tidak menolak satu pun laporan dengan toleransi ini.

- **P-22. Lari diri tampak.** Selama avatar sendiri berlari dan berjalan:
  1. sprite berganti bingkai 12 kali per detik: bingkai jalan ke-`floor(jam × 12 / 1000) mod 4` (Design System 11), menggantikan 8 fps;
  2. `tanda_debu` (8 × 6) tampil di lapisan efek (z 50) di dekat kaki, berpusat 7 piksel logis di belakang titik kaki saat menghadap kanan atau kiri (pada y − 2), dan 2 piksel di bawah titik kaki saat menghadap atas atau bawah; kedua bingkainya bergantian mengikuti langkah 12 fps (`floor(jam × 12 / 1000) mod 2`).

  Avatar yang diam tidak berdebu. Kurangi gerak: tanpa debu, dan sprite tetap di bingkai pertama (JS-07).

- **P-23. Lari pemain lain.** Layar pemain menganggap pemain lain berlari bila butir `dunia` terakhirnya bertanda `jalan` dan jarak antara posisi tampilnya pada waktu tampil t dan pada t − 500 ms (keduanya dari interpolasi JS-07 P-21) lebih dari 45 piksel logis, yaitu rata-rata lebih dari 90 piksel per detik (1,25 × kecepatan jalan). Penyangga yang butir tertuanya lebih baru dari t − 500 ms dianggap berjalan. Pemain yang berlari tampak dengan langkah 12 fps dan debu seperti P-22. Protokol tidak berubah (usulan 4a).

### Kompas kejadian (usulan 5a dan 6a)

- **P-24. Memakai Kompas.** Untuk pemakaian yang memenuhi P-2 dan P-15, server memilih sasaran dengan `sasaranKompas` (P-5) dari posisi pemain, di antara semua titik aktif kejadian ruang yang belum `selesai` bagi pemain itu. Kejadian yang belum terlihat ikut dihitung, dan di ruang lebih dari 50 pemain kedua titik aktif setiap kejadian ikut dihitung.
  - **Ada sasaran.** Muatan berkurang 1, waktu pakai dicatat, akhir masa aktif ditetapkan di waktu ronde sekarang + 20.000, sasaran dicatat, dan satu baris `skill` ditulis. Pemain lalu menerima `kompas` (`x` dan `y` berupa ubin titik sasaran, `berakhirPada` dalam jam server menurut rumus P-13), kemudian `pribadi`.
  - **Tanpa sasaran** (semua kejadian ruang sudah selesai bagi pemain itu). Tidak ada yang berubah, dan server hanya mengirim `pemberitahuan` `kompas_tanpa_sasaran`. Layar pemain menampilkan pita "Semua kejadian sudah selesai." (P-41).
  - Pemain yang sudah dalam 32 piksel dari sasarannya saat memakai Kompas mengakhiri Kompasnya di putaran berikutnya (P-25).

- **P-25. Kompas berakhir dan sasaran baru.** Di setiap putaran 100 ms status `main`, untuk setiap pemain yang Kompasnya aktif:
  1. **Waktu habis.** Waktu ronde sudah mencapai akhir masa aktif: sasaran dilupakan tanpa pesan dan tanpa menulis baris.
  2. **Tiba.** Posisi pemain paling jauh 32 piksel dari pusat titik sasaran (`kompasTiba`): masa aktif dan sasaran Kompas dihapus, baris `skill` ditulis, dan `pribadi` tanpa `aktifSampai.kompas` dikirim.

  Saat Langkah 2 sebuah kejadian dikunci dan kejadian itu sasaran Kompas pemain tersebut (misalnya dijawab di titik keduanya), server memilih sasaran baru dari posisi pemain dengan akhir masa aktif yang sama. Ada sasaran baru: baris `skill` ditulis, dan `kompas` dikirim lagi dengan `berakhirPada` yang sama. Tidak ada sasaran baru: Kompas berakhir seperti butir 2. Sasaran tidak diperbarui karena pemain berpindah (usulan 5a).

- **P-26. Panah Kompas.**
  1. **Kapan tampil.** Layar pemain punya sasaran dari `kompas` terakhir, `pribadi` terakhir memuat `aktifSampai.kompas`, waktu efektif belum mencapai `berakhirPada`, dan pusat ubin sasaran berada di luar pandangan kamera 320 × 180. Selama pusat ubin sasaran ada di dalam pandangan, panah disembunyikan.
  2. **Arah.** Sudut dari titik kaki avatar ke pusat ubin sasaran dibulatkan ke kelipatan 45° terdekat (nilai tepat di tengah dibulatkan searah jarum jam). Untuk arah ke-i menurut urutan atas, kanan atas, kanan, kanan bawah, bawah, kiri bawah, kiri, dan kiri atas (i = 0 sampai 7), panah memakai bingkai 2i (biasa) dan 2i + 1 (terang) dari `tanda_kompas`.
  3. **Ukuran.** Sprite 7 × 7 digambar dua kali lebih besar, yaitu 14 × 14 piksel logis (skala bulat, usulan 6a), paling atas di kanvas dunia.
  4. **Letak.** Panah berada di dalam **kotak aman**: pandangan dikurangi 12 px CSS di kiri, 40 px CSS di atas (bilah atas 28 px dan jarak 12 px), 160 px CSS di kanan (peta mini, tombol skill, dan tombol Periksa), dan 56 px CSS di bawah (ajakan "E Periksa"), yang diubah ke piksel logis dengan skala dunia lalu dibulatkan. Pusat panah adalah titik potong garis dari titik kaki avatar ke arah sasaran dengan tepi kotak aman yang diperkecil 7 piksel logis di setiap sisi; titik kaki di luar kotak itu lebih dulu dijepit ke dalamnya.
  5. **Denyut.** Bingkai biasa dan terang bergantian setiap 500 ms (Design System 11). Kurangi gerak: bingkai biasa saja.
  6. **Jeda.** Panah diam di bawah lapisan jeda.
  7. **Peta.** Peta mini dan peta besar tidak menandai sasaran Kompas; titik itu baru masuk peta sesudah `kejadian_terlihat` (JS-08).
  8. **Atribut data kanvas untuk uji.** `data-kompas` berisi nama arah panah yang tergambar (`atas`, `kanan_atas`, `kanan`, `kanan_bawah`, `bawah`, `kiri_bawah`, `kiri`, atau `kiri_atas`), atau kosong.

### Petunjuk (usulan 7a)

- **P-27. Tombol Petunjuk di dialog.** Tombol "Petunjuk ({n})", dengan n = muatan Petunjuk dari `pribadi` terakhir, tampil di kaki dialog pada tampilan `langkah1` (mode penuh) dan `pilihan1` (mode ringkas), bila Petunjuk aktif di ruang. Urutan kaki menjadi Tutup, Situasi (hanya di `pilihan1`), Petunjuk, lalu Kunci jawaban, tetap satu baris di dunia 610 × 343, 640 × 360, 960 × 540, dan 1280 × 720, dengan setiap tombol setinggi 48 px. Tombol ini tidak tampil di `situasi1`, `umpan`, Langkah 2, kartu dampak, atau bila Petunjuk dimatikan. Statusnya:
  - **Bermuatan dan belum dipakai** untuk kejadian ini: aktif. Menekannya mengirim `pakai_skill` dengan `skill: "petunjuk"` dan `kejadianId` dialog itu.
  - **Tanpa muatan:** tampak nonaktif (`mist`, `aria-disabled="true"`), dan tekanannya diabaikan.
  - **Menunggu jawaban server:** tombol Petunjuk dan Kunci jawaban nonaktif sampai `petunjuk` tiba, paling lama 2 detik.
  - **Sudah dipakai** untuk kejadian ini: bertuliskan "Petunjuk dipakai" dan tampak nonaktif.
  - Masa tunggu 600 ms (JS-08 P-48) dan keadaan `mengunci` (JS-08 P-43) berlaku seperti tombol kaki lain.

- **P-28. Petunjuk di server.** Diterima bila P-15 terpenuhi, dialog pemain terbuka untuk `kejadianId` itu, jawaban kejadian itu masih berstatus `langkah1`, Petunjuk belum dipakai pemain itu untuk kejadian itu, dan `bolehPakaiSkill` terpenuhi dengan langkah dialog 1. Server lalu:
  1. mengurangi muatan Petunjuk 1 dan mencatat waktu pakai;
  2. memilih pilihan yang dicoret (P-6);
  3. menulis baris `skill` dan baris `petunjuk`, lalu mengantrekan ulang baris jawaban dengan `petunjukDipakai` 1 (P-45);
  4. mengirim `petunjuk`: `kejadianId`, `kalimat` = kalimat petunjuk dari isi kejadian yang disalin ke ruang, dan `opsiDicoret` = id pilihan milik pemain itu untuk pilihan yang dicoret (id acak per pemain JS-08, bukan id asli);
  5. mengirim `pribadi`.

- **P-29. Tampilan Petunjuk di dialog.**
  1. **Kotak petunjuk** (`.js-kotak-petunjuk`, `role="note"`, berlabel "Petunjuk"): `ikon_petunjuk` (16 × 16 di lembar, 32 × 32 di panel), lalu kalimat petunjuk dengan huruf Pixelify Sans seukuran teks pertanyaan (16 px di lembar, 18 px di panel) berwarna `ink`, di atas latar `white` dengan garis kiri 4 px `sky-d` dan bantalan 2 px 8 px (lembar) atau 6 px 10 px (panel).
  2. **Letak.** Di mode penuh (`langkah1`): situasi, pertanyaan, kotak petunjuk, lalu pilihan. Di mode ringkas (`pilihan1`): kotak petunjuk menggantikan pertanyaan, lalu pilihan; tampilan `situasi1` tetap berisi situasi dan pertanyaan. Pengukuran Specify: di dunia 610 × 343 (HP 731 × 411 dengan rasio 2,625, dan HP dengan bilah peramban), isi tampilan `pilihan1` dengan kotak petunjuk melewati tinggi area paling banyak 25 px dan bisa digulir, sedangkan kaki tetap terlihat; di dunia 640 × 360, 960 × 540, dan 1280 × 720 tidak ada luapan.
  3. **Pilihan yang dicoret** (`data-dicoret="ya"`): teks bergaris coret, latar `mist`, tanpa ▶, `aria-disabled="true"`, dan dibacakan "{huruf}. {teks}, dicoret Petunjuk". Pilihan itu tidak bisa dipilih dengan ketuk, klik, tombol angka, atau Enter, tetapi tetap bisa difokus. Bila pilihan itu sedang terpilih saat `petunjuk` tiba, pilihannya dilepas dan "Kunci jawaban" kembali nonaktif.
  4. **Fokus.** Fokus tetap di tombol Petunjuk, yang kini bertuliskan "Petunjuk dipakai". Fokus awal tampilan berikutnya (JS-08 P-49) melewati pilihan yang dicoret.
  5. **Pengumuman.** "Petunjuk: {kalimat} Satu pilihan dicoret."
  6. `petunjuk` untuk kejadian lain atau yang tiba sesudah Langkah 1 dikunci diabaikan layar pemain.

- **P-30. Dialog dibuka ulang.** Saat dialog kejadian yang Petunjuknya sudah dipakai dibuka lagi, atau `periksa` diulang untuk dialog yang sama, sebelum Langkah 1 dikunci, server mengirim `kejadian_terbuka` lalu `petunjuk` dengan kalimat dan pilihan yang sama, tanpa mengurangi muatan. Layar pemain menampilkannya seperti P-29, dan tombolnya bertuliskan "Petunjuk dipakai". Sesudah Langkah 1 dikunci, `petunjuk` tidak dikirim lagi. Sambungan yang putus menutup dialog (JS-08 P-36), jadi sesudah menyambung ulang Petunjuk tampil lagi saat dialog dibuka ulang.

- **P-31. Skor dan rekap.** Petunjuk tidak mengubah skor, poin, peringkat, umpan balik, atau rekap pribadi (PRD 8.4). Pilihan yang dicoret tampil seperti pilihan lain di tampilan umpan balik sesudah Langkah 1 dikunci.

### +1 Kompas dari jawaban "tepat" (JFR-24)

- **P-32. Jawaban "tepat".** Saat Langkah 2 dikunci dengan tingkat `tepat`, Kompas aktif di ruang, dan muatan Kompas kurang dari 2, server menambah muatan Kompas 1 (`tambahMuatanKompas`) dan menulis baris `skill`. Pemain menerima `hasil_2`, lalu `pemberitahuan` `kompas_tepat`, lalu `pribadi`. Layar pemain menampilkan "+1 Kompas" dengan `ikon_kompas` 16 × 16 di kepala kartu dampak, di kanan angka poin (`.js-kartu-skill`), dan mengumumkan "Dapat satu muatan Kompas kejadian." sesudah pengumuman kartu. Muatan yang sudah penuh atau Kompas yang dimatikan: tidak ada tambahan, tidak ada `pemberitahuan`, dan tidak ada tulisan di kartu.

### Tombol skill di HUD (usulan 8a dan 9a)

- **P-33. Kapan tampil.** Tombol skill hanya tampil di status `main`, untuk skill yang aktif di ruang, dan tidak tampil selama dialog, peta besar, lapisan menyambung ulang, atau ajakan memutar HP tampil (syarat yang sama dengan tombol Periksa JS-08). Kelompok tombolnya ber-`role="group"` dengan label "Skill".

- **P-34. Letak di perangkat sentuh** (lengkung di sekitar Periksa). Setiap tombol bulat 48 × 48 px CSS bergaris `ink` 4 px, dengan ikon skill 16 × 16 pada skala 2 di tengahnya. Letaknya diukur dari tepi kanan dan bawah HUD (dunia yang tampil):

  | Skill | Letak | Arah dari Periksa |
  |---|---|---|
  | Lari cepat | `right: 24px; bottom: 100px` | Atas |
  | Kompas kejadian | `right: 78px; bottom: 78px` | Serong kiri atas |
  | Petunjuk | `right: 100px; bottom: 24px` | Kiri |

  Letak setiap skill tetap walaupun skill lain dimatikan. Jarak antartombol sedikitnya 10 px, ke Periksa sedikitnya 20 px, dan ke peta mini (termasuk lencana muatan) sedikitnya 70 px di dunia 610 × 343 dan 640 × 360.

- **P-35. Letak di laptop** (perangkat tanpa layar sentuh, tanpa tombol Periksa). Kolom di kanan bawah dengan `right: 16px`; dari atas Lari cepat, Kompas, dan Petunjuk dengan `bottom` 132, 74, dan 16 px bila ketiganya aktif. Skill yang dimatikan tidak memakan tempat, dan tombol yang tersisa turun ke bawah dengan urutan yang sama. Tanda tombol `kbd` bergaya ajakan "E Periksa" (Press Start 2P 12 px, garis `ink` 2 px, latar `sun`) tampil 8 px di kiri setiap tombol, di tengah tegak: `1` untuk Lari cepat, `2` untuk Kompas, dan `3` untuk Petunjuk, tetap walaupun skill lain dimatikan.

- **P-36. Status tombol.**

  | Status | Tampilan |
  |---|---|
  | Bermuatan | Latar `cream`, ikon skill, dan lencana muatan |
  | Tanpa muatan | Latar `mist`, ikon tetap tampil, lencana "0", `aria-disabled="true"` |
  | Sedang aktif (Lari cepat dan Kompas) | Cincin dalam `sun` 4 px dan `aria-disabled="true"` sampai skill selesai (D-1a) |
  | Jeda 2 detik sesudah dipakai | Blok `ink` berkepekatan 70% yang menutupi tombol, lalu menyusut dari atas ke bawah dalam 8 langkah selama 2 detik |
  | Ditekan dan menunggu jawaban | Tombol bergeser 2 px (1 piksel antarmuka) sampai `pribadi` atau `pemberitahuan` tiba, paling lama 2 detik |
  | Fokus | Garis luar `sun` 4 px berjarak 2 px, seperti tombol Periksa |

  Lencana muatan berukuran 22 × 22 px di sudut kiri atas tombol (`top: -4px; left: -4px`), bergaris `ink` 2 px, berlatar `white`, dengan angka Press Start 2P berwarna `ink` 12 px di perangkat sentuh dan 14 px di laptop (skala Design System 5). Atribut `data-skill`, `data-muatan`, `data-aktif`, dan `data-jeda` di setiap tombol dipakai uji.

- **P-37. Menekan tombol skill.** Layar pemain memakai `bolehPakaiSkill` (P-2) dengan keadaannya sendiri: muatan dari `pribadi` terakhir, masa aktif dari `aktifSampai`, waktu pakai terakhir = saat `pribadi` yang mengurangi muatan skill itu tiba, dan tanpa dialog. Hasil tekanan:
  1. **Boleh dipakai:** `pakai_skill` dikirim, dan tombol tampak ditekan sampai jawaban tiba (P-36).
  2. **Tanpa muatan:** tidak ada pesan; pita "Cari kotak sepatu.", "Cari kotak kompas.", atau "Cari kotak buku." (D-2a).
  3. **Sedang aktif atau dalam jeda 2 detik:** tidak ada pesan dan tidak ada pita.
  4. **Petunjuk di luar dialog:** tidak ada pesan; pita "Petunjuk dipakai di Langkah 1." bila bermuatan, atau pita butir 2 bila tanpa muatan.

- **P-38. Papan ketik.** Selama tombol skill tampil, `1`, `2`, dan `3` (baris angka atau papan angka) sama dengan menekan tombol Lari cepat, Kompas, dan Petunjuk; angka untuk skill yang dimatikan tidak berbuat apa-apa, dan tekanan berulang karena tombol ditahan diabaikan. Di dalam dialog, `1` sampai `4` tetap memilih jawaban (JS-08), dan tidak ada pintasan Petunjuk; tombol Petunjuk dicapai dengan `Tab` lalu `Enter` atau `Spasi`. Pintasan lain tidak berubah.

- **P-39. Pembaca layar.** Label tombol: "{skill}, {n} muatan", atau "{skill}, {n} muatan, sedang aktif" selama skill aktif, dengan nama lengkap skill; di laptop, tombol juga ber-`aria-keyshortcuts` `1`, `2`, atau `3`. Lewat antrean pengumuman yang sudah ada (jarak 2 detik, JS-08 P-54) diumumkan:
  - kotak terambil: "Dapat satu muatan {skill}.";
  - skill mulai aktif: "{skill} aktif selama {n} detik.";
  - Lari cepat atau Kompas berakhir karena waktu, tiba, atau kehabisan sasaran: "{skill} selesai.";
  - Petunjuk (P-29), +1 Kompas (P-32), dan setiap pita skill dengan teks pitanya.

  Pita skill tidak memakai `role="status"`, karena teksnya sudah masuk antrean pengumuman.

- **P-40. Kurangi gerak.** Tanpa debu (P-22, P-23), tanpa pop dan kilau (P-18), dan panah tanpa denyut (P-26). Blok jeda 2 detik tidak menyusut bertahap, tetapi tampil penuh selama 2 detik lalu hilang. Sprite tetap di bingkai pertama (JS-07).

### Pemberitahuan (usulan 10a)

- **P-41. Pita skill.** Pita memakai gaya `.js-pita` JS-07 (atas tengah, latar `mango`, Press Start 2P 13 px, tampil 3 detik), dengan dua perubahan: lebar luarnya (termasuk garis dan bantalan, `box-sizing: border-box`) paling besar lebar HUD dikurangi 256 px, sehingga berjarak sedikitnya 4 px dari peta mini, dan teks yang tidak muat boleh terbungkus menjadi dua baris rata tengah. Teksnya:
  - kotak terambil: "+1 Lari cepat", "+1 Kompas", dan "+1 Petunjuk";
  - Kompas tanpa sasaran: "Semua kejadian sudah selesai." (P-24);
  - Petunjuk di luar dialog: "Petunjuk dipakai di Langkah 1." (P-37);
  - pita D-2a: "Cari kotak sepatu.", "Cari kotak kompas.", "Cari kotak buku.", "Lari cepat sudah penuh.", "Kompas sudah penuh.", dan "Petunjuk sudah penuh.".

  Pita tampil satu per satu. Pita baru menunggu pita yang sedang tampil selesai, dalam antrean paling banyak 3 butir (butir tertua dibuang bila penuh), dan pita yang sama dengan butir terakhir antrean tidak ditambahkan. Pita skill tidak tampil selama dialog terbuka, dan pemicunya selama dialog dibuang. Pita "Dua menit lagi" (JS-07) masuk antrean yang sama tanpa perubahan lain. Pengukuran Specify dengan huruf yang sudah dimuat: di HUD selebar 610 px, "+1 Lari cepat" selebar 205 px; "Semua kejadian sudah selesai." dan "Petunjuk dipakai di Langkah 1." terbungkus menjadi dua baris; semua pita lain satu baris.

- **P-42. Kode `pemberitahuan`.** `kotak_lari`, `kotak_kompas`, `kotak_petunjuk` (P-16), `kompas_tepat` (P-32), dan `kompas_tanpa_sasaran` (P-24). Semuanya cocok dengan pola `^[a-z0-9_]{1,32}$` skema JS-02. Kode lain diabaikan layar pemain.

- **P-43. Pita bantuan muatan (D-2a).** Layar pemain sendiri, tanpa pesan server, menampilkan "{skill} sudah penuh." dengan nama pendek skill saat titik kaki avatar sendiri berada paling jauh 12 piksel dari pusat ubin kotak yang siap dan tergambar, sedangkan muatan skill isinya sudah 2. Pita itu tampil sekali per kotak, dan baru bisa tampil lagi untuk kotak yang sama sesudah avatar menjauh lebih dari 24 piksel darinya. Pita "Cari kotak …" dipicu tombol tanpa muatan (P-37).

### Pratinjau penyunting (usulan 1a)

- **P-44. Petunjuk di pratinjau.** Dialog pratinjau JS-12 menampilkan tombol "Petunjuk (2)" di Langkah 1 seperti P-27, dengan muatan tiruan 2 dan tanpa menyambung ke ruang. Menekannya menampilkan kalimat petunjuk dari isi yang sedang disunting dan mencoret pilihan keliru pertama menurut urutan asli A sampai D (D-3a), lalu tombol bertuliskan "Petunjuk dipakai". Kalimat petunjuk yang masih kosong tidak menampilkan kotak petunjuk, tetapi pilihan tetap dicoret. Tombol "Ulang" dan isi baru dari konsol mengembalikan muatan tiruan dan dialog ke awal.

### Hasil dan CSV (usulan 13a)

- **P-45. Baris jawaban D1.** `barisJawabanD1` mengisi `petunjukDipakai` dengan 1 bila Petunjuk dipakai pemain itu untuk kejadian itu, selain itu 0. Kolom `jawaban.petunjuk_dipakai` sudah ada sejak `0001_awal.sql`, jadi tidak ada migrasi. Baris yang diantrekan ulang memakai kunci antrean yang sama (JS-08), sehingga jumlah baris D1 tidak bertambah. `bacaJawabanHasil` ikut membaca kolom itu.

- **P-46. Rincian hasil.** `skemaJawabanRincian` mendapat `petunjukDipakai` (boolean). Di rincian jawaban halaman hasil (JS-11 P-24), sel Langkah 1 pada baris yang Petunjuknya dipakai mendapat tanda `.js-konsol-tanda` berikon `ikon_petunjuk` 16 × 16 dan bertulisan "Petunjuk", sesudah tanda Tepat atau Belum tepat. Peringkat, ringkasan angka, dan tabel peserta tidak berubah.

- **P-47. CSV jawaban.** Kolom ke-18 "Petunjuk dipakai", berisi "Ya" atau "Tidak", ditambahkan di ujung kanan sesudah "Keterangan". Ke-17 kolom JS-11 tetap di tempatnya, sesuai catatan Plan JS-09 dari Specify JS-11. CSV peserta tidak berubah.

### Dasbor dan uji ujung ke ujung (usulan 16a)

- **P-48. Tautan kartu dasbor.** Setiap tautan di daftar kartu "Ruang yang sedang berjalan" (`.js-konsol-daftar-ruang a`), termasuk tautan ke semua ruang, setinggi sedikitnya 48 px (`display: inline-flex; align-items: center; min-height: 48px`). Teksnya tidak berubah.

- **P-49. Penutupan ruang uji.** `e2e/jejak-setara/ruang-uji.ts` mendapat `tutupSemuaRuang(request)`. Untuk setiap ruang yang dibuat proses uji itu dan belum ditutup, fungsi ini mengirim `akhiri` lewat layar kelas bertiket bila status `main` atau `jeda` (dan menunggu `main` lebih dulu bila status `hitung_mundur`), lalu `POST /api/ruang/{id}/kelola` dengan `aksi: "tutup"`. Jawaban untuk ruang yang sudah ditutup atau sudah dihapus diterima. Setiap berkas uji ujung ke ujung yang membuat ruang memanggilnya di `test.afterAll`; uji yang membuat ruang lewat dialog Ruang baru mencatat id ruangnya untuk ditutup dengan cara yang sama. Dengan itu, seluruh uji ujung ke ujung lulus bila dijalankan dalam satu perintah `test:e2e:jejak`.

### Simulasi beban (usulan 15a)

- **P-50. Bot skill.** `simulasi-beban.mjs` menambah perilaku ini pada bot JS-08 di status `main`:
  1. Separuh tujuan jelajah acak bot adalah ubin kotak yang siap dan skillnya belum penuh menurut `pribadi` terakhir bot; separuh lainnya ubin acak seperti JS-07.
  2. Bot yang bermuatan Lari cepat dan sedang berjalan memakainya, lalu bergerak 115,2 piksel per detik sampai `aktifSampai.lari` menurut jam server yang diperkirakan dari `pong`, dan kembali ke 72 sesudahnya.
  3. Bot yang tidak punya sasaran kejadian dan bermuatan Kompas memakainya, lalu berjalan ke ubin dari `kompas`.
  4. Bot di Langkah 1 yang bermuatan Petunjuk mengirim `pakai_skill` Petunjuk lebih dulu, lalu memilih pilihan acak yang bukan `opsiDicoret`.
  5. Ringkasan mencatat jumlah kotak terambil per jenis, pemakaian setiap skill, jumlah `kompas`, `petunjuk`, dan `kompas_tanpa_sasaran`, ukuran rata-rata `pribadi`, gerak yang dikoreksi (seluruhnya, dan yang terjadi selama lari atau sampai 1 detik sesudahnya), lalu lintas turun per pemain, serta baris tulis SQLite ruang dan D1 (kait statistik lokal).

### Ukuran, kinerja, dan kompatibilitas (usulan 12a dan 14a)

- **P-51. Ukuran dan kinerja.** Kode layar pemain naik paling banyak 4 KB gzip dan gaya layar pemain paling banyak 0,6 KB gzip dari `main` sebelum Build (122,24 KB dan 5,82 KB). Konsol tetap di bawah 350 KB gzip, konsol tetap tidak mengimpor `assets/manifest.ts`, dan layar pemain tetap tidak mengimpor `teks-konsol.ts`. Di server, pemeriksaan 24 kotak per `gerak`, pemilihan sasaran Kompas, dan pemeriksaan tiba Kompas per putaran untuk 100 pemain diukur di Node (median 20 kali) dan dicatat di laporan uji; sasaran Architecture 13.1 tetap berlaku (≤ 1 ms per `gerak` dan ≤ 5 ms waktu CPU per putaran 50 pemain).

- **P-52. Kompatibilitas.** `PROTOKOL_VERSI` tetap 2 dan tidak ada pesan baru. Ruang yang dibuat sebelum JS-09 sudah menyimpan ketiga skill P0 sebagai aktif (sejak JS-03), sehingga sesudah deploy server ruang itu menerapkan skill begitu Durable Object-nya bangun dan membuat tabel `skill` dan `petunjuk`. Layar pemain lama yang belum dimuat ulang tetap tersambung tanpa HUD skill: layar itu mengabaikan `pemberitahuan` dan isi skill di `pribadi`, dan tidak mengirim `pakai_skill`. Kotak yang terlewati HP lama tetap menambah muatannya di server.

## Beberapa pemain sekaligus

- Diberikan dua pemain melewati kotak sepatu yang sama dalam satu detik, ketika keduanya bermuatan Lari cepat kurang dari 2, maka masing-masing mendapat +1 muatan dan kotak itu hilang hanya di layar pemain yang mengambilnya; bagi yang lain kotak itu tetap tergambar sampai ia sendiri mengambilnya.
- Diberikan 40 pemain memakai Kompas dalam putaran yang sama, maka setiap pemain menerima `kompas` dengan sasarannya sendiri dari posisinya sendiri, dan pemeriksaan tiba berjalan untuk 40 pemain di setiap putaran 100 ms.
- Diberikan ruang 80 pemain dengan dua titik aktif per kejadian, ketika pemain A memakai Kompas di dekat titik kedua sebuah kejadian, maka sasaran A adalah titik kedua itu, bukan titik pertamanya.
- Diberikan Kompas pemain A menunjuk titik pertama kejadian K-07, ketika A menjawab K-07 di titik keduanya, maka A menerima `kompas` baru dengan `berakhirPada` yang sama, atau Kompasnya berakhir bila tidak ada kejadian lain yang belum selesai.
- Diberikan pemain A sedang berlari, ketika pemain B melihat A di layarnya, maka B melihat langkah 12 fps dan debu di kaki A selama kecepatan tampak A lebih dari 90 piksel per detik.
- Diberikan dua pemain memakai Petunjuk di kejadian yang sama, maka masing-masing mendapat pilihan dicoret menurut benihnya sendiri, dan CSV jawaban menulis "Ya" pada kedua barisnya.
- Diberikan guru menjeda ronde 60 detik ketika Kompas pemain A masih 12 detik lagi dan kotak buku pemain B akan muncul lagi 10 detik lagi, maka sesudah dilanjutkan, Kompas A masih 12 detik dan kotak B muncul 10 detik kemudian; semua pemain menerima `pribadi` dengan waktu yang sudah bergeser.
- Diberikan HP pemain A terputus 5 detik saat Lari cepatnya aktif, ketika A tersambung lagi, maka A menerima `pribadi` dengan muatan dan `aktifSampai` yang sama, dan larinya berlanjut bila masa aktifnya belum lewat.
- Diberikan Durable Object ruang dibangunkan ulang di tengah ronde, maka muatan, masa aktif, kotak yang menunggu, sasaran Kompas, dan Petunjuk yang sudah dipakai setiap pemain sama seperti sebelumnya.
- Diberikan pemain C bergabung terlambat, maka C mulai dengan muatan 0 dan semua kotak siap, tanpa memengaruhi kotak pemain lain.
- Diberikan guru mengakhiri ronde saat banyak skill aktif, maka status menjadi `selesai`, HUD skill hilang, dan tidak ada pesan skill lagi.
- Diberikan guru mengeluarkan pemain yang Kompasnya aktif, maka pemain itu tidak lagi diperiksa di putaran, dan pemain lain tidak terpengaruh.
- Diberikan ruang 100 pemain yang semuanya terus bergerak, maka pemeriksaan kotak menambah sekitar 0,14 ms CPU per detik (percobaan Plan JS-09), dan sasaran Architecture 13.1 tetap terpenuhi (diukur ulang di P-51).

## Status antarmuka

Ruang penuh dan ruang terkunci tidak mengubah tampilan JS-09, karena keduanya terjadi sebelum pemain masuk dunia.

| Tempat | Status | Tampilan |
|---|---|---|
| Tombol skill | Biasa (bermuatan) | Latar `cream`, ikon, lencana muatan (P-36) |
| Tombol skill | Tanpa muatan | `mist`, lencana "0", `aria-disabled`; tekanan memunculkan pita D-2a |
| Tombol skill | Sedang aktif | Cincin dalam `sun`, `aria-disabled` (D-1a) |
| Tombol skill | Jeda 2 detik | Blok `ink` 70% yang menyusut (P-36); kurangi gerak: blok penuh 2 detik |
| Tombol skill | Ditekan dan menunggu | Bergeser 2 px sampai jawaban tiba, paling lama 2 detik |
| Tombol skill | Fokus | Garis luar `sun` 4 px |
| Tombol skill | Tersembunyi | Lobi, hitung mundur, jeda, dialog, peta besar, menyambung ulang, HP tegak, skill dimatikan, atau ruang tanpa skill |
| Tombol Petunjuk di dialog | Bermuatan, tanpa muatan, menunggu, sudah dipakai | P-27 |
| Tombol Petunjuk di dialog | Tidak tampil | `situasi1`, umpan balik, Langkah 2, kartu, atau Petunjuk dimatikan |
| Kotak petunjuk | Mode penuh / mode ringkas | Di atas pilihan / menggantikan pertanyaan di `pilihan1` (P-29) |
| Pilihan yang dicoret | Dicoret, terfokus | Garis coret, `mist`, tanpa ▶; garis fokus `sun` tetap tampil |
| Kotak di dunia | Siap, diambil, menunggu, muncul lagi | Tergambar; kilau lalu hilang; tidak tergambar; pop (P-18) |
| Kotak di dunia | Lobi dan hitung mundur, skill dimatikan | Tidak tergambar |
| Kotak di dunia | Dijeda | Diam, tidak muncul lagi |
| Panah Kompas | Sasaran di luar pandangan / di dalam pandangan | Berdenyut di tepi kotak aman / tersembunyi |
| Panah Kompas | Selesai, kurangi gerak, dijeda | Hilang; bingkai biasa; diam di bawah lapisan jeda |
| Avatar | Berlari | Langkah 12 fps dan debu; kurangi gerak: tanpa debu |
| Pita | Tampil, antre, dialog terbuka | 3 detik; menunggu giliran; tidak tampil dan dibuang (P-41) |
| Layar pemain | Terputus dan menyambung ulang | Lapisan JS-07; HUD skill tersembunyi; sesudah tersambung, `pribadi` dan `kompas` memulihkan tampilan |
| Kartu dampak | Jawaban tepat dengan +1 Kompas | "+1 Kompas" berikon kompas di kepala kartu (P-32) |
| Pratinjau penyunting | Biasa / sudah dipakai / sesudah "Ulang" | "Petunjuk (2)" / "Petunjuk dipakai" dengan kotak dan coretan / kembali ke "Petunjuk (2)" |
| Dialog Ruang baru | Biasa, fokus, tanpa centang, mengirim, galat | Tiga kotak centang tercentang; garis fokus konsol; boleh dikirim; tombol "Membuat ruang…" nonaktif (JS-10); pesan galat umum JS-10 |
| Halaman ruang | Kepala | Baris "Skill" dengan daftar atau "Tidak ada" |
| Hasil | Ringkasan dan cetak | Baris "Skill" di layar; tidak dicetak |
| Rincian hasil | Petunjuk dipakai | Tanda "Petunjuk" berikon di sel Langkah 1 |
| Dasbor | Daftar ruang berjalan | Setiap tautan setinggi sedikitnya 48 px |

## Teks yang tampil (final)

Teks dengan `{…}` diisi lewat `isiTeks()`. Di layar pemain, `{skill}` diisi nama lengkap (`skill.lari`, `skill.kompas`, `skill.petunjuk`) untuk label tombol dan pengumuman, dan nama pendek (`skill.lari`, `skill.kompasPendek`, `skill.petunjuk`) untuk pita, "+1 Kompas" di kartu dampak, dan `skill.penuh`; `{n}` di `skill.aktif` bernilai 6 untuk Lari cepat dan 20 untuk Kompas. Teks yang sudah ada dan dipakai ulang tanpa perubahan tidak dicantumkan: di layar pemain `dunia.duaMenit` (antrean pita), `dialog.*` (kaki dialog dan label pilihan), `kartu.*`, `pengumuman.kartu`, dan `pengumuman.tambahPoin`; di konsol `csv.ya` dan `csv.tidak` (isi kolom ke-18), serta `hasil.rTepat` dan `hasil.rBelumTepat` (tanda Langkah 1 di rincian).

**Layar pemain** (`TEKS.skill`, `app/jejak-setara/teks.ts`)

| Kunci | Teks |
|---|---|
| `skill.lari` | Lari cepat |
| `skill.kompas` | Kompas kejadian |
| `skill.petunjuk` | Petunjuk |
| `skill.kompasPendek` | Kompas |
| `skill.kelompok` | Skill |
| `skill.tombol` | {skill}, {n} muatan |
| `skill.tombolAktif` | {skill}, {n} muatan, sedang aktif |
| `skill.pita` | +1 {skill} |
| `skill.semuaSelesai` | Semua kejadian sudah selesai. |
| `skill.diLangkah1` | Petunjuk dipakai di Langkah 1. |
| `skill.cariLari` | Cari kotak sepatu. |
| `skill.cariKompas` | Cari kotak kompas. |
| `skill.cariPetunjuk` | Cari kotak buku. |
| `skill.penuh` | {skill} sudah penuh. |
| `skill.dapat` | Dapat satu muatan {skill}. |
| `skill.aktif` | {skill} aktif selama {n} detik. |
| `skill.selesai` | {skill} selesai. |
| `skill.tombolDialog` | Petunjuk ({n}) |
| `skill.dipakai` | Petunjuk dipakai |
| `skill.dicoret` | dicoret Petunjuk |
| `skill.umumPetunjuk` | Petunjuk: {kalimat} Satu pilihan dicoret. |

**Konsol** (`TEKS_KONSOL.skill`, `app/jejak-setara/teks-konsol.ts`)

| Kunci | Teks |
|---|---|
| `skill.judul` | Skill |
| `skill.lari` | Lari cepat |
| `skill.kompas` | Kompas kejadian |
| `skill.petunjuk` | Petunjuk |
| `skill.keterangan` | Hapus centang untuk mematikan skill di ruang ini. |
| `skill.tidakAda` | Tidak ada |

**Isi berkas CSV** (`TEKS_KONSOL.csv`, dipakai server)

| Kunci | Teks |
|---|---|
| `csv.petunjuk` | Petunjuk dipakai |

## Data, protokol, API, dan migrasi

**Migrasi D1:** tidak ada. Kolom `jawaban.petunjuk_dipakai` sudah ada sejak `0001_awal.sql`.

**Protokol real-time:** `PROTOKOL_VERSI` tetap 2, dan skema `inti/protokol.ts` tidak berubah. Pesan yang mulai dipakai atau diisi:

| Pesan | Arah | Isi yang dipakai | Kapan |
|---|---|---|---|
| `pakai_skill` | Pemain ke server | `skill`; `kejadianId` hanya untuk Petunjuk | P-19, P-24, P-28 |
| `ambil_kotak` | Pemain ke server | Tidak dikirim layar pemain; diabaikan server | P-17 |
| `selamat_datang` | Server ke pemain | `pengaturan.skillAktif` | P-8 |
| `pribadi` | Server ke pemain | `muatan`, `aktifSampai`, dan `kotakMenunggu` kini terisi | P-13 |
| `kompas` | Server ke pemain | `x`, `y` (ubin titik sasaran), `berakhirPada` | P-12, P-24, P-25 |
| `petunjuk` | Server ke pemain | `kejadianId`, `kalimat`, `opsiDicoret` (id pilihan milik pemain) | P-28, P-30 |
| `pemberitahuan` | Server ke pemain | `kode` menurut P-42 | P-16, P-24, P-32 |

**Penyimpanan Durable Object** (SQLite ruang, dibuat di `siapkanTabel`):

```sql
CREATE TABLE IF NOT EXISTS skill (pemain_id TEXT PRIMARY KEY, isi_json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS petunjuk (pemain_id TEXT NOT NULL, kode TEXT NOT NULL, opsi TEXT NOT NULL, PRIMARY KEY (pemain_id, kode));
```

`skill.isi_json` berisi keadaan P-11, dengan semua waktu dalam waktu ronde (milidetik), misalnya:

```json
{"muatan":{"lari":1,"kompas":2,"petunjuk":0},"aktif":{"kompas":412300},"pakai":{"kompas":392300,"lari":118000},"kotak":{"k-z3-1":95000,"k-z1-2":388000},"kompas":{"kode":"K-07","titik":"t-z4-03"}}
```

`kompas` bernilai `null` bila tidak ada sasaran. `petunjuk.opsi` berisi id asli pilihan yang dicoret (`1a` sampai `1d`). Keduanya ditulis lewat jenis `Simpanan` baru di keluaran inti ruang, dan dibaca `pulihkan()` ke `DataPulih` (opsional, sehingga ruang lama tanpa baris tetap pulih).

**Inti bersama** (`inti/aturan.ts`, murni):

```ts
export const SKILL_P0 = ["lari", "kompas", "petunjuk"] as const;
export const SKILL_KOTAK: Readonly<Record<KotakJenis, SkillId>>; // sepatu→lari, kompas→kompas, buku→petunjuk, teropong→teropong, karcis→angkot
export const TOLERANSI_LARI_MS = 500;
export function lariBerlaku(aktifSampai: number | undefined, now: number): boolean;
export function jarakRuas(a: Posisi, b: Posisi, p: Posisi): number;
export function kotakDilewati(dari: Posisi, ke: Posisi, kotak: { x: number; y: number }): boolean;
export function sasaranKompas(
  pos: Posisi,
  daftar: readonly { kode: string; selesai: boolean; titik: readonly { id: string; x: number; y: number }[] }[],
): { kode: string; titikId: string; x: number; y: number } | null;
export function kompasTiba(pos: Posisi, titik: { x: number; y: number }): boolean;
// bolehPakaiSkill: ditambah syarat skill berdurasi tidak sedang aktif (D-1a).
```

**Skema zod:**
- `skemaRuangBaru` (`inti/ruang.ts`): `skillAktif: z.array(z.enum(SKILL_P0)).max(3).refine(tanpaDuplikat).optional()`; skema tetap `strict`.
- `skemaRingkasanRuang`: `skillAktif: z.array(z.enum(SKILL_P0))`.
- `skemaJawabanRincian` (`inti/hasil.ts`): `petunjukDipakai: z.boolean()`.

**Rute API** (tidak ada rute baru):

| Rute | Perubahan |
|---|---|
| `POST /api/ruang` | Badan permintaan menerima `skillAktif` (P-8); jawaban 201 membawa `ruang.skillAktif` |
| `GET /api/ruang`, `GET /api/ruang/{id}`, `GET /api/ruang/{id}/hasil`, dan `GET /api/dasbor` | `skillAktif` di setiap ringkasan ruang, karena semuanya memakai `ringkasanRuang` (P-9) |
| `GET /api/ruang/{id}/hasil/{pesertaId}` | Setiap butir rincian membawa `petunjukDipakai` (P-46) |
| `GET /api/ruang/{id}/ekspor?jenis=jawaban` | Kolom ke-18 "Petunjuk dipakai" (P-47) |

**D1:** `bacaJawabanHasil` menambah `petunjuk_dipakai` di SELECT jawaban, dan `BarisJawabanHasil` mendapat kolom itu. Kueri tulis `UPSERT_JAWABAN` sudah memuat `petunjuk_dipakai` sejak JS-08.

**Dokumen utama (diubah saat Build):**
- Architecture 5.3: baris `kotak` dan kolom muatan di baris `pemain` diganti tabel `skill` dan `petunjuk` (usulan 12a); 6.3: `ambil_kotak` tidak dikirim layar pemain, dan daftar kode `pemberitahuan`; 8.2: toleransi akhir Lari cepat 500 ms; 8.5: deteksi kotak dari ruas gerak, waktu ronde, sasaran dan tiba Kompas, dan pilihan dicoret berbenih.
- Design System 3.3 (sketsa dan butir tombol skill dalam lengkung), 3.4 (kolom laptop dengan tanda tombol), 9 (peti 14 × 12; panah 7 × 7 digambar 14 × 14 piksel logis), 10 (tombol skill dan contoh pita "+1 Lari cepat"), 11 (pop untuk kotak yang muncul lagi dan kilau untuk kotak yang diambil), dan 13 (`1` `2` `3` di luar dialog).
- PRD 21: persetujuan spesifikasi JS-09 beserta pilihan DRAF, dan keputusan pemilik proyek atas kriteria yang lulus dengan catatan bila ada.

## Aset

Tidak ada aset gambar atau token CSS baru. Sembilan aset Disetujui (6 November 2026) dipakai: `ikon_lari`, `ikon_kompas`, dan `ikon_petunjuk` (I-01 sampai I-03; tombol HUD, kotak petunjuk, kartu dampak, dan konsol); `tanda_kotak_sepatu`, `tanda_kotak_kompas`, dan `tanda_kotak_buku` (T-04 sampai T-06; strip 3 × 14 × 12 berurutan kecil, besar berkilau, biasa); `tanda_kompas` (T-09; 16 × 7 × 7, delapan arah × dua bingkai); `tanda_debu` (T-11; 2 × 8 × 6); dan `tanda_kilau` (T-12; 2 × 8 × 8). Layar pemain memuatnya lewat `assets/manifest.ts` dan daftar aset dunia di `pemain/dunia/aset.ts`; konsol mengimpor ketiga ikon skill langsung dari berkas PNG lewat `admin/kelas/ikon-kelas.ts`. Kotak teropong dan karcis (T-07, T-08) tidak dipakai (JS-18). Efek suara `sfx_kotak` dan `sfx_skill` belum ada (JS-14).

## Keamanan dan privasi

- Server berwenang atas muatan, masa aktif, kotak, sasaran Kompas, dan pilihan yang dicoret (AGENTS 7 butir 2). Layar pemain hanya menampilkan dan meminta; kecepatan lari tetap diperiksa server dengan anggaran jarak.
- Layar pemain tidak bisa mengklaim kotak dari jauh, karena `ambil_kotak` diabaikan dan kotak hanya diambil dari ruas gerak yang sudah diperiksa server.
- Kompas memperlihatkan letak satu titik kejadian per pemakaian, hanya kepada pemakainya (Architecture 12.1). Lokasi kejadian lain tetap hanya dikirim saat masuk pandangan.
- `opsiDicoret` memakai id pilihan acak per pemain, sehingga tidak membocorkan id asli, dan pilihan yang benar tidak pernah dicoret. Benih ruang tidak pernah dikirim.
- `pakai_skill` yang ditolak tidak dijawab (kecuali Kompas tanpa sasaran), sehingga pesan berulang tidak memperbesar lalu lintas keluar; pembatas frekuensi JS-03 tetap berlaku.
- `skillAktif` diperiksa zod dengan skema `strict` dan hanya menerima skill P0.
- Tidak ada data pribadi baru. Kolom CSV baru hanya mencatat pemakaian Petunjuk per kejadian, untuk admin dan guru pemilik ruang seperti CSV JS-11.

## Di luar cakupan

- Teropong dan Angkot, beserta kotak teropong dan karcis di `kampung.json` (JS-18, bersama Sesi C).
- Efek suara `sfx_kotak` dan `sfx_skill` (JS-14).
- Statistik pemakaian Petunjuk lintas ruang dan di dasbor (JS-13).
- Nilai bawaan skill di pengaturan umum (JS-19).
- Mengubah skill sesudah ruang dibuat (usulan 11b).
- Pemakaian skill di rekap pribadi dan di layar kelas.
- Penanda kotak dan sasaran Kompas di peta mini dan peta besar.
- Daftar "Kejadian terdekat" untuk pembaca layar (JFR-13, P1).
- Penimbangan ulang nilai skill PRD 8.5 sesudah uji coba kelas (JS-16).

## DRAF untuk ditinjau pemilik proyek

- **D-1. Memakai lagi skill yang sedang aktif.**
  - (a, saran) Lari cepat dan Kompas tidak bisa dipakai lagi selama masih aktif. Tombolnya bercincin `sun` dan tampak nonaktif sampai skill selesai, dan server menolak pemakaiannya (P-2). Muatan siswa tidak terbuang karena tombol ditekan dua kali, dan sasaran Kompas tidak berganti di tengah jalan.
  - (b) Boleh dipakai lagi sesudah jeda 2 detik, sesuai aturan JS-02 yang sudah ada: masa aktif dimulai lagi dari awal tanpa ditambahkan, dan Kompas memilih sasaran baru dari posisi saat itu. Sisa waktu pemakaian pertama hilang.

- **D-2. Pita bantuan muatan.**
  - (a, saran) Dua jenis pita tambahan yang dihitung layar pemain tanpa pesan server: menekan tombol skill tanpa muatan menampilkan tempat mencarinya ("Cari kotak sepatu.", "Cari kotak kompas.", atau "Cari kotak buku."), dan melewati kotak yang muatannya sudah penuh menampilkan "Lari cepat sudah penuh.", "Kompas sudah penuh.", atau "Petunjuk sudah penuh." sekali per kotak (P-43). Siswa mengenali sumber muatan dan batas 2 muatan tanpa penjelasan guru.
  - (b) Tanpa kedua pita: tombol tanpa muatan diam, kotak yang muatannya penuh dilewati tanpa tanda, dan tombol Petunjuk di luar dialog selalu menampilkan "Petunjuk dipakai di Langkah 1.". Lebih sederhana, tetapi siswa bisa mengira kotaknya rusak. Empat kunci teks `skill.cariLari`, `skill.cariKompas`, `skill.cariPetunjuk`, dan `skill.penuh` dihapus dari tabel teks, dan P-43 tidak dibangun.

- **D-3. Pilihan yang dicoret di pratinjau penyunting.**
  - (a, saran) Pilihan keliru pertama menurut urutan asli A sampai D, selalu sama. Penulis kejadian bisa memeriksa kalimat petunjuk dan tampilan coretan dengan hasil yang bisa diulang; di ronde, server memilih secara acak berbenih (P-6).
  - (b) Acak setiap kali Petunjuk ditekan sesudah "Ulang", agar penulis melihat bahwa pilihan yang dicoret bisa berbeda. Hasilnya tidak bisa diulang di uji.

## Kriteria penerimaan

- [ ] AC-1 **Aturan inti.** P-1 sampai P-5 diuji unit: kotak pada jarak 12 piksel terambil dan pada 12,01 piksel tidak; ruas sepanjang 0; toleransi lari tepat 500 ms berlaku dan 501 ms tidak; seri sasaran diputus kode lalu id titik; kejadian selesai dilewati; skill berdurasi yang sedang aktif ditolak (sesuai D-1); `pakaiSkill` dan `tambahMuatanKompas` tidak berubah; uji kemurnian `inti/` tetap lulus.
- [ ] AC-2 **Pilihan yang dicoret.** P-6: selalu salah satu pilihan keliru, sama untuk benih, pemain, dan kejadian yang sama, dan ketiga pilihan keliru muncul di antara 300 pemain.
- [ ] AC-3 **Skill per ruang.** P-7 sampai P-10: kelompok "Skill" di dialog Ruang baru (tiga kotak centang tercentang, target ≥ 48 px, ikon, keterangan, dan `skillAktif` menurut urutan P-1 di permintaan); `POST /api/ruang` menjawab 400 `ISI_SALAH` untuk Teropong, Angkot, duplikat, dan bukan larik, dan memakai ketiga skill bila isian tidak ada; `selamat_datang` membawa skill yang dipilih; baris "Skill" di kepala ruang dan di ringkasan hasil, tidak ikut dicetak, dan cetakan 40 pemain JS-11 tetap satu halaman A4.
- [ ] AC-4 **Keadaan dan `pribadi`.** P-11 dan P-13: muatan 0 saat ronde mulai dan bagi pemain terlambat; isi `pribadi` lolos skema, dengan `aktifSampai` dan `siapPada` dalam jam server menurut rumus P-13; `pribadi` dikirim pada setiap perubahan P-13 dan tidak dikirim untuk skill yang habis karena waktu atau kotak yang muncul lagi.
- [ ] AC-5 **Jeda, sambung ulang, dan pemulihan.** P-12 dan P-20 butir 2: jeda N detik menggeser `aktifSampai`, `berakhirPada`, dan `siapPada` sebesar N detik (uji unit tepat; uji server dalam 100 ms); skill tidak tampak berakhir di layar pemain saat `lanjut`; sambung ulang mempertahankan semuanya dan mengirim `kompas` lagi; `pulihkanKeadaan` dari baris `skill` dan `petunjuk` menghasilkan keadaan yang sama; ruang tanpa baris skill pulih dengan muatan 0.
- [ ] AC-6 **Penyimpanan.** P-14: kedua tabel dibuat dengan `IF NOT EXISTS`; setiap perubahan P-14 menulis tepat satu baris `skill` (dan Petunjuk satu baris `petunjuk` serta satu baris antrean), diuji dari keluaran inti ruang; skill yang habis karena waktu tidak menulis.
- [ ] AC-7 **Mengambil kotak.** P-15 sampai P-17: keempat syarat P-16; dua kotak dalam satu ruas; kotak dengan muatan penuh tetap siap; tidak ada pengambilan di lobi, hitung mundur, gerak yang ditolak, `koreksi`, dan `pindahkan`; urutan `pribadi` lalu `pemberitahuan`; `ambil_kotak` diabaikan tanpa pelanggaran.
- [ ] AC-8 **Kotak di layar pemain.** P-18: hanya di `main` dan `jeda` dan hanya untuk skill aktif; letak dan urutan lapisan; pop hanya untuk kotak yang muncul lagi; kilau saat diambil; diam selama jeda; tanpa pop dan kilau saat kurangi gerak; tidak ada di peta; `data-kotak` benar.
- [ ] AC-9 **Lari cepat.** P-19 sampai P-23: server mengatur masa aktif 6 detik dan memeriksa gerak dengan kecepatan lari sampai 500 ms sesudahnya; layar pemain berlari hanya antara tibanya `pribadi` dan `aktifSampai`, dan berlanjut sesudah sambung ulang; di uji ujung ke ujung, jarak tempuh 2 detik saat berlari sedikitnya 1,4 kali jarak tempuh berjalan, dengan `data-lari` benar; langkah 12 fps dan debu untuk diri sendiri dan untuk pemain lain di atas ambang P-23, dan tidak di bawahnya.
- [ ] AC-10 **Kompas.** P-24 sampai P-26: sasaran termasuk kejadian yang belum terlihat dan kedua titik di ruang lebih dari 50 pemain; `kompas` lalu `pribadi`; tanpa sasaran tidak mengubah muatan dan memunculkan pita; berakhir karena waktu dan karena tiba; sasaran baru saat kejadiannya dijawab di titik lain; panah dengan arah 8, ukuran 14 × 14 piksel logis, di dalam kotak aman di dunia 610 × 343, 640 × 360, 960 × 540, dan 1280 × 720, tersembunyi saat sasaran tampak, berdenyut, dan diam saat kurangi gerak; `data-kompas` benar; sasaran tidak tampil di peta.
- [ ] AC-11 **Petunjuk.** P-27 sampai P-31: tombol hanya di tampilan P-27, dengan keempat statusnya; kaki dialog satu baris dengan tombol 48 px di keempat ukuran dunia; syarat server dan isi `petunjuk`; sekali per kejadian; kotak petunjuk di mode penuh dan ringkas; pilihan yang dicoret tidak bisa dipilih lewat ketuk, klik, angka, maupun Enter, dan dilepas bila sedang terpilih; fokus dan pengumuman; dikirim ulang saat dialog dibuka ulang sebelum Langkah 1 dikunci; skor dan rekap tidak berubah; luapan isi tampilan `pilihan1` di dunia 610 × 343 paling banyak 32 px dengan kaki tetap terlihat, dan 0 di ukuran lain.
- [ ] AC-12 **+1 Kompas.** P-32: tambahan hanya untuk tingkat tepat dengan Kompas aktif dan muatan kurang dari 2; urutan `hasil_2`, `pemberitahuan`, `pribadi`; "+1 Kompas" di kepala kartu dan pengumumannya; tanpa tulisan bila muatan penuh atau Kompas mati.
- [ ] AC-13 **Tombol skill.** P-33 sampai P-36: syarat tampil; letak lengkung di perangkat sentuh dan kolom bertanda `1` `2` `3` di laptop; di HP 731 × 411 (rasio 2,625), HP 640 × 360, HP dengan bilah peramban 915 × 356, dan laptop 1280 × 720, kotak tombol dan lencana tidak bertumpuk dengan peta mini, bilah atas, Periksa, ajakan "E Periksa", atau satu sama lain, berjarak sedikitnya 8 px, dan setiap tombol berukuran sedikitnya 48 × 48 px; keenam status P-36 dengan atributnya.
- [ ] AC-14 **Menekan tombol dan papan ketik.** P-37 dan P-38: hasil keempat jenis tekanan; `1`, `2`, dan `3` di luar dialog; tekanan ditahan diabaikan; angka di dalam dialog tetap memilih jawaban; Petunjuk dicapai dengan `Tab` lalu `Enter`.
- [ ] AC-15 **Aksesibilitas.** P-39 dan P-40: label tombol dan `aria-keyshortcuts`; pengumuman P-39 berjarak sedikitnya 2 detik; pita skill tanpa `role="status"`; kurangi gerak mematikan debu, pop, kilau, denyut panah, dan blok jeda yang menyusut; permainan dengan ketiga skill bisa dimainkan hanya dengan papan ketik di laptop.
- [ ] AC-16 **Pita.** P-41 sampai P-43 (sesuai D-2): teks; lebar luar paling besar lebar HUD dikurangi 256 px dan berjarak sedikitnya 4 px dari peta mini di HUD selebar 610, 640, 960, dan 1280 px; dua baris untuk teks panjang; antrean, butir ganda, dan pita yang dibuang selama dialog; "Dua menit lagi" tetap tampil seperti JS-07.
- [ ] AC-17 **Pratinjau penyunting.** P-44 (sesuai D-3): "Petunjuk (2)", kalimat dan coretan, "Petunjuk dipakai", kalimat kosong, dan "Ulang".
- [ ] AC-18 **Hasil dan CSV.** P-45 sampai P-47: `jawaban.petunjuk_dipakai` bernilai 1 di D1 untuk jawaban yang Petunjuknya dipakai dan 0 untuk yang lain; tanda "Petunjuk" di rincian; kolom ke-18 "Ya" atau "Tidak"; ke-17 kolom lama dan CSV peserta sama dengan JS-11.
- [ ] AC-19 **Skill yang dimatikan.** P-10: ruang tanpa Petunjuk tidak menampilkan tombol Petunjuk di HUD dan dialog serta tidak menggambar kotak buku; ruang tanpa skill tidak menampilkan HUD skill dan kotak, mengabaikan `pakai_skill`, dan tidak memberi +1 Kompas.
- [ ] AC-20 **Dasbor dan uji ujung ke ujung.** P-48 dan P-49: tautan kartu dasbor setinggi sedikitnya 48 px (uji target JS-04); seluruh `test:e2e:jejak` lulus dalam satu perintah, dan sesudahnya tidak ada ruang buatan uji yang belum ditutup.
- [ ] AC-21 **Teks.** Isi `TEKS.skill`, `TEKS_KONSOL.skill`, dan `TEKS_KONSOL.csv.petunjuk` sama dengan bagian "Teks yang tampil (final)" (sesuai D-2), dan uji teks fitur lain mengecualikan kunci JS-09 dengan cara yang sama seperti kunci JS-11 dan JS-12.
- [ ] AC-22 **Protokol dan kompatibilitas.** P-52: `PROTOKOL_VERSI` tetap 2; setiap pesan server yang dikirim di uji unit dan uji server lolos skema `inti/protokol.ts`; layar pemain mengabaikan kode `pemberitahuan` yang tidak dikenal; ruang yang dibuat sebelum tabel baru ada (keadaan pulih tanpa baris `skill`) tetap berjalan.
- [ ] AC-23 **Ukuran dan kinerja.** P-51: kode layar pemain naik paling banyak 4 KB gzip dan gaya paling banyak 0,6 KB; konsol di bawah 350 KB gzip dengan aturan impor yang sama; waktu server P-51 tercatat dan memenuhi Architecture 13.1; ambang kinerja JS-08 P-69 untuk CPU normal tetap terpenuhi di HP 731 × 411 saat avatar berlari dengan panah Kompas tampil dan sedikitnya satu kotak di pandangan.
- [ ] AC-24 **Beban.** P-50: `sim:beban` 1 ruang × 50 bot dengan `--detik 180`, sekali tanpa tunda dan sekali dengan `--latensi-ms 80 --jitter-eksp-ms 40`: tanpa putus tak terduga dan tanpa galat; ketiga jenis kotak masing-masing terambil dan ketiga skill masing-masing dipakai sedikitnya 10 kali per ruang; gerak yang dikoreksi 0 tanpa tunda dan paling banyak 0,05% dengan tunda; lalu lintas turun per pemain paling banyak 3 MB per 15 menit; ukuran rata-rata `pribadi` serta baris tulis SQLite ruang dan D1 tercatat.
- [ ] AC-25 **Tangkapan layar.** Di `docs/jejak-setara/tests/JS-09/`: HUD dengan ketiga tombol (bermuatan, tanpa muatan, aktif) di HP 731 × 411, HP 640 × 360, HP dengan bilah peramban 915 × 356, dan laptop 1280 × 720; kotak bantuan dan pita "+1 Lari cepat"; panah Kompas; dialog dengan Petunjuk dipakai di mode ringkas (HP) dan mode penuh (laptop); kartu dampak dengan "+1 Kompas"; dialog Ruang baru dan hasil dengan baris "Skill" di 1280 × 720; serta layar kelas 1024 × 768 dan 1920 × 1080 (tanpa perubahan, AGENTS 4.4).
- [ ] AC-26 **Tanpa regresi dan dokumen.** Semua uji JS-01 sampai JS-22 lulus (uji CSV dan hasil JS-11 hanya diubah untuk kolom dan tanda baru); `build:pages` menghasilkan 178 berkas yang identik byte dengan `main` sebelum Build; Architecture, Design System, dan PRD diubah sesuai bagian "Data, protokol, API, dan migrasi"; `PLAN.md` diperbarui.

## Rencana uji

### Uji unit (`test:jejak`)

- `__tests__/skill/aturan-skill.test.ts` (baru): fungsi P-1 sampai P-5 beserta batasnya, dan syarat D-1 di `bolehPakaiSkill` (AC-1).
- `__tests__/skill/skill-ruang.test.ts` (baru): modul `skill-ruang.ts`: kotak dari ruas dengan keempat syarat, dua kotak, dan muatan penuh; pakai Lari cepat, Kompas, dan Petunjuk; sasaran dan tiba Kompas; pilihan yang dicoret (AC-2); waktu ronde ke jam server; `isi_json` bolak-balik.
- `__tests__/skill/inti-ruang-skill.test.ts` (baru): inti ruang dengan jam tiruan: gerak yang mengambil kotak beserta urutan pesannya, status lain, gerak yang ditolak, dan `pindahkan`; `periksaGerak` dengan lari di batas toleransi; akhir Kompas karena waktu, tiba, dan sasaran yang dijawab di titik kedua ruang 80 pemain; Petunjuk dengan syaratnya, dialog dibuka ulang, dan baris D1; +1 Kompas; jeda dan `lanjut`; sambung ulang; `pulihkanKeadaan` dengan dan tanpa baris skill; ruang tanpa skill dan dengan sebagian skill; jumlah `simpan` per perubahan (AC-4 sampai AC-7, AC-9 sampai AC-12, AC-19).
- `__tests__/skill/klien-skill.test.ts` (baru): modul `pemain/dunia/skill.ts`: waktu efektif dan pergeseran saat `lanjut`; status tombol dan hasil tekanan; kotak yang tergambar dengan pop dan kilau; panah (arah, bingkai, dan letak di kotak aman untuk keempat ukuran dunia); ambang lari pemain lain; pita D-2 dan antrean pita (AC-8 sampai AC-10, AC-13, AC-14, AC-16).
- `__tests__/skill/dialog-petunjuk.test.ts` (baru): `dialogKeadaan.ts`: tombol kaki per tampilan dan statusnya; pilihan yang dicoret ditolak `pilih` dan `pilihNomor`; pilihan terpilih dilepas; fokus awal; Petunjuk yang dikirim ulang; pratinjau (AC-11, AC-17).
- `__tests__/skill/ruang-baru-skill.test.ts` (baru): `skemaRuangBaru` dan `skemaRingkasanRuang` dengan `skillAktif`, serta pembacaan `pengaturan_json` yang rusak atau berisi skill bukan P0 (AC-3).
- Uji hasil dan CSV JS-11 diperbarui: kolom ke-18, `petunjukDipakai` di rincian, dan ke-17 kolom lama tidak berubah (AC-18).
- `kerangka.test.ts`: teks JS-09 dari tabel spesifikasi ini, pengecualian kunci JS-09 di uji teks fitur lain, dan aturan impor konsol (AC-21, AC-23).

### Uji server (`test:jejak:server`, baru `server/jejak-setara/uji/skill.uji-server.ts`)

- Ruang uji dengan ketiga skill: dua pemain bergabung dan ronde dimulai lewat layar kelas. Pemain A dipindah dengan kait `pindahkan` ke samping kotak sepatu, lalu mengirim gerak melewatinya: `pribadi` dengan muatan Lari cepat 1 dan `pemberitahuan` `kotak_lari`. A memakai Lari cepat dan mengirim gerak berkecepatan lari selama 6 detik tanpa `koreksi`.
- A mengambil kotak kompas dan memakai Kompas: `kompas` sama dengan sasaran yang dihitung dari kait `kejadian`; sesudah A dipindah ke dekat sasaran, `pribadi` tanpa `aktifSampai.kompas` tiba di putaran berikutnya.
- A mengambil kotak buku, membuka kejadian, dan memakai Petunjuk: `petunjuk` dengan kalimat bank awal dan pilihan keliru; dialog ditutup dan dibuka lagi, lalu `petunjuk` yang sama tiba lagi tanpa muatan berkurang; Langkah 1 dan Langkah 2 dikunci dengan pilihan tepat (teks dari `bank-awal.json`): `pemberitahuan` `kompas_tepat` dan muatan Kompas bertambah; sesudah ronde diakhiri, D1 berisi `petunjuk_dipakai` 1 untuk jawaban itu dan 0 untuk jawaban B.
- Jeda 3 detik saat Kompas aktif, lalu `lanjut`: `berakhirPada` di `pribadi` bergeser sekitar 3 detik (toleransi 100 ms).
- Sambung ulang dengan token: muatan, `aktifSampai`, dan `kotakMenunggu` sama, lalu `kompas` tiba lagi.
- Ruang tanpa skill dan ruang tanpa Petunjuk: kotak yang dilewati dan `pakai_skill` tidak mengubah `pribadi`, dan jawaban tepat tidak memberi +1 Kompas di ruang tanpa skill.
- `POST /api/ruang` dengan `skillAktif` tidak sah: 400 `ISI_SALAH`; detail ruang dan hasil membawa `skillAktif`; CSV jawaban memuat kolom ke-18.
- Uji server JS-03 sampai JS-22 tetap lulus.

### Uji ujung ke ujung (`test:e2e:jejak`, baru `e2e/jejak-setara/skill.uji.ts`)

- HP (emulasi sentuh 731 × 411, rasio 2,625) dan laptop (1280 × 720) di ruang yang sama: HUD tampil saat ronde berjalan; pemain dipindah ke dekat kotak lalu berjalan melewatinya dengan papan ketik; pita "+1 Lari cepat" dan lencana 1; Lari cepat dengan tombol (HP) dan tombol `1` (laptop), dengan `data-lari` dan jarak tempuh (AC-9); Kompas dengan `data-kompas`, lalu berakhir saat pemain dipindah ke dekat sasaran; Petunjuk di dialog dengan kotak petunjuk, pilihan yang dicoret, dan "Petunjuk dipakai", lalu jawaban tepat dengan "+1 Kompas" di kartu; ukuran dan jarak tombol, lencana, dan pita di keempat ukuran AC-13.
- Ruang tanpa Petunjuk dan ruang tanpa skill (AC-19).
- Konsol: kelompok "Skill" di dialog Ruang baru dan target 48 px; baris "Skill" di kepala ruang dan hasil, tidak tampil di media cetak; tanda "Petunjuk" di rincian; unduh CSV jawaban dengan kolom "Petunjuk dipakai".
- Pratinjau penyunting: "Petunjuk (2)" menjadi "Petunjuk dipakai" dengan coretan pilihan keliru pertama, lalu "Ulang" (AC-17).
- Kinerja: ambang JS-08 P-69 untuk CPU normal saat berlari dengan panah dan kotak tampak (AC-23).
- Dasbor: tinggi tautan kartu (AC-20). Semua berkas uji yang membuat ruang menutupnya di `test.afterAll`, dan seluruh uji dijalankan dalam satu perintah.
- Tangkapan layar AC-25.

### Beban dan ukuran

- `sim:beban` 1 ruang × 50 bot, `--detik 180`, tanpa tunda dan dengan `--latensi-ms 80 --jitter-eksp-ms 40` (AC-24).
- Ukuran kode layar pemain, gaya, konsol, dan Worker dibandingkan dengan `main` sebelum Build (AC-23).
- Waktu server P-51 diukur di Node (median 20 kali) dan dicatat di laporan uji. Pengukuran ini tidak menjadi uji otomatis, karena waktunya bergantung pada mesin yang menjalankannya.

### Manual (AGENTS 9) dan lingkungan uji

Langkah pemilik proyek sesudah ZIP Build di-push:

1. Pastikan "Jejak: uji" hijau.
2. Buat ruang uji dengan ketiga skill, lalu jalankan satu ronde pendek dengan dua atau tiga HP.
3. Ambil kotak sepatu, lalu pakai Lari cepat; perhatikan avatar berlari sekitar 6 detik.
4. Ambil kotak kompas, lalu pakai Kompas dan ikuti panahnya sampai tiba di kejadian.
5. Jawab satu kejadian dengan pilihan "tepat" di Langkah 2, lalu periksa "+1 Kompas" di kartu dampak.
6. Ambil kotak buku, lalu pakai Petunjuk di Langkah 1 dan periksa kalimat petunjuk serta pilihan yang dicoret.
7. Akhiri ronde, buka hasil ruang itu di konsol, lalu buka CSV jawaban di Excel dan periksa kolom "Petunjuk dipakai" (Ya untuk kejadian yang Petunjuknya dipakai).
8. Tutup ruang itu, lalu buat ruang lagi dengan Petunjuk dimatikan, dan pastikan tombol Petunjuk serta kotak buku tidak tampil.
9. Kirim tangkapan layar HUD skill di HP, dialog dengan Petunjuk, dan CSV di Excel.

Butir daftar periksa AGENTS 9 yang relevan: permainan tetap lancar di HP Android kelas bawah saat berlari dan saat panah Kompas tampil; permainan dengan ketiga skill bisa dimainkan hanya dengan papan ketik di laptop; kurangi gerak mematikan debu, pop, kilau, dan denyut panah; HP menyambung kembali sesudah wifi dimatikan 30 detik dengan muatan yang sama; dan tidak ada nama asli siswa di layar, berkas ekspor, maupun log.

## Catatan Build

Dicatat saat Build JS-09 (21 November 2026). Perilaku dan teks spesifikasi tidak berubah; catatan ini merinci tempat kode, beberapa keputusan kecil, dan koreksi atas pengukuran Specify.

- **Server ruang.**
  - `KOTAK_KAMPUNG` di `peta-kampung.ts` diurutkan menurut id, sehingga dua kotak yang terambil dalam satu ruas selalu diproses dengan urutan yang sama (P-16).
  - `kotakMenunggu` di `pribadi` dibatasi 24 butir (`KOTAK_MENUNGGU_MAKS`, sama dengan jumlah kotak di peta); skema protokol mengizinkan 64.
  - Pemilihan pilihan yang dicoret memakai `acakBerbenih(benih(benihRuang, pemainId, kode, "petunjuk"))`, sehingga urutannya terpisah dari pengacakan urutan pilihan JS-08 (P-6).
- **Layar pemain.**
  - Daftar kotak layar pemain (`KOTAK_PETA`) dibaca langsung dari `kampung.json` tanpa diurutkan ulang; uji unit memastikan isinya sama dengan `KOTAK_KAMPUNG` server.
  - Pengumuman "{skill} aktif selama {n} detik." dan "{skill} selesai." dihitung dari perubahan status tombol di setiap bingkai (`periksaWaktu`), sehingga juga berlaku untuk skill yang selesai karena waktu, tiba, atau kehabisan sasaran tanpa pesan server (P-39).
  - Pita skill masuk antrean `AntreanPita` (`pemain/dunia/skill.ts`) hanya bila tidak ada dialog yang terbuka; pita "Dua menit lagi" masuk antrean yang sama, tetap tampil selama dialog, dan tetap ber-`role="status"` (P-41).
  - Kelompok tombol skill (`.js-skill`) tidak berukuran sendiri, karena setiap tombol diletakkan mutlak terhadap HUD. Uji memeriksa tampilnya tombol, bukan kelompoknya.
- **Pengukuran ukuran dunia (koreksi Specify).** HP 731 × 411 dengan rasio 2,625 menampilkan dunia skala 6 (731 × 411 px, terpotong kurang dari 1 px), bukan 610 × 343 seperti tertulis di P-29 butir 2 dan catatan Specify. Dunia 610 × 343 tampil di HP 640 × 360 dengan rasio 2,625 dan di HP dengan bilah peramban 915 × 356. Karena itu, uji ujung ke ujung memakai HP 640 × 360 dengan rasio 3 untuk dunia 640 × 360, dan HP 915 × 356 untuk dunia 610 × 343. Batas luapan AC-11 tetap: paling banyak 32 px di dunia 610 × 343 (terukur 6 px untuk kejadian yang diuji) dan 0 di ukuran lain (terukur 0 px di 731 × 411, 640 × 360, 960 × 540, dan 1280 × 720).
- **Pembaca layar pilihan yang dicoret.** Nama aksesibel di Chromium menjadi "{huruf}. {teks} , dicoret Petunjuk", karena Chromium menyisipkan spasi di antara dua teks tersembunyi; pembaca layar membacanya sama dengan P-29 butir 3, jadi kodenya tidak diubah.
- **Uji ujung ke ujung (P-49).**
  - `tutupRuangBerkas` di `ruang-uji.ts` dipasang di `test.afterAll` setiap berkas uji yang membuat ruang. Kait itu membuat konteks permintaan sendiri, karena fixture `request` Playwright hanya ada per uji.
  - Agar seluruh uji lulus dalam satu perintah, `konsol.uji.ts` kini menghitung jumlah akun dari keadaan awal halaman Akun (uji lain sudah membuat akun di D1 lokal yang sama), dan nama tampilan admin uji di `hasil.uji.ts`, `kelas.uji.ts`, dan `skill.uji.ts` tidak lagi "Bu Sari", agar baris akun guru Bu Sari di `konsol.uji.ts` tetap satu.
  - Jarak tempuh Lari cepat (AC-9) diukur dengan menahan panah kanan 3 detik, bukan 2 detik, agar bingkai yang terlambat di mesin uji tidak banyak memengaruhi rasionya. Rasio terukur 1,63–1,65 (teori 1,6; batas 1,4).
  - Jarak tombol (AC-13) dihitung dengan bentuk sebenarnya: tombol skill dan Periksa sebagai lingkaran, lencana, tanda tombol, peta mini, bilah atas, dan ajakan "E Periksa" sebagai persegi.
- **Simulasi beban (P-50).** Bot yang memakai Kompas berjalan ke ubin di bawah titik sasaran (atau ke titiknya bila ubin itu tidak tercapai), lalu menemukan kejadiannya lewat `kejadian_terlihat` seperti JS-08. Pemakaian skill dihitung dari muatan `pribadi` yang berkurang, sehingga pemakaian Kompas juga mencakup muatan dari jawaban "tepat" (dicatat terpisah sebagai `kompasTepat`). Ringkasan mendapat baris D1 yang ditulis per ruang (`pemakaian.barisD1`).
- **Ukuran (AC-23).** Kode layar pemain naik 4,64 KB gzip dari `main` sebelum Build, di atas batas 4 KB. Garis dasarnya 122,46 KB, diukur dari build `main` sesudah commit 2c559b1; P-51 menulis 122,24 KB, angka dari laporan JS-11. Rincian kenaikan dan pilihan untuk pemilik proyek ada di laporan uji, bagian "Temuan".
