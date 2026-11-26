// Halaman detail ruang (spesifikasi JS-10, P-8 sampai P-10): kode, tautan, status, pemain yang dimuat ulang setiap 10
// detik selama halaman tampil, kunci, keluarkan (dengan konfirmasi), tutup, dan tautan ke layar kelas. Mengeluarkan
// pemain dilakukan di sini, bukan di proyektor (usulan 5a). Sejak JS-11 (P-19, P-20, P-25, P-32): bagian hasil ronde
// untuk ruang `selesai`, `pembahasan`, dan `ditutup`, tautan "← Riwayat ruang", dan hapus data ruang (admin).
import { useCallback, useEffect, useState } from "react";
import type { Saya } from "../../inti/akun";
import {
  KUOTA_BULANAN_BERBAYAR,
  STATUS_BOLEH_TUTUP,
  STATUS_HASIL,
  type AksiKelola,
  type DetailRuang as DataDetail,
  type PemakaianRuang,
} from "../../inti/ruang";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, type GalatApi } from "../api";
import Dialog from "../Dialog";
import { PesanGalat } from "../Formulir";
import { AVATAR } from "../kelas/ikon-kelas";
import { keHash } from "../rute";
import { BagianHapus, BagianHasil } from "./HasilRuang";
import { TautanLayar, teksSkill } from "./Ruang";

const t = TEKS_KONSOL.detail;
const FORMAT_JAM = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const FORMAT_JAM_MENIT = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" });
/** JS-16b (P-11): sisa masa berlaku kode masuk ulang sebagai menit:detik. */
export function formatSisa(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
const FORMAT_ANGKA = new Intl.NumberFormat("id-ID");
const FORMAT_PERSEN = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** Muat ulang daftar pemain selama halaman tampil (P-9). */
export const MUAT_ULANG_DETAIL_MS = 10_000;

type Muatan = { jenis: "memuat" } | { jenis: "gagal" } | { jenis: "tidakAda" } | { jenis: "ada"; data: DataDetail; pada: number };
type Konfirmasi = { jenis: "keluarkan"; pemainId: string; nama: string } | { jenis: "tutup" } | { jenis: "gantiSemua" } | null;

interface PropsDetail {
  id: string;
  akun: Saya;
  galatSesi: (galat: GalatApi) => boolean;
  umumkan: (pesan: string) => void;
  /** JS-11 (P-32): pindah halaman sesudah data ruang dihapus. */
  buka: (hash: string, pesan?: string) => void;
}

export default function DetailRuang({ id, akun, galatSesi, umumkan, buka: bukaHalaman }: PropsDetail) {
  const [muatan, setMuatan] = useState<Muatan>({ jenis: "memuat" });
  const [konfirmasi, setKonfirmasi] = useState<Konfirmasi>(null);
  const [galatAksi, setGalatAksi] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [pembuka, setPembuka] = useState<HTMLElement | null>(null);
  const [putaran, setPutaran] = useState(0);
  /** JS-11 (P-25): hasil dimuat lagi sesudah "Keluarkan" berhasil. */
  const [keluarkanKe, setKeluarkanKe] = useState(0);
  const muat = useCallback(() => setPutaran((p) => p + 1), []);
  /** JS-16b (P-11): kode masuk ulang yang sedang ditampilkan, dengan hitung mundur setiap detik. */
  const [kodeUlang, setKodeUlang] = useState<{ nama: string; kode: string; berlakuSampai: number } | null>(null);
  const [kini, setKini] = useState(() => Date.now());
  useEffect(() => {
    if (!kodeUlang) return;
    const pewaktu = window.setInterval(() => setKini(Date.now()), 1000);
    return () => window.clearInterval(pewaktu);
  }, [kodeUlang]);

  useEffect(() => {
    let aktif = true;
    api.detailRuang(id).then((h) => {
      if (!aktif) return;
      if (h.ok) setMuatan({ jenis: "ada", data: h.data, pada: Date.now() });
      else if (galatSesi(h)) return;
      else if (h.status === 404) setMuatan({ jenis: "tidakAda" });
      else setMuatan((m) => (m.jenis === "ada" ? m : { jenis: "gagal" }));
    });
    return () => {
      aktif = false;
    };
  }, [id, galatSesi, putaran]);

  useEffect(() => {
    const pewaktu = setInterval(() => {
      if (document.visibilityState === "visible") setPutaran((p) => p + 1);
    }, MUAT_ULANG_DETAIL_MS);
    const lihat = () => {
      if (document.visibilityState === "visible") setPutaran((p) => p + 1);
    };
    document.addEventListener("visibilitychange", lihat);
    return () => {
      clearInterval(pewaktu);
      document.removeEventListener("visibilitychange", lihat);
    };
  }, []);

  async function aksi(a: AksiKelola, pesanOk: string, pemainId?: string) {
    setSibuk(true);
    const h = await api.kelolaRuang(id, a, pemainId);
    setSibuk(false);
    setKonfirmasi(null);
    if (h.ok) {
      setGalatAksi(null);
      umumkan(pesanOk);
      if (a === "keluarkan") setKeluarkanKe((n) => n + 1);
      muat();
    } else if (!galatSesi(h)) setGalatAksi(h.pesan);
  }

  // JS-14 (P-51, P-52): ganti nama satu pemain tanpa konfirmasi, dan ganti semua nama buatan siswa sesudah konfirmasi.
  async function kelolaNama(a: "ganti_nama" | "ganti_semua_nama", pemainId?: string) {
    setSibuk(true);
    const h = await api.kelolaNama(id, a, pemainId);
    setSibuk(false);
    setKonfirmasi(null);
    if (h.ok) {
      setGalatAksi(null);
      umumkan(a === "ganti_nama" ? isiTeks(t.okGantiNama, { nama: h.data.nama ?? "" }) : isiTeks(t.okGantiSemua, { n: h.data.jumlah ?? 0 }));
      muat();
    } else if (!galatSesi(h)) setGalatAksi(h.pesan);
  }

  // JS-16b (P-11, P-12): membuat kode masuk ulang untuk satu pemain; kodenya hanya tampil di dialog ini.
  async function buatKodeUlang(pemainId: string, nama: string) {
    setSibuk(true);
    const h = await api.kodeMasukUlang(id, pemainId);
    setSibuk(false);
    if (h.ok) {
      setGalatAksi(null);
      // JS-23 (P-20): waktu sekarang diisi bersama kode, bukan di dalam efek pewaktu.
      setKini(Date.now());
      setKodeUlang({ nama, kode: h.data.kode, berlakuSampai: h.data.berlakuSampai });
    } else if (!galatSesi(h)) setGalatAksi(t.kodeMasukUlangGagal);
  }

  if (muatan.jenis === "memuat") return <p role="status">{t.memuat}</p>;
  if (muatan.jenis === "tidakAda") {
    return (
      <div className="js-konsol-tumpuk">
        <p role="alert">{t.tidakAda}</p>
        <a className="js-konsol-tombol" href={keHash("ruang")}>
          {t.kembali}
        </a>
      </div>
    );
  }
  if (muatan.jenis === "gagal") {
    return (
      <div className="js-konsol-tumpuk">
        <p role="alert">{t.gagal}</p>
        <button type="button" className="js-konsol-tombol" onClick={muat}>
          {TEKS_KONSOL.dasbor.cobaLagi}
        </button>
      </div>
    );
  }

  const { ruang, langsung } = muatan.data;
  const pemakaian = muatan.data.pemakaian ?? null;
  const status = langsung?.status ?? ruang.status;
  const ditutup = status === "ditutup";
  // JS-14 (P-33, P-52): mode nama yang berlaku sekarang dari Durable Object, atau mode awal dari pengaturan ruang.
  const modeBebas = (langsung?.modeNama ?? ruang.modeNama ?? "daftar") === "bebas";
  const bolehTutup = STATUS_BOLEH_TUTUP.includes(status);
  const terkunci = langsung?.terkunci ?? false;
  const pemain = langsung?.pemain ?? [];
  const buka = (k: Konfirmasi) => (e: { currentTarget: HTMLElement }) => {
    setPembuka(e.currentTarget);
    setKonfirmasi(k);
  };
  // JS-11 (P-15, P-20, P-25): bagian hasil; ruang yang belum ditutup memuat hasil lagi bila status berubah, sesudah
  // "Keluarkan", dan pada setiap muat ulang 10 detik selama kiriman ke D1 masih tertunda. Ruang ditutup: sekali.
  const adaHasil = STATUS_HASIL.includes(status);
  const menyimpan = !ditutup && adaHasil && langsung?.kirimanTertunda === true;
  const kunciHasil = ditutup ? "ditutup" : `${status}:${keluarkanKe}:${menyimpan ? muatan.pada : ""}`;
  const hasil = adaHasil ? <BagianHasil id={ruang.id} kunci={kunciHasil} menyimpan={menyimpan} galatSesi={galatSesi} hilang={muat} /> : null;

  return (
    <>
      <p>{ditutup ? <a href={keHash("ruang", "riwayat")}>{TEKS_KONSOL.hasil.kembaliRiwayat}</a> : <a href={keHash("ruang")}>{t.kembali}</a>}</p>
      <section className="js-bingkai js-ruang-kepala" aria-label={ruang.labelKelas}>
        <h2>{ruang.labelKelas}</h2>
        <p className="js-konsol-label">{t.kode}</p>
        <p className="js-ruang-kode js-ruang-kode-besar">{ruang.kode}</p>
        {langsung ? (
          <p>
            <span className="js-konsol-label">{t.tautan}</span> {langsung.tautan}
          </p>
        ) : null}
        {/* JS-09 (P-9): skill yang aktif di ruang ini. */}
        <p data-baris="skill">
          <span className="js-konsol-label">{TEKS_KONSOL.skill.judul}</span> {teksSkill(ruang.skillAktif)}
        </p>
        {/* JS-14 (P-33): mode nama yang berlaku sekarang. */}
        <p data-baris="nama">
          <span className="js-konsol-label">{t.namaPemain}</span> {modeBebas ? TEKS_KONSOL.ruangBaru.namaBebas : TEKS_KONSOL.ruangBaru.namaDaftar}
        </p>
        <div className="js-konsol-sel-label">
          <span className="js-konsol-tanda">{TEKS_KONSOL.status[status]}</span>
          {terkunci ? <span className="js-konsol-tanda js-konsol-tanda-belum">{t.terkunci}</span> : null}
          {ruang.uji ? <span className="js-konsol-tanda js-konsol-tanda-belum">{TEKS_KONSOL.ruang.uji}</span> : null}
        </div>
      </section>
      {langsung?.kirimanBerhenti ? <PesanGalat pesan={t.kirimanGagal} /> : null}
      {ditutup ? (
        <>
          <p role="status">{t.ditutup}</p>
          {hasil}
        </>
      ) : (
        <>
          <div className="js-konsol-tombol-baris js-ruang-aksi">
            <TautanLayar id={ruang.id} />
            <button type="button" className="js-konsol-tombol" disabled={sibuk} onClick={() => void aksi(terkunci ? "buka_kunci" : "kunci", terkunci ? t.okBuka : t.okKunci)}>
              {terkunci ? t.bukaKunci : t.kunci}
            </button>
            <button type="button" className="js-konsol-tombol" disabled={sibuk || !bolehTutup} aria-describedby={bolehTutup ? undefined : "js-ruang-tutup-ket"} onClick={buka({ jenis: "tutup" })}>
              {t.tutup}
            </button>
          </div>
          {bolehTutup ? null : (
            <p id="js-ruang-tutup-ket" className="js-konsol-petunjuk">
              {t.tutupTidakBisa}
            </p>
          )}
          <PesanGalat pesan={galatAksi} />
          {hasil}
          <section className="js-ruang-pemain" aria-labelledby="js-ruang-pemain-judul">
            <h2 id="js-ruang-pemain-judul">{isiTeks(t.pemainJudul, { n: pemain.length })}</h2>
            {modeBebas && !ditutup ? (
              <div className="js-konsol-tombol-baris">
                <button type="button" className="js-konsol-tombol" disabled={sibuk} onClick={buka({ jenis: "gantiSemua" })}>
                  {t.gantiSemua}
                </button>
              </div>
            ) : null}
            {pemain.length === 0 ? (
              <p>{t.pemainKosong}</p>
            ) : (
              <ul>
                {pemain.map((p) => (
                  <li key={p.id} data-terhubung={p.terhubung ? "ya" : "tidak"}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
                    <img src={AVATAR[p.avatar] ?? AVATAR[0]} alt="" width={32} height={32} />
                    <span className="js-ruang-nama">{p.nama}</span>
                    <span className="js-konsol-tanda">{p.terhubung ? t.terhubung : t.terputus}</span>
                    <button type="button" className="js-konsol-tombol" aria-label={isiTeks(t.gantiNamaLabel, { nama: p.nama })} disabled={sibuk} onClick={() => void kelolaNama("ganti_nama", p.id)}>
                      {t.gantiNama}
                    </button>
                    <button
                      type="button"
                      className="js-konsol-tombol"
                      aria-label={isiTeks(t.kodeMasukUlangLabel, { nama: p.nama })}
                      disabled={sibuk}
                      onClick={(e) => {
                        setPembuka(e.currentTarget);
                        void buatKodeUlang(p.id, p.nama);
                      }}
                    >
                      {t.kodeMasukUlang}
                    </button>
                    <button type="button" className="js-konsol-tombol" aria-label={isiTeks(t.keluarkanLabel, { nama: p.nama })} disabled={sibuk} onClick={buka({ jenis: "keluarkan", pemainId: p.id, nama: p.nama })}>
                      {t.keluarkan}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <p className="js-konsol-petunjuk">{isiTeks(t.diperbarui, { jam: FORMAT_JAM.format(muatan.pada) })}</p>
        </>
      )}
      {pemakaian ? <BagianPemakaian p={pemakaian} /> : null}
      {ditutup && akun.peran === "admin" ? <BagianHapus ruang={ruang} galatSesi={galatSesi} buka={bukaHalaman} /> : null}
      {kodeUlang ? (
        <Dialog judul={isiTeks(t.kodeMasukUlangJudul, { nama: kodeUlang.nama })} tutup={() => setKodeUlang(null)} kembaliKe={pembuka}>
          {kodeUlang.berlakuSampai > kini ? (
            <>
              <p className="js-konsol-kode-ulang">{kodeUlang.kode}</p>
              <p>{isiTeks(t.kodeMasukUlangPetunjuk, { kodeRuang: ruang.kode })}</p>
              <p role="status">{isiTeks(t.kodeMasukUlangBerlaku, { jam: FORMAT_JAM_MENIT.format(kodeUlang.berlakuSampai), sisa: formatSisa(kodeUlang.berlakuSampai - kini) })}</p>
            </>
          ) : (
            <p role="status">{t.kodeMasukUlangHabis}</p>
          )}
          <div className="js-konsol-tombol-baris">
            {kodeUlang.berlakuSampai > kini ? (
              <button
                type="button"
                className="js-konsol-tombol"
                onClick={() => {
                  void navigator.clipboard?.writeText(kodeUlang.kode).then(() => umumkan(t.kodeMasukUlangTersalin), () => undefined);
                }}
              >
                {t.kodeMasukUlangSalin}
              </button>
            ) : null}
            <button type="button" className="js-konsol-tombol js-konsol-tombol-utama" data-fokus-awal onClick={() => setKodeUlang(null)}>
              {t.kodeMasukUlangTutup}
            </button>
          </div>
        </Dialog>
      ) : null}
      {konfirmasi ? (
        <Dialog
          judul={
            konfirmasi.jenis === "tutup" ? isiTeks(t.tutupJudul, { kode: ruang.kode }) : konfirmasi.jenis === "gantiSemua" ? t.gantiSemuaJudul : isiTeks(t.keluarkanJudul, { nama: konfirmasi.nama })
          }
          tutup={sibuk ? null : () => setKonfirmasi(null)}
          kembaliKe={pembuka}
        >
          <p>{konfirmasi.jenis === "tutup" ? t.tutupIsi : konfirmasi.jenis === "gantiSemua" ? t.gantiSemuaIsi : isiTeks(t.keluarkanIsi, { nama: konfirmasi.nama })}</p>
          <div className="js-konsol-tombol-baris">
            <button type="button" className="js-konsol-tombol" data-fokus-awal onClick={() => setKonfirmasi(null)} disabled={sibuk}>
              {TEKS_KONSOL.batal}
            </button>
            <button
              type="button"
              className="js-konsol-tombol js-konsol-tombol-bahaya"
              disabled={sibuk}
              onClick={() =>
                void (konfirmasi.jenis === "tutup"
                  ? aksi("tutup", isiTeks(t.okTutup, { kode: ruang.kode }))
                  : konfirmasi.jenis === "gantiSemua"
                    ? kelolaNama("ganti_semua_nama")
                    : aksi("keluarkan", isiTeks(t.okKeluarkan, { nama: konfirmasi.nama }), konfirmasi.pemainId))
              }
            >
              {konfirmasi.jenis === "tutup" ? t.tutup : konfirmasi.jenis === "gantiSemua" ? t.gantiSemuaTombol : t.keluarkan}
            </button>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}

/**
 * JS-22 (P-17): pemakaian ronde untuk admin. Sejak JS-15 persennya dari kuota bulanan Workers Paid (D-1 a), dan ada
 * median, p95, serta sampel waktu pulang-pergi HP (P-29).
 */
function BagianPemakaian({ p }: { p: PemakaianRuang }) {
  const persen = (n: number, kuota: number) => isiTeks(t.pemakaianNilai, { n: FORMAT_ANGKA.format(n), p: FORMAT_PERSEN.format((n * 100) / kuota) });
  const ms = (n: number | null | undefined) => (n === null || n === undefined ? t.pemakaianKosong : isiTeks(t.pemakaianMs, { n: FORMAT_ANGKA.format(n) }));
  const baris: [string, string][] = [
    [t.pemakaianPermintaan, persen(p.perkiraanPermintaan, KUOTA_BULANAN_BERBAYAR.permintaan)],
    [t.pemakaianD1, persen(p.barisD1, KUOTA_BULANAN_BERBAYAR.barisDitulis)],
    [t.pemakaianSqlite, persen(p.barisSqlite, KUOTA_BULANAN_BERBAYAR.barisDitulis)],
    [t.pemakaianSambungan, FORMAT_ANGKA.format(p.sambungan)],
    [t.pemakaianAlarm, FORMAT_ANGKA.format(p.alarm)],
    [t.pemakaianRttMedian, ms(p.rttMedianMs)],
    [t.pemakaianRttP95, ms(p.rttP95Ms)],
    [t.pemakaianRttSampel, FORMAT_ANGKA.format(p.rttSampel ?? 0)],
  ];
  return (
    <section className="js-ruang-pemakaian" aria-labelledby="js-ruang-pemakaian-judul">
      <h2 id="js-ruang-pemakaian-judul">{t.pemakaianJudul}</h2>
      <table className="js-konsol-tabel">
        <tbody>
          {baris.map(([label, isi]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{isi}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="js-konsol-petunjuk">{t.pemakaianCatatan}</p>
    </section>
  );
}
