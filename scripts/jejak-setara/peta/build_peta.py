"""Bangun peta kampung Jejak Setara dari teks, periksa aturannya, lalu buat pratinjau.

Pemakaian (dari folder repositori):
    npx pnpm@11.25.0 peta:build
    python scripts/jejak-setara/peta/build_peta.py --periksa
    python scripts/jejak-setara/peta/build_peta.py --tanpa-pratinjau --keluar /tmp/peta

Sumber (ditulis tangan): kampung.txt (tanah, satu karakter per ubin) dan objek.json (zona, objek, pagar, sebar,
titik kejadian, kotak, halte, lobi, dan penanda). Hasil: app/jejak-setara/peta/kampung.json (bentuk JS-02, diperiksa
bacaPeta) dan app/jejak-setara/peta/kampung_gambar.json (nomor ubin untuk layar pemain), serta pratinjau di
docs/jejak-setara/preview/. Kit gambar (atas_ubin.py, atas_objek.py, build_jejak.py) dipakai tanpa diubah.
Nomor aturan P-x mengikuti docs/jejak-setara/specs/JS-06-peta.md.
"""
import argparse
import gzip
import hashlib
import heapq
import json
import math
import re
import sys
from collections import deque
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
sys.path.insert(0, str(REPO / "scripts" / "game" / "art"))
from PIL import Image, ImageDraw  # noqa: E402
import pixelart as PA  # noqa: E402
from atas_ubin import KOLOM, MASA, NAMA_MASA, NOMOR, SUSUNAN, lembar_ubin, nomor_tanah  # noqa: E402
from atas_objek import OBJEK, PAGAR, pisah  # noqa: E402
import build_jejak as BJ  # noqa: E402

LEBAR, TINGGI, UBIN = 160, 100, 16
SUMBER_TXT, SUMBER_JSON = HERE / "kampung.txt", HERE / "objek.json"
HASIL = REPO / "app" / "jejak-setara" / "peta"
PRATINJAU = REPO / "docs" / "jejak-setara" / "preview"
ASET = REPO / "app" / "jejak-setara" / "assets"
SIDIK = ["scripts/jejak-setara/peta/kampung.txt", "scripts/jejak-setara/peta/objek.json",
         "scripts/jejak-setara/peta/build_peta.py", "scripts/game/art/atas_ubin.py", "scripts/game/art/atas_objek.py"]
BATAS_GZIP = 60 * 1024
NAMA_ZONA = {"z1": "Rumah dan gang", "z2": "Sekolah", "z3": "Jalan dan halte", "z4": "Pasar", "z5": "Balai warga",
             "z6": "Taman, sungai, dan pantai", "z7": "Puskesmas dan kantor desa", "z8": "Pojok gawai"}
KOTAK_ZONA = {"z1": "kompas", "z2": "buku", "z3": "sepatu", "z4": "sepatu", "z5": "kompas", "z6": "sepatu",
              "z7": "buku", "z8": "buku"}
HALTE_ZONA = {"z3": 2, "z7": 1, "z8": 1}
KODE_BAHAN = {"rumput": 0, "tanah": 1, "paving": 2, "semen": 3, "pasir": 4, "aspal": 5, "air": 6, "air_dalam": 7}
AIR = ("air", "air_dalam")
# P-2: karakter -> (bahan lapisan 0, ubin tumpang tetap | "ACAK" | "LAPANGAN" | None)
LEGENDA = {".": ("rumput", "ACAK"), "*": ("rumput", "bunga_a"), "+": ("rumput", "bunga_b"),
           "^": ("rumput", "rumput_tinggi"), "d": ("rumput", "daun"), "g": ("rumput", "LAPANGAN"),
           "t": ("tanah", "ACAK"), "k": ("tanah", "kerikil"), "o": ("tanah", "genangan"), "p": ("paving", None),
           "s": ("semen", None), "c": ("semen", "LAPANGAN"), "a": ("aspal", "ACAK"),
           "-": ("aspal", "garis_tengah_datar"), "|": ("aspal", "garis_tengah_tegak"), "z": ("aspal", "zebra_datar"),
           "Z": ("aspal", "zebra_tegak"), "b": ("pasir", "ACAK"), "B": ("pasir", "batu"),
           "w": ("air", None), "W": ("air_dalam", None)}
RUMPUT_POLOS = set(".*+^d")
# P-24: detail acak berbenih (peluang per 1000 sel, pilihan)
DETAIL = {"rumput": (50, ["bunga_a", "bunga_b", "rumput_tinggi", "daun"]), "tanah": (60, ["kerikil", "genangan"]),
          "aspal": (20, ["retakan"]), "pasir": (30, ["batu"])}
# P-7: kelompok varian berukuran dan berkotak padat sama
VARIAN = {"pohon_acak": ["pohon", "pohon_b", "pohon_c"], "semak_acak": ["semak", "semak_b"],
          "tenda_acak": ["tenda_a", "tenda_b"], "rumah_kecil_acak": ["rumah_b", "rumah_d"]}
# P-10: benda kecil properti kejadian digambar bersama tokoh kejadian (JS-08), tidak ditaruh di peta
BENDA_KEJADIAN = {"kotak_bekal", "dompet", "bola", "tali_lompat", "sisa_piknik", "pengeras_suara", "kursi_roda"}
POLA_ID = re.compile(r"^[a-z0-9-]{1,32}$")
# P-21: rentang nomor ubin per lapisan, dari susunan lembar yang disetujui (kelompok U)
UBIN_TANAH = {i for i, (j, _) in enumerate(SUSUNAN) if j in ("rumput", "varian2", "wilayah")}
UBIN_BAYANGAN = {NOMOR[k] for k in SUSUNAN if k[0] == "tumpang" and k[1].startswith("bayangan")}
UBIN_TUMPANG = {NOMOR[k] for k in SUSUNAN if k[0] == "tumpang"} - UBIN_BAYANGAN
assert UBIN_TANAH == set(range(0, 4)) | set(range(40, 47)) | set(range(48, 377)), "susunan lembar berubah"
assert UBIN_TUMPANG == set(range(4, 12)) | set(range(22, 40)) and UBIN_BAYANGAN == set(range(12, 22))


# --------------------------------------------------------------------------- acak berbenih (sama dengan inti/acak.ts)
def _i32(v):
    v &= 0xFFFFFFFF
    return v - (1 << 32) if v & 0x80000000 else v


def benih(*bagian):
    """FNV-1a 32 bit atas kode unit UTF-16 dari bagian yang disambung ';' (inti/acak.ts, P-1 JS-02)."""
    data = ";".join(str(b) for b in bagian).encode("utf-16-le")
    h = 2166136261
    for i in range(0, len(data), 2):
        h ^= data[i] | (data[i + 1] << 8)
        h = (h * 16777619) & 0xFFFFFFFF
    h ^= h >> 13
    return h & 0xFFFFFFFF


def acak_berbenih(b):
    """mulberry32 (inti/acak.ts, P-2 JS-02): setiap panggilan mengembalikan 0 <= x < 1."""
    a = _i32(b)

    def berikut():
        nonlocal a
        a = _i32(a + 0x6D2B79F5)
        t = _i32(((a ^ ((a & 0xFFFFFFFF) >> 15)) & 0xFFFFFFFF) * ((a | 1) & 0xFFFFFFFF))
        u = _i32(((t ^ ((t & 0xFFFFFFFF) >> 7)) & 0xFFFFFFFF) * ((t | 61) & 0xFFFFFFFF))
        t = _i32(t ^ _i32(t + u))
        return ((t ^ ((t & 0xFFFFFFFF) >> 14)) & 0xFFFFFFFF) / 4294967296
    return berikut


def _uji_acak():
    """Angka uji acak.test.ts; skrip berhenti bila pemindahan ke Python tidak sama persis."""
    assert benih("") == 2165871905 and benih("ruang-1", "p-01", "K-13") == 2994746477
    assert benih(12345, "K-01") == 819361737 and benih("a", "b") == 851547125
    r = acak_berbenih(1)
    assert [r(), r(), r()] == [0.6270739405881613, 0.002735721180215478, 0.5274470399599522]


# --------------------------------------------------------------------------- alat bantu
def ukuran(jenis):
    return OBJEK[VARIAN[jenis][0] if jenis in VARIAN else jenis][1]


def pilih_varian(jenis, x, y, benih_peta):
    if jenis not in VARIAN:
        return jenis
    p = VARIAN[jenis]
    return p[int(acak_berbenih(benih("varian", benih_peta, x, y))() * len(p))]


def sel_padat(jenis, x, y):
    for dx, dy, l, t in OBJEK[jenis][3]:
        for yy in range(y + dy, y + dy + t):
            for xx in range(x + dx, x + dx + l):
                yield xx, yy


def rle(nilai):
    keluar, i, n = [], 0, len(nilai)
    while i < n:
        j = i
        while j < n and nilai[j] == nilai[i]:
            j += 1
        keluar.append(f"{nilai[i]}x{j - i};")
        i = j
    return "".join(keluar)


def teks_json(data):
    """JSON UTF-8 berakhir LF; setiap unsur larik objek di satu baris (P-18)."""
    baris, kunci = ["{"], list(data)
    for i, k in enumerate(kunci):
        v, koma = data[k], ("," if i < len(kunci) - 1 else "")
        if isinstance(v, list) and v and isinstance(v[0], dict):
            baris.append(f'  "{k}": [')
            baris += ["    " + json.dumps(e, ensure_ascii=False) + ("," if n < len(v) - 1 else "") for n, e in enumerate(v)]
            baris.append("  ]" + koma)
        else:
            baris.append(f'  "{k}": ' + json.dumps(v, ensure_ascii=False, separators=(",", ":")) + koma)
    baris.append("}")
    return ("\n".join(baris) + "\n").encode("utf-8")


def sidik_sumber():
    """P-23: SHA-256 atas jalur + LF + isi (CRLF menjadi LF) + LF untuk kelima berkas, berurutan."""
    h = hashlib.sha256()
    for jalur in SIDIK:
        h.update((jalur + "\n").encode("utf-8"))
        h.update((REPO / jalur).read_bytes().replace(b"\r\n", b"\n"))
        h.update(b"\n")
    return h.hexdigest()


def angka(v, d=1):
    return f"{v:.{d}f}".replace(".", ",")


def bulat(v):
    return isinstance(v, int) and not isinstance(v, bool)


class Peta:
    """Hasil bangun beserta daftar masalah (galat) dan peringatan; setiap butir: (teks, [sel])."""

    def __init__(self):
        self.masalah, self.peringatan, self.objek = [], [], []

    def galat(self, teks, sel=()):
        self.masalah.append((teks, list(sel)))

    def peringat(self, teks, sel=()):
        self.peringatan.append((teks, list(sel)))


# --------------------------------------------------------------------------- membaca sumber (P-1 sampai P-14)
def baca_txt(P):
    try:
        teks = SUMBER_TXT.read_bytes().decode("ascii")
    except UnicodeDecodeError as e:
        P.galat(f"kampung.txt: karakter bukan ASCII di byte {e.start}")
        return None
    baris = teks.replace("\r", "").split("\n")
    while baris and baris[-1] == "":
        baris.pop()
    if len(baris) != TINGGI:
        P.galat(f"kampung.txt: {len(baris)} baris, seharusnya {TINGGI}")
        return None
    for y, b in enumerate(baris):
        if len(b) != LEBAR:
            P.galat(f"kampung.txt baris {y + 1}: {len(b)} karakter, seharusnya {LEBAR}")
        for x, ch in enumerate(b):
            if ch not in LEGENDA:
                P.galat(f"kampung.txt baris {y + 1} kolom {x + 1}: karakter '{ch}' tidak ada di legenda", [(x, y)])
    return None if P.masalah else baris


def _kotak(b, apa, P):
    if not isinstance(b, dict) or set(b) != {"kiri", "atas", "kanan", "bawah"} or not all(bulat(v) for v in b.values()):
        P.galat(f"objek.json {apa}: harus berisi kiri, atas, kanan, bawah berupa bilangan bulat")
        return False
    if not (0 <= b["kiri"] <= b["kanan"] < LEBAR and 0 <= b["atas"] <= b["bawah"] < TINGGI):
        P.galat(f"objek.json {apa}: batas terbalik atau di luar peta")
        return False
    return True


def _titik(e, kunci, apa, P):
    if not isinstance(e, dict) or set(e) != kunci or not bulat(e.get("x")) or not bulat(e.get("y")):
        P.galat(f"objek.json {apa}: kunci harus tepat {sorted(kunci)} dengan x dan y bilangan bulat")
        return False
    if not (0 <= e["x"] < LEBAR and 0 <= e["y"] < TINGGI):
        P.galat(f"objek.json {apa} ({e['x']}, {e['y']}): di luar peta")
        return False
    return True


def _jenis_sah(jenis, apa, P):
    if jenis not in OBJEK and jenis not in VARIAN:
        P.galat(f"objek.json {apa}: jenis '{jenis}' tidak dikenal")
        return False
    if jenis in BENDA_KEJADIAN:
        P.galat(f"objek.json {apa}: '{jenis}' adalah benda kejadian dan tidak ditaruh di peta (P-10)")
        return False
    return True


def baca_json(P):
    try:
        d = json.loads(SUMBER_JSON.read_text(encoding="utf-8"))
    except (ValueError, OSError) as e:
        P.galat(f"objek.json tidak bisa dibaca: {e}")
        return None
    kunci = {"versi", "benih", "zona", "lobi", "gerbangLobi", "titikMuncul", "objek", "pagar", "sebar",
             "titikKejadian", "kotak", "halte", "penanda"}
    if not isinstance(d, dict) or set(d) != kunci:
        P.galat(f"objek.json: kunci harus tepat {sorted(kunci)}")
        return None
    if d["versi"] != 1 or not bulat(d["benih"]):
        P.galat("objek.json: versi harus 1 dan benih bilangan bulat")
    for nama in ("zona", "titikMuncul", "objek", "pagar", "sebar", "titikKejadian", "kotak", "halte"):
        if not isinstance(d[nama], list):
            P.galat(f"objek.json {nama}: harus berupa larik")
            return None
    ids = set()
    for z in d["zona"]:
        if not isinstance(z, dict) or set(z) != {"id", "nama", "kiri", "atas", "kanan", "bawah"}:
            P.galat("objek.json zona: kunci harus id, nama, kiri, atas, kanan, bawah")
            continue
        _kotak({k: z[k] for k in ("kiri", "atas", "kanan", "bawah")}, f"zona {z['id']}", P)
        if z["id"] not in NAMA_ZONA or z["id"] in ids or z["nama"] != NAMA_ZONA.get(z["id"]):
            P.galat(f"objek.json zona {z['id']}: id harus z1-z8 tanpa ganda dengan nama PRD bagian 9")
        ids.add(z["id"])
    if ids != set(NAMA_ZONA):
        P.galat("objek.json zona: harus memuat z1 sampai z8")
    _kotak(d["lobi"], "lobi", P)
    _kotak(d["gerbangLobi"], "gerbangLobi", P)
    for i, t in enumerate(d["titikMuncul"]):
        _titik(t, {"x", "y"}, f"titikMuncul[{i}]", P)
    for i, o in enumerate(d["objek"]):
        if not isinstance(o, dict) or not {"jenis", "x", "y"} <= set(o) <= {"jenis", "x", "y", "id"}:
            P.galat(f"objek.json objek[{i}]: kunci harus jenis, x, y, dan id opsional")
            continue
        _titik({"x": o["x"], "y": o["y"]}, {"x", "y"}, f"objek[{i}]", P)
        _jenis_sah(o["jenis"], f"objek[{i}]", P)
        if "id" in o and not (isinstance(o["id"], str) and POLA_ID.match(o["id"])):
            P.galat(f"objek.json objek[{i}]: id '{o.get('id')}' tidak memenuhi pola {POLA_ID.pattern}")
    for i, g in enumerate(d["pagar"]):
        ok = isinstance(g, dict) and set(g) == {"gaya", "titik"} and g["gaya"] in ("bambu", "sekolah")
        ok = ok and isinstance(g["titik"], list) and len(g["titik"]) >= 2 and all(
            isinstance(p, list) and len(p) == 2 and bulat(p[0]) and bulat(p[1]) for p in g["titik"])
        if not ok:
            P.galat(f"objek.json pagar[{i}]: harus berisi gaya bambu atau sekolah dan sedikitnya dua titik [x, y]")
    for i, s in enumerate(d["sebar"]):
        if not isinstance(s, dict) or set(s) != {"jenis", "kiri", "atas", "kanan", "bawah", "jumlah"}:
            P.galat(f"objek.json sebar[{i}]: kunci harus jenis, kiri, atas, kanan, bawah, jumlah")
            continue
        _kotak({k: s[k] for k in ("kiri", "atas", "kanan", "bawah")}, f"sebar[{i}]", P)
        if not (isinstance(s["jenis"], list) and s["jenis"] and bulat(s["jumlah"]) and s["jumlah"] >= 1):
            P.galat(f"objek.json sebar[{i}]: jenis harus larik berisi dan jumlah >= 1")
            continue
        for j in s["jenis"]:
            if _jenis_sah(j, f"sebar[{i}]", P) and (s["kanan"] - s["kiri"] + 1 < ukuran(j)[0] or
                                                   s["bawah"] - s["atas"] + 1 < ukuran(j)[1]):
                P.galat(f"objek.json sebar[{i}]: wilayah lebih kecil dari {j}")
    for nama, kunci_t in (("titikKejadian", {"id", "zona", "x", "y"}), ("kotak", {"id", "jenis", "zona", "x", "y"}),
                          ("halte", {"id", "zona", "x", "y"})):
        for i, t in enumerate(d[nama]):
            if _titik(t, kunci_t, f"{nama}[{i}]", P) and t["zona"] not in NAMA_ZONA:
                P.galat(f"objek.json {nama} {t['id']}: zona {t['zona']} tidak ada")
    if not isinstance(d["penanda"], dict) or set(d["penanda"]) != set(NAMA_ZONA):
        P.galat("objek.json penanda: harus memuat z1 sampai z8")
    else:
        for z, daftar in d["penanda"].items():
            for p in daftar if isinstance(daftar, list) else [None]:
                if not isinstance(p, str) or not any(j == p or (p.endswith("*") and j.startswith(p[:-1])) for j in OBJEK):
                    P.galat(f"objek.json penanda {z}: '{p}' tidak cocok dengan objek mana pun")
    return None if P.masalah else d


# --------------------------------------------------------------------------- membangun
def bangun():
    P = Peta()
    _uji_acak()
    baris = baca_txt(P)
    d = baca_json(P)
    if baris is None or d is None:
        return P
    W, H, bp = LEBAR, TINGGI, d["benih"]
    P.sumber, P.baris = d, baris
    G = [list(b) for b in baris]
    BAHAN = [[LEGENDA[ch][0] for ch in b] for b in G]
    P.bahan = BAHAN

    def bahan_di(x, y):
        return BAHAN[y][x] if 0 <= x < W and 0 <= y < H else None

    # P-3: tanah setapak dan pasir hanya bersebelahan dengan bahan sama, rumput, atau air
    salah = [(x, y) for y in range(H) for x in range(W) if BAHAN[y][x] in ("tanah", "pasir") and any(
        bahan_di(x + a, y + b) not in (None, BAHAN[y][x], "rumput", *AIR) for a in (-1, 0, 1) for b in (-1, 0, 1))]
    if salah:
        P.galat(f"bahan bertetangga: {len(salah)} sel tanah setapak atau pasir bersebelahan dengan bahan lain, "
                f"misalnya {salah[0]} (P-3)", salah)

    # zona menutup seluruh peta tanpa tumpang tindih
    ZONA = {z["id"]: z for z in d["zona"]}
    hitung = [[0] * W for _ in range(H)]
    for z in d["zona"]:
        for y in range(z["atas"], z["bawah"] + 1):
            for x in range(z["kiri"], z["kanan"] + 1):
                hitung[y][x] += 1
    bolong = [(x, y) for y in range(H) for x in range(W) if hitung[y][x] != 1]
    if bolong:
        P.galat(f"zona: {len(bolong)} sel tidak tertutup tepat satu zona, misalnya {bolong[0]}", bolong)

    def zona_di(x, y):
        return next((i for i, z in ZONA.items() if z["kiri"] <= x <= z["kanan"] and z["atas"] <= y <= z["bawah"]), None)
    P.zona_di = zona_di

    # objek tertulis (P-7, P-8)
    daftar = []
    for o in d["objek"]:
        j = pilih_varian(o["jenis"], o["x"], o["y"], bp)
        daftar.append({"id": o.get("id") or f"o-{o['x']}-{o['y']}", "jenis": j, "x": o["x"], "y": o["y"], "asal": "objek"})
    # pagar (P-11)
    pagar = {}
    for i, g in enumerate(d["pagar"]):
        titik = g["titik"]
        for (x0, y0), (x1, y1) in zip(titik, titik[1:]):
            if (x0 != x1 and y0 != y1) or (x0 == x1 and y0 == y1):
                P.galat(f"pagar[{i}]: ruas ({x0}, {y0}) ke ({x1}, {y1}) harus mendatar atau tegak", [(x0, y0)])
                continue
            for k in range(max(abs(x1 - x0), abs(y1 - y0)) + 1):
                x = x0 + k * ((x1 > x0) - (x1 < x0))
                y = y0 + k * ((y1 > y0) - (y1 < y0))
                if not (0 <= x < W and 0 <= y < H):
                    P.galat(f"pagar[{i}]: ({x}, {y}) di luar peta")
                elif pagar.get((x, y), g["gaya"]) != g["gaya"]:
                    P.galat(f"pagar ({x}, {y}): dua gaya pagar di sel yang sama", [(x, y)])
                else:
                    pagar[(x, y)] = g["gaya"]
    for (x, y), gaya in sorted(pagar.items(), key=lambda t: (t[0][1], t[0][0])):
        arah = "".join(a for a, dx, dy in (("w", -1, 0), ("e", 1, 0), ("n", 0, -1), ("s", 0, 1))
                       if pagar.get((x + dx, y + dy)) == gaya)
        ruas = next((r for r, s in PAGAR.items() if set(s) == set(arah)), None)
        if ruas is None:
            P.galat(f"pagar {gaya} ({x}, {y}): sambungan '{arah or 'tanpa sambungan'}' tidak punya ruas "
                    f"(bercabang, bersilang, atau ujung tegak; P-11)", [(x, y)])
            continue
        daftar.append({"id": f"o-{x}-{y}", "jenis": f"pagar_{'bambu' if gaya == 'bambu' else 'sekolah'}_{ruas}",
                       "x": x, "y": y, "asal": "pagar"})

    OCC = [[None] * W for _ in range(H)]
    PADAT = [[False] * W for _ in range(H)]
    JEMBATAN = [[False] * W for _ in range(H)]

    def daftarkan(o):
        w, h = OBJEK[o["jenis"]][1]
        if o["x"] + w > W or o["y"] + h > H:
            P.galat(f"objek {o['id']} ({o['jenis']}): jejak kaki keluar dari peta", [(o["x"], o["y"])])
            return False
        for yy in range(o["y"], o["y"] + h):
            for xx in range(o["x"], o["x"] + w):
                if OCC[yy][xx] is not None:
                    P.galat(f"objek {o['id']} ({o['jenis']}) tumpang tindih dengan {daftar[OCC[yy][xx]]['id']} "
                            f"di ({xx}, {yy}) (P-8)", [(xx, yy)])
                    return False
        idx = daftar.index(o)
        for yy in range(o["y"], o["y"] + h):
            for xx in range(o["x"], o["x"] + w):
                OCC[yy][xx] = idx
                if OBJEK[o["jenis"]][5]:
                    JEMBATAN[yy][xx] = True
        for xx, yy in sel_padat(o["jenis"], o["x"], o["y"]):
            PADAT[yy][xx] = True
        return True

    for o in list(daftar):
        daftarkan(o)

    # titik (P-13), dipakai juga untuk wilayah larangan sebar
    TITIK = [(t["id"], t["zona"], t["x"], t["y"]) for t in d["titikKejadian"]]
    KOTAK = [(t["id"], t["jenis"], t["zona"], t["x"], t["y"]) for t in d["kotak"]]
    HALTE = [(t["id"], t["zona"], t["x"], t["y"]) for t in d["halte"]]
    LOBI, GERBANG = d["lobi"], d["gerbangLobi"]

    def dalam(x, y, b):
        return b["kiri"] <= x <= b["kanan"] and b["atas"] <= y <= b["bawah"]

    larang = set()
    for x0, y0 in [(t[2], t[3]) for t in TITIK] + [(k[3], k[4]) for k in KOTAK] + [(h[2], h[3]) for h in HALTE]:
        larang |= {(x0 + a, y0 + b) for a in (-1, 0, 1) for b in (-1, 0, 1)}

    def air_di(x, y):
        return BAHAN[y][x] in AIR and not JEMBATAN[y][x]

    # sebar (P-12): ubin padat baru tidak boleh punya ubin padat lain (objek atau air) dalam jarak 2
    for i, s in enumerate(d["sebar"]):
        r = acak_berbenih(benih("sebar", bp, i))
        ditaruh = coba = 0
        while ditaruh < s["jumlah"] and coba < 80 * s["jumlah"]:
            coba += 1
            j0 = s["jenis"][int(r() * len(s["jenis"]))]
            w, h = ukuran(j0)
            x = s["kiri"] + int(r() * (s["kanan"] - s["kiri"] - w + 2))
            y = s["atas"] + int(r() * (s["bawah"] - s["atas"] - h + 2))
            if x + w > W or y + h > H:
                continue
            j = pilih_varian(j0, x, y, bp)
            if any(G[yy][xx] not in RUMPUT_POLOS or OCC[yy][xx] is not None or (xx, yy) in larang or dalam(xx, yy, LOBI)
                   for yy in range(y, y + h) for xx in range(x, x + w)):
                continue
            padat = list(sel_padat(j, x, y))
            if any(0 <= nx < W and 0 <= ny < H and (nx, ny) not in padat and (PADAT[ny][nx] or air_di(nx, ny))
                   for xx, yy in padat for ny in range(yy - 2, yy + 3) for nx in range(xx - 2, xx + 3)):
                continue
            o = {"id": f"o-{x}-{y}", "jenis": j, "x": x, "y": y, "asal": "sebar"}
            daftar.append(o)
            if daftarkan(o):
                ditaruh += 1
        if ditaruh < s["jumlah"]:
            P.peringat(f"sebar[{i}]: {ditaruh} dari {s['jumlah']} objek tertaruh di wilayah "
                       f"({s['kiri']}, {s['atas']})-({s['kanan']}, {s['bawah']})")

    # id unik dan sprite Disetujui ada
    kredit = (ASET / "CREDITS.md").read_text(encoding="utf-8")
    seen = set()
    for o in daftar:
        if o["id"] in seen:
            P.galat(f"objek: id {o['id']} ganda", [(o["x"], o["y"])])
        seen.add(o["id"])
        if not (ASET / "obj" / f"obj_{o['jenis']}.png").exists() or f"`obj/obj_{o['jenis']}.png`" not in kredit:
            P.galat(f"objek {o['id']}: sprite obj_{o['jenis']}.png tidak ada atau belum Disetujui")

    # P-9: air dan jembatan
    for o in daftar:
        if OBJEK[o["jenis"]][5]:
            w, h = OBJEK[o["jenis"]][1]
            if not any(BAHAN[yy][xx] in AIR for yy in range(o["y"], o["y"] + h) for xx in range(o["x"], o["x"] + w)):
                P.galat(f"jembatan {o['id']} tidak menutup air (P-9)", [(o["x"], o["y"])])
        else:
            basah = [(xx, yy) for xx, yy in sel_padat(o["jenis"], o["x"], o["y"]) if BAHAN[yy][xx] in AIR]
            if basah:
                P.galat(f"objek {o['id']} ({o['jenis']}) berdiri di air (P-9)", basah)

    TAB = [[1 if PADAT[y][x] or air_di(x, y) else 0 for x in range(W)] for y in range(H)]
    daftar.sort(key=lambda o: (o["y"], o["x"], o["id"]))
    P.objek, P.tab, P.occ = daftar, TAB, OCC
    for i, o in enumerate(daftar):
        w, h = OBJEK[o["jenis"]][1]
        for yy in range(o["y"], o["y"] + h):
            for xx in range(o["x"], o["x"] + w):
                OCC[yy][xx] = i

    # lapisan gambar
    TANAH = [[nomor_tanah(bahan_di, x, y) for x in range(W)] for y in range(H)]
    TUMP = [[None] * W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            t = LEGENDA[G[y][x]][1]
            if t and t not in ("ACAK", "LAPANGAN"):
                TUMP[y][x] = t
    seen = set()
    for ch in "gc":                                           # P-4: lapangan
        for y0 in range(H):
            for x0 in range(W):
                if G[y0][x0] != ch or (x0, y0) in seen:
                    continue
                komp, dq = [], deque([(x0, y0)])
                seen.add((x0, y0))
                while dq:
                    cx, cy = dq.popleft()
                    komp.append((cx, cy))
                    for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                        if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and G[ny][nx] == ch:
                            seen.add((nx, ny))
                            dq.append((nx, ny))
                xa, xb = min(p[0] for p in komp), max(p[0] for p in komp)
                ya, yb = min(p[1] for p in komp), max(p[1] for p in komp)
                lw, lh = xb - xa + 1, yb - ya + 1
                if len(komp) != lw * lh or lw % 2 == 0 or lw < 5 or lh < 3:
                    P.galat(f"lapangan '{ch}' di ({xa}, {ya}): harus persegi panjang penuh, lebar ganjil >= 5, "
                            f"tinggi >= 3 (sekarang {lw} x {lh}, {len(komp)} sel; P-4)", komp)
                    continue
                tengah = (xa + xb) // 2
                for cx, cy in komp:
                    sisi = ("n" if cy == ya else "s" if cy == yb else "") + ("w" if cx == xa else "e" if cx == xb else "")
                    TUMP[cy][cx] = (f"lapangan_{sisi}_tegak" if sisi in ("n", "s") and cx == tengah else
                                    f"lapangan_{sisi}" if sisi else "lapangan_tengah_tegak" if cx == tengah else None)
    for y in range(H):                                        # P-24: detail acak berbenih
        for x in range(W):
            if LEGENDA[G[y][x]][1] == "ACAK" and OCC[y][x] is None and BAHAN[y][x] in DETAIL:
                v = benih("detail", bp, x, y)
                peluang, pilihan = DETAIL[BAHAN[y][x]]
                if v % 1000 < peluang:
                    TUMP[y][x] = pilihan[(v // 1000) % len(pilihan)]
    BAY = [[None] * W for _ in range(H)]                      # P-22: bayangan, objek lebih dulu menang
    for o in daftar:
        x0, y0, (w, h), jenis = o["x"], o["y"], OBJEK[o["jenis"]][1], OBJEK[o["jenis"]][4]
        if jenis == "kotak":
            tempat = BJ._bayangan_bangunan(x0, y0, w, h)
        elif jenis == "kecil":
            tempat = {(x0 + w // 2, y0 + h - 1): "bayangan_kecil"}
        elif jenis == "pohon":
            tempat = {(x0 + 1, y0 + 1): "bayangan_pohon_kiri_atas", (x0 + 2, y0 + 1): "bayangan_pohon_kanan_atas",
                      (x0 + 1, y0 + 2): "bayangan_pohon_kiri_bawah", (x0 + 2, y0 + 2): "bayangan_pohon_kanan_bawah"}
        else:
            tempat = {}
        for (x, y), n in tempat.items():
            if 0 <= x < W and 0 <= y < H and BAY[y][x] is None and BAHAN[y][x] not in AIR:
                BAY[y][x] = n

    def nomor(n):
        return NOMOR[("tumpang", n)] if n else None
    TUMP_N = [[nomor(v) for v in r] for r in TUMP]
    BAY_N = [[nomor(v) for v in r] for r in BAY]
    assert {v for r in TANAH for v in r} <= UBIN_TANAH
    assert {v for r in TUMP_N for v in r if v is not None} <= UBIN_TUMPANG
    assert {v for r in BAY_N for v in r if v is not None} <= UBIN_BAYANGAN
    pakai = sorted({v for lap in (TANAH, TUMP_N, BAY_N) for r in lap for v in r if v is not None})
    daftar_ubin = [None] + pakai
    if len(daftar_ubin) > 256:
        P.galat(f"daftar ubin berisi {len(daftar_ubin)} nomor, paling banyak 256 (P-21)")
        return P
    idx = {n: i for i, n in enumerate(daftar_ubin) if n is not None}
    P.tanah, P.tumpang, P.bayangan = TANAH, TUMP_N, BAY_N

    peta = {"versi": 1, "lebar": W, "tinggi": H, "ukuranUbin": UBIN,
            "ubin": rle([KODE_BAHAN[BAHAN[y][x]] for y in range(H) for x in range(W)]),
            "tabrakan": rle([TAB[y][x] for y in range(H) for x in range(W)]),
            "objek": [{"id": o["id"], "jenis": o["jenis"], "x": o["x"], "y": o["y"]} for o in daftar],
            "zona": [{"id": i, "nama": ZONA[i]["nama"], "kiri": ZONA[i]["kiri"], "atas": ZONA[i]["atas"],
                      "kanan": ZONA[i]["kanan"], "bawah": ZONA[i]["bawah"]} for i in sorted(ZONA)],
            "titikKejadian": [{"id": i, "zona": z, "x": x, "y": y} for i, z, x, y in sorted(TITIK)],
            "kotak": [{"id": i, "jenis": j, "zona": z, "x": x, "y": y} for i, j, z, x, y in sorted(KOTAK)],
            "halte": [{"id": i, "zona": z, "x": x, "y": y} for i, z, x, y in sorted(HALTE)],
            "gerbangLobi": dict(GERBANG), "titikMuncul": [{"x": t["x"], "y": t["y"]} for t in d["titikMuncul"]]}
    gambar = {"versi": 1, "lebar": W, "tinggi": H, "kolom": KOLOM, "jumlahUbin": len(SUSUNAN), "sumber": sidik_sumber(),
              "daftar": daftar_ubin,
              "tanah": rle([idx[TANAH[y][x]] for y in range(H) for x in range(W)]),
              "tumpang": rle([idx[TUMP_N[y][x]] if TUMP_N[y][x] is not None else 0 for y in range(H) for x in range(W)]),
              "bayangan": rle([idx[BAY_N[y][x]] if BAY_N[y][x] is not None else 0 for y in range(H) for x in range(W)])}
    P.teks_peta, P.teks_gambar = teks_json(peta), teks_json(gambar)
    P.titik, P.kotak, P.halte, P.lobi, P.gerbang, P.muncul = TITIK, KOTAK, HALTE, LOBI, GERBANG, d["titikMuncul"]
    periksa(P)
    return P


# --------------------------------------------------------------------------- pemeriksaan (P-25, P-26)
def periksa(P):
    W, H, TAB, OCC, BAHAN, d = LEBAR, TINGGI, P.tab, P.occ, P.bahan, P.sumber

    def bebas(x, y):
        return 0 <= x < W and 0 <= y < H and not TAB[y][x]

    def dalam(x, y, b):
        return b["kiri"] <= x <= b["kanan"] and b["atas"] <= y <= b["bawah"]

    def bfs(mulai, tutup=frozenset()):
        R = [[False] * W for _ in range(H)]
        dq = deque()
        for x, y in mulai:
            if bebas(x, y) and (x, y) not in tutup and not R[y][x]:
                R[y][x] = True
                dq.append((x, y))
        while dq:
            x, y = dq.popleft()
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if bebas(nx, ny) and not R[ny][nx] and (nx, ny) not in tutup:
                    R[ny][nx] = True
                    dq.append((nx, ny))
        return R

    muncul = [(t["x"], t["y"]) for t in P.muncul]
    gb = P.gerbang
    sel_gerbang = {(x, y) for y in range(gb["atas"], gb["bawah"] + 1) for x in range(gb["kiri"], gb["kanan"] + 1)}
    R = bfs(muncul)
    P.terjangkau = R
    semua = [(t[0], t[2], t[3]) for t in P.titik] + [(k[0], k[3], k[4]) for k in P.kotak] + [(h[0], h[2], h[3]) for h in P.halte]

    tepi = [(x, y) for x in range(W) for y in (0, H - 1)] + [(x, y) for y in range(H) for x in (0, W - 1)]
    tepi = [p for p in tepi if bebas(*p)]
    if tepi:
        P.galat(f"tepi peta: {len(tepi)} sel tidak padat, misalnya {tepi[0]}", tepi)
    for i, x, y in semua:
        if not (0 <= x < W and 0 <= y < H) or not R[y][x]:
            P.galat(f"{i} ({x}, {y}) tidak terjangkau dari titik muncul", [(x, y)])

    # lobi (galat 5)
    if len(muncul) != 18 or len(set(muncul)) != len(muncul):
        P.galat(f"titik muncul: {len(muncul)} titik dengan {len(muncul) - len(set(muncul))} ganda, seharusnya 18 tanpa ganda")
    for x, y in muncul:
        if not bebas(x, y) or not dalam(x, y, P.lobi):
            P.galat(f"titik muncul ({x}, {y}) tidak di sel bebas di dalam halaman lobi", [(x, y)])
    gerbang = next((o for o in P.objek if o["id"] == "gerbang-lobi"), None)
    if gerbang is None or gerbang["jenis"] != "gerbang_buka":
        P.galat("objek gerbang-lobi berjenis gerbang_buka tidak ada (P-8)")
    else:
        gw, gh = OBJEK["gerbang_buka"][1]
        if any(not bebas(x, y) or y != gerbang["y"] + gh - 1 or not gerbang["x"] <= x < gerbang["x"] + gw
               for x, y in sel_gerbang):
            P.galat("gerbangLobi harus sel bebas di baris bawah objek gerbang-lobi", sel_gerbang)
    RL = bfs(muncul, frozenset(sel_gerbang))
    keluar = [(x, y) for y in range(H) for x in range(W) if RL[y][x] and not dalam(x, y, P.lobi)]
    if keluar:
        P.galat(f"lobi tidak tertutup: dengan gerbang ditutup, {len(keluar)} sel di luar lobi terjangkau", keluar[:200])
    for i, x, y in semua:
        if RL[y][x]:
            P.galat(f"{i} ({x}, {y}) terjangkau dari lobi saat gerbang ditutup", [(x, y)])
    P.sel_lobi = sum(map(sum, RL))

    # titik kejadian (galat 6)
    gx, gy = (gb["kiri"] + gb["kanan"]) / 2, (gb["atas"] + gb["bawah"]) / 2
    per_zona = {}
    for i, z, x, y in P.titik:
        per_zona[z] = per_zona.get(z, 0) + 1
        alasan = []
        if not re.match(rf"^t-{z}-\d{{2}}$", i):
            alasan.append(f"id harus t-{z}-nn")
        if P.zona_di(x, y) != z:
            alasan.append(f"berada di zona {P.zona_di(x, y)}")
        if dalam(x, y, P.lobi):
            alasan.append("di halaman lobi")
        if math.hypot(x - gx, y - gy) < 7:
            alasan.append("kurang dari 7 ubin dari tengah gerbang")
        for a in (-1, 0, 1):
            for b in (-1, 0, 1):
                xx, yy = x + a, y + b
                if not bebas(xx, yy):
                    alasan.append(f"ruang 3 x 3 padat di ({xx}, {yy})")
                elif OCC[yy][xx] is not None:
                    alasan.append(f"ruang 3 x 3 terhalang objek {P.objek[OCC[yy][xx]]['id']}")
                elif BAHAN[yy][xx] in ("aspal", "air", "air_dalam"):
                    alasan.append(f"ruang 3 x 3 berisi {BAHAN[yy][xx]} di ({xx}, {yy})")
        if alasan:
            P.galat(f"titik {i} ({x}, {y}): " + "; ".join(dict.fromkeys(alasan)), [(x, y)])
    for z in NAMA_ZONA:
        if per_zona.get(z, 0) < 12:
            P.galat(f"zona {z}: {per_zona.get(z, 0)} titik kejadian, sedikitnya 12")
    for n, (i, _, x, y) in enumerate(P.titik):
        for j, _, x2, y2 in P.titik[n + 1:]:
            if math.hypot(x - x2, y - y2) < 6:
                P.galat(f"titik {i} dan {j} berjarak {angka(math.hypot(x - x2, y - y2))} ubin, sedikitnya 6", [(x, y), (x2, y2)])

    # kotak (galat 7)
    per_zona = {}
    for n, (i, j, z, x, y) in enumerate(P.kotak):
        per_zona[z] = per_zona.get(z, 0) + 1
        alasan = []
        if not re.match(rf"^k-{z}-\d+$", i):
            alasan.append(f"id harus k-{z}-n")
        if j != KOTAK_ZONA[z]:
            alasan.append(f"jenis {j}, seharusnya {KOTAK_ZONA[z]} di {z}")
        if P.zona_di(x, y) != z:
            alasan.append(f"berada di zona {P.zona_di(x, y)}")
        if not bebas(x, y) or OCC[y][x] is not None or BAHAN[y][x] in ("aspal", "air", "air_dalam"):
            alasan.append("sel padat, tertutup objek, aspal, atau air")
        if dalam(x, y, P.lobi):
            alasan.append("di halaman lobi")
        if any(math.hypot(x - tx, y - ty) < 3 for _, _, tx, ty in P.titik):
            alasan.append("kurang dari 3 ubin dari titik kejadian")
        if any(math.hypot(x - kx, y - ky) < 6 for _, _, _, kx, ky in P.kotak[n + 1:]):
            alasan.append("kurang dari 6 ubin dari kotak lain")
        if alasan:
            P.galat(f"kotak {i} ({x}, {y}): " + "; ".join(alasan), [(x, y)])
    for z in NAMA_ZONA:
        if per_zona.get(z, 0) != 3:
            P.galat(f"zona {z}: {per_zona.get(z, 0)} kotak, seharusnya 3")

    # halte (galat 8)
    rumah_halte = [o for o in P.objek if o["jenis"] == "halte"]
    per_zona = {}
    for i, z, x, y in P.halte:
        per_zona[z] = per_zona.get(z, 0) + 1
        dekat = min((max(max(o["x"] - x, 0, x - (o["x"] + 2)), max(o["y"] - y, 0, y - (o["y"] + 1)))
                     for o in rumah_halte), default=99)
        if not re.match(r"^halte-\d+$", i) or P.zona_di(x, y) != z or not bebas(x, y) or dekat > 2:
            P.galat(f"halte {i} ({x}, {y}): id halte-n, zona cocok, sel bebas, dan paling jauh 2 ubin dari bangunan halte",
                    [(x, y)])
    if per_zona != HALTE_ZONA:
        P.galat(f"halte per zona {per_zona}, seharusnya {HALTE_ZONA}")

    # lebar jalan (galat 9)
    blok = {(x, y) for y in range(H - 1) for x in range(W - 1)
            if bebas(x, y) and bebas(x + 1, y) and bebas(x, y + 1) and bebas(x + 1, y + 1)}
    sempit = [(x, y) for y in range(H) for x in range(W) if R[y][x] and not any(
        (x - a, y - b) in blok for a in (0, 1) for b in (0, 1))]
    P.sempit = sempit
    if sempit:
        P.galat(f"lebar jalan: {len(sempit)} sel terjangkau lebih sempit dari 2 ubin, misalnya {sempit[:4]}", sempit)

    # keterlihatan penanda (galat 10)
    pola = [p for daftar in d["penanda"].values() for p in daftar]

    def penanda(jenis):
        return any(jenis == p or (p.endswith("*") and jenis.startswith(p[:-1])) for p in pola)
    tanda = [[0] * W for _ in range(H)]
    for o in P.objek:
        if penanda(o["jenis"]):
            w, h = OBJEK[o["jenis"]][1]
            for yy in range(o["y"], o["y"] + h):
                for xx in range(o["x"], o["x"] + w):
                    tanda[yy][xx] = 1
    A = [[0] * (W + 1) for _ in range(H + 1)]
    for y in range(H):
        s = 0
        for x in range(W):
            s += tanda[y][x]
            A[y + 1][x + 1] = A[y][x + 1] + s
    buta, total = [], 0
    for y in range(H):
        for x in range(W):
            if not R[y][x]:
                continue
            total += 1
            kiri = min(max(x * UBIN + 8 - 160, 0), W * UBIN - 320)
            atas = min(max(y * UBIN + 8 - 90, 0), H * UBIN - 180)
            a0, a1, b0, b1 = kiri // UBIN, (kiri + 319) // UBIN, atas // UBIN, (atas + 179) // UBIN
            if A[b1 + 1][a1 + 1] - A[b0][a1 + 1] - A[b1 + 1][a0] + A[b0][a0] == 0:
                buta.append((x, y))
    P.buta, P.persen_penanda = buta, 100 * (total - len(buta)) / max(total, 1)
    if buta:
        P.galat(f"keterlihatan penanda: {len(buta)} posisi tidak melihat objek penanda, misalnya {buta[:4]}", buta)

    # ukuran (galat 11)
    P.gzip = (len(gzip.compress(P.teks_peta, 9, mtime=0)), len(gzip.compress(P.teks_gambar, 9, mtime=0)))
    if sum(P.gzip) > BATAS_GZIP:
        P.galat(f"ukuran: kedua berkas {sum(P.gzip)} B gzip, melebihi {BATAS_GZIP} B")

    # peringatan (P-26): kantong tertutup dan lorong buntu
    kantong = [(x, y) for y in range(H) for x in range(W) if bebas(x, y) and not R[y][x]]
    if kantong:
        P.peringat(f"kantong tertutup: {len(kantong)} sel bebas tidak terjangkau, misalnya {kantong[:4]}", kantong)
    bj = {b for b in blok if R[b[1]][b[0]]}
    tetangga = {b: [(b[0] + a, b[1] + c) for a, c in ((1, 0), (-1, 0), (0, 1), (0, -1)) if (b[0] + a, b[1] + c) in bj]
                for b in bj}
    derajat = {b: len(t) for b, t in tetangga.items()}
    pangkas, dq = set(), deque(b for b, n in derajat.items() if n <= 1)
    while dq:
        b = dq.popleft()
        if b in pangkas:
            continue
        pangkas.add(b)
        for t in tetangga[b]:
            if t not in pangkas:
                derajat[t] -= 1
                if derajat[t] <= 1:
                    dq.append(t)
    tujuan = {(x, y) for _, x, y in semua}
    sisa = set(pangkas)
    while sisa:
        awal = sisa.pop()
        komp, dq = [awal], deque([awal])
        while dq:
            b = dq.popleft()
            for t in tetangga[b]:
                if t in sisa:
                    sisa.discard(t)
                    komp.append(t)
                    dq.append(t)
        sel = {(bx + a, by + c) for bx, by in komp for a in (0, 1) for c in (0, 1)}
        if len(komp) + 1 > 6 and not (sel & tujuan):
            P.peringat(f"lorong buntu sepanjang sekitar {len(komp) + 1} ubin di sekitar {min(komp)} tanpa tujuan", sel)

    # waktu tempuh dari gerbang (informasi)
    INF = float("inf")
    jarak = [[INF] * W for _ in range(H)]
    pq = [(0.0, x, y) for x, y in sel_gerbang]
    for _, x, y in pq:
        jarak[y][x] = 0.0
    heapq.heapify(pq)
    while pq:
        dd, x, y = heapq.heappop(pq)
        if dd > jarak[y][x]:
            continue
        for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
            nx, ny = x + a, y + b
            if not bebas(nx, ny) or (a and b and (not bebas(nx, y) or not bebas(x, ny))):
                continue
            nd = dd + (1.4142 if a and b else 1.0)
            if nd < jarak[ny][nx]:
                jarak[ny][nx] = nd
                heapq.heappush(pq, (nd, nx, ny))
    P.waktu_terjauh = max((jarak[y][x] for _, _, x, y in P.titik), default=0) / 4.5


# --------------------------------------------------------------------------- pratinjau (P-30)
_SPRITE = {}


def _sprite(jenis):
    if jenis not in _SPRITE:
        _, _, potong, *_ = OBJEK[jenis]
        bawah = Image.open(ASET / "obj" / f"obj_{jenis}.png").convert("RGBA")
        jalur = ASET / "obj" / f"obj_{jenis}_atas.png"
        atas = Image.open(jalur).convert("RGBA") if jalur.exists() else None
        _SPRITE[jenis] = (atas, bawah, atas.height if atas else 0)
    return _SPRITE[jenis]


def gambar_peta(P, masa, pemain=True):
    """Peta penuh dari lapisan dan objek, dengan cara yang sama seperti layar pemain (Design System 7)."""
    lembar, cache = lembar_ubin(masa).im, {}
    kan = Image.new("RGBA", (LEBAR * UBIN, TINGGI * UBIN))

    def ubin(n):
        if n not in cache:
            x, y = (n % KOLOM) * UBIN, (n // KOLOM) * UBIN
            cache[n] = lembar.crop((x, y, x + UBIN, y + UBIN))
        return cache[n]
    for lap in (P.tanah, P.tumpang, P.bayangan):
        for y in range(TINGGI):
            for x in range(LEBAR):
                if lap[y][x] is not None:
                    if lap is P.tanah:
                        kan.paste(ubin(lap[y][x]), (x * UBIN, y * UBIN))
                    else:
                        kan.alpha_composite(ubin(lap[y][x]), (x * UBIN, y * UBIN))
    urut = sorted(P.objek, key=lambda o: (o["y"] + OBJEK[o["jenis"]][1][1], o["x"]))
    for o in urut:
        _, bawah, tinggi_atas = _sprite(o["jenis"])
        kan.paste(bawah, (o["x"] * UBIN - 1, o["y"] * UBIN - 1 + tinggi_atas), bawah)
    if pemain:
        for n, t in enumerate(P.muncul[:8]):
            spr = BJ._pemain(n + 1, 0, 0, tas=BJ.TAS_CONTOH[n])[0]
            spr = (spr.im if hasattr(spr, "im") else spr).convert("RGBA")
            kan.paste(spr, (t["x"] * UBIN, t["y"] * UBIN + 12 - 21), spr)
    for o in urut:
        atas, _, _ = _sprite(o["jenis"])
        if atas is not None:
            kan.paste(atas, (o["x"] * UBIN - 1, o["y"] * UBIN - 1), atas)
    return kan


def _pusat_zona(P, z):
    d, zona = P.sumber, next(q for q in P.sumber["zona"] if q["id"] == z)
    pola = d["penanda"][z]
    for o in d["objek"]:
        j = pilih_varian(o["jenis"], o["x"], o["y"], d["benih"])
        if zona["kiri"] <= o["x"] <= zona["kanan"] and zona["atas"] <= o["y"] <= zona["bawah"] and any(
                j == p or (p.endswith("*") and j.startswith(p[:-1])) for p in pola):
            w, h = OBJEK[j][1]
            return (o["x"] + w / 2) * UBIN, (o["y"] + h / 2) * UBIN
    return (zona["kiri"] + zona["kanan"] + 1) / 2 * UBIN, (zona["atas"] + zona["bawah"] + 1) / 2 * UBIN


def _potong(peta, cx, cy, w=320, h=180):
    kiri = int(min(max(cx - w / 2, 0), LEBAR * UBIN - w))
    atas = int(min(max(cy - h / 2, 0), TINGGI * UBIN - h))
    return peta.crop((kiri, atas, kiri + w, atas + h))


def _ikon(nama, k, bingkai=0):
    im = Image.open(ASET / "ikon" / f"{nama}.png").convert("RGBA")
    if im.width > im.height:
        im = im.crop((bingkai * im.height, 0, (bingkai + 1) * im.height, im.height))
    return im.resize((im.width * k, im.height * k), Image.NEAREST)


def tiruan_layar(P, peta, k, hp):
    """Pandangan 320 x 180 di depan gerbang dengan tiruan HUD sederhana dari ikon yang sudah disetujui."""
    gb = P.gerbang
    layar = _potong(peta, (gb["kiri"] + gb["kanan"] + 1) / 2 * UBIN, (gb["bawah"] + 3) * UBIN)
    layar = layar.resize((320 * k, 180 * k), Image.NEAREST).convert("RGBA")
    d = ImageDraw.Draw(layar)
    s = 2.625 if hp else 1.0                                   # piksel perangkat per px CSS
    tinggi_bilah = int(28 * s)
    d.rectangle((0, 0, layar.width, tinggi_bilah), fill=(110, 198, 242))
    f = BJ._huruf(int(13 * s), True)
    ki = max(1, int(s))
    layar.alpha_composite(_ikon("ikon_matahari", ki), (int(8 * s), int(6 * s)))
    d.text((int(30 * s), int(7 * s)), "Siang 11.40", font=f, fill=PA.INK[:3])
    d.text((layar.width // 2 - int(20 * s), int(7 * s)), "11:32", font=f, fill=PA.INK[:3])
    layar.alpha_composite(_ikon("ikon_bintang", ki), (layar.width - int(130 * s), int(6 * s)))
    d.text((layar.width - int(110 * s), int(7 * s)), "340  #5", font=f, fill=PA.INK[:3])
    mw, mh = int(112 * s), int(75 * s)
    mini = peta.resize((mw, mh), Image.BOX).convert("RGBA")
    mx, my = layar.width - mw - int(8 * s), tinggi_bilah + int(8 * s)
    d.rectangle((mx - 3, my - 3, mx + mw + 2, my + mh + 2), fill=PA.INK[:3])
    layar.alpha_composite(mini, (mx, my))
    r = int(24 * s)
    for n, ikon in enumerate(("ikon_lari", "ikon_kompas", "ikon_petunjuk")):
        cx, cy = layar.width - int(40 * s), layar.height - int(110 * s) - n * int(56 * s)
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=PA.CREAM[:3], outline=PA.INK[:3], width=max(2, int(2 * s)))
        im = _ikon(ikon, max(1, int(2 * s)))
        layar.alpha_composite(im, (cx - im.width // 2, cy - im.height // 2))
    if hp:
        R = int(32 * s)
        cx, cy = layar.width - int(110 * s), layar.height - int(48 * s)
        d.ellipse((cx - R, cy - R, cx + R, cy + R), fill=PA.MIST[:3], outline=PA.INK[:3], width=int(2 * s))
        d.text((cx - int(25 * s), cy - int(7 * s)), "Periksa", font=BJ._huruf(int(12 * s), True), fill=PA.DUSK[:3])
        R = int(48 * s)
        cx, cy = int(90 * s), layar.height - int(70 * s)
        d.ellipse((cx - R, cy - R, cx + R, cy + R), outline=PA.INK[:3], width=int(2 * s))
        d.ellipse((cx - R // 2, cy - R // 2, cx + R // 2, cy + R // 2), fill=PA.SUN[:3], outline=PA.INK[:3], width=int(2 * s))
    else:
        d.text((layar.width // 2 - 40, layar.height - 40), "E  Periksa", font=BJ._huruf(14, True), fill=PA.INK[:3])
    return layar.convert("RGB")


def gambar_periksa(P, siang):
    im = Image.blend(siang.convert("RGB"), Image.new("RGB", siang.size, (255, 255, 255)), 0.5)
    d = ImageDraw.Draw(im, "RGBA")
    f, fb = BJ._huruf(11), BJ._huruf(12, True)
    for n in range(0, LEBAR + 1, 10):
        d.line((n * UBIN, 0, n * UBIN, im.height), fill=(201, 212, 229, 255), width=1)
        d.text((n * UBIN + 2, 2), str(n), font=f, fill=PA.DUSK[:3])
    for n in range(0, TINGGI + 1, 10):
        d.line((0, n * UBIN, im.width, n * UBIN), fill=(201, 212, 229, 255), width=1)
        d.text((2, n * UBIN + 2), str(n), font=f, fill=PA.DUSK[:3])
    for teks, sel in P.peringatan:
        for x, y in sel:
            d.rectangle((x * UBIN, y * UBIN, x * UBIN + 15, y * UBIN + 15), fill=(255, 159, 28, 150))
    for teks, sel in P.masalah:
        for x, y in sel:
            d.rectangle((x * UBIN, y * UBIN, x * UBIN + 15, y * UBIN + 15), fill=(255, 107, 91, 190))
    for z in P.sumber["zona"]:
        d.rectangle((z["kiri"] * UBIN, z["atas"] * UBIN, (z["kanan"] + 1) * UBIN - 1, (z["bawah"] + 1) * UBIN - 1),
                    outline=PA.INK[:3], width=3)
        d.text((z["kiri"] * UBIN + 22, z["atas"] * UBIN + 18), f"{z['id'].upper()} {z['nama']}", font=BJ._huruf(18, True),
               fill=PA.INK[:3])
    lb = P.lobi
    d.rectangle((lb["kiri"] * UBIN, lb["atas"] * UBIN, (lb["kanan"] + 1) * UBIN - 1, (lb["bawah"] + 1) * UBIN - 1),
                outline=PA.SUN[:3], width=4)
    gb = P.gerbang
    d.rectangle((gb["kiri"] * UBIN, gb["atas"] * UBIN, (gb["kanan"] + 1) * UBIN - 1, (gb["bawah"] + 1) * UBIN - 1),
                fill=PA.SUN[:3], outline=PA.INK[:3])
    for t in P.muncul:
        cx, cy = t["x"] * UBIN + 8, t["y"] * UBIN + 8
        d.ellipse((cx - 3, cy - 3, cx + 3, cy + 3), fill=PA.INK[:3])
    for i, _, x, y in P.titik:
        d.rectangle(((x - 1) * UBIN, (y - 1) * UBIN, (x + 2) * UBIN - 1, (y + 2) * UBIN - 1), outline=PA.TEAL[:3], width=2)
        cx, cy = x * UBIN + 8, y * UBIN + 8
        d.ellipse((cx - 6, cy - 6, cx + 6, cy + 6), fill=PA.SUN[:3], outline=PA.INK[:3], width=2)
        d.text((cx + 9, cy - 8), i[2:], font=fb, fill=PA.INK[:3])
    warna = {"sepatu": PA.CORAL[:3], "kompas": PA.TEAL[:3], "buku": PA.SKYD[:3]}
    for i, j, _, x, y in P.kotak:
        cx, cy = x * UBIN + 8, y * UBIN + 8
        d.rectangle((cx - 5, cy - 5, cx + 5, cy + 5), fill=warna[j], outline=PA.INK[:3], width=2)
    for i, _, x, y in P.halte:
        cx, cy = x * UBIN + 8, y * UBIN + 8
        d.rectangle((cx - 7, cy - 7, cx + 7, cy + 7), fill=PA.TEAL[:3], outline=PA.INK[:3], width=2)
        d.text((cx - 4, cy - 7), "H", font=fb, fill=PA.INK[:3])
    return im


def gambar_denah(P, siang):
    S, OX, OY = 6, 24, 96
    mini = siang.resize((LEBAR, TINGGI), Image.BOX).convert("RGB")
    L = Image.new("RGB", (OX + LEBAR * S + 340, OY + TINGGI * S + 70), PA.CREAM[:3])
    L.paste(mini.resize((LEBAR * S, TINGGI * S), Image.NEAREST), (OX, OY))
    d = ImageDraw.Draw(L)
    fj, fb, f, fk = BJ._huruf(24, True), BJ._huruf(14, True), BJ._huruf(15), BJ._huruf(13)
    d.text((OX, 18), f"Denah peta Jejak Setara: {LEBAR} × {TINGGI} ubin", font=fj, fill=PA.INK[:3])
    d.text((OX, 56), "JS-06 · Sesi C · dibangun dari scripts/jejak-setara/peta/ dengan aset yang sudah disetujui",
           font=f, fill=PA.DUSK[:3])

    def kp(a, b, c, e):
        return (OX + a * S, OY + b * S, OX + (c + 1) * S - 1, OY + (e + 1) * S - 1)

    def pusat(x, y):
        return OX + x * S + S // 2, OY + y * S + S // 2
    for z in P.sumber["zona"]:
        d.rectangle(kp(z["kiri"], z["atas"], z["kanan"], z["bawah"]), outline=PA.INK[:3], width=2)
    lb, gb = P.lobi, P.gerbang
    d.rectangle(kp(lb["kiri"], lb["atas"], lb["kanan"], lb["bawah"]), outline=PA.SUN[:3], width=4)
    d.rectangle(kp(gb["kiri"], gb["atas"], gb["kanan"], gb["bawah"]), fill=PA.SUN[:3], outline=PA.INK[:3])
    for t in P.muncul:
        cx, cy = pusat(t["x"], t["y"])
        d.ellipse((cx - 2, cy - 2, cx + 2, cy + 2), fill=PA.INK[:3])
    for _, _, x, y in P.titik:
        cx, cy = pusat(x, y)
        d.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=PA.SUN[:3], outline=PA.INK[:3], width=2)
    warna = {"sepatu": PA.CORAL[:3], "kompas": PA.TEAL[:3], "buku": PA.SKYD[:3]}
    for _, j, _, x, y in P.kotak:
        cx, cy = pusat(x, y)
        d.rectangle((cx - 4, cy - 4, cx + 4, cy + 4), fill=warna[j], outline=PA.INK[:3], width=2)
    for _, _, x, y in P.halte:
        cx, cy = pusat(x, y)
        d.rectangle((cx - 6, cy - 6, cx + 6, cy + 6), fill=PA.TEAL[:3], outline=PA.INK[:3], width=2)
        d.text((cx - 4, cy - 8), "H", font=fb, fill=PA.INK[:3])
    for z in P.sumber["zona"]:
        teks = f"{z['id'].upper()} {z['nama']}"
        x0, y0 = OX + z["kiri"] * S + 6, OY + z["atas"] * S + (40 if z["atas"] == 0 else 6)
        bb = d.textbbox((x0, y0), teks, font=fb)
        d.rectangle((bb[0] - 4, bb[1] - 3, bb[2] + 4, bb[3] + 3), fill=PA.CREAM[:3], outline=PA.INK[:3])
        d.text((x0, y0), teks, font=fb, fill=PA.INK[:3])
    d.text((kp(lb["kiri"], lb["atas"], lb["kanan"], lb["bawah"])[0] + 8, kp(lb["kiri"], lb["atas"], 0, 0)[1] + 6), "Lobi",
           font=fb, fill=PA.INK[:3])
    lx, ly = OX + LEBAR * S + 24, OY
    d.text((lx, ly), "Keterangan", font=fj, fill=PA.INK[:3])
    ly += 40
    for jenis, teks in (("titik", f"Titik kejadian ({len(P.titik)})"), ("sepatu", "Kotak sepatu (Lari cepat)"),
                        ("kompas", "Kotak kompas"), ("buku", "Kotak buku (Petunjuk)"), ("halte", f"Halte ({len(P.halte)})"),
                        ("lobi", "Halaman lobi bertembok"), ("gerbang", "Bukaan gerbang (2 ubin)"),
                        ("muncul", f"Titik muncul pemain ({len(P.muncul)})"), ("zona", "Batas zona")):
        x, y = lx, ly + 3
        if jenis == "titik":
            d.ellipse((x, y, x + 10, y + 10), fill=PA.SUN[:3], outline=PA.INK[:3], width=2)
        elif jenis in warna:
            d.rectangle((x, y, x + 9, y + 9), fill=warna[jenis], outline=PA.INK[:3], width=2)
        elif jenis == "halte":
            d.rectangle((x - 1, y - 1, x + 11, y + 11), fill=PA.TEAL[:3], outline=PA.INK[:3], width=2)
        elif jenis == "lobi":
            d.rectangle((x - 2, y, x + 14, y + 10), outline=PA.SUN[:3], width=4)
        elif jenis == "gerbang":
            d.rectangle((x, y + 2, x + 12, y + 8), fill=PA.SUN[:3], outline=PA.INK[:3])
        elif jenis == "muncul":
            d.ellipse((x + 3, y + 3, x + 7, y + 7), fill=PA.INK[:3])
        else:
            d.rectangle((x - 2, y, x + 14, y + 10), outline=PA.INK[:3], width=2)
        d.text((lx + 24, ly), teks, font=f, fill=PA.INK[:3])
        ly += 28
    ly += 12
    for b in ("Utara di atas: laut dan pantai.", "Sekolah dan lobi di tengah,", "dikelilingi jalan lingkar.", "",
              f"Gerbang ke titik terjauh: {angka(P.waktu_terjauh)} detik", "berjalan (4,5 ubin per detik).", "",
              "Satu ubin = 6 piksel di gambar ini;", f"peta penuh {LEBAR * UBIN:,} × {TINGGI * UBIN:,} piksel logis.".replace(",", ".")):
        d.text((lx, ly), b, font=fk, fill=PA.INK[:3])
        ly += 20
    d.line((OX, OY + TINGGI * S + 30, OX + 40 * S, OY + TINGGI * S + 30), fill=PA.INK[:3], width=3)
    d.text((OX + 40 * S + 10, OY + TINGGI * S + 20), "40 ubin ≈ 9 detik berjalan", font=fk, fill=PA.INK[:3])
    return L


def buat_pratinjau(P, folder, lengkap=True):
    folder.mkdir(parents=True, exist_ok=True)
    siang = gambar_peta(P, "siang")
    gambar_periksa(P, siang).save(folder / "peta_periksa.png", optimize=True)
    if not lengkap:
        return
    siang.convert("RGB").save(folder / "peta_siang.png", optimize=True)
    for masa in ("pagi", "sore"):
        gambar_peta(P, masa).convert("RGB").save(folder / f"peta_{masa}.png", optimize=True)
    for n in range(1, 9):
        cx, cy = _pusat_zona(P, f"z{n}")
        PA.scanlines(_potong(siang, cx, cy), k=4).save(folder / f"peta_zona_{n}.png", optimize=True)
    tiruan_layar(P, siang, 6, True).save(folder / "peta_hp.png", optimize=True)
    tiruan_layar(P, siang, 3, False).save(folder / "peta_laptop.png", optimize=True)
    gambar_denah(P, siang).save(folder / "peta_denah.png", optimize=True)


# --------------------------------------------------------------------------- utama
def main():
    ap = argparse.ArgumentParser(description="Bangun dan periksa peta kampung Jejak Setara (JS-06).")
    ap.add_argument("--periksa", action="store_true", help="bangun di memori dan bandingkan dengan berkas di repositori")
    ap.add_argument("--tanpa-pratinjau", action="store_true", help="lewati pembuatan pratinjau")
    ap.add_argument("--keluar", type=Path, help="tulis hasil dan pratinjau ke folder lain")
    args = ap.parse_args()

    P = bangun()
    folder_hasil = args.keluar or HASIL
    folder_pratinjau = (args.keluar / "preview") if args.keluar else PRATINJAU
    if hasattr(P, "teks_peta"):
        kb = [len(P.teks_peta) / 1024, P.gzip[0] / 1024, len(P.teks_gambar) / 1024, P.gzip[1] / 1024]
        print(f"Peta {LEBAR} × {TINGGI} ubin: {len(P.titik)} titik kejadian, {len(P.kotak)} kotak, {len(P.halte)} halte, "
              f"{len(P.objek)} objek.")
        print(f"kampung.json {angka(kb[0])} KB ({angka(kb[1])} KB gzip) · kampung_gambar.json {angka(kb[2])} KB "
              f"({angka(kb[3])} KB gzip) · jumlah gzip {angka(kb[1] + kb[3])} KB dari {BATAS_GZIP // 1024} KB")
        print(f"Keterlihatan penanda: {angka(P.persen_penanda)}% posisi.")
        print(f"Dari gerbang lobi ke titik kejadian terjauh: {angka(P.waktu_terjauh)} detik berjalan.")
    if args.periksa and not P.masalah:
        for nama, isi in (("kampung.json", P.teks_peta), ("kampung_gambar.json", P.teks_gambar)):
            jalur = HASIL / nama
            if not jalur.exists() or jalur.read_bytes().replace(b"\r\n", b"\n") != isi:
                P.galat(f"{nama} berbeda dengan hasil bangun dari sumber; jalankan peta:build")
    if P.peringatan:
        print("PERINGATAN:")
        for teks, _ in P.peringatan:
            print("  -", teks)
    if not args.periksa and not args.tanpa_pratinjau and hasattr(P, "titik") and hasattr(P, "tanah"):
        buat_pratinjau(P, folder_pratinjau, lengkap=not P.masalah)
    if P.masalah:
        print("MASALAH:")
        for teks, _ in P.masalah:
            print("  -", teks)
        sys.exit(1)
    if not args.periksa:
        folder_hasil.mkdir(parents=True, exist_ok=True)
        (folder_hasil / "kampung.json").write_bytes(P.teks_peta)
        (folder_hasil / "kampung_gambar.json").write_bytes(P.teks_gambar)
    print("Semua pemeriksaan peta lulus.")


if __name__ == "__main__":
    main()
