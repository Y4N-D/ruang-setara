// Halaman Akun (spesifikasi JS-04, P-22 sampai P-27, P-43 sampai P-47): tabel akun, dialog akun baru, dialog sandi
// sementara (sekali tampil), dialog ubah akun, dan konfirmasi untuk menonaktifkan dan mengatur ulang sandi.
// Guru yang membuka halaman ini melihat "Halaman ini hanya untuk admin." (P-37).
import { useId, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { emailSah, namaSah, normalkanEmail, normalkanNama, type Akun as DataAkun, type Peran, type Saya } from "../../inti/akun";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, useMuat, type GalatApi } from "../api";
import Dialog from "../Dialog";
import { Ikon, Kolom, PesanBerhasil, PesanGalat } from "../Formulir";
import { keHash } from "../rute";

/** Masuk terakhir dalam zona waktu peramban, misalnya "14 Nov 2026, 07.12" (P-43). */
const FORMAT_WAKTU = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

type Langkah =
  | { jenis: "baru" }
  | { jenis: "sementara"; judul: string; kalimat: string; sandi: string }
  | { jenis: "ubah"; sasaran: DataAkun }
  | { jenis: "konfirmasi"; aksi: "nonaktif" | "aturUlang"; sasaran: DataAkun };

type GalatSesi = (galat: GalatApi) => boolean;

interface PropsAkun {
  akun: Saya;
  galatSesi: GalatSesi;
  umumkan: (pesan: string) => void;
  perbaruiDiri: (akun: Saya) => void;
}

const keSaya = (a: DataAkun): Saya => ({
  id: a.id,
  email: a.email,
  namaTampilan: a.namaTampilan,
  peran: a.peran,
  peninjau: a.peninjau,
  wajibGantiSandi: a.wajibGantiSandi,
});

export default function Akun(props: PropsAkun) {
  if (props.akun.peran !== "admin") {
    return (
      <div className="js-konsol-tumpuk">
        <p>{TEKS_KONSOL.hanyaAdmin}</p>
        <a className="js-konsol-tombol" href={keHash("dasbor")}>
          {TEKS_KONSOL.keDasbor}
        </a>
      </div>
    );
  }
  return <KelolaAkun {...props} />;
}

function KelolaAkun({ akun, galatSesi, umumkan, perbaruiDiri }: PropsAkun) {
  const { muatan, muatUlang, segarkan } = useMuat(api.daftarAkun, galatSesi);
  const [langkah, setLangkah] = useState<Langkah | null>(null);
  const [pembuka, setPembuka] = useState<HTMLElement | null>(null);
  const t = TEKS_KONSOL.akun;

  const buka = (l: Langkah) => (e: MouseEvent<HTMLElement>) => {
    setPembuka(e.currentTarget);
    setLangkah(l);
  };
  const tutup = () => setLangkah(null);
  const sesudahUbah = (a: DataAkun) => {
    segarkan();
    if (a.id === akun.id) perbaruiDiri(keSaya(a));
  };

  if (muatan.jenis === "memuat") return <p role="status">{TEKS_KONSOL.dasbor.memuat}</p>;
  if (muatan.jenis === "gagal") {
    return (
      <div className="js-konsol-tumpuk">
        <p role="alert">{t.gagal}</p>
        <button type="button" className="js-konsol-tombol" onClick={muatUlang}>
          {TEKS_KONSOL.dasbor.cobaLagi}
        </button>
      </div>
    );
  }

  const daftar = muatan.data.akun;
  return (
    <>
      <div className="js-konsol-baris-atas">
        <p>{isiTeks(t.ringkasan, { n: daftar.length, m: daftar.filter((a) => a.aktif).length })}</p>
        <button type="button" className="js-konsol-tombol js-konsol-tombol-utama" onClick={buka({ jenis: "baru" })}>
          {t.baru}
        </button>
      </div>
      <div className="js-konsol-gulung">
        <table className="js-konsol-tabel">
          <thead>
            <tr>
              <th scope="col">{t.kolomNama}</th>
              <th scope="col">{t.kolomEmail}</th>
              <th scope="col">{t.kolomPeran}</th>
              <th scope="col">{t.kolomStatus}</th>
              <th scope="col">{t.kolomMasuk}</th>
              <th scope="col">
                <span className="js-sr">{t.ubah}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {daftar.map((a) => (
              <tr key={a.id}>
                <td>
                  {a.namaTampilan}
                  {a.id === akun.id ? ` ${t.anda}` : ""}
                </td>
                <td>{a.email}</td>
                <td>
                  <div className="js-konsol-sel-label">
                    <span>{TEKS_KONSOL.peran[a.peran]}</span>
                    {a.peninjau ? <span className="js-konsol-tanda js-konsol-tanda-peninjau">{t.peninjau}</span> : null}
                  </div>
                </td>
                <td>
                  <div className="js-konsol-sel-label">
                    {a.aktif ? (
                      <span className="js-konsol-tanda js-konsol-tanda-aktif">
                        <Ikon nama="ikon_centang" />
                        {t.aktif}
                      </span>
                    ) : (
                      <span className="js-konsol-tanda js-konsol-tanda-nonaktif">
                        <Ikon nama="ikon_arsip" />
                        {t.nonaktif}
                      </span>
                    )}
                    {a.aktif && a.wajibGantiSandi ? <span className="js-konsol-tanda js-konsol-tanda-belum">{t.belumGanti}</span> : null}
                  </div>
                </td>
                <td>{a.masukTerakhir === null ? t.belumPernah : FORMAT_WAKTU.format(a.masukTerakhir)}</td>
                <td>
                  <button type="button" className="js-konsol-tombol" aria-label={isiTeks(t.ubahLabel, { nama: a.namaTampilan })} onClick={buka({ jenis: "ubah", sasaran: a })}>
                    {t.ubah}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {langkah?.jenis === "baru" ? (
        <DialogAkunBaru
          kembaliKe={pembuka}
          batal={tutup}
          galatSesi={galatSesi}
          selesai={(baru, sandi) => {
            segarkan();
            setLangkah({
              jenis: "sementara",
              judul: TEKS_KONSOL.sementara.judulBaru,
              kalimat: isiTeks(TEKS_KONSOL.sementara.berhasilBaru, { nama: baru.namaTampilan, peran: TEKS_KONSOL.peran[baru.peran] }),
              sandi,
            });
          }}
        />
      ) : null}
      {langkah?.jenis === "sementara" ? <DialogSandiSementara {...langkah} kembaliKe={pembuka} selesai={tutup} /> : null}
      {langkah?.jenis === "ubah" ? (
        <DialogUbah
          key={langkah.sasaran.id}
          sasaran={langkah.sasaran}
          diri={langkah.sasaran.id === akun.id}
          kembaliKe={pembuka}
          batal={tutup}
          galatSesi={galatSesi}
          minta={(aksi) => setLangkah({ jenis: "konfirmasi", aksi, sasaran: langkah.sasaran })}
          selesai={(a, pesan) => {
            sesudahUbah(a);
            tutup();
            umumkan(pesan);
          }}
        />
      ) : null}
      {langkah?.jenis === "konfirmasi" ? (
        <DialogKonfirmasi
          aksi={langkah.aksi}
          sasaran={langkah.sasaran}
          kembaliKe={pembuka}
          batal={() => setLangkah({ jenis: "ubah", sasaran: langkah.sasaran })}
          galatSesi={galatSesi}
          selesai={(a, sandi) => {
            sesudahUbah(a);
            if (sandi) {
              setLangkah({
                jenis: "sementara",
                judul: TEKS_KONSOL.sementara.judulAturUlang,
                kalimat: isiTeks(TEKS_KONSOL.sementara.berhasilAturUlang, { nama: a.namaTampilan }),
                sandi,
              });
            } else {
              tutup();
              umumkan(TEKS_KONSOL.ubah.tersimpan);
            }
          }}
        />
      ) : null}
    </>
  );
}

// ------------------------------------------------------------------ Dialog akun baru (P-44)

function DialogAkunBaru({
  kembaliKe,
  batal,
  selesai,
  galatSesi,
}: {
  kembaliKe: HTMLElement | null;
  batal: () => void;
  selesai: (akun: DataAkun, sandi: string) => void;
  galatSesi: GalatSesi;
}) {
  const [email, setEmail] = useState("");
  const [nama, setNama] = useState("");
  const [peran, setPeran] = useState<Peran>("guru");
  const [peninjau, setPeninjau] = useState(false);
  const [galat, setGalat] = useState<{ kolom: "email" | "nama" | "umum"; pesan: string } | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const refEmail = useRef<HTMLInputElement>(null);
  const refNama = useRef<HTMLInputElement>(null);
  const idPeran = useId();
  const t = TEKS_KONSOL.akunBaru;

  function tunjuk(kolom: "email" | "nama" | "umum", pesan: string) {
    setGalat({ kolom, pesan });
    if (kolom === "email") refEmail.current?.focus();
    if (kolom === "nama") refNama.current?.focus();
  }

  async function kirim(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;
    const emailBersih = normalkanEmail(email);
    if (!emailSah(emailBersih)) return tunjuk("email", TEKS_KONSOL.galat.EMAIL_SALAH);
    const namaBersih = normalkanNama(nama);
    if (!namaSah(namaBersih)) return tunjuk("nama", TEKS_KONSOL.galat.NAMA_SALAH);
    setGalat(null);
    setSibuk(true);
    const hasil = await api.buatAkun({ email: emailBersih, namaTampilan: namaBersih, peran, peninjau });
    setSibuk(false);
    if (hasil.ok && hasil.data.sandiSementara) return selesai(hasil.data.akun, hasil.data.sandiSementara);
    if (hasil.ok) return tunjuk("umum", TEKS_KONSOL.galat.UMUM);
    if (galatSesi(hasil)) return;
    if (hasil.kode === "EMAIL_SALAH" || hasil.kode === "EMAIL_DIPAKAI") return tunjuk("email", hasil.pesan);
    if (hasil.kode === "NAMA_SALAH") return tunjuk("nama", hasil.pesan);
    tunjuk("umum", hasil.pesan);
  }

  const pesan = (kolom: "email" | "nama" | "umum") => (galat?.kolom === kolom ? galat.pesan : null);
  return (
    <Dialog judul={t.judul} tutup={batal} kembaliKe={kembaliKe}>
      <form className="js-konsol-formulir" onSubmit={kirim} noValidate>
        <Kolom ref={refEmail} label={t.email} jenis="email" autoComplete="off" nilai={email} ubah={setEmail} galat={pesan("email")} />
        <Kolom ref={refNama} label={t.nama} autoComplete="off" nilai={nama} ubah={setNama} petunjuk={t.namaPetunjuk} galat={pesan("nama")} />
        <div className="js-konsol-kolom">
          <label className="js-konsol-label" htmlFor={idPeran}>
            {t.peran}
          </label>
          <select id={idPeran} className="js-konsol-isian" value={peran} onChange={(e) => setPeran(e.target.value as Peran)}>
            <option value="guru">{TEKS_KONSOL.peran.guru}</option>
            <option value="admin">{TEKS_KONSOL.peran.admin}</option>
          </select>
        </div>
        <label className="js-konsol-centang">
          <input type="checkbox" checked={peninjau} onChange={(e) => setPeninjau(e.target.checked)} />
          <span>{t.peninjau}</span>
        </label>
        <PesanGalat pesan={pesan("umum")} />
        <div className="js-konsol-tombol-baris">
          <button type="submit" className="js-konsol-tombol js-konsol-tombol-utama" aria-disabled={sibuk ? true : undefined}>
            {sibuk ? t.membuat : t.buat}
          </button>
          <button type="button" className="js-konsol-tombol" onClick={batal}>
            {TEKS_KONSOL.batal}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

// ------------------------------------------------------------------ Dialog sandi sementara (P-45)

/** Sandi hanya ada di keadaan halaman selama dialog ini terbuka; "Selesai" membuangnya. Esc tidak menutup dialog. */
function DialogSandiSementara({
  judul,
  kalimat,
  sandi,
  kembaliKe,
  selesai,
}: {
  judul: string;
  kalimat: string;
  sandi: string;
  kembaliKe: HTMLElement | null;
  selesai: () => void;
}) {
  const [salin, setSalin] = useState<"belum" | "ok" | "gagal">("belum");
  const t = TEKS_KONSOL.sementara;

  async function salinSandi() {
    try {
      await navigator.clipboard.writeText(sandi);
      setSalin("ok");
    } catch {
      setSalin("gagal");
    }
  }

  return (
    <Dialog judul={judul} tutup={null} kembaliKe={kembaliKe}>
      <div className="js-konsol-formulir">
        <PesanBerhasil pesan={kalimat} />
        <div className="js-konsol-kolom">
          <p className="js-konsol-label">{t.label}</p>
          <p className="js-konsol-sandi-sementara">{sandi}</p>
        </div>
        <div>
          <p>{t.catatan}</p>
          <div className="js-konsol-siaran" aria-live="polite">
            {salin === "ok" ? <PesanBerhasil pesan={t.tersalin} /> : null}
            {salin === "gagal" ? (
              <p className="js-konsol-pesan">
                <Ikon nama="ikon_peringatan" />
                <span>{t.gagalSalin}</span>
              </p>
            ) : null}
          </div>
        </div>
        <div className="js-konsol-tombol-baris">
          <button type="button" className="js-konsol-tombol js-konsol-tombol-utama" data-fokus-awal onClick={salinSandi}>
            {t.salin}
          </button>
          <button type="button" className="js-konsol-tombol" onClick={selesai}>
            {t.selesai}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

// ------------------------------------------------------------------ Dialog ubah akun (P-46)

function DialogUbah({
  sasaran,
  diri,
  kembaliKe,
  batal,
  minta,
  selesai,
  galatSesi,
}: {
  sasaran: DataAkun;
  diri: boolean;
  kembaliKe: HTMLElement | null;
  batal: () => void;
  minta: (aksi: "nonaktif" | "aturUlang") => void;
  selesai: (akun: DataAkun, pesan: string) => void;
  galatSesi: GalatSesi;
}) {
  const [nama, setNama] = useState(sasaran.namaTampilan);
  const [peran, setPeran] = useState<Peran>(sasaran.peran);
  const [peninjau, setPeninjau] = useState(sasaran.peninjau);
  const [galat, setGalat] = useState<{ kolom: "nama" | "umum"; pesan: string } | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const refNama = useRef<HTMLInputElement>(null);
  const idPeran = useId();
  const idCatatan = useId();
  const t = TEKS_KONSOL.ubah;

  function tunjuk(kolom: "nama" | "umum", pesan: string) {
    setGalat({ kolom, pesan });
    if (kolom === "nama") refNama.current?.focus();
  }

  async function ubah(isi: Parameters<typeof api.ubahAkun>[1], pesanBerhasil: (a: DataAkun) => string) {
    if (sibuk) return;
    setGalat(null);
    setSibuk(true);
    const hasil = await api.ubahAkun(sasaran.id, isi);
    setSibuk(false);
    if (hasil.ok) return selesai(hasil.data.akun, pesanBerhasil(hasil.data.akun));
    if (galatSesi(hasil)) return;
    tunjuk(hasil.kode === "NAMA_SALAH" ? "nama" : "umum", hasil.pesan);
  }

  function simpan(e: FormEvent) {
    e.preventDefault();
    const namaBersih = normalkanNama(nama);
    if (!namaSah(namaBersih)) return tunjuk("nama", TEKS_KONSOL.galat.NAMA_SALAH);
    void ubah(diri ? { namaTampilan: namaBersih, peninjau } : { namaTampilan: namaBersih, peran, peninjau }, () => t.tersimpan);
  }

  const pesan = (kolom: "nama" | "umum") => (galat?.kolom === kolom ? galat.pesan : null);
  return (
    <Dialog judul={isiTeks(t.judul, { nama: sasaran.namaTampilan })} tutup={batal} kembaliKe={kembaliKe}>
      <form className="js-konsol-formulir" onSubmit={simpan} noValidate>
        <Kolom ref={refNama} label={TEKS_KONSOL.akunBaru.nama} autoComplete="off" nilai={nama} ubah={setNama} galat={pesan("nama")} />
        <div className="js-konsol-kolom">
          <label className="js-konsol-label" htmlFor={idPeran}>
            {TEKS_KONSOL.akunBaru.peran}
          </label>
          <select
            id={idPeran}
            className="js-konsol-isian"
            value={peran}
            disabled={diri}
            aria-describedby={diri ? idCatatan : undefined}
            onChange={(e) => setPeran(e.target.value as Peran)}
          >
            <option value="guru">{TEKS_KONSOL.peran.guru}</option>
            <option value="admin">{TEKS_KONSOL.peran.admin}</option>
          </select>
        </div>
        <label className="js-konsol-centang">
          <input type="checkbox" checked={peninjau} onChange={(e) => setPeninjau(e.target.checked)} />
          <span>{TEKS_KONSOL.akunBaru.peninjau}</span>
        </label>
        <PesanGalat pesan={pesan("umum")} />
        <div className="js-konsol-tombol-baris">
          <button type="submit" className="js-konsol-tombol js-konsol-tombol-utama" aria-disabled={sibuk ? true : undefined}>
            {sibuk ? t.menyimpan : t.simpan}
          </button>
          <button type="button" className="js-konsol-tombol" onClick={batal}>
            {TEKS_KONSOL.batal}
          </button>
        </div>
      </form>
      <div className="js-konsol-bagian js-konsol-formulir">
        {diri ? (
          <p id={idCatatan} className="js-konsol-petunjuk">
            {t.diri}
          </p>
        ) : null}
        <div className="js-konsol-tombol-baris">
          {sasaran.aktif ? (
            <button type="button" className="js-konsol-tombol" disabled={diri} onClick={() => minta("nonaktif")}>
              {t.nonaktifkan}
            </button>
          ) : (
            <button
              type="button"
              className="js-konsol-tombol"
              aria-disabled={sibuk ? true : undefined}
              onClick={() => void ubah({ aktif: true }, (a) => isiTeks(t.aktifLagi, { nama: a.namaTampilan }))}
            >
              {t.aktifkan}
            </button>
          )}
          <button type="button" className="js-konsol-tombol" disabled={diri} onClick={() => minta("aturUlang")}>
            {t.aturUlang}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

// ------------------------------------------------------------------ Konfirmasi berbahaya (P-47)

function DialogKonfirmasi({
  aksi,
  sasaran,
  kembaliKe,
  batal,
  selesai,
  galatSesi,
}: {
  aksi: "nonaktif" | "aturUlang";
  sasaran: DataAkun;
  kembaliKe: HTMLElement | null;
  batal: () => void;
  selesai: (akun: DataAkun, sandiSementara: string | undefined) => void;
  galatSesi: GalatSesi;
}) {
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const k = TEKS_KONSOL.konfirmasi;
  const nama = { nama: sasaran.namaTampilan };
  const teks =
    aksi === "nonaktif"
      ? { judul: isiTeks(k.nonaktifJudul, nama), isi: isiTeks(k.nonaktifIsi, nama), tombol: k.nonaktifTombol }
      : { judul: isiTeks(k.aturUlangJudul, nama), isi: isiTeks(k.aturUlangIsi, nama), tombol: k.aturUlangTombol };

  async function lakukan() {
    if (sibuk) return;
    setGalat(null);
    setSibuk(true);
    const hasil = await api.ubahAkun(sasaran.id, aksi === "nonaktif" ? { aktif: false } : { aturUlangSandi: true });
    setSibuk(false);
    if (hasil.ok) return selesai(hasil.data.akun, hasil.data.sandiSementara);
    if (galatSesi(hasil)) return;
    setGalat(hasil.pesan);
  }

  return (
    <Dialog judul={teks.judul} tutup={batal} kembaliKe={kembaliKe}>
      <div className="js-konsol-formulir">
        <p>{teks.isi}</p>
        <PesanGalat pesan={galat} />
        <div className="js-konsol-tombol-baris">
          <button type="button" className="js-konsol-tombol js-konsol-tombol-bahaya" aria-disabled={sibuk ? true : undefined} onClick={() => void lakukan()}>
            {teks.tombol}
          </button>
          <button type="button" className="js-konsol-tombol" data-fokus-awal onClick={batal}>
            {TEKS_KONSOL.batal}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
