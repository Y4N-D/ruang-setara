// Logika ruang Jejak Setara (spesifikasi JS-03, bagian D sampai H; Architecture 7 dan JA-11).
// Murni: tanpa API Workers, jam, atau acak langsung. Pembungkus (RuangJejak.ts) memberi `sekarang`,
// fungsi `acak`, dan id baru, lalu menjalankan Keluaran: pesan, penutupan, penyimpanan, dan kiriman ke D1.
import { BATAS, hitungPeringkat } from "../../../../app/jejak-setara/inti/aturan";
import { koreksi, periksaGerak } from "../../../../app/jejak-setara/inti/gerak";
import { UKURAN_UBIN } from "../../../../app/jejak-setara/inti/peta";
import type { KodeGalat, PesanKelas, PesanPemain, PesanServerKelas, PesanServerPemain } from "../../../../app/jejak-setara/inti/protokol";
import type { Arah, PengaturanRuang, StatusRuang, WarnaTas } from "../../../../app/jejak-setara/inti/tipe";
import { TEKS } from "../../../../app/jejak-setara/teks";
import { NAMA_SAMARAN } from "./nama-samaran";

/** Kode penutupan sambungan (spesifikasi JS-03, bagian "Protokol"). */
export const KODE_TUTUP = {
  pelanggaran: 1008,
  ditutup: 4000,
  diganti: 4001,
  tanpaHalo: 4002,
  ditolak: 4003,
  dikeluarkan: 4004,
  versi: 4005,
} as const;

const JAM = 3_600_000;
export const WAKTU = {
  hitungMundurMs: 3000,
  tutupTanpaSambunganMs: 3 * JAM,
  tutupSejakDibuatMs: 6 * JAM,
  hapusSesudahTutupMs: 24 * JAM,
  lepasTanpaIdentitasMs: 5 * 60_000,
} as const;

/** Urutan warna tas bila jumlah pemakaiannya seri (P-23). */
export const URUTAN_WARNA_TAS: readonly WarnaTas[] = ["sun", "mango", "coral", "rose", "berry", "teal", "leaf", "sky-d"];
export const AVATAR_TERSEDIA: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7];
/** Setengah kotak 480 × 270 piksel logis di sekitar pemain (P-43). */
const SETENGAH_KOTAK = { x: 240, y: 135 } as const;

export interface DataRuang {
  ruangId: string;
  kode: string;
  pengaturan: PengaturanRuang;
  benih: number;
  dibuatPada: number;
}

export interface PetaRuang {
  versi: number;
  lebar: number;
  tinggi: number;
  tabrakan: Uint8Array;
  titikMuncul: readonly { x: number; y: number }[];
}

export interface PosisiPemain {
  x: number;
  y: number;
  arah: Arah;
}

export interface PemainRuang {
  id: string;
  hashToken: string;
  urutan: number;
  nama: string | null;
  avatar: number | null;
  warnaTas: WarnaTas | null;
  nomorAbsen: number | null;
  saran: string[];
  terhubung: boolean;
  terputusSejak: number | null;
  posisi: PosisiPemain | null;
  dikeluarkan: boolean;
  gabungPada: number;
}

/** Keadaan gerak yang hanya ada di memori (tidak ditulis ke SQLite). */
interface GerakPemain {
  seqTerakhir: number;
  gerakTerakhirMs: number;
  jalan: boolean;
  berubah: boolean;
}

export interface WaktuRuang {
  mulaiPada: number | null;
  berakhirPada: number | null;
  jedaSejak: number | null;
  jedaMs: number;
  selesaiPada: number | null;
}

export interface KeadaanRuang {
  ruang: DataRuang;
  peta: PetaRuang;
  status: StatusRuang;
  waktu: WaktuRuang;
  terkunci: boolean;
  ditutupPada: number | null;
  sambunganTerakhirPutus: number | null;
  pemain: Map<string, PemainRuang>;
  gerak: Map<string, GerakPemain>;
  sambungan: Map<string, string | null>; // sambunganId → pemainId
  sambunganPemain: Map<string, string>; // pemainId → sambunganId
  batasHalo: Map<string, number>; // sambunganId → batas waktu halo (P-15)
  urutanBerikut: number;
}

export type KunciMeta = "ruang" | "status" | "waktu" | "terkunci" | "ditutupPada" | "sambunganTerakhirPutus";
export type Simpanan =
  | { jenis: "pemain"; pemain: PemainRuang }
  | { jenis: "hapus_pemain"; id: string }
  | { jenis: "meta"; kunci: KunciMeta; nilai: unknown };

export interface BarisPeserta {
  id: string;
  ruangId: string;
  nama: string;
  avatar: number;
  warnaTas: WarnaTas;
  nomorAbsen: number | null;
  skor: number;
  waktuSkorMs: number | null;
  langkah1Benar: number;
  jumlahKejadian: number;
  gabungPada: number;
  peringkatAkhir: number | null;
}
export type BarisKiriman =
  | { jenis: "peserta"; isi: BarisPeserta }
  | { jenis: "ruang"; isi: { ruangId: string; status: StatusRuang; mulaiPada: number | null; selesaiPada: number | null } };

export interface Keluaran {
  kirim: { sambunganId: string; pesan: PesanServerPemain }[];
  kelas: PesanServerKelas[];
  tutup: { sambunganId: string; kode: number; alasan: string }[];
  ikat: { sambunganId: string; pemainId: string | null }[];
  simpan: Simpanan[];
  kiriman: BarisKiriman[];
  putaran: "mulai" | "henti" | null;
  kirimSekarang: boolean;
  hapusSemua: boolean;
  koreksi: number;
}

export function keluaranKosong(): Keluaran {
  return { kirim: [], kelas: [], tutup: [], ikat: [], simpan: [], kiriman: [], putaran: null, kirimSekarang: false, hapusSemua: false, koreksi: 0 };
}

/** Calon pemain baru; id dan token dibuat pembungkus dengan sumber acak kriptografis. */
export interface CalonPemain {
  pemainId: string;
  token: string;
  hashToken: string;
}

export function buatKeadaan(ruang: DataRuang, peta: PetaRuang): KeadaanRuang {
  return {
    ruang,
    peta,
    status: "lobi",
    waktu: { mulaiPada: null, berakhirPada: null, jedaSejak: null, jedaMs: 0, selesaiPada: null },
    terkunci: false,
    ditutupPada: null,
    sambunganTerakhirPutus: null,
    pemain: new Map(),
    gerak: new Map(),
    sambungan: new Map(),
    sambunganPemain: new Map(),
    batasHalo: new Map(),
    urutanBerikut: 1,
  };
}

export interface DataPulih {
  ruang: DataRuang;
  status: StatusRuang;
  waktu: WaktuRuang;
  terkunci: boolean;
  ditutupPada: number | null;
  sambunganTerakhirPutus: number | null;
  pemain: PemainRuang[];
  sambungan: { sambunganId: string; pemainId: string | null; dibukaPada?: number }[];
}

/** Membangun keadaan dari SQLite dan lampiran sambungan sesudah hibernasi atau muat ulang (P-48). */
export function pulihkanKeadaan(d: DataPulih, peta: PetaRuang, sekarang: number): KeadaanRuang {
  const k = buatKeadaan(d.ruang, peta);
  k.status = d.status;
  k.waktu = { ...d.waktu };
  k.terkunci = d.terkunci;
  k.ditutupPada = d.ditutupPada;
  k.sambunganTerakhirPutus = d.sambunganTerakhirPutus;
  for (const p of d.pemain) {
    k.pemain.set(p.id, { ...p, terhubung: false });
    k.urutanBerikut = Math.max(k.urutanBerikut, p.urutan + 1);
  }
  for (const s of d.sambungan) {
    const p = s.pemainId ? k.pemain.get(s.pemainId) : undefined;
    if (p && !p.dikeluarkan) {
      k.sambungan.set(s.sambunganId, p.id);
      k.sambunganPemain.set(p.id, s.sambunganId);
      p.terhubung = true;
      p.terputusSejak = null;
    } else {
      k.sambungan.set(s.sambunganId, null);
      k.batasHalo.set(s.sambunganId, (s.dibukaPada ?? sekarang) + BATAS.haloMs);
    }
  }
  if (k.status === "main" || k.status === "jeda" || k.status === "hitung_mundur") {
    for (const p of k.pemain.values()) siapkanGerak(k, p, sekarang);
  }
  return k;
}

// ---------------------------------------------------------------------------------------------
// Bantuan

const berkeidentitas = (p: PemainRuang) => p.nama !== null && !p.dikeluarkan;

function urutPemain(k: KeadaanRuang): PemainRuang[] {
  return [...k.pemain.values()].sort((a, b) => a.urutan - b.urutan);
}

function kirimKe(o: Keluaran, sambunganId: string, pesan: PesanServerPemain): void {
  o.kirim.push({ sambunganId, pesan });
}

/** Ke semua sambungan yang sudah punya pemain, termasuk yang masih memilih identitas. */
function kirimSemua(k: KeadaanRuang, o: Keluaran, pesan: PesanServerPemain): void {
  for (const sid of k.sambunganPemain.values()) kirimKe(o, sid, pesan);
}

function galat(kode: KodeGalat): PesanServerPemain {
  return { v: 1, t: "galat", kode, pesan: TEKS.galat[kode] };
}

function pesanStatus(k: KeadaanRuang): PesanServerPemain {
  return { v: 1, t: "status_ruang", status: k.status, mulaiPada: k.waktu.mulaiPada, berakhirPada: k.waktu.berakhirPada, jedaSejak: k.waktu.jedaSejak };
}

function pesanPemainBaru(p: PemainRuang): PesanServerPemain {
  return { v: 1, t: "pemain_baru", id: p.id, nama: p.nama ?? "", avatar: p.avatar ?? 0, warnaTas: p.warnaTas ?? "sun" };
}

/** Daftar pemain untuk layar kelas (JS-10). */
export function pesanLobi(k: KeadaanRuang): PesanServerKelas {
  return {
    v: 1,
    t: "lobi",
    pemain: urutPemain(k)
      .filter(berkeidentitas)
      .map((p) => ({ id: p.id, nama: p.nama ?? "", avatar: p.avatar ?? 0, warnaTas: p.warnaTas ?? "sun", terhubung: p.terhubung })),
  };
}

function simpanPemain(o: Keluaran, p: PemainRuang): void {
  o.simpan.push({ jenis: "pemain", pemain: { ...p, saran: [...p.saran], posisi: p.posisi ? { ...p.posisi } : null } });
}

function simpanMeta(o: Keluaran, kunci: KunciMeta, nilai: unknown): void {
  o.simpan.push({ jenis: "meta", kunci, nilai });
}

function barisPeserta(k: KeadaanRuang, p: PemainRuang, peringkat: number | null): BarisKiriman {
  return {
    jenis: "peserta",
    isi: {
      id: p.id,
      ruangId: k.ruang.ruangId,
      nama: p.nama ?? "",
      avatar: p.avatar ?? 0,
      warnaTas: p.warnaTas ?? "sun",
      nomorAbsen: p.nomorAbsen,
      skor: 0,
      waktuSkorMs: null,
      langkah1Benar: 0,
      jumlahKejadian: 0,
      gabungPada: p.gabungPada,
      peringkatAkhir: peringkat,
    },
  };
}

function barisRuang(k: KeadaanRuang): BarisKiriman {
  return { jenis: "ruang", isi: { ruangId: k.ruang.ruangId, status: k.status, mulaiPada: k.waktu.mulaiPada, selesaiPada: k.waktu.selesaiPada } };
}

/** Simpan status dan waktu, kirim status_ruang ke semua, dan antrekan baris ruang untuk D1. */
function ubahStatus(k: KeadaanRuang, o: Keluaran): void {
  simpanMeta(o, "status", k.status);
  simpanMeta(o, "waktu", k.waktu);
  kirimSemua(k, o, pesanStatus(k));
  o.kiriman.push(barisRuang(k));
}

/** Titik muncul pemain dalam piksel logis (titik kaki di tengah-bawah ubin), bergiliran menurut urutan. */
export function titikMuncul(k: KeadaanRuang, urutan: number): PosisiPemain {
  const daftar = k.peta.titikMuncul;
  const t = daftar[(urutan - 1) % daftar.length];
  return { x: t.x * UKURAN_UBIN + UKURAN_UBIN / 2, y: t.y * UKURAN_UBIN + 12, arah: "bawah" };
}

function siapkanGerak(k: KeadaanRuang, p: PemainRuang, sekarang: number): void {
  if (!p.posisi) p.posisi = titikMuncul(k, p.urutan);
  k.gerak.set(p.id, { seqTerakhir: -1, gerakTerakhirMs: sekarang, jalan: false, berubah: true });
}

/** Waktu ronde tanpa jeda sejak mulaiPada. */
export function waktuRonde(k: KeadaanRuang, sekarang: number): number {
  if (k.waktu.mulaiPada === null) return 0;
  const akhir = k.status === "jeda" && k.waktu.jedaSejak !== null ? k.waktu.jedaSejak : sekarang;
  return Math.max(0, akhir - k.waktu.mulaiPada - k.waktu.jedaMs);
}

function terlambat(k: KeadaanRuang, sekarang: number): boolean {
  if (k.status === "selesai" || k.status === "pembahasan") return true;
  if (k.status !== "main" && k.status !== "jeda") return false;
  return waktuRonde(k, sekarang) > k.ruang.pengaturan.batasTerlambatMenit * 60_000;
}

/** Tiga saran nama yang belum dipakai dan, bila masih cukup, tidak sama dengan saran sebelumnya (P-22). */
export function pilihSaran(k: KeadaanRuang, sebelumnya: readonly string[], acak: () => number): string[] {
  const dipakai = new Set<string>();
  for (const p of k.pemain.values()) if (p.nama !== null) dipakai.add(p.nama);
  let calon = NAMA_SAMARAN.filter((n) => !dipakai.has(n) && !sebelumnya.includes(n));
  if (calon.length < 3) calon = NAMA_SAMARAN.filter((n) => !dipakai.has(n));
  const hasil: string[] = [];
  while (hasil.length < 3 && calon.length > 0) {
    const i = Math.min(calon.length - 1, Math.floor(acak() * calon.length));
    hasil.push(calon[i]);
    calon = calon.filter((_, j) => j !== i);
  }
  return hasil;
}

/** Warna tas yang paling sedikit dipakai pemain berkeidentitas; seri mengikuti URUTAN_WARNA_TAS. */
export function warnaTasBaru(k: KeadaanRuang): WarnaTas {
  const hitung = new Map<WarnaTas, number>(URUTAN_WARNA_TAS.map((w) => [w, 0]));
  for (const p of k.pemain.values()) if (berkeidentitas(p) && p.warnaTas) hitung.set(p.warnaTas, (hitung.get(p.warnaTas) ?? 0) + 1);
  let terpilih: WarnaTas = URUTAN_WARNA_TAS[0];
  for (const w of URUTAN_WARNA_TAS) if ((hitung.get(w) ?? 0) < (hitung.get(terpilih) ?? 0)) terpilih = w;
  return terpilih;
}

function ikat(k: KeadaanRuang, o: Keluaran, sid: string, p: PemainRuang): void {
  k.batasHalo.delete(sid);
  k.sambungan.set(sid, p.id);
  k.sambunganPemain.set(p.id, sid);
  o.ikat.push({ sambunganId: sid, pemainId: p.id });
}

function tolakSambungan(k: KeadaanRuang, o: Keluaran, sid: string, kode: KodeGalat | null, kodeTutup: number, alasan: string): Keluaran {
  if (kode) kirimKe(o, sid, galat(kode));
  o.tutup.push({ sambunganId: sid, kode: kodeTutup, alasan });
  k.sambungan.delete(sid);
  k.batasHalo.delete(sid);
  return o;
}

/** Pemain tanpa identitas yang terputus lebih dari 5 menit dilepas, sehingga tempatnya kembali (P-24). */
function bersihkanTanpaIdentitas(k: KeadaanRuang, o: Keluaran, sekarang: number): void {
  for (const p of [...k.pemain.values()]) {
    if (p.nama === null && !p.terhubung && p.terputusSejak !== null && sekarang - p.terputusSejak > WAKTU.lepasTanpaIdentitasMs) {
      k.pemain.delete(p.id);
      k.gerak.delete(p.id);
      o.simpan.push({ jenis: "hapus_pemain", id: p.id });
    }
  }
}

function sambutan(k: KeadaanRuang, o: Keluaran, sid: string, p: PemainRuang, token: string, sekarang: number): void {
  kirimKe(o, sid, {
    v: 1,
    t: "selamat_datang",
    pemainId: p.id,
    token,
    status: k.status,
    pengaturan: k.ruang.pengaturan,
    waktuServer: sekarang,
    versiPeta: k.peta.versi,
    saranNama: p.nama === null ? [...p.saran] : [],
    avatarTersedia: [...AVATAR_TERSEDIA],
  });
  kirimKe(o, sid, pesanStatus(k));
  for (const q of urutPemain(k)) if (berkeidentitas(q)) kirimKe(o, sid, pesanPemainBaru(q));
}

// ---------------------------------------------------------------------------------------------
// Peristiwa

/** Sambungan baru: `halo` harus datang dalam 10 detik; batas ini ikut menentukan alarm (P-15, P-40). */
export function sambunganMasuk(k: KeadaanRuang, sid: string, sekarang: number): void {
  k.sambungan.set(sid, null);
  k.batasHalo.set(sid, sekarang + BATAS.haloMs);
}

/** `halo` dari pemain: sambung ulang dengan token, atau pemain baru (P-19 sampai P-21, P-26, P-27). */
export function terimaHalo(
  k: KeadaanRuang,
  sid: string,
  pesan: Extract<PesanPemain, { t: "halo" }>,
  sekarang: number,
  acak: () => number,
  calon: CalonPemain,
  hashTokenMasuk: string | null,
): Keluaran {
  const o = keluaranKosong();
  if (!k.sambungan.has(sid)) k.sambungan.set(sid, null);
  if (k.sambungan.get(sid)) return o; // halo kedua diabaikan
  bersihkanTanpaIdentitas(k, o, sekarang);

  if (hashTokenMasuk !== null && pesan.token) {
    const lama = [...k.pemain.values()].find((p) => p.hashToken === hashTokenMasuk);
    if (lama) {
      if (lama.dikeluarkan) return tolakSambungan(k, o, sid, "DIKELUARKAN", KODE_TUTUP.dikeluarkan, "dikeluarkan");
      if (k.status === "ditutup") return tolakSambungan(k, o, sid, "RUANG_TIDAK_ADA", KODE_TUTUP.ditutup, "ruang ditutup");
      const sidLama = k.sambunganPemain.get(lama.id);
      if (sidLama !== undefined && sidLama !== sid) {
        o.tutup.push({ sambunganId: sidLama, kode: KODE_TUTUP.diganti, alasan: "diganti" });
        k.sambungan.delete(sidLama);
      }
      ikat(k, o, sid, lama);
      lama.terhubung = true;
      lama.terputusSejak = null;
      simpanPemain(o, lama);
      sambutan(k, o, sid, lama, pesan.token, sekarang);
      o.kelas.push(pesanLobi(k));
      return o;
    }
  }

  if (k.status === "ditutup") return tolakSambungan(k, o, sid, "RUANG_TIDAK_ADA", KODE_TUTUP.ditutup, "ruang ditutup");
  if (k.terkunci) return tolakSambungan(k, o, sid, "RUANG_TERKUNCI", KODE_TUTUP.ditolak, "terkunci");
  const jumlah = [...k.pemain.values()].filter((p) => !p.dikeluarkan).length;
  if (jumlah >= k.ruang.pengaturan.batasPemain) return tolakSambungan(k, o, sid, "RUANG_PENUH", KODE_TUTUP.ditolak, "penuh");
  if (terlambat(k, sekarang)) return tolakSambungan(k, o, sid, "TERLAMBAT", KODE_TUTUP.ditolak, "terlambat");

  let nomorAbsen: number | null = null;
  if (k.ruang.pengaturan.modeNomorAbsen) {
    if (pesan.nomorAbsen === undefined) return tolakSambungan(k, o, sid, null, KODE_TUTUP.pelanggaran, "nomor absen wajib");
    if ([...k.pemain.values()].some((p) => !p.dikeluarkan && p.nomorAbsen === pesan.nomorAbsen)) {
      kirimKe(o, sid, galat("NOMOR_ABSEN_DIPAKAI"));
      k.batasHalo.set(sid, sekarang + 2 * 60_000); // waktu untuk mengetik ulang nomor absen
      return o; // sambungan tetap terbuka; klien boleh mengirim halo lagi
    }
    nomorAbsen = pesan.nomorAbsen;
  }

  const p: PemainRuang = {
    id: calon.pemainId,
    hashToken: calon.hashToken,
    urutan: k.urutanBerikut++,
    nama: null,
    avatar: null,
    warnaTas: null,
    nomorAbsen,
    saran: pilihSaran(k, [], acak),
    terhubung: true,
    terputusSejak: null,
    posisi: null,
    dikeluarkan: false,
    gabungPada: sekarang,
  };
  k.pemain.set(p.id, p);
  if (k.status === "hitung_mundur" || k.status === "main" || k.status === "jeda") siapkanGerak(k, p, sekarang);
  ikat(k, o, sid, p);
  simpanPemain(o, p);
  sambutan(k, o, sid, p, calon.token, sekarang);
  return o;
}

/** Pesan pemain selain `halo` (P-17, P-22, P-23, P-41, P-42). */
export function terimaPemain(k: KeadaanRuang, sid: string, pesan: PesanPemain, sekarang: number, acak: () => number): Keluaran {
  const o = keluaranKosong();
  const pid = k.sambungan.get(sid);
  const p = pid ? k.pemain.get(pid) : undefined;
  if (!p) return tolakSambungan(k, o, sid, null, KODE_TUTUP.tanpaHalo, "perlu halo");
  switch (pesan.t) {
    case "minta_nama": {
      if (p.nama !== null) return o;
      p.saran = pilihSaran(k, p.saran, acak);
      simpanPemain(o, p);
      kirimKe(o, sid, { v: 1, t: "saran_nama", saranNama: [...p.saran] });
      return o;
    }
    case "pilih_identitas": {
      if (p.nama !== null) return o;
      const dipakai = [...k.pemain.values()].some((q) => q.id !== p.id && q.nama === pesan.nama);
      if (!p.saran.includes(pesan.nama) || dipakai) {
        kirimKe(o, sid, galat("NAMA_DIPAKAI"));
        p.saran = pilihSaran(k, p.saran, acak);
        simpanPemain(o, p);
        kirimKe(o, sid, { v: 1, t: "saran_nama", saranNama: [...p.saran] });
        return o;
      }
      p.nama = pesan.nama;
      p.avatar = pesan.avatar;
      p.warnaTas = warnaTasBaru(k);
      p.saran = [];
      simpanPemain(o, p);
      o.kiriman.push(barisPeserta(k, p, null));
      kirimSemua(k, o, pesanPemainBaru(p));
      o.kelas.push(pesanLobi(k));
      return o;
    }
    case "gerak": {
      if (p.nama === null || k.status !== "main" || !p.posisi) return o;
      let g = k.gerak.get(p.id);
      if (!g) {
        g = { seqTerakhir: -1, gerakTerakhirMs: sekarang, jalan: false, berubah: false };
        k.gerak.set(p.id, g);
      }
      const hasil = periksaGerak({
        posisi: p.posisi,
        laporan: { x: pesan.x, y: pesan.y, arah: pesan.arah, seq: pesan.seq },
        seqTerakhir: g.seqTerakhir,
        dtMs: sekarang - g.gerakTerakhirMs,
        lari: false,
        status: k.status,
        dialogTerbuka: false,
        peta: k.peta,
      });
      if (hasil.diterima) {
        p.posisi = { x: hasil.x, y: hasil.y, arah: hasil.arah };
        g.seqTerakhir = hasil.seq;
        g.gerakTerakhirMs = sekarang;
        g.jalan = pesan.jalan;
        g.berubah = true;
        return o;
      }
      const isi = koreksi(hasil);
      if (isi) {
        kirimKe(o, sid, { v: 1, t: "koreksi", ...isi });
        o.koreksi++;
      }
      return o;
    }
    case "ping":
      kirimKe(o, sid, { v: 1, t: "pong", tKlien: pesan.tKlien, waktuServer: sekarang });
      return o;
    default:
      return o; // halo kedua, periksa, kunci_1, kunci_2, tutup_dialog, pakai_skill, ambil_kotak (JS-08, JS-09)
  }
}

/** Sambungan putus (P-28). Pemain lain tidak menerima pemain_pergi. */
export function sambunganPutus(k: KeadaanRuang, sid: string, sekarang: number): Keluaran {
  const o = keluaranKosong();
  if (!k.sambungan.has(sid)) return o;
  const pid = k.sambungan.get(sid);
  k.sambungan.delete(sid);
  k.batasHalo.delete(sid);
  if (pid && k.sambunganPemain.get(pid) === sid) {
    k.sambunganPemain.delete(pid);
    const p = k.pemain.get(pid);
    if (p) {
      p.terhubung = false;
      p.terputusSejak = sekarang;
      simpanPemain(o, p);
      o.kelas.push(pesanLobi(k));
    }
  }
  if (k.sambungan.size === 0) {
    k.sambunganTerakhirPutus = sekarang;
    simpanMeta(o, "sambunganTerakhirPutus", sekarang);
  }
  return o;
}

function akhiriRonde(k: KeadaanRuang, o: Keluaran, sekarang: number): void {
  k.status = "selesai";
  k.waktu.jedaSejak = null;
  k.waktu.selesaiPada = sekarang;
  o.putaran = "henti";
  const peserta = urutPemain(k).filter(berkeidentitas);
  const peringkat = hitungPeringkat(peserta.map((p) => ({ id: p.id, skor: 0, waktuSkorMs: 0, langkah1Benar: 0, urutanGabung: p.urutan })));
  for (const r of peringkat) {
    const p = k.pemain.get(r.id);
    if (p) o.kiriman.push(barisPeserta(k, p, r.peringkat));
  }
  ubahStatus(k, o);
  o.kirimSekarang = true;
}

function tutupRuang(k: KeadaanRuang, o: Keluaran, sekarang: number): void {
  k.status = "ditutup";
  k.ditutupPada = sekarang;
  k.waktu.jedaSejak = null;
  if (k.waktu.selesaiPada === null) k.waktu.selesaiPada = sekarang;
  o.putaran = "henti";
  simpanMeta(o, "ditutupPada", sekarang);
  ubahStatus(k, o);
  for (const sid of [...k.sambungan.keys()]) o.tutup.push({ sambunganId: sid, kode: KODE_TUTUP.ditutup, alasan: "ruang ditutup" });
  k.sambungan.clear();
  k.sambunganPemain.clear();
  k.batasHalo.clear();
  for (const p of k.pemain.values()) p.terhubung = false;
  o.kirimSekarang = true;
}

function keluarkan(k: KeadaanRuang, o: Keluaran, pemainId: string): void {
  const p = k.pemain.get(pemainId);
  if (!p || p.dikeluarkan) return;
  p.dikeluarkan = true;
  p.terhubung = false;
  const sid = k.sambunganPemain.get(pemainId);
  if (sid !== undefined) {
    kirimKe(o, sid, galat("DIKELUARKAN"));
    o.tutup.push({ sambunganId: sid, kode: KODE_TUTUP.dikeluarkan, alasan: "dikeluarkan" });
    k.sambungan.delete(sid);
    k.sambunganPemain.delete(pemainId);
  }
  simpanPemain(o, p);
  if (p.nama !== null) kirimSemua(k, o, { v: 1, t: "pemain_pergi", id: p.id });
  o.kelas.push(pesanLobi(k));
}

/** Pesan layar kelas (P-32 sampai P-39). Di JS-03 datang dari uji dan kait uji lokal. */
export function terimaKelas(k: KeadaanRuang, pesan: PesanKelas, sekarang: number): Keluaran {
  const o = keluaranKosong();
  switch (pesan.t) {
    case "mulai": {
      if (k.status !== "lobi") return o;
      const mulaiPada = sekarang + WAKTU.hitungMundurMs;
      k.status = "hitung_mundur";
      k.waktu = { mulaiPada, berakhirPada: mulaiPada + k.ruang.pengaturan.durasiMenit * 60_000, jedaSejak: null, jedaMs: 0, selesaiPada: null };
      for (const p of k.pemain.values()) if (!p.dikeluarkan) siapkanGerak(k, p, sekarang);
      ubahStatus(k, o);
      return o;
    }
    case "jeda": {
      if (k.status !== "main") return o;
      k.status = "jeda";
      k.waktu.jedaSejak = sekarang;
      o.putaran = "henti";
      ubahStatus(k, o);
      return o;
    }
    case "lanjut": {
      if (k.status !== "jeda" || k.waktu.jedaSejak === null) return o;
      const lama = sekarang - k.waktu.jedaSejak;
      k.waktu.berakhirPada = (k.waktu.berakhirPada ?? sekarang) + lama;
      k.waktu.jedaMs += lama;
      k.waktu.jedaSejak = null;
      k.status = "main";
      for (const g of k.gerak.values()) g.gerakTerakhirMs = sekarang;
      o.putaran = "mulai";
      ubahStatus(k, o);
      return o;
    }
    case "tambah_waktu": {
      if ((k.status !== "main" && k.status !== "jeda") || k.waktu.berakhirPada === null) return o;
      k.waktu.berakhirPada += pesan.detik * 1000;
      ubahStatus(k, o);
      return o;
    }
    case "akhiri":
      if (k.status === "main" || k.status === "jeda") akhiriRonde(k, o, sekarang);
      return o;
    case "kunci_ruang":
      if (k.status !== "ditutup") {
        k.terkunci = pesan.kunci;
        simpanMeta(o, "terkunci", k.terkunci);
      }
      return o;
    case "keluarkan":
      keluarkan(k, o, pesan.pemainId);
      return o;
    case "tutup_ruang":
      if (k.status === "selesai" || k.status === "pembahasan") tutupRuang(k, o, sekarang);
      return o;
    default:
      return o; // halo, kode_masuk_ulang (JS-17), pembahasan (JS-11)
  }
}

/** Putaran 100 ms selama status `main`: `dunia` berisi paling banyak 24 pemain terdekat yang berubah (P-43). */
export function putaran(k: KeadaanRuang, sekarang: number): Keluaran {
  const o = keluaranKosong();
  if (k.status !== "main") {
    o.putaran = "henti";
    return o;
  }
  const aktif = urutPemain(k).filter((p) => berkeidentitas(p) && p.posisi !== null);
  const berubah = aktif.filter((p) => k.gerak.get(p.id)?.berubah);
  if (berubah.length === 0) return o;
  for (const p of aktif) {
    const sid = k.sambunganPemain.get(p.id);
    if (sid === undefined || !p.posisi) continue;
    const dekat: [number, PemainRuang][] = [];
    for (const q of berubah) {
      if (q === p || !q.posisi) continue;
      const dx = q.posisi.x - p.posisi.x;
      const dy = q.posisi.y - p.posisi.y;
      if (Math.abs(dx) <= SETENGAH_KOTAK.x && Math.abs(dy) <= SETENGAH_KOTAK.y) dekat.push([dx * dx + dy * dy, q]);
    }
    if (dekat.length === 0) continue;
    dekat.sort((a, b) => a[0] - b[0] || a[1].urutan - b[1].urutan);
    const isi = dekat.slice(0, BATAS.duniaTerdekat).map(([, q]): [string, number, number, Arah, boolean] => {
      const pos = q.posisi as PosisiPemain;
      return [q.id, pos.x, pos.y, pos.arah, k.gerak.get(q.id)?.jalan ?? false];
    });
    kirimKe(o, sid, { v: 1, t: "dunia", w: sekarang, p: isi, n: aktif.length });
  }
  for (const q of berubah) {
    const g = k.gerak.get(q.id);
    if (g) g.berubah = false;
  }
  return o;
}

/** Alarm: hitung mundur selesai, waktu habis, tutup otomatis, dan hapus penyimpanan (P-32 sampai P-36). */
export function alarm(k: KeadaanRuang, sekarang: number, antreanKosong: boolean): Keluaran {
  const o = keluaranKosong();
  for (const [sid, batas] of [...k.batasHalo]) {
    if (batas > sekarang) continue;
    k.batasHalo.delete(sid);
    if (k.sambungan.get(sid) !== null) continue;
    k.sambungan.delete(sid);
    o.tutup.push({ sambunganId: sid, kode: KODE_TUTUP.tanpaHalo, alasan: "perlu halo" });
    if (k.sambungan.size === 0) {
      k.sambunganTerakhirPutus = sekarang;
      simpanMeta(o, "sambunganTerakhirPutus", sekarang);
    }
  }
  if (k.status === "hitung_mundur" && k.waktu.mulaiPada !== null && sekarang >= k.waktu.mulaiPada) {
    k.status = "main";
    for (const p of k.pemain.values()) if (!p.dikeluarkan) siapkanGerak(k, p, sekarang);
    o.putaran = "mulai";
    ubahStatus(k, o);
  }
  if (k.status === "main" && k.waktu.berakhirPada !== null && sekarang >= k.waktu.berakhirPada) akhiriRonde(k, o, sekarang);
  if (k.status !== "ditutup") {
    const kosongLama =
      k.sambungan.size === 0 && k.sambunganTerakhirPutus !== null && sekarang >= k.sambunganTerakhirPutus + WAKTU.tutupTanpaSambunganMs;
    if (sekarang >= k.ruang.dibuatPada + WAKTU.tutupSejakDibuatMs || kosongLama) tutupRuang(k, o, sekarang);
  } else if (k.ditutupPada !== null && sekarang >= k.ditutupPada + WAKTU.hapusSesudahTutupMs && antreanKosong) {
    o.hapusSemua = true;
  }
  return o;
}

/** Tenggat terdekat untuk satu-satunya alarm Durable Object (P-40); null bila tidak ada. */
export function tenggatBerikut(k: KeadaanRuang, antreanKosong: boolean): number | null {
  const t: number[] = [...k.batasHalo.values()];
  if (k.status === "hitung_mundur" && k.waktu.mulaiPada !== null) t.push(k.waktu.mulaiPada);
  if (k.status === "main" && k.waktu.berakhirPada !== null) t.push(k.waktu.berakhirPada);
  if (k.status !== "ditutup") {
    t.push(k.ruang.dibuatPada + WAKTU.tutupSejakDibuatMs);
    if (k.sambungan.size === 0 && k.sambunganTerakhirPutus !== null) t.push(k.sambunganTerakhirPutus + WAKTU.tutupTanpaSambunganMs);
  } else if (k.ditutupPada !== null && antreanKosong) {
    t.push(k.ditutupPada + WAKTU.hapusSesudahTutupMs);
  }
  return t.length > 0 ? Math.min(...t) : null;
}
