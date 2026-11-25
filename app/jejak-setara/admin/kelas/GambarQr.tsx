// Gambar kode QR di lobi layar kelas (spesifikasi JS-16b, P-6 sampai P-10): SVG dengan modul ink di atas putih dan zona
// tenang 4 modul. Warnanya tetap sama di mode gelap agar mudah dipindai dari proyektor. Dibuat di peramban, tanpa jaringan.
import { useMemo } from "react";
import { buatQR, jalurSvg } from "./qr";

const WARNA_MODUL = "#1F2A44"; // ink
const WARNA_LATAR = "#FFFFFF";

/** P-7: alamat gabung `{tautan}/?kode={kode}`, atau null bila tautan belum ada atau tidak sah. */
export function alamatGabung(tautan: string, kode: string): string | null {
  if (!tautan) return null;
  try {
    return new URL(`/?kode=${encodeURIComponent(kode)}`, tautan).href;
  } catch {
    return null;
  }
}

export default function GambarQr({ teks, label }: { teks: string; label: string }) {
  const jalur = useMemo(() => {
    try {
      return jalurSvg(buatQR(teks));
    } catch {
      return null;
    }
  }, [teks]);
  if (!jalur) return null;
  return (
    <svg className="js-kelas-qr-gambar" viewBox={`0 0 ${jalur.sisi} ${jalur.sisi}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={jalur.sisi} height={jalur.sisi} fill={WARNA_LATAR} />
      <path d={jalur.d} fill={WARNA_MODUL} />
    </svg>
  );
}
