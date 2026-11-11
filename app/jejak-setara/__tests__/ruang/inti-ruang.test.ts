// Inti ruang (spesifikasi JS-03, bagian D sampai H; AC-7 sampai AC-15).
import { describe, expect, it } from "vitest";
import { acakBerbenih } from "../../inti/acak";
import { PROTOKOL_VERSI, skemaServerKelas, skemaServerPemain, type PesanPemain, type PesanServerPemain } from "../../inti/protokol";
import type { PengaturanRuang } from "../../inti/tipe";
import {
  alarm,
  buatKeadaan,
  KODE_TUTUP,
  pesanLobi,
  pulihkanKeadaan,
  putaran,
  sambunganMasuk,
  sambunganPutus,
  tenggatBerikut,
  terimaHalo,
  terimaKelas,
  terimaPemain,
  WAKTU,
  type KeadaanRuang,
  type Keluaran,
} from "../../../../server/jejak-setara/src/ruang/inti-ruang";
import { PETA_UJI } from "../../../../server/jejak-setara/src/ruang/peta-uji";
import { PETA_KAMPUNG } from "../../../../server/jejak-setara/src/ruang/peta-kampung";
import { posisiSah } from "../../inti/gerak";
import { DUNIA_LOBI, KERANGKA_PENUH_SETIAP } from "../../../../server/jejak-setara/src/ruang/inti-ruang";

const PENGATURAN: PengaturanRuang = { durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, skillAktif: ["lari"], modeNomorAbsen: false, uji: true };
const DIBUAT = 1_000_000;

function ruang(atur: Partial<PengaturanRuang> = {}): KeadaanRuang {
  return buatKeadaan({ ruangId: "r-1", kode: "K7MPA", pengaturan: { ...PENGATURAN, ...atur }, benih: 7, dibuatPada: DIBUAT }, PETA_UJI);
}

let nomor = 0;
const acak = acakBerbenih(42);
const token = (n: number) => `t${n}`.padEnd(43, "A");

/** Setiap pesan keluar harus lolos skema server (P-55). */
function semuaSah(o: Keluaran): Keluaran {
  for (const { pesan } of o.kirim) expect(skemaServerPemain.safeParse(pesan).success, JSON.stringify(pesan)).toBe(true);
  for (const pesan of o.kelas) expect(skemaServerKelas.safeParse(pesan).success, JSON.stringify(pesan)).toBe(true);
  return o;
}

function halo(k: KeadaanRuang, sid: string, sekarang: number, opsi: { token?: string; nomorAbsen?: number } = {}) {
  if (!k.sambungan.has(sid)) sambunganMasuk(k, sid, sekarang);
  nomor++;
  const calon = { pemainId: `p${nomor}`, token: token(nomor), hashToken: `h:${token(nomor)}` };
  const pesan: Extract<PesanPemain, { t: "halo" }> = { v: PROTOKOL_VERSI, t: "halo", peran: "pemain", ...opsi };
  const o = semuaSah(terimaHalo(k, sid, pesan, sekarang, acak, calon, opsi.token ? `h:${opsi.token}` : null));
  return { o, calon };
}

const pesanKe = (o: Keluaran, sid: string) => o.kirim.filter((k) => k.sambunganId === sid).map((k) => k.pesan);
const jenis = (daftar: PesanServerPemain[]) => daftar.map((p) => p.t);

/** Bergabung dan memilih identitas; mengembalikan id pemain dan tokennya. */
function masuk(k: KeadaanRuang, sid: string, sekarang = DIBUAT + 1000, avatar = 0) {
  const { o, calon } = halo(k, sid, sekarang);
  const datang = pesanKe(o, sid)[0] as Extract<PesanServerPemain, { t: "selamat_datang" }>;
  const p = semuaSah(terimaPemain(k, sid, { v: PROTOKOL_VERSI, t: "pilih_identitas", nama: datang.saranNama[0], avatar }, sekarang, acak));
  return { id: calon.pemainId, token: calon.token, nama: datang.saranNama[0], o: p };
}

describe("bergabung (P-18 sampai P-25)", () => {
  it("pemain baru: selamat_datang, status_ruang, tiga saran berbeda, token dari calon", () => {
    const k = ruang();
    const { o, calon } = halo(k, "s1", DIBUAT + 10);
    const pesan = pesanKe(o, "s1");
    expect(jenis(pesan)).toEqual(["selamat_datang", "status_ruang"]);
    const datang = pesan[0] as Extract<PesanServerPemain, { t: "selamat_datang" }>;
    expect(datang.token).toBe(calon.token);
    expect(new Set(datang.saranNama).size).toBe(3);
    expect(datang.avatarTersedia).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(o.simpan).toHaveLength(1);
  });

  it("minta_nama memberi tiga saran baru yang tidak sama dengan sebelumnya", () => {
    const k = ruang();
    const { o } = halo(k, "s1", DIBUAT);
    const lama = (pesanKe(o, "s1")[0] as Extract<PesanServerPemain, { t: "selamat_datang" }>).saranNama;
    const baru = semuaSah(terimaPemain(k, "s1", { v: PROTOKOL_VERSI, t: "minta_nama" }, DIBUAT + 1, acak));
    const saran = (pesanKe(baru, "s1")[0] as Extract<PesanServerPemain, { t: "saran_nama" }>).saranNama;
    expect(saran).toHaveLength(3);
    for (const n of saran) expect(lama).not.toContain(n);
  });

  it("identitas sah: warna tas paling sedikit dipakai, pemain_baru ke semua termasuk diri, baris peserta, lobi", () => {
    const k = ruang();
    const warna = ["s1", "s2", "s3"].map((sid) => {
      const m = masuk(k, sid);
      return k.pemain.get(m.id)?.warnaTas;
    });
    expect(warna).toEqual(["sun", "mango", "coral"]);
    const ketiga = masuk(k, "s4");
    expect(ketiga.o.kirim.filter((x) => x.pesan.t === "pemain_baru").map((x) => x.sambunganId).sort()).toEqual(["s1", "s2", "s3", "s4"]);
    expect(ketiga.o.kiriman[0]).toMatchObject({ jenis: "peserta", isi: { id: ketiga.id, ruangId: "r-1", nama: ketiga.nama } });
    expect(ketiga.o.kelas[0]).toMatchObject({ t: "lobi" });
  });

  it("nama yang bukan saran terakhir atau sudah dipakai: NAMA_DIPAKAI lalu saran_nama", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    halo(k, "s2", DIBUAT);
    const p2 = [...k.pemain.values()].find((p) => p.nama === null)!;
    p2.saran = [a.nama, "Jalak Biru", "Anoa Hijau"];
    const o = semuaSah(terimaPemain(k, "s2", { v: PROTOKOL_VERSI, t: "pilih_identitas", nama: a.nama, avatar: 1 }, DIBUAT, acak));
    expect(jenis(pesanKe(o, "s2"))).toEqual(["galat", "saran_nama"]);
    expect(pesanKe(o, "s2")[0]).toMatchObject({ kode: "NAMA_DIPAKAI" });
    const o2 = semuaSah(terimaPemain(k, "s2", { v: PROTOKOL_VERSI, t: "pilih_identitas", nama: "Bukan Saran", avatar: 1 }, DIBUAT, acak));
    expect(pesanKe(o2, "s2")[0]).toMatchObject({ kode: "NAMA_DIPAKAI" });
  });

  it("pesan sebelum halo menutup sambungan 4002; ping dijawab pong", () => {
    const k = ruang();
    sambunganMasuk(k, "s9", DIBUAT);
    const o = terimaPemain(k, "s9", { v: PROTOKOL_VERSI, t: "ping", tKlien: 1 }, DIBUAT, acak);
    expect(o.tutup).toEqual([{ sambunganId: "s9", kode: KODE_TUTUP.tanpaHalo, alasan: "perlu halo" }]);
    halo(k, "s1", DIBUAT);
    const pong = semuaSah(terimaPemain(k, "s1", { v: PROTOKOL_VERSI, t: "ping", tKlien: 5 }, DIBUAT + 7, acak));
    expect(pesanKe(pong, "s1")).toEqual([{ v: PROTOKOL_VERSI, t: "pong", tKlien: 5, waktuServer: DIBUAT + 7 }]);
  });

  it("pemain tanpa identitas yang terputus lebih dari 5 menit dilepas, sehingga tempatnya kembali", () => {
    const k = ruang({ batasPemain: 2 });
    masuk(k, "s1");
    halo(k, "s2", DIBUAT);
    sambunganPutus(k, "s2", DIBUAT + 1000);
    expect(pesanKe(halo(k, "s3", DIBUAT + 1000 + WAKTU.lepasTanpaIdentitasMs).o, "s3")[0]).toMatchObject({ kode: "RUANG_PENUH" });
    const { o } = halo(k, "s4", DIBUAT + 2000 + WAKTU.lepasTanpaIdentitasMs);
    expect(o.simpan.some((s) => s.jenis === "hapus_pemain")).toBe(true);
    expect(jenis(pesanKe(o, "s4"))[0]).toBe("selamat_datang");
  });
});

describe("batas masuk (P-19, P-20)", () => {
  it("ruang penuh: galat RUANG_PENUH lalu tutup 4003; yang terputus tetap memegang tempat", () => {
    const k = ruang({ batasPemain: 2 });
    masuk(k, "s1");
    masuk(k, "s2");
    sambunganPutus(k, "s2", DIBUAT + 5);
    const { o } = halo(k, "s3", DIBUAT + 10);
    expect(pesanKe(o, "s3")).toEqual([{ v: PROTOKOL_VERSI, t: "galat", kode: "RUANG_PENUH", pesan: "Ruang sudah penuh. Beri tahu gurumu." }]);
    expect(o.tutup[0]).toMatchObject({ sambunganId: "s3", kode: KODE_TUTUP.ditolak });
  });

  it("terkunci: pemain baru ditolak, sambung ulang dengan token tetap bisa", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    sambunganPutus(k, "s1", DIBUAT + 5);
    terimaKelas(k, { v: PROTOKOL_VERSI, t: "kunci_ruang", kunci: true }, DIBUAT + 6);
    expect(pesanKe(halo(k, "s2", DIBUAT + 7).o, "s2")[0]).toMatchObject({ kode: "RUANG_TERKUNCI" });
    const ulang = halo(k, "s3", DIBUAT + 8, { token: a.token });
    expect(jenis(pesanKe(ulang.o, "s3"))[0]).toBe("selamat_datang");
    expect(k.sambungan.get("s3")).toBe(a.id);
  });

  it("terlambat: boleh sampai batasTerlambatMenit sejak mulai, lalu TERLAMBAT; selesai selalu TERLAMBAT", () => {
    const k = ruang();
    masuk(k, "s1");
    terimaKelas(k, { v: PROTOKOL_VERSI, t: "mulai" }, DIBUAT + 10_000);
    const mulai = k.waktu.mulaiPada!;
    alarm(k, mulai, true);
    expect(jenis(pesanKe(halo(k, "s2", mulai + 4 * 60_000).o, "s2"))[0]).toBe("selamat_datang");
    expect(pesanKe(halo(k, "s3", mulai + 5 * 60_000 + 1).o, "s3")[0]).toMatchObject({ kode: "TERLAMBAT" });
    terimaKelas(k, { v: PROTOKOL_VERSI, t: "akhiri" }, mulai + 6 * 60_000);
    expect(pesanKe(halo(k, "s4", mulai + 6 * 60_000).o, "s4")[0]).toMatchObject({ kode: "TERLAMBAT" });
  });

  it("nomor absen: wajib (tanpa nomor ditutup 1008), nomor ganda ditolak tanpa menutup sambungan", () => {
    const k = ruang({ modeNomorAbsen: true });
    const tanpa = halo(k, "s1", DIBUAT);
    expect(tanpa.o.tutup[0]).toMatchObject({ kode: KODE_TUTUP.pelanggaran });
    expect(jenis(pesanKe(halo(k, "s2", DIBUAT, { nomorAbsen: 12 }).o, "s2"))[0]).toBe("selamat_datang");
    const ganda = halo(k, "s3", DIBUAT, { nomorAbsen: 12 });
    expect(pesanKe(ganda.o, "s3")).toEqual([
      { v: PROTOKOL_VERSI, t: "galat", kode: "NOMOR_ABSEN_DIPAKAI", pesan: "Nomor absen ini sudah dipakai di ruang ini. Periksa lagi nomormu." },
    ]);
    expect(ganda.o.tutup).toEqual([]);
    expect(jenis(pesanKe(halo(k, "s3", DIBUAT, { nomorAbsen: 13 }).o, "s3"))[0]).toBe("selamat_datang");
  });

  it("100 pemain bisa masuk, pemain ke-101 RUANG_PENUH, dan lobi 100 pemain lolos skema", () => {
    const k = ruang({ batasPemain: 100 });
    for (let i = 0; i < 100; i++) masuk(k, `s${i}`, DIBUAT + i, i % 8);
    expect(pesanKe(halo(k, "s100", DIBUAT + 200).o, "s100")[0]).toMatchObject({ kode: "RUANG_PENUH" });
    expect(skemaServerKelas.safeParse(pesanLobi(k)).success).toBe(true);
    expect((pesanLobi(k) as { pemain: unknown[] }).pemain).toHaveLength(100);
  });
});

describe("sambung ulang dan keluarkan (P-26 sampai P-28, P-37)", () => {
  it("token melanjutkan pemain yang sama; sambungan lama ditutup 4001; putus tanpa pemain_pergi", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    masuk(k, "s2");
    const putus = sambunganPutus(k, "s2", DIBUAT + 50);
    expect(putus.kirim).toEqual([]);
    const ulang = halo(k, "s3", DIBUAT + 60, { token: a.token });
    expect(ulang.o.tutup).toEqual([{ sambunganId: "s1", kode: KODE_TUTUP.diganti, alasan: "diganti" }]);
    const pesan = pesanKe(ulang.o, "s3");
    expect(pesan[0]).toMatchObject({ t: "selamat_datang", pemainId: a.id, token: a.token, saranNama: [] });
    expect(pesan.filter((p) => p.t === "pemain_baru").map((p) => (p as { id: string }).id)).toContain(a.id);
  });

  it("dikeluarkan: galat, tutup 4004, pemain lain menerima pemain_pergi, token mati", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    masuk(k, "s2");
    const o = semuaSah(terimaKelas(k, { v: PROTOKOL_VERSI, t: "keluarkan", pemainId: a.id }, DIBUAT + 100));
    expect(pesanKe(o, "s1")[0]).toMatchObject({ kode: "DIKELUARKAN" });
    expect(o.tutup).toEqual([{ sambunganId: "s1", kode: KODE_TUTUP.dikeluarkan, alasan: "dikeluarkan" }]);
    expect(pesanKe(o, "s2")).toEqual([{ v: PROTOKOL_VERSI, t: "pemain_pergi", id: a.id }]);
    const ulang = halo(k, "s3", DIBUAT + 200, { token: a.token });
    expect(pesanKe(ulang.o, "s3")[0]).toMatchObject({ kode: "DIKELUARKAN" });
    expect(ulang.o.tutup[0]).toMatchObject({ kode: KODE_TUTUP.dikeluarkan });
  });

  it("pulihkanKeadaan membangun ulang pemain dan sambungan sesudah hibernasi", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    masuk(k, "s2");
    const pemain = [...k.pemain.values()].map((p) => ({ ...p }));
    const baru = pulihkanKeadaan(
      { ruang: k.ruang, status: "lobi", waktu: k.waktu, terkunci: false, ditutupPada: null, sambunganTerakhirPutus: null, pemain, sambungan: [{ sambunganId: "s1", pemainId: a.id }] },
      PETA_UJI,
      DIBUAT + 999,
    );
    expect(baru.sambunganPemain.get(a.id)).toBe("s1");
    expect([...baru.pemain.values()].filter((p) => p.terhubung)).toHaveLength(1);
    expect(baru.urutanBerikut).toBe(3);
  });
});

describe("siklus ruang dan alarm (P-31 sampai P-40)", () => {
  it("sambungan tanpa halo ditutup 4002 lewat alarm 10 detik sesudah dibuka (P-15)", () => {
    const k = ruang();
    sambunganMasuk(k, "s1", DIBUAT);
    expect(tenggatBerikut(k, true)).toBe(DIBUAT + 10_000);
    expect(alarm(k, DIBUAT + 9_999, true).tutup).toEqual([]);
    expect(alarm(k, DIBUAT + 10_000, true).tutup).toEqual([{ sambunganId: "s1", kode: KODE_TUTUP.tanpaHalo, alasan: "perlu halo" }]);
    halo(k, "s2", DIBUAT);
    expect(k.batasHalo.has("s2")).toBe(false);
  });

  it("mulai, hitung mundur, main, jeda, lanjut, tambah waktu, waktu habis, tutup, dan hapus", () => {
    const k = ruang();
    masuk(k, "s1");
    const t0 = DIBUAT + 60_000;
    semuaSah(terimaKelas(k, { v: PROTOKOL_VERSI, t: "mulai" }, t0));
    expect(k.status).toBe("hitung_mundur");
    expect(k.waktu.mulaiPada).toBe(t0 + 3000);
    expect(k.waktu.berakhirPada).toBe(t0 + 3000 + 15 * 60_000);
    expect(tenggatBerikut(k, true)).toBe(t0 + 3000);
    const main = semuaSah(alarm(k, t0 + 3000, true));
    expect([k.status, main.putaran]).toEqual(["main", "mulai"]);
    expect(tenggatBerikut(k, true)).toBe(t0 + 3000 + 15 * 60_000);
    expect(semuaSah(terimaKelas(k, { v: PROTOKOL_VERSI, t: "jeda" }, t0 + 63_000)).putaran).toBe("henti");
    semuaSah(terimaKelas(k, { v: PROTOKOL_VERSI, t: "lanjut" }, t0 + 93_000));
    expect([k.status, k.waktu.jedaMs, k.waktu.berakhirPada]).toEqual(["main", 30_000, t0 + 3000 + 15 * 60_000 + 30_000]);
    semuaSah(terimaKelas(k, { v: PROTOKOL_VERSI, t: "tambah_waktu", detik: 120 }, t0 + 100_000));
    const akhir = k.waktu.berakhirPada!;
    expect(akhir).toBe(t0 + 3000 + 15 * 60_000 + 150_000);
    const selesai = semuaSah(alarm(k, akhir, true));
    expect([k.status, selesai.kirimSekarang, selesai.putaran]).toEqual(["selesai", true, "henti"]);
    expect(selesai.kiriman.filter((b) => b.jenis === "peserta")[0]).toMatchObject({ isi: { peringkatAkhir: 1 } });
    expect(selesai.kiriman.find((b) => b.jenis === "ruang")).toMatchObject({ isi: { status: "selesai", selesaiPada: akhir } });
    const tutup = semuaSah(terimaKelas(k, { v: PROTOKOL_VERSI, t: "tutup_ruang" }, akhir + 1000));
    expect(k.status).toBe("ditutup");
    expect(tutup.tutup).toEqual([{ sambunganId: "s1", kode: KODE_TUTUP.ditutup, alasan: "ruang ditutup" }]);
    expect(tenggatBerikut(k, false)).toBeNull();
    expect(tenggatBerikut(k, true)).toBe(akhir + 1000 + WAKTU.hapusSesudahTutupMs);
    expect(alarm(k, akhir + 1000 + WAKTU.hapusSesudahTutupMs, false).hapusSemua).toBe(false);
    expect(alarm(k, akhir + 1000 + WAKTU.hapusSesudahTutupMs, true).hapusSemua).toBe(true);
  });

  it("tutup otomatis 3 jam sesudah sambungan terakhir putus, dan 6 jam sesudah dibuat", () => {
    const k = ruang();
    masuk(k, "s1");
    sambunganPutus(k, "s1", DIBUAT + 1000);
    expect(tenggatBerikut(k, true)).toBe(DIBUAT + 1000 + WAKTU.tutupTanpaSambunganMs);
    alarm(k, DIBUAT + 1000 + WAKTU.tutupTanpaSambunganMs, true);
    expect(k.status).toBe("ditutup");
    const k2 = ruang();
    alarm(k2, DIBUAT + WAKTU.tutupSejakDibuatMs - 1, true);
    expect(k2.status).toBe("lobi");
    alarm(k2, DIBUAT + WAKTU.tutupSejakDibuatMs, true);
    expect(k2.status).toBe("ditutup");
  });
});

describe("gerak, dunia, dan penyimpanan (P-41 sampai P-46)", () => {
  function ruangMain(jumlah: number) {
    const k = ruang({ batasPemain: 100 });
    for (let i = 0; i < jumlah; i++) masuk(k, `s${i}`, DIBUAT + i);
    terimaKelas(k, { v: PROTOKOL_VERSI, t: "mulai" }, DIBUAT + 10_000);
    alarm(k, k.waktu.mulaiPada!, true);
    return k;
  }

  it("gerak sah tidak ditulis ke SQLite; terlalu cepat dijawab koreksi (gerak di lobi: JS-07)", () => {
    const k = ruangMain(2);
    const t = k.waktu.mulaiPada!;
    const p = k.pemain.get(k.sambungan.get("s0")!)!;
    const awal = { ...p.posisi! };
    const sah = terimaPemain(k, "s0", { v: PROTOKOL_VERSI, t: "gerak", x: awal.x + 5, y: awal.y, arah: "kanan", jalan: true, seq: 1 }, t + 100, acak);
    expect([sah.kirim, sah.simpan, p.posisi?.x]).toEqual([[], [], awal.x + 5]);
    const cepat = semuaSah(terimaPemain(k, "s0", { v: PROTOKOL_VERSI, t: "gerak", x: awal.x + 400, y: awal.y, arah: "kanan", jalan: true, seq: 2 }, t + 200, acak));
    expect(pesanKe(cepat, "s0")).toEqual([{ v: PROTOKOL_VERSI, t: "koreksi", x: awal.x + 5, y: awal.y, seq: 2 }]);
    expect(cepat.koreksi).toBe(1);
  });

  it("dunia: paling banyak 24 pemain terdekat yang berubah, n = jumlah pemain", () => {
    const k = ruangMain(30);
    const o = semuaSah(putaran(k, k.waktu.mulaiPada! + 100));
    const dunia = pesanKe(o, "s0") as Extract<PesanServerPemain, { t: "dunia" }>[];
    expect(dunia).toHaveLength(1);
    expect(dunia[0].p).toHaveLength(24);
    expect(dunia[0].n).toBe(30);
    expect(semuaSah(putaran(k, k.waktu.mulaiPada! + 200)).kirim).toEqual([]);
  });

  it("satu sesi 40 pemain di JS-03 menulis kurang dari 500 baris SQLite", () => {
    const k = ruang();
    let baris = 0;
    const hitung = (o: Keluaran) => {
      baris += o.simpan.length + o.kiriman.length;
      return o;
    };
    for (let i = 0; i < 40; i++) {
      const { o } = halo(k, `s${i}`, DIBUAT + i);
      hitung(o);
      const datang = pesanKe(o, `s${i}`)[0] as Extract<PesanServerPemain, { t: "selamat_datang" }>;
      hitung(terimaPemain(k, `s${i}`, { v: PROTOKOL_VERSI, t: "pilih_identitas", nama: datang.saranNama[0], avatar: i % 8 }, DIBUAT + i, acak));
    }
    hitung(terimaKelas(k, { v: PROTOKOL_VERSI, t: "mulai" }, DIBUAT + 60_000));
    const t = k.waktu.mulaiPada!;
    hitung(alarm(k, t, true));
    for (let langkah = 1; langkah <= 100; langkah++) {
      for (let i = 0; i < 40; i++) {
        const p = k.pemain.get(k.sambungan.get(`s${i}`)!)!;
        hitung(terimaPemain(k, `s${i}`, { v: PROTOKOL_VERSI, t: "gerak", x: p.posisi!.x, y: p.posisi!.y, arah: "bawah", jalan: false, seq: langkah }, t + langkah * 100, acak));
      }
      hitung(putaran(k, t + langkah * 100));
    }
    for (let i = 0; i < 40; i += 4) hitung(sambunganPutus(k, `s${i}`, t + 20_000));
    hitung(terimaKelas(k, { v: PROTOKOL_VERSI, t: "akhiri" }, t + 30_000));
    hitung(terimaKelas(k, { v: PROTOKOL_VERSI, t: "tutup_ruang" }, t + 40_000));
    expect(baris).toBeLessThan(500);
  });
});

// ---------------------------------------------------------------------------------------------
// JS-07: peta kampung, gerak di lobi, kiriman `dunia` di lobi, kerangka penuh, dan posisi awal.

type Dunia = Extract<PesanServerPemain, { t: "dunia" }>;
const duniaKe = (o: Keluaran, sid: string) => pesanKe(o, sid).filter((p): p is Dunia => p.t === "dunia");
const idDi = (d: Dunia) => d.p.map((b) => b[0]).sort();

function ruangKampung(atur: Partial<PengaturanRuang> = {}): KeadaanRuang {
  return buatKeadaan({ ruangId: "r-7", kode: "K7MPA", pengaturan: { ...PENGATURAN, ...atur }, benih: 7, dibuatPada: DIBUAT }, PETA_KAMPUNG);
}

const gerak = (k: KeadaanRuang, sid: string, x: number, y: number, seq: number, t: number, jalan = true) =>
  semuaSah(terimaPemain(k, sid, { v: PROTOKOL_VERSI, t: "gerak", x, y, arah: "kanan", jalan, seq }, t, acak));

describe("JS-07: posisi awal dan kerangka penuh (P-47 sampai P-49)", () => {
  it("memilih identitas di lobi: pemain_baru, lalu koreksi di titik muncul pertama dengan seq 0", () => {
    const k = ruangKampung();
    const a = masuk(k, "s1");
    expect(jenis(pesanKe(a.o, "s1"))).toEqual(["pemain_baru", "koreksi"]);
    const t0 = PETA_KAMPUNG.titikMuncul[0];
    expect(pesanKe(a.o, "s1")[1]).toEqual({ v: PROTOKOL_VERSI, t: "koreksi", x: t0.x * 16 + 8, y: t0.y * 16 + 12, seq: 0 });
    expect(k.pemain.get(a.id)?.posisi).toEqual({ x: t0.x * 16 + 8, y: t0.y * 16 + 12, arah: "bawah" });
    expect(a.o.simpan.some((x) => x.jenis === "pemain" && x.pemain.posisi !== null)).toBe(true);
  });

  it("pemain kedua langsung menerima kerangka penuh, dan pemain pertama langsung melihat pemain kedua", () => {
    const k = ruangKampung();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2", DIBUAT + 2000);
    expect(jenis(pesanKe(b.o, "s2"))).toEqual(["pemain_baru", "koreksi", "dunia"]);
    expect(idDi(duniaKe(b.o, "s2")[0])).toEqual([a.id]);
    expect(duniaKe(b.o, "s2")[0].n).toBe(2);
    expect(duniaKe(b.o, "s1").map(idDi)).toEqual([[b.id]]);
    const t1 = PETA_KAMPUNG.titikMuncul[1];
    expect(duniaKe(b.o, "s1")[0].p[0]).toEqual([b.id, t1.x * 16 + 8, t1.y * 16 + 12, "bawah", false, false]);
  });

  it("titik muncul ke-((urutan − 1) mod 18): pemain ke-19 kembali ke titik pertama", () => {
    const k = ruangKampung({ batasPemain: 30 });
    expect(PETA_KAMPUNG.titikMuncul).toHaveLength(18);
    const id: string[] = [];
    for (let i = 0; i < 19; i++) id.push(masuk(k, `s${i}`, DIBUAT + i).id);
    const pos = (n: number) => k.pemain.get(id[n])?.posisi;
    expect([pos(18)?.x, pos(18)?.y]).toEqual([pos(0)?.x, pos(0)?.y]);
    expect(new Set(id.slice(0, 18).map((x) => `${k.pemain.get(x)?.posisi?.x},${k.pemain.get(x)?.posisi?.y}`)).size).toBe(18);
  });

  it("sambung ulang: kembali di posisi terakhir dengan seq gerak terakhir yang diterima, dan langsung melihat sekitar", () => {
    const k = ruangKampung();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const pa = k.pemain.get(a.id)!;
    const x0 = pa.posisi!.x;
    gerak(k, "s1", x0 + 5, pa.posisi!.y, 7, DIBUAT + 5000);
    sambunganPutus(k, "s1", DIBUAT + 6000);
    const ulang = halo(k, "s3", DIBUAT + 7000, { token: a.token });
    const pesan = pesanKe(ulang.o, "s3");
    expect(jenis(pesan)).toEqual(["selamat_datang", "status_ruang", "pemain_baru", "pemain_baru", "koreksi", "dunia"]);
    expect(pesan[4]).toEqual({ v: PROTOKOL_VERSI, t: "koreksi", x: x0 + 5, y: pa.posisi!.y, seq: 7 });
    expect(idDi(pesan[5] as Dunia)).toEqual([b.id]);
    expect(duniaKe(ulang.o, "s2").map(idDi)).toEqual([[a.id]]);
  });
});

describe("JS-07: gerak dan dunia di lobi tanpa putaran (P-45, P-47, P-48)", () => {
  it("gerak di lobi diterima tanpa pengatur waktu dan dikirim ke pemain lain; tanpa gerak tidak ada kiriman", () => {
    const k = ruangKampung();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const pa = k.pemain.get(a.id)!;
    const o = gerak(k, "s1", pa.posisi!.x + 5, pa.posisi!.y, 1, DIBUAT + 10_000);
    expect(o.putaran).toBeNull();
    expect(pa.posisi!.x).toBe(PETA_KAMPUNG.titikMuncul[0].x * 16 + 13);
    expect(duniaKe(o, "s2").map(idDi)).toEqual([[a.id]]);
    expect(duniaKe(o, "s2")[0].p[0][4]).toBe(true);
    expect(o.duniaLobi).toBeGreaterThan(0);
    expect(semuaSah(putaran(k, DIBUAT + 10_050)).putaran).toBe("henti");
    expect(tenggatBerikut(k, true)).toBe(DIBUAT + WAKTU.tutupSejakDibuatMs);
    expect(b.id).not.toBe(a.id);
  });

  it("paling sering setiap 100 ms; laporan berhenti (jalan false) langsung dikirim", () => {
    const k = ruangKampung();
    const a = masuk(k, "s1");
    masuk(k, "s2");
    const pa = k.pemain.get(a.id)!;
    const x0 = pa.posisi!.x;
    const y0 = pa.posisi!.y;
    const t = DIBUAT + 10_000;
    expect(duniaKe(gerak(k, "s1", x0 + 3, y0, 1, t), "s2")).toHaveLength(1);
    expect(duniaKe(gerak(k, "s1", x0 + 6, y0, 2, t + 50), "s2")).toHaveLength(0);
    expect(duniaKe(gerak(k, "s1", x0 + 9, y0, 3, t + 100), "s2")).toHaveLength(1);
    const henti = gerak(k, "s1", x0 + 9, y0, 4, t + 120, false);
    expect(duniaKe(henti, "s2")).toHaveLength(1);
    expect(duniaKe(henti, "s2")[0].p[0]).toEqual([a.id, x0 + 9, y0, "kanan", false, false]);
    expect(DUNIA_LOBI).toEqual({ jedaMs: 100, kerangkaPenuhMs: 1000 });
  });

  it("kerangka penuh di lobi paling sering sekali per detik per pemain, memuat pemain yang diam", () => {
    const k = ruangKampung();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const c = masuk(k, "s3");
    const pa = k.pemain.get(a.id)!;
    const x0 = pa.posisi!.x;
    const y0 = pa.posisi!.y;
    const t = DIBUAT + 1000;
    // Kerangka penuh terakhir s2 dan s3 dikirim saat bergabung (DIBUAT + 1000); belum 1 detik.
    const awal = gerak(k, "s1", x0 + 3, y0, 1, t + 500);
    expect(duniaKe(awal, "s2").map(idDi)).toEqual([[a.id]]);
    const penuh = gerak(k, "s1", x0 + 6, y0, 2, t + 1100);
    expect(duniaKe(penuh, "s2").map(idDi)).toEqual([[a.id, c.id].sort()]);
    expect(duniaKe(penuh, "s3").map(idDi)).toEqual([[a.id, b.id].sort()]);
    expect(duniaKe(penuh, "s1").map(idDi)).toEqual([[b.id, c.id].sort()]);
    const lagi = gerak(k, "s1", x0 + 9, y0, 3, t + 1300);
    expect(duniaKe(lagi, "s2").map(idDi)).toEqual([[a.id]]);
    expect(duniaKe(lagi, "s1")).toEqual([]);
  });

  it("gerbang padat selama lobi dan hitung mundur, terbuka sejak main, di grid yang sama dengan klien", () => {
    const k = ruangKampung();
    const a = masuk(k, "s1");
    const pa = k.pemain.get(a.id)!;
    const gb = { kiri: 79, atas: 61 };
    const depan = { x: gb.kiri * 16 + 8, y: (gb.atas - 1) * 16 + 12 }; // di dalam halaman, tepat di depan gerbang
    const lobi = { lebar: PETA_KAMPUNG.lebar, tinggi: PETA_KAMPUNG.tinggi, tabrakan: PETA_KAMPUNG.tabrakanLobi };
    const kampung = { lebar: PETA_KAMPUNG.lebar, tinggi: PETA_KAMPUNG.tinggi, tabrakan: PETA_KAMPUNG.tabrakan };
    expect([posisiSah(lobi, depan.x, depan.y), posisiSah(lobi, depan.x, depan.y + 8), posisiSah(kampung, depan.x, depan.y + 8)]).toEqual([true, false, true]);
    pa.posisi = { ...depan, arah: "bawah" };
    const tolak = gerak(k, "s1", depan.x, depan.y + 8, 1, DIBUAT + 10_000);
    expect(pesanKe(tolak, "s1")).toEqual([{ v: PROTOKOL_VERSI, t: "koreksi", x: depan.x, y: depan.y, seq: 1 }]);
    terimaKelas(k, { v: PROTOKOL_VERSI, t: "mulai" }, DIBUAT + 20_000);
    expect(pesanKe(gerak(k, "s1", depan.x, depan.y + 8, 2, DIBUAT + 21_000), "s1")).toContainEqual({ v: PROTOKOL_VERSI, t: "koreksi", x: depan.x, y: depan.y, seq: 2 });
    alarm(k, k.waktu.mulaiPada!, true);
    expect(k.status).toBe("main");
    const terima = gerak(k, "s1", depan.x, depan.y + 8, 3, k.waktu.mulaiPada! + 1000);
    expect(pesanKe(terima, "s1")).toEqual([]);
    expect(pa.posisi).toEqual({ x: depan.x, y: depan.y + 8, arah: "kanan" });
  });

  it("40 pemain diam di lobi: tidak ada kiriman dunia dan tidak ada putaran", () => {
    const k = ruangKampung();
    let dunia = 0;
    for (let i = 0; i < 40; i++) {
      const m = masuk(k, `s${i}`, DIBUAT + i);
      expect(m.o.putaran).toBeNull();
    }
    for (let t = 0; t < 30; t++) {
      const o = semuaSah(terimaPemain(k, "s0", { v: PROTOKOL_VERSI, t: "ping", tKlien: t }, DIBUAT + 5000 + t * 1000, acak));
      dunia += o.kirim.filter((x) => x.pesan.t === "dunia").length;
      expect(o.putaran).toBeNull();
    }
    expect(dunia).toBe(0);
  });

  it("jeda: gerak ditolak tanpa koreksi; selesai: tidak ada posisi awal saat sambung ulang", () => {
    const k = ruangKampung();
    const a = masuk(k, "s1");
    terimaKelas(k, { v: PROTOKOL_VERSI, t: "mulai" }, DIBUAT + 10_000);
    alarm(k, k.waktu.mulaiPada!, true);
    terimaKelas(k, { v: PROTOKOL_VERSI, t: "jeda" }, k.waktu.mulaiPada! + 1000);
    const pa = k.pemain.get(a.id)!;
    expect(gerak(k, "s1", pa.posisi!.x + 3, pa.posisi!.y, 9, k.waktu.mulaiPada! + 2000).kirim).toEqual([]);
    terimaKelas(k, { v: PROTOKOL_VERSI, t: "akhiri" }, k.waktu.mulaiPada! + 3000);
    sambunganPutus(k, "s1", k.waktu.mulaiPada! + 4000);
    const ulang = halo(k, "s2", k.waktu.mulaiPada! + 5000, { token: a.token });
    // JS-08 (P-36): sambung ulang sesudah ronde selesai menerima `selesai` lagi, tetap tanpa posisi awal.
    expect(jenis(pesanKe(ulang.o, "s2"))).toEqual(["selamat_datang", "status_ruang", "pemain_baru", "selesai"]);
  });
});

describe("JS-07: putaran main dan pemulihan (P-46, P-51, P-52)", () => {
  function ruangKampungMain(jumlah: number) {
    const k = ruangKampung({ batasPemain: 100 });
    for (let i = 0; i < jumlah; i++) masuk(k, `s${i}`, DIBUAT + i);
    terimaKelas(k, { v: PROTOKOL_VERSI, t: "mulai" }, DIBUAT + 10_000);
    alarm(k, k.waktu.mulaiPada!, true);
    return k;
  }

  it("setiap putaran ke-10 adalah kerangka penuh: pemain diam juga dikirim; putaran biasa hanya yang berubah", () => {
    const k = ruangKampungMain(3);
    const t = k.waktu.mulaiPada!;
    expect(KERANGKA_PENUH_SETIAP).toBe(10);
    const pertama = semuaSah(putaran(k, t + 100));
    expect(duniaKe(pertama, "s0")[0].p).toHaveLength(2); // awal main: semua dianggap berubah
    for (let i = 2; i <= 9; i++) expect(semuaSah(putaran(k, t + i * 100)).kirim, `putaran ${i}`).toEqual([]);
    const penuh = semuaSah(putaran(k, t + 1000));
    for (const sid of ["s0", "s1", "s2"]) expect(duniaKe(penuh, sid)[0].p, sid).toHaveLength(2);
    expect(duniaKe(penuh, "s0")[0].n).toBe(3);
  });

  it("100 pemain berdesakan: setiap dunia paling banyak 24 pemain, termasuk kerangka penuh", () => {
    const k = ruangKampungMain(100);
    const t = k.waktu.mulaiPada!;
    for (let i = 1; i <= 10; i++) {
      for (const { pesan } of semuaSah(putaran(k, t + i * 100)).kirim) if (pesan.t === "dunia") expect(pesan.p.length).toBeLessThanOrEqual(24);
    }
  });

  it("ruang yang dipulihkan memakai peta kampung: posisi tidak sah diganti titik muncul, posisi sah tetap", () => {
    const k = ruangKampung();
    const a = masuk(k, "s1");
    const b = masuk(k, "s2");
    const pemain = [...k.pemain.values()].map((p) => ({ ...p, posisi: p.posisi ? { ...p.posisi } : null }));
    const pa = pemain.find((p) => p.id === a.id)!;
    pa.posisi = { x: 8, y: 12, arah: "bawah" }; // pojok peta, sel tepi selalu padat
    const pb = pemain.find((p) => p.id === b.id)!;
    const posB = { ...pb.posisi! };
    const baru = pulihkanKeadaan(
      { ruang: k.ruang, status: "lobi", waktu: k.waktu, terkunci: false, ditutupPada: null, sambunganTerakhirPutus: null, pemain, sambungan: [] },
      PETA_KAMPUNG,
      DIBUAT + 9000,
    );
    const t0 = PETA_KAMPUNG.titikMuncul[0];
    expect(baru.pemain.get(a.id)?.posisi).toEqual({ x: t0.x * 16 + 8, y: t0.y * 16 + 12, arah: "bawah" });
    expect(baru.pemain.get(b.id)?.posisi).toEqual(posB);
    expect(baru.peta.versi).toBe(PETA_KAMPUNG.versi);
  });

  it("anggaran jarak: laporan jujur setiap 100 ms yang tiba berdempet tetap diterima", () => {
    const k = ruangKampungMain(1);
    const p = k.pemain.get(k.sambungan.get("s0")!)!;
    let x = p.posisi!.x;
    const y = p.posisi!.y;
    let t = k.waktu.mulaiPada! + 2000;
    let koreksi = 0;
    for (let i = 1; i <= 20; i++) {
      x += i % 2 ? 7.2 : -7.2; // bolak-balik di halaman lobi
      t += i % 2 ? 200 : 0;
      koreksi += semuaSah(terimaPemain(k, "s0", { v: PROTOKOL_VERSI, t: "gerak", x, y, arah: "kanan", jalan: true, seq: i }, t, acak)).koreksi;
    }
    expect(koreksi).toBe(0);
  });
});
