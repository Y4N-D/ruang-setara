// Halaman detail ruang (spesifikasi JS-10, P-8 sampai P-10): kode, tautan, status, pemain yang dimuat ulang setiap 10
// detik selama halaman tampil, kunci, keluarkan (dengan konfirmasi), tutup, dan tautan ke layar kelas. Mengeluarkan
// pemain dilakukan di sini, bukan di proyektor (usulan 5a).
import { useEffect, useState } from "react";
import type { Saya } from "../../inti/akun";
import { KUOTA_HARIAN_GRATIS, STATUS_BOLEH_TUTUP, type AksiKelola, type DetailRuang as DataDetail, type PemakaianRuang } from "../../inti/ruang";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, type GalatApi } from "../api";
import Dialog from "../Dialog";
import { PesanGalat } from "../Formulir";
import { AVATAR } from "../kelas/ikon-kelas";
import { keHash } from "../rute";
import { TautanLayar } from "./Ruang";

const t = TEKS_KONSOL.detail;
const FORMAT_JAM = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const FORMAT_ANGKA = new Intl.NumberFormat("id-ID");
const FORMAT_PERSEN = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** Muat ulang daftar pemain selama halaman tampil (P-9). */
export const MUAT_ULANG_DETAIL_MS = 10_000;

type Muatan = { jenis: "memuat" } | { jenis: "gagal" } | { jenis: "tidakAda" } | { jenis: "ada"; data: DataDetail; pada: number };
type Konfirmasi = { jenis: "keluarkan"; pemainId: string; nama: string } | { jenis: "tutup" } | null;

interface PropsDetail {
  id: string;
  akun: Saya;
  galatSesi: (galat: GalatApi) => boolean;
  umumkan: (pesan: string) => void;
}

export default function DetailRuang({ id, galatSesi, umumkan }: PropsDetail) {
  const [muatan, setMuatan] = useState<Muatan>({ jenis: "memuat" });
  const [konfirmasi, setKonfirmasi] = useState<Konfirmasi>(null);
  const [galatAksi, setGalatAksi] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [pembuka, setPembuka] = useState<HTMLElement | null>(null);
  const [putaran, setPutaran] = useState(0);
  const muat = () => setPutaran((p) => p + 1);

  useEffect(() => {
    let aktif = true;
    api.detailRuang(id).then((h) => {
      if (!aktif) return;
      if (h.ok) setMuatan({ jenis: "ada", data: h.data, pada: Date.now() });
      else if (galatSesi(h)) return;
      else if (h.status === 404) setMuatan({ jenis: "tidakAda" });
      else setMuatan((m) => (m.jenis === "ada" ? m : { jenis: "gagal" }));
    });
    return () => {
      aktif = false;
    };
  }, [id, galatSesi, putaran]);

  useEffect(() => {
    const pewaktu = setInterval(() => {
      if (document.visibilityState === "visible") setPutaran((p) => p + 1);
    }, MUAT_ULANG_DETAIL_MS);
    const lihat = () => {
      if (document.visibilityState === "visible") setPutaran((p) => p + 1);
    };
    document.addEventListener("visibilitychange", lihat);
    return () => {
      clearInterval(pewaktu);
      document.removeEventListener("visibilitychange", lihat);
    };
  }, []);

  async function aksi(a: AksiKelola, pesanOk: string, pemainId?: string) {
    setSibuk(true);
    const h = await api.kelolaRuang(id, a, pemainId);
    setSibuk(false);
    setKonfirmasi(null);
    if (h.ok) {
      setGalatAksi(null);
      umumkan(pesanOk);
      muat();
    } else if (!galatSesi(h)) setGalatAksi(h.pesan);
  }

  if (muatan.jenis === "memuat") return <p role="status">{t.memuat}</p>;
  if (muatan.jenis === "tidakAda") {
    return (
      <div className="js-konsol-tumpuk">
        <p role="alert">{t.tidakAda}</p>
        <a className="js-konsol-tombol" href={keHash("ruang")}>
          {t.kembali}
        </a>
      </div>
    );
  }
  if (muatan.jenis === "gagal") {
    return (
      <div className="js-konsol-tumpuk">
        <p role="alert">{t.gagal}</p>
        <button type="button" className="js-konsol-tombol" onClick={muat}>
          {TEKS_KONSOL.dasbor.cobaLagi}
        </button>
      </div>
    );
  }

  const { ruang, langsung } = muatan.data;
  const pemakaian = muatan.data.pemakaian ?? null;
  const status = langsung?.status ?? ruang.status;
  const ditutup = status === "ditutup";
  const bolehTutup = STATUS_BOLEH_TUTUP.includes(status);
  const terkunci = langsung?.terkunci ?? false;
  const pemain = langsung?.pemain ?? [];
  const buka = (k: Konfirmasi) => (e: { currentTarget: HTMLElement }) => {
    setPembuka(e.currentTarget);
    setKonfirmasi(k);
  };

  return (
    <>
      <p>
        <a href={keHash("ruang")}>{t.kembali}</a>
      </p>
      <section className="js-bingkai js-ruang-kepala" aria-label={ruang.labelKelas}>
        <h2>{ruang.labelKelas}</h2>
        <p className="js-konsol-label">{t.kode}</p>
        <p className="js-ruang-kode js-ruang-kode-besar">{ruang.kode}</p>
        {langsung ? (
          <p>
            <span className="js-konsol-label">{t.tautan}</span> {langsung.tautan}
          </p>
        ) : null}
        <div className="js-konsol-sel-label">
          <span className="js-konsol-tanda">{TEKS_KONSOL.status[status]}</span>
          {terkunci ? <span className="js-konsol-tanda js-konsol-tanda-belum">{t.terkunci}</span> : null}
          {ruang.uji ? <span className="js-konsol-tanda js-konsol-tanda-belum">{TEKS_KONSOL.ruang.uji}</span> : null}
        </div>
      </section>
      {langsung?.kirimanBerhenti ? <PesanGalat pesan={t.kirimanGagal} /> : null}
      {ditutup ? (
        <p role="status">{t.ditutup}</p>
      ) : (
        <>
          <div className="js-konsol-tombol-baris js-ruang-aksi">
            <TautanLayar id={ruang.id} />
            <button type="button" className="js-konsol-tombol" disabled={sibuk} onClick={() => void aksi(terkunci ? "buka_kunci" : "kunci", terkunci ? t.okBuka : t.okKunci)}>
              {terkunci ? t.bukaKunci : t.kunci}
            </button>
            <button type="button" className="js-konsol-tombol" disabled={sibuk || !bolehTutup} aria-describedby={bolehTutup ? undefined : "js-ruang-tutup-ket"} onClick={buka({ jenis: "tutup" })}>
              {t.tutup}
            </button>
          </div>
          {bolehTutup ? null : (
            <p id="js-ruang-tutup-ket" className="js-konsol-petunjuk">
              {t.tutupTidakBisa}
            </p>
          )}
          <PesanGalat pesan={galatAksi} />
          <section className="js-ruang-pemain" aria-labelledby="js-ruang-pemain-judul">
            <h2 id="js-ruang-pemain-judul">{isiTeks(t.pemainJudul, { n: pemain.length })}</h2>
            {pemain.length === 0 ? (
              <p>{t.pemainKosong}</p>
            ) : (
              <ul>
                {pemain.map((p) => (
                  <li key={p.id} data-terhubung={p.terhubung ? "ya" : "tidak"}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
                    <img src={AVATAR[p.avatar] ?? AVATAR[0]} alt="" width={32} height={32} />
                    <span className="js-ruang-nama">{p.nama}</span>
                    <span className="js-konsol-tanda">{p.terhubung ? t.terhubung : t.terputus}</span>
                    <button type="button" className="js-konsol-tombol" aria-label={isiTeks(t.keluarkanLabel, { nama: p.nama })} disabled={sibuk} onClick={buka({ jenis: "keluarkan", pemainId: p.id, nama: p.nama })}>
                      {t.keluarkan}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <p className="js-konsol-petunjuk">{isiTeks(t.diperbarui, { jam: FORMAT_JAM.format(muatan.pada) })}</p>
        </>
      )}
      {pemakaian ? <BagianPemakaian p={pemakaian} /> : null}
      {konfirmasi ? (
        <Dialog
          judul={konfirmasi.jenis === "tutup" ? isiTeks(t.tutupJudul, { kode: ruang.kode }) : isiTeks(t.keluarkanJudul, { nama: konfirmasi.nama })}
          tutup={sibuk ? null : () => setKonfirmasi(null)}
          kembaliKe={pembuka}
        >
          <p>{konfirmasi.jenis === "tutup" ? t.tutupIsi : isiTeks(t.keluarkanIsi, { nama: konfirmasi.nama })}</p>
          <div className="js-konsol-tombol-baris">
            <button type="button" className="js-konsol-tombol" data-fokus-awal onClick={() => setKonfirmasi(null)} disabled={sibuk}>
              {TEKS_KONSOL.batal}
            </button>
            <button
              type="button"
              className="js-konsol-tombol js-konsol-tombol-bahaya"
              disabled={sibuk}
              onClick={() =>
                void (konfirmasi.jenis === "tutup"
                  ? aksi("tutup", isiTeks(t.okTutup, { kode: ruang.kode }))
                  : aksi("keluarkan", isiTeks(t.okKeluarkan, { nama: konfirmasi.nama }), konfirmasi.pemainId))
              }
            >
              {konfirmasi.jenis === "tutup" ? t.tutup : t.keluarkan}
            </button>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}

/** JS-22 (P-17): pemakaian ronde untuk admin, dengan persen kuota harian paket gratis (D-3). */
function BagianPemakaian({ p }: { p: PemakaianRuang }) {
  const nilai = (n: number, persen: boolean) =>
    persen ? isiTeks(t.pemakaianNilai, { n: FORMAT_ANGKA.format(n), p: FORMAT_PERSEN.format((n * 100) / KUOTA_HARIAN_GRATIS) }) : FORMAT_ANGKA.format(n);
  const baris: [string, number, boolean][] = [
    [t.pemakaianPermintaan, p.perkiraanPermintaan, true],
    [t.pemakaianD1, p.barisD1, true],
    [t.pemakaianSqlite, p.barisSqlite, true],
    [t.pemakaianSambungan, p.sambungan, false],
    [t.pemakaianAlarm, p.alarm, false],
  ];
  return (
    <section className="js-ruang-pemakaian" aria-labelledby="js-ruang-pemakaian-judul">
      <h2 id="js-ruang-pemakaian-judul">{t.pemakaianJudul}</h2>
      <table className="js-konsol-tabel">
        <tbody>
          {baris.map(([label, n, persen]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{nilai(n, persen)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="js-konsol-petunjuk">{t.pemakaianCatatan}</p>
    </section>
  );
}
