// Halaman `#/statistik` (spesifikasi JS-13, P-16 sampai P-23): statistik per versi kejadian lintas ruang dengan saringan
// tanggal (bawaan 30 hari, D-2a), label kelas, guru (admin), dan paket; urutan di peramban; rincian dengan grafik batang.
import { Fragment, useEffect, useId, useState, type FormEvent } from "react";
import type { Saya } from "../../inti/akun";
import { tanggalKeMs } from "../../inti/hasil";
import { LABEL_KELAS_MAKS } from "../../inti/ruang";
import {
  HARI_RINGKASAN,
  kategoriKesulitan,
  STATISTIK_SEDIKIT,
  tanggalMundur,
  urutStatistik,
  type Statistik as DataStatistik,
  type StatistikKejadian,
  type UrutanStatistik,
} from "../../inti/statistik";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, type GalatApi } from "../api";
import { Kolom } from "../Formulir";
import { EMOSI_HASIL, IKON_SKILL } from "../kelas/ikon-kelas";
import ikonCentang from "../../assets/ikon/ikon_centang.png";
import { keHash } from "../rute";

const t = TEKS_KONSOL.statistik;
const HURUF = ["A", "B", "C", "D"] as const;
const SATU = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const DUA = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const BULAT = new Intl.NumberFormat("id-ID");
const TINGKAT = { tepat: TEKS_KONSOL.bank.tingkatTepat, kurang: TEKS_KONSOL.bank.tingkatKurang, berisiko: TEKS_KONSOL.bank.tingkatBerisiko } as const;
const persenTeks = (n: number | null) => (n === null ? t.kosongNilai : isiTeks(t.persen, { n: SATU.format(n) }));

interface Saringan {
  dari: string;
  sampai: string;
  label: string;
  guru: string;
  paket: string;
}

/** P-17 (D-2a): "Dari tanggal" berisi tanggal 29 hari sebelum hari ini menurut zona waktu peramban. */
export function saringanBawaan(sekarang: Date): Saringan {
  return { dari: tanggalMundur(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate(), HARI_RINGKASAN - 1), sampai: "", label: "", guru: "", paket: "" };
}

/** Saringan dan urutan yang diterapkan, disimpan di memori halaman selama sesi konsol (P-17). */
let tersimpan: { saringan: Saringan; urutan: UrutanStatistik } | null = null;

export function kueriStatistik(s: Saringan): URLSearchParams {
  const q = new URLSearchParams();
  const dari = s.dari ? tanggalKeMs(s.dari) : null;
  const sampai = s.sampai ? tanggalKeMs(s.sampai, true) : null;
  if (dari !== null) q.set("dari", String(dari));
  if (sampai !== null) q.set("sampai", String(sampai));
  if (s.label.trim()) q.set("label", s.label.trim());
  if (s.guru) q.set("guru", s.guru);
  if (s.paket) q.set("paket", s.paket);
  return q;
}

function Ikon({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js
  return <img src={src} alt="" width={16} height={16} />;
}

type Keadaan = { jenis: "memuat" } | { jenis: "gagal" } | { jenis: "ada"; data: DataStatistik };

export default function Statistik({ akun, galatSesi }: { akun: Saya; galatSesi: (galat: GalatApi) => boolean }) {
  const admin = akun.peran === "admin";
  const idGuru = useId();
  const idPaket = useId();
  const idUrut = useId();
  const [awal] = useState(() => tersimpan ?? { saringan: saringanBawaan(new Date()), urutan: "kode" as UrutanStatistik });
  const [isian, setIsian] = useState<Saringan>(awal.saringan);
  const [terapan, setTerapan] = useState<Saringan>(awal.saringan);
  const [urutan, setUrutan] = useState<UrutanStatistik>(awal.urutan);
  const [galatTanggal, setGalatTanggal] = useState(false);
  const [keadaan, setKeadaan] = useState<Keadaan>({ jenis: "memuat" });
  const [terbuka, setTerbuka] = useState<string | null>(null);
  const [putaran, setPutaran] = useState(0);
  const [daftarGuru, setDaftarGuru] = useState<{ id: string; nama: string }[]>([]);
  const [daftarPaket, setDaftarPaket] = useState<{ id: string; nama: string }[]>([]);

  useEffect(() => {
    if (!admin) return;
    let aktif = true;
    api.daftarAkun().then((h) => {
      if (aktif && h.ok) setDaftarGuru(h.data.akun.map((a) => ({ id: a.id, nama: a.namaTampilan })).sort((a, b) => a.nama.localeCompare(b.nama, "id")));
    });
    return () => {
      aktif = false;
    };
  }, [admin]);

  useEffect(() => {
    let aktif = true;
    api.statistikKejadian(kueriStatistik(terapan)).then((h) => {
      if (!aktif) return;
      if (h.ok) {
        setKeadaan({ jenis: "ada", data: h.data });
        setDaftarPaket(h.data.paket);
      } else if (!galatSesi(h)) setKeadaan({ jenis: "gagal" });
    });
    return () => {
      aktif = false;
    };
  }, [terapan, galatSesi, putaran]);

  const muat = (s: Saringan) => {
    tersimpan = { saringan: { ...s }, urutan };
    setTerbuka(null);
    setKeadaan({ jenis: "memuat" });
    setTerapan({ ...s });
  };
  const terapkan = (e: FormEvent) => {
    e.preventDefault();
    if (isian.dari && isian.sampai && isian.sampai < isian.dari) {
      setGalatTanggal(true);
      return;
    }
    setGalatTanggal(false);
    muat(isian);
  };
  const aturUlang = () => {
    const bawaan = saringanBawaan(new Date());
    setIsian(bawaan);
    setGalatTanggal(false);
    muat(bawaan);
  };
  const ubahUrutan = (u: UrutanStatistik) => {
    setUrutan(u);
    tersimpan = { saringan: { ...terapan }, urutan: u };
  };

  return (
    <>
      <p className="js-statistik-pengantar">{t.pengantar}</p>
      <form className="js-riwayat-ruang-saring" onSubmit={terapkan} noValidate>
        <Kolom label={t.dari} jenis="date" nilai={isian.dari} petunjuk={t.dariPetunjuk} ubah={(v) => setIsian((s) => ({ ...s, dari: v }))} />
        <Kolom label={t.sampai} jenis="date" nilai={isian.sampai} galat={galatTanggal ? t.galatTanggal : null} ubah={(v) => setIsian((s) => ({ ...s, sampai: v }))} />
        <Kolom label={t.label} nilai={isian.label} petunjuk={t.labelPetunjuk} ubah={(v) => setIsian((s) => ({ ...s, label: [...v].slice(0, LABEL_KELAS_MAKS).join("") }))} />
        {admin ? (
          <div className="js-konsol-kolom">
            <label className="js-konsol-label" htmlFor={idGuru}>
              {t.guru}
            </label>
            <select id={idGuru} className="js-konsol-isian" value={isian.guru} onChange={(e) => setIsian((s) => ({ ...s, guru: e.target.value }))}>
              <option value="">{t.semuaGuru}</option>
              {daftarGuru.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nama}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="js-konsol-kolom">
          <label className="js-konsol-label" htmlFor={idPaket}>
            {t.paket}
          </label>
          <select id={idPaket} className="js-konsol-isian" value={isian.paket} onChange={(e) => setIsian((s) => ({ ...s, paket: e.target.value }))}>
            <option value="">{t.semuaPaket}</option>
            {daftarPaket.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>
        <div className="js-konsol-tombol-baris js-riwayat-ruang-tombol">
          <button type="submit" className="js-konsol-tombol js-konsol-tombol-utama">
            {t.terapkan}
          </button>
          <button type="button" className="js-konsol-tombol" onClick={aturUlang}>
            {t.aturUlang}
          </button>
        </div>
      </form>
      {keadaan.jenis === "memuat" ? (
        <p role="status">{t.memuat}</p>
      ) : keadaan.jenis === "gagal" ? (
        <div className="js-konsol-tumpuk">
          <p role="alert">{t.gagal}</p>
          <button type="button" className="js-konsol-tombol" onClick={() => setPutaran((n) => n + 1)}>
            {t.cobaLagi}
          </button>
        </div>
      ) : keadaan.data.kejadian.length === 0 ? (
        <p>{t.kosong}</p>
      ) : (
        <section aria-labelledby="js-statistik-judul">
          <h2 id="js-statistik-judul">{t.bagian}</h2>
          <div className="js-statistik-atas">
            <p role="status">
              {isiTeks(t.cakupan, {
                ruang: BULAT.format(keadaan.data.cakupan.ruang),
                pemain: BULAT.format(keadaan.data.cakupan.pemain),
                jawaban: BULAT.format(keadaan.data.cakupan.jawaban),
              })}
            </p>
            <div className="js-konsol-kolom js-statistik-urut">
              <label className="js-konsol-label" htmlFor={idUrut}>
                {t.urutkan}
              </label>
              <select id={idUrut} className="js-konsol-isian" value={urutan} onChange={(e) => ubahUrutan(e.target.value as UrutanStatistik)}>
                <option value="kode">{t.urutKode}</option>
                <option value="sulit">{t.urutSulit}</option>
                <option value="ketepatan">{t.urutKetepatan}</option>
                <option value="dijawab">{t.urutDijawab}</option>
              </select>
            </div>
          </div>
          <p className="js-statistik-legenda" aria-hidden="true">
            {t.legenda} <Ikon src={EMOSI_HASIL.tepat} /> {TINGKAT.tepat} · <Ikon src={EMOSI_HASIL.kurang} /> {TINGKAT.kurang} · <Ikon src={EMOSI_HASIL.berisiko} /> {TINGKAT.berisiko}
          </p>
          <TabelStatistik daftar={urutStatistik(keadaan.data.kejadian, urutan)} terbuka={terbuka} buka={setTerbuka} />
        </section>
      )}
    </>
  );
}

/** Tabel statistik (P-19) dengan satu rincian terbuka pada satu waktu (P-20). Murni: diuji dengan renderToStaticMarkup. */
export function TabelStatistik({ daftar, terbuka, buka }: { daftar: readonly StatistikKejadian[]; terbuka: string | null; buka: (kunci: string | null) => void }) {
  return (
    <div className="js-konsol-gulung js-statistik-gulung">
      <table className="js-konsol-tabel js-statistik-tabel">
        <thead>
          <tr>
            <th scope="col">{t.kolomKejadian}</th>
            <th scope="col" className="js-angka">
              {t.kolomDijawab}
            </th>
            <th scope="col" className="js-angka">
              {t.kolomKetepatan}
            </th>
            <th scope="col" className="js-statistik-lebar">
              {t.kolomLangkah2}
            </th>
            <th scope="col">{t.kolomIndeks}</th>
            <th scope="col" className="js-angka">
              {t.kolomMedian}
            </th>
            <th scope="col" className="js-statistik-lebar">
              {t.kolomKeliru}
            </th>
            <th scope="col" className="js-angka js-statistik-lebar">
              {t.kolomPetunjuk}
            </th>
            <th scope="col">
              <span className="js-sr">{t.kolomRincian}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {daftar.map((k, i) => {
            const kunci = `${k.kode}-v${k.versi}`;
            const buka2 = terbuka === kunci;
            const idRincian = `js-statistik-${kunci}`;
            const keliru = k.pilihan1.findIndex((o) => o.id === k.keliruTerbanyak);
            const genap = i % 2 === 1 ? "ya" : "tidak";
            const label = isiTeks(buka2 ? t.tutupRincianLabel : t.rincianLabel, { kode: k.kode, versi: k.versi });
            return (
              <Fragment key={kunci}>
                <tr data-genap={genap}>
                  <td className="js-statistik-kejadian">
                    <span className="js-statistik-kode">{k.kode}</span> <span className="js-konsol-tanda js-statistik-versi">{isiTeks(t.versi, { n: k.versi })}</span>
                    {k.selesai < STATISTIK_SEDIKIT ? <span className="js-konsol-tanda js-konsol-tanda-belum js-statistik-sedikit">{t.sedikit}</span> : null}
                    <span className="js-statistik-judul">{k.judul}</span>
                  </td>
                  <td data-label={t.kolomDijawab} className="js-angka">
                    {BULAT.format(k.dijawab)}
                  </td>
                  <td data-label={t.kolomKetepatan} className="js-angka">
                    {persenTeks(k.ketepatan1)}
                  </td>
                  <td data-label={t.kolomLangkah2} className="js-statistik-lebar">
                    <BatangTingkat k={k} />
                  </td>
                  <td data-label={t.kolomIndeks}>
                    {k.indeksKesulitan === null ? (
                      t.kosongNilai
                    ) : (
                      <span className="js-statistik-indeks" data-kategori={kategoriKesulitan(k.indeksKesulitan)}>
                        {DUA.format(k.indeksKesulitan)} <span className="js-konsol-tanda">{t[kategoriKesulitan(k.indeksKesulitan)]}</span>
                      </span>
                    )}
                  </td>
                  <td data-label={t.kolomMedian} className="js-angka">
                    {k.medianDetik === null ? t.kosongNilai : isiTeks(t.detik, { n: k.medianDetik })}
                  </td>
                  <td data-label={t.kolomKeliru} className="js-statistik-lebar">
                    {keliru < 0 ? t.kosongNilai : isiTeks(t.keliru, { huruf: HURUF[keliru], n: SATU.format((k.pilihan1[keliru].n / k.dijawab) * 100) })}
                  </td>
                  <td data-label={t.kolomPetunjuk} className="js-angka js-statistik-lebar">
                    {persenTeks(k.petunjuk)}
                  </td>
                  <td className="js-statistik-aksi">
                    <button type="button" className="js-konsol-tombol" aria-label={label} aria-expanded={buka2} aria-controls={idRincian} onClick={() => buka(buka2 ? null : kunci)}>
                      {buka2 ? t.tutupRincian : t.rincian}
                    </button>
                  </td>
                </tr>
                {buka2 ? (
                  <tr id={idRincian} className="js-statistik-rincian-baris" data-genap={genap}>
                    <td colSpan={9}>
                      <RincianStatistik k={k} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BatangTingkat({ k }: { k: StatistikKejadian }) {
  const { tepat, kurang, berisiko } = k.tingkat;
  if (tepat === null || kurang === null || berisiko === null) return <>{t.kosongNilai}</>;
  return (
    <span className="js-statistik-tingkat">
      <span className="js-statistik-tumpuk" aria-hidden="true">
        <span data-tingkat="tepat" style={{ width: `${tepat}%` }} />
        <span data-tingkat="kurang" style={{ width: `${kurang}%` }} />
        <span data-tingkat="berisiko" style={{ width: `${berisiko}%` }} />
      </span>
      <span aria-hidden="true">{isiTeks(t.tingkatRingkas, { a: Math.round(tepat), b: Math.round(kurang), c: Math.round(berisiko) })}</span>
      <span className="js-sr">{isiTeks(t.tingkatPembaca, { a: SATU.format(tepat), b: SATU.format(kurang), c: SATU.format(berisiko) })}</span>
    </span>
  );
}

/** Rincian satu versi (P-20): grafik Langkah 1 dan 2, baris angka, catatan huruf, dan tautan ke bank kejadian. */
export function RincianStatistik({ k }: { k: StatistikKejadian }) {
  const indeks = k.indeksKesulitan === null ? t.kosongNilai : DUA.format(k.indeksKesulitan);
  const median = k.medianDetik === null ? t.kosongNilai : isiTeks(t.faktaDetik, { n: k.medianDetik });
  return (
    <div className="js-statistik-rincian">
      <div className="js-statistik-grafik">
        <h3>{isiTeks(t.langkah1, { pertanyaan: k.pertanyaan1 })}</h3>
        <ul>
          {k.pilihan1.map((o, i) => {
            const p = (o.n / k.dijawab) * 100;
            return (
              <li key={o.id} data-jenis={o.benar ? "tepat" : "netral"}>
                <span className="js-statistik-opsi">
                  {isiTeks(t.pilihan, { huruf: HURUF[i], teks: o.teks })}
                  {o.benar ? (
                    <span className="js-konsol-tanda js-statistik-tepat">
                      <Ikon src={ikonCentang} />
                      {t.jawabanTepat}
                    </span>
                  ) : null}
                  {o.id === k.keliruTerbanyak ? <span className="js-konsol-tanda js-konsol-tanda-belum">{t.keliruTerbanyak}</span> : null}
                </span>
                <span className="js-statistik-batang" aria-hidden="true">
                  <span style={{ width: `${p}%` }} />
                </span>
                <span className="js-statistik-nilai">{isiTeks(t.jumlah, { n: BULAT.format(o.n), p: SATU.format(p) })}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="js-statistik-grafik">
        <h3>{isiTeks(t.langkah2, { pertanyaan: k.pertanyaan2 })}</h3>
        {k.selesai === 0 ? (
          <p>{t.belumLangkah2}</p>
        ) : (
          <ul>
            {k.pilihan2.map((o, i) => {
              const p = (o.n / k.selesai) * 100;
              return (
                <li key={o.id} data-jenis={o.tingkat}>
                  <span className="js-statistik-opsi">
                    {isiTeks(t.pilihan, { huruf: HURUF[i], teks: o.teks })}
                    <span className="js-konsol-tanda js-hasil-tanda" data-jenis={o.tingkat}>
                      <Ikon src={EMOSI_HASIL[o.tingkat]} />
                      {TINGKAT[o.tingkat]}
                    </span>
                  </span>
                  <span className="js-statistik-batang" aria-hidden="true">
                    <span style={{ width: `${p}%` }} />
                  </span>
                  <span className="js-statistik-nilai">{isiTeks(t.jumlah, { n: BULAT.format(o.n), p: SATU.format(p) })}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="js-statistik-fakta">
        {isiTeks(t.fakta, { dijawab: BULAT.format(k.dijawab), selesai: BULAT.format(k.selesai), median, indeks })}
        {k.petunjuk === null ? null : (
          <>
            {" · "}
            <Ikon src={IKON_SKILL.petunjuk} /> {isiTeks(t.faktaPetunjuk, { n: SATU.format(k.petunjuk) })}
          </>
        )}
      </p>
      <p className="js-statistik-huruf">{t.huruf}</p>
      <a className="js-statistik-bank" href={keHash("kejadian", k.kode)}>
        {t.keBank}
      </a>
    </div>
  );
}
