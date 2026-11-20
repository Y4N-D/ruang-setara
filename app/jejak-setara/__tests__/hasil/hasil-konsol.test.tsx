// Bagian hasil di halaman ruang tanpa peramban (spesifikasi JS-11, P-15 dan P-20; AC-11): pesan kiriman tertunda
// tampil di atas hasil yang sedang dimuat. Muat ulang sesudah "Keluarkan" diuji di hasil.uji.ts.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BagianHasil } from "../../admin/halaman/HasilRuang";
import { TEKS_KONSOL } from "../../teks-konsol";

const t = TEKS_KONSOL.hasil;
const bukanSesi = () => false;
const diam = () => {};

describe("bagian hasil (P-15, P-20)", () => {
  it("kiriman tertunda: pesan tampil di atas \"Memuat hasil…\", di dalam wilayah berjudul Hasil ronde", () => {
    const html = renderToStaticMarkup(<BagianHasil id="r-1" kunci="selesai:0:1" menyimpan galatSesi={bukanSesi} hilang={diam} />);
    expect(html).toContain('aria-labelledby="js-hasil-judul"');
    expect(html).toContain(`<h2 id="js-hasil-judul">${t.judul}</h2>`);
    expect(html).toContain(t.menyimpan);
    expect(html.indexOf(t.menyimpan)).toBeLessThan(html.indexOf(t.memuat));
  });

  it("tanpa kiriman tertunda, pesannya tidak tampil", () => {
    const html = renderToStaticMarkup(<BagianHasil id="r-1" kunci="ditutup" menyimpan={false} galatSesi={bukanSesi} hilang={diam} />);
    expect(html).not.toContain(t.menyimpan);
    expect(html).toContain(t.memuat);
  });
});
