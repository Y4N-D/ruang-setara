// Dialog konsol (spesifikasi JS-04, P-44 sampai P-47, P-50): role="dialog", aria-modal="true", dan judulnya. Dialog
// dipasang langsung di bawah body, dan isi halaman di #root dibuat `inert` selama dialog terbuka, sehingga fokus
// terkurung di dialog. Tab dan Shift+Tab berputar di dalamnya. Esc menutup dialog bila `tutup` diberikan (dialog
// sandi sementara tidak memberikannya). Sesudah ditutup, fokus kembali ke `kembaliKe` (tombol pembukanya).
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

const BISA_FOKUS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface PropsDialog {
  judul: string;
  /** Null: Esc tidak menutup dialog (dialog sandi sementara, P-45). */
  tutup: (() => void) | null;
  kembaliKe: HTMLElement | null;
  children: ReactNode;
}

export default function Dialog({ judul, tutup, kembaliKe, children }: PropsDialog) {
  const kotak = useRef<HTMLDivElement>(null);
  const idJudul = useId();

  useEffect(() => {
    const akar = document.getElementById("root");
    akar?.setAttribute("inert", "");
    const el = kotak.current;
    const awal = el?.querySelector<HTMLElement>("[data-fokus-awal]") ?? el?.querySelector<HTMLElement>(BISA_FOKUS) ?? el;
    awal?.focus();
    return () => {
      akar?.removeAttribute("inert");
      if (kembaliKe?.isConnected) kembaliKe.focus();
    };
  }, [kembaliKe]);

  function tekan(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (tutup) tutup();
      return;
    }
    if (e.key !== "Tab" || !kotak.current) return;
    const daftar = Array.from(kotak.current.querySelectorAll<HTMLElement>(BISA_FOKUS)).filter((el) => el.getClientRects().length > 0);
    if (daftar.length === 0) {
      e.preventDefault();
      return;
    }
    const pertama = daftar[0];
    const terakhir = daftar[daftar.length - 1];
    const aktif = document.activeElement;
    if (e.shiftKey && (aktif === pertama || aktif === kotak.current)) {
      e.preventDefault();
      terakhir.focus();
    } else if (!e.shiftKey && aktif === terakhir) {
      e.preventDefault();
      pertama.focus();
    }
  }

  return createPortal(
    <div className="js-konsol-ruang js-konsol-tirai">
      <div ref={kotak} className="js-bingkai js-konsol-dialog" role="dialog" aria-modal="true" aria-labelledby={idJudul} tabIndex={-1} onKeyDown={tekan}>
        <h2 id={idJudul}>{judul}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
