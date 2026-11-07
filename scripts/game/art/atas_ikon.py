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
