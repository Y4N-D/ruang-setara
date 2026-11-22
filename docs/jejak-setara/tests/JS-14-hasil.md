# Laporan uji JS-14 — Pengaturan pemain, aksesibilitas, privasi, suara, dan nama pemain

| | |
|---|---|
| Spesifikasi | [specs/JS-14-pengaturan.md](../specs/JS-14-pengaturan.md) (disetujui 22 November 2026 dengan `Spesifikasi disetujui: JS-14`; D-1 sampai D-9 pilihan a) |
| Tanggal | 22 November 2026 |
| Sesi | Sesi A (mesin), mode ZIP dari `main` commit `9774512` ditambah ZIP Gerbang 1 dan 2 JS-14 |
| Lingkungan | Node 22.23.5, pnpm 11.25.0, Chromium 1243 (Playwright, lewat `JEJAK_CHROMIUM`), Miniflare dari dependensi terkunci |
| Status | Diterima pemilik proyek 22 November 2026 (`Diterima: JS-14`); semua kriteria otomatis lulus, dan penyimpangan kode konsol di AC-24 diterima dengan saran (a) |

## Ringkasan

Pengaturan pemain, suara layar pemain dan layar kelas, pemberitahuan privasi, layar Tentang, nama buatan siswa dengan penyaring di server, kelola nama dari konsol dan layar kelas, dan penghapusan otomatis sesudah 365 hari sudah dibangun. Semua uji unit, uji server, uji ujung ke ujung, dan uji beban lulus, dan galeri tetap identik byte. Kode layar pemain naik 5,53 KB gzip, di bawah batas 6 KB. Kode konsol naik 4,40 KB, melewati batas 3 KB yang ditulis di spesifikasi, walaupun masih jauh di bawah anggaran 350 KB; keputusannya ada pada pemilik proyek.

Uji ujung ke ujung lama menemukan dua kesalahan JS-14 yang sudah diperbaiki: `Esc` yang menutup dialog kejadian ikut membuka Menu, dan tombol Menu di rekap mendahului tautan "Langsung ke refleksi" dalam urutan Tab (bagian "Catatan penerapan").

## Kriteria penerimaan

| AC | Status | Bukti |
|---|---|---|
| AC-1 Pengaturan | Lulus | `pengaturan.test.ts` (bawaan, `jejak:pengaturan`, isian rusak, penyimpanan penuh); `pengaturan.uji.ts` (bertahan sesudah dimuat ulang di tab yang sama) |
| AC-2 Tombol Menu dan suara | Lulus | `pengaturan.uji.ts` (letak, tinggi 48 px, tanda `Esc` dan `M` hanya di laptop, tersembunyi saat panel terbuka, baris kaki identitas, rekap); uji kinerja dan uji dunia lama lulus dengan tombol baru |
| AC-3 Panel Pengaturan | Lulus | `pengaturan.uji.ts` (empat kelompok, fokus awal, `Esc` dan Tutup, tanpa gulir di 640 × 360) |
| AC-4 Privasi dan Tentang | Lulus | `pengaturan.uji.ts` (fokus awal di judul, enam butir, isi digulir dengan Tutup tetap terlihat, Tentang kembali ke Pengaturan) |
| AC-5 Pemberitahuan privasi | Lulus | `pengaturan.uji.ts` (layar Kode); `kerangka.test.ts` (teks layar Nomor absen dan identitas); `nama.uji.ts` (kalimat di layar identitas mode bebas) |
| AC-6 Suara layar pemain | Lulus | `suara.test.ts` (konteks tiruan, sembilan berkas, batas per bunyi, tanpa Web Audio); `pengaturan.uji.ts` (0 permintaan WAV selama mati, 9 berkas tanpa `sfx_akhir` sesudah dinyalakan, `M`) |
| AC-7 Suara layar kelas | Lulus | `suara.test.ts` (tertahan sebelum ketukan, tiga berkas, dua menit hanya saat turun melewati 120 detik); `nama.uji.ts` (bawaan nyala, `M`) |
| AC-8 Teks per huruf | Lulus | `suara.test.ts` (40 huruf per detik, bunyi teks setiap 2 huruf); `pengaturan.uji.ts` (teks berjalan, teks lengkap untuk pembaca layar, `Enter` menampilkan semuanya, fokus pindah ke pilihan pertama) |
| AC-9 Label nama | Lulus | `pengaturan.test.ts` (13 dan 17 px); uji kinerja dengan label Besar |
| AC-10 Kurangi gerak | Lulus | `pengaturan.test.ts`; `pengaturan.uji.ts` (`data-kurangi-gerak` mengikuti pengaturan dan bertahan) |
| AC-11 Mode nama di konsol dan API | Lulus | `nama.uji-server.ts` (nilai salah 400, `pengaturan_json`, `GET /api/publik/ruang/{KODE}`, `selamat_datang`); `nama.uji.ts` (kelompok Nama pemain di dialog Ruang baru, baris Nama pemain) |
| AC-12 Layar identitas mode bebas | Lulus | `nama.uji.ts` (penghitung, galat bentuk tanpa pesan terkirim, `NAMA_DITOLAK` dengan isi tetap dan fokus di isian, tampilan daftar sesudah lima penolakan, tinggi panel tidak melebihi mode daftar) |
| AC-13 `pilih_identitas` di server | Lulus | `inti-ruang-nama.test.ts`, `nama.uji-server.ts` |
| AC-14 Penyaring | Lulus | `penyaring.test.ts` (daftar sama dengan Lampiran A, semua bentuk samaran, 260 nama samaran dan 84 nama biasa lolos, ≤ 0,1 ms); kode klien diperiksa tanpa daftar kata |
| AC-15 Ganti nama | Lulus | `inti-ruang-nama.test.ts` (sidik, nama lama tidak tersimpan, cadangan "Pemain {urutan}"); `nama.uji-server.ts` (konsol dan layar kelas, nama lama ditolak) |
| AC-16 Ganti semua nama | Lulus | `inti-ruang-nama.test.ts`; `nama.uji-server.ts` (jumlah 1, `mode_nama`, 409 sesudahnya) |
| AC-17 Kelola dari konsol | Lulus | `nama.uji-server.ts`; `nama.uji.ts` (Ganti semua nama dengan konfirmasi, Ganti nama, baris Nama pemain berubah) |
| AC-18 Kelola dari layar kelas | Lulus | `nama.uji.ts` (menu nama, ganti nama tanpa konfirmasi, keluarkan dengan konfirmasi tanpa nama, pita tanpa nama, panel Pemain dengan `P`, langkah ketiga cara bergabung) |
| AC-19 Protokol | Lulus | `protokol.test.ts` (versi 3, pesan baru); semua uji yang memakai `PROTOKOL_VERSI` lulus |
| AC-20 CSV dan teks konsol | Lulus | `nama.uji-server.ts` ("Nama pemain" di kedua CSV, nama baru, nama lama hilang); `kerangka.test.ts` |
| AC-21 Penghapusan otomatis | Lulus | `pembersihan.test.ts`; `nama.uji-server.ts` (366 hari terhapus dengan log audit tanpa pengguna, 364 hari tetap) |
| AC-22 Papan ketik dan pembaca layar | Lulus | `pengaturan.uji.ts` (satu ronde dari layar identitas sampai rekap dengan papan ketik, `toMatchAriaSnapshot` panel Pengaturan, nama dialog kejadian) |
| AC-23 Kredit | Lulus | `pengaturan.uji.ts` (Tentang); `nama.uji.ts` (halaman masuk konsol) |
| AC-24 Ukuran dan kinerja | Lulus dengan penyimpangan yang diterima | Layar pemain lulus; kode konsol +4,40 KB melewati batas 3 KB dan diterima pemilik proyek dengan saran (a) (bagian "Penyimpangan"); kinerja HP lulus |
| AC-25 Beban | Lulus | `sim:beban` mode bebas (bagian "Beban") |
| AC-26 Tangkapan layar | Lulus | Bagian "Tangkapan layar" |
| AC-27 Tanpa regresi | Lulus | Semua perintah di bawah; `build:pages` 178 berkas identik byte |

## Perintah yang dijalankan

| Perintah | Hasil |
|---|---|
| `npx tsc --noEmit -p tsconfig.json` | 0 galat |
| ESLint untuk `app/jejak-setara`, `server/jejak-setara`, `e2e/jejak-setara`, dan `scripts/jejak-setara` | 0 galat, 0 peringatan |
| `pnpm test:jejak` | 78 berkas, 1.172 uji lulus |
| `pnpm test:jejak:server` | 11 berkas, 65 uji lulus (dijalankan dalam dua kelompok karena batas waktu satu perintah di mesin agen) |
| `pnpm test:e2e:jejak` | Semua berkas lulus, dijalankan per kelompok: gabung, kelas, nama, dan pengaturan (10 uji); dunia (4 uji ditambah uji kinerja); kejadian (4); skill (4); hasil dan statistik (3); konsol, bank, dan kerangka (28) |
| `pnpm content:check:jejak` | Lulus |
| `pnpm build:jejak` | Berhasil |
| `pnpm build:pages` | 178 berkas, identik byte dengan build `main` |
| `pnpm sim:beban -- --ruang 1 --bot 50 --detik 120 --mode-nama bebas` | Lulus (bagian "Beban") |

`pnpm lint` untuk seluruh repositori gagal di berkas yang tidak disentuh JS-14: berkas galeri `app/*.tsx`, `public/stories/draco/draco_decoder.js`, dan folder hasil build lokal `dist-pages` serta `dist-jejak`. ESLint untuk keempat folder Jejak Setara bersih.

## Ukuran dan kinerja

| | Sebelum (`main`) | Sesudah | Selisih | Batas spesifikasi |
|---|---|---|---|---|
| JS layar pemain (gzip) | 126,85 KB | 132,38 KB | +5,53 KB | ≤ +6 KB |
| CSS layar pemain (gzip) | 6,23 KB | 6,68 KB | +0,45 KB | ≤ +1 KB |
| Kode konsol, JS dan CSS (gzip) | 136,27 KB | 140,67 KB | +4,40 KB | ≤ +3 KB |

Daftar kata penyaring tidak ada di berkas JS mana pun yang dikirim ke peramban. Uji kinerja HP (40 pemain tiruan, CPU normal dan 6× lebih lambat) lulus dengan pengaturan Suara nyala dan label Besar dari `sessionStorage`; karena uji itu tidak mengetuk layar, konteks audio tidak dibuat, jadi biaya memutar bunyi tidak ikut terukur di sana.

## Beban

`sim:beban` lokal, 1 ruang × 50 bot, 30 detik di lobi dan 120 detik menjelajah, ruang nama buatan siswa:

| Ukuran | Hasil |
|---|---|
| Bot bergabung dengan nama buatan ("Bot 001" dan seterusnya) | 50 dari 50, 0 galat nama |
| Nama yang diganti layar kelas (5 di lobi, 5 saat menjelajah) | 10 |
| Bot yang menerima `nama_baru` untuk kesepuluh nama itu | 50 dari 50 |
| Sambungan putus tak terduga | 0 |
| Pesan ditolak server | 0 |
| Lalu lintas turun per pemain per 15 menit saat menjelajah | 1,83 MB |

## Penyimpangan dan keputusan yang diminta

Kode konsol naik 4,40 KB gzip, sedangkan P-71 menulis paling banyak 3 KB. Penyebabnya adalah layar kelas (suara, menu nama, panel Pemain, konfirmasi), halaman ruang (Ganti nama, Ganti semua nama, baris Nama pemain), dialog Ruang baru, sekitar 40 teks konsol baru, dan gayanya. Batas 3 KB disusun dari prototipe Plan yang belum memuat halaman ruang, dialog Ruang baru, dan teks konsol. Konsol kini 140,67 KB dari anggaran 350 KB (Architecture 11.3), dan HP siswa tidak memuat kode konsol.

Pilihan untuk pemilik proyek:

- (a, saran) Terima penyimpangan ini, seperti AC-23 di JS-09, dan catat batas baru +4,5 KB untuk JS-14.
- (b) Sesi A merampingkan kode konsol di JS-15, misalnya dengan memuat layar kelas hanya saat dibuka. Cara itu juga memperkecil konsol untuk semua fitur berikutnya.

## Catatan penerapan

- `Esc` yang dipakai dialog kejadian untuk menutup dirinya tidak lagi ikut membuka Menu. React sudah memperbarui keadaan dialog sebelum peristiwa sampai di penangan jendela, jadi penangan Menu kini memeriksa `defaultPrevented` (ditemukan `kejadian.uji.ts`).
- Di rekap, tombol Menu dan suara tetap tampil di kanan judul, tetapi berada di akhir urutan Tab, agar tautan "Langsung ke refleksi" tetap menjadi tujuan Tab pertama (JS-11 P-9; ditemukan `hasil.uji.ts`). `Esc` dan `M` tetap bekerja di rekap.
- Sesudah teks situasi dilewati, fokus pindah ke pilihan pertama di dialog, agar angka dan `Enter` tetap bekerja.
- Di layar kelas, tombol suara berada di pojok kanan atas di sebelah kiri tombol layar penuh, di semua tampilan; kepala layar kelas diberi ruang kanan agar jumlah pemain tidak tertutup. Selama panel Pemain terbuka, menu nama hanya terbuka di panel, bukan juga di lobi di belakangnya.
- `GET /api/ruang/{id}` membawa mode nama awal dari `pengaturan_json`; mode yang berlaku sekarang datang dari keadaan langsung Durable Object, dan itulah yang tampil di halaman ruang (P-33).
- Tiga uji server lama yang bergantung pada urutan berkas (jumlah rujukan belum diverifikasi dan kesiapan paket, yang bisa berubah bila uji bank berjalan lebih dulu) kini membaca keadaan saat uji berjalan. Kegagalannya sudah ada sebelum JS-14 dan muncul karena urutan berkas di mesin agen berbeda.
- Bantuan uji server tidak lagi menulis angka versi protokol tetap, dan `EMAIL` serta `SANDI` admin uji ujung ke ujung diekspor agar uji bisa masuk lewat halaman masuk konsol.

## Tangkapan layar

Di [tests/JS-14/](JS-14/): `kode-privasi-731x411`, `privasi-731x411`, `nama-bebas-731x411`, `nama-bebas-galat-731x411`, `hud-menu-731x411`, `hud-menu-1280x720`, `pengaturan-731x411`, `pengaturan-640x360`, `pengaturan-1280x720`, `tentang-731x411`, `kelas-menu-1024x768`, `kelas-menu-1920x1080`, `kelas-panel-pemain-1024x768`, `konsol-ruang-nama-1280x720`, dan `konsol-ruang-baru-nama-1280x720`.

## Uji manual pemilik proyek

Pemilik proyek menerima JS-14 pada 22 November 2026 sesudah mencoba di lingkungan uji. Isian nama buatan siswa awalnya tidak muncul karena halaman konsol belum dimuat ulang sesudah pembaruan; sesudah dimuat ulang, pilihan "Nama buatan siswa" tersedia. Sesudah itu, `nama.uji.ts` mendapat pemeriksaan pembuatan ruang lewat dialog Ruang baru dengan pilihan itu, dan uji tersebut lulus.

Daftar yang disarankan untuk dicoba:

- [ ] Di HP, suara mati secara bawaan; tombol suara menyalakannya, dan bunyi terdengar saat kotak skill diambil dan saat jawaban dikunci.
- [ ] Di laptop yang menjadi layar kelas, bunyi hitung mundur, dua menit terakhir, dan jingle akhir terdengar; `M` mematikannya.
- [ ] Menu → Kurangi gerak Nyala menghentikan gerak hiasan, dan Ukuran label nama Besar memperbesar nama di atas kepala pemain lain.
- [ ] Satu ronde bisa dimainkan hanya dengan papan ketik di laptop.
- [ ] Narator Windows (`Ctrl` + `Win` + `Enter`) membacakan dialog kejadian dan panel Pengaturan.
- [ ] Di ruang "Nama buatan siswa", nama kasar ditolak, guru bisa mengganti nama dan mengeluarkan pemain dari layar kelas, dan tidak ada nama lengkap siswa di layar, CSV, maupun log.
- [ ] Bila ada iPhone: bunyi di Safari terdengar sesudah tombol suara diketuk.
