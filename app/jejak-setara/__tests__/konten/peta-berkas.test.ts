// Uji berkas peta kampung (spesifikasi JS-06: P-15 sampai P-23; AC-2, AC-3, AC-10, AC-11).
// Memeriksa ulang hasil build_peta.py tanpa Python: bentuk kampung.json lewat bacaPeta resmi, isi
// kampung_gambar.json, objek dan sprite yang sudah disetujui, sidik sumber, dan anggaran ukuran.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { bacaPeta, uraiRle } from "../../inti/peta";
import type { PetaJejak } from "../../inti/tipe";

const AKAR = new URL("../../../../", import.meta.url);
const bacaBerkas = (jalur: string) => readFileSync(new URL(jalur, AKAR));
const bacaTeks = (jalur: string) => bacaBerkas(jalur).toString("utf8");
const ada = (jalur: string) => existsSync(new URL(jalur, AKAR));

interface GambarPeta {
  versi: number;
  lebar: number;
  tinggi: number;
  kolom: number;
  jumlahUbin: number;
  sumber: string;
  daftar: (number | null)[];
  tanah: string;
  tumpang: string;
  bayangan: string;
}

const JALUR_PETA = "app/jejak-setara/peta/kampung.json";
const JALUR_GAMBAR = "app/jejak-setara/peta/kampung_gambar.json";
const petaJson = JSON.parse(bacaTeks(JALUR_PETA)) as PetaJejak<string>;
const gambar = JSON.parse(bacaTeks(JALUR_GAMBAR)) as GambarPeta;
const peta = bacaPeta(petaJson);
const W = peta.lebar;
const H = peta.tinggi;

const NAMA_ZONA: [string, string][] = [
  ["z1", "Rumah dan gang"],
  ["z2", "Sekolah"],
  ["z3", "Jalan dan halte"],
  ["z4", "Pasar"],
  ["z5", "Balai warga"],
  ["z6", "Taman, sungai, dan pantai"],
  ["z7", "Puskesmas dan kantor desa"],
  ["z8", "Pojok gawai"],
];
// P-10: benda kecil properti kejadian digambar bersama tokoh kejadian (JS-08), tidak ditaruh di peta.
const BENDA_KEJADIAN = ["kotak_bekal", "dompet", "bola", "tali_lompat", "sisa_piknik", "pengeras_suara", "kursi_roda"];
// P-23: urutan berkas sidik sumber.
const SIDIK = [
  "scripts/jejak-setara/peta/kampung.txt",
  "scripts/jejak-setara/peta/objek.json",
  "scripts/jejak-setara/peta/build_peta.py",
  "scripts/game/art/atas_ubin.py",
  "scripts/game/art/atas_objek.py",
];

const rentang = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
// P-21: nomor ubin per lapisan menurut susunan lembar kelompok U (Daftar_Aset.md, "Susunan lembar").
const UBIN_TANAH = new Set([...rentang(0, 3), ...rentang(40, 46), ...rentang(48, 376)]);
const UBIN_TUMPANG = new Set([...rentang(4, 11), ...rentang(22, 39)]);
const UBIN_BAYANGAN = new Set(rentang(12, 21));

/** Lebar dan tinggi PNG dari kepala berkasnya (IHDR). */
function ukuranPng(jalur: string): [number, number] {
  const b = bacaBerkas(jalur);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

/** Jejak kaki objek dalam ubin, dari sprite yang sudah disetujui (16 × ubin + 2 piksel margin). */
function jejakKaki(jenis: string): [number, number] {
  const [w, hBawah] = ukuranPng(`app/jejak-setara/assets/obj/obj_${jenis}.png`);
  const atas = `app/jejak-setara/assets/obj/obj_${jenis}_atas.png`;
  const hAtas = ada(atas) ? ukuranPng(atas)[1] : 0;
  return [(w - 2) / 16, (hBawah + hAtas - 2) / 16];
}

describe("kampung.json (P-15 sampai P-18)", () => {
  it("lolos bacaPeta resmi dengan ukuran 160 × 100 ubin", () => {
    expect([peta.versi, peta.lebar, peta.tinggi, peta.ukuranUbin]).toEqual([1, 160, 100, 16]);
    expect(peta.tabrakan).toHaveLength(W * H);
  });

  it("delapan zona bernama PRD bagian 9 menutup seluruh peta tanpa tumpang tindih", () => {
    expect(peta.zona.map((z) => [z.id, z.nama])).toEqual(NAMA_ZONA);
    const hitung = new Uint8Array(W * H);
    for (const z of peta.zona) {
      for (let y = z.atas; y <= z.bawah; y++) for (let x = z.kiri; x <= z.kanan; x++) hitung[y * W + x]++;
    }
    expect(hitung.every((n) => n === 1)).toBe(true);
  });

  it("lapisan ubin hanya berisi kode bahan 0 sampai 7", () => {
    expect(peta.ubin.every((v) => v <= 7)).toBe(true);
  });

  it("gerbang lobi tercatat terbuka di baris bawah objek gerbang-lobi", () => {
    const gerbang = peta.objek.find((o) => o.id === "gerbang-lobi");
    expect(gerbang?.jenis).toBe("gerbang_buka");
    const g = peta.gerbangLobi;
    const [gw, gh] = jejakKaki("gerbang_buka");
    for (let y = g.atas; y <= g.bawah; y++) {
      for (let x = g.kiri; x <= g.kanan; x++) {
        expect(peta.tabrakan[y * W + x]).toBe(0);
        expect(y).toBe((gerbang?.y ?? -9) + gh - 1);
        expect(x >= (gerbang?.x ?? -9) && x < (gerbang?.x ?? -9) + gw).toBe(true);
      }
    }
  });

  it("objek urut menurut y lalu x", () => {
    const urut = [...peta.objek].sort((a, b) => a.y - b.y || a.x - b.x || (a.id < b.id ? -1 : 1));
    expect(peta.objek.map((o) => o.id)).toEqual(urut.map((o) => o.id));
  });
});

describe("objek dan aset (AC-10)", () => {
  const kredit = bacaTeks("app/jejak-setara/assets/CREDITS.md");
  const jenis = [...new Set(peta.objek.map((o) => o.jenis))];

  it("setiap jenis objek punya sprite yang tercatat Disetujui di CREDITS.md", () => {
    const tanpaSprite = jenis.filter(
      (j) => !ada(`app/jejak-setara/assets/obj/obj_${j}.png`) || !kredit.includes(`\`obj/obj_${j}.png\``),
    );
    expect(tanpaSprite).toEqual([]);
  });

  it("tidak ada benda kecil properti kejadian di peta (P-10)", () => {
    expect(jenis.filter((j) => BENDA_KEJADIAN.includes(j))).toEqual([]);
  });

  it("jejak kaki objek berada di dalam peta dan tidak tumpang tindih (P-8)", () => {
    const pemilik = new Int32Array(W * H).fill(-1);
    const masalah: string[] = [];
    peta.objek.forEach((o, i) => {
      const [w, h] = jejakKaki(o.jenis);
      if (o.x + w > W || o.y + h > H) masalah.push(`${o.id} keluar dari peta`);
      for (let y = o.y; y < Math.min(o.y + h, H); y++) {
        for (let x = o.x; x < Math.min(o.x + w, W); x++) {
          if (pemilik[y * W + x] >= 0) masalah.push(`${o.id} menimpa ${peta.objek[pemilik[y * W + x]].id} di (${x}, ${y})`);
          pemilik[y * W + x] = i;
        }
      }
    });
    expect(masalah).toEqual([]);
  });
});

describe("kampung_gambar.json (P-20 sampai P-23)", () => {
  it("kuncinya tepat dan ukurannya sama dengan kampung.json", () => {
    expect(Object.keys(gambar).sort()).toEqual(
      ["bayangan", "daftar", "jumlahUbin", "kolom", "lebar", "sumber", "tanah", "tinggi", "tumpang", "versi"].sort(),
    );
    expect([gambar.versi, gambar.lebar, gambar.tinggi, gambar.kolom, gambar.jumlahUbin]).toEqual([1, W, H, 16, 377]);
    for (const masa of ["pagi", "siang", "sore"]) {
      const [lw, lh] = ukuranPng(`app/jejak-setara/assets/ubin/ubin_${masa}.png`);
      expect(lw / 16).toBe(gambar.kolom);
      expect((lw / 16) * (lh / 16)).toBeGreaterThanOrEqual(gambar.jumlahUbin);
    }
  });

  it("daftar diawali null, lalu nomor ubin unik yang urut naik, paling banyak 256", () => {
    const [kosong, ...nomor] = gambar.daftar;
    expect(kosong).toBeNull();
    expect(gambar.daftar.length).toBeLessThanOrEqual(256);
    expect(nomor.every((n, i) => Number.isInteger(n) && n !== null && n >= 0 && n < gambar.jumlahUbin && (i === 0 || n > (nomor[i - 1] ?? -1)))).toBe(true);
  });

  it("ketiga lapisan terurai uraiRle dengan nomor di rentang lapisannya", () => {
    const nomor = (v: number) => gambar.daftar[v] ?? null;
    const tanah = uraiRle(gambar.tanah, W * H);
    const tumpang = uraiRle(gambar.tumpang, W * H);
    const bayangan = uraiRle(gambar.bayangan, W * H);
    expect(tanah.every((v) => v > 0 && UBIN_TANAH.has(nomor(v) ?? -1))).toBe(true);
    expect(tumpang.every((v) => v === 0 || UBIN_TUMPANG.has(nomor(v) ?? -1))).toBe(true);
    expect(bayangan.every((v) => v === 0 || UBIN_BAYANGAN.has(nomor(v) ?? -1))).toBe(true);
  });

  it("sidik sumber cocok dengan kelima berkas sumber (bila gagal, jalankan peta:build)", () => {
    const h = createHash("sha256");
    for (const jalur of SIDIK) {
      h.update(`${jalur}\n`, "utf8");
      h.update(Buffer.from(bacaBerkas(jalur).toString("latin1").replace(/\r\n/g, "\n"), "latin1"));
      h.update("\n", "utf8");
    }
    expect(gambar.sumber).toBe(h.digest("hex"));
  });
});

describe("ukuran (AC-11, Architecture 11.3)", () => {
  it("jumlah gzip kedua berkas paling banyak 60 KB", () => {
    const ukuran = [JALUR_PETA, JALUR_GAMBAR].map((j) => gzipSync(bacaBerkas(j), { level: 9 }).length);
    expect(ukuran[0] + ukuran[1]).toBeLessThanOrEqual(60 * 1024);
  });
});
