// Peta kelas (spesifikasi JS-10, P-26; JS-23, P-16 sampai P-19): gambar medan 4 px per ubin tanpa penghalusan, ikon zona
// di sudut kiri atas setiap zona, dan titik pemain 3 × 3 ubin berwarna tas dengan garis putih dan ink bertebal tetap, tanpa
// letak kejadian. Titik bergerak halus di antara dua kiriman dunia_kelas lewat transisi CSS. Gambar medan diimpor
// langsung, bukan lewat manifest.ts (P-35 JS-10); selama belum siap, latar peta mist (DRAF D-2 pilihan a).
import medan4 from "../../assets/peta/peta_medan_4.png";
import type { PesanServerKelas } from "../../inti/protokol-kelas";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { ZONA } from "./ikon-kelas";
import { letakTitikKelas, PETA_UBIN, ZONA_KELAS } from "./tampilan-kelas";

type Dunia = Extract<PesanServerKelas, { t: "dunia_kelas" }>;

export default function PetaKelas({ dunia, tas }: { dunia: Dunia | null; tas: ReadonlyMap<string, string> }) {
  const titik = dunia?.p ?? [];
  return (
    <svg className="js-kelas-peta" viewBox={`0 0 ${PETA_UBIN.lebar} ${PETA_UBIN.tinggi}`} role="img" aria-label={isiTeks(TEKS_KONSOL.kelas.petaLabel, { n: titik.length })}>
      <image className="js-kelas-medan" href={medan4} x={0} y={0} width={PETA_UBIN.lebar} height={PETA_UBIN.tinggi} preserveAspectRatio="none" />
      {ZONA_KELAS.map(([kiri, atas], i) => (
        <image key={i} className="js-kelas-ikon-zona" href={ZONA[i]} x={kiri + 1.5} y={atas + 1.5} width={7} height={7} />
      ))}
      {titik.map(([id, x, y, terhubung]) => {
        const [gx, gy] = letakTitikKelas(x, y);
        return (
          <g key={id} className="js-kelas-titik" data-terhubung={terhubung ? "ya" : "tidak"} style={{ transform: `translate(${gx}px, ${gy}px)` }}>
            <rect className="js-kelas-titik-luar" width={3} height={3} />
            <rect className={`js-kelas-titik-isi js-kelas-tas-${tas.get(id) ?? "sun"}`} width={3} height={3} />
          </g>
        );
      })}
    </svg>
  );
}
