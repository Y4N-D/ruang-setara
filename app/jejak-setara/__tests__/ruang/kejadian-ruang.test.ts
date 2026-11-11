// Aturan kejadian ruang (spesifikasi JS-08, P-2, P-8 sampai P-11, P-26 sampai P-32, P-55, P-62; AC-3, AC-4, AC-8 sampai AC-10, AC-13).
import { describe, expect, it } from "vitest";
import { POIN, terlihatDiLayar } from "../../inti/aturan";
import { skemaServerPemain } from "../../inti/protokol";
import {
  barisJawabanD1,
  hitungSkor,
  jawabanBaru,
  jumlahTitikRuang,
  kunciLangkah1,
  kunciLangkah2,
  PAKET_RUANG_COBA,
  pesanHasil1,
  pesanHasil2,
  pesanTerbuka,
  pesanTerlihat,
  pusatTitik,
  saringMenurutTitik,
  tempatkanRuang,
  titikBaruTerlihat,
  titikDalamJangkauan,
  urutanPilihan,
} from "../../../../server/jejak-setara/src/ruang/kejadian-ruang";
import { MASUK } from "./bankUji";
import { TITIK_PER_ZONA } from "../../../../server/jejak-setara/src/ruang/peta-kampung";

const sah = (p: unknown) => {
  const h = skemaServerPemain.safeParse(p);
  return h.success ? null : JSON.stringify(h.error.issues[0]);
};

describe("paket ruang coba dan penempatan (P-1, P-2, P-8, P-9)", () => {
  it("id Paket inti 16 sama dengan idPaket di semai.mjs", async () => {
    const semai = (await import("../../../../scripts/jejak-setara/semai.mjs")) as { idPaket: (nama: string) => string };
    expect(PAKET_RUANG_COBA).toBe(semai.idPaket("Paket inti 16"));
  });

  it("ruang sampai 50 pemain memakai satu titik, lebih dari 50 memakai dua", () => {
    expect([2, 40, 50, 51, 100].map(jumlahTitikRuang)).toEqual([1, 1, 1, 2, 2]);
  });

  it("ke-16 kejadian bank awal muat dengan satu atau dua titik; setiap titik di zonanya dan dipakai sekali", () => {
    for (const n of [1, 2] as const) {
      expect(saringMenurutTitik(MASUK, TITIK_PER_ZONA, n)).toHaveLength(16);
      const ruang = tempatkanRuang(12345, TITIK_PER_ZONA, MASUK, n);
      expect(ruang.map((k) => k.kode)).toEqual(MASUK.map((k) => k.kode));
      const semua = ruang.flatMap((k) => k.titik);
      expect(new Set(semua.map((t) => t.id)).size).toBe(16 * n);
      for (const k of ruang) {
        expect(k.titik).toHaveLength(n);
        for (const t of k.titik) expect(t.zona).toBe(k.isi.zona);
      }
      expect(tempatkanRuang(12345, TITIK_PER_ZONA, MASUK, n)).toEqual(ruang);
    }
  });

  it("kejadian yang zonanya kehabisan titik dilewati menurut urutan paket", () => {
    const z1 = MASUK.filter((k) => k.isi.zona === "z1");
    const banyak = Array.from({ length: 8 }, (_, i) => ({ ...z1[i % 2], kode: `K-${90 + i}` }));
    // Z1 punya 12 titik: dengan dua titik per kejadian hanya 6 kejadian pertama yang muat.
    expect(saringMenurutTitik(banyak, TITIK_PER_ZONA, 2).map((k) => k.kode)).toEqual(["K-90", "K-91", "K-92", "K-93", "K-94", "K-95"]);
    expect(saringMenurutTitik(banyak, TITIK_PER_ZONA, 1)).toHaveLength(8);
    expect(saringMenurutTitik(MASUK, {}, 1)).toEqual([]);
  });
});

describe("urutan dan id pilihan (P-29; AC-8)", () => {
  it("tetap untuk pemain dan kejadian yang sama, berbeda antarpemain, unik, 8 karakter a-z0-9", () => {
    const a = urutanPilihan(7, "pA", "K-13");
    expect(urutanPilihan(7, "pA", "K-13")).toEqual(a);
    expect([...a.urutan1].sort()).toEqual([0, 1, 2, 3]);
    expect([...a.urutan2].sort()).toEqual([0, 1, 2]);
    const id = [...a.id1, ...a.id2];
    expect(new Set(id).size).toBe(7);
    for (const x of id) expect(x).toMatch(/^[a-z0-9]{8}$/);
    const lain = Array.from({ length: 20 }, (_, i) => urutanPilihan(7, `p${i}`, "K-13"));
    expect(new Set(lain.map((u) => u.urutan1.join(""))).size).toBeGreaterThan(5);
    expect(new Set(lain.map((u) => u.id1[0])).size).toBe(20);
    expect(urutanPilihan(8, "pA", "K-13")).not.toEqual(a);
  });

  it("id tidak bergantung pada jawaban benar: letak pilihan benar tersebar di keempat posisi", () => {
    const k = MASUK[12];
    const posisi = new Set<number>();
    for (let i = 0; i < 40; i++) {
      const u = urutanPilihan(3, `p${i}`, k.kode);
      posisi.add(u.urutan1.findIndex((x) => k.isi.langkah1.opsi[x].benar));
    }
    expect(posisi.size).toBe(4);
  });
});

describe("kunci, poin, dan isi pesan dari ke-16 kejadian (P-28, P-31, P-32; AC-9, AC-10)", () => {
  const ruang = tempatkanRuang(5, TITIK_PER_ZONA, MASUK, 1);
  for (const k of ruang) {
    it(`${k.kode}: pesan lolos skema versi 2; benar 40 + tepat 60 = 100, keliru 0 + kurang tepat 25, berisiko 0`, () => {
      expect(sah(pesanTerlihat(k, k.titik[0]))).toBeNull();
      const j = jawabanBaru(5, "pA", k.kode, 1000);
      const buka = pesanTerbuka(k, j);
      expect(sah(buka)).toBeNull();
      expect(buka.langkah).toBe(1);
      expect(buka.opsi1.map((o) => o.teks)).toEqual(j.urutan1.map((i) => k.isi.langkah1.opsi[i].teks));
      // Pilihan benar.
      const idBenar = j.id1[j.urutan1.findIndex((i) => k.isi.langkah1.opsi[i].benar)];
      const j1 = kunciLangkah1(k, j, idBenar, 2000);
      expect(j1).not.toBeNull();
      expect(j1?.status).toBe("langkah2");
      expect(j1?.poin).toBe(40);
      expect(kunciLangkah1(k, j1!, idBenar, 2100)).toBeNull(); // kunci kedua diabaikan
      const h1 = pesanHasil1(k, j1!);
      expect(sah(h1)).toBeNull();
      expect(h1).toMatchObject({ benar: true, opsiBenar: idBenar, poin: 40 });
      expect(h1.umpanBalikBenar).toBeUndefined();
      expect(sah(pesanTerbuka(k, j1!))).toBeNull();
      expect(pesanTerbuka(k, j1!).langkah).toBe(2);
      const idTepat = j1!.id2[j1!.urutan2.findIndex((i) => k.isi.langkah2.opsi[i].tingkat === "tepat")];
      const j2 = kunciLangkah2(k, j1!, idTepat, 3000);
      expect(j2?.status).toBe("selesai");
      expect(j2?.poin).toBe(100);
      expect(kunciLangkah2(k, j2!, idTepat, 3100)).toBeNull();
      const h2 = pesanHasil2(k, j2!);
      expect(sah(h2)).toBeNull();
      expect(h2.tingkat).toBe("tepat");
      expect(h2.poin).toBe(60);
      expect(h2.kartu.rujukan).toEqual(k.rujukan);
      expect(h2.opsiTepat).toEqual(j1!.id2.filter((_, p) => k.isi.langkah2.opsi[j1!.urutan2[p]].tingkat === "tepat"));
      // Pilihan keliru, lalu tingkat lain.
      const idSalah = j.id1[j.urutan1.findIndex((i) => !k.isi.langkah1.opsi[i].benar)];
      const s1 = kunciLangkah1(k, j, idSalah, 2000)!;
      const hs = pesanHasil1(k, s1);
      expect(sah(hs)).toBeNull();
      expect(hs).toMatchObject({ benar: false, poin: 0, opsiBenar: idBenar });
      expect(hs.umpanBalikBenar).toBe(k.isi.langkah1.opsi.find((o) => o.benar)?.umpanBalik);
      expect(hs.umpanBalik).toBe(k.isi.langkah1.opsi.find((o) => o.id === s1.langkah1Opsi)?.umpanBalik);
      for (const tingkat of ["kurang", "berisiko"] as const) {
        const p = s1.urutan2.findIndex((i) => k.isi.langkah2.opsi[i].tingkat === tingkat);
        if (p < 0) continue;
        const s2 = kunciLangkah2(k, s1, s1.id2[p], 3000)!;
        expect(s2.poin).toBe(POIN[tingkat]);
        expect(pesanHasil2(k, s2).poin).toBe(POIN[tingkat]);
      }
      // Id yang bukan milik pemain ditolak.
      expect(kunciLangkah1(k, j, "bukanid1", 2000)).toBeNull();
      expect(kunciLangkah1(k, j, jawabanBaru(5, "pB", k.kode, 0).id1[0], 2000)).toBeNull();
    });
  }
});

describe("keterlihatan dan jangkauan (P-10, P-26)", () => {
  const ruang = tempatkanRuang(5, TITIK_PER_ZONA, MASUK, 2);
  it("titik baru terlihat hanya bila masuk kotak pandangan yang dijepit ke tepi peta, dan hanya sekali", () => {
    const k = ruang[0];
    const t = k.titik[0];
    const dekat = { x: pusatTitik(t).x + 150, y: pusatTitik(t).y };
    const baru = titikBaruTerlihat(dekat, ruang, new Set(), 2560, 1600);
    expect(baru.map((b) => b.titik.id)).toContain(t.id);
    for (const b of baru) expect(terlihatDiLayar(dekat, pusatTitik(b.titik), 2560, 1600)).toBe(true);
    expect(titikBaruTerlihat(dekat, ruang, new Set(baru.map((b) => b.titik.id)), 2560, 1600)).toEqual([]);
    const jauh = { x: pusatTitik(t).x + 200, y: pusatTitik(t).y };
    expect(titikBaruTerlihat(jauh, [k], new Set(), 2560, 1600).map((b) => b.titik.id)).not.toContain(t.id);
  });

  it("jangkauan server 32 piksel ke titik mana pun; titik terdekat dipilih", () => {
    const k = ruang[3];
    const [a, b] = k.titik;
    expect(titikDalamJangkauan({ x: pusatTitik(a).x, y: pusatTitik(a).y + 32 }, k)?.id).toBe(a.id);
    expect(titikDalamJangkauan({ x: pusatTitik(a).x, y: pusatTitik(a).y + 33 }, k)).toBeNull();
    expect(titikDalamJangkauan({ x: pusatTitik(b).x + 20, y: pusatTitik(b).y }, k)?.id).toBe(b.id);
  });
});

describe("skor dan baris D1 (P-55, P-62)", () => {
  it("skor, Langkah 1 benar, selesai, dan waktu skor terakhir bertambah menurut waktu ronde", () => {
    const k = tempatkanRuang(5, TITIK_PER_ZONA, MASUK, 1);
    const a = kunciLangkah2(k[0], kunciLangkah1(k[0], jawabanBaru(5, "p", "K-01", 0), jawabanBaru(5, "p", "K-01", 0).id1[jawabanBaru(5, "p", "K-01", 0).urutan1.findIndex((i) => k[0].isi.langkah1.opsi[i].benar)], 1000)!, "x", 0);
    expect(a).toBeNull(); // id Langkah 2 salah
    const j0 = jawabanBaru(5, "p", "K-01", 0);
    const j1 = kunciLangkah1(k[0], j0, j0.id1[j0.urutan1.findIndex((i) => k[0].isi.langkah1.opsi[i].benar)], 1000)!;
    const berisiko = j1.urutan2.findIndex((i) => k[0].isi.langkah2.opsi[i].tingkat === "berisiko");
    const j2 = kunciLangkah2(k[0], j1, j1.id2[berisiko], 5000)!;
    const m0 = jawabanBaru(5, "p", "K-02", 0);
    const m1 = kunciLangkah1(k[1], m0, m0.id1[m0.urutan1.findIndex((i) => !k[1].isi.langkah1.opsi[i].benar)], 6000)!;
    const s = hitungSkor([j2, m1], (t) => t - 100);
    // Langkah 2 berisiko (0 poin) tidak menggeser waktu skor; Langkah 1 keliru juga tidak.
    expect(s).toEqual({ skor: 40, waktuSkorMs: 900, langkah1Benar: 1, selesai: 1 });
    expect(hitungSkor([], (t) => t)).toEqual({ skor: 0, waktuSkorMs: 0, langkah1Benar: 0, selesai: 0 });
    const d1 = barisJawabanD1("r-1", k[0], j2);
    expect(d1).toMatchObject({ id: "p:K-01", ruangId: "r-1", pesertaId: "p", kejadianVersiId: "versi-K-01", langkah1Benar: 1, petunjukDipakai: 0, tingkat: "berisiko", poin: 40 });
    expect(JSON.parse(d1.urutanOpsiJson)).toEqual({
      langkah1: j2.urutan1.map((i) => k[0].isi.langkah1.opsi[i].id),
      langkah2: j2.urutan2.map((i) => k[0].isi.langkah2.opsi[i].id),
    });
  });
});
