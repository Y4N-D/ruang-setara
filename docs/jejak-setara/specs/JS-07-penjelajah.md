# JS-07 — Penjelajah

| | |
|---|---|
| Status | Ditulis 8 November 2026 di tahap Specify, sesudah balasan `Setuju: JS-07` (semua saran a, usulan 1 sampai 11). Menunggu `Spesifikasi disetujui: JS-07` beserta pilihan DRAF D-1 sampai D-5 |
| Rencana | `PLAN.md`, bagian "JS-07 — Penjelajah" |
| Sesi | Sesi A (mesin) |
| Bergantung pada | JS-03 (Selesai), JS-06 (Selesai), dan `app/jejak-setara/assets/manifest.ts` dari Sesi C (usulan 11a) sebelum Build |

## Ringkasan

JS-07 mengganti layar lobi dan layar ronde yang berupa teks dengan **dunia**: peta kampung 160 × 100 ubin hasil JS-06, digambar tampak atas dengan skala bulat, kamera yang mengikuti pemain, gerak dengan keyboard atau joystick sentuh, pemain lain dengan nama samarannya, peta mini dan peta besar, langit sehari, serta layar yang tetap menyala. Pemain bisa berjalan di halaman lobi selama gerbang tertutup. Server berganti dari peta uji ke peta kampung. Alur kerja baru "Jejak: kendali ruang coba" membuat ronde bisa dicoba di lingkungan uji sebelum JS-10.

Kejadian, tombol Periksa, skor, skill, kotak, suara, dan pengaturan pemain **tidak** termasuk (bagian "Di luar cakupan").

## Kaitan PRD

| Kebutuhan | Dipenuhi oleh |
|---|---|
| JFR-05 (bagian pemain): berjalan di halaman lobi | P-25 sampai P-29, P-47 sampai P-49 |
| JFR-09: peta 160 × 100 ubin, keyboard WASD atau panah, joystick sentuh | P-1 sampai P-18 |
| JFR-10: pemain lain dengan nama samaran, saling tembus | P-19 sampai P-24 |
| JFR-11: peta mini pribadi (diri, zona, halte; kejadian di JS-08) | P-35 sampai P-39 |
| JFR-12: langit sehari, tukar lembar per masa, busur hari | P-9 sampai P-11, P-30 sampai P-34 |
| JFR-14: layar tetap menyala | P-44 |
| PRD 8.2: kecepatan 72 px/detik, saling tembus, server memeriksa | P-12 sampai P-18, P-45 sampai P-52 |
| PRD 12: ≥ 30 fps di HP kelas bawah, ≤ 3 MB per pemain per ronde 15 menit | AC-19, AC-20 |

## Berkas yang dibuat dan diubah

| Berkas | Baru/Diubah | Isi |
|---|---|---|
| `app/jejak-setara/pemain/dunia/skala.ts` | Baru | Skala bulat dan ukuran kanvas (P-1, P-2) |
| `app/jejak-setara/pemain/dunia/kamera.ts` | Baru | Zona mati dan jepit (P-3) |
| `app/jejak-setara/pemain/dunia/potongan.ts` | Baru | Potongan peta dua lapis, persiapan, pelepasan, ganti masa (P-7 sampai P-11) |
| `app/jejak-setara/pemain/dunia/penggambar.ts` | Baru | Urutan gambar satu bingkai, gerbang, tokoh, siluet (P-4 sampai P-6) |
| `app/jejak-setara/pemain/dunia/aset.ts` | Baru | Memuat gambar dari manifest, salinan warna tas, cermin arah kiri, garis siluet |
| `app/jejak-setara/pemain/dunia/masukan.ts` | Baru | Keyboard dan joystick menjadi arah gerak (P-12 sampai P-14) |
| `app/jejak-setara/pemain/dunia/gerakDiri.ts` | Baru | Langkah 60 Hz, pengiriman `gerak`, `koreksi` (P-15 sampai P-18) |
| `app/jejak-setara/pemain/dunia/pemainLain.ts` | Baru | Penyangga `dunia`, tunda adaptif, interpolasi, sembunyi (P-19 sampai P-24) |
| `app/jejak-setara/pemain/dunia/langit.ts` | Baru | Kemajuan, masa, jam cerita, sisa waktu dari `status_ruang` (P-30) |
| `app/jejak-setara/pemain/dunia/layarMenyala.ts` | Baru | Screen Wake Lock (P-44) |
| `app/jejak-setara/pemain/LayarDunia.tsx` | Baru | Kanvas dunia, kanvas label, HUD, lapisan |
| `app/jejak-setara/pemain/BilahAtas.tsx`, `PetaMini.tsx`, `PetaBesar.tsx`, `Joystick.tsx`, `AjakanPutar.tsx`, `PanelLobi.tsx` | Baru | Komponen HUD (P-26, P-31 sampai P-43) |
| `app/jejak-setara/pemain/App.tsx` | Diubah | Layar `lobi` dan `ronde` memakai `LayarDunia`; pemeriksaan versi peta (P-50) |
| `app/jejak-setara/pemain/Lobi.tsx`, `LayarRonde.tsx`, `LayarMenyambung.tsx` | Diubah | Isi lobi pindah ke `PanelLobi`; hitung mundur, jeda, dan menyambung menjadi lapisan di atas dunia; layar selesai dan ditutup tetap |
| `app/jejak-setara/pemain/jaringan.ts` | Diubah | `kirimGerak` tanpa antre saat `bufferedAmount` > 0 (P-16), dan penerusan `dunia` serta `koreksi` |
| `app/jejak-setara/pemain/avatar.ts` | Diubah | Ikon avatar dari manifest |
| `app/jejak-setara/teks.ts`, `app/jejak-setara/styles/jejak.css` | Diubah | Teks final dan gaya HUD |
| `app/jejak-setara/inti/gerak.ts` | Diubah | Gerak sah di `lobi`, `hitung_mundur`, dan `main` (P-45) |
| `app/jejak-setara/inti/peta.ts` | Diubah | `tutupGerbang` dan `versiPeta` (P-46, P-50) |
| `server/jejak-setara/src/ruang/peta-kampung.ts` | Baru | Peta kampung di lingkup modul Worker (P-46) |
| `server/jejak-setara/src/ruang/inti-ruang.ts` | Diubah | Gerak di lobi, kiriman `dunia` di lobi, kerangka penuh, posisi awal (P-47 sampai P-49, P-51) |
| `server/jejak-setara/src/ruang/RuangJejak.ts` | Diubah | Memakai peta kampung; `/kelas` menjawab status ruang (P-54) |
| `server/jejak-setara/src/ruang/peta-uji.ts` | Diubah | Hanya dipakai uji |
| `server/jejak-setara/src/api/ruang.ts` | Diubah | Kait `kelas` hidup di lingkungan uji dengan kunci sekali pakai (P-53) |
| `.github/workflows/jejak-kendali-coba.yml` | Baru | Alur kerja "Jejak: kendali ruang coba" (P-55, P-56) |
| `.github/workflows/jejak-ruang-coba.yml` | Diubah | Masukan baru "Durasi ronde" (P-57) |
| `app/jejak-setara/__tests__/dunia/*.test.ts`, `__tests__/ruang/`, `__tests__/inti/gerak.test.ts`, `__tests__/inti/peta.test.ts` | Baru dan diubah | Uji unit (Rencana uji) |
| `server/jejak-setara/uji/*.test.ts` | Diubah | Uji server |
| `e2e/jejak-setara/dunia.uji.ts` | Baru | Uji ujung ke ujung multi-konteks |
| `scripts/jejak-setara/simulasi-beban.mjs` | Diubah | Bot berjalan di halaman lobi, lalu menjelajah sesudah mulai |
| `docs/jejak-setara/Architecture.md` (6.5, 7, 8.2, 9, 11.2), `Design_System.md` (3.2) | Diubah | Sesuai keputusan Gerbang 1 (ikut ZIP Gerbang 2 ini) |

Tidak disentuh: kode dan dokumen Sehari Setara, galeri, `deploy-pages.yml`, `package.json`, lockfile, berkas Sesi B, berkas Sesi C (termasuk `manifest.ts`, peta, dan aset), serta migrasi D1.

## Perilaku

Istilah: **piksel logis** adalah piksel dunia (ubin 16 × 16); **px** tanpa keterangan adalah piksel CSS. Posisi pemain adalah titik kaki, seperti di JS-02.

### Dunia dan skala

- **P-1. Skala bulat.** Diberikan luas tampilan halaman `W × H` px dan rasio piksel perangkat `r`, maka skala `k` adalah bilangan bulat terbesar yang memenuhi `316k ≤ W·r` dan `176k ≤ H·r`, paling kecil 1. Kanvas dunia berukuran 320k × 180k piksel perangkat, ditampilkan `320k/r × 180k/r` px di tengah halaman. Bila kanvas lebih besar dari tampilan, kelebihannya terpotong sama rata di kedua sisi, paling banyak 2 piksel logis per sisi (usulan 3a). Sisa ruang berwarna `ink`. Skala dihitung ulang saat ukuran jendela atau orientasi berubah. Contoh wajib di uji: 731 × 411 px dengan r 2,625 → ×6; 1280 × 720, r 1 → ×4; 1024 × 768 → ×3; 1920 × 1080 → ×6; 1366 × 657 → ×3.
- **P-2. Kanvas logis.** Diberikan satu bingkai, maka semua gambar dunia dibuat di kanvas luar layar 320 × 180, lalu kanvas itu digambar sekali ke kanvas dunia dengan pembesaran k tanpa penghalusan (`imageSmoothingEnabled = false`). Semua posisi gambar dibulatkan ke piksel logis (usulan 2a).
- **P-3. Kamera.** Kamera mengikuti posisi pemain sendiri yang ditampilkan. Pemain boleh bergeser dari tengah pandangan paling jauh 12 piksel logis mendatar dan 8 tegak (zona mati 24 × 16) sebelum kamera ikut bergeser. Kamera dijepit agar tidak keluar peta (0 sampai 2.240 mendatar, 0 sampai 1.420 tegak) dan selalu bernilai bulat. Saat pemain pertama kali mendapat posisi, dan sesudah `koreksi`, kamera langsung berpusat padanya. Tanpa guncangan dan tanpa zoom.
- **P-4. Urutan gambar.** Setiap bingkai, berurutan: (1) lapis bawah potongan peta; (2) bagian bawah gerbang lobi; (3) tokoh, yaitu pemain lain dan pemain sendiri, diurutkan menurut y kaki lalu `id`; (4) lapis atas potongan peta; (5) bagian atas gerbang lobi; (6) garis siluet pemain sendiri bila tertutup (P-6). Lapisan 50 (efek) belum dipakai di JS-07.
- **P-5. Tokoh.** Avatar digambar dari strip manifest dengan titik kaki di (8, 21) bingkai 16 × 24. Arah kiri adalah cermin arah kanan. Diam: 2 bingkai, 2 fps. Jalan: 4 bingkai, 8 fps. Bingkai dihitung dari jam lokal, sehingga tokoh yang sama bisa berbeda fase di dua perangkat. Dengan "kurangi gerak" (`prefers-reduced-motion: reduce`), tokoh selalu di bingkai pertama posenya. Warna tas mengikuti P-21.
- **P-6. Siluet.** Diberikan kotak gambar pemain sendiri yang beririsan dengan kotak bagian atas objek mana pun (termasuk gerbang), maka sesudah lapis atas digambar garis siluetnya: piksel bertetangga 4 arah dengan bentuk avatar (di luar bentuk) berwarna `ink`, lalu piksel bertetangga 4 arah dengan garis itu berwarna `sun` (Design System 7, lapisan 60). Bila tidak beririsan, siluet tidak digambar.

### Potongan peta dan masa

- **P-7. Potongan.** Peta dibagi potongan 256 × 256 piksel logis (16 × 16 ubin; 10 × 7 potongan, baris terakhir setinggi 64). Satu potongan punya dua kanvas: **lapis bawah** berisi, per sel, ubin `tanah`, lalu `tumpang`, lalu `bayangan` dari `kampung_gambar.json` memakai lembar masa yang aktif, lalu bagian bawah semua objek yang beririsan dengan potongan itu; **lapis atas** berisi bagian atas objek itu. Objek digambar dalam urutan tepi bawah jejak kakinya, di posisi spesifikasi JS-06 ("Cara layar pemain menggambar"). Objek `gerbang-lobi` tidak masuk potongan, karena gambarnya berganti (P-28).
- **P-8. Persiapan dan pelepasan.** Diberikan kamera di suatu posisi, maka potongan yang terlihat wajib siap sebelum bingkai digambar. Potongan di cincin satu potongan di sekitar pandangan disiapkan paling banyak satu per bingkai. Potongan yang berjarak lebih dari satu potongan dari pandangan dilepas. Paling banyak 16 potongan disimpan.
- **P-9. Lembar masa.** Ketiga lembar ubin dimuat sebelum tombol "Masuk" aktif (Architecture 9). Lobi dan hitung mundur memakai lembar pagi. Selama ronde, masa mengikuti P-30.
- **P-10. Persiapan masa berikutnya.** Diberikan ronde berjalan dan sisa waktu sampai pergantian masa ≤ 10 detik, maka potongan yang sedang disimpan disiapkan ulang dengan lembar masa berikutnya ke simpanan kedua, paling banyak satu per bingkai (usulan 4a).
- **P-11. Pergantian masa.** Saat masa berganti, simpanan kedua langsung dipakai dan simpanan lama dilepas, tanpa sapuan (Design System 11). Potongan yang belum disiapkan ulang dibuat saat dibutuhkan (P-8). Masa juga bisa mundur (P-30); aturannya sama.

### Gerak pemain sendiri

- **P-12. Keyboard.** `W`/`↑`, `A`/`←`, `S`/`↓`, dan `D`/`→` memberi arah; dua tombol tegak lurus memberi arah diagonal yang dinormalkan (`langkahGerak` JS-02). Tombol panah tidak menggulir halaman. Semua tombol dianggap lepas saat jendela kehilangan fokus atau tab tersembunyi.
- **P-13. Joystick.** Diberikan perangkat sentuh (`pointer: coarse` atau `navigator.maxTouchPoints > 0`), ketika sentuhan pertama mendarat di separuh kiri dunia dan bukan di tombol HUD, maka joystick muncul berpusat di titik itu: lingkaran radius 48 px (`cream` 85%, garis `ink`) dan kenop bergaris tengah 24 px (`sun`). Kenop mengikuti jari di dalam lingkaran. Dalam 8 px dari pusat, pemain diam; di luar itu, pemain berjalan dengan kecepatan penuh ke arah kenop (360°). Hanya satu jari yang diikuti. Saat jari diangkat atau sentuhan dibatalkan, joystick hilang dan pemain berhenti. Di perangkat tanpa layar sentuh, joystick tidak tampil.
- **P-14. Kapan bisa bergerak.** Gerak hanya diterima di status `lobi`, `hitung_mundur`, dan `main`, dan hanya saat tidak ada lapisan menyambung, peta besar, atau ajakan putar HP. Saat salah satu lapisan itu muncul, pemain berhenti (P-16).
- **P-15. Langkah.** Gerak dihitung dengan langkah tetap 1/60 detik memakai `langkahGerak` dan grid tabrakan yang sesuai status: grid lobi (P-46) di `lobi` dan `hitung_mundur`, grid kampung di `main`. Kecepatan 72 piksel logis per detik.
- **P-16. Mengirim `gerak`.** Selama bergerak, `gerak` dikirim paling sering setiap 100 ms (166 ms bila batas pemain lebih dari 50), berisi posisi, arah, `jalan: true`, dan `seq` yang selalu naik. Saat berhenti, satu `gerak` dengan `jalan: false` dikirim. Selama diam, tidak ada `gerak`. Bila `bufferedAmount` soket lebih dari 0, pengiriman dilewati dan kesempatan berikutnya mengirim posisi terbaru, tanpa antrean.
- **P-17. Posisi awal.** Diberikan `koreksi` pertama sesudah memilih identitas atau tersambung ulang (P-49), maka pemain sendiri ditaruh di posisinya, kamera berpusat padanya (P-3), dan `seq` berikutnya adalah `koreksi.seq + 1`. Sebelum posisi itu tiba, dunia menampilkan halaman lobi tanpa pemain sendiri.
- **P-18. Koreksi.** Diberikan `koreksi` berikutnya, maka posisi pemain sendiri langsung pindah ke posisi itu, dan `seq` berikutnya paling kecil `koreksi.seq + 1`.

### Pemain lain

- **P-19. Penyangga.** Setiap butir `dunia.p` (`id`, `x`, `y`, `arah`, `jalan`) disimpan bersama waktu server `dunia.w` di penyangga pemain itu, paling banyak 10 butir terbaru. Pemain yang belum dikenal dari `pemain_baru` tidak digambar.
- **P-20. Tunda adaptif.** Untuk setiap `dunia` yang tiba, d = (jam lokal + selisih jam server) − `w`. d̄ adalah rata-rata bergerak eksponensial d (α 0,1), dan J adalah rata-rata bergerak eksponensial |d − d̄| (α 0,1); awalnya d̄ = d pertama dan J = 25 ms. Tunda tampilan = 100 + 2J, dijepit 120 sampai 250 ms (usulan 5a).
- **P-21. Interpolasi.** Pemain lain digambar pada waktu server (sekarang − tunda). Bila waktu itu berada di antara dua butir, posisi diinterpolasi lurus dan arah serta pose memakai butir yang lebih awal. Bila waktu itu melewati butir terakhir, posisi diteruskan dengan kecepatan dua butir terakhir paling lama 100 ms, lalu berhenti. Warna tas dari `pemain_baru`: setiap strip avatar disalin untuk pasangan warna tas pemain itu dengan mengganti `KUNCI_TAS.dasar` dan `KUNCI_TAS.bayangan` serentak (Design System 8).
- **P-22. Sembunyi.** Di status `main`, pemain lain yang tidak muncul di `dunia` selama 2,5 detik tidak digambar sampai muncul lagi. Di `lobi` dan `hitung_mundur`, pemain lain tetap digambar di posisi terakhirnya, karena tidak ada yang bisa keluar dari halaman lobi.
- **P-23. Label nama.** Nama samaran paling banyak 8 pemain lain terdekat yang terlihat digambar di kanvas kedua beresolusi perangkat, di atas kepala (DRAF D-1). Label pemain sendiri tidak ditampilkan.
- **P-24. Saling tembus.** Pemain tidak saling bertabrakan, di klien maupun server.

### Lobi, hitung mundur, dan gerbang

- **P-25. Masuk lobi.** Diberikan pemain sudah memilih identitas dan status `lobi`, maka layar menampilkan dunia di halaman lobi depan sekolah dengan pemain sendiri di titik munculnya (P-49), pemain lain yang sudah ada (P-48), dan `PanelLobi` (P-26). Dunia memakai lembar pagi.
- **P-26. Panel lobi.** Panel berbingkai piksel di atas tengah dunia berisi: label "Kode ruang" beserta kode, jumlah pemain ("{n} pemain di ruang", dari jumlah pemain berkeidentitas yang dikenal), "Menunggu guru memulai…", "Jangan tutup tab ini.", dan tombol "Layar penuh" (P-43). Isi yang berubah diumumkan lewat wilayah `aria-live` yang sudah ada (DRAF D-2).
- **P-27. Berjalan di lobi.** Diberikan status `lobi` atau `hitung_mundur`, ketika pemain bergerak, maka gerak dihitung dengan grid lobi, sehingga pemain tidak bisa melewati gerbang. Pemain lain melihatnya bergerak (P-47).
- **P-28. Gerbang.** Selama `lobi` dan `hitung_mundur`, gerbang digambar `obj_gerbang_tutup` (bawah dan atas) di posisi objek `gerbang-lobi`. Sejak status `main`, gerbang digambar `obj_gerbang_buka`, grid kampung dipakai, dan pemain bisa keluar dari halaman lobi.
- **P-29. Hitung mundur.** Saat status `hitung_mundur`, di tengah dunia tampil "Bersiap" dan angka 3, 2, lalu 1, masing-masing satu detik menurut jam server, tanpa membesar halus (Design System 11). Pemain tetap bisa berjalan di lobi. "Ronde dimulai." diumumkan saat status menjadi `main`.

### Bilah atas dan langit sehari

- **P-30. Kemajuan dan masa.** Sisa waktu `s` = `berakhirPada` − jam server sekarang (status `main`) atau `berakhirPada` − `jedaSejak` (status `jeda`), dijepit ≥ 0. Kemajuan = 1 − s / (durasi ronde dari pengaturan), dijepit 0 sampai 1. Masa dan jam cerita dihitung dari kemajuan dengan `aturan.ts` (JS-02): pagi < 0,3 ≤ siang < 0,65 ≤ sore. Karena dihitung dari sisa waktu, tambah waktu oleh guru memundurkan langit dan jam cerita, dan masa bisa kembali ke masa sebelumnya. Cara ini sama di setiap perangkat, juga sesudah sambung ulang.
- **P-31. Bilah atas.** Selama `main` dan `jeda`, bilah setinggi 28 px menimpa tepi atas dunia, dengan latar menurut masa (pagi `#FFD9A8`, siang `#6EC6F2`, sore `#FFC27A`) dan teks `ink`. Kiri: busur hari mini dengan tiga titik masa dan ikon matahari di posisi kemajuan, lalu jam cerita "HH.MM". Tengah: sisa waktu "MM:SS" (dibulatkan ke atas per detik). Skor dan peringkat belum tampil (JS-08). Di `lobi` dan `hitung_mundur`, bilah atas tidak tampil.
- **P-32. Dua menit terakhir.** Saat sisa waktu menjadi ≤ 120 detik (`duaMenitTerakhir`), sisa waktu tampil berlatar `mango` dengan teks `ink`, busur hari berdenyut 2 bingkai setiap 0,5 detik, dan pita pemberitahuan "Dua menit lagi" tampil di atas tengah selama 3 detik serta diumumkan sekali. Bila tambah waktu membuat sisa > 120 detik lalu turun lagi, pita tampil lagi. Dengan "kurangi gerak", busur tidak berdenyut.
- **P-33. Jam di layar dan pembaca layar.** Bilah atas punya label untuk pembaca layar: "Jam cerita {jam}", "Sisa waktu {waktu}". Pergantian masa tidak diumumkan.
- **P-34. Jeda.** Saat status `jeda`, jam cerita dan sisa waktu berhenti, lapisan `ink` 70% dengan "Dijeda oleh guru" menutupi dunia, dan pemain berhenti. Saat dilanjutkan, lapisan hilang.

### Peta mini dan peta besar

- **P-35. Peta mini.** Selama `main` dan `jeda`, peta mini berbingkai piksel di kanan atas, di bawah bilah atas, berukuran 112 × 75 px. Peta digambar 0,7 px per ubin (112 × 70 px, di tengah tegak) dengan delapan zona berwarna dominan (DRAF D-4), titik halte (`ikon_mini_halte`), dan panah diri (`tanda_diri`, bingkai urutan bawah, atas, kanan, kiri) di posisi pemain sendiri. Di lobi dan hitung mundur, peta mini tidak tampil.
- **P-36. Kejadian di peta.** Penanda kejadian yang sudah terlihat belum ada di JS-07. Lapisannya disiapkan kosong untuk JS-08.
- **P-37. Membuka peta besar.** Mengetuk atau mengeklik peta mini, atau menekan `P`, membuka peta besar yang menutupi dunia (bilah atas tetap tampil). Peta mini adalah tombol dengan label "Buka peta besar".
- **P-38. Isi peta besar.** Peta digambar dengan skala bulat terbesar (px per ubin) yang muat, paling kecil 2, berisi zona berwarna, nama setiap zona dari `kampung.json` beserta ikon zonanya di tengah zona, halte, dan panah diri berlabel "Kamu di sini" (DRAF D-3). Judul "Peta kampung".
- **P-39. Menutup peta besar.** Tombol "Tutup peta" (≥ 48 × 48 px), `P`, atau `Esc` menutup peta besar, lalu fokus kembali ke dunia. Selama peta besar terbuka, ronde tetap berjalan, tetapi pemain berhenti (P-14; DRAF D-5).

### Lapisan dan layar lain

- **P-40. Menyambung.** Saat klien menyambung ulang (JS-03), lapisan `ink` 70% menutupi dunia dengan "Menyambung ulang…" dan `ikon_menyambung` (2 bingkai), ditambah "Periksa wifi atau data selulermu." sesudah 30 detik dan tombol "Muat ulang" sesudah 2 menit (perilaku JS-03, kini di atas dunia). Pemain berhenti. Sesudah tersambung, posisi diambil dari `koreksi` (P-17).
- **P-41. Ronde selesai dan ruang ditutup.** Layar "Ronde selesai" dan "Ruang ditutup" JS-03 tetap berupa layar HTML tanpa dunia.
- **P-42. HP tegak.** Diberikan perangkat sentuh dengan tinggi tampilan lebih besar dari lebarnya, maka seluruh layar menampilkan `ikon_putar_hp` dan "Putar HP ke posisi mendatar" tanpa dunia di belakangnya, dan pemain berhenti. Ronde tetap berjalan. Saat HP kembali mendatar, dunia tampil lagi.
- **P-43. Layar penuh.** Tombol "Layar penuh" (dengan `ikon_layar_penuh`) di panel lobi tampil hanya bila `document.fullscreenEnabled` dan halaman belum layar penuh. Ketika ditekan, halaman masuk layar penuh, lalu orientasi dikunci mendatar bila didukung; kegagalan mengunci diabaikan.
- **P-44. Layar tetap menyala.** Diberikan Screen Wake Lock API tersedia, ketika pemain masuk lobi, maka kunci layar diminta. Kunci diminta lagi setiap tab kembali terlihat selama pemain di lobi atau ronde, dan dilepas di layar selesai dan ditutup. Bila API tidak tersedia atau permintaan ditolak, tidak ada pesan dan permainan berjalan biasa (usulan 9a).

### Server dan inti

- **P-45. Status gerak.** `periksaGerak` (JS-02) menerima laporan di status `lobi`, `hitung_mundur`, dan `main`; status lain tetap ditolak dengan alasan `status`. Pemanggil memberikan grid sesuai status: grid lobi di `lobi` dan `hitung_mundur`, grid kampung di `main`.
- **P-46. Peta kampung di server.** `server/jejak-setara/src/ruang/peta-kampung.ts` mengimpor `app/jejak-setara/peta/kampung.json` saat build. Di lingkup modul Worker, ia mengurai lapisan `tabrakan` dengan `uraiRle`, mengambil `lebar`, `tinggi`, `titikMuncul`, dan `gerbangLobi`, lalu membuat grid lobi dengan `tutupGerbang` (fungsi baru di `inti/peta.ts`: salinan grid dengan semua sel `gerbangLobi` bernilai 1). `bacaPeta` tidak dijalankan saat Worker berjalan; pemeriksaannya ada di uji (usulan 7a). Ruang baru dan ruang yang dipulihkan memakai peta ini. `peta-uji.ts` hanya dipakai uji.
- **P-47. `dunia` di lobi dan hitung mundur.** Tanpa putaran 100 ms. Ketika `gerak` diterima di status `lobi` atau `hitung_mundur`, maka `dunia` dikirim ke semua pemain berkeidentitas bila sudah ≥ 100 ms sejak kiriman `dunia` lobi terakhir, atau bila laporan itu `jalan: false`. Isinya mengikuti aturan putaran JS-03 (pemain yang berubah, di dalam kotak 480 × 270, paling banyak 24 terdekat), ditambah kerangka penuh (P-48). Bila tidak ada `gerak`, tidak ada kiriman, sehingga ruang bisa beristirahat (usulan 6a).
- **P-48. Kerangka penuh.** Setiap pemain menerima, paling sering sekali per detik, `dunia` yang juga memuat pemain yang **tidak** berubah di dalam kotaknya, sampai total 24 terdekat. Di status `main`, kerangka penuh dikirim di setiap putaran ke-10. Di lobi dan hitung mundur, kerangka penuh ikut kiriman P-47 bila sudah ≥ 1 detik sejak kerangka penuh terakhir pemain itu. Pemain yang baru memilih identitas atau tersambung ulang langsung menerima kerangka penuh, dan posisinya langsung dikirim ke pemain lain di dalam kotaknya.
- **P-49. Posisi awal lewat `koreksi`.** Diberikan pemain memilih identitas, atau pemain berkeidentitas tersambung ulang, maka sesudah `selamat_datang`, `status_ruang`, dan `pemain_baru`, server mengirim `koreksi` berisi posisinya (titik muncul ke-((urutan − 1) mod jumlah titik muncul), yaitu 18 di peta kampung, atau posisi terakhirnya) dengan `seq` = `seq` gerak terakhir yang diterima, paling kecil 0. Tidak ada pesan baru, dan `PROTOKOL_VERSI` tetap 1.
- **P-50. Versi peta.** `versiPeta(peta)` (fungsi baru di `inti/peta.ts`) = (`benih` FNV-1a JS-02 atas teks `tabrakan` peta) mod 999.999 + 1. Server mengisinya di `selamat_datang.versiPeta`. Bila nilai itu berbeda dari versi peta yang dibawa halaman, klien berhenti menyambung dan menampilkan "Ada pembaruan. Muat ulang halaman." beserta tombol "Muat ulang".
- **P-51. Putaran `main`.** Putaran 100 ms JS-03 tetap, ditambah kerangka penuh (P-48). `dunia.n` tetap jumlah pemain berkeidentitas.
- **P-52. Penolakan gerak jujur.** Test mengukur bagian laporan `gerak` jujur yang ditolak di uji jaringan lokal (latensi 80 ms, jitter rata-rata 40 ms). Bila lebih dari 1%, Build memakai **anggaran jarak**: setiap pemain punya anggaran A (piksel logis) yang bertambah sebesar kecepatan saat itu × 1,25 per detik sejak laporan diterima terakhir dan dibatasi setengah detik berjalan (45 piksel pada kecepatan 72); laporan diterima bila jaraknya ≤ A + 4 dan jalurnya bebas, lalu A dikurangi jaraknya, paling kecil 0. Keputusan dan angkanya dicatat di laporan uji (usulan 10a).

### Kendali ruang coba (lingkungan uji)

- **P-53. Kait di lingkungan uji.** `POST /api/ruang-coba/{KODE}/kelas` hidup di lingkungan `lokal` (seperti JS-03) dan `uji`. Di `uji`, tajuk `X-Jejak-Kunci-Coba` harus sama dengan rahasia `KUNCI_COBA` (pembandingan waktu-konstan, seperti `POST /api/ruang-coba`); bila tidak, jawaban 403 `KUNCI_SALAH`. Di produksi, jawaban 404 `BELUM_TERSEDIA`. Kait `statistik` dan `putuskan` tetap hanya di `lokal`.
- **P-54. Jawaban kait.** Isi permintaan diperiksa `skemaKelas` (JS-03). Pesan yang sah diteruskan ke inti ruang, dan jawabannya `{ "ok": true, "status": "<status ruang sesudahnya>" }` dengan kode 200. Pesan yang tidak berlaku di status sekarang tidak mengubah apa pun, tetapi tetap dijawab 200 dengan status sekarang.
- **P-55. Alur kerja "Jejak: kendali ruang coba".** Dijalankan dengan tombol **Run workflow**, dengan masukan "Kode ruang" (5 karakter) dan "Aksi" berupa pilihan: `mulai`, `jeda`, `lanjut`, `tambah 1 menit`, `akhiri`, dan `tutup`. Langkahnya sama dengan "Jejak: ruang coba": periksa rahasia, buat dan simpan kunci sekali pakai `KUNCI_COBA` (tidak pernah tampil di log), cari alamat lingkungan uji, lalu kirim pesan layar kelas yang sesuai (`mulai`, `jeda`, `lanjut`, `tambah_waktu` dengan `detik` 60, `akhiri`, `tutup_ruang`), dicoba ulang sampai 10 kali selama jawabannya 403. Grup `concurrency` `jejak-cloudflare-uji`, batas 10 menit, dan izin `contents: read`.
- **P-56. Ringkasan kendali.** Ringkasan alur kerja menulis kode ruang, aksi, dan "Status ruang sekarang: …" dengan nama status Bahasa Indonesia (bagian "Teks yang tampil"). Bila kode tidak ditemukan, alur kerja gagal dengan "Kode ruang tidak ditemukan atau ruang sudah ditutup."
- **P-57. Durasi ruang coba.** "Jejak: ruang coba" mendapat masukan "Durasi ronde (menit)" berupa pilihan 10, 15 (bawaan), atau 20, yang dikirim sebagai `durasiMenit`. Alur kerja kendali dan kait ini dipensiunkan di JS-10 bersama ruang coba.

## Beberapa pemain sekaligus

- Diberikan dua pemain A dan B di lobi, ketika A berjalan, maka B melihat A berjalan dengan tunda P-20, dan A melihat B diam di posisinya walaupun B belum pernah bergerak (kerangka penuh P-48).
- Diberikan 40 pemain di lobi dan tidak ada yang bergerak, maka server tidak mengirim `dunia` dan tidak memasang pengatur waktu, sehingga ruang bisa beristirahat (P-47).
- Diberikan pemain C bergabung saat A dan B diam, maka C langsung melihat A dan B, dan A serta B langsung melihat C di titik munculnya (P-48).
- Diberikan ronde dimulai, maka semua pemain melihat gerbang terbuka pada `status_ruang` yang sama, dan grid kampung berlaku di klien dan server.
- Diberikan 100 pemain berdesakan, maka setiap pemain menerima paling banyak 24 pemain terdekat per `dunia`, dan label nama tetap paling banyak 8.
- Diberikan B keluar dari kotak A di status `main`, maka B hilang dari layar A paling lambat 2,5 detik kemudian (P-22), dan tampil lagi begitu masuk kotak A.
- Diberikan A tersambung ulang, maka A kembali di posisi terakhirnya (bukan titik muncul) dan langsung melihat pemain di sekitarnya.

## Status antarmuka

| Keadaan | Yang tampil |
|---|---|
| Memuat aset | Layar gabung JS-03; tombol "Masuk" baru aktif sesudah aset pemain dan ketiga lembar ubin termuat |
| Lobi | Dunia di halaman lobi, gerbang tertutup, `PanelLobi`, joystick (perangkat sentuh); tanpa bilah atas dan peta mini |
| Hitung mundur | Seperti lobi, ditambah "Bersiap" dan angka 3, 2, 1 di tengah |
| Ronde berjalan | Dunia, gerbang terbuka, bilah atas, peta mini, joystick (perangkat sentuh) |
| Dua menit terakhir | Sisa waktu berlatar `mango`, busur berdenyut, pita "Dua menit lagi" 3 detik |
| Dijeda | Lapisan `ink` 70% "Dijeda oleh guru"; jam berhenti |
| Peta besar terbuka | Peta besar menutupi dunia; bilah atas tetap tampil; pemain berhenti |
| Menyambung ulang | Lapisan `ink` 70% "Menyambung ulang…" (JS-03), di atas dunia |
| HP tegak | Hanya ajakan putar HP |
| Versi peta berbeda | "Ada pembaruan. Muat ulang halaman." dan tombol "Muat ulang" |
| Ronde selesai, ruang ditutup | Layar HTML JS-03, tanpa dunia |
| Fokus | Peta mini, tombol "Layar penuh", dan "Tutup peta" bisa difokus dengan Tab; fokus terlihat (latar `sun` dan ▶). Kanvas dunia bisa difokus dan menerima tombol gerak |

## Teks yang tampil (final)

Semua teks di `app/jejak-setara/teks.ts`. Teks JS-03 yang dipakai ulang tidak diubah: `lobi.*`, `ronde.bersiap`, `ronde.dijeda`, `menyambung.*`, `tombol.muatUlang`, `galat.VERSI_BERBEDA`, dan `pengumuman.mulai`.

| Kunci | Teks |
|---|---|
| `dunia.label` | Dunia permainan. Gerakkan avatar dengan W, A, S, D atau tombol panah. |
| `dunia.layarPenuh` | Layar penuh |
| `dunia.putarHp` | Putar HP ke posisi mendatar |
| `dunia.duaMenit` | Dua menit lagi |
| `dunia.jamCerita` | Jam cerita {jam} |
| `dunia.sisaWaktu` | Sisa waktu {waktu} |
| `dunia.masa.pagi` / `.siang` / `.sore` | Pagi / Siang / Sore (label titik busur untuk pembaca layar) |
| `peta.bukaBesar` | Buka peta besar |
| `peta.judul` | Peta kampung |
| `peta.tutup` | Tutup peta |
| `peta.kamuDiSini` | Kamu di sini |
| `peta.halte` | Halte |

Teks di ringkasan alur kerja "Jejak: kendali ruang coba" (bukan bagian layar pemain): "Kode ruang: {kode}", "Aksi: {aksi}", "Status ruang sekarang: {status}", dengan nama status: `lobi` "Lobi", `hitung_mundur` "Hitung mundur", `main` "Ronde berjalan", `jeda` "Dijeda", `selesai` "Selesai", `pembahasan` "Pembahasan", `ditutup` "Ditutup"; galat "Kode ruang tidak ditemukan atau ruang sudah ditutup." Masukan "Durasi ronde (menit)" di "Jejak: ruang coba".

## Data, protokol, API, dan migrasi

- **Protokol:** tidak ada pesan baru, tidak ada kunci baru, dan `PROTOKOL_VERSI` tetap 1. Perubahan perilaku: `gerak` sah di `lobi` dan `hitung_mundur`; `dunia` dikirim juga di kedua status itu (P-47) dan memuat kerangka penuh (P-48); `koreksi` juga dipakai untuk posisi awal (P-49); `versiPeta` berisi versi peta kampung (P-50).
- **API:** `POST /api/ruang-coba/{KODE}/kelas` hidup di `uji` dengan kunci (P-53), dan jawabannya memuat `status` (P-54). Rute lain tidak berubah.
- **Migrasi D1:** tidak ada.
- **Penyimpanan Durable Object:** tidak ada tabel baru. Waktu kiriman `dunia` lobi dan kerangka penuh terakhir hanya di memori.
- **Dokumen yang ikut diubah (ZIP Gerbang 2):** Architecture 6.5 (`gerak` tanpa kiriman saat diam; kerangka penuh `dunia`), 7 (lobi dan hitung mundur dengan kiriman `dunia` mengikuti `gerak`; kait kendali di lingkungan uji), 8.2 (status gerak, grid lobi, posisi awal, anggaran jarak bersyarat), 9 (cara menggambar, skala, tunda adaptif, sembunyi, masa dari sisa waktu), dan 11.2 (bentuk lengkap manifest); Design System 3.2 (pemotongan paling banyak 2 piksel logis).

## Aset

Semua dari `manifest.ts` (bentuk usulan 11a, Architecture 11.2) dan semuanya Disetujui: `UBIN` (`ubin_pagi`, `ubin_siang`, `ubin_sore`), `OBJEK` (59 jenis di `kampung.json` ditambah `gerbang_tutup`), `AVATAR` (48 strip dan 8 ikon), `TANDA.tanda_diri`, dan `IKON` (`ikon_mini_halte`, `ikon_matahari`, `ikon_menyambung`, `ikon_putar_hp`, `ikon_layar_penuh`, `ikon_zona_1` sampai `ikon_zona_8`). Tidak ada aset baru. Seluruh aset layar pemain sekitar 100 KB, di bawah anggaran 2 MB.

## Keamanan dan privasi

- Server tetap berwenang atas posisi: setiap `gerak` diperiksa (P-45, P-52), dan gerbang padat di server selama lobi.
- Kait kendali di lingkungan uji dijaga kunci sekali pakai yang dibuat ulang setiap alur kerja berjalan, dibandingkan waktu-konstan, tidak pernah tertulis di log, dan mati di produksi (P-53).
- Tidak ada data baru tentang pemain. Screen Wake Lock dan layar penuh tidak memerlukan izin pengguna dan tidak menyimpan apa pun.
- CSP tidak berubah: semua gambar berasal dari aset halaman sendiri (`img-src 'self'`).

## Di luar cakupan

- Penanda kejadian, tombol Periksa, ajakan "`E` Periksa", dialog, skor, dan peringkat (JS-08).
- Skill, kotak bantuan, tombol skill, panah kompas, dan efek debu atau kilau (JS-09).
- Layar kelas dan tombol Mulai guru (JS-10).
- Suara, pengaturan pemain, ukuran label nama, dan pemberitahuan privasi (JS-14).
- Teropong, Angkot, dan bantuan gerak (JS-18).
- Tokoh bukan pemain di peta (JS-08 bersama kejadian).

## DRAF untuk ditinjau pemilik proyek

- **D-1. Label nama.** — (a, saran) huruf Pixelify Sans 13 px, teks `ink` di atas latar `cream` dengan garis `ink` 1 px, jarak dalam 2 px, di tengah atas kepala. (b) Teks `white` dengan bayangan `ink` tanpa latar: lebih ringan, tetapi sulit dibaca di atas ubin terang seperti semen dan pasir.
- **D-2. Panel lobi.** — (a, saran) satu panel di atas tengah dunia, selebar paling banyak 60% dunia, berisi kode, jumlah pemain, dua kalimat, dan tombol layar penuh. Pemain sendiri berada di tengah, jadi tidak tertutup panel. (b) Panel kecil di kiri atas yang hanya memuat kode dan jumlah, sedangkan kalimat "Menunggu guru memulai…" tampil sebagai pita di bawah.
- **D-3. Peta besar.** — (a, saran) nama zona dengan ikon zona di tengah setiap zona, halte, dan panah diri berlabel "Kamu di sini". (b) Ikon zona saja tanpa nama: lebih bersih, tetapi siswa harus menghafal arti ikon.
- **D-4. Warna zona di peta mini dan peta besar.** — (a, saran) satu warna dominan per zona dari Design System 7: Z1 `coral`, Z2 `sky-d`, Z3 `slate`, Z4 `mango`, Z5 `wood`, Z6 `leaf`, Z7 `teal`, dan Z8 `berry`, dengan garis batas zona `ink` 1 px. (b) Gambar peta yang diperkecil dari lembar ubin: lebih rinci, tetapi zona sulit dibedakan pada ukuran 112 px.
- **D-5. Gerak saat peta besar terbuka.** — (a, saran) pemain berhenti selama peta besar terbuka, agar tidak berjalan tanpa melihat. (b) Pemain tetap bisa berjalan dengan keyboard sambil melihat peta besar.

## Kriteria penerimaan

- [ ] AC-1 **Skala.** P-1 untuk kelima contoh wajib, termasuk potongan ≤ 2 piksel logis per sisi dan bingkai `ink`; skala dihitung ulang saat jendela atau orientasi berubah.
- [ ] AC-2 **Gambar dan urutan.** P-2 sampai P-6: kanvas logis yang diperbesar tanpa penghalusan; urutan lapisan; tokoh diurutkan menurut y kaki; arah kiri dicerminkan; siluet hanya saat tertutup bagian atas objek; "kurangi gerak" menghentikan animasi tokoh.
- [ ] AC-3 **Kamera.** P-3: zona mati 24 × 16, jepit di keempat tepi peta, posisi bulat, berpusat saat posisi awal dan sesudah `koreksi`.
- [ ] AC-4 **Potongan peta.** P-7 dan P-8: isi lapis bawah dan atas sama dengan pratinjau JS-06 di potongan contoh (perbandingan piksel); potongan terlihat selalu siap; paling banyak satu potongan cincin per bingkai; paling banyak 16 potongan disimpan.
- [ ] AC-5 **Masa.** P-9 sampai P-11 dan P-30 dengan jam tiruan: lembar pagi di lobi; pergantian di kemajuan 0,3 dan 0,65; persiapan mulai 10 detik sebelumnya; tambah waktu memundurkan masa; hasil sama sesudah sambung ulang.
- [ ] AC-6 **Keyboard.** P-12, P-14, P-15: kedelapan arah, diagonal tidak lebih cepat, panah tidak menggulir, tombol dilepas saat kehilangan fokus, dan tidak bergerak di status atau lapisan yang tidak mengizinkan.
- [ ] AC-7 **Joystick.** P-13 dengan sentuhan tiruan: muncul di titik sentuh separuh kiri, ukuran 48/24 px, zona diam 8 px, arah 360°, hilang saat diangkat, dan tidak tampil di perangkat tanpa layar sentuh.
- [ ] AC-8 **Pengiriman `gerak`.** P-16 sampai P-18: paling sering setiap 100 ms (166 ms untuk batas > 50), satu laporan berhenti, tanpa kiriman saat diam, tanpa antrean saat `bufferedAmount` > 0, `seq` selalu naik, posisi awal dan koreksi diterapkan.
- [ ] AC-9 **Pemain lain.** P-19 sampai P-22: tunda adaptif dalam 120–250 ms; interpolasi dan penerusan paling lama 100 ms; sembunyi sesudah 2,5 detik di `main` saja; warna tas dari `pemain_baru` dengan penggantian serentak.
- [ ] AC-10 **Label nama.** P-23: paling banyak 8 label terdekat yang terlihat, label diri tidak tampil, sesuai pilihan D-1.
- [ ] AC-11 **Lobi dan gerbang.** P-25 sampai P-29 dan P-45: berjalan di lobi tanpa bisa melewati gerbang (klien dan server), gerbang tertutup lalu terbuka saat `main`, hitung mundur 3-2-1, panel lobi sesuai D-2.
- [ ] AC-12 **Bilah atas.** P-31 sampai P-34: latar per masa, busur dan jam cerita, sisa waktu, dua menit terakhir (latar, denyut, pita sekali per penurunan), label pembaca layar, dan jeda.
- [ ] AC-13 **Peta mini dan peta besar.** P-35 sampai P-39: ukuran, zona sesuai D-4, halte, panah diri dengan arah, dibuka dengan ketuk, klik, atau `P`, ditutup dengan tombol, `P`, atau `Esc`, isi sesuai D-3, pemain berhenti sesuai D-5.
- [ ] AC-14 **Lapisan.** P-40 sampai P-43: menyambung di atas dunia, layar selesai dan ditutup tetap, ajakan putar HP, tombol layar penuh hanya bila didukung.
- [ ] AC-15 **Layar tetap menyala.** P-44 dengan API tiruan: diminta di lobi, diminta lagi saat tab kembali terlihat, dilepas di layar akhir, dan tanpa galat bila tidak tersedia.
- [ ] AC-16 **Server: peta dan gerak.** P-45, P-46, P-49, P-50: peta kampung dipakai ruang baru dan ruang yang dipulihkan; `bacaPeta` lulus atas `kampung.json` di uji; grid lobi menutup gerbang; posisi awal dan posisi sesudah sambung ulang lewat `koreksi`; versi peta sama di server dan klien, dan klien berhenti bila berbeda.
- [ ] AC-17 **Server: `dunia` di lobi.** P-47 dan P-48: kiriman hanya mengikuti `gerak`, paling sering 100 ms kecuali laporan berhenti, kerangka penuh paling sering sekali per detik per pemain, kerangka penuh untuk pemain baru dan yang tersambung ulang, dan tanpa pengatur waktu selama lobi.
- [ ] AC-18 **Kendali ruang coba.** P-53 sampai P-57: 403 tanpa kunci yang benar di `uji`, 404 di produksi, jawaban berisi status, keenam aksi bekerja di uji server, dan alur kerja menulis ringkasan tanpa menampilkan kunci.
- [ ] AC-19 **Kinerja.** Di uji ujung ke ujung dengan 40 pemain tiruan dan CPU 6× diperlambat di ukuran HP: kode gambar p95 ≤ 4 ms per bingkai; tidak ada bingkai di atas 50 ms saat masa berganti atau saat berjalan melintasi peta. Butir manual "≥ 30 fps di HP Android kelas bawah" dicek pemilik proyek di lingkungan uji.
- [ ] AC-20 **Beban dan lalu lintas.** `sim:beban` lokal dengan bot yang berjalan di lobi lalu menjelajah: 1 ruang × 50 bot dan 1 ruang × 100 bot lulus seperti JS-03, dan lalu lintas turun per pemain ≤ 3 MB per 15 menit termasuk kerangka penuh; tidak ada pengatur waktu di lobi saat semua bot diam.
- [ ] AC-21 **Gerak jujur.** P-52: bagian `gerak` jujur yang ditolak di uji jaringan lokal (latensi 80 ms, jitter rata-rata 40 ms) ≤ 1%, dengan atau tanpa anggaran jarak; angka dan keputusannya tercatat.
- [ ] AC-22 **Ukuran.** Kode layar pemain ≤ 200 KB gzip; seluruh aset layar pemain ≤ 2 MB; kedua berkas peta ≤ 60 KB gzip.
- [ ] AC-23 **Aksesibilitas.** Fokus terlihat, target sentuh ≥ 48 px, keyboard penuh untuk gerak dan peta besar, label pembaca layar, pengumuman `aria-live` dengan jarak ≥ 2 detik, dan makna tidak hanya lewat warna (gerbang berbeda bentuk, sisa waktu tetap berangka).
- [ ] AC-24 **Kode dan lingkungan.** Semua perintah AGENTS bagian 6 lulus; `tsc --noEmit` 0 galat dan ESLint 0 masalah; tidak ada galat konsol, pelanggaran CSP, atau respons 4xx dan 5xx yang tidak diharapkan; galeri 178 berkas identik byte; `PROTOKOL_VERSI` tetap 1.

## Rencana uji

### Uji unit (`test:jejak`)

- `__tests__/dunia/skala.test.ts`: P-1 dengan kelima contoh wajib dan kasus batas (k = 1, potongan tepat 2 piksel logis).
- `__tests__/dunia/kamera.test.ts`: zona mati, jepit, pembulatan, pusat saat posisi awal.
- `__tests__/dunia/potongan.test.ts`: isi potongan dibanding gambar acuan dari pratinjau JS-06 (kanvas tiruan Node atau perbandingan di Playwright), urutan objek, gerbang tidak masuk potongan, persiapan dan pelepasan, batas 16, persiapan masa berikutnya.
- `__tests__/dunia/masukan.test.ts` dan `gerakDiri.test.ts`: keyboard, joystick (zona diam, arah, satu jari), jadwal kiriman, laporan berhenti, `bufferedAmount`, `seq`, `koreksi`.
- `__tests__/dunia/pemainLain.test.ts`: tunda adaptif dengan deret kedatangan buatan, interpolasi, penerusan 100 ms, sembunyi 2,5 detik hanya di `main`.
- `__tests__/dunia/langit.test.ts`: kemajuan dari sisa waktu, jeda, tambah waktu, dua menit terakhir, jam cerita.
- `__tests__/dunia/aset.test.ts`: penggantian warna tas serentak (piksel `sun` dan `mango` saja yang berubah), cermin kiri, garis siluet dua lapis.
- `__tests__/dunia/layarMenyala.test.ts`: API tiruan.
- Uji klien JS-03 di `__tests__/ruang/`: `selamat_datang` dengan `versiPeta` berbeda menghentikan klien dan memunculkan pesan pembaruan (P-50).
- `__tests__/inti/gerak.test.ts` dan `peta.test.ts`: status gerak (P-45), `tutupGerbang`, `versiPeta`, dan anggaran jarak bila dipakai (P-52).
- `__tests__/ruang/inti-ruang.test.ts`: gerak di lobi dengan gerbang padat, kiriman `dunia` lobi (≥ 100 ms, laporan berhenti langsung), kerangka penuh, posisi awal dan sambung ulang lewat `koreksi`, tanpa putaran di lobi.
- `__tests__/kerangka.test.ts`: alur kerja kendali ada dan memakai grup `concurrency` yang sama; "Jejak: ruang coba" punya masukan durasi.

### Uji server (`test:jejak:server`)

- Ruang baru memakai peta kampung: gerak dari titik muncul ke gerbang ditolak di lobi dan diterima sesudah `mulai`.
- Kait kendali: `lokal` tanpa kunci; `uji` dengan kunci benar dan salah (403); produksi 404; jawaban berisi status; keenam aksi.
- `bacaPeta` lulus atas `kampung.json`, dan `peta-kampung.ts` menghasilkan grid yang sama dengan `bacaPeta`.

### Uji ujung ke ujung (`test:e2e:jejak`, `e2e/jejak-setara/dunia.uji.ts`)

- Dua konteks bergabung ke satu ruang; masing-masing melihat yang lain di lobi tanpa bergerak lebih dulu; A berjalan dengan keyboard dan B melihat A berpindah.
- Konteks HP (731 × 411, r 2,625, sentuh) memakai joystick; konteks laptop tidak menampilkan joystick.
- Kait kendali lokal: `mulai`, lalu jam tiruan peramban memajukan waktu agar masa berganti; lembar siang dan sore terlihat (perbandingan warna piksel di titik tetap); bilah atas dan dua menit terakhir tampil.
- Peta besar dibuka dengan `P` dan ketukan, ditutup dengan `Esc` dan tombol.
- Kait `putuskan` memutus sambungan: lapisan menyambung tampil di atas dunia, lalu pemain kembali di posisi terakhirnya.
- Konteks HP diputar tegak: ajakan putar tampil.
- Kinerja (AC-19): CPU diperlambat 6× lewat CDP, 40 pemain tiruan dari bot, waktu gambar per bingkai dicatat.
- Tangkapan layar empat ukuran (731 × 411, 1280 × 720, 1024 × 768, 1920 × 1080) di lobi, ronde pagi, ronde sore, dan peta besar; 0 galat konsol, 0 pelanggaran CSP.

### Beban dan jaringan

- `sim:beban` (wajib): bot berjalan di lobi 30 detik, lalu `mulai` lewat kait lokal dan menjelajah; 1 × 50 dan 1 × 100 bot; dicatat lalu lintas turun per pemain, pesan per detik, dan jumlah putaran atau pengatur waktu selama lobi diam (AC-20).
- Uji jaringan lokal (AC-21): proksi WebSocket di skrip uji menunda pesan 80 ms ditambah jitter eksponensial rata-rata 40 ms; dihitung bagian `gerak` jujur yang ditolak, dengan aturan JS-02 dan, bila perlu, dengan anggaran jarak.

### Manual (AGENTS 9) di lingkungan uji

- Lancar (≥ 30 fps) di HP Android kelas bawah selama satu ronde penuh lewat "Jejak: kendali ruang coba".
- Bisa dimainkan hanya dengan keyboard di laptop (gerak dan peta besar).
- Kurangi gerak mematikan animasi tokoh dan denyut busur.
- Menyambung kembali sesudah wifi HP dimatikan 30 detik, kini di atas dunia.
