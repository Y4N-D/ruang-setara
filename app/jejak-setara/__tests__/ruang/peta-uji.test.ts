// Peta uji 160 × 100 ubin (spesifikasi JS-03, P-41; AC-13).
import { describe, expect, it } from "vitest";
import { bacaPeta, selPadat, uraiRle } from "../../inti/peta";
import { keRle, LEBAR_UJI, PETA_UJI, PETA_UJI_JSON, TINGGI_UJI } from "../../../../server/jejak-setara/src/ruang/peta-uji";

describe("peta uji", () => {
  it("lolos bacaPeta dan sama dengan lapisan yang dipakai server", () => {
    const peta = bacaPeta(PETA_UJI_JSON);
    expect([peta.lebar, peta.tinggi]).toEqual([160, 100]);
    expect(peta.tabrakan).toEqual(PETA_UJI.tabrakan);
    expect(PETA_UJI.versi).toBe(1);
  });

  it("tepi padat, titik muncul kosong, dan delapan blok 4 × 4", () => {
    const peta = { lebar: LEBAR_UJI, tinggi: TINGGI_UJI, tabrakan: PETA_UJI.tabrakan };
    expect([selPadat(peta, 0, 50), selPadat(peta, 159, 50), selPadat(peta, 80, 0), selPadat(peta, 80, 99)]).toEqual([true, true, true, true]);
    for (const t of PETA_UJI.titikMuncul) expect(selPadat(peta, t.x, t.y), JSON.stringify(t)).toBe(false);
    expect(PETA_UJI.tabrakan.reduce((a, b) => a + b, 0)).toBe(2 * 160 + 2 * 98 + 8 * 16);
  });

  it("keRle dan uraiRle saling membalik", () => {
    const sel = Uint8Array.from([0, 0, 1, 1, 1, 0, 2]);
    expect(keRle(sel)).toBe("0x2;1x3;0x1;2x1;");
    expect(uraiRle(keRle(sel), sel.length)).toEqual(sel);
  });
});
