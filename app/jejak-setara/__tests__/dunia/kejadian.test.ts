// Kejadian di layar pemain (spesifikasi JS-08, P-14, P-21, P-40; AC-5, AC-7): tata letak ke-16 set bank awal,
// jangkauan 24 piksel, dan pemilihan kejadian terdekat.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NPC, OBJEK } from "../../assets/manifest";
import { kejadianDalamJangkauan, KejadianKlien, nomorZona, tataLetakKejadian } from "../../pemain/dunia/kejadian";

const bank = JSON.parse(readFileSync(new URL("../../../../server/jejak-setara/seed/bank-awal.json", import.meta.url), "utf8")) as {
  kejadian: { kode: string; setTokoh: string[] }[];
};

/** Tabel harapan: kunci → [dx, dy] sel kiri-atas (P-14). */
const HARAPAN: Record<string, Record<string, [number, number]>> = {
  "K-01": { npc_nara_bawah_diam: [-1, 0], npc_gita_bawah_diam: [1, 0], npc_siswa1_bawah_diam: [0, -1] },
  "K-02": { obj_pengeras_suara: [0, -1], npc_made_bawah_diam: [-1, 0], npc_dimas_bawah_diam: [1, 0] },
  "K-03": { npc_komang_bawah_menunduk: [-1, 0], npc_siswa5_bawah_hp: [1, 0], npc_siswa6_bawah_diam: [0, -1] },
  "K-04": { npc_raka_bawah_kursiroda: [-1, 0], npc_siswa5_bawah_diam: [1, 0] },
  "K-05": { npc_dimas_kanan_motor: [-1, 0] },
  "K-06": { npc_nenek_bawah_diam: [-1, 0] },
  "K-07": { obj_tiang_kamera: [1, -1], npc_bayu_bawah_diam: [-1, 0], npc_pedagang_bawah_diam: [0, -1], npc_warga1_bawah_menunjuk: [-1, -1] },
  "K-08": { obj_bangku_pasar: [-1, -1], obj_dompet: [1, -1], npc_nara_bawah_diam: [-1, 0], npc_siswa2_bawah_diam: [1, 0] },
  "K-09": { obj_meja_panitia: [-1, -1], npc_sinta_bawah_diam: [-1, 0], npc_siswa4_bawah_diam: [1, 0] },
  "K-10": { obj_meja_panitia: [-1, -1], npc_siswa2_bawah_menunduk: [-1, 0], npc_siswa3_bawah_diam: [1, 0], npc_warga2_bawah_diam: [1, -1] },
  "K-11": { obj_sisa_piknik: [-1, -1], obj_tempat_sampah: [1, -1], npc_siswa3_bawah_diam: [-1, 0], npc_siswa4_bawah_diam: [1, 0] },
  "K-12": { obj_bola: [0, -1], obj_tali_lompat: [-1, -1], npc_gita_bawah_diam: [-1, 0], npc_anak1_bawah_diam: [1, 0] },
  "K-13": { obj_bangku_antrean: [-1, -1], npc_ibubayi_bawah_diam: [-1, 0], npc_siswa5_bawah_diam: [1, 0], npc_petugas_bawah_diam: [0, -1] },
  "K-14": { obj_gerobak: [0, -1], npc_wayan_bawah_diam: [-1, 0] },
  "K-15": { npc_siswa4_bawah_diam: [-1, 0] },
  "K-16": { npc_siswa1_bawah_hp: [-1, 0] },
};

describe("tata letak tokoh dan properti (P-14; AC-5)", () => {
  it("ke-16 set bank awal tergambar lengkap sesuai tabel harapan, tanpa properti yang tumpang tindih", () => {
    expect(bank.kejadian.map((k) => k.kode)).toEqual(Object.keys(HARAPAN));
    for (const k of bank.kejadian) {
      const letak = tataLetakKejadian(k.setTokoh, OBJEK);
      expect(Object.fromEntries(letak.map((l) => [l.kunci, [l.dx, l.dy]])), k.kode).toEqual(HARAPAN[k.kode]);
      for (const kunci of k.setTokoh) expect(kunci.startsWith("npc_") ? NPC[kunci] : OBJEK[kunci.slice(4)], kunci).toBeDefined();
      const selProperti = letak.filter((l) => l.jenis === "obj").flatMap((l) => Array.from({ length: l.lebar * l.tinggi }, (_, i) => `${l.dx + (i % l.lebar)},${l.dy + Math.floor(i / l.lebar)}`));
      expect(new Set(selProperti).size, k.kode).toBe(selProperti.length);
      for (const s of selProperti) {
        const [x, y] = s.split(",").map(Number);
        expect(Math.abs(x) <= 1 && Math.abs(y) <= 1, `${k.kode} ${s}`).toBe(true);
      }
      // Sel titik (0, 0) hanya tertutup properti 2 × 2, dan tidak ada tokoh di sana.
      for (const l of letak) if (l.jenis === "npc") expect(`${l.dx},${l.dy}`).not.toBe("0,0");
    }
  });

  it("properti yang tidak mendapat tempat dan tokoh tanpa sel tidak digambar", () => {
    const penuh = tataLetakKejadian(["obj_bangku_antrean", "obj_bangku_antrean2", "npc_a", "npc_b", "npc_c", "npc_d", "npc_e", "npc_f"], {
      bangku_antrean: { lebar: 3, tinggi: 1 },
      bangku_antrean2: { lebar: 3, tinggi: 1 },
    });
    expect(penuh.filter((l) => l.jenis === "obj")).toHaveLength(1);
    expect(penuh.filter((l) => l.jenis === "npc").map((l) => `${l.dx},${l.dy}`)).toEqual(["-1,0", "1,0", "0,-1", "-1,-1", "1,-1"]);
  });
});

describe("jangkauan dan zona (P-21, P-40; AC-7)", () => {
  const titik = [
    { kejadianId: "K-02", x: 10, y: 10, setTokoh: ["npc_a"] },
    { kejadianId: "K-01", x: 11, y: 10, setTokoh: ["npc_a"] },
  ];
  it("24 piksel ke pusat titik; yang terdekat dipilih, bila sama jauh kode terkecil; kejadian selesai dilewati", () => {
    expect(kejadianDalamJangkauan({ x: 168, y: 168 + 24 }, titik.slice(0, 1), new Set())).toBe("K-02");
    expect(kejadianDalamJangkauan({ x: 168, y: 168 + 25 }, titik.slice(0, 1), new Set())).toBeNull();
    expect(kejadianDalamJangkauan({ x: 176, y: 168 }, titik, new Set())).toBe("K-01"); // sama jauh 8 px
    expect(kejadianDalamJangkauan({ x: 170, y: 168 }, titik, new Set())).toBe("K-02");
    expect(kejadianDalamJangkauan({ x: 176, y: 168 }, titik, new Set(["K-01"]))).toBe("K-02");
  });

  it("KejadianKlien: kejadian baru terlihat sekali walau titiknya dua; nomor zona dari batas zona peta", () => {
    const k = new KejadianKlien();
    expect(k.terima(titik[0])).toBe(true);
    expect(k.terima({ ...titik[0], x: 30 })).toBe(false);
    expect(k.jumlahTitik).toBe(2);
    expect(k.kodeTerlihat()).toEqual(new Set(["K-02"]));
    k.aturSelesai(["K-02"]);
    expect(k.selesai.has("K-02")).toBe(true);
    expect(nomorZona(0, 0)).toBeGreaterThanOrEqual(1);
    expect(nomorZona(0, 0)).toBeLessThanOrEqual(8);
  });
});
