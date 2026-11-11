// Layar dunia (spesifikasi JS-07; Design System 3.2 sampai 3.4, 6, 10, 11, dan 13; Architecture 9): kanvas dunia
// dengan skala bulat, garis pindai, kanvas label nama beresolusi perangkat, dan HUD React di atasnya (panel lobi,
// hitung mundur, bilah atas, peta mini dan peta besar, joystick, ajakan putar HP). Satu loop requestAnimationFrame
// memperbarui mesin dunia, menggambar, dan menulis ringkasan kecil di atribut data kanvas untuk uji.
// JS-08: tombol Periksa dan ajakan E, dialog kejadian, skor di bilah atas, penanda di peta, kelompok histogram 100 ms,
// dan angka fps bila alamat diakhiri #fps (P-18 sampai P-25, P-39, P-51 sampai P-54, P-57, P-68, P-70).
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as PointerEventReact } from "react";
import { TANDA, IKON } from "../assets/manifest";
import DialogKejadian, { type AksiDialog } from "../bersama/DialogKejadian";
import { modeRingkas, TINGGI_BILAH_PX, type KeadaanDialog } from "../bersama/dialogKeadaan";
import { PANDANGAN } from "../inti/aturan";
import type { PesanPemain } from "../inti/protokol";
import type { StatusRuang } from "../inti/tipe";
import { isiTeks, TEKS } from "../teks";
import AjakanPutar from "./AjakanPutar";
import BilahAtas from "./BilahAtas";
import { KAKI } from "./dunia/penggambar";
import { hitungLangit, type Langit, type WaktuRuangKlien } from "./dunia/langit";
import { perangkatSentuh, TOMBOL_GULIR, type KeadaanJoystick } from "./dunia/masukan";
import type { MesinDunia } from "./dunia/mesin";
import { hitungSkala, type UkuranDunia } from "./dunia/skala";
import Joystick from "./Joystick";
import { LapisanHitungMundur } from "./LayarRonde";
import PanelLobi from "./PanelLobi";
import PetaBesar from "./PetaBesar";
import PetaMini, { gambarPetaMini, type PenandaPeta } from "./PetaMini";
import { AjakanPeriksa, TombolPeriksa } from "./TombolPeriksa";

type PesanGerak = Extract<PesanPemain, { t: "gerak" }>;

/** Tinggi bilah atas (px CSS, Design System 3.3). */
const TINGGI_BILAH = TINGGI_BILAH_PX;
/** Batas atas kelompok waktu kode gambar per bingkai (ms), untuk histogram di atribut data kanvas (AC-19; JS-08 P-68). */
export const KELOMPOK_WAKTU = [1, 2, 3, 4, 6, 8, 12, 16, 25, 50, 100, Infinity] as const;

/**
 * Bentuk dan mode dialog (P-39): mode ringkas bila tinggi area dialog (dunia yang tampil dikurangi bilah atas) kurang
 * dari 560 px CSS; lembar di perangkat sentuh dengan tinggi tampilan ≤ 500 px, selain itu panel 70%.
 */
export function areaDialog(lebar: number, tinggi: number, rasio: number, sentuh: boolean): { ringkas: boolean; bentuk: "lembar" | "panel" } {
  const u = hitungSkala(lebar, tinggi, rasio);
  const tinggiHud = Math.min(tinggi, u.atasCss + u.tinggiCss) - Math.max(0, u.atasCss);
  return { ringkas: modeRingkas(tinggiHud - TINGGI_BILAH), bentuk: sentuh && tinggi <= 500 ? "lembar" : "panel" };
}

/** Kelompok histogram p95 untuk angka fps (P-70). */
function kelompokP95(h: readonly number[]): number {
  const total = h.reduce((a, b) => a + b, 0);
  let k = 0;
  for (let i = 0; i < h.length; i++) {
    k += h[i];
    if (k >= 0.95 * total) return KELOMPOK_WAKTU[i];
  }
  return KELOMPOK_WAKTU[KELOMPOK_WAKTU.length - 1];
}
/** Label nama: paling banyak 8 pemain lain terdekat (P-23, D-1a): Pixelify Sans 13 px, jarak dalam 2 px, garis 1 px. */
const LABEL = { maks: 8, huruf: 13, jarak: 2, garis: 1 } as const;

function ukuranLayar(): UkuranDunia {
  return hitungSkala(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);
}

function persentil(nilai: number[], q: number): number {
  if (nilai.length === 0) return 0;
  const s = [...nilai].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
}

export interface PropsLayarDunia {
  mesin: MesinDunia;
  status: StatusRuang;
  waktu: WaktuRuangKlien;
  durasiMenit: number;
  kode: string;
  diri: { nama: string; avatar: number } | null;
  jumlahPemain: number;
  menyambung: boolean;
  selisihJam: () => number;
  kirim: (p: PesanGerak) => boolean;
  bufferedAmount: () => number;
  umumkan: (teks: string) => void;
  // JS-08
  skor: number;
  peringkat: number;
  dialog: KeadaanDialog | null;
  ruangUji: boolean;
  menungguPeriksa: boolean;
  saatDialog: (a: AksiDialog) => void;
  saatPeriksa: (kejadianId: string) => void;
  saatRingkas: (ringkas: boolean) => void;
}

export default function LayarDunia(props: PropsLayarDunia) {
  const { mesin, status, waktu, durasiMenit, kode, diri, jumlahPemain, menyambung, selisihJam, kirim, bufferedAmount, umumkan } = props;
  const { skor, peringkat, dialog, ruangUji, menungguPeriksa, saatDialog, saatPeriksa, saatRingkas } = props;
  const [ukuran, setUkuran] = useState<UkuranDunia>(ukuranLayar);
  const [layar, setLayar] = useState(() => ({ lebar: window.innerWidth, tinggi: window.innerHeight, rasio: window.devicePixelRatio || 1 }));
  const sentuh = useMemo(() => perangkatSentuh(window), []);
  const [petaBesar, setPetaBesar] = useState(false);
  const [joystick, setJoystick] = useState<KeadaanJoystick | null>(null);
  const [langit, setLangit] = useState<Langit>(() => hitungLangit(waktu, durasiMenit, Date.now() + selisihJam()));
  const [pita, setPita] = useState(false);
  const [kurangiGerak, setKurangiGerak] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  const kanvas = useRef<HTMLCanvasElement | null>(null);
  const label = useRef<HTMLCanvasElement | null>(null);
  const mini = useRef<HTMLCanvasElement | null>(null);
  const kotak = useRef<HTMLDivElement | null>(null);
  const tegak = sentuh && layar.tinggi > layar.lebar;
  const ronde = status === "main" || status === "jeda";
  const lobi = status === "lobi" || status === "hitung_mundur";
  const adaDialog = dialog !== null;
  const [jangkauan, setJangkauan] = useState<string | null>(null);
  const [penanda, setPenanda] = useState<{ daftar: PenandaPeta[]; terlihat: number; selesai: number }>({ daftar: [], terlihat: 0, selesai: 0 });
  const [fps, setFps] = useState<string | null>(null);

  // Nilai terbaru untuk loop bingkai tanpa memasang ulang loop.
  const terbaru = useRef({ menyambung, petaBesar, tegak, kurangiGerak, ukuran, rasio: layar.rasio, kirim, bufferedAmount, selisihJam, adaDialog, menungguPeriksa });
  useEffect(() => {
    terbaru.current = { menyambung, petaBesar, tegak, kurangiGerak, ukuran, rasio: layar.rasio, kirim, bufferedAmount, selisihJam, adaDialog, menungguPeriksa };
  });

  // Periksa (P-23, P-24): pemain berhenti dan laporan berhenti dikirim lebih dulu, lalu `periksa`.
  const periksa = useCallback(() => {
    const kodeKejadian = mesin.jangkauan;
    const t = terbaru.current;
    if (!kodeKejadian || t.adaDialog || t.menungguPeriksa || t.petaBesar || t.menyambung || t.tegak || status !== "main") return;
    mesin.hentiUntukPeriksa(Date.now(), t.kirim);
    saatPeriksa(kodeKejadian);
  }, [mesin, saatPeriksa, status]);

  // Pengumuman jangkauan sekali per pendekatan (P-25); jaraknya diatur antrean pengumuman (2 detik).
  const jangkauanSebelum = useRef<string | null>(null);
  useEffect(() => {
    const sebelum = jangkauanSebelum.current;
    jangkauanSebelum.current = jangkauan;
    if (jangkauan && !sebelum) umumkan(TEKS.pengumuman.dekat);
  }, [jangkauan, umumkan]);

  // Dialog tertutup: fokus kembali ke dunia (P-47).
  const dialogSebelum = useRef(adaDialog);
  useEffect(() => {
    if (dialogSebelum.current && !adaDialog) kanvas.current?.focus();
    dialogSebelum.current = adaDialog;
  }, [adaDialog]);

  // Ukuran jendela atau orientasi berubah: skala dihitung ulang (P-1).
  useEffect(() => {
    const ubah = () => {
      setUkuran(ukuranLayar());
      setLayar({ lebar: window.innerWidth, tinggi: window.innerHeight, rasio: window.devicePixelRatio || 1 });
    };
    window.addEventListener("resize", ubah);
    window.addEventListener("orientationchange", ubah);
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const gerak = () => setKurangiGerak(mq?.matches ?? false);
    mq?.addEventListener?.("change", gerak);
    return () => {
      window.removeEventListener("resize", ubah);
      window.removeEventListener("orientationchange", ubah);
      mq?.removeEventListener?.("change", gerak);
    };
  }, []);

  // Langit dan bilah atas diperiksa 4 kali per detik (P-30 sampai P-32); React hanya digambar ulang bila
  // yang tampil berubah (jam, sisa waktu per detik, masa, dua menit terakhir, atau letak matahari).
  useEffect(() => {
    let kunciTampil = "";
    const perbarui = () => {
      const l = hitungLangit(waktu, durasiMenit, Date.now() + selisihJam());
      const kunci = `${l.jam}|${Math.ceil(l.sisaMs / 1000)}|${l.masa}|${l.duaMenit}|${Math.round(l.kemajuan * 144)}`;
      if (kunci === kunciTampil) return;
      kunciTampil = kunci;
      setLangit(l);
    };
    const awal = window.setTimeout(perbarui, 0);
    const id = window.setInterval(perbarui, 250);
    return () => {
      window.clearTimeout(awal);
      window.clearInterval(id);
    };
  }, [waktu, durasiMenit, selisihJam]);

  // Dua menit terakhir: pita 3 detik dan pengumuman sekali per penurunan (P-32).
  const duaMenitSebelum = useRef(langit.duaMenit);
  useEffect(() => {
    const sebelum = duaMenitSebelum.current;
    duaMenitSebelum.current = langit.duaMenit;
    if (!langit.duaMenit || sebelum || status !== "main") return;
    setPita(true);
    umumkan(TEKS.dunia.duaMenit);
    const id = window.setTimeout(() => setPita(false), 3000);
    return () => window.clearTimeout(id);
  }, [langit.duaMenit, status, umumkan]);

  // Peta besar hanya selama ronde; tertutup sendiri bila ronde berhenti.
  const tutupPetaBesar = useCallback(() => {
    setPetaBesar(false);
    kanvas.current?.focus();
  }, []);
  useEffect(() => {
    if (!ronde && petaBesar) {
      const id = window.setTimeout(() => setPetaBesar(false), 0);
      return () => window.clearTimeout(id);
    }
  }, [ronde, petaBesar]);

  // Keyboard (P-12, P-37, P-39).
  useEffect(() => {
    const m = mesin.masukan;
    const turun = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      // Selama dialog terbuka, papan ketik milik dialog: avatar diam dan P tidak membuka peta besar (P-51).
      if (terbaru.current.adaDialog) return;
      // E, atau Enter pada dunia yang terfokus, memeriksa kejadian dalam jangkauan (P-23).
      if ((e.code === "KeyE" && !(t && t.tagName === "BUTTON")) || (e.key === "Enter" && t === kanvas.current)) {
        if (mesin.jangkauan && !e.repeat) {
          e.preventDefault();
          periksa();
          return;
        }
      }
      if (e.code === "KeyP" && ronde) {
        e.preventDefault();
        if (terbaru.current.petaBesar) tutupPetaBesar();
        else {
          m.lepasSemua();
          setPetaBesar(true);
        }
        return;
      }
      if (e.code === "Escape" && terbaru.current.petaBesar) {
        e.preventDefault();
        tutupPetaBesar();
        return;
      }
      if (m.tekan(e.code) && TOMBOL_GULIR.has(e.code)) e.preventDefault();
    };
    const naik = (e: KeyboardEvent) => m.lepas(e.code);
    const lepas = () => m.lepasSemua();
    const terlihat = () => {
      if (document.visibilityState !== "visible") m.lepasSemua();
    };
    window.addEventListener("keydown", turun);
    window.addEventListener("keyup", naik);
    window.addEventListener("blur", lepas);
    document.addEventListener("visibilitychange", terlihat);
    return () => {
      window.removeEventListener("keydown", turun);
      window.removeEventListener("keyup", naik);
      window.removeEventListener("blur", lepas);
      document.removeEventListener("visibilitychange", terlihat);
      m.lepasSemua();
    };
  }, [mesin, ronde, tutupPetaBesar, periksa]);

  // Joystick sentuh (P-13): sentuhan pertama di separuh kiri dunia, bukan di tombol HUD.
  const titikDunia = (e: PointerEventReact<HTMLElement>) => {
    const r = kotak.current?.getBoundingClientRect();
    return { x: e.clientX - (r?.left ?? 0), y: e.clientY - (r?.top ?? 0), lebar: r?.width ?? 0 };
  };
  const saatTurun = (e: PointerEventReact<HTMLElement>) => {
    if (!sentuh || e.pointerType === "mouse" || petaBesar || tegak || adaDialog) return;
    if ((e.target as Element).closest("button, a, [role='dialog']")) return;
    const p = titikDunia(e);
    if (mesin.masukan.mulaiJoystick(e.pointerId, p.x, p.y, p.lebar)) {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setJoystick({ ...(mesin.masukan.joystick as KeadaanJoystick) });
    }
  };
  const saatGeser = (e: PointerEventReact<HTMLElement>) => {
    const p = titikDunia(e);
    if (mesin.masukan.gerakJoystick(e.pointerId, p.x, p.y)) setJoystick({ ...(mesin.masukan.joystick as KeadaanJoystick) });
  };
  const saatAngkat = (e: PointerEventReact<HTMLElement>) => {
    if (mesin.masukan.akhiriJoystick(e.pointerId)) setJoystick(null);
  };

  // Font label nama dimuat sebelum dipakai di kanvas.
  useEffect(() => {
    void document.fonts?.load(`${LABEL.huruf}px "Pixelify Sans"`).catch(() => undefined);
  }, []);

  // Loop bingkai.
  useEffect(() => {
    const logis = document.createElement("canvas");
    logis.width = PANDANGAN.lebar;
    logis.height = PANDANGAN.tinggi;
    const ctxLogis = logis.getContext("2d");
    // Gambar label per nama disimpan, agar teks tidak disusun ulang setiap bingkai (hanya sesudah huruf termuat).
    const gambarLabel = new Map<string, HTMLCanvasElement>();
    const gambarMini = { tandaDiri: null as HTMLImageElement | null, halte: null as HTMLImageElement | null };
    const muatIkon = (url: string) => {
      const img = new Image();
      img.src = url;
      return img;
    };
    gambarMini.tandaDiri = muatIkon(TANDA.tanda_diri.url);
    gambarMini.halte = muatIkon(IKON.ikon_mini_halte.url);
    const gambarKejadian = { kejadian: muatIkon(IKON.ikon_mini_kejadian.url), selesai: muatIkon(IKON.ikon_mini_selesai.url) };
    // Satu detik terakhir untuk angka fps (P-70).
    const detik = { mulai: 0, bingkai: 0, histogram: KELOMPOK_WAKTU.map(() => 0) };
    let kunciPenanda = "";
    let jangkauanTampil: string | null = null;
    const catatan = { gambar: [] as number[], selang: [] as number[], tulis: 0, sebelum: 0, bagian: [0, 0, 0, 0, 0] };
    // Histogram kumulatif waktu kode gambar per bingkai sejak layar dipasang (AC-19).
    const histogram: number[] = KELOMPOK_WAKTU.map(() => 0);
    // Kotak label bingkai sebelumnya: hanya kotak itu yang dibersihkan, bukan seluruh kanvas label.
    let kotorLabel: [number, number, number, number][] = [];
    let ukuranLabel = "";
    let kunciMini = "";
    let kanvasMini: HTMLCanvasElement | null = null;
    let id = 0;
    const bingkai = (jam: number) => {
      id = requestAnimationFrame(bingkai);
      const t = terbaru.current;
      const mulai = performance.now();
      let t0 = mulai;
      const ukurBagian = (i: number) => {
        const t1 = performance.now();
        catatan.bagian[i] += t1 - t0;
        t0 = t1;
      };
      mesin.perbarui({
        jamLokal: Date.now(),
        jamPerforma: jam,
        selisihJam: t.selisihJam(),
        bolehGerak: !t.menyambung && !t.petaBesar && !t.tegak && !t.adaDialog && !t.menungguPeriksa,
        kurangiGerak: t.kurangiGerak,
        bufferedAmount: t.bufferedAmount(),
        kirim: t.kirim,
      });
      ukurBagian(0);
      const kv = kanvas.current;
      const ctx = kv?.getContext("2d");
      if (kv && ctx && ctxLogis && mesin.siapGambar && !t.tegak) {
        mesin.gambar(ctxLogis, t.kurangiGerak, Date.now());
        ukurBagian(1);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(logis, 0, 0, kv.width, kv.height);
        ukurBagian(2);
        // Label nama di kanvas kedua beresolusi perangkat (P-23).
        const kl = label.current;
        const cl = kl?.getContext("2d");
        if (kl && cl) {
          const ukuranKini = `${kl.width}x${kl.height}`;
          if (ukuranKini !== ukuranLabel) {
            ukuranLabel = ukuranKini;
            kotorLabel = [];
            cl.clearRect(0, 0, kl.width, kl.height);
          }
          for (const [x, y, w, h] of kotorLabel) cl.clearRect(x - 1, y - 1, w + 2, h + 2);
          kotorLabel = [];
          const r = t.rasio;
          const k = t.ukuran.k;
          const huruf = Math.round(LABEL.huruf * r);
          const jarak = Math.round(LABEL.jarak * r);
          const garis = Math.max(1, Math.round(LABEL.garis * r));
          const hurufSiap = document.fonts?.check(`${huruf}px "Pixelify Sans"`) ?? false;
          for (const l of mesin.labelTerdekat(LABEL.maks)) {
            const kunci = `${l.nama}|${huruf}`;
            let g = hurufSiap ? gambarLabel.get(kunci) : undefined;
            if (!g) {
              g = document.createElement("canvas");
              const cg = g.getContext("2d");
              if (!cg) continue;
              cg.font = `${huruf}px "Pixelify Sans", monospace`;
              const w = Math.ceil(cg.measureText(l.nama).width);
              g.width = w + 2 * jarak + 2 * garis;
              g.height = huruf + 2 * jarak + 2 * garis;
              cg.fillStyle = "#1F2A44";
              cg.fillRect(0, 0, g.width, g.height);
              cg.fillStyle = "#FFF6E0";
              cg.fillRect(garis, garis, g.width - 2 * garis, g.height - 2 * garis);
              cg.fillStyle = "#1F2A44";
              cg.font = `${huruf}px "Pixelify Sans", monospace`;
              cg.textBaseline = "middle";
              cg.fillText(l.nama, garis + jarak, g.height / 2 + garis / 2);
              if (hurufSiap) gambarLabel.set(kunci, g);
            }
            const cx = Math.round((Math.round(l.x) - mesin.kamera.x) * k);
            const atasKepala = Math.round((Math.round(l.y) - KAKI.y - mesin.kamera.y) * k);
            const x0 = cx - Math.round(g.width / 2);
            const y0 = atasKepala - g.height - jarak;
            cl.drawImage(g, x0, y0);
            kotorLabel.push([x0, y0, g.width, g.height]);
          }
        }
        ukurBagian(3);
        const km = mini.current;
        const cm = km?.getContext("2d");
        if (km && cm && gambarMini.tandaDiri?.complete && gambarMini.halte?.complete) {
          // Peta mini digambar ulang hanya bila posisi (per ubin), arah, ukuran, atau penanda kejadian berubah.
          const p = mesin.gerak.posisi;
          const kunci = `${km.width}x${km.height}:${p ? `${Math.round(p.x / 16)},${Math.round(p.y / 16)},${mesin.gerak.arah}` : "-"}:${kunciPenanda}`;
          if (kunci !== kunciMini || km !== kanvasMini) {
            kunciMini = kunci;
            kanvasMini = km;
            const daftar = mesin.kejadian.daftar().map((x) => ({ x: x.x, y: x.y, selesai: mesin.kejadian.selesai.has(x.kejadianId) }));
            gambarPetaMini(cm, t.rasio, { ...gambarMini, ...gambarKejadian }, p ? { x: p.x, y: p.y, arah: mesin.gerak.arah } : null, daftar);
          }
        } else {
          kunciMini = "";
        }
        ukurBagian(4);
      }
      const akhir = performance.now();
      catatan.gambar.push(akhir - mulai);
      const kelompok = KELOMPOK_WAKTU.findIndex((b) => akhir - mulai < b);
      histogram[kelompok]++;
      // Jangkauan Periksa dan penanda peta hanya memicu React bila berubah (P-19, P-21).
      if (mesin.jangkauan !== jangkauanTampil) {
        jangkauanTampil = mesin.jangkauan;
        setJangkauan(jangkauanTampil);
      }
      const kunciBaru = `${mesin.kejadian.jumlahTitik}:${mesin.kejadian.selesai.size}`;
      if (kunciBaru !== kunciPenanda) {
        kunciPenanda = kunciBaru;
        setPenanda({
          daftar: mesin.kejadian.daftar().map((x) => ({ x: x.x, y: x.y, selesai: mesin.kejadian.selesai.has(x.kejadianId) })),
          terlihat: mesin.kejadian.kodeTerlihat().size,
          selesai: mesin.kejadian.selesai.size,
        });
      }
      // Angka fps untuk satu detik terakhir, hanya bila alamat diakhiri #fps; tidak ada yang disimpan atau dikirim (P-70).
      detik.bingkai++;
      detik.histogram[kelompok]++;
      if (akhir - detik.mulai >= 1000) {
        const tampilFps = window.location.hash === "#fps";
        setFps(tampilFps ? isiTeks(TEKS.dunia.fps, { fps: Math.round((detik.bingkai * 1000) / Math.max(1, akhir - detik.mulai)), kelompok: kelompokP95(detik.histogram) }) : null);
        detik.mulai = akhir;
        detik.bingkai = 0;
        detik.histogram = KELOMPOK_WAKTU.map(() => 0);
      }
      if (catatan.sebelum > 0) catatan.selang.push(jam - catatan.sebelum);
      catatan.sebelum = jam;
      // Ringkasan setiap 500 ms di atribut data kanvas, untuk uji ujung ke ujung (AC-19) dan pemeriksaan.
      if (kv && akhir - catatan.tulis >= 500) {
        catatan.tulis = akhir;
        const p = mesin.gerak.posisi;
        kv.dataset.skala = String(t.ukuran.k);
        kv.dataset.kamera = `${mesin.kamera.x},${mesin.kamera.y}`;
        kv.dataset.diri = p ? `${Math.round(p.x)},${Math.round(p.y)}` : "";
        const lain = mesin.tokoh.filter((x) => !x.diri);
        kv.dataset.lain = String(lain.length);
        const dekat = mesin.labelTerdekat(1)[0];
        kv.dataset.terdekat = dekat ? `${Math.round(dekat.x)},${Math.round(dekat.y)}` : "";
        kv.dataset.masa = mesin.masa;
        kv.dataset.potongan = String(mesin.jumlahPotongan);
        kv.dataset.siluet = mesin.siluetTerakhir ? "ya" : "tidak";
        kv.dataset.gambarP95 = persentil(catatan.gambar, 0.95).toFixed(2);
        kv.dataset.gambarMaks = Math.max(0, ...catatan.gambar).toFixed(2);
        kv.dataset.selangMaks = Math.max(0, ...catatan.selang).toFixed(1);
        kv.dataset.bingkai = String(catatan.gambar.length);
        kv.dataset.histogram = histogram.join(",");
        // JS-08 (P-20): titik kejadian terlihat, kejadian selesai, kejadian dalam jangkauan, gelembung pemain lain,
        // serta tokoh dan properti kejadian yang tergambar.
        kv.dataset.kejadian = String(mesin.kejadian.jumlahTitik);
        kv.dataset.selesai = String(mesin.kejadian.selesai.size);
        kv.dataset.jangkauan = mesin.jangkauan ?? "";
        kv.dataset.dialogLain = String(mesin.jumlahDialogLain);
        kv.dataset.tokohKejadian = String(mesin.jumlahTokohKejadian);
        // Rata-rata per bingkai: perbarui, gambar, perbesar, label, peta mini (ms).
        kv.dataset.rincian = catatan.bagian.map((v) => (v / Math.max(1, catatan.gambar.length)).toFixed(2)).join(",");
        catatan.bagian = [0, 0, 0, 0, 0];
        catatan.gambar = [];
        catatan.selang = [];
      }
    };
    id = requestAnimationFrame(bingkai);
    return () => cancelAnimationFrame(id);
  }, [mesin]);

  // Ukuran layar berubah saat dialog terbuka: mode ringkas mengikuti (P-39).
  const ringkasKini = modeRingkas(Math.min(layar.tinggi, ukuran.atasCss + ukuran.tinggiCss) - Math.max(0, ukuran.atasCss) - TINGGI_BILAH);
  useEffect(() => {
    if (!dialog || dialog.ringkas === ringkasKini) return;
    const id = window.setTimeout(() => saatRingkas(ringkasKini), 0);
    return () => window.clearTimeout(id);
  }, [dialog, ringkasKini, saatRingkas]);

  // Kotak dunia di layar (px CSS) dan kotak HUD: irisan kotak dunia dengan jendela.
  const kiri = ukuran.kiriCss;
  const atas = ukuran.atasCss;
  const hud = {
    left: Math.max(0, kiri),
    top: Math.max(0, atas),
    width: Math.min(layar.lebar, kiri + ukuran.lebarCss) - Math.max(0, kiri),
    height: Math.min(layar.tinggi, atas + ukuran.tinggiCss) - Math.max(0, atas),
  };
  const hitungMundur = status === "hitung_mundur" && waktu.mulaiPada !== null;
  const p = mesin.gerak.posisi;
  const ringkas = modeRingkas(hud.height - TINGGI_BILAH);
  const bentuk: "lembar" | "panel" = sentuh && layar.tinggi <= 500 ? "lembar" : "panel";
  const tampilPeriksa = status === "main" && !adaDialog && !petaBesar && !menyambung && !tegak;

  return (
    <main
      className="js-dunia"
      data-status={status}
      onPointerDown={saatTurun}
      onPointerMove={saatGeser}
      onPointerUp={saatAngkat}
      onPointerCancel={saatAngkat}
    >
      {ronde ? <h1 className="js-sr">{TEKS.ronde.berjalan}</h1> : null}
      <div ref={kotak} className="js-dunia-kotak" style={{ left: kiri, top: atas, width: ukuran.lebarCss, height: ukuran.tinggiCss }}>
        <canvas
          ref={kanvas}
          className="js-kanvas-dunia"
          width={ukuran.lebarPerangkat}
          height={ukuran.tinggiPerangkat}
          style={{ width: ukuran.lebarCss, height: ukuran.tinggiCss }}
          tabIndex={0}
          role="application"
          aria-label={TEKS.dunia.label}
        />
        <div className="js-garis-pindai" aria-hidden="true" />
        <canvas
          ref={label}
          className="js-kanvas-label"
          width={ukuran.lebarPerangkat}
          height={ukuran.tinggiPerangkat}
          style={{ width: ukuran.lebarCss, height: ukuran.tinggiCss }}
          aria-hidden="true"
        />
      </div>
      <div className="js-hud" style={hud}>
        {lobi ? <PanelLobi kode={kode} nama={diri?.nama ?? ""} avatar={diri?.avatar ?? 0} jumlah={jumlahPemain} umumkan={umumkan} /> : null}
        {hitungMundur ? <LapisanHitungMundur mulaiPada={waktu.mulaiPada as number} selisihJam={selisihJam} /> : null}
        {ronde ? (
          <BilahAtas langit={langit} denyut={langit.duaMenit && !kurangiGerak && status === "main"} skor={skor} peringkat={peringkat} kurangiGerak={kurangiGerak} />
        ) : null}
        {ronde && !petaBesar && !(adaDialog && bentuk === "lembar") ? <PetaMini kanvasRef={mini} rasio={layar.rasio} saatBuka={() => setPetaBesar(true)} /> : null}
        {tampilPeriksa && sentuh ? <TombolPeriksa dekat={jangkauan !== null} ditekan={menungguPeriksa} saatTekan={periksa} /> : null}
        {tampilPeriksa && !sentuh && jangkauan ? <AjakanPeriksa /> : null}
        {fps ? (
          <p className="js-fps" aria-hidden="true">
            {fps}
          </p>
        ) : null}
        {dialog && ronde ? (
          status === "jeda" ? (
            // Selama jeda, dialog disembunyikan tanpa ditutup di bawah lapisan pekat (P-52, D-6).
            <div className="js-dialog-jeda" style={{ top: TINGGI_BILAH }} aria-hidden="true" />
          ) : (
            <div className="js-dialog-wadah" data-bentuk={bentuk} data-ringkas={ringkas ? "ya" : "tidak"} style={{ top: TINGGI_BILAH }}>
              <DialogKejadian d={dialog} bentuk={bentuk} ruangUji={ruangUji} saatAksi={saatDialog} />
            </div>
          )
        ) : null}
        {pita ? (
          <p className="js-pita" role="status">
            {TEKS.dunia.duaMenit}
          </p>
        ) : null}
        {petaBesar && ronde ? (
          <div className="js-peta-besar-wadah" style={{ top: TINGGI_BILAH }}>
            <PetaBesar
              lebar={hud.width}
              tinggi={hud.height - TINGGI_BILAH}
              rasio={layar.rasio}
              diri={p ? { x: p.x, y: p.y, arah: mesin.gerak.arah } : null}
              saatTutup={tutupPetaBesar}
              kejadian={penanda.daftar}
              ringkasan={{ terlihat: penanda.terlihat, selesai: penanda.selesai }}
            />
          </div>
        ) : null}
        <Joystick j={joystick} />
      </div>
      {tegak ? <AjakanPutar /> : null}
    </main>
  );
}
