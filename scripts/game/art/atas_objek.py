"""Objek dan bangunan tampak atas Jejak Setara.

Aturan (Design System Jejak bagian 7 dan 14; keputusan Gerbang aset 6 Nov 2026, usulan 4a dan 6a):
- Garis luar INK hanya di tepi siluet (outline() dipanggil sesudah semua bagian). Cahaya dari kiri atas:
  sisi kiri dan belakang lebih terang, sisi kanan teduh.
- Bangunan dan pohon digambar utuh lalu dipotong di satu baris: bagian bawah obj_{nama}.png (lapisan 20)
  dan bagian atas obj_{nama}_atas.png (atap atau tajuk, lapisan 40).
- Bayangan di tanah bukan bagian objek: dibuat sebagai ubin tumpang di lembar ubin (kelompok U, JS-06).
- Tanpa tulisan, logo, merek, lambang instansi, atau lambang palang merah dan bulan sabit merah.
- Rumah varian a adalah objek uji gaya (preview/uji_gaya.png), disetujui sebagai acuan 6 Nov 2026.
"""
from pixelart import *  # noqa: F401,F403

POTONG_ATAP = 34      # rumah a: baris kanvas pertama milik dinding; baris 0-33 = atap (lapisan atas)


def _dalam(x, y, pts):
    """Apakah pusat piksel (x, y) berada di dalam poligon pts."""
    inside, j = False, len(pts) - 1
    for i in range(len(pts)):
        xi, yi = pts[i]; xj, yj = pts[j]
        if (yi > y + 0.5) != (yj > y + 0.5):
            if x + 0.5 < xi + (y + 0.5 - yi) * (xj - xi) / (yj - yi):
                inside = not inside
        j = i
    return inside


def _poli(c, pts, col, only=None, pola=None):
    """Isi poligon. pola='dither' = papan catur; only = hanya mengganti warna itu."""
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    for y in range(min(ys), max(ys) + 1):
        for x in range(min(xs), max(xs) + 1):
            if _dalam(x, y, pts) and (pola is None or (x + y) % 2 == 0) and (only is None or c.px[x, y] == only):
                c.p(x, y, col)


def _garis(c, x0, y0, x1, y1, col):
    """Garis Bresenham 1 px."""
    dx, dy = abs(x1 - x0), -abs(y1 - y0)
    sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
    err = dx + dy
    while True:
        c.p(x0, y0, col)
        if x0 == x1 and y0 == y1:
            break
        e2 = 2 * err
        if e2 >= dy:
            err += dy; x0 += sx
        if e2 <= dx:
            err += dx; y0 += sy


def obj_rumah_a():
    """Rumah warga varian a (O-02), 4x4 ubin: atap limasan coral, dinding cream, pintu di dinding depan."""
    c = C(66, 66)                                                                    # noqa: F405
    ox, oy = 1, 1
    # dinding depan (baris isi 33-63)
    c.r(ox + 3, oy + 33, 58, 31, CREAM)                                              # noqa: F405
    c.r(ox + 3, oy + 33, 58, 2, MIST); c.dither(ox + 3, oy + 35, 58, 2, MIST, only=CREAM)        # noqa: F405
    c.vl(ox + 60, oy + 33, oy + 63, MIST); c.dither(ox + 57, oy + 37, 3, 23, MIST, only=CREAM)  # noqa: F405
    c.r(ox + 3, oy + 60, 58, 4, SLATE); c.hl(ox + 3, ox + 60, oy + 60, MIST)        # noqa: F405  pondasi
    px, py = ox + 26, oy + 40                                                        # pintu kayu
    c.r(px, py, 12, 21, WOODD); c.r(px + 1, py + 1, 10, 20, WOOD)                    # noqa: F405
    c.vl(px + 5, py + 2, py + 19, WOODD); c.hl(px + 1, px + 10, py + 10, WOODD); c.p(px + 8, py + 12, SUN)  # noqa: F405
    c.r(px - 1, oy + 61, 14, 3, MIST); c.hl(px - 1, px + 12, oy + 63, SLATE)         # noqa: F405  anak tangga
    for wx in (ox + 9, ox + 43):                                                     # jendela bertirai rose
        c.r(wx, oy + 40, 12, 11, WOODD); c.r(wx + 1, oy + 41, 10, 9, DUSK)           # noqa: F405
        c.r(wx + 1, oy + 41, 3, 9, ROSE); c.r(wx + 7, oy + 41, 3, 9, ROSE)           # noqa: F405
        c.vl(wx + 3, oy + 41, oy + 49, CORAL); c.vl(wx + 7, oy + 41, oy + 49, CORAL)  # noqa: F405
        c.p(wx + 5, oy + 42, MIST); c.p(wx + 6, oy + 43, MIST)                       # noqa: F405
        c.hl(wx - 1, wx + 12, oy + 50, WOOD); c.hl(wx - 1, wx + 12, oy + 51, WOODD)  # noqa: F405
    # atap limasan: bubungan bergeser ke belakang karena sudut pandang 3/4.
    # Koordinat tepi: kolom L..R-1 dan baris T..B-1 terisi.
    T, B, L, R = oy + 1, oy + 31, ox + 0, ox + 64
    RY, RL, RR = oy + 8, ox + 16, ox + 48
    belakang = [(L, T), (R, T), (RR, RY), (RL, RY)]
    depan = [(RL, RY), (RR, RY), (R, B), (L, B)]
    kiri = [(L, T), (RL, RY), (L, B)]
    kanan = [(R, T), (RR, RY), (R, B)]
    for bidang in (belakang, depan, kiri, kanan):
        _poli(c, bidang, CORAL)                                                      # noqa: F405
    for y in range(RY + 4, B, 5):                     # deret genting: garis gelap di sisi depan dan kanan
        c.hl(L, R - 1, y, WOODD)                                                     # noqa: F405
    _poli(c, belakang, CORAL, only=WOODD); _poli(c, kiri, CORAL, only=WOODD)         # noqa: F405
    for y in range(T + 3, B, 5):                      # sisi yang terkena cahaya: garis terang
        for x in range(L, R):
            if c.px[x, y] == CORAL and (_dalam(x, y, belakang) or _dalam(x, y, kiri)):  # noqa: F405
                c.p(x, y, MANGO)                                                     # noqa: F405
    _poli(c, kanan, WOODD, only=CORAL, pola="dither")                               # noqa: F405  sisi kanan teduh
    _garis(c, RL, RY, L, B - 1, WOODD); _garis(c, RR - 1, RY, R - 1, B - 1, WOODD)   # noqa: F405  jurai depan
    _garis(c, RL, RY, L, T, MANGO); _garis(c, RR - 1, RY, R - 1, T, MANGO)           # noqa: F405  jurai belakang
    c.hl(RL, RR - 1, RY, MANGO); c.hl(RL, RR - 1, RY + 1, WOODD)                     # noqa: F405  bubungan
    c.r(L, B, 64, 2, WOODD); c.hl(L, R - 1, B, WOOD)                                 # noqa: F405  lis papan
    c.outline()
    return c


def pisah(c, baris):
    """Potong gambar objek di satu baris: (bagian atas, bagian bawah)."""
    atas = C(c.w, baris); atas.im.alpha_composite(c.im.crop((0, 0, c.w, baris))); atas.px = atas.im.load()  # noqa: F405
    bawah = C(c.w, c.h - baris)                                                      # noqa: F405
    bawah.im.alpha_composite(c.im.crop((0, baris, c.w, c.h))); bawah.px = bawah.im.load()
    return atas, bawah
