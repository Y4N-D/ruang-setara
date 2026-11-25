# JS-16c — Tautan layar judul Sehari Setara dan rilis v1.0

Status: **Disetujui (25 Nov 2026)**, `Spesifikasi disetujui: JS-16c` (D-1 dan D-2 = a). Diuji: [JS-16c-hasil.md](../tests/JS-16c-hasil.md). Dasar: Plan lanjutan JS-16c yang dipersempit (`Setuju: JS-16c`, usulan 1 sampai 7 = a).

## Ringkasan

JS-16c menambahkan satu tautan teks dari layar judul Sehari Setara ke Jejak Setara, dan menulis catatan rilis v1.0. Kedua hasilnya diserahkan dalam dua ZIP, agar tautan baru terbit sesudah produksi naik ke v1.0 (usulan 7a). Uji coba kelas dilakukan pemilik proyek sesudahnya. Panduan guru, tautan dari galeri, dan pencatatan hasil uji coba dikerjakan di JS-16d.

## Kaitan PRD

- KT-08: pintu masuk dari layar judul Sehari Setara (bagian galeri menyusul di JS-16d).
- PRD 17: rilis 1.0. PRD 16: uji coba kelas.
- Architecture Jejak 16: alamat Jejak Setara disimpan di satu konstanta, sebagai pengecualian aturan "path relatif" Sehari Setara.
- AGENTS Jejak 4.5 dan butir 12; `AGENTS.md` akar butir 1, 2, dan 4. Keduanya berlaku karena pekerjaan ini menyentuh Sehari Setara.

## Perilaku

### A. Tautan di layar judul Sehari Setara

- **P-1 Letak dan bentuk.** Di dalam `.ss-title-zone`, tepat sesudah kalimat pengantar (`.ss-title-lead`), tampil tautan teks berkelas `ss-title-link` dengan isi `copy.title.jejak`. Tautan itu:
  - bergaris bawah, berwarna sama dengan kalimat pengantar, dan berukuran huruf sama (3,1u);
  - punya tinggi sentuh sedikitnya 24 px CSS (WCAG 2.5.8) lewat ruang dalam vertikal;
  - memakai cincin fokus yang sama dengan tombol Sehari Setara;
  - tetap berada di dalam zona judul di 1280 × 720, 1024 × 768, 1920 × 1080, 731 × 411, dan 640 × 360.

  Empat kontrol di pita tombol (`.ss-title-actions`) tidak berubah.
- **P-2 Alamat.** `href` tautan adalah `ALAMAT_JEJAK_SETARA` dari berkas baru `app/tautan-jejak-setara.ts`:

  ```ts
  /** Alamat produksi Jejak Setara (JS-16c; Architecture Jejak 16). Satu-satunya alamat penuh di Sehari Setara dan galeri. */
  export const ALAMAT_JEJAK_SETARA = "https://jejak-setara.ruangsetara.workers.dev/";
  ```

  Tautan dibuka di tab yang sama, tanpa `target` (usulan 3a).
- **P-3 Masa tunggu.** Selama layar judul belum siap (`ready` salah), tautan ber-`aria-disabled="true"`, dan klik dibatalkan lewat fungsi yang sama dengan "Kembali ke galeri" (`titleGallery`, usulan 5a).
- **P-4 Urutan fokus.** Urutan fokus mengikuti urutan tampil: tautan ada sebelum keempat tombol. Fokus awal tetap di "Mulai", sehingga Shift+Tab dari "Mulai" menuju tautan. Urutan Tab di antara keempat tombol tidak berubah (D-1a).
- **P-5 Pembaca layar.** Tautan memuat teks tersembunyi "(situs lain)" berkelas `ss-sr`, agar pembaca layar tahu tautan itu membuka situs lain (D-2a).
- **P-6 Tanpa permintaan jaringan.** Tautan tidak memuat apa pun sebelum diklik. Tidak ada gambar, skrip, atau huruf dari alamat Jejak Setara.

### B. Catatan rilis v1.0

- **P-7** `docs/jejak-setara/rilis/v1.0.md` mengikuti templat 12.4 dan berisi:
  - **fitur:** JS-16b (huruf VT323, kode QR dan Perbesar QR, kode masuk ulang, tombol lobi 48 px, pilihan lingkungan "pilih"), ditambah perbaikan klien sejak v0.9 (ping sesudah diterima);
  - **migrasi D1:** tidak ada;
  - **`PROTOKOL_VERSI`:** naik dari 4 ke 5, sehingga HP dan konsol yang masih memakai versi lama diminta memuat ulang;
  - **yang dicek sesudah deploy:** QR di lobi, kode masuk ulang dengan dua HP, huruf VT323 di proyektor, dan pesan HP lama;
  - **risiko** dan **cara kembali:** *rollback* versi Worker, D1 *Time Travel*, dan "Jejak: hentikan";
  - **yang menyusul di JS-16d:** panduan guru dan tautan galeri.

### C. Dokumen dan aturan

- **P-8 Aturan dan dokumen yang diperbarui:**
  - `AGENTS.md` akar butir 4: titik integrasi bertambah satu, yaitu tautan Jejak Setara di layar judul, dengan alamat penuh dari konstanta;
  - AGENTS Jejak butir 12: pengecualian bertambah untuk tautan layar judul Sehari Setara (JS-16c);
  - `docs/sehari-setara/Architecture.md` bagian 11: titik ketiga;
  - `docs/sehari-setara/PLAN.md`: satu catatan yang merujuk JS-16c;
  - Architecture Jejak 16: tautan layar judul sudah ada, dan tautan galeri menyusul di JS-16d;
  - PRD 20 dan 21;
  - `PLAN.md`.

## Beberapa pemain sekaligus

Tidak berlaku. Tautan hanya mengarahkan peramban siswa ke halaman Jejak Setara, dan siswa bergabung ke ruang seperti biasa.

## Status antarmuka

| Keadaan | Tautan |
|---|---|
| Masa tunggu | Tampil, `aria-disabled="true"`, klik dibatalkan |
| Siap | Bisa diklik dan difokus; membuka Jejak Setara di tab yang sama |
| Fokus | Cincin fokus Sehari Setara |
| Kurangi gerak dan mode lain Sehari Setara | Tidak ada animasi; tampil sama |

## Teks yang tampil (final)

| Kunci (`app/sehari-setara/content/copy.ts`) | Teks |
|---|---|
| `title.jejak` | Main bersama kelas di Jejak Setara |
| `title.jejakSitusLain` | (situs lain) |

## Data, protokol, API, dan migrasi

Tidak ada perubahan data, protokol, API, atau migrasi. Tidak ada dependensi baru.

## Aset

Tidak ada.

## Keamanan dan privasi

- **Alamat:** tautan menuju alamat produksi Jejak Setara yang tetap (HTTPS), tanpa parameter dan tanpa data siswa.
- **Tanpa pihak ketiga:** Sehari Setara tetap tidak memuat apa pun dari situs lain (`AGENTS.md` akar butir 2). Tautan biasa bukan permintaan jaringan.

## Di luar cakupan

- Tautan dari galeri, panduan guru, dan pencatatan hasil uji coba (JS-16d).
- Mengubah pita tombol atau tombol mana pun di layar judul.
- Domain sendiri (KT-06).

## DRAF untuk ditinjau pemilik proyek

- **D-1 Urutan fokus.**
  - (a, saran) Mengikuti urutan tampil: tautan sebelum tombol.
  - (b) Tautan sesudah keempat tombol dalam urutan Tab, walaupun tampil di atas.
- **D-2 Keterangan untuk pembaca layar.**
  - (a, saran) Ada teks tersembunyi "(situs lain)".
  - (b) Tanpa keterangan.

## Kriteria penerimaan

- [ ] AC-1 Tautan tampil di bawah kalimat pengantar dengan teks `title.jejak`, berada di dalam zona judul, dan tidak menutupi judul di kelima ukuran layar. Pita tombol tetap empat kontrol dengan lebar seperti sebelumnya.
- [ ] AC-2 `href` sama dengan `ALAMAT_JEJAK_SETARA`. Alamat penuh itu hanya ditulis di `app/tautan-jejak-setara.ts`. Tanpa `target`.
- [ ] AC-3 Selama masa tunggu, tautan ber-`aria-disabled` dan klik tidak berpindah halaman. Sesudah siap, tautan bisa diklik.
- [ ] AC-4 Shift+Tab dari "Mulai" menuju tautan. Urutan keempat tombol tidak berubah. Cincin fokus terlihat. Kontras tautan dengan latar lulus pemeriksaan kontras yang sama dengan tombol judul.
- [ ] AC-5 Pembaca layar membaca "Main bersama kelas di Jejak Setara (situs lain)".
- [ ] AC-6 Tidak ada permintaan ke situs lain selama main penuh (uji ujung ke ujung Sehari Setara yang sudah ada).
- [ ] AC-7 Perintah Sehari Setara lulus: `content:check`, `test`, dan `test:e2e`. Perintah Jejak lulus, termasuk uji kerangka untuk berkas dan aturan baru.
- [ ] AC-8 Di `dist-pages/`, yang berubah hanya berkas Sehari Setara (`sehari-setara/index.html` dan aset Sehari Setara yang berhash). Berkas galeri dan Tailwind identik byte.
- [ ] AC-9 `rilis/v1.0.md` memuat keenam judul templat 12.4 dan isi P-7.
- [ ] AC-10 Dokumen P-8 sudah diperbarui.

## Rencana uji

1. **Unit dan konten** (Sehari Setara, `content:check` dan `test`):
   - `copy.title.jejak` dan `copy.title.jejakSitusLain` ada dan lulus aturan teks;
   - konstanta alamat memakai HTTPS dan berakhir dengan garis miring;
   - tidak ada alamat penuh lain di `app/sehari-setara/`.
2. **Ujung ke ujung** (Sehari Setara, `test:e2e`): `e2e/judul-pengaturan-prolog.spec.ts` ditambah pemeriksaan AC-1 sampai AC-5 di lima ukuran, beserta tangkapan layar layar judul. Pemeriksaan pita yang sudah ada tetap.
3. **Jejak:** uji kerangka untuk `rilis/v1.0.md` dan pengecualian AGENTS, serta `test:jejak`, `content:check:jejak`, dan `tsc --noEmit`.
4. **`build:pages`:** daftar SHA-256 dibandingkan dengan build dasar; hanya berkas Sehari Setara yang boleh berbeda (AC-8).
5. **Serah terima dua ZIP** (usulan 7a):
   - ZIP 1: catatan rilis, laporan uji, dan dokumen Jejak;
   - ZIP 2: kode, uji, dan dokumen Sehari Setara.
