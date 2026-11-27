// Pemain lain: tunda adaptif, interpolasi, penerusan, dan sembunyi (spesifikasi JS-07, P-19 sampai P-22; AC-9).
import { describe, expect, it } from "vitest";
import { acakBerbenih } from "../../inti/acak";
import { PemainLain, posisiPada, SEMBUNYI_MS, TERUS_MAKS_MS, TUNDA, TUNDA_LOBI_MIN_MS, TundaAdaptif, tundaUntukStatus, type Butir } from "../../pemain/dunia/pemainLain";

const info = { nama: "Kancil Jingga", avatar: 2, warnaTas: "teal" as const };

describe("tunda adaptif (P-20)", () => {
  it("awal: d̄ = d pertama dan J = 25 ms, sehingga tunda 150 ms", () => {
    const t = new TundaAdaptif();
    expect(t.tundaMs).toBe(150);
    t.tambah(80);
    expect([t.jitterMs, t.tundaMs]).toEqual([25, 150]);
  });

  it("jaringan tenang menurunkan tunda ke 120 ms; jitter besar menaikkannya sampai 250 ms", () => {
    const tenang = new TundaAdaptif();
    for (let i = 0; i < 200; i++) tenang.tambah(80);
    expect(tenang.tundaMs).toBe(TUNDA.minMs);
    const ramai = new TundaAdaptif();
    const acak = acakBerbenih(3);
    for (let i = 0; i < 400; i++) ramai.tambah(80 - Math.log(1 - acak()) * 200);
    expect(ramai.tundaMs).toBe(TUNDA.maksMs);
    const sedang = new TundaAdaptif();
    const acak2 = acakBerbenih(9);
    for (let i = 0; i < 400; i++) sedang.tambah(80 - Math.log(1 - acak2()) * 30);
    expect(sedang.tundaMs).toBeGreaterThan(TUNDA.minMs);
    expect(sedang.tundaMs).toBeLessThan(TUNDA.maksMs);
  });
});

describe("interpolasi dan penerusan (P-21)", () => {
  const b = (w: number, x: number, jalan = true): Butir => ({ w, x, y: 0, arah: "kanan", jalan });

  it("di antara dua butir: lurus; arah dan pose dari butir yang lebih awal", () => {
    expect(posisiPada([b(0, 0), b(100, 10, false)], 50)).toEqual({ x: 5, y: 0, arah: "kanan", jalan: true });
    expect(posisiPada([b(100, 7)], 50)).toEqual({ x: 7, y: 0, arah: "kanan", jalan: true });
  });

  it("lewat butir terakhir: diteruskan dengan kecepatan dua butir terakhir paling lama 100 ms, lalu berhenti", () => {
    const d = [b(0, 0), b(100, 10)];
    expect(posisiPada(d, 150)?.x).toBeCloseTo(15, 9);
    expect(posisiPada(d, 100 + TERUS_MAKS_MS)?.x).toBeCloseTo(20, 9);
    expect(posisiPada(d, 400)).toEqual({ x: 20, y: 0, arah: "kanan", jalan: false });
  });

  it("butir terakhir berhenti (jalan false): tidak diteruskan", () => {
    expect(posisiPada([b(0, 0), b(100, 10, false)], 180)).toEqual({ x: 10, y: 0, arah: "kanan", jalan: false });
  });
});

describe("penyangga dan sembunyi (P-19, P-22)", () => {
  it("pemain yang belum dikenal tidak digambar; paling banyak 10 butir per pemain; diri tidak digambar", () => {
    const l = new PemainLain();
    l.aturDiri("diri");
    l.terimaDunia(1000, [["b", 1, 1, "bawah", false], ["diri", 2, 2, "bawah", false]], 1080, 0);
    expect(l.tampil(2000, 2000, "lobi")).toEqual([]);
    l.kenal("b", info);
    l.kenal("diri", info);
    expect(l.tampil(2000, 2000, "lobi").map((p) => p.id)).toEqual(["b"]);
    for (let i = 0; i < 30; i++) l.terimaDunia(1100 + i * 100, [["b", 10 + i, 1, "kanan", true]], 1180 + i * 100, 0);
    // Butir terakhir x 39 (jalan): diteruskan paling lama 100 ms (+1), lalu berhenti.
    expect(l.tampil(1e6, 1e6, "lobi")[0]).toMatchObject({ x: 40, jalan: false });
  });

  it("di main, pemain yang tidak muncul selama 2,5 detik disembunyikan; di lobi dan hitung mundur tetap tampil", () => {
    const l = new PemainLain();
    l.kenal("b", info);
    l.terimaDunia(1000, [["b", 5, 5, "bawah", false]], 1000, 0);
    expect(l.tampil(1000 + SEMBUNYI_MS, 1000 + SEMBUNYI_MS, "main")).toHaveLength(1);
    expect(l.tampil(1000 + SEMBUNYI_MS + 1, 1000 + SEMBUNYI_MS + 1, "main")).toHaveLength(0);
    expect(l.tampil(9000, 9000, "lobi")).toHaveLength(1);
    expect(l.tampil(9000, 9000, "hitung_mundur")).toHaveLength(1);
    l.segarkanTerlihat(9000);
    expect(l.tampil(9000, 9000, "main")).toHaveLength(1);
    l.terimaDunia(9100, [["b", 6, 5, "kanan", true]], 9100, 0);
    expect(l.tampil(9100, 9100, "main")).toHaveLength(1);
  });

  it("tunda dipakai: posisi tampil pada jam server dikurangi tunda", () => {
    const l = new PemainLain();
    l.kenal("b", info);
    l.terimaDunia(1000, [["b", 0, 0, "kanan", true]], 1080, 0);
    l.terimaDunia(1100, [["b", 10, 0, "kanan", true]], 1180, 0);
    const tunda = l.tunda.tundaMs;
    expect(l.tampil(1050 + tunda, 1200, "main")[0].x).toBeCloseTo(5, 6);
  });
});

describe("tunda tampilan per status (JS-15, P-24, D-5 a)", () => {
  it("lobi dan hitung mundur paling sedikit 320 ms; main tetap 120–250 ms", () => {
    expect(TUNDA_LOBI_MIN_MS).toBe(320);
    for (const t of [TUNDA.minMs, 150, TUNDA.maksMs]) {
      expect(tundaUntukStatus(t, "main")).toBe(t);
      expect(tundaUntukStatus(t, "lobi")).toBe(320);
      expect(tundaUntukStatus(t, "hitung_mundur")).toBe(320);
    }
  });
});

describe("JS-18: pemain lain yang melompat (P-24; AC-10)", () => {
  it("butir yang melompat dari butir terakhir mengganti penyangga: langsung tampil di tempat baru tanpa meluncur", () => {
    const l = new PemainLain();
    l.kenal("b", info);
    for (let i = 0; i <= 5; i++) l.terimaDunia(1000 + i * 100, [["b", 888 + i * 7, 1036, "kanan", true]], 1000 + i * 100, 0);
    // Pindah halte: 100 ms kemudian di titik halte 3 (sekitar 1000 piksel jauhnya).
    l.terimaDunia(1600, [["b", 1688, 412, "kiri", false]], 1600, 0);
    // Pada waktu tampil sebelum butir baru pun, avatar sudah di tempat baru: tidak ada posisi antara dan tidak tertinggal.
    for (const t of [1450, 1550, 1600, 1700]) {
      const q = l.tampil(t + l.tunda.tundaMs, t + l.tunda.tundaMs, "main")[0];
      expect([q.x, q.y], String(t)).toEqual([1688, 412]);
    }
  });

  it("tepat di ambang (64 + 144 × dtMs / 1000) bukan lompatan, sedikit di atasnya lompatan; gerak biasa tetap diinterpolasi", () => {
    const l = new PemainLain();
    l.kenal("b", info);
    l.terimaDunia(1000, [["b", 0, 0, "kanan", true]], 1000, 0);
    l.terimaDunia(1100, [["b", 78.4, 0, "kanan", true]], 1100, 0); // ambang dtMs 100: 78,4 px
    expect(l.tampil(1050 + l.tunda.tundaMs, 1150, "main")[0].x).toBeCloseTo(39.2, 6);
    l.terimaDunia(1200, [["b", 78.4 + 78.41, 0, "kanan", true]], 1200, 0);
    expect(l.tampil(1150 + l.tunda.tundaMs, 1250, "main")[0].x).toBeCloseTo(156.81, 6);
  });
});
