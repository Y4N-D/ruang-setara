// Halaman Ruang (spesifikasi JS-10, P-2, P-6, P-7): daftar ruang yang belum ditutup dan dialog "Ruang baru". Sejak JS-11
// (P-16): tab "Berjalan" (halaman ini) dan "Riwayat" (RiwayatRuang.tsx). JS-09 (P-7, P-9): kelompok "Skill" di dialog
// Ruang baru, dan teks daftar skill aktif untuk halaman ruang dan hasil.
import { useEffect, useId, useState, type FormEvent } from "react";
import type { Saya } from "../../inti/akun";
import { SKILL_P0, type SkillP0 } from "../../inti/aturan";
import {
  BATAS_PEMAIN,
  BATAS_TERLAMBAT,
  DURASI_BAWAAN,
  DURASI_RUANG,
  NOMOR_ABSEN_PEMAIN_MAKS,
  periksaRuangBaru,
  skemaRuangLama,
  type DurasiRuang,
  type GalatIsianRuang,
  type PilihanRuang,
  type RingkasanRuang,
} from "../../inti/ruang";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, useMuat, type GalatApi } from "../api";
import Dialog from "../Dialog";
import { Kolom, PesanGalat, PesanInfo } from "../Formulir";
import { IKON_SKILL } from "../kelas/ikon-kelas";
import { keHash } from "../rute";

const t = TEKS_KONSOL.ruang;
const tb = TEKS_KONSOL.ruangBaru;
const ts = TEKS_KONSOL.skill;

/** JS-09 (P-9): nama skill yang aktif dipisah koma menurut urutan P-1, atau "Tidak ada". */
export function teksSkill(skillAktif: readonly SkillP0[]): string {
  return skillAktif.length > 0 ? SKILL_P0.filter((s) => skillAktif.includes(s)).map((s) => ts[s]).join(", ") : ts.tidakAda;
}
export const FORMAT_WAKTU_RUANG = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** JS-11 (P-16): dua bagian halaman Ruang; tab aktif bertanda aria-current="page". */
export function TabRuang({ aktif }: { aktif: "berjalan" | "riwayat" }) {
  const tr = TEKS_KONSOL.riwayatRuang;
  return (
    <nav className="js-ruang-tab" aria-label={tr.bagian}>
      <a href={keHash("ruang")} aria-current={aktif === "berjalan" ? "page" : undefined}>
        {tr.tabBerjalan}
      </a>
      <a href={keHash("ruang", "riwayat")} aria-current={aktif === "riwayat" ? "page" : undefined}>
        {tr.tabRiwayat}
      </a>
    </nav>
  );
}

/** Tautan biasa ke layar kelas di tab baru (bukan window.open, agar tidak diblokir peramban; P-9). */
export function TautanLayar({ id }: { id: string }) {
  return (
    <a className="js-konsol-tombol" href={`/admin/${keHash("kelas", id)}`} target="_blank" rel="noopener">
      {t.bukaLayar}
    </a>
  );
}

interface PropsRuang {
  akun: Saya;
  galatSesi: (galat: GalatApi) => boolean;
  bukaRuang: (id: string, pesan?: string) => void;
}

export default function Ruang({ akun, galatSesi, bukaRuang }: PropsRuang) {
  const { muatan, muatUlang } = useMuat(api.daftarRuang, galatSesi);
  const [dialog, setDialog] = useState(false);
  const [pembuka, setPembuka] = useState<HTMLElement | null>(null);
  if (muatan.jenis === "memuat") {
    return (
      <>
        <TabRuang aktif="berjalan" />
        <p role="status">{t.memuat}</p>
      </>
    );
  }
  if (muatan.jenis === "gagal") {
    return (
      <>
        <TabRuang aktif="berjalan" />
        <div className="js-konsol-tumpuk">
          <p role="alert">{t.gagal}</p>
          <button type="button" className="js-konsol-tombol" onClick={muatUlang}>
            {TEKS_KONSOL.dasbor.cobaLagi}
          </button>
        </div>
      </>
    );
  }
  const daftar = muatan.data.ruang;
  const admin = akun.peran === "admin";
  return (
    <>
      <TabRuang aktif="berjalan" />
      <div className="js-konsol-baris-atas">
        <p>{isiTeks(t.ringkasan, { n: daftar.length })}</p>
        <button
          type="button"
          className="js-konsol-tombol js-konsol-tombol-utama"
          onClick={(e) => {
            setPembuka(e.currentTarget);
            setDialog(true);
          }}
        >
          {t.baru}
        </button>
      </div>
      {daftar.length === 0 ? (
        <p>{t.kosong}</p>
      ) : (
        <div className="js-konsol-gulung">
          <table className="js-konsol-tabel js-ruang-tabel">
            <thead>
              <tr>
                <th scope="col">{t.kolomKode}</th>
                <th scope="col">{t.kolomKelas}</th>
                <th scope="col">{t.kolomStatus}</th>
                <th scope="col">{t.kolomPemain}</th>
                {admin ? <th scope="col">{t.kolomGuru}</th> : null}
                <th scope="col">{t.kolomDibuat}</th>
                <th scope="col">
                  <span className="js-sr">{t.detail}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((r) => (
                <BarisRuang key={r.id} r={r} admin={admin} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {dialog ? (
        <DialogRuangBaru
          tutup={() => setDialog(false)}
          kembaliKe={pembuka}
          galatSesi={galatSesi}
          berhasil={(r) => {
            setDialog(false);
            bukaRuang(r.id, isiTeks(tb.berhasil, { kode: r.kode }));
          }}
          bukaRuang={(id) => {
            setDialog(false);
            bukaRuang(id);
          }}
        />
      ) : null}
    </>
  );
}

function BarisRuang({ r, admin }: { r: RingkasanRuang; admin: boolean }) {
  return (
    <tr>
      <td>
        <span className="js-ruang-kode">{r.kode}</span>
      </td>
      <td>
        <div className="js-konsol-sel-label">
          <span>{r.labelKelas}</span>
          {r.uji ? <span className="js-konsol-tanda js-konsol-tanda-belum">{t.uji}</span> : null}
        </div>
      </td>
      <td>{TEKS_KONSOL.status[r.status]}</td>
      <td>
        <span className="js-konsol-angka-kecil">{isiTeks(t.pemain, { n: r.jumlahPeserta, m: r.batasPemain })}</span>
      </td>
      {admin ? <td>{r.namaGuru ?? "—"}</td> : null}
      <td>{FORMAT_WAKTU_RUANG.format(r.dibuatPada)}</td>
      <td>
        <div className="js-konsol-sel-aksi">
          <a className="js-konsol-tombol" href={keHash("ruang", r.id)}>
            {t.detail}
          </a>
          <TautanLayar id={r.id} />
        </div>
      </td>
    </tr>
  );
}

interface PropsDialog {
  tutup: () => void;
  kembaliKe: HTMLElement | null;
  galatSesi: (galat: GalatApi) => boolean;
  berhasil: (ruang: RingkasanRuang) => void;
  bukaRuang: (id: string) => void;
}

const PESAN_ISIAN: Record<GalatIsianRuang, string> = {
  label: tb.galatLabel,
  batasPemain: tb.galatBatasPemain,
  terlambat: tb.galatTerlambat,
  nomorAbsen: tb.galatNomorAbsen,
};

function DialogRuangBaru({ tutup, kembaliKe, galatSesi, berhasil, bukaRuang }: PropsDialog) {
  const [pilihan, setPilihan] = useState<PilihanRuang["paket"] | null>(null);
  const [gagalMuat, setGagalMuat] = useState(false);
  const [label, setLabel] = useState("");
  const [paketId, setPaketId] = useState("");
  const [durasi, setDurasi] = useState<DurasiRuang>(DURASI_BAWAAN);
  const [batas, setBatas] = useState(String(BATAS_PEMAIN.bawaan));
  const [terlambat, setTerlambat] = useState(String(BATAS_TERLAMBAT.bawaan));
  const [absen, setAbsen] = useState(false);
  const [uji, setUji] = useState(true);
  // JS-09 (P-7): ketiga skill tercentang setiap kali dialog dibuka.
  const [skill, setSkill] = useState<SkillP0[]>([...SKILL_P0]);
  const [galat, setGalat] = useState<GalatIsianRuang[]>([]);
  const [galatUmum, setGalatUmum] = useState<{ pesan: string; lama?: { id: string; kode: string } } | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const idPaket = useId();
  const idDurasi = useId();

  useEffect(() => {
    let aktif = true;
    api.pilihanRuang().then((h) => {
      if (!aktif) return;
      if (h.ok) {
        setPilihan(h.data.paket);
        if (h.data.paket[0]) setPaketId(h.data.paket[0].id);
      } else if (!galatSesi(h)) setGagalMuat(true);
    });
    return () => {
      aktif = false;
    };
  }, [galatSesi]);

  const siap = pilihan?.find((p) => p.id === paketId)?.siapRuangBiasa ?? false;
  const batasAngka = Number(batas);
  const absenBoleh = Number.isInteger(batasAngka) && batasAngka <= NOMOR_ABSEN_PEMAIN_MAKS;
  const ujiBenar = siap ? uji : true;
  const absenBenar = absenBoleh && absen;

  async function kirim(e: FormEvent) {
    e.preventDefault();
    const isi = { labelKelas: label, paketId, durasiMenit: durasi, batasPemain: batasAngka, batasTerlambatMenit: Number(terlambat), modeNomorAbsen: absenBenar, uji: ujiBenar, skillAktif: skill };
    const g = periksaRuangBaru(isi);
    setGalat(g);
    setGalatUmum(null);
    if (g.length > 0 || !paketId) return;
    setMengirim(true);
    const h = await api.buatRuang(isi);
    setMengirim(false);
    if (h.ok) {
      berhasil(h.data.ruang);
      return;
    }
    if (galatSesi(h)) return;
    if (h.kode === "RUANG_MASIH_ADA") {
      const lama = skemaRuangLama.safeParse(h.isi);
      setGalatUmum({ pesan: isiTeks(tb.galatMasihAda, { kode: lama.success ? lama.data.ruang.kode : "" }), lama: lama.success ? lama.data.ruang : undefined });
    } else if (h.kode === "SERVER_PENUH") setGalatUmum({ pesan: tb.galatPenuh });
    else if (h.kode === "PAKET_BELUM_SIAP") setGalatUmum({ pesan: tb.galatPaket });
    else setGalatUmum({ pesan: h.kode === "JARINGAN" ? h.pesan : tb.galatUmum });
  }

  const galatDi = (k: GalatIsianRuang) => (galat.includes(k) ? PESAN_ISIAN[k] : null);
  return (
    <Dialog judul={tb.judul} tutup={mengirim ? null : tutup} kembaliKe={kembaliKe}>
      {gagalMuat ? (
        <div className="js-konsol-tumpuk">
          <PesanGalat pesan={tb.galatUmum} />
          <button type="button" className="js-konsol-tombol" onClick={tutup}>
            {tb.batal}
          </button>
        </div>
      ) : pilihan === null ? (
        <p role="status">{TEKS_KONSOL.dasbor.memuat}</p>
      ) : (
        <form className="js-konsol-formulir" onSubmit={(e) => void kirim(e)} noValidate>
          <Kolom label={tb.label} nilai={label} ubah={setLabel} galat={galatDi("label")} petunjuk={tb.labelPetunjuk} />
          <div className="js-konsol-kolom">
            <label className="js-konsol-label" htmlFor={idPaket}>
              {tb.paket}
            </label>
            <select id={idPaket} className="js-konsol-isian" value={paketId} onChange={(e) => setPaketId(e.target.value)}>
              {pilihan.map((p) => (
                <option key={p.id} value={p.id}>
                  {isiTeks(tb.paketOpsi, { nama: p.nama, n: p.jumlahKejadian })}
                </option>
              ))}
            </select>
          </div>
          <div className="js-konsol-kolom" role="group" aria-labelledby={idDurasi}>
            <span id={idDurasi} className="js-konsol-label">
              {tb.durasi}
            </span>
            <div className="js-ruang-pilih">
              {DURASI_RUANG.map((d) => (
                <button key={d} type="button" className="js-konsol-tombol" aria-pressed={durasi === d} onClick={() => setDurasi(d)}>
                  {isiTeks(tb.durasiOpsi, { n: d })}
                </button>
              ))}
            </div>
          </div>
          <div className="js-ruang-dua">
            <Kolom label={tb.batasPemain} nilai={batas} ubah={setBatas} galat={galatDi("batasPemain")} petunjuk={tb.batasPemainPetunjuk} />
            <Kolom label={tb.terlambat} nilai={terlambat} ubah={setTerlambat} galat={galatDi("terlambat")} petunjuk={tb.terlambatPetunjuk} />
          </div>
          <fieldset className="js-ruang-skill">
            <legend className="js-konsol-label">{ts.judul}</legend>
            <div className="js-ruang-skill-daftar">
              {SKILL_P0.map((s) => (
                <label key={s} className="js-konsol-centang">
                  <input type="checkbox" checked={skill.includes(s)} onChange={(e) => setSkill(SKILL_P0.filter((x) => (x === s ? e.target.checked : skill.includes(x))))} />
                  {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
                  <img src={IKON_SKILL[s]} alt="" width={16} height={16} />
                  <span>{ts[s]}</span>
                </label>
              ))}
            </div>
            <p className="js-konsol-petunjuk">{ts.keterangan}</p>
          </fieldset>
          <label className="js-konsol-centang">
            <input type="checkbox" checked={absenBenar} disabled={!absenBoleh} onChange={(e) => setAbsen(e.target.checked)} />
            <span>{tb.nomorAbsen}</span>
          </label>
          <p className="js-konsol-petunjuk">{tb.nomorAbsenPetunjuk}</p>
          <PesanGalat pesan={galatDi("nomorAbsen")} />
          <label className="js-konsol-centang">
            <input type="checkbox" checked={ujiBenar} disabled={!siap} onChange={(e) => setUji(e.target.checked)} />
            <span>{tb.uji}</span>
          </label>
          {!siap ? <PesanInfo pesan={tb.ujiTerkunci} /> : null}
          {galatUmum ? (
            <div className="js-konsol-tumpuk">
              <PesanGalat pesan={galatUmum.pesan} />
              {galatUmum.lama ? (
                <button type="button" className="js-konsol-tombol" onClick={() => bukaRuang(galatUmum.lama?.id ?? "")}>
                  {isiTeks(tb.bukaRuangLama, { kode: galatUmum.lama.kode })}
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="js-konsol-tombol-baris">
            <button type="button" className="js-konsol-tombol" onClick={tutup} disabled={mengirim}>
              {tb.batal}
            </button>
            <button type="submit" className="js-konsol-tombol js-konsol-tombol-utama" disabled={mengirim}>
              {mengirim ? tb.membuat : tb.buat}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
