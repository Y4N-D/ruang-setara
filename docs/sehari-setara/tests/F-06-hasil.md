# Hasil uji F-06 — 23 Oktober 2026

Fitur: indikator dan kartu dampak ([spesifikasi](../specs/F-06-indikator-kartu-dampak.md)). Lingkungan: Node 22.22.2, pnpm 11.25.0, Playwright 1.56.1 dengan Chromium 141, di salinan repositori dari ZIP commit `ca2f848`.

| Kriteria | Hasil | Bukti |
|---|---|---|
| AC-1 Panel indikator | Lulus | `e2e/kartu-dampak.spec.ts`, 12 uji "kartu dan indikator di {ukuran}, jalur semua A/B/C": letak dan ukuran panel (±1 px), label satu baris, ikon 16p, batang 71p × 12p, segmen 6p × 10p, tanpa luapan; panel tidak ada di layar kerangka, pratinjau, dan layar akhir sementara |
| AC-2 Nilai yang tampil | Lulus | Uji yang sama: nilai di narasi, pilihan, reaksi, kartu pada 0 ms, sesudah gerak, dan saat pergantian adegan sama dengan `metersFromHistory`, pada tiga jalur di empat ukuran; `indikator_reaksi_adegan_1_1280x720.png` |
| AC-3 Segmen | Lulus | `data-isi` sama dengan `segmentFills` di setiap pemeriksaan nilai; segmen separuh kewajiban 65 berwarna `rgb(58, 134, 217)` pada 50 %; `kartu_kurang_adegan_3c_1280x720.png` (nilai 45) |
| AC-4 Gerak indikator | Lulus | Uji "gerak indikator per 100 ms bersama kartu": nilai pada 0, 100, 200, 300, 400, dan 500 ms sama dengan `meterValueAt` di adegan 1 sampai 3 (jalur A, C, B) |
| AC-5 Angka melayang | Lulus | `checkDeltas` di ke-18 kartu pada empat ukuran: teks efek naskah termasuk "0" dan "+15" saat mentok, U+2212, Pixelify Sans, latar menurut arah, teks `ink`, `ss-delta-rise` 0,24 s `steps(2)`, hilang sesudah kartu ditutup, tidak menyentuh label kedua; `kartu_tepat_adegan_5b_1280x720.png`, `kartu_berisiko_adegan_2a_1280x720.png` |
| AC-6 Isi kartu | Lulus | `checkCard` di ke-18 kartu pada empat ukuran: warna kepala, ikon `emote_*`, tulisan tingkat, "Kelas memilih X.", judul bagian, isi, dan rujukan sama dengan naskah. Kartu belum tampil pada 1.150 ms dan tampil pada 1.200 ms (jam uji); jeda nyata 1.150–1.600 ms (uji F-05 yang disesuaikan) |
| AC-7 Letak dan ukuran kartu | Lulus | `checkCard`: kiri sama dengan tepi kiri bingkai panggung, atas 9,2u, jarak kanan 2u, jarak bawah 1,2u (±1 px), ukuran huruf ±0,05u, tanpa luapan ke bawah atau ke samping, panel bawah kosong; uji tata letak F-05 yang disesuaikan di empat ukuran; tangkapan layar 1280×720, 1024×768, dan 1920×1080 |
| AC-8 Fokus dan dialog | Lulus | Uji "fokus, dialog, keyboard, dan pengaman tekanan ganda": `role="dialog"`, `aria-modal`, nama "Kartu dampak: Tepat", fokus di judul, Tab dan Shift+Tab tetap di "Lanjut", `Escape`, `1`, dan `b` tanpa pengaruh, fokus pindah ke tombol narasi adegan berikutnya dan ke judul layar akhir |
| AC-9 Pengaman tekanan ganda | Lulus | Uji yang sama dan uji kurangi gerak: pada 599 ms `aria-disabled="true"` dan klik, `Spasi`, `Enter` tidak berpengaruh; pada 600 ms satu `Spasi` melanjutkan; dua `Enter` cepat dan klik ganda hanya satu adegan; `Spasi` yang ditahan (`repeat`) diabaikan |
| AC-10 Lanjut ke adegan berikutnya | Lulus | Uji yang sama: kuis tidak tampil di adegan 5, tombol jembatan baris status tidak pernah ada, layar akhir sementara sesudah adegan 6; sapuan dan pudar diperiksa uji F-05 yang disesuaikan |
| AC-11 Kurangi gerak | Lulus | Uji "kurangi gerak": nilai langsung 40 dan 35, tanpa angka melayang, `getAnimations()` kosong, masa tunggu tetap 600 ms; `kartu_kurangi_gerak_1280x720.png` |
| AC-12 Pembaca layar | Lulus | `checkCard`: isi `aria-live` sama dengan `impactAnnouncement` di ke-18 kartu, judul `H2`, judul bagian `H3`, ikon tingkat `aria-hidden`; panel: grup "Indikator", dua `role="meter"` dengan `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, dan `aria-valuetext` sesuai nilai, baris batang dan ikon `aria-hidden` |
| AC-13 Kontras | Lulus | Rasio ≥ 4,5:1 terukur untuk tulisan tingkat dan "Kelas memilih X." (atas `leaf`, `mango`, `coral`), judul bagian `dusk`, isi kartu, label dan angka nilai indikator, serta angka melayang, di empat ukuran |
| AC-14 Main sampai akhir | Lulus | Keyboard saja di 1280×720: jalur semua A, semua B, dan semua C (`kartu-dampak.spec.ts`), serta B×6, A×6, dan B-B-B-C-C-C (`alur-permainan.spec.ts`); semua uji memanggil `expectClean`: 0 galat konsol, 0 respons 4xx/5xx, 0 permintaan ke host lain |
| AC-15 Uji unit | Lulus | `impact.test.ts` 16 uji lulus (konstanta, segmen, gerak, angka melayang, nilai sebelum memilih, pengumuman termasuk kedua contoh spesifikasi, ikon tingkat ke-18 pilihan); uji unit lain tidak berubah dan lulus |
| AC-16 Uji F-04 dan F-05 | Lulus | 28 uji `alur-permainan.spec.ts` dan `sehari-setara.spec.ts` lulus dengan penyesuaian di spesifikasi bagian "Rencana uji" |
| AC-17 Build | Lulus | `build:pages` lulus; JS permainan 46,65 KB (15,40 KB gzip) ditambah React 60,18 KB gzip, sekitar 76 KB dari 150 KB; penanda `__THREE__` 0; `src` dan `href` HTML permainan relatif (`../`); `index.html`, `main-*.css`, `main-*.js`, dan `jsx-runtime-*.js` identik byte dengan build sebelum F-06 |
| AC-18 Pemeriksaan kode | Lulus | `tsc --noEmit` 0 galat; ESLint `--max-warnings 0` lulus pada 9 berkas kode baru dan yang diubah; tanpa `any`; `engine/` tidak berubah dan tanpa `setTimeout`; pengatur waktu kartu dibersihkan saat fase berganti atau layar ditutup |
| AC-19 Dokumen dan cakupan | Lulus | Daftar berkas di bagian berikut; `package.json`, `pnpm-lock.yaml`, `scenes.ts`, `references.ts`, `content.test.ts`, dan `Verifikasi_Rujukan.md` tidak berubah (tidak ada kotak dicentang); `install --frozen-lockfile`, `content:check`, dan `test` lulus |

## Perintah yang dijalankan dan hasilnya

| Perintah | Hasil |
|---|---|
| `npx pnpm@11.25.0 install --frozen-lockfile` | Lulus (18 detik); lockfile tidak berubah |
| `npx pnpm@11.25.0 content:check` | Lulus: 36 uji, 1 dilewati (uji mode rilis yang hanya berjalan dengan `RILIS=1`) |
| `npx pnpm@11.25.0 test` | Lulus: 7 berkas, 174 uji, 1 dilewati (16 uji baru di `impact.test.ts`) |
| `npx pnpm@11.25.0 build:pages` | Lulus (8,5 detik); ukuran di AC-17 |
| `npx pnpm@11.25.0 test:e2e` | Lulus, dijalankan dalam dua bagian dengan konfigurasi yang sama (Temuan 6): `alur-permainan.spec.ts` dan `sehari-setara.spec.ts` 28 uji (2,3 menit); `kartu-dampak.spec.ts` 15 uji (55 detik) |
| `npx tsc --noEmit -p tsconfig.json --incremental false` | 0 galat |
| `npx eslint` (9 berkas, `--max-warnings 0`) | 0 masalah |
| `sha256sum` berkas galeri | Identik dengan build sebelum F-06, juga sesudah semua dokumen F-06 ditulis |

Uji ujung ke ujung dasar sebelum F-06 (28 uji) juga lulus pada 23 Oktober 2026.

Berkas yang dibuat atau diubah F-06:

| Status | Berkas |
|---|---|
| Baru | `app/sehari-setara/ui/impact.ts`, `ui/Meters.tsx`, `ui/ImpactCard.tsx`, `__tests__/impact.test.ts` |
| Baru | `e2e/kartu-dampak.spec.ts` |
| Baru | `docs/sehari-setara/specs/F-06-indikator-kartu-dampak.md`, `tests/F-06-hasil.md`, tujuh tangkapan layar di `tests/F-06/` |
| Diubah | `app/sehari-setara/ui/PlayScreen.tsx`, `content/copy.ts`, `styles/game.css` |
| Diubah | `e2e/alur-permainan.spec.ts`, `e2e/bantuan.ts` |
| Diubah | `docs/sehari-setara/PLAN.md`, `Design_System.md` (0.6), `Architecture.md` (0.8) |

Tangkapan layar di `tests/F-06/`: `kartu_tepat_adegan_5b_1280x720.png`, `kartu_tepat_adegan_5b_1024x768.png`, `kartu_tepat_adegan_5b_1920x1080.png`, `kartu_berisiko_adegan_2a_1280x720.png`, `kartu_kurang_adegan_3c_1280x720.png`, `indikator_reaksi_adegan_1_1280x720.png`, dan `kartu_kurangi_gerak_1280x720.png`.

## Temuan

1. **Celah antarindikator menjadi 7u.** Dengan celah 6u dari spesifikasi, angka melayang pertama yang sedang naik sempat menutup label indikator kedua sampai 2,97 px di 1920×1080, dan hal serupa terjadi di 1024×768. Penyebabnya, celah 6u lebih kecil daripada jarak 0,6u, tinggi kotak angka, dan gerak naik 4p jika dijumlahkan. Celah diubah menjadi 7u dengan persetujuan pemilik proyek (23 Oktober 2026, balasan `Lanjutkan`). Spesifikasi, Design System, dan `PLAN.md` mencatat perubahan ini.
2. **Ikon dipasang sebagai gambar latar.** Aturan ESLint repositori (`@next/next/no-img-element`) memberi peringatan untuk `<img>`, sehingga `--max-warnings 0` gagal. Ikon indikator dan ikon tingkat kini berupa `span` berlatar gambar dengan `aria-hidden="true"`. Bagi pembaca layar, hasilnya sama dengan `alt=""`.
3. **Masa tunggu dihitung sejak kartu benar-benar tampil.** Satu uji awal memajukan jam uji 1.800 ms sekaligus, lalu langsung menekan `Spasi`, dan tekanannya diabaikan. React baru menggambar kartu sesudah jam selesai dimajukan, jadi masa tunggu baru dimulai saat itu. Perilaku ini sesuai spesifikasi. Uji diperbaiki dengan memajukan jam dalam dua langkah, dan aturannya dicatat di `PLAN.md` untuk fitur berikutnya.
4. **Klik selama masa tunggu.** `locator.click()` Playwright menunggu tombol ber-`aria-disabled` menjadi aktif, sehingga uji klik selama masa tunggu memakai `force: true`.
5. **Pita tipis panggung di atas kartu pada 1024×768.** Di layar 4:3, panggung mengisi seluruh tinggi area panggung, sehingga celah 1,2u (sekitar 7 px) antara bilah atas dan kartu memperlihatkan tepi atas panggung. Di 1280×720 dan 1920×1080 celahnya hanya sekitar 0,2u, dan di 1366×768 tidak terlihat. Hal ini kosmetik dan sesuai ukuran spesifikasi. Usul untuk ditinjau di fitur berikutnya: kartu mulai tepat di bawah bilah atas, atau panggung disamarkan selama kartu tampil.
6. **Uji ujung ke ujung dijalankan dua bagian.** Lingkungan agen membatasi satu perintah 300 detik, sedangkan seluruh uji membutuhkan sekitar 3,5 menit. Kedua bagian memakai `playwright.config.ts` yang sama, termasuk `build:pages` dan `serve-subpath.mjs`, dan dijalankan sesudah perubahan kode terakhir.
7. **Ukuran:** JS permainan naik dari 13,93 KB menjadi 15,40 KB gzip, dan CSS permainan dari 2,73 KB menjadi 3,51 KB gzip. Anggaran tetap terpenuhi.
8. **Di luar cakupan F-06, masih menunggu keputusan:** uji konten AC-5 F-03 gagal begitu satu kotak `Verifikasi_Rujukan.md` dicentang, dan PRD bagian 8 masih memuat baris rujukan lama. Keduanya sebaiknya dibereskan sebelum pemilik proyek mulai mencentang.

Daftar periksa manual (AGENTS bagian 9):

- [x] Bisa dimainkan sampai akhir hanya dengan keyboard (AC-14).
- [x] Mode kurangi gerak mematikan sapuan, animasi sprite, gerak indikator, dan angka melayang (AC-11 dan uji F-05).
- [x] Tampilan rapi di 1024×768 dan 1920×1080, diperiksa dari tangkapan layar (lihat Temuan 5).
- [ ] Teks dialog terbaca dari jarak sekitar 8 meter di proyektor: belum diuji, untuk dicek pemilik proyek.
- [ ] Berjalan lancar di laptop kelas bawah dengan suara mati: belum diuji, untuk dicek pemilik proyek.

## Keputusan: Lulus
