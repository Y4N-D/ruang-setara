// Layar kelas (spesifikasi JS-10, P-15 dan P-23 sampai P-31; musik latar JS-21): tampil tanpa kerangka konsol untuk proyektor. Tombol dan
// pintasan papan ketik mengendalikan ronde; konfirmasi Akhiri dan Tutup ruang tanpa nama siswa; status sambungan dan
// pengumuman untuk pembaca layar. Mengeluarkan pemain hanya di halaman detail ruang (usulan 5a).
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PROTOKOL_VERSI } from "../../inti/protokol";
import type { PesanKelas } from "../../inti/protokol-kelas";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import type { GalatApi } from "../api";
import Dialog from "../Dialog";
import { keHash } from "../rute";
import { IKON_KELAS } from "./ikon-kelas";
import { cariTombolNama, PanelPemain, TombolPemain, type AksiKelola } from "./KelolaNama";
import { bacaMusikKelas, bacaSuaraKelas, buatSuaraKelas, lewatDuaMenit, simpanMusikKelas, simpanSuaraKelas, type KeadaanMusik, type NamaSuaraKelas } from "./suara-kelas";
import Langsung, { useJamServer } from "./Langsung";
import Lobi, { KepalaKelas } from "./Lobi";
import Pembahasan from "./Pembahasan";
import Podium from "./Podium";
import { useSambunganKelas } from "./sambungan-kelas";
import { angkaHitungMundur, musikSeharusnya, sisaRonde } from "./tampilan-kelas";

const t = TEKS_KONSOL.kelas;
const V = PROTOKOL_VERSI;
const PENGUMUMAN: Partial<Record<string, string>> = { main: t.umumMulai, jeda: t.umumJeda, selesai: t.umumSelesai };
/** Pesan kelas tanpa amplop versi (distributif atas union). */
type TanpaV<T> = T extends unknown ? Omit<T, "v"> : never;

function Pesan({ teks, tombol }: { teks: string; tombol?: { label: string; aksi?: () => void; href?: string } }) {
  return (
    <div className="js-kelas-layar js-kelas-tengah">
      <p className="js-kelas-besar" role="status">
        {teks}
      </p>
      {tombol ? (
        tombol.href ? (
          <a className="js-kelas-tombol" href={tombol.href}>
            {tombol.label}
          </a>
        ) : (
          <button type="button" className="js-kelas-tombol js-kelas-tombol-utama" onClick={tombol.aksi}>
            {tombol.label}
          </button>
        )
      ) : null}
    </div>
  );
}

export default function LayarKelas({ ruangId, galatSesi }: { ruangId: string; galatSesi: (galat: GalatApi) => boolean }) {
  const { data, sambungan, kirim, ulangi } = useSambunganKelas(ruangId, galatSesi);
  const [konfirmasi, setKonfirmasi] = useState<"akhiri" | "tutup" | null>(null);
  const [indeks, setIndeks] = useState(0);
  const [umum, setUmum] = useState("");
  const [pembuka, setPembuka] = useState<HTMLElement | null>(null);
  const kartu = useRef<HTMLDivElement>(null);
  const jam = useJamServer(data.selisih);
  const status = data.status?.status ?? null;
  const info = data.info;
  const tas = useMemo(() => new Map([...data.lobi, ...(data.papan?.pemain ?? [])].map((p) => [p.id, p.warnaTas])), [data.lobi, data.papan]);

  // JS-14 (P-29 sampai P-31): suara layar kelas, bawaan nyala; konteks dibuat pada ketukan atau tombol di halaman ini.
  const [suara] = useState(() => buatSuaraKelas());
  const [suaraNyala, setSuaraNyala] = useState(bacaSuaraKelas);
  const [tertahan, setTertahan] = useState(false);
  const suaraRef = useRef(suaraNyala);
  useEffect(() => {
    suaraRef.current = suaraNyala;
  }, [suaraNyala]);
  useEffect(() => {
    const sentuh = () => {
      suara.sentuh();
      setTertahan(false);
    };
    window.addEventListener("pointerdown", sentuh, true);
    window.addEventListener("keydown", sentuh, true);
    return () => {
      window.removeEventListener("pointerdown", sentuh, true);
      window.removeEventListener("keydown", sentuh, true);
    };
  }, [suara]);
  const putarKelas = useCallback(
    (nama: NamaSuaraKelas) => {
      if (suaraRef.current && !suara.putar(nama)) setTertahan(true);
    },
    [suara],
  );
  const balikSuara = () => {
    const nyala = !suaraRef.current;
    suaraRef.current = nyala;
    setSuaraNyala(nyala);
    simpanSuaraKelas(nyala);
    suara.sentuh();
    setUmum(nyala ? t.umumSuaraNyala : t.umumSuaraMati);
  };

  // JS-21 (P-1 sampai P-16): musik latar di lobi dan selama ronde, dengan pilihan sendiri (tombol Musik dan U).
  const [musikNyala, setMusikNyala] = useState(bacaMusikKelas);
  const musikRef = useRef(musikNyala);
  const [keadaanMusik, setKeadaanMusik] = useState<KeadaanMusik>("diam");
  useEffect(() => suara.pantau(setKeadaanMusik), [suara]);
  useEffect(() => {
    suara.pilihMusik(musikNyala);
  }, [suara, musikNyala]);
  const inginMusik = musikSeharusnya({ status, sambungan, suaraNyala, musikNyala });
  // Keadaan musik datang lewat pantau(), karena konteks dan berkas berubah di luar React.
  useEffect(() => {
    suara.musik(inginMusik);
  }, [suara, inginMusik]);
  useEffect(
    () => () => {
      suara.musik(false);
    },
    [suara],
  );
  const balikMusik = () => {
    const nyala = !musikRef.current;
    musikRef.current = nyala;
    setMusikNyala(nyala);
    simpanMusikKelas(nyala);
    suara.sentuh();
    setUmum(nyala ? t.umumMusikNyala : t.umumMusikMati);
  };

  // JS-14 (P-53 sampai P-56): menu nama, konfirmasi keluarkan tanpa nama, panel Pemain, dan pita tanpa nama lama.
  const [menuNama, setMenuNama] = useState<string | null>(null);
  const [panelPemain, setPanelPemain] = useState<HTMLElement | null | false>(false);
  // JS-16b (P-9): lapisan Perbesar QR di lobi; tertutup sendiri saat ronde dimulai, lalu fokus kembali ke tombolnya.
  const [qrBesar, setQrBesar] = useState(false);
  const tombolQr = useRef<HTMLButtonElement>(null);
  const bukaTutupQr = useCallback(() => {
    setQrBesar((b) => {
      if (b) window.setTimeout(() => tombolQr.current?.focus(), 0);
      return !b;
    });
  }, []);
  useEffect(() => {
    if (status !== "lobi") setQrBesar(false);
  }, [status]);
  const [keluarkanPemain, setKeluarkanPemain] = useState<{ id: string; pembuka: HTMLElement | null } | null>(null);
  const [pita, setPita] = useState<string | null>(null);
  const waktuPita = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(waktuPita.current), []);
  const tampilPita = (teks: string) => {
    setPita(teks);
    setUmum(teks);
    window.clearTimeout(waktuPita.current);
    waktuPita.current = window.setTimeout(() => setPita(null), 3000);
  };

  const kirimPesan = (p: TanpaV<PesanKelas>) => kirim({ v: V, ...p } as PesanKelas);
  const minta = (i: number) => {
    const k = info?.kejadian[i];
    if (!k) return;
    setIndeks(i);
    if (!data.bahas[k.id] || status !== "pembahasan") kirimPesan({ t: "pembahasan", kejadianId: k.id });
  };
  const bukaKonfirmasi = (jenis: "akhiri" | "tutup") => {
    setPembuka(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setKonfirmasi(jenis);
  };
  const kelola: AksiKelola = {
    terbuka: menuNama,
    buka: setMenuNama,
    gantiNama: (id) => {
      kirimPesan({ t: "ganti_nama", pemainId: id });
      setMenuNama(null);
      tampilPita(t.okNama);
      window.setTimeout(() => cariTombolNama(id)?.focus(), 0);
    },
    keluarkan: (id) => {
      setMenuNama(null);
      setKeluarkanPemain({ id, pembuka: cariTombolNama(id) });
    },
  };
  const tombolPemain = <TombolPemain buka={(el) => setPanelPemain(el)} />;
  const aksi = {
    mulai: () => kirimPesan({ t: "mulai" }),
    jeda: () => kirimPesan({ t: "jeda" }),
    lanjut: () => kirimPesan({ t: "lanjut" }),
    tambah: () => {
      kirimPesan({ t: "tambah_waktu", detik: 120 });
      setUmum(t.umumTambah);
    },
    kunci: () => kirimPesan({ t: "kunci_ruang", kunci: !(info?.terkunci ?? false) }),
    layarPenuh: () => {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen?.();
    },
  };

  useEffect(() => {
    document.title = info ? isiTeks(t.judulTab, { kode: info.kode }) : t.menyambung;
  }, [info]);

  // Pengumuman status dan kunci untuk pembaca layar (P-31).
  const statusSebelum = useRef<string | null>(null);
  useEffect(() => {
    if (status && statusSebelum.current && status !== statusSebelum.current) {
      setUmum(status === "main" && statusSebelum.current === "jeda" ? t.umumLanjut : (PENGUMUMAN[status] ?? ""));
      // JS-14 (P-31): jingle akhir hanya saat perubahan ke `selesai` diamati langsung.
      if (status === "selesai" && (statusSebelum.current === "main" || statusSebelum.current === "jeda")) putarKelas("akhir");
    }
    statusSebelum.current = status;
  }, [status, putarKelas]);
  const kunciSebelum = useRef<boolean | null>(null);
  useEffect(() => {
    const k = info?.terkunci ?? null;
    if (k !== null && kunciSebelum.current !== null && k !== kunciSebelum.current) setUmum(k ? t.umumKunci : t.umumBuka);
    kunciSebelum.current = k;
  }, [info?.terkunci]);

  // JS-14 (P-31): bunyi setiap angka hitung mundur dan saat sisa waktu turun melewati dua menit.
  const angkaHitung = status === "hitung_mundur" && data.status?.mulaiPada != null ? angkaHitungMundur(data.status.mulaiPada, jam) : null;
  useEffect(() => {
    if (angkaHitung !== null) putarKelas("hitung");
  }, [angkaHitung, putarKelas]);
  const sisaDetik = status === "main" && data.status ? Math.ceil(sisaRonde(data.status.berakhirPada, data.status.jedaSejak, jam) / 1000) : null;
  const sisaSebelum = useRef<number | null>(null);
  useEffect(() => {
    if (sisaDetik !== null && lewatDuaMenit(sisaSebelum.current === null ? null : sisaSebelum.current * 1000, sisaDetik * 1000)) putarKelas("peringatan");
    sisaSebelum.current = sisaDetik;
  }, [sisaDetik, putarKelas]);

  // Data pembahasan diminta lagi sesudah tersambung ulang di tengah pembahasan.
  useEffect(() => {
    const k = info?.kejadian[indeks];
    if (status === "pembahasan" && k && !data.bahas[k.id]) kirim({ v: V, t: "pembahasan", kejadianId: k.id });
  }, [status, info, indeks, data.bahas, kirim]);

  // Pintasan papan ketik (P-30), diabaikan saat dialog terbuka atau fokus di isian. Dipasang ulang secara sinkron
  // sesudah setiap render (useLayoutEffect), agar penangan tidak pernah memakai keadaan lama, misalnya status kunci.
  useLayoutEffect(() => {
    const tekan = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const sasaran = e.target as HTMLElement | null;
      if (sasaran && /^(INPUT|TEXTAREA|SELECT)$/.test(sasaran.tagName)) return;
      const tombol = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      // JS-14 (P-29, P-56): M bekerja di mana saja; pintasan lain diabaikan selama menu, panel, atau konfirmasi terbuka.
      if (tombol === "m" && !e.repeat && status !== "ditutup") {
        e.preventDefault();
        balikSuara();
        return;
      }
      // JS-21 (P-10): U bekerja di mana saja seperti M.
      if (tombol === "u" && !e.repeat && status !== "ditutup") {
        e.preventDefault();
        balikMusik();
        return;
      }
      if (konfirmasi || keluarkanPemain || panelPemain !== false || menuNama) return;
      // JS-16b (P-9): selama lapisan Perbesar QR terbuka, hanya Q dan Esc yang bekerja (menutupnya).
      if (qrBesar) {
        if (tombol === "q" || tombol === "Escape") {
          e.preventDefault();
          bukaTutupQr();
        }
        return;
      }
      let ditangani = true;
      if (tombol === " ") {
        if (status === "lobi" && data.lobi.length > 0) aksi.mulai();
        else if (status === "main") aksi.jeda();
        else if (status === "jeda") aksi.lanjut();
        else ditangani = false;
      } else if (tombol === "t" && (status === "main" || status === "jeda")) aksi.tambah();
      else if (tombol === "a" && (status === "main" || status === "jeda")) bukaKonfirmasi("akhiri");
      else if (tombol === "l" && status !== null && status !== "ditutup") aksi.kunci();
      else if (tombol === "f") aksi.layarPenuh();
      else if (tombol === "q" && status === "lobi") bukaTutupQr();
      else if (tombol === "p" && status !== null && status !== "ditutup") setPanelPemain(document.activeElement instanceof HTMLElement ? document.activeElement : null);
      else if (tombol === "ArrowRight" && status === "selesai") minta(0);
      else if (tombol === "ArrowRight" && status === "pembahasan") minta(Math.min(indeks + 1, (info?.kejadian.length ?? 1) - 1));
      else if (tombol === "ArrowLeft" && status === "pembahasan") minta(Math.max(indeks - 1, 0));
      else if ((tombol === "ArrowDown" || tombol === "ArrowUp") && status === "pembahasan" && kartu.current) {
        kartu.current.scrollBy({ top: (tombol === "ArrowDown" ? 1 : -1) * kartu.current.clientHeight * 0.3 });
      } else ditangani = false;
      if (ditangani) e.preventDefault();
    };
    window.addEventListener("keydown", tekan);
    return () => window.removeEventListener("keydown", tekan);
  });

  let isi;
  if (sambungan === "ditutup" || status === "ditutup") isi = <Pesan teks={t.ditutup} tombol={{ label: t.keKonsol, href: `/admin/${keHash("ruang", ruangId)}` }} />;
  else if (sambungan === "diganti") isi = <Pesan teks={t.diganti} tombol={{ label: t.pakaiTabIni, aksi: ulangi }} />;
  else if (sambungan === "tidakAda") isi = <Pesan teks={t.tidakAda} tombol={{ label: t.keKonsol, href: "/admin/" }} />;
  else if (sambungan === "terputus") isi = <Pesan teks={t.terputus} tombol={{ label: t.cobaLagi, aksi: ulangi }} />;
  else if (!info || !data.status || !status) isi = <Pesan teks={t.menyambung} />;
  else if (status === "lobi") isi = <Lobi info={info} pemain={data.lobi} mulai={aksi.mulai} kunci={aksi.kunci} bisaMulai={data.lobi.length > 0} kelola={panelPemain === false ? kelola : { ...kelola, terbuka: null }} tombolPemain={tombolPemain} qrBesar={qrBesar} bukaTutupQr={bukaTutupQr} tombolQr={tombolQr} />;
  else if (status === "hitung_mundur") {
    isi = (
      <div className="js-kelas-layar">
        <KepalaKelas info={info} jumlah={data.lobi.length} />
        <div className="js-kelas-hitung" aria-live="assertive">
          {data.status.mulaiPada === null ? null : angkaHitungMundur(data.status.mulaiPada, jam)}
        </div>
      </div>
    );
  } else if (status === "main" || status === "jeda") {
    isi = (
      <Langsung
        status={data.status}
        papan={data.papan}
        kemajuan={data.kemajuan}
        dunia={data.dunia}
        tas={tas}
        selisih={data.selisih}
        jeda={aksi.jeda}
        lanjut={aksi.lanjut}
        tambah={aksi.tambah}
        akhiri={() => bukaKonfirmasi("akhiri")}
        tombolPemain={tombolPemain}
      />
    );
  } else if (status === "selesai") isi = <Podium info={info} papan={data.papan} bahas={() => minta(0)} tutup={() => bukaKonfirmasi("tutup")} tombolPemain={tombolPemain} />;
  else isi = <Pembahasan ref={kartu} info={info} indeks={indeks} bahas={data.bahas} pindah={(arah) => minta(indeks + arah)} tutup={() => bukaKonfirmasi("tutup")} tombolPemain={tombolPemain} />;

  return (
    <div className="js-kelas" data-musik={!musikNyala ? "mati" : keadaanMusik === "berbunyi" ? "berbunyi" : "diam"}>
      {sambungan === "menyambungUlang" ? (
        <p className="js-kelas-pita" role="status">
          {t.menyambungUlang}
        </p>
      ) : null}
      {pita ? (
        <p className="js-kelas-pita js-kelas-pita-kelola" role="status">
          {pita}
        </p>
      ) : null}
      {sambungan !== "ditutup" && status !== "ditutup" ? (
        // JS-21 (P-8): tombol Musik dan tombol suara dalam satu kelompok; tulisan tertahan di kiri keduanya.
        <div className="js-kelas-bunyi">
          {suaraNyala && (tertahan || keadaanMusik === "tertahan") ? <span className="js-kelas-suara-tertahan">{t.suaraTertahan}</span> : null}
          <button type="button" className="js-kelas-musik" aria-pressed={musikNyala} aria-label={musikNyala ? t.musikNyala : t.musikMati} aria-keyshortcuts="U" onClick={balikMusik}>
            {t.musik}
          </button>
          <button type="button" className="js-kelas-suara" aria-pressed={suaraNyala} aria-label={suaraNyala ? t.suaraNyala : t.suaraMati} aria-keyshortcuts="M" onClick={balikSuara}>
            {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
            <img src={suaraNyala ? IKON_KELAS.suaraNyala : IKON_KELAS.suaraMati} alt="" />
          </button>
        </div>
      ) : null}
      <button type="button" className="js-kelas-layar-penuh" onClick={aksi.layarPenuh} aria-label={t.layarPenuh} title={t.layarPenuh}>
        {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
        <img src={IKON_KELAS.layarPenuh} alt="" />
      </button>
      {isi}
      <p className="js-sr" aria-live="polite">
        {umum}
      </p>
      {panelPemain !== false ? (
        <PanelPemain
          pemain={data.lobi}
          kelola={kelola}
          pembuka={panelPemain}
          tutup={() => {
            setMenuNama(null);
            setPanelPemain(false);
          }}
        />
      ) : null}
      {keluarkanPemain ? (
        <Dialog judul={t.keluarkanPemainJudul} tutup={() => setKeluarkanPemain(null)} kembaliKe={keluarkanPemain.pembuka}>
          <p>{t.keluarkanPemainIsi}</p>
          <div className="js-konsol-tombol-baris">
            <button type="button" className="js-konsol-tombol" data-fokus-awal onClick={() => setKeluarkanPemain(null)}>
              {t.menuBatal}
            </button>
            <button
              type="button"
              className="js-konsol-tombol js-konsol-tombol-bahaya"
              onClick={() => {
                kirimPesan({ t: "keluarkan", pemainId: keluarkanPemain.id });
                setKeluarkanPemain(null);
                tampilPita(t.okKeluar);
              }}
            >
              {t.menuKeluarkan}
            </button>
          </div>
        </Dialog>
      ) : null}
      {konfirmasi ? (
        <Dialog judul={konfirmasi === "akhiri" ? t.akhiriJudul : isiTeks(t.tutupJudul, { kode: info?.kode ?? "" })} tutup={() => setKonfirmasi(null)} kembaliKe={pembuka}>
          <p>{konfirmasi === "akhiri" ? t.akhiriIsi : t.tutupIsi}</p>
          <div className="js-konsol-tombol-baris">
            <button type="button" className="js-konsol-tombol" data-fokus-awal onClick={() => setKonfirmasi(null)}>
              {t.batal}
            </button>
            <button
              type="button"
              className="js-konsol-tombol js-konsol-tombol-bahaya"
              onClick={() => {
                kirimPesan(konfirmasi === "akhiri" ? { t: "akhiri" } : { t: "tutup_ruang" });
                setKonfirmasi(null);
              }}
            >
              {konfirmasi === "akhiri" ? t.akhiri : t.tutupRuang}
            </button>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
