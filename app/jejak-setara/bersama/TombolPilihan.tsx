// Tombol pilihan A–D dialog kejadian (spesifikasi JS-08, P-41, P-43 sampai P-45; Design System 10): biasa cream,
// terpilih sun dengan ▶ dan cincin dalam, terkunci dengan label "Jawaban tepat" (leaf) atau "Pilihanmu" (mango).
// Makna selalu ditulis, bukan hanya warna.
import { forwardRef } from "react";
import { TEKS } from "../teks";

export interface PropsTombolPilihan {
  huruf: string;
  teks: string;
  terpilih: boolean;
  nonaktif: boolean;
  saatPilih: () => void;
  saatTombol: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const TombolPilihan = forwardRef<HTMLButtonElement, PropsTombolPilihan>(function TombolPilihan({ huruf, teks, terpilih, nonaktif, saatPilih, saatTombol }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className="js-pilihan-dialog"
      data-pilihan="ya"
      aria-pressed={terpilih}
      aria-disabled={nonaktif ? true : undefined}
      onClick={() => {
        if (!nonaktif) saatPilih();
      }}
      onKeyDown={saatTombol}
    >
      <span className="js-huruf" aria-hidden="true">
        {terpilih ? "▶" : ""}
        {huruf}
      </span>
      <span className="js-sr">{huruf}. </span>
      <span className="js-teks-pilihan">{teks}</span>
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
