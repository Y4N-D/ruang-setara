# F-12 — Integrasi aset: `manifest.ts`, uji palet, uji kelengkapan manifest

| | |
|---|---|
| Status | Disetujui 21 Oktober 2026 (`Spesifikasi disetujui: F-12`) |
| Tanggal | 21 Oktober 2026 |
| Rencana | `docs/sehari-setara/PLAN.md`, entri F-12 (disetujui 21 Oktober 2026 dengan balasan `Setuju: F-12`; keenam usulan diterima) |

## Ringkasan

F-12 membuat `app/sehari-setara/assets/manifest.ts`, satu-satunya pintu masuk aset gambar. Manifest mendaftarkan ke-63 PNG yang sudah Disetujui, lengkap dengan jumlah bingkai, fps, dan ukuran setiap strip. Manifest juga menyediakan dua fungsi pencari yang akan dipakai panggung di F-04.

Uji Vitest baru menjaga empat hal:

- warna di `game.css` sama dengan Design System bagian 4 dan `palette.json`;
- manifest, berkas, `CREDITS.md`, dan naskah saling cocok;
- ukuran aset tetap dalam anggaran;
- aset game selalu menjadi berkas terpisah di hasil build.

Manifest belum dipakai layar, jadi halaman yang terbit tidak berubah. Aturan build dibuktikan lewat build percobaan di salinan sementara (keputusan Gerbang 1 nomor 6).

Asal setiap nilai ditandai seperti di F-03:

| Tanda | Arti |
|---|---|
| **[Berkas]** | Diukur dari PNG di repositori dan cocok dengan `Daftar_Aset.md` |
| **[Dokumen]** | Dari Design System, Architecture, atau AGENTS; bagiannya disebut |
| **[Pemilik]** | Keputusan pemilik proyek di Gerbang 1 |
| **[DRAF]** | Usulan baru dari agen. Mohon ditinjau |

## Kaitan PRD

| Acuan | Yang dipenuhi F-12 |
|---|---|
| PRD bagian 10 (kinerja) | Total aset ≤ 4 MB dan kode game ≤ 150 KB gzip tetap terjaga, karena aset game tidak menambah ukuran kode |
| PRD bagian 11 dan 14 | Aset yang disetujui siap dipakai; palet diperiksa otomatis agar gaya tetap konsisten |
| Architecture bagian 8 | Manifest, penamaan berkas, dan anggaran per aset; aset game sebagai berkas berhash (keputusan A5) |
| Architecture bagian 12 | Lapisan uji Aset dengan Vitest |
| Design System bagian 4, 8, 10, 11 | Token warna dan palet; fps sprite; ukuran tokoh, latar, dan ikon |
| AGENTS bagian 7 (aturan 1, 5, 6) dan bagian 9 | Aset hanya lewat manifest; hanya warna palet; anggaran ukuran; setiap aset tercatat di `CREDITS.md` |
| Keputusan Gerbang 1 | F-12 sebelum F-04; aset sebagai berkas terpisah; `__pycache__/` di `.gitignore`; pembaruan dokumen; tanpa placeholder; cara uji |

## Perilaku

Uji warna:

- Diberikan keadaan repositori sekarang, ketika `test` dijalankan, maka semua uji aset lulus dan ringkasan aset tercetak (lihat "Teks yang tampil").
- Diberikan token `--ss-*` di blok `:root` `game.css` yang nilainya berbeda dari blok token Design System bagian 4, ketika `test` dijalankan, maka uji gagal dengan pesan yang menyebut tokennya. Hal yang sama berlaku bila token Design System hilang dari `game.css`, atau bila `game.css` punya token `--ss-*` yang tidak ada di Design System.
- Diberikan token warna dasar yang nilainya berbeda dari konstanta pasangannya di `palette.json`, ketika `test` dijalankan, maka uji gagal. Pasangan ditentukan dengan membuang `--ss-` dan tanda hubung, lalu mengubahnya menjadi huruf besar (`--ss-sky-d` → `SKYD`).
- Diberikan warna hex atau `rgb()` di nilai deklarasi `game.css` yang tidak ada di `palette.json`, ketika `test` dijalankan, maka uji gagal dengan pesan yang menyebut barisnya. Komponen alfa diabaikan, jadi `rgb(31 42 68 / 0.10)` dihitung sebagai `ink`.
- Diberikan warna dalam format lain, seperti `hsl()`, ketika `test` dijalankan, maka uji gagal dengan pesan yang meminta hex atau `rgb()`.

Uji manifest:

- Diberikan entri manifest yang menunjuk berkas yang tidak ada, atau berkas yang namanya tidak sesuai kuncinya, ketika `test` dijalankan, maka uji gagal.
- Diberikan satu berkas yang terdaftar dua kali di manifest, ketika `test` dijalankan, maka uji gagal.
- Diberikan ukuran PNG yang tidak sama dengan ukuran di manifest, ketika `test` dijalankan, maka uji gagal.
  - Untuk strip, ukuran yang diharapkan adalah jumlah bingkai × lebar bingkai, dengan tinggi bingkai.
  - Untuk gambar tunggal, ukuran yang diharapkan adalah ukuran kelompoknya.
  - Aturan ini juga menangkap kanvas aset terdaftar yang diubah tanpa memperbarui manifest.
- Diberikan strip tokoh dengan fps di luar rentang Design System bagian 8 (berjalan 6–8, lainnya 2–4) atau fps yang bukan bilangan bulat, ketika `test` dijalankan, maka uji gagal.
- Diberikan berkas yang terdaftar di manifest tetapi tidak tercatat di `CREDITS.md`, ketika `test` dijalankan, maka uji gagal.
- Diberikan latar, pasangan tokoh-pose, atau ikon emosi di `scenes.ts` yang tidak ada di manifest, ketika `test` dijalankan, maka uji gagal dengan pesan yang menyebut adegan dan kunci asetnya.
- Diberikan PNG di subfolder `assets/` yang belum terdaftar di manifest, atau baris `CREDITS.md` yang berkasnya belum terdaftar, ketika `test` dijalankan, maka keduanya hanya **dilaporkan** di ringkasan dan uji tetap lulus. **[DRAF]** Alasannya:
  - aset yang sedang ditinjau boleh sudah ada di repositori sebelum dipakai kode (AGENTS bagian 9);
  - berkas yang tidak diimpor kode tidak ikut terbit.

Uji anggaran:

- Diberikan satu latar atau ilustrasi akhir di atas 40 KB, satu strip tokoh di atas 15 KB, atau seluruh aset terdaftar di atas 4 MB, ketika `test` dijalankan, maka uji gagal.

Fungsi pencari:

- Diberikan pasangan tokoh-pose yang ada, ketika `spriteFor(char, pose)` dipanggil, maka strip itu dikembalikan. Bila pasangan tidak ada, termasuk nama properti bawaan objek seperti `constructor`, maka hasilnya `undefined` tanpa galat.
- Diberikan satu adegan, ketika `sceneAssets(scene)` dipanggil, maka hasilnya adalah daftar aset panggung adegan itu tanpa duplikat.
  - Urutannya: latar, tokoh di pemeran, tokoh di reaksi A, B, dan C, lalu ikon emosi pilihan A, B, dan C.
  - Setiap butir berisi kunci, yaitu nama berkas tanpa `.png`, dan `src`.
  - `src` bernilai `undefined` bila aset tidak ada di manifest.

Build:

- Diberikan halaman yang mengimpor aset dari `app/sehari-setara/assets/`, ketika `build:pages` dijalankan, maka setiap aset itu menjadi berkas berhash di `dist-pages/assets/` dengan URL relatif. Aset itu tidak pernah diselipkan sebagai data URI, berapa pun ukurannya. Berkas lain tetap memakai aturan bawaan Vite.
- Diberikan F-12 selesai, ketika `build:pages` dijalankan di repositori, maka `dist-pages/` identik dengan hasil sebelum F-12, karena manifest belum diimpor layar.
- Diberikan pembuat aset menjalankan `npx pnpm@11.25.0 assets:build`, ketika skrip selesai, maka yang berjalan adalah `python scripts/game/art/build_assets.py`. Folder `__pycache__/` yang ditinggalkannya tidak muncul sebagai perubahan di GitHub Desktop.

## Status antarmuka

Tidak ada antarmuka baru. `Game.tsx` belum mengimpor manifest, jadi halaman yang terbit tetap layar kerangka F-01.

## Teks yang tampil (final)

Tidak ada teks baru untuk siswa atau guru. Teks berikut hanya tampil untuk pengembang, di terminal dan log CI. **[DRAF]**

Ringkasan, dicetak setiap kali uji aset berjalan:

```
Aset game: 63 berkas terdaftar, 61,4 KB dari anggaran 4 MB.
Belum terdaftar di manifest: tidak ada.
Tercatat di CREDITS.md tetapi belum terdaftar: tidak ada.
```

Bila ada berkas yang perlu dilaporkan, "tidak ada" diganti daftar berkas, satu per baris dengan awalan "- ". Ukuran ditulis dengan satu angka di belakang koma desimal. 1 KB = 1024 byte, sama dengan `build_assets.py`.

Pesan kegagalan:

| Aturan | Contoh pesan |
|---|---|
| Token berbeda dari Design System | `game.css: --ss-focus bernilai var(--ss-mango), seharusnya var(--ss-sun) (Design System bagian 4).` |
| Token Design System hilang | `game.css: token --ss-leaf dari Design System bagian 4 tidak ada.` |
| Token tambahan | `game.css: token --ss-sky tidak ada di Design System bagian 4.` |
| Token berbeda dari palet | `game.css: --ss-sun bernilai #FFD240, seharusnya #FFD23F (palette.json SUN).` |
| Token tanpa pasangan palet | `game.css: --ss-gold tidak punya pasangan di palette.json.` |
| Warna di luar palet | `game.css baris 40: warna #123456 tidak ada di palette.json.` |
| Format warna lain | `game.css baris 40: warna hsl(0 0% 0%) tidak didukung; pakai hex atau rgb().` |
| Berkas tidak ada | `Manifest: sprites.nara.idle menunjuk berkas yang tidak ada: sprites/char_nara_idle.png.` |
| Nama berkas tidak sesuai kunci | `Manifest: sprites.nara.idle menunjuk sprites/char_nara_talk.png, seharusnya sprites/char_nara_idle.png.` |
| Terdaftar dua kali | `Manifest: ui/ui_star.png terdaftar lebih dari sekali (iconStrips.star, icons.star).` |
| Ukuran strip tidak cocok | `Manifest: sprites.nara.walk berukuran 100×62, seharusnya 104×62 (4 bingkai × 26×62).` |
| Ukuran gambar tunggal tidak cocok | `Manifest: icons.hak berukuran 16×17, seharusnya 16×16.` |
| fps di luar rentang | `Manifest: sprites.nara.walk fps 12 di luar rentang 6–8.` |
| Belum tercatat di kredit | `CREDITS.md: sprites/char_nara_walk.png belum tercatat.` |
| Aset naskah tidak ada | `Adegan s3: char_sinta_marah tidak ada di manifest.` |
| Kelompok tidak lengkap | `Manifest: roleIcons belum punya gambar untuk hakim.` |
| Anggaran latar | `bg/bg_s1_rumah_pagi.png: 41,2 KB melebihi anggaran latar 40 KB.` |
| Anggaran strip | `sprites/char_nara_walk.png: 15,5 KB melebihi anggaran strip 15 KB.` |
| Anggaran total | `Seluruh aset terdaftar 4,1 MB melebihi anggaran 4 MB.` |

## Data dan aksi

Tidak ada perubahan pada `engine/types.ts`, `GameState`, maupun aksi reducer.

### `app/sehari-setara/assets/manifest.ts`

Modul ini hanya mengimpor PNG dan tipe, tanpa React. Ekspornya:

| Ekspor | Bentuk | Isi |
|---|---|---|
| `SpriteStrip` | `{ src, frames, fps, w, h }` | Strip tokoh. `w` dan `h` adalah ukuran satu bingkai dalam piksel logis |
| `FrameStrip` | `{ src, frames, w, h }` | Strip antarmuka. Waktu animasinya ditentukan fitur pemakainya: bintang di F-07, timbangan di F-09 |
| `EmoteIcon` | `"hati" \| "keringat" \| "tanya" \| "seru"` | Diturunkan dari `Choice["emote"]` |
| `AssetRef` | `{ key: string; src: string \| undefined }` | Butir hasil `sceneAssets` |
| `backgrounds` | kunci → URL | 7 latar; kuncinya nama berkas, sama dengan `Scene.bg` |
| `endings` | `Record<EndingId, string>` | 3 ilustrasi akhir |
| `sprites` | `CharId` → pose → `SpriteStrip` | 33 strip dari 11 tokoh |
| `icons` | kunci → URL | 6 ikon 16×16 |
| `iconStrips` | kunci → `FrameStrip` | `star` dan `timbangan` |
| `teamIcons` | `Record<Team["shape"], string>` | 4 bentuk tim |
| `roleIcons` | `Record<RoleId, string>` | 4 ikon peran |
| `emoteIcons` | `Record<EmoteIcon, string>` | 4 ikon emosi |
| `spriteFor(char, pose)` | `SpriteStrip \| undefined` | Pencarian aman yang hanya membaca properti milik objek |
| `sceneAssets(scene)` | `AssetRef[]` | Aset panggung satu adegan, dengan urutan seperti di "Perilaku" |

Aturan kunci **[DRAF]**: kunci mengikuti cara naskah menyebut aset.

- Latar memakai nama berkas utuh, karena `Scene.bg` berisi nama itu (misalnya `bg_s1_rumah_pagi`).
- Kelompok lain memakai bagian `{nama}` dari pola penamaan Architecture bagian 8:

| Kelompok | Berkas |
|---|---|
| `endings[k]` | `end/end_{k}.png` |
| `sprites[c][p]` | `sprites/char_{c}_{p}.png` |
| `icons[k]`, `iconStrips[k]` | `ui/ui_{k}.png` |
| `teamIcons[k]` | `ui/ui_team_{k}.png` |
| `roleIcons[k]` | `ui/role_{k}.png` |
| `emoteIcons[k]` | `ui/emote_{k}.png` |

Kelompok bertipe (`endings`, `sprites`, `teamIcons`, `roleIcons`, `emoteIcons`) juga diperiksa TypeScript lewat `satisfies`, sehingga kunci yang hilang tertangkap saat kompilasi.

Komentar di manifest menyebut arti setiap bingkai strip antarmuka:

- bintang, bingkai 0–2: kecil, besar berkilau, normal (D-03);
- timbangan, bingkai 0–4: miring kiri, sedikit kiri, seimbang, sedikit kanan, miring kanan (D-10).

### `app/sehari-setara/assets/png.d.ts`

```ts
// Impor *.png menghasilkan URL berkas (Vite). Dipakai manifest.ts (F-12).
declare module "*.png" {
  const src: string;
  export default src;
}
```

### `vite.pages.config.ts`

Satu opsi baru di `build`, tepat setelah `chunkSizeWarningLimit` [Pemilik]:

```ts
    // Aset game selalu menjadi berkas berhash, tidak diselipkan ke JS sebagai data URI
    // (Architecture bagian 8; F-12). Berkas lain memakai aturan bawaan Vite.
    assetsInlineLimit: (filePath) =>
      filePath.replaceAll("\\", "/").includes("/app/sehari-setara/assets/") ? false : undefined,
```

`replaceAll` membuat aturan ini juga berlaku untuk path gaya Windows.

### Uji

Dua berkas uji:

- `app/sehari-setara/__tests__/asset-checks.ts`: fungsi pemeriksa murni. Ini tambahan terhadap daftar file di rencana.
  - Masukannya: teks `game.css`, teks Design System, isi `palette.json`, daftar entri manifest, ukuran dan dimensi berkas, teks `CREDITS.md`, dan naskah.
  - Keluarannya: daftar pesan.
  - Dengan begitu, setiap aturan bisa diuji dengan contoh pelanggaran tanpa mengubah berkas sungguhan, seperti `schema.ts` di F-03.
- `app/sehari-setara/__tests__/assets.test.ts`:
  - menjalankan pemeriksa pada berkas sungguhan dan pada contoh pelanggaran;
  - menguji `spriteFor` dan `sceneAssets`;
  - menguji fungsi `assetsInlineLimit` yang diimpor dari `vite.pages.config.ts`;
  - mencetak ringkasan.

Cara uji membaca masukannya:

- **Ukuran PNG** dibaca dari kepala berkas, yaitu tanda tangan PNG dan potongan IHDR. Tidak ada dependensi baru.
- **Path aset**: di Vitest, impor PNG menghasilkan path dari akar repositori, misalnya `/app/sehari-setara/assets/bg/bg_s1_rumah_pagi.png`. Uji memetakan path itu ke berkasnya.
- **Token Design System** dibaca dari blok kode `css` pertama di `Design_System.md` yang memuat `--ss-ink`.
- **Token `game.css`** adalah deklarasi `--ss-*` di dalam blok `:root`. Variabel `--ss-*` di luar `:root`, misalnya untuk animasi sprite di F-04, tidak dianggap token.
- **Warna** dicari di nilai deklarasi, sesudah komentar dibuang. Nomor baris tetap sesuai berkas aslinya.
- **`CREDITS.md`** dibaca dari kolom pertama tabelnya, yaitu path seperti `bg/bg_title.png` di antara tanda petik terbalik.

Pemeriksaan per piksel (warna di luar palet dan piksel semi-transparan) tetap tugas `build_assets.py`.

### Skrip, `.gitignore`, dan perubahan dokumen

- `package.json`: skrip `"assets:build": "python scripts/game/art/build_assets.py"`, diletakkan setelah `content:check` [Dokumen: Architecture bagian 4]. Dependensi tidak berubah.
- `.gitignore`: baris `__pycache__/` dengan komentar `# python (kit gambar Sehari Setara)` [Pemilik].
- `docs/sehari-setara/Architecture.md` naik ke versi 0.5 [Pemilik]:
  - kepala dokumen: baris "Perubahan 0.5";
  - bagian 3: `ikon.py` di kit gambar, `png.d.ts` di `assets/`, dan keterangan `__tests__/` menjadi "uji unit, konten, dan aset";
  - bagian 8: contoh manifest memakai kunci nama berkas dan menyebut semua kelompok beserta `spriteFor` dan `sceneAssets`; aturan aset game sebagai berkas terpisah beserta alasannya;
  - bagian 12: baris Aset menyebut isi `assets.test.ts`.
- `docs/sehari-setara/Design_System.md` naik ke versi 0.3: baris `ikon.py` di tabel kit bagian 12, berisi ikon antarmuka, ikon peran, ikon emosi, dan timbangan [Pemilik].
- `docs/sehari-setara/Daftar_Aset.md`: catatan tentang `ikon.py` diubah menjadi "sudah dicatat di Design System bagian 12 dan Architecture bagian 3 dan 8 (F-12)".
- `docs/sehari-setara/PLAN.md`: status F-12, keputusan Gerbang 1, catatan Plan F-04, dan baris `assets:build` di tabel dependensi.

## Aset

Tidak ada aset baru, dan tidak ada PNG yang diubah. Manifest berisi 63 berkas. Semuanya berstatus Disetujui di `Daftar_Aset.md` dan tercatat di `CREDITS.md`.

**Latar** (`backgrounds`, folder `bg/`, 320×180) [Berkas]: `bg_s1_rumah_pagi`, `bg_s2_jalan_pagi`, `bg_s3_kelas_siang`, `bg_s4_koridor_siang`, `bg_s5_kampung_sore`, `bg_s6_kamar_malam`, `bg_title`.

**Ilustrasi akhir** (`endings`, folder `end/`, 320×180) [Berkas]: `setara`, `hampir`, `berat`.

**Strip tokoh** (`sprites`, folder `sprites/`). Jumlah bingkai dan ukurannya [Berkas]. Nilai fps **[DRAF]** mengikuti apa yang berubah di antara bingkai menurut kode `tokoh.py`:

| Yang berubah di antara bingkai | fps |
|---|---|
| Mulut (bicara atau tertawa) | 4 |
| Hanya tubuh (bernapas, menggaruk kepala, memegang HP, menunduk) | 2 |
| Langkah kaki (berjalan) | 8 |
| Tidak ada (strip satu bingkai; nilainya tidak berpengaruh) | 2 |

| Tokoh | Pose | Bingkai | Ukuran bingkai | fps | Gerak |
|---|---|---|---|---|---|
| nara | idle | 2 | 26×62 | 2 | bernapas |
| nara | talk | 2 | 26×62 | 4 | bicara |
| nara | happy | 1 | 26×62 | 2 | — |
| nara | sad | 1 | 26×62 | 2 | — |
| nara | walk | 4 | 26×62 | 8 | berjalan |
| nara | phone | 2 | 26×62 | 2 | bernapas, ibu jari bergerak |
| ibu | talk | 2 | 30×68 | 4 | bicara |
| ibu | happy | 1 | 30×68 | 2 | — |
| ibu | sad | 1 | 30×68 | 2 | — |
| gita | idle | 1 | 24×48 | 2 | — |
| gita | happy | 1 | 24×48 | 2 | — |
| gita | sad | 1 | 24×48 | 2 | — |
| dimas | motor | 2 | 56×62 | 4 | bicara sambil menepuk jok |
| dimas | happy | 1 | 56×62 | 2 | — |
| dimas | sad | 1 | 56×62 | 2 | — |
| sinta | idle | 2 | 26×62 | 2 | bernapas |
| sinta | talk | 2 | 26×62 | 4 | bicara |
| sinta | happy | 1 | 26×62 | 2 | — |
| sinta | sad | 1 | 26×62 | 2 | — |
| ratih | idle | 2 | 30×68 | 2 | bernapas |
| ratih | talk | 2 | 30×68 | 4 | bicara sambil menjelaskan |
| komang | idle | 2 | 26×62 | 2 | bernapas |
| komang | sad | 2 | 26×62 | 2 | menunduk memegang sepatu |
| komang | happy | 1 | 26×62 | 2 | — |
| made | talk | 2 | 30×68 | 4 | bicara sambil menunjuk |
| made | happy | 1 | 30×68 | 2 | — |
| made | sad | 1 | 30×68 | 2 | — |
| bayu | idle | 2 | 30×68 | 2 | menggaruk kepala |
| bayu | happy | 1 | 30×68 | 2 | — |
| siswa | merekam | 2 | 26×62 | 4 | tertawa sambil merekam |
| siswa | tertawa | 2 | 26×62 | 4 | tertawa |
| warga | a | 2 | 30×68 | 4 | bicara keras sambil menunjuk |
| warga | b | 2 | 30×68 | 4 | bicara keras sambil bersedekap |

**Ikon antarmuka** (`icons`, folder `ui/`, 16×16) [Berkas]: `hak`, `kewajiban`, `clock`, `sound_on`, `sound_off`, `fullscreen`.

**Strip antarmuka** (`iconStrips`, folder `ui/`) [Berkas]: `star` (3 bingkai 16×16) dan `timbangan` (5 bingkai 48×32).

**Bentuk tim** (`teamIcons`, folder `ui/`, 16×16) [Berkas]: `lingkaran`, `segitiga`, `persegi`, `bintang`.

**Ikon peran** (`roleIcons`, folder `ui/`, 32×32) [Berkas]: `polisi`, `jaksa`, `advokat`, `hakim`.

**Ikon emosi** (`emoteIcons`, folder `ui/`, 8×8) [Berkas]: `hati`, `keringat`, `tanya`, `seru`.

Ukuran saat ini [Berkas]:

| Ukuran | Nilai | Anggaran |
|---|---|---|
| Latar atau ilustrasi akhir terbesar | 4,2 KB (`end/end_setara.png`) | 40 KB |
| Strip tokoh terbesar | 1,2 KB (`sprites/char_dimas_motor.png`) | 15 KB |
| Total aset terdaftar | 61,4 KB | 4 MB |

## Di luar cakupan

- Menampilkan gambar, komponen `Stage` dan `Sprite`, dan pramuat dengan `img.decode()` (F-04).
- Waktu animasi strip antarmuka: bintang pop (F-07) dan gerak timbangan (F-09).
- Efek suara dan kelompok `sfx` (F-13). Laporan berkas yang belum terdaftar sudah mencakup subfolder `sfx/` bila kelak ada.
- Mekanisme placeholder dan laporannya (keputusan Gerbang 1 nomor 5).
- Perubahan pada PNG, kode kit gambar, `build_assets.py`, naskah, `schema.ts`, `content.test.ts`, dan `engine/`.
- Pemeriksaan per piksel di Vitest.
- Pemeriksaan format PNG terindeks. Kalimat Architecture bagian 8 tentang hal ini tidak diubah.
- Pemeriksaan nama warna CSS seperti `transparent`.
- Perbaikan aset yang masih terbuka di `Daftar_Aset.md`, yaitu sisi keranjang Ibu dan varian pakaian rumah Nara. Keduanya tugas pembuat aset.
- Playwright dan `test:e2e` (F-04).
- Perubahan pada `AGENTS.md`.

## Kriteria penerimaan

- [ ] AC-1 `manifest.ts` memuat ke-63 berkas persis seperti bagian "Aset": kelompok, kunci, berkas, jumlah bingkai, ukuran bingkai, dan fps.
- [ ] AC-2 Uji warna lulus untuk `game.css` sekarang. Contoh pelanggaran berikut tertangkap dengan pesan yang benar:
  - token berbeda dari Design System, token Design System hilang, dan token tambahan;
  - token berbeda dari palet dan token tanpa pasangan palet;
  - warna hex dan `rgb()` di luar palet, dengan nomor baris;
  - format warna lain.
- [ ] AC-3 Uji manifest lulus untuk keadaan sekarang. Contoh pelanggaran berikut tertangkap:
  - berkas tidak ada, nama berkas tidak sesuai kunci, dan berkas terdaftar dua kali;
  - ukuran strip dan ukuran gambar tunggal tidak cocok;
  - fps di luar rentang dan fps yang bukan bilangan bulat;
  - berkas belum tercatat di `CREDITS.md`;
  - aset naskah tidak ada di manifest;
  - kelompok bertipe tidak lengkap.
- [ ] AC-4 Berkas yang belum terdaftar dan baris `CREDITS.md` tanpa entri manifest hanya dilaporkan di ringkasan. Contohnya muncul di laporan, tetapi uji tetap lulus. Untuk keadaan sekarang, keduanya "tidak ada".
- [ ] AC-5 Uji anggaran lulus dengan angka di tabel "Ukuran saat ini" dan menangkap contoh latar, strip, dan total yang melebihi batas. Ringkasan tercetak sesuai "Teks yang tampil".
- [ ] AC-6 `spriteFor` dan `sceneAssets` berperilaku benar:
  - `spriteFor` mengembalikan strip yang benar untuk pasangan yang ada, dan `undefined` untuk pose yang tidak dikenal maupun `constructor`;
  - `sceneAssets` untuk adegan 1 menghasilkan 11 butir berurutan: `bg_s1_rumah_pagi`, `char_gita_happy`, `char_nara_idle`, `char_ibu_talk`, `char_gita_sad`, `char_nara_talk`, `char_ibu_sad`, `char_nara_happy`, `char_ibu_happy`, `emote_keringat`, `emote_hati`;
  - untuk keenam adegan asli tidak ada `src` yang kosong;
  - adegan tiruan dengan pose yang tidak dikenal menghasilkan `src` `undefined`.
- [ ] AC-7 Fungsi `assetsInlineLimit` di `vite.pages.config.ts` mengembalikan `false` untuk berkas di `app/sehari-setara/assets/`, termasuk path gaya Windows. Untuk berkas lain, misalnya `public/stories/0-scene.jpg`, hasilnya `undefined`.
- [ ] AC-8 Build percobaan di salinan sementara, dengan `Game.tsx` sementara yang menampilkan ke-63 gambar dari manifest, memenuhi semua ini:
  - `dist-pages/assets/` berisi 63 PNG berhash;
  - JS game tidak memuat `data:image/png`;
  - setiap URL aset berbentuk relatif (`new URL(…, import.meta.url)`);
  - keluaran galeri identik dengan build biasa;
  - di server uji, ke-63 gambar di `/ruang-setara/sehari-setara/` termuat (HTTP 200 dan `decode()` berhasil), dengan 0 galat konsol dan 0 respons 4xx;
  - tangkapan layar halaman percobaan pada 1280×720 tersimpan di `docs/sehari-setara/tests/F-12/` sebagai bukti.
- [ ] AC-9 `build:pages` di repositori lulus, dan seluruh isi `dist-pages/` identik byte dengan build sebelum F-12. Pemeriksaan browser seperti F-02 dan F-03 lulus di 1280×720, 1366×768, 1920×1080, dan 1024×768: 0 galat konsol dan 0 respons 4xx, di halaman permainan maupun galeri.
- [ ] AC-10 `content:check` dan `test` lulus, dan `install --frozen-lockfile` berhasil. `package.json` hanya bertambah skrip `assets:build`, dan `pnpm-lock.yaml` tidak berubah.
- [ ] AC-11 `npx pnpm@11.25.0 assets:build` berakhir dengan kode 0 dan pesan "Semua pemeriksaan lulus.". Sesudahnya `git status --short` kosong: PNG dan pratinjau tidak berubah, dan `__pycache__/` diabaikan.
- [ ] AC-12 `tsc --noEmit` untuk seluruh proyek tanpa galat. ESLint `--max-warnings 0` pada `manifest.ts`, `png.d.ts`, `asset-checks.ts`, `assets.test.ts`, dan `vite.pages.config.ts` tanpa galat dan tanpa peringatan. Tidak ada `any`.
- [ ] AC-13 Perubahan dokumen di bagian "Skrip, `.gitignore`, dan perubahan dokumen" ada dan sesuai. `git diff --name-status` hanya memuat file yang disebut spesifikasi ini.

## Rencana uji

| Langkah | Cara | Kriteria |
|---|---|---|
| 1 | `npx pnpm@11.25.0 install --frozen-lockfile`, `content:check`, lalu `test` | AC-2 sampai AC-7, AC-10 |
| 2 | Uji sementara membuang isi manifest ke JSON, lalu skrip pembanding mencocokkannya dengan bagian "Aset". Uji dan skrip sementara itu dihapus sesudahnya | AC-1 |
| 3 | `build:pages`, lalu `diff -r` terhadap salinan `dist-pages/` sebelum F-12 | AC-9 |
| 4 | Pemeriksaan browser seperti F-02 dan F-03 lewat `serve-subpath.mjs`, di empat ukuran layar | AC-9 |
| 5 | Build percobaan di salinan sementara dengan `Game.tsx` sementara, lalu: hitung PNG berhash, cari `data:image/png`, periksa bentuk URL, bandingkan keluaran galeri, dan buka halaman di Chromium headless lewat `serve-subpath.mjs` sambil menunggu `decode()` setiap gambar. Tangkapan layar disimpan di `tests/F-12/`; salinan sementara dihapus sesudahnya | AC-8 |
| 6 | `npx tsc --noEmit -p tsconfig.json --incremental false`, lalu ESLint `--max-warnings 0` pada lima file kode baru dan yang diubah | AC-12 |
| 7 | `npx pnpm@11.25.0 assets:build`, lalu `git status --short` | AC-11 |
| 8 | `git diff --name-status` terhadap commit dasar, dan periksa diff dokumen | AC-10, AC-13 |
| 9 | Daftar periksa manual AGENTS bagian 9: belum ada butir yang berlaku, karena halaman tidak berubah | — |

`test:e2e` belum ada; Playwright dijadwalkan di F-04 (keputusan Gerbang 1 nomor 6). Hasil uji ditulis di `docs/sehari-setara/tests/F-12-hasil.md` (templat 11.3).
