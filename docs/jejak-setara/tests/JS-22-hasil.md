# Laporan uji JS-22 — Pengaman biaya

| | |
|---|---|
| Fitur | JS-22 Pengaman biaya |
| Spesifikasi | [JS-22-biaya.md](../specs/JS-22-biaya.md), disetujui 15 November 2026 (D-1 sampai D-3 = a) |
| Tanggal | 15 November 2026 |
| Lingkungan | Mesin agen (mode ZIP): Node 22.23.4, pnpm 11.25.0, Wrangler 4.92.0, Chromium untuk Playwright, 2 vCPU |
| Keputusan | **Lulus dengan catatan AC-18 (ukuran kode)**: perlu keputusan pemilik proyek (bagian "Keputusan") |

## Kriteria penerimaan

| Kriteria | Status | Bukti |
|---|---|---|
| AC-1 Batas bawah alarm | Lulus | `__tests__/biaya/pengaman.test.ts` (jam tiruan); `pasangAlarm` tidak menulis ulang alarm dekat yang sudah terpasang selama putaran 100 ms |
| AC-2 Alarm berulang | Lulus | `pengaman.test.ts`: geser pada hitungan kelima, kembali ke nol saat tenggat berubah; log `ALARM_BERULANG` |
| AC-3 Anggaran alarm | Lulus | `server/jejak-setara/uji/biaya.uji-server.ts`: alarm ke-201 menutup ruang, HP menerima `status_ruang` ditutup dan kode 4000, kode ruang tidak lagi ditemukan |
| AC-4 Percobaan ulang kiriman | Lulus | `pengaman.test.ts`: jeda 30 detik sampai 60 menit, berhenti tepat 24 jam; `kirimanBerhenti` tersimpan di `meta` |
| AC-5 Penghapusan paksa | Lulus | `inti-ruang.test.ts` (`tenggatBerikut` = dibuat + 7 hari tanpa tenggat lain); `alarm()` menutup dan menghapus pada tenggat itu |
| AC-6 Alarm sesudah bangun | Lulus | `getAlarm()` dibaca di `blockConcurrencyWhile`; tenggat yang sama tidak ditulis ulang (pemeriksaan kode dan uji server) |
| AC-7 Sambung ulang HP | Lulus | `__tests__/biaya/jaringan-berhenti.test.ts`: pemeriksaan ruang sesudah 10 kali gagal (404, 503, 200, tidak tahu), jeda 30 detik, berhenti sesudah 10 menit; formulir kode menampilkan pesan layanan berhenti |
| AC-8 Worker saat darurat | Lulus | `__tests__/biaya/darurat.test.ts`: 503 untuk `/api/*` dan `/ws/*` tanpa menyentuh D1; halaman statis tetap; `/api/sehat` dengan `darurat: true` |
| AC-9 Durable Object saat darurat | Lulus dengan catatan | Jalur berhenti paksa yang sama diuji lewat anggaran alarm; server lokal tidak bisa diberi rahasia `DARURAT` (Catatan Build). Pemeriksaan di lingkungan uji oleh pemilik proyek |
| AC-10 "Jejak: hentikan" | Lulus | `kerangka.test.ts`: pilihan, `secret put` dan `delete`, pemeriksaan `/api/sehat` 2 menit, ringkasan sesuai teks, tanpa mencetak rahasia |
| AC-11 Pemakaian | Lulus | `biaya.uji-server.ts` (hitungan, `ringkasan_json`, detail admin); `api-ruang.test.ts` (hanya admin); `kelas.uji.ts` (tabel di detail ruang, gambar `tests/JS-22/konsol-pemakaian-1280x720.png`) |
| AC-12 Peringatan kiriman | Lulus | `api-ruang.test.ts` (`kirimanBerhenti` untuk admin dan guru); `DetailRuang.tsx` menampilkan peringatan |
| AC-13 Spend Management | Lulus | Architecture 13 dan bagian "Langkah sebelum paket berbayar" di bawah |
| AC-14 Observability | Lulus | `kerangka.test.ts` (`wrangler.jsonc`); `wrangler deploy --dry-run` lingkungan uji berhasil |
| AC-15 Permintaan pertama | Lulus | Bagian "Biaya permintaan pertama" |
| AC-16 Alur kerja Jejak | Lulus | `kerangka.test.ts`: `checkout@v5`, `setup-node@v5`, `ubuntu-24.04`; `deploy-pages.yml` tidak berubah |
| AC-17 Teks | Lulus | `kerangka.test.ts` membaca tabel teks spesifikasi JS-22 |
| AC-18 Tanpa regresi | Lulus dengan catatan | Semua uji lulus dan galeri identik; kode layar pemain naik 0,59 KB gzip (perkiraan spesifikasi 0,3 KB) |

## Perintah resmi

| Perintah | Hasil |
|---|---|
| `test:jejak` | 52 berkas, 933 uji lulus |
| `test:jejak:server` | 6 berkas, 54 uji lulus (214 detik), termasuk `biaya.uji-server.ts` (2 uji) |
| `test:e2e:jejak` | `kelas` 1 dan `gabung` serta `kerangka` 19 lulus (dijalankan per kelompok) |
| `build:jejak` | Berhasil; Worker 315,12 KB (77,38 KB gzip) |
| Build `CLOUDFLARE_ENV=uji` dan `wrangler deploy --dry-run` | Unggahan 307,74 KiB (75,29 KiB gzip) |
| `build:pages` | 178 berkas, identik byte |
| `tsc --noEmit` dan ESLint | 0 galat, 0 masalah |

## Simulasi beban

`sim:beban` lokal 1 ruang × 50 bot dengan layar kelas, 20 detik di lobi dan 60 detik menjelajah: 0 putus, 0 pesan ditolak, RTT p50 13 ms dan p95 30 ms. Penghitung Durable Object: 51 sambungan, 28.901 pesan masuk, 1 alarm, 1.382 baris penyimpanan dan 290 baris D1 ditulis, perkiraan 1.499 permintaan Durable Object untuk sekitar 80 detik. Bila diskalakan ke 15 menit, sekitar 16.400 permintaan, sejalan dengan perkiraan JS-10 (18.073).

## Biaya permintaan pertama (P-21)

Pengukuran lokal (Node, D1 tiruan di proses yang sama), tiga kali di proses baru, CPU permintaan pertama tiap rute sesudah permintaan pertama proses:

| Rute | Sebelum | Dengan kunci HMAC disimpan per isolat |
|---|---|---|
| `POST /api/masuk` pertama | 2,90–4,32 ms | 3,08–3,58 ms |
| `POST /api/sandi` pertama | 2,96–3,82 ms | 3,35–3,67 ms |
| `POST /api/ruang` pertama | 2,76–3,68 ms | 3,09–10,95 ms |
| `GET /api/ruang/{id}` pertama | 1,13–1,91 ms | 1,24–2,52 ms |
| Hangat (median): masuk, sandi, detail | 1,41–1,76; 2,02–2,67; 0,51–0,66 ms | 1,29–1,65; 2,03–2,60; 0,49–0,64 ms |

Perubahan tidak dipertahankan: perbedaannya di dalam rentang derau, jauh di bawah syarat 15%. Lonjakan 10–23 ms di Cloudflare berasal dari kode yang baru pertama kali dijalankan di isolat baru (penutupan JS-04: permintaan pertama proses lokal 29–32 ms); menguranginya butuh pemangkasan kode di jalur permintaan, di luar batas waktu JS-22. Selama paket gratis, lonjakan itu ditanggung kelonggaran CPU Cloudflare.

## Langkah sebelum paket berbayar (P-19)

1. Dasbor Cloudflare → **Manage Account → Billing → Billable Usage** → **Create budget alert**: 3 USD.
2. **Billing → Spend Management** → baris **Workers** → **Edit the spending limit**: 5 USD, simpan, pastikan **On**. Ulangi untuk **Durable Objects**.
3. Isi email pemberitahuan bila kolomnya tersedia.
4. Batas Workers berlaku untuk semua Worker di akun dan menghentikan pemanggilan baru sampai periode tagihan berikutnya atau sampai batas dinaikkan, dimatikan, atau dihapus.

## Pemeriksaan manual

- [x] Tampilan bagian "Pemakaian ronde ini" diperiksa dari tangkapan layar.
- [ ] Sesudah push: "Jejak: uji" hijau (pemilik proyek).
- [ ] "Jejak: hentikan" dengan aksi `hentikan`: layar pemain menampilkan pesan layanan berhenti saat memasukkan kode; lalu aksi `pulihkan` (pemilik proyek).
- [ ] Satu ronde pendek, lalu tutup ruang dan kirim tangkapan layar "Pemakaian ronde ini" (pemilik proyek).

## Temuan

1. Penghapusan ringkasan memakai baris terpisah, bukan antrean kiriman (Catatan Build).
2. Server lokal tidak bisa diberi rahasia `DARURAT`; jalur Durable Object saat darurat diperiksa lewat jalur berhenti paksa yang sama dan di lingkungan uji.
3. Repositori tidak memakai Prettier; memformat ulang berkas akan mengubah ratusan baris tanpa perubahan isi (catatan untuk sesi berikutnya).

## Keputusan

Semua kriteria lulus kecuali catatan AC-18: kode layar pemain naik 0,59 KB gzip, lebih dari perkiraan 0,3 KB di spesifikasi. Pilihan: (a, saran) terima kenaikan ini, karena itu logika pengaman di HP (pemeriksaan ruang, batas 10 menit, dan layar berhenti) dan masih jauh di bawah anggaran ukuran; (b) kembali ke Build untuk memangkasnya.

## Perbaikan alur kerja sesudah push (15 November 2026)

**Yang terjadi.** Sesudah ZIP Build JS-22 di-push (commit `d2afc0f`), "Jejak: uji" (run 43712263826) merah di langkah `actions/setup-node@v5` dengan pesan "Unable to locate executable file: pnpm". Langkah uji dan build sesudahnya tidak sempat berjalan, dan job "Deploy uji" dilewati, jadi kode JS-22 belum masuk lingkungan uji. "Terbitkan ke GitHub Pages" di push yang sama hijau.

**Penyebab.** P-22 menaikkan `actions/setup-node` dari v4 ke v5. Versi 5 punya masukan baru `package-manager-cache` yang menyala secara bawaan: bila `package.json` memuat `packageManager`, setup-node menyiapkan cache untuk pengelola paket itu. `package.json` memuat `"packageManager": "pnpm@11.25.0"`, jadi setup-node memanggil pnpm, padahal di mesin GitHub pnpm baru dijalankan lewat `npx` sesudah langkah itu. Versi 4 tidak punya cache otomatis. Uji AC-16 hanya memeriksa versi aksi dan runner, dan uji di mesin agen tidak menjalankan aksi GitHub, jadi kesalahan ini baru terlihat sesudah push.

**Perbaikan.** Kedua langkah `actions/setup-node@v5` di `jejak-uji.yml` (job "Uji" dan "Deploy uji") memakai `package-manager-cache: false`, sehingga perilakunya sama dengan v4. Versi aksi dan runner tetap sesuai P-22. `jejak-admin-awal.yml` dan `jejak-hentikan.yml` tidak diubah: keduanya tidak mengambil repositori (tanpa `actions/checkout`), sehingga setup-node tidak menemukan `package.json`. Uji baru di `kerangka.test.ts` memeriksa setiap langkah setup-node di berkas `jejak-*.yml` yang mengambil repositori. `setup-node@v6` hanya menyalakan cache otomatis untuk npm, tetapi tidak dipakai agar versi tetap sesuai P-22.

**Bukti.** Kode setup-node v5.0.0 (`src/main.ts`) diperiksa: cache otomatis memakai `packageManager` dan hanya dilewati bila `package-manager-cache` bernilai false. Uji baru gagal dengan `jejak-uji.yml` lama dan lulus dengan yang baru. Langkah job "Uji" diulang di mesin agen dengan Node 22.23.4 (sama dengan mesin GitHub) dan pnpm 11.25.0:

| Perintah | Hasil |
|---|---|
| `install --frozen-lockfile` | Berhasil |
| `content:check:jejak` | 10 berkas, 254 uji lulus |
| `test:jejak` | 52 berkas, 934 uji lulus (933 ditambah 1 uji baru) |
| `test:jejak:server` | 6 berkas, 54 uji lulus |
| `build:jejak` | Berhasil |
| `tsc --noEmit`, ESLint (`kerangka.test.ts`), actionlint 1.7.12 (`jejak-uji.yml`) | 0 galat, 0 masalah |
| `build:pages` | 178 berkas, identik byte dengan `main` |

Bukti terakhir adalah "Jejak: uji" hijau sesudah perbaikan ini di-push (pemeriksaan manual di atas).
