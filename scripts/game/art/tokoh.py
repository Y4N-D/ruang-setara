"""Tokoh Sehari Setara.

Aturan: semua tokoh digambar MENGHADAP KANAN (dicerminkan dengan flip() bila perlu),
kanvas diberi margin 1 px untuk garis luar, lalu outline() dipanggil terakhir.
Ukuran kanvas: siswa SMP 26x62, dewasa 30x68, anak SD 24x48 (sudah termasuk margin).
Tokoh di atas kendaraan boleh lebih lebar: rider() 56x62.
Tokoh yang sudah disetujui: Nara (student), Ibu (mother), Gita (kid).
Batch A1 (disetujui 21 Okt): Nara 'phone', Ibu 'happy' dan 'sad', Gita 'sad'.
Batch A2 (disetujui 21 Okt): Dimas di motor (dimas/rider), Sinta berkerudung (sinta/student).
Batch A3-A4 (disetujui 21 Okt): Bu Ratih, Komang, dua siswa adegan 4, Pak Made, Bayu, dua warga.
Batch C (disetujui 21 Okt): Nara duduk untuk ilustrasi akhir (student_sit/nara_duduk), ekspresi 'think' dan 'hope'.
"""
from pixelart import *  # noqa: F401,F403

# Pakaian rumah Nara (malam hari: adegan 6 dan layar akhir). Seragam tetap bawaan student().
NARA_RUMAH = dict(shirt=TEAL, shirt_d=GRASS, bottom=DUSK, bag=False, pocket=False)  # noqa: F405
# Sinta: siswi berkerudung putih, kemeja lengan panjang, rok panjang navy (seragam SMP)
SINTA = dict(skin=SK3, skin_d=SK4, hair_style='kerudung', long_sleeves=True, skirt=True, bag=False, pocket=False,
             happy_arms='clasp')  # noqa: F405
# Dimas: kulit skin-4 (bayangan hair-2), rambut cepak, jaket sky-d di atas seragam, celana navy
DIMAS = dict(skin=SK4, skin_d=HR2, hair=HR1, hair_style='cepak', jacket=SKYD, jacket_d=NAVY, bottom=NAVY)  # noqa: F405
# Komang: adik kelas VII, kulit skin-2, potongan mangkuk, seragam kebesaran, sepatu robek, tanpa tas
KOMANG = dict(skin=SK2, skin_d=SK3, hair=HR1, hair_style='mangkuk', short=2, baggy=True, torn_shoe=True,
              bag=False, pocket=True, happy_arms='rest')  # noqa: F405
# Dua siswa adegan 4 (warna kulit berbeda dari Komang ke dua arah, agar tidak ada kesan perundungan karena warna kulit)
SISWA_A = dict(skin=SK3, skin_d=SK4, hair=HR2, hair_style='jabrik', bag=False)  # noqa: F405   # yang merekam
SISWA_B = dict(skin=SK1, skin_d=SK2, hair=HR1, hair_style='kuncir', skirt=True, bag=False, pocket=False)  # noqa: F405
# Adegan 5. Bayu memakai skin-2 seperti Nara agar tidak tampak sebagai "orang luar"; dua warga memakai skin-3 dan
# skin-1 (satu lebih gelap, satu lebih terang dari Bayu); Pak Made skin-4.
MADE = dict(skin=SK4, skin_d=HR2, hair=SLATE, hair_style='tipis', top_c=MANGO, top_d=CORAL,
            bottom='sarung', bottom_c=NAVY, bottom_d=DUSK, bottom_l=SKYD, feet='sandal', mustache=SLATE)  # noqa: F405
BAYU = dict(skin=SK2, skin_d=SK3, hair=HR2, hair_style='rapi', top_c=MIST, top_d=SLATE,
            bottom='pants', bottom_c=SKYD, bottom_d=NAVY, feet='sneaker')  # noqa: F405
WARGA_A = dict(skin=SK3, skin_d=SK4, hair=HR1, hair_style='plontos', top_c=LEAF, top_d=GRASS,
               bottom='shorts', bottom_c=DUSK, bottom_d=NAVY, feet='sandal')  # noqa: F405
WARGA_B = dict(skin=SK1, skin_d=SK2, hair=HR1, hair_style='keriting', top_c=BERRY, top_d=MALAM1,
               bottom='skirt', bottom_c=WOODD, bottom_d=HR2, feet='sandal')  # noqa: F405
# Bu Ratih: guru BK, kulit skin-4, rambut bob, kacamata, kemeja batik teal, rok cokelat, buku catatan
RATIH = dict(skin=SK4, skin_d=HR2, hair=HR1, hair_style='bob', top_c=TEAL, top_d=GRASS, top_l=SUN,
             skirt_c=WOODD, skirt_d=HR2, book=MANGO, book_d=CORAL, glasses=True)  # noqa: F405

def face(c,hx,hy,expr,skin_d,eye_dy=0):
    # hx,hy = pojok kiri atas kepala (lebar 18)
    ey=hy+8+eye_dy
    if expr=='sad':
        c.r(hx+12,ey+1,2,1,INK); c.r(hx+16,ey+1,2,1,INK)          # mata menunduk
        c.p(hx+12,ey-2,INK); c.p(hx+13,ey-3,INK); c.p(hx+17,ey-2,INK); c.p(hx+16,ey-3,INK)  # alis sedih
        c.hl(hx+14,hx+16,hy+15,INK); c.p(hx+13,hy+16,INK); c.p(hx+17,hy+16,INK)        # cemberut
    elif expr=='down':   # melihat ke bawah (HP), mulut datar
        c.r(hx+12,ey+1,2,1,INK); c.r(hx+16,ey+1,2,1,INK)
        c.hl(hx+14,hx+16,hy+15,INK)
    elif expr=='worried':   # khawatir: seperti 'sad', alis satu baris lebih rendah agar tidak menyatu dengan poni
        c.r(hx+12,ey+1,2,1,INK); c.r(hx+16,ey+1,2,1,INK)
        c.p(hx+12,ey-1,INK); c.p(hx+13,ey-2,INK); c.p(hx+17,ey-1,INK); c.p(hx+16,ey-2,INK)
        c.hl(hx+14,hx+16,hy+15,INK); c.p(hx+13,hy+16,INK); c.p(hx+17,hy+16,INK)
    elif expr=='smile':     # senyum ramah tanpa rona pipi
        c.r(hx+12,ey,2,2,INK); c.r(hx+16,ey,2,2,INK)
        c.p(hx+13,hy+14,INK); c.p(hx+17,hy+14,INK); c.hl(hx+14,hx+16,hy+15,INK)
    elif expr in ('angry','angry_talk'):   # marah/menuduh: ujung dalam alis turun; '_talk' mulut terbuka
        c.r(hx+12,ey,2,2,INK); c.r(hx+16,ey,2,2,INK)
        c.p(hx+12,ey-2,INK); c.p(hx+13,ey-1,INK); c.p(hx+17,ey-2,INK); c.p(hx+16,ey-1,INK)
        if expr=='angry_talk': c.r(hx+14,hy+14,3,2,INK); c.p(hx+15,hy+15,CORAL)
        else: c.hl(hx+14,hx+16,hy+15,INK); c.p(hx+13,hy+16,INK)
    elif expr=='worried_talk':   # khawatir sambil bicara: alis 'worried' + mulut terbuka
        c.r(hx+12,ey+1,2,1,INK); c.r(hx+16,ey+1,2,1,INK)
        c.p(hx+12,ey-1,INK); c.p(hx+13,ey-2,INK); c.p(hx+17,ey-1,INK); c.p(hx+16,ey-2,INK)
        c.r(hx+14,hy+14,3,2,INK); c.p(hx+15,hy+15,CORAL)
    elif expr=='confused':  # bingung: satu alis terangkat, mulut kecil miring
        c.r(hx+12,ey,2,2,INK); c.r(hx+16,ey,2,2,INK)
        c.hl(hx+12,hx+13,ey-2,INK); c.hl(hx+16,hx+17,ey-3,INK)
        c.hl(hx+14,hx+15,hy+15,INK); c.p(hx+16,hy+14,INK)
    elif expr=='relief':    # lega: mata terpejam (^ ^), senyum, rona pipi
        for ex in (hx+11,hx+15):
            c.p(ex,ey+1,INK); c.p(ex+1,ey,INK); c.p(ex+2,ey+1,INK)
        c.p(hx+13,hy+14,INK); c.p(hx+17,hy+14,INK); c.hl(hx+14,hx+16,hy+15,INK); c.r(hx+9,hy+12,2,1,ROSE)
    elif expr in ('laugh','laugh2'):   # tertawa: mata terpejam (^ ^), mulut terbuka; 'laugh2' mulut sedikit menutup
        for ex in (hx+11,hx+15):
            c.p(ex,ey+1,INK); c.p(ex+1,ey,INK); c.p(ex+2,ey+1,INK)
        if expr=='laugh':
            c.hl(hx+13,hx+16,hy+13,INK); c.r(hx+13,hy+14,4,1,INK); c.hl(hx+14,hx+15,hy+15,INK); c.r(hx+14,hy+14,2,1,CORAL)
        else:
            c.hl(hx+13,hx+16,hy+14,INK); c.hl(hx+14,hx+15,hy+15,INK)
    elif expr=='think':     # merenung (layar akhir): mata menyipit, mulut kecil ke samping
        c.r(hx+12,ey+1,2,1,INK); c.r(hx+16,ey+1,2,1,INK)
        c.hl(hx+15,hx+16,hy+15,INK)
    elif expr=='hope':      # termenung tetapi berharap (layar akhir): mata berbinar menatap ke atas, senyum kecil
        c.r(hx+12,ey,2,2,INK); c.r(hx+16,ey,2,2,INK); c.p(hx+13,ey,WHITE); c.p(hx+17,ey,WHITE)
        c.p(hx+14,hy+14,INK); c.hl(hx+15,hx+16,hy+15,INK)
    else:
        c.r(hx+12,ey,2,2,INK); c.r(hx+16,ey,2,2,INK)
        if expr=='happy':
            c.p(hx+13,hy+14,INK); c.p(hx+17,hy+14,INK); c.hl(hx+14,hx+16,hy+15,INK)
            c.r(hx+10,hy+12,2,1,ROSE); c.r(hx+18 if hx+18<c.w else hx+17,hy+12,1,1,ROSE)
        elif expr=='talk':
            c.r(hx+14,hy+14,3,2,INK); c.p(hx+15,hy+15,CORAL)
        else:
            c.hl(hx+14,hx+16,hy+15,INK)
def _phone_arm(c,ox,top,frame,shirt,skin,skin_d):
    """Lengan depan menekuk, HP digenggam di depan dada; layar menyala tanpa tulisan.
    Bingkai 1: badan turun 1 px (napas) sehingga ibu jari tampak naik 1 px di layar (menggulir)."""
    c.r(ox+19,top+26,3,5,shirt)                          # lengan atas (lengan kaus)
    c.r(ox+19,top+31,3,3,skin); c.hl(ox+19,ox+21,top+33,skin_d)   # siku
    px,py=ox+14,top+26                                   # pojok kiri atas HP (5x7)
    c.r(px,py,5,7,DUSK)
    c.r(px+1,py+1,3,4,SIANG3); c.hl(px+1,px+3,py+4,SIANG2)        # layar menyala, tanpa tulisan
    c.r(px+1,py+5,5,3,skin); c.hl(px+1,px+5,py+7,skin_d)          # telapak menggenggam bagian bawah HP
    c.r(px-1,py+4,1,3,skin)                              # jari di sisi kiri HP
    c.p(px+3,py+3-frame,skin)                            # ibu jari
def _glasses(c,hx,hy,frame_c=SLATE):
    """Kacamata pada kepala 18x18: bingkai tipis di sekitar mata + kilau putih; gagang menuju telinga."""
    ey=hy+8
    c.hl(hx+11,hx+14,ey-1,frame_c); c.hl(hx+11,hx+14,ey+2,frame_c); c.vl(hx+11,ey-1,ey+2,frame_c)   # lensa dekat
    c.hl(hx+15,hx+17,ey-1,frame_c); c.hl(hx+15,hx+17,ey+2,frame_c)                                 # lensa jauh (terpotong profil)
    c.vl(hx+14,ey,ey+1,frame_c); c.hl(hx+7,hx+10,ey,frame_c)                                       # jembatan + gagang
    c.p(hx+13,ey,WHITE)                                                                            # kilau lensa
def _head(c,hx,hy,skin,skin_d,hair,style,expr,hijab=(WHITE,MIST,SLATE),glasses=False):
    """Kepala 18x18 (pojok kiri atas hx,hy) + rambut atau kerudung + wajah. Dipakai student(), rider(), teacher()."""
    c.r(hx,hy,18,18,skin)
    for (dx,dy) in ((0,0),(17,0),(0,17),(17,17)): c.p(hx+dx,hy+dy,T)
    c.r(hx+1,hy+15,1,2,skin_d)  # bayangan rahang belakang
    if style=='poni':        # rambut pendek berponi (Nara)
        c.r(hx,hy-2,18,7,hair); c.r(hx+1,hy-3,16,1,hair)
        c.r(hx,hy+5,4,8,hair); c.r(hx+4,hy+5,2,3,hair)        # sisi belakang
        c.r(hx+11,hy+5,7,2,hair); c.p(hx+17,hy+7,hair)         # poni
        c.r(hx+5,hy+10,2,3,skin_d)                             # telinga
    elif style=='cepak':     # rambut cepak tanpa poni, jambul kecil di depan (Dimas)
        c.r(hx,hy-2,18,6,hair); c.r(hx+1,hy-3,16,1,hair); c.r(hx+11,hy-4,6,1,hair)
        c.r(hx,hy+4,4,6,hair); c.r(hx+4,hy+4,2,2,hair)         # sisi belakang
        c.r(hx+5,hy+10,2,3,skin_d)                             # telinga
    elif style=='kerudung':  # kerudung: menutup rambut, telinga, leher, dan bahu (Sinta)
        hj,hj_d,hj_e=hijab   # dasar, bayangan, garis lipatan/tepi
        c.r(hx,hy,18,18,hj); c.r(hx+1,hy-1,16,1,hj); c.r(hx+3,hy-2,12,1,hj)    # kubah kepala membulat
        c.r(hx+17,hy+1,2,4,hj)                                                   # tepi depan kerudung sedikit menjorok
        c.dither(hx,hy-1,5,19,hj_d,only=hj)                                      # bayangan sisi belakang kepala
        c.r(hx+6,hy+5,12,12,skin)                                               # bukaan wajah (oval)
        for (x,y) in ((hx+6,hy+5),(hx+7,hy+5),(hx+6,hy+6),(hx+6,hy+15),(hx+6,hy+16),(hx+7,hy+16),(hx+17,hy+16)): c.p(x,y,hj)
        c.vl(hx+5,hy+7,hy+14,hj_d); c.hl(hx+8,hx+18,hy+4,hj_d)                   # lipatan di tepi wajah dan dahi
        # juntai menutup leher, bahu, dan dada; ujung depan sedikit lebih panjang
        c.r(hx-1,hy+18,20,6,hj); c.r(hx,hy+24,18,1,hj); c.r(hx+8,hy+25,8,1,hj)
        c.dither(hx-1,hy+18,7,6,hj_d,only=hj)                                    # bayangan juntai belakang
        for x in range(hx-1,hx+19):                                              # garis tepi bawah juntai + bayangannya
            yb=hy+25 if hx+8<=x<=hx+15 else (hy+23 if x in (hx-1,hx+18) else hy+24)
            c.p(x,yb,hj_e)
            if 0<=x<c.w and 0<=yb+1<c.h and c.px[x,yb+1]==WHITE: c.p(x,yb+1,MIST)
    elif style=='bob':       # rambut bob sebatas rahang, belah samping (Bu Ratih)
        c.r(hx,hy-2,18,6,hair); c.r(hx+1,hy-3,16,1,hair)
        c.r(hx-1,hy+1,6,15,hair); c.r(hx+5,hy+4,1,5,hair)                           # sisi belakang menutup telinga
        c.r(hx+6,hy+4,8,1,hair); c.r(hx+6,hy+5,3,1,hair)                            # poni menyamping
        c.p(hx-1,hy+1,T)
    elif style=='mangkuk':   # potongan mangkuk, poni rata di dahi (Komang)
        c.r(hx,hy-2,18,8,hair); c.r(hx+1,hy-3,16,1,hair)
        c.r(hx,hy+6,5,6,hair); c.p(hx+17,hy+6,hair)
        c.r(hx+5,hy+10,2,3,skin_d)                                                  # telinga
    elif style=='jabrik':    # rambut pendek berdiri di atas (siswa yang merekam)
        c.r(hx,hy-2,18,6,hair); c.r(hx+1,hy-3,16,1,hair)
        for x in (hx+2,hx+6,hx+10,hx+14): c.r(x,hy-4,2,1,hair); c.p(x+1,hy-5,hair)  # jabrik
        c.r(hx,hy+4,4,7,hair); c.r(hx+12,hy+4,6,1,hair)
        c.r(hx+5,hy+10,2,3,skin_d)
    elif style=='tipis':     # rambut pendek menipis di dahi (Pak Made)
        c.r(hx,hy-2,18,4,hair); c.r(hx+1,hy-3,16,1,hair)
        c.r(hx,hy+2,5,8,hair); c.r(hx+5,hy+2,3,2,hair)
        c.r(hx+5,hy+10,2,3,skin_d)
    elif style=='plontos':   # rambut sangat pendek mengikuti bentuk kepala (warga)
        c.r(hx,hy-1,18,4,hair); c.r(hx+1,hy-2,16,1,hair); c.r(hx,hy+3,4,6,hair)
        c.r(hx+5,hy+10,2,3,skin_d)
    elif style=='rapi':      # rambut pendek rapi belah samping (Bayu)
        c.r(hx,hy-2,18,6,hair); c.r(hx+1,hy-3,16,1,hair)
        c.r(hx,hy+4,4,7,hair); c.r(hx+11,hy+4,7,1,hair); c.p(hx+16,hy+5,hair); c.p(hx+17,hy+5,hair)
        c.r(hx+5,hy+10,2,3,skin_d)
    elif style=='keriting':  # rambut pendek keriting bervolume (warga)
        c.r(hx-1,hy-2,20,7,hair); c.r(hx+1,hy-3,16,1,hair)
        for x in range(hx,hx+18,3): c.p(x+1,hy-4,hair)                              # ikal di puncak
        c.r(hx-1,hy+5,6,9,hair)
        for y in range(hy-1,hy+14,3): c.p(hx-2,y+1,hair)                            # ikal di sisi
        c.r(hx+11,hy+5,4,1,hair); c.p(hx+17,hy+5,hair)
    elif style=='kuncir':    # rambut dikuncir kuda dengan poni samping (siswi)
        c.r(hx,hy-2,18,7,hair); c.r(hx+1,hy-3,16,1,hair)
        c.r(hx,hy+5,4,6,hair); c.r(hx+11,hy+5,7,1,hair)
        c.r(hx-3,hy+2,3,10,hair); c.r(hx-2,hy+12,2,2,hair); c.r(hx-1,hy+1,2,2,BERRY)   # kuncir + ikat rambut
        c.r(hx+5,hy+10,2,3,skin_d)
    far=(hx+18,hy+12); keep=c.px[far] if far[0]<c.w else None   # face('happy') menaruh pipi kedua di luar kepala
    face(c,hx,hy,expr,skin_d)
    if keep is not None: c.p(far[0],far[1],keep)                 # kembalikan piksel itu
    if glasses: _glasses(c,hx,hy)
def student(pose='idle',frame=0,expr=None,shirt=WHITE,shirt_d=MIST,bottom=NAVY,skin=SK2,skin_d=SK3,hair=HR1,bag=True,pocket=True,
            hair_style='poni',hijab=(WHITE,MIST,SLATE),long_sleeves=False,skirt=False,happy_arms='up',
            short=0,baggy=False,torn_shoe=False):
    W,Hh=26,62; c=C(W,Hh); ox,oy=1,1
    expr=expr or {'idle':'neutral','talk':'talk' if frame==0 else 'neutral','happy':'happy','sad':'sad','walk':'neutral',
                  'phone':'down','shoe':'sad','record':'laugh' if frame==0 else 'laugh2',
                  'giggle':'laugh' if frame==0 else 'laugh2'}[pose]
    bob=1 if (pose in ('idle','phone','shoe','record','giggle') and frame==1) else 0
    sad=1 if pose in ('sad','shoe') else 0
    top=oy+bob+sad+short   # bagian atas tubuh turun saat napas / sedih; 'short' = tokoh lebih pendek (kelas VII)
    # --- kaki & sepatu ---
    if skirt:   # rok panjang sedikit melebar ke bawah, dengan lipit
        for i,y in enumerate(range(oy+41,oy+57)):
            ext=i//8
            c.r(ox+6-ext,y,12+2*ext,1,bottom)
        c.vl(ox+9,oy+48,oy+56,DUSK); c.vl(ox+14,oy+48,oy+56,DUSK)
        c.r(ox+5,oy+57,7,3,INK); c.r(ox+13,oy+57,7,3,INK)
    else:
        lo={0:(0,0),1:(-2,2),2:(0,0),3:(2,-2)}[frame] if pose=='walk' else (0,0)
        c.r(ox+6+lo[0],oy+42,5,15,bottom); c.r(ox+13+lo[1],oy+42,5,15,bottom)
        c.r(ox+6,oy+41,12,4,bottom); c.vl(ox+12,oy+45,oy+56,INK) if pose!='walk' else None
        if baggy:   # celana kebesaran: ujung celana melebar dan menumpuk di atas sepatu
            c.r(ox+5,oy+53,6,4,bottom); c.r(ox+13,oy+53,6,4,bottom); c.hl(ox+5,ox+10,oy+54,DUSK); c.hl(ox+13,ox+18,oy+54,DUSK)
        c.r(ox+5+lo[0],oy+57,7,3,INK)
        if pose=='shoe':     # sepatu depan dilepas: kaki berkaus kaki putih
            c.r(ox+14,oy+57,4,1,WHITE); c.r(ox+14,oy+58,6,2,WHITE); c.hl(ox+14,ox+19,oy+59,MIST)
        else:
            c.r(ox+13+lo[1],oy+57,7,3,INK)
            if torn_shoe: c.r(ox+16+lo[1],oy+58,4,1,WHITE)   # sol depan menganga, kaus kaki terlihat
    c.hl(ox+6,ox+17,oy+40+bob,INK)  # ikat pinggang
    # --- tas punggung (di belakang, sisi kiri) ---
    if bag:
        c.r(ox+0,top+27,5,12,SUN); c.r(ox+0,top+35,5,4,MANGO); c.hl(ox+1,ox+3,top+30,MANGO)
    # --- badan/kemeja ---
    hem=3 if baggy else 0   # kemeja kebesaran: lebih panjang, tidak dimasukkan, ujungnya melebar
    c.r(ox+5,top+25,14,16-bob+hem,shirt); c.vl(ox+18,top+25,top+39+hem,shirt_d)
    if baggy: c.r(ox+4,top+38+hem-bob,16,3,shirt); c.hl(ox+4,ox+19,top+40+hem-bob,shirt_d)
    c.p(ox+11,top+25,skin); c.p(ox+12,top+25,skin); c.p(ox+11,top+26,skin_d); c.p(ox+12,top+26,skin_d)  # kerah V
    if pocket: c.hl(ox+7,ox+9,top+29,shirt_d)  # saku
    if bag: c.vl(ox+8,top+25,top+35,MANGO)  # tali tas
    # --- lengan ---
    if pose=='happy' and happy_arms in ('up','clasp'):
        if happy_arms=='clasp':   # lengan atas di sisi badan (tertutup juntai kerudung); lengan bawah digambar setelah kepala
            for ax in (ox+2,ox+19):
                c.r(ax,top+26,3,8,shirt)
                if long_sleeves: c.vl(ax+(2 if ax==ox+2 else 0),top+26,top+33,shirt_d)
        # happy_arms 'up': lengan terangkat digambar setelah kepala
    else:
        sw={0:(0,0),1:(1,-1),2:(0,0),3:(-1,1)}[frame] if pose=='walk' else (0,0)
        sl=8 if baggy else 6   # panjang lengan baju
        for ax,s in ((ox+2,sw[0]),(ox+19,sw[1])):
            if pose=='phone' and ax==ox+19: continue   # lengan depan memegang HP
            if pose in ('record','giggle') and ax==ox+19: continue   # lengan depan digambar setelah kepala
            if pose=='shoe':   # lengan atas saja; lengan bawah dan sepatu digambar di bawah
                c.r(ax,top+26,3,sl,shirt); continue
            if long_sleeves:   # lengan panjang sampai pergelangan; sisi dalam dan manset sewarna bayangan
                c.r(ax+s,top+26,3,10,shirt); c.vl(ax+s+(2 if ax==ox+2 else 0),top+26,top+35,shirt_d)
                c.hl(ax+s,ax+s+2,top+35,shirt_d); c.r(ax+s,top+36,3,2,skin); c.r(ax+s,top+37,3,1,skin_d)
            elif baggy:        # lengan baju kebesaran sampai siku
                c.r(ax+s,top+26,3,sl,shirt); c.r(ax+s,top+26+sl,3,12-sl,skin); c.r(ax+s,top+37,3,1,skin_d)
            else:
                c.r(ax+s,top+26,3,6,shirt); c.r(ax+s,top+32,3,6,skin); c.r(ax+s,top+37,3,1,skin_d)
        if pose=='phone': _phone_arm(c,ox,top,frame,shirt,skin,skin_d)
        if pose=='shoe':       # menunduk memegang sepatu robek dengan dua tangan di depan perut
            ey=top+26+sl
            c.r(ox+3,ey,3,2,skin); c.r(ox+5,ey+1,3,2,skin); c.r(ox+18,ey,3,2,skin); c.r(ox+16,ey+1,3,2,skin)
            c.r(ox+7,ey+1,9,3,INK); c.r(ox+11,ey+2,4,1,WHITE)               # sepatu, sol menganga
            c.r(ox+6,ey+1,2,3,skin); c.r(ox+15,ey+1,2,3,skin); c.hl(ox+6,ox+16,ey+3,skin_d)   # jari memegang sepatu
    # --- leher & kepala ---
    c.r(ox+10,top+23,4,2,skin_d)
    _head(c,ox+3,top+5,skin,skin_d,hair,hair_style,expr,hijab)
    if pose=='happy' and happy_arms=='clasp':   # tangan bertaut di dada
        fa,fa_d=(shirt,shirt_d) if long_sleeves else (skin,skin_d)
        c.r(ox+4,top+31,4,3,fa); c.r(ox+7,top+30,3,3,fa); c.hl(ox+4,ox+9,top+33,fa_d)
        c.r(ox+15,top+31,4,3,fa); c.r(ox+13,top+30,3,3,fa); c.hl(ox+13,ox+18,top+33,fa_d)
        c.r(ox+10,top+29,4,3,skin); c.hl(ox+10,ox+13,top+31,skin_d)
    elif pose=='happy' and happy_arms=='up':
        for ax in (ox+0,ox+21):
            if long_sleeves:
                c.r(ax,top+10,3,14,shirt); c.hl(ax,ax+2,top+10,shirt_d); c.r(ax,top+8,3,2,skin)   # tangan terangkat
                c.vl(ax+(2 if ax==ox+0 else 0),top+11,top+23,shirt_d)
            else:
                c.r(ax,top+12,3,12,shirt); c.r(ax,top+8,3,4,skin)   # tangan terangkat
    elif pose=='record':     # merekam: HP mendatar di depan dagu, lampu rekam menyala; tertawa
        c.r(ox+19,top+26,3,3,shirt)                                         # lengan atas
        c.r(ox+20,top+25,3,4,skin); c.p(ox+20,top+28,skin_d)                # lengan bawah tertekuk ke atas
        px,py=ox+17,top+21
        c.r(px,py,7,4,DUSK); c.r(px+1,py+1,4,2,SIANG3); c.p(px+5,py+1,CORAL)   # HP: layar + lampu rekam
        c.r(px+4,py+3,3,2,skin)                                             # jari menahan HP
    elif pose=='giggle':     # ikut menertawakan: telapak menutup mulut, sedikit menonjol di depan wajah
        c.r(ox+19,top+26,3,5,shirt)                                         # lengan atas (lengan baju)
        c.r(ox+19,top+31,3,2,skin); c.r(ox+20,top+22,3,9,skin); c.vl(ox+20,top+22,top+30,skin_d)   # lengan bawah naik
        c.r(ox+17,top+18,6,4,skin); c.vl(ox+17,top+18,top+21,skin_d); c.hl(ox+17,ox+22,top+21,skin_d)  # telapak di mulut
        c.p(ox+22,top+18,skin_d)                                            # ujung jari
    c.outline(); return c
def sinta(pose='idle',frame=0):
    """Sinta: student() dengan kerudung; sedih memakai alis 'worried' agar alis tidak menempel di tepi kerudung."""
    return student(pose,frame,expr='worried' if pose=='sad' else None,**SINTA)
def komang(pose='idle',frame=0):
    """Komang: adik kelas VII, lebih pendek 2 px, seragam kebesaran, sepatu depan robek.
    Pose: 'idle' (2), 'shoe' (2: menunduk memegang sepatu), 'happy' (1: lega, mata terpejam lega)."""
    return student(pose,frame,expr='relief' if pose=='happy' else None,**KOMANG)
def siswa_merekam(frame=0):
    """Siswa yang merekam dengan HP sambil tertawa (tanpa kekerasan)."""
    return student('record',frame,**SISWA_A)
def siswa_tertawa(frame=0):
    """Siswi yang ikut menertawakan, telapak menutup mulut (tanpa kekerasan)."""
    return student('giggle',frame,**SISWA_B)
def student_sit(pose='happy',shirt=TEAL,shirt_d=GRASS,bottom=DUSK,bottom_d=NAVY,skin=SK2,skin_d=SK3,hair=HR1,hair_style='poni'):
    """Siswa duduk menghadap kanan, khusus ilustrasi akhir (32x57). Kepala, badan, dan lengan sama dengan student();
    paha mendatar di atas dudukan (dudukan tepat di bawah baris 46), betis turun ke lantai; baris terbawah = garis lantai.
    pose: 'happy' (menggenggam gelas teh hangat), 'think' (siku di paha, kepalan menopang dagu),
          'hope' (bahu sedikit turun, tangan bertaut di pangkuan, mata berbinar menatap ke atas)."""
    W,Hh=32,57; c=C(W,Hh); ox,lb=1,1
    top=lb+(1 if pose=='hope' else 0)                   # hanya badan atas yang turun; kaki tetap
    # --- kaki: paha mendatar, betis turun, alas kaki ---
    c.r(ox+6,lb+41,19,5,bottom); c.hl(ox+6,ox+24,lb+45,bottom_d)            # paha (sisi bawah bayangan)
    c.r(ox+16,lb+46,4,6,bottom_d); c.r(ox+21,lb+46,4,6,bottom)             # betis jauh (lebih gelap) + dekat
    c.vl(ox+20,lb+46,lb+51,INK)
    c.r(ox+15,lb+52,6,3,INK); c.r(ox+21,lb+52,7,3,INK)                      # alas kaki
    # --- badan ---
    c.r(ox+5,top+25,14,16-(top-lb),shirt); c.vl(ox+18,top+25,top+39-(top-lb),shirt_d)
    c.p(ox+11,top+25,skin); c.p(ox+12,top+25,skin); c.p(ox+11,top+26,skin_d); c.p(ox+12,top+26,skin_d)   # kerah V
    c.r(ox+2,top+26,3,6,shirt); c.r(ox+2,top+32,3,6,skin); c.r(ox+2,top+37,3,1,skin_d)                   # lengan belakang
    # --- leher & kepala ---
    c.r(ox+10,top+23,4,2,skin_d)
    _head(c,ox+3,top+5,skin,skin_d,hair,hair_style,{'happy':'happy','think':'think','hope':'hope'}[pose])
    # --- lengan depan ---
    if pose=='happy':      # menggenggam gelas teh hangat di depan dada; uap tipis
        c.r(ox+19,top+26,3,5,shirt); c.r(ox+19,top+31,3,3,skin); c.hl(ox+19,ox+21,top+33,skin_d)   # lengan atas + siku
        gx,gy=ox+15,top+29
        c.r(gx,gy,5,6,WHITE); c.vl(gx+4,gy,gy+5,MIST); c.hl(gx,gx+4,gy+2,ROSE); c.r(gx+1,gy,3,1,MANGO)   # gelas + teh
        c.r(gx-1,gy+3,1,3,skin); c.r(gx+1,gy+4,6,3,skin); c.hl(gx+1,gx+6,gy+6,skin_d)                  # tangan
        c.p(gx+1,gy-2,WHITE); c.p(gx+2,gy-3,WHITE); c.p(gx+3,gy-2,MIST)                               # uap
    elif pose=='think':    # siku di paha, lengan bawah naik di depan badan, kepalan di bawah dagu
        c.r(ox+19,top+26,3,5,shirt); c.r(ox+19,top+31,3,8,skin)
        c.r(ox+21,top+24,3,15,skin); c.vl(ox+23,top+24,top+38,skin_d)
        c.r(ox+19,top+20,5,4,skin); c.hl(ox+19,ox+23,top+23,skin_d); c.p(ox+19,top+20,skin_d)
    else:                  # 'hope': kedua tangan bertaut di pangkuan
        c.r(ox+19,top+26,3,6,shirt); c.r(ox+19,top+32,3,6,skin)
        c.r(ox+16,top+37,7,3,skin); c.hl(ox+16,ox+22,top+39,skin_d)
    c.outline(); return c
def nara_duduk(pose='happy'):
    """Nara duduk di bangku teras malam (layar akhir), memakai pakaian rumah yang sama dengan A-06 (NARA_RUMAH)."""
    return student_sit(pose,shirt=NARA_RUMAH['shirt'],shirt_d=NARA_RUMAH['shirt_d'],bottom=NARA_RUMAH['bottom'])
def _motor(c,ox,gy,body=MANGO,body_d=CORAL,body_l=SUN):
    """Motor matik generik menghadap kanan: tanpa merek, logo, atau pelat nomor. gy = baris tanah (bawah ban)."""
    rx,fx,wy=ox+10,ox+43,gy-6                            # pusat ban belakang, ban depan, tinggi as roda
    c.r(ox+3,gy-11,12,2,SLATE); c.hl(ox+3,ox+14,gy-11,MIST)              # knalpot
    for cx in (rx,fx):                                                     # ban, pelek, as
        c.disc(cx,wy,6,DUSK); c.disc(cx,wy,3,SLATE); c.r(cx-1,wy-1,3,3,MIST); c.p(cx,wy,SLATE)
    c.r(fx-1,gy-16,2,8,SLATE)                                              # garpu depan (berhenti di atas as)
    c.r(fx-6,gy-15,12,2,body); c.p(fx-7,gy-14,body); c.p(fx+6,gy-14,body); c.hl(fx-5,fx+4,gy-13,body_d)   # spakbor
    # bodi belakang di bawah jok, ujung belakang mengecil
    c.r(ox+4,gy-21,24,10,body); c.r(ox+2,gy-19,2,6,body); c.p(ox+3,gy-20,body)
    c.hl(ox+4,ox+27,gy-21,body_l); c.r(ox+5,gy-12,18,1,body_d)
    c.r(ox+2,gy-18,2,2,ROSE)                                               # lampu belakang
    c.r(ox+27,gy-13,9,3,body); c.hl(ox+27,ox+35,gy-13,DUSK); c.hl(ox+27,ox+35,gy-11,body_d)   # dek injakan kaki
    for y in range(gy-31,gy-10):                                           # perisai depan miring ke depan
        x0=ox+33+(gy-11-y)//5
        c.r(x0,y,6,1,body); c.p(x0+5,y,body_d); c.p(x0,y,body_l)
    c.r(ox+36,gy-34,9,4,body); c.hl(ox+36,ox+44,gy-34,body_l)              # penutup stang
    c.r(ox+44,gy-33,2,3,WHITE); c.p(ox+45,gy-33,SUN)                       # lampu depan
    c.vl(ox+38,gy-38,gy-35,SLATE); c.r(ox+37,gy-40,3,2,SLATE); c.hl(ox+37,ox+39,gy-40,MIST)   # spion
    c.r(ox+4,gy-24,24,3,DUSK); c.hl(ox+5,ox+26,gy-24,SLATE)               # jok (bagian belakang kosong untuk pembonceng)
def rider(pose='offer',frame=0,skin=SK3,skin_d=SK4,hair=HR1,hair_style='cepak',jacket=SKYD,jacket_d=NAVY,bottom=NAVY):
    """Siswa duduk di motor matik, menghadap kanan, kanvas 56x62. Pose: 'offer' (2 bingkai: bicara sambil
    menepuk jok belakang = menawarkan boncengan), 'happy' (jempol), 'sad' (menunduk, kedua tangan di stang).
    Tanpa helm sesuai naskah adegan 2."""
    W,Hh=56,62; c=C(W,Hh); ox,oy=2,1
    gy=Hh-2                                   # baris tanah (bawah ban); garis luar di baris terakhir
    top=oy+(1 if pose=='sad' else 0)          # sedih: badan atas turun 1 px
    _motor(c,ox,gy)
    # kaki: paha mendatar ke depan, betis turun ke dek, sepatu di dek
    c.r(ox+15,gy-25,13,5,bottom); c.r(ox+24,gy-22,5,9,bottom); c.r(ox+23,gy-15,8,3,INK)
    # badan: jaket terbuka, kemeja putih dan kerah V terlihat
    c.r(ox+10,top+25,14,14,jacket); c.vl(ox+23,top+25,top+37,jacket_d)
    c.r(ox+18,top+25,3,8,WHITE); c.p(ox+19,top+25,skin); c.p(ox+19,top+26,skin_d)
    # lengan depan memegang stang
    c.r(ox+21,top+27,4,4,jacket); c.r(ox+24,top+28,11,3,jacket); c.hl(ox+24,ox+34,top+30,jacket_d)
    c.r(ox+34,top+27,3,3,skin); c.p(ox+34,top+29,skin_d)
    # lengan belakang
    if pose=='happy':      # jempol terangkat di samping kepala
        c.r(ox+6,top+26,3,4,jacket); c.r(ox+3,top+16,3,13,jacket)
        c.r(ox+3,top+12,3,4,skin); c.p(ox+4,top+10,skin); c.p(ox+4,top+11,skin)
    elif pose=='offer':    # menepuk jok belakang; bingkai 1 tangan terangkat 2 px
        lift=2 if frame==1 else 0
        c.r(ox+8,top+26,3,5,jacket); c.r(ox+6,top+30-lift,3,5,jacket)
        c.r(ox+4,top+34-lift,4,2,skin); c.hl(ox+4,ox+7,top+35-lift,skin_d)
    # 'sad': lengan belakang tertutup badan (kedua tangan di stang)
    c.r(ox+15,top+23,4,2,skin_d)                                            # leher
    expr={'offer':'talk' if frame==0 else 'neutral','happy':'happy','sad':'sad'}[pose]
    _head(c,ox+8,top+5,skin,skin_d,hair,hair_style,expr)
    c.outline(); return c
def dimas(pose='offer',frame=0):
    """Dimas: teman sekelas, jaket sky-d di atas seragam, di atas motor tanpa helm."""
    return rider(pose,frame,**DIMAS)
def _batik(c,x0,y0,w,h,base,motif,accent):
    """Pola batik sederhana: belah ketupat kecil berulang (selang-seling) dengan titik tengah, hanya di atas warna dasar."""
    for y in range(y0,y0+h):
        for x in range(x0,x0+w):
            if not (0<=x<c.w and 0<=y<c.h) or c.px[x,y]!=base: continue
            u,v=(x-x0+(3 if ((y-y0)//4)%2 else 0))%6,(y-y0)%4
            if (u,v) in ((2,0),(1,1),(3,1),(2,2)): c.p(x,y,motif)
            elif (u,v)==(2,1): c.p(x,y,accent)
def teacher(pose='idle',frame=0,skin=SK4,skin_d=HR2,hair=HR1,hair_style='bob',top_c=TEAL,top_d=GRASS,top_l=SUN,
            skirt_c=WOODD,skirt_d=HR2,book=MANGO,book_d=CORAL,glasses=True):
    """Guru perempuan dewasa (30x68): kemeja batik lengan panjang, rok panjang, kacamata, memeluk buku catatan.
    Pose: 'idle' (2 bingkai, napas, senyum ramah), 'talk' (2 bingkai: mulut + tangan depan menjelaskan)."""
    W,Hh=30,68; c=C(W,Hh); ox,oy=1,1
    bob=1 if (pose=='idle' and frame==1) else 0
    top=oy+bob
    # pergelangan kaki & sepatu
    c.r(ox+9,oy+61,3,2,skin); c.r(ox+15,oy+61,3,2,skin); c.r(ox+8,oy+63,5,3,INK); c.r(ox+14,oy+63,5,3,INK)
    # rok panjang, sedikit melebar ke bawah, dengan lipatan
    for i,y in enumerate(range(oy+42,oy+61)):
        ext=i//10
        c.r(ox+6-ext,y,16+2*ext,1,skirt_c)
    c.vl(ox+10,oy+47,oy+60,skirt_d); c.vl(ox+16,oy+47,oy+60,skirt_d); c.vl(ox+21,oy+42,oy+60,skirt_d)
    # kemeja batik
    c.r(ox+6,top+27,15,16-bob,top_c)
    _batik(c,ox+6,top+27,14,16-bob,top_c,top_d,top_l)
    c.vl(ox+20,top+27,top+42-bob,top_d)                                   # bayangan sisi depan
    c.p(ox+12,top+27,skin); c.p(ox+13,top+27,skin); c.p(ox+12,top+28,skin_d); c.p(ox+13,top+28,skin_d)   # kerah V
    # lengan belakang memeluk buku di dada (lengan bawah tersembunyi di balik buku)
    c.r(ox+3,top+28,3,8,top_c); c.vl(ox+5,top+28,top+35,top_d)            # lengan atas
    c.r(ox+6,top+30,7,9,book); c.vl(ox+12,top+31,top+38,CREAM); c.hl(ox+6,ox+11,top+38,book_d)   # buku + tepi halaman
    c.r(ox+5,top+34,2,3,skin); c.p(ox+5,top+36,skin_d)                    # jari memegang tepi buku
    # lengan depan
    if pose=='talk':      # menjelaskan: lengan bawah ke depan, telapak terbuka; bingkai 1 sedikit turun
        d=0 if frame==0 else 2
        c.r(ox+21,top+28,3,6,top_c); c.vl(ox+21,top+28,top+33,top_d)
        c.r(ox+22,top+33+d,4,3,top_c); c.hl(ox+22,ox+25,top+35+d,top_d)
        c.r(ox+26,top+31+d,2,4,skin); c.p(ox+26,top+34+d,skin_d)
    else:
        c.r(ox+21,top+28,3,11,top_c); c.vl(ox+21,top+28,top+38,top_d); c.r(ox+21,top+39,3,2,skin); c.hl(ox+21,ox+23,top+40,skin_d)
    # leher & kepala
    c.r(ox+11,top+25,4,2,skin_d)
    expr='talk' if (pose=='talk' and frame==0) else 'smile'
    _head(c,ox+4,top+7,skin,skin_d,hair,hair_style,expr,glasses=glasses)
    c.outline(); return c
def ratih(pose='idle',frame=0):
    """Bu Ratih: guru BK, ramah dan membantu."""
    return teacher(pose,frame,**RATIH)
def _plaid(c,x0,y0,w,h,base,line):
    """Motif kotak-kotak (sarung): garis terang mendatar dan tegak tiap 5 px, hanya di atas warna dasar."""
    for y in range(y0,y0+h):
        for x in range(x0,x0+w):
            if not (0<=x<c.w and 0<=y<c.h) or c.px[x,y]!=base: continue
            if (x-x0)%5==2 or (y-y0)%5==2: c.p(x,y,line)
def adult(pose='idle',frame=0,expr='neutral',skin=SK3,skin_d=SK4,hair=HR1,hair_style='cepak',
          top_c=MIST,top_d=SLATE,bottom='pants',bottom_c=DUSK,bottom_d=NAVY,bottom_l=SKYD,feet='sandal',mustache=None):
    """Orang dewasa 30x68, proporsi sama dengan mother()/teacher(): kepala 18x18 di (ox+4, top+7), kaus lengan pendek.
    bottom: 'pants' | 'shorts' | 'sarung' (kotak-kotak) | 'skirt'. feet: 'sandal' | 'sneaker'.
    pose (gerak lengan): 'idle' | 'point' (menunjuk ke depan) | 'cross' (bersedekap) | 'scratch' (menggaruk kepala) |
    'wave' (melambai) | 'chest' (telapak di dada) | 'slump' (menunduk: badan atas turun 1 px, lengan tergantung).
    Bingkai 1 pada pose diam/bersedekap/menggaruk: badan turun 1 px (napas)."""
    W,Hh=30,68; c=C(W,Hh); ox,oy=1,1
    bob=1 if (pose in ('idle','cross','scratch') and frame==1) else 0
    top=oy+bob+(1 if pose=='slump' else 0)
    # --- alas kaki (baris terbawahnya selalu oy+65, tepat di atas garis luar di garis lantai) ---
    hem=oy+62 if feet=='sneaker' else oy+61   # baris terakhir bawahan
    if feet=='sneaker':
        c.r(ox+7,oy+63,6,3,WHITE); c.r(ox+14,oy+63,6,3,WHITE); c.hl(ox+7,ox+12,oy+65,MIST); c.hl(ox+14,ox+19,oy+65,MIST)
    else:
        c.r(ox+9,oy+62,3,2,skin); c.r(ox+15,oy+62,3,2,skin); c.r(ox+8,oy+64,5,1,WOODD); c.r(ox+14,oy+64,5,1,WOODD)
        c.r(ox+8,oy+65,5,1,HR2); c.r(ox+14,oy+65,5,1,HR2)
    # --- bawahan ---
    if bottom=='sarung':     # sarung kotak-kotak dengan gulungan di pinggang
        for i,y in enumerate(range(oy+42,hem+1)):
            ext=i//10
            c.r(ox+6-ext,y,15+2*ext,1,bottom_c)
        _plaid(c,ox+5,oy+44,17,hem-oy-43,bottom_c,bottom_l)
        c.r(ox+6,oy+42,15,2,bottom_d)                                              # gulungan di pinggang
    elif bottom=='skirt':
        for i,y in enumerate(range(oy+42,hem+1)):
            ext=i//10
            c.r(ox+6-ext,y,15+2*ext,1,bottom_c)
        c.vl(ox+10,oy+47,hem,bottom_d); c.vl(ox+16,oy+47,hem,bottom_d)
    else:                    # celana panjang / pendek
        c.r(ox+7,oy+42,13,4,bottom_c)
        legs_end=oy+51 if bottom=='shorts' else hem
        c.r(ox+8,oy+44,5,legs_end-oy-43,bottom_c); c.r(ox+14,oy+44,5,legs_end-oy-43,bottom_c)
        c.vl(ox+13,oy+46,legs_end,INK)
        if bottom=='shorts':
            c.r(ox+9,oy+52,3,10,skin); c.r(ox+15,oy+52,3,10,skin); c.vl(ox+11,oy+52,oy+61,skin_d)
        c.vl(ox+18,oy+44,legs_end,bottom_d)
    # --- kaus ---
    c.r(ox+6,top+27,15,16-bob,top_c); c.vl(ox+20,top+27,top+42-bob,top_d)
    c.r(ox+11,top+27,4,1,skin); c.hl(ox+12,ox+13,top+28,skin_d)                  # leher kaus
    # --- lengan ---
    def sleeve(ax): c.r(ax,top+28,3,5,top_c)
    def hang(ax): sleeve(ax); c.r(ax,top+33,3,8,skin); c.hl(ax,ax+2,top+40,skin_d)
    back,front=ox+3,ox+21
    if pose=='cross':        # bersedekap: dua lengan bawah menyilang di dada
        sleeve(back); sleeve(front)
        c.r(back,top+33,3,2,skin); c.r(front,top+33,3,2,skin)
        c.r(ox+6,top+33,13,2,skin); c.hl(ox+6,ox+18,top+35,skin_d)                # lengan belakang (bawah)
        c.r(ox+8,top+31,14,2,skin); c.hl(ox+8,ox+21,top+31,skin_d)                # lengan depan (atas)
    else:
        if pose=='scratch':  # lengan belakang menggaruk belakang kepala
            c.r(back-1,top+24,3,5,top_c); c.r(back-1,top+15,3,9,skin); c.r(back,top+12,4,3,skin)
        elif pose=='chest':  # telapak belakang di dada
            sleeve(back); c.r(back,top+33,3,2,skin); c.r(back+3,top+31,6,3,skin); c.hl(back,back+8,top+34,skin_d)
        else:
            hang(back)
        if pose=='point':    # menunjuk ke depan setinggi bahu
            sleeve(front); c.r(front+1,top+30,4,3,skin); c.r(front+4,top+29,2,4,skin); c.p(front+6,top+30,skin)
            c.hl(front+1,front+5,top+32,skin_d)
        elif pose=='wave':   # melambai dengan tangan depan
            c.r(front,top+28,3,3,top_c); c.r(front+2,top+19,3,11,skin); c.r(front+2,top+15,4,4,skin)
            c.vl(front+2,top+19,top+29,skin_d)
        else:
            hang(front)
    # --- leher & kepala ---
    c.r(ox+11,top+25,4,2,skin_d)
    hx,hy=ox+4,top+7
    _head(c,hx,hy,skin,skin_d,hair,hair_style,expr)
    if mustache: c.hl(hx+13,hx+17,hy+13,mustache)
    c.outline(); return c
def made(pose='talk',frame=0):
    """Pak Made: tetangga, kaus mango, sarung kotak-kotak, rambut dan kumis kelabu.
    'talk' (2): bicara cemas sambil menunjuk; 'happy': lega, telapak di dada; 'sad': menunduk, badan turun 1 px."""
    if pose=='talk': return adult('point',frame,'worried_talk' if frame==0 else 'worried',**MADE)
    if pose=='happy': return adult('chest',0,'relief',**MADE)
    return adult('slump',0,'sad',**MADE)
def bayu(pose='idle',frame=0):
    """Bayu: pemuda yang baru pindah, kaus polos mist; digambarkan netral dan ramah.
    'idle' (2): bingung sambil menggaruk kepala; 'happy': lega sambil melambai."""
    if pose=='happy': return adult('wave',0,'relief',**BAYU)
    return adult('scratch',frame,'confused',**BAYU)
def warga_a(frame=0):
    """Warga yang ikut menuduh: bicara keras sambil menunjuk (tanpa kekerasan)."""
    return adult('point',frame,'angry_talk' if frame==0 else 'angry',**WARGA_A)
def warga_b(frame=0):
    """Warga yang ikut menuduh: bersedekap sambil berbicara (tanpa kekerasan)."""
    return adult('cross',frame,'angry_talk' if frame==0 else 'angry',**WARGA_B)
def mother(pose='talk',frame=0):
    W,Hh=30,68; c=C(W,Hh); ox,oy=1,1
    skin,skin_d=SK3,SK4
    top=oy+(1 if pose=='sad' else 0)   # khawatir: badan atas turun 1 px (seperti Nara sedih)
    # kaki & sandal
    c.r(ox+9,oy+60,3,4,skin); c.r(ox+15,oy+60,3,4,skin); c.r(ox+8,oy+64,5,2,WOODD); c.r(ox+14,oy+64,5,2,WOODD)
    # daster
    c.r(ox+6,top+27,15,14-(top-oy),ROSE); c.r(ox+5,oy+41,17,19,ROSE); c.vl(ox+21,oy+41,oy+59,CORAL); c.vl(ox+20,top+27,oy+40,CORAL)
    for (x,y) in ((8,31),(15,35),(10,45),(17,49),(7,53),(13,56),(19,43)):
        yy=(top if y<40 else oy)+y
        c.p(ox+x,yy,WHITE); c.p(ox+x+1,yy,SUN)
    # lengan belakang
    if pose=='happy':      # melambai: siku keluar ke samping, telapak terangkat setinggi pipi
        c.r(ox+2,top+28,4,3,ROSE)                        # lengan atas (lengan daster)
        c.r(ox+0,top+22,3,8,skin); c.hl(ox+0,ox+2,top+29,skin_d)   # lengan bawah tegak, siku di bawah
    elif pose=='sad':      # khawatir: lengan menekuk, telapak di dada
        c.r(ox+3,top+28,3,5,ROSE); c.r(ox+3,top+33,3,2,skin)       # lengan atas + siku
        c.r(ox+6,top+31,5,3,skin); c.hl(ox+3,ox+10,top+34,skin_d)  # lengan bawah naik ke dada
    else:
        c.r(ox+3,oy+28,3,7,ROSE); c.r(ox+3,oy+35,3,7,skin)
    # lengan depan
    c.r(ox+21,top+28,3,6,ROSE); c.r(ox+21,top+34,3,4,skin)
    # keranjang di tangan depan
    c.r(ox+20,top+38,9,8,WOOD); c.hl(ox+20,ox+28,top+41,WOODD); c.hl(ox+20,ox+28,top+44,WOODD)
    c.vl(ox+22,top+33,top+37,WOODD); c.vl(ox+26,top+33,top+37,WOODD); c.hl(ox+22,ox+26,top+33,WOODD)
    c.r(ox+21,top+36,2,2,LEAF); c.r(ox+24,top+35,2,3,CORAL); c.p(ox+27,top+37,LEAF)
    # leher, kepala
    c.r(ox+11,top+25,4,2,skin_d)
    hx,hy=ox+4,top+7
    c.r(hx,hy,18,18,skin)
    for (dx,dy) in ((0,0),(17,0),(0,17),(17,17)): c.p(hx+dx,hy+dy,T)
    c.r(hx,hy-2,18,6,HR2); c.r(hx+1,hy-3,16,1,HR2); c.r(hx,hy+4,5,10,HR2); c.r(hx+11,hy+4,7,1,HR2)
    c.r(hx+2,hy-7,8,5,HR2); c.r(hx+3,hy-8,6,1,HR2)   # sanggul
    c.r(hx+6,hy+9,2,3,skin_d)
    expr={'happy':'happy','sad':'worried'}.get(pose,'talk' if (pose=='talk' and frame==0) else 'neutral')
    face(c,hx,hy,expr,skin_d)
    if pose=='happy': c.p(hx+18,hy+12,T)   # pipi kedua dari face() jatuh di luar kepala Ibu: hapus
    c.outline(); return c
def kid(pose='happy',frame=0):
    W,Hh=24,48; c=C(W,Hh); ox,oy=1,1
    skin,skin_d=SK1,SK2
    top=oy+(1 if pose=='sad' else 0)   # sedih: badan atas turun 1 px
    c.r(ox+5,oy+43,5,3,INK); c.r(ox+12,oy+43,5,3,INK); c.r(ox+6,oy+41,4,2,WHITE); c.r(ox+12,oy+41,4,2,WHITE)
    c.r(ox+6,oy+37,4,4,skin); c.r(ox+12,oy+37,4,4,skin)
    c.r(ox+4,oy+30,14,7,CORAL); c.r(ox+3,oy+34,16,3,CORAL)       # rok merah SD
    c.r(ox+5,top+20,12,10-(top-oy),WHITE); c.vl(ox+16,top+20,oy+29,MIST)
    if pose=='happy':
        c.r(ox+2,top+14,3,7,WHITE); c.r(ox+2,top+11,3,3,skin); c.r(ox+17,top+20,3,5,WHITE); c.r(ox+17,top+25,3,4,skin)
    elif pose=='sad':      # tangan bertaut di depan (sikap anak yang sedang dimarahi)
        c.r(ox+2,top+21,3,5,WHITE); c.r(ox+17,top+21,3,5,WHITE)
        c.r(ox+3,top+26,3,2,skin); c.r(ox+5,top+27,4,2,skin)       # lengan bawah kiri menyerong ke depan
        c.r(ox+15,top+26,3,2,skin); c.r(ox+11,top+27,5,2,skin)     # lengan bawah kanan menyerong ke depan
        c.hl(ox+5,ox+15,top+28,skin_d)
    else:
        c.r(ox+2,top+21,3,5,WHITE); c.r(ox+2,top+26,3,4,skin); c.r(ox+17,top+21,3,5,WHITE); c.r(ox+17,top+26,3,4,skin)
    c.r(ox+9,top+18,4,2,skin_d)
    hx,hy=ox+3,top+4
    c.r(hx,hy,16,15,skin)
    for (dx,dy) in ((0,0),(15,0),(0,14),(15,14)): c.p(hx+dx,hy+dy,T)
    c.r(hx,hy-2,16,6,HR1); c.r(hx+1,hy-3,14,1,HR1); c.r(hx+10,hy+4,6,1,HR1)
    c.r(hx-2,hy+3,3,8,HR1); c.p(hx-1,hy+3,CORAL); c.p(hx-2,hy+3,CORAL)   # kuncir belakang
    c.r(hx+3,hy+8,2,2,skin_d)
    ey=hy+7
    if pose=='sad':   # dimarahi: mata menunduk dengan sudut dalam naik, cemberut, setetes air mata
        c.r(hx+9,ey+1,2,1,INK); c.r(hx+13,ey+1,2,1,INK)
        c.p(hx+10,ey,INK); c.p(hx+13,ey,INK)
        c.hl(hx+11,hx+13,hy+12,INK); c.p(hx+10,hy+13,INK); c.p(hx+14,hy+13,INK)
        c.vl(hx+14,ey+2,ey+3,SIANG1)
    else:
        c.r(hx+9,ey,2,2,INK); c.r(hx+13,ey,2,2,INK)
        if pose=='happy': c.p(hx+10,hy+11,INK); c.p(hx+14,hy+11,INK); c.hl(hx+11,hx+13,hy+12,INK); c.r(hx+8,hy+10,2,1,ROSE)
        else: c.hl(hx+11,hx+13,hy+12,INK)
    c.outline(); return c
