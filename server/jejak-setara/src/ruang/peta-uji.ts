// Peta uji 160 × 100 ubin (spesifikasi JS-03, P-41): dinding di tepi dan delapan blok padat 4 × 4.
// Sejak JS-07 server memakai peta kampung (peta-kampung.ts); berkas ini hanya dipakai uji (P-46).
// Lapisan tabrakan dibentuk sebagai teks RLE lalu diurai dengan uraiRle, tanpa zod.
import { tutupGerbang, uraiRle, UKURAN_UBIN } from "../../../../app/jejak-setara/inti/peta";
import type { PetaJejak, ZonaId } from "../../../../app/jejak-setara/inti/tipe";

export const LEBAR_UJI = 160;
export const TINGGI_UJI = 100;
export const VERSI_PETA_UJI = 1;

/** Sudut kiri-atas kedelapan blok padat 4 × 4, dalam ubin. */
const BLOK: readonly (readonly [number, number])[] = [
  [20, 20], [60, 20], [100, 20], [140, 20], [20, 76], [60, 76], [100, 76], [140, 76],
];

function gridTabrakan(): Uint8Array {
  const sel = new Uint8Array(LEBAR_UJI * TINGGI_UJI);
  for (let y = 0; y < TINGGI_UJI; y++) {
    for (let x = 0; x < LEBAR_UJI; x++) {
      if (x === 0 || y === 0 || x === LEBAR_UJI - 1 || y === TINGGI_UJI - 1) sel[y * LEBAR_UJI + x] = 1;
    }
  }
  for (const [bx, by] of BLOK) {
    for (let y = by; y < by + 4; y++) for (let x = bx; x < bx + 4; x++) sel[y * LEBAR_UJI + x] = 1;
  }
  return sel;
}

/** Teks RLE "<nilai>x<jumlah>;" dari satu byte per sel. */
export function keRle(sel: Uint8Array): string {
  let hasil = "";
  let i = 0;
  while (i < sel.length) {
    let j = i;
    while (j < sel.length && sel[j] === sel[i]) j++;
    hasil += `${sel[i]}x${j - i};`;
    i = j;
  }
  return hasil;
}

const ZONA_ID: readonly ZonaId[] = ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"];

/** Isi peta uji dalam bentuk kampung.json (PetaJejak<string>), untuk diuji dengan bacaPeta. */
export const PETA_UJI_JSON: PetaJejak<string> = {
  versi: 1,
  lebar: LEBAR_UJI,
  tinggi: TINGGI_UJI,
  ukuranUbin: UKURAN_UBIN,
  ubin: `0x${LEBAR_UJI * TINGGI_UJI};`,
  tabrakan: keRle(gridTabrakan()),
  objek: [],
  zona: ZONA_ID.map((id, i) => {
    const kiri = (i % 4) * 40;
    const atas = i < 4 ? 0 : 50;
    return { id, nama: `Zona uji ${i + 1}`, kiri, atas, kanan: kiri + 39, bawah: atas + 49 };
  }),
  titikKejadian: ZONA_ID.flatMap((zona, i) => {
    const kiri = (i % 4) * 40;
    const atas = i < 4 ? 0 : 50;
    return [
      { id: `uji-${zona}-a`, zona, x: kiri + 10, y: atas + 10 },
      { id: `uji-${zona}-b`, zona, x: kiri + 30, y: atas + 40 },
    ];
  }),
  kotak: [],
  halte: [],
  gerbangLobi: { kiri: 78, atas: 48, kanan: 81, bawah: 51 },
  titikMuncul: [
    { x: 76, y: 52 }, { x: 78, y: 52 }, { x: 80, y: 52 }, { x: 82, y: 52 },
    { x: 76, y: 54 }, { x: 78, y: 54 }, { x: 80, y: 54 }, { x: 82, y: 54 },
  ],
};

const GRID_UJI = uraiRle(PETA_UJI_JSON.tabrakan, LEBAR_UJI * TINGGI_UJI);

/** Peta uji dalam bentuk yang dipakai inti ruang: lapisan tabrakan terurai, grid lobi, dan titik muncul. */
export const PETA_UJI = {
  versi: VERSI_PETA_UJI,
  lebar: LEBAR_UJI,
  tinggi: TINGGI_UJI,
  tabrakan: GRID_UJI,
  tabrakanLobi: tutupGerbang({ lebar: LEBAR_UJI, tinggi: TINGGI_UJI, tabrakan: GRID_UJI, gerbangLobi: PETA_UJI_JSON.gerbangLobi }),
  titikMuncul: PETA_UJI_JSON.titikMuncul,
};
