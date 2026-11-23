// Penanda versi konsol (spesifikasi JS-15, P-26).
import { describe, expect, it } from "vitest";
import { JEDA_PERIKSA_VERSI_MS, namaSkripKonsol, PemeriksaVersi } from "../../admin/versi-konsol";

const html = (nama: string) => `<script type="module" crossorigin src="/assets/${nama}"></script>`;

describe("PemeriksaVersi (P-26)", () => {
  it("nama skrip konsol dari HTML atau alamat", () => {
    expect(namaSkripKonsol(html("admin-AbC_d-12.js"))).toBe("admin-AbC_d-12.js");
    expect(namaSkripKonsol("http://127.0.0.1:4310/assets/admin-Xy9.js")).toBe("admin-Xy9.js");
    expect(namaSkripKonsol(html("pemain-1.js"))).toBeNull();
  });

  it("melapor versi baru bila /admin/ merujuk skrip lain; paling sering sekali per 60 detik", async () => {
    let jam = 1_000_000;
    let ambil = 0;
    let isi = html("admin-lama.js");
    const p = new PemeriksaVersi("admin-lama.js", { sekarang: () => jam, ambil: async () => (ambil++, isi) });
    expect(await p.periksa()).toBe(false);
    isi = html("admin-baru.js");
    jam += JEDA_PERIKSA_VERSI_MS - 1;
    expect(await p.periksa()).toBe(false);
    expect(ambil).toBe(1);
    jam += 1;
    expect(await p.periksa()).toBe(true);
    expect(ambil).toBe(2);
    jam += 1;
    expect(await p.periksa()).toBe(true);
    expect(ambil).toBe(2);
    expect(JEDA_PERIKSA_VERSI_MS).toBe(60_000);
  });

  it("tanpa nama awal (pengembangan) dan saat jaringan putus tidak pernah melapor", async () => {
    expect(await new PemeriksaVersi(null, { sekarang: () => 0, ambil: async () => html("admin-baru.js") }).periksa()).toBe(false);
    const putus = new PemeriksaVersi("admin-lama.js", { sekarang: () => 0, ambil: () => Promise.reject(new Error("putus")) });
    expect(await putus.periksa()).toBe(false);
  });
});
