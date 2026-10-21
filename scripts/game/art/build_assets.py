"""Bangun semua aset Sehari Setara dari kode, lalu periksa.

Pemakaian (dari folder repo):
    python scripts/game/art/build_assets.py
    python scripts/game/art/build_assets.py --only char_nara_idle --out /tmp/aset --preview /tmp/pratinjau

Hasil:
    <out>/bg/*.png, <out>/sprites/*.png, <out>/ui/*.png, <out>/end/*.png   (ukuran asli 1x)
    <preview>/adegan_*.png  (x4 + garis pindai)   <preview>/pose_*.png (x6)
Pemeriksaan: warna di luar palet, piksel semi-transparan, ukuran, total anggaran, dan bidang antarmuka
yang harus tetap berupa langit polos (CALM_ZONES).
"""
import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from pixelart import *          # noqa: E402,F401,F403
from tokoh import (student, mother, kid, dimas, sinta, ratih, komang,   # noqa: E402
                   siswa_merekam, siswa_tertawa, made, bayu, warga_a, warga_b, nara_duduk, NARA_RUMAH)
from latar import (bg_s1_rumah_pagi, bg_s2_jalan_pagi, bg_s3_kelas_siang,   # noqa: E402
                   bg_s4_koridor_siang, bg_s5_kampung_sore, bg_s6_kamar_malam,
                   bg_title, end_setara, end_hampir, end_berat, TITLE_ZONE, END_SCALE_ZONE)
from ikon import (ui_hak, ui_kewajiban, ui_star, ui_clock, ui_sound_on, ui_sound_off,   # noqa: E402
                  ui_fullscreen, ui_team, role_icon, emote, ui_timbangan)

if HERE.parts[-3:] == ("scripts", "game", "art"):      # berada di dalam repositori
    REPO = HERE.parents[2]
    DEFAULT_OUT = REPO / "app" / "sehari-setara" / "assets"
    DEFAULT_PREVIEW = REPO / "docs" / "sehari-setara" / "preview"
else:                                                 # dijalankan di folder lepas (mis. chat)
    DEFAULT_OUT = HERE / "out" / "aset"
    DEFAULT_PREVIEW = HERE / "out" / "pratinjau"

# ---------------------------------------------------------------------------
# Daftar aset: nama file -> (folder, fungsi yang mengembalikan Image)
# Tambahkan entri baru di sini setiap kali aset baru selesai digambar,
# lalu perbarui Daftar_Aset.md.
# ---------------------------------------------------------------------------
ASSETS = {
    "bg_s1_rumah_pagi": ("bg", lambda: bg_s1_rumah_pagi().im),
    "char_nara_idle": ("sprites", lambda: strip([student("idle", 0), student("idle", 1)])),
    "char_nara_talk": ("sprites", lambda: strip([student("talk", 0), student("talk", 1)])),
    "char_nara_happy": ("sprites", lambda: strip([student("happy")])),
    "char_nara_sad": ("sprites", lambda: strip([student("sad")])),
    "char_nara_walk": ("sprites", lambda: strip([student("walk", i) for i in range(4)])),
    "char_ibu_talk": ("sprites", lambda: strip([mother("talk", 0), mother("talk", 1)])),
    "char_gita_idle": ("sprites", lambda: strip([kid("idle")])),
    "char_gita_happy": ("sprites", lambda: strip([kid("happy")])),
    # Batch A1 (Disetujui 21 Okt)
    "char_nara_phone": ("sprites", lambda: strip([student("phone", 0, **NARA_RUMAH), student("phone", 1, **NARA_RUMAH)])),
    "char_ibu_happy": ("sprites", lambda: strip([mother("happy")])),
    "char_ibu_sad": ("sprites", lambda: strip([mother("sad")])),
    "char_gita_sad": ("sprites", lambda: strip([kid("sad")])),
    # Batch A2 (Disetujui 21 Okt)
    "char_dimas_motor": ("sprites", lambda: strip([dimas("offer", 0), dimas("offer", 1)])),
    "char_dimas_happy": ("sprites", lambda: strip([dimas("happy")])),
    "char_dimas_sad": ("sprites", lambda: strip([dimas("sad")])),
    "char_sinta_idle": ("sprites", lambda: strip([sinta("idle", 0), sinta("idle", 1)])),
    "char_sinta_talk": ("sprites", lambda: strip([sinta("talk", 0), sinta("talk", 1)])),
    "char_sinta_happy": ("sprites", lambda: strip([sinta("happy")])),
    "char_sinta_sad": ("sprites", lambda: strip([sinta("sad")])),
    # Batch A3 (Disetujui 21 Okt)
    "char_ratih_idle": ("sprites", lambda: strip([ratih("idle", 0), ratih("idle", 1)])),
    "char_ratih_talk": ("sprites", lambda: strip([ratih("talk", 0), ratih("talk", 1)])),
    "char_komang_idle": ("sprites", lambda: strip([komang("idle", 0), komang("idle", 1)])),
    "char_komang_sad": ("sprites", lambda: strip([komang("shoe", 0), komang("shoe", 1)])),
    "char_komang_happy": ("sprites", lambda: strip([komang("happy")])),
    "char_siswa_merekam": ("sprites", lambda: strip([siswa_merekam(0), siswa_merekam(1)])),
    "char_siswa_tertawa": ("sprites", lambda: strip([siswa_tertawa(0), siswa_tertawa(1)])),
    # Batch A4 (Disetujui 21 Okt)
    "char_made_talk": ("sprites", lambda: strip([made("talk", 0), made("talk", 1)])),
    "char_made_happy": ("sprites", lambda: strip([made("happy")])),
    "char_made_sad": ("sprites", lambda: strip([made("sad")])),
    "char_bayu_idle": ("sprites", lambda: strip([bayu("idle", 0), bayu("idle", 1)])),
    "char_bayu_happy": ("sprites", lambda: strip([bayu("happy")])),
    "char_warga_a": ("sprites", lambda: strip([warga_a(0), warga_a(1)])),
    "char_warga_b": ("sprites", lambda: strip([warga_b(0), warga_b(1)])),
    # Batch B1 (Disetujui 21 Okt)
    "bg_s2_jalan_pagi": ("bg", lambda: bg_s2_jalan_pagi().im),
    "bg_s3_kelas_siang": ("bg", lambda: bg_s3_kelas_siang().im),
    # Batch B2 (Disetujui 21 Okt)
    "bg_s4_koridor_siang": ("bg", lambda: bg_s4_koridor_siang().im),
    "bg_s5_kampung_sore": ("bg", lambda: bg_s5_kampung_sore().im),
    "bg_s6_kamar_malam": ("bg", lambda: bg_s6_kamar_malam().im),
    # Batch C (Disetujui 21 Okt). Ilustrasi akhir tanpa timbangan: timbangan D-10 dianimasikan antarmuka di END_SCALE_ZONE.
    "bg_title": ("bg", lambda: bg_title().im),
    "end_setara": ("end", lambda: end_setara().im),
    "end_hampir": ("end", lambda: end_hampir().im),
    "end_berat": ("end", lambda: end_berat().im),
    # Batch D (Disetujui 21 Okt). Ikon antarmuka di folder ui/
    "ui_hak": ("ui", lambda: ui_hak().im),
    "ui_kewajiban": ("ui", lambda: ui_kewajiban().im),
    "ui_star": ("ui", lambda: strip([ui_star(0), ui_star(1), ui_star(2)])),        # pop 3 bingkai
    "ui_clock": ("ui", lambda: ui_clock().im),
    "ui_sound_on": ("ui", lambda: ui_sound_on().im),
    "ui_sound_off": ("ui", lambda: ui_sound_off().im),
    "ui_fullscreen": ("ui", lambda: ui_fullscreen().im),
    "ui_team_lingkaran": ("ui", lambda: ui_team("lingkaran").im),
    "ui_team_segitiga": ("ui", lambda: ui_team("segitiga").im),
    "ui_team_persegi": ("ui", lambda: ui_team("persegi").im),
    "ui_team_bintang": ("ui", lambda: ui_team("bintang").im),
    "role_polisi": ("ui", lambda: role_icon("polisi").im),
    "role_jaksa": ("ui", lambda: role_icon("jaksa").im),
    "role_advokat": ("ui", lambda: role_icon("advokat").im),
    "role_hakim": ("ui", lambda: role_icon("hakim").im),
    "emote_hati": ("ui", lambda: emote("hati").im),
    "emote_keringat": ("ui", lambda: emote("keringat").im),
    "emote_tanya": ("ui", lambda: emote("tanya").im),
    "emote_seru": ("ui", lambda: emote("seru").im),
    "ui_timbangan": ("ui", lambda: strip([ui_timbangan(i) for i in range(5)])),   # 5 bingkai
}

# Komposisi pratinjau adegan: latar + (sprite, posisi tengah x, cermin?) [+ warna bayangan kaki, bawaan WOODD]
PREVIEW_SCENES = {
    "adegan_1_rumah_pagi": (bg_s1_rumah_pagi, [
        (lambda: kid("happy"), 124, False),
        (lambda: student("idle"), 152, False),
        (lambda: mother("talk"), 206, True),
    ]),
    # Reaksi adegan 1: pilihan B (tepat) dan pilihan C (Nara menggerutu dan memarahi Gita)
    "adegan_1_reaksi_tepat": (bg_s1_rumah_pagi, [
        (lambda: kid("happy"), 124, False),
        (lambda: student("happy"), 152, False),
        (lambda: mother("happy"), 206, True),
    ]),
    "adegan_1_reaksi_kurang": (bg_s1_rumah_pagi, [
        (lambda: kid("sad"), 124, False),
        (lambda: student("talk", 0), 152, True),
        (lambda: mother("sad"), 206, True),
    ]),
    # Barisan pembanding skala dan gaya (bukan adegan): pose baru di samping pose acuan yang disetujui
    "barisan_keluarga": (bg_s1_rumah_pagi, [
        (lambda: kid("idle"), 28, False), (lambda: kid("sad"), 62, False),
        (lambda: student("idle"), 102, False), (lambda: student("phone", 0, **NARA_RUMAH), 138, False),
        (lambda: mother("talk"), 186, False), (lambda: mother("happy"), 230, False),
        (lambda: mother("sad"), 274, False),
    ]),
    # Barisan pembanding Batch A2 (bukan adegan; latar adegan 2 dan 3 dibuat di Batch B1)
    "barisan_a2": (bg_s1_rumah_pagi, [
        (lambda: dimas("offer", 0), 64, False), (lambda: student("idle"), 120, True),
        (lambda: sinta("idle"), 164, True), (lambda: sinta("happy"), 206, False),
        (lambda: dimas("happy"), 262, True),
    ]),
    # Barisan Batch A3 (bukan adegan; latar adegan 3 dan 4 dibuat di Batch B). Menguji jarak dan ekspresi:
    # Komang sendirian, dua siswa menertawakan dari kejauhan tanpa kontak fisik, Nara mengamati, Bu Ratih menjelaskan.
    "barisan_a3_ejekan": (bg_s1_rumah_pagi, [
        (lambda: komang("shoe", 0), 64, False), (lambda: siswa_merekam(0), 150, True),
        (lambda: siswa_tertawa(0), 184, True), (lambda: student("idle"), 236, True),
        (lambda: ratih("talk", 0), 288, True),
    ]),
    # Reaksi pilihan B adegan 4: Nara mendampingi Komang, Bu Ratih menanggapi laporan
    "barisan_a3_reaksi": (bg_s1_rumah_pagi, [
        (lambda: komang("happy"), 112, False), (lambda: student("happy"), 146, True),
        (lambda: ratih("talk", 0), 206, True),
    ]),
    # Barisan Batch A4 (bukan adegan; latar adegan 5 dibuat di Batch B2). Dua warga menuduh Bayu dari kejauhan;
    # Pak Made menunjuk ke arah warung tempat sepedanya diparkir (bukan ke Bayu), Nara ikut menoleh ke sana.
    "barisan_a4_tuduhan": (bg_s1_rumah_pagi, [
        (lambda: bayu("idle", 0), 40, False), (lambda: warga_a(0), 112, True), (lambda: warga_b(0), 146, True),
        (lambda: student("idle"), 210, False), (lambda: made("talk", 0), 262, False),
    ]),
    # Reaksi pilihan B adegan 5: rekaman CCTV membersihkan nama Bayu
    "barisan_a4_reaksi": (bg_s1_rumah_pagi, [
        (lambda: bayu("happy"), 118, False), (lambda: made("happy"), 170, True),
        (lambda: student("happy"), 218, True),
    ]),
    # Batch B1. Adegan 2: Dimas berhenti di bahu jalan dan menawarkan boncengan; Nara menoleh ke arahnya.
    "adegan_2_jalan_pagi": (bg_s2_jalan_pagi, [
        (lambda: dimas("offer", 0), 168, False), (lambda: student("idle"), 228, True),
    ], DUSK),  # noqa: F405
    # Pilihan B (tepat): Nara menolak dengan sopan dan mengingatkan helm; Dimas mengacungkan jempol
    "adegan_2_reaksi_tepat": (bg_s2_jalan_pagi, [
        (lambda: dimas("happy"), 168, False), (lambda: student("talk", 0), 228, True),
    ], DUSK),  # noqa: F405
    # Pilihan A/C (berisiko/kurang tepat): keduanya menunduk khawatir
    "adegan_2_reaksi_kurang": (bg_s2_jalan_pagi, [
        (lambda: dimas("sad"), 168, False), (lambda: student("sad"), 228, True),
    ], DUSK),  # noqa: F405
    # Adegan 3: Nara memaparkan usulan, Sinta memotong; Bu Ratih mendampingi kelompok lain di meja kanan
    "adegan_3_kelas_siang": (bg_s3_kelas_siang, [
        (lambda: student("talk", 0), 140, False), (lambda: sinta("talk", 0), 186, True),
        (lambda: ratih("idle", 0), 268, False),
    ], SLATE),  # noqa: F405
    # Pilihan B (tepat): saling mendengarkan, kelompok sepakat
    "adegan_3_reaksi_tepat": (bg_s3_kelas_siang, [
        (lambda: student("happy"), 140, False), (lambda: sinta("happy"), 186, True),
        (lambda: ratih("idle", 0), 268, False),
    ], SLATE),  # noqa: F405
    # Pilihan C (kurang tepat): Nara diam dan mengalah, Sinta terus bicara
    "adegan_3_reaksi_kurang": (bg_s3_kelas_siang, [
        (lambda: student("sad"), 140, False), (lambda: sinta("talk", 0), 186, True),
        (lambda: ratih("idle", 0), 268, False),
    ], SLATE),  # noqa: F405
    # Batch B2. Adegan 4: Komang sendirian memegang sepatu robek; dua siswa menertawakan dan merekam dari
    # kejauhan (tanpa kontak fisik); Nara melihat dari dekat kantin. Paling banyak 4 tokoh per adegan.
    "adegan_4_koridor_siang": (bg_s4_koridor_siang, [
        (lambda: komang("shoe", 0), 64, False), (lambda: siswa_merekam(0), 150, True),
        (lambda: siswa_tertawa(0), 184, True), (lambda: student("idle"), 236, True),
    ], WOOD),  # noqa: F405
    # Pilihan B (tepat): Nara mendampingi Komang, Bu Ratih menanggapi laporan
    "adegan_4_reaksi_tepat": (bg_s4_koridor_siang, [
        (lambda: komang("happy"), 112, False), (lambda: student("happy"), 146, True),
        (lambda: ratih("talk", 0), 206, True),
    ], WOOD),  # noqa: F405
    # Pilihan A/C (berisiko/kurang tepat): ejekan berlanjut, Nara diam
    "adegan_4_reaksi_kurang": (bg_s4_koridor_siang, [
        (lambda: komang("shoe", 1), 64, False), (lambda: siswa_merekam(1), 150, True),
        (lambda: siswa_tertawa(1), 184, True), (lambda: student("sad"), 236, True),
    ], WOOD),  # noqa: F405
    # Adegan 5: warga menuduh Bayu; Pak Made menunjuk ke depan warung tempat sepedanya diparkir (bukan ke Bayu);
    # Nara menoleh ke arah warung yang memiliki kamera CCTV.
    "adegan_5_kampung_sore": (bg_s5_kampung_sore, [
        (lambda: bayu("idle", 0), 40, False), (lambda: warga_a(0), 106, True),
        (lambda: student("idle"), 202, False), (lambda: made("talk", 0), 256, False),
    ], SLATE),  # noqa: F405
    # Pilihan B (tepat): rekaman CCTV membersihkan nama Bayu
    "adegan_5_reaksi_tepat": (bg_s5_kampung_sore, [
        (lambda: bayu("happy"), 118, False), (lambda: made("happy"), 170, True),
        (lambda: student("happy"), 218, True),
    ], SLATE),  # noqa: F405
    # Pilihan A/C (berisiko/kurang tepat): tuduhan berlanjut, sepeda belum ditemukan
    "adegan_5_reaksi_kurang": (bg_s5_kampung_sore, [
        (lambda: bayu("idle", 1), 40, False), (lambda: warga_a(1), 106, True),
        (lambda: student("sad"), 202, False), (lambda: made("sad"), 256, False),
    ], SLATE),  # noqa: F405
    # Adegan 6: Nara di kamarnya memegang HP (layar menyala tanpa tulisan), pakaian rumah
    "adegan_6_kamar_malam": (bg_s6_kamar_malam, [
        (lambda: student("phone", 0, **NARA_RUMAH), 168, False),
    ]),
    # Batch C. Layar judul dengan Nara berjalan ke sekolah (contoh; teks judul dan tombol dari antarmuka)
    "judul": (bg_title, [(lambda: student("walk", 1), 96, False)], WOOD),  # noqa: F405
    # Ilustrasi akhir sudah memuat Nara; tanpa tokoh tambahan
    "akhir_setara": (end_setara, []),
    "akhir_hampir": (end_hampir, []),
    "akhir_berat": (end_berat, []),
}

# Lembar pose untuk ditinjau: judul -> daftar (label, fungsi)
POSE_SHEETS = {
    "pose_nara": [("Diam 1", lambda: student("idle", 0)), ("Diam 2", lambda: student("idle", 1)),
                  ("Bicara", lambda: student("talk", 0)), ("Senang", lambda: student("happy")),
                  ("Sedih", lambda: student("sad")), ("Jalan 1", lambda: student("walk", 0)),
                  ("Jalan 2", lambda: student("walk", 1)), ("Jalan 3", lambda: student("walk", 2)),
                  ("Jalan 4", lambda: student("walk", 3)),
                  ("HP 1", lambda: student("phone", 0, **NARA_RUMAH)), ("HP 2", lambda: student("phone", 1, **NARA_RUMAH))],
    "pose_ibu": [("Bicara 1", lambda: mother("talk", 0)), ("Bicara 2", lambda: mother("talk", 1)),
                 ("Senang", lambda: mother("happy")), ("Khawatir", lambda: mother("sad"))],
    "pose_gita": [("Diam", lambda: kid("idle")), ("Senang", lambda: kid("happy")), ("Sedih", lambda: kid("sad"))],
    "pose_dimas": [("Motor 1", lambda: dimas("offer", 0)), ("Motor 2", lambda: dimas("offer", 1)),
                   ("Senang", lambda: dimas("happy")), ("Sedih", lambda: dimas("sad"))],
    "pose_sinta": [("Diam 1", lambda: sinta("idle", 0)), ("Diam 2", lambda: sinta("idle", 1)),
                   ("Bicara", lambda: sinta("talk", 0)), ("Senang", lambda: sinta("happy")),
                   ("Sedih", lambda: sinta("sad"))],
    "pose_ratih": [("Diam 1", lambda: ratih("idle", 0)), ("Diam 2", lambda: ratih("idle", 1)),
                   ("Bicara 1", lambda: ratih("talk", 0)), ("Bicara 2", lambda: ratih("talk", 1))],
    "pose_komang": [("Diam 1", lambda: komang("idle", 0)), ("Diam 2", lambda: komang("idle", 1)),
                    ("Sedih 1", lambda: komang("shoe", 0)), ("Sedih 2", lambda: komang("shoe", 1)),
                    ("Lega", lambda: komang("happy"))],
    "pose_siswa_adegan4": [("Merekam 1", lambda: siswa_merekam(0)), ("Merekam 2", lambda: siswa_merekam(1)),
                           ("Tertawa 1", lambda: siswa_tertawa(0)), ("Tertawa 2", lambda: siswa_tertawa(1))],
    "pose_made": [("Bicara 1", lambda: made("talk", 0)), ("Bicara 2", lambda: made("talk", 1)),
                  ("Senang", lambda: made("happy")), ("Sedih", lambda: made("sad"))],
    "pose_bayu": [("Diam 1", lambda: bayu("idle", 0)), ("Diam 2", lambda: bayu("idle", 1)),
                  ("Lega", lambda: bayu("happy"))],
    "pose_warga": [("Warga A 1", lambda: warga_a(0)), ("Warga A 2", lambda: warga_a(1)),
                   ("Warga B 1", lambda: warga_b(0)), ("Warga B 2", lambda: warga_b(1))],
    # Batch C: pose duduk Nara (hanya dipakai di ilustrasi akhir, bukan strip sprite tersendiri)
    "pose_nara_duduk": [("Bahagia", lambda: nara_duduk("happy")), ("Merenung", lambda: nara_duduk("think")),
                        ("Berharap", lambda: nara_duduk("hope"))],
    # Batch D: ikon antarmuka
    "ikon_antarmuka": [("Hak", ui_hak), ("Kewajiban", ui_kewajiban), ("Bintang 1", lambda: ui_star(0)),
                       ("Bintang 2", lambda: ui_star(1)), ("Bintang 3", lambda: ui_star(2)), ("Waktu", ui_clock),
                       ("Suara", ui_sound_on), ("Senyap", ui_sound_off), ("Layar", ui_fullscreen)],
    "ikon_tim": [("Mangga", lambda: ui_team("lingkaran")), ("Laut", lambda: ui_team("segitiga")),
                 ("Daun", lambda: ui_team("persegi")), ("Mentari", lambda: ui_team("bintang"))],
    "ikon_peran": [("Polisi", lambda: role_icon("polisi")), ("Jaksa", lambda: role_icon("jaksa")),
                   ("Advokat", lambda: role_icon("advokat")), ("Hakim", lambda: role_icon("hakim"))],
    "ikon_emosi": [("Hati", lambda: emote("hati")), ("Keringat", lambda: emote("keringat")),
                   ("Tanya", lambda: emote("tanya")), ("Seru", lambda: emote("seru"))],
    "ikon_timbangan": [("Miring kiri", lambda: ui_timbangan(0)), ("Sedikit kiri", lambda: ui_timbangan(1)),
                       ("Seimbang", lambda: ui_timbangan(2)), ("Sedikit kanan", lambda: ui_timbangan(3)),
                       ("Miring kanan", lambda: ui_timbangan(4))],
}

SIZE_RULES = {"bg": (320, 180), "end": (320, 180)}
# Ukuran pasti ikon (lebar strip = jumlah bingkai x lebar bingkai)
ICON_SIZES = {"ui_star": (48, 16), "ui_timbangan": (240, 32)}
for _n in ("ui_hak", "ui_kewajiban", "ui_clock", "ui_sound_on", "ui_sound_off", "ui_fullscreen",
           "ui_team_lingkaran", "ui_team_segitiga", "ui_team_persegi", "ui_team_bintang"):
    ICON_SIZES[_n] = (16, 16)
for _n in ("role_polisi", "role_jaksa", "role_advokat", "role_hakim"):
    ICON_SIZES[_n] = (32, 32)
for _n in ("emote_hati", "emote_keringat", "emote_tanya", "emote_seru"):
    ICON_SIZES[_n] = (8, 8)
# Bidang yang harus tetap berupa langit polos karena diisi antarmuka (judul; timbangan D-10)
CALM_ZONES = {
    "bg_title": (TITLE_ZONE, (PAGI1, PAGI2)),                 # noqa: F405
    "end_setara": (END_SCALE_ZONE, (MALAM1, MALAM2)),         # noqa: F405
    "end_hampir": (END_SCALE_ZONE, (MALAM1, MALAM2)),         # noqa: F405
    "end_berat": (END_SCALE_ZONE, (MALAM1, MALAM2)),          # noqa: F405
}
BUDGET_TOTAL = 4 * 1024 * 1024


def shadow(c, cx, w, col=WOODD):  # noqa: F405
    c.r(cx - w // 2, FLOOR_Y - 1, w, 2, col)  # noqa: F405


def build_previews(preview_dir, only=None):
    preview_dir.mkdir(parents=True, exist_ok=True)
    for name, (bg_fn, cast, *rest) in PREVIEW_SCENES.items():
        if only and name not in only:
            continue
        c = bg_fn()
        for fn, cx, mirrored in cast:
            spr = fn()
            spr = flip(spr) if mirrored else spr
            shadow(c, cx, spr.w - 6, *rest)
            c.place(spr, cx)
        scanlines(c.im).save(preview_dir / f"{name}.png")
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 30)
    except OSError:
        font = ImageFont.load_default()
    for name, poses in POSE_SHEETS.items():
        if only and name not in only:
            continue
        sprites = [(lab, fn()) for lab, fn in poses]
        k = 6
        cw = max(34, max(s.w for _, s in sprites) + 4) * k   # kolom melebar untuk sprite kendaraan
        hmax = max(s.h for _, s in sprites)
        sheet = Image.new("RGB", (cw * len(sprites) + 40, hmax * k + 110), CREAM[:3])  # noqa: F405
        d = ImageDraw.Draw(sheet)
        for i, (lab, spr) in enumerate(sprites):
            big = spr.im.resize((spr.w * k, spr.h * k), Image.NEAREST)
            sheet.paste(big, (20 + i * cw + (cw - big.width) // 2, 30 + (hmax - spr.h) * k), big)
            tw = d.textlength(lab, font=font)
            d.text((20 + i * cw + (cw - tw) / 2, hmax * k + 50), lab, font=font, fill=INK[:3])  # noqa: F405
        sheet.save(preview_dir / f"{name}.png")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--preview", type=Path, default=DEFAULT_PREVIEW)
    ap.add_argument("--only", nargs="*", help="nama aset/pratinjau tertentu saja")
    args = ap.parse_args()

    problems, total = [], 0
    for name, (folder, fn) in ASSETS.items():
        if args.only and name not in args.only:
            continue
        im = fn()
        bad = palette_violations(im)
        if bad:
            problems.append(f"{name}: {bad} piksel di luar palet/semi-transparan")
        rule = SIZE_RULES.get(folder) or ICON_SIZES.get(name)
        if rule and im.size != rule:
            problems.append(f"{name}: ukuran {im.size}, seharusnya {rule}")
        if name in CALM_ZONES:
            (x0, y0, x1, y1), sky = CALM_ZONES[name]
            px = im.convert("RGBA").load()
            busy = sum(1 for y in range(y0, y1 + 1) for x in range(x0, x1 + 1) if px[x, y] not in sky)
            if busy:
                problems.append(f"{name}: {busy} piksel bukan langit polos di bidang antarmuka {x0}-{x1}, {y0}-{y1}")
        out = args.out / folder / f"{name}.png"
        out.parent.mkdir(parents=True, exist_ok=True)
        im.save(out, optimize=True)
        size = out.stat().st_size
        total += size
        print(f"  {folder}/{name}.png  {im.size[0]}x{im.size[1]}  {size} B")

    build_previews(args.preview, args.only)
    print(f"Total aset: {total/1024:.1f} KB (anggaran {BUDGET_TOTAL/1024/1024:.0f} MB)")
    if total > BUDGET_TOTAL:
        problems.append("Total ukuran aset melebihi anggaran")
    if problems:
        print("MASALAH:")
        for p in problems:
            print("  -", p)
        sys.exit(1)
    print("Semua pemeriksaan lulus.")


if __name__ == "__main__":
    main()
