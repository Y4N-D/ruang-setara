# JS-15 — Uji beban dan ketahanan jaringan, anggaran ukuran, perbaikan kinerja

Status: disetujui (23 November 2026, `Spesifikasi disetujui: JS-15`; D-1 sampai D-4 = a). Build selesai 23 November 2026; catatan Build di akhir dokumen. Disusun Sesi A dari entri Plan JS-15 yang disetujui pemilik proyek (`Setuju: JS-15`, 23 November 2026: saran setiap usulan diterima, yaitu 1a sampai 10a), dari ZIP `main` commit `e3e24a5` ditambah commit Plan JS-15.

## Ringkasan

JS-15 membuktikan bahwa Jejak Setara sanggup dipakai satu sekolah di Cloudflare sungguhan, lalu memperbaiki hal yang terbukti lambat. Isinya enam bagian:

1. **Pengaturan sesudah Workers Paid** (usulan 8): batas CPU 1.000 ms, 12 ruang aktif, dan hash sandi 100.000 iterasi di lingkungan uji, serta pengaman biaya baru di `sim:beban`.
2. **Uji beban jarak jauh** lewat alur kerja baru "Jejak: uji beban" di mesin GitHub (usulan 1 sampai 3): uji singkat, 1 × 50 bot, 10 ruang × 50 bot serentak, dan 1 × 100 bot, ditambah 10 × 50 bot di Worker lokal.
3. **Ketahanan jaringan** (usulan 5): proksi WebSocket lokal untuk latensi, jitter, dan putus 30 detik serta 2 menit, dengan uji ujung ke ujung baru.
4. **Anggaran ukuran otomatis** (usulan 6) di "Jejak: uji".
5. **Perbaikan kinerja** (usulan 7): layar Kode tampil lebih dulu, kiriman lobi dibatasi, layar kelas di konsol dimuat saat dibuka, dan penanda versi konsol.
6. **Waktu pulang-pergi dari HP** (usulan 4): median dan p95 per ruang di "Pemakaian ronde ini".

Lingkungan produksi dikerjakan di JS-16 (usulan 9a). Koreksi dokumen dari pemeriksaan dokumentasi Cloudflare masuk di Build (usulan 10a).

## Kaitan

- PRD bagian 12: Kapasitas (50 pemain per ruang, 10 ruang serentak), Latensi (p95 ≤ 250 ms di wifi sekolah), Kinerja HP, Muatan awal (siap ≤ 6 detik pada 10 Mbps), Data seluler (≤ 3 MB per ronde 15 menit), Ketahanan (putus sampai 2 menit tersambung lagi tanpa kehilangan skor; ronde tetap berjalan bila layar kelas tertutup), dan Biaya. PRD 14 dan 21 (paket server).
- Architecture 11.3 (anggaran), 13.1 sampai 13.4 (kinerja, kapasitas, biaya), 14 (baris Jaringan dan Beban), dan 18 (penyiapan server).
- Sisa AC-20 JS-03 (10 ruang × 50 bot).
- Catatan Plan JS-15 yang ditanggapi: tabel di akhir entri JS-15 di `PLAN.md`.
- Hasil percobaan Plan JS-15 (23 Nov 2026): layar Kode siap 5,04 detik pada CPU 4× lebih lambat dengan 10 Mbps; lobi 5,88 MB per pemain per 15 menit; ukuran kode dan aset di bawah anggaran.

## Berkas yang dibuat dan diubah

- **Baru:**
  - `.github/workflows/jejak-uji-beban.yml`.
  - `scripts/jejak-setara/biaya-beban.mjs` (rumus perkiraan biaya, murni dan diuji).
  - `scripts/jejak-setara/proksi-jaringan.mjs`.
  - `scripts/jejak-setara/anggaran.mjs`.
  - `scripts/jejak-setara/ukur-muat.mjs` (pengukur waktu muat lokal dengan Playwright, tidak dijalankan di alur kerja).
  - `scripts/jejak-setara/gabung-beban.mjs` (penggabung hasil pekerjaan uji beban).
  - `e2e/jejak-setara/jaringan.uji.ts`.
  - Uji unit di `app/jejak-setara/__tests__/beban/` (biaya, penggabungan dan ambang, anggaran, penjadwal muat, dan histogram pulang-pergi).
  - `docs/jejak-setara/tests/JS-15-hasil.md` dan tangkapan layarnya.
- **Diubah:**
  - `scripts/jejak-setara/simulasi-beban.mjs`.
  - `server/jejak-setara/wrangler.jsonc` (lingkungan uji).
  - `.github/workflows/jejak-uji.yml` (langkah anggaran).
  - `app/jejak-setara/inti/protokol.ts` dan `inti/versi.ts` (`ping`, `PROTOKOL_VERSI` 4).
  - `app/jejak-setara/inti/ruang.ts` (`skemaPemakaian`, kuota).
  - `server/jejak-setara/src/ruang/inti-ruang.ts` dan `RuangJejak.ts` (kiriman lobi, histogram pulang-pergi).
  - `app/jejak-setara/pemain/App.tsx`, `pemain/dunia/aset.ts`, `pemain/dunia/pemainLain.ts`, dan `pemain/jaringan.ts`.
  - `app/jejak-setara/admin/App.tsx` dan `admin/halaman/DetailRuang.tsx`, beserta satu modul kecil baru untuk penanda versi.
  - `app/jejak-setara/teks-konsol.ts` dan `__tests__/kerangka.test.ts`.
  - Dokumen utama (bagian "Dokumen" di bawah) dan `PLAN.md`.
- **Tidak diubah:** berkas Sesi B dan C, Sehari Setara, galeri, `deploy-pages.yml`, `package.json`, lockfile, dan skema D1.

## Perilaku

### Lingkungan uji dan pengaman biaya (usulan 8)

- **P-1.** `wrangler.jsonc` lingkungan uji (`env.uji`) memuat `limits.cpu_ms` 1.000, `RUANG_AKTIF_MAKS` `"12"`, dan `ITERASI_SANDI` `"100000"`. Pengaturan tingkat atas (Worker lokal untuk uji) tidak berubah.
- **P-2.** Diberikan akun lingkungan uji yang hash sandinya masih 4.000 iterasi, ketika pemiliknya masuk dengan sandi yang benar, maka server memperbarui hash ke 100.000 iterasi seperti mekanisme JS-04 yang sudah ada, dan masuk berikutnya memakai hash baru.
- **P-3.** `biaya-beban.mjs` mengekspor `perkiraanBiaya({ ruang, botPerRuang, detikLobi, detikJelajah })`. Fungsi ini mengembalikan perkiraan pesan masuk, permintaan Durable Object (pesan masuk ÷ 20, ditambah sambungan dan alarm), GB-detik (ruang × detik aktif × 0,125), serta baris SQLite dan D1 ditulis. Rumusnya memakai laju percobaan Plan: 4,5 pesan per bot per detik di lobi, 8,0 saat menjelajah, sekitar 31 baris SQLite dan 8 baris D1 per bot per menit. Angkanya dibandingkan dengan kuota bulanan Workers Paid.
- **P-4.** Diberikan `sim:beban --sasaran uji`, ketika dijalankan, maka skrip mencetak perkiraan P-3 lebih dulu. Skrip berhenti dengan kode keluar 1 dan pesan yang jelas bila pilihan `--saya-paham-biaya` tidak ada, atau bila perkiraan permintaan Durable Object lebih dari 400.000 per run. Pengaman lama 20.000 permintaan dihapus. Mode lokal tidak berubah.
- **P-5.** Di mode uji, bot dalam satu proses bergabung paling banyak 4 sambungan per detik (`--laju-gabung`, bawaan 4). Satu proses tidak pernah membuka lebih dari 250 sambungan per menit, di bawah pembatas 300 per menit per alamat IP.
- **P-6.** Sebelum bot lain bergabung, satu bot pengukur di lobi ruang pertama mengirim 30 `ping` dengan jeda 1 detik. Hasilnya dicatat sebagai `rttSepiMsP95`. Kenaikan pulang-pergi adalah p95 saat menjelajah dikurangi `rttSepiMsP95`.
- **P-7.** Pilihan `--mulai-pada <milidetik epoch>` membuat setiap ruang dimulai pada waktu itu, dengan selisih paling banyak 5 detik. Bila waktu itu sudah lewat lebih dari 60 detik saat ruang siap, run gagal dengan pesan yang jelas.
- **P-8.** Di akhir run mode uji, skrip mencatat `pemakaian` setiap ruang dari `GET /api/ruang/{id}`, lalu menghapus data ruang itu lewat `DELETE /api/ruang/{id}` (JS-11, P-33), kecuali bila pilihan `--simpan-ruang` dipakai. Ruangnya tetap ruang uji (`uji: true`), jadi tidak masuk statistik.
- **P-9.** AGENTS 7 butir 16 (paket gratis) diganti aturan paket berbayar: uji beban jarak jauh hanya lewat "Jejak: uji beban", hanya atas perintah pemilik proyek, dan setiap run mencetak perkiraan biaya lebih dulu.

### Alur kerja "Jejak: uji beban" (usulan 1, 2a, dan 3a)

- **P-10.** Pemicunya `workflow_dispatch` dengan dua input: `skenario` (pilihan `singkat`, `s1`, `s2`, `s3`, `lokal-10x50`) dan `konfirmasi` (wajib berisi `UJI BEBAN`). Alur kerja memakai `permissions: contents: read` dan `concurrency: jejak-uji-beban` tanpa membatalkan run yang sedang berjalan. Setiap pekerjaan dibatasi 40 menit, dan `actions/setup-node` memakai `package-manager-cache: false`.
- **P-11.** Pekerjaan `periksa` gagal dengan pesan bahasa Indonesia bila:
  - konfirmasi salah;
  - untuk skenario jarak jauh, rahasia `JEJAK_UJI_EMAIL` atau `JEJAK_UJI_SANDI` kosong;
  - `GET https://jejak-setara-uji.ruangsetara.workers.dev/api/sehat` tidak menjawab `ok: true` dengan `lingkungan: "uji"`, atau memuat `darurat`.

  Pekerjaan ini juga menetapkan `MULAI_PADA`, yaitu waktu sekarang ditambah 6 menit, dan matriks pembagian bot.
- **P-12.** Pembagian skenario:

  | Skenario | Pekerjaan bot | Ruang × bot per pekerjaan | Lobi | Menjelajah | Sasaran |
  |---|---|---|---|---|---|
  | `singkat` | 1 | 1 × 50 | 1 menit | 2 menit | Lingkungan uji |
  | `s1` | 1 | 1 × 50 | 3 menit | 15 menit | Lingkungan uji |
  | `s2` | 5 (paralel) | 2 × 50 | 3 menit | 15 menit | Lingkungan uji, mulai bersama di `MULAI_PADA` |
  | `s3` | 1 | 1 × 100 | 3 menit | 15 menit | Lingkungan uji |
  | `lokal-10x50` | 1 | 10 × 50 | 1 menit | 5 menit | Worker lokal di mesin GitHub (`server-lokal.mjs`) |

  Bot menjawab kejadian dan memakai skill seperti di JS-09.
- **P-13.** Setiap pekerjaan bot menyimpan JSON hasilnya sebagai artifact `beban-<skenario>-<bagian>`. Pekerjaan `gabung` mengunduh semua artifact, membuat `hasil-uji-beban.json` dengan `gabung-beban.mjs`, menulis tabel ambang di ringkasan run, dan menyimpan artifact selama 30 hari. Run menjadi merah bila satu ambang P-14 gagal.
- **P-14.** Ambang lulus otomatis, dinilai per skenario (usulan 3a):
  1. 0 sambungan putus tak terduga.
  2. 0 pesan ditolak server.
  3. Gerak jujur dikoreksi kurang dari 1%.
  4. Semua bot menerima `selesai`, dan jumlah peserta di D1 sama dengan jumlah bot.
  5. Data turun ≤ 3 MB per pemain per 15 menit selama menjelajah.
  6. Kenaikan p95 pulang-pergi (P-6) ≤ 50 ms.
  7. Permintaan Durable Object per ruang dari `pemakaian` berada dalam ±25% perkiraan P-3.
  8. Untuk `s2`, kesepuluh ruang berstatus `main` bersamaan sedikitnya 14 menit.

  Ambang di luar alur kerja (Metrics Cloudflare dan tagihan) dinilai di Test dari tangkapan layar pemilik proyek (AC-11).

### Ketahanan jaringan (usulan 5a)

- **P-15.** `proksi-jaringan.mjs` mengekspor `buatProksi({ portDengar, portTujuan, latensiMs, jitterMs })`. Proksi mendengar di `127.0.0.1` dan meneruskan TCP ke Worker lokal. Objek yang dikembalikan punya tiga cara:
  - `atur({ latensiMs, jitterMs })` mengubah latensi dan jitter;
  - `putus(ms)` menutup semua sambungan dan menolak sambungan baru selama `ms`;
  - `tutup()` mematikan proksi.

  Latensi diterapkan per arah per potongan data, dengan urutan potongan tetap terjaga. Proksi hanya memakai `node:net` dan juga bisa dijalankan dari baris perintah untuk uji manual (`--dengar`, `--tujuan`, `--latensi`, `--jitter`).
- **P-16.** Diberikan pemain di ronde berjalan dengan skor S dan sedikitnya satu kejadian terjawab, ketika sambungannya diputus proksi selama 30 detik, maka layar menampilkan status terputus lalu menyambung ulang dengan teks JS-03/JS-07 yang sudah ada. Sesudah sambungan pulih, pemain kembali ke ruang yang sama dengan nama dan avatar yang sama, posisi dari server, skor S, dan kejadian terjawab tetap terhitung.
- **P-17.** Sama dengan P-16 untuk putus 2 menit. Ronde tetap berjalan selama putus, sehingga sisa waktu berkurang sekitar 2 menit, dan pemain lain tidak terganggu.
- **P-18.** Diberikan latensi 300 ms dengan jitter 50 ms, pemain di peramban tetap bisa berjalan, membuka kejadian, dan menjawab. `sim:beban` lokal 1 × 50 dengan `--latensi-ms 300` dan jitter yang setara mencatat gerak jujur dikoreksi kurang dari 1%.
- **P-19.** Diberikan ronde berjalan, ketika layar kelas ditutup selama 60 detik lalu dibuka lagi, maka ronde tetap berjalan, pemain tetap bisa menjawab, dan layar kelas yang dibuka lagi menampilkan sisa waktu dan papan yang benar.

### Anggaran ukuran (usulan 6a)

- **P-20.** `anggaran.mjs` membaca `dist-jejak/client` dan berkas peta di `app/jejak-setara/peta/`, lalu menghitung setiap butir Architecture 11.3 dengan gzip level 9:
  1. **Kode layar pemain:** semua JS dan CSS yang dimuat `index.html`, termasuk `modulepreload`; batas 200 KB.
  2. **Kode konsol:** JS dan CSS yang dimuat `admin/index.html`; batas 350 KB. Potongan yang dimuat dinamis dicatat terpisah.
  3. **Seluruh aset layar pemain:** jumlah ukuran berkas non-JS/CSS yang dirujuk kode layar pemain, kecuali berkas khusus layar kelas (`sfx_akhir`, `musik_kelas`); batas 2 MB.
  4. **Batas per jenis berkas:** lembar ubin per masa 60 KB, strip avatar atau tokoh 6 KB, efek suara pendek 30 KB, `sfx_akhir.wav` 160 KB, dan `musik_kelas.wav` 1 MB.
  5. **Kedua berkas peta JSON:** batas 60 KB (gzip).

  Pemetaan awalan nama berkas ke jenis ditulis sebagai tabel di skrip. Ukuran dijumlahkan per jenis, bukan dicocokkan per nama berkas, karena nama aset kembar bisa bertukar antar-build.
- **P-21.** Skrip mencetak tabel butir, ukuran, batas, dan status, dengan kode keluar 1 bila ada butir yang melewati batas. Dengan `--ringkasan`, tabel juga ditulis ke `$GITHUB_STEP_SUMMARY`. Di "Jejak: uji", langkah "Periksa anggaran ukuran" berjalan sesudah `build:jejak`.
- **P-22.** Angka 382,9 KB di Plan menghitung semua WAV yang dirujuk potongan bersama, termasuk jingle akhir khusus layar kelas. P-20 butir 3 mengikuti Architecture 11.3 dan tidak menghitungnya.

### Perbaikan kinerja (usulan 7a)

- **P-23. Layar Kode lebih dulu.** Diberikan halaman pemain dibuka, maka layar Kode dirender tanpa menunggu gambar dunia. `muatAsetDunia` baru dimulai sesudah dua bingkai animasi dan saat peramban senggang, paling lambat 1 detik sesudah layar Kode tampil. Paling banyak 6 gambar dimuat bersamaan (penjadwal kecil yang diuji terpisah). Perilaku JS-07 dan P-50 JS-03 tetap:
  - tombol "Masuk" dan kode yang dikirim sebelum aset siap tetap menunggu aset;
  - alamat `?kode=` diperiksa sesudah aset siap;
  - gambar yang gagal dicoba lagi.

  Sasaran: dengan `ukur-muat.mjs` (cara percobaan Plan), median layar Kode siap ≤ 2 detik pada 10 Mbps, latensi 40 ms, dan CPU 4× lebih lambat (sebelumnya 5,04 detik), dan tidak lebih lambat dari 1,2 detik pada CPU normal. Waktu sampai aset dunia siap ikut dilaporkan.
- **P-24. Kiriman lobi.** `DUNIA_LOBI.jedaMs` naik dari 100 menjadi 200 ms di status `lobi` dan `hitung_mundur`; kerangka penuh tetap setiap 1.000 ms. Di layar pemain, tunda tampilan pemain lain di kedua status itu paling sedikit 220 ms (di status `main` tetap 120–250 ms, P-20 JS-07), agar gerak di lobi tetap halus. Sasaran `sim:beban` lokal 1 × 50 dengan bot yang terus berjalan di lobi: `dunia` ≤ 5,5 per pemain per detik dan ≤ 3 MB per pemain per 15 menit (sebelumnya 11,85 dan 5,88 MB).
- **P-25. Layar kelas di konsol.** `LayarKelas` (`#/kelas/{id}`) dimuat dengan impor dinamis (`React.lazy` dan `Suspense`), sehingga potongan kodenya tidak dimuat di halaman konsol lain. Selama dimuat, layar menampilkan "Memuat layar kelas…". Bila potongan gagal dimuat (misalnya berkas lama sudah hilang sesudah deploy), layar menampilkan pesan gagal dan tombol "Muat ulang".
- **P-26. Penanda versi konsol.** Saat dimuat, konsol mencatat nama berkas `admin-*.js` yang sedang berjalan. Pemeriksaan dilakukan saat tab kembali terlihat, saat rute berubah, dan saat respons API gagal diurai, paling sering sekali per 60 detik. Setiap pemeriksaan mengambil `/admin/` dengan `cache: "no-store"` dan membandingkan nama berkas itu.
  - Bila berbeda, banner tampil di atas isi halaman konsol (`role="status"`), berisi teks final dan tombol "Muat ulang", sampai halaman dimuat ulang.
  - Banner tidak tampil di layar kelas, yang sudah memakai pemeriksaan `PROTOKOL_VERSI`.
  - Permintaan berkas statis tidak ditagih Cloudflare.

### Waktu pulang-pergi dari HP (usulan 4a)

- **P-27.** HP pemain mengukur waktu pulang-pergi dari pasangan `ping`/`pong` yang sudah ada (setiap 5 detik), lalu menyertakan nilai terakhirnya di `ping` berikutnya sebagai `rttMs`. Nilainya bilangan bulat yang dijepit 0–60.000. `ping` pertama tanpa `rttMs`.
- **P-28.** Server hanya menghitung `rttMs` dari sambungan pemain, bukan layar kelas, ke histogram per 10 ms (0–2.000 ms, ditambah satu kotak di atas 2.000 ms) di memori Durable Object, sejak ruang dibuat sampai ruang berakhir. Median dan p95 diambil dari batas atas kotak, ditambah jumlah sampel. Tidak ada nilai per pemain yang disimpan.
- **P-29.** `pemakaian` (JS-22) mendapat `rttMedianMs`, `rttP95Ms` (null bila sampel 0), dan `rttSampel`. Bagian "Pemakaian ronde ini" di detail ruang (hanya admin) menampilkan tiga baris baru. Bot `sim:beban` juga mengirim `rttMs`, sehingga uji beban mencatat angka sisi server.
- **P-30.** `PROTOKOL_VERSI` naik dari 3 ke 4, karena pesan memakai `.strict()` dan server lama akan menolak `ping` yang memuat `rttMs`. HP dan layar kelas yang masih memuat kode lama mendapat `VERSI_BERBEDA` dan diminta memuat ulang (perilaku yang sudah ada).

### Dokumen (usulan 9a dan 10a)

- **P-31.** Di Build, dokumen utama dan `PLAN.md` diperbarui sebagai berikut:
  - **Architecture 13:** urutan Workers Paid, lalu peringatan anggaran dan batas pakai; batas pakai tanpa email dan kembali ke nol di tanggal langganan; pembulatan kelebihan; tarif Workers Logs mulai 1 Desember 2026; dan angka hasil uji beban.
  - **Architecture 14:** baris Beban dan Jaringan menunjuk alat P-10 sampai P-19.
  - **Architecture 18:** langkah 3 (basis data produksi) menjadi "sebelum Build JS-16", dan urutan langkah pengaman biaya.
  - **PRD 14 dan 21, serta AGENTS 0 dan 5:** Workers Paid aktif sejak tanggal yang dilaporkan pemilik proyek.
  - **AGENTS 6 dan 7 butir 16:** P-9.
  - **PRD 12:** angka hasil uji.
  - **`PLAN.md`:** catatan bahwa Worker produksi, D1 produksi, `jejak-produksi.yml`, semai produksi, pilihan produksi di "Jejak: admin awal" dan "Jejak: hentikan", serta `limits.cpu_ms` produksi menjadi bagian JS-16.

## Beberapa pemain sekaligus

- `s2` menjalankan 10 ruang × 50 bot dari lima mesin GitHub dengan alamat IP berbeda. Setiap mesin membuka paling banyak 4 sambungan per detik (P-5), dan semua ruang mulai bersama (P-7).
- `s3` menguji satu Durable Object dengan 100 pemain, sekitar 500–740 pesan per detik, di bawah batas lunak sekitar 1.000 permintaan per detik per objek.
- Histogram pulang-pergi (P-28) menggabungkan semua HP di satu ruang. Ruang lain tidak tercampur.
- Batas kiriman lobi (P-24) berlaku per ruang. Setiap pemain tetap menerima kerangka penuh setiap 1.000 ms.
- Putus satu pemain (P-16, P-17) tidak mengubah ronde pemain lain.

## Status antarmuka

| Layar | Status | Tampilan |
|---|---|---|
| Layar Kode pemain | Biasa | Isian kode dan tombol "Masuk" tampil sebelum aset dunia selesai dimuat (P-23) |
| Layar Kode pemain | Memuat aset | Tidak ada tampilan tambahan. Bila "Masuk" ditekan sebelum aset siap, tombol menunjukkan status memeriksa yang sudah ada sampai aset siap |
| Layar Kode pemain | Galat aset | Seperti sekarang: dicoba lagi dua kali dengan jeda 2 detik |
| Ronde pemain | Terputus, menyambung ulang | Teks dan tampilan JS-03/JS-07 yang sudah ada (P-16, P-17) |
| Konsol | Biasa | Tanpa banner |
| Konsol | Versi baru tersedia | Banner `versiKonsol.baru` dengan tombol `versiKonsol.muatUlang`; tetap tampil saat berpindah halaman |
| Layar kelas | Memuat | `kelas.memuatLayar` di tengah layar |
| Layar kelas | Gagal dimuat | `kelas.gagalMuatLayar` dengan tombol `versiKonsol.muatUlang` |
| Detail ruang, Pemakaian ronde ini | Kosong | Baris median dan p95 berisi `detail.pemakaianKosong`, dan baris sampel berisi 0 |
| Detail ruang, Pemakaian ronde ini | Ada | Median dan p95 dengan `detail.pemakaianMs`, sampel sebagai angka |

## Teks yang tampil (final)

Teks konsol dan layar kelas berada di `teks-konsol.ts` (Architecture 17). `{n}` dan `{p}` diisi antarmuka. Layar pemain tidak mendapat teks baru.

**Konsol dan layar kelas (`teks-konsol.ts`), baru**

| Tempat | Kunci | Teks |
|---|---|---|
| Baris pemakaian waktu pulang-pergi | `detail.pemakaianRttMedian` · `detail.pemakaianRttP95` · `detail.pemakaianRttSampel` | Waktu pulang-pergi HP, median · Waktu pulang-pergi HP, p95 · Sampel waktu pulang-pergi |
| Nilai waktu pulang-pergi | `detail.pemakaianMs` · `detail.pemakaianKosong` | {n} ms · Belum ada data |
| Banner versi konsol | `versiKonsol.baru` · `versiKonsol.muatUlang` | Versi konsol yang baru sudah tersedia. Muat ulang halaman agar tampilan dan data cocok. · Muat ulang |
| Layar kelas dimuat dinamis | `kelas.memuatLayar` · `kelas.gagalMuatLayar` | Memuat layar kelas… · Layar kelas gagal dimuat. Muat ulang halaman. |

**Konsol (`teks-konsol.ts`), diubah (bila D-1 a disetujui)**

| Tempat | Kunci | Teks |
|---|---|---|
| Nilai pemakaian dengan persen | `detail.pemakaianNilai` | {n} ({p}% kuota bulanan Workers Paid) |

Ringkasan run alur kerja dan keluaran skrip berbahasa Indonesia, tetapi bukan teks antarmuka, jadi tidak masuk `teks-konsol.ts`.

## Data, protokol, API, dan migrasi

- **Protokol:** `PROTOKOL_VERSI` 3 → 4 (P-30). `ping` menjadi `{ v: 4, t: "ping", tKlien, rttMs? }` dengan `rttMs: z.number().int().min(0).max(60000).optional()`. Pesan lain tidak berubah.
- **Skema konsol:** `skemaPemakaian` mendapat:
  - `rttMedianMs: z.number().int().min(0).nullable()`;
  - `rttP95Ms: z.number().int().min(0).nullable()`;
  - `rttSampel: z.number().int().min(0)`.

  Bila D-1 a disetujui, `KUOTA_HARIAN_GRATIS` diganti `KUOTA_BULANAN_BERBAYAR = { permintaan: 1000000, barisDitulis: 50000000 }`. Persen permintaan Durable Object dihitung dari kuota permintaan, dan persen baris D1 serta baris penyimpanan ruang dari kuota baris ditulis.
- **API:** tidak ada rute baru. Dipakai: `POST /api/ruang` (ruang uji), `GET` dan `DELETE /api/ruang/{id}`, dan `/api/sehat` (kini menjawab `protokol: 4`).
- **Migrasi D1:** tidak ada.
- **Konfigurasi Worker:** P-1.
- **Alur kerja:** baru `jejak-uji-beban.yml` (P-10 sampai P-13), dan langkah anggaran di `jejak-uji.yml` (P-21).

## Aset

Tidak ada aset baru.

## Keamanan dan privasi

- Waktu pulang-pergi hanya disimpan sebagai histogram per ruang di memori Durable Object, tanpa nama atau id pemain, dan hanya tampil untuk admin. Nilainya tidak masuk CSV dan tidak disimpan di D1 (D-3).
- Akun uji beban adalah admin khusus. Email dan sandinya hanya ada di rahasia GitHub, yang disamarkan di log. Alur kerja hanya bisa membaca isi repositori, hanya menuju alamat lingkungan uji yang ditulis di berkasnya, dan berhenti bila `/api/sehat` tidak menyebut `lingkungan: "uji"`.
- Proksi jaringan hanya mendengar di `127.0.0.1`.
- `ITERASI_SANDI` 100.000 memperkuat hash sandi, dan `limits.cpu_ms` membatasi kode yang berputar tanpa henti.
- Data ruang uji beban dihapus sesudah run (P-8).

## Di luar cakupan

- Lingkungan produksi dan semua alur kerjanya (JS-16, usulan 9a), serta domain sendiri (KT-06).
- Token analitik Cloudflare dan pembacaan Metrics otomatis. Metrics dinilai dari tangkapan layar pemilik proyek.
- Profil CPU (`workers-profiling`), kecuali bila uji beban menunjukkan CPU tinggi. Bila itu terjadi, perbaikannya diusulkan ke pemilik proyek lebih dulu.
- Penyimpanan waktu pulang-pergi di D1 (D-3 b).
- Uji coba kelas dan pemeriksaan manual ≥ 30 fps di HP Android kelas bawah (JS-16).
- Perubahan bank kejadian, naskah, aset, Sehari Setara, dan galeri.

## DRAF untuk ditinjau pemilik proyek

- **D-1. Persen pemakaian di konsol sesudah Workers Paid.** Teks sekarang, "{n} ({p}% kuota harian paket gratis)", tidak lagi tepat karena kuota paket berbayar dihitung per bulan.
  - (a, saran) Persen kuota bulanan Workers Paid: 1 juta permintaan Durable Object dan 50 juta baris ditulis. Satu ronde 50 pemain sekitar 1,8% kuota permintaan.
  - (b) Persen dihapus, hanya angka.
  - (c) Dibiarkan.
- **D-2. Jadwal uji beban.**
  - (a, saran) Pemilik proyek menjalankan `singkat` lebih dulu (sekitar 10 menit). Bila hijau, lanjut ke `s1`, `s2`, dan `s3` berurutan di satu hari tanpa kelas (masing-masing 25–30 menit), lalu `lokal-10x50`. Sesudah setiap run, artifact dan ringkasannya dikirim ke chat.
  - (b) Hanya `singkat` dan `s2`.
- **D-3. Penyimpanan waktu pulang-pergi.**
  - (a, saran) Hanya di "Pemakaian ronde ini" selama Durable Object ruang masih aktif. Saat uji coba kelas JS-16, angkanya diambil sebagai tangkapan layar sesudah ronde selesai.
  - (b) Disimpan ke D1 saat ronde selesai (migrasi `0003`, tambahan kerja).
- **D-4. Jarak kiriman `dunia` di lobi.**
  - (a, saran) 200 ms (paling sering 5 kali per detik).
  - (b) 150 ms: lebih halus, tetapi perkiraan data lobi sekitar 3,9 MB per 15 menit, di atas batas 3 MB.

## Kriteria penerimaan

**Pengaturan dan alat**

- [ ] AC-1 `wrangler.jsonc` lingkungan uji memuat `limits.cpu_ms` 1.000, `RUANG_AKTIF_MAKS` `"12"`, dan `ITERASI_SANDI` `"100000"`, sedangkan pengaturan tingkat atas tidak berubah (diuji `kerangka.test.ts`). Sesudah deploy, "Jejak: uji" hijau dan `/api/sehat` menjawab `protokol: 4` (P-1).
- [ ] AC-2 Akun lama di lingkungan uji bisa masuk, dan hash-nya diperbarui ke 100.000 iterasi (uji server dan pemeriksaan D1 lewat konektor, P-2).
- [ ] AC-3 `perkiraanBiaya` diuji unit untuk kelima skenario P-12. `sim:beban --sasaran uji` menolak tanpa `--saya-paham-biaya` dan menolak perkiraan di atas 400.000 permintaan, dengan pesan yang jelas; pengaman 20.000 sudah hilang (P-3, P-4).
- [ ] AC-4 Bergabung bertahap paling banyak 4 sambungan per detik per proses, bot pengukur sepi, `--mulai-pada`, serta pencatatan dan penghapusan pemakaian diuji unit atau di Worker lokal (P-5 sampai P-8).
- [ ] AC-5 `jejak-uji-beban.yml` memenuhi P-10 sampai P-13: input dan konfirmasi, izin baca saja, `concurrency`, batas 40 menit, `package-manager-cache: false`, pemeriksaan rahasia dan `/api/sehat`, matriks `s2` lima pekerjaan, artifact, dan ringkasan (diuji `kerangka.test.ts`). `gabung-beban.mjs` diuji unit untuk lulus dan gagal setiap ambang P-14.

**Uji beban (lingkungan uji, dijalankan pemilik proyek)**

- [ ] AC-6 `singkat` hijau.
- [ ] AC-7 `s1` hijau.
- [ ] AC-8 `s2` hijau, termasuk kesepuluh ruang berstatus `main` bersamaan sedikitnya 14 menit.
- [ ] AC-9 `s3` hijau.
- [ ] AC-10 `lokal-10x50` hijau, sehingga catatan AC-20 JS-03 tertutup.
- [ ] AC-11 Tangkapan layar pemilik proyek menunjukkan Metrics Worker uji selama rentang uji tanpa `exceededCpu` dan tanpa galat Durable Object, serta Billable Usage tanpa biaya di luar langganan. Ekspor CSV ruang `s3` berhasil sebelum datanya dihapus (dijalankan dengan `--simpan-ruang`, lalu dihapus dari konsol).

**Ketahanan jaringan**

- [ ] AC-12 Putus 30 detik lewat proksi: pemain kembali dengan nama, avatar, dan skor yang sama, dan kejadian terjawab tetap terhitung (`jaringan.uji.ts`, P-16).
- [ ] AC-13 Putus 2 menit: hasil sama dengan AC-12, ronde tetap berjalan, dan pemain lain di ruang itu tidak terputus (P-17).
- [ ] AC-14 Latensi 300 ms dengan jitter 50 ms: pemain di peramban bisa berjalan dan menjawab, dan `sim:beban` lokal 1 × 50 mencatat gerak jujur dikoreksi kurang dari 1% (P-18).
- [ ] AC-15 Layar kelas ditutup 60 detik lalu dibuka lagi: ronde tetap berjalan dan sisa waktu serta papan benar (P-19).

**Anggaran ukuran**

- [ ] AC-16 `anggaran.mjs` diuji unit dengan folder build tiruan, di bawah dan di atas setiap batas. Kode keluarnya 1 bila ada yang terlampaui. Langkah "Periksa anggaran ukuran" ada di "Jejak: uji" sesudah `build:jejak` (P-20, P-21).
- [ ] AC-17 Build JS-15 memenuhi semua butir anggaran, dan tabelnya dicatat di laporan (P-20).

**Perbaikan kinerja**

- [ ] AC-18 Median layar Kode siap ≤ 2 detik pada 10 Mbps, 40 ms, CPU 4× lebih lambat, dan ≤ 1,2 detik pada CPU normal (`ukur-muat.mjs`, tiga kali, sebelum dan sesudah dicatat). Penjadwal muat diuji unit: paling banyak 6 gambar bersamaan dan mulai sesudah layar Kode tampil. Uji JS-07 tentang "Masuk" yang menunggu aset dan `?kode=` tetap lulus (P-23).
- [ ] AC-19 `sim:beban` lokal 1 × 50 dengan bot yang terus berjalan di lobi: `dunia` ≤ 5,5 per pemain per detik dan ≤ 3 MB per pemain per 15 menit. Tunda tampilan per status diuji unit (220 ms di `lobi` dan `hitung_mundur`, 120–250 ms di `main`), dan uji JS-07 tentang gerak pemain lain tetap lulus (P-24).
- [ ] AC-20 Layar kelas berada di potongan kode terpisah yang tidak dimuat dasbor (`anggaran.mjs` mencatatnya). Uji ujung ke ujung melihat "Memuat layar kelas…" atau langsung layar kelas, lalu layar kelas tampil. Kode konsol awal tidak lebih besar dari sebelum JS-15 (P-25).
- [ ] AC-21 Uji ujung ke ujung mengganti jawaban `/admin/` dengan nama `admin-*.js` lain. Sesudah rute berubah, banner `versiKonsol.baru` tampil dengan tombol "Muat ulang", dan banner tidak tampil di layar kelas. Pemeriksaan tidak lebih sering dari sekali per 60 detik (uji unit, P-26).

**Waktu pulang-pergi**

- [ ] AC-22 `ping` dengan `rttMs` diterima, `rttMs` di luar 0–60.000 atau bukan bilangan bulat ditolak, dan `PROTOKOL_VERSI` 4 (uji unit protokol). Histogram dan persentil diuji unit. Uji server memastikan median, p95, dan sampel muncul di `pemakaian`, dan `ping` layar kelas tidak dihitung. Uji ujung ke ujung melihat ketiga baris dengan teks final di detail ruang admin (P-27 sampai P-29).
- [ ] AC-23 Klien dengan versi protokol 3 mendapat `VERSI_BERBEDA` (uji yang sudah ada, diperbarui ke versi 4; P-30).

**Dokumen dan regresi**

- [ ] AC-24 Dokumen di P-31 diperbarui, dan teks D-1 sesuai keputusan pemilik proyek.
- [ ] AC-25 Semua lulus: `content:check:jejak`, `test:jejak`, `test:jejak:server` (semua berkas), `test:e2e:jejak` (semua berkas), ESLint keempat folder Jejak Setara, dan `tsc --noEmit`. `build:pages` menghasilkan 178 berkas yang identik dengan galeri.

## Rencana uji

### Uji unit (`test:jejak`)

- `__tests__/beban/biaya.test.ts`: `perkiraanBiaya` untuk kelima skenario, serta batas 400.000 (AC-3).
- `__tests__/beban/gabung.test.ts`: penggabungan hasil beberapa pekerjaan, setiap ambang P-14 lulus dan gagal, dan tumpang tindih `main` di `s2` (AC-5, AC-8).
- `__tests__/beban/anggaran.test.ts`: folder build tiruan, pemetaan jenis, pengecualian berkas khusus layar kelas, dan kode keluar (AC-16).
- `__tests__/beban/penjadwal.test.ts`: penjadwal muat dengan pewaktu tiruan, paling banyak 6 bersamaan, dan urutan mulai (AC-18).
- `__tests__/beban/rtt.test.ts`: histogram, median, p95, kotak di atas 2.000 ms, dan sampel 0 (AC-22).
- Tambahan di uji yang ada:
  - protokol: `ping` dengan `rttMs` dan `PROTOKOL_VERSI` 4;
  - `pemainLain`: tunda per status;
  - `inti-ruang`: jarak kiriman lobi 200 ms;
  - `kerangka.test.ts`: `wrangler.jsonc`, kedua alur kerja, teks final JS-15, dan aturan AGENTS 7 butir 16.

### Uji server (`test:jejak:server`)

- Bot WebSocket mengirim `rttMs`, dan `GET /api/ruang/{id}` mengembalikan median, p95, dan sampel; `ping` layar kelas tidak dihitung (AC-22).
- Hash 4.000 iterasi diperbarui saat masuk dengan pengaturan 100.000 (AC-2).

### Uji ujung ke ujung (`test:e2e:jejak`)

- `jaringan.uji.ts`: putus 30 detik, putus 2 menit, latensi 300 ms dengan jitter 50 ms, dan layar kelas ditutup lalu dibuka lagi, dengan beberapa konteks peramban (guru dan dua pemain) di belakang proksi (AC-12 sampai AC-15).
- Konsol: banner versi lewat `page.route` untuk `/admin/` dan layar kelas yang dimuat dinamis (AC-20, AC-21).
- Detail ruang: tiga baris waktu pulang-pergi (AC-22).
- Semua uji yang ada dijalankan ulang, terutama JS-07 (aset, `?kode=`, gerak pemain lain) dan JS-10 (layar kelas).

### Beban dan ukuran

- `sim:beban` lokal 1 × 50 dengan bot yang terus berjalan di lobi, sebelum dan sesudah P-24 (AC-19), dan dengan latensi 300 ms (AC-14).
- `ukur-muat.mjs` sebelum dan sesudah P-23, dengan profil percobaan Plan (AC-18).
- `anggaran.mjs` pada build JS-15 (AC-17).
- Alur kerja "Jejak: uji beban" dijalankan pemilik proyek sesuai D-2 sesudah ZIP Build di-push (AC-6 sampai AC-11). Laporan memakai artifact `hasil-uji-beban.json`, tangkapan layar Metrics dan Billable Usage, serta pemeriksaan D1 lewat konektor Cloudflare di chat.

### Manual (AGENTS 9) dan lingkungan uji

- Wifi HP dimatikan 30 detik saat ronde di lingkungan uji, lalu dinyalakan lagi: pemain kembali dengan skor yang sama.
- Konsol yang terbuka saat deploy: banner versi muncul sesudah tab kembali terlihat atau rute berubah.
- Layar Kode di HP pemilik proyek terasa langsung tampil.
- Bagian "Pemakaian ronde ini" menampilkan waktu pulang-pergi HP pemilik proyek.

## Catatan Build (23 November 2026)

- **Workers Paid:** tanggal aktif dicatat 23 November 2026 dari laporan pemilik proyek ("sudah membayar langganan"). Tangkapan layar peringatan anggaran dan batas pakai belum diterima; keduanya wajib terpasang sebelum ZIP Build di-push.
- **Proksi jaringan (P-15):** dua kesalahan di alat uji sendiri ditemukan dan diperbaiki saat Build. Jawaban terpotong bila sambungan ditutup sebelum data tertunda terkirim, dan urutan potongan bisa tertukar karena pewaktu Node dengan lama berbeda tidak dijamin berurutan; kini setiap arah memakai satu antrean dan satu pewaktu.
- **Penanda versi konsol (P-26):** menu konsol berpindah dengan `history.pushState`, bukan perubahan alamat yang memicu `hashchange`, jadi pemeriksaan dipicu perubahan rute di React (termasuk sekali saat konsol dimuat). Banner dipasang di kedua tata letak konsol (biasa dan ganti sandi wajib).
- **Layar Kode lebih dulu (P-23, AC-18):** dengan `ukur-muat.mjs` di mesin yang sama, layar Kode siap 4,25 → 1,20 detik pada 10 Mbps dengan CPU 4× lebih lambat, 0,99 → 1,05 detik pada CPU normal, dan 3,04 → 2,33 detik pada 3 Mbps. Gambar dunia selesai lebih lambat di CPU 4× (95% termuat pada 3,07 → 5,18 detik), karena pemuatannya kini mulai sesudah layar Kode tampil dan paling banyak 6 sekaligus. Bergabung lewat `?kode=` menunggu gambar itu (P-50 JS-03), jadi pembantu `gabung` di `kejadian.uji.ts` kini menunggu sampai 20 detik. Lewat latensi 300 ms pulang-pergi, Worker lokal (HTTP/1.1) butuh 16,4 detik sampai layar nama; batas 6 gambar ditinjau sesudah uji beban jarak jauh, karena Cloudflare memakai HTTP/2.
- **Waktu pulang-pergi (P-27 sampai P-29):** ringkasan pemakaian di D1 (`ruang.ringkasan_json`) sengaja tidak memuat nilai ini (D-3 a), walaupun ringkasan itu sudah ditulis saat ruang ditutup; menyimpannya hanya butuh mengubah satu baris bila kelak diinginkan, tanpa migrasi.
- **Kiriman lobi (P-24, AC-19), D-5 untuk pemilik proyek:** dengan D-4 a (200 ms), 50 bot yang terus berjalan di lobi menerima 5,75 `dunia` per detik dan 3,67 MB per 15 menit, di atas sasaran AC-19 (≤ 5,5 dan ≤ 3 MB). Percobaan sementara (dikembalikan sesudahnya): 200 ms dengan kerangka penuh setiap 3 detik 5,80 dan 3,49 MB; 300 ms 4,70 dan 3,05 MB; 300 ms dengan kerangka penuh setiap 3 detik 4,83 dan 2,91 MB. Usulan D-5: (a, saran) 300 ms dan kerangka penuh setiap 3 detik di lobi dan hitung mundur, dengan tunda tampilan lobi paling sedikit 320 ms; (b) tetap 200 ms dan sasaran lobi menjadi ≤ 4 MB, karena batas 3 MB PRD 12 berlaku untuk ronde (ronde sendiri 2,06 MB); (c) 300 ms saja. ZIP Build memakai D-4 a sesuai spesifikasi yang disetujui; pilihan D-5 diterapkan bersama laporan Test.
- **Potongan kode:** impor dinamis layar kelas membuat bundler memisahkan satu potongan bersama kecil (`sfx_peringatan-*.js`) yang juga dimuat layar pemain; kode layar pemain tetap 139,6 KB dari batas 200 KB, dan kode konsol turun 141,2 → 135,5 KB.
- **Uji lama yang disesuaikan:** `kelas.uji.ts` kini mengharapkan "kuota bulanan Workers Paid" (D-1 a), dan uji jarak kiriman lobi di `inti-ruang.test.ts` mengikuti P-24.

