// Masukan gerak (spesifikasi JS-07, P-12 sampai P-14; Design System 3.3, 10, dan 13): keyboard W A S D atau
// panah, dan joystick sentuh di separuh kiri dunia. Hasilnya arah dx, dy masing-masing −1 sampai 1; panjang
// lebih dari 1 dinormalkan langkahGerak (JS-02), sehingga diagonal tidak lebih cepat.

/** Kode tombol `KeyboardEvent.code` dan arahnya. */
export const TOMBOL_ARAH: Readonly<Record<string, readonly [number, number]>> = {
  KeyW: [0, -1],
  ArrowUp: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyS: [0, 1],
  ArrowDown: [0, 1],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

/** Tombol panah tidak boleh menggulir halaman (P-12). */
export const TOMBOL_GULIR: ReadonlySet<string> = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

/** Arah dari tombol yang sedang ditekan; dua tombol berlawanan saling meniadakan. */
export function arahKeyboard(ditekan: ReadonlySet<string>): { dx: number; dy: number } {
  let dx = 0;
  let dy = 0;
  for (const kode of ditekan) {
    const a = TOMBOL_ARAH[kode];
    if (!a) continue;
    dx += a[0];
    dy += a[1];
  }
  return { dx: Math.max(-1, Math.min(1, dx)), dy: Math.max(-1, Math.min(1, dy)) };
}

/** Joystick sentuh (P-13): lingkaran radius 48 px, kenop bergaris tengah 24 px, zona diam 8 px dari pusat. */
export const JOYSTICK = { radius: 48, kenop: 24, zonaDiam: 8 } as const;

/**
 * Arah joystick dari pusat ke jari, dalam px CSS. Dalam 8 px dari pusat, pemain diam; di luar itu, arah satuan
 * (kecepatan penuh, 360°). Kenop mengikuti jari, tetapi tetap di dalam lingkaran.
 */
export function arahJoystick(pusat: { x: number; y: number }, jari: { x: number; y: number }): { dx: number; dy: number; kenopX: number; kenopY: number } {
  const vx = jari.x - pusat.x;
  const vy = jari.y - pusat.y;
  const panjang = Math.hypot(vx, vy);
  const skala = panjang > JOYSTICK.radius ? JOYSTICK.radius / panjang : 1;
  const kenopX = vx * skala;
  const kenopY = vy * skala;
  if (!(panjang > JOYSTICK.zonaDiam)) return { dx: 0, dy: 0, kenopX, kenopY };
  return { dx: vx / panjang, dy: vy / panjang, kenopX, kenopY };
}

/** Perangkat sentuh: `pointer: coarse` atau `navigator.maxTouchPoints > 0` (P-13). */
export function perangkatSentuh(w: { matchMedia?: (q: string) => { matches: boolean }; navigator?: { maxTouchPoints?: number } }): boolean {
  const kasar = typeof w.matchMedia === "function" && w.matchMedia("(pointer: coarse)").matches;
  return kasar || (w.navigator?.maxTouchPoints ?? 0) > 0;
}

export interface KeadaanJoystick {
  pointerId: number;
  pusatX: number; // px CSS, relatif ke kotak dunia
  pusatY: number;
  kenopX: number; // relatif ke pusat
  kenopY: number;
}

/**
 * Keadaan masukan satu layar dunia. Keyboard: tombol yang ditekan; dilepas semua saat jendela kehilangan fokus
 * atau tab tersembunyi. Joystick: hanya satu jari yang diikuti; hilang saat jari diangkat atau sentuhan batal.
 */
export class Masukan {
  private readonly ditekan = new Set<string>();
  joystick: KeadaanJoystick | null = null;
  private joyArah = { dx: 0, dy: 0 };

  tekan(kode: string): boolean {
    if (!TOMBOL_ARAH[kode]) return false;
    this.ditekan.add(kode);
    return true;
  }

  lepas(kode: string): void {
    this.ditekan.delete(kode);
  }

  lepasSemua(): void {
    this.ditekan.clear();
    this.joystick = null;
    this.joyArah = { dx: 0, dy: 0 };
  }

  /** Sentuhan pertama di separuh kiri dunia memulai joystick; sentuhan lain diabaikan. */
  mulaiJoystick(pointerId: number, x: number, y: number, lebarDunia: number): boolean {
    if (this.joystick !== null || x > lebarDunia / 2) return false;
    this.joystick = { pointerId, pusatX: x, pusatY: y, kenopX: 0, kenopY: 0 };
    this.joyArah = { dx: 0, dy: 0 };
    return true;
  }

  gerakJoystick(pointerId: number, x: number, y: number): boolean {
    const j = this.joystick;
    if (!j || j.pointerId !== pointerId) return false;
    const a = arahJoystick({ x: j.pusatX, y: j.pusatY }, { x, y });
    j.kenopX = a.kenopX;
    j.kenopY = a.kenopY;
    this.joyArah = { dx: a.dx, dy: a.dy };
    return true;
  }

  akhiriJoystick(pointerId: number): boolean {
    if (!this.joystick || this.joystick.pointerId !== pointerId) return false;
    this.joystick = null;
    this.joyArah = { dx: 0, dy: 0 };
    return true;
  }

  /** Arah gerak saat ini: joystick bila sedang dipakai, selain itu keyboard. */
  arah(): { dx: number; dy: number } {
    if (this.joystick) return { ...this.joyArah };
    return arahKeyboard(this.ditekan);
  }
}
