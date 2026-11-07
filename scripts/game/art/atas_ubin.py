"""Ubin tampak atas Jejak Setara: kunci bahan dan pemetaannya per masa.

Aturan (Design System Jejak bagian 4, 7, dan 14; keputusan Gerbang aset 6 Nov 2026, usulan 4a):
- Ubin 16x16, datar, tanpa garis luar. Hanya lembar ubin yang berganti per masa; objek, tokoh, dan ikon
  satu berkas untuk semua masa. Bayangan objek menjadi ubin tumpang lapisan 10 (kelompok U).
- Ubin digambar dengan kunci bahan (m["rumput"], m["kilau"], ...), lalu diekspor sekali per masa.
- Ubin rumput di bawah ini adalah ubin uji gaya (preview/uji_gaya.png), disetujui sebagai acuan 6 Nov 2026.
  Lembar ubin lengkap (ubin_pagi.png, ubin_siang.png, ubin_sore.png) dibuat di kelompok U.
"""
from pixelart import *  # noqa: F401,F403

# Bahan per masa: tabel "Tukar palet per masa" Design System bagian 4 (titik awal; pemetaan akhir di kelompok U)
MASA = {
    "pagi":  dict(rumput=LEAF, tekstur=GRASS, kilau=PAGI2, bayangan=DUSK,  aspal=SLATE, marka=CREAM,    # noqa: F405
                  air=PAGI1, air_dalam=SKYD, pasir=PAGI2, dinding=CREAM),                               # noqa: F405
    "siang": dict(rumput=LEAF, tekstur=GRASS, kilau=WHITE, bayangan=DUSK,  aspal=SLATE, marka=WHITE,    # noqa: F405
                  air=SIANG1, air_dalam=SKYD, pasir=CREAM, dinding=CREAM),                              # noqa: F405
    "sore":  dict(rumput=LEAF, tekstur=GRASS, kilau=SORE1, bayangan=WOODD, aspal=SLATE, marka=CREAM,    # noqa: F405
                  air=SORE3, air_dalam=SKYD, pasir=SORE1, dinding=CREAM),                               # noqa: F405
}
NAMA_MASA = {"pagi": "Pagi", "siang": "Siang", "sore": "Sore"}


def _mask(c, rows, col, x0=0, y0=0):
    """Gambar pola baris ('#' = isi) mulai dari (x0, y0)."""
    for dy, row in enumerate(rows):
        for dx, ch in enumerate(row):
            if ch == "#":
                c.p(x0 + dx, y0 + dy, col)


RUMPUN = ["#...#",
          "#.#.#",
          ".###."]
RUMPUN_KECIL = ["#.#",
                ".#."]
TITIK = ["#"]
# (x, y, bentuk, kilau?) - semua di dalam 16x16 agar ubin bersambung tanpa jahitan
TATA_RUMPUT = [(1, 2, RUMPUN, True), (10, 1, RUMPUN_KECIL, False), (7, 7, TITIK, False),
               (9, 10, RUMPUN, True), (2, 11, RUMPUN_KECIL, False), (14, 6, TITIK, False),
               (5, 14, TITIK, False)]


def ubin_rumput(m):
    """Rumput dasar varian 1 (U-01)."""
    c = C(16, 16, m["rumput"])                                                       # noqa: F405
    for x, y, bentuk, kilau in TATA_RUMPUT:
        _mask(c, bentuk, m["tekstur"], x, y)
        if kilau:
            c.p(x, y, m["kilau"])              # ujung helai kiri terkena cahaya dari kiri atas
    return c
