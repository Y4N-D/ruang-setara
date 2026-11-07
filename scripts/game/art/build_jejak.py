"""Bangun semua aset gambar Jejak Setara dari kode, lalu periksa.

Pemakaian (dari folder repositori):
    npx pnpm@11.25.0 assets:build:jejak
    python scripts/game/art/build_jejak.py --only ava_1_bawah_diam --out /tmp/aset --preview /tmp/pratinjau

Hasil:
    <out>/ava/ava_{n}_{arah}_{pose}.png, <out>/ikon/ikon_ava_{n}.png, <out>/ubin/ubin_{masa}.png  (ukuran asli 1x)
    <out>/CREDITS.md                (dibuat otomatis untuk aset berstatus Disetujui)
    <preview>/*.png dan *.gif       (pratinjau untuk persetujuan, docs/jejak-setara/preview/)
Pemeriksaan: warna di luar palet, piksel semi-transparan, ukuran, warna kunci tas hanya di tas,
dan anggaran (Architecture Jejak bagian 11.3).

Kit Sehari Setara (pixelart.py, palette.json, ikon.py) dipakai tanpa diubah; build_assets.py Sehari Setara
tidak terpengaruh. Status setiap aset ada di docs/jejak-setara/Daftar_Aset.md. CREDITS.md dan manifest.ts
dibuat dari daftar ini hanya untuk aset berstatus Disetujui (DISETUJUI di bawah; bentuk manifest menunggu
Permintaan C-6).
"""
import argparse
import io
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from pixelart import *          # noqa: E402,F401,F403
from atas_tokoh import (AVATAR, ARAH, BINGKAI, KETERANGAN, WARNA_TAS, avatar, strip_avatar,   # noqa: E402
                        ikon_kepala, ganti_tas, NPC, POSE_NPC, UKURAN_NPC, npc, strip_npc,
                        NPC2, POSE_NPC2, npc2, strip_npc2)
from atas_ubin import (MASA, NAMA_MASA, KOLOM, NOMOR, BLOB, WILAYAH, SUSUNAN, UKURAN_LEMBAR,   # noqa: E402
                       ubin_rumput, ubin_wilayah, lembar_ubin, nomor_tanah)
from atas_objek import POTONG_ATAP, OBJEK, KODE_OBJEK, PAGAR, obj_rumah_a, pisah   # noqa: E402
from atas_ikon import (SKILL, ARAH_KOMPAS, ARAH_DIRI, tanda_kejadian, tanda_dibuka, tanda_selesai,   # noqa: E402
                       tanda_kotak, tanda_kompas, tanda_diri, tanda_debu, tanda_kilau)

if HERE.parts[-3:] == ("scripts", "game", "art"):      # berada di dalam repositori
    REPO = HERE.parents[2]
    DEFAULT_OUT = REPO / "app" / "jejak-setara" / "assets"
    DEFAULT_PREVIEW = REPO / "docs" / "jejak-setara" / "preview"
else:                                                 # dijalankan di folder lepas
    DEFAULT_OUT = HERE / "out" / "aset"
    DEFAULT_PREVIEW = HERE / "out" / "pratinjau"

# ---------------------------------------------------------------------------
# Daftar aset: nama berkas -> (folder, fungsi yang mengembalikan Image, ukuran yang diharapkan)
# Tambahkan entri setiap kali aset baru digambar, lalu perbarui Daftar_Aset.md.
# ---------------------------------------------------------------------------
ASSETS = {}
# Kelompok A (Ditinjau): avatar A1-A8, 6 strip per avatar, dan ikon kepala
for _n in AVATAR:
    for _arah in ARAH:
        for _pose, _nb in BINGKAI.items():
            ASSETS[f"ava_{_n}_{_arah}_{_pose}"] = (
                "ava", lambda n=_n, a=_arah, p=_pose: strip_avatar(n, a, p), (16 * _nb, 24))
    ASSETS[f"ikon_ava_{_n}"] = ("ikon", lambda n=_n: ikon_kepala(n).im, (16, 16))

# Kelompok U (Ditinjau): satu lembar ubin per masa
for _masa in MASA:
    ASSETS[f"ubin_{_masa}"] = ("ubin", lambda m=_masa: lembar_ubin(m).im, UKURAN_LEMBAR)

# Kelompok O1 (Ditinjau): bangunan penanda zona; bangunan dan pohon dipotong dua (usulan 6a)
NAMA_OBJEK = {}                      # nama berkas -> nama objek di OBJEK
for _nama, (_fn, _ub, _pot, _padat, _bay, _lewat) in OBJEK.items():
    _w, _h = _ub[0] * 16 + 2, _ub[1] * 16 + 2
    if _pot:
        ASSETS[f"obj_{_nama}"] = ("obj", lambda f=_fn, p=_pot: pisah(f(), p)[1].im, (_w, _h - _pot))
        ASSETS[f"obj_{_nama}_atas"] = ("obj", lambda f=_fn, p=_pot: pisah(f(), p)[0].im, (_w, _pot))
        NAMA_OBJEK[f"obj_{_nama}_atas"] = _nama
    else:
        ASSETS[f"obj_{_nama}"] = ("obj", lambda f=_fn: f().im, (_w, _h))
    NAMA_OBJEK[f"obj_{_nama}"] = _nama

# Kelompok T (Ditinjau): penanda dan efek, di folder ikon/
ASSETS["tanda_kejadian"] = ("ikon", lambda: tanda_kejadian().im, (12, 12))
ASSETS["tanda_dibuka"] = ("ikon", lambda: tanda_dibuka().im, (12, 12))
ASSETS["tanda_selesai"] = ("ikon", lambda: tanda_selesai().im, (10, 10))
for _skill in SKILL:
    ASSETS[f"tanda_kotak_{_skill}"] = ("ikon", lambda k=_skill: strip([tanda_kotak(k, b) for b in range(3)]), (42, 12))
ASSETS["tanda_kompas"] = ("ikon", lambda: strip([tanda_kompas(a, b) for a in ARAH_KOMPAS for b in range(2)]), (112, 7))
ASSETS["tanda_diri"] = ("ikon", lambda: strip([tanda_diri(a) for a in ARAH_DIRI]), (28, 7))
ASSETS["tanda_debu"] = ("ikon", lambda: strip([tanda_debu(b) for b in range(2)]), (16, 6))
ASSETS["tanda_kilau"] = ("ikon", lambda: strip([tanda_kilau(b) for b in range(2)]), (16, 8))

# Kelompok N1 (Ditinjau): tokoh Sehari Setara versi tampak atas, di folder npc/
KODE_NPC = {"nara": "N-01", "ibu": "N-02", "gita": "N-03", "dimas": "N-04", "sinta": "N-05", "ratih": "N-06",
            "komang": "N-07", "made": "N-08", "bayu": "N-09"}
for _n, _poses in POSE_NPC.items():
    for _pose in _poses:
        _ukuran = (68, 30) if _pose == "motor" else (UKURAN_NPC[NPC[_n]["ukuran"]][0][0] * 2, UKURAN_NPC[NPC[_n]["ukuran"]][0][1])
        ASSETS[f"npc_{_n}_{'kanan' if _pose == 'motor' else 'bawah'}_{_pose}"] = (
            "npc", lambda n=_n, p=_pose: strip_npc(n, p), _ukuran)

# Kelompok N2 (Ditinjau): warga dan tokoh baru, di folder npc/
KODE_NPC.update({"warga1": "N-10", "warga2": "N-10", "warga3": "N-10", "nenek": "N-11", "ibubayi": "N-12",
                 "anak1": "N-13", "anak2": "N-13", "pedagang": "N-14", "petugas": "N-15", "polisi": "N-16",
                 "raka": "N-17", "wayan": "N-18", "siswa1": "N-19", "siswa2": "N-19", "siswa3": "N-19",
                 "siswa4": "N-19", "siswa5": "N-20", "siswa6": "N-20"})
for _n, _poses in POSE_NPC2.items():
    for _pose in _poses:
        ASSETS[f"npc_{_n}_bawah_{_pose}"] = ("npc", lambda n=_n, p=_pose: strip_npc2(n, p),
                                              (UKURAN_NPC[NPC2[_n]["ukuran"]][0][0] * 2, UKURAN_NPC[NPC2[_n]["ukuran"]][0][1]))

# Aset berstatus Disetujui: nama -> tanggal. Hanya aset di sini yang masuk CREDITS.md dan manifest.ts.
KELOMPOK_O1 = {n for n, kode in KODE_OBJEK.items() if kode <= "O-20"}
KELOMPOK_O2 = {n for n, kode in KODE_OBJEK.items() if "O-21" <= kode <= "O-28"}
DISETUJUI = {nama: "6 November 2026" for nama in ASSETS
             if nama.startswith(("ava_", "ikon_ava_", "ubin_"))                     # kelompok A dan U
             or NAMA_OBJEK.get(nama) in KELOMPOK_O1 | KELOMPOK_O2                       # kelompok O1 dan O2
             or nama.startswith("tanda_")                                               # kelompok T
             or (nama.startswith("npc_") and nama.split("_")[1] in NPC)                  # kelompok N1
             or (nama.startswith("npc_") and nama.split("_")[1] in NPC2)}                # kelompok N2

BATAS_STRIP = 6 * 1024              # satu strip avatar atau tokoh
BATAS_UBIN = 60 * 1024              # satu lembar ubin per masa
BATAS_TOTAL = 2 * 1024 * 1024       # seluruh aset layar pemain


def kode_aset(nama):
    """ID di Daftar_Aset.md."""
    if nama.startswith("ava_"):
        return f"A-0{nama.split('_')[1]}"
    if nama.startswith("ikon_ava_"):
        return "A-09"
    if nama.startswith("ubin_"):
        return "U-01 sampai U-15"
    if nama in NAMA_OBJEK:
        return KODE_OBJEK[NAMA_OBJEK[nama]]
    kode_t = {"tanda_kejadian": "T-01", "tanda_dibuka": "T-02", "tanda_selesai": "T-03", "tanda_kotak_sepatu": "T-04",
              "tanda_kotak_kompas": "T-05", "tanda_kotak_buku": "T-06", "tanda_kotak_teropong": "T-07",
              "tanda_kotak_karcis": "T-08", "tanda_kompas": "T-09", "tanda_diri": "T-10", "tanda_debu": "T-11",
              "tanda_kilau": "T-12"}
    if nama in kode_t:
        return kode_t[nama]
    if nama.startswith("npc_"):
        return KODE_NPC.get(nama.split("_")[1], "—")
    return "—"


JUDUL_FOLDER = {"ava": "Avatar pemain", "ikon": "Ikon", "ubin": "Lembar ubin per masa", "obj": "Objek dan bangunan",
                "npc": "Tokoh bukan pemain"}


def tulis_kredit(out_dir):
    """CREDITS.md untuk aset berstatus Disetujui (AGENTS Jejak bagian 9). Jangan disunting manual."""
    if not DISETUJUI:
        return 0
    baris = ["# CREDITS — Aset gambar Jejak Setara", "",
             "Semua gambar di folder ini digambar dengan kode memakai kit Sehari Setara (`scripts/game/art/`: "
             "`palette.json` dan `pixelart.py`) dan kit tampak atas Jejak Setara (`scripts/game/art/atas_*.py`), "
             "lalu dibangun dengan `python scripts/game/art/build_jejak.py`. Kode adalah sumber utama; PNG tidak "
             "disunting manual. Status dan rincian setiap aset ada di `docs/jejak-setara/Daftar_Aset.md`.", "",
             "Berkas ini dibuat otomatis oleh `build_jejak.py` dan hanya memuat aset berstatus Disetujui. "
             "Format atribusi mengikuti `docs/jejak-setara/AGENTS.md` bagian 9: \"Digambar dengan kode (kit Sehari "
             "Setara) oleh Claude, disetujui [nama], [tanggal]\".", ""]
    for folder, judul in JUDUL_FOLDER.items():
        nama = sorted(n for n in DISETUJUI if ASSETS[n][0] == folder)
        if not nama:
            continue
        baris += [f"## {judul} (`{folder}/`)", "", "| File | ID | Atribusi |", "|---|---|---|"]
        for n in nama:
            baris.append(f"| `{folder}/{n}.png` | {kode_aset(n)} | Digambar dengan kode (kit Sehari Setara) oleh "
                         f"Claude, disetujui YAN, {DISETUJUI[n]} |")
        baris.append("")
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "CREDITS.md").write_text("\n".join(baris), encoding="utf-8")
    return len(DISETUJUI)


def _kunci_tas_bocor(nama):
    """Avatar digambar dengan tas warna uji; SUN atau MANGO yang tersisa berarti warna kunci dipakai di luar tas."""
    if not nama.startswith(("ava_", "ikon_ava_")):
        return 0
    bagian = nama.split("_")
    if nama.startswith("ava_"):
        n, arah, pose = int(bagian[1]), bagian[2], bagian[3]
        im = strip_avatar(n, arah, pose, tas=(CORAL, WOODD))                      # noqa: F405
    else:
        im = ikon_kepala(int(bagian[2]), tas=(CORAL, WOODD)).im                    # noqa: F405
    kunci = {SUN, MANGO}                                                          # noqa: F405
    return sum(1 for p in im.convert("RGBA").getdata() if p[3] and p in kunci)


# ---------------------------------------------------------------------------
# Alat pratinjau
# ---------------------------------------------------------------------------
def _huruf(ukuran, tebal=False):
    try:
        return ImageFont.truetype("DejaVuSans-Bold.ttf" if tebal else "DejaVuSans.ttf", ukuran)
    except OSError:
        return ImageFont.load_default()


def besar(c, k):
    im = c.im if isinstance(c, C) else c                                          # noqa: F405
    return im.resize((im.width * k, im.height * k), Image.NEAREST)


class Lembar:
    """Lembar pratinjau berlatar cream dengan panel, gambar, dan label."""

    def __init__(self, w, h):
        self.im = Image.new("RGB", (w, h), CREAM[:3])                             # noqa: F405
        self.d = ImageDraw.Draw(self.im)
        self.f = {"judul": _huruf(30, True), "panel": _huruf(21, True), "kecil": _huruf(16), "tebal": _huruf(16, True)}

    def judul(self, teks, sub):
        self.d.text((20, 16), teks, font=self.f["judul"], fill=INK[:3])           # noqa: F405
        w = self.d.textlength(sub, font=self.f["kecil"])
        self.d.text((self.im.width - 20 - w, 28), sub, font=self.f["kecil"], fill=DUSK[:3])  # noqa: F405

    def panel(self, x, y, w, h, teks):
        self.d.rectangle([x, y, x + w, y + h], outline=MIST[:3], width=2)         # noqa: F405
        self.d.text((x + 14, y + 10), teks, font=self.f["panel"], fill=INK[:3])   # noqa: F405

    def tempel(self, im, x, y):
        im = (im.im if isinstance(im, C) else im).convert("RGBA")                 # noqa: F405
        self.im.paste(im, (x, y), im)

    def label(self, teks, cx, y, gaya="kecil"):
        f = self.f[gaya]
        self.d.text((cx - self.d.textlength(teks, font=f) / 2, y), teks, font=f, fill=INK[:3])  # noqa: F405


GESER_BAYANGAN = (8, 4)     # bayangan bangunan jatuh ke kanan bawah (usulan 4a)


def adegan(m, w, h, rumah_xy, pemain):
    """Peta kecil untuk pratinjau. pemain: (sprite, sprite tanpa bayangan, jangkar x, jangkar y, siluet?)."""
    g = C(w, h)                                                                   # noqa: F405
    t = ubin_rumput(m)
    for ty in range(0, h, 16):
        for tx in range(0, w, 16):
            g.paste(t, tx, ty)
    rumah = obj_rumah_a()
    atas, bawah = pisah(rumah, POTONG_ATAP)
    hx, hy = rumah_xy
    dx, dy = GESER_BAYANGAN

    def isi(x, y):
        return 0 <= x < rumah.w and 0 <= y < rumah.h and rumah.px[x, y][3] > 0

    for y in range(rumah.h + dy):                    # bayangan bangunan: ubin tumpang lapisan 10
        for x in range(rumah.w + dx):
            if isi(x - dx, y - dy) and not isi(x, y) and (hx + x + hy + y) % 2 == 0:
                g.p(hx + x, hy + y, m["bayangan"])
    g.paste(bawah, hx, hy + POTONG_ATAP)             # lapisan 20
    for spr, _, ax, ay, _ in sorted(pemain, key=lambda p: p[3]):   # lapisan 30, urut baris kaki
        g.paste(spr, ax - 8, ay - 21)
    g.paste(atas, hx, hy)                            # lapisan 40
    for _, polos, ax, ay, sil in pemain:             # lapisan 60: siluet pemain sendiri (garis sun)
        if not sil:
            continue
        ox, oy = ax - 8, ay - 21

        def ada(x, y):
            return 0 <= x < polos.w and 0 <= y < polos.h and polos.px[x, y][3] > 0

        for y in range(-1, polos.h + 1):
            for x in range(-1, polos.w + 1):
                if ada(x, y) or not any(ada(x + a, y + b) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    continue
                rx, ry = ox + x - hx, oy + y - hy
                if 0 <= rx < atas.w and 0 <= ry < atas.h and atas.px[rx, ry][3] > 0:
                    g.p(ox + x, oy + y, SUN)                                      # noqa: F405
    return g


def _pemain(n, ax, ay, arah="bawah", pose="diam", bingkai=0, tas=None, cermin=False, siluet=False):
    spr = avatar(n, arah, pose, bingkai)
    polos = avatar(n, arah, pose, bingkai, bayangan=False)
    if tas:
        spr, polos = ganti_tas(spr, tas), ganti_tas(polos, tas)
    if cermin:
        spr, polos = flip(spr), flip(polos)                                       # noqa: F405
    return (spr, polos, ax, ay, siluet)


# ---------------------------------------------------------------------------
# Pratinjau: lembar uji gaya (Plan, disetujui sebagai acuan 6 Nov 2026)
# ---------------------------------------------------------------------------
def _pandangan_uji(nama):
    pemain = [_pemain(1, 160, 111), _pemain(1, 178, 45, siluet=True),
              _pemain(1, 74, 128, "kanan", "jalan", 1), _pemain(1, 250, 150, "atas", "jalan", 3)]
    return adegan(MASA[nama], 320, 180, (127, 31), pemain)


def pratinjau_uji_gaya():
    L = Lembar(1440, 1500)
    L.judul("Uji gaya tampak atas — Jejak Setara",
            "Plan Sesi C · 6 Nov 2026 · 1 ubin, 1 avatar, 1 objek · hanya 36 warna palet")
    L.panel(20, 70, 460, 380, "1  Ubin rumput 16×16 (×8)")
    for i, nama in enumerate(MASA):
        x = 34 + i * 146
        L.tempel(besar(ubin_rumput(MASA[nama]), 8), x, 112); L.label(NAMA_MASA[nama], x + 64, 246, "tebal")
        rep = C(64, 48)                                                           # noqa: F405
        for a in range(4):
            for b in range(3):
                rep.paste(ubin_rumput(MASA[nama]), a * 16, b * 16)
        L.tempel(besar(rep, 2), x, 300)
    L.label("Diulang 4×3 ubin (×2): sambungan tanpa jahitan", 250, 275)
    L.label("Kilau ujung rumpun berganti per masa:", 250, 404)
    L.label("pagi #FFF1C9 · siang putih · sore #FFE3A3", 250, 424)
    L.panel(500, 70, 920, 560, "2  Avatar A1 16×24 (×6) · seragam SMP, tas warna kunci")
    baris1 = [("Bawah 1", avatar(1, "bawah", "diam", 0)), ("Bawah 2", avatar(1, "bawah", "diam", 1)),
              ("Kanan", avatar(1, "kanan", "diam", 0)), ("Kiri (cermin)", flip(avatar(1, "kanan", "diam", 0))),  # noqa: F405
              ("Atas", avatar(1, "atas", "diam", 0))]
    for i, (lab, s) in enumerate(baris1):
        x = 522 + i * 118; L.tempel(besar(s, 6), x, 112); L.label(lab, x + 48, 260)
    L.label("Diam: 2 bingkai (bernapas)", 1290, 150); L.label("Kiri = cermin kanan", 1290, 175)
    L.label("Jalan, 4 bingkai: menghadap bawah 1–4 dan kanan 1–4", 960, 292)
    for i in range(8):
        arah = "bawah" if i < 4 else "kanan"; x = 522 + i * 112
        L.tempel(besar(avatar(1, arah, "jalan", i % 4), 6), x, 316); L.label(str(i % 4 + 1), x + 48, 462)
    L.label("Warna tas dipilih otomatis saat bermain (8 warna penanda; tampak belakang ×3)", 960, 492)
    for i, nama in enumerate(WARNA_TAS):
        x = 522 + i * 112
        L.tempel(besar(ganti_tas(avatar(1, "atas", "diam", 0), nama), 3), x + 24, 516); L.label(nama, x + 48, 592)
    L.panel(20, 470, 460, 560, "3  Objek: rumah atap coral 64×64 (×4)")
    rumah = obj_rumah_a(); L.tempel(besar(rumah, 4), 118, 510)
    L.label("4×4 ubin · atap limasan · pintu di dinding depan", 250, 782)
    atas, bawah = pisah(rumah, POTONG_ATAP)
    L.tempel(besar(atas, 2), 50, 820); L.label("Atap (di atas tokoh)", 116, 895)
    L.tempel(besar(bawah, 2), 284, 826); L.label("Dinding (di bawah tokoh)", 350, 895)
    L.label("Cahaya dari kiri atas: sisi kiri dan belakang lebih terang,", 250, 940)
    L.label("sisi kanan teduh, bayangan jatuh ke kanan bawah.", 250, 962)
    L.label("Garis luar ink hanya di tepi siluet.", 250, 984)
    L.panel(500, 650, 920, 440, "4  Pandangan pemain 320×180 (×2), siang")
    L.tempel(besar(_pandangan_uji("siang"), 2), 640, 690)
    L.label("Kira-kira sebesar ini di layar HP mendatar. Pemain di belakang atap tampil sebagai garis sun.", 960, 1058)
    L.panel(20, 1110, 1400, 370, "5  Bersama di peta, tiga masa (×3, dengan garis pindai)")
    for i, nama in enumerate(MASA):
        x = 104 + i * 424
        L.tempel(scanlines(_pandangan_uji(nama).im.crop((112, 24, 240, 120)), k=3), x, 1150)  # noqa: F405
        L.label(NAMA_MASA[nama], x + 192, 1444, "tebal")
    return L.im


# ---------------------------------------------------------------------------
# Pratinjau kelompok A: avatar pemain
# ---------------------------------------------------------------------------
URUTAN_POSE = [("bawah", "diam"), ("bawah", "jalan"), ("kanan", "diam"), ("kanan", "jalan"),
               ("atas", "diam"), ("atas", "jalan")]
NAMA_ARAH = {"bawah": "Bawah", "kanan": "Kanan", "atas": "Atas"}
TAS_CONTOH = list(WARNA_TAS)        # A1 sun, A2 mango, ... A8 sky-d


def pratinjau_ava_ringkasan():
    L = Lembar(1440, 1130)
    L.judul("Kelompok A — Avatar pemain", "Sesi C · disetujui 6 Nov 2026 · 8 desain, 3 arah, diam dan jalan")
    L.panel(20, 70, 940, 350, "1  Delapan avatar menghadap bawah (×6)")
    for i, n in enumerate(AVATAR):
        x = 34 + i * 114
        L.tempel(besar(avatar(n, "bawah", "diam", 0), 6), x, 112)
        L.label(f"A{n}", x + 48, 262, "tebal")
        for j, t in enumerate(KETERANGAN[n]):
            L.label(t, x + 48, 284 + j * 20)
    L.panel(980, 70, 440, 350, "2  Ikon kepala 16×16 (×4)")
    for i, n in enumerate(AVATAR):
        x, y = 1004 + (i % 4) * 102, 112 + (i // 4) * 140
        L.tempel(besar(ikon_kepala(n), 4), x, y); L.label(f"A{n}", x + 32, y + 72, "tebal")
    L.label("Tas di ikon ikut berganti warna", 1200, 390)
    L.panel(20, 440, 1400, 220, "3  Menghadap kanan dan atas (×4)")
    for i, n in enumerate(AVATAR):
        x = 40 + i * 172
        L.tempel(besar(avatar(n, "kanan", "diam", 0), 4), x, 482)
        L.tempel(besar(avatar(n, "atas", "diam", 0), 4), x + 76, 482)
        L.label(f"A{n}", x + 70, 584, "tebal")
    L.label("Kiri = cermin kanan, digambar antarmuka", 1240, 632)
    L.panel(20, 680, 700, 430, "4  Di peta (×2), kira-kira ukuran HP")
    pemain = [_pemain(1, 60, 64, tas="sun"), _pemain(2, 92, 122, "kanan", "jalan", 1, tas="mango"),
              _pemain(3, 40, 158, "atas", "jalan", 3, tas="coral"), _pemain(4, 160, 112, tas="rose"),
              _pemain(5, 236, 132, "kanan", "jalan", 1, tas="berry", cermin=True),
              _pemain(6, 276, 70, tas="teal"), _pemain(7, 214, 168, "atas", "diam", 0, tas="leaf"),
              _pemain(8, 126, 162, "bawah", "jalan", 1, tas="sky-d")]
    L.tempel(besar(adegan(MASA["siang"], 320, 180, (127, 31), pemain), 2), 50, 720)
    L.label("Setiap pemain bertas warna berbeda; nama samaran ditulis antarmuka.", 370, 1086)
    L.panel(740, 680, 680, 430, "5  Tas sama: tetap dibedakan dari siluet (×3)")
    for r, arah in enumerate(("bawah", "kanan", "atas")):
        for i, n in enumerate(AVATAR):
            L.tempel(besar(avatar(n, arah, "diam", 0), 3), 766 + i * 82, 720 + r * 120)
    for i, n in enumerate(AVATAR):
        L.label(f"A{n}", 790 + i * 82, 1080, "tebal")
    return L.im


def pratinjau_ava_pose_semua():
    k, sel = 3, 56
    L = Lembar(80 + 18 * sel + 20, 120 + 8 * 90 + 20)
    L.judul("Kelompok A — Semua bingkai (×3)", "diam 2 bingkai · jalan 4 bingkai")
    x = 80
    for arah, pose in URUTAN_POSE:
        nb = BINGKAI[pose]
        L.label(f"{NAMA_ARAH[arah]} {pose}", x + nb * sel / 2, 70, "tebal")
        for b in range(nb):
            L.label(str(b + 1), x + b * sel + 24, 92)
        x += nb * sel
    for r, n in enumerate(AVATAR):
        y = 120 + r * 90
        L.label(f"A{n}", 40, y + 28, "tebal")
        x = 80
        for arah, pose in URUTAN_POSE:
            for b in range(BINGKAI[pose]):
                L.tempel(besar(avatar(n, arah, pose, b), k), x, y)
                x += sel
    return L.im


def pratinjau_pose_avatar(n):
    k, sel = 6, 112
    L = Lembar(40 + 18 * sel, 270)
    L.judul(f"Avatar A{n} — semua arah dan gerak (×6)", ", ".join(KETERANGAN[n]))
    x = 20
    for arah, pose in URUTAN_POSE:
        for b in range(BINGKAI[pose]):
            L.tempel(besar(avatar(n, arah, pose, b), k), x + 8, 70)
            L.label(f"{NAMA_ARAH[arah]} {pose} {b + 1}", x + 56, 225)
            x += sel
    return L.im


def pratinjau_ava_gerak():
    """GIF: delapan avatar berjalan ke bawah, kanan, atas, kiri, lalu diam (×4)."""
    k, sel = 4, 80
    urutan = []
    for arah, cermin in (("bawah", False), ("kanan", False), ("atas", False), ("kanan", True)):
        for _ in range(2):
            urutan += [(arah, "jalan", b, cermin, 125) for b in range(4)]
    urutan += [("bawah", "diam", b, False, 500) for b in (0, 1, 0, 1)]
    bingkai, lama = [], []
    for arah, pose, b, cermin, ms in urutan:
        im = Image.new("RGB", (16 + 8 * sel, 24 * k + 24), CREAM[:3])             # noqa: F405
        for i, n in enumerate(AVATAR):
            s = ganti_tas(avatar(n, arah, pose, b), TAS_CONTOH[i])
            s = flip(s) if cermin else s                                          # noqa: F405
            g = besar(s, k).convert("RGBA")
            im.paste(g, (16 + i * sel, 12), g)
        bingkai.append(im); lama.append(ms)
    return bingkai, lama


# ---------------------------------------------------------------------------
# Pratinjau kelompok U: ubin per masa
# ---------------------------------------------------------------------------
LEGENDA = {   # huruf peta contoh -> (bahan lapisan 0, ubin tumpang atau None)
    ".": ("rumput", None), "*": ("rumput", "bunga_a"), "+": ("rumput", "bunga_b"), "^": ("rumput", "rumput_tinggi"),
    "d": ("rumput", "daun"), "g": ("rumput", "LAPANGAN"),
    "t": ("tanah", None), "o": ("tanah", "genangan"), "k": ("tanah", "kerikil"),
    "p": ("paving", None), "s": ("semen", None), "c": ("semen", "LAPANGAN"),
    "a": ("aspal", None), "-": ("aspal", "garis_tengah_datar"), "z": ("aspal", "zebra_datar"),
    "b": ("pasir", None), "B": ("pasir", "batu"), "w": ("air", None), "W": ("air_dalam", None),
}
RUMAH_CONTOH = [(3, 2)]          # ubin kiri atas rumah 4x4


def peta_contoh():
    W, H = 40, 24
    g = [["."] * W for _ in range(H)]

    def isi(x0, y0, x1, y1, ch):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                g[y][x] = ch

    isi(0, 8, 39, 8, "s"); isi(0, 12, 39, 12, "s")                  # trotoar
    isi(0, 9, 39, 11, "a"); isi(0, 10, 39, 10, "-")                  # jalan dan garis tengah
    isi(18, 9, 19, 11, "z")                                           # zebra cross
    isi(4, 6, 5, 7, "p")                                              # gang paving dari pintu rumah
    isi(22, 1, 37, 7, "s"); isi(25, 2, 33, 6, "c")                    # halaman sekolah dan lapangan
    isi(2, 15, 12, 21, "g")                                           # lapangan taman
    isi(15, 13, 16, 20, "t"); isi(15, 19, 24, 20, "t")                # jalan setapak berbentuk L
    g[15][16] = "o"; g[17][15] = "k"
    isi(26, 14, 39, 23, "b")                                          # pasir
    isi(31, 15, 39, 15, "w"); isi(29, 16, 39, 16, "w"); isi(28, 17, 39, 23, "w")   # air
    isi(35, 18, 39, 18, "W"); isi(33, 19, 39, 23, "W")                # air dalam
    g[21][27] = "B"
    for x, y, ch in ((1, 3, "*"), (8, 4, "+"), (9, 2, "^"), (2, 6, "*"), (13, 2, "d"), (19, 4, "^"),
                     (14, 14, "+"), (20, 16, "*"), (22, 22, "^"), (10, 23, "d")):
        g[y][x] = ch
    return ["".join(r) for r in g]


def _garis_wilayah(peta, ch):
    """Ubin tumpang garis lapangan untuk wilayah persegi panjang berhuruf ch (lebar ganjil)."""
    sel = [(x, y) for y, r in enumerate(peta) for x, c in enumerate(r) if c == ch]
    if not sel:
        return {}
    x0, x1 = min(x for x, _ in sel), max(x for x, _ in sel)
    y0, y1 = min(y for _, y in sel), max(y for _, y in sel)
    tengah = (x0 + x1) // 2
    hasil = {}
    for x, y in sel:
        sisi = ("n" if y == y0 else "s" if y == y1 else "") + ("w" if x == x0 else "e" if x == x1 else "")
        if sisi in ("n", "s") and x == tengah:
            hasil[(x, y)] = f"lapangan_{sisi}_tegak"
        elif sisi:
            hasil[(x, y)] = f"lapangan_{sisi}"
        elif x == tengah:
            hasil[(x, y)] = "lapangan_tengah_tegak"
    return hasil


def _bayangan_bangunan(x0, y0, w=4, h=4):
    hasil = {(x0 + w, y0): "bayangan_kanan_atas", (x0 + w, y0 + h): "bayangan_sudut", (x0, y0 + h): "bayangan_bawah_kiri"}
    for y in range(y0 + 1, y0 + h):
        hasil[(x0 + w, y)] = "bayangan_kanan"
    for x in range(x0 + 1, x0 + w):
        hasil[(x, y0 + h)] = "bayangan_bawah"
    return hasil


def render_peta(peta, masa, objek=(("rumah_a", 3, 2),), pemain=()):
    """Peta pratinjau: lapisan 0, ubin tumpang, bayangan objek, objek bawah, tokoh, lalu objek atas."""
    lembar = lembar_ubin(masa).im
    H, W = len(peta), len(peta[0])

    def ubin(n):
        x, y = (n % KOLOM) * 16, (n // KOLOM) * 16
        return lembar.crop((x, y, x + 16, y + 16))

    def bahan_di(x, y):
        return LEGENDA[peta[y][x]][0] if 0 <= x < W and 0 <= y < H else None

    g = C(W * 16, H * 16)                                                         # noqa: F405
    for y in range(H):
        for x in range(W):
            g.im.alpha_composite(ubin(nomor_tanah(bahan_di, x, y)), (x * 16, y * 16))
    tumpang = {}
    for y, r in enumerate(peta):
        for x, ch in enumerate(r):
            if LEGENDA[ch][1] and LEGENDA[ch][1] != "LAPANGAN":
                tumpang[(x, y)] = LEGENDA[ch][1]
    for ch in ("c", "g"):
        tumpang.update(_garis_wilayah(peta, ch))
    bayangan = {}
    for nama, x0, y0 in objek:
        _, (w, h), _, _, jenis, _ = OBJEK[nama]
        if jenis == "kotak":
            bayangan.update(_bayangan_bangunan(x0, y0, w, h))
        elif jenis == "kecil":
            bayangan[(x0 + w // 2, y0 + h - 1)] = "bayangan_kecil"
        elif jenis == "pohon":
            for (dx, dy), bag in (((1, 1), "kiri_atas"), ((2, 1), "kanan_atas"), ((1, 2), "kiri_bawah"),
                                  ((2, 2), "kanan_bawah")):
                bayangan[(x0 + dx, y0 + dy)] = f"bayangan_pohon_{bag}"
    for lapis in (tumpang, bayangan):                # lapisan 10: detail dan marka, lalu bayangan
        for (x, y), nama in lapis.items():
            if 0 <= x < W and 0 <= y < H:
                g.im.alpha_composite(ubin(NOMOR[("tumpang", nama)]), (x * 16, y * 16))
    gambar = []
    for nama, x0, y0 in objek:
        fn, (w, h), potong, _, _, _ = OBJEK[nama]
        img = fn()
        atas, bawah = pisah(img, potong) if potong else (None, img)
        gambar.append((y0 + h, x0, y0, atas, bawah, potong or 0))
    for _, x0, y0, _, bawah, potong in sorted(gambar, key=lambda t: t[0]):     # lapisan 20
        g.paste(bawah, x0 * 16 - 1, y0 * 16 - 1 + potong)
    for spr, _, ax, ay, _ in sorted(pemain, key=lambda p: p[3]):               # lapisan 30
        g.paste(spr, ax - 8, ay - 21)
    for _, x0, y0, atas, _, _ in sorted(gambar, key=lambda t: t[0]):           # lapisan 40
        if atas:
            g.paste(atas, x0 * 16 - 1, y0 * 16 - 1)
    return g


def _pemain_contoh():
    return [_pemain(1, 72, 124, "bawah", "jalan", 1, tas="sun"), _pemain(4, 200, 204, tas="rose"),
            _pemain(2, 296, 172, "kanan", "jalan", 1, tas="mango"), _pemain(6, 424, 316, tas="teal"),
            _pemain(3, 248, 284, "atas", "jalan", 3, tas="coral"), _pemain(7, 392, 76, tas="leaf")]


def pratinjau_ubin_contoh():
    L = Lembar(1320, 920)
    L.judul("Kelompok U — Ubin per masa: contoh peta", "Sesi C · 6 Nov 2026 · Ditinjau · 40×24 ubin, siang (×2)")
    L.tempel(besar(render_peta(peta_contoh(), "siang", pemain=_pemain_contoh()), 2), 20, 70)
    L.label("Rumput · tanah setapak · paving gang · semen (trotoar, halaman sekolah) · aspal dengan garis dan "
            "zebra cross · pasir · air · air dalam", 660, 850)
    L.label("Bayangan rumah, garis lapangan, bunga, genangan, dan kerikil adalah ubin tumpang (lapisan 10). "
            "Avatar dari kelompok A.", 660, 876)
    return L.im


def pratinjau_ubin_masa():
    L = Lembar(1340, 960)
    L.judul("Kelompok U — Peta contoh dalam tiga masa (×1)", "Sesi C · 6 Nov 2026 · Ditinjau")
    peta, pemain = peta_contoh(), _pemain_contoh()
    for i, masa in enumerate(MASA):
        x, y = (20, 70) if i == 0 else (680, 70) if i == 1 else (20, 500)
        L.tempel(render_peta(peta, masa, pemain=pemain), x, y)
        L.label(NAMA_MASA[masa], x + 320, y + 392, "tebal")
    catatan = ["Yang berganti per masa:", "kilau: pagi #FFF1C9, siang putih, sore #FFE3A3",
               "bayangan: dusk, dusk, wood-d", "air: #9ED8F5, #6EC6F2, #FF9E6B",
               "pasir: #FFF1C9, cream, #FFE3A3", "marka: cream, putih, cream", "",
               "Tetap di ketiga masa:", "rumput leaf, tekstur grass, aspal slate,", "air dalam sky-d, tanah skin-2,",
               "paving wood, semen mist"]
    for j, t in enumerate(catatan):
        L.d.text((700, 520 + j * 26), t, font=L.f["tebal" if t.endswith(":") else "kecil"], fill=INK[:3])  # noqa: F405
    return L.im


def pratinjau_ubin_dekat():
    L = Lembar(1260, 430)
    L.judul("Kelompok U — Potongan dekat (×3, dengan garis pindai)", "Sesi C · 6 Nov 2026 · Ditinjau")
    peta, pemain = peta_contoh(), _pemain_contoh()
    potong = [("pagi", (16, 32, 144, 128), "Pagi: rumah, bayangan, gang paving"),
              ("siang", (224, 112, 352, 208), "Siang: jalan, zebra cross, trotoar"),
              ("sore", (416, 224, 544, 320), "Sore: pasir, air, air dalam")]
    for i, (masa, kotak, teks) in enumerate(potong):
        x = 20 + i * 412
        L.tempel(scanlines(render_peta(peta, masa, pemain=pemain).im.crop(kotak), k=3), x, 70)  # noqa: F405
        L.label(teks, x + 192, 370, "tebal")
    return L.im


def pratinjau_ubin_lembar():
    L = Lembar(1200, 880)
    L.judul("Kelompok U — Lembar ubin", f"{len(SUSUNAN)} ubin · 16 kolom · siang ×2, pagi dan sore ×1")
    L.tempel(besar(lembar_ubin("siang"), 2), 20, 70)
    blok = [("Rumput, ubin tumpang, varian kedua", 0)]
    blok += [(f"{b.replace('_', ' ')}: 47 ubin peralihan", NOMOR[("wilayah", (b, BLOB[0]))]) for b in WILAYAH]
    for teks, nomor in blok:
        y = 70 + (nomor // KOLOM) * 32
        L.d.line([(536, y + 2), (552, y + 2)], fill=DUSK[:3], width=2)            # noqa: F405
        L.d.text((558, y - 8), f"no. {nomor}: {teks}", font=L.f["kecil"], fill=INK[:3])  # noqa: F405
    for i, masa in enumerate(("pagi", "sore")):
        y = 70 + i * 400
        L.tempel(lembar_ubin(masa), 920, y); L.label(NAMA_MASA[masa], 1048, y + 388, "tebal")
    return L.im


# ---------------------------------------------------------------------------
# Pratinjau kelompok O1: bangunan penanda zona
# ---------------------------------------------------------------------------
def pratinjau_obj_lembar():
    L = Lembar(1440, 1440)
    L.judul("Kelompok O1 — Bangunan penanda zona (×2)", "Sesi C · disetujui 6 Nov 2026 · di atas rumput siang")
    m = MASA["siang"]
    x, y, tinggi_baris = 20, 70, 0
    for nama, (fn, (w, h), potong, _, _, lewat) in OBJEK.items():
        if KODE_OBJEK[nama] > "O-20":
            continue
        latar = C((w + 1) * 16, (h + 1) * 16)                                     # noqa: F405
        for ty in range(h + 1):
            for tx in range(w + 1):
                latar.paste(ubin_wilayah("air", 0, m) if lewat else ubin_rumput(m, (tx + ty) % 4), tx * 16, ty * 16)
        latar.paste(fn(), 7, 7)
        lebar, tinggi = max(latar.w * 2, 150), latar.h * 2 + 46
        if x + lebar > 1420:
            x, y, tinggi_baris = 20, y + tinggi_baris + 12, 0
        L.tempel(besar(latar, 2), x + (lebar - latar.w * 2) // 2, y)
        L.label(KODE_OBJEK[nama], x + lebar / 2, y + latar.h * 2 + 4, "tebal")
        L.label(nama.replace("_", " "), x + lebar / 2, y + latar.h * 2 + 24)
        x += lebar + 14
        tinggi_baris = max(tinggi_baris, tinggi)
    return L.im.crop((0, 0, 1440, min(1440, y + tinggi_baris + 20)))


def peta_kampung():
    W, H = 40, 26
    g = [["."] * W for _ in range(H)]

    def isi(x0, y0, x1, y1, ch):
        for yy in range(y0, y1 + 1):
            for xx in range(x0, x1 + 1):
                g[yy][xx] = ch

    isi(0, 11, 39, 11, "s"); isi(0, 15, 39, 15, "s")                  # trotoar
    isi(0, 12, 39, 14, "a"); isi(0, 13, 39, 13, "-"); isi(20, 12, 21, 14, "z")   # jalan dan zebra cross
    isi(4, 0, 5, 10, "p")                                             # gang paving (Z1)
    isi(12, 6, 27, 10, "s")                                           # halaman lobi sekolah (Z2)
    isi(28, 4, 39, 6, "s")                                            # halaman puskesmas dan kantor desa (Z7)
    isi(0, 16, 13, 25, "s")                                           # lantai pasar (Z4)
    isi(34, 16, 39, 25, "b"); isi(30, 16, 32, 25, "w")                # pasir dan sungai (Z6)
    for x, y, ch in ((10, 1, "*"), (11, 4, "+"), (25, 21, "*"), (27, 17, "^"), (24, 24, "+"), (33, 9, "^"),
                     (20, 22, "d"), (14, 24, "^"), (37, 9, "*")):
        g[y][x] = ch
    return ["".join(r) for r in g]


OBJEK_KAMPUNG = [("rumah_nara", 0, 1), ("rumah_a", 6, 1), ("rumah_b", 0, 6), ("warung_made", 6, 6),
                 ("halte", 9, 9), ("rambu_halte", 8, 9), ("sekolah", 14, 0), ("kantin", 24, 1),
                 ("tiang_bendera", 12, 6), ("gerbang_tutup", 17, 9), ("rambu_seberang", 22, 9),
                 ("puskesmas", 28, 0), ("kantor_desa", 34, 0), ("gerobak", 36, 5), ("warung_wifi", 29, 7),
                 ("angkot", 12, 12), ("tenda_a", 1, 17), ("tenda_b", 5, 17), ("los", 1, 21), ("gerobak", 9, 18),
                 ("bale", 15, 17), ("pos_ronda", 21, 17), ("jembatan_datar", 30, 19), ("kelapa", 35, 17),
                 ("kelapa", 26, 21)]


def _pemain_kampung():
    return [_pemain(1, 72, 140, "bawah", "jalan", 1, tas="sun"), _pemain(2, 328, 220, "kanan", "jalan", 1, tas="mango"),
            _pemain(3, 152, 296, "atas", "diam", 0, tas="coral"), _pemain(4, 248, 148, tas="rose"),
            _pemain(5, 504, 332, "kanan", "jalan", 3, tas="berry"), _pemain(6, 616, 380, tas="teal"),
            _pemain(7, 280, 364, tas="leaf"), _pemain(8, 520, 92, "bawah", "jalan", 1, tas="sky-d")]


def pratinjau_obj_peta():
    L = Lembar(1320, 970)
    L.judul("Kelompok O1 — Delapan zona di peta contoh", "Sesi C · disetujui 6 Nov 2026 · 40×26 ubin, siang (×2)")
    L.tempel(besar(render_peta(peta_kampung(), "siang", OBJEK_KAMPUNG, _pemain_kampung()), 2), 20, 70)
    L.label("Z1 rumah dan gang (kiri atas) · Z2 sekolah · Z7 puskesmas dan kantor desa · Z8 warung berwifi · "
            "Z3 jalan, halte, angkot", 660, 912)
    L.label("Z4 pasar (kiri bawah) · Z5 bale dan pos ronda · Z6 sungai, jembatan, dan pohon kelapa", 660, 936)
    return L.im


def pratinjau_obj_dekat():
    L = Lembar(1020, 760)
    L.judul("Kelompok O1 — Potongan dekat (×3)", "Sesi C · disetujui 6 Nov 2026 · dengan garis pindai")
    peta = render_peta(peta_kampung(), "siang", OBJEK_KAMPUNG, _pemain_kampung())
    potong = [((0, 0), "Z1 rumah Nara, rumah warga, warung Pak Made"), ((14, 0), "Z2 gedung SMP dan kantin"),
              ((28, 0), "Z7 puskesmas dan kantor desa"), ((14, 16), "Z5 bale dan pos ronda")]
    for i, ((tx, ty), teks) in enumerate(potong):
        x, y = 20 + (i % 2) * 500, 70 + (i // 2) * 340
        L.tempel(scanlines(peta.im.crop((tx * 16, ty * 16, tx * 16 + 160, ty * 16 + 96)), k=3), x, y)  # noqa: F405
        L.label(teks, x + 240, y + 294, "tebal")
    return L.im


# ---------------------------------------------------------------------------
# Pratinjau kelompok O2: objek umum
# ---------------------------------------------------------------------------
def _pagar_kotak(gaya, x0, y0, x1, y1, celah=()):
    """Ruas pagar keliling persegi panjang; celah = kolom di sisi bawah yang dibiarkan terbuka."""
    hasil = [(f"pagar_{gaya}_sudut_atas_kiri", x0, y0), (f"pagar_{gaya}_sudut_atas_kanan", x1, y0),
             (f"pagar_{gaya}_sudut_bawah_kiri", x0, y1), (f"pagar_{gaya}_sudut_bawah_kanan", x1, y1)]
    hasil += [(f"pagar_{gaya}_datar", x, y0) for x in range(x0 + 1, x1)]
    hasil += [(f"pagar_{gaya}_tegak", x, y) for x in (x0, x1) for y in range(y0 + 1, y1)]
    for x in range(x0 + 1, x1):
        if x in celah:
            continue
        jenis = "ujung_kanan" if x + 1 in celah else "ujung_kiri" if x - 1 in celah else "datar"
        hasil.append((f"pagar_{gaya}_{jenis}", x, y1))
    return hasil


def peta_o2():
    W, H = 30, 20
    g = [["."] * W for _ in range(H)]

    def isi(x0, y0, x1, y1, ch):
        for yy in range(y0, y1 + 1):
            for xx in range(x0, x1 + 1):
                g[yy][xx] = ch

    isi(0, 8, 29, 8, "s"); isi(0, 12, 29, 12, "s")                    # trotoar
    isi(0, 9, 29, 11, "a"); isi(0, 10, 29, 10, "-")                    # jalan
    isi(4, 5, 5, 7, "p")                                               # gang dari pintu rumah ke trotoar
    isi(18, 1, 27, 6, "s")                                             # halaman sekolah berpagar tembok
    isi(0, 16, 15, 17, "t")                                            # jalan setapak taman
    for x, y, ch in ((11, 2, "*"), (14, 6, "+"), (2, 14, "^"), (20, 15, "*"), (26, 18, "+"), (9, 19, "d")):
        g[y][x] = ch
    return ["".join(r) for r in g]


OBJEK_O2 = ([("rumah_nara", 3, 1)] + _pagar_kotak("bambu", 1, 0, 8, 6, celah=(4, 5)) +
            _pagar_kotak("sekolah", 17, 0, 28, 7, celah=(21, 22, 23, 24)) +
            [("gerbang_buka", 21, 6), ("tiang_bendera", 22, 2), ("pohon", 9, 0), ("pohon", 12, 3),
             ("semak", 10, 6), ("semak", 15, 4), ("semak", 7, 13), ("tiang_lampu", 3, 7), ("tiang_lampu", 14, 7),
             ("tiang_lampu", 26, 11), ("motor", 16, 12), ("motor", 19, 12), ("bangku", 3, 14), ("bangku", 9, 14),
             ("tempat_sampah", 6, 14), ("pohon", 12, 13), ("pohon", 18, 15), ("kelapa", 24, 14), ("semak", 16, 18)])


def pratinjau_obj2_peta():
    L = Lembar(1000, 760)
    L.judul("Kelompok O2 — Peta contoh", "Sesi C · disetujui 6 Nov 2026 · 30×20 ubin, siang (×2)")
    pemain = [_pemain(1, 72, 120, tas="sun"), _pemain(4, 232, 204, "kanan", "jalan", 1, tas="rose"),
              _pemain(6, 120, 276, tas="teal"), _pemain(2, 392, 72, "bawah", "jalan", 1, tas="mango")]
    L.tempel(besar(render_peta(peta_o2(), "siang", OBJEK_O2, pemain), 2), 20, 70)
    L.label("Pagar bambu mengelilingi rumah Nara, dengan celah di depan pintu; tembok sekolah dengan gerbang terbuka", 500, 712)
    L.label("Pohon, semak, lampu jalan, motor, bangku, dan tempat sampah", 500, 734)
    return L.im


def pratinjau_obj2_lembar():
    L = Lembar(1440, 720)
    L.judul("Kelompok O2 — Objek umum (×3)", "Sesi C · disetujui 6 Nov 2026 · di atas rumput siang")
    m = MASA["siang"]
    x, y = 20, 70
    for nama in ("pohon", "semak", "bangku", "tempat_sampah", "motor", "tiang_lampu"):
        fn, (w, h), _, _, _, _ = OBJEK[nama]
        latar = C((w + 1) * 16, (h + 1) * 16)                                     # noqa: F405
        for ty in range(h + 1):
            for tx in range(w + 1):
                latar.paste(ubin_rumput(m, (tx + ty) % 4), tx * 16, ty * 16)
        latar.paste(fn(), 7, 7)
        L.tempel(besar(latar, 3), x, y)
        L.label(KODE_OBJEK[nama], x + latar.w * 3 / 2, y + latar.h * 3 + 4, "tebal")
        L.label(nama.replace("_", " "), x + latar.w * 3 / 2, y + latar.h * 3 + 24)
        x += max(latar.w * 3, 130) + 30
    y = 330
    for i, gaya in enumerate(("bambu", "sekolah")):
        x = 20 + i * 710
        L.d.text((x, y), f"{KODE_OBJEK['pagar_' + gaya + '_datar']} pagar {gaya}: 8 ruas (×3) dan contoh susunan (×2)",
                 font=L.f["tebal"], fill=INK[:3])                                  # noqa: F405
        for j, jenis in enumerate(PAGAR):
            latar = C(32, 32)                                                      # noqa: F405
            for t in range(4):
                latar.paste(ubin_rumput(m, t), (t % 2) * 16, (t // 2) * 16)
            latar.paste(OBJEK[f"pagar_{gaya}_{jenis}"][0](), 7, 7)
            L.tempel(besar(latar, 3), x + (j % 4) * 104, y + 30 + (j // 4) * 150)
            L.label(jenis.replace("sudut_", "").replace("_", " "), x + (j % 4) * 104 + 48, y + 30 + (j // 4) * 150 + 100)
        peta = ["......", "......", "......", "......", "......"]
        contoh = _pagar_kotak(gaya, 0, 0, 5, 4, celah=(2, 3))
        L.tempel(besar(render_peta(peta, "siang", contoh), 2), x + 430, y + 40)
    return L.im


# ---------------------------------------------------------------------------
# Pratinjau kelompok T: penanda dan efek
# ---------------------------------------------------------------------------
NAMA_SKILL = {"sepatu": "Lari cepat", "kompas": "Kompas", "buku": "Petunjuk", "teropong": "Teropong (P1)",
              "karcis": "Angkot (P1)"}


def _latar_bahan(m):
    """Empat ubin contoh: rumput, aspal, semen, pasir (untuk memeriksa kontras penanda)."""
    c = C(64, 16)                                                                 # noqa: F405
    c.paste(ubin_rumput(m), 0, 0)
    for i, b in enumerate(("aspal", "semen", "pasir")):
        c.paste(ubin_wilayah(b, 0, m), 16 + i * 16, 0)
    return c


def pratinjau_tanda_lembar():
    L = Lembar(1440, 1240)
    L.judul("Kelompok T — Penanda dan efek (×8)", "Sesi C · disetujui 6 Nov 2026 · di atas rumput, aspal, semen, pasir")
    m = MASA["siang"]
    for i, (fn, teks) in enumerate(((tanda_kejadian, "T-01 kejadian belum diperiksa"),
                                    (tanda_dibuka, "T-02 dialog sedang terbuka"),
                                    (tanda_selesai, "T-03 kejadian selesai"))):
        x = 20 + i * 470
        latar = _latar_bahan(m)
        t = fn()
        for k in range(4):
            latar.paste(t, k * 16 + (16 - t.w) // 2, (16 - t.h) // 2)
        L.tempel(besar(latar, 7), x, 70)
        L.label(teks, x + 224, 186, "tebal")
    y = 230
    L.d.text((20, y), "T-04 sampai T-08 kotak bantuan: kecil, besar berkilau, biasa (bingkai 14×12)",
             font=L.f["tebal"], fill=INK[:3])                                      # noqa: F405
    for i, skill in enumerate(SKILL):
        x = 20 + i * 284
        for b in range(3):
            kotak = tanda_kotak(skill, b)
            latar = C(14, 12, LEAF)                                               # noqa: F405
            latar.paste(kotak, (14 - kotak.w) // 2, 12 - kotak.h)
            L.tempel(besar(latar, 6), x + b * 90, y + 34)
        L.label(NAMA_SKILL[skill], x + 130, y + 112, "tebal")
    y = 400
    L.d.text((20, y), "T-09 panah kompas: 8 arah × 2 bingkai denyut", font=L.f["tebal"], fill=INK[:3])   # noqa: F405
    for i, arah in enumerate(ARAH_KOMPAS):
        for b in range(2):
            latar = C(9, 9, LEAF)                                                 # noqa: F405
            latar.paste(tanda_kompas(arah, b), 1, 1)
            L.tempel(besar(latar, 8), 20 + i * 176 + b * 80, y + 34)
        L.label(arah.replace("_", " "), 20 + i * 176 + 76, y + 112)
    y = 580
    L.d.text((20, y), "T-10 panah diri (peta mini)", font=L.f["tebal"], fill=INK[:3])   # noqa: F405
    for i, arah in enumerate(ARAH_DIRI):
        latar = C(9, 9, LEAF)                                                     # noqa: F405
        latar.paste(tanda_diri(arah), 1, 1)
        L.tempel(besar(latar, 8), 20 + i * 100, y + 34)
        L.label(arah, 20 + i * 100 + 36, y + 112)
    L.d.text((480, y), "T-11 debu lari (2 bingkai)", font=L.f["tebal"], fill=INK[:3])   # noqa: F405
    for b in range(2):
        latar = C(10, 8, LEAF)                                                    # noqa: F405
        latar.paste(tanda_debu(b), 1, 1)
        L.tempel(besar(latar, 8), 480 + b * 100, y + 34)
    L.d.text((780, y), "T-12 kilau kotak (2 bingkai)", font=L.f["tebal"], fill=INK[:3])   # noqa: F405
    for b in range(2):
        latar = C(10, 10, LEAF)                                                   # noqa: F405
        latar.paste(tanda_kilau(b), 1, 1)
        L.tempel(besar(latar, 8), 780 + b * 100, y + 34)
    y = 760
    L.d.text((20, y), "Saat bermain (×3): kejadian, dialog terbuka, selesai, kotak, kilau, debu, panah kompas",
             font=L.f["tebal"], fill=INK[:3])                                      # noqa: F405
    L.tempel(besar(_adegan_tanda(), 3), 20, y + 34)
    catatan = ["Urutan bingkai di berkas:", "tanda_kompas: atas, kanan atas, kanan, kanan bawah,",
               "bawah, kiri bawah, kiri, kiri atas; 2 bingkai per arah", "tanda_diri: bawah, atas, kanan, kiri",
               "tanda_kotak_*: kecil, besar berkilau, biasa", "", "Kurangi gerak: penanda dan panah diam di",
               "bingkai pertama; kotak langsung bingkai biasa.", "",
               "Titik pemain di peta kelas digambar antarmuka", "dengan warna tas, tanpa berkas."]
    for j, t in enumerate(catatan):
        L.d.text((820, y + 40 + j * 26), t, font=L.f["tebal" if t.endswith(":") else "kecil"], fill=INK[:3])  # noqa: F405
    return L.im


def _adegan_tanda():
    """Potongan peta contoh dengan penanda, kotak, debu, dan kilau seperti saat bermain (siang)."""
    pemain = [_pemain(1, 232, 156, tas="sun"), _pemain(3, 300, 200, "kanan", "jalan", 1, tas="coral")]
    g = render_peta(peta_contoh(), "siang", pemain=pemain)
    g.paste(tanda_kejadian(), 296, 124)                     # kejadian belum diperiksa di dekat zebra cross
    g.paste(tanda_dibuka(), 226, 120)                        # pemain membuka dialog
    g.paste(tanda_selesai(), 380, 150)                       # kejadian yang sudah dijawab
    g.paste(tanda_kotak("sepatu", 2), 252, 214)               # kotak bantuan
    g.paste(tanda_kotak("kompas", 2), 196, 236)
    g.paste(tanda_kilau(0), 199, 228)
    g.paste(tanda_kotak("buku", 2), 330, 236)
    g.paste(tanda_debu(0), 283, 194)                         # debu di belakang pemain yang berlari
    g.paste(tanda_kompas("kanan_atas", 0), 410, 210)         # panah kompas (di tepi pandangan saat bermain)
    return _potong(g, (176, 112, 432, 256))


def _potong(g, kotak):
    c = C(kotak[2] - kotak[0], kotak[3] - kotak[1])                               # noqa: F405
    c.im.alpha_composite(g.im.crop(kotak))
    c.px = c.im.load()
    return c


def pratinjau_tanda_gerak():
    """GIF 2 detik (×3): gelembung naik-turun, kompas berdenyut, kotak pop dan kilau, debu, selesai, dibuka."""
    bingkai, lama = [], []
    for t in range(0, 2000, 80):
        sel = C(132, 22, LEAF)                                                    # noqa: F405
        naik = 0 if (t // 500) % 2 == 0 else -1
        sel.paste(tanda_kejadian(), 5, 6 + naik)
        sel.paste(tanda_kompas("kanan", (t // 500) % 2), 29, 8)
        pop = 0 if t < 80 else 1 if t < 160 else 2
        kotak = tanda_kotak("sepatu", pop)
        sel.paste(kotak, 44 + (14 - kotak.w) // 2, 16 - kotak.h)
        sel.paste(tanda_kilau((t // 250) % 2), 47, 2)
        sel.paste(tanda_debu((t // 120) % 2), 70, 10)
        sel.paste(tanda_selesai(), 92, 7 + naik)
        sel.paste(tanda_dibuka(), 112, 6 + naik)
        g = besar(sel, 3).convert("RGBA")
        im = Image.new("RGB", (g.width + 20, g.height + 20), CREAM[:3])           # noqa: F405
        im.paste(g, (10, 10), g)
        bingkai.append(im); lama.append(80)
    return bingkai, lama


# ---------------------------------------------------------------------------
# Pratinjau kelompok N1: tokoh Sehari Setara versi tampak atas
# ---------------------------------------------------------------------------
CIRI_NPC = {"nara": "poni, tas sun bertali mango", "ibu": "sanggul, daster rose", "gita": "kuncir coral, rok coral",
            "dimas": "cepak, jaket sky-d", "sinta": "kerudung putih", "ratih": "bob, kacamata, batik teal",
            "komang": "mangkuk, seragam kebesaran", "made": "kaus mango, sarung kotak", "bayu": "kaus mist, jin sky-d"}
NAMA_NPC = {"nara": "Nara", "ibu": "Ibu", "gita": "Gita", "dimas": "Dimas", "sinta": "Sinta", "ratih": "Bu Ratih",
            "komang": "Komang", "made": "Pak Made", "bayu": "Bayu"}


def _sehari(nama):
    """Sprite Sehari Setara yang sudah disetujui, sebagai pembanding ciri (dibaca dari tokoh.py tanpa diubah)."""
    import tokoh as T
    return {"nara": lambda: T.student("idle", 0), "ibu": lambda: T.mother("talk", 0), "gita": lambda: T.kid("idle"),
            "dimas": lambda: T.dimas("offer", 0), "sinta": lambda: T.sinta("idle", 0), "ratih": lambda: T.ratih("idle", 0),
            "komang": lambda: T.komang("idle", 0), "made": lambda: T.made("talk", 0),
            "bayu": lambda: T.bayu("idle", 0)}[nama]()


def pratinjau_npc1_ringkasan():
    L = Lembar(1440, 940)
    L.judul("Kelompok N1 — Tokoh Sehari Setara", "Sesi C · disetujui 6 Nov 2026 · kiri: Sehari Setara ×2 · kanan: Jejak Setara ×6")
    for i, nama in enumerate(NPC):
        x, y = 20 + (i % 5) * 284, 70 + (i // 5) * 290
        L.d.rectangle([x, y, x + 270, y + 270], outline=MIST[:3], width=2)        # noqa: F405
        lama = besar(_sehari(nama), 2)
        baru = besar(npc(nama, "diam", 0), 6)
        dasar = y + 196
        L.tempel(lama, x + 70 - lama.width // 2, dasar - lama.height)
        L.tempel(baru, x + 196 - baru.width // 2, dasar - baru.height)
        L.label(f"{KODE_NPC[nama]} {NAMA_NPC[nama]}", x + 135, y + 206, "tebal")
        L.label(CIRI_NPC[nama], x + 135, y + 230)
    x, y = 20 + 4 * 284, 70 + 290
    L.d.rectangle([x, y, x + 270, y + 270], outline=MIST[:3], width=2)            # noqa: F405
    L.d.text((x + 12, y + 10), "Pose khusus", font=L.f["tebal"], fill=INK[:3])     # noqa: F405
    motor = besar(npc("dimas", "motor", 0), 3)
    L.tempel(motor, x + 12, y + 46)
    L.label("Dimas di motor (×3)", x + 12 + motor.width // 2, y + 46 + motor.height + 4)
    tunduk = besar(npc("komang", "menunduk", 0), 4)
    L.tempel(tunduk, x + 200, y + 150)
    L.label("Komang menunduk (×4)", x + 135, y + 250)
    L.d.text((20, 670), "Ukuran bingkai dan titik kaki: siswa 16×24 (8, 21) · dewasa 16×26 (8, 23) · anak 14×20 (7, 17) · "
             "Dimas di motor 34×30 (17, 28). Diam 2 bingkai (bernapas).", font=L.f["kecil"], fill=INK[:3])   # noqa: F405
    L.d.text((20, 696), "Tokoh bukan pemain tidak bertas punggung, kecuali Nara (tas sun bertali mango, warna asli). "
             "Nama tokoh tidak ditulis di gambar.", font=L.f["kecil"], fill=INK[:3])   # noqa: F405
    return L.im.crop((0, 0, 1440, 730))


def _npc_di(nama, pose, x_kaki, y_kaki):
    """Entri render_peta untuk tokoh bukan pemain dengan titik kaki (x_kaki, y_kaki)."""
    jx, jy = (17, 28) if pose == "motor" else UKURAN_NPC[NPC[nama]["ukuran"]][1]
    spr = npc(nama, pose, 0)
    return (spr, spr, x_kaki - jx + 8, y_kaki - jy + 21, False)


def pratinjau_npc1_peta():
    L = Lembar(1320, 970)
    L.judul("Kelompok N1 — Tokoh di peta contoh", "Sesi C · disetujui 6 Nov 2026 · siang (×2)")
    tokoh = [_npc_di("nara", "diam", 44, 92), _npc_di("gita", "diam", 58, 94), _npc_di("ibu", "diam", 28, 158),
             _npc_di("made", "diam", 120, 158), _npc_di("dimas", "motor", 196, 186), _npc_di("komang", "menunduk", 404, 76),
             _npc_di("ratih", "diam", 312, 128), _npc_di("sinta", "diam", 300, 352), _npc_di("bayu", "diam", 62, 400),
             _pemain(5, 420, 210, "kanan", "jalan", 1, tas="berry"), _pemain(6, 250, 356, tas="teal")]
    L.tempel(besar(render_peta(peta_kampung(), "siang", OBJEK_KAMPUNG, tokoh), 2), 20, 70)
    L.label("Nara dan Gita di depan rumah (K-01) · Ibu · Pak Made di warung (K-02) · Dimas di motor dekat halte (K-05) · "
            "Komang menunduk di kantin (K-03)", 660, 912)
    L.label("Bu Ratih di halaman sekolah · Sinta di bale (K-09) · Bayu di pasar (K-07) · dua avatar pemain sebagai pembanding",
            660, 936)
    return L.im


# ---------------------------------------------------------------------------
# Pratinjau kelompok N2: warga dan tokoh baru
# ---------------------------------------------------------------------------
LABEL_N2 = {"warga1": ("N-10 warga 1", "kemeja sky-d"), "warga2": ("N-10 warga 2", "kerudung teal"),
            "warga3": ("N-10 warga 3", "rambut kelabu"), "nenek": ("N-11 nenek", "bertongkat"),
            "ibubayi": ("N-12 ibu", "gendong bayi"), "anak1": ("N-13 anak SD 1", "kaus kuning"),
            "anak2": ("N-13 anak SD 2", "kuncir dua"), "pedagang": ("N-14 pedagang", "caping, celemek"),
            "petugas": ("N-15 petugas", "puskesmas"), "polisi": ("N-16 polisi", "tanpa lambang"),
            "raka": ("N-17 Raka", "kursi roda"), "wayan": ("N-18 Wayan", "kaus leaf"),
            "siswa1": ("N-19 siswa 1", "rambut tergerai"), "siswa2": ("N-19 siswa 2", "rambut ikal"),
            "siswa3": ("N-19 siswa 3", "kerudung rose"), "siswa4": ("N-19 siswa 4", "dikuncir"),
            "siswa5": ("N-20 siswa 5", "seragam"), "siswa6": ("N-20 siswa 6", "seragam, rok")}


def pratinjau_npc2_ringkasan():
    L = Lembar(1440, 760)
    L.judul("Kelompok N2 — Warga dan tokoh baru (×5)", "Sesi C · disetujui 6 Nov 2026 · S1–S6 = siswa umum tanpa tas")
    sel = [(n, p) for n, ps in POSE_NPC2.items() for p in ps]
    for i, (nama, pose) in enumerate(sel):
        x, y = 20 + (i % 11) * 128, 70 + (i // 11) * 230
        g = besar(npc2(nama, pose, 0), 5)
        L.tempel(g, x + 60 - g.width // 2, y + 140 - g.height)
        judul, ciri = LABEL_N2[nama]
        kode, _, nama_pendek = judul.partition(" ")
        L.label(kode, x + 60, y + 148, "tebal")
        L.label(nama_pendek, x + 60, y + 168)
        L.label(ciri if pose in ("diam", "kursiroda") else f"pose {pose}", x + 60, y + 188)
    usulan = ["Usulan ciri untuk tokoh baru (Permintaan A-1 Sesi B), untuk Anda tetapkan:",
              "Raka: skin-3, rambut belah tengah hair-2, seragam, duduk di kursi roda; tangan di pelek roda.",
              "Wayan: skin-4, rambut belah tengah, kaus leaf, celana pendek cokelat, sandal (membantu gerobak orang tuanya).",
              "Siswa umum S1–S4 berbaju bebas (beragam kulit, rambut, dan kerudung rose); S5–S6 berseragam. Tidak ada yang bertas.",
              "Pose khusus: warga menunjuk tanpa kekerasan (K-07), siswa memegang HP (K-03, K-15, K-16), siswa menunduk (K-10)."]
    for j, t in enumerate(usulan):
        L.d.text((20, 540 + j * 28), t, font=L.f["tebal" if j == 0 else "kecil"], fill=INK[:3])   # noqa: F405
    return L.im


def _npc2_di(nama, pose, x_kaki, y_kaki):
    jx, jy = UKURAN_NPC[NPC2[nama]["ukuran"]][1]
    spr = npc2(nama, pose, 0)
    return (spr, spr, x_kaki - jx + 8, y_kaki - jy + 21, False)


def pratinjau_npc2_peta():
    L = Lembar(1320, 970)
    L.judul("Kelompok N2 — Tokoh di peta contoh", "Sesi C · disetujui 6 Nov 2026 · siang (×2)")
    tokoh = [_npc2_di("nenek", "diam", 340, 186), _npc2_di("polisi", "diam", 372, 250),
             _npc2_di("raka", "kursiroda", 372, 104), _npc2_di("siswa6", "diam", 392, 108),
             _npc2_di("siswa5", "hp", 430, 76), _npc2_di("ibubayi", "diam", 470, 92), _npc2_di("petugas", "diam", 488, 92),
             _npc2_di("wayan", "diam", 566, 104), _npc2_di("siswa1", "hp", 508, 170), _npc2_di("siswa4", "diam", 540, 172),
             _npc2_di("pedagang", "diam", 120, 330), _npc2_di("warga1", "menunjuk", 140, 330),
             _npc2_di("warga2", "diam", 100, 400), _npc2_di("siswa2", "menunduk", 338, 352),
             _npc2_di("warga3", "diam", 300, 352), _npc2_di("anak1", "diam", 430, 300), _npc2_di("anak2", "diam", 446, 302),
             _npc2_di("siswa3", "diam", 470, 380)]
    L.tempel(besar(render_peta(peta_kampung(), "siang", OBJEK_KAMPUNG, tokoh), 2), 20, 70)
    L.label("Nenek di zebra cross (K-06) · Raka di dekat tangga sekolah (K-04) · ibu menggendong bayi dan petugas di puskesmas "
            "(K-13) · Wayan di gerobak (K-14)", 660, 912)
    L.label("Siswa memegang HP di warung berwifi (K-15, K-16) · pedagang dan warga menunjuk di pasar (K-07) · siswa menunduk "
            "di bale (K-10) · anak SD (K-12)", 660, 936)
    return L.im


# ---------------------------------------------------------------------------
# Pratinjau kelompok O3: properti kejadian
# ---------------------------------------------------------------------------
O3 = ("pengeras_suara", "kotak_bekal", "kursi_roda", "tiang_kamera", "lapak", "dompet", "bangku_pasar", "pos_keamanan",
      "meja_panitia", "sisa_piknik", "bola", "tali_lompat", "bangku_antrean")
KEJADIAN_O3 = {"pengeras_suara": "K-02", "kotak_bekal": "K-03", "kursi_roda": "K-04", "tiang_kamera": "K-07",
               "lapak": "K-07", "dompet": "K-08", "bangku_pasar": "K-08", "pos_keamanan": "K-08",
               "meja_panitia": "K-09, K-10", "sisa_piknik": "K-11", "bola": "K-12", "tali_lompat": "K-12",
               "bangku_antrean": "K-13"}


def pratinjau_obj3_lembar():
    L = Lembar(1440, 660)
    L.judul("Kelompok O3 — Properti kejadian (×4)", "Sesi C · 6 Nov 2026 · Ditinjau")
    m = MASA["siang"]
    x, y, tinggi_baris = 20, 70, 0
    for nama in O3:
        fn, (w, h), _, _, _, _ = OBJEK[nama]
        latar = C((w + 1) * 16, (h + 1) * 16)                                     # noqa: F405
        for ty in range(h + 1):
            for tx in range(w + 1):
                latar.paste(ubin_wilayah("semen", 0, m) if nama in ("bangku_antrean", "pos_keamanan", "lapak",
                            "bangku_pasar", "tiang_kamera", "dompet") else ubin_rumput(m, (tx + ty) % 4), tx * 16, ty * 16)
        latar.paste(fn(), 7, 7)
        lebar = max(latar.w * 4, 150)
        if x + lebar > 1420:
            x, y, tinggi_baris = 20, y + tinggi_baris + 16, 0
        tinggi_baris = max(tinggi_baris, latar.h * 4 + 48)
        L.tempel(besar(latar, 4), x + (lebar - latar.w * 4) // 2, y)
        L.label(f"{KODE_OBJEK[nama]} · {KEJADIAN_O3[nama]}", x + lebar / 2, y + latar.h * 4 + 4, "tebal")
        L.label(nama.replace("_", " "), x + lebar / 2, y + latar.h * 4 + 24)
        x += lebar + 16
    return L.im.crop((0, 0, 1440, y + tinggi_baris + 12))


def _tokoh_di(jenis, nama, pose, x, y):
    return (_npc_di if jenis == "n1" else _npc2_di)(nama, pose, x, y)


SET_KEJADIAN = [   # (kejadian, keterangan, peta 7x5, objek, tokoh, posisi tanda "!")
    ("K-01", "Nara, Gita, teman di pagar", ["......."] * 5,
     [("pagar_bambu_datar", x, 1) for x in range(7)],
     [("n1", "nara", "diam", 36, 62), ("n1", "gita", "diam", 54, 64), ("n2", "siswa1", "diam", 76, 62)], (46, 30)),
    ("K-02", "Pak Made, Dimas, pengeras suara", ["......."] * 5, [("pengeras_suara", 4, 2)],
     [("n1", "made", "diam", 36, 58), ("n1", "dimas", "diam", 58, 60)], (40, 22)),
    ("K-03", "Komang menunduk, ada yang memotret", ["sssssss"] * 5, [],
     [("n1", "komang", "menunduk", 40, 58), ("n2", "siswa5", "hp", 64, 60), ("n2", "siswa6", "diam", 84, 58)], (56, 22)),
    ("K-04", "Raka dan teman sekelas", ["sssssss"] * 5, [],
     [("n2", "raka", "kursiroda", 44, 60), ("n2", "siswa2", "diam", 66, 60), ("n2", "siswa5", "diam", 86, 58)], (58, 22)),
    ("K-06", "Nenek di zebra cross", ["sssssss", "aaazaaa", "---z---", "aaazaaa", "sssssss"], [],
     [("n2", "nenek", "diam", 50, 76), ("n2", "siswa4", "diam", 74, 76)], (44, 46)),
    ("K-07", "Lapak, kamera, pedagang, warga", ["sssssss"] * 5, [("lapak", 1, 1), ("tiang_kamera", 5, 1)],
     [("n2", "pedagang", "diam", 30, 76), ("n1", "bayu", "diam", 58, 70), ("n2", "warga1", "menunjuk", 80, 72)], (54, 20)),
    ("K-08", "Dompet, bangku, pos keamanan", ["sssssss"] * 5,
     [("bangku_pasar", 0, 3), ("dompet", 2, 3), ("pos_keamanan", 4, 1)],
     [("n1", "nara", "diam", 50, 46), ("n2", "siswa2", "diam", 30, 46)], (36, 14)),
    ("K-09", "Sinta dan panitia di meja", ["......."] * 5, [("meja_panitia", 2, 2)],
     [("n1", "sinta", "diam", 36, 64), ("n2", "siswa4", "diam", 72, 64)], (52, 18)),
    ("K-11", "Sisa piknik di tepi sungai", [".......", ".......", ".......", "wwwwwww", "wwwwwww"],
     [("sisa_piknik", 1, 1), ("tempat_sampah", 5, 1)],
     [("n2", "siswa3", "diam", 58, 46), ("n2", "siswa4", "diam", 78, 46)], (44, 6)),
    ("K-12", "Bola dan tali lompat", ["ggggggg"] * 5, [("bola", 1, 3), ("tali_lompat", 5, 3)],
     [("n1", "gita", "diam", 40, 50), ("n2", "anak1", "diam", 60, 52), ("n2", "anak2", "diam", 82, 50)], (58, 16)),
    ("K-13", "Antrean puskesmas", ["sssssss"] * 5, [("bangku_antrean", 2, 1)],
     [("n2", "ibubayi", "diam", 36, 62), ("n2", "siswa5", "diam", 60, 70), ("n2", "petugas", "diam", 82, 62)], (58, 10)),
    ("K-14", "Wayan menjaga gerobak", ["sssssss"] * 5, [("gerobak", 2, 1)],
     [("n2", "wayan", "diam", 72, 52)], (60, 14)),
]


def pratinjau_obj3_set():
    L = Lembar(1440, 960)
    L.judul("Kelompok O3 — Set tokoh dan properti per kejadian (×3)", "Sesi C · 6 Nov 2026 · Ditinjau · tabel NASKAH.md")
    for i, (k, teks, peta, objek, tokoh, tanda) in enumerate(SET_KEJADIAN):
        x, y = 20 + (i % 4) * 352, 70 + (i // 4) * 296
        g = render_peta(peta, "siang", tuple(objek), [_tokoh_di(*t) for t in tokoh])
        g.paste(tanda_kejadian(), tanda[0], tanda[1])
        L.tempel(besar(g, 3), x, y)
        L.label(k, x + 168, y + 244, "tebal")
        L.label(teks, x + 168, y + 264)
    return L.im


PREVIEWS = {"uji_gaya": pratinjau_uji_gaya, "ava_ringkasan": pratinjau_ava_ringkasan,
            "ava_pose_semua": pratinjau_ava_pose_semua, "ubin_contoh": pratinjau_ubin_contoh,
            "ubin_masa": pratinjau_ubin_masa, "ubin_dekat": pratinjau_ubin_dekat,
            "ubin_lembar": pratinjau_ubin_lembar, "obj_lembar": pratinjau_obj_lembar,
            "obj_peta": pratinjau_obj_peta, "obj_dekat": pratinjau_obj_dekat,
            "obj2_lembar": pratinjau_obj2_lembar, "obj2_peta": pratinjau_obj2_peta,
            "tanda_lembar": pratinjau_tanda_lembar, "npc1_ringkasan": pratinjau_npc1_ringkasan,
            "npc1_peta": pratinjau_npc1_peta, "npc2_ringkasan": pratinjau_npc2_ringkasan,
            "npc2_peta": pratinjau_npc2_peta, "obj3_lembar": pratinjau_obj3_lembar,
            "obj3_set": pratinjau_obj3_set}
for _n in AVATAR:
    PREVIEWS[f"pose_ava_{_n}"] = (lambda n=_n: pratinjau_pose_avatar(n))
ANIMASI = {"ava_gerak": pratinjau_ava_gerak, "tanda_gerak": pratinjau_tanda_gerak}


def build_previews(preview_dir, only=None):
    preview_dir.mkdir(parents=True, exist_ok=True)
    for nama, fn in PREVIEWS.items():
        if only and nama not in only:
            continue
        fn().save(preview_dir / f"{nama}.png", optimize=True)
    for nama, fn in ANIMASI.items():
        if only and nama not in only:
            continue
        bingkai, lama = fn()
        bingkai[0].save(preview_dir / f"{nama}.gif", save_all=True, append_images=bingkai[1:],
                        duration=lama, loop=0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--preview", type=Path, default=DEFAULT_PREVIEW)
    ap.add_argument("--only", nargs="*", help="nama aset atau pratinjau tertentu saja")
    args = ap.parse_args()

    masalah, total = [], 0
    for nama, (folder, fn, ukuran) in ASSETS.items():
        if args.only and nama not in args.only:
            continue
        im = fn()
        im = im.im if isinstance(im, C) else im                                   # noqa: F405
        bad = palette_violations(im)                                              # noqa: F405
        if bad:
            masalah.append(f"{nama}: {bad} piksel di luar palet atau semi-transparan")
        if im.size != ukuran:
            masalah.append(f"{nama}: ukuran {im.size}, seharusnya {ukuran}")
        bocor = _kunci_tas_bocor(nama)
        if bocor:
            masalah.append(f"{nama}: {bocor} piksel warna kunci tas (sun/mango) di luar tas")
        out = args.out / folder / f"{nama}.png"
        out.parent.mkdir(parents=True, exist_ok=True)
        im.save(out, optimize=True)
        size = out.stat().st_size
        total += size
        if nama.startswith("ava_") and size > BATAS_STRIP:
            masalah.append(f"{nama}: {size} B, melebihi {BATAS_STRIP} B per strip")
        if nama.startswith("ubin_") and size > BATAS_UBIN:
            masalah.append(f"{nama}: {size} B, melebihi {BATAS_UBIN} B per lembar ubin")
        if nama.startswith("ubin_"):
            px = im.load()
            bolong = [i for i, (jenis, _) in enumerate(SUSUNAN) if jenis in ("rumput", "varian2", "wilayah")
                      and any(px[(i % KOLOM) * 16 + x, (i // KOLOM) * 16 + y][3] == 0
                              for y in range(16) for x in range(16))]
            if bolong:
                masalah.append(f"{nama}: ubin lapisan 0 berlubang (transparan) di nomor {bolong[:8]}")
        print(f"  {folder}/{nama}.png  {im.size[0]}x{im.size[1]}  {size} B")

    build_previews(args.preview, args.only)
    if not args.only:
        print(f"CREDITS.md: {tulis_kredit(args.out)} aset Disetujui")
    print(f"Total aset: {total / 1024:.1f} KB (anggaran aset layar pemain {BATAS_TOTAL / 1024 / 1024:.0f} MB)")
    if total > BATAS_TOTAL:
        masalah.append("Total ukuran aset melebihi anggaran")
    if masalah:
        print("MASALAH:")
        for m in masalah:
            print("  -", m)
        sys.exit(1)
    print("Semua pemeriksaan lulus.")


if __name__ == "__main__":
    main()
