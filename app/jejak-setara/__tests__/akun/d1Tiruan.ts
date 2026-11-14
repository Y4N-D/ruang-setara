// D1 tiruan di atas SQLite bawaan Node (node:sqlite) untuk uji rute akun (spesifikasi JS-04, rencana uji
// api-akun.test.ts). Tabel dari migrasi D1. Parameter bernomor `?1`, `?2`, … diikat menurut urutannya seperti D1, dan
// batch berjalan dalam satu transaksi: bila satu pernyataan gagal, semuanya dibatalkan.
import { readFileSync } from "node:fs";

type ModulSqlite = typeof import("node:sqlite");
type Basis = InstanceType<ModulSqlite["DatabaseSync"]>;

export const sqlite = process.getBuiltinModule("node:sqlite") as ModulSqlite | undefined;

type Nilai = string | number | null;

function periksaNilai(nilai: unknown[]): Nilai[] {
  return nilai.map((n) => {
    // D1 menolak undefined; kode akun selalu mengikat angka 0 dan 1, bukan boolean.
    if (n === null || typeof n === "string" || typeof n === "number") return n;
    throw new Error(`nilai ikatan tidak didukung: ${typeof n}`);
  });
}

const POLA_BACA = /^\s*(select|with)\b/i;

interface HasilTiruan {
  results: Record<string, unknown>[];
  success: true;
  meta: { changes: number };
}

class PernyataanTiruan {
  constructor(
    private readonly induk: D1Tiruan,
    readonly sql: string,
    readonly nilai: Nilai[] = [],
  ) {}

  bind(...nilai: unknown[]): PernyataanTiruan {
    return new PernyataanTiruan(this.induk, this.sql, periksaNilai(nilai));
  }

  async first<T>(kolom?: string): Promise<T | null> {
    const baris = this.induk.eksekusi(this).results[0];
    if (!baris) return null;
    return (kolom ? baris[kolom] : { ...baris }) as T;
  }

  async all<T>(): Promise<{ results: T[]; success: true; meta: { changes: number } }> {
    const hasil = this.induk.eksekusi(this);
    return { ...hasil, results: hasil.results.map((b) => ({ ...b })) as T[] };
  }

  async run(): Promise<HasilTiruan> {
    return this.induk.eksekusi(this);
  }
}

export class D1Tiruan {
  readonly basis: Basis;
  /** Jumlah pernyataan yang dijalankan, untuk memeriksa rute yang tidak boleh menyentuh D1. */
  jumlahKueri = 0;
  /** Dipanggil tepat sebelum batch berikutnya dijalankan, untuk meniru permintaan lain yang datang bersamaan. */
  sebelumBatch: (() => void) | null = null;

  constructor() {
    if (!sqlite) throw new Error("node:sqlite tidak tersedia");
    this.basis = new sqlite.DatabaseSync(":memory:");
    this.basis.exec("PRAGMA foreign_keys = ON;");
    this.basis.exec(readFileSync("server/jejak-setara/migrations/0001_awal.sql", "utf8"));
  }

  prepare(sql: string): PernyataanTiruan {
    return new PernyataanTiruan(this, sql);
  }

  eksekusi(p: PernyataanTiruan): HasilTiruan {
    this.jumlahKueri++;
    const s = this.basis.prepare(p.sql);
    if (POLA_BACA.test(p.sql)) {
      return { results: s.all(...p.nilai) as Record<string, unknown>[], success: true, meta: { changes: 0 } };
    }
    const r = s.run(...p.nilai);
    return { results: [], success: true, meta: { changes: Number(r.changes) } };
  }

  async batch(daftar: PernyataanTiruan[]): Promise<HasilTiruan[]> {
    const kait = this.sebelumBatch;
    this.sebelumBatch = null;
    kait?.();
    this.basis.exec("BEGIN");
    try {
      const hasil = daftar.map((p) => this.eksekusi(p));
      this.basis.exec("COMMIT");
      return hasil;
    } catch (galat) {
      this.basis.exec("ROLLBACK");
      throw galat;
    }
  }

  /** Kueri langsung untuk pemeriksaan uji. */
  baris<T = Record<string, unknown>>(sql: string, ...nilai: Nilai[]): T[] {
    return this.basis.prepare(sql).all(...nilai) as T[];
  }

  jalankan(sql: string, ...nilai: Nilai[]): void {
    this.basis.prepare(sql).run(...nilai);
  }
}
