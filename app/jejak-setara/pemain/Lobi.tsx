// Layar lobi pemain (spesifikasi JS-03, P-52). Berjalan di halaman lobi dibuat di JS-07.
import { isiTeks, TEKS } from "../teks";
import { IKON_AVATAR } from "./avatar";
import { Panel } from "./Gabung";

export default function Lobi({ kode, nama, avatar, jumlah }: { kode: string; nama: string; avatar: number; jumlah: number }) {
  return (
    <Panel judul={TEKS.lobi.judul}>
      <p className="js-label">{TEKS.lobi.labelKode}</p>
      <p className="js-kode-besar">{kode}</p>
      <p className="js-diri">
        {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
        <img src={IKON_AVATAR[avatar] ?? IKON_AVATAR[0]} alt="" width={48} height={48} />
        <span>{nama}</span>
      </p>
      <p className="js-isi">{isiTeks(TEKS.lobi.jumlah, { n: jumlah })}</p>
      <p className="js-isi">{TEKS.lobi.menunggu}</p>
      <p className="js-petunjuk">{TEKS.lobi.saran}</p>
    </Panel>
  );
}
