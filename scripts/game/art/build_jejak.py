"""Bangun semua aset gambar Jejak Setara dari kode, lalu periksa.

Pemakaian (dari folder repositori):
    npx pnpm@11.25.0 assets:build:jejak
    python scripts/game/art/build_jejak.py --only ava_1_bawah_diam --out /tmp/aset --preview /tmp/pratinjau

Hasil:
    <out>/ava/ava_{n}_{arah}_{pose}.png, <out>/ikon/ikon_ava_{n}.png, <out>/ubin/ubin_{masa}.png  (ukuran asli 1x)
    <out>/CREDITS.md                (dibuat otomatis untuk aset berstatus Disetujui)
    <preview>/*.png dan *.gif       (pratinjau untuk persetujuan, docs/jejak-setara/preview/)
Pemeriksaan: warna di luar palet, piksel semi-transparan, ukuran, warna kunci tas hanya di tas,
dan anggaran (Architecture Jejak bagian 11.3).

Kit Sehari Setara (pixelart.py, palette.json, ikon.py) dipakai tanpa diubah; build_assets.py Sehari Setara
tidak terpengaruh. Status setiap aset ada di docs/jejak-setara/Daftar_Aset.md. CREDITS.md dan manifest.ts
dibuat dari daftar ini hanya untuk aset berstatus Disetujui (DISETUJUI di bawah; bentuk manifest menunggu
Permintaan C-6).
"""
import argparse
import io
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from pixelart import *          # noqa: E402,F401,F403
from atas_tokoh import (AVATAR, ARAH, BINGKAI, KETERANGAN, WARNA_TAS, avatar, strip_avatar,   # noqa: E402
                        ikon_kepala, ganti_tas)
from atas_ubin import (MASA, NAMA_MASA, KOLOM, NOMOR, BLOB, WILAYAH, SUSUNAN, UKURAN_LEMBAR,   # noqa: E402
                       ubin_rumput, ubin_wilayah, lembar_ubin, nomor_tanah)
from atas_objek import POTONG_ATAP, OBJEK, KODE_OBJEK, obj_rumah_a, pisah   # noqa: E402

if HERE.parts[-3:] == ("scripts", "game", "art"):      # berada di dalam repositori
    REPO = HERE.parents[2]
    DEFAULT_OUT = REPO / "app" / "jejak-setara" / "assets"
    DEFAULT_PREVIEW = REPO / "docs" / "jejak-setara" / "preview"
else:                                                 # dijalankan di folder lepas
    DEFAULT_OUT = HERE / "out" / "aset"
    DEFAULT_PREVIEW = HERE / "out" / "pratinjau"

# ---------------------------------------------------------------------------
# Daftar aset: nama berkas -> (folder, fungsi yang mengembalikan Image, ukuran yang diharapkan)
# Tambahkan entri setiap kali aset baru digambar, lalu perbarui Daftar_Aset.md.
# ---------------------------------------------------------------------------
ASSETS = {}
# Kelompok A (Ditinjau): avatar A1-A8, 6 strip per avatar, dan ikon kepala
for _n in AVATAR:
    for _arah in ARAH:
        for _pose, _nb in BINGKAI.items():
            ASSETS[f"ava_{_n}_{_arah}_{_pose}"] = (
                "ava", lambda n=_n, a=_arah, p=_pose: strip_avatar(n, a, p), (16 * _nb, 24))
    ASSETS[f"ikon_ava_{_n}"] = ("ikon", lambda n=_n: ikon_kepala(n).im, (16, 16))

# Kelompok U (Ditinjau): satu lembar ubin per masa
for _masa in MASA:
    ASSETS[f"ubin_{_masa}"] = ("ubin", lambda m=_masa: lembar_ubin(m).im, UKURAN_LEMBAR)

# Kelompok O1 (Ditinjau): bangunan penanda zona; bangunan dan pohon dipotong dua (usulan 6a)
for _nama, (_fn, _ub, _pot, _padat, _bay, _lewat) in OBJEK.items():
    _w, _h = _ub[0] * 16 + 2, _ub[1] * 16 + 2
    if _pot:
        ASSETS[f"obj_{_nama}"] = ("obj", lambda f=_fn, p=_pot: pisah(f(), p)[1].im, (_w, _h - _pot))
        ASSETS[f"obj_{_nama}_atas"] = ("obj", lambda f=_fn, p=_pot: pisah(f(), p)[0].im, (_w, _pot))
    else:
        ASSETS[f"obj_{_nama}"] = ("obj", lambda f=_fn: f().im, (_w, _h))

# Aset berstatus Disetujui: nama -> tanggal. Hanya aset di sini yang masuk CREDITS.md dan manifest.ts.
DISETUJUI = {nama: "6 November 2026" for nama in ASSETS
             if nama.startswith(("ava_", "ikon_ava_", "ubin_"))}       # kelompok A dan U (Setuju: aset A, aset U)

BATAS_STRIP = 6 * 1024              # satu strip avatar atau tokoh
BATAS_UBIN = 60 * 1024              # satu lembar ubin per masa
BATAS_TOTAL = 2 * 1024 * 1024       # seluruh aset layar pemain


def kode_aset(nama):
    """ID di Daftar_Aset.md."""
    if nama.startswith("ava_"):
        return f"A-0{nama.split('_')[1]}"
    if nama.startswith("ikon_ava_"):
        return "A-09"
    if nama.startswith("ubin_"):
        return "U-01 sampai U-15"
    if nama.startswith("obj_"):
        return KODE_OBJEK.get(nama[4:].removesuffix("_atas"), "—")
    return "—"


JUDUL_FOLDER = {"ava": "Avatar pemain", "ikon": "Ikon", "ubin": "Lembar ubin per masa", "obj": "Objek dan bangunan"}


def tulis_kredit(out_dir):
    """CREDITS.md untuk aset berstatus Disetujui (AGENTS Jejak bagian 9). Jangan disunting manual."""
    if not DISETUJUI:
        return 0
    baris = ["# CREDITS — Aset gambar Jejak Setara", "",
             "Semua gambar di folder ini digambar dengan kode memakai kit Sehari Setara (`scripts/game/art/`: "
             "`palette.json` dan `pixelart.py`) dan kit tampak atas Jejak Setara (`scripts/game/art/atas_*.py`), "
             "lalu dibangun dengan `python scripts/game/art/build_jejak.py`. Kode adalah sumber utama; PNG tidak "
             "disunting manual. Status dan rincian setiap aset ada di `docs/jejak-setara/Daftar_Aset.md`.", "",
             "Berkas ini dibuat otomatis oleh `build_jejak.py` dan hanya memuat aset berstatus Disetujui. "
             "Format atribusi mengikuti `docs/jejak-setara/AGENTS.md` bagian 9: \"Digambar dengan kode (kit Sehari "
             "Setara) oleh Claude, disetujui [nama], [tanggal]\".", ""]
    for folder, judul in JUDUL_FOLDER.items():
        nama = sorted(n for n in DISETUJUI if ASSETS[n][0] == folder)
        if not nama:
            continue
        baris += [f"## {judul} (`{folder}/`)", "", "| File | ID | Atribusi |", "|---|---|---|"]
        for n in nama:
            baris.append(f"| `{folder}/{n}.png` | {kode_aset(n)} | Digambar dengan kode (kit Sehari Setara) oleh "
                         f"Claude, disetujui YAN, {DISETUJUI[n]} |")
        baris.append("")
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "CREDITS.md").write_text("\n".join(baris), encoding="utf-8")
    return len(DISETUJUI)


def _kunci_tas_bocor(nama):
    """Avatar digambar dengan tas warna uji; SUN atau MANGO yang tersisa berarti warna kunci dipakai di luar tas."""
    if not nama.startswith(("ava_", "ikon_ava_")):
        return 0
    bagian = nama.split("_")
    if nama.startswith("ava_"):
        n, arah, pose = int(bagian[1]), bagian[2], bagian[3]
        im = strip_avatar(n, arah, pose, tas=(CORAL, WOODD))                      # noqa: F405
    else:
        im = ikon_kepala(int(bagian[2]), tas=(CORAL, WOODD)).im                    # noqa: F405
    kunci = {SUN, MANGO}                                                          # noqa: F405
    return sum(1 for p in im.convert("RGBA").getdata() if p[3] and p in kunci)


# ---------------------------------------------------------------------------
# Alat pratinjau
# ---------------------------------------------------------------------------
def _huruf(ukuran, tebal=False):
    try:
        return ImageFont.truetype("DejaVuSans-Bold.ttf" if tebal else "DejaVuSans.ttf", ukuran)
    except OSError:
        return ImageFont.load_default()


def besar(c, k):
    im = c.im if isinstance(c, C) else c                                          # noqa: F405
    return im.resize((im.width * k, im.height * k), Image.NEAREST)


class Lembar:
    """Lembar pratinjau berlatar cream dengan panel, gambar, dan label."""

    def __init__(self, w, h):
        self.im = Image.new("RGB", (w, h), CREAM[:3])                             # noqa: F405
        self.d = ImageDraw.Draw(self.im)
        self.f = {"judul": _huruf(30, True), "panel": _huruf(21, True), "kecil": _huruf(16), "tebal": _huruf(16, True)}

    def judul(self, teks, sub):
        self.d.text((20, 16), teks, font=self.f["judul"], fill=INK[:3])           # noqa: F405
        w = self.d.textlength(sub, font=self.f["kecil"])
        self.d.text((self.im.width - 20 - w, 28), sub, font=self.f["kecil"], fill=DUSK[:3])  # noqa: F405

    def panel(self, x, y, w, h, teks):
        self.d.rectangle([x, y, x + w, y + h], outline=MIST[:3], width=2)         # noqa: F405
        self.d.text((x + 14, y + 10), teks, font=self.f["panel"], fill=INK[:3])   # noqa: F405

    def tempel(self, im, x, y):
        im = (im.im if isinstance(im, C) else im).convert("RGBA")                 # noqa: F405
        self.im.paste(im, (x, y), im)

    def label(self, teks, cx, y, gaya="kecil"):
        f = self.f[gaya]
        self.d.text((cx - self.d.textlength(teks, font=f) / 2, y), teks, font=f, fill=INK[:3])  # noqa: F405


GESER_BAYANGAN = (8, 4)     # bayangan bangunan jatuh ke kanan bawah (usulan 4a)


def adegan(m, w, h, rumah_xy, pemain):
    """Peta kecil untuk pratinjau. pemain: (sprite, sprite tanpa bayangan, jangkar x, jangkar y, siluet?)."""
    g = C(w, h)                                                                   # noqa: F405
    t = ubin_rumput(m)
    for ty in range(0, h, 16):
        for tx in range(0, w, 16):
            g.paste(t, tx, ty)
    rumah = obj_rumah_a()
    atas, bawah = pisah(rumah, POTONG_ATAP)
    hx, hy = rumah_xy
    dx, dy = GESER_BAYANGAN

    def isi(x, y):
        return 0 <= x < rumah.w and 0 <= y < rumah.h and rumah.px[x, y][3] > 0

    for y in range(rumah.h + dy):                    # bayangan bangunan: ubin tumpang lapisan 10
        for x in range(rumah.w + dx):
            if isi(x - dx, y - dy) and not isi(x, y) and (hx + x + hy + y) % 2 == 0:
                g.p(hx + x, hy + y, m["bayangan"])
    g.paste(bawah, hx, hy + POTONG_ATAP)             # lapisan 20
    for spr, _, ax, ay, _ in sorted(pemain, key=lambda p: p[3]):   # lapisan 30, urut baris kaki
        g.paste(spr, ax - 8, ay - 21)
    g.paste(atas, hx, hy)                            # lapisan 40
    for _, polos, ax, ay, sil in pemain:             # lapisan 60: siluet pemain sendiri (garis sun)
        if not sil:
            continue
        ox, oy = ax - 8, ay - 21

        def ada(x, y):
            return 0 <= x < polos.w and 0 <= y < polos.h and polos.px[x, y][3] > 0

        for y in range(-1, polos.h + 1):
            for x in range(-1, polos.w + 1):
                if ada(x, y) or not any(ada(x + a, y + b) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    continue
                rx, ry = ox + x - hx, oy + y - hy
                if 0 <= rx < atas.w and 0 <= ry < atas.h and atas.px[rx, ry][3] > 0:
                    g.p(ox + x, oy + y, SUN)                                      # noqa: F405
    return g


def _pemain(n, ax, ay, arah="bawah", pose="diam", bingkai=0, tas=None, cermin=False, siluet=False):
    spr = avatar(n, arah, pose, bingkai)
    polos = avatar(n, arah, pose, bingkai, bayangan=False)
    if tas:
        spr, polos = ganti_tas(spr, tas), ganti_tas(polos, tas)
    if cermin:
        spr, polos = flip(spr), flip(polos)                                       # noqa: F405
    return (spr, polos, ax, ay, siluet)


# ---------------------------------------------------------------------------
# Pratinjau: lembar uji gaya (Plan, disetujui sebagai acuan 6 Nov 2026)
# ---------------------------------------------------------------------------
def _pandangan_uji(nama):
    pemain = [_pemain(1, 160, 111), _pemain(1, 178, 45, siluet=True),
              _pemain(1, 74, 128, "kanan", "jalan", 1), _pemain(1, 250, 150, "atas", "jalan", 3)]
    return adegan(MASA[nama], 320, 180, (127, 31), pemain)


def pratinjau_uji_gaya():
    L = Lembar(1440, 1500)
    L.judul("Uji gaya tampak atas — Jejak Setara",
            "Plan Sesi C · 6 Nov 2026 · 1 ubin, 1 avatar, 1 objek · hanya 36 warna palet")
    L.panel(20, 70, 460, 380, "1  Ubin rumput 16×16 (×8)")
    for i, nama in enumerate(MASA):
        x = 34 + i * 146
        L.tempel(besar(ubin_rumput(MASA[nama]), 8), x, 112); L.label(NAMA_MASA[nama], x + 64, 246, "tebal")
        rep = C(64, 48)                                                           # noqa: F405
        for a in range(4):
            for b in range(3):
                rep.paste(ubin_rumput(MASA[nama]), a * 16, b * 16)
        L.tempel(besar(rep, 2), x, 300)
    L.label("Diulang 4×3 ubin (×2): sambungan tanpa jahitan", 250, 275)
    L.label("Kilau ujung rumpun berganti per masa:", 250, 404)
    L.label("pagi #FFF1C9 · siang putih · sore #FFE3A3", 250, 424)
    L.panel(500, 70, 920, 560, "2  Avatar A1 16×24 (×6) · seragam SMP, tas warna kunci")
    baris1 = [("Bawah 1", avatar(1, "bawah", "diam", 0)), ("Bawah 2", avatar(1, "bawah", "diam", 1)),
              ("Kanan", avatar(1, "kanan", "diam", 0)), ("Kiri (cermin)", flip(avatar(1, "kanan", "diam", 0))),  # noqa: F405
              ("Atas", avatar(1, "atas", "diam", 0))]
    for i, (lab, s) in enumerate(baris1):
        x = 522 + i * 118; L.tempel(besar(s, 6), x, 112); L.label(lab, x + 48, 260)
    L.label("Diam: 2 bingkai (bernapas)", 1290, 150); L.label("Kiri = cermin kanan", 1290, 175)
    L.label("Jalan, 4 bingkai: menghadap bawah 1–4 dan kanan 1–4", 960, 292)
    for i in range(8):
        arah = "bawah" if i < 4 else "kanan"; x = 522 + i * 112
        L.tempel(besar(avatar(1, arah, "jalan", i % 4), 6), x, 316); L.label(str(i % 4 + 1), x + 48, 462)
    L.label("Warna tas dipilih otomatis saat bermain (8 warna penanda; tampak belakang ×3)", 960, 492)
    for i, nama in enumerate(WARNA_TAS):
        x = 522 + i * 112
        L.tempel(besar(ganti_tas(avatar(1, "atas", "diam", 0), nama), 3), x + 24, 516); L.label(nama, x + 48, 592)
    L.panel(20, 470, 460, 560, "3  Objek: rumah atap coral 64×64 (×4)")
    rumah = obj_rumah_a(); L.tempel(besar(rumah, 4), 118, 510)
    L.label("4×4 ubin · atap limasan · pintu di dinding depan", 250, 782)
    atas, bawah = pisah(rumah, POTONG_ATAP)
    L.tempel(besar(atas, 2), 50, 820); L.label("Atap (di atas tokoh)", 116, 895)
    L.tempel(besar(bawah, 2), 284, 826); L.label("Dinding (di bawah tokoh)", 350, 895)
    L.label("Cahaya dari kiri atas: sisi kiri dan belakang lebih terang,", 250, 940)
    L.label("sisi kanan teduh, bayangan jatuh ke kanan bawah.", 250, 962)
    L.label("Garis luar ink hanya di tepi siluet.", 250, 984)
    L.panel(500, 650, 920, 440, "4  Pandangan pemain 320×180 (×2), siang")
    L.tempel(besar(_pandangan_uji("siang"), 2), 640, 690)
    L.label("Kira-kira sebesar ini di layar HP mendatar. Pemain di belakang atap tampil sebagai garis sun.", 960, 1058)
    L.panel(20, 1110, 1400, 370, "5  Bersama di peta, tiga masa (×3, dengan garis pindai)")
    for i, nama in enumerate(MASA):
        x = 104 + i * 424
        L.tempel(scanlines(_pandangan_uji(nama).im.crop((112, 24, 240, 120)), k=3), x, 1150)  # noqa: F405
        L.label(NAMA_MASA[nama], x + 192, 1444, "tebal")
    return L.im


# ---------------------------------------------------------------------------
# Pratinjau kelompok A: avatar pemain
# ---------------------------------------------------------------------------
URUTAN_POSE = [("bawah", "diam"), ("bawah", "jalan"), ("kanan", "diam"), ("kanan", "jalan"),
               ("atas", "diam"), ("atas", "jalan")]
NAMA_ARAH = {"bawah": "Bawah", "kanan": "Kanan", "atas": "Atas"}
TAS_CONTOH = list(WARNA_TAS)        # A1 sun, A2 mango, ... A8 sky-d


def pratinjau_ava_ringkasan():
    L = Lembar(1440, 1130)
    L.judul("Kelompok A — Avatar pemain", "Sesi C · disetujui 6 Nov 2026 · 8 desain, 3 arah, diam dan jalan")
    L.panel(20, 70, 940, 350, "1  Delapan avatar menghadap bawah (×6)")
    for i, n in enumerate(AVATAR):
        x = 34 + i * 114
        L.tempel(besar(avatar(n, "bawah", "diam", 0), 6), x, 112)
        L.label(f"A{n}", x + 48, 262, "tebal")
        for j, t in enumerate(KETERANGAN[n]):
            L.label(t, x + 48, 284 + j * 20)
    L.panel(980, 70, 440, 350, "2  Ikon kepala 16×16 (×4)")
    for i, n in enumerate(AVATAR):
        x, y = 1004 + (i % 4) * 102, 112 + (i // 4) * 140
        L.tempel(besar(ikon_kepala(n), 4), x, y); L.label(f"A{n}", x + 32, y + 72, "tebal")
    L.label("Tas di ikon ikut berganti warna", 1200, 390)
    L.panel(20, 440, 1400, 220, "3  Menghadap kanan dan atas (×4)")
    for i, n in enumerate(AVATAR):
        x = 40 + i * 172
        L.tempel(besar(avatar(n, "kanan", "diam", 0), 4), x, 482)
        L.tempel(besar(avatar(n, "atas", "diam", 0), 4), x + 76, 482)
        L.label(f"A{n}", x + 70, 584, "tebal")
    L.label("Kiri = cermin kanan, digambar antarmuka", 1240, 632)
    L.panel(20, 680, 700, 430, "4  Di peta (×2), kira-kira ukuran HP")
    pemain = [_pemain(1, 60, 64, tas="sun"), _pemain(2, 92, 122, "kanan", "jalan", 1, tas="mango"),
              _pemain(3, 40, 158, "atas", "jalan", 3, tas="coral"), _pemain(4, 160, 112, tas="rose"),
              _pemain(5, 236, 132, "kanan", "jalan", 1, tas="berry", cermin=True),
              _pemain(6, 276, 70, tas="teal"), _pemain(7, 214, 168, "atas", "diam", 0, tas="leaf"),
              _pemain(8, 126, 162, "bawah", "jalan", 1, tas="sky-d")]
    L.tempel(besar(adegan(MASA["siang"], 320, 180, (127, 31), pemain), 2), 50, 720)
    L.label("Setiap pemain bertas warna berbeda; nama samaran ditulis antarmuka.", 370, 1086)
    L.panel(740, 680, 680, 430, "5  Tas sama: tetap dibedakan dari siluet (×3)")
    for r, arah in enumerate(("bawah", "kanan", "atas")):
        for i, n in enumerate(AVATAR):
            L.tempel(besar(avatar(n, arah, "diam", 0), 3), 766 + i * 82, 720 + r * 120)
    for i, n in enumerate(AVATAR):
        L.label(f"A{n}", 790 + i * 82, 1080, "tebal")
    return L.im


def pratinjau_ava_pose_semua():
    k, sel = 3, 56
    L = Lembar(80 + 18 * sel + 20, 120 + 8 * 90 + 20)
    L.judul("Kelompok A — Semua bingkai (×3)", "diam 2 bingkai · jalan 4 bingkai")
    x = 80
    for arah, pose in URUTAN_POSE:
        nb = BINGKAI[pose]
        L.label(f"{NAMA_ARAH[arah]} {pose}", x + nb * sel / 2, 70, "tebal")
        for b in range(nb):
            L.label(str(b + 1), x + b * sel + 24, 92)
        x += nb * sel
    for r, n in enumerate(AVATAR):
        y = 120 + r * 90
        L.label(f"A{n}", 40, y + 28, "tebal")
        x = 80
        for arah, pose in URUTAN_POSE:
            for b in range(BINGKAI[pose]):
                L.tempel(besar(avatar(n, arah, pose, b), k), x, y)
                x += sel
    return L.im


def pratinjau_pose_avatar(n):
    k, sel = 6, 112
    L = Lembar(40 + 18 * sel, 270)
    L.judul(f"Avatar A{n} — semua arah dan gerak (×6)", ", ".join(KETERANGAN[n]))
    x = 20
    for arah, pose in URUTAN_POSE:
        for b in range(BINGKAI[pose]):
            L.tempel(besar(avatar(n, arah, pose, b), k), x + 8, 70)
            L.label(f"{NAMA_ARAH[arah]} {pose} {b + 1}", x + 56, 225)
            x += sel
    return L.im


def pratinjau_ava_gerak():
    """GIF: delapan avatar berjalan ke bawah, kanan, atas, kiri, lalu diam (×4)."""
    k, sel = 4, 80
    urutan = []
    for arah, cermin in (("bawah", False), ("kanan", False), ("atas", False), ("kanan", True)):
        for _ in range(2):
            urutan += [(arah, "jalan", b, cermin, 125) for b in range(4)]
    urutan += [("bawah", "diam", b, False, 500) for b in (0, 1, 0, 1)]
    bingkai, lama = [], []
    for arah, pose, b, cermin, ms in urutan:
        im = Image.new("RGB", (16 + 8 * sel, 24 * k + 24), CREAM[:3])             # noqa: F405
        for i, n in enumerate(AVATAR):
            s = ganti_tas(avatar(n, arah, pose, b), TAS_CONTOH[i])
            s = flip(s) if cermin else s                                          # noqa: F405
            g = besar(s, k).convert("RGBA")
            im.paste(g, (16 + i * sel, 12), g)
        bingkai.append(im); lama.append(ms)
    return bingkai, lama


# ---------------------------------------------------------------------------
# Pratinjau kelompok U: ubin per masa
# ---------------------------------------------------------------------------
LEGENDA = {   # huruf peta contoh -> (bahan lapisan 0, ubin tumpang atau None)
    ".": ("rumput", None), "*": ("rumput", "bunga_a"), "+": ("rumput", "bunga_b"), "^": ("rumput", "rumput_tinggi"),
    "d": ("rumput", "daun"), "g": ("rumput", "LAPANGAN"),
    "t": ("tanah", None), "o": ("tanah", "genangan"), "k": ("tanah", "kerikil"),
    "p": ("paving", None), "s": ("semen", None), "c": ("semen", "LAPANGAN"),
    "a": ("aspal", None), "-": ("aspal", "garis_tengah_datar"), "z": ("aspal", "zebra_datar"),
    "b": ("pasir", None), "B": ("pasir", "batu"), "w": ("air", None), "W": ("air_dalam", None),
}
RUMAH_CONTOH = [(3, 2)]          # ubin kiri atas rumah 4x4


def peta_contoh():
    W, H = 40, 24
    g = [["."] * W for _ in range(H)]

    def isi(x0, y0, x1, y1, ch):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                g[y][x] = ch

    isi(0, 8, 39, 8, "s"); isi(0, 12, 39, 12, "s")                  # trotoar
    isi(0, 9, 39, 11, "a"); isi(0, 10, 39, 10, "-")                  # jalan dan garis tengah
    isi(18, 9, 19, 11, "z")                                           # zebra cross
    isi(4, 6, 5, 7, "p")                                              # gang paving dari pintu rumah
    isi(22, 1, 37, 7, "s"); isi(25, 2, 33, 6, "c")                    # halaman sekolah dan lapangan
    isi(2, 15, 12, 21, "g")                                           # lapangan taman
    isi(15, 13, 16, 20, "t"); isi(15, 19, 24, 20, "t")                # jalan setapak berbentuk L
    g[15][16] = "o"; g[17][15] = "k"
    isi(26, 14, 39, 23, "b")                                          # pasir
    isi(31, 15, 39, 15, "w"); isi(29, 16, 39, 16, "w"); isi(28, 17, 39, 23, "w")   # air
    isi(35, 18, 39, 18, "W"); isi(33, 19, 39, 23, "W")                # air dalam
    g[21][27] = "B"
    for x, y, ch in ((1, 3, "*"), (8, 4, "+"), (9, 2, "^"), (2, 6, "*"), (13, 2, "d"), (19, 4, "^"),
                     (14, 14, "+"), (20, 16, "*"), (22, 22, "^"), (10, 23, "d")):
        g[y][x] = ch
    return ["".join(r) for r in g]


def _garis_wilayah(peta, ch):
    """Ubin tumpang garis lapangan untuk wilayah persegi panjang berhuruf ch (lebar ganjil)."""
    sel = [(x, y) for y, r in enumerate(peta) for x, c in enumerate(r) if c == ch]
    if not sel:
        return {}
    x0, x1 = min(x for x, _ in sel), max(x for x, _ in sel)
    y0, y1 = min(y for _, y in sel), max(y for _, y in sel)
    tengah = (x0 + x1) // 2
    hasil = {}
    for x, y in sel:
        sisi = ("n" if y == y0 else "s" if y == y1 else "") + ("w" if x == x0 else "e" if x == x1 else "")
        if sisi in ("n", "s") and x == tengah:
            hasil[(x, y)] = f"lapangan_{sisi}_tegak"
        elif sisi:
            hasil[(x, y)] = f"lapangan_{sisi}"
        elif x == tengah:
            hasil[(x, y)] = "lapangan_tengah_tegak"
    return hasil


def _bayangan_bangunan(x0, y0, w=4, h=4):
    hasil = {(x0 + w, y0): "bayangan_kanan_atas", (x0 + w, y0 + h): "bayangan_sudut", (x0, y0 + h): "bayangan_bawah_kiri"}
    for y in range(y0 + 1, y0 + h):
        hasil[(x0 + w, y)] = "bayangan_kanan"
    for x in range(x0 + 1, x0 + w):
        hasil[(x, y0 + h)] = "bayangan_bawah"
    return hasil


def render_peta(peta, masa, objek=(("rumah_a", 3, 2),), pemain=()):
    """Peta pratinjau: lapisan 0, ubin tumpang, bayangan objek, objek bawah, tokoh, lalu objek atas."""
    lembar = lembar_ubin(masa).im
    H, W = len(peta), len(peta[0])

    def ubin(n):
        x, y = (n % KOLOM) * 16, (n // KOLOM) * 16
        return lembar.crop((x, y, x + 16, y + 16))

    def bahan_di(x, y):
        return LEGENDA[peta[y][x]][0] if 0 <= x < W and 0 <= y < H else None

    g = C(W * 16, H * 16)                                                         # noqa: F405
    for y in range(H):
        for x in range(W):
            g.im.alpha_composite(ubin(nomor_tanah(bahan_di, x, y)), (x * 16, y * 16))
    tumpang = {}
    for y, r in enumerate(peta):
        for x, ch in enumerate(r):
            if LEGENDA[ch][1] and LEGENDA[ch][1] != "LAPANGAN":
                tumpang[(x, y)] = LEGENDA[ch][1]
    for ch in ("c", "g"):
        tumpang.update(_garis_wilayah(peta, ch))
    bayangan = {}
    for nama, x0, y0 in objek:
        _, (w, h), _, _, jenis, _ = OBJEK[nama]
        if jenis == "kotak":
            bayangan.update(_bayangan_bangunan(x0, y0, w, h))
        elif jenis == "kecil":
            bayangan[(x0 + w // 2, y0 + h - 1)] = "bayangan_kecil"
        elif jenis == "pohon":
            for (dx, dy), bag in (((1, 2), "kiri_atas"), ((2, 2), "kanan_atas"), ((1, 3), "kiri_bawah"),
                                  ((2, 3), "kanan_bawah")):
                bayangan[(x0 + dx, y0 + dy)] = f"bayangan_pohon_{bag}"
    for lapis in (tumpang, bayangan):                # lapisan 10: detail dan marka, lalu bayangan
        for (x, y), nama in lapis.items():
            if 0 <= x < W and 0 <= y < H:
                g.im.alpha_composite(ubin(NOMOR[("tumpang", nama)]), (x * 16, y * 16))
    gambar = []
    for nama, x0, y0 in objek:
        fn, (w, h), potong, _, _, _ = OBJEK[nama]
        img = fn()
        atas, bawah = pisah(img, potong) if potong else (None, img)
        gambar.append((y0 + h, x0, y0, atas, bawah, potong or 0))
    for _, x0, y0, _, bawah, potong in sorted(gambar, key=lambda t: t[0]):     # lapisan 20
        g.paste(bawah, x0 * 16 - 1, y0 * 16 - 1 + potong)
    for spr, _, ax, ay, _ in sorted(pemain, key=lambda p: p[3]):               # lapisan 30
        g.paste(spr, ax - 8, ay - 21)
    for _, x0, y0, atas, _, _ in sorted(gambar, key=lambda t: t[0]):           # lapisan 40
        if atas:
            g.paste(atas, x0 * 16 - 1, y0 * 16 - 1)
    return g


def _pemain_contoh():
    return [_pemain(1, 72, 124, "bawah", "jalan", 1, tas="sun"), _pemain(4, 200, 204, tas="rose"),
            _pemain(2, 296, 172, "kanan", "jalan", 1, tas="mango"), _pemain(6, 424, 316, tas="teal"),
            _pemain(3, 248, 284, "atas", "jalan", 3, tas="coral"), _pemain(7, 392, 76, tas="leaf")]


def pratinjau_ubin_contoh():
    L = Lembar(1320, 920)
    L.judul("Kelompok U — Ubin per masa: contoh peta", "Sesi C · 6 Nov 2026 · Ditinjau · 40×24 ubin, siang (×2)")
    L.tempel(besar(render_peta(peta_contoh(), "siang", pemain=_pemain_contoh()), 2), 20, 70)
    L.label("Rumput · tanah setapak · paving gang · semen (trotoar, halaman sekolah) · aspal dengan garis dan "
            "zebra cross · pasir · air · air dalam", 660, 850)
    L.label("Bayangan rumah, garis lapangan, bunga, genangan, dan kerikil adalah ubin tumpang (lapisan 10). "
            "Avatar dari kelompok A.", 660, 876)
    return L.im


def pratinjau_ubin_masa():
    L = Lembar(1340, 960)
    L.judul("Kelompok U — Peta contoh dalam tiga masa (×1)", "Sesi C · 6 Nov 2026 · Ditinjau")
    peta, pemain = peta_contoh(), _pemain_contoh()
    for i, masa in enumerate(MASA):
        x, y = (20, 70) if i == 0 else (680, 70) if i == 1 else (20, 500)
        L.tempel(render_peta(peta, masa, pemain=pemain), x, y)
        L.label(NAMA_MASA[masa], x + 320, y + 392, "tebal")
    catatan = ["Yang berganti per masa:", "kilau: pagi #FFF1C9, siang putih, sore #FFE3A3",
               "bayangan: dusk, dusk, wood-d", "air: #9ED8F5, #6EC6F2, #FF9E6B",
               "pasir: #FFF1C9, cream, #FFE3A3", "marka: cream, putih, cream", "",
               "Tetap di ketiga masa:", "rumput leaf, tekstur grass, aspal slate,", "air dalam sky-d, tanah skin-2,",
               "paving wood, semen mist"]
    for j, t in enumerate(catatan):
        L.d.text((700, 520 + j * 26), t, font=L.f["tebal" if t.endswith(":") else "kecil"], fill=INK[:3])  # noqa: F405
    return L.im


def pratinjau_ubin_dekat():
    L = Lembar(1260, 430)
    L.judul("Kelompok U — Potongan dekat (×3, dengan garis pindai)", "Sesi C · 6 Nov 2026 · Ditinjau")
    peta, pemain = peta_contoh(), _pemain_contoh()
    potong = [("pagi", (16, 32, 144, 128), "Pagi: rumah, bayangan, gang paving"),
              ("siang", (224, 112, 352, 208), "Siang: jalan, zebra cross, trotoar"),
              ("sore", (416, 224, 544, 320), "Sore: pasir, air, air dalam")]
    for i, (masa, kotak, teks) in enumerate(potong):
        x = 20 + i * 412
        L.tempel(scanlines(render_peta(peta, masa, pemain=pemain).im.crop(kotak), k=3), x, 70)  # noqa: F405
        L.label(teks, x + 192, 370, "tebal")
    return L.im


def pratinjau_ubin_lembar():
    L = Lembar(1200, 880)
    L.judul("Kelompok U — Lembar ubin", f"{len(SUSUNAN)} ubin · 16 kolom · siang ×2, pagi dan sore ×1")
    L.tempel(besar(lembar_ubin("siang"), 2), 20, 70)
    blok = [("Rumput, ubin tumpang, varian kedua", 0)]
    blok += [(f"{b.replace('_', ' ')}: 47 ubin peralihan", NOMOR[("wilayah", (b, BLOB[0]))]) for b in WILAYAH]
    for teks, nomor in blok:
        y = 70 + (nomor // KOLOM) * 32
        L.d.line([(536, y + 2), (552, y + 2)], fill=DUSK[:3], width=2)            # noqa: F405
        L.d.text((558, y - 8), f"no. {nomor}: {teks}", font=L.f["kecil"], fill=INK[:3])  # noqa: F405
    for i, masa in enumerate(("pagi", "sore")):
        y = 70 + i * 400
        L.tempel(lembar_ubin(masa), 920, y); L.label(NAMA_MASA[masa], 1048, y + 388, "tebal")
    return L.im


# ---------------------------------------------------------------------------
# Pratinjau kelompok O1: bangunan penanda zona
# ---------------------------------------------------------------------------
def pratinjau_obj_lembar():
    L = Lembar(1440, 1440)
    L.judul("Kelompok O1 — Bangunan penanda zona (×2)", "Sesi C · 6 Nov 2026 · Ditinjau · di atas rumput siang")
    m = MASA["siang"]
    x, y, tinggi_baris = 20, 70, 0
    for nama, (fn, (w, h), potong, _, _, lewat) in OBJEK.items():
        latar = C((w + 1) * 16, (h + 1) * 16)                                     # noqa: F405
        for ty in range(h + 1):
            for tx in range(w + 1):
                latar.paste(ubin_wilayah("air", 0, m) if lewat else ubin_rumput(m, (tx + ty) % 4), tx * 16, ty * 16)
        latar.paste(fn(), 7, 7)
        lebar, tinggi = max(latar.w * 2, 150), latar.h * 2 + 46
        if x + lebar > 1420:
            x, y, tinggi_baris = 20, y + tinggi_baris + 12, 0
        L.tempel(besar(latar, 2), x + (lebar - latar.w * 2) // 2, y)
        L.label(KODE_OBJEK[nama], x + lebar / 2, y + latar.h * 2 + 4, "tebal")
        L.label(nama.replace("_", " "), x + lebar / 2, y + latar.h * 2 + 24)
        x += lebar + 14
        tinggi_baris = max(tinggi_baris, tinggi)
    return L.im.crop((0, 0, 1440, min(1440, y + tinggi_baris + 20)))


def peta_kampung():
    W, H = 40, 26
    g = [["."] * W for _ in range(H)]

    def isi(x0, y0, x1, y1, ch):
        for yy in range(y0, y1 + 1):
            for xx in range(x0, x1 + 1):
                g[yy][xx] = ch

    isi(0, 11, 39, 11, "s"); isi(0, 15, 39, 15, "s")                  # trotoar
    isi(0, 12, 39, 14, "a"); isi(0, 13, 39, 13, "-"); isi(20, 12, 21, 14, "z")   # jalan dan zebra cross
    isi(4, 0, 5, 10, "p")                                             # gang paving (Z1)
    isi(12, 6, 27, 10, "s")                                           # halaman lobi sekolah (Z2)
    isi(28, 4, 39, 6, "s")                                            # halaman puskesmas dan kantor desa (Z7)
    isi(0, 16, 13, 25, "s")                                           # lantai pasar (Z4)
    isi(34, 16, 39, 25, "b"); isi(30, 16, 32, 25, "w")                # pasir dan sungai (Z6)
    for x, y, ch in ((10, 1, "*"), (11, 4, "+"), (25, 21, "*"), (27, 17, "^"), (24, 24, "+"), (33, 9, "^"),
                     (20, 22, "d"), (14, 24, "^"), (37, 9, "*")):
        g[y][x] = ch
    return ["".join(r) for r in g]


OBJEK_KAMPUNG = [("rumah_nara", 0, 1), ("rumah_a", 6, 1), ("rumah_b", 0, 6), ("warung_made", 6, 6),
                 ("halte", 9, 9), ("rambu_halte", 8, 9), ("sekolah", 14, 0), ("kantin", 24, 1),
                 ("tiang_bendera", 12, 6), ("gerbang_tutup", 17, 9), ("rambu_seberang", 22, 9),
                 ("puskesmas", 28, 0), ("kantor_desa", 34, 0), ("gerobak", 36, 5), ("warung_wifi", 29, 7),
                 ("angkot", 12, 12), ("tenda_a", 1, 17), ("tenda_b", 5, 17), ("los", 1, 21), ("gerobak", 9, 18),
                 ("bale", 15, 17), ("pos_ronda", 21, 17), ("jembatan_datar", 30, 19), ("kelapa", 35, 17),
                 ("kelapa", 26, 21)]


def _pemain_kampung():
    return [_pemain(1, 72, 140, "bawah", "jalan", 1, tas="sun"), _pemain(2, 328, 220, "kanan", "jalan", 1, tas="mango"),
            _pemain(3, 152, 296, "atas", "diam", 0, tas="coral"), _pemain(4, 248, 148, tas="rose"),
            _pemain(5, 504, 332, "kanan", "jalan", 3, tas="berry"), _pemain(6, 616, 380, tas="teal"),
            _pemain(7, 280, 364, tas="leaf"), _pemain(8, 520, 92, "bawah", "jalan", 1, tas="sky-d")]


def pratinjau_obj_peta():
    L = Lembar(1320, 970)
    L.judul("Kelompok O1 — Delapan zona di peta contoh", "Sesi C · 6 Nov 2026 · Ditinjau · 40×26 ubin, siang (×2)")
    L.tempel(besar(render_peta(peta_kampung(), "siang", OBJEK_KAMPUNG, _pemain_kampung()), 2), 20, 70)
    L.label("Z1 rumah dan gang (kiri atas) · Z2 sekolah · Z7 puskesmas dan kantor desa · Z8 warung berwifi · "
            "Z3 jalan, halte, angkot", 660, 912)
    L.label("Z4 pasar (kiri bawah) · Z5 bale dan pos ronda · Z6 sungai, jembatan, dan pohon kelapa", 660, 936)
    return L.im


def pratinjau_obj_dekat():
    L = Lembar(1020, 760)
    L.judul("Kelompok O1 — Potongan dekat (×3)", "Sesi C · 6 Nov 2026 · Ditinjau · dengan garis pindai")
    peta = render_peta(peta_kampung(), "siang", OBJEK_KAMPUNG, _pemain_kampung())
    potong = [((0, 0), "Z1 rumah Nara, rumah warga, warung Pak Made"), ((14, 0), "Z2 gedung SMP dan kantin"),
              ((28, 0), "Z7 puskesmas dan kantor desa"), ((14, 16), "Z5 bale dan pos ronda")]
    for i, ((tx, ty), teks) in enumerate(potong):
        x, y = 20 + (i % 2) * 500, 70 + (i // 2) * 340
        L.tempel(scanlines(peta.im.crop((tx * 16, ty * 16, tx * 16 + 160, ty * 16 + 96)), k=3), x, y)  # noqa: F405
        L.label(teks, x + 240, y + 294, "tebal")
    return L.im


PREVIEWS = {"uji_gaya": pratinjau_uji_gaya, "ava_ringkasan": pratinjau_ava_ringkasan,
            "ava_pose_semua": pratinjau_ava_pose_semua, "ubin_contoh": pratinjau_ubin_contoh,
            "ubin_masa": pratinjau_ubin_masa, "ubin_dekat": pratinjau_ubin_dekat,
            "ubin_lembar": pratinjau_ubin_lembar, "obj_lembar": pratinjau_obj_lembar,
            "obj_peta": pratinjau_obj_peta, "obj_dekat": pratinjau_obj_dekat}
for _n in AVATAR:
    PREVIEWS[f"pose_ava_{_n}"] = (lambda n=_n: pratinjau_pose_avatar(n))
ANIMASI = {"ava_gerak": pratinjau_ava_gerak}


def build_previews(preview_dir, only=None):
    preview_dir.mkdir(parents=True, exist_ok=True)
    for nama, fn in PREVIEWS.items():
        if only and nama not in only:
            continue
        fn().save(preview_dir / f"{nama}.png", optimize=True)
    for nama, fn in ANIMASI.items():
        if only and nama not in only:
            continue
        bingkai, lama = fn()
        bingkai[0].save(preview_dir / f"{nama}.gif", save_all=True, append_images=bingkai[1:],
                        duration=lama, loop=0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--preview", type=Path, default=DEFAULT_PREVIEW)
    ap.add_argument("--only", nargs="*", help="nama aset atau pratinjau tertentu saja")
    args = ap.parse_args()

    masalah, total = [], 0
    for nama, (folder, fn, ukuran) in ASSETS.items():
        if args.only and nama not in args.only:
            continue
        im = fn()
        im = im.im if isinstance(im, C) else im                                   # noqa: F405
        bad = palette_violations(im)                                              # noqa: F405
        if bad:
            masalah.append(f"{nama}: {bad} piksel di luar palet atau semi-transparan")
        if im.size != ukuran:
            masalah.append(f"{nama}: ukuran {im.size}, seharusnya {ukuran}")
        bocor = _kunci_tas_bocor(nama)
        if bocor:
            masalah.append(f"{nama}: {bocor} piksel warna kunci tas (sun/mango) di luar tas")
        out = args.out / folder / f"{nama}.png"
        out.parent.mkdir(parents=True, exist_ok=True)
        im.save(out, optimize=True)
        size = out.stat().st_size
        total += size
        if nama.startswith("ava_") and size > BATAS_STRIP:
            masalah.append(f"{nama}: {size} B, melebihi {BATAS_STRIP} B per strip")
        if nama.startswith("ubin_") and size > BATAS_UBIN:
            masalah.append(f"{nama}: {size} B, melebihi {BATAS_UBIN} B per lembar ubin")
        if nama.startswith("ubin_"):
            px = im.load()
            bolong = [i for i, (jenis, _) in enumerate(SUSUNAN) if jenis in ("rumput", "varian2", "wilayah")
                      and any(px[(i % KOLOM) * 16 + x, (i // KOLOM) * 16 + y][3] == 0
                              for y in range(16) for x in range(16))]
            if bolong:
                masalah.append(f"{nama}: ubin lapisan 0 berlubang (transparan) di nomor {bolong[:8]}")
        print(f"  {folder}/{nama}.png  {im.size[0]}x{im.size[1]}  {size} B")

    build_previews(args.preview, args.only)
    if not args.only:
        print(f"CREDITS.md: {tulis_kredit(args.out)} aset Disetujui")
    print(f"Total aset: {total / 1024:.1f} KB (anggaran aset layar pemain {BATAS_TOTAL / 1024 / 1024:.0f} MB)")
    if total > BATAS_TOTAL:
        masalah.append("Total ukuran aset melebihi anggaran")
    if masalah:
        print("MASALAH:")
        for m in masalah:
            print("  -", m)
        sys.exit(1)
    print("Semua pemeriksaan lulus.")


if __name__ == "__main__":
    main()
