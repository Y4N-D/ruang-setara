// Peta besar (spesifikasi JS-07, P-37 sampai P-39; DRAF D-3 dan D-4 pilihan a): menutupi dunia di bawah bilah atas,
// dengan skala bulat terbesar yang muat (paling kecil 2 px per ubin), zona berwarna, nama dan ikon setiap zona di
// tengahnya, halte, dan panah diri berlabel "Kamu di sini". Ditutup dengan tombol, P, atau Esc. JS-08 (P-19): penanda
// kejadian yang terlihat 14 × 14 px dan ringkasan "Kejadian terlihat n, selesai m." di bawah judul. JS-23 (P-11 sampai
// P-13): medan 4 px per ubin dengan zona berwarna sebagai cadangan, label zona di sudut kiri atas zona, dan urutan lapisan.
// JS-18 (P-21, P-33, P-34): lingkaran Teropong, dan mode "Pilih halte tujuan" dengan tombol halte di peta, daftar halte
// tujuan di kanan peta, fokus yang berputar di dalam peta besar, dan keadaan menunggu jawaban.
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { IKON, PETA, TANDA } from "../assets/manifest";
import type { Arah } from "../inti/tipe";
import { isiTeks, TEKS } from "../teks";
import { letakLabelZona, MEDAN } from "./dunia/medan";
import { HALTE, UKURAN_PETA, ZONA } from "./dunia/petaKampung";
import { gambarZona, type PenandaPeta } from "./PetaMini";

/** Ruang untuk judul dan tombol Tutup peta (px CSS), di atas peta. */
const KEPALA = 56;
const BINGKAI_DIRI: Record<Arah, number> = { bawah: 0, atas: 1, kanan: 2, kiri: 3 };

/** Piksel CSS per ubin: bilangan bulat terbesar yang muat, paling kecil 2 (P-38). */
export function skalaPetaBesar(lebar: number, tinggi: number): number {
  return Math.max(2, Math.floor(Math.min((lebar - 16) / UKURAN_PETA.lebar, (tinggi - KEPALA - 8) / UKURAN_PETA.tinggi)));
}

/** JS-18 (P-21): mode "Pilih halte tujuan". */
export interface PilihHalte {
  /** Nomor halte asal (urutan di kampung.json). */
  dari: number;
  /** Id halte yang dipilih selama menunggu jawaban server, atau null. */
  dipilih: string | null;
  saatPilih: (id: string) => void;
}

/** JS-18 (P-21 butir 4): `Tab` dan `Shift+Tab` berputar di antara tombol peta besar yang bisa difokus. */
function putarTab(e: KeyboardEvent<HTMLDivElement>): void {
  if (e.key !== "Tab") return;
  const tombol = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("button:not([tabindex='-1'])")];
  if (tombol.length === 0) return;
  const i = tombol.indexOf(document.activeElement as HTMLButtonElement);
  e.preventDefault();
  tombol[(i + (e.shiftKey ? tombol.length - 1 : 1)) % tombol.length].focus();
}

export default function PetaBesar({
  lebar,
  tinggi,
  rasio,
  diri,
  saatTutup,
  kejadian = [],
  ringkasan = { terlihat: 0, selesai: 0 },
  teropong = false,
  halte = null,
}: {
  lebar: number;
  tinggi: number;
  rasio: number;
  diri: { x: number; y: number; arah: Arah } | null;
  saatTutup: () => void;
  kejadian?: readonly PenandaPeta[];
  ringkasan?: { terlihat: number; selesai: number };
  /** JS-18 (P-33): Teropong aktif. */
  teropong?: boolean;
  /** JS-18 (P-21): mode "Pilih halte tujuan", atau null untuk peta besar biasa. */
  halte?: PilihHalte | null;
}) {
  const s = skalaPetaBesar(lebar, tinggi);
  const kanvas = useRef<HTMLCanvasElement | null>(null);
  const tutup = useRef<HTMLButtonElement | null>(null);
  const daftar = useRef<HTMLUListElement | null>(null);
  const menunggu = halte?.dipilih != null;
  // JS-23 (P-11): medan4 bila sudah siap, zona berwarna v1.0 sebagai cadangan; digambar ulang saat gambar menjadi siap.
  const [medanSiap, setMedanSiap] = useState(0);
  useEffect(() => MEDAN.dengar(() => setMedanSiap((n) => n + 1)), []);
  useLayoutEffect(() => {
    const ctx = kanvas.current?.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    const medan = MEDAN.ambil(PETA.medan4);
    if (medan) ctx.drawImage(medan, 0, 0, ctx.canvas.width, ctx.canvas.height);
    else gambarZona(ctx, s * rasio, 0, Math.max(1, Math.round(rasio)));
  }, [s, rasio, medanSiap]);
  // Fokus awal: tombol Tutup peta, atau tombol pertama daftar halte di mode pilih halte (JS-18, P-21 butir 4).
  const modeHalte = halte !== null;
  useEffect(() => {
    (modeHalte ? daftar.current?.querySelector("button") : tutup.current)?.focus();
  }, [modeHalte]);
  const ikonHalte = 2 * 7;
  const lebarPeta = UKURAN_PETA.lebar * s;
  // JS-18 (P-21 butir 3): daftar selebar ruang kanan peta dikurangi 16 px, dari tepi atas peta sampai tepi bawah lapisan.
  const lebarDaftar = Math.max(0, (lebar - lebarPeta) / 2 - 16);
  const tujuan = halte ? HALTE.filter((_, i) => i + 1 !== halte.dari) : [];
  const nomor = (id: string) => HALTE.findIndex((h) => h.id === id) + 1;
  const pilih = (id: string) => {
    if (halte && !menunggu) halte.saatPilih(id);
  };
  return (
    <div
      className="js-peta-besar"
      role="dialog"
      aria-modal="true"
      aria-labelledby="js-peta-besar-judul"
      data-mode={halte ? "halte" : undefined}
      onKeyDown={halte ? putarTab : undefined}
    >
      <div className="js-peta-besar-kepala">
        <div className="js-peta-besar-judul">
          <h2 id="js-peta-besar-judul">{halte ? TEKS.peta.judulHalte : TEKS.peta.judul}</h2>
          <p className="js-ringkasan-kejadian">
            {halte ? isiTeks(TEKS.peta.dariHalte, { n: halte.dari }) : isiTeks(TEKS.peta.ringkasanKejadian, { n: ringkasan.terlihat, m: ringkasan.selesai })}
          </p>
        </div>
        <button ref={tutup} type="button" className="js-tombol" aria-disabled={menunggu ? true : undefined} onClick={() => (menunggu ? undefined : saatTutup())}>
          {halte ? TEKS.peta.batal : TEKS.peta.tutup}
        </button>
      </div>
      <div className="js-peta-besar-isi" data-teropong={teropong && diri ? "ya" : "tidak"} style={{ width: lebarPeta, height: UKURAN_PETA.tinggi * s }}>
        <canvas
          ref={kanvas}
          width={Math.round(UKURAN_PETA.lebar * s * rasio)}
          height={Math.round(UKURAN_PETA.tinggi * s * rasio)}
          style={{ width: UKURAN_PETA.lebar * s, height: UKURAN_PETA.tinggi * s }}
          aria-hidden="true"
        />
        {HALTE.map((h) => (
          // eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js
          <img
            key={h.id}
            className="js-peta-halte"
            src={IKON.ikon_mini_halte.url}
            alt={TEKS.peta.halte}
            width={ikonHalte}
            height={ikonHalte}
            style={{ left: (h.x + 0.5) * s - ikonHalte / 2, top: (h.y + 0.5) * s - ikonHalte / 2 }}
          />
        ))}
        {[...kejadian]
          .sort((a, b) => Number(b.selesai) - Number(a.selesai))
          .map((k) => (
            // eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js
            <img
              key={`${k.x},${k.y}`}
              className="js-peta-kejadian"
              data-selesai={k.selesai ? "ya" : undefined}
              src={k.selesai ? IKON.ikon_mini_selesai.url : IKON.ikon_mini_kejadian.url}
              alt=""
              width={14}
              height={14}
              style={{ left: (k.x + 0.5) * s - 7, top: (k.y + 0.5) * s - 7 }}
            />
          ))}
        {ZONA.map((z) => {
          const n = Number(z.id.slice(1));
          const l = letakLabelZona(z, s);
          return (
            <span key={z.id} className="js-label-zona" style={{ left: l.kiri, top: l.atas, maxWidth: l.lebarMaks }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
              <img src={IKON[`ikon_zona_${n}`]?.url} alt="" width={16} height={16} />
              {z.nama}
            </span>
          );
        })}
        {teropong && diri ? (
          // JS-18 (P-33, P-34): jari-jari 12s px di garis tengah `sun` 2 px, dengan garis `ink` 1 px di dalam dan luarnya.
          <span
            className="js-peta-teropong"
            aria-hidden="true"
            style={{ left: (diri.x / 16) * s - 12 * s - 1, top: (diri.y / 16) * s - 12 * s - 1, width: 24 * s + 2, height: 24 * s + 2 }}
          />
        ) : null}
        {diri ? (
          <span className="js-kamu" style={{ left: (diri.x / 16) * s, top: (diri.y / 16) * s }}>
            <span
              className="js-kamu-panah"
              aria-hidden="true"
              style={{ backgroundImage: `url(${TANDA.tanda_diri.url})`, backgroundPosition: `${-BINGKAI_DIRI[diri.arah] * 21}px 0` }}
            />
            <span className="js-kamu-label">{TEKS.peta.kamuDiSini}</span>
          </span>
        ) : null}
        {tujuan.map((h) => (
          // JS-18 (P-21 butir 2): tombol halte di atas semua lapisan, hanya untuk ketuk dan klik.
          <button
            key={h.id}
            type="button"
            className="js-halte-peta"
            tabIndex={-1}
            aria-hidden="true"
            data-halte={h.id}
            data-dipilih={halte?.dipilih === h.id ? "ya" : undefined}
            aria-disabled={menunggu ? true : undefined}
            style={{ left: (h.x + 0.5) * s - 24, top: (h.y + 0.5) * s - 24 }}
            onClick={() => pilih(h.id)}
          >
            {nomor(h.id)}
          </button>
        ))}
        {halte ? (
          <ul ref={daftar} className="js-halte-daftar" style={{ width: lebarDaftar + 12, maxHeight: tinggi - 68 + 12 }}>
            {tujuan.map((h) => {
              const zona = ZONA.find((z) => z.id === h.zona)?.nama ?? "";
              return (
                <li key={h.id}>
                  <button
                    type="button"
                    className="js-halte-pilihan"
                    data-halte={h.id}
                    data-dipilih={halte.dipilih === h.id ? "ya" : undefined}
                    aria-disabled={menunggu ? true : undefined}
                    aria-label={isiTeks(TEKS.peta.halteTujuan, { n: nomor(h.id), zona })}
                    onClick={() => pilih(h.id)}
                  >
                    <span className="js-halte-lencana" aria-hidden="true">
                      {nomor(h.id)}
                    </span>
                    <span aria-hidden="true">{isiTeks(TEKS.peta.halteNomor, { n: nomor(h.id) })}</span>
                    <span className="js-halte-zona" aria-hidden="true">
                      {zona}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
