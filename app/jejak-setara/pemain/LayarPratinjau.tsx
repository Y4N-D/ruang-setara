// Layar pratinjau untuk bingkai penyunting konsol (spesifikasi JS-12, P-12): dialog kejadian dan kartu dampak yang
// sungguhan dari isi yang dikirim konsol lewat `postMessage` asal yang sama. Tidak menyambung ke ruang.
// JS-09 (P-44): tombol Petunjuk dengan muatan tiruan 2; "Ulang" dan isi baru mengembalikan muatan dan dialog ke awal.
import { useEffect, useState } from "react";
import DialogKejadian, { type AksiDialog } from "../bersama/DialogKejadian";
import {
  aturPetunjuk,
  bukaDialog,
  kunci,
  modeRingkas,
  pilih,
  pilihNomor,
  pindah,
  tekanPetunjuk,
  terimaHasil1,
  terimaHasil2,
  terimaPetunjuk,
  type KeadaanDialog,
} from "../bersama/dialogKeadaan";
import { TEKS } from "../teks";
import { bacaPesanPratinjau, hasilLangkah1, hasilLangkah2, MUATAN_PETUNJUK_PRATINJAU, pesanTerbuka, petunjukPratinjau, type IsiPratinjau } from "./pratinjau";

const buka = (p: IsiPratinjau): KeadaanDialog =>
  bukaDialog(pesanTerbuka(p.isi), Number(p.isi.zona.slice(1)) || 1, modeRingkas(innerHeight), Date.now(), MUATAN_PETUNJUK_PRATINJAU);

export default function LayarPratinjau() {
  const [k, setK] = useState<{ p: IsiPratinjau; d: KeadaanDialog } | null>(null);
  useEffect(() => {
    const dengar = (e: MessageEvent) => {
      const m = e.origin === location.origin ? bacaPesanPratinjau(e.data) : null;
      if (m) setK((lama) => (m.jenis === "isi" ? { p: m, d: buka(m) } : lama && { p: lama.p, d: buka(lama.p) }));
    };
    addEventListener("message", dengar);
    parent.postMessage({ jenis: "jejak-pratinjau-siap" }, location.origin);
    return () => removeEventListener("message", dengar);
  }, []);
  const aksi = (a: AksiDialog) => {
    if (!k) return;
    const { p, d } = k;
    const kini = Date.now();
    let baru: KeadaanDialog;
    if (a.jenis === "tutup" || a.jenis === "jelajah") baru = buka(p);
    else if (a.jenis === "pilih") baru = pilih(d, a.id, kini);
    else if (a.jenis === "nomor") baru = pilihNomor(d, a.n, kini);
    else if (a.jenis === "petunjuk") {
      const h = tekanPetunjuk(d, kini);
      if (!h) return;
      baru = aturPetunjuk(terimaPetunjuk(h, petunjukPratinjau(p.isi)), { muatan: MUATAN_PETUNJUK_PRATINJAU - 1 });
    }
    else if (a.jenis === "kunci") {
      const h = kunci(d, kini);
      if (!h.pesan) return;
      baru = h.pesan.t === "kunci_1" ? terimaHasil1(h.d, hasilLangkah1(p.isi, h.pesan.opsiId), kini) : terimaHasil2(h.d, hasilLangkah2(p.isi, p.rujukan, h.pesan.opsiId), kini);
    } else baru = pindah(d, a.jenis, kini);
    setK({ p, d: baru });
  };
  return (
    <div className="js-pratinjau">
      <p className="js-pratinjau-pita">{TEKS.pratinjau.pita}</p>
      {k ? (
        <div className="js-dialog-wadah" data-bentuk={k.p.bentuk} data-ringkas={k.d.ringkas ? "ya" : "tidak"} style={{ top: 24 }}>
          <DialogKejadian d={k.d} bentuk={k.p.bentuk} ruangUji={false} saatAksi={aksi} />
        </div>
      ) : (
        <p className="js-isi">{TEKS.pratinjau.menunggu}</p>
      )}
    </div>
  );
}
