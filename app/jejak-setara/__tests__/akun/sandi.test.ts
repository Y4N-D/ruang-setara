// Hash sandi, hash tiruan, kunci konsol, dan sandi sementara (spesifikasi JS-04, P-1 sampai P-5, P-34; AC-1, AC-2).
// WebCrypto Node. Nilai pembanding dihitung terpisah dengan node:crypto (pbkdf2Sync dan createHmac).
import { createHmac, pbkdf2Sync, webcrypto } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { acakBerbenih, benih } from "../../inti/acak";
import { ABJAD_KODE } from "../../inti/aturan";
import {
  bacaIterasi,
  buatHash,
  cocokkanSandi,
  dariBase64,
  hashSandi,
  hashTiruan,
  ITERASI_MAKS,
  ITERASI_MIN,
  keBase64,
  kunciKonsol,
  POLA_SANDI_SEMENTARA,
  sandiSementara,
  type Byte,
} from "../../../../server/jejak-setara/src/auth/sandi";

const KUNCI = "kunci-sandi-uji";
const ITERASI = 1_000; // cukup untuk uji bentuk; nilai target 15.000 diuji di uji server

/** Pembanding mandiri: base64(HMAC-SHA256(kunci, PBKDF2-HMAC-SHA256(NFC(sandi), garam, iterasi, 32 byte))). */
function hashPembanding(sandi: string, garam: Uint8Array, iterasi: number, kunci: string): string {
  const turunan = pbkdf2Sync(Buffer.from(sandi.normalize("NFC"), "utf8"), garam, iterasi, 32, "sha256");
  return createHmac("sha256", kunci).update(turunan).digest("base64");
}

/** Sumber byte berbenih: hasilnya sama di setiap mesin (catatan PLAN "Semua fitur (9 Nov 2026)"). */
function byteBerbenih(nama: string): (n: number) => Byte {
  const acak = acakBerbenih(benih(nama));
  return (n) => Uint8Array.from({ length: n }, () => Math.floor(acak() * 256));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("bentuk hash (P-1)", () => {
  it("hash berupa base64 32 byte, garam base64 16 byte, iterasi tersimpan", async () => {
    const h = await buatHash("sepeda biru pagi", ITERASI, KUNCI);
    expect(h.hash_sandi).toMatch(/^[A-Za-z0-9+/]{43}=$/);
    expect(h.garam).toMatch(/^[A-Za-z0-9+/]{22}==$/);
    expect(dariBase64(h.garam)).toHaveLength(16);
    expect(h.iterasi).toBe(ITERASI);
  });

  it("sama dengan pembanding node:crypto (PBKDF2 lalu HMAC dengan KUNCI_SANDI)", async () => {
    const garam = Uint8Array.from({ length: 16 }, (_, i) => i * 7);
    expect(await hashSandi("sepeda biru pagi", garam, ITERASI, KUNCI)).toBe(hashPembanding("sepeda biru pagi", garam, ITERASI, KUNCI));
    expect(await hashSandi("sepeda biru pagi", garam, 2_000, KUNCI)).toBe(hashPembanding("sepeda biru pagi", garam, 2_000, KUNCI));
  });

  it("garam acak: dua hash sandi yang sama berbeda", async () => {
    const a = await buatHash("sepeda biru pagi", ITERASI, KUNCI);
    const b = await buatHash("sepeda biru pagi", ITERASI, KUNCI);
    expect(a.garam).not.toBe(b.garam);
    expect(a.hash_sandi).not.toBe(b.hash_sandi);
  });

  it("garam dari sumber byte yang diberikan", async () => {
    const a = await buatHash("sepeda biru pagi", ITERASI, KUNCI, byteBerbenih("garam"));
    const b = await buatHash("sepeda biru pagi", ITERASI, KUNCI, byteBerbenih("garam"));
    expect(a).toEqual(b);
  });

  it("base64 bolak-balik", () => {
    const byte = Uint8Array.from({ length: 256 }, (_, i) => i);
    expect(dariBase64(keBase64(byte))).toEqual(byte);
  });
});

describe("pencocokan (P-1, P-4)", () => {
  it("cocok untuk sandi benar, tidak untuk sandi lain, kunci lain, atau iterasi lain", async () => {
    const h = await buatHash("sepeda biru pagi", ITERASI, KUNCI);
    expect(await cocokkanSandi("sepeda biru pagi", h, KUNCI)).toBe(true);
    expect(await cocokkanSandi("sepeda biru pagi ", h, KUNCI)).toBe(false);
    expect(await cocokkanSandi("Sepeda biru pagi", h, KUNCI)).toBe(false);
    expect(await cocokkanSandi("sepeda biru pagi", h, "kunci-lain")).toBe(false);
    expect(await cocokkanSandi("sepeda biru pagi", { ...h, iterasi: ITERASI + 1 }, KUNCI)).toBe(false);
  });

  it("dinormalkan NFC: é tersusun dan é terurai menghasilkan hash yang sama", async () => {
    const h = await buatHash("kopi café pagi", ITERASI, KUNCI);
    expect(await cocokkanSandi("kopi café pagi", h, KUNCI)).toBe(true);
  });

  it("hash tiruan: satu PBKDF2 dengan garam 16 byte nol dan target iterasi", async () => {
    const turunkan = vi.spyOn(webcrypto.subtle, "deriveBits");
    await hashTiruan("tebakan", 1_234, KUNCI);
    expect(turunkan).toHaveBeenCalledTimes(1);
    const [algoritma] = turunkan.mock.calls[0] as unknown as [{ salt: Uint8Array; iterations: number; hash: string; name: string }];
    expect(algoritma).toMatchObject({ name: "PBKDF2", hash: "SHA-256", iterations: 1_234 });
    expect(Array.from(algoritma.salt)).toEqual(new Array(16).fill(0));
  });

  it("satu panggilan hashSandi = satu PBKDF2 (dasar hitungan P-3)", async () => {
    const turunkan = vi.spyOn(webcrypto.subtle, "deriveBits");
    const h = await buatHash("sepeda biru pagi", ITERASI, KUNCI);
    await cocokkanSandi("sepeda biru pagi", h, KUNCI);
    expect(turunkan).toHaveBeenCalledTimes(2);
  });
});

describe("target iterasi dan kunci konsol (P-2, P-34)", () => {
  it("ITERASI_SANDI sah hanya bilangan bulat 1.000 sampai 100.000", () => {
    expect([ITERASI_MIN, ITERASI_MAKS]).toEqual([1_000, 100_000]);
    expect(bacaIterasi("15000")).toBe(15_000);
    expect(bacaIterasi("1000")).toBe(1_000);
    expect(bacaIterasi("100000")).toBe(100_000);
    for (const salah of [undefined, "", "999", "100001", "15000.5", "1e4", "-15000", "lima belas ribu", "0x3a98"]) expect(bacaIterasi(salah)).toBeNull();
  });

  it("kunciKonsol null bila KUNCI_SANDI atau KUNCI_IP kosong, atau ITERASI_SANDI tidak sah", () => {
    const lengkap = { KUNCI_SANDI: "s", KUNCI_IP: "i", ITERASI_SANDI: "15000" };
    expect(kunciKonsol(lengkap)).toEqual({ kunciSandi: "s", kunciIp: "i", iterasi: 15_000 });
    expect(kunciKonsol({ ...lengkap, KUNCI_SANDI: undefined })).toBeNull();
    expect(kunciKonsol({ ...lengkap, KUNCI_SANDI: "" })).toBeNull();
    expect(kunciKonsol({ ...lengkap, KUNCI_IP: undefined })).toBeNull();
    expect(kunciKonsol({ ...lengkap, ITERASI_SANDI: undefined })).toBeNull();
    expect(kunciKonsol({ ...lengkap, ITERASI_SANDI: "200000" })).toBeNull();
  });
});

describe("sandi sementara (P-5, AC-2)", () => {
  it("10.000 sandi dari crypto sungguhan berpola XXXX-XXXX-XXXX-XXXX dan memakai ke-31 karakter", () => {
    const dipakai = new Set<string>();
    for (let i = 0; i < 10_000; i++) {
      const s = sandiSementara();
      expect(s).toHaveLength(19);
      expect(POLA_SANDI_SEMENTARA.test(s)).toBe(true);
      for (const c of s.replaceAll("-", "")) dipakai.add(c);
    }
    expect(dipakai.size).toBe(31);
    expect([...dipakai].every((c) => ABJAD_KODE.includes(c))).toBe(true);
    for (const c of "0O1IL") expect(dipakai.has(c)).toBe(false);
  });

  it("pemetaan byte merata: setiap karakter berasal dari tepat 8 nilai byte 0–247", () => {
    const hitung = new Map<string, number>();
    for (let b = 0; b < 248; b++) {
      const s = sandiSementara((n) => new Uint8Array(n).fill(b));
      const c = ABJAD_KODE[b % 31];
      expect(s).toBe(`${c.repeat(4)}-${c.repeat(4)}-${c.repeat(4)}-${c.repeat(4)}`);
      hitung.set(c, (hitung.get(c) ?? 0) + 1);
    }
    expect(hitung.size).toBe(31);
    expect([...hitung.values()].every((n) => n === 8)).toBe(true);
  });

  it("byte 248–255 dibuang agar tidak ada bias modulo", () => {
    const urutan = [Uint8Array.from([248, 255, 0, 30, 31, 249, 61, 62, ...new Array(16).fill(250)]), new Uint8Array(24).fill(1)];
    let i = 0;
    const s = sandiSementara(() => urutan[i++]);
    const awal = ABJAD_KODE[0] + ABJAD_KODE[30] + ABJAD_KODE[0] + ABJAD_KODE[30];
    expect(s).toBe(`${awal}-${ABJAD_KODE[0]}${ABJAD_KODE[1].repeat(3)}-${ABJAD_KODE[1].repeat(4)}-${ABJAD_KODE[1].repeat(4)}`);
  });

  it("sebaran 160.000 karakter dari sumber byte berbenih lolos uji chi² (p = 0,01)", () => {
    const ambil = byteBerbenih("sandi-sementara");
    const hitung = new Map<string, number>();
    for (let i = 0; i < 10_000; i++) for (const c of sandiSementara(ambil).replaceAll("-", "")) hitung.set(c, (hitung.get(c) ?? 0) + 1);
    expect(hitung.size).toBe(31);
    const harapan = 160_000 / 31;
    const chi2 = [...hitung.values()].reduce((s, n) => s + (n - harapan) ** 2 / harapan, 0);
    expect(chi2).toBeLessThan(50.89); // derajat bebas 30; hasilnya selalu sama untuk benih ini
  });
});
