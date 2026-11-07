"""Tokoh tampak atas Jejak Setara: avatar pemain A1-A8 dan ikon kepalanya.

Aturan (Design System Jejak bagian 8 dan 14):
- Bingkai 16x24 termasuk margin 1 px. Garis luar INK hanya di tepi siluet: outline() dipanggil sesudah
  semua bagian digambar. Mata 1x2 INK. Setiap bahan paling banyak 3 tingkat warna.
- Bayangan kaki: elips 10x4 berpola papan catur INK di baris 20-23, digambar sesudah garis luar.
- Titik kaki (jangkar) x 8, y 21: baris tepat di bawah sepatu.
- Arah: bawah, atas, kanan. Arah kiri = cermin arah kanan (flip). Gerak: diam 2 bingkai, jalan 4 bingkai;
  lari memakai bingkai jalan.
- Tas digambar dengan warna kunci SUN (dasar) dan MANGO (bayangan). Antarmuka menggantinya dengan warna
  penanda pemain (WARNA_TAS), serentak. Warna kunci tidak dipakai bagian lain avatar (diperiksa build_jejak.py).
- Gaya acuan: avatar A1 di lembar uji gaya (preview/uji_gaya.png), disetujui sebagai acuan 6 Nov 2026.
  Gambar A1 tidak boleh berubah tanpa persetujuan.
"""
from pixelart import *  # noqa: F401,F403

TAS = (SUN, MANGO)  # noqa: F405   warna kunci tas
WARNA_TAS = {       # warna penanda: (dasar, bayangan) - Daftar_Aset.md bagian A
    "sun": (SUN, MANGO), "mango": (MANGO, CORAL), "coral": (CORAL, WOODD), "rose": (ROSE, CORAL),   # noqa: F405
    "berry": (BERRY, MALAM1), "teal": (TEAL, GRASS), "leaf": (LEAF, GRASS), "sky-d": (SKYD, NAVY),  # noqa: F405
}
JANGKAR = (8, 21)
UKURAN = (16, 24)

# Delapan desain (usulan 8a, disetujui 6 Nov 2026). gaya: rapi, kuncir, ikal, kerudung, berdiri, cepak.
# bawahan: celana, rok (dengan kaus kaki putih), rok_panjang (sampai mata kaki).
AVATAR = {
    1: dict(skin=SK3, skin_d=SK4, hair=HR1, gaya="rapi", bawahan="celana"),                          # noqa: F405
    2: dict(skin=SK1, skin_d=SK2, hair=HR1, gaya="kuncir", bawahan="rok", ikat=BERRY),              # noqa: F405
    3: dict(skin=SK4, skin_d=HR2, hair=HR1, gaya="ikal", bawahan="celana", kacamata=True),          # noqa: F405
    4: dict(skin=SK2, skin_d=SK3, hair=None, gaya="kerudung", bawahan="rok_panjang", lengan_panjang=True),  # noqa: F405
    5: dict(skin=SK2, skin_d=SK3, hair=HR2, gaya="berdiri", bawahan="celana"),                      # noqa: F405
    6: dict(skin=SK3, skin_d=SK4, hair=HR2, gaya="kuncir", bawahan="rok", ikat=ROSE, kacamata=True),  # noqa: F405
    7: dict(skin=SK1, skin_d=SK2, hair=HR2, gaya="cepak", bawahan="celana"),                        # noqa: F405
    8: dict(skin=SK4, skin_d=HR2, hair=None, gaya="kerudung", bawahan="rok_panjang", lengan_panjang=True),  # noqa: F405
}
KETERANGAN = {   # untuk pratinjau dan Daftar_Aset.md: kulit, bawahan, rambut atau kepala, ciri lain
    1: ("skin-3", "celana", "rapi"), 2: ("skin-1", "rok", "dikuncir"),
    3: ("skin-4", "celana", "ikal", "kacamata"), 4: ("skin-2", "rok panjang", "kerudung"),
    5: ("skin-2", "celana", "berdiri"), 6: ("skin-3", "rok", "dikuncir", "kacamata"),
    7: ("skin-1", "celana", "cepak"), 8: ("skin-4", "rok panjang", "kerudung"),
}
BINGKAI = {"diam": 2, "jalan": 4}
ARAH = ("bawah", "atas", "kanan")


def _kilau_rambut(h):
    return HR2 if h == HR1 else WOODD  # noqa: F405


def _kepala_kulit(c, s, y0):
    c.r(4, y0, 8, 1, s); c.r(3, y0 + 1, 10, 1, s); c.r(2, y0 + 2, 12, 7, s); c.r(3, y0 + 9, 10, 1, s)


# --------------------------------------------------------------------------- menghadap bawah
def _kepala_bawah(c, d, y0):
    s, sd, h, gaya = d["skin"], d["skin_d"], d["hair"], d["gaya"]
    telinga = True
    if gaya == "kerudung":
        W, M = WHITE, MIST  # noqa: F405
        c.r(4, y0, 8, 1, W); c.r(3, y0 + 1, 10, 1, W); c.r(2, y0 + 2, 12, 8, W)
        c.p(11, y0, M); c.p(12, y0 + 1, M); c.vl(13, y0 + 2, y0 + 9, M)                # sisi kanan teduh
        c.r(5, y0 + 4, 6, 1, s); c.r(4, y0 + 5, 8, 4, s); c.r(5, y0 + 9, 6, 1, s)     # bukaan wajah
        c.hl(5, 10, y0 + 3, M); c.vl(3, y0 + 5, y0 + 8, M)                             # lipatan di tepi wajah
        telinga = False
    else:
        k = _kilau_rambut(h)
        _kepala_kulit(c, s, y0)
        if gaya == "rapi":       # rambut pendek rapi, belah samping (A1, uji gaya)
            c.r(4, y0, 8, 1, h); c.r(3, y0 + 1, 10, 1, h); c.r(2, y0 + 2, 12, 2, h)
            c.r(2, y0 + 4, 2, 2, h); c.r(12, y0 + 4, 2, 2, h)
            c.r(4, y0 + 4, 5, 1, h); c.p(4, y0 + 5, h)
            c.p(2, y0 + 6, h); c.p(13, y0 + 6, h)
            c.hl(4, 6, y0 + 1, k)
        elif gaya == "cepak":    # sangat pendek, tanpa poni; dahi lebih terlihat
            c.r(4, y0, 8, 1, h); c.r(3, y0 + 1, 10, 1, h); c.r(2, y0 + 2, 12, 1, h)
            c.r(2, y0 + 3, 2, 2, h); c.r(12, y0 + 3, 2, 2, h)
            c.p(2, y0 + 5, h); c.p(13, y0 + 5, h)
            c.hl(4, 6, y0 + 1, k)
        elif gaya == "berdiri":  # pendek berdiri: ujung bergerigi di atas dan di sisi, poni runcing
            c.r(4, y0, 8, 1, h); c.r(2, y0 + 1, 12, 1, h); c.r(2, y0 + 2, 12, 2, h)
            c.p(6, y0, T); c.p(9, y0, T)                                                # noqa: F405
            c.r(2, y0 + 4, 3, 1, h); c.r(6, y0 + 4, 2, 1, h); c.r(9, y0 + 4, 2, 1, h); c.r(12, y0 + 4, 2, 1, h)
            c.p(2, y0 + 5, h); c.p(13, y0 + 5, h)
            c.hl(4, 5, y0 + 1, k); c.p(7, y0, k)
        elif gaya == "ikal":     # pendek ikal bervolume: lebih lebar dari kepala
            c.r(3, y0, 10, 1, h); c.p(6, y0, T); c.p(10, y0, T)                        # noqa: F405
            c.r(2, y0 + 1, 12, 1, h); c.r(1, y0 + 2, 14, 3, h)
            c.r(1, y0 + 5, 2, 2, h); c.r(13, y0 + 5, 2, 2, h)
            c.r(4, y0 + 5, 2, 1, h); c.r(10, y0 + 5, 2, 1, h)                           # ikal di dahi
            for x, y in ((4, y0 + 1), (8, y0 + 2), (12, y0 + 3), (2, y0 + 4)):
                c.p(x, y, k)
        elif gaya == "kuncir":   # panjang dikuncir: sisi panjang menutup telinga, poni ke kanan
            c.r(4, y0, 8, 1, h); c.r(3, y0 + 1, 10, 1, h); c.r(2, y0 + 2, 12, 2, h)
            c.r(2, y0 + 4, 2, 5, h); c.r(12, y0 + 4, 2, 5, h)
            c.r(7, y0 + 4, 5, 1, h); c.r(10, y0 + 5, 2, 1, h)
            c.hl(4, 6, y0 + 1, k)
            telinga = False
    if telinga:
        c.p(2, y0 + 7, sd); c.p(13, y0 + 7, sd)
    c.r(5, y0 + 6, 1, 2, INK); c.r(10, y0 + 6, 1, 2, INK)                               # noqa: F405
    c.hl(7, 8, y0 + 8, sd)                                                             # mulut kecil
    if d.get("kacamata"):    # bingkai atas dan sisi, jembatan di tengah
        for x in (4, 9):
            c.hl(x, x + 2, y0 + 5, SLATE); c.vl(x, y0 + 6, y0 + 7, SLATE); c.vl(x + 2, y0 + 6, y0 + 7, SLATE)  # noqa: F405
        c.hl(7, 8, y0 + 6, SLATE)                                                       # noqa: F405


def _kerudung_badan(c, arah, y0):
    """Juntai kerudung menutup bahu dan dada; tepi bawahnya bergaris SLATE."""
    W, M, S = WHITE, MIST, SLATE  # noqa: F405
    if arah == "bawah":
        c.r(3, y0, 10, 2, W); c.hl(4, 11, y0 + 2, W); c.hl(5, 10, y0 + 3, S)
        c.vl(12, y0, y0 + 1, M); c.p(11, y0 + 2, M)
    elif arah == "atas":
        c.r(2, y0, 12, 3, W); c.hl(3, 12, y0 + 3, S)
        c.vl(13, y0, y0 + 2, M)
    else:
        c.r(6, y0, 5, 2, W); c.hl(6, 10, y0 + 2, S)


def _bawahan(c, d, y0, arah):
    b = d["bawahan"]
    x0, x1 = (5, 10) if arah == "kanan" else (4, 11)
    if b == "celana":
        c.r(x0, y0 + 6, x1 - x0 + 1, 2, NAVY); c.vl(x1, y0 + 6, y0 + 7, DUSK)            # noqa: F405
    elif b == "rok":
        c.hl(x0, x1, y0 + 6, NAVY); c.hl(x0 - 1, x1 + 1, y0 + 7, NAVY)                  # noqa: F405
        c.p(x1, y0 + 6, DUSK); c.p(x1 + 1, y0 + 7, DUSK)                               # noqa: F405
        if arah != "kanan":
            c.p(6, y0 + 7, DUSK); c.p(9, y0 + 7, DUSK)                                 # noqa: F405  lipit
    else:   # rok panjang sampai baris 19, melebar ke bawah
        c.hl(x0, x1, y0 + 6, NAVY); c.r(x0 - 1, y0 + 7, x1 - x0 + 3, 19 - y0 - 6, NAVY)  # noqa: F405
        c.p(x1, y0 + 6, DUSK); c.vl(x1 + 1, y0 + 7, 19, DUSK)                          # noqa: F405
        if arah != "kanan":
            c.vl(6, y0 + 8, 19, DUSK); c.vl(9, y0 + 8, 19, DUSK)                       # noqa: F405


def _lengan(c, d, x, y0, dy, kain):
    s, sd = d["skin"], d["skin_d"]
    if d.get("lengan_panjang"):
        c.r(x, y0, 1, 4 + dy, kain); c.p(x, y0 + 4 + dy, s)
    else:
        c.r(x, y0, 1, 3, kain); c.r(x, y0 + 3 + dy, 1, 2, s); c.p(x, y0 + 4 + dy, sd)


def _badan_bawah(c, d, y0, tas, ayun=0):
    s = d["skin"]
    t, td = tas
    c.r(4, y0, 8, 5, WHITE); c.vl(11, y0, y0 + 4, MIST)                                 # noqa: F405  kemeja
    c.p(7, y0, s); c.p(8, y0, s); c.p(6, y0, MIST); c.p(9, y0, MIST)                    # noqa: F405  kerah V
    for x, dy, kain in ((3, -ayun, WHITE), (12, ayun, MIST)):                           # noqa: F405
        _lengan(c, d, x, y0, dy, kain)
    c.hl(4, 11, y0 + 5, INK)                                                            # noqa: F405  ikat pinggang
    _bawahan(c, d, y0, "bawah")
    if d["gaya"] == "kerudung":
        _kerudung_badan(c, "bawah", y0)
    c.vl(5, y0, y0 + 3, t); c.vl(10, y0, y0 + 3, td)                                    # tali tas


# --------------------------------------------------------------------------- menghadap atas (punggung)
def _kepala_atas(c, d, y0):
    s, sd, h, gaya = d["skin"], d["skin_d"], d["hair"], d["gaya"]
    if gaya == "kerudung":
        W, M = WHITE, MIST  # noqa: F405
        c.r(4, y0, 8, 1, W); c.r(3, y0 + 1, 10, 1, W); c.r(2, y0 + 2, 12, 8, W)
        c.p(11, y0, M); c.p(12, y0 + 1, M); c.vl(13, y0 + 2, y0 + 9, M)
        return
    k = _kilau_rambut(h)
    if gaya == "ikal":
        c.r(3, y0, 10, 1, h); c.p(6, y0, T); c.p(10, y0, T)                            # noqa: F405
        c.r(2, y0 + 1, 12, 1, h); c.r(1, y0 + 2, 14, 6, h); c.r(2, y0 + 8, 12, 1, h); c.r(3, y0 + 9, 10, 1, h)
        for x, y in ((4, y0 + 1), (8, y0 + 3), (12, y0 + 2), (3, y0 + 5), (10, y0 + 6)):
            c.p(x, y, k)
        c.r(6, y0 + 9, 4, 1, s)
        return
    c.r(4, y0, 8, 1, h); c.r(3, y0 + 1, 10, 1, h); c.r(2, y0 + 2, 12, 7, h); c.r(3, y0 + 9, 10, 1, h)
    if gaya == "berdiri":
        c.p(6, y0, T); c.p(9, y0, T); c.p(2, y0 + 1, h); c.p(13, y0 + 1, h)              # noqa: F405
    c.hl(4, 6, y0 + 1, k); c.p(3, y0 + 2, k)
    if gaya == "kuncir":     # rambut panjang sampai tengkuk; ekor kuda jatuh di atas tas
        c.r(7, y0 + 3, 2, 1, d["ikat"])
        c.r(7, y0 + 4, 2, 8, h); c.p(7, y0 + 12, h); c.vl(7, y0 + 5, y0 + 7, k)
        return
    c.p(2, y0 + 7, sd); c.p(13, y0 + 7, sd)                                            # telinga
    if gaya == "cepak":
        c.r(4, y0 + 8, 8, 1, s); c.r(5, y0 + 9, 6, 1, s)                                # tengkuk lebih terlihat
    else:
        c.r(5, y0 + 9, 6, 1, s)                                                         # tengkuk


def _badan_atas(c, d, y0, tas, ayun=0):
    t, td = tas
    c.r(4, y0, 8, 5, WHITE); c.vl(11, y0, y0 + 4, MIST)                                 # noqa: F405
    for x, dy, kain in ((3, ayun, WHITE), (12, -ayun, MIST)):                           # noqa: F405
        _lengan(c, d, x, y0, dy, kain)
    c.p(4, y0 + 5, INK); c.p(11, y0 + 5, INK)                                           # noqa: F405
    _bawahan(c, d, y0, "atas")
    if d["gaya"] == "kerudung":
        _kerudung_badan(c, "atas", y0)
    c.r(5, y0, 6, 6, t); c.hl(5, 10, y0, td); c.hl(5, 10, y0 + 5, td); c.vl(10, y0 + 1, y0 + 4, td)
    c.hl(6, 9, y0 + 2, td)                                                              # tutup tas


# --------------------------------------------------------------------------- menghadap kanan
def _kepala_kanan(c, d, y0):
    s, sd, h, gaya = d["skin"], d["skin_d"], d["hair"], d["gaya"]
    telinga = True
    if gaya == "kerudung":
        W, M = WHITE, MIST  # noqa: F405
        c.r(4, y0, 8, 1, W); c.r(3, y0 + 1, 10, 1, W); c.r(3, y0 + 2, 11, 8, W)
        c.vl(3, y0 + 3, y0 + 9, M)
        c.r(9, y0 + 4, 4, 1, s); c.r(8, y0 + 5, 6, 4, s); c.r(9, y0 + 9, 4, 1, s)       # bukaan wajah
        c.vl(7, y0 + 5, y0 + 8, M)
        telinga = False
    else:
        k = _kilau_rambut(h)
        c.r(4, y0, 8, 1, s); c.r(3, y0 + 1, 10, 1, s); c.r(3, y0 + 2, 11, 7, s); c.r(4, y0 + 9, 9, 1, s)
        if gaya in ("rapi", "berdiri"):
            c.r(4, y0, 8, 1, h); c.r(3, y0 + 1, 10, 1, h); c.r(3, y0 + 2, 11, 2, h)
            c.r(3, y0 + 4, 5, 3, h); c.r(3, y0 + 7, 3, 2, h)
            c.r(8, y0 + 4, 5, 1, h)
            if gaya == "berdiri":
                c.p(6, y0, T); c.p(9, y0, T); c.p(2, y0 + 1, h); c.p(2, y0 + 3, h)      # noqa: F405
                c.p(10, y0 + 5, h); c.p(12, y0 + 5, h)
                c.hl(5, 6, y0 + 1, k)
            else:
                c.hl(5, 7, y0 + 1, k)
        elif gaya == "cepak":
            c.r(4, y0, 8, 1, h); c.r(3, y0 + 1, 10, 1, h); c.r(3, y0 + 2, 11, 1, h)
            c.r(3, y0 + 3, 4, 3, h); c.r(3, y0 + 6, 2, 2, h)
            c.hl(5, 7, y0 + 1, k)
        elif gaya == "ikal":
            c.r(3, y0, 9, 1, h); c.p(6, y0, T)                                          # noqa: F405
            c.r(2, y0 + 1, 11, 1, h); c.r(2, y0 + 2, 12, 3, h); c.r(2, y0 + 5, 5, 3, h); c.r(3, y0 + 8, 3, 1, h)
            c.r(10, y0 + 5, 2, 1, h)
            for x, y in ((4, y0 + 1), (8, y0 + 2), (3, y0 + 4), (11, y0 + 3)):
                c.p(x, y, k)
        elif gaya == "kuncir":
            c.r(4, y0, 8, 1, h); c.r(3, y0 + 1, 10, 1, h); c.r(3, y0 + 2, 11, 2, h)
            c.r(3, y0 + 4, 5, 5, h); c.r(8, y0 + 4, 5, 1, h)
            c.p(2, y0 + 3, d["ikat"]); c.r(1, y0 + 4, 2, 4, h); c.p(2, y0 + 8, h)       # ekor kuda di belakang
            c.hl(5, 7, y0 + 1, k)
            telinga = False
    if telinga:
        c.p(6, y0 + 7, sd); c.p(7, y0 + 7, sd)
    c.r(11, y0 + 6, 1, 2, INK)                                                          # noqa: F405  mata
    c.p(14, y0 + 7, s)                                                                  # hidung
    c.p(12, y0 + 8, sd)                                                                 # mulut
    if d.get("kacamata"):
        c.hl(10, 12, y0 + 5, SLATE); c.vl(10, y0 + 6, y0 + 7, SLATE); c.vl(12, y0 + 6, y0 + 7, SLATE)  # noqa: F405
        c.hl(7, 9, y0 + 6, SLATE)                                                       # noqa: F405  gagang


def _badan_kanan(c, d, y0, tas, ayun=0):
    s, sd = d["skin"], d["skin_d"]
    t, td = tas
    c.r(5, y0, 6, 5, WHITE); c.vl(10, y0, y0 + 4, MIST)                                 # noqa: F405
    if d["gaya"] == "kerudung":
        _kerudung_badan(c, "kanan", y0)
    c.r(2, y0, 4, 6, t); c.vl(2, y0, y0 + 5, td); c.hl(2, 5, y0 + 5, td)                # tas di punggung
    c.vl(6, y0, y0 + 2, td)                                                             # tali
    if d.get("lengan_panjang"):
        c.r(7 + ayun, y0 + 1, 2, 3, WHITE); c.r(7 + ayun, y0 + 4, 2, 1, s)              # noqa: F405
    else:
        c.r(7 + ayun, y0 + 1, 2, 2, WHITE); c.r(7 + ayun, y0 + 3, 2, 2, s); c.p(8 + ayun, y0 + 4, sd)  # noqa: F405
    c.hl(5, 10, y0 + 5, INK)                                                            # noqa: F405
    _bawahan(c, d, y0, "kanan")


# --------------------------------------------------------------------------- kaki dan bayangan
def _kaki(c, d, arah, langkah=0):
    """Kaki 2 px (baris 19-20): celana navy, atau kaus kaki putih di bawah rok; rok panjang hanya sepatu."""
    b = d["bawahan"]
    warna = NAVY if b == "celana" else WHITE                                            # noqa: F405
    tampak = b != "rok_panjang"
    y0 = 19
    if arah == "kanan":
        if langkah == 0:
            if tampak:
                c.r(6, y0, 2, 1, warna); c.r(8, y0, 2, 1, warna)
            c.r(6, y0 + 1, 5, 1, DUSK)                                                  # noqa: F405
        else:
            if tampak:
                c.r(5, y0, 2, 1, warna); c.r(9, y0, 2, 1, warna)
            c.r(4, y0 + 1, 3, 1, DUSK); c.r(9, y0 + 1, 3, 1, DUSK)                      # noqa: F405
        return
    if arah == "bawah":   # kaki yang maju turun 1 px (lebih dekat kamera)
        kl, kr = (1 if langkah == -1 else 0), (1 if langkah == 1 else 0)
    else:
        kl, kr = (1 if langkah == 1 else 0), (1 if langkah == -1 else 0)
    for x, kx in ((5, kl), (9, kr)):
        if tampak:
            c.r(x, y0, 2, 1 + kx, warna)
        elif kx:
            c.r(x, y0 + 1, 2, 1, NAVY)                                                  # noqa: F405  ujung rok ikut maju
        c.r(x, y0 + 1 + kx, 2, 1, DUSK)                                                 # noqa: F405  sepatu
    if arah == "bawah":
        c.p(4, y0 + 1 + kl, DUSK); c.p(11, y0 + 1 + kr, DUSK)                           # noqa: F405


def _bayangan_kaki(c, y0=20):
    """Elips 10x4 papan catur INK, hanya di piksel kosong (sesudah garis luar)."""
    for dy, row in enumerate(["..######..", "##########", "##########", "..######.."]):
        for dx, ch in enumerate(row):
            x, y = 3 + dx, y0 + dy
            if ch == "#" and (x + y) % 2 == 0 and c.px[x, y][3] == 0:
                c.px[x, y] = INK                                                        # noqa: F405


# --------------------------------------------------------------------------- titik masuk
def desain(n):
    return AVATAR[n] if isinstance(n, int) else n


def avatar(n, arah="bawah", pose="diam", bingkai=0, tas=TAS, bayangan=True):
    """Satu bingkai 16x24. n = nomor desain (1-8) atau dict desain."""
    d = desain(n)
    c = C(*UKURAN)                                                                      # noqa: F405
    napas = 1 if (pose == "diam" and bingkai == 1) else 0
    langkah = {0: 0, 1: -1, 2: 0, 3: 1}[bingkai] if pose == "jalan" else 0
    naik = 1 if (pose == "jalan" and bingkai in (0, 2)) else 0
    top = 1 + napas - naik + (1 if pose == "jalan" else 0)
    _kaki(c, d, arah, langkah)
    if arah == "bawah":
        _badan_bawah(c, d, top + 10, tas, langkah); _kepala_bawah(c, d, top)
    elif arah == "atas":
        _badan_atas(c, d, top + 10, tas, langkah); _kepala_atas(c, d, top)
    else:
        _badan_kanan(c, d, top + 10, tas, langkah); _kepala_kanan(c, d, top)
    c.outline()
    if bayangan:
        _bayangan_kaki(c)
    return c


def strip_avatar(n, arah, pose, tas=TAS):
    return strip([avatar(n, arah, pose, i, tas) for i in range(BINGKAI[pose])])         # noqa: F405


def ikon_kepala(n, tas=TAS):
    """Ikon 16x16: kepala dan bahu menghadap bawah, untuk papan skor, lobi, dan kartu pemain."""
    d = desain(n)
    sumber = C(*UKURAN)                                                                 # noqa: F405
    _badan_bawah(sumber, d, 11, tas, 0)
    _kepala_bawah(sumber, d, 1)
    c = C(16, 16)                                                                       # noqa: F405
    c.im.alpha_composite(sumber.im.crop((0, 0, 16, 15)), (0, 0))
    c.px = c.im.load()
    c.outline()
    return c


def ganti_tas(c, nama):
    """Contoh cara antarmuka mengganti warna kunci tas: serentak, bukan berurutan."""
    dasar, bayang = WARNA_TAS[nama]
    n = C(c.w, c.h)                                                                     # noqa: F405
    n.im = c.im.copy(); n.px = n.im.load()
    for y in range(c.h):
        for x in range(c.w):
            if c.px[x, y] == SUN:                                                       # noqa: F405
                n.px[x, y] = dasar
            elif c.px[x, y] == MANGO:                                                   # noqa: F405
                n.px[x, y] = bayang
    return n
