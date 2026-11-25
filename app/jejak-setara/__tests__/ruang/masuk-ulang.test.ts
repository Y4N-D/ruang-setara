// Kode masuk ulang di inti ruang (spesifikasi JS-16b, P-12, P-14, P-15; AC-10).
import { describe, expect, it } from "vitest";
import { acakBerbenih } from "../../inti/acak";
import { PROTOKOL_VERSI, skemaServerPemain, type PesanServerPemain } from "../../inti/protokol";
import { skemaServerKelas } from "../../inti/protokol-kelas";
import type { PengaturanRuang } from "../../inti/tipe";
import {
  alarm,
  aturKodeMasukUlang,
  BATAS_SALAH_MASUK_ULANG,
  buatKeadaan,
  MASA_KODE_MASUK_ULANG_MS,
  pulihkanKeadaan,
  sambunganMasuk,
  sambunganPutus,
  terimaHalo,
  terimaKelas,
  terimaPemain,
  type KeadaanRuang,
  type Keluaran,
} from "../../../../server/jejak-setara/src/ruang/inti-ruang";
import { jumlahTitikRuang, tempatkanRuang } from "../../../../server/jejak-setara/src/ruang/kejadian-ruang";
import { PETA_KAMPUNG, TITIK_PER_ZONA } from "../../../../server/jejak-setara/src/ruang/peta-kampung";
import { MASUK } from "./bankUji";

const V = PROTOKOL_VERSI;
const DIBUAT = 1_000_000;
const PENGATURAN: PengaturanRuang = { durasiMenit: 15, batasPemain: 40, batasTerlambatMenit: 5, skillAktif: [], modeNomorAbsen: false, modeNama: "daftar", uji: true };
const acak = acakBerbenih(16);
let nomor = 0;

function semuaSah(o: Keluaran): Keluaran {
  for (const { pesan } of o.kirim) expect(skemaServerPemain.safeParse(pesan).success, JSON.stringify(pesan)).toBe(true);
  for (const pesan of o.kelas) expect(skemaServerKelas.safeParse(pesan).success, JSON.stringify(pesan)).toBe(true);
  return o;
}
const ke = (o: Keluaran, sid: string) => o.kirim.filter((x) => x.sambunganId === sid).map((x) => x.pesan);
const galatKe = (o: Keluaran, sid: string) => ke(o, sid).find((p): p is Extract<PesanServerPemain, { t: "galat" }> => p.t === "galat");

function ruang(pengaturan: Partial<PengaturanRuang> = {}): KeadaanRuang {
  const p = { ...PENGATURAN, ...pengaturan };
  const kejadian = tempatkanRuang(7, TITIK_PER_ZONA, MASUK, jumlahTitikRuang(p.batasPemain));
  return buatKeadaan({ ruangId: "r-16", kode: "K7MPA", pengaturan: p, benih: 7, dibuatPada: DIBUAT }, PETA_KAMPUNG, kejadian);
}
function calon() {
  nomor++;
  const token = `c${nomor}`.padEnd(43, "B");
  return { pemainId: `p${nomor}`, token, hashToken: `h:${token}` };
}
function masuk(k: KeadaanRuang, sid: string, t = DIBUAT + 100, nomorAbsen?: number) {
  sambunganMasuk(k, sid, t);
  const c = calon();
  const o = semuaSah(terimaHalo(k, sid, { v: V, t: "halo", peran: "pemain", ...(nomorAbsen ? { nomorAbsen } : {}) }, t, acak, c, null));
  const datang = ke(o, sid)[0] as Extract<PesanServerPemain, { t: "selamat_datang" }>;
  semuaSah(terimaPemain(k, sid, { v: V, t: "pilih_identitas", nama: datang.saranNama[0], avatar: 1 }, t, acak));
  return { id: c.pemainId, nama: datang.saranNama[0], hashToken: c.hashToken };
}
function masukUlang(k: KeadaanRuang, sid: string, kode: string, hash: string | null, t: number) {
  sambunganMasuk(k, sid, t);
  const c = calon();
  return { c, o: semuaSah(terimaHalo(k, sid, { v: V, t: "halo", peran: "pemain", kodeMasukUlang: kode }, t, acak, c, null, hash)) };
}

describe("JS-16b: kode masuk ulang di inti ruang (AC-10)", () => {
  it("kode cocok memindahkan pemain ke sambungan baru dengan token baru, lalu sambungan lama ditutup 4001", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    const t = DIBUAT + 2000;
    const buat = aturKodeMasukUlang(k, a.id, "hash:K7M2PA", t);
    expect(buat.simpan).toEqual([{ jenis: "kode_masuk_ulang", pemainId: a.id, hash: "hash:K7M2PA", berlakuSampai: t + MASA_KODE_MASUK_ULANG_MS }]);
    const { c, o } = masukUlang(k, "s2", "K7M2PA", "hash:K7M2PA", t + 1000);
    const datang = ke(o, "s2").find((p) => p.t === "selamat_datang") as Extract<PesanServerPemain, { t: "selamat_datang" }>;
    expect(datang.pemainId).toBe(a.id);
    expect(datang.token).toBe(c.token);
    expect(o.tutup).toEqual([{ sambunganId: "s1", kode: 4001, alasan: "diganti" }]);
    const p = k.pemain.get(a.id)!;
    expect([p.nama, p.hashToken, p.terhubung]).toEqual([a.nama, c.hashToken, true]);
    expect(k.sambunganPemain.get(a.id)).toBe("s2");
    expect(o.simpan).toEqual(expect.arrayContaining([{ jenis: "hapus_kode_masuk_ulang", pemainId: a.id }, expect.objectContaining({ jenis: "pemain" })]));
    expect(k.kodeMasukUlang.size).toBe(0);
    expect(k.pemain.size).toBe(1);
  });

  it("kode sekali pakai, kedaluwarsa sesudah 10 menit, dan kode baru menggantikan kode lama", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    aturKodeMasukUlang(k, a.id, "hash:A", DIBUAT + 1000);
    expect(galatKe(masukUlang(k, "s2", "AAAAAA", "hash:A", DIBUAT + 2000).o, "s2")).toBeUndefined();
    expect(galatKe(masukUlang(k, "s3", "AAAAAA", "hash:A", DIBUAT + 3000).o, "s3")?.kode).toBe("KODE_MASUK_ULANG_SALAH");

    aturKodeMasukUlang(k, a.id, "hash:B", DIBUAT + 4000);
    const habis = masukUlang(k, "s4", "BBBBBB", "hash:B", DIBUAT + 4000 + MASA_KODE_MASUK_ULANG_MS);
    expect(galatKe(habis.o, "s4")?.kode).toBe("KODE_MASUK_ULANG_SALAH");
    expect(habis.o.simpan).toContainEqual({ jenis: "hapus_kode_masuk_ulang", pemainId: a.id });

    aturKodeMasukUlang(k, a.id, "hash:C", DIBUAT + 9000);
    aturKodeMasukUlang(k, a.id, "hash:D", DIBUAT + 9500);
    expect(galatKe(masukUlang(k, "s5", "CCCCCC", "hash:C", DIBUAT + 9600).o, "s5")?.kode).toBe("KODE_MASUK_ULANG_SALAH");
    expect(galatKe(masukUlang(k, "s6", "DDDDDD", "hash:D", DIBUAT + 9700).o, "s6")).toBeUndefined();
  });

  it("ruang terkunci, penuh, terlambat, dan mode nomor absen tidak menahan masuk ulang", () => {
    const k = ruang({ batasPemain: 2, modeNomorAbsen: true });
    const a = masuk(k, "s1", DIBUAT + 100, 7);
    masuk(k, "s0", DIBUAT + 150, 8); // ruang penuh
    semuaSah(terimaKelas(k, { v: V, t: "kunci_ruang", kunci: true }, DIBUAT + 200));
    semuaSah(terimaKelas(k, { v: V, t: "mulai" }, DIBUAT + 300));
    semuaSah(alarm(k, k.waktu.mulaiPada as number, true));
    const lewat = (k.waktu.mulaiPada as number) + 6 * 60_000; // lewat batas terlambat 5 menit
    aturKodeMasukUlang(k, a.id, "hash:E", lewat);
    // Pemain baru ditolak, pemain lama masuk lagi dengan kode.
    sambunganMasuk(k, "s2", lewat);
    expect(galatKe(semuaSah(terimaHalo(k, "s2", { v: V, t: "halo", peran: "pemain", nomorAbsen: 9 }, lewat, acak, calon(), null)), "s2")?.kode).toBe("RUANG_TERKUNCI");
    const { o } = masukUlang(k, "s3", "EEEEEE", "hash:E", lewat + 10);
    expect(ke(o, "s3").some((p) => p.t === "selamat_datang")).toBe(true);
    expect(k.pemain.get(a.id)?.nomorAbsen).toBe(7);
  });

  it("pemain yang dikeluarkan dan ruang yang ditutup ditolak", () => {
    const k = ruang();
    const a = masuk(k, "s1");
    aturKodeMasukUlang(k, a.id, "hash:F", DIBUAT + 1000);
    semuaSah(terimaKelas(k, { v: V, t: "keluarkan", pemainId: a.id }, DIBUAT + 1100));
    const keluar = masukUlang(k, "s2", "FFFFFF", "hash:F", DIBUAT + 1200).o;
    expect(galatKe(keluar, "s2")?.kode).toBe("DIKELUARKAN");
    expect(keluar.tutup).toContainEqual(expect.objectContaining({ sambunganId: "s2", kode: 4004 }));

    const k2 = ruang();
    const b = masuk(k2, "s1");
    aturKodeMasukUlang(k2, b.id, "hash:G", DIBUAT + 1000);
    semuaSah(terimaKelas(k2, { v: V, t: "tutup_ruang" }, DIBUAT + 1100));
    expect(galatKe(masukUlang(k2, "s2", "GGGGGG", "hash:G", DIBUAT + 1200).o, "s2")?.kode).toBe("RUANG_TIDAK_ADA");
  });

  it("kesalahan kelima menutup sambungan 1008; token dan kode bersamaan melanggar; hitungan hilang saat sambungan putus", () => {
    const k = ruang();
    masuk(k, "s1");
    sambunganMasuk(k, "s2", DIBUAT + 1000);
    let o: Keluaran = { kirim: [], kelas: [], simpan: [], tutup: [], ikat: [] } as unknown as Keluaran;
    for (let i = 1; i <= BATAS_SALAH_MASUK_ULANG; i++) {
      o = semuaSah(terimaHalo(k, "s2", { v: V, t: "halo", peran: "pemain", kodeMasukUlang: "ZZZZZZ" }, DIBUAT + 1000 + i, acak, calon(), null, "hash:salah"));
      expect(galatKe(o, "s2")?.kode).toBe("KODE_MASUK_ULANG_SALAH");
      if (i < BATAS_SALAH_MASUK_ULANG) expect(o.tutup).toEqual([]);
    }
    expect(o.tutup).toContainEqual(expect.objectContaining({ sambunganId: "s2", kode: 1008 }));

    sambunganMasuk(k, "s3", DIBUAT + 2000);
    const ganda = semuaSah(terimaHalo(k, "s3", { v: V, t: "halo", peran: "pemain", token: "x".padEnd(43, "x"), kodeMasukUlang: "AAAAAA" }, DIBUAT + 2000, acak, calon(), "h:x", "hash:A"));
    expect(ganda.tutup).toContainEqual(expect.objectContaining({ sambunganId: "s3", kode: 1008 }));

    sambunganMasuk(k, "s4", DIBUAT + 3000);
    semuaSah(terimaHalo(k, "s4", { v: V, t: "halo", peran: "pemain", kodeMasukUlang: "ZZZZZZ" }, DIBUAT + 3000, acak, calon(), null, "hash:salah"));
    expect(k.salahMasukUlang.get("s4")).toBe(1);
    sambunganPutus(k, "s4", DIBUAT + 3001);
    expect(k.salahMasukUlang.has("s4")).toBe(false);
  });

  it("kode yang tersimpan ikut dipulihkan saat Durable Object bangun ulang (AC-11, bagian inti)", () => {
    const k = pulihkanKeadaan(
      {
        ruang: { ruangId: "r-16", kode: "K7MPA", pengaturan: PENGATURAN, benih: 7, dibuatPada: DIBUAT },
        status: "lobi",
        waktu: ruang().waktu,
        terkunci: false,
        ditutupPada: null,
        sambunganTerakhirPutus: null,
        pemain: [],
        sambungan: [],
        kodeMasukUlang: [{ pemainId: "p-1", hash: "hash:H", berlakuSampai: DIBUAT + 5000 }],
      } as unknown as Parameters<typeof pulihkanKeadaan>[0],
      PETA_KAMPUNG,
      DIBUAT,
    );
    expect(k.kodeMasukUlang.get("p-1")).toEqual({ hash: "hash:H", berlakuSampai: DIBUAT + 5000 });
  });
});
