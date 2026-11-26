# JS-21 — Musik latar layar kelas

Status: **Disetujui (25 Nov 2026)**, `Spesifikasi disetujui: JS-21` (D-1 sampai D-3 = a). Diuji: [JS-21-hasil.md](../tests/JS-21-hasil.md). Dasar: rencana v1.1 di `PLAN.md` (`Setuju: JS-21`, semua saran a), Design System 12, dan spesifikasi JS-14 P-29 sampai P-31.

## Ringkasan

Layar kelas memutar musik latar M-01 (`musik_kelas.wav`) pelan dan berulang di lobi dan selama ronde. Musik berhenti saat hitung mundur, saat jeda, dan sejak ronde selesai, lalu lanjut dari posisi terakhir saat berbunyi lagi. Guru bisa mematikan musik saja lewat tombol "Musik" atau `U`, atau mematikan semua bunyi lewat tombol suara atau `M`. Layar pemain, server, protokol, dan basis data tidak berubah.

## Kaitan PRD

- PRD 17: musik latar masuk versi 1.1 (KT-15 a, Gerbang 1 rencana v1.1).
- Design System 12: M-01 diputar pelan di bawah efek, berhenti saat jeda, hitung mundur, dan jingle akhir, dengan satu pengatur volume 60%.
- Design System 3.6 dan 13: tombol dan pintasan layar kelas, target sentuh 48 px, dan makna yang tidak hanya lewat warna.
- Architecture 11.2 dan 11.3: layar kelas mengimpor WAV langsung (P-35 JS-10); musik paling besar 1 MB dan hanya dimuat layar kelas.
- Spesifikasi JS-14 P-29 sampai P-31: suara layar kelas, konteks audio, dan tulisan "Klik untuk menyalakan suara".
- Permintaan C-16 Sesi C (M-01 Disetujui 21 Nov 2026).

## Berkas

| Berkas | Jenis | Isi |
|---|---|---|
| `app/jejak-setara/admin/kelas/suara-kelas.ts` | Diubah | Impor `musik_kelas.wav`, unduhan, putar berulang, posisi, masuk dan keluar pelan, serta pilihan `jejak:musik-kelas` (P-3 sampai P-6, P-13 sampai P-15) |
| `app/jejak-setara/admin/kelas/LayarKelas.tsx` | Diubah | Kapan musik berbunyi, kelompok tombol Musik dan suara, `U`, pengumuman, tulisan tertahan, dan `data-musik` (P-1, P-2, P-7 sampai P-12, P-16) |
| `app/jejak-setara/admin/kelas/tampilan-kelas.ts` | Diubah | Fungsi murni `musikSeharusnya` dan `posisiMusik` (P-1, P-4) |
| `app/jejak-setara/teks-konsol.ts` | Diubah | Teks tombol dan pengumuman musik |
| `app/jejak-setara/styles/kelas.css` | Diubah | Kelompok tombol, tombol Musik, dan ruang kanan kepala serta bilah (P-7 sampai P-9) |
| `app/jejak-setara/__tests__/pengaturan/suara.test.ts` | Diubah | Uji unit musik dengan konteks tiruan |
| `app/jejak-setara/__tests__/kerangka.test.ts` | Diubah | Uji teks JS-21, dan teks JS-21 dikecualikan dari uji teks JS-10 |
| `e2e/jejak-setara/kelas.uji.ts` | Diubah | Uji ujung ke ujung musik dan tangkapan layar kepala |
| `docs/jejak-setara/tests/JS-21-hasil.md` dan `docs/jejak-setara/tests/JS-21/` | Baru | Laporan dan tangkapan layar Test |

Tidak disentuh: server, `inti/`, layar pemain, `package.json`, lockfile, alur kerja, `wrangler.jsonc`, `scripts/jejak-setara/anggaran.mjs` (baris musik latar sudah ada sejak JS-15), berkas Sesi B dan C, Sehari Setara, dan galeri.

## Perilaku

### A. Kapan musik berbunyi

- **P-1. Syarat.** Musik berbunyi bila semua syarat ini terpenuhi:
  1. suara layar kelas nyala (P-29 JS-14);
  2. musik nyala (P-6);
  3. konteks audio sudah dibuat dan berstatus `running`;
  4. berkas musik sudah terurai;
  5. status ruang yang terakhir diketahui adalah `lobi` atau `main`;
  6. sambungan layar kelas tidak berhenti, yaitu bukan "Ruang ditutup", "diganti" (4001), "tidak ada", atau "terputus" sesudah 10 menit gagal. Selama pita "Menyambung ulang…" tampil, musik mengikuti status terakhir yang diketahui.

  Bila salah satu syarat tidak terpenuhi, musik diam.
- **P-2. Status ruang.** Musik berhenti saat status berubah menjadi `hitung_mundur`, `jeda`, `selesai`, `pembahasan`, atau `ditutup`. Musik berbunyi lagi saat status kembali `main`, sesudah hitung mundur atau sesudah jeda. Saat status berubah dari `main` atau `jeda` menjadi `selesai`, musik mulai turun pada saat yang sama dengan jingle `akhir` (P-31 JS-14), sehingga keduanya bertumpuk paling lama 80 ms. Musik tidak berbunyi di podium dan pembahasan.
- **P-3. Berulang.** Musik diputar sebagai satu sumber berulang (`loop`) atas seluruh berkas 38,4 detik, tanpa celah di sambungan putarannya.
- **P-4. Posisi.** Layar kelas menyimpan posisi musik di memori tab. Setiap kali musik berbunyi lagi, misalnya sesudah jeda, sesudah hitung mundur, atau sesudah suara atau musik dinyalakan lagi, musik lanjut dari posisi terakhir (DRAF D-3). Posisinya adalah posisi saat mulai ditambah lama berbunyi, modulo 38,4 detik. Posisi kembali ke awal hanya saat halaman layar kelas dimuat ulang.
- **P-5. Masuk dan keluar pelan.** Musik punya penguat sendiri di antara sumber musik dan penguat 60% layar kelas. Saat musik mulai atau lanjut, penguat itu naik dari 0 ke 1 dalam 80 ms. Saat musik berhenti, penguat itu turun dari nilai sekarang ke 0 dalam 80 ms, lalu sumbernya dihentikan. Tidak ada bunyi letup. Volume keseluruhan tetap satu pengatur 60% (Design System 12); penguat musik bukan volume tersendiri.

### B. Tombol Musik dan pintasan `U`

- **P-6. Pilihan.** Musik nyala secara bawaan. Pilihannya disimpan di `sessionStorage` dengan kunci `jejak:musik-kelas` (`nyala` atau `mati`), seperti `jejak:suara-kelas`, dan dibaca saat layar kelas dimuat. Nilai lain, atau `sessionStorage` yang tidak tersedia, dianggap `nyala`.
- **P-7. Tombol.** Tombol bertulisan "Musik" (huruf teks 2,5u), setinggi dan selebar sedikitnya 48 px, bergaris `ink` 3 px, dan berlatar `cream` dengan teks `ink`. Saat musik mati, latarnya `mist` dan tulisannya bercoret (DRAF D-1), sehingga keadaannya tidak hanya dibedakan warna. Tombol memakai `aria-pressed` (`true` bila nyala), `aria-label` "Musik nyala. Tekan untuk mematikan." atau "Musik mati. Tekan untuk menyalakan.", dan `aria-keyshortcuts="U"`. Fokusnya memakai garis luar `ink` 3 px dengan jarak 2 px, seperti tombol suara.
- **P-8. Letak.** Tombol Musik dan tombol suara berada dalam satu kelompok di kanan atas layar kelas (`top` 0,4u, `right` 6u, jarak 1u), dengan urutan tombol Musik lalu tombol suara. Tombol layar penuh tetap di pojok kanan atas. Kelompok ini tampil di semua tampilan yang sekarang menampilkan tombol suara, yaitu semua kecuali "Ruang ditutup", termasuk podium dan pembahasan walaupun musik di sana diam. Tulisan "Klik untuk menyalakan suara" (P-30 JS-14) pindah dari dalam tombol suara menjadi unsur pertama kelompok itu, di kiri tombol Musik, sehingga kedua tombol tidak bergeser saat tulisan muncul atau hilang. Seperti di JS-14, tulisan itu boleh menutupi sebagian isi kepala selama tampil.
- **P-9. Ruang kepala.** Agar kelompok tombol tidak menutupi isi kepala, kepala lobi, hitung mundur, podium, dan pembahasan (`.js-kelas-kepala`) memakai ruang kanan 24u (sebelumnya 12u), dan bilah saat bermain (`.js-kelas-bilah`) memakai ruang kanan 24u (sebelumnya 2u). Dengan ukuran ini, isi kanan kepala dan tulisan "Sisa …" berjarak sedikitnya 8 px dari tombol Musik di 1024 × 768, 1280 × 720, dan 1920 × 1080. Di v1.0, tombol suara menutupi sebagian "Sisa …" di ketiga ukuran itu, dan perubahan ini sekaligus memperbaikinya.
- **P-10. Pintasan `U`.** Tombol `u` atau `U`, tanpa Ctrl, Alt, atau Meta dan bukan tekanan berulang karena tombol ditahan, membalik pilihan musik. Seperti `M` (P-29 JS-14), `U` bekerja di semua tampilan kecuali "Ruang ditutup", juga saat menu nama, panel Pemain, konfirmasi, atau Perbesar QR terbuka, dan diabaikan saat fokus berada di isian.
- **P-11. Pengumuman.** Mengganti pilihan musik diumumkan lewat wilayah `aria-live` layar kelas: "Musik dinyalakan." atau "Musik dimatikan.". Klik tombol Musik dan `U` juga dihitung sebagai ketukan (P-30 JS-14), sehingga konteks audio dibuat atau dilanjutkan.
- **P-12. Tombol suara tetap berlaku untuk semua bunyi.** Tombol suara dan `M` mematikan semua bunyi, termasuk musik, tanpa mengubah pilihan musik. Saat suara dinyalakan lagi, musik berbunyi lagi bila P-1 terpenuhi.

### C. Unduhan, izin peramban, dan galat

- **P-13. Unduhan.** `suara-kelas.ts` mengimpor `musik_kelas.wav` langsung (P-35 JS-10), sehingga berkas itu menjadi berkas berhash milik potongan layar kelas. Musik diunduh dan diurai sekali per tab, saat konteks audio dibuat (ketukan pertama, P-30 JS-14) bila musik nyala, atau saat musik pertama kali dinyalakan sesudah itu. Guru yang mematikan musik sebelum ketukan pertama tidak mengunduh 0,81 MB. Layar pemain dan halaman konsol lain tidak pernah mengunduhnya.
- **P-14. Tertahan.** Bila syarat P-1 butir 1, 2, 5, dan 6 terpenuhi, tetapi konteks audio belum ada atau masih `suspended`, tulisan "Klik untuk menyalakan suara" tampil. Ini juga berlaku saat layar kelas baru dimuat di lobi sebelum ada ketukan (DRAF D-2). Sesudah ketukan berikutnya, konteks dibuat atau dilanjutkan, tulisan hilang, dan musik mulai begitu berkasnya terurai, bila P-1 masih terpenuhi.
- **P-15. Galat.** Bila unduhan atau penguraian musik gagal, musik diam, efek tetap berbunyi, tidak ada galat di konsol peramban, dan unduhan dicoba sekali lagi pada ketukan berikutnya. Peramban tanpa Web Audio tidak memutar apa pun dan tidak menampilkan galat, seperti P-30 JS-14.

### D. Penanda uji dan dokumen

- **P-16. `data-musik`.** Elemen `.js-kelas` memuat atribut `data-musik` dengan nilai `berbunyi` (sumber musik sedang diputar), `diam` (pilihan musik nyala, tetapi P-1 belum terpenuhi), atau `mati` (pilihan musik mati). Atribut ini hanya untuk uji dan pemeriksaan.
- **P-17. Dokumen.** Keputusan Gerbang 1 dan isi spesifikasi ini dicatat di Design System 3.6, 12, dan 13; Architecture 6.2, 10.9, dan 11.3; PRD 17, 20, dan 21; AGENTS 5; dan `PLAN.md`. Perubahan dokumen itu ikut ZIP Specify ini.

## Beberapa pemain sekaligus

- Musik hanya ada di laptop guru. Jumlah pemain, pemain yang bergabung atau keluar, dan perubahan papan skor tidak memengaruhi musik.
- Satu ruang hanya punya satu layar kelas aktif (Architecture 10.9). Bila layar kelas dibuka di tab lain, tab lama menerima kode 4001 dan menampilkan "diganti", lalu musiknya berhenti (P-1 butir 6). Tab baru memutar musik dari awal sesudah ketukan pertamanya.
- Dua kelas yang bermain di dua laptop masing-masing memutar musiknya sendiri.

## Status antarmuka

| Tampilan | Musik | Tombol Musik | Tulisan tertahan |
|---|---|---|---|
| Memuat ("Menyambung…") | Diam, karena status belum diketahui | Tampil | Tidak |
| Lobi | Berbunyi bila P-1 terpenuhi | Tampil | Tampil sebelum ketukan pertama (D-2) |
| Hitung mundur | Diam; tik hitung tetap berbunyi | Tampil | Seperti JS-14 |
| Saat bermain | Berbunyi bila P-1 terpenuhi | Tampil | Tampil bila konteks tertahan |
| Jeda (lapisan "Dijeda") | Diam | Tampil dan bisa dipakai | Tidak |
| Podium dan pembahasan | Diam; jingle berbunyi saat ronde berakhir | Tampil | Seperti JS-14 |
| Menyambung ulang (pita) | Mengikuti status terakhir | Tampil | Seperti di atas |
| Diganti, tidak ada, atau terputus | Diam | Tampil | Tidak |
| Ruang ditutup | Diam | Tidak tampil | Tidak |
| Suara mati | Diam | Tampil, pilihan musik tetap bisa diganti | Tidak |
| Musik mati | Diam | Tampil dengan latar `mist` dan tulisan bercoret | Tidak, kecuali bunyi efek tertahan (JS-14) |
| Unduhan musik gagal | Diam; efek tetap berbunyi | Tampil | Tidak |
| Fokus | — | Garis luar `ink` 3 px | — |

Tombol Musik tidak punya keadaan nonaktif. Kurangi gerak tidak berpengaruh, karena tidak ada animasi baru.

## Teks yang tampil (final)

Kelompok `kelas` di `TEKS_KONSOL`:

| Kunci | Teks |
|---|---|
| `kelas.musik` | Musik |
| `kelas.musikNyala` | Musik nyala. Tekan untuk mematikan. |
| `kelas.musikMati` | Musik mati. Tekan untuk menyalakan. |
| `kelas.umumMusikNyala` | Musik dinyalakan. |
| `kelas.umumMusikMati` | Musik dimatikan. |

Teks yang tetap: "Klik untuk menyalakan suara" (`kelas.suaraTertahan`, P-30 JS-14).

## Data, protokol, API, dan migrasi

- Pesan protokol: tidak ada yang baru atau berubah; `PROTOKOL_VERSI` tetap 5.
- Rute API, server, dan Durable Object: tidak berubah.
- Migrasi D1: tidak ada.
- Penyimpanan klien: `sessionStorage` `jejak:musik-kelas` (`nyala` atau `mati`), hanya di tab layar kelas. Nilai ini pengaturan guru, bukan data siswa.
- Fungsi murni untuk uji unit:
  - `musikSeharusnya({ status, sambungan, suaraNyala, musikNyala })` menghasilkan `true` hanya bila P-1 butir 1, 2, 5, dan 6 terpenuhi;
  - `posisiMusik(posisiMulai, lamaBerbunyi, panjang)` menghasilkan posisi dalam detik, modulo panjang berkas.
- `SuaraKelas` (`suara-kelas.ts`) mendapat cara mengatur musik, misalnya `musik(ingin: boolean)`, dan memberi tahu apakah musik tertahan. Nama akhirnya ditetapkan saat Build, dengan perilaku P-3 sampai P-5 dan P-13 sampai P-15.

## Aset

- M-01 `app/jejak-setara/assets/sfx/musik_kelas.wav`: Disetujui 21 Nov 2026, 846.764 B, mono 16 bit 11.025 Hz, 38,4 detik; kreditnya sudah ada di `CREDITS.md`.
- Tidak ada aset baru. Tombol Musik bertulisan, tanpa ikon.
- `scripts/jejak-setara/anggaran.mjs` sudah punya baris "Musik latar musik_kelas.wav" (paling besar 1 MB) sejak JS-15. Baris itu baru tampil setelah berkasnya ikut terbangun di JS-21, dan tidak perlu diubah.

## Keamanan dan privasi

- Tidak ada data baru yang dikirim ke server atau disimpan di server. Pilihan musik hanya ada di `sessionStorage` tab layar kelas dan hilang saat tab ditutup.
- Berkas musik disajikan dari Worker sendiri sebagai aset statis berhash, seperti efek suara JS-14. Tidak ada layanan luar, dan tajuk keamanan tidak berubah.

## Di luar cakupan

- Musik di HP pemain atau di halaman konsol lain.
- Lagu lain, musik per masa, atau musik per ruang.
- Pengatur volume tersendiri untuk musik atau efek.
- Musik di podium dan pembahasan.
- Musik yang dikecilkan saat tab layar kelas tidak terlihat; musik tetap mengikuti P-1.
- Peta bermedan (JS-23) serta Teropong dan Angkot (JS-18).
- Perubahan efek suara JS-14, selain letak tulisan "Klik untuk menyalakan suara" (P-8) dan kemunculannya saat musik menunggu (P-14).

## DRAF untuk ditinjau pemilik proyek

- **D-1. Tombol Musik saat musik mati.**
  - (a, saran) Tulisan "Musik" tetap, berlatar `mist`, dan bercoret. Keadaannya juga dibacakan lewat `aria-pressed` dan `aria-label`.
  - (b) Tulisan berganti "Musik nyala" atau "Musik mati": lebih jelas dibaca, tetapi tombol lebih lebar dan bisa dikira perintah.
- **D-2. Tulisan "Klik untuk menyalakan suara" di lobi.**
  - (a, saran) Tampil sejak layar kelas dimuat bila musik seharusnya berbunyi tetapi peramban belum mengizinkan bunyi, agar guru tahu satu klik menyalakan musik lobi. Selama tampil, tulisan itu menutupi sebagian jumlah pemain di kepala, seperti tulisan tertahan JS-14.
  - (b) Seperti JS-14: hanya tampil sesudah sebuah bunyi gagal diputar, sehingga musik lobi mulai tanpa pemberitahuan sesudah klik pertama guru.
- **D-3. Musik saat ronde dimulai.**
  - (a, saran) Lanjut dari posisi terakhir, juga dari lobi ke ronde, dengan satu posisi per tab.
  - (b) Mulai dari awal setiap kali ronde dimulai sesudah hitung mundur; sesudah jeda tetap lanjut.

## Kriteria penerimaan

- [ ] AC-1 **Syarat dan status.** P-1 dan P-2 di uji unit, untuk ketujuh status ruang dan kelima keadaan sambungan. Di uji ujung ke ujung, `data-musik` bernilai `berbunyi` di lobi dan saat bermain, lalu `diam` saat hitung mundur, jeda, podium, dan pembahasan.
- [ ] AC-2 **Berulang dan posisi.** P-3 dan P-4 di uji unit dengan konteks tiruan: sumber ber-`loop`, `start(0, posisi)` memakai posisi modulo 38,4 detik sesudah jeda, dan perilaku lobi ke ronde sesuai D-3.
- [ ] AC-3 **Masuk dan keluar pelan.** P-5 di uji unit: penguat musik naik dari 0 ke 1 dan turun ke 0 masing-masing dalam 80 ms, sumber dihentikan sesudah turun, dan musik mulai turun pada perubahan ke `selesai` yang sama dengan jingle.
- [ ] AC-4 **Tombol.** P-6 sampai P-8 di uji ujung ke ujung:
  - bawaan nyala;
  - `aria-pressed`, `aria-label`, dan `aria-keyshortcuts` benar;
  - tinggi dan lebar ≥ 48 px;
  - tombol Musik berada di kiri tombol suara dalam satu kelompok;
  - tulisan tertahan tampil di kiri tanpa menggeser tombol;
  - tombol tampil di lobi, saat bermain, podium, dan pembahasan, tetapi tidak di "Ruang ditutup".
- [ ] AC-5 **Ruang kepala.** P-9 diukur dari kotak elemen dan tangkapan layar di 1024 × 768, 1280 × 720, dan 1920 × 1080, untuk lobi, saat bermain, dan podium. Isi kanan kepala dan "Sisa …" tidak bertumpuk dengan tombol, dengan jarak ≥ 8 px.
- [ ] AC-6 **`U` dan pengumuman.** P-10 dan P-11:
  - `U` bekerja juga saat panel Pemain terbuka;
  - `U` diabaikan bersama Ctrl dan saat tombol ditahan;
  - pengumuman sesuai teks final;
  - pilihan tersimpan di `jejak:musik-kelas` dan bertahan sesudah tab dimuat ulang.
- [ ] AC-7 **Tombol suara.** P-12: `M` mematikan musik tanpa mengubah pilihan musik, dan menyalakan suara lagi membuat musik berbunyi lagi bila P-1 terpenuhi.
- [ ] AC-8 **Unduhan.** P-13:
  - layar kelas mengunduh `musik_kelas` sekali sesudah ketukan pertama bila musik nyala;
  - layar kelas tidak mengunduhnya selama musik mati;
  - layar pemain dan halaman Ruang di konsol tidak mengunduhnya.
- [ ] AC-9 **Tertahan.** P-14 di uji unit (konteks `suspended`, lalu dilanjutkan), sesuai pilihan D-2.
- [ ] AC-10 **Galat.** P-15 di uji unit (unduhan gagal, penguraian gagal, dan tanpa Web Audio), tanpa galat konsol.
- [ ] AC-11 **Tab lama.** Layar kelas yang menerima 4001 berhenti memutar musik (uji unit atau ujung ke ujung).
- [ ] AC-12 **Ukuran.**
  - Potongan layar kelas naik paling banyak 1 KB gzip dari 10,25 KB.
  - Kode layar pemain (140,52 KB) dan kode konsol awal (136,98 KB) tidak berubah; selisih nama aset kembar diabaikan (catatan Plan JS-15).
  - `anggaran.mjs` menampilkan baris musik latar di bawah 1 MB dan lulus.
- [ ] AC-13 **Uji JS-14 tetap lulus.** `suara.test.ts`, `pengaturan.uji.ts`, dan `kelas.uji.ts` lulus. Selektor tulisan tertahan disesuaikan dengan letak barunya (P-8).
- [ ] AC-14 **Perintah resmi.**
  - `content:check:jejak`, `test:jejak`, `test:jejak:server`, `build:jejak`, dan `test:e2e:jejak` lulus.
  - `tsc --noEmit` dan ESLint Jejak bersih.
  - `build:pages` menghasilkan 178 berkas yang identik byte.
- [ ] AC-15 **Manual.** Di laptop guru dan proyektor, dengan Chrome atau Edge:
  - musik berulang mulus tanpa letup;
  - musik berhenti saat hitung mundur, jeda, dan jingle;
  - musik lanjut sesudah jeda;
  - tombol Musik dan `U` bekerja;
  - musik terdengar di bawah efek.
- [ ] AC-16 **Dokumen.** P-17: dokumen utama dan `PLAN.md` sesuai spesifikasi ini.
- [ ] AC-17 **Tangkapan layar.** `tests/JS-21/` memuat kepala lobi, saat bermain, dan podium di tiga ukuran layar kelas, termasuk keadaan tertahan dan musik mati.

## Rencana uji

### Unit (`test:jejak`)

- `__tests__/pengaturan/suara.test.ts` diperluas dengan konteks tiruan seperti uji JS-14. Yang diperiksa:
  - unduhan saat konteks dibuat dan saat musik dinyalakan;
  - `loop` dan posisi;
  - penguat musik saat masuk dan keluar;
  - berhenti saat status berubah;
  - galat unduhan dan penguraian;
  - tertahan dan dilanjutkan;
  - peramban tanpa Web Audio.
- Fungsi murni `musikSeharusnya` dan `posisiMusik`.

### Ujung ke ujung (`test:e2e:jejak`)

- Di `kelas.uji.ts` atau `pengaturan.uji.ts`: guru membuat ruang uji, membuka layar kelas, dan satu pemain bergabung. Yang diperiksa:
  - `data-musik` di lobi, hitung mundur, saat bermain, jeda, lanjut, podium, dan pembahasan;
  - tombol Musik dan `U`;
  - `jejak:musik-kelas` sesudah tab dimuat ulang;
  - permintaan `musik_kelas` hanya dari layar kelas;
  - ukuran kotak AC-5 dan tangkapan layar AC-17.
- Chromium di mesin agen menjalankan konteks audio tanpa ketukan (catatan Plan JS-14). Karena itu keadaan tertahan (D-2) diuji di unit dan manual.

### Server dan beban

- Server tidak berubah. `test:jejak:server` dijalankan sebagai regresi.
- `sim:beban` tidak wajib, karena protokol, inti ruang, dan kiriman ke D1 tidak berubah (AGENTS 4.4 butir 6).

### Ukuran

- `build:jejak` dan `anggaran.mjs`, dibandingkan dengan garis dasar Plan: potongan layar kelas 10,25 KB, layar pemain 140,52 KB, dan konsol 136,98 KB.

### Manual (AGENTS 9) dan lingkungan uji

1. Sesudah push dan "Jejak: uji" hijau, buka layar kelas di laptop yang tersambung ke proyektor atau pengeras suara.
2. Klik sekali di layar kelas: musik lobi terdengar pelan.
3. Gabung dengan satu HP, lalu Mulai: musik berhenti selama 3, 2, 1, lalu terdengar lagi saat ronde berjalan.
4. Jeda, lalu Lanjut: musik berhenti, lalu lanjut dari posisi terakhir.
5. Tekan `U`, lalu klik tombol Musik: musik mati, lalu nyala. Tik hitung mundur dan jingle tetap terdengar walaupun musik mati.
6. Tekan `M`: semua bunyi mati. Tekan `M` lagi: musik kembali.
7. Akhiri ronde: musik berhenti dan jingle terdengar. Podium dan pembahasan tanpa musik.
8. Dengarkan sambungan putaran musik setiap 38,4 detik: tanpa jeda dan tanpa letup.
