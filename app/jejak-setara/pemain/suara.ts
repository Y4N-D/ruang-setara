// Efek suara layar pemain (spesifikasi JS-14, P-20 sampai P-23; Design System 12), mengikuti pola Sehari Setara
// (`app/sehari-setara/ui/sound.ts`). Berkas WAV baru diunduh saat suara dinyalakan, jadi HP yang suaranya mati
// tidak mengunduh apa pun (P-21). Pembuat konteks dan pemuat berkas bisa diganti tiruan di uji.
import { SUARA, type NamaSuara } from "../assets/manifest";

export type { NamaSuara };
export const VOLUME_SUARA = 0.6;
/** P-22: jarak paling pendek antarbunyi yang sama. */
export const JEDA_SUARA_MS: Partial<Record<NamaSuara, number>> = { kejadian: 1000, kotak: 300 };
/** P-22: bunyi teks setiap 2 huruf atau angka, laju 1,2, seperti Sehari Setara. */
export const TEKS_SETIAP = 2;
export const LAJU_TEKS = 1.2;
/** P-21: sembilan bunyi HP; jingle akhir hanya di layar kelas. */
export const SUARA_HP: readonly NamaSuara[] = (Object.keys(SUARA) as NamaSuara[]).filter((n) => n !== "akhir");

interface ParamMirip {
  value: number;
}
interface NodeMirip {
  connect(sasaran: unknown): unknown;
}
interface GainMirip extends NodeMirip {
  readonly gain: ParamMirip;
}
interface SumberMirip extends NodeMirip {
  buffer: unknown;
  readonly playbackRate: ParamMirip;
  start(): void;
}
export interface KonteksMirip {
  readonly state: string;
  readonly destination: unknown;
  createGain(): GainMirip;
  createBufferSource(): SumberMirip;
  decodeAudioData(data: ArrayBuffer): Promise<unknown>;
  resume(): Promise<void>;
}

export interface DepsSuara {
  buatKonteks(): KonteksMirip | undefined;
  muat(nama: NamaSuara): Promise<ArrayBuffer>;
  kini(): number;
}

export interface PemutarSuara {
  /** Dipanggil pada ketukan yang menyalakan suara: membuat konteks dan mengunduh berkas sekali, atau melanjutkan konteks. */
  nyalakan(): void;
  matikan(): void;
  nyala(): boolean;
  /** Memutar satu bunyi bila suara nyala dan berkasnya siap; selain itu tidak melakukan apa pun (tidak diantre). */
  putar(nama: NamaSuara, laju?: number): void;
}

const depsPeramban: DepsSuara = {
  buatKonteks: () => {
    const K = (globalThis as { AudioContext?: new () => KonteksMirip }).AudioContext;
    return K ? new K() : undefined;
  },
  muat: (nama) => fetch(SUARA[nama]).then((r) => r.arrayBuffer()),
  kini: () => performance.now(),
};

export function buatPemutarSuara(deps: Partial<DepsSuara> = {}): PemutarSuara {
  const d: DepsSuara = { ...depsPeramban, ...deps };
  let konteks: KonteksMirip | undefined;
  let keluar: GainMirip | undefined;
  let aktif = false;
  let gagal = false;
  const berkas = new Map<NamaSuara, unknown>();
  const terakhir = new Map<NamaSuara, number>();
  return {
    nyalakan() {
      aktif = true;
      if (gagal) return;
      if (konteks) {
        if (konteks.state === "suspended") konteks.resume().catch(() => undefined);
        return;
      }
      try {
        konteks = d.buatKonteks();
      } catch {
        konteks = undefined;
      }
      if (!konteks) {
        gagal = true;
        return;
      }
      const k = konteks;
      keluar = k.createGain();
      keluar.gain.value = VOLUME_SUARA;
      keluar.connect(k.destination);
      for (const nama of SUARA_HP) {
        d.muat(nama)
          .then((data) => k.decodeAudioData(data))
          .then((buffer) => {
            berkas.set(nama, buffer);
          })
          .catch(() => undefined);
      }
      if (k.state === "suspended") k.resume().catch(() => undefined);
    },
    matikan() {
      aktif = false;
    },
    nyala: () => aktif && !gagal,
    putar(nama, laju = 1) {
      if (!aktif || !konteks || !keluar) return;
      const buffer = berkas.get(nama);
      if (!buffer) return;
      const t = d.kini();
      const jeda = JEDA_SUARA_MS[nama] ?? 0;
      if (jeda > 0 && t - (terakhir.get(nama) ?? Number.NEGATIVE_INFINITY) < jeda) return;
      terakhir.set(nama, t);
      const s = konteks.createBufferSource();
      s.buffer = buffer;
      s.playbackRate.value = laju;
      s.connect(keluar);
      s.start();
    },
  };
}

const DIHITUNG = /^[\p{L}\p{N}]$/u;

/** P-22: benar bila di antara huruf yang baru muncul (indeks dari … ke) ada huruf atau angka ke-0, ke-2, ke-4, dan seterusnya. */
export function bunyiTeksJatuh(teks: string, dari: number, ke: number, setiap: number = TEKS_SETIAP): boolean {
  const huruf = Array.from(teks);
  let urutan = 0;
  for (let i = 0; i < Math.min(ke, huruf.length); i++) {
    if (!DIHITUNG.test(huruf[i])) continue;
    if (i >= dari && urutan % setiap === 0) return true;
    urutan++;
  }
  return false;
}
