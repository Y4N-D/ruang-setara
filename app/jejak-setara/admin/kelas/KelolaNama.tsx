// Kelola nama dari layar kelas (spesifikasi JS-14, P-53 sampai P-56): nama sebagai tombol, menu Ganti nama, Keluarkan,
// dan Batal, serta panel Pemain tanpa skor dan peringkat. Proyektor tidak pernah menampilkan nama lama lagi.
import { useEffect, useRef, type KeyboardEvent } from "react";
import type { PesanServerKelas } from "../../inti/protokol-kelas";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import Dialog from "../Dialog";
import { AVATAR } from "./ikon-kelas";

type PemainLobi = Extract<PesanServerKelas, { t: "lobi" }>["pemain"][number];
const t = TEKS_KONSOL.kelas;

/** Tombol nama untuk pemain itu; yang di panel Pemain didahulukan, karena halaman di belakang panel tidak aktif. */
export function cariTombolNama(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[role="dialog"] [data-kelola="${id}"]`) ?? document.querySelector<HTMLElement>(`[data-kelola="${id}"]`);
}

export interface AksiKelola {
  terbuka: string | null;
  buka: (id: string | null) => void;
  gantiNama: (id: string) => void;
  keluarkan: (id: string, pembuka: HTMLElement | null) => void;
}

function MenuNama({ kelola, id }: { kelola: AksiKelola; id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("button")?.focus();
  }, []);
  const tutup = () => {
    kelola.buka(null);
    cariTombolNama(id)?.focus();
  };
  const tombol = (e: KeyboardEvent<HTMLDivElement>) => {
    const semua = [...(ref.current?.querySelectorAll<HTMLElement>("button") ?? [])];
    const i = semua.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      tutup();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      semua[(i + (e.key === "ArrowDown" ? 1 : semua.length - 1)) % semua.length]?.focus();
    }
  };
  return (
    <div ref={ref} className="js-kelas-menu" role="menu" onKeyDown={tombol}>
      <button type="button" role="menuitem" onClick={() => kelola.gantiNama(id)}>
        {t.menuGantiNama}
      </button>
      <button type="button" role="menuitem" className="js-kelas-bahaya" onClick={(e) => kelola.keluarkan(id, e.currentTarget)}>
        {t.menuKeluarkan}
      </button>
      <button type="button" role="menuitem" onClick={tutup}>
        {t.menuBatal}
      </button>
    </div>
  );
}

/** P-53: satu pemain sebagai tombol kelola, dengan menu di bawahnya. */
export function ButirNama({ p, kelola }: { p: PemainLobi; kelola: AksiKelola }) {
  const terbuka = kelola.terbuka === p.id;
  return (
    <li data-terhubung={p.terhubung ? "ya" : "tidak"}>
      <button
        type="button"
        className="js-kelas-nama-tombol"
        data-kelola={p.id}
        aria-haspopup="menu"
        aria-expanded={terbuka}
        aria-label={isiTeks(t.kelolaNama, { nama: p.nama }) + (p.terhubung ? "" : `, ${t.terputusLabel}`)}
        onClick={() => kelola.buka(terbuka ? null : p.id)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
        <img src={AVATAR[p.avatar] ?? AVATAR[0]} alt="" />
        <span className="js-kelas-nama" data-panjang={p.nama.length > 16 ? "ya" : "tidak"}>
          {p.nama}
        </span>
      </button>
      {terbuka ? <MenuNama kelola={kelola} id={p.id} /> : null}
    </li>
  );
}

/** P-55: panel Pemain berisi semua pemain, urut bergabung, tanpa skor dan peringkat. */
export function PanelPemain({ pemain, kelola, tutup, pembuka }: { pemain: readonly PemainLobi[]; kelola: AksiKelola; tutup: () => void; pembuka: HTMLElement | null }) {
  return (
    <Dialog judul={isiTeks(t.pemainJudul, { n: pemain.length })} tutup={kelola.terbuka ? null : tutup} kembaliKe={pembuka}>
      <div className="js-kelas-panel-pemain">
        {pemain.length === 0 ? (
          <p>{t.pemainKosong}</p>
        ) : (
          <ul>
            {pemain.map((p) => (
              <ButirNama key={p.id} p={p} kelola={kelola} />
            ))}
          </ul>
        )}
      </div>
      <div className="js-konsol-tombol-baris">
        <button type="button" className="js-konsol-tombol" data-fokus-awal onClick={tutup}>
          {t.pemainTutup}
        </button>
      </div>
    </Dialog>
  );
}

/** P-55: tombol Pemain di baris kontrol. */
export function TombolPemain({ buka }: { buka: (pembuka: HTMLElement) => void }) {
  return (
    <button type="button" className="js-kelas-tombol" aria-keyshortcuts="P" onClick={(e) => buka(e.currentTarget)}>
      {t.tombolPemain} <kbd>P</kbd>
    </button>
  );
}
