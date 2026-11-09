// Gerak, tabrakan, dan pemeriksaan gerak (spesifikasi JS-02, P-24 sampai P-28; PRD 8.2; Architecture 8.2).
// `langkahGerak` menggerakkan avatar di layar pemain (dan meluncur di dinding); `periksaGerak` dipakai
// server untuk memeriksa setiap laporan `gerak`. Keduanya memakai kotak kaki dan grid tabrakan yang sama.
// JS-07: gerak sah di status `lobi`, `hitung_mundur`, dan `main` (P-45), dan pemeriksaan jarak di server
// memakai anggaran jarak yang terkumpul (P-52), karena laporan jujur yang tiba berdempet ditolak aturan JS-02.
import { selPadat, UKURAN_UBIN } from "./peta";
import type { Arah, HasilPeriksaGerak, PetaJejak, Posisi, StatusRuang } from "./tipe";

/** Kecepatan jalan: 4,5 ubin per detik, dalam piksel logis per detik. */
export const KECEPATAN = 72;
export const KALI_LARI = 1.6;
/** Kecepatan saat Lari cepat aktif (72 × 1,6). */
export const KECEPATAN_LARI = 115.2;
/** Kotak kaki avatar: x − 5 sampai x + 5, y − 8 sampai y (posisi pemain = titik kaki). */
export const KOTAK_KAKI = { lebar: 10, tinggi: 8 } as const;
/** Batas jarak satu laporan: kecepatan × selang × 1,25 + 4 piksel. */
export const TOLERANSI_GERAK = { kali: 1.25, tambahPx: 4 } as const;
/** Selang waktu yang lebih panjang dianggap 1 detik, agar jeda panjang tidak menjadi lompatan. */
export const DT_MAKS_MS = 1000;
/** Langkah terpanjang saat menggerakkan atau menelusuri jalur, agar tidak ada yang menembus satu ubin. */
export const LANGKAH_TELUSUR_PX = 4;
/** Status ruang yang menerima laporan gerak: halaman lobi, hitung mundur, dan ronde (JS-07, P-45). */
export const STATUS_GERAK: readonly StatusRuang[] = ["lobi", "hitung_mundur", "main"];
/**
 * Anggaran jarak (JS-07, P-52): bertambah kecepatan × 1,25 per detik sejak laporan diterima terakhir, paling
 * banyak setengah detik berjalan (45 piksel pada kecepatan 72). Laporan diterima bila jaraknya ≤ anggaran + 4.
 */
export const ANGGARAN_GERAK = { detikMaks: 0.5 } as const;

type PetaTabrakan = Pick<PetaJejak, "lebar" | "tinggi" | "tabrakan">;

export function kecepatan(lari: boolean): number {
  return lari ? KECEPATAN_LARI : KECEPATAN;
}

/** Kotak kaki di (x, y) tidak menyentuh ubin padat dan tidak keluar peta. Menyentuh tepi ubin dibolehkan. */
export function posisiSah(peta: PetaTabrakan, x: number, y: number): boolean {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  const kiri = Math.floor((x - KOTAK_KAKI.lebar / 2) / UKURAN_UBIN);
  const kanan = Math.ceil((x + KOTAK_KAKI.lebar / 2) / UKURAN_UBIN) - 1;
  const atas = Math.floor((y - KOTAK_KAKI.tinggi) / UKURAN_UBIN);
  const bawah = Math.ceil(y / UKURAN_UBIN) - 1;
  for (let ty = atas; ty <= bawah; ty++) {
    for (let tx = kiri; tx <= kanan; tx++) {
      if (selPadat(peta, tx, ty)) return false;
    }
  }
  return true;
}

/** Arah hadap dari arah masukan; tanpa masukan, arah sebelumnya dipertahankan. */
export function arahDari(dx: number, dy: number, arahSebelum: Arah): Arah {
  if (dx === 0 && dy === 0) return arahSebelum;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "kanan" : "kiri";
  return dy > 0 ? "bawah" : "atas";
}

export interface MasukanLangkah {
  posisi: Posisi;
  arah: Arah;
  /** Arah masukan keyboard atau joystick, masing-masing −1 sampai 1. */
  dx: number;
  dy: number;
  dtMs: number;
  lari: boolean;
  peta: PetaTabrakan;
}

/**
 * Satu langkah gerak di layar pemain. Arah masukan yang lebih panjang dari 1 dinormalisasi, sehingga
 * diagonal tidak lebih cepat. Gerak dibagi menjadi langkah kecil (≤ 4 piksel); di setiap langkah sumbu X
 * diterapkan dahulu, lalu Y, dan sumbu yang menabrak tidak diterapkan, sehingga avatar meluncur di dinding.
 */
export function langkahGerak(m: MasukanLangkah): { x: number; y: number; arah: Arah; bergerak: boolean } {
  let dx = Number.isFinite(m.dx) ? m.dx : 0;
  let dy = Number.isFinite(m.dy) ? m.dy : 0;
  const panjang = Math.hypot(dx, dy);
  if (panjang > 1) {
    dx /= panjang;
    dy /= panjang;
  }
  const dt = Math.min(DT_MAKS_MS, Math.max(0, Number.isFinite(m.dtMs) ? m.dtMs : 0));
  const tempuh = (kecepatan(m.lari) * dt) / 1000;
  const n = Math.max(1, Math.ceil((tempuh * Math.max(Math.abs(dx), Math.abs(dy))) / LANGKAH_TELUSUR_PX));
  const sx = (dx * tempuh) / n;
  const sy = (dy * tempuh) / n;
  let x = m.posisi.x;
  let y = m.posisi.y;
  for (let i = 0; i < n; i++) {
    if (sx !== 0 && posisiSah(m.peta, x + sx, y)) x += sx;
    if (sy !== 0 && posisiSah(m.peta, x, y + sy)) y += sy;
  }
  return { x, y, arah: arahDari(dx, dy, m.arah), bergerak: x !== m.posisi.x || y !== m.posisi.y };
}

/** Jarak terjauh yang sah untuk satu laporan gerak. */
export function batasJarakGerak(dtMs: number, lari: boolean): number {
  const dt = Math.min(DT_MAKS_MS, dtMs);
  return ((kecepatan(lari) * dt) / 1000) * TOLERANSI_GERAK.kali + TOLERANSI_GERAK.tambahPx;
}

/** Garis lurus dari a ke b (a dianggap sah) tidak menabrak, diperiksa setiap ≤ 4 piksel sampai b. */
function telusur(peta: PetaTabrakan, a: Posisi, b: Posisi): boolean {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / LANGKAH_TELUSUR_PX));
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    if (!posisiSah(peta, a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false;
  }
  return true;
}

/** Ada jalan dari posisi sah ke tujuan: garis lurus, X lalu Y, atau Y lalu X. */
function jalurAda(peta: PetaTabrakan, dari: Posisi, ke: Posisi): boolean {
  if (!posisiSah(peta, ke.x, ke.y)) return false;
  if (telusur(peta, dari, ke)) return true;
  const sudutXDulu = { x: ke.x, y: dari.y };
  if (telusur(peta, dari, sudutXDulu) && telusur(peta, sudutXDulu, ke)) return true;
  const sudutYDulu = { x: dari.x, y: ke.y };
  return telusur(peta, dari, sudutYDulu) && telusur(peta, sudutYDulu, ke);
}

export interface LaporanGerak {
  /** Posisi sah terakhir yang dipegang server, beserta arahnya. */
  posisi: Posisi & { arah: Arah };
  /** Isi pesan `gerak` dari klien. */
  laporan: { x: number; y: number; arah: Arah; seq: number };
  /** `seq` laporan terakhir yang diterima; −1 bila belum ada. */
  seqTerakhir: number;
  /** Selang jam server sejak laporan terakhir yang diterima. */
  dtMs: number;
  lari: boolean;
  status: StatusRuang;
  dialogTerbuka: boolean;
  /** Grid sesuai status: grid lobi (gerbang padat) di `lobi` dan `hitung_mundur`, grid kampung di `main`. */
  peta: PetaTabrakan;
  /**
   * Anggaran jarak sesudah laporan diterima terakhir (P-52). Bila diisi, pemeriksaan jarak memakai anggaran,
   * sehingga laporan yang tiba berdempet tetap diterima; bila tidak, memakai batas JS-02 per selang.
   */
  anggaranPx?: number;
}

/** Anggaran jarak yang tersedia sesudah `dtMs` sejak laporan diterima terakhir (P-52). */
export function anggaranTersedia(anggaranPx: number, dtMs: number, lari: boolean): number {
  const laju = kecepatan(lari) * TOLERANSI_GERAK.kali;
  const dt = Number.isFinite(dtMs) ? Math.max(0, dtMs) : 0;
  return Math.min(laju * ANGGARAN_GERAK.detikMaks, Math.max(0, anggaranPx) + (laju * dt) / 1000);
}

/**
 * Pemeriksaan server untuk satu laporan `gerak`. Ditolak bila seq tidak bertambah, status bukan `lobi`,
 * `hitung_mundur`, atau `main`, atau dialog terbuka; bila jaraknya melebihi batas; atau bila tujuannya menabrak
 * atau tidak bisa dicapai tanpa menembus ubin padat. Batas jarak: dengan anggaran (P-52), anggaran yang
 * tersedia + 4 piksel; tanpa anggaran (JS-02), kecepatan × selang × 1,25 + 4 piksel (selang paling lama 1 detik,
 * dan selang ≤ 0 ditolak). Bila ditolak, anggaran tidak berubah; bila diterima, anggaran berkurang sejauh jaraknya.
 */
export function periksaGerak(m: LaporanGerak): HasilPeriksaGerak {
  const pakaiAnggaran = m.anggaranPx !== undefined;
  const tolak = (alasan: NonNullable<HasilPeriksaGerak["alasan"]>): HasilPeriksaGerak => ({
    diterima: false,
    x: m.posisi.x,
    y: m.posisi.y,
    arah: m.posisi.arah,
    seq: m.laporan.seq,
    alasan,
    ...(pakaiAnggaran ? { anggaranPx: m.anggaranPx } : {}),
  });
  if (!(m.laporan.seq > m.seqTerakhir)) return tolak("seq");
  if (!STATUS_GERAK.includes(m.status)) return tolak("status");
  if (m.dialogTerbuka) return tolak("dialog");
  const ke = { x: m.laporan.x, y: m.laporan.y };
  const jarakLapor = Math.hypot(ke.x - m.posisi.x, ke.y - m.posisi.y);
  let sisa: number | undefined;
  if (pakaiAnggaran) {
    const tersedia = anggaranTersedia(m.anggaranPx ?? 0, m.dtMs, m.lari);
    if (!(jarakLapor <= tersedia + TOLERANSI_GERAK.tambahPx)) return tolak("kecepatan");
    sisa = Math.max(0, tersedia - jarakLapor);
  } else {
    if (!(m.dtMs > 0)) return tolak("waktu");
    if (!(jarakLapor <= batasJarakGerak(m.dtMs, m.lari))) return tolak("kecepatan");
  }
  if (!jalurAda(m.peta, m.posisi, ke)) return tolak("tabrakan");
  return { diterima: true, x: ke.x, y: ke.y, arah: m.laporan.arah, seq: m.laporan.seq, alasan: null, ...(sisa !== undefined ? { anggaranPx: sisa } : {}) };
}

/**
 * Isi pesan `koreksi` (posisi sah terakhir) untuk laporan yang ditolak karena kecepatan atau tabrakan.
 * Penolakan karena seq, status, dialog, atau selang tidak dikoreksi, dan menghasilkan null.
 */
export function koreksi(hasil: HasilPeriksaGerak): { x: number; y: number; seq: number } | null {
  if (hasil.diterima || (hasil.alasan !== "kecepatan" && hasil.alasan !== "tabrakan")) return null;
  return { x: hasil.x, y: hasil.y, seq: hasil.seq };
}
