# JS-04 — Hasil uji

| | |
|---|---|
| Fitur | JS-04 Akun dan autentikasi |
| Spesifikasi | [specs/JS-04-akun.md](../specs/JS-04-akun.md), disetujui 14 November 2026 (`Spesifikasi disetujui: JS-04`) dengan saran D-1a sampai D-4a |
| Tanggal | 14 November 2026 |
| Lingkungan | Lingkungan agen: Node 22.23.4, pnpm 11.25.0, `wrangler` 4.92.0, `workerd` 1.20260515, dan Chromium untuk Playwright 1.56.1 (`JEJAK_CHROMIUM`). Salinan folder repositori pemilik proyek pada commit `5f9030a` (mode folder lokal, AGENTS 11.5) |
| Keputusan | **Kembali ke Build untuk AC-20 (penutupan, 14 November 2026)**: langkah pemilik proyek di lingkungan uji berhasil tanpa galat, tetapi permintaan dua hash memakai sekitar 12,7–14,8 ms CPU, melewati batas AC-20 (7 ms). `ITERASI_SANDI` sudah diturunkan ke 4.000, dan AC-20 diukur ulang sesudah push (bagian "Penutupan"). Kriteria lain lulus. Keputusan Build semula: Lulus dengan catatan AC-20. Tiga penyesuaian kecil terhadap rincian berkas di spesifikasi dijelaskan di bagian "Temuan": teks konsol di `teks-konsol.ts`, ikon konsol tanpa `manifest.ts`, dan berkas tambahan `admin/Formulir.tsx` |

## Perintah resmi

| Perintah | Hasil |
|---|---|
| `install --frozen-lockfile` | Lulus di awal Build; `package.json` dan lockfile tidak berubah, tanpa dependensi baru |
| `content:check:jejak` | Lulus: 10 berkas, 254 uji |
| `test:jejak` | Lulus: 45 berkas, 879 uji (garis dasar 38 berkas dan 766 uji). Berkas baru di `__tests__/akun/`: `skema`, `sandi`, `sesi`, `batas`, `izin`, `rute`, dan `api-akun` (rute akun di atas D1 tiruan `node:sqlite`, `d1Tiruan.ts`). `kerangka.test.ts` naik dari 35 ke 44 uji |
| `test:jejak:server` | Lulus: 4 berkas, 47 uji dalam 165 detik (24 lama dan 23 baru di `akun.uji-server.ts`) |
| `build:jejak` | Lulus. Lihat bagian "Anggaran ukuran dan kinerja" |
| Build `CLOUDFLARE_ENV=uji` dan `wrangler deploy --dry-run` | Binding `RUANG`, `DB` (`jejak-setara-uji`), `BATAS_PUBLIK`, `BATAS_WS`, `BATAS_MASUK` (10 per 60 detik), `ASSETS`, `LINGKUNGAN` = `uji`, dan `ITERASI_SANDI` = `15000`, tanpa kunci tiruan lokal. Unggahan 263,60 KiB, 63,36 KiB gzip (JS-08: 220,54 dan 51,29 KiB). Tanpa deploy sungguhan |
| `test:e2e:jejak` (`JEJAK_CHROMIUM`) | Lulus: 41 uji dalam 7,9 menit (28 lama, dengan baris `/admin/` di `kerangka.uji.ts` diganti pemeriksaan halaman masuk, dan 13 baru di `konsol.uji.ts`) |
| `sim:beban` | Tidak wajib, karena JS-04 tidak menyentuh protokol, inti ruang, atau kiriman ke D1 (AGENTS 4.4). Tidak dijalankan |
| `build:pages` | Lulus; ke-178 berkas identik byte dengan garis dasar |
| `tsc --noEmit` | 0 galat |
| ESLint pada berkas Jejak Setara | 0 masalah |
| Alur kerja | `jejak-uji.yml` dan `jejak-admin-awal.yml` terbaca sebagai YAML sah, dan setiap skrip `run` lulus `bash -n`. Langkah "Siapkan kunci Worker" dicoba dengan `wrangler` tiruan dalam empat keadaan: tanpa kunci (dua kunci baru, berkas izin 600), satu kunci sudah ada (hanya `KUNCI_IP`), lengkap (tanpa berkas), dan daftar rahasia gagal dibaca (langkah gagal, tidak ada kunci yang dibuat). Pemeriksaan masukan "Jejak: admin awal" dicoba dengan sembilan contoh |

## Kriteria penerimaan

| AC | Hasil | Bukti |
|---|---|---|
| AC-1 Hash | Lulus | `sandi.test.ts`: hash base64 32 byte dan garam 16 byte, sama dengan pembanding `pbkdf2Sync` lalu `createHmac` dengan `KUNCI_SANDI`; sandi lain, kunci lain, dan iterasi lain tidak cocok; é tersusun dan terurai sama (NFC); hash tiruan satu PBKDF2 dengan garam nol dan target iterasi; `ITERASI_SANDI` di luar 1.000–100.000 ditolak. `api-akun.test.ts`: jumlah hash per permintaan sesuai tabel P-3 (dihitung lewat `crypto.subtle.deriveBits`), 503 untuk lima nilai iterasi atau kunci yang tidak sah, dan hash ulang hanya bila iterasi akun di bawah target. Uji server: akun 5.000 iterasi menjadi 15.000 sesudah masuk dan tetap bisa masuk lagi |
| AC-2 Sandi sementara | Lulus | `sandi.test.ts`: 10.000 sandi dari crypto sungguhan berpola `XXXX-XXXX-XXXX-XXXX` dan memakai ke-31 karakter `ABJAD_KODE`; setiap karakter berasal dari tepat 8 nilai byte; byte 248–255 dibuang; chi² sumber byte berbenih di bawah ambang. `api-akun.test.ts` dan uji server: sandi sementara, sandi baru, token, dan alamat IP tidak ada di isi D1 mana pun, dan tidak ada panggilan `console` |
| AC-3 Sesi dan cookie | Lulus | `sesi.test.ts`: cookie persis P-6 tanpa `Max-Age` dan `Expires` (D-1a), cookie hapus, pembacaan dari tajuk berisi beberapa cookie, serta batas 8 jam, 7 hari, dan 5 menit dengan jam tiruan. Uji server: baris `sesi` berisi SHA-256 token, bukan token; sesi berakhir sesudah `terakhir_dipakai` dan `kedaluwarsa` dimundurkan lewat `d1()` dan barisnya terhapus; `terakhir_dipakai` tidak berubah pada 4 menit dan berubah pada 6 menit; keluar, ganti sandi, nonaktif, atur ulang, dan admin awal menghapus sesi yang benar |
| AC-4 CSRF | Lulus | Uji server: tanpa `X-Jejak`, dengan `Origin` lain, dan tanpa `Origin` dijawab 403 `ASAL_DITOLAK`; `POST /api/keluar` tanpa tajuk juga 403. Admin awal diterima tanpa `X-Jejak` |
| AC-5 Masuk dan pembatas | Lulus | Uji server: isi rusak 400, isi di luar aturan 401 tanpa hitungan; lima kegagalan dari dua alamat mengunci percobaan keenam dari alamat mana pun, sedangkan email lain dari alamat yang sama tetap bisa masuk; kegagalan ke-20 dari satu alamat mengunci percobaan ke-21, juga untuk sandi yang benar; pemulihan sesudah `terkunci_sampai` dimundurkan; masuk berhasil menghapus hitungan email; kunci berbentuk `e:` atau `i:` dengan 32 heksadesimal, tanpa alamat IP di D1; email tidak terdaftar, akun nonaktif, dan sandi salah dijawab sama. `batas.test.ts`: SQL hitungan di SQLite (jendela, kunci, dan pemulihan). `api-akun.test.ts`: `BATAS_MASUK` menjawab 429 `TERLALU_SERING` tanpa menyentuh D1, dan binding yang gagal tidak menghentikan permintaan |
| AC-6 Akun saat ini dan ganti sandi | Lulus | Uji server: `GET /api/saya` selalu 200; selama wajib ganti sandi, `GET /api/akun` dan `GET /api/dasbor` 403 `WAJIB_GANTI_SANDI`; mode wajib dengan `SANDI_PENDEK`, `SANDI_PANJANG`, `SANDI_SAMA_EMAIL`, dan `SANDI_SAMA` (sandi sementara); mode sukarela dengan `PERMINTAAN_SALAH`, `SANDI_LAMA_SALAH` (menambah hitungan), `SANDI_SAMA`, dan `TERKUNCI`; sesi perangkat lain berakhir dan satu sesi baru dibuat; log audit `sandi.ganti` dengan `wajib` benar dan salah |
| AC-7 Izin | Lulus | `izin.test.ts`: tabel tiga aksi untuk admin dan guru, akun nonaktif, wajib ganti sandi, dan tanda Peninjau. Uji server: guru 403 `TIDAK_BERWENANG` di ketiga rute akun dan 200 di dasbor; tanpa sesi 401 di lima rute; admin yang perannya diturunkan saat masuk mendapat 403 pada permintaan berikutnya |
| AC-8 Kelola akun | Lulus | Uji server: akun baru dengan email dinormalkan dan sandi sementara; `EMAIL_DIPAKAI`, `EMAIL_SALAH`, `NAMA_SALAH`, dan peran tidak dikenal; daftar dengan kolom P-22 tanpa hash dan urutan P-22; setiap kolom ubah; nonaktif menghapus sesi sasaran; atur ulang memberi sandi sementara baru, sandi lama tidak berlaku, dan catatan pembatas email terhapus; perlindungan diri untuk ketiga perubahan; dua admin yang saling menurunkan peran bersamaan menyisakan tepat satu admin; satu baris log audit per perubahan dengan rincian P-26 dan tanpa baris untuk ubah yang tidak mengubah apa pun. `api-akun.test.ts`: admin terakhir saat perubahan lain datang tepat sebelum batch (409, tanpa audit, sesi tetap) |
| AC-9 Admin awal | Lulus | `api-akun.test.ts`: tanpa `KUNCI_ADMIN` 404 `BELUM_TERSEDIA` untuk metode apa pun tanpa menyentuh D1; kunci salah atau tidak ada 403. Uji server: `dibuat` (admin, Peninjau mati, wajib ganti sandi, log audit `admin_awal` tanpa pelaku), `dipulihkan` untuk guru nonaktif (admin aktif, nama dan Peninjau tetap, sesi dan catatan pembatas email terhapus, sandi sementara lama tidak berlaku), dan galat 400 untuk sandi, email, dan nama |
| AC-10 Alur kerja dan kunci Worker | Lulus | `kerangka.test.ts` (7 uji baru): nama, tombol dengan masukan `nama_tampilan`, `concurrency`, urutan langkah P-29, langkah penutup `if: always() && steps.kunci.outcome != 'skipped'`, `wrangler@4.92.0`, isi JSON dari variabel lingkungan ke berkas 600, tanpa cetakan isi rahasia, teks `alurAdminAwal`, langkah "Siapkan kunci Worker" di antara "Semai bank awal" dan "Deploy Worker uji" dengan syarat yang sama, dan `--secrets-file`. Percobaan dengan `wrangler` tiruan di bagian "Perintah resmi". Sesudah push (penutupan): kedua berkas di `main`, yang diganti manual pemilik proyek karena Build berjalan dalam mode folder lokal, sama persis dengan isi yang diserahkan dan sesuai P-29 dan P-32 |
| AC-11 Konfigurasi | Lulus | `kerangka.test.ts`: isi `wrangler.jsonc` sesuai P-33. `api-akun.test.ts`: 503 `KONSOL_BELUM_SIAP` di kelima rute yang memakai kunci untuk enam keadaan kunci atau iterasi yang tidak sah, sedangkan `GET /api/saya`, `GET /api/akun`, `GET /api/dasbor`, `PATCH` tanpa atur ulang, dan keluar tetap berjalan |
| AC-12 Pembersihan harian | Lulus | `api-akun.test.ts` dengan jam tiruan dan `worker.scheduled`: sesi kedaluwarsa dan sesi lebih dari 8 jam tidak dipakai terhapus; sesi tepat 8 jam dan sesi sah tetap; catatan pembatas lebih dari 24 jam terhapus, kecuali yang masih terkunci |
| AC-13 Dasbor | Lulus | Uji server: `rujukanBelum` 23 di D1 lokal yang disemai. E2E: kartu Peringatan untuk admin dan guru (D-4a), kedua kartu keadaan kosong, "Memuat…", serta "Data dasbor gagal dimuat." dengan "Coba lagi" |
| AC-14 Konsol: masuk dan rute | Lulus | `rute.test.ts`: pengalihan P-37 untuk setiap keadaan dan peran. E2E: halaman masuk dengan penanda server dan kredit; kolom kosong tanpa permintaan; "Memeriksa…" nonaktif; sandi salah, terkunci, dan galat jaringan; "Memuat konsol…" dan "Server belum tersambung…" dengan "Muat ulang"; menu per peran; "Halaman ini hanya untuk admin."; sesi berakhir saat dipakai (401) dengan pemberitahuan; peran turun (403) membaca ulang akun lalu menampilkan pesannya; keluar tanpa pemberitahuan; tombol Tampilkan |
| AC-15 Konsol: sandi | Lulus | E2E: mode wajib dengan kepala tanpa menu; "Kedua sandi baru tidak sama." dan "Sandi baru minimal 12 karakter." tanpa permintaan ke server, dengan fokus ke kolomnya; berhasil ke dasbor dengan "Sandi baru tersimpan.". Uji guru: mode wajib di HP |
| AC-16 Konsol: akun | Lulus | E2E: tabel dengan "(Anda)", label peran, Peninjau, status, "Belum ganti sandi", dan waktu "14 Nov 2026, 07.39"; dialog akun baru dengan galat di bawah kolom Email; dialog sandi sementara sekali tampil, `Esc` tidak menutupnya, Tab berputar di dalamnya, "Salin sandi" mengumumkan "Sandi disalin." dan isi papan klip sama; dialog ubah untuk akun sendiri dengan pilihan dan tombol dimatikan beserta catatannya; konfirmasi nonaktif dan atur ulang dengan tombol `coral` |
| AC-17 Tampilan dan teks | Lulus | `kerangka.test.ts`: `TEKS_KONSOL` sama persis dengan bagian "Teks yang tampil (final)" (diurai dari tabel spesifikasi lalu dibandingkan), dan `TEKS` tanpa `konsolJudul` dan `konsolIsi`. E2E: huruf sistem di tabel, Pixelify Sans di judul, Press Start 2P di merek dan sandi sementara 16 px; tombol Menu di bawah 1024 px dan navigasi samping di 1024 px (D-2a); tangkapan layar empat ukuran tanpa luapan ke samping. Warna hanya token `--js-` |
| AC-18 Aksesibilitas | Lulus | E2E: semua tombol, tautan, kolom, dan kotak centang yang tampil setinggi sedikitnya 48 px di keempat ukuran; garis fokus `ink` 2 px dan `sun` 6 px (4 px di luar garis `ink`), kontras `ink` terhadap `cream` sekitar 13 : 1 dan `sun` terhadap `ink` sekitar 10 : 1; galat terhubung lewat `aria-describedby` dan `role="alert"`; pemberitahuan berhasil di wilayah `aria-live="polite"`; dialog `role="dialog"`, `aria-modal`, dan judulnya, dengan fokus terkurung dan kembali ke tombol pembukanya; masuk, ganti sandi, dan dialog akun baru dengan papan ketik saja |
| AC-19 Ukuran | Lulus | Kode konsol 82,15 KB gzip, jauh di bawah 350 KB. Kode layar pemain naik 0,18 KB gzip (batas 0,5 KB). Lihat bagian "Anggaran ukuran dan kinerja" dan temuan 1 dan 2 |
| AC-20 CPU di lingkungan uji | **Gagal pada pengukuran pertama; diperbaiki, menunggu ukur ulang** | Grafik CPU time Worker `jejak-setara-uji` (24 jam sampai 14 Nov 2026 pukul 12.00 WITA): di selang 15 menit sekitar pukul 11.45 WITA, saat pemilik proyek mencoba akun, P999 sekitar 14,8 ms, P90 sekitar 12,7 ms, dan P50 sekitar 2,3 ms. Permintaan dua hash melewati batas 7 ms dan CPU 10 ms paket gratis. Grafik Errors by version: 0 galat. `ITERASI_SANDI` diturunkan ke 4.000 (bagian "Penutupan"). Angka Plan di `workerd` lokal: masuk 3,3–3,5 ms dan ganti sandi sukarela 6,2–6,5 ms CPU Worker |
| AC-21 Kode dan lingkungan | Lulus | Perintah di atas; `PROTOKOL_VERSI` tetap 2, dan uji JS-03, JS-05, JS-06, JS-07, dan JS-08 tetap lulus; galeri 178 berkas identik. E2E tanpa galat konsol, pelanggaran CSP, permintaan ke alamat lain, atau respons 4xx dan 5xx selain jawaban galat yang sengaja diuji (401, 403, 409, dan 429 dari rute akun) |
| AC-22 Dokumen | Lulus | Architecture, Design System, dan PRD diubah di Gerbang 2. Di Build: Architecture 3 (`Formulir.tsx` dan `teks-konsol.ts`) dan 17 (tempat teks konsol dan ikon konsol), serta `PLAN.md` |

## Simulasi beban

Tidak wajib dan tidak dijalankan. JS-04 tidak mengubah protokol, inti ruang, atau kiriman ke D1.

## Anggaran ukuran dan kinerja

Diukur dari berkas yang dimuat setiap halaman di `dist-jejak/client` (gzip tingkat 9 dengan `zlib` Node). Garis dasar dibangun dari commit `5f9030a` dengan dependensi yang sama.

| Bagian | Garis dasar | JS-04 | Batas |
|---|---|---|---|
| Kode layar pemain (`/`) | 118,86 KB gzip (455,22 KB mentah) | 119,04 KB gzip (455,21 KB mentah), naik 0,18 KB | Naik paling banyak 0,5 KB gzip (AC-19) |
| Gaya bersama (`jejak.css`) | 4,02 KB gzip | 5,44 KB gzip, naik 1,42 KB | Tidak dibatasi AC-19; gaya konsol ditempatkan di `jejak.css` (P-49) |
| Kode konsol (`/admin/`) | 60,52 KB gzip | 82,15 KB gzip | 350 KB gzip (Architecture 11.3) |
| Worker | 226,1 KB mentah, 52,2 KB gzip | 269,9 KB mentah, 64,5 KB gzip | 3 MB gzip (paket gratis) |

CPU hash sandi di lingkungan uji diperiksa lewat AC-20.

## Pemeriksaan manual (AGENTS 9)

- [x] Konsol bisa dipakai sampai akhir hanya dengan papan ketik di laptop (E2E "papan ketik saja").
- [x] Tampilan rapi di 1024 × 768 dan 1920 × 1080 (tangkapan layar di [tests/JS-04/](JS-04/)). Tabel akun muat tanpa digulir ke samping di 1024 × 768 dengan 10 akun.
- [x] Dasbor terbaca di HP 731 × 411. Tabel akun di HP digulir ke samping di dalam kotaknya, sesuai Design System 3.7 (penyuntingan disarankan di laptop).
- [x] Lingkungan uji (dilaporkan pemilik proyek, 14 Nov 2026): "Jejak: uji" hijau, "Jejak: admin awal" berhasil, masuk dan ganti sandi sementara berhasil, dan akun guru percobaan dibuat, dipakai masuk, diganti sandinya, lalu dinonaktifkan. AC-20 belum lulus (bagian "Penutupan").

## Temuan

1. **Teks konsol di `teks-konsol.ts`.** P-51 menempatkan `TEKS_KONSOL` di `teks.ts`. Layar pemain juga mengimpor `teks.ts`, dan modul yang diimpor kedua halaman masuk ke potongan kode bersama yang dimuat layar pemain. Dengan `TEKS_KONSOL` di `teks.ts`, kode layar pemain naik sekitar 2,1 KB gzip, melewati AC-19. Ekspor `TEKS_KONSOL` dipindah ke berkas sendiri, `app/jejak-setara/teks-konsol.ts`, dengan isi yang sama persis dengan spesifikasi (diuji). `teks.ts` hanya kehilangan `konsolJudul` dan `konsolIsi`. Architecture 3 dan 17 mencatat tempat ini.
2. **Ikon konsol tanpa `manifest.ts`.** Bagian "Aset" spesifikasi menyebut keempat ikon dari `manifest.ts`. Mengimpor `manifest.ts` dari konsol memindahkan seluruh manifest ke potongan kode bersama, dan kode layar pemain naik 0,55 KB gzip. Konsol mengimpor keempat berkas PNG yang sama langsung (`ikon_jejak`, `ikon_peringatan`, `ikon_centang`, dan `ikon_arsip`), yang tetap berstatus Disetujui dan tercatat di `manifest.ts` dan `CREDITS.md`. Kenaikan kode layar pemain menjadi 0,18 KB gzip.
3. **Berkas di luar daftar spesifikasi.** `app/jejak-setara/admin/Formulir.tsx` (kolom berlabel, kolom sandi dengan tombol Tampilkan, pesan, dan ikon, yang dipakai keempat halaman), `app/jejak-setara/__tests__/akun/d1Tiruan.ts` (D1 tiruan untuk `api-akun.test.ts`), dan `web/jejak-setara/admin/main.tsx` (hanya komentar yang masih menyebut "halaman kosong"). Aturan `.js-atas` di `jejak.css` ikut dihapus bersama `.js-kerangka`, karena hanya dipakai `HalamanKerangka.tsx`.
4. **Admin terakhir saat perubahan bersamaan.** Selain pemeriksaan sebelum menulis, syarat "masih ada admin aktif" ditulis di pernyataan `UPDATE` yang sama. Baris audit dan penghapusan sesi di batch yang sama hanya berlaku bila perubahan itu berlaku. Dengan cara ini, dua admin yang saling menurunkan peran pada saat yang sama tidak bisa menghabiskan admin aktif (diuji di D1 tiruan dan server lokal).
5. **Hitungan gagal dalam satu pernyataan.** Hitungan pembatas ditambah lewat satu pernyataan SQL (`INSERT … ON CONFLICT DO UPDATE`), sehingga percobaan yang datang bersamaan tetap terhitung semua.
6. **Tabel rute dan P-34.** Tabel rute di spesifikasi menulis 503 di baris `GET /api/akun` dan `GET /api/dasbor`, sedangkan P-34 menyatakan rute lain tetap berjalan saat kunci belum siap. Dibangun sesuai P-34: kedua rute itu tidak menjawab 503 karena kunci (diuji).
7. **Sesi berakhir di uji ujung ke ujung.** Rencana uji menulis "sesudah memuat ulang". `GET /api/saya` tidak pernah menjawab 401 (P-16), jadi memuat ulang halaman hanya membuka halaman masuk tanpa pemberitahuan. Uji memakai permintaan berikutnya (pindah ke Dasbor), sesuai P-48 dan bagian "Beberapa pengguna sekaligus".
8. **Gaya bersama naik 1,42 KB gzip.** Gaya konsol ada di `jejak.css` (P-49), yang juga dimuat layar pemain. Kode layar pemain tetap dalam batas AC-19.

## Penutupan (14 November 2026)

Dikerjakan dalam mode ZIP (AGENTS 11.1 sampai 11.4) dari ZIP `main` 14 November 2026, yang sudah memuat commit "perbaikan JS-04".

**Uji ulang sebelum perubahan.** Pemilik proyek (14 Nov 2026, di luar sesi): `content:check:jejak` 254/254, `test:jejak` 879/879, `test:jejak:server` 47/47, dan `build:jejak` berhasil. Sesi A di ZIP yang sama: `content:check:jejak` 254 dan `test:jejak` 879; `build:pages` 178 berkas.

**Alur kerja.** `jejak-admin-awal.yml` dan `jejak-uji.yml` diganti manual pemilik proyek, karena Build berjalan dalam mode folder lokal dan agen tidak bisa menulis ke `.github/workflows/`. Isi keduanya sama persis dengan salinan yang diserahkan, dan sesuai spesifikasi: masukan `nama_tampilan` bawaan `Admin`, pemeriksaan rahasia dan masukan tanpa mencetak isinya, kunci sekali pakai yang disamarkan dan disimpan dengan `wrangler@4.92.0`, isi permintaan dari variabel lingkungan ke berkas berizin 600, ulangan paling banyak 10 kali dengan jeda 3 detik, penutupan rute dengan `if: always() && steps.kunci.outcome != 'skipped'`, dan ringkasan tanpa email dan sandi (P-29); serta langkah "Siapkan kunci Worker" di antara "Semai bank awal" dan "Deploy Worker uji", dengan syarat yang sama dan `--secrets-file` (P-32). Berkas kosong `.uji-tulis` sudah dihapus.

**Langkah pemilik proyek di lingkungan uji** (dilaporkan 14 Nov 2026):

| Langkah | Hasil |
|---|---|
| 1. "Jejak: uji" | Hijau. Teks langkah "Siapkan kunci Worker" tidak disalin, tetapi kedua kunci terbukti ada, karena admin awal dan masuk tidak dijawab 503 `KONSOL_BELUM_SIAP` |
| 2. "Jejak: admin awal" | Berhasil |
| 3–4. Masuk dan ganti sandi sementara | Berhasil |
| 5. Akun guru percobaan (buat, masuk, ganti sandi, nonaktifkan) | Berhasil |
| 6. Tangkapan layar CPU time | Dikirim; angkanya di bawah |
| Galat | Grafik Errors by version: 0 galat di keenam versi Worker selama 24 jam, jadi tidak ada permintaan yang dihentikan. Bagan "Invocation Statuses" tidak ditemukan di dasbor pemilik proyek |

**Pengukuran CPU (AC-20).** Grafik CPU time Worker `jejak-setara-uji`, 24 jam sampai 14 Nov 2026 pukul 12.00 WITA. Angka dibaca dari piksel garis, dengan ketelitian sekitar 0,2 ms. Jumlah pemanggilan dari grafik Invocations.

| Selang | Pemanggilan | P50 | P90 | P99 dan P999 |
|---|---|---|---|---|
| Sekitar pukul 11.45 WITA (pemilik proyek mencoba akun; tanda "3 deployments") | 22 | 2,45 ms (tooltip dasbor; dari piksel sekitar 2,3 ms) | 12,76 ms (tooltip; piksel sekitar 12,7 ms) | 14,87 ms (tooltip; piksel sekitar 14,8 ms) |
| Sisa 24 jam | 5 | — | — | Paling tinggi sekitar 1,7 ms |

- Angka di samping legenda grafik (P50 1,26, P90 3,57, P99 3,99, dan P999 3,99) bukan nilai puncak: dengan 27 pemanggilan sehari, P999 seharusnya hampir sama dengan permintaan terberat. Yang dibaca adalah puncak garisnya.
- Di selang itu, P90 dari 22 pemanggilan jatuh di kelompok tiga permintaan teratas, yang hampir pasti berupa permintaan dua hash (ganti sandi wajib akun admin dan akun guru, serta ganti sandi lewat "Sandi saya"). Jadi satu permintaan dua hash memakai sekitar 12,7–14,8 ms di Cloudflare, sekitar dua kali angka `workerd` lokal di Plan JS-04 (6,2–6,5 ms), dan permintaan tanpa hash sekitar 2 ms.
- Dokumentasi Cloudflare (halaman "Metrics and analytics" dan "Limits", dibaca 14 Nov 2026): persentil tinggi bisa tampak melewati batas CPU tanpa galat, karena runtime memberi kelonggaran CPU dari permintaan yang hemat, tetapi Worker yang terus melewati batas dihentikan dengan Error 1102. Jadi 0 galat tidak berarti 15.000 iterasi aman.

**Perbaikan (usulan 10a dan AC-20).** `ITERASI_SANDI` diturunkan dari 15.000 ke 4.000 di lingkungan `lokal` dan `uji` (`wrangler.jsonc`).

- Di mesin agen hari ini, PBKDF2 15.000 iterasi memakai 2,39 ms dan 4.000 iterasi 0,74 ms CPU (Node, median 25 ulangan). Bila satu hash 15.000 iterasi di Cloudflare sekitar 5–6,5 ms dan sisa pekerjaan permintaan sekitar 2–3 ms, permintaan dua hash dengan 4.000 iterasi sekitar 5–6 ms, sedangkan dengan 5.000 iterasi sekitar 6–7 ms, terlalu dekat dengan batas AC-20.
- Kekuatan hash tetap bertumpu pada kunci tambahan `KUNCI_SANDI`, yang disimpan terpisah dari basis data, dan pada pembatas percobaan masuk. Selama paket gratis hanya ada akun percobaan, dan target naik ke 100.000 sesudah paket berbayar aktif (catatan Plan JS-15 di `PLAN.md`).
- Akun admin dan akun guru percobaan masih ber-hash 15.000 iterasi. Akun admin tetap bisa masuk (satu hash, perkiraan sekitar 8 ms), dan hash-nya baru memakai 4.000 iterasi saat sandinya diganti atau dipulihkan. Karena itu ukur ulang dimulai dengan "Jejak: admin awal". Akun guru percobaan sudah nonaktif; bila diaktifkan lagi, sandinya diatur ulang lebih dulu.

**Berkas yang diubah di penutupan:** `server/jejak-setara/wrangler.jsonc`; uji `app/jejak-setara/__tests__/kerangka.test.ts` (isi `wrangler.jsonc`), `server/jejak-setara/uji/akun.uji-server.ts` (iterasi akun baru 4.000, dan hash ulang dari 2.000 ke 4.000), dan `app/jejak-setara/__tests__/akun/sandi.test.ts` (komentar); laporan ini, `PLAN.md`, Architecture (bagian awal, 4.2, 4.5, 10.3, dan 13.4), PRD 21, catatan penutupan spesifikasi JS-04, dan AGENTS 0.5 (11.5 butir 8); serta `.gitignore` (`/Claude outputs/`).

**Uji sesudah perbaikan** (lingkungan agen, 14 Nov 2026): `content:check:jejak` 10 berkas, 254 uji; `test:jejak` 45 berkas, 879 uji; `test:jejak:server` 4 berkas, 47 uji (206 detik); `build:jejak` berhasil; build `CLOUDFLARE_ENV=uji` dan `wrangler deploy --dry-run`: `ITERASI_SANDI` = `4000`, `LINGKUNGAN` = `uji`, `BATAS_MASUK` 10 per 60 detik, unggahan 263,60 KiB (63,36 KiB gzip, sama dengan Build JS-04); `tsc --noEmit` 0 galat; ESLint pada berkas yang diubah 0 masalah; `build:pages` 178 berkas identik byte dengan build ZIP `main`. `test:e2e:jejak` tidak dijalankan ulang, karena kode halaman dan Worker tidak berubah; yang berubah hanya nilai variabel.

**Temuan penutupan.**

1. Folder `Claude outputs/` ter-commit di akar repositori. Isinya enam gambar maket Gerbang 1, yang menurut rencana tidak disimpan di repositori, dan salinan kedua alur kerja. Folder itu tidak mengubah galeri (build dengan dan tanpa folder itu identik byte). Penghapusannya menjadi langkah tersendiri di serah terima, dan `.gitignore` kini mengabaikannya.
2. `server/jejak-setara/seed/kontrak-d1.sql` (berkas Sesi B) masih ada dan tetap tidak dipakai kode mana pun. Penghapusannya disebut lagi di serah terima.

**Ukur ulang pertama (14 Nov 2026, sesudah push pukul 12.43 WITA).**

| Selang | Versi Worker | P50 | P90 sampai P999 | Galat |
|---|---|---|---|---|
| Pukul 12.15 (sebelum push, 15.000 iterasi) | `0a335c5e` | Sekitar 1,5 ms | Sekitar 10,4 ms | 0 |
| Pukul 12.45 (push pukul 12.43 dan "Jejak: admin awal" pukul 12.46; 4.000 iterasi) | `838a9989`, `a88860e8`, dan `ab5cd37f` | Sekitar 3,4 ms | Sekitar 10,35 ms (tooltip sebelum data lengkap: 10,35 ms) | 0 |

- Pembacaan: puncak 10,4 ms di kedua selang cocok dengan satu kali masuk yang menghitung hash 15.000 iterasi di isolat yang baru dimulai (sekitar 2–3 ms awal isolat, 1–2 ms pekerjaan rute, dan sekitar 6 ms hash). Permintaan dua hash di selang 11.45 berlangsung beruntun, jadi isolatnya sudah hangat. Di selang 12.45, akun admin masih ber-hash 15.000 iterasi sampai "Jejak: admin awal" memulihkannya, sehingga satu kali masuk sebelum langkah itu menghasilkan puncak yang sama. Dengan 4.000 iterasi, perkiraan paling berat sekitar 6–7,7 ms, dan P50 3,4 ms cocok dengan perkiraan itu.
- Grafik dasbor tidak memisahkan jenis permintaan, jadi pembacaan ini belum cukup untuk AC-20. Pembacaan "hash 15.000 iterasi" di atas kemudian terbantah oleh percobaan bersih di bawah. Sejak ukur ulang pertama, akun admin sudah ber-hash 4.000 iterasi dan akun guru percobaan nonaktif, sehingga satu percobaan bersih (masuk, ganti sandi lewat "Sandi saya", lalu keluar; langkahnya di `PLAN.md`, bagian "Penutupan JS-04") memberi angka yang hanya berasal dari 4.000 iterasi.

**Percobaan bersih (14 Nov 2026 pukul 13.30 WITA).** Pemilik proyek masuk dengan sandi admin (hash 4.000 iterasi), mengganti sandi lewat "Sandi saya", keluar, lalu masuk lagi; semuanya berhasil.

| Tangkapan layar | P50 | P90 | P99 dan P999 | Galat |
|---|---|---|---|---|
| Tepat sesudah percobaan (data belum lengkap) | 1,81 ms | 7,2 ms | 7,2 ms | 0 |
| Puluhan menit kemudian (di antaranya ZIP Plan JS-10 di-push dan Worker uji dideploy ulang) | 1,81 ms | 10,08 ms | 14,46 ms | 0 |

**Percobaan lokal CPU awal (14 Nov 2026).** Node 22.23.4 dengan D1 tiruan di proses yang sama (angka mutlak lebih besar daripada Worker saja), satu proses baru untuk setiap jumlah iterasi:

| Permintaan | 4.000 iterasi | 15.000 iterasi |
|---|---|---|
| `/api/sehat` pertama sesudah proses dimulai | 29,45 ms | 31,59 ms |
| `/api/sehat` kedua | 0,31 ms | 0,31 ms |
| Admin awal pertama | 7,41 ms | 9,49 ms |
| Masuk pertama | 3,90 ms | 5,63 ms |
| Ganti sandi wajib pertama | 3,86 ms | 7,45 ms |
| Ganti sandi sukarela pertama | 2,98 ms | 7,16 ms |
| Hangat, median 12 ulangan: masuk | 1,75 ms | 3,60 ms |
| Hangat, median 12 ulangan: ganti sandi sukarela | 2,75 ms | 6,36 ms |
| Hangat, median 12 ulangan: `/api/saya` | 0,31 ms | 0,27 ms |

Evaluasi modul Worker hasil build (lingkup global) di Node: 19,2 ms CPU.

- Pembacaan: puncak 10–15 ms di lingkungan uji tidak berubah walau iterasi turun hampir empat kali (14,87 ms dengan 15.000 dan 14,46 ms dengan 4.000), jadi penyebabnya bukan hash. Permintaan pertama di isolat yang baru dimulai membayar biaya awal (evaluasi modul dan kode yang baru pertama kali dijalankan), dan Worker yang jarang dipakai sering mendapat isolat baru, terutama sesudah deploy dan sesudah sepi beberapa saat. Penurunan iterasi tetap berguna untuk permintaan hangat.
- Usulan penutupan AC-20 ada di `PLAN.md`, bagian "Penutupan JS-04".

## Keputusan: Kembali ke Build untuk AC-20 (perbaikan sudah diterapkan)

Kriteria lain lulus, dan langkah pemilik proyek di lingkungan uji berhasil tanpa galat. AC-20 gagal pada pengukuran pertama; perbaikannya sudah diterapkan dan diuji di lingkungan agen. Percobaan bersih menunjukkan bahwa puncak berasal dari isolat yang baru dimulai, bukan dari hash, tanpa galat. Keputusan akhir menunggu jawaban pemilik proyek atas usulan penutupan AC-20 di `PLAN.md`.
