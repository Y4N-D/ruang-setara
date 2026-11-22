// Akhir ronde di inti ruang (spesifikasi JS-11, P-1 sampai P-3 dan P-10 sampai P-14; AC-1, AC-2, AC-9, AC-10).
// Jam tiruan: waktu selalu diberikan uji.
import { describe, expect, it } from "vitest";
import { acakBerbenih } from "../../inti/acak";
import { PROTOKOL_VERSI, skemaServerPemain, type PesanPemain, type PesanServerPemain } from "../../inti/protokol";
import { skemaServerKelas } from "../../inti/protokol-kelas";
import type { PengaturanRuang, TitikPeta } from "../../inti/tipe";
import {
  alarm,
  buatKeadaan,
  ringkasanHasil,
  sambunganMasuk,
  terimaHalo,
  terimaKelas,
  terimaPemain,
  tutupPaksa,
  type BarisPeserta,
  type KeadaanRuang,
  type Keluaran,
} from "../../../../server/jejak-setara/src/ruang/inti-ruang";
import { jumlahTitikRuang, tempatkanRuang } from "../../../../server/jejak-setara/src/ruang/kejadian-ruang";
import { PETA_KAMPUNG, TITIK_PER_ZONA } from "../../../../server/jejak-setara/src/ruang/peta-kampung";
import { hitungRingkasanHasil, susunRekap } from "../../../../server/jejak-setara/src/ruang/rekap-ruang";
import { MASUK } from "../ruang/bankUji";

const V = PROTOKOL_VERSI;
const PENGATURAN: PengaturanRuang = { durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, skillAktif: [], modeNomorAbsen: false, modeNama: "daftar", uji: true };
const DIBUAT = 1_000_000;
type Pesan<T extends PesanServerPemain["t"]> = Extract<PesanServerPemain, { t: T }>;

function semuaSah(o: Keluaran): Keluaran {
  for (const { pesan } of o.kirim) expect(skemaServerPemain.safeParse(pesan).success, JSON.stringify(pesan).slice(0, 300)).toBe(true);
  for (const pesan of o.kelas) expect(skemaServerKelas.safeParse(pesan).success, JSON.stringify(pesan).slice(0, 300)).toBe(true);
  return o;
}
const ke = (o: Keluaran, sid: string) => o.kirim.filter((x) => x.sambunganId === sid).map((x) => x.pesan);
const satu = <T extends PesanServerPemain["t"]>(o: Keluaran, sid: string, t: T) => ke(o, sid).find((p) => p.t === t) as Pesan<T> | undefined;
const peserta = (o: Keluaran): BarisPeserta[] => o.kiriman.flatMap((b) => (b.jenis === "peserta" ? [b.isi] : []));

let nomor = 0;
const acak = acakBerbenih(11);

function ruang(): KeadaanRuang {
  const kejadian = tempatkanRuang(7, TITIK_PER_ZONA, MASUK, jumlahTitikRuang(40));
  return buatKeadaan({ ruangId: "r-11", kode: "K7MPA", pengaturan: PENGATURAN, benih: 7, dibuatPada: DIBUAT }, PETA_KAMPUNG, kejadian);
}

/** Pemain baru tersambung; `pilihNama` false meninggalkannya di layar pilih nama. */
function masuk(k: KeadaanRuang, sid: string, t = DIBUAT + 100, pilihNama = true) {
  sambunganMasuk(k, sid, t);
  nomor++;
  const token = `t${nomor}`.padEnd(43, "A");
  const calon = { pemainId: `p${nomor}`, token, hashToken: `h:${token}` };
  const o = semuaSah(terimaHalo(k, sid, { v: V, t: "halo", peran: "pemain" }, t, acak, calon, null));
  const datang = ke(o, sid)[0] as Pesan<"selamat_datang">;
  if (pilihNama) semuaSah(terimaPemain(k, sid, { v: V, t: "pilih_identitas", nama: datang.saranNama[0], avatar: 1 }, t, acak));
  return { id: calon.pemainId, token, nama: datang.saranNama[0], saran: datang.saranNama };
}

function mulai(k: KeadaanRuang, t = DIBUAT + 1000): number {
  semuaSah(terimaKelas(k, { v: V, t: "mulai" }, t));
  const mulaiPada = k.waktu.mulaiPada as number;
  semuaSah(alarm(k, mulaiPada, true));
  return mulaiPada;
}

function taruhDekat(k: KeadaanRuang, id: string, t: TitikPeta) {
  const p = k.pemain.get(id);
  if (!p) throw new Error("pemain tidak ada");
  p.posisi = { x: t.x * 16 + 8, y: (t.y + 1) * 16 + 12, arah: "atas" };
}

const kirim = (k: KeadaanRuang, sid: string, pesan: PesanPemain, t: number) => semuaSah(terimaPemain(k, sid, pesan, t, acak));

/** Membuka kejadian ke-i lalu mengunci Langkah 1 (benar atau salah) dan, bila diminta, Langkah 2 dengan tingkat tertentu. */
function jawab(k: KeadaanRuang, sid: string, pemainId: string, i: number, t: number, benar: boolean, tingkat: "tepat" | "kurang" | "berisiko" | null) {
  const kj = k.kejadian[i];
  taruhDekat(k, pemainId, kj.titik[0]);
  const terbuka = satu(kirim(k, sid, { v: V, t: "periksa", kejadianId: kj.kode }, t), sid, "kejadian_terbuka")!;
  const teks1 = kj.isi.langkah1.opsi.find((o) => o.benar === benar)!.teks;
  const h1 = satu(kirim(k, sid, { v: V, t: "kunci_1", kejadianId: kj.kode, opsiId: terbuka.opsi1.find((o) => o.teks === teks1)!.id }, t + 10), sid, "hasil_1")!;
  if (tingkat !== null) {
    const teks2 = kj.isi.langkah2.opsi.find((o) => o.tingkat === tingkat)!.teks;
    kirim(k, sid, { v: V, t: "kunci_2", kejadianId: kj.kode, opsiId: h1.opsi2.find((o) => o.teks === teks2)!.id }, t + 20);
  }
  kirim(k, sid, { v: V, t: "tutup_dialog", kejadianId: kj.kode }, t + 30);
  return kj;
}

describe("rekap pribadi di selesai (P-1 sampai P-3)", () => {
  it("menurut urutan kejadian ruang, hanya Langkah 1 yang dikunci, teks dari id asli, Langkah 2 kosong bernilai null", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const t = mulai(k);
    // Dijawab tidak menurut urutan ruang: kejadian ke-5, lalu ke-1 (hanya Langkah 1), lalu ke-3 dibuka saja.
    const kj5 = jawab(k, "s1", a.id, 5, t + 100, false, "kurang");
    const kj1 = jawab(k, "s1", a.id, 1, t + 200, true, null);
    taruhDekat(k, a.id, k.kejadian[3].titik[0]);
    kirim(k, "s1", { v: V, t: "periksa", kejadianId: k.kejadian[3].kode }, t + 300);
    const o = semuaSah(terimaKelas(k, { v: V, t: "akhiri" }, t + 400));
    const selesai = satu(o, "s1", "selesai")!;
    expect(selesai.rekap.map((b) => b.kejadianId)).toEqual([kj1.kode, kj5.kode]);
    const [b1, b5] = selesai.rekap;
    expect(b1).toMatchObject({ judul: kj1.isi.judul, benar1: true, pilihan2: null, tingkat2: null, poin: 40, rujukan: kj1.rujukan });
    expect(b1.pilihan1).toBe(b1.opsiBenar1);
    const salah = kj5.isi.langkah1.opsi.find((x) => !x.benar)!;
    expect(b5).toMatchObject({ pilihan1: salah.teks, benar1: false, opsiBenar1: kj5.isi.langkah1.opsi.find((x) => x.benar)!.teks, tingkat2: "kurang", poin: 25 });
    expect(b5.pilihan2).toBe(kj5.isi.langkah2.opsi.find((x) => x.tingkat === "kurang")!.teks);
    expect(b5.opsiTepat2).toEqual(kj5.isi.langkah2.opsi.filter((x) => x.tingkat === "tepat").map((x) => x.teks));
  });

  it("dikirim lagi saat menyambung ulang di pembahasan; pemain tanpa jawaban menerima rekap kosong", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    masuk(k, "s2");
    const t = mulai(k);
    jawab(k, "s1", a.id, 0, t + 100, true, "tepat");
    const akhir = semuaSah(terimaKelas(k, { v: V, t: "akhiri" }, t + 200));
    expect(satu(akhir, "s2", "selesai")?.rekap).toEqual([]);
    semuaSah(terimaKelas(k, { v: V, t: "pembahasan", kejadianId: k.kejadian[0].kode }, t + 300));
    expect(k.status).toBe("pembahasan");
    // Sambungan baru dengan token lama: selesai dikirim ulang dengan rekap yang sama.
    sambunganMasuk(k, "s1b", t + 400);
    const o = semuaSah(terimaHalo(k, "s1b", { v: V, t: "halo", peran: "pemain", token: a.token }, t + 400, acak, { pemainId: "x", token: "y".padEnd(43, "y"), hashToken: "h:y" }, `h:${a.token}`));
    expect(satu(o, "s1b", "selesai")?.rekap).toEqual(satu(akhir, "s1", "selesai")?.rekap);
  });

  it("susunRekap: paling banyak 64 butir dan pesannya lolos skema", () => {
    const k = ruang();
    const kj = k.kejadian[0];
    const jawaban = new Map(
      Array.from({ length: 70 }, (_, i) => [
        `K-${i}`,
        { pemainId: "p", kode: `K-${i}`, urutan1: [0, 1, 2, 3], urutan2: [0, 1, 2], id1: [], id2: [], status: "selesai" as const, langkah1Opsi: kj.isi.langkah1.opsi[0].id, langkah1Benar: kj.isi.langkah1.opsi[0].benar, langkah2Opsi: null, tingkat: null, poin: 0, dibukaPada: 1, langkah1Pada: 2, langkah2Pada: null },
      ]),
    );
    const kejadian = Array.from({ length: 70 }, (_, i) => ({ ...kj, kode: `K-${i}` }));
    const rekap = susunRekap(kejadian, jawaban);
    expect(rekap).toHaveLength(64);
    const pesan = { v: V, t: "selesai" as const, skor: 0, peringkat: 1, jumlahPemain: 1, rekap };
    expect(skemaServerPemain.safeParse(pesan).success).toBe(true);
  });
});

describe("hasil akhir di D1 (P-11 sampai P-13)", () => {
  it("akhir ronde: baris peserta dengan dikeluarkan dan peringkat; tanda ringkasan", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const t = mulai(k);
    jawab(k, "s1", a.id, 0, t + 100, true, "tepat");
    semuaSah(terimaKelas(k, { v: V, t: "keluarkan", pemainId: b.id }, t + 150));
    const o = semuaSah(terimaKelas(k, { v: V, t: "akhiri" }, t + 200));
    expect(o.tulisRingkasan).toBe(true);
    const baris = peserta(o);
    expect(baris.find((x) => x.id === a.id)).toMatchObject({ peringkatAkhir: 1, dikeluarkan: false, skor: 100 });
    expect(baris.find((x) => x.id === b.id)).toMatchObject({ peringkatAkhir: null, dikeluarkan: true });
  });

  it("keluarkan di lobi atau main mengantrekan baris dikeluarkan tanpa menghitung ulang peringkat akhir", () => {
    const k = ruang();
    masuk(k, "s1");
    const b = masuk(k, "s2");
    const o = semuaSah(terimaKelas(k, { v: V, t: "keluarkan", pemainId: b.id }, DIBUAT + 500));
    expect(peserta(o)).toEqual([expect.objectContaining({ id: b.id, dikeluarkan: true, peringkatAkhir: null })]);
    expect(o.tulisRingkasan).toBe(false);
  });

  it("keluarkan saat pembahasan: peringkat dihitung ulang, papan dan kemajuan, selesai baru, dan ringkasan ditulis ulang", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const c = masuk(k, "s3");
    const t = mulai(k);
    jawab(k, "s1", a.id, 0, t + 100, true, "tepat");
    jawab(k, "s2", b.id, 1, t + 200, true, "kurang");
    jawab(k, "s3", c.id, 2, t + 300, true, null);
    const akhir = semuaSah(terimaKelas(k, { v: V, t: "akhiri" }, t + 400));
    expect(satu(akhir, "s3", "selesai")).toMatchObject({ peringkat: 3, jumlahPemain: 3 });
    semuaSah(terimaKelas(k, { v: V, t: "pembahasan", kejadianId: k.kejadian[0].kode }, t + 500));
    const o = semuaSah(terimaKelas(k, { v: V, t: "keluarkan", pemainId: a.id }, t + 600));
    expect(peserta(o).map((x) => [x.id, x.peringkatAkhir, x.dikeluarkan])).toEqual([
      [a.id, null, true],
      [b.id, 1, false],
      [c.id, 2, false],
    ]);
    expect(o.kelas.map((p) => p.t)).toEqual(expect.arrayContaining(["papan", "kemajuan", "lobi"]));
    expect(satu(o, "s2", "selesai")).toMatchObject({ peringkat: 1, jumlahPemain: 2 });
    expect(satu(o, "s3", "selesai")).toMatchObject({ peringkat: 2, jumlahPemain: 2 });
    expect(o.tulisRingkasan).toBe(true);
    expect(o.kirimSekarang).toBe(true);
  });

  it("pemain yang baru memilih nama saat pembahasan ikut peringkat dengan skor 0; selesai dikirim sekali kepadanya", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const lambat = masuk(k, "s2", DIBUAT + 100, false);
    const t = mulai(k);
    jawab(k, "s1", a.id, 0, t + 100, true, "tepat");
    semuaSah(terimaKelas(k, { v: V, t: "akhiri" }, t + 200));
    const o = semuaSah(terimaPemain(k, "s2", { v: V, t: "pilih_identitas", nama: lambat.saran[0], avatar: 2 }, t + 300, acak));
    expect(ke(o, "s2").filter((p) => p.t === "selesai")).toHaveLength(1);
    expect(satu(o, "s2", "selesai")).toMatchObject({ skor: 0, peringkat: 2, jumlahPemain: 2, rekap: [] });
    expect(satu(o, "s1", "selesai")).toMatchObject({ peringkat: 1, jumlahPemain: 2 });
    // Antrean berkunci jenis:id, jadi baris terakhir yang berlaku.
    expect(peserta(o).filter((x) => x.id === lambat.id).at(-1)).toMatchObject({ peringkatAkhir: 2, skor: 0 });
    expect(o.tulisRingkasan).toBe(true);
  });

  it("ruang ditutup server saat main atau jeda: dialog ditutup dan peringkat akhir diantrekan tanpa selesai", () => {
    for (const jeda of [false, true]) {
      const k = ruang();
      const a = masuk(k, "s1");
      const t = mulai(k);
      jawab(k, "s1", a.id, 0, t + 100, true, "tepat");
      taruhDekat(k, a.id, k.kejadian[1].titik[0]);
      kirim(k, "s1", { v: V, t: "periksa", kejadianId: k.kejadian[1].kode }, t + 200); // dialog terbuka
      if (jeda) semuaSah(terimaKelas(k, { v: V, t: "jeda" }, t + 250));
      const o = semuaSah(tutupPaksa(k, t + 300));
      expect(k.status).toBe("ditutup");
      expect(o.dialog).toEqual([{ sambunganId: "s1", kode: null }]);
      expect(peserta(o)).toEqual([expect.objectContaining({ id: a.id, peringkatAkhir: 1, skor: 100 })]);
      expect(ke(o, "s1").some((p) => p.t === "selesai")).toBe(false);
      expect(ringkasanHasil(k)).toMatchObject({ jumlahPemain: 1, jumlahSkor: 100, langkah1Dijawab: 1, tepat: 1 });
    }
  });

  it("ruang ditutup dari lobi atau saat hitung mundur tidak dimainkan dan tidak punya ringkasan hasil", () => {
    const lobi = ruang();
    masuk(lobi, "s1");
    semuaSah(tutupPaksa(lobi, DIBUAT + 500));
    expect(ringkasanHasil(lobi)).toBeNull();
    const hitung = ruang();
    masuk(hitung, "s1");
    semuaSah(terimaKelas(hitung, { v: V, t: "mulai" }, DIBUAT + 1000));
    const o = semuaSah(tutupPaksa(hitung, DIBUAT + 2000));
    expect(peserta(o)).toEqual([]);
    expect(ringkasanHasil(hitung)).toBeNull();
  });
});

describe("ringkasan hasil (P-14)", () => {
  it("menghitung pemain berkeidentitas yang tidak dikeluarkan, Langkah 1 yang dikunci, dan setiap tingkat", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const c = masuk(k, "s3");
    masuk(k, "s4", DIBUAT + 100, false); // tanpa nama: tidak dihitung
    const t = mulai(k);
    jawab(k, "s1", a.id, 0, t + 100, true, "tepat");
    jawab(k, "s1", a.id, 1, t + 200, false, "berisiko");
    jawab(k, "s2", b.id, 2, t + 300, true, null);
    jawab(k, "s3", c.id, 3, t + 400, true, "kurang");
    semuaSah(terimaKelas(k, { v: V, t: "keluarkan", pemainId: c.id }, t + 500));
    semuaSah(terimaKelas(k, { v: V, t: "akhiri" }, t + 600));
    expect(ringkasanHasil(k)).toEqual({
      versi: 1,
      jumlahKejadian: k.kejadian.length,
      jumlahPemain: 2,
      jumlahSkor: 100 + 0 + 40,
      langkah1Dijawab: 3,
      langkah1Benar: 2,
      tepat: 1,
      kurang: 0,
      berisiko: 1,
    });
  });

  it("hitungRingkasanHasil tanpa pemain", () => {
    expect(hitungRingkasanHasil(16, [])).toEqual({ versi: 1, jumlahKejadian: 16, jumlahPemain: 0, jumlahSkor: 0, langkah1Dijawab: 0, langkah1Benar: 0, tepat: 0, kurang: 0, berisiko: 0 });
  });
});
