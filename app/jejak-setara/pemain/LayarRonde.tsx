// Layar ronde selesai, ruang ditutup, dan galat (spesifikasi JS-03, P-49, D-7), serta lapisan hitung mundur di atas
// dunia (spesifikasi JS-07, P-29). Sejak JS-07, ronde yang berjalan dan jeda tampil di LayarDunia; layar selesai
// dan ditutup tetap layar HTML tanpa dunia (P-41). JS-08 (P-59, D-5): skor dan peringkat akhir. Rekap pribadi di JS-11.
import { useEffect, useState } from "react";
import type { KodeGalat } from "../inti/protokol";
import type { StatusRuang } from "../inti/tipe";
import { isiTeks, TEKS } from "../teks";
import { formatSisa } from "./dunia/langit";
import { Panel } from "./Gabung";

export { formatSisa };

export interface WaktuStatus {
  status: StatusRuang;
  mulaiPada: number | null;
  berakhirPada: number | null;
  jedaSejak: number | null;
}

/** "Bersiap" dan angka 3, 2, lalu 1 di tengah dunia, masing-masing satu detik menurut jam server (P-29). */
export function LapisanHitungMundur({ mulaiPada, selisihJam }: { mulaiPada: number; selisihJam: () => number }) {
  const [kini, setKini] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setKini(Date.now()), 100);
    return () => window.clearInterval(id);
  }, []);
  const n = Math.min(3, Math.max(1, Math.ceil((mulaiPada - (kini + selisihJam())) / 1000)));
  return (
    <div className="js-hitung-mundur" role="status">
      <p className="js-hitung-mundur-judul">{TEKS.ronde.bersiap}</p>
      <p className="js-angka-besar" aria-hidden="true">
        {n}
      </p>
    </div>
  );
}

export interface SkorAkhir {
  skor: number;
  peringkat: number;
  jumlah: number;
}

/** Layar sesudah ronde: "Ronde selesai", skor dan peringkat akhir (P-59); rekap pribadi dibuat di JS-11. */
export function LayarRonde({ akhir = null }: { akhir?: SkorAkhir | null }) {
  return (
    <Panel judul={TEKS.ronde.selesai}>
      {akhir && akhir.skor > 0 ? (
        <div className="js-skor-akhir">
          <p className="js-skor-akhir-angka">{isiTeks(TEKS.ronde.skorAkhir, { skor: akhir.skor })}</p>
          <p>{isiTeks(TEKS.ronde.peringkatAkhir, { n: akhir.peringkat, jumlah: akhir.jumlah })}</p>
        </div>
      ) : (
        <p className="js-isi">{TEKS.ronde.tanpaSkor}</p>
      )}
      <p className="js-isi">{TEKS.ronde.selesaiIsi}</p>
    </Panel>
  );
}

export function LayarDitutup({ saatKembali }: { saatKembali: () => void }) {
  return (
    <Panel judul={TEKS.ronde.ditutup}>
      <p className="js-isi">{TEKS.ronde.ditutupIsi}</p>
      <button type="button" className="js-tombol js-tombol-utama" onClick={saatKembali}>
        {TEKS.tombol.kembali}
      </button>
    </Panel>
  );
}

export function LayarGalat({ kode, saatKembali }: { kode: KodeGalat; saatKembali: () => void }) {
  const muatUlang = kode === "VERSI_BERBEDA";
  return (
    <Panel judul={TEKS.judul}>
      <p className="js-isi">{TEKS.galat[kode]}</p>
      <button type="button" className="js-tombol js-tombol-utama" onClick={muatUlang ? () => window.location.reload() : saatKembali}>
        {muatUlang ? TEKS.tombol.muatUlang : TEKS.tombol.kembali}
      </button>
    </Panel>
  );
}
