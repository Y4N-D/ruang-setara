// Pemeriksa anggaran ukuran (spesifikasi JS-15, P-20 sampai P-22).
import { randomBytes } from "node:crypto";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BATAS, KHUSUS_KELAS, namaAsli, teksTabel, ukurBuild } from "../../../../scripts/jejak-setara/anggaran.mjs";

const KB = 1024;
/** Folder build tiruan: berkas acak (tidak termampatkan) dengan ukuran tertentu. */
function buildTiruan(ukuran: { pemainJs?: number; konsolJs?: number; ubin?: number; strip?: number; sfx?: number; akhir?: number; asetLain?: number; peta?: number } = {}) {
  const akar = mkdtempSync(join(tmpdir(), "anggaran-"));
  const dist = join(akar, "client");
  const aset = join(dist, "assets");
  const peta = join(akar, "peta");
  mkdirSync(join(dist, "admin"), { recursive: true });
  mkdirSync(aset, { recursive: true });
  mkdirSync(peta);
  const acak = (n: number) => randomBytes(n);
  const gambar = ["ubin_pagi-AAAAAAAA.png", "ava_1_bawah_jalan-BBBBBBBB.png", "sfx_klik-CCCCCCCC.wav", "sfx_akhir-DDDDDDDD.wav", "obj_halte-EEEEEEEE.png"];
  writeFileSync(join(aset, gambar[0]), acak(ukuran.ubin ?? 5 * KB));
  writeFileSync(join(aset, gambar[1]), acak(ukuran.strip ?? KB));
  writeFileSync(join(aset, gambar[2]), acak(ukuran.sfx ?? 10 * KB));
  writeFileSync(join(aset, gambar[3]), acak(ukuran.akhir ?? 100 * KB));
  writeFileSync(join(aset, gambar[4]), acak(ukuran.asetLain ?? 20 * KB));
  const rujukan = gambar.map((g) => `"/assets/${g}"`).join(",");
  writeFileSync(join(aset, "pemain-11111111.js"), Buffer.concat([Buffer.from(`const a=[${rujukan}];`), acak(ukuran.pemainJs ?? 50 * KB)]));
  writeFileSync(join(aset, "admin-22222222.js"), Buffer.concat([Buffer.from('import("/assets/LayarKelas-33333333.js");'), acak(ukuran.konsolJs ?? 80 * KB)]));
  writeFileSync(join(aset, "LayarKelas-33333333.js"), acak(8 * KB));
  writeFileSync(join(dist, "index.html"), '<script type="module" src="/assets/pemain-11111111.js"></script>');
  writeFileSync(join(dist, "admin", "index.html"), '<script type="module" src="/assets/admin-22222222.js"></script>');
  writeFileSync(join(peta, "kampung.json"), acak(ukuran.peta ?? 10 * KB));
  writeFileSync(join(peta, "kampung_gambar.json"), acak(KB));
  return { dist, peta };
}
const lewat = (l: ReturnType<typeof ukurBuild>) => l.butir.filter((b) => !b.lulus).map((b) => b.nama);

describe("ukurBuild (P-20, P-21)", () => {
  it("build kecil lulus semua; potongan dinamis tercatat milik konsol; jingle akhir tidak masuk aset pemain", () => {
    const l = ukurBuild(buildTiruan());
    expect(lewat(l)).toEqual([]);
    expect(l.dinamis).toEqual([expect.objectContaining({ berkas: "LayarKelas-33333333.js", milik: "konsol" })]);
    const aset = l.butir.find((b) => b.nama === "Seluruh aset layar pemain")!;
    expect(aset.catatan).toBe("4 berkas");
    expect(aset.ukuran).toBe(5 * KB + KB + 10 * KB + 20 * KB);
    expect(KHUSUS_KELAS).toEqual(["sfx_akhir", "musik_kelas"]);
    expect(teksTabel(l)).toContain("| Kode layar pemain (gzip) |");
  });

  it("setiap batas bisa terlampaui", () => {
    expect(lewat(ukurBuild(buildTiruan({ pemainJs: 201 * KB })))).toEqual(["Kode layar pemain (gzip)"]);
    expect(lewat(ukurBuild(buildTiruan({ konsolJs: 351 * KB })))).toEqual(["Kode konsol admin (gzip)"]);
    expect(lewat(ukurBuild(buildTiruan({ ubin: 61 * KB })))).toEqual(["Lembar ubin per masa (terbesar)"]);
    expect(lewat(ukurBuild(buildTiruan({ strip: 7 * KB })))).toEqual(["Strip avatar atau tokoh (terbesar)"]);
    expect(lewat(ukurBuild(buildTiruan({ sfx: 31 * KB })))).toEqual(["Efek suara pendek (terbesar)"]);
    expect(lewat(ukurBuild(buildTiruan({ akhir: 161 * KB })))).toEqual(["Jingle akhir sfx_akhir.wav (terbesar)"]);
    expect(lewat(ukurBuild(buildTiruan({ asetLain: 2100 * KB })))).toEqual(["Seluruh aset layar pemain"]);
    expect(lewat(ukurBuild(buildTiruan({ peta: 61 * KB })))).toEqual(["Kedua berkas peta JSON (gzip)"]);
    expect(BATAS.asetPemain).toBe(2 * KB * KB);
  });

  it("nama asli tanpa hash Vite", () => {
    expect(namaAsli("ubin_pagi-AbCd1234.png")).toBe("ubin_pagi.png");
    expect(namaAsli("sfx_tepat-_x-Y9z0Q.wav")).toBe("sfx_tepat.wav");
  });
});
