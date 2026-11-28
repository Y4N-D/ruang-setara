// Ronde 5 menit (spesifikasi JS-25, rencana uji "Unit"; AC-1 sampai AC-6, AC-8): durasi, ambang peringatan, masa,
// tambahan protokol, skema pesan, bunyi peringatan layar kelas, dan teks final.
import { describe, expect, it } from "vitest";
import { lewatPeringatan } from "../../admin/kelas/suara-kelas";
import { ambangPeringatanDetik, BATAS, duaMenitTerakhir, peringatanAkhir } from "../../inti/aturan";
import { PROTOKOL_VERSI, skemaServerPemain } from "../../inti/protokol";
import { skemaServerKelas } from "../../inti/protokol-kelas";
import { bacaTambahan, DURASI_RUANG, durasiSah, skemaRuangBaru, tambahanDiperlukan } from "../../inti/ruang";
import { PROTOKOL_TAMBAHAN } from "../../inti/versi";
import { alamatSambungan } from "../../pemain/jaringan";
import { hitungLangit, type WaktuRuangKlien } from "../../pemain/dunia/langit";
import { TEKS } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";

const MULAI = 1_000_000;
const main = (berakhirPada: number): WaktuRuangKlien => ({ status: "main", mulaiPada: MULAI, berakhirPada, jedaSejak: null });
const LIMA = 5 * 60_000;

describe("durasi dan tambahan protokol (P-1, P-8, P-9)", () => {
  it("pilihan durasi 5, 10, 15, dan 20 menit; skema ruang baru menerima 5 dan menolak yang lain", () => {
    expect(DURASI_RUANG).toEqual([5, 10, 15, 20]);
    expect(BATAS.durasiMenit).toEqual([5, 10, 15, 20]);
    const dasar = { labelKelas: "IX B", paketId: "p-1", batasPemain: 40, batasTerlambatMenit: 5, modeNomorAbsen: false, uji: true };
    expect(skemaRuangBaru.safeParse({ ...dasar, durasiMenit: 5 }).success).toBe(true);
    for (const salah of [0, 7, 12, 25, "5", "lima"]) expect(skemaRuangBaru.safeParse({ ...dasar, durasiMenit: salah }).success, String(salah)).toBe(false);
  });

  it("tambahan 1 hanya diperlukan ruang 5 menit; angka di alamat dibaca ketat", () => {
    expect(PROTOKOL_VERSI).toBe(6);
    expect(PROTOKOL_TAMBAHAN).toBe(1);
    expect([5, 10, 15, 20].map(tambahanDiperlukan)).toEqual([1, 0, 0, 0]);
    expect([null, "", "1", "2", "01", "abc", "-1", "1.5", "1000"].map(bacaTambahan)).toEqual([0, 0, 1, 2, 1, 0, 0, 0, 0]);
    expect(alamatSambungan("https:", "jejak.contoh", "K7MPA")).toBe("wss://jejak.contoh/ws/ruang/K7MPA?tambahan=1");
    expect(alamatSambungan("http:", "127.0.0.1:4310", "K7MPA")).toBe("ws://127.0.0.1:4310/ws/ruang/K7MPA?tambahan=1");
  });

  it("durasi tersimpan yang tidak ada atau tidak sah dianggap 15", () => {
    expect([5, 10, 15, 20, undefined, null, 7, "5"].map(durasiSah)).toEqual([5, 10, 15, 20, 15, 15, 15, 15]);
  });

  it("selamat_datang dan info_kelas menerima durasi 5 dan tetap menolak 12", () => {
    const pengaturan = { durasiMenit: 5, batasPemain: 40, batasTerlambatMenit: 5, skillAktif: [], modeNomorAbsen: false, uji: true, modeNama: "daftar" };
    const datang = { v: 6, t: "selamat_datang", pemainId: "p1", token: "4OHi4-Tl5ufo6err7O3u7_Dx8vP09fb3-Pn6-_z9_v8", status: "lobi", pengaturan, waktuServer: 5000, versiPeta: 1, saranNama: ["Kancil Jingga"], avatarTersedia: [0] };
    expect(skemaServerPemain.safeParse(datang).success).toBe(true);
    expect(skemaServerPemain.safeParse({ ...datang, pengaturan: { ...pengaturan, durasiMenit: 12 } }).success).toBe(false);
    const info = { v: 6, t: "info_kelas", labelKelas: "IX B", kode: "K7MPA", tautan: "https://a.b", modeNama: "daftar", durasiMenit: 5, batasPemain: 40, uji: true, terkunci: false, waktuServer: 10_500, jumlahKejadian: 0, kejadian: [] };
    expect(skemaServerKelas.safeParse(info).success).toBe(true);
    expect(skemaServerKelas.safeParse({ ...info, durasiMenit: 12 }).success).toBe(false);
  });
});

describe("ambang peringatan dan masa (P-5, P-6)", () => {
  it("peringatan akhir 60 detik untuk ronde 5 menit dan 120 detik untuk ronde lain", () => {
    expect([5, 10, 15, 20].map(ambangPeringatanDetik)).toEqual([60, 120, 120, 120]);
    expect([0, 1, 60, 61].map((s) => peringatanAkhir(s, 5))).toEqual([false, true, true, false]);
    expect([0, 1, 120, 121].map((s) => peringatanAkhir(s, 15))).toEqual([false, true, true, false]);
    expect(duaMenitTerakhir(120)).toBe(true);
  });

  it("ronde 5 menit: siang mulai 90 detik dan sore mulai 195 detik sesudah mulai", () => {
    const masa = (detik: number) => hitungLangit(main(MULAI + LIMA), 5, MULAI + detik * 1000).masa;
    expect([89.9, 90, 194.9, 195].map(masa)).toEqual(["pagi", "siang", "siang", "sore"]);
  });

  it("langit: peringatan di sisa 60 detik (5 menit) dan 120 detik (10 menit); jeda membekukan, tambah waktu menghapus", () => {
    const peringatan = (durasi: number, sisaDetik: number) => hitungLangit(main(MULAI + durasi * 60_000), durasi, MULAI + durasi * 60_000 - sisaDetik * 1000).duaMenit;
    expect([peringatan(5, 61), peringatan(5, 60), peringatan(10, 121), peringatan(10, 120)]).toEqual([false, true, false, true]);
    const jeda: WaktuRuangKlien = { status: "jeda", mulaiPada: MULAI, berakhirPada: MULAI + LIMA, jedaSejak: MULAI + LIMA - 59_000 };
    const l = hitungLangit(jeda, 5, MULAI + LIMA + 30_000);
    expect([l.sisaMs, l.duaMenit]).toEqual([59_000, true]);
    expect(hitungLangit(main(MULAI + LIMA + 120_000), 5, MULAI + LIMA - 59_000).duaMenit).toBe(false);
  });

  it("bunyi peringatan layar kelas: sekali saat sisa turun melewati ambang durasinya, bukan saat dimuat", () => {
    expect(lewatPeringatan(61_000, 60_000, 5)).toBe(true);
    expect(lewatPeringatan(121_000, 120_000, 5)).toBe(false);
    expect(lewatPeringatan(null, 50_000, 5)).toBe(false);
    expect(lewatPeringatan(60_000, 59_000, 5)).toBe(false);
    expect(lewatPeringatan(121_000, 120_000, 15)).toBe(true);
    expect(lewatPeringatan(61_000, 60_000, 15)).toBe(false);
  });
});

describe("teks final JS-25 (P-2, P-6, P-13 sampai P-17)", () => {
  it("teks layar pemain dan konsol", () => {
    expect(TEKS.dunia.satuMenit).toBe("Satu menit lagi");
    expect(TEKS.dunia.duaMenit).toBe("Dua menit lagi");
    expect(TEKS_KONSOL.ruangBaru.catatanLimaMenit).toBe(
      "Paket ini memuat {n} kejadian. Dalam ronde 5 menit, setiap siswa biasanya sempat menjawab 3 sampai 4 kejadian, jadi paket berisi sekitar 8 kejadian lebih mudah dibahas.",
    );
    expect(TEKS_KONSOL.riwayatRuang.kolomDurasi).toBe("Durasi");
    expect(TEKS_KONSOL.dasbor.sesiItem).toBe("{tanggal} · {kelas} · {durasi} menit · {n} pemain · rata-rata {rata}");
    expect(TEKS_KONSOL.dasbor.sesiItemGuru).toBe("{tanggal} · {kelas} · {guru} · {durasi} menit · {n} pemain · rata-rata {rata}");
    expect(TEKS_KONSOL.dasbor.ringkasanTanpaPendek).toBe("Rata-rata skor tanpa ronde 5 menit.");
    expect(TEKS_KONSOL.csv.durasi).toBe("Durasi (menit)");
  });
});
