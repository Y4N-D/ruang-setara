// Kueri D1 untuk isi kejadian ruang (spesifikasi JS-08, P-1 dan P-2; JS-10, P-3). Semua kueri berparameter.
// Ruang uji memakai versi `kerja` setiap kejadian bila ada (lalu versi terbit); ruang biasa memakai versi terbit, dan
// hanya boleh bila setiap kejadian paket terbit dengan semua rujukannya terverifikasi.

export interface BarisKejadianPaket {
  kode: string;
  versi_id: string;
  isi_json: string;
  urutan: number;
}

interface BarisIsiPaket {
  kode: string;
  status: string;
  urutan: number;
  kerja_id: string | null;
  kerja_isi: string | null;
  terbit_id: string | null;
  terbit_isi: string | null;
}

async function bacaIsiPaket(db: D1Database, paketId: string): Promise<BarisIsiPaket[]> {
  const hasil = await db
    .prepare(
      "SELECT k.kode AS kode, k.status AS status, pk.urutan AS urutan, vk.id AS kerja_id, vk.isi_json AS kerja_isi, " +
        "vt.id AS terbit_id, vt.isi_json AS terbit_isi FROM paket p JOIN paket_kejadian pk ON pk.paket_id = p.id " +
        "JOIN kejadian k ON k.id = pk.kejadian_id LEFT JOIN kejadian_versi vk ON vk.kejadian_id = k.id AND vk.jenis = 'kerja' " +
        "LEFT JOIN kejadian_versi vt ON vt.id = k.versi_terbit_id " +
        "WHERE p.id = ?1 AND p.aktif = 1 AND k.status <> 'arsip' ORDER BY pk.urutan, k.kode",
    )
    .bind(paketId)
    .all<BarisIsiPaket>();
  return hasil.results ?? [];
}

/** Kejadian paket yang aktif dan tidak berstatus arsip, menurut urutan paket, beserta versi `kerja`-nya (JS-08). */
export async function bacaPaketKerja(db: D1Database, paketId: string): Promise<BarisKejadianPaket[]> {
  return bacaPaketUntuk(db, paketId, true);
}

/** Isi kejadian ruang (P-3): ruang uji memakai versi kerja lalu versi terbit; ruang biasa hanya versi terbit. */
export async function bacaPaketUntuk(db: D1Database, paketId: string, uji: boolean): Promise<BarisKejadianPaket[]> {
  const baris = await bacaIsiPaket(db, paketId);
  const hasil: BarisKejadianPaket[] = [];
  for (const b of baris) {
    const pakaiKerja = uji && b.kerja_id !== null && b.kerja_isi !== null;
    const versiId = pakaiKerja ? b.kerja_id : b.terbit_id;
    const isi = pakaiKerja ? b.kerja_isi : b.terbit_isi;
    if (versiId && isi) hasil.push({ kode: b.kode, versi_id: versiId, isi_json: isi, urutan: b.urutan });
  }
  return hasil;
}

/** Teks rujukan untuk id yang diminta. */
export async function bacaTeksRujukan(db: D1Database, id: readonly string[]): Promise<Map<string, string>> {
  if (id.length === 0) return new Map();
  const hasil = await db
    .prepare("SELECT id, teks FROM rujukan WHERE id IN (SELECT value FROM json_each(?1))")
    .bind(JSON.stringify([...new Set(id)]))
    .all<{ id: string; teks: string }>();
  return new Map((hasil.results ?? []).map((r) => [r.id, r.teks]));
}

function rujukanIsi(isiJson: string): string[] | null {
  try {
    const isi = JSON.parse(isiJson) as { kartu?: { rujukan?: unknown } };
    const r = isi.kartu?.rujukan;
    return Array.isArray(r) && r.every((x) => typeof x === "string") ? (r as string[]) : null;
  } catch {
    return null;
  }
}

/** P-3: paket siap untuk ruang biasa bila setiap kejadiannya terbit dan semua rujukan versi terbitnya terverifikasi. */
export async function paketSiapRuangBiasa(db: D1Database, paketId: string): Promise<boolean> {
  const baris = await bacaIsiPaket(db, paketId);
  if (baris.length === 0) return false;
  const semuaRujukan: string[] = [];
  for (const b of baris) {
    if (b.status !== "terbit" || !b.terbit_id || !b.terbit_isi) return false;
    const r = rujukanIsi(b.terbit_isi);
    if (!r) return false;
    semuaRujukan.push(...r);
  }
  if (semuaRujukan.length === 0) return true;
  const status = await db
    .prepare("SELECT id, status FROM rujukan WHERE id IN (SELECT value FROM json_each(?1))")
    .bind(JSON.stringify([...new Set(semuaRujukan)]))
    .all<{ id: string; status: string }>();
  const peta = new Map((status.results ?? []).map((x) => [x.id, x.status]));
  return semuaRujukan.every((id) => peta.get(id) === "terverifikasi");
}

/** Paket aktif untuk dialog ruang baru (P-6): jumlah kejadian yang tidak diarsip, dan kesiapan untuk ruang biasa. */
export async function daftarPaketPilihan(db: D1Database): Promise<{ id: string; nama: string; jumlahKejadian: number; siapRuangBiasa: boolean }[]> {
  const paket = await db
    .prepare(
      "SELECT p.id AS id, p.nama AS nama, (SELECT COUNT(*) FROM paket_kejadian pk JOIN kejadian k ON k.id = pk.kejadian_id " +
        "WHERE pk.paket_id = p.id AND k.status <> 'arsip') AS jumlah FROM paket p WHERE p.aktif = 1 ORDER BY p.nama",
    )
    .all<{ id: string; nama: string; jumlah: number }>();
  const hasil = [];
  for (const p of paket.results ?? []) hasil.push({ id: p.id, nama: p.nama, jumlahKejadian: p.jumlah, siapRuangBiasa: await paketSiapRuangBiasa(db, p.id) });
  return hasil;
}
