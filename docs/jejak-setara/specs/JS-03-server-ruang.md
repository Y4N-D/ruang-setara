# JS-03 — Server ruang

| | |
|---|---|
| Status | DRAF (7 November 2026), menunggu `Spesifikasi disetujui: JS-03` |
| Rencana | `docs/jejak-setara/PLAN.md`, entri JS-03 |
| Keputusan Gerbang 1 | Balasan `Setuju: JS-03` (7 Nov 2026): saran semua usulan diterima (1a sampai 12a); KT-02 sesuai saran (mode nomor absen disediakan, mati secara bawaan, hanya untuk ruang sampai 50 pemain); KT-07 tidak diperlukan (3a); kapasitas ruang mengikuti usulan 11a |
| Server | Paket gratis Cloudflare (Architecture JA-14 dan bagian 13.4) |

## Ringkasan

Sesudah JS-03:

- Setiap ruang adalah satu Durable Object, `RuangJejak`, yang menyimpan keadaannya di SQLite miliknya sendiri. Logikanya berada di modul murni `inti-ruang.ts` yang diuji di Node (JA-11).
- Siswa bisa bergabung dari HP atau laptop: kode ruang, lalu nomor absen bila aktif, lalu nama samaran dan avatar, lalu lobi. Koneksi yang putus tersambung kembali dengan identitas utuh.
- Siklus ruang (lobi, hitung mundur, main, jeda, selesai, ditutup), mengunci ruang, dan mengeluarkan pemain sudah berjalan di server dan diuji. Tombolnya untuk guru dibuat di JS-10.
- D1 memiliki seluruh skema Architecture 5.2 lewat satu migrasi, `0001_awal.sql`.
- Setiap push ke `main` memperbarui lingkungan uji di Cloudflare. Tombol "Jejak: ruang coba" membuat ruang yang bisa dicoba pemilik proyek dari HP.
- `sim:beban`, `test:jejak:server`, dan `db:migrasi:lokal` aktif.

Belum ada akun, layar kelas, kanvas dunia, kejadian, skill, atau skor (JS-04 dan JS-07 sampai JS-10).

## Kaitan PRD

| Acuan | Yang dipenuhi di JS-03 |
|---|---|
| JFR-01 (bagian server) | Pembuatan ruang dengan pengaturan dan benih. Sekarang dipakai ruang coba; konsol memakainya di JS-10 |
| JFR-02 | Kode 5 karakter dari 31 huruf dan angka tanpa yang mirip; tautan `/?kode=KODE` |
| JFR-04 | Masuk tanpa akun: kode, nomor absen bila mode aktif, tiga saran nama samaran dengan acak ulang, dan delapan avatar |
| JFR-05 (sebagian) | Lobi pemain berupa layar HTML dengan jumlah pemain; daftar pemain untuk layar kelas (`lobi`) disusun inti ruang. Berjalan di lobi menunggu JS-07, tampilan layar kelas menunggu JS-10 |
| JFR-06 (bagian server) | Mengunci ruang dan mengeluarkan pemain di inti ruang |
| JFR-08 | Sambung ulang otomatis dengan identitas dan progres utuh |
| PRD 12 | Sampai 100 pemain per ruang (C-8); koneksi putus sampai 2 menit tersambung kembali; lalu lintas per pemain diukur `sim:beban` |
| PRD 13 | Tanpa nama asli; token hanya di `sessionStorage`; alamat IP tidak disimpan |
| Architecture | JA-02, JA-03, JA-04, JA-11, JA-12, JA-13; bagian 5.2, 5.3, 6, 7, 8.2, 8.6, dan 13.4 |

## Berkas yang dibuat dan diubah

| Berkas | Status | Isi |
|---|---|---|
| `server/jejak-setara/src/index.ts` | Diubah | Rute baru, pemeriksaan `Origin`, penerus ke Durable Object, ekspor `RuangJejak`, dan `scheduled` |
| `server/jejak-setara/src/ruang/RuangJejak.ts` | Baru | Durable Object: WebSocket Hibernation API, SQLite, alarm, pengatur waktu, kiriman ke D1 |
| `server/jejak-setara/src/ruang/inti-ruang.ts` | Baru | Logika ruang murni (bagian "Antarmuka inti ruang") |
| `server/jejak-setara/src/ruang/sambungan.ts` | Baru | Batas ukuran dan frekuensi per sambungan, murni |
| `server/jejak-setara/src/ruang/nama-samaran.ts` | Baru | Daftar nama samaran bawaan (D-1) |
| `server/jejak-setara/src/ruang/peta-uji.ts` | Baru | Peta uji 160 × 100 ubin untuk pemeriksaan gerak sampai `kampung.json` dipakai (JS-07) |
| `server/jejak-setara/src/api/ruang.ts` | Baru | Ruang coba, pemeriksaan kode, dan kait uji lokal |
| `server/jejak-setara/src/db/ruang.ts` | Baru | Kueri D1 berparameter |
| `server/jejak-setara/src/keamanan.ts` | Baru | Tajuk JSON, `Origin`, pembanding waktu konstan, hash token |
| `server/jejak-setara/migrations/0001_awal.sql` | Baru | Skema D1 lengkap |
| `server/jejak-setara/wrangler.jsonc` | Diubah | Durable Object, migrasi `v1`, D1, pembatas percobaan, pemicu harian, lingkungan `uji` |
| `app/jejak-setara/pemain/App.tsx` | Diubah | Alur gabung menggantikan halaman kosong |
| `app/jejak-setara/pemain/Gabung.tsx`, `Lobi.tsx`, `LayarRonde.tsx`, `LayarMenyambung.tsx`, `avatar.ts` | Baru | Layar pemain; `avatar.ts` mengambil ikon dari `manifest.ts`, atau *placeholder* bila manifest belum ada |
| `app/jejak-setara/pemain/jaringan.ts` | Baru | Klien WebSocket: sambung ulang, sinkron jam, `safeParse` pesan server |
| `app/jejak-setara/teks.ts` | Diubah | Semua teks bagian "Teks yang tampil"; teks halaman kosong pemain dihapus, teks konsol tetap |
| `app/jejak-setara/styles/jejak.css` | Diubah | Gaya layar gabung, lobi, dan lapisan |
| `app/jejak-setara/inti/protokol.ts` | Diubah | `minta_nama`, `saran_nama`, `NOMOR_ABSEN_DIPAKAI`, batas pemain 100, `dunia.n` |
| `app/jejak-setara/inti/aturan.ts` | Diubah | `BATAS` baru dan `frekuensiGerak()` |
| `app/jejak-setara/inti/tipe.ts` | Diubah | Komentar `batasPemain` 2–100 |
| `app/jejak-setara/__tests__/ruang/` | Baru | `inti-ruang.test.ts`, `sambungan.test.ts`, `nama-samaran.test.ts`, `jaringan.test.ts`, `peta-uji.test.ts` (ikut `test:jejak`) |
| `app/jejak-setara/__tests__/inti/protokol.test.ts`, `aturan.test.ts`, `kemurnian.test.ts` | Diubah | Pesan dan batas baru; kemurnian juga memindai `inti-ruang.ts`, `sambungan.ts`, `nama-samaran.ts`, dan `peta-uji.ts` |
| `app/jejak-setara/__tests__/kerangka.test.ts` | Diubah | Teks, konfigurasi, dan skrip baru; uji Worker JS-01 tetap |
| `server/jejak-setara/uji/` dan `vitest.jejak-server.config.ts` | Baru | Uji Worker, Durable Object, dan D1 (`*.uji-server.ts`), dijalankan `test:jejak:server` |
| `e2e/jejak-setara/gabung.uji.ts` | Baru | Uji ujung ke ujung multi-konteks |
| `e2e/jejak-setara/kerangka.uji.ts` | Diubah | Uji halaman pemain pindah ke `gabung.uji.ts`; uji konsol dan Worker tetap |
| `scripts/jejak-setara/server-lokal.mjs` | Baru | Build, migrasi ke folder keadaan baru, lalu `vite preview`; dipakai uji server, uji ujung ke ujung, dan `sim:beban` |
| `scripts/jejak-setara/simulasi-beban.mjs` | Baru | Bot WebSocket |
| `package.json` | Diubah | Hanya isi tiga skrip (bagian "Skrip") |
| `vite.jejak.config.ts`, `playwright.jejak.config.ts` | Diubah | Folder keadaan lokal dan server uji |
| `.github/workflows/jejak-uji.yml` | Diubah | Uji server dan pekerjaan "Deploy uji" |
| `.github/workflows/jejak-ruang-coba.yml` | Baru | Tombol "Jejak: ruang coba" |
| `web/jejak-setara/index.html`, `web/jejak-setara/admin/index.html` | Diubah | Ikon tab `ikon_jejak.png` (I-17) bila berkasnya ada |
| `docs/jejak-setara/tests/JS-03-hasil.md`, `docs/jejak-setara/tests/JS-03/*.png` | Baru (Test) | Laporan dan tangkapan layar |
| `docs/jejak-setara/Architecture.md`, `PRD.md`, `PLAN.md` | Diubah | Bagian "Perubahan dokumen" |

Tidak disentuh: kode dan dokumen Sehari Setara, galeri, `deploy-pages.yml`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, dependensi dan lockfile, serta berkas Sesi B dan Sesi C.

## Perilaku

### A. Membuat ruang coba (usulan 1a)

- P-1. `POST /api/ruang-coba` hanya hidup bila `LINGKUNGAN` bernilai `lokal` atau `uji`. Di `produksi`, jalur itu menjawab 404 `BELUM_TERSEDIA`, sama dengan jalur yang tidak dikenal.
- P-2. Di `uji`, permintaan wajib membawa tajuk `X-Jejak-Kunci-Coba` yang sama dengan rahasia Worker `KUNCI_COBA`, dibandingkan dengan waktu konstan. Tanpa tajuk, kunci salah, atau rahasia belum ada: 403 `KUNCI_SALAH`. Di `lokal`, kunci tidak diperiksa.
- P-3. Isi permintaan JSON (boleh kosong) diperiksa `zod` `.strict()`: `batasPemain` 2–100 (bawaan 40), `modeNomorAbsen` boolean (bawaan `false`), dan `durasiMenit` 10, 15, atau 20 (bawaan 15). `modeNomorAbsen` benar dengan `batasPemain` lebih dari 50 ditolak 400 `PENGATURAN_SALAH` dengan pesan khusus nomor absen; isi tidak sah lainnya 400 `PENGATURAN_SALAH`.
- P-4. Pengaturan ruang coba: `{ durasiMenit, batasPemain, batasTerlambatMenit: 5, skillAktif: ["lari", "kompas", "petunjuk"], modeNomorAbsen, uji: true }`, label kelas "Ruang coba", tanpa pemilik, tanpa paket, dan benih 32 bit dari `crypto.getRandomValues`.
- P-5. Urutan: buat id ruang (UUID) dan id Durable Object (`newUniqueId()`), tulis baris `ruang` di D1 berstatus `lobi`, lalu panggil `inisialisasi` di Durable Object dengan petunjuk lokasi `apac` (dikoreksi saat Build: `apac-se` tidak sah). Bila kode bentrok dengan ruang yang belum `ditutup`, kode baru dibuat; sesudah 5 kali bentrok: 503 `KODE_HABIS`. Bila Durable Object gagal diinisialisasi, baris D1 diubah menjadi `ditutup` dan jawabannya 503 `RUANG_GAGAL`.
- P-6. Jawaban 201: `{ "ruangId": "…", "kode": "K7MPA", "tautan": "https://{host}/?kode=K7MPA" }`.
- P-7. Alur kerja **"Jejak: ruang coba"** dijalankan dengan tombol **Run workflow** dan punya dua masukan: "Batas pemain (2–100)" (bawaan 40) dan "Mode nomor absen" (bawaan mati). Langkahnya:
  1. Berhenti dengan pesan bila rahasia Cloudflare belum diisi.
  2. Buat kunci acak 32 byte, sembunyikan dari log (`::add-mask::`), lalu simpan sebagai rahasia `KUNCI_COBA` Worker `jejak-setara-uji` lewat `wrangler secret put`.
  3. Cari alamat lingkungan uji: variabel repositori `JEJAK_ALAMAT_UJI` bila ada; selain itu `https://jejak-setara-uji.{subdomain}.workers.dev`, dengan subdomain dari API Cloudflare.
  4. Panggil `POST /api/ruang-coba` paling banyak 10 kali dengan jeda 3 detik, karena rahasia baru perlu beberapa detik untuk berlaku.
  5. Tulis kode ruang, tautan, dan keterangan masa berlaku ke ringkasan alur kerja (teks di bagian "Teks yang tampil").
- P-8. "Jejak: ruang coba" dan pekerjaan "Deploy uji" memakai grup `concurrency` yang sama, `jejak-cloudflare-uji`, tanpa membatalkan yang sedang berjalan, agar penyimpanan rahasia dan deploy tidak bertabrakan.
- P-9. Kait uji, hanya di `lokal`: `POST /api/ruang-coba/{KODE}/kelas` meneruskan satu pesan `skemaKelas` (selain `halo`) ke ruang seolah dari layar kelas, dan `GET /api/ruang-coba/{KODE}/statistik` mengembalikan hitungan ruang (pesan masuk dan keluar, byte keluar, baris SQLite ditulis, putaran, koreksi). Keduanya dipakai uji server, uji ujung ke ujung, dan `sim:beban`. Di `uji` dan `produksi` kedua jalur menjawab 404.

### B. Kode ruang dan pemeriksaan kode

- P-10. Kode terdiri atas 5 karakter dari `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (31 karakter; tanpa 0, O, 1, I, dan L). Kode dibuat dengan `crypto.getRandomValues`; nilai ≥ 248 dibuang agar tidak ada bias modulo (248 = 31 × 8). Kode unik di antara ruang yang belum `ditutup`, dijaga indeks unik bersyarat di D1.
- P-11. Kode yang diketik siswa dinormalkan: huruf kecil menjadi besar, serta spasi dan tanda hubung dibuang. Karakter lain di luar 31 karakter itu membuat kode tidak sah.
- P-12. `GET /api/publik/ruang/{KODE}` hanya membaca D1, tanpa memanggil Durable Object: 200 `{ "ada": true, "modeNomorAbsen": false }` untuk ruang yang belum `ditutup`; 404 `RUANG_TIDAK_ADA` untuk kode yang tidak sah, tidak ada, atau ruang `ditutup`. Ruang penuh, terkunci, dan terlambat baru diperiksa ruang saat `halo` (bagian D). Metode lain: 405 dengan `Allow: GET`.
- P-13. Pembatas percobaan memakai binding *Rate Limiting* Workers (periode 60 detik; kunci = alamat IP yang hanya dipakai sesaat dan tidak disimpan): `GET /api/publik/ruang` dan sambungan `/ws/ruang` masing-masing paling banyak 300 per menit per IP (D-5), cukup untuk satu sekolah yang memakai satu alamat IP. Lewat batas: 429 `TERLALU_SERING`. Bila binding tidak tersedia di runtime lokal, pembatas dilewati di `lokal` saja.

### C. Sambungan WebSocket

- P-14. `GET /ws/ruang/{KODE}` tanpa `Upgrade: websocket`: 426 `PERLU_WEBSOCKET`. `Origin` harus sama dengan asal alamat permintaan; di `lokal` juga boleh `http://localhost:*` dan `http://127.0.0.1:*`. `Origin` lain atau kosong: 403 `ASAL_DITOLAK`. Kode tidak sah, tidak ada, atau ruang `ditutup`: 404 `RUANG_TIDAK_ADA`. Selain itu Worker membuang semua tajuk `X-Jejak-*` dari permintaan, menambahkan `X-Jejak-Peran: pemain` dan `X-Jejak-Ruang: {ruangId}`, lalu meneruskannya ke Durable Object.
- P-15. Durable Object menerima sambungan lewat WebSocket Hibernation API (`acceptWebSocket` dengan tag `pemain`) dan menyimpan `{ sambunganId, pemainId: null }` lewat `serializeAttachment`. Pesan pertama harus `halo` dalam 10 detik; bila tidak, sambungan ditutup dengan kode 4002.
- P-16. Batas per sambungan (`sambungan.ts`): pesan biner, pesan lebih dari 2.048 byte UTF-8, JSON cacat, atau pesan yang gagal `skemaPemain` dihitung sebagai pelanggaran dan diabaikan. Frekuensi dibatasi ember token berkapasitas 40 yang terisi 20 per detik; pesan saat ember kosong dibuang dan dihitung sebagai pelanggaran. Dalam jendela 10 detik, pelanggaran ke-3 mengirim `galat TERLALU_CEPAT` (sekali per jendela), dan pelanggaran ke-10 menutup sambungan dengan kode 1008.
- P-17. `halo` dengan `v` selain `PROTOKOL_VERSI` dijawab `galat VERSI_BERBEDA` (dengan `v` server), lalu sambungan ditutup 4005. Pesan sah yang tidak sesuai keadaan (misalnya `gerak` di lobi, `pilih_identitas` sesudah punya identitas, atau `periksa` di JS-03) diabaikan tanpa dihitung sebagai pelanggaran.

### D. Bergabung

- P-18. Klien: layar Kode, lalu `GET /api/publik/ruang/{KODE}`, lalu layar Nomor absen bila `modeNomorAbsen` benar, lalu membuka WebSocket dan mengirim `halo` berisi `nomorAbsen` (bila mode aktif) dan `token` (bila ada di `sessionStorage` untuk kode itu).
- P-19. Pemain baru diterima bila: status bukan `ditutup`; ruang tidak terkunci; jumlah pemain (termasuk yang terputus, tanpa yang dikeluarkan) kurang dari `batasPemain`; dan waktu ronde tanpa jeda sejak `mulaiPada` paling lama `batasTerlambatMenit`. Lobi dan hitung mundur selalu boleh; `selesai` dan `pembahasan` tidak. Galat sebelum sambungan ditutup 4003: `RUANG_TERKUNCI`, `RUANG_PENUH`, atau `TERLAMBAT`.
- P-20. Bila mode nomor absen aktif, `halo` pemain baru tanpa `nomorAbsen` dihitung pelanggaran dan sambungan ditutup 1008. `nomorAbsen` yang sudah dipakai pemain lain di ruang itu dijawab `galat NOMOR_ABSEN_DIPAKAI`; pemain belum dibuat, sambungan tetap terbuka, dan klien boleh mengirim `halo` lagi dengan nomor lain (D-3).
- P-21. Pemain baru mendapat `pemainId` (8 karakter acak base64url), token 32 byte acak (43 karakter base64url) yang disimpan server hanya sebagai hash SHA-256, dan nomor urutan bergabung. Server mengirim `selamat_datang` (status, pengaturan, `waktuServer`, `versiPeta`, tiga `saranNama`, dan `avatarTersedia` berisi 0–7), lalu `pemain_baru` untuk setiap pemain yang sudah punya identitas.
- P-22. Saran nama: tiga nama berbeda dari daftar bawaan yang belum dipakai pemain lain di ruang itu dan, bila masih ada, tidak sama dengan saran sebelumnya bagi pemain itu. Pilihan memakai pembangkit acak yang diberikan pembungkus kepada inti ruang. `minta_nama` mengganti ketiga saran dan dijawab `saran_nama`. Bila nama bebas kurang dari tiga, saran berisi nama yang tersisa.
- P-23. `pilih_identitas`: `nama` harus salah satu saran terakhir pemain itu dan belum dipakai; `avatar` 0–7, boleh sama antarpemain. Bila sah, server memberi warna tas yang paling sedikit dipakai di ruang (bila seri: urutan `sun`, `mango`, `coral`, `rose`, `berry`, `teal`, `leaf`, `sky-d`), menyimpan identitas, lalu mengirim `pemain_baru` ke semua pemain berkeidentitas, termasuk pemain itu sendiri sebagai tanda masuk lobi. Bila `nama` sudah dipakai atau bukan saran terakhirnya: `galat NAMA_DIPAKAI`, diikuti `saran_nama` baru.
- P-24. Pemain yang belum memilih identitas dan terputus lebih dari 5 menit dihapus, sehingga tempatnya kembali. Pembersihan berjalan saat ada pemain baru dan saat alarm.
- P-25. Klien menyimpan token di `sessionStorage` dengan kunci `jejak:token:{KODE}`, dan hanya itu. Token tidak pernah ditulis ke log, alamat, atau pesan galat.

### E. Sambung ulang dan jam

- P-26. `halo` dengan `token` yang cocok melanjutkan pemain yang sama (pemainId, nama, avatar, warna tas, nomor absen, dan urutan bergabung). Kunci ruang, batas pemain, dan batas terlambat tidak berlaku untuk sambung ulang. Server mengirim `selamat_datang` (token sama; `saranNama` kosong bila sudah punya identitas), `status_ruang`, dan `pemain_baru` untuk setiap pemain berkeidentitas. Token yang tidak dikenal diperlakukan sebagai pemain baru. Token pemain yang dikeluarkan dijawab `galat DIKELUARKAN`, lalu sambungan ditutup 4004.
- P-27. Bila pemain yang sama tersambung lagi sementara sambungan lamanya masih terbuka, sambungan lama ditutup dengan kode 4001 dan yang baru dipakai.
- P-28. Sambungan yang putus membuat pemain bertanda `terhubung: false` dengan waktu putusnya. Pemain lain tidak menerima `pemain_pergi`; tanda pucat dibuat di JS-07 dan JS-10. `pemain_pergi` hanya dikirim saat pemain dikeluarkan.
- P-29. Klien mencoba menyambung lagi sesudah 0,5, 1, 2, 4, lalu 8 detik, dan seterusnya setiap 8 detik selama tab terbuka. Percobaan juga langsung dimulai saat peramban kembali daring (`online`) atau tab kembali terlihat. Lapisan "Menyambung ulang…" tampil segera sesudah sambungan putus di luar kehendak; sesudah 30 detik ditambah kalimat tentang wifi, dan sesudah 2 menit ditambah tombol "Muat ulang" (D-6). Sambung ulang berhenti pada `DIKELUARKAN`, `RUANG_TIDAK_ADA`, `VERSI_BERBEDA`, dan status `ditutup`.
- P-30. Memuat ulang halaman di tab yang sama memakai token yang sama, sehingga pemain kembali ke lobi tanpa memilih nama lagi.
- P-31. Sinkron jam: klien mengirim `ping` setiap 5 detik. Dari lima `pong` terakhir, selisih jam = median dari `waktuServer + rtt ÷ 2 − waktuTerima`. Selisih ini dipakai hitung mundur dan sisa waktu di layar sementara (bagian I).

### F. Siklus ruang

Pesan layar kelas diproses inti ruang. Di JS-03 pesan itu datang dari uji unit, uji server, dan kait uji lokal (P-9); rute layar kelas dibuat di JS-10.

- P-32. `mulai` (status `lobi`): status `hitung_mundur`, `mulaiPada` = sekarang + 3.000 ms, `berakhirPada` = `mulaiPada` + durasi, dan alarm pada `mulaiPada`. Saat alarm berbunyi: status `main`, putaran 100 ms mulai, dan alarm pada `berakhirPada`.
- P-33. `jeda` (status `main`): status `jeda`, `jedaSejak` = sekarang, putaran berhenti, alarm akhir ronde dihapus. `lanjut` (status `jeda`): `berakhirPada` dan `jedaMs` bertambah sebesar lama jeda, status `main`, lalu putaran dan alarm dipasang lagi.
- P-34. `tambah_waktu` (status `main` atau `jeda`): `berakhirPada` bertambah `detik` × 1.000; alarm dipasang ulang bila status `main`.
- P-35. Waktu habis atau `akhiri` (status `main` atau `jeda`): status `selesai`, putaran berhenti, peringkat akhir dihitung `hitungPeringkat` (di JS-03 semua skor 0, jadi urutan bergabung yang menentukan), dan antrean kiriman dikirim seluruhnya. Pesan `selesai` berisi rekap dibuat di JS-11.
- P-36. `tutup_ruang` (status `selesai` atau `pembahasan`): status `ditutup`, `status_ruang` dikirim, semua sambungan ditutup dengan kode 4000, dan baris D1 diperbarui. Ruang juga ditutup otomatis 3 jam sesudah sambungan terakhir putus, atau 6 jam sesudah dibuat. Penyimpanan Durable Object dihapus (`deleteAll`) 24 jam sesudah ditutup, hanya bila antrean kiriman sudah kosong.
- P-37. `kunci_ruang` (semua status kecuali `ditutup`) menyimpan tanda terkunci (P-19). `keluarkan`: pemain bertanda dikeluarkan, menerima `galat DIKELUARKAN`, sambungannya ditutup 4004, pemain lain menerima `pemain_pergi`, dan tokennya tidak berlaku lagi. Namanya tetap terpakai.
- P-38. `pembahasan` dan `kode_masuk_ulang` diabaikan di JS-03 (JS-11 dan JS-17).
- P-39. Setiap perubahan status mengirim `status_ruang` ke semua pemain. Inti ruang juga menyusun `lobi` setiap kali daftar pemain berubah, untuk layar kelas di JS-10.
- P-40. Satu Durable Object hanya punya satu alarm. Inti ruang menghitung tenggat terdekat dari semua jadwal (hitung mundur, akhir ronde, tutup otomatis, hapus penyimpanan, dan kiriman yang gagal), dan pembungkus memasang alarm itu.

### G. Gerak dan `dunia` (status `main`)

- P-41. Posisi awal pemain di `titikMuncul` peta, bergiliran menurut urutan bergabung. Sampai `kampung.json` Sesi C dipakai di JS-07, server memakai peta uji 160 × 100 ubin dengan dinding di tepi dan delapan blok padat 4 × 4 ubin (`versiPeta` 1). Peta uji dibentuk dari teks RLE dengan `uraiRle` saat modul dimuat, tanpa `zod`, dan keabsahannya diuji `bacaPeta` di uji unit.
- P-42. Setiap `gerak` diperiksa `periksaGerak` (JS-02) dengan `dtMs` = selang jam server sejak laporan sah terakhir pemain itu. Laporan yang ditolak karena `kecepatan` atau `tabrakan` dijawab `koreksi`.
- P-43. Setiap 100 ms, setiap pemain menerima `dunia` berisi pemain lain yang posisinya berubah sejak putaran sebelumnya dan berada di dalam kotak 480 × 270 piksel logis di sekitarnya, paling banyak 24 yang terdekat, dengan `n` = jumlah pemain berkeidentitas. Pemain yang tidak punya isi tidak dikirimi `dunia` pada putaran itu.
- P-44. Frekuensi `gerak` klien mengikuti `frekuensiGerak(batasPemain)` di `inti/aturan.ts`: 10 per detik saat bergerak, atau 6 per detik bila `batasPemain` lebih dari 50; 1 per detik saat diam. Di JS-03 hanya bot `sim:beban` dan uji yang mengirim `gerak`; layar pemain mulai mengirimnya di JS-07.

### H. Penyimpanan dan kiriman ke D1

- P-45. SQLite Durable Object berisi tabel `meta`, `pemain`, dan `kiriman` (bagian "Penyimpanan Durable Object"), dibuat dengan `CREATE TABLE IF NOT EXISTS` di konstruktor. Tabel lain di Architecture 5.3 ditambahkan fitur yang memakainya.
- P-46. Yang ditulis ke SQLite hanya: pemain baru, saran nama, identitas, sambungan putus (ditambah posisi terakhir bila status `main`), dikeluarkan, perubahan status dan jadwal, serta antrean kiriman. Laporan `gerak` tidak pernah ditulis (Architecture 13.4).
- P-47. Setiap perubahan peserta atau status ruang menambah baris `kiriman`. Bila antrean berisi, pengatur waktu 30 detik dipasang (bukan alarm). Saat berbunyi, isi antrean dikirim ke D1 dalam satu `batch`: `INSERT … ON CONFLICT(id) DO UPDATE` untuk `peserta`, dan `UPDATE` untuk `ruang` (`status`, `mulai_pada`, `selesai_pada`). Sesudah berhasil, baris antrean dihapus. Bila gagal, kiriman dicoba lagi lewat jadwal alarm dengan jeda 30 detik, 1, 2, 4, lalu 8 menit. Saat ronde selesai dan sebelum ruang ditutup, antrean dikirim segera.
- P-48. Saat bangun dari hibernasi atau dimuat ulang, Durable Object membangun keadaan dari SQLite dan dari lampiran sambungan (`getWebSockets`, `deserializeAttachment`), lalu menjadwalkan lagi antrean kiriman yang tersisa.

### I. Halaman pemain

- P-49. Urutan layar: Kode, (Nomor absen), Menghubungkan, Identitas, lalu Lobi. Ditambah layar sementara Hitung mundur, Ronde berjalan, Selesai, dan Ruang ditutup (diganti di JS-07 dan JS-11), lapisan Dijeda dan Menyambung ulang, serta layar Galat. Semua layar memakai panel berbingkai piksel di tengah seperti halaman JS-01 (paling lebar 560 px) di atas latar `ink`, dan bekerja di HP tegak maupun mendatar. Ajakan memutar HP dibuat di JS-07 bersama dunia.
- P-50. Layar Kode: isian 5 karakter (Press Start 2P 20 px, jarak huruf lebar, `autocapitalize="characters"`, `autocomplete="off"`, `inputmode="text"`, `maxlength` 5), tombol "Masuk" yang aktif bila kode sah, dan penanda server JS-01 di kaki panel (D-4). Bila alamat berisi `?kode=`, isian langsung terisi dan diperiksa.
- P-51. Layar Identitas: tiga tombol nama dengan perilaku tombol pilihan Design System bagian 10 (biasa `cream`; terpilih `sun` dengan ▶ dan cincin dalam), tombol "Acak ulang", kisi delapan tombol avatar 64 × 64 px (ikon 16 × 16 diperbesar ×3 dengan piksel tajam, `aria-label` "Avatar 1" sampai "Avatar 8"), dan tombol "Gabung" yang `aria-disabled` sampai nama dan avatar dipilih. Di layar mendatar, nama dan avatar berdampingan; selain itu bersusun.
- P-52. Layar Lobi: kode ruang, ikon avatar dan nama sendiri, jumlah pemain, "Menunggu guru memulai…", dan "Jangan tutup tab ini.". Jumlah pemain dihitung dari `pemain_baru` dan `pemain_pergi`. Ikon avatar tampil dengan warna kuncinya; penggantian warna tas dibuat di JS-07.
- P-53. Keyboard: semua isian dan tombol bisa dicapai dengan `Tab`; `Enter` mengirim layar yang aktif; panah berpindah di kelompok nama dan kelompok avatar (`role="radiogroup"`); fokus selalu terlihat (latar `sun` dan ▶). Target sentuh ≥ 48 × 48 px dengan jarak ≥ 8 px.
- P-54. Pengumuman pembaca layar lewat wilayah `aria-live="polite"`, dengan jarak minimal 2 detik: galat, masuk lobi, ronde dimulai, dijeda, dilanjutkan, selesai, menyambung ulang, dan tersambung kembali.
- P-55. Setiap pesan server diperiksa `skemaServerPemain.safeParse`. Pesan cacat diabaikan dan dihitung. Teks yang tampil selalu dari `teks.ts`, dipilih menurut `kode` galat; satu-satunya teks dari server yang tampil adalah nama samaran. Kolom `pesan` pada `galat` diisi server dengan teks yang sama dari `teks.ts`.

## Beberapa pemain sekaligus

- Dua pemain memilih nama yang sama hampir bersamaan: Durable Object memproses pesan satu per satu, sehingga yang pertama mendapat nama itu dan yang kedua menerima `NAMA_DIPAKAI` beserta saran baru. Tidak pernah ada nama ganda di satu ruang.
- Ruang hampir penuh: pemain berikutnya sesudah `batasPemain` tercapai menerima `RUANG_PENUH`. Pemain yang terputus tetap memegang tempatnya; pemain tanpa identitas yang terputus lebih dari 5 menit melepaskannya (P-24).
- Nomor absen yang sama: pemain kedua menerima `NOMOR_ABSEN_DIPAKAI`.
- 100 pemain: setiap pemain yang bergabung menerima paling banyak 100 `pemain_baru`; `dunia` dibatasi 24 pemain terdekat; `gerak` 6 per detik (P-44); diuji dengan 1 ruang × 100 bot.
- Satu siswa membuka dua tab: setiap tab punya `sessionStorage` sendiri, jadi menjadi dua pemain. Hal ini diterima; guru bisa mengeluarkan salah satunya (JS-10).
- Sepuluh ruang serentak berjalan di sepuluh Durable Object terpisah dan tidak saling memengaruhi; diuji dengan 10 ruang × 50 bot.

## Status antarmuka

| Status | Kapan | Tampilan |
|---|---|---|
| Biasa | Layar Kode pertama kali dibuka | Isian kosong, "Masuk" nonaktif |
| Fokus | Isian atau tombol difokus | Latar `sun` dengan ▶ (tombol) atau garis `ink` tebal (isian) |
| Nonaktif | "Masuk" sebelum kode sah; "Gabung" sebelum nama dan avatar dipilih; tombol selama memuat | `mist` dengan teks `dusk`, `aria-disabled="true"` |
| Kosong | Lobi dengan satu pemain | "1 pemain di ruang" |
| Memuat | Memeriksa kode; membuka sambungan | "Memeriksa kode…" di bawah isian; layar "Menghubungkan ke ruang…" |
| Galat | Kode atau nomor absen salah, server tak terjangkau | Pita `mango` dengan tanda "!" dan teks `ink` di bawah isian; fokus pindah ke isian |
| Terputus, menyambung ulang | Sambungan putus di luar kehendak | Lapisan `ink` 70% di atas layar mana pun, "Menyambung ulang…" dan `ikon_menyambung.png` dua bingkai; kalimat tambahan sesudah 30 detik; tombol "Muat ulang" sesudah 2 menit |
| Dijeda | Status `jeda` | Lapisan `ink` 70% dengan "Dijeda oleh guru" (Press Start 2P) |
| Ruang penuh, terkunci, terlambat | `galat` sebelum masuk | Layar Galat dengan kalimatnya dan tombol "Kembali" ke layar Kode |
| Dikeluarkan | `galat DIKELUARKAN` | Layar Galat dengan tombol "Kembali"; token dihapus dari `sessionStorage` |
| Versi berbeda | `galat VERSI_BERBEDA` | Layar Galat dengan tombol "Muat ulang" |
| Ditutup | Status `ditutup` atau `RUANG_TIDAK_ADA` saat sambung ulang | Layar "Ruang ditutup" dengan tombol "Kembali"; token dihapus |
| Kurangi gerak | `prefers-reduced-motion` | Ikon menyambung diam di bingkai pertama; angka hitung mundur berganti tanpa efek |

## Teks yang tampil (final)

Semua teks berada di `app/jejak-setara/teks.ts` (D-2). `{n}` dan `{kode}` diisi antarmuka.

| Tempat | Teks |
|---|---|
| Layar Kode, judul | Jejak Setara |
| Layar Kode, label isian | Kode ruang |
| Layar Kode, petunjuk | Ketik 5 huruf atau angka dari layar guru. |
| Layar Kode, tombol | Masuk |
| Layar Kode, memeriksa | Memeriksa kode… |
| Galat format kode | Kode berisi 5 huruf atau angka. |
| `RUANG_TIDAK_ADA` | Kode ruang tidak ditemukan. Periksa lagi kodenya. |
| Server tak terjangkau | Tidak bisa menghubungi server. Periksa wifi atau data selulermu. |
| `TERLALU_SERING` | Terlalu banyak percobaan. Tunggu sebentar. |
| Layar Nomor absen, judul | Nomor absen |
| Layar Nomor absen, label isian | Nomor absenmu |
| Layar Nomor absen, petunjuk | Isi nomor absen dari daftar kelas (1–50). |
| Layar Nomor absen, tombol | Lanjut |
| Galat nomor absen | Nomor absen harus 1 sampai 50. |
| `NOMOR_ABSEN_DIPAKAI` | Nomor absen ini sudah dipakai di ruang ini. Periksa lagi nomormu. |
| Layar Menghubungkan | Menghubungkan ke ruang… |
| Layar Identitas, judul | Pilih nama dan avatar |
| Layar Identitas, kelompok nama | Nama samaran |
| Layar Identitas, tombol acak | Acak ulang |
| Layar Identitas, kelompok avatar | Avatar |
| Layar Identitas, label avatar | Avatar 1 … Avatar 8 |
| Layar Identitas, tombol | Gabung |
| `NAMA_DIPAKAI` | Nama itu baru saja dipakai pemain lain. Pilih nama lain. |
| Lobi, judul | Lobi |
| Lobi, label kode | Kode ruang |
| Lobi, jumlah | {n} pemain di ruang |
| Lobi, menunggu | Menunggu guru memulai… |
| Lobi, saran | Jangan tutup tab ini. |
| Hitung mundur, judul | Bersiap |
| Hitung mundur, angka | 3, 2, 1 |
| Ronde berjalan, judul | Ronde berjalan |
| Ronde berjalan, label | Sisa waktu |
| Ronde berjalan, nilai | mm:ss, misalnya 14:59 (D-7) |
| Lapisan jeda | Dijeda oleh guru |
| Selesai, judul | Ronde selesai |
| Selesai, kalimat | Tunggu arahan guru. |
| Ditutup, judul | Ruang ditutup |
| Ditutup, kalimat | Terima kasih sudah bermain. |
| Lapisan menyambung | Menyambung ulang… |
| Lapisan menyambung, sesudah 30 detik | Periksa wifi atau data selulermu. |
| Lapisan menyambung, sesudah 2 menit, tombol | Muat ulang |
| `RUANG_PENUH` | Ruang sudah penuh. Beri tahu gurumu. |
| `RUANG_TERKUNCI` | Ruang sudah dikunci guru. |
| `TERLAMBAT` | Ronde sudah berjalan terlalu lama untuk bergabung. |
| `DIKELUARKAN` | Kamu dikeluarkan dari ruang oleh guru. |
| `VERSI_BERBEDA` | Ada pembaruan. Muat ulang halaman. |
| `TERLALU_CEPAT` (tidak tampil; isi kolom `pesan`) | Pesan terlalu cepat. |
| `BUKAN_JANGKAUAN` (tidak tampil; isi kolom `pesan`) | Terlalu jauh dari kejadian. |
| Tombol layar Galat | Kembali · Muat ulang |
| Pengumuman pembaca layar | Kamu sudah masuk lobi. · Ronde dimulai. · Ronde dijeda. · Ronde dilanjutkan. · Ronde selesai. · Menyambung ulang. · Tersambung kembali. |
| Penanda server (kaki layar Kode, tetap dari JS-01) | Memeriksa server… · ✓ Server siap · ! Server belum tersambung |
| API `KUNCI_SALAH` | Kunci ruang coba tidak cocok. |
| API `PENGATURAN_SALAH` | Pengaturan ruang tidak sah. · Mode nomor absen hanya untuk ruang sampai 50 pemain. |
| API `KODE_HABIS` | Gagal membuat kode ruang. Coba lagi. |
| API `RUANG_GAGAL` | Ruang gagal dibuat. Coba lagi. |
| API `PERLU_WEBSOCKET` | Alamat ini hanya untuk sambungan permainan. |
| API `ASAL_DITOLAK` | Permintaan ditolak. |
| API `PESAN_SALAH` | Pesan tidak sah. |
| Alur kerja ruang coba, nama dan masukan | Jejak: ruang coba · Batas pemain (2–100) · Mode nomor absen |
| Alur kerja ruang coba, ringkasan | Kode ruang: {kode} · Tautan: {tautan} · Ruang ini tertutup sendiri 6 jam sesudah dibuat, atau 3 jam sesudah tidak ada yang tersambung. |
| Alur kerja, rahasia belum ada | Rahasia Cloudflare belum diisi (Architecture bagian 18, langkah 6). |
| Alur kerja uji, pekerjaan baru | Deploy uji · langkah: Periksa rahasia, Pasang dependensi, Build Jejak (uji), Migrasi D1 uji, Deploy Worker uji, Periksa lingkungan uji |
| Alur kerja uji, deploy dilewati | Deploy dilewati: rahasia Cloudflare atau Database ID uji belum diisi (Architecture bagian 18). |
| Alur kerja uji, langkah uji server | Uji server Jejak |

Judul tab tetap "Jejak Setara". Teks konsol JS-01 tidak berubah.

## Data, protokol, API, dan migrasi

### Protokol

Perubahan berikut dibuat sebelum deploy pertama, saat belum ada klien terpasang di mana pun, sehingga `PROTOKOL_VERSI` tetap 1 (keputusan Gerbang 1, usulan 7a dan 11a). Sesudah deploy pertama, aturan wajib 14 berlaku penuh.

- Baru, pemain ke server: `minta_nama`, `{ "v": 1, "t": "minta_nama" }`.
- Baru, server ke pemain: `saran_nama`, `{ "v": 1, "t": "saran_nama", "saranNama": ["Kancil Jingga", "Jalak Biru", "Anoa Hijau"] }`, berisi 0–3 nama (masing-masing ≤ 24 karakter).
- `KODE_GALAT` ditambah `NOMOR_ABSEN_DIPAKAI`.
- `BATAS_PESAN.pemainMaks` 50 menjadi 100. Batas ini dipakai `lobi`, `dunia_kelas`, `papan`, nilai `peringkat`, dan `pengaturan.batasPemain`. `dunia.n` memakai `pemainMaks`, bukan `duniaMaks`; `duniaMaks` tetap 64.
- `BATAS` di `aturan.ts`: `pemainMaks` menjadi 100; baru `pemainMaksNomorAbsen` 50, `duniaTerdekat` 24, `gerakPerDetik` 10, `gerakPerDetikRuangBesar` 6, `gerakDiamPerDetik` 1, `pingMs` 5.000, dan `haloMs` 10.000. Fungsi baru `frekuensiGerak(batasPemain)` mengembalikan 10 atau 6.
- Jumlah pesan per skema menjadi 11 (pemain ke server), 11 (layar kelas ke server), 18 (server ke pemain), dan 7 (server ke layar kelas).
- Kode penutupan sambungan: 1008 pelanggaran; 4000 ruang ditutup; 4001 diganti sambungan baru; 4002 tanpa `halo`; 4003 ditolak masuk (penuh, terkunci, terlambat); 4004 dikeluarkan; 4005 versi berbeda.

### API

Semua jawaban JSON memakai kelima tajuk JS-01 dan bentuk galat `{ "galat": { "kode": "…", "pesan": "…" } }`.

| Metode dan jalur | Lingkungan | Jawaban |
|---|---|---|
| `POST /api/ruang-coba` | `lokal`; `uji` dengan `X-Jejak-Kunci-Coba` | 201, 400 `PENGATURAN_SALAH`, 403 `KUNCI_SALAH`, 404 di `produksi`, 503 `KODE_HABIS` atau `RUANG_GAGAL` |
| `POST /api/ruang-coba/{KODE}/kelas` | `lokal` | 200 `{ "ok": true }`, 400 `PESAN_SALAH`, 404 |
| `GET /api/ruang-coba/{KODE}/statistik` | `lokal` | 200 hitungan ruang, 404 |
| `GET /api/publik/ruang/{KODE}` | Semua | 200, 404 `RUANG_TIDAK_ADA`, 405, 429 `TERLALU_SERING` |
| `GET /ws/ruang/{KODE}` (WebSocket) | Semua | 101, 403 `ASAL_DITOLAK`, 404 `RUANG_TIDAK_ADA`, 426 `PERLU_WEBSOCKET`, 429 `TERLALU_SERING` |
| `GET /api/sehat` | Semua | Tetap seperti JS-01 |

### Migrasi D1 `0001_awal.sql`

Seluruh skema Architecture 5.2 dalam satu migrasi (usulan 4a). Waktu disimpan sebagai bilangan bulat milidetik UTC; id berupa teks (UUID), kecuali `rujukan.id` (`JR-xx`) dan `kejadian.kode` (`K-xx`); nilai benar-salah berupa 0 atau 1.

```sql
CREATE TABLE pengguna (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nama_tampilan TEXT NOT NULL,
  peran TEXT NOT NULL CHECK (peran IN ('admin', 'guru')),
  peninjau INTEGER NOT NULL DEFAULT 0 CHECK (peninjau IN (0, 1)),
  hash_sandi TEXT NOT NULL,
  garam TEXT NOT NULL,
  iterasi INTEGER NOT NULL,
  wajib_ganti_sandi INTEGER NOT NULL DEFAULT 1 CHECK (wajib_ganti_sandi IN (0, 1)),
  aktif INTEGER NOT NULL DEFAULT 1 CHECK (aktif IN (0, 1)),
  dibuat_pada INTEGER NOT NULL,
  masuk_terakhir INTEGER
);
CREATE TABLE sesi (
  hash_token TEXT PRIMARY KEY,
  pengguna_id TEXT NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
  dibuat_pada INTEGER NOT NULL,
  terakhir_dipakai INTEGER NOT NULL,
  kedaluwarsa INTEGER NOT NULL
);
CREATE INDEX sesi_pengguna ON sesi(pengguna_id);
CREATE INDEX sesi_kedaluwarsa ON sesi(kedaluwarsa);
CREATE TABLE batas_masuk (
  kunci TEXT PRIMARY KEY,
  jumlah INTEGER NOT NULL,
  jendela_mulai INTEGER NOT NULL,
  terkunci_sampai INTEGER
);
CREATE TABLE rujukan (
  id TEXT PRIMARY KEY CHECK (id GLOB 'JR-[0-9][0-9]*'),
  teks TEXT NOT NULL,
  sumber TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'belum' CHECK (status IN ('belum', 'terverifikasi')),
  diverifikasi_oleh TEXT REFERENCES pengguna(id),
  diverifikasi_pada INTEGER,
  catatan TEXT,
  kode_sehari TEXT
);
CREATE TABLE kejadian (
  id TEXT PRIMARY KEY,
  kode TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draf' CHECK (status IN ('draf', 'tinjau', 'terbit', 'arsip')),
  versi_terbit_id TEXT REFERENCES kejadian_versi(id),
  pemilik_id TEXT REFERENCES pengguna(id),
  diubah_pada INTEGER NOT NULL
);
CREATE TABLE kejadian_versi (
  id TEXT PRIMARY KEY,
  kejadian_id TEXT NOT NULL REFERENCES kejadian(id),
  nomor INTEGER NOT NULL,
  isi_json TEXT NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('kerja', 'terbit')),
  dibuat_oleh TEXT REFERENCES pengguna(id),
  dibuat_pada INTEGER NOT NULL,
  catatan_perubahan TEXT
);
CREATE UNIQUE INDEX kejadian_versi_kerja ON kejadian_versi(kejadian_id) WHERE jenis = 'kerja';
CREATE UNIQUE INDEX kejadian_versi_nomor ON kejadian_versi(kejadian_id, nomor) WHERE jenis = 'terbit';
CREATE TABLE paket (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  deskripsi TEXT,
  aktif INTEGER NOT NULL DEFAULT 1 CHECK (aktif IN (0, 1))
);
CREATE TABLE paket_kejadian (
  paket_id TEXT NOT NULL REFERENCES paket(id) ON DELETE CASCADE,
  kejadian_id TEXT NOT NULL REFERENCES kejadian(id),
  urutan INTEGER NOT NULL,
  PRIMARY KEY (paket_id, kejadian_id)
);
CREATE TABLE ruang (
  id TEXT PRIMARY KEY,
  kode TEXT NOT NULL CHECK (length(kode) = 5),
  pemilik_id TEXT REFERENCES pengguna(id),
  label_kelas TEXT NOT NULL,
  paket_id TEXT REFERENCES paket(id),
  pengaturan_json TEXT NOT NULL,
  benih INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('lobi', 'hitung_mundur', 'main', 'jeda', 'selesai', 'pembahasan', 'ditutup')),
  uji INTEGER NOT NULL DEFAULT 0 CHECK (uji IN (0, 1)),
  do_id TEXT NOT NULL,
  dibuat_pada INTEGER NOT NULL,
  mulai_pada INTEGER,
  selesai_pada INTEGER,
  ringkasan_json TEXT
);
CREATE UNIQUE INDEX ruang_kode_aktif ON ruang(kode) WHERE status <> 'ditutup';
CREATE INDEX ruang_pemilik ON ruang(pemilik_id, dibuat_pada);
CREATE INDEX ruang_dibuat ON ruang(dibuat_pada);
CREATE TABLE peserta (
  id TEXT PRIMARY KEY,
  ruang_id TEXT NOT NULL REFERENCES ruang(id) ON DELETE CASCADE,
  nama_samaran TEXT NOT NULL,
  avatar INTEGER NOT NULL CHECK (avatar BETWEEN 0 AND 7),
  warna_tas TEXT NOT NULL,
  nomor_absen INTEGER CHECK (nomor_absen BETWEEN 1 AND 50),
  skor INTEGER NOT NULL DEFAULT 0,
  waktu_skor_ms INTEGER,
  langkah1_benar INTEGER NOT NULL DEFAULT 0,
  jumlah_kejadian INTEGER NOT NULL DEFAULT 0,
  gabung_pada INTEGER NOT NULL,
  peringkat_akhir INTEGER
);
CREATE INDEX peserta_ruang ON peserta(ruang_id);
CREATE TABLE jawaban (
  id TEXT PRIMARY KEY,
  ruang_id TEXT NOT NULL REFERENCES ruang(id) ON DELETE CASCADE,
  peserta_id TEXT NOT NULL REFERENCES peserta(id) ON DELETE CASCADE,
  kejadian_versi_id TEXT NOT NULL REFERENCES kejadian_versi(id),
  urutan_opsi_json TEXT NOT NULL,
  langkah1_opsi TEXT,
  langkah1_benar INTEGER CHECK (langkah1_benar IN (0, 1)),
  petunjuk_dipakai INTEGER NOT NULL DEFAULT 0 CHECK (petunjuk_dipakai IN (0, 1)),
  langkah2_opsi TEXT,
  tingkat TEXT CHECK (tingkat IN ('tepat', 'kurang', 'berisiko')),
  poin INTEGER NOT NULL DEFAULT 0 CHECK (poin BETWEEN 0 AND 100),
  dibuka_pada INTEGER NOT NULL,
  langkah1_pada INTEGER,
  langkah2_pada INTEGER,
  UNIQUE (peserta_id, kejadian_versi_id)
);
CREATE INDEX jawaban_ruang ON jawaban(ruang_id);
CREATE INDEX jawaban_versi ON jawaban(kejadian_versi_id);
CREATE TABLE pengaturan (
  kunci TEXT PRIMARY KEY,
  nilai_json TEXT NOT NULL
);
CREATE TABLE log_audit (
  id TEXT PRIMARY KEY,
  pengguna_id TEXT REFERENCES pengguna(id),
  aksi TEXT NOT NULL,
  sasaran TEXT,
  rincian_json TEXT,
  waktu INTEGER NOT NULL
);
CREATE INDEX log_audit_waktu ON log_audit(waktu);
```

- `ruang.pemilik_id` dan `ruang.paket_id` boleh kosong untuk ruang coba. Ruang yang dibuat guru di JS-10 selalu mengisi keduanya; aturan itu dijaga kode, bukan skema.
- `kejadian.versi_terbit_id` merujuk tabel yang dibuat sesudahnya; SQLite mengizinkannya, dan aturan kunci asing berlaku saat data ditulis.
- Isi `rujukan` dan bank kejadian disemai JS-05 (Sesi B) ke tabel ini, dengan semua rujukan berstatus `belum`. Migrasi ini tidak menyemai data apa pun.

### Penyimpanan Durable Object

```sql
CREATE TABLE IF NOT EXISTS meta (kunci TEXT PRIMARY KEY, nilai TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS pemain (
  id TEXT PRIMARY KEY,
  hash_token TEXT NOT NULL UNIQUE,
  urutan INTEGER NOT NULL,
  nama TEXT,
  avatar INTEGER,
  warna_tas TEXT,
  nomor_absen INTEGER,
  saran_json TEXT NOT NULL,
  terhubung INTEGER NOT NULL,
  terputus_sejak INTEGER,
  posisi_json TEXT,
  dikeluarkan INTEGER NOT NULL DEFAULT 0,
  gabung_pada INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS kiriman (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jenis TEXT NOT NULL,
  isi_json TEXT NOT NULL,
  dibuat_pada INTEGER NOT NULL
);
```

Kunci `meta`: `skema` (1), `ruang` (id, kode, pengaturan, benih, `dibuatPada`), `status`, `waktu` (`mulaiPada`, `berakhirPada`, `jedaSejak`, `jedaMs`), `terkunci`, `sambunganTerakhirPutus`, dan `jadwal`.

### Antarmuka inti ruang

`inti-ruang.ts` tidak memakai API Workers, jam, atau acak langsung (uji kemurnian). Pembungkus memberi waktu `sekarang` dan fungsi acak di setiap panggilan:

- `buatRuang(data)` dan `pulihkan(barisSqlite)` membentuk keadaan.
- `terimaPemain(sambunganId, pesan, sekarang, acak)`, `terimaKelas(pesan, sekarang)`, `sambunganPutus(sambunganId, sekarang)`, `putaran(sekarang)`, dan `alarm(sekarang)` mengembalikan `Keluaran`: pesan yang dikirim (ke satu sambungan, semua pemain, atau layar kelas), sambungan yang ditutup beserta kodenya, perubahan SQLite, baris kiriman, dan tenggat alarm berikutnya.
- Fungsi yang sama dipakai uji unit dengan jam tiruan dan acak berbenih.

### Konfigurasi

`server/jejak-setara/wrangler.jsonc`, tetap tanpa komentar agar uji bisa membacanya sebagai JSON:

```json
{
  "$schema": "../../node_modules/wrangler/config-schema.json",
  "name": "jejak-setara-lokal",
  "main": "src/index.ts",
  "compatibility_date": "2026-05-15",
  "assets": { "binding": "ASSETS", "run_worker_first": ["/api/*", "/ws/*"] },
  "durable_objects": { "bindings": [{ "name": "RUANG", "class_name": "RuangJejak" }] },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["RuangJejak"] }],
  "d1_databases": [{ "binding": "DB", "database_name": "jejak-setara-lokal", "database_id": "00000000-0000-4000-8000-000000000000", "migrations_dir": "migrations" }],
  "ratelimits": [
    { "name": "BATAS_PUBLIK", "namespace_id": "3001", "simple": { "limit": 300, "period": 60 } },
    { "name": "BATAS_WS", "namespace_id": "3002", "simple": { "limit": 300, "period": 60 } }
  ],
  "triggers": { "crons": ["0 19 * * *"] },
  "vars": { "LINGKUNGAN": "lokal" },
  "env": {
    "uji": {
      "name": "jejak-setara-uji",
      "vars": { "LINGKUNGAN": "uji" },
      "durable_objects": { "bindings": [{ "name": "RUANG", "class_name": "RuangJejak" }] },
      "d1_databases": [{ "binding": "DB", "database_name": "jejak-setara-uji", "database_id": "ISI_DATABASE_ID_UJI", "migrations_dir": "migrations" }],
      "ratelimits": [
        { "name": "BATAS_PUBLIK", "namespace_id": "3101", "simple": { "limit": 300, "period": 60 } },
        { "name": "BATAS_WS", "namespace_id": "3102", "simple": { "limit": 300, "period": 60 } }
      ]
    }
  }
}
```

- `ISI_DATABASE_ID_UJI` diganti Database ID dari pemilik proyek (Architecture 18, langkah 3). Selama masih tertulis begitu, pekerjaan "Deploy uji" dilewati dengan pemberitahuan.
- Pemicu harian (03.00 WITA) di JS-03 hanya menandai `ditutup` di D1 untuk ruang yang dibuat lebih dari 24 jam lalu tetapi belum `ditutup`, sebagai jaring pengaman bila Durable Object gagal menutupnya. Penghapusan data yang melewati masa simpan dibuat di JS-11.
- `vite.jejak.config.ts`: plugin Cloudflare diberi `persistState: { path: process.env.JEJAK_KEADAAN ?? "<akar>/.wrangler/state" }`, agar `dev:jejak`, `vite preview`, dan `db:migrasi:lokal` membaca basis data lokal yang sama, sedangkan uji memakai folder sendiri.

### Skrip

| Skrip | Perintah |
|---|---|
| `test:jejak:server` | `vitest run --config vitest.jejak-server.config.ts` |
| `sim:beban` | `node scripts/jejak-setara/simulasi-beban.mjs` |
| `db:migrasi:lokal` | `wrangler d1 migrations apply jejak-setara-lokal --local --persist-to .wrangler/state --config server/jejak-setara/wrangler.jsonc` |

- `scripts/jejak-setara/server-lokal.mjs --port <n> [--tanpa-build]`: membangun `build:jejak` (kecuali `--tanpa-build`), membuat folder keadaan baru `test-results-jejak/keadaan-<port>/`, menerapkan migrasi ke sana, lalu menjalankan `vite preview` dengan `JEJAK_KEADAAN` menunjuk folder itu. Proses berhenti rapi saat menerima sinyal berhenti. Dipakai `playwright.jejak.config.ts` (port 4310), uji server (4320), dan `sim:beban` (4330).
- `vitest.jejak-server.config.ts`: `include` `server/jejak-setara/uji/**/*.uji-server.ts`, lingkungan Node, `globalSetup` yang menyalakan dan mematikan `server-lokal.mjs`, satu berkas sekaligus, batas 30 detik per uji. Pola ini tidak cocok dengan `test:jejak`.
- `simulasi-beban.mjs [--ruang 1] [--bot 50] [--detik 120] [--jitter-ms 0] [--sasaran lokal]`: secara bawaan menyalakan `server-lokal.mjs`, membuat ruang coba, menggabungkan bot (`halo`, lalu `pilih_identitas` dengan saran pertama), memulai ronde lewat kait uji, menggerakkan bot ke titik acak dengan `frekuensiGerak`, mengirim `ping` setiap 5 detik, lalu mengakhiri dan menutup ruang. Hasilnya dicetak dan disimpan di `test-results-jejak/beban-<waktu>.json`: pesan naik dan turun per pemain per detik, byte turun per pemain per detik dan perkiraan per 15 menit, p50 dan p95 waktu pulang-pergi, koreksi sebagai persen dari `gerak`, pesan ditolak, baris SQLite ditulis, dan perkiraan permintaan Durable Object per sesi 15 menit (rasio 20 : 1 ditambah satu per sambungan). `--sasaran uji` memerlukan `--alamat`, rahasia `JEJAK_KUNCI_COBA`, dan `--saya-paham-kuota`, mencetak perkiraan permintaan lebih dulu, dan menolak bila perkiraannya lebih dari 20.000 permintaan (bagian 13.4 Architecture).

### Alur kerja

`.github/workflows/jejak-uji.yml`:

- Pekerjaan `uji` ditambah langkah "Uji server Jejak" (`test:jejak:server`) sesudah "Uji Jejak". Runtime Workers berjalan di mesin GitHub, tanpa kuota Cloudflare.
- Pekerjaan baru "Deploy uji" (`needs: uji`) berjalan hanya di cabang `main`, pada push atau tombol **Run workflow**. Grup `concurrency` `jejak-cloudflare-uji` tanpa pembatalan; batas 15 menit; rahasia `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` sebagai variabel lingkungan; `WRANGLER_SEND_METRICS=false`. Langkahnya: "Periksa rahasia" (bila salah satu rahasia kosong atau `ISI_DATABASE_ID_UJI` masih tertulis, tulis pemberitahuan dan lewati langkah sisanya), "Pasang dependensi", "Build Jejak (uji)" (`CLOUDFLARE_ENV=uji build:jejak`), "Migrasi D1 uji" (`wrangler d1 migrations apply jejak-setara-uji --remote --env uji --config server/jejak-setara/wrangler.jsonc`), "Deploy Worker uji" (`wrangler deploy` di folder `web/jejak-setara`), dan "Periksa lingkungan uji" (`/api/sehat` harus menjawab `"lingkungan":"uji"`; alamatnya ditulis ke ringkasan alur kerja).

`.github/workflows/jejak-ruang-coba.yml`: nama "Jejak: ruang coba"; pemicu `workflow_dispatch` dengan dua masukan (P-7); `permissions: contents: read`; grup `concurrency` `jejak-cloudflare-uji` tanpa pembatalan; satu pekerjaan "Buat ruang coba" di `ubuntu-latest` dengan batas 10 menit; `wrangler` 4.92.0 lewat `npx`, sama dengan versi di `package.json`.

## Aset

| Aset | Status | Dipakai |
|---|---|---|
| `ikon_ava_1.png` sampai `ikon_ava_8.png` (A-09) | Disetujui | Tombol avatar dan lobi, lewat `manifest.ts` (Architecture 11.2). Bila manifest belum ada saat Build, *placeholder* kotak warna palet berlabel `ikon_ava_n` |
| `ikon_menyambung.png` (I-15) | Disetujui | Lapisan menyambung ulang |
| `ikon_jejak.png` (I-17) | Disetujui | Ikon tab kedua halaman, menggantikan `data:,` bila berkasnya ada |

Tidak ada aset baru yang perlu digambar. Huruf tetap dari `@fontsource`.

## Keamanan dan privasi

- Server berwenang atas identitas, nama, warna tas, status ruang, dan waktu; nilai dari klien selalu diperiksa (aturan wajib 2 dan 3).
- Token pemain hanya disimpan sebagai hash SHA-256 di SQLite ruang. Klien menyimpannya di `sessionStorage` saja. Token, nama samaran, nomor absen, dan alamat IP tidak pernah masuk log.
- Alamat IP hanya dipakai sesaat sebagai kunci pembatas percobaan dan tidak disimpan di mana pun.
- Rute ruang coba mati di `produksi`, dan di `uji` memakai kunci sekali pakai yang dibuat alur kerja dan tidak pernah tampil di log. Kait uji hanya ada di `lokal`.
- Worker membuang tajuk `X-Jejak-*` dari klien, sehingga tajuk internal ke Durable Object tidak bisa dipalsukan.
- Nama samaran hanya dari daftar bawaan; tidak ada isian nama bebas dan tidak ada obrolan.
- Tidak ada analitik, pelacak, atau layanan luar selain akun Cloudflare proyek. Telemetri Wrangler tetap mati.

## Di luar cakupan

- Rute dan tampilan layar kelas, tiket, dan tombol guru (JS-10); akun, masuk, dan konsol (JS-04).
- Kanvas, kamera, berjalan di lobi dan peta, pemain lain di layar, ajakan memutar HP, layar penuh, dan *Screen Wake Lock* (JS-07); `kampung.json` asli (JS-06 dan JS-07).
- Kejadian, skor, `pribadi`, `papan`, dan pembahasan (JS-08 sampai JS-11); pesan `selesai` berisi rekap (JS-11).
- Pemberitahuan privasi sebelum masuk (JFR-56, JS-14); suara (JS-14).
- Kode QR dan kode masuk ulang (JS-17).
- Lingkungan dan alur kerja produksi, domain sendiri (menjelang rilis); kunci `KUNCI_TIKET`, `KUNCI_SANDI`, dan `KUNCI_IP` (JS-04 dan JS-10).
- Penghapusan data yang melewati masa simpan (JS-11); uji beban 15 menit penuh di lingkungan uji (JS-15, sesudah paket berbayar aktif).

## Perubahan dokumen

Diserahkan bersama spesifikasi ini (ZIP Gerbang 2):

| Dokumen | Perubahan |
|---|---|
| `PRD.md` | JFR-01: batas pemain paling banyak 100, mode nomor absen hanya untuk ruang sampai 50 pemain. Bagian 8.3: dua titik aktif per kejadian di ruang lebih dari 50 pemain (JS-08). Bagian 12: kapasitas. Bagian 21: keputusan KT-02 dan C-8 |
| `Architecture.md` | 4.2 (konfigurasi JS-03), 4.3 (skrip), 4.4 (alur kerja), 4.5 (`KUNCI_COBA`), 5.1 (`batasPemain` 2–100), 5.2 (migrasi), 5.3 (tabel JS-03), 6.1 (tajuk dan kode penutupan), 6.3 (`minta_nama`, `saran_nama`), 6.5 (24 pemain terdekat, `gerak` 6 per detik), 6.7 (`NOMOR_ABSEN_DIPAKAI`), 7 (siklus di inti ruang, pengatur waktu kiriman), 8.6 (posisi), 10.2 (rute ruang coba dan pemeriksaan kode), 13.1 (pemain per ruang), dan 14 (alat uji server, 1 ruang × 100 bot) |
| `PLAN.md` | Status dan riwayat JS-03 |

## DRAF untuk ditinjau pemilik proyek

- **D-1. Daftar nama samaran.** Nama = hewan + warna, seperti contoh Design System 3.6. (a, saran) 26 hewan × 10 warna = 260 nama, paling panjang "Cendrawasih Merah Muda" (22 karakter):
  - Hewan: Anoa, Bangau, Belibis, Camar, Cendrawasih, Elang, Gelatik, Jalak, Kakatua, Kancil, Kasuari, Kelinci, Kenari, Kepodang, Kijang, Kutilang, Lebah, Maleo, Merak, Merpati, Nuri, Penyu, Pesut, Rangkong, Rusa, dan Tupai.
  - Warna: Biru, Emas, Hijau, Jingga, Merah, Merah Muda, Nila, Perak, Toska, dan Ungu.
  - Sengaja tidak dipakai: warna yang juga dipakai untuk kulit (hitam, putih, cokelat, sawo matang, kuning); hewan yang biasa dipakai mengejek atau bermakna kasar (misalnya babi, monyet, kera, anjing, tikus, buaya, kerbau, keledai, kambing, sapi, ayam, bebek, kodok, cicak, gajah, badak, beruang, kuda, ular, dan kadal); serta primata (tarsius, bekantan, orang utan) agar tidak dipakai mengejek.
  - (b) Hapus atau tambah hewan dan warna tertentu; tulis saja daftarnya.
- **D-2. Teks yang tampil.** Saran: tabel "Teks yang tampil (final)". Ganti kata mana pun bila kurang pas.
- **D-3. Nomor absen yang sama di satu ruang.** (a, saran) Ditolak dengan pesan, karena nomor absen dipakai untuk statistik per siswa (JFR-52). (b) Diizinkan, dan guru melihat nomor kembar di hasil ruang.
- **D-4. Penanda server di layar Kode.** (a, saran) Tetap di kaki panel, agar Anda bisa melihat sendiri bahwa lingkungan uji hidup. (b) Dihapus dari layar pemain; penanda tetap di konsol.
- **D-5. Pembatas percobaan.** (a, saran) 300 per menit per alamat IP, karena satu kelas di wifi sekolah memakai satu alamat yang sama. (b) 120 per menit: lebih ketat, tetapi kelas berisi 40 siswa yang menyambung ulang bersamaan bisa tertahan.
- **D-6. Tombol "Muat ulang" sesudah 2 menit menyambung ulang.** (a, saran) Ada, untuk HP yang tersangkut. (b) Tidak ada; percobaan otomatis saja.
- **D-7. Layar sementara saat ronde berjalan.** (a, saran) Judul dan sisa waktu, agar sinkron jam bisa dilihat dan diuji. (b) Judul saja.

## Kriteria penerimaan

- [ ] AC-1 **Migrasi.** `db:migrasi:lokal` menerapkan `0001_awal.sql` ke basis data lokal kosong; ketiga belas tabel dan semua indeks ada; `PRAGMA foreign_key_check` kosong; menjalankan ulang tidak menerapkan apa pun; batasan `CHECK` menolak nilai di luar daftar.
- [ ] AC-2 **Ruang coba.** P-1 sampai P-6: `lokal` tanpa kunci 201; `uji` tanpa kunci atau kunci salah 403; `produksi` 404; isi salah 400; nomor absen dengan batas lebih dari 50 ditolak 400; baris D1 sesuai P-4; tautan benar.
- [ ] AC-3 **Kode ruang.** P-10 dan P-11: 100.000 kode buatan sesuai pola, sebaran ke-31 karakter lolos uji chi² (p = 0,01), dan normalisasi masukan benar.
- [ ] AC-4 **Pemeriksaan kode dan pembatas.** P-12 dan P-13: 200, 404, dan 405 sesuai; tidak ada panggilan ke Durable Object; 429 sesudah batas bila binding tersedia di lokal.
- [ ] AC-5 **Rute WebSocket.** P-14: 426, 403, dan 404 sesuai; tajuk `X-Jejak-*` dari klien tidak sampai ke Durable Object.
- [ ] AC-6 **Batas sambungan.** P-15 sampai P-17: tanpa `halo` 10 detik ditutup 4002; pesan lebih dari 2.048 byte, biner, JSON cacat, dan gagal skema dihitung pelanggaran; ember 20 per detik dengan lonjakan 40; galat pada pelanggaran ke-3; tutup 1008 pada pelanggaran ke-10; versi lain 4005; pesan yang tidak sesuai keadaan diabaikan.
- [ ] AC-7 **Bergabung.** P-18 sampai P-25: `selamat_datang` lolos skema; token 43 karakter; tiga saran berbeda dan bebas; `minta_nama`; `pilih_identitas`; warna tas paling sedikit dipakai; `pemain_baru` ke semua termasuk diri sendiri; `NAMA_DIPAKAI` diikuti saran baru; tempat pemain tanpa identitas kembali sesudah 5 menit; kunci `sessionStorage`.
- [ ] AC-8 **Batas masuk.** P-19 dan P-20: penuh, terkunci, terlambat, `selesai`, dan nomor absen (wajib, ganda, rentang).
- [ ] AC-9 **Sambung ulang.** P-26 sampai P-30: token melanjutkan pemain yang sama; sambungan lama ditutup 4001; putus tanpa `pemain_pergi`; jadwal klien 0,5, 1, 2, 4, 8, 8 detik; kalimat sesudah 30 detik dan tombol sesudah 2 menit; memuat ulang kembali ke lobi.
- [ ] AC-10 **Sinkron jam.** P-31: median lima sampel, diuji dengan jam tiruan.
- [ ] AC-11 **Siklus ruang.** P-32 sampai P-40 dengan jam tiruan: urutan status dan waktunya, jeda, lanjut, tambah waktu, akhiri, tutup, tutup otomatis 3 jam dan 6 jam, hapus 24 jam hanya bila antrean kosong, dan selalu satu alarm untuk tenggat terdekat.
- [ ] AC-12 **Kunci dan keluarkan.** P-37: pemain baru tertahan, sambung ulang tetap bisa; pemain yang dikeluarkan menerima galat, ditutup 4004, pemain lain menerima `pemain_pergi`, dan tokennya mati.
- [ ] AC-13 **Gerak dan `dunia`.** P-41 sampai P-44: peta uji lolos `bacaPeta`; `periksaGerak` dan `koreksi`; isi `dunia` paling banyak 24 terdekat di dalam 480 × 270 piksel; `n` benar; `frekuensiGerak` 10 dan 6.
- [ ] AC-14 **Penyimpanan.** P-45 sampai P-48: tidak ada baris yang ditulis untuk `gerak`; satu sesi 40 bot menulis kurang dari 500 baris SQLite; Durable Object yang dimuat ulang di uji server melanjutkan keadaan yang sama.
- [ ] AC-15 **Kiriman ke D1.** P-47: baris `peserta` dan `ruang` di D1 dalam 30 detik; pengiriman ulang tidak membuat baris ganda; kegagalan dijadwalkan ulang; antrean dikirim penuh saat selesai dan sebelum ditutup.
- [ ] AC-16 **Protokol.** Semua perubahan bagian "Protokol" ada beserta ujinya; `PROTOKOL_VERSI` tetap 1; jumlah pesan per skema 11, 11, 18, dan 7.
- [ ] AC-17 **Halaman.** P-49 sampai P-55 di 731 × 411 (emulasi HP dengan sentuhan), 1280 × 720, 1024 × 768, dan 1920 × 1080: teks persis; bisa diselesaikan dengan keyboard saja; fokus terlihat; target ≥ 48 px; `aria-live`; tidak ada galat konsol, tidak ada 4xx atau 5xx selain yang diharapkan (404 kode salah dan 429 uji pembatas), dan tidak ada pelanggaran CSP.
- [ ] AC-18 **Beberapa pemain.** Uji ujung ke ujung dengan tiga konteks (satu emulasi HP): ketiganya masuk lobi dan melihat "3 pemain di ruang"; dua pemain memilih nama yang sama bersamaan; ruang berbatas 2 menolak pemain ketiga; mode nomor absen; putus 5 detik lewat `setOffline`; muat ulang; dikeluarkan; dijeda dan dilanjutkan; selesai; ditutup (lewat kait uji).
- [ ] AC-19 **Deploy dan alur kerja.** Kedua berkas alur kerja terbaca sebagai YAML yang sah dengan nama, pemicu, izin, grup, dan langkah persis spesifikasi. Build dengan `CLOUDFLARE_ENV=uji` lalu `wrangler deploy --dry-run` menampilkan binding `RUANG`, `DB`, `ASSETS`, `BATAS_PUBLIK`, `BATAS_WS`, dan `LINGKUNGAN` bernilai `uji`. Langkah "Periksa rahasia" melewati deploy dengan pemberitahuan bila rahasia kosong atau ID D1 belum diisi.
- [ ] AC-20 **Simulasi beban (lokal).** 1 × 50, 1 × 100, dan 10 × 50 bot, masing-masing paling lama 4 menit: lalu lintas turun per pemain, diperkirakan untuk 15 menit, ≤ 3 MB; dengan `--jitter-ms 50`, gerak jujur yang dikoreksi < 1%; 0 pesan ditolak skema; tidak ada sambungan putus tak terduga; perkiraan permintaan Durable Object dan baris tulis tercetak.
- [ ] AC-21 **Uji.** `test:jejak` lulus (294 uji lama dan semua uji baru); `test` Sehari Setara tetap 296 lulus dan 1 dilewati; `RILIS=1 content:check` lulus; `test:jejak:server` dan `test:e2e:jejak` lulus; daftar Playwright Sehari Setara tetap 160 uji di 9 berkas.
- [ ] AC-22 **Kode.** `tsc --noEmit` 0 galat; ESLint `--max-warnings 0` 0 masalah tanpa `any`; uji kemurnian mencakup `inti-ruang.ts`, `sambungan.ts`, `nama-samaran.ts`, dan `peta-uji.ts`.
- [ ] AC-23 **Anggaran.** Kode layar pemain ≤ 200 KB gzip (perkiraan ±82 KB dengan zod); ukuran Worker dicatat; lalu lintas sesuai AC-20.
- [ ] AC-24 **Galeri dan berkas.** `build:pages` lulus dan ke-178 berkas identik byte dengan `main`; `git diff --name-status` hanya memuat berkas di bagian "Berkas yang dibuat dan diubah".
- [ ] AC-25 **Dokumen.** Semua perubahan di bagian "Perubahan dokumen" ada.

## Rencana uji

### Uji unit (`test:jejak`, Vitest di Node)

- `__tests__/ruang/inti-ruang.test.ts`: bergabung, saran nama, identitas, warna tas, batas masuk, nomor absen, sambung ulang, kunci, keluarkan, siklus dengan jam tiruan, alarm, kiriman, gerak di peta uji, dan isi `dunia` (AC-7 sampai AC-15).
- `__tests__/ruang/sambungan.test.ts`: ukuran, ember token, jendela pelanggaran, dan penutupan (AC-6).
- `__tests__/ruang/nama-samaran.test.ts`: jumlah 260, panjang ≤ 24, tanpa nama ganda, dan tanpa kata yang dikecualikan D-1 (AC-7).
- `__tests__/ruang/jaringan.test.ts`: jadwal sambung ulang, sinkron jam, kunci `sessionStorage`, dan pesan cacat diabaikan, dengan WebSocket, jam, dan penyimpanan tiruan (AC-9, AC-10).
- `__tests__/ruang/peta-uji.test.ts`: peta uji lolos `bacaPeta` dan sama dengan hasil `uraiRle` (AC-13).
- `__tests__/inti/protokol.test.ts`, `aturan.test.ts`, `kemurnian.test.ts`, dan `kerangka.test.ts` disesuaikan (AC-16, AC-22).

### Uji server (`test:jejak:server`, Worker hasil build di `vite preview`)

Rute ruang coba dan kait uji; pemeriksaan kode; rute WebSocket; bergabung dan sambung ulang lewat WebSocket sungguhan; Durable Object yang dimuat ulang; isi D1 sesudah kiriman (dibaca dengan `wrangler d1 execute --local`); migrasi pada basis data kosong; dan pembatas percobaan (AC-1 sampai AC-6, AC-11, AC-14, AC-15).

### Uji ujung ke ujung (`gabung.uji.ts`)

Skenario AC-17 dan AC-18 dengan beberapa konteks peramban, serta tangkapan layar di empat ukuran: layar Kode, Nomor absen, Identitas, Lobi, Menyambung ulang, Dijeda, Ronde berjalan, dan layar Galat ruang penuh.

### Perintah di tahap Test

`install --frozen-lockfile`; `content:check:jejak`; `test:jejak`; `test:jejak:server`; `build:jejak` dan ukuran gzip; `test:e2e:jejak` dengan `JEJAK_CHROMIUM`; `sim:beban` untuk ketiga skenario AC-20 (wajib, karena fitur ini menyentuh protokol, inti ruang, dan kiriman ke D1); `test`; `RILIS=1 content:check`; `build:pages` dan perbandingan SHA-256 ke-178 berkas; `playwright test --list` Sehari Setara; `tsc`; ESLint; pembacaan YAML kedua alur kerja; build `CLOUDFLARE_ENV=uji` dengan `wrangler deploy --dry-run`; dan `git status --ignored`.

### Daftar periksa manual (AGENTS bagian 9)

- "Menyambung kembali sesudah wifi HP dimatikan 30 detik": diuji di Playwright dengan `setOffline` selama 30 detik, lalu dicoba pemilik proyek di lingkungan uji lewat "Jejak: ruang coba" sesudah deploy pertama.
- "Tidak ada nama asli siswa di layar, berkas ekspor, maupun log": terpenuhi, karena nama hanya dari daftar dan log tidak memuat identitas.
- Butir lain (fps, proyektor, kurangi gerak di dunia, suara) belum berlaku sampai JS-07, JS-10, dan JS-14.
