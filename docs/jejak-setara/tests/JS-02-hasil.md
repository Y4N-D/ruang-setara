# Hasil uji JS-02 — 7 November 2026

Fitur: inti bersama Jejak Setara ([spesifikasi](../specs/JS-02-inti-bersama.md)).

Salinan uji: ZIP `main` 7 November 2026 ditambah ZIP Gerbang 1 dan Gerbang 2 JS-02, cabang `fitur/JS-02-inti-bersama`. Node 22.23.4.

**Catatan penting tentang lingkungan.** Sesi ini tidak bisa memasang dependensi, karena akses jaringan untuk pemasangan paket tertutup. Akibatnya `pnpm install` gagal, dan perintah yang memerlukan `vitest`, `vite`, plugin Cloudflare, `@playwright/test`, atau konfigurasi ESLint Next tidak bisa dijalankan. Setiap perintah itu diganti pemeriksaan setara dengan alat yang sudah ada di lingkungan agen (tabel "Perintah"). Uji unit, kode, dan dokumen tidak berbeda karena hal ini; yang berbeda hanya alat penjalannya. Alur kerja "Jejak: uji" di GitHub akan menjalankan `content:check:jejak`, `test:jejak` (Vitest sungguhan), dan `build:jejak` sesudah push, dan perintah sisanya dijalankan ulang di sesi berikutnya yang bisa memasang paket (`PLAN.md`, catatan "Plan JS-03, langkah pertama").

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 Kompilasi dan kemurnian | Lulus (pengganti) | TypeScript 6.0.3 dengan pilihan `tsconfig.json` akar (`strict`, `isolatedModules`, `moduleResolution: bundler`), ditambah `noUnusedLocals` dan `noUnusedParameters`, pada keenam berkas `inti/`, keenam berkas uji, dan `teks.ts`: 0 galat. Pengganti ESLint: 43 aturan inti ESLint 10 (termasuk `prefer-const`, `no-var`, `no-unused-vars`, `no-useless-escape`) pada keluaran esbuild ke-12 berkas baru: 0 masalah; berkas contoh yang sengaja salah ditandai 3 masalah. Pencarian teks: tidak ada `any`, `@ts-ignore`, `eslint-disable`, `require(`, tanda `!` non-null, atau ekspor bawaan. `kemurnian.test.ts`: 43 uji lulus, termasuk 25 contoh pelanggaran yang tertangkap dan 11 contoh sah yang tidak tertangkap (komentar dan isi teks diabaikan, ekspresi `${…}` tetap diperiksa) |
| AC-2 Acak | Lulus | `acak.test.ts` 17 uji. Nilai `benih` dan tiga angka pertama `acakBerbenih` sama persis dengan implementasi rujukan terpisah (Python). Dua salinan modul (`vi.resetModules`) memberi urutan sama (catatan di Temuan 1); `kocok` permutasi penuh tanpa mengubah larik asal; `bulat` selalu di dalam batas; 10.000 benih gabungan tanpa tabrakan; chi² 16 kelas dari 160.000 angka di bawah batas p = 0,01 |
| AC-3 Masa dan jam | Lulus | `aturan.test.ts`: nilai batas 0, 0,3, 0,65, dan 1; jam 06.00, 09.36, 13.48, dan 18.00; batas masa tepat pada milidetik untuk ronde 10, 15, dan 20 menit; `formatJam` dua digit; jepitan 0–1; tanda dua menit |
| AC-4 Skor dan peringkat | Lulus | Keenam kombinasi menghasilkan 0, 25, 40, 60, 65, dan 100 (catatan Build B-1: angka 85 di AC-4 salah tulis). Pembanding memutus seri di keempat tingkat; 40 pemain mendapat peringkat 1–40; larik dan objek asal tidak berubah; peringkat kembar ditolak |
| AC-5 Skill | Lulus | Tabel `SKILL`, jeda 2.000 ms (1.999 ditolak), Petunjuk hanya di Langkah 1, skill lain ditolak saat dialog, skill yang dimatikan guru ditolak, muatan habis ditolak tanpa mengubah keadaan, Kompas berhenti di 2 |
| AC-6 Kotak | Lulus | Muncul lagi tepat pada 90.000 ms (89.999 belum); jangkauan 12,0 diterima dan 12,1 ditolak; kotak setiap pemain terpisah |
| AC-7 Gerak | Lulus | `gerak.test.ts` 21 uji: 72 dan 115,2 piksel per detik; diagonal menempuh 72, bukan 72 × √2; batas 13 piksel pada 100 ms diterima, 13,01 ditolak; selang 5 detik dianggap 1 detik (94 piksel); meluncur di dinding; tidak menembus dinding walau selangnya 1 detik; penolakan karena seq, status, dialog, dan selang tanpa koreksi; koreksi hanya untuk kecepatan dan tabrakan. Simulasi 50 pemain jujur × 100 laporan di peta berdinding: 5.000 laporan, 0 ditolak, dan hasilnya sama walau urutan proses diselang-seling |
| AC-8 Peta | Lulus | `peta.test.ts` 45 uji: contoh peta sah terbaca dan lapisannya terurai; 35 kasus cacat ditolak dengan `PETA_CACAT` (RLE cacat, jumlah sel salah, id zona ganda, koordinat di luar peta, kunci tambahan, dan lainnya); 11 teks RLE cacat ditolak; `selPadat` benar di tepi dan di luar peta; RLE bolak-balik untuk 50 larik acak |
| AC-9 Protokol | Lulus | `protokol.test.ts` 106 uji: daftar pesan setiap skema sama persis dengan Architecture 6.3 dan 6.4 (10, 11, 17, dan 7 pesan); setiap pesan punya contoh sah yang lolos tanpa diubah dan contoh cacat yang ditolak; `v` 2, `v` "1", tanpa `v`, dan kunci tambahan ditolak untuk semua 45 contoh sah; batas angka, larik, dan teks ditolak tepat di atas batasnya; `PROTOKOL_VERSI` tetap 1 |
| AC-10 Kejadian | Lulus | Penempatan deterministik dan tidak bergantung urutan daftar, di zona sendiri tanpa titik ganda, galat `TITIK_TIDAK_CUKUP`; keterlihatan termasuk tepi dan dijepit ke tepi peta; kejadian terdekat dengan seri dimenangkan kode terkecil; jangkauan Periksa 32 piksel |
| AC-11 Uji | Lulus (pengganti) | Penjalan pengganti menjalankan ketujuh berkas yang dipilih pola `test:jejak`: 294 uji lulus, yaitu 23 uji JS-01 dan 271 uji baru. Uji mutasi: 20 dari 20 kesalahan yang sengaja dimasukkan ke kode inti tertangkap. `test` dan `RILIS=1 content:check` Sehari Setara tidak bisa dijalankan; JS-02 tidak mengubah satu pun berkas Sehari Setara, dan `vitest.config.ts` Sehari Setara hanya membaca `app/sehari-setara/**/*.test.ts` |
| AC-12 Build dan anggaran | Lulus (pengganti) | `build:jejak` tidak bisa dijalankan. esbuild 0.28.2 membundel halaman dan Worker sebelum dan sesudah JS-02: tanpa zod, dan ukuran gzip halaman berubah −23 B (bagian "Anggaran"). Satu-satunya perbedaan adalah nilai `PROTOKOL_VERSI` yang tidak lagi disisipkan langsung oleh esbuild (`protokol:e` dengan `e=1`); perilaku sama |
| AC-13 Halaman tidak berubah | Lulus (pengganti) | `test:e2e:jejak` tidak bisa dijalankan. Uji asap pengganti: halaman hasil esbuild dan Worker JS-01 di server Node dengan tajuk `_headers`, dibuka Chromium 153 di empat ukuran. `/` dan `/admin/`: 8 dari 8 menampilkan "✓ Server siap", tanpa galat atau peringatan konsol dan tanpa respons 4xx atau 5xx. Halaman uji yang sengaja memakai `skemaServerPemain.safeParse`: 4 dari 4 lulus, jadi zod berjalan di bawah CSP halaman |
| AC-14 Galeri dan Sehari Setara | Lulus (pengganti) | `build:pages` tidak bisa dijalankan. Pengganti: semua berkas teks yang dipindai Tailwind dipecah menjadi token di `main` dan di cabang ini, lalu kompilator Tailwind 4.3.3 dengan `app/globals.css` galeri menyusun CSS dari keduanya: sama persis (bagian "Galeri"). `git diff --name-status` terhadap `main` hanya memuat berkas di daftar spesifikasi |
| AC-15 Dokumen | Lulus | Architecture 5.1 dan 11.1.1 memuat tipe dan bentuk `kampung.json` sesuai spesifikasi dan catatan Build B-7; `PLAN.md` diperbarui; `teks.ts` tidak berubah |

## Perintah yang dijalankan dan hasilnya

| Perintah resmi | Hasil di sesi ini | Pengganti dan hasilnya |
|---|---|---|
| `npx pnpm@11.25.0 install --frozen-lockfile` | Gagal: `ERR_PNPM_META_FETCH_FAIL` (tidak ada jaringan) | `zod` 3.25.76 (versi sama dengan `package.json`), `react` 19.2.8, dan `@types/node` ditautkan dari folder alat agen ke `node_modules` salinan uji, yang diabaikan git |
| `content:check:jejak` | Kode 0: "Belum tersedia: app/jejak-setara/__tests__/konten belum ada (dibuat di JS-05 dan JS-06)." | — |
| `test:jejak` | Tidak bisa (Vitest tidak terpasang) | Penjalan pengganti kecil (`describe`, `it`, `expect`, `vi.resetModules`) di atas pemuat `tsx` 4.23.12: 7 berkas, 294 uji lulus. Pengganti diuji dulu: 10 dari 10 harapan yang sengaja salah dilaporkan gagal |
| `test:jejak:server` · `sim:beban` · `db:migrasi:lokal` | Kode 0: "Belum tersedia (dibuat di JS-03)." | — |
| `peta:build` · `assets:build:jejak` | Kode 0: "Belum tersedia: … (dibuat di JS-06)." dan "(dibuat Sesi C bersama aset tampak atas)." | — |
| `build:jejak` | Tidak bisa (Vite tidak terpasang) | esbuild 0.28.2, dibandingkan dengan cabang sebelum kode JS-02 |
| `test:e2e:jejak` | Tidak bisa (`@playwright/test` dan runtime Workers tidak terpasang) | Uji asap: Playwright 1.63 dengan Chromium 153, 12 dari 12 lulus |
| `test` dan `RILIS=1 content:check` | Tidak bisa (Vitest) | Tidak ada berkas Sehari Setara yang berubah |
| `build:pages` dan SHA-256 ke-178 berkas | Tidak bisa (Vite dan Tailwind PostCSS) | Pemeriksaan token Tailwind: tidak ada perubahan CSS galeri |
| `tsc --noEmit -p tsconfig.json --incremental false` | Tidak bisa untuk seluruh repositori (tipe React, Workers, dan Vitest tidak terpasang) | TypeScript 6.0.3 pada berkas JS-02: 0 galat |
| ESLint `--max-warnings 0` | Tidak bisa (`eslint-config-next` tidak terpasang) | Aturan inti ESLint 10.1.0 pada keluaran esbuild: 0 masalah |
| `git diff --name-status main` | Lulus | Daftar di bawah |

`git diff --name-status` terhadap `main` (ZIP 7 November 2026):

```
A	app/jejak-setara/__tests__/inti/acak.test.ts
A	app/jejak-setara/__tests__/inti/aturan.test.ts
A	app/jejak-setara/__tests__/inti/gerak.test.ts
A	app/jejak-setara/__tests__/inti/kemurnian.test.ts
A	app/jejak-setara/__tests__/inti/peta.test.ts
A	app/jejak-setara/__tests__/inti/protokol.test.ts
A	app/jejak-setara/inti/acak.ts
A	app/jejak-setara/inti/aturan.ts
A	app/jejak-setara/inti/gerak.ts
A	app/jejak-setara/inti/peta.ts
M	app/jejak-setara/inti/protokol.ts
A	app/jejak-setara/inti/tipe.ts
M	docs/jejak-setara/Architecture.md
M	docs/jejak-setara/PLAN.md
A	docs/jejak-setara/specs/JS-02-inti-bersama.md
A	docs/jejak-setara/tests/JS-02-hasil.md
```

## Simulasi beban (bila wajib)

Tidak dijalankan: spesifikasi JS-02 menetapkannya tidak wajib karena belum ada ruang, dan `sim:beban` masih mencetak "Belum tersedia (dibuat di JS-03)." Sebagai gantinya, beban CPU inti untuk satu ruang penuh diukur di Node (bagian berikut).

## Anggaran ukuran dan kinerja

Ukuran bundel esbuild 0.28.2 (diperkecil, gzip tingkat 9). Angka mutlaknya sedikit berbeda dengan Vite di laporan JS-01; yang dibandingkan adalah sebelum dan sesudah JS-02 dengan alat yang sama.

| Berkas | Sebelum JS-02 | Sesudah JS-02 |
|---|---|---|
| Potongan bersama halaman (React dan komponen) | 195.399 B · 61.012 B gzip | 195.409 B · 60.989 B gzip |
| `pemain.js` · `admin.js` | 305 B · 237 B gzip · 324 B · 246 B gzip | sama |
| CSS halaman | 2.279 B · 823 B gzip | sama |
| Worker | 730 B · 516 B gzip | 738 B · 521 B gzip |

- Layar pemain tetap sekitar 62 KB gzip menurut esbuild (61,2 KB menurut Vite di JS-01), sekitar 31% dari anggaran 200 KB. Tidak ada zod di halaman mana pun.
- Bila klien kelak memakai `safeParse` untuk pesan server, zod dan semua skema menambah sekitar 15,8 KB gzip. Klien yang hanya memakai `gerak.ts`, `selPadat`, dan aturan masa serta peringkat menambah 1,3 KB gzip tanpa zod; `bacaPeta` membawa zod (15,4 KB gzip).
- Peta sintetis 120 × 80 ubin (14,1% padat): lapisan tabrakan 2.208 B sebagai RLE, dibandingkan 19.201 B sebagai larik JSON. `kampung.json` contoh tanpa objek 45.211 B, 1.120 B gzip (anggaran 60 KB gzip); lapisan ubin yang sangat bervariasi memperbesar ukuran sebelum gzip.

Kinerja di Node 22 (bukan runtime Workers; diulang di JS-03 dengan alat uji Worker):

| Ukuran | Hasil | Anggaran |
|---|---|---|
| `periksaGerak`: 50 pemain × 10 laporan per detik × 900 detik = 450.000 laporan jujur di peta 120 × 80 berdinding | 250 ms, 0,56 mikrodetik per laporan; 0 ditolak | ≤ 1 ms per `gerak` (Architecture 13.1) |
| `langkahGerak` (60 kali per detik di layar pemain) | 0,18 mikrodetik per langkah | — |
| `hitungPeringkat` 40 pemain | 3,5 mikrodetik | ≤ 5 ms per putaran 50 pemain |
| `tempatkanKejadian` 16 kejadian di 8 zona | 7,1 mikrodetik per ruang | — |
| `safeParse` pesan `gerak` (75 B) | 0,89 mikrodetik | — |
| `safeParse` pesan `dunia` 40 pemain (1.251 B) | 21 mikrodetik | — |
| `bacaPeta` 120 × 80 | 4,6 ms sekali saat memuat | — |

## Galeri

Tailwind galeri membaca semua berkas yang tidak diabaikan git (keputusan 13a JS-01). Pengganti `build:pages`: setiap berkas teks yang dipindai Tailwind di `main` dan di cabang ini dipecah menjadi token dengan beberapa cara (utuh, dipotong tanda baca, dipotong titik dan titik dua). Kompilator Tailwind 4.3.3 dengan `app/globals.css` galeri menyusun CSS dari token `main`, lalu token yang bertambah ditambahkan satu per satu; begitu pula sebaliknya untuk token yang hilang.

- Berkas teks yang dipindai: 383 di `main` dan 396 di cabang ini (gambar, huruf, CSS, dan lockfile dilewati, seperti Tailwind).
- Token yang bertambah atau hilang yang mengubah CSS: tidak ada. CSS dari token kedua pohon sama persis (137.372 B di kedua sisi, tanpa `tw-animate-css` yang tidak terpasang). Token yang mirip utilitas `tw-animate-css` (tidak terpasang, diperiksa menurut nama): tidak ada.
- Pemeriksa ini diuji dua kali dengan nama utilitas Tailwind yang belum dipakai galeri: sekali di berkas sementara, dan sekali tanpa sengaja di draf laporan ini. Keduanya tertangkap, dan kalimat draf itu sudah diganti.

## Daftar periksa manual (AGENTS bagian 9)

Tidak ada butir yang berlaku: belum ada permainan, jaringan, atau perangkat. Butir privasi terpenuhi dengan sendirinya, karena inti tidak menyimpan data.

## Temuan

1. **Lingkungan tanpa pemasangan paket.** Delapan perintah tahap Test diganti pemeriksaan setara (tabel "Perintah"). Batas pengganti: TypeScript 6.0.3 dipakai sebagai ganti 5.9.3; ESLint memakai aturan inti saja, tanpa aturan React dan Next yang tidak relevan bagi kode tanpa komponen; `vi.resetModules` di pengganti tidak memuat salinan modul baru, sehingga bagian "dua salinan modul" AC-2 baru benar-benar diuji Vitest di alur kerja "Jejak: uji"; ukuran halaman diukur dengan esbuild, bukan Rolldown. Semua perintah resmi dijalankan ulang di awal Plan JS-03.
2. **AC-4 salah tulis.** Angka 85 tidak mungkin dicapai dengan poin PRD 8.4. Spesifikasi diberi catatan **[Build]** di AC-4 dan catatan B-1; poin tidak berubah.
3. **P-26 menggabungkan dua hal.** Gerak di layar pemain (normalisasi diagonal, peluncuran di dinding) dan pemeriksaan laporan di server dibuat sebagai dua fungsi. Pemeriksaan server juga memastikan tujuan bisa dicapai tanpa menembus ubin padat, karena pada selang 1 detik batas jaraknya 94 piksel, cukup untuk melompati dinding satu ubin. Catatan B-5; Architecture 8.2 disesuaikan.
4. **Panjang token.** Spesifikasi meminta token 43 karakter base64url (32 byte), sedangkan Architecture 6.8 menulis 128 bit. Architecture 6.8 disesuaikan menjadi 256 bit (catatan B-8). Bila pemilik proyek lebih suka 128 bit (22 karakter), cukup satu baris skema diubah sebelum JS-03.
5. **Halaman kerangka mengimpor `protokol.ts`.** `HalamanKerangka.tsx` (JS-01) mengambil `PROTOKOL_VERSI` dari `protokol.ts`, sehingga skema zod bisa ikut terbundel ke halaman. Skema dibuat lewat fungsi dan ditandai `/* @__PURE__ */` agar bisa dibuang (catatan B-9); esbuild membuktikannya, Rolldown diperiksa di JS-03.
6. **Format Architecture.** Paragraf JS-02 di bagian 5.1 (ZIP Gerbang 2) berada di dalam blok kode, dan judul 11.1.1 memakai tingkat 5. Keduanya dirapikan.
7. **Permintaan Sesi B.** `naskah/STATUS.md` di ZIP ini memuat Permintaan A-1 sampai A-4 untuk PRD dan Design System. Permintaan itu dibaca, tetapi dikerjakan atau dijawab di Plan JS-03, karena Plan JS-02 sudah lewat dan perubahannya di luar cakupan spesifikasi. Tidak menghambat JS-05.
8. **Jitter jaringan.** Laporan gerak yang tiba berdempet memampatkan selang di server, sehingga gerak jujur bisa dikoreksi. Dicatat untuk Plan JS-03 dan uji jaringan.

## Keputusan: Lulus

Lulus dengan pemeriksaan pengganti untuk AC-1 dan AC-11 sampai AC-14. Keputusan ini menjadi final bila alur kerja "Jejak: uji" hijau sesudah push dan perintah resmi yang belum dijalankan lulus di awal Plan JS-03. Bila salah satunya gagal karena kode JS-02, JS-02 kembali ke Build.
