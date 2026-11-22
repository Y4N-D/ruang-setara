// Worker saat "Jejak: hentikan" aktif (spesifikasi JS-22, P-12; AC-8): 503 untuk API dan WebSocket tanpa menyentuh D1.
import { describe, expect, it } from "vitest";
import { PROTOKOL_VERSI } from "../../inti/versi";
import worker from "../../../../server/jejak-setara/src/index";

type Env = Parameters<typeof worker.fetch>[1];
const D1_TERLARANG = new Proxy(
  {},
  {
    get: () => () => {
      throw new Error("D1 tidak boleh disentuh saat darurat");
    },
  },
);
const dasar = {
  LINGKUNGAN: "uji",
  DB: D1_TERLARANG,
  ASSETS: { fetch: async () => new Response("aset statis") },
  RUANG: {},
};
const env = (darurat: boolean) =>
  ({ ...dasar, ...(darurat ? { DARURAT: "1" } : {}) }) as unknown as Env;

describe("darurat di Worker", () => {
  it("semua /api/* kecuali /api/sehat dan semua /ws/* dijawab 503 LAYANAN_BERHENTI", async () => {
    for (const [jalur, tajuk] of [
      ["/api/ruang", {}],
      ["/api/masuk", {}],
      ["/api/publik/ruang/K7MPA", {}],
      ["/api/tidak-ada", {}],
      ["/ws/ruang/K7MPA", { Upgrade: "websocket" }],
      [
        "/ws/kelas/0b2f6a9e-1c3d-4e5f-8a7b-9c0d1e2f3a4b",
        { Upgrade: "websocket" },
      ],
    ] as const) {
      const j = await worker.fetch(
        new Request(`https://contoh.test${jalur}`, { headers: tajuk }),
        env(true),
      );
      expect(j.status, jalur).toBe(503);
      expect(await j.json()).toEqual({
        galat: {
          kode: "LAYANAN_BERHENTI",
          pesan: "Layanan sedang dihentikan sementara. Coba lagi nanti.",
        },
      });
    }
  });

  it("/api/sehat tetap menjawab dengan darurat: true; tanpa darurat bentuknya tidak berubah", async () => {
    expect(
      await (
        await worker.fetch(
          new Request("https://contoh.test/api/sehat"),
          env(true),
        )
      ).json(),
    ).toEqual({ ok: true, protokol: PROTOKOL_VERSI, lingkungan: "uji", darurat: true });
    expect(
      await (
        await worker.fetch(
          new Request("https://contoh.test/api/sehat"),
          env(false),
        )
      ).json(),
    ).toEqual({ ok: true, protokol: PROTOKOL_VERSI, lingkungan: "uji" });
  });

  it("halaman statis tetap disajikan", async () => {
    expect(
      await (
        await worker.fetch(new Request("https://contoh.test/admin/"), env(true))
      ).text(),
    ).toBe("aset statis");
  });
});
