// Penyunting kejadian `#/kejadian/{kode}` dan `#/kejadian/baru` (spesifikasi JS-12, P-6 sampai P-16): isian berbagian,
// validasi langsung, simpan dengan penanda versi, aksi status, riwayat versi, dan pratinjau seperti di HP.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Saya } from "../../inti/akun";
import { CATATAN_TERBIT_MAKS, type AksiKejadian, type DetailKejadian, type TemuanApi } from "../../inti/bank";
import { periksaKejadian } from "../../inti/konten/periksa";
import type { IsiKejadian } from "../../inti/tipe";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, temuanDari, useMuat, type GalatApi, type HasilApi } from "../api";
import Dialog from "../Dialog";
import { PesanGalat } from "../Formulir";
import { FormKejadian, petakanTemuan } from "./BagianPenyunting";
import { TandaStatus } from "./DaftarKejadian";
import Pratinjau from "./Pratinjau";
import Riwayat from "./Riwayat";

const t = TEKS_KONSOL.sunting;
const ta = TEKS_KONSOL.aksi;
const tb = TEKS_KONSOL.bank;

const KOSONG: IsiKejadian = {
  kode: "K-00",
  judul: "",
  zona: "z1",
  setTokoh: [],
  situasi: "",
  langkah1: {
    pertanyaan: "",
    opsi: [
      { id: "1a", teks: "", benar: true, umpanBalik: "" },
      { id: "1b", teks: "", benar: false, umpanBalik: "" },
      { id: "1c", teks: "", benar: false, umpanBalik: "" },
      { id: "1d", teks: "", benar: false, umpanBalik: "" },
    ],
    petunjuk: "",
  },
  langkah2: {
    pertanyaan: "",
    opsi: [
      { id: "2a", teks: "", tingkat: "tepat", terjadi: "" },
      { id: "2b", teks: "", tingkat: "kurang", terjadi: "" },
      { id: "2c", teks: "", tingkat: "berisiko", terjadi: "" },
    ],
  },
  kartu: { hak: "", kewajiban: "", rujukan: [] },
  topik: "",
  jenis: "pelanggaran_hak",
};

const LABEL_AKSI: Readonly<Record<AksiKejadian, string>> = {
  ajukan: ta.ajukan,
  kembalikan: ta.kembalikan,
  terbitkan: ta.terbitkan,
  arsipkan: ta.arsipkan,
  pulihkan: ta.pulihkan,
  hapus: ta.hapus,
};
const OK_AKSI: Readonly<Record<AksiKejadian, string>> = {
  ajukan: ta.okAjukan,
  kembalikan: ta.okKembalikan,
  terbitkan: ta.okTerbitkan,
  arsipkan: ta.okArsipkan,
  pulihkan: ta.okPulihkan,
  hapus: ta.okHapus,
};

interface PropsPenyunting {
  kode: string;
  akun: Saya;
  galatSesi: (g: GalatApi) => boolean;
  umumkan: (pesan: string) => void;
  buka: (hash: string, pesan?: string) => void;
}

export default function Penyunting({ kode, galatSesi, umumkan, buka }: PropsPenyunting) {
  const baru = kode === "baru";
  const pilihan = useMuat(api.pilihanBank, galatSesi);
  const [muat, setMuat] = useState<"memuat" | "ada" | "gagal" | "tidakAda">(baru ? "ada" : "memuat");
  const [detail, setDetail] = useState<DetailKejadian | null>(null);
  const [isi, setIsi] = useState<IsiKejadian>(KOSONG);
  const [diubahPada, setDiubahPada] = useState<number | null>(null);
  const [kotor, setKotor] = useState(false);
  const [temuan, setTemuan] = useState<TemuanApi[]>([]);
  const [lihat, setLihat] = useState<{ nomor: number; isi: IsiKejadian } | null>(null);
  const [konfirmasi, setKonfirmasi] = useState<"terbitkan" | "arsipkan" | "hapus" | null>(null);
  const [pembuka, setPembuka] = useState<HTMLElement | null>(null);
  const [catatan, setCatatan] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [bentrok, setBentrok] = useState(false);
  const [tampilPratinjau, setTampilPratinjau] = useState(false);
  const kotorRef = useRef(false);
  useEffect(() => {
    kotorRef.current = kotor;
  }, [kotor]);

  const terapkan = useCallback(
    (h: HasilApi<DetailKejadian>) => {
      if (h.ok) {
        setDetail(h.data);
        setIsi(h.data.kerja.isi as IsiKejadian);
        setDiubahPada(h.data.kerja.diubahPada);
        setKotor(false);
        setBentrok(false);
        setMuat("ada");
      } else if (!galatSesi(h)) setMuat(h.kode === "KEJADIAN_TIDAK_ADA" ? "tidakAda" : "gagal");
    },
    [galatSesi],
  );
  const muatDetail = useCallback(() => void api.detailKejadian(kode).then(terapkan), [kode, terapkan]);
  useEffect(() => {
    if (baru) return;
    let aktif = true;
    void api.detailKejadian(kode).then((h) => {
      if (aktif) terapkan(h);
    });
    return () => {
      aktif = false;
    };
  }, [baru, kode, terapkan]);

  // P-8: validasi langsung sesudah berhenti mengetik 300 ms.
  const data = pilihan.muatan.jenis === "ada" ? pilihan.muatan.data : null;
  const konteks = useMemo(() => (data ? { rujukan: new Set(data.rujukan.map((r) => r.id)), kunciAset: new Set(data.aset) } : null), [data]);
  useEffect(() => {
    if (!konteks) return;
    const jeda = window.setTimeout(() => setTemuan(periksaKejadian(isi, konteks)), 300);
    return () => window.clearTimeout(jeda);
  }, [isi, konteks]);

  // P-10: peringatan perubahan belum tersimpan (menutup tab dan berpindah halaman konsol).
  useEffect(() => {
    const tutup = (e: BeforeUnloadEvent) => {
      if (kotorRef.current) e.preventDefault();
    };
    const klik = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='#/']");
      if (a && kotorRef.current && !window.confirm(t.tinggalkan)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", tutup);
    document.addEventListener("click", klik, true);
    return () => {
      window.removeEventListener("beforeunload", tutup);
      document.removeEventListener("click", klik, true);
    };
  }, []);

  const rujukanTeks = useMemo(() => {
    const peta = new Map((data?.rujukan ?? []).map((r) => [r.id, r.teks]));
    return (lihat?.isi ?? isi).kartu.rujukan.map((id) => peta.get(id) ?? id);
  }, [data, isi, lihat]);

  if (muat === "memuat" || pilihan.muatan.jenis === "memuat") return <p role="status">{tb.memuat}</p>;
  if (muat === "tidakAda") return <p role="alert">{t.tidakAda}</p>;
  if (muat === "gagal" || !data) {
    return (
      <div className="js-konsol-tumpuk">
        <p role="alert">{tb.gagal}</p>
        <button type="button" className="js-konsol-tombol" onClick={() => window.location.reload()}>
          {tb.cobaLagi}
        </button>
      </div>
    );
  }

  const bolehSunting = baru || (detail?.bolehSunting ?? false);
  const nonaktif = !bolehSunting || lihat !== null || sibuk;
  const jumlahGalat = temuan.filter((x) => x.tingkat === "galat").length;
  const ubah = (f: (x: IsiKejadian) => IsiKejadian) => {
    setIsi((lama) => f(lama));
    setKotor(true);
    setGalat(null);
  };

  const simpan = async () => {
    setSibuk(true);
    setGalat(null);
    const h = baru ? await api.buatKejadian(isi) : await api.simpanKejadian(kode, isi, diubahPada ?? 0);
    setSibuk(false);
    if (h.ok) {
      setKotor(false);
      kotorRef.current = false;
      if (baru) buka(`#/kejadian/${h.data.kode}`, t.tersimpan);
      else {
        umumkan(t.tersimpan);
        muatDetail();
      }
      return;
    }
    if (galatSesi(h)) return;
    if (h.kode === "SUDAH_DIUBAH") setBentrok(true);
    else if (h.kode === "TEMUAN") setTemuan(temuanDari(h));
    else setGalat(h.pesan);
  };

  const jalankan = async (aksi: AksiKejadian) => {
    setSibuk(true);
    setGalat(null);
    const h = await api.aksiKejadian(kode, aksi, aksi === "terbitkan" ? catatan.trim() : undefined);
    setSibuk(false);
    setKonfirmasi(null);
    if (h.ok) {
      const pesan = isiTeks(OK_AKSI[aksi], { kode, nomor: h.data.nomor ?? "" });
      if (aksi === "hapus") buka("#/kejadian", pesan);
      else {
        umumkan(pesan);
        muatDetail();
      }
      return;
    }
    if (galatSesi(h)) return;
    if (h.kode === "TEMUAN") setTemuan(temuanDari(h));
    setGalat(h.pesan);
  };

  const tekanAksi = (aksi: AksiKejadian, e: React.MouseEvent<HTMLButtonElement>) => {
    if (aksi === "terbitkan" || aksi === "arsipkan" || aksi === "hapus") {
      setPembuka(e.currentTarget);
      setCatatan("");
      setKonfirmasi(aksi);
    } else void jalankan(aksi);
  };

  const lihatVersi = async (nomor: number) => {
    if (lihat?.nomor === nomor) return setLihat(null);
    const h = await api.versiKejadian(kode, nomor);
    if (h.ok) setLihat({ nomor, isi: h.data.isi as IsiKejadian });
    else if (!galatSesi(h)) setGalat(h.pesan);
  };

  const alasanTerbit =
    jumlahGalat > 0
      ? isiTeks(ta.alasanGalat, { n: jumlahGalat })
      : detail && detail.rujukanBelum.length > 0
        ? isiTeks(ta.alasanRujukan, { daftar: detail.rujukanBelum.join(", ") })
        : null;
  const tampilIsi = lihat?.isi ?? isi;

  return (
    <div className="js-sunting-halaman">
      <a href="#/kejadian" className="js-konsol-kembali">
        {t.kembali}
      </a>
      <div className="js-sunting-kepala">
        <h2>{baru ? t.baru : `${kode} · ${isi.judul}`}</h2>
        {detail ? <TandaStatus status={detail.kejadian.status} adaPerubahan={detail.kejadian.adaPerubahan} /> : null}
        {detail ? <span className="js-konsol-petunjuk">{detail.kejadian.pemilik ?? tb.bankAwal}</span> : null}
      </div>

      <div className="js-sunting-bilah" role="region" aria-label={t.simpan}>
        <span role="status" className="js-sunting-ringkas" data-galat={jumlahGalat > 0 ? "ya" : undefined}>
          {jumlahGalat > 0 ? isiTeks(t.ringkasGalat, { n: jumlahGalat }) : t.ringkasSah}
          {kotor ? ` · ${t.belumDisimpan}` : ""}
        </span>
        {bolehSunting && lihat === null ? (
          <button type="button" className="js-konsol-tombol js-konsol-tombol-utama" disabled={sibuk || !kotor || jumlahGalat > 0} onClick={() => void simpan()}>
            {sibuk ? t.menyimpan : t.simpan}
          </button>
        ) : null}
        {!baru && !kotor
          ? (detail?.aksi ?? []).map((aksi) => {
              const alasan = aksi === "terbitkan" ? alasanTerbit : null;
              return (
                <button key={aksi} type="button" className="js-konsol-tombol" disabled={sibuk || alasan !== null} title={alasan ?? undefined} onClick={(e) => tekanAksi(aksi, e)}>
                  {LABEL_AKSI[aksi]}
                </button>
              );
            })
          : null}
        <button type="button" className="js-konsol-tombol js-sunting-tombol-pratinjau" aria-pressed={tampilPratinjau} onClick={() => setTampilPratinjau(!tampilPratinjau)}>
          {TEKS_KONSOL.pratinjau.judul}
        </button>
      </div>
      {!kotor && alasanTerbit && detail?.aksi.includes("terbitkan") ? <p className="js-konsol-petunjuk">{alasanTerbit}</p> : null}
      {!bolehSunting ? <p className="js-konsol-petunjuk">{detail?.kejadian.status === "arsip" ? t.hanyaBacaArsip : t.hanyaBaca}</p> : null}
      {bentrok ? (
        <div className="js-konsol-tumpuk" role="alert">
          <p>{t.bentrok}</p>
          <button type="button" className="js-konsol-tombol" onClick={() => muatDetail()}>
            {t.muatUlang}
          </button>
        </div>
      ) : null}
      <PesanGalat pesan={galat} />
      {lihat ? (
        <button type="button" className="js-konsol-tombol" onClick={() => setLihat(null)}>
          {TEKS_KONSOL.riwayat.kembaliKerja}
        </button>
      ) : null}

      <div className="js-sunting" data-pratinjau={tampilPratinjau ? "ya" : undefined}>
        <div className="js-sunting-kiri">
          <FormKejadian isi={tampilIsi} ubah={ubah} pilihan={data} peta={petakanTemuan(lihat ? [] : temuan)} nonaktif={nonaktif} />
          {detail ? <Riwayat riwayat={detail.riwayat} lihat={(n) => void lihatVersi(n)} dilihat={lihat?.nomor ?? null} /> : null}
        </div>
        <div className="js-sunting-kanan">
          <Pratinjau isi={tampilIsi} rujukan={rujukanTeks} versi={lihat?.nomor ?? null} />
        </div>
      </div>

      {konfirmasi ? (
        <Dialog
          judul={isiTeks(konfirmasi === "terbitkan" ? ta.terbitkanJudul : konfirmasi === "arsipkan" ? ta.arsipkanJudul : ta.hapusJudul, { kode })}
          tutup={() => setKonfirmasi(null)}
          kembaliKe={pembuka}
        >
          {konfirmasi === "terbitkan" ? (
            <div className="js-sunting-kolom">
              <label htmlFor="js-catatan-terbit">{ta.catatan}</label>
              <input id="js-catatan-terbit" type="text" value={catatan} maxLength={CATATAN_TERBIT_MAKS} onChange={(e) => setCatatan(e.target.value)} />
            </div>
          ) : (
            <p>{konfirmasi === "arsipkan" ? ta.arsipkanIsi : ta.hapusIsi}</p>
          )}
          <div className="js-konsol-tombol-baris">
            <button type="button" className="js-konsol-tombol" onClick={() => setKonfirmasi(null)}>
              {ta.batal}
            </button>
            <button
              type="button"
              className="js-konsol-tombol js-konsol-tombol-utama"
              disabled={sibuk || (konfirmasi === "terbitkan" && catatan.trim().length === 0)}
              onClick={() => void jalankan(konfirmasi)}
            >
              {LABEL_AKSI[konfirmasi]}
            </button>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
