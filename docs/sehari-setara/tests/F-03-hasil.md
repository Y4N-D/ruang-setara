# Hasil uji F-03 — 21 Oktober 2026

Spesifikasi: [`specs/F-03-konten-adegan.md`](../specs/F-03-konten-adegan.md). Lingkungan: Node 22.22.2, pnpm 11.25.0, Vite 8.0.13, Vitest 5.0.4, zod 3.25.76, Chromium 141.0.7390.37 (headless, di lingkungan agen).

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 | Lulus | Naskah di `scenes.ts`, `references.ts`, dan `roles.ts` dibandingkan otomatis dengan bagian naskah di spesifikasi: 247 butir (teks, angka, posisi, pose, arah hadap, ikon emosi, rujukan), 0 selisih |
| AC-2 | Lulus | Uji "sama dengan PRD bagian 8" lulus. Lima uji perubahan (teks pilihan, efek, tingkat, situasi, varian adegan 6) membuktikan selisih dengan PRD tertangkap |
| AC-3 | Lulus | Aturan 1–11 lulus untuk naskah asli. Tujuh belas uji pelanggaran membuktikan setiap aturan menangkap kesalahannya, termasuk berkas aset yang hilang |
| AC-4 | Lulus | `references.ts` memuat R-01 sampai R-12 sesuai tabel spesifikasi; setiap pilihan merujuk kode adegannya; R-08 dan R-11 mengikuti keputusan pemilik proyek |
| AC-5 | Lulus | `Verifikasi_Rujukan.md` berisi 12 butir berkotak kosong dengan teks yang sama dengan `references.ts` |
| AC-6 | Lulus | Contoh daftar centang: `[x]` dengan teks sama terverifikasi; `[ ]` → "belum dicentang"; teks berbeda → "teks di daftar berbeda"; kode hilang dan baris rusak → "tidak ada di daftar"; `[X]` dan spasi berlebih tetap terbaca. Tidak ada yang membuat uji gagal |
| AC-7 | Lulus | `content:check` kode 0 dan mencetak "Verifikasi rujukan: 0 dari 12 terverifikasi." beserta 12 baris. Dengan `RILIS=1`, kode 1 dengan pesan "Rilis diblokir: 12 rujukan belum terverifikasi." |
| AC-8 | Lulus | `ROLES` berisi Polisi, Jaksa, Advokat, Hakim beserta tugasnya; kuis adegan 5 menjawab `hakim` |
| AC-9 | Lulus | `Reference` menjadi `{ id, text }`, `CharId` memuat `siswa` dan `warga`, `RoleInfo` ada; 66 uji F-02 tetap lulus |
| AC-10 | Lulus | Dengan naskah asli: semua B → `setara`, B-B-B-C-C-C → `hampir`, semua A → `berat`; varian adegan 6 muncul hanya bila pilihan B adegan 4 diambil |
| AC-11 | Lulus | `npx pnpm@11.25.0 test`: 3 file, 102 uji lulus, 1 dilewati (uji mode rilis, hanya berjalan dengan `RILIS=1`). `install --frozen-lockfile` kode 0. `package.json` hanya bertambah skrip `content:check` |
| AC-12 | Lulus | `build:pages` kode 0. HTML permainan, HTML galeri, dan daftar berkas `assets/` identik dengan hasil F-02; teks naskah dan `zod` tidak ditemukan di JS dan CSS permainan. Pemeriksaan browser: 14 pemeriksaan lulus |
| AC-13 | Lulus | `tsc --noEmit` seluruh proyek: 0 galat. ESLint `--max-warnings 0` pada `content/`, `engine/`, dan `__tests__/`: kode 0. Tidak ada `any` |
| AC-14 | Lulus | Architecture 0.4, AGENTS 0.4, PRD (bagian 8, 14, 17), Daftar_Aset, dan PLAN sesuai bagian "Skrip dan perubahan dokumen" |

## Perintah yang dijalankan dan hasilnya

1. `npx pnpm@11.25.0 install --frozen-lockfile`: kode 0; lockfile tidak berubah.
2. `npx pnpm@11.25.0 test --reporter=verbose`: kode 0.

   ```
   ✓ app/sehari-setara/__tests__/reducer.test.ts (45 tests)
   ✓ app/sehari-setara/__tests__/rules.test.ts (21 tests)
   ✓ app/sehari-setara/__tests__/content.test.ts (37 tests | 1 skipped)
   Test Files  3 passed (3)
        Tests  102 passed | 1 skipped (103)
   ```

3. `npx pnpm@11.25.0 content:check`: kode 0. Keluaran laporannya:

   ```
   Verifikasi rujukan: 0 dari 12 terverifikasi.
   Belum terverifikasi:
   - R-01 Pasal 28B ayat (2) UUD NRI 1945 (belum dicentang)
   …
   - R-12 UU No. 48 Tahun 2009, Pasal 8 ayat (1) (asas praduga tak bersalah) (belum dicentang)
   ```

4. `RILIS=1 npx pnpm@11.25.0 content:check`: kode 1, sesuai harapan: `Error: Rilis diblokir: 12 rujukan belum terverifikasi.`
5. Uji sementara yang membuang naskah ke JSON, lalu skrip pembanding dengan spesifikasi: 247 butir, 0 selisih. Uji sementara itu dihapus dan tidak ikut di repositori.
6. `npx pnpm@11.25.0 build:pages`: kode 0. `cmp` terhadap hasil F-02: HTML permainan, HTML galeri, dan daftar berkas `assets/` identik. Pencarian "Kelas Ramah", `komangDibela`, "Verifikasi rujukan", dan `ZodError` di JS dan CSS permainan: tidak ditemukan.
7. `node scripts/game/serve-subpath.mjs --port 4184`, lalu pemeriksaan browser F-01: 14 pemeriksaan lulus.
8. `npx tsc --noEmit -p tsconfig.json --incremental false`: 0 galat. `npx eslint --max-warnings 0 app/sehari-setara/content app/sehari-setara/engine app/sehari-setara/__tests__`: kode 0.
9. `git diff --name-status` terhadap keadaan F-02: 16 berkas, 8 baru dan 8 diubah (termasuk laporan ini).
10. Daftar periksa manual AGENTS bagian 9: belum ada butir yang berlaku, karena halaman tidak berubah.

## Temuan

1. **Pemeriksa konten kini berjalan di CI.** Langkah "Uji game" menjalankan uji konten setiap kali ada push. Kesalahan naskah, atau selisih naskah dengan PRD bagian 8, menahan terbitan. Status verifikasi rujukan baru menahan terbitan setelah mode rilis diaktifkan di F-11.
2. **Langkah menuju rilis.** Pemilik proyek dapat mulai mencentang `Verifikasi_Rujukan.md` setelah F-03 terbit. Laporan di CI dan di `content:check` langsung menunjukkan jumlah rujukan yang sudah terverifikasi.
3. **Aset yang belum dipakai.** Sprite `char_warga_b` dan ikon `emote_tanya` belum dipakai naskah. Keduanya tetap di repositori untuk kemungkinan dipakai nanti.
4. **Posisi tokoh masih bisa berubah.** Posisi diambil dari pratinjau yang sudah disetujui dan dapat disesuaikan saat panggung dibangun (F-04), lewat spesifikasi fitur itu.

## Keputusan: Lulus

Keempat belas kriteria lulus. `test`, `content:check`, dan `build:pages` lulus, halaman permainan tanpa galat konsol dan tanpa respons 4xx, dan mode rilis memblokir dengan benar. `test:e2e` dikecualikan sesuai keputusan Gerbang 1.
