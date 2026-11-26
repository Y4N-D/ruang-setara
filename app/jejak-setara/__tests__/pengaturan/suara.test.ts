// Pemutar suara layar pemain dan layar kelas (spesifikasi JS-14, P-20 sampai P-23 dan P-29 sampai P-31; AC-6, AC-7),
// serta musik latar layar kelas (spesifikasi JS-21, P-1 sampai P-5 dan P-13 sampai P-15; AC-1 sampai AC-3 dan AC-8 sampai AC-11),
// dengan konteks audio tiruan seperti sound.test.ts Sehari Setara.
import { describe, expect, it } from "vitest";
import { buatSuaraKelas, DUA_MENIT_MS, lewatDuaMenit, PELAN_DETIK, VOLUME_KELAS } from "../../admin/kelas/suara-kelas";
import { musikSeharusnya, posisiMusik } from "../../admin/kelas/tampilan-kelas";
import { panjangKetik } from "../../pemain/ketik";
import { buatPemutarSuara, bunyiTeksJatuh, JEDA_SUARA_MS, SUARA_HP, VOLUME_SUARA, type KonteksMirip, type NamaSuara } from "../../pemain/suara";

function tiruan(state = "running") {
  const c = { dibuat: 0, gain: 0, diputar: [] as number[], lanjut: 0, dimuat: [] as string[] };
  const konteks = (): KonteksMirip => {
    c.dibuat++;
    return {
      state,
      destination: {},
      createGain: () => ({
        gain: {
          get value() {
            return c.gain;
          },
          set value(v: number) {
            c.gain = v;
          },
        },
        connect: () => undefined,
      }),
      createBufferSource: () => {
        const s = { buffer: null as unknown, playbackRate: { value: 1 }, connect: () => undefined, start: () => c.diputar.push(s.playbackRate.value) };
        return s;
      },
      decodeAudioData: async () => ({ ok: true }),
      resume: async () => {
        c.lanjut++;
      },
    };
  };
  return { c, konteks };
}
const tunggu = () => new Promise((r) => setTimeout(r, 0));

describe("pemutar layar pemain (P-20 sampai P-23)", () => {
  it("sebelum dinyalakan tidak ada konteks dan tidak ada unduhan", () => {
    const { c, konteks } = tiruan();
    const p = buatPemutarSuara({ buatKonteks: konteks, muat: async (n) => (c.dimuat.push(n), new ArrayBuffer(4)) });
    p.putar("kejadian");
    expect(c.dibuat).toBe(0);
    expect(c.dimuat).toEqual([]);
    expect(p.nyala()).toBe(false);
  });

  it("dinyalakan: satu konteks, sembilan berkas tanpa jingle akhir, volume 60%", async () => {
    const { c, konteks } = tiruan();
    const p = buatPemutarSuara({ buatKonteks: konteks, muat: async (n) => (c.dimuat.push(n), new ArrayBuffer(4)) });
    p.nyalakan();
    p.nyalakan();
    await tunggu();
    expect(c.dibuat).toBe(1);
    expect(SUARA_HP).toHaveLength(9);
    expect([...c.dimuat].sort()).toEqual([...SUARA_HP].sort());
    expect(c.dimuat).not.toContain("akhir");
    expect(c.gain).toBe(VOLUME_SUARA);
  });

  it("bunyi hanya bila nyala dan berkas siap; jeda kejadian dan kotak; laju bunyi teks", async () => {
    let jam = 0;
    const { c, konteks } = tiruan();
    const p = buatPemutarSuara({ buatKonteks: konteks, muat: async () => new ArrayBuffer(4), kini: () => jam });
    p.nyalakan();
    await tunggu();
    await tunggu();
    p.putar("kejadian");
    p.putar("kejadian");
    jam = JEDA_SUARA_MS.kejadian ?? 0;
    p.putar("kejadian");
    p.putar("kotak");
    p.putar("kotak");
    p.putar("teks", 1.2);
    expect(c.diputar).toEqual([1, 1, 1, 1.2]);
    p.matikan();
    p.putar("tepat");
    expect(c.diputar).toHaveLength(4);
  });

  it("tanpa Web Audio: tidak ada galat dan suara tidak berbunyi", () => {
    const p = buatPemutarSuara({ buatKonteks: () => undefined });
    expect(() => {
      p.nyalakan();
      p.putar("tepat" as NamaSuara);
    }).not.toThrow();
    expect(p.nyala()).toBe(false);
  });

  it("bunyi teks setiap dua huruf atau angka; spasi dan tanda baca tidak dihitung", () => {
    expect(bunyiTeksJatuh("Ayu", 0, 1)).toBe(true);
    expect(bunyiTeksJatuh("Ayu", 1, 2)).toBe(false);
    expect(bunyiTeksJatuh("Ayu", 2, 3)).toBe(true);
    expect(bunyiTeksJatuh("A, b", 1, 3)).toBe(false);
    expect(bunyiTeksJatuh("A, b", 3, 4)).toBe(false);
  });

  it("teks per huruf 40 huruf per detik (P-24)", () => {
    expect(panjangKetik(0, 280)).toBe(0);
    expect(panjangKetik(1000, 280)).toBe(40);
    expect(panjangKetik(7000, 280)).toBe(280);
    expect(panjangKetik(60_000, 280)).toBe(280);
  });
});

describe("suara layar kelas (P-29 sampai P-31)", () => {
  it("tertahan sebelum ketukan; sesudah ketukan konteks dibuat dan tiga berkas diunduh", async () => {
    const { c, konteks } = tiruan();
    const dimuat: string[] = [];
    const s = buatSuaraKelas({ buatKonteks: konteks, muat: async (n) => (dimuat.push(n), new ArrayBuffer(4)) });
    expect(s.putar("hitung")).toBe(false);
    s.sentuh();
    await tunggu();
    await tunggu();
    expect(c.dibuat).toBe(1);
    expect(dimuat.sort()).toEqual(["akhir", "hitung", "peringatan"]);
    expect(s.putar("akhir")).toBe(true);
    expect(c.diputar).toHaveLength(1);
  });

  it("konteks yang ditahan peramban dilaporkan tertahan", () => {
    const { konteks } = tiruan("suspended");
    const s = buatSuaraKelas({ buatKonteks: konteks, muat: async () => new ArrayBuffer(4) });
    s.sentuh();
    expect(s.putar("hitung")).toBe(false);
  });

  it("dua menit hanya saat sisa waktu turun melewati 120 detik, bukan saat dimuat", () => {
    expect(DUA_MENIT_MS).toBe(120_000);
    expect(lewatDuaMenit(null, 100_000)).toBe(false);
    expect(lewatDuaMenit(121_000, 120_000)).toBe(true);
    expect(lewatDuaMenit(120_000, 119_000)).toBe(false);
    expect(lewatDuaMenit(240_000, 239_000)).toBe(false);
  });
});

/** JS-21: konteks tiruan dengan waktu, penguat berjadwal, sumber berulang, dan peristiwa `statechange`. */
function tiruanMusik(awal = "running") {
  const c = {
    waktu: 0,
    dibuat: 0,
    lanjut: 0,
    gagal: 0,
    dimuat: [] as string[],
    sumber: [] as { buffer: unknown; loop: boolean; mulai?: [number | undefined, number | undefined]; henti?: number }[],
    penguat: [] as { nilai: number; jadwal: [string, number, number][] }[],
    dengar: [] as (() => void)[],
  };
  const k = {
    state: awal,
    destination: {},
    get currentTime() {
      return c.waktu;
    },
    createGain: () => {
      const p = { nilai: 1, jadwal: [] as [string, number, number][] };
      c.penguat.push(p);
      return {
        gain: {
          get value() {
            return p.nilai;
          },
          set value(v: number) {
            p.nilai = v;
          },
          setValueAtTime: (v: number, t: number) => p.jadwal.push(["tetap", v, t]),
          linearRampToValueAtTime: (v: number, t: number) => p.jadwal.push(["landai", v, t]),
          cancelScheduledValues: (t: number) => p.jadwal.push(["batal", 0, t]),
        },
        connect: () => undefined,
      };
    },
    createBufferSource: () => {
      const s = {
        buffer: null as unknown,
        loop: false,
        mulai: undefined as [number | undefined, number | undefined] | undefined,
        henti: undefined as number | undefined,
        connect: () => undefined,
        start(kapan?: number, posisi?: number) {
          s.mulai = [kapan, posisi];
        },
        stop(kapan?: number) {
          s.henti = kapan ?? -1;
        },
      };
      c.sumber.push(s);
      return s;
    },
    decodeAudioData: async (data: ArrayBuffer) => ({ duration: data.byteLength === 8 ? 38.4 : 0.2 }),
    resume: async () => {
      c.lanjut++;
      k.state = "running";
      for (const f of c.dengar) f();
    },
    addEventListener: (_jenis: string, f: () => void) => {
      c.dengar.push(f);
    },
  };
  const buatKonteks = () => {
    c.dibuat++;
    return k;
  };
  const muat = async (nama: string) => {
    c.dimuat.push(nama);
    if (nama === "musik" && c.gagal > 0) {
      c.gagal--;
      throw new Error("gagal");
    }
    return new ArrayBuffer(nama === "musik" ? 8 : 4);
  };
  const musik = () => c.sumber.filter((s) => s.loop);
  return { c, buatKonteks, muat, musik };
}
const selesai = async () => {
  for (let i = 0; i < 6; i++) await tunggu();
};

describe("musik layar kelas (JS-21, P-1 sampai P-5 dan P-13 sampai P-15)", () => {
  it("tertahan sebelum ketukan; sesudah ketukan empat berkas diunduh dan musik berulang dengan masuk pelan", async () => {
    const t = tiruanMusik();
    const s = buatSuaraKelas({ buatKonteks: t.buatKonteks, muat: t.muat });
    const riwayat: string[] = [];
    s.pantau((k) => riwayat.push(k));
    s.pilihMusik(true);
    expect(s.musik(true)).toBe("tertahan");
    expect(t.c.dimuat).toEqual([]);
    s.sentuh();
    await selesai();
    expect(t.c.dimuat.sort()).toEqual(["akhir", "hitung", "musik", "peringatan"]);
    expect(riwayat).toEqual(["tertahan", "diam", "berbunyi"]);
    expect(t.c.penguat[0].nilai).toBe(VOLUME_KELAS);
    const [m] = t.musik();
    expect(m.mulai).toEqual([0, 0]);
    expect(t.c.penguat.at(-1)?.jadwal).toEqual([
      ["tetap", 0, 0],
      ["landai", 1, PELAN_DETIK],
    ]);
  });

  it("berhenti dengan keluar pelan, lalu lanjut dari posisi terakhir modulo 38,4 detik (P-4, P-5)", async () => {
    const t = tiruanMusik();
    const s = buatSuaraKelas({ buatKonteks: t.buatKonteks, muat: t.muat });
    s.pilihMusik(true);
    s.sentuh();
    await selesai();
    expect(s.musik(true)).toBe("berbunyi");
    t.c.waktu = 50;
    expect(s.musik(false)).toBe("diam");
    const [pertama] = t.musik();
    expect(pertama.henti).toBeCloseTo(50 + PELAN_DETIK);
    expect(t.c.penguat.at(-1)?.jadwal.slice(-3)).toEqual([
      ["batal", 0, 50],
      ["tetap", 1, 50],
      ["landai", 0, 50 + PELAN_DETIK],
    ]);
    t.c.waktu = 60;
    expect(s.musik(true)).toBe("berbunyi");
    expect(t.musik()[1].mulai?.[1]).toBeCloseTo(50 - 38.4);
    s.musik(true);
    expect(t.musik()).toHaveLength(2);
  });

  it("musik mati tidak mengunduh berkas musik; menyalakannya mengunduh sekali (P-13)", async () => {
    const t = tiruanMusik();
    const s = buatSuaraKelas({ buatKonteks: t.buatKonteks, muat: t.muat });
    s.pilihMusik(false);
    s.sentuh();
    await selesai();
    expect(t.c.dimuat.sort()).toEqual(["akhir", "hitung", "peringatan"]);
    s.pilihMusik(true);
    s.pilihMusik(true);
    s.sentuh();
    await selesai();
    expect(t.c.dimuat.filter((n) => n === "musik")).toHaveLength(1);
  });

  it("konteks ditahan peramban: tertahan sampai dilanjutkan, lalu berbunyi (P-14)", async () => {
    const t = tiruanMusik("suspended");
    const s = buatSuaraKelas({ buatKonteks: t.buatKonteks, muat: t.muat });
    s.pilihMusik(true);
    s.musik(true);
    s.sentuh();
    await selesai();
    expect(s.musik(true)).toBe("tertahan");
    expect(t.musik()).toHaveLength(0);
    s.sentuh();
    await selesai();
    expect(t.c.lanjut).toBe(1);
    expect(t.c.dibuat).toBe(1);
    expect(s.musik(true)).toBe("berbunyi");
  });

  it("unduhan musik gagal: diam, efek tetap berbunyi, dan dicoba sekali lagi pada ketukan berikutnya (P-15)", async () => {
    const t = tiruanMusik();
    t.c.gagal = 1;
    const s = buatSuaraKelas({ buatKonteks: t.buatKonteks, muat: t.muat });
    s.pilihMusik(true);
    s.musik(true);
    s.sentuh();
    await selesai();
    expect(s.musik(true)).toBe("diam");
    expect(s.putar("hitung")).toBe(true);
    s.sentuh();
    await selesai();
    expect(t.c.dimuat.filter((n) => n === "musik")).toHaveLength(2);
    expect(s.musik(true)).toBe("berbunyi");
  });

  it("gagal dua kali: tidak dicoba lagi dan musik tetap diam (P-15)", async () => {
    const t = tiruanMusik();
    t.c.gagal = 5;
    const s = buatSuaraKelas({ buatKonteks: t.buatKonteks, muat: t.muat });
    s.pilihMusik(true);
    s.musik(true);
    for (let i = 0; i < 3; i++) {
      s.sentuh();
      await selesai();
    }
    expect(t.c.dimuat.filter((n) => n === "musik")).toHaveLength(2);
    expect(s.musik(true)).toBe("diam");
  });

  it("tanpa Web Audio: tertahan sebelum ketukan, lalu diam tanpa galat (P-15)", () => {
    const s = buatSuaraKelas({ buatKonteks: () => undefined, muat: async () => new ArrayBuffer(4) });
    s.pilihMusik(true);
    expect(s.musik(true)).toBe("tertahan");
    expect(() => s.sentuh()).not.toThrow();
    expect(s.musik(true)).toBe("diam");
    expect(s.putar("akhir")).toBe(false);
  });

  it("syarat musik untuk setiap status ruang dan keadaan sambungan (P-1, P-2; AC-11)", () => {
    const status = ["lobi", "hitung_mundur", "main", "jeda", "selesai", "pembahasan", "ditutup", null];
    const sambungan = ["menyambung", "tersambung", "menyambungUlang", "terputus", "diganti", "ditutup", "tidakAda"];
    for (const st of status) {
      for (const sb of sambungan) {
        const harap = (st === "lobi" || st === "main") && !["terputus", "diganti", "ditutup", "tidakAda"].includes(sb);
        expect(musikSeharusnya({ status: st, sambungan: sb, suaraNyala: true, musikNyala: true }), `${st} ${sb}`).toBe(harap);
      }
    }
    expect(musikSeharusnya({ status: "main", sambungan: "tersambung", suaraNyala: false, musikNyala: true })).toBe(false);
    expect(musikSeharusnya({ status: "main", sambungan: "tersambung", suaraNyala: true, musikNyala: false })).toBe(false);
  });

  it("posisi musik modulo panjang berkas (P-4)", () => {
    expect(posisiMusik(0, 50, 38.4)).toBeCloseTo(11.6);
    expect(posisiMusik(30, 10, 38.4)).toBeCloseTo(1.6);
    expect(posisiMusik(5, -1, 38.4)).toBe(5);
    expect(posisiMusik(5, 10, 0)).toBe(0);
  });
});
