// Tombol Periksa di perangkat sentuh dan ajakan "E Periksa" tanpa layar sentuh (spesifikasi JS-08, P-21 sampai P-24;
// Design System 3.3, 3.4, dan 10). Tombol bulat 64 px di kanan bawah dunia, dengan ruang kosong di atasnya untuk
// tombol skill JS-09.
import { TEKS } from "../teks";

export function TombolPeriksa({ dekat, ditekan, saatTekan }: { dekat: boolean; ditekan: boolean; saatTekan: () => void }) {
  return (
    <button
      type="button"
      className="js-tombol-periksa"
      data-dekat={dekat ? "ya" : undefined}
      data-ditekan={ditekan ? "ya" : undefined}
      aria-disabled={dekat ? undefined : true}
      aria-label={dekat ? TEKS.kejadian.periksaLabel : TEKS.kejadian.periksaJauh}
      onClick={() => {
        if (dekat && !ditekan) saatTekan();
      }}
    >
      <span aria-hidden="true">{TEKS.kejadian.periksa}</span>
    </button>
  );
}

export function AjakanPeriksa() {
  return (
    <p className="js-ajakan-e" aria-hidden="true">
      <kbd>E</kbd>
      <span>{TEKS.kejadian.periksa}</span>
    </p>
  );
}
