// Kerangka konsol sesudah masuk (spesifikasi JS-04, P-38; Design System 3.7): navigasi samping 240 px berlatar ink,
// kepala cream dengan judul halaman, "{nama} · {peran}", dan tombol Keluar, serta isi paling lebar 1.200 px. Di bawah
// 1024 px navigasi samping disembunyikan dan tombol "Menu" membuka daftar menu di bawah kepala (D-2). Mode wajib ganti
// sandi memakai kepala tanpa menu.
import { useId, useState, type ReactNode } from "react";
import type { Saya } from "../inti/akun";
import { isiTeks } from "../teks";
import { TEKS_KONSOL } from "../teks-konsol";
import { Ikon } from "./Formulir";
import { keHash, menuUntuk, type Rute } from "./rute";

export interface Pemberitahuan {
  jenis: "berhasil" | "galat";
  pesan: string;
}

interface PropsKerangka {
  akun: Saya;
  rute: Rute;
  wajib: boolean;
  pemberitahuan: Pemberitahuan | null;
  keluar: () => void;
  children: ReactNode;
}

const JUDUL: Record<Exclude<Rute, "masuk">, string> = {
  dasbor: TEKS_KONSOL.dasbor.judul,
  akun: TEKS_KONSOL.akun.judul,
  sandi: TEKS_KONSOL.sandi.judul,
};

function Merek() {
  return (
    <p className="js-konsol-merek">
      <Ikon nama="ikon_jejak" ukuran={32} />
      <span>{TEKS_KONSOL.merek}</span>
    </p>
  );
}

function DaftarMenu({ akun, rute, pilih }: { akun: Saya; rute: Rute; pilih?: () => void }) {
  return (
    <ul className="js-konsol-menu">
      {menuUntuk(akun.peran).map((r) => (
        <li key={r}>
          <a href={keHash(r)} aria-current={r === rute ? "page" : undefined} onClick={pilih}>
            {TEKS_KONSOL.menu[r]}
          </a>
        </li>
      ))}
    </ul>
  );
}

function WilayahPemberitahuan({ pemberitahuan }: { pemberitahuan: Pemberitahuan | null }) {
  return (
    <>
      <div className="js-konsol-pemberitahuan" aria-live="polite">
        {pemberitahuan?.jenis === "berhasil" ? (
          <p className="js-konsol-pesan js-konsol-pesan-berhasil">
            <Ikon nama="ikon_centang" />
            <span>{pemberitahuan.pesan}</span>
          </p>
        ) : null}
      </div>
      {pemberitahuan?.jenis === "galat" ? (
        <div className="js-konsol-pemberitahuan">
          <p className="js-konsol-pesan" role="alert">
            <Ikon nama="ikon_peringatan" />
            <span>{pemberitahuan.pesan}</span>
          </p>
        </div>
      ) : null}
    </>
  );
}

export default function Kerangka({ akun, rute, wajib, pemberitahuan, keluar, children }: PropsKerangka) {
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const idMenu = useId();
  const pengguna = isiTeks(TEKS_KONSOL.pengguna, { nama: akun.namaTampilan, peran: TEKS_KONSOL.peran[akun.peran] });
  const tombolKeluar = (
    <button type="button" className="js-konsol-tombol" onClick={keluar}>
      {TEKS_KONSOL.keluar}
    </button>
  );

  if (wajib) {
    return (
      <div className="js-konsol js-konsol-wajib">
        <div className="js-konsol-utama">
          <header className="js-konsol-kepala">
            <Merek />
            <p className="js-konsol-pengguna">{pengguna}</p>
            {tombolKeluar}
          </header>
          <main className="js-konsol-isi">
            <WilayahPemberitahuan pemberitahuan={pemberitahuan} />
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="js-konsol">
      <nav className="js-konsol-samping" aria-label={TEKS_KONSOL.menu.label}>
        <Merek />
        <DaftarMenu akun={akun} rute={rute} />
      </nav>
      <div className="js-konsol-utama">
        <header className="js-konsol-kepala">
          <button
            type="button"
            className="js-konsol-tombol js-konsol-tombol-menu"
            aria-expanded={menuTerbuka}
            aria-controls={idMenu}
            onClick={() => setMenuTerbuka((t) => !t)}
          >
            {TEKS_KONSOL.menu.tombol}
          </button>
          <h1>{rute === "masuk" ? TEKS_KONSOL.merek : JUDUL[rute]}</h1>
          <p className="js-konsol-pengguna">{pengguna}</p>
          {tombolKeluar}
        </header>
        <nav id={idMenu} className="js-konsol-menu-sempit" data-terbuka={menuTerbuka ? "ya" : "tidak"} aria-label={TEKS_KONSOL.menu.label}>
          <DaftarMenu akun={akun} rute={rute} pilih={() => setMenuTerbuka(false)} />
        </nav>
        <main className="js-konsol-isi">
          <WilayahPemberitahuan pemberitahuan={pemberitahuan} />
          {children}
        </main>
      </div>
    </div>
  );
}
