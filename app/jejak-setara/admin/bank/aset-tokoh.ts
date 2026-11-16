// Gambar kecil tokoh, properti, dan zona untuk penyunting konsol (spesifikasi JS-12, P-5 dan P-6). Dimuat sebagai URL
// lewat `import.meta.glob`, sehingga konsol tidak mengimpor `assets/manifest.ts` (P-26).
const npc = import.meta.glob("../../assets/npc/*.png", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const obj = import.meta.glob("../../assets/obj/*.png", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const zona = import.meta.glob("../../assets/ikon/ikon_zona_*.png", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

const nama = (jalur: string) => jalur.slice(jalur.lastIndexOf("/") + 1, -4);
const GAMBAR = new Map<string, string>([...Object.entries(npc), ...Object.entries(obj)].map(([j, u]) => [nama(j), u]));
const ZONA = new Map<string, string>(Object.entries(zona).map(([j, u]) => [`z${nama(j).slice("ikon_zona_".length)}`, u]));

export function gambarTokoh(kunci: string): string | undefined {
  return GAMBAR.get(kunci);
}

export function ikonZona(id: string): string | undefined {
  return ZONA.get(id);
}

/** Nama tampil kunci aset: `npc_bayu_bawah_diam` → "bayu", `obj_gerobak` → "gerobak". */
export function namaTokoh(kunci: string): string {
  const isi = kunci.replace(/^(npc|obj)_/, "");
  return kunci.startsWith("npc_") ? isi.replace(/_(bawah|atas|kiri|kanan)_.*$/, "").replace(/_/g, " ") : isi.replace(/_/g, " ");
}
