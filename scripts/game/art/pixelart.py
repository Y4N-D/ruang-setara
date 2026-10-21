"""Pustaka gambar piksel Sehari Setara.

Semua aset digambar lewat kode di atas kanvas logis kecil, hanya memakai warna
dari palette.json, tanpa anti-aliasing. Lihat Design_System.md bagian 10–12.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps

_PAL = json.loads(Path(__file__).with_name("palette.json").read_text())
PALETTE = {}
for group, colors in _PAL.items():
    if group.startswith("_"):
        continue
    for name, hexv in colors.items():
        PALETTE[name] = tuple(int(hexv[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
globals().update(PALETTE)          # INK, SUN, PAGI1, SK2, ... dapat dipakai langsung
T = (0, 0, 0, 0)                   # transparan
# Alias dari kode contoh pertama (19 Okt 2026)
S1, S2, S3 = PAGI1, PAGI2, PAGI3   # noqa: F821

FLOOR_Y = 156   # baris terbawah sprite tokoh berada di garis ini


class C:
    """Kanvas piksel RGBA dengan alat gambar dasar."""

    def __init__(self, w, h, bg=T):
        self.im = Image.new("RGBA", (w, h), bg)
        self.px = self.im.load()
        self.w, self.h = w, h

    def p(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.px[x, y] = c

    def r(self, x, y, w, h, c):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.p(xx, yy, c)

    def hl(self, x1, x2, y, c):
        self.r(x1, y, x2 - x1 + 1, 1, c)

    def vl(self, x, y1, y2, c):
        self.r(x, y1, 1, y2 - y1 + 1, c)

    def disc(self, cx, cy, rad, c):
        for yy in range(cy - rad, cy + rad + 1):
            for xx in range(cx - rad, cx + rad + 1):
                if (xx - cx) ** 2 + (yy - cy) ** 2 <= rad * rad + rad * 0.6:
                    self.p(xx, yy, c)

    def ring(self, cx, cy, rad, c):
        for yy in range(cy - rad - 1, cy + rad + 2):
            for xx in range(cx - rad - 1, cx + rad + 2):
                d = (xx - cx) ** 2 + (yy - cy) ** 2
                if rad * rad - rad <= d <= rad * rad + rad * 0.9:
                    self.p(xx, yy, c)

    def dither(self, x, y, w, h, c, only=None):
        """Pola papan catur (untuk cahaya/bayangan bergaya retro)."""
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                if (xx + yy) % 2 == 0 and 0 <= xx < self.w and 0 <= yy < self.h:
                    if only is None or self.px[xx, yy] == only:
                        self.px[xx, yy] = c

    def outline(self, c=None):
        """Garis luar 1 px di tepi siluet (butuh margin 1 px di kanvas)."""
        c = c or INK  # noqa: F821
        src = self.im.copy().load()
        for y in range(self.h):
            for x in range(self.w):
                if src[x, y][3] == 0 and any(
                    0 <= x + dx < self.w and 0 <= y + dy < self.h and src[x + dx, y + dy][3] > 0
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                ):
                    self.px[x, y] = c

    def paste(self, other, x, y):
        self.im.alpha_composite(other.im if isinstance(other, C) else other, (x, y))

    def place(self, sprite, cx, floor=FLOOR_Y):
        """Letakkan sprite dengan titik tengah cx dan baris terbawah di garis lantai."""
        self.paste(sprite, cx - sprite.w // 2, floor + 1 - sprite.h)


def flip(c):
    n = C(c.w, c.h)
    n.im = ImageOps.mirror(c.im)
    n.px = n.im.load()
    return n


def strip(frames):
    """Gabungkan bingkai menjadi strip horizontal berlebar bingkai seragam, rata bawah."""
    w = max(f.w for f in frames)
    h = max(f.h for f in frames)
    im = Image.new("RGBA", (w * len(frames), h), T)
    for i, f in enumerate(frames):
        im.alpha_composite(f.im, (i * w + (w - f.w) // 2, h - f.h))
    return im


def scanlines(im, k=4, amount=0.86):
    """Perbesar k kali (nearest neighbor) dan beri garis pindai, untuk pratinjau."""
    big = im.convert("RGB").resize((im.width * k, im.height * k), Image.NEAREST)
    px = big.load()
    for y in range(k - 1, big.height, k):
        for x in range(big.width):
            r, g, b = px[x, y]
            px[x, y] = (int(r * amount), int(g * amount), int(b * amount))
    return big


def palette_violations(im):
    """Kembalikan jumlah piksel yang warnanya di luar palet atau semi-transparan."""
    allowed = set(PALETTE.values())
    bad = 0
    for p in im.convert("RGBA").getdata():
        if p[3] == 0:
            continue
        if p[3] != 255 or p not in allowed:
            bad += 1
    return bad
