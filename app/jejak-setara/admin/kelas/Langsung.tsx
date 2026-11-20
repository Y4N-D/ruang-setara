// Layar kelas saat bermain dan jeda (spesifikasi JS-10, P-26, P-27): bilah masa dengan jam cerita dan sisa waktu, peta
// kelas, 10 besar, kemajuan kelas 12 blok, dan tombol kontrol.
import { useEffect, useState } from "react";
import { formatJam, masa, menitCerita } from "../../inti/aturan";
import type { PesanServerKelas } from "../../inti/protokol-kelas";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { AVATAR, IKON_KELAS } from "./ikon-kelas";
import PetaKelas from "./PetaKelas";
import { formatSisaKelas, JUMLAH_BLOK, kemajuanKelas, sisaRonde } from "./tampilan-kelas";

type P<T extends PesanServerKelas["t"]> = Extract<PesanServerKelas, { t: T }>;
const t = TEKS_KONSOL.kelas;
const NAMA_MASA = { pagi: t.masaPagi, siang: t.masaSiang, sore: t.masaSore } as const;

/** Jam server yang diperbarui 4 kali per detik untuk sisa waktu dan hitung mundur. */
export function useJamServer(selisih: number): number {
  const [sekarang, setSekarang] = useState(() => Date.now());
  useEffect(() => {
    const pewaktu = setInterval(() => setSekarang(Date.now()), 250);
    return () => clearInterval(pewaktu);
  }, []);
  return sekarang + selisih;
}

interface PropsLangsung {
  status: P<"status_ruang">;
  papan: P<"papan"> | null;
  kemajuan: P<"kemajuan"> | null;
  dunia: P<"dunia_kelas"> | null;
  tas: ReadonlyMap<string, string>;
  selisih: number;
  jeda: () => void;
  lanjut: () => void;
  tambah: () => void;
  akhiri: () => void;
}

export default function Langsung({ status, papan, kemajuan, dunia, tas, selisih, jeda, lanjut, tambah, akhiri }: PropsLangsung) {
  const jam = useJamServer(selisih);
  const dijeda = status.status === "jeda";
  const sisa = sisaRonde(status.berakhirPada, status.jedaSejak, jam);
  const total = status.berakhirPada !== null && status.mulaiPada !== null ? status.berakhirPada - status.mulaiPada : 1;
  const k = Math.min(1, Math.max(0, 1 - sisa / Math.max(1, total)));
  const m = masa(k);
  const { persen, blok } = kemajuanKelas(kemajuan?.terjawab ?? 0, kemajuan?.kemungkinan ?? 0);
  return (
    <div className="js-kelas-layar">
      <div className={`js-kelas-bilah js-kelas-masa-${m}`}>
        <span className="js-kelas-busur">
          <span className="js-kelas-lintasan" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
            <img src={IKON_KELAS.matahari} alt="" style={{ left: `${k * 100}%` }} />
          </span>
          <span>{isiTeks(t.jamCerita, { masa: NAMA_MASA[m], jam: formatJam(menitCerita(k)) })}</span>
        </span>
        <span className="js-kelas-sisa">{isiTeks(t.sisa, { waktu: formatSisaKelas(sisa) })}</span>
      </div>
      <div className="js-kelas-isi-langsung">
        <section className="js-kelas-bingkai js-kelas-kotak-peta">
          <PetaKelas dunia={dunia} tas={tas} />
        </section>
        <section className="js-kelas-bingkai js-kelas-papan" aria-labelledby="js-kelas-papan-judul">
          <p id="js-kelas-papan-judul" className="js-kelas-label">
            {t.papanJudul}
          </p>
          <ol>
            {(papan?.pemain ?? []).map((p) => (
              <li key={p.id}>
                <span className="js-kelas-angka">{p.peringkat}</span>
                {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
                <img src={AVATAR[p.avatar] ?? AVATAR[0]} alt="" />
                <span className="js-kelas-nama">{p.nama}</span>
                <span className="js-kelas-angka">{p.skor}</span>
                {/* JS-11 (P-34): ikon centang dan angka; teks pembaca layar tersembunyi, bukan aria-label pada span. */}
                <span className="js-kelas-selesai">
                  {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
                  <img src={IKON_KELAS.centang} alt="" />
                  <span aria-hidden="true">{isiTeks(t.selesaiJumlah, { n: p.selesai })}</span>
                  <span className="js-sr">{isiTeks(t.selesaiLabel, { n: p.selesai })}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <div className="js-kelas-kontrol">
        <span className="js-kelas-kemajuan">
          <span className="js-kelas-besar">{t.kemajuan}</span>
          <span className="js-kelas-blok" aria-hidden="true">
            {Array.from({ length: JUMLAH_BLOK }, (_, i) => (
              <i key={i} data-isi={i < blok ? "ya" : "tidak"} />
            ))}
          </span>
          <span className="js-kelas-angka">{isiTeks(t.persen, { n: persen })}</span>
        </span>
        <span className="js-kelas-tombol-grup">
          {dijeda ? null : (
            <button type="button" className="js-kelas-tombol" onClick={jeda}>
              {t.jeda} <kbd>Spasi</kbd>
            </button>
          )}
          <button type="button" className="js-kelas-tombol" onClick={tambah}>
            {t.tambahWaktu} <kbd>T</kbd>
          </button>
          <button type="button" className="js-kelas-tombol js-kelas-tombol-bahaya" onClick={akhiri}>
            {t.akhiri} <kbd>A</kbd>
          </button>
        </span>
      </div>
      {dijeda ? (
        <div className="js-kelas-jeda">
          <p className="js-kelas-dijeda">{t.dijeda}</p>
          <div className="js-kelas-tombol-grup">
            <button type="button" className="js-kelas-tombol js-kelas-tombol-utama" onClick={lanjut}>
              {t.lanjut} <kbd>Spasi</kbd>
            </button>
            <button type="button" className="js-kelas-tombol js-kelas-tombol-bahaya" onClick={akhiri}>
              {t.akhiri} <kbd>A</kbd>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
