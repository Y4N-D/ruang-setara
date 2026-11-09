// Panel lobi di atas dunia (spesifikasi JS-07, P-25, P-26, P-43; DRAF D-2 pilihan a; Design System 10 "Lobi pemain").
// Kode ruang, nama samaran dan avatar sendiri, jumlah pemain, dua kalimat, dan tombol layar penuh.
import { useEffect, useRef, useState } from "react";
import { IKON } from "../assets/manifest";
import { isiTeks, TEKS } from "../teks";
import { IKON_AVATAR } from "./avatar";

/** Layar penuh lalu kunci orientasi mendatar bila didukung; kegagalan diabaikan (P-43). */
async function masukLayarPenuh(): Promise<void> {
  try {
    await document.documentElement.requestFullscreen();
    const orientasi = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    await orientasi.lock?.("landscape").catch(() => undefined);
  } catch {
    // Peramban menolak layar penuh: tidak ada pesan.
  }
}

function useBisaLayarPenuh(): boolean {
  const [bisa, setBisa] = useState(() => Boolean(document.fullscreenEnabled) && !document.fullscreenElement);
  useEffect(() => {
    const ubah = () => setBisa(Boolean(document.fullscreenEnabled) && !document.fullscreenElement);
    document.addEventListener("fullscreenchange", ubah);
    return () => document.removeEventListener("fullscreenchange", ubah);
  }, []);
  return bisa;
}

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
          <button type="button" className="js-tombol js-tombol-ikon" onClick={() => void masukLayarPenuh()}>
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
