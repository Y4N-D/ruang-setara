// Uji kunci set tokoh terhadap berkas aset dan CREDITS.md (spesifikasi JS-05, usulan 5a, bagian "Aset";
// AC-8). Begitu manifest.ts ada (Permintaan A-6), uji ini ditambah pemeriksaan ke manifest.
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bacaBankAwal, bacaRepo, jalurRepo } from "./naskah-urai";

const { bank } = bacaBankAwal();
const kredit = bacaRepo("app/jejak-setara/assets/CREDITS.md").split("\n");

describe("kunci set tokoh", () => {
  for (const k of bank.kejadian) {
    it(`${k.kode}: setiap kunci punya berkas PNG dan tercatat disetujui di CREDITS.md`, () => {
      for (const kunci of k.setTokoh) {
        const folder = kunci.startsWith("npc_") ? "npc" : "obj";
        const jalur = `${folder}/${kunci}.png`;
        expect(existsSync(jalurRepo("app/jejak-setara/assets", jalur)), jalur).toBe(true);
        expect(kredit.some((baris) => baris.includes(`\`${jalur}\``) && /disetujui/i.test(baris)), `${jalur} di CREDITS.md`).toBe(true);
        expect(kunci.endsWith("_atas"), kunci).toBe(false);
      }
    });
  }

  it("44 kunci di 16 kejadian, 37 berbeda: 26 tokoh dan 11 properti (D-1)", () => {
    const semua = bank.kejadian.flatMap((k) => k.setTokoh);
    const berbeda = [...new Set(semua)];
    expect(semua).toHaveLength(44);
    expect(berbeda).toHaveLength(37);
    expect(berbeda.filter((x) => x.startsWith("npc_"))).toHaveLength(26);
    expect(berbeda.filter((x) => x.startsWith("obj_"))).toHaveLength(11);
  });
});
