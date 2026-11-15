// Lobi layar kelas (spesifikasi JS-10, P-24, D-2, D-4).
import type { PesanServerKelas } from "../../inti/protokol-kelas";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { AVATAR } from "./ikon-kelas";
import { potongLobi } from "./tampilan-kelas";

type Info = Extract<PesanServerKelas, { t: "info_kelas" }>;
type PemainLobi = Extract<PesanServerKelas, { t: "lobi" }>["pemain"][number];
const t = TEKS_KONSOL.kelas;

export function KepalaKelas({ info, jumlah }: { info: Info; jumlah: number }) {
  const hampirPenuh = jumlah >= Math.ceil(info.batasPemain * 0.8);
  return (
    <header className="js-kelas-kepala">
      <span className="js-kelas-judul">{isiTeks(t.merek, { kelas: info.labelKelas })}</span>
      <span className="js-kelas-tanda-kepala">
        {info.terkunci ? <span className="js-kelas-tanda">{t.terkunci}</span> : null}
        {jumlah >= info.batasPemain ? <span className="js-kelas-tanda">{t.penuh}</span> : null}
        <span className="js-kelas-besar">{hampirPenuh ? isiTeks(t.jumlahPemainBatas, { n: jumlah, m: info.batasPemain }) : isiTeks(t.jumlahPemain, { n: jumlah })}</span>
      </span>
    </header>
  );
}

interface PropsLobi {
  info: Info;
  pemain: readonly PemainLobi[];
  mulai: () => void;
  kunci: () => void;
  bisaMulai: boolean;
}

export default function Lobi({ info, pemain, mulai, kunci, bisaMulai }: PropsLobi) {
  const { tampil, sisa } = potongLobi(pemain);
  return (
    <div className="js-kelas-layar">
      <KepalaKelas info={info} jumlah={pemain.length} />
      <div className="js-kelas-lobi-atas">
        <section className="js-kelas-bingkai js-kelas-gabung">
          <p className="js-kelas-label">{t.bukaDiHp}</p>
          <p className="js-kelas-tautan">{info.tautan.replace(/^https?:\/\//, "")}</p>
          <p className="js-kelas-label">{t.kodeRuang}</p>
          <p className="js-kelas-kode">{info.kode}</p>
        </section>
        <section className="js-kelas-bingkai js-kelas-cara">
          <p className="js-kelas-label">{t.caraJudul}</p>
          <ol>
            <li>{t.cara1}</li>
            <li>{t.cara2}</li>
            <li>{t.cara3}</li>
          </ol>
        </section>
      </div>
      <section className="js-kelas-bingkai js-kelas-daftar">
        {tampil.length === 0 ? (
          <p className="js-kelas-menunggu">{t.menungguPemain}</p>
        ) : (
          <ul>
            {tampil.map((p) => (
              <li key={p.id} data-terhubung={p.terhubung ? "ya" : "tidak"} aria-label={p.terhubung ? p.nama : `${p.nama}, ${t.terputusLabel}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
                <img src={AVATAR[p.avatar] ?? AVATAR[0]} alt="" />
                <span className="js-kelas-nama" data-panjang={p.nama.length > 16 ? "ya" : "tidak"}>
                  {p.nama}
                </span>
              </li>
            ))}
            {sisa > 0 ? <li className="js-kelas-lainnya">{isiTeks(t.lainnya, { n: sisa })}</li> : null}
          </ul>
        )}
      </section>
      <div className="js-kelas-kontrol">
        <button type="button" className="js-kelas-tombol" onClick={kunci}>
          {info.terkunci ? t.bukaKunci : t.kunci} <kbd>L</kbd>
        </button>
        <span className="js-kelas-label">
          {isiTeks(t.info, { jenis: info.uji ? t.ruangUji : t.ruangBiasa, n: info.durasiMenit, m: info.batasPemain })}
        </span>
        <button type="button" className="js-kelas-tombol js-kelas-tombol-utama" onClick={mulai} disabled={!bisaMulai}>
          {t.mulai} <kbd>Spasi</kbd>
        </button>
      </div>
    </div>
  );
}
