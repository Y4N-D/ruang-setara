// Pembaca dan pemeriksa peta kampung (spesifikasi JS-02, P-29 sampai P-32; Architecture 11.1.1).
// `bacaPeta` adalah pemeriksa resmi `app/jejak-setara/peta/kampung.json` buatan build_peta.py (JS-06).
// Skema zod dibuat di dalam `bacaPeta`, bukan di tingkat atas modul, agar layar yang hanya memakai
// `selPadat` tidak ikut membawa zod.
import { z } from "zod";
import { GalatInti } from "./aturan";
import type { PetaJejak } from "./tipe";

/** Ukuran satu ubin dalam piksel logis. */
export const UKURAN_UBIN = 16;
/** Lebar dan tinggi peta paling besar, dalam ubin. */
export const UKURAN_PETA_MAKS = 512;

const POLA_POTONGAN = /^(\d{1,3})x(\d{1,7})$/;
const POLA_ID = /^[A-Za-z0-9_-]{1,32}$/;
const POLA_JENIS = /^[a-z0-9_]{1,32}$/;

/**
 * Mengurai teks RLE `"<nilai>x<jumlah>;"` berulang (nilai 0–255, jumlah ≥ 1) menjadi satu byte per sel.
 * Teks cacat atau jumlah sel yang tidak tepat `panjangDiharapkan` ditolak dengan galat PETA_CACAT.
 */
export function uraiRle(teks: string, panjangDiharapkan: number): Uint8Array {
  if (!Number.isSafeInteger(panjangDiharapkan) || panjangDiharapkan < 0) {
    throw new RangeError("uraiRle: panjangDiharapkan harus bilangan bulat ≥ 0");
  }
  const hasil = new Uint8Array(panjangDiharapkan);
  let isi = 0;
  let i = 0;
  while (i < teks.length) {
    const akhir = teks.indexOf(";", i);
    if (akhir < 0) throw new GalatInti("PETA_CACAT", `RLE tanpa ";" di akhir potongan (posisi ${i})`);
    const potongan = teks.slice(i, akhir);
    const cocok = POLA_POTONGAN.exec(potongan);
    if (!cocok) throw new GalatInti("PETA_CACAT", `potongan RLE "${potongan.slice(0, 20)}" tidak sah`);
    const nilai = Number(cocok[1]);
    const jumlah = Number(cocok[2]);
    if (nilai > 255 || jumlah < 1) throw new GalatInti("PETA_CACAT", `potongan RLE "${potongan}" di luar batas`);
    if (isi + jumlah > panjangDiharapkan) {
      throw new GalatInti("PETA_CACAT", `RLE berisi lebih dari ${panjangDiharapkan} sel`);
    }
    hasil.fill(nilai, isi, isi + jumlah);
    isi += jumlah;
    i = akhir + 1;
  }
  if (isi !== panjangDiharapkan) {
    throw new GalatInti("PETA_CACAT", `RLE berisi ${isi} sel, seharusnya ${panjangDiharapkan}`);
  }
  return hasil;
}

function skemaPeta() {
  const indeks = () => z.number().int().min(0).max(UKURAN_PETA_MAKS - 1);
  const id = () => z.string().regex(POLA_ID);
  const zona = () => z.enum(["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]);
  const titik = () => z.object({ id: id(), zona: zona(), x: indeks(), y: indeks() }).strict();
  const kotakBatas = () => z.object({ kiri: indeks(), atas: indeks(), kanan: indeks(), bawah: indeks() }).strict();
  return z
    .object({
      versi: z.literal(1),
      lebar: z.number().int().min(1).max(UKURAN_PETA_MAKS),
      tinggi: z.number().int().min(1).max(UKURAN_PETA_MAKS),
      ukuranUbin: z.literal(UKURAN_UBIN),
      ubin: z.string(),
      tabrakan: z.string(),
      objek: z.array(
        z
          .object({
            id: id(),
            jenis: z.string().regex(POLA_JENIS),
            x: indeks(),
            y: indeks(),
            arah: z.enum(["bawah", "atas", "kanan", "kiri"]).optional(),
          })
          .strict(),
      ),
      zona: z.array(kotakBatas().extend({ id: zona(), nama: z.string().min(1).max(32) }).strict()),
      titikKejadian: z.array(titik()),
      kotak: z.array(
        z
          .object({
            id: id(),
            jenis: z.enum(["sepatu", "kompas", "buku", "teropong", "karcis"]),
            zona: zona(),
            x: indeks(),
            y: indeks(),
          })
          .strict(),
      ),
      halte: z.array(titik()),
      gerbangLobi: kotakBatas(),
      titikMuncul: z.array(z.object({ x: indeks(), y: indeks() }).strict()).min(1),
    })
    .strict();
}

function cacat(rincian: string): never {
  throw new GalatInti("PETA_CACAT", rincian);
}

/**
 * Memeriksa isi `kampung.json` (bentuk `PetaJejak<string>`) lalu mengembalikan peta dengan lapisan
 * terurai. Isi yang tidak cocok ditolak dengan galat PETA_CACAT.
 */
export function bacaPeta(nilai: unknown): PetaJejak {
  const hasil = skemaPeta().safeParse(nilai);
  if (!hasil.success) {
    const masalah = hasil.error.issues[0];
    cacat(`${masalah.path.join(".") || "(akar)"}: ${masalah.message}`);
  }
  const json = hasil.data;
  const sel = json.lebar * json.tinggi;
  const ubin = uraiRle(json.ubin, sel);
  const tabrakan = uraiRle(json.tabrakan, sel);
  if (ubin.some((v) => v > 63)) cacat("lapisan ubin hanya boleh bernilai 0–63");
  if (tabrakan.some((v) => v > 1)) cacat("lapisan tabrakan hanya boleh bernilai 0 atau 1");

  const diDalam = (x: number, y: number, apa: string) => {
    if (x >= json.lebar || y >= json.tinggi) cacat(`${apa} (${x}, ${y}) di luar peta ${json.lebar} × ${json.tinggi}`);
  };
  const batasSah = (b: { kiri: number; atas: number; kanan: number; bawah: number }, apa: string) => {
    if (b.kiri > b.kanan || b.atas > b.bawah) cacat(`${apa}: kiri/atas melebihi kanan/bawah`);
    diDalam(b.kanan, b.bawah, apa);
  };

  const zonaAda = new Set<string>();
  for (const zonaPeta of json.zona) {
    if (zonaAda.has(zonaPeta.id)) cacat(`id zona ${zonaPeta.id} ganda`);
    zonaAda.add(zonaPeta.id);
    batasSah(zonaPeta, `zona ${zonaPeta.id}`);
  }
  batasSah(json.gerbangLobi, "gerbangLobi");

  const idObjek = new Set<string>();
  for (const o of json.objek) {
    if (idObjek.has(o.id)) cacat(`id objek ${o.id} ganda`);
    idObjek.add(o.id);
    diDalam(o.x, o.y, `objek ${o.id}`);
  }

  const idTitik = new Set<string>();
  for (const [daftar, apa] of [
    [json.titikKejadian, "titik kejadian"],
    [json.kotak, "kotak"],
    [json.halte, "halte"],
  ] as const) {
    for (const t of daftar) {
      if (idTitik.has(t.id)) cacat(`id ${t.id} ganda (titik kejadian, kotak, dan halte berbagi id)`);
      idTitik.add(t.id);
      if (!zonaAda.has(t.zona)) cacat(`${apa} ${t.id} memakai zona ${t.zona} yang tidak ada`);
      diDalam(t.x, t.y, `${apa} ${t.id}`);
    }
  }
  json.titikMuncul.forEach((t, i) => diDalam(t.x, t.y, `titikMuncul[${i}]`));

  return { ...json, ubin, tabrakan };
}

/** Ubin padat, atau di luar peta (batas peta selalu padat). Koordinat ubin dibulatkan ke bawah. */
export function selPadat(peta: Pick<PetaJejak, "lebar" | "tinggi" | "tabrakan">, ubinX: number, ubinY: number): boolean {
  const x = Math.floor(ubinX);
  const y = Math.floor(ubinY);
  if (!(x >= 0 && y >= 0 && x < peta.lebar && y < peta.tinggi)) return true;
  return peta.tabrakan[y * peta.lebar + x] !== 0;
}

/** Tepi kiri atau atas ubin ke-n dalam piksel logis. */
export function ubinKePiksel(n: number): number {
  return n * UKURAN_UBIN;
}

/** Pusat ubin ke-n dalam piksel logis. */
export function pusatUbin(n: number): number {
  return n * UKURAN_UBIN + UKURAN_UBIN / 2;
}

/** Ubin yang memuat koordinat piksel logis. */
export function pikselKeUbin(px: number): number {
  return Math.floor(px / UKURAN_UBIN);
}
