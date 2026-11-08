// Uji aturan peta kampung (spesifikasi JS-06: P-3 dan P-25 galat 3 sampai 10; AC-5 sampai AC-9).
// Aturan dihitung ulang dari kampung.json; jejak kaki objek dari ukuran sprite yang sudah disetujui,
// sedangkan kotak halaman lobi dan daftar penanda dibaca dari objek.json.
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bacaPeta } from "../../inti/peta";
import type { PetaJejak } from "../../inti/tipe";

const AKAR = new URL("../../../../", import.meta.url);
const bacaBerkas = (jalur: string) => readFileSync(new URL(jalur, AKAR));
const bacaTeks = (jalur: string) => bacaBerkas(jalur).toString("utf8");

interface Batas {
  kiri: number;
  atas: number;
  kanan: number;
  bawah: number;
}

const peta = bacaPeta(JSON.parse(bacaTeks("app/jejak-setara/peta/kampung.json")) as PetaJejak<string>);
const sumber = JSON.parse(bacaTeks("scripts/jejak-setara/peta/objek.json")) as { lobi: Batas; penanda: Record<string, string[]> };
const W = peta.lebar;
const H = peta.tinggi;
const BAHAN = { rumput: 0, tanah: 1, pasir: 4, aspal: 5, air: 6, airDalam: 7 } as const;
const KOTAK_ZONA: Record<string, string> = {
  z1: "kompas", z2: "buku", z3: "sepatu", z4: "sepatu", z5: "kompas", z6: "sepatu", z7: "buku", z8: "buku",
};

const bebas = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && peta.tabrakan[y * W + x] === 0;
const dalam = (x: number, y: number, b: Batas) => b.kiri <= x && x <= b.kanan && b.atas <= y && y <= b.bawah;
const zonaDi = (x: number, y: number) => peta.zona.find((z) => dalam(x, y, z))?.id;
const jarak = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

function ukuranPng(jalur: string): [number, number] {
  const b = bacaBerkas(jalur);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

function jejakKaki(jenis: string): [number, number] {
  const [w, hBawah] = ukuranPng(`app/jejak-setara/assets/obj/obj_${jenis}.png`);
  const atas = `app/jejak-setara/assets/obj/obj_${jenis}_atas.png`;
  const hAtas = existsSync(new URL(atas, AKAR)) ? ukuranPng(atas)[1] : 0;
  return [(w - 2) / 16, (hBawah + hAtas - 2) / 16];
}

/** Nomor objek yang jejak kakinya menutup setiap sel, atau -1. */
const jejak = new Int32Array(W * H).fill(-1);
peta.objek.forEach((o, i) => {
  const [w, h] = jejakKaki(o.jenis);
  for (let y = o.y; y < Math.min(o.y + h, H); y++) for (let x = o.x; x < Math.min(o.x + w, W); x++) jejak[y * W + x] = i;
});

/** Sel yang terjangkau lewat sel bebas (4 tetangga) dari titik awal; sel di `tutup` dianggap padat. */
function jangkau(mulai: { x: number; y: number }[], tutup = new Set<number>()): Uint8Array {
  const R = new Uint8Array(W * H);
  const antre: number[] = [];
  for (const { x, y } of mulai) {
    const i = y * W + x;
    if (bebas(x, y) && !tutup.has(i) && !R[i]) {
      R[i] = 1;
      antre.push(i);
    }
  }
  for (let k = 0; k < antre.length; k++) {
    const x = antre[k] % W;
    const y = (antre[k] - x) / W;
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      const j = ny * W + nx;
      if (bebas(nx, ny) && !R[j] && !tutup.has(j)) {
        R[j] = 1;
        antre.push(j);
      }
    }
  }
  return R;
}

const R = jangkau(peta.titikMuncul);
const semuaTitik = [...peta.titikKejadian, ...peta.kotak, ...peta.halte];
const g = peta.gerbangLobi;
const selGerbang = new Set<number>();
for (let y = g.atas; y <= g.bawah; y++) for (let x = g.kiri; x <= g.kanan; x++) selGerbang.add(y * W + x);
const tengahGerbang = { x: (g.kiri + g.kanan) / 2, y: (g.atas + g.bawah) / 2 };

describe("keterjangkauan dan lobi (AC-5)", () => {
  it("semua sel di tepi peta padat (Design System 7, aturan 2)", () => {
    const longgar: string[] = [];
    for (let x = 0; x < W; x++) for (const y of [0, H - 1]) if (bebas(x, y)) longgar.push(`(${x}, ${y})`);
    for (let y = 0; y < H; y++) for (const x of [0, W - 1]) if (bebas(x, y)) longgar.push(`(${x}, ${y})`);
    expect(longgar).toEqual([]);
  });

  it("semua titik kejadian, kotak, dan halte terjangkau dari titik muncul", () => {
    expect(semuaTitik.filter((t) => !R[t.y * W + t.x]).map((t) => t.id)).toEqual([]);
  });

  it("dengan gerbang ditutup, pemain hanya bergerak di halaman lobi", () => {
    const RL = jangkau(peta.titikMuncul, selGerbang);
    const keluar: string[] = [];
    for (let i = 0; i < W * H; i++) if (RL[i] && !dalam(i % W, Math.floor(i / W), sumber.lobi)) keluar.push(`(${i % W}, ${Math.floor(i / W)})`);
    expect(keluar).toEqual([]);
    expect(semuaTitik.filter((t) => RL[t.y * W + t.x]).map((t) => t.id)).toEqual([]);
  });

  it("18 titik muncul tanpa ganda di sel bebas halaman lobi; sel gerbang bebas", () => {
    const kunci = peta.titikMuncul.map((t) => `${t.x},${t.y}`);
    expect(new Set(kunci).size).toBe(18);
    expect(peta.titikMuncul.every((t) => bebas(t.x, t.y) && dalam(t.x, t.y, sumber.lobi))).toBe(true);
    expect([...selGerbang].every((i) => peta.tabrakan[i] === 0)).toBe(true);
  });
});

describe("titik kejadian (AC-6)", () => {
  it("sedikitnya 12 titik di setiap zona", () => {
    const hitung = Object.fromEntries(peta.zona.map((z) => [z.id, peta.titikKejadian.filter((t) => t.zona === z.id).length]));
    expect(Object.values(hitung).every((n) => n >= 12)).toBe(true);
  });

  it("setiap titik di zonanya, di luar lobi, jauh dari gerbang, dengan ruang 3 × 3 kosong", () => {
    const masalah: string[] = [];
    for (const t of peta.titikKejadian) {
      if (!new RegExp(`^t-${t.zona}-\\d{2}$`).test(t.id)) masalah.push(`${t.id}: id`);
      if (zonaDi(t.x, t.y) !== t.zona) masalah.push(`${t.id}: di luar zonanya`);
      if (dalam(t.x, t.y, sumber.lobi)) masalah.push(`${t.id}: di halaman lobi`);
      if (jarak(t, tengahGerbang) < 7) masalah.push(`${t.id}: kurang dari 7 ubin dari gerbang`);
      for (let b = -1; b <= 1; b++) {
        for (let a = -1; a <= 1; a++) {
          const x = t.x + a;
          const y = t.y + b;
          const bahan = peta.ubin[y * W + x];
          if (!bebas(x, y) || jejak[y * W + x] >= 0 || bahan >= BAHAN.aspal) masalah.push(`${t.id}: ruang 3 x 3 terhalang di (${x}, ${y})`);
        }
      }
    }
    expect(masalah).toEqual([]);
  });

  it("jarak antartitik sedikitnya 6 ubin", () => {
    const dekat: string[] = [];
    peta.titikKejadian.forEach((a, i) => {
      for (const b of peta.titikKejadian.slice(i + 1)) if (jarak(a, b) < 6) dekat.push(`${a.id}-${b.id}`);
    });
    expect(dekat).toEqual([]);
  });
});

describe("kotak dan halte (AC-7)", () => {
  it("tiga kotak per zona dengan isi menurut PRD 8.5 dan letak yang sah", () => {
    const masalah: string[] = [];
    for (const z of peta.zona) if (peta.kotak.filter((k) => k.zona === z.id).length !== 3) masalah.push(`${z.id}: jumlah kotak`);
    peta.kotak.forEach((k, i) => {
      if (k.jenis !== KOTAK_ZONA[k.zona]) masalah.push(`${k.id}: isi ${k.jenis}`);
      if (zonaDi(k.x, k.y) !== k.zona || dalam(k.x, k.y, sumber.lobi)) masalah.push(`${k.id}: letak`);
      if (!bebas(k.x, k.y) || jejak[k.y * W + k.x] >= 0 || peta.ubin[k.y * W + k.x] >= BAHAN.aspal) masalah.push(`${k.id}: sel`);
      if (peta.titikKejadian.some((t) => jarak(t, k) < 3)) masalah.push(`${k.id}: terlalu dekat titik kejadian`);
      if (peta.kotak.slice(i + 1).some((l) => jarak(k, l) < 6)) masalah.push(`${k.id}: terlalu dekat kotak lain`);
    });
    expect(masalah).toEqual([]);
  });

  it("empat halte (dua di Z3, satu di Z7, satu di Z8) paling jauh 2 ubin dari bangunan halte", () => {
    const zona = peta.halte.map((h) => h.zona).sort();
    expect(zona).toEqual(["z3", "z3", "z7", "z8"]);
    const [hw, hh] = jejakKaki("halte");
    const bangunan = peta.objek.filter((o) => o.jenis === "halte");
    const jauh = peta.halte.filter((h) => {
      const terdekat = Math.min(
        ...bangunan.map((o) => Math.max(Math.max(o.x - h.x, 0, h.x - (o.x + hw - 1)), Math.max(o.y - h.y, 0, h.y - (o.y + hh - 1)))),
      );
      return !/^halte-\d+$/.test(h.id) || zonaDi(h.x, h.y) !== h.zona || !bebas(h.x, h.y) || terdekat > 2;
    });
    expect(jauh.map((h) => h.id)).toEqual([]);
  });
});

describe("lebar jalan, penanda, dan bahan (AC-8, AC-9, AC-1)", () => {
  it("setiap sel terjangkau termasuk sedikitnya satu blok 2 × 2 sel bebas", () => {
    const blok = (x: number, y: number) => bebas(x, y) && bebas(x + 1, y) && bebas(x, y + 1) && bebas(x + 1, y + 1);
    const sempit: string[] = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (R[y * W + x] && !(blok(x, y) || blok(x - 1, y) || blok(x, y - 1) || blok(x - 1, y - 1))) sempit.push(`(${x}, ${y})`);
      }
    }
    expect(sempit).toEqual([]);
  });

  it("dari setiap posisi terjangkau, sedikitnya satu objek penanda terlihat di layar 320 × 180", () => {
    const pola = Object.values(sumber.penanda).flat();
    const penanda = (jenis: string) => pola.some((p) => jenis === p || (p.endsWith("*") && jenis.startsWith(p.slice(0, -1))));
    const A = new Int32Array((W + 1) * (H + 1));
    const tanda = new Uint8Array(W * H);
    peta.objek.forEach((o) => {
      if (!penanda(o.jenis)) return;
      const [w, h] = jejakKaki(o.jenis);
      for (let y = o.y; y < o.y + h; y++) for (let x = o.x; x < o.x + w; x++) tanda[y * W + x] = 1;
    });
    for (let y = 0; y < H; y++) {
      let s = 0;
      for (let x = 0; x < W; x++) {
        s += tanda[y * W + x];
        A[(y + 1) * (W + 1) + x + 1] = A[y * (W + 1) + x + 1] + s;
      }
    }
    const buta: string[] = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (!R[y * W + x]) continue;
        const kiri = Math.min(Math.max(x * 16 + 8 - 160, 0), W * 16 - 320);
        const atas = Math.min(Math.max(y * 16 + 8 - 90, 0), H * 16 - 180);
        const [a0, a1, b0, b1] = [Math.floor(kiri / 16), Math.floor((kiri + 319) / 16), Math.floor(atas / 16), Math.floor((atas + 179) / 16)];
        const jumlah = A[(b1 + 1) * (W + 1) + a1 + 1] - A[b0 * (W + 1) + a1 + 1] - A[(b1 + 1) * (W + 1) + a0] + A[b0 * (W + 1) + a0];
        if (jumlah === 0) buta.push(`(${x}, ${y})`);
      }
    }
    expect(buta).toEqual([]);
  });

  it("tanah setapak dan pasir hanya bersebelahan dengan bahan yang sama, rumput, atau air (P-3)", () => {
    const salah: string[] = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const b = peta.ubin[y * W + x];
        if (b !== BAHAN.tanah && b !== BAHAN.pasir) continue;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
            const n = peta.ubin[ny * W + nx];
            if (n !== b && n !== BAHAN.rumput && n !== BAHAN.air && n !== BAHAN.airDalam) salah.push(`(${x}, ${y})`);
          }
        }
      }
    }
    expect(salah).toEqual([]);
  });
});
