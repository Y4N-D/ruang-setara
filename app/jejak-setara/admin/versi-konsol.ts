// Penanda versi konsol (spesifikasi JS-15, P-26): konsol yang masih terbuka sesudah deploy membandingkan nama berkas
// `admin-*.js` yang sedang berjalan dengan yang dirujuk `/admin/` sekarang, paling sering sekali per 60 detik.
// Permintaan berkas statis tidak ditagih Cloudflare.

export const JEDA_PERIKSA_VERSI_MS = 60_000;
const POLA_SKRIP = /\/assets\/(admin-[A-Za-z0-9_-]+\.js)/;

/** Nama berkas skrip konsol di sebuah HTML atau alamat; null bila tidak ada. */
export function namaSkripKonsol(teks: string): string | null {
  return POLA_SKRIP.exec(teks)?.[1] ?? null;
}

export interface DepVersi {
  sekarang: () => number;
  /** HTML `/admin/` terbaru, tanpa cache. */
  ambil: () => Promise<string>;
}

/** Pemeriksa dengan jeda; `awal` null (misalnya saat pengembangan) berarti tidak pernah melapor versi baru. */
export class PemeriksaVersi {
  private terakhir = -Infinity;
  private berbeda = false;

  constructor(
    private readonly awal: string | null,
    private readonly dep: DepVersi,
  ) {}

  /** Benar bila versi baru sudah terdeteksi (sekarang atau sebelumnya). */
  async periksa(): Promise<boolean> {
    if (this.berbeda || this.awal === null) return this.berbeda;
    const kini = this.dep.sekarang();
    if (kini - this.terakhir < JEDA_PERIKSA_VERSI_MS) return false;
    this.terakhir = kini;
    try {
      const nama = namaSkripKonsol(await this.dep.ambil());
      this.berbeda = nama !== null && nama !== this.awal;
    } catch {
      // Jaringan putus: dicoba lagi pada pemeriksaan berikutnya sesudah jeda.
    }
    return this.berbeda;
  }
}

/** Nama peristiwa yang dikirim api.ts saat jawaban API gagal diurai (P-26). */
export const PERISTIWA_GAGAL_URAI = "jejak:gagal-urai";
