// Perkiraan biaya uji beban (spesifikasi JS-15, P-3): pesan masuk, permintaan Durable Object, GB-detik, serta baris
// SQLite dan D1 ditulis, dibandingkan dengan kuota bulanan Workers Paid (dokumentasi Cloudflare, halaman Pricing
// Workers, 18 Nov 2026). Laju diambil dari sim:beban lokal Plan JS-15 (ruang ≤ 50 pemain) dan Build JS-08 (100 pemain).
// Murni, tanpa jaringan; dipakai simulasi-beban.mjs, gabung-beban.mjs, dan uji unit.

export const LAJU = {
  pesanLobiPerDetik: 4.5,
  pesanJelajahPerDetik: 8.0,
  // Ruang lebih dari 50 pemain memakai 6 gerak per detik (BATAS.gerakPerDetikRuangBesar).
  pesanLobiPerDetikRuangBesar: 2.7,
  pesanJelajahPerDetikRuangBesar: 4.9,
  barisSqlitePerBotPerMenit: 31,
  barisD1PerBotPerMenit: 8,
};
export const KUOTA_BULANAN = { permintaanDO: 1_000_000, gbDetik: 400_000, barisDitulis: 50_000_000 };
export const GB_PER_DURABLE_OBJECT = 0.125;
/** Persiapan, layar kelas, dan akhir ronde per ruang. */
export const DETIK_TAMBAHAN_PER_RUANG = 120;
/** P-4: satu run uji beban jarak jauh ditolak bila perkiraan permintaan Durable Object melebihi angka ini. */
export const BATAS_PERMINTAAN_PER_RUN = 400_000;

/** Skenario alur kerja "Jejak: uji beban" (P-12): jumlah pekerjaan, ruang dan bot per pekerjaan, serta lama lobi dan menjelajah. */
export const SKENARIO = {
  singkat: { pekerjaan: 1, ruang: 1, bot: 50, detikLobi: 60, detikJelajah: 120, sasaran: "uji" },
  s1: { pekerjaan: 1, ruang: 1, bot: 50, detikLobi: 180, detikJelajah: 900, sasaran: "uji" },
  s2: { pekerjaan: 5, ruang: 2, bot: 50, detikLobi: 180, detikJelajah: 900, sasaran: "uji" },
  s3: { pekerjaan: 1, ruang: 1, bot: 100, detikLobi: 180, detikJelajah: 900, sasaran: "uji" },
  "lokal-10x50": { pekerjaan: 1, ruang: 10, bot: 50, detikLobi: 60, detikJelajah: 300, sasaran: "lokal" },
};

/**
 * Perkiraan untuk `ruang` ruang × `botPerRuang` bot. Permintaan = pesan masuk ÷ 20 (ke atas) + sambungan (bot dan layar
 * kelas) + alarm (sekitar satu per menit) + tiga permintaan internal per ruang.
 */
export function perkiraanBiaya({ ruang, botPerRuang, detikLobi, detikJelajah }) {
  const besar = botPerRuang > 50;
  const pesanPerBot =
    (besar ? LAJU.pesanLobiPerDetikRuangBesar : LAJU.pesanLobiPerDetik) * detikLobi +
    (besar ? LAJU.pesanJelajahPerDetikRuangBesar : LAJU.pesanJelajahPerDetik) * detikJelajah;
  const pesanMasuk = Math.round(ruang * botPerRuang * pesanPerBot);
  const detik = detikLobi + detikJelajah;
  const sambungan = ruang * (botPerRuang + 1);
  const alarm = ruang * Math.ceil(detik / 60);
  const permintaanDO = Math.ceil(pesanMasuk / 20) + sambungan + alarm + 3 * ruang;
  const gbDetik = Math.round(ruang * (detik + DETIK_TAMBAHAN_PER_RUANG) * GB_PER_DURABLE_OBJECT);
  const menitBot = (ruang * botPerRuang * detik) / 60;
  const barisSqlite = Math.round(menitBot * LAJU.barisSqlitePerBotPerMenit);
  const barisD1 = Math.round(menitBot * LAJU.barisD1PerBotPerMenit);
  const persen = (n, kuota) => Math.round((n * 1000) / kuota) / 10;
  return {
    pesanMasuk,
    permintaanDO,
    permintaanDOPerRuang: Math.round(permintaanDO / ruang),
    gbDetik,
    barisSqlite,
    barisD1,
    persenKuota: {
      permintaanDO: persen(permintaanDO, KUOTA_BULANAN.permintaanDO),
      gbDetik: persen(gbDetik, KUOTA_BULANAN.gbDetik),
      barisDitulis: persen(barisSqlite + barisD1, KUOTA_BULANAN.barisDitulis),
    },
  };
}

/** Perkiraan seluruh run sebuah skenario (semua pekerjaan). */
export function perkiraanSkenario(nama) {
  const s = SKENARIO[nama];
  if (!s) throw new Error(`skenario tidak dikenal: ${nama}`);
  return perkiraanBiaya({ ruang: s.pekerjaan * s.ruang, botPerRuang: s.bot, detikLobi: s.detikLobi, detikJelajah: s.detikJelajah });
}

/** Satu baris ringkas untuk dicetak sebelum run. */
export function teksPerkiraan(p) {
  return (
    `Perkiraan: ±${p.permintaanDO.toLocaleString("id-ID")} permintaan Durable Object (${p.persenKuota.permintaanDO}% kuota bulanan), ` +
    `±${p.gbDetik.toLocaleString("id-ID")} GB-detik (${p.persenKuota.gbDetik}%), ` +
    `±${(p.barisSqlite + p.barisD1).toLocaleString("id-ID")} baris ditulis (${p.persenKuota.barisDitulis}%).`
  );
}
