// Inti ruang untuk layar kelas (spesifikasi JS-10, P-10, P-13, P-14, P-17 sampai P-22; AC-12 sampai AC-14).
// Jam tiruan: waktu selalu diberikan uji.
import { describe, expect, it } from "vitest";
import { acakBerbenih } from "../../inti/acak";
import { PROTOKOL_VERSI, type PesanServerPemain } from "../../inti/protokol";
import { skemaServerKelas, type PesanServerKelas } from "../../inti/protokol-kelas";
import type { PengaturanRuang } from "../../inti/tipe";
import {
  alarm,
  buatKeadaan,
  DUNIA_KELAS_SETIAP,
  PAPAN_KELAS_SETIAP,
  putaran,
  sambunganMasuk,
  sambutanKelas,
  terimaHalo,
  terimaKelas,
  terimaPemain,
  type KeadaanRuang,
  type Keluaran,
} from "../../../../server/jejak-setara/src/ruang/inti-ruang";
import { jumlahTitikRuang, tempatkanRuang, type JawabanRuang } from "../../../../server/jejak-setara/src/ruang/kejadian-ruang";
import { PETA_KAMPUNG, TITIK_PER_ZONA } from "../../../../server/jejak-setara/src/ruang/peta-kampung";
import { MASUK } from "../ruang/bankUji";

const V = PROTOKOL_VERSI;
const PENGATURAN: PengaturanRuang = { durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, skillAktif: [], modeNomorAbsen: false, uji: true };
const DIBUAT = 1_000_000;
const TAUTAN = "https://jejak-setara-uji.ruangsetara.workers.dev";
const acak = acakBerbenih(11);
let nomor = 0;

function sah(o: Keluaran): Keluaran {
  for (const p of o.kelas) expect(skemaServerKelas.safeParse(p).success, JSON.stringify(p)).toBe(true);
  return o;
}
const jenis = (o: Keluaran) => o.kelas.map((p) => p.t);
const pesan = <T extends PesanServerKelas["t"]>(o: Keluaran, t: T) => o.kelas.find((p) => p.t === t) as Extract<PesanServerKelas, { t: T }> | undefined;

function ruang(): KeadaanRuang {
  const kejadian = tempatkanRuang(7, TITIK_PER_ZONA, MASUK, jumlahTitikRuang(40));
  return buatKeadaan({ ruangId: "r-10", kode: "K7MPA", pengaturan: PENGATURAN, benih: 7, dibuatPada: DIBUAT, labelKelas: "IX B" }, PETA_KAMPUNG, kejadian);
}

function masuk(k: KeadaanRuang, sid: string, t = DIBUAT + 100): string {
  sambunganMasuk(k, sid, t);
  nomor++;
  const token = `k${nomor}`.padEnd(43, "A");
  const calon = { pemainId: `p${nomor}`, token, hashToken: `h:${token}` };
  const o = terimaHalo(k, sid, { v: V, t: "halo", peran: "pemain" }, t, acak, calon, null);
  const datang = o.kirim.find((x) => x.pesan.t === "selamat_datang")?.pesan as Extract<PesanServerPemain, { t: "selamat_datang" }>;
  terimaPemain(k, sid, { v: V, t: "pilih_identitas", nama: datang.saranNama[0], avatar: 2 }, t, acak);
  return calon.pemainId;
}

function jawabSelesai(k: KeadaanRuang, pemainId: string, i: number, opsi1: number, opsi2: number): void {
  const kj = k.kejadian[i];
  const j: JawabanRuang = {
    pemainId,
    kode: kj.kode,
    urutan1: [0, 1, 2, 3],
    urutan2: [0, 1, 2],
    id1: ["a1", "a2", "a3", "a4"],
    id2: ["b1", "b2", "b3"],
    status: "selesai",
    langkah1Opsi: kj.isi.langkah1.opsi[opsi1].id,
    langkah1Benar: kj.isi.langkah1.opsi[opsi1].benar,
    langkah2Opsi: kj.isi.langkah2.opsi[opsi2].id,
    tingkat: kj.isi.langkah2.opsi[opsi2].tingkat,
    poin: 0,
    dibukaPada: DIBUAT,
    langkah1Pada: DIBUAT,
    langkah2Pada: DIBUAT,
  };
  if (!k.jawaban.has(pemainId)) k.jawaban.set(pemainId, new Map());
  k.jawaban.get(pemainId)?.set(kj.kode, j);
  k.peringkat = null;
}

function mainkan(k: KeadaanRuang, t = DIBUAT + 1000): number {
  sah(terimaKelas(k, { v: V, t: "mulai" }, t));
  const mulai = k.waktu.mulaiPada as number;
  alarm(k, mulai, true);
  expect(k.status).toBe("main");
  return mulai;
}

describe("sambutan dan info layar kelas (P-13, P-17)", () => {
  it("di lobi: info_kelas, status_ruang, lalu lobi; tautan diingat untuk info berikutnya", () => {
    const k = ruang();
    masuk(k, "s1");
    const o = sah(sambutanKelas(k, TAUTAN, DIBUAT + 200));
    expect(jenis(o)).toEqual(["info_kelas", "status_ruang", "lobi"]);
    expect(pesan(o, "info_kelas")).toMatchObject({ labelKelas: "IX B", kode: "K7MPA", tautan: TAUTAN, durasiMenit: 15, batasPemain: 40, uji: true, terkunci: false, waktuServer: DIBUAT + 200 });
    expect(pesan(o, "info_kelas")?.kejadian.length).toBe(k.kejadian.length);
    expect(k.tautan).toBe(TAUTAN);
  });

  it("saat bermain: info_kelas, status_ruang, papan, kemajuan, dan dunia_kelas", () => {
    const k = ruang();
    masuk(k, "s1");
    mainkan(k);
    expect(jenis(sah(sambutanKelas(k, TAUTAN, DIBUAT + 5000)))).toEqual(["info_kelas", "status_ruang", "papan", "kemajuan", "dunia_kelas"]);
  });

  it("kunci ruang mengirim info_kelas baru hanya bila layar kelas pernah tersambung", () => {
    const k = ruang();
    expect(jenis(sah(terimaKelas(k, { v: V, t: "kunci_ruang", kunci: true }, DIBUAT)))).toEqual([]);
    sambutanKelas(k, TAUTAN, DIBUAT);
    const o = sah(terimaKelas(k, { v: V, t: "kunci_ruang", kunci: false }, DIBUAT + 1));
    expect(pesan(o, "info_kelas")?.terkunci).toBe(false);
  });

  it("ruang di lobi bisa ditutup (P-10); di status main tidak", () => {
    const a = ruang();
    sah(terimaKelas(a, { v: V, t: "tutup_ruang" }, DIBUAT));
    expect(a.status).toBe("ditutup");
    const b = ruang();
    masuk(b, "s1");
    mainkan(b);
    sah(terimaKelas(b, { v: V, t: "tutup_ruang" }, DIBUAT + 5000));
    expect(b.status).toBe("main");
  });
});

describe("papan, kemajuan, dan dunia_kelas (P-18 sampai P-20)", () => {
  it("dunia_kelas setiap putaran ke-5; papan dan kemajuan setiap putaran ke-10 hanya bila berubah; tidak ada saat jeda", () => {
    const k = ruang();
    const p1 = masuk(k, "s1");
    masuk(k, "s2");
    const mulai = mainkan(k);
    const keluaran: Keluaran[] = [];
    for (let i = 1; i <= 2 * PAPAN_KELAS_SETIAP; i++) keluaran.push(sah(putaran(k, mulai + i * 100)));
    const dunia = keluaran.filter((o) => o.kelas.some((p) => p.t === "dunia_kelas")).length;
    expect(dunia).toBe((2 * PAPAN_KELAS_SETIAP) / DUNIA_KELAS_SETIAP);
    expect(keluaran.filter((o) => o.kelas.some((p) => p.t === "papan")).length).toBe(1);
    jawabSelesai(k, p1, 0, 0, 0);
    let o = keluaranKosongDari(k, mulai + 2100, PAPAN_KELAS_SETIAP);
    expect(pesan(o, "papan")?.pemain[0]).toMatchObject({ id: p1, selesai: 1, peringkat: 1 });
    expect(pesan(o, "kemajuan")).toMatchObject({ terjawab: 1, kemungkinan: 2 * k.kejadian.length });
    sah(terimaKelas(k, { v: V, t: "jeda" }, mulai + 4000));
    o = sah(putaran(k, mulai + 4100));
    expect(o.kelas.filter((p) => p.t === "dunia_kelas")).toEqual([]);
  });

  it("papan hanya membawa 10 besar, dengan jumlah pemain seluruhnya", () => {
    const k = ruang();
    for (let i = 0; i < 12; i++) masuk(k, `s${i}`);
    const mulai = mainkan(k);
    const o = keluaranKosongDari(k, mulai + 100, PAPAN_KELAS_SETIAP);
    expect(pesan(o, "papan")?.pemain.length).toBe(10);
    expect(pesan(o, "papan")?.jumlahPemain).toBe(12);
  });

  it("akhiri ronde langsung mengirim papan dan kemajuan akhir sesudah status selesai", () => {
    const k = ruang();
    masuk(k, "s1");
    const mulai = mainkan(k);
    const o = sah(terimaKelas(k, { v: V, t: "akhiri" }, mulai + 1000));
    const urutan = jenis(o);
    expect(urutan.indexOf("papan")).toBeGreaterThan(urutan.indexOf("status_ruang"));
    expect(urutan).toContain("kemajuan");
  });
});

describe("pembahasan (P-22)", () => {
  it("dari selesai menjadi pembahasan; sebaran menurut urutan asli; pemain yang dikeluarkan tidak dihitung", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const c = masuk(k, "s3");
    const mulai = mainkan(k);
    jawabSelesai(k, a, 0, 0, 0);
    jawabSelesai(k, b, 0, 2, 1);
    jawabSelesai(k, c, 0, 2, 1);
    sah(terimaKelas(k, { v: V, t: "pembahasan", kejadianId: k.kejadian[0].kode }, mulai + 500));
    expect(k.status).toBe("main"); // belum selesai: diabaikan
    sah(terimaKelas(k, { v: V, t: "keluarkan", pemainId: c }, mulai + 600));
    sah(terimaKelas(k, { v: V, t: "akhiri" }, mulai + 1000));
    const o = sah(terimaKelas(k, { v: V, t: "pembahasan", kejadianId: k.kejadian[0].kode }, mulai + 2000));
    expect(k.status).toBe("pembahasan");
    expect(jenis(o)).toEqual(["status_ruang", "data_pembahasan"]);
    const d = pesan(o, "data_pembahasan");
    expect(d?.opsi1.map((x) => x.id)).toEqual(k.kejadian[0].isi.langkah1.opsi.map((x) => x.id));
    expect(d?.opsi1.map((x) => x.jumlah)).toEqual([1, 0, 1, 0]);
    expect(d?.opsi2.map((x) => x.jumlah)).toEqual([1, 1, 0]);
    expect(jenis(sah(terimaKelas(k, { v: V, t: "pembahasan", kejadianId: "K-99" }, mulai + 3000)))).toEqual([]);
  });
});

/** Menjalankan `n` putaran mulai `t` dan menggabungkan keluarannya. */
function keluaranKosongDari(k: KeadaanRuang, t: number, n: number): Keluaran {
  const semua: PesanServerKelas[] = [];
  let terakhir: Keluaran | null = null;
  for (let i = 0; i < n; i++) {
    terakhir = sah(putaran(k, t + i * 100));
    semua.push(...terakhir.kelas);
  }
  return { ...(terakhir as Keluaran), kelas: semua };
}
