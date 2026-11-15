// Peta kelas (spesifikasi JS-10, P-26): delapan kotak zona dengan ikon zona dan titik pemain berwarna tas, tanpa letak
// kejadian. Titik bergerak halus di antara dua kiriman dunia_kelas lewat transisi CSS.
import type { PesanServerKelas } from "../../inti/protokol-kelas";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { ZONA } from "./ikon-kelas";
import { PETA_UBIN, ZONA_KELAS } from "./tampilan-kelas";

type Dunia = Extract<PesanServerKelas, { t: "dunia_kelas" }>;

export default function PetaKelas({ dunia, tas }: { dunia: Dunia | null; tas: ReadonlyMap<string, string> }) {
  const titik = dunia?.p ?? [];
  return (
    <svg className="js-kelas-peta" viewBox={`0 0 ${PETA_UBIN.lebar} ${PETA_UBIN.tinggi}`} role="img" aria-label={isiTeks(TEKS_KONSOL.kelas.petaLabel, { n: titik.length })}>
      {ZONA_KELAS.map(([kiri, atas, kanan, bawah], i) => (
        <g key={i}>
          <rect className={`js-kelas-zona js-kelas-zona-${i + 1}`} x={kiri} y={atas} width={kanan - kiri + 1} height={bawah - atas + 1} />
          <image href={ZONA[i]} x={kiri + 1.5} y={atas + 1.5} width={7} height={7} />
        </g>
      ))}
      {titik.map(([id, x, y, terhubung]) => (
        <rect
          key={id}
          className={`js-kelas-titik js-kelas-tas-${tas.get(id) ?? "sun"}`}
          data-terhubung={terhubung ? "ya" : "tidak"}
          width={2.5}
          height={2.5}
          style={{ transform: `translate(${x / PETA_UBIN.piksel - 1.25}px, ${y / PETA_UBIN.piksel - 2}px)` }}
        />
      ))}
    </svg>
  );
}
