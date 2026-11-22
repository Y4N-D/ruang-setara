// Suara layar kelas (spesifikasi JS-14, P-29 sampai P-31): bawaan nyala 60%, berkas WAV diimpor langsung (P-35 JS-10),
// konteks audio dibuat pada ketukan atau tombol pertama di halaman layar kelas.
import sfxAkhir from "../../assets/sfx/sfx_akhir.wav";
import sfxHitung from "../../assets/sfx/sfx_hitung.wav";
import sfxPeringatan from "../../assets/sfx/sfx_peringatan.wav";

export type NamaSuaraKelas = "hitung" | "peringatan" | "akhir";
export const KUNCI_SUARA_KELAS = "jejak:suara-kelas";
export const VOLUME_KELAS = 0.6;
/** P-31: dua menit terakhir. */
export const DUA_MENIT_MS = 120_000;
const BERKAS: Record<NamaSuaraKelas, string> = { hitung: sfxHitung, peringatan: sfxPeringatan, akhir: sfxAkhir };

interface KonteksKelas {
  readonly state: string;
  readonly destination: unknown;
  createGain(): { gain: { value: number }; connect(s: unknown): unknown };
  createBufferSource(): { buffer: unknown; connect(s: unknown): unknown; start(): void };
  decodeAudioData(d: ArrayBuffer): Promise<unknown>;
  resume(): Promise<void>;
}

export interface DepsSuaraKelas {
  buatKonteks(): KonteksKelas | undefined;
  muat(nama: NamaSuaraKelas): Promise<ArrayBuffer>;
}

const depsPeramban: DepsSuaraKelas = {
  buatKonteks: () => {
    const K = (globalThis as { AudioContext?: new () => KonteksKelas }).AudioContext;
    return K ? new K() : undefined;
  },
  muat: (nama) => fetch(BERKAS[nama]).then((r) => r.arrayBuffer()),
};

/** P-29: bawaan nyala; pilihan tersimpan di sessionStorage tab ini. */
export function bacaSuaraKelas(): boolean {
  try {
    return sessionStorage.getItem(KUNCI_SUARA_KELAS) !== "mati";
  } catch {
    return true;
  }
}

export function simpanSuaraKelas(nyala: boolean): void {
  try {
    sessionStorage.setItem(KUNCI_SUARA_KELAS, nyala ? "nyala" : "mati");
  } catch {
    // Diabaikan: pilihan tetap berlaku di memori.
  }
}

export interface SuaraKelas {
  /** Dipanggil pada ketukan atau tombol: membuat konteks dan mengunduh ketiga berkas sekali, atau melanjutkannya. */
  sentuh(): void;
  /** Memutar bunyi; false bila konteks belum ada atau masih ditahan peramban (P-30). */
  putar(nama: NamaSuaraKelas): boolean;
}

export function buatSuaraKelas(deps: Partial<DepsSuaraKelas> = {}): SuaraKelas {
  const d: DepsSuaraKelas = { ...depsPeramban, ...deps };
  let konteks: KonteksKelas | undefined;
  let keluar: { gain: { value: number }; connect(s: unknown): unknown } | undefined;
  const berkas = new Map<NamaSuaraKelas, unknown>();
  return {
    sentuh() {
      if (konteks) {
        if (konteks.state === "suspended") konteks.resume().catch(() => undefined);
        return;
      }
      try {
        konteks = d.buatKonteks();
      } catch {
        konteks = undefined;
      }
      if (!konteks) return;
      const k = konteks;
      keluar = k.createGain();
      keluar.gain.value = VOLUME_KELAS;
      keluar.connect(k.destination);
      for (const nama of Object.keys(BERKAS) as NamaSuaraKelas[]) {
        d.muat(nama)
          .then((data) => k.decodeAudioData(data))
          .then((b) => {
            berkas.set(nama, b);
          })
          .catch(() => undefined);
      }
    },
    putar(nama) {
      if (!konteks || konteks.state === "suspended" || !keluar) return false;
      const b = berkas.get(nama);
      if (!b) return true;
      const s = konteks.createBufferSource();
      s.buffer = b;
      s.connect(keluar);
      s.start();
      return true;
    },
  };
}

/** P-31: benar bila sisa waktu turun melewati 120 detik selama `main` (bukan saat layar baru dimuat). */
export function lewatDuaMenit(sebelum: number | null, kini: number): boolean {
  return sebelum !== null && sebelum > DUA_MENIT_MS && kini <= DUA_MENIT_MS && kini > 0;
}
