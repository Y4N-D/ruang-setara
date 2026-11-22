// Pemutar suara layar pemain dan layar kelas (spesifikasi JS-14, P-20 sampai P-23 dan P-29 sampai P-31; AC-6, AC-7),
// dengan konteks audio tiruan seperti sound.test.ts Sehari Setara.
import { describe, expect, it } from "vitest";
import { buatSuaraKelas, DUA_MENIT_MS, lewatDuaMenit } from "../../admin/kelas/suara-kelas";
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
