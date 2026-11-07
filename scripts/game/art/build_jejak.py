"""Bangun semua aset gambar Jejak Setara dari kode, lalu periksa.

Pemakaian (dari folder repositori):
    npx pnpm@11.25.0 assets:build:jejak
    python scripts/game/art/build_jejak.py --only ava_1_bawah_diam --out /tmp/aset --preview /tmp/pratinjau

Hasil:
    <out>/ava/ava_{n}_{arah}_{pose}.png, <out>/ikon/ikon_ava_{n}.png   (ukuran asli 1x)
    <preview>/*.png dan *.gif   (pratinjau untuk persetujuan, docs/jejak-setara/preview/)
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
from atas_ubin import MASA, NAMA_MASA, ubin_rumput   # noqa: E402
from atas_objek import POTONG_ATAP, obj_rumah_a, pisah   # noqa: E402

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

# Aset berstatus Disetujui: nama -> tanggal. Hanya aset di sini yang masuk CREDITS.md dan manifest.ts.
DISETUJUI = {}

BATAS_STRIP = 6 * 1024              # satu strip avatar atau tokoh
BATAS_TOTAL = 2 * 1024 * 1024       # seluruh aset layar pemain


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
    L.judul("Kelompok A — Avatar pemain", "Sesi C · 6 Nov 2026 · Ditinjau · 8 desain, 3 arah, diam dan jalan")
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


PREVIEWS = {"uji_gaya": pratinjau_uji_gaya, "ava_ringkasan": pratinjau_ava_ringkasan,
            "ava_pose_semua": pratinjau_ava_pose_semua}
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
        print(f"  {folder}/{nama}.png  {im.size[0]}x{im.size[1]}  {size} B")

    build_previews(args.preview, args.only)
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
