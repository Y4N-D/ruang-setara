// Gerak pemain sendiri (spesifikasi JS-07, P-14 sampai P-18; Architecture 9): langkah tetap 60 Hz dengan
// langkahGerak (JS-02), kiriman `gerak` paling sering setiap 100 ms (166 ms di ruang lebih dari 50 pemain), satu
// laporan saat berhenti, tanpa kiriman saat diam, tanpa antrean saat bufferedAmount > 0, dan `koreksi` dari server.
import { frekuensiGerak } from "../../inti/aturan";
import { langkahGerak } from "../../inti/gerak";
import type { PesanPemain } from "../../inti/protokol";
import type { Arah, PetaJejak } from "../../inti/tipe";

export const LANGKAH_MS = 1000 / 60;
/** Selang terpanjang yang dikejar dalam satu bingkai, agar tab yang lama tersembunyi tidak berjalan sendiri. */
export const KEJAR_MAKS_MS = 250;

type Grid = Pick<PetaJejak, "lebar" | "tinggi" | "tabrakan">;
type PesanGerak = Extract<PesanPemain, { t: "gerak" }>;

/** Selang kiriman `gerak` saat bergerak: 100 ms, atau 166 ms bila batas pemain lebih dari 50 (P-16). */
export function selangKirim(batasPemain: number): number {
  return frekuensiGerak(batasPemain) >= 10 ? 100 : 166;
}

/** Posisi yang dilaporkan dibulatkan ke 0,1 piksel; batas ubin bulat, jadi posisi sah tetap sah. */
const bulat1 = (v: number) => Math.round(v * 10) / 10;

export class GerakDiri {
  posisi: { x: number; y: number } | null = null;
  arah: Arah = "bawah";
  /** Benar selama avatar berpindah tempat pada langkah terakhir. */
  jalan = false;
  /** Menunggu `koreksi` pertama sesudah memilih identitas atau tersambung ulang (P-17). */
  menungguAwal = true;
  private seq = 0;
  private sisaMs = 0;
  private kirimTerakhirMs = -Infinity;
  private terkirim: { x: number; y: number; arah: Arah; jalan: boolean } | null = null;

  /** Sesudah `selamat_datang`: posisi dari `koreksi` berikutnya dipakai apa adanya (P-17). */
  mulaiSesi(): void {
    this.menungguAwal = true;
    this.jalan = false;
    this.sisaMs = 0;
  }

  /** `koreksi` dari server (P-17, P-18). Mengembalikan true bila ini posisi awal (kamera berpusat). */
  terapkanKoreksi(k: { x: number; y: number; seq: number }): boolean {
    const awal = this.menungguAwal || this.posisi === null;
    this.posisi = { x: k.x, y: k.y };
    this.seq = awal ? k.seq : Math.max(this.seq, k.seq);
    this.menungguAwal = false;
    this.jalan = false;
    this.sisaMs = 0;
    this.terkirim = { x: bulat1(k.x), y: bulat1(k.y), arah: this.arah, jalan: false };
    return awal;
  }

  /** Seq yang akan dipakai laporan berikutnya. */
  get seqBerikut(): number {
    return this.seq + 1;
  }

  /**
   * Maju sejauh `dtMs` dengan langkah tetap 1/60 detik. Bila gerak tidak diizinkan (status, lapisan), atau
   * posisi awal belum tiba, pemain berhenti (P-14). Mengembalikan jumlah langkah yang dijalankan.
   */
  maju(dtMs: number, arah: { dx: number; dy: number }, boleh: boolean, grid: Grid): number {
    if (!this.posisi || this.menungguAwal || !boleh) {
      this.jalan = false;
      this.sisaMs = 0;
      return 0;
    }
    this.sisaMs = Math.min(KEJAR_MAKS_MS, this.sisaMs + Math.max(0, dtMs));
    let langkah = 0;
    let berpindah = false;
    while (this.sisaMs >= LANGKAH_MS) {
      this.sisaMs -= LANGKAH_MS;
      langkah++;
      const h = langkahGerak({ posisi: this.posisi, arah: this.arah, dx: arah.dx, dy: arah.dy, dtMs: LANGKAH_MS, lari: false, peta: grid });
      this.posisi = { x: h.x, y: h.y };
      this.arah = h.arah;
      berpindah = berpindah || h.bergerak;
    }
    if (langkah > 0) this.jalan = berpindah;
    return langkah;
  }

  /**
   * Mengirim `gerak` bila perlu (P-16): selama berjalan paling sering setiap `selangMs`; satu laporan berhenti
   * (jalan false) begitu berhenti; perubahan arah saat diam paling sering setiap `selangMs`; tanpa kiriman saat
   * diam. Bila bufferedAmount > 0, kiriman dilewati dan kesempatan berikutnya membawa posisi terbaru.
   */
  kirimBila(sekarangMs: number, selangMs: number, bufferedAmount: number, kirim: (p: PesanGerak) => boolean): PesanGerak | null {
    if (!this.posisi || this.menungguAwal) return null;
    const isi = { x: bulat1(this.posisi.x), y: bulat1(this.posisi.y), arah: this.arah, jalan: this.jalan };
    const t = this.terkirim;
    const sama = t !== null && t.x === isi.x && t.y === isi.y && t.arah === isi.arah && t.jalan === isi.jalan;
    if (sama) return null;
    const cukupLama = sekarangMs - this.kirimTerakhirMs >= selangMs;
    const berhenti = !isi.jalan && t !== null && t.jalan;
    if (!cukupLama && !berhenti) return null;
    if (bufferedAmount > 0) return null;
    const pesan: PesanGerak = { v: 1, t: "gerak", ...isi, seq: this.seq + 1 };
    if (!kirim(pesan)) return null;
    this.seq++;
    this.kirimTerakhirMs = sekarangMs;
    this.terkirim = isi;
    return pesan;
  }
}
