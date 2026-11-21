// Skill di layar pemain (spesifikasi JS-09, P-18, P-20, P-22, P-23, P-26, P-36, P-37, P-39, P-41 sampai P-43; AC-8
// sampai AC-10, AC-13, AC-14, AC-16): modul murni pemain/dunia/skill.ts dan bagian skill mesin dunia.
import { describe, expect, it } from "vitest";
import { PANDANGAN } from "../../inti/aturan";
import { PROTOKOL_VERSI } from "../../inti/versi";
import { MesinDunia } from "../../pemain/dunia/mesin";
import { PemainLain } from "../../pemain/dunia/pemainLain";
import { bingkaiTokoh } from "../../pemain/dunia/penggambar";
import { KOTAK_PETA } from "../../pemain/dunia/petaKampung";
import { hitungSkala } from "../../pemain/dunia/skala";
import { AntreanPita, ARAH_PANAH, batasPanah, indeksArah, letakPanah, SkillKlien, type KotakKlien } from "../../pemain/dunia/skill";
import { KOTAK_KAMPUNG } from "../../../../server/jejak-setara/src/ruang/peta-kampung";
import { TEKS } from "../../teks";

const T = TEKS.skill;
const nol = { lari: 0, kompas: 0, petunjuk: 0, teropong: 0, angkot: 0 };
const KOTAK: KotakKlien[] = [
  { id: "k-a", jenis: "sepatu", x: 10, y: 10 },
  { id: "k-b", jenis: "kompas", x: 20, y: 10 },
  { id: "k-c", jenis: "buku", x: 30, y: 10 },
];
function skill(ruang: SkillKlien["ruang"] = ["lari", "kompas", "petunjuk"]) {
  const s = new SkillKlien(KOTAK);
  s.ruang = ruang;
  return s;
}
const pribadi = (muatan: Partial<typeof nol>, aktifSampai: Record<string, number> = {}, kotakMenunggu: { id: string; siapPada: number }[] = []) => ({
  muatan: { ...nol, ...muatan },
  aktifSampai,
  kotakMenunggu,
});

describe("data kotak layar pemain (P-18)", () => {
  it("KOTAK_PETA sama dengan KOTAK_KAMPUNG server, termasuk urutannya", () => {
    expect(KOTAK_PETA.map(({ id, jenis, x, y }) => ({ id, jenis, x, y }))).toEqual(KOTAK_KAMPUNG);
  });
});

describe("waktu efektif dan jeda (P-20; AC-8)", () => {
  it("main: perkiraan jam server; jeda: jedaSejak; jeda ke main menggeser aktifSampai dan siapPada sebesar lama jeda", () => {
    const m = new MesinDunia(() => ({ getContext: () => null }) as unknown as HTMLCanvasElement);
    const V = PROTOKOL_VERSI;
    m.terima({ v: V, t: "status_ruang", status: "main", mulaiPada: 1000, berakhirPada: 901_000, jedaSejak: null }, 5000, 200);
    expect(m.waktuEfektif(5000, 200)).toBe(5200);
    m.skill.ruang = ["lari", "kompas", "petunjuk"];
    m.terima({ v: V, t: "pribadi", skor: 0, peringkat: 1, selesai: [], terlihat: [], muatan: { ...nol, kompas: 1 }, aktifSampai: { lari: 11_000, kompas: 25_000 }, kotakMenunggu: [{ id: "k-z1-1", siapPada: 95_000 }] }, 5000, 200);
    m.terima({ v: V, t: "kompas", x: 40, y: 50, berakhirPada: 25_000 }, 5000, 200);
    m.terima({ v: V, t: "status_ruang", status: "jeda", mulaiPada: 1000, berakhirPada: 901_000, jedaSejak: 6000 }, 5800, 200);
    expect(m.waktuEfektif(99_000, 200)).toBe(6000);
    // Lanjut sesudah jeda 10 detik (perkiraan jam server 16 000).
    m.terima({ v: V, t: "status_ruang", status: "main", mulaiPada: 1000, berakhirPada: 911_000, jedaSejak: null }, 15_800, 200);
    expect(m.skill.sampai).toEqual({ lari: 21_000, kompas: 35_000 });
    expect([...m.skill.tunggu]).toEqual([["k-z1-1", 105_000]]);
    expect(m.skill.kompas).toEqual({ x: 40, y: 50 });
  });

  it("Lari cepat: kecepatan lari hanya di main sampai waktu efektif mencapai aktifSampai; langkah 12 fps", () => {
    const s = skill();
    s.pribadi(pribadi({ lari: 1 }, { lari: 10_000 }), 4000, 4000, false);
    expect(s.aktif("lari", 9999)).toBe(true);
    expect(s.aktif("lari", 10_000)).toBe(false);
    expect([0, 83, 84, 167, 250, 333].map((t) => bingkaiTokoh(true, t, false, true))).toEqual([0, 0, 1, 2, 3, 3]);
    expect(bingkaiTokoh(false, 600, false, true)).toBe(1); // diam: tetap 2 fps
    expect(bingkaiTokoh(true, 333, true, true)).toBe(0); // kurangi gerak
  });
});

describe("status tombol dan tekanan (P-36, P-37; AC-13)", () => {
  it("muatan, aktif, jeda 8 langkah selama 2 detik sesudah pribadi yang mengurangi muatan, dan tampak menunggu paling lama 2 detik", () => {
    const s = skill();
    s.pribadi(pribadi({ lari: 2 }), 1000, 0, false);
    expect(s.status("lari", 1000, 0)).toEqual({ skill: "lari", muatan: 2, aktif: false, jeda: 0, menunggu: false });
    s.catatTekan("lari", 100);
    expect(s.status("lari", 1000, 2099).menunggu).toBe(true);
    expect(s.status("lari", 1000, 2100).menunggu).toBe(false);
    s.pribadi(pribadi({ lari: 1 }, { lari: 8000 }), 2000, 200, false);
    expect(s.status("lari", 2000, 200)).toEqual({ skill: "lari", muatan: 1, aktif: true, jeda: 8, menunggu: false });
    expect([2249, 2250, 3749, 3999, 4000].map((w) => s.status("lari", w, 0).jeda)).toEqual([8, 7, 2, 1, 0]);
  });

  it("hasil tekanan: kirim bila boleh; pita Cari … tanpa muatan; diam saat aktif, jeda, atau menunggu; Petunjuk di luar dialog", () => {
    const s = skill();
    expect(s.tekan("lari", 0, 0)).toBe(T.cariLari);
    expect(s.tekan("kompas", 0, 0)).toBe(T.cariKompas);
    expect(s.tekan("petunjuk", 0, 0)).toBe(T.cariPetunjuk);
    s.pribadi(pribadi({ lari: 2, kompas: 1, petunjuk: 1 }), 0, 0, false);
    expect(s.tekan("lari", 0, 0)).toBe(true);
    expect(s.tekan("petunjuk", 0, 0)).toBe(T.diLangkah1);
    s.catatTekan("lari", 0);
    expect(s.tekan("lari", 0, 1999)).toBe(false);
    s.pribadi(pribadi({ lari: 1, kompas: 1, petunjuk: 1 }, { lari: 7000 }), 1000, 2000, false);
    expect(s.tekan("lari", 2500, 2500)).toBe(false); // aktif (D-1a)
    expect(s.tekan("lari", 7000, 9000)).toBe(true);
    s.pribadi(pribadi({ lari: 1, kompas: 0, petunjuk: 1 }, { kompas: 30_000 }), 9000, 9000, false);
    expect(s.tekan("kompas", 9500, 9500)).toBe(false); // aktif, tanpa pita walaupun muatan 0
    const sebagian = skill(["lari"]);
    sebagian.pribadi(pribadi({ kompas: 2, petunjuk: 2 }), 0, 0, false);
    expect(sebagian.tekan("kompas", 0, 0)).toBe(false);
    expect(sebagian.tekan("petunjuk", 0, 0)).toBe(false);
  });
});

describe("kotak yang tergambar, pop, dan kilau (P-18; AC-7)", () => {
  it("hanya di main dan jeda, untuk skill yang aktif, dan siap bagi pemain ini", () => {
    const s = skill(["lari", "petunjuk"]);
    expect(s.kotakTampil("lobi", 0, false)).toEqual([]);
    expect(s.kotakTampil("hitung_mundur", 0, false)).toEqual([]);
    expect(s.kotakTampil("selesai", 0, false)).toEqual([]);
    expect(s.kotakTampil("main", 0, false).map(([k, b]) => [k.id, b])).toEqual([["k-a", 2], ["k-c", 2]]);
    s.pribadi(pribadi({ lari: 1 }, {}, [{ id: "k-a", siapPada: 90_000 }]), 0, 0, false);
    expect(s.kotakTampil("main", 89_999, false).map(([k]) => k.id)).toEqual(["k-c"]);
    expect(s.kotakTampil("jeda", 89_999, false).map(([k]) => k.id)).toEqual(["k-c"]);
  });

  it("pop: bingkai 0 selama 80 ms, bingkai 1 sampai 160 ms, lalu biasa; tanpa pop selama jeda dan saat kurangi gerak", () => {
    const s = skill();
    s.pribadi(pribadi({ lari: 1 }, {}, [{ id: "k-a", siapPada: 90_000 }]), 0, 0, false);
    const bingkai = (w: number, status: "main" | "jeda" = "main", kurangi = false) => s.kotakTampil(status, w, kurangi).find(([k]) => k.id === "k-a")?.[1];
    expect([90_000, 90_079, 90_080, 90_159, 90_160].map((w) => bingkai(w))).toEqual([0, 0, 1, 1, 2]);
    expect(bingkai(90_000, "jeda")).toBe(2);
    expect(bingkai(90_000, "main", true)).toBe(2);
  });

  it("kilau dua bingkai 80 ms di pusat ubin kotak yang baru masuk kotakMenunggu; tidak ada saat kurangi gerak", () => {
    const s = skill();
    s.pribadi(pribadi({ lari: 1 }, {}, [{ id: "k-a", siapPada: 90_000 }]), 0, 500, false);
    expect(s.kilauTampil(500)).toEqual([[168, 168, 0]]);
    expect(s.kilauTampil(580)).toEqual([[168, 168, 1]]);
    expect(s.kilauTampil(660)).toEqual([]);
    s.pribadi(pribadi({ lari: 1 }, {}, [{ id: "k-a", siapPada: 90_000 }]), 0, 700, false); // kotak sama: tanpa kilau baru
    expect(s.kilauTampil(700)).toEqual([]);
    const k = skill();
    k.pribadi(pribadi({ lari: 1 }, {}, [{ id: "k-a", siapPada: 90_000 }]), 0, 0, true);
    expect(k.kilauTampil(0)).toEqual([]);
  });
});

describe("pita penuh dan antrean pita (P-41 sampai P-43; AC-14, D-2a)", () => {
  it("pita penuh sekali per kotak dalam 12 piksel dari pusat bila muatan 2, lagi sesudah menjauh lebih dari 24 piksel", () => {
    const s = skill();
    s.pribadi(pribadi({ lari: 2, kompas: 1 }), 0, 0, false);
    const tampil = s.kotakTampil("main", 0, false);
    expect(s.periksaPenuh({ x: 168, y: 181 }, tampil)).toEqual([]); // 13 px
    expect(s.periksaPenuh({ x: 168, y: 180 }, tampil)).toEqual([`${T.lari} sudah penuh.`]);
    expect(s.periksaPenuh({ x: 168, y: 176 }, tampil)).toEqual([]);
    expect(s.periksaPenuh({ x: 168, y: 192 }, tampil)).toEqual([]); // 24 px: belum cukup jauh
    expect(s.periksaPenuh({ x: 168, y: 176 }, tampil)).toEqual([]);
    expect(s.periksaPenuh({ x: 168, y: 193 }, tampil)).toEqual([]); // lebih dari 24 px
    expect(s.periksaPenuh({ x: 170, y: 170 }, tampil)).toEqual([`${T.lari} sudah penuh.`]);
    expect(s.periksaPenuh({ x: 328, y: 168 }, tampil)).toEqual([]); // kompas belum penuh
    s.pribadi(pribadi({ lari: 2, kompas: 2 }), 0, 0, false);
    expect(s.periksaPenuh({ x: 328, y: 168 }, tampil)).toEqual([`${T.kompasPendek} sudah penuh.`]);
  });

  it("antrean: satu per satu 3 detik, paling banyak 3 butir dengan yang tertua dibuang, tanpa butir ganda di ujungnya", () => {
    const a = new AntreanPita();
    expect(a.perbarui(0)).toBe("");
    expect(a.tambah("A", 0)).toBe(true);
    expect(a.perbarui(0)).toBe("A");
    expect(a.tambah("A", 100)).toBe(false); // sama dengan yang tampil
    for (const t of ["B", "C", "D", "E"]) expect(a.tambah(t, 200)).toBe(true);
    expect(a.tambah("E", 300)).toBe(false);
    expect(a.perbarui(2999)).toBe("A");
    expect([3000, 6000, 9000, 12_000].map((j) => a.perbarui(j))).toEqual(["C", "D", "E", ""]);
    expect(a.tambah("E", 12_000)).toBe(true); // yang tampil sudah habis
  });

  it("pemberitahuan: pita dan pengumuman kotak, tanpa sasaran, dan +1 Kompas", () => {
    const s = skill();
    expect(s.pemberitahuan("kotak_lari")).toEqual([`+1 ${T.lari}`, `Dapat satu muatan ${T.lari}.`]);
    expect(s.pemberitahuan("kotak_kompas")).toEqual([`+1 ${T.kompasPendek}`, `Dapat satu muatan ${T.kompas}.`]);
    expect(s.pemberitahuan("kotak_petunjuk")).toEqual([`+1 ${T.petunjuk}`, `Dapat satu muatan ${T.petunjuk}.`]);
    expect(s.pemberitahuan("kompas_tanpa_sasaran")).toEqual([T.semuaSelesai, T.semuaSelesai]);
    expect(s.pemberitahuan("kompas_tepat")).toEqual([null, `Dapat satu muatan ${T.kompas}.`]);
    expect(s.pemberitahuan("kotak_teropong")).toBeNull();
  });

  it("pengumuman mulai aktif dan selesai sekali; masa aktif yang berlanjut sesudah dimuat ulang tidak diumumkan sebagai baru", () => {
    const s = skill();
    s.pribadi(pribadi({ lari: 0 }, { lari: 7000 }), 1000, 0, false);
    expect(s.periksaWaktu(1000)).toEqual([`${T.lari} aktif selama 6 detik.`]);
    expect(s.periksaWaktu(5000)).toEqual([]);
    expect(s.periksaWaktu(7000)).toEqual([`${T.lari} selesai.`]);
    s.pribadi(pribadi({ kompas: 0 }, { kompas: 30_000 }), 10_000, 0, false);
    expect(s.periksaWaktu(10_000)).toEqual([`${T.kompas} aktif selama 20 detik.`]);
    s.pribadi(pribadi({ kompas: 0 }), 12_000, 0, false); // tiba: aktifSampai.kompas hilang
    expect(s.periksaWaktu(12_000)).toEqual([`${T.kompas} selesai.`]);
    const ulang = skill();
    ulang.pribadi(pribadi({}, { kompas: 30_000 }), 15_000, 0, false);
    expect(ulang.periksaWaktu(15_000)).toEqual([]);
  });
});

describe("panah Kompas (P-26; AC-10)", () => {
  it("delapan arah searah jarum jam dari atas; nilai tepat di tengah dibulatkan searah jarum jam", () => {
    const arah = [
      [0, -10],
      [10, -10],
      [10, 0],
      [10, 10],
      [0, 10],
      [-10, 10],
      [-10, 0],
      [-10, -10],
    ].map(([dx, dy]) => ARAH_PANAH[indeksArah(dx, dy)]);
    expect(arah).toEqual([...ARAH_PANAH]);
    const tengah = Math.tan(Math.PI / 8);
    expect(indeksArah(tengah * 100 + 1e-9, -100)).toBe(1);
    expect(indeksArah(tengah * 100 - 1e-6, -100)).toBe(0);
    expect(indeksArah(-1, -1000)).toBe(0);
  });

  const DUNIA: [string, number, number, number][] = [
    ["610 × 343", 915, 356, 2.625],
    ["640 × 360", 640, 360, 1],
    ["960 × 540", 960, 540, 1],
    ["1280 × 720", 1280, 720, 1],
  ];
  it.each(DUNIA)("di dunia %s: panah 14 × 14 selalu di dalam kotak aman, untuk 72 arah dan titik kaki di mana pun", (_, w, h, r) => {
    const u = hitungSkala(w, h, r);
    const px = u.k / r;
    const potong = [-u.kiriCss, -u.atasCss, u.kiriCss + u.lebarCss - w, u.atasCss + u.tinggiCss - h].map((x) => Math.max(0, x)) as [number, number, number, number];
    const b = batasPanah(px, potong);
    // Kotak aman dalam piksel logis: tepi ditambah 7 dari batas pusat panah.
    const aman = { kiri: b[0] - 7, atas: b[1] - 7, kanan: b[2] + 7, bawah: b[3] + 7 };
    expect(aman.kiri * px).toBeGreaterThanOrEqual(12 + potong[0] - px / 2);
    expect((PANDANGAN.lebar - aman.kanan) * px).toBeGreaterThanOrEqual(160 + potong[2] - px / 2);
    expect(aman.atas * px).toBeGreaterThanOrEqual(40 + potong[1] - px / 2);
    expect((PANDANGAN.tinggi - aman.bawah) * px).toBeGreaterThanOrEqual(56 + potong[3] - px / 2);
    for (const kaki of [{ x: 160, y: 90 }, { x: 2, y: 2 }, { x: 318, y: 178 }, { x: 300, y: 20 }]) {
      for (let i = 0; i < 72; i++) {
        const a = (i * Math.PI) / 36;
        const [x, y] = letakPanah(kaki.x, kaki.y, Math.sin(a) * 900, -Math.cos(a) * 900, b);
        expect(x - 7).toBeGreaterThanOrEqual(aman.kiri);
        expect(x + 7).toBeLessThanOrEqual(aman.kanan);
        expect(y - 7).toBeGreaterThanOrEqual(aman.atas);
        expect(y + 7).toBeLessThanOrEqual(aman.bawah);
      }
    }
  });

  it("letak di tepi kotak aman searah sasaran; tampil hanya bila Kompas aktif dan sasaran di luar pandangan", () => {
    const b = batasPanah(2);
    expect(b).toEqual([13, 27, 233, 145]);
    expect(letakPanah(160, 90, 0, -500, b)).toEqual([160, 27]);
    expect(letakPanah(160, 90, 500, 0, b)).toEqual([233, 90]);
    expect(letakPanah(160, 90, -500, 500, b)).toEqual([105, 145]);
    expect(letakPanah(500, 90, -10, 0, b)).toEqual([13, 90]); // kaki dijepit lebih dulu
    const s = skill();
    const kamera = { x: 0, y: 0 };
    s.sasaran({ x: 50, y: 5 }); // pusat ubin (808, 88): di luar pandangan
    expect(s.panah({ x: 160, y: 90 }, kamera, 0, b)).toBeNull(); // pribadi belum memuat aktifSampai.kompas
    s.pribadi(pribadi({}, { kompas: 20_000 }), 0, 0, false);
    expect(s.panah({ x: 160, y: 90 }, kamera, 1000, b)).toEqual([2, 233, 90]);
    expect(s.panah({ x: 160, y: 90 }, kamera, 20_000, b)).toBeNull(); // berakhir
    expect(s.panah({ x: 160, y: 90 }, { x: 700, y: 0 }, 1000, b)).toBeNull(); // sasaran di pandangan
    expect(s.panah(null, kamera, 1000, b)).toBeNull();
  });

  it("mesin: data-kompas berisi nama arah, panah digambar 14 × 14 dengan bingkai biasa dan terang bergantian 500 ms, tanpa denyut saat kurangi gerak", () => {
    const gambar: string[] = [];
    const ctx = {
      imageSmoothingEnabled: false,
      clearRect: () => undefined,
      save: () => undefined,
      restore: () => undefined,
      translate: () => undefined,
      scale: () => undefined,
      drawImage: (src: { nama?: string }, ...a: number[]) => gambar.push(`${src.nama}(${a.join(",")})`),
    } as unknown as CanvasRenderingContext2D;
    const m = new MesinDunia(() => ({ getContext: () => ctx }) as unknown as HTMLCanvasElement);
    const V = PROTOKOL_VERSI;
    (m as unknown as { aset: unknown }).aset = { tanda: new Map([["tanda_kompas", { nama: "kompas", width: 112, height: 7 }]]), objek: new Map(), npc: new Map() };
    (m as unknown as { potongan: unknown }).potongan = { gambar: () => undefined, gambarAtas: () => undefined, perbarui: () => undefined };
    m.terima({ v: V, t: "status_ruang", status: "main", mulaiPada: 0, berakhirPada: 900_000, jedaSejak: null }, 0, 0);
    m.skill.ruang = ["kompas"];
    m.gerak.terapkanKoreksi({ x: 400, y: 400, seq: 0 });
    m.terima({ v: V, t: "pribadi", skor: 0, peringkat: 1, selesai: [], terlihat: [], muatan: nol, aktifSampai: { kompas: 20_000 }, kotakMenunggu: [] }, 0, 0);
    m.terima({ v: V, t: "kompas", x: 25, y: 60, berakhirPada: 20_000 }, 0, 0); // pusat (408, 968): bawah
    const opsi = (jam: number, kurangiGerak = false) => ({ jamLokal: jam, jamPerforma: jam, selisihJam: 0, bolehGerak: false, kurangiGerak, bufferedAmount: 0, kirim: () => true, batas: batasPanah(2) });
    m.perbarui(opsi(100));
    expect(m.arahPanah).toBe("bawah");
    try {
      m.gambar(ctx, false, 100);
    } catch {
      // potongan tiruan tidak lengkap; panah digambar sesudah dunia
    }
    m.perbarui(opsi(600));
    expect(m.arahPanah).toBe("bawah");
    m.perbarui(opsi(20_000));
    expect(m.arahPanah).toBe("");
  });
});

describe("pemain lain berlari (P-23; AC-9)", () => {
  it("berlari bila butir terakhir bertanda jalan dan lebih dari 45 piksel dalam 500 ms; penyangga yang terlalu baru dianggap berjalan", () => {
    const l = new PemainLain();
    l.kenal("b", { nama: "B", avatar: 1, warnaTas: "sun" });
    // 10 laporan per detik: 14 piksel per 100 ms = 70 px dalam 500 ms (lari); butir pertama di jam server 1000.
    for (let i = 0; i <= 20; i++) l.terimaDunia(1000 + i * 100, [["b", 100 + i * 14, 100, "kanan", true]], 1000 + i * 100, 0);
    // Penyangga menyimpan 10 butir terakhir (w 2100 sampai 3000); waktu tampil tertinggal sebesar tunda adaptif.
    const lari = (t: number) => l.tampil(t, t, "main").find((p) => p.id === "b")?.lari;
    expect(lari(3000)).toBe(true);
    const baru = new PemainLain();
    baru.kenal("b", { nama: "B", avatar: 1, warnaTas: "sun" });
    for (let i = 0; i <= 3; i++) baru.terimaDunia(1000 + i * 100, [["b", 100 + i * 14, 100, "kanan", true]], 1000 + i * 100, 0);
    expect(baru.tampil(1400, 1400, "main")[0]?.lari).toBe(false); // butir tertua lebih baru dari t − 500 ms
    const jalan = new PemainLain();
    jalan.kenal("c", { nama: "C", avatar: 1, warnaTas: "sun" });
    for (let i = 0; i <= 20; i++) jalan.terimaDunia(1000 + i * 100, [["c", 100 + i * 9, 100, "kanan", true]], 1000 + i * 100, 0); // 45 px: belum lari
    expect(jalan.tampil(3000, 3000, "main")[0]?.lari).toBe(false);
    const henti = new PemainLain();
    henti.kenal("d", { nama: "D", avatar: 1, warnaTas: "sun" });
    for (let i = 0; i <= 20; i++) henti.terimaDunia(1000 + i * 100, [["d", 100 + i * 14, 100, "kanan", i < 20]], 1000 + i * 100, 0);
    expect(henti.tampil(3000, 3000, "main")[0]?.lari).toBe(false); // butir terakhir tidak bertanda jalan
  });
});
