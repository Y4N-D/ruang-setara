// Aturan ketukan tombol HUD (spesifikasi JS-24, P-7 sampai P-12; AC-5 sampai AC-8): peristiwa dan unsur tiruan, dengan
// jam dan penjadwal yang dikendalikan uji.
import { describe, expect, it } from "vitest";
import { dalamKotak, JEDA_KLIK_MS, klikPertama, PencatatTekan, PERLUASAN_PX, type Penjadwal, type UnsurTekan } from "../../pemain/tekanHud";

function lingkungan() {
  let kini = 1000;
  const tugas = new Map<number, () => void>();
  let berikut = 1;
  const p: Penjadwal = {
    jam: () => kini,
    jadwalkan: (f) => {
      tugas.set(berikut, f);
      return berikut++;
    },
    batalkan: (id) => void tugas.delete(id as number),
  };
  return {
    p,
    maju: (ms: number) => (kini += ms),
    jalankanTugas: () => {
      const semua = [...tugas.values()];
      tugas.clear();
      for (const f of semua) f();
    },
    jumlahTugas: () => tugas.size,
  };
}

/** Tombol 48 × 48 di (100, 200); `isi` adalah sasaran sentuhan yang dimulai di tombol (misalnya gambar di dalamnya). */
function tombol(): UnsurTekan & { lepas: () => void; isi: object } {
  const isi = {};
  let tersambung = true;
  return {
    isi,
    getBoundingClientRect: () => ({ left: 100, top: 200, right: 148, bottom: 248 }),
    get isConnected() {
      return tersambung;
    },
    memuat: (s) => s === isi,
    lepas: () => (tersambung = false),
  };
}

const jari = (pointerId: number, clientX = 120, clientY = 220) => ({ pointerType: "touch", pointerId, clientX, clientY });
function selesai(target: unknown) {
  const e = { changedTouches: [{ target }], cancelable: true, dicegah: 0, preventDefault: () => (e.dicegah += 1) };
  return e;
}

function siapkan() {
  const l = lingkungan();
  let aksi = 0;
  const c = new PencatatTekan(() => (aksi += 1), l.p);
  return { l, c, t: tombol(), aksi: () => aksi };
}

describe("kotak yang diperluas 8 px (P-8)", () => {
  it("titik angkat tepat 8 px di luar masih di dalam; 8,01 px tidak", () => {
    const k = { left: 100, top: 200, right: 148, bottom: 248 };
    expect(PERLUASAN_PX).toBe(8);
    expect(dalamKotak(k, 92, 220)).toBe(true);
    expect(dalamKotak(k, 91.99, 220)).toBe(false);
    expect(dalamKotak(k, 156, 220)).toBe(true);
    expect(dalamKotak(k, 156.01, 220)).toBe(false);
    expect(dalamKotak(k, 120, 192)).toBe(true);
    expect(dalamKotak(k, 120, 191.99)).toBe(false);
    expect(dalamKotak(k, 120, 256)).toBe(true);
    expect(dalamKotak(k, 120, 256.01)).toBe(false);
  });
});

describe("jari yang mengetuk (P-8, P-10)", () => {
  it("satu jari: pointerdown, pointerup, lalu touchend menjalankan aksi sekali, dan touchend dicegah", () => {
    const { l, c, t, aksi } = siapkan();
    c.turun(jari(1));
    c.naik(jari(1), t);
    expect(aksi()).toBe(0); // menunggu touchend
    const e = selesai(t.isi);
    c.sentuhSelesai(e, t);
    expect(aksi()).toBe(1);
    expect(e.dicegah).toBe(1);
    l.jalankanTugas(); // penjadwal cadangan sudah dibatalkan
    expect(aksi()).toBe(1);
  });

  it("jari kedua dan urutan terbalik: pointer mana pun yang menekan tombol ini menjalankan aksinya", () => {
    const { c, t, aksi } = siapkan();
    // Jari 1 memegang analog di dunia (tidak pernah sampai ke tombol); jari 2 mengetuk tombol.
    c.turun(jari(2));
    c.naik(jari(2), t);
    c.sentuhSelesai(selesai(t.isi), t);
    expect(aksi()).toBe(1);
    // Urutan terbalik: jari 3 menekan tombol lebih dulu, jari 4 memegang analog, lalu jari 3 diangkat.
    c.turun(jari(3));
    c.naik(jari(3), t);
    c.sentuhSelesai(selesai(t.isi), t);
    expect(aksi()).toBe(2);
  });

  it("dua tombol berbeda punya pencatat sendiri; pointerup pointer lain tidak menjalankan aksi tombol ini", () => {
    const a = siapkan();
    const l = a.l;
    let aksiB = 0;
    const b = new PencatatTekan(() => (aksiB += 1), l.p);
    const tb = tombol();
    a.c.turun(jari(5));
    b.turun(jari(6));
    a.c.naik(jari(6), a.t); // pointer 6 tidak menekan tombol A
    b.naik(jari(6), tb);
    b.sentuhSelesai(selesai(tb.isi), tb);
    a.c.sentuhSelesai(selesai(tb.isi), a.t); // sentuhan dari tombol B tidak dicegah dan tidak dijalankan oleh A
    expect(a.aksi()).toBe(0);
    expect(aksiB).toBe(1);
    a.c.naik(jari(5), a.t);
    a.c.sentuhSelesai(selesai(a.t.isi), a.t);
    expect(a.aksi()).toBe(1);
  });

  it("tanpa touchend: aksi berjalan sekali lewat penjadwal pada giliran berikutnya", () => {
    const { l, c, t, aksi } = siapkan();
    c.turun(jari(1));
    c.naik(jari(1), t);
    expect(l.jumlahTugas()).toBe(1);
    l.jalankanTugas();
    expect(aksi()).toBe(1);
    c.sentuhSelesai(selesai(t.isi), t); // touchend yang terlambat tidak menjalankan aksi lagi
    expect(aksi()).toBe(1);
  });

  it("touchend yang tidak bisa dibatalkan tidak dicegah, tetapi aksi tetap berjalan sekali", () => {
    const { c, t, aksi } = siapkan();
    c.turun(jari(1));
    c.naik(jari(1), t);
    const e = { ...selesai(t.isi), cancelable: false };
    let dicegah = 0;
    e.preventDefault = () => (dicegah += 1);
    c.sentuhSelesai(e, t);
    expect(dicegah).toBe(0);
    expect(aksi()).toBe(1);
  });
});

describe("tidak ada aksi (P-9)", () => {
  it("jari diangkat lebih dari 8 px di luar kotak; touchend tetap dicegah", () => {
    const { l, c, t, aksi } = siapkan();
    c.turun(jari(1));
    c.naik(jari(1, 156.01, 220), t);
    const e = selesai(t.isi);
    c.sentuhSelesai(e, t);
    l.jalankanTugas();
    expect(aksi()).toBe(0);
    expect(e.dicegah).toBe(1);
    // Tepat 8 px di luar masih menjalankan aksi.
    c.turun(jari(2));
    c.naik(jari(2, 156, 256), t);
    c.sentuhSelesai(selesai(t.isi), t);
    expect(aksi()).toBe(1);
  });

  it("jari yang mulai di luar tombol lalu bergeser masuk tidak menjalankan aksi", () => {
    const { l, c, t, aksi } = siapkan();
    c.naik(jari(7), t); // pointerdown jari 7 tidak pernah sampai ke tombol ini
    c.sentuhSelesai(selesai({}), t); // sasaran sentuhannya unsur lain
    l.jalankanTugas();
    expect(aksi()).toBe(0);
  });

  it("pointercancel membatalkan sentuhan", () => {
    const { l, c, t, aksi } = siapkan();
    c.turun(jari(1));
    c.batal(jari(1));
    c.naik(jari(1), t);
    c.sentuhSelesai(selesai(t.isi), t);
    l.jalankanTugas();
    expect(aksi()).toBe(0);
  });

  it("tombol yang sudah hilang dari layar saat aksinya akan berjalan tidak menjalankan aksi", () => {
    const { l, c, t, aksi } = siapkan();
    c.turun(jari(1));
    c.naik(jari(1), t);
    t.lepas(); // misalnya jari lain lebih dulu membuka peta besar
    const e = selesai(t.isi);
    c.sentuhSelesai(e, t);
    expect(aksi()).toBe(0);
    expect(e.dicegah).toBe(1); // klik pengganti tetap dicegah
    const { l: l2, c: c2, t: t2, aksi: aksi2 } = siapkan();
    c2.turun(jari(1));
    c2.naik(jari(1), t2);
    t2.lepas();
    l2.jalankanTugas(); // juga lewat penjadwal cadangan
    expect(aksi2()).toBe(0);
    expect(l.jumlahTugas()).toBe(0);
  });
});

describe("klik (P-10, P-11)", () => {
  it("klik berjenis touch diabaikan; klik tetikus, papan ketik (detail 0), dan pena menjalankan aksi", () => {
    const { c } = siapkan();
    expect(c.klik({ pointerType: "touch", detail: 1 })).toBe(false);
    expect(c.klik({ pointerType: "mouse", detail: 1 })).toBe(true);
    expect(c.klik({ pointerType: "", detail: 0 })).toBe(true);
    expect(c.klik({ detail: 0 })).toBe(true); // peramban yang mengirim klik sebagai MouseEvent biasa
    expect(c.klik({ pointerType: "pen", detail: 1 })).toBe(true);
  });

  it("klik yang tiba kurang dari 800 ms sesudah aksi sentuh di tombol yang sama diabaikan", () => {
    const { l, c, t, aksi } = siapkan();
    c.turun(jari(1));
    c.naik(jari(1), t);
    c.sentuhSelesai(selesai(t.isi), t);
    expect(aksi()).toBe(1);
    expect(JEDA_KLIK_MS).toBe(800);
    l.maju(799);
    expect(c.klik({ detail: 1 })).toBe(false);
    l.maju(1);
    expect(c.klik({ detail: 1 })).toBe(true);
  });

  it("penyaring klik tombol suara (detail ≤ 1): klik kedua dari klik ganda tetikus tidak membalik lagi", () => {
    const { c } = siapkan();
    expect(klikPertama({ detail: 0 })).toBe(true);
    expect(klikPertama({ detail: 1 })).toBe(true);
    expect(klikPertama({ detail: 2 })).toBe(false);
    expect(c.klik({ pointerType: "mouse", detail: 1 }, klikPertama)).toBe(true);
    expect(c.klik({ pointerType: "mouse", detail: 2 }, klikPertama)).toBe(false);
  });
});
