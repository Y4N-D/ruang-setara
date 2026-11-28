// Panel lobi di atas dunia (spesifikasi JS-07, P-25, P-26, P-43; DRAF D-2 pilihan a; Design System 10 "Lobi pemain").
// Kode ruang, nama samaran dan avatar sendiri, jumlah pemain, dua kalimat, dan tombol layar penuh.
// JS-24 (P-1, P-5): cara masuk layar penuh pindah ke layarPenuh.ts, dan tombolnya memakai aturan ketukan HUD.
import { useEffect, useRef } from "react";
import { IKON } from "../assets/manifest";
import { isiTeks, TEKS } from "../teks";
import { IKON_AVATAR } from "./avatar";
import { masukLayarPenuh, useBisaLayarPenuh } from "./layarPenuh";
import { useTekanHud } from "./tekanHud";

export default function PanelLobi({
  kode,
  nama,
  avatar,
  jumlah,
  umumkan,
}: {
  kode: string;
  nama: string;
  avatar: number;
  jumlah: number;
  umumkan: (teks: string) => void;
}) {
  const bisaLayarPenuh = useBisaLayarPenuh();
  const tekanLayarPenuh = useTekanHud(() => void masukLayarPenuh());
  const terakhir = useRef(jumlah);
  // Jumlah pemain yang berubah diumumkan sesudah 3 detik tanpa perubahan lagi, agar tidak riuh (D-2).
  useEffect(() => {
    if (jumlah === terakhir.current) return;
    const id = window.setTimeout(() => {
      terakhir.current = jumlah;
      umumkan(isiTeks(TEKS.lobi.jumlah, { n: jumlah }));
    }, 3000);
    return () => window.clearTimeout(id);
  }, [jumlah, umumkan]);
  // Tiga baris pendek agar panel tidak menutupi pemain sendiri di tengah dunia, juga di HP (D-2a).
  return (
    <section className="js-bingkai js-panel-lobi" aria-labelledby="js-panel-lobi-judul">
      <h1 className="js-sr" id="js-panel-lobi-judul">
        {TEKS.lobi.judul}
      </h1>
      <div className="js-panel-lobi-baris">
        <p className="js-panel-lobi-kode">
          <span className="js-label">{TEKS.lobi.labelKode}</span>
          <span className="js-kode-sedang">{kode}</span>
        </p>
        {bisaLayarPenuh ? (
          <button type="button" className="js-tombol js-tombol-ikon" {...tekanLayarPenuh}>
            {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
            <img src={IKON.ikon_layar_penuh.url} alt="" width={24} height={24} />
            {TEKS.dunia.layarPenuh}
          </button>
        ) : null}
      </div>
      <p className="js-panel-lobi-diri">
        {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
        <img src={IKON_AVATAR[avatar] ?? IKON_AVATAR[0]} alt="" width={24} height={24} />
        <span className="js-panel-lobi-nama">{nama}</span>
        <span className="js-panel-lobi-jumlah">{isiTeks(TEKS.lobi.jumlah, { n: jumlah })}</span>
      </p>
      <p className="js-panel-lobi-tunggu">
        <span>{TEKS.lobi.menunggu}</span> <span className="js-panel-lobi-saran">{TEKS.lobi.saran}</span>
      </p>
    </section>
  );
}
