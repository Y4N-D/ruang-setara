# JS-16b — Huruf VT323, kode QR, dan kode masuk ulang

Status: **Spesifikasi (25 Nov 2026)**, menunggu `Spesifikasi disetujui: JS-16b`. Dasar: Gerbang 1 JS-16 (usulan 8d, 9a, 10a, dan 15a) dan Plan lanjutan JS-16b (`Setuju: JS-16b`, usulan 1 sampai 7 = a).

## Ringkasan

JS-16b menyiapkan tampilan rilis 1.0. Isinya:

1. **Huruf VT323** menggantikan Press Start 2P dan Pixelify Sans di Jejak Setara, lewat dua token pusat dan penyesuaian tinggi huruf kapital.
2. **Kode QR** di lobi layar kelas, lengkap dengan tampilan "Perbesar QR".
3. **Kode masuk ulang**, untuk siswa yang berganti HP di tengah sesi.
4. **Tombol lobi 48 px.**
5. **Pilihan lingkungan "pilih"** di "Jejak: admin awal".
6. **Dua perbaikan uji** yang tertunda dari JS-16a.

Sehari Setara dan galeri tidak berubah. Tidak ada rilis produksi di akhir JS-16b; produksi naik ke v1.0 sesudah panduan guru (JS-16c).

## Kaitan PRD

- JFR-03 (kode QR) dan JFR-07 (kode masuk ulang), rilis 1.0 (PRD 17).
- KT-07: pembuat QR ditulis sendiri, tanpa dependensi.
- PRD 12: peramban sasaran. PRD 16: keterbacaan dari 8 m diukur saat uji coba kelas.
- Design System 0, 3.6, 5, dan 15. Architecture 1, 6, 7, dan 10.
- Catatan Plan JS-14 (tombol lobi), catatan penerimaan JS-16a ("Jejak: admin awal"), dan penyimpangan 1 dan 2 JS-16a.

## Perilaku

### A. Huruf VT323

- **P-1 Paket.** `@fontsource/vt323` 5.3.0 ditambahkan ke `dependencies`, ditulis persis seperti kedua paket huruf lama. `web/jejak-setara/main.tsx` dan `web/jejak-setara/admin/main.tsx` mengimpor `@fontsource/vt323/latin-400.css` dan tidak lagi mengimpor Press Start 2P serta Pixelify Sans. Kedua paket lama tetap terpasang untuk Sehari Setara.
- **P-2 Token pusat.** Di `:root` dalam `jejak.css`, di samping `--js-huruf-sistem`, ditambahkan empat token:

  ```css
  --js-huruf-judul: "VT323", monospace;
  --js-huruf-judul-sesuai: cap-height 1;
  --js-huruf-teks: "VT323", monospace;
  --js-huruf-teks-sesuai: cap-height 0.7;
  ```

  **Diubah di Test JS-16b (25 Nov 2026), diterima pemilik proyek (penyimpangan 1a dan 2a):** `--js-huruf-teks-sesuai` menjadi `cap-height 0.64`, karena 0,7 membuat pilihan jawaban di HP 640 × 360 meluap 27 px; dengan 0,64 tinggi huruf kecil VT323 sama dengan huruf teks lama. Ditambah dua token tinggi baris, `--js-huruf-judul-baris: 1` dan `--js-huruf-teks-baris: 1.2`, untuk aturan yang dulu memakai tinggi baris `normal`.

  Setiap aturan yang dulu memakai Press Start 2P kini memakai `font-family: var(--js-huruf-judul); font-size-adjust: var(--js-huruf-judul-sesuai);`. Setiap aturan yang dulu memakai Pixelify Sans kini memakai pasangan token teks.

  Nama huruf hanya ditulis di keempat token itu; `jejak.css` dan `kelas.css` tidak lagi menulis nama huruf langsung. Angka ukuran huruf di Design System 5 tidak berubah. Huruf sistem untuk tabel dan formulir konsol (KT-05) juga tidak berubah.
- **P-3 Label nama di kanvas.** `LayarDunia.tsx` membaca nama huruf dari token `--js-huruf-teks` (lewat `getComputedStyle`) dan mengalikan ukuran label 13 px dengan `FAKTOR_HURUF_TEKS = 0.7 / 0.56`, sehingga menjadi 16,25 px. Pemuatan dan pemeriksaan huruf (`document.fonts`) memakai nama dari token yang sama.
- **P-4 Kredit.** `TEKS.tentang.kreditHuruf` dan `TEKS_KONSOL…kreditHuruf` menjadi "Huruf VT323, SIL Open Font License 1.1."
- **P-5 Tanda minus.** Aturan "tanpa tanda minus" untuk huruf judul (Design System 5) dicabut, karena VT323 punya tanda minus.

### B. Kode QR di lobi layar kelas

- **P-6 Pembuat QR.** Modul baru `app/jejak-setara/admin/kelas/qr.ts` memakai mode byte (UTF-8), koreksi galat M, versi 1 sampai 10, dan pilihan mask menurut penalti ISO/IEC 18004, mengikuti implementasi rujukan Nayuki (MIT).
  - Fungsi `buatQR(teks)` mengembalikan `{ versi, mask, ukuran, modul }`.
  - Teks yang lebih panjang dari kapasitas versi 10 (213 byte) melempar galat.
  - Modul ini hanya dimuat layar kelas, tidak ikut ke layar pemain.
- **P-7 Isi QR.** Isinya alamat gabung `new URL("/?kode=" + kode, info.tautan).href`. Karena itu, lingkungan uji dan produksi masing-masing benar tanpa alamat yang ditulis di kode.
- **P-8 Kotak kanan lobi.** Kotak `js-kelas-cara` berisi gambar QR, menggantikan tiga langkah bergabung (D-1a). Rinciannya:
  - QR berupa SVG `shape-rendering="crispEdges"`, modul `ink` di atas putih dengan zona tenang 4 modul, sisinya sedikitnya 36u, dan warnanya sama di mode gelap.
  - Di bawah QR ada satu kalimat keterangan dan tombol "Perbesar QR" dengan `<kbd>Q</kbd>`.
  - Kotak kiri tetap berisi alamat dan kode ruang.
- **P-9 Perbesar QR.** Tombol atau tombol `Q` membuka lapisan setinggi layar berisi QR (sisi `min(80vh, 80vw)`), alamat, dan kode ruang, dengan tombol "Tutup" `<kbd>Esc</kbd>`.
  - `Esc` atau `Q` menutupnya, lalu fokus kembali ke tombol "Perbesar QR".
  - Selama lapisan terbuka, `L` dan `Spasi` tidak menjalankan apa pun.
  - Lapisan tertutup sendiri saat ronde dimulai.
- **P-10 Tanpa jaringan.** QR dibuat di peramban dari teks di atas, tanpa permintaan ke luar.

### C. Kode masuk ulang

- **P-11 Membuat kode (konsol).** Di halaman detail ruang, setiap baris pemain yang sudah bernama dan belum dikeluarkan mendapat tombol "Kode masuk ulang" di samping "Keluarkan". Tombol itu tersedia untuk admin dan guru pemilik ruang, selama ruang belum ditutup.
  - Tombol memanggil `POST /api/ruang/{id}/kelola` dengan `{ "aksi": "kode_masuk_ulang", "pemainId": "…" }`.
  - Jawabannya `200 { "kode": "K7M2PA", "berlakuSampai": 1764067200000 }`.
  - Dialog menampilkan kode dengan huruf judul, petunjuk, jam berlaku dan sisa waktu (diperbarui setiap detik), serta tombol "Salin kode" dan "Tutup".
  - Saat waktunya habis, kode diganti kalimat bahwa kode sudah tidak berlaku.
- **P-12 Aturan kode.**
  - Kode terdiri dari 6 karakter acak kriptografis dari `ABJAD_KODE` dan berlaku 10 menit.
  - Setiap pemain hanya punya satu kode aktif; kode baru menggantikan yang lama.
  - Yang disimpan hanya hash SHA-256 dari kode yang dinormalkan, bersama `pemain_id` dan `berlaku_sampai`, di tabel SQLite ruang `kode_masuk_ulang`. Kode tidak pernah disimpan, dicatat, atau dikirim ke layar kelas.
  - Pembuatan kode ditolak bila pemain tidak ada atau belum bernama (`404 PEMAIN_TIDAK_ADA`), pemain sudah dikeluarkan (`409 STATUS_TIDAK_SESUAI`), atau ruang sudah ditutup (`404 RUANG_TIDAK_ADA`).
  - Satu baris log audit `ruang.kode_masuk_ulang` mencatat `pemainId`, tanpa kode (D-3a).
- **P-13 Memakai kode (HP baru).** Layar Kode di HP mendapat tombol teks "Masuk dengan kode dari guru". Tombol itu membuka layar dengan dua kotak: kode ruang (5 karakter, terisi otomatis dari `?kode=` bila ada) dan kode dari guru (6 karakter). Huruf kecil diterima dan dinormalkan.
  - Klien tersambung ke ruang lalu mengirim `halo` dengan `kodeMasukUlang` dan tanpa `token` maupun `nomorAbsen`.
  - Bila diterima, klien menyimpan token baru dari `selamat_datang` dan melanjutkan ke layar sesuai status ruang (lobi, ronde, rekap). Nama, avatar, skor, jawaban, penanda kejadian, dan muatan skill tetap sama.
- **P-14 Pemeriksaan di server.** Bila `halo` membawa `kodeMasukUlang`, inti ruang mencari kode aktif yang hash-nya cocok dan belum kedaluwarsa. Hash dihitung `RuangJejak` sebelum memanggil inti, seperti hash token.
  - **Bila cocok:**
    - kode dihapus (sekali pakai);
    - `hashToken` pemain diganti dengan hash token calon;
    - sambungan lama pemain itu ditutup dengan 4001;
    - pemain disambut dengan token calon, lalu mengikuti jalur sambung ulang yang ada (posisi, keadaan kejadian, dan `info_kelas`).
  - **Pemeriksaan yang dilewati:** ruang terkunci, penuh, terlambat, dan mode nomor absen tidak menahan masuk ulang. Ruang yang sudah ditutup tetap ditolak (`RUANG_TIDAK_ADA`), begitu juga pemain yang dikeluarkan (`DIKELUARKAN`, 4004).
  - **Bila tidak cocok atau kedaluwarsa:** server menjawab galat `KODE_MASUK_ULANG_SALAH` dan sambungan tetap terbuka, sehingga klien boleh mengirim `halo` lagi. Kesalahan ke-5 pada satu sambungan menutupnya dengan 1008 (D-2a). Kode salah dan kode kedaluwarsa dijawab sama.
- **P-15 Perangkat lama.** Kode 4001 masuk ke `TUTUP_BERHENTI`, sehingga perangkat yang sambungannya digantikan tidak menyambung ulang. Token di perangkat itu dihapus, lalu layar galat menampilkan pesan bahwa pemain sudah masuk dari perangkat lain, dengan tombol "Kembali" ke layar Kode (D-4a). Penggantian sambungan oleh muat ulang di tab yang sama tidak terpengaruh, karena penutupan sambungan lama tidak sampai ke tab yang sudah dimuat ulang.
- **P-16 Protokol.** `PROTOKOL_VERSI` naik dari 4 ke 5. Klien versi lama menerima 4005 dan diminta memuat ulang, seperti perubahan versi sebelumnya. Skema `kode_masuk_ulang` di `protokol-kelas.ts`, yang belum pernah dipakai, dihapus; kode dibuat hanya lewat rute `kelola`.

### D. Tombol lobi

- **P-17** `.js-kelas-tombol` di layar kelas memakai `min-height: max(48px, calc(7 * var(--u)))`, sehingga "Kunci ruang" dan "Mulai" sedikitnya 48 px di 1024 × 768 (sebelumnya 40,3 px).

### E. "Jejak: admin awal"

- **P-18** Pilihan `lingkungan` menjadi `pilih`, `uji`, dan `produksi`, dengan bawaan `pilih`.
  - Langkah "Periksa rahasia dan masukan" berhenti dengan pesan bila lingkungan bukan `uji` atau `produksi`, sebelum menyentuh Cloudflare.
  - "Jejak: hentikan" tidak berubah (bawaan `uji`).

### F. Uji yang tertunda

- **P-19** Pemeriksaan "Ruang sudah penuh" di `e2e/jejak-setara/gabung.uji.ts` menunggu sampai 20 detik, sama dengan pembantu `gabung()`.
- **P-20** Test menjalankan `skill.uji.ts` utuh dan sendirian sebelum berkas uji ujung ke ujung lainnya. Bila `:405` gagal di pemeriksaan kinerja, uji itu dijalankan juga di kode sebelum perubahan, lalu kedua hasilnya dicatat.

## Beberapa pemain sekaligus

- **Kode yang sudah dipakai.** Dua HP yang mengetik kode yang sama hampir bersamaan: hanya `halo` pertama yang diterima, dan HP kedua menerima `KODE_MASUK_ULANG_SALAH`, karena kode langsung dihapus.
- **Masuk ulang tidak menambah pemain.** Jumlah pemain dan batas ruang tidak berubah, karena pemainnya sama.
- **Saat ronde berjalan.** Pemain yang masuk ulang langsung kembali ke ronde dengan skor dan waktu yang sama. Pemain lain hanya melihat avatarnya tersambung lagi.
- **Saat dijeda.** Masuk ulang tetap bisa; pemain melihat layar jeda.

## Status antarmuka

| Layar | Keadaan |
|---|---|
| Lobi layar kelas | QR tampil sejak `info_kelas` pertama. Sebelum info tiba, kotak kanan kosong dengan bingkai. |
| Perbesar QR | Lapisan terbuka atau tertutup (P-9) |
| Konsol, dialog kode | Memuat (tombol nonaktif dan penanda memuat), kode tampil dengan hitung mundur, kode habis, atau gagal (pesan dan tombol "Coba lagi") |
| HP, layar masuk ulang | Kosong, galat format, memeriksa (tombol nonaktif), kode salah, terlalu sering (sesudah 1008), lalu berhasil dan lanjut |
| HP lama | Layar galat "perangkat lain" (P-15) |
| Semua layar | Huruf VT323 sesuai token; huruf sistem tetap di tabel dan formulir konsol |

## Teks yang tampil (final)

**Pemain (`TEKS`)**

| Kunci | Teks |
|---|---|
| `kode.masukUlang` | Masuk dengan kode dari guru |
| `masukUlang.judul` | Masuk dengan kode dari guru |
| `masukUlang.petunjuk` | Pakai ini bila kamu pindah HP. Minta kode 6 huruf atau angka dari gurumu. |
| `masukUlang.labelRuang` | Kode ruang |
| `masukUlang.labelKode` | Kode dari guru |
| `masukUlang.tombol` | Masuk |
| `masukUlang.kembali` | Kembali |
| `masukUlang.galatFormat` | Kode dari guru berisi 6 huruf atau angka. |
| `masukUlang.galatSalah` | Kode dari guru salah atau sudah tidak berlaku. Minta kode baru. |
| `masukUlang.galatTerlaluSering` | Terlalu banyak percobaan. Minta kode baru dari gurumu, lalu coba lagi. |
| `galat.KODE_MASUK_ULANG_SALAH` | Kode dari guru salah atau sudah tidak berlaku. Minta kode baru. |
| `masukUlang.diganti` | Kamu sudah masuk dari perangkat lain. Lanjutkan bermain di perangkat itu. |
| `tentang.kreditHuruf` | Huruf VT323, SIL Open Font License 1.1. |

**Konsol (`TEKS_KONSOL`)**

| Kunci | Teks |
|---|---|
| `detail.kodeMasukUlang` | Kode masuk ulang |
| `detail.kodeMasukUlangLabel` | Buat kode masuk ulang untuk {nama} |
| `detail.kodeMasukUlangJudul` | Kode masuk ulang untuk {nama} |
| `detail.kodeMasukUlangPetunjuk` | Minta siswa membuka alamat ruang di HP barunya, mengetik kode ruang {kodeRuang}, memilih "Masuk dengan kode dari guru", lalu mengetik kode ini. |
| `detail.kodeMasukUlangBerlaku` | Berlaku sampai pukul {jam} (sisa {sisa}). |
| `detail.kodeMasukUlangHabis` | Kode sudah tidak berlaku. Buat kode baru bila masih perlu. |
| `detail.kodeMasukUlangSalin` | Salin kode |
| `detail.kodeMasukUlangTersalin` | Kode disalin. |
| `detail.kodeMasukUlangGagal` | Kode tidak bisa dibuat. Coba lagi. |
| `detail.kodeMasukUlangTutup` | Tutup |
| `kelas.qrKeterangan` | Pindai dengan kamera HP untuk bergabung. |
| `kelas.qrLabel` | Kode QR untuk bergabung ke ruang {kode} |
| `kelas.perbesarQr` | Perbesar QR |
| `kelas.tutupQr` | Tutup |
| `alurAdminAwal.pilihLingkungan` | Pilih lingkungan uji atau produksi di formulir, lalu jalankan lagi. |
| `masuk.kreditHuruf` | Huruf VT323, SIL Open Font License 1.1. |

Kunci `kelas.caraJudul`, `kelas.cara1`, `kelas.cara2`, `kelas.cara3`, dan `kelas.cara3Bebas` dihapus bila D-1a dipilih.

## Data, protokol, API, dan migrasi

- **Protokol pemain:** `halo` mendapat `kodeMasukUlang: z.string().regex(/^[A-Za-z0-9]{6}$/).optional()`. `token` dan `kodeMasukUlang` tidak boleh dikirim bersamaan; bila keduanya ada, sambungan dianggap melanggar. Galat baru `KODE_MASUK_ULANG_SALAH` ditambahkan ke daftar kode galat, dan `PROTOKOL_VERSI` menjadi 5.
- **Protokol kelas:** `kode_masuk_ulang` dihapus dari skema kelas (P-16). Tidak ada pesan baru.
- **API konsol:** `POST /api/ruang/{id}/kelola` menerima aksi `kode_masuk_ulang` dengan `pemainId`, memakai izin `ruang.kelola` yang sudah ada. Jawaban dan galatnya mengikuti P-11 dan P-12.
- **SQLite ruang (Durable Object):** tabel baru `kode_masuk_ulang (pemain_id TEXT PRIMARY KEY, hash TEXT NOT NULL, berlaku_sampai INTEGER NOT NULL)`, dibuat dengan `CREATE TABLE IF NOT EXISTS`. Baris yang kedaluwarsa dihapus saat dipakai atau saat kode baru dibuat. Tabel dimuat ke keadaan ruang saat Durable Object bangun.
- **D1:** tidak ada migrasi. Log audit memakai tabel `log_audit` yang ada.
- **Konfigurasi:** `package.json` dan `pnpm-lock.yaml` (P-1). `jejak-admin-awal.yml` (P-18).

## Aset

Tidak ada aset gambar atau suara baru. Tombol baru memakai teks saja, dan QR digambar saat tampil.

## Keamanan dan privasi

- **Kode masuk ulang:**
  - hanya tampil di laptop guru, tidak di proyektor dan tidak di log;
  - disimpan sebagai hash dan berlaku 10 menit, sekali pakai;
  - kode salah dibatasi 5 kali per sambungan;
  - pembatas `BATAS_WS` per alamat IP tetap berlaku.
- **Pemain yang dikeluarkan** tidak bisa masuk lagi lewat kode.
- **Token lama tidak berlaku lagi** sesudah masuk ulang, karena `hashToken` diganti.
- **QR** hanya berisi alamat dan kode ruang yang memang tampil di proyektor.
- **Huruf** dimuat dari berkas sendiri, tanpa CDN.

## Di luar cakupan

- Panduan guru, tautan galeri, uji coba kelas, dan rilis v1.0 (JS-16c).
- Mengubah huruf Sehari Setara.
- Menampilkan kode masuk ulang di layar kelas.
- Masuk ulang tanpa guru (misalnya lewat nama dan nomor absen).
- Mengubah batas kinerja `skill.uji.ts`.

## DRAF untuk ditinjau pemilik proyek

- **D-1 Kotak kanan lobi.**
  - (a, saran) QR beserta keterangan menggantikan tiga langkah bergabung, sesuai sketsa Design System 3.6.
  - (b) QR di atas tiga langkah yang diperkecil.
- **D-2 Batas kode salah.**
  - (a, saran) 5 kali per sambungan.
  - (b) 3 kali.
- **D-3 Log audit pembuatan kode.**
  - (a, saran) Dicatat tanpa kode.
  - (b) Tidak dicatat.
- **D-4 Perangkat lama yang digantikan.**
  - (a, saran) Berhenti dan menampilkan pesan, untuk semua penggantian sambungan (4001).
  - (b) Hanya bila penggantian terjadi karena kode masuk ulang.

## Kriteria penerimaan

**Huruf**
- [ ] AC-1 `package.json` memuat `@fontsource/vt323` 5.3.0. Jejak hanya mengimpor `vt323/latin-400.css`. Sehari Setara tetap mengimpor huruf lamanya. `build:pages` identik byte dengan galeri.
- [ ] AC-2 Nama huruf ditulis hanya di keempat token. Uji membaca `jejak.css` dan `kelas.css` dan memastikan tidak ada "Press Start 2P" atau "Pixelify Sans", serta setiap `font-family` VT323 berpasangan dengan `font-size-adjust` token yang sesuai.
- [ ] AC-3 Di empat ukuran layar, elemen judul dan teks memakai VT323 dengan `font-size-adjust` aktif, tabel konsol tetap huruf sistem, dan tidak ada teks yang meluap. Uji ujung ke ujung huruf dan kredit diperbarui.
- [ ] AC-4 Label nama di kanvas memakai VT323 dengan ukuran 16,25 px; uji unit membaca faktor dan nama huruf dari token.

**Kode QR**
- [ ] AC-5 `buatQR` menghasilkan matriks yang sama persis dengan matriks contoh (dibuat sekali dengan `lean-qr` mode byte di luar repositori) untuk versi 1, 4, 7, dan 10 dan kedelapan mask. Mask pilihan sama dengan rujukan untuk contoh tetap. Tautan produksi menjadi versi 4.
- [ ] AC-6 Lobi layar kelas menampilkan QR berisi `{tautan}/?kode={kode}` dan keterangannya. Sisi QR sedikitnya 36u di 1024 × 768, 1280 × 720, dan 1920 × 1080.
- [ ] AC-7 "Perbesar QR" dan tombol `Q` membuka lapisan; `Esc` dan `Q` menutupnya dan fokus kembali; `L` dan `Spasi` tidak bekerja saat lapisan terbuka; lapisan tertutup saat ronde dimulai.
- [ ] AC-8 Modul QR tidak ada di bundel layar pemain, dan kode layar kelas tetap di bawah anggaran.

**Kode masuk ulang**
- [ ] AC-9 Rute `kelola` dengan aksi `kode_masuk_ulang` menjawab kode 6 karakter dan `berlakuSampai` sekitar 10 menit. Galat P-12 sesuai. Guru bukan pemilik ditolak. Log audit tidak memuat kode.
- [ ] AC-10 Inti ruang:
  - kode cocok memindahkan pemain dengan token baru dan menutup sambungan lama dengan 4001;
  - kode sekali pakai dan kedaluwarsa sesudah 10 menit;
  - kode baru menggantikan kode lama;
  - pemeriksaan terkunci, penuh, terlambat, dan nomor absen dilewati;
  - pemain yang dikeluarkan dan ruang yang ditutup ditolak;
  - kesalahan ke-5 menutup sambungan dengan 1008;
  - `token` dan `kodeMasukUlang` bersamaan dianggap pelanggaran.
- [ ] AC-11 Kode masuk ulang bertahan saat Durable Object dibangunkan ulang (uji server).
- [ ] AC-12 Uji ujung ke ujung: pemain di HP pertama mendapat skor; guru membuat kode di konsol; HP kedua masuk dengan kode; nama dan skor sama; HP pertama menampilkan pesan perangkat lain dan tidak menyambung ulang. Galat format dan kode salah tampil.
- [ ] AC-13 Dialog konsol menampilkan kode, petunjuk, jam berlaku, hitung mundur, tombol salin, dan keadaan kode habis.
- [ ] AC-14 `PROTOKOL_VERSI` 5. Klien versi 4 menerima 4005. Skema `kode_masuk_ulang` kelas tidak ada lagi.
- [ ] AC-15 `sim:beban` lulus dengan angka yang sebanding dengan JS-15.

**Lain-lain**
- [ ] AC-16 Tombol lobi sedikitnya 48 px di 1024 × 768.
- [ ] AC-17 `jejak-admin-awal.yml`: pilihan `pilih`, `uji`, dan `produksi`, dengan bawaan `pilih`. Run dengan `pilih` berhenti dengan teks `pilihLingkungan` sebelum menyentuh Cloudflare. Uji kerangka diperbarui, dan "Jejak: hentikan" tetap.
- [ ] AC-18 `gabung.uji.ts:130` menunggu 20 detik. `skill.uji.ts` dijalankan utuh dan sendirian di awal Test (P-20).
- [ ] AC-19 Semua teks di bagian Teks ada di `TEKS` atau `TEKS_KONSOL` dan cocok dengan spesifikasi; kunci yang dihapus tidak dipakai lagi.
- [ ] AC-20 Kelima perintah AGENTS 4.4 lulus, ditambah `tsc --noEmit`, anggaran, dan tangkapan layar empat ukuran untuk lobi layar kelas (QR dan Perbesar QR), layar pemain (dialog dan lobi), konsol (detail ruang dan dialog kode), dan layar masuk ulang.
- [ ] AC-21 Design System 0, 3.6, 5, dan 15; Architecture 1, 6, 7, dan 10; PRD 7 dan 21; serta PLAN sudah diperbarui.

## Rencana uji

**Berkas baru:**
- `admin/kelas/qr.ts` beserta ujinya dan matriks contoh;
- uji unit kode masuk ulang di `__tests__/ruang/`;
- uji server kode masuk ulang;
- uji ujung ke ujung `e2e/jejak-setara/masuk-ulang.uji.ts`;
- `tests/JS-16b-hasil.md`.

**Berkas diubah (selain dokumen):**
- `package.json`, `pnpm-lock.yaml`;
- kedua `main.tsx`;
- `jejak.css`, `kelas.css`;
- `LayarDunia.tsx`, `Gabung.tsx`, `App.tsx`, `jaringan.ts`;
- `Lobi.tsx`, `LayarKelas.tsx`, `DetailRuang.tsx`;
- `teks.ts`, `teks-konsol.ts`;
- `inti/protokol.ts`, `inti/protokol-kelas.ts`, `inti/versi.ts`;
- `inti-ruang.ts`, `RuangJejak.ts`, `api/ruang.ts`;
- `jejak-admin-awal.yml`;
- uji yang terdampak: `kerangka.test.ts`, `e2e/jejak-setara/kerangka.uji.ts`, `konsol.uji.ts`, `gabung.uji.ts`, dan uji yang memakai versi protokol.

**Jenis uji:**
1. **Unit:** QR (AC-5), inti ruang (AC-10), token huruf (AC-2, AC-4), teks (AC-19), dan alur kerja (AC-17).
2. **Server:** rute `kelola` (AC-9), kode setelah Durable Object bangun ulang (AC-11), dan `halo` dengan kode.
3. **Ujung ke ujung:** masuk ulang (AC-12), lobi dan Perbesar QR (AC-6, AC-7), dialog konsol (AC-13), huruf (AC-3), dan tombol 48 px (AC-16). `skill.uji.ts` lebih dulu (P-20).
4. **`sim:beban`:** wajib (AC-15).
5. **Tangkapan layar:** empat ukuran (AC-20).
