# Design System — Sehari Setara

| | |
|---|---|
| Versi | 0.2 (draf) |
| Tanggal | 19 Oktober 2026 |
| Perubahan 0.2 | Aset digambar dengan kode oleh Claude (bagian 12); palet 36 warna; desain Nara, Ibu, Gita, dan latar adegan 1 disetujui |
| Berlaku untuk | Semua layar, aset visual, animasi, dan suara game Sehari Setara |
| Dokumen terkait | `PRD.md`, `Architecture.md`, `AGENTS.md` |

---

## 1. Arah visual

**Retro 8-bit yang cerah dan bersahabat.** Gayanya mengambil rasa konsol rumahan era awal 1980-an, tetapi suasananya seperti hari sekolah yang terang.

**Yang diambil dari gambar acuan**

- Piksel besar dan tegas, tanpa anti-aliasing.
- Garis pindai (*scanline*) horizontal di seluruh layar.
- Warna datar tanpa gradasi halus; palet terbatas.
- Komposisi seperti panggung: ruangan dilihat dari depan, tokoh berdiri di satu garis lantai.
- Wajah sederhana: mata beberapa piksel, ekspresi dibaca dari bentuk mata, mulut, dan sikap tubuh.

**Yang sengaja diubah**

| Acuan | Sehari Setara |
|---|---|
| Ruang gelap, dinding abu-abu kusam | Ruang terang dengan cahaya matahari atau lampu hangat |
| Garis pindai pekat | Garis pindai tipis (opasitas sekitar 10%) |
| Hitam murni sebagai garis dan bayangan | Biru tinta tua `#1F2A44` sebagai warna tergelap |
| Nuansa misterius dan menegangkan | Ramah, hangat, tidak menghakimi |
| Kostum maskot dan tokoh berwajah kosong | Tokoh manusia biasa dengan ekspresi jelas |

**Penting:** gambar acuan berasal dari game yang sudah ada. Kita hanya meminjam **ciri gayanya**. Tokoh, maskot, kostum, logo, dan suasana horornya tidak boleh muncul dalam bentuk apa pun.

### Ciri khas yang paling diingat: "Langit sehari"

Satu elemen yang menjadi identitas game: **warna langit dan bilah atas berubah mengikuti jam** dalam cerita. Pagi berwarna persik keemasan, siang biru terang, sore jingga, dan malam ungu kebiruan dengan cahaya lampu hangat. Di bilah atas, ikon matahari berjalan di sepanjang **busur hari** dengan enam titik jam (06.15 → 20.00). Elemen lain dibuat tenang dan disiplin agar ciri ini menonjol.

## 2. Prinsip

1. **Terbaca dari bangku belakang.** Teks besar, kontras tinggi, kalimat pendek. Bila ragu, perbesar.
2. **Satu layar, satu keputusan.** Saat memilih, yang tampil hanya situasi, pertanyaan, dan tiga pilihan.
3. **Ramah, bukan menghakimi.** Pilihan yang kurang tepat dijelaskan dengan nada mengajak, bukan mengejek. Tidak ada layar "kalah".
4. **Retro sebagai rasa, bukan hambatan.** Efek retro tidak boleh mengurangi keterbacaan atau aksesibilitas.

## 3. Kanvas, skala, dan tata letak

### Kanvas panggung

| Properti | Nilai |
|---|---|
| Resolusi logis panggung | **320 × 180** piksel (16:9) |
| Grid dasar | 4 piksel logis; ubin latar 16 × 16 |
| Skala | Kelipatan bulat (×2, ×3, ×4) bila menyisakan ruang < 25%; selain itu skala pecahan dengan `image-rendering: pixelated` |
| Garis lantai | y = 156 (baris terbawah sprite tokoh, yaitu garis luar di bawah sepatu, berada di sini) |
| Zona tokoh | y 84–156; tokoh tidak melewati x < 12 atau x > 308 |
| Teks di dalam gambar | **Tidak ada.** Semua teks ditampilkan oleh antarmuka |

### Tata letak layar (16:9)

```
┌──────────────────────────────────────────────────────────┐
│ Busur hari  ☀ ─●──●──○──○──○──○                Adegan 2/6 │
├────────────┬──────────────────────────────┬──────────────┤
│ Hak orang  │                              │ Tim  ★ skor  │
│ lain ▮▮▮▮▯ │       PANGGUNG 320×180       │ ▶ Tim Mangga │
│            │       (latar + tokoh)        │   Tim Laut   │
│ Kewajiban  │                              │              │
│ ▮▮▮▯▯      │                              │ Diskusi 0:42 │
├────────────┴──────────────────────────────┴──────────────┤
│ Narasi / pertanyaan                                      │
│ [A  pilihan…]      [B  pilihan…]      [C  pilihan…]      │
└──────────────────────────────────────────────────────────┘
```

- Bilah atas: sekitar 8% tinggi layar. Panel bawah: sekitar 30%.
- Panggung berada di tengah. Panel kiri berisi indikator, panel kanan berisi tim dan pengatur waktu.
- Pada layar 4:3, sisa ruang menjadi bingkai berwarna `--ss-ink`.
- Teks rata kiri di panel; judul layar dan kartu akhir rata tengah.

### Lapisan (urutan tumpukan)

| z | Lapisan |
|---|---|
| 0 | Latar |
| 10 | Properti depan (meja, pagar) |
| 20 | Tokoh |
| 30 | Efek (konfeti piksel, ikon emosi) |
| 40 | Garis pindai dan vinyet |
| 50+ | Antarmuka HTML (teks tajam, tidak ikut diskalakan sebagai piksel) |

## 4. Warna

Palet terbatas **36 warna**. Aset gambar **hanya** boleh memakai warna di tabel ini. Sumber tunggalnya adalah `scripts/game/art/palette.json`; nama konstanta di kode ditulis dalam kurung, misalnya `ink` (`INK`).

### Netral

| Token | Hex | Pemakaian |
|---|---|---|
| `ink` | `#1F2A44` | Garis luar, teks utama, warna tergelap |
| `dusk` | `#3A4A6B` | Teks sekunder, bayangan kain gelap |
| `slate` | `#6B7A99` | Bayangan dinding, ikon nonaktif (bukan untuk teks kecil) |
| `mist` | `#C9D4E5` | Dinding terang, batas panel |
| `cream` | `#FFF6E0` | Latar panel dan kartu |
| `white` | `#FFFFFF` | Kilau, kertas, seragam |

### Aksen

| Token | Hex | Pemakaian |
|---|---|---|
| `sun` | `#FFD23F` | Fokus, tombol aktif, matahari, bintang |
| `mango` | `#FF9F1C` | Peringatan, dampak "kurang tepat", detik terakhir |
| `coral` | `#FF6B5B` | Dampak "berisiko" |
| `rose` | `#FF8FB8` | Pipi, bunga, dekorasi |
| `berry` | `#9B5DE5` | Aksen dekorasi |
| `teal` | `#2EC4B6` | Indikator "Hak orang lain terjaga" |
| `leaf` | `#8AD95B` | Dampak "tepat", tanaman |
| `grass` | `#3BA55C` | Bayangan daun, rumput |
| `sky-d` | `#3A86D9` | Indikator "Kewajiban dijalankan", informasi |
| `navy` | `#2B3F8C` | Celana/rok seragam SMP |

### Langit per waktu

| Waktu | Adegan | Warna langit (atas → bawah) | Nuansa cahaya |
|---|---|---|---|
| Pagi | 1, 2 | `#9ED8F5` → `#FFF1C9` → `#FFD9A8` | Hangat keemasan |
| Siang | 3, 4 | `#6EC6F2` → `#A8E2FA` → `#E8F8FF` | Terang netral |
| Sore | 5 | `#FFE3A3` → `#FFC27A` → `#FF9E6B` | Jingga |
| Malam | 6 | `#4A4F9C` → `#6D6FC7`, lampu `#F7D774` | Ruang dalam yang hangat; langit gelap hanya terlihat di jendela |

### Kulit, rambut, dan kayu

| Token | Hex |
|---|---|
| `skin-1` … `skin-4` | `#FFDDBE`, `#F1B98A`, `#C98A5B`, `#8C5A3C` |
| `hair-1`, `hair-2` | `#2B1E1A`, `#5A3B2E` |
| `wood`, `wood-d` | `#C98B4F`, `#8A5A33` |

### Aturan kontras (sudah dihitung)

| Pasangan | Rasio | Status |
|---|---|---|
| `ink` di atas `cream` | 13,3 : 1 | Teks utama |
| `ink` di atas `sun` | 9,9 : 1 | Tombol fokus |
| `ink` di atas `leaf` / `mango` / `coral` | 8,3 / 6,9 / 5,1 : 1 | Judul kartu dampak |
| `ink` di atas `teal` / `sky` (`#6EC6F2`) | 6,6 / 7,5 : 1 | Label indikator |
| `dusk` di atas `cream` | 8,2 : 1 | Teks sekunder |
| `slate` di atas `cream` | 4,0 : 1 | **Jangan** untuk teks kecil |
| Putih di atas `grass` / `sky-d` | 3,1 / 3,8 : 1 | **Jangan** untuk teks |

Aturan praktis: **teks di atas warna aksen selalu memakai `ink`**, bukan putih.

### Token antarmuka (CSS)

```css
:root {
  --ss-ink: #1F2A44;  --ss-dusk: #3A4A6B;  --ss-mist: #C9D4E5;
  --ss-cream: #FFF6E0; --ss-white: #FFFFFF;
  --ss-sun: #FFD23F;  --ss-mango: #FF9F1C; --ss-coral: #FF6B5B;
  --ss-leaf: #8AD95B; --ss-teal: #2EC4B6;  --ss-sky-d: #3A86D9;

  --ss-surface: var(--ss-cream);
  --ss-text: var(--ss-ink);
  --ss-text-2: var(--ss-dusk);
  --ss-focus: var(--ss-sun);
  --ss-tier-tepat: var(--ss-leaf);
  --ss-tier-kurang: var(--ss-mango);
  --ss-tier-berisiko: var(--ss-coral);
  --ss-meter-hak: var(--ss-teal);
  --ss-meter-kewajiban: var(--ss-sky-d);
}
```

## 5. Tipografi

| Peran | Huruf | Catatan |
|---|---|---|
| Judul layar, judul adegan, angka besar | **Press Start 2P** | Maksimal 6 kata; tidak untuk paragraf |
| Narasi, dialog, pilihan, label | **Pixelify Sans** | Piksel tetapi tetap mudah dibaca dalam kalimat panjang |
| Cadangan | `monospace` | Bila huruf gagal dimuat |

Keduanya berlisensi SIL Open Font License dan dipasang dari paket `@fontsource`, bukan dari CDN.

### Skala ukuran

Satuan dasar `--u: min(1vh, 0.5625vw)`. Pada layar 1280×720, 1u = 7,2 px.

| Gaya | Ukuran | Tinggi baris | Contoh di 1280×720 |
|---|---|---|---|
| Judul layar | 4,4u | 1,2 | 32 px |
| Judul adegan | 2,8u | 1,3 | 20 px (Press Start 2P) |
| Narasi dan dialog | 3,6u | 1,35 | 26 px |
| Teks pilihan | 3,1u | 1,3 | 22 px |
| Label kecil | 2,5u | 1,3 | 18 px (batas minimum) |

**Aturan menulis:** huruf kapital hanya di awal kalimat (*sentence case*), tanpa paragraf huruf besar semua. Satu baris dialog paling banyak sekitar 60 karakter. Narasi per layar paling banyak 3 kalimat.

## 6. Efek layar

- **Garis pindai:** garis horizontal 1 px layar setiap 3 px layar, warna `ink` dengan opasitas 10%, di atas panggung saja.
- **Vinyet:** bayangan tepi sangat tipis (opasitas ≤ 12%) di panggung.
- **Tanpa kedip.** Tidak ada efek layar berkedip, *glitch*, atau guncangan kuat, demi kenyamanan dan keamanan siswa yang peka cahaya.
- **Piksel tajam:** `image-rendering: pixelated`, posisi selalu bilangan bulat piksel logis, tanpa blur dan tanpa bayangan lembut. Bayangan antarmuka berupa geser keras 1 piksel logis berwarna `ink`.

## 7. Komponen antarmuka

Semua panel memakai **bingkai piksel**: garis `ink` 2 px, sudut terpotong satu piksel, sorotan `white` 1 px di sisi atas-dalam, latar `cream`.

| Komponen | Isi dan perilaku |
|---|---|
| **Busur hari** | Enam titik jam; titik lewat terisi `sun`, titik berjalan berdenyut pelan, titik berikutnya kosong. Latar bilah mengikuti warna langit adegan |
| **Kotak narasi/dialog** | Label nama penutur di tab kiri atas. Teks muncul per huruf (bisa dimatikan); klik atau Spasi menampilkan seluruh teks sekaligus |
| **Tombol pilihan A/B/C** | Status: biasa (`cream`), fokus/arah (`sun` + kursor ▶), dipilih (`sun` + garis tebal), nonaktif (`mist`, teks `dusk`). Huruf A/B/C dalam kotak di kiri. Pintasan tombol 1/2/3 |
| **Indikator** | Dua batang 10 segmen dengan ikon dan label: "Hak orang lain terjaga" (ikon perisai-hati, `teal`) dan "Kewajiban dijalankan" (ikon tangan-centang, `sky-d`). Nilai angka di ujung. Saat berubah, segmen terisi atau terkosongkan satu per satu dan muncul angka melayang "+15" atau "−10" |
| **Kartu dampak** | Kepala kartu berwarna sesuai tingkat (`leaf` tepat, `mango` kurang tepat, `coral` berisiko) dengan ikon dan tulisan tingkat. Isi: "Yang terjadi", "Hak yang terdampak", "Kewajiban terkait", "Rujukan". Tombol "Lanjut" |
| **Pengatur waktu** | Batang 12 blok plus angka menit:detik. Sepuluh detik terakhir berwarna `mango` dengan bunyi tik pelan. Saat habis: tulisan "Waktunya memilih", tidak memilih otomatis. Tombol jeda, +30 detik, dan lewati |
| **Papan tim** | Setiap tim punya warna **dan bentuk** (lingkaran, segitiga, persegi, bintang) agar tidak bergantung pada warna saja. Tim aktif ditandai ▶ dan tulisan "Giliran". Jumlah bintang alasan di kanan |
| **Bintang alasan** | Tiga tombol: 0, 1, 2 bintang. Bintang muncul dengan animasi pop 3 bingkai |
| **Kuis peran** | Empat kartu peran dengan ikon (polisi, jaksa, advokat, hakim). Setelah dijawab, keempat kartu terbuka dan menampilkan tugas masing-masing |
| **Layar akhir** | Ilustrasi penuh panggung, judul akhir, dua kalimat pesan, posisi akhir kedua indikator, dan timbangan piksel yang miring atau seimbang |
| **Rekap** | Enam baris: adegan, pilihan kelas, tanda tingkat, pilihan yang paling menjaga keseimbangan, rujukan |
| **Pengaturan** | Suara, kurangi gerak, teks muncul per huruf, durasi diskusi |

Nama tim bawaan: Tim Mangga (`mango`, lingkaran), Tim Laut (`sky-d`, segitiga), Tim Daun (`leaf`, persegi), Tim Mentari (`sun`, bintang).

## 8. Gerak dan animasi

| Hal | Aturan |
|---|---|
| Karakter gerak | Bertahap (`steps()`), bukan halus; ini yang memberi kesan retro |
| Kecepatan sprite | Diam dan bicara 2–4 bingkai per detik; berjalan 6–8 bingkai per detik |
| Durasi antarmuka | 120–400 ms |
| Pergantian adegan | Sapuan blok piksel 400 ms ke arah kanan, mengikuti matahari |
| Reaksi setelah memilih | Ganti pose tokoh + ikon emosi kecil di atas kepala (hati, tetes keringat, tanda tanya), 1–1,5 detik |
| Momen utama | Satu-satunya animasi besar ada di layar akhir: timbangan bergerak ke posisi akhirnya |
| Kurangi gerak | Bila `prefers-reduced-motion` atau pengaturan aktif: pergantian adegan menjadi pudar 150 ms, tanpa sapuan, tanpa angka melayang, sprite tetap di bingkai pertama |

## 9. Suara (P1)

Efek chiptune pendek (≤ 1 detik), volume bawaan 60%, bisa dimatikan.

| Peristiwa | Karakter bunyi |
|---|---|
| Arahkan/pilih | Klik tinggi singkat |
| Konfirmasi pilihan | Dua nada naik |
| Dampak tepat | Arpeggio ceria |
| Dampak kurang tepat/berisiko | Nada rendah lembut, tidak mengagetkan |
| Detik terakhir | Tik pelan |
| Akhir hari | Jingle 3–4 detik sesuai jenis akhir |

Bunyi dapat dibuat dengan generator efek retro seperti jsfxr (hasilnya bebas dipakai). Simpan sebagai MP3.

## 10. Tokoh

### Proporsi

- Gaya *chibi* ringan: tinggi kepala sekitar sepertiga tinggi badan.
- Tinggi tokoh: anak SD 46 px, siswa SMP 60 px, dewasa 66 px.
- Ukuran kanvas sprite (termasuk margin 1 px untuk garis luar): anak SD **24×48**, siswa SMP **26×62**, dewasa **30×68**. Tokoh di atas kendaraan boleh lebih lebar.
- Ukuran acuan siswa SMP (dari desain Nara yang disetujui): kepala 18×18 dengan sudut terpotong, rambut 7 baris di atas dan menutup sisi belakang, mata 2×2 di kolom 12 dan 16 kepala, leher 4×2, badan 14 px lebar, lengan 3 px, kaki 5 px, sepatu 7×3.
- Garis luar 1 px `ink` hanya di tepi siluet; garis dalam memakai warna bayangan, bukan `ink`.
- Setiap bahan paling banyak 3 tingkat warna (dasar, bayangan, sorotan).
- Mata 2×2 px `ink`; ekspresi dari alis, mulut 1–3 px, dan sikap tubuh.
- Seragam SMP: kemeja putih lengan pendek, celana/rok `navy`, ikat pinggang `ink`.

### Daftar tokoh

| Tokoh | Peran | Ciri visual |
|---|---|---|
| Nara | Tokoh utama, siswa kelas IX | Rambut hitam pendek berponi (`hair-1`), kulit `skin-2`, kemeja putih, celana `navy`, tas punggung `sun` bertali `mango`. **Disetujui** |
| Ibu | Ibu Nara | Kulit `skin-3`, rambut `hair-2` bersanggul, daster `rose` bermotif titik putih-kuning, keranjang pasar berisi sayur. **Disetujui** |
| Gita | Adik Nara, kelas 3 SD | Kulit `skin-1`, rambut dikuncir dengan ikat `coral`, kemeja putih, rok `coral`, kaus kaki putih. **Disetujui** |
| Dimas | Teman sekelas | Seragam SMP, jaket `sky-d`, di atas motor |
| Sinta | Teman sekelas | Seragam SMP, berkerudung putih |
| Bu Ratih | Guru BK | Kemeja batik `teal`, kacamata |
| Komang | Adik kelas VII | Seragam SMP sedikit kebesaran, sepatu robek |
| Pak Made | Tetangga | Kaus `mango`, sarung kotak-kotak |
| Bayu | Pemuda yang baru pindah | Kaus polos `mist`, ekspresi bingung; **digambarkan netral dan ramah** |
| Polisi | Kartu peran | Seragam cokelat rapi, sikap membantu |

### Pose wajib

| Pose | Bingkai | Keterangan |
|---|---|---|
| `idle` | 2 | Bernapas pelan |
| `talk` | 2 | Mulut membuka-menutup |
| `happy` | 1–2 | Senyum, tangan sedikit naik |
| `sad` | 1–2 | Menunduk atau khawatir |
| Khusus | 2–4 | Contoh: Nara berjalan (4), Nara menggandeng Gita, Komang menunduk memegang sepatu, Pak Made menunjuk, Dimas di atas motor |

Tokoh yang menghadap berlawanan cukup dicerminkan secara horizontal, kecuali detail asimetris yang jelas.

## 11. Latar dan aset lain

| Aset | Ukuran | Isi wajib |
|---|---|---|
| `bg_title` | 320×180 | Jalan kampung pagi, rumah, sekolah di kejauhan, matahari terbit |
| `bg_s1_rumah_pagi` | 320×180 | Dapur dan ruang depan, jendela sinar pagi, jam dinding |
| `bg_s2_jalan_pagi` | 320×180 | Tepi jalan dekat sekolah, trotoar, rambu, angkot di kejauhan |
| `bg_s3_kelas_siang` | 320×180 | Ruang kelas, papan tulis kosong, meja kelompok |
| `bg_s4_koridor_siang` | 320×180 | Koridor/kantin sekolah, tanaman, papan pengumuman tanpa tulisan |
| `bg_s5_kampung_sore` | 320×180 | Warung dengan kamera CCTV kecil, pos ronda, langit jingga |
| `bg_s6_kamar_malam` | 320×180 | Kamar Nara, meja belajar, lampu meja hangat, layar HP menyala (tanpa tulisan) |
| `end_setara`, `end_hampir`, `end_berat` | 320×180 | Nara di teras malam; suasana bahagia, merenung, dan termenung tetapi berharap |
| Ikon antarmuka | 16×16 | Perisai-hati, tangan-centang, bintang, jam, suara, layar penuh, empat bentuk tim |
| Ikon peran | 32×32 | Polisi, jaksa, advokat, hakim |
| Ikon emosi | 8×8 | Hati, tetes keringat, tanda tanya, tanda seru |

Latar harus menyisakan **lantai kosong** di y 130–170 agar tokoh terlihat jelas, dan tidak boleh berisi teks, logo, atau merek. Latar `bg_s1_rumah_pagi` sudah **disetujui** dan menjadi acuan gaya latar lainnya: dinding bergaris vertikal lembut, panel kayu, lantai papan, cahaya jendela berpola papan catur.

Status setiap aset dicatat di `Daftar_Aset.md`.

## 12. Pembuatan aset dengan kode

Semua aset gambar **digambar lewat kode** (Python + Pillow) oleh Claude di proyek claude.ai, lalu ditinjau dan disetujui pengembang. **Kode adalah sumber utama**; file PNG hanyalah hasil bangunnya.

### Kit gambar (`scripts/game/art/`)

| File | Isi |
|---|---|
| `palette.json` | 36 warna resmi |
| `pixelart.py` | Kanvas dan alat gambar: `r`, `hl`, `vl`, `disc`, `ring`, `dither`, `outline`, `place`, serta `flip`, `strip`, `scanlines`, `palette_violations` |
| `tokoh.py` | Fungsi tokoh dengan parameter pose dan bingkai (`student`, `mother`, `kid`, …) |
| `latar.py` | Satu fungsi per latar (`bg_s1_rumah_pagi`, …) |
| `build_assets.py` | Daftar aset (`ASSETS`), pratinjau (`PREVIEW_SCENES`, `POSE_SHEETS`), ekspor PNG, dan pemeriksaan otomatis |

### Aturan menggambar

1. Warna hanya dari konstanta palet (`INK`, `SUN`, `PAGI1`, …). Jangan menulis nilai RGB langsung.
2. Tokoh digambar **menghadap kanan** di kanvas bermargin 1 px; `outline()` dipanggil paling akhir; arah sebaliknya memakai `flip()`.
3. Ukuran mengikuti bagian 10 dan 11. Sprite diletakkan dengan `place()` agar baris terbawahnya tepat di garis lantai.
4. Tokoh baru **memakai ulang** fungsi dan proporsi tokoh yang sudah disetujui, cukup mengganti parameter (warna, rambut, aksesori), agar semua tokoh terasa satu keluarga gaya.
5. Cahaya dan bayangan besar memakai `dither()` (pola papan catur), bukan gradasi.
6. Tanpa teks, angka, logo, atau merek di dalam gambar. Jarum jam boleh.
7. Hanya ciri gaya di bagian 1 yang diambil dari gambar acuan. Tokoh, maskot, kostum, poster, dan ruangan dari game acuan maupun karya lain **tidak boleh ditiru**.

### Alur kerja per kelompok aset

1. Pilih kelompok aset berikutnya dari `Daftar_Aset.md` (urutan: tokoh → latar → judul dan akhir → antarmuka).
2. Gambar di kit; daftarkan di `ASSETS`, dan tambahkan pratinjau di `PREVIEW_SCENES` atau `POSE_SHEETS`.
3. Jalankan `python scripts/game/art/build_assets.py`. Hasilnya harus "Semua pemeriksaan lulus".
4. Periksa sendiri pratinjau (adegan ×4 dengan garis pindai, lembar pose ×6) dengan daftar periksa di bawah, lalu perbaiki.
5. Kirim pratinjau ke pengembang dan revisi sampai disetujui.
6. Ubah status di `Daftar_Aset.md` menjadi "Disetujui" beserta tanggalnya; simpan kode kit dan PNG hasilnya bersama-sama.

**Mengubah aset:** ubah kodenya, lalu bangun ulang. Jangan menyunting PNG secara manual, karena perubahan itu akan hilang saat aset dibangun ulang.

### Daftar periksa setiap aset

- [ ] `build_assets.py` lulus: tidak ada warna di luar palet, tidak ada piksel semi-transparan, ukuran latar benar, total dalam anggaran.
- [ ] Siluet mudah dikenali pada skala 1× dan pada pratinjau ×4 dari jarak jauh.
- [ ] Proporsi, garis luar, dan gaya selaras dengan Nara dan latar adegan 1 yang sudah disetujui.
- [ ] Tokoh berdiri tepat di garis lantai, tidak terpotong, dan menghadap sesuai adegan.
- [ ] Latar menyisakan lantai kosong di y 130–170.
- [ ] Tidak ada teks, logo, atau merek.
- [ ] **Tidak mirip** tokoh, maskot, atau logo dari game, film, atau kartun yang sudah ada.
- [ ] Tidak ada kekerasan fisik; perundungan ditunjukkan lewat ekspresi dan jarak, bukan pukulan.
- [ ] Tidak memuat stereotip; warna kulit beragam; tokoh berwenang digambarkan membantu.

## 13. Kredit dan atribusi

Cantumkan di layar "Tentang" game dan di flipbook:

- Aset visual digambar dengan kode oleh Claude (Anthropic) berdasarkan arahan dan persetujuan [nama pengembang].
- Huruf Press Start 2P dan Pixelify Sans, SIL Open Font License 1.1.
- Efek suara dibuat dengan [nama alat], [lisensi].
