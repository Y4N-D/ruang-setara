// Klien WebSocket pemain (spesifikasi JS-03, P-25, P-29 sampai P-31, P-55; AC-9, AC-10).
import { PROTOKOL_VERSI } from "../../inti/versi";
import { describe, expect, it } from "vitest";
import { jedaPercobaan, KlienRuang, kunciToken, selisihJam, type KeadaanKlien, type Ketergantungan, type SoketMirip } from "../../pemain/jaringan";
import type { PesanServerPemain } from "../../inti/protokol";

class SoketPalsu implements SoketMirip {
  readyState = 0;
  bufferedAmount = 0;
  terkirim: Record<string, unknown>[] = [];
  onopen: SoketMirip["onopen"] = null;
  onmessage: SoketMirip["onmessage"] = null;
  onclose: SoketMirip["onclose"] = null;
  onerror: SoketMirip["onerror"] = null;
  send(data: string) {
    this.terkirim.push(JSON.parse(data) as Record<string, unknown>);
  }
  close() {
    this.readyState = 3;
  }
  buka() {
    this.readyState = 1;
    this.onopen?.({});
  }
  terima(isi: unknown) {
    this.onmessage?.({ data: typeof isi === "string" ? isi : JSON.stringify(isi) });
  }
  putus(kode = 1006) {
    this.readyState = 3;
    this.onclose?.({ code: kode });
  }
}

function siapkan(simpanan: Record<string, string> = {}, opsi: { versiPeta?: number } = {}) {
  let jam = 1000;
  let nomor = 0;
  const pewaktu: { id: number; pada: number; kerja: () => void }[] = [];
  const soket: SoketPalsu[] = [];
  const isi = new Map(Object.entries(simpanan));
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
    penyimpanan: {
      getItem: (k) => isi.get(k) ?? null,
      setItem: (k, v) => void isi.set(k, v),
      removeItem: (k) => void isi.delete(k),
    },
  };
  const pesan: PesanServerPemain[] = [];
  const keadaan: [KeadaanKlien, number | null][] = [];
  const klien = new KlienRuang("ws://uji/ws/ruang/K7MPA", "K7MPA", null, dep, (p) => pesan.push(p), (k, kode) => keadaan.push([k, kode]), opsi);
  const majukan = (ms: number) => {
    const sampai = jam + ms;
    for (;;) {
      pewaktu.sort((a, b) => a.pada - b.pada);
      const berikut = pewaktu[0];
      if (!berikut || berikut.pada > sampai) break;
      pewaktu.shift();
      jam = berikut.pada;
      berikut.kerja();
    }
    jam = sampai;
  };
  return { klien, soket, pesan, keadaan, isi, majukan, aturJam: (t: number) => (jam = t) };
}

const TOKEN = "A".repeat(43);
const datang = {
  v: PROTOKOL_VERSI,
  t: "selamat_datang",
  pemainId: "p1",
  token: TOKEN,
  status: "lobi",
  pengaturan: { durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, skillAktif: [], modeNomorAbsen: false, uji: true },
  waktuServer: 5000,
  versiPeta: 1,
  saranNama: ["Kancil Jingga"],
  avatarTersedia: [0, 1],
};

describe("bantuan jaringan", () => {
  it("jadwal sambung ulang 0,5, 1, 2, 4, lalu 8 detik", () => {
    expect([0, 1, 2, 3, 4, 5, 9].map(jedaPercobaan)).toEqual([500, 1000, 2000, 4000, 8000, 8000, 8000]);
  });

  it("kunci token per kode ruang", () => {
    expect(kunciToken("K7MPA")).toBe("jejak:token:K7MPA");
  });

  it("selisih jam: median lima sampel terakhir", () => {
    const s = [100, 7, 9, 8, 50, 10].map((selisih) => ({ rtt: 20, selisih }));
    expect(selisihJam(s)).toBe(9);
    expect(selisihJam([])).toBe(0);
  });
});

describe("KlienRuang", () => {
  it("halo membawa token tersimpan; selamat_datang menyimpan token dan menandai tersambung", () => {
    const u = siapkan({ "jejak:token:K7MPA": TOKEN });
    u.klien.mulai();
    u.soket[0].buka();
    expect(u.soket[0].terkirim[0]).toEqual({ v: PROTOKOL_VERSI, t: "halo", peran: "pemain", token: TOKEN });
    u.soket[0].terima(datang);
    expect(u.klien.keadaan).toBe("tersambung");
    expect(u.isi.get("jejak:token:K7MPA")).toBe(TOKEN);
    expect(u.pesan[0]).toMatchObject({ t: "selamat_datang" });
  });

  it("putus di luar kehendak: menyambung ulang dengan jeda 0,5, 1, 2 detik, lalu jadwal kembali ke awal", () => {
    const u = siapkan();
    u.klien.mulai();
    u.soket[0].buka();
    u.soket[0].terima(datang);
    u.soket[0].putus();
    expect(u.klien.keadaan).toBe("menyambung_ulang");
    u.majukan(499);
    expect(u.soket).toHaveLength(1);
    u.majukan(1);
    expect(u.soket).toHaveLength(2);
    u.soket[1].putus();
    u.majukan(999);
    expect(u.soket).toHaveLength(2);
    u.majukan(1);
    expect(u.soket).toHaveLength(3);
    u.soket[2].buka();
    expect(u.soket[2].terkirim[0]).toMatchObject({ t: "halo", token: TOKEN });
    u.soket[2].terima(datang);
    u.soket[2].putus();
    u.majukan(500);
    expect(u.soket).toHaveLength(4);
  });

  it("cobaSekarang langsung membuka sambungan baru", () => {
    const u = siapkan();
    u.klien.mulai();
    u.soket[0].buka();
    u.soket[0].putus();
    u.klien.cobaSekarang();
    expect(u.soket).toHaveLength(2);
  });

  it("galat DIKELUARKAN dan status ditutup menghentikan klien dan menghapus token", () => {
    const u = siapkan({ "jejak:token:K7MPA": TOKEN });
    u.klien.mulai();
    u.soket[0].buka();
    u.soket[0].terima({ v: PROTOKOL_VERSI, t: "galat", kode: "DIKELUARKAN", pesan: "x" });
    expect(u.klien.keadaan).toBe("berhenti");
    expect(u.isi.has("jejak:token:K7MPA")).toBe(false);
    u.majukan(60_000);
    expect(u.soket).toHaveLength(1);
    const v = siapkan({ "jejak:token:K7MPA": TOKEN });
    v.klien.mulai();
    v.soket[0].buka();
    v.soket[0].terima({ v: PROTOKOL_VERSI, t: "status_ruang", status: "ditutup", mulaiPada: null, berakhirPada: null, jedaSejak: null });
    expect(v.keadaan.at(-1)).toEqual(["berhenti", 4000]);
    expect(v.isi.has("jejak:token:K7MPA")).toBe(false);
  });

  it("penutupan 1008 (pelanggaran) dicoba lagi seperti putus biasa", () => {
    const u = siapkan();
    u.klien.mulai();
    u.soket[0].buka();
    u.soket[0].putus(1008);
    expect(u.klien.keadaan).toBe("menyambung_ulang");
    u.majukan(500);
    expect(u.soket).toHaveLength(2);
  });

  it("penutupan 4004 tidak dicoba lagi; pesan cacat diabaikan dan dihitung", () => {
    const u = siapkan();
    u.klien.mulai();
    u.soket[0].buka();
    u.soket[0].terima("{bukan json");
    u.soket[0].terima({ v: PROTOKOL_VERSI, t: "dunia" });
    expect(u.klien.pesanCacat).toBe(2);
    expect(u.pesan).toEqual([]);
    u.soket[0].putus(4004);
    expect(u.klien.keadaan).toBe("berhenti");
    u.majukan(60_000);
    expect(u.soket).toHaveLength(1);
  });

  it("ping setiap 5 detik; pong memperbarui selisih jam", () => {
    const u = siapkan();
    u.klien.mulai();
    u.soket[0].buka();
    expect(u.soket[0].terkirim.map((p) => p.t)).toEqual(["halo", "ping"]);
    u.majukan(5000);
    expect(u.soket[0].terkirim.filter((p) => p.t === "ping")).toHaveLength(2);
    const ping = u.soket[0].terkirim.at(-1) as { tKlien: number };
    u.majukan(40);
    u.soket[0].terima({ v: PROTOKOL_VERSI, t: "pong", tKlien: ping.tKlien, waktuServer: ping.tKlien + 1020 });
    expect(u.klien.selisihJamMs).toBe(1000);
  });
});

describe("JS-07: versi peta dan bufferedAmount (P-16, P-50)", () => {
  it("selamat_datang dengan versiPeta berbeda: klien berhenti (4005), token disimpan, dan galat VERSI_BERBEDA muncul", () => {
    const u = siapkan({}, { versiPeta: 2 });
    u.klien.mulai();
    u.soket[0].buka();
    u.soket[0].terima(datang); // versiPeta 1
    expect(u.klien.keadaan).toBe("berhenti");
    expect(u.keadaan.at(-1)).toEqual(["berhenti", 4005]);
    expect(u.pesan).toEqual([{ v: PROTOKOL_VERSI, t: "galat", kode: "VERSI_BERBEDA", pesan: "" }]);
    expect(u.isi.get("jejak:token:K7MPA")).toBe(TOKEN);
    u.majukan(60_000);
    expect(u.soket).toHaveLength(1);
  });

  it("versi peta sama: tersambung seperti biasa", () => {
    const u = siapkan({}, { versiPeta: 1 });
    u.klien.mulai();
    u.soket[0].buka();
    u.soket[0].terima(datang);
    expect(u.klien.keadaan).toBe("tersambung");
  });

  it("bufferedAmount dibaca dari soket yang tersambung, 0 bila tidak ada soket", () => {
    const u = siapkan();
    expect(u.klien.bufferedAmount).toBe(0);
    u.klien.mulai();
    u.soket[0].buka();
    u.soket[0].bufferedAmount = 512;
    expect(u.klien.bufferedAmount).toBe(512);
  });
});
