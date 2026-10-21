# F-02 — Tipe data, reducer, aturan permainan, uji unit

| | |
|---|---|
| Status | Disetujui 21 Oktober 2026 (`Spesifikasi disetujui: F-02`) |
| Tanggal | 21 Oktober 2026 |
| Rencana | `docs/sehari-setara/PLAN.md`, entri F-02 (disetujui 21 Oktober 2026, dengan izin `vitest`) |

## Ringkasan

F-02 membangun mesin permainan tanpa tampilan. Isinya tipe data, aturan berupa fungsi murni, dan reducer yang menjalankan alur fase Architecture bagian 6. Semuanya diuji unit dengan `vitest`, yang dipasang di fitur ini dan dijalankan di CI sebelum build. Mesin belum dihubungkan ke layar, jadi halaman yang terbit tetap layar kerangka F-01.

Satu prinsip desain berasal dari keputusan Gerbang 1: **`history` adalah sumber kebenaran.** Indikator, bendera, dan bintang tim selalu dihitung ulang dari `history`. Dengan begitu, pembatalan pilihan (FR-18, dikerjakan di F-13) nanti cukup memotong `history` lalu menghitung ulang.

## Kaitan PRD

| Acuan | Yang dipenuhi F-02 |
|---|---|
| FR-04 | Alur enam adegan berurutan, masing-masing dengan tiga pilihan |
| FR-06 | Giliran tim berotasi per adegan, dan tim aktif tercatat di setiap pilihan |
| FR-08 | Dua indikator 0–100, awal 50, dibatasi di kedua ujung pada setiap langkah |
| FR-10 | Bendera dan pemilihan teks varian untuk narasi dan pilihan |
| FR-12 | Tiga akhir menurut ambang PRD bagian 9 |
| FR-05 (sisi mesin) | Aksi pengatur waktu di reducer. Tampilan dan `useTimer` menyusul di F-07 |
| PRD bagian 9 | Indikator milik seluruh kelas; bintang 0–2 untuk tim aktif; kuis tidak memengaruhi indikator |
| Architecture bagian 5, 6, 12, 14 | Model data, mesin status, cakupan uji unit, konvensi kode |
| Keputusan Gerbang 1 | `LANJUT` keluar dari `transition`; `quizAnswer`; `history` sebagai sumber kebenaran; FR-18 ke F-13 |

## Perilaku

- Diberikan fase `title`, ketika `MULAI`, maka fase menjadi `setup`.
- Diberikan fase `setup`, ketika `SIMPAN_PENGATURAN` berisi 2–4 tim dengan `id` unik dan nama tidak kosong, maka tim disimpan dengan bintang 0, pengaturan digabung, dan fase menjadi `prolog`.
- Diberikan fase `setup`, ketika `SIMPAN_PENGATURAN` berisi kurang dari 2 atau lebih dari 4 tim, `id` ganda, atau nama kosong, maka keadaan tidak berubah.
- Diberikan fase `prolog`, ketika `LANJUT`, maka fase menjadi `intro` adegan pertama.
- Diberikan fase `intro`, ketika `NARASI_SELESAI`, maka fase menjadi `discuss` dan pengatur waktu mulai berjalan dari durasi diskusi.
- Diberikan fase `discuss`, ketika `PILIH` dengan A, B, atau C, maka:
  - satu entri baru masuk ke `history`, berisi adegan, pilihan, tim aktif, dan bintang 0;
  - indikator, bendera, dan bintang tim dihitung ulang dari `history`;
  - pengatur waktu berhenti, dan fase menjadi `reaction`.
- Diberikan fase selain `discuss`, ketika `PILIH`, maka keadaan tidak berubah. Ini mengunci klik ganda.
- Diberikan fase `reaction`, ketika `REAKSI_SELESAI`, maka fase menjadi `impact`.
- Diberikan fase `impact`, ketika `LANJUT`, maka fase menjadi `quiz` bila adegan punya kuis peran, atau `stars` bila tidak.
- Diberikan fase `quiz` yang belum dijawab, ketika `JAWAB_KUIS` dengan sebuah peran, maka `quizAnswer` terisi dan fase tetap `quiz`. Jawaban kedua diabaikan.
- Diberikan fase `quiz`, ketika `LANJUT`, maka fase menjadi `stars` hanya bila kuis sudah dijawab. Bila belum, keadaan tidak berubah.
- Diberikan fase `stars`, ketika `BERI_BINTANG` dengan 0, 1, atau 2, maka bintang di entri `history` terakhir terisi, bintang tim dihitung ulang, dan fase menjadi `transition`.
- Diberikan fase `transition` yang bukan adegan terakhir, ketika `LANJUT`, maka adegan berikutnya dimulai: fase `intro`, `quizAnswer` kembali `null`, dan pengatur waktu disetel ulang dalam keadaan berhenti. Antarmuka mengirim `LANJUT` setelah pergantian adegan selesai: sapuan 400 ms, atau pudar 150 ms bila kurangi gerak aktif (Design System bagian 8).
- Diberikan fase `transition` di adegan terakhir, ketika `LANJUT`, maka fase menjadi `ending`.
- Diberikan fase `ending`, ketika `LANJUT`, maka fase menjadi `recap`.
- Diberikan fase `recap`, ketika `LANJUT`, maka fase menjadi `reflection`.
- Diberikan fase `reflection`, ketika `MAIN_LAGI`, maka permainan kembali ke keadaan awal di fase `title`, dengan pengaturan dan identitas tim yang sama dan bintang 0.
- Diberikan pengatur waktu berjalan di fase `discuss`, ketika `TICK`, maka sisa waktu berkurang 1 detik. Saat sisa mencapai 0, pengatur waktu berhenti dan fase tetap `discuss` (PRD: tidak memilih otomatis).
- Diberikan fase `discuss` dengan sisa waktu lebih dari 0, ketika `JEDA_WAKTU`, maka pengatur waktu berganti antara berjalan dan berhenti.
- Diberikan fase `discuss`, ketika `TAMBAH_30`, maka sisa waktu bertambah 30 detik, dan durasi ikut naik bila sisa melebihinya. Pengatur waktu yang tadinya habis berjalan lagi, sedangkan yang sedang dijeda tetap dijeda.
- Diberikan fase `discuss` dengan sisa waktu lebih dari 0, ketika `LEWATI_DISKUSI`, maka sisa menjadi 0 dan pengatur waktu berhenti.
- Diberikan fase apa pun, ketika `UBAH_PENGATURAN` berisi nilai yang sah, maka pengaturan digabung. Pengatur waktu yang sedang berjalan tidak berubah; durasi diskusi baru berlaku di diskusi berikutnya.
- Diberikan suatu fase, ketika aksi yang tidak berlaku untuk fase itu dikirim, maka reducer mengembalikan objek keadaan yang sama persis.
- Diberikan urutan pilihan apa pun, ketika indikator dihitung, maka efek diterapkan berurutan dan dibatasi 0–100 pada setiap langkah. Contoh: dari 50, efek +20, +20, +20, −20 menghasilkan 70, 90, 100, 80.
- Diberikan bendera `komangDibela` sudah disetel di adegan sebelumnya, ketika teks adegan 6 diminta, maka narasi memakai bagian `present` dan pilihan memakai `textIfFlag`. Bila bendera belum disetel, narasi memakai bagian `absent` dan pilihan memakai teks dasar.
- Diberikan indikator akhir, ketika akhir ditentukan, maka hasilnya `setara` bila H ≥ 75 dan K ≥ 75, `berat` bila H < 40 atau K < 40, dan `hampir` untuk selain itu.

## Status antarmuka

Tidak ada antarmuka baru. Halaman yang terbit tetap layar kerangka F-01, karena `Game.tsx` belum memakai mesin. Keadaan mesin dijelaskan di tabel transisi pada bagian "Data dan aksi".

## Teks yang tampil (final)

Tidak ada teks baru untuk pengguna. Nama fase dan aksi adalah pengenal kode dari Architecture. Langkah CI bernama "Uji game", sesuai Architecture bagian 4. Judul uji ditulis dalam bahasa Indonesia tetapi tidak tampil ke pengguna.

## Data dan aksi

### Tipe (`app/sehari-setara/engine/types.ts`)

Semua tipe Architecture bagian 5 disalin dengan nama dan bentuk yang sama: `TimeOfDay`, `Tier`, `ChoiceId`, `Flag`, `CharId`, `PoseId`, `RoleId`, `CastSlot`, `Reference`, `Choice`, `Scene`, `Phase`, `Team`, dan `GameState`. Tambahannya:

| Tipe | Bentuk | Alasan |
|---|---|---|
| `GameState.quizAnswer` | `RoleId \| null` | Keputusan 2b; `null` sebelum kuis adegan berjalan dijawab |
| `EndingId` | `"setara" \| "hampir" \| "berat"` | Nilai balik `endingFor` |
| `Stars` | `0 \| 1 \| 2` | Bintang alasan |
| `Settings` | bentuk `GameState.settings` | Dipakai ulang oleh aksi pengaturan |
| `HistoryEntry` | bentuk satu entri `GameState.history` | Dipakai ulang oleh fungsi turunan |
| `TeamSetup` | `Omit<Team, "stars">` | Isi tim saat pengaturan; bintang selalu dihitung |
| `GameAction` | gabungan aksi di tabel di bawah | Satu-satunya pintu perubahan keadaan |

### Keadaan awal (`createInitialState`)

`createInitialState(settings?: Partial<Settings>)` menghasilkan keadaan berikut:

| Bagian | Nilai |
|---|---|
| `phase` | `"title"` |
| `sceneIndex` | `0` |
| `meters` | `{ hak: 50, kewajiban: 50 }` |
| `flags` | `[]` |
| `teams` | `[]` |
| `history` | `[]` |
| `timer` | `{ duration: discussSeconds, remaining: discussSeconds, running: false }` |
| `settings` | `{ sound: true, reducedMotion: false, typewriter: true, discussSeconds: 60 }`, digabung dengan argumen |
| `quizAnswer` | `null` |

Sumber nilai bawaan:

- `discussSeconds` 60 berasal dari PRD bagian 16.
- `sound` dan `typewriter` aktif karena Design System bagian 7 dan 9 menyebut keduanya "bisa dimatikan".
- `reducedMotion` bernilai `false`. Antarmuka boleh mengisinya dari `prefers-reduced-motion` (F-13).

### Reducer (`app/sehari-setara/engine/reducer.ts`)

`createReducer(scenes: readonly Scene[])` menghasilkan `(state: GameState, action: GameAction) => GameState`.

- Data adegan diterima sebagai parameter, dan adegan terakhir adalah `scenes.length - 1`.
- Reducer tidak mengubah objek masukan, dan tidak memakai `setInterval`, `setTimeout`, `Date`, maupun `Math.random`.
- Aksi yang tidak tercantum untuk fase berjalan, atau yang syaratnya tidak terpenuhi, mengembalikan objek keadaan yang sama.

| Fase | Aksi | Syarat | Hasil |
|---|---|---|---|
| `title` | `MULAI` | — | `setup` |
| `setup` | `SIMPAN_PENGATURAN { teams, settings }` | 2–4 tim, `id` unik, nama tidak kosong setelah dipangkas | Tim disimpan dengan bintang 0, pengaturan digabung, fase `prolog` |
| `prolog` | `LANJUT` | — | `intro`, `sceneIndex` 0 |
| `intro` | `NARASI_SELESAI` | — | `discuss`; `timer` = `{ duration: d, remaining: d, running: true }` dengan `d` = `settings.discussSeconds` |
| `discuss` | `PILIH { choice }` | Ada tim; pilihan ada di adegan; adegan belum tercatat di `history` | Entri `{ sceneId, choiceId, teamId: tim aktif, stars: 0 }` ditambahkan; nilai turunan dihitung ulang; `timer.running` `false`; fase `reaction` |
| `reaction` | `REAKSI_SELESAI` | — | `impact` |
| `impact` | `LANJUT` | — | `quiz` bila adegan punya `roleQuiz`, selain itu `stars` |
| `quiz` | `JAWAB_KUIS { role }` | `quizAnswer` masih `null` | `quizAnswer` = `role`; fase tetap `quiz` |
| `quiz` | `LANJUT` | `quizAnswer` sudah terisi | `stars` |
| `stars` | `BERI_BINTANG { stars }` | Ada entri `history` untuk adegan berjalan | `stars` entri itu diisi; bintang tim dihitung ulang; fase `transition` |
| `transition` | `LANJUT` | Bukan adegan terakhir | `sceneIndex` + 1, `intro`, `quizAnswer` `null`, `timer` = `{ duration: d, remaining: d, running: false }` |
| `transition` | `LANJUT` | Adegan terakhir | `ending` |
| `ending` | `LANJUT` | — | `recap` |
| `recap` | `LANJUT` | — | `reflection` |
| `reflection` | `MAIN_LAGI` | — | `createInitialState(settings)`, dengan tim yang sama (nama, warna, bentuk) dan bintang 0 |

Aksi pengatur waktu (hanya di fase `discuss`):

| Aksi | Syarat | Hasil |
|---|---|---|
| `TICK` | `running` dan `remaining` > 0 | `remaining` − 1; bila menjadi 0, `running` `false` |
| `JEDA_WAKTU` | `remaining` > 0 | `running` dibalik |
| `TAMBAH_30` | — | `remaining` + 30; `duration` = maks(`duration`, `remaining`); bila sebelumnya `remaining` 0, `running` `true`; selain itu `running` tetap |
| `LEWATI_DISKUSI` | `remaining` > 0 | `remaining` 0, `running` `false` |

Aksi di semua fase:

| Aksi | Hasil |
|---|---|
| `UBAH_PENGATURAN { settings }` | Nilai sah digabung: boolean untuk `sound`, `reducedMotion`, `typewriter`, dan 30/60/90 untuk `discussSeconds`. Nilai tidak sah diabaikan. Bila tidak ada yang berubah, keadaan sama. `timer` tidak disentuh |

### Aturan (`app/sehari-setara/engine/rules.ts`)

Semuanya fungsi murni:

| Fungsi | Perilaku |
|---|---|
| `clamp(v)` | Persis seperti Architecture bagian 6 |
| `activeTeamIndex(sceneIndex, teamCount)` | Persis seperti Architecture bagian 6 |
| `endingFor(meters)` | Persis seperti Architecture bagian 6; tipe hasilnya `EndingId` |
| `applyEffects(meters, effects)` | Menambahkan efek ke kedua indikator lalu `clamp` |
| `findChoice(scenes, sceneId, choiceId)` | Mencari pilihan; `undefined` bila tidak ada |
| `metersFromHistory(history, scenes)` | Mulai dari 50/50, menerapkan efek setiap entri berurutan dengan `clamp` per langkah |
| `flagsFromHistory(history, scenes)` | Bendera dari `setsFlag` pilihan yang diambil, berurutan, tanpa duplikat |
| `starsByTeam(history)` | Jumlah bintang per `teamId` |
| `withDerived(state, scenes)` | Keadaan dengan `meters`, `flags`, dan `teams[].stars` dihitung ulang dari `history` |
| `activeTeam(state)` | Tim aktif menurut `activeTeamIndex`; `undefined` bila belum ada tim |
| `choiceText(choice, flags)` | `textIfFlag.text` bila benderanya ada, selain itu `text` |
| `narrationFor(scene, flags)` | `narration`, lalu disambung `present` atau `absent` dari `narrationIfFlag` bila ada |
| `isQuizCorrect(scene, answer)` | `true` bila jawaban sama dengan `roleQuiz.answer` |

### Titik perluasan untuk F-13 (FR-18)

Pembatalan pilihan tidak dikerjakan di F-02, tetapi tidak memerlukan bidang baru di keadaan:

- `ULANGI_ADEGAN` cukup membuang entri `history` milik adegan berjalan, menjalankan `withDerived`, dan kembali ke `intro` adegan yang sama.
- `KEMBALI` membuang entri adegan berjalan dan adegan sebelumnya, lalu mundur satu adegan.

Uji F-02 membuktikan sifat ini. Memotong `history` lalu menghitung ulang harus menghasilkan indikator, bendera, dan bintang yang sama dengan yang tercatat ketika permainan berada di titik itu.

### Perkakas

- `package.json`: dependensi pengembangan `"vitest": "^5.0.4"` (terkunci 5.0.4 di lockfile) dan skrip `"test": "vitest run"`.
- `vitest.config.ts` di akar repositori: `test.include` = `["app/sehari-setara/**/*.test.ts"]`, `test.environment` = `"node"`. Berkas ini mencegah vitest memuat `vite.config.ts` milik Vinext.
- `.github/workflows/deploy-pages.yml`: langkah baru di antara "Pasang dependensi" dan "Build versi statis":

  ```yaml
  - name: Uji game
    run: npx -y pnpm@11.25.0 test
  ```

- Uji di `app/sehari-setara/__tests__/`:
  - `fixtures.ts`: enam adegan tiruan. Efek, tingkat, dan benderanya meniru PRD bagian 8, tetapi teksnya berupa penanda seperti "Pilihan B adegan 4". Adegan 5 punya kuis peran, adegan 4 menyetel `komangDibela`, dan adegan 6 punya varian narasi dan pilihan.
  - `rules.test.ts` dan `reducer.test.ts`.

### Perubahan dokumen

- `docs/sehari-setara/Architecture.md`:
  - Kepala dokumen: versi 0.3, tanggal 21 Oktober 2026, dan baris "Perubahan 0.3" yang merangkum butir-butir di bawah.
  - Bagian 1: keputusan A9, yaitu `vitest` sebagai alat uji unit dan uji konten dengan konfigurasi terpisah `vitest.config.ts` (konvensi bagian 14).
  - Bagian 5: `quizAnswer: RoleId | null` di `GameState`.
  - Bagian 6: diagram mendapat label `LANJUT` pada kedua panah keluar dari `transition`. Ditambah dua butir aturan: `LANJUT` di fase `quiz` hanya diterima setelah `JAWAB_KUIS`, dan `history` adalah sumber kebenaran untuk indikator, bendera, dan bintang.
- `AGENTS.md`: baris F-13 memuat FR-18, sudah dicatat di tahap ini atas keputusan 2c.
- `docs/sehari-setara/PLAN.md`: status, keputusan, dan baris `vitest` di tabel dependensi.

## Aset

Tidak ada.

## Di luar cakupan

- Menghubungkan mesin ke `Game.tsx` dan komponen antarmuka (mulai F-05), `useTimer` (F-07), pintasan keyboard, dan durasi animasi.
- Naskah asli, skema `zod`, dan `content:check` (F-03).
- `ULANGI_ADEGAN` dan `KEMBALI` (F-13). F-02 hanya menyiapkan titik perluasannya.
- Penyimpanan `sessionStorage` (opsional P1, Architecture bagian 13).
- Daftar nama tim bawaan. Itu konten untuk layar pengaturan (F-07/F-10); uji memakai nama dari Design System sebagai data contoh.
- Playwright dan `test:e2e` (F-04).

## Kriteria penerimaan

- [ ] AC-1 `types.ts` memuat semua tipe Architecture bagian 5 dengan nama dan bentuk yang sama, ditambah `quizAnswer`, `EndingId`, `Stars`, `Settings`, `HistoryEntry`, `TeamSetup`, dan `GameAction`.
- [ ] AC-2 `clamp`, `activeTeamIndex`, dan `endingFor` memberi hasil benar di semua titik batas:
  - `clamp`: −5→0, 0, 100, 120→100.
  - `activeTeamIndex`: rotasi untuk 2, 3, dan 4 tim di adegan 1–6.
  - `endingFor`: (75,75)→setara, (74,75)→hampir, (75,74)→hampir, (40,40)→hampir, (39,90)→berat, (90,39)→berat, (0,0)→berat, (100,100)→setara.
- [ ] AC-3 Satu permainan penuh dengan adegan tiruan berjalan dari `title` sampai `reflection`, lalu `MAIN_LAGI` kembali ke `title`. Setiap transisi di tabel menghasilkan fase yang diharapkan.
- [ ] AC-4 Untuk setiap fase, setiap aksi yang tidak berlaku mengembalikan objek keadaan yang sama (`toBe`). Ini termasuk `PILIH` kedua, `LANJUT` di `quiz` sebelum dijawab, `JAWAB_KUIS` kedua, dan aksi pengatur waktu di luar `discuss`.
- [ ] AC-5 `PILIH` menambahkan tepat satu entri `history` berisi adegan, pilihan, tim aktif, dan bintang 0. Pilihan itu juga menggeser indikator dengan `clamp` per langkah (contoh 50 → 70 → 90 → 100 → 80), menyetel bendera tanpa duplikat, dan menghentikan pengatur waktu.
- [ ] AC-6 Setelah setiap aksi dalam semua uji alur, `meters`, `flags`, dan `teams[].stars` sama dengan hasil `withDerived`. Memotong `history` di titik mana pun lalu menghitung ulang menghasilkan nilai yang tercatat saat permainan berada di titik itu.
- [ ] AC-7 Dengan 3 tim, adegan 1–6 tercatat untuk tim ke-1, 2, 3, 1, 2, 3. Bintang masuk ke tim aktif, dan bintang tim sama dengan jumlah bintangnya di `history`.
- [ ] AC-8 `choiceText` dan `narrationFor` memberi varian bila `komangDibela` disetel di adegan 4, dan teks dasar bila tidak.
- [ ] AC-9 Kuis hanya muncul di adegan yang punya `roleQuiz`. Jawaban pertama terkunci, `LANJUT` baru diterima setelah dijawab, `quizAnswer` kembali `null` di adegan berikutnya, `isQuizCorrect` benar untuk "hakim", dan kuis tidak mengubah indikator.
- [ ] AC-10 Pengatur waktu berperilaku sesuai tabel. Di dalamnya termasuk: habis di 0 tanpa berpindah fase, `PILIH` tetap diterima setelah waktu habis, `TAMBAH_30` menjalankan lagi pengatur waktu yang habis tetapi tidak yang dijeda, dan `duration` ikut naik bila perlu.
- [ ] AC-11 `SIMPAN_PENGATURAN` menerima 2, 3, dan 4 tim serta menolak 1 tim, 5 tim, `id` ganda, dan nama kosong. `UBAH_PENGATURAN` bekerja di semua fase, mengabaikan nilai tidak sah, dan tidak mengubah pengatur waktu yang berjalan; durasi barunya berlaku di diskusi berikutnya.
- [ ] AC-12 Tiga urutan pilihan dengan adegan tiruan masing-masing berakhir di `setara`, `hampir`, dan `berat`.
- [ ] AC-13 `MAIN_LAGI` menghasilkan `history` kosong, indikator 50/50, `flags` kosong, `sceneIndex` 0, `quizAnswer` `null`, dan bintang 0, dengan pengaturan dan identitas tim tetap.
- [ ] AC-14 Reducer tidak mengubah masukan: keadaan dan adegan yang dibekukan secara mendalam tidak menimbulkan galat. File di `engine/` tidak memuat `setInterval`, `setTimeout`, `Date`, maupun `Math.random`.
- [ ] AC-15 `npx pnpm@11.25.0 test` menjalankan vitest 5.0.4 lewat `vitest.config.ts` dan semua uji lulus. `install --frozen-lockfile` berhasil. Di `package.json` hanya bertambah `vitest` dan skrip `test`, dan workflow memuat langkah "Uji game" sebelum build.
- [ ] AC-16 `build:pages` lulus dan halaman yang terbit tidak berubah: `dist-pages/sehari-setara/index.html` identik dengan hasil F-01, dan pemeriksaan browser seperti F-01 memberi 0 galat konsol dan 0 respons 4xx di halaman permainan maupun galeri.
- [ ] AC-17 `tsc --noEmit` untuk seluruh proyek tanpa galat. ESLint pada file baru dan file kode yang diubah tanpa galat dan tanpa peringatan, dan tidak ada `any`.
- [ ] AC-18 Perubahan dokumen di bagian "Perubahan dokumen" ada dan sesuai.

## Rencana uji

Sesuai keputusan Gerbang 1, `test` dan `build:pages` dijalankan seperti biasa. `content:check` (F-03) dan `test:e2e` (F-04) belum ada, jadi halaman diperiksa dengan pemeriksaan browser yang sama seperti F-01.

| Langkah | Cara | Kriteria |
|---|---|---|
| 1 | `npx pnpm@11.25.0 install --frozen-lockfile`, lalu `npx pnpm@11.25.0 test` | AC-1 sampai AC-15 |
| 2 | `npx pnpm@11.25.0 build:pages` dan bandingkan `dist-pages/sehari-setara/index.html` dengan hasil F-01 | AC-16 |
| 3 | Pemeriksaan browser F-01 (Chromium headless di lingkungan agen) lewat `serve-subpath.mjs` | AC-16 |
| 4 | `tsc --noEmit -p tsconfig.json --incremental false` dan ESLint pada file baru serta file kode yang diubah | AC-17 |
| 5 | Periksa diff dokumen dan `git diff --stat` terhadap keadaan F-01 | AC-15, AC-18 |
| 6 | Daftar periksa manual AGENTS bagian 9: belum ada butir yang berlaku, karena halaman tidak berubah | — |

Hasil ditulis di `docs/sehari-setara/tests/F-02-hasil.md` (templat 11.3).
