// Batas per sambungan WebSocket pemain (spesifikasi JS-03, P-16 dan P-17; Architecture 6.6).
// Murni: waktu `sekarang` selalu diberikan pemanggil.
import { BATAS } from "../../../../app/jejak-setara/inti/aturan";
import { PROTOKOL_VERSI, skemaPemain, type PesanPemain } from "../../../../app/jejak-setara/inti/protokol";

export interface KeadaanSambungan {
  ember: number; // sisa token (paling banyak BATAS.lonjakan)
  isiTerakhirMs: number;
  pelanggaran: number[]; // waktu pelanggaran di dalam jendela
  galatTerakhirMs: number | null; // waktu galat TERLALU_CEPAT terakhir
}

export function sambunganBaru(sekarang: number): KeadaanSambungan {
  return { ember: BATAS.lonjakan, isiTerakhirMs: sekarang, pelanggaran: [], galatTerakhirMs: null };
}

/** Panjang teks dalam byte UTF-8. */
export function panjangUtf8(teks: string): number {
  let n = 0;
  for (let i = 0; i < teks.length; i++) {
    const c = teks.charCodeAt(i);
    if (c < 0x80) n += 1;
    else if (c < 0x800) n += 2;
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < teks.length) {
      n += 4;
      i++;
    } else n += 3;
  }
  return n;
}

/** Mengambil satu token dari ember yang terisi 20 per detik. false bila ember kosong. */
export function ambilToken(k: KeadaanSambungan, sekarang: number): boolean {
  const selang = Math.max(0, sekarang - k.isiTerakhirMs);
  k.ember = Math.min(BATAS.lonjakan, k.ember + (selang * BATAS.pesanPerDetik) / 1000);
  k.isiTerakhirMs = sekarang;
  if (k.ember < 1) return false;
  k.ember -= 1;
  return true;
}

/** Mencatat satu pelanggaran. Galat dikirim pada pelanggaran ke-3 (sekali per jendela); ke-10 menutup sambungan. */
export function catatPelanggaran(k: KeadaanSambungan, sekarang: number): { kirimGalat: boolean; tutup: boolean } {
  k.pelanggaran = k.pelanggaran.filter((w) => sekarang - w < BATAS.jendelaPelanggaranMs);
  k.pelanggaran.push(sekarang);
  const n = k.pelanggaran.length;
  if (n >= BATAS.pelanggaranTutup) return { kirimGalat: false, tutup: true };
  const bolehGalat = k.galatTerakhirMs === null || sekarang - k.galatTerakhirMs >= BATAS.jendelaPelanggaranMs;
  if (n >= BATAS.pelanggaranGalat && bolehGalat) {
    k.galatTerakhirMs = sekarang;
    return { kirimGalat: true, tutup: false };
  }
  return { kirimGalat: false, tutup: false };
}

export type HasilBaca = { jenis: "sah"; pesan: PesanPemain } | { jenis: "pelanggaran" } | { jenis: "versi" };

/** Memeriksa satu pesan mentah: biner, ukuran, ember token, JSON, versi `halo`, lalu skema. */
export function bacaPesanPemain(k: KeadaanSambungan, mentah: unknown, sekarang: number): HasilBaca {
  if (typeof mentah !== "string") return { jenis: "pelanggaran" };
  if (panjangUtf8(mentah) > BATAS.pesanByte) return { jenis: "pelanggaran" };
  if (!ambilToken(k, sekarang)) return { jenis: "pelanggaran" };
  let data: unknown;
  try {
    data = JSON.parse(mentah);
  } catch {
    return { jenis: "pelanggaran" };
  }
  if (typeof data === "object" && data !== null) {
    const d = data as { t?: unknown; v?: unknown };
    if (d.t === "halo" && d.v !== PROTOKOL_VERSI) return { jenis: "versi" };
  }
  const hasil = skemaPemain.safeParse(data);
  return hasil.success ? { jenis: "sah", pesan: hasil.data } : { jenis: "pelanggaran" };
}
