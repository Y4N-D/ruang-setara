// Halaman sandi (spesifikasi JS-04, P-18, P-19, P-40, P-41). Mode wajib: "Buat sandi baru" sesudah masuk dengan sandi
// sementara. Mode sukarela: "Sandi saya". Aturan P-19 dan kesamaan kedua sandi baru diperiksa sebelum mengirim; galat
// tampil di bawah kolom yang bersangkutan, dan fokus pindah ke kolom itu.
import { useRef, useState, type FormEvent } from "react";
import { periksaSandiBaru, type Saya } from "../../inti/akun";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, type GalatApi } from "../api";
import { KolomSandi, PesanGalat } from "../Formulir";

type Kolom = "sekarang" | "baru" | "ulangi" | "umum";

interface PropsGantiSandi {
  akun: Saya;
  wajib: boolean;
  berhasil: (akun: Saya, wajib: boolean) => void;
  galatSesi: (galat: GalatApi) => boolean;
}

const TERSEMBUNYI = { sekarang: false, baru: false, ulangi: false };

export default function GantiSandi({ akun, wajib, berhasil, galatSesi }: PropsGantiSandi) {
  const [sekarang, setSekarang] = useState("");
  const [baru, setBaru] = useState("");
  const [ulangi, setUlangi] = useState("");
  const [tampil, setTampil] = useState(TERSEMBUNYI);
  const [galat, setGalat] = useState<{ kolom: Kolom; pesan: string } | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const refSekarang = useRef<HTMLInputElement>(null);
  const refBaru = useRef<HTMLInputElement>(null);
  const refUlangi = useRef<HTMLInputElement>(null);

  function tunjuk(kolom: Kolom, pesan: string) {
    setGalat({ kolom, pesan });
    if (kolom === "sekarang") refSekarang.current?.focus();
    if (kolom === "baru") refBaru.current?.focus();
    if (kolom === "ulangi") refUlangi.current?.focus();
  }

  async function kirim(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;
    setTampil(TERSEMBUNYI);
    if (!wajib && sekarang === "") return tunjuk("sekarang", TEKS_KONSOL.galat.SANDI_LAMA_SALAH);
    const aturan = periksaSandiBaru(baru, akun.email);
    if (aturan) return tunjuk("baru", TEKS_KONSOL.galat[aturan]);
    if (baru !== ulangi) return tunjuk("ulangi", TEKS_KONSOL.sandi.tidakSama);
    setGalat(null);
    setSibuk(true);
    const hasil = await api.gantiSandi(wajib ? { sandiBaru: baru } : { sandiLama: sekarang, sandiBaru: baru });
    setSibuk(false);
    if (hasil.ok) {
      setSekarang("");
      setBaru("");
      setUlangi("");
      berhasil(hasil.data.akun, wajib);
      return;
    }
    if (galatSesi(hasil)) return;
    if (!wajib && (hasil.kode === "SANDI_LAMA_SALAH" || hasil.kode === "TERKUNCI")) return tunjuk("sekarang", hasil.pesan);
    if (hasil.kode.startsWith("SANDI_")) return tunjuk("baru", hasil.pesan);
    tunjuk("umum", hasil.pesan);
  }

  const pesan = (kolom: Kolom) => (galat?.kolom === kolom ? galat.pesan : null);

  return (
    <div className="js-konsol-tumpuk">
      {wajib ? (
        <div>
          <h1 className="js-konsol-judul-isi">{TEKS_KONSOL.sandi.judulWajib}</h1>
          <p>{TEKS_KONSOL.sandi.penjelasanWajib}</p>
        </div>
      ) : null}
      <form className="js-bingkai js-konsol-panel js-konsol-formulir" onSubmit={kirim} noValidate>
        {wajib ? null : (
          <KolomSandi
            ref={refSekarang}
            label={TEKS_KONSOL.sandi.sekarang}
            autoComplete="current-password"
            nilai={sekarang}
            ubah={setSekarang}
            tampil={tampil.sekarang}
            ubahTampil={(t) => setTampil((s) => ({ ...s, sekarang: t }))}
            galat={pesan("sekarang")}
          />
        )}
        <KolomSandi
          ref={refBaru}
          label={TEKS_KONSOL.sandi.baru}
          autoComplete="new-password"
          nilai={baru}
          ubah={setBaru}
          tampil={tampil.baru}
          ubahTampil={(t) => setTampil((s) => ({ ...s, baru: t }))}
          petunjuk={TEKS_KONSOL.sandi.petunjuk}
          galat={pesan("baru")}
        />
        <KolomSandi
          ref={refUlangi}
          label={TEKS_KONSOL.sandi.ulangi}
          autoComplete="new-password"
          nilai={ulangi}
          ubah={setUlangi}
          tampil={tampil.ulangi}
          ubahTampil={(t) => setTampil((s) => ({ ...s, ulangi: t }))}
          galat={pesan("ulangi")}
        />
        <PesanGalat pesan={pesan("umum")} />
        <div className="js-konsol-tombol-baris">
          <button type="submit" className="js-konsol-tombol js-konsol-tombol-utama" aria-disabled={sibuk ? true : undefined}>
            {sibuk ? TEKS_KONSOL.sandi.menyimpan : TEKS_KONSOL.sandi.simpan}
          </button>
        </div>
      </form>
    </div>
  );
}
