// Dialog kejadian dua langkah (spesifikasi JS-08, P-38 sampai P-50; Design System 3.5, 10, 11, dan 13). Komponen ini
// hanya menampilkan keadaan dari dialogKeadaan.ts dan meneruskan aksi pemain lewat `saatAksi`; aturan pilihan,
// penguncian, dan masa tunggu ada di modul murni itu. Dipakai layar pemain dan, di JS-12, pratinjau konsol.
import { useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { IKON } from "../assets/manifest";
import type { Tingkat } from "../inti/tipe";
import { isiTeks, TEKS } from "../teks";
import BingkaiPiksel from "./BingkaiPiksel";
import {
  fokusAwal,
  langkahChip,
  langkahPilihan,
  opsiLangkah,
  opsiUmpanBalik,
  teksPilihanTepat,
  tombolKaki,
  type AksiKaki,
  type KeadaanDialog,
} from "./dialogKeadaan";
import KartuDampak from "./KartuDampak";
import TombolPilihan, { PilihanTerkunci } from "./TombolPilihan";

export type AksiDialog = { jenis: "pilih"; id: string } | { jenis: "nomor"; n: number } | { jenis: AksiKaki };

const HURUF = ["A", "B", "C", "D"] as const;
const LABEL_KAKI: Readonly<Record<AksiKaki, string>> = {
  tutup: TEKS.dialog.tutup,
  kunci: TEKS.dialog.kunci,
  lihat: TEKS.dialog.lihatPilihan,
  situasi: TEKS.dialog.situasi,
  lanjut2: TEKS.dialog.lanjutLangkah2,
  jelajah: TEKS.dialog.lanjutMenjelajah,
};
const EMOSI_KARTU: Readonly<Record<Tingkat, string>> = {
  tepat: IKON.ikon_emosi_hati.url,
  kurang: IKON.ikon_emosi_keringat.url,
  berisiko: IKON.ikon_emosi_seru.url,
};

export interface PropsDialogKejadian {
  d: KeadaanDialog;
  /** Lembar menutupi area dialog (perangkat sentuh dengan tinggi ≤ 500 px), atau panel 70% (P-39). */
  bentuk: "lembar" | "panel";
  ruangUji: boolean;
  saatAksi: (a: AksiDialog) => void;
}

export default function DialogKejadian({ d, bentuk, ruangUji, saatAksi }: PropsDialogKejadian) {
  const kotak = useRef<HTMLElement | null>(null);
  const langkah = langkahPilihan(d);
  const opsi = langkah ? opsiLangkah(d, langkah) : [];
  const terpilih = langkah === 1 ? d.pilihan1 : langkah === 2 ? d.pilihan2 : null;
  const tanpaHasil1 = d.hasil1 === null;

  // Fokus awal setiap tampilan baru (P-49): pilihan pertama (atau yang terpilih), atau tombol utama.
  useLayoutEffect(() => {
    const k = kotak.current;
    if (!k) return;
    const sasaran = fokusAwal(d);
    const el =
      sasaran === "pilihan"
        ? (k.querySelector<HTMLElement>('[data-pilihan="ya"][aria-pressed="true"]') ?? k.querySelector<HTMLElement>('[data-pilihan="ya"]'))
        : k.querySelector<HTMLElement>(`[data-aksi="${sasaran}"]`);
    (el ?? k).focus();
    // Hanya saat tampilan berganti atau Langkah 2 siap, bukan setiap pilihan berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.kejadianId, d.tampilan, tanpaHasil1]);

  const daftarFokus = () => [...(kotak.current?.querySelectorAll<HTMLElement>("button") ?? [])];
  const fokusPilihan = (i: number) => kotak.current?.querySelectorAll<HTMLElement>('[data-pilihan="ya"]')[i]?.focus();

  // Papan ketik (P-49): angka memilih, panah memindah fokus di antara pilihan, Esc menutup, fokus dikurung.
  const tekan = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      saatAksi({ jenis: "tutup" });
      return;
    }
    if (e.key === "Tab") {
      const semua = daftarFokus();
      if (semua.length === 0) return;
      const i = semua.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        semua[semua.length - 1].focus();
      } else if (!e.shiftKey && i === semua.length - 1) {
        e.preventDefault();
        semua[0].focus();
      }
      return;
    }
    const n = Number(e.key);
    if (langkah && Number.isInteger(n) && n >= 1 && n <= opsi.length) {
      e.preventDefault();
      saatAksi({ jenis: "nomor", n });
      fokusPilihan(n - 1);
      return;
    }
    const pilihanAktif = (document.activeElement as HTMLElement | null)?.dataset.pilihan === "ya";
    if (langkah && pilihanAktif && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      const semua = [...(kotak.current?.querySelectorAll<HTMLElement>('[data-pilihan="ya"]') ?? [])];
      const i = semua.indexOf(document.activeElement as HTMLElement);
      const maju = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
      semua[(i + maju + semua.length) % semua.length]?.focus();
    }
  };

  /** Enter pada pilihan: mengunci bila sudah ada pilihan, selain itu memilihnya (P-43, P-49). */
  const enterPilihan = (id: string) => (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    e.stopPropagation();
    saatAksi(terpilih ? { jenis: "kunci" } : { jenis: "pilih", id });
  };

  const situasi = <p className="js-situasi">{d.situasi}</p>;
  const pertanyaan = (teks: string | undefined) => (teks ? <p className="js-pertanyaan">{teks}</p> : null);
  const pilihan = (l: 1 | 2) => (
    <div className={l === 1 ? "js-kisi-opsi" : "js-susun-opsi"} role="group" aria-label={l === 1 ? d.pertanyaan1 : d.hasil1?.pertanyaan2}>
      {opsi.map((o, i) => (
        <TombolPilihan
          key={o.id}
          huruf={HURUF[i]}
          teks={o.teks}
          terpilih={o.id === terpilih}
          nonaktif={d.mengunci}
          saatPilih={() => saatAksi({ jenis: "pilih", id: o.id })}
          saatTombol={enterPilihan(o.id)}
        />
      ))}
    </div>
  );
  const h1 = d.hasil1;
  const pita = h1 ? (
    <div className="js-pita-umpan" data-benar={h1.benar ? "ya" : "tidak"}>
      <p className="js-pita-kepala">
        {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
        <img className="js-ikon-emosi" src={h1.benar ? IKON.ikon_emosi_hati.url : IKON.ikon_emosi_tanya.url} alt="" width={16} height={16} />
        <span>{h1.benar ? TEKS.dialog.tepat : TEKS.dialog.belumTepat}</span>
        {h1.benar && h1.poin > 0 ? <span className="js-pita-poin">{isiTeks(TEKS.dialog.poin, { poin: h1.poin })}</span> : null}
      </p>
      <p>{h1.umpanBalik}</p>
      {!h1.benar && h1.umpanBalikBenar ? <p>{h1.umpanBalikBenar}</p> : null}
    </div>
  ) : null;
  const terkunci = opsiUmpanBalik(d).map((o) => (
    <PilihanTerkunci key={o.id} huruf={HURUF[d.opsi1.findIndex((x) => x.id === o.id)] ?? "A"} teks={o.teks} label={o.label} />
  ));

  let isi;
  switch (d.tampilan) {
    case "langkah1":
      isi = (
        <>
          {situasi}
          {pertanyaan(d.pertanyaan1)}
          {pilihan(1)}
        </>
      );
      break;
    case "situasi1":
      isi = (
        <>
          {situasi}
          {pertanyaan(d.pertanyaan1)}
        </>
      );
      break;
    case "pilihan1":
      isi = (
        <>
          {pertanyaan(d.pertanyaan1)}
          {pilihan(1)}
        </>
      );
      break;
    case "umpan":
      isi = d.ringkas ? (
        <>
          {pita}
          <div className="js-susun-opsi">{terkunci}</div>
        </>
      ) : (
        <>
          <div className="js-kisi-opsi">{terkunci}</div>
          {pita}
        </>
      );
      break;
    case "langkah2":
      isi = (
        <>
          {situasi}
          {pertanyaan(d.hasil1?.pertanyaan2)}
          {d.hasil1 ? pilihan(2) : null}
        </>
      );
      break;
    case "situasi2":
      isi = (
        <>
          {situasi}
          {pertanyaan(d.hasil1?.pertanyaan2)}
        </>
      );
      break;
    case "pilihan2":
      isi = (
        <>
          {pertanyaan(d.hasil1?.pertanyaan2)}
          {d.hasil1 ? pilihan(2) : null}
        </>
      );
      break;
    case "kartu":
      isi = d.hasil2 ? (
        <KartuDampak
          tingkat={d.hasil2.tingkat}
          poin={d.hasil2.poin}
          terjadi={d.hasil2.terjadi}
          hak={d.hasil2.kartu.hak}
          kewajiban={d.hasil2.kartu.kewajiban}
          rujukan={d.hasil2.kartu.rujukan}
          pilihanTepat={teksPilihanTepat(d)}
          ruangUji={ruangUji}
          ringkas={d.ringkas}
          ikonEmosi={EMOSI_KARTU}
        />
      ) : null;
      break;
  }

  return (
    <section
      ref={kotak}
      className="js-dialog"
      data-bentuk={bentuk}
      data-tampilan={d.tampilan}
      data-ringkas={d.ringkas ? "ya" : "tidak"}
      data-mengunci={d.mengunci ? "ya" : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="js-dialog-judul"
      aria-describedby="js-dialog-chip"
      tabIndex={-1}
      onKeyDown={tekan}
    >
      <BingkaiPiksel className="js-dialog-bingkai">
        <header className="js-dialog-kepala">
          {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
          <img className="js-ikon-zona" src={IKON[`ikon_zona_${d.zona}`]?.url} alt="" width={16} height={16} />
          <h2 id="js-dialog-judul">{d.judul}</h2>
          <span id="js-dialog-chip" className="js-chip">
            {isiTeks(TEKS.dialog.langkah, { n: langkahChip(d) })}
          </span>
        </header>
        <div className="js-dialog-isi">{isi}</div>
        <footer className="js-dialog-kaki">
          {tombolKaki(d).map((b) => (
            <button
              key={b.aksi}
              type="button"
              data-aksi={b.aksi}
              className={`js-tombol js-tombol-dialog${b.utama ? " js-tombol-utama" : ""}`}
              aria-disabled={!b.aktif || d.mengunci ? true : undefined}
              onClick={() => {
                if (b.aktif && !d.mengunci) saatAksi({ jenis: b.aksi });
              }}
            >
              {LABEL_KAKI[b.aksi]}
            </button>
          ))}
        </footer>
      </BingkaiPiksel>
    </section>
  );
}
