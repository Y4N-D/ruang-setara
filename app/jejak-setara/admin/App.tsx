// Konsol admin Jejak Setara ("/admin/"). JS-01: halaman kosong.
import HalamanKerangka from "../bersama/HalamanKerangka";
import { TEKS } from "../teks";

export default function App() {
  return <HalamanKerangka atas={TEKS.judul} judul={TEKS.konsolJudul} isi={TEKS.konsolIsi} />;
}
