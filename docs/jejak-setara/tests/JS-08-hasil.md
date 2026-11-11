# JS-08 — Hasil uji

| | |
|---|---|
| Fitur | JS-08 Kejadian |
| Spesifikasi | [specs/JS-08-kejadian.md](../specs/JS-08-kejadian.md), disetujui 9 November 2026 (`Spesifikasi disetujui: JS-08`) dengan saran D-1 sampai D-6 |
| Tanggal | 11 November 2026 |
| Lingkungan | Lingkungan agen: Node 22.23.4, pnpm 11.25.0, `wrangler` 4.92.0, Chromium 153 tanpa GPU; 1 vCPU, 4 GB. ZIP `main` 10 November 2026 (sesudah JS-05 Selesai) |
| Keputusan | **Lulus dengan catatan AC-24**: satu uji Sesi B (`bank-protokol.test.ts`) diubah angka versinya atas keputusan pemilik proyek, karena protokol versi 2 menolak amplop versi 1. Selesai sesudah ZIP di-push, "Jejak: uji" hijau (termasuk "Semai bank awal" yang pertama), dan pemilik proyek mencoba satu kejadian di lingkungan uji |

## Perintah resmi

| Perintah | Hasil |
|---|---|
| `install --frozen-lockfile` | Lulus; lockfile tidak berubah, tanpa dependensi baru |
| `content:check:jejak` | Lulus: 10 berkas, 254 uji (sesudah perubahan angka versi di `bank-protokol.test.ts`; sebelumnya 17 uji merah, lihat AC-24) |
| `test:jejak` | Lulus: 38 berkas, 766 uji (garis dasar 33 berkas dan 705 uji). Berkas baru: `ruang/kejadian-ruang.test.ts`, `ruang/inti-ruang-kejadian.test.ts`, `ruang/antrean.test.ts`, `bersama/dialogKeadaan.test.ts`, dan `dunia/kejadian.test.ts`. Uji lama yang disesuaikan: amplop versi 2, butir `dunia` enam unsur, `selesai` saat sambung ulang sesudah ronde selesai (P-36), dan tabel teks |
| `test:jejak:server` | Lulus: 3 berkas, 24 uji lewat HTTP dan WebSocket sungguhan (19 lama, satu disesuaikan karena ruang coba kini memuat Paket inti 16, dan 5 baru di `kejadian.uji-server.ts`) |
| `build:jejak` | Lulus. Lihat bagian "Anggaran ukuran dan kinerja" |
| Build `CLOUDFLARE_ENV=uji` dan `wrangler deploy --dry-run` | Binding `RUANG`, `DB` (`jejak-setara-uji`), `BATAS_PUBLIK`, `BATAS_WS`, `ASSETS`, dan `LINGKUNGAN` = `uji`; unggahan 220,54 KiB, 51,29 KiB gzip (JS-07: 175,37 dan 39,28 KiB) |
| `test:e2e:jejak` (`JEJAK_CHROMIUM`) | Lulus: 28 uji (14 kerangka JS-01, 5 gabung JS-03, 5 dunia JS-07 termasuk uji kinerja dengan ambang baru, dan 4 kejadian JS-08). Dijalankan dalam beberapa bagian karena batas sekitar 300 detik per perintah |
| `sim:beban` | Lulus; lihat bagian "Simulasi beban" |
| `build:pages` | Lulus; ke-178 berkas identik byte dengan garis dasar, sesudah kode dan sesudah semua dokumen |
| `tsc --noEmit` | 0 galat |
| ESLint pada berkas Jejak Setara | 0 masalah |
| Alur kerja | Ketiga alur kerja Jejak terbaca sebagai YAML sah, dan setiap skrip `run` lulus `bash -n` |

## Kriteria penerimaan

| AC | Hasil | Bukti |
|---|---|---|
| AC-1 Isi ruang coba | Lulus | Uji server: D1 yang disemai memberi 16 kejadian versi `kerja`, `paket_id` Paket inti 16, dan `kejadian: 16` di jawaban; ruang 60 pemain mendapat dua titik per kejadian; D1 tanpa semai memberi `kejadian: 0`, `paket_id` kosong, dan ruang tetap berjalan. Isi yang tidak lolos skema atau rujukan tanpa teks dilewati (`muatKejadianRuangCoba`); kejadian yang zonanya kehabisan titik dilewati menurut urutan paket (uji unit). `kerangka.test.ts`: ringkasan "Jejak: ruang coba" menulis jumlah kejadian, atau teks peringatan bila 0 |
| AC-2 Semai | Lulus | `kerangka.test.ts`: skrip `db:semai:lokal`, semai di `server-lokal.mjs` sesudah migrasi dan sebelum pratinjau, serta langkah "Semai bank awal" tepat sesudah "Migrasi D1 uji" dengan syarat yang sama. Semai lokal berjalan di setiap uji server dan E2E. Semai ke D1 uji tidak dijalankan agen; langkah itu berjalan pertama kali saat ZIP di-push |
| AC-3 Penempatan | Lulus | `inti/aturan.test.ts`: satu titik sama persis dengan JS-02; dua titik berbeda di zona yang sama; zona yang kurang titik menjadi `TITIK_TIDAK_CUKUP`. `kejadian-ruang.test.ts`: ke-16 kejadian muat dengan satu atau dua titik, setiap titik dipakai sekali |
| AC-4 Keterlihatan | Lulus | Uji inti ruang: `kejadian_terlihat` hanya di `main`, sekali per titik, dengan `setTokoh`, dan tercatat di tabel `terlihat`; sambung ulang mengirim ulang semua titik terlihat (urut kode, lalu titik) lalu `pribadi`. Uji server: sesudah putus dan sesudah server dinyalakan ulang, `pribadi.terlihat` dan penanda pulih |
| AC-5 Tokoh dan properti | Lulus | `dunia/kejadian.test.ts`: tata letak ke-16 set bank awal sama dengan tabel harapan, tanpa properti tumpang tindih. `penggambar.test.ts`: properti bawah sesudah lapis bawah, tokoh dan penanda bersama avatar menurut y, properti atas sesudah lapis atas. E2E: `data-tokoh-kejadian` 4 di K-13. Tokoh dan properti tidak masuk grid tabrakan |
| AC-6 Penanda dan peta | Lulus | `penggambar.test.ts`: "!" naik 1 piksel setiap bingkai kedua dan diam saat kurangi gerak, "…" saat dialog sendiri terbuka, ✓ sesudah selesai. E2E: atribut `data-kejadian`, `data-selesai`, dan `data-jangkauan`; peta besar dengan penanda ✓ dan ringkasan "Kejadian terlihat n, selesai 1." |
| AC-7 Periksa | Lulus | Uji inti ruang dan server: `BUKAN_JANGKAUAN` lalu `koreksi` bila terlalu jauh; jangkauan server 32 piksel ke titik mana pun. `dunia/kejadian.test.ts`: jangkauan klien 24 piksel, yang terdekat lalu kode terkecil. E2E HP: tombol Periksa 64 px dengan label "Periksa. Dekati penanda kejadian dulu." lalu "Periksa kejadian"; E2E laptop: ajakan `E` dan tanpa tombol Periksa |
| AC-8 Langkah 1 | Lulus | `dialogKeadaan.test.ts`: mode ringkas di bawah 560 px, masa tunggu 600 ms, Kunci aktif sesudah memilih. `kejadian-ruang.test.ts`: urutan dan id pilihan tetap per pemain dan unik. E2E: ke-16 kejadian di HP 731 × 411 (lembar) dan di 1024 × 768 (panel) tidak perlu digulir di tampilan Situasi dan Pilihan |
| AC-9 Kunci dan umpan balik | Lulus | Uji unit untuk ke-16 kejadian: `hasil_1` untuk pilihan benar dan keliru, poin 40 atau 0, kunci kedua diabaikan. E2E: pita "Tepat +40" dan "Belum tepat", label "Jawaban tepat" dan "Pilihanmu"; mode ringkas hanya dua pilihan |
| AC-10 Langkah 2 dan kartu dampak | Lulus | Uji unit: tingkat, poin 60/25/0, semua pilihan tepat, dan teks rujukan. E2E: kepala kartu menurut tingkat dengan "+60", "Pilihan yang tepat" bila tingkat bukan tepat, catatan rujukan ruang uji (D-4), dan "Lanjut menjelajah" menutup dialog |
| AC-11 Tutup dan KT-13 | Lulus | Uji inti ruang, server, dan E2E: menutup sesudah Langkah 1 lalu memeriksa lagi membuka Langkah 2 dengan ulangan `hasil_1`; penanda tetap "!"; poin Langkah 1 tetap dihitung saat ronde berakhir |
| AC-12 Jeda, akhir, dan sambung ulang | Lulus | Uji inti ruang: periksa dan kunci diabaikan saat jeda; `selesai` dengan peringkat akhir. E2E: dialog tersembunyi di bawah lapisan pekat selama jeda lalu kembali; putus di tengah dialog menutup dialog, lalu skor dan penanda pulih; ronde berakhir saat HP terputus, lalu layar "Ronde selesai" dengan "Skormu 40" dan "Peringkat 1 dari 1" |
| AC-13 Skor dan peringkat | Lulus | Uji unit: skor, waktu skor tanpa jeda, peringkat, dan `pribadi` karena peringkat berubah paling sering sekali per 2 detik. E2E: "#–" dan "Skor 0, belum ada peringkat", lalu "Skor 40, peringkat 1" dan "Skor 100, peringkat 1" |
| AC-14 Gelembung "…" | Lulus | Uji inti ruang dan server: unsur keenam `dialog` naik dan turun bersama dialog. E2E: `data-dialog-lain` 1 di layar pemain lain selama dialog, lalu 0 |
| AC-15 Gerak selama dialog | Lulus | Uji inti ruang: `gerak` saat dialog ditolak tanpa `koreksi`. Klien: gerak dimatikan selama dialog dan selama periksa menunggu, dan laporan berhenti dikirim sebelum `periksa` |
| AC-16 Penyimpanan ruang | Lulus | Uji server: server dimatikan dan dinyalakan lagi di tengah ronde, lalu skor, titik terlihat, dan status jawaban (KT-13) pulih. Pemulihan dialog dari lampiran sambungan diuji di uji inti ruang, karena menyalakan ulang server menutup sambungan. Baris `pemain` tidak ditulis karena skor |
| AC-17 Kiriman D1 | Lulus | `antrean.test.ts` (`node:sqlite`): satu baris per jawaban yang berubah tiga kali, urutan ruang–peserta–jawaban, dan hapus sesudah kirim hanya bila versi sama. Uji server: baris `jawaban` dan `peserta` di D1 lokal dengan isi benar dan kunci asing terpenuhi |
| AC-18 Protokol | Lulus | `protokol.test.ts`: versi 2, butir `dunia` lima unsur dan `kejadian_terlihat` tanpa `setTokoh` ditolak. `sambungan.test.ts`: `halo` versi 1 dilaporkan versi berbeda (galat `VERSI_BERBEDA` dan tutup 4005); `jaringan.test.ts`: klien menampilkan pesan pembaruan |
| AC-19 Kinerja | Lulus | Ambang P-69 lulus di keempat keadaan; lihat bagian "Anggaran ukuran dan kinerja". E2E: `#fps` menampilkan "n fps · p95 ≤ k ms". Butir manual "≥ 30 fps di HP Android kelas bawah" tetap saat uji coba kelas |
| AC-20 Beban dan lalu lintas | Lulus | Lihat bagian "Simulasi beban" |
| AC-21 Ukuran | Lulus | Lihat bagian "Anggaran ukuran dan kinerja". Kedua berkas peta tidak berubah |
| AC-22 Aksesibilitas | Lulus | E2E laptop dengan papan ketik saja: `E`, angka, Enter, Esc, dan `P`. Dialog `role="dialog"` dengan nama judul kejadian dan fokus terkurung; pengumuman lewat antrean berjarak 2 detik; target sentuh ≥ 48 px; makna tertulis ("Jawaban tepat", "Pilihanmu", tulisan tingkat) |
| AC-23 Kait uji lokal | Lulus | Uji server: `kejadian` dan `pindahkan` di lokal (sel padat 400, nama tidak dikenal 404). `kerangka.test.ts`: keduanya 404 di `uji` (walaupun dengan kunci) dan di produksi |
| AC-24 Kode dan lingkungan | **Lulus dengan catatan** | Perintah di atas; tanpa galat konsol, pelanggaran CSP, atau respons 4xx dan 5xx yang tidak diharapkan di E2E. Catatan: `bank-protokol.test.ts` (Sesi B) memakai amplop versi 1 secara tertulis, sehingga 17 ujinya merah sesudah P-64. Atas keputusan pemilik proyek, hanya angka versi itu (enam tempat) yang diganti dengan `PROTOKOL_VERSI`. Berkas Sesi C tidak berubah |
| AC-25 Dokumen | Lulus | `PLAN.md` (tabel status, catatan, hasil Build dan Test, tanggapan A-5, A-9, dan A-11) dan Architecture 3, 5.3, 10.6, dan 13.4. Design System dan PRD sudah diubah di Gerbang 2 |

## Simulasi beban (wajib)

Worker lokal, bot jujur berjalan 72 piksel per detik. Saat menjelajah, bot berjalan ke kejadian yang terlihat dalam 12 ubin, memeriksa pada jarak 20 piksel, menjawab kedua langkah dengan jeda acak 1–3 detik, lalu menutup dialog sesudah 1 detik (P-71). Urutan: 5 detik diam di lobi, 15 detik berjalan di lobi, lalu 120 detik menjelajah.

| Ukuran | 1 × 50 bot | 1 × 100 bot |
|---|---|---|
| Kejadian di ruang | 16 | 16 (dua titik per kejadian) |
| Dialog dibuka / dijawab kedua langkah | 86 / 85 (42 bot) | 333 / 322 (100 bot) |
| Hitungan server `jawabanSelesai` | 85 | 322 |
| Pesan ditolak server, gerak dikoreksi, putus tak terduga | 0, 0, 0 | 0, 0, 0 |
| Lobi diam: kiriman `dunia`, putaran server | 0, 0 | 0, 0 |
| Pesan naik per pemain per detik (menjelajah) | 8,04 | 4,91 |
| `pribadi` per pemain per detik (menjelajah) | 0,18 | 0,38 |
| Lalu lintas turun per pemain per 15 menit (menjelajah) | 1,70 MB | 1,83 MB |
| Waktu pulang-pergi p50 / p95 | 10 / 25 ms | 21 / 42 ms |
| Baris tulis SQLite ruang (seluruh percobaan, sekitar 2,5 menit) | 1.944 | 6.790 |
| Perkiraan permintaan Durable Object per sesi 15 menit | 18.140 | 22.195 |

Biaya satu putaran 100 ms di Node (uji `inti-ruang-kejadian.test.ts`, 60 putaran, separuh pemain bergerak, keterlihatan, `dunia`, dan jadwal `pribadi`): 50 pemain rata-rata 0,55 ms (p95 4,8 ms), 100 pemain rata-rata 0,52 ms (p95 3,7 ms). Putaran terlama berasal dari putaran pertama, saat banyak titik terlihat sekaligus dan kode belum dioptimasi mesin JavaScript. CPU putaran di Durable Object lokal tidak terukur, karena jam `workerd` tidak maju selama kode berjalan.

## Anggaran ukuran dan kinerja

- Kode layar pemain (gzip): `pemain` 60,8 KB, potongan bersama 61,7 KB, CSS 4,2 KB; total 126,6 KB (batas 200 KB; garis dasar Plan JS-08 117,6 KB, naik 9,0 KB). Worker 52,5 KB gzip (sebelumnya 40,4 KB, karena skema isi kejadian dan titik kejadian peta).
- Aset layar pemain: 236 PNG, 99,6 KB (batas 2 MB). Sejak JS-08 semua tokoh bukan pemain dan semua objek di manifest ikut dimuat sebelum tombol "Masuk" aktif, karena kunci `setTokoh` baru diketahui saat kejadian terlihat.
- Kinerja menggambar (uji E2E kinerja, ukuran HP 731 × 411, r 2,625, 40 bot berjalan; histogram per kelompok bingkai P-68):

| Keadaan | Bingkai | p95 paling tinggi | Bingkai terlama | Bingkai ≥ 50 ms | Bingkai ≥ 100 ms |
|---|---|---|---|---|---|
| CPU normal, lobi penuh (5 detik) | 301 (60 per detik) | ≤ 1 ms | ≤ 6 ms | 0 | 0 |
| CPU 6×, lobi penuh | 285 | ≤ 6 ms | ≤ 16 ms | 0% | 0 |
| CPU 6×, berjalan melintasi peta | 275 | ≤ 12 ms | ≤ 25 ms | 0% | 0 |
| CPU 6×, berdiri dekat K-13 (penanda, tiga tokoh, bangku) | 230 | ≤ 6 ms | ≤ 50 ms | 0% | 0 |
| CPU 6×, pergantian pagi ke siang | 477 | ≤ 6 ms | ≤ 12 ms | 0% | 0 |

Ambang P-69: CPU normal p95 ≤ 4 ms, terlama ≤ 25 ms, ≥ 50 bingkai per detik; CPU 6× p95 ≤ 50 ms, bingkai ≥ 50 ms paling banyak 1%, tanpa bingkai ≥ 100 ms. Semua lulus.

## Tangkapan layar

Di folder [JS-08/](JS-08/): dunia dengan penanda dan tokoh K-13, Langkah 1, umpan balik, Langkah 2, dan kartu dampak dalam empat ukuran (731 × 411 dari konteks HP r 2,625; tiga ukuran laptop dari satu halaman yang diubah ukurannya; di 1024 × 768 dialog memakai mode ringkas). Ditambah HP tampilan Situasi dan Pilihan, gelembung "…" di layar pemain lain, peta besar dengan penanda selesai, jeda saat dialog terbuka, dan layar "Ronde selesai" dengan skor.

## Deviasi dari spesifikasi dan koreksi Build

- Berkas tambahan di luar daftar spesifikasi: `server/jejak-setara/src/ruang/antrean.ts` (SQL antrean dipisah dari `RuangJejak.ts`, agar perilaku versinya teruji dengan `node:sqlite`); `__tests__/ruang/bankUji.ts` dan `__tests__/ruang/inti-ruang-kejadian.test.ts` (uji inti ruang JS-08 dipisah dari uji JS-03); `.github/workflows/jejak-kendali-coba.yml` (pesan layar kelas versi 2; tanpa itu "Jejak: kendali ruang coba" ditolak dan ronde tidak bisa dimulai); `e2e/jejak-setara/kerangka.uji.ts`, `server/jejak-setara/uji/ruang.uji-server.ts`, dan `dunia.uji-server.ts` (versi protokol).
- `bank-protokol.test.ts` milik Sesi B diubah atas keputusan pemilik proyek (lihat AC-24).
- Nilai meta `waktu` mendapat `riwayatJeda`, agar waktu skor tanpa jeda (P-55) bisa dihitung ulang dari `jawaban` sesudah ruang dibangunkan (P-63). Kolom tabel tidak berubah.
- `pribadi` juga dikirim saat ronde dilanjutkan sesudah jeda (status kembali `main`) dan kepada pemain yang bergabung saat ronde berjalan. `tutup_dialog` diterima juga saat jeda; isinya hanya menutup dialog.
- Kait `pindahkan` menjawab 400 untuk sel padat dan 404 untuk nama yang tidak dikenal.
- Tombol "Tutup" dan Esc juga mengikuti masa tunggu 600 ms (P-48 berlaku untuk semua tombol dialog). Pengumuman Langkah 1 tidak diulang saat dialog dibuka lagi di Langkah 2 (KT-13).
- `sim:beban` membaca versi protokol dari `/api/sehat`, dan ringkasannya ditambah jumlah kejadian per ruang, kejadian terlihat, dialog dibuka dan dijawab, `pribadi` per detik, dan hitungan server.
- Ditemukan dan diperbaiki selama Test: (1) layar tidak berganti ke "Ronde selesai" bila ronde berakhir saat HP terputus, karena `selamat_datang` sesudah sambung ulang sudah membawa status baru; kesalahan ini sudah ada sejak JS-03 dan kini diuji di E2E. (2) Dialog semula tertahan lebar 560 px gaya panel layar HTML; kini lembar menutupi area dialog di HP dan panel 70% di laptop. (3) Bot simulasi mula-mula tidak pernah memeriksa karena jalur ke titik dihitung ulang tanpa henti.

## Temuan lain

- `server/jejak-setara/seed/kontrak-d1.sql` masih ada di ZIP `main` 10 November 2026, walaupun commit penutup JS-05 seharusnya menghapusnya (menyalin isi ZIP tidak menghapus berkas). Tidak ada kode yang memakainya. Penghapusannya menjadi langkah tersendiri di serah terima Build JS-08.
- Protokol versi 2: tab yang masih terbuka dengan halaman lama menampilkan "Ada pembaruan. Muat ulang halaman." sesudah deploy.
- Semai pertama ke D1 lingkungan uji berjalan lewat alur kerja dan tidak dicoba agen (aturan wajib 15). Bila langkah itu merah, job "Deploy uji" menampilkan pesan `wrangler`, dan semai aman diulang.
- Di HP, tampilan umpan balik dan kartu dampak yang panjang bisa digulir di dalam dialog. Tombol kaki tetap terlihat (E2E: "Lanjut menjelajah" ada di layar).

## Pemeriksaan manual di lingkungan uji

Belum. Dilakukan pemilik proyek sesudah ZIP di-push dan "Jejak: uji" hijau: satu kejadian dari awal sampai akhir di HP (tombol Periksa, dialog dua langkah, kartu dampak, skor, dan peringkat), dengan merek dan tipe HP dicatat untuk laporan JS-07 dan JS-08.

## Perbaikan uji sesudah push (11 November 2026)

- **Gejala.** Sesudah ZIP Build JS-08 di-push, "Jejak: uji" merah di mesin GitHub: `test:jejak:server` 23 dari 24 lulus. Uji "server dimatikan lalu dinyalakan lagi dengan keadaan yang sama: skor, titik terlihat, dan status jawaban pulih" gagal dengan `pesan yang ditunggu tidak datang: ["galat","koreksi"]`. Di lingkungan agen uji ini lulus.
- **Penyebab.** Kode JS-08 tidak salah; uji itu bergantung pada urutan waktu. Posisi pemain disimpan ke SQLite ruang saat sambungan putus diproses, bukan pada setiap `gerak` (Architecture 13.4). Uji menutup sambungan lalu langsung mematikan server. Di mesin GitHub, server mati sebelum ruang memproses putusnya sambungan, sehingga posisi dekat titik tidak tersimpan. Sesudah dinyalakan lagi, pemain berada di titik muncul, dan `periksa` dijawab `BUKAN_JANGKAUAN` (galat lalu `koreksi`, P-26). Skor, titik terlihat, dan status jawaban tetap pulih. Penyebab ini dipastikan dengan menjalankan uji lama tanpa sambungan diputus sebelum server dimatikan: galatnya sama persis dengan di mesin GitHub.
- **Perbaikan (hanya berkas uji).** Uji kini menunggu 300 ms sesudah menutup sambungan, seperti uji JS-03 yang serupa. Sesudah tersambung lagi, pemain dipindah ke dekat titik lewat kait `pindahkan` sebelum memeriksa, karena posisi bukan bagian pemulihan P-63. Uji yang diperbaiki lulus, juga pada kasus terburuk (server dimatikan tanpa sambungan diputus lebih dulu). `test:jejak:server` lulus 24 uji.

## Keputusan

**Lulus dengan catatan AC-24.** Semua kriteria otomatis lulus. Satu uji Sesi B diubah angka versinya atas keputusan pemilik proyek. JS-08 Selesai sesudah ZIP di-push, "Jejak: uji" hijau, dan pemeriksaan manual pemilik proyek di lingkungan uji.
