// Layar dunia (spesifikasi JS-07; Design System 3.2 sampai 3.4, 6, 10, 11, dan 13; Architecture 9): kanvas dunia
// dengan skala bulat, garis pindai, kanvas label nama beresolusi perangkat, dan HUD React di atasnya (panel lobi,
// hitung mundur, bilah atas, peta mini dan peta besar, joystick, ajakan putar HP). Satu loop requestAnimationFrame
// memperbarui mesin dunia, menggambar, dan menulis ringkasan kecil di atribut data kanvas untuk uji.
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as PointerEventReact } from "react";
import { TANDA, IKON } from "../assets/manifest";
import { PANDANGAN } from "../inti/aturan";
import type { PesanPemain } from "../inti/protokol";
import type { StatusRuang } from "../inti/tipe";
import { TEKS } from "../teks";
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
import PetaMini, { gambarPetaMini } from "./PetaMini";

type PesanGerak = Extract<PesanPemain, { t: "gerak" }>;

/** Tinggi bilah atas (px CSS, Design System 3.3). */
const TINGGI_BILAH = 28;
/** Batas atas kelompok waktu kode gambar per bingkai (ms), untuk histogram di atribut data kanvas (AC-19). */
export const KELOMPOK_WAKTU = [1, 2, 3, 4, 6, 8, 12, 16, 25, 50, Infinity] as const;
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
}

export default function LayarDunia(props: PropsLayarDunia) {
  const { mesin, status, waktu, durasiMenit, kode, diri, jumlahPemain, menyambung, selisihJam, kirim, bufferedAmount, umumkan } = props;
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

  // Nilai terbaru untuk loop bingkai tanpa memasang ulang loop.
  const terbaru = useRef({ menyambung, petaBesar, tegak, kurangiGerak, ukuran, rasio: layar.rasio, kirim, bufferedAmount, selisihJam });
  useEffect(() => {
    terbaru.current = { menyambung, petaBesar, tegak, kurangiGerak, ukuran, rasio: layar.rasio, kirim, bufferedAmount, selisihJam };
  });

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
  }, [mesin, ronde, tutupPetaBesar]);

  // Joystick sentuh (P-13): sentuhan pertama di separuh kiri dunia, bukan di tombol HUD.
  const titikDunia = (e: PointerEventReact<HTMLElement>) => {
    const r = kotak.current?.getBoundingClientRect();
    return { x: e.clientX - (r?.left ?? 0), y: e.clientY - (r?.top ?? 0), lebar: r?.width ?? 0 };
  };
  const saatTurun = (e: PointerEventReact<HTMLElement>) => {
    if (!sentuh || e.pointerType === "mouse" || petaBesar || tegak) return;
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
        bolehGerak: !t.menyambung && !t.petaBesar && !t.tegak,
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
          // Peta mini digambar ulang hanya bila posisi (per ubin), arah, atau ukurannya berubah.
          const p = mesin.gerak.posisi;
          const kunci = `${km.width}x${km.height}:${p ? `${Math.round(p.x / 16)},${Math.round(p.y / 16)},${mesin.gerak.arah}` : "-"}`;
          if (kunci !== kunciMini || km !== kanvasMini) {
            kunciMini = kunci;
            kanvasMini = km;
            gambarPetaMini(cm, t.rasio, gambarMini, p ? { x: p.x, y: p.y, arah: mesin.gerak.arah } : null);
          }
        } else {
          kunciMini = "";
        }
        ukurBagian(4);
      }
      const akhir = performance.now();
      catatan.gambar.push(akhir - mulai);
      histogram[KELOMPOK_WAKTU.findIndex((b) => akhir - mulai < b)]++;
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
        {ronde ? <BilahAtas langit={langit} denyut={langit.duaMenit && !kurangiGerak && status === "main"} /> : null}
        {ronde && !petaBesar ? <PetaMini kanvasRef={mini} rasio={layar.rasio} saatBuka={() => setPetaBesar(true)} /> : null}
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
            />
          </div>
        ) : null}
        <Joystick j={joystick} />
      </div>
      {tegak ? <AjakanPutar /> : null}
    </main>
  );
}
