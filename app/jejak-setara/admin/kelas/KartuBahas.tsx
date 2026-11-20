// Satu kartu pembahasan (spesifikasi JS-10, P-29): situasi dan kartu dampak di kiri, grafik Langkah 1 dan 2 di kanan.
import { forwardRef } from "react";
import type { PesanServerKelas } from "../../inti/protokol-kelas";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { EMOSI, IKON_KELAS, ZONA } from "./ikon-kelas";
import { persenPilihan } from "./tampilan-kelas";

type Bahas = Extract<PesanServerKelas, { t: "data_pembahasan" }>;
const t = TEKS_KONSOL.kelas;
const TINGKAT = { tepat: t.tingkatTepat, kurang: t.tingkatKurang, berisiko: t.tingkatBerisiko } as const;
const HURUF = ["A", "B", "C", "D"];

const KartuBahas = forwardRef<HTMLDivElement, { data: Bahas; zona: number }>(function KartuBahas({ data, zona }, ref) {
  const satu = persenPilihan(data.opsi1.map((o) => o.jumlah));
  const dua = persenPilihan(data.opsi2.map((o) => o.jumlah));
  return (
    <div className="js-kelas-isi-bahas" ref={ref} tabIndex={-1}>
      <section className="js-kelas-bingkai js-kelas-kartu">
        <h2>
          {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
          <img src={ZONA[zona - 1] ?? ZONA[0]} alt="" />
          {data.judul}
        </h2>
        <p>{data.situasi}</p>
        <div className="js-kelas-dampak">
          <b>{t.hak}</b>
          <p>{data.kartu.hak}</p>
          <b>{t.kewajiban}</b>
          <p>{data.kartu.kewajiban}</p>
          <b>{t.rujukan}</b>
          <p>{data.kartu.rujukan.join(" · ")}</p>
        </div>
      </section>
      <section className="js-kelas-bingkai js-kelas-kartu">
        <p className="js-kelas-label">{isiTeks(t.langkah1, { pertanyaan: data.pertanyaan1 })}</p>
        {data.opsi1.map((o, i) => (
          <div key={o.id} className="js-kelas-grafik">
            <span className="js-kelas-angka">{HURUF[i]}</span>
            <span className="js-kelas-opsi">
              <span className="js-kelas-batang" data-benar={o.benar ? "ya" : "tidak"} style={{ width: `${satu.persen[i]}%` }} />
              <span className="js-kelas-opsi-teks">
                {o.teks}
                {o.benar ? (
                  <span className="js-kelas-tepat">
                    {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
                    <img src={IKON_KELAS.centang} alt="" />
                    {t.jawabanTepat}
                  </span>
                ) : null}
              </span>
            </span>
            <span className="js-kelas-angka">{isiTeks(t.persen, { n: satu.persen[i] })}</span>
          </div>
        ))}
        <p className="js-kelas-label">{isiTeks(t.langkah2, { pertanyaan: data.pertanyaan2 })}</p>
        {data.opsi2.map((o, i) => (
          <div key={o.id} className="js-kelas-grafik">
            {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
            <img src={EMOSI[o.tingkat]} alt="" />
            <span className="js-kelas-opsi">
              <span className={`js-kelas-batang js-kelas-batang-${o.tingkat}`} style={{ width: `${dua.persen[i]}%` }} />
              <span className="js-kelas-opsi-teks">
                <b>{TINGKAT[o.tingkat]}:</b> {o.teks}
              </span>
            </span>
            <span className="js-kelas-angka">{isiTeks(t.persen, { n: dua.persen[i] })}</span>
          </div>
        ))}
      </section>
    </div>
  );
});

export default KartuBahas;
