// Konsol guru dan admin Jejak Setara ("/admin/"; spesifikasi JS-04, P-37 sampai P-48). Saat dibuka: "Memuat konsol…"
// dan GET /api/saya, lalu halaman menurut rute hash (rute.ts). Galat sesi dari rute mana pun ditangani di sini (P-48):
// 401 PERLU_MASUK ke halaman masuk dengan "Sesi berakhir. Silakan masuk lagi.", 403 WAJIB_GANTI_SANDI ke mode wajib,
// dan 403 TIDAK_BERWENANG membaca ulang GET /api/saya lalu menampilkan pesan galatnya.
import { useCallback, useEffect, useState } from "react";
import type { Saya } from "../inti/akun";
import { TEKS_KONSOL } from "../teks-konsol";
import { api, type GalatApi } from "./api";
import Akun from "./halaman/Akun";
import Dasbor from "./halaman/Dasbor";
import GantiSandi from "./halaman/GantiSandi";
import Masuk from "./halaman/Masuk";
import Kerangka, { type Pemberitahuan } from "./Kerangka";
import { keHash, tujuan, type Rute } from "./rute";

type Keadaan = { jenis: "memuat" } | { jenis: "mati" } | { jenis: "keluar"; sesiBerakhir: boolean } | { jenis: "masuk"; akun: Saya };

const hashSekarang = () => (typeof window === "undefined" ? "" : window.location.hash);

export default function App() {
  const [keadaan, setKeadaan] = useState<Keadaan>({ jenis: "memuat" });
  const [hash, setHash] = useState(hashSekarang);
  const [pemberitahuan, setPemberitahuan] = useState<Pemberitahuan | null>(null);

  useEffect(() => {
    let aktif = true;
    api.saya().then((hasil) => {
      if (!aktif) return;
      if (!hasil.ok) setKeadaan({ jenis: "mati" });
      else setKeadaan(hasil.data.masuk ? { jenis: "masuk", akun: hasil.data.akun } : { jenis: "keluar", sesiBerakhir: false });
    });
    // Pindah lewat menu atau tombol Kembali peramban; pemberitahuan halaman sebelumnya dibuang.
    const ganti = () => {
      setHash(window.location.hash);
      setPemberitahuan(null);
    };
    window.addEventListener("hashchange", ganti);
    return () => {
      aktif = false;
      window.removeEventListener("hashchange", ganti);
    };
  }, []);

  const rute: Rute =
    keadaan.jenis === "masuk" ? tujuan(hash, { masuk: true, peran: keadaan.akun.peran, wajibGantiSandi: keadaan.akun.wajibGantiSandi }) : "masuk";

  // Alamat mengikuti rute yang benar-benar tampil (P-37), tanpa menambah riwayat peramban.
  useEffect(() => {
    if (keadaan.jenis === "memuat" || keadaan.jenis === "mati") return;
    if (window.location.hash !== keHash(rute)) window.history.replaceState(null, "", keHash(rute));
  }, [keadaan.jenis, rute]);

  // Halaman baru selalu mulai dari atas, misalnya dasbor sesudah formulir sandi yang sudah digulir ke bawah.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [keadaan.jenis, rute]);

  /** Pindah rute dari kode (sesudah masuk, keluar, atau ganti sandi wajib), tanpa membuang pemberitahuan baru. */
  const pindah = useCallback((tujuanBaru: Rute) => {
    window.history.replaceState(null, "", keHash(tujuanBaru));
    setHash(keHash(tujuanBaru));
  }, []);

  const galatSesi = useCallback(
    (galat: GalatApi): boolean => {
      if (galat.kode === "PERLU_MASUK") {
        setPemberitahuan(null);
        setKeadaan({ jenis: "keluar", sesiBerakhir: true });
        pindah("masuk");
        return true;
      }
      if (galat.kode === "WAJIB_GANTI_SANDI") {
        setPemberitahuan(null);
        setKeadaan((k) => (k.jenis === "masuk" ? { jenis: "masuk", akun: { ...k.akun, wajibGantiSandi: true } } : k));
        return true;
      }
      if (galat.kode === "TIDAK_BERWENANG") {
        setPemberitahuan({ jenis: "galat", pesan: galat.pesan });
        api.saya().then((hasil) => {
          if (!hasil.ok) return;
          setKeadaan(hasil.data.masuk ? { jenis: "masuk", akun: hasil.data.akun } : { jenis: "keluar", sesiBerakhir: true });
        });
        return true;
      }
      return false;
    },
    [pindah],
  );

  const umumkan = useCallback((pesan: string) => setPemberitahuan({ jenis: "berhasil", pesan }), []);

  async function keluar() {
    await api.keluar();
    setPemberitahuan(null);
    setKeadaan({ jenis: "keluar", sesiBerakhir: false });
    pindah("masuk");
  }

  if (keadaan.jenis === "memuat" || keadaan.jenis === "mati") {
    return (
      <div className="js-konsol-ruang">
        <main className="js-konsol-memuat">
          {keadaan.jenis === "memuat" ? (
            <p role="status">{TEKS_KONSOL.memuat}</p>
          ) : (
            <>
              <p role="alert">{TEKS_KONSOL.serverTidakMenjawab}</p>
              <button type="button" className="js-konsol-tombol" onClick={() => window.location.reload()}>
                {TEKS_KONSOL.muatUlang}
              </button>
            </>
          )}
        </main>
      </div>
    );
  }

  if (keadaan.jenis === "keluar") {
    return (
      <div className="js-konsol-ruang">
        <Masuk
          sesiBerakhir={keadaan.sesiBerakhir}
          berhasil={(akun) => {
            setPemberitahuan(null);
            setKeadaan({ jenis: "masuk", akun });
            pindah(akun.wajibGantiSandi ? "sandi" : "dasbor");
          }}
        />
      </div>
    );
  }

  const { akun } = keadaan;
  const perbaruiAkun = (baru: Saya) => setKeadaan({ jenis: "masuk", akun: baru });
  return (
    <div className="js-konsol-ruang">
      <Kerangka akun={akun} rute={rute} wajib={akun.wajibGantiSandi} pemberitahuan={pemberitahuan} keluar={() => void keluar()}>
        {rute === "sandi" ? (
          <GantiSandi
            key={akun.wajibGantiSandi ? "wajib" : "sukarela"}
            akun={akun}
            wajib={akun.wajibGantiSandi}
            galatSesi={galatSesi}
            berhasil={(baru, wajib) => {
              perbaruiAkun(baru);
              setPemberitahuan({ jenis: "berhasil", pesan: wajib ? TEKS_KONSOL.sandi.berhasil : TEKS_KONSOL.sandi.berhasilLain });
              if (wajib) pindah("dasbor");
            }}
          />
        ) : rute === "akun" ? (
          <Akun akun={akun} galatSesi={galatSesi} umumkan={umumkan} perbaruiDiri={perbaruiAkun} />
        ) : (
          <Dasbor akun={akun} galatSesi={galatSesi} />
        )}
      </Kerangka>
    </div>
  );
}
