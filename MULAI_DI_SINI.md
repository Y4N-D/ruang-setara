# Source code Ruang Setara — v8

Paket ini berisi source code versi website yang sudah diterbitkan, termasuk
seluruh materi, galeri 3D, tokoh, animasi, dialog otomatis, pertanyaan, dan catatan.
Ada tujuh ruang adegan: empat kasus **Pilihan & dampak**, lalu **Keseimbangan**,
**Konstitusi**, dan **Keadilan**.

## 1. Jalankan di komputer

Siapkan Node.js versi **22.13.0 atau lebih baru** dan koneksi internet untuk
mengunduh dependensi saat instalasi. Langkah berikut dapat dijalankan melalui
Terminal, PowerShell, atau terminal di VS Code.

1. Ekstrak seluruh ZIP terlebih dahulu.
2. Buka terminal di folder `Ruang_Setara_Source_Code_v8`, yaitu folder yang
   berisi `package.json`.
3. Pasang dependensi sesuai versi yang dikunci dalam proyek:

   ```sh
   npx pnpm@11.25.0 install --frozen-lockfile
   ```

4. Jalankan website:

   ```sh
   npx pnpm@11.25.0 dev
   ```

5. Buka **http://localhost:5173** di browser. Jika terminal menampilkan alamat
   lain, gunakan alamat tersebut. Biarkan terminal tetap berjalan selama
   menggunakan website; tekan `Ctrl+C` untuk menghentikannya.

Jika `npx` meminta persetujuan pemasangan pnpm, ketik `y` lalu Enter.
Website ini perlu dijalankan melalui server pengembangan tersebut; membuka
file source dengan klik ganda tidak akan menjalankan aplikasinya.

Jika port 5173 sudah digunakan:

```sh
npx pnpm@11.25.0 dev --port 5174
```

Untuk menjalankan website ini secara lokal, tidak diperlukan API key atau
database. Model 3D, gambar, video, dan decoder 3D sudah disertakan. Blender
hanya diperlukan jika ingin membuat ulang aset 3D.

## 2. Membuat dan menjalankan hasil build

Setelah instalasi selesai, hentikan server pengembangan sebelum menjalankan:

```sh
npx pnpm@11.25.0 build
npx pnpm@11.25.0 start
```

Buka alamat yang ditampilkan terminal. Perintah `start` menjalankan hasil build
secara lokal melalui Wrangler. Ini tidak menerbitkan website ke internet.

## 3. Bagian yang dapat diedit

| Keperluan | Lokasi |
| --- | --- |
| Tampilan dan navigasi utama | `app/page.tsx` |
| Materi utama, kasus, dan soal | `app/content.ts` |
| Kasus Keseimbangan, Konstitusi, dan Keadilan | `app/lesson-stories.ts` |
| Panel materi dan latihan | `app/lessons.tsx` |
| Dialog serta pergerakan empat kasus Pilihan & dampak | `app/story-choreography.json` |
| Dialog serta pergerakan tiga ruang tambahan | `app/lesson-choreography.json` |
| Bubble chat dan label tokoh | `app/story-conversation.tsx` |
| Kontrol pemutaran adegan | `app/story-playback.ts` |
| Perpindahan kamera dan alur pertanyaan | `app/story-path.ts`, `app/story-journey.tsx` |
| Penampil adegan 3D dan mode ringan | `app/choice-scene.tsx`, `app/story-panorama.ts` |
| Warna, tipografi, dan tata letak | Berkas `.css` di `app/` |
| Model 3D galeri utama | `public/gallery/ruang-setara.glb` |
| Model tokoh dan empat ruang Pilihan & dampak | `public/stories/choices.glb` |
| Model tokoh dan tiga ruang tambahan | `public/stories/lessons.glb` |
| Panorama, pratinjau, dan video animasi | `public/gallery/`, `public/stories/` |

Perubahan teks dialog dapat dilakukan pada berkas koreografi. Jika mengubah
waktu, posisi, pose, atau gerakan, buat ulang model, video, dan data titik kepala
secara bersamaan agar bubble chat tetap mengikuti tokoh dengan tepat.

## 4. Aset 3D dan lisensi

Model `.glb` yang siap dipakai sudah termasuk. Sumber geometri dan tekstur
manusia ada di `scripts/assets/human-source/`, disertai lisensinya.
Skrip pembuatan ruangan, rig, animasi, ekspor, dan render ada di `scripts/assets/`.

Panduan membuat ulang aset:

- `scripts/assets/STAGED-SCENES.md` — empat ruang Pilihan & dampak.
- `scripts/assets/LESSON-SCENES.md` — tiga ruang tambahan.
- `scripts/assets/human-source/LICENSE.md` — lisensi aset manusia CC0.

Panduan tersebut menjelaskan kebutuhan Blender Python 4.2, FFmpeg, dan alat
optimasi glTF. File kerja `.blend` serta urutan frame render merupakan hasil
antara yang dibuat ulang oleh skrip dan tidak disertakan dalam ZIP.
Pertahankan berkas lisensi pihak ketiga ketika membagikan ulang proyek.

## 5. Informasi paket

- Sumber: versi website **v8**.
- Commit sumber: `4f1ce31248680d1a2944dd7c7509f8d40b77e2d5`.
- Teknologi: React, TypeScript, Vinext/Vite, dan Three.js.
- Dependensi dikunci dalam `pnpm-lock.yaml`; gunakan pnpm versi yang tercantum
  pada langkah instalasi.
- `node_modules`, cache, hasil build, riwayat Git, dan kredensial tidak disertakan.
- Source aplikasi dan aset sama dengan versi yang diterbitkan; panduan ini
  ditambahkan khusus untuk paket unduhan.

`README.md` juga memuat dokumentasi fondasi Sites. Untuk penggunaan lokal,
ikuti langkah pada **MULAI_DI_SINI.md** ini. Konfigurasi `.openai/hosting.json`
menyimpan identitas proyek asal dan tidak memuat kredensial akses.

Jika gerakan tidak berjalan, periksa tombol jeda dan pengaturan pengurangan
gerakan pada perangkat. Jika WebGL tidak tersedia, penampil menyediakan mode
panorama dengan video animasi dari adegan yang sama.
