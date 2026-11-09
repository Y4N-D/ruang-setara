// Klien WebSocket pemain (spesifikasi JS-03, P-18, P-25, P-29 sampai P-31, P-55).
// Ketergantungan (soket, jam, pengatur waktu, penyimpanan) diberikan dari luar agar bisa diuji di Node.
// JS-07: versi peta halaman dibandingkan dengan `selamat_datang.versiPeta` (P-50), dan bufferedAmount soket
// dibaca agar `gerak` tidak diantrekan (P-16).
import { BATAS } from "../inti/aturan";
import { PROTOKOL_VERSI, skemaServerPemain, type KodeGalat, type PesanPemain, type PesanServerPemain } from "../inti/protokol";

/** Jeda percobaan sambung ulang: 0,5, 1, 2, 4, lalu 8 detik seterusnya (P-29). */
export const JADWAL_SAMBUNG_ULANG_MS = [500, 1000, 2000, 4000, 8000] as const;

export function jedaPercobaan(percobaan: number): number {
  return JADWAL_SAMBUNG_ULANG_MS[Math.min(Math.max(0, percobaan), JADWAL_SAMBUNG_ULANG_MS.length - 1)];
}

/** Kunci sessionStorage untuk token pemain di satu ruang (P-25). */
export function kunciToken(kode: string): string {
  return `jejak:token:${kode}`;
}

export interface SampelJam {
  rtt: number;
  selisih: number;
}

/** Selisih jam server − jam lokal: median lima sampel terakhir (P-31). */
export function selisihJam(sampel: readonly SampelJam[]): number {
  const daftar = sampel
    .slice(-5)
    .map((s) => s.selisih)
    .sort((a, b) => a - b);
  if (daftar.length === 0) return 0;
  const tengah = Math.floor(daftar.length / 2);
  return daftar.length % 2 === 1 ? daftar[tengah] : (daftar[tengah - 1] + daftar[tengah]) / 2;
}

export type KeadaanKlien = "menghubungkan" | "tersambung" | "menyambung_ulang" | "berhenti";

export interface SoketMirip {
  readonly readyState: number;
  /** Byte yang belum terkirim (WebSocket.bufferedAmount); tidak ada di soket tiruan lama. */
  readonly bufferedAmount?: number;
  send(data: string): void;
  close(kode?: number, alasan?: string): void;
  onopen: ((ev: unknown) => void) | null;
  onmessage: ((ev: { data: unknown }) => void) | null;
  onclose: ((ev: { code: number }) => void) | null;
  onerror: ((ev: unknown) => void) | null;
}

export interface Ketergantungan {
  buatSoket(alamat: string): SoketMirip;
  jam(): number;
  pasang(kerja: () => void, ms: number): unknown;
  batal(id: unknown): void;
  penyimpanan: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
}

/** Galat yang menghentikan sambung ulang (P-29). */
const GALAT_BERHENTI: ReadonlySet<KodeGalat> = new Set<KodeGalat>([
  "RUANG_TIDAK_ADA",
  "RUANG_PENUH",
  "RUANG_TERKUNCI",
  "TERLAMBAT",
  "DIKELUARKAN",
  "VERSI_BERBEDA",
]);
/** Kode penutupan yang tidak dicoba lagi: ditutup, ditolak masuk, dikeluarkan, versi berbeda (P-29).
 *  Pelanggaran batas pesan (1008) dicoba lagi, karena jaringan yang tersendat bisa mengirim pesan berdempet. */
const TUTUP_BERHENTI: ReadonlySet<number> = new Set([4000, 4003, 4004, 4005]);

export class KlienRuang {
  keadaan: KeadaanKlien = "menghubungkan";
  pesanCacat = 0;
  private soket: SoketMirip | null = null;
  private percobaan = 0;
  private pewaktuUlang: unknown = null;
  private pewaktuPing: unknown = null;
  private sampel: SampelJam[] = [];
  private nomorAbsen: number | null;
  private readonly alamat: string;
  private readonly kode: string;
  private readonly dep: Ketergantungan;
  private readonly saatPesan: (p: PesanServerPemain) => void;
  private readonly saatKeadaan: (k: KeadaanKlien, kodeTutup: number | null) => void;
  private readonly versiPeta: number | null;

  constructor(
    alamat: string,
    kode: string,
    nomorAbsen: number | null,
    dep: Ketergantungan,
    saatPesan: (p: PesanServerPemain) => void,
    saatKeadaan: (k: KeadaanKlien, kodeTutup: number | null) => void,
    opsi: { versiPeta?: number } = {},
  ) {
    this.alamat = alamat;
    this.kode = kode;
    this.nomorAbsen = nomorAbsen;
    this.dep = dep;
    this.saatPesan = saatPesan;
    this.saatKeadaan = saatKeadaan;
    this.versiPeta = opsi.versiPeta ?? null;
  }

  get selisihJamMs(): number {
    return selisihJam(this.sampel);
  }

  /** Byte yang belum terkirim di soket; 0 bila tidak tersambung (P-16). */
  get bufferedAmount(): number {
    return this.soket?.bufferedAmount ?? 0;
  }

  mulai(): void {
    this.buka();
  }

  kirim(pesan: PesanPemain): boolean {
    if (!this.soket || this.soket.readyState !== 1) return false;
    this.soket.send(JSON.stringify(pesan));
    return true;
  }

  /** Mengirim halo lagi dengan nomor absen lain (sesudah NOMOR_ABSEN_DIPAKAI). */
  ulangiHalo(nomorAbsen: number | null): void {
    this.nomorAbsen = nomorAbsen;
    this.kirimHalo();
  }

  /** Langsung mencoba lagi (peramban kembali daring atau tab kembali terlihat). */
  cobaSekarang(): void {
    if (this.keadaan !== "menyambung_ulang" || this.pewaktuUlang === null) return;
    this.dep.batal(this.pewaktuUlang);
    this.pewaktuUlang = null;
    this.buka();
  }

  berhenti(kodeTutup: number | null = null): void {
    if (this.keadaan === "berhenti") return;
    this.keadaan = "berhenti";
    if (this.pewaktuUlang !== null) this.dep.batal(this.pewaktuUlang);
    this.pewaktuUlang = null;
    this.hentiPing();
    const s = this.soket;
    this.soket = null;
    if (s) {
      try {
        s.close(1000, "selesai");
      } catch {
        // Sudah tertutup.
      }
    }
    this.saatKeadaan("berhenti", kodeTutup);
  }

  private ubahKeadaan(k: KeadaanKlien): void {
    if (this.keadaan === k) return;
    this.keadaan = k;
    this.saatKeadaan(k, null);
  }

  private buka(): void {
    const s = this.dep.buatSoket(this.alamat);
    this.soket = s;
    s.onopen = () => {
      if (s !== this.soket) return;
      this.kirimHalo();
      this.mulaiPing();
    };
    s.onmessage = (ev) => {
      if (s === this.soket) this.terima(ev.data);
    };
    s.onclose = (ev) => {
      if (s === this.soket) this.putus(ev.code);
    };
    s.onerror = () => {
      // Penutupan menyusul lewat onclose.
    };
  }

  private kirimHalo(): void {
    const token = this.dep.penyimpanan?.getItem(kunciToken(this.kode)) ?? null;
    const halo: PesanPemain = { v: 1, t: "halo", peran: "pemain" };
    if (token) halo.token = token;
    if (this.nomorAbsen !== null) halo.nomorAbsen = this.nomorAbsen;
    this.kirim(halo);
  }

  private mulaiPing(): void {
    this.hentiPing();
    const ping = () => {
      this.kirim({ v: 1, t: "ping", tKlien: this.dep.jam() });
      this.pewaktuPing = this.dep.pasang(ping, BATAS.pingMs);
    };
    ping();
  }

  private hentiPing(): void {
    if (this.pewaktuPing !== null) this.dep.batal(this.pewaktuPing);
    this.pewaktuPing = null;
  }

  private hapusToken(): void {
    this.dep.penyimpanan?.removeItem(kunciToken(this.kode));
  }

  private terima(data: unknown): void {
    if (typeof data !== "string") {
      this.pesanCacat++;
      return;
    }
    let json: unknown;
    try {
      json = JSON.parse(data);
    } catch {
      this.pesanCacat++;
      return;
    }
    const hasil = skemaServerPemain.safeParse(json);
    if (!hasil.success) {
      const d = json as { t?: unknown; v?: unknown } | null;
      if (d && d.t === "galat" && d.v !== PROTOKOL_VERSI) {
        this.saatPesan({ v: 1, t: "galat", kode: "VERSI_BERBEDA", pesan: "" });
        this.berhenti();
      } else {
        this.pesanCacat++;
      }
      return;
    }
    const p = hasil.data;
    if (p.t === "selamat_datang" && this.versiPeta !== null && p.versiPeta !== this.versiPeta) {
      // Peta di server lain dengan peta halaman: berhenti menyambung dan minta muat ulang (P-50). Token disimpan,
      // agar sesudah muat ulang pemain kembali sebagai pemain yang sama.
      this.dep.penyimpanan?.setItem(kunciToken(this.kode), p.token);
      this.saatPesan({ v: 1, t: "galat", kode: "VERSI_BERBEDA", pesan: "" });
      this.berhenti(4005);
      return;
    }
    if (p.t === "selamat_datang") {
      this.dep.penyimpanan?.setItem(kunciToken(this.kode), p.token);
      this.percobaan = 0;
      this.ubahKeadaan("tersambung");
    } else if (p.t === "pong") {
      const kini = this.dep.jam();
      const rtt = Math.max(0, kini - p.tKlien);
      this.sampel.push({ rtt, selisih: p.waktuServer + rtt / 2 - kini });
      if (this.sampel.length > 5) this.sampel.shift();
    } else if (p.t === "galat" && GALAT_BERHENTI.has(p.kode)) {
      if (p.kode === "DIKELUARKAN" || p.kode === "RUANG_TIDAK_ADA") this.hapusToken();
      this.saatPesan(p);
      this.berhenti();
      return;
    } else if (p.t === "status_ruang" && p.status === "ditutup") {
      this.hapusToken();
      this.saatPesan(p);
      this.berhenti(4000);
      return;
    }
    this.saatPesan(p);
  }

  private putus(kode: number): void {
    this.hentiPing();
    this.soket = null;
    if (this.keadaan === "berhenti") return;
    if (TUTUP_BERHENTI.has(kode)) {
      if (kode === 4000 || kode === 4004) this.hapusToken();
      this.berhenti(kode);
      return;
    }
    this.ubahKeadaan("menyambung_ulang");
    const jeda = jedaPercobaan(this.percobaan);
    this.percobaan++;
    this.pewaktuUlang = this.dep.pasang(() => {
      this.pewaktuUlang = null;
      if (this.keadaan !== "berhenti") this.buka();
    }, jeda);
  }
}

/** Ketergantungan nyata di peramban. */
export function ketergantunganPeramban(): Ketergantungan {
  let penyimpanan: Ketergantungan["penyimpanan"] = null;
  try {
    penyimpanan = window.sessionStorage;
  } catch {
    penyimpanan = null;
  }
  return {
    buatSoket: (alamat) => new WebSocket(alamat) as unknown as SoketMirip,
    jam: () => Date.now(),
    pasang: (kerja, ms) => window.setTimeout(kerja, ms),
    batal: (id) => window.clearTimeout(id as number),
    penyimpanan,
  };
}
