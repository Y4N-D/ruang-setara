# Hasil uji JS-16a — 24 November 2026

Lingkungan produksi, sesuai spesifikasi [JS-16a-produksi.md](../specs/JS-16a-produksi.md) (disetujui 24 Nov 2026, D-1 sampai D-4 = a).

Diuji di mesin agen (Linux, Node 22.23.5, pnpm 11.25.0, Chromium 1243) dari ZIP `main` 24 Nov 2026, ditambah hasil Build ini. Agen tidak menjalankan deploy produksi (AGENTS 4.5). AC-18 diuji pemilik proyek sesudah `Rilis: v0.9`.

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 | Lulus | `kerangka.test.ts` membandingkan seluruh `wrangler.jsonc`, termasuk `env.produksi` dengan Database ID `354bffcb-5eae-4dc2-b7a4-17a2d108e232`. Lewat konektor Cloudflare: D1 `jejak-setara` ada, kosong, tanpa yurisdiksi |
| AC-2 | Lulus | `CLOUDFLARE_ENV=produksi build:jejak` menghasilkan `dist-jejak/worker/wrangler.json` dengan nama `jejak-setara`, `LINGKUNGAN` produksi, `ITERASI_SANDI` 100000, `RUANG_AKTIF_MAKS` 20, D1 `jejak-setara`, pembatas 3201–3203, pemicu `0 19 * * *`, dan `cpu_ms` 1000. `wrangler deploy --dry-run` tanpa token berhasil dan mencantumkan binding `RUANG`, `DB` (jejak-setara), `BATAS_PUBLIK`, `BATAS_WS`, `BATAS_MASUK` (10 per 60 detik), dan `ASSETS` |
| AC-3 | Lulus | `kerangka.test.ts` (JS-16a): hanya `workflow_dispatch`, masukan `versi` dan `darurat`, izin baca, antrean `jejak-cloudflare-produksi`. Masukan formulir hanya masuk lewat variabel lingkungan |
| AC-4 | Lulus | `kerangka.test.ts`: blok langkah job "Uji" sama persis dengan "Jejak: uji"; sembilan langkah job "Produksi" berurutan |
| AC-5 | Lulus | `produksi.test.ts`: urutan P-3, bentuk nomor rilis, catatan rilis, rahasia, dan Database ID tanda isian |
| AC-6 | Lulus | `produksi.test.ts`: jumlah 0, 2, 3, darurat, tabel belum ada, keluaran rusak, wrangler gagal, dan `jumlah` null |
| AC-7 | Lulus | `produksi.uji-server.ts` dengan D1 lokal sungguhan: 0 sebelum migrasi dan 1 sesudahnya; 8 ruang (6 status aktif dan 2 `ditutup`) dihitung 6 |
| AC-8 sampai AC-14 | Lulus | `kerangka.test.ts` (JS-16a) dan uji JS-04 serta JS-22 yang diperbarui |
| AC-15 | Lulus | `rilis/v0.9.md` memuat keenam judul templat 12.4. Architecture 4.2, 4.4, 4.5, 15, dan 18; AGENTS 4.5 butir 6 dan 12.4; `PLAN.md`; PRD 21 |
| AC-16 | Lulus dengan penyimpangan | Semua perintah lulus, kecuali 3 dari 61 uji ujung ke ujung yang tidak lulus karena kinerja mesin agen (penyimpangan 1) |
| AC-17 | Lulus | Berkas yang berubah hanya yang ada di Rencana uji (daftar berkas di serah terima) |
| AC-18 | Lulus, kecuali centang Peninjau | Diperiksa 25 Nov 2026 lewat konektor Cloudflare, hanya jumlah tanpa email: Worker `jejak-setara` terpasang 24 Nov 2026; D1 produksi berisi 43 rujukan, 40 kejadian, dan 3 paket; satu akun admin aktif yang sudah masuk dan sudah mengganti sandi sementara. Centang Peninjau belum ada. Uji "Jejak: hentikan" produksi tidak dilaporkan |

## Perintah yang dijalankan dan hasilnya

| Perintah | Hasil |
|---|---|
| `pnpm install --frozen-lockfile` | Berhasil; lockfile tidak berubah |
| `content:check:jejak` | 12 berkas, 386 uji lulus |
| `test:jejak` | 87 berkas, 1.362 uji lulus |
| `tsc --noEmit` | Bersih |
| `test:jejak:server` | 12 berkas, 68 uji lulus, termasuk `produksi.uji-server.ts`. Proses dihentikan batas waktu 290 detik di mesin agen sesudah ringkasan tercetak |
| `build:jejak` dan `anggaran.mjs --ringkasan` | Lulus; semua butir anggaran lulus |
| `CLOUDFLARE_ENV=produksi build:jejak` dan `wrangler deploy --dry-run` | Lulus (AC-2) |
| `test:e2e:jejak` | 58 dari 61 uji lulus. Dijalankan per kelompok berkas karena batas waktu satu perintah di mesin agen (Temuan 1 sampai 4) |
| `build:pages` | 178 berkas, identik byte dengan build dasar |

## Simulasi beban (bila wajib)

Tidak wajib: protokol, inti ruang, dan kiriman ke D1 tidak berubah (spesifikasi, Rencana uji butir 6).

## Anggaran ukuran dan kinerja

| Butir | Ukuran | Batas | Hasil |
|---|---|---|---|
| Kode layar pemain (gzip) | 139,57 KB | 200 KB | Lulus; berkas pemain identik byte dengan kode asli |
| Kode konsol admin (gzip) | 135,98 KB | 350 KB | Lulus; naik 0,44 KB karena teks alur kerja di `TEKS_KONSOL` |
| Seluruh aset layar pemain | 242,36 KB | 2.048 KB | Lulus |
| Kedua berkas peta JSON (gzip) | 13,49 KB | 60 KB | Lulus |

Tidak ada tampilan yang berubah, jadi tangkapan layar empat ukuran tidak diambil (spesifikasi, Rencana uji butir 6).

## Temuan

1. **Penyimpangan 1 — tiga uji ujung ke ujung `skill.uji.ts` tidak lulus di mesin agen.**
   - `skill.uji.ts:405` gagal di pemeriksaan kinerja: p95 bernilai 8 dengan batas 4. Percobaan ketiga gagal di pemeriksaan lain yang juga peka waktu (nilai 298).
   - Uji yang sama gagal di salinan kode asli (sebelum JS-16a) di mesin yang sama, juga dengan p95 8.
   - `skill.uji.ts:970` dan `:1065` tidak berjalan, karena berkas itu memakai mode serial dan keduanya bergantung pada ruang yang dibuat `:405`. Bila dijalankan sendiri, `:970` gagal dengan cara yang sama di kode asli.
   - Kode layar pemain identik byte dengan kode asli, dan kode konsol hanya berbeda di teks `TEKS_KONSOL`.
   - Saran: (a) diterima dengan bukti ini, dan ketiganya dijalankan ulang di awal Test JS-16b; (b) ditahan sampai ketiganya lulus di mesin lain.
2. **Penyimpangan 2 — `gabung.uji.ts:130` ("ruang penuh dan mode nomor absen") peka waktu.**
   - Hasil di kode JS-16a: lulus di run penuh pertama, lalu gagal 3 kali dan lulus 2 kali. Hasil di salinan kode asli: lulus 2 dari 2 kali.
   - Saat gagal, pemain ketiga masuk ke lobi yang menampilkan 2 pemain, bukan melihat "Ruang sudah penuh".
   - Kode pemain identik byte, dan Worker hanya berbeda di teks konsol, jadi perubahan JS-16a tidak menyentuh jalur ini. Penyebab pastinya belum ditemukan.
   - Saran: (a) diterima, lalu diselidiki di JS-16b, yang mengubah alur masuk (kode masuk ulang); (b) diselidiki sebelum push.
3. **`jaringan.uji.ts:167`** ("layar kelas ditutup 60 detik lalu dibuka lagi") gagal sekali karena nama belum tampil di layar kelas dalam 20 detik, lalu lulus saat diulang. Pola ini sama dengan uji peka beban di JS-15.
4. **Versi peramban.** Playwright di mesin agen mencari peramban versi 1194, jadi uji dijalankan dengan `JEJAK_CHROMIUM` yang menunjuk Chromium 1243. Ini tidak memengaruhi "Jejak: uji", yang tidak menjalankan uji ujung ke ujung.
5. **Ditemukan dan ditangani selama Build:**
   - Pada deploy produksi pertama Worker `jejak-setara` belum ada, sehingga `wrangler secret list` akan gagal. Langkah "Siapkan kunci Worker" kini membaca daftar Worker lebih dulu, dan berhenti bila daftar tidak terbaca agar kunci sandi tidak pernah dibuat ulang.
   - Langkah deploy produksi memakai `pipefail`, sehingga deploy yang gagal tidak tertutupi oleh versi lama yang masih menjawab `/api/sehat`.
   - `bacaJumlah` menolak `jumlah` null.
   - `utama` diberi anotasi JSDoc agar `tsc --noEmit` bersih.
6. **Dokumen:** nama menu dasbor disesuaikan dengan tangkapan layar pemilik proyek: Storage & databases → D1 SQLite Database.

## Uji manual pemilik proyek

Pemilik proyek menjalankan "Jejak: produksi" (v0.9) pada 24 November 2026, lalu "Jejak: admin awal" dengan lingkungan produksi. Pemeriksaan 25 November 2026 lewat konektor Cloudflare hanya membaca jumlah:

| Butir | Hasil |
|---|---|
| Worker `jejak-setara` | Terpasang 24 Nov 2026 |
| Isi bank produksi | 43 rujukan, 40 kejadian, 3 paket |
| Akun admin produksi | 1 akun admin aktif, sudah masuk, dan sudah mengganti sandi sementara |
| Peninjau | Belum dicentang; wajib sebelum verifikasi Bagian A |
| Rujukan terverifikasi | 0 (verifikasi Bagian A belum dimulai) |
| "Jejak: hentikan" produksi | Tidak dilaporkan |

Sebelum akun produksi dibuat, tercatat 3 percobaan masuk yang gagal di produksi: rahasia GitHub sudah diganti, tetapi "Jejak: admin awal" belum dijalankan dengan lingkungan produksi. Sesudah alur kerja itu dijalankan, masuk berhasil.

## Keputusan: Lulus

Lulus. Diterima pemilik proyek 25 November 2026 (`Diterima: JS-16a`). Penyimpangan 1 dan 2 dicatat diterima dengan saran (a): `skill.uji.ts` utuh dan `gabung.uji.ts:130` ditangani di awal Test JS-16b. Centang Peninjau di konsol produksi masih perlu dikerjakan pemilik proyek.
