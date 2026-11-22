// Mode nama, penyaring, ganti nama, dan ganti semua nama di inti ruang (spesifikasi JS-14, P-41 sampai P-50; AC-13,
// AC-15, AC-16).
import { describe, expect, it } from "vitest";
import { acakBerbenih } from "../../inti/acak";
import { sidikNama } from "../../inti/nama";
import { PROTOKOL_VERSI, skemaServerPemain, type PesanPemain, type PesanServerPemain } from "../../inti/protokol";
import { skemaServerKelas } from "../../inti/protokol-kelas";
import type { PengaturanRuang } from "../../inti/tipe";
import {
  BATAS_TOLAK_NAMA,
  buatKeadaan,
  gantiNama,
  gantiSemuaNama,
  keluaranKosong,
  pilihSaran,
  pulihkanKeadaan,
  sambunganMasuk,
  terimaHalo,
  terimaKelas,
  terimaPemain,
  type KeadaanRuang,
  type Keluaran,
} from "../../../../server/jejak-setara/src/ruang/inti-ruang";
import { NAMA_SAMARAN } from "../../../../server/jejak-setara/src/ruang/nama-samaran";
import { PETA_UJI } from "../../../../server/jejak-setara/src/ruang/peta-uji";

const V = PROTOKOL_VERSI;
const PENGATURAN: PengaturanRuang = { durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, skillAktif: [], modeNomorAbsen: false, modeNama: "bebas", uji: true };
const DIBUAT = 1_000_000;
const acak = acakBerbenih(14);
let nomor = 0;

function ruang(modeNama: PengaturanRuang["modeNama"] = "bebas"): KeadaanRuang {
  return buatKeadaan({ ruangId: "r-14", kode: "K7MPA", pengaturan: { ...PENGATURAN, modeNama }, benih: 7, dibuatPada: DIBUAT }, PETA_UJI);
}

function sah(o: Keluaran): Keluaran {
  for (const { pesan } of o.kirim) expect(skemaServerPemain.safeParse(pesan).success, JSON.stringify(pesan)).toBe(true);
  for (const pesan of o.kelas) expect(skemaServerKelas.safeParse(pesan).success, JSON.stringify(pesan)).toBe(true);
  return o;
}

const pesanKe = (o: Keluaran, sid: string) => o.kirim.filter((x) => x.sambunganId === sid).map((x) => x.pesan);
type Datang = Extract<PesanServerPemain, { t: "selamat_datang" }>;

function halo(k: KeadaanRuang, sid: string) {
  sambunganMasuk(k, sid, DIBUAT);
  nomor++;
  const calon = { pemainId: `p${nomor}`, token: `t${nomor}`.padEnd(43, "A"), hashToken: `h${nomor}` };
  const pesan: Extract<PesanPemain, { t: "halo" }> = { v: V, t: "halo", peran: "pemain" };
  const o = sah(terimaHalo(k, sid, pesan, DIBUAT + 10, acak, calon, null));
  return { id: calon.pemainId, datang: pesanKe(o, sid)[0] as Datang };
}

const pilih = (k: KeadaanRuang, sid: string, nama: string) => sah(terimaPemain(k, sid, { v: V, t: "pilih_identitas", nama, avatar: 1 }, DIBUAT + 20, acak));
const galatDari = (o: Keluaran, sid: string) => pesanKe(o, sid).find((p) => p.t === "galat") as Extract<PesanServerPemain, { t: "galat" }> | undefined;

function bergabung(k: KeadaanRuang, sid: string, nama?: string) {
  const h = halo(k, sid);
  const o = pilih(k, sid, nama ?? h.datang.saranNama[0]);
  expect(galatDari(o, sid), nama).toBeUndefined();
  return { id: h.id, nama: k.pemain.get(h.id)?.nama ?? "" };
}

describe("mode nama dan pilih_identitas (P-41 sampai P-44)", () => {
  it("selamat_datang membawa mode yang berlaku; nama buatan diterima dalam bentuk rapi", () => {
    const k = ruang("bebas");
    const { id, datang } = halo(k, "s1");
    expect(datang.pengaturan.modeNama).toBe("bebas");
    const o = pilih(k, "s1", "  Putu   Agus ");
    expect(k.pemain.get(id)?.nama).toBe("Putu Agus");
    expect(pesanKe(o, "s1").some((p) => p.t === "pemain_baru" && p.nama === "Putu Agus")).toBe(true);
    expect(o.kiriman.some((b) => b.jenis === "peserta")).toBe(true);
  });

  it("saran nama samaran tetap diterima di mode bebas", () => {
    const k = ruang("bebas");
    const { id, datang } = halo(k, "s1");
    pilih(k, "s1", datang.saranNama[1]);
    expect(k.pemain.get(id)?.nama).toBe(datang.saranNama[1]);
  });

  it("bentuk tidak sah dan kata kasar: NAMA_DITOLAK lalu saran baru, tanpa menyebut kata yang tertangkap", () => {
    const k = ruang("bebas");
    halo(k, "s1");
    for (const nama of ["Al", "Budi!", "Budi Anjing", "B4B1"]) {
      const o = pilih(k, "s1", nama);
      const g = galatDari(o, "s1");
      expect(g?.kode, nama).toBe("NAMA_DITOLAK");
      expect(g?.pesan).toBe("Nama itu tidak bisa dipakai. Coba nama lain.");
      expect(pesanKe(o, "s1").map((p) => p.t)).toEqual(["galat", "saran_nama"]);
    }
  });

  it("nama kembar tanpa membedakan huruf besar dan kecil, termasuk pemain yang dikeluarkan: NAMA_DIPAKAI", () => {
    const k = ruang("bebas");
    const a = bergabung(k, "s1", "Budi Santoso");
    halo(k, "s2");
    expect(galatDari(pilih(k, "s2", "budi  SANTOSO"), "s2")?.kode).toBe("NAMA_DIPAKAI");
    terimaKelas(k, { v: V, t: "keluarkan", pemainId: a.id }, DIBUAT + 30);
    expect(galatDari(pilih(k, "s2", "Budi Santoso"), "s2")?.kode).toBe("NAMA_DIPAKAI");
  });

  it(`penolakan ke-${BATAS_TOLAK_NAMA} mengirim mode_nama daftar; sesudah itu hanya saran yang diterima`, () => {
    const k = ruang("bebas");
    const { id } = halo(k, "s1");
    let o = keluaranKosong();
    for (let i = 0; i < BATAS_TOLAK_NAMA; i++) o = pilih(k, "s1", "Budi Anjing");
    expect(pesanKe(o, "s1").map((p) => p.t)).toEqual(["galat", "mode_nama", "saran_nama"]);
    expect(k.pemain.get(id)?.tolak).toBe(BATAS_TOLAK_NAMA);
    const ditolak = pilih(k, "s1", "Putu Agus");
    expect(galatDari(ditolak, "s1")?.kode).toBe("NAMA_DIPAKAI");
    const saran = (pesanKe(ditolak, "s1").find((p) => p.t === "saran_nama") as Extract<PesanServerPemain, { t: "saran_nama" }>).saranNama;
    pilih(k, "s1", saran[0]);
    expect(k.pemain.get(id)?.nama).toBe(saran[0]);
  });

  it("mode daftar: nama di luar saran ditolak NAMA_DIPAKAI seperti JS-03", () => {
    const k = ruang("daftar");
    const { datang } = halo(k, "s1");
    expect(datang.pengaturan.modeNama).toBe("daftar");
    expect(galatDari(pilih(k, "s1", "Putu Agus"), "s1")?.kode).toBe("NAMA_DIPAKAI");
  });

  it("pilihSaran tidak menyarankan nama yang diblokir atau yang dipakai dengan huruf berbeda", () => {
    const k = ruang("bebas");
    bergabung(k, "s1", "kancil jingga");
    k.namaDiblokir.push(sidikNama("Jalak Biru"));
    for (let i = 0; i < 30; i++) {
      const saran = pilihSaran(k, [], acak);
      expect(saran).not.toContain("Kancil Jingga");
      expect(saran).not.toContain("Jalak Biru");
    }
  });
});

describe("ganti nama (P-46, P-47, P-50)", () => {
  it("nama pengganti dari daftar; nama lama hanya tersimpan sebagai sidik; nama_baru ke semua; lobi dan papan ke layar kelas", () => {
    const k = ruang("bebas");
    bergabung(k, "s1");
    const b = bergabung(k, "s2", "Putu Agus");
    const o = keluaranKosong();
    // Ejekan dengan kata biasa lolos penyaring (bagian "Keamanan dan privasi"); guru menggantinya.
    const c = bergabung(k, "s3", "Raka Roda");
    const baru = gantiNama(k, o, c.id, acak);
    sah(o);
    expect(NAMA_SAMARAN).toContain(baru);
    expect(k.pemain.get(c.id)?.nama).toBe(baru);
    expect(k.namaDiblokir).toContain(sidikNama("Raka Roda"));
    expect(JSON.stringify(o.simpan)).not.toContain("Raka Roda");
    expect(JSON.stringify(o.kiriman)).not.toContain("Raka Roda");
    for (const sid of ["s1", "s2", "s3"]) expect(pesanKe(o, sid)).toContainEqual({ v: V, t: "nama_baru", id: c.id, nama: baru });
    expect(o.kelas.some((p) => p.t === "lobi")).toBe(true);
    expect(o.kiriman.some((x) => x.jenis === "peserta" && JSON.stringify(x).includes(String(baru)))).toBe(true);
    expect(b.nama).toBe("Putu Agus");
  });

  it("nama yang diganti tidak bisa dipakai lagi di ruang itu", () => {
    const k = ruang("bebas");
    const c = bergabung(k, "s1", "Raka Roda");
    gantiNama(k, keluaranKosong(), c.id, acak);
    halo(k, "s2");
    expect(galatDari(pilih(k, "s2", "raka roda"), "s2")?.kode).toBe("NAMA_DITOLAK");
  });

  it("pemain yang dikeluarkan, belum bernama, atau tidak ada diabaikan; cadangan Pemain {urutan}", () => {
    const k = ruang("bebas");
    const c = bergabung(k, "s1", "Raka Roda");
    const h = halo(k, "s2");
    const o = keluaranKosong();
    expect(gantiNama(k, o, h.id, acak)).toBeNull();
    expect(gantiNama(k, o, "p-tidak-ada", acak)).toBeNull();
    expect(o.kirim).toHaveLength(0);
    k.namaDiblokir.push(...NAMA_SAMARAN.map((n) => sidikNama(n)));
    const urutan = k.pemain.get(c.id)?.urutan;
    expect(gantiNama(k, keluaranKosong(), c.id, acak)).toBe(`Pemain ${urutan}`);
    terimaKelas(k, { v: V, t: "keluarkan", pemainId: c.id }, DIBUAT + 40);
    expect(gantiNama(k, keluaranKosong(), c.id, acak)).toBeNull();
  });

  it("pesan layar kelas ganti_nama memakai pembangkit dari pembungkus", () => {
    const k = ruang("bebas");
    const c = bergabung(k, "s1", "Raka Roda");
    const o = sah(terimaKelas(k, { v: V, t: "ganti_nama", pemainId: c.id }, DIBUAT + 50, () => 0));
    expect(k.pemain.get(c.id)?.nama).not.toBe("Raka Roda");
    expect(pesanKe(o, "s1").some((p) => p.t === "nama_baru")).toBe(true);
  });
});

describe("ganti semua nama (P-48)", () => {
  it("hanya nama ketikan yang diganti; mode menjadi daftar; mode_nama ke pemain yang belum bernama", () => {
    const k = ruang("bebas");
    k.tautan = "https://jejak.contoh";
    const a = bergabung(k, "s1", "Raka Roda");
    const b = bergabung(k, "s2");
    const tunggu = halo(k, "s3");
    const o = keluaranKosong();
    expect(gantiSemuaNama(k, o, DIBUAT + 60, acak)).toBe(1);
    sah(o);
    expect(NAMA_SAMARAN).toContain(k.pemain.get(a.id)?.nama);
    expect(k.pemain.get(b.id)?.nama).toBe(b.nama);
    expect(k.modeNama).toBe("daftar");
    expect(pesanKe(o, "s3")).toContainEqual({ v: V, t: "mode_nama", modeNama: "daftar" });
    expect(o.kelas.some((p) => p.t === "info_kelas" && p.modeNama === "daftar")).toBe(true);
    expect(o.simpan).toContainEqual({ jenis: "meta", kunci: "modeNama", nilai: "daftar" });
    expect(galatDari(pilih(k, "s3", "Putu Agus"), "s3")?.kode).toBe("NAMA_DIPAKAI");
    expect(tunggu.id).toBeTruthy();
  });

  it("di ruang mode daftar diabaikan", () => {
    const k = ruang("daftar");
    bergabung(k, "s1");
    const o = keluaranKosong();
    expect(gantiSemuaNama(k, o, DIBUAT, acak)).toBeNull();
    expect(o.kirim).toHaveLength(0);
    expect(terimaKelas(k, { v: V, t: "ganti_semua_nama" }, DIBUAT).kirim).toHaveLength(0);
  });
});

describe("pemulihan (P-41, P-44, P-50)", () => {
  it("mode nama, daftar blokir, dan hitungan penolakan bertahan saat ruang dipulihkan", () => {
    const k = ruang("bebas");
    const c = bergabung(k, "s1", "Raka Roda");
    gantiSemuaNama(k, keluaranKosong(), DIBUAT, acak);
    const h = halo(k, "s2");
    k.pemain.get(h.id)!.tolak = 3;
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
        modeNama: k.modeNama,
        namaDiblokir: k.namaDiblokir,
      },
      PETA_UJI,
      DIBUAT + 100,
    );
    expect(pulih.modeNama).toBe("daftar");
    expect(pulih.namaDiblokir).toContain(sidikNama("Raka Roda"));
    expect(pulih.pemain.get(h.id)?.tolak).toBe(3);
    expect(pulih.pemain.get(c.id)?.nama).not.toBe("Raka Roda");
  });
});
