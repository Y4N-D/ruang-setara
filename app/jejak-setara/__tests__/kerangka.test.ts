// Uji unit kerangka Jejak Setara (spesifikasi JS-01, Rencana uji bagian "Uji unit"). Berjalan di Node, tanpa runtime Workers.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import worker from "../../../server/jejak-setara/src/index";
import { PROTOKOL_VERSI } from "../inti/protokol";
import { TEKS } from "../teks";
import { TEKS_KONSOL } from "../teks-konsol";

const AKAR = new URL("../../../", import.meta.url);
// Akhir baris dinormalkan, agar uji tetap lulus di salinan Windows.
const baca = (jalur: string) => readFileSync(new URL(jalur, AKAR), "utf8").replace(/\r\n/g, "\n");

const TAJUK_JSON: Record<string, string> = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "same-origin",
  "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
};

let diteruskan: Request[] = [];
const env = {
  LINGKUNGAN: "lokal",
  ASSETS: {
    fetch: async (permintaan: Request) => {
      diteruskan.push(permintaan);
      return new Response("aset", { status: 200, headers: { "x-uji": "aset" } });
    },
  },
} as unknown as Parameters<typeof worker.fetch>[1];

const minta = (jalur: string, init?: RequestInit) => worker.fetch(new Request("http://127.0.0.1" + jalur, init), env);

function periksaTajukJson(jawaban: Response) {
  for (const [nama, nilai] of Object.entries(TAJUK_JSON)) expect(jawaban.headers.get(nama), nama).toBe(nilai);
}

describe("Worker kerangka", () => {
  it("GET /api/sehat menjawab 200 dengan versi protokol dan lingkungan (AC-3)", async () => {
    const jawaban = await minta("/api/sehat");
    expect(jawaban.status).toBe(200);
    periksaTajukJson(jawaban);
    expect(await jawaban.text()).toBe(`{"ok":true,"protokol":${PROTOKOL_VERSI},"lingkungan":"lokal"}`);
  });

  it.each(["POST", "PUT", "DELETE"])("%s /api/sehat menjawab 405 dengan Allow: GET (AC-4)", async (metode) => {
    const jawaban = await minta("/api/sehat", { method: metode });
    expect(jawaban.status).toBe(405);
    expect(jawaban.headers.get("allow")).toBe("GET");
    periksaTajukJson(jawaban);
    expect(await jawaban.json()).toEqual({ galat: { kode: "METODE_TIDAK_DIDUKUNG", pesan: "Metode ini tidak didukung." } });
  });

  it.each([
    ["/api/bank", {}],
    ["/api/", {}],
    ["/api/sehat/lagi", {}],
    ["/ws/lain", {}],
  ] as const)("%s %j menjawab 404 BELUM_TERSEDIA (AC-4)", async (jalur, init) => {
    const jawaban = await minta(jalur, init as RequestInit);
    expect(jawaban.status).toBe(404);
    periksaTajukJson(jawaban);
    expect(await jawaban.json()).toEqual({ galat: { kode: "BELUM_TERSEDIA", pesan: "Fitur ini belum tersedia." } });
  });

  it("JS-03: /ws/ruang tanpa Upgrade 426, tanpa Origin 403; kode tidak sah 404 tanpa menyentuh D1", async () => {
    const tanpaUpgrade = await minta("/ws/ruang/K7MPA");
    expect(tanpaUpgrade.status).toBe(426);
    periksaTajukJson(tanpaUpgrade);
    expect(await tanpaUpgrade.json()).toEqual({ galat: { kode: "PERLU_WEBSOCKET", pesan: "Alamat ini hanya untuk sambungan permainan." } });
    const tanpaAsal = await minta("/ws/ruang/K7MPA", { headers: { Upgrade: "websocket" } });
    expect(tanpaAsal.status).toBe(403);
    expect(await tanpaAsal.json()).toEqual({ galat: { kode: "ASAL_DITOLAK", pesan: "Permintaan ditolak." } });
    for (const jalur of ["/api/publik/ruang/K7MP0", "/api/publik/ruang/%E0%A4%A", "/api/publik/ruang/K7MPAA"]) {
      const jawaban = await minta(jalur);
      expect(jawaban.status, jalur).toBe(404);
      expect(await jawaban.json()).toEqual({ galat: { kode: "RUANG_TIDAK_ADA", pesan: "Kode ruang tidak ditemukan. Periksa lagi kodenya." } });
    }
  });

  it("JS-10 (P-32): ruang coba dan kait lamanya 404 di semua lingkungan, tanpa menyentuh D1", async () => {
    for (const lingkungan of ["lokal", "uji", "produksi"]) {
      for (const jalur of ["/api/ruang-coba", "/api/ruang-coba/K7MPA/kelas", "/api/ruang-coba/K7MPA/statistik"]) {
        const j = await worker.fetch(new Request(`http://127.0.0.1${jalur}`, { method: "POST", headers: { "X-Jejak-Kunci-Coba": "kunci" }, body: "{}" }), {
          ...env,
          LINGKUNGAN: lingkungan,
        } as typeof env);
        expect(j.status, `${jalur} ${lingkungan}`).toBe(404);
        expect(await j.json()).toEqual({ galat: { kode: "BELUM_TERSEDIA", pesan: "Fitur ini belum tersedia." } });
      }
    }
  });

  it("JS-10 (P-32): kait uji baru /api/uji/ruang/{KODE}/… hanya di lokal; 404 di uji dan produksi tanpa menyentuh D1", async () => {
    for (const [jalur, metode] of [
      ["statistik", "GET"],
      ["putuskan", "POST"],
      ["kejadian", "GET"],
      ["pindahkan", "POST"],
    ] as const) {
      for (const lingkungan of ["uji", "produksi"]) {
        const j = await worker.fetch(new Request(`http://127.0.0.1/api/uji/ruang/K7MPA/${jalur}`, { method: metode, ...(metode === "POST" ? { body: "{}" } : {}) }), {
          ...env,
          LINGKUNGAN: lingkungan,
        } as typeof env);
        expect(j.status, `${jalur} ${lingkungan}`).toBe(404);
      }
    }
  });

  it("JS-10 (P-13): /ws/kelas tanpa Upgrade 426, Origin asing 403, tiket tidak sah 403, dan id bukan UUID 404, tanpa menyentuh D1", async () => {
    const envTiket = { ...env, KUNCI_TIKET: "kunci-tiket-uji" } as typeof env;
    const id = "0b2f6a9e-1c3d-4e5f-8a7b-9c0d1e2f3a4b";
    const tanpaUpgrade = await worker.fetch(new Request(`http://127.0.0.1/ws/kelas/${id}?tiket=x`), envTiket);
    expect(tanpaUpgrade.status).toBe(426);
    const asing = await worker.fetch(new Request(`http://127.0.0.1/ws/kelas/${id}?tiket=x`, { headers: { Upgrade: "websocket", Origin: "https://contoh.test" } }), envTiket);
    expect(asing.status).toBe(403);
    const asal = { Upgrade: "websocket", Origin: "http://127.0.0.1" };
    const tiketSalah = await worker.fetch(new Request(`http://127.0.0.1/ws/kelas/${id}?tiket=x.y`, { headers: asal }), envTiket);
    expect(tiketSalah.status).toBe(403);
    expect(await tiketSalah.json()).toEqual({ galat: { kode: "TIKET_DITOLAK", pesan: "Tiket layar kelas ditolak." } });
    const bukanUuid = await worker.fetch(new Request("http://127.0.0.1/ws/kelas/bukan-uuid?tiket=x.y", { headers: asal }), envTiket);
    expect(bukanUuid.status).toBe(404);
  });

  it("jalur lain diteruskan ke ASSETS dan jawabannya dikembalikan apa adanya", async () => {
    for (const jalur of ["/", "/admin/", "/tidak-ada"]) {
      diteruskan = [];
      const jawaban = await minta(jalur);
      expect(diteruskan).toHaveLength(1);
      expect(new URL(diteruskan[0].url).pathname).toBe(jalur);
      expect(jawaban.headers.get("x-uji")).toBe("aset");
      expect(await jawaban.text()).toBe("aset");
    }
  });

  it("PROTOKOL_VERSI bernilai 2 (JS-08) dan sama dengan protokol jawaban Worker", async () => {
    expect(PROTOKOL_VERSI).toBe(2);
    const isi = (await (await minta("/api/sehat")).json()) as { protokol: number };
    expect(isi.protokol).toBe(PROTOKOL_VERSI);
  });
});

describe("Teks dan halaman", () => {
  it("TEKS sama persis dengan tabel Teks yang tampil (final), spesifikasi JS-01, JS-03, JS-07, dan JS-08 (tanpa konsolJudul dan konsolIsi sejak JS-04)", () => {
    expect(TEKS).not.toHaveProperty("konsolJudul");
    expect(TEKS).not.toHaveProperty("konsolIsi");
    expect(tanpaKunci(TEKS, [...KUNCI_JS22_PEMAIN, ...kunciJs12().pemain, ...Object.keys(kunciJs11().pemain), ...Object.keys(kunciJs09().pemain)])).toEqual({
      judulTabPemain: "Jejak Setara",
      judulTabKonsol: "Konsol admin · Jejak Setara",
      judul: "Jejak Setara",
      serverMemeriksa: "Memeriksa server…",
      serverSiap: "Server siap",
      serverBelum: "Server belum tersambung",
      tandaSiap: "✓",
      tandaBelum: "!",
      kode: {
        label: "Kode ruang",
        petunjuk: "Ketik 5 huruf atau angka dari layar guru.",
        tombol: "Masuk",
        memeriksa: "Memeriksa kode…",
        galatFormat: "Kode berisi 5 huruf atau angka.",
        galatJaringan: "Tidak bisa menghubungi server. Periksa wifi atau data selulermu.",
        galatTerlaluSering: "Terlalu banyak percobaan. Tunggu sebentar.",
      },
      absen: {
        judul: "Nomor absen",
        label: "Nomor absenmu",
        petunjuk: "Isi nomor absen dari daftar kelas (1–50).",
        tombol: "Lanjut",
        galatRentang: "Nomor absen harus 1 sampai 50.",
      },
      menghubungkan: "Menghubungkan ke ruang…",
      identitas: {
        judul: "Pilih nama dan avatar",
        kelompokNama: "Nama samaran",
        acak: "Acak ulang",
        kelompokAvatar: "Avatar",
        avatar: "Avatar {n}",
        gabung: "Gabung",
      },
      lobi: {
        judul: "Lobi",
        labelKode: "Kode ruang",
        jumlah: "{n} pemain di ruang",
        menunggu: "Menunggu guru memulai…",
        saran: "Jangan tutup tab ini.",
      },
      ronde: {
        bersiap: "Bersiap",
        berjalan: "Ronde berjalan",
        sisaWaktu: "Sisa waktu",
        dijeda: "Dijeda oleh guru",
        selesai: "Ronde selesai",
        selesaiIsi: "Tunggu arahan guru.",
        ditutup: "Ruang ditutup",
        ditutupIsi: "Terima kasih sudah bermain.",
        skorAkhir: "Skormu {skor}",
        peringkatAkhir: "Peringkat {n} dari {jumlah}",
        tanpaSkor: "Belum ada kejadian yang kamu jawab di ronde ini.",
      },
      menyambung: {
        judul: "Menyambung ulang…",
        lama: "Periksa wifi atau data selulermu.",
      },
      dunia: {
        label: "Dunia permainan. Gerakkan avatar dengan W, A, S, D atau tombol panah.",
        layarPenuh: "Layar penuh",
        putarHp: "Putar HP ke posisi mendatar",
        duaMenit: "Dua menit lagi",
        jamCerita: "Jam cerita {jam}",
        sisaWaktu: "Sisa waktu {waktu}",
        masa: { pagi: "Pagi", siang: "Siang", sore: "Sore" },
        fps: "{fps} fps · p95 ≤ {kelompok} ms",
      },
      peta: {
        bukaBesar: "Buka peta besar",
        judul: "Peta kampung",
        tutup: "Tutup peta",
        kamuDiSini: "Kamu di sini",
        halte: "Halte",
        ringkasanKejadian: "Kejadian terlihat {n}, selesai {m}.",
      },
      tombol: { kembali: "Kembali", muatUlang: "Muat ulang" },
      kejadian: { periksa: "Periksa", periksaLabel: "Periksa kejadian", periksaJauh: "Periksa. Dekati penanda kejadian dulu." },
      dialog: {
        langkah: "Langkah {n} dari 2",
        tutup: "Tutup",
        kunci: "Kunci jawaban",
        lihatPilihan: "Lihat pilihan",
        situasi: "Situasi",
        lanjutLangkah2: "Lanjut ke Langkah 2",
        lanjutMenjelajah: "Lanjut menjelajah",
        jawabanTepat: "Jawaban tepat",
        pilihanmu: "Pilihanmu",
        tepat: "Tepat",
        belumTepat: "Belum tepat",
        poin: "+{poin}",
      },
      kartu: {
        tingkat: { tepat: "Tepat", kurang: "Kurang tepat", berisiko: "Berisiko" },
        terjadi: "Yang terjadi",
        hak: "Hak yang terdampak",
        kewajiban: "Kewajiban terkait",
        pilihanTepat: "Pilihan yang tepat",
        rujukan: "Rujukan",
        rujukanUji: "Rujukan di ruang uji belum tentu sudah diverifikasi Peninjau.",
      },
      skor: { label: "Skor {skor}, peringkat {n}", labelTanpaPeringkat: "Skor {skor}, belum ada peringkat" },
      pengumuman: {
        lobi: "Kamu sudah masuk lobi.",
        mulai: "Ronde dimulai.",
        jeda: "Ronde dijeda.",
        lanjut: "Ronde dilanjutkan.",
        selesai: "Ronde selesai.",
        menyambung: "Menyambung ulang.",
        tersambung: "Tersambung kembali.",
        terlihat: "Kejadian baru terlihat.",
        dekat: "Kejadian di dekatmu. Tekan E atau tombol Periksa.",
        langkah1Tepat: "Langkah 1 tepat. Tambah 40 poin.",
        langkah1Belum: "Langkah 1 belum tepat.",
        kartu: "Kartu dampak: {tingkat}.",
        tambahPoin: "Tambah {poin} poin.",
      },
      galat: {
        RUANG_TIDAK_ADA: "Kode ruang tidak ditemukan. Periksa lagi kodenya.",
        RUANG_PENUH: "Ruang sudah penuh. Beri tahu gurumu.",
        RUANG_TERKUNCI: "Ruang sudah dikunci guru.",
        TERLAMBAT: "Ronde sudah berjalan terlalu lama untuk bergabung.",
        NAMA_DIPAKAI: "Nama itu baru saja dipakai pemain lain. Pilih nama lain.",
        VERSI_BERBEDA: "Ada pembaruan. Muat ulang halaman.",
        TERLALU_CEPAT: "Pesan terlalu cepat.",
        DIKELUARKAN: "Kamu dikeluarkan dari ruang oleh guru.",
        BUKAN_JANGKAUAN: "Terlalu jauh dari kejadian.",
        NOMOR_ABSEN_DIPAKAI: "Nomor absen ini sudah dipakai di ruang ini. Periksa lagi nomormu.",
      },
      api: {
        KUNCI_SALAH: "Kunci ruang coba tidak cocok.",
        PENGATURAN_SALAH: "Pengaturan ruang tidak sah.",
        PENGATURAN_ABSEN: "Mode nomor absen hanya untuk ruang sampai 50 pemain.",
        KODE_HABIS: "Gagal membuat kode ruang. Coba lagi.",
        RUANG_GAGAL: "Ruang gagal dibuat. Coba lagi.",
        PERLU_WEBSOCKET: "Alamat ini hanya untuk sambungan permainan.",
        ASAL_DITOLAK: "Permintaan ditolak.",
        PESAN_SALAH: "Pesan tidak sah.",
        TERLALU_SERING: "Terlalu banyak percobaan. Tunggu sebentar.",
        RUANG_TIDAK_ADA: "Kode ruang tidak ditemukan. Periksa lagi kodenya.",
      },
    });
  });

  it("JS-12: TEKS_KONSOL dan TEKS memuat tepat teks bagian Teks yang tampil (final) spesifikasi JS-12 (AC-16)", () => {
    const { konsol, pemain, teks } = kunciJs12();
    expect(konsol.length).toBeGreaterThan(150);
    const datarKonsol = ratakanTeks(TEKS_KONSOL);
    const datarPemain = ratakanTeks(TEKS);
    for (const k of konsol) expect(datarKonsol[k], k).toBe(teks[k]);
    for (const k of pemain) expect(datarPemain[k], k).toBe(teks[k]);
    for (const grup of ["bank", "daftar", "sunting", "aksi", "riwayat", "pratinjau", "pustaka", "paket", "temuan"]) {
      const ada = Object.keys(datarKonsol).filter((k) => k.startsWith(`${grup}.`));
      expect(ada.sort(), grup).toEqual(konsol.filter((k) => k.startsWith(`${grup}.`)).sort());
    }
  });

  it("JS-22: TEKS dan TEKS_KONSOL memuat tepat teks bagian Teks yang tampil (final) spesifikasi JS-22 (AC-17)", () => {
    const isi = baca("docs/jejak-setara/specs/JS-22-biaya.md");
    const bagian = isi.slice(isi.indexOf("## Teks yang tampil (final)"));
    const pemain = uraiTabelTeks(bagian.slice(0, bagian.indexOf("**Konsol**")) + "\n## ");
    const konsol = uraiTabelTeks("## Teks yang tampil (final)\n" + bagian.slice(bagian.indexOf("**Konsol**")));
    expect(Object.keys(pemain).sort()).toEqual([...KUNCI_JS22_PEMAIN].sort());
    expect(Object.keys(konsol).sort()).toEqual([...KUNCI_JS22_KONSOL].sort());
    const datarPemain = ratakanTeks(TEKS);
    const datarKonsol = ratakanTeks(TEKS_KONSOL);
    for (const [k, t] of Object.entries(pemain)) expect(datarPemain[k], k).toBe(t);
    for (const [k, t] of Object.entries(konsol)) expect(datarKonsol[k], k).toBe(t);
  });

  it("JS-10: TEKS_KONSOL memuat tepat teks bagian Teks yang tampil (final) spesifikasi JS-10 (AC-25), dengan teks JS-10 yang diubah JS-11", () => {
    const js11 = kunciJs11();
    // JS-11 (AC-21): tabel "Teks JS-10 yang berubah" menggantikan baris yang sama di spesifikasi JS-10.
    const harapan = { ...uraiTabelTeks(baca("docs/jejak-setara/specs/JS-10-kelas.md")), ...js11.js10 };
    expect(Object.keys(harapan).length).toBeGreaterThan(150);
    const datar = ratakanTeks(TEKS_KONSOL);
    for (const [kunci, teks] of Object.entries(harapan)) expect(datar[kunci], kunci).toBe(teks);
    const kunciJs10 = Object.keys(datar).filter(
      (k) => KUNCI_JS10.some((awal) => k === awal || k.startsWith(`${awal}.`)) && !KUNCI_JS22_KONSOL.includes(k) && !(k in js11.konsol),
    );
    expect(kunciJs10.sort()).toEqual(Object.keys(harapan).sort());
  });

  it("JS-09: TEKS.skill, TEKS_KONSOL.skill, dan TEKS_KONSOL.csv.petunjuk sama persis dengan bagian Teks yang tampil (final) spesifikasi JS-09 (AC-21)", () => {
    const { pemain, konsol, csv } = kunciJs09();
    expect(Object.keys(pemain)).toHaveLength(21);
    expect(Object.keys(konsol)).toHaveLength(6);
    expect(Object.keys(csv)).toEqual(["csv.petunjuk"]);
    const datarPemain = ratakanTeks(TEKS);
    const datarKonsol = ratakanTeks(TEKS_KONSOL);
    for (const [k, t] of Object.entries(pemain)) expect(datarPemain[k], k).toBe(t);
    for (const [k, t] of Object.entries({ ...konsol, ...csv })) expect(datarKonsol[k], k).toBe(t);
    // Kelompok skill tidak memuat kunci di luar spesifikasi.
    expect(Object.keys(datarPemain).filter((k) => k.startsWith("skill.")).sort()).toEqual(Object.keys(pemain).sort());
    expect(Object.keys(datarKonsol).filter((k) => k.startsWith("skill.")).sort()).toEqual(Object.keys(konsol).sort());
  });

  it("JS-11: TEKS dan TEKS_KONSOL memuat tepat teks bagian Teks yang tampil (final) spesifikasi JS-11 (AC-21)", () => {
    const { pemain, konsol, csv, js10 } = kunciJs11();
    expect(Object.keys(pemain)).toHaveLength(12);
    expect(Object.keys(konsol).length).toBeGreaterThan(100);
    expect(Object.keys(csv)).toHaveLength(35);
    expect(Object.keys(js10).sort()).toEqual(["kelas.jawabanTepat", "kelas.selesaiJumlah"]);
    const datarPemain = ratakanTeks(TEKS);
    const datarKonsol = ratakanTeks(TEKS_KONSOL);
    for (const [k, t] of Object.entries(pemain)) expect(datarPemain[k], k).toBe(t);
    for (const [k, t] of Object.entries({ ...konsol, ...csv, ...js10 })) expect(datarKonsol[k], k).toBe(t);
    // Kelompok baru JS-11 tidak memuat kunci di luar spesifikasi.
    expect(Object.keys(datarPemain).filter((k) => k.startsWith("rekap.")).sort()).toEqual(Object.keys(pemain).sort());
    const js09 = kunciJs09();
    for (const grup of ["riwayatRuang", "hasil", "csv"]) {
      const ada = Object.keys(datarKonsol).filter((k) => k.startsWith(`${grup}.`) && !(k in js09.csv));
      expect(ada.sort(), grup).toEqual(Object.keys({ ...konsol, ...csv }).filter((k) => k.startsWith(`${grup}.`)).sort());
    }
  });

  it("JS-13: TEKS_KONSOL memuat tepat teks bagian Teks yang tampil (final) spesifikasi JS-13 (AC-14)", () => {
    const js13 = kunciJs13();
    expect(Object.keys(js13)).toHaveLength(79);
    const datar = ratakanTeks(TEKS_KONSOL);
    for (const [kunci, teks] of Object.entries(js13)) expect(datar[kunci], kunci).toBe(teks);
    // Kelompok baru statistik tidak memuat kunci di luar spesifikasi.
    expect(Object.keys(datar).filter((x) => x.startsWith("statistik.")).sort()).toEqual(Object.keys(js13).filter((x) => x.startsWith("statistik.")).sort());
  });

  it("JS-04: TEKS_KONSOL sama persis dengan bagian Teks yang tampil (final) spesifikasi JS-04 (P-51), di luar teks JS-10", () => {
    const js11 = kunciJs11();
    const js09 = kunciJs09();
    expect(
      tanpaKunci(tanpaKunciJs10(TEKS_KONSOL) as object, [
        ...KUNCI_JS22_KONSOL,
        ...kunciJs12().konsol,
        ...Object.keys(js11.konsol),
        ...Object.keys(js11.csv),
        ...Object.keys(js09.konsol),
        ...Object.keys(js09.csv),
        ...Object.keys(kunciJs13()),
      ]),
    ).toEqual({
      merek: "Jejak Setara",
      subjudul: "Konsol guru dan admin",
      memuat: "Memuat konsol…",
      serverTidakMenjawab: "Server belum tersambung. Periksa internet, lalu muat ulang halaman.",
      muatUlang: "Muat ulang",
      peran: {
        admin: "Admin",
        guru: "Guru",
      },
      pengguna: "{nama} · {peran}",
      keluar: "Keluar",
      menu: {
        label: "Menu konsol",
        tombol: "Menu",
        dasbor: "Dasbor",
        akun: "Akun",
        sandi: "Sandi saya",
      },
      sesiBerakhir: "Sesi berakhir. Silakan masuk lagi.",
      hanyaAdmin: "Halaman ini hanya untuk admin.",
      keDasbor: "Ke dasbor",
      tampilkan: "Tampilkan",
      sembunyikan: "Sembunyikan",
      batal: "Batal",
      masuk: {
        email: "Email",
        sandi: "Sandi",
        tombol: "Masuk",
        memeriksa: "Memeriksa…",
        isiKosong: "Isi email dan sandi.",
        kreditAset: "Aset visual digambar dengan kode oleh Claude (Anthropic) berdasarkan arahan dan persetujuan YAN.",
        kreditHuruf: "Huruf Press Start 2P dan Pixelify Sans, SIL Open Font License 1.1.",
      },
      sandi: {
        judulWajib: "Buat sandi baru",
        penjelasanWajib: "Anda masuk dengan sandi sementara. Buat sandi baru sebelum memakai konsol.",
        judul: "Sandi saya",
        sekarang: "Sandi sekarang",
        baru: "Sandi baru",
        ulangi: "Ulangi sandi baru",
        petunjuk: "Minimal 12 karakter. Kalimat pendek yang mudah Anda ingat lebih kuat daripada kata acak yang pendek.",
        simpan: "Simpan sandi",
        menyimpan: "Menyimpan…",
        berhasil: "Sandi baru tersimpan.",
        berhasilLain: "Sandi baru tersimpan. Akun ini sudah dikeluarkan dari perangkat lain.",
        tidakSama: "Kedua sandi baru tidak sama.",
      },
      dasbor: {
        judul: "Dasbor",
        salam: "Selamat datang, {nama}.",
        peringatan: "Peringatan",
        rujukanBelum: "{n} rujukan belum diverifikasi. Kejadian belum bisa terbit sampai semua rujukannya diverifikasi Peninjau.",
        tanpaPeringatan: "Tidak ada peringatan.",
        ruang: "Ruang yang sedang berjalan",
        ruangKosong: "Belum ada ruang yang berjalan.",
        sesi: "Sesi terakhir",
        sesiKosong: "Belum ada sesi kelas.",
        memuat: "Memuat…",
        gagal: "Data dasbor gagal dimuat.",
        cobaLagi: "Coba lagi",
      },
      akun: {
        judul: "Akun",
        ringkasan: "{n} akun · {m} aktif",
        baru: "+ Akun baru",
        kolomNama: "Nama",
        kolomEmail: "Email",
        kolomPeran: "Peran",
        kolomStatus: "Status",
        kolomMasuk: "Masuk terakhir",
        peninjau: "Peninjau",
        aktif: "Aktif",
        nonaktif: "Nonaktif",
        belumGanti: "Belum ganti sandi",
        belumPernah: "Belum pernah",
        anda: "(Anda)",
        ubah: "Ubah",
        ubahLabel: "Ubah akun {nama}",
        gagal: "Daftar akun gagal dimuat.",
      },
      akunBaru: {
        judul: "Akun baru",
        email: "Email",
        nama: "Nama tampilan",
        namaPetunjuk: "Nama yang tampil di konsol, misalnya Bu Sari.",
        peran: "Peran",
        peninjau: "Peninjau (boleh menandai rujukan terverifikasi)",
        buat: "Buat akun",
        membuat: "Membuat…",
      },
      sementara: {
        judulBaru: "Akun baru dibuat",
        judulAturUlang: "Sandi diatur ulang",
        berhasilBaru: "Akun {nama} ({peran}) sudah dibuat.",
        berhasilAturUlang: "Sandi {nama} sudah diatur ulang.",
        label: "Sandi sementara",
        catatan: "Berikan sandi ini langsung kepada pemilik akun. Sandi hanya tampil sekali dan wajib diganti saat masuk pertama.",
        salin: "Salin sandi",
        tersalin: "Sandi disalin.",
        gagalSalin: "Sandi gagal disalin. Pilih teksnya, lalu salin manual.",
        selesai: "Selesai",
      },
      ubah: {
        judul: "Ubah akun {nama}",
        simpan: "Simpan perubahan",
        menyimpan: "Menyimpan…",
        diri: "Anda tidak bisa menurunkan peran, menonaktifkan, atau mengatur ulang sandi akun sendiri. Ganti sandi Anda lewat Sandi saya.",
        nonaktifkan: "Nonaktifkan akun",
        aktifkan: "Aktifkan akun",
        aturUlang: "Atur ulang sandi",
        tersimpan: "Perubahan tersimpan.",
        aktifLagi: "Akun {nama} aktif lagi.",
      },
      konfirmasi: {
        nonaktifJudul: "Nonaktifkan akun {nama}?",
        nonaktifIsi: "{nama} tidak bisa masuk lagi dan dikeluarkan dari semua perangkat. Akun bisa diaktifkan kembali kapan saja.",
        nonaktifTombol: "Nonaktifkan",
        aturUlangJudul: "Atur ulang sandi {nama}?",
        aturUlangIsi: "Sandi lama tidak berlaku lagi, dan {nama} dikeluarkan dari semua perangkat. Sandi sementara baru hanya tampil sekali.",
        aturUlangTombol: "Atur ulang sandi",
      },
      galat: {
        MASUK_SALAH: "Email atau sandi salah.",
        TERKUNCI: "Terlalu banyak percobaan masuk. Tunggu 15 menit, lalu coba lagi.",
        TERLALU_SERING: "Terlalu banyak percobaan. Tunggu sebentar.",
        PERLU_MASUK: "Silakan masuk dulu.",
        WAJIB_GANTI_SANDI: "Ganti sandi sementara dulu.",
        TIDAK_BERWENANG: "Anda tidak berwenang melakukan ini.",
        ASAL_DITOLAK: "Permintaan ditolak.",
        PERMINTAAN_SALAH: "Permintaan tidak sah.",
        KONSOL_BELUM_SIAP: "Konsol belum siap. Coba lagi beberapa menit lagi.",
        SANDI_LAMA_SALAH: "Sandi sekarang tidak cocok.",
        SANDI_PENDEK: "Sandi baru minimal 12 karakter.",
        SANDI_PANJANG: "Sandi baru paling banyak 128 karakter.",
        SANDI_SAMA_EMAIL: "Sandi baru tidak boleh sama dengan email.",
        SANDI_SAMA: "Sandi baru harus berbeda dari sandi sekarang.",
        EMAIL_SALAH: "Tulis email yang benar, misalnya nama@sekolah.sch.id.",
        EMAIL_DIPAKAI: "Email ini sudah dipakai akun lain.",
        NAMA_SALAH: "Nama tampilan harus 1 sampai 40 karakter.",
        AKUN_TIDAK_ADA: "Akun tidak ditemukan.",
        TIDAK_BOLEH_DIRI: "Anda tidak bisa menurunkan peran, menonaktifkan, atau mengatur ulang sandi akun sendiri.",
        ADMIN_TERAKHIR: "Harus ada sedikitnya satu admin aktif.",
        KUNCI_ADMIN_SALAH: "Kunci admin awal tidak cocok.",
        JARINGAN: "Gagal menghubungi server. Periksa internet, lalu coba lagi.",
        UMUM: "Terjadi kesalahan. Coba lagi.",
      },
      alurAdminAwal: {
        dibuat: "Akun admin dibuat.",
        dipulihkan: "Akun admin dipulihkan: sandi sementara baru berlaku, dan semua sesi lama sudah keluar.",
        alamat: "Alamat konsol: {alamat}/admin/",
        petunjuk: "Masuk dengan email di rahasia JEJAK_ADMIN_EMAIL dan sandi sementara di rahasia JEJAK_ADMIN_SANDI_SEMENTARA, lalu buat sandi baru.",
        rahasiaCloudflare: "Rahasia Cloudflare belum diisi (Architecture bagian 18, langkah 6).",
        rahasiaAdmin: "Rahasia JEJAK_ADMIN_EMAIL atau JEJAK_ADMIN_SANDI_SEMENTARA belum diisi (Architecture bagian 18, langkah 6).",
        emailSalah: "JEJAK_ADMIN_EMAIL bukan alamat email.",
        sandiSalah: "JEJAK_ADMIN_SANDI_SEMENTARA harus 12 sampai 128 karakter. Isi ulang rahasianya, lalu jalankan lagi.",
        namaSalah: "Nama tampilan harus 1 sampai 40 karakter.",
        belumSiap: "Konsol belum siap: kunci Worker belum dibuat. Jalankan ulang \"Jejak: uji\", lalu coba lagi.",
        gagal: "Akun admin gagal dibuat (status {status}).",
        kunciBaru: "Kunci Worker baru: {nama}.",
        kunciLengkap: "Kunci Worker sudah lengkap.",
      },
    });
  });

  it("JS-04: teks konsol tidak diimpor layar pemain (P-51, AC-19)", () => {
    const pemain = baca("app/jejak-setara/teks.ts");
    expect(pemain).not.toContain("TEKS_KONSOL =");
    expect(pemain).not.toMatch(/from "\.\/teks-konsol"/);
  });

  it.each([
    ["web/jejak-setara/index.html", TEKS.judulTabPemain, "../../app/jejak-setara/assets/ikon/ikon_jejak.png"],
    ["web/jejak-setara/admin/index.html", TEKS.judulTabKonsol, "../../../app/jejak-setara/assets/ikon/ikon_jejak.png"],
  ])("%s: lang id, judul tab, ikon ikon_jejak.png (I-17), dan skrip modul", (jalur, judul, ikon) => {
    const html = baca(jalur);
    expect(html).toContain('<html lang="id">');
    expect(html).toContain(`<title>${judul}</title>`);
    expect(html).toContain(`<link rel="icon" type="image/png" href="${ikon}" />`);
    expect(html).toContain('<script type="module" src="./main.tsx"></script>');
  });
});

const TOKEN_DASAR: Record<string, string> = {
  ink: "#1F2A44", dusk: "#3A4A6B", mist: "#C9D4E5", cream: "#FFF6E0", white: "#FFFFFF", sun: "#FFD23F",
  mango: "#FF9F1C", coral: "#FF6B5B", leaf: "#8AD95B", teal: "#2EC4B6", "sky-d": "#3A86D9", malam: "#4A4F9C",
};
/** JS-10: warna palet wood untuk balok podium ke-3 (Design System 3.6 dan 4); hanya di Jejak Setara. */
const TOKEN_JS10: Record<string, string> = { wood: "#C98B4F" };
const TOKEN_PERAN: Record<string, string> = {
  surface: "var(--js-cream)", text: "var(--js-ink)", "text-2": "var(--js-dusk)", focus: "var(--js-sun)",
  "tier-tepat": "var(--js-leaf)", "tier-kurang": "var(--js-mango)", "tier-berisiko": "var(--js-coral)",
  marker: "var(--js-sun)", "marker-selesai": "var(--js-leaf)", diri: "var(--js-sun)", kompas: "var(--js-teal)",
  "status-draf": "var(--js-mist)", "status-tinjau": "var(--js-sun)", "status-terbit": "var(--js-leaf)",
  "status-perhatian": "var(--js-mango)",
};

/** Token di blok :root pertama sebuah berkas CSS, untuk awalan tertentu. */
function tokenRoot(css: string, awalan: string): Record<string, string> {
  const mulai = css.indexOf(":root {");
  const blok = css.slice(mulai, css.indexOf("}", mulai));
  const hasil: Record<string, string> = {};
  for (const cocok of blok.matchAll(new RegExp(`--${awalan}-([a-z0-9-]+):\\s*([^;]+);`, "g"))) hasil[cocok[1]] = cocok[2].trim();
  return hasil;
}

describe("Token dan tajuk", () => {
  it("jejak.css memuat semua token Design System bagian 4 dengan nilai persis", () => {
    expect(tokenRoot(baca("app/jejak-setara/styles/jejak.css"), "js")).toEqual({ ...TOKEN_DASAR, ...TOKEN_JS10, ...TOKEN_PERAN });
  });

  it("token dasar sama dengan token --ss- Sehari Setara (malam hanya ada di Jejak Setara)", () => {
    const ss = tokenRoot(baca("app/sehari-setara/styles/game.css"), "ss");
    for (const [nama, nilai] of Object.entries(TOKEN_DASAR)) {
      if (nama === "malam") continue;
      expect(ss[nama], nama).toBe(nilai);
    }
  });

  it("_headers memberi keempat tajuk untuk /* (AC-8)", () => {
    expect(baca("web/jejak-setara/public/_headers")).toBe(
      "/*\n" +
        "  Content-Security-Policy: default-src 'self'; connect-src 'self'; img-src 'self' data: blob:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'\n" +
        "  X-Content-Type-Options: nosniff\n" +
        "  Referrer-Policy: same-origin\n" +
        "  Permissions-Policy: camera=(), microphone=(), geolocation=()\n",
    );
  });

  it("wrangler.jsonc persis spesifikasi JS-03 (bagian Konfigurasi) dan JS-04 (P-33, dengan ITERASI_SANDI 4000 sejak penutupan JS-04), dengan Database ID uji yang sudah diisi", () => {
    expect(JSON.parse(baca("server/jejak-setara/wrangler.jsonc"))).toEqual({
      "$schema": "../../node_modules/wrangler/config-schema.json",
      "name": "jejak-setara-lokal",
      "main": "src/index.ts",
      "compatibility_date": "2026-05-15",
      "assets": { "binding": "ASSETS", "run_worker_first": ["/api/*", "/ws/*"] },
      "durable_objects": { "bindings": [{ "name": "RUANG", "class_name": "RuangJejak" }] },
      "migrations": [{ "tag": "v1", "new_sqlite_classes": ["RuangJejak"] }],
      "d1_databases": [{ "binding": "DB", "database_name": "jejak-setara-lokal", "database_id": "00000000-0000-4000-8000-000000000000", "migrations_dir": "migrations" }],
      "ratelimits": [
        { "name": "BATAS_PUBLIK", "namespace_id": "3001", "simple": { "limit": 300, "period": 60 } },
        { "name": "BATAS_WS", "namespace_id": "3002", "simple": { "limit": 300, "period": 60 } },
        { "name": "BATAS_MASUK", "namespace_id": "3003", "simple": { "limit": 100, "period": 60 } }
      ],
      "triggers": { "crons": ["0 19 * * *"] },
      "vars": {
        "LINGKUNGAN": "lokal",
        "ITERASI_SANDI": "4000",
        "KUNCI_SANDI": "lokal-kunci-sandi-bukan-rahasia",
        "KUNCI_IP": "lokal-kunci-ip-bukan-rahasia",
        "KUNCI_ADMIN": "lokal-kunci-admin-bukan-rahasia",
        "KUNCI_TIKET": "lokal-kunci-tiket-bukan-rahasia",
        "RUANG_AKTIF_MAKS": "1000"
      },
      "env": {
        "uji": {
          "name": "jejak-setara-uji",
          "vars": { "LINGKUNGAN": "uji", "ITERASI_SANDI": "4000", "RUANG_AKTIF_MAKS": "3" },
          "observability": { "enabled": true, "logs": { "enabled": true, "invocation_logs": false }, "traces": { "enabled": false } },
          "durable_objects": { "bindings": [{ "name": "RUANG", "class_name": "RuangJejak" }] },
          "d1_databases": [{ "binding": "DB", "database_name": "jejak-setara-uji", "database_id": "8870d944-5d38-4c97-b8bf-819f7676eeb1", "migrations_dir": "migrations" }],
          "ratelimits": [
            { "name": "BATAS_PUBLIK", "namespace_id": "3101", "simple": { "limit": 300, "period": 60 } },
            { "name": "BATAS_WS", "namespace_id": "3102", "simple": { "limit": 300, "period": 60 } },
            { "name": "BATAS_MASUK", "namespace_id": "3103", "simple": { "limit": 10, "period": 60 } }
          ]
        }
      }
    });
  });
});

describe("JS-22: alur kerja Jejak (P-11 sampai P-14, P-22)", () => {
  const hentikan = baca(".github/workflows/jejak-hentikan.yml");

  it("jejak-hentikan.yml: dijalankan manual dengan pilihan aksi dan lingkungan, memakai rahasia yang sudah ada", () => {
    expect(hentikan).toContain('name: "Jejak: hentikan"');
    expect(hentikan).toMatch(/workflow_dispatch:\n\s+inputs:\n\s+aksi:/);
    expect(hentikan).toMatch(/options:\n\s+- hentikan\n\s+- pulihkan/);
    expect(hentikan).toMatch(/options:\n\s+- uji\n/);
    expect(hentikan).toContain("CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}");
    expect(hentikan).toContain("concurrency:\n  group: jejak-cloudflare-uji");
  });

  it("jejak-hentikan.yml: hentikan menyimpan DARURAT=1, pulihkan menghapusnya; tidak mencetak nilai rahasia", () => {
    expect(hentikan).toContain(`printf '1' | npx -y wrangler@4.92.0 secret put DARURAT --name "jejak-setara-$LINGKUNGAN" > /dev/null`);
    expect(hentikan).toContain(`npx -y wrangler@4.92.0 secret delete DARURAT --name "jejak-setara-$LINGKUNGAN" > /dev/null`);
    expect(hentikan).not.toMatch(/echo "\$CLOUDFLARE_API_TOKEN|set -x/);
  });

  it("jejak-hentikan.yml: pemeriksaan /api/sehat paling lama 2 menit dan ringkasan sesuai teks spesifikasi", () => {
    expect(hentikan).toContain("for i in $(seq 1 24); do");
    expect(hentikan).toContain("sleep 5");
    expect(hentikan).toContain(`jq -r '.darurat // false'`);
    for (const teks of Object.values(TEKS_KONSOL.alurHentikan)) expect(hentikan).toContain(teks);
  });

  it("alur kerja Jejak memakai checkout@v5, setup-node@v5, dan ubuntu-24.04; deploy-pages.yml tidak berubah", () => {
    for (const berkas of ["jejak-uji.yml", "jejak-admin-awal.yml", "jejak-hentikan.yml"]) {
      const isi = baca(`.github/workflows/${berkas}`);
      expect(isi, berkas).not.toMatch(/actions\/(checkout|setup-node)@v4|ubuntu-latest/);
      expect(isi, berkas).toContain("runs-on: ubuntu-24.04");
      expect(isi, berkas).toContain("actions/setup-node@v5");
    }
    expect(baca(".github/workflows/deploy-pages.yml")).toContain("ubuntu-latest");
  });

  // setup-node@v5 membaca "packageManager" di package.json lalu menyiapkan cache pnpm, padahal pnpm dijalankan lewat npx
  // dan belum terpasang. "Jejak: uji" sesudah push Build JS-22 gagal karena itu, sebelum satu uji pun berjalan (15 Nov 2026).
  it("setup-node@v5 di alur kerja Jejak yang mengambil repositori mematikan cache otomatis (package.json memuat packageManager pnpm)", () => {
    expect((JSON.parse(baca("package.json")) as { packageManager: string }).packageManager).toMatch(/^pnpm@/);
    const alurKerja = readdirSync(new URL(".github/workflows/", AKAR)).filter((b) => /^jejak-.*\.yml$/.test(b));
    let diperiksa = 0;
    for (const berkas of alurKerja) {
      const isi = baca(`.github/workflows/${berkas}`).replace(/^\s*#.*\n/gm, "");
      if (!isi.includes("actions/checkout@")) continue;
      for (const langkah of isi.split("\n      - ").filter((l) => l.includes("actions/setup-node@"))) {
        expect(langkah, berkas).toMatch(/^\s+package-manager-cache: false$/m);
        diperiksa += 1;
      }
    }
    expect(diperiksa).toBeGreaterThanOrEqual(2);
  });
});

describe("JS-10: alur kerja ruang coba dipensiunkan; KUNCI_TIKET dibuat langkah Siapkan kunci Worker (P-32, P-34)", () => {
  it("jejak-ruang-coba.yml dan jejak-kendali-coba.yml tidak ada lagi", () => {
    expect(existsSync(new URL(".github/workflows/jejak-ruang-coba.yml", AKAR))).toBe(false);
    expect(existsSync(new URL(".github/workflows/jejak-kendali-coba.yml", AKAR))).toBe(false);
  });

  it("langkah Siapkan kunci Worker juga membuat KUNCI_TIKET", () => {
    expect(baca(".github/workflows/jejak-uji.yml")).toContain("for NAMA in KUNCI_SANDI KUNCI_IP KUNCI_TIKET; do");
  });
});

describe("JS-08: semai bank awal (P-6, P-7; AC-1, AC-2)", () => {
  const uji = baca(".github/workflows/jejak-uji.yml");

  it("skrip db:semai:lokal menyemai .wrangler/state yang sama dengan db:migrasi:lokal", () => {
    const { scripts } = JSON.parse(baca("package.json")) as { scripts: Record<string, string> };
    expect(scripts["db:semai:lokal"]).toBe("node scripts/jejak-setara/semai.mjs --jalankan -- --local --persist-to .wrangler/state");
    expect(scripts["db:migrasi:lokal"]).toContain("--persist-to .wrangler/state");
  });

  it("server-lokal.mjs menyemai folder keadaan sesudah migrasi, kecuali dengan --tanpa-semai", () => {
    const s = baca("scripts/jejak-setara/server-lokal.mjs");
    const migrasi = s.indexOf('"migrations", "apply"');
    const semai = s.indexOf('"semai.mjs"), ["--jalankan", "--", "--local", "--persist-to", keadaan]');
    const pratinjau = s.indexOf('"preview"');
    expect(migrasi).toBeGreaterThan(0);
    expect(semai).toBeGreaterThan(migrasi);
    expect(pratinjau).toBeGreaterThan(semai);
    expect(s).toContain('if (!argumen.includes("--tanpa-semai"))');
  });

  it("job Deploy uji: Semai bank awal tepat sesudah Migrasi D1 uji, dengan syarat yang sama", () => {
    const langkah = [...uji.matchAll(/\n      - name: ([^\n]+)\n        if: ([^\n]+)\n/g)].map((m) => [m[1], m[2]]);
    const nama = langkah.map((l) => l[0]);
    const i = nama.indexOf("Migrasi D1 uji");
    expect(i).toBeGreaterThan(0);
    expect(nama[i + 1]).toBe("Semai bank awal");
    expect(langkah[i + 1][1]).toBe(langkah[i][1]);
    expect(langkah[i + 1][1]).toBe("steps.rahasia.outputs.siap == 'ya'");
    expect(uji).toContain("        run: node scripts/jejak-setara/semai.mjs --jalankan -- --remote --env uji\n");
  });

});

describe("JS-04: alur kerja admin awal dan kunci Worker (P-29, P-32; AC-10)", () => {
  const awal = baca(".github/workflows/jejak-admin-awal.yml");
  const uji = baca(".github/workflows/jejak-uji.yml");
  const namaLangkah = (isi: string) => [...isi.matchAll(/\n      - name: ([^\n]+)\n/g)].map((m) => m[1]);
  const t = TEKS_KONSOL.alurAdminAwal;

  it("\"Jejak: admin awal\": tombol Run workflow dengan masukan nama_tampilan (bawaan Admin), grup concurrency, izin baca", () => {
    expect(awal).toContain('name: "Jejak: admin awal"');
    expect(awal).toMatch(/on:\n  workflow_dispatch:\n    inputs:\n      nama_tampilan:\n/);
    expect(awal).not.toMatch(/\n  push:/);
    expect(awal).toContain('default: "Admin"');
    expect(awal).toContain("permissions:\n  contents: read\n");
    expect(awal).toContain("concurrency:\n  group: jejak-cloudflare-uji\n  cancel-in-progress: false\n");
    expect(awal).toContain("timeout-minutes: 10");
  });

  it("langkah P-29 berurutan; langkah penutup selalu dijalankan sesudah kunci disimpan", () => {
    expect(namaLangkah(awal)).toEqual([
      "Periksa rahasia dan masukan",
      "Simpan kunci sekali pakai",
      "Cari alamat lingkungan uji",
      "Buat atau pulihkan akun",
      "Tutup kembali rute admin awal",
    ]);
    expect(awal).toContain("      - name: Simpan kunci sekali pakai\n        id: kunci\n");
    expect(awal).toContain("      - name: Tutup kembali rute admin awal\n        if: always() && steps.kunci.outcome != 'skipped'\n");
    expect(awal).toContain("        run: openssl rand -hex 32 | tr -d '\\n' | npx -y wrangler@4.92.0 secret put KUNCI_ADMIN --name jejak-setara-uji\n");
  });

  it("kunci sekali pakai disamarkan; isi JSON disusun jq dari variabel lingkungan ke berkas 600; ulang 10 kali dengan jeda 3 detik", () => {
    expect(awal).toContain("KUNCI=$(openssl rand -hex 32)");
    expect(awal).toContain('echo "::add-mask::$KUNCI"');
    expect(awal).toContain('printf \'%s\' "$KUNCI" | npx -y wrangler@4.92.0 secret put KUNCI_ADMIN --name jejak-setara-uji');
    expect(awal).toContain("jq -n '{email: env.JEJAK_ADMIN_EMAIL, sandi: env.JEJAK_ADMIN_SANDI_SEMENTARA, namaTampilan: env.NAMA_TAMPILAN}' > \"$ISI\"");
    expect(awal).toContain('chmod 600 "$ISI"');
    expect(awal).toContain("trap 'rm -f \"$ISI\" \"$JAWABAN\"' EXIT");
    expect(awal).toContain('-H "X-Jejak-Kunci-Admin: $KUNCI"');
    expect(awal).toContain("for i in $(seq 1 10); do");
    expect(awal).toContain("sleep 3");
    expect(awal).toContain('if [ "$STATUS" = "503" ] && [ "$KODE" = "KONSOL_BELUM_SIAP" ]; then');
    // Semua wrangler terkunci di versi 4.92.0.
    expect([...awal.matchAll(/npx -y wrangler@(\S+)/g)].map((m) => m[1])).toEqual(["4.92.0", "4.92.0"]);
  });

  it("isi rahasia tidak pernah dicetak, dan ringkasan tanpa email dan sandi", () => {
    const cetak = awal.split("\n").filter((b) => /\becho\b|print\(/.test(b));
    expect(cetak.length).toBeGreaterThan(10);
    for (const baris of cetak) {
      // Nama rahasia boleh tertulis di pesan; nilainya (variabel lingkungan, isi berkas) tidak.
      expect(baris).not.toMatch(/\$\{?(JEJAK_ADMIN_|NAMA_TAMPILAN|ISI\b|JAWABAN\b)|os\.environ|\b(email|sandi|nama)\)/);
      if (baris.includes("$KUNCI")) expect(baris).toMatch(/::add-mask::\$KUNCI|KUNCI=\$KUNCI" >> "\$GITHUB_ENV"/);
    }
  });

  it("teks ringkasan dan galat sama dengan TEKS_KONSOL.alurAdminAwal", () => {
    for (const teks of [t.dibuat, t.dipulihkan, t.petunjuk, t.rahasiaCloudflare, t.rahasiaAdmin, t.emailSalah, t.sandiSalah, t.namaSalah, t.belumSiap]) {
      expect(awal).toContain(teks);
    }
    expect(awal).toContain(`echo "${t.alamat.replace("{alamat}", "$ALAMAT")}"`);
    expect(awal).toContain(`echo "::error::${t.gagal.replace("{status}", "$STATUS")}"`);
  });

  it("jejak-uji.yml: Siapkan kunci Worker di antara Semai bank awal dan Deploy Worker uji, dengan syarat yang sama", () => {
    const langkah = [...uji.matchAll(/\n      - name: ([^\n]+)\n        if: ([^\n]+)\n/g)].map((m) => [m[1], m[2]]);
    const nama = langkah.map((l) => l[0]);
    const i = nama.indexOf("Siapkan kunci Worker");
    expect(nama[i - 1]).toBe("Semai bank awal");
    expect(nama[i + 1]).toBe("Deploy Worker uji");
    expect(langkah[i][1]).toBe("steps.rahasia.outputs.siap == 'ya'");
  });

  it("jejak-uji.yml: hanya kunci yang belum ada yang dibuat; deploy memakai --secrets-file; tidak ada rahasia yang dihapus", () => {
    expect(uji).toContain("ADA=$(npx wrangler secret list --name jejak-setara-uji --format json | jq -r '.[].name')");
    expect(uji).toContain("for NAMA in KUNCI_SANDI KUNCI_IP KUNCI_TIKET; do");
    expect(uji).toContain("NILAI=$(openssl rand -hex 32)");
    expect(uji).toContain('echo "::add-mask::$NILAI"');
    expect(uji).toContain('chmod 600 "$RUNNER_TEMP/kunci-worker.json"');
    expect(uji).toContain(`echo "${t.kunciBaru.replace("{nama}", "$BARU")}"`);
    expect(uji).toContain(`echo "${t.kunciLengkap}"`);
    expect(uji).toContain('npx wrangler deploy --secrets-file "$RUNNER_TEMP/kunci-worker.json" | tee "$RUNNER_TEMP/deploy.log"');
    expect(uji).toContain("trap 'rm -f \"$RUNNER_TEMP/kunci-worker.json\"' EXIT");
    expect(uji).not.toMatch(/secret (delete|put)/);
  });
});

describe("Skrip", () => {
  const B = "node scripts/jejak-setara/bila-ada.mjs";
  it("package.json memuat kesepuluh skrip Jejak Setara persis (AC-1)", () => {
    const { scripts } = JSON.parse(baca("package.json")) as { scripts: Record<string, string> };
    expect(scripts).toMatchObject({
      "dev:jejak": "vite --config vite.jejak.config.ts",
      "build:jejak": "vite build --config vite.jejak.config.ts",
      "test:jejak": "vitest run --config vitest.jejak.config.ts",
      "content:check:jejak": `${B} app/jejak-setara/__tests__/konten "dibuat di JS-05 dan JS-06" -- vitest run --config vitest.jejak.config.ts app/jejak-setara/__tests__/konten/`,
      "test:jejak:server": "vitest run --config vitest.jejak-server.config.ts",
      "test:e2e:jejak": "playwright test --config playwright.jejak.config.ts",
      "sim:beban": "node scripts/jejak-setara/simulasi-beban.mjs",
      "db:migrasi:lokal": "wrangler d1 migrations apply jejak-setara-lokal --local --persist-to .wrangler/state --config server/jejak-setara/wrangler.jsonc",
      "peta:build": `${B} scripts/jejak-setara/peta/build_peta.py "dibuat di JS-06" -- python scripts/jejak-setara/peta/build_peta.py`,
      "assets:build:jejak": `${B} scripts/game/art/build_jejak.py "dibuat Sesi C bersama aset tampak atas" -- python scripts/game/art/build_jejak.py`,
    });
    expect(Object.keys(scripts).filter((nama) => /jejak|sim:beban|db:migrasi|peta:build/.test(nama))).toHaveLength(10);
  });

  describe("bila-ada.mjs (proses anak di folder sementara)", () => {
    const penjalan = fileURLToPath(new URL("scripts/jejak-setara/bila-ada.mjs", AKAR));
    const folder = mkdtempSync(join(tmpdir(), "bila-ada-"));
    mkdirSync(join(folder, "ada"));
    writeFileSync(join(folder, "keluar0.mjs"), "process.exit(0);\n");
    writeFileSync(join(folder, "keluar3.mjs"), "process.exit(3);\n");
    const jalankan = (...argumen: string[]) => spawnSync(process.execPath, [penjalan, ...argumen], { cwd: folder, encoding: "utf8" });

    it("jalur - mencetak Belum tersedia dan selesai dengan kode 0", () => {
      const hasil = jalankan("-", "dibuat di JS-03");
      expect(hasil.stdout).toBe("Belum tersedia (dibuat di JS-03).\n");
      expect(hasil.status).toBe(0);
    });

    it("jalur yang belum ada mencetak Belum tersedia dan selesai dengan kode 0", () => {
      const hasil = jalankan("tidak/ada.py", "dibuat di JS-06", "--", "python", "tidak/ada.py");
      expect(hasil.stdout).toBe("Belum tersedia: tidak/ada.py belum ada (dibuat di JS-06).\n");
      expect(hasil.status).toBe(0);
    });

    it.each([
      ["keluar0.mjs", 0],
      ["keluar3.mjs", 3],
    ])("jalur yang ada menjalankan perintah dan meneruskan kodenya (%s)", (berkas, kode) => {
      const hasil = jalankan("ada", "dibuat di JS-05", "--", "node", berkas);
      expect(hasil.status).toBe(kode);
    });
  });
});

// JS-10 (AC-25): kunci yang ditambahkan JS-10 ke TEKS_KONSOL, dan pengurai tabel "Teks yang tampil (final)".
const KUNCI_JS10 = ["menu.ruang", "status", "dasbor.ruangItem", "dasbor.ruangSemua", "ruang", "ruangBaru", "detail", "kelas", "galatRuang"];

function ratakanTeks(o: unknown, awalan = ""): Record<string, string> {
  const hasil: Record<string, string> = {};
  for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
    const kunci = awalan ? `${awalan}.${k}` : k;
    if (typeof v === "string") hasil[kunci] = v;
    else Object.assign(hasil, ratakanTeks(v, kunci));
  }
  return hasil;
}

function tanpaKunciJs10(teks: object): unknown {
  const salin = JSON.parse(JSON.stringify(teks)) as Record<string, Record<string, unknown>>;
  for (const k of KUNCI_JS10) {
    const [atas, bawah] = k.split(".");
    if (bawah) delete salin[atas][bawah];
    else delete salin[atas];
  }
  return salin;
}

function uraiTabelTeks(isi: string): Record<string, string> {
  const mulai = isi.indexOf("## Teks yang tampil (final)");
  const akhir = isi.indexOf("\n## ", mulai + 5);
  const hasil: Record<string, string> = {};
  for (const baris of isi.slice(mulai, akhir).split("\n")) {
    const m = /^\| (`[^|]+`) \| (.+) \|$/.exec(baris);
    if (!m) continue;
    const kunci = [...m[1].matchAll(/`([^`]+)`/g)].map((x) => x[1]);
    const teks = kunci.length > 1 ? m[2].split(" / ") : [m[2]];
    expect(teks.length, baris).toBe(kunci.length);
    kunci.forEach((k, i) => (hasil[k] = teks[i]));
  }
  return hasil;
}

// JS-22 (AC-17): kunci yang ditambahkan JS-22.
const KUNCI_JS22_PEMAIN = ["api.LAYANAN_BERHENTI", "berhenti.layananJudul", "berhenti.layananIsi", "berhenti.putusJudul", "berhenti.putusIsi", "berhenti.cobaLagi"];
const KUNCI_JS22_KONSOL = [
  "galat.LAYANAN_BERHENTI",
  "detail.pemakaianJudul",
  "detail.pemakaianPermintaan",
  "detail.pemakaianD1",
  "detail.pemakaianSqlite",
  "detail.pemakaianSambungan",
  "detail.pemakaianAlarm",
  "detail.pemakaianNilai",
  "detail.pemakaianCatatan",
  "detail.kirimanGagal",
  "alurHentikan.berhenti",
  "alurHentikan.pulih",
  "alurHentikan.galat",
];

/** Salinan objek teks tanpa kunci bertitik yang disebut, dan tanpa grup yang menjadi kosong. */
function tanpaKunci(teks: object, kunci: readonly string[]): unknown {
  const salin = JSON.parse(JSON.stringify(teks)) as Record<string, Record<string, unknown>>;
  for (const k of kunci) {
    const [atas, bawah] = k.split(".");
    if (salin[atas]) {
      delete salin[atas][bawah];
      if (Object.keys(salin[atas]).length === 0) delete salin[atas];
    }
  }
  return salin;
}

/**
 * JS-11 (AC-21): kunci dan teks dari tabel spesifikasi JS-11, menurut subjudul tebalnya: layar pemain, konsol, isi
 * berkas CSV, dan teks JS-10 yang berubah.
 */
function kunciJs11(): { pemain: Record<string, string>; konsol: Record<string, string>; csv: Record<string, string>; js10: Record<string, string> } {
  const isi = baca("docs/jejak-setara/specs/JS-11-akhir-ronde.md");
  const bagian = isi.slice(isi.indexOf("## Teks yang tampil (final)"), isi.indexOf("\n## Data, protokol"));
  const potong = (dari: string, sampai: string | null) => {
    const awal = bagian.indexOf(dari);
    return "## Teks yang tampil (final)\n" + bagian.slice(awal, sampai === null ? undefined : bagian.indexOf(sampai)) + "\n## ";
  };
  return {
    pemain: uraiTabelTeks(potong("**Layar pemain**", "**Konsol**")),
    konsol: uraiTabelTeks(potong("**Konsol**", "**Isi berkas CSV**")),
    csv: uraiTabelTeks(potong("**Isi berkas CSV**", "**Teks JS-10 yang berubah**")),
    js10: uraiTabelTeks(potong("**Teks JS-10 yang berubah**", null)),
  };
}

/** JS-09 (AC-21): kunci dan teks dari tabel spesifikasi JS-09, menurut subjudul tebalnya: layar pemain, konsol, dan isi berkas CSV. */
function kunciJs09(): { pemain: Record<string, string>; konsol: Record<string, string>; csv: Record<string, string> } {
  const isi = baca("docs/jejak-setara/specs/JS-09-skill.md");
  const bagian = isi.slice(isi.indexOf("## Teks yang tampil (final)"), isi.indexOf("\n## Data, protokol"));
  const potong = (dari: string, sampai: string | null) => {
    const awal = bagian.indexOf(dari);
    return "## Teks yang tampil (final)\n" + bagian.slice(awal, sampai === null ? undefined : bagian.indexOf(sampai)) + "\n## ";
  };
  return {
    pemain: uraiTabelTeks(potong("**Layar pemain**", "**Konsol**")),
    konsol: uraiTabelTeks(potong("**Konsol**", "**Isi berkas CSV**")),
    csv: uraiTabelTeks(potong("**Isi berkas CSV**", null)),
  };
}

/** JS-12 (AC-16): kunci dan teks dari tabel spesifikasi JS-12 (konsol, kalimat temuan, dan layar pemain). */
function kunciJs12(): { konsol: string[]; pemain: string[]; teks: Record<string, string> } {
  const isi = baca("docs/jejak-setara/specs/JS-12-bank.md");
  const bagian = isi.slice(isi.indexOf("## Teks yang tampil (final)"), isi.indexOf("\n## Data, protokol"));
  const batas = bagian.indexOf("**Layar pemain, mode pratinjau**");
  const urai = (teks: string): Record<string, string> => {
    const hasil: Record<string, string> = {};
    for (const baris of teks.split("\n")) {
      const m = /^\| (`[^|]+`) \| (.+) \|$/.exec(baris);
      if (!m) continue;
      const kunci = [...m[1].matchAll(/`([^`]+)`/g)].map((x) => x[1]);
      const nilai = kunci.length > 1 ? m[2].split(" / ") : [m[2]];
      kunci.forEach((k, i) => (hasil[k] = nilai[i]));
    }
    return hasil;
  };
  const konsol = urai(bagian.slice(0, batas));
  const pemain = urai(bagian.slice(batas));
  return { konsol: Object.keys(konsol), pemain: Object.keys(pemain), teks: { ...konsol, ...pemain } };
}

// JS-13 (AC-14): kunci teks konsol dari tabel spesifikasi JS-13.
function kunciJs13(): Record<string, string> {
  return uraiTabelTeks(baca("docs/jejak-setara/specs/JS-13-statistik.md"));
}
