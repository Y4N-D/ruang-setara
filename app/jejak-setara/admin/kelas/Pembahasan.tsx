// Pembahasan per kejadian (spesifikasi JS-10, P-29): navigasi ← dan →, data diminta sekali per kejadian lalu disimpan.
import type { ReactNode } from "react";
import { forwardRef } from "react";
import type { PesanServerKelas } from "../../inti/protokol-kelas";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import KartuBahas from "./KartuBahas";
import { persenPilihan } from "./tampilan-kelas";

type P<T extends PesanServerKelas["t"]> = Extract<PesanServerKelas, { t: T }>;
const t = TEKS_KONSOL.kelas;

interface PropsBahas {
  info: P<"info_kelas">;
  indeks: number;
  bahas: Record<string, P<"data_pembahasan">>;
  pindah: (arah: -1 | 1) => void;
  tutup: () => void;
  /** JS-14 (P-55). */
  tombolPemain?: ReactNode;
}

const Pembahasan = forwardRef<HTMLDivElement, PropsBahas>(function Pembahasan({ info, indeks, bahas, pindah, tutup, tombolPemain }, ref) {
  const kejadian = info.kejadian[indeks];
  const data = kejadian ? bahas[kejadian.id] : undefined;
  const menjawab = data ? persenPilihan(data.opsi1.map((o) => o.jumlah)).menjawab : 0;
  return (
    <div className="js-kelas-layar js-kelas-malam">
      <header className="js-kelas-kepala js-kelas-kepala-malam">
        <span className="js-kelas-judul">{t.bahasJudul}</span>
        <span className="js-kelas-besar">{isiTeks(t.bahasPosisi, { i: indeks + 1, n: info.kejadian.length, m: menjawab })}</span>
      </header>
      {data && kejadian ? <KartuBahas ref={ref} data={data} zona={kejadian.zona} /> : <p className="js-kelas-podium-kosong">{t.bahasMemuat}</p>}
      <div className="js-kelas-kontrol">
        {tombolPemain}
        <button type="button" className="js-kelas-tombol" onClick={() => pindah(-1)} disabled={indeks === 0}>
          {t.sebelumnya} <kbd>←</kbd>
        </button>
        <span className="js-kelas-tombol-grup">
          <button type="button" className="js-kelas-tombol" onClick={tutup}>
            {t.tutupRuang}
          </button>
          <button type="button" className="js-kelas-tombol js-kelas-tombol-utama" onClick={() => pindah(1)} disabled={indeks >= info.kejadian.length - 1}>
            {t.berikutnya} <kbd>→</kbd>
          </button>
        </span>
      </div>
    </div>
  );
});

export default Pembahasan;
