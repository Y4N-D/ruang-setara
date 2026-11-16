// Riwayat versi terbit (spesifikasi JS-12, P-16): nomor, tanggal, penerbit, catatan, dan tombol "Lihat".
import type { DetailKejadian } from "../../inti/bank";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";

const t = TEKS_KONSOL.riwayat;
const FORMAT = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" });

export default function Riwayat({ riwayat, lihat, dilihat }: { riwayat: DetailKejadian["riwayat"]; lihat: (nomor: number) => void; dilihat: number | null }) {
  return (
    <fieldset className="js-sunting-bagian">
      <legend>{TEKS_KONSOL.sunting.bagianRiwayat}</legend>
      {riwayat.length === 0 ? (
        <p>{t.kosong}</p>
      ) : (
        <ul className="js-riwayat">
          {riwayat.map((v) => (
            <li key={v.nomor}>
              <span>{isiTeks(t.baris, { nomor: v.nomor, tanggal: FORMAT.format(v.dibuatPada), nama: v.penerbit ?? "—" })}</span>
              {v.catatan ? <span className="js-konsol-petunjuk">{v.catatan}</span> : null}
              <button type="button" className="js-konsol-tombol" aria-pressed={dilihat === v.nomor} onClick={() => lihat(v.nomor)}>
                {t.lihat}
              </button>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}
