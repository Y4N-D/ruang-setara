"""Alat bunyi chiptune Jejak Setara: gelombang, selubung, saringan, penulis WAV, pengukur keras, dan pemeriksaan.

Bagian dari kit suara (docs/jejak-setara/Daftar_Aset.md, bagian "Efek suara", usulan KT-C20 a). Resep setiap efek
ada di efek.py; build_jejak.py memanggil keduanya, sehingga `npx pnpm@11.25.0 assets:build:jejak` membangun gambar
dan suara sekaligus.

Hanya memakai pustaka bawaan Python. Perhitungan sampel hanya memakai tambah, kurang, kali, dan bagi, tanpa sin,
exp, pow, atau sum() bawaan (yang caranya menjumlah berubah sejak Python 3.12), sehingga WAV yang dihasilkan sama
byte demi byte di Windows, macOS, dan Linux. Modul math hanya dipakai pengukur keras, yang tidak mengubah isi berkas.

Gaya mengikuti bunyi Sehari Setara (app/sehari-setara/assets/sfx/): 22.050 sampel per detik, mono, 16 bit,
gelombang pulsa 25% tanpa geser DC (seperti klik gaya A) dan gelombang segitiga (seperti bunyi teks gaya B),
serangan cepat, dan luruh lembut. Gelombang dibuat 8 kali lebih rapat lalu dirata-rata, seperti cara sfxr, agar
nada tinggi tidak berdesis.
"""
import math
import struct
import wave

LAJU = 22050                 # sampel per detik, sama dengan klik dan bunyi teks Sehari Setara (KT-C21 a)
LEBIH = 8                    # sampel dalam per sampel keluaran (dirata-rata saat diturunkan)
LAJU_DALAM = LAJU * LEBIH
PENUH = 32767                # skala penuh 16 bit
PI = 3.141592653589793

# Sampel terbesar untuk setiap puncak dBFS, round(32767 * 10 ** (db / 20)), ditulis sebagai angka agar tidak perlu
# pow. Puncak paling tinggi -3 dBFS; puncak setiap efek mengikuti sasaran keras terdengarnya (KT-C23 a).
PUNCAK_DB = {
    -3.0: 23197, -3.5: 21900, -4.0: 20675, -4.5: 19518, -5.0: 18426, -5.5: 17395, -6.0: 16422, -6.5: 15504,
    -7.0: 14636, -7.5: 13818, -8.0: 13045, -8.5: 12315, -9.0: 11626, -9.5: 10976, -10.0: 10362, -10.5: 9782,
    -11.0: 9235, -11.5: 8718, -12.0: 8231, -12.5: 7770, -13.0: 7336, -13.5: 6925, -14.0: 6538, -14.5: 6172,
    -15.0: 5827,
}

# Tinggi nada: A4 = 440 Hz, tangga nada sama rata. Rasio satu semiton (2 pangkat 1/12) ditulis sebagai angka.
_SEMITON = 1.0594630943592953
_NAMA = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


def _tabel_nada():
    hz = {69: 440.0}                       # nomor MIDI 69 = A4
    for m in range(70, 109):
        hz[m] = hz[m - 1] * _SEMITON
    for m in range(68, 23, -1):
        hz[m] = hz[m + 1] / _SEMITON
    return {f"{_NAMA[m % 12]}{m // 12 - 1}": f for m, f in hz.items()}


NADA = _tabel_nada()                       # NADA["C5"] = 523,25 Hz


class Not:
    """Satu nada atau desir dalam satu suara.

    gelombang: "pulsa25", "pulsa12", "pulsa50", "segitiga", atau "derau" (desis).
    mulai, lama: detik. Bunyi berlangsung selama lama, lalu melepas selama lepas.
    hz: tinggi nada, atau (hz_awal, hz_akhir) untuk nada yang meluncur lurus. Untuk derau, hz mengatur seberapa
    cepat desis berganti nilai (makin tinggi, makin terang). luncur: detik meluncur dari hz_awal ke hz_akhir, lalu
    tetap di hz_akhir; None berarti meluncur selama lama.
    serang: detik naik dari 0 ke penuh. luruh: tetapan waktu (detik) luruh dari penuh menuju tahan; None berarti
    tetap penuh. tahan: tingkat akhir luruh (0 sampai 1). lepas: detik turun ke 0 sesudah lama.
    keras: 0 sampai 1. getar: (laju Hz, kedalaman) untuk vibrato segitiga, misalnya (5.5, 0.004).
    """

    def __init__(self, gelombang, mulai, lama, hz, serang=0.002, luruh=None, tahan=0.0, lepas=0.01,
                 keras=1.0, getar=None, luncur=None):
        self.gelombang, self.mulai, self.lama, self.hz = gelombang, mulai, lama, hz
        self.serang, self.luruh, self.tahan, self.lepas = serang, luruh, tahan, lepas
        self.keras, self.getar, self.luncur = keras, getar, luncur

    @property
    def selesai(self):
        return self.mulai + self.lama + self.lepas


def _bentuk(gelombang, fase, derau):
    """Nilai gelombang tanpa geser DC pada fase 0 sampai 1."""
    if gelombang == "segitiga":
        return 4.0 * (fase if fase < 0.5 else 1.0 - fase) - 1.0
    if gelombang == "derau":
        return derau
    lebar = {"pulsa12": 0.125, "pulsa25": 0.25, "pulsa50": 0.5}[gelombang]
    return (1.0 - lebar) if fase < lebar else -lebar      # rata-rata 0, seperti klik gaya A


def _isi(buf, n, laju_dalam=LAJU_DALAM):
    """Tambahkan satu not ke penyangga laju dalam."""
    a = int(n.mulai * laju_dalam + 0.5)
    b_lama = int((n.mulai + n.lama) * laju_dalam + 0.5)
    b = int(n.selesai * laju_dalam + 0.5)
    serang = max(1, int(n.serang * laju_dalam + 0.5))
    lepas = max(1, b - b_lama)
    # luruh eksponensial lewat kali berulang: faktor per sampel 1 - 1 / (tetapan x laju)
    q = 1.0 - 1.0 / (n.luruh * laju_dalam) if n.luruh else 1.0
    hz0, hz1 = n.hz if isinstance(n.hz, tuple) else (n.hz, n.hz)
    n_luncur = int(n.luncur * laju_dalam + 0.5) if n.luncur else b_lama - a
    langkah_hz = (hz1 - hz0) / max(1, n_luncur)
    getar_laju, getar_dalam = n.getar if n.getar else (0.0, 0.0)
    fase, getar_fase, lfsr, derau = 0.0, 0.0, 0x7FFF, 1.0
    tingkat, sisa = 1.0, 1.0
    for i in range(a, b):
        k = i - a
        hz = hz0 + langkah_hz * min(k, n_luncur)
        if getar_dalam:
            getar_fase += getar_laju / laju_dalam
            if getar_fase >= 1.0:
                getar_fase -= 1.0
            hz = hz * (1.0 + getar_dalam * (4.0 * (getar_fase if getar_fase < 0.5 else 1.0 - getar_fase) - 1.0))
        fase += hz / laju_dalam
        if fase >= 1.0:
            fase -= 1.0
            if n.gelombang == "derau":                      # desis berganti nilai sekali per periode
                bit = (lfsr ^ (lfsr >> 1)) & 1
                lfsr = (lfsr >> 1) | (bit << 14)
                derau = 1.0 if lfsr & 1 else -1.0
        # selubung: naik lurus, luruh eksponensial menuju tahan, lalu turun lurus ke 0
        if k < serang:
            sel = k / serang
        else:
            if n.luruh:
                sisa *= q
            tingkat = n.tahan + (1.0 - n.tahan) * sisa
            sel = tingkat
        if i >= b_lama:
            sel = tingkat * (b - i) / lepas
        buf[i] += n.keras * sel * _bentuk(n.gelombang, fase, derau)


def rakit(nots, saring_hz=6000.0, kutub=2, ekor=0.012, puncak=PUNCAK_DB[-3.0], masuk=0.002, keluar=0.008,
          laju=LAJU):
    """Rakit not menjadi daftar sampel 16 bit: campur, turunkan laju, saring, normalkan, dan pudarkan tepi.

    saring_hz: batas saringan lolos-rendah (melembutkan pulsa); kutub: jumlah saringan satu kutub yang dipasang
    berurutan (2 berarti lebih lembut di nada tinggi). ekor: detik sesudah not terakhir selesai, untuk sisa
    saringan. puncak: nilai sampel terbesar (PUNCAK_DB). masuk, keluar: detik pudar lurus di awal dan akhir,
    sehingga sampel pertama dan terakhir tepat 0 (tanpa bunyi letup). laju: sampel per detik keluaran (bawaan
    22.050; musik latar 11.025)."""
    akhir = max(n.selesai for n in nots) + ekor
    panjang = int(akhir * laju + 0.5)
    buf = [0.0] * (panjang * LEBIH)
    for n in nots:
        _isi(buf, n, laju * LEBIH)
    # turunkan laju: rata-rata setiap LEBIH sampel, dijumlah berurutan
    x = []
    for i in range(panjang):
        t = 0.0
        for v in buf[i * LEBIH:(i + 1) * LEBIH]:
            t += v
        x.append(t / LEBIH)
    # lolos-rendah satu kutub: a = w / (1 + w), w = 2 pi fc / laju
    w = 2.0 * PI * saring_hz / laju
    a = w / (1.0 + w)
    keluaran = x
    for _ in range(kutub):
        y, hasil = 0.0, []
        for v in keluaran:
            y += a * (v - y)
            hasil.append(y)
        keluaran = hasil
    # penahan DC: buang geser sisa dari selubung
    r, sebelum, yd = 0.995, 0.0, 0.0
    for i, v in enumerate(keluaran):
        yd = v - sebelum + r * yd
        sebelum = v
        keluaran[i] = yd
    # pudar tepi
    n_masuk = max(1, int(masuk * laju + 0.5))
    n_keluar = max(1, int(keluar * laju + 0.5))
    for i in range(n_masuk):
        keluaran[i] *= i / n_masuk
    for i in range(n_keluar):
        keluaran[panjang - 1 - i] *= i / n_keluar
    # normalkan ke puncak
    besar = max(abs(v) for v in keluaran)
    skala = puncak / besar
    sampel = [int(round(v * skala)) for v in keluaran]
    sampel[0] = sampel[-1] = 0
    return sampel


def tulis_wav(jalur, sampel, laju=LAJU):
    """WAV PCM mono 16 bit, kepala 44 byte tanpa potongan tambahan."""
    with wave.open(str(jalur), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(laju)
        w.writeframes(struct.pack("<%dh" % len(sampel), *sampel))


def baca_wav(jalur):
    with wave.open(str(jalur), "rb") as w:
        p = w.getparams()
        data = w.readframes(p.nframes)
    return p, list(struct.unpack("<%dh" % p.nframes, data))


# ---------------------------------------------------------------------------
# Pengukur keras terdengar (hanya untuk pemeriksaan; tidak mengubah isi berkas)
# ---------------------------------------------------------------------------

def _biquad(x, b, a):
    y, x1, x2, y1, y2 = [], 0.0, 0.0, 0.0, 0.0
    for v in x:
        o = b[0] * v + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2
        x2, x1, y2, y1 = x1, v, y1, o
        y.append(o)
    return y


def _bobot_k(x, fs):
    """Pembobotan K ITU-R BS.1770: rak tinggi (4 dB, Q 1/akar 2, 1.500 Hz), lalu lolos-tinggi (Q 0,5, 38 Hz)."""
    g, q, fc = 4.0, 1 / math.sqrt(2), 1500.0
    a_ = 10 ** (g / 40)
    w0 = 2 * math.pi * fc / fs
    al, c, s = math.sin(w0) / (2 * q), math.cos(w0), math.sqrt(a_)
    b0 = a_ * ((a_ + 1) + (a_ - 1) * c + 2 * s * al)
    b1 = -2 * a_ * ((a_ - 1) + (a_ + 1) * c)
    b2 = a_ * ((a_ + 1) + (a_ - 1) * c - 2 * s * al)
    a0 = (a_ + 1) - (a_ - 1) * c + 2 * s * al
    a1 = 2 * ((a_ - 1) - (a_ + 1) * c)
    a2 = (a_ + 1) - (a_ - 1) * c - 2 * s * al
    x = _biquad(x, [b0 / a0, b1 / a0, b2 / a0], [1, a1 / a0, a2 / a0])
    q, fc = 0.5, 38.0
    w0 = 2 * math.pi * fc / fs
    al, c = math.sin(w0) / (2 * q), math.cos(w0)
    a0 = 1 + al
    return _biquad(x, [(1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0], [1, -2 * c / a0, (1 - al) / a0])


def keras_lufs(sampel, fs=LAJU):
    """Keras terdengar terbesar dalam LUFS sesaat (jendela 400 ms, langkah 100 ms; makin mendekati 0, makin keras).
    Bunyi diberi diam 400 ms di belakang, sehingga bunyi pendek diukur dalam satu jendela utuh. Untuk bunyi sependek
    klik, angkanya beberapa dB lebih rendah daripada yang terdengar."""
    x = [v / 32768 for v in sampel] + [0.0] * int(0.4 * fs)
    k = _bobot_k(x, fs)
    jendela, loncat = int(0.4 * fs), int(0.1 * fs)
    terbesar = -200.0
    for awal in range(0, max(1, len(k) - jendela + 1), loncat):
        ms = sum(v * v for v in k[awal:awal + jendela]) / jendela
        if ms > 0:
            terbesar = max(terbesar, -0.691 + 10 * math.log10(ms))
    return terbesar


# ---------------------------------------------------------------------------
# Pemeriksaan satu berkas
# ---------------------------------------------------------------------------

def periksa(jalur, lama_maks, byte_maks, puncak, lama_min=0.0, laju=LAJU):
    """Daftar masalah satu berkas WAV (kosong bila lulus): format, kepala, lama, ukuran, puncak, tepi, DC, potong."""
    masalah = []
    with open(jalur, "rb") as f:
        mentah = f.read()
    p, s = baca_wav(jalur)
    nama = str(jalur).replace("\\", "/").split("/")[-1]
    if (p.nchannels, p.sampwidth, p.framerate, p.comptype) != (1, 2, laju, "NONE"):
        masalah.append(f"{nama}: bukan WAV PCM mono 16 bit {laju} Hz")
    if len(mentah) != 44 + 2 * len(s) or mentah[:4] != b"RIFF" or mentah[8:16] != b"WAVEfmt ":
        masalah.append(f"{nama}: kepala bukan 44 byte atau ada potongan tambahan")
    lama = len(s) / laju
    if not lama_min <= lama <= lama_maks:
        masalah.append(f"{nama}: {lama:.3f} detik, di luar {lama_min} sampai {lama_maks} detik")
    if len(mentah) > byte_maks:
        masalah.append(f"{nama}: {len(mentah)} byte, melebihi {byte_maks} byte")
    if max(abs(v) for v in s) != puncak:
        masalah.append(f"{nama}: puncak {max(abs(v) for v in s)}, seharusnya {puncak}")
    if s[0] != 0 or s[-1] != 0:
        masalah.append(f"{nama}: sampel pertama atau terakhir bukan 0 (bunyi letup)")
    n = laju // 1000                                       # 1 ms
    if max(abs(v) for v in s[:n]) > puncak // 2 or max(abs(v) for v in s[-n:]) > puncak // 2:
        masalah.append(f"{nama}: tepi awal atau akhir terlalu keras (bunyi letup)")
    if abs(sum(s) / len(s)) > PENUH * 0.002:
        masalah.append(f"{nama}: geser DC {sum(s) / len(s):.1f}")
    if any(v in (PENUH, -PENUH - 1) for v in s):
        masalah.append(f"{nama}: terpotong (clipping)")
    return masalah
