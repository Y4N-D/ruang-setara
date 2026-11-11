// Aturan kejadian di ruang (spesifikasi JS-08, P-2, P-8 sampai P-12, P-26 sampai P-33, P-55, P-56, P-62;
// Architecture 8.3 dan 8.4). Murni: tanpa API Workers, jam, atau acak langsung. Inti ruang (inti-ruang.ts) memakai
// fungsi-fungsi ini untuk penempatan, keterlihatan, urutan dan id pilihan per pemain, kunci, poin, skor, dan isi pesan.
import { acakBerbenih, benih, kocok } from "../../../../app/jejak-setara/inti/acak";
import { jarak, JANGKAUAN_PERIKSA_PX, POIN, tempatkanKejadian, terlihatDiLayar } from "../../../../app/jejak-setara/inti/aturan";
import { pusatUbin } from "../../../../app/jejak-setara/inti/peta";
import { PROTOKOL_VERSI, type PesanServerPemain } from "../../../../app/jejak-setara/inti/protokol";
import type { IsiKejadian, KejadianRuang, Posisi, Tingkat, TitikPeta, ZonaId } from "../../../../app/jejak-setara/inti/tipe";

/** Paket inti 16 yang dimuat ruang coba (P-1): sama dengan idPaket("Paket inti 16") di semai.mjs. */
export const PAKET_RUANG_COBA = "9880c4d5-8294-51c9-971a-e95531a2e039";
/** Jarak paling singkat antardua `pribadi` karena peringkat berubah oleh pemain lain (P-56). */
export const JEDA_PRIBADI_MS = 2000;
/** Abjad id pilihan per pemain: 8 karakter a-z0-9 (P-29). */
const ABJAD_ID = "abcdefghijklmnopqrstuvwxyz0123456789";

type PesanServer<T extends PesanServerPemain["t"]> = Extract<PesanServerPemain, { t: T }>;

/** Isi satu kejadian yang dibawa permintaan /inisialisasi (P-3), sebelum titiknya ditentukan. */
export interface KejadianMasuk {
  kode: string;
  versiId: string;
  isi: IsiKejadian;
  rujukan: string[];
}

export type StatusJawaban = "langkah1" | "langkah2" | "selesai";

/** Satu jawaban pemain untuk satu kejadian (P-27, P-29, P-31, P-32; tabel `jawaban` SQLite ruang, P-60). */
export interface JawabanRuang {
  pemainId: string;
  kode: string;
  /** Indeks pilihan di isi kejadian untuk setiap posisi tampil (P-29). */
  urutan1: number[];
  urutan2: number[];
  /** Id pilihan milik pemain ini untuk setiap posisi tampil (P-29). */
  id1: string[];
  id2: string[];
  status: StatusJawaban;
  langkah1Opsi: string | null; // id asli 1a–1d
  langkah1Benar: boolean | null;
  langkah2Opsi: string | null; // id asli 2a–2c
  tingkat: Tingkat | null;
  poin: number; // Langkah 1 + Langkah 2
  dibukaPada: number;
  langkah1Pada: number | null;
  langkah2Pada: number | null;
}

/** Ruang lebih dari 50 pemain memakai dua titik aktif per kejadian (P-9). */
export function jumlahTitikRuang(batasPemain: number): 1 | 2 {
  return batasPemain > 50 ? 2 : 1;
}

/**
 * Kejadian menurut urutan paket, tanpa kejadian yang zonanya tidak punya cukup titik lagi (P-2): setiap kejadian
 * memakai `jumlahTitik` titik zonanya, dan kejadian yang tidak kebagian dilewati.
 */
export function saringMenurutTitik<T extends { isi: Pick<IsiKejadian, "zona"> }>(
  daftar: readonly T[],
  titikPerZona: Readonly<Partial<Record<ZonaId, readonly unknown[]>>>,
  jumlahTitik: 1 | 2,
): T[] {
  const terpakai = new Map<ZonaId, number>();
  const hasil: T[] = [];
  for (const k of daftar) {
    const zona = k.isi.zona;
    const sudah = terpakai.get(zona) ?? 0;
    if (sudah + jumlahTitik > (titikPerZona[zona]?.length ?? 0)) continue;
    terpakai.set(zona, sudah + jumlahTitik);
    hasil.push(k);
  }
  return hasil;
}

/** Penempatan ruang (P-9): satu atau dua titik per kejadian, berbenih ruang, sama bagi semua pemain. */
export function tempatkanRuang(
  benihRuang: number,
  titikPerZona: Readonly<Partial<Record<ZonaId, readonly TitikPeta[]>>>,
  masuk: readonly KejadianMasuk[],
  jumlahTitik: 1 | 2,
): KejadianRuang[] {
  const letak = tempatkanKejadian(
    benihRuang,
    titikPerZona,
    masuk.map((k) => ({ kode: k.kode, zona: k.isi.zona })),
    jumlahTitik,
  );
  return masuk.map((k, i) => {
    const l = letak[i];
    return { kode: k.kode, versiId: k.versiId, isi: k.isi, rujukan: [...k.rujukan], titik: l.titikKedua ? [l.titik, l.titikKedua] : [l.titik] };
  });
}

/** Pusat titik dalam piksel logis (16x + 8, 16y + 8). */
export function pusatTitik(t: Pick<TitikPeta, "x" | "y">): Posisi {
  return { x: pusatUbin(t.x), y: pusatUbin(t.y) };
}

/** Titik aktif kejadian `k` yang paling dekat dengan posisi dan paling jauh 32 piksel; null bila tidak ada (P-26). */
export function titikDalamJangkauan(posisi: Posisi, k: Pick<KejadianRuang, "titik">): TitikPeta | null {
  let terbaik: TitikPeta | null = null;
  let jarakTerbaik = Infinity;
  for (const t of k.titik) {
    const d = jarak(posisi, pusatTitik(t));
    if (d <= JANGKAUAN_PERIKSA_PX && d < jarakTerbaik) {
      terbaik = t;
      jarakTerbaik = d;
    }
  }
  return terbaik;
}

/** Titik aktif yang masuk kotak pandangan pemain dan belum tercatat terlihat olehnya (P-10). */
export function titikBaruTerlihat(
  posisi: Posisi,
  kejadian: readonly KejadianRuang[],
  sudah: ReadonlySet<string>,
  lebarPetaPx: number,
  tinggiPetaPx: number,
): { k: KejadianRuang; titik: TitikPeta }[] {
  const hasil: { k: KejadianRuang; titik: TitikPeta }[] = [];
  for (const k of kejadian) {
    for (const t of k.titik) {
      if (sudah.has(t.id)) continue;
      if (terlihatDiLayar(posisi, pusatTitik(t), lebarPetaPx, tinggiPetaPx)) hasil.push({ k, titik: t });
    }
  }
  return hasil;
}

/**
 * Urutan dan id pilihan satu pemain untuk satu kejadian (P-29): urutan dikocok dengan benih (benihRuang, pemainId,
 * kode, "1" atau "2"), dan tujuh id 8 karakter diambil dari pembangkit berbenih (…, "id"); id kembar diambil ulang.
 */
export function urutanPilihan(benihRuang: number, pemainId: string, kode: string): Pick<JawabanRuang, "urutan1" | "urutan2" | "id1" | "id2"> {
  const urutan1 = kocok([0, 1, 2, 3], benih(benihRuang, pemainId, kode, "1"));
  const urutan2 = kocok([0, 1, 2], benih(benihRuang, pemainId, kode, "2"));
  const acak = acakBerbenih(benih(benihRuang, pemainId, kode, "id"));
  const id: string[] = [];
  while (id.length < 7) {
    let s = "";
    for (let i = 0; i < 8; i++) s += ABJAD_ID[Math.floor(acak() * ABJAD_ID.length)];
    if (!id.includes(s)) id.push(s);
  }
  return { urutan1, urutan2, id1: id.slice(0, 4), id2: id.slice(4) };
}

/** Jawaban baru saat kejadian pertama kali dibuka pemain (P-27). */
export function jawabanBaru(benihRuang: number, pemainId: string, kode: string, sekarang: number): JawabanRuang {
  return {
    pemainId,
    kode,
    ...urutanPilihan(benihRuang, pemainId, kode),
    status: "langkah1",
    langkah1Opsi: null,
    langkah1Benar: null,
    langkah2Opsi: null,
    tingkat: null,
    poin: 0,
    dibukaPada: sekarang,
    langkah1Pada: null,
    langkah2Pada: null,
  };
}

/** Pilihan isi kejadian untuk id pilihan milik pemain; null bila id tidak dikenal (P-31, P-32). */
export function pilihanDariId<T>(opsi: readonly T[], urutan: readonly number[], idPemain: readonly string[], opsiId: string): T | null {
  const posisi = idPemain.indexOf(opsiId);
  return posisi < 0 ? null : (opsi[urutan[posisi]] ?? null);
}

/** Mengunci Langkah 1 (P-31). Mengembalikan jawaban baru, atau null bila id pilihan tidak sah. */
export function kunciLangkah1(k: KejadianRuang, j: JawabanRuang, opsiId: string, sekarang: number): JawabanRuang | null {
  if (j.status !== "langkah1") return null;
  const pilihan = pilihanDariId(k.isi.langkah1.opsi, j.urutan1, j.id1, opsiId);
  if (!pilihan) return null;
  return {
    ...j,
    status: "langkah2",
    langkah1Opsi: pilihan.id,
    langkah1Benar: pilihan.benar,
    poin: pilihan.benar ? POIN.langkah1Benar : 0,
    langkah1Pada: sekarang,
  };
}

/** Mengunci Langkah 2 (P-32). Mengembalikan jawaban baru, atau null bila id pilihan tidak sah. */
export function kunciLangkah2(k: KejadianRuang, j: JawabanRuang, opsiId: string, sekarang: number): JawabanRuang | null {
  if (j.status !== "langkah2") return null;
  const pilihan = pilihanDariId(k.isi.langkah2.opsi, j.urutan2, j.id2, opsiId);
  if (!pilihan) return null;
  return {
    ...j,
    status: "selesai",
    langkah2Opsi: pilihan.id,
    tingkat: pilihan.tingkat,
    poin: (j.langkah1Benar ? POIN.langkah1Benar : 0) + POIN[pilihan.tingkat],
    langkah2Pada: sekarang,
  };
}

// ---------------------------------------------------------------------------------------------
// Isi pesan (P-11, P-28, P-31, P-32)

export function pesanTerlihat(k: KejadianRuang, t: TitikPeta): PesanServer<"kejadian_terlihat"> {
  return { v: PROTOKOL_VERSI, t: "kejadian_terlihat", kejadianId: k.kode, x: t.x, y: t.y, setTokoh: [...k.isi.setTokoh] };
}

export function pesanTerbuka(k: KejadianRuang, j: JawabanRuang): PesanServer<"kejadian_terbuka"> {
  return {
    v: PROTOKOL_VERSI,
    t: "kejadian_terbuka",
    kejadianId: k.kode,
    judul: k.isi.judul,
    situasi: k.isi.situasi,
    setTokoh: [...k.isi.setTokoh],
    pertanyaan1: k.isi.langkah1.pertanyaan,
    opsi1: j.urutan1.map((i, p) => ({ id: j.id1[p], teks: k.isi.langkah1.opsi[i].teks })),
    langkah: j.status === "langkah1" ? 1 : 2,
  };
}

/** `hasil_1` dari jawaban yang Langkah 1-nya sudah dikunci; juga untuk ulangan saat dibuka lagi (KT-13). */
export function pesanHasil1(k: KejadianRuang, j: JawabanRuang): PesanServer<"hasil_1"> {
  const opsi = k.isi.langkah1.opsi;
  const posisiBenar = j.urutan1.findIndex((i) => opsi[i].benar);
  const dipilih = opsi.find((o) => o.id === j.langkah1Opsi) ?? opsi[j.urutan1[0]];
  const benar = j.langkah1Benar === true;
  const pesan: PesanServer<"hasil_1"> = {
    v: PROTOKOL_VERSI,
    t: "hasil_1",
    benar,
    opsiBenar: j.id1[posisiBenar],
    umpanBalik: dipilih.umpanBalik,
    poin: benar ? POIN.langkah1Benar : 0,
    pertanyaan2: k.isi.langkah2.pertanyaan,
    opsi2: j.urutan2.map((i, p) => ({ id: j.id2[p], teks: k.isi.langkah2.opsi[i].teks })),
  };
  if (!benar) pesan.umpanBalikBenar = opsi[j.urutan1[posisiBenar]].umpanBalik;
  return pesan;
}

export function pesanHasil2(k: KejadianRuang, j: JawabanRuang): PesanServer<"hasil_2"> {
  const opsi = k.isi.langkah2.opsi;
  const dipilih = opsi.find((o) => o.id === j.langkah2Opsi) ?? opsi[j.urutan2[0]];
  return {
    v: PROTOKOL_VERSI,
    t: "hasil_2",
    tingkat: dipilih.tingkat,
    poin: POIN[dipilih.tingkat],
    terjadi: dipilih.terjadi,
    opsiTepat: j.urutan2.flatMap((i, p) => (opsi[i].tingkat === "tepat" ? [j.id2[p]] : [])),
    kartu: { hak: k.isi.kartu.hak, kewajiban: k.isi.kartu.kewajiban, rujukan: [...k.rujukan] },
  };
}

// ---------------------------------------------------------------------------------------------
// Skor (P-55)

export interface SkorPemain {
  skor: number;
  /** Waktu ronde tanpa jeda saat skor terakhir bertambah; 0 bila belum pernah bertambah. */
  waktuSkorMs: number;
  langkah1Benar: number;
  /** Jumlah kejadian yang kedua langkahnya sudah dikunci. */
  selesai: number;
}

/**
 * Skor satu pemain dari jawabannya (P-55, P-63). Skor bertambah saat Langkah 1 benar dikunci dan saat Langkah 2
 * bertingkat tepat atau kurang tepat dikunci; `waktuRondePada` mengubah jam server menjadi waktu ronde tanpa jeda.
 */
export function hitungSkor(jawaban: Iterable<JawabanRuang>, waktuRondePada: (jamServer: number) => number): SkorPemain {
  const h: SkorPemain = { skor: 0, waktuSkorMs: 0, langkah1Benar: 0, selesai: 0 };
  for (const j of jawaban) {
    h.skor += j.poin;
    if (j.langkah1Benar && j.langkah1Pada !== null) {
      h.langkah1Benar++;
      h.waktuSkorMs = Math.max(h.waktuSkorMs, waktuRondePada(j.langkah1Pada));
    }
    if (j.status === "selesai") {
      h.selesai++;
      if (j.tingkat !== null && POIN[j.tingkat] > 0 && j.langkah2Pada !== null) h.waktuSkorMs = Math.max(h.waktuSkorMs, waktuRondePada(j.langkah2Pada));
    }
  }
  return h;
}

// ---------------------------------------------------------------------------------------------
// Kiriman ke D1 (P-62)

export interface BarisJawabanD1 {
  id: string; // "{pemainId}:{kode}"
  ruangId: string;
  pesertaId: string;
  kejadianVersiId: string;
  urutanOpsiJson: string; // {"langkah1": [id asli menurut urutan tampil], "langkah2": [...]}
  langkah1Opsi: string | null;
  langkah1Benar: number | null;
  petunjukDipakai: number;
  langkah2Opsi: string | null;
  tingkat: Tingkat | null;
  poin: number;
  dibukaPada: number;
  langkah1Pada: number | null;
  langkah2Pada: number | null;
}

export function barisJawabanD1(ruangId: string, k: KejadianRuang, j: JawabanRuang): BarisJawabanD1 {
  return {
    id: `${j.pemainId}:${j.kode}`,
    ruangId,
    pesertaId: j.pemainId,
    kejadianVersiId: k.versiId,
    urutanOpsiJson: JSON.stringify({
      langkah1: j.urutan1.map((i) => k.isi.langkah1.opsi[i].id),
      langkah2: j.urutan2.map((i) => k.isi.langkah2.opsi[i].id),
    }),
    langkah1Opsi: j.langkah1Opsi,
    langkah1Benar: j.langkah1Benar === null ? null : j.langkah1Benar ? 1 : 0,
    petunjukDipakai: 0,
    langkah2Opsi: j.langkah2Opsi,
    tingkat: j.tingkat,
    poin: j.poin,
    dibukaPada: j.dibukaPada,
    langkah1Pada: j.langkah1Pada,
    langkah2Pada: j.langkah2Pada,
  };
}
