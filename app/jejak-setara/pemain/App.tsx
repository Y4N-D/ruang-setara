// Halaman pemain Jejak Setara ("/"): alur gabung (JS-03), lalu dunia untuk lobi, hitung mundur, ronde, dan jeda
// (JS-07), serta layar selesai dan ditutup. Mesin dunia hidup di sini, agar pesan `dunia` dan `koreksi` diterima
// walaupun layar dunia belum terpasang. JS-08: keadaan dialog kejadian, skor dan peringkat pribadi, skor akhir, dan
// pesan periksa, kunci, dan tutup dialog (P-13, P-24, P-28, P-43 sampai P-59). JS-11: rekap pribadi yang tetap
// terbaca saat menyambung ulang dan sesudah sambungan berakhir (spesifikasi JS-11, P-3 sampai P-9; D-2 a).
// JS-09: pesan skill diteruskan ke mesin dunia, `pakai_skill` dari HUD dan dari tombol Petunjuk di dialog, Petunjuk dan
// "+1 Kompas" di dialog, serta pengumuman skill (spesifikasi JS-09, P-13, P-24, P-27 sampai P-32, P-37, P-39).
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AksiDialog } from "../bersama/DialogKejadian";
import {
  aturPetunjuk,
  aturRingkas,
  bolehTekan,
  bukaDialog,
  kunci,
  pilih,
  pilihNomor,
  pindah,
  tekanPetunjuk,
  terimaHasil1,
  terimaHasil2,
  terimaPetunjuk,
  TUNGGU_PETUNJUK_MS,
  type KeadaanDialog,
} from "../bersama/dialogKeadaan";
import { normalkanKode, normalkanKodeMasukUlang, POLA_KODE_MASUK_ULANG, POLA_KODE_RUANG } from "../inti/aturan";
import type { KodeGalat, PesanPemain, PesanServerPemain } from "../inti/protokol";
import { PROTOKOL_VERSI } from "../inti/versi";
import type { SkillId, StatusRuang, WarnaTas } from "../inti/tipe";
import { isiTeks, TEKS } from "../teks";
import { buatKanvasPeramban, muatAsetDunia } from "./dunia/aset";
import { depPeramban, mulaiSaatSenggang } from "./dunia/penjadwal";
import { penjagaPeramban } from "./dunia/layarMenyala";
import { nomorZona } from "./dunia/kejadian";
import { perangkatSentuh } from "./dunia/masukan";
import { MesinDunia } from "./dunia/mesin";
import { VERSI_PETA } from "./dunia/petaKampung";
import { bunyiSkill } from "./dunia/skill";
import { LayarAbsen, LayarIdentitas, LayarIdentitasBebas, LayarKode, LayarMasukUlang, LayarMenghubungkan } from "./Gabung";
import { masukLayarPenuh } from "./layarPenuh";
import { KelompokMenuSuara, PanelPengaturan, PanelPrivasi, PanelTentang, type JenisLembar } from "./PanelPengaturan";
import { LABEL_HURUF, useKurangiGerak, usePengaturan } from "./pengaturan";
import { buatPemutarSuara, bunyiTeksJatuh, LAJU_TEKS, type NamaSuara } from "./suara";
import { alamatSambungan, ketergantunganPeramban, KlienRuang, type KeadaanKlien, KODE_LAYANAN_BERHENTI, KODE_PUTUS_LAMA } from "./jaringan";
import LayarDunia, { areaDialog } from "./LayarDunia";
import { LapisanJeda, LapisanMenyambung } from "./LayarMenyambung";
import { LayarDitutup, LayarGalat, type SkorAkhir, type WaktuStatus, LayarBerhenti } from "./LayarRonde";
import { LayarRekap } from "./Rekap";
import { akhirRekap, penyebabDariKode, type AkhirRekap, type ButirRekap, type PenyebabBerakhir } from "./rekapKeadaan";

type NamaLayar = "kode" | "masukUlang" | "absen" | "menghubungkan" | "identitas" | "dunia" | "ronde" | "ditutup" | "galat";

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
  /** JS-16b (P-15): teks layar galat tanpa kode server, misalnya perangkat yang digantikan. */
  const [galatTeks, setGalatTeks] = useState<string | null>(null);
  const [berhentiJenis, setBerhentiJenis] = useState<"layanan" | "putus" | null>(null); // JS-22, P-10
  const [pengaturan, setPengaturan] = useState({ durasiMenit: 15, batasPemain: 40 });
  // JS-14: pengaturan pemain (P-1 sampai P-3), suara (P-20 sampai P-23), panel Menu (P-8 sampai P-11), dan mode nama.
  const [atur, ubahAtur] = usePengaturan();
  const aturRef = useRef(atur);
  useEffect(() => {
    aturRef.current = atur;
  }, [atur]);
  const gerak = useKurangiGerak(atur);
  const [pemutar] = useState(() => buatPemutarSuara());
  const [lembar, setLembar] = useState<JenisLembar | null>(null);
  const lembarRef = useRef<JenisLembar | null>(null);
  useEffect(() => {
    lembarRef.current = lembar;
  }, [lembar]);
  const lembarDariMenu = useRef(false);
  const pembukaLembar = useRef<HTMLElement | null>(null);
  const [modeNama, setModeNama] = useState<"daftar" | "bebas">("daftar");
  const laptop = useMemo(() => !perangkatSentuh(window), []);
  // JS-14 (P-22) dan JS-18 (P-37): masa aktif Lari cepat, Kompas, dan Teropong terakhir, untuk bunyi skill.
  const aktifSkill = useRef<Partial<Record<SkillId, number>>>({});
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
  // JS-08: dialog kejadian, skor dan peringkat pribadi, skor akhir, dan periksa yang menunggu jawaban server.
  const [dialog, setDialogState] = useState<KeadaanDialog | null>(null);
  const dialogRef = useRef<KeadaanDialog | null>(null);
  const [pribadi, setPribadi] = useState({ skor: 0, peringkat: 1 });
  const pribadiRef = useRef({ skor: 0, peringkat: 1 });
  const [akhir, setAkhir] = useState<SkorAkhir | null>(null);
  // JS-11: rekap dari `selesai` (null sebelum tiba) dan rekap yang tetap tampil sesudah sambungan berakhir (P-8).
  const [rekap, setRekap] = useState<ButirRekap[] | null>(null);
  const [rekapBerakhir, setRekapBerakhir] = useState<AkhirRekap | null>(null);
  const rekapBerakhirRef = useRef<AkhirRekap | null>(null);
  const [menungguPeriksa, setMenungguPeriksa] = useState(false);
  const pewaktuPeriksa = useRef<number | null>(null);
  const [ruangUji, setRuangUji] = useState(false);
  const jumlahPemainRef = useRef(0);

  const aturDialog = useCallback(
    (d: KeadaanDialog | null) => {
      dialogRef.current = d;
      mesin.aturDialog(d?.kejadianId ?? null);
      setDialogState(d);
    },
    [mesin],
  );
  const hentiMenunggu = useCallback(() => {
    if (pewaktuPeriksa.current !== null) window.clearTimeout(pewaktuPeriksa.current);
    pewaktuPeriksa.current = null;
    setMenungguPeriksa(false);
  }, []);

  const gantiLayar = useCallback((l: NamaLayar) => {
    layarRef.current = l;
    setLayar(l);
  }, []);

  /** Rekap hanya disimpan di memori tab; dikosongkan saat bergabung ke ruang lain atau kembali ke awal. */
  const hapusRekap = useCallback(() => {
    setRekap(null);
    rekapBerakhirRef.current = null;
    setRekapBerakhir(null);
  }, []);

  /** P-8: di layar rekap, sambungan yang berakhir tidak mengganti layar; true bila rekap tetap tampil. */
  const tahanRekap = useCallback(
    (p: PenyebabBerakhir | null): boolean => {
      if (layarRef.current !== "ronde" || p === null) return false;
      const a = akhirRekap(p);
      if (!a) return false;
      if (!rekapBerakhirRef.current) {
        rekapBerakhirRef.current = a;
        setRekapBerakhir(a);
        umumkan(a.pita === "ditutup" ? TEKS.rekap.pitaDitutup : TEKS.rekap.pitaBerhenti);
      }
      return true;
    },
    [umumkan],
  );

  // JS-14 (P-14, P-20, P-21): bunyi hanya bila suara nyala; konteks dibuat pada ketukan yang menyalakannya.
  const putar = useCallback(
    (nama: NamaSuara, laju?: number) => {
      if (aturRef.current.suara) pemutar.putar(nama, laju);
    },
    [pemutar],
  );
  const aturSuara = useCallback(
    (nyala: boolean) => {
      if (nyala) pemutar.nyalakan();
      else pemutar.matikan();
      ubahAtur({ suara: nyala });
      umumkan(nyala ? TEKS.suara.umumNyala : TEKS.suara.umumMati);
    },
    [pemutar, ubahAtur, umumkan],
  );
  const balikSuara = useCallback(() => aturSuara(!aturRef.current.suara), [aturSuara]);
  const hurufKetik = useCallback(
    (teks: string, dari: number, ke: number) => {
      if (bunyiTeksJatuh(teks, dari, ke)) putar("teks", LAJU_TEKS);
    },
    [putar],
  );
  // P-8 sampai P-11: panel Menu; fokus kembali ke pembukanya sesudah panel terakhir ditutup (P-10).
  const bukaLembar = useCallback((j: JenisLembar) => {
    if (lembarRef.current === null) pembukaLembar.current = document.activeElement as HTMLElement | null;
    lembarDariMenu.current = false;
    setLembar(j);
  }, []);
  const tutupLembar = useCallback(() => {
    if (lembarRef.current !== "pengaturan" && lembarDariMenu.current) {
      lembarDariMenu.current = false;
      setLembar("pengaturan");
      return;
    }
    setLembar(null);
    const p = pembukaLembar.current;
    pembukaLembar.current = null;
    if (p && document.contains(p)) window.setTimeout(() => p.focus(), 0);
  }, []);
  // P-20: suara yang sudah nyala dari tab ini dihidupkan pada ketukan atau tombol pertama sesudah halaman dimuat.
  useEffect(() => {
    if (!atur.suara || pemutar.nyala()) return;
    const hidupkan = () => pemutar.nyalakan();
    window.addEventListener("pointerdown", hidupkan, { once: true, capture: true });
    window.addEventListener("keydown", hidupkan, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", hidupkan, true);
      window.removeEventListener("keydown", hidupkan, true);
    };
  }, [atur.suara, pemutar]);
  // P-14: M di mana saja kecuali saat mengetik; P-8: Esc membuka Menu di layar identitas dan rekap.
  useEffect(() => {
    const tekan = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      const mengetik = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT");
      if (e.code === "KeyM" && !e.repeat && !mengetik) {
        e.preventDefault();
        balikSuara();
        return;
      }
      if (e.key === "Escape" && !e.repeat && !e.defaultPrevented && !mengetik && lembarRef.current === null && (layarRef.current === "identitas" || layarRef.current === "ronde")) {
        e.preventDefault();
        bukaLembar("pengaturan");
      }
    };
    window.addEventListener("keydown", tekan);
    return () => window.removeEventListener("keydown", tekan);
  }, [balikSuara, bukaLembar]);

  const tanganiPesan = useCallback(
    (p: PesanServerPemain) => {
      // Kejadian yang pertama kali terlihat di layar ini diumumkan (P-13); dicek sebelum mesin mencatatnya.
      const terlihatBaru = p.t === "kejadian_terlihat" && !mesin.kejadian.kodeTerlihat().has(p.kejadianId);
      mesin.terima(p, Date.now(), klien.current?.selisihJamMs ?? 0);
      // JS-09 (P-39): pengumuman skill dari pesan ini, sesudah pengumuman sebelumnya (misalnya pengumuman kartu).
      for (const teks of mesin.umum.splice(0)) umumkan(teks);
      switch (p.t) {
        case "selamat_datang":
          pemainId.current = p.pemainId;
          statusRef.current = p.status;
          setDiriId(p.pemainId);
          setPemain({});
          setRuangUji(p.pengaturan.uji);
          aturDialog(null);
          hentiMenunggu();
          setPengaturan({ durasiMenit: p.pengaturan.durasiMenit, batasPemain: p.pengaturan.batasPemain });
          setModeNama(p.pengaturan.modeNama); // JS-14 (P-34)
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
          if (p.status === "selesai" || p.status === "pembahasan" || p.status === "ditutup") {
            aturDialog(null);
            hentiMenunggu();
            if (p.status === "selesai") setAkhir((a) => a ?? { ...pribadiRef.current, jumlah: Math.max(1, jumlahPemainRef.current) });
          }
          // Layar juga diganti bila status sudah berubah selama terputus (misalnya ronde selesai saat HP menyambung
          // ulang): selamat_datang sudah membawa status baru, jadi status_ruang sesudahnya tidak tampak berubah (JS-08, P-36).
          if (beridentitas.current && (p.status !== sebelum || layarRef.current !== layarUntuk(p.status))) {
            if (!(p.status === "ditutup" && tahanRekap("ditutup"))) gantiLayar(layarUntuk(p.status));
          }
          if (beridentitas.current && p.status !== sebelum) {
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
        case "nama_baru":
          // JS-14 (P-47): nama baru dari guru; pita dan pengumuman untuk diri sendiri datang dari mesin dunia.
          setPemain((prev) => (prev[p.id] ? { ...prev, [p.id]: { ...prev[p.id], nama: p.nama } } : prev));
          break;
        case "mode_nama":
          // JS-14 (P-45): layar identitas berganti ke tiga saran nama samaran tanpa pita galat tambahan.
          setModeNama(p.modeNama);
          setGalatForm(null);
          break;
        case "kejadian_terlihat":
          if (terlihatBaru && beridentitas.current) {
            umumkan(TEKS.pengumuman.terlihat);
            putar("kejadian"); // JS-14 (P-22)
          }
          break;
        case "kejadian_terbuka": {
          hentiMenunggu();
          const titik = mesin.kejadian.daftar().find((x) => x.kejadianId === p.kejadianId);
          const area = areaDialog(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1, perangkatSentuh(window));
          const ada = dialogRef.current;
          // Pesan pembukaan yang dikirim ulang untuk dialog yang sama tidak mengulang tampilan (P-26, P-28).
          if (ada && ada.kejadianId === p.kejadianId && (p.langkah === 1 || ada.hasil1)) break;
          // JS-09 (P-27): tombol Petunjuk hanya bila Petunjuk aktif di ruang, dengan muatan dari `pribadi` terakhir.
          const muatanPetunjuk = mesin.skill.ruang.includes("petunjuk") ? mesin.skill.muatan.petunjuk : null;
          aturDialog(bukaDialog(p, titik ? nomorZona(titik.x, titik.y) : 1, area.ringkas, Date.now(), muatanPetunjuk));
          break;
        }
        case "petunjuk": {
          // JS-09 (P-29, P-30): kotak petunjuk dan pilihan yang dicoret; pengumuman hanya saat isinya baru.
          const d = dialogRef.current;
          if (!d) break;
          const baru = terimaPetunjuk(d, p);
          if (baru === d) break;
          if (d.petunjuk?.dicoret !== p.opsiDicoret) {
            umumkan(isiTeks(TEKS.skill.umumPetunjuk, { kalimat: p.kalimat }));
            putar("skill"); // JS-14 (P-22)
          }
          aturDialog(baru);
          break;
        }
        case "pemberitahuan": {
          // JS-09 (P-32): "+1 Kompas" di kepala kartu dampak; pengumumannya datang dari mesin dunia.
          const d = dialogRef.current;
          if (p.kode === "kompas_tepat" && d?.hasil2) aturDialog({ ...d, tambahKompas: true });
          // JS-14 (P-22) dan JS-18 (P-37): kotak skill dan dua menit terakhir.
          if (p.kode === "dua_menit") putar("peringatan");
          else bunyiSkill(p, aktifSkill.current, putar);
          break;
        }
        case "hasil_1": {
          const d = dialogRef.current;
          if (!d) break;
          if (!d.bukaLangkah2) {
            umumkan(p.benar ? TEKS.pengumuman.langkah1Tepat : TEKS.pengumuman.langkah1Belum);
            putar(p.benar ? "tepat" : "lembut"); // JS-14 (P-22); kiriman ulang Langkah 2 tidak berbunyi
          }
          aturDialog(terimaHasil1(d, p, Date.now()));
          break;
        }
        case "hasil_2": {
          const d = dialogRef.current;
          if (!d) break;
          const tingkat = TEKS.kartu.tingkat[p.tingkat];
          umumkan(isiTeks(TEKS.pengumuman.kartu, { tingkat }) + (p.poin > 0 ? ` ${isiTeks(TEKS.pengumuman.tambahPoin, { poin: p.poin })}` : ""));
          putar(p.tingkat === "tepat" ? "tepat" : "lembut"); // JS-14 (P-22)
          aturDialog(terimaHasil2(d, p, Date.now()));
          break;
        }
        case "pribadi": {
          pribadiRef.current = { skor: p.skor, peringkat: p.peringkat };
          setPribadi(pribadiRef.current);
          // JS-14 (P-22) dan JS-18 (P-37): masa aktif Lari cepat, Kompas, atau Teropong yang baru.
          bunyiSkill(p, aktifSkill.current, putar);
          const d = dialogRef.current;
          if (d?.petunjuk && d.petunjuk.muatan !== p.muatan.petunjuk) aturDialog(aturPetunjuk(d, { muatan: p.muatan.petunjuk })); // JS-09, P-27
          break;
        }
        case "selesai":
          aturDialog(null);
          hentiMenunggu();
          setAkhir({ skor: p.skor, peringkat: p.peringkat, jumlah: p.jumlahPemain });
          setRekap(p.rekap); // JS-11, P-3
          break;
        case "galat":
          if (p.kode === "NAMA_DIPAKAI" || p.kode === "NAMA_DITOLAK") {
            // JS-14 (P-39): galat nama tampil di layar identitas dan diumumkan.
            setGalatForm(TEKS.galat[p.kode]);
            umumkan(TEKS.galat[p.kode]);
          } else if (p.kode === "NOMOR_ABSEN_DIPAKAI") {
            setGalatForm(TEKS.galat.NOMOR_ABSEN_DIPAKAI);
            gantiLayar("absen");
            umumkan(TEKS.galat.NOMOR_ABSEN_DIPAKAI);
          } else if (p.kode === "KODE_MASUK_ULANG_SALAH") {
            // JS-16b (P-14): sambungan tetap terbuka; siswa boleh mengetik kode lain.
            setGalatForm(TEKS.masukUlang.galatSalah);
            gantiLayar("masukUlang");
            umumkan(TEKS.masukUlang.galatSalah);
          } else if (p.kode === "RUANG_TIDAK_ADA") {
            if (!tahanRekap("tidak_ada")) gantiLayar("ditutup");
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
    [aturDialog, gantiLayar, hentiMenunggu, mesin, tahanRekap, umumkan, putar],
  );

  const tanganiKeadaan = useCallback(
    (k: KeadaanKlien, kodeTutup: number | null) => {
      setKoneksi(k);
      if (k === "menyambung_ulang") {
        // Saat menyambung ulang dialog tertutup; penanda dan skor dipulihkan dari pesan yang dikirim ulang (P-54).
        aturDialog(null);
        hentiMenunggu();
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
      if (k === "berhenti" && tahanRekap(penyebabDariKode(kodeTutup))) return; // JS-11, P-8
      if (k === "berhenti" && layarRef.current !== "galat" && layarRef.current !== "ditutup") {
        if (kodeTutup === 4000) gantiLayar("ditutup");
        else if (kodeTutup === KODE_LAYANAN_BERHENTI || kodeTutup === KODE_PUTUS_LAMA) {
          setBerhentiJenis(kodeTutup === KODE_LAYANAN_BERHENTI ? "layanan" : "putus");
          gantiLayar("galat");
        } else if (kodeTutup === 4001) {
          // JS-16b (P-15): pemain ini sudah masuk dari perangkat lain.
          setGalatTeks(TEKS.masukUlang.diganti);
          gantiLayar("galat");
        } else if (kodeTutup === 1008 && layarRef.current === "masukUlang") {
          setGalatForm(TEKS.masukUlang.galatTerlaluSering); // JS-16b (P-14): kode salah kelima
        } else if (kodeTutup === 4004 || kodeTutup === 4005) {
          setGalatKode(kodeTutup === 4004 ? "DIKELUARKAN" : "VERSI_BERBEDA");
          gantiLayar("galat");
        }
      }
    },
    [aturDialog, gantiLayar, hentiMenunggu, tahanRekap, umumkan],
  );

  const sambungkan = useCallback(
    (k: string, nomorAbsen: number | null, kodeMasukUlang?: string) => {
      klien.current?.berhenti();
      pemainId.current = null;
      beridentitas.current = false;
      terputusRef.current = null;
      setTerputusSejak(null);
      setPemain({});
      setGalatForm(null);
      setAkhir(null);
      hapusRekap();
      pribadiRef.current = { skor: 0, peringkat: 1 };
      setPribadi(pribadiRef.current);
      // JS-25 (P-8): `tambahan` menyatakan kode ini mengenal ronde 5 menit; ruang 5 menit menolak kode tanpa angka ini.
      const alamat = alamatSambungan(window.location.protocol, window.location.host, k);
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
        { versiPeta: VERSI_PETA, kodeMasukUlang },
      );
      klien.current = c;
      setKoneksi("menghubungkan");
      gantiLayar("menghubungkan");
      c.mulai();
    },
    [gantiLayar, hapusRekap, tanganiKeadaan, tanganiPesan],
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
        else if (jawaban.status === 503) setGalatForm(TEKS.api.LAYANAN_BERHENTI); // JS-22, P-12
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

  // JS-16b (P-13, P-14): masuk ulang dengan kode dari guru. Selama sambungan ke ruang yang sama masih terbuka sesudah
  // kode salah, kode berikutnya dikirim lewat sambungan itu.
  const kirimMasukUlang = async (masukanRuang: string, masukanKode: string) => {
    const k = normalkanKode(masukanRuang);
    const kodeGuru = normalkanKodeMasukUlang(masukanKode);
    if (!POLA_KODE_RUANG.test(k)) {
      setGalatForm(TEKS.kode.galatFormat);
      return;
    }
    if (!POLA_KODE_MASUK_ULANG.test(kodeGuru)) {
      setGalatForm(TEKS.masukUlang.galatFormat);
      return;
    }
    setGalatForm(null);
    const c = klien.current;
    if (c && c.keadaan !== "berhenti" && kode === k) {
      c.ulangiMasukUlang(kodeGuru);
      gantiLayar("menghubungkan");
      return;
    }
    setMemeriksa(true);
    try {
      const jawaban = await fetch(`/api/publik/ruang/${k}`, { cache: "no-store", headers: { Accept: "application/json" } });
      if (jawaban.status === 404) setGalatForm(TEKS.galat.RUANG_TIDAK_ADA);
      else if (jawaban.status === 503) setGalatForm(TEKS.api.LAYANAN_BERHENTI);
      else if (jawaban.status === 429) setGalatForm(TEKS.kode.galatTerlaluSering);
      else if (!jawaban.ok) setGalatForm(TEKS.kode.galatJaringan);
      else {
        setKode(k);
        sambungkan(k, null, kodeGuru);
      }
    } catch {
      setGalatForm(TEKS.kode.galatJaringan);
    } finally {
      setMemeriksa(false);
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
    setGalatTeks(null);
    setBerhentiJenis(null);
    hapusRekap();
    gantiLayar("kode");
  };

  // Aset dunia dimuat sesudah layar Kode tampil (JS-15, P-23); tombol "Masuk" tetap menunggu aset (JS-07, "Status antarmuka").
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
    const batalMulai = mulaiSaatSenggang(() => coba(2), depPeramban());
    return () => {
      aktif = false;
      batalMulai();
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

  // Aksi dialog (P-43 sampai P-48): aturan pilihan, kunci, pindah tampilan, dan masa tunggu ada di dialogKeadaan.ts.
  const aksiDialog = useCallback(
    (a: AksiDialog) => {
      const d = dialogRef.current;
      if (!d) return;
      const kini = Date.now();
      switch (a.jenis) {
        case "tutup":
        case "jelajah":
          if (!bolehTekan(d, kini)) return;
          klien.current?.kirim({ v: PROTOKOL_VERSI, t: "tutup_dialog", kejadianId: d.kejadianId });
          aturDialog(null);
          return;
        case "pilih":
          aturDialog(pilih(d, a.id, kini));
          return;
        case "nomor":
          aturDialog(pilihNomor(d, a.n, kini));
          return;
        case "kunci": {
          const hasil = kunci(d, kini);
          if (!hasil.pesan) return;
          if (klien.current?.kirim({ v: PROTOKOL_VERSI, ...hasil.pesan })) {
            aturDialog(hasil.d);
            putar("klik"); // JS-14 (P-22)
          }
          return;
        }
        case "petunjuk": {
          // JS-09 (P-27): Petunjuk dan Kunci jawaban menunggu `petunjuk` paling lama 2 detik.
          const baru = tekanPetunjuk(d, kini);
          if (!baru || !klien.current?.kirim({ v: PROTOKOL_VERSI, t: "pakai_skill", skill: "petunjuk", kejadianId: d.kejadianId })) return;
          aturDialog(baru);
          window.setTimeout(() => {
            const kini2 = dialogRef.current;
            if (kini2?.petunjuk?.menunggu === kini) aturDialog(aturPetunjuk(kini2, { menunggu: 0 }));
          }, TUNGGU_PETUNJUK_MS);
          return;
        }
        default:
          aturDialog(pindah(d, a.jenis, kini));
      }
    },
    [aturDialog, putar],
  );
  const periksa = useCallback(
    (kejadianId: string) => {
      if (!klien.current?.kirim({ v: PROTOKOL_VERSI, t: "periksa", kejadianId })) return;
      setMenungguPeriksa(true);
      if (pewaktuPeriksa.current !== null) window.clearTimeout(pewaktuPeriksa.current);
      // Tombol tampak ditekan sampai kejadian_terbuka tiba, paling lama 2 detik (P-24).
      pewaktuPeriksa.current = window.setTimeout(hentiMenunggu, 2000);
    },
    [hentiMenunggu],
  );
  const ringkasDialog = useCallback(
    (ringkas: boolean) => {
      const d = dialogRef.current;
      if (d) aturDialog(aturRingkas(d, ringkas));
    },
    [aturDialog],
  );
  useEffect(() => () => hentiMenunggu(), [hentiMenunggu]);
  useEffect(() => {
    jumlahPemainRef.current = Object.keys(pemain).length;
  }, [pemain]);

  const selisihJam = useCallback(() => klien.current?.selisihJamMs ?? 0, []);
  const kirimGerak = useCallback((p: Extract<PesanPemain, { t: "gerak" }>) => klien.current?.kirim(p) ?? false, []);
  // JS-18 (P-21): Angkot membawa `halteId` tujuan.
  const kirimSkill = useCallback(
    (skill: SkillId, halteId?: string) => klien.current?.kirim({ v: PROTOKOL_VERSI, t: "pakai_skill", skill, ...(halteId ? { halteId } : {}) }) ?? false,
    [],
  );
  const bufferedAmount = useCallback(() => klien.current?.bufferedAmount ?? 0, []);
  const diri = diriId ? pemain[diriId] : undefined;
  // JS-11 (P-7): di layar rekap, pita menggantikan lapisan menyambung ulang.
  const tampilMenyambung = koneksi === "menyambung_ulang" && terputusSejak !== null && LAYAR_BERSAMBUNG.includes(layar) && layar !== "ronde";

  const menuSuara = (kelas: string) => (
    <KelompokMenuSuara kelas={kelas} laptop={laptop} suara={atur.suara} saatMenu={() => bukaLembar("pengaturan")} saatSuara={balikSuara} />
  );

  let isi: ReactNode;
  switch (layar) {
    case "kode":
      isi = <LayarKode awal={kodeAwal} memeriksa={memeriksa} siap={asetSiap} galat={galatForm} saatKirim={kirimKode} saatPrivasi={() => bukaLembar("privasi")} saatMasukUlang={() => {
            setGalatForm(null);
            gantiLayar("masukUlang");
          }} />;
      break;
    case "masukUlang":
      isi = (
        <LayarMasukUlang
          awalRuang={kode || kodeAwal}
          memeriksa={memeriksa}
          galat={galatForm}
          saatKirim={(r, g) => void kirimMasukUlang(r, g)}
          saatKembali={() => {
            klien.current?.berhenti();
            klien.current = null;
            setGalatForm(null);
            gantiLayar("kode");
          }}
        />
      );
      break;
    case "absen":
      isi = <LayarAbsen galat={galatForm} saatKirim={kirimAbsen} />;
      break;
    case "menghubungkan":
      isi = <LayarMenghubungkan />;
      break;
    case "identitas":
      isi =
        modeNama === "bebas" ? (
          <LayarIdentitasBebas
            saran={saran}
            galat={galatForm}
            kaki={menuSuara("js-kaki-menu")}
            saatMintaNama={() => {
              setGalatForm(null);
              klien.current?.kirim({ v: PROTOKOL_VERSI, t: "minta_nama" });
            }}
            saatGabung={(nama, avatar) => {
              setGalatForm(null);
              klien.current?.kirim({ v: PROTOKOL_VERSI, t: "pilih_identitas", nama, avatar });
            }}
          />
        ) : (
        <LayarIdentitas
          kaki={menuSuara("js-kaki-menu")}
          saran={saran}
          pilihNama={pilihNama}
          pilihAvatar={pilihAvatar}
          galat={galatForm}
          saatPilihNama={setPilihNama}
          saatPilihAvatar={setPilihAvatar}
          saatAcak={() => {
            setGalatForm(null);
            klien.current?.kirim({ v: PROTOKOL_VERSI, t: "minta_nama" });
          }}
          saatGabung={() => {
            if (pilihNama === null || pilihAvatar === null) return;
            setGalatForm(null);
            klien.current?.kirim({ v: PROTOKOL_VERSI, t: "pilih_identitas", nama: pilihNama, avatar: pilihAvatar });
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
          kirimSkill={kirimSkill}
          bufferedAmount={bufferedAmount}
          umumkan={umumkan}
          skor={pribadi.skor}
          peringkat={pribadi.peringkat}
          dialog={dialog}
          ruangUji={ruangUji}
          menungguPeriksa={menungguPeriksa}
          saatDialog={aksiDialog}
          saatPeriksa={periksa}
          saatRingkas={ringkasDialog}
          menuTerbuka={lembar !== null}
          saatMenu={() => bukaLembar("pengaturan")}
          suara={atur.suara}
          saatSuara={balikSuara}
          labelHuruf={LABEL_HURUF[atur.label]}
          kurangiGerak={gerak.efektif}
          putarSuara={putar}
          ketik={atur.ketik}
          saatHurufKetik={hurufKetik}
        />
      );
      break;
    case "ronde":
      isi = (
        <LayarRekap
          akhir={akhir}
          rekap={rekap}
          uji={ruangUji}
          menyambung={koneksi === "menyambung_ulang" && rekapBerakhir === null}
          berakhir={rekapBerakhir}
          saatKembali={kembali}
          kepala={menuSuara("js-rekap-menu")}
        />
      );
      break;
    case "ditutup":
      isi = <LayarDitutup saatKembali={kembali} />;
      break;
    case "galat":
      isi = berhentiJenis ? <LayarBerhenti jenis={berhentiJenis} /> : <LayarGalat kode={galatTeks ? null : (galatKode ?? "VERSI_BERBEDA")} teks={galatTeks ?? undefined} saatKembali={kembali} />;
      break;
  }

  return (
    <>
      {isi}
      {layar === "dunia" && waktu.status === "jeda" ? <LapisanJeda /> : null}
      {tampilMenyambung ? <LapisanMenyambung sejak={terputusSejak} /> : null}
      {lembar === "pengaturan" ? (
        <PanelPengaturan
          p={atur}
          ubah={ubahAtur}
          gerakPerangkat={gerak.perangkat}
          saatSuara={aturSuara}
          tutup={tutupLembar}
          buka={(j) => {
            lembarDariMenu.current = true;
            setLembar(j);
          }}
          // JS-24 (P-4, DRAF D-3 pilihan a): panel tertutup begitu layar penuh dimulai; bila ditolak, panel tetap terbuka.
          saatLayarPenuh={() => void masukLayarPenuh(tutupLembar)}
        />
      ) : null}
      {lembar === "privasi" ? <PanelPrivasi tutup={tutupLembar} /> : null}
      {lembar === "tentang" ? <PanelTentang tutup={tutupLembar} /> : null}
      <div className="js-sr" aria-live="polite">
        {pengumuman}
      </div>
    </>
  );
}
