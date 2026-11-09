// Layar tetap menyala (spesifikasi JS-07, P-44; AC-15) dengan API tiruan.
import { describe, expect, it } from "vitest";
import { PenjagaLayar, type ApiWakeLock, type DokumenMirip, type KunciLayar } from "../../pemain/dunia/layarMenyala";

function tiruan(tolak = false) {
  const kunci: (KunciLayar & { dilepas: boolean })[] = [];
  const api: ApiWakeLock = {
    request: async () => {
      if (tolak) throw new Error("ditolak");
      const k = {
        dilepas: false,
        get released() {
          return this.dilepas;
        },
        release: async () => {
          k.dilepas = true;
        },
      };
      kunci.push(k);
      return k;
    },
  };
  const pendengar = new Set<() => void>();
  const dok: DokumenMirip & { visibilityState: string } = {
    visibilityState: "visible",
    addEventListener: (_j, f) => void pendengar.add(f),
    removeEventListener: (_j, f) => void pendengar.delete(f),
  };
  const ubahTerlihat = (v: string) => {
    dok.visibilityState = v;
    for (const f of pendengar) f();
  };
  return { api, dok, kunci, pendengar, ubahTerlihat };
}

const tunggu = () => new Promise((r) => setTimeout(r, 0));

describe("Screen Wake Lock (P-44)", () => {
  it("diminta saat masuk lobi, diminta lagi saat tab kembali terlihat, dan dilepas di layar akhir", async () => {
    const t = tiruan();
    const p = new PenjagaLayar(t.api, t.dok);
    await p.nyalakan();
    await p.nyalakan();
    expect(t.kunci).toHaveLength(1);
    t.kunci[0].dilepas = true; // peramban melepas kunci saat tab tersembunyi
    t.ubahTerlihat("hidden");
    t.ubahTerlihat("visible");
    await tunggu();
    expect(t.kunci).toHaveLength(2);
    await p.matikan();
    expect(t.kunci[1].dilepas).toBe(true);
    expect(t.pendengar.size).toBe(0);
    t.ubahTerlihat("visible");
    await tunggu();
    expect(t.kunci).toHaveLength(2);
  });

  it("tanpa API atau permintaan ditolak: tidak ada galat dan tidak ada pesan", async () => {
    await expect(new PenjagaLayar(null, null).nyalakan()).resolves.toBeUndefined();
    const t = tiruan(true);
    const p = new PenjagaLayar(t.api, t.dok);
    await expect(p.nyalakan()).resolves.toBeUndefined();
    expect(p.permintaan).toBe(1);
    await expect(p.matikan()).resolves.toBeUndefined();
  });
});
