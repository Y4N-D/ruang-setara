// Inti ruang dengan skill dan kotak bantuan (spesifikasi JS-09, P-10 sampai P-32; AC-4 sampai AC-7, AC-9 sampai
// AC-12, AC-19, AC-22). Jam tiruan: waktu selalu diberikan uji. Keadaan skill boleh diisi langsung oleh uji, seperti
// posisi pemain di uji JS-08.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { acakBerbenih } from "../../inti/acak";
import { KOTAK } from "../../inti/aturan";
import { posisiSah } from "../../inti/gerak";
import { PROTOKOL_VERSI, skemaServerPemain, type PesanPemain, type PesanServerPemain } from "../../inti/protokol";
import { skemaServerKelas } from "../../inti/protokol-kelas";
import type { Arah, KotakJenis, PengaturanRuang, SkillId, TitikPeta } from "../../inti/tipe";
import {
  alarm,
  buatKeadaan,
  pindahkanPemain,
  pulihkanKeadaan,
  putaran,
  sambunganMasuk,
  sambunganPutus,
  skorDari,
  terimaHalo,
  terimaKelas,
  terimaPemain,
  type KeadaanRuang,
  type Keluaran,
  type PetaRuang,
  type Simpanan,
} from "../../../../server/jejak-setara/src/ruang/inti-ruang";
import { jawabanBaru, jumlahTitikRuang, tempatkanRuang } from "../../../../server/jejak-setara/src/ruang/kejadian-ruang";
import { KOTAK_KAMPUNG, PETA_KAMPUNG, TITIK_PER_ZONA } from "../../../../server/jejak-setara/src/ruang/peta-kampung";
import { skillBaru, type KotakPeta, type SkillPemain } from "../../../../server/jejak-setara/src/ruang/skill-ruang";
import { MASUK } from "../ruang/bankUji";

const V = PROTOKOL_VERSI;
const SEMUA: SkillId[] = ["lari", "kompas", "petunjuk"];
const PENGATURAN: PengaturanRuang = { durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, skillAktif: SEMUA, modeNomorAbsen: false, modeNama: "daftar", uji: true };
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
const barisSkill = (o: Keluaran) => o.simpan.filter((s): s is Extract<Simpanan, { jenis: "skill" }> => s.jenis === "skill");

let nomor = 0;
const acak = acakBerbenih(11);

function ruang(atur: { batasPemain?: number; skillAktif?: SkillId[]; peta?: PetaRuang; tanpaKejadian?: boolean } = {}): KeadaanRuang {
  const batasPemain = atur.batasPemain ?? 40;
  const kejadian = atur.tanpaKejadian ? [] : tempatkanRuang(7, TITIK_PER_ZONA, MASUK, jumlahTitikRuang(batasPemain));
  const pengaturan = { ...PENGATURAN, batasPemain, skillAktif: atur.skillAktif ?? SEMUA };
  return buatKeadaan({ ruangId: "r-9", kode: "K7MPA", pengaturan, benih: 7, dibuatPada: DIBUAT }, atur.peta ?? PETA_KAMPUNG, kejadian);
}

function masuk(k: KeadaanRuang, sid: string, t = DIBUAT + 100) {
  sambunganMasuk(k, sid, t);
  nomor++;
  const token = `s${nomor}`.padEnd(43, "B");
  const calon = { pemainId: `p${nomor}`, token, hashToken: `h:${token}` };
  const o = semuaSah(terimaHalo(k, sid, { v: V, t: "halo", peran: "pemain" }, t, acak, calon, null));
  const datang = ke(o, sid)[0] as Pesan<"selamat_datang">;
  semuaSah(terimaPemain(k, sid, { v: V, t: "pilih_identitas", nama: datang.saranNama[0], avatar: 2 }, t, acak));
  return { id: calon.pemainId, token, nama: datang.saranNama[0] };
}

function mulai(k: KeadaanRuang, t = DIBUAT + 1000): { mulaiPada: number; o: Keluaran } {
  semuaSah(terimaKelas(k, { v: V, t: "mulai" }, t));
  const mulaiPada = k.waktu.mulaiPada as number;
  return { mulaiPada, o: semuaSah(alarm(k, mulaiPada, true)) };
}

const kirim = (k: KeadaanRuang, sid: string, pesan: PesanPemain, t: number) => semuaSah(terimaPemain(k, sid, pesan, t, acak));
const seq = new Map<string, number>();
function gerak(k: KeadaanRuang, sid: string, pid: string, x: number, y: number, t: number, arah: Arah = "kanan") {
  const n = (seq.get(pid) ?? 0) + 1;
  seq.set(pid, n);
  return kirim(k, sid, { v: V, t: "gerak", x, y, arah, jalan: true, seq: n }, t);
}
const pakaiSkill = (k: KeadaanRuang, sid: string, skill: SkillId, t: number, kejadianId?: string) =>
  kirim(k, sid, { v: V, t: "pakai_skill", skill, ...(kejadianId ? { kejadianId } : {}) }, t);

function taruh(k: KeadaanRuang, id: string, x: number, y: number, arah: Arah = "kanan") {
  const p = k.pemain.get(id);
  if (!p) throw new Error("pemain tidak ada");
  p.posisi = { x, y, arah };
}
/** Satu ubin di bawah titik (20 piksel dari pusatnya), seperti uji JS-08. */
const taruhDekat = (k: KeadaanRuang, id: string, t: TitikPeta) => taruh(k, id, t.x * 16 + 8, (t.y + 1) * 16 + 12, "atas");

function beriMuatan(k: KeadaanRuang, id: string, muatan: Partial<Record<SkillId, number>>): SkillPemain {
  const s = k.skill.get(id) ?? skillBaru();
  Object.assign(s.keadaan.muatan, muatan);
  k.skill.set(id, s);
  return s;
}

const grid = { lebar: PETA_KAMPUNG.lebar, tinggi: PETA_KAMPUNG.tinggi, tabrakan: PETA_KAMPUNG.tabrakan };
const ruasBebas = (x0: number, x1: number, y: number) => {
  for (let x = x0; x <= x1; x++) if (!posisiSah(grid, x, y)) return false;
  return true;
};
/** Kotak berjenis itu dengan baris datar bebas 30 px di kiri dan kanan pusatnya (titik kaki 4 px di bawah pusat). */
function kotakDatar(jenis: KotakJenis) {
  const kotak = KOTAK_KAMPUNG.find((x) => x.jenis === jenis && ruasBebas(x.x * 16 - 22, x.x * 16 + 38, x.y * 16 + 12));
  if (!kotak) throw new Error(`tidak ada kotak ${jenis} di baris datar`);
  const cx = kotak.x * 16 + 8;
  const y = kotak.y * 16 + 12;
  return { kotak, kiri: { x: cx - 20, y }, kanan: { x: cx + 20, y } };
}

/** Melewati kotak dari kiri ke kanan pada jam `t` (40 px, di dalam anggaran jalan). */
function lewati(k: KeadaanRuang, sid: string, pid: string, jenis: KotakJenis, t: number) {
  const { kotak, kiri, kanan } = kotakDatar(jenis);
  taruh(k, pid, kiri.x, kiri.y);
  return { kotak, o: gerak(k, sid, pid, kanan.x, kanan.y, t) };
}

function idBenar(k: KeadaanRuang, kode: string, terbuka: Pesan<"kejadian_terbuka">): string {
  const teks = k.kejadian.find((x) => x.kode === kode)?.isi.langkah1.opsi.find((o) => o.benar)?.teks;
  return terbuka.opsi1.find((o) => o.teks === teks)?.id ?? "";
}
function idTingkat(k: KeadaanRuang, kode: string, h1: Pesan<"hasil_1">, tingkat: "tepat" | "kurang" | "berisiko"): string {
  const isi = k.kejadian.find((x) => x.kode === kode)?.isi.langkah2.opsi ?? [];
  return h1.opsi2.find((o) => isi.find((x) => x.teks === o.teks)?.tingkat === tingkat)?.id ?? "";
}
/** Menutup dialog yang terbuka, membuka kejadian di titiknya, lalu mengunci Langkah 1 benar dan Langkah 2 dengan tingkat itu. */
function jawab(k: KeadaanRuang, sid: string, pid: string, kode: string, tingkat: "tepat" | "kurang", t: number, titik = 0) {
  const kj = k.kejadian.find((x) => x.kode === kode)!;
  const terbukaLama = k.dialog.get(pid);
  if (terbukaLama !== undefined) kirim(k, sid, { v: V, t: "tutup_dialog", kejadianId: terbukaLama }, t - 50);
  taruhDekat(k, pid, kj.titik[titik]);
  const terbuka = satu(kirim(k, sid, { v: V, t: "periksa", kejadianId: kode }, t), sid, "kejadian_terbuka")!;
  const h1 = satu(kirim(k, sid, { v: V, t: "kunci_1", kejadianId: kode, opsiId: idBenar(k, kode, terbuka) }, t + 100), sid, "hasil_1")!;
  return kirim(k, sid, { v: V, t: "kunci_2", kejadianId: kode, opsiId: idTingkat(k, kode, h1, tingkat) }, t + 200);
}

describe("mengambil kotak dari ruas gerak (P-16, P-17; AC-7)", () => {
  it("hanya di status main: satu baris skill, lalu pribadi dan pemberitahuan kotak_lari", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    expect(barisSkill(lewati(k, "s1", a.id, "sepatu", DIBUAT + 3000).o)).toEqual([]); // lobi
    semuaSah(terimaKelas(k, { v: V, t: "mulai" }, DIBUAT + 4000));
    const hm = lewati(k, "s1", a.id, "sepatu", DIBUAT + 5000).o; // hitung mundur
    expect(barisSkill(hm)).toEqual([]);
    expect(jenisKe(hm, "s1")).not.toContain("pemberitahuan");
    semuaSah(alarm(k, k.waktu.mulaiPada as number, true));
    const mulaiPada = k.waktu.mulaiPada as number;
    const { kotak, o } = lewati(k, "s1", a.id, "sepatu", mulaiPada + 2000);
    expect(jenisKe(o, "s1")).toEqual(["pribadi", "pemberitahuan"]);
    expect(satu(o, "s1", "pemberitahuan")?.kode).toBe("kotak_lari");
    const pribadi = satu(o, "s1", "pribadi")!;
    expect(pribadi.muatan).toEqual({ lari: 1, kompas: 0, petunjuk: 0, teropong: 0, angkot: 0 });
    expect(pribadi.kotakMenunggu).toEqual([{ id: kotak.id, siapPada: mulaiPada + 2000 + KOTAK.munculLagiMs }]);
    expect(barisSkill(o)).toHaveLength(1);
    expect(JSON.parse(barisSkill(o)[0].isi)).toMatchObject({ muatan: { lari: 1 }, kotak: { [kotak.id]: 2000 } });
    expect(o.pribadi).toBe(1);
  });

  it("kotak yang sama belum siap 90 detik waktu ronde; muatan penuh: tidak terambil dan tetap siap", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    lewati(k, "s1", a.id, "sepatu", mulaiPada + 1000);
    // Laporan berselang 600 ms agar anggaran jarak cukup; batas tepatnya diuji di skill-ruang.test.ts.
    expect(barisSkill(lewati(k, "s1", a.id, "sepatu", mulaiPada + 1000 + KOTAK.munculLagiMs - 600).o)).toEqual([]);
    expect(satu(lewati(k, "s1", a.id, "sepatu", mulaiPada + 1000 + KOTAK.munculLagiMs).o, "s1", "pribadi")?.muatan.lari).toBe(2);
    // Kotak sepatu lain dengan muatan penuh: tidak terambil, tidak ada pesan, dan tidak masuk kotakMenunggu.
    const lain = KOTAK_KAMPUNG.filter((x) => x.jenis === "sepatu").find((x) => x.id !== kotakDatar("sepatu").kotak.id && ruasBebas(x.x * 16 - 22, x.x * 16 + 38, x.y * 16 + 12))!;
    taruh(k, a.id, lain.x * 16 - 12, lain.y * 16 + 12);
    const penuh = gerak(k, "s1", a.id, lain.x * 16 + 28, lain.y * 16 + 12, mulaiPada + 100_000);
    expect(ke(penuh, "s1")).toEqual([]);
    expect(k.skill.get(a.id)?.kotak[lain.id]).toBeUndefined();
  });

  it("dua kotak dalam satu ruas: satu baris skill, satu pribadi, dua pemberitahuan menurut urutan id", () => {
    const { kiri } = kotakDatar("sepatu");
    const tx = Math.floor(kiri.x / 16) + 1;
    const ty = Math.floor(kiri.y / 16);
    const kotak: KotakPeta[] = [
      { id: "k-a", jenis: "sepatu", x: tx, y: ty },
      { id: "k-b", jenis: "buku", x: tx + 1, y: ty },
    ];
    const k = ruang({ peta: { ...PETA_KAMPUNG, kotak } });
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    taruh(k, a.id, tx * 16, ty * 16 + 12);
    const o = gerak(k, "s1", a.id, tx * 16 + 40, ty * 16 + 12, mulaiPada + 1000);
    expect(jenisKe(o, "s1")).toEqual(["pribadi", "pemberitahuan", "pemberitahuan"]);
    expect(ke(o, "s1").filter((p) => p.t === "pemberitahuan").map((p) => (p as Pesan<"pemberitahuan">).kode)).toEqual(["kotak_lari", "kotak_petunjuk"]);
    expect(barisSkill(o)).toHaveLength(1);
  });

  it("gerak yang ditolak, koreksi, dan pindahkan tidak mengambil kotak; ambil_kotak diabaikan tanpa jawaban", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const { kotak, kiri, kanan } = kotakDatar("kompas");
    taruh(k, a.id, kiri.x - 60, kiri.y);
    const tolak = gerak(k, "s1", a.id, kanan.x, kanan.y, mulaiPada + 1000); // 100 px: terlalu cepat
    expect(jenisKe(tolak, "s1")).toEqual(["koreksi"]);
    expect(barisSkill(tolak)).toEqual([]);
    const pindah = pindahkanPemain(k, a.nama, kotak.x, kotak.y, mulaiPada + 2000);
    expect(typeof pindah).toBe("object");
    expect(barisSkill(pindah as Keluaran)).toEqual([]);
    expect(jenisKe(pindah as Keluaran, "s1")).toEqual(["koreksi"]);
    expect(ke(kirim(k, "s1", { v: V, t: "ambil_kotak", kotakId: kotak.id }, mulaiPada + 2100), "s1")).toEqual([]);
    expect(k.skill.get(a.id)).toBeUndefined();
    // Gerak pertama sesudah pindahkan: ruasnya mulai di ubin kotak, jadi kotak terambil.
    const p = k.pemain.get(a.id)!.posisi!;
    const sesudah = gerak(k, "s1", a.id, p.x + 4, p.y, mulaiPada + 3000);
    expect(satu(sesudah, "s1", "pemberitahuan")?.kode).toBe("kotak_kompas");
  });
});

describe("Lari cepat (P-19, P-21; AC-9)", () => {
  it("aktif 6 detik; anggaran jarak lari berlaku sampai tepat 500 ms sesudahnya", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const { mulaiPada } = mulai(k);
    beriMuatan(k, a.id, { lari: 1 });
    beriMuatan(k, b.id, { lari: 1 });
    const o = pakaiSkill(k, "s1", "lari", mulaiPada + 1000);
    expect(jenisKe(o, "s1")).toEqual(["pribadi"]);
    expect(satu(o, "s1", "pribadi")).toMatchObject({ muatan: { lari: 0 }, aktifSampai: { lari: mulaiPada + 7000 } });
    expect(barisSkill(o)).toHaveLength(1);
    pakaiSkill(k, "s2", "lari", mulaiPada + 1000);
    // Lorong datar di baris kaki y = 108 (ubin y = 6), bebas dari x = 520 sampai 760.
    expect(ruasBebas(520, 760, 108) && ruasBebas(520, 760, 124)).toBe(true);
    taruh(k, a.id, 520, 108);
    taruh(k, b.id, 520, 124);
    expect(jenisKe(gerak(k, "s1", a.id, 580, 108, mulaiPada + 4000), "s1")).toEqual([]); // 60 px saat berlari
    expect(jenisKe(gerak(k, "s1", a.id, 640, 108, mulaiPada + 7500), "s1")).toEqual([]); // tepat 500 ms sesudahnya
    expect(jenisKe(gerak(k, "s2", b.id, 580, 124, mulaiPada + 7501), "s2")).toEqual(["koreksi"]); // 501 ms: kecepatan jalan
    // Dipakai lagi selama aktif: ditolak tanpa jawaban (D-1a).
    beriMuatan(k, a.id, { lari: 1 });
    expect(ke(pakaiSkill(k, "s1", "lari", mulaiPada + 2000), "s1")).toEqual([]);
  });

  it("Lari cepat yang habis karena waktu tidak menulis baris dan tidak mengirim pribadi", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    beriMuatan(k, a.id, { lari: 1 });
    pakaiSkill(k, "s1", "lari", mulaiPada + 1000);
    const o = semuaSah(putaran(k, mulaiPada + 7100));
    expect(barisSkill(o)).toEqual([]);
    expect(jenisKe(o, "s1")).not.toContain("pribadi");
  });
});

describe("Kompas kejadian (P-24, P-25; AC-10)", () => {
  it("sasaran titik terdekat termasuk kejadian yang belum terlihat: kompas lalu pribadi, satu baris skill", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const kj = k.kejadian[3];
    taruhDekat(k, a.id, kj.titik[0]);
    expect(k.terlihat.get(a.id)?.has(kj.titik[0].id) ?? false).toBe(false);
    beriMuatan(k, a.id, { kompas: 2 });
    const o = pakaiSkill(k, "s1", "kompas", mulaiPada + 3000);
    expect(jenisKe(o, "s1")).toEqual(["kompas", "pribadi"]);
    expect(satu(o, "s1", "kompas")).toEqual({ v: V, t: "kompas", x: kj.titik[0].x, y: kj.titik[0].y, berakhirPada: mulaiPada + 23_000 });
    expect(satu(o, "s1", "pribadi")).toMatchObject({ muatan: { kompas: 1 }, aktifSampai: { kompas: mulaiPada + 23_000 } });
    expect(barisSkill(o)).toHaveLength(1);
    expect(k.skill.get(a.id)?.kompas).toEqual({ kode: kj.kode, titik: kj.titik[0].id });
    // Pemain yang sudah dalam 32 px dari sasarannya: Kompas berakhir di putaran berikutnya.
    const tiba = semuaSah(putaran(k, mulaiPada + 3100));
    expect(barisSkill(tiba)).toHaveLength(1);
    const pribadi = ke(tiba, "s1").find((p) => p.t === "pribadi") as Pesan<"pribadi">;
    expect(pribadi.aktifSampai.kompas).toBeUndefined();
    expect(k.skill.get(a.id)?.kompas).toBeNull();
  });

  it("habis karena waktu: sasaran dilupakan tanpa pesan dan tanpa baris; sasaran tidak berganti karena pemain berpindah", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    taruhDekat(k, a.id, k.kejadian[0].titik[0]);
    k.pemain.get(a.id)!.posisi!.y += 48; // 68 px dari pusat titik: belum tiba
    beriMuatan(k, a.id, { kompas: 1 });
    const sasaran = satu(pakaiSkill(k, "s1", "kompas", mulaiPada + 1000), "s1", "kompas")!;
    taruhDekat(k, a.id, k.kejadian[5].titik[0]);
    k.pemain.get(a.id)!.posisi!.y += 48;
    const pindah = semuaSah(putaran(k, mulaiPada + 1100));
    expect(jenisKe(pindah, "s1")).not.toContain("kompas");
    expect(k.skill.get(a.id)?.kompas?.kode).toBe(k.kejadian[0].kode);
    expect(sasaran.x).toBe(k.kejadian[0].titik[0].x);
    const habis = semuaSah(putaran(k, mulaiPada + 21_000));
    expect(barisSkill(habis)).toEqual([]);
    expect(jenisKe(habis, "s1")).not.toContain("pribadi");
    expect(k.skill.get(a.id)?.kompas).toBeNull();
  });

  it("tanpa sasaran: hanya pemberitahuan kompas_tanpa_sasaran, muatan tidak berubah", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const jaw = new Map(k.kejadian.map((kj) => [kj.kode, { ...jawabanBaru(7, a.id, kj.kode, mulaiPada), status: "selesai" as const }]));
    k.jawaban.set(a.id, jaw);
    beriMuatan(k, a.id, { kompas: 1 });
    const o = pakaiSkill(k, "s1", "kompas", mulaiPada + 1000);
    expect(ke(o, "s1")).toEqual([{ v: V, t: "pemberitahuan", kode: "kompas_tanpa_sasaran" }]);
    expect(o.simpan).toEqual([]);
    expect(k.skill.get(a.id)?.keadaan.muatan.kompas).toBe(1);
  });

  it("ruang 80 pemain: sasaran titik kedua bila lebih dekat; dijawab di titik lain: kompas baru dengan berakhirPada yang sama", () => {
    const k = ruang({ batasPemain: 80 });
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const kj = k.kejadian[2];
    expect(kj.titik).toHaveLength(2);
    taruhDekat(k, a.id, kj.titik[1]);
    k.pemain.get(a.id)!.posisi!.y += 24; // 44 px: belum tiba
    beriMuatan(k, a.id, { kompas: 1 });
    const awal = satu(pakaiSkill(k, "s1", "kompas", mulaiPada + 1000), "s1", "kompas")!;
    expect({ x: awal.x, y: awal.y }).toEqual({ x: kj.titik[1].x, y: kj.titik[1].y });
    const o = jawab(k, "s1", a.id, kj.kode, "kurang", mulaiPada + 2000, 0);
    expect(jenisKe(o, "s1")).toEqual(["hasil_2", "kompas", "pribadi"]);
    const baru = satu(o, "s1", "kompas")!;
    expect(baru.berakhirPada).toBe(awal.berakhirPada);
    expect(k.skill.get(a.id)?.kompas?.kode).not.toBe(kj.kode);
    expect(barisSkill(o)).toHaveLength(1);
  });

  it("sasaran terakhir dijawab tanpa kejadian lain: Kompas berakhir dengan pribadi tanpa aktifSampai.kompas", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const sisa = k.kejadian[4];
    const jaw = new Map(k.kejadian.filter((x) => x !== sisa).map((kj) => [kj.kode, { ...jawabanBaru(7, a.id, kj.kode, mulaiPada), status: "selesai" as const }]));
    k.jawaban.set(a.id, jaw);
    taruhDekat(k, a.id, sisa.titik[0]);
    k.pemain.get(a.id)!.posisi!.y += 48;
    beriMuatan(k, a.id, { kompas: 2 });
    expect(satu(pakaiSkill(k, "s1", "kompas", mulaiPada + 1000), "s1", "kompas")?.x).toBe(sisa.titik[0].x);
    const o = jawab(k, "s1", a.id, sisa.kode, "kurang", mulaiPada + 2000);
    expect(jenisKe(o, "s1")).toEqual(["hasil_2", "pribadi"]);
    expect(satu(o, "s1", "pribadi")?.aktifSampai.kompas).toBeUndefined();
    expect(barisSkill(o)).toHaveLength(1);
    expect(k.skill.get(a.id)?.kompas).toBeNull();
  });
});

describe("Petunjuk (P-28, P-30, P-31, P-45; AC-11)", () => {
  it("di Langkah 1 dialog: petunjuk lalu pribadi; baris skill, baris petunjuk, dan baris jawaban D1 bertanda Petunjuk", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const kj = k.kejadian[6];
    beriMuatan(k, a.id, { petunjuk: 2 });
    // Di luar dialog: diabaikan.
    expect(ke(pakaiSkill(k, "s1", "petunjuk", mulaiPada + 500, kj.kode), "s1")).toEqual([]);
    taruhDekat(k, a.id, kj.titik[0]);
    const terbuka = satu(kirim(k, "s1", { v: V, t: "periksa", kejadianId: kj.kode }, mulaiPada + 1000), "s1", "kejadian_terbuka")!;
    expect(ke(pakaiSkill(k, "s1", "petunjuk", mulaiPada + 1100, k.kejadian[7].kode), "s1")).toEqual([]); // kejadian lain
    expect(ke(pakaiSkill(k, "s1", "petunjuk", mulaiPada + 1100), "s1")).toEqual([]); // tanpa kejadianId
    const o = pakaiSkill(k, "s1", "petunjuk", mulaiPada + 1200, kj.kode);
    expect(jenisKe(o, "s1")).toEqual(["petunjuk", "pribadi"]);
    const pet = satu(o, "s1", "petunjuk")!;
    expect(pet.kejadianId).toBe(kj.kode);
    expect(pet.kalimat).toBe(kj.isi.langkah1.petunjuk);
    const dicoret = terbuka.opsi1.find((x) => x.id === pet.opsiDicoret);
    expect(dicoret).toBeDefined();
    expect(dicoret?.id).not.toBe(idBenar(k, kj.kode, terbuka));
    expect(satu(o, "s1", "pribadi")?.muatan.petunjuk).toBe(1);
    expect(o.simpan.map((s) => s.jenis)).toEqual(["skill", "petunjuk"]);
    expect(o.simpan[1]).toMatchObject({ jenis: "petunjuk", pemainId: a.id, kode: kj.kode });
    expect(o.kiriman).toHaveLength(1);
    expect(o.kiriman[0]).toMatchObject({ jenis: "jawaban", isi: { petunjukDipakai: 1 } });
    // Sekali per kejadian: pemakaian kedua diabaikan dan muatan tetap.
    expect(ke(pakaiSkill(k, "s1", "petunjuk", mulaiPada + 5000, kj.kode), "s1")).toEqual([]);
    expect(k.skill.get(a.id)?.keadaan.muatan.petunjuk).toBe(1);
    // Periksa diulang untuk dialog yang sama, lalu dialog ditutup dan dibuka lagi: petunjuk yang sama tanpa muatan berkurang.
    expect(ke(kirim(k, "s1", { v: V, t: "periksa", kejadianId: kj.kode }, mulaiPada + 5100), "s1")).toEqual([terbuka, pet]);
    kirim(k, "s1", { v: V, t: "tutup_dialog", kejadianId: kj.kode }, mulaiPada + 5200);
    const lagi = kirim(k, "s1", { v: V, t: "periksa", kejadianId: kj.kode }, mulaiPada + 5300);
    expect(ke(lagi, "s1")).toEqual([terbuka, pet]);
    expect(lagi.simpan).toEqual([]);
    // Kunci Langkah 1: baris D1 tetap bertanda Petunjuk; sesudahnya petunjuk tidak dikirim lagi dan tidak bisa dipakai.
    const k1 = kirim(k, "s1", { v: V, t: "kunci_1", kejadianId: kj.kode, opsiId: idBenar(k, kj.kode, terbuka) }, mulaiPada + 6000);
    expect(k1.kiriman.find((x) => x.jenis === "jawaban")).toMatchObject({ isi: { petunjukDipakai: 1 } });
    expect(jenisKe(kirim(k, "s1", { v: V, t: "periksa", kejadianId: kj.kode }, mulaiPada + 6100), "s1")).toEqual(["kejadian_terbuka", "hasil_1"]);
    beriMuatan(k, a.id, { petunjuk: 2 });
    expect(ke(pakaiSkill(k, "s1", "petunjuk", mulaiPada + 9000, kj.kode), "s1")).toEqual([]);
  });

  it("skor tidak berubah karena Petunjuk; jawaban tanpa Petunjuk bertanda 0 di D1", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const { mulaiPada } = mulai(k);
    const kj = k.kejadian[1];
    beriMuatan(k, a.id, { petunjuk: 1 });
    taruhDekat(k, a.id, kj.titik[0]);
    taruhDekat(k, b.id, kj.titik[0]);
    const ta = satu(kirim(k, "s1", { v: V, t: "periksa", kejadianId: kj.kode }, mulaiPada + 1000), "s1", "kejadian_terbuka")!;
    const tb = satu(kirim(k, "s2", { v: V, t: "periksa", kejadianId: kj.kode }, mulaiPada + 1000), "s2", "kejadian_terbuka")!;
    pakaiSkill(k, "s1", "petunjuk", mulaiPada + 1500, kj.kode);
    const ka = kirim(k, "s1", { v: V, t: "kunci_1", kejadianId: kj.kode, opsiId: idBenar(k, kj.kode, ta) }, mulaiPada + 3000);
    const kb = kirim(k, "s2", { v: V, t: "kunci_1", kejadianId: kj.kode, opsiId: idBenar(k, kj.kode, tb) }, mulaiPada + 3000);
    expect(satu(ka, "s1", "hasil_1")?.poin).toBe(satu(kb, "s2", "hasil_1")?.poin);
    expect(skorDari(k, a.id)).toEqual(skorDari(k, b.id));
    expect(kb.kiriman.find((x) => x.jenis === "jawaban")).toMatchObject({ isi: { petunjukDipakai: 0 } });
  });
});

describe("+1 Kompas dari jawaban tepat (P-32; AC-12)", () => {
  it("tepat dengan muatan kurang dari 2: hasil_2, pemberitahuan kompas_tepat, lalu pribadi; satu baris skill", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const o = jawab(k, "s1", a.id, k.kejadian[0].kode, "tepat", mulaiPada + 1000);
    expect(jenisKe(o, "s1")).toEqual(["hasil_2", "pemberitahuan", "pribadi"]);
    expect(satu(o, "s1", "pemberitahuan")?.kode).toBe("kompas_tepat");
    expect(satu(o, "s1", "pribadi")?.muatan.kompas).toBe(1);
    expect(barisSkill(o)).toHaveLength(1);
  });

  it("tanpa tambahan bila muatan penuh, tingkat bukan tepat, atau Kompas dimatikan", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    beriMuatan(k, a.id, { kompas: 2 });
    const penuh = jawab(k, "s1", a.id, k.kejadian[0].kode, "tepat", mulaiPada + 1000);
    expect(jenisKe(penuh, "s1")).toEqual(["hasil_2", "pribadi"]);
    expect(barisSkill(penuh)).toEqual([]);
    beriMuatan(k, a.id, { kompas: 0 });
    expect(jenisKe(jawab(k, "s1", a.id, k.kejadian[1].kode, "kurang", mulaiPada + 3000), "s1")).toEqual(["hasil_2", "pribadi"]);
    const mati = ruang({ skillAktif: ["lari", "petunjuk"] });
    const b = masuk(mati, "s2");
    const m = mulai(mati);
    const o = jawab(mati, "s2", b.id, mati.kejadian[0].kode, "tepat", m.mulaiPada + 1000);
    expect(jenisKe(o, "s2")).toEqual(["hasil_2", "pribadi"]);
    expect(satu(o, "s2", "pribadi")?.muatan.kompas).toBe(0);
  });
});

describe("jeda, sambung ulang, dan pemulihan (P-12, P-13; AC-4, AC-5)", () => {
  it("jeda 10 detik menggeser aktifSampai, berakhirPada, dan siapPada tepat 10 detik di pribadi sesudah lanjut", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const { kotak } = lewati(k, "s1", a.id, "sepatu", mulaiPada + 500);
    taruhDekat(k, a.id, k.kejadian[0].titik[0]);
    k.pemain.get(a.id)!.posisi!.y += 48;
    beriMuatan(k, a.id, { kompas: 1 });
    pakaiSkill(k, "s1", "lari", mulaiPada + 1000);
    const awal = satu(pakaiSkill(k, "s1", "kompas", mulaiPada + 1000), "s1", "pribadi")!;
    expect(awal.aktifSampai).toEqual({ lari: mulaiPada + 7000, kompas: mulaiPada + 21_000 });
    semuaSah(terimaKelas(k, { v: V, t: "jeda" }, mulaiPada + 5000));
    // Selama jeda, rumus yang sama (tanpa jeda yang sedang berjalan) memberi jam yang sama.
    const putus = sambunganPutus(k, "s1", mulaiPada + 6000);
    expect(putus.simpan.filter((s) => s.jenis === "skill")).toEqual([]);
    const lanjut = semuaSah(terimaKelas(k, { v: V, t: "lanjut" }, mulaiPada + 15_000));
    expect(ke(lanjut, "s1")).toEqual([]); // terputus
    sambunganMasuk(k, "s3", mulaiPada + 15_100);
    const kembali = semuaSah(terimaHalo(k, "s3", { v: V, t: "halo", peran: "pemain", token: a.token }, mulaiPada + 15_100, acak, { pemainId: "x", token: "y".repeat(43), hashToken: "x" }, `h:${a.token}`));
    const pribadi = satu(kembali, "s3", "pribadi")!;
    expect(pribadi.aktifSampai).toEqual({ lari: mulaiPada + 17_000, kompas: mulaiPada + 31_000 });
    expect(pribadi.kotakMenunggu).toEqual([{ id: kotak.id, siapPada: mulaiPada + 500 + KOTAK.munculLagiMs + 10_000 }]);
    expect(satu(kembali, "s3", "kompas")?.berakhirPada).toBe(mulaiPada + 31_000);
    const urutan = jenisKe(kembali, "s3");
    expect(urutan.indexOf("kompas")).toBeGreaterThan(urutan.indexOf("pribadi"));
  });

  it("lanjut mengirim pribadi dengan waktu yang sudah bergeser kepada pemain yang tersambung", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    beriMuatan(k, a.id, { lari: 1 });
    pakaiSkill(k, "s1", "lari", mulaiPada + 1000);
    semuaSah(terimaKelas(k, { v: V, t: "jeda" }, mulaiPada + 2000));
    const lanjut = semuaSah(terimaKelas(k, { v: V, t: "lanjut" }, mulaiPada + 62_000));
    expect(satu(lanjut, "s1", "pribadi")?.aktifSampai).toEqual({ lari: mulaiPada + 67_000 });
  });

  it("pemulihan dari baris skill dan petunjuk menghasilkan keadaan dan pribadi yang sama; ruang tanpa baris skill pulih dengan muatan 0", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const simpan: Simpanan[] = [];
    simpan.push(...lewati(k, "s1", a.id, "buku", mulaiPada + 500).o.simpan);
    const kj = k.kejadian[9];
    taruhDekat(k, a.id, kj.titik[0]);
    simpan.push(...kirim(k, "s1", { v: V, t: "periksa", kejadianId: kj.kode }, mulaiPada + 1000).simpan);
    simpan.push(...pakaiSkill(k, "s1", "petunjuk", mulaiPada + 1100, kj.kode).simpan);
    const skill = new Map<string, string>();
    for (const s of simpan) if (s.jenis === "skill") skill.set(s.pemainId, s.isi);
    const petunjuk = simpan.flatMap((s) => (s.jenis === "petunjuk" ? [{ pemainId: s.pemainId, kode: s.kode, opsi: s.opsi }] : []));
    const dasar = {
      ruang: k.ruang,
      status: k.status,
      waktu: k.waktu,
      terkunci: false,
      ditutupPada: null,
      sambunganTerakhirPutus: null,
      pemain: [...k.pemain.values()],
      sambungan: [{ sambunganId: "s1", pemainId: a.id, dialog: kj.kode }],
      kejadian: k.kejadian,
      jawaban: [...k.jawaban.get(a.id)!.values()],
      terlihat: [],
    };
    const pulih = pulihkanKeadaan({ ...dasar, skill: [...skill].map(([pemainId, isi]) => ({ pemainId, isi })), petunjuk }, PETA_KAMPUNG, mulaiPada + 2000);
    expect(pulih.skill.get(a.id)).toEqual(k.skill.get(a.id));
    expect(pulih.petunjuk.get(a.id)).toEqual(k.petunjuk.get(a.id));
    expect(ke(kirim(pulih, "s1", { v: V, t: "periksa", kejadianId: kj.kode }, mulaiPada + 2100), "s1").map((p) => p.t)).toEqual(["kejadian_terbuka", "petunjuk"]);
    const lama = pulihkanKeadaan(dasar, PETA_KAMPUNG, mulaiPada + 2000);
    expect(lama.skill.size).toBe(0);
    const p = lama.pemain.get(a.id)!;
    taruh(lama, a.id, p.posisi!.x, p.posisi!.y);
    const tepat = jawab(lama, "s1", a.id, k.kejadian[0].kode, "kurang", mulaiPada + 3000);
    expect(satu(tepat, "s1", "pribadi")?.muatan).toEqual({ lari: 0, kompas: 0, petunjuk: 0, teropong: 0, angkot: 0 });
  });
});

describe("skill yang dimatikan (P-10; AC-19)", () => {
  it("ruang tanpa skill: kotak dan pakai_skill tidak mengubah apa pun, pribadi bermuatan 0 dan kosong", () => {
    const k = ruang({ skillAktif: [] });
    const a = masuk(k, "s1");
    const { mulaiPada, o } = mulai(k);
    expect(satu(o, "s1", "pribadi")).toMatchObject({ muatan: { lari: 0, kompas: 0, petunjuk: 0 }, aktifSampai: {}, kotakMenunggu: [] });
    (["sepatu", "kompas", "buku"] as const).forEach((jenis, i) => expect(ke(lewati(k, "s1", a.id, jenis, mulaiPada + 1000 * (i + 1)).o, "s1")).toEqual([]));
    beriMuatan(k, a.id, { lari: 1, kompas: 1 });
    expect(ke(pakaiSkill(k, "s1", "lari", mulaiPada + 20_000), "s1")).toEqual([]);
    expect(ke(pakaiSkill(k, "s1", "kompas", mulaiPada + 20_000), "s1")).toEqual([]);
    expect(ke(pakaiSkill(k, "s1", "teropong", mulaiPada + 20_000), "s1")).toEqual([]);
  });

  it("ruang tanpa Petunjuk: kotak buku tidak terambil dan Petunjuk diabaikan; skill lain tetap berjalan", () => {
    const k = ruang({ skillAktif: ["lari", "kompas"] });
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    expect(ke(lewati(k, "s1", a.id, "buku", mulaiPada + 1000).o, "s1")).toEqual([]);
    expect(satu(lewati(k, "s1", a.id, "sepatu", mulaiPada + 2000).o, "s1", "pemberitahuan")?.kode).toBe("kotak_lari");
    beriMuatan(k, a.id, { petunjuk: 1 });
    const kj = k.kejadian[0];
    taruhDekat(k, a.id, kj.titik[0]);
    kirim(k, "s1", { v: V, t: "periksa", kejadianId: kj.kode }, mulaiPada + 3000);
    expect(ke(pakaiSkill(k, "s1", "petunjuk", mulaiPada + 3100, kj.kode), "s1")).toEqual([]);
  });

  it("status selain main: pakai_skill diabaikan (lobi, jeda, selesai)", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    beriMuatan(k, a.id, { lari: 2 });
    expect(ke(pakaiSkill(k, "s1", "lari", DIBUAT + 500), "s1")).toEqual([]);
    const { mulaiPada } = mulai(k);
    semuaSah(terimaKelas(k, { v: V, t: "jeda" }, mulaiPada + 1000));
    expect(ke(pakaiSkill(k, "s1", "lari", mulaiPada + 2000), "s1")).toEqual([]);
    semuaSah(terimaKelas(k, { v: V, t: "lanjut" }, mulaiPada + 3000));
    semuaSah(terimaKelas(k, { v: V, t: "akhiri" }, mulaiPada + 4000));
    expect(ke(pakaiSkill(k, "s1", "lari", mulaiPada + 5000), "s1")).toEqual([]);
    expect(k.skill.get(a.id)?.keadaan.muatan.lari).toBe(2);
  });
});

describe("tabel SQLite ruang (P-14; AC-6)", () => {
  it("skill dan petunjuk dibuat dengan IF NOT EXISTS, ditulis dengan upsert, dan dibaca saat pemulihan", () => {
    const sumber = readFileSync(new URL("../../../../server/jejak-setara/src/ruang/RuangJejak.ts", import.meta.url), "utf8");
    expect(sumber).toContain('"CREATE TABLE IF NOT EXISTS skill (pemain_id TEXT PRIMARY KEY, isi_json TEXT NOT NULL)"');
    expect(sumber).toContain('"CREATE TABLE IF NOT EXISTS petunjuk (pemain_id TEXT NOT NULL, kode TEXT NOT NULL, opsi TEXT NOT NULL, PRIMARY KEY (pemain_id, kode))"');
    expect(sumber).toMatch(/INSERT INTO skill \(pemain_id, isi_json\) VALUES \(\?, \?\) ON CONFLICT\(pemain_id\) DO UPDATE SET isi_json = excluded\.isi_json/);
    expect(sumber).toMatch(/INSERT INTO petunjuk \(pemain_id, kode, opsi\) VALUES \(\?, \?, \?\) ON CONFLICT\(pemain_id, kode\) DO NOTHING/);
    expect(sumber).toMatch(/SELECT pemain_id, isi_json FROM skill/);
    expect(sumber).toMatch(/SELECT pemain_id, kode, opsi FROM petunjuk/);
  });
});
