// Huruf teks untuk kanvas (spesifikasi JS-16b, P-3). Kanvas tidak mengenal font-size-adjust, jadi ukuran label dikalikan
// faktor yang sama dengan token --js-huruf-teks-sesuai: tinggi kapital 0,64 em untuk VT323 (tinggi kapital aslinya 0,56 em).
export const FAKTOR_HURUF_TEKS = 8 / 7; // 0,64 ÷ 0,56 (token --js-huruf-teks-sesuai; Test JS-16b, penyimpangan 1)
export const HURUF_TEKS_CADANGAN = '"VT323", monospace';

/** Nilai token --js-huruf-teks dari gaya yang dihitung, atau cadangan bila token belum tersedia. */
export function keluargaHurufTeks(gaya: Pick<CSSStyleDeclaration, "getPropertyValue"> | null | undefined): string {
  const nilai = gaya?.getPropertyValue("--js-huruf-teks").trim() ?? "";
  return nilai || HURUF_TEKS_CADANGAN;
}

/** Ukuran label dalam piksel layar: ukuran dasar dikali faktor huruf teks dan rasio piksel, lalu dibulatkan. */
export function ukuranLabel(dasar: number, rasio: number): number {
  return Math.round(dasar * FAKTOR_HURUF_TEKS * rasio);
}

let tersimpan: string | null = null;
/** Keluarga huruf label dari token di dokumen; dibaca sekali, karena token tidak berubah selama halaman terbuka. */
export function keluargaHurufLabel(): string {
  if (tersimpan === null) tersimpan = keluargaHurufTeks(typeof document === "undefined" ? null : getComputedStyle(document.documentElement));
  return tersimpan;
}
