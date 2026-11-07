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


import math  # noqa: E402

# --------------------------------------------------------------------------- alat bantu kelompok O1
ATAP = {   # warna atap: (dasar, terang, gelap)
    "coral": (CORAL, MANGO, WOODD), "skyd": (SKYD, SIANG1, NAVY), "teal": (TEAL, SIANG2, GRASS),   # noqa: F405
    "kayu": (WOODD, WOOD, HR2), "berry": (BERRY, ROSE, MALAM1), "seng": (SLATE, MIST, DUSK),       # noqa: F405
}


def _mask(c, rows, col, x0=0, y0=0):
    """Gambar pola baris ('#' = isi) mulai dari (x0, y0)."""
    for dy, row in enumerate(rows):
        for dx, ch in enumerate(row):
            if ch == "#":
                c.p(x0 + dx, y0 + dy, col)


def _bingkai(d):
    """Beri margin 1 px dan garis luar INK pada gambar isi d."""
    c = C(d.w + 2, d.h + 2)                                                         # noqa: F405
    c.paste(d, 1, 1)
    c.outline()
    return c


def _atap_limasan(d, x0, y0, w, h, warna):
    """Atap limasan di kotak (x0, y0, w, h); dua baris terbawah = lis papan (sama dengan rumah a)."""
    dasar, terang, gelap = ATAP[warna]
    T, B, L, R = y0, y0 + h - 2, x0, x0 + w
    RY = y0 + max(3, (h - 2) // 4)
    RL, RR = x0 + w // 4, x0 + w - w // 4
    belakang = [(L, T), (R, T), (RR, RY), (RL, RY)]
    depan = [(RL, RY), (RR, RY), (R, B), (L, B)]
    kiri = [(L, T), (RL, RY), (L, B)]
    kanan = [(R, T), (RR, RY), (R, B)]
    for bidang in (belakang, depan, kiri, kanan):
        _poli(d, bidang, dasar)
    for y in range(RY + 4, B, 5):
        d.hl(L, R - 1, y, gelap)
    _poli(d, belakang, dasar, only=gelap); _poli(d, kiri, dasar, only=gelap)
    for y in range(T + 3, B, 5):
        for x in range(L, R):
            if d.px[x, y] == dasar and (_dalam(x, y, belakang) or _dalam(x, y, kiri)):
                d.p(x, y, terang)
    _poli(d, kanan, gelap, only=dasar, pola="dither")
    _garis(d, RL, RY, L, B - 1, gelap); _garis(d, RR - 1, RY, R - 1, B - 1, gelap)
    _garis(d, RL, RY, L, T, terang); _garis(d, RR - 1, RY, R - 1, T, terang)
    d.hl(RL, RR - 1, RY, terang); d.hl(RL, RR - 1, RY + 1, gelap)
    d.r(L, B, w, 2, WOODD); d.hl(L, R - 1, B, WOOD)                                  # noqa: F405


def _atap_pelana(d, x0, y0, w, h, warna, alur="datar"):
    """Atap pelana dilihat dari depan: sisi belakang terang, bubungan, deret genting atau alur seng."""
    dasar, terang, gelap = ATAP[warna]
    B = y0 + h - 2
    d.r(x0, y0, w, h - 2, dasar)
    d.dither(x0, y0, w, 3, terang, only=dasar)
    d.hl(x0, x0 + w - 1, y0 + 3, terang); d.hl(x0, x0 + w - 1, y0 + 4, gelap)
    if alur == "datar":
        for y in range(y0 + 8, B, 4):
            d.hl(x0, x0 + w - 1, y, gelap)
    else:
        for x in range(x0 + 1, x0 + w, 3):
            d.vl(x, y0 + 5, B - 1, gelap)
            d.vl(x + 1, y0 + 5, B - 1, terang)
    d.vl(x0, y0 + 5, B - 1, terang)
    d.dither(x0 + w - 4, y0 + 5, 4, B - y0 - 5, gelap, only=dasar)
    d.r(x0, B, w, 2, WOODD); d.hl(x0, x0 + w - 1, B, WOOD)                          # noqa: F405


def _dinding(d, x, y, w, h, warna=None, teduh=None):
    warna = warna or CREAM                                                           # noqa: F405
    teduh = teduh or MIST                                                            # noqa: F405
    d.r(x, y, w, h, warna)
    d.r(x, y, w, 2, teduh); d.dither(x, y + 2, w, 2, teduh, only=warna)
    d.vl(x + w - 1, y, y + h - 1, teduh)


def _pondasi(d, x, y, w, h=3):
    d.r(x, y, w, h, SLATE); d.hl(x, x + w - 1, y, MIST)                              # noqa: F405


def _pintu(d, x, y, w=10, h=18, kayu=None, gelap=None):
    kayu, gelap = kayu or WOOD, gelap or WOODD                                       # noqa: F405
    d.r(x, y, w, h, gelap); d.r(x + 1, y + 1, w - 2, h - 1, kayu)
    d.vl(x + w // 2, y + 2, y + h - 2, gelap); d.p(x + w - 3, y + h // 2, SUN)       # noqa: F405


def _jendela(d, x, y, w=10, h=9, bingkai=None, tirai=None, ambang=True):
    bingkai = bingkai or WOODD                                                       # noqa: F405
    d.r(x, y, w, h, bingkai); d.r(x + 1, y + 1, w - 2, h - 2, DUSK)                  # noqa: F405
    if tirai:
        d.r(x + 1, y + 1, 2, h - 2, tirai); d.r(x + w - 3, y + 1, 2, h - 2, tirai)
    d.p(x + w // 2 - 1, y + 2, MIST); d.p(x + w // 2, y + 3, MIST)                    # noqa: F405
    if ambang:
        d.hl(x - 1, x + w, y + h, WOOD)                                              # noqa: F405


def _barang(d, x, y, warna, lebar=3, tinggi=3, jarak=5):
    """Deret barang dagangan polos tanpa tulisan."""
    for i, w in enumerate(warna):
        d.r(x + i * jarak, y, lebar, tinggi, w)
        d.p(x + i * jarak, y, WHITE)                                                 # noqa: F405


# --------------------------------------------------------------------------- Z1 rumah dan gang
def obj_rumah_nara():
    """Rumah Nara (O-01): bentuk rumah a, pintu teal, kanopi coral di atas pintu, dua pot bunga."""
    c = obj_rumah_a()
    for y in range(41, 62):                                                          # pintu teal
        for x in range(27, 39):
            if c.px[x, y] == WOODD:                                                  # noqa: F405
                c.p(x, y, GRASS)                                                     # noqa: F405
            elif c.px[x, y] == WOOD:                                                 # noqa: F405
                c.p(x, y, TEAL)                                                      # noqa: F405
    c.r(24, 37, 18, 3, CORAL); c.hl(24, 41, 37, MANGO); c.hl(24, 41, 39, WOODD)      # noqa: F405  kanopi
    for x in (5, 57):                                                                # pot bunga
        c.r(x, 57, 4, 4, CORAL); c.hl(x, x + 3, 57, MANGO)                           # noqa: F405
        c.r(x, 53, 4, 4, LEAF); c.p(x + 1, 52, LEAF); c.p(x + 3, 54, GRASS); c.p(x, 55, GRASS)  # noqa: F405
        c.p(x + 2, 53, ROSE)                                                         # noqa: F405
    return c


def obj_rumah_b():
    """Rumah warga varian b (O-02), 3x3 ubin, atap pelana coral."""
    d = C(48, 48)                                                                    # noqa: F405
    _dinding(d, 2, 24, 44, 21); _pondasi(d, 2, 45, 44)
    _pintu(d, 6, 28, 10, 17); _jendela(d, 24, 29, 14, 9, tirai=MANGO)                # noqa: F405
    _atap_pelana(d, 0, 0, 48, 24, "coral")
    return _bingkai(d)


def obj_warung_made():
    """Warung Pak Made (O-03), 3x3 ubin: dinding papan, etalase terbuka berisi stoples polos."""
    d = C(48, 48)                                                                    # noqa: F405
    d.r(2, 22, 44, 23, WOOD); d.r(2, 22, 44, 2, WOODD)                               # noqa: F405
    for x in range(6, 46, 5):
        d.vl(x, 24, 44, WOODD)                                                       # noqa: F405
    d.r(5, 27, 38, 12, DUSK); d.hl(5, 42, 33, WOOD)                                  # noqa: F405  etalase dan rak
    _barang(d, 7, 29, (SUN, LEAF, ROSE, SKYD, MANGO, TEAL, CORAL), 3, 4)            # noqa: F405
    _barang(d, 9, 35, (CORAL, SUN, LEAF, ROSE, SKYD, MANGO), 3, 3)                   # noqa: F405
    d.r(3, 39, 42, 3, WOODD); d.hl(3, 44, 39, WOOD)                                  # noqa: F405  meja depan
    _pondasi(d, 2, 45, 44)
    _atap_pelana(d, 0, 0, 48, 22, "coral")
    return _bingkai(d)


# --------------------------------------------------------------------------- Z2 sekolah
def obj_sekolah():
    """Gedung SMP dua lantai (O-04), 10x6 ubin: atap sky-d, tangga ke lantai dua di kanan depan."""
    d = C(160, 96)                                                                   # noqa: F405
    _dinding(d, 4, 34, 152, 59); _pondasi(d, 4, 93, 152)
    for x in range(10, 126, 19):                                                     # lantai dua: jendela kelas
        _jendela(d, x, 38, 12, 10, bingkai=SLATE, ambang=False)                      # noqa: F405
    d.hl(4, 155, 52, WHITE); d.hl(4, 155, 55, SLATE)                                 # noqa: F405  pagar selasar
    for x in range(4, 156, 6):
        d.vl(x, 52, 55, SLATE)                                                       # noqa: F405
    d.r(4, 58, 152, 4, MIST); d.hl(4, 155, 61, SLATE)                                # noqa: F405  pelat lantai
    for x in (14, 58, 102):                                                          # lantai satu: pintu kelas
        _pintu(d, x, 70, 12, 23)
    for x in (32, 44, 76, 88, 118):
        _jendela(d, x, 72, 9, 10, bingkai=SLATE, ambang=False)                       # noqa: F405
    for i, y in enumerate(range(62, 93, 4)):                                         # tangga ke lantai dua
        d.r(134, y, 20, 4, MIST); d.hl(134, 153, y, WHITE); d.hl(134, 153, y + 3, SLATE)  # noqa: F405
    d.vl(133, 56, 92, SLATE); d.vl(154, 56, 92, SLATE); d.hl(133, 154, 56, SLATE)    # noqa: F405  pegangan
    _atap_limasan(d, 0, 0, 160, 34, "skyd")
    return _bingkai(d)


def obj_kantin():
    """Kantin sekolah (O-05), 4x3 ubin: jendela layan dengan jajanan polos."""
    d = C(64, 48)                                                                    # noqa: F405
    _dinding(d, 3, 22, 58, 23); _pondasi(d, 3, 45, 58)
    d.r(8, 27, 36, 10, DUSK)                                                         # noqa: F405
    _barang(d, 10, 29, (SUN, CORAL, LEAF, ROSE, MANGO, SKYD), 4, 3, 6)              # noqa: F405
    d.r(6, 37, 40, 3, WOOD); d.hl(6, 45, 39, WOODD)                                  # noqa: F405  meja layan
    _pintu(d, 49, 27, 10, 18)
    _atap_pelana(d, 0, 0, 64, 22, "skyd")
    return _bingkai(d)


def obj_tiang_bendera():
    """Tiang bendera merah putih (O-06), 1x3 ubin."""
    d = C(16, 48)                                                                    # noqa: F405
    d.r(3, 41, 10, 7, MIST); d.hl(3, 12, 41, WHITE); d.r(3, 46, 10, 2, SLATE)        # noqa: F405  alas
    d.r(7, 3, 2, 39, WHITE); d.vl(8, 3, 41, MIST); d.r(7, 1, 2, 2, SUN)              # noqa: F405  tiang dan ujung
    d.r(9, 4, 6, 3, CORAL); d.r(9, 7, 6, 3, WHITE); d.p(14, 6, T); d.p(14, 7, T)     # noqa: F405  bendera
    return _bingkai(d)


def _gerbang(terbuka):
    d = C(64, 32)                                                                    # noqa: F405
    for x in (0, 56):                                                                # pilar
        d.r(x, 4, 8, 25, CREAM); d.vl(x + 7, 4, 28, MIST); d.r(x, 29, 8, 3, SLATE)   # noqa: F405
        d.r(x, 1, 8, 3, SKYD); d.hl(x, x + 7, 1, SIANG1)                             # noqa: F405  topi pilar
    panel = ((8, 15), (48, 55)) if terbuka else ((8, 55),)
    for x0, x1 in panel:                                                             # daun gerbang besi
        d.r(x0, 9, x1 - x0 + 1, 19, DUSK); d.hl(x0, x1, 9, SLATE); d.hl(x0, x1, 27, SLATE)  # noqa: F405
        for x in range(x0 + 1, x1, 3):
            d.vl(x, 10, 26, SLATE)                                                   # noqa: F405
    if not terbuka:
        d.hl(8, 55, 18, SLATE); d.r(30, 16, 4, 4, SUN); d.p(31, 18, WOODD)           # noqa: F405  gembok
    return _bingkai(d)


def obj_gerbang_tutup():
    """Gerbang halaman lobi tertutup (O-07)."""
    return _gerbang(False)


def obj_gerbang_buka():
    """Gerbang halaman lobi terbuka (O-07)."""
    return _gerbang(True)


# --------------------------------------------------------------------------- Z3 jalan dan halte
def obj_halte():
    """Halte beratap teal dengan bangku (O-08), 3x2 ubin."""
    d = C(48, 32)                                                                    # noqa: F405
    d.r(4, 12, 40, 10, MIST); d.hl(5, 42, 13, WHITE)                                 # noqa: F405  panel belakang
    for x in (2, 44):
        d.r(x, 10, 2, 22, SLATE); d.vl(x + 1, 10, 31, DUSK)                          # noqa: F405  tiang
    d.r(8, 22, 32, 3, WOOD); d.hl(8, 39, 24, WOODD)                                  # noqa: F405  bangku
    for x in (10, 37):
        d.r(x, 25, 2, 4, WOODD)                                                      # noqa: F405
    d.r(0, 0, 48, 10, TEAL); d.hl(0, 47, 0, SIANG2); d.dither(0, 1, 48, 2, SIANG2, only=TEAL)  # noqa: F405  atap
    d.dither(36, 3, 12, 5, GRASS, only=TEAL); d.r(0, 8, 48, 2, GRASS)               # noqa: F405
    return _bingkai(d)


def obj_angkot():
    """Angkot berhenti (O-09), 3x2 ubin: sky-d bergaris putih seperti angkot Sehari Setara, tanpa tulisan."""
    d = C(48, 32)                                                                    # noqa: F405
    d.r(2, 12, 44, 12, SKYD); d.r(2, 22, 44, 2, NAVY); d.hl(2, 45, 17, WHITE)        # noqa: F405  badan
    for x in (5, 14, 23):
        d.r(x, 13, 7, 4, DUSK); d.p(x + 1, 13, MIST)                                 # noqa: F405  jendela
    d.r(32, 12, 6, 11, DUSK)                                                         # noqa: F405  pintu terbuka
    d.r(4, 2, 36, 10, SKYD); d.hl(4, 39, 2, SIANG1); d.dither(4, 3, 36, 2, SIANG1, only=SKYD)  # noqa: F405  atap
    d.r(40, 4, 6, 8, SIANG3); d.vl(45, 5, 11, MIST); d.r(40, 2, 3, 2, SKYD)          # noqa: F405  kaca depan
    d.r(43, 18, 3, 2, SUN)                                                           # noqa: F405  lampu
    for x in (7, 33):
        d.r(x, 22, 8, 8, INK); d.r(x + 2, 24, 4, 4, SLATE); d.p(x + 3, 25, MIST)     # noqa: F405  roda
    return _bingkai(d)


def _rambu(jenis):
    d = C(16, 32)                                                                    # noqa: F405
    d.r(7, 12, 2, 18, SLATE); d.vl(8, 12, 29, DUSK); d.r(5, 29, 6, 3, DUSK)          # noqa: F405  tiang
    d.r(1, 0, 14, 13, WHITE); d.r(2, 1, 12, 11, SKYD)                                # noqa: F405  papan biru
    if jenis == "seberang":                                                          # segitiga dan pejalan kaki
        for i in range(8):
            d.hl(8 - (i + 1) // 2, 7 + (i + 1) // 2, 2 + i, WHITE)                   # noqa: F405
        d.p(8, 4, INK); d.vl(8, 5, 7, INK); d.p(7, 8, INK); d.p(9, 8, INK)           # noqa: F405
    else:                                                                            # gambar angkot
        d.r(4, 3, 8, 5, WHITE); d.r(5, 4, 2, 2, DUSK); d.r(8, 4, 2, 2, DUSK)         # noqa: F405
        d.p(5, 8, INK); d.p(10, 8, INK)                                              # noqa: F405
    return _bingkai(d)


def obj_rambu_seberang():
    """Rambu tempat penyeberangan, hanya gambar (O-10)."""
    return _rambu("seberang")


def obj_rambu_halte():
    """Rambu halte angkot, hanya gambar (O-10)."""
    return _rambu("halte")


# --------------------------------------------------------------------------- Z4 pasar
def _tenda(varian):
    d = C(48, 48)                                                                    # noqa: F405
    w1, w2 = (MANGO, SUN) if varian == "a" else (SUN, MANGO)                         # noqa: F405
    for x in (3, 43):
        d.r(x, 22, 2, 26, WOOD); d.vl(x + 1, 22, 47, WOODD)                          # noqa: F405  tiang
    d.r(4, 32, 40, 3, WOOD); d.r(4, 35, 40, 6, WOODD); d.hl(4, 43, 34, MANGO)        # noqa: F405  meja
    if varian == "a":                                                                # sayur dan buah
        for x, w in ((6, CORAL), (11, LEAF), (17, SUN), (23, BERRY), (29, LEAF), (35, CORAL), (40, SUN)):  # noqa: F405
            d.r(x, 29, 4, 3, w); d.p(x, 29, WHITE)                                   # noqa: F405
    else:                                                                            # tampah berisi bumbu
        for x, w in ((6, CORAL), (16, SUN), (26, WOODD), (36, LEAF)):                # noqa: F405
            d.r(x, 29, 8, 3, WOOD); d.r(x + 1, 29, 6, 2, w); d.hl(x, x + 7, 31, WOODD)   # noqa: F405
    for y in range(22):                                                              # kanopi bergaris
        inset = max(0, (6 - y) // 2)
        for x in range(inset, 48 - inset):
            d.p(x, y, w1 if (x // 4) % 2 == 0 else w2)
    for x in range(48):
        if x % 4 in (1, 2):
            d.p(x, 22, w1 if (x // 4) % 2 == 0 else w2)
    d.dither(36, 2, 12, 20, CORAL, only=MANGO); d.dither(36, 2, 12, 20, MANGO, only=SUN)  # noqa: F405
    d.hl(3, 44, 0, WOODD)                                                            # noqa: F405  bubungan
    return _bingkai(d)


def obj_tenda_a():
    """Tenda pasar bergaris mango dan sun, berisi sayur dan buah (O-11)."""
    return _tenda("a")


def obj_tenda_b():
    """Tenda pasar bergaris sun dan mango, berisi tampah bumbu (O-11)."""
    return _tenda("b")


def obj_los():
    """Los pedagang (O-12), 6x3 ubin: atap seng, tirai bergaris, lapak sepanjang depan."""
    d = C(96, 48)                                                                    # noqa: F405
    d.r(2, 20, 92, 10, DUSK)                                                         # noqa: F405  bagian dalam
    for x in (2, 31, 62, 92):
        d.r(x, 20, 2, 26, WOOD); d.vl(x + 1, 20, 45, WOODD)                          # noqa: F405  tiang
    d.r(2, 31, 92, 3, WOOD); d.r(2, 34, 92, 7, WOODD); d.hl(2, 93, 33, MANGO)        # noqa: F405  meja lapak
    for i in range(11):
        x = 5 + i * 8
        d.r(x, 28, 6, 3, WOOD); d.r(x + 1, 28, 4, 2, (LEAF, CORAL, SUN, ROSE, MANGO, GRASS)[i % 6])  # noqa: F405
    _atap_pelana(d, 0, 0, 96, 20, "seng", alur="tegak")
    for x in range(96):                                                              # tirai bergaris di tepi atap
        d.p(x, 20, MANGO if (x // 4) % 2 == 0 else SUN)                              # noqa: F405
        if x % 4 in (1, 2):
            d.p(x, 21, MANGO if (x // 4) % 2 == 0 else SUN)                          # noqa: F405
    return _bingkai(d)


def obj_gerobak():
    """Gerobak dagangan beroda (O-13), 2x2 ubin."""
    d = C(32, 32)                                                                    # noqa: F405
    d.r(2, 0, 26, 3, TEAL); d.hl(2, 27, 0, SIANG2)                                   # noqa: F405  atap kecil
    d.r(3, 3, 2, 9, SLATE); d.r(25, 3, 2, 9, SLATE)                                  # noqa: F405
    d.r(5, 5, 20, 7, MIST); d.r(6, 6, 18, 5, SIANG3)                                 # noqa: F405  etalase kaca
    _barang(d, 7, 8, (SUN, ROSE, MANGO, LEAF), 3, 2, 4)                              # noqa: F405
    d.r(2, 12, 26, 11, WOOD); d.hl(2, 27, 12, MANGO)                                 # noqa: F405  kotak kayu
    for x in range(6, 27, 5):
        d.vl(x, 13, 22, WOODD)                                                       # noqa: F405
    d.r(28, 14, 4, 2, WOODD)                                                         # noqa: F405  pegangan
    for x in (4, 18):
        d.r(x, 22, 8, 8, INK); d.r(x + 2, 24, 4, 4, SLATE); d.p(x + 3, 25, MIST)     # noqa: F405  roda
    return _bingkai(d)


# --------------------------------------------------------------------------- Z5 balai warga
def obj_bale():
    """Bale kayu terbuka beratap wood-d (O-14), 5x4 ubin."""
    d = C(80, 64)                                                                    # noqa: F405
    d.r(2, 30, 76, 26, WOOD)                                                         # noqa: F405  lantai papan
    for y in range(33, 56, 4):
        d.hl(2, 77, y, WOODD)                                                        # noqa: F405
    d.dither(2, 30, 76, 8, WOODD, only=WOOD)                                         # noqa: F405  teduh di bawah atap
    d.r(2, 56, 76, 4, WOODD); d.hl(2, 77, 56, WOOD)                                  # noqa: F405  tepi lantai
    for x in (4, 38, 72):
        d.r(x, 60, 4, 4, SLATE)                                                      # noqa: F405  umpak
    for x in (3, 74):
        d.r(x, 30, 3, 28, WOOD); d.vl(x + 2, 30, 57, WOODD)                          # noqa: F405  tiang depan
    _atap_limasan(d, 0, 0, 80, 30, "kayu")
    return _bingkai(d)


def obj_pos_ronda():
    """Pos ronda dengan kentongan (O-15), 3x3 ubin."""
    d = C(48, 48)                                                                    # noqa: F405
    d.r(2, 24, 44, 14, WOOD)                                                         # noqa: F405  lantai panggung
    for y in range(27, 38, 3):
        d.hl(2, 45, y, WOODD)                                                        # noqa: F405
    d.dither(2, 24, 44, 5, WOODD, only=WOOD)                                         # noqa: F405
    d.r(2, 38, 44, 3, WOODD); d.hl(2, 45, 38, WOOD)                                  # noqa: F405
    for x in (3, 42):
        d.r(x, 41, 3, 7, WOODD)                                                      # noqa: F405  kaki
        d.r(x - 1, 20, 3, 18, WOOD); d.vl(x + 1, 20, 37, WOODD)                      # noqa: F405  tiang
    d.vl(37, 20, 23, WOODD); d.r(35, 24, 5, 12, WOOD); d.vl(39, 24, 35, WOODD)       # noqa: F405  kentongan
    d.vl(37, 26, 33, HR2); d.hl(35, 39, 24, MANGO)                                   # noqa: F405  celah dan ujung
    _atap_pelana(d, 0, 0, 48, 22, "kayu")
    return _bingkai(d)


# --------------------------------------------------------------------------- Z6 taman, sungai, dan pantai
def _jembatan(datar):
    if datar:
        d = C(48, 32)                                                                # noqa: F405
        d.r(0, 5, 48, 22, WOOD); d.r(0, 27, 48, 2, WOODD)                            # noqa: F405  papan dan tepi
        for x in range(3, 48, 4):
            d.vl(x, 5, 26, WOODD)                                                    # noqa: F405
        for y in (2, 24):                                                            # pagar atas dan bawah
            d.hl(0, 47, y, WOOD); d.hl(0, 47, y + 1, WOODD)                          # noqa: F405
            for x in (0, 15, 30, 46):
                d.r(x, y - 2, 2, 6, WOODD)                                           # noqa: F405
    else:
        d = C(32, 48)                                                                # noqa: F405
        d.r(5, 0, 22, 48, WOOD); d.vl(27, 0, 47, WOODD); d.vl(28, 0, 47, WOODD)      # noqa: F405
        for y in range(3, 48, 4):
            d.hl(5, 26, y, WOODD)                                                    # noqa: F405
        for x in (2, 24):
            d.vl(x, 0, 47, WOOD); d.vl(x + 1, 0, 47, WOODD)                          # noqa: F405
            for y in (0, 15, 30, 46):
                d.r(x - 1, y, 4, 2, WOODD)                                           # noqa: F405
    return _bingkai(d)


def obj_jembatan_datar():
    """Jembatan kayu mendatar, melintasi sungai yang mengalir ke selatan (O-16); bisa dilewati."""
    return _jembatan(True)


def obj_jembatan_tegak():
    """Jembatan kayu tegak, melintasi sungai yang mengalir ke timur (O-16); bisa dilewati."""
    return _jembatan(False)


def obj_kelapa():
    """Pohon kelapa (O-17): batang 1 ubin di tanah, tajuk di lapisan atas."""
    d = C(48, 64)                                                                    # noqa: F405
    for y in range(16, 62):                                                          # batang sedikit condong
        t = (61 - y) / 45
        x = int(round(21 + 5 * t * t))
        d.r(x, y, 4, 1, WOOD); d.p(x + 3, y, WOODD)                                  # noqa: F405
        if y % 3 == 0:
            d.hl(x, x + 2, y, WOODD)                                                 # noqa: F405
    d.r(20, 61, 7, 3, WOOD); d.hl(20, 26, 63, WOODD)                                 # noqa: F405  pangkal
    cx, cy = 25, 16
    # pelepah dari belakang ke depan: (sudut derajat, panjang); 0 = kanan, 90 = bawah
    for sudut, panjang in ((-150, 15), (-30, 15), (-105, 9), (-75, 9), (180, 21), (0, 21),
                           (155, 19), (25, 19), (130, 14), (50, 14), (95, 9)):
        a = math.radians(sudut)
        for t in range(panjang):
            x = int(round(cx + math.cos(a) * t))
            y = int(round(cy + math.sin(a) * t * 0.55 + 0.022 * t * t))
            tebal = 4 if t < panjang * 0.45 else 3 if t < panjang * 0.75 else 2 if t < panjang * 0.92 else 1
            atas = y - tebal // 2
            d.r(x, atas, 1, tebal, LEAF)                                             # noqa: F405
            d.p(x, atas + tebal - 1, GRASS)                                          # noqa: F405  sisi bawah teduh
            if t > 3 and t % 2 == 0 and t < panjang - 1:
                d.p(x, atas + tebal, GRASS)                                          # noqa: F405  anak daun
    d.disc(cx, cy, 3, GRASS); d.disc(cx - 1, cy - 1, 1, LEAF)                         # noqa: F405  pangkal pelepah
    d.disc(cx - 2, cy + 3, 2, WOODD); d.disc(cx + 2, cy + 3, 2, WOODD)                # noqa: F405  buah kelapa
    d.p(cx - 3, cy + 2, WOOD); d.p(cx + 1, cy + 2, WOOD)                              # noqa: F405
    return _bingkai(d)


# --------------------------------------------------------------------------- Z7 puskesmas dan kantor desa
def obj_puskesmas():
    """Puskesmas (O-18), 6x4 ubin: dinding putih, atap teal, papan bergambar hati leaf, landai di samping pintu."""
    d = C(96, 64)                                                                    # noqa: F405
    _dinding(d, 4, 30, 88, 31, warna=WHITE, teduh=MIST); _pondasi(d, 4, 61, 88)      # noqa: F405
    d.r(40, 41, 16, 20, MIST); d.r(41, 42, 6, 19, DUSK); d.r(49, 42, 6, 19, DUSK)    # noqa: F405  pintu kaca
    d.p(42, 44, SIANG3); d.p(50, 44, SIANG3)                                         # noqa: F405
    d.r(40, 33, 16, 7, MIST); d.r(41, 34, 14, 5, WHITE)                              # noqa: F405  papan
    _mask(d, ["##.##", "#####", ".###.", "..#.."], LEAF, 46, 34)                     # noqa: F405  hati
    for x in (10, 24, 62, 76):
        _jendela(d, x, 42, 10, 9, bingkai=SLATE, tirai=WHITE)                        # noqa: F405
    for i in range(10):                                                              # landai dengan pegangan
        d.hl(57, 57 + 9 - i, 61 + i // 4, MIST)                                      # noqa: F405
    d.hl(57, 70, 57, SLATE); d.vl(70, 57, 61, SLATE)                                 # noqa: F405
    _atap_limasan(d, 0, 0, 96, 30, "teal")
    return _bingkai(d)


def obj_kantor_desa():
    """Kantor desa (O-19), 6x4 ubin: dinding cream, serambi bertiang, tiang bendera kecil."""
    d = C(96, 64)                                                                    # noqa: F405
    _dinding(d, 4, 30, 88, 31); _pondasi(d, 4, 61, 88)
    for x in (10, 76):
        _jendela(d, x, 42, 10, 10)
    _pintu(d, 40, 42, 8, 19); _pintu(d, 48, 42, 8, 19)
    d.r(24, 34, 48, 5, TEAL); d.hl(24, 71, 34, SIANG2); d.hl(24, 71, 38, GRASS)      # noqa: F405  atap serambi
    for x in (26, 37, 56, 67):
        d.r(x, 39, 3, 22, WHITE); d.vl(x + 2, 39, 60, MIST)                          # noqa: F405  tiang serambi
    d.r(30, 61, 36, 3, MIST); d.hl(30, 65, 61, WHITE)                                # noqa: F405  anak tangga
    _atap_limasan(d, 0, 0, 96, 30, "teal")
    d.vl(1, 18, 63, WHITE); d.vl(2, 18, 63, MIST); d.p(1, 17, SUN)                   # noqa: F405  tiang bendera
    d.r(3, 19, 6, 2, CORAL); d.r(3, 21, 6, 2, WHITE)                                 # noqa: F405
    return _bingkai(d)


# --------------------------------------------------------------------------- Z8 pojok gawai
def obj_warung_wifi():
    """Warung berwifi (O-20), 4x3 ubin: atap berry, antena, papan bergambar sinyal, colokan, bangku panjang."""
    d = C(64, 48)                                                                    # noqa: F405
    _dinding(d, 3, 20, 58, 22)
    d.r(7, 24, 30, 9, DUSK)                                                          # noqa: F405  etalase
    _barang(d, 9, 26, (SUN, ROSE, LEAF, SKYD, MANGO), 3, 3)                          # noqa: F405
    d.r(5, 32, 34, 3, WOOD); d.hl(5, 38, 34, WOODD)                                  # noqa: F405
    d.r(42, 23, 15, 11, MIST); d.r(43, 24, 13, 9, WHITE)                             # noqa: F405  papan sinyal
    _mask(d, [".#######.", "#.......#", "..#####..", ".#.....#.", "...###...", "....#...."], TEAL, 45, 25)  # noqa: F405
    d.r(44, 36, 4, 3, WHITE); d.p(45, 37, INK); d.p(46, 37, INK)                     # noqa: F405  colokan
    d.r(4, 40, 56, 3, WOOD); d.hl(4, 59, 42, WOODD)                                  # noqa: F405  bangku panjang
    for x in (6, 56):
        d.r(x, 43, 2, 4, WOODD)                                                      # noqa: F405
    _pondasi(d, 3, 45, 58)
    _atap_pelana(d, 0, 0, 64, 20, "berry")
    d.vl(52, 0, 14, SLATE); d.hl(49, 55, 2, SLATE); d.hl(50, 54, 5, SLATE); d.p(52, 0, MIST)  # noqa: F405  antena
    return _bingkai(d)


# --------------------------------------------------------------------------- kelompok O2: objek umum
def obj_pohon():
    """Pohon rindang (O-21), 3x3 ubin: batang 1 ubin di tengah bawah, tajuk 2x2 ubin di lapisan atas."""
    d = C(48, 48)                                                                    # noqa: F405
    d.r(21, 26, 6, 19, WOOD); d.vl(25, 26, 44, WOODD); d.vl(26, 26, 44, WOODD)       # noqa: F405  batang
    d.r(19, 44, 10, 2, WOOD); d.hl(19, 28, 45, WOODD); d.p(18, 45, WOOD); d.p(29, 45, WOODD)   # noqa: F405  akar
    for cx, cy, r in ((24, 8, 7), (15, 11, 7), (33, 11, 7), (24, 15, 8), (12, 19, 7), (36, 19, 7), (20, 22, 7),
                      (29, 22, 7)):
        d.disc(cx, cy, r, LEAF)                                                      # noqa: F405  tajuk
    for y in range(48):                                                              # sisi kanan bawah teduh
        for x in range(48):
            if d.px[x, y] == LEAF and (x - 24) + (y - 14) > 10 and (x + y) % 2 == 0:  # noqa: F405
                d.p(x, y, GRASS)                                                     # noqa: F405
    for x, y in ((11, 11), (19, 6), (27, 3), (8, 18), (17, 14), (26, 10), (33, 15), (15, 22), (24, 19), (31, 22)):
        d.p(x, y, GRASS); d.hl(x + 1, x + 3, y + 1, GRASS); d.p(x + 4, y, GRASS)     # noqa: F405  gerombol daun
    return _bingkai(d)


def obj_semak():
    """Semak (O-22), 1x1 ubin."""
    d = C(16, 16)                                                                    # noqa: F405
    for cx, cy, r in ((8, 5, 4), (4, 9, 4), (11, 9, 4), (7, 11, 4)):
        d.disc(cx, cy, r, LEAF)                                                      # noqa: F405  semak
    for y in range(16):
        for x in range(16):
            if d.px[x, y] == LEAF and (x - 8) + (y - 8) > 3 and (x + y) % 2 == 0:    # noqa: F405
                d.p(x, y, GRASS)                                                     # noqa: F405
    for x, y in ((2, 7), (6, 3), (5, 10)):
        d.p(x, y, GRASS); d.hl(x + 1, x + 2, y + 1, GRASS); d.p(x + 3, y, GRASS)     # noqa: F405  gerombol daun
    return _bingkai(d)


PAGAR = {   # nama ruas: arah yang tersambung (w, e, n, s). Nama ruas tidak boleh berakhiran _atas (lihat OBJEK).
    "datar": "we", "tegak": "ns", "sudut_atas_kiri": "es", "sudut_atas_kanan": "ws",
    "sudut_bawah_kiri": "en", "sudut_bawah_kanan": "wn", "ujung_kiri": "e", "ujung_kanan": "w",
}


def _pagar(gaya, jenis):
    """Ruas pagar 1x1 ubin. Sisi yang tersambung digambar menembus tepi lalu dipotong, sehingga ruas yang
    berdampingan bersambung tanpa garis luar di tengah sambungan."""
    sambung = PAGAR[jenis]
    E = 6
    d = C(16 + 2 * E, 16 + 2 * E)                                                    # noqa: F405
    o = E                                                                            # pojok ubin di kanvas
    xa = o - E if "w" in sambung else o + 5                                          # rentang mendatar
    xb = o + 15 + E if "e" in sambung else o + 10
    ya = o - E if "n" in sambung else o + 3                                          # rentang tegak
    yb = o + 15 + E if "s" in sambung else o + 13
    tiang_tengah = jenis not in ("datar", "tegak")
    if gaya == "bambu":
        if "w" in sambung or "e" in sambung:                                         # palang mendatar
            for y in (o + 6, o + 11):
                d.hl(xa, xb, y, WOOD); d.hl(xa, xb, y + 1, WOODD)                    # noqa: F405
        if "n" in sambung or "s" in sambung:                                         # palang tegak
            d.vl(o + 6, ya, yb, WOOD); d.vl(o + 9, ya, yb, WOODD)                    # noqa: F405
        if jenis == "datar":
            tiang = [(o + 1, o + 2, 2), (o + 6, o + 2, 2), (o + 11, o + 2, 2)]
        elif jenis == "tegak":
            tiang = [(o + 6, o + 1, 4), (o + 6, o + 9, 4)]
        else:
            tiang = [(o + 6, o + 1, 4)]
        for x, y, lebar in tiang:                                                    # tiang bambu beruas
            tinggi = 6 if jenis == "tegak" else 13
            d.r(x, y, lebar, tinggi, WOOD); d.vl(x + lebar - 1, y, y + tinggi - 1, WOODD)   # noqa: F405
            for yy in range(y + 3, y + tinggi, 4):
                d.hl(x, x + lebar - 1, yy, WOODD)                                    # noqa: F405
            d.p(x + lebar - 1, y, T)                                                 # noqa: F405  ujung membulat
    else:                                                                            # tembok sekolah
        if "w" in sambung or "e" in sambung:
            d.r(xa, o + 6, xb - xa + 1, 8, CREAM); d.hl(xa, xb, o + 12, MIST); d.hl(xa, xb, o + 13, SLATE)   # noqa: F405
            d.r(xa, o + 4, xb - xa + 1, 2, SKYD); d.hl(xa, xb, o + 4, SIANG1)        # noqa: F405  tutup tembok
        if "n" in sambung or "s" in sambung:
            d.r(o + 5, ya, 6, yb - ya + 1, SKYD); d.vl(o + 5, ya, yb, SIANG1)        # noqa: F405  tembok dari atas
        if tiang_tengah:                                                             # pilar sudut
            d.r(o + 4, o + 4, 8, 10, CREAM); d.vl(o + 11, o + 4, o + 13, MIST); d.hl(o + 4, o + 11, o + 13, SLATE)  # noqa: F405
            d.r(o + 3, o + 2, 10, 3, SKYD); d.hl(o + 3, o + 12, o + 2, SIANG1)       # noqa: F405
    c = C(d.w + 2, d.h + 2)                                                          # noqa: F405
    c.paste(d, 1, 1)
    c.outline()
    hasil = C(18, 18)                                                                # noqa: F405
    hasil.im.alpha_composite(c.im.crop((E, E, E + 18, E + 18)))
    hasil.px = hasil.im.load()
    return hasil


def obj_bangku():
    """Bangku panjang kayu (O-25), 2x1 ubin."""
    d = C(32, 16)                                                                    # noqa: F405
    d.r(2, 1, 28, 3, WOOD); d.hl(2, 29, 3, WOODD)                                    # noqa: F405  sandaran
    for x in (4, 26):
        d.r(x, 4, 2, 3, WOODD)                                                       # noqa: F405
    d.r(1, 7, 30, 3, WOOD); d.hl(1, 30, 9, WOODD)                                    # noqa: F405  dudukan
    for x in (3, 27):
        d.r(x, 10, 2, 5, WOODD)                                                      # noqa: F405  kaki
    return _bingkai(d)


def obj_tempat_sampah():
    """Dua tempat sampah untuk memilah (O-26), 1x1 ubin: hijau dan kuning, tanpa tulisan."""
    d = C(16, 16)                                                                    # noqa: F405
    for x0, dasar, gelap in ((1, LEAF, GRASS), (9, SUN, MANGO)):                     # noqa: F405
        d.r(x0, 5, 6, 10, dasar); d.vl(x0 + 5, 5, 14, gelap); d.hl(x0, x0 + 5, 14, gelap)
        d.r(x0 - 1, 3, 8, 2, DUSK); d.hl(x0, x0 + 5, 3, SLATE)                       # noqa: F405  tutup
        d.hl(x0 + 2, x0 + 3, 2, DUSK)                                                # noqa: F405  pegangan
    return _bingkai(d)


def _motor(d, ox=0, oy=0):
    """Motor matik mango 32x16 tanpa garis luar, digambar mulai (ox, oy). Dipakai O-27 dan pose Dimas."""
    for cx in (6, 25):
        d.disc(ox + cx, oy + 12, 3, INK); d.disc(ox + cx, oy + 12, 1, SLATE)       # noqa: F405  roda
    d.r(ox + 8, oy + 6, 14, 5, MANGO); d.hl(ox + 8, ox + 21, oy + 6, SUN); d.hl(ox + 8, ox + 21, oy + 10, CORAL)  # noqa: F405
    d.r(ox + 7, oy + 4, 9, 2, DUSK)                                                  # noqa: F405  jok
    d.r(ox + 20, oy + 3, 3, 7, MANGO); d.vl(ox + 22, oy + 3, oy + 9, CORAL)          # noqa: F405  depan
    d.r(ox + 20, oy + 1, 5, 1, SLATE); d.p(ox + 23, oy + 4, SUN)                     # noqa: F405  setang dan lampu
    _garis(d, ox + 22, oy + 9, ox + 25, oy + 12, SLATE)                              # noqa: F405  garpu depan
    d.hl(ox + 10, ox + 15, oy + 11, SLATE)                                           # noqa: F405  pijakan kaki


def obj_motor():
    """Motor parkir (O-27), 2x1 ubin: matik mango seperti motor Dimas di Sehari Setara, tanpa merek dan pelat."""
    d = C(32, 16)                                                                    # noqa: F405
    _motor(d)
    return _bingkai(d)


def obj_tiang_lampu():
    """Tiang lampu jalan (O-28), 1x2 ubin."""
    d = C(16, 32)                                                                    # noqa: F405
    d.r(6, 6, 2, 24, SLATE); d.vl(7, 6, 29, DUSK); d.r(4, 29, 6, 3, DUSK)            # noqa: F405  tiang dan alas
    d.hl(7, 12, 5, SLATE); d.hl(7, 12, 6, DUSK)                                      # noqa: F405  lengan
    d.r(10, 6, 5, 3, MIST); d.hl(10, 14, 6, SLATE); d.r(11, 8, 3, 2, LAMPU)          # noqa: F405  kap dan lampu
    return _bingkai(d)


# --------------------------------------------------------------------------- kelompok O3: properti kejadian
# Benda kecil (kotak bekal, dompet, bola, tali lompat) digambar di tengah kanvas 1x1 ubin agar mudah diletakkan.
def obj_pengeras_suara():
    """Pengeras suara portabel (O-29, K-02)."""
    d = C(16, 16)                                                                    # noqa: F405
    d.r(3, 2, 10, 13, DUSK); d.vl(3, 2, 14, SLATE); d.hl(5, 10, 1, SLATE)            # noqa: F405  badan dan pegangan
    d.disc(8, 10, 3, INK); d.ring(8, 10, 2, SLATE); d.p(8, 10, MIST)                 # noqa: F405  corong bawah
    d.r(7, 4, 3, 3, INK); d.p(8, 5, SLATE)                                           # noqa: F405  corong atas
    return _bingkai(d)


def obj_kotak_bekal():
    """Kotak bekal (O-30, K-03)."""
    d = C(16, 16)                                                                    # noqa: F405
    d.r(4, 7, 8, 6, SKYD); d.r(4, 7, 8, 2, MIST); d.hl(4, 11, 9, NAVY); d.r(7, 8, 2, 2, WHITE)   # noqa: F405
    return _bingkai(d)


def obj_kursi_roda():
    """Kursi roda kosong (O-31, K-04)."""
    d = C(16, 16)                                                                    # noqa: F405
    for x in (0, 14):
        d.r(x, 4, 2, 11, INK); d.vl(x + (1 if x == 0 else 0), 5, 13, SLATE); d.p(x, 4, SLATE); d.p(x, 14, SLATE)   # noqa: F405
    d.r(3, 1, 10, 7, DUSK); d.hl(3, 12, 1, SLATE); d.vl(3, 1, 8, SLATE); d.vl(12, 1, 8, SLATE)   # noqa: F405  sandaran
    d.r(2, 0, 2, 2, SLATE); d.r(12, 0, 2, 2, SLATE)                                  # noqa: F405  pegangan dorong
    d.r(3, 8, 10, 3, DUSK); d.hl(3, 12, 8, SLATE)                                    # noqa: F405  dudukan
    d.vl(4, 11, 13, SLATE); d.vl(11, 11, 13, SLATE); d.r(4, 13, 8, 1, SLATE); d.hl(4, 11, 14, MIST)   # noqa: F405
    return _bingkai(d)


def obj_tiang_kamera():
    """Tiang dengan kamera keamanan kecil (O-32, K-07), 1x2 ubin."""
    d = C(16, 32)                                                                    # noqa: F405
    d.r(7, 6, 2, 24, SLATE); d.vl(8, 6, 29, DUSK); d.r(5, 29, 6, 3, DUSK)            # noqa: F405  tiang
    d.hl(8, 10, 6, SLATE)                                                            # noqa: F405  lengan
    d.r(9, 3, 6, 4, MIST); d.vl(14, 3, 6, SLATE); d.hl(9, 13, 2, WHITE)              # noqa: F405  badan kamera
    d.p(14, 5, INK); d.p(10, 4, CORAL)                                               # noqa: F405  lensa dan lampu
    return _bingkai(d)


def obj_lapak():
    """Lapak sayur dan buah (O-33, K-07), 2x2 ubin."""
    d = C(32, 32)                                                                    # noqa: F405
    d.r(2, 14, 28, 4, WOOD); d.hl(2, 29, 14, SK2); d.r(2, 18, 28, 6, WOODD)          # noqa: F405  meja
    for x in (3, 27):
        d.r(x, 24, 2, 6, WOODD)                                                      # noqa: F405  kaki
    for x, w in ((4, LEAF), (13, CORAL), (22, SUN)):                                 # noqa: F405  keranjang berisi
        d.r(x, 9, 7, 5, WOOD); d.hl(x, x + 6, 13, WOODD); d.r(x + 1, 7, 5, 4, w); d.p(x + 1, 7, WHITE)   # noqa: F405
    d.r(6, 25, 9, 6, WOOD); d.hl(6, 14, 27, WOODD); d.hl(6, 14, 29, WOODD)          # noqa: F405  peti di depan
    d.r(7, 23, 7, 2, BERRY); d.p(8, 23, ROSE)                                        # noqa: F405  terung
    return _bingkai(d)


def obj_dompet():
    """Dompet tanpa tulisan (O-34, K-08)."""
    d = C(16, 16)                                                                    # noqa: F405
    d.r(4, 8, 8, 5, WOODD); d.r(4, 8, 8, 2, WOOD); d.p(10, 10, SUN); d.hl(5, 10, 12, HR2)   # noqa: F405
    return _bingkai(d)


def obj_bangku_pasar():
    """Bangku pasar tanpa sandaran (O-35, K-08), 2x1 ubin."""
    d = C(32, 16)                                                                    # noqa: F405
    d.r(1, 5, 30, 3, WOOD); d.hl(1, 30, 5, SK2); d.hl(1, 30, 7, WOODD)              # noqa: F405
    for x in (3, 27):
        d.r(x, 8, 2, 6, WOODD)                                                       # noqa: F405
    d.hl(4, 27, 11, WOODD)                                                           # noqa: F405  penyangga
    return _bingkai(d)


def obj_pos_keamanan():
    """Pos keamanan pasar tanpa tulisan (O-36, K-08), 2x2 ubin."""
    d = C(32, 32)                                                                    # noqa: F405
    _dinding(d, 2, 12, 28, 17, warna=MIST, teduh=SLATE); _pondasi(d, 2, 29, 28)      # noqa: F405
    _jendela(d, 5, 16, 11, 8, bingkai=SLATE)                                         # noqa: F405  loket
    _pintu(d, 19, 15, 8, 14, kayu=SLATE, gelap=DUSK)                                 # noqa: F405
    _atap_pelana(d, 0, 0, 32, 12, "seng", alur="tegak")
    return _bingkai(d)


def obj_meja_panitia():
    """Meja panitia dengan kertas rencana tanpa tulisan (O-37, K-09, K-10), 2x1 ubin."""
    d = C(32, 16)                                                                    # noqa: F405
    d.r(1, 3, 30, 5, WOOD); d.hl(1, 30, 3, SK2); d.r(1, 8, 30, 3, WOODD)             # noqa: F405  meja
    for x in (2, 28):
        d.r(x, 11, 2, 4, WOODD)                                                      # noqa: F405
    d.r(4, 4, 6, 3, WHITE); d.p(9, 6, MIST); d.r(12, 3, 5, 4, WHITE); d.p(16, 3, MIST)   # noqa: F405  kertas polos
    d.hl(19, 22, 5, SUN); d.p(23, 5, INK); d.r(25, 4, 4, 3, WHITE); d.hl(25, 28, 6, MIST)   # noqa: F405  pensil, tumpukan
    return _bingkai(d)


def obj_sisa_piknik():
    """Tikar dan sisa piknik berupa sampah plastik (O-38, K-11), 2x1 ubin."""
    d = C(32, 16)                                                                    # noqa: F405
    d.r(1, 2, 30, 12, SK2)                                                           # noqa: F405  tikar
    for x in range(3, 30, 4):
        d.vl(x, 2, 13, WOOD)                                                         # noqa: F405  anyaman
    for y in (5, 9):
        d.hl(1, 30, y, WOOD)                                                         # noqa: F405
    d.r(5, 6, 4, 2, SIANG3); d.p(9, 6, MIST)                                         # noqa: F405  botol plastik
    d.r(14, 7, 3, 3, CORAL); d.p(15, 8, SUN)                                         # noqa: F405  bungkus makanan
    d.r(21, 4, 4, 3, WHITE); d.p(24, 6, MIST)                                        # noqa: F405  kantong plastik
    d.r(25, 9, 3, 2, SUN)                                                            # noqa: F405
    return _bingkai(d)


def obj_bola():
    """Bola (O-39, K-12)."""
    d = C(16, 16)                                                                    # noqa: F405
    d.disc(8, 10, 3, WHITE)                                                          # noqa: F405
    for x, y in ((8, 10), (7, 8), (10, 9), (6, 11), (9, 12)):
        d.p(x, y, DUSK)                                                              # noqa: F405
    return _bingkai(d)


def obj_tali_lompat():
    """Tali lompat tergeletak di tanah (O-40, K-12)."""
    d = C(16, 16)                                                                    # noqa: F405
    for i in range(0, 181, 6):
        a = math.radians(180 + i)
        d.p(int(round(8 + 5 * math.cos(a))), int(round(12 + 6 * math.sin(a))), CORAL)   # noqa: F405
    d.r(2, 12, 2, 3, WOOD); d.r(12, 12, 2, 3, WOOD)                                  # noqa: F405  pegangan
    return _bingkai(d)


def obj_bangku_antrean():
    """Bangku antrean puskesmas (O-41, K-13), 3x1 ubin: empat kursi plastik bersambung."""
    d = C(48, 16)                                                                    # noqa: F405
    d.r(1, 11, 46, 1, SLATE)                                                         # noqa: F405  rangka
    for x in (3, 44):
        d.r(x, 11, 1, 4, SLATE)                                                      # noqa: F405
    for i in range(4):
        x = 2 + i * 11
        d.r(x, 2, 10, 5, SKYD); d.hl(x, x + 9, 2, SIANG1)                            # noqa: F405  sandaran
        d.r(x, 7, 10, 3, SKYD); d.hl(x, x + 9, 9, NAVY)                              # noqa: F405  dudukan
    return _bingkai(d)


# --------------------------------------------------------------------------- kelompok O4: varian untuk peta besar
def obj_rumah_c():
    """Rumah warga varian c (O-43), 5x4 ubin: atap pelana coral, dinding peach, teras bertiang dengan bangku."""
    d = C(80, 64)                                                                    # noqa: F405
    _dinding(d, 3, 28, 74, 33, warna=PAGI3, teduh=SK2); _pondasi(d, 3, 61, 74)       # noqa: F405
    for x in (6, 28):
        d.r(x, 33, 2, 28, WOOD); d.vl(x + 1, 33, 60, WOODD)                          # noqa: F405  tiang teras
    d.r(10, 52, 14, 2, WOOD); d.hl(10, 23, 53, WOODD); d.r(11, 54, 2, 4, WOODD); d.r(21, 54, 2, 4, WOODD)   # noqa: F405
    _jendela(d, 12, 38, 12, 9, tirai=LEAF)                                           # noqa: F405
    _pintu(d, 36, 40, 12, 21)
    _jendela(d, 56, 38, 12, 9, tirai=LEAF)                                           # noqa: F405
    _atap_pelana(d, 0, 0, 80, 28, "coral")
    d.r(3, 28, 28, 3, CORAL); d.hl(3, 30, 28, MANGO); d.hl(3, 30, 30, WOODD)         # noqa: F405  atap teras
    return _bingkai(d)


def obj_rumah_d():
    """Rumah warga varian d (O-44), 3x3 ubin: atap limasan coral, dinding mist, pintu di kanan."""
    d = C(48, 48)                                                                    # noqa: F405
    _dinding(d, 3, 24, 42, 21, warna=MIST, teduh=SLATE); _pondasi(d, 3, 45, 42)      # noqa: F405
    _jendela(d, 8, 29, 12, 9, tirai=SUN)                                             # noqa: F405
    _pintu(d, 30, 28, 10, 17)
    _atap_limasan(d, 0, 0, 48, 24, "coral")
    return _bingkai(d)


def _tajuk(d, gerombol, dasar, gelap, terang=None, tengah=(24, 14), batas=10):
    for cx, cy, r in gerombol:
        d.disc(cx, cy, r, dasar)
    for y in range(d.h):
        for x in range(d.w):
            if d.px[x, y] == dasar and (x - tengah[0]) + (y - tengah[1]) > batas and (x + y) % 2 == 0:
                d.p(x, y, gelap)
    return d


def obj_pohon_b():
    """Pohon rindang gelap (O-45), 3x3 ubin: tajuk bulat grass dengan lengkung daun leaf."""
    d = C(48, 48)                                                                    # noqa: F405
    d.r(21, 26, 6, 19, WOOD); d.vl(25, 26, 44, WOODD); d.vl(26, 26, 44, WOODD)       # noqa: F405
    d.r(19, 44, 10, 2, WOOD); d.hl(19, 28, 45, WOODD)                                # noqa: F405
    _tajuk(d, ((24, 13, 12), (13, 18, 8), (35, 18, 8), (24, 22, 9)), GRASS, DUSK, tengah=(24, 13), batas=12)   # noqa: F405
    for x, y in ((11, 13), (18, 7), (27, 4), (9, 19), (17, 14), (26, 10), (32, 15), (20, 21)):
        d.p(x, y, LEAF); d.hl(x + 1, x + 3, y + 1, LEAF); d.p(x + 4, y, LEAF)        # noqa: F405  lengkung daun terang
    return _bingkai(d)


def obj_pohon_c():
    """Pohon berbunga (O-46), 3x3 ubin: tajuk leaf dengan bunga rose dan putih."""
    d = C(48, 48)                                                                    # noqa: F405
    d.r(21, 26, 6, 19, WOOD); d.vl(25, 26, 44, WOODD); d.vl(26, 26, 44, WOODD)       # noqa: F405
    d.r(19, 44, 10, 2, WOOD); d.hl(19, 28, 45, WOODD)                                # noqa: F405
    _tajuk(d, ((24, 9, 8), (14, 13, 8), (34, 13, 8), (24, 17, 10), (17, 22, 6), (31, 22, 6)), LEAF, GRASS)   # noqa: F405
    for x, y in ((12, 15), (20, 8), (29, 6), (16, 20), (26, 14), (33, 18), (22, 24)):
        d.p(x, y, GRASS); d.hl(x + 1, x + 2, y + 1, GRASS); d.p(x + 3, y, GRASS)     # noqa: F405
    for i, (x, y) in enumerate(((10, 11), (17, 5), (25, 3), (33, 9), (14, 18), (22, 12), (30, 15), (37, 16),
                                (19, 26), (27, 25), (24, 19), (11, 22))):
        w = ROSE if i % 3 else WHITE                                                 # noqa: F405
        d.p(x, y, w); d.p(x + 1, y, w); d.p(x, y + 1, w if i % 2 else SUN)           # noqa: F405  bunga
    return _bingkai(d)


def obj_pohon_kecil():
    """Pohon muda (O-47), 1x2 ubin: batang 1 ubin, tajuk kecil."""
    d = C(16, 32)                                                                    # noqa: F405
    d.r(7, 14, 2, 17, WOOD); d.vl(8, 14, 30, WOODD); d.r(5, 30, 6, 2, WOOD); d.hl(5, 10, 31, WOODD)   # noqa: F405
    _tajuk(d, ((8, 7, 6), (5, 10, 4), (11, 10, 4)), LEAF, GRASS, tengah=(8, 7), batas=4)   # noqa: F405
    for x, y in ((4, 7), (8, 3), (9, 9)):
        d.p(x, y, GRASS); d.hl(x + 1, x + 2, y + 1, GRASS); d.p(x + 3, y, GRASS)     # noqa: F405
    return _bingkai(d)


def obj_pisang():
    """Pohon pisang (O-48), 3x3 ubin: batang semu di tengah, daun lebar, setandan pisang."""
    d = C(48, 48)                                                                    # noqa: F405
    d.r(22, 24, 4, 22, GRASS); d.vl(22, 24, 45, LEAF); d.p(24, 30, WOODD); d.p(23, 37, WOODD)   # noqa: F405  batang
    d.r(20, 45, 8, 2, GRASS); d.hl(20, 27, 46, WOODD)                                # noqa: F405
    for sudut, panjang in ((-155, 20), (-115, 15), (-65, 15), (-25, 20), (165, 15), (15, 15)):
        a = math.radians(sudut)
        for t in range(3, panjang):
            x = int(round(24 + math.cos(a) * t))
            y = int(round(22 + math.sin(a) * t * 0.7 + 0.035 * t * t))
            lebar = 5 if t < panjang * 0.55 else 4 if t < panjang * 0.8 else 2
            atas = y - lebar // 2
            d.r(x, atas, 1, lebar, LEAF); d.p(x, atas + lebar - 1, GRASS)            # noqa: F405  helai daun lebar
            if t % 3 == 0:
                d.p(x, atas + lebar // 2, GRASS)                                     # noqa: F405  tulang daun
    d.r(26, 24, 4, 5, SUN); d.p(29, 24, MANGO); d.p(27, 28, MANGO)                   # noqa: F405  setandan pisang
    d.r(27, 29, 2, 3, BERRY)                                                         # noqa: F405  jantung pisang
    return _bingkai(d)


def obj_semak_b():
    """Semak berbunga (O-49), 1x1 ubin."""
    c = obj_semak()
    for i, (x, y) in enumerate(((5, 7), (10, 6), (7, 11), (12, 10), (4, 10))):
        c.p(x, y, ROSE if i % 2 == 0 else WHITE)                                     # noqa: F405
    return c


def obj_pot_tanaman():
    """Pot tanaman di depan rumah (O-50), 1x1 ubin."""
    d = C(16, 16)                                                                    # noqa: F405
    d.r(4, 10, 8, 5, CORAL); d.hl(4, 11, 10, MANGO); d.vl(11, 11, 14, WOODD)         # noqa: F405  pot
    for cx, cy, r in ((8, 6, 4), (5, 8, 3), (11, 8, 3)):
        d.disc(cx, cy, r, LEAF)                                                      # noqa: F405
    d.p(7, 4, GRASS); d.hl(8, 9, 5, GRASS); d.p(10, 4, GRASS); d.p(6, 8, ROSE); d.p(10, 7, SUN)   # noqa: F405
    return _bingkai(d)


def obj_batu():
    """Batu besar di tepi sungai atau taman (O-51), 1x1 ubin."""
    d = C(16, 16)                                                                    # noqa: F405
    d.disc(8, 9, 6, MIST); d.r(2, 12, 13, 3, MIST)                                   # noqa: F405
    for y in range(16):
        for x in range(16):
            if d.px[x, y] == MIST and (x - 8) + (y - 8) > 3 and (x + y) % 2 == 0:    # noqa: F405
                d.p(x, y, SLATE)                                                     # noqa: F405
    d.hl(5, 7, 5, WHITE); d.p(4, 6, WHITE); d.hl(2, 14, 14, SLATE)                   # noqa: F405
    return _bingkai(d)


# --------------------------------------------------------------------------- daftar objek
# nama: (fungsi, ukuran dalam ubin (lebar, tinggi), baris potong kanvas atau None, kotak padat [(x, y, l, t)] dalam
#        ubin relatif terhadap pojok kiri atas, jenis bayangan di tanah, bisa dilewati?)
# Nama objek tidak boleh berakhiran _atas, karena akhiran itu dipakai berkas bagian atas (obj_{nama}_atas.png).
# Jenis bayangan: "kotak" = bayangan bangunan U-13 mengikuti tapak; "pohon" = U-14 2x2 di bawah tajuk;
# "kecil" = U-14 1x1 di ubin batang (pohon kelapa); None = tanpa bayangan (tiang, rambu, gerbang, jembatan).
OBJEK = {
    "rumah_nara": (obj_rumah_nara, (4, 4), POTONG_ATAP, [(0, 1, 4, 3)], "kotak", False),
    "rumah_a": (obj_rumah_a, (4, 4), POTONG_ATAP, [(0, 1, 4, 3)], "kotak", False),
    "rumah_b": (obj_rumah_b, (3, 3), 25, [(0, 1, 3, 2)], "kotak", False),
    "warung_made": (obj_warung_made, (3, 3), 23, [(0, 1, 3, 2)], "kotak", False),
    "sekolah": (obj_sekolah, (10, 6), 35, [(0, 1, 10, 5)], "kotak", False),
    "kantin": (obj_kantin, (4, 3), 23, [(0, 1, 4, 2)], "kotak", False),
    "tiang_bendera": (obj_tiang_bendera, (1, 3), 33, [(0, 2, 1, 1)], None, False),
    "gerbang_tutup": (obj_gerbang_tutup, (4, 2), 17, [(0, 1, 4, 1)], None, False),
    "gerbang_buka": (obj_gerbang_buka, (4, 2), 17, [(0, 1, 1, 1), (3, 1, 1, 1)], None, False),
    "halte": (obj_halte, (3, 2), 11, [(0, 1, 3, 1)], "kotak", False),
    "angkot": (obj_angkot, (3, 2), 13, [(0, 1, 3, 1)], "kotak", False),
    "rambu_seberang": (obj_rambu_seberang, (1, 2), 17, [(0, 1, 1, 1)], None, False),
    "rambu_halte": (obj_rambu_halte, (1, 2), 17, [(0, 1, 1, 1)], None, False),
    "tenda_a": (obj_tenda_a, (3, 3), 24, [(0, 1, 3, 2)], "kotak", False),
    "tenda_b": (obj_tenda_b, (3, 3), 24, [(0, 1, 3, 2)], "kotak", False),
    "los": (obj_los, (6, 3), 22, [(0, 1, 6, 2)], "kotak", False),
    "gerobak": (obj_gerobak, (2, 2), 13, [(0, 1, 2, 1)], "kotak", False),
    "bale": (obj_bale, (5, 4), 31, [(0, 1, 5, 3)], "kotak", False),
    "pos_ronda": (obj_pos_ronda, (3, 3), 23, [(0, 1, 3, 2)], "kotak", False),
    "jembatan_datar": (obj_jembatan_datar, (3, 2), None, [], None, True),
    "jembatan_tegak": (obj_jembatan_tegak, (2, 3), None, [], None, True),
    "kelapa": (obj_kelapa, (3, 4), 35, [(1, 3, 1, 1)], "kecil", False),
    "puskesmas": (obj_puskesmas, (6, 4), 31, [(0, 1, 6, 3)], "kotak", False),
    "kantor_desa": (obj_kantor_desa, (6, 4), 31, [(0, 1, 6, 3)], "kotak", False),
    "warung_wifi": (obj_warung_wifi, (4, 3), 21, [(0, 1, 4, 2)], "kotak", False),
    # kelompok O2
    "pohon": (obj_pohon, (3, 3), 29, [(1, 2, 1, 1)], "pohon", False),
    "semak": (obj_semak, (1, 1), None, [(0, 0, 1, 1)], "kecil", False),
    "bangku": (obj_bangku, (2, 1), None, [(0, 0, 2, 1)], None, False),
    "tempat_sampah": (obj_tempat_sampah, (1, 1), None, [(0, 0, 1, 1)], "kecil", False),
    "motor": (obj_motor, (2, 1), None, [(0, 0, 2, 1)], "kecil", False),
    "tiang_lampu": (obj_tiang_lampu, (1, 2), 17, [(0, 1, 1, 1)], None, False),
    # kelompok O3 (benda kecil tanpa kotak padat bisa dilewati)
    "pengeras_suara": (obj_pengeras_suara, (1, 1), None, [(0, 0, 1, 1)], "kecil", False),
    "kotak_bekal": (obj_kotak_bekal, (1, 1), None, [], None, False),
    "kursi_roda": (obj_kursi_roda, (1, 1), None, [(0, 0, 1, 1)], "kecil", False),
    "tiang_kamera": (obj_tiang_kamera, (1, 2), 17, [(0, 1, 1, 1)], None, False),
    "lapak": (obj_lapak, (2, 2), None, [(0, 1, 2, 1)], "kotak", False),
    "dompet": (obj_dompet, (1, 1), None, [], None, False),
    "bangku_pasar": (obj_bangku_pasar, (2, 1), None, [(0, 0, 2, 1)], None, False),
    "pos_keamanan": (obj_pos_keamanan, (2, 2), 13, [(0, 1, 2, 1)], "kotak", False),
    "meja_panitia": (obj_meja_panitia, (2, 1), None, [(0, 0, 2, 1)], None, False),
    "sisa_piknik": (obj_sisa_piknik, (2, 1), None, [], None, False),
    "bola": (obj_bola, (1, 1), None, [], None, False),
    "tali_lompat": (obj_tali_lompat, (1, 1), None, [], None, False),
    "bangku_antrean": (obj_bangku_antrean, (3, 1), None, [(0, 0, 3, 1)], None, False),
    # kelompok O4: varian untuk peta 160 x 100
    "rumah_c": (obj_rumah_c, (5, 4), 29, [(0, 1, 5, 3)], "kotak", False),
    "rumah_d": (obj_rumah_d, (3, 3), 25, [(0, 1, 3, 2)], "kotak", False),
    "pohon_b": (obj_pohon_b, (3, 3), 29, [(1, 2, 1, 1)], "pohon", False),
    "pohon_c": (obj_pohon_c, (3, 3), 29, [(1, 2, 1, 1)], "pohon", False),
    "pohon_kecil": (obj_pohon_kecil, (1, 2), 17, [(0, 1, 1, 1)], "kecil", False),
    "pisang": (obj_pisang, (3, 3), 25, [(1, 2, 1, 1)], "kecil", False),
    "semak_b": (obj_semak_b, (1, 1), None, [(0, 0, 1, 1)], "kecil", False),
    "pot_tanaman": (obj_pot_tanaman, (1, 1), None, [(0, 0, 1, 1)], None, False),
    "batu": (obj_batu, (1, 1), None, [(0, 0, 1, 1)], "kecil", False),
}
for _gaya in ("bambu", "sekolah"):
    for _jenis in PAGAR:
        OBJEK[f"pagar_{_gaya}_{_jenis}"] = ((lambda g, j: (lambda: _pagar("bambu" if g == "bambu" else "tembok", j)))(
            _gaya, _jenis), (1, 1), None, [(0, 0, 1, 1)], None, False)
KODE_OBJEK = {"rumah_nara": "O-01", "rumah_a": "O-02", "rumah_b": "O-02", "warung_made": "O-03", "sekolah": "O-04",
              "kantin": "O-05", "tiang_bendera": "O-06", "gerbang_tutup": "O-07", "gerbang_buka": "O-07",
              "halte": "O-08", "angkot": "O-09", "rambu_seberang": "O-10", "rambu_halte": "O-10",
              "tenda_a": "O-11", "tenda_b": "O-11", "los": "O-12", "gerobak": "O-13", "bale": "O-14",
              "pos_ronda": "O-15", "jembatan_datar": "O-16", "jembatan_tegak": "O-16", "kelapa": "O-17",
              "puskesmas": "O-18", "kantor_desa": "O-19", "warung_wifi": "O-20",
              "pohon": "O-21", "semak": "O-22", "bangku": "O-25", "tempat_sampah": "O-26", "motor": "O-27",
              "tiang_lampu": "O-28", "pengeras_suara": "O-29", "kotak_bekal": "O-30", "kursi_roda": "O-31",
              "tiang_kamera": "O-32", "lapak": "O-33", "dompet": "O-34", "bangku_pasar": "O-35",
              "pos_keamanan": "O-36", "meja_panitia": "O-37", "sisa_piknik": "O-38", "bola": "O-39",
              "tali_lompat": "O-40", "bangku_antrean": "O-41", "rumah_c": "O-43", "rumah_d": "O-44",
              "pohon_b": "O-45", "pohon_c": "O-46", "pohon_kecil": "O-47", "pisang": "O-48", "semak_b": "O-49",
              "pot_tanaman": "O-50", "batu": "O-51"}
for _jenis in PAGAR:
    KODE_OBJEK[f"pagar_bambu_{_jenis}"] = "O-23"
    KODE_OBJEK[f"pagar_sekolah_{_jenis}"] = "O-24"


def pisah(c, baris):
    """Potong gambar objek di satu baris: (bagian atas, bagian bawah)."""
    atas = C(c.w, baris); atas.im.alpha_composite(c.im.crop((0, 0, c.w, baris))); atas.px = atas.im.load()  # noqa: F405
    bawah = C(c.w, c.h - baris)                                                      # noqa: F405
    bawah.im.alpha_composite(c.im.crop((0, baris, c.w, c.h))); bawah.px = bawah.im.load()
    return atas, bawah
