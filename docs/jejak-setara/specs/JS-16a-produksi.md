# JS-16a — Lingkungan produksi

Status: **Disetujui (24 Nov 2026)** dengan `Spesifikasi disetujui: JS-16a` (D-1 sampai D-4 = a). Database ID D1 produksi diterima hari yang sama. Bagian pertama JS-16 (Gerbang 1: `Setuju: JS-16, 8d`; usulan 1a sampai 7a berlaku untuk bagian ini).

## Ringkasan

JS-16a menyiapkan lingkungan produksi Jejak Setara di Cloudflare tanpa mengubah perilaku permainan, konsol, atau layar kelas. Isinya:

1. Konfigurasi `env.produksi` di `server/jejak-setara/wrangler.jsonc` (usulan 4a).
2. Alur kerja manual baru "Jejak: produksi". Alur kerja ini menguji ulang kode, memeriksa catatan rilis, menolak berjalan selama ada ruang produksi yang belum ditutup, menerapkan migrasi D1, menyemai bank, menyiapkan kunci Worker, deploy, lalu memeriksa `/api/sehat` (usulan 2a, 3a, 6a).
3. Pilihan lingkungan produksi di "Jejak: admin awal" dan "Jejak: hentikan" (usulan 5a).
4. Langkah pemeriksaan tipe di "Jejak: uji" (usulan 7a).
5. Catatan rilis `rilis/v0.9.md` dan pembaruan dokumen.

Agen tidak pernah menjalankan deploy produksi. Pemilik proyek menjalankan "Jejak: produksi" sendiri sesudah membalas `Rilis: v0.9` (AGENTS 4.5).

Build JS-16a dimulai sesudah pemilik proyek mengirim Database ID D1 `jejak-setara` (Plan JS-16, langkah 1–2). Bila ID belum dikirim saat Build, `wrangler.jsonc` memakai tanda isian `ISI_DATABASE_ID_PRODUKSI`, dan P-3 menahan deploy produksi sampai ID diisi.

## Kaitan PRD

- PRD 16 dan 19 (M4–M5): uji coba kelas berjalan di produksi.
- PRD 17: rilis 1.0 memerlukan lingkungan produksi.
- PRD 18: risiko layanan dan biaya, dengan penghentian darurat dan batas pakai.
- Architecture 4.2, 4.4, 4.5, 15, dan 18; AGENTS 4.5 serta bagian 7 butir 5, 7, dan 15.
- Plan JS-16 usulan 2a sampai 7a. Catatan Plan tentang semai produksi (Permintaan A-5 butir 3) dan admin awal produksi (Plan JS-04).

## Perilaku

### "Jejak: produksi" (berkas baru `.github/workflows/jejak-produksi.yml`)

- **P-1 Formulir.** Diberikan pemilik proyek membuka **Actions → "Jejak: produksi" → Run workflow**, maka formulir menampilkan:
  - pilihan branch;
  - kotak isian wajib `versi` berketerangan "Nomor rilis yang sudah Anda setujui, misalnya v0.9";
  - kotak centang `darurat` berketerangan "Darurat: tetap deploy walaupun masih ada ruang yang belum ditutup", bawaan tidak dicentang (D-1a).

  Alur kerja ini hanya berjalan lewat tombol itu, tidak pernah karena push.
- **P-2 Uji ulang.** Ketika run dimulai, job "Uji" menjalankan langkah yang sama dengan job "Uji" di "Jejak: uji", termasuk "Periksa tipe" (P-19; D-2a). Bila satu langkah gagal, job "Produksi" tidak berjalan dan tidak ada yang berubah di Cloudflare.
- **P-3 Pemeriksaan rilis dan rahasia.** Job "Produksi" diawali langkah "Periksa rilis dan rahasia" (`node scripts/jejak-setara/produksi.mjs periksa-rilis`). Langkah ini berhenti sebelum menyentuh Cloudflare bila salah satu hal berikut terjadi, dan setiap alasan punya pesan sendiri (bagian Teks):
  1. Run tidak dari branch `main`.
  2. `versi` tidak berbentuk `vX.Y` atau `vX.Y.Z` (angka tanpa nol di depan, misalnya `v0.9`, `v1.0`, `v1.0.1`).
  3. Berkas `docs/jejak-setara/rilis/{versi}.md` tidak ada.
  4. Rahasia `CLOUDFLARE_API_TOKEN` atau `CLOUDFLARE_ACCOUNT_ID` kosong.
  5. Database ID produksi di `wrangler.jsonc` masih `ISI_DATABASE_ID_PRODUKSI`.

  Pemeriksaan berjalan dalam urutan itu, dan pesan pertama yang cocok yang ditampilkan.
- **P-4 Ruang yang berjalan.** Langkah "Periksa ruang produksi" (`produksi.mjs ruang-aktif`) membaca D1 produksi lewat `wrangler d1 execute DB --remote --env produksi --json`, dengan kueri `SQL_RUANG_AKTIF`. Kueri itu menghitung semua ruang yang belum `ditutup`, termasuk lobi, hitung mundur, selesai, pembahasan, dan ruang uji (D-3a).
  - Bila jumlahnya 0, run berlanjut, dan ringkasan mencatat "Tidak ada ruang produksi yang sedang berjalan."
  - Bila jumlahnya n > 0 dan `darurat` tidak dicentang, run berhenti dengan pesan berisi n. Migrasi, semai, dan deploy tidak berjalan.
  - Bila `darurat` dicentang, run berlanjut dengan peringatan (anotasi kuning dan baris ringkasan) berisi n.
- **P-5 D1 baru.** Bila tabel `ruang` belum ada (deploy produksi pertama, sebelum migrasi), jumlahnya dianggap 0. Keberadaan tabel diperiksa lebih dulu dengan `SQL_ADA_TABEL_RUANG` di `sqlite_master`, bukan ditebak dari pesan galat.
- **P-6 Gagal membaca.** Bila wrangler keluar dengan galat atau keluarannya tidak terbaca, run berhenti dengan pesan "Daftar ruang produksi tidak bisa dibaca…", juga bila `darurat` dicentang.
- **P-7 Build.** "Build Jejak (produksi)" menjalankan `npx -y pnpm@11.25.0 build:jejak` dengan `CLOUDFLARE_ENV: produksi`.
- **P-8 Migrasi.** "Migrasi D1 produksi" menjalankan `npx wrangler d1 migrations apply jejak-setara --remote --env produksi --config server/jejak-setara/wrangler.jsonc`. Deploy pertama menerapkan `0001` dan `0002`; deploy berikutnya hanya menerapkan migrasi baru.
- **P-9 Semai.** "Semai bank" menjalankan `node scripts/jejak-setara/semai.mjs --jalankan -- --remote --env produksi`, tanpa `JEJAK_SEMAI_TANPA_TAMBAHAN`.
  - Deploy pertama menyemai bank awal, lalu bank tambahan: 43 rujukan berstatus belum, 40 kejadian Siap tinjau, dan 3 paket.
  - Deploy berikutnya melewati keduanya karena penandanya sudah ada (perilaku JS-05 dan semai tambahan).
  - Tidak ada rujukan yang ditandai terverifikasi dan tidak ada kejadian yang diterbitkan (AGENTS 7 butir 7).
- **P-10 Kunci Worker.** "Siapkan kunci Worker" sama dengan langkah bernama sama di "Jejak: uji", tetapi untuk Worker `jejak-setara`:
  - `KUNCI_SANDI`, `KUNCI_IP`, dan `KUNCI_TIKET` yang belum ada dibuat acak dan ikut deploy lewat `--secrets-file`;
  - kunci yang sudah ada tidak pernah diganti, dan nilainya tidak pernah dicetak;
  - nilai produksi dibuat terpisah dari nilai uji;
  - `DARURAT` dan `KUNCI_ADMIN` tidak disentuh.
- **P-11 Deploy.** "Deploy Worker produksi" menjalankan `npx wrangler deploy` di `web/jejak-setara`, dengan `--secrets-file` bila ada kunci baru. Log deploy disimpan di `$RUNNER_TEMP`, dan berkas kunci sementara selalu dihapus.
- **P-12 Pemeriksaan sesudah deploy.** "Periksa lingkungan produksi" mengambil alamat `workers.dev` pertama dari log deploy. Langkah ini lalu memanggil `/api/sehat` paling banyak 10 kali dengan jeda 3 detik.
  - Bila jawabannya memuat `"lingkungan":"produksi"`, ringkasan run menulis dua baris: "Rilis {versi} terpasang di lingkungan produksi: {alamat}" dan "Guru yang sedang membuka konsol akan melihat ajakan memuat ulang halaman."
  - Bila tidak, run merah dengan pesan "Lingkungan produksi tidak menjawab…".
- **P-13 Antrean.** Dua run "Jejak: produksi" tidak pernah berjalan bersamaan (grup `jejak-cloudflare-produksi`, tanpa membatalkan run yang sedang berjalan). Run produksi tidak menunggu run lingkungan uji, dan sebaliknya.
- **P-14 Deploy ulang.** Bila produksi sudah berjalan dan run baru lulus semua pemeriksaan, maka:
  - migrasi yang sudah diterapkan dan semai dilewati;
  - kunci Worker tidak berubah;
  - isi bank, rujukan terverifikasi, kejadian terbit, akun, dan riwayat ruang tetap utuh.

### "Jejak: admin awal" (diubah)

- **P-15 Pilihan lingkungan.** Formulir mendapat pilihan `lingkungan` berketerangan "Lingkungan" (`uji` atau `produksi`, bawaan `uji`), selain "Nama tampilan". Lingkungan menentukan dua hal:
  - Worker: `jejak-setara-uji` atau `jejak-setara`;
  - alamat: variabel GitHub `JEJAK_ALAMAT_UJI` atau `JEJAK_ALAMAT_PRODUKSI` bila diisi; bila tidak, `https://jejak-setara-uji.{subdomain}.workers.dev` atau `https://jejak-setara.{subdomain}.workers.dev`.

  Pemilihan dikerjakan di skrip shell dari kedua variabel yang dibaca terpisah, bukan dengan ungkapan `&&` dan `||` GitHub. Dengan begitu, variabel produksi yang kosong tidak jatuh ke alamat uji.
- **P-16 Pemeriksaan alamat.** Sebelum menyimpan kunci sekali pakai, langkah "Cari dan periksa alamat lingkungan" memastikan `/api/sehat` di alamat itu menjawab dengan lingkungan yang dipilih (D-4a).
  - Langkah ini mencoba paling banyak 3 kali dengan jeda 3 detik. Bila tetap gagal, run berhenti dengan pesan "Lingkungan {lingkungan} belum ada…", dan tidak ada rahasia yang disimpan.
  - Pemeriksaan ini mencegah `wrangler secret put` membuat Worker kosong bernama `jejak-setara` sebelum deploy produksi pertama.
- **P-17 Urutan dan ringkasan.**
  - Urutan langkah: "Periksa rahasia dan masukan", "Cari dan periksa alamat lingkungan", "Simpan kunci sekali pakai", "Buat atau pulihkan akun", "Tutup kembali rute admin awal". Langkah penutup tetap selalu berjalan sesudah kunci disimpan.
  - Ringkasan menambah baris "Lingkungan: {lingkungan}" sebelum alamat konsol.
  - Rahasia GitHub tetap `JEJAK_ADMIN_EMAIL` dan `JEJAK_ADMIN_SANDI_SEMENTARA` (usulan 5a).
  - Grup concurrency menjadi `jejak-cloudflare-${{ inputs.lingkungan }}`.
  - Semua wrangler tetap terkunci di `wrangler@4.92.0`.

### "Jejak: hentikan" (diubah)

- **P-18 Lingkungan produksi.** Pilihan `lingkungan` menjadi `uji` dan `produksi` (bawaan `uji`).
  - Worker dan alamat dipilih seperti P-15.
  - Sebelum mengubah `DARURAT`, alamat diperiksa seperti P-16. `/api/sehat` tetap menjawab saat layanan sedang dihentikan, sehingga "pulihkan" tetap bisa berjalan.
  - Ringkasan menjadi "Layanan {lingkungan} dihentikan." atau "Layanan {lingkungan} dipulihkan."
  - Grup concurrency menjadi `jejak-cloudflare-${{ inputs.lingkungan }}`.
  - Perilaku lain JS-22 tidak berubah: pemeriksaan paling lama 2 menit, dan tidak ada nilai rahasia yang dicetak.

### "Jejak: uji" (diubah)

- **P-19 Pemeriksaan tipe.** Langkah "Periksa tipe" (`npx -y pnpm@11.25.0 exec tsc --noEmit`) berjalan sesudah "Uji Jejak". Kesalahan tipe membuat run merah sebelum deploy uji. Langkah lain dan urutannya tidak berubah.

### Catatan rilis dan dokumen (ditulis di Build)

- **P-20 Catatan rilis v0.9.** `docs/jejak-setara/rilis/v0.9.md` mengikuti templat 12.4 dan berisi:
  - fitur yang sudah Selesai (JS-01 sampai JS-15, JS-22, dan semai tambahan);
  - migrasi `0001` dan `0002` untuk D1 produksi baru;
  - `PROTOKOL_VERSI` 4, sama dengan lingkungan uji;
  - langkah pemilik proyek 5–12 dan Bagian A verifikasi dari Plan JS-16;
  - risiko;
  - cara kembali: *rollback* versi Worker di dasbor, D1 *Time Travel*, dan "Jejak: hentikan" produksi.

  Rilis ini hanya untuk persiapan data: belum ada kelas dan belum ada tautan galeri.
- **P-21 Nomor rilis perbaikan.** AGENTS 4.5 dan templat 12.4 ditambah satu kalimat: rilis perbaikan tanpa fitur baru memakai nomor ketiga (`vX.Y.Z`, misalnya `v1.0.1`).
- **P-22 Dokumen lain.** Architecture diperbarui:
  - 4.2: tabel lingkungan dengan Worker `jejak-setara` dan D1 `jejak-setara`;
  - 4.4: alur "Jejak: produksi", termasuk pemeriksaan ruang belum ditutup;
  - 4.5: `RUANG_AKTIF_MAKS` produksi 20;
  - 15: cara kembali di produksi;
  - 18: langkah 3, 7, 9, dan 10 untuk produksi.

  `PLAN.md` mencatat status.

## Beberapa pemain sekaligus

- Ruang produksi yang belum ditutup menahan rilis, sehingga kelas yang sedang lobi atau bermain tidak tersambung ulang karena pembaruan (P-4).
- Bila kelas dimulai dalam beberapa menit antara pemeriksaan dan selesainya deploy, atau bila `darurat` dicentang, ruang itu pindah ke versi Worker baru paling lama sekitar 5 menit kemudian. Pemain lalu tersambung ulang dengan skor yang sama, seperti setiap pembaruan lingkungan uji (Architecture 4.4 dan 15).
- "Jejak: hentikan" produksi berlaku untuk semua pemain produksi sekaligus: semua API dan sambungan dijawab 503, dan ruang yang bangun menutup dirinya (perilaku JS-22).

## Status antarmuka

Tidak ada layar permainan, konsol, atau layar kelas yang berubah. Antarmuka JS-16a adalah halaman Actions GitHub:

| Keadaan | Yang terlihat |
|---|---|
| Formulir "Jejak: produksi" | Branch, kotak "Nomor rilis yang sudah Anda setujui, misalnya v0.9", kotak centang "Darurat: …" (P-1) |
| Formulir "Jejak: admin awal" | "Nama tampilan" (bawaan Admin) dan pilihan "Lingkungan" (bawaan uji) |
| Formulir "Jejak: hentikan" | Pilihan aksi (hentikan atau pulihkan) dan "Lingkungan" (uji atau produksi) |
| Berjalan | Lingkaran kuning; job "Uji" lebih dulu, lalu "Produksi" |
| Berhasil | Centang hijau; ringkasan run berisi baris P-4 dan P-12 |
| Berhenti karena pemeriksaan | Silang merah; ringkasan anotasi berisi satu pesan dari bagian Teks, tanpa nilai rahasia |
| Darurat dipakai | Hijau dengan anotasi kuning berisi jumlah ruang (P-4) |
| Antre | "Waiting" sampai run produksi sebelumnya selesai (P-13) |

## Teks yang tampil (final)

Semua teks disimpan di `TEKS_KONSOL` (`app/jejak-setara/teks-konsol.ts`) agar uji kerangka bisa mencocokkannya dengan isi alur kerja. Penanda `{versi}`, `{jumlah}`, `{alamat}`, dan `{lingkungan}` diisi di alur kerja.

**`TEKS_KONSOL.alurProduksi` (baru)**

| Kunci | Teks |
|---|---|
| `masukanVersi` | Nomor rilis yang sudah Anda setujui, misalnya v0.9 |
| `masukanDarurat` | Darurat: tetap deploy walaupun masih ada ruang yang belum ditutup |
| `bukanMain` | Jalankan alur kerja ini dari branch main. |
| `versiSalah` | Nomor rilis harus berbentuk vX.Y atau vX.Y.Z, misalnya v0.9. |
| `catatanTidakAda` | Catatan rilis {versi} belum ada di docs/jejak-setara/rilis/. Minta agen menulisnya lebih dulu. |
| `idBelumDiisi` | Database ID produksi belum diisi di server/jejak-setara/wrangler.jsonc (Architecture bagian 18, langkah 3). |
| `ruangKosong` | Tidak ada ruang produksi yang sedang berjalan. |
| `ruangAktif` | Ada {jumlah} ruang produksi yang belum ditutup. Tunggu sampai kelas selesai atau tutup ruangnya dari konsol, lalu jalankan lagi. |
| `ruangDarurat` | Peringatan: deploy dilanjutkan walaupun ada {jumlah} ruang yang belum ditutup. Pemain di ruang itu akan tersambung ulang. |
| `ruangGagal` | Daftar ruang produksi tidak bisa dibaca. Coba lagi beberapa menit lagi. |
| `terpasang` | Rilis {versi} terpasang di lingkungan produksi: {alamat} |
| `muatUlang` | Guru yang sedang membuka konsol akan melihat ajakan memuat ulang halaman. |
| `tidakMenjawab` | Lingkungan produksi tidak menjawab /api/sehat dengan lingkungan produksi. Lihat log langkah "Periksa lingkungan produksi". |

Pesan rahasia Cloudflare memakai teks yang sudah ada, `TEKS_KONSOL.alurAdminAwal.rahasiaCloudflare`. Pesan kunci Worker memakai `kunciBaru` dan `kunciLengkap` yang sudah ada.

**`TEKS_KONSOL.alurAdminAwal` (baru dan berubah)**

| Kunci | Teks |
|---|---|
| `masukanLingkungan` (baru) | Lingkungan |
| `lingkungan` (baru) | Lingkungan: {lingkungan} |
| `belumAda` (baru) | Lingkungan {lingkungan} belum ada atau tidak menjawab /api/sehat. Untuk produksi, jalankan "Jejak: produksi" lebih dulu. |
| `belumSiap` (berubah) | Konsol belum siap: kunci Worker belum dibuat. Jalankan ulang "Jejak: uji" atau "Jejak: produksi" sesuai lingkungan, lalu coba lagi. |

**`TEKS_KONSOL.alurHentikan` (berubah)**

| Kunci | Teks |
|---|---|
| `berhenti` | Layanan {lingkungan} dihentikan. |
| `pulih` | Layanan {lingkungan} dipulihkan. |
| `belumAda` (baru) | Sama dengan `alurAdminAwal.belumAda` |

Teks lain kedua alur kerja itu tidak berubah.

## Data, protokol, API, dan migrasi

- **Protokol dan API:** tidak berubah. `PROTOKOL_VERSI` tetap 4, tidak ada rute API baru, dan kode Worker, permainan, konsol, serta layar kelas tidak berubah.
- **`wrangler.jsonc`:** `env.produksi` ditambahkan dengan kunci yang sama persis seperti `env.uji`. Bagian atas berkas dan `env.uji` tidak berubah. Isinya:

```jsonc
"produksi": {
  "name": "jejak-setara",
  "vars": { "LINGKUNGAN": "produksi", "ITERASI_SANDI": "100000", "RUANG_AKTIF_MAKS": "20" },
  "limits": { "cpu_ms": 1000 },
  "observability": { "enabled": true, "logs": { "enabled": true, "invocation_logs": false }, "traces": { "enabled": false } },
  "durable_objects": { "bindings": [{ "name": "RUANG", "class_name": "RuangJejak" }] },
  "d1_databases": [{ "binding": "DB", "database_name": "jejak-setara", "database_id": "<Database ID dari pemilik proyek, atau ISI_DATABASE_ID_PRODUKSI>", "migrations_dir": "migrations" }],
  "ratelimits": [
    { "name": "BATAS_PUBLIK", "namespace_id": "3201", "simple": { "limit": 300, "period": 60 } },
    { "name": "BATAS_WS", "namespace_id": "3202", "simple": { "limit": 300, "period": 60 } },
    { "name": "BATAS_MASUK", "namespace_id": "3203", "simple": { "limit": 10, "period": 60 } }
  ]
}
```

- **Migrasi D1:** tidak ada migrasi baru. D1 produksi menerima `0001` dan `0002` yang sudah ada.
- **Skrip baru `scripts/jejak-setara/produksi.mjs`.** Skrip ini dipakai alur kerja produksi dan diuji unit. Isinya:
  - `periksa-rilis`: memeriksa butir P-3 dari variabel lingkungan `VERSI`, `GITHUB_REF`, dan kedua rahasia Cloudflare (hanya ada tidaknya, isinya tidak dibaca), serta dari `wrangler.jsonc` (memakai `buangKomentar` dari `semai.mjs`). Keluar dengan kode 0 atau 1, dan mencetak `::error::` dengan teks dari bagian Teks.
  - `ruang-aktif`: menjalankan wrangler dua kali (`SQL_ADA_TABEL_RUANG`, lalu `SQL_RUANG_AKTIF` bila tabel ada) dan memakai fungsi pembaca keluaran `--json` yang sudah ada di `semai.mjs`. Keputusannya diambil fungsi murni `putuskanRuang(jumlah, darurat)`, yang mengembalikan lanjut, berhenti, atau peringatan, beserta teksnya.
  - Konstanta yang diekspor:
    - `SQL_ADA_TABEL_RUANG = "SELECT COUNT(*) AS jumlah FROM sqlite_master WHERE type = 'table' AND name = 'ruang'"`
    - `SQL_RUANG_AKTIF = "SELECT COUNT(*) AS jumlah FROM ruang WHERE status <> 'ditutup'"`
    - `POLA_VERSI = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)(\.(0|[1-9]\d*))?$/`
    - `ID_KOSONG_PRODUKSI = "ISI_DATABASE_ID_PRODUKSI"`
- **Masukan GitHub:**
  - "Jejak: produksi": `versi` (string, wajib) dan `darurat` (boolean, bawaan `false`);
  - "Jejak: admin awal": `nama_tampilan` (tetap) dan `lingkungan` (pilihan `uji`/`produksi`, bawaan `uji`);
  - "Jejak: hentikan": `aksi` (tetap) dan `lingkungan` (pilihan `uji`/`produksi`, bawaan `uji`).
- **Variabel GitHub baru yang boleh kosong:** `JEJAK_ALAMAT_PRODUKSI`, untuk domain sendiri kelak (KT-06).

## Aset

Tidak ada.

## Keamanan dan privasi

- **Rahasia:** tidak ada rahasia baru. Token dan kunci tidak pernah dicetak; kunci baru disamarkan dengan `::add-mask::`, dan berkas kunci sementara berizin 600 dan dihapus di akhir langkah. `produksi.mjs` hanya memeriksa ada tidaknya rahasia, tidak membaca isinya.
- **Izin:** semua alur kerja memakai `permissions: contents: read`.
- **Gerbang rilis:** produksi hanya bisa di-deploy lewat tombol, dari `main`, dengan catatan rilis yang ada di repositori, sesudah uji ulang lulus (AGENTS 4.5). Agen tidak pernah menjalankannya (AGENTS 7 butir 15).
- **Data siswa:** pemeriksaan ruang hanya membaca jumlah, tanpa kode ruang, nama, atau isi lain.
- **Kunci produksi:** `KUNCI_SANDI`, `KUNCI_IP`, dan `KUNCI_TIKET` produksi dibuat terpisah dari lingkungan uji, jadi sesi, tiket, dan sandi uji tidak berlaku di produksi.
- **Admin awal produksi:** memakai rahasia GitHub yang sama. Pemilik proyek mengganti isi `JEJAK_ADMIN_SANDI_SEMENTARA` sebelum run produksi, dan sandi itu wajib diganti saat masuk pertama (perilaku JS-04). `KUNCI_ADMIN` tetap ditutup kembali di akhir setiap run.
- **Worker kosong:** pemeriksaan alamat (P-16 dan P-18) mencegah rahasia disimpan ke Worker yang belum ada.

## Di luar cakupan

- Domain sendiri (KT-06; produksi memakai `workers.dev`).
- GitHub *Environments* dengan peninjau.
- Deploy produksi otomatis saat push.
- Menyalin isi D1 uji ke produksi (usulan 6c tidak dipilih).
- Uji beban ke produksi.
- Pemantauan dan peringatan otomatis, serta replikasi baca D1.
- Perubahan kode Worker, permainan, konsol, atau layar kelas.
- Huruf VT323, kode QR, dan kode masuk ulang (JS-16b).
- Panduan guru, tautan galeri, uji coba kelas, dan rilis v1.0 (JS-16c).
- Verifikasi rujukan dan penerbitan kejadian, yang dikerjakan akun Peninjau di konsol produksi.

## DRAF untuk ditinjau pemilik proyek

Diputuskan pemilik proyek 24 Nov 2026: D-1 sampai D-4 = a.

- **D-1 Konfirmasi di formulir "Jejak: produksi".**
  - (a, saran) Kotak "Nomor rilis" yang harus cocok dengan berkas catatan rilis di repositori, ditambah kotak centang darurat.
  - (b) Ditambah kotak ketik "PRODUKSI", seperti "UJI BEBAN" di uji beban.
- **D-2 Uji ulang sebelum deploy produksi.**
  - (a, saran) Job "Uji" yang sama dengan "Jejak: uji" berjalan lagi di setiap run produksi. Run menjadi beberapa menit lebih lama, tetapi kode yang di-deploy selalu teruji.
  - (b) Membaca status "Jejak: uji" untuk commit yang sama lewat API GitHub: lebih cepat, tetapi gagal bila run itu dibatalkan, belum ada, atau hanya dipicu perubahan dokumen.
- **D-3 Ruang yang menahan rilis.**
  - (a, saran) Semua ruang yang belum `ditutup`, termasuk lobi, selesai, pembahasan, dan ruang uji.
  - (b) Hanya `main` dan `jeda`, sesuai bunyi Architecture 4.4 sekarang. Kelas di lobi atau pembahasan tetap bisa tersambung ulang karena deploy.
- **D-4 Pemeriksaan alamat sebelum mengubah rahasia.**
  - (a, saran) Di "Jejak: admin awal" dan "Jejak: hentikan", untuk kedua lingkungan.
  - (b) Hanya untuk produksi.

## Kriteria penerimaan

- [ ] AC-1 `wrangler.jsonc` sama persis dengan bagian "Data" (bagian atas dan `env.uji` tidak berubah). Uji kerangka membandingkan seluruh isinya.
- [ ] AC-2 `build:jejak` dengan `CLOUDFLARE_ENV=produksi` menghasilkan konfigurasi deploy dengan isi berikut, dan `wrangler deploy --dry-run` dari `web/jejak-setara` berhasil tanpa token:
  - nama Worker `jejak-setara`;
  - `LINGKUNGAN` `produksi`, `ITERASI_SANDI` 100000, `RUANG_AKTIF_MAKS` 20;
  - D1 `jejak-setara`;
  - pembatas 3201–3203;
  - pemicu harian.
- [ ] AC-3 `jejak-produksi.yml` memenuhi syarat dasar:
  - hanya berjalan lewat `workflow_dispatch`, dengan masukan `versi` (wajib) dan `darurat` (boolean, bawaan false);
  - `permissions: contents: read`;
  - concurrency `jejak-cloudflare-produksi` tanpa pembatalan;
  - `ubuntu-24.04`, `actions/checkout@v5`, dan `actions/setup-node@v5` dengan `package-manager-cache: false`.
- [ ] AC-4 Job "Uji" di `jejak-produksi.yml` berisi langkah yang sama dan berurutan sama dengan job "Uji" di `jejak-uji.yml`. Job "Produksi" memakai `needs: uji` dan berisi langkah berurutan: "Periksa rilis dan rahasia", penyiapan Node dan "Pasang dependensi", "Periksa ruang produksi", "Build Jejak (produksi)", "Migrasi D1 produksi", "Semai bank", "Siapkan kunci Worker", "Deploy Worker produksi", "Periksa lingkungan produksi".
- [ ] AC-5 `produksi.mjs periksa-rilis` menolak setiap keadaan P-3 dengan teksnya, dalam urutan P-3, dan menerima `v0.9`, `v1.0`, serta `v1.0.1` bila berkasnya ada. Nilai `v09`, `0.9`, `v0.9-rc`, dan `v01.0` ditolak.
- [ ] AC-6 `produksi.mjs` memenuhi P-4 sampai P-6:
  - `putuskanRuang` dan pembacaan keluaran wrangler memberi keputusan yang benar untuk jumlah 0, jumlah 3, jumlah 3 dengan `darurat`, tabel belum ada, dan keluaran rusak;
  - tidak ada keadaan yang membuat deploy berlanjut saat keluaran tidak terbaca.
- [ ] AC-7 `SQL_RUANG_AKTIF` di D1 lokal yang sudah dimigrasi menghitung tepat ruang berstatus `lobi`, `hitung_mundur`, `main`, `jeda`, `selesai`, dan `pembahasan`, dan tidak menghitung `ditutup`. `SQL_ADA_TABEL_RUANG` memberi 0 sebelum migrasi dan 1 sesudahnya.
- [ ] AC-8 Perintah migrasi, semai, dan deploy di job "Produksi" sama persis dengan P-8, P-9, dan P-11. Tidak ada `JEJAK_SEMAI_TANPA_TAMBAHAN` di berkas itu.
- [ ] AC-9 "Siapkan kunci Worker" di job "Produksi" memakai `--name jejak-setara`, membuat hanya kunci yang belum ada, dan tidak mencetak nilai. Uji kerangka memakai aturan cetak yang sama dengan admin awal.
- [ ] AC-10 "Periksa lingkungan produksi" mencoba 10 kali dengan jeda 3 detik, mencari `"lingkungan":"produksi"`, dan menulis teks `terpasang` dan `muatUlang` ke ringkasan.
- [ ] AC-11 "Jejak: hentikan" memenuhi P-18:
  - pilihan lingkungan `uji` dan `produksi`;
  - Worker `jejak-setara-uji` atau `jejak-setara`;
  - alamat dari `JEJAK_ALAMAT_UJI` atau `JEJAK_ALAMAT_PRODUKSI`, dengan pemilihan di shell;
  - pemeriksaan alamat sebelum `secret put` atau `secret delete`;
  - ringkasan dengan `{lingkungan}`;
  - concurrency per lingkungan.
- [ ] AC-12 "Jejak: admin awal" memenuhi P-15 sampai P-17:
  - masukan `lingkungan` (bawaan `uji`);
  - urutan lima langkah;
  - pemeriksaan alamat sebelum kunci disimpan;
  - baris `Lingkungan: {lingkungan}`;
  - semua wrangler `4.92.0`;
  - concurrency per lingkungan;
  - tidak ada isi rahasia yang dicetak.
- [ ] AC-13 "Jejak: uji" berisi "Periksa tipe" (`npx -y pnpm@11.25.0 exec tsc --noEmit`) tepat sesudah "Uji Jejak". Langkah lain tidak berubah.
- [ ] AC-14 Semua teks di bagian Teks ada di `TEKS_KONSOL` dan muncul di alur kerja yang memakainya; uji kerangka mencocokkan keduanya.
- [ ] AC-15 Dokumen P-20 sampai P-22 sudah ditulis: `rilis/v0.9.md` memuat keenam judul templat 12.4.
- [ ] AC-16 Perintah berikut lulus: `content:check:jejak`, `test:jejak`, `test:jejak:server`, `build:jejak`, `test:e2e:jejak`, dan `tsc --noEmit`. `build:pages` identik byte dengan galeri (178 berkas).
- [ ] AC-17 Perubahan hanya pada berkas di daftar Rencana uji. Tidak ada perubahan di `server/jejak-setara/src/`, `app/jejak-setara/` selain `teks-konsol.ts` dan uji, Sehari Setara, galeri, `deploy-pages.yml`, `naskah/`, `seed/`, dan berkas Sesi C.
- [ ] AC-18 (uji manual pemilik proyek sesudah `Rilis: v0.9`)
  - "Jejak: produksi" hijau, dan `/api/sehat` produksi menjawab `"lingkungan":"produksi"`.
  - "Jejak: admin awal" produksi hijau, dan pemilik proyek berhasil masuk lalu mengganti sandi.
  - Konsol produksi menampilkan 43 rujukan berstatus belum, 40 kejadian Siap tinjau, dan 3 paket.
  - Disarankan: "Jejak: hentikan" produksi dengan aksi hentikan, lalu pulihkan; keduanya hijau.

  Hasilnya dicatat di `tests/JS-16a-hasil.md`, bagian "Uji manual pemilik proyek".

## Rencana uji

**Berkas baru:**
- `.github/workflows/jejak-produksi.yml`
- `scripts/jejak-setara/produksi.mjs`
- `app/jejak-setara/__tests__/produksi/produksi.test.ts`
- satu berkas uji di `server/jejak-setara/uji/` untuk AC-7
- `docs/jejak-setara/rilis/v0.9.md`
- `docs/jejak-setara/tests/JS-16a-hasil.md`

**Berkas diubah:**
- `server/jejak-setara/wrangler.jsonc`
- `.github/workflows/jejak-uji.yml`, `jejak-admin-awal.yml`, dan `jejak-hentikan.yml`
- `app/jejak-setara/teks-konsol.ts`
- `app/jejak-setara/__tests__/kerangka.test.ts`
- `docs/jejak-setara/Architecture.md`, `docs/jejak-setara/AGENTS.md`, dan `docs/jejak-setara/PLAN.md`

**Jenis uji:**

1. **Unit** (`test:jejak`): `produksi.test.ts` untuk AC-5 dan AC-6. Uji memakai folder sementara untuk berkas catatan rilis dan `wrangler.jsonc`, serta contoh keluaran `wrangler d1 execute --json` (jumlah 0, jumlah 3, tabel tidak ada, keluaran rusak, dan keluaran kosong).
2. **Kerangka** (`test:jejak`): `kerangka.test.ts` untuk AC-1, AC-3, AC-4, AC-8 sampai AC-14.
   - `jejak-produksi.yml` ditambahkan ke daftar alur kerja yang wajib `ubuntu-24.04` dan `setup-node@v5`.
   - Uji lama "Jejak: hentikan" dan "Jejak: admin awal" diperbarui sesuai P-15 sampai P-18.
3. **Server** (`test:jejak:server`): AC-7 dengan D1 lokal dan migrasi yang ada.
4. **Konfigurasi** (AC-2): `CLOUDFLARE_ENV=produksi` lalu `build:jejak`, kemudian berkas konfigurasi hasil build dibaca dan `wrangler deploy --dry-run` dijalankan tanpa token. Bila wrangler tetap meminta akun, Test mencatatnya dan AC-2 diputuskan dari berkas konfigurasi hasil build saja.
5. **Lengkap** (AC-16): kelima perintah AGENTS 4.4, `tsc --noEmit`, dan perbandingan SHA-256 `build:pages` dengan build dasar.
6. **Tidak dijalankan:** `sim:beban` (protokol, inti ruang, dan kiriman ke D1 tidak berubah) dan tangkapan layar empat ukuran (tidak ada tampilan yang berubah; laporan menyebutnya).
7. **Manual** (AC-18): pemilik proyek, sesudah `Rilis: v0.9`, mengikuti langkah 5–12 dan Bagian A di Plan JS-16, lalu mengirim tangkapan layar ringkasan run tanpa email.
