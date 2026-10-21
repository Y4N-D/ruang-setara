"""Latar adegan Sehari Setara (320x180, tanpa teks; tanpa tokoh kecuali ilustrasi akhir end_*).

Aturan: lantai kosong di y 130-170 untuk tokoh; hanya warna palet; cahaya memakai dither().
Latar yang sudah disetujui: bg_s1_rumah_pagi. Disetujui 21 Okt (Batch B1): bg_s2_jalan_pagi, bg_s3_kelas_siang.
Disetujui 21 Okt (Batch B2): bg_s4_koridor_siang, bg_s5_kampung_sore, bg_s6_kamar_malam.
Disetujui 21 Okt (Batch C): bg_title dan ilustrasi akhir end_setara, end_hampir, end_berat (memuat Nara duduk).
"""
from pixelart import *  # noqa: F401,F403
from tokoh import nara_duduk   # hanya untuk ilustrasi akhir


def bg_s1_rumah_pagi():
    c=C(320,180,S2)
    # dinding atas bergaris vertikal lembut (gaya acuan, versi cerah)
    for x in range(0,320,9): c.r(x,0,3,108,CREAM)
    # panel dinding bawah
    c.r(0,109,320,30,S3); c.hl(0,319,108,WOOD)
    for x in range(6,320,14): c.vl(x,110,138,WOOD)
    c.r(0,138,320,3,WOODD)
    # lantai kayu
    c.r(0,141,320,39,WOOD)
    for y in (150,162,175): c.hl(0,319,y,WOODD)
    for i,(y0,y1) in enumerate(((141,149),(151,161),(163,174),(176,179))):
        for x in range((i*23)%40,320,40): c.vl(x,y0,y1,WOODD)
    # cahaya pagi dari jendela di lantai (dither)
    for y in range(141,180):
        sh=(y-141)
        for x in range(30+sh,110+sh*2):
            if (x+y)%2==0 and c.px[x,y]==WOOD: c.p(x,y,SUN)
    # tirai + jendela
    c.hl(10,104,16,WOODD); c.hl(10,104,17,WOODD)
    c.r(20,22,76,72,WHITE)
    # langit pagi
    c.r(24,26,68,24,S1); c.r(24,50,68,14,S2); c.r(24,64,68,14,S3)
    c.disc(32,62,6,SUN); c.r(29,59,3,2,WHITE)
    # atap rumah & pohon di kejauhan
    c.r(24,78,68,12,LEAF)
    for x,w,h in ((26,10,8),(70,14,10)): c.r(x,78-h+6,w,h,GRASS)
    c.r(40,72,22,8,CORAL); c.r(44,69,14,3,CORAL); c.r(42,80,18,8,CREAM); c.r(49,83,4,5,WOODD)
    c.r(24,88,68,2,GRASS)
    # kusen
    c.r(56,26,3,64,WHITE); c.r(24,55,68,3,WHITE); c.vl(92,22,93,MIST); c.hl(20,95,93,MIST)
    c.r(16,92,84,3,WHITE); c.hl(16,99,95,MIST)
    # tanaman di ambang jendela
    c.r(72,86,9,6,CORAL); c.hl(72,80,86,MANGO)
    for (x,y) in ((74,82),(76,79),(78,82),(73,84),(79,84),(76,83)): c.r(x,y,2,3,LEAF)
    c.r(76,78,1,2,GRASS)
    # tirai
    for x0,x1 in ((10,21),(95,104)):
        c.r(x0,18,x1-x0+1,80,ROSE)
        for x in range(x0+2,x1,4): c.vl(x,18,97,CORAL)
    c.r(10,58,12,3,MANGO); c.r(95,58,10,3,MANGO)
    # jam dinding 06.15
    cx,cy=152,34; c.disc(cx,cy,9,WHITE); c.ring(cx,cy,9,INK)
    for (dx,dy) in ((0,-7),(7,0),(0,7),(-7,0)): c.p(cx+dx,cy+dy,INK)
    c.vl(cx,cy,cy+4,INK); c.hl(cx,cx+6,cy,CORAL)   # jarum jam ke 6, menit ke 3
    c.p(cx,cy,INK)
    # gambar anak berbingkai
    c.r(112,50,28,24,WOOD); c.r(114,52,24,20,CREAM)
    c.r(119,61,12,9,SUN); c.r(117,59,16,2,CORAL); c.r(119,57,12,2,CORAL); c.r(121,55,8,2,CORAL)
    c.r(123,64,3,6,WOODD); c.hl(114,137,70,LEAF); c.hl(114,137,71,GRASS); c.r(133,53,3,3,MANGO)
    # lemari atas dapur
    c.r(214,22,96,30,TEAL)
    for x in range(214,310,24): c.vl(x,22,51,GRASS)
    for x in range(232,310,24): c.r(x-4,36,2,3,WHITE)
    c.hl(212,311,52,WOODD)
    # ubin dinding dapur
    c.r(206,53,106,47,WHITE)
    for x in range(206,312,8): c.vl(x,53,99,MIST)
    for y in range(53,100,8): c.hl(206,311,y,MIST)
    # alat dapur tergantung
    for x,k in ((284,'s'),(292,'l'),(300,'s')):
        c.vl(x,54,62,SLATE)
        if k=='s': c.r(x-1,62,3,4,SLATE)
        else: c.r(x-2,62,5,3,SLATE); c.r(x-1,65,3,1,SLATE)
    # meja dapur
    c.r(204,100,110,4,MIST); c.hl(204,313,100,WHITE)
    c.r(206,104,106,35,TEAL)
    for x in range(206,312,26): c.vl(x,104,138,GRASS)
    for x in range(228,312,26): c.r(x-5,112,2,4,WHITE)
    # kompor + panci + uap
    c.r(222,94,34,6,SLATE); c.r(226,96,8,2,INK); c.r(244,96,8,2,INK)
    c.r(226,82,22,12,SLATE); c.hl(226,247,82,MIST); c.r(232,80,10,2,DUSK); c.r(235,78,4,2,DUSK)
    c.vl(227,84,92,MIST)
    for (x,y) in ((231,74),(232,72),(231,70),(232,68),(238,73),(239,71),(238,69),(239,67),(244,75),(245,73),(244,71)): c.p(x,y,SLATE)
    # penanak nasi
    c.r(264,86,22,14,WHITE); c.hl(264,285,86,MIST); c.r(266,84,18,2,MIST); c.r(273,91,4,3,INK)
    c.p(268,95,ROSE); c.p(282,95,ROSE); c.p(269,96,LEAF); c.p(281,96,LEAF)
    return c


# ---------------------------------------------------------------------------
# Batch B1 (disetujui 21 Okt): bg_s2_jalan_pagi, bg_s3_kelas_siang
# ---------------------------------------------------------------------------
def _sky(c,y0,bands):
    """Langit berpita dari atas ke bawah; tiap pergantian warna diberi 2 baris dither (bukan gradasi)."""
    y=y0
    for i,(col,h) in enumerate(bands):
        c.r(0,y,c.w,h,col)
        if i>0: c.dither(0,y,c.w,2,bands[i-1][0])
        y+=h
    return y


def _cloud(c,x,y,w):
    """Awan putih sederhana dengan sisi bawah datar."""
    c.r(x,y+3,w,4,WHITE); c.r(x+3,y+1,w-8,2,WHITE); c.r(x+6,y,w//3,1,WHITE)
    c.r(x+w-10,y+1,6,2,WHITE); c.hl(x+2,x+w-3,y+7,CREAM)


def _tree(c,x,y,r,leaf=LEAF,shade=GRASS,shade_side='right'):
    """Pohon bulat: tajuk (dua lingkaran) + batang; sisi yang membelakangi matahari diberi bayangan dither."""
    c.r(x-1,y+r-2,3,r+4,WOODD)
    c.disc(x,y,r,leaf); c.disc(x+r-2,y+2,r-2,leaf)
    for yy in range(y-r,y+r+3):
        for xx in range(x-r,x+2*r):
            far=(xx-x)>r//2 if shade_side=='right' else (xx-x)<0
            if 0<=xx<c.w and 0<=yy<c.h and c.px[xx,yy]==leaf and far and (xx+yy)%2==0:
                c.p(xx,yy,shade)


def bg_s2_jalan_pagi():
    """Adegan 2 (06.50): tepi jalan dekat sekolah. Tokoh berdiri di bahu jalan (y 156) antara kerb
    hitam-putih dan marka tepi; trotoar di belakangnya; sekolah berpagar dengan tiang bendera; rambu zona
    sekolah tanpa tulisan; angkot kecil di jalan cabang yang menjauh ke arah matahari terbit.
    Lantai y 130-170 kosong."""
    c=C(320,180,PAGI2)
    _sky(c,0,((PAGI1,36),(PAGI2,32),(PAGI3,32)))
    c.disc(102,78,8,SUN); c.r(98,74,3,2,WHITE)                                  # matahari pagi di ujung jalan
    _cloud(c,40,14,30); _cloud(c,214,10,38); _cloud(c,274,32,24)
    # bukit dan pepohonan jauh
    for x,r in ((0,14),(26,11),(52,13),(80,9),(124,9),(146,10),(300,13),(318,10)):
        c.disc(x,92,r,GRASS)
    c.r(0,92,320,8,GRASS)
    # tanah berumput di depan rumah dan pagar (di belakang trotoar)
    c.r(0,100,320,16,LEAF); c.dither(0,100,320,16,GRASS,only=LEAF)
    # --- kiri: rumah warga ---
    c.r(6,74,56,30,MIST)                                                        # dinding di sisi teduh (matahari di ujung jalan)
    for i in range(10): c.hl(13-i,54+i,64+i,WOODD if i in (0,9) else CORAL)     # atap genteng (bawah lebih lebar)
    c.hl(4,63,74,WOODD)
    c.r(12,82,14,12,WHITE); c.r(13,83,12,10,PAGI1); c.vl(18,83,92,WHITE); c.hl(13,24,87,WHITE)   # jendela
    c.r(36,82,10,22,WOOD); c.p(44,93,SUN)                                       # pintu
    c.r(52,84,6,8,WHITE); c.r(53,85,4,6,PAGI1)
    c.r(0,104,64,2,WOODD); c.r(0,106,64,10,WOOD)                                # pagar kayu rendah rumah
    for x in range(2,64,6): c.vl(x,106,115,WOODD)
    _tree(c,74,86,9,shade_side='left')                                          # sisi kanan menghadap matahari
    # --- jalan cabang yang menjauh + angkot kecil di kejauhan ---
    def side(y):
        t=(y-100)/35
        return int(98-t*30),int(106+t*30)
    for y in range(100,136):
        x0,x1=side(y)
        c.hl(x0,x1,y,SLATE); c.p(x0,y,MIST); c.p(x1,y,MIST)                     # aspal + tepi jalan
    for y in range(104,134,6): c.vl(102,y,y+2,WHITE)                            # marka putus-putus
    c.r(97,102,10,7,SKYD); c.r(98,103,8,2,SIANG3); c.hl(97,106,105,WHITE)      # angkot (tampak depan)
    c.p(98,107,SUN); c.p(105,107,SUN); c.r(97,109,2,1,INK); c.r(105,109,2,1,INK)
    # --- kanan: gedung sekolah ---
    c.r(150,72,170,32,CREAM)
    for i in range(12): c.hl(157-i,320,60+i,WOODD if i in (0,11) else CORAL)    # atap genteng panjang (bawah lebih lebar)
    for x in range(160,320,22):                                                 # jendela kelas
        if 222<=x<=244: continue
        c.r(x,78,14,16,WHITE); c.r(x+1,79,12,14,PAGI1); c.vl(x+7,79,92,WHITE); c.r(x+1,86,12,1,WHITE)
        c.dither(x+1,79,6,6,SIANG3,only=PAGI1)                                  # pantulan
    c.r(226,80,20,24,WOOD); c.vl(236,80,103,WOODD); c.p(234,92,SUN); c.p(238,92,SUN)   # pintu ganda
    c.hl(150,319,103,MIST)
    # tiang bendera di halaman; kakinya tertutup taman kecil agar tiang tidak tampak menancap di kepala tokoh
    c.vl(140,26,90,MIST); c.vl(141,26,90,SLATE); c.p(140,25,SUN)
    c.r(142,28,10,3,CORAL); c.r(142,31,10,3,WHITE)                              # bendera merah putih
    for (x,y,r) in ((133,92,5),(141,89,6),(149,92,5)): c.disc(x,y,r,LEAF)
    c.dither(128,84,28,12,GRASS,only=LEAF)
    for (x,y) in ((134,90),(145,88),(139,93)): c.p(x,y,ROSE)                    # bunga
    # pagar sekolah: dinding rendah + jeruji
    c.r(124,108,196,8,WHITE); c.hl(124,319,108,MIST); c.hl(124,319,115,MIST)
    c.hl(124,319,96,TEAL)
    for x in range(126,320,4): c.vl(x,96,107,TEAL)
    for x in range(124,320,40): c.r(x,92,4,24,CREAM); c.hl(x,x+3,92,WHITE)      # tiang pagar
    # --- trotoar ---
    c.r(0,116,320,16,MIST)
    for y in (116,123): c.hl(0,319,y,SLATE)
    for i,(y0,y1) in enumerate(((117,122),(124,131))):
        for x in range((i*5)%10,320,10): c.vl(x,y0,y1,SLATE)
    c.dither(0,124,320,8,WHITE,only=MIST)                                       # cahaya pagi di trotoar
    for y in range(116,136):                                                    # jalan cabang memotong trotoar
        x0,x1=side(y); c.hl(x0,x1,y,SLATE); c.p(x0,y,MIST); c.p(x1,y,MIST)
    # --- kerb hitam-putih (terputus di mulut jalan cabang) ---
    for y in range(132,136):
        x0,x1=side(y)
        for x in range(320):
            if not (x0<=x<=x1): c.p(x,y,INK if (x//8)%2==0 else WHITE)
    # --- jalan aspal (tempat tokoh berdiri) ---
    c.r(0,136,320,44,SLATE)
    c.dither(0,136,320,3,DUSK)                                                  # bayangan kerb
    # marka tepi di depan tokoh: tokoh berdiri di bahu jalan dekat kerb, bukan di lajur kendaraan;
    # di depan mulut jalan cabang markanya putus-putus
    for x in range(320):
        if not (60<=x<=147) or x%8<4: c.p(x,167,WHITE); c.p(x,168,WHITE)
    for (x,y) in ((24,150),(70,161),(131,147),(188,162),(247,151),(296,159),(160,175),(40,174),(222,177)):
        c.p(x,y,DUSK); c.p(x+1,y,DUSK)                                          # tekstur aspal
    # --- rambu zona sekolah tanpa tulisan: belah ketupat kuning, piktogram dua orang berjalan ---
    c.vl(299,88,131,SLATE); c.vl(300,88,131,MIST)
    cx,cy=300,78
    for dy in range(-10,11):
        w=10-abs(dy)
        c.hl(cx-w,cx+w,cy+dy,SUN); c.p(cx-w,cy+dy,INK); c.p(cx+w,cy+dy,INK)
    c.r(cx-4,cy-5,2,2,INK); c.r(cx-4,cy-2,2,4,INK); c.p(cx-5,cy+2,INK); c.p(cx-2,cy+2,INK); c.p(cx-5,cy+3,INK); c.p(cx-2,cy+3,INK)
    c.r(cx+2,cy-2,2,2,INK); c.r(cx+2,cy+1,2,2,INK); c.p(cx+1,cy+3,INK); c.p(cx+4,cy+3,INK)
    c.p(cx-2,cy-1,INK); c.p(cx+1,cy,INK)                                        # dua orang bergandengan
    return c


def _group_table(c,x0,x1,y=118):
    """Meja kelompok: dua meja digabung, kursi di belakang (sandaran terlihat) dan di depan; buku di atas meja.
    Kaki meja dan kursi berakhir di plint (y 140) sehingga berdiri di lantai, tidak melayang di dinding."""
    for x in (x0+6,x1-18):                                                       # sandaran kursi belakang
        c.r(x,y-12,12,3,WOOD); c.vl(x,y-12,y-1,WOODD); c.vl(x+11,y-12,y-1,WOODD)
    c.r(x0,y,x1-x0+1,3,WOOD); c.hl(x0,x1,y+3,WOODD)                             # daun meja
    c.vl((x0+x1)//2,y,y+3,WOODD)                                                 # sambungan dua meja
    for x in (x0+1,x1-1,(x0+x1)//2-1,(x0+x1)//2+1): c.vl(x,y+4,y+22,WOODD)      # kaki meja
    c.r(x0+8,y-3,10,3,SKYD); c.hl(x0+8,x0+17,y-3,SIANG1)                        # buku
    c.r(x0+22,y-2,12,2,WHITE); c.p(x0+24,y-2,MIST)                             # kertas kerja kelompok
    c.r(x1-16,y-3,8,3,ROSE); c.r(x1-26,y-2,6,2,SUN)                             # buku + kotak pensil
    for x in (x0+4,x1-16):                                                       # kursi depan (lebih rendah)
        c.r(x,y+10,12,2,WOOD); c.vl(x+1,y+12,y+22,WOODD); c.vl(x+10,y+12,y+22,WOODD)


def bg_s3_kelas_siang():
    """Adegan 3 (09.00): ruang kelas siang. Papan tulis kosong, jam 09.00, jendela langit siang dengan
    cahaya berpola papan catur di lantai, papan pajangan tanpa tulisan, dua meja kelompok di kiri dan kanan,
    tanaman pot di sudut kiri. Tengah lantai kosong untuk Nara dan Sinta; Bu Ratih bisa berdiri dekat meja kanan."""
    c=C(320,180,SIANG3)
    for x in range(0,320,9): c.r(x,0,3,104,WHITE)                               # dinding bergaris lembut
    c.r(0,105,320,33,SIANG1); c.hl(0,319,104,SKYD)                             # dinding bawah
    for x in range(6,320,14): c.vl(x,106,137,SIANG2)
    c.r(0,138,320,3,SKYD)                                                       # plint
    # lantai keramik
    c.r(0,141,320,39,MIST)
    for y in (150,162,175): c.hl(0,319,y,SIANG2)
    for x in range(12,320,24): c.vl(x,141,179,SIANG2)
    c.dither(0,141,320,39,WHITE,only=MIST)                                      # cahaya jendela (dibatasi di bawah)
    for y in range(141,180):                                                    # kembalikan pola, sisakan cahaya jendela
        for x in range(320):
            if c.px[x,y]==WHITE:
                sh=y-141
                if not (210-sh*2<=x<=290-sh): c.p(x,y,MIST)
    # papan tulis kosong
    c.r(94,24,132,62,WOOD); c.r(97,27,126,56,GRASS); c.hl(97,222,27,LEAF)       # papan tulis kosong + kilap tepi atas
    c.r(92,86,136,3,WOOD); c.hl(92,227,88,WOODD)                                # tempat kapur
    c.r(110,84,6,2,WHITE); c.r(120,85,3,1,WHITE); c.r(204,83,10,3,WOODD); c.r(204,83,10,1,MANGO)   # kapur + penghapus
    # jam dinding 09.00 (jarum pendek ke 9, jarum panjang ke 12)
    cx,cy=160,12; c.disc(cx,cy,7,WHITE); c.ring(cx,cy,7,INK)
    for (dx,dy) in ((0,-5),(5,0),(0,5),(-5,0)): c.p(cx+dx,cy+dy,INK)
    c.hl(cx-4,cx,cy,INK); c.vl(cx,cy-5,cy,CORAL); c.p(cx,cy,INK)
    # papan pajangan tanpa tulisan
    c.r(16,30,62,44,WOOD); c.r(18,32,58,40,PAGI3)
    for (x,y,w,h,col) in ((22,36,14,10,SUN),(40,34,12,14,LEAF),(56,38,16,10,ROSE),(24,52,18,14,SKYD),
                          (46,54,10,12,WHITE),(60,52,12,14,MANGO)):
        c.r(x,y,w,h,col); c.p(x+w//2,y,CORAL)                                   # kertas + paku tekan
    # jendela kanan dengan langit siang
    for wx in (248,282):
        c.r(wx,20,32,72,WHITE)
        c.r(wx+3,23,26,22,SIANG1); c.r(wx+3,45,26,22,SIANG2); c.r(wx+3,67,26,22,SIANG3)
        c.vl(wx+15,23,88,WHITE); c.hl(wx+3,wx+28,56,WHITE)
    _cloud(c,252,28,22)
    glass={SIANG1,SIANG2,SIANG3}
    tree=C(320,180); tree.disc(300,80,10,LEAF); tree.disc(289,84,8,LEAF); tree.dither(296,70,16,24,GRASS,only=LEAF)
    tree.r(282,88,30,1,GRASS)
    for y in range(60,90):                                                      # pohon di luar, hanya terlihat di kaca
        for x in range(279,312):
            if tree.px[x,y][3] and c.px[x,y] in glass: c.p(x,y,tree.px[x,y])
    c.r(244,92,72,3,WHITE); c.hl(244,315,95,MIST)                               # ambang jendela
    # tanaman lidah mertua di sudut kiri (bukan di ambang jendela, agar tidak tampak bertengger di kepala tokoh)
    for (x,top) in ((2,112),(4,102),(6,96),(8,104),(10,99)):
        c.p(x,top,LEAF); c.r(x,top+1,2,128-top-1,LEAF); c.vl(x+1,top+2,127,GRASS)
    c.r(1,128,13,2,MANGO); c.r(2,130,11,10,CORAL); c.vl(11,130,139,WOODD)       # pot tanah liat
    # dua meja kelompok di belakang
    _group_table(c,18,98)
    _group_table(c,222,302)
    return c


# ---------------------------------------------------------------------------
# Batch B2 (disetujui 21 Okt): bg_s4_koridor_siang, bg_s5_kampung_sore, bg_s6_kamar_malam
# ---------------------------------------------------------------------------
def _hanging_pot(c, x, y0=12, drop=8):
    """Pot gantung dari balok selasar: tali bercabang tiga, pot tanah liat, daun menjuntai (di atas tinggi kepala)."""
    py = y0 + drop
    c.vl(x, y0, py - 1, WOODD)
    for i in range(drop // 2, drop):                                    # tali bercabang ke tepi pot
        k = i - drop // 2 + 1
        c.p(x - k, y0 + i, WOODD); c.p(x + k, y0 + i, WOODD)
    c.r(x - 5, py, 11, 2, MANGO); c.r(x - 4, py + 2, 9, 4, CORAL); c.r(x - 3, py + 6, 7, 1, CORAL)
    c.vl(x + 3, py + 2, py + 5, WOODD); c.p(x + 2, py + 6, WOODD)
    c.r(x - 4, py - 2, 9, 2, LEAF); c.r(x - 2, py - 3, 4, 1, LEAF); c.p(x + 1, py - 2, GRASS)   # daun di atas bibir pot
    for (dx, h) in ((-6, 9), (-4, 13), (5, 11), (7, 7)):                 # sulur menjuntai
        xx = x + dx
        c.vl(xx, py, py + h, LEAF)
        for yy in range(py + 2, py + h, 3): c.p(xx + (1 if dx > 0 else -1), yy, LEAF); c.p(xx, yy + 1, GRASS)


def _floor_plant(c, x, base=140):
    """Tanaman daun lebar dalam pot di kaki dinding (berdiri di plint)."""
    c.r(x, base - 13, 14, 2, MANGO); c.r(x + 1, base - 11, 12, 12, CORAL); c.vl(x + 11, base - 11, base, WOODD)
    for (cx, cy, r) in ((x + 4, base - 22, 6), (x + 10, base - 25, 6), (x + 7, base - 32, 6), (x + 2, base - 30, 4), (x + 12, base - 18, 4)):
        c.disc(cx, cy, r, LEAF)
    for yy in range(base - 40, base - 12):
        for xx in range(x - 4, x + 19):
            if 0 <= xx < c.w and c.px[xx, yy] == LEAF and (xx - x) > 7 and (xx + yy) % 2 == 0:
                c.p(xx, yy, GRASS)
    for (cx, cy) in ((x + 7, base - 24), (x + 4, base - 30), (x + 10, base - 18)):
        c.p(cx, cy, GRASS); c.p(cx + 1, cy + 1, GRASS)                      # tulang daun


def bg_s4_koridor_siang():
    """Adegan 4 (10.15): selasar sekolah di dekat kantin. Di antara tiang terlihat halaman dan gedung seberang
    di bawah langit siang; papan pengumuman tanpa tulisan; tanaman pot dan pot gantung; jendela layan kantin
    dengan jajanan polos tanpa merek. Komang dapat berdiri sendiri di kiri (di antara dua pot), Nara di dekat
    kantin. Lantai y 130-170 kosong."""
    c = C(320, 180, CREAM)
    # --- pemandangan halaman di balik selasar (terlihat di antara tiang) ---
    _sky(c, 0, ((SIANG1, 40), (SIANG2, 30), (SIANG3, 30)))
    _cloud(c, 140, 30, 18); _cloud(c, 172, 50, 22)
    c.r(0, 74, 320, 8, CORAL); c.hl(0, 319, 74, WOODD); c.r(0, 82, 320, 16, CREAM)   # atap & dinding gedung seberang
    for x in range(4, 320, 16): c.r(x, 85, 8, 9, SIANG1); c.vl(x + 4, 85, 93, WHITE)
    for (x, r) in ((120, 10), (138, 8), (176, 9), (200, 11), (218, 7)): c.disc(x, 92, r, GRASS)
    for (x, r) in ((128, 6), (190, 7), (210, 5)): c.disc(x, 89, r, LEAF)
    c.r(0, 96, 320, 16, LEAF); c.dither(0, 96, 320, 16, GRASS, only=LEAF)
    # --- balok atap selasar ---
    c.r(0, 0, 320, 10, WHITE); c.hl(0, 319, 10, MIST); c.hl(0, 319, 11, SLATE)
    for x in range(0, 320, 40): c.vl(x, 0, 9, MIST)
    # --- dinding kiri (ujung kelas) dan kantin kanan: dinding bergaris lembut ---
    for (x0, x1) in ((0, 95), (234, 319)):
        c.r(x0, 12, x1 - x0 + 1, 93, CREAM)
        for x in range(x0, x1 + 1, 9): c.r(x, 12, 3, 93, WHITE)
    # --- tiang selasar dan dinding pembatas (rendah) ---
    for x in (96, 160, 224):
        c.r(x, 12, 10, 93, CREAM); c.vl(x, 12, 104, WHITE); c.vl(x + 1, 12, 104, WHITE)
        c.vl(x + 8, 12, 104, MIST); c.vl(x + 9, 12, 104, MIST)
    # dado + dinding pembatas: satu pita teal yang menyambung (gaya panel adegan 1)
    c.r(0, 105, 320, 33, TEAL); c.hl(0, 319, 105, WHITE); c.hl(0, 319, 106, MIST)
    for x in range(6, 320, 14): c.vl(x, 107, 137, GRASS)
    c.r(0, 138, 320, 3, GRASS)                                                      # plint
    # --- lantai ubin ---
    c.r(0, 141, 320, 39, PAGI3)
    for y in (150, 162, 175): c.hl(0, 319, y, WOOD)
    for x in range(8, 320, 24): c.vl(x, 141, 179, WOOD)                             # ubin persegi
    # cahaya siang dari celah antar-tiang jatuh di lantai (papan catur)
    for (bx0, bx1) in ((106, 159), (170, 223)):
        for y in range(141, 166):
            sh = (y - 141) // 2
            for x in range(bx0 + sh, bx1 + sh):                                      # cahaya dari kiri belakang, seperti adegan 1
                if (x + y) % 2 == 0 and c.px[x, y] == PAGI3: c.p(x, y, WHITE)
    # --- papan pengumuman tanpa tulisan (dinding kiri) ---
    c.r(12, 26, 72, 54, WOODD); c.r(13, 27, 70, 52, WOOD); c.r(15, 29, 66, 48, SKYD)
    for (x, y, w, h, col) in ((19, 33, 16, 12, WHITE), (39, 32, 12, 16, SUN), (55, 34, 20, 10, ROSE),
                              (20, 50, 12, 16, LEAF), (36, 52, 18, 12, WHITE), (58, 50, 16, 18, MANGO)):
        c.r(x, y, w, h, col); c.p(x + w // 2, y, CORAL)
    c.r(40, 56, 10, 6, SUN); c.disc(45, 57, 2, MANGO)                              # gambar matahari kecil
    # --- tanaman ---
    _floor_plant(c, 2); _floor_plant(c, 80)
    _hanging_pot(c, 132); _hanging_pot(c, 196, drop=12)
    # --- kantin (kanan): jendela layan, rak toples, jajanan bergantung, meja tegel ---
    c.r(240, 36, 76, 70, WOOD); c.r(242, 38, 72, 66, MIST)                          # kusen + ruang dalam
    c.dither(242, 38, 72, 66, WHITE, only=MIST)
    c.r(242, 38, 72, 4, SLATE)                                                      # bayangan atas
    for x in range(246, 312, 6):                                                    # jajanan renteng (polos, tanpa merek)
        col = (SKYD, ROSE, SUN, LEAF)[(x // 6) % 4]
        c.vl(x + 1, 42, 45, SLATE)
        for k in range(3): c.r(x, 46 + k * 6, 3, 5, col); c.p(x + 2, 46 + k * 6, WHITE)
    c.r(242, 76, 72, 2, WOOD); c.hl(242, 313, 78, WOODD)                            # rak
    for i, col in enumerate((SUN, MANGO, ROSE, LEAF, CORAL)):                       # toples kerupuk/permen
        x = 248 + i * 13
        c.r(x, 66, 9, 10, WHITE); c.r(x + 1, 69, 7, 7, col); c.r(x + 1, 64, 7, 2, SKYD); c.vl(x + 8, 66, 75, MIST)
    c.r(250, 92, 26, 10, WOOD); c.hl(250, 275, 92, WOODD)                           # nampan gorengan
    for (x, y) in ((252, 89), (258, 88), (264, 89), (270, 88), (255, 86), (267, 86)): c.r(x, y, 5, 4, MANGO); c.hl(x, x + 4, y + 3, WOODD)
    for x in (286, 292, 298): c.r(x, 86, 5, 16, WHITE); c.hl(x, x + 4, 86, MIST)   # tumpukan gelas plastik
    c.r(236, 104, 84, 4, WOOD); c.hl(236, 319, 104, SUN); c.hl(236, 319, 107, WOODD)    # daun meja kantin
    c.r(238, 108, 82, 30, WOOD)                                                     # depan meja: papan kayu
    for x in range(244, 320, 10): c.vl(x, 108, 137, WOODD)
    c.dither(238, 108, 82, 2, WOODD)
    return c


def _wire(c, x0, y0, x1, y1, sag, col):
    """Kabel listrik melengkung (parabola sederhana), 1 px."""
    n = max(1, abs(x1 - x0))
    for i in range(n + 1):
        t = i / n
        x = round(x0 + (x1 - x0) * t)
        y = round(y0 + (y1 - y0) * t + sag * 4 * t * (1 - t))
        c.p(x, y, col)


def _box(c, x, y, w, h):
    """Kardus pindahan polos (tanpa tulisan): sisi depan, tutup, selotip."""
    c.r(x, y, w, h, WOOD); c.hl(x, x + w - 1, y, PAGI3); c.vl(x + w - 1, y + 1, y + h - 1, WOODD)
    c.r(x + w // 2 - 1, y, 2, h // 2, PAGI3); c.hl(x, x + w - 1, y + h - 1, WOODD)


def bg_s5_kampung_sore():
    """Adegan 5 (16.30): jalan kampung di bawah langit jingga. Kiri: rumah Bayu yang baru pindah (kardus di
    teras); tengah: pos ronda dengan kentongan; kanan: warung dengan kamera CCTV kecil di ujung atap yang
    menghadap ke depan warung, tempat sepeda Pak Made semula diparkir. Tiang listrik (x 87) berada di sela
    posisi tokoh. Lantai y 130-170 kosong."""
    c = C(320, 180, SORE2)
    _sky(c, 0, ((SORE1, 30), (SORE2, 28), (SORE3, 34)))
    for (x, y, w) in ((120, 14, 30), (232, 30, 24)):                              # awan senja
        c.r(x, y + 3, w, 4, ROSE); c.r(x + 3, y + 1, w - 8, 2, ROSE); c.r(x + 6, y, w // 3, 1, ROSE)
        c.r(x + w - 10, y + 1, 6, 2, ROSE); c.hl(x + 2, x + w - 3, y + 7, CORAL); c.hl(x + 7, x + w // 2, y + 1, PAGI2)
    for (x, r) in ((92, 12), (118, 9), (176, 13), (198, 10), (214, 12)): c.disc(x, 98, r, GRASS)
    for (x, r) in ((182, 8), (206, 6)): c.disc(x, 94, r, LEAF)
    c.r(0, 100, 320, 32, GRASS); c.dither(0, 124, 320, 8, LEAF, only=GRASS)        # tanah berumput di tepi jalan
    # atap-atap jauh di ujung kampung
    for (x0, x1, y) in ((166, 196, 92), (198, 222, 96)):
        for i in range(5): c.hl(x0 + i, x1 - i, y - i, CORAL)
        c.r(x0 + 2, y + 1, x1 - x0 - 3, 6, PAGI3)
    # pagar tanaman rendah di depan lahan kosong
    c.r(164, 112, 58, 12, LEAF); c.dither(164, 112, 58, 12, GRASS, only=LEAF)
    for x in range(166, 222, 7): c.disc(x, 112, 3, LEAF)
    # --- kiri: rumah Bayu (baru pindah; kardus di teras) ---
    for i in range(14):                                                            # atap genteng tua (bawah lebih lebar)
        x0, x1 = max(0, 11 - i), 75 + i
        c.hl(x0, x1, 42 + i, WOODD)
        if i % 4 == 3: c.hl(x0, x1, 42 + i, HR2)                                     # garis deret genteng
    c.hl(11, 75, 42, WOOD); c.hl(0, 88, 55, HR2)
    c.r(0, 56, 85, 68, LEAF); c.dither(0, 56, 85, 3, GRASS)                         # dinding hijau muda
    c.r(8, 68, 22, 22, WHITE); c.r(9, 69, 20, 20, SORE1); c.vl(18, 69, 88, WHITE); c.hl(9, 28, 78, WHITE)
    c.dither(9, 69, 9, 9, WHITE, only=SORE1)                                       # pantulan langit
    c.r(38, 78, 16, 46, WOODD); c.r(39, 79, 14, 45, WOOD); c.p(50, 100, SUN)       # pintu
    _box(c, 58, 108, 14, 16); _box(c, 72, 112, 12, 12); _box(c, 61, 96, 12, 12)
    c.r(0, 124, 86, 8, MIST); c.hl(0, 85, 124, WHITE)                              # teras
    # tiang listrik + kabel
    c.r(87, 14, 2, 118, MIST); c.vl(88, 14, 131, SLATE); c.r(82, 18, 12, 2, SLATE)
    _wire(c, 82, 19, 0, 24, 3, SLATE); _wire(c, 93, 19, 319, 26, 7, SLATE)
    # --- tengah: pos ronda ---
    for i in range(10):                                                            # atap seng
        c.hl(102 - i, 158 + i, 66 + i, SLATE)
    for x in range(94, 168, 3): c.vl(x, 66, 75, MIST)
    for i in range(10): c.p(102 - i, 66 + i, SLATE); c.p(158 + i, 66 + i, SLATE)
    c.hl(92, 168, 76, DUSK)
    for x in (98, 161):
        c.r(x, 77, 3, 55, WOOD); c.vl(x + 2, 77, 131, WOODD)                         # tiang
    c.r(98, 92, 66, 2, WOOD); c.hl(98, 163, 94, WOODD)                             # palang sandaran
    c.r(96, 110, 70, 4, WOOD); c.hl(96, 165, 110, PAGI3); c.hl(96, 165, 114, WOODD)   # bale-bale
    for x in (100, 130, 159): c.r(x, 115, 2, 17, WOODD)
    c.vl(150, 77, 81, WOODD); c.r(148, 82, 5, 13, WOOD); c.vl(150, 84, 92, WOODD); c.hl(148, 152, 94, WOODD)   # kentongan
    c.vl(130, 77, 79, DUSK); c.r(129, 80, 3, 3, WHITE); c.p(130, 82, MIST)            # bohlam (belum menyala)
    for (x, y) in ((110, 108), (112, 108), (114, 108), (111, 109), (113, 109)): c.p(x, y, INK)   # papan catur kecil
    c.r(110, 109, 6, 1, WHITE); c.p(111, 108, WHITE); c.p(113, 108, WHITE)
    c.r(140, 104, 4, 6, CORAL); c.hl(140, 143, 104, MANGO)                          # termos
    # --- kanan: warung dengan kamera CCTV kecil ---
    c.r(222, 60, 98, 64, SKYD); c.dither(222, 60, 98, 3, NAVY)                      # dinding warung
    for i in range(8): c.hl(214, 319, 52 + i, MIST if i % 2 == 0 else WHITE)         # atap seng menjorok
    for x in range(214, 320, 4): c.vl(x, 52, 59, SLATE)
    c.hl(214, 319, 60, DUSK)
    c.r(230, 66, 66, 40, WOOD); c.r(232, 68, 62, 36, MIST)                          # bukaan warung
    c.r(232, 68, 62, 3, SLATE)
    for x in range(236, 292, 5):                                                    # renteng jajanan polos
        col = (ROSE, SUN, SKYD, MANGO)[(x // 5) % 4]
        c.vl(x + 1, 71, 72, SLATE)
        for k in range(2): c.r(x, 73 + k * 6, 3, 5, col)
    c.r(232, 88, 62, 2, WOOD)
    for i, col in enumerate((SUN, CORAL, LEAF, ROSE)):
        x = 238 + i * 14; c.r(x, 80, 8, 8, WHITE); c.r(x + 1, 82, 6, 6, col); c.r(x + 1, 78, 6, 2, MANGO)
    c.r(228, 104, 70, 20, WHITE); c.r(230, 106, 66, 16, SIANG3)                     # etalase kaca
    for (x, col) in ((234, MANGO), (246, SUN), (258, ROSE), (270, LEAF), (282, CORAL)):
        c.r(x, 113, 8, 6, col); c.hl(x, x + 7, 113, WHITE)
    c.hl(230, 295, 109, WHITE); c.dither(230, 106, 20, 6, WHITE, only=SIANG3)
    for (x, y) in ((302, 100), (310, 100), (306, 88)):                              # galon air
        c.r(x, y, 7, 12, SIANG1); c.r(x + 2, y - 2, 3, 2, SKYD); c.vl(x + 1, y + 1, y + 10, SIANG3)
    for x in (300, 308):                                                            # tabung gas
        c.r(x, 113, 7, 11, GRASS); c.r(x + 1, 112, 5, 1, LEAF); c.r(x + 2, 110, 3, 2, SLATE); c.vl(x + 1, 113, 123, LEAF)
    c.r(214, 124, 106, 8, MIST); c.hl(214, 319, 124, WHITE)                         # teras warung
    # kamera CCTV kecil di ujung atap, mengarah ke depan warung
    c.vl(306, 61, 63, SLATE); c.r(300, 63, 8, 4, WHITE); c.hl(300, 307, 66, MIST)
    c.r(298, 64, 2, 2, INK); c.p(306, 64, CORAL)
    # --- jalan kampung beton ---
    c.r(0, 132, 320, 4, SLATE); c.hl(0, 319, 132, DUSK)                            # selokan
    c.r(0, 136, 320, 44, MIST)
    for x in range(30, 320, 56): c.vl(x, 136, 179, SLATE)                          # sambungan beton
    c.dither(0, 136, 320, 4, SLATE, only=MIST)
    for (x, y) in ((14, 150), (64, 168), (118, 146), (176, 160), (238, 172), (292, 152)):
        c.p(x, y, SLATE); c.p(x + 1, y, SLATE)
    return c


def bg_s6_kamar_malam():
    """Adegan 6 (20.00): kamar Nara. Ruang dalam hangat (dinding persik bergaris lembut, panel dan lantai
    kayu seperti rumah di adegan 1); langit malam hanya terlihat di jendela. Meja belajar dengan lampu meja
    yang menyala, tempat tidur, jam 20.00, gambar dari Gita. Layar HP yang menyala ada pada sprite Nara (A-06)."""
    c = C(320, 180, PAGI3)
    for x in range(0, 320, 9): c.r(x, 0, 3, 107, SORE1)                            # dinding bergaris lembut
    c.r(0, 109, 320, 30, WOODD); c.hl(0, 319, 108, WOOD)                           # panel kayu
    for x in range(6, 320, 14): c.vl(x, 110, 138, HR2)
    c.r(0, 138, 320, 3, HR2)
    c.r(0, 141, 320, 39, WOOD)                                                      # lantai papan
    for y in (150, 162, 175): c.hl(0, 319, y, WOODD)
    for i, (y0, y1) in enumerate(((141, 149), (151, 161), (163, 174), (176, 179))):
        for x in range((i * 23) % 40, 320, 40): c.vl(x, y0, y1, WOODD)
    # --- jendela: satu-satunya bagian langit malam ---
    wx, wy, ww, wh = 214, 12, 78, 50
    c.r(wx - 4, wy - 4, ww + 8, wh + 8, CREAM)
    c.r(wx, wy, ww, wh, MALAM1); c.r(wx, wy + 25, ww, wh - 25, MALAM2); c.dither(wx, wy + 23, ww, 2, MALAM2)
    for (x, y) in ((220, 17), (236, 24), (249, 15), (262, 33), (284, 19), (228, 33), (277, 31), (243, 40)):
        c.p(x, y, WHITE)
    for (x, y) in ((257, 21), (288, 37), (219, 41)): c.p(x, y, LAMPU)
    c.disc(272, 22, 6, CREAM); c.disc(275, 20, 5, MALAM1)                            # bulan sabit
    for (x0, x1, top) in ((214, 236, 52), (238, 262, 48), (264, 291, 54)):            # atap rumah tetangga
        c.r(x0, top, x1 - x0 + 1, wy + wh - top, DUSK); c.hl(x0, x1, top, SLATE)
    c.r(244, 54, 4, 4, LAMPU); c.r(272, 57, 4, 3, LAMPU); c.r(222, 56, 3, 3, LAMPU)   # jendela tetangga menyala
    c.r(wx + ww // 2 - 1, wy, 3, wh, CREAM); c.r(wx, wy + 24, ww, 2, CREAM)          # kusen
    c.r(wx - 6, wy + wh + 4, ww + 12, 3, CREAM); c.hl(wx - 6, wx + ww + 5, wy + wh + 7, MIST)   # ambang
    for (x0, x1) in ((wx - 14, wx - 3), (wx + ww + 2, wx + ww + 13)):              # tirai
        c.r(x0, wy - 8, x1 - x0 + 1, wh + 18, TEAL)
        for x in range(x0 + 2, x1, 4): c.vl(x, wy - 8, wy + wh + 9, GRASS)
    c.hl(wx - 16, wx + ww + 15, wy - 10, WOODD); c.hl(wx - 16, wx + ww + 15, wy - 9, WOODD)
    # --- meja belajar dengan lampu meja yang menyala ---
    dx0, dx1, dy = 194, 300, 104
    for y in range(86, dy):                                                         # kerucut cahaya di dinding
        half = 7 + (y - 86)
        for x in range(232 - half, 233 + half):
            if (x + y) % 2 == 0 and c.px[x, y] in (PAGI3, SORE1): c.p(x, y, LAMPU)
    for y in range(141, 149):                                                       # genangan cahaya di lantai
        half = 30 - (y - 141) * 2
        for x in range(234 - half, 234 + half):
            if (x + y) % 2 == 0 and c.px[x, y] == WOOD: c.p(x, y, LAMPU)
    c.r(dx0, dy, dx1 - dx0 + 1, 4, WOOD); c.hl(dx0, dx1, dy, SUN); c.hl(dx0, dx1, dy + 4, WOODD)
    c.r(dx0 + 2, dy + 5, 4, 32, WOOD); c.r(dx1 - 5, dy + 5, 4, 32, WOOD)              # kaki meja
    c.r(dx1 - 40, dy + 5, 34, 14, WOOD); c.hl(dx1 - 40, dx1 - 7, dy + 12, WOODD)    # laci
    c.r(dx1 - 26, dy + 8, 6, 2, SUN); c.r(dx1 - 26, dy + 15, 6, 2, SUN)
    c.r(226, dy - 3, 13, 3, SKYD); c.hl(226, 238, dy - 1, NAVY)                     # lampu meja: kaki
    c.vl(232, dy - 18, dy - 4, SKYD); c.vl(233, dy - 18, dy - 4, NAVY)              # tiang
    c.r(224, dy - 26, 18, 8, SKYD); c.hl(224, 241, dy - 26, SIANG1); c.vl(241, dy - 25, dy - 19, NAVY)   # kap
    c.r(226, dy - 18, 14, 1, LAMPU); c.r(229, dy - 17, 8, 1, LAMPU)                 # bohlam menyala
    c.r(250, dy - 6, 18, 6, CORAL); c.hl(250, 267, dy - 6, ROSE)                    # tumpukan buku
    c.r(250, dy - 9, 16, 3, SKYD); c.r(252, dy - 12, 14, 3, LEAF)
    c.r(204, dy - 12, 12, 12, WHITE); c.r(205, dy - 11, 10, 8, SIANG1); c.r(205, dy - 6, 10, 3, LEAF)   # foto
    c.r(196, dy - 10, 6, 10, SKYD); c.hl(196, 201, dy - 10, SIANG1)                # gelas pensil
    c.vl(197, dy - 14, dy - 11, CORAL); c.vl(200, dy - 13, dy - 11, SUN)
    # kursi di depan laci, tas sekolah Nara tergantung di sandarannya
    c.r(272, 96, 22, 3, WOOD); c.hl(272, 293, 96, SUN)
    for x in (272, 291): c.r(x, 99, 3, 42, WOOD); c.vl(x + 2, 99, 140, WOODD)
    c.r(275, 117, 16, 3, WOOD); c.hl(275, 290, 119, WOODD)
    c.r(278, 99, 11, 13, MANGO); c.hl(278, 288, 99, SUN); c.r(280, 105, 7, 4, CORAL); c.vl(288, 100, 111, CORAL)
    # --- tempat tidur di kiri ---
    c.r(6, 92, 6, 48, WOOD); c.hl(6, 11, 92, SUN); c.vl(11, 93, 139, WOODD)        # sandaran kepala
    c.r(12, 114, 98, 12, WHITE); c.hl(12, 109, 125, MIST)                           # kasur
    c.r(14, 106, 22, 9, WHITE); c.hl(14, 35, 114, MIST); c.dither(14, 106, 22, 3, SIANG3)   # bantal
    c.r(40, 110, 70, 16, ROSE); c.hl(40, 109, 110, PAGI2); c.hl(40, 109, 125, CORAL)   # selimut
    for x in range(44, 110, 10): c.r(x, 115, 4, 4, SUN)
    c.r(12, 126, 98, 12, WOOD); c.hl(12, 109, 126, SUN); c.hl(12, 109, 137, WOODD)  # rangka
    c.r(106, 126, 4, 14, WOOD); c.r(12, 126, 2, 14, WOOD)
    # rak dinding kecil di atas tempat tidur
    c.r(70, 66, 38, 3, WOOD); c.hl(70, 107, 69, WOODD)
    for (x, h, col) in ((73, 12, SKYD), (77, 10, CORAL), (81, 13, LEAF), (85, 11, SUN), (89, 9, BERRY)):
        c.r(x, 66 - h, 4, h, col); c.vl(x + 3, 66 - h, 65, WOODD)
    c.r(97, 59, 7, 7, CORAL); c.hl(97, 103, 59, MANGO)                              # pot kaktus kecil
    c.r(99, 52, 3, 7, LEAF); c.p(98, 55, LEAF); c.p(102, 54, LEAF); c.vl(101, 53, 58, GRASS)
    # --- jam dinding 20.00 + gambar buatan Gita ---
    cx, cy = 150, 30; c.disc(cx, cy, 8, WHITE); c.ring(cx, cy, 8, INK)
    for (ddx, ddy) in ((0, -6), (6, 0), (0, 6), (-6, 0)): c.p(cx + ddx, cy + ddy, INK)
    c.p(cx - 1, cy + 1, INK); c.p(cx - 2, cy + 2, INK); c.p(cx - 3, cy + 2, INK)   # jarum pendek ke angka 8
    c.vl(cx, cy - 6, cy, CORAL); c.p(cx, cy, INK)                                   # jarum panjang ke angka 12
    c.r(30, 36, 24, 20, CREAM); c.hl(30, 53, 36, WHITE); c.r(41, 34, 2, 3, SUN)     # kertas gambar + selotip
    c.disc(48, 41, 3, SUN)
    c.r(35, 45, 3, 3, SK2); c.r(34, 48, 5, 5, CORAL); c.r(43, 46, 3, 3, SK2); c.r(42, 49, 5, 4, SKYD)
    c.hl(38, 42, 50, INK)                                                           # dua orang bergandengan
    c.hl(31, 52, 54, LEAF)
    return c


# ---------------------------------------------------------------------------
# Batch C (disetujui 21 Okt): bg_title, end_setara, end_hampir, end_berat
# Ilustrasi akhir adalah satu-satunya gambar di file ini yang memuat tokoh (Nara duduk, digambar di tokoh.py).
# ---------------------------------------------------------------------------
TITLE_ZONE = (64, 6, 256, 56)        # bidang langit tenang untuk judul di bg_title (x0, y0, x1, y1)
END_SCALE_ZONE = (220, 8, 292, 56)   # bidang langit tenang untuk timbangan D-10 di ilustrasi akhir (x0, y0, x1, y1)
LAMP = (132, 44)                     # lampu teras pada ilustrasi akhir


def bg_title():
    """Layar judul (C-01): jalan kampung pagi; rumah Nara di kiri (warna dan gorden sama dengan ilustrasi akhir),
    rumah tetangga di kanan, sawah dan jalan setapak menuju sekolah di kejauhan, matahari terbit di belakang
    sekolah. Langit TITLE_ZONE dibiarkan tenang untuk judul; jalan kampung (lantai y 130-170) kosong untuk
    tokoh dan tombol."""
    c = C(320, 180, PAGI2)
    _sky(c, 0, ((PAGI1, 34), (PAGI2, 30), (PAGI3, 28)))
    # matahari terbit di belakang sekolah, dengan lingkar cahaya papan catur
    for y in range(56, 100):
        for x in range(134, 187):
            if (x - 160) ** 2 + (y - 80) ** 2 <= 22 * 22 and c.px[x, y] in (PAGI3, PAGI2) and (x + y) % 2 == 0:
                c.p(x, y, SORE1)
    c.disc(160, 80, 12, SUN); c.r(154, 72, 4, 2, WHITE)
    _cloud(c, 10, 18, 34); _cloud(c, 270, 12, 36); _cloud(c, 290, 40, 22)          # awan hanya di tepi
    # bukit jauh
    for (x, r) in ((10, 16), (40, 12), (74, 15), (104, 11), (214, 12), (246, 15), (280, 12), (312, 16)):
        c.disc(x, 96, r, GRASS)
    for (x, r) in ((122, 9), (198, 9)): c.disc(x, 94, r, GRASS)
    c.r(0, 94, 320, 8, GRASS)
    # sekolah di kejauhan (siluet kecil di depan matahari)
    c.r(140, 86, 40, 10, CREAM); c.hl(140, 179, 95, MIST)
    for i in range(5): c.hl(142 - i, 177 + i, 81 + i, CORAL)
    c.hl(137, 182, 86, WOODD)
    for x in range(144, 178, 6): c.r(x, 89, 3, 4, PAGI1)
    c.r(157, 90, 5, 6, WOOD)
    c.vl(186, 72, 95, MIST); c.r(187, 72, 5, 2, CORAL); c.r(187, 74, 5, 2, WHITE)   # tiang bendera kecil
    # sawah bertingkat; garis terang = air dan pematang
    rows = ((102, 6, LEAF), (108, 7, GRASS), (115, 7, LEAF), (122, 8, GRASS))
    for (y, h, col) in rows:
        c.r(0, y, 320, h, col)
        c.hl(0, 319, y, PAGI1 if col == LEAF else LEAF)                           # pematang/air di tepi petak
    c.dither(0, 102, 320, 28, GRASS, only=LEAF)
    # jalan setapak dari jalan kampung menuju sekolah
    for y in range(96, 132):
        t = (y - 96) / 35
        half = int(2 + t * 18)
        c.hl(160 - half, 160 + half, y, PAGI3); c.p(160 - half, y, WOOD); c.p(160 + half, y, WOOD)
    for y in range(100, 132, 5): c.p(160 + ((y // 5) % 3) - 1, y, WOOD)
    # --- kiri: rumah Nara (sama dengan ilustrasi akhir: dinding persik, gorden merah muda, bangku teras) ---
    for i in range(12): c.hl(max(0, 10 - i), 78 + i, 62 + i, WOODD if i in (0, 11) else CORAL)
    c.r(0, 74, 86, 56, PAGI3)
    c.r(8, 84, 26, 22, WHITE); c.r(10, 86, 22, 18, PAGI2); c.r(10, 86, 5, 18, ROSE); c.r(27, 86, 5, 18, ROSE)
    c.vl(20, 86, 103, WHITE); c.hl(10, 31, 94, WHITE)
    c.r(44, 88, 16, 42, WOODD); c.r(45, 89, 14, 41, WOOD); c.p(56, 110, SUN)        # pintu
    c.r(64, 116, 18, 2, WOOD); c.hl(64, 81, 116, SUN); c.r(65, 118, 2, 12, WOODD); c.r(79, 118, 2, 12, WOODD)   # bangku teras
    c.r(66, 106, 2, 10, WOODD); c.r(78, 106, 2, 10, WOODD); c.r(66, 106, 14, 2, WOOD)
    _tree(c, 98, 90, 12, shade_side='left')
    # --- kanan: rumah tetangga + pohon ---
    for i in range(12): c.hl(240 + 10 - i, 320, 64 + i, WOODD if i in (0, 11) else CORAL)
    c.r(244, 76, 76, 54, SIANG2)
    c.r(254, 86, 24, 20, WHITE); c.r(256, 88, 20, 16, PAGI1); c.vl(266, 88, 103, WHITE)
    c.r(288, 90, 16, 40, WOODD); c.r(289, 91, 14, 39, WOOD); c.p(291, 110, SUN)
    _tree(c, 226, 92, 13, shade_side='right')                                      # sisi kiri menghadap matahari
    # pagar bambu di depan rumah-rumah
    for (x0, x1) in ((0, 124), (196, 319)):                                         # pagar bambu rendah
        c.r(x0, 123, x1 - x0 + 1, 2, WOOD)
        for x in range(x0 + 1, x1 + 1, 6): c.r(x, 120, 2, 11, PAGI3); c.p(x, 120, WOOD); c.vl(x + 1, 121, 130, WOOD)
    # --- jalan kampung (tempat tokoh berjalan) ---
    c.r(0, 130, 320, 6, LEAF); c.dither(0, 130, 320, 6, GRASS, only=LEAF)          # tepi rumput
    c.r(0, 136, 320, 44, PAGI3)
    c.dither(0, 136, 320, 3, WOOD, only=PAGI3)
    for (x, y) in ((18, 148), (66, 166), (120, 152), (178, 172), (226, 146), (270, 162), (306, 150), (96, 176), (248, 177)):
        c.p(x, y, WOOD); c.p(x + 1, y, WOOD)
    for y in range(136, 140):                                                      # setapak menyambung ke jalan
        half = int(2 + (y - 132) / 35 * 18)
        c.hl(160 - half, 160 + half, y, PAGI3)
    return c


def _ring_light(c, cx, cy, rings, only):
    """Cahaya lampu bertingkat: setiap cincin (radius, warna, rapat) ditimpakan dari luar ke dalam.
    rapat=True -> warna penuh, False -> papan catur. Hanya mengenai piksel berwarna 'only'."""
    for (rad, col, solid) in rings:
        for y in range(max(0, cy - rad), min(c.h, cy + rad + 1)):
            for x in range(max(0, cx - rad), min(c.w, cx + rad + 1)):
                if (x - cx) ** 2 + (y - cy) ** 2 <= rad * rad and c.px[x, y] in only:
                    if solid or (x + y) % 2 == 0: c.p(x, y, col)


def _night_cloud(c, x, y, w, body=DUSK, rim=MALAM2):
    c.r(x, y + 2, w, 4, body); c.r(x + 3, y, w - 8, 2, body); c.r(x + w - 9, y + 1, 5, 1, body)
    c.hl(x + 3, x + w - 6, y, rim); c.hl(x, x + 2, y + 2, rim)


def _end_teras(mood):
    """Teras rumah Nara pada malam hari; dipakai ketiga ilustrasi akhir. mood: 'setara', 'hampir', 'berat'.
    Kiri: dinding hangat terkena lampu teras, jendela bercahaya, pintu, bangku tempat Nara duduk.
    Kanan: halaman dan langit malam. END_SCALE_ZONE dibiarkan kosong untuk timbangan D-10 (antarmuka)."""
    wall = PAGI3
    c = C(320, 180, MALAM1)
    _sky(c, 0, ((MALAM1, 70), (MALAM2, 50)))
    # --- bintang (tidak masuk bidang timbangan) ---
    stars = [(192, 14), (204, 42), (300, 10), (314, 44), (198, 66), (240, 64), (283, 70), (309, 60), (212, 86),
             (262, 88), (296, 92), (226, 100), (190, 100), (250, 76)]
    n = {'setara': 14, 'hampir': 9, 'berat': 6}[mood]
    for i, (x, y) in enumerate(stars[:n]):
        c.p(x, y, LAMPU if i % 4 == 1 else WHITE)
        if i % 5 == 0: c.p(x - 1, y, MIST); c.p(x + 1, y, MIST); c.p(x, y - 1, MIST); c.p(x, y + 1, MIST)
    # bulan sabit di kanan atas (di luar bidang timbangan); malam cerah: lingkar cahaya bulan
    if mood == 'setara':
        for y in range(12, 41):
            for x in range(294, 320):
                if (x - 306) ** 2 + (y - 26) ** 2 <= 12 * 12 and (x + y) % 2 == 0 and c.px[x, y] == MALAM1: c.p(x, y, MALAM2)
    c.disc(306, 26, 7, CREAM); c.disc(309, 24, 6, MALAM1)
    # awan malam sesuai suasana
    if mood == 'hampir':
        _night_cloud(c, 296, 30, 24); _night_cloud(c, 196, 74, 34)
    elif mood == 'berat':
        _night_cloud(c, 294, 22, 26); _night_cloud(c, 186, 60, 30); _night_cloud(c, 236, 82, 44); _night_cloud(c, 284, 98, 36)
    if mood == 'berat':                                          # bintang jatuh: tanda harapan
        for i in range(16):
            c.p(258 - i * 2, 60 + i, WHITE if i < 4 else (MIST if i < 10 else MALAM2))
            c.p(257 - i * 2, 60 + i, MIST if i < 8 else MALAM2)
        c.r(258, 59, 2, 2, WHITE); c.p(260, 58, LAMPU)
    # --- halaman di balik teras: pohon, rumah tetangga, pagar ---
    for (x, r) in ((200, 14), (222, 10), (300, 12), (318, 9)): c.disc(x, 112, r, GRASS)
    c.dither(184, 96, 136, 30, DUSK, only=GRASS)
    c.r(248, 92, 40, 30, DUSK); c.hl(248, 287, 92, SLATE)                          # rumah tetangga
    for i in range(6): c.hl(244 + i, 291 - i, 86 + i, NAVY)
    c.r(256, 100, 8, 8, LAMPU); c.r(272, 100, 8, 8, LAMPU); c.vl(260, 100, 107, SORE2); c.vl(276, 100, 107, SORE2)
    c.r(184, 118, 136, 23, MIST); c.hl(184, 319, 118, WHITE)                       # pagar tembok rendah (cahaya bulan)
    c.dither(184, 119, 136, 22, SLATE, only=MIST)
    for x in range(184, 320, 24): c.vl(x, 119, 140, SLATE)
    if mood == 'setara':                                          # kunang-kunang
        for (x, y) in ((206, 104), (232, 96), (290, 110), (214, 112), (302, 104)): c.p(x, y, LAMPU)
    # --- teras: plafon, dinding, tiang ---
    c.r(0, 16, 184, 125, wall)                                                     # dinding rumah
    _ring_light(c, LAMP[0], LAMP[1] + 4, ((70, SORE1, False), (46, SORE1, True), (26, LAMPU, False)), (wall,))
    _ring_light(c, LAMP[0], LAMP[1] + 4, ((26, LAMPU, False),), (SORE1,))
    c.r(0, 0, 194, 12, WOODD); c.r(0, 12, 196, 4, WOOD); c.hl(0, 195, 16, HR2)      # plafon + lisplang
    for x in range(8, 194, 12): c.vl(x, 0, 11, HR2)
    c.r(176, 17, 8, 124, CREAM); c.vl(176, 17, 140, WHITE); c.vl(183, 17, 140, MIST)   # tiang teras
    # pintu (kiri)
    c.r(10, 50, 30, 91, WOODD); c.r(12, 52, 26, 89, WOOD)
    for (y0, y1) in ((56, 92), (98, 134)): c.r(16, y0, 18, y1 - y0, WOODD); c.r(17, y0 + 1, 16, y1 - y0 - 2, WOOD)
    c.r(33, 96, 3, 3, SUN)
    # jendela besar dengan cahaya ruang dalam
    wx0, wy0, wx1, wy1 = 54, 30, 114, 90
    c.r(wx0 - 3, wy0 - 3, wx1 - wx0 + 7, wy1 - wy0 + 7, WHITE)
    c.r(wx0, wy0, wx1 - wx0 + 1, wy1 - wy0 + 1, LAMPU)
    c.dither(wx0, wy0, wx1 - wx0 + 1, wy1 - wy0 + 1, SORE1, only=LAMPU)
    c.r(wx0, wy0, 12, wy1 - wy0 + 1, ROSE); c.r(wx1 - 11, wy0, 12, wy1 - wy0 + 1, ROSE)   # gorden
    for x in (wx0 + 3, wx0 + 7, wx1 - 8, wx1 - 4): c.vl(x, wy0, wy1, CORAL)
    c.r((wx0 + wx1) // 2 - 1, wy0, 3, wy1 - wy0 + 1, WHITE); c.r(wx0, (wy0 + wy1) // 2 - 1, wx1 - wx0 + 1, 3, WHITE)
    c.r(wx0 - 5, wy1 + 4, wx1 - wx0 + 11, 3, WHITE); c.hl(wx0 - 5, wx1 + 5, wy1 + 7, MIST)   # ambang
    # lampu teras + cahaya hangat di dinding (papan catur)
    c.r(LAMP[0] - 1, LAMP[1] - 8, 3, 4, SLATE); c.r(LAMP[0] - 4, LAMP[1] - 4, 9, 2, SLATE)
    c.r(LAMP[0] - 3, LAMP[1] - 2, 7, 8, WHITE); c.r(LAMP[0] - 2, LAMP[1] - 1, 5, 6, LAMPU); c.hl(LAMP[0] - 3, LAMP[1] + 3, LAMP[1] + 6, SLATE)
    # pot bunga di dekat tiang
    c.r(154, 126, 16, 2, MANGO); c.r(155, 128, 14, 12, CORAL); c.vl(167, 128, 139, WOODD)
    for (x, y, r) in ((158, 118, 5), (166, 116, 5), (162, 110, 5)): c.disc(x, y, r, LEAF)
    c.dither(150, 104, 24, 22, GRASS, only=LEAF)
    flowers = ((158, 112), (165, 109), (163, 118), (156, 119)) if mood == 'setara' else ((165, 109),)
    for (x, y) in flowers: c.r(x, y, 2, 2, ROSE); c.p(x, y, WHITE)
    # plint + lantai teras
    c.r(0, 138, 184, 3, WOODD)
    c.r(0, 141, 320, 39, CREAM)
    for y in (150, 162, 175): c.hl(0, 319, y, MIST)
    for x in range(10, 320, 26): c.vl(x, 141, 179, MIST)
    _ring_light(c, LAMP[0], 150, ((60, PAGI2, False),), (CREAM,))
    # bangku kayu di bawah jendela
    bx0, bx1 = 66, 140
    for x in (bx0 + 2, bx1 - 4): c.r(x, 124, 3, 33, WOODD)                         # tiang sandaran + kaki belakang
    c.r(bx0 + 2, 126, bx1 - bx0 - 3, 3, WOOD); c.r(bx0 + 2, 133, bx1 - bx0 - 3, 3, WOOD)   # sandaran
    c.hl(bx0 + 2, bx1 - 2, 126, SUN)
    c.r(bx0, 147, bx1 - bx0 + 1, 3, WOOD); c.hl(bx0, bx1, 147, SUN); c.hl(bx0, bx1, 149, WOODD)  # dudukan
    for x in (bx0 + 1, bx1 - 3): c.r(x, 150, 3, 7, WOODD)                          # kaki depan
    # Nara duduk
    pose = {'setara': 'happy', 'hampir': 'think', 'berat': 'hope'}[mood]
    c.place(nara_duduk(pose), 98)
    return c


def end_setara():
    """C-02 Warga Setara: malam cerah, bulan bercahaya, banyak bintang, kunang-kunang, bunga mekar;
    Nara tersenyum sambil menggenggam teh hangat."""
    return _end_teras('setara')


def end_hampir():
    """C-03 Hampir Seimbang: sebagian langit berawan; Nara merenung dengan tangan di dagu."""
    return _end_teras('hampir')


def end_berat():
    """C-04 Hari yang Berat: lebih banyak awan, tetapi ada bintang jatuh; Nara termenung, menatap ke atas
    dengan mata berbinar dan senyum kecil. Rumah tetap hangat: tidak ada layar "kalah"."""
    return _end_teras('berat')
