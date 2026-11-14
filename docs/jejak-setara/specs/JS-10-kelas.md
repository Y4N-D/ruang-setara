# JS-10 — Layar kelas

| | |
|---|---|
| Status | Ditulis 14 November 2026 di tahap Specify, sesudah balasan `Setuju: JS-10 (usulan 1a sampai 13a)` dan `Usulan 14: a`. Menunggu `Spesifikasi disetujui: JS-10` beserta pilihan DRAF D-1 sampai D-4 |
| Rencana | `PLAN.md`, bagian "JS-10 — Layar kelas" |
| Sesi | Sesi A (mesin) |
| Bergantung pada | JS-04 (Selesai, 14 Nov 2026) dan JS-08 (Selesai, 13 Nov 2026) |

## Ringkasan

JS-10 membuat guru bisa menjalankan ronde di kelas dari konsol. Guru atau admin membuat ruang lewat dialog "Ruang baru", melihat daftar dan detail ruang, lalu membuka layar kelas di tab baru untuk proyektor. Layar kelas tersambung ke Durable Object ruang lewat WebSocket bertiket, dan menampilkan lobi (kode, alamat, dan nama samaran), hitung mundur, keadaan saat bermain (sisa waktu, peta kelas, 10 besar, dan kemajuan kelas), jeda, podium, dan pembahasan per kejadian. Guru mengendalikan ronde dari layar kelas dengan tombol dan pintasan papan ketik. Mengeluarkan pemain dan menutup ruang juga bisa dari halaman detail ruang di konsol, sehingga nama siswa tidak tampil besar di proyektor. Ruang coba JS-03 dan kedua alur kerjanya dipensiunkan, dan uji membuat ruang lewat jalur yang sama dengan guru.

## Kaitan PRD

| Kebutuhan | Dipenuhi oleh |
|---|---|
| JFR-01 Guru atau admin membuat ruang (label kelas, paket, durasi, batas pemain, batas terlambat, nomor absen, ruang uji) | P-2 sampai P-5 |
| JFR-02 Kode dan tautan tampil di lobi | P-24 |
| JFR-05 Layar kelas menampilkan jumlah dan nama samaran pemain | P-21, P-24 |
| JFR-06 Mengunci ruang dan mengeluarkan pemain dengan konfirmasi | P-9, P-10, P-30 |
| JFR-27 Lobi | P-24 |
| JFR-28 Saat bermain | P-26 |
| JFR-29 Kontrol guru | P-14, P-30 |
| JFR-30 Podium | P-28 |
| JFR-31 Pembahasan | P-22, P-29 |
| JFR-37 Dasbor: ruang yang sedang berjalan | P-11 |
| PRD 12: sedikitnya 10 ruang serentak di produksi | P-4 (`RUANG_AKTIF_MAKS` produksi 20) |
| Architecture 6.1, 6.4, 7, 10.1, 10.2, 10.9, dan 12.1; Design System 3.6 dan 10 | P-12 sampai P-31 |
| `PLAN.md` usulan 1a–13a dan 14a (butir 3, serta layar kelas yang berhenti menyambung ulang) | Seluruh dokumen |

## Berkas yang dibuat dan diubah

| Berkas | Baru/ubah | Isi |
|---|---|---|
| `app/jejak-setara/inti/protokol-kelas.ts` | Baru | Skema pesan layar kelas (P-16 sampai P-22), dipindah dari `protokol.ts` |
| `app/jejak-setara/inti/protokol.ts` | Ubah | Skema kelas keluar; pembantu skema diekspor untuk `protokol-kelas.ts`; `PROTOKOL_VERSI` tetap 2 |
| `app/jejak-setara/inti/ruang.ts` | Baru | Skema isi API ruang (P-2, P-6, P-8, P-10, P-12) dan batasnya |
| `server/jejak-setara/src/api/ruang.ts` | Ubah | Rute `/api/ruang…`, sambungan `/ws/kelas/`, dan kait uji lokal baru; ruang coba dihapus (P-32) |
| `server/jejak-setara/src/auth/tiket.ts` | Baru | Membuat dan memeriksa tiket (P-12, P-13) |
| `server/jejak-setara/src/auth/izin.ts` | Ubah | Aksi `ruang.buat` dan `ruang.kelola` (P-33) |
| `server/jejak-setara/src/db/ruang.ts` | Ubah | Sisip ruang bersyarat, daftar, detail, dan kesiapan paket (P-3 sampai P-6) |
| `server/jejak-setara/src/api/dasbor.ts` | Ubah | Ruang yang sedang berjalan (P-11) |
| `server/jejak-setara/src/ruang/RuangJejak.ts` | Ubah | Sambungan layar kelas, `tiket_terpakai`, rute internal `kelola` dan `ws-kelas` (P-8, P-10, P-13) |
| `server/jejak-setara/src/ruang/inti-ruang.ts` | Ubah | `info_kelas`, `papan`, `kemajuan`, `dunia_kelas`, pembahasan, dan tutup dari lobi (P-10, P-14, P-17 sampai P-22) |
| `server/jejak-setara/src/index.ts`, `src/env.ts` | Ubah | Rute baru; `KUNCI_TIKET` dan `RUANG_AKTIF_MAKS`; `KUNCI_COBA` dihapus |
| `server/jejak-setara/wrangler.jsonc` | Ubah | Variabel `KUNCI_TIKET` (lokal) dan `RUANG_AKTIF_MAKS` (P-34) |
| `.github/workflows/jejak-uji.yml` | Ubah | `KUNCI_TIKET` di langkah "Siapkan kunci Worker" (P-34) |
| `.github/workflows/jejak-ruang-coba.yml`, `jejak-kendali-coba.yml` | Hapus | P-32 |
| `app/jejak-setara/admin/rute.ts`, `App.tsx`, `Kerangka.tsx` | Ubah | Rute `#/ruang`, `#/ruang/{id}`, dan `#/kelas/{id}`; menu Ruang (P-1) |
| `app/jejak-setara/admin/halaman/Ruang.tsx`, `DetailRuang.tsx` | Baru | Daftar, dialog ruang baru, dan detail ruang (P-2, P-7, P-9) |
| `app/jejak-setara/admin/halaman/Dasbor.tsx` | Ubah | Kartu ruang yang sedang berjalan (P-11) |
| `app/jejak-setara/admin/kelas/` | Baru | Layar kelas: `LayarKelas.tsx`, `Lobi.tsx`, `Langsung.tsx`, `Podium.tsx`, `Pembahasan.tsx`, `PetaKelas.tsx`, `KartuBahas.tsx`, dan `sambungan-kelas.ts` (P-15, P-23 sampai P-31) |
| `app/jejak-setara/teks-konsol.ts` | Ubah | Teks bagian "Teks yang tampil (final)" |
| `app/jejak-setara/styles/jejak.css` | Ubah | Gaya `js-ruang` dan `js-kelas`; token `--js-wood` |
| Uji | Baru dan ubah | Bagian "Rencana uji" |
| `docs/jejak-setara/Architecture.md`, `Design_System.md`, `PRD.md`, `PLAN.md`, `tests/JS-10-hasil.md` | Ubah dan baru | Bagian 3, 4.4, 4.5, 5.3, 6.1, 6.4, 6.5, 7, 10.1, 10.2, dan 10.9 Architecture; Design System 3.6, 4 (`--js-wood`), dan 10; PRD 21 |

Tidak disentuh: Sehari Setara, galeri, `deploy-pages.yml`, pesan protokol pemain, migrasi D1 yang ada, berkas Sesi B, dan berkas Sesi C.

## Perilaku

### Rute dan menu konsol

- **P-1. Menu dan rute.** Menu konsol mendapat butir "Ruang" untuk admin dan guru, di antara Dasbor dan Akun. `admin/rute.ts` mengenal tiga rute baru:
  - `#/ruang`: daftar ruang dan dialog ruang baru.
  - `#/ruang/{id}`: detail ruang. `{id}` harus berbentuk UUID huruf kecil; bentuk lain menjadi dasbor.
  - `#/kelas/{id}`: layar kelas, tanpa kerangka konsol (tanpa menu, kepala, dan tombol Keluar).

  Diberikan pengguna belum masuk membuka `#/kelas/{id}`, ketika ia berhasil masuk (dan tidak wajib ganti sandi), maka hash tidak berubah dan layar kelas terbuka (aturan `tujuan()` JS-04 tetap). Judul tab layar kelas "Layar kelas · {kode}".

### Membuat ruang

- **P-2. Dialog "Ruang baru".** Tombol "+ Ruang baru" di `#/ruang` membuka dialog. Isinya diambil dari `GET /api/ruang/pilihan` (P-6), dan aturan isiannya sama di konsol dan server (`inti/ruang.ts`):

  | Isian | Aturan | Bawaan |
  |---|---|---|
  | Label kelas | Dipangkas spasinya, 1–20 karakter (titik kode), tanpa karakter kendali (D-1) | Kosong |
  | Paket kejadian | Salah satu paket aktif dari D1 | Paket pertama menurut nama |
  | Durasi | 10, 15, atau 20 menit (pilihan tombol) | 15 |
  | Batas pemain | Bilangan bulat 2–100 | 40 |
  | Batas bergabung terlambat | Bilangan bulat 0–10 menit sesudah ronde dimulai | 5 |
  | Minta nomor absen | Hanya bisa dicentang bila batas pemain ≤ 50; bila batas dinaikkan di atas 50, centangnya lepas dan kotaknya nonaktif | Tidak |
  | Ruang uji | Dicentang dan terkunci bila paket belum siap untuk ruang biasa (P-3) | Sesuai kesiapan paket |

  Galat isian tampil di bawah isiannya dan dibacakan pembaca layar. Tombol "Buat ruang" berubah menjadi "Membuat ruang…" dan nonaktif selama permintaan berjalan. Diberikan ruang berhasil dibuat, maka dialog tertutup, pemberitahuan "Ruang {kode} dibuat." tampil, dan konsol pindah ke `#/ruang/{id}`.

- **P-3. Isi ruang selama rujukan belum terverifikasi (Permintaan A-9).** Sebuah paket **siap untuk ruang biasa** bila setiap kejadian di `paket_kejadian` berstatus `terbit`, punya `versi_terbit_id`, dan semua id rujukan di `kartu.rujukan` versi itu berstatus `terverifikasi` di tabel `rujukan`.
  - Ruang biasa memakai versi terbit setiap kejadian, menurut `urutan` paket. Bila paket belum siap, `POST /api/ruang` dengan `uji: false` dijawab 409 `PAKET_BELUM_SIAP`.
  - Ruang uji memakai versi `kerja` setiap kejadian bila ada, dan versi terbit bila tidak ada versi kerja, seperti ruang coba JS-08. Kejadian tanpa versi sama sekali dilewati.
  - Kejadian berstatus `arsip` tidak dipakai di ruang mana pun.

  Selama bank awal belum diverifikasi, semua ruang yang dibuat dari konsol adalah ruang uji, dan statistik (JS-13) tidak memakainya.

- **P-4. Batas ruang (Architecture 12.1, usulan 4a dan 14a butir 3).** Ruang dihitung **aktif** bila statusnya di D1 bukan `ditutup` dan dibuat kurang dari 6 jam lalu.
  - Guru hanya boleh punya satu ruang aktif. Diberikan guru yang punya ruang aktif mencoba membuat ruang lagi, maka server menjawab 409 `RUANG_MASIH_ADA` beserta id, kode, dan label ruang itu, dan dialog menampilkan "Anda masih punya ruang {kode} yang belum ditutup. Tutup ruang itu dulu." dengan tautan "Buka ruang {kode}". Admin tidak dibatasi.
  - Jumlah ruang aktif di satu lingkungan paling banyak `RUANG_AKTIF_MAKS` (lokal 20, uji 3, produksi 20). Diberikan batas itu sudah tercapai, maka server menjawab 503 `SERVER_PENUH` untuk semua peran, dan dialog menampilkan "Server sedang penuh. Tutup ruang yang tidak dipakai atau coba lagi nanti."
  - Kedua batas diperiksa di satu pernyataan `INSERT … SELECT … WHERE` agar dua permintaan serentak tidak bisa melewati batas. Nilai `RUANG_AKTIF_MAKS` yang kosong atau bukan bilangan bulat 1–1000 dianggap 3.

- **P-5. Pembuatan dan inisialisasi.** `POST /api/ruang` (izin `ruang.buat`):
  1. Memeriksa CSRF dan isi (P-2), lalu kesiapan paket (P-3).
  2. Membuat id UUID, kode 5 karakter dari `ABJAD_KODE` yang unik di antara ruang yang belum ditutup (bila bentrok, dicoba lagi paling banyak 5 kali), benih acak 32 bit, dan id Durable Object baru (`newUniqueId`, `locationHint: "apac"`).
  3. Menyisipkan baris `ruang` (P-4): `pemilik_id` pengguna, `label_kelas`, `paket_id`, `pengaturan_json` (bentuk `PengaturanRuang`, dengan ketiga skill P0 aktif seperti ruang coba), status `lobi`, `uji`, dan `do_id`.
  4. Memanggil `/inisialisasi` di Durable Object dengan data ruang, label kelas, dan isi kejadian (P-3).
  5. Menjawab 201 `{ ruang }` (ringkasan ruang P-6).

  Bila inisialisasi gagal, baris D1 ditandai `ditutup` dan server menjawab 503 `RUANG_GAGAL_DIBUAT`; dialog menampilkan "Ruang gagal dibuat. Coba lagi."

### Daftar, detail, dan kelola

- **P-6. API daftar.**
  - `GET /api/ruang/pilihan` (izin `ruang.buat`): `{ paket: [{ id, nama, jumlahKejadian, siapRuangBiasa }] }`, hanya paket aktif.
  - `GET /api/ruang` (izin `ruang.kelola`): ruang yang statusnya bukan `ditutup` dan dibuat kurang dari 24 jam lalu, paling banyak 50, terbaru lebih dulu. Guru hanya melihat ruangnya sendiri; admin melihat semua. Setiap ruang: `{ id, kode, labelKelas, status, uji, jumlahPeserta, batasPemain, namaGuru, dibuatPada }`. `jumlahPeserta` dihitung dari tabel `peserta` di D1, jadi bisa tertinggal sampai sekitar 30 detik dari keadaan ruang.
- **P-7. Halaman `#/ruang`.** Baris atas berisi "{n} ruang belum ditutup" dan tombol "+ Ruang baru". Tabel berkolom Kode (Press Start 2P), Kelas (dengan label "Uji" untuk ruang uji), Status, Pemain ("{n}/{m}"), Guru (hanya untuk admin), Dibuat (`Intl.DateTimeFormat("id-ID")`), serta tombol "Detail" dan tautan "Buka layar kelas" (tab baru). Di bawah 1024 px tabel menjadi kartu bersusun. Kosong: "Belum ada ruang yang berjalan. Buat ruang untuk memulai ronde di kelas." Memuat dan gagal mengikuti pola halaman Akun JS-04.
- **P-8. API detail.** `GET /api/ruang/{id}` (izin `ruang.kelola`; guru hanya untuk ruangnya sendiri, selain itu 404): ringkasan P-6 ditambah keadaan langsung dari Durable Object lewat rute internal `GET https://ruang/kelola`: `{ status, terkunci, mulaiPada, berakhirPada, jedaSejak, tautan, pemain: [{ id, nama, avatar, terhubung }] }`. Pemain yang belum memilih nama dan pemain yang sudah dikeluarkan tidak masuk daftar. Untuk ruang yang sudah ditutup, keadaan langsung tidak diminta dan `pemain` kosong.
- **P-9. Halaman `#/ruang/{id}`.**
  - Kepala: tautan "← Semua ruang", label kelas, kode ruang (Press Start 2P besar), alamat "Buka di HP", status, dan label "Ruang dikunci" bila terkunci.
  - Tombol: "Buka layar kelas" (tautan biasa `target="_blank"` ke `/admin/#/kelas/{id}`, bukan `window.open`), "Kunci ruang" atau "Buka kunci", dan "Tutup ruang". "Tutup ruang" hanya aktif di status `lobi`, `selesai`, dan `pembahasan`; di status lain tombolnya nonaktif dengan keterangan "Ruang hanya bisa ditutup di lobi, sesudah ronde selesai, atau saat pembahasan."
  - Daftar "Pemain ({n})": avatar, nama samaran, "Terhubung" atau "Terputus" (ikon dan tulisan), dan tombol "Keluarkan" (label pembaca layar "Keluarkan {nama}"). Kosong: "Belum ada pemain."
  - Data dimuat ulang setiap 10 detik selama halaman tampil (`document.visibilityState === "visible"`), dan berhenti saat tab tersembunyi. Baris bawah: "Diperbarui {jam}".
  - Konfirmasi memakai dialog konsol JS-04: "Keluarkan {nama}?" dengan isi "{nama} tidak bisa bergabung lagi ke ruang ini.", dan "Tutup ruang {kode}?" dengan isi "Pemain tidak bisa bergabung lagi, dan layar kelas berhenti."
  - Sesudah berhasil: "Ruang dikunci.", "Kunci ruang dibuka.", "{nama} dikeluarkan.", atau "Ruang {kode} ditutup." Ruang yang sudah ditutup menampilkan "Ruang ini sudah ditutup." tanpa tombol kelola. Ruang yang tidak ada: "Ruang tidak ditemukan atau sudah dihapus."
- **P-10. API kelola.** `POST /api/ruang/{id}/kelola` (izin `ruang.kelola`, CSRF) dengan isi `{ aksi: "kunci" | "buka_kunci" | "keluarkan" | "tutup", pemainId? }`. Server meneruskannya ke Durable Object sebagai pesan kelas yang setara (`kunci_ruang`, `keluarkan`, atau `tutup_ruang`) lewat rute internal `POST https://ruang/kelola`, lalu menjawab 200 `{ ok: true }`.
  - `keluarkan` tanpa `pemainId`, atau dengan pemain yang tidak ada: 404 `PEMAIN_TIDAK_ADA`.
  - `tutup` di status `hitung_mundur`, `main`, atau `jeda`: 409 `STATUS_TIDAK_SESUAI`.
  - Aturan inti berubah: `tutup_ruang` kini juga berlaku di status `lobi`, sehingga ruang yang belum dimulai bisa ditutup.
  - Pemain yang dikeluarkan menerima galat `DIKELUARKAN` dan tidak bisa bergabung lagi ke ruang itu (perilaku JS-03).
- **P-11. Dasbor.** Kartu "Ruang yang sedang berjalan" memakai daftar P-6 (`GET /api/dasbor` menyertakan paling banyak 5 ruang dan jumlah seluruhnya). Setiap baris berbunyi "{kode} · {kelas} · {status} · {n} pemain" dan menautkan ke `#/ruang/{id}`. Bila lebih dari 5: tautan "Lihat semua ({n})" ke `#/ruang`. Kosong: "Belum ada ruang yang berjalan." (teks JS-04).

### Tiket dan sambungan layar kelas

- **P-12. Tiket.** `POST /api/ruang/{id}/tiket` (izin `ruang.kelola`, CSRF; guru hanya untuk ruangnya sendiri; ruang belum ditutup) menjawab 200 `{ tiket, kedaluwarsaPada }`.
  - Bentuk tiket: `B.T`, dengan `B` = base64url JSON `{ r: ruangId, e: kedaluwarsa (ms), n: nonce }` (nonce 16 byte acak, base64url) dan `T` = base64url HMAC-SHA256 atas `B` dengan kunci `KUNCI_TIKET`.
  - Masa berlaku 60 detik.
  - Tanpa `KUNCI_TIKET`: 503 `KONSOL_BELUM_SIAP`.
- **P-13. Sambungan `/ws/kelas/{ruangId}?tiket=…`.**
  - Worker menolak bila tajuk `Upgrade` bukan `websocket` (426), `Origin` bukan asal Worker itu sendiri (403, pemeriksaan yang sama dengan sambungan pemain), pembatas `BATAS_WS` habis (429), atau tiket rusak, tanda tangannya salah (dibandingkan dalam waktu tetap), kedaluwarsa, atau `r` berbeda dari `ruangId` (403). Ruang yang tidak ada atau sudah ditutup: 404.
  - Worker meneruskan permintaan ke Durable Object ruang lewat rute internal `https://ruang/ws-kelas`, dengan tajuk `X-Jejak-Peran: guru`, `X-Jejak-Nonce`, `X-Jejak-Kedaluwarsa`, dan `X-Jejak-Asal` (asal Worker, untuk tautan di lobi).
  - Durable Object menolak nonce yang sudah tercatat di tabel SQLite `tiket_terpakai` (403). Bila belum, nonce dicatat beserta kedaluwarsanya, baris yang kedaluwarsanya lewat dihapus, dan WebSocket diterima dengan Hibernation API dan tanda `kelas`.
  - Satu ruang hanya punya satu layar kelas. Sambungan kelas yang lama ditutup dengan kode 4001.
  - Layar kelas mengirim `halo { peran: "guru" }`; sebelum itu pesan lain diabaikan. Sesudah `halo`, server mengirim `info_kelas`, `status_ruang`, lalu `lobi` (di lobi dan hitung mundur), atau `papan`, `kemajuan`, dan `dunia_kelas` (saat bermain, jeda, selesai, dan pembahasan).
  - Ruang yang ditutup menutup sambungan kelas dengan kode 4000.
- **P-14. Pesan kontrol.** Aturan `terimaKelas` JS-03 tetap: `mulai` (lobi → hitung mundur 3 detik → main), `jeda` (main), `lanjut` (jeda), `tambah_waktu { detik: 120 }` (main dan jeda), `akhiri` (main dan jeda → selesai), `kunci_ruang`, dan `keluarkan`. Yang baru: `pembahasan { kejadianId }` (P-22) dan `tutup_ruang` juga di lobi (P-10). `kode_masuk_ulang` tetap diabaikan (JS-17). Pesan yang tidak berlaku untuk status saat itu diabaikan tanpa galat.
- **P-15. Menyambung ulang (usulan 8a dan 14a).** Diberikan sambungan kelas tertutup bukan karena kode 4000, 4001, atau penolakan tiket, maka layar kelas menampilkan pita "Menyambung ulang…", meminta tiket baru (P-12), lalu menyambung lagi dengan jeda 1, 2, 4, 8, lalu 15 detik di setiap percobaan berikutnya. Ronde tetap berjalan di server selama layar kelas terputus.
  - Kode 4000: "Ruang sudah ditutup." dengan tautan "Ke konsol"; percobaan berhenti.
  - Kode 4001: "Layar kelas dibuka di tab lain." dengan tombol "Pakai tab ini", yang menyambung lagi dan mengambil alih; percobaan berhenti sampai tombol ditekan.
  - Tiket dijawab 401: "Sesi berakhir. Silakan masuk lagi." dengan tautan ke `#/masuk`; tiket dijawab 403 atau 404: "Ruang tidak ditemukan."; percobaan berhenti.
  - Sesudah 10 menit gagal terus: "Layar kelas terputus. Ronde tetap berjalan di server." dengan tombol "Coba lagi"; percobaan otomatis berhenti.

### Protokol layar kelas

- **P-16. Modul dan versi.** Skema pesan layar kelas pindah dari `protokol.ts` ke `inti/protokol-kelas.ts`, yang diimpor server dan konsol saja. `protokol.ts` mengekspor pembantu skemanya (`pesan`, `id`, `nama`, dan sejenisnya), dan isinya untuk layar pemain tidak berubah. `PROTOKOL_VERSI` tetap 2, karena pesan kelas belum pernah dipakai klien dan pesan pemain tidak berubah.
- **P-17. `info_kelas` (baru).** `{ labelKelas (1–20), kode (5 karakter), tautan (URL, paling panjang 200), durasiMenit, batasPemain, uji, terkunci, waktuServer, jumlahKejadian, kejadian: [{ id, judul, zona (1–8) }] }`, paling banyak 64 kejadian menurut urutan ruang. Dikirim sesudah `halo` dan setiap kali `terkunci` berubah. Layar kelas memakai `waktuServer` (dan `w` di `dunia_kelas`) untuk menyamakan jam dengan server.
- **P-18. `papan` (berubah).** `{ pemain: [{ id, nama, avatar, warnaTas, skor, peringkat, selesai }], jumlahPemain }`.
  - `pemain` berisi paling banyak 10 orang dengan urutan peringkat JS-08: skor, lalu waktu skor, lalu jumlah Langkah 1 benar, lalu urutan bergabung. `selesai` adalah jumlah kejadian yang kedua langkahnya selesai (0–64).
  - Dikirim paling sering sekali per detik dan hanya bila isinya berubah, serta langsung saat ronde selesai. Peringkat lengkap tidak dikirim ke layar kelas (JFR-30).
- **P-19. `kemajuan`.** `terjawab` = jumlah jawaban yang kedua langkahnya selesai; `kemungkinan` = jumlah pemain berkeidentitas yang belum dikeluarkan × jumlah kejadian ruang. Dikirim paling sering sekali per detik dan hanya bila berubah.
- **P-20. `dunia_kelas` (berubah).** Dikirim setiap putaran ke-5 selama status `main` (2 kali per detik): semua pemain berkeidentitas yang belum dikeluarkan dan punya posisi, `[id, x, y, terhubung]`, paling banyak 100. Tidak dikirim saat jeda.
- **P-21. `lobi`.** Dikirim ke layar kelas setiap kali pemain bergabung, memilih identitas, terputus, tersambung lagi, atau dikeluarkan (`pesanLobi` JS-03), di semua status sebelum `ditutup`.
- **P-22. Pembahasan dan `data_pembahasan`.** Diberikan status `selesai` atau `pembahasan`, ketika layar kelas mengirim `pembahasan { kejadianId }` untuk kejadian di ruang itu, maka status menjadi `pembahasan` (bila belum), `status_ruang` dikirim, dan server menjawab `data_pembahasan`:
  - `opsi1` menurut urutan asli versi (ditampilkan A–D) dengan `benar` dan `jumlah`, yaitu banyaknya pemain yang pilihan Langkah 1-nya, dipetakan lewat urutan acak pemain itu, jatuh ke opsi tersebut.
  - `opsi2` menurut urutan asli dengan `tingkat`, `terjadi`, dan `jumlah`.
  - `kartu` (hak, kewajiban, dan teks rujukan).
  - Hanya jawaban pemain yang belum dikeluarkan yang dihitung. Kejadian yang bukan bagian ruang itu diabaikan.

### Tampilan layar kelas (Design System 3.6 dan maket Gerbang 1)

- **P-23. Kerangka.** Layar penuh jendela, ukuran memakai satuan `--u` (`min(1vh, 0.5625vw)`), latar `cream`, tanpa garis pindai. Tombol kecil `ikon_layar_penuh` di pojok kanan atas dan pintasan `F` mengubah layar penuh. Semua teks yang dibaca dari jauh sedikitnya 2,5u. Huruf: Press Start 2P untuk judul, kode, skor, dan angka; Pixelify Sans untuk sisanya.
- **P-24. Lobi.**
  - Kepala `ink`: "Jejak Setara · {kelas}" dan "{n} pemain" (atau "{n}/{m} pemain" bila n ≥ 80% batas).
  - Kotak kiri: "Buka di HP" (alamat 3,6u), "Kode ruang", dan kode 10u.
  - Kotak kanan: "Cara bergabung" dengan tiga langkah: "Buka alamat di atas", "Ketik kode ruang", dan "Pilih nama samaran dan avatar".
  - Daftar nama: lima kolom, avatar 4,4u, nama 2,8u, urut bergabung, paling banyak 40 nama lalu "+{n} lainnya" (D-2). Nama yang tidak muat di kolomnya mengecil sampai 2,5u, lalu dipotong dengan elipsis (nama lengkap tetap di label pembaca layar). Pemain terputus tampil pucat dengan keterangan pembaca layar "terputus". Kosong: "Menunggu pemain bergabung…".
  - Baris bawah: "Kunci ruang" atau "Buka kunci" (`L`), keterangan "{Ruang uji atau Ruang kelas} · {n} menit · batas {m} pemain", dan "Mulai ▶" (`Spasi`). Mulai nonaktif sampai ada sedikitnya satu pemain berkeidentitas (D-4).
  - Label "Ruang dikunci" (dengan ikon) tampil di kepala bila terkunci, dan "Ruang penuh" bila jumlah pemain sama dengan batas.
- **P-25. Hitung mundur.** Angka 3, 2, dan 1 (Press Start 2P 16u) di tengah, di atas lobi yang diredupkan, dihitung dari `mulaiPada` dan selisih jam server. Tanpa animasi selain pergantian angka.
- **P-26. Saat bermain.**
  - Bilah atas berwarna masa (`#FFD9A8`, `#6EC6F2`, atau `#FFC27A`, sama dengan HUD pemain): ikon matahari, busur hari dengan tiga penanda masa, jam cerita ("Siang 11.40"; fungsi jam cerita yang sama dengan HUD pemain JS-07), dan "Sisa {mm:ss}" (Press Start 2P 4,4u).
  - Kiri: peta kelas. Delapan kotak zona menurut batas zona `kampung.json` (disalin sebagai daftar tetap di konsol dan diuji sama dengan peta; konsol tidak memuat berkas peta), masing-masing dengan warna zona, ikon `ikon_zona_n`, dan perbandingan 160 : 100. Setiap pemain digambar sebagai titik 3 × 3 berwarna tas bergaris `ink`; pemain terputus pucat. Titik bergerak halus di antara dua kiriman `dunia_kelas`. Letak kejadian tidak pernah digambar.
  - Kanan: "10 besar". Setiap baris: peringkat (kolom sedikitnya 5u), avatar, nama samaran, skor, dan "✓{n}" kejadian selesai.
  - Bawah: "Kemajuan kelas" dengan 12 blok (isi `leaf` = pembulatan ke bawah dari persen × 12 / 100) dan "{n}%", lalu tombol "Jeda" (`Spasi`), "+2 menit" (`T`), dan "Akhiri" (`A`, latar `coral`).
- **P-27. Jeda.** Lapisan `ink` 70% di atas tampilan bermain, "Dijeda" (Press Start 2P 4,4u), serta tombol "Lanjut ▶" (`Spasi`) dan "Akhiri" (`A`). Sisa waktu berhenti.
- **P-28. Selesai: podium.** Latar malam (`--js-malam`).
  - Kepala: "Ronde selesai · {kelas}" dan "{n} pemain · {m} kejadian".
  - Tiga besar di atas balok `sun` (peringkat 1, tinggi 22u), `mist` (2, 16u), dan `wood` (3, 11u), dengan avatar 9u, nama, dan skor. Daftar peringkat 4–10 di sebelah kanan. Peringkat seri memakai angka peringkat dari `papan`.
  - Bila kurang dari tiga pemain, balok yang tidak terisi tidak digambar. Tanpa pemain berskor: "Belum ada pemain yang mendapat skor."
  - Tombol "Tutup ruang" (dengan konfirmasi) dan "Pembahasan ▶" (`→`).
- **P-29. Pembahasan.** Latar malam.
  - Kepala: "Pembahasan" dan "Kejadian {i} dari {n} · {m} pemain menjawab" (m = jumlah semua `jumlah` di `opsi1`).
  - Kartu kiri: ikon zona, judul, situasi, dan kartu dampak ("Hak yang terdampak", "Kewajiban terkait", dan "Rujukan").
  - Kartu kanan: "Langkah 1: {pertanyaan}" dengan grafik batang A–D (persen dari m, label "✓ Jawaban tepat" pada opsi benar), lalu "Langkah 2: {pertanyaan}" dengan grafik per tingkat (ikon emosi dan tulisan "Tepat", "Kurang tepat", atau "Berisiko"). Persen dibulatkan ke bilangan bulat terdekat; m = 0 menampilkan 0% di semua batang.
  - Navigasi: "◀ Sebelumnya" (`←`), "Berikutnya ▶" (`→`), dan "Tutup ruang". Kejadian pertama dibuka dengan menekan "Pembahasan ▶" di podium.
  - Data setiap kejadian diminta sekali lewat `pembahasan` lalu disimpan di memori tab; sambil menunggu: "Memuat pembahasan…". Isi kartu yang lebih tinggi dari layar digulir di dalam kartu dengan `↑` dan `↓`, dengan penanda "Gulir ↓".
- **P-30. Kontrol, konfirmasi, dan pintasan (Architecture 10.9).** Tombol dan pintasan berlaku menurut status: `Spasi` (Mulai di lobi, Jeda saat bermain, Lanjut saat jeda), `T` (+2 menit saat bermain atau jeda), `A` (Akhiri saat bermain atau jeda, dengan konfirmasi), `L` (Kunci dan Buka kunci, kecuali sesudah ditutup), `←` dan `→` (podium dan pembahasan), dan `F` (layar penuh). Pintasan diabaikan saat dialog terbuka atau fokus berada di isian.
  - Konfirmasi Akhiri: "Akhiri ronde sekarang?" dengan isi "Pemain tidak bisa menjawab lagi sesudah ronde diakhiri." serta tombol "Batal" dan "Akhiri". Fokus awal di "Batal"; `Esc` menutup.
  - Konfirmasi Tutup ruang: "Tutup ruang {kode}?" dengan isi "Layar kelas dan HP pemain akan berhenti."
  - Mengeluarkan pemain tidak tersedia di layar kelas (usulan 5a), hanya di detail ruang.
- **P-31. Aksesibilitas.** Setiap tombol berlabel, cincin fokus `ink` 3 px, dan urutan Tab mengikuti urutan tampilan. Wilayah `aria-live="polite"` mengumumkan "Ronde dimulai.", "Ronde dijeda.", "Ronde dilanjutkan.", "Waktu ditambah 2 menit.", "Ronde selesai.", "Ruang dikunci.", dan "Kunci ruang dibuka." Tingkat di pembahasan ditandai ikon dan tulisan, bukan warna saja. Peta kelas punya label "Peta kampung dengan {n} pemain. Letak kejadian tidak ditampilkan."

### Pensiun ruang coba, izin, dan konfigurasi

- **P-32. Pensiun ruang coba (usulan 12a).**
  - `POST /api/ruang-coba` dan semua `/api/ruang-coba/…` dihapus (sesudahnya 404), juga `KUNCI_COBA` dari `env.ts`. Alur kerja `jejak-ruang-coba.yml` dan `jejak-kendali-coba.yml` dihapus.
  - Kait uji lokal pindah ke `/api/uji/ruang/{KODE}/{statistik | putuskan | kejadian | pindahkan}`, hanya di lingkungan lokal (lingkungan lain: 404). Kait `kelas` tidak dipindah, karena uji kini memakai layar kelas sungguhan.
  - Uji server, uji ujung ke ujung, dan `sim:beban` membuat ruang lewat admin awal lokal (`KUNCI_ADMIN` lokal), masuk, lalu `POST /api/ruang`.
- **P-33. Izin.** `IZIN` mendapat `"ruang.buat": ["admin", "guru"]` dan `"ruang.kelola": ["admin", "guru"]`. Untuk guru, `ruang.kelola` juga mensyaratkan `ruang.pemilik_id` sama dengan id guru; ruang milik orang lain dijawab 404, bukan 403, agar keberadaannya tidak bocor.
- **P-34. Konfigurasi.**
  - `wrangler.jsonc` lingkungan lokal mendapat `"KUNCI_TIKET": "lokal-kunci-tiket-bukan-rahasia"` dan `"RUANG_AKTIF_MAKS": "20"`; lingkungan uji mendapat `"RUANG_AKTIF_MAKS": "3"`.
  - Langkah "Siapkan kunci Worker" di `jejak-uji.yml` juga membuat `KUNCI_TIKET` bila belum ada, dengan cara yang sama seperti `KUNCI_SANDI` dan `KUNCI_IP`, sehingga pesannya menjadi "Kunci Worker baru: KUNCI_TIKET." atau "Kunci Worker sudah lengkap."
- **P-35. Ukuran kode (usulan 13a).** Kode layar kelas di konsol tidak mengimpor modul layar pemain (`bersama/`, `permainan/`, `assets/manifest.ts`, dan `teks.ts` di luar `isiTeks`). Ikon diimpor langsung dari berkas PNG. Kode layar pemain naik paling banyak 0,5 KB gzip dibanding `main` sebelum Build, dan kode konsol tetap di bawah 350 KB gzip.

## Beberapa pemain sekaligus

- Diberikan 40 pemain di lobi dan layar kelas tersambung, ketika pemain bergabung dan memilih identitas hampir bersamaan, maka setiap perubahan mengirim `lobi` ke layar kelas, dan daftar nama tetap urut bergabung.
- Diberikan 100 pemain saat bermain, maka layar kelas menerima `dunia_kelas` 2 kali per detik (sekitar 2,7 KB per kiriman), `papan` paling sering sekali per detik (sekitar 1,1 KB), dan `kemajuan` yang kecil. `sim:beban` mengukur CPU putaran dan lalu lintas ini.
- Diberikan guru membuka layar kelas di tab kedua, maka tab pertama menerima kode 4001 dan menampilkan "Layar kelas dibuka di tab lain."; tab kedua menjadi layar kelas aktif.
- Diberikan guru menutup tab layar kelas saat bermain, maka ronde tetap berjalan dan berakhir sendiri; membuka layar kelas lagi meminta tiket baru dan menampilkan keadaan terkini.
- Diberikan admin dan guru pemilik membuka detail ruang yang sama, maka keduanya melihat data yang sama, dan aksi keduanya diproses berurutan oleh Durable Object.
- Diberikan seorang pemain dikeluarkan saat sedang menjawab, maka jawabannya yang belum selesai tidak dihitung, ia menerima `DIKELUARKAN`, dan ia hilang dari daftar, papan, peta kelas, dan pembahasan.
- Diberikan dua guru membuat ruang bersamaan saat sisa kuota ruang aktif tinggal satu, maka tepat satu berhasil dan yang lain menerima `SERVER_PENUH` (P-4).
- Diberikan ruang terkunci atau penuh, maka pemain baru menerima `RUANG_TERKUNCI` atau `RUANG_PENUH` (JS-03), sedangkan pemain yang terputus tetap bisa masuk lagi dengan tokennya.

## Status antarmuka

| Tempat | Status | Tampilan |
|---|---|---|
| `#/ruang` | Memuat / kosong / galat | "Memuat ruang…" / teks kosong P-7 / "Daftar ruang gagal dimuat." dengan "Coba lagi" |
| Dialog ruang baru | Biasa / nonaktif / memuat / galat | Isian P-2; nomor absen nonaktif bila batas > 50; "Membuat ruang…"; galat isian atau galat P-4 dan P-5 |
| `#/ruang/{id}` | Memuat / tidak ada / ditutup / galat | "Memuat ruang…" / "Ruang tidak ditemukan atau sudah dihapus." / "Ruang ini sudah ditutup." / "Data ruang gagal dimuat." |
| Layar kelas | Menyambung | "Menyambung ke ruang…" di tengah layar |
| Layar kelas | Menyambung ulang | Pita atas `mango` "Menyambung ulang…"; tampilan terakhir tetap terlihat dan tombol nonaktif |
| Layar kelas | Terputus (10 menit) | "Layar kelas terputus. Ronde tetap berjalan di server." dengan "Coba lagi" |
| Layar kelas | Diganti tab lain | "Layar kelas dibuka di tab lain." dengan "Pakai tab ini" |
| Layar kelas | Ruang ditutup | "Ruang sudah ditutup." dengan "Ke konsol" |
| Layar kelas | Sesi berakhir / ruang tidak ada | "Sesi berakhir. Silakan masuk lagi." / "Ruang tidak ditemukan." |
| Layar kelas | Lobi kosong / ruang terkunci / ruang penuh | "Menunggu pemain bergabung…" / label "Ruang dikunci" / label "Ruang penuh" |
| Layar kelas | Dijeda | Lapisan P-27 |
| Layar kelas | Pembahasan memuat | "Memuat pembahasan…" di kartu |
| Layar kelas | Fokus | Cincin `ink` 3 px pada tombol |

## Teks yang tampil (final)

Semua teks ada di `TEKS_KONSOL` (`app/jejak-setara/teks-konsol.ts`). Teks dengan `{…}` diisi lewat `isiTeks()`. Teks JS-04 yang tidak disebut di sini tidak berubah.

**Menu, status, dan dasbor**

| Kunci | Teks |
|---|---|
| `menu.ruang` | Ruang |
| `status.lobi` / `status.hitung_mundur` / `status.main` / `status.jeda` | Lobi / Hitung mundur / Bermain / Dijeda |
| `status.selesai` / `status.pembahasan` / `status.ditutup` | Selesai / Pembahasan / Ditutup |
| `dasbor.ruangItem` | {kode} · {kelas} · {status} · {n} pemain |
| `dasbor.ruangSemua` | Lihat semua ({n}) |

**Daftar ruang dan dialog ruang baru**

| Kunci | Teks |
|---|---|
| `ruang.judul` | Ruang |
| `ruang.ringkasan` | {n} ruang belum ditutup |
| `ruang.baru` | + Ruang baru |
| `ruang.kosong` | Belum ada ruang yang berjalan. Buat ruang untuk memulai ronde di kelas. |
| `ruang.kolomKode` / `ruang.kolomKelas` / `ruang.kolomStatus` | Kode / Kelas / Status |
| `ruang.kolomPemain` / `ruang.kolomGuru` / `ruang.kolomDibuat` | Pemain / Guru / Dibuat |
| `ruang.pemain` | {n}/{m} |
| `ruang.uji` | Uji |
| `ruang.detail` | Detail |
| `ruang.bukaLayar` | Buka layar kelas |
| `ruang.memuat` | Memuat ruang… |
| `ruang.gagal` | Daftar ruang gagal dimuat. |
| `ruangBaru.judul` | Ruang baru |
| `ruangBaru.label` | Label kelas |
| `ruangBaru.labelPetunjuk` | Misalnya IX B. Tampil di layar kelas. |
| `ruangBaru.paket` | Paket kejadian |
| `ruangBaru.paketOpsi` | {nama} ({n} kejadian) |
| `ruangBaru.durasi` | Durasi |
| `ruangBaru.durasiOpsi` | {n} menit |
| `ruangBaru.batasPemain` | Batas pemain |
| `ruangBaru.batasPemainPetunjuk` | 2–100 pemain. |
| `ruangBaru.terlambat` | Batas bergabung terlambat |
| `ruangBaru.terlambatPetunjuk` | 0–10 menit sesudah ronde dimulai. |
| `ruangBaru.nomorAbsen` | Minta nomor absen |
| `ruangBaru.nomorAbsenPetunjuk` | Hanya untuk batas sampai 50 pemain. |
| `ruangBaru.uji` | Ruang uji (tidak masuk statistik) |
| `ruangBaru.ujiTerkunci` | Kejadian di paket ini belum bisa dipakai untuk ruang biasa, karena rujukannya belum terverifikasi. Untuk sementara, ruang dibuat sebagai ruang uji. |
| `ruangBaru.batal` | Batal |
| `ruangBaru.buat` | Buat ruang |
| `ruangBaru.membuat` | Membuat ruang… |
| `ruangBaru.berhasil` | Ruang {kode} dibuat. |
| `ruangBaru.galatLabel` | Label kelas 1–20 karakter. |
| `ruangBaru.galatBatasPemain` | Batas pemain harus 2–100. |
| `ruangBaru.galatTerlambat` | Batas terlambat harus 0–10 menit. |
| `ruangBaru.galatNomorAbsen` | Nomor absen hanya bisa dipakai untuk batas sampai 50 pemain. |
| `ruangBaru.galatMasihAda` | Anda masih punya ruang {kode} yang belum ditutup. Tutup ruang itu dulu. |
| `ruangBaru.bukaRuangLama` | Buka ruang {kode} |
| `ruangBaru.galatPenuh` | Server sedang penuh. Tutup ruang yang tidak dipakai atau coba lagi nanti. |
| `ruangBaru.galatPaket` | Paket ini belum siap untuk ruang biasa. Centang Ruang uji. |
| `ruangBaru.galatUmum` | Ruang gagal dibuat. Coba lagi. |

**Detail ruang**

| Kunci | Teks |
|---|---|
| `detail.kembali` | ← Semua ruang |
| `detail.kode` | Kode ruang |
| `detail.tautan` | Buka di HP |
| `detail.terkunci` | Ruang dikunci |
| `detail.kunci` / `detail.bukaKunci` | Kunci ruang / Buka kunci |
| `detail.tutup` | Tutup ruang |
| `detail.tutupTidakBisa` | Ruang hanya bisa ditutup di lobi, sesudah ronde selesai, atau saat pembahasan. |
| `detail.tutupJudul` | Tutup ruang {kode}? |
| `detail.tutupIsi` | Pemain tidak bisa bergabung lagi, dan layar kelas berhenti. |
| `detail.pemainJudul` | Pemain ({n}) |
| `detail.pemainKosong` | Belum ada pemain. |
| `detail.terhubung` / `detail.terputus` | Terhubung / Terputus |
| `detail.keluarkan` | Keluarkan |
| `detail.keluarkanLabel` | Keluarkan {nama} |
| `detail.keluarkanJudul` | Keluarkan {nama}? |
| `detail.keluarkanIsi` | {nama} tidak bisa bergabung lagi ke ruang ini. |
| `detail.diperbarui` | Diperbarui {jam} |
| `detail.memuat` | Memuat ruang… |
| `detail.gagal` | Data ruang gagal dimuat. |
| `detail.tidakAda` | Ruang tidak ditemukan atau sudah dihapus. |
| `detail.ditutup` | Ruang ini sudah ditutup. |
| `detail.okKunci` / `detail.okBuka` | Ruang dikunci. / Kunci ruang dibuka. |
| `detail.okKeluarkan` | {nama} dikeluarkan. |
| `detail.okTutup` | Ruang {kode} ditutup. |

**Layar kelas**

| Kunci | Teks |
|---|---|
| `kelas.judulTab` | Layar kelas · {kode} |
| `kelas.menyambung` | Menyambung ke ruang… |
| `kelas.menyambungUlang` | Menyambung ulang… |
| `kelas.terputus` | Layar kelas terputus. Ronde tetap berjalan di server. |
| `kelas.cobaLagi` | Coba lagi |
| `kelas.diganti` | Layar kelas dibuka di tab lain. |
| `kelas.pakaiTabIni` | Pakai tab ini |
| `kelas.ditutup` | Ruang sudah ditutup. |
| `kelas.keKonsol` | Ke konsol |
| `kelas.tidakAda` | Ruang tidak ditemukan. |
| `kelas.layarPenuh` | Layar penuh |
| `kelas.merek` | Jejak Setara · {kelas} |
| `kelas.jumlahPemain` / `kelas.jumlahPemainBatas` | {n} pemain / {n}/{m} pemain |
| `kelas.bukaDiHp` | Buka di HP |
| `kelas.kodeRuang` | Kode ruang |
| `kelas.caraJudul` | Cara bergabung |
| `kelas.cara1` / `kelas.cara2` / `kelas.cara3` | Buka alamat di atas / Ketik kode ruang / Pilih nama samaran dan avatar |
| `kelas.lainnya` | +{n} lainnya |
| `kelas.terputusLabel` | terputus |
| `kelas.menungguPemain` | Menunggu pemain bergabung… |
| `kelas.info` | {jenis} · {n} menit · batas {m} pemain |
| `kelas.ruangUji` / `kelas.ruangBiasa` | Ruang uji / Ruang kelas |
| `kelas.terkunci` / `kelas.penuh` | Ruang dikunci / Ruang penuh |
| `kelas.mulai` | Mulai ▶ |
| `kelas.kunci` / `kelas.bukaKunci` | Kunci ruang / Buka kunci |
| `kelas.masaPagi` / `kelas.masaSiang` / `kelas.masaSore` | Pagi / Siang / Sore |
| `kelas.jamCerita` | {masa} {jam} |
| `kelas.sisa` | Sisa {waktu} |
| `kelas.petaLabel` | Peta kampung dengan {n} pemain. Letak kejadian tidak ditampilkan. |
| `kelas.papanJudul` | 10 besar |
| `kelas.selesaiJumlah` | ✓{n} |
| `kelas.selesaiLabel` | {n} kejadian selesai |
| `kelas.kemajuan` | Kemajuan kelas |
| `kelas.persen` | {n}% |
| `kelas.jeda` / `kelas.lanjut` | Jeda / Lanjut ▶ |
| `kelas.tambahWaktu` | +2 menit |
| `kelas.akhiri` | Akhiri |
| `kelas.dijeda` | Dijeda |
| `kelas.akhiriJudul` | Akhiri ronde sekarang? |
| `kelas.akhiriIsi` | Pemain tidak bisa menjawab lagi sesudah ronde diakhiri. |
| `kelas.batal` | Batal |
| `kelas.podiumJudul` | Ronde selesai · {kelas} |
| `kelas.podiumInfo` | {n} pemain · {m} kejadian |
| `kelas.podiumKosong` | Belum ada pemain yang mendapat skor. |
| `kelas.pembahasan` | Pembahasan ▶ |
| `kelas.tutupRuang` | Tutup ruang |
| `kelas.tutupJudul` | Tutup ruang {kode}? |
| `kelas.tutupIsi` | Layar kelas dan HP pemain akan berhenti. |
| `kelas.bahasJudul` | Pembahasan |
| `kelas.bahasPosisi` | Kejadian {i} dari {n} · {m} pemain menjawab |
| `kelas.bahasMemuat` | Memuat pembahasan… |
| `kelas.langkah1` / `kelas.langkah2` | Langkah 1: {pertanyaan} / Langkah 2: {pertanyaan} |
| `kelas.jawabanTepat` | ✓ Jawaban tepat |
| `kelas.tingkatTepat` / `kelas.tingkatKurang` / `kelas.tingkatBerisiko` | Tepat / Kurang tepat / Berisiko |
| `kelas.hak` / `kelas.kewajiban` / `kelas.rujukan` | Hak yang terdampak / Kewajiban terkait / Rujukan |
| `kelas.sebelumnya` / `kelas.berikutnya` | ◀ Sebelumnya / Berikutnya ▶ |
| `kelas.gulir` | Gulir ↓ |
| `kelas.umumMulai` / `kelas.umumJeda` / `kelas.umumLanjut` | Ronde dimulai. / Ronde dijeda. / Ronde dilanjutkan. |
| `kelas.umumTambah` / `kelas.umumSelesai` | Waktu ditambah 2 menit. / Ronde selesai. |
| `kelas.umumKunci` / `kelas.umumBuka` | Ruang dikunci. / Kunci ruang dibuka. |

## Data, protokol, API, dan migrasi

**Rute API baru** (semua jawaban JSON, galat berbentuk `{ galat: { kode, pesan } }` seperti JS-04; semua `POST` memeriksa CSRF):

| Rute | Izin | Jawaban berhasil | Galat |
|---|---|---|---|
| `GET /api/ruang/pilihan` | `ruang.buat` | 200 `{ paket }` | 401 |
| `POST /api/ruang` | `ruang.buat` | 201 `{ ruang }` | 400 `ISI_SALAH`, 401, 409 `RUANG_MASIH_ADA` / `PAKET_BELUM_SIAP`, 503 `SERVER_PENUH` / `RUANG_GAGAL_DIBUAT` |
| `GET /api/ruang` | `ruang.kelola` | 200 `{ ruang: [...] }` | 401 |
| `GET /api/ruang/{id}` | `ruang.kelola` (pemilik atau admin) | 200 `{ ruang, langsung }` | 401, 404 `RUANG_TIDAK_ADA` |
| `POST /api/ruang/{id}/kelola` | `ruang.kelola` (pemilik atau admin) | 200 `{ ok: true }` | 400, 401, 404 `RUANG_TIDAK_ADA` / `PEMAIN_TIDAK_ADA`, 409 `STATUS_TIDAK_SESUAI` |
| `POST /api/ruang/{id}/tiket` | `ruang.kelola` (pemilik atau admin) | 200 `{ tiket, kedaluwarsaPada }` | 401, 404, 503 `KONSOL_BELUM_SIAP` |
| `GET /ws/kelas/{ruangId}?tiket=…` | Tiket | 101 | 403, 404, 426, 429 |
| `/api/uji/ruang/{KODE}/{statistik, putuskan, kejadian, pindahkan}` | Hanya lokal | Seperti kait JS-07 dan JS-08 | 404 di lingkungan lain |

Dihapus: `POST /api/ruang-coba` dan `/api/ruang-coba/{KODE}/…`.

**Rute internal Durable Object baru:** `GET https://ruang/kelola` (keadaan langsung P-8), `POST https://ruang/kelola` (aksi P-10), dan `https://ruang/ws-kelas` (sambungan P-13). `/inisialisasi` menerima tambahan `labelKelas`.

**Pesan protokol** (`inti/protokol-kelas.ts`, `PROTOKOL_VERSI` 2): pesan layar kelas ke server tidak berubah (`halo`, `mulai`, `jeda`, `lanjut`, `akhiri`, `tambah_waktu`, `kunci_ruang`, `keluarkan`, `kode_masuk_ulang`, `pembahasan`, dan `tutup_ruang`). Pesan server ke layar kelas: `info_kelas` baru (P-17), `papan` berubah (P-18), dan `lobi`, `dunia_kelas`, `kemajuan`, `data_pembahasan`, `status_ruang`, dan `galat` tetap bentuknya. Kode galat baru hanya di API (di atas), bukan di `KODE_GALAT` protokol.

**D1:** tidak ada migrasi. Kueri baru di `db/ruang.ts`: sisip ruang bersyarat (P-4), kesiapan paket (P-3), daftar dan detail ruang (P-6, P-8), serta pengambilan isi kejadian per versi untuk inisialisasi.

**SQLite Durable Object:** tabel `tiket_terpakai (nonce TEXT PRIMARY KEY, kedaluwarsa INTEGER NOT NULL)`, dibuat dengan `CREATE TABLE IF NOT EXISTS`.

**Variabel dan rahasia Worker:** `KUNCI_TIKET` (rahasia, 32 byte acak; lokal memakai nilai tiruan) dan `RUANG_AKTIF_MAKS` (variabel). `KUNCI_COBA` tidak dipakai lagi.

## Aset

Tidak ada aset gambar baru. Dipakai: `ikon_ava_1` sampai `ikon_ava_8`, `ikon_zona_1` sampai `ikon_zona_8`, `ikon_matahari`, `ikon_bulan`, `ikon_emosi_hati`, `ikon_emosi_tanya`, `ikon_emosi_seru`, `ikon_layar_penuh`, `ikon_peringatan`, dan `ikon_centang`, semuanya Disetujui. Token CSS baru `--js-wood: #C98B4F` (warna palet `wood` untuk balok podium ke-3; kontras `ink` di atasnya 5,0 : 1). Tidak ada suara sampai JS-14 (D-3).

## Keamanan dan privasi

- Tiket berumur 60 detik, sekali pakai (nonce di `tiket_terpakai`), terikat ke satu ruang, dan ditandatangani `KUNCI_TIKET` yang tidak pernah keluar dari Worker. Tiket muncul di URL WebSocket, jadi masa berlakunya dibuat pendek dan tidak pernah dicatat aplikasi.
- Sambungan kelas memeriksa `Origin`, dan semua `POST` konsol memeriksa CSRF (JS-04). Guru tidak bisa melihat atau mengelola ruang milik guru lain (404).
- Layar kelas hanya menerima 10 besar, bukan peringkat lengkap (JFR-30), dan hanya nama samaran. Mengeluarkan pemain dilakukan di konsol, bukan di proyektor.
- Batas ruang per guru dan per lingkungan (P-4) membatasi beban dan biaya. Layar kelas berhenti menyambung ulang saat ruang ditutup dan sesudah 10 menit gagal.
- Rute internal Durable Object hanya bisa dicapai lewat Worker, dan kait uji hanya ada di lingkungan lokal.

## Di luar cakupan

- Rekap pribadi, riwayat ruang, hasil per ruang, peringkat lengkap, dan ekspor CSV (JS-11).
- Bank kejadian, penerbitan, dan verifikasi rujukan di konsol (JS-12).
- Pilihan skill per ruang (JS-09); sampai saat itu ketiga skill P0 tersimpan sebagai aktif.
- Kode QR di lobi dan kode masuk ulang (JS-17).
- Suara layar kelas (JS-14).
- Pengaman biaya selain batas ruang aktif dan sambung ulang layar kelas: pengaman alarm, "Jejak: hentikan", penghitung pemakaian, dan batas biaya (JS-22, usulan 14a).
- Domain sendiri (KT-06).

## DRAF untuk ditinjau pemilik proyek

- **D-1. Panjang label kelas.** (a, saran) 1–20 karakter: cukup untuk "IX B" atau "Kelas 9 Bakti", dan muat di kepala layar kelas tanpa mengecil. (b) 1–30 karakter.
- **D-2. Daftar nama di lobi.** (a, saran) urut bergabung, yang terbaru di akhir; sesudah 40 nama tampil "+{n} lainnya". (b) Urut abjad, juga dengan batas 40 nama.
- **D-3. Suara layar kelas sebelum JS-14.** (a, saran) tidak ada tombol suara sama sekali, dan pintasan `M` belum aktif. (b) Tombol suara tampil nonaktif dengan keterangan "Segera".
- **D-4. Syarat tombol Mulai.** (a, saran) Mulai aktif bila sedikitnya satu pemain sudah memilih identitas. (b) Mulai selalu aktif, sehingga guru bisa mencoba ronde tanpa pemain.

## Kriteria penerimaan

- [ ] AC-1 **Rute dan menu.** P-1: menu Ruang untuk admin dan guru; `#/ruang`, `#/ruang/{id}`, dan `#/kelas/{id}` dikenali; id bukan UUID menjadi dasbor; sesudah masuk, hash layar kelas tetap.
- [ ] AC-2 **Dialog ruang baru.** P-2: aturan setiap isian sama di konsol dan server (uji tabel di `inti/ruang.ts`); nomor absen nonaktif di atas 50 pemain; galat isian tampil dan dibacakan; berhasil membuka detail ruang.
- [ ] AC-3 **Kesiapan paket.** P-3: paket dengan satu rujukan `belum` tidak siap; ruang biasa ditolak dengan `PAKET_BELUM_SIAP`; ruang uji memakai versi kerja, lalu versi terbit bila tidak ada versi kerja; kejadian arsip tidak dipakai.
- [ ] AC-4 **Batas ruang.** P-4: guru dengan ruang aktif mendapat `RUANG_MASIH_ADA` beserta kodenya, admin tidak; `SERVER_PENUH` saat batas lingkungan tercapai; dua permintaan serentak tidak melewati batas; nilai `RUANG_AKTIF_MAKS` tidak sah dianggap 3.
- [ ] AC-5 **Pembuatan.** P-5: baris D1 berisi pemilik, label, paket, pengaturan, status `lobi`, dan `uji`; kode unik di antara ruang yang belum ditutup; Durable Object terinisialisasi dengan isi kejadian yang benar; inisialisasi gagal menandai ruang ditutup dan menjawab `RUANG_GAGAL_DIBUAT`.
- [ ] AC-6 **Daftar ruang.** P-6 dan P-7: guru hanya melihat ruangnya; admin melihat semua dan kolom Guru; ruang ditutup atau lebih tua dari 24 jam tidak tampil; tampilan kosong, memuat, dan galat.
- [ ] AC-7 **Detail dan kelola.** P-8 sampai P-10: data langsung dari Durable Object; muat ulang 10 detik hanya selama tab tampil; kunci, buka kunci, keluarkan (dengan konfirmasi), dan tutup (hanya lobi, selesai, dan pembahasan) bekerja dan menampilkan pemberitahuan; ruang milik guru lain dijawab 404.
- [ ] AC-8 **Dasbor.** P-11: paling banyak 5 ruang, tautan ke detail, dan "Lihat semua ({n})" bila lebih.
- [ ] AC-9 **Tiket.** P-12 dan P-13: tiket sah menyambung; tiket kedaluwarsa, bertanda tangan salah, untuk ruang lain, atau sudah dipakai ditolak; `Origin` asing ditolak; tanpa `KUNCI_TIKET` 503.
- [ ] AC-10 **Satu layar kelas.** P-13: sambungan kedua menutup yang pertama dengan 4001; ruang yang ditutup menutup sambungan dengan 4000.
- [ ] AC-11 **Menyambung ulang.** P-15: jeda 1, 2, 4, 8, lalu 15 detik; berhenti pada 4000, 4001, tiket 401, 403, dan 404; berhenti sesudah 10 menit dengan "Coba lagi"; ronde tetap berjalan selama terputus.
- [ ] AC-12 **Kontrol.** P-14 dan P-30: Mulai (hitung mundur 3 detik), Jeda, Lanjut (waktu digeser selama jeda), +2 menit, dan Akhiri (dengan konfirmasi) lewat tombol dan pintasan; pintasan diabaikan saat dialog terbuka; pesan di status yang salah diabaikan.
- [ ] AC-13 **Protokol.** P-16 sampai P-21: `PROTOKOL_VERSI` tetap 2 dan uji protokol pemain JS-02 sampai JS-08 tetap lulus; skema `info_kelas` dan `papan` baru; `papan` hanya 10 besar, paling sering sekali per detik dan hanya saat berubah; `kemajuan` benar; `dunia_kelas` 2 kali per detik dan tidak saat jeda.
- [ ] AC-14 **Pembahasan.** P-22 dan P-29: sebaran Langkah 1 dan 2 dihitung dari opsi asli lewat urutan acak setiap pemain (uji dengan urutan yang diketahui); pemain yang dikeluarkan tidak dihitung; persen dan 0% benar; navigasi `←` dan `→`; isi panjang bisa digulir.
- [ ] AC-15 **Lobi.** P-24: kode, alamat, langkah bergabung, jumlah pemain, daftar lima kolom sampai 40 nama lalu "+{n} lainnya", pemain terputus pucat, label terkunci dan penuh, dan tombol Mulai sesuai D-4.
- [ ] AC-16 **Saat bermain dan jeda.** P-25 sampai P-27: hitung mundur, bilah masa, jam cerita, sisa waktu yang sama dengan server (selisih ≤ 1 detik), peta kelas tanpa letak kejadian, 10 besar dengan ✓, 12 blok kemajuan, dan lapisan jeda.
- [ ] AC-17 **Podium.** P-28: tiga balok `sun`, `mist`, dan `wood`; daftar 4–10; peringkat seri; kurang dari tiga pemain; tanpa pemain berskor.
- [ ] AC-18 **Tampilan di empat ukuran.** Lobi, saat bermain, jeda, podium, dan pembahasan tidak meluap di 1024 × 768, 1280 × 720, dan 1920 × 1080; halaman Ruang dan detail ruang tidak meluap di 1280 × 720 dan di HP 360 × 640.
- [ ] AC-19 **Aksesibilitas.** P-31: label tombol, cincin fokus, urutan Tab, pengumuman `aria-live`, dan tingkat tidak hanya lewat warna; kontras sesuai Design System.
- [ ] AC-20 **Pensiun ruang coba.** P-32: `/api/ruang-coba` dan kait lamanya 404; kait uji baru hanya di lokal; kedua alur kerja terhapus; `KUNCI_COBA` tidak dirujuk kode mana pun; semua uji JS-03, JS-07, dan JS-08 tetap lulus dengan ruang dari `POST /api/ruang`.
- [ ] AC-21 **Izin.** P-33: tabel `IZIN` sesuai; guru tanpa kepemilikan mendapat 404 di semua rute ruang.
- [ ] AC-22 **Konfigurasi.** P-34: `wrangler.jsonc` sesuai; langkah "Siapkan kunci Worker" membuat `KUNCI_TIKET` (percobaan dengan `wrangler` tiruan seperti JS-04).
- [ ] AC-23 **Ukuran kode.** P-35: kode layar pemain naik ≤ 0,5 KB gzip; konsol < 350 KB gzip; uji memastikan konsol tidak mengimpor modul layar pemain.
- [ ] AC-24 **Beban.** `sim:beban` 1 ruang × 50 bot dan 1 ruang × 100 bot dengan satu layar kelas: CPU putaran dan ukuran pesan kelas dicatat, tanpa galat, dan lalu lintas per pemain tetap dalam anggaran Architecture 6.5.
- [ ] AC-25 **Teks.** Isi `TEKS_KONSOL` sama persis dengan bagian "Teks yang tampil (final)" (diurai dari tabel dokumen ini, seperti JS-04).
- [ ] AC-26 **Galeri.** `build:pages` menghasilkan 178 berkas yang identik byte dengan `main` sebelum Build.

## Rencana uji

### Uji unit (`test:jejak`)

- `inti/ruang.ts`: tabel aturan isian (batas bawah, batas atas, karakter kendali, nomor absen > 50).
- `inti/protokol-kelas.ts`: `info_kelas`, `papan`, dan seluruh pesan kelas lama; ukuran batas; `protokol.ts` tidak lagi memuat skema kelas.
- Inti ruang: `terimaKelas` per status (termasuk `tutup_ruang` di lobi dan `pembahasan`), penyusun `papan` (urutan, 10 besar, hanya saat berubah, laju sekali per detik), `kemajuan`, `dunia_kelas` setiap putaran ke-5, dan sebaran pembahasan dengan urutan acak yang diketahui.
- Tiket: bentuk, tanda tangan, kedaluwarsa, ruang lain, dan perbandingan waktu tetap.
- `admin/rute.ts`: rute dengan id dan pengalihan.
- Penyambung ulang layar kelas (`sambungan-kelas.ts`, murni dengan jam tiruan): urutan jeda, kode berhenti, dan batas 10 menit.
- Komponen murni: blok kemajuan, persen pembahasan, susunan podium, dan potongan "+{n} lainnya".
- Kerangka: `wrangler.jsonc`, `jejak-uji.yml` (`KUNCI_TIKET`), kedua alur kerja ruang coba tidak ada, tabel `IZIN`, teks (AC-25), dan konsol tanpa modul layar pemain.

### Uji server (`test:jejak:server`, `server/jejak-setara/uji/kelas.uji-server.ts`)

- Alur penuh di Worker lokal: admin awal, masuk, `POST /api/ruang`, tiket, `/ws/kelas/`, `halo`, `info_kelas`, `lobi`, pemain bergabung lewat WebSocket, Mulai, `dunia_kelas` dan `papan`, Jeda, Lanjut, +2 menit, Akhiri, `papan` akhir, `pembahasan`, dan `tutup_ruang` (4000).
- Batas ruang (guru dan lingkungan, termasuk serentak), kesiapan paket, izin dan kepemilikan, tiket ditolak, 4001 untuk sambungan kedua, kelola lewat API, dan rute ruang coba 404.
- Uji server lama (`bantuan.ts`, `ruang.uji-server.ts`, dan `kejadian.uji-server.ts`) memakai pembantu ruang baru dan kait `/api/uji/…`.

### Uji ujung ke ujung (`e2e/jejak-setara/kelas.uji.ts`)

- Multi-konteks: guru masuk, membuat ruang, membuka detail, lalu membuka layar kelas di tab baru; tiga konteks pemain bergabung; layar kelas menampilkan nama; Mulai; papan berubah saat pemain menjawab; Jeda dan Lanjut; +2 menit; Akhiri; podium; pembahasan dengan persen yang benar; guru mengeluarkan satu pemain dari detail ruang; Tutup ruang.
- Tangkapan layar lobi, saat bermain, jeda, podium, dan pembahasan di 1024 × 768, 1280 × 720, dan 1920 × 1080, serta halaman Ruang di 1280 × 720 dan 360 × 640, disimpan di `docs/jejak-setara/tests/JS-10/`.
- Uji ujung ke ujung lama (`gabung`, `dunia`, `kejadian`, dan `ruang-kejadian.ts`) memakai pembantu ruang baru.

### Beban dan ukuran

- `sim:beban`: 1 ruang × 50 bot dan 1 ruang × 100 bot dengan satu layar kelas tersambung (AC-24).
- Ukuran kode layar pemain dan konsol dibandingkan dengan `main` sebelum Build (AC-23).

### Manual (AGENTS 9) dan lingkungan uji

1. Sesudah push, "Jejak: uji" hijau dan langkah "Siapkan kunci Worker" menulis "Kunci Worker baru: KUNCI_TIKET."
2. Pemilik proyek menghapus rahasia `KUNCI_COBA` di dasbor Cloudflare (Workers & Pages → `jejak-setara-uji` → Settings → Variables and Secrets).
3. Pemilik proyek masuk ke konsol, membuat ruang, membuka layar kelas di laptop yang tersambung ke proyektor atau layar lebar, lalu bergabung dengan dua atau tiga HP dan menjalankan satu ronde pendek sampai pembahasan.
4. Tangkapan layar layar kelas dari proyektor (atau foto) dan dari HP dikirim bersama laporan.
