// Bantuan uji ujung ke ujung (perbaikan uji 13 November 2026): ruang coba yang satu kejadiannya tidak berdekatan
// dengan titik kejadian lain di layar. Letak kejadian diacak per ruang. Pada sekitar 17% ruang, titik kejadian lain
// (paling sering K-14, satu zona dengan K-13) ikut tampak saat pemain berdiri di bawah titik K-13, sehingga tokohnya
// ikut terhitung di `data-tokoh-kejadian`. Uji yang menghitung tokoh satu kejadian membuat ruang ulang sampai tidak
// ada titik lain di dalam pandangan kamera, ditambah tepi 3 ubin untuk tokoh dan properti di sekitar titik.
// Berkas ini tidak berakhiran .uji.ts, jadi tidak dibaca sebagai uji.
import { readFileSync } from "node:fs";
import { expect, type APIRequestContext } from "@playwright/test";
import { PANDANGAN } from "../../app/jejak-setara/inti/aturan";

type Titik = { x: number; y: number };

const peta = JSON.parse(readFileSync(new URL("../../app/jejak-setara/peta/kampung.json", import.meta.url), "utf8")) as { lebar: number; tinggi: number };
const LEBAR_PX = peta.lebar * 16;
const TINGGI_PX = peta.tinggi * 16;
const TEPI_PX = 48;

/**
 * Benar bila salah satu titik `lain` berada di pandangan kamera pemain yang berdiri satu ubin di bawah titik `t`
 * (titik kaki 16x + 8, 16y + 12, seperti kait `pindahkan`), ditambah tepi 48 piksel. Kamera mengikuti
 * `terlihatDiLayar`: 320 × 180 piksel di tengah pemain, dibatasi tepi peta.
 */
export function adaTitikLainDiPandangan(t: Titik, lain: readonly Titik[]): boolean {
  const kakiX = t.x * 16 + 8;
  const kakiY = (t.y + 1) * 16 + 12;
  const kiri = Math.max(0, Math.min(kakiX - PANDANGAN.lebar / 2, LEBAR_PX - PANDANGAN.lebar));
  const atas = Math.max(0, Math.min(kakiY - PANDANGAN.tinggi / 2, TINGGI_PX - PANDANGAN.tinggi));
  return lain.some((p) => {
    const x = p.x * 16 + 8;
    const y = p.y * 16 + 8;
    return x >= kiri - TEPI_PX && x <= kiri + PANDANGAN.lebar + TEPI_PX && y >= atas - TEPI_PX && y <= atas + PANDANGAN.tinggi + TEPI_PX;
  });
}

/** Membuat ruang coba (16 kejadian) sampai titik pertama `kejadianId` tidak berdekatan dengan titik kejadian lain. */
export async function ruangKejadianSendiri(request: APIRequestContext, kejadianId: string, isiRuang: Record<string, unknown> = {}): Promise<{ kode: string; titik: Titik }> {
  for (let i = 0; i < 20; i++) {
    const j = await request.post("/api/ruang-coba", { data: isiRuang });
    expect(j.status()).toBe(201);
    const ruang = (await j.json()) as { kode: string; kejadian: number };
    expect(ruang.kejadian).toBe(16);
    const daftar = ((await (await request.get(`/api/ruang-coba/${ruang.kode}/kejadian`)).json()) as { kejadian: { kejadianId: string; titik: Titik[] }[] }).kejadian;
    const titik = daftar.find((k) => k.kejadianId === kejadianId)!.titik[0];
    const lain = daftar.filter((k) => k.kejadianId !== kejadianId).flatMap((k) => k.titik);
    if (!adaTitikLainDiPandangan(titik, lain)) return { kode: ruang.kode, titik };
  }
  throw new Error(`dalam 20 ruang, titik ${kejadianId} selalu berdekatan dengan titik kejadian lain`);
}
