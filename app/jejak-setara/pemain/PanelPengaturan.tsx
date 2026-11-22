// Menu, Pengaturan, Privasi, dan Tentang di layar pemain (spesifikasi JS-14, P-4 sampai P-19; JFR-55, JFR-56).
import { forwardRef, useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { IKON } from "../assets/manifest";
import { TEKS } from "../teks";
import type { PengaturanPemain } from "./pengaturan";

const T = TEKS.pengaturan;

export function TombolMenu({ saatTekan, laptop }: { saatTekan: () => void; laptop: boolean }) {
  return (
    <button type="button" className="js-hud-tombol js-hud-menu" aria-label={TEKS.menu.label} aria-keyshortcuts={laptop ? "Escape" : undefined} onClick={saatTekan}>
      {TEKS.menu.tombol}
      {laptop ? <kbd>Esc</kbd> : null}
    </button>
  );
}

export function TombolSuara({ nyala, saatTekan, laptop }: { nyala: boolean; saatTekan: () => void; laptop: boolean }) {
  const ikon = nyala ? IKON.ikon_suara_nyala : IKON.ikon_suara_mati;
  return (
    <button
      type="button"
      className="js-hud-tombol js-hud-suara"
      aria-pressed={nyala}
      aria-label={nyala ? TEKS.suara.labelNyala : TEKS.suara.labelMati}
      aria-keyshortcuts={laptop ? "M" : undefined}
      onClick={(e) => {
        if (e.detail <= 1) saatTekan();
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
      <img src={ikon.url} alt="" width={32} height={32} />
      {laptop ? <kbd>M</kbd> : null}
    </button>
  );
}

/** P-4: kelompok tombol Menu dan suara; letaknya diatur pemanggil lewat `kelas`. */
export const KelompokMenuSuara = forwardRef<HTMLDivElement, { kelas: string; laptop: boolean; suara: boolean; saatMenu: () => void; saatSuara: () => void }>(
  function KelompokMenuSuara({ kelas, laptop, suara, saatMenu, saatSuara }, ref) {
    return (
      <div ref={ref} className={kelas}>
        <TombolMenu laptop={laptop} saatTekan={saatMenu} />
        <TombolSuara laptop={laptop} nyala={suara} saatTekan={saatSuara} />
      </div>
    );
  },
);

const DAPAT_FOKUS = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** P-9 sampai P-11: lembar dialog dengan judul, jebakan Tab, Esc, dan fokus kembali ke pembukanya. */
function Lembar({ id, judul, fokusJudul, tutup, children, kaki }: { id: string; judul: string; fokusJudul: boolean; tutup: () => void; children: ReactNode; kaki?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // Fokus kembali ke pembuka diatur pemanggil saat panel terakhir ditutup (P-10).
  useEffect(() => {
    const awal = fokusJudul ? ref.current?.querySelector<HTMLElement>("h2") : ref.current?.querySelector<HTMLElement>('[aria-checked="true"]');
    (awal ?? ref.current)?.focus();
  }, [fokusJudul]);
  const tombol = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      tutup();
      return;
    }
    if (e.key !== "Tab") return;
    const semua = [...(ref.current?.querySelectorAll<HTMLElement>(DAPAT_FOKUS) ?? [])];
    if (semua.length === 0) return;
    const i = semua.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      semua[semua.length - 1].focus();
    } else if (!e.shiftKey && i === semua.length - 1) {
      e.preventDefault();
      semua[0].focus();
    }
  };
  return (
    <div className="js-atur-latar">
      <div ref={ref} className="js-bingkai js-atur" role="dialog" aria-modal="true" aria-labelledby={id} onKeyDown={tombol}>
        <h2 id={id} tabIndex={-1}>
          {judul}
        </h2>
        <div className="js-atur-isi">{children}</div>
        <div className="js-atur-kaki">
          {kaki}
          <button type="button" className="js-tombol js-tombol-utama" onClick={tutup}>
            {T.tutup}
          </button>
        </div>
      </div>
    </div>
  );
}

function PilihanDua<N extends string | boolean>({
  id,
  judul,
  ket,
  nilai,
  opsi,
  ubah,
}: {
  id: string;
  judul: string;
  ket?: string;
  nilai: N;
  opsi: readonly (readonly [N, string])[];
  ubah: (v: N) => void;
}) {
  const pindah = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const j = (i + (e.key === "ArrowLeft" || e.key === "ArrowUp" ? opsi.length - 1 : 1)) % opsi.length;
    ubah(opsi[j][0]);
    (e.currentTarget.parentElement?.children[j] as HTMLElement | undefined)?.focus();
  };
  return (
    <div className="js-atur-baris">
      <p className="js-label" id={id}>
        {judul}
      </p>
      <div className="js-atur-opsi" role="radiogroup" aria-labelledby={id}>
        {opsi.map(([v, teks], i) => (
          <button
            key={String(v)}
            type="button"
            role="radio"
            className="js-pilihan"
            aria-checked={v === nilai}
            tabIndex={v === nilai ? 0 : -1}
            onClick={() => ubah(v)}
            onKeyDown={(e) => pindah(e, i)}
          >
            {teks}
          </button>
        ))}
      </div>
      {ket ? <p className="js-petunjuk">{ket}</p> : null}
    </div>
  );
}

export type JenisLembar = "pengaturan" | "privasi" | "tentang";

/** P-9: empat pengaturan, lalu Privasi, Tentang, dan Tutup. */
export function PanelPengaturan({
  p,
  ubah,
  gerakPerangkat,
  saatSuara,
  tutup,
  buka,
}: {
  p: PengaturanPemain;
  ubah: (u: Partial<PengaturanPemain>) => void;
  gerakPerangkat: boolean;
  saatSuara: (nyala: boolean) => void;
  tutup: () => void;
  buka: (j: Exclude<JenisLembar, "pengaturan">) => void;
}) {
  const matiNyala = [
    [false, T.mati],
    [true, T.nyala],
  ] as const;
  return (
    <Lembar
      id="js-atur-judul"
      judul={T.judul}
      fokusJudul={false}
      tutup={tutup}
      kaki={
        <>
          <button type="button" className="js-tombol" onClick={() => buka("privasi")}>
            {T.privasi}
          </button>
          <button type="button" className="js-tombol" onClick={() => buka("tentang")}>
            {T.tentang}
          </button>
        </>
      }
    >
      <div className="js-atur-kisi">
        <PilihanDua id="js-atur-suara" judul={T.suara} nilai={p.suara} opsi={matiNyala} ubah={(v) => saatSuara(v)} />
        <PilihanDua
          id="js-atur-gerak"
          judul={T.gerak}
          nilai={p.kurangiGerak ?? gerakPerangkat}
          opsi={matiNyala}
          ubah={(v) => ubah({ kurangiGerak: v })}
          ket={p.kurangiGerak === null ? T.gerakIkut : undefined}
        />
        <PilihanDua id="js-atur-ketik" judul={T.ketik} ket={T.ketikKet} nilai={p.ketik} opsi={matiNyala} ubah={(v) => ubah({ ketik: v })} />
        <PilihanDua
          id="js-atur-label"
          judul={T.label}
          nilai={p.label}
          opsi={[
            ["biasa", T.biasa],
            ["besar", T.besar],
          ]}
          ubah={(v) => ubah({ label: v })}
        />
      </div>
    </Lembar>
  );
}

const P = TEKS.privasi;
const BUTIR_PRIVASI = [
  [P.disimpanJudul, P.disimpan],
  [P.untukJudul, P.untuk],
  [P.melihatJudul, P.melihat],
  [P.lamaJudul, P.lama],
  [P.tidakJudul, P.tidak],
  [P.perangkatJudul, P.perangkat],
] as const;

/** P-11 dan P-16: enam butir privasi; fokus awal di judul. */
export function PanelPrivasi({ tutup }: { tutup: () => void }) {
  return (
    <Lembar id="js-privasi-judul" judul={P.judul} fokusJudul tutup={tutup}>
      <dl className="js-privasi">
        {BUTIR_PRIVASI.map(([judul, isi]) => (
          <div key={judul}>
            <dt>{judul}</dt>
            <dd>{isi}</dd>
          </div>
        ))}
      </dl>
    </Lembar>
  );
}

/** P-12: isi Tentang dengan tiga kalimat kredit Design System 15. */
export function PanelTentang({ tutup }: { tutup: () => void }) {
  const t = TEKS.tentang;
  return (
    <Lembar id="js-tentang-judul" judul={t.judul} fokusJudul tutup={tutup}>
      <p className="js-isi">{t.isi}</p>
      <ul className="js-kredit">
        <li>{t.kreditAset}</li>
        <li>{t.kreditSuara}</li>
        <li>{t.kreditHuruf}</li>
      </ul>
    </Lembar>
  );
}

/** P-15: kalimat privasi singkat dan tombol Privasi di layar Kode. */
export function PemberitahuanSingkat({ saatBuka }: { saatBuka: () => void }) {
  return (
    <div className="js-privasi-singkat">
      <p>{P.singkat}</p>
      <button type="button" className="js-tombol js-tombol-privasi" onClick={saatBuka}>
        {P.tombol}
      </button>
    </div>
  );
}
