// Aturan murni pengaman biaya Durable Object ruang (spesifikasi JS-22, P-1 sampai P-5 dan P-15). Tanpa jam sistem:
// waktu selalu diberikan pemanggil, sehingga diuji dengan jam tiruan.

/** P-1: alarm paling cepat 1 detik dari sekarang. */
export const ALARM_JEDA_MIN_MS = 1000;
/** P-2: tenggat yang sama lewat lima kali berturut-turut digeser 60 detik. */
export const ALARM_BERULANG_MAKS = 5;
export const ALARM_GESER_MS = 60_000;
/** P-3 (D-1): anggaran alarm per ruang. */
export const ANGGARAN_ALARM = 200;
/** P-4: jeda percobaan ulang kiriman ke D1; sesudah daftar habis, 60 menit. */
export const JEDA_ULANG_KIRIMAN_MS = [
  30_000, 60_000, 120_000, 240_000, 480_000, 960_000, 1_920_000, 3_600_000,
] as const;
/** P-4: percobaan ulang berhenti 24 jam sesudah kegagalan pertama. */
export const KIRIMAN_BERHENTI_MS = 24 * 3_600_000;
/** P-5: penyimpanan ruang dihapus paling lambat 7 hari sesudah dibuat. */
export const HAPUS_PAKSA_MS = 7 * 24 * 3_600_000;

export function tenggatAman(tenggat: number, sekarang: number): number {
  return Math.max(tenggat, sekarang + ALARM_JEDA_MIN_MS);
}

export interface CatatanBerulang {
  tenggat: number | null;
  n: number;
}
export const BERULANG_KOSONG: CatatanBerulang = { tenggat: null, n: 0 };

/**
 * P-2. Dipanggil sesudah alarm berjalan: `tenggatTadi` adalah tenggat alarm yang baru berjalan, `tenggatBaru` tenggat
 * berikutnya menurut keadaan ruang. Hitungan naik bila tenggat baru sudah lewat dan sama dengan tenggat tadi.
 */
export function periksaBerulang(
  c: CatatanBerulang,
  tenggatTadi: number,
  tenggatBaru: number | null,
  sekarang: number,
): { catatan: CatatanBerulang; geser: boolean } {
  if (
    tenggatBaru === null ||
    tenggatBaru > sekarang ||
    tenggatBaru !== tenggatTadi
  )
    return { catatan: { tenggat: tenggatBaru, n: 0 }, geser: false };
  const n = c.tenggat === tenggatBaru ? c.n + 1 : 1;
  if (n >= ALARM_BERULANG_MAKS)
    return { catatan: { tenggat: tenggatBaru, n: 0 }, geser: true };
  return { catatan: { tenggat: tenggatBaru, n }, geser: false };
}

/** P-4: jeda sebelum percobaan ke-`percobaan` (mulai 1). */
export function jedaKiriman(percobaan: number): number {
  return JEDA_ULANG_KIRIMAN_MS[
    Math.min(Math.max(1, percobaan), JEDA_ULANG_KIRIMAN_MS.length) - 1
  ];
}

/** P-4: percobaan ulang berhenti bila kegagalan pertama sudah 24 jam lalu. */
export function kirimanHarusBerhenti(
  gagalSejak: number,
  sekarang: number,
): boolean {
  return sekarang - gagalSejak >= KIRIMAN_BERHENTI_MS;
}

export interface Pemakaian {
  sambungan: number;
  pesanMasuk: number;
  alarm: number;
  barisSqlite: number;
  barisD1: number;
  internal: number;
}
export const PEMAKAIAN_KOSONG: Pemakaian = {
  sambungan: 0,
  pesanMasuk: 0,
  alarm: 0,
  barisSqlite: 0,
  barisD1: 0,
  internal: 0,
};

/** P-15: perkiraan permintaan Durable Object = sambungan + pesan masuk ÷ 20 (ke atas) + alarm + permintaan internal. */
export function perkiraanPermintaan(p: Pemakaian): number {
  return p.sambungan + Math.ceil(p.pesanMasuk / 20) + p.alarm + p.internal;
}

/** Membaca pemakaian dari JSON tersimpan; nilai yang tidak sah menjadi 0. */
export function bacaPemakaian(json: unknown): Pemakaian {
  const o =
    typeof json === "object" && json !== null
      ? (json as Record<string, unknown>)
      : {};
  const angka = (k: keyof Pemakaian) =>
    typeof o[k] === "number" && Number.isFinite(o[k]) && (o[k] as number) >= 0
      ? Math.floor(o[k] as number)
      : 0;
  return {
    sambungan: angka("sambungan"),
    pesanMasuk: angka("pesanMasuk"),
    alarm: angka("alarm"),
    barisSqlite: angka("barisSqlite"),
    barisD1: angka("barisD1"),
    internal: angka("internal"),
  };
}
