// Halaman masuk konsol (spesifikasi JS-04, P-39, P-40, P-48): panel bingkai piksel di tengah layar ink, penanda server,
// dan dua kalimat kredit Design System 15.
import { useRef, useState, type FormEvent } from "react";
import PenandaServer from "../../bersama/PenandaServer";
import type { Saya } from "../../inti/akun";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api } from "../api";
import { Kolom, KolomSandi, PesanInfo } from "../Formulir";

export default function Masuk({ sesiBerakhir, berhasil }: { sesiBerakhir: boolean; berhasil: (akun: Saya) => void }) {
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [tampil, setTampil] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const refEmail = useRef<HTMLInputElement>(null);
  const refSandi = useRef<HTMLInputElement>(null);

  async function kirim(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;
    setTampil(false);
    if (email.trim() === "" || sandi === "") {
      setGalat(TEKS_KONSOL.masuk.isiKosong);
      (email.trim() === "" ? refEmail : refSandi).current?.focus();
      return;
    }
    setGalat(null);
    setSibuk(true);
    const hasil = await api.masuk(email, sandi);
    setSibuk(false);
    if (hasil.ok) {
      berhasil(hasil.data.akun);
      return;
    }
    // Kolom Sandi dikosongkan dan difokus lagi (P-39).
    setSandi("");
    setGalat(hasil.pesan);
    refSandi.current?.focus();
  }

  return (
    <main className="js-konsol-layar-masuk">
      <div className="js-bingkai js-konsol-panel-masuk">
        <h1 className="js-konsol-merek-besar">{TEKS_KONSOL.merek}</h1>
        <p className="js-konsol-subjudul">{TEKS_KONSOL.subjudul}</p>
        <form className="js-konsol-formulir" onSubmit={kirim} noValidate>
          {sesiBerakhir ? <PesanInfo pesan={TEKS_KONSOL.sesiBerakhir} /> : null}
          <Kolom ref={refEmail} label={TEKS_KONSOL.masuk.email} jenis="email" autoComplete="username" nilai={email} ubah={setEmail} />
          <KolomSandi
            ref={refSandi}
            label={TEKS_KONSOL.masuk.sandi}
            autoComplete="current-password"
            nilai={sandi}
            ubah={setSandi}
            tampil={tampil}
            ubahTampil={setTampil}
            galat={galat}
          />
          <button type="submit" className="js-konsol-tombol js-konsol-tombol-utama js-konsol-tombol-penuh" aria-disabled={sibuk ? true : undefined}>
            {sibuk ? TEKS_KONSOL.masuk.memeriksa : TEKS_KONSOL.masuk.tombol}
          </button>
        </form>
      </div>
      <PenandaServer />
      <p className="js-konsol-kredit">
        {TEKS_KONSOL.masuk.kreditAset}
        <br />
        {TEKS_KONSOL.masuk.kreditHuruf}
      </p>
    </main>
  );
}
