// Pembuat kode QR untuk lobi layar kelas (spesifikasi JS-16b, P-6; KT-07: tanpa dependensi). Mode byte (UTF-8), koreksi
// galat M, versi 1 sampai 10, dan pilihan mask menurut penalti ISO/IEC 18004 seperti implementasi rujukan Nayuki
// (qrcodegen, MIT). Hanya dimuat layar kelas.

export interface HasilQR {
  versi: number;
  mask: number;
  ukuran: number;
  /** modul[baris][kolom]: true berarti gelap. */
  modul: boolean[][];
}

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) {
  EXP[i] = x;
  LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
const kali = (a: number, b: number) => (a !== 0 && b !== 0 ? EXP[LOG[a] + LOG[b]] : 0);

/** Sisa Reed–Solomon (kode koreksi galat) sepanjang n untuk satu blok data. */
function sisaRS(data: readonly number[], n: number): number[] {
  let g = [1];
  for (let i = 0; i < n; i++) {
    const h = new Array<number>(g.length + 1).fill(0);
    g.forEach((c, j) => {
      h[j] ^= c;
      h[j + 1] ^= kali(c, EXP[i]);
    });
    g = h;
  }
  const r = new Array<number>(n).fill(0);
  for (const d of data) {
    const f = d ^ (r.shift() as number);
    r.push(0);
    for (let i = 0; i < n; i++) r[i] ^= kali(g[i + 1], f);
  }
  return r;
}

/** Koreksi M: [kode galat per blok, [[jumlah blok, kode data per blok], …]] untuk versi 1–10. */
const BLOK_M: readonly (readonly [number, readonly (readonly [number, number])[]])[] = [
  [0, []],
  [10, [[1, 16]]],
  [16, [[1, 28]]],
  [26, [[1, 44]]],
  [18, [[2, 32]]],
  [24, [[2, 43]]],
  [16, [[4, 27]]],
  [18, [[4, 31]]],
  [22, [[2, 38], [2, 39]]],
  [22, [[3, 36], [2, 37]]],
  [26, [[4, 43], [1, 44]]],
];
const PENJAJAR: readonly (readonly number[])[] = [[], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
export const VERSI_MAKS = 10;
const kapasitas = (v: number) => BLOK_M[v][1].reduce((s, [n, k]) => s + n * k, 0);

const RUMUS_MASK: readonly ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

/**
 * Membuat kode QR untuk teks. `paksa` hanya untuk uji: versi atau mask tertentu.
 * Melempar galat bila teks lebih panjang dari kapasitas versi 10 (213 byte).
 */
export function buatQR(teks: string, paksa: { versi?: number; mask?: number } = {}): HasilQR {
  const byte = [...new TextEncoder().encode(teks)];
  let v = paksa.versi ?? 1;
  while (v <= VERSI_MAKS && 4 + (v < 10 ? 8 : 16) + 8 * byte.length > kapasitas(v) * 8) v++;
  if (v > VERSI_MAKS) throw new Error("Teks terlalu panjang untuk kode QR versi 10");

  // Bit data: mode byte, panjang, isi, terminator, pengisi.
  const bit: number[] = [];
  const tulis = (nilai: number, n: number) => {
    for (let i = n - 1; i >= 0; i--) bit.push((nilai >>> i) & 1);
  };
  tulis(4, 4);
  tulis(byte.length, v < 10 ? 8 : 16);
  for (const b of byte) tulis(b, 8);
  const cap = kapasitas(v) * 8;
  tulis(0, Math.min(4, cap - bit.length));
  while (bit.length % 8 !== 0) bit.push(0);
  for (let p = 0xec; bit.length < cap; p ^= 0xec ^ 0x11) tulis(p, 8);
  const data: number[] = [];
  for (let i = 0; i < bit.length; i += 8) data.push(bit.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));

  // Blok, kode galat, dan penyisipan berselang.
  const [ec, grup] = BLOK_M[v];
  const blok: { d: number[]; e: number[] }[] = [];
  let pos = 0;
  for (const [n, k] of grup) {
    for (let i = 0; i < n; i++) {
      const d = data.slice(pos, pos + k);
      pos += k;
      blok.push({ d, e: sisaRS(d, ec) });
    }
  }
  const akhir: number[] = [];
  const maks = Math.max(...blok.map((b) => b.d.length));
  for (let i = 0; i < maks; i++) for (const b of blok) if (i < b.d.length) akhir.push(b.d[i]);
  for (let i = 0; i < ec; i++) for (const b of blok) akhir.push(b.e[i]);

  // Pola fungsi.
  const n = 17 + 4 * v;
  const m = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const fungsi = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const atur = (x: number, y: number, gelap: boolean) => {
    m[y][x] = gelap;
    fungsi[y][x] = true;
  };
  for (let i = 0; i < n; i++) {
    atur(6, i, i % 2 === 0);
    atur(i, 6, i % 2 === 0);
  }
  const pencari = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < n && y >= 0 && y < n) atur(x, y, d !== 2 && d !== 4);
      }
    }
  };
  pencari(3, 3);
  pencari(n - 4, 3);
  pencari(3, n - 4);
  const pj = PENJAJAR[v];
  const ujung = pj[pj.length - 1];
  for (const a of pj) {
    for (const b of pj) {
      if ((a === 6 && b === 6) || (a === 6 && b === ujung) || (a === ujung && b === 6)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) atur(a + dx, b + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
  const format = (mask: number) => {
    const d = (0 << 3) | mask; // koreksi M = 00
    let r = d;
    for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const b = ((d << 10) | r) ^ 0x5412;
    const g = (i: number) => ((b >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) atur(8, i, g(i));
    atur(8, 7, g(6));
    atur(8, 8, g(7));
    atur(7, 8, g(8));
    for (let i = 9; i < 15; i++) atur(14 - i, 8, g(i));
    for (let i = 0; i < 8; i++) atur(n - 1 - i, 8, g(i));
    for (let i = 8; i < 15; i++) atur(8, n - 15 + i, g(i));
    atur(8, n - 8, true);
  };
  format(0);
  if (v >= 7) {
    let r = v;
    for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
    const b = (v << 12) | r;
    for (let i = 0; i < 18; i++) {
      const g = ((b >>> i) & 1) === 1;
      const a = n - 11 + (i % 3);
      const c = Math.floor(i / 3);
      atur(a, c, g);
      atur(c, a, g);
    }
  }

  // Penempatan data berzigzag dari kanan bawah, melewati kolom 6.
  let i = 0;
  for (let kanan = n - 1; kanan >= 1; kanan -= 2) {
    if (kanan === 6) kanan = 5;
    for (let t = 0; t < n; t++) {
      for (let j = 0; j < 2; j++) {
        const x = kanan - j;
        const naik = ((kanan + 1) & 2) === 0;
        const y = naik ? n - 1 - t : t;
        if (!fungsi[y][x] && i < akhir.length * 8) {
          m[y][x] = ((akhir[i >>> 3] >>> (7 - (i & 7))) & 1) === 1;
          i++;
        }
      }
    }
  }

  const pakaiMask = (k: number) => {
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!fungsi[y][x] && RUMUS_MASK[k](x, y)) m[y][x] = !m[y][x];
  };
  let mask = paksa.mask ?? -1;
  if (mask < 0) {
    let terkecil = Infinity;
    for (let k = 0; k < 8; k++) {
      pakaiMask(k);
      format(k);
      const p = penalti(m);
      if (p < terkecil) {
        terkecil = p;
        mask = k;
      }
      pakaiMask(k);
    }
  }
  pakaiMask(mask);
  format(mask);
  return { versi: v, mask, ukuran: n, modul: m };
}

/** Skor penalti ISO/IEC 18004 (N1 = 3, N2 = 3, N3 = 40, N4 = 10), mengikuti getPenaltyScore Nayuki. */
export function penalti(m: readonly (readonly boolean[])[]): number {
  const n = m.length;
  let hasil = 0;
  const tambahRiwayat = (panjang: number, riwayat: number[]) => {
    if (riwayat[0] === 0) panjang += n;
    riwayat.pop();
    riwayat.unshift(panjang);
  };
  const hitungPola = (r: readonly number[]) => {
    const k = r[1];
    const inti = k > 0 && r[2] === k && r[3] === k * 3 && r[4] === k && r[5] === k;
    return (inti && r[0] >= k * 4 && r[6] >= k ? 1 : 0) + (inti && r[6] >= k * 4 && r[0] >= k ? 1 : 0);
  };
  const akhiri = (warna: boolean, panjang: number, riwayat: number[]) => {
    if (warna) {
      tambahRiwayat(panjang, riwayat);
      panjang = 0;
    }
    tambahRiwayat(panjang + n, riwayat);
    return hitungPola(riwayat);
  };
  for (const arah of [0, 1]) {
    for (let a = 0; a < n; a++) {
      let warna = false;
      let panjang = 0;
      const riwayat = [0, 0, 0, 0, 0, 0, 0];
      for (let b = 0; b < n; b++) {
        const sel = arah === 0 ? m[a][b] : m[b][a];
        if (sel === warna) {
          panjang++;
          if (panjang === 5) hasil += 3;
          else if (panjang > 5) hasil++;
        } else {
          tambahRiwayat(panjang, riwayat);
          if (!warna) hasil += hitungPola(riwayat) * 40;
          warna = sel;
          panjang = 1;
        }
      }
      hasil += akhiri(warna, panjang, riwayat) * 40;
    }
  }
  for (let y = 0; y < n - 1; y++) {
    for (let x = 0; x < n - 1; x++) {
      const c = m[y][x];
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) hasil += 3;
    }
  }
  const gelap = m.reduce((s, baris) => s + baris.filter(Boolean).length, 0);
  const total = n * n;
  hasil += (Math.ceil(Math.abs(gelap * 20 - total * 10) / total) - 1) * 10;
  return hasil;
}

/**
 * Jalur SVG satu kotak per modul gelap dengan perintah mutlak (M, H, V, Z), dan zona tenang `tepi` modul. Perintah relatif
 * dengan angka negatif tidak dipakai, karena Tailwind galeri membaca seluruh repositori dan akan menganggapnya kelas.
 */
export function jalurSvg(qr: HasilQR, tepi = 4): { sisi: number; d: string } {
  let d = "";
  for (let y = 0; y < qr.ukuran; y++) {
    for (let x = 0; x < qr.ukuran; x++) {
      if (!qr.modul[y][x]) continue;
      const kiri = x + tepi;
      const atas = y + tepi;
      d += `M${kiri} ${atas}H${kiri + 1}V${atas + 1}H${kiri}Z`;
    }
  }
  return { sisi: qr.ukuran + 2 * tepi, d };
}
