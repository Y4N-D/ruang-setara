// Inti ruang dengan Teropong dan Angkot (spesifikasi JS-18, P-14 sampai P-16, P-22, dan P-23; AC-5, AC-8, AC-10, dan
// AC-13). Jam tiruan: waktu selalu diberikan uji. Seperti uji JS-08 dan JS-09, posisi pemain, letak titik kejadian, dan
// keadaan skill boleh diisi langsung oleh uji.
import { describe, expect, it } from "vitest";
import { acakBerbenih } from "../../inti/acak";
import { titikHalte } from "../../inti/aturan";
import { posisiSah } from "../../inti/gerak";
import { PROTOKOL_VERSI, skemaPemain, skemaServerPemain, type PesanPemain, type PesanServerPemain } from "../../inti/protokol";
import { skemaServerKelas } from "../../inti/protokol-kelas";
import type { Arah, PengaturanRuang, SkillId } from "../../inti/tipe";
import {
  alarm,
  buatKeadaan,
  pulihkanKeadaan,
  putaran,
  sambunganMasuk,
  terimaHalo,
  terimaKelas,
  terimaPemain,
  type KeadaanRuang,
  type Keluaran,
  type PetaRuang,
  type Simpanan,
} from "../../../../server/jejak-setara/src/ruang/inti-ruang";
import { jawabanBaru, jumlahTitikRuang, tempatkanRuang } from "../../../../server/jejak-setara/src/ruang/kejadian-ruang";
import { HALTE_KAMPUNG, PETA_KAMPUNG, TITIK_PER_ZONA } from "../../../../server/jejak-setara/src/ruang/peta-kampung";
import { skillBaru, type SkillPemain } from "../../../../server/jejak-setara/src/ruang/skill-ruang";
import { MASUK } from "../ruang/bankUji";

const V = PROTOKOL_VERSI;
const LIMA: SkillId[] = ["lari", "kompas", "petunjuk", "teropong", "angkot"];
const P0: SkillId[] = ["lari", "kompas", "petunjuk"];
const PENGATURAN: PengaturanRuang = { durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, skillAktif: LIMA, modeNomorAbsen: false, modeNama: "daftar", uji: true };
const DIBUAT = 1_000_000;
type Pesan<T extends PesanServerPemain["t"]> = Extract<PesanServerPemain, { t: T }>;

function semuaSah(o: Keluaran): Keluaran {
  for (const { pesan } of o.kirim) expect(skemaServerPemain.safeParse(pesan).success, JSON.stringify(pesan)).toBe(true);
  for (const pesan of o.kelas) expect(skemaServerKelas.safeParse(pesan).success, JSON.stringify(pesan)).toBe(true);
  return o;
}
const ke = (o: Keluaran, sid: string) => o.kirim.filter((x) => x.sambunganId === sid).map((x) => x.pesan);
const jenisKe = (o: Keluaran, sid: string) => ke(o, sid).map((p) => p.t);
const satu = <T extends PesanServerPemain["t"]>(o: Keluaran, sid: string, t: T) => ke(o, sid).find((p) => p.t === t) as Pesan<T> | undefined;
const semuaJenis = <T extends PesanServerPemain["t"]>(o: Keluaran, sid: string, t: T) => ke(o, sid).filter((p) => p.t === t) as Pesan<T>[];
const barisSkill = (o: Keluaran) => o.simpan.filter((s): s is Extract<Simpanan, { jenis: "skill" }> => s.jenis === "skill");
const terungkap = (o: Keluaran, sid: string) => semuaJenis(o, sid, "kejadian_terlihat").map((p) => p.kejadianId);

let nomor = 0;
const acak = acakBerbenih(18);

function ruang(atur: { batasPemain?: number; skillAktif?: SkillId[]; peta?: PetaRuang } = {}): KeadaanRuang {
  const batasPemain = atur.batasPemain ?? 40;
  const kejadian = tempatkanRuang(7, TITIK_PER_ZONA, MASUK, jumlahTitikRuang(batasPemain));
  const pengaturan = { ...PENGATURAN, batasPemain, skillAktif: atur.skillAktif ?? LIMA };
  return buatKeadaan({ ruangId: "r-18", kode: "K7MPA", pengaturan, benih: 7, dibuatPada: DIBUAT }, atur.peta ?? PETA_KAMPUNG, kejadian);
}

function masuk(k: KeadaanRuang, sid: string, t = DIBUAT + 100) {
  sambunganMasuk(k, sid, t);
  nomor++;
  const token = `t${nomor}`.padEnd(43, "C");
  const calon = { pemainId: `p${nomor}`, token, hashToken: `h:${token}` };
  const o = semuaSah(terimaHalo(k, sid, { v: V, t: "halo", peran: "pemain" }, t, acak, calon, null));
  const datang = ke(o, sid)[0] as Pesan<"selamat_datang">;
  semuaSah(terimaPemain(k, sid, { v: V, t: "pilih_identitas", nama: datang.saranNama[0], avatar: 3 }, t, acak));
  return { id: calon.pemainId, token, nama: datang.saranNama[0] };
}

function mulai(k: KeadaanRuang, t = DIBUAT + 1000): number {
  semuaSah(terimaKelas(k, { v: V, t: "mulai" }, t));
  const mulaiPada = k.waktu.mulaiPada as number;
  semuaSah(alarm(k, mulaiPada, true));
  return mulaiPada;
}

const kirim = (k: KeadaanRuang, sid: string, pesan: PesanPemain, t: number) => semuaSah(terimaPemain(k, sid, pesan, t, acak));
const seq = new Map<string, number>();
function gerak(k: KeadaanRuang, sid: string, pid: string, x: number, y: number, t: number, arah: Arah = "kanan") {
  const n = (seq.get(pid) ?? 0) + 1;
  seq.set(pid, n);
  return kirim(k, sid, { v: V, t: "gerak", x, y, arah, jalan: true, seq: n }, t);
}
const pakaiSkill = (k: KeadaanRuang, sid: string, skill: SkillId, t: number, halteId?: string) =>
  kirim(k, sid, { v: V, t: "pakai_skill", skill, ...(halteId ? { halteId } : {}) }, t);
const naikAngkot = (k: KeadaanRuang, sid: string, halteId: string | undefined, t: number) => pakaiSkill(k, sid, "angkot", t, halteId);

function taruh(k: KeadaanRuang, id: string, x: number, y: number, arah: Arah = "kanan") {
  const p = k.pemain.get(id);
  if (!p) throw new Error("pemain tidak ada");
  p.posisi = { x, y, arah };
}
/** Titik kaki di ubin (x, y). */
const kaki = (x: number, y: number) => ({ x: x * 16 + 8, y: y * 16 + 12 });
const taruhUbin = (k: KeadaanRuang, id: string, x: number, y: number, arah: Arah = "kanan") => taruh(k, id, kaki(x, y).x, kaki(x, y).y, arah);
const halte = (n: number) => HALTE_KAMPUNG[n - 1];
const taruhDiHalte = (k: KeadaanRuang, id: string, n: number, arah: Arah = "kiri") => taruh(k, id, titikHalte(halte(n)).x, titikHalte(halte(n)).y, arah);

function beriMuatan(k: KeadaanRuang, id: string, muatan: Partial<Record<SkillId, number>>): SkillPemain {
  const s = k.skill.get(id) ?? skillBaru();
  Object.assign(s.keadaan.muatan, muatan);
  k.skill.set(id, s);
  return s;
}

/** Ubin jauh di pojok kanan bawah peta, jauh dari semua pemain uji, tempat titik yang tidak dipakai uji dipindah. */
const JAUH = { x: 150, y: 95 };
/**
 * Menyalin titik kejadian (titik peta dipakai bersama antarruang), memindah semua titik ke ubin JAUH, lalu menaruh titik
 * yang disebut ke ubinnya. `[i, j, x, y]`: titik ke-j kejadian ke-i.
 */
function susunTitik(k: KeadaanRuang, daftar: readonly [number, number, number, number][]) {
  k.kejadian = k.kejadian.map((kj) => ({ ...kj, titik: kj.titik.map((t) => ({ ...t, x: JAUH.x, y: JAUH.y })) }));
  for (const [i, j, x, y] of daftar) Object.assign(k.kejadian[i].titik[j], { x, y });
}
function selesaikan(k: KeadaanRuang, pid: string, kode: string, mulaiPada: number) {
  const m = k.jawaban.get(pid) ?? new Map();
  m.set(kode, { ...jawabanBaru(7, pid, kode, mulaiPada), status: "selesai" as const });
  k.jawaban.set(pid, m);
}

const grid = { lebar: PETA_KAMPUNG.lebar, tinggi: PETA_KAMPUNG.tinggi, tabrakan: PETA_KAMPUNG.tabrakan };
/** Tujuan sejauh `d` piksel dari `p` ke salah satu dari empat arah yang jalurnya bebas (setiap piksel sah). */
function arahBebas(p: { x: number; y: number }, d: number): { x: number; y: number } {
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
    let bebas = true;
    for (let i = 1; i <= d && bebas; i++) bebas = posisiSah(grid, p.x + dx * i, p.y + dy * i);
    if (bebas) return { x: p.x + dx * d, y: p.y + dy * d };
  }
  throw new Error(`tidak ada arah bebas ${d} px dari (${p.x}, ${p.y})`);
}

// Pemain Teropong di ubin (69, 50): titik kaki (1112, 812), layar (320 × 180) dari x 952 sampai 1272 dan y 722 sampai 902.
const DIAM = { x: 69, y: 50 };

describe("Teropong di server (P-14 sampai P-16; AC-5)", () => {
  it("pakai_skill: pribadi dengan muatan dan aktifSampai.teropong (jam server), satu baris skill, tanpa pengungkapan di jawaban yang sama", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const mulaiPada = mulai(k);
    susunTitik(k, [[0, 0, 80, 50]]);
    taruhUbin(k, a.id, DIAM.x, DIAM.y);
    beriMuatan(k, a.id, { teropong: 1 });
    const o = pakaiSkill(k, "s1", "teropong", mulaiPada + 4000);
    expect(jenisKe(o, "s1")).toEqual(["pribadi"]);
    expect(satu(o, "s1", "pribadi")).toMatchObject({ muatan: { teropong: 0 }, aktifSampai: { teropong: mulaiPada + 34_000 } });
    expect(barisSkill(o)).toHaveLength(1);
    expect(JSON.parse(barisSkill(o)[0].isi)).toMatchObject({ muatan: { teropong: 0 }, aktif: { teropong: 34_000 }, pakai: { teropong: 4000 } });
    // Dipakai lagi selama aktif (muatan bertambah dari kotak): ditolak tanpa jawaban.
    beriMuatan(k, a.id, { teropong: 1 });
    expect(ke(pakaiSkill(k, "s1", "teropong", mulaiPada + 10_000), "s1")).toEqual([]);
  });

  it("putaran berikutnya: titik dalam radius yang belum selesai dan belum terlihat terungkap menurut urutan kode lalu id titik", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const mulaiPada = mulai(k);
    // Urutan paket dibalik agar urutan kode benar-benar diuji, bukan urutan larik.
    k.kejadian = [...k.kejadian].reverse();
    const [kA, kB, kC, kD, kE] = [3, 6, 9, 12, 1];
    susunTitik(k, [
      [kA, 0, 80, 50], // (1288, 808): 176 px ke kanan, di luar layar, di dalam radius
      [kB, 0, 82, 50], // 208 px: di luar radius
      [kC, 0, 58, 50], // 176 px ke kiri, tetapi kejadiannya sudah selesai
      [kD, 0, 69, 61], // 172 px ke bawah, di luar layar, di dalam radius
      [kE, 0, 69, 39], // 180 px ke atas, tetapi sudah terlihat
    ]);
    selesaikan(k, a.id, k.kejadian[kC].kode, mulaiPada);
    k.terlihat.set(a.id, new Set([k.kejadian[kE].titik[0].id]));
    taruhUbin(k, a.id, DIAM.x, DIAM.y);
    // Tanpa Teropong: putaran tidak mengungkap apa pun (semua titik di luar layar).
    expect(terungkap(semuaSah(putaran(k, mulaiPada + 900)), "s1")).toEqual([]);
    beriMuatan(k, a.id, { teropong: 1 });
    pakaiSkill(k, "s1", "teropong", mulaiPada + 1000);
    const o = semuaSah(putaran(k, mulaiPada + 1100));
    const harap = [k.kejadian[kA].kode, k.kejadian[kD].kode].sort();
    expect(terungkap(o, "s1")).toEqual(harap);
    const pesanA = semuaJenis(o, "s1", "kejadian_terlihat").find((p) => p.kejadianId === k.kejadian[kA].kode);
    expect(pesanA).toMatchObject({ x: 80, y: 50 });
    // Jalur keterlihatan JS-08: baris `terlihat` dan `terlihat` di pribadi berikutnya.
    const baris = o.simpan.filter((s) => s.jenis === "terlihat").map((s) => (s as Extract<Simpanan, { jenis: "terlihat" }>).kode);
    expect(baris).toEqual(harap);
    expect(o.simpan.filter((s) => s.jenis === "skill")).toEqual([]);
    expect(k.terlihat.get(a.id)?.has(k.kejadian[kA].titik[0].id)).toBe(true);
    // Titik yang sudah terungkap tidak dikirim lagi.
    expect(terungkap(semuaSah(putaran(k, mulaiPada + 1200)), "s1")).toEqual([]);
  });

  it("radius mengikuti posisi; sesudah 30 detik tidak ada pengungkapan, tanpa pesan dan tanpa baris", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const mulaiPada = mulai(k);
    susunTitik(k, [
      [2, 0, 82, 50], // 208 px dari ubin (69, 50); 176 px dari ubin (71, 50) dan masih di luar layarnya (x ≤ 1304)
      [5, 0, 69, 63], // 204 px ke bawah dari ubin (69, 50)
    ]);
    taruhUbin(k, a.id, DIAM.x, DIAM.y);
    beriMuatan(k, a.id, { teropong: 1 });
    pakaiSkill(k, "s1", "teropong", mulaiPada + 1000);
    expect(terungkap(semuaSah(putaran(k, mulaiPada + 1100)), "s1")).toEqual([]);
    taruhUbin(k, a.id, 71, 50);
    expect(terungkap(semuaSah(putaran(k, mulaiPada + 1200)), "s1")).toEqual([k.kejadian[2].kode]);
    // Tepat 30 detik sesudah dipakai: Teropong sudah berakhir.
    taruhUbin(k, a.id, 69, 52); // titik (69, 63) kini 172 px ke bawah
    const habis = semuaSah(putaran(k, mulaiPada + 31_000));
    expect(terungkap(habis, "s1")).toEqual([]);
    expect(barisSkill(habis)).toEqual([]);
    expect(jenisKe(habis, "s1")).not.toContain("pribadi");
    // Satu putaran sebelumnya masih aktif.
    const k2 = ruang();
    const b = masuk(k2, "s2");
    const mulai2 = mulai(k2);
    susunTitik(k2, [[5, 0, 69, 63]]);
    taruhUbin(k2, b.id, 69, 52);
    beriMuatan(k2, b.id, { teropong: 1 });
    pakaiSkill(k2, "s2", "teropong", mulai2 + 1000);
    expect(terungkap(semuaSah(putaran(k2, mulai2 + 30_900)), "s2")).toEqual([k2.kejadian[5].kode]);
  });

  it("jeda menghentikan masa aktif dan pengungkapan; sesudah lanjut, sisa 12 detik tetap berlaku", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const mulaiPada = mulai(k);
    susunTitik(k, [[4, 0, 80, 50]]);
    taruhUbin(k, a.id, DIAM.x, DIAM.y);
    beriMuatan(k, a.id, { teropong: 1 });
    pakaiSkill(k, "s1", "teropong", mulaiPada + 1000); // aktif sampai waktu ronde 31.000
    semuaSah(terimaKelas(k, { v: V, t: "jeda" }, mulaiPada + 19_000));
    const selamaJeda = semuaSah(putaran(k, mulaiPada + 19_100));
    expect(selamaJeda.putaran).toBe("henti");
    expect(terungkap(selamaJeda, "s1")).toEqual([]);
    const lanjut = semuaSah(terimaKelas(k, { v: V, t: "lanjut" }, mulaiPada + 79_000));
    expect(satu(lanjut, "s1", "pribadi")?.aktifSampai).toEqual({ teropong: mulaiPada + 91_000 });
    // Waktu ronde 30.900 (jam + 60 detik jeda): masih aktif; 31.000: berakhir.
    expect(terungkap(semuaSah(putaran(k, mulaiPada + 90_900)), "s1")).toEqual([k.kejadian[4].kode]);
    susunTitik(k, [[7, 0, 80, 50]]);
    k.terlihat.set(a.id, new Set());
    expect(terungkap(semuaSah(putaran(k, mulaiPada + 91_000)), "s1")).toEqual([]);
  });

  it("ruang tanpa Teropong (ruang lama): pakai_skill diabaikan dan keadaan Teropong yang tersisa tidak mengungkap apa pun", () => {
    const k = ruang({ skillAktif: P0 });
    const a = masuk(k, "s1");
    const mulaiPada = mulai(k);
    susunTitik(k, [[0, 0, 80, 50]]);
    taruhUbin(k, a.id, DIAM.x, DIAM.y);
    const s = beriMuatan(k, a.id, { teropong: 1, angkot: 1 });
    expect(ke(pakaiSkill(k, "s1", "teropong", mulaiPada + 1000), "s1")).toEqual([]);
    s.keadaan.aktifSampaiMs.teropong = 60_000;
    expect(terungkap(semuaSah(putaran(k, mulaiPada + 1100)), "s1")).toEqual([]);
    taruhDiHalte(k, a.id, 1);
    expect(ke(naikAngkot(k, "s1", "halte-2", mulaiPada + 2000), "s1")).toEqual([]);
    expect(k.skill.get(a.id)?.keadaan.muatan).toMatchObject({ teropong: 1, angkot: 1 });
  });

  it("ruang lebih dari 50 pemain: kedua titik aktif terungkap menurut id titik, kecuali kejadiannya sudah selesai", () => {
    const k = ruang({ batasPemain: 80 });
    const a = masuk(k, "s1");
    const mulaiPada = mulai(k);
    expect(k.kejadian[2].titik).toHaveLength(2);
    susunTitik(k, [
      [2, 1, 80, 50],
      [2, 0, 69, 61],
      [3, 0, 58, 50],
      [3, 1, 69, 39],
    ]);
    selesaikan(k, a.id, k.kejadian[3].kode, mulaiPada);
    taruhUbin(k, a.id, DIAM.x, DIAM.y);
    beriMuatan(k, a.id, { teropong: 1 });
    pakaiSkill(k, "s1", "teropong", mulaiPada + 1000);
    const o = semuaSah(putaran(k, mulaiPada + 1100));
    const titik = semuaJenis(o, "s1", "kejadian_terlihat").map((p) => [p.kejadianId, p.x, p.y]);
    const [t0, t1] = k.kejadian[2].titik;
    const urut = [t0, t1].sort((p, q) => (p.id < q.id ? -1 : 1)).map((t) => [k.kejadian[2].kode, t.x, t.y]);
    expect(titik).toEqual(urut);
  });

  it("40 pemain dengan Teropong aktif: setiap pemain hanya menerima titik dalam radiusnya sendiri", () => {
    const k = ruang();
    const pemain = Array.from({ length: 40 }, (_, i) => masuk(k, `s${i}`));
    const mulaiPada = mulai(k);
    // Pemain ke-i di ubin (10 + 3i, 50) atau (10 + 3(i − 20), 70); titik kejadian ke-i (i < n) tepat 11 ubin di kanannya.
    const ubin = (i: number) => (i < 20 ? { x: 10 + 3 * i, y: 50 } : { x: 10 + 3 * (i - 20), y: 70 });
    const n = Math.min(20, k.kejadian.length);
    susunTitik(k, Array.from({ length: n }, (_, i) => [i, 0, ubin(i).x + 11, ubin(i).y] as [number, number, number, number]));
    pemain.forEach((p, i) => {
      taruhUbin(k, p.id, ubin(i).x, ubin(i).y);
      beriMuatan(k, p.id, { teropong: 1 });
      pakaiSkill(k, `s${i}`, "teropong", mulaiPada + 1000);
    });
    const o = semuaSah(putaran(k, mulaiPada + 1100));
    let lewatTeropong = 0;
    pemain.forEach((p, i) => {
      // Titik dalam 192 px dari pemain (layar 320 × 180 seluruhnya di dalam radius): di baris yang sama (y 50) saja,
      // karena baris y 70 berjarak 320 px. Titik di layar terungkap lewat JS-08, sisanya lewat Teropong.
      const q = kaki(ubin(i).x, ubin(i).y);
      const dalam = Array.from({ length: n }, (_, j) => j).filter((j) => {
        const t = { x: (ubin(j).x + 11) * 16 + 8, y: ubin(j).y * 16 + 8 };
        return Math.hypot(t.x - q.x, t.y - q.y) <= 192;
      });
      lewatTeropong += dalam.filter((j) => Math.abs((ubin(j).x + 11) * 16 + 8 - q.x) > 160).length;
      expect([...terungkap(o, `s${i}`)].sort(), p.nama).toEqual(dalam.map((j) => k.kejadian[j].kode).sort());
    });
    // Di luar layar dan di dalam radius hanya titik pemain itu sendiri (176 px di kanannya): satu per pemain baris y 50.
    expect(lewatTeropong).toBe(n);
  });
});

describe("Angkot di server (P-22; AC-8)", () => {
  it("koreksi ke titik halte tujuan (arah sama, seq gerak terakhir), lalu pribadi, lalu angkot_tiba; satu baris skill; posisi tidak ditulis", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const mulaiPada = mulai(k);
    taruhDiHalte(k, a.id, 1, "kiri");
    const p = k.pemain.get(a.id)!.posisi!;
    const langkah = arahBebas(p, 10);
    expect(jenisKe(gerak(k, "s1", a.id, langkah.x, langkah.y, mulaiPada + 1000, "kiri"), "s1")).toEqual([]);
    const seqTerakhir = seq.get(a.id)!;
    beriMuatan(k, a.id, { angkot: 1 });
    const o = naikAngkot(k, "s1", "halte-3", mulaiPada + 2000);
    const tujuan = titikHalte(halte(3));
    expect(jenisKe(o, "s1")).toEqual(["koreksi", "pribadi", "pemberitahuan"]);
    expect(satu(o, "s1", "koreksi")).toEqual({ v: V, t: "koreksi", x: tujuan.x, y: tujuan.y, seq: seqTerakhir });
    expect(satu(o, "s1", "pribadi")?.muatan.angkot).toBe(0);
    expect(satu(o, "s1", "pemberitahuan")).toEqual({ v: V, t: "pemberitahuan", kode: "angkot_tiba" });
    expect(k.pemain.get(a.id)!.posisi).toEqual({ x: tujuan.x, y: tujuan.y, arah: "kiri" });
    expect(o.simpan.map((s) => s.jenis)).toEqual(["skill"]);
    expect(JSON.parse(barisSkill(o)[0].isi)).toMatchObject({ muatan: { angkot: 0 }, pakai: { angkot: 2000 } });
    expect(JSON.parse(barisSkill(o)[0].isi).aktif.angkot).toBeUndefined();
    const g = k.gerak.get(a.id)!;
    expect([g.anggaranPx, g.gerakTerakhirMs, g.jalan, g.berubah]).toEqual([0, mulaiPada + 2000, false, true]);
  });

  it("tanpa gerak sebelumnya, seq koreksi 0", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const mulaiPada = mulai(k);
    taruhDiHalte(k, a.id, 2);
    beriMuatan(k, a.id, { angkot: 1 });
    expect(satu(naikAngkot(k, "s1", "halte-4", mulaiPada + 1000), "s1", "koreksi")?.seq).toBe(0);
  });

  it("syarat: jarak 32 dan 32,01 px dari halte asal, halte tujuan sah dan berbeda, dialog, muatan, dan status; yang ditolak tidak dijawab", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const mulaiPada = mulai(k);
    const h1 = halte(1);
    const pusat = { x: h1.x * 16 + 8, y: h1.y * 16 + 8 };
    beriMuatan(k, a.id, { angkot: 1 });
    const tolak = (halteId: string | undefined, t: number) => {
      const o = naikAngkot(k, "s1", halteId, t);
      expect(ke(o, "s1")).toEqual([]);
      expect(o.simpan).toEqual([]);
    };
    taruh(k, a.id, pusat.x - 32.01, pusat.y);
    tolak("halte-3", mulaiPada + 1000);
    taruh(k, a.id, pusat.x, pusat.y + 4);
    tolak("halte-1", mulaiPada + 1000); // halte asal
    tolak("halte-5", mulaiPada + 1000); // tidak ada di peta
    tolak(undefined, mulaiPada + 1000);
    // Dialog terbuka: kejadian di samping halte diperiksa lebih dulu.
    susunTitik(k, [[0, 0, h1.x, h1.y + 1]]);
    expect(jenisKe(kirim(k, "s1", { v: V, t: "periksa", kejadianId: k.kejadian[0].kode }, mulaiPada + 1100), "s1")).toContain("kejadian_terbuka");
    tolak("halte-3", mulaiPada + 1200);
    kirim(k, "s1", { v: V, t: "tutup_dialog", kejadianId: k.kejadian[0].kode }, mulaiPada + 1300);
    // Jeda: ditolak; sesudah lanjut, tepat 32 px dari pusat ubin halte asal: diterima.
    semuaSah(terimaKelas(k, { v: V, t: "jeda" }, mulaiPada + 1400));
    tolak("halte-3", mulaiPada + 1500);
    semuaSah(terimaKelas(k, { v: V, t: "lanjut" }, mulaiPada + 2000));
    taruh(k, a.id, pusat.x - 32, pusat.y);
    expect(jenisKe(naikAngkot(k, "s1", "halte-3", mulaiPada + 2100), "s1")).toEqual(["koreksi", "pribadi", "pemberitahuan"]);
    // Tanpa karcis lagi: ditolak di halte 3.
    tolak("halte-1", mulaiPada + 5000);
  });

  it("laporan gerak lama dari halte asal ditolak dengan koreksi ke tujuan; laporan pertama dari tujuan diterima, juga saat berlari", () => {
    const k = ruang({ peta: { ...PETA_KAMPUNG, kotak: [] } }); // tanpa kotak karcis di samping halte
    const a = masuk(k, "s1");
    const mulaiPada = mulai(k);
    taruhDiHalte(k, a.id, 1);
    beriMuatan(k, a.id, { angkot: 1, lari: 1 });
    pakaiSkill(k, "s1", "lari", mulaiPada + 1000);
    const asal = k.pemain.get(a.id)!.posisi!;
    const lama = arahBebas(asal, 8);
    naikAngkot(k, "s1", "halte-3", mulaiPada + 1500);
    const tujuan = titikHalte(halte(3));
    const o = gerak(k, "s1", a.id, lama.x, lama.y, mulaiPada + 1600);
    expect(ke(o, "s1")).toEqual([{ v: V, t: "koreksi", x: tujuan.x, y: tujuan.y, seq: seq.get(a.id) }]);
    expect(k.pemain.get(a.id)!.posisi).toMatchObject(tujuan);
    // 400 ms sesudah pindah: 50 px (lebih dari 36 + 4 px jalan, kurang dari 57,6 + 4 px lari) diterima karena Lari cepat aktif.
    const maju = arahBebas(tujuan, 50);
    expect(ke(gerak(k, "s1", a.id, maju.x, maju.y, mulaiPada + 1900), "s1")).toEqual([]);
    expect(k.pemain.get(a.id)!.posisi).toMatchObject(maju);
    expect(satu(semuaSah(putaran(k, mulaiPada + 2000)), "s1", "kejadian_terlihat")).toBeUndefined();
  });

  it("laporan pertama sesudah pindah tanpa Lari cepat: 40 px diterima, 41 px dikoreksi ke titik halte", () => {
    const k = ruang({ peta: { ...PETA_KAMPUNG, kotak: [] } });
    const a = masuk(k, "s1");
    const mulaiPada = mulai(k);
    taruhDiHalte(k, a.id, 4);
    beriMuatan(k, a.id, { angkot: 1 });
    naikAngkot(k, "s1", "halte-2", mulaiPada + 1000);
    const tujuan = titikHalte(halte(2));
    const jauh = arahBebas(tujuan, 41);
    expect(jenisKe(gerak(k, "s1", a.id, jauh.x, jauh.y, mulaiPada + 1400), "s1")).toEqual(["koreksi"]);
    const dekat = arahBebas(tujuan, 40);
    expect(ke(gerak(k, "s1", a.id, dekat.x, dekat.y, mulaiPada + 1400), "s1")).toEqual([]);
  });

  it("kotak di sepanjang garis perpindahan tidak terambil; Lari cepat dan sasaran Kompas tetap, dan Kompas tiba di putaran berikutnya", () => {
    // Kotak sepatu di ubin (80, 45), sekitar 3 px dari garis titik halte 1 (888, 1036) ke titik halte 3 (1688, 412).
    const k = ruang({ peta: { ...PETA_KAMPUNG, kotak: [{ id: "k-garis", jenis: "sepatu", x: 80, y: 45 }] } });
    const a = masuk(k, "s1");
    const mulaiPada = mulai(k);
    const h3 = halte(3);
    susunTitik(k, [[6, 0, h3.x, h3.y - 1]]); // 20 px dari titik halte 3
    taruhDiHalte(k, a.id, 1);
    beriMuatan(k, a.id, { angkot: 1, lari: 1, kompas: 1 });
    pakaiSkill(k, "s1", "lari", mulaiPada + 1000);
    const kompas = satu(pakaiSkill(k, "s1", "kompas", mulaiPada + 1000), "s1", "kompas")!;
    expect([kompas.x, kompas.y]).toEqual([h3.x, h3.y - 1]);
    const o = naikAngkot(k, "s1", "halte-3", mulaiPada + 2000);
    expect(jenisKe(o, "s1")).toEqual(["koreksi", "pribadi", "pemberitahuan"]);
    expect(satu(o, "s1", "pribadi")?.aktifSampai).toEqual({ lari: mulaiPada + 7000, kompas: mulaiPada + 21_000 });
    expect(k.skill.get(a.id)?.kotak["k-garis"]).toBeUndefined();
    expect(k.skill.get(a.id)?.keadaan.muatan.lari).toBe(0);
    expect(k.skill.get(a.id)?.kompas).toEqual({ kode: k.kejadian[6].kode, titik: k.kejadian[6].titik[0].id });
    const tiba = semuaSah(putaran(k, mulaiPada + 2100));
    expect(satu(tiba, "s1", "pribadi")?.aktifSampai).toEqual({ lari: mulaiPada + 7000 });
    expect(k.skill.get(a.id)?.kompas).toBeNull();
  });

  it("dua pemain di halte yang sama naik ke halte yang sama dalam satu detik: keduanya di titik halte tujuan", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const mulaiPada = mulai(k);
    for (const p of [a, b]) {
      taruhDiHalte(k, p.id, 2);
      beriMuatan(k, p.id, { angkot: 1 });
    }
    const oa = naikAngkot(k, "s1", "halte-1", mulaiPada + 1000);
    const ob = naikAngkot(k, "s2", "halte-1", mulaiPada + 1900);
    for (const [o, sid] of [[oa, "s1"], [ob, "s2"]] as const) expect(jenisKe(o, sid)).toEqual(["koreksi", "pribadi", "pemberitahuan"]);
    const tujuan = titikHalte(halte(1));
    expect(k.pemain.get(a.id)!.posisi).toMatchObject(tujuan);
    expect(k.pemain.get(b.id)!.posisi).toMatchObject(tujuan);
  });

  it("skema: halteId hanya berpola halte-n; pesan tanpa halteId tetap sah", () => {
    const sah = (halteId: unknown) => skemaPemain.safeParse({ v: V, t: "pakai_skill", skill: "angkot", halteId }).success;
    expect(sah("halte-1")).toBe(true);
    expect(sah("halte-42")).toBe(true);
    for (const salah of ["halte-", "halte-123", "Halte-1", "halte_1", "halte-1 ", 1, null]) expect(sah(salah), String(salah)).toBe(false);
    expect(skemaPemain.safeParse({ v: V, t: "pakai_skill", skill: "teropong" }).success).toBe(true);
    expect(skemaPemain.safeParse({ v: V, t: "pakai_skill", skill: "angkot", halteId: "halte-1", lain: 1 }).success).toBe(false);
  });
});

describe("butir perpisahan (P-23; AC-10)", () => {
  /** Ruang dengan A di halte 1, B dua ubin darinya, dan C di dekat halte 3; satu putaran sudah lewat. */
  function siapkan(atur: { batasPemain?: number } = {}) {
    const k = ruang(atur);
    const a = masuk(k, "sa");
    const b = masuk(k, "sb");
    const c = masuk(k, "sc");
    const mulaiPada = mulai(k);
    taruhDiHalte(k, a.id, 1);
    const pa = k.pemain.get(a.id)!.posisi!;
    taruh(k, b.id, pa.x + 32, pa.y);
    const t3 = titikHalte(halte(3));
    taruh(k, c.id, t3.x - 48, t3.y);
    beriMuatan(k, a.id, { angkot: 1 });
    semuaSah(putaran(k, mulaiPada + 900));
    return { k, a, b, c, mulaiPada, t3 };
  }
  const butir = (o: Keluaran, sid: string, id: string) => semuaJenis(o, sid, "dunia").flatMap((d) => d.p.filter((x) => x[0] === id));

  it("pengamat di halte asal menerima A di posisi barunya sekali; pengamat di halte tujuan melihat A di titik halte", () => {
    const { k, a, mulaiPada, t3 } = siapkan();
    naikAngkot(k, "sa", "halte-3", mulaiPada + 1000);
    expect(k.pindahHalte.has(a.id)).toBe(true);
    const o = semuaSah(putaran(k, mulaiPada + 1000));
    expect(butir(o, "sb", a.id)).toEqual([[a.id, t3.x, t3.y, "kiri", false, false]]);
    expect(butir(o, "sc", a.id)).toEqual([[a.id, t3.x, t3.y, "kiri", false, false]]);
    expect(k.pindahHalte.size).toBe(0);
    // Putaran berikutnya (kerangka penuh atau tidak): B tidak menerima A lagi, karena A di luar kotaknya.
    for (let i = 1; i <= 10; i++) expect(butir(semuaSah(putaran(k, mulaiPada + 1000 + 100 * i)), "sb", a.id)).toEqual([]);
  });

  it("butir perpisahan di luar batas 24 pemain terdekat", () => {
    const { k, a, b, mulaiPada, t3 } = siapkan();
    const pb = k.pemain.get(b.id)!.posisi!;
    const lain = Array.from({ length: 30 }, (_, i) => masuk(k, `sl${i}`, mulaiPada + 950));
    lain.forEach((p, i) => {
      taruh(k, p.id, pb.x + 4 + (i % 6) * 2, pb.y + 4 + Math.floor(i / 6) * 2); // semuanya lebih dekat ke B daripada posisi lama A
      k.gerak.get(p.id)!.berubah = true;
    });
    naikAngkot(k, "sa", "halte-3", mulaiPada + 1000);
    const dunia = semuaJenis(semuaSah(putaran(k, mulaiPada + 1000)), "sb", "dunia");
    expect(dunia).toHaveLength(1);
    expect(dunia[0].p).toHaveLength(25);
    expect(dunia[0].p.slice(0, 24).map((x) => x[0])).not.toContain(a.id);
    expect(dunia[0].p[24]).toEqual([a.id, t3.x, t3.y, "kiri", false, false]);
  });

  it("isi dunia tetap paling banyak 64 butir walaupun 66 pemain pindah sekaligus", () => {
    const k = ruang({ batasPemain: 80 });
    const b = masuk(k, "sb");
    const lompat = Array.from({ length: 66 }, (_, i) => masuk(k, `sj${i}`));
    const mulaiPada = mulai(k);
    const t1 = titikHalte(halte(1));
    taruh(k, b.id, t1.x + 32, t1.y);
    lompat.forEach((p) => {
      taruh(k, p.id, t1.x, t1.y);
      beriMuatan(k, p.id, { angkot: 1 });
    });
    semuaSah(putaran(k, mulaiPada + 900));
    lompat.forEach((p, i) => expect(jenisKe(naikAngkot(k, `sj${i}`, "halte-2", mulaiPada + 1000), `sj${i}`)).toContain("pemberitahuan"));
    const dunia = semuaJenis(semuaSah(putaran(k, mulaiPada + 1000)), "sb", "dunia");
    expect(dunia).toHaveLength(1);
    expect(dunia[0].p).toHaveLength(64);
    const t2 = titikHalte(halte(2));
    expect(dunia[0].p.every((x) => x[1] === t2.x && x[2] === t2.y)).toBe(true);
  });

  it("pengamat yang kotaknya tidak memuat posisi lama tidak menerima butir perpisahan", () => {
    const { k, a, b, mulaiPada } = siapkan();
    taruh(k, b.id, k.pemain.get(b.id)!.posisi!.x + 300, k.pemain.get(b.id)!.posisi!.y); // 332 px dari halte 1
    naikAngkot(k, "sa", "halte-3", mulaiPada + 1000);
    expect(butir(semuaSah(putaran(k, mulaiPada + 1000)), "sb", a.id)).toEqual([]);
  });

  it("Durable Object dibangunkan ulang sesudah pindah: muatan Angkot tetap 0 dari baris skill, catatan perpisahan kosong tanpa galat", () => {
    const { k, a, mulaiPada } = siapkan();
    const o = naikAngkot(k, "sa", "halte-3", mulaiPada + 1000);
    const skill = barisSkill(o).map((s) => ({ pemainId: s.pemainId, isi: s.isi }));
    const pulih = pulihkanKeadaan(
      {
        ruang: k.ruang,
        status: k.status,
        waktu: k.waktu,
        terkunci: false,
        ditutupPada: null,
        sambunganTerakhirPutus: null,
        pemain: [...k.pemain.values()],
        sambungan: [],
        kejadian: k.kejadian,
        jawaban: [],
        terlihat: [],
        skill,
      },
      PETA_KAMPUNG,
      mulaiPada + 1050,
    );
    expect(pulih.skill.get(a.id)?.keadaan.muatan.angkot).toBe(0);
    expect(pulih.pindahHalte.size).toBe(0);
    expect(() => semuaSah(putaran(pulih, mulaiPada + 1100))).not.toThrow();
  });
});
