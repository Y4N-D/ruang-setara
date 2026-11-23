// Uji kecocokan bank tambahan dengan naskah tambahan yang disetujui (spesifikasi JS-05-semai-tambahan, P-2
// sampai P-6 dan P-20; AC-2). Naskah di naskah/tambahan/ dan NASKAH-TAMBAHAN.md tetap bentuk yang dinilai
// pemilik proyek, jadi setiap teks di bank tambahan harus sama huruf demi huruf dengan naskahnya.
import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  bacaBankAwal,
  bacaBankTambahan,
  FOLDER_NASKAH_TAMBAHAN,
  jalurRepo,
  nilaiBagianPanjang,
  uraiNaskah,
  uraiNaskahTambahanMd,
  type NaskahTerurai,
} from "./naskah-urai";

const { bank } = bacaBankTambahan();
const { bank: bankAwal } = bacaBankAwal();
const md = uraiNaskahTambahanMd();
const KODE = Array.from({ length: 24 }, (_, i) => `K-${i + 17}`);
const naskah = KODE.map((kode) => uraiNaskah(kode, FOLDER_NASKAH_TAMBAHAN));
const HURUF = "abcd";

/** Isi kejadian yang diharapkan dari naskah: urutan pilihan sama dengan urutan baris tabel naskah (P-3, D-3). */
function harapan(n: NaskahTerurai, setTokoh: string[]) {
  return {
    kode: n.kode,
    judul: n.judul,
    zona: n.zona,
    setTokoh,
    situasi: n.situasi,
    langkah1: {
      pertanyaan: n.langkah1.pertanyaan,
      opsi: n.langkah1.baris.map((b, i) => ({ id: `1${HURUF[i]}`, ...b })),
      petunjuk: n.langkah1.petunjuk,
    },
    langkah2: {
      pertanyaan: n.langkah2.pertanyaan,
      opsi: n.langkah2.baris.map((b, i) => ({ id: `2${HURUF[i]}`, ...b })),
    },
    kartu: { hak: n.kartu.hak, kewajiban: n.kartu.kewajiban, rujukan: n.rujukan.map((r) => r.id) },
    topik: n.topik,
    jenis: n.jenis,
  };
}

describe("daftar naskah tambahan (P-20)", () => {
  it("folder naskah/tambahan/ berisi K-17 sampai K-40", () => {
    const berkas = readdirSync(jalurRepo(FOLDER_NASKAH_TAMBAHAN))
      .filter((n) => /^K-\d{2,3}\.md$/.test(n))
      .map((n) => n.slice(0, -3))
      .sort();
    expect(berkas).toEqual(KODE);
  });

  it("tabel Kejadian NASKAH-TAMBAHAN.md: 24 baris berurutan, judul sama dengan naskah, status Disetujui, tautan berkas", () => {
    expect(md.kejadian.map((k) => k.kode)).toEqual(KODE);
    for (const [i, k] of md.kejadian.entries()) {
      expect(k.judul, k.kode).toBe(naskah[i].judul);
      expect(k.status, k.kode).toMatch(/^Disetujui \d{1,2} [A-Z][a-z]{2} \d{4}$/);
      expect(k.berkas, k.kode).toBe(`[${k.kode}.md](${k.kode}.md)`);
      expect(k.zona, k.kode).toBe(`Z${naskah[i].zona.slice(1)}`);
    }
  });

  it("kode kejadian di bank tambahan sama dengan naskah, berurutan (P-1)", () => {
    expect(bank.kejadian.map((k) => k.kode)).toEqual(KODE);
  });
});

describe("kejadian sama dengan naskah (P-2 sampai P-4; AC-2)", () => {
  for (const n of naskah) {
    it(`${n.kode}: teks, zona, jenis, topik, urutan pilihan, set tokoh, dan rujukan`, () => {
      const k = bank.kejadian.find((x) => x.kode === n.kode);
      const set = md.setTokoh.get(n.kode);
      expect(k).toBeDefined();
      expect(set, `${n.kode} ada di tabel set tokoh`).toBeDefined();
      expect(set?.zona).toBe(`Z${n.zona.slice(1)}`);
      expect(set?.kunci.length, `${n.kode} punya kunci set tokoh`).toBeGreaterThan(0);
      if (k && set) expect(k).toEqual(harapan(n, set.kunci));
    });

    it(`${n.kode}: angka "Pemeriksaan panjang" sama dengan hitungan ulang`, () => {
      expect(n.panjang).toHaveLength(21);
      for (const baris of n.panjang) {
        const nilai = nilaiBagianPanjang(n, baris.bagian);
        expect(nilai, `${n.kode} bagian "${baris.bagian}" dikenali`).not.toBeNull();
        expect(baris.karakter, `${n.kode} ${baris.bagian}`).toBe(nilai?.panjang);
        expect(baris.batas, `${n.kode} batas ${baris.bagian}`).toBe(nilai?.batas);
      }
    });
  }

  it("tabel set tokoh memuat K-17 sampai K-40, dengan kunci final tanpa tanda usulan (P-4, P-24)", () => {
    expect([...md.setTokoh.keys()]).toEqual(KODE);
    for (const [kode, set] of md.setTokoh) expect(set.sel, kode).not.toMatch(/usulan/i);
  });

  it("sebaran pilihan benar dan tepat sesuai rencana posisi (D-3)", () => {
    const sebaran = (daftar: string[]) => Object.fromEntries([...new Set(daftar)].sort().map((x) => [x, daftar.filter((y) => y === x).length]));
    expect(sebaran(bank.kejadian.map((k) => k.langkah1.opsi.find((o) => o.benar)?.id ?? "-"))).toEqual({ "1a": 6, "1b": 6, "1c": 6, "1d": 6 });
    expect(sebaran(bank.kejadian.map((k) => k.langkah2.opsi.find((o) => o.tingkat === "tepat")?.id ?? "-"))).toEqual({ "2a": 8, "2b": 8, "2c": 8 });
  });
});

describe("pustaka rujukan tambahan (P-5; AC-2)", () => {
  const ID = Array.from({ length: 20 }, (_, i) => `JR-${i + 24}`);

  it("20 rujukan JR-24 sampai JR-43 di NASKAH-TAMBAHAN.md, sama urutan dan id dengan bank tambahan", () => {
    expect(md.pustaka.map((p) => p.id)).toEqual(ID);
    expect([...md.sumberCatatan.keys()]).toEqual(ID);
    expect(bank.rujukan.map((r) => r.id)).toEqual(ID);
  });

  for (const id of ID) {
    it(`${id}: teks, sumber, catatan, padanan Sehari Setara, dan pemakaian sama dengan NASKAH-TAMBAHAN.md`, () => {
      const p = md.pustaka.find((x) => x.id === id);
      const r = bank.rujukan.find((x) => x.id === id);
      const sc = md.sumberCatatan.get(id);
      expect(p && r && sc, id).toBeTruthy();
      if (!p || !r || !sc) return;
      expect(r.teks).toBe(p.teks);
      expect(r.sumber).toBe(sc.sumber);
      expect(r.catatan).toBe(sc.catatan);
      expect(p.padanan).toBe("Baru");
      expect(r.kodeSehari).toBeNull();
      expect(bank.kejadian.filter((k) => k.kartu.rujukan.includes(id)).map((k) => k.kode)).toEqual(p.dipakaiDi);
    });
  }

  it("teks rujukan di setiap naskah sama dengan pustaka tambahan atau pustaka bank awal", () => {
    const pustaka = new Map([...bankAwal.rujukan, ...bank.rujukan].map((r) => [r.id, r.teks]));
    for (const n of naskah) {
      for (const r of n.rujukan) {
        expect(pustaka.has(r.id), `${n.kode} ${r.id} ada di pustaka`).toBe(true);
        expect(r.teks, `${n.kode} ${r.id}`).toBe(pustaka.get(r.id));
      }
    }
  });
});
