// Daftar paket `#/paket` (spesifikasi JS-12, P-21): nama, jumlah kejadian, aktif, dan tanda siap untuk ruang biasa.
import { useState } from "react";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, useMuat, type GalatApi } from "../api";
import PenyusunPaket from "./PenyusunPaket";

const t = TEKS_KONSOL.paket;
const tb = TEKS_KONSOL.bank;

export default function DaftarPaket({ id, galatSesi, umumkan, buka }: { id: string | null; galatSesi: (g: GalatApi) => boolean; umumkan: (pesan: string) => void; buka: (hash: string) => void }) {
  const { muatan, muatUlang } = useMuat(api.daftarPaket, galatSesi);
  const [baru, setBaru] = useState(false);
  if (id || baru) {
    return (
      <PenyusunPaket
        key={id ?? "baru"}
        id={id}
        galatSesi={galatSesi}
        umumkan={umumkan}
        selesai={() => {
          setBaru(false);
          muatUlang();
          if (id) buka("#/paket");
        }}
      />
    );
  }
  if (muatan.jenis === "memuat") return <p role="status">{tb.memuat}</p>;
  if (muatan.jenis === "gagal") return <p role="alert">{tb.gagal}</p>;
  return (
    <>
      <div className="js-konsol-baris-atas">
        <span />
        <button type="button" className="js-konsol-tombol js-konsol-tombol-utama" onClick={() => setBaru(true)}>
          {t.baru}
        </button>
      </div>
      <div className="js-konsol-gulung">
        <table className="js-konsol-tabel">
          <thead>
            <tr>
              <th scope="col">{t.kolomNama}</th>
              <th scope="col">{t.kolomJumlah}</th>
              <th scope="col">{t.kolomAktif}</th>
              <th scope="col">{t.kolomSiap}</th>
            </tr>
          </thead>
          <tbody>
            {muatan.data.paket.map((p) => (
              <tr key={p.id}>
                <td>
                  <a href={`#/paket/${p.id}`}>{p.nama}</a>
                  <div className="js-konsol-petunjuk">{p.deskripsi}</div>
                </td>
                <td>{p.jumlah}</td>
                <td>{p.aktif ? t.ya : t.tidak}</td>
                <td>{p.siapRuangBiasa ? t.ya : t.tidak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
