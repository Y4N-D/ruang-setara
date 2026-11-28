// Suara layar kelas (spesifikasi JS-14, P-29 sampai P-31): bawaan nyala 60%, berkas WAV diimpor langsung (P-35 JS-10),
// konteks audio dibuat pada ketukan atau tombol pertama di halaman layar kelas.
// Musik latar M-01 (spesifikasi JS-21, P-3 sampai P-6 dan P-13 sampai P-15): berulang, lanjut dari posisi terakhir,
// masuk dan keluar pelan 80 ms, dan hanya diunduh bila pilihan musik nyala.
import musikKelas from "../../assets/sfx/musik_kelas.wav";
import sfxAkhir from "../../assets/sfx/sfx_akhir.wav";
import sfxHitung from "../../assets/sfx/sfx_hitung.wav";
import sfxPeringatan from "../../assets/sfx/sfx_peringatan.wav";
import { posisiMusik } from "./tampilan-kelas";

export type NamaSuaraKelas = "hitung" | "peringatan" | "akhir";
export type NamaBerkasKelas = NamaSuaraKelas | "musik";
export const KUNCI_SUARA_KELAS = "jejak:suara-kelas";
export const VOLUME_KELAS = 0.6;
/** P-31: dua menit terakhir. */
export const DUA_MENIT_MS = 120_000;
/** JS-21 (P-6): kunci pilihan musik di sessionStorage tab layar kelas. */
export const KUNCI_MUSIK_KELAS = "jejak:musik-kelas";
/** JS-21 (P-4): panjang M-01 bila hasil urai tidak menyebut durasinya. */
export const PANJANG_MUSIK_DETIK = 38.4;
/** JS-21 (P-5): lama masuk dan keluar pelan. */
export const PELAN_DETIK = 0.08;
/** JS-21 (P-16): berbunyi, diam, atau tertahan menunggu izin peramban (P-14). */
export type KeadaanMusik = "berbunyi" | "diam" | "tertahan";
const BERKAS: Record<NamaBerkasKelas, string> = { hitung: sfxHitung, peringatan: sfxPeringatan, akhir: sfxAkhir, musik: musikKelas };
const EFEK: readonly NamaSuaraKelas[] = ["hitung", "peringatan", "akhir"];

interface PenguatKelas {
  gain: {
    value: number;
    setValueAtTime?(nilai: number, waktu: number): unknown;
    linearRampToValueAtTime?(nilai: number, waktu: number): unknown;
    cancelScheduledValues?(waktu: number): unknown;
  };
  connect(s: unknown): unknown;
}

interface SumberKelas {
  buffer: unknown;
  loop?: boolean;
  connect(s: unknown): unknown;
  start(kapan?: number, posisi?: number): void;
  stop?(kapan?: number): void;
}

interface KonteksKelas {
  readonly state: string;
  readonly destination: unknown;
  readonly currentTime?: number;
  createGain(): PenguatKelas;
  createBufferSource(): SumberKelas;
  decodeAudioData(d: ArrayBuffer): Promise<unknown>;
  resume(): Promise<void>;
  addEventListener?(jenis: string, f: () => void): void;
}

export interface DepsSuaraKelas {
  buatKonteks(): KonteksKelas | undefined;
  muat(nama: NamaBerkasKelas): Promise<ArrayBuffer>;
}

const depsPeramban: DepsSuaraKelas = {
  buatKonteks: () => {
    const K = (globalThis as { AudioContext?: new () => KonteksKelas }).AudioContext;
    return K ? new K() : undefined;
  },
  muat: (nama) => fetch(BERKAS[nama]).then((r) => r.arrayBuffer()),
};

function bacaPilihan(kunci: string): boolean {
  try {
    return sessionStorage.getItem(kunci) !== "mati";
  } catch {
    return true;
  }
}

function simpanPilihan(kunci: string, nyala: boolean): void {
  try {
    sessionStorage.setItem(kunci, nyala ? "nyala" : "mati");
  } catch {
    // Diabaikan: pilihan tetap berlaku di memori.
  }
}

/** P-29: bawaan nyala; pilihan tersimpan di sessionStorage tab ini. */
export const bacaSuaraKelas = (): boolean => bacaPilihan(KUNCI_SUARA_KELAS);
export const simpanSuaraKelas = (nyala: boolean): void => simpanPilihan(KUNCI_SUARA_KELAS, nyala);
/** JS-21 (P-6): musik bawaan nyala; nilai lain atau sessionStorage yang tidak tersedia dianggap nyala. */
export const bacaMusikKelas = (): boolean => bacaPilihan(KUNCI_MUSIK_KELAS);
export const simpanMusikKelas = (nyala: boolean): void => simpanPilihan(KUNCI_MUSIK_KELAS, nyala);

export interface SuaraKelas {
  /** Dipanggil pada ketukan atau tombol: membuat konteks dan mengunduh berkas sekali, atau melanjutkannya. */
  sentuh(): void;
  /** Memutar bunyi; false bila konteks belum ada atau masih ditahan peramban (P-30). */
  putar(nama: NamaSuaraKelas): boolean;
  /** JS-21 (P-6, P-13): pilihan musik guru; berkas musik diunduh sekali bila pilihan nyala dan konteks sudah ada. */
  pilihMusik(nyala: boolean): void;
  /** JS-21 (P-1 sampai P-5): `ingin` adalah syarat P-1 selain konteks dan berkas. Mengembalikan keadaan musik. */
  musik(ingin: boolean): KeadaanMusik;
  /** JS-21: dipanggil setiap keadaan musik berubah, juga karena konteks dilanjutkan atau berkas selesai diurai. */
  pantau(f: (keadaan: KeadaanMusik) => void): () => void;
}

export function buatSuaraKelas(deps: Partial<DepsSuaraKelas> = {}): SuaraKelas {
  const d: DepsSuaraKelas = { ...depsPeramban, ...deps };
  let konteks: KonteksKelas | undefined;
  let keluar: PenguatKelas | undefined;
  let tanpaAudio = false;
  const berkas = new Map<NamaSuaraKelas, unknown>();
  // JS-21: keadaan musik.
  let pilihanMusik = false;
  let ingin = false;
  let musikTerurai: unknown;
  let muatMusik: "belum" | "memuat" | "siap" | "gagal" = "belum";
  let gagalMusik = 0;
  let berjalan: { sumber: SumberKelas; penguat: PenguatKelas; mulai: number; dari: number } | undefined;
  let posisi = 0;
  let keadaan: KeadaanMusik = "diam";
  const pemantau = new Set<(k: KeadaanMusik) => void>();

  const waktu = () => konteks?.currentTime ?? 0;
  const panjang = () => {
    const durasi = (musikTerurai as { duration?: unknown } | undefined)?.duration;
    return typeof durasi === "number" && durasi > 0 ? durasi : PANJANG_MUSIK_DETIK;
  };

  /** P-13 dan P-15: sekali per tab; sesudah gagal dicoba sekali lagi pada ketukan berikutnya. */
  function mulaiMuatMusik(): void {
    if (!konteks || !pilihanMusik || muatMusik === "memuat" || muatMusik === "siap" || gagalMusik >= 2) return;
    const k = konteks;
    muatMusik = "memuat";
    d.muat("musik")
      .then((data) => k.decodeAudioData(data))
      .then((b) => {
        musikTerurai = b;
        muatMusik = "siap";
        terapkan();
      })
      .catch(() => {
        muatMusik = "gagal";
        gagalMusik++;
        terapkan();
      });
  }

  /** P-5: turun ke 0 dalam 80 ms, lalu sumber dihentikan; posisi disimpan untuk dilanjutkan (P-4). */
  function hentikanMusik(): void {
    if (!berjalan) return;
    const { sumber, penguat, mulai, dari } = berjalan;
    berjalan = undefined;
    const t = waktu();
    posisi = posisiMusik(dari, t - mulai, panjang());
    const g = penguat.gain;
    if (g.cancelScheduledValues && g.setValueAtTime && g.linearRampToValueAtTime) {
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(0, t + PELAN_DETIK);
      sumber.stop?.(t + PELAN_DETIK);
    } else {
      g.value = 0;
      sumber.stop?.();
    }
  }

  /** P-3 sampai P-5: sumber berulang dengan penguat sendiri yang naik dari 0 ke 1 dalam 80 ms. */
  function mulaiMusik(): void {
    if (!konteks || !keluar || berjalan || musikTerurai === undefined) return;
    const t = waktu();
    const penguat = konteks.createGain();
    penguat.connect(keluar);
    const sumber = konteks.createBufferSource();
    sumber.buffer = musikTerurai;
    sumber.loop = true;
    sumber.connect(penguat);
    const g = penguat.gain;
    if (g.setValueAtTime && g.linearRampToValueAtTime) {
      g.setValueAtTime(0, t);
      g.linearRampToValueAtTime(1, t + PELAN_DETIK);
    } else g.value = 1;
    const dari = posisiMusik(posisi, 0, panjang());
    sumber.start(0, dari);
    berjalan = { sumber, penguat, mulai: t, dari };
  }

  function hitungKeadaan(): KeadaanMusik {
    if (!ingin) return "diam";
    if (berjalan) return "berbunyi";
    if (!konteks) return tanpaAudio ? "diam" : "tertahan";
    return konteks.state === "suspended" ? "tertahan" : "diam";
  }

  function terapkan(): void {
    if (ingin && konteks?.state === "running" && muatMusik === "siap") mulaiMusik();
    else hentikanMusik();
    const baru = hitungKeadaan();
    if (baru === keadaan) return;
    keadaan = baru;
    for (const f of pemantau) f(baru);
  }

  return {
    sentuh() {
      if (konteks) {
        if (konteks.state === "suspended") konteks.resume().then(terapkan, () => undefined);
        mulaiMuatMusik();
        return;
      }
      if (tanpaAudio) return;
      try {
        konteks = d.buatKonteks();
      } catch {
        konteks = undefined;
      }
      if (!konteks) {
        tanpaAudio = true;
        terapkan();
        return;
      }
      const k = konteks;
      keluar = k.createGain();
      keluar.gain.value = VOLUME_KELAS;
      keluar.connect(k.destination);
      for (const nama of EFEK) {
        d.muat(nama)
          .then((data) => k.decodeAudioData(data))
          .then((b) => {
            berkas.set(nama, b);
          })
          .catch(() => undefined);
      }
      k.addEventListener?.("statechange", terapkan);
      mulaiMuatMusik();
      terapkan();
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
    pilihMusik(nyala) {
      pilihanMusik = nyala;
      if (nyala) mulaiMuatMusik();
    },
    musik(i) {
      ingin = i;
      terapkan();
      return keadaan;
    },
    pantau(f) {
      pemantau.add(f);
      return () => {
        pemantau.delete(f);
      };
    },
  };
}

/** P-31: benar bila sisa waktu turun melewati 120 detik selama `main` (bukan saat layar baru dimuat). */
export function lewatDuaMenit(sebelum: number | null, kini: number): boolean {
  return sebelum !== null && sebelum > DUA_MENIT_MS && kini <= DUA_MENIT_MS && kini > 0;
}

/** JS-25 (P-6): seperti `lewatDuaMenit`, dengan ambang 60 detik untuk ronde 5 menit dan 120 detik untuk ronde lain. */
export function lewatPeringatan(sebelum: number | null, kini: number, durasiMenit: number): boolean {
  const ambang = durasiMenit === 5 ? 60_000 : DUA_MENIT_MS;
  return sebelum !== null && sebelum > ambang && kini <= ambang && kini > 0;
}
