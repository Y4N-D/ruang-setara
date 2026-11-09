// Layar tetap menyala (spesifikasi JS-07, P-44; PRD JFR-14; Architecture 6.8). Screen Wake Lock API diminta sejak
// pemain masuk lobi, diminta lagi setiap tab kembali terlihat, dan dilepas di layar akhir. Bila API tidak ada
// atau permintaan ditolak, tidak ada pesan dan permainan berjalan biasa.

export interface KunciLayar {
  release(): Promise<void>;
  readonly released?: boolean;
}
export interface ApiWakeLock {
  request(jenis: "screen"): Promise<KunciLayar>;
}
export interface DokumenMirip {
  readonly visibilityState: string;
  addEventListener(jenis: "visibilitychange", f: () => void): void;
  removeEventListener(jenis: "visibilitychange", f: () => void): void;
}

export class PenjagaLayar {
  private kunci: KunciLayar | null = null;
  private aktif = false;
  private readonly api: ApiWakeLock | null;
  private readonly dok: DokumenMirip | null;
  /** Jumlah permintaan kunci; untuk uji. */
  permintaan = 0;

  constructor(api: ApiWakeLock | null | undefined, dok: DokumenMirip | null | undefined) {
    this.api = api ?? null;
    this.dok = dok ?? null;
  }

  private readonly saatTerlihat = () => {
    if (this.aktif && this.dok?.visibilityState === "visible") void this.minta();
  };

  private async minta(): Promise<void> {
    if (!this.api || !this.aktif) return;
    if (this.kunci && !this.kunci.released) return;
    this.permintaan++;
    try {
      const k = await this.api.request("screen");
      if (this.aktif) this.kunci = k;
      else void k.release().catch(() => undefined);
    } catch {
      // Ditolak (misalnya hemat baterai) atau tidak didukung: diam saja (P-44).
    }
  }

  /** Masuk lobi atau ronde. Aman dipanggil berulang. */
  async nyalakan(): Promise<void> {
    if (this.aktif) return;
    this.aktif = true;
    this.dok?.addEventListener("visibilitychange", this.saatTerlihat);
    await this.minta();
  }

  /** Layar selesai, ruang ditutup, atau keluar dari dunia. */
  async matikan(): Promise<void> {
    if (!this.aktif) return;
    this.aktif = false;
    this.dok?.removeEventListener("visibilitychange", this.saatTerlihat);
    const k = this.kunci;
    this.kunci = null;
    if (k) await k.release().catch(() => undefined);
  }
}

/** Penjaga layar dengan API peramban, bila ada. */
export function penjagaPeramban(): PenjagaLayar {
  const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { wakeLock?: ApiWakeLock }) : undefined;
  return new PenjagaLayar(nav?.wakeLock, typeof document !== "undefined" ? document : null);
}
