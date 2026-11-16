// Pustaka rujukan `#/rujukan` (spesifikasi JS-12, P-17 sampai P-20): daftar dengan pencarian dan saringan status,
// tambah dan ubah, verifikasi oleh akun bertanda Peninjau, dan hapus rujukan yang tidak dipakai (admin).
import { useState } from "react";
import type { Saya } from "../../inti/akun";
import { gabungSumber, type BarisRujukan, type TemuanApi } from "../../inti/bank";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, temuanDari, useMuat, type GalatApi } from "../api";
import Dialog from "../Dialog";
import { PesanGalat } from "../Formulir";
import { pesanTemuan } from "./BagianPenyunting";

const t = TEKS_KONSOL.pustaka;
const tb = TEKS_KONSOL.bank;
const FORMAT = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" });

type Dialogan = { jenis: "isi"; rujukan: BarisRujukan | null } | { jenis: "tandai" | "hapus"; rujukan: BarisRujukan } | null;

export default function Rujukan({ akun, galatSesi, umumkan }: { akun: Saya; galatSesi: (g: GalatApi) => boolean; umumkan: (pesan: string) => void }) {
  const { muatan, muatUlang } = useMuat(api.daftarRujukan, galatSesi);
  const [cari, setCari] = useState("");
  const [status, setStatus] = useState("");
  const [dialog, setDialog] = useState<Dialogan>(null);
  const [pembuka, setPembuka] = useState<HTMLElement | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  if (muatan.jenis === "memuat") return <p role="status">{tb.memuat}</p>;
  if (muatan.jenis === "gagal") {
    return (
      <div className="js-konsol-tumpuk">
        <p role="alert">{tb.gagal}</p>
        <button type="button" className="js-konsol-tombol" onClick={muatUlang}>
          {tb.cobaLagi}
        </button>
      </div>
    );
  }
  const admin = akun.peran === "admin";
  const semua = muatan.data.rujukan;
  const kata = cari.trim().toLocaleLowerCase("id-ID");
  const tampil = semua.filter((r) => (!status || r.status === status) && (!kata || `${r.id} ${r.teks}`.toLocaleLowerCase("id-ID").includes(kata)));
  const buka = (d: Dialogan, e: React.MouseEvent<HTMLElement>) => {
    setPembuka(e.currentTarget);
    setGalat(null);
    setDialog(d);
  };
  const verifikasi = async (r: BarisRujukan, nilai: boolean) => {
    const h = await api.verifikasiRujukan(r.id, nilai);
    setDialog(null);
    if (h.ok) {
      umumkan(isiTeks(nilai ? t.okTandai : t.okBatal, { id: r.id }));
      muatUlang();
    } else if (!galatSesi(h)) setGalat(h.pesan);
  };
  const hapus = async (r: BarisRujukan) => {
    const h = await api.hapusRujukan(r.id);
    setDialog(null);
    if (h.ok) {
      umumkan(isiTeks(t.okHapus, { id: r.id }));
      muatUlang();
    } else if (!galatSesi(h)) setGalat(h.pesan);
  };
  return (
    <>
      <div className="js-konsol-baris-atas">
        <p>{isiTeks(t.ringkasan, { n: semua.length, m: semua.filter((r) => r.status === "belum").length })}</p>
        <button type="button" className="js-konsol-tombol js-konsol-tombol-utama" onClick={(e) => buka({ jenis: "isi", rujukan: null }, e)}>
          {t.baru}
        </button>
      </div>
      <div className="js-bank-saring">
        <input type="search" aria-label={t.cari} placeholder={t.cari} value={cari} onChange={(e) => setCari(e.target.value)} />
        <select aria-label={t.semuaStatus} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t.semuaStatus}</option>
          <option value="belum">{t.statusBelum}</option>
          <option value="terverifikasi">{t.statusTerverifikasi}</option>
        </select>
      </div>
      <PesanGalat pesan={galat} />
      {tampil.length === 0 ? (
        <p>{t.kosong}</p>
      ) : (
        <ul className="js-pustaka">
          {tampil.map((r) => (
            <li key={r.id} className="js-pustaka-baris">
              <div className="js-pustaka-isi">
                <strong>{r.id}</strong> <span>{r.teks}</span>
                <div className="js-pustaka-sumber">
                  {r.sumber.split(" · ").map((u) => (
                    <a key={u} href={u} target="_blank" rel="noopener noreferrer">
                      {u}
                    </a>
                  ))}
                </div>
                <div className="js-konsol-sel-label">
                  {r.status === "terverifikasi" ? (
                    <span className="js-konsol-tanda">{isiTeks(t.terverifikasiOleh, { nama: r.diverifikasiOleh ?? "—", tanggal: r.diverifikasiPada ? FORMAT.format(r.diverifikasiPada) : "—" })}</span>
                  ) : (
                    <span className="js-konsol-tanda js-konsol-tanda-belum">{t.statusBelum}</span>
                  )}
                  <span className="js-konsol-petunjuk">{isiTeks(t.dipakai, { n: r.dipakai })}</span>
                </div>
              </div>
              <div className="js-konsol-tombol-baris">
                {admin ? (
                  <button type="button" className="js-konsol-tombol" onClick={(e) => buka({ jenis: "isi", rujukan: r }, e)}>
                    {t.ubah}
                  </button>
                ) : null}
                {akun.peninjau ? (
                  r.status === "belum" ? (
                    <button type="button" className="js-konsol-tombol" onClick={(e) => buka({ jenis: "tandai", rujukan: r }, e)}>
                      {t.tandai}
                    </button>
                  ) : (
                    <button type="button" className="js-konsol-tombol" onClick={() => void verifikasi(r, false)}>
                      {t.batalkan}
                    </button>
                  )
                ) : null}
                {admin && r.dipakai === 0 ? (
                  <button type="button" className="js-konsol-tombol" onClick={(e) => buka({ jenis: "hapus", rujukan: r }, e)}>
                    {TEKS_KONSOL.aksi.hapus}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      {dialog?.jenis === "isi" ? (
        <DialogRujukan
          rujukan={dialog.rujukan}
          tutup={() => setDialog(null)}
          kembaliKe={pembuka}
          galatSesi={galatSesi}
          berhasil={(id) => {
            setDialog(null);
            umumkan(isiTeks(t.okSimpan, { id }));
            muatUlang();
          }}
        />
      ) : null}
      {dialog?.jenis === "tandai" ? (
        <Dialog judul={t.tandaiJudul} tutup={() => setDialog(null)} kembaliKe={pembuka}>
          <p>
            <strong>{dialog.rujukan.id}</strong> {dialog.rujukan.teks}
          </p>
          <div className="js-konsol-tombol-baris">
            <button type="button" className="js-konsol-tombol" onClick={() => setDialog(null)}>
              {TEKS_KONSOL.aksi.batal}
            </button>
            <button type="button" className="js-konsol-tombol js-konsol-tombol-utama" onClick={() => void verifikasi(dialog.rujukan, true)}>
              {t.tandai}
            </button>
          </div>
        </Dialog>
      ) : null}
      {dialog?.jenis === "hapus" ? (
        <Dialog judul={isiTeks(t.hapusJudul, { id: dialog.rujukan.id })} tutup={() => setDialog(null)} kembaliKe={pembuka}>
          <div className="js-konsol-tombol-baris">
            <button type="button" className="js-konsol-tombol" onClick={() => setDialog(null)}>
              {TEKS_KONSOL.aksi.batal}
            </button>
            <button type="button" className="js-konsol-tombol js-konsol-tombol-utama" onClick={() => void hapus(dialog.rujukan)}>
              {TEKS_KONSOL.aksi.hapus}
            </button>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}

interface PropsDialogRujukan {
  rujukan: BarisRujukan | null;
  tutup: () => void;
  kembaliKe: HTMLElement | null;
  galatSesi: (g: GalatApi) => boolean;
  berhasil: (id: string) => void;
}

function DialogRujukan({ rujukan, tutup, kembaliKe, galatSesi, berhasil }: PropsDialogRujukan) {
  const [teks, setTeks] = useState(rujukan?.teks ?? "");
  const [sumber, setSumber] = useState((rujukan?.sumber ?? "").split(" · ").join("\n"));
  const [catatan, setCatatan] = useState(rujukan?.catatan ?? "");
  const [kode, setKode] = useState(rujukan?.kodeSehari ?? "");
  const [temuan, setTemuan] = useState<TemuanApi[]>([]);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const simpan = async () => {
    setSibuk(true);
    const isi = { teks: teks.trim(), sumber: gabungSumber(sumber), catatan: catatan.trim(), kodeSehari: kode.trim() || null };
    const h = rujukan ? await api.ubahRujukan(rujukan.id, isi) : await api.tambahRujukan(isi);
    setSibuk(false);
    if (h.ok) return berhasil(h.data.rujukan.id);
    if (galatSesi(h)) return;
    setTemuan(temuanDari(h));
    setGalat(h.pesan);
  };
  const temuanKolom = (kolom: string) => temuan.filter((x) => x.letak.endsWith(`/${kolom}`)).map(pesanTemuan);
  const kolom = (id: string, label: string, nilai: string, ubah: (v: string) => void, baris: number, nama: string) => (
    <div className="js-sunting-kolom">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} rows={baris} value={nilai} onChange={(e) => ubah(e.target.value)} />
      {temuanKolom(nama).map((p) => (
        <p key={p} className="js-sunting-temuan">
          {p}
        </p>
      ))}
    </div>
  );
  const teksBerubah = rujukan !== null && rujukan.status === "terverifikasi" && teks.trim() !== rujukan.teks;
  return (
    <Dialog judul={rujukan ? `${t.ubah} ${rujukan.id}` : t.baru.replace(/^\+ /, "")} tutup={tutup} kembaliKe={kembaliKe}>
      {kolom("js-rj-teks", t.teks, teks, setTeks, 2, "teks")}
      {teksBerubah ? <p className="js-konsol-petunjuk">{t.peringatanTeks}</p> : null}
      {kolom("js-rj-sumber", t.sumber, sumber, setSumber, 3, "sumber")}
      {kolom("js-rj-catatan", t.catatan, catatan, setCatatan, 3, "catatan")}
      <div className="js-sunting-kolom">
        <label htmlFor="js-rj-kode">{t.kodeSehari}</label>
        <input id="js-rj-kode" type="text" value={kode} onChange={(e) => setKode(e.target.value)} />
      </div>
      <PesanGalat pesan={galat} />
      <div className="js-konsol-tombol-baris">
        <button type="button" className="js-konsol-tombol" onClick={tutup}>
          {TEKS_KONSOL.aksi.batal}
        </button>
        <button type="button" className="js-konsol-tombol js-konsol-tombol-utama" disabled={sibuk} onClick={() => void simpan()}>
          {t.simpan}
        </button>
      </div>
    </Dialog>
  );
}
