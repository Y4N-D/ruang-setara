"""Ikon antarmuka Sehari Setara (Batch D, disetujui 21 Okt).

Aturan: hanya warna palet, garis luar 1 px INK di tepi siluet (kanvas bermargin 1 px, outline() terakhir),
tanpa teks, angka, logo, lambang instansi, atau merek. Tanda tanya dan tanda seru pada ikon emosi adalah
simbol, bukan teks.
  16x16 : ui_hak, ui_kewajiban, ui_star (3 bingkai pop), ui_clock, ui_sound_on/off, ui_fullscreen, ui_team_*
  32x32 : role_polisi, role_jaksa, role_advokat, role_hakim (potret setengah badan dalam lencana bundar)
  8x8   : emote_hati, emote_keringat, emote_tanya, emote_seru
  48x32 : ui_timbangan (5 bingkai: miring kiri, sedikit kiri, seimbang, sedikit kanan, miring kanan)
"""
import math

from pixelart import *  # noqa: F401,F403
from tokoh import _head  # noqa: E402


def _mask(c, rows, col, x0=0, y0=0):
    """Gambar pola baris ('#' = isi) mulai dari (x0, y0)."""
    for dy, row in enumerate(rows):
        for dx, ch in enumerate(row):
            if ch == '#': c.p(x0 + dx, y0 + dy, col)


# ---------------------------------------------------------------------------
# D-01 Hak orang lain terjaga: perisai-hati (teal)
# ---------------------------------------------------------------------------
def ui_hak():
    c = C(16, 16)
    shield = ["..########..",
              ".##########.",
              "############",
              "############",
              "############",
              "############",
              "############",
              ".##########.",
              "..########..",
              "...######...",
              "....####....",
              ".....##....."]
    _mask(c, shield, TEAL, 2, 2)
    for y in range(3, 13):                                     # sisi kanan bayangan
        for x in range(10, 14):
            if c.px[x, y] == TEAL and (x + y) % 2 == 0: c.p(x, y, GRASS)
    c.vl(3, 4, 8, SIANG3); c.p(4, 3, SIANG3)                    # kilau kiri
    _mask(c, ["##..##", "######", "######", ".####.", "..##.."], WHITE, 5, 5)
    c.outline(); return c


# ---------------------------------------------------------------------------
# D-02 Kewajiban dijalankan: tangan-centang (sky-d)
# ---------------------------------------------------------------------------
def ui_kewajiban():
    c = C(16, 16)
    hand = ["....#..#........",
            "...##.##.##.....",
            "...##.##.##.....",
            "...##.##.##.##..",
            "...##.##.##.##..",
            "...###########..",
            ".#.###########..",
            ".#############..",
            "..############..",
            "...##########...",
            "....########....",
            "....########...."]
    _mask(c, hand, SKYD, 0, 2)
    for y in range(7, 14): c.p(13, y, NAVY)                                          # sisi kanan bayangan
    c.vl(3, 4, 7, SIANG1); c.vl(6, 4, 7, SIANG1); c.vl(9, 4, 7, SIANG1)                # kilau jari
    for (x, y) in ((5, 10), (6, 11), (7, 12), (8, 11), (9, 10), (10, 9), (11, 8)): c.p(x, y, WHITE)   # centang
    for (x, y) in ((6, 10), (7, 11), (8, 10), (9, 9), (10, 8)): c.p(x, y, WHITE)
    c.outline(); return c


# ---------------------------------------------------------------------------
# D-03 Bintang alasan: bintang bersudut lima, 3 bingkai pop (kecil, besar, normal)
# ---------------------------------------------------------------------------
def _star5(c, cx, cy, ro, ri, fill=SUN, shade=MANGO, light=WHITE):
    pts = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5
        r = ro if k % 2 == 0 else ri
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))

    def inside(x, y):
        n, j, ok = len(pts), len(pts) - 1, False
        for i in range(n):
            (xi, yi), (xj, yj) = pts[i], pts[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi: ok = not ok
            j = i
        return ok
    for y in range(c.h):
        for x in range(c.w):
            if inside(x + 0.5, y + 0.5): c.p(x, y, fill)
    for y in range(c.h):                                         # bayangan sisi kanan bawah
        for x in range(c.w):
            if c.px[x, y] == fill and (x + 0.5 - cx) + (y + 0.5 - cy) > ro * 0.55: c.p(x, y, shade)
    return pts


def ui_star(frame=2):
    """frame 0: kecil (muncul), 1: besar dengan kilau, 2: normal (diam)."""
    c = C(16, 16)
    ro, ri = {0: (4.2, 1.9), 1: (7.6, 3.3), 2: (6.6, 2.9)}[frame]
    _star5(c, 8.0, 8.4, ro, ri)
    if frame >= 1: c.p(6, 6, WHITE); c.p(7, 6, WHITE); c.p(6, 7, WHITE)            # kilau
    else: c.p(7, 7, WHITE)
    if frame == 1:                                                                   # percikan kecil (ikut bergaris luar)
        for (x, y) in ((2, 2), (13, 2)): c.p(x, y, SUN)
    c.outline(); return c


# ---------------------------------------------------------------------------
# D-04 Pengatur waktu: stopwatch
# ---------------------------------------------------------------------------
def ui_clock():
    c = C(16, 16)
    c.r(6, 1, 4, 1, SLATE); c.r(7, 2, 2, 2, SLATE); c.r(12, 3, 2, 2, SLATE)           # tombol atas dan samping
    for y in range(16):
        for x in range(16):
            d = (x + 0.5 - 8) ** 2 + (y + 0.5 - 9.5) ** 2
            if d <= 5.6 ** 2: c.p(x, y, SKYD if d > 4.1 ** 2 else WHITE)
    c.p(8, 6, INK); c.p(11, 9, INK); c.p(8, 12, INK); c.p(5, 9, INK)                 # tanda jam (tanpa angka)
    c.vl(8, 7, 9, INK); c.hl(9, 10, 9, CORAL)                                         # jarum
    c.p(5, 6, SIANG1); c.p(4, 7, SIANG1)                                              # kilau pinggir
    c.outline(); return c


# ---------------------------------------------------------------------------
# D-05 Suara aktif/nonaktif, D-06 layar penuh
# ---------------------------------------------------------------------------
def _speaker(c):
    c.r(2, 6, 3, 4, DUSK); c.p(2, 6, SLATE)
    for i in range(4): c.vl(5 + i, 5 - i, 10 + i, DUSK)
    c.vl(5, 5, 6, SLATE); c.p(6, 4, SLATE)


def ui_sound_on():
    c = C(16, 16); _speaker(c)
    c.vl(10, 6, 9, DUSK)
    c.p(12, 4, DUSK); c.vl(13, 5, 10, DUSK); c.p(12, 11, DUSK)                       # gelombang suara
    c.outline(); return c


def ui_sound_off():
    c = C(16, 16); _speaker(c)
    for i in range(5): c.p(10 + i, 5 + i, CORAL); c.p(14 - i, 5 + i, CORAL)            # tanda silang
    c.outline(); return c


def ui_fullscreen():
    c = C(16, 16)
    for (x, y, dx, dy) in ((2, 2, 1, 1), (13, 2, -1, 1), (2, 13, 1, -1), (13, 13, -1, -1)):
        for k in range(4): c.p(x + dx * k, y, DUSK); c.p(x, y + dy * k, DUSK)        # sudut siku
    c.outline(); return c


# ---------------------------------------------------------------------------
# D-07 Bentuk tim (warna DAN bentuk; Tim Mentari bintang bersudut empat agar beda dari bintang alasan)
# ---------------------------------------------------------------------------
def ui_team(shape):
    c = C(16, 16)
    if shape == 'lingkaran':           # Tim Mangga
        for y in range(16):
            for x in range(16):
                if (x + 0.5 - 8) ** 2 + (y + 0.5 - 8) ** 2 <= 6.3 ** 2:
                    c.p(x, y, CORAL if (x + 0.5 - 6.6) ** 2 + (y + 0.5 - 6.6) ** 2 > 6.0 ** 2 else MANGO)
        c.p(5, 5, WHITE); c.p(6, 4, WHITE); c.p(4, 6, WHITE)
    elif shape == 'segitiga':          # Tim Laut
        for y in range(2, 14):
            half = (y - 2) * 6 // 11
            c.hl(8 - half - 1, 8 + half, y, SKYD)
        for y in range(5, 14): c.p(8 + (y - 2) * 6 // 11, y, NAVY)
        c.vl(7, 4, 6, SIANG1)
    elif shape == 'persegi':           # Tim Daun
        c.r(2, 2, 12, 12, LEAF); c.vl(13, 3, 13, GRASS); c.hl(3, 13, 13, GRASS)
        c.p(4, 4, WHITE); c.p(5, 4, WHITE); c.p(4, 5, WHITE)
    elif shape == 'bintang':           # Tim Mentari: bintang bersudut empat
        star4 = ["......##......",
                 "......##......",
                 ".....####.....",
                 ".....####.....",
                 "....######....",
                 "##############",
                 "##############",
                 "....######....",
                 ".....####.....",
                 ".....####.....",
                 "......##......",
                 "......##......"]
        _mask(c, star4, SUN, 1, 2)
        for y in range(2, 14):
            for x in range(8, 15):
                if c.px[x, y] == SUN and (x + y) % 2 == 1 and (y >= 8 or x >= 10): c.p(x, y, MANGO)
        c.p(7, 5, WHITE); c.p(6, 7, WHITE)
    c.outline(); return c


# ---------------------------------------------------------------------------
# D-09 Ikon emosi 8x8 (di atas kepala tokoh)
# ---------------------------------------------------------------------------
def emote(kind):
    c = C(8, 8)
    if kind == 'hati':
        _mask(c, ["##..##", "######", "######", ".####.", "..##.."], CORAL, 1, 2)
        c.p(2, 2, ROSE); c.p(1, 3, ROSE)
    elif kind == 'keringat':
        _mask(c, ["..#.", ".##.", "####", "####", "####", ".##."], SIANG1, 2, 1)
        c.p(3, 4, WHITE); c.p(3, 5, WHITE); c.vl(5, 4, 5, SKYD); c.p(4, 6, SKYD)
    elif kind == 'tanya':
        _mask(c, [".####.", "##..##", "...##.", "..##..", "......", "..##.."], WHITE, 1, 1)   # garis 2 px agar terbaca
    elif kind == 'seru':
        _mask(c, ["##", "##", "##", "##", "..", "##"], SUN, 3, 1)
    c.outline(); return c


# ---------------------------------------------------------------------------
# D-10 Timbangan Hak (piring kiri, hati teal) dan Kewajiban (piring kanan, centang sky-d)
# ---------------------------------------------------------------------------
TILTS = (22, 10, 0, -10, -22)          # derajat; positif = sisi kiri turun


def _line(c, x0, y0, x1, y1, col):
    """Garis Bresenham 1 px."""
    dx, dy = abs(x1 - x0), -abs(y1 - y0)
    sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
    err = dx + dy
    while True:
        c.p(x0, y0, col)
        if x0 == x1 and y0 == y1: break
        e2 = 2 * err
        if e2 >= dy: err += dy; x0 += sx
        if e2 <= dx: err += dx; y0 += sy


def ui_timbangan(frame=2):
    """frame 0..4 = miring kiri, sedikit kiri, seimbang, sedikit kanan, miring kanan."""
    c = C(48, 32)
    deg = TILTS[frame]
    px, py, half, drop = 24, 9, 17, 8
    a = math.radians(deg)
    lx, ly = round(px - half * math.cos(a)), round(py + half * math.sin(a))
    rx, ry = round(px + half * math.cos(a)), round(py - half * math.sin(a))
    # tiang dan kaki
    c.r(16, 28, 17, 2, MANGO); c.r(18, 27, 13, 1, SUN); c.hl(18, 30, 27, WHITE)
    c.r(23, 9, 3, 18, SUN); c.vl(25, 9, 26, MANGO); c.vl(23, 10, 25, WHITE)
    c.r(22, 5, 5, 3, SUN); c.p(24, 4, SUN); c.hl(22, 26, 7, MANGO)                    # ujung atas
    # tali dan piring (piring selalu mendatar)
    for (ex, ey, side) in ((lx, ly, 'kiri'), (rx, ry, 'kanan')):
        c.vl(ex, ey, ey + drop, SLATE)
        by = ey + drop
        c.r(ex - 5, by, 11, 2, SUN); c.r(ex - 4, by + 2, 9, 1, MANGO); c.hl(ex - 3, ex + 3, by + 3, MANGO)
        c.hl(ex - 5, ex + 5, by, WHITE)
        if side == 'kiri':                                                            # hati kecil (Hak)
            _mask(c, ["##.##", "#####", ".###.", "..#.."], TEAL, ex - 2, by - 4)
        else:                                                                         # centang kecil (Kewajiban)
            for (x, y) in ((-2, -2), (-1, -1), (0, -2), (1, -3), (2, -4)): c.p(ex + x, by + y, SKYD); c.p(ex + x, by + y - 1, SKYD)
    # balok timbangan (2 px), digambar setelah tali agar bertumpu di atas tali
    _line(c, lx, ly, rx, ry, MANGO); _line(c, lx, ly - 1, rx, ry - 1, SUN)
    c.r(px - 1, py - 2, 3, 3, MANGO); c.p(px, py - 1, WHITE)                          # poros
    c.outline(); return c


# ---------------------------------------------------------------------------
# D-08 Ikon peran penegak hukum: potret setengah badan dalam lencana bundar (tanpa lambang instansi)
# ---------------------------------------------------------------------------
ROLES = {
    # polisi: seragam cokelat dan topi pet; menerima laporan (buku catatan dan pena)
    'polisi': dict(skin=SK2, skin_d=SK3, hair=HR1, hair_style='bob', expr='smile'),
    # jaksa: toga hitam, simare hitam, bef putih; berkas tuntutan
    'jaksa': dict(skin=SK3, skin_d=SK4, hair=HR1, hair_style='cepak', expr='neutral'),
    # advokat: toga hitam, simare hitam, bef putih; tas kerja (mendampingi)
    'advokat': dict(skin=SK1, skin_d=SK2, hair=HR2, hair_style='kuncir', expr='smile'),
    # hakim: toga hitam bersimare merah (pengadilan negeri), bef putih, peci hitam; palu sidang
    'hakim': dict(skin=SK4, skin_d=HR2, hair=HR1, hair_style='plontos', expr='neutral'),
}


def _badge_mask(x, y):
    return (x + 0.5 - 16) ** 2 + (y + 0.5 - 16) ** 2 <= 14.6 ** 2


def role_icon(role):
    p = ROLES[role]
    c = C(32, 32)
    for y in range(32):                                          # lencana bundar
        for x in range(32):
            if _badge_mask(x, y): c.p(x, y, SIANG2)
    for y in range(32):
        for x in range(32):
            if _badge_mask(x, y) and not _badge_mask(x - 2, y - 2) and (x + y) % 2 == 0: c.p(x, y, SIANG1)
    body = C(32, 32)                                             # badan dan kepala dipotong oleh lencana
    hx, hy = 7, 5
    if role == 'polisi':
        top, top_d, top_l = WOODD, HR2, WOOD
    else:
        top, top_d, top_l = DUSK, NAVY, SLATE
    body.r(3, 24, 26, 8, top); body.r(6, 22, 20, 2, top)         # bahu dan dada
    body.vl(25, 23, 31, top_d); body.vl(26, 24, 31, top_d)
    if role == 'polisi':
        body.r(12, 22, 8, 2, top_l); body.p(15, 24, top_l); body.p(16, 24, top_l)    # kerah kemeja
        body.hl(8, 11, 27, top_d); body.hl(20, 23, 27, top_d)                         # tutup saku
        body.r(4, 23, 5, 2, top_d); body.r(23, 23, 5, 2, top_d)                       # tali bahu polos (tanpa lambang)
    else:
        simare = CORAL if role == 'hakim' else HR1
        body.r(10, 22, 3, 10, simare); body.r(19, 22, 3, 10, simare)                  # simare
        body.r(13, 22, 6, 2, WHITE); body.r(14, 24, 2, 5, WHITE); body.r(16, 24, 2, 5, WHITE)   # bef putih
        body.vl(16, 24, 28, MIST)
    body.r(13, 20, 6, 2, p['skin_d'])                                                   # leher
    _head(body, hx, hy, p['skin'], p['skin_d'], p['hair'], p['hair_style'], p['expr'])
    if role == 'polisi':                                         # topi pet cokelat tanpa lambang
        body.r(hx - 1, hy - 4, 20, 4, top); body.r(hx + 1, hy - 5, 16, 1, top)           # mahkota topi (lebih lebar dari kepala)
        body.hl(hx + 1, hx + 12, hy - 4, top_l); body.hl(hx + 1, hx + 16, hy - 5, top_l)
        body.r(hx, hy, 18, 2, top_d)                                                    # pita topi
        body.r(hx + 12, hy + 2, 9, 2, HR1); body.hl(hx + 13, hx + 20, hy + 2, DUSK)      # pet di depan (menghadap kanan)
    elif role == 'hakim':                                        # peci hitam: berpuncak datar, sisi tegak, di atas rambut
        body.r(hx + 1, hy - 4, 16, 5, DUSK); body.hl(hx + 2, hx + 15, hy - 4, SLATE)
        body.hl(hx + 1, hx + 16, hy + 1, HR1); body.vl(hx + 16, hy - 3, hy, NAVY)
    for y in range(32):                                          # tempel badan yang berada di dalam lencana
        for x in range(32):
            if body.px[x, y][3] and _badge_mask(x, y): c.p(x, y, body.px[x, y])
    # alat peran di pojok kanan bawah (di bawah dagu, boleh sedikit keluar dari lencana)
    if role == 'polisi':                                         # buku catatan + pena: menerima laporan
        c.r(20, 23, 8, 8, WHITE); c.vl(27, 23, 30, MIST); c.hl(20, 27, 30, MIST)
        c.r(18, 26, 3, 4, p['skin']); c.r(28, 21, 2, 7, SKYD); c.p(28, 28, NAVY)
    elif role == 'jaksa':                                        # berkas tuntutan
        c.r(20, 23, 9, 8, SUN); c.r(21, 22, 7, 2, WHITE); c.vl(28, 23, 30, MANGO); c.hl(20, 28, 30, MANGO)
        c.r(18, 26, 3, 4, p['skin'])
    elif role == 'advokat':                                      # tas kerja: mendampingi
        c.r(22, 21, 5, 1, HR2); c.p(22, 22, HR2); c.p(26, 22, HR2)
        c.r(19, 23, 11, 7, HR2); c.hl(19, 29, 23, WOODD); c.r(23, 25, 3, 2, SUN); c.hl(19, 29, 29, HR1)
        c.r(17, 25, 3, 4, p['skin'])
    elif role == 'hakim':                                        # palu sidang
        c.r(19, 23, 11, 5, WOOD); c.hl(19, 29, 23, SUN); c.hl(19, 29, 27, WOODD); c.vl(22, 23, 27, WOODD); c.vl(26, 23, 27, WOODD)
        c.r(23, 28, 3, 3, WOOD); c.vl(25, 28, 30, WOODD)
        c.r(18, 28, 4, 3, p['skin'])
    c.outline(); return c


# ---------------------------------------------------------------------------
# D-11 Busur hari (F-04): matahari untuk adegan pagi sampai sore, bulan sabit untuk adegan malam.
# Penanda titik jam berjalan di bilah atas (Design System bagian 1 dan 7).
# ---------------------------------------------------------------------------
def ui_matahari():
    c = C(16, 16)
    disc = {4: (6, 9), 5: (5, 10), 6: (4, 11), 7: (4, 11), 8: (4, 11), 9: (4, 11), 10: (5, 10), 11: (6, 9)}
    for y, (x0, x1) in disc.items():
        c.hl(x0, x1, y, SUN)
    for y in disc:                                                                   # bayangan kanan bawah
        for x in range(4, 12):
            if c.px[x, y] == SUN and x + y >= 18: c.p(x, y, MANGO)
    c.p(6, 6, WHITE); c.p(7, 6, WHITE); c.p(6, 7, WHITE)                             # kilau
    for (x, y) in ((7, 1), (7, 13), (1, 7), (13, 7)):                                # sinar tegak dan mendatar
        c.r(x, y, 2, 2, SUN)
    for (x, y) in ((2, 2), (3, 3), (13, 2), (12, 3), (2, 13), (3, 12), (13, 13), (12, 12)):   # sinar miring
        c.p(x, y, SUN)
    c.outline(); return c


def ui_bulan():
    c = C(16, 16)
    crescent = ["................",
                "................",
                ".....##.........",
                "....###.........",
                "...###..........",
                "..####..........",
                "..####..........",
                "..####..........",
                "..####..........",
                "..#####.........",
                "..######........",
                "...######.......",
                "....#######.....",
                ".....#####......"]
    _mask(c, crescent, CREAM)
    for y, row in enumerate(crescent):                                               # cahaya hangat di lengkung dalam
        if "#" in row: c.p(row.rindex("#"), y, LAMPU)
    c.outline(); return c
