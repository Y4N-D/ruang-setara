// Layar ronde selesai, ruang ditutup, dan galat (spesifikasi JS-03, P-49, D-7), serta lapisan hitung mundur di atas
// dunia (spesifikasi JS-07, P-29). Sejak JS-07, ronde yang berjalan dan jeda tampil di LayarDunia; layar selesai
// dan ditutup tetap layar HTML tanpa dunia (P-41). JS-08 (P-59, D-5): skor dan peringkat akhir. Sejak JS-11, layar
// "Ronde selesai" berisi rekap pribadi dan refleksi di Rekap.tsx (spesifikasi JS-11, P-4 sampai P-9).
import { useEffect, useState, useRef } from "react";
import type { KodeGalat } from "../inti/protokol";
import type { StatusRuang } from "../inti/tipe";
import { TEKS } from "../teks";
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
export function LapisanHitungMundur({ mulaiPada, selisihJam, saatAngka }: { mulaiPada: number; selisihJam: () => number; saatAngka?: (n: number) => void }) {
  const [kini, setKini] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setKini(Date.now()), 100);
    return () => window.clearInterval(id);
  }, []);
  const n = Math.min(3, Math.max(1, Math.ceil((mulaiPada - (kini + selisihJam())) / 1000)));
  // JS-14 (P-22): bunyi hitung pada setiap angka yang tampil.
  const angka = useRef(saatAngka);
  useEffect(() => {
    angka.current = saatAngka;
  });
  useEffect(() => {
    angka.current?.(n);
  }, [n]);
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

/** JS-22 (P-10): layar berhenti karena layanan dihentikan atau putus terlalu lama; tombol memuat ulang halaman. */
export function LayarBerhenti({ jenis }: { jenis: "layanan" | "putus" }) {
  const t = TEKS.berhenti;
  return (
    <Panel judul={jenis === "layanan" ? t.layananJudul : t.putusJudul}>
      <p className="js-isi">{jenis === "layanan" ? t.layananIsi : t.putusIsi}</p>
      <button type="button" className="js-tombol js-tombol-utama" onClick={() => window.location.reload()}>
        {t.cobaLagi}
      </button>
    </Panel>
  );
}
