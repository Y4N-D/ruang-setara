"""Penanda dan ikon tampak atas Jejak Setara.

Aturan (Design System Jejak bagian 9, 11, dan 14):
- Hanya warna palet. Penanda bergaris luar INK (kanvas bermargin 1 px, outline() dipanggil terakhir), dan
  maknanya tidak hanya lewat warna: setiap penanda punya bentuk dan tanda sendiri.
- Efek (debu, kilau) tanpa garis luar.
- Berkas tanda_*.png disimpan di folder ikon/ (Architecture bagian 3 tidak mempunyai folder tanda/).
Kelompok T:
  tanda_kejadian 12x12, tanda_dibuka 12x12, tanda_selesai 10x10        gelembung
  tanda_kotak_{skill}   3 bingkai 14x12: kecil, besar berkilau, biasa (peti biasa 12x10)
  tanda_kompas          16 bingkai 7x7: 8 arah searah jarum jam mulai atas, 2 bingkai denyut per arah
  tanda_diri            4 bingkai 7x7: bawah, atas, kanan, kiri
  tanda_debu            2 bingkai 8x6;  tanda_kilau  2 bingkai 8x8
"""
from pixelart import *  # noqa: F401,F403


def _mask(c, rows, col, x0=0, y0=0):
    for dy, row in enumerate(rows):
        for dx, ch in enumerate(row):
            if ch == "#":
                c.p(x0 + dx, y0 + dy, col)


# --------------------------------------------------------------------------- gelembung kejadian
def _gelembung(ukuran, isi):
    c = C(ukuran, ukuran)                                                            # noqa: F405
    r = (ukuran - 2) / 2
    pusat = (ukuran - 1) / 2
    for y in range(ukuran):
        for x in range(ukuran):
            if (x - pusat) ** 2 + (y - pusat) ** 2 <= (r - 0.2) ** 2:
                c.p(x, y, isi)
    c.p(3, 3, WHITE); c.p(3, 4, WHITE); c.p(4, 3, WHITE)                             # noqa: F405  kilau kiri atas
    return c


def tanda_kejadian():
    """T-01: gelembung sun bertanda seru, ada kejadian yang bisa diperiksa."""
    c = _gelembung(12, SUN)                                                          # noqa: F405
    c.r(5, 2, 2, 5, INK); c.r(5, 8, 2, 2, INK)                                       # noqa: F405
    c.outline()
    return c


def tanda_dibuka():
    """T-02: gelembung mist bertanda tiga titik, dialog sedang terbuka."""
    c = _gelembung(12, MIST)                                                         # noqa: F405
    for x in (2, 5, 8):
        c.r(x, 5, 2, 2, INK)                                                         # noqa: F405
    c.outline()
    return c


def tanda_selesai():
    """T-03: gelembung kecil leaf bertanda centang, kejadian sudah dijawab."""
    c = _gelembung(10, LEAF)                                                         # noqa: F405
    c.p(3, 3, LEAF); c.p(4, 3, LEAF); c.p(2, 3, WHITE)                               # noqa: F405
    _mask(c, ["....#", "...##", "#.##.", "###..", ".#..."], INK, 2, 2)               # noqa: F405
    c.outline()
    return c


# --------------------------------------------------------------------------- kotak bantuan
IKON_TUTUP = {   # skill: (pola 6x3 di tutup peti, warna, warna kedua untuk huruf "o")
    "sepatu": ([".##...", ".####o", "oooooo"], CORAL, WHITE),                        # noqa: F405  Lari cepat
    "kompas": ([".###..", "#.#.#.", ".###.."], WHITE, TEAL),                         # noqa: F405  Kompas kejadian
    "buku": (["##.##.", "#####.", "ooooo."], WHITE, SKYD),                           # noqa: F405  Petunjuk
    "teropong": (["oo.oo.", "##.##.", "#####."], DUSK, MIST),                        # noqa: F405  Teropong (P1)
    "karcis": (["######", "##o###", "######"], SUN, WOODD),                          # noqa: F405  Angkot (P1)
}


def _peti(w, h, skill):
    """Peti kayu w x h (tanpa margin); tutup dilihat dari atas, sisi depan bergesper."""
    c = C(w + 2, h + 2)                                                              # noqa: F405
    tutup = h // 2
    c.r(1, 1, w, tutup, WOOD); c.hl(1, w, 1, SK2)                                    # noqa: F405  tutup, sisi terang
    c.hl(1, w, tutup, WOODD)                                                         # noqa: F405  tepi tutup
    c.r(1, tutup + 1, w, h - tutup, WOOD); c.vl(w, tutup + 1, h, WOODD)              # noqa: F405  sisi depan
    c.hl(1, w, h, WOODD)                                                             # noqa: F405
    tengah = 1 + w // 2
    c.r(tengah - 1, tutup, 2, 2, SLATE); c.p(tengah - 1, tutup + 1, SUN)             # noqa: F405  gesper
    pola, warna, kedua = IKON_TUTUP[skill]
    if w >= 10:
        x0 = 1 + (w - 6) // 2
        for dy, baris in enumerate(pola):
            for dx, ch in enumerate(baris):
                if ch == "#":
                    c.p(x0 + dx, 2 + dy - (1 if tutup < 4 else 0), warna)
                elif ch == "o":
                    c.p(x0 + dx, 2 + dy - (1 if tutup < 4 else 0), kedua)
    else:
        c.r(tengah - 2, 2, 3, 1, warna); c.p(tengah, 2, kedua)                       # tanda kecil
    c.outline()
    return c


def _kilau_di(c, titik):
    for x, y, w in titik:
        if 0 <= x < c.w and 0 <= y < c.h and c.px[x, y][3] == 0:
            c.px[x, y] = w


def tanda_kotak(skill, bingkai):
    """Bingkai pop saat kotak diambil: 0 kecil, 1 besar berkilau, 2 biasa (juga gambar diam)."""
    if bingkai == 0:
        return _peti(8, 6, skill)
    if bingkai == 1:
        c = _peti(12, 10, skill)
        _kilau_di(c, [(0, 0, WHITE), (13, 0, WHITE), (0, 11, SUN), (13, 11, SUN), (1, 0, SUN), (12, 0, SUN)])  # noqa: F405
        return c
    return _peti(10, 8, skill)


# --------------------------------------------------------------------------- panah kompas dan panah diri
ATAS = ["..#..", ".###.", "#####", ".###.", ".###."]
SERONG = [".####", "..###", ".####", "###.#", "##..."]       # menunjuk kanan atas


def _putar(pola):
    """Putar pola 90 derajat searah jarum jam."""
    n = len(pola)
    return ["".join(pola[n - 1 - x][y] for x in range(n)) for y in range(n)]


def _arah_8():
    hasil, a, s = [], ATAS, SERONG
    for _ in range(4):
        hasil += [a, s]
        a, s = _putar(a), _putar(s)
    return hasil                      # atas, kanan atas, kanan, kanan bawah, bawah, kiri bawah, kiri, kiri atas


ARAH_KOMPAS = ("atas", "kanan_atas", "kanan", "kanan_bawah", "bawah", "kiri_bawah", "kiri", "kiri_atas")
ARAH_DIRI = ("bawah", "atas", "kanan", "kiri")


def _panah(pola, isi):
    c = C(7, 7)                                                                      # noqa: F405
    _mask(c, pola, isi, 1, 1)
    c.outline()
    return c


def tanda_kompas(arah, bingkai):
    """Panah kompas teal; bingkai 1 lebih terang (berdenyut)."""
    return _panah(_arah_8()[ARAH_KOMPAS.index(arah)], TEAL if bingkai == 0 else SIANG2)   # noqa: F405


def tanda_diri(arah):
    """Panah diri sun untuk peta mini."""
    pola = _arah_8()[{"atas": 0, "kanan": 2, "bawah": 4, "kiri": 6}[arah]]
    return _panah(pola, SUN)                                                         # noqa: F405


# --------------------------------------------------------------------------- efek
def tanda_debu(bingkai):
    """Debu lari di belakang kaki, tanpa garis luar."""
    c = C(8, 6)                                                                      # noqa: F405
    if bingkai == 0:
        c.disc(2, 4, 1, MIST); c.disc(5, 3, 1, MIST); c.p(1, 3, WHITE); c.p(4, 2, WHITE)   # noqa: F405
    else:
        for x, y in ((1, 3), (3, 3), (2, 2), (5, 1), (6, 2), (7, 1), (0, 4), (4, 4)):
            c.p(x, y, MIST)                                                          # noqa: F405
        c.p(5, 1, WHITE)                                                             # noqa: F405
    return c


def tanda_kilau(bingkai):
    """Kilau kotak bantuan, tanpa garis luar."""
    c = C(8, 8)                                                                      # noqa: F405
    if bingkai == 0:
        c.vl(3, 1, 5, WHITE); c.hl(1, 5, 3, WHITE); c.p(3, 3, SUN)                   # noqa: F405
        for x, y in ((3, 0), (3, 6), (0, 3), (6, 3)):
            c.p(x, y, SUN)                                                           # noqa: F405
    else:
        for x, y in ((2, 2), (4, 4), (2, 4), (4, 2)):
            c.p(x, y, SUN)                                                           # noqa: F405
        c.p(3, 3, WHITE); c.p(6, 6, WHITE); c.p(6, 5, SUN); c.p(5, 6, SUN)           # noqa: F405
    return c


SKILL = ("sepatu", "kompas", "buku", "teropong", "karcis")


# =========================================================================== kelompok I: ikon
# Ikon 16x16 (termasuk margin 1 px) bergaris luar INK, sejalan dengan ikon antarmuka Sehari Setara (ikon.py).
import math  # noqa: E402


def _garis(c, x0, y0, x1, y1, col):
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


def ikon_lari():
    """I-01 Lari cepat: sepatu coral bersol putih dengan garis laju."""
    c = C(16, 16)                                                                    # noqa: F405
    c.r(7, 4, 4, 2, CORAL); c.r(5, 6, 7, 1, CORAL); c.r(4, 7, 9, 1, CORAL); c.r(3, 8, 11, 1, CORAL)   # noqa: F405
    c.r(3, 9, 12, 1, CORAL); c.p(14, 8, CORAL)                                       # noqa: F405
    c.r(3, 10, 12, 2, WHITE); c.hl(3, 14, 11, MIST)                                  # noqa: F405  sol
    for x, y in ((8, 6), (9, 7), (10, 8)):
        c.p(x, y, WHITE)                                                             # noqa: F405  tali
    c.hl(1, 2, 6, MIST); c.hl(1, 2, 9, MIST)                                         # noqa: F405  garis laju
    c.outline()
    return c


def ikon_kompas():
    """I-02 Kompas kejadian: muka putih, jarum teal menunjuk."""
    c = C(16, 16)                                                                    # noqa: F405
    c.disc(8, 8, 6, SLATE); c.disc(8, 8, 5, WHITE)                                   # noqa: F405
    for x, y in ((8, 3), (13, 8), (8, 13), (3, 8)):
        c.p(x, y, MIST)                                                              # noqa: F405
    _garis(c, 8, 8, 11, 5, TEAL); _garis(c, 9, 8, 11, 6, TEAL); _garis(c, 8, 7, 10, 5, TEAL)   # noqa: F405
    _garis(c, 8, 8, 5, 11, SLATE)                                                    # noqa: F405
    c.p(8, 8, DUSK)                                                                  # noqa: F405
    c.outline()
    return c


def ikon_petunjuk():
    """I-03 Petunjuk: buku terbuka bersampul sky-d dengan pembatas coral."""
    c = C(16, 16)                                                                    # noqa: F405
    c.r(1, 5, 14, 8, SKYD)                                                           # noqa: F405  sampul
    c.r(2, 4, 6, 8, WHITE); c.r(8, 4, 6, 8, WHITE); c.vl(8, 4, 11, MIST); c.dither(9, 5, 5, 6, MIST, only=WHITE)   # noqa: F405
    c.r(11, 2, 2, 4, CORAL); c.p(11, 5, MANGO)                                       # noqa: F405  pembatas
    c.outline()
    return c


def ikon_teropong():
    """I-04 Teropong (P1)."""
    c = C(16, 16)                                                                    # noqa: F405
    c.r(3, 3, 4, 5, DUSK); c.r(9, 3, 4, 5, DUSK); c.r(7, 5, 2, 2, SLATE)             # noqa: F405
    c.disc(5, 10, 3, DUSK); c.disc(11, 10, 3, DUSK)                                  # noqa: F405
    c.disc(5, 10, 1, MIST); c.disc(11, 10, 1, MIST); c.p(4, 9, WHITE); c.p(10, 9, WHITE)   # noqa: F405
    c.outline()
    return c


def ikon_karcis():
    """I-05 Angkot (P1): karcis sun bergambar angkot."""
    c = C(16, 16)                                                                    # noqa: F405
    c.r(1, 4, 14, 8, SUN); c.hl(1, 14, 11, MANGO)                                    # noqa: F405
    for y in (7, 8):
        c.p(1, y, T); c.p(14, y, T)                                                  # noqa: F405  takik
    for y in (4, 6, 8, 10):
        c.p(10, y, WOODD)                                                            # noqa: F405  garis sobek
    c.r(3, 6, 6, 3, SKYD); c.r(4, 6, 2, 1, WHITE); c.p(4, 9, INK); c.p(7, 9, INK)    # noqa: F405  gambar angkot
    c.outline()
    return c


def ikon_zona(n):
    """I-06 sampai I-13: ikon zona 1-8 (Design System bagian 7)."""
    c = C(16, 16)                                                                    # noqa: F405
    if n == 1:      # rumah
        for i in range(5):
            c.hl(7 - i, 8 + i, 2 + i, CORAL)                                         # noqa: F405
        c.hl(2, 13, 7, WOODD); c.r(3, 8, 10, 6, CREAM); c.vl(12, 8, 13, MIST)        # noqa: F405
        c.r(7, 10, 2, 4, WOOD); c.r(4, 9, 2, 2, SKYD)                                # noqa: F405
    elif n == 2:    # buku
        c.r(2, 8, 11, 4, SKYD); c.hl(2, 12, 11, NAVY); c.r(12, 9, 2, 2, CREAM)       # noqa: F405
        c.r(3, 3, 11, 4, CORAL); c.hl(3, 13, 6, WOODD); c.r(3, 4, 2, 2, CREAM)       # noqa: F405
        c.r(9, 1, 2, 3, SUN)                                                         # noqa: F405  pembatas
    elif n == 3:    # rambu
        c.r(7, 10, 2, 5, SLATE)                                                      # noqa: F405
        c.r(2, 1, 12, 10, WHITE); c.r(3, 2, 10, 8, SKYD)                             # noqa: F405
        for i in range(6):
            c.hl(8 - (i + 1) // 2, 7 + (i + 1) // 2, 3 + i, WHITE)                   # noqa: F405
        c.vl(8, 5, 7, INK)                                                           # noqa: F405
    elif n == 4:    # keranjang
        for x in range(4, 12):
            c.p(x, 4 + abs(x - 7.5) // 2 if False else 4, WOODD)                     # noqa: F405
        c.r(3, 3, 1, 5, WOODD); c.r(12, 3, 1, 5, WOODD); c.hl(3, 12, 3, WOODD)       # noqa: F405  pegangan
        c.disc(6, 7, 2, LEAF); c.disc(10, 7, 2, CORAL); c.p(8, 6, SUN); c.p(8, 7, SUN)   # noqa: F405
        c.r(2, 8, 12, 6, WOOD); c.hl(2, 13, 8, SK2)                                  # noqa: F405
        for y in (10, 12):
            c.hl(2, 13, y, WOODD)                                                    # noqa: F405
        for x in (5, 8, 11):
            c.vl(x, 9, 13, WOODD)                                                    # noqa: F405
    elif n == 5:    # kentongan
        c.vl(8, 1, 2, WOODD)                                                         # noqa: F405  tali
        c.r(5, 3, 6, 11, WOOD); c.hl(5, 10, 3, SK2); c.vl(10, 3, 13, WOODD)          # noqa: F405
        c.r(7, 5, 2, 7, HR2)                                                         # noqa: F405  celah
        c.hl(5, 10, 13, WOODD)                                                       # noqa: F405
        _garis(c, 12, 9, 14, 13, WOODD)                                              # noqa: F405  pemukul
    elif n == 6:    # pohon kelapa: batang melengkung, pelepah terkulai ke kiri dan kanan
        for y in range(6, 15):
            x = 7 + (14 - y) // 3
            c.r(x, y, 2, 1, WOOD); c.p(x + 1, y, WOODD)                              # noqa: F405
        for arah in (-1, 1):
            for i, (dx, dy) in enumerate(((1, 0), (2, -1), (3, -1), (4, -1), (5, 0), (6, 1), (6, 2), (7, 3))):
                x, y = 9 + arah * dx, 4 + dy
                c.p(x, y, LEAF); c.p(x, y + 1, GRASS if i > 2 else LEAF)             # noqa: F405
            for i, (dx, dy) in enumerate(((1, -1), (2, -2), (3, -2), (4, -2))):
                c.p(9 + arah * dx, 4 + dy, LEAF)                                     # noqa: F405
        c.r(8, 3, 3, 2, LEAF); c.p(9, 2, LEAF)                                       # noqa: F405
        c.p(8, 6, WOODD); c.p(10, 6, WOODD)                                          # noqa: F405  buah
    elif n == 7:    # hati
        _mask(c, [".###...###.", "#####.#####", "###########", "###########", ".#########.", "..#######..",
                  "...#####...", "....###....", ".....#....."], LEAF, 2, 3)        # noqa: F405
        c.p(4, 4, WHITE); c.p(3, 5, WHITE); c.p(4, 5, WHITE)                         # noqa: F405
        for y in range(3, 12):
            for x in range(2, 14):
                if c.px[x, y] == LEAF and (x - 7) + (y - 7) > 3 and (x + y) % 2 == 0:   # noqa: F405
                    c.p(x, y, GRASS)                                                 # noqa: F405
    elif n == 8:    # gelombang sinyal
        _mask(c, ["..#########..", ".#.........#.", "#...#####...#", "..#.......#..", ".#...###...#.",
                  "...#.....#...", ".....###....."], TEAL, 1, 3)                   # noqa: F405
        c.r(7, 11, 2, 2, TEAL)                                                       # noqa: F405
    c.outline()
    return c


def ikon_mini(jenis):
    """I-14 ikon peta mini 7x7: kejadian, selesai, halte."""
    c = C(7, 7)                                                                      # noqa: F405
    if jenis == "kejadian":
        c.r(1, 1, 5, 5, SUN); c.vl(3, 1, 3, INK); c.p(3, 5, INK)                     # noqa: F405
    elif jenis == "selesai":
        c.r(1, 1, 5, 5, LEAF); c.p(5, 2, INK); c.p(4, 3, INK); c.p(3, 4, INK); c.p(2, 3, INK)   # noqa: F405
    else:
        c.r(1, 1, 5, 5, TEAL); c.r(2, 2, 3, 2, WHITE); c.p(2, 4, INK); c.p(4, 4, INK)   # noqa: F405
    for x, y in ((1, 1), (5, 1), (1, 5), (5, 5)):
        c.p(x, y, T)                                                                 # noqa: F405  sudut membulat
    c.outline()
    return c


def ikon_menyambung(bingkai):
    """I-15 jam berputar untuk layar menyambung ulang (2 bingkai)."""
    c = C(16, 16)                                                                    # noqa: F405
    c.disc(8, 8, 6, SLATE); c.disc(8, 8, 5, WHITE)                                   # noqa: F405
    if bingkai == 0:
        c.vl(8, 4, 8, DUSK); c.hl(8, 11, 8, DUSK)                                    # noqa: F405
    else:
        c.hl(8, 12, 8, DUSK); c.vl(8, 8, 11, DUSK)                                   # noqa: F405
    c.p(8, 8, CORAL)                                                                 # noqa: F405
    c.outline()
    return c


def ikon_putar_hp():
    """I-16 ajakan memutar HP ke posisi mendatar (32x32)."""
    c = C(32, 32)                                                                    # noqa: F405
    c.r(3, 9, 10, 18, DUSK); c.r(4, 11, 8, 13, SIANG3); c.p(8, 25, SLATE)            # noqa: F405  HP tegak
    c.r(14, 19, 17, 10, DUSK); c.r(16, 20, 13, 8, SIANG2); c.p(30, 23, SLATE)        # noqa: F405  HP mendatar
    for i in range(200, 341, 10):                                                    # panah melengkung dari HP tegak
        a = math.radians(i)
        c.r(int(round(17 + 9 * math.cos(a))), int(round(14 + 9 * math.sin(a))), 2, 2, SUN)   # noqa: F405
    _mask(c, ["#####", ".###.", "..#.."], SUN, 23, 12)                               # noqa: F405  ujung panah ke HP mendatar
    c.outline()
    return c


def ikon_jejak():
    """I-17 ikon tab Jejak Setara (32x32): dua jejak kaki sun di atas petak navy."""
    c = C(32, 32)                                                                    # noqa: F405
    c.r(2, 1, 28, 30, NAVY); c.r(1, 2, 30, 28, NAVY)                                 # noqa: F405
    for ox, oy in ((7, 14), (17, 4)):
        c.r(ox + 1, oy + 4, 6, 8, SUN); c.r(ox + 2, oy + 3, 4, 10, SUN); c.hl(ox + 2, ox + 5, oy + 12, MANGO)   # noqa: F405
        for i, x in enumerate((ox + 1, ox + 3, ox + 5, ox + 7)):
            c.p(x, oy + 1 + (1 if i in (0, 3) else 0), SUN)                          # noqa: F405  jari
    c.outline()
    return c


def ikon_konsol(jenis):
    """I-18 ikon status di konsol: arsip, peringatan (rujukan belum diverifikasi), centang (terverifikasi)."""
    c = C(16, 16)                                                                    # noqa: F405
    if jenis == "arsip":
        c.r(2, 3, 12, 3, SLATE); c.r(3, 6, 10, 8, MIST); c.vl(12, 6, 13, SLATE); c.r(6, 8, 4, 1, DUSK)   # noqa: F405
    elif jenis == "peringatan":
        for i in range(10):
            c.hl(8 - (i + 1) // 2, 7 + (i + 1) // 2, 3 + i, MANGO)                   # noqa: F405
        c.vl(7, 6, 9, INK); c.vl(8, 6, 9, INK); c.r(7, 11, 2, 1, INK)                # noqa: F405
    else:
        c.disc(8, 8, 6, LEAF)                                                        # noqa: F405
        _mask(c, [".....##", "....##.", "#..##..", "####...", ".##...."], INK, 4, 5)   # noqa: F405
    c.outline()
    return c
