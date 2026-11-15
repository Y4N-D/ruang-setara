// Dasbor kerangka (spesifikasi JS-04, P-36, P-42): salam dan tiga kartu bingkai piksel. Kartu Peringatan tampil untuk
// semua peran (D-4). Sejak JS-10 (P-11) kartu ruang berisi paling banyak 5 ruang yang sedang berjalan; kartu sesi masih
// kosong sampai JS-11 dan JS-13.
import { useId, type ReactNode } from "react";
import type { Saya } from "../../inti/akun";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, useMuat, type GalatApi } from "../api";
import { Ikon } from "../Formulir";
import { keHash } from "../rute";

function Kartu({ judul, children }: { judul: string; children: ReactNode }) {
  const id = useId();
  return (
    <section className="js-bingkai js-konsol-kartu" aria-labelledby={id}>
      <h2 id={id}>{judul}</h2>
      {children}
    </section>
  );
}

/** "{n} rujukan belum diverifikasi. …" dengan angka n berhuruf Press Start 2P. */
function KalimatRujukan({ n }: { n: number }) {
  const [sebelum, sesudah] = TEKS_KONSOL.dasbor.rujukanBelum.split("{n}");
  return (
    <p>
      {sebelum}
      <span className="js-konsol-angka">{n}</span>
      {sesudah}
    </p>
  );
}

export default function Dasbor({ akun, galatSesi }: { akun: Saya; galatSesi: (galat: GalatApi) => boolean }) {
  const { muatan, muatUlang } = useMuat(api.dasbor, galatSesi);
  const t = TEKS_KONSOL.dasbor;
  return (
    <>
      <p className="js-konsol-salam">{isiTeks(t.salam, { nama: akun.namaTampilan })}</p>
      <div className="js-konsol-kartu-kisi">
        <Kartu judul={t.peringatan}>
          {muatan.jenis === "memuat" ? (
            <p role="status">{t.memuat}</p>
          ) : muatan.jenis === "gagal" ? (
            <div className="js-konsol-tumpuk">
              <p role="alert">{t.gagal}</p>
              <button type="button" className="js-konsol-tombol" onClick={muatUlang}>
                {t.cobaLagi}
              </button>
            </div>
          ) : muatan.data.rujukanBelum > 0 ? (
            <div className="js-konsol-peringatan">
              <Ikon nama="ikon_peringatan" ukuran={32} />
              <KalimatRujukan n={muatan.data.rujukanBelum} />
            </div>
          ) : (
            <p>{t.tanpaPeringatan}</p>
          )}
        </Kartu>
        <Kartu judul={t.ruang}>
          {muatan.jenis === "ada" && (muatan.data.ruang ?? []).length > 0 ? (
            <ul className="js-konsol-daftar-ruang">
              {(muatan.data.ruang ?? []).map((r) => (
                <li key={r.id}>
                  <a href={keHash("ruang", r.id)}>
                    {isiTeks(t.ruangItem, { kode: r.kode, kelas: r.labelKelas, status: TEKS_KONSOL.status[r.status], n: r.jumlahPeserta })}
                  </a>
                </li>
              ))}
              {(muatan.data.jumlahRuang ?? 0) > (muatan.data.ruang ?? []).length ? (
                <li>
                  <a href={keHash("ruang")}>{isiTeks(t.ruangSemua, { n: muatan.data.jumlahRuang ?? 0 })}</a>
                </li>
              ) : null}
            </ul>
          ) : (
            <p>{t.ruangKosong}</p>
          )}
        </Kartu>
        <Kartu judul={t.sesi}>
          <p>{t.sesiKosong}</p>
        </Kartu>
      </div>
    </>
  );
}
