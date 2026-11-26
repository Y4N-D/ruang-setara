# JS-18 — Teropong dan Angkot

Status: **Menunggu persetujuan (26 Nov 2026)**, `Spesifikasi disetujui: JS-18`. Dasar: Plan lanjutan JS-18 di `PLAN.md` (`Setuju: JS-18`, usulan 1 sampai 14 = a, 26 Nov 2026), Gerbang 1 rencana v1.1 (usulan 7a dan 8a; KT-16 sampai KT-18 = a), spesifikasi JS-09 (skill dan kotak), JS-07 (peta besar), JS-23 (peta bermedan), dan JS-10 (peta kelas), serta letak tujuh kotak PC-2 (Disetujui 26 Nov 2026; isi `PC-2-kotak.zip` diperiksa 26 Nov 2026).

## Ringkasan

JS-18 menghidupkan dua skill P1 yang aturannya sudah ada di `inti/aturan.ts` sejak JS-02: Teropong dan Angkot. Peta mendapat tujuh kotak dari Sesi C, yaitu tiga kotak teropong di pantai Z6 dan satu kotak karcis di dekat setiap halte, sehingga ada 31 kotak. Teropong (muatan 1) selama 30 detik mengungkap titik kejadian yang belum selesai dalam radius 12 ubin dari pemain lewat jalur keterlihatan JS-08, dengan lingkaran radius di peta mini dan peta besar. Angkot (muatan 1) hanya dipakai di halte: tombolnya menyala saat pemain dekat halte, tujuan dipilih di peta besar mode "Pilih halte tujuan", dan server memindahkan pemain seketika. Pemain lain dan layar kelas melihat perpindahan itu seketika, tanpa avatar yang tertinggal di halte asal dan tanpa titik yang meluncur.

HUD memuat lima tombol: di perangkat sentuh Teropong dan Angkot membentuk baris bawah di kiri Petunjuk, dan di laptop satu kolom `1` sampai `5`, atau dua kolom bila dunia terlalu pendek. Kotak aman panah Kompas disesuaikan. Guru memilih kelima skill per ruang di konsol. Protokol naik ke versi 6 karena `pakai_skill` membawa `halteId`. Tanpa migrasi D1 dan tanpa aset baru.

## Kaitan PRD

| Kebutuhan | Dipenuhi oleh |
|---|---|
| JFR-25 Teropong dan Angkot (ditulis ulang di ZIP ini) | P-14 sampai P-26, P-32 sampai P-34 |
| JFR-26 Skill per ruang, kini lima | P-6 sampai P-9 |
| JFR-23 Kotak bantuan: kotak teropong dan karcis | P-10 sampai P-13 |
| PRD 8.5 (ditulis ulang di ZIP ini) dan 9 | P-10, P-14 sampai P-22 |
| KT-16 a, KT-17 a, dan KT-18 a | P-14 sampai P-23 |
| PRD 17 (versi 1.1) | Seluruh dokumen |
| Design System 3.3, 3.4, 9, 10, dan 13 | P-18 sampai P-21, P-27 sampai P-34 |
| Architecture 6.2, 6.3, 8.2, 8.5, 9, dan 10.9 | P-14 sampai P-26, P-40 |
| Permintaan C-19 Sesi C | P-10 dan P-41 |
| Catatan Plan JS-18 dari JS-09 dan JS-23 | P-27 sampai P-29, P-32 sampai P-34 |

## Berkas

| Berkas | Jenis | Isi |
|---|---|---|
| Isi `PC-2-kotak.zip` (11 berkas Sesi C) | Diubah, disalin apa adanya | `objek.json`, `build_peta.py`, `kampung.json`, `kampung_gambar.json`, ketiga gambar medan bersidik baru, `peta-aturan.test.ts`, `specs/JS-06-peta.md`, `peta_periksa.png`, dan `peta_denah.png` (P-41) |
| `app/jejak-setara/inti/aturan.ts` | Diubah | `SKILL_URUT`, halte, radius Teropong, dan `melompat` (P-1 sampai P-5) |
| `app/jejak-setara/inti/protokol.ts` dan `inti/versi.ts` | Diubah | `halteId` pilihan di `pakai_skill` dan `PROTOKOL_VERSI` 6 (P-40) |
| `app/jejak-setara/inti/ruang.ts` | Diubah | `skillAktif` lima skill (P-7) |
| `server/jejak-setara/src/ruang/skill-ruang.ts` | Diubah | Isi `pribadi` kelima skill, `KOTAK_MENUNGGU_MAKS` 31, Teropong, dan Angkot (P-10, P-14, P-22) |
| `server/jejak-setara/src/ruang/inti-ruang.ts` | Diubah | `pakai_skill` Teropong dan Angkot, pengungkapan Teropong di putaran, pindah halte, dan butir perpisahan (P-14 sampai P-16, P-22, P-23) |
| `server/jejak-setara/src/ruang/peta-kampung.ts` dan `peta-uji.ts` | Diubah | Halte dari `kampung.json` dan komentar 31 kotak (P-10, P-22) |
| `server/jejak-setara/src/api/ruang.ts` | Diubah | Lima skill di permintaan dan ringkasan (P-7) |
| `app/jejak-setara/pemain/dunia/skill.ts` | Diubah | Status tombol lima skill, jangkauan halte, susunan kolom laptop, dan kotak aman (P-18, P-27 sampai P-30) |
| `app/jejak-setara/pemain/TombolSkill.tsx` | Diubah | Lima tombol, tanda `1` sampai `5`, ikon, dan `data-dekat` (P-18, P-27 sampai P-30) |
| `app/jejak-setara/pemain/PetaBesar.tsx` dan `PetaMini.tsx` | Diubah | Mode "Pilih halte tujuan" dan lingkaran Teropong (P-21, P-32 sampai P-34) |
| `app/jejak-setara/pemain/LayarDunia.tsx` dan `App.tsx` | Diubah | Tombol `4` dan `5`, mode pilih halte, pita, pengumuman, dan bunyi (P-19 sampai P-21, P-35 sampai P-37) |
| `app/jejak-setara/pemain/dunia/pemainLain.ts` dan `mesin.ts` | Diubah | Butir yang melompat dan tanda bingkai pertama di posisi baru (P-21, P-24) |
| `app/jejak-setara/pemain/dunia/petaKampung.ts` | Diubah | Komentar 31 kotak (P-41) |
| `app/jejak-setara/teks.ts` dan `teks-konsol.ts` | Diubah | Teks bagian "Teks yang tampil (final)" |
| `app/jejak-setara/styles/jejak.css` | Diubah | Letak lima tombol, kolom kedua laptop, tombol Angkot dekat halte, mode pilih halte, dan lingkaran (P-21, P-27 sampai P-33) |
| `app/jejak-setara/admin/halaman/Ruang.tsx` dan `admin/kelas/ikon-kelas.ts` | Diubah | Lima kotak centang dan teks skill (P-6, P-8) |
| `app/jejak-setara/admin/kelas/PetaKelas.tsx`, `tampilan-kelas.ts`, dan `styles/kelas.css` | Diubah | Titik yang melompat tanpa transisi (P-25) |
| `scripts/jejak-setara/simulasi-beban.mjs` | Diubah | Bot Teropong dan Angkot (P-38) |
| Uji | Baru dan diubah | Bagian "Rencana uji", termasuk C-19 |
| `docs/jejak-setara/tests/JS-18-hasil.md` dan `tests/JS-18/` | Baru | Laporan dan tangkapan layar Test |

Dokumen utama yang diubah di ZIP Gerbang 2: PRD JFR-25, 8.5, 9, dan 21; Design System 3.3, 3.4, 9, 10, dan 13; Architecture 6.3, 8.2, 8.5, 9, dan 10.9. Architecture 6.2 (versi 6) diubah saat Build bersama `inti/versi.ts`.

Tidak disentuh: migrasi D1, `package.json`, lockfile, alur kerja, `wrangler.jsonc`, `manifest.ts`, `CREDITS.md`, aset, berkas Sesi B, Sehari Setara, dan galeri. Berkas Sesi C di luar isi `PC-2-kotak.zip` tidak berubah.

## Perilaku

### A. Aturan bersama di `inti/`

- **P-1. Urutan lima skill.** `SKILL_URUT = ["lari", "kompas", "petunjuk", "teropong", "angkot"]` di `inti/aturan.ts` menjadi urutan tampil di HUD, tanda tombol papan ketik (`1` sampai `5`), dialog Ruang baru, detail ruang, dan hasil. `SKILL_P0` tetap ada untuk tiga skill P0 (kolom kanan laptop, P-28).
- **P-2. Halte.** `JANGKAUAN_HALTE_KLIEN_PX = 24` dan `JANGKAUAN_HALTE_PX = 32` (24 + 8, seperti Periksa). `halteDekat(pos, daftar, batasPx)` mengembalikan halte yang pusat ubinnya (16x + 8, 16y + 8) paling dekat dengan titik kaki `pos` dan berjarak paling jauh `batasPx` piksel, atau null; seri diputus id terkecil. `titikHalte(h)` adalah titik kaki di ubin halte, (16x + 8, 16y + 12). Nomor halte adalah urutannya di `kampung.json`, sama dengan angka di id (`halte-1` sampai `halte-4`).
- **P-3. Radius Teropong.** `RADIUS_TEROPONG_PX = 192` (12 ubin). `dalamTeropong(pos, titik)` benar bila jarak lurus titik kaki ke pusat ubin titik (16x + 8, 16y + 8) paling jauh 192.
- **P-4. Syarat memakai skill.** `bolehPakaiSkill` JS-09 berlaku untuk kelima skill. Teropong berdurasi 30 detik, jadi tidak bisa dipakai lagi selama aktif (D-1 a JS-09), sedangkan Angkot sekali pakai. Syarat halte Angkot diperiksa server di P-22.
- **P-5. Lompatan.** `melompat(a, b, dtMs)` benar bila jarak lurus dua posisi (piksel logis) lebih dari 64 + 144 × dtMs / 1000, yaitu lebih jauh daripada yang mungkin dengan Lari cepat (115,2 piksel per detik × 1,25) dan anggaran jarak. Untuk dua kiriman `dunia_kelas` yang berjarak 500 ms, ambangnya 136 piksel (8,5 ubin); dua halte terdekat berjarak sekitar 35 ubin.

### B. Skill per ruang

- **P-6. Dialog Ruang baru.** Kelompok "Skill" (JS-09 P-7) memuat lima kotak centang menurut urutan P-1, masing-masing dengan ikon 16 × 16 (`ikon_teropong` dan `ikon_karcis` ditambahkan ke `IKON_SKILL` di `admin/kelas/ikon-kelas.ts`) dan nama skill, semuanya tercentang setiap kali dialog dibuka. Susunannya membungkus ke baris berikutnya bila tidak muat, dan setiap target setinggi sedikitnya 48 px.
- **P-7. API.** `skemaRuangBaru.skillAktif` berupa larik tanpa duplikat dari kelima skill, paling banyak 5 butir; nilai lain, duplikat, dan isian yang bukan larik dijawab 400 `ISI_SALAH`. Permintaan tanpa `skillAktif` memakai kelima skill. `skillAktifRuang` membaca `pengaturan_json` menurut urutan P-1 dan membuang butir yang tidak dikenal; isian yang bukan larik menghasilkan kelima skill.
- **P-8. Konsol.** Baris "Skill" di kepala ruang dan ringkasan hasil menulis nama skill yang aktif menurut urutan P-1 (misalnya "Lari cepat, Kompas kejadian, Petunjuk, Teropong, Angkot"), atau "Tidak ada", dan tetap tidak dicetak.
- **P-9. Ruang lama.** Ruang yang dibuat sebelum JS-18 di-deploy menyimpan tiga skill P0, jadi tetap tanpa Teropong dan Angkot: kotaknya tidak digambar dan tidak bisa diambil, dan tombolnya tidak tampil (JS-09 P-10).

### C. Kotak teropong dan karcis

- **P-10. Peta 31 kotak.** Sesudah isi `PC-2-kotak.zip` masuk (P-41), `kampung.json` memuat 31 kotak: 9 sepatu, 6 kompas, 9 buku, 3 teropong (`k-z6-4` di (26, 7), `k-z6-5` di (51, 7), dan `k-z6-6` di (76, 7)), dan 4 karcis (`k-z3-4` di (57, 64), `k-z3-5` di (86, 88), `k-z7-4` di (107, 25), dan `k-z8-4` di (116, 75)). `KOTAK_MENUNGGU_MAKS` menjadi 31, sama dengan jumlah kotak peta.
- **P-11. Mengambil kotak.** Aturan JS-09 P-16 berlaku: kotak teropong menambah muatan Teropong dan kotak karcis menambah muatan Angkot, masing-masing paling banyak 1, bila skill itu aktif di ruang. Pemberitahuannya `kotak_teropong` dan `kotak_angkot`.
- **P-12. Kotak di dunia.** Seperti JS-09 P-18, dengan strip `tanda_kotak_teropong` dan `tanda_kotak_karcis` (14 × 12), hanya bila skillnya aktif di ruang. Kotak tidak ditandai di peta.
- **P-13. Pita penuh.** JS-09 P-43 berlaku dengan muatan penuh 1: "Teropong sudah penuh." dan "Angkot sudah penuh.".

### D. Teropong

- **P-14. Memakai Teropong.** Untuk pemakaian yang memenuhi P-4 dan JS-09 P-15, server mengurangi muatan Teropong 1, mencatat waktu pakai, menetapkan akhir masa aktif di waktu ronde sekarang + 30.000, menulis satu baris `skill`, lalu mengirim `pribadi` dengan `aktifSampai.teropong` dalam jam server (rumus JS-09 P-13). `isiPribadiSkill` kini mengirim muatan kelima skill, serta `aktifSampai` untuk Lari cepat, Kompas, dan Teropong yang masih aktif.
- **P-15. Pengungkapan di setiap putaran.** Di setiap putaran 100 ms status `main`, sesudah pemeriksaan keterlihatan JS-08, untuk setiap pemain tersambung yang punya posisi dan Teropong-nya aktif: setiap titik aktif kejadian yang belum `selesai` bagi pemain itu, belum terlihat olehnya, dan `dalamTeropong` dicatat lewat jalur keterlihatan JS-08 (tabel `terlihat`, `kejadian_terlihat`, dan `terlihat` di `pribadi`), menurut urutan kode kejadian lalu id titik. Radiusnya mengikuti posisi pemain di setiap putaran. Pemeriksaan pertama terjadi di putaran sesudah pemakaian. Di ruang lebih dari 50 pemain, kedua titik aktif ikut diperiksa.
- **P-16. Akhir Teropong.** Teropong berakhir hanya karena waktu, tanpa pesan dan tanpa menulis baris. Selama `jeda`, waktu ronde berhenti, jadi masa aktif tidak berkurang dan tidak ada pengungkapan. Sesudah menyambung ulang, `pribadi` membawa `aktifSampai.teropong` bila masih aktif, dan titik yang sudah terungkap dikirim ulang seperti kejadian terlihat lain (JS-08 P-12).
- **P-17. Teropong di layar pemain.** Teropong aktif selama `pribadi` terakhir memuat `aktifSampai.teropong` di depan waktu efektif (JS-09 P-20). Saat mulai: pengumuman "Teropong aktif selama 30 detik." dan `sfx_skill`; saat berakhir: "Teropong selesai." (JS-09 P-39). Kejadian yang terungkap tampil seperti kejadian yang baru terlihat (penanda di dunia saat masuk pandangan, di peta mini, dan di peta besar, serta pengumuman "Kejadian baru terlihat."), tanpa pita baru. Lingkarannya di P-32 dan P-33.

### E. Angkot

- **P-18. Tombol Angkot.** Selain status JS-09 P-36 yang berlaku untuk semua skill:
  - tanpa karcis: `mist`, lencana "0", dan `aria-disabled="true"`;
  - berkarcis, titik kaki lebih dari 24 px dari pusat ubin setiap halte: `cream`;
  - berkarcis dan dalam 24 px dari pusat ubin satu halte (`halteDekat` dengan batas klien): latar `sun` seperti Periksa dalam jangkauan, `data-dekat="ya"`, dan label "Angkot, 1 muatan, di halte";
  - menunggu jawaban (P-21 butir 5): bergeser 2 px seperti JS-09 P-36.
- **P-19. Menekan tombol Angkot.** Tanpa karcis: tidak ada pesan, dan pita "Cari kotak karcis.". Berkarcis tetapi jauh dari halte: tidak ada pesan, dan pita "Naik angkot dari halte.". Berkarcis dan dekat halte: mode "Pilih halte tujuan" terbuka (P-21), tanpa pesan ke server. Menekan Teropong tanpa muatan memunculkan pita "Cari kotak teropong." (JS-09 P-37).
- **P-20. Papan ketik.** Di luar dialog dan peta besar, `4` sama dengan menekan Teropong dan `5` sama dengan menekan Angkot (baris angka atau papan angka); tekanan berulang karena tombol ditahan diabaikan, seperti JS-09 P-38.
- **P-21. Mode "Pilih halte tujuan".**
  1. **Isi.** Peta besar JS-07 dan JS-23 dengan skala dan lapisan yang sama, ditambah judul "Pilih halte tujuan", ringkasan "Kamu di Halte {n}." yang menggantikan "Kejadian terlihat …", tombol "Batal" yang menggantikan "Tutup peta", tombol halte di peta, daftar halte di kanan peta, dan lingkaran Teropong bila aktif.
  2. **Tombol halte di peta.** Setiap halte selain halte asal menjadi tombol bulat 48 × 48 px (garis `ink` 4 px, latar `sun`, nomor halte dengan huruf judul 16 px) yang berpusat di penanda halte, di atas semua lapisan peta (P-34). Tombol ini hanya untuk ketuk dan klik (`tabindex="-1"` dan `aria-hidden="true"`). Pengukuran Plan: semua tombol di dalam peta, kecuali tombol `halte-2` yang menjorok 1 px di bawah tepi peta pada skala 2 (masih di dalam lapisan peta besar), dan jarak terkecil antartombol 23 px (skala 2).
  3. **Daftar halte.** Di kanan peta, mulai dari tepi atas peta dan selebar ruang kanan dikurangi 16 px: satu tombol per halte tujuan menurut nomornya (`.js-halte-pilihan`), masing-masing setinggi sedikitnya 48 px, bergaris `ink` 2 px, berlatar `cream`, dengan bantalan 3 px 6 px, berisi lencana nomor bulat 22 px (latar `sun`, garis `ink` 2 px, huruf judul 12 px), lalu "Halte {n}" dan nama zonanya di baris kedua (huruf teks 14 px, terbungkus bila tidak muat). Nama aksesibelnya "Halte {n}, {zona}". Bila daftar lebih tinggi daripada ruangnya, daftar bisa digulir. Pengukuran Specify (DRAF D-1): lebar daftar 110 px (HP 731 × 411), 129 px (dunia 610 × 343), dan 144 px (dunia 640 × 360), tinggi baris 48–72 px, tinggi daftar 164–196 px, tanpa luapan mendatar, dan daftar berakhir 20–104 px di atas tepi bawah peta.
  4. **Fokus dan papan ketik.** Fokus awal di tombol pertama daftar. `Tab` berputar di dalam peta besar. `1` sampai `4` memilih halte bernomor itu (nomor halte asal diabaikan), `Enter` atau `Spasi` memilih tombol yang difokus, dan `Esc` atau `P` sama dengan "Batal".
  5. **Memilih.** Mengirim `pakai_skill` dengan `skill: "angkot"` dan `halteId` halte itu. Sesudahnya semua tombol halte, tombol daftar, dan "Batal" tampak nonaktif (`aria-disabled="true"`), tombol yang dipilih bertanda `data-dipilih="ya"`, dan `Esc` serta `P` diabaikan, paling lama 2 detik.
  6. **Tiba.** Sesudah `pemberitahuan` `angkot_tiba`, peta besar tertutup pada bingkai pertama yang digambar di posisi baru dengan semua potongan peta yang terlihat sudah siap, paling lama 1 detik sesudah `angkot_tiba`. Lalu pita "Tiba di Halte {n}.", pengumuman yang sama, dan `sfx_skill`, dan fokus kembali ke tombol Angkot.
  7. **Tanpa jawaban** dalam 2 detik: mode tertutup tanpa pita, posisi tidak berubah, dan muatan mengikuti `pribadi` terakhir (DRAF D-2).
  8. **Tertutup sendiri** tanpa pesan bila status ruang bukan lagi `main`, lapisan menyambung ulang tampil, atau HP menjadi tegak. Selama mode terbuka, avatar berhenti seperti saat peta besar terbuka (JS-07).
- **P-22. Pindah halte di server.** `pakai_skill` dengan `skill: "angkot"` diterima bila JS-09 P-15 terpenuhi (status `main`, waktu ronde belum habis, dan pemain berkeidentitas yang punya posisi), tidak ada dialog terbuka, `bolehPakaiSkill` terpenuhi, `halteId` ada di peta, halte asal `halteDekat(posisi, halte, 32)` ada, dan `halteId` berbeda dari halte asal. Server lalu:
  1. mengurangi muatan Angkot 1, mencatat waktu pakai, dan menulis satu baris `skill`;
  2. memindahkan pemain ke `titikHalte(tujuan)` dengan arah yang sama, mengatur anggaran jarak ke 0, waktu gerak terakhir ke sekarang, dan `jalan` ke salah, menandai pemain berubah, dan mencatat posisi lamanya untuk butir perpisahan (P-23);
  3. mengirim kepada pemain itu `koreksi` (posisi baru dan `seq` gerak terakhir yang diterima, paling kecil 0), lalu `pribadi`, lalu `pemberitahuan` `angkot_tiba`.

  Pemakaian yang ditolak tidak dijawab (JS-09 P-15). Perpindahan tidak mengambil kotak. Laporan gerak lama dari halte asal yang tiba kemudian ditolak dan dijawab `koreksi` ke halte tujuan (percobaan Plan). Lari cepat dan Kompas yang aktif tetap berjalan, dan keterlihatan serta tiba Kompas diperiksa di putaran berikutnya. Posisi tidak ditulis ke SQLite pada setiap perpindahan (Architecture 8.6).
- **P-23. Butir perpisahan.** Di putaran `main` berikutnya, pemain yang pindah ikut dikirim dengan posisi barunya di `dunia` kepada setiap pemain tersambung lain yang kotak 480 × 270-nya memuat posisi lama itu, di luar batas 24 pemain terdekat (isi pesan tetap paling banyak 64 butir). Catatan posisi lama lalu dihapus. Catatan itu hanya disimpan di memori.
- **P-24. Pemain lain yang melompat.** Saat butir `dunia` baru untuk seorang pemain `melompat` (P-5) dari butir terakhirnya (dtMs = selisih `w`), penyangga pemain itu diganti dengan butir baru saja, sehingga avatarnya langsung tampil di tempat baru, atau keluar dari pandangan, tanpa meluncur dan tanpa tertinggal di halte asal.
- **P-25. Titik layar kelas yang melompat.** Saat posisi seorang pemain di `dunia_kelas` `melompat` dari posisinya di kiriman sebelumnya (dtMs 500), titiknya berpindah tanpa transisi (`data-lompat="ya"` dan `transition: none` untuk pembaruan itu), lalu kembali bergerak halus 0,5 detik di pembaruan berikutnya.
- **P-26. Layar pemain sendiri.** `koreksi` memindahkan avatar dan kamera seperti JS-07, panah Kompas dihitung dari posisi baru, dan kejadian di sekitar halte tujuan terlihat menurut aturan JS-08.

### F. HUD

- **P-27. Perangkat sentuh.** Lari cepat, Kompas, dan Petunjuk seperti JS-09 P-34; Teropong `right: 158px; bottom: 24px`; Angkot `right: 216px; bottom: 24px`. Letak setiap skill tetap walaupun skill lain dimatikan. Pengukuran Plan di HP 731 × 411, HP 915 × 356, dan HP 640 × 360 rasio 3: jarak antartombol dan lencana sedikitnya 10 px, tombol teratas ke peta mini sedikitnya 80 px, dan tombol paling kiri 264 px dari tepi kanan.
- **P-28. Laptop.** Dengan n skill aktif, tinggi kolom adalah 16 + 48n + 10(n − 1) px. Bila tinggi dunia dikurangi tinggi kolom sedikitnya 123 px (tepi bawah peta mini 115 px ditambah 8 px), tombol membentuk satu kolom (`data-letak="kolom"`, `right: 16px`) menurut urutan P-1 dari atas, dengan `bottom` 16, 74, 132, 190, dan 248 px mulai dari tombol terbawah. Bila tidak, tombol membentuk dua kolom (`data-letak="kolom2"`): skill P0 yang aktif di kolom kanan (`right: 16px`), serta Teropong dan Angkot yang aktif di kolom kiri (`right: 120px`), masing-masing tersusun dari bawah (`bottom` 16, 74, lalu 132 px) menurut urutan P-1. Tanda tombol `1` sampai `5` tetap per skill, 8 px di kiri tombolnya. Pengukuran Plan: satu kolom di dunia 960 × 540 mulai 129 px di bawah peta mini, dan dua kolom di dunia 640 × 360 mulai 65 px di bawahnya.
- **P-29. Kotak aman panah Kompas.** JS-09 P-26 butir 4 berlaku dengan batas 12 px (kiri), 40 px (atas), 160 px (kanan; 220 px saat `kolom2`), dan 80 px (bawah). Pengukuran Plan: dengan batas bawah 80 px, tombol dan lencana Teropong dan Angkot tidak bertumpuk dengan kotak aman di ketiga ukuran HP.
- **P-30. Ikon, status, label, dan atribut.** Tombol Teropong memakai `ikon_teropong`, dan tombol Angkot memakai `ikon_karcis` (skala 2). Status, lencana, label pembaca layar, `aria-keyshortcuts` (`4` dan `5`), serta atribut `data-skill`, `data-muatan`, `data-aktif`, dan `data-jeda` JS-09 P-36 dan P-39 berlaku untuk Teropong dan Angkot; Angkot juga ber-`data-dekat`.
- **P-31. Pita.** Pita baru mengikuti JS-09 P-41. Pengukuran Specify (HUD 610, 640, 731, dan 1280 px): kedelapan teks pita baru tampil satu baris, paling lebar 249 px ("Naik angkot dari halte.").

### G. Peta mini dan peta besar

- **P-32. Lingkaran Teropong di peta mini.** Selama Teropong aktif, `gambarPetaMini` menggambar lingkaran tanpa isi yang berpusat di titik kaki pemain dengan jari-jari 12 ubin (8,4 px CSS), sesudah kanvas simpanan medan (atau cadangan zona) dan sebelum halte: garis `ink` setebal 3 px CSS, lalu garis `sun` setebal 1 px CSS di jalur yang sama, keduanya dikali rasio dan dibulatkan (paling tipis 1 piksel perangkat). Peta mini juga digambar ulang saat Teropong mulai dan selesai. `.js-peta-mini` ber-`data-teropong="ya"` selama lingkaran tergambar, dan `tidak` di luar itu.
- **P-33. Lingkaran Teropong di peta besar.** Elemen `.js-peta-teropong` berupa lingkaran tanpa isi berjari-jari 12s px (s = skala peta besar) yang berpusat di titik kaki pemain, dengan garis `sun` 2 px serta garis `ink` 1 px di sisi dalam dan luarnya, di lapisan P-34. Lingkaran hilang saat Teropong selesai, juga selama peta terbuka. `.js-peta-besar-isi` ber-`data-teropong`.
- **P-34. Urutan lapisan peta besar** (dari bawah): kanvas medan, label zona, lingkaran Teropong, halte dan penanda kejadian, "Kamu di sini", lalu tombol halte mode pilih halte.

### H. Teks, bunyi, dan pengumuman

- **P-35. Pemberitahuan di layar pemain.** `kotak_teropong` dan `kotak_angkot`: pita "+1 Teropong" atau "+1 Angkot", pengumuman "Dapat satu muatan {skill}.", dan `sfx_kotak`. `angkot_tiba`: P-21 butir 6. Kode yang tidak dikenal tetap diabaikan.
- **P-36. Pengumuman** lewat antrean JS-09 P-39: "Dapat satu muatan Teropong.", "Dapat satu muatan Angkot.", "Teropong aktif selama 30 detik.", "Teropong selesai.", "Tiba di Halte {n}.", dan teks setiap pita skill baru.
- **P-37. Bunyi.** `sfx_kotak` saat kotak teropong dan karcis terambil, dan `sfx_skill` saat Teropong mulai aktif dan saat tiba di halte tujuan. Aturan suara JS-14 tetap berlaku (mati secara bawaan di HP).

### I. Simulasi beban

- **P-38. Bot Teropong dan Angkot.** `simulasi-beban.mjs` menambah perilaku ini pada bot JS-09: kotak teropong dan karcis ikut menjadi tujuan jelajah bila skillnya belum penuh; bot bermuatan Teropong memakainya saat menjelajah; bot berkarcis tanpa sasaran kejadian berjalan ke halte terdekat, lalu mengirim `pakai_skill` Angkot dengan halte lain yang dipilih acak dan menyelaraskan posisinya dari `koreksi`. Ringkasan mencatat kotak teropong dan karcis yang terambil, pemakaian Teropong dan Angkot, `kejadian_terlihat` selama Teropong aktif yang titiknya di luar pandangan, jumlah `angkot_tiba`, gerak yang dikoreksi dalam 1 detik sesudah pindah (terpisah dari koreksi lain), dan waktu putaran.

### J. Ukuran, kinerja, dan kompatibilitas

- **P-39. Ukuran dan kinerja.** Dibandingkan dengan `main` sebelum Build ditambah isi `PC-2-kotak.zip`: kode layar pemain naik paling banyak 5 KB gzip, gaya layar pemain paling banyak 0,6 KB, kode konsol awal paling banyak 0,3 KB, dan potongan layar kelas paling banyak 0,3 KB. Waktu server untuk pengungkapan Teropong dan pindah halte diukur di Node dan dicatat (sasaran Architecture 13.1 tetap). Bingkai layar HP sesudah pindah halte diukur dan dicatat di laporan, tanpa ambang baru.
- **P-40. Protokol 6.** `PROTOKOL_VERSI` naik dari 5 ke 6, karena skema `pakai_skill` yang `strict` mendapat `halteId`. HP, layar kelas, dan konsol versi lama menerima `VERSI_BERBEDA` dan diminta memuat ulang. Bentuk pesan lain tetap.

### K. Isi `PC-2-kotak.zip` dan Permintaan C-19

- **P-41. Urutan Build.** Build dimulai dengan menyalin isi `PC-2-kotak.zip` apa adanya ke salinan `main`, lalu menjalankan `peta:build --periksa`, `content:check:jejak`, dan `test:jejak`; hanya `skill-ruang` "24 kotak" yang boleh gagal. Sesudah itu: `skill-ruang.test.ts` memeriksa 31 kotak (9 sepatu, 6 kompas, 9 buku, 3 teropong, dan 4 karcis), `KOTAK_MENUNGGU_MAKS` menjadi 31, komentar "ke-24 kotak" di `peta-kampung.ts` dan `pemain/dunia/petaKampung.ts` diperbarui, dan uji ujung ke ujung yang menghitung kotak tampak menyaring kotak yang skillnya tidak aktif. Isi ZIP itu dan perubahan Sesi A masuk satu ZIP Build dan satu commit (KT-C34 a). Bila isi ZIP itu tidak cocok dengan `main` saat Build, Sesi A berhenti dan menulis permintaan untuk Sesi C.

## Beberapa pemain sekaligus

- Diberikan dua pemain di halte yang sama, ketika keduanya naik Angkot ke halte yang sama dalam satu detik, maka keduanya berdiri di titik halte tujuan yang sama (pemain saling tembus), dan masing-masing menerima `koreksi`, `pribadi`, dan `angkot_tiba`.
- Diberikan pemain A di halte 1 dan pemain B dua ubin darinya, ketika A pindah ke halte 3, maka di putaran berikutnya B menerima butir perpisahan A, dan avatar A langsung hilang dari layar B tanpa tertinggal 2,5 detik.
- Diberikan pemain C di dekat halte 3, ketika A tiba di halte 3, maka avatar A langsung tampil di layar C tanpa meluncur dari arah mana pun.
- Diberikan layar kelas terbuka, ketika A pindah halte, maka titik A berpindah tanpa transisi, sedangkan titik pemain lain tetap bergerak halus 0,5 detik.
- Diberikan 40 pemain yang Teropong-nya aktif bersamaan, maka pengungkapan berjalan untuk 40 pemain di setiap putaran 100 ms, dan setiap pemain hanya menerima titik dalam radiusnya sendiri.
- Diberikan ruang 80 pemain dengan dua titik aktif per kejadian, ketika A memakai Teropong di dekat kedua titik sebuah kejadian, maka kedua titik terungkap bagi A, kecuali kejadian itu sudah selesai baginya.
- Diberikan Kompas A aktif menuju titik kejadian K, ketika A naik Angkot, maka sasaran Kompas tetap, panah dihitung dari posisi baru, dan Kompas berakhir di putaran berikutnya bila A tiba dalam 32 piksel dari sasaran.
- Diberikan guru menjeda ronde saat Teropong A masih 12 detik lagi, maka sesudah dilanjutkan Teropong A masih 12 detik, dan tidak ada pengungkapan selama jeda.
- Diberikan guru menjeda ronde saat A menunggu jawaban Angkot, maka mode pilih halte tertutup; bila server sudah memindahkan A sebelum jeda, A tetap di halte tujuan.
- Diberikan HP A terputus saat Teropong aktif, ketika A tersambung lagi, maka lingkaran tampil lagi sampai masa aktifnya habis, dan kejadian yang sudah terungkap tetap di peta.
- Diberikan Durable Object dibangunkan ulang sesudah A pindah halte, maka muatan Angkot A tetap 0 (baris `skill`) dan A berada di posisi terakhir yang tersimpan; butir perpisahan yang belum terkirim hilang tanpa galat.

## Status antarmuka

| Tempat | Status | Tampilan |
|---|---|---|
| Tombol Teropong | Bermuatan, tanpa muatan, aktif, jeda 2 detik, ditekan, fokus | Seperti JS-09 P-36 |
| Tombol Angkot | Tanpa karcis | `mist`, lencana "0", `aria-disabled` |
| Tombol Angkot | Berkarcis, jauh dari halte | `cream`; tekanan memunculkan "Naik angkot dari halte." |
| Tombol Angkot | Berkarcis, dekat halte | Latar `sun` dan `data-dekat="ya"` |
| Tombol Angkot | Menunggu jawaban | Bergeser 2 px, paling lama 2 detik |
| Tombol skill | Tersembunyi | Seperti JS-09: lobi, hitung mundur, jeda, dialog, peta besar, menyambung ulang, HP tegak, atau skill dimatikan |
| Mode pilih halte | Biasa | Judul, ringkasan "Kamu di Halte {n}.", tombol halte di peta, daftar, dan "Batal" |
| Mode pilih halte | Fokus | Garis fokus `sun` di tombol daftar dan "Batal" |
| Mode pilih halte | Menunggu | Semua tombol nonaktif; tombol yang dipilih bertanda |
| Mode pilih halte | Tiba | Tertutup sesudah bingkai pertama di tujuan; pita "Tiba di Halte {n}." |
| Mode pilih halte | Tanpa jawaban, jeda, menyambung ulang, atau HP tegak | Tertutup tanpa pita |
| Mode pilih halte | Gambar medan belum siap | Zona berwarna cadangan JS-23 di bawah tombol halte |
| Lingkaran Teropong | Aktif, selesai, dijeda | Tergambar, hilang, diam |
| Kotak teropong dan karcis | Siap, diambil, menunggu, muncul lagi, skill mati | Seperti JS-09 P-18; tidak digambar bila skill mati |
| Pemain lain | Melompat | Langsung di tempat baru atau hilang dari pandangan |
| Peta kelas | Titik melompat | Tanpa transisi untuk pembaruan itu |
| Dialog Ruang baru | Biasa, fokus, tanpa centang, mengirim, galat | Lima kotak centang tercentang; selebihnya seperti JS-09 |
| Halaman ruang dan hasil | Baris "Skill" | Sampai lima nama, atau "Tidak ada" |
| Layar pemain | Terputus dan menyambung ulang | Lapisan JS-07; mode pilih halte tertutup; `pribadi` memulihkan muatan dan lingkaran |
| Ruang penuh dan ruang terkunci | — | Tidak relevan, karena terjadi sebelum pemain masuk dunia |

## Teks yang tampil (final)

Teks dengan `{…}` diisi lewat `isiTeks()`. `{skill}` di teks JS-09 yang dipakai ulang (`skill.pita`, `skill.penuh`, `skill.dapat`, `skill.aktif`, `skill.selesai`, `skill.tombol`, dan `skill.tombolAktif`) diisi `skill.teropong` atau `skill.angkot`, dan `{n}` di `skill.aktif` untuk Teropong bernilai 30. Di teks halte, `{n}` adalah nomor halte dan `{zona}` nama zona dari `kampung.json`. Teks yang sudah ada dan dipakai ulang tanpa perubahan tidak dicantumkan: teks `skill.*` JS-09 di atas, `peta.kamuDiSini`, `peta.halte`, dan `pengumuman.terlihat` di layar pemain, serta `skill.judul`, `skill.keterangan`, dan `skill.tidakAda` di konsol.

**Layar pemain** (`TEKS.skill` dan `TEKS.peta`, `app/jejak-setara/teks.ts`)

| Kunci | Teks |
|---|---|
| `skill.teropong` | Teropong |
| `skill.angkot` | Angkot |
| `skill.cariTeropong` | Cari kotak teropong. |
| `skill.cariAngkot` | Cari kotak karcis. |
| `skill.keHalte` | Naik angkot dari halte. |
| `skill.tombolHalte` | {skill}, {n} muatan, di halte |
| `skill.tiba` | Tiba di Halte {n}. |
| `peta.judulHalte` | Pilih halte tujuan |
| `peta.batal` | Batal |
| `peta.dariHalte` | Kamu di Halte {n}. |
| `peta.halteNomor` | Halte {n} |
| `peta.halteTujuan` | Halte {n}, {zona} |

**Konsol** (`TEKS_KONSOL.skill`, `app/jejak-setara/teks-konsol.ts`)

| Kunci | Teks |
|---|---|
| `skill.teropong` | Teropong |
| `skill.angkot` | Angkot |

## Data, protokol, API, dan migrasi

**Migrasi D1:** tidak ada.

**Protokol real-time:** `PROTOKOL_VERSI` 6.

| Pesan | Arah | Perubahan | Kapan |
|---|---|---|---|
| `pakai_skill` | Pemain ke server | `halteId` pilihan (pola `^halte-[0-9]{1,2}$`), hanya untuk Angkot | P-21, P-22 |
| `pribadi` | Server ke pemain | Bentuk tetap; muatan Teropong dan Angkot serta `aktifSampai.teropong` kini terisi, dan `kotakMenunggu` paling banyak 31 butir | P-10, P-14 |
| `kejadian_terlihat` | Server ke pemain | Bentuk tetap; juga untuk titik yang terungkap Teropong | P-15 |
| `koreksi` | Server ke pemain | Bentuk tetap; juga sesudah pindah halte | P-22 |
| `pemberitahuan` | Server ke pemain | Kode baru `kotak_teropong`, `kotak_angkot`, dan `angkot_tiba` | P-11, P-22 |
| `dunia` | Server ke pemain | Bentuk tetap; butir perpisahan | P-23 |
| `dunia_kelas` | Server ke layar kelas | Tetap | P-25 |

Skema `pakai_skill` (`inti/protokol.ts`):

```ts
const pPakaiSkill = pesan("pakai_skill", () => ({
  skill: skill(),
  kejadianId: id().optional(),
  halteId: z.string().regex(/^halte-[0-9]{1,2}$/).optional(), // JS-18: hanya untuk Angkot
}));
```

**Inti bersama** (`inti/aturan.ts`, murni):

```ts
export const SKILL_URUT = ["lari", "kompas", "petunjuk", "teropong", "angkot"] as const satisfies readonly SkillId[];
export const JANGKAUAN_HALTE_KLIEN_PX = 24;
export const JANGKAUAN_HALTE_PX = 32;
export const RADIUS_TEROPONG_PX = 192;
export function titikHalte(h: { x: number; y: number }): Posisi; // (16x + 8, 16y + 12)
export function halteDekat<T extends { id: string; x: number; y: number }>(pos: Posisi, daftar: readonly T[], batasPx: number): T | null;
export function dalamTeropong(pos: Posisi, titik: { x: number; y: number }): boolean;
export function melompat(a: Posisi, b: Posisi, dtMs: number): boolean; // jarak > 64 + 144 × dtMs / 1000
```

**Skema zod:** `skemaRuangBaru.skillAktif` = `z.array(z.enum(SKILL_URUT)).max(5).refine(tanpaDuplikat).optional()`, dan `skemaRingkasanRuang.skillAktif` = `z.array(z.enum(SKILL_URUT))`.

**Penyimpanan Durable Object:** tidak ada tabel baru. Baris `skill.isi_json` (JS-09) sudah memuat kelima skill di `muatan`, `aktif`, dan `pakai`, misalnya:

```json
{"muatan":{"lari":0,"kompas":1,"petunjuk":0,"teropong":0,"angkot":0},"aktif":{"teropong":412300},"pakai":{"teropong":382300,"angkot":118000},"kotak":{"k-z6-4":380000,"k-z3-4":110000},"kompas":null}
```

Posisi lama untuk butir perpisahan hanya disimpan di memori.

**Rute API** (tidak ada rute baru): `POST /api/ruang` menerima kelima skill di `skillAktif`; `GET /api/ruang`, `GET /api/ruang/{id}`, `GET /api/ruang/{id}/hasil`, dan `GET /api/dasbor` membawa `skillAktif` sampai lima butir.

**Dokumen utama:** diubah di ZIP Gerbang 2: PRD JFR-25, 8.5, 9, dan 21; Design System 3.3, 3.4, 9, 10, dan 13; Architecture 6.3, 8.2, 8.5, 9, dan 10.9. Diubah saat Build: Architecture 6.2 (versi 6) dan bagian "Catatan Build" di spesifikasi ini.

## Aset

| ID | Berkas | Dipakai di | Status |
|---|---|---|---|
| T-07 | `tanda_kotak_teropong` | Kotak teropong di dunia | Disetujui 6 Nov 2026 |
| T-08 | `tanda_kotak_karcis` | Kotak karcis di dunia | Disetujui 6 Nov 2026 |
| I-04 | `ikon_teropong` | Tombol Teropong dan dialog Ruang baru | Disetujui 6 Nov 2026 |
| I-05 | `ikon_karcis` | Tombol Angkot dan dialog Ruang baru | Disetujui 6 Nov 2026 |
| S-02 dan S-03 | `sfx_kotak` dan `sfx_skill` | Bunyi kotak dan skill | Disetujui 21 Nov 2026 |
| — | `ikon_mini_halte`, `ikon_zona_1` sampai `ikon_zona_8`, `tanda_diri`, dan gambar medan G-01 sampai G-03 | Peta mini dan peta besar | Disetujui |

Tidak ada aset baru, dan `manifest.ts` serta `CREDITS.md` tidak berubah. Konsol mengimpor `ikon_teropong` dan `ikon_karcis` langsung dari berkas PNG lewat `ikon-kelas.ts`.

## Keamanan dan privasi

- Server berwenang atas muatan, jangkauan halte, halte tujuan, dan posisi sesudah pindah (AGENTS 7 butir 2). `halteId` hanya bisa menunjuk halte di peta, dan pemain harus berada di halte asal, sehingga layar pemain tidak bisa memindahkan dirinya ke tempat lain.
- Teropong membuka letak kejadian hanya dalam radius 12 ubin, hanya kepada pemakainya, dan lewat pesan yang sudah ada (Architecture 12.1). Kejadian lain tetap hanya dikirim saat masuk pandangan.
- Butir perpisahan hanya dikirim kepada pemain yang sudah melihat pemain itu di posisi lamanya. Tidak ada data pribadi baru.
- Pembatas frekuensi pesan JS-03 berlaku untuk `pakai_skill`, dan pemakaian yang ditolak tidak dijawab.

## Di luar cakupan

- Halte tambahan di sisi barat (KT-18 a) dan animasi angkot.
- Pemakaian Teropong dan Angkot di statistik, CSV, rekap pribadi, dan layar kelas.
- Penanda kotak di peta mini dan peta besar, termasuk kotak yang tampak oleh Teropong.
- Bantuan gerak dan daftar "Kejadian terdekat" (JS-24).
- Penimbangan ulang nilai skill PRD 8.5 sesudah uji coba kelas.
- Mengubah skill sesudah ruang dibuat.

## DRAF untuk ditinjau pemilik proyek

- **D-1. Isi daftar halte** (P-21 butir 3).
  - (a, saran) Hanya tiga halte tujuan; halte asal disebut di ringkasan "Kamu di Halte {n}.". Terukur muat di samping peta di semua ukuran uji.
  - (b) Empat baris, dengan halte asal tampak nonaktif bertuliskan "Kamu di sini": urutan nomornya lengkap, tetapi di dunia 610 × 343 daftar melewati tepi bawah peta (masih di dalam lapisan peta besar).
- **D-2. Bila jawaban server tidak datang** (P-21 butir 7).
  - (a, saran) Mode tertutup tanpa pita sesudah 2 detik. Hal ini hanya terjadi bila keadaan berubah tepat saat memilih (misalnya ronde dijeda), dan karcis tidak terpakai.
  - (b) Pita "Angkot belum bisa dipakai." agar siswa tahu perpindahannya batal; menambah satu teks.
- **D-3. Warna lingkaran Teropong** (P-32 dan P-33).
  - (a, saran) `sun` bergaris `ink`, seperti panah diri dan tombol yang menyala, sehingga terbaca di atas rumput, laut, dan atap.
  - (b) `teal`, warna halte dan panah Kompas: lebih tenang, tetapi kontrasnya rendah di atas laut dan atap toska.

## Kriteria penerimaan

- [ ] AC-1 **Aturan inti.** P-1 sampai P-5 diuji unit: urutan `SKILL_URUT`; `halteDekat` pada 24 dan 24,01 piksel (klien) serta 32 dan 32,01 piksel (server), seri, dan tanpa halte; `titikHalte`; `dalamTeropong` pada 192 dan 192,01 piksel; `melompat` tepat di ambang untuk dtMs 100 dan 500; Teropong yang aktif tidak bisa dipakai lagi; uji kemurnian `inti/` tetap lulus.
- [ ] AC-2 **Skill per ruang.** P-6 sampai P-9: lima kotak centang tercentang dengan ikon dan target ≥ 48 px; `skillAktif` di permintaan menurut urutan P-1; `POST /api/ruang` menerima Teropong dan Angkot, menjawab 400 `ISI_SALAH` untuk nilai lain, duplikat, lebih dari 5 butir, dan bukan larik, dan memakai kelima skill bila isian tidak ada; baris "Skill" di kepala ruang dan hasil memuat sampai lima nama dan tidak dicetak; ruang yang menyimpan tiga skill tetap tanpa Teropong dan Angkot.
- [ ] AC-3 **Peta 31 kotak (C-19).** P-10 dan P-41: `skill-ruang.test.ts` memeriksa 31 kotak (9, 6, 9, 3, dan 4) yang urut menurut id dan sama dengan `PETA_KAMPUNG.kotak`; `KOTAK_MENUNGGU_MAKS` sama dengan jumlah kotak; `peta:build --periksa` dan uji peta Sesi C lulus; isi `PC-2-kotak.zip` sama byte dengan berkas yang sama di ZIP Build.
- [ ] AC-4 **Kotak teropong dan karcis.** P-11 sampai P-13: muatan bertambah sampai 1; `kotak_teropong` dan `kotak_angkot` sesudah `pribadi`; kotak tidak terambil bila skill mati atau muatan penuh; kotak tergambar hanya bila skill aktif; `data-kotak` benar; pita "… sudah penuh." sekali per kotak.
- [ ] AC-5 **Teropong di server.** P-14 sampai P-16: `pribadi` dengan muatan dan `aktifSampai.teropong` lolos skema; titik dalam radius yang belum selesai dan belum terlihat terungkap di putaran berikutnya menurut urutan kode lalu id titik; titik di luar radius, titik kejadian yang sudah selesai, dan titik yang sudah terlihat tidak dikirim; radius mengikuti posisi; tidak ada pengungkapan sesudah 30 detik, selama jeda, dan di ruang tanpa Teropong; kedua titik di ruang lebih dari 50 pemain; satu baris `skill` per pemakaian dan tidak ada tulisan saat berakhir.
- [ ] AC-6 **Teropong di layar pemain.** P-17, P-32, dan P-33: penanda kejadian yang terungkap tampil di peta mini dan peta besar; lingkaran berjari-jari 12 ubin di peta mini (`data-teropong`) dan peta besar, di lapisan P-34, hilang sesudah 30 detik; pengumuman mulai dan selesai; lingkaran tampil lagi sesudah menyambung ulang.
- [ ] AC-7 **Tombol Angkot dan mode pilih halte.** P-18 sampai P-21: keempat status tombol; ketiga hasil tekanan; `4` dan `5`; mode dengan judul, ringkasan, "Batal", tombol halte di peta (48 px, tanpa halte asal, di atas semua lapisan, `aria-hidden`), dan daftar (urutan nomor, nama aksesibel, tinggi ≥ 48 px, tanpa luapan mendatar, di dalam lapisan peta besar) di HP 731 × 411, dunia 610 × 343, HP 640 × 360 rasio 3, dan laptop 1280 × 720; fokus awal, `Tab`, `1` sampai `4`, `Enter`, `Esc`, dan `P`; keadaan menunggu; mode tertutup sendiri saat jeda dan menyambung ulang.
- [ ] AC-8 **Pindah halte di server.** P-22: syarat penerimaan (status, dialog, muatan, jeda, jarak 32 dan 32,01 piksel dari halte asal, serta halte tujuan yang sah dan berbeda); urutan `koreksi`, `pribadi`, dan `angkot_tiba`; posisi baru di `titikHalte`; laporan gerak lama ditolak dengan `koreksi` ke tujuan; laporan pertama dari tujuan diterima, juga saat berlari; kotak di sepanjang garis tidak terambil; Lari cepat dan Kompas tetap; pemakaian yang ditolak tidak dijawab; satu baris `skill`.
- [ ] AC-9 **Tiba.** P-21 butir 6 dan 7: peta tertutup sesudah `angkot_tiba` dan bingkai pertama di posisi baru, paling lama 1 detik; pita dan pengumuman "Tiba di Halte {n}."; fokus di tombol Angkot; tanpa jawaban selama 2 detik, mode tertutup tanpa pita.
- [ ] AC-10 **Pemain lain dan layar kelas.** P-23 sampai P-25: di uji ujung ke ujung dengan HP pengamat dua ubin dari halte asal, wilayah avatar di halte asal sama dengan halte kosong paling lama 500 ms sesudah pindah; pengamat di halte tujuan melihat avatar di titik halte tanpa posisi antara; titik layar kelas ber-`data-lompat="ya"` tanpa transisi untuk lompatan dan tetap bertransisi untuk gerak biasa; uji unit butir perpisahan (di luar 24 terdekat dan sekali saja) serta `melompat` di `pemainLain`.
- [ ] AC-11 **HUD.** P-27 sampai P-31: di HP 731 × 411, HP 915 × 356, dan HP 640 × 360 rasio 3, lima tombol, lencana, peta mini, bilah atas, dan Periksa tidak bertumpuk dan berjarak sedikitnya 8 px; laptop 1280 × 720 dan 1024 × 768 memakai satu kolom `1` sampai `5`; laptop 700 × 400 (dunia 640 × 360) memakai dua kolom tanpa tumpang tindih dengan peta mini; kotak aman tidak bertumpuk dengan tombol, lencana, dan tanda tombol di keenam ukuran (uji unit `batasPanah` dan uji ujung ke ujung); pita baru satu baris di HUD 610 px.
- [ ] AC-12 **Teks, bunyi, dan pengumuman.** P-35 sampai P-37 dan bagian "Teks yang tampil (final)": `TEKS` dan `TEKS_KONSOL` memuat tepat teks spesifikasi ini, dan uji teks JS-07, JS-09, dan fitur lain mengecualikan kunci JS-18 dengan cara yang sama seperti kunci JS-11 dan JS-12; `sfx_kotak` dan `sfx_skill` dipicu di titik P-37 (uji unit dengan pemutar tiruan).
- [ ] AC-13 **Protokol dan kompatibilitas.** P-40: `PROTOKOL_VERSI` 6; setiap pesan server di uji unit dan server lolos skema; `pakai_skill` dengan `halteId` yang tidak sesuai pola ditolak skema; layar pemain mengabaikan kode `pemberitahuan` yang tidak dikenal; ruang yang pulih tanpa baris `skill` tetap berjalan; `kerangka.test.ts` dan `sim:beban` memakai versi 6.
- [ ] AC-14 **Beban.** P-38: `sim:beban` 1 ruang × 50 bot, `--detik 180`, sekali tanpa tunda dan sekali dengan `--latensi-ms 80 --jitter-eksp-ms 40`: tanpa putus tak terduga, pelanggaran, dan galat; kelima jenis kotak terambil, dan Teropong serta Angkot masing-masing dipakai sedikitnya 10 kali; gerak yang dikoreksi di luar 1 detik sesudah pindah 0 tanpa tunda dan paling banyak 0,05% dengan tunda; lalu lintas turun paling banyak 3 MB per pemain per 15 menit; waktu putaran, ukuran `pribadi`, serta baris tulis SQLite ruang dan D1 tercatat.
- [ ] AC-15 **Ukuran dan kinerja.** P-39: batas kenaikan terpenuhi; konsol tetap tidak mengimpor `manifest.ts`, dan layar pemain tidak mengimpor `teks-konsol.ts`; waktu server tercatat dan memenuhi Architecture 13.1; bingkai HP 731 × 411 sesudah pindah halte (CPU biasa dan CPU 6 kali lebih lambat) tercatat; uji kinerja JS-07, JS-08, dan JS-09 tetap lulus.
- [ ] AC-16 **Tanpa regresi.** Semua uji JS-01 sampai JS-23 lulus, dengan perubahan hanya untuk skill yang kini lima (misalnya jawaban 400 untuk Teropong di uji JS-09 menjadi 201) dan kotak yang kini 31; `build:pages` menghasilkan 178 berkas yang identik byte; `tsc --noEmit` dan ESLint Jejak tanpa masalah.
- [ ] AC-17 **Tangkapan layar.** Di `tests/JS-18/`: HUD lima tombol di HP 731 × 411, HP 640 × 360 rasio 3, HP 915 × 356, dan laptop 1280 × 720, 1024 × 768, dan 700 × 400; tombol Angkot dekat halte; lingkaran Teropong di peta mini dan peta besar; mode "Pilih halte tujuan" di HP 731 × 411, dunia 610 × 343, dan laptop 1280 × 720; pita "Tiba di Halte {n}."; dialog Ruang baru dengan lima skill di 1280 × 720; serta layar kelas 1024 × 768 dan 1920 × 1080.
- [ ] AC-18 **Pemeriksaan manual.** Pemilik proyek di lingkungan uji dengan dua HP: Teropong (lingkaran dan kejadian yang terungkap), Angkot (tombol menyala di halte, memilih halte, layar tidak tampak tersendat, dan HP kedua tidak melihat avatar tertinggal), serta layar kelas.
- [ ] AC-19 **Dokumen.** PRD, Design System, dan Architecture sesuai bagian "Data, protokol, API, dan migrasi"; `PLAN.md` diperbarui di Test.

## Rencana uji

### Uji unit (`test:jejak`)

- `__tests__/skill/aturan-skill.test.ts`: P-1 sampai P-5 (AC-1).
- `__tests__/skill/skill-ruang.test.ts`: 31 kotak (C-19), isi `pribadi` kelima skill, serta pemakaian Teropong dan Angkot (AC-3, AC-5, AC-8).
- `__tests__/skill/inti-ruang-js18.test.ts` (baru): Teropong di putaran (radius, urutan, kejadian selesai, titik terlihat, jeda, dan dua titik), Angkot (syarat, urutan pesan, posisi, gerak lama dan pertama, kotak, dan Kompas), butir perpisahan, dan ruang lama tanpa Teropong dan Angkot (AC-5, AC-8, AC-10).
- `__tests__/skill/klien-skill.test.ts`: status tombol Teropong dan Angkot, hasil tekanan, susunan kolom laptop, `batasPanah` baru, pita, dan pemberitahuan (AC-4, AC-7, AC-11, AC-12).
- `__tests__/dunia/`: `melompat` di `terimaDunia` (AC-10); `__tests__/kelas/tampilan-kelas.test.ts`: lompatan titik layar kelas (AC-10).
- `__tests__/skill/ruang-baru-skill.test.ts`: lima skill di skema dan `skillAktifRuang` (AC-2).
- `kerangka.test.ts`: teks JS-18 dan pengecualiannya di uji teks lain (AC-12), serta protokol 6 (AC-13).

### Uji server (`test:jejak:server`)

- Berkas baru `server/jejak-setara/uji/teropong-angkot.uji-server.ts`: ruang uji dengan kelima skill; pemain dipindah ke samping kotak teropong lalu berjalan melewatinya; Teropong mengungkap kejadian dalam radius (kait uji `kejadian`); karcis diambil di dekat halte; `pakai_skill` Angkot dengan `halteId`, urutan pesan, posisi baru, dan laporan gerak sesudahnya; pengamat menerima butir perpisahan; `POST /api/ruang` dengan lima skill (AC-2, AC-5, AC-8, AC-10).
- Uji server JS-03 sampai JS-23 tetap lulus, dijalankan dalam dua kelompok karena batas waktu per perintah.

### Uji ujung ke ujung (`test:e2e:jejak`)

- Berkas baru `e2e/jejak-setara/teropong-angkot.uji.ts`: HP 731 × 411 dan laptop 1280 × 720 di ruang yang sama; HUD lima tombol dan ukurannya di keenam ukuran (AC-11); kotak teropong, Teropong, dan lingkaran di peta mini dan peta besar (AC-6); karcis, tombol Angkot dekat halte, mode pilih halte lewat ketuk dan papan ketik, tiba, dan pita (AC-7, AC-9); pengamat di halte asal dan tujuan serta layar kelas (AC-10); dialog Ruang baru dan baris "Skill" (AC-2); tangkapan layar (AC-17).
- `skill.uji.ts` (C-19): hitungan kotak tampak menyaring kotak yang skillnya tidak aktif.
- Dijalankan dalam kelompok kecil dengan `JEJAK_CHROMIUM`.

### Beban dan ukuran

- `sim:beban` (AC-14).
- `build:jejak` dan `anggaran.mjs`, dibandingkan dengan `main` sebelum Build ditambah isi `PC-2-kotak.zip` (AC-15).
- Waktu server di Node (median 20 kali), dicatat di laporan tanpa menjadi uji otomatis.

### Manual (AGENTS 9) dan lingkungan uji

Langkah pemilik proyek sesudah ZIP Build di-push:

1. Pastikan "Jejak: uji" hijau.
2. Buat ruang uji dengan kelima skill, lalu mainkan dengan dua HP.
3. Ambil kotak teropong di pantai Z6, pakai Teropong, lalu perhatikan lingkaran dan kejadian yang muncul di peta mini.
4. Ambil karcis di dekat halte, berdiri di halte, tekan Angkot, pilih halte lain, lalu perhatikan HP kedua yang berdiri di halte asal.
5. Buka layar kelas dan perhatikan titik pemain yang pindah halte.
6. Buat ruang dengan Teropong dan Angkot dimatikan, lalu pastikan tombol dan kotaknya tidak tampil.
7. Kirim tangkapan layar HUD dan mode pilih halte dari HP.

Butir daftar periksa AGENTS 9 yang relevan: lancar di HP saat lingkaran tampil dan sesudah pindah halte; bisa dimainkan hanya dengan papan ketik di laptop, termasuk memilih halte; dan kurangi gerak tidak mengubah lingkaran.

## Catatan Build

Ditulis saat Build.
