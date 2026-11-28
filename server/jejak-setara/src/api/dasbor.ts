// GET /api/dasbor (spesifikasi JS-04, P-36): jumlah rujukan yang belum diverifikasi. Sejak JS-10 (P-11) juga paling
// banyak 5 ruang yang sedang berjalan beserta jumlah seluruhnya. Sejak JS-13 (P-24 sampai P-26): jumlah kejadian Siap
// tinjau (admin), sesi terakhir, dan ringkasan 30 hari dari `ruang.ringkasan_json`, tanpa membaca tabel jawaban.
import { durasiSah } from "../../../../app/jejak-setara/inti/ruang";
import { persen, rataRata } from "../../../../app/jejak-setara/inti/hasil";
import { RUANG_DAFTAR_MS, RUANG_DASBOR_MAKS } from "../../../../app/jejak-setara/inti/ruang";
import { HARI_MS, HARI_RINGKASAN } from "../../../../app/jejak-setara/inti/statistik";
import { hitungRujukanBelum, hitungSiapTinjau } from "../db/akun";
import { daftarRuang, hitungRuangBerjalan, ringkasanDasbor, sesiTerakhir, type BarisRingkasanDasbor, type BarisSesiDasbor } from "../db/ruang";
import type { Env } from "../env";
import { jawabJson } from "../keamanan";
import { jagaRute, metodeSalah } from "./masuk";
import { ringkasanRuang } from "./ruang";

/** Kartu "Sesi terakhir" memuat paling banyak lima ruang (P-25). */
export const SESI_DASBOR_MAKS = 5;

function sesiDasbor(b: BarisSesiDasbor) {
  return {
    id: b.id,
    kode: b.kode,
    labelKelas: b.label_kelas,
    uji: b.uji === 1,
    namaGuru: b.nama_guru,
    dibuatPada: b.dibuat_pada,
    jumlahPemain: b.jumlah_pemain,
    rataSkor: b.rata_skor === null ? null : Math.round(b.rata_skor * 10) / 10,
    durasiMenit: durasiSah(b.durasi_menit), // JS-25 (P-14)
  };
}

function ringkasan(b: BarisRingkasanDasbor) {
  const n = (x: number | null) => x ?? 0;
  const l2 = n(b.tepat) + n(b.kurang) + n(b.berisiko);
  return {
    hari: HARI_RINGKASAN,
    sesi: b.sesi,
    sesiPendek: n(b.sesi_pendek), // JS-25 (P-15)
    pemain: n(b.pemain),
    rataSkor: rataRata(n(b.skor_panjang), n(b.pemain_panjang)), // JS-25 (P-15): tanpa ronde 5 menit
    ketepatan1: persen(n(b.b1), n(b.l1)),
    tingkat: { tepat: persen(n(b.tepat), l2), kurang: persen(n(b.kurang), l2), berisiko: persen(n(b.berisiko), l2) },
  };
}

export async function tanganiApiDasbor(request: Request, env: Env): Promise<Response> {
  if (request.method !== "GET") return metodeSalah("GET");
  const sekarang = Date.now();
  const jaga = await jagaRute(request, env, "dasbor.lihat", sekarang);
  if (!jaga.ok) return jaga.jawaban;
  const admin = jaga.sesi.akun.peran === "admin";
  const pemilik = admin ? null : jaga.sesi.akun.id;
  const sejak = sekarang - RUANG_DAFTAR_MS;
  const [rujukanBelum, ruang, jumlahRuang, siapTinjau, sesi, hasil] = await Promise.all([
    hitungRujukanBelum(env.DB),
    daftarRuang(env.DB, pemilik, sejak, RUANG_DASBOR_MAKS),
    hitungRuangBerjalan(env.DB, pemilik, sejak),
    admin ? hitungSiapTinjau(env.DB) : Promise.resolve(null),
    sesiTerakhir(env.DB, pemilik, SESI_DASBOR_MAKS),
    ringkasanDasbor(env.DB, pemilik, sekarang - HARI_RINGKASAN * HARI_MS),
  ]);
  return jawabJson({ rujukanBelum, ruang: ruang.map(ringkasanRuang), jumlahRuang, siapTinjau, sesi: sesi.map(sesiDasbor), ringkasan: ringkasan(hasil) }, 200);
}
