"""Resep efek suara Jejak Setara (Design System bagian 12), satu fungsi per efek, dan daftar EFEK.

Bagian dari kit suara (usulan KT-C20 a). build_jejak.py membangun setiap efek di EFEK ke
app/jejak-setara/assets/sfx/{nama}.wav, lalu memeriksanya dengan chip.periksa dan chip.keras_lufs. Status setiap
efek ada di docs/jejak-setara/Daftar_Aset.md, bagian "Efek suara". Semua nada memakai tangga nada C mayor, seperti
klik (sekitar E6) dan bunyi teks (sekitar C5) Sehari Setara.

Setiap fungsi menerima puncak dalam dBFS (kunci chip.PUNCAK_DB). Puncak dipilih agar keras terdengar mendekati
sasaran usulan KT-C23 a: S-01 sampai S-04 sekitar -18 LUFS, S-05 dan S-06 sekitar -21 LUFS, S-07 sekitar -23 LUFS,
dan S-08 sekitar -16 LUFS. Puncak paling tinggi -3 dBFS.
"""
from chip import NADA, Not, PUNCAK_DB, rakit

LAMA_PENDEK = 0.65            # detik, efek pendek (usulan KT-C21 a)
BYTE_EFEK = 30 * 1024         # satu efek suara paling besar 30 KB (Architecture 11.3)


def sfx_kejadian(puncak):
    """S-01, kejadian pertama kali terlihat: dua nada naik pendek "pip-ting", G5 lalu C6 dengan jeda kecil.
    Segitiga, ditemani sedikit pulsa 25% agar tetap jelas di speaker HP."""
    nots = []
    for mulai, lama, nama, luruh, tahan, lepas in [(0.0, 0.045, "G5", 0.04, 0.4, 0.015),
                                                   (0.08, 0.12, "C6", 0.07, 0.0, 0.05)]:
        nots.append(Not("segitiga", mulai, lama, NADA[nama], serang=0.002, luruh=luruh, tahan=tahan, lepas=lepas))
        nots.append(Not("pulsa25", mulai, lama, NADA[nama], serang=0.002, luruh=luruh * 0.75, tahan=tahan * 0.75,
                        lepas=lepas, keras=0.18))
    return rakit(nots, saring_hz=5000.0, kutub=2, puncak=PUNCAK_DB[puncak])


def sfx_kotak(puncak):
    """S-02, ambil kotak: denting naik "tring". Pulsa 25% meluncur cepat dari A5 ke E6 lalu berdering, dengan
    segitiga satu oktaf di bawah dan kilau pulsa 12,5% di B6."""
    nots = [Not("pulsa25", 0.0, 0.30, (NADA["A5"], NADA["E6"]), luncur=0.035, serang=0.001, luruh=0.11,
                lepas=0.05, keras=0.8),
            Not("segitiga", 0.0, 0.30, (NADA["A4"], NADA["E5"]), luncur=0.035, serang=0.002, luruh=0.13,
                lepas=0.05, keras=0.5),
            Not("pulsa12", 0.035, 0.12, NADA["B6"], serang=0.002, luruh=0.05, lepas=0.04, keras=0.22)]
    return rakit(nots, saring_hz=5000.0, kutub=2, puncak=PUNCAK_DB[puncak])


def sfx_skill(puncak):
    """S-03, skill aktif: desir pendek "wus". Desis yang makin terang, ditemani segitiga yang meluncur naik
    dari E4 ke E5."""
    nots = [Not("derau", 0.0, 0.24, (1500.0, 7000.0), serang=0.07, luruh=0.15, tahan=0.3, lepas=0.10, keras=0.55),
            Not("segitiga", 0.02, 0.22, (NADA["E4"], NADA["E5"]), serang=0.04, luruh=0.15, tahan=0.4, lepas=0.08,
                keras=0.6)]
    return rakit(nots, saring_hz=5000.0, kutub=2, puncak=PUNCAK_DB[puncak])


def sfx_tepat(puncak):
    """S-04, jawaban tepat: arpeggio ceria C5-E5-G5-C6, 70 ms per nada. Melodi pulsa 25% (keluarga klik gaya A),
    ditemani segitiga satu oktaf di bawah agar hangat. Nada tidak bertumpuk, jadi tidak ada lonjakan di awal nada.
    Nada terakhir berdering dengan vibrato halus, lalu luruh. Resep sama dengan contoh Plan 21 November 2026."""
    nots = []
    urutan = ["C5", "E5", "G5", "C6"]
    jarak = 0.07
    for i, nama in enumerate(urutan):
        akhir = i == len(urutan) - 1
        hz = NADA[nama]
        if akhir:
            lama, lepas, luruh, tahan = 0.24, 0.09, 0.16, 0.0
        else:
            lama, lepas, luruh, tahan = 0.056, 0.014, 0.08, 0.55
        nots.append(Not("pulsa25", i * jarak, lama, hz, serang=0.003, luruh=luruh, tahan=tahan, lepas=lepas,
                        keras=0.7, getar=(5.5, 0.004) if akhir else None))
        nots.append(Not("segitiga", i * jarak, lama, hz / 2, serang=0.004, luruh=luruh * 1.2, tahan=tahan,
                        lepas=lepas, keras=0.5))
    return rakit(nots, saring_hz=5000.0, kutub=2, puncak=PUNCAK_DB[puncak])


def sfx_lembut(puncak):
    """S-05, kurang tepat atau berisiko: dua nada turun pelan seperti "hmm", G4 lalu E4, dengan awal lembut.
    Segitiga ditemani sedikit pulsa 50% yang disaring rendah, agar nada atasnya tetap terdengar di speaker HP
    tanpa dengung. Tanpa nada sumbang dan tanpa nada turun bertangga yang biasa menandai "gagal"."""
    nots = []
    for mulai, lama, nama, luruh, tahan, lepas in [(0.0, 0.17, "G4", 0.15, 0.5, 0.03),
                                                   (0.17, 0.20, "E4", 0.12, 0.0, 0.08)]:
        nots.append(Not("segitiga", mulai, lama, NADA[nama], serang=0.012, luruh=luruh, tahan=tahan, lepas=lepas))
        nots.append(Not("pulsa50", mulai, lama, NADA[nama], serang=0.012, luruh=luruh, tahan=tahan, lepas=lepas,
                        keras=0.25))
    return rakit(nots, saring_hz=2500.0, kutub=2, puncak=PUNCAK_DB[puncak])


def sfx_hitung(puncak):
    """S-06, hitung mundur: satu tik bersih per angka. Pulsa 50% di C6 yang tetap, berbeda dari klik yang
    berpulsa 25% dan nadanya turun."""
    nots = [Not("pulsa50", 0.0, 0.03, NADA["C6"], serang=0.001, luruh=0.02, lepas=0.02)]
    return rakit(nots, saring_hz=4500.0, kutub=2, puncak=PUNCAK_DB[puncak])


def sfx_peringatan(puncak):
    """S-07, dua menit terakhir: dua tik pelan dan tenang, segitiga di E5 dua kali."""
    nots = [Not("segitiga", t, 0.05, NADA["E5"], serang=0.003, luruh=0.03, lepas=0.02) for t in (0.0, 0.22)]
    return rakit(nots, saring_hz=4000.0, kutub=2, puncak=PUNCAK_DB[puncak])


class Efek:
    """Satu efek di daftar: ID di Daftar_Aset.md, fungsi resep, puncak (dBFS), sasaran keras terdengar (LUFS),
    dan batas lama serta ukuran berkas."""

    def __init__(self, kode, fungsi, puncak, sasaran, lama_maks=LAMA_PENDEK, byte_maks=BYTE_EFEK, lama_min=0.0):
        self.kode, self.fungsi, self.puncak, self.sasaran = kode, fungsi, puncak, sasaran
        self.lama_maks, self.byte_maks, self.lama_min = lama_maks, byte_maks, lama_min

    def bangun(self):
        return self.fungsi(self.puncak)


# Nama berkas tanpa .wav -> efek. S-08 (sfx_akhir) ditambahkan di giliran 2.
EFEK = {
    "sfx_kejadian": Efek("S-01", sfx_kejadian, puncak=-5.5, sasaran=-18.0),
    "sfx_kotak": Efek("S-02", sfx_kotak, puncak=-3.0, sasaran=-18.0),
    "sfx_skill": Efek("S-03", sfx_skill, puncak=-6.0, sasaran=-18.0),
    "sfx_tepat": Efek("S-04", sfx_tepat, puncak=-7.5, sasaran=-18.0),
    "sfx_lembut": Efek("S-05", sfx_lembut, puncak=-11.5, sasaran=-21.0),
    "sfx_hitung": Efek("S-06", sfx_hitung, puncak=-4.0, sasaran=-21.0),
    "sfx_peringatan": Efek("S-07", sfx_peringatan, puncak=-7.5, sasaran=-23.0),
}
