// Bagian formulir konsol (spesifikasi JS-04, P-40, P-49, P-50): kolom berlabel, kolom sandi dengan tombol Tampilkan,
// dan pesan. Setiap kolom punya label; petunjuk dan galat dihubungkan lewat aria-describedby; galat diumumkan lewat
// role="alert". Pesan galat: teks ink, ikon_peringatan, garis kiri coral; pesan berhasil: ikon_centang, garis kiri leaf.
import { useId, type Ref } from "react";
import ikonArsip from "../assets/ikon/ikon_arsip.png";
import ikonCentang from "../assets/ikon/ikon_centang.png";
import ikonJejak from "../assets/ikon/ikon_jejak.png";
import ikonPeringatan from "../assets/ikon/ikon_peringatan.png";
import { TEKS_KONSOL } from "../teks-konsol";

// Empat ikon konsol: berkas PNG yang sama dengan butir IKON di assets/manifest.ts (Disetujui, tercatat di CREDITS.md).
// Konsol tidak mengimpor manifest.ts, karena modul yang diimpor kedua halaman pindah ke potongan kode bersama, dan
// manifest.ts yang besar akan menambah 0,55 KB gzip pada kode layar pemain (pengukuran Build JS-04; AC-19).
const IKON_KONSOL = { ikon_arsip: ikonArsip, ikon_centang: ikonCentang, ikon_jejak: ikonJejak, ikon_peringatan: ikonPeringatan };

/** Ikon piksel; hanya hiasan, sehingga teks alternatifnya kosong. */
export function Ikon({ nama, ukuran = 16 }: { nama: keyof typeof IKON_KONSOL; ukuran?: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js
  return <img src={IKON_KONSOL[nama]} alt="" width={ukuran} height={ukuran} />;
}

export function PesanGalat({ id, pesan }: { id?: string; pesan: string | null | undefined }) {
  if (!pesan) return null;
  return (
    <p id={id} className="js-konsol-pesan" role="alert">
      <Ikon nama="ikon_peringatan" />
      <span>{pesan}</span>
    </p>
  );
}

export function PesanBerhasil({ pesan }: { pesan: string }) {
  return (
    <p className="js-konsol-pesan js-konsol-pesan-berhasil">
      <Ikon nama="ikon_centang" />
      <span>{pesan}</span>
    </p>
  );
}

export function PesanInfo({ pesan }: { pesan: string }) {
  return (
    <p className="js-konsol-pesan js-konsol-pesan-info" role="status">
      <Ikon nama="ikon_peringatan" />
      <span>{pesan}</span>
    </p>
  );
}

const gabungId = (...id: (string | undefined)[]) => id.filter(Boolean).join(" ") || undefined;

interface PropsKolom {
  label: string;
  nilai: string;
  ubah: (nilai: string) => void;
  galat?: string | null;
  petunjuk?: string;
  jenis?: "text" | "email";
  autoComplete?: string;
  nonaktif?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function Kolom({ label, nilai, ubah, galat, petunjuk, jenis = "text", autoComplete, nonaktif, ref }: PropsKolom) {
  const id = useId();
  const idPetunjuk = petunjuk ? `${id}-petunjuk` : undefined;
  const idGalat = galat ? `${id}-galat` : undefined;
  return (
    <div className="js-konsol-kolom">
      <label className="js-konsol-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        className="js-konsol-isian"
        type={jenis}
        value={nilai}
        onChange={(e) => ubah(e.target.value)}
        autoComplete={autoComplete}
        spellCheck={false}
        disabled={nonaktif}
        aria-invalid={galat ? true : undefined}
        aria-describedby={gabungId(idPetunjuk, idGalat)}
      />
      {petunjuk ? (
        <p id={idPetunjuk} className="js-konsol-petunjuk">
          {petunjuk}
        </p>
      ) : null}
      <PesanGalat id={idGalat} pesan={galat} />
    </div>
  );
}

interface PropsKolomSandi {
  label: string;
  nilai: string;
  ubah: (nilai: string) => void;
  tampil: boolean;
  ubahTampil: (tampil: boolean) => void;
  autoComplete: "current-password" | "new-password";
  galat?: string | null;
  petunjuk?: string;
  ref?: Ref<HTMLInputElement>;
}

/** Kolom sandi dengan tombol Tampilkan atau Sembunyikan (P-40). */
export function KolomSandi({ label, nilai, ubah, tampil, ubahTampil, autoComplete, galat, petunjuk, ref }: PropsKolomSandi) {
  const id = useId();
  const idPetunjuk = petunjuk ? `${id}-petunjuk` : undefined;
  const idGalat = galat ? `${id}-galat` : undefined;
  return (
    <div className="js-konsol-kolom">
      <label className="js-konsol-label" htmlFor={id}>
        {label}
      </label>
      <div className="js-konsol-sandi">
        <input
          id={id}
          ref={ref}
          className="js-konsol-isian"
          type={tampil ? "text" : "password"}
          value={nilai}
          onChange={(e) => ubah(e.target.value)}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={galat ? true : undefined}
          aria-describedby={gabungId(idPetunjuk, idGalat)}
        />
        <button type="button" className="js-konsol-tombol" aria-pressed={tampil} aria-controls={id} onClick={() => ubahTampil(!tampil)}>
          {tampil ? TEKS_KONSOL.sembunyikan : TEKS_KONSOL.tampilkan}
        </button>
      </div>
      {petunjuk ? (
        <p id={idPetunjuk} className="js-konsol-petunjuk">
          {petunjuk}
        </p>
      ) : null}
      <PesanGalat id={idGalat} pesan={galat} />
    </div>
  );
}
