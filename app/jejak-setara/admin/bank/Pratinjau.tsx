// Pratinjau "seperti di HP" (spesifikasi JS-12, P-11): bingkai berisi layar pemain dalam mode pratinjau, tegak 360 × 640
// atau mendatar 731 × 411. Isi dikirim lewat `postMessage` ke asal yang sama; konsol tidak memuat kode layar pemain.
import { useEffect, useRef, useState } from "react";
import type { IsiKejadian } from "../../inti/tipe";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";

const t = TEKS_KONSOL.pratinjau;
const UKURAN = { tegak: { lebar: 360, tinggi: 640 }, mendatar: { lebar: 731, tinggi: 411 } } as const;

/** Isi yang bisa digambar: judul, pertanyaan, dan semua teks pilihan terisi. */
export function bisaDigambar(isi: IsiKejadian): boolean {
  return Boolean(isi.judul.trim() && isi.langkah1.pertanyaan.trim() && isi.langkah1.opsi.every((o) => o.teks.trim()) && isi.langkah2.opsi.every((o) => o.teks.trim()));
}

export default function Pratinjau({ isi, rujukan, versi }: { isi: IsiKejadian; rujukan: string[]; versi: number | null }) {
  const bingkai = useRef<HTMLIFrameElement>(null);
  const [siap, setSiap] = useState(false);
  const [arah, setArah] = useState<"tegak" | "mendatar">("tegak");
  useEffect(() => {
    const dengar = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== bingkai.current?.contentWindow) return;
      if ((e.data as { jenis?: unknown } | null)?.jenis === "jejak-pratinjau-siap") setSiap(true);
    };
    window.addEventListener("message", dengar);
    return () => window.removeEventListener("message", dengar);
  }, []);
  const gambar = bisaDigambar(isi);
  useEffect(() => {
    if (!siap || !gambar) return;
    const jeda = window.setTimeout(() => {
      // Di HP, dialog kejadian selalu berbentuk lembar; layar tegak di ronde meminta HP diputar (JS-02), jadi tampilan
      // tegak di sini hanya untuk memeriksa panjang teks pada lebar sempit (Catatan Build JS-12).
      bingkai.current?.contentWindow?.postMessage({ jenis: "jejak-pratinjau", isi, rujukan, bentuk: "lembar" }, window.location.origin);
    }, 300);
    return () => window.clearTimeout(jeda);
  }, [siap, gambar, isi, rujukan, arah]);
  const u = UKURAN[arah];
  return (
    <section className="js-pratinjau-panel" aria-label={t.judul}>
      <div className="js-pratinjau-kepala">
        <h2>{t.judul}</h2>
        {versi !== null ? <span className="js-konsol-tanda">{isiTeks(t.versi, { nomor: versi })}</span> : null}
        <div className="js-pratinjau-tombol" role="group" aria-label={t.judul}>
          <button type="button" className="js-konsol-tombol" aria-pressed={arah === "tegak"} onClick={() => setArah("tegak")}>
            {t.tegak}
          </button>
          <button type="button" className="js-konsol-tombol" aria-pressed={arah === "mendatar"} onClick={() => setArah("mendatar")}>
            {t.mendatar}
          </button>
          <button type="button" className="js-konsol-tombol" onClick={() => bingkai.current?.contentWindow?.postMessage({ jenis: "jejak-pratinjau-ulang" }, window.location.origin)}>
            {t.ulang}
          </button>
        </div>
      </div>
      <div className="js-pratinjau-wadah" style={{ width: u.lebar, height: u.tinggi }}>
        <iframe ref={bingkai} src="/?pratinjau=1" title={t.judul} width={u.lebar} height={u.tinggi} className="js-pratinjau-bingkai" />
        {!gambar ? <p className="js-pratinjau-tutup">{t.belumLengkap}</p> : null}
      </div>
    </section>
  );
}
