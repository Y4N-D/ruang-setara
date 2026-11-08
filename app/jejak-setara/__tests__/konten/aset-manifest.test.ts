// Uji manifest aset Jejak Setara (Architecture 11.2; Permintaan C-6; usulan 11a JS-07).
// manifest.ts dibuat build_jejak.py. Uji ini memeriksa ulang hasilnya tanpa Python: setiap butir menunjuk PNG yang
// ada, lebar × bingkai dan tinggi sama dengan ukuran PNG, OBJEK lengkap untuk kampung.json dengan jejak kaki aturan
// JS-06, AVATAR delapan butir, kunci WARNA_TAS sama dengan WarnaTas, dan hanya aset Disetujui yang masuk.
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AVATAR, IKON, KUNCI_TAS, NPC, OBJEK, TANDA, TOKOH, UBIN, WARNA_TAS, type Gambar } from "../../assets/manifest";
import type { PetaJejak, WarnaTas } from "../../inti/tipe";

const AKAR = new URL("../../../../", import.meta.url);
const bacaTeks = (jalur: string) => readFileSync(new URL(jalur, AKAR), "utf8");
const FOLDER_ASET = "app/jejak-setara/assets/";
const ada = (berkas: string) => existsSync(new URL(FOLDER_ASET + berkas, AKAR));

/** Berkas di bawah assets/ dari URL impor PNG (di lingkungan uji, URL memuat jalur berkasnya), atau undefined. */
function berkasDari(url: string): string | undefined {
  const i = url.indexOf(FOLDER_ASET);
  return i === -1 ? undefined : url.slice(i + FOLDER_ASET.length).split(/[?#]/)[0];
}

/** Lebar dan tinggi PNG dari kepala berkasnya (tanda tangan PNG dan potongan IHDR). */
function ukuranPng(berkas: string): [number, number] {
  const b = readFileSync(new URL(FOLDER_ASET + berkas, AKAR));
  if (b.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" || b.subarray(12, 16).toString("latin1") !== "IHDR") {
    throw new Error(`${berkas} bukan PNG`);
  }
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

/** Benar bila A dan B sama persis. Diperiksa tsc, karena tipe tidak ada lagi saat uji berjalan. */
type Sama<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const KUNCI_TAS_SAMA_DENGAN_WARNA_TAS: Sama<keyof typeof WARNA_TAS, WarnaTas> = true;

const ARAH = ["bawah", "atas", "kanan"] as const;
const POSE = ["diam", "jalan"] as const;

/** Semua Gambar di manifest beserta labelnya; lembar ubin berupa URL saja, jadi dicatat terpisah. */
const BUTIR: { label: string; gambar: Gambar }[] = [
  ...AVATAR.flatMap((a, i) => [
    ...ARAH.flatMap((arah) => POSE.map((pose) => ({ label: `AVATAR[${i}].${arah}.${pose}`, gambar: a[arah][pose] }))),
    { label: `AVATAR[${i}].ikon`, gambar: a.ikon },
  ]),
  ...Object.entries(OBJEK).flatMap(([jenis, o]) => [
    { label: `OBJEK.${jenis}.bawah`, gambar: o.bawah },
    ...(o.atas === null ? [] : [{ label: `OBJEK.${jenis}.atas`, gambar: o.atas }]),
  ]),
  ...Object.entries(NPC).map(([kunci, gambar]) => ({ label: `NPC.${kunci}`, gambar })),
  ...Object.entries(IKON).map(([kunci, gambar]) => ({ label: `IKON.${kunci}`, gambar })),
  ...Object.entries(TANDA).map(([kunci, gambar]) => ({ label: `TANDA.${kunci}`, gambar })),
];
const LEMBAR_UBIN = (["pagi", "siang", "sore"] as const).map((masa) => ({ label: `UBIN.${masa}`, url: UBIN[masa] }));
const SEMUA_URL = [...BUTIR.map((b) => ({ label: b.label, url: b.gambar.url })), ...LEMBAR_UBIN];

describe("berkas manifest.ts", () => {
  const sumber = bacaTeks(FOLDER_ASET + "manifest.ts").replace(/\r\n/g, "\n");

  it("baris pertama menandai berkas buatan build_jejak.py", () => {
    expect(sumber.split("\n")[0]).toBe("// Dibuat build_jejak.py. Jangan disunting manual.");
  });

  it("hanya mengimpor PNG dari folder aset, masing-masing sekali, tanpa impor dari inti/", () => {
    const impor = sumber.split("\n").filter((b) => /^\s*import\b/.test(b) || /\bfrom\s*["']/.test(b));
    const pola = /^import [A-Za-z][A-Za-z0-9]* from "\.\/(ava|ikon|npc|obj|ubin)\/[a-z0-9_]+\.png";$/;
    expect(impor.filter((b) => !pola.test(b))).toEqual([]);
    expect(/\bimport\s*\(|\brequire\s*\(/.test(sumber)).toBe(false);
    const jalur = impor.map((b) => b.slice(b.indexOf('"./') + 3, -2)).sort();
    expect(new Set(jalur).size).toBe(jalur.length);
    expect(jalur).toEqual(SEMUA_URL.map((u) => berkasDari(u.url) ?? u.label).sort());
  });
});

describe("setiap butir manifest", () => {
  it("menunjuk PNG yang ada di folder aset", () => {
    const hilang = SEMUA_URL.filter(({ url }) => {
      const berkas = berkasDari(url);
      return berkas === undefined || !berkas.endsWith(".png") || !ada(berkas);
    });
    expect(hilang.map((u) => `${u.label}: ${u.url}`)).toEqual([]);
  });

  it("lebar × bingkai dan tinggi sama dengan ukuran PNG", () => {
    const salah: string[] = [];
    for (const { label, gambar: g } of BUTIR) {
      const [w, h] = ukuranPng(berkasDari(g.url) ?? "");
      if (!Number.isInteger(g.bingkai) || g.bingkai < 1 || g.lebar * g.bingkai !== w || g.tinggi !== h) {
        salah.push(`${label}: ${g.lebar} × ${g.bingkai} bingkai, tinggi ${g.tinggi}; PNG ${w} × ${h}`);
      }
    }
    expect(salah).toEqual([]);
  });
});

describe("UBIN", () => {
  it("tiga lembar masa dengan kolom dan jumlah ubin yang sama dengan kampung_gambar.json", () => {
    const gambarPeta = JSON.parse(bacaTeks("app/jejak-setara/peta/kampung_gambar.json")) as {
      kolom: number;
      jumlahUbin: number;
    };
    expect(Object.keys(UBIN).sort()).toEqual(["jumlah", "kolom", "pagi", "siang", "sore", "ukuran"]);
    expect([UBIN.ukuran, UBIN.kolom, UBIN.jumlah]).toEqual([16, gambarPeta.kolom, gambarPeta.jumlahUbin]);
    for (const { label, url } of LEMBAR_UBIN) {
      const masa = label.slice("UBIN.".length);
      expect(berkasDari(url)).toBe(`ubin/ubin_${masa}.png`);
      const [w, h] = ukuranPng(`ubin/ubin_${masa}.png`);
      expect(w).toBe(UBIN.kolom * UBIN.ukuran);
      expect(UBIN.kolom * Math.floor(h / UBIN.ukuran)).toBeGreaterThanOrEqual(UBIN.jumlah);
    }
  });
});

describe("AVATAR dan TOKOH", () => {
  it("TOKOH: bingkai 16 × 24 dengan titik kaki (8, 21)", () => {
    expect(TOKOH).toEqual({ lebar: 16, tinggi: 24, kakiX: 8, kakiY: 21 });
  });

  it("AVATAR berisi delapan butir berurutan A1–A8: tiga arah, diam 2 dan jalan 4 bingkai, dan ikon kepala", () => {
    expect(AVATAR).toHaveLength(8);
    AVATAR.forEach((a, i) => {
      expect(Object.keys(a).sort()).toEqual(["atas", "bawah", "ikon", "kanan"]);
      for (const arah of ARAH) {
        for (const pose of POSE) {
          const g = a[arah][pose];
          expect(berkasDari(g.url)).toBe(`ava/ava_${i + 1}_${arah}_${pose}.png`);
          expect([g.lebar, g.tinggi, g.bingkai]).toEqual([TOKOH.lebar, TOKOH.tinggi, pose === "diam" ? 2 : 4]);
        }
      }
      expect(berkasDari(a.ikon.url)).toBe(`ikon/ikon_ava_${i + 1}.png`);
      expect([a.ikon.lebar, a.ikon.tinggi, a.ikon.bingkai]).toEqual([16, 16, 1]);
    });
  });
});

describe("OBJEK", () => {
  const peta = JSON.parse(bacaTeks("app/jejak-setara/peta/kampung.json")) as PetaJejak<string>;

  it("memuat setiap jenis yang dipakai kampung.json, ditambah gerbang_tutup", () => {
    const jenis = [...new Set([...peta.objek.map((o) => o.jenis), "gerbang_tutup"])].sort();
    expect(jenis.length).toBeGreaterThan(1);
    expect(jenis.filter((j) => !Object.hasOwn(OBJEK, j))).toEqual([]);
  });

  it("bagian bawah menunjuk obj_{jenis}.png, dan bagian atas obj_{jenis}_atas.png atau null bila tidak ada", () => {
    const salah: string[] = [];
    for (const [jenis, o] of Object.entries(OBJEK)) {
      const atas = `obj/obj_${jenis}_atas.png`;
      if (berkasDari(o.bawah.url) !== `obj/obj_${jenis}.png`) salah.push(`${jenis}.bawah`);
      if ((o.atas === null ? null : berkasDari(o.atas.url)) !== (ada(atas) ? atas : null)) salah.push(`${jenis}.atas`);
      if (o.bawah.bingkai !== 1 || (o.atas !== null && o.atas.bingkai !== 1)) salah.push(`${jenis}: bingkai`);
    }
    expect(salah).toEqual([]);
  });

  it("lebar dan tinggi adalah jejak kaki dalam ubin menurut aturan JS-06", () => {
    const salah: string[] = [];
    for (const [jenis, o] of Object.entries(OBJEK)) {
      const [w, hBawah] = ukuranPng(`obj/obj_${jenis}.png`);
      const atas = `obj/obj_${jenis}_atas.png`;
      const [wAtas, hAtas] = ada(atas) ? ukuranPng(atas) : [w, 0];
      const lebar = (w - 2) / 16;
      const tinggi = (hBawah + hAtas - 2) / 16;
      if (!Number.isInteger(lebar) || !Number.isInteger(tinggi) || wAtas !== w || o.lebar !== lebar || o.tinggi !== tinggi) {
        salah.push(`${jenis}: ${o.lebar} × ${o.tinggi} ubin, dari PNG ${lebar} × ${tinggi}`);
      }
    }
    expect(salah).toEqual([]);
  });
});

describe("NPC", () => {
  it("kunci sama dengan nama berkas, strip 2 bingkai, dan titik kaki sesuai ukuran tokoh (Daftar_Aset.md N1 dan N2)", () => {
    // Siswa dan lansia 16 × 24: (8, 21); dewasa 16 × 26: (8, 23); anak 14 × 20: (7, 17); Dimas di motor 34 × 30: (17, 28).
    const KAKI = new Map([
      ["16,24", "8,21"],
      ["16,26", "8,23"],
      ["14,20", "7,17"],
      ["34,30", "17,28"],
    ]);
    const salah = Object.entries(NPC).filter(
      ([kunci, g]) =>
        berkasDari(g.url) !== `npc/${kunci}.png` ||
        g.bingkai !== 2 ||
        KAKI.get(`${g.lebar},${g.tinggi}`) !== `${g.kakiX},${g.kakiY}`,
    );
    expect(Object.keys(NPC).length).toBeGreaterThan(0);
    expect(salah.map(([kunci]) => kunci)).toEqual([]);
  });
});

describe("IKON dan TANDA", () => {
  it("kunci sama dengan nama berkas di folder ikon/; ikon kepala avatar hanya ada di AVATAR", () => {
    const ikonSalah = Object.entries(IKON).filter(
      ([kunci, g]) => !kunci.startsWith("ikon_") || kunci.startsWith("ikon_ava_") || berkasDari(g.url) !== `ikon/${kunci}.png`,
    );
    const tandaSalah = Object.entries(TANDA).filter(
      ([kunci, g]) => !kunci.startsWith("tanda_") || berkasDari(g.url) !== `ikon/${kunci}.png`,
    );
    expect([...ikonSalah, ...tandaSalah].map(([kunci]) => kunci)).toEqual([]);
  });

  it("memuat aset yang dipakai JS-07 dengan jumlah bingkai sesuai Daftar_Aset.md", () => {
    const zona = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `ikon_zona_${n}`);
    const perlu = ["ikon_mini_halte", "ikon_matahari", "ikon_menyambung", "ikon_putar_hp", "ikon_layar_penuh", ...zona];
    expect(perlu.filter((k) => !Object.hasOwn(IKON, k))).toEqual([]);
    expect(IKON.ikon_menyambung).toMatchObject({ lebar: 16, tinggi: 16, bingkai: 2 });
    expect(TANDA.tanda_diri).toMatchObject({ lebar: 7, tinggi: 7, bingkai: 4 });
    expect(TANDA.tanda_kompas).toMatchObject({ lebar: 7, tinggi: 7, bingkai: 16 });
    for (const isi of ["sepatu", "kompas", "buku", "teropong", "karcis"]) {
      expect(TANDA[`tanda_kotak_${isi}`]).toMatchObject({ lebar: 14, tinggi: 12, bingkai: 3 });
    }
  });
});

describe("warna tas", () => {
  it("kunci WARNA_TAS sama dengan tipe WarnaTas di inti/tipe.ts, dengan urutan yang sama", () => {
    const deklarasi = /export type WarnaTas\s*=\s*([^;]+);/.exec(bacaTeks("app/jejak-setara/inti/tipe.ts"))?.[1] ?? "";
    const warnaTas = [...deklarasi.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(warnaTas).toHaveLength(8);
    expect(Object.keys(WARNA_TAS)).toEqual(warnaTas);
    expect(KUNCI_TAS_SAMA_DENGAN_WARNA_TAS).toBe(true);
  });

  it("nilai WARNA_TAS dan KUNCI_TAS sama dengan tabel Design System 8 dan palette.json", () => {
    const paletJson = JSON.parse(bacaTeks("scripts/game/art/palette.json")) as Record<string, unknown>;
    const palet = new Map(
      Object.entries(paletJson)
        .filter(([kelompok]) => !kelompok.startsWith("_"))
        .flatMap(([, isi]) => Object.entries(isi as Record<string, string>)),
    );
    // Sel tabel berisi token `sun`, atau token dengan nilainya, misalnya `malam` (`#4A4F9C`).
    const warna = (sel: string) =>
      (/#[0-9A-Fa-f]{6}/.exec(sel)?.[0] ?? palet.get((/`([^`]+)`/.exec(sel)?.[1] ?? "").toUpperCase().replace(/-/g, "")) ?? sel).toUpperCase();
    const baris = bacaTeks("docs/jejak-setara/Design_System.md").split("\n");
    const awal = baris.findIndex((b) => /^\s*\| Warna tas \| Dasar \| Bayangan \|\s*$/.test(b));
    expect(awal).toBeGreaterThan(-1);
    const tabel: Record<string, [string, string]> = {};
    for (const b of baris.slice(awal + 2)) {
      if (!b.trim().startsWith("|")) break;
      const [nama, dasar, bayangan] = b.trim().split("|").slice(1, -1).map((s) => s.trim());
      tabel[nama] = [warna(dasar), warna(bayangan)];
    }
    expect(Object.keys(tabel)).toHaveLength(8);
    expect(WARNA_TAS).toEqual(tabel);
    expect(KUNCI_TAS).toEqual({ dasar: palet.get("SUN"), bayangan: palet.get("MANGO") });
    expect([KUNCI_TAS.dasar, KUNCI_TAS.bayangan]).toEqual(WARNA_TAS.sun);
  });
});

describe("hanya aset Disetujui", () => {
  it("berkas yang dirujuk manifest sama dengan aset Disetujui di CREDITS.md, masing-masing tepat sekali", () => {
    const disetujui = bacaTeks(FOLDER_ASET + "CREDITS.md")
      .split("\n")
      .flatMap((b) => {
        const m = /^\| `([a-z]+\/[a-z0-9_]+\.png)` \|/.exec(b);
        return m && /disetujui/i.test(b) ? [m[1]] : [];
      });
    const dirujuk = SEMUA_URL.map((u) => berkasDari(u.url) ?? u.label);
    expect(disetujui.length).toBeGreaterThan(0);
    expect(new Set(dirujuk).size).toBe(dirujuk.length);
    expect(dirujuk.filter((b) => !disetujui.includes(b))).toEqual([]);
    expect(disetujui.filter((b) => !dirujuk.includes(b))).toEqual([]);
  });
});
