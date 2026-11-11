// Kartu dampak (spesifikasi JS-08, P-46; Design System 3.5 dan 10): kepala berwarna tingkat dengan ikon emosi, tulisan
// tingkat, dan poin; lalu "Yang terjadi", "Hak yang terdampak", "Kewajiban terkait", "Pilihan yang tepat" (bila tingkat
// bukan tepat, D-3), dan "Rujukan" (dengan catatan ruang uji, D-4). Mode penuh dua kolom, mode ringkas satu kolom.
import type { Tingkat } from "../inti/tipe";
import { isiTeks, TEKS } from "../teks";

export interface PropsKartuDampak {
  tingkat: Tingkat;
  poin: number;
  terjadi: string;
  hak: string;
  kewajiban: string;
  rujukan: readonly string[];
  pilihanTepat: readonly string[];
  ruangUji: boolean;
  ringkas: boolean;
  ikonEmosi: Readonly<Record<Tingkat, string>>;
}

export default function KartuDampak(p: PropsKartuDampak) {
  return (
    <article className="js-kartu" data-tingkat={p.tingkat} data-kolom={p.ringkas ? "1" : "2"}>
      <header className="js-kartu-kepala">
        {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
        <img className="js-ikon-emosi" src={p.ikonEmosi[p.tingkat]} alt="" width={16} height={16} />
        <span className="js-kartu-tingkat">{TEKS.kartu.tingkat[p.tingkat]}</span>
        {p.poin > 0 ? <span className="js-kartu-poin">{isiTeks(TEKS.dialog.poin, { poin: p.poin })}</span> : null}
      </header>
      <div className="js-kartu-isi">
        <div className="js-kartu-kiri">
          <section>
            <h3>{TEKS.kartu.terjadi}</h3>
            <p>{p.terjadi}</p>
          </section>
          <section>
            <h3>{TEKS.kartu.hak}</h3>
            <p>{p.hak}</p>
          </section>
          <section>
            <h3>{TEKS.kartu.kewajiban}</h3>
            <p>{p.kewajiban}</p>
          </section>
          {p.pilihanTepat.length > 0 ? (
            <section>
              <h3>{TEKS.kartu.pilihanTepat}</h3>
              {p.pilihanTepat.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </section>
          ) : null}
        </div>
        <div className="js-kartu-kanan">
          <section>
            <h3>{TEKS.kartu.rujukan}</h3>
            <ul>
              {p.rujukan.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {p.ruangUji ? <p className="js-catatan-uji">{TEKS.kartu.rujukanUji}</p> : null}
          </section>
        </div>
      </div>
    </article>
  );
}
