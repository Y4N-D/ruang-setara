# JS-14 — Pengaturan pemain, aksesibilitas, privasi, suara, dan nama pemain

| | |
|---|---|
| Status | DRAF (22 November 2026), menunggu `Spesifikasi disetujui: JS-14` |
| Rencana | `docs/jejak-setara/PLAN.md`, entri JS-14 |
| Keputusan Gerbang 1 | `Setuju: JS-14` (22 Nov 2026): semua saran usulan 1a sampai 16a, termasuk 2a (nama buatan siswa sebagai pilihan guru, saran pemilik proyek), 3a (kelola nama dari konsol dan layar kelas, dengan Ganti semua nama), dan 12a (penghapusan otomatis sesudah 12 bulan). KT-14 dijawab: nama buatan siswa menjadi pilihan guru, dan bawaannya tetap daftar nama samaran |
| Server | Paket gratis Cloudflare (Architecture JA-14 dan bagian 13.4) |
| Protokol | `PROTOKOL_VERSI` naik dari 2 ke 3 |

## Ringkasan

Sesudah JS-14:

- Pemain punya tombol Menu dan tombol suara. Menu membuka Pengaturan (suara, kurangi gerak, teks muncul per huruf, dan ukuran label nama), Privasi, dan Tentang. Pengaturan bertahan selama tab terbuka.
- Efek suara terdengar di HP bila pemain menyalakannya (bawaan mati), dan di layar kelas secara bawaan (volume 60%), dengan tombol suara dan pintasan `M`.
- Siswa membaca pemberitahuan privasi singkat sebelum masuk ruang.
- Guru bisa memilih "Nama buatan siswa" saat membuat ruang. Siswa mengetik nama 3–14 karakter yang diperiksa penyaring kata di server. Bawaannya tetap daftar nama samaran.
- Guru mengganti nama atau mengeluarkan pemain dari layar kelas dan konsol, dan bisa mengganti semua nama buatan siswa sekaligus.
- Data ruang yang dibuat lebih dari 365 hari lalu dihapus otomatis setiap malam.
- Satu ronde bisa dimainkan penuh dengan papan ketik, dan panel serta dialog terbaca pembaca layar.

## Kaitan PRD

| Acuan | Yang dipenuhi di JS-14 |
|---|---|
| JFR-55 Pengaturan di layar pemain | P-1 sampai P-14 dan P-20 sampai P-28 |
| JFR-56 Pemberitahuan privasi sebelum masuk ruang | P-15 sampai P-19 |
| JFR-57 Papan ketik penuh dan dialog terbaca pembaca layar | P-9 sampai P-11, P-53 sampai P-56, dan P-67 sampai P-70 |
| JFR-01 dan JFR-04 (diubah di Gerbang 1): mode nama pemain | P-32 sampai P-45 |
| JFR-06 (diubah di Gerbang 1): ganti nama dan keluarkan dari konsol dan layar kelas | P-46 sampai P-57 |
| PRD 13 Privasi: data minimal, penyimpanan di perangkat, dan penghapusan sesudah masa simpan | P-2, P-21, P-46, P-50, P-61 sampai P-66, dan bagian "Keamanan dan privasi" |
| PRD 8.6 Sportivitas | P-42 sampai P-57 |
| Design System 12 (suara), 13 (aksesibilitas), dan 15 (kredit) | P-4 sampai P-14, P-20 sampai P-31, dan P-67 sampai P-70 |
| Architecture | 5.1, 5.2, 5.3, 6.2 sampai 6.7, 7, 9, 10.2, 10.8, 10.9, 12.1, dan 12.3 (diperbarui di ZIP ini) |
| Catatan Plan | Pemicu `sfx_kotak` dan `sfx_skill` (Specify JS-09), `SUARA` dan WAV layar kelas (Plan JS-13 dan P-35 JS-10) |

## Berkas yang dibuat dan diubah

| Berkas | Status | Isi |
|---|---|---|
| `app/jejak-setara/inti/nama.ts` | Baru | `rapikanNama`, `bentukNamaSah`, `kunciNama`, `sidikNama` (P-38, P-40) |
| `app/jejak-setara/inti/protokol.ts`, `inti/protokol-kelas.ts`, `inti/versi.ts` | Diubah | Protokol versi 3 (P-58) |
| `app/jejak-setara/inti/tipe.ts`, `inti/ruang.ts` | Diubah | `PengaturanRuang.modeNama`, `skemaRuangBaru.modeNama`, `skemaRingkasanRuang.modeNama` (P-32, P-33) |
| `server/jejak-setara/src/ruang/penyaring-nama.ts` | Baru | Penyaring murni dan daftar kata Lampiran A (P-43) |
| `server/jejak-setara/src/ruang/inti-ruang.ts` | Diubah | Mode nama, `pilih_identitas` mode bebas, batas penolakan, ganti nama, ganti semua nama, daftar blokir (P-41 sampai P-50) |
| `server/jejak-setara/src/ruang/RuangJejak.ts` | Diubah | Aksi kelola `ganti_nama` dan `ganti_semua_nama` dan jawabannya (P-51) |
| `server/jejak-setara/src/api/ruang.ts`, `db/ruang.ts` | Diubah | `modeNama` di pembuatan ruang, ringkasan, dan pemeriksaan kode; aksi kelola; `hapusRuangKedaluwarsa`; kait uji `/api/uji/pembersihan` (P-32 sampai P-34, P-51, P-62 sampai P-65) |
| `server/jejak-setara/src/index.ts` | Diubah | Pemicu harian memanggil `hapusRuangKedaluwarsa` (P-62) |
| `app/jejak-setara/pemain/pengaturan.ts`, `pemain/suara.ts`, `pemain/ketik.ts` | Baru | Pengaturan dan penyimpanannya, pemutar suara, dan teks per huruf (P-1 sampai P-3, P-20 sampai P-26) |
| `app/jejak-setara/pemain/PanelPengaturan.tsx` | Baru | Tombol Menu dan suara, panel Pengaturan, Privasi, dan Tentang (P-4 sampai P-19) |
| `app/jejak-setara/pemain/App.tsx`, `Gabung.tsx`, `LayarDunia.tsx`, `PanelLobi.tsx`, `Rekap.tsx`, `jaringan.ts`, `dunia/skill.ts` | Diubah | Pemasangan pengaturan, suara, privasi, layar identitas mode bebas, `nama_baru`, `mode_nama`, `Esc`, `M`, label, kurangi gerak, dan panah Kompas (P-5 sampai P-8, P-15 sampai P-18, P-22, P-27, P-28, P-36 sampai P-39, P-45, P-47) |
| `app/jejak-setara/bersama/DialogKejadian.tsx` | Diubah | Teks situasi per huruf dan bunyi teks (P-24 sampai P-26) |
| `app/jejak-setara/admin/kelas/LayarKelas.tsx`, `Lobi.tsx`, `Langsung.tsx`, `Podium.tsx`, `Pembahasan.tsx`, `sambungan-kelas.ts` | Diubah | Suara layar kelas, `M`, nama sebagai tombol kelola, menu, konfirmasi, panel Pemain, dan `P` (P-29 sampai P-31, P-53 sampai P-57) |
| `app/jejak-setara/admin/kelas/suara-kelas.ts` | Baru | Pemutar suara layar kelas yang mengimpor WAV langsung (P-29 sampai P-31) |
| `app/jejak-setara/admin/halaman/Ruang.tsx`, `DetailRuang.tsx`, `HasilRuang.tsx`, `Masuk.tsx` | Diubah | Mode nama di dialog Ruang baru, baris Nama pemain, Ganti nama, Ganti semua nama, judul kolom, dan kredit suara (P-13, P-32, P-33, P-52, P-61) |
| `app/jejak-setara/teks.ts`, `teks-konsol.ts` | Diubah | Teks bagian "Teks yang tampil (final)" |
| `app/jejak-setara/styles/jejak.css`, `styles/kelas.css` | Diubah | Gaya baru dan pemilih `data-kurangi-gerak` (P-28) |
| `scripts/jejak-setara/simulasi-beban.mjs` | Diubah | Pilihan `--mode-nama bebas` dan ganti nama oleh layar kelas (bagian "Rencana uji") |
| `app/jejak-setara/__tests__/pengaturan/` | Baru | `pengaturan.test.ts`, `suara.test.ts`, `ketik.test.ts`, `nama.test.ts`, `penyaring.test.ts`, `inti-ruang-nama.test.ts`, `pembersihan.test.ts` |
| `server/jejak-setara/uji/nama.uji-server.ts` | Baru | Uji server mode nama, kelola nama, CSV, dan penghapusan otomatis |
| `e2e/jejak-setara/pengaturan.uji.ts`, `e2e/jejak-setara/nama.uji.ts` | Baru | Uji ujung ke ujung |
| `app/jejak-setara/__tests__/kerangka.test.ts`, uji protokol, uji inti ruang, uji ujung ke ujung yang memilih nama | Diubah | Teks, versi protokol, skema, dan tabel izin |
| `docs/jejak-setara/PRD.md`, `AGENTS.md`, `Design_System.md`, `Architecture.md`, `PLAN.md` | Diubah | Bagian "Perubahan dokumen" |

Tidak disentuh: `package.json`, lockfile, alur kerja, `server/jejak-setara/wrangler.jsonc`, migrasi D1, kode dan dokumen Sehari Setara, galeri, berkas Sesi B (`naskah/`, `seed/`, `__tests__/konten/bank-*` dan `naskah-*`), dan berkas Sesi C (aset, `manifest.ts`, `CREDITS.md`). `__tests__/konten/bank-protokol.test.ts` sudah memakai `PROTOKOL_VERSI`, jadi tetap hijau saat protokol naik.

## Perilaku

### A. Pengaturan pemain

- **P-1. Isi dan bawaan.** Empat pengaturan: `suara` (bawaan mati), `kurangiGerak` (bawaan mengikuti perangkat), `ketik` (teks muncul per huruf, bawaan mati), dan `label` (`biasa` atau `besar`, bawaan `biasa`).
- **P-2. Penyimpanan.** Pengaturan disimpan di `sessionStorage` tab itu dengan kunci `jejak:pengaturan`, berupa JSON `{ "suara": boolean, "kurangiGerak": boolean | null, "ketik": boolean, "label": "biasa" | "besar" }` (`null` berarti mengikuti perangkat), dan ditulis setiap ada perubahan. Saat halaman dimuat, isian yang tidak terbaca atau di luar daftar diganti bawaannya, satu per satu. Bila `sessionStorage` tidak tersedia atau penuh, pengaturan tetap berlaku di memori tanpa galat. Tab baru selalu mulai dari bawaan. Token tetap di kunci `jejak:token:{KODE}` (JS-03 P-25).
- **P-3. Berlaku langsung.** Setiap perubahan langsung berlaku tanpa memuat ulang: suara (bagian D), teks per huruf (bagian E), label (P-27), dan kurangi gerak (P-28).

### B. Menu, Pengaturan, Privasi, dan Tentang

- **P-4. Tombol di dunia.** Di layar dunia (status `lobi`, `hitung_mundur`, `main`, dan `jeda`), kelompok tombol berada di kiri atas, `left: 8px; top: 36px` (8 px di bawah bilah atas setinggi 28 px): tombol "Menu", lalu tombol suara, berjarak 8 px.
  - Setiap tombol setinggi 48 px, bergaris `ink` 4 px, berlatar `cream`, dengan teks `ink`.
  - Menu berisi tulisan "Menu" (Pixelify Sans 16 px, bantalan samping 12 px). Tombol suara berukuran 48 × 48 dengan `ikon_suara_nyala` atau `ikon_suara_mati` (16 × 16 pada skala 2).
  - Di perangkat tanpa layar sentuh, setiap tombol memuat tanda `kbd` di dalamnya, "Esc" dan "M", bergaya ajakan "E Periksa" (Press Start 2P 12 px, garis `ink` 2 px, latar `sun`); karena itu tombol suara melebar.
  - Fokus: garis luar `sun` 4 px berjarak 2 px. Ditekan: bergeser 2 px.
- **P-5. Kapan tampil.** Kedua tombol tampil di keadaan dunia di atas, termasuk di atas lapisan jeda, dan tidak tampil selama dialog kejadian, peta besar, lapisan menyambung ulang, ajakan memutar HP, atau panel Menu terbuka. Di layar identitas, keduanya berada di baris kaki panel di kiri tombol "Gabung", sehingga tinggi panel tidak bertambah. Di rekap pribadi, keduanya berada di kanan judul. Layar Kode, Nomor absen, Menghubungkan, dan Galat tidak memuat keduanya.
- **P-6. Joystick.** Sentuhan yang dimulai di atas tombol mana pun (Menu, suara, skill, Periksa, atau peta mini) tidak memulai joystick.
- **P-7. Panah Kompas.** Pusat panah Kompas tidak boleh berada di kotak kelompok tombol kiri atas yang diperluas 8 px ke setiap sisi. Bila letak dari `letakPanah` (JS-09 P-26) jatuh di kotak itu, panah digeser sepanjang tepi tempatnya berada: di tepi atas ke kanan sampai tepi kanan kotak, dan di tepi kiri ke bawah sampai tepi bawah kotak.
- **P-8. Membuka Menu.** Menekan Menu, atau `Esc` di layar dunia saat tidak ada dialog, peta besar, atau panel lain yang terbuka, membuka panel Pengaturan. Di layar identitas dan rekap, `Esc` juga membuka Menu bila fokus tidak berada di isian. Selama panel terbuka:
  - ronde tetap berjalan;
  - avatar diam, dan masukan gerak dari papan ketik maupun joystick diabaikan;
  - tombol skill, Periksa, dan ajakan `E` tidak tampil, dan pintasan `E`, `1`, `2`, dan `3` tidak bekerja;
  - dialog kejadian tidak bisa dibuka, dan peta mini tidak bisa diketuk.
- **P-9. Panel Pengaturan.** Panel berbingkai piksel di tengah layar (lebar paling besar 640 px, tinggi paling besar tinggi jendela dikurangi 16 px) di atas lapisan `ink` 70%, dengan `role="dialog"`, `aria-modal="true"`, dan judul "Pengaturan" (Press Start 2P 16 px).
  - Empat kelompok pilihan, masing-masing dua tombol (`role="radiogroup"` berisi tombol `role="radio"` setinggi 48 px dengan gaya tombol pilihan Design System 10), dalam dua kolom bila lebar panel ≥ 520 px dan satu kolom bila kurang: Suara (Mati, Nyala); Kurangi gerak (Mati, Nyala, dengan keterangan "Awalnya mengikuti pengaturan perangkatmu." selama nilainya masih mengikuti perangkat); Teks muncul per huruf (Mati, Nyala, dengan keterangan "Ketuk teksnya untuk menampilkan semuanya."); dan Ukuran label nama (Biasa, Besar).
  - Baris kaki: "Privasi", "Tentang", dan "Tutup" (tombol utama).
  - Panah kiri, kanan, atas, dan bawah berpindah di dalam kelompok sambil memilih; `Tab` berpindah antarkelompok dan tombol.
- **P-10. Fokus dan menutup.** Saat dibuka, fokus berada di pilihan yang terpilih di kelompok Suara, dan `Tab` terkunci di dalam panel. `Esc` dan "Tutup" menutup panel; ketukan di luar panel tidak menutupnya. Sesudah ditutup, fokus kembali ke tombol yang membukanya, atau ke kanvas dunia bila panel dibuka dengan `Esc`.
- **P-11. Privasi dan Tentang.** "Privasi" dan "Tentang" membuka panelnya masing-masing dengan pola P-9 dan P-10. "Tutup" di panel itu kembali ke panel Pengaturan bila dibuka dari sana. Fokus awal berada di judul panel (`tabIndex=-1`); kepala dan kaki panel tetap terlihat, dan isinya digulir bila lebih tinggi dari jendela.
- **P-12. Isi Tentang.** "Jejak Setara, bagian dari Ruang Setara.", lalu tiga kalimat kredit (bagian "Teks yang tampil").
- **P-13. Kredit di konsol.** Halaman masuk konsol menampilkan kalimat kredit efek suara di bawah kredit aset visual, sesuai Design System 15.
- **P-14. Tombol suara dan `M`.** Menekan tombol suara, atau `M` di mana saja di layar pemain kecuali saat fokus berada di isian teks, membalik pengaturan Suara dan mengumumkan "Suara dinyalakan." atau "Suara dimatikan.". Label tombol suara "Suara nyala. Tekan untuk mematikan." atau "Suara mati. Tekan untuk menyalakan.", dengan `aria-pressed` dan, di laptop, `aria-keyshortcuts="M"`. Tombol Menu berlabel "Buka menu pengaturan", dan di laptop ber-`aria-keyshortcuts="Escape"`. Tekanan berulang karena tombol ditahan diabaikan.

### C. Pemberitahuan privasi (JFR-56)

- **P-15. Layar Kode.** Di bawah tombol "Masuk" dan di atas penanda server: kalimat "Jejak Setara tidak meminta nama lengkap, foto, atau lokasimu." (Pixelify Sans 13 px, `dusk`), dengan tombol "Privasi" setinggi 48 px di sebelah kanannya. Tombol itu membuka panel Privasi (P-11). "Tutup" kembali ke layar Kode dengan isian kode tidak berubah.
- **P-16. Isi panel Privasi.** Daftar istilah dengan enam butir (teks final di bagian "Teks yang tampil"): Yang disimpan, Untuk apa, Siapa yang melihat, Berapa lama, Yang tidak disimpan, dan Di perangkat ini.
- **P-17. Layar Nomor absen.** Di bawah petunjuk ditambah kalimat "Nomor absen dipakai gurumu untuk melihat hasilmu."
- **P-18. Layar identitas mode bebas.** Kalimat "Jangan memakai nama lengkap. Nama ini tampil di layar kelas." berada di bawah isian nama (P-36).
- **P-19. Dari Menu.** Menu → "Privasi" membuka panel yang sama.

### D. Suara di layar pemain

- **P-20. Pemutar.** `pemain/suara.ts` mengikuti pola `app/sehari-setara/ui/sound.ts`: Web Audio dengan satu `GainNode` bervolume 60%, serta pembuat konteks dan pemuat berkas yang diberikan dari luar agar bisa diuji dengan konteks tiruan. Konteks dibuat, atau dilanjutkan bila `suspended`, pada ketukan atau tombol yang menyalakan suara. Bila pengaturan Suara sudah nyala dari `sessionStorage`, konteks dibuat pada `pointerdown` atau `keydown` pertama sesudah halaman dimuat. Bila peramban tidak punya Web Audio, suara diam tanpa galat, dan tombol suara tetap bisa dipakai.
- **P-21. Unduhan.** Selama Suara mati, layar pemain tidak meminta satu pun berkas WAV. Saat Suara pertama kali dinyalakan di tab itu, sembilan berkas di `SUARA` selain `akhir` diunduh dan diurai sekaligus. Bunyi yang diminta sebelum berkasnya siap dilewati, tidak diantre. Berkas yang gagal diunduh atau diurai membuat bunyi itu diam, tanpa pesan.
- **P-22. Pemicu.** Hanya bila Suara nyala:

  | Bunyi | Pemicu |
  |---|---|
  | `kejadian` | `kejadian_terlihat` untuk kejadian yang belum pernah diterima tab ini; paling sering sekali per detik |
  | `kotak` | `pemberitahuan` `kotak_lari`, `kotak_kompas`, dan `kotak_petunjuk`; paling sering sekali per 300 ms |
  | `skill` | `pribadi` dengan `aktifSampai.lari` atau `aktifSampai.kompas` yang lebih besar dari nilai sebelumnya (masa aktif baru), dan `petunjuk` pertama untuk satu kejadian (bukan kiriman ulang saat dialog dibuka lagi) |
  | `tepat` | `hasil_1` dengan `benar` bernilai benar, dan `hasil_2` dengan tingkat `tepat` |
  | `lembut` | `hasil_1` dengan `benar` bernilai salah, dan `hasil_2` dengan tingkat `kurang` atau `berisiko` |
  | `hitung` | Setiap angka hitung mundur (3, 2, dan 1) yang tampil di HP |
  | `peringatan` | `pemberitahuan` `dua_menit` |
  | `klik` | Tekanan "Kunci jawaban" (tombol atau `Enter`) yang mengirim `kunci_1` atau `kunci_2` |
  | `teks` | Teks muncul per huruf (bagian E): setiap 2 huruf atau angka, dengan laju 1,2 seperti Sehari Setara |

  `hasil_1` yang dikirim ulang saat dialog dibuka lagi di Langkah 2 (KT-13) tidak berbunyi. `akhir` tidak pernah diputar di HP.
- **P-23. Volume dan tumpang.** Tidak ada volume per efek. Bunyi boleh bertumpuk, kecuali batas di P-22. Mematikan Suara tidak memotong bunyi yang sedang berjalan, karena semuanya paling lama 0,6 detik.

### E. Teks muncul per huruf

- **P-24. Bawaan dan cakupan.** Bawaannya mati. Bila nyala, teks situasi di dialog kejadian muncul 40 huruf per detik (`panjangKetik`, rumus `typedLength` Sehari Setara), mulai saat situasi pertama kali tampil untuk kejadian itu di tab itu. Pertanyaan, pilihan, umpan balik, dan kartu dampak tetap tampil langsung (D-7).
- **P-25. Melewati.** Ketukan di kotak situasi, atau `Enter` dan `Spasi` saat fokus berada di kotak situasi (`tabIndex=0`, label "Situasi. Ketuk untuk menampilkan semuanya."), menampilkan seluruh situasi. Di tampilan ringkas, "Lihat pilihan" juga menampilkan seluruh situasi. Pilihan tetap bisa dipilih dan dikunci selama teks berjalan, dan masa tunggu 600 ms tidak berubah. Situasi yang sudah tampil penuh tidak berjalan lagi saat dialog yang sama dibuka ulang.
- **P-26. Pembaca layar dan bunyi.** Teks yang sedang berjalan ber-`aria-hidden="true"`, sedangkan teks situasi lengkap sudah ada sejak awal di elemen `.js-sr` di kotak yang sama. Bunyi `teks` hanya terdengar bila Suara nyala. Pratinjau penyunting konsol (JS-12) tidak memakai teks per huruf.

### F. Label nama dan kurangi gerak

- **P-27. Label nama.** Ukuran huruf label: Biasa 13 px dan Besar 17 px CSS, dikali `devicePixelRatio`. Jarak dalam 2 px, garis 1 px, dan batas 8 label tetap. Mengubah ukuran membuat ulang gambar label pada bingkai berikutnya.
- **P-28. Kurangi gerak.** Nilai efektifnya adalah pengaturan Kurangi gerak bila sudah diubah pemain, dan selain itu hasil `prefers-reduced-motion: reduce`.
  - Nilai efektif dipasang sebagai atribut `data-kurangi-gerak="ya"` atau `"tidak"` di `<html>`, dan ketiga blok `@media (prefers-reduced-motion: reduce)` di `jejak.css` diganti pemilih `:root[data-kurangi-gerak="ya"]`.
  - Mesin dunia (sprite, debu, pop, kilau, denyut panah, skor melayang, dan blok jeda tombol skill) membaca nilai efektif yang sama.
  - Selama pengaturan masih mengikuti perangkat, perubahan pengaturan perangkat langsung berlaku lewat peristiwa `change` pada `matchMedia`.
  - Layar kelas dan konsol tetap mengikuti `prefers-reduced-motion`.

### G. Suara di layar kelas

- **P-29. Bawaan dan tombol.** Suara layar kelas nyala secara bawaan dengan volume 60%. Tombol suara 48 × 48 (`ikon_suara_nyala` dan `ikon_suara_mati` diimpor langsung dari berkas PNG, P-35 JS-10) berada di kepala layar kelas di kanan jumlah pemain, di semua tampilan kecuali "Ruang ditutup". Tombol itu dan pintasan `M` membalik pilihan, yang disimpan di `sessionStorage` dengan kunci `jejak:suara-kelas` (`nyala` atau `mati`), lalu mengumumkan "Suara dinyalakan." atau "Suara dimatikan.".
- **P-30. Konteks dan izin peramban.** Konteks audio dibuat, dan ketiga berkas (`sfx_hitung.wav`, `sfx_peringatan.wav`, dan `sfx_akhir.wav`) diunduh, pada `pointerdown` atau `keydown` pertama di halaman layar kelas. Bila sebuah bunyi seharusnya diputar sementara konteks belum ada atau masih `suspended`, bunyi itu dilewati, dan tulisan "Klik untuk menyalakan suara" tampil di kiri tombol suara sampai ketukan berikutnya.
- **P-31. Pemicu.** Hanya bila nyala dan perubahannya diamati langsung:
  - `hitung` pada setiap angka hitung mundur 3, 2, dan 1;
  - `peringatan` sekali saat sisa waktu turun melewati 120 detik selama `main`. Bunyi ini diputar lagi bila tambah waktu membuat sisa waktu di atas 120 detik lalu turun melewatinya lagi, dan tidak diputar bila layar dimuat saat sisa waktu sudah di bawah 120 detik;
  - `akhir` saat status berubah dari `main` atau `jeda` menjadi `selesai`. Layar kelas yang dimuat ulang saat status sudah `selesai` tidak memutar jingle.

  Musik latar tetap di JS-21.

### H. Mode nama dan layar identitas

- **P-32. Pilihan guru.** Dialog Ruang baru (JS-10) mendapat kelompok "Nama pemain" sesudah kelompok Skill: dua tombol radio setinggi 48 px, "Daftar nama samaran" (terpilih secara bawaan) dan "Nama buatan siswa", masing-masing dengan satu kalimat keterangan. `POST /api/ruang` menerima `modeNama` opsional (`"daftar"` atau `"bebas"`; tanpa isian berarti `"daftar"`). Nilai lain dijawab 400 `ISI_SALAH`, dan ruang tidak dibuat. Nilainya disimpan di `ruang.pengaturan_json` dan dikirim ke Durable Object bersama pengaturan lain.
- **P-33. Tampil di konsol.** Kepala halaman ruang mendapat baris "Nama pemain" sesudah baris "Skill", berisi "Daftar nama samaran" atau "Nama buatan siswa" menurut mode ruang yang berlaku sekarang (P-48). `skemaRingkasanRuang` mendapat `modeNama`; pengaturan lama tanpa isian ini dibaca sebagai `"daftar"`.
- **P-34. Mode diketahui sebelum menyambung.** `GET /api/publik/ruang/{KODE}` menjawab `{ ada, modeNomorAbsen, modeNama }`. `selamat_datang.pengaturan.modeNama` berisi mode yang berlaku untuk pemain itu (P-41).
- **P-35. Layar identitas mode daftar.** Tidak berubah dari JS-03 P-51, kecuali tombol Menu dan suara di baris kaki (P-5).
- **P-36. Layar identitas mode bebas.**
  - Kelompok kiri: label "Nama pemain" dengan penghitung "{n}/14" di kanannya; isian satu baris (Pixelify Sans 16 px, `maxlength` 14, `autocomplete="off"`, `autocapitalize="words"`, `spellcheck=false`); kalimat "Jangan memakai nama lengkap. Nama ini tampil di layar kelas." (dipasang lewat `aria-describedby`); dan tombol "Pakai nama samaran".
  - Kelompok kanan: kisi avatar seperti mode daftar.
  - Baris kaki: Menu, suara, dan "Gabung", yang aktif bila nama berbentuk sah dan avatar sudah dipilih.
  - Di setiap ukuran layar, tinggi panelnya tidak melebihi tinggi panel mode daftar di ukuran yang sama.
- **P-37. Pakai nama samaran.** Tombol ini mengisi isian dengan saran berikutnya dari tiga saran server, bergiliran. Sesudah ketiganya terpakai, layar mengirim `minta_nama` dan memakai saran baru.
- **P-38. Bentuk nama di klien.** Sebelum mengirim, layar merapikan nama (`rapikanNama`: NFKC, spasi berurutan menjadi satu, dan spasi di kedua ujung dibuang), lalu memeriksa bentuknya (`bentukNamaSah`): 3–14 karakter berupa huruf A–Z dan a–z, angka 0–9, dan spasi (D-3). Bila bentuknya tidak sah, pita galat "Nama berisi 3–14 huruf, angka, atau spasi." tampil tanpa mengirim pesan, dan fokus kembali ke isian. Layar pemain tidak memuat daftar kata penyaring.
- **P-39. Mengirim.** "Gabung", atau `Enter` di isian, mengirim `pilih_identitas { nama, avatar }` dengan nama yang sudah dirapikan. `NAMA_DITOLAK` dan `NAMA_DIPAKAI` menampilkan pita galat dengan kalimatnya, mengumumkannya, mengembalikan fokus ke isian, dan membiarkan isinya agar bisa diubah.

### I. Nama di server dan penyaring

- **P-40. Aturan bersama** di `inti/nama.ts` (murni, dipakai klien dan server): `rapikanNama`, `bentukNamaSah`, `kunciNama` (hasil `rapikanNama` dalam huruf kecil), dan `sidikNama` (sidik 64 bit dari `kunciNama`, ditulis sebagai 16 karakter heksadesimal, dari FNV-1a 32 bit yang dihitung dua kali dengan benih berbeda). Sidik dipakai untuk mengenali nama yang pernah diganti guru tanpa menyimpan tulisannya; sidik bukan pengaman sandi.
- **P-41. Mode yang berlaku.** Ruang menyimpan modenya di meta `modeNama`, yang awalnya diambil dari pengaturan. Mode yang berlaku untuk seorang pemain adalah `daftar` bila mode ruang `daftar` atau pemain itu sudah ditolak lima kali (P-44), dan `bebas` selain itu.
- **P-42. Menerima `pilih_identitas`.** Pemain yang sudah punya nama diabaikan, seperti JS-03. Selain itu, urutannya:
  1. Bila `nama` sama persis dengan salah satu saran terakhir pemain itu, `kunciNama`-nya belum dipakai pemain lain, dan sidiknya tidak diblokir (P-50), nama diterima sebagai nama daftar.
  2. Bila mode yang berlaku `daftar`: `galat NAMA_DIPAKAI` (perilaku JS-03).
  3. Bila mode yang berlaku `bebas`: nama dirapikan. Bila bentuknya tidak sah, sidiknya diblokir, atau nama tertangkap penyaring (P-43): `galat NAMA_DITOLAK`. Bila `kunciNama`-nya sudah dipakai pemain lain, termasuk yang terputus dan yang dikeluarkan: `galat NAMA_DIPAKAI`. Selain itu nama diterima dengan tulisan yang sudah dirapikan.

  Setiap penolakan diikuti `saran_nama` berisi saran baru. Sesudah nama diterima, alurnya sama dengan JS-03 P-23: warna tas, `pemain_baru`, posisi awal, baris peserta, dan `lobi`.
- **P-43. Penyaring.** `server/jejak-setara/src/ruang/penyaring-nama.ts` (murni, hanya diimpor server):
  - Nama diubah menjadi kerangka: NFKD tanpa tanda diakritik; huruf kecil; `0` menjadi o, `1` i, `3` e, `4` a, `5` s, `6` g, `7` t, `8` b, dan `9` g; karakter selain a–z memisahkan kata; kata satu huruf yang berurutan disatukan; dan huruf yang berulang dirapatkan (misalnya "aaa" menjadi "a").
  - Daftar kata (Lampiran A, D-1) dibandingkan dalam bentuk yang juga dirapatkan. Setiap kata berjenis "utuh" atau "potongan".
  - Nama ditolak bila (1) ada kata yang sama dengan kata mana pun di daftar; (2) ada kata yang memuat kata berjenis "potongan" dan kata itu tidak ada di daftar izin; atau (3) gabungan dua kata berurutan yang masing-masing paling panjang 3 huruf sama dengan kata daftar atau memuat kata "potongan".
  - Satu pemeriksaan paling lama 0,1 ms.
- **P-44. Batas penolakan.** Setiap `NAMA_DITOLAK` menambah hitungan pemain itu. Pada penolakan kelima (D-4), server mengirim `mode_nama { modeNama: "daftar" }` kepada pemain itu, dan sejak itu P-42 butir 2 berlaku untuknya. Hitungan disimpan di `pemain.saran_json` sebagai `{ "saran": [...], "tolak": n }`; isian lama berupa larik tetap terbaca dengan `tolak` 0. Dengan begitu hitungan bertahan saat ruang beristirahat.
- **P-45. Menerima `mode_nama`.** Layar identitas berganti ke tampilan mode daftar dengan saran terakhir, tanpa pita galat tambahan.

### J. Kelola nama oleh guru

- **P-46. Ganti nama di inti ruang.** Pesan kelas `ganti_nama { pemainId }` berlaku untuk pemain berkeidentitas yang belum dikeluarkan, di status apa pun sebelum `ditutup`:
  1. sidik nama lamanya masuk daftar blokir ruang (P-50);
  2. nama baru dipilih acak, dengan pembangkit dari pembungkus, dari daftar nama samaran yang `kunciNama`-nya belum dipakai dan sidiknya tidak diblokir; bila tidak ada lagi, namanya "Pemain {urutan bergabung}", ditambah angka berikutnya bila nama itu kebetulan sudah dipakai;
  3. nama baru disimpan (`simpanPemain`) dan dikirim ke semua pemain sebagai `nama_baru { id, nama }`, lalu layar kelas menerima `lobi` dan `papan` (dikirim paksa);
  4. baris peserta diantrekan lagi dengan nama baru, dan dengan peringkat akhirnya bila ronde sudah berakhir, sehingga baris D1 tertimpa pada kiriman berikutnya.

  Pesan untuk pemain yang tidak memenuhi syarat diabaikan tanpa galat. Nama lama tidak disimpan di mana pun sesudahnya.
- **P-47. Di HP.** Pemain lain melihat nama baru di label, peta, dan lobi. Di HP pemain itu, nama sendiri diganti, lalu pita "Gurumu mengganti namamu menjadi {nama}." tampil dan diumumkan. Pemain tidak bisa mengganti namanya sendiri sesudah bergabung.
- **P-48. Ganti semua nama.** Pesan kelas `ganti_semua_nama` hanya berlaku bila mode ruang `bebas`:
  1. setiap pemain berkeidentitas yang belum dikeluarkan dan namanya bukan nama dari daftar nama samaran diganti seperti P-46;
  2. meta `modeNama` menjadi `daftar` (D-5);
  3. pemain yang belum punya nama menerima `mode_nama { modeNama: "daftar" }`, dan layar kelas menerima `info_kelas` baru.

  Di ruang `daftar`, pesan ini diabaikan.
- **P-49. Keluarkan.** Mengeluarkan dari layar kelas memakai pesan `keluarkan` yang sudah ada (JS-03 P-37).
- **P-50. Daftar blokir.** Meta `namaDiblokir` berisi sidik (P-40), paling banyak 300 butir; bila penuh, butir tertua dibuang. Nama yang sidiknya diblokir ditolak dengan `NAMA_DITOLAK` (P-42) dan tidak dipilih sebagai nama pengganti. Daftar ini ikut terhapus bersama penyimpanan ruang.
- **P-51. API konsol.** `POST /api/ruang/{id}/kelola` menerima aksi `ganti_nama` (dengan `pemainId`) dan `ganti_semua_nama`, dengan izin `ruang.kelola` seperti aksi lain.
  - `ganti_nama` untuk pemain yang tidak ada, belum punya nama, atau sudah dikeluarkan: 404 `PEMAIN_TIDAK_ADA`. Berhasil: 200 `{ ok: true, nama }`.
  - `ganti_semua_nama` di ruang yang modenya `daftar`: 409 `BUKAN_NAMA_BEBAS`. Berhasil: 200 `{ ok: true, jumlah }`.
  - Ruang yang sudah ditutup dijawab seperti aksi kelola JS-10.
- **P-52. Halaman ruang di konsol.** Setiap baris pemain mendapat tombol "Ganti nama" (label pembaca layar "Ganti nama {nama}") di kiri "Keluarkan", tanpa konfirmasi. Sesudah berhasil, pemberitahuan "Nama pemain diganti menjadi {nama}." tampil dan daftar dimuat ulang. Di ruang yang modenya `bebas` dan belum ditutup, tombol "Ganti semua nama" berada di atas daftar pemain dan memakai konfirmasi (judul, isi, dan tombol `coral` di bagian "Teks yang tampil"). Sesudah berhasil: "{n} nama diganti.".
- **P-53. Layar kelas: nama di lobi.** Setiap nama di daftar lobi menjadi tombol setinggi sedikitnya 48 px dengan tampilan sama seperti JS-10, ber-`aria-haspopup="menu"` dan `aria-expanded`, dengan label "Kelola {nama}" (ditambah ", terputus" bila pemain terputus). Menekannya membuka menu tepat di bawah nama itu, berisi "Ganti nama", "Keluarkan", dan "Batal". Setiap butir setinggi 48 px dengan `role="menuitem"`; fokus awal di butir pertama; panah atas dan bawah berpindah; `Esc` dan "Batal" menutup menu dan mengembalikan fokus ke nama. Hanya satu menu terbuka pada satu waktu.
- **P-54. Layar kelas: aksi.** "Ganti nama" langsung mengirim `ganti_nama`, menutup menu, dan menampilkan pita "Nama pemain diganti." selama 3 detik, yang juga diumumkan. "Keluarkan" membuka konfirmasi "Keluarkan pemain ini?" berisi "Pemain ini tidak bisa bergabung lagi ke ruang ini.", dengan tombol "Batal" (fokus awal) dan "Keluarkan" (`coral`). Sesudah dikonfirmasi, layar kelas mengirim `keluarkan` dan menampilkan pita "Pemain dikeluarkan.". Konfirmasi, pita, dan pengumuman layar kelas tidak pernah memuat nama pemain.
- **P-55. Layar kelas: panel Pemain.** Tombol "Pemain" dengan tanda `P` berada di baris kontrol di semua tampilan sebelum "Ruang ditutup": lobi, saat bermain, jeda, podium, dan pembahasan. Tombol itu dan pintasan `P` membuka panel "Pemain ({n})", berisi semua pemain berkeidentitas yang belum dikeluarkan, urut bergabung, dalam lima kolom (avatar dan nama sebagai tombol P-53; pemain terputus tampil pucat), tanpa skor dan peringkat. Panel memakai `role="dialog"`, tombol "Tutup", dan `Esc` (bila tidak ada menu yang terbuka). Panel dan menu tetap terbuka saat daftar berubah; baris pemain yang dikeluarkan hilang. Panel kosong menampilkan "Belum ada pemain.".
- **P-56. Layar kelas: pintasan.** Selama menu, panel Pemain, atau konfirmasi terbuka, pintasan `Spasi`, `T`, `A`, `L`, `P`, panah, dan `F` diabaikan; `Esc` dan `M` tetap bekerja.
- **P-57. Layar kelas: cara bergabung.** Langkah ketiga di lobi berbunyi "Pilih nama samaran dan avatar" di mode daftar dan "Tulis nama pemain dan pilih avatar" di mode bebas, mengikuti `info_kelas.modeNama`.

### K. Protokol versi 3

- **P-58. Perubahan skema.** `PROTOKOL_VERSI` menjadi 3:
  - `pengaturan` (di `selamat_datang`) mendapat `modeNama: z.enum(["daftar", "bebas"])`;
  - `KODE_GALAT` ditambah `NAMA_DITOLAK`;
  - server ke pemain baru: `nama_baru { id, nama }` dan `mode_nama { modeNama }`;
  - layar kelas ke server baru: `ganti_nama { pemainId }` dan `ganti_semua_nama {}`;
  - `info_kelas` mendapat `modeNama`;
  - `pilih_identitas` tetap `{ nama, avatar }`, dan `PANJANG_TEKS.nama` tetap 24.

  Klien versi 2 menerima `VERSI_BERBEDA` (JS-03 P-17). Uji dan alat yang memakai `PROTOKOL_VERSI`, termasuk `bank-protokol.test.ts` dan `sim:beban`, tidak menulis angka tetap.
- **P-59. Batas pesan.** Semua pesan baru dibatasi seperti pesan lain (2 KB dan ember token per sambungan).
- **P-60. Teks galat dari server.** Kolom `pesan` pada `galat` diisi teks yang sama dari `teks.ts`, seperti JS-03 P-55.

### L. CSV dan teks konsol

- **P-61. Judul kolom.** Kolom ke-4 CSV peserta dan kolom ke-3 CSV jawaban berjudul "Nama pemain", begitu pula kolom nama di tabel peringkat hasil ruang. Isi dan urutan kolom lain tidak berubah. Pemain yang namanya diganti guru tampil dengan nama barunya.

### M. Penghapusan otomatis sesudah masa simpan

- **P-62. Pemicu harian.** Pemicu harian (03.00 WITA), sesudah langkah JS-03 dan JS-04, menjalankan `hapusRuangKedaluwarsa`: memilih paling banyak 50 ruang berstatus `ditutup` dengan `dibuat_pada` lebih dari 365 hari sebelum waktu pemicu (D-8), urut dari yang tertua, lalu untuk setiap ruang menjalankan pernyataan hapus JS-11 (`hapusDataRuang`: jawaban, peserta, lalu ruang) dalam satu `batch` bersama log audit.
- **P-63. Catatan.** Log audit `ruang.hapus_otomatis` ditulis dengan `pengguna_id` kosong, `sasaran` berisi id ruang, dan `rincian_json` berisi kode, label kelas, waktu dibuat, serta jumlah baris peserta dan jawaban, tanpa nama pemain. Log Worker mencatat satu baris berisi jumlah ruang yang dihapus.
- **P-64. Kegagalan.** Kegagalan satu ruang tidak menghentikan ruang lain, dan ruang yang tersisa dihapus pada malam berikutnya.
- **P-65. Kait uji lokal.** `POST /api/uji/pembersihan` dengan isi `{ sekarang }` (milidetik) menjalankan langkah yang sama dengan waktu itu dan menjawab `{ dihapus }`. Di `uji` dan `produksi` jawabannya 404.
- **P-66. Masa simpan yang bisa diatur.** Pengaturan 3–24 bulan tetap di JS-19 (KT-09).

### N. Papan ketik dan pembaca layar (JFR-57)

- **P-67. Kendali baru.** Semua kendali baru bisa dicapai dengan `Tab` dan dijalankan dengan `Enter` atau `Spasi`, dan fokusnya selalu terlihat.
- **P-68. Panel dan dialog.** Panel Pengaturan, Privasi, dan Tentang di layar pemain, serta panel Pemain dan konfirmasi di layar kelas, memakai `role="dialog"`, `aria-modal="true"`, judul (`aria-labelledby`), jebakan `Tab`, `Esc`, dan fokus yang kembali ke pembukanya.
- **P-69. Pengumuman.** Lewat antrean pengumuman yang sudah ada (jarak 2 detik): suara dinyalakan atau dimatikan, nama diganti guru, dan galat nama. Di layar kelas: nama pemain diganti, pemain dikeluarkan, dan suara.
- **P-70. Satu ronde dengan papan ketik.** Satu ronde bisa dimainkan dari layar Kode sampai rekap hanya dengan papan ketik di laptop, termasuk membuka Menu dan mengubah pengaturan.

### O. Ukuran dan kinerja

- **P-71. Ukuran kode.** Dibanding `main` sebelum Build, kode layar pemain naik paling banyak 6 KB gzip untuk JS (dasar 126,85 KB) dan 1 KB untuk CSS (dasar 6,23 KB), dan kode konsol naik paling banyak 3 KB (dasar 136,27 KB). WAV tetap menjadi berkas berhash. Modul penyaring tidak ada di kode layar pemain maupun konsol.
- **P-72. Kinerja.** Ambang kinerja JS-08 P-69 tetap terpenuhi di HP 731 × 411 dengan 40 pemain tiruan, dengan Suara nyala dan label Besar.

## Beberapa pemain sekaligus

- Dua pemain mengetik nama yang hanya berbeda huruf besar dan kecil hampir bersamaan: Durable Object memproses pesan satu per satu, jadi yang pertama diterima dan yang kedua menerima `NAMA_DIPAKAI` beserta saran baru.
- Guru mengganti nama pemain yang sedang membuka dialog kejadian: dialog berjalan terus, dan nama berganti di semua layar.
- Guru mengganti nama satu pemain dari konsol dan dari layar kelas hampir bersamaan: kedua pesan diproses berurutan, sehingga pemain itu mendapat nama baru dua kali, dan kedua nama sebelumnya diblokir.
- Guru menekan "Ganti semua nama" saat beberapa siswa masih di layar identitas: mereka menerima `mode_nama` dan berganti ke tampilan daftar. Nama bebas yang terkirim sesudah mode berubah diproses sebagai mode daftar, jadi dijawab `NAMA_DIPAKAI` beserta saran.
- Siswa yang namanya diganti membuka tab baru dan mengetik nama lamanya lagi: ditolak `NAMA_DITOLAK` karena sidiknya diblokir.
- Ruang 100 pemain: `ganti_nama` mengirim satu `nama_baru` kecil ke setiap pemain, ditambah `lobi` dan `papan` ke layar kelas. "Ganti semua nama" untuk 100 pemain mengirim paling banyak 100 `nama_baru` ke setiap pemain dalam satu putaran pemrosesan.
- Pemain yang dikeluarkan lalu menyambung lagi tetap menerima `DIKELUARKAN`. Pemain yang namanya diganti lalu menyambung ulang menerima `pemain_baru` untuk dirinya dengan nama baru.

## Status antarmuka

| Bagian | Status | Tampilan |
|---|---|---|
| Tombol Menu dan suara (layar pemain) | Biasa, fokus, ditekan | Latar `cream` bergaris `ink` 4 px; fokus garis luar `sun` 4 px; ditekan bergeser 2 px |
| Tombol Menu dan suara | Tersembunyi | Selama dialog, peta besar, lapisan menyambung ulang, ajakan memutar HP, atau panel terbuka |
| Tombol suara (layar pemain) | Nyala, mati | `ikon_suara_nyala` atau `ikon_suara_mati`, `aria-pressed` benar atau salah |
| Panel Pengaturan, Privasi, Tentang | Terbuka | Lapisan `ink` 70%, panel bingkai piksel; dunia di belakangnya tetap berjalan |
| Panel Privasi di layar pendek | Isi lebih tinggi dari jendela | Kepala dan kaki tetap; isi digulir; fokus awal di judul |
| Isian nama (mode bebas) | Kosong | Penghitung "0/14", "Gabung" nonaktif |
| Isian nama | Bentuk tidak sah | Pita galat `mango` dengan tanda "!" dan kalimat bentuk; fokus di isian; tidak ada pesan terkirim |
| Isian nama | Ditolak atau dipakai | Pita galat dengan kalimat `NAMA_DITOLAK` atau `NAMA_DIPAKAI`; isi tetap |
| Isian nama | Mode berganti | Layar berganti ke tiga saran nama samaran tanpa pita galat |
| Pita nama diganti (HP) | Tampil | Pita atas tengah selama 3 detik dalam antrean pita JS-09 |
| Tombol suara (layar kelas) | Nyala, mati, tertahan | Ikon nyala atau mati; tertahan: tulisan "Klik untuk menyalakan suara" di kirinya |
| Nama di lobi layar kelas | Biasa, fokus, menu terbuka, terputus | Seperti JS-10; fokus cincin `ink` 3 px; menu di bawah nama; terputus pucat |
| Panel Pemain (layar kelas) | Kosong | "Belum ada pemain." |
| Tombol Ganti nama dan Ganti semua nama (konsol) | Sibuk | Nonaktif selama permintaan berjalan, seperti tombol kelola JS-10 |
| Kurangi gerak | Nyala | Efek Design System 11 untuk kurangi gerak, termasuk saat perangkat tidak memintanya |

## Teks yang tampil (final)

Semua teks layar pemain berada di `app/jejak-setara/teks.ts`, dan teks konsol serta layar kelas di `teks-konsol.ts` (Architecture 17). `{n}` dan `{nama}` diisi antarmuka.

**Layar pemain (`teks.ts`)**

| Tempat | Kunci | Teks |
|---|---|---|
| Tombol Menu | `menu.tombol` | Menu |
| Label tombol Menu | `menu.label` | Buka menu pengaturan |
| Label tombol suara | `suara.labelNyala` · `suara.labelMati` | Suara nyala. Tekan untuk mematikan. · Suara mati. Tekan untuk menyalakan. |
| Pengumuman suara | `suara.umumNyala` · `suara.umumMati` | Suara dinyalakan. · Suara dimatikan. |
| Judul panel Pengaturan | `pengaturan.judul` | Pengaturan |
| Kelompok | `pengaturan.suara` · `pengaturan.gerak` · `pengaturan.ketik` · `pengaturan.label` | Suara · Kurangi gerak · Teks muncul per huruf · Ukuran label nama |
| Keterangan | `pengaturan.gerakIkut` · `pengaturan.ketikKet` | Awalnya mengikuti pengaturan perangkatmu. · Ketuk teksnya untuk menampilkan semuanya. |
| Pilihan | `pengaturan.mati` · `nyala` · `biasa` · `besar` | Mati · Nyala · Biasa · Besar |
| Tombol panel | `pengaturan.privasi` · `tentang` · `tutup` | Privasi · Tentang · Tutup |
| Layar Kode | `privasi.singkat` | Jejak Setara tidak meminta nama lengkap, foto, atau lokasimu. |
| Tombol layar Kode | `privasi.tombol` | Privasi |
| Judul panel Privasi | `privasi.judul` | Privasi |
| Butir 1 | `privasi.disimpanJudul` · `privasi.disimpan` | Yang disimpan · Nama pemain, avatar, jawaban, dan skormu. Nomor absen juga, bila gurumu memintanya. |
| Butir 2 | `privasi.untukJudul` · `privasi.untuk` | Untuk apa · Rekap untukmu, hasil kelas untuk gurumu, dan statistik soal tanpa nama. |
| Butir 3 | `privasi.melihatJudul` · `privasi.melihat` | Siapa yang melihat · Gurumu dan admin Jejak Setara. Teman melihat nama pemain dan avatarmu, juga skormu bila kamu masuk 10 besar di layar kelas. |
| Butir 4 | `privasi.lamaJudul` · `privasi.lama` | Berapa lama · Paling lama 12 bulan, lalu dihapus otomatis. |
| Butir 5 | `privasi.tidakJudul` · `privasi.tidak` | Yang tidak disimpan · Foto, lokasi, obrolan, dan alamat IP. Nama lengkap juga tidak diminta, jadi jangan menuliskannya. |
| Butir 6 | `privasi.perangkatJudul` · `privasi.perangkat` | Di perangkat ini · Hanya tanda masuk dan pengaturan di tab ini. Keduanya hilang saat tab ditutup. |
| Layar Nomor absen | `absen.privasi` | Nomor absen dipakai gurumu untuk melihat hasilmu. |
| Panel Tentang | `tentang.judul` · `tentang.isi` | Tentang · Jejak Setara, bagian dari Ruang Setara. |
| Kredit | `tentang.kreditAset` | Aset visual digambar dengan kode oleh Claude (Anthropic) berdasarkan arahan dan persetujuan YAN. |
| Kredit | `tentang.kreditSuara` | Efek suara dibuat dengan kode oleh Claude (Anthropic) berdasarkan arahan dan persetujuan YAN. |
| Kredit | `tentang.kreditHuruf` | Huruf Press Start 2P dan Pixelify Sans, SIL Open Font License 1.1. |
| Layar identitas mode bebas | `namaBebas.label` · `namaBebas.hitung` | Nama pemain · {n}/14 |
| Pesan di bawah isian | `namaBebas.pesan` | Jangan memakai nama lengkap. Nama ini tampil di layar kelas. |
| Tombol | `namaBebas.samaran` | Pakai nama samaran |
| Galat bentuk (klien) | `namaBebas.galatBentuk` | Nama berisi 3–14 huruf, angka, atau spasi. |
| `NAMA_DITOLAK` | `galat.NAMA_DITOLAK` | Nama itu tidak bisa dipakai. Coba nama lain. |
| `NAMA_DIPAKAI` (tetap dari JS-03) | `galat.NAMA_DIPAKAI` | Nama itu baru saja dipakai pemain lain. Pilih nama lain. |
| Pita dan pengumuman | `namaDiganti` | Gurumu mengganti namamu menjadi {nama}. |
| Label kotak situasi | `ketik.label` | Situasi. Ketuk untuk menampilkan semuanya. |

**Konsol dan layar kelas (`teks-konsol.ts`)**

| Tempat | Kunci | Teks |
|---|---|---|
| Dialog Ruang baru, kelompok | `ruangBaru.namaJudul` | Nama pemain |
| Pilihan 1 | `ruangBaru.namaDaftar` · `ruangBaru.namaDaftarKet` | Daftar nama samaran · Siswa memilih satu dari tiga saran, misalnya Kancil Jingga. |
| Pilihan 2 | `ruangBaru.namaBebas` · `ruangBaru.namaBebasKet` | Nama buatan siswa · Siswa mengetik nama 3–14 karakter yang diperiksa penyaring kata, dan Anda bisa menggantinya kapan saja. Libatkan sekolah lebih dulu, karena siswa bisa mengetik nama panggilannya. |
| Halaman ruang, baris kepala | `detail.namaPemain` | Nama pemain (isinya teks pilihan 1 atau 2) |
| Tombol per pemain | `detail.gantiNama` · `detail.gantiNamaLabel` | Ganti nama · Ganti nama {nama} |
| Pemberitahuan | `detail.okGantiNama` | Nama pemain diganti menjadi {nama}. |
| Tombol di atas daftar | `detail.gantiSemua` | Ganti semua nama |
| Konfirmasi | `detail.gantiSemuaJudul` · `detail.gantiSemuaIsi` · `detail.gantiSemuaTombol` | Ganti semua nama buatan siswa? · Setiap pemain yang mengetik namanya sendiri mendapat nama dari daftar, dan pemain yang bergabung sesudah ini memilih dari daftar. · Ganti semua nama |
| Pemberitahuan | `detail.okGantiSemua` | {n} nama diganti. |
| Galat API `BUKAN_NAMA_BEBAS` | `galatApi.BUKAN_NAMA_BEBAS` | Ruang ini memakai daftar nama samaran. |
| Layar kelas, label tombol suara | `kelas.suaraNyala` · `kelas.suaraMati` | Suara nyala. Tekan untuk mematikan. · Suara mati. Tekan untuk menyalakan. |
| Layar kelas, suara tertahan | `kelas.suaraTertahan` | Klik untuk menyalakan suara |
| Layar kelas, pengumuman suara | `kelas.umumSuaraNyala` · `kelas.umumSuaraMati` | Suara dinyalakan. · Suara dimatikan. |
| Layar kelas, label nama | `kelas.kelola` | Kelola {nama} |
| Layar kelas, menu | `kelas.gantiNama` · `kelas.keluarkan` · `kelas.batal` | Ganti nama · Keluarkan · Batal |
| Layar kelas, konfirmasi | `kelas.keluarkanJudul` · `kelas.keluarkanIsi` | Keluarkan pemain ini? · Pemain ini tidak bisa bergabung lagi ke ruang ini. |
| Layar kelas, pita dan pengumuman | `kelas.okNama` · `kelas.okKeluar` | Nama pemain diganti. · Pemain dikeluarkan. |
| Layar kelas, panel | `kelas.pemain` · `kelas.pemainJudul` · `kelas.pemainKosong` · `kelas.tutup` | Pemain · Pemain ({n}) · Belum ada pemain. · Tutup |
| Layar kelas, cara bergabung mode bebas | `kelas.cara3Bebas` | Tulis nama pemain dan pilih avatar |
| Halaman masuk konsol, kredit | `masuk.kreditSuara` | Efek suara dibuat dengan kode oleh Claude (Anthropic) berdasarkan arahan dan persetujuan YAN. |
| Tabel peringkat hasil ruang (diubah) | `hasil.kolomNama` | Nama pemain |
| CSV peserta dan jawaban (diubah) | `csv.nama` | Nama pemain |

Nama kunci yang tepat boleh menyesuaikan susunan `teks.ts` dan `teks-konsol.ts` yang ada, asal teksnya sama persis; `kerangka.test.ts` membandingkan teksnya dengan tabel ini.

## Data, protokol, API, dan migrasi

**Protokol** (`PROTOKOL_VERSI` 3, P-58):

```ts
// inti/versi.ts
export const PROTOKOL_VERSI = 3;

// inti/protokol.ts
export const modeNama = () => z.enum(["daftar", "bebas"]);
// pengaturan(): ditambah modeNama: modeNama()
// KODE_GALAT: ditambah "NAMA_DITOLAK"
const sNamaBaru = /* @__PURE__ */ pesan("nama_baru", () => ({ id: id(), nama: nama() }));
const sModeNama = /* @__PURE__ */ pesan("mode_nama", () => ({ modeNama: modeNama() }));

// inti/protokol-kelas.ts
const kGantiNama = /* @__PURE__ */ pesan("ganti_nama", () => ({ pemainId: id() }));
const kGantiSemuaNama = /* @__PURE__ */ pesan("ganti_semua_nama", () => ({}));
// info_kelas: ditambah modeNama: modeNama()
```

**Tipe** (`inti/tipe.ts`): `export type ModeNama = "daftar" | "bebas";` dan `PengaturanRuang.modeNama: ModeNama`.

**API**

| Metode dan jalur | Perubahan | Jawaban baru |
|---|---|---|
| `POST /api/ruang` | `modeNama` opsional di `skemaRuangBaru` | 400 `ISI_SALAH` untuk nilai lain |
| `GET /api/ruang/{id}` | `modeNama` di ringkasan (mode yang berlaku dari Durable Object untuk ruang yang belum ditutup, dari `pengaturan_json` untuk ruang yang sudah ditutup) | — |
| `POST /api/ruang/{id}/kelola` | Aksi `ganti_nama` (`pemainId`) dan `ganti_semua_nama` | 200 `{ ok, nama }` · 200 `{ ok, jumlah }` · 404 `PEMAIN_TIDAK_ADA` · 409 `BUKAN_NAMA_BEBAS` |
| `GET /api/publik/ruang/{KODE}` | `modeNama` | `{ ada, modeNomorAbsen, modeNama }` |
| `POST /api/uji/pembersihan` | Baru, hanya `lokal` (P-65) | 200 `{ dihapus }`; 404 di lingkungan lain |

**Penyimpanan Durable Object:** meta baru `modeNama` dan `namaDiblokir` (P-41, P-50); `pemain.saran_json` berbentuk `{ saran, tolak }` (P-44). Tidak ada tabel baru, dan `CREATE TABLE` yang ada tidak berubah.

**D1:** tidak ada migrasi. `ruang.pengaturan_json` mendapat `modeNama`; `peserta.nama_samaran` berisi nama pemain, termasuk nama buatan siswa; `log_audit` mendapat aksi `ruang.hapus_otomatis` dengan `pengguna_id` kosong (kolomnya boleh kosong sejak `0001_awal.sql`).

**Izin:** aksi kelola baru memakai izin `ruang.kelola` yang sudah ada. Pemicu harian tidak memerlukan izin, dan kait uji hanya ada di `lokal`.

## Aset

Tidak ada aset baru. Dipakai: `ikon_suara_nyala` dan `ikon_suara_mati` (Disetujui) lewat `manifest.ts` di layar pemain dan diimpor langsung dari PNG di layar kelas; efek suara S-01 sampai S-07, `sfx_klik`, dan `sfx_teks` lewat `SUARA` di layar pemain; serta `sfx_hitung.wav`, `sfx_peringatan.wav`, dan `sfx_akhir.wav` diimpor langsung di layar kelas. Musik latar M-01 tidak dipakai (JS-21). Tidak ada token warna atau huruf baru.

## Keamanan dan privasi

- Penyaring hanya berjalan di server, dan daftar katanya tidak dikirim ke HP. Jawaban penolakan selalu satu kalimat umum, tanpa menyebut kata yang tertangkap.
- Sesudah lima penolakan, pemain hanya bisa memakai nama samaran, sehingga siswa tidak bisa terus mencoba samaran baru (P-44).
- Nama yang diganti guru hanya disimpan sebagai sidik untuk mencegah dipakai lagi; tulisan nama lama hilang dari penyimpanan ruang dan dari D1 pada kiriman berikutnya (P-46, P-50).
- Layar kelas tidak pernah menulis nama lama lagi, dan konfirmasi serta pemberitahuannya tanpa nama (P-54).
- Nama pemain, termasuk nama buatan siswa, tidak pernah masuk log Worker, log audit, atau pesan galat. Log audit penghapusan otomatis hanya memuat kode, label kelas, waktu, dan jumlah baris.
- Mode nama buatan siswa bisa memuat nama panggilan asli. Karena itu keterangan di dialog Ruang baru meminta guru melibatkan sekolah, dan pemberitahuan privasi meminta siswa tidak menulis nama lengkap.
- Pengaturan di `sessionStorage` tidak memuat data pribadi dan hilang saat tab ditutup.
- Data ruang yang berumur lebih dari 365 hari dihapus otomatis (P-62). *Time Travel* D1 (7 hari di paket gratis, 30 hari di paket berbayar) tetap bisa memulihkan penghapusan yang keliru.
- Daftar kata penyaring tersimpan di repositori publik. Risiko ini diterima, seperti bank awal (PRD 18). Berkas itu ikut diperiksa dengan `build:pages`, karena Tailwind galeri membaca seluruh repositori.
- Batas yang diketahui: penyaring tidak menangkap kata yang huruf vokalnya dibuang, kata pendek yang disambung kata lain, dan ejekan yang memakai kata biasa. Hal itu ditangani guru lewat Ganti nama dan Ganti semua nama.

## Di luar cakupan

- Musik latar layar kelas (JS-21).
- Daftar "Kejadian terdekat" dan bantuan gerak untuk pembaca layar (JFR-13, JS-18).
- Pengaturan umum, masa simpan yang bisa diatur, daftar nama samaran yang bisa disunting admin, dan halaman log audit (JFR-39, JFR-40, JS-19).
- Nama rakitan (usulan 2b tidak dipilih), siswa mengganti namanya sendiri sesudah bergabung, penahanan nama sebelum tampil, dan laporan nama dari siswa.
- Statistik per siswa (JS-20).
- Peringatan paket dengan lebih dari 6 kejadian di satu zona (Permintaan A-14, JS-16).

## Perubahan dokumen

Diserahkan bersama spesifikasi ini (ZIP Gerbang 2), sesuai pilihan Gerbang 1:

| Dokumen | Perubahan |
|---|---|
| `AGENTS.md` (Jejak Setara) | Versi 0.8; bagian 5 baris JS-14; bagian 7 butir 4; daftar periksa bagian 9 |
| `PRD.md` | Bagian 3 (non-tujuan), 4 (pengguna), JFR-01, JFR-04, JFR-06, 8.6, 13 (tabel dan butir), 20 (KT-14), dan 21 |
| `Design_System.md` | 3.3, 3.6, 3.7, 10, 11, 12, dan 13 |
| `Architecture.md` | 5.1, 5.2, 5.3, 6.2, 6.3, 6.4, 6.6, 6.7, 7, 9, 10.2, 10.8, 10.9, 12.1, dan 12.3 |
| `PLAN.md` | Status, keputusan Gerbang 1, ringkasan Specify, dan baris backlog JS-14 |

## DRAF untuk ditinjau pemilik proyek

- **D-1. Daftar kata penyaring (Lampiran A).** (a, saran) Daftar di Lampiran A. (b) Hapus atau tambah kata tertentu; tulis saja kata dan kelompoknya.
- **D-2. Kata identitas di penyaring** (homo, lesbi, bencong, banci, dan gay). (a, saran) Ditolak sebagai nama, karena di kelas kata-kata ini biasanya dipakai untuk mengejek. (b) Tidak ditolak.
- **D-3. Karakter nama buatan siswa.** (a, saran) Hanya huruf A–Z, angka, dan spasi; nama bertanda petik seperti Nur'aini ditulis tanpa tanda petik. (b) Tanda petik (') dan tanda hubung (-) juga boleh di tengah nama; penyaring tetap memperlakukannya sebagai pemisah kata.
- **D-4. Batas penolakan.** (a, saran) Sesudah 5 kali `NAMA_DITOLAK`, pemain hanya bisa memilih nama samaran. (b) Sesudah 3 kali. (c) Tanpa batas.
- **D-5. Ganti semua nama mengubah mode ruang.** (a, saran) Ya: sesudah itu pemain yang bergabung memilih dari daftar nama samaran. (b) Tidak: hanya nama yang ada yang diganti.
- **D-6. Nama yang diganti guru diblokir di ruang itu** (disimpan sebagai sidik, bukan tulisan). (a, saran) Ya. (b) Tidak.
- **D-7. Cakupan teks muncul per huruf.** (a, saran) Hanya teks situasi. (b) Juga umpan balik Langkah 1 dan "Yang terjadi" di kartu dampak.
- **D-8. Arti 12 bulan.** (a, saran) 365 hari sejak ruang dibuat, paling banyak 50 ruang per malam, dengan log audit `ruang.hapus_otomatis`. (b) 12 bulan kalender.
- **D-9. Teks yang tampil.** Saran: tabel "Teks yang tampil (final)". Ganti kata mana pun bila kurang pas.

## Kriteria penerimaan

- [ ] AC-1 **Pengaturan.** P-1 sampai P-3: bawaan; tersimpan di `jejak:pengaturan`; bertahan saat dimuat ulang dan saat menyambung ulang; tab baru mulai dari bawaan; isian rusak diganti bawaannya; tanpa `sessionStorage` tetap berjalan.
- [ ] AC-2 **Tombol Menu dan suara.** P-4 sampai P-7: letak, ukuran 48 px, jarak 8 px, dan tidak bertumpuk dengan bilah atas, peta mini, pita, tombol skill, maupun Periksa di dunia 610 × 343, 640 × 360, 731 × 411, 960 × 540, dan 1280 × 720; tanda `Esc` dan `M` hanya di laptop; tersembunyi di keadaan P-5; di baris kaki layar identitas dan di rekap; ketukan pada tombol tidak memulai joystick; panah Kompas tidak menutupi kelompok tombol.
- [ ] AC-3 **Panel Pengaturan.** P-8 sampai P-10: empat kelompok; perubahan langsung berlaku; `Esc` dan "Tutup"; fokus awal dan fokus kembali; ronde tetap berjalan, avatar diam, dan skill, Periksa, `E`, `1`–`3`, dialog, serta peta mini tidak bekerja selama panel terbuka; tanpa gulir di 640 × 360.
- [ ] AC-4 **Privasi dan Tentang.** P-11, P-12, P-16, dan P-19: teks; fokus awal di judul; isi digulir dengan kepala dan kaki tetap di 731 × 411 dan 640 × 360; "Tutup" kembali ke Pengaturan bila dibuka dari sana.
- [ ] AC-5 **Pemberitahuan privasi.** P-15, P-17, dan P-18: kalimat dan tombol di layar Kode, kalimat di layar Nomor absen dan di layar identitas mode bebas; isian kode tetap sesudah panel ditutup.
- [ ] AC-6 **Suara di layar pemain.** P-14 dan P-20 sampai P-23: bawaan mati tanpa satu pun permintaan WAV selama satu ronde; menyalakan suara mengunduh sembilan berkas (tanpa `sfx_akhir`) dan membuat konteks pada ketukan; setiap pemicu di tabel P-22 memutar bunyinya (uji dengan konteks tiruan); kiriman ulang sesudah menyambung tidak berbunyi; batas sekali per detik dan per 300 ms; `M` dan tombol suara; tanpa Web Audio tidak ada galat.
- [ ] AC-7 **Suara di layar kelas.** P-29 sampai P-31: bawaan nyala 60%; tombol, `M`, dan `jejak:suara-kelas`; konteks dan unduhan pada ketukan pertama; tulisan "Klik untuk menyalakan suara" saat tertahan; `hitung`, `peringatan`, dan `akhir` hanya pada perubahan yang diamati langsung; dimuat ulang di `selesai` tanpa jingle.
- [ ] AC-8 **Teks per huruf.** P-24 sampai P-26: bawaan mati; 40 huruf per detik; lewati dengan ketukan, `Enter`, `Spasi`, dan "Lihat pilihan"; pilihan bisa dikunci selama teks berjalan; teks lengkap untuk pembaca layar sejak awal; bunyi teks hanya bila suara nyala; tidak berjalan lagi saat dialog dibuka ulang; tidak dipakai di pratinjau konsol.
- [ ] AC-9 **Label nama.** P-27: 13 px dan 17 px CSS dikali rasio piksel; paling banyak 8 label.
- [ ] AC-10 **Kurangi gerak.** P-28: atribut `data-kurangi-gerak`; mengikuti perangkat sampai diubah; efek Design System 11 hilang saat nyala dan kembali saat mati, walaupun perangkat meminta kurangi gerak; ketiga blok CSS memakai pemilih atribut; layar kelas tidak terpengaruh.
- [ ] AC-11 **Mode nama di konsol dan API.** P-32 sampai P-34: kelompok "Nama pemain" di dialog Ruang baru dengan bawaan daftar; `modeNama` tersimpan; nilai salah 400; baris "Nama pemain" di halaman ruang; `GET /api/publik/ruang/{KODE}` dan `selamat_datang` memuat `modeNama`; ruang lama dibaca sebagai daftar.
- [ ] AC-12 **Layar identitas mode bebas.** P-36 sampai P-39 dan P-45: isian, penghitung, pesan, dan "Pakai nama samaran" bergiliran lalu `minta_nama`; bentuk tidak sah tidak mengirim pesan; galat tampil dan diumumkan dengan isi tetap; `mode_nama` mengganti tampilan; tinggi panel tidak melebihi mode daftar di 731 × 411, 640 × 360, dan 1280 × 720.
- [ ] AC-13 **`pilih_identitas` di server.** P-41 sampai P-44: saran diterima di kedua mode; bentuk, blokir, dan penyaring menghasilkan `NAMA_DITOLAK`; nama kembar tanpa membedakan huruf besar dan kecil menghasilkan `NAMA_DIPAKAI`; setiap penolakan diikuti saran baru; penolakan kelima mengirim `mode_nama` dan sesudah itu hanya saran yang diterima; hitungan bertahan saat ruang dipulihkan; nama tersimpan dalam bentuk rapi.
- [ ] AC-14 **Penyaring.** P-43 dan Lampiran A: setiap kata ditolak dalam bentuk dasar, huruf besar, dengan angka pengganti, dengan huruf vokal diulang, dipisah spasi, dan dipisah titik; setiap kata "potongan" juga ditolak saat disambung nama tanpa spasi, dengan akhiran "mu", dan dengan awalan "si"; ke-260 nama samaran dan daftar nama biasa di uji (sedikitnya 80 nama, termasuk nama Bali, Basuki, Pantai, Santai, Cukup, Asia, Celengan, Gelora, Taiwan, Sunda Lima, dan Wayan Jingga) lolos; paling lama 0,1 ms per nama; kode layar pemain dan konsol tidak memuat modul penyaring.
- [ ] AC-15 **Ganti nama.** P-46, P-47, dan P-50: nama pengganti dari daftar, belum dipakai, dan tidak diblokir; cadangan "Pemain {urutan}"; sidik nama lama diblokir dan nama lama tidak ada lagi di SQLite ruang maupun di D1 sesudah kiriman; `nama_baru` ke semua pemain; `lobi` dan `papan` ke layar kelas; pita dan pengumuman di HP pemain itu; berlaku di `lobi`, `main`, `jeda`, `selesai`, dan `pembahasan`; peringkat akhir di D1 tetap.
- [ ] AC-16 **Ganti semua nama.** P-48: hanya di ruang mode bebas; semua nama ketikan diganti dan nama daftar tidak; mode ruang menjadi daftar; `mode_nama` ke pemain yang belum punya nama; `info_kelas` baru; diabaikan di ruang mode daftar.
- [ ] AC-17 **Kelola dari konsol.** P-51 dan P-52: tombol Ganti nama dan pemberitahuannya; Ganti semua nama dengan konfirmasi hanya di ruang mode bebas yang belum ditutup; 404 dan 409 sesuai P-51; ruang milik guru lain 404.
- [ ] AC-18 **Kelola dari layar kelas.** P-53 sampai P-57: nama di lobi sebagai tombol dengan menu; ganti nama tanpa konfirmasi; keluarkan dengan konfirmasi tanpa nama; pita dan pengumuman tanpa nama; tombol "Pemain" dan `P` di semua tampilan sebelum ditutup; panel tanpa skor dan peringkat; pintasan lain diabaikan selama menu, panel, atau konfirmasi terbuka; langkah ketiga cara bergabung menurut mode; semuanya bisa dijalankan dengan papan ketik.
- [ ] AC-19 **Protokol.** P-58 sampai P-60: `PROTOKOL_VERSI` 3; semua pesan baru dan yang berubah lolos skema; `halo` versi 2 menerima `VERSI_BERBEDA`; uji yang memakai `PROTOKOL_VERSI` tetap hijau.
- [ ] AC-20 **CSV dan teks konsol.** P-61: "Nama pemain" di kedua CSV dan tabel peringkat; nama baru tampil di CSV sesudah diganti.
- [ ] AC-21 **Penghapusan otomatis.** P-62 sampai P-65: ruang ditutup berumur 366 hari terhapus bersama peserta dan jawabannya, dengan satu baris log audit; ruang berumur 364 hari dan ruang yang belum ditutup tetap; paling banyak 50 ruang per jalan; jalan berikutnya meneruskan; kait uji hanya di `lokal`.
- [ ] AC-22 **Papan ketik dan pembaca layar.** P-14 dan P-67 sampai P-70: `Esc` dan `M`; peran dan nama panel serta dialog diperiksa dengan `toMatchAriaSnapshot`; pengumuman P-69; satu ronde dari layar Kode sampai rekap hanya dengan papan ketik, termasuk Menu.
- [ ] AC-23 **Kredit.** P-12 dan P-13: tiga kalimat kredit di Tentang; kalimat kredit suara di halaman masuk konsol.
- [ ] AC-24 **Ukuran dan kinerja.** P-71 dan P-72.
- [ ] AC-25 **Beban.** `sim:beban` 1 ruang × 50 bot dengan `--mode-nama bebas`: semua bot bergabung dengan nama buatan; layar kelas mengganti 5 nama di lobi dan 5 nama saat bermain; 0 pelanggaran dan 0 sambungan putus tak terduga; setiap bot menerima `nama_baru` untuk kesepuluh nama itu; lalu lintas turun per pemain per 15 menit di bawah 3 MB.
- [ ] AC-26 **Tangkapan layar.** Bagian "Rencana uji".
- [ ] AC-27 **Tanpa regresi.** Semua perintah AGENTS 4.4 hijau; `build:pages` 178 berkas identik byte; dokumen bagian "Perubahan dokumen" diperbarui.

## Rencana uji

### Uji unit (`test:jejak`)

- `__tests__/pengaturan/pengaturan.test.ts`: bawaan, penyimpanan, isian rusak, tanpa `sessionStorage`, dan nilai efektif kurangi gerak (AC-1, AC-10).
- `__tests__/pengaturan/suara.test.ts`: pemutar dengan konteks tiruan (pola `sound.test.ts` Sehari Setara), tanpa unduhan selama mati, sembilan berkas saat dinyalakan, batas per bunyi, dan pemicu per pesan dari tabel P-22 (AC-6).
- `__tests__/pengaturan/ketik.test.ts`: `panjangKetik`, lewati, dan bunyi teks setiap 2 huruf (AC-8).
- `__tests__/pengaturan/nama.test.ts`: `rapikanNama`, `bentukNamaSah`, `kunciNama`, dan `sidikNama`, termasuk sidik yang tetap untuk contoh yang diketahui (AC-13).
- `__tests__/pengaturan/penyaring.test.ts`: daftar kata dalam semua bentuk samaran AC-14, nama biasa yang harus lolos, kata izin, dan waktu per nama (AC-14).
- `__tests__/pengaturan/inti-ruang-nama.test.ts`: `pilih_identitas` di kedua mode, batas penolakan, `ganti_nama` di setiap status, `ganti_semua_nama`, daftar blokir, baris peserta, dan pemulihan ruang (AC-13, AC-15, AC-16).
- `__tests__/pengaturan/pembersihan.test.ts`: pemilihan ruang kedaluwarsa dengan jam tiruan, batas 50, dan susunan pernyataan hapus (AC-21).
- Diubah: uji protokol (versi 3 dan skema baru), `kerangka.test.ts` (teks, tabel izin, dan aturan impor: layar pemain dan konsol tidak memuat `penyaring-nama.ts`), dan uji layar kelas (`tampilan-kelas.test.ts`: pemicu suara dan menu).

### Uji server (`test:jejak:server`, baru `server/jejak-setara/uji/nama.uji-server.ts`)

Ruang mode bebas di Worker lokal: nama buatan diterima, `NAMA_DITOLAK` untuk contoh kata kasar, `NAMA_DIPAKAI` untuk nama kembar, ganti nama dan ganti semua nama lewat API kelola, CSV peserta dan jawaban berisi "Nama pemain" dan nama baru, `GET /api/publik/ruang/{KODE}` dengan `modeNama`, dan penghapusan ruang lama lewat `/api/uji/pembersihan` dengan baris log audit di D1 lokal (AC-11, AC-13, AC-15 sampai AC-17, AC-20, AC-21).

### Uji ujung ke ujung (`test:e2e:jejak`)

- `e2e/jejak-setara/pengaturan.uji.ts`: tombol dan panel di HP 731 × 411, HP 640 × 360, dan laptop 1280 × 720; pengaturan bertahan sesudah dimuat ulang; suara mati tanpa permintaan WAV, lalu nyala dengan sembilan permintaan; panel Privasi dari layar Kode dan dari Menu; Tentang; label Besar; atribut kurangi gerak; teks per huruf; serta satu ronde hanya dengan papan ketik dan pemeriksaan `toMatchAriaSnapshot` untuk dialog kejadian dan panel Pengaturan (AC-2 sampai AC-6, AC-8 sampai AC-10, AC-22, AC-23).
- `e2e/jejak-setara/nama.uji.ts`: guru membuat ruang mode bebas; dua pemain bergabung dengan nama buatan; galat bentuk, `NAMA_DITOLAK`, dan pergantian ke tampilan daftar sesudah lima penolakan; guru mengganti nama dan mengeluarkan pemain dari menu lobi layar kelas dan dari panel Pemain (`P`); pita di HP pemain; Ganti nama dan Ganti semua nama di konsol; tombol suara dan `M` di layar kelas (AC-7, AC-11, AC-12, AC-17, AC-18).
- Diubah: uji ujung ke ujung yang memilih nama memakai `PROTOKOL_VERSI` dan alur JS-03 yang tidak berubah.
- Tangkapan layar di `tests/JS-14/`: layar Kode dengan privasi, panel Privasi, panel Pengaturan, dan tombol Menu di HP 731 × 411, HP 640 × 360, dan laptop 1280 × 720; layar identitas mode bebas di HP dan laptop; pita nama diganti; dan layar kelas lobi dengan menu, panel Pemain, serta tombol suara di 1024 × 768 dan 1920 × 1080.

### Beban dan ukuran

- `sim:beban` (wajib, karena protokol dan inti ruang berubah): AC-25.
- Ukuran: gzip tingkat 9 atas JS dan CSS yang dimuat halaman, dibanding `main` sebelum Build (AC-24). Kinerja HP memakai uji kinerja JS-08 dengan Suara nyala dan label Besar.

### Manual (AGENTS 9) dan lingkungan uji

Suara mati secara bawaan di HP dan layar kelas berbunyi; kurangi gerak; satu ronde hanya dengan papan ketik di laptop; Narator Windows (`Ctrl` + `Win` + `Enter`) membacakan dialog kejadian dan panel Pengaturan; bunyi di Safari iPhone bila tersedia; serta tidak ada nama lengkap siswa di layar, CSV, maupun log. Aturan suara peramban (konteks tertahan sampai ada ketukan) hanya bisa dibuktikan di perangkat sungguhan, karena Chromium tanpa tampilan di mesin agen tidak menahannya.

## Lampiran A — Daftar kata penyaring (DRAF D-1)

Kata "potongan" ditolak bila berdiri sendiri maupun bila menjadi bagian sebuah kata (misalnya "budianjing"). Kata "utuh" hanya ditolak bila berdiri sendiri, karena sering menjadi bagian kata biasa (misalnya "tai" di "pantai", "asu" di "Basuki", dan "sia" di "Asia"). Semua kata dibandingkan sesudah diubah menjadi kerangka (P-43).

| Kelompok | Potongan | Utuh |
|---|---|---|
| Makian umum dan hewan | anjing, bangsat, bajingan, brengsek, keparat, bedebah, jahanam, kampret, cecunguk, sompret, monyet, kunyuk | babi, bangke, setan, iblis, laknat, sialan, mampus, bacot |
| Merendahkan kecerdasan | goblok, goblog, tolol, idiot, bodoh | bego, dungu, dongo, oon, bloon, pekok, bodho |
| Seksual dan cabul | kontol, memek, ngentot, ngewe, jembut, toket, pepek, colmek, bokep, perkosa, pelacur, lonte, sundal, jablay, bispak | entot, tetek, peler, titit, coli, sange, porno, mesum, cabul, perek, pecun, germo, seks, sex, turuk |
| Kotoran | — | tai, taik, tahi, taek, berak, pantat, kentut |
| Merendahkan suku, agama, ras, dan warna kulit | — | kafir, cina, negro, keling, jawir, item, nigga, nigger |
| Merendahkan disabilitas dan tubuh | autis, lumpuh, pincang, gendut, gembrot, jelek, botak, pesek, cebol, dekil, ompong | cacat, budek, gila, sinting, gagap, bau |
| Identitas yang sering dipakai mengejek (D-2) | — | homo, lesbi, bencong, banci, gay |
| Kekerasan, narkoba, dan tokoh kejam | teroris, narkoba, hitler | bunuh, nazi, sabu, ganja, miras, mabok |
| Bahasa Jawa | jancuk, jancok, dancuk, ndasmu, matamu | asu, cuk, raimu, celeng, edan, gendeng, gendheng, modar |
| Bahasa Sunda | belegug | anjir, anjay, anjrit, njir, kehed, gelo, sia |
| Bahasa Bali | — | cicing, bojog, buduh |
| Bahasa Melayu dan Minang | pukimak | kimak, puki, pantek |
| Bahasa Inggris | fuck, bitch, asshole, bastard | shit, dick, pussy, porn, slut, whore |

**Daftar izin** (kata biasa yang memuat kata "potongan"): memekik. Daftar ini ditambah bila uji atau uji coba kelas menemukan nama biasa yang tertolak.

"Cok" sengaja tidak dimasukkan walaupun dipakai sebagai makian di Jawa Timur, karena "Cok" juga sapaan nama bangsawan Bali (Cokorda), misalnya "Cok Agung". Kata yang dibandingkan utuh juga tidak menolak nama seperti Ganjar, Dicky, Bodhi, Gilang, dan Kelingking.
