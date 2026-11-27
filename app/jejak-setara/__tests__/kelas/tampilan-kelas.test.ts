import { PROTOKOL_VERSI } from "../../inti/versi";
// Perhitungan murni layar kelas dan aturan impor konsol (spesifikasi JS-10, P-15, P-24 sampai P-29, P-35; AC-11,
// AC-15 sampai AC-17, AC-23).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DATA_KOSONG, terapkanPesan } from "../../admin/kelas/sambungan-kelas";
import {
  angkaHitungMundur,
  BATAS_PUTUS_MS,
  formatSisaKelas,
  jedaSambungUlang,
  kemajuanKelas,
  letakTitikKelas,
  persenPilihan,
  potongLobi,
  putusanTutup,
  sisaRonde,
  susunPodium,
  titikMelompat,
  ZONA_KELAS,
} from "../../admin/kelas/tampilan-kelas";
import peta from "../../peta/kampung.json";

describe("sambung ulang (P-15)", () => {
  it("jeda 1, 2, 4, 8, lalu 15 detik; batas 10 menit", () => {
    expect([0, 1, 2, 3, 4, 5, 20].map(jedaSambungUlang)).toEqual([1000, 2000, 4000, 8000, 15000, 15000, 15000]);
    expect(BATAS_PUTUS_MS).toBe(600_000);
  });
  it("4000 berhenti karena ruang ditutup, 4001 karena dibuka di tab lain, kode lain disambung ulang", () => {
    expect([4000, 4001, 1006, 1000, 4002].map(putusanTutup)).toEqual(["ditutup", "diganti", "ulang", "ulang", "ulang"]);
  });
});

describe("tampilan", () => {
  it("lobi: paling banyak 40 nama menurut urutan, sisanya dihitung (P-24, D-2)", () => {
    const nama = Array.from({ length: 47 }, (_, i) => i);
    expect(potongLobi(nama)).toEqual({ tampil: nama.slice(0, 40), sisa: 7 });
    expect(potongLobi([1, 2])).toEqual({ tampil: [1, 2], sisa: 0 });
  });
  it("kemajuan kelas: persen dibulatkan ke bawah dan 12 blok (P-26)", () => {
    expect(kemajuanKelas(0, 0)).toEqual({ persen: 0, blok: 0 });
    expect(kemajuanKelas(38, 100)).toEqual({ persen: 38, blok: 4 });
    expect(kemajuanKelas(50, 100)).toEqual({ persen: 50, blok: 6 });
    expect(kemajuanKelas(640, 640)).toEqual({ persen: 100, blok: 12 });
  });
  it("sisa waktu, hitung mundur, dan jeda", () => {
    expect(formatSisaKelas(492_000)).toBe("08:12");
    expect(formatSisaKelas(-5)).toBe("00:00");
    expect(formatSisaKelas(1)).toBe("00:01");
    expect([2999, 2000, 1500, 1, -100].map((d) => angkaHitungMundur(10_000, 10_000 - d))).toEqual([3, 2, 2, 1, 1]);
    expect(sisaRonde(100_000, null, 40_000)).toBe(60_000);
    expect(sisaRonde(100_000, 70_000, 90_000)).toBe(30_000);
    expect(sisaRonde(null, null, 1)).toBe(0);
  });
  it("podium: urutan tampil 2–1–3 dari yang ada, dan daftar 4–10 (P-28)", () => {
    const papan = Array.from({ length: 12 }, (_, i) => ({ id: `p${i + 1}`, peringkat: i + 1 }));
    const { podium, sisa } = susunPodium(papan);
    expect(podium.map((x) => [x.tempat, x.pemain.id])).toEqual([
      [2, "p2"],
      [1, "p1"],
      [3, "p3"],
    ]);
    expect(sisa.map((p) => p.id)).toEqual(["p4", "p5", "p6", "p7", "p8", "p9", "p10"]);
    expect(susunPodium(papan.slice(0, 2)).podium.map((x) => x.tempat)).toEqual([2, 1]);
    expect(susunPodium([]).podium).toEqual([]);
  });
  it("persen pilihan pembahasan dan jumlah menjawab; total 0 menghasilkan 0% (P-29)", () => {
    expect(persenPilihan([13, 3, 2, 3])).toEqual({ persen: [62, 14, 10, 14], menjawab: 21 });
    expect(persenPilihan([0, 0, 0])).toEqual({ persen: [0, 0, 0], menjawab: 0 });
  });
  it("batas zona di konsol sama dengan kampung.json (P-26)", () => {
    expect(ZONA_KELAS).toEqual((peta as { zona: { kiri: number; atas: number; kanan: number; bawah: number }[] }).zona.map((z) => [z.kiri, z.atas, z.kanan, z.bawah]));
  });
});

describe("data layar kelas dari pesan server", () => {
  it("info dan dunia_kelas memperbarui selisih jam; pembahasan disimpan per kejadian", () => {
    const V = PROTOKOL_VERSI;
    let d = terapkanPesan(DATA_KOSONG, { v: V, t: "info_kelas", labelKelas: "IX B", kode: "K7MPA", tautan: "https://a.b", modeNama: "daftar", durasiMenit: 15, batasPemain: 40, uji: true, terkunci: false, waktuServer: 10_500, jumlahKejadian: 0, kejadian: [] }, 10_000);
    expect(d.selisih).toBe(500);
    d = terapkanPesan(d, { v: V, t: "dunia_kelas", w: 20_000, p: [] }, 20_300);
    expect(d.selisih).toBe(-300);
    d = terapkanPesan(d, { v: V, t: "lobi", pemain: [{ id: "p1", nama: "Kancil Jingga", avatar: 1, warnaTas: "sun", terhubung: true }] }, 0);
    expect(d.lobi).toHaveLength(1);
    expect(terapkanPesan(d, { v: V, t: "galat", kode: "RUANG_TIDAK_ADA", pesan: "x" }, 0)).toBe(d);
  });
});

describe("konsol tidak mengimpor modul layar pemain (P-35; AC-23)", () => {
  it("berkas layar kelas dan halaman ruang tidak mengimpor bersama/, permainan/, pemain/, manifest.ts, atau TEKS dari teks.ts", () => {
    const akar = "app/jejak-setara/admin/kelas";
    // JS-11 (P-35; AC-22): halaman riwayat dan bagian hasil ikut aturan yang sama.
    const berkas: string[] = [
      "app/jejak-setara/admin/halaman/Ruang.tsx",
      "app/jejak-setara/admin/halaman/DetailRuang.tsx",
      "app/jejak-setara/admin/halaman/RiwayatRuang.tsx",
      "app/jejak-setara/admin/halaman/HasilRuang.tsx",
    ];
    const jelajah = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory()) jelajah(join(dir, e.name));
        else if (/\.(ts|tsx)$/.test(e.name)) berkas.push(join(dir, e.name));
      }
    };
    jelajah(akar);
    for (const f of berkas) {
      const isi = readFileSync(f, "utf8");
      for (const m of isi.matchAll(/from "([^"]+)"/g)) {
        expect(m[1], f).not.toMatch(/\/(bersama|permainan|pemain)\//);
        expect(m[1], f).not.toMatch(/assets\/manifest/);
      }
      expect(isi, f).not.toMatch(/import \{[^}]*\bTEKS\b[^}]*\} from "\.\.\/(\.\.\/)?teks"/);
    }
  });
});

describe("JS-23: letak titik peta kelas (P-17; AC-9)", () => {
  it("kotak 3 × 3 ubin berpusat 0,75 ubin di atas titik kaki", () => {
    const [gx, gy] = letakTitikKelas(16 * 10 + 8, 16 * 20 + 14);
    expect([gx, gy]).toEqual([9, 18.625]);
    expect(gx + 1.5).toBe((16 * 10 + 8) / 16);
    expect(gy + 1.5).toBe((16 * 20 + 14) / 16 - 0.75);
  });
});

describe("JS-18: titik layar kelas yang melompat (P-25; AC-10)", () => {
  it("lebih dari 136 piksel antara dua kiriman (dtMs 500) berpindah tanpa transisi; gerak biasa dan pemain baru tidak", () => {
    const sebelum = [
      ["a", 888, 1036, true],
      ["b", 400, 400, true],
      ["c", 100, 100, false],
    ] as const;
    const kini = [
      ["a", 1688, 412, true], // pindah halte
      ["b", 400 + 136, 400, true], // tepat di ambang: bukan lompatan
      ["c", 100, 100 + 136.01, false], // sedikit di atas ambang
      ["d", 50, 50, true], // pemain baru di peta
    ] as const;
    expect([...titikMelompat(sebelum, kini)].sort()).toEqual(["a", "c"]);
    expect(titikMelompat(null, kini).size).toBe(0);
    expect(titikMelompat(kini, kini).size).toBe(0);
  });

  it("PetaKelas memberi data-lompat dan kelas.css mematikan transisinya", () => {
    expect(readFileSync("app/jejak-setara/admin/kelas/PetaKelas.tsx", "utf8")).toContain('data-lompat={lompat.has(id) ? "ya" : undefined}');
    expect(readFileSync("app/jejak-setara/styles/kelas.css", "utf8")).toMatch(/\.js-kelas-titik\[data-lompat="ya"\] \{\n  transition: none;\n\}/);
  });
});
