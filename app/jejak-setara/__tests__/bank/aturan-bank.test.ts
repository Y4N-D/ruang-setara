// Aturan murni bank kejadian (spesifikasi JS-12, P-2, P-7, P-8, P-14, P-18; AC-1, AC-5, AC-6, AC-9).
import { describe, expect, it } from "vitest";
import { jumlahTitikRuang, saringMenurutTitik } from "../../../../server/jejak-setara/src/ruang/kejadian-ruang";
import { NAMA_ZONA, TITIK_PER_ZONA } from "../../../../server/jejak-setara/src/ruang/peta-kampung";
import { peringatanZonaPadat } from "../../admin/bank/PenyusunPaket";
import { BATAS } from "../../inti/aturan";
import { aksiBoleh, bolehSunting, gabungSumber, idRujukanBerikutnya, kodeBerikutnya, kolomDariLetak, type KeadaanKejadian, type PelakuBank } from "../../inti/bank";
import { KUNCI_ASET_DISETUJUI } from "../../inti/konten/kunci-aset";
import { KODE_TEMUAN, periksaPaketPeta, zonaPadatRuangBesar } from "../../inti/konten/periksa";
import type { ZonaId } from "../../inti/tipe";
import { TEKS_KONSOL } from "../../teks-konsol";
import { kunciAsetDisetujui } from "../konten/naskah-urai";

const ADMIN: PelakuBank = { id: "a", peran: "admin", peninjau: false };
const GURU: PelakuBank = { id: "g", peran: "guru", peninjau: false };
const k = (lain: Partial<KeadaanKejadian>): KeadaanKejadian => ({ status: "draf", pemilikId: "g", pernahTerbit: false, dipakaiRuang: false, adaPerubahan: false, ...lain });

describe("izin dan aksi (P-2, P-14)", () => {
  it("admin menyunting semua kecuali arsip; guru hanya miliknya berstatus Draf atau Siap tinjau; bank awal hanya admin (D-4)", () => {
    expect(bolehSunting(ADMIN, k({ pemilikId: null, status: "terbit" }))).toBe(true);
    expect(bolehSunting(ADMIN, k({ status: "arsip" }))).toBe(false);
    expect(bolehSunting(GURU, k({}))).toBe(true);
    expect(bolehSunting(GURU, k({ status: "tinjau" }))).toBe(true);
    expect(bolehSunting(GURU, k({ status: "terbit" }))).toBe(false);
    expect(bolehSunting(GURU, k({ pemilikId: null }))).toBe(false);
    expect(bolehSunting(GURU, k({ pemilikId: "lain" }))).toBe(false);
  });

  it("tabel aksi per status untuk admin", () => {
    expect(aksiBoleh(ADMIN, k({}))).toEqual(["ajukan", "terbitkan", "arsipkan", "hapus"]);
    expect(aksiBoleh(ADMIN, k({ status: "tinjau", pemilikId: null }))).toEqual(["kembalikan", "terbitkan", "arsipkan", "hapus"]);
    expect(aksiBoleh(ADMIN, k({ status: "terbit", pernahTerbit: true }))).toEqual(["arsipkan"]);
    expect(aksiBoleh(ADMIN, k({ status: "terbit", pernahTerbit: true, adaPerubahan: true }))).toEqual(["terbitkan", "arsipkan"]);
    expect(aksiBoleh(ADMIN, k({ status: "arsip", pernahTerbit: true }))).toEqual(["pulihkan"]);
    expect(aksiBoleh(ADMIN, k({ status: "tinjau", dipakaiRuang: true }))).toEqual(["kembalikan", "terbitkan", "arsipkan"]);
  });

  it("guru: ajukan dan hapus miliknya saja; tidak pernah terbitkan, arsipkan, kembalikan, atau pulihkan", () => {
    expect(aksiBoleh(GURU, k({}))).toEqual(["ajukan", "hapus"]);
    expect(aksiBoleh(GURU, k({ status: "tinjau" }))).toEqual(["hapus"]);
    expect(aksiBoleh(GURU, k({ pemilikId: null, status: "tinjau" }))).toEqual([]);
    expect(aksiBoleh(GURU, k({ status: "arsip" }))).toEqual([]);
  });
});

describe("bantuan (P-7, P-8, P-18)", () => {
  it("kode dan id berikutnya, sedikitnya dua angka", () => {
    expect(kodeBerikutnya(["K-01", "K-16", "K-09"])).toBe("K-17");
    expect(kodeBerikutnya([])).toBe("K-01");
    expect(kodeBerikutnya(["K-99"])).toBe("K-100");
    expect(idRujukanBerikutnya(["JR-01", "JR-23"])).toBe("JR-24");
  });

  it("letak temuan menjadi kunci kolom, dan sumber satu alamat per baris", () => {
    expect(kolomDariLetak("K-03/langkah1.opsi.2.teks")).toBe("langkah1.opsi.2.teks");
    expect(kolomDariLetak("K-03")).toBe("");
    expect(gabungSumber(" https://a.go.id/1 \n\nhttps://b.go.id/2\r\n")).toBe("https://a.go.id/1 · https://b.go.id/2");
  });

  it("ke-27 kode temuan punya kalimat konsol (Permintaan A-7)", () => {
    expect(KODE_TEMUAN).toHaveLength(27);
    expect(Object.keys(TEKS_KONSOL.temuan).sort()).toEqual([...KODE_TEMUAN].sort());
  });

  it("daftar kunci aset server sama dengan berkas aset dan kredit Disetujui", () => {
    expect([...KUNCI_ASET_DISETUJUI].sort()).toEqual([...kunciAsetDisetujui()].sort());
  });
});

describe("Permintaan A-14: peringatan zona padat di penyusun paket", () => {
  const titik12 = { z1: 12, z2: 12, z3: 12, z4: 12, z5: 12, z6: 12, z7: 12, z8: 12 } as const;
  const ulang = (zona: ZonaId, n: number): ZonaId[] => Array.from({ length: n }, () => zona);
  const jumlahTitik = Object.fromEntries(Object.entries(TITIK_PER_ZONA).map(([z, t]) => [z, t?.length ?? 0])) as Partial<Record<ZonaId, number>>;

  it("zona dengan lebih dari separuh titiknya dilaporkan, berurutan menurut id zona; 6 dari 12 belum", () => {
    expect(zonaPadatRuangBesar([...ulang("z1", 6), ...ulang("z2", 5)], titik12)).toEqual([]);
    expect(zonaPadatRuangBesar(["z3", ...ulang("z1", 7), ...ulang("z3", 7), "z2"], titik12)).toEqual([
      { zona: "z1", jumlah: 7, batas: 6 },
      { zona: "z3", jumlah: 8, batas: 6 },
    ]);
    // Titik ganjil dibulatkan ke bawah; zona tanpa titik tidak menampilkan apa pun.
    expect(zonaPadatRuangBesar(ulang("z4", 7), { z4: 13 })).toEqual([{ zona: "z4", jumlah: 7, batas: 6 }]);
    expect(zonaPadatRuangBesar(["z5"], {})).toEqual([{ zona: "z5", jumlah: 1, batas: 0 }]);
  });

  it("hanya peringatan: tidak mengubah periksaPaketPeta, yang tetap menolak lebih dari 12", () => {
    expect(periksaPaketPeta(ulang("z1", 12), titik12)).toEqual([]);
    expect(periksaPaketPeta(ulang("z1", 13), titik12).map((t) => t.kode)).toEqual(["PAKET_TITIK_KURANG"]);
  });

  it("sama dengan server: di peta kampung, ruang lebih dari 50 pemain menampilkan tepat `batas` kejadian zona padat", () => {
    expect(jumlahTitikRuang(BATAS.ruangBesarLebihDari)).toBe(1);
    expect(jumlahTitikRuang(BATAS.ruangBesarLebihDari + 1)).toBe(2);
    for (const { id } of NAMA_ZONA) {
      const zona = id as ZonaId;
      for (let n = 1; n <= (jumlahTitik[zona] ?? 0); n++) {
        const daftar = ulang(zona, n).map((z) => ({ isi: { zona: z } }));
        const tampilBesar = saringMenurutTitik(daftar, TITIK_PER_ZONA, jumlahTitikRuang(BATAS.ruangBesarLebihDari + 1)).length;
        const tampilKecil = saringMenurutTitik(daftar, TITIK_PER_ZONA, jumlahTitikRuang(BATAS.ruangBesarLebihDari)).length;
        const padat = zonaPadatRuangBesar(ulang(zona, n), jumlahTitik);
        expect(tampilKecil, `${zona} ${n}`).toBe(n);
        expect(padat.length > 0, `${zona} ${n}`).toBe(tampilBesar < n);
        if (padat.length > 0) expect(padat[0].batas, `${zona} ${n}`).toBe(tampilBesar);
      }
    }
  });

  it("kalimat konsol final, satu per zona; kode yang tidak dikenal dilewati", () => {
    const kejadian = new Map<string, { zona: string }>([
      ...Array.from({ length: 7 }, (_, i) => [`K-${60 + i}`, { zona: "z1" }] as const),
      ...Array.from({ length: 6 }, (_, i) => [`K-${70 + i}`, { zona: "z2" }] as const),
    ]);
    const pilihan = { zona: NAMA_ZONA.map((z) => ({ ...z })), titikPerZona: jumlahTitik as Record<string, number> };
    expect(peringatanZonaPadat([...kejadian.keys(), "K-99"], kejadian, pilihan)).toEqual([
      "Zona Rumah dan gang: 7 kejadian. Di ruang berbatas lebih dari 50 pemain, kejadian ke-7 dan seterusnya di zona ini, menurut urutan paket, tidak akan tampil.",
    ]);
    expect(peringatanZonaPadat([...kejadian.keys()].slice(1), kejadian, pilihan)).toEqual([]);
    expect(TEKS_KONSOL.paket.zonaPadat).toContain("{pemain}");
  });
});
