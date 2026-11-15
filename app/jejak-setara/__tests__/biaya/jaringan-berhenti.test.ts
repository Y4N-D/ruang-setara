// Sambung ulang HP pemain yang berhenti (spesifikasi JS-22, P-8 sampai P-10; AC-7). Soket, jam, dan pemeriksaan ruang tiruan.
import { describe, expect, it } from "vitest";
import {
  BATAS_PUTUS_MS,
  JEDA_SESUDAH_PERIKSA_MS,
  KlienRuang,
  KODE_LAYANAN_BERHENTI,
  KODE_PUTUS_LAMA,
  kunciToken,
  PERIKSA_SETIAP_GAGAL,
  type HasilPeriksaRuang,
  type KeadaanKlien,
  type Ketergantungan,
  type SoketMirip,
} from "../../pemain/jaringan";

class SoketPalsu implements SoketMirip {
  readyState = 0;
  onopen: SoketMirip["onopen"] = null;
  onmessage: SoketMirip["onmessage"] = null;
  onclose: SoketMirip["onclose"] = null;
  onerror: SoketMirip["onerror"] = null;
  send() {}
  close() {
    this.readyState = 3;
  }
  putus(kode = 1006) {
    this.readyState = 3;
    this.onclose?.({ code: kode });
  }
}

function siapkan(hasil: HasilPeriksaRuang[] | null) {
  let jam = 1_000_000;
  let nomor = 0;
  const pewaktu: { id: number; pada: number; kerja: () => void }[] = [];
  const soket: SoketPalsu[] = [];
  const isi = new Map([[kunciToken("K7MPA"), "token-lama"]]);
  const periksa: string[] = [];
  const dep: Ketergantungan = {
    buatSoket: () => {
      const s = new SoketPalsu();
      soket.push(s);
      return s;
    },
    jam: () => jam,
    pasang: (kerja, ms) => {
      nomor++;
      pewaktu.push({ id: nomor, pada: jam + ms, kerja });
      return nomor;
    },
    batal: (id) => {
      const i = pewaktu.findIndex((p) => p.id === id);
      if (i >= 0) pewaktu.splice(i, 1);
    },
    penyimpanan: { getItem: (k) => isi.get(k) ?? null, setItem: (k, v) => void isi.set(k, v), removeItem: (k) => void isi.delete(k) },
    ...(hasil
      ? {
          periksaRuang: async (kode: string) => {
            periksa.push(kode);
            return hasil.shift() ?? "tidak_tahu";
          },
        }
      : {}),
  };
  const keadaan: [KeadaanKlien, number | null][] = [];
  const klien = new KlienRuang("ws://uji/ws/ruang/K7MPA", "K7MPA", null, dep, () => {}, (k, kode) => keadaan.push([k, kode]));
  /** Memutus soket terakhir, lalu menjalankan pewaktu berikutnya (bila ada) dan mengembalikan jedanya. */
  const gagalSekali = async (): Promise<number | null> => {
    soket[soket.length - 1].putus();
    await Promise.resolve();
    await Promise.resolve();
    pewaktu.sort((a, b) => a.pada - b.pada);
    const berikut = pewaktu.shift();
    if (!berikut) return null;
    const jeda = berikut.pada - jam;
    jam = berikut.pada;
    berikut.kerja();
    return jeda;
  };
  return { klien, keadaan, periksa, isi, gagalSekali, aturJam: (t: number) => (jam = t), jam: () => jam };
}

const terakhir = (k: [KeadaanKlien, number | null][]) => k[k.length - 1];

describe("pemeriksaan ruang sesudah 10 kali gagal (P-8)", () => {
  it("ruang tidak ada: berhenti dengan kode 4000 dan token dihapus", async () => {
    const u = siapkan(["tidak_ada"]);
    u.klien.mulai();
    for (let i = 0; i < PERIKSA_SETIAP_GAGAL - 1; i++) expect(await u.gagalSekali()).not.toBeNull();
    expect(u.periksa).toEqual([]);
    expect(await u.gagalSekali()).toBeNull();
    expect(u.periksa).toEqual(["K7MPA"]);
    expect(terakhir(u.keadaan)).toEqual(["berhenti", 4000]);
    expect(u.isi.has(kunciToken("K7MPA"))).toBe(false);
  });

  it("layanan dihentikan: berhenti dengan kode layanan berhenti", async () => {
    const u = siapkan(["berhenti"]);
    u.klien.mulai();
    for (let i = 0; i < PERIKSA_SETIAP_GAGAL; i++) await u.gagalSekali();
    expect(terakhir(u.keadaan)).toEqual(["berhenti", KODE_LAYANAN_BERHENTI]);
  });

  it("ruang ada atau tidak tahu: jeda 30 detik, lalu diperiksa lagi setiap 10 percobaan", async () => {
    const u = siapkan(["ada", "tidak_tahu", "tidak_ada"]);
    u.klien.mulai();
    const jeda: (number | null)[] = [];
    for (let i = 0; i < 2 * PERIKSA_SETIAP_GAGAL; i++) jeda.push(await u.gagalSekali());
    expect(jeda.slice(0, 5)).toEqual([500, 1000, 2000, 4000, 8000]);
    expect(jeda[PERIKSA_SETIAP_GAGAL - 1]).toBe(JEDA_SESUDAH_PERIKSA_MS);
    expect(jeda.slice(PERIKSA_SETIAP_GAGAL)).toEqual(Array(PERIKSA_SETIAP_GAGAL).fill(JEDA_SESUDAH_PERIKSA_MS));
    expect(u.periksa).toEqual(["K7MPA", "K7MPA"]);
    expect(u.keadaan.some(([k]) => k === "berhenti")).toBe(false);
  });
});

describe("batas 10 menit (P-9, D-2)", () => {
  it("sesudah 10 menit gagal terus, klien berhenti dengan kode putus lama", async () => {
    const u = siapkan(null);
    u.klien.mulai();
    let jeda: number | null = 0;
    for (let i = 0; i < 200 && jeda !== null; i++) jeda = await u.gagalSekali();
    expect(terakhir(u.keadaan)).toEqual(["berhenti", KODE_PUTUS_LAMA]);
    expect(BATAS_PUTUS_MS).toBe(600_000);
  });

  it("tanpa pemeriksaan ruang (dianggap tidak tahu): jadwal JS-03 sampai percobaan ke-10, lalu jeda 30 detik", async () => {
    const u = siapkan(null);
    u.klien.mulai();
    const jeda: (number | null)[] = [];
    for (let i = 0; i < 12; i++) jeda.push(await u.gagalSekali());
    expect(jeda.slice(9)).toEqual([8000, JEDA_SESUDAH_PERIKSA_MS, JEDA_SESUDAH_PERIKSA_MS]);
  });
});
