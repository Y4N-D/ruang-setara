// Bagian hasil ronde di halaman ruang (spesifikasi JS-11, P-20 sampai P-25 dan P-30 sampai P-32): ringkasan, unduh CSV,
// cetak, peringkat lengkap, pemain yang dikeluarkan (D-4), rincian jawaban per pemain, dan hapus data ruang (admin, D-3).
import { useEffect, useId, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import {
  formatWaktuSkor,
  labelCocok,
  persen,
  type HasilRuang,
  type JawabanRincian,
  type PesertaHasil,
  type RincianPeserta,
  type RingkasanHasil,
} from "../../inti/hasil";
import type { RingkasanRuang } from "../../inti/ruang";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, unduhCsv, type GalatApi } from "../api";
import Dialog from "../Dialog";
import { Kolom, PesanGalat, PesanInfo } from "../Formulir";
import { EMOSI_HASIL } from "../kelas/ikon-kelas";
import { keHash } from "../rute";

const t = TEKS_KONSOL.hasil;
const KOSONG = t.kosongNilai;
const TINGKAT = { tepat: TEKS_KONSOL.bank.tingkatTepat, kurang: TEKS_KONSOL.bank.tingkatKurang, berisiko: TEKS_KONSOL.bank.tingkatBerisiko } as const;
const FORMAT_SATU = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const FORMAT_TANGGAL = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" });
const FORMAT_JAM = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" });

/** Satu angka di belakang koma, atau "–" (P-21, P-22). */
const satu = (n: number | null) => (n === null ? KOSONG : FORMAT_SATU.format(n));
const persenTeks = (n: number | null) => (n === null ? KOSONG : isiTeks(t.persen, { n: FORMAT_SATU.format(n) }));

/** Ikon hiasan di depan tulisan; teks alternatifnya kosong karena tulisannya selalu ada. */
function Ikon({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js
  return <img src={src} alt="" width={16} height={16} />;
}

type MuatanHasil = { jenis: "memuat" } | { jenis: "gagal" } | { jenis: "ada"; data: HasilRuang; pada: number };

interface PropsHasil {
  id: string;
  /** P-25: hasil dimuat lagi setiap kali kunci ini berubah. */
  kunci: string;
  /** P-15: ruang `selesai` atau `pembahasan` dengan kiriman ke D1 yang belum kosong. */
  menyimpan: boolean;
  galatSesi: (galat: GalatApi) => boolean;
  /** Ruang sudah tidak ada (404): halaman ruang memuat ulang dan menampilkan "Ruang tidak ditemukan atau sudah dihapus." */
  hilang: () => void;
}

export function BagianHasil({ id, kunci, menyimpan, galatSesi, hilang }: PropsHasil) {
  const [muatan, setMuatan] = useState<MuatanHasil>({ jenis: "memuat" });
  const [putaran, setPutaran] = useState(0);

  useEffect(() => {
    let aktif = true;
    api.hasilRuang(id).then((h) => {
      if (!aktif) return;
      if (h.ok) setMuatan({ jenis: "ada", data: h.data, pada: Date.now() });
      else if (galatSesi(h)) return;
      else if (h.status === 404) hilang();
      // Status D1 bisa tertinggal sesaat dari server ruang selama kiriman masih tertunda (P-15).
      else if (h.kode === "HASIL_BELUM_ADA" && menyimpan) setMuatan((m) => (m.jenis === "ada" ? m : { jenis: "memuat" }));
      else setMuatan((m) => (m.jenis === "ada" ? m : { jenis: "gagal" }));
    });
    return () => {
      aktif = false;
    };
  }, [id, kunci, menyimpan, putaran, galatSesi, hilang]);

  return (
    <section className="js-bingkai js-hasil" aria-labelledby="js-hasil-judul">
      <h2 id="js-hasil-judul">{t.judul}</h2>
      {menyimpan ? <PesanInfo pesan={t.menyimpan} /> : null}
      {muatan.jenis === "memuat" ? (
        <p role="status">{t.memuat}</p>
      ) : muatan.jenis === "gagal" ? (
        <div className="js-konsol-tumpuk">
          <p role="alert">{t.gagal}</p>
          <button
            type="button"
            className="js-konsol-tombol"
            onClick={() => {
              setMuatan({ jenis: "memuat" });
              setPutaran((p) => p + 1);
            }}
          >
            {t.cobaLagi}
          </button>
        </div>
      ) : !muatan.data.dimainkan || !muatan.data.ringkasan ? (
        <p>{t.tidakDimainkan}</p>
      ) : (
        <IsiHasil data={muatan.data} ringkasan={muatan.data.ringkasan} dimuatPada={muatan.pada} galatSesi={galatSesi} hilang={hilang} />
      )}
    </section>
  );
}

type Jenis = "peserta" | "jawaban";
type MuatanRincian = { jenis: "memuat" } | { jenis: "gagal" } | { jenis: "ada"; data: RincianPeserta };

interface PropsIsi {
  data: HasilRuang;
  ringkasan: RingkasanHasil;
  dimuatPada: number;
  galatSesi: (galat: GalatApi) => boolean;
  hilang: () => void;
}

function IsiHasil({ data, ringkasan, dimuatPada, galatSesi, hilang }: PropsIsi) {
  const { ruang, info, peserta } = data;
  const idBagian = useId();
  const [mengunduh, setMengunduh] = useState<Record<Jenis, boolean>>({ peserta: false, jawaban: false });
  const [galatUnduh, setGalatUnduh] = useState<string | null>(null);
  const [rincian, setRincian] = useState<Record<string, MuatanRincian>>({});
  const [terbuka, setTerbuka] = useState<readonly string[]>([]);
  const [dicetakPada, setDicetakPada] = useState<number | null>(null);

  // P-31: kaki cetakan memuat tanggal saat dicetak, juga bila cetak dibuka lewat menu peramban.
  useEffect(() => {
    const sebelumCetak = () => flushSync(() => setDicetakPada(Date.now()));
    window.addEventListener("beforeprint", sebelumCetak);
    return () => window.removeEventListener("beforeprint", sebelumCetak);
  }, []);

  const unduh = async (jenis: Jenis) => {
    setMengunduh((m) => ({ ...m, [jenis]: true }));
    setGalatUnduh(null);
    const h = await unduhCsv(ruang.id, jenis);
    setMengunduh((m) => ({ ...m, [jenis]: false }));
    if (h.ok || galatSesi(h)) return;
    if (h.status === 404) hilang();
    else setGalatUnduh(h.kode === "JARINGAN" ? t.unduhGagal : h.pesan);
  };

  const muatRincian = (pesertaId: string) => {
    setRincian((r) => ({ ...r, [pesertaId]: { jenis: "memuat" } }));
    void api.rincianPeserta(ruang.id, pesertaId).then((h) => {
      if (h.ok) setRincian((r) => ({ ...r, [pesertaId]: { jenis: "ada", data: h.data } }));
      else if (galatSesi(h)) return;
      else if (h.kode === "RUANG_TIDAK_ADA") hilang();
      else setRincian((r) => ({ ...r, [pesertaId]: { jenis: "gagal" } }));
    });
  };
  const alihRincian = (pesertaId: string) => {
    if (terbuka.includes(pesertaId)) {
      setTerbuka((d) => d.filter((x) => x !== pesertaId));
      return;
    }
    setTerbuka((d) => [...d, pesertaId]);
    // P-24: rincian dimuat sekali per pemain dan disimpan di memori halaman.
    if (!rincian[pesertaId] || rincian[pesertaId].jenis === "gagal") muatRincian(pesertaId);
  };

  const mulai = info.mulaiPada;
  const selesai = info.selesaiPada;
  const tanggal =
    mulai === null || selesai === null
      ? KOSONG
      : isiTeks(t.tanggalIsi, { tanggal: FORMAT_TANGGAL.format(mulai), mulai: FORMAT_JAM.format(mulai), selesai: FORMAT_JAM.format(selesai) });
  const paket = info.namaPaket === null ? KOSONG : info.jumlahKejadian === null ? info.namaPaket : isiTeks(t.paketIsi, { nama: info.namaPaket, n: info.jumlahKejadian });
  const pemain = ringkasan.dikeluarkan > 0 ? isiTeks(t.pemainIsi, { n: ringkasan.jumlahPemain, m: ringkasan.dikeluarkan }) : String(ringkasan.jumlahPemain);
  const { tepat, kurang, berisiko } = ringkasan.tingkat;
  const sebaran = tepat === null || kurang === null || berisiko === null ? KOSONG : isiTeks(t.sebaranIsi, { a: satu(tepat), b: satu(kurang), c: satu(berisiko) });
  const ringkas: [string, string][] = [
    [t.tanggal, tanggal],
    [t.guru, ruang.namaGuru ?? KOSONG],
    [t.paket, paket],
    [t.durasi, isiTeks(t.durasiIsi, { n: info.durasiMenit })],
    [t.pemain, pemain],
    [t.rataSkor, satu(ringkasan.rataSkor)],
    [t.ketepatan, persenTeks(ringkasan.ketepatan1)],
    [t.langkah2, sebaran],
  ];
  const berperingkat = peserta.filter((p) => !p.dikeluarkan);
  const dikeluarkan = peserta.filter((p) => p.dikeluarkan);
  const propsTabel = { absen: info.modeNomorAbsen, idBagian, rincian, terbuka, alihRincian, muatRincian };

  return (
    <>
      <div className="js-hasil-cetak-kepala">
        <p className="js-hasil-cetak-judul">{isiTeks(t.cetakJudul, { kelas: ruang.labelKelas })}</p>
        <p>{isiTeks(t.cetakKode, { kode: ruang.kode })}</p>
      </div>
      <dl className="js-hasil-ringkasan">
        {ringkas.map(([istilah, isi]) => (
          <div key={istilah}>
            <dt>{istilah}</dt>
            <dd>{isi}</dd>
          </div>
        ))}
      </dl>
      {ruang.uji ? <p className="js-hasil-uji">{t.uji}</p> : null}
      <div className="js-konsol-tombol-baris js-hasil-tombol">
        <button type="button" className="js-konsol-tombol" disabled={mengunduh.peserta} onClick={() => void unduh("peserta")}>
          {mengunduh.peserta ? t.mengunduh : t.unduhPeserta}
        </button>
        <button type="button" className="js-konsol-tombol" disabled={mengunduh.jawaban} onClick={() => void unduh("jawaban")}>
          {mengunduh.jawaban ? t.mengunduh : t.unduhJawaban}
        </button>
        <button
          type="button"
          className="js-konsol-tombol"
          onClick={() => {
            flushSync(() => setDicetakPada(Date.now()));
            window.print();
          }}
        >
          {t.cetak}
        </button>
      </div>
      <div className="js-hasil-galat">
        <PesanGalat pesan={galatUnduh} />
      </div>
      <h3>{t.peringkatJudul}</h3>
      <TabelPeserta daftar={berperingkat} peringkat {...propsTabel} />
      {dikeluarkan.length > 0 ? (
        <div className="js-hasil-dikeluarkan">
          <h3>{isiTeks(t.dikeluarkanJudul, { n: dikeluarkan.length })}</h3>
          <p>{t.dikeluarkanKet}</p>
          <TabelPeserta daftar={dikeluarkan} peringkat={false} {...propsTabel} />
        </div>
      ) : null}
      <p className="js-hasil-cetak-kaki">{isiTeks(t.cetakKaki, { tanggal: FORMAT_TANGGAL.format(dicetakPada ?? dimuatPada) })}</p>
    </>
  );
}

interface PropsTabel {
  daftar: readonly PesertaHasil[];
  peringkat: boolean;
  absen: boolean;
  idBagian: string;
  rincian: Record<string, MuatanRincian>;
  terbuka: readonly string[];
  alihRincian: (pesertaId: string) => void;
  muatRincian: (pesertaId: string) => void;
}

/** Tabel peringkat lengkap (P-23) atau tabel Dikeluarkan (tanpa kolom Peringkat). */
function TabelPeserta({ daftar, peringkat, absen, idBagian, rincian, terbuka, alihRincian, muatRincian }: PropsTabel) {
  const jumlahKolom = (peringkat ? 1 : 0) + (absen ? 1 : 0) + 9;
  return (
    <div className="js-konsol-gulung js-hasil-gulung">
      <table className="js-konsol-tabel js-hasil-tabel">
        <thead>
          <tr>
            {peringkat ? <th scope="col">{t.kolomPeringkat}</th> : null}
            <th scope="col">{t.kolomNama}</th>
            {absen ? <th scope="col">{t.kolomAbsen}</th> : null}
            <th scope="col">{t.kolomSkor}</th>
            <th scope="col">{t.kolomSelesai}</th>
            <th scope="col">{t.kolomKetepatan}</th>
            <th scope="col">
              <span className="js-hasil-kepala-ikon">
                <Ikon src={EMOSI_HASIL.tepat} />
                {t.kolomTepat}
              </span>
            </th>
            <th scope="col">
              <span className="js-hasil-kepala-ikon">
                <Ikon src={EMOSI_HASIL.kurang} />
                {t.kolomKurang}
              </span>
            </th>
            <th scope="col">
              <span className="js-hasil-kepala-ikon">
                <Ikon src={EMOSI_HASIL.berisiko} />
                {t.kolomBerisiko}
              </span>
            </th>
            <th scope="col">{t.kolomWaktu}</th>
            <th scope="col" className="js-hasil-aksi">
              <span className="js-sr">{t.rincian}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {daftar.flatMap((p, i) => {
            const buka = terbuka.includes(p.id);
            const idRincian = `${idBagian}-${p.id}`;
            const genap = i % 2 === 1 ? "ya" : undefined;
            const baris = (
              <tr key={p.id} data-genap={genap}>
                {peringkat ? <td>{p.peringkat ?? KOSONG}</td> : null}
                <td>{p.nama}</td>
                {absen ? <td>{p.nomorAbsen ?? KOSONG}</td> : null}
                <td>{p.skor}</td>
                <td>{p.selesai}</td>
                <td>{persenTeks(persen(p.langkah1Benar, p.langkah1Dijawab))}</td>
                <td>{p.tepat}</td>
                <td>{p.kurang}</td>
                <td>{p.berisiko}</td>
                <td>{p.skor > 0 ? (formatWaktuSkor(p.waktuSkorMs) ?? KOSONG) : KOSONG}</td>
                <td className="js-hasil-aksi">
                  <button
                    type="button"
                    className="js-konsol-tombol"
                    aria-expanded={buka}
                    aria-controls={buka ? idRincian : undefined}
                    aria-label={isiTeks(t.rincianLabel, { nama: p.nama })}
                    onClick={() => alihRincian(p.id)}
                  >
                    {buka ? t.tutupRincian : t.rincian}
                  </button>
                </td>
              </tr>
            );
            if (!buka) return [baris];
            return [
              baris,
              <tr key={`${p.id}-rincian`} id={idRincian} className="js-hasil-rincian-baris" data-genap={genap}>
                <td colSpan={jumlahKolom}>
                  <IsiRincian muatan={rincian[p.id] ?? { jenis: "memuat" }} cobaLagi={() => muatRincian(p.id)} />
                </td>
              </tr>,
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Rincian jawaban satu pemain (P-24). */
function IsiRincian({ muatan, cobaLagi }: { muatan: MuatanRincian; cobaLagi: () => void }) {
  if (muatan.jenis === "memuat") return <p role="status">{t.rincianMemuat}</p>;
  if (muatan.jenis === "gagal") {
    return (
      <div className="js-konsol-tumpuk">
        <p role="alert">{t.rincianGagal}</p>
        <button type="button" className="js-konsol-tombol" onClick={cobaLagi}>
          {t.cobaLagi}
        </button>
      </div>
    );
  }
  const { jawaban } = muatan.data;
  if (jawaban.length === 0) return <p>{t.rincianKosong}</p>;
  return (
    <div className="js-konsol-gulung">
      <table className="js-konsol-tabel js-hasil-rincian">
        <thead>
          <tr>
            <th scope="col">{t.rKejadian}</th>
            <th scope="col">{t.rLangkah1}</th>
            <th scope="col">{t.rLangkah2}</th>
            <th scope="col">{t.rPoin}</th>
            <th scope="col">{t.rWaktu}</th>
          </tr>
        </thead>
        <tbody>
          {jawaban.map((j) => (
            <BarisRincian key={j.kode} j={j} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BarisRincian({ j }: { j: JawabanRincian }) {
  const tingkat = j.tingkat2;
  return (
    <tr>
      <td>{isiTeks(t.rJudul, { kode: j.kode, judul: j.judul })}</td>
      <td>
        <p>{isiTeks(t.rPilihan, { huruf: j.huruf1, teks: j.pilihan1 })}</p>
        <span className="js-konsol-tanda js-hasil-tanda" data-jenis={j.benar1 ? "tepat" : "belum"}>
          <Ikon src={j.benar1 ? EMOSI_HASIL.tepat : EMOSI_HASIL.belum} />
          {j.benar1 ? t.rTepat : t.rBelumTepat}
        </span>
        {j.benar1 ? null : <p className="js-hasil-tepat">{isiTeks(t.rJawabanTepat, { teks: j.jawabanTepat1 })}</p>}
      </td>
      <td>
        {tingkat === null || j.huruf2 === null || j.pilihan2 === null ? (
          <span className="js-konsol-tanda js-hasil-tanda" data-jenis="kosong">
            {t.rBelumDijawab}
          </span>
        ) : (
          <>
            <p>{isiTeks(t.rPilihan, { huruf: j.huruf2, teks: j.pilihan2 })}</p>
            <span className="js-konsol-tanda js-hasil-tanda" data-jenis={tingkat}>
              <Ikon src={EMOSI_HASIL[tingkat]} />
              {TINGKAT[tingkat]}
            </span>
          </>
        )}
        {tingkat === "tepat"
          ? null
          : j.pilihanTepat2.map((teks, k) => (
              <p key={`${k}-${teks}`} className="js-hasil-tepat">
                {isiTeks(t.rPilihanTepat, { teks })}
              </p>
            ))}
      </td>
      <td>{j.poin}</td>
      <td>{j.waktuMenjawabMs === null ? KOSONG : isiTeks(t.rDetik, { n: Math.round(j.waktuMenjawabMs / 1000) })}</td>
    </tr>
  );
}

interface PropsHapus {
  ruang: RingkasanRuang;
  galatSesi: (galat: GalatApi) => boolean;
  buka: (hash: string, pesan?: string) => void;
}

/** Bagian "Hapus data ruang" untuk admin di ruang yang sudah ditutup (P-32, D-3a). */
export function BagianHapus({ ruang, galatSesi, buka }: PropsHapus) {
  const [dialog, setDialog] = useState(false);
  const [pembuka, setPembuka] = useState<HTMLElement | null>(null);
  const [isian, setIsian] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const cocok = labelCocok(isian, ruang.labelKelas);
  const tutup = () => {
    setDialog(false);
    setIsian("");
    setGalat(null);
  };
  const hapus = async (e: FormEvent) => {
    e.preventDefault();
    if (!cocok || sibuk) return;
    setSibuk(true);
    setGalat(null);
    const h = await api.hapusRuang(ruang.id);
    setSibuk(false);
    if (h.ok) {
      setDialog(false);
      buka(keHash("ruang", "riwayat"), isiTeks(t.okHapus, { kelas: ruang.labelKelas, kode: ruang.kode }));
    } else if (!galatSesi(h)) setGalat(h.pesan);
  };
  return (
    <section className="js-bingkai js-hasil-hapus" aria-labelledby="js-hasil-hapus-judul">
      <h2 id="js-hasil-hapus-judul">{t.hapus}</h2>
      <button
        type="button"
        className="js-konsol-tombol js-konsol-tombol-bahaya"
        onClick={(e) => {
          setPembuka(e.currentTarget);
          setDialog(true);
        }}
      >
        {t.hapus}
      </button>
      {dialog ? (
        <Dialog judul={isiTeks(t.hapusJudul, { kelas: ruang.labelKelas })} tutup={sibuk ? null : tutup} kembaliKe={pembuka}>
          <form className="js-konsol-tumpuk" onSubmit={(e) => void hapus(e)} noValidate>
            <p>{isiTeks(t.hapusIsi, { n: ruang.jumlahPeserta })}</p>
            <Kolom label={t.hapusIsian} nilai={isian} ubah={setIsian} petunjuk={isiTeks(t.hapusKetik, { kelas: ruang.labelKelas })} autoComplete="off" />
            <PesanGalat pesan={galat} />
            <div className="js-konsol-tombol-baris">
              <button type="button" className="js-konsol-tombol" onClick={tutup} disabled={sibuk}>
                {TEKS_KONSOL.batal}
              </button>
              <button type="submit" className="js-konsol-tombol js-konsol-tombol-bahaya" disabled={!cocok || sibuk}>
                {sibuk ? t.menghapus : t.hapusTombol}
              </button>
            </div>
          </form>
        </Dialog>
      ) : null}
    </section>
  );
}
