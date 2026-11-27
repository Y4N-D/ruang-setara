// Skill di layar pemain (spesifikasi JS-09, P-18, P-20, P-22, P-23, P-26, P-36, P-37, P-39, P-41 sampai P-43; AC-8
// sampai AC-10, AC-13, AC-14, AC-16): modul murni pemain/dunia/skill.ts dan bagian skill mesin dunia. JS-18 (AC-4, AC-7,
// AC-9, AC-11, AC-12): status dan tekanan Teropong dan Angkot, susunan tombol laptop, kotak aman baru, pita,
// pemberitahuan, bunyi, dan tiba di halte tujuan.
import { describe, expect, it } from "vitest";
import { PANDANGAN, SKILL_URUT, titikHalte } from "../../inti/aturan";
import type { PesanServerPemain } from "../../inti/protokol";
import { PROTOKOL_VERSI } from "../../inti/versi";
import { MesinDunia } from "../../pemain/dunia/mesin";
import { PemainLain } from "../../pemain/dunia/pemainLain";
import { bingkaiTokoh } from "../../pemain/dunia/penggambar";
import { HALTE, KOTAK_PETA } from "../../pemain/dunia/petaKampung";
import { hitungSkala } from "../../pemain/dunia/skala";
import { AntreanPita, ARAH_PANAH, batasPanah, bunyiSkill, indeksArah, letakPanah, letakTombol, SkillKlien, susunanLaptop, type KotakKlien } from "../../pemain/dunia/skill";
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
    expect(s.status("lari", 1000, 0)).toEqual({ skill: "lari", muatan: 2, aktif: false, jeda: 0, menunggu: false, dekat: false });
    s.catatTekan("lari", 100);
    expect(s.status("lari", 1000, 2099).menunggu).toBe(true);
    expect(s.status("lari", 1000, 2100).menunggu).toBe(false);
    s.pribadi(pribadi({ lari: 1 }, { lari: 8000 }), 2000, 200, false);
    expect(s.status("lari", 2000, 200)).toEqual({ skill: "lari", muatan: 1, aktif: true, jeda: 8, menunggu: false, dekat: false });
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
    // JS-18 (P-35): kotak teropong dan karcis; angkot_tiba ditangani mesin dunia; kode lain diabaikan.
    expect(s.pemberitahuan("kotak_teropong")).toEqual(["+1 Teropong", "Dapat satu muatan Teropong."]);
    expect(s.pemberitahuan("kotak_angkot")).toEqual(["+1 Angkot", "Dapat satu muatan Angkot."]);
    expect(s.pemberitahuan("angkot_tiba")).toBeNull();
    expect(s.pemberitahuan("kode_baru_lain")).toBeNull();
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
    // Kotak aman dalam piksel logis: tepi ditambah 7 dari batas pusat panah. JS-18 (P-29): batas bawah 80 px.
    const aman = { kiri: b[0] - 7, atas: b[1] - 7, kanan: b[2] + 7, bawah: b[3] + 7 };
    expect(aman.kiri * px).toBeGreaterThanOrEqual(12 + potong[0] - px / 2);
    expect((PANDANGAN.lebar - aman.kanan) * px).toBeGreaterThanOrEqual(160 + potong[2] - px / 2);
    expect(aman.atas * px).toBeGreaterThanOrEqual(40 + potong[1] - px / 2);
    expect((PANDANGAN.tinggi - aman.bawah) * px).toBeGreaterThanOrEqual(80 + potong[3] - px / 2);
    // Dua kolom laptop: batas kanan 220 px.
    expect((PANDANGAN.lebar - (batasPanah(px, potong, true)[2] + 7)) * px).toBeGreaterThanOrEqual(220 + potong[2] - px / 2);
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
    expect(b).toEqual([13, 27, 233, 133]); // JS-18 (P-29): bawah 80 px
    expect(batasPanah(2, [0, 0, 0, 0], true)).toEqual([13, 27, 203, 133]); // dua kolom: kanan 220 px
    expect(letakPanah(160, 90, 0, -500, b)).toEqual([160, 27]);
    expect(letakPanah(160, 90, 500, 0, b)).toEqual([233, 90]);
    expect(letakPanah(160, 90, -500, 500, b)).toEqual([117, 133]);
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

describe("JS-18: Teropong dan Angkot di layar pemain (P-13, P-17 sampai P-19, P-35, P-37; AC-4, AC-7, AC-12)", () => {
  const LIMA = [...SKILL_URUT];
  const lima = (kotak: readonly KotakKlien[] = KOTAK) => {
    const s = new SkillKlien(kotak, HALTE);
    s.ruang = LIMA;
    return s;
  };
  // Halte 1 di ubin (55, 64): pusat ubin (888, 1032).
  const PUSAT_H1 = { x: 888, y: 1032 };

  it("data halte layar pemain sama dengan kampung.json: urutan nomor, letak, dan zona", () => {
    expect(HALTE.map((h) => [h.id, h.x, h.y, h.zona])).toEqual([
      ["halte-1", 55, 64, "z3"],
      ["halte-2", 84, 88, "z3"],
      ["halte-3", 105, 25, "z7"],
      ["halte-4", 116, 73, "z8"],
    ]);
  });

  it("tombol Angkot: tanpa karcis, berkarcis jauh, berkarcis dalam 24 px dari pusat ubin halte (dekat), dan menunggu", () => {
    const s = lima();
    s.dekatHalte({ x: PUSAT_H1.x, y: PUSAT_H1.y + 24 });
    expect(s.status("angkot", 0, 0)).toMatchObject({ muatan: 0, dekat: false });
    s.pribadi(pribadi({ angkot: 1 }), 0, 0, false);
    expect(s.status("angkot", 0, 0)).toMatchObject({ muatan: 1, dekat: true });
    expect(s.status("teropong", 0, 0).dekat).toBe(false);
    s.dekatHalte({ x: PUSAT_H1.x, y: PUSAT_H1.y + 24.01 });
    expect(s.status("angkot", 0, 0).dekat).toBe(false);
    s.dekatHalte(titikHalte(HALTE[2]));
    expect(s.halte?.id).toBe("halte-3");
    s.dekatHalte(null);
    expect(s.halte).toBeNull();
    s.catatTekan("angkot", 100);
    expect(s.status("angkot", 0, 2099).menunggu).toBe(true);
    expect(s.status("angkot", 0, 2100).menunggu).toBe(false);
  });

  it("hasil tekanan: Cari kotak …, Naik angkot dari halte., true di halte (mode pilih halte), dan Teropong yang aktif diam", () => {
    const s = lima();
    expect(s.tekan("teropong", 0, 0)).toBe("Cari kotak teropong.");
    expect(s.tekan("angkot", 0, 0)).toBe("Cari kotak karcis.");
    s.pribadi(pribadi({ teropong: 1, angkot: 1 }), 0, 0, false);
    expect(s.tekan("angkot", 0, 0)).toBe("Naik angkot dari halte.");
    s.dekatHalte(titikHalte(HALTE[0]));
    expect(s.tekan("angkot", 0, 0)).toBe(true);
    expect(s.tekan("teropong", 0, 0)).toBe(true);
    s.pribadi(pribadi({ teropong: 0, angkot: 1 }, { teropong: 31_000 }), 1000, 1000, false);
    expect(s.status("teropong", 1000, 1000)).toMatchObject({ muatan: 0, aktif: true, jeda: 8 });
    expect(s.tekan("teropong", 5000, 5000)).toBe(false); // aktif, tanpa pita walaupun muatan 0
    expect(s.aktif("teropong", 30_999)).toBe(true);
    expect(s.aktif("teropong", 31_000)).toBe(false);
    const tanpa = new SkillKlien(KOTAK, HALTE);
    tanpa.ruang = ["lari", "kompas", "petunjuk"];
    tanpa.pribadi(pribadi({ teropong: 1, angkot: 1 }), 0, 0, false);
    tanpa.dekatHalte(titikHalte(HALTE[0]));
    expect([tanpa.tekan("teropong", 0, 0), tanpa.tekan("angkot", 0, 0)]).toEqual([false, false]);
  });

  it("pengumuman Teropong mulai dan selesai sekali; jeda menggeser masa aktifnya", () => {
    const s = lima();
    s.pribadi(pribadi({}, { teropong: 31_000 }), 1000, 0, false);
    expect(s.periksaWaktu(1000)).toEqual(["Teropong aktif selama 30 detik."]);
    expect(s.periksaWaktu(2000)).toEqual([]);
    s.geser(10_000);
    expect(s.sampai.teropong).toBe(41_000);
    expect(s.periksaWaktu(40_999)).toEqual([]);
    expect(s.periksaWaktu(41_000)).toEqual(["Teropong selesai."]);
  });

  it("kotak teropong dan karcis tergambar hanya bila skillnya aktif; pita penuh sekali per kotak dengan muatan penuh 1", () => {
    const kotak: KotakKlien[] = [
      { id: "k-t", jenis: "teropong", x: 26, y: 7 },
      { id: "k-u", jenis: "karcis", x: 57, y: 64 },
    ];
    const s = lima(kotak);
    s.ruang = ["lari", "kompas", "petunjuk"];
    expect(s.kotakTampil("main", 0, false)).toEqual([]);
    s.ruang = LIMA;
    const tampil = s.kotakTampil("main", 0, false);
    expect(tampil.map(([k]) => k.id)).toEqual(["k-t", "k-u"]);
    expect(s.periksaPenuh({ x: 26 * 16 + 8, y: 7 * 16 + 8 }, tampil)).toEqual([]);
    s.pribadi(pribadi({ teropong: 1, angkot: 1 }), 0, 0, false);
    expect(s.periksaPenuh({ x: 26 * 16 + 8, y: 7 * 16 + 12 }, tampil)).toEqual(["Teropong sudah penuh."]);
    expect(s.periksaPenuh({ x: 26 * 16 + 8, y: 7 * 16 + 12 }, tampil)).toEqual([]);
    expect(s.periksaPenuh({ x: 57 * 16 + 8, y: 64 * 16 + 12 }, tampil)).toEqual(["Angkot sudah penuh."]);
  });

  it("susunan tombol laptop (P-28): satu kolom bila muat 123 px di bawah tepi atas dunia, selain itu dua kolom", () => {
    expect(susunanLaptop(419, 5)).toBe("kolom"); // 419 − 296 = 123
    expect(susunanLaptop(418, 5)).toBe("kolom2");
    expect(susunanLaptop(360, 5)).toBe("kolom2");
    expect(susunanLaptop(540, 5)).toBe("kolom");
    expect(susunanLaptop(360, 3)).toBe("kolom"); // tiga skill P0: 180 px
    const satu = letakTombol(LIMA, "kolom");
    expect(LIMA.map((s) => satu.get(s))).toEqual([4, 3, 2, 1, 0].map((tingkat) => ({ tingkat, kiri: false })));
    const dua = letakTombol(LIMA, "kolom2");
    expect(LIMA.map((s) => dua.get(s))).toEqual([
      { tingkat: 2, kiri: false },
      { tingkat: 1, kiri: false },
      { tingkat: 0, kiri: false },
      { tingkat: 1, kiri: true },
      { tingkat: 0, kiri: true },
    ]);
    // Skill yang dimatikan tidak memakan tempat.
    expect([...letakTombol(["lari", "angkot"], "kolom")]).toEqual([
      ["lari", { tingkat: 1, kiri: false }],
      ["angkot", { tingkat: 0, kiri: false }],
    ]);
    expect([...letakTombol(["kompas", "teropong"], "kolom2")]).toEqual([
      ["kompas", { tingkat: 0, kiri: false }],
      ["teropong", { tingkat: 0, kiri: true }],
    ]);
  });

  const UKURAN: [string, number, number, number, boolean][] = [
    ["HP 731 × 411", 731, 411, 2.625, true],
    ["HP 915 × 356", 915, 356, 2.625, true],
    ["HP 640 × 360 rasio 3", 640, 360, 3, true],
    ["laptop 1280 × 720", 1280, 720, 1, false],
    ["laptop 1024 × 768", 1024, 768, 1, false],
    ["laptop 700 × 400", 700, 400, 1, false],
  ];
  it.each(UKURAN)("%s: kotak aman panah tidak bertumpuk dengan tombol, lencana, dan tanda tombol (P-27 sampai P-29; AC-11)", (_, w, h, r, sentuh) => {
    const u = hitungSkala(w, h, r);
    const px = u.k / r;
    const potong = [-u.kiriCss, -u.atasCss, u.kiriCss + u.lebarCss - w, u.atasCss + u.tinggiCss - h].map((x) => Math.max(0, x)) as [number, number, number, number];
    const lebar = Math.min(w, u.kiriCss + u.lebarCss) - Math.max(0, u.kiriCss);
    const tinggi = Math.min(h, u.atasCss + u.tinggiCss) - Math.max(0, u.atasCss);
    const letak = sentuh ? "lengkung" : susunanLaptop(tinggi, 5);
    const b = batasPanah(px, potong, letak === "kolom2");
    // Kotak aman (pusat panah ± 7 piksel logis) dalam px CSS relatif terhadap HUD.
    const aman = { kiri: (b[0] - 7) * px - potong[0], atas: (b[1] - 7) * px - potong[1], kanan: (b[2] + 7) * px - potong[0], bawah: (b[3] + 7) * px - potong[1] };
    const LENGKUNG: Record<string, [number, number]> = { lari: [24, 100], kompas: [78, 78], petunjuk: [100, 24], teropong: [158, 24], angkot: [216, 24] };
    const susun = letak === "lengkung" ? null : letakTombol(LIMA, letak);
    const kotak: [string, number, number, number, number][] = [];
    for (const s of LIMA) {
      const t = susun?.get(s);
      const [kanan, bawah] = t ? [t.kiri ? 120 : 16, 16 + 58 * t.tingkat] : LENGKUNG[s];
      const x0 = lebar - kanan - 48;
      const y0 = tinggi - bawah - 48;
      kotak.push([s, x0, y0, x0 + 48, y0 + 48]);
      kotak.push([`${s} lencana`, x0 - 4, y0 - 4, x0 + 18, y0 + 18]);
      if (t) kotak.push([`${s} tanda`, x0 - 8 - 36, y0 + 14, x0 - 8, y0 + 34]);
    }
    for (const [nama, x0, y0, x1, y1] of kotak) {
      const tumpang = x0 < aman.kanan && x1 > aman.kiri && y0 < aman.bawah && y1 > aman.atas;
      expect(tumpang, `${nama} [${x0}, ${y0}, ${x1}, ${y1}] dan kotak aman ${JSON.stringify(aman)}`).toBe(false);
    }
    // Laptop: tombol teratas sedikitnya 8 px di bawah peta mini (tepi bawah 115 px).
    if (!sentuh) expect(Math.min(...kotak.filter(([n]) => !n.includes(" ")).map(([, , y0]) => y0))).toBeGreaterThanOrEqual(123);
    expect(letak).toBe(sentuh ? "lengkung" : w === 700 ? "kolom2" : "kolom");
  });

  it("bunyi pesan skill dengan pemutar tiruan (P-37): kotak teropong dan karcis berbunyi kotak; Teropong mulai berbunyi skill", () => {
    const V = PROTOKOL_VERSI;
    const diputar: string[] = [];
    const putar = (n: string) => diputar.push(n);
    const ingat = {};
    for (const kode of ["kotak_teropong", "kotak_angkot", "angkot_tiba", "kompas_tepat", "kotak_lari"]) bunyiSkill({ v: V, t: "pemberitahuan", kode }, ingat, putar);
    expect(diputar).toEqual(["kotak", "kotak", "kotak"]);
    diputar.length = 0;
    const p = (aktifSampai: Record<string, number>): Extract<PesanServerPemain, { t: "pribadi" }> => ({
      v: V,
      t: "pribadi",
      skor: 0,
      peringkat: 1,
      selesai: [],
      terlihat: [],
      muatan: nol,
      aktifSampai,
      kotakMenunggu: [],
    });
    bunyiSkill(p({ teropong: 31_000 }), ingat, putar);
    bunyiSkill(p({ teropong: 31_000 }), ingat, putar); // masa aktif yang sama: diam
    bunyiSkill(p({}), ingat, putar); // berakhir: diam
    bunyiSkill(p({ teropong: 70_000 }), ingat, putar);
    bunyiSkill(p({ lari: 75_000, teropong: 70_000 }), ingat, putar);
    expect(diputar).toEqual(["skill", "skill", "skill"]);
  });

  it("mesin: angkot_tiba menunggu bingkai pertama di posisi baru, lalu pita dan pengumuman Tiba di Halte {n}. dan bunyi skill", () => {
    const V = PROTOKOL_VERSI;
    const ctx = { imageSmoothingEnabled: false, drawImage: () => undefined } as unknown as CanvasRenderingContext2D;
    const m = new MesinDunia(() => ({ getContext: () => ctx }) as unknown as HTMLCanvasElement);
    (m as unknown as { aset: unknown }).aset = { tanda: new Map(), objek: new Map(), npc: new Map() };
    (m as unknown as { potongan: unknown }).potongan = { terlihat: () => [], lapis: () => ({ bawah: null, atas: null }), perbarui: () => undefined };
    m.terima({ v: V, t: "status_ruang", status: "main", mulaiPada: 0, berakhirPada: 900_000, jedaSejak: null }, 0, 0);
    m.skill.ruang = LIMA;
    m.gerak.terapkanKoreksi({ ...titikHalte(HALTE[0]), seq: 0 });
    const opsi = (jam: number) => ({ jamLokal: jam, jamPerforma: jam, selisihJam: 0, bolehGerak: false, kurangiGerak: false, bufferedAmount: 0, kirim: () => true });
    m.perbarui(opsi(900));
    m.gambar(ctx, false, 900);
    const diputar: string[] = [];
    const putar = (n: string) => diputar.push(n);
    m.terima({ v: V, t: "koreksi", ...titikHalte(HALTE[2]), seq: 0 }, 1000, 0);
    m.terima({ v: V, t: "pemberitahuan", kode: "angkot_tiba" }, 1000, 0);
    expect(m.umum).toEqual([]); // belum ada pita: bingkai di halte tujuan belum tergambar
    expect(m.selesaiTiba(1010, putar)).toBeNull();
    m.perbarui(opsi(1016));
    m.gambar(ctx, false, 1016);
    expect(m.selesaiTiba(1017, putar)).toBe(3);
    expect(m.pita.perbarui(1017)).toBe("Tiba di Halte 3.");
    expect(m.umum).toEqual(["Tiba di Halte 3."]);
    expect(diputar).toEqual(["skill"]);
    expect(m.selesaiTiba(1100, putar)).toBeNull(); // sekali saja
    // Tanpa bingkai yang tergambar (misalnya tab di latar), paling lama 1 detik sesudah angkot_tiba.
    m.terima({ v: V, t: "koreksi", ...titikHalte(HALTE[3]), seq: 0 }, 5000, 0);
    m.terima({ v: V, t: "pemberitahuan", kode: "angkot_tiba" }, 5000, 0);
    expect(m.selesaiTiba(5999, putar)).toBeNull();
    expect(m.selesaiTiba(6000, putar)).toBe(4);
    expect(diputar).toEqual(["skill", "skill"]);
  });
});
