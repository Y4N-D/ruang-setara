// Penyusun paket `#/paket/{id}` dan paket baru (spesifikasi JS-12, P-22): nama, deskripsi, aktif, dan daftar kejadian
// berurutan dengan tombol Naik, Turun, dan Keluarkan. Validasi akhir di server (Architecture 5.4).
import { useEffect, useState } from "react";
import type { BarisKejadian, TemuanApi } from "../../inti/bank";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, temuanDari, useMuat, type GalatApi } from "../api";
import { PesanGalat } from "../Formulir";
import { pesanTemuan } from "./BagianPenyunting";
import { LABEL_STATUS } from "./DaftarKejadian";

const t = TEKS_KONSOL.paket;
const tb = TEKS_KONSOL.bank;

interface PropsPenyusun {
  id: string | null;
  galatSesi: (g: GalatApi) => boolean;
  umumkan: (pesan: string) => void;
  selesai: () => void;
}

export default function PenyusunPaket({ id, galatSesi, umumkan, selesai }: PropsPenyusun) {
  const bank = useMuat(api.daftarKejadian, galatSesi);
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [aktif, setAktif] = useState(true);
  const [kode, setKode] = useState<string[]>([]);
  const [muat, setMuat] = useState<"memuat" | "ada" | "gagal">(id ? "memuat" : "ada");
  const [temuan, setTemuan] = useState<TemuanApi[]>([]);
  const [galat, setGalat] = useState<string | null>(null);
  const [tambah, setTambah] = useState("");
  const [sibuk, setSibuk] = useState(false);
  useEffect(() => {
    if (!id) return;
    void api.detailPaket(id).then((h) => {
      if (h.ok) {
        setNama(h.data.paket.nama);
        setDeskripsi(h.data.paket.deskripsi);
        setAktif(h.data.paket.aktif);
        setKode(h.data.kejadian.map((k) => k.kode));
        setMuat("ada");
      } else if (!galatSesi(h)) setMuat("gagal");
    });
  }, [id, galatSesi]);
  if (muat === "memuat" || bank.muatan.jenis === "memuat") return <p role="status">{tb.memuat}</p>;
  if (muat === "gagal" || bank.muatan.jenis === "gagal") return <p role="alert">{tb.gagal}</p>;
  const peta = new Map<string, BarisKejadian>(bank.muatan.data.kejadian.map((k) => [k.kode, k]));
  const calon = bank.muatan.data.kejadian.filter((k) => (k.status === "tinjau" || k.status === "terbit") && !kode.includes(k.kode));
  const geser = (i: number, arah: -1 | 1) => {
    const baru = [...kode];
    [baru[i], baru[i + arah]] = [baru[i + arah], baru[i]];
    setKode(baru);
  };
  const simpan = async () => {
    setSibuk(true);
    setGalat(null);
    const h = await api.simpanPaket(id, { nama: nama.trim(), deskripsi: deskripsi.trim(), aktif, kejadian: kode });
    setSibuk(false);
    if (h.ok) {
      umumkan(t.okSimpan);
      selesai();
      return;
    }
    if (galatSesi(h)) return;
    setTemuan(temuanDari(h));
    setGalat(h.pesan);
  };
  return (
    <div className="js-paket-penyusun">
      <a href="#/paket" className="js-konsol-kembali" onClick={() => selesai()}>
        ← {t.judul}
      </a>
      <div className="js-sunting-kolom">
        <label htmlFor="js-paket-nama">{t.nama}</label>
        <input id="js-paket-nama" type="text" value={nama} onChange={(e) => setNama(e.target.value)} />
      </div>
      <div className="js-sunting-kolom">
        <label htmlFor="js-paket-deskripsi">{t.deskripsi}</label>
        <textarea id="js-paket-deskripsi" rows={2} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
      </div>
      <label className="js-bank-centang">
        <input type="checkbox" checked={aktif} onChange={(e) => setAktif(e.target.checked)} />
        <span>{t.aktif}</span>
      </label>
      {kode.length === 0 ? (
        <p>{t.kosong}</p>
      ) : (
        <ol className="js-paket-daftar">
          {kode.map((k, i) => {
            const b = peta.get(k);
            return (
              <li key={k}>
                <span>
                  <strong>{k}</strong> {b?.judul ?? ""} {b ? <span className="js-konsol-tanda">{LABEL_STATUS[b.status]}</span> : null}
                </span>
                <span className="js-konsol-tombol-baris">
                  <button type="button" className="js-konsol-tombol" disabled={i === 0} onClick={() => geser(i, -1)}>
                    {t.naik}
                  </button>
                  <button type="button" className="js-konsol-tombol" disabled={i === kode.length - 1} onClick={() => geser(i, 1)}>
                    {t.turun}
                  </button>
                  <button type="button" className="js-konsol-tombol" onClick={() => setKode(kode.filter((x) => x !== k))}>
                    {t.keluarkan}
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
      )}
      <div className="js-bank-saring">
        <select aria-label={t.tambah} value={tambah} onChange={(e) => setTambah(e.target.value)}>
          <option value="">{t.tambah}</option>
          {calon.map((k) => (
            <option key={k.kode} value={k.kode}>
              {k.kode} · {k.judul}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="js-konsol-tombol"
          disabled={!tambah}
          onClick={() => {
            setKode([...kode, tambah]);
            setTambah("");
          }}
        >
          {t.tambah}
        </button>
      </div>
      {temuan.length > 0 ? (
        <ul className="js-sunting-temuan">
          {temuan.map((x, i) => (
            <li key={i}>{pesanTemuan(x)}</li>
          ))}
        </ul>
      ) : null}
      <PesanGalat pesan={galat} />
      <button type="button" className="js-konsol-tombol js-konsol-tombol-utama" disabled={sibuk} onClick={() => void simpan()}>
        {t.simpan}
      </button>
    </div>
  );
}
