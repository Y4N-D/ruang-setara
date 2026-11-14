# JS-04 — Hasil uji

| | |
|---|---|
| Fitur | JS-04 Akun dan autentikasi |
| Spesifikasi | [specs/JS-04-akun.md](../specs/JS-04-akun.md), disetujui 14 November 2026 (`Spesifikasi disetujui: JS-04`) dengan saran D-1a sampai D-4a |
| Tanggal | 14 November 2026 |
| Lingkungan | Lingkungan agen: Node 22.23.4, pnpm 11.25.0, `wrangler` 4.92.0, `workerd` 1.20260515, dan Chromium untuk Playwright 1.56.1 (`JEJAK_CHROMIUM`). Salinan folder repositori pemilik proyek pada commit `5f9030a` (mode folder lokal, AGENTS 11.5) |
| Keputusan | **Lulus dengan catatan AC-20**: pemeriksaan CPU di lingkungan uji baru bisa dijalankan pemilik proyek sesudah push (bagian "Langkah pemilik proyek" di `PLAN.md`). Kriteria lain lulus. Tiga penyesuaian kecil terhadap rincian berkas di spesifikasi dijelaskan di bagian "Temuan": teks konsol di `teks-konsol.ts`, ikon konsol tanpa `manifest.ts`, dan berkas tambahan `admin/Formulir.tsx` |

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
| AC-10 Alur kerja dan kunci Worker | Lulus | `kerangka.test.ts` (7 uji baru): nama, tombol dengan masukan `nama_tampilan`, `concurrency`, urutan langkah P-29, langkah penutup `if: always() && steps.kunci.outcome != 'skipped'`, `wrangler@4.92.0`, isi JSON dari variabel lingkungan ke berkas 600, tanpa cetakan isi rahasia, teks `alurAdminAwal`, langkah "Siapkan kunci Worker" di antara "Semai bank awal" dan "Deploy Worker uji" dengan syarat yang sama, dan `--secrets-file`. Percobaan dengan `wrangler` tiruan di bagian "Perintah resmi" |
| AC-11 Konfigurasi | Lulus | `kerangka.test.ts`: isi `wrangler.jsonc` sesuai P-33. `api-akun.test.ts`: 503 `KONSOL_BELUM_SIAP` di kelima rute yang memakai kunci untuk enam keadaan kunci atau iterasi yang tidak sah, sedangkan `GET /api/saya`, `GET /api/akun`, `GET /api/dasbor`, `PATCH` tanpa atur ulang, dan keluar tetap berjalan |
| AC-12 Pembersihan harian | Lulus | `api-akun.test.ts` dengan jam tiruan dan `worker.scheduled`: sesi kedaluwarsa dan sesi lebih dari 8 jam tidak dipakai terhapus; sesi tepat 8 jam dan sesi sah tetap; catatan pembatas lebih dari 24 jam terhapus, kecuali yang masih terkunci |
| AC-13 Dasbor | Lulus | Uji server: `rujukanBelum` 23 di D1 lokal yang disemai. E2E: kartu Peringatan untuk admin dan guru (D-4a), kedua kartu keadaan kosong, "Memuat…", serta "Data dasbor gagal dimuat." dengan "Coba lagi" |
| AC-14 Konsol: masuk dan rute | Lulus | `rute.test.ts`: pengalihan P-37 untuk setiap keadaan dan peran. E2E: halaman masuk dengan penanda server dan kredit; kolom kosong tanpa permintaan; "Memeriksa…" nonaktif; sandi salah, terkunci, dan galat jaringan; "Memuat konsol…" dan "Server belum tersambung…" dengan "Muat ulang"; menu per peran; "Halaman ini hanya untuk admin."; sesi berakhir saat dipakai (401) dengan pemberitahuan; peran turun (403) membaca ulang akun lalu menampilkan pesannya; keluar tanpa pemberitahuan; tombol Tampilkan |
| AC-15 Konsol: sandi | Lulus | E2E: mode wajib dengan kepala tanpa menu; "Kedua sandi baru tidak sama." dan "Sandi baru minimal 12 karakter." tanpa permintaan ke server, dengan fokus ke kolomnya; berhasil ke dasbor dengan "Sandi baru tersimpan.". Uji guru: mode wajib di HP |
| AC-16 Konsol: akun | Lulus | E2E: tabel dengan "(Anda)", label peran, Peninjau, status, "Belum ganti sandi", dan waktu "14 Nov 2026, 07.39"; dialog akun baru dengan galat di bawah kolom Email; dialog sandi sementara sekali tampil, `Esc` tidak menutupnya, Tab berputar di dalamnya, "Salin sandi" mengumumkan "Sandi disalin." dan isi papan klip sama; dialog ubah untuk akun sendiri dengan pilihan dan tombol dimatikan beserta catatannya; konfirmasi nonaktif dan atur ulang dengan tombol `coral` |
| AC-17 Tampilan dan teks | Lulus | `kerangka.test.ts`: `TEKS_KONSOL` sama persis dengan bagian "Teks yang tampil (final)" (diurai dari tabel spesifikasi lalu dibandingkan), dan `TEKS` tanpa `konsolJudul` dan `konsolIsi`. E2E: huruf sistem di tabel, Pixelify Sans di judul, Press Start 2P di merek dan sandi sementara 16 px; tombol Menu di bawah 1024 px dan navigasi samping di 1024 px (D-2a); tangkapan layar empat ukuran tanpa luapan ke samping. Warna hanya token `--js-` |
| AC-18 Aksesibilitas | Lulus | E2E: semua tombol, tautan, kolom, dan kotak centang yang tampil setinggi sedikitnya 48 px di keempat ukuran; garis fokus `ink` 2 px dan `sun` 6 px (4 px di luar garis `ink`), kontras `ink` terhadap `cream` sekitar 13 : 1 dan `sun` terhadap `ink` sekitar 10 : 1; galat terhubung lewat `aria-describedby` dan `role="alert"`; pemberitahuan berhasil di wilayah `aria-live="polite"`; dialog `role="dialog"`, `aria-modal`, dan judulnya, dengan fokus terkurung dan kembali ke tombol pembukanya; masuk, ganti sandi, dan dialog akun baru dengan papan ketik saja |
| AC-19 Ukuran | Lulus | Kode konsol 82,15 KB gzip, jauh di bawah 350 KB. Kode layar pemain naik 0,18 KB gzip (batas 0,5 KB). Lihat bagian "Anggaran ukuran dan kinerja" dan temuan 1 dan 2 |
| AC-20 CPU di lingkungan uji | **Menunggu** | Dijalankan pemilik proyek sesudah push (langkah 6 di serah terima dan di `PLAN.md`). Angka Plan di `workerd` lokal: masuk 3,3–3,5 ms dan ganti sandi sukarela 6,2–6,5 ms CPU Worker |
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
- [ ] Lingkungan uji: "Jejak: uji" hijau dengan langkah "Siapkan kunci Worker", "Jejak: admin awal", masuk, dan AC-20. Dijalankan pemilik proyek sesudah push.

## Temuan

1. **Teks konsol di `teks-konsol.ts`.** P-51 menempatkan `TEKS_KONSOL` di `teks.ts`. Layar pemain juga mengimpor `teks.ts`, dan modul yang diimpor kedua halaman masuk ke potongan kode bersama yang dimuat layar pemain. Dengan `TEKS_KONSOL` di `teks.ts`, kode layar pemain naik sekitar 2,1 KB gzip, melewati AC-19. Ekspor `TEKS_KONSOL` dipindah ke berkas sendiri, `app/jejak-setara/teks-konsol.ts`, dengan isi yang sama persis dengan spesifikasi (diuji). `teks.ts` hanya kehilangan `konsolJudul` dan `konsolIsi`. Architecture 3 dan 17 mencatat tempat ini.
2. **Ikon konsol tanpa `manifest.ts`.** Bagian "Aset" spesifikasi menyebut keempat ikon dari `manifest.ts`. Mengimpor `manifest.ts` dari konsol memindahkan seluruh manifest ke potongan kode bersama, dan kode layar pemain naik 0,55 KB gzip. Konsol mengimpor keempat berkas PNG yang sama langsung (`ikon_jejak`, `ikon_peringatan`, `ikon_centang`, dan `ikon_arsip`), yang tetap berstatus Disetujui dan tercatat di `manifest.ts` dan `CREDITS.md`. Kenaikan kode layar pemain menjadi 0,18 KB gzip.
3. **Berkas di luar daftar spesifikasi.** `app/jejak-setara/admin/Formulir.tsx` (kolom berlabel, kolom sandi dengan tombol Tampilkan, pesan, dan ikon, yang dipakai keempat halaman), `app/jejak-setara/__tests__/akun/d1Tiruan.ts` (D1 tiruan untuk `api-akun.test.ts`), dan `web/jejak-setara/admin/main.tsx` (hanya komentar yang masih menyebut "halaman kosong"). Aturan `.js-atas` di `jejak.css` ikut dihapus bersama `.js-kerangka`, karena hanya dipakai `HalamanKerangka.tsx`.
4. **Admin terakhir saat perubahan bersamaan.** Selain pemeriksaan sebelum menulis, syarat "masih ada admin aktif" ditulis di pernyataan `UPDATE` yang sama. Baris audit dan penghapusan sesi di batch yang sama hanya berlaku bila perubahan itu berlaku. Dengan cara ini, dua admin yang saling menurunkan peran pada saat yang sama tidak bisa menghabiskan admin aktif (diuji di D1 tiruan dan server lokal).
5. **Hitungan gagal dalam satu pernyataan.** Hitungan pembatas ditambah lewat satu pernyataan SQL (`INSERT … ON CONFLICT DO UPDATE`), sehingga percobaan yang datang bersamaan tetap terhitung semua.
6. **Tabel rute dan P-34.** Tabel rute di spesifikasi menulis 503 di baris `GET /api/akun` dan `GET /api/dasbor`, sedangkan P-34 menyatakan rute lain tetap berjalan saat kunci belum siap. Dibangun sesuai P-34: kedua rute itu tidak menjawab 503 karena kunci (diuji).
7. **Sesi berakhir di uji ujung ke ujung.** Rencana uji menulis "sesudah memuat ulang". `GET /api/saya` tidak pernah menjawab 401 (P-16), jadi memuat ulang halaman hanya membuka halaman masuk tanpa pemberitahuan. Uji memakai permintaan berikutnya (pindah ke Dasbor), sesuai P-48 dan bagian "Beberapa pengguna sekaligus".
8. **Gaya bersama naik 1,42 KB gzip.** Gaya konsol ada di `jejak.css` (P-49), yang juga dimuat layar pemain. Kode layar pemain tetap dalam batas AC-19.

## Keputusan: Lulus dengan catatan AC-20

Semua kriteria yang bisa diuji di lingkungan agen lulus. AC-20 diperiksa pemilik proyek di lingkungan uji sesudah push. Bila persentil tertinggi CPU lebih dari 7 ms, `ITERASI_SANDI` diturunkan lewat commit kecil.
