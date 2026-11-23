// Konsol guru dan admin Jejak Setara ("/admin/"; spesifikasi JS-04, P-37 sampai P-48). Saat dibuka: "Memuat konsol…"
// dan GET /api/saya, lalu halaman menurut rute hash (rute.ts). Galat sesi dari rute mana pun ditangani di sini (P-48):
// 401 PERLU_MASUK ke halaman masuk dengan "Sesi berakhir. Silakan masuk lagi.", 403 WAJIB_GANTI_SANDI ke mode wajib,
// dan 403 TIDAK_BERWENANG membaca ulang GET /api/saya lalu menampilkan pesan galatnya.
import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Saya } from "../inti/akun";
import { TEKS_KONSOL } from "../teks-konsol";
import { api, type GalatApi } from "./api";
import Akun from "./halaman/Akun";
import Dasbor from "./halaman/Dasbor";
import DetailRuang from "./halaman/DetailRuang";
import GantiSandi from "./halaman/GantiSandi";
import Masuk from "./halaman/Masuk";
import RiwayatRuang from "./halaman/RiwayatRuang";
import Statistik from "./halaman/Statistik";
import Ruang from "./halaman/Ruang";
import DaftarKejadian from "./bank/DaftarKejadian";
import DaftarPaket from "./bank/DaftarPaket";
import Penyunting from "./bank/Penyunting";
import Rujukan from "./bank/Rujukan";
import Kerangka, { type Pemberitahuan } from "./Kerangka";
import { keHash, tujuan, type Rute, type Tujuan } from "./rute";
import { namaSkripKonsol, PemeriksaVersi, PERISTIWA_GAGAL_URAI } from "./versi-konsol";

// JS-15 (P-25): layar kelas dimuat hanya saat dibuka, di potongan kode sendiri.
const LayarKelas = lazy(() => import("./kelas/LayarKelas"));

/** JS-15 (P-25): potongan layar kelas yang gagal dimuat (misalnya berkas lama hilang sesudah deploy). */
class BatasLayarKelas extends Component<{ children: ReactNode }, { gagal: boolean }> {
  state = { gagal: false };
  static getDerivedStateFromError() {
    return { gagal: true };
  }
  render() {
    if (!this.state.gagal) return this.props.children;
    return (
      <div className="js-kelas-layar js-kelas-tengah" role="alert">
        <p>{TEKS_KONSOL.kelas.gagalMuatLayar}</p>
        <button type="button" className="js-konsol-tombol" onClick={() => window.location.reload()}>
          {TEKS_KONSOL.versiKonsol.muatUlang}
        </button>
      </div>
    );
  }
}

/**
 * JS-15 (P-26): banner bila `/admin/` sudah merujuk skrip konsol yang lain. Diperiksa saat rute berubah (menu konsol
 * memakai pushState, jadi lewat `kunciRute`), saat tab kembali terlihat, dan saat jawaban API gagal diurai; jeda 60 detik
 * diatur PemeriksaVersi.
 */
function useVersiBaru(kunciRute: string): boolean {
  const [baru, setBaru] = useState(false);
  const pemeriksa = useRef<PemeriksaVersi | null>(null);
  const periksa = useCallback(() => void pemeriksa.current?.periksa().then((b) => b && setBaru(true)), []);
  useEffect(() => {
    const awal = namaSkripKonsol(document.querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/admin-"]')?.src ?? "");
    pemeriksa.current = new PemeriksaVersi(awal, {
      sekarang: () => Date.now(),
      ambil: async () => (await fetch("/admin/", { cache: "no-store", credentials: "same-origin" })).text(),
    });
    const saatTerlihat = () => document.visibilityState === "visible" && periksa();
    document.addEventListener("visibilitychange", saatTerlihat);
    window.addEventListener(PERISTIWA_GAGAL_URAI, periksa);
    return () => {
      document.removeEventListener("visibilitychange", saatTerlihat);
      window.removeEventListener(PERISTIWA_GAGAL_URAI, periksa);
    };
  }, [periksa]);
  useEffect(() => {
    periksa();
  }, [kunciRute, periksa]);
  return baru;
}

function BannerVersi() {
  return (
    <div className="js-konsol-pemberitahuan js-konsol-versi" role="status">
      <p className="js-konsol-pesan">
        <span>{TEKS_KONSOL.versiKonsol.baru}</span>
        <button type="button" className="js-konsol-tombol" onClick={() => window.location.reload()}>
          {TEKS_KONSOL.versiKonsol.muatUlang}
        </button>
      </p>
    </div>
  );
}

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
    keadaan.jenis === "masuk" ? tujuan(hash, { masuk: true, peran: keadaan.akun.peran, wajibGantiSandi: keadaan.akun.wajibGantiSandi }).rute : "masuk";
  const sasaran: Tujuan =
    keadaan.jenis === "masuk" ? tujuan(hash, { masuk: true, peran: keadaan.akun.peran, wajibGantiSandi: keadaan.akun.wajibGantiSandi }) : { rute: "masuk", id: null };
  const idRuang = sasaran.id;
  const versiBaru = useVersiBaru(`${rute}/${idRuang ?? ""}`);

  // Alamat mengikuti rute yang benar-benar tampil (P-37), tanpa menambah riwayat peramban.
  useEffect(() => {
    if (keadaan.jenis === "memuat" || keadaan.jenis === "mati") return;
    if (window.location.hash !== keHash(rute, idRuang)) window.history.replaceState(null, "", keHash(rute, idRuang));
  }, [keadaan.jenis, rute, idRuang]);

  // Halaman baru selalu mulai dari atas, misalnya dasbor sesudah formulir sandi yang sudah digulir ke bawah.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [keadaan.jenis, rute, idRuang]);

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

  /** JS-12: membuka hash konsol mana pun dengan entri riwayat baru, lalu pemberitahuan (pemberitahuan lama dipertahankan bila tanpa pesan). */
  const buka = useCallback((h: string, pesan?: string) => {
    window.history.pushState(null, "", h);
    setHash(h);
    if (pesan) setPemberitahuan({ jenis: "berhasil", pesan });
  }, []);

  /** Membuka detail ruang dengan entri riwayat baru (tombol Kembali peramban kembali ke daftar), lalu pemberitahuan. */
  const bukaRuang = useCallback((id: string, pesan?: string) => {
    window.history.pushState(null, "", keHash("ruang", id));
    setHash(keHash("ruang", id));
    setPemberitahuan(pesan ? { jenis: "berhasil", pesan } : null);
  }, []);

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
  // Layar kelas tampil tanpa kerangka konsol, untuk proyektor (JS-10, P-1 dan P-23).
  if (rute === "kelas" && idRuang)
    return (
      <BatasLayarKelas>
        <Suspense
          fallback={
            <div className="js-kelas-layar js-kelas-tengah" role="status">
              <p>{TEKS_KONSOL.kelas.memuatLayar}</p>
            </div>
          }
        >
          <LayarKelas ruangId={idRuang} galatSesi={galatSesi} />
        </Suspense>
      </BatasLayarKelas>
    );
  return (
    <div className="js-konsol-ruang">
      <Kerangka akun={akun} rute={rute} wajib={akun.wajibGantiSandi} pemberitahuan={pemberitahuan} banner={versiBaru ? <BannerVersi /> : null} keluar={() => void keluar()}>
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
        ) : rute === "ruang" ? (
          idRuang === "riwayat" ? (
            <RiwayatRuang akun={akun} galatSesi={galatSesi} />
          ) : idRuang ? (
            <DetailRuang key={idRuang} id={idRuang} akun={akun} galatSesi={galatSesi} umumkan={umumkan} buka={buka} />
          ) : (
            <Ruang akun={akun} galatSesi={galatSesi} bukaRuang={bukaRuang} />
          )
        ) : rute === "kejadian" ? (
          idRuang ? (
            <Penyunting key={idRuang} kode={idRuang} akun={akun} galatSesi={galatSesi} umumkan={umumkan} buka={buka} />
          ) : (
            <DaftarKejadian galatSesi={galatSesi} />
          )
        ) : rute === "rujukan" ? (
          <Rujukan akun={akun} galatSesi={galatSesi} umumkan={umumkan} />
        ) : rute === "paket" ? (
          akun.peran === "admin" ? (
            <DaftarPaket key={idRuang ?? "daftar"} id={idRuang} galatSesi={galatSesi} umumkan={umumkan} buka={buka} />
          ) : (
            <p role="alert">{TEKS_KONSOL.hanyaAdmin}</p>
          )
        ) : rute === "statistik" ? (
          <Statistik akun={akun} galatSesi={galatSesi} />
        ) : rute === "akun" ? (
          <Akun akun={akun} galatSesi={galatSesi} umumkan={umumkan} perbaruiDiri={perbaruiAkun} />
        ) : (
          <Dasbor akun={akun} galatSesi={galatSesi} />
        )}
      </Kerangka>
    </div>
  );
}
