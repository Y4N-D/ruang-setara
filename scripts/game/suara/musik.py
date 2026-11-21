"""Musik latar layar kelas Jejak Setara (M-01, usulan KT-C26 a). Dipakai di JS-21 (P1, versi 1.1).

Satu lagu chiptune tenang 16 birama dalam tangga nada C mayor pentatonik, 100 ketukan per menit (38,4 detik), yang
berulang mulus. Semua nada selesai sedikit sebelum akhir lagu, jadi ujung lagu bersambung ke awalnya seperti jeda
napas di akhir kalimat musik, tanpa bunyi letup. Tiga suara: melodi pulsa 25% yang lembut, bas segitiga, dan ketukan
desis halus di antara ketukan. Dibuat dengan chip.py pada 11.025 sampel per detik, sehingga berkasnya sekitar 0,8 MB.

Bentuk lagu A A' B A'': tema (birama 1-4), tema yang naik lebih tinggi (5-8), bagian tengah yang lebih rendah dan
panjang nadanya (9-12), lalu tema kembali dan berhenti di C (13-16).
"""
from chip import NADA, Not, PUNCAK_DB, rakit

LAJU_MUSIK = 11025
KETUK = 0.6                      # detik per ketukan (100 ketukan per menit)
BIRAMA = 4 * KETUK               # empat ketukan per birama
PANJANG = 16 * BIRAMA            # 38,4 detik, tepat 423.360 sampel

# Melodi per birama: (nada, panjang dalam ketukan); None berarti diam. Setiap birama berjumlah 4 ketukan.
MELODI = [
    [("E5", 1), ("G5", 0.5), ("A5", 0.5), ("G5", 1), ("E5", 1)],     # 1  C
    [("A4", 1), ("C5", 0.5), ("D5", 0.5), ("E5", 2)],                  # 2  Am
    [("C5", 1), ("D5", 0.5), ("E5", 0.5), ("G5", 1), ("A5", 1)],     # 3  F
    [("G5", 1.5), ("E5", 0.5), ("D5", 2)],                             # 4  G
    [("E5", 1), ("G5", 0.5), ("A5", 0.5), ("C6", 1), ("A5", 1)],     # 5  C
    [("G5", 1), ("E5", 0.5), ("D5", 0.5), ("E5", 2)],                  # 6  Am
    [("A5", 1), ("G5", 0.5), ("E5", 0.5), ("D5", 1), ("C5", 1)],     # 7  F
    [("D5", 1.5), ("E5", 0.5), ("D5", 1), (None, 1)],                  # 8  G
    [("A4", 1), ("C5", 1), ("D5", 2)],                                 # 9  F
    [("D5", 1), ("E5", 1), ("G5", 2)],                                 # 10 G
    [("G5", 1), ("E5", 1), ("D5", 1), ("E5", 1)],                      # 11 Em
    [("A4", 2), ("C5", 1), ("D5", 1)],                                 # 12 Am
    [("E5", 1), ("G5", 0.5), ("A5", 0.5), ("G5", 1), ("E5", 1)],     # 13 C
    [("A4", 1), ("C5", 0.5), ("D5", 0.5), ("E5", 2)],                  # 14 Am
    [("G5", 1), ("E5", 0.5), ("D5", 0.5), ("D5", 2)],                  # 15 G
    [("C5", 4)],                                                       # 16 C, nada akhir yang luruh
]
AKOR = ["C", "Am", "F", "G", "C", "Am", "F", "G", "F", "G", "Em", "Am", "C", "Am", "G", "C"]
BAS = {"C": ("C3", "G3"), "Am": ("A2", "E3"), "F": ("F2", "C3"), "G": ("G2", "D3"), "Em": ("E2", "B2")}


def musik_kelas(puncak):
    nots = []
    # melodi: pulsa 25% lembut; nada panjang diberi getar halus; birama terakhir luruh sebelum lagu berulang
    for b, birama in enumerate(MELODI):
        t = b * BIRAMA
        for nama, ketuk in birama:
            lama = ketuk * KETUK
            if nama is not None:
                if b == len(MELODI) - 1:
                    nots.append(Not("pulsa25", t, 1.9, NADA[nama], serang=0.006, luruh=0.7, lepas=0.4, keras=0.45,
                                    getar=(5.0, 0.003)))
                else:
                    nots.append(Not("pulsa25", t, lama - 0.03, NADA[nama], serang=0.006, luruh=0.35, tahan=0.55,
                                    lepas=0.03, keras=0.45, getar=(5.0, 0.003) if ketuk >= 1.5 else None))
            t += lama
    # bas segitiga: akar akor di ketukan 1, nada kelima di ketukan 3; birama terakhir hanya akar yang luruh
    for b, akor in enumerate(AKOR):
        t = b * BIRAMA
        akar, kelima = BAS[akor]
        if b == len(AKOR) - 1:
            nots.append(Not("segitiga", t, 1.9, NADA[akar], serang=0.008, luruh=0.8, lepas=0.4, keras=0.9))
        else:
            nots.append(Not("segitiga", t, 1.1, NADA[akar], serang=0.008, luruh=0.4, tahan=0.45, lepas=0.08, keras=0.9))
            nots.append(Not("segitiga", t + 2 * KETUK, 1.0, NADA[kelima], serang=0.008, luruh=0.4, tahan=0.45,
                            lepas=0.08, keras=0.9))
    # ketukan desis halus di antara ketukan, birama 1-15
    for b in range(len(AKOR) - 1):
        for k in range(4):
            nots.append(Not("derau", b * BIRAMA + k * KETUK + KETUK / 2, 0.02, 9000.0, serang=0.001, luruh=0.015,
                            lepas=0.02, keras=0.10))
    ekor = PANJANG - max(n.selesai for n in nots)
    assert ekor > 0, "nada terakhir harus selesai sebelum lagu berulang"
    return rakit(nots, saring_hz=3500.0, kutub=2, ekor=ekor, puncak=PUNCAK_DB[puncak], laju=LAJU_MUSIK)
