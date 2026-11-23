// Penjadwal pemuatan gambar dunia (spesifikasi JS-15, P-23): pemuatan dimulai sesudah layar Kode tampil (dua bingkai
// animasi, lalu saat peramban senggang, paling lambat 1 detik), dan paling banyak 6 gambar dimuat bersamaan, agar
// render pertama di HP lambat tidak berebut CPU dengan ratusan gambar.

/** Jumlah gambar dunia yang dimuat bersamaan. */
export const MUAT_SERENTAK = 6;
/** Batas tunggu peramban senggang sebelum pemuatan tetap dimulai. */
export const SENGGANG_MAKS_MS = 1000;

/** Membungkus tugas agar paling banyak `maks` berjalan bersamaan; urutan mulai mengikuti urutan pemanggilan. */
export function batasiSerentak(maks: number): <T>(tugas: () => Promise<T>) => Promise<T> {
  let berjalan = 0;
  const antre: (() => void)[] = [];
  const selesai = () => {
    berjalan--;
    antre.shift()?.();
  };
  return <T>(tugas: () => Promise<T>) =>
    new Promise<T>((ok, gagal) => {
      const mulai = () => {
        berjalan++;
        tugas().then(ok, gagal).finally(selesai);
      };
      if (berjalan < maks) mulai();
      else antre.push(mulai);
    });
}

export interface DepSenggang {
  bingkai: (fn: () => void) => number;
  batalBingkai: (id: number) => void;
  senggang: (fn: () => void, batasMs: number) => number;
  batalSenggang: (id: number) => void;
}

/** Ketergantungan peramban; `requestIdleCallback` yang tidak ada (Safari lama) diganti `setTimeout`. */
export function depPeramban(w: Window = window): DepSenggang {
  const adaSenggang = typeof w.requestIdleCallback === "function";
  return {
    bingkai: (fn) => w.requestAnimationFrame(() => fn()),
    batalBingkai: (id) => w.cancelAnimationFrame(id),
    senggang: (fn, batasMs) => (adaSenggang ? w.requestIdleCallback(() => fn(), { timeout: batasMs }) : w.setTimeout(fn, 0)),
    batalSenggang: (id) => (adaSenggang ? w.cancelIdleCallback(id) : w.clearTimeout(id)),
  };
}

/** Menjalankan `fn` sesudah dua bingkai animasi, lalu saat senggang (paling lambat SENGGANG_MAKS_MS). Mengembalikan pembatal. */
export function mulaiSaatSenggang(fn: () => void, dep: DepSenggang): () => void {
  let batal = false;
  let bingkai: number | null = null;
  let senggang: number | null = null;
  bingkai = dep.bingkai(() => {
    bingkai = dep.bingkai(() => {
      bingkai = null;
      senggang = dep.senggang(() => {
        senggang = null;
        if (!batal) fn();
      }, SENGGANG_MAKS_MS);
    });
  });
  return () => {
    batal = true;
    if (bingkai !== null) dep.batalBingkai(bingkai);
    if (senggang !== null) dep.batalSenggang(senggang);
  };
}
