// Inti ruang dengan kejadian (spesifikasi JS-08, P-10 sampai P-12, P-26 sampai P-37, P-55, P-56, P-63, P-67;
// AC-4, AC-7, AC-9 sampai AC-16). Jam tiruan: waktu selalu diberikan uji.
import { describe, expect, it } from "vitest";
import { acakBerbenih } from "../../inti/acak";
import { PROTOKOL_VERSI, skemaServerKelas, skemaServerPemain, type PesanPemain, type PesanServerPemain } from "../../inti/protokol";
import type { PengaturanRuang, TitikPeta } from "../../inti/tipe";
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
  waktuRondePada,
  type KeadaanRuang,
  type Keluaran,
  type Simpanan,
} from "../../../../server/jejak-setara/src/ruang/inti-ruang";
import { JEDA_PRIBADI_MS, jumlahTitikRuang, pusatTitik, tempatkanRuang, type JawabanRuang } from "../../../../server/jejak-setara/src/ruang/kejadian-ruang";
import { PETA_KAMPUNG, TITIK_PER_ZONA } from "../../../../server/jejak-setara/src/ruang/peta-kampung";
import { MASUK } from "./bankUji";

const V = PROTOKOL_VERSI;
const PENGATURAN: PengaturanRuang = { durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, skillAktif: [], modeNomorAbsen: false, uji: true };
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

let nomor = 0;
const acak = acakBerbenih(9);

function ruang(batasPemain = 40): KeadaanRuang {
  const kejadian = tempatkanRuang(7, TITIK_PER_ZONA, MASUK, jumlahTitikRuang(batasPemain));
  return buatKeadaan({ ruangId: "r-8", kode: "K7MPA", pengaturan: { ...PENGATURAN, batasPemain }, benih: 7, dibuatPada: DIBUAT }, PETA_KAMPUNG, kejadian);
}

function masuk(k: KeadaanRuang, sid: string, t = DIBUAT + 100) {
  sambunganMasuk(k, sid, t);
  nomor++;
  const token = `t${nomor}`.padEnd(43, "A");
  const calon = { pemainId: `p${nomor}`, token, hashToken: `h:${token}` };
  const o = semuaSah(terimaHalo(k, sid, { v: V, t: "halo", peran: "pemain" }, t, acak, calon, null));
  const datang = ke(o, sid)[0] as Pesan<"selamat_datang">;
  semuaSah(terimaPemain(k, sid, { v: V, t: "pilih_identitas", nama: datang.saranNama[0], avatar: 1 }, t, acak));
  return { id: calon.pemainId, token, nama: datang.saranNama[0] };
}

/** Mulai ronde: hitung mundur, lalu alarm saat mulaiPada (status main). Mengembalikan jam mulai. */
function mulai(k: KeadaanRuang, t = DIBUAT + 1000): { mulaiPada: number; o: Keluaran } {
  semuaSah(terimaKelas(k, { v: V, t: "mulai" }, t));
  const mulaiPada = k.waktu.mulaiPada as number;
  return { mulaiPada, o: semuaSah(alarm(k, mulaiPada, true)) };
}

/** Menaruh pemain satu ubin di bawah titik (20 piksel dari pusatnya). */
function taruhDekat(k: KeadaanRuang, id: string, t: TitikPeta) {
  const p = k.pemain.get(id);
  if (!p) throw new Error("pemain tidak ada");
  p.posisi = { x: t.x * 16 + 8, y: (t.y + 1) * 16 + 12, arah: "atas" };
}

const kirim = (k: KeadaanRuang, sid: string, pesan: PesanPemain, t: number) => semuaSah(terimaPemain(k, sid, pesan, t, acak));

function buka(k: KeadaanRuang, sid: string, kode: string, t: number) {
  const o = kirim(k, sid, { v: V, t: "periksa", kejadianId: kode }, t);
  return { o, terbuka: satu(o, sid, "kejadian_terbuka") };
}

function idBenar(k: KeadaanRuang, kode: string, terbuka: Pesan<"kejadian_terbuka">): string {
  const isi = k.kejadian.find((x) => x.kode === kode)?.isi;
  const teks = isi?.langkah1.opsi.find((o) => o.benar)?.teks;
  return terbuka.opsi1.find((o) => o.teks === teks)?.id ?? "";
}

describe("keterlihatan dan penempatan di ruang (P-9 sampai P-12)", () => {
  it("kejadian_terlihat hanya di main, sekali per titik, berisi setTokoh; tercatat di tabel terlihat", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const kj = k.kejadian[2];
    taruhDekat(k, a.id, kj.titik[0]);
    expect(jenisKe(semuaSah(putaran(k, DIBUAT + 500)), "s1")).not.toContain("kejadian_terlihat"); // lobi: putaran berhenti
    const { mulaiPada } = mulai(k);
    taruhDekat(k, a.id, kj.titik[0]);
    const o = semuaSah(putaran(k, mulaiPada + 100));
    const lihat = ke(o, "s1").filter((p) => p.t === "kejadian_terlihat") as Pesan<"kejadian_terlihat">[];
    expect(lihat.map((p) => p.kejadianId)).toContain(kj.kode);
    expect(lihat.find((p) => p.kejadianId === kj.kode)).toEqual({ v: V, t: "kejadian_terlihat", kejadianId: kj.kode, x: kj.titik[0].x, y: kj.titik[0].y, setTokoh: kj.isi.setTokoh });
    expect(o.simpan.filter((s) => s.jenis === "terlihat")).toHaveLength(lihat.length);
    expect(ke(semuaSah(putaran(k, mulaiPada + 200)), "s1").filter((p) => p.t === "kejadian_terlihat")).toEqual([]);
  });

  it("ruang lebih dari 50 pemain: dua titik per kejadian; periksa di titik kedua diterima; sesudah selesai keduanya selesai", () => {
    const k = ruang(100);
    expect(k.kejadian.every((x) => x.titik.length === 2)).toBe(true);
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const kj = k.kejadian[5];
    taruhDekat(k, a.id, kj.titik[1]);
    const { terbuka } = buka(k, "s1", kj.kode, mulaiPada + 100);
    expect(terbuka?.kejadianId).toBe(kj.kode);
    const h1 = satu(kirim(k, "s1", { v: V, t: "kunci_1", kejadianId: kj.kode, opsiId: terbuka!.opsi1[0].id }, mulaiPada + 200), "s1", "hasil_1")!;
    const o2 = kirim(k, "s1", { v: V, t: "kunci_2", kejadianId: kj.kode, opsiId: h1.opsi2[0].id }, mulaiPada + 300);
    expect(satu(o2, "s1", "pribadi")?.selesai).toEqual([kj.kode]);
    taruhDekat(k, a.id, kj.titik[0]);
    kirim(k, "s1", { v: V, t: "tutup_dialog", kejadianId: kj.kode }, mulaiPada + 400);
    expect(ke(buka(k, "s1", kj.kode, mulaiPada + 500).o, "s1")).toEqual([]); // selesai: diabaikan
  });
});

describe("periksa dan dialog (P-26 sampai P-30, P-33)", () => {
  it("terlalu jauh: galat BUKAN_JANGKAUAN lalu koreksi; dekat: jawaban baru, dialog, dan kejadian_terlihat lebih dulu", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const kj = k.kejadian[0];
    const p = k.pemain.get(a.id)!;
    p.posisi = { x: pusatTitik(kj.titik[0]).x, y: pusatTitik(kj.titik[0]).y + 40, arah: "atas" };
    const jauh = buka(k, "s1", kj.kode, mulaiPada + 100).o;
    expect(jenisKe(jauh, "s1")).toEqual(["galat", "koreksi"]);
    expect(satu(jauh, "s1", "galat")?.kode).toBe("BUKAN_JANGKAUAN");
    expect(satu(jauh, "s1", "koreksi")).toMatchObject({ x: p.posisi.x, y: p.posisi.y });
    taruhDekat(k, a.id, kj.titik[0]);
    const { o, terbuka } = buka(k, "s1", kj.kode, mulaiPada + 200);
    expect(jenisKe(o, "s1")).toEqual(["kejadian_terlihat", "kejadian_terbuka"]);
    expect(terbuka).toMatchObject({ kejadianId: kj.kode, judul: kj.isi.judul, situasi: kj.isi.situasi, langkah: 1 });
    expect(o.dialog).toEqual([{ sambunganId: "s1", kode: kj.kode }]);
    expect(o.simpan.filter((s) => s.jenis === "jawaban")).toHaveLength(1);
    expect(o.kiriman.map((b) => b.jenis)).toEqual(["jawaban"]);
    // Periksa lagi saat dialog yang sama terbuka: pesan pembukaan dikirim ulang; kejadian lain diabaikan.
    expect(jenisKe(buka(k, "s1", kj.kode, mulaiPada + 300).o, "s1")).toEqual(["kejadian_terbuka"]);
    expect(ke(buka(k, "s1", k.kejadian[1].kode, mulaiPada + 300).o, "s1")).toEqual([]);
    expect(buka(k, "s1", kj.kode, mulaiPada + 300).terbuka?.opsi1).toEqual(terbuka?.opsi1);
  });

  it("selama dialog: gerak ditolak tanpa koreksi, dan butir dunia bertanda dialog; tutup_dialog mengembalikannya", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const { mulaiPada } = mulai(k);
    const kj = k.kejadian[0];
    taruhDekat(k, a.id, kj.titik[0]);
    taruhDekat(k, b.id, kj.titik[0]);
    k.pemain.get(b.id)!.posisi!.x += 16;
    buka(k, "s1", kj.kode, mulaiPada + 100);
    const pa = k.pemain.get(a.id)!.posisi!;
    const g = kirim(k, "s1", { v: V, t: "gerak", x: pa.x + 3, y: pa.y, arah: "kanan", jalan: true, seq: 1 }, mulaiPada + 200);
    expect(ke(g, "s1")).toEqual([]);
    expect(k.pemain.get(a.id)!.posisi!.x).toBe(pa.x);
    const dunia = ke(semuaSah(putaran(k, mulaiPada + 300)), "s2").find((p) => p.t === "dunia") as Pesan<"dunia">;
    expect(dunia.p.find((x) => x[0] === a.id)?.[5]).toBe(true);
    const tutup = kirim(k, "s1", { v: V, t: "tutup_dialog", kejadianId: kj.kode }, mulaiPada + 400);
    expect(tutup.dialog).toEqual([{ sambunganId: "s1", kode: null }]);
    const lagi = ke(semuaSah(putaran(k, mulaiPada + 500)), "s2").find((p) => p.t === "dunia") as Pesan<"dunia">;
    expect(lagi.p.find((x) => x[0] === a.id)?.[5]).toBe(false);
    // tutup_dialog untuk kejadian lain diabaikan.
    buka(k, "s1", kj.kode, mulaiPada + 600);
    expect(kirim(k, "s1", { v: V, t: "tutup_dialog", kejadianId: "K-16" }, mulaiPada + 700).dialog).toEqual([]);
  });
});

describe("kunci, skor, KT-13, dan pribadi (P-31, P-32, P-55, P-56)", () => {
  it("Langkah 1 benar 40, Langkah 2 tepat 60; kunci kedua diabaikan; pribadi sesudah setiap kunci; kartu tetap terbuka", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const kj = k.kejadian[12];
    taruhDekat(k, a.id, kj.titik[0]);
    const { terbuka } = buka(k, "s1", kj.kode, mulaiPada + 100);
    const benar = idBenar(k, kj.kode, terbuka!);
    const o1 = kirim(k, "s1", { v: V, t: "kunci_1", kejadianId: kj.kode, opsiId: benar }, mulaiPada + 2000);
    expect(jenisKe(o1, "s1")).toEqual(["hasil_1", "pribadi"]);
    expect(satu(o1, "s1", "hasil_1")).toMatchObject({ benar: true, poin: 40, opsiBenar: benar });
    expect(satu(o1, "s1", "pribadi")).toMatchObject({ skor: 40, peringkat: 1, selesai: [] });
    expect(o1.kiriman.map((x) => x.jenis).sort()).toEqual(["jawaban", "peserta"]);
    expect(ke(kirim(k, "s1", { v: V, t: "kunci_1", kejadianId: kj.kode, opsiId: benar }, mulaiPada + 2100), "s1")).toEqual([]);
    const h1 = satu(o1, "s1", "hasil_1")!;
    const isi = kj.isi.langkah2.opsi;
    const tepat = h1.opsi2.find((o) => isi.find((x) => x.teks === o.teks)?.tingkat === "tepat")!.id;
    const o2 = kirim(k, "s1", { v: V, t: "kunci_2", kejadianId: kj.kode, opsiId: tepat }, mulaiPada + 4000);
    expect(jenisKe(o2, "s1")).toEqual(["hasil_2", "pribadi"]);
    expect(satu(o2, "s1", "hasil_2")).toMatchObject({ tingkat: "tepat", poin: 60 });
    expect(satu(o2, "s1", "pribadi")).toMatchObject({ skor: 100, selesai: [kj.kode] });
    expect(o2.jawabanSelesai).toBe(1);
    expect(k.dialog.get(a.id)).toBe(kj.kode); // kartu dampak tetap terbuka
    expect(skorDari(k, a.id)).toEqual({ skor: 100, waktuSkorMs: 4000, langkah1Benar: 1, selesai: 1 });
    // Baris pemain tidak ditulis karena skor (P-61).
    expect([...o1.simpan, ...o2.simpan].filter((s: Simpanan) => s.jenis === "pemain")).toEqual([]);
  });

  it("KT-13: tutup sesudah Langkah 1, periksa lagi membuka Langkah 2 dengan ulangan hasil_1; poin Langkah 1 tetap bila ronde berakhir", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const kj = k.kejadian[3];
    taruhDekat(k, a.id, kj.titik[0]);
    const { terbuka } = buka(k, "s1", kj.kode, mulaiPada + 100);
    const h1 = satu(kirim(k, "s1", { v: V, t: "kunci_1", kejadianId: kj.kode, opsiId: idBenar(k, kj.kode, terbuka!) }, mulaiPada + 200), "s1", "hasil_1");
    kirim(k, "s1", { v: V, t: "tutup_dialog", kejadianId: kj.kode }, mulaiPada + 300);
    const lagi = buka(k, "s1", kj.kode, mulaiPada + 400);
    expect(jenisKe(lagi.o, "s1")).toEqual(["kejadian_terbuka", "hasil_1"]);
    expect(lagi.terbuka?.langkah).toBe(2);
    expect(satu(lagi.o, "s1", "hasil_1")).toEqual(h1);
    const akhir = semuaSah(terimaKelas(k, { v: V, t: "akhiri" }, mulaiPada + 500));
    expect(akhir.dialog).toEqual([{ sambunganId: "s1", kode: null }]);
    expect(satu(akhir, "s1", "selesai")).toEqual({ v: V, t: "selesai", skor: 40, peringkat: 1, jumlahPemain: 1, rekap: [] });
    const peserta = akhir.kiriman.find((x) => x.jenis === "peserta");
    expect(peserta?.isi).toMatchObject({ skor: 40, langkah1Benar: 1, jumlahKejadian: 0, peringkatAkhir: 1 });
  });

  it("jeda: periksa dan kunci diabaikan, dialog tetap; waktu skor tanpa lama jeda", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const kj = k.kejadian[0];
    taruhDekat(k, a.id, kj.titik[0]);
    const { terbuka } = buka(k, "s1", kj.kode, mulaiPada + 1000);
    semuaSah(terimaKelas(k, { v: V, t: "jeda" }, mulaiPada + 2000));
    expect(ke(kirim(k, "s1", { v: V, t: "kunci_1", kejadianId: kj.kode, opsiId: idBenar(k, kj.kode, terbuka!) }, mulaiPada + 3000), "s1")).toEqual([]);
    expect(ke(buka(k, "s1", k.kejadian[1].kode, mulaiPada + 3000).o, "s1")).toEqual([]);
    expect(k.dialog.get(a.id)).toBe(kj.kode);
    semuaSah(terimaKelas(k, { v: V, t: "lanjut" }, mulaiPada + 12_000));
    kirim(k, "s1", { v: V, t: "kunci_1", kejadianId: kj.kode, opsiId: idBenar(k, kj.kode, terbuka!) }, mulaiPada + 15_000);
    expect(skorDari(k, a.id).waktuSkorMs).toBe(5000); // 15 detik dikurangi jeda 10 detik
    expect(waktuRondePada(k, mulaiPada + 1500)).toBe(1500);
  });

  it("pribadi untuk pemain lain yang peringkatnya berubah: paling sering sekali per 2 detik", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const { mulaiPada, o } = mulai(k);
    expect(ke(o, "s1").filter((p) => p.t === "pribadi")).toHaveLength(1); // saat status menjadi main
    expect(satu(o, "s2", "pribadi")?.peringkat).toBe(2);
    const kj = k.kejadian[0];
    taruhDekat(k, b.id, kj.titik[0]);
    const { terbuka } = buka(k, "s2", kj.kode, mulaiPada + 500);
    kirim(k, "s2", { v: V, t: "kunci_1", kejadianId: kj.kode, opsiId: idBenar(k, kj.kode, terbuka!) }, mulaiPada + 1000);
    // A turun ke peringkat 2, tetapi pribadi terakhirnya baru saja dikirim (saat mulai): ditunda sampai 2 detik.
    expect(ke(semuaSah(putaran(k, mulaiPada + 1500)), "s1").filter((p) => p.t === "pribadi")).toEqual([]);
    const tunda = semuaSah(putaran(k, mulaiPada + JEDA_PRIBADI_MS));
    expect(satu(tunda, "s1", "pribadi")?.peringkat).toBe(2);
    expect(ke(semuaSah(putaran(k, mulaiPada + 5000)), "s1").filter((p) => p.t === "pribadi")).toEqual([]); // tidak berubah lagi
    expect(a.id).not.toBe(b.id);
  });
});

describe("akhir ronde, sambung ulang, dikeluarkan, dan pemulihan (P-12, P-35 sampai P-37, P-63)", () => {
  it("sambung ulang di main: kejadian_terlihat dikirim ulang urut kode lalu titik, lalu pribadi; dialog tertutup saat putus", () => {
    const k = ruang(100);
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const [k1, k2] = [k.kejadian[4], k.kejadian[1]];
    taruhDekat(k, a.id, k1.titik[1]);
    buka(k, "s1", k1.kode, mulaiPada + 100);
    taruhDekat(k, a.id, k2.titik[0]);
    semuaSah(putaran(k, mulaiPada + 150));
    const putus = semuaSah(sambunganPutus(k, "s1", mulaiPada + 200));
    expect(k.dialog.has(a.id)).toBe(false);
    expect(putus.dialog).toEqual([]);
    sambunganMasuk(k, "s9", mulaiPada + 300);
    const o = semuaSah(terimaHalo(k, "s9", { v: V, t: "halo", peran: "pemain", token: a.token }, mulaiPada + 300, acak, { pemainId: "x", token: "y".padEnd(43, "y"), hashToken: "h:y" }, `h:${a.token}`));
    const urutan = jenisKe(o, "s9");
    expect(urutan.slice(-1)).toEqual(["pribadi"]);
    const lihat = ke(o, "s9").filter((p) => p.t === "kejadian_terlihat") as Pesan<"kejadian_terlihat">[];
    const kunci = lihat.map((p) => `${p.kejadianId}:${p.x},${p.y}`);
    expect(lihat.map((p) => p.kejadianId)).toEqual([...lihat.map((p) => p.kejadianId)].sort());
    expect(kunci).toContain(`${k1.kode}:${k1.titik[1].x},${k1.titik[1].y}`);
    expect(new Set(kunci).size).toBe(kunci.length);
  });

  it("pemain yang dikeluarkan tidak masuk peringkat; jawabannya tetap; selesai berisi peringkat akhir", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const { mulaiPada } = mulai(k);
    const kj = k.kejadian[0];
    taruhDekat(k, b.id, kj.titik[0]);
    const { terbuka } = buka(k, "s2", kj.kode, mulaiPada + 100);
    kirim(k, "s2", { v: V, t: "kunci_1", kejadianId: kj.kode, opsiId: idBenar(k, kj.kode, terbuka!) }, mulaiPada + 200);
    semuaSah(terimaKelas(k, { v: V, t: "keluarkan", pemainId: b.id }, mulaiPada + 300));
    expect(k.dialog.has(b.id)).toBe(false);
    expect(k.jawaban.get(b.id)?.get(kj.kode)?.status).toBe("langkah2");
    const akhir = semuaSah(terimaKelas(k, { v: V, t: "akhiri" }, mulaiPada + 400));
    expect(satu(akhir, "s1", "selesai")).toMatchObject({ skor: 0, peringkat: 1, jumlahPemain: 1 });
    const pesertaB = akhir.kiriman.find((x) => x.jenis === "peserta" && x.isi.id === b.id);
    expect(pesertaB?.isi).toMatchObject({ skor: 40, peringkatAkhir: null });
    expect(a.id).toBeTruthy();
  });

  it("pemulihan dari tabel jawaban, terlihat, dan lampiran dialog menghasilkan skor, peringkat, dan dialog yang sama", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const kj = k.kejadian[7];
    taruhDekat(k, a.id, kj.titik[0]);
    const { terbuka } = buka(k, "s1", kj.kode, mulaiPada + 100);
    kirim(k, "s1", { v: V, t: "kunci_1", kejadianId: kj.kode, opsiId: idBenar(k, kj.kode, terbuka!) }, mulaiPada + 200);
    const jawaban: JawabanRuang[] = [...k.jawaban.get(a.id)!.values()];
    const terlihat = [...k.terlihat.get(a.id)!].map((titikId) => ({ pemainId: a.id, titikId }));
    const pulih = pulihkanKeadaan(
      {
        ruang: k.ruang,
        status: k.status,
        waktu: k.waktu,
        terkunci: false,
        ditutupPada: null,
        sambunganTerakhirPutus: null,
        pemain: [...k.pemain.values()],
        sambungan: [{ sambunganId: "s1", pemainId: a.id, dialog: kj.kode }],
        kejadian: k.kejadian,
        jawaban,
        terlihat,
      },
      PETA_KAMPUNG,
      mulaiPada + 300,
    );
    expect(skorDari(pulih, a.id)).toEqual(skorDari(k, a.id));
    expect(pulih.dialog.get(a.id)).toBe(kj.kode);
    expect([...pulih.terlihat.get(a.id)!]).toEqual([...k.terlihat.get(a.id)!]);
    const lagi = buka(pulih, "s1", kj.kode, mulaiPada + 400);
    expect(jenisKe(lagi.o, "s1")).toEqual(["kejadian_terbuka", "hasil_1"]);
  });
});

describe("kait uji lokal pindahkan (P-67)", () => {
  it("memindahkan pemain bernama ke ubin bebas dan mengirim koreksi; sel padat dan nama tidak dikenal ditolak", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const { mulaiPada } = mulai(k);
    const t = k.kejadian[0].titik[0];
    const o = pindahkanPemain(k, a.nama, t.x, t.y + 1, mulaiPada + 10);
    expect(o).not.toBe("padat");
    expect(o).not.toBe("tidak_ada");
    expect(ke(o as Keluaran, "s1")).toEqual([{ v: V, t: "koreksi", x: t.x * 16 + 8, y: (t.y + 1) * 16 + 12, seq: 0 }]);
    expect(pindahkanPemain(k, "Tidak Ada", t.x, t.y, mulaiPada)).toBe("tidak_ada");
    expect(pindahkanPemain(k, a.nama, 0, 0, mulaiPada)).toBe("padat");
  });
});

describe("biaya putaran (Architecture 13.1: ≤ 5 ms per putaran untuk 50 pemain)", () => {
  it.each([50, 100])("%i pemain di kampung dengan kejadian: keterlihatan, dunia, dan jadwal pribadi dalam batas", (n) => {
    const k = ruang(n === 50 ? 50 : 100);
    const ids: string[] = [];
    for (let i = 0; i < n; i++) ids.push(masuk(k, `b${i}`).id);
    const { mulaiPada } = mulai(k);
    const semuaTitik = k.kejadian.flatMap((x) => x.titik);
    ids.forEach((id, i) => taruhDekat(k, id, semuaTitik[i % semuaTitik.length]));
    const waktu: number[] = [];
    for (let n = 0; n < 60; n++) {
      for (const id of ids.slice(0, Math.ceil(n / 2))) {
        const p = k.pemain.get(id)!;
        p.posisi = { ...p.posisi!, x: p.posisi!.x + (n % 2 ? 1 : -1) };
        k.gerak.get(id)!.berubah = true;
      }
      const t0 = performance.now();
      putaran(k, mulaiPada + 100 * (n + 1));
      waktu.push(performance.now() - t0);
    }
    waktu.sort((a, b) => a - b);
    const rata = waktu.reduce((a, b) => a + b, 0) / waktu.length;
    console.log(`PUTARAN_${n}_PEMAIN_MS`, JSON.stringify({ rata: +rata.toFixed(3), p95: +waktu[Math.floor(0.95 * waktu.length)].toFixed(3), maks: +waktu[waktu.length - 1].toFixed(3) }));
    expect(rata).toBeLessThan(5);
  });
});
