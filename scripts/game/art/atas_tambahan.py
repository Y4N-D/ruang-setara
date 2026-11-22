"""Properti tambahan tampak atas Jejak Setara: O-52 prasasti (K-32) dan O-53 kukang dalam kandang (K-33).

Keduanya properti set tokoh kejadian naskah tambahan, bukan objek peta (usulan 7a Plan naskah tambahan; Plan aset
tambahan disetujui 22 Nov 2026, KT-C27 a sampai KT-C29 a). Gambarnya sama piksel dengan lembar uji gaya
preview/uji_gaya_tambahan.png.

Ditulis di berkas sendiri, bukan di atas_objek.py, karena atas_objek.py termasuk sidik sumber peta (spesifikasi JS-06,
P-23): setiap perubahan di sana mengharuskan kampung_gambar.json dibangun ulang, padahal properti ini tidak dipakai
peta. build_jejak.py menggabungkan OBJEK_TAMBAHAN ke daftar objeknya untuk aset, pratinjau, dan manifest; build_peta.py
tetap hanya membaca atas_objek.py. Tokoh penjual kukang (N-21) ada di atas_tokoh.py (NPC3).

Aturan gambar sama dengan atas_objek.py: garis luar INK hanya di tepi siluet, cahaya dari kiri atas, hanya warna
palette.json, tanpa tulisan, logo, lambang instansi, atau tanda keagamaan.
"""
from pixelart import *  # noqa: F401,F403
from atas_objek import _bingkai, _garis

# Siluet batu prasasti (x 0-17, y 5-27 di kanvas isi 32x32): puncak miring ke kanan, kaki melebar.
_BATU_PRASASTI = [
    "....######........",   # y 5
    "..##########......",   # y 6
    ".#############....",   # y 7
    ".###############..",   # y 8
    "#################.",   # y 9
    "##################",   # y 10
    "##################",   # y 11
    "#################.",   # y 12
    "#################.",   # y 13
    "##################",   # y 14
    "##################",   # y 15
    "##################",   # y 16
    "##################",   # y 17
    "##################",   # y 18
    "##################",   # y 19
    "##################",   # y 20
    "##################",   # y 21
    "##################",   # y 22
    "##################",   # y 23
    "##################",   # y 24
    "##################",   # y 25
    ".#################",   # y 26
    "..###############.",   # y 27
]
_BIDANG_ATAS_PRASASTI = {5: (4, 9), 6: (2, 11), 7: (1, 13), 8: (1, 15), 9: (0, 16)}   # baris: (x awal, x akhir)
_TULISAN_PRASASTI = ("#.##.#.##.#", ".#.##.#.#.#", "##.#.##.#..", "#.#.##..#.#", ".##.#.#.##.", "#.#..##.#..")


def obj_prasasti():
    """Prasasti tua (O-52, K-32), 2x2 ubin: batu alam bermuka tulisan samar, berlumut, dengan papan keterangan cagar
    budaya di kanannya (KT-C27 a dan KT-C28 a). Tulisan berupa deret goresan tanpa huruf, jadi tidak bisa dibaca.
    Tanpa tanda keagamaan, sesaji, kain, payung, atau atap, agar tidak terbaca sebagai benda suci, nisan, atau tempat
    ibadah. Dipotong di baris 17: puncak batu dan papan berada di lapisan atas."""
    d = C(32, 32)                                                                    # noqa: F405
    for dy, baris in enumerate(_BATU_PRASASTI):
        for dx, ch in enumerate(baris):
            if ch == "#":
                d.p(dx, 5 + dy, MIST)                                                # noqa: F405
    for y, (a, b) in _BIDANG_ATAS_PRASASTI.items():                                  # bidang atas, terang di kiri
        d.hl(a, min(b, 10), y, WHITE)                                                # noqa: F405
    d.hl(5, 7, 6, MIST); d.p(3, 7, MIST)                                             # noqa: F405  tekstur puncak
    d.hl(0, 17, 10, SLATE)                                                           # noqa: F405  tepi bidang atas
    for y in range(11, 28):                                                          # sisi kanan teduh
        for x in range(13, 18):
            if d.px[x, y] == MIST:                                                   # noqa: F405
                d.p(x, y, SLATE if x >= 16 or (x + y) % 2 == 0 else MIST)            # noqa: F405
        for x in range(17, 12, -1):
            if d.px[x, y][3]:
                d.p(x, y, DUSK)                                                      # noqa: F405
                break
    for x in range(18):                                                              # kaki batu terbenam
        if d.px[x, 27][3]:
            d.p(x, 27, SLATE)                                                        # noqa: F405
    for i, y in enumerate((13, 15, 17, 19, 21, 23)):                                 # tulisan samar tanpa huruf
        for dx, ch in enumerate(_TULISAN_PRASASTI[i]):
            if ch == "#":
                d.p(2 + dx, y, DUSK)                                                 # noqa: F405
    _garis(d, 14, 12, 15, 16, DUSK)                                                  # noqa: F405  retak
    for x, y in ((0, 22), (0, 23), (1, 24), (0, 25), (1, 26), (2, 26), (3, 27), (2, 25), (4, 6), (5, 5), (3, 6),
                 (6, 26), (5, 27), (7, 27), (12, 27), (13, 26)):
        d.p(x, y, GRASS)                                                             # noqa: F405  lumut
    for x, y in ((1, 23), (1, 25), (4, 5), (6, 5), (6, 27), (13, 27)):
        d.p(x, y, LEAF)                                                              # noqa: F405
    # papan keterangan: dua tiang kayu, bingkai kayu, panel cream bergaris tanpa huruf
    for x in (23, 28):
        d.r(x, 18, 2, 11, WOODD); d.vl(x, 18, 28, WOOD)                              # noqa: F405  tiang
    d.r(21, 8, 11, 11, WOODD)                                                        # noqa: F405  bingkai
    d.r(22, 9, 9, 9, CREAM); d.hl(22, 30, 9, WHITE)                                  # noqa: F405  panel
    d.hl(23, 29, 11, DUSK)                                                           # noqa: F405  baris judul
    for y, (a, b) in ((13, (23, 25)), (13, (27, 29)), (15, (23, 24)), (15, (26, 29))):
        d.hl(a, b, y, SLATE)                                                         # noqa: F405  baris keterangan
    d.vl(30, 10, 17, MIST)                                                           # noqa: F405  sisi kanan panel teduh
    return _bingkai(d)


def obj_kandang_kukang():
    """Kukang dalam kandang kecil (O-53, K-33), 1x1 ubin: kandang kawat beralas papan; kukang duduk tenang memeluk
    dahan, mata bulat besar terbuka dan berkilau, tanpa luka dan tanpa warna merah. Jeruji tidak menutupi wajah."""
    d = C(16, 16)                                                                    # noqa: F405
    d.r(1, 4, 14, 9, DUSK)                                                           # noqa: F405  bagian dalam kandang
    d.r(0, 13, 16, 2, WOOD); d.hl(0, 15, 14, WOODD)                                  # noqa: F405  alas papan
    d.r(4, 6, 8, 4, WOOD); d.hl(5, 10, 5, WOOD)                                      # noqa: F405  kepala bulat
    d.p(4, 5, WOODD); d.p(11, 5, WOODD)                                              # noqa: F405  telinga kecil
    d.r(5, 10, 6, 3, WOOD); d.r(6, 10, 4, 2, SK2)                                    # noqa: F405  badan, perut terang
    d.r(4, 6, 3, 3, WOODD); d.r(9, 6, 3, 3, WOODD)                                   # noqa: F405  cincin gelap di mata
    d.r(5, 7, 2, 2, INK); d.r(9, 7, 2, 2, INK)                                       # noqa: F405  mata besar 2x2
    d.p(5, 7, WHITE); d.p(9, 7, WHITE)                                               # noqa: F405  kilau mata
    d.vl(7, 5, 9, CREAM); d.vl(8, 5, 9, CREAM)                                       # noqa: F405  garis terang di antara mata
    d.hl(7, 8, 9, SK2)                                                               # noqa: F405  moncong
    d.hl(2, 13, 11, WOODD); d.p(13, 10, LEAF); d.p(2, 10, LEAF)                      # noqa: F405  dahan berdaun
    d.p(4, 11, SK2); d.p(11, 11, SK2); d.p(5, 12, SK2); d.p(10, 12, SK2)             # noqa: F405  tangan dan kaki
    d.hl(1, 14, 3, SLATE); d.hl(1, 14, 4, MIST)                                      # noqa: F405  tutup kandang
    for x in (1, 3, 12, 14):
        d.vl(x, 4, 12, MIST)                                                         # noqa: F405  jeruji
    d.vl(14, 4, 12, SLATE)                                                           # noqa: F405  sisi kanan teduh
    d.hl(1, 14, 12, MIST)                                                            # noqa: F405  bingkai bawah
    d.hl(6, 9, 1, SLATE); d.p(5, 2, SLATE); d.p(10, 2, SLATE)                        # noqa: F405  pegangan
    return _bingkai(d)


# Format sama dengan OBJEK di atas_objek.py: nama -> (fungsi, ukuran ubin, baris potong, kotak padat, jenis bayangan,
# bisa dilewati?). Bayangan hanya dipakai bila kelak properti ini diletakkan sebagai objek peta.
OBJEK_TAMBAHAN = {
    "prasasti": (obj_prasasti, (2, 2), 17, [(0, 1, 2, 1)], "kecil", False),
    "kandang_kukang": (obj_kandang_kukang, (1, 1), None, [(0, 0, 1, 1)], "kecil", False),
}
KODE_TAMBAHAN = {"prasasti": "O-52", "kandang_kukang": "O-53"}
