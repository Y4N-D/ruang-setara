// Layar gabung pemain: Kode, Nomor absen, Menghubungkan, dan Identitas (spesifikasi JS-03, P-49 sampai P-53).
// JS-07: tombol "Masuk" baru aktif sesudah aset dunia termuat.
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import PenandaServer from "../bersama/PenandaServer";
import { normalkanKode, POLA_KODE_RUANG } from "../inti/aturan";
import { bentukNamaSah, NAMA_BEBAS_MAKS, rapikanNama } from "../inti/nama";
import { isiTeks, TEKS } from "../teks";
import { IKON_AVATAR } from "./avatar";
import { PemberitahuanSingkat } from "./PanelPengaturan";

export function Panel({ judul, children }: { judul?: string; children: ReactNode }) {
  return (
    <main className="js-layar">
      <div className="js-bingkai js-panel">
        {judul ? <h1>{judul}</h1> : null}
        {children}
      </div>
    </main>
  );
}

export function PitaGalat({ teks, id }: { teks: string | null; id?: string }) {
  if (!teks) return null;
  return (
    <p className="js-galat" id={id}>
      <span aria-hidden="true">! </span>
      {teks}
    </p>
  );
}

export function LayarKode({
  awal,
  memeriksa,
  siap = true,
  galat,
  saatKirim,
  saatPrivasi,
}: {
  awal: string;
  memeriksa: boolean;
  /** Aset dunia sudah termuat; sebelum itu tombol "Masuk" tampil belum aktif dan kode sah menunggu aset (JS-07). */
  siap?: boolean;
  galat: string | null;
  saatKirim: (kode: string) => void;
  /** JS-14 (P-15): membuka panel Privasi. */
  saatPrivasi?: () => void;
}) {
  const [nilai, setNilai] = useState(awal);
  const sah = POLA_KODE_RUANG.test(normalkanKode(nilai));
  return (
    <Panel judul={TEKS.judul}>
      <form
        className="js-formulir"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!memeriksa) saatKirim(nilai);
        }}
      >
        <label className="js-label" htmlFor="js-kode">
          {TEKS.kode.label}
        </label>
        <input
          id="js-kode"
          className="js-isian js-isian-kode"
          value={nilai}
          onChange={(e) => setNilai(e.target.value.toUpperCase())}
          maxLength={5}
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          aria-describedby={galat ? "js-kode-petunjuk js-kode-galat" : "js-kode-petunjuk"}
          aria-invalid={galat ? true : undefined}
        />
        <p className="js-petunjuk" id="js-kode-petunjuk">
          {memeriksa ? TEKS.kode.memeriksa : TEKS.kode.petunjuk}
        </p>
        <PitaGalat id="js-kode-galat" teks={galat} />
        <button type="submit" className="js-tombol js-tombol-utama" aria-disabled={!sah || memeriksa || !siap}>
          {TEKS.kode.tombol}
        </button>
      </form>
      {saatPrivasi ? <PemberitahuanSingkat saatBuka={saatPrivasi} /> : null}
      <PenandaServer />
    </Panel>
  );
}

export function LayarAbsen({ galat, saatKirim }: { galat: string | null; saatKirim: (nomor: number) => void }) {
  const [nilai, setNilai] = useState("");
  const [galatRentang, setGalatRentang] = useState(false);
  const teksGalat = galatRentang ? TEKS.absen.galatRentang : galat;
  return (
    <Panel judul={TEKS.absen.judul}>
      <form
        className="js-formulir"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(nilai);
          if (!/^\d{1,2}$/.test(nilai) || n < 1 || n > 50) {
            setGalatRentang(true);
            return;
          }
          setGalatRentang(false);
          saatKirim(n);
        }}
      >
        <label className="js-label" htmlFor="js-absen">
          {TEKS.absen.label}
        </label>
        <input
          id="js-absen"
          className="js-isian js-isian-kode"
          value={nilai}
          onChange={(e) => setNilai(e.target.value.replace(/\D/g, "").slice(0, 2))}
          inputMode="numeric"
          autoComplete="off"
          maxLength={2}
          aria-describedby={teksGalat ? "js-absen-petunjuk js-absen-galat" : "js-absen-petunjuk"}
          aria-invalid={teksGalat ? true : undefined}
        />
        <p className="js-petunjuk" id="js-absen-petunjuk">
          {TEKS.absen.petunjuk}
        </p>
        <p className="js-petunjuk">{TEKS.absen.privasi}</p>
        <PitaGalat id="js-absen-galat" teks={teksGalat} />
        <button type="submit" className="js-tombol js-tombol-utama">
          {TEKS.absen.tombol}
        </button>
      </form>
    </Panel>
  );
}

export function LayarMenghubungkan() {
  return (
    <Panel judul={TEKS.judul}>
      <p className="js-isi">{TEKS.menghubungkan}</p>
    </Panel>
  );
}

interface Pilihan<T> {
  nilai: T;
  isi: ReactNode;
  label?: string;
}

/** Kelompok tombol pilihan dengan perilaku radio: Tab masuk ke pilihan aktif, panah berpindah (P-53). */
function KelompokPilihan<T>({
  id,
  label,
  pilihan,
  terpilih,
  saatPilih,
  kelas,
}: {
  id: string;
  label: string;
  pilihan: readonly Pilihan<T>[];
  terpilih: T | null;
  saatPilih: (nilai: T) => void;
  kelas: string;
}) {
  const tombol = useRef<(HTMLButtonElement | null)[]>([]);
  const indeksTerpilih = pilihan.findIndex((p) => p.nilai === terpilih);
  const pindah = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const maju = e.key === "ArrowRight" || e.key === "ArrowDown";
    const mundur = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!maju && !mundur) return;
    e.preventDefault();
    const j = (i + (maju ? 1 : -1) + pilihan.length) % pilihan.length;
    saatPilih(pilihan[j].nilai);
    tombol.current[j]?.focus();
  };
  return (
    <div className="js-kelompok">
      <p className="js-label" id={`${id}-label`}>
        {label}
      </p>
      <div className={kelas} role="radiogroup" aria-labelledby={`${id}-label`}>
        {pilihan.map((p, i) => (
          <button
            key={String(p.nilai)}
            ref={(el) => {
              tombol.current[i] = el;
            }}
            type="button"
            role="radio"
            className="js-pilihan"
            aria-checked={i === indeksTerpilih}
            aria-label={p.label}
            tabIndex={i === (indeksTerpilih >= 0 ? indeksTerpilih : 0) ? 0 : -1}
            onClick={() => saatPilih(p.nilai)}
            onKeyDown={(e) => pindah(e, i)}
          >
            {p.isi}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LayarIdentitas({
  saran,
  pilihNama,
  pilihAvatar,
  galat,
  saatPilihNama,
  saatPilihAvatar,
  saatAcak,
  saatGabung,
  kaki,
}: {
  saran: readonly string[];
  pilihNama: string | null;
  pilihAvatar: number | null;
  galat: string | null;
  saatPilihNama: (nama: string) => void;
  saatPilihAvatar: (avatar: number) => void;
  saatAcak: () => void;
  saatGabung: () => void;
  /** JS-14 (P-5): tombol Menu dan suara di baris kaki, di kiri Gabung. */
  kaki?: ReactNode;
}) {
  const siap = pilihNama !== null && pilihAvatar !== null;
  return (
    <Panel judul={TEKS.identitas.judul}>
      <div className="js-identitas">
        <div className="js-kelompok">
          <KelompokPilihan
            id="js-nama"
            label={TEKS.identitas.kelompokNama}
            pilihan={saran.map((n) => ({ nilai: n, isi: n }))}
            terpilih={pilihNama}
            saatPilih={saatPilihNama}
            kelas="js-daftar-nama"
          />
          <button type="button" className="js-tombol" onClick={saatAcak}>
            {TEKS.identitas.acak}
          </button>
        </div>
        <KelompokPilihan
          id="js-avatar"
          label={TEKS.identitas.kelompokAvatar}
          pilihan={IKON_AVATAR.map((src, i) => ({
            nilai: i,
            // eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js
            isi: <img src={src} alt="" width={48} height={48} />,
            label: isiTeks(TEKS.identitas.avatar, { n: i + 1 }),
          }))}
          terpilih={pilihAvatar}
          saatPilih={saatPilihAvatar}
          kelas="js-kisi-avatar"
        />
      </div>
      <PitaGalat teks={galat} />
      <div className="js-kaki-identitas">
        {kaki}
        <button
          type="button"
          className="js-tombol js-tombol-utama"
          aria-disabled={!siap}
          onClick={() => {
            if (siap) saatGabung();
          }}
        >
          {TEKS.identitas.gabung}
        </button>
      </div>
    </Panel>
  );
}

/**
 * JS-14 (P-36 sampai P-39): layar identitas di ruang nama buatan siswa. Bentuk nama diperiksa di sini sebelum dikirim;
 * daftar kata penyaring hanya ada di server.
 */
export function LayarIdentitasBebas({
  saran,
  galat,
  saatMintaNama,
  saatGabung,
  kaki,
}: {
  saran: readonly string[];
  galat: string | null;
  saatMintaNama: () => void;
  saatGabung: (nama: string, avatar: number) => void;
  kaki?: ReactNode;
}) {
  const [nama, setNama] = useState("");
  const [avatar, setAvatar] = useState<number | null>(null);
  const [galatBentuk, setGalatBentuk] = useState(false);
  const [giliran, setGiliran] = useState(0);
  const isian = useRef<HTMLInputElement>(null);
  const teksGalat = galatBentuk ? TEKS.namaBebas.galatBentuk : galat;
  const siap = bentukNamaSah(nama) && avatar !== null;
  useEffect(() => {
    if (galat) isian.current?.focus();
  }, [galat]);
  const kirim = () => {
    if (!bentukNamaSah(nama)) {
      setGalatBentuk(true);
      isian.current?.focus();
      return;
    }
    if (avatar === null) return;
    setGalatBentuk(false);
    saatGabung(rapikanNama(nama), avatar);
  };
  return (
    <Panel judul={TEKS.identitas.judul}>
      <form
        className="js-identitas"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          kirim();
        }}
      >
        <div className="js-kelompok">
          <div className="js-label-baris">
            <label className="js-label" htmlFor="js-nama-bebas">
              {TEKS.namaBebas.label}
            </label>
            <span className="js-penghitung" aria-hidden="true">
              {isiTeks(TEKS.namaBebas.hitung, { n: Array.from(nama).length })}
            </span>
          </div>
          <input
            ref={isian}
            id="js-nama-bebas"
            className="js-isian js-isian-nama"
            value={nama}
            maxLength={NAMA_BEBAS_MAKS}
            autoComplete="off"
            autoCapitalize="words"
            autoCorrect="off"
            spellCheck={false}
            aria-describedby={teksGalat ? "js-nama-pesan js-nama-galat" : "js-nama-pesan"}
            aria-invalid={teksGalat ? true : undefined}
            onChange={(e) => {
              setNama(e.target.value);
              setGalatBentuk(false);
            }}
          />
          <p className="js-petunjuk" id="js-nama-pesan">
            {TEKS.namaBebas.pesan}
          </p>
          <button
            type="button"
            className="js-tombol"
            onClick={() => {
              // P-37: saran bergiliran; sesudah ketiganya terpakai, saran baru diminta dan dipakai pada tekanan berikutnya.
              if (saran.length === 0) return;
              setNama(saran[giliran % saran.length]);
              setGalatBentuk(false);
              const berikut = giliran + 1;
              setGiliran(berikut % saran.length === 0 ? 0 : berikut);
              if (berikut % saran.length === 0) saatMintaNama();
            }}
          >
            {TEKS.namaBebas.samaran}
          </button>
        </div>
        <KelompokPilihan
          id="js-avatar"
          label={TEKS.identitas.kelompokAvatar}
          pilihan={IKON_AVATAR.map((src, i) => ({
            nilai: i,
            // eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js
            isi: <img src={src} alt="" width={48} height={48} />,
            label: isiTeks(TEKS.identitas.avatar, { n: i + 1 }),
          }))}
          terpilih={avatar}
          saatPilih={setAvatar}
          kelas="js-kisi-avatar"
        />
      </form>
      <PitaGalat id="js-nama-galat" teks={teksGalat} />
      <div className="js-kaki-identitas">
        {kaki}
        <button type="button" className="js-tombol js-tombol-utama" aria-disabled={!siap} onClick={kirim}>
          {TEKS.identitas.gabung}
        </button>
      </div>
    </Panel>
  );
}
