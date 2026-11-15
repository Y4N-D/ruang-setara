// Layar kelas (spesifikasi JS-10, P-15 dan P-23 sampai P-31): tampil tanpa kerangka konsol untuk proyektor. Tombol dan
// pintasan papan ketik mengendalikan ronde; konfirmasi Akhiri dan Tutup ruang tanpa nama siswa; status sambungan dan
// pengumuman untuk pembaca layar. Mengeluarkan pemain hanya di halaman detail ruang (usulan 5a).
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PROTOKOL_VERSI } from "../../inti/protokol";
import type { PesanKelas } from "../../inti/protokol-kelas";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import type { GalatApi } from "../api";
import Dialog from "../Dialog";
import { keHash } from "../rute";
import { IKON_KELAS } from "./ikon-kelas";
import Langsung, { useJamServer } from "./Langsung";
import Lobi, { KepalaKelas } from "./Lobi";
import Pembahasan from "./Pembahasan";
import Podium from "./Podium";
import { useSambunganKelas } from "./sambungan-kelas";
import { angkaHitungMundur } from "./tampilan-kelas";

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
    }
    statusSebelum.current = status;
  }, [status]);
  const kunciSebelum = useRef<boolean | null>(null);
  useEffect(() => {
    const k = info?.terkunci ?? null;
    if (k !== null && kunciSebelum.current !== null && k !== kunciSebelum.current) setUmum(k ? t.umumKunci : t.umumBuka);
    kunciSebelum.current = k;
  }, [info?.terkunci]);

  // Data pembahasan diminta lagi sesudah tersambung ulang di tengah pembahasan.
  useEffect(() => {
    const k = info?.kejadian[indeks];
    if (status === "pembahasan" && k && !data.bahas[k.id]) kirim({ v: V, t: "pembahasan", kejadianId: k.id });
  }, [status, info, indeks, data.bahas, kirim]);

  // Pintasan papan ketik (P-30), diabaikan saat dialog terbuka atau fokus di isian. Dipasang ulang secara sinkron
  // sesudah setiap render (useLayoutEffect), agar penangan tidak pernah memakai keadaan lama, misalnya status kunci.
  useLayoutEffect(() => {
    const tekan = (e: KeyboardEvent) => {
      if (konfirmasi || e.ctrlKey || e.metaKey || e.altKey) return;
      const sasaran = e.target as HTMLElement | null;
      if (sasaran && /^(INPUT|TEXTAREA|SELECT)$/.test(sasaran.tagName)) return;
      const tombol = e.key.length === 1 ? e.key.toLowerCase() : e.key;
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
  else if (status === "lobi") isi = <Lobi info={info} pemain={data.lobi} mulai={aksi.mulai} kunci={aksi.kunci} bisaMulai={data.lobi.length > 0} />;
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
      />
    );
  } else if (status === "selesai") isi = <Podium info={info} papan={data.papan} bahas={() => minta(0)} tutup={() => bukaKonfirmasi("tutup")} />;
  else isi = <Pembahasan ref={kartu} info={info} indeks={indeks} bahas={data.bahas} pindah={(arah) => minta(indeks + arah)} tutup={() => bukaKonfirmasi("tutup")} />;

  return (
    <div className="js-kelas">
      {sambungan === "menyambungUlang" ? (
        <p className="js-kelas-pita" role="status">
          {t.menyambungUlang}
        </p>
      ) : null}
      <button type="button" className="js-kelas-layar-penuh" onClick={aksi.layarPenuh} aria-label={t.layarPenuh} title={t.layarPenuh}>
        {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
        <img src={IKON_KELAS.layarPenuh} alt="" />
      </button>
      {isi}
      <p className="js-sr" aria-live="polite">
        {umum}
      </p>
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
