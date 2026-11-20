// Layar "Ronde selesai" dengan rekap pribadi dan refleksi (spesifikasi JS-11, P-4 sampai P-9). Halaman digulir
// biasa: skor dan peringkat, kejadian yang dijawab, lalu dua kalimat refleksi untuk disalin ke buku. Rekap hanya
// disimpan di memori tab.
import { useRef, type ReactNode } from "react";
import { IKON } from "../assets/manifest";
import { isiTeks, TEKS } from "../teks";
import { tampilanSkor, type AkhirRekap, type ButirRekap } from "./rekapKeadaan";

const R = TEKS.rekap;
const D = TEKS.dialog;
const K = TEKS.kartu;
const IKON_TINGKAT = { tepat: IKON.ikon_emosi_hati.url, kurang: IKON.ikon_emosi_keringat.url, berisiko: IKON.ikon_emosi_seru.url };
const TOMBOL = { kembali: TEKS.tombol.kembali, cobaLagi: TEKS.berhenti.cobaLagi, muatUlang: TEKS.tombol.muatUlang };

/** Tanda berikon dan bertulisan, bukan warna saja (P-9). */
const tanda = (jenis: string, ikon: string | null, teks: string) => (
  <span className="js-tanda-rekap" data-jenis={jenis}>
    {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
    {ikon ? <img className="js-ikon-emosi" src={ikon} alt="" width={16} height={16} /> : null}
    <span>{teks}</span>
  </span>
);

/** Satu istilah dan isinya di daftar langkah. */
const baris = (istilah: string, isi: ReactNode) => (
  <>
    <dt>{istilah}</dt>
    <dd>{isi}</dd>
  </>
);

const daftar = (isi: readonly string[]) => (
  <ul className="js-rekap-sub">
    {isi.map((t) => (
      <li key={t}>{t}</li>
    ))}
  </ul>
);

function Butir({ b }: { b: ButirRekap }) {
  const t2 = b.tingkat2;
  return (
    <li className="js-rekap-butir">
      <h3 className="js-rekap-kepala">
        <span>{b.judul}</span>
        <span className="js-rekap-poin">{isiTeks(R.poin, { poin: b.poin })}</span>
      </h3>
      <dl className="js-rekap-langkah">
        {baris(isiTeks(R.langkah, { n: 1 }), b.benar1 ? tanda("tepat", IKON_TINGKAT.tepat, D.tepat) : tanda("belum", IKON.ikon_emosi_tanya.url, D.belumTepat))}
        {baris(D.pilihanmu, b.pilihan1)}
        {b.benar1 ? null : baris(D.jawabanTepat, b.opsiBenar1)}
        {baris(isiTeks(R.langkah, { n: 2 }), t2 ? tanda(t2, IKON_TINGKAT[t2], K.tingkat[t2]) : tanda("kabut", null, R.belumDijawab))}
        {b.pilihan2 === null ? null : baris(D.pilihanmu, b.pilihan2)}
        {t2 === "tepat" ? null : baris(K.pilihanTepat, b.opsiTepat2.length > 1 ? daftar(b.opsiTepat2) : b.opsiTepat2[0])}
        {baris(K.rujukan, daftar(b.rujukan))}
      </dl>
    </li>
  );
}

export interface PropsRekap {
  akhir: { skor: number; peringkat: number; jumlah: number } | null;
  /** null selama `selesai` belum tiba. */
  rekap: readonly ButirRekap[] | null;
  uji: boolean;
  /** P-7: pita menyambung ulang. */
  menyambung: boolean;
  /** P-8: sambungan sudah berakhir; rekap tetap tampil dengan pita dan satu tombol. */
  berakhir: AkhirRekap | null;
  saatKembali: () => void;
}

export function LayarRekap({ akhir, rekap, uji, menyambung, berakhir, saatKembali }: PropsRekap) {
  const judulRefleksi = useRef<HTMLHeadingElement>(null);
  const skor = tampilanSkor(akhir, rekap);
  const pita = berakhir ? (berakhir.pita === "ditutup" ? R.pitaDitutup : R.pitaBerhenti) : menyambung ? R.pitaMenyambung : null;
  return (
    <main className="js-layar js-layar-rekap">
      <div className="js-bingkai js-panel js-rekap">
        {pita ? (
          <p className="js-pita-rekap" data-jenis={berakhir ? "berakhir" : "menyambung"}>
            {pita}
          </p>
        ) : null}
        <h1>{TEKS.ronde.selesai}</h1>
        {akhir && (skor === "lengkap" || skor === "skorSaja") ? (
          <div className="js-skor-akhir">
            <p className="js-skor-akhir-angka">{isiTeks(TEKS.ronde.skorAkhir, { skor: akhir.skor })}</p>
            {skor === "lengkap" ? <p>{isiTeks(TEKS.ronde.peringkatAkhir, { n: akhir.peringkat, jumlah: akhir.jumlah })}</p> : null}
          </div>
        ) : null}
        {berakhir ? null : <p className="js-isi">{TEKS.ronde.selesaiIsi}</p>}
        {rekap === null ? null : (
          <>
            {rekap.length > 0 ? (
              <>
                <p className="js-rekap-ke-refleksi">
                  <a
                    href="#js-refleksi"
                    onClick={(e) => {
                      e.preventDefault();
                      judulRefleksi.current?.scrollIntoView({ block: "start" });
                      judulRefleksi.current?.focus({ preventScroll: true });
                    }}
                  >
                    {R.keRefleksi}
                  </a>
                </p>
                <section className="js-rekap-bagian" aria-labelledby="js-rekap-judul">
                  <h2 id="js-rekap-judul">{isiTeks(R.judul, { n: rekap.length })}</h2>
                  {uji ? <p className="js-rekap-uji">{K.rujukanUji}</p> : null}
                  <ol className="js-rekap-daftar">
                    {rekap.map((b) => (
                      <Butir key={b.kejadianId} b={b} />
                    ))}
                  </ol>
                </section>
              </>
            ) : (
              <p className="js-isi">{TEKS.ronde.tanpaSkor}</p>
            )}
            <section className="js-rekap-bagian js-refleksi" id="js-refleksi" aria-labelledby="js-refleksi-judul">
              <h2 id="js-refleksi-judul" ref={judulRefleksi} tabIndex={-1}>
                {R.refleksiJudul}
              </h2>
              <p>{R.refleksiPengantar}</p>
              <ol className="js-refleksi-daftar">
                <li>{R.refleksiHak}</li>
                <li>{R.refleksiKewajiban}</li>
              </ol>
            </section>
          </>
        )}
        {berakhir ? (
          <button
            type="button"
            className="js-tombol js-tombol-utama js-rekap-tombol"
            onClick={berakhir.tombol === "kembali" ? saatKembali : () => window.location.reload()}
          >
            {TOMBOL[berakhir.tombol]}
          </button>
        ) : null}
      </div>
    </main>
  );
}
