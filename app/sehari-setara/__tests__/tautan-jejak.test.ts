// Tautan layar judul ke Jejak Setara (spesifikasi JS-16c; AC-2, AC-5).
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ALAMAT_JEJAK_SETARA } from "../../tautan-jejak-setara";
import { copy } from "../content/copy";

describe("JS-16c: tautan Jejak Setara di layar judul", () => {
  it("alamat produksi HTTPS di satu konstanta, berakhir dengan garis miring", () => {
    expect(ALAMAT_JEJAK_SETARA).toBe("https://jejak-setara.ruangsetara.workers.dev/");
  });

  it("teks tautan dan keterangan pembaca layar berasal dari copy", () => {
    expect(copy.title.jejak).toBe("Main bersama kelas di Jejak Setara");
    expect(copy.title.jejakSitusLain).toBe("(situs lain)");
  });

  it("komponen Sehari Setara tidak menulis alamat penuh; layar judul memakai konstanta tanpa target", () => {
    const folder = new URL("../ui/", import.meta.url);
    for (const nama of readdirSync(folder).filter((n) => n.endsWith(".tsx"))) {
      expect(readFileSync(new URL(nama, folder), "utf8"), nama).not.toMatch(/https?:\/\//);
    }
    const judul = readFileSync(new URL("Title.tsx", folder), "utf8");
    expect(judul).toContain('<a className="ss-title-link" href={ALAMAT_JEJAK_SETARA} aria-disabled={waiting} onClick={onGallery}>');
    expect(judul).not.toMatch(/target=/);
  });
});
