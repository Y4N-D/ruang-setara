// Tombol pilihan A–D dialog kejadian (spesifikasi JS-08, P-41, P-43 sampai P-45; Design System 10): biasa cream,
// terpilih sun dengan ▶ dan cincin dalam, terkunci dengan label "Jawaban tepat" (leaf) atau "Pilihanmu" (mango).
// Makna selalu ditulis, bukan hanya warna. JS-09 (P-29): pilihan yang dicoret Petunjuk bergaris coret, berlatar mist,
// tanpa ▶, tetap bisa difokus, dan dibacakan "{huruf}. {teks}, dicoret Petunjuk".
import { forwardRef } from "react";
import { TEKS } from "../teks";

export interface PropsTombolPilihan {
  huruf: string;
  teks: string;
  terpilih: boolean;
  nonaktif: boolean;
  saatPilih: () => void;
  saatTombol: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  /** JS-09 (P-29): dicoret Petunjuk; tidak bisa dipilih. */
  dicoret?: boolean;
}

const TombolPilihan = forwardRef<HTMLButtonElement, PropsTombolPilihan>(function TombolPilihan({ huruf, teks, terpilih, nonaktif, saatPilih, saatTombol, dicoret = false }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className="js-pilihan-dialog"
      data-pilihan="ya"
      data-dicoret={dicoret ? "ya" : undefined}
      aria-pressed={terpilih && !dicoret}
      aria-disabled={nonaktif || dicoret ? true : undefined}
      onClick={() => {
        if (!nonaktif && !dicoret) saatPilih();
      }}
      onKeyDown={saatTombol}
    >
      <span className="js-huruf" aria-hidden="true">
        {terpilih && !dicoret ? "▶" : ""}
        {huruf}
      </span>
      <span className="js-sr">{huruf}. </span>
      <span className="js-teks-pilihan">{teks}</span>
      {dicoret ? <span className="js-sr">, {TEKS.skill.dicoret}</span> : null}
    </button>
  );
});

export default TombolPilihan;

/** Pilihan yang sudah dikunci di tampilan umpan balik (P-44): bukan tombol, berlabel bila tepat atau pilihan pemain. */
export function PilihanTerkunci({ huruf, teks, label }: { huruf: string; teks: string; label: "tepat" | "pilihanmu" | null }) {
  return (
    <div className="js-pilihan-dialog js-pilihan-terkunci" data-label={label ?? undefined}>
      <span className="js-huruf" aria-hidden="true">
        {huruf}
      </span>
      <span className="js-sr">{huruf}. </span>
      <span className="js-teks-pilihan">{teks}</span>
      {label ? <span className="js-label-pilihan">{label === "tepat" ? TEKS.dialog.jawabanTepat : TEKS.dialog.pilihanmu}</span> : null}
    </div>
  );
}
