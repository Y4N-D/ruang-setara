// Layar sementara ronde, ruang ditutup, dan galat (spesifikasi JS-03, P-49, D-7). Diganti di JS-07 dan JS-11.
import { useEffect, useState } from "react";
import type { KodeGalat } from "../inti/protokol";
import type { StatusRuang } from "../inti/tipe";
import { TEKS } from "../teks";
import { Panel } from "./Gabung";

export interface WaktuStatus {
  status: StatusRuang;
  mulaiPada: number | null;
  berakhirPada: number | null;
  jedaSejak: number | null;
}

/** Sisa waktu "mm:ss", dibulatkan ke atas per detik. */
export function formatSisa(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function LayarRonde({ waktu, selisihJam }: { waktu: WaktuStatus; selisihJam: () => number }) {
  const [kini, setKini] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setKini(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);
  const jamServer = kini + selisihJam();
  if (waktu.status === "hitung_mundur") {
    const n = Math.min(3, Math.max(1, Math.ceil(((waktu.mulaiPada ?? jamServer) - jamServer) / 1000)));
    return (
      <Panel judul={TEKS.ronde.bersiap}>
        <p className="js-angka-besar">{n}</p>
      </Panel>
    );
  }
  if (waktu.status === "main" || waktu.status === "jeda") {
    const acuan = waktu.status === "jeda" && waktu.jedaSejak !== null ? waktu.jedaSejak : jamServer;
    return (
      <Panel judul={TEKS.ronde.berjalan}>
        <p className="js-label">{TEKS.ronde.sisaWaktu}</p>
        <p className="js-angka-besar">{formatSisa((waktu.berakhirPada ?? acuan) - acuan)}</p>
      </Panel>
    );
  }
  return (
    <Panel judul={TEKS.ronde.selesai}>
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
