// Kueri D1 untuk isi kejadian ruang coba (spesifikasi JS-08, P-1 dan P-2; Architecture 7, bagian "Ruang coba").
// Semua kueri berparameter. Ruang coba adalah ruang uji, jadi membaca versi `kerja` setiap kejadian paket.

export interface BarisKejadianPaket {
  kode: string;
  versi_id: string;
  isi_json: string;
  urutan: number;
}

/** Kejadian paket yang aktif dan tidak berstatus arsip, menurut urutan paket, beserta versi `kerja`-nya. */
export async function bacaPaketKerja(db: D1Database, paketId: string): Promise<BarisKejadianPaket[]> {
  const hasil = await db
    .prepare(
      "SELECT k.kode AS kode, v.id AS versi_id, v.isi_json AS isi_json, pk.urutan AS urutan FROM paket p " +
        "JOIN paket_kejadian pk ON pk.paket_id = p.id JOIN kejadian k ON k.id = pk.kejadian_id " +
        "JOIN kejadian_versi v ON v.kejadian_id = k.id AND v.jenis = 'kerja' " +
        "WHERE p.id = ?1 AND p.aktif = 1 AND k.status <> 'arsip' ORDER BY pk.urutan, k.kode",
    )
    .bind(paketId)
    .all<BarisKejadianPaket>();
  return hasil.results ?? [];
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
