// Penjadwal pemuatan gambar dunia (spesifikasi JS-15, P-23).
import { describe, expect, it } from "vitest";
import { batasiSerentak, MUAT_SERENTAK, mulaiSaatSenggang, SENGGANG_MAKS_MS, type DepSenggang } from "../../pemain/dunia/penjadwal";

describe("batasiSerentak", () => {
  it("paling banyak 6 tugas berjalan bersamaan, semua selesai, dan urutan mulai sesuai urutan panggil", async () => {
    expect(MUAT_SERENTAK).toBe(6);
    const batas = batasiSerentak(MUAT_SERENTAK);
    let berjalan = 0;
    let puncak = 0;
    const mulai: number[] = [];
    const hasil = await Promise.all(
      Array.from({ length: 40 }, (_, i) =>
        batas(async () => {
          mulai.push(i);
          berjalan++;
          puncak = Math.max(puncak, berjalan);
          await new Promise((ok) => setTimeout(ok, (i * 7) % 5));
          berjalan--;
          return i * 2;
        }),
      ),
    );
    expect(puncak).toBe(6);
    expect(hasil).toEqual(Array.from({ length: 40 }, (_, i) => i * 2));
    expect(mulai).toEqual(Array.from({ length: 40 }, (_, i) => i));
  });

  it("tugas yang gagal tetap membebaskan tempat", async () => {
    const batas = batasiSerentak(1);
    await expect(batas(() => Promise.reject(new Error("gagal")))).rejects.toThrow("gagal");
    await expect(batas(() => Promise.resolve(5))).resolves.toBe(5);
  });
});

describe("mulaiSaatSenggang", () => {
  const tiruan = () => {
    const catatan: string[] = [];
    const bingkai: (() => void)[] = [];
    const senggang: { fn: () => void; batasMs: number }[] = [];
    const dep: DepSenggang = {
      bingkai: (fn) => (catatan.push("bingkai"), bingkai.push(fn)),
      batalBingkai: () => catatan.push("batal bingkai"),
      senggang: (fn, batasMs) => (catatan.push(`senggang ${batasMs}`), senggang.push({ fn, batasMs })),
      batalSenggang: () => catatan.push("batal senggang"),
    };
    return { catatan, bingkai, senggang, dep };
  };

  it("dua bingkai animasi, lalu senggang dengan batas 1 detik, lalu fungsi berjalan sekali", () => {
    const t = tiruan();
    let jalan = 0;
    mulaiSaatSenggang(() => jalan++, t.dep);
    expect(t.catatan).toEqual(["bingkai"]);
    t.bingkai.shift()!();
    expect(t.catatan).toEqual(["bingkai", "bingkai"]);
    expect(jalan).toBe(0);
    t.bingkai.shift()!();
    expect(t.catatan).toEqual(["bingkai", "bingkai", `senggang ${SENGGANG_MAKS_MS}`]);
    expect(SENGGANG_MAKS_MS).toBe(1000);
    t.senggang.shift()!.fn();
    expect(jalan).toBe(1);
  });

  it("pembatal menghentikan semuanya, termasuk sesudah senggang terjadwal", () => {
    const t = tiruan();
    let jalan = 0;
    const batal = mulaiSaatSenggang(() => jalan++, t.dep);
    t.bingkai.shift()!();
    t.bingkai.shift()!();
    batal();
    t.senggang.shift()?.fn();
    expect(jalan).toBe(0);
    expect(t.catatan.at(-1)).toBe("batal senggang");
  });
});
