"""Ubin tampak atas Jejak Setara: kunci bahan, pemetaannya per masa, dan lembar ubin.

Aturan (Design System Jejak bagian 4, 7, dan 14; keputusan Gerbang aset 6 Nov 2026, usulan 4a):
- Ubin 16x16, datar, tanpa garis luar. Satu lembar per masa (ubin_pagi.png, ubin_siang.png, ubin_sore.png),
  16 ubin per baris; nomor ubin sama di ketiga lembar (NOMOR). Hanya lembar ubin yang berganti per masa.
- Ubin digambar dengan kunci bahan (m["rumput"], m["kilau"], ...), lalu diekspor sekali per masa.
- Lapisan 0 (tanah): rumput dan tujuh bahan wilayah. Bahan wilayah memakai 47 ubin peralihan: pita tepi
  digambar di sisi dan sudut yang berbatasan dengan bahan berprioritas lebih rendah (PRIORITAS), dihitung
  dari 8 tetangga (nomor_tanah). Rumput tidak punya pita tepi.
- Lapisan 10 (tumpang, latar transparan): detail tanah, marka jalan, garis lapangan, dan bayangan objek.
  Bayangan berpola papan catur dengan bahan "bayangan" (dusk pagi dan siang, wood-d sore).
- Rumput varian 1 = ubin uji gaya (disetujui sebagai acuan 6 Nov 2026).
- Aturan peta untuk JS-06: tanah dan pasir hanya bersebelahan dengan rumput atau air (pita tepinya memakai
  warna rumput); lapangan berbentuk persegi panjang dengan lebar ganjil agar garis tengah tepat di tengah.
"""
from pixelart import *  # noqa: F401,F403

# Bahan yang berganti per masa: tabel "Tukar palet per masa" Design System bagian 4
MASA = {
    "pagi":  dict(rumput=LEAF, tekstur=GRASS, kilau=PAGI2, bayangan=DUSK,  aspal=SLATE, marka=CREAM,    # noqa: F405
                  air=PAGI1, air_dalam=SKYD, pasir=PAGI2, dinding=CREAM),                               # noqa: F405
    "siang": dict(rumput=LEAF, tekstur=GRASS, kilau=WHITE, bayangan=DUSK,  aspal=SLATE, marka=WHITE,    # noqa: F405
                  air=SIANG1, air_dalam=SKYD, pasir=CREAM, dinding=CREAM),                              # noqa: F405
    "sore":  dict(rumput=LEAF, tekstur=GRASS, kilau=SORE1, bayangan=WOODD, aspal=SLATE, marka=CREAM,    # noqa: F405
                  air=SORE3, air_dalam=SKYD, pasir=SORE1, dinding=CREAM),                               # noqa: F405
}
NAMA_MASA = {"pagi": "Pagi", "siang": "Siang", "sore": "Sore"}
# Bahan baru yang tidak berganti per masa (usulan kelompok U, Daftar_Aset.md bagian U)
TETAP = dict(tanah=SK2, tanah_d=WOOD, paving=WOOD, paving_d=WOODD, semen=MIST, semen_d=SLATE,   # noqa: F405
             aspal_d=DUSK, pasir_d=WOOD)                                                        # noqa: F405

KOLOM = 16
WILAYAH = ("tanah", "paving", "semen", "pasir", "aspal", "air", "air_dalam")
PRIORITAS = {"rumput": 0, "tanah": 1, "paving": 2, "semen": 3, "pasir": 4, "aspal": 5, "air": 6, "air_dalam": 7}


def _mask(c, rows, col, x0=0, y0=0):
    """Gambar pola baris ('#' = isi) mulai dari (x0, y0)."""
    for dy, row in enumerate(rows):
        for dx, ch in enumerate(row):
            if ch == "#":
                c.p(x0 + dx, y0 + dy, col)


# --------------------------------------------------------------------------- rumput (lapisan 0)
RUMPUN = ["#...#",
          "#.#.#",
          ".###."]
RUMPUN_KECIL = ["#.#",
                ".#."]
TITIK = ["#"]
# (x, y, bentuk, kilau?) - semua di dalam 16x16 agar ubin bersambung tanpa jahitan. Varian 1 = uji gaya.
TATA_RUMPUT = [(1, 2, RUMPUN, True), (10, 1, RUMPUN_KECIL, False), (7, 7, TITIK, False),
               (9, 10, RUMPUN, True), (2, 11, RUMPUN_KECIL, False), (14, 6, TITIK, False),
               (5, 14, TITIK, False)]
VARIAN_RUMPUT = [
    TATA_RUMPUT,
    [(3, 1, RUMPUN, True), (12, 4, RUMPUN_KECIL, False), (1, 9, TITIK, False), (7, 11, RUMPUN, True),
     (13, 13, TITIK, False), (9, 6, TITIK, False)],
    [(8, 2, RUMPUN, True), (2, 6, RUMPUN_KECIL, False), (12, 9, RUMPUN_KECIL, False), (4, 12, RUMPUN, True),
     (14, 1, TITIK, False)],
    [(5, 4, RUMPUN_KECIL, False), (11, 11, RUMPUN_KECIL, False), (1, 14, TITIK, False), (14, 7, TITIK, False)],
]


def ubin_rumput(m, varian=0):
    """Rumput dasar (U-01). Varian 0 = ubin uji gaya."""
    c = C(16, 16, m["rumput"])                                                       # noqa: F405
    for x, y, bentuk, kilau in VARIAN_RUMPUT[varian]:
        _mask(c, bentuk, m["tekstur"], x, y)
        if kilau:
            c.p(x, y, m["kilau"])              # ujung helai kiri terkena cahaya dari kiri atas
    return c


# --------------------------------------------------------------------------- bahan wilayah (lapisan 0)
TEKSTUR = {   # bahan: [(varian 1), (varian 2)], setiap varian: daftar (x, y, panjang, warna-kunci)
    "tanah": [[(3, 3, 2, "tanah_d"), (10, 6, 1, "tanah_d"), (6, 11, 1, "tanah_d"), (12, 12, 2, "tanah_d")],
              [(2, 9, 1, "tanah_d"), (8, 2, 2, "tanah_d"), (13, 7, 1, "tanah_d"), (6, 14, 2, "tanah_d")]],
    "semen": [[(4, 5, 1, "semen_d"), (11, 12, 1, "semen_d")],
              [(9, 3, 1, "semen_d"), (2, 12, 1, "semen_d"), (13, 8, 1, "semen_d")]],
    "pasir": [[(3, 4, 1, "pasir_d"), (11, 11, 1, "pasir_d"), (8, 7, 1, "kilau"), (13, 3, 1, "kilau")],
              [(6, 12, 1, "pasir_d"), (12, 5, 1, "pasir_d"), (2, 9, 1, "kilau")]],
    "aspal": [[(2, 3, 1, "aspal_d"), (9, 5, 1, "aspal_d"), (13, 11, 1, "aspal_d"), (5, 13, 1, "aspal_d"),
               (7, 9, 1, "semen")],
              [(4, 2, 1, "aspal_d"), (12, 4, 1, "aspal_d"), (1, 10, 1, "aspal_d"), (10, 13, 1, "aspal_d"),
               (14, 8, 1, "semen")]],
    "air": [[(2, 3, 3, "kilau"), (9, 7, 3, "kilau"), (4, 12, 2, "kilau"), (12, 13, 3, "kilau")],
            [(6, 2, 3, "kilau"), (1, 9, 2, "kilau"), (11, 10, 3, "kilau")]],
    "air_dalam": [[(3, 5, 3, "air"), (10, 11, 3, "air")],
                  [(7, 2, 3, "air"), (1, 13, 2, "air"), (12, 7, 2, "air")]],
}
DASAR = {"tanah": "tanah", "paving": "paving", "semen": "semen", "pasir": "pasir", "aspal": "aspal",
         "air": "air", "air_dalam": "air_dalam"}


def _warna(m, kunci):
    return m[kunci] if kunci in m else TETAP[kunci]


def _isi(c, bahan, m, varian=0):
    c.r(0, 0, 16, 16, _warna(m, DASAR[bahan]))
    if bahan == "paving":       # bata 8x4 bersilang, nat wood-d
        nat = TETAP["paving_d"]
        for y in (3, 7, 11, 15):
            c.hl(0, 15, y, nat)
        for baris in range(4):
            for x in ((7, 15) if baris % 2 == 0 else (3, 11)):
                c.vl(x, baris * 4, baris * 4 + 2, nat)
        if varian:
            c.r(8, 4, 3, 3, nat)                                                     # satu bata lebih gelap
        return
    for x, y, panjang, kunci in TEKSTUR[bahan][varian]:
        c.hl(x, x + panjang - 1, y, _warna(m, kunci))


def _pita(bahan, m):
    """Pita tepi dari luar ke dalam. Tuple ("pc", a, b) = papan catur a dan b."""
    if bahan == "tanah":
        return [("pc", m["rumput"], TETAP["tanah"]), TETAP["tanah_d"]]
    if bahan == "paving":
        return [TETAP["paving_d"]]
    if bahan == "semen":
        return [TETAP["semen_d"]]
    if bahan == "pasir":
        return [("pc", m["rumput"], m["pasir"])]
    if bahan == "aspal":
        return [TETAP["aspal_d"], m["aspal"], m["marka"]]      # bayangan kerb, lalu garis tepi jalan
    if bahan == "air":
        return [m["bayangan"], m["kilau"]]                      # garis tepi, lalu buih
    return [("pc", m["air"], m["air_dalam"])]                   # air dalam di tengah air


N, NE, E, SE, S, SW, W, NW = 1, 2, 4, 8, 16, 32, 64, 128
ARAH_TETANGGA = ((N, 0, -1), (NE, 1, -1), (E, 1, 0), (SE, 1, 1), (S, 0, 1), (SW, -1, 1), (W, -1, 0), (NW, -1, -1))


def kanon(mask):
    """Sudut hanya berarti bila kedua sisi yang mengapitnya tidak berbatasan (47 bentuk)."""
    if mask & (N | E):
        mask &= ~NE
    if mask & (S | E):
        mask &= ~SE
    if mask & (S | W):
        mask &= ~SW
    if mask & (N | W):
        mask &= ~NW
    return mask


BLOB = sorted({kanon(k) for k in range(256)})       # 47 bentuk, nomor 0 = tanpa tepi


def ubin_wilayah(bahan, mask, m, varian=0):
    """Ubin bahan wilayah dengan pita tepi di sisi dan sudut yang ditandai mask."""
    c = C(16, 16)                                                                    # noqa: F405
    _isi(c, bahan, m, varian)
    pita = _pita(bahan, m)
    for y in range(16):
        for x in range(16):
            d = 99
            if mask & N:
                d = min(d, y)
            if mask & E:
                d = min(d, 15 - x)
            if mask & S:
                d = min(d, 15 - y)
            if mask & W:
                d = min(d, x)
            if mask & NE:
                d = min(d, max(15 - x, y))
            if mask & SE:
                d = min(d, max(15 - x, 15 - y))
            if mask & SW:
                d = min(d, max(x, 15 - y))
            if mask & NW:
                d = min(d, max(x, y))
            if d < len(pita):
                w = pita[d]
                if w[0] == "pc":                                        # warna biasa adalah tuple angka RGBA
                    w = w[1] if (x + y) % 2 == 0 else w[2]
                c.px[x, y] = w
    return c


# --------------------------------------------------------------------------- ubin tumpang (lapisan 10)
def _bunga(c, x, y, kelopak, tengah):
    for dx, dy in ((0, -1), (1, 0), (0, 1), (-1, 0)):
        c.p(x + dx, y + dy, kelopak)
    c.p(x, y, tengah)


def _elips(c, m, cx, cy, rx, ry, ox=0, oy=0):
    for y in range(16):
        for x in range(16):
            if ((x + ox - cx) / rx) ** 2 + ((y + oy - cy) / ry) ** 2 <= 1 and (x + y) % 2 == 0:
                c.px[x, y] = m["bayangan"]


def _papan_catur(c, m, syarat):
    for y in range(16):
        for x in range(16):
            if (x + y) % 2 == 0 and syarat(x, y):
                c.px[x, y] = m["bayangan"]


def _garis_lapangan(c, m, sisi="", tengah=""):
    w = m["marka"]
    if "n" in sisi:
        c.r(2 if "w" in sisi else 0, 2, 14 if ("w" in sisi) != ("e" in sisi) else (12 if "w" in sisi else 16), 2, w)
    if "s" in sisi:
        c.r(2 if "w" in sisi else 0, 12, 14 if ("w" in sisi) != ("e" in sisi) else (12 if "w" in sisi else 16), 2, w)
    if "w" in sisi:
        c.r(2, 2 if "n" in sisi else 0, 2, 14 if ("n" in sisi) != ("s" in sisi) else (12 if "n" in sisi else 16), w)
    if "e" in sisi:
        c.r(12, 2 if "n" in sisi else 0, 2, 14 if ("n" in sisi) != ("s" in sisi) else (12 if "n" in sisi else 16), w)
    if sisi == "ne":
        c.r(0, 2, 14, 2, w)
    if sisi == "se":
        c.r(0, 12, 14, 2, w)
    if tengah == "tegak":
        c.r(7, 2 if "n" in sisi else 0, 2, (14 if ("n" in sisi or "s" in sisi) else 16), w)
        if "s" in sisi:
            c.r(7, 0, 2, 14, w)
    if tengah == "datar":
        c.r(2 if "w" in sisi else 0, 7, 14 if ("w" in sisi or "e" in sisi) else 16, 2, w)
        if "e" in sisi:
            c.r(0, 7, 14, 2, w)


TUMPANG = {   # nama: fungsi(c, m) - latar transparan
    "bunga_a": lambda c, m: (_bunga(c, 4, 5, ROSE, SUN), _bunga(c, 11, 10, ROSE, SUN)),                # noqa: F405
    "bunga_b": lambda c, m: (_bunga(c, 10, 4, WHITE, SUN), _bunga(c, 5, 11, WHITE, SUN)),              # noqa: F405
    "rumput_tinggi": lambda c, m: (_mask(c, ["#.#.#", "#.#.#", "#.#.#", ".###."], m["tekstur"], 2, 3),
                                   c.p(2, 3, m["kilau"]),
                                   _mask(c, ["#.#", "#.#", ".#."], m["tekstur"], 10, 9), c.p(10, 9, m["kilau"])),
    "daun": lambda c, m: (c.r(3, 4, 2, 1, MANGO), c.p(4, 5, WOOD), c.r(10, 9, 2, 1, WOOD), c.p(11, 10, WOODD),  # noqa: F405
                          c.r(6, 12, 2, 1, MANGO)),                                                 # noqa: F405
    "batu": lambda c, m: (c.r(5, 6, 4, 2, MIST), c.hl(5, 8, 8, SLATE), c.p(8, 7, SLATE),            # noqa: F405
                          c.r(11, 11, 2, 1, MIST), c.hl(11, 12, 12, SLATE)),                         # noqa: F405
    "kerikil": lambda c, m: [c.p(x, y, SLATE if i % 2 else MIST)                                    # noqa: F405
                             for i, (x, y) in enumerate(((3, 3), (9, 5), (5, 10), (12, 12), (7, 14)))],
    "retakan": lambda c, m: [c.p(x, y, TETAP["aspal_d"])
                             for x, y in ((3, 4), (4, 5), (5, 5), (6, 6), (7, 7), (7, 8), (8, 9), (10, 9), (9, 9))],
    "genangan": lambda c, m: (c.r(5, 7, 6, 3, m["air"]), c.r(6, 6, 4, 1, m["air"]), c.r(6, 10, 4, 1, m["air"]),
                              c.hl(6, 7, 7, m["kilau"]), c.hl(6, 9, 10, m["bayangan"])),
    "bayangan_kecil": lambda c, m: _elips(c, m, 9.5, 10.5, 6, 3.5),
    "bayangan_kanan_atas": lambda c, m: _papan_catur(c, m, lambda x, y: x < 8 and y >= 4),
    "bayangan_kanan": lambda c, m: _papan_catur(c, m, lambda x, y: x < 8),
    "bayangan_sudut": lambda c, m: _papan_catur(c, m, lambda x, y: x < 8 and y < 4),
    "bayangan_bawah_kiri": lambda c, m: _papan_catur(c, m, lambda x, y: x >= 8 and y < 4),
    "bayangan_bawah": lambda c, m: _papan_catur(c, m, lambda x, y: y < 4),
    "bayangan_pohon_kiri_atas": lambda c, m: _elips(c, m, 19, 21, 11, 7, 0, 0),
    "bayangan_pohon_kanan_atas": lambda c, m: _elips(c, m, 19, 21, 11, 7, 16, 0),
    "bayangan_pohon_kiri_bawah": lambda c, m: _elips(c, m, 19, 21, 11, 7, 0, 16),
    "bayangan_pohon_kanan_bawah": lambda c, m: _elips(c, m, 19, 21, 11, 7, 16, 16),
    "garis_tengah_datar": lambda c, m: c.r(4, 7, 8, 2, m["marka"]),
    "garis_tengah_tegak": lambda c, m: c.r(7, 4, 2, 8, m["marka"]),
    "zebra_datar": lambda c, m: (c.r(2, 0, 4, 16, m["marka"]), c.r(10, 0, 4, 16, m["marka"])),
    "zebra_tegak": lambda c, m: (c.r(0, 2, 16, 4, m["marka"]), c.r(0, 10, 16, 4, m["marka"])),
}
for _sisi in ("n", "s", "w", "e", "nw", "ne", "sw", "se"):
    TUMPANG[f"lapangan_{_sisi}"] = (lambda s: (lambda c, m: _garis_lapangan(c, m, s)))(_sisi)
TUMPANG["lapangan_tengah_tegak"] = lambda c, m: _garis_lapangan(c, m, "", "tegak")
TUMPANG["lapangan_tengah_datar"] = lambda c, m: _garis_lapangan(c, m, "", "datar")
TUMPANG["lapangan_n_tegak"] = lambda c, m: _garis_lapangan(c, m, "n", "tegak")
TUMPANG["lapangan_s_tegak"] = lambda c, m: _garis_lapangan(c, m, "s", "tegak")
TUMPANG["lapangan_w_datar"] = lambda c, m: _garis_lapangan(c, m, "w", "datar")
TUMPANG["lapangan_e_datar"] = lambda c, m: _garis_lapangan(c, m, "e", "datar")


def ubin_tumpang(nama, m):
    c = C(16, 16)                                                                    # noqa: F405
    TUMPANG[nama](c, m)
    return c


# --------------------------------------------------------------------------- susunan lembar
SUSUNAN = [("rumput", v) for v in range(4)]
SUSUNAN += [("tumpang", n) for n in TUMPANG]
SUSUNAN += [("varian2", b) for b in WILAYAH]
while len(SUSUNAN) % KOLOM:
    SUSUNAN.append(("kosong", None))
for _b in WILAYAH:
    SUSUNAN += [("wilayah", (_b, k)) for k in BLOB]
NOMOR = {kunci: i for i, kunci in enumerate(SUSUNAN)}
BARIS = (len(SUSUNAN) + KOLOM - 1) // KOLOM
UKURAN_LEMBAR = (KOLOM * 16, BARIS * 16)


def _gambar(kunci, m):
    jenis, isi = kunci
    if jenis == "rumput":
        return ubin_rumput(m, isi)
    if jenis == "tumpang":
        return ubin_tumpang(isi, m)
    if jenis == "varian2":
        return ubin_wilayah(isi, 0, m, 1)
    if jenis == "wilayah":
        return ubin_wilayah(isi[0], isi[1], m)
    return C(16, 16)                                                                 # noqa: F405


def lembar_ubin(masa):
    """Lembar ubin satu masa: 16 kolom, urutan SUSUNAN."""
    m = MASA[masa]
    lembar = C(*UKURAN_LEMBAR)                                                       # noqa: F405
    for i, kunci in enumerate(SUSUNAN):
        lembar.paste(_gambar(kunci, m), (i % KOLOM) * 16, (i // KOLOM) * 16)
    return lembar


# --------------------------------------------------------------------------- dipakai peta (JS-06) dan pratinjau
def mask_tetangga(bahan_di, x, y):
    """bahan_di(x, y) -> nama bahan atau None di luar peta. Bit = tetangga berprioritas lebih rendah."""
    p = PRIORITAS[bahan_di(x, y)]
    mask = 0
    for bit, dx, dy in ARAH_TETANGGA:
        b = bahan_di(x + dx, y + dy)
        if b is not None and PRIORITAS[b] < p:
            mask |= bit
    return kanon(mask)


def nomor_tanah(bahan_di, x, y):
    """Nomor ubin lapisan 0 untuk sel (x, y), termasuk varian acak berbenih posisi."""
    b = bahan_di(x, y)
    acak = (x * 7 + y * 13 + x * y) % 10
    if b == "rumput":
        return NOMOR[("rumput", 0 if acak < 5 else 1 if acak < 7 else 2 if acak < 9 else 3)]
    k = mask_tetangga(bahan_di, x, y)
    if k == 0 and acak < 3:
        return NOMOR[("varian2", b)]
    return NOMOR[("wilayah", (b, k))]
