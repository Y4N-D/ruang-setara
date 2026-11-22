// Penyaring nama buatan siswa (spesifikasi JS-14, P-43, Lampiran A; AC-14).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DAFTAR_PENYARING, kerangkaNama, namaTertolak } from "../../../../server/jejak-setara/src/ruang/penyaring-nama";
import { NAMA_SAMARAN } from "../../../../server/jejak-setara/src/ruang/nama-samaran";

const { potongan, utuh, izin } = DAFTAR_PENYARING;
const semua = [...potongan, ...utuh];

const ANGKA = (w: string) => w.replace(/a/g, "4").replace(/i/g, "1").replace(/o/g, "0").replace(/e/g, "3").replace(/s/g, "5").replace(/t/g, "7");
const BENTUK: Record<string, (w: string) => string> = {
  dasar: (w) => w,
  besar: (w) => w.toUpperCase(),
  angka: ANGKA,
  ulang: (w) => w.replace(/([aiueo])/, "$1$1$1"),
  spasi: (w) => w.split("").join(" "),
  titik: (w) => w.split("").join("."),
};
const BENTUK_POTONGAN: Record<string, (w: string) => string> = {
  sambung: (w) => `Budi${w[0].toUpperCase()}${w.slice(1)}`,
  mu: (w) => `${w}mu`,
  si: (w) => `si${w}`,
};

/** Nama biasa yang harus lolos: nama Bali, nama umum, dan kata yang memuat potongan kata di daftar. */
const NAMA_BIASA = [
  "Putu Agus", "Made Ayu", "Komang Wira", "Ketut Arta", "Wayan Jingga", "Kadek Dwi", "Nyoman Sari", "Gede Surya", "Ni Luh Putu",
  "Ida Bagus Kris", "Anak Agung Gde", "Cok Agung", "Cok Gde", "Gusti Ngurah", "Dewa Ayu", "I Gede", "Ni Kadek Ayu W", "Basuki",
  "Asuka", "Pantai Kuta", "Santai Aja", "Lantai Dua", "Cukup Keren", "Pucuk Merah", "Pukis Manis", "Kasur Empuk", "Masuk Pak",
  "Asia Raya", "Siapa Aku", "Celengan", "Gelora Muda", "Gelombang", "Taiwan", "Sunda Lima", "Ian Jingga", "Ganjar", "Dicky",
  "Bodhi", "Gilang", "Medan", "Kelingking", "Setiawan", "Tahir", "Cinta", "Tetty", "Sabun", "Begonia", "Lucinda", "Siska",
  "Tasia", "Asuhan", "Budi 07", "Raka 13", "Ian 45", "Rizky", "Dimas", "Sinta", "Nara", "Gita", "Raka", "Bayu", "Agus",
  "Fitri", "Intan", "Joko", "Kartika", "Lestari", "Mega", "Nanda", "Putri", "Rangga", "Rani", "Tasya", "Wulan", "Yoga",
  "Bintang", "Pelangi", "Samudra", "Kilat", "Naga Api", "Kucing Oren", "Memekik",
];

describe("daftar kata (Lampiran A, D-1)", () => {
  it("sama persis dengan Lampiran A spesifikasi JS-14", () => {
    const isi = readFileSync("docs/jejak-setara/specs/JS-14-pengaturan.md", "utf8");
    const lampiran = isi.slice(isi.indexOf("## Lampiran A"));
    const pot: string[] = [];
    const ut: string[] = [];
    for (const baris of lampiran.split("\n")) {
      const k = baris.split("|").map((x) => x.trim());
      if (k.length < 5 || k[1] === "Kelompok" || k[1].startsWith("---")) continue;
      pot.push(...k[2].split(",").map((x) => x.trim()).filter((x) => x && x !== "—"));
      ut.push(...k[3].split(",").map((x) => x.trim()).filter((x) => x && x !== "—"));
    }
    expect([...potongan].sort()).toEqual(pot.sort());
    expect([...utuh].sort()).toEqual(ut.sort());
    expect(izin).toEqual(["memekik"]);
    expect(semua).not.toContain("cok"); // sapaan bangsawan Bali (Cokorda)
  });
});

describe("kerangka nama (P-43)", () => {
  it("huruf kecil, angka diganti huruf, pemisah, huruf tunggal disatukan, huruf berulang dirapatkan", () => {
    expect(kerangkaNama("B4BI")).toEqual(["babi"]);
    expect(kerangkaNama("a n j i n g")).toEqual(["anjing"]);
    expect(kerangkaNama("a.s.u")).toEqual(["asu"]);
    expect(kerangkaNama("Booodoh")).toEqual(["bodoh"]);
    expect(kerangkaNama("Ni Luh Putu")).toEqual(["ni", "luh", "putu"]);
    expect(kerangkaNama("I Gede")).toEqual(["i", "gede"]);
  });
});

describe("penyaring (AC-14)", () => {
  it("setiap kata ditolak dalam bentuk dasar, huruf besar, angka pengganti, vokal diulang, dipisah spasi, dan dipisah titik", () => {
    const lolos: string[] = [];
    for (const w of semua) for (const [nama, f] of Object.entries(BENTUK)) if (!namaTertolak(f(w))) lolos.push(`${nama}:${w}`);
    expect(lolos).toEqual([]);
  });

  it("setiap kata potongan juga ditolak saat disambung nama tanpa spasi, berakhiran mu, dan berawalan si", () => {
    const lolos: string[] = [];
    for (const w of potongan) for (const [nama, f] of Object.entries(BENTUK_POTONGAN)) if (!namaTertolak(f(w))) lolos.push(`${nama}:${w}`);
    expect(lolos).toEqual([]);
  });

  it("ke-260 nama samaran dan nama biasa lolos", () => {
    expect(NAMA_SAMARAN).toHaveLength(260);
    expect(NAMA_SAMARAN.filter(namaTertolak)).toEqual([]);
    expect(NAMA_BIASA.length).toBeGreaterThanOrEqual(80);
    expect(NAMA_BIASA.filter(namaTertolak)).toEqual([]);
  });

  it("potongan tidak diperiksa melintasi spasi, kecuali dua kata yang masing-masing paling panjang 3 huruf", () => {
    expect(namaTertolak("Wayan Jingga")).toBe(false);
    expect(namaTertolak("Sunda Lima")).toBe(false);
    expect(namaTertolak("Ba Bi")).toBe(true);
    expect(namaTertolak("Si A Su")).toBe(true);
  });

  it("paling lama 0,1 ms per nama", () => {
    const n = 5000;
    const mulai = performance.now();
    for (let i = 0; i < n; i++) namaTertolak(NAMA_BIASA[i % NAMA_BIASA.length]);
    expect((performance.now() - mulai) / n).toBeLessThan(0.1);
  });
});
