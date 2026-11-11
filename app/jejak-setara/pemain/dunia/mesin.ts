// Mesin dunia layar pemain (spesifikasi JS-07; Architecture 9). Keadaan dunia disimpan di luar React, agar pesan
// `dunia` dan `koreksi` diterima walaupun layar dunia belum terpasang, dan agar 10 pesan per detik tidak memicu
// render React. Setiap bingkai: gerak sendiri, kiriman `gerak`, kamera, pemain lain, potongan peta, lalu gambar.
// JS-08: kejadian yang terlihat (penanda, tokoh, dan properti), gelembung "…" pemain lain, jangkauan Periksa, dan
// laporan berhenti sebelum `periksa` (P-14 sampai P-24).
import { NPC, OBJEK } from "../../assets/manifest";
import { PANDANGAN } from "../../inti/aturan";
import type { PesanPemain, PesanServerPemain } from "../../inti/protokol";
import type { Masa, StatusRuang } from "../../inti/tipe";
import { buatSetAvatar, buatSetSiluet, type AsetDunia, type BuatKanvas, type SetStrip, type Strip } from "./aset";
import { GerakDiri, selangKirim } from "./gerakDiri";
import { ikutiKamera, kameraPusat, type Kamera } from "./kamera";
import { hitungLangit, type Langit, type WaktuRuangKlien } from "./langit";
import { Masukan } from "./masukan";
import { kejadianDalamJangkauan, KejadianKlien, tataLetakKejadian, type LetakTokoh } from "./kejadian";
import { bingkaiTokoh, gambarBingkai, type EkstraGambar, type GerbangGambar, type SpriteGambar, type TokohGambar } from "./penggambar";
import { PemainLain, type InfoPemain } from "./pemainLain";
import { GERBANG, GRID_KAMPUNG, GRID_LOBI, LAPISAN_GAMBAR, OBJEK_PETA, TITIK_MUNCUL, UKURAN_PETA } from "./petaKampung";
import { PengelolaPotongan, type ObjekGambar } from "./potongan";

/** Mulai 10 detik sebelum masa berganti, potongan untuk masa berikutnya disiapkan (P-10). */
export const SIAPKAN_MASA_MS = 10_000;
/** Status yang menampilkan dunia; gerak hanya di tiga yang pertama (P-14). */
const STATUS_GERAK: readonly StatusRuang[] = ["lobi", "hitung_mundur", "main"];

type PesanGerak = Extract<PesanPemain, { t: "gerak" }>;

export interface OpsiBingkai {
  /** Jam lokal (Date.now) dan jam performa untuk selang bingkai. */
  jamLokal: number;
  jamPerforma: number;
  selisihJam: number;
  /** Tidak ada lapisan menyambung, peta besar, atau ajakan putar HP (P-14). */
  bolehGerak: boolean;
  kurangiGerak: boolean;
  bufferedAmount: number;
  kirim: (p: PesanGerak) => boolean;
}

export interface LabelTokoh {
  id: string;
  nama: string;
  x: number; // titik kaki, piksel logis
  y: number;
}

/** Titik tengah halaman lobi, untuk kamera sebelum posisi awal tiba (P-17). */
function tengahLobi(): { x: number; y: number } {
  const n = Math.max(1, TITIK_MUNCUL.length);
  const x = TITIK_MUNCUL.reduce((s, t) => s + t.x, 0) / n;
  const y = TITIK_MUNCUL.reduce((s, t) => s + t.y, 0) / n;
  return { x: x * 16 + 8, y: y * 16 + 12 };
}

export class MesinDunia {
  status: StatusRuang = "lobi";
  waktu: WaktuRuangKlien = { status: "lobi", mulaiPada: null, berakhirPada: null, jedaSejak: null };
  durasiMenit = 15;
  batasPemain = 40;
  diriId: string | null = null;
  readonly gerak = new GerakDiri();
  readonly lain = new PemainLain();
  readonly masukan = new Masukan();
  kamera: Kamera = kameraPusat(tengahLobi(), UKURAN_PETA.lebarPx, UKURAN_PETA.tinggiPx);
  masa: Masa = "pagi";
  langit: Langit | null = null;
  /** Tokoh yang digambar bingkai terakhir; label nama dihitung dari sini. */
  tokoh: (TokohGambar & { nama: string; diri: boolean })[] = [];
  siluetTerakhir = false;
  /** Kejadian yang terlihat dan selesai di layar ini (JS-08). */
  readonly kejadian = new KejadianKlien();
  /** Kode kejadian yang dialognya terbuka di layar ini; penandanya menjadi "…" (P-16). */
  dialogKode: string | null = null;
  /** Kejadian dalam jangkauan Periksa pada bingkai terakhir (P-21). */
  jangkauan: string | null = null;
  /** Gambar kejadian bingkai terakhir, dan hitungan untuk atribut uji kanvas (P-20). */
  private ekstra: EkstraGambar = { bawah: [], tengah: [], atas: [], efek: [] };
  jumlahTokohKejadian = 0;
  jumlahDialogLain = 0;
  private readonly letak = new Map<string, LetakTokoh[]>();
  private tokohLain: { id: string; x: number; y: number; dialog: boolean }[] = [];
  private aset: AsetDunia | null = null;
  private potongan: PengelolaPotongan | null = null;
  private readonly buat: BuatKanvas;
  private readonly strip = new Map<string, SetStrip>();
  /** Set strip per objek info pemain, agar tidak membuat kunci teks setiap bingkai. */
  private readonly stripInfo = new WeakMap<InfoPemain, SetStrip>();
  private langitPada = -Infinity;
  private langitUntuk: WaktuRuangKlien | null = null;
  private siluet: { kunci: string; set: SetStrip } | null = null;
  private jamPerformaTerakhir: number | null = null;

  constructor(buatKanvas: BuatKanvas) {
    this.buat = buatKanvas;
  }

  get siapGambar(): boolean {
    return this.aset !== null;
  }

  get jumlahPotongan(): number {
    return this.potongan?.jumlahDisimpan ?? 0;
  }

  /** Aset sudah termuat: siapkan pengelola potongan (P-7). */
  pasangAset(aset: AsetDunia): void {
    if (this.aset) return;
    this.aset = aset;
    const objek: ObjekGambar[] = [];
    for (const o of OBJEK_PETA) {
      const g = aset.objek.get(o.jenis);
      const tinggi = this.tinggiJejak(o.jenis);
      if (g) objek.push({ x: o.x, y: o.y, tinggi, bawah: g.bawah, atas: g.atas });
    }
    this.potongan = new PengelolaPotongan(
      {
        lebarUbin: UKURAN_PETA.lebar,
        tinggiUbin: UKURAN_PETA.tinggi,
        kolomLembar: LAPISAN_GAMBAR.kolom,
        daftar: LAPISAN_GAMBAR.daftar,
        tanah: LAPISAN_GAMBAR.tanah,
        tumpang: LAPISAN_GAMBAR.tumpang,
        bayangan: LAPISAN_GAMBAR.bayangan,
        lembar: aset.ubin,
        objek,
      },
      (w, h) => this.buat(w, h),
    );
  }

  private tinggiJejak(jenis: string): number {
    const g = this.aset?.objek.get(jenis);
    if (!g) return 1;
    return Math.round(((g.atas ? g.atas.height : 0) + g.bawah.height - 2) / 16);
  }

  aturPengaturan(durasiMenit: number, batasPemain: number): void {
    this.durasiMenit = durasiMenit;
    this.batasPemain = batasPemain;
  }

  /** Pesan server yang menyangkut dunia. */
  terima(p: PesanServerPemain, jamLokal: number, selisihJam: number): void {
    switch (p.t) {
      case "selamat_datang":
        if (this.diriId !== p.pemainId) {
          this.gerak.posisi = null;
          this.kamera = kameraPusat(tengahLobi(), UKURAN_PETA.lebarPx, UKURAN_PETA.tinggiPx);
          this.kejadian.kosongkan();
        }
        this.dialogKode = null;
        this.diriId = p.pemainId;
        this.lain.kosongkan();
        this.lain.aturDiri(p.pemainId);
        this.gerak.mulaiSesi();
        this.status = p.status;
        this.waktu = { ...this.waktu, status: p.status };
        this.aturPengaturan(p.pengaturan.durasiMenit, p.pengaturan.batasPemain);
        break;
      case "status_ruang": {
        const sebelum = this.status;
        this.status = p.status;
        this.waktu = { status: p.status, mulaiPada: p.mulaiPada, berakhirPada: p.berakhirPada, jedaSejak: p.jedaSejak };
        if (p.status === "main" && sebelum !== "main") this.lain.segarkanTerlihat(jamLokal);
        break;
      }
      case "pemain_baru":
        this.lain.kenal(p.id, { nama: p.nama, avatar: p.avatar, warnaTas: p.warnaTas });
        break;
      case "pemain_pergi":
        this.lain.lupakan(p.id);
        break;
      case "dunia":
        this.lain.terimaDunia(p.w, p.p, jamLokal, selisihJam);
        break;
      case "koreksi":
        this.gerak.terapkanKoreksi(p);
        if (this.gerak.posisi) this.kamera = kameraPusat(this.gerak.posisi, UKURAN_PETA.lebarPx, UKURAN_PETA.tinggiPx);
        break;
      case "kejadian_terlihat":
        this.kejadian.terima({ kejadianId: p.kejadianId, x: p.x, y: p.y, setTokoh: p.setTokoh });
        break;
      case "pribadi":
        this.kejadian.aturSelesai(p.selesai);
        break;
      case "hasil_2":
        if (this.dialogKode) this.kejadian.tandaiSelesai(this.dialogKode);
        break;
      default:
        break;
    }
  }

  private setStrip(info: InfoPemain): SetStrip | null {
    if (!this.aset) return null;
    const ada = this.stripInfo.get(info);
    if (ada) return ada;
    const kunci = `${info.avatar}:${info.warnaTas}`;
    let s = this.strip.get(kunci);
    if (!s) {
      s = buatSetAvatar(this.buat, this.aset, info.avatar, info.warnaTas);
      this.strip.set(kunci, s);
    }
    this.stripInfo.set(info, s);
    return s;
  }

  private setSiluet(info: InfoPemain, set: SetStrip): SetStrip {
    const kunci = `${info.avatar}:${info.warnaTas}`;
    if (this.siluet?.kunci !== kunci) this.siluet = { kunci, set: buatSetSiluet(this.buat, set) };
    return this.siluet.set;
  }

  /** Grid tabrakan sesuai status (P-15). */
  grid() {
    return this.status === "lobi" || this.status === "hitung_mundur" ? GRID_LOBI : GRID_KAMPUNG;
  }

  /** Satu bingkai: gerak, kiriman, kamera, langit, potongan, dan daftar tokoh. */
  perbarui(o: OpsiBingkai): void {
    const dt = this.jamPerformaTerakhir === null ? 0 : o.jamPerforma - this.jamPerformaTerakhir;
    this.jamPerformaTerakhir = o.jamPerforma;
    const boleh = o.bolehGerak && STATUS_GERAK.includes(this.status);
    this.gerak.maju(dt, this.masukan.arah(), boleh, this.grid());
    this.gerak.kirimBila(o.jamLokal, selangKirim(this.batasPemain), o.bufferedAmount, o.kirim);
    if (this.gerak.posisi && !this.gerak.menungguAwal) this.kamera = ikutiKamera(this.kamera, this.gerak.posisi, UKURAN_PETA.lebarPx, UKURAN_PETA.tinggiPx);
    const jamServer = o.jamLokal + o.selisihJam;
    // Langit cukup dihitung 5 kali per detik, atau langsung bila status atau waktu ruang berubah.
    if (this.langitUntuk !== this.waktu || o.jamLokal - this.langitPada >= 200 || !this.langit) {
      this.langit = hitungLangit(this.waktu, this.durasiMenit, jamServer);
      this.langitPada = o.jamLokal;
      this.langitUntuk = this.waktu;
    }
    this.masa = this.status === "main" || this.status === "jeda" ? this.langit.masa : "pagi";
    const berikut =
      this.status === "main" && this.langit.msSampaiBerikut !== null && this.langit.msSampaiBerikut <= SIAPKAN_MASA_MS ? this.langit.masaBerikut : null;
    this.potongan?.perbarui(this.kamera, this.masa, berikut);
    // Tokoh: pemain lain yang dikenal dan pemain sendiri.
    const tokoh: (TokohGambar & { nama: string; diri: boolean })[] = [];
    const lain = this.lain.tampil(jamServer, o.jamLokal, this.status);
    this.tokohLain = lain;
    for (const q of lain) {
      const set = this.setStrip(q.info);
      if (!set) continue;
      const pose = q.jalan ? "jalan" : "diam";
      tokoh.push({ id: q.id, x: q.x, y: q.y, strip: set[q.arah][pose], bingkai: bingkaiTokoh(q.jalan, o.jamLokal, o.kurangiGerak), nama: q.info.nama, diri: false });
    }
    const info = this.diriId ? this.lain.infoPemain(this.diriId) : undefined;
    if (info && this.gerak.posisi && !this.gerak.menungguAwal) {
      const set = this.setStrip(info);
      if (set) {
        const pose = this.gerak.jalan ? "jalan" : "diam";
        tokoh.push({
          id: this.diriId as string,
          x: this.gerak.posisi.x,
          y: this.gerak.posisi.y,
          strip: set[this.gerak.arah][pose],
          bingkai: bingkaiTokoh(this.gerak.jalan, o.jamLokal, o.kurangiGerak),
          nama: info.nama,
          diri: true,
        });
      }
    }
    this.tokoh = tokoh;
    this.siapkanKejadian(o.jamLokal, o.kurangiGerak);
  }

  /**
   * Laporan berhenti sebelum `periksa` (P-24): pemain sendiri dihentikan, dan bila posisi atau langkah terakhir yang
   * dikirim berbeda (misalnya masih berjalan), satu laporan `gerak` dengan `jalan: false` langsung dikirim.
   */
  hentiUntukPeriksa(jamLokal: number, kirim: (p: PesanGerak) => boolean): void {
    this.masukan.lepasSemua();
    this.gerak.jalan = false;
    this.gerak.kirimBila(jamLokal, 0, 0, kirim);
  }

  /** Dialog kejadian di layar ini dibuka (kode) atau ditutup (null): penandanya menjadi "…" selama terbuka (P-16). */
  aturDialog(kode: string | null): void {
    this.dialogKode = kode;
  }

  /** Gambar kejadian bingkai terakhir per lapisan (untuk uji). */
  get gambarKejadian(): EkstraGambar {
    return this.ekstra;
  }

  /** Strip satu gambar statis (properti dan penanda). */
  private stripGambar(img: HTMLImageElement | undefined, bingkai = 1): Strip | null {
    if (!img) return null;
    return { gambar: img, lebar: Math.round(img.width / bingkai), tinggi: img.height, bingkai };
  }

  /**
   * Penanda, tokoh, dan properti kejadian di setiap titik yang terlihat (P-15, P-16), gelembung "…" pemain lain
   * (P-17), dan jangkauan Periksa (P-21). Tokoh dan properti bisa dilewati: tidak masuk grid tabrakan.
   */
  private siapkanKejadian(jamLokal: number, kurangiGerak: boolean): void {
    const ekstra: { bawah: SpriteGambar[]; tengah: SpriteGambar[]; atas: SpriteGambar[]; efek: SpriteGambar[] } = { bawah: [], tengah: [], atas: [], efek: [] };
    const aset = this.aset;
    const k = this.kamera;
    const dalamPandangan = (s: SpriteGambar) => s.x + s.strip.lebar > k.x && s.x < k.x + PANDANGAN.lebar && s.y + s.strip.tinggi > k.y && s.y < k.y + PANDANGAN.tinggi;
    let tokohKejadian = 0;
    if (aset) {
      const naik = !kurangiGerak && Math.floor(jamLokal / 500) % 2 === 1 ? 1 : 0;
      const bingkaiNpc = kurangiGerak ? 0 : Math.floor(jamLokal / 500) % 2;
      for (const t of this.kejadian.daftar()) {
        let letak = this.letak.get(t.kejadianId);
        if (!letak) {
          letak = tataLetakKejadian(t.setTokoh, OBJEK);
          this.letak.set(t.kejadianId, letak);
        }
        for (const l of letak) {
          const sx = t.x + l.dx;
          const sy = t.y + l.dy;
          if (l.jenis === "obj") {
            const g = aset.objek.get(l.kunci.slice(4));
            if (!g) continue;
            const tinggiAtas = g.atas ? g.atas.height : 0;
            const bawah = this.stripGambar(g.bawah);
            if (!bawah) continue;
            const sb: SpriteGambar = { id: `${t.kejadianId}:${l.kunci}`, urutY: (sy + l.tinggi) * 16, x: sx * 16 - 1, y: sy * 16 - 1 + tinggiAtas, strip: bawah, bingkai: 0 };
            ekstra.bawah.push(sb);
            if (dalamPandangan(sb)) tokohKejadian++;
            const atas = this.stripGambar(g.atas ?? undefined);
            if (atas) ekstra.atas.push({ id: `${sb.id}:atas`, urutY: sb.urutY, x: sx * 16 - 1, y: sy * 16 - 1, strip: atas, bingkai: 0 });
          } else {
            const meta = NPC[l.kunci];
            const img = aset.npc.get(l.kunci);
            if (!meta || !img) continue;
            const kakiX = sx * 16 + 8;
            const kakiY = sy * 16 + 12;
            const s: SpriteGambar = {
              id: `${t.kejadianId}:${l.kunci}`,
              urutY: kakiY,
              x: kakiX - meta.kakiX,
              y: kakiY - meta.kakiY,
              strip: { gambar: img, lebar: meta.lebar, tinggi: meta.tinggi, bingkai: meta.bingkai },
              bingkai: bingkaiNpc,
            };
            ekstra.tengah.push(s);
            if (dalamPandangan(s)) tokohKejadian++;
          }
        }
        const nama = this.kejadian.selesai.has(t.kejadianId) ? "tanda_selesai" : this.dialogKode === t.kejadianId ? "tanda_dibuka" : "tanda_kejadian";
        const strip = this.stripGambar(aset.tanda.get(nama));
        if (strip) {
          const angkat = nama === "tanda_kejadian" ? naik : 0;
          ekstra.tengah.push({ id: `${t.kejadianId}@${t.x},${t.y}:tanda`, urutY: t.y * 16 + 16, x: t.x * 16 + 8 - Math.floor(strip.lebar / 2), y: t.y * 16 - 2 - strip.tinggi - angkat, strip, bingkai: 0 });
        }
      }
      const gelembung = this.stripGambar(aset.tanda.get("tanda_dibuka"));
      if (gelembung) {
        for (const q of this.tokohLain) {
          if (!q.dialog) continue;
          const s: SpriteGambar = { id: `${q.id}:gelembung`, urutY: q.y, x: Math.round(q.x) - Math.floor(gelembung.lebar / 2), y: Math.round(q.y) - 22 - gelembung.tinggi, strip: gelembung, bingkai: 0 };
          ekstra.efek.push(s);
        }
      }
    }
    this.ekstra = ekstra;
    this.jumlahTokohKejadian = tokohKejadian;
    this.jumlahDialogLain = ekstra.efek.filter((s) => s.x + s.strip.lebar > k.x && s.x < k.x + PANDANGAN.lebar && s.y + s.strip.tinggi > k.y && s.y < k.y + PANDANGAN.tinggi).length;
    const p = this.gerak.posisi;
    this.jangkauan =
      this.status === "main" && p && !this.gerak.menungguAwal && this.dialogKode === null ? kejadianDalamJangkauan(p, this.kejadian.daftar(), this.kejadian.selesai) : null;
  }

  /** Gerbang lobi: tertutup selama lobi dan hitung mundur, terbuka sejak ronde berjalan (P-28). */
  private gerbang(): GerbangGambar | null {
    if (!this.aset) return null;
    const tutup = this.status === "lobi" || this.status === "hitung_mundur";
    const g = this.aset.objek.get(tutup ? "gerbang_tutup" : "gerbang_buka");
    return g ? { x: GERBANG.x, y: GERBANG.y, bawah: g.bawah, atas: g.atas } : null;
  }

  /** Menggambar bingkai yang sudah diperbarui ke kanvas logis 320 × 180. */
  gambar(ctx: CanvasRenderingContext2D, kurangiGerak: boolean, jamLokal: number): void {
    if (!this.potongan) return;
    const diriTokoh = this.tokoh.find((t) => t.diri);
    let diri = null;
    if (diriTokoh && this.diriId) {
      const info = this.lain.infoPemain(this.diriId);
      const set = info ? this.setStrip(info) : null;
      if (info && set) {
        const sil = this.setSiluet(info, set);
        const pose = this.gerak.jalan ? "jalan" : "diam";
        diri = { x: diriTokoh.x, y: diriTokoh.y, siluet: sil[this.gerak.arah][pose], bingkai: bingkaiTokoh(this.gerak.jalan, jamLokal, kurangiGerak) };
      }
    }
    this.siluetTerakhir = gambarBingkai(ctx, this.kamera, this.potongan, this.masa, this.gerbang(), this.tokoh, diri, this.ekstra);
  }

  /** Paling banyak `maks` pemain lain terdekat yang terlihat di pandangan, untuk label nama (P-23). */
  labelTerdekat(maks: number): LabelTokoh[] {
    const pusat = this.gerak.posisi ?? { x: this.kamera.x + 160, y: this.kamera.y + 90 };
    const k = this.kamera;
    return this.tokoh
      .filter((t) => !t.diri && t.x >= k.x - 8 && t.x <= k.x + 328 && t.y >= k.y && t.y <= k.y + 201)
      .map((t) => ({ t, d: (t.x - pusat.x) ** 2 + (t.y - pusat.y) ** 2 }))
      .sort((a, b) => a.d - b.d || (a.t.id < b.t.id ? -1 : 1))
      .slice(0, maks)
      .map(({ t }) => ({ id: t.id, nama: t.nama, x: t.x, y: t.y }));
  }
}
