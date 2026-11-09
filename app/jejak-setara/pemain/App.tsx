// Halaman pemain Jejak Setara ("/"): alur gabung (JS-03), lalu dunia untuk lobi, hitung mundur, ronde, dan jeda
// (JS-07), serta layar selesai dan ditutup. Mesin dunia hidup di sini, agar pesan `dunia` dan `koreksi` diterima
// walaupun layar dunia belum terpasang.
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { normalkanKode, POLA_KODE_RUANG } from "../inti/aturan";
import type { KodeGalat, PesanPemain, PesanServerPemain } from "../inti/protokol";
import type { StatusRuang, WarnaTas } from "../inti/tipe";
import { TEKS } from "../teks";
import { buatKanvasPeramban, muatAsetDunia } from "./dunia/aset";
import { penjagaPeramban } from "./dunia/layarMenyala";
import { MesinDunia } from "./dunia/mesin";
import { VERSI_PETA } from "./dunia/petaKampung";
import { LayarAbsen, LayarIdentitas, LayarKode, LayarMenghubungkan } from "./Gabung";
import { ketergantunganPeramban, KlienRuang, type KeadaanKlien } from "./jaringan";
import LayarDunia from "./LayarDunia";
import { LapisanJeda, LapisanMenyambung } from "./LayarMenyambung";
import { LayarDitutup, LayarGalat, LayarRonde, type WaktuStatus } from "./LayarRonde";

type NamaLayar = "kode" | "absen" | "menghubungkan" | "identitas" | "dunia" | "ronde" | "ditutup" | "galat";

interface PemainLobi {
  nama: string;
  avatar: number;
  warnaTas: WarnaTas;
}

/** Lobi, hitung mundur, ronde, dan jeda tampil di dunia; selesai dan ditutup tetap layar HTML (JS-07, P-41). */
const layarUntuk = (s: StatusRuang): NamaLayar => (s === "ditutup" ? "ditutup" : s === "selesai" || s === "pembahasan" ? "ronde" : "dunia");
const LAYAR_BERSAMBUNG: readonly NamaLayar[] = ["menghubungkan", "identitas", "dunia", "ronde"];

/** Pengumuman pembaca layar dengan jarak minimal 2 detik (P-54). */
function usePengumuman(): [string, (teks: string) => void] {
  const [teks, setTeks] = useState("");
  const antrean = useRef<string[]>([]);
  const sibuk = useRef(false);
  const umumkan = useCallback((baru: string) => {
    antrean.current.push(baru);
    if (sibuk.current) return;
    const lanjut = () => {
      const berikut = antrean.current.shift();
      if (berikut === undefined) {
        sibuk.current = false;
        return;
      }
      sibuk.current = true;
      setTeks(berikut);
      window.setTimeout(lanjut, 2000);
    };
    lanjut();
  }, []);
  return [teks, umumkan];
}

export default function App() {
  const [kodeAwal] = useState(() => normalkanKode(new URLSearchParams(window.location.search).get("kode") ?? "").slice(0, 5));
  const [layar, setLayar] = useState<NamaLayar>("kode");
  const [kode, setKode] = useState("");
  const [memeriksa, setMemeriksa] = useState(false);
  const [galatForm, setGalatForm] = useState<string | null>(null);
  const [saran, setSaran] = useState<string[]>([]);
  const [pilihNama, setPilihNama] = useState<string | null>(null);
  const [pilihAvatar, setPilihAvatar] = useState<number | null>(null);
  const [pemain, setPemain] = useState<Record<string, PemainLobi>>({});
  const [diriId, setDiriId] = useState<string | null>(null);
  const [waktu, setWaktu] = useState<WaktuStatus>({ status: "lobi", mulaiPada: null, berakhirPada: null, jedaSejak: null });
  const [koneksi, setKoneksi] = useState<KeadaanKlien>("menghubungkan");
  const [terputusSejak, setTerputusSejak] = useState<number | null>(null);
  const [galatKode, setGalatKode] = useState<KodeGalat | null>(null);
  const [pengaturan, setPengaturan] = useState({ durasiMenit: 15, batasPemain: 40 });
  const [asetSiap, setAsetSiap] = useState(false);
  // Kode sah yang dikirim sebelum aset dunia termuat; diperiksa begitu aset siap (JS-07).
  const [kodeTertunda, setKodeTertunda] = useState<string | null>(null);
  const [mesin] = useState(() => new MesinDunia(buatKanvasPeramban));
  const [penjaga] = useState(penjagaPeramban);
  const [pengumuman, umumkan] = usePengumuman();
  const klien = useRef<KlienRuang | null>(null);
  const pemainId = useRef<string | null>(null);
  const beridentitas = useRef(false);
  const statusRef = useRef<StatusRuang>("lobi");
  const layarRef = useRef<NamaLayar>("kode");
  const terputusRef = useRef<number | null>(null);

  const gantiLayar = useCallback((l: NamaLayar) => {
    layarRef.current = l;
    setLayar(l);
  }, []);

  const tanganiPesan = useCallback(
    (p: PesanServerPemain) => {
      mesin.terima(p, Date.now(), klien.current?.selisihJamMs ?? 0);
      switch (p.t) {
        case "selamat_datang":
          pemainId.current = p.pemainId;
          statusRef.current = p.status;
          setDiriId(p.pemainId);
          setPemain({});
          setPengaturan({ durasiMenit: p.pengaturan.durasiMenit, batasPemain: p.pengaturan.batasPemain });
          setWaktu((w) => ({ ...w, status: p.status }));
          if (p.saranNama.length > 0) {
            beridentitas.current = false;
            setSaran(p.saranNama);
            setPilihNama(null);
            gantiLayar("identitas");
          }
          break;
        case "status_ruang": {
          const sebelum = statusRef.current;
          statusRef.current = p.status;
          setWaktu({ status: p.status, mulaiPada: p.mulaiPada, berakhirPada: p.berakhirPada, jedaSejak: p.jedaSejak });
          if (beridentitas.current && p.status !== sebelum) {
            gantiLayar(layarUntuk(p.status));
            if (p.status === "main") umumkan(sebelum === "jeda" ? TEKS.pengumuman.lanjut : TEKS.pengumuman.mulai);
            else if (p.status === "jeda") umumkan(TEKS.pengumuman.jeda);
            else if (p.status === "selesai") umumkan(TEKS.pengumuman.selesai);
          }
          break;
        }
        case "pemain_baru":
          setPemain((prev) => ({ ...prev, [p.id]: { nama: p.nama, avatar: p.avatar, warnaTas: p.warnaTas } }));
          if (p.id === pemainId.current && !beridentitas.current) {
            beridentitas.current = true;
            setGalatForm(null);
            gantiLayar(layarUntuk(statusRef.current));
            umumkan(TEKS.pengumuman.lobi);
          }
          break;
        case "pemain_pergi":
          setPemain((prev) => {
            const baru = { ...prev };
            delete baru[p.id];
            return baru;
          });
          break;
        case "saran_nama":
          setSaran(p.saranNama);
          setPilihNama(null);
          break;
        case "galat":
          if (p.kode === "NAMA_DIPAKAI") {
            setGalatForm(TEKS.galat.NAMA_DIPAKAI);
            umumkan(TEKS.galat.NAMA_DIPAKAI);
          } else if (p.kode === "NOMOR_ABSEN_DIPAKAI") {
            setGalatForm(TEKS.galat.NOMOR_ABSEN_DIPAKAI);
            gantiLayar("absen");
            umumkan(TEKS.galat.NOMOR_ABSEN_DIPAKAI);
          } else if (p.kode === "RUANG_TIDAK_ADA") {
            gantiLayar("ditutup");
          } else if (p.kode !== "TERLALU_CEPAT" && p.kode !== "BUKAN_JANGKAUAN") {
            setGalatKode(p.kode);
            gantiLayar("galat");
            umumkan(TEKS.galat[p.kode]);
          }
          break;
        default:
          break;
      }
    },
    [gantiLayar, mesin, umumkan],
  );

  const tanganiKeadaan = useCallback(
    (k: KeadaanKlien, kodeTutup: number | null) => {
      setKoneksi(k);
      if (k === "menyambung_ulang") {
        if (terputusRef.current === null) {
          terputusRef.current = Date.now();
          setTerputusSejak(terputusRef.current);
          umumkan(TEKS.pengumuman.menyambung);
        }
        return;
      }
      if (terputusRef.current !== null && k === "tersambung") umumkan(TEKS.pengumuman.tersambung);
      terputusRef.current = null;
      setTerputusSejak(null);
      if (k === "berhenti" && layarRef.current !== "galat" && layarRef.current !== "ditutup") {
        if (kodeTutup === 4000) gantiLayar("ditutup");
        else if (kodeTutup === 4004 || kodeTutup === 4005) {
          setGalatKode(kodeTutup === 4004 ? "DIKELUARKAN" : "VERSI_BERBEDA");
          gantiLayar("galat");
        }
      }
    },
    [gantiLayar, umumkan],
  );

  const sambungkan = useCallback(
    (k: string, nomorAbsen: number | null) => {
      klien.current?.berhenti();
      pemainId.current = null;
      beridentitas.current = false;
      terputusRef.current = null;
      setTerputusSejak(null);
      setPemain({});
      setGalatForm(null);
      const alamat = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/ruang/${k}`;
      const c: KlienRuang = new KlienRuang(
        alamat,
        k,
        nomorAbsen,
        ketergantunganPeramban(),
        (p) => {
          if (klien.current === c) tanganiPesan(p);
        },
        (s, kt) => {
          if (klien.current === c) tanganiKeadaan(s, kt);
        },
        { versiPeta: VERSI_PETA },
      );
      klien.current = c;
      setKoneksi("menghubungkan");
      gantiLayar("menghubungkan");
      c.mulai();
    },
    [gantiLayar, tanganiKeadaan, tanganiPesan],
  );

  const periksaKode = useCallback(
    async (masukan: string) => {
      const k = normalkanKode(masukan);
      if (!POLA_KODE_RUANG.test(k)) {
        setGalatForm(TEKS.kode.galatFormat);
        return;
      }
      setGalatForm(null);
      setMemeriksa(true);
      try {
        const jawaban = await fetch(`/api/publik/ruang/${k}`, { cache: "no-store", headers: { Accept: "application/json" } });
        if (jawaban.status === 404) setGalatForm(TEKS.galat.RUANG_TIDAK_ADA);
        else if (jawaban.status === 429) setGalatForm(TEKS.kode.galatTerlaluSering);
        else if (!jawaban.ok) setGalatForm(TEKS.kode.galatJaringan);
        else {
          const isi = (await jawaban.json()) as { modeNomorAbsen?: unknown };
          setKode(k);
          if (isi.modeNomorAbsen === true) gantiLayar("absen");
          else sambungkan(k, null);
        }
      } catch {
        setGalatForm(TEKS.kode.galatJaringan);
      } finally {
        setMemeriksa(false);
      }
    },
    [gantiLayar, sambungkan],
  );

  const kirimAbsen = (nomor: number) => {
    setGalatForm(null);
    const c = klien.current;
    if (c && c.keadaan !== "berhenti") {
      c.ulangiHalo(nomor);
      gantiLayar("menghubungkan");
    } else {
      sambungkan(kode, nomor);
    }
  };

  const kembali = () => {
    klien.current?.berhenti();
    klien.current = null;
    pemainId.current = null;
    beridentitas.current = false;
    terputusRef.current = null;
    setTerputusSejak(null);
    setPemain({});
    setGalatForm(null);
    setGalatKode(null);
    gantiLayar("kode");
  };

  // Aset dunia dimuat lebih dulu; tombol "Masuk" baru aktif sesudahnya (JS-07, bagian "Status antarmuka").
  useEffect(() => {
    let aktif = true;
    const coba = (sisa: number) => {
      muatAsetDunia().then(
        (aset) => {
          mesin.pasangAset(aset);
          if (aktif) setAsetSiap(true);
        },
        () => {
          if (aktif && sisa > 0) window.setTimeout(() => coba(sisa - 1), 2000);
        },
      );
    };
    coba(2);
    return () => {
      aktif = false;
    };
  }, [mesin]);

  // Alamat dengan ?kode= langsung diperiksa sesudah aset termuat (JS-03 P-50; JS-07).
  useEffect(() => {
    if (!kodeAwal || !asetSiap) return;
    const id = window.setTimeout(() => void periksaKode(kodeAwal), 0);
    return () => window.clearTimeout(id);
  }, [kodeAwal, asetSiap, periksaKode]);

  // Kode yang dikirim sebelum aset siap: format salah langsung dijawab, kode sah menunggu aset (P-50; JS-07).
  const kirimKode = useCallback(
    (masukan: string) => {
      if (asetSiap || !POLA_KODE_RUANG.test(normalkanKode(masukan))) {
        void periksaKode(masukan);
        return;
      }
      setGalatForm(null);
      setMemeriksa(true);
      setKodeTertunda(masukan);
    },
    [asetSiap, periksaKode],
  );
  useEffect(() => {
    if (!asetSiap || kodeTertunda === null) return;
    const id = window.setTimeout(() => {
      setKodeTertunda(null);
      void periksaKode(kodeTertunda);
    }, 0);
    return () => window.clearTimeout(id);
  }, [asetSiap, kodeTertunda, periksaKode]);

  // Layar tetap menyala selama dunia tampil; dilepas di layar selesai, ditutup, dan galat (P-44).
  useEffect(() => {
    if (layar === "dunia") void penjaga.nyalakan();
    else void penjaga.matikan();
  }, [layar, penjaga]);
  useEffect(() => () => void penjaga.matikan(), [penjaga]);

  // Peramban kembali daring atau tab kembali terlihat: langsung coba lagi (P-29).
  useEffect(() => {
    const coba = () => klien.current?.cobaSekarang();
    const terlihat = () => {
      if (document.visibilityState === "visible") coba();
    };
    window.addEventListener("online", coba);
    document.addEventListener("visibilitychange", terlihat);
    return () => {
      window.removeEventListener("online", coba);
      document.removeEventListener("visibilitychange", terlihat);
      klien.current?.berhenti();
    };
  }, []);

  const selisihJam = useCallback(() => klien.current?.selisihJamMs ?? 0, []);
  const kirimGerak = useCallback((p: Extract<PesanPemain, { t: "gerak" }>) => klien.current?.kirim(p) ?? false, []);
  const bufferedAmount = useCallback(() => klien.current?.bufferedAmount ?? 0, []);
  const diri = diriId ? pemain[diriId] : undefined;
  const tampilMenyambung = koneksi === "menyambung_ulang" && terputusSejak !== null && LAYAR_BERSAMBUNG.includes(layar);

  let isi: ReactNode;
  switch (layar) {
    case "kode":
      isi = <LayarKode awal={kodeAwal} memeriksa={memeriksa} siap={asetSiap} galat={galatForm} saatKirim={kirimKode} />;
      break;
    case "absen":
      isi = <LayarAbsen galat={galatForm} saatKirim={kirimAbsen} />;
      break;
    case "menghubungkan":
      isi = <LayarMenghubungkan />;
      break;
    case "identitas":
      isi = (
        <LayarIdentitas
          saran={saran}
          pilihNama={pilihNama}
          pilihAvatar={pilihAvatar}
          galat={galatForm}
          saatPilihNama={setPilihNama}
          saatPilihAvatar={setPilihAvatar}
          saatAcak={() => {
            setGalatForm(null);
            klien.current?.kirim({ v: 1, t: "minta_nama" });
          }}
          saatGabung={() => {
            if (pilihNama === null || pilihAvatar === null) return;
            setGalatForm(null);
            klien.current?.kirim({ v: 1, t: "pilih_identitas", nama: pilihNama, avatar: pilihAvatar });
          }}
        />
      );
      break;
    case "dunia":
      isi = (
        <LayarDunia
          mesin={mesin}
          status={waktu.status}
          waktu={waktu}
          durasiMenit={pengaturan.durasiMenit}
          kode={kode}
          diri={diri ? { nama: diri.nama, avatar: diri.avatar } : null}
          jumlahPemain={Object.keys(pemain).length}
          menyambung={tampilMenyambung}
          selisihJam={selisihJam}
          kirim={kirimGerak}
          bufferedAmount={bufferedAmount}
          umumkan={umumkan}
        />
      );
      break;
    case "ronde":
      isi = <LayarRonde />;
      break;
    case "ditutup":
      isi = <LayarDitutup saatKembali={kembali} />;
      break;
    case "galat":
      isi = <LayarGalat kode={galatKode ?? "VERSI_BERBEDA"} saatKembali={kembali} />;
      break;
  }

  return (
    <>
      {isi}
      {layar === "dunia" && waktu.status === "jeda" ? <LapisanJeda /> : null}
      {tampilMenyambung ? <LapisanMenyambung sejak={terputusSejak} /> : null}
      <div className="js-sr" aria-live="polite">
        {pengumuman}
      </div>
    </>
  );
}
