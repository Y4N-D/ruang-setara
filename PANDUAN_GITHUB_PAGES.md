# Menerbitkan Ruang Setara di GitHub Pages

Versi proyek ini sudah disiapkan agar bisa diterbitkan sebagai website statis
di GitHub Pages. Setiap kali ada perubahan yang di-push ke branch `main`,
GitHub akan membangun dan menerbitkan ulang website secara otomatis.

## Yang diubah dari paket asli

- `github-pages/index.html` dan `github-pages/main.tsx`: titik masuk versi statis.
- `vite.pages.config.ts`: konfigurasi build statis (hasilnya di folder `dist-pages/`).
- `.github/workflows/deploy-pages.yml`: alur otomatis build dan terbit.
- `package.json`: tambahan perintah `build:pages` dan `preview:pages`.
- Path aset di `app/choice-scene.tsx`, `app/gallery-scene.tsx`, `app/lessons.tsx`,
  dan `app/story-panorama.ts` diubah dari `/gallery/...` dan `/stories/...`
  menjadi `gallery/...` dan `stories/...` agar tetap benar ketika website berada
  di alamat `https://nama-akun.github.io/nama-repo/`.

Cara menjalankan lokal di `MULAI_DI_SINI.md` tetap berlaku. Karena beberapa
berkas diubah, `SHA256SUMS.txt` tidak lagi cocok untuk berkas-berkas tersebut.

## Langkah menerbitkan (sekali saja)

1. **Buat akun GitHub** di https://github.com bila belum punya.
2. **Ekstrak ZIP ini** ke komputer.
3. **Unggah proyek ke GitHub.** Cara paling mudah memakai GitHub Desktop
   (https://desktop.github.com):
   - File → Add local repository → pilih folder proyek ini.
   - Bila diminta, pilih "create a repository" lalu klik Create repository.
   - Klik **Publish repository**, beri nama (mis. `ruang-setara`), dan
     **hilangkan centang "Keep this code private"**. GitHub Pages gratis hanya
     untuk repository publik.

   Alternatif lewat terminal, setelah membuat repository kosong bernama
   `ruang-setara` di github.com:

   ```sh
   git init -b main
   git add .
   git commit -m "Ruang Setara v8"
   git remote add origin https://github.com/NAMA-AKUN/ruang-setara.git
   git push -u origin main
   ```

4. **Aktifkan GitHub Pages.** Di halaman repository: Settings → Pages →
   bagian *Build and deployment* → Source: pilih **GitHub Actions**.
5. **Jalankan alur terbit.** Buka tab **Actions** → pilih
   "Terbitkan ke GitHub Pages" → **Run workflow** (atau Re-run bila sebelumnya
   gagal karena Pages belum diaktifkan). Tunggu sampai bertanda centang hijau
   (sekitar 2–4 menit).
6. **Buka website** di `https://NAMA-AKUN.github.io/ruang-setara/`. Alamat yang
   tepat juga ditampilkan di Settings → Pages.

## Memperbarui isi website

Edit berkas (mis. `app/content.ts`), lalu commit dan push ke `main` (di GitHub
Desktop: Commit to main → Push origin). Website akan diperbarui otomatis.

## Menguji versi statis di komputer

```sh
npx pnpm@11.25.0 build:pages
npx pnpm@11.25.0 preview:pages
```
