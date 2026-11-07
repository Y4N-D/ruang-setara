// Uji Paket inti 16 terhadap titik kejadian peta kampung (spesifikasi JS-05, P-16 dan P-38; AC-15;
// Architecture 5.4, aturan paket). Dilewati sampai app/jejak-setara/peta/kampung.json dibuat di JS-06.
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { tempatkanKejadian } from "../../inti/aturan";
import { periksaPaketPeta } from "../../inti/konten/periksa";
import { bacaPeta } from "../../inti/peta";
import type { TitikPeta, ZonaId } from "../../inti/tipe";
import { bacaBankAwal, bacaRepo, jalurRepo } from "./naskah-urai";

const JALUR_PETA = "app/jejak-setara/peta/kampung.json";
const adaPeta = existsSync(jalurRepo(JALUR_PETA));

if (!adaPeta) it.skip(`Belum tersedia: ${JALUR_PETA} belum ada (dibuat di JS-06).`, () => {});

describe.skipIf(!adaPeta)("Paket inti 16 di peta kampung", () => {
  const ambil = () => {
    const { bank } = bacaBankAwal();
    const peta = bacaPeta(JSON.parse(bacaRepo(JALUR_PETA)));
    const kodePaket = new Set(bank.paket[0].kejadian);
    const kejadian = bank.kejadian.filter((k) => kodePaket.has(k.kode)).map((k) => ({ kode: k.kode, zona: k.zona }));
    const titikPerZona: Partial<Record<ZonaId, TitikPeta[]>> = {};
    for (const t of peta.titikKejadian) (titikPerZona[t.zona] ??= []).push(t);
    return { kejadian, titikPerZona };
  };

  it("setiap zona punya titik kejadian sebanyak kejadian paket di zona itu (periksaPaketPeta tanpa temuan)", () => {
    const { kejadian, titikPerZona } = ambil();
    const jumlahTitik = Object.fromEntries(Object.entries(titikPerZona).map(([zona, daftar]) => [zona, daftar?.length ?? 0]));
    expect(
      periksaPaketPeta(
        kejadian.map((k) => k.zona),
        jumlahTitik,
      ),
    ).toEqual([]);
  });

  it.each(["uji-1", "uji-2", "uji-3"])("tempatkanKejadian menempatkan ke-16 kejadian di zonanya (benih %s)", (benihRuang) => {
    const { kejadian, titikPerZona } = ambil();
    const hasil = tempatkanKejadian(benihRuang, titikPerZona, kejadian);
    expect(hasil.map((h) => h.kode)).toEqual(kejadian.map((k) => k.kode));
    hasil.forEach((h, i) => expect(h.titik.zona, h.kode).toBe(kejadian[i].zona));
    expect(new Set(hasil.map((h) => h.titik.id)).size).toBe(kejadian.length);
  });
});
