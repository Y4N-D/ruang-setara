// Bilah atas selama ronde (spesifikasi JS-07, P-30 sampai P-34; Design System 3.3 dan 10): busur hari mini dengan
// tiga titik masa dan ikon matahari di posisi kemajuan, jam cerita, dan sisa waktu. Skor dan peringkat di JS-08.
import { IKON } from "../assets/manifest";
import { HARI } from "../inti/aturan";
import type { Masa } from "../inti/tipe";
import { isiTeks, TEKS } from "../teks";
import { formatSisa, type Langit } from "./dunia/langit";

/** Busur mini: kurva kuadrat dari kiri bawah, melengkung ke atas, ke kanan bawah (koordinat px CSS). */
const BUSUR = { lebar: 72, tinggi: 22, p0: [6, 18], p1: [36, -8], p2: [66, 18] } as const;

function titikBusur(t: number): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * BUSUR.p0[0] + 2 * u * t * BUSUR.p1[0] + t * t * BUSUR.p2[0],
    y: u * u * BUSUR.p0[1] + 2 * u * t * BUSUR.p1[1] + t * t * BUSUR.p2[1],
  };
}

const TITIK_MASA: readonly { masa: Masa; t: number }[] = [
  { masa: "pagi", t: 0 },
  { masa: "siang", t: HARI.ambangSiang },
  { masa: "sore", t: HARI.ambangSore },
];

export default function BilahAtas({ langit, denyut }: { langit: Langit; denyut: boolean }) {
  const matahari = titikBusur(langit.kemajuan);
  const sisa = formatSisa(langit.sisaMs);
  return (
    <div className="js-bilah" data-masa={langit.masa}>
      <div className="js-bilah-kiri">
        <div className="js-busur" data-denyut={denyut ? "ya" : undefined}>
          <svg width={BUSUR.lebar} height={BUSUR.tinggi} viewBox={`0 0 ${BUSUR.lebar} ${BUSUR.tinggi}`} aria-hidden="true" focusable="false">
            <path d={`M${BUSUR.p0.join(" ")} Q${BUSUR.p1.join(" ")} ${BUSUR.p2.join(" ")}`} fill="none" stroke="#1F2A44" strokeWidth={2} />
          </svg>
          {TITIK_MASA.map(({ masa, t }) => {
            const p = titikBusur(t);
            return (
              <span
                key={masa}
                className="js-titik-masa"
                role="img"
                aria-label={TEKS.dunia.masa[masa]}
                data-lewat={langit.kemajuan >= t ? "ya" : undefined}
                style={{ left: p.x - 4, top: p.y - 4 }}
              />
            );
          })}
          {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
          <img className="js-matahari" src={IKON.ikon_matahari.url} alt="" width={16} height={16} style={{ left: matahari.x - 8, top: matahari.y - 8 }} />
        </div>
        <span className="js-jam" aria-label={isiTeks(TEKS.dunia.jamCerita, { jam: langit.jam })}>
          <span aria-hidden="true">{langit.jam}</span>
        </span>
      </div>
      <span className="js-sisa" data-dua-menit={langit.duaMenit ? "ya" : undefined} aria-label={isiTeks(TEKS.dunia.sisaWaktu, { waktu: sisa })}>
        <span aria-hidden="true">{sisa}</span>
      </span>
    </div>
  );
}
