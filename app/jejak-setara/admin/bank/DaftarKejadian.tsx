// Halaman `#/kejadian` (spesifikasi JS-12, P-4 dan P-5): daftar kejadian dengan saringan zona, topik, status, dan
// "Milik saya", serta pencarian judul. Saringan disimpan di memori modul selama sesi.
import { useMemo, useState } from "react";
import type { BarisKejadian, StatusKejadian } from "../../inti/bank";
import { STATUS_KEJADIAN } from "../../inti/bank";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, useMuat, type GalatApi } from "../api";
import { ikonZona } from "./aset-tokoh";

const t = TEKS_KONSOL.daftar;
const tb = TEKS_KONSOL.bank;
const FORMAT_TANGGAL = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

export const LABEL_STATUS: Readonly<Record<StatusKejadian, string>> = { draf: tb.statusDraf, tinjau: tb.statusTinjau, terbit: tb.statusTerbit, arsip: tb.statusArsip };

const saringan = { zona: "", topik: "", status: "", milikSaya: false, cari: "" };

interface PropsDaftar {
  galatSesi: (g: GalatApi) => boolean;
}

export default function DaftarKejadian({ galatSesi }: PropsDaftar) {
  const { muatan, muatUlang } = useMuat(api.daftarKejadian, galatSesi);
  const pilihan = useMuat(api.pilihanBank, galatSesi);
  const [s, setS] = useState(saringan);
  const ubah = (lain: Partial<typeof saringan>) => {
    Object.assign(saringan, lain);
    setS({ ...saringan });
  };
  const daftar = useMemo(() => (muatan.jenis === "ada" ? muatan.data.kejadian : []), [muatan]);
  const topik = useMemo(() => [...new Set(daftar.map((k) => k.topik).filter(Boolean))].sort(), [daftar]);
  const namaZona = new Map((pilihan.muatan.jenis === "ada" ? pilihan.muatan.data.zona : []).map((z) => [z.id, z.nama]));
  if (muatan.jenis === "memuat") return <p role="status">{tb.memuat}</p>;
  if (muatan.jenis === "gagal") {
    return (
      <div className="js-konsol-tumpuk">
        <p role="alert">{tb.gagal}</p>
        <button type="button" className="js-konsol-tombol" onClick={muatUlang}>
          {tb.cobaLagi}
        </button>
      </div>
    );
  }
  const cari = s.cari.trim().toLocaleLowerCase("id-ID");
  const tampil = daftar.filter(
    (k) =>
      (!s.zona || k.zona === s.zona) &&
      (!s.topik || k.topik === s.topik) &&
      (!s.status || k.status === s.status) &&
      (!s.milikSaya || k.milikSaya) &&
      (!cari || k.judul.toLocaleLowerCase("id-ID").includes(cari)),
  );
  return (
    <>
      <div className="js-konsol-baris-atas">
        <p>{isiTeks(t.ringkasan, { n: daftar.length })}</p>
        <a className="js-konsol-tombol js-konsol-tombol-utama" href="#/kejadian/baru">
          {t.baru}
        </a>
      </div>
      <div className="js-bank-saring">
        <label>
          <span className="js-sr">{t.cari}</span>
          <input type="search" placeholder={t.cari} value={s.cari} onChange={(e) => ubah({ cari: e.target.value })} />
        </label>
        <select aria-label={t.kolomZona} value={s.zona} onChange={(e) => ubah({ zona: e.target.value })}>
          <option value="">{t.semuaZona}</option>
          {[...namaZona].map(([id, nama]) => (
            <option key={id} value={id}>
              {nama}
            </option>
          ))}
        </select>
        <select aria-label={t.kolomTopik} value={s.topik} onChange={(e) => ubah({ topik: e.target.value })}>
          <option value="">{t.semuaTopik}</option>
          {topik.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        <select aria-label={t.kolomStatus} value={s.status} onChange={(e) => ubah({ status: e.target.value })}>
          <option value="">{t.semuaStatus}</option>
          {STATUS_KEJADIAN.map((x) => (
            <option key={x} value={x}>
              {LABEL_STATUS[x]}
            </option>
          ))}
        </select>
        <label className="js-bank-centang">
          <input type="checkbox" checked={s.milikSaya} onChange={(e) => ubah({ milikSaya: e.target.checked })} />
          <span>{t.milikSaya}</span>
        </label>
      </div>
      {tampil.length === 0 ? (
        <p>{t.kosong}</p>
      ) : (
        <div className="js-konsol-gulung">
          <table className="js-konsol-tabel js-bank-tabel">
            <thead>
              <tr>
                <th scope="col">{t.kolomKode}</th>
                <th scope="col">{t.kolomJudul}</th>
                <th scope="col">{t.kolomZona}</th>
                <th scope="col">{t.kolomTopik}</th>
                <th scope="col">{t.kolomStatus}</th>
                <th scope="col">{t.kolomRujukan}</th>
                <th scope="col">{t.kolomPemilik}</th>
                <th scope="col">{t.kolomDiubah}</th>
              </tr>
            </thead>
            <tbody>
              {tampil.map((k) => (
                <BarisDaftar key={k.kode} k={k} namaZona={namaZona.get(k.zona) ?? k.zona} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function TandaStatus({ status, adaPerubahan }: { status: StatusKejadian; adaPerubahan: boolean }) {
  return (
    <span className="js-konsol-sel-label">
      <span className={`js-konsol-tanda js-bank-status-${status}`}>{LABEL_STATUS[status]}</span>
      {adaPerubahan ? <span className="js-konsol-tanda js-konsol-tanda-belum">{tb.adaPerubahan}</span> : null}
    </span>
  );
}

function BarisDaftar({ k, namaZona }: { k: BarisKejadian; namaZona: string }) {
  const ikon = ikonZona(k.zona);
  return (
    <tr>
      <td>
        <a href={`#/kejadian/${k.kode}`} className="js-ruang-kode">
          {k.kode}
        </a>
      </td>
      <td data-label={t.kolomJudul}>
        <a href={`#/kejadian/${k.kode}`}>{k.judul}</a>
      </td>
      <td data-label={t.kolomZona}>
        <span className="js-konsol-sel-label">
          {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
          {ikon ? <img src={ikon} alt="" width={16} height={16} className="js-piksel" /> : null}
          <span>{namaZona}</span>
        </span>
      </td>
      <td data-label={t.kolomTopik}>{k.topik}</td>
      <td data-label={t.kolomStatus}>
        <TandaStatus status={k.status} adaPerubahan={k.adaPerubahan} />
      </td>
      <td data-label={t.kolomRujukan}>{k.rujukanBelum === 0 ? t.rujukanLengkap : isiTeks(t.rujukanBelum, { n: k.rujukanBelum })}</td>
      <td data-label={t.kolomPemilik}>{k.pemilik ?? tb.bankAwal}</td>
      <td data-label={t.kolomDiubah}>{FORMAT_TANGGAL.format(k.diubahPada)}</td>
    </tr>
  );
}
