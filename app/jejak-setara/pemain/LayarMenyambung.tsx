// Lapisan Menyambung ulang dan Dijeda (spesifikasi JS-03, P-29 dan bagian "Status antarmuka").
import { useEffect, useState } from "react";
import { TEKS } from "../teks";

export function LapisanMenyambung({ sejak }: { sejak: number }) {
  const [kini, setKini] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setKini(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const lama = kini - sejak;
  return (
    <div className="js-lapisan" role="dialog" aria-modal="true" aria-label={TEKS.menyambung.judul}>
      <div className="js-lapisan-isi">
        <span className="js-ikon-menyambung" aria-hidden="true" />
        <p className="js-lapisan-judul">{TEKS.menyambung.judul}</p>
        {lama >= 30_000 ? <p>{TEKS.menyambung.lama}</p> : null}
        {lama >= 120_000 ? (
          <button type="button" className="js-tombol js-tombol-utama" onClick={() => window.location.reload()}>
            {TEKS.tombol.muatUlang}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function LapisanJeda() {
  return (
    <div className="js-lapisan" role="dialog" aria-modal="true" aria-label={TEKS.ronde.dijeda}>
      <div className="js-lapisan-isi">
        <p className="js-lapisan-judul">{TEKS.ronde.dijeda}</p>
      </div>
    </div>
  );
}
