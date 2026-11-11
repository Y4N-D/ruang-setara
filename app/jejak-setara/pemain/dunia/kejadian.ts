// Kejadian di layar pemain (spesifikasi JS-08, P-11, P-14 sampai P-21): titik yang sudah terlihat beserta tokoh dan
// propertinya, kejadian yang selesai, tata letak tokoh dan properti di ruang 3 × 3 sekitar titik, jangkauan Periksa
// 24 piksel, dan nomor zona untuk kepala dialog. Murni, tanpa DOM, sehingga diuji di Node.
import { jarak, JANGKAUAN_KLIEN_PX } from "../../inti/aturan";
import { pusatUbin } from "../../inti/peta";
import type { Posisi } from "../../inti/tipe";
import { ZONA } from "./petaKampung";

export interface TitikKejadianKlien {
  kejadianId: string;
  x: number; // ubin
  y: number;
  setTokoh: string[];
}

/** Keadaan kejadian di layar ini; diisi `kejadian_terlihat` dan `pribadi`. */
export class KejadianKlien {
  private readonly titikTerlihat = new Map<string, TitikKejadianKlien>();
  selesai = new Set<string>();

  /** Mencatat titik yang terlihat; mengembalikan true bila kejadiannya baru pertama kali terlihat di layar ini (P-13). */
  terima(t: TitikKejadianKlien): boolean {
    const baru = !this.kodeTerlihat().has(t.kejadianId);
    this.titikTerlihat.set(`${t.kejadianId}@${t.x},${t.y}`, { ...t, setTokoh: [...t.setTokoh] });
    return baru;
  }

  aturSelesai(kode: readonly string[]): void {
    this.selesai = new Set(kode);
  }

  tandaiSelesai(kode: string): void {
    this.selesai.add(kode);
  }

  kosongkan(): void {
    this.titikTerlihat.clear();
    this.selesai.clear();
  }

  daftar(): TitikKejadianKlien[] {
    return [...this.titikTerlihat.values()];
  }

  kodeTerlihat(): Set<string> {
    return new Set([...this.titikTerlihat.values()].map((t) => t.kejadianId));
  }

  get jumlahTitik(): number {
    return this.titikTerlihat.size;
  }
}

export interface LetakTokoh {
  kunci: string;
  jenis: "npc" | "obj";
  dx: number; // sel kiri-atas relatif terhadap sel titik, −1 sampai 1
  dy: number;
  lebar: number; // jejak kaki dalam ubin (tokoh 1 × 1)
  tinggi: number;
}

type Sel = readonly [number, number];
const CALON_PROPERTI: Readonly<Record<string, readonly Sel[]>> = {
  "3x1": [[-1, -1]],
  "2x1": [
    [-1, -1],
    [0, -1],
    [-1, 1],
    [0, 1],
  ],
  "1x2": [
    [1, -1],
    [-1, -1],
  ],
  "2x2": [
    [0, -1],
    [-1, -1],
  ],
  "1x1": [
    [0, -1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ],
};
const CALON_TOKOH: readonly Sel[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [-1, -1],
  [1, -1],
];

/**
 * Tata letak `setTokoh` di ruang 3 × 3 sekitar titik (P-14, usulan 4a). Properti (`obj_…`, jejak kaki dari OBJEK)
 * lebih dulu, yang terluas lebih dulu (seri menurut urutan kunci), di calon sel menurut ukurannya; calon sah bila
 * semua selnya di dalam 3 × 3, belum dipakai properti lain, dan tidak memuat sel titik, kecuali properti 2 × 2.
 * Tokoh (`npc_…`) menurut urutan kunci di sel pertama yang bebas; bila tidak ada, di sel pertama yang hanya
 * tertutup properti setinggi 1 ubin. Yang tidak mendapat tempat tidak digambar.
 */
export function tataLetakKejadian(setTokoh: readonly string[], objek: Readonly<Record<string, { lebar: number; tinggi: number } | undefined>>): LetakTokoh[] {
  const hasil: LetakTokoh[] = [];
  const pemilikSel = new Map<string, { jenis: "npc" | "obj"; tinggi: number }>();
  const kunciSel = (x: number, y: number) => `${x},${y}`;
  const properti = setTokoh
    .map((kunci, urutan) => ({ kunci, urutan, o: kunci.startsWith("obj_") ? objek[kunci.slice(4)] : undefined }))
    .filter((p): p is { kunci: string; urutan: number; o: { lebar: number; tinggi: number } } => p.o !== undefined)
    .sort((a, b) => b.o.lebar * b.o.tinggi - a.o.lebar * a.o.tinggi || a.urutan - b.urutan);
  for (const p of properti) {
    const { lebar, tinggi } = p.o;
    for (const [x0, y0] of CALON_PROPERTI[`${lebar}x${tinggi}`] ?? []) {
      const sel: Sel[] = [];
      for (let y = y0; y < y0 + tinggi; y++) for (let x = x0; x < x0 + lebar; x++) sel.push([x, y]);
      const di3x3 = sel.every(([x, y]) => x >= -1 && x <= 1 && y >= -1 && y <= 1);
      const bebas = sel.every(([x, y]) => !pemilikSel.has(kunciSel(x, y)));
      const tanpaTitik = (lebar === 2 && tinggi === 2) || sel.every(([x, y]) => x !== 0 || y !== 0);
      if (!di3x3 || !bebas || !tanpaTitik) continue;
      for (const [x, y] of sel) pemilikSel.set(kunciSel(x, y), { jenis: "obj", tinggi });
      hasil.push({ kunci: p.kunci, jenis: "obj", dx: x0, dy: y0, lebar, tinggi });
      break;
    }
  }
  const tokohDi = new Set<string>();
  for (const kunci of setTokoh) {
    if (!kunci.startsWith("npc_")) continue;
    const bebas = CALON_TOKOH.find(([x, y]) => !pemilikSel.has(kunciSel(x, y)) && !tokohDi.has(kunciSel(x, y)));
    const depanProperti = CALON_TOKOH.find(([x, y]) => !tokohDi.has(kunciSel(x, y)) && pemilikSel.get(kunciSel(x, y))?.jenis === "obj" && pemilikSel.get(kunciSel(x, y))?.tinggi === 1);
    const sel = bebas ?? depanProperti;
    if (!sel) continue;
    tokohDi.add(kunciSel(sel[0], sel[1]));
    hasil.push({ kunci, jenis: "npc", dx: sel[0], dy: sel[1], lebar: 1, tinggi: 1 });
  }
  return hasil;
}

/**
 * Kejadian dalam jangkauan Periksa (P-21): titik terlihat dari kejadian yang belum selesai dengan jarak ke pusatnya
 * paling jauh 24 piksel logis; bila lebih dari satu, yang terdekat, lalu kode terkecil.
 */
export function kejadianDalamJangkauan(posisi: Posisi, titik: readonly TitikKejadianKlien[], selesai: ReadonlySet<string>): string | null {
  let terbaik: { kode: string; d: number } | null = null;
  for (const t of titik) {
    if (selesai.has(t.kejadianId)) continue;
    const d = jarak(posisi, { x: pusatUbin(t.x), y: pusatUbin(t.y) });
    if (d > JANGKAUAN_KLIEN_PX) continue;
    if (!terbaik || d < terbaik.d || (d === terbaik.d && t.kejadianId < terbaik.kode)) terbaik = { kode: t.kejadianId, d };
  }
  return terbaik?.kode ?? null;
}

/** Nomor zona (1–8) ubin (x, y), untuk ikon zona di kepala dialog (P-40). */
export function nomorZona(x: number, y: number): number {
  const z = ZONA.find((q) => x >= q.kiri && x <= q.kanan && y >= q.atas && y <= q.bawah);
  return z ? Number(z.id.slice(1)) : 1;
}
