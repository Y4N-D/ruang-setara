// Panel halaman kosong JS-01 dengan penanda server, dipakai halaman pemain dan konsol.
import { useEffect, useState } from "react";
import { PROTOKOL_VERSI } from "../inti/protokol";
import { TEKS } from "../teks";

type Keadaan = "memeriksa" | "siap" | "belum";

/** Batas waktu pemeriksaan server (spesifikasi JS-01, D-2). */
const BATAS_WAKTU_MS = 5000;

/** Jawaban benar: objek JSON dengan ok === true dan protokol sama dengan halaman (P-8, D-3). */
function jawabanBenar(isi: unknown): boolean {
  if (typeof isi !== "object" || isi === null) return false;
  const data = isi as { ok?: unknown; protokol?: unknown };
  return data.ok === true && data.protokol === PROTOKOL_VERSI;
}

export default function HalamanKerangka({ judul, isi, atas }: { judul: string; isi: string; atas?: string }) {
  const [keadaan, setKeadaan] = useState<Keadaan>("memeriksa");

  useEffect(() => {
    // Pemeriksaan yang dibatalkan karena halaman ditutup tidak mengubah tampilan (P-9).
    let aktif = true;
    const pembatal = new AbortController();
    const pewaktu = setTimeout(() => pembatal.abort(), BATAS_WAKTU_MS);
    const selesai = (hasil: Keadaan) => {
      clearTimeout(pewaktu);
      if (aktif) setKeadaan(hasil);
    };
    fetch("/api/sehat", { cache: "no-store", headers: { Accept: "application/json" }, signal: pembatal.signal })
      .then(async (jawaban): Promise<Keadaan> => (jawaban.status === 200 && jawabanBenar(await jawaban.json()) ? "siap" : "belum"))
      .then(selesai, () => selesai("belum"));
    return () => {
      aktif = false;
      clearTimeout(pewaktu);
      pembatal.abort();
    };
  }, []);

  const tanda = keadaan === "siap" ? TEKS.tandaSiap : keadaan === "belum" ? TEKS.tandaBelum : null;
  const label = keadaan === "siap" ? TEKS.serverSiap : keadaan === "belum" ? TEKS.serverBelum : TEKS.serverMemeriksa;

  return (
    <main className="js-kerangka">
      <div className="js-bingkai">
        {atas ? <p className="js-atas">{atas}</p> : null}
        <h1>{judul}</h1>
        <p className="js-isi">{isi}</p>
        <p className="js-status" data-keadaan={keadaan} role="status">
          {tanda ? <span aria-hidden="true">{tanda} </span> : null}
          {label}
        </p>
      </div>
    </main>
  );
}
