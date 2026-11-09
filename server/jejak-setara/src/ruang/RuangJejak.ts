// Durable Object satu ruang (spesifikasi JS-03, bagian C sampai H; Architecture 7 dan 8.6).
// Pembungkus tipis di sekitar inti-ruang.ts: WebSocket Hibernation API, SQLite, satu alarm,
// pengatur waktu putaran dan kiriman, serta kiriman ke D1. Kelas biasa tanpa `cloudflare:workers`,
// agar Worker tetap bisa diimpor uji Node; komunikasi dari Worker lewat fetch internal.
import { skemaKelas, type PesanServerPemain } from "../../../../app/jejak-setara/inti/protokol";
import type { Arah, StatusRuang, WarnaTas } from "../../../../app/jejak-setara/inti/tipe";
import { TEKS } from "../../../../app/jejak-setara/teks";
import { kirimKeD1 } from "../db/ruang";
import type { Env } from "../env";
import { base64url, jawabGalat, jawabJson, sha256Hex } from "../keamanan";
import {
  alarm,
  buatKeadaan,
  KODE_TUTUP,
  pulihkanKeadaan,
  putaran,
  sambunganMasuk,
  sambunganPutus,
  tenggatBerikut,
  terimaHalo,
  terimaKelas,
  terimaPemain,
  type BarisKiriman,
  type DataRuang,
  type KeadaanRuang,
  type Keluaran,
  type PemainRuang,
  type Simpanan,
  type WaktuRuang,
} from "./inti-ruang";
import { PETA_KAMPUNG } from "./peta-kampung";
import { bacaPesanPemain, catatPelanggaran, sambunganBaru, type KeadaanSambungan } from "./sambungan";

interface Lampiran {
  sambunganId: string;
  pemainId: string | null;
  dibukaPada: number;
}

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
const JEDA_ULANG_KIRIMAN_MS = [30_000, 60_000, 120_000, 240_000, 480_000];
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
  };

  constructor(ctx: DurableObjectState, env: Env) {
    this.ctx = ctx;
    this.env = env;
    void ctx.blockConcurrencyWhile(async () => {
      this.siapkanTabel();
      this.pulihkan();
    });
  }

  // -------------------------------------------------------------------------------------------
  // Peristiwa runtime

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.headers.get("Upgrade")?.toLowerCase() === "websocket") return this.antre(() => this.terimaSambungan(request));
    if (url.pathname === "/inisialisasi" && request.method === "POST") return this.antre(() => this.inisialisasi(request));
    if (url.pathname === "/kelas" && request.method === "POST") return this.antre(() => this.pesanKelas(request));
    if (url.pathname === "/statistik") return jawabJson(this.ringkasanStatistik(), 200);
    if (url.pathname === "/putuskan" && request.method === "POST") return this.antre(() => this.putuskanSemua());
    return jawabGalat("BELUM_TERSEDIA", "Fitur ini belum tersedia.", 404);
  }

  async webSocketMessage(ws: WebSocket, pesan: string | ArrayBuffer): Promise<void> {
    await this.antre(() => this.tanganiPesan(ws, pesan));
  }

  async webSocketClose(ws: WebSocket, kode: number): Promise<void> {
    await this.antre(() => this.tanganiPutus(ws, kode));
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    await this.antre(() => this.tanganiPutus(ws, 1011));
  }

  async alarm(): Promise<void> {
    await this.antre(async () => {
      this.alarmTerpasang = null;
      if (this.kirimanGagal && Date.now() >= this.kirimanGagal.berikutnya) await this.kirimKiriman();
      const k = this.keadaan;
      if (k) await this.terapkan(alarm(k, Date.now(), this.antreanKosong()));
      else await this.pasangAlarm();
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
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS pemain (id TEXT PRIMARY KEY, hash_token TEXT NOT NULL UNIQUE, urutan INTEGER NOT NULL, nama TEXT, " +
        "avatar INTEGER, warna_tas TEXT, nomor_absen INTEGER, saran_json TEXT NOT NULL, terhubung INTEGER NOT NULL, terputus_sejak INTEGER, " +
        "posisi_json TEXT, dikeluarkan INTEGER NOT NULL DEFAULT 0, gabung_pada INTEGER NOT NULL)",
    );
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS kiriman (id INTEGER PRIMARY KEY AUTOINCREMENT, jenis TEXT NOT NULL, isi_json TEXT NOT NULL, dibuat_pada INTEGER NOT NULL)",
    );
  }

  private pulihkan(): void {
    const meta = new Map<string, unknown>();
    for (const r of this.sql.exec<{ kunci: string; nilai: string }>("SELECT kunci, nilai FROM meta").toArray()) meta.set(r.kunci, JSON.parse(r.nilai));
    const ruang = meta.get("ruang") as DataRuang | undefined;
    if (!ruang) return;
    const pemain = this.sql.exec<BarisPemainSql>("SELECT * FROM pemain").toArray().map(barisKePemain);
    const sekarang = Date.now();
    const sambungan: { sambunganId: string; pemainId: string | null; dibukaPada?: number }[] = [];
    for (const ws of this.ctx.getWebSockets("pemain")) {
      const l = ws.deserializeAttachment() as Lampiran | null;
      if (!l) continue;
      this.soket.set(l.sambunganId, ws);
      this.batas.set(l.sambunganId, sambunganBaru(sekarang));
      sambungan.push({ sambunganId: l.sambunganId, pemainId: l.pemainId, dibukaPada: l.dibukaPada });
    }
    this.keadaan = pulihkanKeadaan(
      {
        ruang,
        status: (meta.get("status") as StatusRuang | undefined) ?? "lobi",
        waktu: (meta.get("waktu") as WaktuRuang | undefined) ?? { ...WAKTU_AWAL },
        terkunci: (meta.get("terkunci") as boolean | undefined) ?? false,
        ditutupPada: (meta.get("ditutupPada") as number | undefined) ?? null,
        sambunganTerakhirPutus: (meta.get("sambunganTerakhirPutus") as number | undefined) ?? null,
        pemain,
        sambungan,
      },
      PETA_KAMPUNG,
      sekarang,
    );
    if (this.keadaan.status === "main") this.mulaiPutaran();
    if (!this.antreanKosong()) this.jadwalkanKiriman();
  }

  private catatTulis(jumlah: number): void {
    this.statistik.barisDitulis += jumlah;
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
    if (s.jenis === "hapus_pemain") {
      this.catatTulis(this.sql.exec("DELETE FROM pemain WHERE id = ?", s.id).rowsWritten);
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
      JSON.stringify(p.saran),
      p.terhubung ? 1 : 0,
      p.terputusSejak,
      p.posisi ? JSON.stringify(p.posisi) : null,
      p.dikeluarkan ? 1 : 0,
      p.gabungPada,
    );
    this.catatTulis(c.rowsWritten);
  }

  private antreanKosong(): boolean {
    return this.sql.exec<{ n: number }>("SELECT COUNT(*) AS n FROM kiriman").one().n === 0;
  }

  // -------------------------------------------------------------------------------------------
  // Permintaan internal dari Worker

  private async inisialisasi(request: Request): Promise<Response> {
    if (this.keadaan) return jawabJson({ ok: true }, 200);
    const data = (await request.json()) as DataRuang;
    this.keadaan = buatKeadaan(data, PETA_KAMPUNG);
    this.tulisMeta("ruang", data);
    this.tulisMeta("status", this.keadaan.status);
    this.tulisMeta("waktu", this.keadaan.waktu);
    await this.pasangAlarm();
    return jawabJson({ ok: true }, 200);
  }

  private async pesanKelas(request: Request): Promise<Response> {
    const k = this.keadaan;
    if (!k) return jawabGalat("RUANG_TIDAK_ADA", TEKS.api.RUANG_TIDAK_ADA, 404);
    let data: unknown = null;
    try {
      data = await request.json();
    } catch {
      data = null;
    }
    const hasil = skemaKelas.safeParse(data);
    if (!hasil.success || hasil.data.t === "halo") return jawabGalat("PESAN_SALAH", TEKS.api.PESAN_SALAH, 400);
    await this.terapkan(terimaKelas(k, hasil.data, Date.now()));
    // Status ruang sesudah pesan; pesan yang tidak berlaku di status sekarang tidak mengubah apa pun (JS-07, P-54).
    return jawabJson({ ok: true, status: this.keadaan?.status ?? "ditutup" }, 200);
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

  private ringkasanStatistik() {
    return {
      ...this.statistik,
      status: this.keadaan?.status ?? null,
      pemain: this.keadaan?.pemain.size ?? 0,
      sambungan: this.ctx.getWebSockets("pemain").length,
      antreanKiriman: this.sql.exec<{ n: number }>("SELECT COUNT(*) AS n FROM kiriman").one().n,
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
      if (c.kirimGalat) this.kirimSoket(ws, { v: 1, t: "galat", kode: "TERLALU_CEPAT", pesan: TEKS.galat.TERLALU_CEPAT });
      if (c.tutup) {
        this.tutupSoket(sid, KODE_TUTUP.pelanggaran, "pelanggaran");
        await this.terapkan(sambunganPutus(k, sid, sekarang));
      }
      return;
    }
    if (hasil.jenis === "versi") {
      this.kirimSoket(ws, { v: 1, t: "galat", kode: "VERSI_BERBEDA", pesan: TEKS.galat.VERSI_BERBEDA });
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
  // Menjalankan keluaran inti ruang

  private async terapkan(o: Keluaran): Promise<void> {
    for (const s of o.simpan) this.tulisSimpanan(s);
    for (const { sambunganId, pemainId } of o.ikat) {
      const ws = this.cariSoket(sambunganId);
      const l = ws?.deserializeAttachment() as Lampiran | null | undefined;
      if (ws && l) ws.serializeAttachment({ ...l, pemainId } satisfies Lampiran);
    }
    for (const { sambunganId, pesan } of o.kirim) {
      const ws = this.cariSoket(sambunganId);
      if (ws) this.kirimSoket(ws, pesan);
    }
    for (const t of o.tutup) this.tutupSoket(t.sambunganId, t.kode, t.alasan);
    if (o.kiriman.length > 0) this.antrekanKiriman(o.kiriman);
    this.statistik.koreksi += o.koreksi;
    this.statistik.duniaLobi += o.duniaLobi;
    if (o.alasanKoreksi) this.statistik.koreksiAlasan[o.alasanKoreksi] = (this.statistik.koreksiAlasan[o.alasanKoreksi] ?? 0) + 1;
    if (o.putaran === "mulai") this.mulaiPutaran();
    else if (o.putaran === "henti") this.hentiPutaran();
    if (o.kirimSekarang) await this.kirimKiriman();
    if (o.hapusSemua) {
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
    const k = this.keadaan;
    const calon: number[] = [];
    if (k) {
      const t = tenggatBerikut(k, this.antreanKosong());
      if (t !== null) calon.push(t);
    }
    if (this.kirimanGagal) calon.push(this.kirimanGagal.berikutnya);
    const tenggat = calon.length > 0 ? Math.min(...calon) : null;
    if (tenggat === this.alarmTerpasang) return;
    if (tenggat === null) await this.ctx.storage.deleteAlarm();
    else await this.ctx.storage.setAlarm(tenggat);
    this.alarmTerpasang = tenggat;
  }

  // -------------------------------------------------------------------------------------------
  // Kiriman ke D1 (P-47)

  private antrekanKiriman(baris: readonly BarisKiriman[]): void {
    const sekarang = Date.now();
    for (const b of baris) {
      const c = this.sql.exec("INSERT INTO kiriman (jenis, isi_json, dibuat_pada) VALUES (?, ?, ?)", b.jenis, JSON.stringify(b.isi), sekarang);
      this.catatTulis(c.rowsWritten);
    }
    this.jadwalkanKiriman();
  }

  private jadwalkanKiriman(): void {
    if (this.pewaktuKiriman || this.kirimanGagal) return;
    this.pewaktuKiriman = setTimeout(() => {
      this.pewaktuKiriman = null;
      void this.antre(async () => {
        await this.kirimKiriman();
        await this.pasangAlarm();
      });
    }, JEDA_KIRIMAN_MS);
  }

  private async kirimKiriman(): Promise<void> {
    if (this.pewaktuKiriman) clearTimeout(this.pewaktuKiriman);
    this.pewaktuKiriman = null;
    const baris = this.sql.exec<{ id: number; jenis: string; isi_json: string }>("SELECT id, jenis, isi_json FROM kiriman ORDER BY id").toArray();
    if (baris.length === 0) {
      this.kirimanGagal = null;
      return;
    }
    const terakhir = new Map<string, BarisKiriman>();
    for (const b of baris) {
      const kiriman = { jenis: b.jenis, isi: JSON.parse(b.isi_json) } as BarisKiriman;
      const kunci = kiriman.jenis === "peserta" ? `peserta:${kiriman.isi.id}` : `ruang:${kiriman.isi.ruangId}`;
      terakhir.delete(kunci);
      terakhir.set(kunci, kiriman);
    }
    try {
      await kirimKeD1(this.env.DB, [...terakhir.values()]);
      const c = this.sql.exec("DELETE FROM kiriman WHERE id <= ?", baris[baris.length - 1].id);
      this.catatTulis(c.rowsWritten);
      this.kirimanGagal = null;
    } catch {
      const percobaan = (this.kirimanGagal?.percobaan ?? 0) + 1;
      this.kirimanGagal = { percobaan, berikutnya: Date.now() + JEDA_ULANG_KIRIMAN_MS[Math.min(percobaan, JEDA_ULANG_KIRIMAN_MS.length) - 1] };
    }
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
    saran: JSON.parse(r.saran_json) as string[],
    terhubung: r.terhubung === 1,
    terputusSejak: r.terputus_sejak,
    posisi: r.posisi_json ? (JSON.parse(r.posisi_json) as { x: number; y: number; arah: Arah }) : null,
    dikeluarkan: r.dikeluarkan === 1,
    gabungPada: r.gabung_pada,
  };
}
