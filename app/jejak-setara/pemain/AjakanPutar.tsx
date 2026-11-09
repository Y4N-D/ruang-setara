// Ajakan memutar HP (spesifikasi JS-07, P-42; Design System 3.3): di HP tegak, hanya ikon dan kalimat ini yang
// tampil, tanpa dunia di belakangnya. Ronde tetap berjalan.
import { IKON } from "../assets/manifest";
import { TEKS } from "../teks";

export default function AjakanPutar() {
  return (
    <div className="js-ajakan-putar" role="alertdialog" aria-modal="true" aria-labelledby="js-ajakan-putar-teks">
      {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
      <img src={IKON.ikon_putar_hp.url} alt="" width={96} height={96} />
      <p id="js-ajakan-putar-teks">{TEKS.dunia.putarHp}</p>
    </div>
  );
}
