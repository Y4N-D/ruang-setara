// Podium sesudah ronde selesai (spesifikasi JS-10, P-28): tiga besar di atas balok sun, mist, dan wood, lalu 4–10.
import type { ReactNode } from "react";
import type { PesanServerKelas } from "../../inti/protokol-kelas";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { AVATAR } from "./ikon-kelas";
import { susunPodium } from "./tampilan-kelas";

type P<T extends PesanServerKelas["t"]> = Extract<PesanServerKelas, { t: T }>;
const t = TEKS_KONSOL.kelas;

export default function Podium({
  info,
  papan,
  bahas,
  tutup,
  tombolPemain,
}: {
  info: P<"info_kelas">;
  papan: P<"papan"> | null;
  bahas: () => void;
  tutup: () => void;
  tombolPemain?: ReactNode;
}) {
  const pemain = (papan?.pemain ?? []).filter((p) => p.skor > 0);
  const { podium, sisa } = susunPodium(pemain);
  return (
    <div className="js-kelas-layar js-kelas-malam">
      <header className="js-kelas-kepala js-kelas-kepala-malam">
        <span className="js-kelas-judul">{isiTeks(t.podiumJudul, { kelas: info.labelKelas })}</span>
        <span className="js-kelas-besar">{isiTeks(t.podiumInfo, { n: papan?.jumlahPemain ?? 0, m: info.jumlahKejadian })}</span>
      </header>
      {pemain.length === 0 ? (
        <p className="js-kelas-podium-kosong">{t.podiumKosong}</p>
      ) : (
        <div className="js-kelas-isi-podium">
          <div className="js-kelas-podium">
            {podium.map(({ tempat, pemain: p }) => (
              <div key={p.id} className={`js-kelas-tiang js-kelas-tiang-${tempat}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
                <img src={AVATAR[p.avatar] ?? AVATAR[0]} alt="" />
                <span className="js-kelas-nama">{p.nama}</span>
                <span className="js-kelas-angka">{p.skor}</span>
                <span className="js-kelas-balok">{p.peringkat}</span>
              </div>
            ))}
          </div>
          {sisa.length > 0 ? (
            <ol className="js-kelas-daftar-akhir">
              {sisa.map((p) => (
                <li key={p.id}>
                  <span className="js-kelas-angka">{p.peringkat}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
                  <img src={AVATAR[p.avatar] ?? AVATAR[0]} alt="" />
                  <span className="js-kelas-nama">{p.nama}</span>
                  <span className="js-kelas-angka">{p.skor}</span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      )}
      <div className="js-kelas-kontrol">
        {tombolPemain}
        <span />
        <span className="js-kelas-tombol-grup">
          <button type="button" className="js-kelas-tombol" onClick={tutup}>
            {t.tutupRuang}
          </button>
          <button type="button" className="js-kelas-tombol js-kelas-tombol-utama" onClick={bahas} disabled={info.kejadian.length === 0}>
            {t.pembahasan} <kbd>→</kbd>
          </button>
        </span>
      </div>
    </div>
  );
}
