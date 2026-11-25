// Lobi layar kelas (spesifikasi JS-10, P-24, D-2, D-4; kode QR dan Perbesar QR sejak JS-16b, P-8 dan P-9).
import type { PesanServerKelas } from "../../inti/protokol-kelas";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import GambarQr, { alamatGabung } from "./GambarQr";
import { ButirNama, type AksiKelola } from "./KelolaNama";
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
  /** JS-14 (P-53, P-55). */
  kelola: AksiKelola;
  tombolPemain: ReactNode;
  /** JS-16b (P-9): lapisan Perbesar QR dan tombol yang menerima fokus lagi sesudah lapisan ditutup. */
  qrBesar: boolean;
  bukaTutupQr: () => void;
  tombolQr: RefObject<HTMLButtonElement | null>;
}

export default function Lobi({ info, pemain, mulai, kunci, bisaMulai, kelola, tombolPemain, qrBesar, bukaTutupQr, tombolQr }: PropsLobi) {
  const { tampil, sisa } = potongLobi(pemain);
  const alamat = alamatGabung(info.tautan, info.kode);
  const labelQr = isiTeks(t.qrLabel, { kode: info.kode });
  const tautan = info.tautan.replace(/^https?:\/\//, "");
  return (
    <div className="js-kelas-layar">
      <KepalaKelas info={info} jumlah={pemain.length} />
      <div className="js-kelas-lobi-atas">
        <section className="js-kelas-bingkai js-kelas-gabung">
          <p className="js-kelas-label">{t.bukaDiHp}</p>
          <p className="js-kelas-tautan">{tautan}</p>
          <p className="js-kelas-label">{t.kodeRuang}</p>
          <p className="js-kelas-kode">{info.kode}</p>
        </section>
        <section className="js-kelas-bingkai js-kelas-cara js-kelas-qr">
          {alamat ? <GambarQr teks={alamat} label={labelQr} /> : null}
          <p className="js-kelas-label">{t.qrKeterangan}</p>
          <button type="button" className="js-kelas-tombol" ref={tombolQr} onClick={bukaTutupQr} disabled={!alamat}>
            {t.perbesarQr} <kbd>Q</kbd>
          </button>
        </section>
      </div>
      <section className="js-kelas-bingkai js-kelas-daftar">
        {tampil.length === 0 ? (
          <p className="js-kelas-menunggu">{t.menungguPemain}</p>
        ) : (
          <ul>
            {tampil.map((p) => (
              <ButirNama key={p.id} p={p} kelola={kelola} />
            ))}
            {sisa > 0 ? <li className="js-kelas-lainnya">{isiTeks(t.lainnya, { n: sisa })}</li> : null}
          </ul>
        )}
      </section>
      <div className="js-kelas-kontrol">
        <span className="js-kelas-tombol-grup">
          {tombolPemain}
          <button type="button" className="js-kelas-tombol" onClick={kunci}>
            {info.terkunci ? t.bukaKunci : t.kunci} <kbd>L</kbd>
          </button>
        </span>
        <span className="js-kelas-label">
          {isiTeks(t.info, { jenis: info.uji ? t.ruangUji : t.ruangBiasa, n: info.durasiMenit, m: info.batasPemain })}
        </span>
        <button type="button" className="js-kelas-tombol js-kelas-tombol-utama" onClick={mulai} disabled={!bisaMulai}>
          {t.mulai} <kbd>Spasi</kbd>
        </button>
      </div>
      {qrBesar && alamat ? <QrBesar alamat={alamat} label={labelQr} tautan={tautan} kode={info.kode} tutup={bukaTutupQr} /> : null}
    </div>
  );
}

/** P-9: QR setinggi layar untuk siswa yang duduk jauh; fokus ke tombol Tutup saat terbuka. */
function QrBesar({ alamat, label, tautan, kode, tutup }: { alamat: string; label: string; tautan: string; kode: string; tutup: () => void }) {
  const tombol = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    tombol.current?.focus();
  }, []);
  return (
    <div className="js-kelas-qr-besar" role="dialog" aria-modal="true" aria-label={label}>
      <GambarQr teks={alamat} label={label} />
      <div className="js-kelas-qr-besar-teks">
        <p className="js-kelas-label">{t.bukaDiHp}</p>
        <p className="js-kelas-tautan">{tautan}</p>
        <p className="js-kelas-label">{t.kodeRuang}</p>
        <p className="js-kelas-kode">{kode}</p>
        <button type="button" className="js-kelas-tombol" ref={tombol} onClick={tutup}>
          {t.tutupQr} <kbd>Esc</kbd>
        </button>
      </div>
    </div>
  );
}
