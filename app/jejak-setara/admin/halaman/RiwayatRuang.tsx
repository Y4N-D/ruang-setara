// Halaman riwayat ruang `#/ruang/riwayat` (spesifikasi JS-11, P-16 sampai P-18): ruang yang sudah ditutup, saringan
// tanggal, label kelas, dan guru (admin), 50 ruang per halaman dengan "Muat lebih banyak", dan tautan ke hasilnya.
import { useEffect, useId, useState, type FormEvent } from "react";
import type { Saya } from "../../inti/akun";
import { LABEL_KELAS_MAKS } from "../../inti/ruang";
import { tanggalKeMs, type RuangRiwayat } from "../../inti/hasil";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, type GalatApi } from "../api";
import { Kolom, PesanGalat } from "../Formulir";
import { keHash } from "../rute";
import { FORMAT_WAKTU_RUANG, TabRuang } from "./Ruang";

const tr = TEKS_KONSOL.riwayatRuang;
const FORMAT_RATA = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

interface Saringan {
  dari: string;
  sampai: string;
  label: string;
  guru: string;
}
const KOSONG: Saringan = { dari: "", sampai: "", label: "", guru: "" };
/** Saringan disimpan di memori halaman selama sesi konsol (P-18), seperti daftar kejadian JS-12. */
let saringanTersimpan: Saringan = KOSONG;

/** Parameter API dari saringan: tanggal menurut zona waktu peramban, "Sampai tanggal" sampai pukul 00.00 hari berikutnya. */
function kueri(s: Saringan, mulai?: string): URLSearchParams {
  const q = new URLSearchParams();
  const dari = s.dari ? tanggalKeMs(s.dari) : null;
  const sampai = s.sampai ? tanggalKeMs(s.sampai, true) : null;
  if (dari !== null) q.set("dari", String(dari));
  if (sampai !== null) q.set("sampai", String(sampai));
  if (s.label.trim()) q.set("label", s.label.trim());
  if (s.guru) q.set("guru", s.guru);
  if (mulai) q.set("mulai", mulai);
  return q;
}

type Keadaan = { jenis: "memuat" } | { jenis: "gagal" } | { jenis: "ada"; ruang: RuangRiwayat[]; berikutnya: string | null };

interface PropsRiwayat {
  akun: Saya;
  galatSesi: (galat: GalatApi) => boolean;
}

export default function RiwayatRuang({ akun, galatSesi }: PropsRiwayat) {
  const admin = akun.peran === "admin";
  const idGuru = useId();
  const [isian, setIsian] = useState<Saringan>(saringanTersimpan);
  const [terapan, setTerapan] = useState<Saringan>(saringanTersimpan);
  const [galatTanggal, setGalatTanggal] = useState(false);
  const [keadaan, setKeadaan] = useState<Keadaan>({ jenis: "memuat" });
  const [memuatLagi, setMemuatLagi] = useState(false);
  const [galatLagi, setGalatLagi] = useState(false);
  const [putaran, setPutaran] = useState(0);
  const [daftarGuru, setDaftarGuru] = useState<{ id: string; nama: string }[]>([]);

  useEffect(() => {
    if (!admin) return;
    let aktif = true;
    api.daftarAkun().then((h) => {
      if (!aktif || !h.ok) return;
      setDaftarGuru(h.data.akun.map((a) => ({ id: a.id, nama: a.namaTampilan })).sort((a, b) => a.nama.localeCompare(b.nama, "id")));
    });
    return () => {
      aktif = false;
    };
  }, [admin]);

  useEffect(() => {
    let aktif = true;
    api.riwayatRuang(kueri(terapan)).then((h) => {
      if (!aktif) return;
      if (h.ok) setKeadaan({ jenis: "ada", ruang: h.data.ruang, berikutnya: h.data.berikutnya });
      else if (!galatSesi(h)) setKeadaan({ jenis: "gagal" });
    });
    return () => {
      aktif = false;
    };
  }, [terapan, galatSesi, putaran]);

  /** Memuat ulang dari halaman pertama: "Memuat riwayat…", lalu daftar baru (bukan tambahan). */
  const muatDari = (s: Saringan) => {
    setKeadaan({ jenis: "memuat" });
    setGalatLagi(false);
    setTerapan(s);
  };
  const terapkan = (e: FormEvent) => {
    e.preventDefault();
    if (isian.dari && isian.sampai && isian.sampai < isian.dari) {
      setGalatTanggal(true);
      return;
    }
    setGalatTanggal(false);
    saringanTersimpan = { ...isian };
    muatDari({ ...isian });
  };
  const aturUlang = () => {
    setIsian(KOSONG);
    setGalatTanggal(false);
    saringanTersimpan = KOSONG;
    muatDari({ ...KOSONG });
  };
  const muatLebih = async () => {
    if (keadaan.jenis !== "ada" || !keadaan.berikutnya) return;
    setMemuatLagi(true);
    setGalatLagi(false);
    const h = await api.riwayatRuang(kueri(terapan, keadaan.berikutnya));
    setMemuatLagi(false);
    if (h.ok) setKeadaan((k) => (k.jenis === "ada" ? { jenis: "ada", ruang: [...k.ruang, ...h.data.ruang], berikutnya: h.data.berikutnya } : k));
    else if (!galatSesi(h)) setGalatLagi(true);
  };
  const adaSaringan = Boolean(terapan.dari || terapan.sampai || terapan.label.trim() || terapan.guru);

  return (
    <>
      <TabRuang aktif="riwayat" />
      <form className="js-riwayat-ruang-saring" onSubmit={terapkan} noValidate>
        <Kolom label={tr.dari} jenis="date" nilai={isian.dari} ubah={(v) => setIsian((s) => ({ ...s, dari: v }))} />
        <Kolom label={tr.sampai} jenis="date" nilai={isian.sampai} ubah={(v) => setIsian((s) => ({ ...s, sampai: v }))} galat={galatTanggal ? tr.galatTanggal : null} />
        <Kolom
          label={tr.label}
          nilai={isian.label}
          petunjuk={tr.labelPetunjuk}
          ubah={(v) => setIsian((s) => ({ ...s, label: [...v].slice(0, LABEL_KELAS_MAKS).join("") }))}
        />
        {admin ? (
          <div className="js-konsol-kolom">
            <label className="js-konsol-label" htmlFor={idGuru}>
              {tr.guru}
            </label>
            <select id={idGuru} className="js-konsol-isian" value={isian.guru} onChange={(e) => setIsian((s) => ({ ...s, guru: e.target.value }))}>
              <option value="">{tr.semuaGuru}</option>
              {daftarGuru.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nama}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="js-konsol-tombol-baris js-riwayat-ruang-tombol">
          <button type="submit" className="js-konsol-tombol js-konsol-tombol-utama">
            {tr.terapkan}
          </button>
          <button type="button" className="js-konsol-tombol" onClick={aturUlang}>
            {tr.aturUlang}
          </button>
        </div>
      </form>
      {keadaan.jenis === "memuat" ? (
        <p role="status">{tr.memuat}</p>
      ) : keadaan.jenis === "gagal" ? (
        <div className="js-konsol-tumpuk">
          <p role="alert">{tr.gagal}</p>
          <button
            type="button"
            className="js-konsol-tombol"
            onClick={() => {
              setKeadaan({ jenis: "memuat" });
              setPutaran((p) => p + 1);
            }}
          >
            {tr.cobaLagi}
          </button>
        </div>
      ) : keadaan.ruang.length === 0 ? (
        <p>{adaSaringan ? tr.kosongSaringan : tr.kosong}</p>
      ) : (
        <>
          <p role="status">{isiTeks(tr.ringkasan, { n: keadaan.ruang.length })}</p>
          <div className="js-konsol-gulung">
            <table className="js-konsol-tabel js-riwayat-ruang-tabel">
              <thead>
                <tr>
                  <th scope="col">{tr.kolomTanggal}</th>
                  <th scope="col">{tr.kolomKelas}</th>
                  <th scope="col">{tr.kolomKode}</th>
                  <th scope="col">{tr.kolomPemain}</th>
                  <th scope="col">{tr.kolomRata}</th>
                  {admin ? <th scope="col">{tr.kolomGuru}</th> : null}
                  <th scope="col">
                    <span className="js-sr">{tr.hasil}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {keadaan.ruang.map((r) => (
                  <BarisRiwayat key={r.id} r={r} admin={admin} />
                ))}
              </tbody>
            </table>
          </div>
          {keadaan.berikutnya ? (
            <div className="js-riwayat-ruang-lagi">
              <button type="button" className="js-konsol-tombol" disabled={memuatLagi} onClick={() => void muatLebih()}>
                {memuatLagi ? tr.memuatLagi : tr.muatLagi}
              </button>
            </div>
          ) : null}
          <PesanGalat pesan={galatLagi ? tr.gagal : null} />
        </>
      )}
    </>
  );
}

function BarisRiwayat({ r, admin }: { r: RuangRiwayat; admin: boolean }) {
  const tanggal = FORMAT_WAKTU_RUANG.format(r.dibuatPada);
  return (
    <tr>
      <td data-label={tr.kolomTanggal}>{tanggal}</td>
      <td data-label={tr.kolomKelas}>
        <div className="js-konsol-sel-label">
          <span>{r.labelKelas}</span>
          {r.uji ? <span className="js-konsol-tanda js-konsol-tanda-belum">{TEKS_KONSOL.ruang.uji}</span> : null}
        </div>
      </td>
      <td data-label={tr.kolomKode}>
        <span className="js-ruang-kode">{r.kode}</span>
      </td>
      <td data-label={tr.kolomPemain}>{r.jumlahPemain}</td>
      <td data-label={tr.kolomRata}>{!r.dimainkan ? tr.tidakDimainkan : r.rataSkor === null ? TEKS_KONSOL.hasil.kosongNilai : FORMAT_RATA.format(r.rataSkor)}</td>
      {admin ? <td data-label={tr.kolomGuru}>{r.namaGuru ?? TEKS_KONSOL.hasil.kosongNilai}</td> : null}
      <td>
        <a className="js-konsol-tombol" href={keHash("ruang", r.id)} aria-label={isiTeks(tr.hasilLabel, { kelas: r.labelKelas, tanggal })}>
          {tr.hasil}
        </a>
      </td>
    </tr>
  );
}
