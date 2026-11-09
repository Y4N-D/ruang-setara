// Peta besar (spesifikasi JS-07, P-37 sampai P-39; DRAF D-3 dan D-4 pilihan a): menutupi dunia di bawah bilah atas,
// dengan skala bulat terbesar yang muat (paling kecil 2 px per ubin), zona berwarna, nama dan ikon setiap zona di
// tengahnya, halte, dan panah diri berlabel "Kamu di sini". Ditutup dengan tombol, P, atau Esc.
import { useEffect, useLayoutEffect, useRef } from "react";
import { IKON, TANDA } from "../assets/manifest";
import type { Arah } from "../inti/tipe";
import { TEKS } from "../teks";
import { HALTE, UKURAN_PETA, ZONA } from "./dunia/petaKampung";
import { gambarZona } from "./PetaMini";

/** Ruang untuk judul dan tombol Tutup peta (px CSS), di atas peta. */
const KEPALA = 56;
const BINGKAI_DIRI: Record<Arah, number> = { bawah: 0, atas: 1, kanan: 2, kiri: 3 };

/** Piksel CSS per ubin: bilangan bulat terbesar yang muat, paling kecil 2 (P-38). */
export function skalaPetaBesar(lebar: number, tinggi: number): number {
  return Math.max(2, Math.floor(Math.min((lebar - 16) / UKURAN_PETA.lebar, (tinggi - KEPALA - 8) / UKURAN_PETA.tinggi)));
}

export default function PetaBesar({
  lebar,
  tinggi,
  rasio,
  diri,
  saatTutup,
}: {
  lebar: number;
  tinggi: number;
  rasio: number;
  diri: { x: number; y: number; arah: Arah } | null;
  saatTutup: () => void;
}) {
  const s = skalaPetaBesar(lebar, tinggi);
  const kanvas = useRef<HTMLCanvasElement | null>(null);
  const tutup = useRef<HTMLButtonElement | null>(null);
  useLayoutEffect(() => {
    const ctx = kanvas.current?.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    gambarZona(ctx, s * rasio, 0, Math.max(1, Math.round(rasio)));
  }, [s, rasio]);
  useEffect(() => {
    tutup.current?.focus();
  }, []);
  const ikonHalte = 2 * 7;
  return (
    <div className="js-peta-besar" role="dialog" aria-modal="true" aria-labelledby="js-peta-besar-judul">
      <div className="js-peta-besar-kepala">
        <h2 id="js-peta-besar-judul">{TEKS.peta.judul}</h2>
        <button ref={tutup} type="button" className="js-tombol" onClick={saatTutup}>
          {TEKS.peta.tutup}
        </button>
      </div>
      <div className="js-peta-besar-isi" style={{ width: UKURAN_PETA.lebar * s, height: UKURAN_PETA.tinggi * s }}>
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
        {ZONA.map((z) => {
          const n = Number(z.id.slice(1));
          return (
            <span key={z.id} className="js-label-zona" style={{ left: ((z.kiri + z.kanan + 1) / 2) * s, top: ((z.atas + z.bawah + 1) / 2) * s }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
              <img src={IKON[`ikon_zona_${n}`]?.url} alt="" width={16} height={16} />
              {z.nama}
            </span>
          );
        })}
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
      </div>
    </div>
  );
}
