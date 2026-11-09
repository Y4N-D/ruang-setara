// Langit sehari di layar pemain (spesifikasi JS-07, P-9, P-10, P-30 sampai P-32; PRD 8.1; Architecture 9).
// Kemajuan dihitung dari sisa waktu, sehingga sama di setiap perangkat, juga sesudah sambung ulang, dan tambah
// waktu memundurkan langit.
import { duaMenitTerakhir, formatJam, HARI, masa as masaDari, menitCerita } from "../../inti/aturan";
import type { Masa, StatusRuang } from "../../inti/tipe";

export interface WaktuRuangKlien {
  status: StatusRuang;
  mulaiPada: number | null;
  berakhirPada: number | null;
  jedaSejak: number | null;
}

export interface Langit {
  /** Sisa waktu ronde dalam milidetik, ≥ 0. */
  sisaMs: number;
  /** 0 sampai 1. */
  kemajuan: number;
  masa: Masa;
  /** Jam cerita "HH.MM". */
  jam: string;
  duaMenit: boolean;
  /** Masa berikutnya dan sisa waktu sampai berganti, bila ronde berjalan maju (P-10). */
  masaBerikut: Masa | null;
  msSampaiBerikut: number | null;
}

/** Sisa waktu "MM:SS", dibulatkan ke atas per detik (P-31). */
export function formatSisa(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Langit untuk status ruang dan jam server (P-30). Lobi dan hitung mundur memakai pagi (P-9). Di `main`,
 * sisa = berakhirPada − jam server; di `jeda`, sisa = berakhirPada − jedaSejak. Kemajuan = 1 − sisa / durasi.
 */
export function hitungLangit(w: WaktuRuangKlien, durasiMenit: number, jamServer: number): Langit {
  const durasi = Math.max(1, durasiMenit) * 60_000;
  let sisa = durasi;
  if ((w.status === "main" || w.status === "jeda") && w.berakhirPada !== null) {
    const acuan = w.status === "jeda" && w.jedaSejak !== null ? w.jedaSejak : jamServer;
    sisa = Math.max(0, w.berakhirPada - acuan);
  } else if (w.status === "selesai" || w.status === "pembahasan" || w.status === "ditutup") {
    sisa = 0;
  }
  const berjalan = w.status === "main" || w.status === "jeda";
  const kemajuan = berjalan ? Math.min(1, Math.max(0, 1 - sisa / durasi)) : w.status === "lobi" || w.status === "hitung_mundur" ? 0 : 1;
  const m = masaDari(kemajuan);
  let masaBerikut: Masa | null = null;
  let msSampaiBerikut: number | null = null;
  if (w.status === "main") {
    // kemajuan = ambang saat sisa = (1 − ambang) × durasi.
    if (m === "pagi") {
      masaBerikut = "siang";
      msSampaiBerikut = Math.max(0, sisa - (1 - HARI.ambangSiang) * durasi);
    } else if (m === "siang") {
      masaBerikut = "sore";
      msSampaiBerikut = Math.max(0, sisa - (1 - HARI.ambangSore) * durasi);
    }
  }
  return {
    sisaMs: sisa,
    kemajuan,
    masa: m,
    jam: formatJam(menitCerita(kemajuan)),
    duaMenit: berjalan && duaMenitTerakhir(Math.ceil(sisa / 1000)),
    masaBerikut,
    msSampaiBerikut,
  };
}
