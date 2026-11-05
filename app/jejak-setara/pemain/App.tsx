// Halaman pemain Jejak Setara ("/"). JS-01: halaman kosong.
import HalamanKerangka from "../bersama/HalamanKerangka";
import { TEKS } from "../teks";

export default function App() {
  return <HalamanKerangka judul={TEKS.judul} isi={TEKS.pemainIsi} />;
}
