// Durable Object satu ruang (spesifikasi JS-03, bagian C sampai H; Architecture 7 dan 8.6).
// Pembungkus tipis di sekitar inti-ruang.ts: WebSocket Hibernation API, SQLite, satu alarm,
// pengatur waktu putaran dan kiriman, serta kiriman ke D1. Kelas biasa tanpa `cloudflare:workers`,
// agar Worker tetap bisa diimpor uji Node; komunikasi dari Worker lewat fetch internal.
// JS-08: tabel `kejadian`, `jawaban`, `terlihat`, dan `antrean`, dialog di lampiran sambungan, pemulihan dari
// tabel itu, kait uji lokal `kejadian` dan `pindahkan`, dan kiriman berkunci berversi (P-60 sampai P-63, P-66, P-67).
import { PROTOKOL_VERSI, type PesanServerPemain } from "../../../../app/jejak-setara/inti/protokol";
import { skemaKelas, type PesanKelas } from "../../../../app/jejak-setara/inti/protokol-kelas";
import { skemaKelola, STATUS_BOLEH_TUTUP } from "../../../../app/jejak-setara/inti/ruang";
import { tulisRingkasanRuang } from "../db/ruang";
import {
  ALARM_GESER_MS,
  ALARM_JEDA_MIN_MS,
  ANGGARAN_ALARM,
  BERULANG_KOSONG,
  bacaPemakaian,
  jedaKiriman,
  kirimanHarusBerhenti,
  PEMAKAIAN_KOSONG,
  perkiraanPermintaan,
  periksaBerulang,
  tenggatAman,
  type CatatanBerulang,
  type Pemakaian,
} from "./pengaman";
import type { Arah, KejadianRuang, ModeNama, StatusRuang, Tingkat, TitikPeta, WarnaTas } from "../../../../app/jejak-setara/inti/tipe";
import { TEKS } from "../../../../app/jejak-setara/teks";
import { kirimKeD1 } from "../db/ruang";
import type { Env } from "../env";
import { base64url, jawabGalat, jawabJson, sha256Hex } from "../keamanan";
import {
  alarm,
  buatKeadaan,
  KODE_TUTUP,
  pindahkanPemain,
  pulihkanKeadaan,
  putaran,
  sambunganMasuk,
  sambunganPutus,
  tenggatBerikut,
  terimaHalo,
  terimaKelas,
  terimaPemain,
  titikKejadianRuang,
  type BarisKiriman,
  type DataRuang,
  type KeadaanRuang,
  type Keluaran,
  type PemainRuang,
  type Simpanan,
  type WaktuRuang,
  sambutanKelas,
  ringkasanHasil,
  tutupPaksa,
  gantiNama,
  gantiSemuaNama,
  keluaranKosong,
} from "./inti-ruang";
import { ambilAntrean, antrekan, hapusTerkirim, jumlahAntrean, SQL_TABEL_ANTREAN } from "./antrean";
import { jumlahTitikRuang, tempatkanRuang, type JawabanRuang, type KejadianMasuk, type StatusJawaban } from "./kejadian-ruang";
import { PETA_KAMPUNG, TITIK_PER_ZONA } from "./peta-kampung";
import { bacaPesanPemain, catatPelanggaran, sambunganBaru, type KeadaanSambungan } from "./sambungan";

/** Lampiran sambungan layar kelas (JS-10, P-13): asal Worker untuk tautan di lobi. */
interface LampiranKelas {
  kelas: true;
  asal: string;
  dibukaPada: number;
}

/** Batas ukuran satu pesan dari layar kelas. */
const PESAN_KELAS_MAKS = 2048;

interface Lampiran {
  sambunganId: string;
  pemainId: string | null;
  dibukaPada: number;
  /** Kode kejadian yang dialognya terbuka di sambungan ini (JS-08, P-30). */
  dialog?: string | null;
}

type BarisJawabanSql = {
  pemain_id: string;
  kode: string;
  urutan_json: string;
  status: string;
  langkah1_opsi: string | null;
  langkah1_benar: number | null;
  langkah2_opsi: string | null;
  tingkat: string | null;
  poin: number;
  dibuka_pada: number;
  langkah1_pada: number | null;
  langkah2_pada: number | null;
};

type BarisPemainSql = {
  id: string;
  hash_token: string;
  urutan: number;
  nama: string | null;
  avatar: number | null;
  warna_tas: string | null;
  nomor_absen: number | null;
  saran_json: string;
  terhubung: number;
  terputus_sejak: number | null;
  posisi_json: string | null;
  dikeluarkan: number;
  gabung_pada: number;
};

const JEDA_KIRIMAN_MS = 30_000;
const acakKripto = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;

const WAKTU_AWAL: WaktuRuang = { mulaiPada: null, berakhirPada: null, jedaSejak: null, jedaMs: 0, selesaiPada: null };

export class RuangJejak {
  private readonly ctx: DurableObjectState;
  private readonly env: Env;
  private keadaan: KeadaanRuang | null = null;
  private readonly batas = new Map<string, KeadaanSambungan>();
  private readonly soket = new Map<string, WebSocket>();
  private pewaktuPutaran: ReturnType<typeof setInterval> | null = null;
  private pewaktuKiriman: ReturnType<typeof setTimeout> | null = null;
  private kirimanGagal: { percobaan: number; berikutnya: number } | null = null;
  private alarmTerpasang: number | null | undefined = undefined;
  // JS-22 (P-1 sampai P-7, P-15): pengaman biaya dan penghitung pemakaian.
  private mati = false;
  private alarmTadi: number | null = null;
  private berulang: CatatanBerulang = BERULANG_KOSONG;
  private alarmDipakai = 0;
  private kirimanGagalSejak: number | null = null;
  private kirimanBerhenti = false;
  private pemakaian: Pemakaian = { ...PEMAKAIAN_KOSONG };
  private antrean: Promise<unknown> = Promise.resolve();
  private readonly statistik = {
    masuk: 0,
    keluar: 0,
    byteKeluar: 0,
    barisDitulis: 0,
    putaran: 0,
    koreksi: 0,
    pelanggaran: 0,
    duniaLobi: 0,
    koreksiAlasan: {} as Record<string, number>,
    jawabanSelesai: 0,
    pribadi: 0,
    keluarKelas: 0,
    byteKelas: 0,
  };

  constructor(ctx: DurableObjectState, env: Env) {
    this.ctx = ctx;
    this.env = env;
    void ctx.blockConcurrencyWhile(async () => {
      this.siapkanTabel();
      this.pulihkanPengaman();
      this.pulihkan();
      // P-7: alarm yang sudah terpasang dibaca sekali, agar tenggat yang sama tidak ditulis ulang sesudah bangun.
      this.alarmTerpasang = await ctx.storage.getAlarm();
    });
  }

  // -------------------------------------------------------------------------------------------
  // Peristiwa runtime

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (this.env.DARURAT === "1") {
      await this.antre(() => this.berhentiPaksa("DARURAT"));
      return jawabGalat("LAYANAN_BERHENTI", TEKS.api.LAYANAN_BERHENTI, 503);
    }
    if (this.mati) return jawabGalat("RUANG_TIDAK_ADA", TEKS.api.RUANG_TIDAK_ADA, 404);
    if (url.pathname === "/inisialisasi" || url.pathname === "/kelola") this.pemakaian.internal++;
    if (request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      if (url.pathname === "/ws-kelas") return this.antre(() => this.terimaSambunganKelas(request));
      return this.antre(() => this.terimaSambungan(request));
    }
    if (url.pathname === "/inisialisasi" && request.method === "POST") return this.antre(() => this.inisialisasi(request));
    if (url.pathname === "/kelola" && request.method === "GET") return jawabJson(this.keadaanLangsung(), this.keadaan ? 200 : 404);
    if (url.pathname === "/kelola" && request.method === "POST") return this.antre(() => this.aksiKelola(request));
    if (url.pathname === "/statistik") return jawabJson(this.ringkasanStatistik(), 200);
    if (url.pathname === "/putuskan" && request.method === "POST") return this.antre(() => this.putuskanSemua());
    if (url.pathname === "/kejadian") return jawabJson({ kejadian: this.keadaan ? titikKejadianRuang(this.keadaan) : [] }, 200);
    if (url.pathname === "/pindahkan" && request.method === "POST") return this.antre(() => this.pindahkan(request));
    if (url.pathname === "/pengaman" && request.method === "POST") return this.antre(() => this.aturPengaman(request));
    return jawabGalat("BELUM_TERSEDIA", "Fitur ini belum tersedia.", 404);
  }

  async webSocketMessage(ws: WebSocket, pesan: string | ArrayBuffer): Promise<void> {
    if (this.env.DARURAT === "1" || this.mati) {
      if (this.env.DARURAT === "1") await this.antre(() => this.berhentiPaksa("DARURAT"));
      tutupAman(ws, KODE_TUTUP.ditutup, "ruang ditutup");
      return;
    }
    this.pemakaian.pesanMasuk++;
    if (lampiranKelas(ws)) {
      await this.antre(() => this.tanganiPesanKelas(ws, pesan));
      return;
    }
    await this.antre(() => this.tanganiPesan(ws, pesan));
  }

  async webSocketClose(ws: WebSocket, kode: number): Promise<void> {
    if (lampiranKelas(ws)) {
      tutupAman(ws, kode >= 1000 && kode < 5000 && kode !== 1005 && kode !== 1006 && kode !== 1015 ? kode : 1000, "selesai");
      return;
    }
    await this.antre(() => this.tanganiPutus(ws, kode));
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    if (lampiranKelas(ws)) return;
    await this.antre(() => this.tanganiPutus(ws, 1011));
  }

  async alarm(): Promise<void> {
    await this.antre(async () => {
      if (this.mati) return;
      if (this.env.DARURAT === "1") {
        await this.berhentiPaksa("DARURAT");
        return;
      }
      const tadi = this.alarmTerpasang ?? Date.now();
      this.alarmTerpasang = null;
      // P-3: anggaran alarm per ruang.
      this.alarmDipakai++;
      this.pemakaian.alarm++;
      this.tulisMeta("alarmDipakai", this.alarmDipakai);
      if (this.alarmDipakai > ANGGARAN_ALARM) {
        await this.berhentiPaksa("ANGGARAN_ALARM");
        return;
      }
      this.alarmTadi = tadi;
      try {
        if (this.kirimanGagal && Date.now() >= this.kirimanGagal.berikutnya) await this.kirimKiriman();
        const k = this.keadaan;
        if (k) await this.terapkan(alarm(k, Date.now(), this.antreanKosong()));
        else await this.pasangAlarm();
      } finally {
        this.alarmTadi = null;
      }
    });
  }

  // -------------------------------------------------------------------------------------------
  // Antrean: setiap peristiwa diproses satu per satu, termasuk yang menunggu hash token

  private antre<T>(kerja: () => Promise<T> | T): Promise<T> {
    const hasil = this.antrean.then(kerja);
    this.antrean = hasil.catch(() => undefined);
    return hasil;
  }

  // -------------------------------------------------------------------------------------------
  // Penyimpanan

  private get sql(): SqlStorage {
    return this.ctx.storage.sql;
  }

  private siapkanTabel(): void {
    this.sql.exec("CREATE TABLE IF NOT EXISTS meta (kunci TEXT PRIMARY KEY, nilai TEXT NOT NULL)");
    // JS-10 (P-13): nonce tiket layar kelas yang sudah dipakai, agar tiket hanya sekali pakai.
    this.sql.exec("CREATE TABLE IF NOT EXISTS tiket_terpakai (nonce TEXT PRIMARY KEY, kedaluwarsa INTEGER NOT NULL)");
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS pemain (id TEXT PRIMARY KEY, hash_token TEXT NOT NULL UNIQUE, urutan INTEGER NOT NULL, nama TEXT, " +
        "avatar INTEGER, warna_tas TEXT, nomor_absen INTEGER, saran_json TEXT NOT NULL, terhubung INTEGER NOT NULL, terputus_sejak INTEGER, " +
        "posisi_json TEXT, dikeluarkan INTEGER NOT NULL DEFAULT 0, gabung_pada INTEGER NOT NULL)",
    );
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS kiriman (id INTEGER PRIMARY KEY AUTOINCREMENT, jenis TEXT NOT NULL, isi_json TEXT NOT NULL, dibuat_pada INTEGER NOT NULL)",
    );
    // JS-08 (P-60). IF NOT EXISTS, sehingga ruang yang dibuat sebelum JS-08 tetap jalan.
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS kejadian (kode TEXT PRIMARY KEY, urutan INTEGER NOT NULL, versi_id TEXT NOT NULL, isi_json TEXT NOT NULL, " +
        "rujukan_json TEXT NOT NULL, titik_json TEXT NOT NULL)",
    );
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS jawaban (pemain_id TEXT NOT NULL, kode TEXT NOT NULL, urutan_json TEXT NOT NULL, status TEXT NOT NULL, " +
        "langkah1_opsi TEXT, langkah1_benar INTEGER, langkah2_opsi TEXT, tingkat TEXT, poin INTEGER NOT NULL, dibuka_pada INTEGER NOT NULL, " +
        "langkah1_pada INTEGER, langkah2_pada INTEGER, PRIMARY KEY (pemain_id, kode))",
    );
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS terlihat (pemain_id TEXT NOT NULL, titik_id TEXT NOT NULL, kode TEXT NOT NULL, pada INTEGER NOT NULL, " +
        "PRIMARY KEY (pemain_id, titik_id))",
    );
    this.sql.exec(SQL_TABEL_ANTREAN);
    // JS-09 (P-14). IF NOT EXISTS, sehingga ruang yang dibuat sebelum JS-09 tetap jalan.
    this.sql.exec("CREATE TABLE IF NOT EXISTS skill (pemain_id TEXT PRIMARY KEY, isi_json TEXT NOT NULL)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS petunjuk (pemain_id TEXT NOT NULL, kode TEXT NOT NULL, opsi TEXT NOT NULL, PRIMARY KEY (pemain_id, kode))");
  }

  private pulihkan(): void {
    const meta = new Map<string, unknown>();
    for (const r of this.sql.exec<{ kunci: string; nilai: string }>("SELECT kunci, nilai FROM meta").toArray()) meta.set(r.kunci, JSON.parse(r.nilai));
    const ruang = meta.get("ruang") as DataRuang | undefined;
    if (!ruang) return;
    const pemain = this.sql.exec<BarisPemainSql>("SELECT * FROM pemain").toArray().map(barisKePemain);
    const sekarang = Date.now();
    const sambungan: { sambunganId: string; pemainId: string | null; dibukaPada?: number; dialog?: string | null }[] = [];
    for (const ws of this.ctx.getWebSockets("pemain")) {
      const l = ws.deserializeAttachment() as Lampiran | null;
      if (!l) continue;
      this.soket.set(l.sambunganId, ws);
      this.batas.set(l.sambunganId, sambunganBaru(sekarang));
      sambungan.push({ sambunganId: l.sambunganId, pemainId: l.pemainId, dibukaPada: l.dibukaPada, dialog: l.dialog ?? null });
    }
    const kejadian = this.sql
      .exec<{ kode: string; versi_id: string; isi_json: string; rujukan_json: string; titik_json: string }>(
        "SELECT kode, versi_id, isi_json, rujukan_json, titik_json FROM kejadian ORDER BY urutan",
      )
      .toArray()
      .map(
        (r): KejadianRuang => ({
          kode: r.kode,
          versiId: r.versi_id,
          isi: JSON.parse(r.isi_json) as KejadianRuang["isi"],
          rujukan: JSON.parse(r.rujukan_json) as string[],
          titik: JSON.parse(r.titik_json) as TitikPeta[],
        }),
      );
    const jawaban = this.sql.exec<BarisJawabanSql>("SELECT * FROM jawaban").toArray().map(barisKeJawaban);
    const terlihat = this.sql
      .exec<{ pemain_id: string; titik_id: string }>("SELECT pemain_id, titik_id FROM terlihat")
      .toArray()
      .map((r) => ({ pemainId: r.pemain_id, titikId: r.titik_id }));
    const skill = this.sql
      .exec<{ pemain_id: string; isi_json: string }>("SELECT pemain_id, isi_json FROM skill")
      .toArray()
      .map((r) => ({ pemainId: r.pemain_id, isi: r.isi_json }));
    const petunjuk = this.sql
      .exec<{ pemain_id: string; kode: string; opsi: string }>("SELECT pemain_id, kode, opsi FROM petunjuk")
      .toArray()
      .map((r) => ({ pemainId: r.pemain_id, kode: r.kode, opsi: r.opsi }));
    this.keadaan = pulihkanKeadaan(
      {
        ruang,
        status: (meta.get("status") as StatusRuang | undefined) ?? "lobi",
        waktu: (meta.get("waktu") as WaktuRuang | undefined) ?? { ...WAKTU_AWAL },
        terkunci: (meta.get("terkunci") as boolean | undefined) ?? false,
        ditutupPada: (meta.get("ditutupPada") as number | undefined) ?? null,
        sambunganTerakhirPutus: (meta.get("sambunganTerakhirPutus") as number | undefined) ?? null,
        modeNama: meta.get("modeNama") as ModeNama | undefined, // JS-14 (P-41)
        namaDiblokir: (meta.get("namaDiblokir") as string[] | undefined) ?? [], // JS-14 (P-50)
        pemain,
        sambungan,
        kejadian,
        jawaban,
        terlihat,
        skill,
        petunjuk,
      },
      PETA_KAMPUNG,
      sekarang,
    );
    if (this.keadaan.status === "main") this.mulaiPutaran();
    if (!this.antreanKosong()) this.jadwalkanKiriman();
  }

  private catatTulis(jumlah: number): void {
    this.statistik.barisDitulis += jumlah;
    this.pemakaian.barisSqlite += jumlah;
  }

  private tulisMeta(kunci: string, nilai: unknown): void {
    const c = this.sql.exec(
      "INSERT INTO meta (kunci, nilai) VALUES (?, ?) ON CONFLICT(kunci) DO UPDATE SET nilai = excluded.nilai",
      kunci,
      JSON.stringify(nilai ?? null),
    );
    this.catatTulis(c.rowsWritten);
  }

  private tulisSimpanan(s: Simpanan): void {
    if (s.jenis === "meta") return this.tulisMeta(s.kunci, s.nilai);
    if (s.jenis === "jawaban") return this.tulisJawaban(s.jawaban);
    if (s.jenis === "terlihat") {
      const c = this.sql.exec(
        "INSERT INTO terlihat (pemain_id, titik_id, kode, pada) VALUES (?, ?, ?, ?) ON CONFLICT(pemain_id, titik_id) DO NOTHING",
        s.pemainId,
        s.titikId,
        s.kode,
        s.pada,
      );
      this.catatTulis(c.rowsWritten);
      return;
    }
    if (s.jenis === "hapus_pemain") {
      this.catatTulis(this.sql.exec("DELETE FROM pemain WHERE id = ?", s.id).rowsWritten);
      return;
    }
    // JS-09 (P-14): satu baris per perubahan keadaan skill, dan satu baris per Petunjuk yang dipakai.
    if (s.jenis === "skill") {
      const c = this.sql.exec(
        "INSERT INTO skill (pemain_id, isi_json) VALUES (?, ?) ON CONFLICT(pemain_id) DO UPDATE SET isi_json = excluded.isi_json",
        s.pemainId,
        s.isi,
      );
      this.catatTulis(c.rowsWritten);
      return;
    }
    if (s.jenis === "petunjuk") {
      const c = this.sql.exec("INSERT INTO petunjuk (pemain_id, kode, opsi) VALUES (?, ?, ?) ON CONFLICT(pemain_id, kode) DO NOTHING", s.pemainId, s.kode, s.opsi);
      this.catatTulis(c.rowsWritten);
      return;
    }
    const p = s.pemain;
    const c = this.sql.exec(
      "INSERT INTO pemain (id, hash_token, urutan, nama, avatar, warna_tas, nomor_absen, saran_json, terhubung, terputus_sejak, posisi_json, dikeluarkan, gabung_pada) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET nama = excluded.nama, avatar = excluded.avatar, " +
        "warna_tas = excluded.warna_tas, nomor_absen = excluded.nomor_absen, saran_json = excluded.saran_json, terhubung = excluded.terhubung, " +
        "terputus_sejak = excluded.terputus_sejak, posisi_json = excluded.posisi_json, dikeluarkan = excluded.dikeluarkan",
      p.id,
      p.hashToken,
      p.urutan,
      p.nama,
      p.avatar,
      p.warnaTas,
      p.nomorAbsen,
      JSON.stringify({ saran: p.saran, tolak: p.tolak ?? 0 }), // JS-14 (P-44)
      p.terhubung ? 1 : 0,
      p.terputusSejak,
      p.posisi ? JSON.stringify(p.posisi) : null,
      p.dikeluarkan ? 1 : 0,
      p.gabungPada,
    );
    this.catatTulis(c.rowsWritten);
  }

  /** Satu baris jawaban SQLite ruang, ditulis saat pembukaan pertama dan setiap kunci (P-61). */
  private tulisJawaban(j: JawabanRuang): void {
    const c = this.sql.exec(
      "INSERT INTO jawaban (pemain_id, kode, urutan_json, status, langkah1_opsi, langkah1_benar, langkah2_opsi, tingkat, poin, dibuka_pada, " +
        "langkah1_pada, langkah2_pada) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(pemain_id, kode) DO UPDATE SET status = excluded.status, " +
        "langkah1_opsi = excluded.langkah1_opsi, langkah1_benar = excluded.langkah1_benar, langkah2_opsi = excluded.langkah2_opsi, " +
        "tingkat = excluded.tingkat, poin = excluded.poin, langkah1_pada = excluded.langkah1_pada, langkah2_pada = excluded.langkah2_pada",
      j.pemainId,
      j.kode,
      JSON.stringify({ urutan1: j.urutan1, urutan2: j.urutan2, id1: j.id1, id2: j.id2 }),
      j.status,
      j.langkah1Opsi,
      j.langkah1Benar === null ? null : j.langkah1Benar ? 1 : 0,
      j.langkah2Opsi,
      j.tingkat,
      j.poin,
      j.dibukaPada,
      j.langkah1Pada,
      j.langkah2Pada,
    );
    this.catatTulis(c.rowsWritten);
  }

  /** Antrean kosong: tabel `kiriman` lama dan tabel `antrean` (JS-08) sama-sama kosong. */
  private antreanKosong(): boolean {
    return this.sql.exec<{ n: number }>("SELECT COUNT(*) AS n FROM kiriman").one().n === 0 && jumlahAntrean(this.sql) === 0;
  }

  // -------------------------------------------------------------------------------------------
  // Permintaan internal dari Worker

  private async inisialisasi(request: Request): Promise<Response> {
    if (this.keadaan) return jawabJson({ ok: true }, 200);
    const { kejadian: masuk, ...isi } = (await request.json()) as DataRuang & { kejadian?: KejadianMasuk[] };
    const data: DataRuang = { ruangId: isi.ruangId, kode: isi.kode, pengaturan: isi.pengaturan, benih: isi.benih, dibuatPada: isi.dibuatPada };
    if (typeof isi.labelKelas === "string") data.labelKelas = isi.labelKelas; // JS-10, P-5
    // Penempatan sekali per ruang dengan benih ruang (P-9). Worker sudah membuang kejadian yang kehabisan titik (P-2).
    let kejadian: KejadianRuang[] = [];
    try {
      kejadian = tempatkanRuang(data.benih, TITIK_PER_ZONA, masuk ?? [], jumlahTitikRuang(data.pengaturan.batasPemain));
    } catch {
      kejadian = [];
    }
    kejadian.forEach((k, i) => {
      const c = this.sql.exec(
        "INSERT INTO kejadian (kode, urutan, versi_id, isi_json, rujukan_json, titik_json) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(kode) DO NOTHING",
        k.kode,
        i,
        k.versiId,
        JSON.stringify(k.isi),
        JSON.stringify(k.rujukan),
        JSON.stringify(k.titik),
      );
      this.catatTulis(c.rowsWritten);
    });
    this.keadaan = buatKeadaan(data, PETA_KAMPUNG, kejadian);
    this.tulisMeta("ruang", data);
    this.tulisMeta("status", this.keadaan.status);
    this.tulisMeta("waktu", this.keadaan.waktu);
    await this.pasangAlarm();
    return jawabJson({ ok: true }, 200);
  }

  /** Kait uji lokal: memutus semua sambungan pemain seperti jaringan putus (kode 1012, klien menyambung ulang). */
  private async putuskanSemua(): Promise<Response> {
    const k = this.keadaan;
    if (!k) return jawabGalat("RUANG_TIDAK_ADA", TEKS.api.RUANG_TIDAK_ADA, 404);
    for (const ws of this.ctx.getWebSockets("pemain")) {
      const l = ws.deserializeAttachment() as Lampiran | null;
      if (!l) continue;
      this.tutupSoket(l.sambunganId, 1012, "uji putus");
      await this.terapkan(sambunganPutus(k, l.sambunganId, Date.now()));
    }
    return jawabJson({ ok: true }, 200);
  }

  /** Kait uji lokal: memindahkan pemain bernama tertentu ke sebuah ubin (JS-08, P-67). */
  private async pindahkan(request: Request): Promise<Response> {
    const k = this.keadaan;
    if (!k) return jawabGalat("RUANG_TIDAK_ADA", TEKS.api.RUANG_TIDAK_ADA, 404);
    let isi: { nama?: unknown; x?: unknown; y?: unknown } = {};
    try {
      isi = (await request.json()) as typeof isi;
    } catch {
      isi = {};
    }
    const bulat = (v: unknown) => typeof v === "number" && Number.isInteger(v) && v >= 0 && v < 512;
    if (typeof isi.nama !== "string" || !bulat(isi.x) || !bulat(isi.y)) return jawabGalat("PESAN_SALAH", TEKS.api.PESAN_SALAH, 400);
    const hasil = pindahkanPemain(k, isi.nama, isi.x as number, isi.y as number, Date.now());
    if (hasil === "tidak_ada") return jawabGalat("PEMAIN_TIDAK_ADA", TEKS.api.PESAN_SALAH, 404);
    if (hasil === "padat") return jawabGalat("SEL_PADAT", TEKS.api.PESAN_SALAH, 400);
    await this.terapkan(hasil);
    return jawabJson({ ok: true }, 200);
  }

  private ringkasanStatistik() {
    return {
      ...this.statistik,
      status: this.keadaan?.status ?? null,
      pemain: this.keadaan?.pemain.size ?? 0,
      sambungan: this.ctx.getWebSockets("pemain").length,
      sambunganKelas: this.ctx.getWebSockets("kelas").length,
      pemakaian: this.ringkasPemakaian(),
      alarmDipakai: this.alarmDipakai,
      antreanKiriman: this.sql.exec<{ n: number }>("SELECT COUNT(*) AS n FROM kiriman").one().n + jumlahAntrean(this.sql),
      menungguHalo: this.keadaan?.batasHalo.size ?? 0,
      alarm: this.alarmTerpasang ?? null,
      pewaktuPutaran: this.pewaktuPutaran !== null,
    };
  }

  // -------------------------------------------------------------------------------------------
  // Sambungan

  private async terimaSambungan(request: Request): Promise<Response> {
    const k = this.keadaan;
    if (request.headers.get("X-Jejak-Peran") !== "pemain" || !k) return jawabGalat("RUANG_TIDAK_ADA", TEKS.api.RUANG_TIDAK_ADA, 404);
    const pasangan = new WebSocketPair();
    const klien = pasangan[0];
    const server = pasangan[1];
    const sambunganId = base64url(crypto.getRandomValues(new Uint8Array(9)));
    this.ctx.acceptWebSocket(server, ["pemain"]);
    this.pemakaian.sambungan++; // JS-22, P-15
    server.serializeAttachment({ sambunganId, pemainId: null, dibukaPada: Date.now() } satisfies Lampiran);
    this.soket.set(sambunganId, server);
    this.batas.set(sambunganId, sambunganBaru(Date.now()));
    // Batas halo 10 detik dijaga lewat alarm, karena pengatur waktu hilang saat ruang beristirahat (P-15).
    sambunganMasuk(k, sambunganId, Date.now());
    await this.pasangAlarm();
    return new Response(null, { status: 101, webSocket: klien });
  }

  private cariSoket(sid: string): WebSocket | undefined {
    const ada = this.soket.get(sid);
    if (ada) return ada;
    for (const ws of this.ctx.getWebSockets("pemain")) {
      const l = ws.deserializeAttachment() as Lampiran | null;
      if (l) this.soket.set(l.sambunganId, ws);
    }
    return this.soket.get(sid);
  }

  private kirimSoket(ws: WebSocket, pesan: PesanServerPemain): void {
    const teks = JSON.stringify(pesan);
    try {
      ws.send(teks);
      this.statistik.keluar++;
      this.statistik.byteKeluar += teks.length;
    } catch {
      // Sambungan sudah tertutup; peristiwa putus akan menyusul.
    }
  }

  private tutupSoket(sid: string, kode: number, alasan: string): void {
    const ws = this.cariSoket(sid);
    if (ws) {
      try {
        ws.close(kode, alasan);
      } catch {
        // Sudah tertutup.
      }
    }
    this.soket.delete(sid);
    this.batas.delete(sid);
  }

  private async tanganiPesan(ws: WebSocket, pesan: string | ArrayBuffer): Promise<void> {
    const k = this.keadaan;
    const l = ws.deserializeAttachment() as Lampiran | null;
    if (!k || !l) {
      try {
        ws.close(KODE_TUTUP.ditutup, "ruang tidak ada");
      } catch {
        // Sudah tertutup.
      }
      return;
    }
    const sid = l.sambunganId;
    this.soket.set(sid, ws);
    if (!k.sambungan.has(sid)) sambunganMasuk(k, sid, Date.now());
    let batas = this.batas.get(sid);
    if (!batas) {
      batas = sambunganBaru(Date.now());
      this.batas.set(sid, batas);
    }
    this.statistik.masuk++;
    const sekarang = Date.now();
    const hasil = bacaPesanPemain(batas, pesan, sekarang);
    if (hasil.jenis === "pelanggaran") {
      this.statistik.pelanggaran++;
      const c = catatPelanggaran(batas, sekarang);
      if (c.kirimGalat) this.kirimSoket(ws, { v: PROTOKOL_VERSI, t: "galat", kode: "TERLALU_CEPAT", pesan: TEKS.galat.TERLALU_CEPAT });
      if (c.tutup) {
        this.tutupSoket(sid, KODE_TUTUP.pelanggaran, "pelanggaran");
        await this.terapkan(sambunganPutus(k, sid, sekarang));
      }
      return;
    }
    if (hasil.jenis === "versi") {
      this.kirimSoket(ws, { v: PROTOKOL_VERSI, t: "galat", kode: "VERSI_BERBEDA", pesan: TEKS.galat.VERSI_BERBEDA });
      this.tutupSoket(sid, KODE_TUTUP.versi, "versi berbeda");
      await this.terapkan(sambunganPutus(k, sid, sekarang));
      return;
    }
    const m = hasil.pesan;
    if (m.t === "halo") {
      const hashMasuk = m.token ? await sha256Hex(m.token) : null;
      const token = base64url(crypto.getRandomValues(new Uint8Array(32)));
      const calon = { pemainId: base64url(crypto.getRandomValues(new Uint8Array(6))), token, hashToken: await sha256Hex(token) };
      await this.terapkan(terimaHalo(k, sid, m, Date.now(), acakKripto, calon, hashMasuk));
      return;
    }
    await this.terapkan(terimaPemain(k, sid, m, sekarang, acakKripto));
  }

  private async tanganiPutus(ws: WebSocket, kode: number): Promise<void> {
    try {
      ws.close(kode >= 1000 && kode < 5000 && kode !== 1005 && kode !== 1006 && kode !== 1015 ? kode : 1000, "selesai");
    } catch {
      // Sudah tertutup.
    }
    const l = ws.deserializeAttachment() as Lampiran | null;
    if (!l) return;
    this.soket.delete(l.sambunganId);
    this.batas.delete(l.sambunganId);
    const k = this.keadaan;
    if (k) await this.terapkan(sambunganPutus(k, l.sambunganId, Date.now()));
  }

  // -------------------------------------------------------------------------------------------
  // Layar kelas (JS-10, P-8, P-10, dan P-13)

  /** Sambungan layar kelas dari Worker (tiket sudah diperiksa): nonce sekali pakai, lalu satu layar kelas per ruang. */
  private async terimaSambunganKelas(request: Request): Promise<Response> {
    const k = this.keadaan;
    if (request.headers.get("X-Jejak-Peran") !== "guru" || !k || k.status === "ditutup") {
      return jawabGalat("RUANG_TIDAK_ADA", TEKS.api.RUANG_TIDAK_ADA, 404);
    }
    const nonce = request.headers.get("X-Jejak-Nonce") ?? "";
    const kedaluwarsa = Number(request.headers.get("X-Jejak-Kedaluwarsa"));
    const asal = request.headers.get("X-Jejak-Asal") ?? "";
    const sekarang = Date.now();
    if (!/^[A-Za-z0-9_-]{22}$/.test(nonce) || !Number.isFinite(kedaluwarsa) || kedaluwarsa < sekarang || !/^https?:\/\//.test(asal)) {
      return jawabGalat("TIKET_DITOLAK", "Tiket layar kelas ditolak.", 403);
    }
    this.catatTulis(this.sql.exec("DELETE FROM tiket_terpakai WHERE kedaluwarsa < ?", sekarang).rowsWritten);
    if (this.sql.exec("SELECT nonce FROM tiket_terpakai WHERE nonce = ?", nonce).toArray().length > 0) {
      return jawabGalat("TIKET_DITOLAK", "Tiket layar kelas ditolak.", 403);
    }
    this.catatTulis(this.sql.exec("INSERT INTO tiket_terpakai (nonce, kedaluwarsa) VALUES (?, ?)", nonce, kedaluwarsa).rowsWritten);
    for (const lama of this.ctx.getWebSockets("kelas")) tutupAman(lama, KODE_TUTUP.diganti, "layar kelas diganti");
    const pasangan = new WebSocketPair();
    this.ctx.acceptWebSocket(pasangan[1], ["kelas"]);
    this.pemakaian.sambungan++; // JS-22, P-15
    pasangan[1].serializeAttachment({ kelas: true, asal, dibukaPada: sekarang } satisfies LampiranKelas);
    return new Response(null, { status: 101, webSocket: pasangan[0] });
  }

  private async tanganiPesanKelas(ws: WebSocket, pesan: string | ArrayBuffer): Promise<void> {
    const k = this.keadaan;
    const l = lampiranKelas(ws);
    if (!k || !l) {
      tutupAman(ws, KODE_TUTUP.ditutup, "ruang tidak ada");
      return;
    }
    if (typeof pesan !== "string" || pesan.length > PESAN_KELAS_MAKS) return;
    let data: unknown = null;
    try {
      data = JSON.parse(pesan);
    } catch {
      return;
    }
    const hasil = skemaKelas.safeParse(data);
    if (!hasil.success) return;
    this.statistik.masuk++;
    if (hasil.data.t === "halo") await this.terapkan(sambutanKelas(k, l.asal, Date.now()));
    else await this.terapkan(terimaKelas(k, hasil.data, Date.now(), acakKripto));
  }

  private kirimKelas(pesan: readonly unknown[]): void {
    const soket = this.ctx.getWebSockets("kelas");
    if (soket.length === 0) return;
    for (const m of pesan) {
      const teks = JSON.stringify(m);
      for (const ws of soket) {
        try {
          ws.send(teks);
          this.statistik.keluarKelas++;
          this.statistik.byteKelas += teks.length;
        } catch {
          // Sambungan sudah tertutup.
        }
      }
    }
  }

  /** Keadaan langsung untuk halaman detail ruang di konsol (P-8); tautan ditambahkan Worker. */
  private keadaanLangsung() {
    const k = this.keadaan;
    if (!k) return { galat: { kode: "RUANG_TIDAK_ADA" } };
    const pemain = [...k.pemain.values()]
      .filter((p) => p.nama !== null && !p.dikeluarkan)
      .sort((a, b) => a.urutan - b.urutan)
      .map((p) => ({ id: p.id, nama: p.nama ?? "", avatar: p.avatar ?? 0, terhubung: p.terhubung }));
    return {
      status: k.status,
      terkunci: k.terkunci,
      modeNama: k.modeNama, // JS-14 (P-33)
      mulaiPada: k.waktu.mulaiPada,
      berakhirPada: k.waktu.berakhirPada,
      jedaSejak: k.waktu.jedaSejak,
      pemain,
      kirimanBerhenti: this.kirimanBerhenti,
      kirimanTertunda: !this.antreanKosong(), // JS-11, P-15
      pemakaian: this.ringkasPemakaian(),
    };
  }

  /** Aksi kelola dari konsol (P-10), diterjemahkan menjadi pesan kelas yang setara. */
  private async aksiKelola(request: Request): Promise<Response> {
    const k = this.keadaan;
    if (!k) return jawabJson({ galat: { kode: "RUANG_TIDAK_ADA" } }, 404);
    let data: unknown = null;
    try {
      data = await request.json();
    } catch {
      data = null;
    }
    const hasil = skemaKelola.safeParse(data);
    if (!hasil.success) return jawabJson({ galat: { kode: "ISI_SALAH" } }, 400);
    const { aksi, pemainId } = hasil.data;
    const V = PROTOKOL_VERSI;
    // JS-14 (P-51): ganti nama dan ganti semua nama menjawab nama baru atau jumlahnya.
    if (aksi === "ganti_nama") {
      const p = pemainId ? k.pemain.get(pemainId) : undefined;
      if (!p || p.nama === null || p.dikeluarkan || !pemainId) return jawabJson({ galat: { kode: "PEMAIN_TIDAK_ADA" } }, 404);
      if (k.status === "ditutup") return jawabJson({ galat: { kode: "STATUS_TIDAK_SESUAI" } }, 409);
      const o = keluaranKosong();
      const nama = gantiNama(k, o, pemainId, acakKripto);
      await this.terapkan(o);
      return jawabJson({ ok: true, nama }, 200);
    }
    if (aksi === "ganti_semua_nama") {
      if (k.status === "ditutup") return jawabJson({ galat: { kode: "STATUS_TIDAK_SESUAI" } }, 409);
      if (k.modeNama !== "bebas") return jawabJson({ galat: { kode: "BUKAN_NAMA_BEBAS" } }, 409);
      const o = keluaranKosong();
      const jumlah = gantiSemuaNama(k, o, Date.now(), acakKripto) ?? 0;
      await this.terapkan(o);
      return jawabJson({ ok: true, jumlah }, 200);
    }
    let pesan: PesanKelas;
    if (aksi === "kunci" || aksi === "buka_kunci") pesan = { v: V, t: "kunci_ruang", kunci: aksi === "kunci" };
    else if (aksi === "keluarkan") {
      const p = pemainId ? k.pemain.get(pemainId) : undefined;
      if (!p || p.nama === null || p.dikeluarkan || !pemainId) return jawabJson({ galat: { kode: "PEMAIN_TIDAK_ADA" } }, 404);
      pesan = { v: V, t: "keluarkan", pemainId };
    } else {
      if (!STATUS_BOLEH_TUTUP.includes(k.status)) return jawabJson({ galat: { kode: "STATUS_TIDAK_SESUAI" } }, 409);
      pesan = { v: V, t: "tutup_ruang" };
    }
    await this.terapkan(terimaKelas(k, pesan, Date.now(), acakKripto));
    return jawabJson({ ok: true }, 200);
  }

  // -------------------------------------------------------------------------------------------
  // Menjalankan keluaran inti ruang

  private async terapkan(o: Keluaran): Promise<void> {
    for (const s of o.simpan) this.tulisSimpanan(s);
    for (const { sambunganId, pemainId } of o.ikat) {
      const ws = this.cariSoket(sambunganId);
      const l = ws?.deserializeAttachment() as Lampiran | null | undefined;
      if (ws && l) ws.serializeAttachment({ ...l, pemainId } satisfies Lampiran);
    }
    // Dialog yang terbuka atau tertutup disimpan di lampiran sambungan, bukan di SQLite (P-30).
    for (const { sambunganId, kode } of o.dialog) {
      const ws = this.cariSoket(sambunganId);
      const l = ws?.deserializeAttachment() as Lampiran | null | undefined;
      if (ws && l) ws.serializeAttachment({ ...l, dialog: kode } satisfies Lampiran);
    }
    for (const { sambunganId, pesan } of o.kirim) {
      const ws = this.cariSoket(sambunganId);
      if (ws) this.kirimSoket(ws, pesan);
    }
    for (const t of o.tutup) this.tutupSoket(t.sambunganId, t.kode, t.alasan);
    if (o.kelas.length > 0) this.kirimKelas(o.kelas);
    if (this.keadaan?.status === "ditutup" || o.hapusSemua) {
      for (const ws of this.ctx.getWebSockets("kelas")) tutupAman(ws, KODE_TUTUP.ditutup, "ruang ditutup");
    }
    if (o.kiriman.length > 0) this.antrekanKiriman(o.kiriman);
    this.statistik.koreksi += o.koreksi;
    this.statistik.duniaLobi += o.duniaLobi;
    this.statistik.jawabanSelesai += o.jawabanSelesai;
    this.statistik.pribadi += o.pribadi;
    if (o.alasanKoreksi) this.statistik.koreksiAlasan[o.alasanKoreksi] = (this.statistik.koreksiAlasan[o.alasanKoreksi] ?? 0) + 1;
    if (o.putaran === "mulai") this.mulaiPutaran();
    else if (o.putaran === "henti") this.hentiPutaran();
    if (o.kirimSekarang) await this.kirimKiriman();
    // P-16: ringkasan pemakaian saat ruang ditutup (inti ruang mengantrekan status `ditutup` ke D1 pada saat itu).
    // JS-11 (P-14): juga saat ronde berakhir dan saat peringkat akhir berubah, agar `hasil` ikut tertulis.
    if (o.kiriman.some((b) => b.jenis === "ruang" && b.isi.status === "ditutup")) await this.tulisRingkasan();
    else if (o.tulisRingkasan && !o.hapusSemua) await this.tulisRingkasan();
    if (o.hapusSemua) {
      await this.tulisRingkasan();
      this.hentiPutaran();
      await this.ctx.storage.deleteAlarm();
      await this.ctx.storage.deleteAll();
      this.keadaan = null;
      this.alarmTerpasang = null;
      return;
    }
    await this.pasangAlarm();
  }

  private mulaiPutaran(): void {
    if (this.pewaktuPutaran) return;
    this.pewaktuPutaran = setInterval(() => {
      void this.antre(async () => {
        const k = this.keadaan;
        if (!k) return;
        this.statistik.putaran++;
        await this.terapkan(putaran(k, Date.now()));
      });
    }, 100);
  }

  private hentiPutaran(): void {
    if (this.pewaktuPutaran) clearInterval(this.pewaktuPutaran);
    this.pewaktuPutaran = null;
  }

  private async pasangAlarm(): Promise<void> {
    if (this.mati) return;
    const k = this.keadaan;
    const calon: number[] = [];
    if (k) {
      const t = tenggatBerikut(k, this.antreanKosong());
      if (t !== null) calon.push(t);
    }
    if (this.kirimanGagal) calon.push(this.kirimanGagal.berikutnya);
    let tenggat = calon.length > 0 ? Math.min(...calon) : null;
    const sekarang = Date.now();
    // P-2: tenggat yang sudah lewat dan sama dengan alarm yang baru berjalan, lima kali berturut-turut, digeser 60 detik.
    if (this.alarmTadi !== null) {
      const hasil = periksaBerulang(this.berulang, this.alarmTadi, tenggat, sekarang);
      if (hasil.catatan.tenggat !== this.berulang.tenggat || hasil.catatan.n !== this.berulang.n) this.tulisMeta("alarmBerulang", hasil.catatan);
      this.berulang = hasil.catatan;
      if (hasil.geser && tenggat !== null) {
        catatGalat("ALARM_BERULANG", { ruang: k?.ruang.kode ?? null, tenggat, status: k?.status ?? null });
        tenggat = sekarang + ALARM_GESER_MS;
      }
    }
    if (tenggat !== null) {
      // P-1: paling cepat 1 detik dari sekarang. Tenggat yang sudah lewat tidak menggeser alarm dekat yang sudah terpasang,
      // agar putaran 100 ms tidak menulis ulang alarm terus.
      if (tenggat <= sekarang && typeof this.alarmTerpasang === "number" && this.alarmTerpasang <= sekarang + ALARM_JEDA_MIN_MS) return;
      tenggat = tenggatAman(tenggat, sekarang);
    }
    if (tenggat === this.alarmTerpasang) return;
    if (tenggat === null) await this.ctx.storage.deleteAlarm();
    else await this.ctx.storage.setAlarm(tenggat);
    this.alarmTerpasang = tenggat;
  }

  // -------------------------------------------------------------------------------------------
  // Kiriman ke D1 (P-47)

  /** Sejak JS-08 baris baru masuk tabel `antrean` berkunci `jenis:id` (P-61), bukan tabel `kiriman`. */
  private antrekanKiriman(baris: readonly BarisKiriman[]): void {
    this.catatTulis(antrekan(this.sql, baris, Date.now()));
    this.jadwalkanKiriman();
  }

  private jadwalkanKiriman(): void {
    if (this.pewaktuKiriman || this.kirimanGagal || this.kirimanBerhenti || this.mati) return;
    this.pewaktuKiriman = setTimeout(() => {
      this.pewaktuKiriman = null;
      void this.antre(async () => {
        await this.kirimKiriman();
        await this.pasangAlarm();
      });
    }, JEDA_KIRIMAN_MS);
  }

  /**
   * Kiriman ke D1 (P-62): baris tabel `kiriman` lama (ruang sebelum JS-08) dikuras lebih dulu, lalu tabel `antrean`
   * menurut urutan (ruang, peserta, jawaban) dan waktu dibuat. Baris antrean dihapus sesudah terkirim hanya bila
   * versinya belum berubah.
   */
  private async kirimKiriman(): Promise<void> {
    if (this.pewaktuKiriman) clearTimeout(this.pewaktuKiriman);
    this.pewaktuKiriman = null;
    const lama = this.sql.exec<{ id: number; jenis: string; isi_json: string }>("SELECT id, jenis, isi_json FROM kiriman ORDER BY id").toArray();
    const antrean = ambilAntrean(this.sql);
    if (lama.length === 0 && antrean.length === 0) {
      this.kirimanGagal = null;
      return;
    }
    const terakhir = new Map<string, BarisKiriman>();
    for (const b of lama) {
      const kiriman = { jenis: b.jenis, isi: JSON.parse(b.isi_json) } as BarisKiriman;
      const kunci = kiriman.jenis === "ruang" ? `ruang:${kiriman.isi.ruangId}` : `${kiriman.jenis}:${kiriman.isi.id}`;
      terakhir.delete(kunci);
      terakhir.set(kunci, kiriman);
    }
    try {
      if (lama.length > 0) {
        this.pemakaian.barisD1 += await kirimKeD1(this.env.DB, [...terakhir.values()]);
        this.catatTulis(this.sql.exec("DELETE FROM kiriman WHERE id <= ?", lama[lama.length - 1].id).rowsWritten);
      }
      if (antrean.length > 0) {
        this.pemakaian.barisD1 += await kirimKeD1(
          this.env.DB,
          antrean.map((a) => a.baris),
        );
        this.catatTulis(hapusTerkirim(this.sql, antrean));
      }
      this.kirimanGagal = null;
      if (this.kirimanGagalSejak !== null) {
        this.kirimanGagalSejak = null;
        this.tulisMeta("kirimanGagalSejak", null);
      }
      this.tulisMeta("pemakaian", this.pemakaian);
    } catch {
      // P-4: jeda naik sampai 60 menit; berhenti 24 jam sesudah kegagalan pertama.
      const sekarang = Date.now();
      if (this.kirimanGagalSejak === null) {
        this.kirimanGagalSejak = sekarang;
        this.tulisMeta("kirimanGagalSejak", sekarang);
      }
      if (kirimanHarusBerhenti(this.kirimanGagalSejak, sekarang)) {
        this.kirimanGagal = null;
        this.kirimanBerhenti = true;
        this.tulisMeta("kirimanBerhenti", true);
        catatGalat("KIRIMAN_BERHENTI", { ruang: this.keadaan?.ruang.kode ?? null, sejak: this.kirimanGagalSejak });
        return;
      }
      const percobaan = (this.kirimanGagal?.percobaan ?? 0) + 1;
      this.kirimanGagal = { percobaan, berikutnya: sekarang + jedaKiriman(percobaan) };
    }
  }

  // -------------------------------------------------------------------------------------------
  // Pengaman biaya (JS-22)

  /** Membaca catatan pengaman dan pemakaian dari tabel meta sesudah bangun. */
  private pulihkanPengaman(): void {
    const baca = (kunci: string): unknown => {
      const baris = this.sql.exec<{ nilai: string }>("SELECT nilai FROM meta WHERE kunci = ?", kunci).toArray()[0];
      if (!baris) return null;
      try {
        return JSON.parse(baris.nilai) as unknown;
      } catch {
        return null;
      }
    };
    const dipakai = baca("alarmDipakai");
    this.alarmDipakai = typeof dipakai === "number" ? dipakai : 0;
    const berulang = baca("alarmBerulang") as CatatanBerulang | null;
    this.berulang = berulang && typeof berulang.n === "number" ? berulang : BERULANG_KOSONG;
    const sejak = baca("kirimanGagalSejak");
    this.kirimanGagalSejak = typeof sejak === "number" ? sejak : null;
    this.kirimanBerhenti = baca("kirimanBerhenti") === true;
    this.pemakaian = bacaPemakaian(baca("pemakaian"));
  }

  /** Kait uji lokal (JS-22): mengatur hitungan alarm agar anggaran alarm bisa diuji tanpa menunggu 200 alarm. */
  private async aturPengaman(request: Request): Promise<Response> {
    let isi: { alarmDipakai?: unknown } = {};
    try {
      isi = (await request.json()) as { alarmDipakai?: unknown };
    } catch {
      isi = {};
    }
    if (typeof isi.alarmDipakai === "number" && Number.isInteger(isi.alarmDipakai) && isi.alarmDipakai >= 0) {
      this.alarmDipakai = isi.alarmDipakai;
      this.tulisMeta("alarmDipakai", this.alarmDipakai);
    }
    return jawabJson({ ok: true, alarmDipakai: this.alarmDipakai }, 200);
  }

  /** Pemakaian ronde untuk konsol dan `ringkasan_json` (P-16, P-17). */
  private ringkasPemakaian() {
    return { ...this.pemakaian, perkiraanPermintaan: perkiraanPermintaan(this.pemakaian) };
  }

  /**
   * Menyimpan pemakaian di meta dan `ruang.ringkasan_json` di D1, sekali, tanpa percobaan ulang. Sejak JS-11 (P-14),
   * ringkasan hasil ronde ikut tertulis bila ronde sempat dimainkan.
   */
  private async tulisRingkasan(): Promise<void> {
    const k = this.keadaan;
    const ruangId = k?.ruang.ruangId;
    if (!k || !ruangId) return;
    try {
      const hasil = ringkasanHasil(k);
      this.pemakaian.barisD1 += await tulisRingkasanRuang(this.env.DB, ruangId, { pemakaian: this.ringkasPemakaian(), ...(hasil ? { hasil } : {}) });
    } catch {
      // Ringkasan bersifat perkiraan; kegagalan tidak menahan penutupan atau penghapusan.
    }
    if (!this.mati) this.tulisMeta("pemakaian", this.pemakaian);
  }

  /**
   * P-6: berhenti paksa. Ruang ditutup apa pun statusnya, antrean kiriman dicoba sekali, lalu alarm dan seluruh
   * penyimpanan dihapus; sisa umur objek ini menolak pesan dan alarm.
   */
  private async berhentiPaksa(alasan: "ANGGARAN_ALARM" | "DARURAT"): Promise<void> {
    if (this.mati) return;
    const k = this.keadaan;
    catatGalat(alasan, { ruang: k?.ruang.kode ?? null, status: k?.status ?? null, alarm: this.alarmDipakai });
    if (k && k.status !== "ditutup") {
      const o = tutupPaksa(k, Date.now());
      for (const { sambunganId, pesan } of o.kirim) {
        const ws = this.cariSoket(sambunganId);
        if (ws) this.kirimSoket(ws, pesan);
      }
      if (o.kelas.length > 0) this.kirimKelas(o.kelas);
      if (o.kiriman.length > 0) this.catatTulis(antrekan(this.sql, o.kiriman, Date.now()));
    }
    this.mati = true;
    this.hentiPutaran();
    if (this.pewaktuKiriman) clearTimeout(this.pewaktuKiriman);
    this.pewaktuKiriman = null;
    try {
      await this.kirimKiriman();
    } catch {
      // Sekali saja.
    }
    await this.tulisRingkasan();
    for (const ws of this.ctx.getWebSockets()) tutupAman(ws, KODE_TUTUP.ditutup, "ruang ditutup");
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
    this.keadaan = null;
    this.alarmTerpasang = null;
  }

}

function barisKeJawaban(r: BarisJawabanSql): JawabanRuang {
  const u = JSON.parse(r.urutan_json) as { urutan1: number[]; urutan2: number[]; id1: string[]; id2: string[] };
  return {
    pemainId: r.pemain_id,
    kode: r.kode,
    urutan1: u.urutan1,
    urutan2: u.urutan2,
    id1: u.id1,
    id2: u.id2,
    status: r.status as StatusJawaban,
    langkah1Opsi: r.langkah1_opsi,
    langkah1Benar: r.langkah1_benar === null ? null : r.langkah1_benar === 1,
    langkah2Opsi: r.langkah2_opsi,
    tingkat: r.tingkat as Tingkat | null,
    poin: r.poin,
    dibukaPada: r.dibuka_pada,
    langkah1Pada: r.langkah1_pada,
    langkah2Pada: r.langkah2_pada,
  };
}

/** JS-14 (P-44): `saran_json` berisi `{ saran, tolak }`; isian lama berupa larik tetap terbaca dengan `tolak` 0. */
function saranDariJson(teks: string): { saran: string[]; tolak: number } {
  const teksSaja = (x: unknown): string[] => (Array.isArray(x) ? x.filter((y): y is string => typeof y === "string") : []);
  try {
    const d = JSON.parse(teks) as unknown;
    if (Array.isArray(d)) return { saran: teksSaja(d), tolak: 0 };
    const o = (d ?? {}) as { saran?: unknown; tolak?: unknown };
    return { saran: teksSaja(o.saran), tolak: typeof o.tolak === "number" && o.tolak >= 0 ? Math.floor(o.tolak) : 0 };
  } catch {
    return { saran: [], tolak: 0 };
  }
}

function barisKePemain(r: BarisPemainSql): PemainRuang {
  return {
    id: r.id,
    hashToken: r.hash_token,
    urutan: r.urutan,
    nama: r.nama,
    avatar: r.avatar,
    warnaTas: r.warna_tas as WarnaTas | null,
    nomorAbsen: r.nomor_absen,
    ...saranDariJson(r.saran_json), // JS-14 (P-44)
    terhubung: r.terhubung === 1,
    terputusSejak: r.terputus_sejak,
    posisi: r.posisi_json ? (JSON.parse(r.posisi_json) as { x: number; y: number; arah: Arah }) : null,
    dikeluarkan: r.dikeluarkan === 1,
    gabungPada: r.gabung_pada,
  };
}

function lampiranKelas(ws: WebSocket): LampiranKelas | null {
  const l = ws.deserializeAttachment() as Partial<LampiranKelas> | null;
  return l && l.kelas === true && typeof l.asal === "string" ? (l as LampiranKelas) : null;
}

function tutupAman(ws: WebSocket, kode: number, alasan: string): void {
  try {
    ws.close(kode, alasan);
  } catch {
    // Sudah tertutup.
  }
}

/** Log galat terstruktur tanpa data pribadi (JS-22, P-2 sampai P-6, P-13); tersimpan di Workers Logs. */
function catatGalat(kode: string, rincian: Record<string, unknown>): void {
  console.error(JSON.stringify({ galat: kode, ...rincian }));
}
