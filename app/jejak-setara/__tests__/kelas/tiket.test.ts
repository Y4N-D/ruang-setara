// Tiket layar kelas (spesifikasi JS-10, P-12 dan P-13; AC-9).
import { describe, expect, it } from "vitest";
import { buatTiket, periksaTiket, TIKET_MS } from "../../../../server/jejak-setara/src/auth/tiket";

const KUNCI = "kunci-tiket-uji";
const RUANG = "0b2f6a9e-1c3d-4e5f-8a7b-9c0d1e2f3a4b";
const T0 = 1_800_000_000_000;
const byteTetap = (n: number) => Uint8Array.from({ length: n }, (_, i) => i + 1);

describe("tiket layar kelas", () => {
  it("tiket sah diterima dan membawa nonce serta kedaluwarsa 60 detik", async () => {
    const { tiket, kedaluwarsaPada } = await buatTiket(KUNCI, RUANG, T0, byteTetap);
    expect(kedaluwarsaPada).toBe(T0 + TIKET_MS);
    expect(tiket).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/);
    const hasil = await periksaTiket(KUNCI, tiket, RUANG, T0 + 59_999);
    expect(hasil).toEqual({ ok: true, nonce: "AQIDBAUGBwgJCgsMDQ4PEA", kedaluwarsa: T0 + TIKET_MS });
  });

  it("menolak tiket kedaluwarsa, untuk ruang lain, berkunci lain, rusak, atau terlalu panjang", async () => {
    const { tiket } = await buatTiket(KUNCI, RUANG, T0);
    expect((await periksaTiket(KUNCI, tiket, RUANG, T0 + TIKET_MS + 1)).ok).toBe(false);
    expect((await periksaTiket(KUNCI, tiket, "ruang-lain", T0)).ok).toBe(false);
    expect((await periksaTiket("kunci-lain", tiket, RUANG, T0)).ok).toBe(false);
    const [isi, tanda] = tiket.split(".");
    expect((await periksaTiket(KUNCI, `${isi}x.${tanda}`, RUANG, T0)).ok).toBe(false);
    const ganti = tanda.startsWith("A") ? "B" : "A";
    expect((await periksaTiket(KUNCI, `${isi}.${ganti}${tanda.slice(1)}`, RUANG, T0)).ok).toBe(false);
    expect((await periksaTiket(KUNCI, isi, RUANG, T0)).ok).toBe(false);
    expect((await periksaTiket(KUNCI, "", RUANG, T0)).ok).toBe(false);
    expect((await periksaTiket(KUNCI, "a".repeat(600), RUANG, T0)).ok).toBe(false);
  });

  it("menolak tiket yang kedaluwarsanya lebih jauh dari 60 detik (dibuat dengan jam yang diubah)", async () => {
    const { tiket } = await buatTiket(KUNCI, RUANG, T0 + 3_600_000);
    expect((await periksaTiket(KUNCI, tiket, RUANG, T0)).ok).toBe(false);
  });
});
