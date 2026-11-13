# JS-04 — Akun dan autentikasi

| | |
|---|---|
| Status | Ditulis 14 November 2026 di tahap Specify, sesudah balasan `Setuju: JS-04` (semua saran a, usulan 1 sampai 10; KT-05 dijawab sesuai saran PRD: ya). Menunggu `Spesifikasi disetujui: JS-04` beserta pilihan DRAF D-1 sampai D-4 |
| Rencana | `PLAN.md`, bagian "JS-04 — Akun dan autentikasi" |
| Sesi | Sesi A (mesin) |
| Bergantung pada | JS-03 (Selesai, 8 Nov 2026) |

## Ringkasan

JS-04 membuka konsol untuk guru dan admin. Pengguna masuk dengan email dan sandi, keluar, dan mengganti sandinya sendiri. Sesi tersimpan di D1 dan berakhir sendiri. Percobaan masuk dibatasi per email dan per alamat internet. Admin mengelola akun: membuat akun guru atau admin dengan sandi sementara yang dibuat server, mengubah peran dan tanda Peninjau, menonaktifkan, dan mengatur ulang sandi. Akun admin pertama dibuat, atau dipulihkan, lewat alur kerja GitHub "Jejak: admin awal". Kunci rahasia Worker dibuat otomatis oleh alur kerja deploy.

Sandi di-hash dengan PBKDF2-HMAC-SHA256 dan kunci tambahan `KUNCI_SANDI`, dengan jumlah iterasi yang muat dalam batas CPU 10 ms paket gratis (15.000, lewat variabel `ITERASI_SANDI`). Konsol mendapat kerangka sesuai Design System 3.7: halaman masuk, ganti sandi, dasbor kerangka, dan halaman Akun.

Membuat ruang, bank kejadian, rujukan, statistik, dan halaman log audit **tidak** termasuk (bagian "Di luar cakupan").

## Kaitan PRD

| Kebutuhan | Dipenuhi oleh |
|---|---|
| JFR-34: masuk dengan email dan sandi, keluar, ganti sandi; sesi berakhir sendiri | P-6 sampai P-19, P-39 sampai P-41 |
| JFR-35: peran Admin dan Guru, tanda Peninjau | P-20, P-21, P-24, P-43 sampai P-46 |
| JFR-36: admin membuat akun guru dengan sandi sementara yang wajib diganti, menonaktifkan, mengatur ulang sandi | P-5, P-17, P-22 sampai P-27, P-43 sampai P-47 |
| JFR-37 (kerangka): dasbor | P-36, P-42 |
| PRD 11.1 (izin) dan 13 (data guru dan admin; alamat IP tidak disimpan) | P-12, P-20, P-26 |
| PRD 18: akun admin dibobol | P-1 sampai P-4, P-11 sampai P-15 |
| Architecture JA-06, 10.1 sampai 10.4, 12, 15, dan langkah 9 bagian 18 | Seluruh spesifikasi |

## Berkas yang dibuat dan diubah

| Berkas | Baru/Diubah | Isi |
|---|---|---|
| `app/jejak-setara/inti/akun.ts` | Baru | Skema `zod` isi permintaan dan jawaban API akun, batas panjang, normalisasi email, dan aturan sandi baru (P-19, P-27). Murni, dipakai server dan konsol |
| `server/jejak-setara/src/auth/sandi.ts` | Baru | Hash, pencocokan waktu konstan, hash tiruan, dan sandi sementara (P-1 sampai P-5) |
| `server/jejak-setara/src/auth/sesi.ts` | Baru | Token, cookie, pemeriksaan sesi, dan masa berlaku (P-6 sampai P-10) |
| `server/jejak-setara/src/auth/batas.ts` | Baru | Kunci dan hitungan pembatas percobaan masuk (P-12, P-13) |
| `server/jejak-setara/src/auth/izin.ts` | Baru | Tabel aksi per peran dan penjaga (P-20, P-21) |
| `server/jejak-setara/src/api/masuk.ts` | Baru | `POST /api/masuk`, `POST /api/keluar`, `GET /api/saya`, `POST /api/sandi` (P-11 sampai P-19) |
| `server/jejak-setara/src/api/akun.ts` | Baru | `GET` · `POST /api/akun`, `PATCH /api/akun/{id}`, dan `POST /api/admin-awal` (P-22 sampai P-31) |
| `server/jejak-setara/src/api/dasbor.ts` | Baru | `GET /api/dasbor` (P-36) |
| `server/jejak-setara/src/db/akun.ts` | Baru | Kueri D1 berparameter untuk `pengguna`, `sesi`, `batas_masuk`, `log_audit`, dan hitungan `rujukan` |
| `server/jejak-setara/src/index.ts` | Diubah | Rute baru dan pembersihan harian (P-35) |
| `server/jejak-setara/src/env.ts` | Diubah | `KUNCI_SANDI`, `KUNCI_IP`, `KUNCI_ADMIN`, `ITERASI_SANDI`, dan `BATAS_MASUK` |
| `server/jejak-setara/src/keamanan.ts` | Diubah | Pemeriksaan `X-Jejak` dan `Origin` untuk permintaan yang mengubah data (P-10) |
| `server/jejak-setara/wrangler.jsonc` | Diubah | Variabel dan pembatas per lingkungan, kunci tiruan lokal (P-33) |
| `app/jejak-setara/admin/App.tsx` | Diganti | Keadaan masuk, pengalih halaman, dan kerangka (P-37, P-38) |
| `app/jejak-setara/admin/rute.ts` | Baru | Router *hash* murni (P-37) |
| `app/jejak-setara/admin/api.ts` | Baru | Pemanggil API yang memeriksa setiap jawaban dengan skema `inti/akun.ts` |
| `app/jejak-setara/admin/Kerangka.tsx` | Baru | Navigasi samping, kepala, dan tombol "Menu" (P-38) |
| `app/jejak-setara/admin/halaman/Masuk.tsx`, `GantiSandi.tsx`, `Dasbor.tsx`, `Akun.tsx` | Baru | Halaman konsol (P-39 sampai P-47) |
| `app/jejak-setara/admin/Dialog.tsx` | Baru | Dialog konsol dengan fokus terkurung (P-44 sampai P-47, P-50) |
| `app/jejak-setara/teks.ts` | Diubah | Ekspor baru `TEKS_KONSOL`; `konsolJudul` dan `konsolIsi` dihapus (P-51) |
| `app/jejak-setara/styles/jejak.css` | Diubah | Gaya konsol berawalan `js-konsol` (P-49) |
| `app/jejak-setara/bersama/HalamanKerangka.tsx` | **Dihapus** | Tidak dipakai lagi sesudah konsol diganti. Penghapusan disebut tersendiri di serah terima Build. Aturan `.js-kerangka` di `jejak.css` ikut dihapus |
| `.github/workflows/jejak-uji.yml` | Diubah | Langkah "Siapkan kunci Worker" dan `--secrets-file` di job "Deploy uji" (P-32) |
| `.github/workflows/jejak-admin-awal.yml` | Baru | Alur kerja "Jejak: admin awal" (P-29) |
| Uji: `app/jejak-setara/__tests__/akun/`, `__tests__/kerangka.test.ts`, `server/jejak-setara/uji/akun.uji-server.ts`, `e2e/jejak-setara/konsol.uji.ts`, `e2e/jejak-setara/kerangka.uji.ts` | Baru dan diubah | Rencana uji |
| `docs/jejak-setara/Architecture.md` (3, 4.2, 4.4, 4.5, 10.1 sampai 10.4, 15, dan 18), `Design_System.md` (3.7 dan 5), `PRD.md` (20 dan 21) | Diubah | Sesuai keputusan Gerbang 1 (ikut serah terima Gerbang 2 ini) |

Perbedaan dari daftar berkas di rencana: `scripts/jejak-setara/server-lokal.mjs` tidak berubah, karena uji membuat admin sendiri lewat rute admin awal dengan kunci lokal (P-31); `admin/Dialog.tsx` ditambahkan; dan teks konsol menjadi ekspor terpisah `TEKS_KONSOL` agar tidak ikut termuat di layar pemain (P-51).

Tidak disentuh: kode dan dokumen Sehari Setara, galeri, `deploy-pages.yml`, `package.json` dan lockfile, protokol dan inti ruang (`PROTOKOL_VERSI` tetap 2), migrasi D1, berkas Sesi B, dan berkas Sesi C.

## Perilaku

Istilah: **akun** adalah baris tabel `pengguna`. **Sesi** adalah baris tabel `sesi` yang dikenali lewat cookie. **Target iterasi** adalah nilai `ITERASI_SANDI` lingkungan itu. **Permintaan yang mengubah data** adalah `POST` dan `PATCH`. Semua waktu disimpan dalam milidetik UTC, seperti JS-03.

### Hash sandi dan kunci

- **P-1. Bentuk hash.** Sandi dinormalkan dengan Unicode NFC, lalu diubah ke byte UTF-8. Hasil disimpan sebagai `hash_sandi` = base64 dari HMAC-SHA256(kunci `KUNCI_SANDI`, PBKDF2-HMAC-SHA256(sandi, `garam`, `iterasi`, 256 bit)). `garam` berisi 16 byte acak dalam base64, dan `iterasi` disimpan per akun. Semua lewat WebCrypto. Hash dibandingkan dengan `samaWaktuKonstan` yang sudah ada.
- **P-2. Target iterasi.** Variabel Worker `ITERASI_SANDI` bernilai `15000` di lingkungan `lokal` dan `uji`. Nilai yang bukan bilangan bulat 1.000–100.000 membuat rute yang menghitung hash menjawab 503 `KONSOL_BELUM_SIAP` (P-34). Setiap hash baru memakai target iterasi. Saat masuk berhasil, akun yang `iterasi`-nya **lebih kecil** dari target di-hash ulang dengan garam baru dan target iterasi; akun yang iterasinya lebih besar tidak diubah. Target dinaikkan ke 100.000 hanya sesudah paket berbayar aktif (catatan Plan JS-15 di `PLAN.md`).
- **P-3. Paling banyak dua hash per permintaan.**

  | Permintaan | Jumlah hash |
  |---|---|
  | Masuk ke akun yang iterasinya sama dengan target | 1 |
  | Masuk dengan email yang tidak terdaftar atau akun nonaktif | 1 (hash tiruan, P-4) |
  | Masuk saat terkunci (P-13) | 0 |
  | Masuk ke akun yang iterasinya di bawah target | 2 (hanya terjadi sesudah target dinaikkan) |
  | Ganti sandi wajib (P-18) | 2: memastikan sandi baru berbeda dari sandi sementara, lalu hash baru |
  | Ganti sandi sukarela (P-18) | 2: mencocokkan sandi sekarang, lalu hash baru |
  | Membuat akun, mengatur ulang sandi, dan admin awal | 1 |
  | Semua permintaan lain | 0 |

  Dengan 15.000 iterasi, dua hash memakai sekitar 6,5 ms CPU di mesin agen (bagian "Pengukuran hash sandi" di `PLAN.md`).
- **P-4. Hash tiruan.** Untuk email yang tidak terdaftar atau akun nonaktif, Worker tetap menghitung satu hash dengan garam 16 byte nol dan target iterasi, lalu menjawab sama seperti sandi salah. Waktu jawaban tidak membedakan email terdaftar, tidak terdaftar, dan nonaktif.
- **P-5. Sandi sementara.** Dibuat server dengan `crypto.getRandomValues`: 16 karakter dari abjad kode ruang `ABJAD_KODE` (31 karakter, tanpa 0, O, 1, I, dan L), tanpa bias modulo seperti `kodeAcak` JS-03, lalu ditulis dalam empat kelompok berisi empat karakter yang dipisah tanda hubung, misalnya `K7QM-4TZP-H2XC-9RWE` (19 karakter). Tanda hubung termasuk bagian sandi (D-3). Sandi sementara hanya dikirim sekali di jawaban API yang membuatnya, dan tidak pernah disimpan atau dicatat.

### Sesi dan cookie

- **P-6. Token dan cookie.** Masuk berhasil membuat token 32 byte acak, ditulis base64url (43 karakter). D1 hanya menyimpan SHA-256 heksadesimal token itu di `sesi.hash_token`, dengan `dibuat_pada` dan `terakhir_dipakai` = sekarang dan `kedaluwarsa` = sekarang + 7 hari. Cookie: `__Host-jejak_sesi=<token>; Path=/; HttpOnly; Secure; SameSite=Lax`, tanpa `Max-Age` dan tanpa `Expires`, sehingga hilang saat peramban ditutup (D-1). Nama dan atribut cookie sama di semua lingkungan; Chromium menyimpan cookie ini juga di `http://127.0.0.1` dan `http://localhost` (diperiksa 14 Nov 2026).
- **P-7. Pemeriksaan sesi.** Setiap rute yang memerlukan sesi membaca cookie, menghitung SHA-256 token, lalu membaca sesi dan akunnya dalam satu kueri. Sesi tidak sah bila: tidak ada; `terakhir_dipakai` lebih dari 8 jam yang lalu; sekarang melewati `kedaluwarsa`; atau akunnya nonaktif. Sesi yang tidak sah dihapus, dan permintaan dijawab 401 `PERLU_MASUK`. Bila sesi sah dan `terakhir_dipakai` sudah lebih dari 5 menit yang lalu, nilainya diperbarui ke sekarang.
- **P-8. Keluar.** `POST /api/keluar` menghapus sesi yang sedang dipakai (bila ada), mengirim cookie hapus (`__Host-jejak_sesi=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`), dan menjawab 200 `{ "ok": true }`, juga bila tidak ada sesi.
- **P-9. Sesi yang dihapus.** Semua sesi sebuah akun dihapus saat: akun itu mengganti sandi (lalu satu sesi baru dibuat untuk perangkat yang sedang dipakai, P-18); admin menonaktifkan akun itu atau mengatur ulang sandinya (P-24); dan admin awal memulihkan akun itu (P-30).
- **P-10. Perlindungan CSRF.** Setiap permintaan yang mengubah data, kecuali `POST /api/admin-awal`, wajib membawa tajuk `X-Jejak: 1` dan `Origin` yang lolos `asalDiizinkan` (JS-03: asal yang sama; di `lokal` juga localhost dan 127.0.0.1). Bila tidak, dijawab 403 `ASAL_DITOLAK` sebelum isi permintaan dibaca. `GET` tidak diperiksa.

### Masuk dan pembatas percobaan

- **P-11. Masuk.** `POST /api/masuk` dengan isi `{ "email", "sandi" }`, urutannya:
  1. Pemeriksaan CSRF (P-10), lalu pembatas `BATAS_MASUK` per alamat (P-14).
  2. Isi dibaca paling banyak 4.096 byte dan diperiksa skema `skemaMasuk`; email dinormalkan (P-27). Isi yang rusak dijawab 400 `PERMINTAAN_SALAH`; email atau sandi yang tidak memenuhi skema dijawab 401 `MASUK_SALAH` tanpa hash.
  3. Kunci dan target iterasi diperiksa (P-34).
  4. Pembatas D1 diperiksa (P-13). Bila terkunci, dijawab 429 `TERKUNCI` tanpa hash.
  5. Akun dicari dengan email. Hash dihitung dengan garam dan iterasi akun, atau hash tiruan (P-4).
  6. Gagal (akun tidak ada, nonaktif, atau hash tidak cocok): hitungan gagal ditambah untuk kunci email dan kunci alamat (P-12), lalu dijawab 401 `MASUK_SALAH`.
  7. Berhasil: hash ulang bila perlu (P-2), sesi baru dibuat (P-6), `masuk_terakhir` diisi, catatan pembatas kunci email dihapus, lalu dijawab 200 `{ "akun": Saya }` dengan cookie sesi.
- **P-12. Kunci pembatas.** Kunci email = `e:` + 32 karakter pertama HMAC-SHA256(`KUNCI_IP`, email yang sudah dinormalkan) dalam heksadesimal. Kunci alamat = `i:` + 32 karakter pertama HMAC-SHA256(`KUNCI_IP`, alamat IP + `|` + tanggal UTC `YYYY-MM-DD`). Alamat IP dibaca dari `CF-Connecting-IP` (`alamatIp` JS-03) dan tidak pernah disimpan. Kunci alamat berganti setiap hari.
- **P-13. Hitungan dan penguncian.** Setiap kegagalan menambah `jumlah` pada baris `batas_masuk` kuncinya. Untuk kunci email, hitungan mulai lagi dari 1 bila jendela 15 menit sudah lewat; untuk kunci alamat, jendelanya 24 jam. Bila hitungan mencapai 5 (email) atau 20 (alamat), `terkunci_sampai` diisi sekarang + 15 menit. Selama salah satu kunci terkunci, masuk dijawab 429 `TERKUNCI` ("Terlalu banyak percobaan masuk. Tunggu 15 menit, lalu coba lagi.") tanpa menghitung hash. Percobaan yang membuat hitungan mencapai batas masih dijawab `MASUK_SALAH`; penguncian berlaku mulai percobaan berikutnya. Email terdaftar dan tidak terdaftar dihitung dengan cara yang sama.
- **P-14. Pembatas per menit.** Binding pembatas Workers `BATAS_MASUK` (kunci: alamat IP) berlaku untuk `POST /api/masuk`, `POST /api/sandi`, dan `POST /api/admin-awal`, sebelum D1 disentuh. Batasnya 10 permintaan per 60 detik di `uji` dan 100 di `lokal` (uji ujung ke ujung memakai satu alamat). Bila lewat, dijawab 429 `TERLALU_SERING`. Bila binding gagal dipanggil, permintaan diteruskan, seperti `bolehLewat` JS-03.
- **P-15. Pesan yang sama.** Email tidak terdaftar, akun nonaktif, dan sandi salah selalu dijawab 401 `MASUK_SALAH` ("Email atau sandi salah."), dengan jumlah hash dan waktu yang sama.

### Akun saat ini dan ganti sandi

- **P-16. Akun saat ini.** `GET /api/saya` selalu menjawab 200: `{ "masuk": false }` tanpa sesi sah, atau `{ "masuk": true, "akun": Saya }`. Rute ini tidak menjawab 401, agar halaman masuk yang baru dibuka tidak mencatat galat di konsol peramban. `Saya` berisi `id`, `email`, `namaTampilan`, `peran`, `peninjau`, dan `wajibGantiSandi`.
- **P-17. Ganti sandi wajib.** Selama `wajib_ganti_sandi` bernilai 1, hanya `GET /api/saya`, `POST /api/sandi`, dan `POST /api/keluar` yang dilayani. Rute lain yang memerlukan sesi dijawab 403 `WAJIB_GANTI_SANDI`.
- **P-18. Ganti sandi.** `POST /api/sandi` dengan isi `{ "sandiLama"?, "sandiBaru" }`, sesudah CSRF, `BATAS_MASUK`, dan sesi:
  - **Wajib** (`wajib_ganti_sandi` = 1): `sandiLama` diabaikan. Sandi baru diperiksa dengan P-19, lalu di-hash dengan garam dan iterasi lama dan dibandingkan dengan hash sementara; bila sama, dijawab 400 `SANDI_SAMA`.
  - **Sukarela**: `sandiLama` wajib. Pembatas kunci email diperiksa lebih dulu (429 `TERKUNCI` bila terkunci). Bila `sandiLama` tidak cocok, hitungan gagal kunci email dan kunci alamat ditambah (P-13), lalu dijawab 400 `SANDI_LAMA_SALAH`. Sandi baru diperiksa dengan P-19 dan tidak boleh sama dengan `sandiLama` (`SANDI_SAMA`).
  - Hasil yang berhasil: hash baru dengan garam baru dan target iterasi; `wajib_ganti_sandi` = 0; semua sesi akun dihapus; satu sesi baru dibuat dengan cookie baru; satu baris log audit `sandi.ganti`; lalu dijawab 200 `{ "akun": Saya }`.
- **P-19. Aturan sandi baru.** Panjang 12 sampai 128 karakter, dihitung per titik kode Unicode sesudah NFC (`SANDI_PENDEK`, `SANDI_PANJANG`), dan tidak sama dengan email akun tanpa membedakan huruf besar-kecil (`SANDI_SAMA_EMAIL`). Tidak ada aturan komposisi lain. Aturan yang sama dipakai konsol sebelum mengirim.

### Peran dan izin

- **P-20. Tabel izin.** `auth/izin.ts` memuat satu tabel aksi per peran dari PRD 11.1, dan satu fungsi penjaga `boleh(akun, aksi)` yang dipanggil setiap rute. Aksi JS-04: `dasbor.lihat` (admin dan guru), `sandi.sendiri` (admin dan guru), dan `akun.kelola` (admin). Fitur berikutnya menambah barisnya sendiri. Tanda Peninjau tidak memberi aksi apa pun di JS-04; ia dipakai `rujukan.verifikasi` di JS-12.
- **P-21. Jawaban penjaga.** Tanpa sesi sah: 401 `PERLU_MASUK`. Ganti sandi wajib belum selesai: 403 `WAJIB_GANTI_SANDI`. Aksi tidak diizinkan: 403 `TIDAK_BERWENANG`.

### Kelola akun

- **P-22. Daftar akun.** `GET /api/akun` (izin `akun.kelola`) menjawab `{ "akun": [Akun] }`. `Akun` = `Saya` ditambah `aktif`, `dibuatPada`, dan `masukTerakhir` (milidetik atau `null`). Urutan: akun aktif lebih dulu, lalu nama tampilan tanpa membedakan huruf besar-kecil, lalu email. Paling banyak 500 akun. Hash, garam, dan iterasi tidak pernah dikirim.
- **P-23. Akun baru.** `POST /api/akun` (izin `akun.kelola`) dengan isi `{ "email", "namaTampilan", "peran", "peninjau" }`. Email dinormalkan dan harus belum dipakai (409 `EMAIL_DIPAKAI`). Server membuat sandi sementara (P-5), menyimpan akun dengan `wajib_ganti_sandi` = 1 dan `aktif` = 1, menulis log audit `akun.buat`, lalu menjawab 201 `{ "akun": Akun, "sandiSementara": "…" }`.
- **P-24. Ubah akun.** `PATCH /api/akun/{id}` (izin `akun.kelola`) dengan sedikitnya satu dari `namaTampilan`, `peran`, `peninjau`, `aktif`, dan `aturUlangSandi: true`. Id yang tidak ada dijawab 404 `AKUN_TIDAK_ADA`.
  - `aktif: false` menghapus semua sesi akun itu.
  - `aturUlangSandi: true` membuat sandi sementara baru (P-5), mengisi `wajib_ganti_sandi` = 1, menghapus semua sesi akun itu, dan menghapus catatan pembatas kunci emailnya. Jawaban berisi `sandiSementara`.
  - Jawaban: 200 `{ "akun": Akun }`, ditambah `sandiSementara` bila diatur ulang.
- **P-25. Perlindungan diri dan admin terakhir.** Admin tidak bisa mengubah perannya sendiri menjadi guru, menonaktifkan akunnya sendiri, atau mengatur ulang sandinya sendiri lewat rute ini (400 `TIDAK_BOLEH_DIRI`); sandinya sendiri diganti lewat `POST /api/sandi`. Perubahan yang membuat tidak ada lagi admin aktif ditolak (409 `ADMIN_TERAKHIR`). Admin boleh mengubah nama tampilan dan tanda Peninjau dirinya sendiri.
- **P-26. Log audit.** Setiap perubahan akun menulis satu baris `log_audit` dengan `pengguna_id` pelaku (atau `null` untuk admin awal), `sasaran` id akun, `waktu`, dan `rincian_json` tanpa sandi, hash, token, atau alamat IP. Aksi: `admin_awal` (`{"hasil":"dibuat"}` atau `{"hasil":"dipulihkan"}`), `akun.buat` (peran dan Peninjau), `akun.ubah` (nama kolom yang berubah beserta nilai barunya), `akun.atur_ulang_sandi`, dan `sandi.ganti` (`{"wajib":true}` atau `{"wajib":false}`). Masuk dan percobaan gagal tidak dicatat. Halaman log audit tetap di JS-19.
- **P-27. Email dan nama.** Email dipangkas spasinya, diubah ke huruf kecil, paling panjang 254 karakter, dan harus berbentuk `nama@domain.akhiran` tanpa spasi (`EMAIL_SALAH`). Nama tampilan dipangkas spasinya, 1 sampai 40 karakter, tanpa karakter kendali (`NAMA_SALAH`). Email tidak bisa diubah sesudah akun dibuat, dan akun tidak bisa dihapus.

### Admin awal

- **P-28. Rute admin awal.** `POST /api/admin-awal` dengan tajuk `X-Jejak-Kunci-Admin` dan isi `{ "email", "sandi", "namaTampilan" }`:
  - Tanpa `KUNCI_ADMIN`, rute ini dijawab 404 `BELUM_TERSEDIA`, sama seperti rute yang tidak dikenal.
  - Kunci dibandingkan dengan `samaWaktuKonstan`. Bila tidak cocok, dijawab 403 `KUNCI_ADMIN_SALAH`.
  - Berlaku `BATAS_MASUK` (P-14) dan pemeriksaan kunci Worker (P-34). Pemeriksaan CSRF tidak berlaku, karena rute ini dipanggil alur kerja, bukan peramban.
  - Sandi 12 sampai 128 karakter (P-19, tanpa aturan email); email dan nama sesuai P-27.
  - Hasil 200 `{ "hasil": "dibuat" }` atau `{ "hasil": "dipulihkan" }` (P-30).
- **P-29. Alur kerja "Jejak: admin awal"** (`.github/workflows/jejak-admin-awal.yml`, tombol **Run workflow**, `concurrency` `jejak-cloudflare-uji` tanpa membatalkan yang sedang berjalan):
  1. Masukan `nama_tampilan` (bawaan `Admin`).
  2. **Periksa rahasia dan masukan:** `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` ada; `JEJAK_ADMIN_EMAIL` dan `JEJAK_ADMIN_SANDI_SEMENTARA` ada; email berbentuk email; sandi 12 sampai 128 karakter; nama 1 sampai 40 karakter. Isi rahasia tidak pernah dicetak.
  3. **Simpan kunci sekali pakai:** `openssl rand -hex 32`, disamarkan dengan `::add-mask::`, lalu disimpan sebagai rahasia Worker `KUNCI_ADMIN` dengan `wrangler@4.92.0 secret put --name jejak-setara-uji`.
  4. **Cari alamat lingkungan uji**, sama seperti "Jejak: ruang coba" (variabel `JEJAK_ALAMAT_UJI`, atau subdomain `workers.dev` dari API Cloudflare).
  5. **Buat atau pulihkan akun:** isi JSON disusun `jq` dari variabel lingkungan ke berkas sementara di `$RUNNER_TEMP` (izin 600), lalu dikirim `curl` dengan tajuk kunci. Jawaban 200 berarti selesai. Jawaban 400, dan 503 dengan kode `KONSOL_BELUM_SIAP`, langsung menghentikan alur kerja dengan pesan (bagian "Teks yang tampil"). Jawaban lain (misalnya 403 atau 404 selama versi Worker dengan kunci baru belum aktif) diulang paling banyak 10 kali dengan jeda 3 detik. Berkas sementara dihapus sesudahnya.
  6. **Tutup kembali rute** (selalu dijalankan, `if: always()`, sesudah langkah 3): `KUNCI_ADMIN` diganti nilai acak baru yang tidak dicetak dan tidak disimpan di mana pun.
  7. **Ringkasan:** hasil, alamat konsol, dan petunjuk masuk, tanpa email dan sandi.

  Setiap `secret put` membuat versi Worker baru, jadi satu kali menjalankan alur kerja membuat dua versi. Ruang coba yang sedang berjalan pindah ke versi itu dalam beberapa menit, dan pemainnya menyambung ulang sebentar (seperti "Jejak: kendali ruang coba").
- **P-30. Dibuat atau dipulihkan.** Email yang belum ada menghasilkan akun admin baru dengan nama dari masukan, `peninjau` = 0, `wajib_ganti_sandi` = 1, dan hasil `dibuat`. Untuk email yang sudah ada (admin atau guru), peran menjadi admin, `aktif` = 1, hash diganti hash sandi sementara, `wajib_ganti_sandi` = 1, semua sesinya dihapus, catatan pembatas kunci emailnya dihapus, nama tampilan dan tanda Peninjau tidak berubah, dan hasilnya `dipulihkan`. Keduanya menulis log audit `admin_awal` (P-26).
- **P-31. Kunci lokal.** Di lingkungan `lokal`, `KUNCI_ADMIN` adalah variabel tetap `lokal-kunci-admin-bukan-rahasia` di `wrangler.jsonc`, sehingga uji server, uji ujung ke ujung, dan `dev:jejak` bisa membuat admin lewat rute yang sama. Nilai ini tidak berlaku di `uji`, karena variabel lingkungan teratas tidak diwariskan ke lingkungan bernama.

### Kunci Worker dan konfigurasi

- **P-32. Langkah "Siapkan kunci Worker"** di job "Deploy uji" `jejak-uji.yml`, sesudah "Semai bank awal" dan sebelum "Deploy Worker uji", dengan syarat `steps.rahasia.outputs.siap == 'ya'`:
  - membaca nama rahasia Worker uji dengan `wrangler secret list --name jejak-setara-uji --format json`;
  - untuk `KUNCI_SANDI` dan `KUNCI_IP` yang belum ada, membuat 32 byte acak (`openssl rand -hex 32`), menyamarkannya, dan menulisnya ke `$RUNNER_TEMP/kunci-worker.json` (izin 600);
  - mencetak hanya nama kunci yang dibuat ("Kunci Worker baru: KUNCI_SANDI, KUNCI_IP.") atau "Kunci Worker sudah lengkap.".

  Langkah "Deploy Worker uji" menambahkan `--secrets-file "$RUNNER_TEMP/kunci-worker.json"` bila berkas itu ada, sehingga kunci baru ikut versi yang sama tanpa versi tambahan. Kunci yang sudah ada tidak pernah diganti, dan deploy tidak pernah menghapus rahasia. Berkas dihapus sesudah deploy. `KUNCI_TIKET` ditambahkan di JS-10.
- **P-33. `wrangler.jsonc`.**
  - Lingkungan teratas (lokal): `vars` ditambah `ITERASI_SANDI` `"15000"`, `KUNCI_SANDI` `"lokal-kunci-sandi-bukan-rahasia"`, `KUNCI_IP` `"lokal-kunci-ip-bukan-rahasia"`, dan `KUNCI_ADMIN` `"lokal-kunci-admin-bukan-rahasia"`; `ratelimits` ditambah `BATAS_MASUK` (`namespace_id` `"3003"`, 100 per 60 detik).
  - `env.uji`: `vars` ditambah `ITERASI_SANDI` `"15000"`; `ratelimits` ditambah `BATAS_MASUK` (`namespace_id` `"3103"`, 10 per 60 detik). Kunci datang dari rahasia Worker (P-32 dan P-29).
- **P-34. Kunci belum siap.** Selama `KUNCI_SANDI` atau `KUNCI_IP` kosong, atau `ITERASI_SANDI` tidak sah (P-2), rute yang memakainya menjawab 503 `KONSOL_BELUM_SIAP` tanpa rincian: `POST /api/masuk`, `POST /api/sandi`, `POST /api/akun`, `PATCH /api/akun/{id}` dengan `aturUlangSandi`, dan `POST /api/admin-awal`. Rute lain tetap berjalan seperti biasa.

### Pembersihan harian

- **P-35.** Pemicu harian yang sudah ada (`0 19 * * *`, 03.00 WITA), sesudah `tandaiRuangLama`, menghapus sesi yang `kedaluwarsa`-nya lewat atau `terakhir_dipakai`-nya lebih dari 8 jam yang lalu, dan catatan `batas_masuk` yang `jendela_mulai`-nya lebih dari 24 jam yang lalu dan tidak sedang terkunci.

### Dasbor

- **P-36.** `GET /api/dasbor` (izin `dasbor.lihat`) menjawab `{ "rujukanBelum": n }`, yaitu jumlah baris `rujukan` berstatus `belum`. Di D1 lokal dan uji yang sudah disemai, nilainya 23. Isi dasbor lain (ruang yang berjalan, sesi terakhir, ringkasan statistik) ditambahkan JS-10, JS-11, dan JS-13.

### Konsol

- **P-37. Membuka konsol dan rute.** Konsol di `/admin/` memakai rute *hash*: `#/masuk`, `#/sandi`, `#/dasbor`, dan `#/akun`. Saat dibuka, konsol menampilkan "Memuat konsol…" dan memanggil `GET /api/saya`.
  - Belum masuk: ke `#/masuk`.
  - Sudah masuk dan wajib ganti sandi: ke `#/sandi` dalam mode wajib, apa pun rutenya.
  - Sudah masuk: rute yang diminta; rute kosong, `#/masuk`, atau rute yang tidak dikenal (termasuk rute fitur yang belum ada, misalnya `#/ruang`) menjadi `#/dasbor`.
  - Guru yang membuka `#/akun` melihat "Halaman ini hanya untuk admin." dan tombol "Ke dasbor".
  - Server tidak menjawab: "Server belum tersambung. Periksa internet, lalu muat ulang halaman." dengan tombol "Muat ulang".
- **P-38. Kerangka.** Sesudah masuk (kecuali mode wajib ganti sandi), halaman memakai kerangka Design System 3.7:
  - **Navigasi samping** 240 px berlatar `ink`: merek ("Jejak Setara" dengan `ikon_jejak`), lalu menu Dasbor, Akun (hanya admin), dan Sandi saya. Butir aktif berlatar `sun` dengan ▶ dan teks `ink`, dan memakai `aria-current="page"`.
  - **Kepala** berlatar `cream` dengan garis bawah `ink`: judul halaman (Pixelify Sans 22 px), lalu "{nama} · {peran}" dan tombol "Keluar".
  - **Isi** paling lebar 1.200 px.
  - **Layar di bawah 1024 px** (D-2): navigasi samping disembunyikan, dan kepala mendapat tombol "Menu" (`aria-expanded`) yang membuka daftar menu di bawah kepala. Memilih butir menutup daftar itu.
  - Mode wajib ganti sandi memakai kepala tanpa menu: merek, "{nama} · {peran}", dan "Keluar".
- **P-39. Halaman masuk.** Panel bingkai piksel di tengah layar berlatar `ink`: judul "Jejak Setara" (Press Start 2P), "Konsol guru dan admin", kolom Email (`type="email"`, `autocomplete="username"`), kolom Sandi (`type="password"`, `autocomplete="current-password"`) dengan tombol Tampilkan (P-40), dan tombol "Masuk" selebar panel. Di bawah panel: penanda server (`PenandaServer` JS-01) dan dua kalimat kredit Design System 15.
  - Kolom kosong: "Isi email dan sandi." tanpa memanggil server.
  - Selama menunggu: tombol "Memeriksa…" dan nonaktif.
  - Galat dari server tampil di bawah kolom Sandi (`MASUK_SALAH`, `TERKUNCI`, `TERLALU_SERING`, `KONSOL_BELUM_SIAP`, atau galat jaringan). Kolom Sandi dikosongkan, dan fokus kembali ke kolom itu.
  - Datang dari sesi yang berakhir (P-48): pemberitahuan "Sesi berakhir. Silakan masuk lagi." di atas kolom Email.
  - Berhasil: ke `#/sandi` (wajib) atau `#/dasbor`.
- **P-40. Tampilkan sandi.** Setiap kolom sandi di konsol punya tombol "Tampilkan" yang mengubah kolom menjadi teks biasa dan tulisannya menjadi "Sembunyikan" (`aria-pressed`). Kolom kembali tersembunyi sesudah formulir dikirim.
- **P-41. Halaman sandi.**
  - **Mode wajib:** judul "Buat sandi baru", penjelasan "Anda masuk dengan sandi sementara. Buat sandi baru sebelum memakai konsol.", kolom "Sandi baru" dan "Ulangi sandi baru" (`autocomplete="new-password"`), petunjuk aturan, dan tombol "Simpan sandi". Berhasil: ke `#/dasbor` dengan pemberitahuan "Sandi baru tersimpan."
  - **Mode sukarela** ("Sandi saya"): kolom "Sandi sekarang", "Sandi baru", dan "Ulangi sandi baru". Berhasil: formulir dikosongkan dan pemberitahuan "Sandi baru tersimpan. Akun ini sudah dikeluarkan dari perangkat lain."
  - Pemeriksaan sebelum mengirim: aturan P-19 dan kedua sandi baru sama ("Kedua sandi baru tidak sama."). Galat tampil di bawah kolom yang bersangkutan, dan fokus pindah ke kolom itu. Selama menyimpan, tombol "Menyimpan…" dan nonaktif.
- **P-42. Dasbor kerangka.** Salam "Selamat datang, {nama}." lalu tiga kartu bingkai piksel berjajar (bersusun di layar di bawah 1024 px):
  - **Peringatan** (garis kiri `mango` 6 px dan `ikon_peringatan`, angka n dengan Press Start 2P): "{n} rujukan belum diverifikasi. Kejadian belum bisa terbit sampai semua rujukannya diverifikasi Peninjau." Bila n = 0: "Tidak ada peringatan." tanpa garis `mango`. Kartu ini tampil untuk semua peran (D-4).
  - **Ruang yang sedang berjalan:** "Belum ada ruang yang berjalan."
  - **Sesi terakhir:** "Belum ada sesi kelas."
  - Memuat: "Memuat…". Gagal: "Data dasbor gagal dimuat." dengan tombol "Coba lagi".
- **P-43. Halaman Akun (admin).** Baris atas: "{n} akun · {m} aktif" dan tombol "+ Akun baru". Tabel dengan kolom Nama, Email, Peran, Status, dan Masuk terakhir, serta tombol "Ubah" di setiap baris (label pembaca layar "Ubah akun {nama}").
  - Peran tertulis "Admin" atau "Guru", diikuti label "Peninjau" (`sun`) bila bertanda.
  - Status: "Aktif" (`leaf`, `ikon_centang`) atau "Nonaktif" (`mist`, `ikon_arsip`), ditambah label "Belum ganti sandi" (`mist`) untuk akun aktif yang wajib ganti sandi.
  - Masuk terakhir dalam zona waktu peramban, misalnya "14 Nov 2026, 07.12" (`Intl.DateTimeFormat("id-ID")`), atau "Belum pernah".
  - Baris akun sendiri diberi "(Anda)" sesudah nama.
  - Memuat, gagal dimuat, dan coba lagi seperti dasbor.
- **P-44. Dialog akun baru.** Judul "Akun baru"; kolom Email, Nama tampilan (dengan petunjuk "Nama yang tampil di konsol, misalnya Bu Sari."), pilihan Peran (Guru terpilih lebih dulu, atau Admin), dan kotak centang "Peninjau (boleh menandai rujukan terverifikasi)". Tombol "Buat akun" dan "Batal". Galat `EMAIL_SALAH`, `EMAIL_DIPAKAI`, dan `NAMA_SALAH` tampil di bawah kolomnya. Berhasil: dialog berganti menjadi dialog sandi sementara (P-45), dan tabel dimuat ulang.
- **P-45. Dialog sandi sementara.** Judul "Akun baru dibuat" atau "Sandi diatur ulang"; kalimat berhasil ("Akun {nama} ({peran}) sudah dibuat." atau "Sandi {nama} sudah diatur ulang."); label "Sandi sementara" dan sandinya (Press Start 2P 16 px, di kotak bergaris putus-putus, bisa dipilih); catatan "Berikan sandi ini langsung kepada pemilik akun. Sandi hanya tampil sekali dan wajib diganti saat masuk pertama."; tombol "Salin sandi" dan "Selesai". "Salin sandi" menyalin lewat papan klip lalu mengumumkan "Sandi disalin."; bila gagal: "Sandi gagal disalin. Pilih teksnya, lalu salin manual." Dialog ini hanya ditutup lewat "Selesai" (tombol `Esc` tidak menutupnya), dan sandi dibuang dari memori halaman sesudah ditutup.
- **P-46. Dialog ubah akun.** Judul "Ubah akun {nama}"; kolom Nama tampilan, pilihan Peran, kotak centang Peninjau, tombol "Simpan perubahan" dan "Batal"; lalu bagian terpisah berisi tombol "Nonaktifkan akun" atau "Aktifkan akun" dan "Atur ulang sandi". Untuk akun sendiri, pilihan Peran, tombol nonaktifkan, dan tombol atur ulang sandi dimatikan dengan catatan "Anda tidak bisa menurunkan peran, menonaktifkan, atau mengatur ulang sandi akun sendiri. Ganti sandi Anda lewat Sandi saya." Berhasil menyimpan: dialog tertutup dan pemberitahuan "Perubahan tersimpan."; mengaktifkan: "Akun {nama} aktif lagi."
- **P-47. Konfirmasi berbahaya** (Design System 10): menonaktifkan dan mengatur ulang sandi selalu meminta konfirmasi lebih dulu.
  - "Nonaktifkan akun {nama}?" dengan "{nama} tidak bisa masuk lagi dan dikeluarkan dari semua perangkat. Akun bisa diaktifkan kembali kapan saja." serta tombol `coral` "Nonaktifkan" dan "Batal".
  - "Atur ulang sandi {nama}?" dengan "Sandi lama tidak berlaku lagi, dan {nama} dikeluarkan dari semua perangkat. Sandi sementara baru hanya tampil sekali." serta tombol `coral` "Atur ulang sandi" dan "Batal". Berhasil: dialog sandi sementara (P-45).
- **P-48. Sesi berakhir saat dipakai.** Jawaban 401 `PERLU_MASUK` dari rute mana pun membawa konsol ke `#/masuk` dengan pemberitahuan "Sesi berakhir. Silakan masuk lagi." Jawaban 403 `WAJIB_GANTI_SANDI` membawa ke `#/sandi` mode wajib. Jawaban 403 `TIDAK_BERWENANG` membuat konsol membaca ulang `GET /api/saya` (sehingga menu mengikuti peran terbaru), lalu menampilkan pesan galatnya. "Keluar" membawa ke `#/masuk` tanpa pemberitahuan.
- **P-49. Huruf dan gaya** (KT-05: ya). Tabel, kolom isian, label, pesan, dan teks isi memakai huruf sistem (`system-ui, "Segoe UI", Roboto, "Noto Sans", sans-serif`) 15–16 px. Judul halaman, menu, dan tombol memakai Pixelify Sans; merek "Jejak Setara" dan sandi sementara memakai Press Start 2P. Warna hanya token `--js-`; teks di atas warna aksen selalu `ink`. Navigasi samping `ink`, kepala `cream`, area isi `white`, dan panel serta kartu berbingkai piksel `cream` (Design System 10). Pesan galat berupa teks `ink` dengan `ikon_peringatan` dan garis kiri `coral` 6 px di bawah kolomnya; pesan berhasil memakai `ikon_centang` dan garis kiri `leaf` 6 px. Kepala tabel `mist`, baris berselang `cream` dan `white`. Gaya konsol berawalan `js-konsol` di `jejak.css`, tanpa garis pindai.
- **P-50. Aksesibilitas.**
  - Semua tombol, tautan menu, dan kolom berukuran sedikitnya 48 px tingginya.
  - Fokus terlihat: garis `ink` 2 px di dalam dan garis `sun` 4 px di luar, sehingga tetap kontras di atas `cream`.
  - Setiap kolom punya label; galat dihubungkan lewat `aria-describedby` dan diumumkan lewat `role="alert"`.
  - Pemberitahuan berhasil diumumkan lewat wilayah `aria-live="polite"`.
  - Dialog memakai `role="dialog"`, `aria-modal="true"`, dan judulnya; fokus terkurung di dialog dan kembali ke tombol pembukanya sesudah ditutup; `Esc` menutup dialog, kecuali dialog sandi sementara.
  - Semua alur bisa dijalankan dengan papan ketik saja. Makna tidak hanya lewat warna: status, peran, dan Peninjau selalu tertulis.
- **P-51. Tempat teks.** Semua teks konsol, pesan galat API akun, dan teks ringkasan alur kerja ada di `app/jejak-setara/teks.ts`, dalam ekspor baru `TEKS_KONSOL` yang tidak diimpor layar pemain, sehingga ukuran layar pemain tidak berubah. `TEKS.konsolJudul` dan `TEKS.konsolIsi` dihapus; `TEKS.judulTabKonsol` tetap.

## Beberapa pengguna sekaligus

- Diberikan admin A dan guru B masuk di perangkat berbeda, ketika A menonaktifkan B, maka permintaan B berikutnya dijawab 401, dan konsol B kembali ke halaman masuk dengan "Sesi berakhir. Silakan masuk lagi." Masuk lagi dengan sandi lama B dijawab "Email atau sandi salah."
- Diberikan B masuk di laptop dan HP, ketika B mengganti sandi di laptop, maka sesi HP berakhir, sedangkan laptop tetap masuk dengan sesi baru.
- Diberikan A mengatur ulang sandi B saat B sedang masuk, maka sesi B berakhir, dan B hanya bisa masuk dengan sandi sementara baru, lalu wajib menggantinya.
- Diberikan dua admin A dan C, ketika A menurunkan peran C menjadi guru, maka C tetap masuk, tetapi permintaan `akun.kelola` C berikutnya dijawab 403 `TIDAK_BERWENANG`, dan menu Akun hilang sesudah konsol C membaca ulang `GET /api/saya` (saat dimuat ulang atau sesudah galat 403).
- Diberikan lima percobaan gagal untuk satu email dari dua perangkat berbeda dalam 15 menit, maka percobaan keenam dari perangkat mana pun dijawab `TERKUNCI`, sedangkan email lain dari perangkat yang sama tetap bisa mencoba.
- Diberikan 20 percobaan gagal dari satu alamat sekolah dalam sehari, maka semua masuk dari alamat itu terkunci 15 menit (risiko di `PLAN.md`); pemain di alamat yang sama tidak terdampak.
- Diberikan alur kerja "Jejak: admin awal" berjalan saat admin sedang masuk dengan email yang sama, maka sesi admin itu berakhir, dan admin masuk lagi dengan sandi sementara.

## Status antarmuka

| Keadaan | Yang tampil |
|---|---|
| Memuat konsol | "Memuat konsol…" di tengah layar `ink` |
| Server tidak menjawab | Pesan server belum tersambung dan tombol "Muat ulang" |
| Masuk: biasa | Panel masuk, penanda server, dan kredit |
| Masuk: fokus | Garis fokus `ink` dan `sun` pada kolom atau tombol |
| Masuk: kolom kosong | "Isi email dan sandi." di bawah kolom Sandi; tanpa permintaan ke server |
| Masuk: memeriksa | Tombol "Memeriksa…" nonaktif; kolom tetap terlihat |
| Masuk: salah, terkunci, terlalu sering, belum siap, jaringan | Pesan galat di bawah kolom Sandi; kolom Sandi kosong dan difokus |
| Masuk: sesi berakhir | Pemberitahuan di atas kolom Email |
| Sandi wajib | Kepala tanpa menu; formulir "Buat sandi baru" |
| Sandi: galat isian | Pesan di bawah kolom yang salah; fokus ke kolom itu |
| Sandi: menyimpan | Tombol "Menyimpan…" nonaktif |
| Sandi: berhasil | Pemberitahuan berhasil (dasbor untuk mode wajib) |
| Dasbor: memuat, gagal | "Memuat…"; "Data dasbor gagal dimuat." dengan "Coba lagi" |
| Dasbor: ada atau tanpa peringatan | Kartu Peringatan bergaris kiri `mango` dengan jumlah, atau "Tidak ada peringatan." |
| Dasbor: kosong | Kartu ruang dan sesi dengan kalimat keadaan kosong |
| Akun: memuat, gagal | Seperti dasbor |
| Akun: daftar | Tabel dengan label peran, Peninjau, status, dan "(Anda)" |
| Dialog akun baru: galat, membuat | Pesan di bawah kolom; tombol "Membuat…" nonaktif |
| Dialog sandi sementara | Sandi sekali tampil; "Salin sandi" dan "Selesai" |
| Dialog ubah: akun sendiri | Pilihan Peran, tombol nonaktifkan, dan tombol atur ulang sandi dimatikan, dengan catatan |
| Konfirmasi | Judul pertanyaan, akibat, tombol `coral` bertuliskan aksinya, dan "Batal" |
| Guru membuka Akun | "Halaman ini hanya untuk admin." dan "Ke dasbor" |
| Layar di bawah 1024 px | Navigasi samping tersembunyi; tombol "Menu" di kepala (D-2) |
| Kunci Worker belum siap | Masuk menjawab "Konsol belum siap. Coba lagi beberapa menit lagi." |

## Teks yang tampil (final)

Semua teks ada di `TEKS_KONSOL` (`app/jejak-setara/teks.ts`). Teks dengan `{nama}`, `{peran}`, `{n}`, atau `{m}` diisi lewat `isiTeks()`.

**Umum dan kerangka**

| Kunci | Teks |
|---|---|
| `merek` | Jejak Setara |
| `subjudul` | Konsol guru dan admin |
| `memuat` | Memuat konsol… |
| `serverTidakMenjawab` | Server belum tersambung. Periksa internet, lalu muat ulang halaman. |
| `muatUlang` | Muat ulang |
| `peran.admin` / `peran.guru` | Admin / Guru |
| `pengguna` | {nama} · {peran} |
| `keluar` | Keluar |
| `menu.label` | Menu konsol |
| `menu.tombol` | Menu |
| `menu.dasbor` / `menu.akun` / `menu.sandi` | Dasbor / Akun / Sandi saya |
| `sesiBerakhir` | Sesi berakhir. Silakan masuk lagi. |
| `hanyaAdmin` | Halaman ini hanya untuk admin. |
| `keDasbor` | Ke dasbor |
| `tampilkan` / `sembunyikan` | Tampilkan / Sembunyikan |
| `batal` | Batal |

**Halaman masuk**

| Kunci | Teks |
|---|---|
| `masuk.email` | Email |
| `masuk.sandi` | Sandi |
| `masuk.tombol` | Masuk |
| `masuk.memeriksa` | Memeriksa… |
| `masuk.isiKosong` | Isi email dan sandi. |
| `masuk.kreditAset` | Aset visual digambar dengan kode oleh Claude (Anthropic) berdasarkan arahan dan persetujuan YAN. |
| `masuk.kreditHuruf` | Huruf Press Start 2P dan Pixelify Sans, SIL Open Font License 1.1. |

**Halaman sandi**

| Kunci | Teks |
|---|---|
| `sandi.judulWajib` | Buat sandi baru |
| `sandi.penjelasanWajib` | Anda masuk dengan sandi sementara. Buat sandi baru sebelum memakai konsol. |
| `sandi.judul` | Sandi saya |
| `sandi.sekarang` | Sandi sekarang |
| `sandi.baru` | Sandi baru |
| `sandi.ulangi` | Ulangi sandi baru |
| `sandi.petunjuk` | Minimal 12 karakter. Kalimat pendek yang mudah Anda ingat lebih kuat daripada kata acak yang pendek. |
| `sandi.simpan` | Simpan sandi |
| `sandi.menyimpan` | Menyimpan… |
| `sandi.berhasil` | Sandi baru tersimpan. |
| `sandi.berhasilLain` | Sandi baru tersimpan. Akun ini sudah dikeluarkan dari perangkat lain. |
| `sandi.tidakSama` | Kedua sandi baru tidak sama. |

**Dasbor**

| Kunci | Teks |
|---|---|
| `dasbor.judul` | Dasbor |
| `dasbor.salam` | Selamat datang, {nama}. |
| `dasbor.peringatan` | Peringatan |
| `dasbor.rujukanBelum` | {n} rujukan belum diverifikasi. Kejadian belum bisa terbit sampai semua rujukannya diverifikasi Peninjau. |
| `dasbor.tanpaPeringatan` | Tidak ada peringatan. |
| `dasbor.ruang` | Ruang yang sedang berjalan |
| `dasbor.ruangKosong` | Belum ada ruang yang berjalan. |
| `dasbor.sesi` | Sesi terakhir |
| `dasbor.sesiKosong` | Belum ada sesi kelas. |
| `dasbor.memuat` | Memuat… |
| `dasbor.gagal` | Data dasbor gagal dimuat. |
| `dasbor.cobaLagi` | Coba lagi |

**Akun**

| Kunci | Teks |
|---|---|
| `akun.judul` | Akun |
| `akun.ringkasan` | {n} akun · {m} aktif |
| `akun.baru` | + Akun baru |
| `akun.kolomNama` / `akun.kolomEmail` / `akun.kolomPeran` / `akun.kolomStatus` / `akun.kolomMasuk` | Nama / Email / Peran / Status / Masuk terakhir |
| `akun.peninjau` | Peninjau |
| `akun.aktif` / `akun.nonaktif` | Aktif / Nonaktif |
| `akun.belumGanti` | Belum ganti sandi |
| `akun.belumPernah` | Belum pernah |
| `akun.anda` | (Anda) |
| `akun.ubah` | Ubah |
| `akun.ubahLabel` | Ubah akun {nama} |
| `akun.gagal` | Daftar akun gagal dimuat. |
| `akunBaru.judul` | Akun baru |
| `akunBaru.email` | Email |
| `akunBaru.nama` | Nama tampilan |
| `akunBaru.namaPetunjuk` | Nama yang tampil di konsol, misalnya Bu Sari. |
| `akunBaru.peran` | Peran |
| `akunBaru.peninjau` | Peninjau (boleh menandai rujukan terverifikasi) |
| `akunBaru.buat` | Buat akun |
| `akunBaru.membuat` | Membuat… |
| `sementara.judulBaru` | Akun baru dibuat |
| `sementara.judulAturUlang` | Sandi diatur ulang |
| `sementara.berhasilBaru` | Akun {nama} ({peran}) sudah dibuat. |
| `sementara.berhasilAturUlang` | Sandi {nama} sudah diatur ulang. |
| `sementara.label` | Sandi sementara |
| `sementara.catatan` | Berikan sandi ini langsung kepada pemilik akun. Sandi hanya tampil sekali dan wajib diganti saat masuk pertama. |
| `sementara.salin` | Salin sandi |
| `sementara.tersalin` | Sandi disalin. |
| `sementara.gagalSalin` | Sandi gagal disalin. Pilih teksnya, lalu salin manual. |
| `sementara.selesai` | Selesai |
| `ubah.judul` | Ubah akun {nama} |
| `ubah.simpan` | Simpan perubahan |
| `ubah.menyimpan` | Menyimpan… |
| `ubah.diri` | Anda tidak bisa menurunkan peran, menonaktifkan, atau mengatur ulang sandi akun sendiri. Ganti sandi Anda lewat Sandi saya. |
| `ubah.nonaktifkan` | Nonaktifkan akun |
| `ubah.aktifkan` | Aktifkan akun |
| `ubah.aturUlang` | Atur ulang sandi |
| `ubah.tersimpan` | Perubahan tersimpan. |
| `ubah.aktifLagi` | Akun {nama} aktif lagi. |
| `konfirmasi.nonaktifJudul` | Nonaktifkan akun {nama}? |
| `konfirmasi.nonaktifIsi` | {nama} tidak bisa masuk lagi dan dikeluarkan dari semua perangkat. Akun bisa diaktifkan kembali kapan saja. |
| `konfirmasi.nonaktifTombol` | Nonaktifkan |
| `konfirmasi.aturUlangJudul` | Atur ulang sandi {nama}? |
| `konfirmasi.aturUlangIsi` | Sandi lama tidak berlaku lagi, dan {nama} dikeluarkan dari semua perangkat. Sandi sementara baru hanya tampil sekali. |
| `konfirmasi.aturUlangTombol` | Atur ulang sandi |

**Galat** (`galat.KODE`; teks yang sama dikirim server di `galat.pesan`)

| Kode | Teks |
|---|---|
| `MASUK_SALAH` | Email atau sandi salah. |
| `TERKUNCI` | Terlalu banyak percobaan masuk. Tunggu 15 menit, lalu coba lagi. |
| `TERLALU_SERING` | Terlalu banyak percobaan. Tunggu sebentar. |
| `PERLU_MASUK` | Silakan masuk dulu. |
| `WAJIB_GANTI_SANDI` | Ganti sandi sementara dulu. |
| `TIDAK_BERWENANG` | Anda tidak berwenang melakukan ini. |
| `ASAL_DITOLAK` | Permintaan ditolak. |
| `PERMINTAAN_SALAH` | Permintaan tidak sah. |
| `KONSOL_BELUM_SIAP` | Konsol belum siap. Coba lagi beberapa menit lagi. |
| `SANDI_LAMA_SALAH` | Sandi sekarang tidak cocok. |
| `SANDI_PENDEK` | Sandi baru minimal 12 karakter. |
| `SANDI_PANJANG` | Sandi baru paling banyak 128 karakter. |
| `SANDI_SAMA_EMAIL` | Sandi baru tidak boleh sama dengan email. |
| `SANDI_SAMA` | Sandi baru harus berbeda dari sandi sekarang. |
| `EMAIL_SALAH` | Tulis email yang benar, misalnya nama@sekolah.sch.id. |
| `EMAIL_DIPAKAI` | Email ini sudah dipakai akun lain. |
| `NAMA_SALAH` | Nama tampilan harus 1 sampai 40 karakter. |
| `AKUN_TIDAK_ADA` | Akun tidak ditemukan. |
| `TIDAK_BOLEH_DIRI` | Anda tidak bisa menurunkan peran, menonaktifkan, atau mengatur ulang sandi akun sendiri. |
| `ADMIN_TERAKHIR` | Harus ada sedikitnya satu admin aktif. |
| `KUNCI_ADMIN_SALAH` | Kunci admin awal tidak cocok. |
| `JARINGAN` (hanya konsol) | Gagal menghubungi server. Periksa internet, lalu coba lagi. |
| `UMUM` (hanya konsol, untuk kode lain) | Terjadi kesalahan. Coba lagi. |

**Alur kerja "Jejak: admin awal"** (`alurAdminAwal`, dipakai uji untuk memeriksa berkas alur kerja)

| Kunci | Teks |
|---|---|
| `dibuat` | Akun admin dibuat. |
| `dipulihkan` | Akun admin dipulihkan: sandi sementara baru berlaku, dan semua sesi lama sudah keluar. |
| `alamat` | Alamat konsol: {alamat}/admin/ |
| `petunjuk` | Masuk dengan email di rahasia JEJAK_ADMIN_EMAIL dan sandi sementara di rahasia JEJAK_ADMIN_SANDI_SEMENTARA, lalu buat sandi baru. |
| `rahasiaCloudflare` | Rahasia Cloudflare belum diisi (Architecture bagian 18, langkah 6). |
| `rahasiaAdmin` | Rahasia JEJAK_ADMIN_EMAIL atau JEJAK_ADMIN_SANDI_SEMENTARA belum diisi (Architecture bagian 18, langkah 6). |
| `emailSalah` | JEJAK_ADMIN_EMAIL bukan alamat email. |
| `sandiSalah` | JEJAK_ADMIN_SANDI_SEMENTARA harus 12 sampai 128 karakter. Isi ulang rahasianya, lalu jalankan lagi. |
| `namaSalah` | Nama tampilan harus 1 sampai 40 karakter. |
| `belumSiap` | Konsol belum siap: kunci Worker belum dibuat. Jalankan ulang "Jejak: uji", lalu coba lagi. |
| `gagal` | Akun admin gagal dibuat (status {status}). |
| `kunciBaru` | Kunci Worker baru: {nama}. |
| `kunciLengkap` | Kunci Worker sudah lengkap. |

`kunciBaru` dan `kunciLengkap` dicetak langkah "Siapkan kunci Worker" (P-32).

## Data, protokol, API, dan migrasi

- **Protokol:** tidak berubah; `PROTOKOL_VERSI` tetap 2.
- **Migrasi D1:** tidak ada. Dipakai tabel `0001_awal.sql`: `pengguna`, `sesi`, `batas_masuk`, dan `log_audit` (baca dan tulis), serta `rujukan` (hitung).
- **Skema di `inti/akun.ts`:** `skemaMasuk`, `skemaGantiSandi`, `skemaAkunBaru`, `skemaUbahAkun` (sedikitnya satu kolom), `skemaAdminAwal`, `skemaSaya`, `skemaAkun`, `skemaJawabanSaya`, `skemaDaftarAkun`, `skemaDasbor`, dan `skemaGalat`; konstanta `SANDI_MIN` 12, `SANDI_MAKS` 128, `NAMA_MAKS` 40, dan `EMAIL_MAKS` 254; fungsi murni `normalkanEmail` dan `periksaSandiBaru`. Semua isi permintaan `.strict()`.
- **Rute API:**

  | Metode dan jalur | Izin | Berhasil | Galat yang mungkin |
  |---|---|---|---|
  | `POST /api/masuk` | Umum | 200 `{ akun }` + cookie | 400 `PERMINTAAN_SALAH`, 401 `MASUK_SALAH`, 403 `ASAL_DITOLAK`, 429 `TERKUNCI` · `TERLALU_SERING`, 503 `KONSOL_BELUM_SIAP` |
  | `POST /api/keluar` | Umum | 200 `{ ok }` + cookie hapus | 403 `ASAL_DITOLAK` |
  | `GET /api/saya` | Umum | 200 `{ masuk, akun? }` | (tidak ada) |
  | `POST /api/sandi` | Masuk | 200 `{ akun }` + cookie baru | 400 `PERMINTAAN_SALAH` · `SANDI_*`, 401 `PERLU_MASUK`, 403 `ASAL_DITOLAK`, 429 `TERKUNCI` · `TERLALU_SERING`, 503 |
  | `GET /api/akun` | Admin | 200 `{ akun: [] }` | 401, 403 `WAJIB_GANTI_SANDI` · `TIDAK_BERWENANG`, 503 |
  | `POST /api/akun` | Admin | 201 `{ akun, sandiSementara }` | 400 `PERMINTAAN_SALAH` · `EMAIL_SALAH` · `NAMA_SALAH`, 401, 403, 409 `EMAIL_DIPAKAI`, 503 |
  | `PATCH /api/akun/{id}` | Admin | 200 `{ akun, sandiSementara? }` | 400 `PERMINTAAN_SALAH` · `NAMA_SALAH` · `TIDAK_BOLEH_DIRI`, 401, 403, 404 `AKUN_TIDAK_ADA`, 409 `ADMIN_TERAKHIR`, 503 |
  | `GET /api/dasbor` | Admin, guru | 200 `{ rujukanBelum }` | 401, 403 `WAJIB_GANTI_SANDI`, 503 |
  | `POST /api/admin-awal` | Kunci `KUNCI_ADMIN` | 200 `{ hasil }` | 400, 403 `KUNCI_ADMIN_SALAH`, 404 `BELUM_TERSEDIA`, 429 `TERLALU_SERING`, 503 |

  Metode lain di jalur-jalur ini dijawab 405 `METODE_TIDAK_DIDUKUNG` dengan tajuk `Allow`. Semua jawaban memakai tajuk JSON JS-03 (`TAJUK_JSON`) dan bentuk galat `{ "galat": { "kode", "pesan" } }`. Isi permintaan lebih dari 4.096 byte dijawab 400 `PERMINTAAN_SALAH`.
- **Rahasia dan variabel Worker:** `KUNCI_SANDI` dan `KUNCI_IP` (dibuat langkah deploy, P-32), `KUNCI_ADMIN` (dibuat dan diganti alur kerja admin awal, P-29), `ITERASI_SANDI` (variabel), dan binding `BATAS_MASUK` (P-33).
- **Dokumen yang ikut diubah (serah terima Gerbang 2 ini):**
  - Architecture: 3 (berkas baru), 4.2 (binding dan variabel), 4.4 (kedua alur kerja), 4.5 (kunci dan variabel), 10.1 (`#/sandi`), 10.2 (rute dan bentuk jawaban), 10.3 (angka dan aturan JS-04), 10.4 (tabel izin dan log audit), 15 (pemulihan admin), dan 18 (langkah 9);
  - Design System: 3.7 (halaman masuk, kerangka, dan layar sempit) dan 5 (KT-05 diputuskan);
  - PRD: 20 dan 21 (KT-05 dan keputusan Gerbang 1).

## Aset

Semua dari `manifest.ts`, Disetujui, dan tanpa aset baru: `IKON.ikon_jejak` (merek), `IKON.ikon_peringatan` (kartu Peringatan dan pesan galat), `IKON.ikon_centang` (status Aktif dan pesan berhasil), dan `IKON.ikon_arsip` (status Nonaktif). Huruf Press Start 2P dan Pixelify Sans dari `@fontsource` yang sudah terpasang.

## Keamanan dan privasi

- Sandi tidak pernah disimpan, dicatat, atau dikirim balik. Hanya hash berkunci tambahan (P-1) yang tersimpan, dan kunci `KUNCI_SANDI` hanya ada di rahasia Worker.
- Token sesi hanya ada di cookie `HttpOnly`; D1 hanya menyimpan hash-nya.
- Alamat IP hanya dipakai sesaat sebagai bahan kunci pembatas (P-12) dan tidak disimpan (PRD 13).
- Pesan masuk tidak membedakan email terdaftar (P-4, P-13, P-15).
- Setiap permintaan yang mengubah data diperiksa `X-Jejak` dan `Origin` (P-10); cookie `SameSite=Lax`.
- Rute admin awal tertutup kecuali selama alur kerja berjalan (P-28, P-29). Isi rahasia GitHub disamarkan di log, dan ringkasan tidak memuat email.
- Kunci tiruan lokal (P-33) hanya berlaku di lingkungan `lokal` dan bernama "bukan-rahasia".
- Log Workers tidak mencatat email, sandi, token, atau alamat IP (Architecture 12.3). Log audit tidak memuat sandi, hash, token, atau alamat IP (P-26).
- Tidak ada data siswa yang tersentuh.

## Di luar cakupan

- Membuat ruang dari konsol, tiket, dan layar kelas (JS-10); riwayat dan hasil ruang (JS-11); bank kejadian, paket, pustaka rujukan, dan verifikasi rujukan (JS-12); statistik dan isi dasbor lainnya (JS-13).
- Halaman log audit dan pengaturan umum (JS-19). JS-04 hanya menulis baris log audit.
- Lupa sandi lewat surel, verifikasi dua langkah, dan Cloudflare Access.
- Menghapus akun dan mengubah email akun.
- Lingkungan produksi untuk alur kerja admin awal dan langkah kunci Worker (menjelang rilis, catatan di `PLAN.md`).
- `KUNCI_TIKET` (JS-10).
- Menaikkan `ITERASI_SANDI` ke 100.000 (sesudah paket berbayar aktif).

## DRAF untuk ditinjau pemilik proyek

- **D-1. Masa berlaku cookie.** — (a, saran) cookie tanpa masa berlaku: hilang saat peramban ditutup, karena laptop sekolah sering dipakai bergantian. Server tetap membatasi 8 jam tidak dipakai dan paling lama 7 hari. (b) Cookie berlaku 7 hari: guru tidak perlu masuk lagi sesudah menutup peramban, tetapi orang berikutnya di laptop yang sama bisa langsung masuk ke konsol guru itu.
- **D-2. Navigasi di layar di bawah 1024 px.** — (a, saran) navigasi samping disembunyikan, dan tombol "Menu" di kepala membuka daftar menu. Di 1024 px ke atas navigasi samping selalu tampil (maket Gerbang 1 menunjukkan tabel akun tetap muat di 1024 × 768). (b) Navigasi samping selalu tampil di 768 px ke atas dengan lebar 200 px, dan berpindah ke atas isi di HP.
- **D-3. Mengetik sandi sementara.** — (a, saran) diketik persis seperti tampil, termasuk tanda hubung dan huruf besar; tombol "Salin sandi" membantu bila sandi dikirim lewat pesan. (b) Saat akun masih wajib ganti sandi, sandi yang diketik dinormalkan dulu (tanpa tanda hubung dan spasi, huruf besar semua), dan sandi sementara di-hash dalam bentuk normal yang sama: lebih ramah bagi guru yang menyalin dari kertas, tetapi menambah satu aturan khusus yang juga berlaku untuk sandi sementara dari rahasia GitHub.
- **D-4. Siapa yang melihat kartu Peringatan.** — (a, saran) semua akun, agar guru juga tahu mengapa kejadian belum bisa terbit. (b) Hanya admin dan akun bertanda Peninjau, yang bisa menindaklanjutinya.

## Kriteria penerimaan

- [ ] AC-1 **Hash.** P-1 sampai P-4: bentuk hash dan garam; hash cocok untuk sandi benar dan tidak untuk sandi lain; normalisasi NFC; `ITERASI_SANDI` di luar 1.000–100.000 menghasilkan 503; hash ulang saat iterasi akun di bawah target dan tidak saat di atas; jumlah hash per permintaan sesuai tabel P-3 (dihitung lewat pembungkus hash yang diuji); hash tiruan untuk email tidak terdaftar dan akun nonaktif.
- [ ] AC-2 **Sandi sementara.** P-5: 19 karakter berpola `XXXX-XXXX-XXXX-XXXX` dari `ABJAD_KODE`, tanpa bias (pemeriksaan pasti dengan sumber byte berbenih, catatan "Semua fitur (9 Nov 2026)" di `PLAN.md`), dan tidak pernah tersimpan atau tercatat.
- [ ] AC-3 **Sesi dan cookie.** P-6 sampai P-9: atribut cookie persis seperti P-6 (sesuai pilihan D-1); D1 hanya menyimpan hash token; sesi berakhir sesudah 8 jam tidak dipakai dan sesudah 7 hari (diuji dengan menua-kan baris D1); `terakhir_dipakai` hanya ditulis sesudah 5 menit; keluar dan keempat peristiwa P-9 menghapus sesi yang benar.
- [ ] AC-4 **CSRF.** P-10: setiap `POST` dan `PATCH` tanpa `X-Jejak: 1` atau dengan `Origin` lain dijawab 403 `ASAL_DITOLAK`, kecuali admin awal.
- [ ] AC-5 **Masuk dan pembatas.** P-11 sampai P-15:
  - urutan langkah P-11, termasuk 401 tanpa hash untuk isi yang tidak memenuhi skema;
  - kunci email dan kunci alamat berbentuk P-12, tanpa alamat IP di D1;
  - penguncian pada percobaan keenam (email) dan ke-21 (alamat), selama 15 menit, tanpa hash, dengan pesan `TERKUNCI`, dan jendela yang mulai lagi;
  - masuk berhasil menghapus hitungan email;
  - `BATAS_MASUK` menjawab 429 `TERLALU_SERING`;
  - jawaban yang sama untuk email tidak terdaftar, akun nonaktif, dan sandi salah.
- [ ] AC-6 **Akun saat ini dan ganti sandi.** P-16 sampai P-19: `GET /api/saya` selalu 200; gerbang ganti sandi wajib; mode wajib dan sukarela dengan semua kode galatnya; sandi sementara tidak bisa dipakai lagi sebagai sandi baru; sesi lain berakhir dan sesi baru dibuat.
- [ ] AC-7 **Izin.** P-20 dan P-21: guru mendapat 403 `TIDAK_BERWENANG` di ketiga rute akun; tanpa sesi 401; tabel izin diuji per aksi dan per peran.
- [ ] AC-8 **Kelola akun.** P-22 sampai P-27: daftar dengan urutan dan kolom P-22 tanpa hash; akun baru dengan sandi sementara dan `EMAIL_DIPAKAI`; setiap kolom ubah, nonaktif, dan atur ulang; perlindungan diri dan admin terakhir; normalisasi email dan batas nama; satu baris log audit per perubahan dengan rincian P-26 dan tanpa sandi.
- [ ] AC-9 **Admin awal.** P-28, P-30, dan P-31: 404 tanpa kunci (uji unit dengan `Env` tanpa `KUNCI_ADMIN`), 403 dengan kunci salah, hasil `dibuat` dan `dipulihkan` dengan semua akibat P-30, dan log audit.
- [ ] AC-10 **Alur kerja dan kunci Worker.** P-29 dan P-32 (diperiksa `kerangka.test.ts`):
  - `jejak-admin-awal.yml`: nama "Jejak: admin awal", tombol dengan masukan `nama_tampilan`, `concurrency` `jejak-cloudflare-uji`, langkah P-29 berurutan, langkah penutup `if: always()`, `wrangler@4.92.0`, tanpa `echo` isi rahasia, dan teks `alurAdminAwal`;
  - `jejak-uji.yml`: langkah "Siapkan kunci Worker" di antara "Semai bank awal" dan "Deploy Worker uji" dengan syarat yang sama, dan `--secrets-file` di langkah deploy.
- [ ] AC-11 **Konfigurasi.** P-33 dan P-34: isi `wrangler.jsonc` sesuai P-33 (uji `kerangka.test.ts`); 503 `KONSOL_BELUM_SIAP` bila kunci kosong (uji unit).
- [ ] AC-12 **Pembersihan harian.** P-35: sesi kedaluwarsa dan catatan pembatas lama terhapus; sesi sah dan kunci yang sedang terkunci tetap ada.
- [ ] AC-13 **Dasbor.** P-36 dan P-42: `rujukanBelum` 23 di D1 lokal yang disemai; kartu Peringatan sesuai pilihan D-4; kedua kartu keadaan kosong; memuat dan gagal.
- [ ] AC-14 **Konsol: masuk dan rute.** P-37 sampai P-40 dan P-48: semua keadaan halaman masuk; pengalihan rute; menu per peran; "Halaman ini hanya untuk admin."; sesi berakhir saat dipakai; tombol Tampilkan.
- [ ] AC-15 **Konsol: sandi.** P-41: kedua mode, pemeriksaan sebelum mengirim, dan galat dari server di kolom yang benar.
- [ ] AC-16 **Konsol: akun.** P-43 sampai P-47: tabel, dialog akun baru, dialog sandi sementara (sekali tampil, salin, `Esc` tidak menutup), dialog ubah termasuk akun sendiri, dan kedua konfirmasi.
- [ ] AC-17 **Tampilan dan teks.** P-49 dan P-51: huruf sesuai KT-05; hanya token `--js-`; teks sama persis dengan bagian "Teks yang tampil (final)" (uji `TEKS_KONSOL`); navigasi layar sempit sesuai pilihan D-2; tangkapan layar di empat ukuran.
- [ ] AC-18 **Aksesibilitas.** P-50: target ≥ 48 px, fokus terlihat dengan kontras ≥ 3 : 1 terhadap latarnya, label dan galat terhubung, pengumuman, dialog dengan fokus terkurung, dan semua alur dengan papan ketik saja.
- [ ] AC-19 **Ukuran.** Kode konsol ≤ 350 KB gzip (Architecture 11.3), dengan angkanya dicatat. Ukuran kode layar pemain tidak berubah lebih dari 0,5 KB gzip (P-51).
- [ ] AC-20 **CPU di lingkungan uji** (usulan 10a, sesudah push): pemilik proyek menjalankan "Jejak: admin awal", masuk, mengganti sandi wajib, lalu mengganti sandi lewat "Sandi saya", dan mengirim tangkapan layar grafik CPU time Worker `jejak-setara-uji`. Persentil tertinggi ≤ 7 ms dicatat di laporan. Bila lebih, `ITERASI_SANDI` diturunkan lewat commit kecil.
- [ ] AC-21 **Kode dan lingkungan.**
  - semua perintah AGENTS bagian 6 lulus; `sim:beban` tidak wajib (tidak menyentuh protokol, inti ruang, atau kiriman ke D1);
  - `tsc --noEmit` 0 galat dan ESLint 0 masalah pada berkas Jejak Setara;
  - tidak ada galat konsol, pelanggaran CSP, atau respons 4xx dan 5xx yang tidak diharapkan (yang diharapkan hanya jawaban galat yang sengaja diuji);
  - galeri 178 berkas identik byte;
  - `PROTOKOL_VERSI` tetap 2, dan uji JS-03, JS-05, JS-06, JS-07, dan JS-08 tetap lulus.
- [ ] AC-22 **Dokumen.** Architecture, Design System, dan PRD sesuai bagian "Data, protokol, API, dan migrasi"; `PLAN.md` diperbarui.

## Rencana uji

### Uji unit (`test:jejak`)

- `__tests__/akun/skema.test.ts` (`inti/akun.ts`): setiap skema dengan contoh yang diterima dan ditolak; `normalkanEmail`; `periksaSandiBaru` untuk batas 11, 12, 128, dan 129 titik kode (termasuk huruf beraksen dan emoji), dan sandi sama dengan email.
- `__tests__/akun/sandi.test.ts` (`auth/sandi.ts`, WebCrypto Node): bentuk hash dan garam; cocok dan tidak cocok; NFC; hash tiruan; hash ulang; batas `ITERASI_SANDI`; sandi sementara dengan sumber byte berbenih (pola, abjad, tanpa bias).
- `__tests__/akun/sesi.test.ts`: tulisan cookie dan cookie hapus; pembacaan cookie dari tajuk `Cookie` yang berisi beberapa cookie; aturan 8 jam, 7 hari, dan 5 menit dengan jam tiruan.
- `__tests__/akun/batas.test.ts`: bentuk kunci email dan alamat; jendela 15 menit dan 24 jam; penguncian pada batasnya; pemulihan sesudah 15 menit.
- `__tests__/akun/izin.test.ts`: tabel aksi untuk admin, guru, akun nonaktif, dan ganti sandi wajib.
- `__tests__/akun/rute.test.ts` (`admin/rute.ts`): pembacaan *hash* dan pengalihan P-37 untuk setiap keadaan masuk dan peran.
- `__tests__/akun/api-akun.test.ts`: penanganan rute dengan D1 tiruan di atas `node:sqlite` (skema dari `0001_awal.sql`, seperti uji `antrean.ts` dan `bank-semai`) dan binding tiruan, untuk hal yang sulit diuji lewat server lokal: `KUNCI_ADMIN` kosong (404), kunci Worker kosong (503), `ITERASI_SANDI` tidak sah, binding pembatas yang gagal, jumlah hash per permintaan (P-3), dan pembersihan harian (P-35) dengan jam tiruan.
- `__tests__/kerangka.test.ts`: `TEKS_KONSOL` sama persis dengan bagian "Teks yang tampil (final)"; `TEKS` tanpa `konsolJudul` dan `konsolIsi`; isi `wrangler.jsonc` (P-33); langkah "Siapkan kunci Worker" dan `--secrets-file` di `jejak-uji.yml`; dan isi `jejak-admin-awal.yml` (AC-10).

### Uji server (`test:jejak:server`, `server/jejak-setara/uji/akun.uji-server.ts`)

Terhadap server lokal port 4320. Setiap kelompok membuat admin sendiri lewat `POST /api/admin-awal` dengan kunci lokal (P-31) dan email unik. Uji yang menyentuh pembatas mengirim `CF-Connecting-IP` berbeda (Miniflare meneruskan tajuk ini, diperiksa 14 Nov 2026) atau membersihkan `batas_masuk` lewat `d1()`. Uji masa sesi menua-kan baris `sesi` lewat `d1()`.

- Admin awal: dibuat, dipulihkan (termasuk akun yang semula guru dan nonaktif), kunci salah, dan sandi terlalu pendek.
- Masuk: berhasil (cookie, baris `sesi` berisi hash, `masuk_terakhir`), sandi salah, email tidak terdaftar, akun nonaktif, isi rusak, tanpa `X-Jejak`, `Origin` lain, penguncian email pada percobaan keenam, penguncian alamat pada percobaan ke-21, dan pemulihan sesudah `terkunci_sampai` dimundurkan.
- Ganti sandi wajib dan sukarela beserta semua kode galatnya; sesi perangkat lain berakhir.
- Gerbang wajib ganti sandi untuk `GET /api/akun` dan `GET /api/dasbor`.
- Kelola akun: buat, daftar, ubah setiap kolom, nonaktif (sesi target terhapus), atur ulang (sandi lama tidak berlaku, sesi terhapus), perlindungan diri, admin terakhir, guru ditolak, dan baris `log_audit`.
- Hash ulang: akun dengan `iterasi` 5.000 (hash dibuat di Node dengan kunci lokal, lalu ditulis lewat `d1()`) berubah menjadi 15.000 sesudah masuk, dan tetap bisa masuk lagi.
- Masa sesi: 8 jam tidak dipakai, 7 hari, dan pembaruan `terakhir_dipakai` sesudah 5 menit.
- Tajuk JSON JS-03 di setiap jawaban, 405 dengan `Allow`, dan isi lebih dari 4.096 byte.

### Uji ujung ke ujung (`e2e/jejak-setara/konsol.uji.ts`)

Admin dibuat lewat `POST /api/admin-awal` dengan kunci lokal sebelum uji.

- **Admin, laptop 1280 × 720:** konsol menampilkan halaman masuk dengan penanda server dan kredit; sandi salah menampilkan "Email atau sandi salah."; sandi sementara membuka "Buat sandi baru"; kedua sandi yang berbeda ditolak di peramban; sandi baru tersimpan dan dasbor tampil dengan "Selamat datang, …" dan "23 rujukan belum diverifikasi."; menu memuat Dasbor, Akun, dan Sandi saya.
- **Akun:** membuat akun guru; dialog sandi sementara tampil sekali, `Esc` tidak menutupnya, "Salin sandi" mengumumkan "Sandi disalin." (izin papan klip diberikan ke konteks uji); tabel memuat akun baru dengan "Belum ganti sandi".
- **Guru, konteks kedua (HP 731 × 411 dengan sentuhan, lalu 1024 × 768):** masuk dengan sandi sementara, mengganti sandi, melihat dasbor tanpa menu Akun; `#/akun` menampilkan "Halaman ini hanya untuk admin."; tombol "Menu" sesuai pilihan D-2.
- **Nonaktif dan atur ulang:** admin menonaktifkan guru lewat konfirmasi; konsol guru kembali ke halaman masuk dengan "Sesi berakhir. Silakan masuk lagi." sesudah memuat ulang; admin mengaktifkan dan mengatur ulang sandinya; guru masuk dengan sandi sementara baru.
- **Penguncian:** lima sandi salah untuk satu email, lalu pesan `TERKUNCI` di percobaan keenam (catatan pembatas dibersihkan sesudahnya).
- **Papan ketik saja:** masuk, ganti sandi, membuka dialog akun baru, mengisi, dan menutup dengan `Tab`, `Enter`, `Spasi`, dan `Esc`.
- **Keluar:** kembali ke halaman masuk; `GET /api/saya` menjawab `masuk: false`.
- **Tangkapan layar** empat ukuran (731 × 411, 1280 × 720, 1024 × 768, 1920 × 1080): halaman masuk, sandi wajib, dasbor, akun, dialog akun baru, dan dialog sandi sementara. 0 galat konsol (selain jawaban galat yang sengaja diuji), 0 pelanggaran CSP, dan 0 permintaan ke alamat lain.
- **`kerangka.uji.ts`:** baris `/admin/` diganti pemeriksaan halaman masuk konsol (judul tab, huruf, penanda server, dan tajuk keamanan halaman).

### Manual (AGENTS 9) dan lingkungan uji

- Sesudah push: "Jejak: uji" hijau dengan langkah "Siapkan kunci Worker", lalu langkah pemilik proyek di `PLAN.md` (bagian "Langkah pemilik proyek" entri JS-04), termasuk AC-20.
- Konsol bisa dipakai sampai akhir hanya dengan papan ketik di laptop.
- Tampilan rapi di 1024 × 768 dan 1920 × 1080, dan dasbor terbaca di HP.
