// Dasbor (spesifikasi JS-04, P-36, P-42; JS-10, P-11; JS-13, P-27 dan P-28): salam dan empat kartu bingkai piksel,
// yaitu Peringatan (rujukan belum diverifikasi; kejadian Siap tinjau untuk admin), Ruang yang sedang berjalan, Sesi
// terakhir (D-1a, D-3a), dan Ringkasan 30 hari terakhir. Semua isi dari satu permintaan GET /api/dasbor.
import { useId, type ReactNode } from "react";
import type { z } from "zod";
import type { Saya, skemaDasbor } from "../../inti/akun";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { api, useMuat, type GalatApi } from "../api";
import { Ikon } from "../Formulir";
import { keHash } from "../rute";

type DataDasbor = z.input<typeof skemaDasbor>;

const t = TEKS_KONSOL.dasbor;
const SATU = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const BULAT = new Intl.NumberFormat("id-ID");
const TANGGAL = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const satu = (n: number | null) => (n === null ? t.kosongNilai : SATU.format(n));

function Kartu({ judul, children }: { judul: string; children: ReactNode }) {
  const id = useId();
  return (
    <section className="js-bingkai js-konsol-kartu" aria-labelledby={id}>
      <h2 id={id}>{judul}</h2>
      {children}
    </section>
  );
}

/** Kalimat berisi "{n}" dengan angka berhuruf Press Start 2P. */
function KalimatAngka({ teks, n }: { teks: string; n: number }) {
  const [sebelum, sesudah] = teks.split("{n}");
  return (
    <span>
      {sebelum}
      <span className="js-konsol-angka">{n}</span>
      {sesudah}
    </span>
  );
}

/** Isi keempat kartu dari data dasbor (murni; diuji dengan renderToStaticMarkup). */
export function IsiDasbor({ data, admin }: { data: DataDasbor; admin: boolean }) {
  const ruang = data.ruang ?? [];
  const sesi = data.sesi ?? [];
  const r = data.ringkasan;
  const siap = admin ? (data.siapTinjau ?? 0) : 0;
  return (
    <>
      <Kartu judul={t.peringatan}>
        {data.rujukanBelum > 0 || siap > 0 ? (
          <ul className="js-dasbor-peringatan">
            {data.rujukanBelum > 0 ? (
              <li className="js-konsol-peringatan">
                <Ikon nama="ikon_peringatan" ukuran={32} />
                <a href={keHash("rujukan")}>
                  <KalimatAngka teks={t.rujukanBelum} n={data.rujukanBelum} />
                </a>
              </li>
            ) : null}
            {siap > 0 ? (
              <li className="js-konsol-peringatan">
                <Ikon nama="ikon_peringatan" ukuran={32} />
                <a href={keHash("kejadian")}>
                  <KalimatAngka teks={t.siapTinjau} n={siap} />
                </a>
              </li>
            ) : null}
          </ul>
        ) : (
          <p>{t.tanpaPeringatan}</p>
        )}
      </Kartu>
      <Kartu judul={t.ruang}>
        {ruang.length > 0 ? (
          <ul className="js-konsol-daftar-ruang">
            {ruang.map((x) => (
              <li key={x.id}>
                <a href={keHash("ruang", x.id)}>{isiTeks(t.ruangItem, { kode: x.kode, kelas: x.labelKelas, status: TEKS_KONSOL.status[x.status], n: x.jumlahPeserta })}</a>
              </li>
            ))}
            {(data.jumlahRuang ?? 0) > ruang.length ? (
              <li>
                <a href={keHash("ruang")}>{isiTeks(t.ruangSemua, { n: data.jumlahRuang ?? 0 })}</a>
              </li>
            ) : null}
          </ul>
        ) : (
          <p>{t.ruangKosong}</p>
        )}
      </Kartu>
      <Kartu judul={t.sesi}>
        {sesi.length > 0 ? (
          <ul className="js-konsol-daftar-ruang js-dasbor-sesi">
            {sesi.map((s) => {
              const isi = { tanggal: TANGGAL.format(s.dibuatPada), kelas: s.labelKelas, guru: s.namaGuru ?? t.kosongNilai, n: s.jumlahPemain, rata: satu(s.rataSkor) };
              return (
                <li key={s.id}>
                  <a href={keHash("ruang", s.id)}>{isiTeks(admin ? t.sesiItemGuru : t.sesiItem, isi)}</a>
                  {s.uji ? <span className="js-konsol-tanda js-konsol-tanda-belum">{t.sesiUji}</span> : null}
                </li>
              );
            })}
            <li>
              <a href={keHash("ruang", "riwayat")}>{t.sesiSemua}</a>
            </li>
          </ul>
        ) : (
          <p>{t.sesiKosong}</p>
        )}
      </Kartu>
      <Kartu judul={t.ringkasan}>
        {r && r.sesi > 0 ? (
          <>
            <dl className="js-dasbor-ringkasan">
              <div>
                <dt>{t.ringkasanSesi}</dt>
                <dd className="js-konsol-angka">{BULAT.format(r.sesi)}</dd>
              </div>
              <div>
                <dt>{t.ringkasanPemain}</dt>
                <dd className="js-konsol-angka">{BULAT.format(r.pemain)}</dd>
              </div>
              <div>
                <dt>{t.ringkasanRata}</dt>
                <dd className="js-konsol-angka">{satu(r.rataSkor)}</dd>
              </div>
              <div>
                <dt>{t.ringkasanKetepatan}</dt>
                <dd className="js-konsol-angka">{r.ketepatan1 === null ? t.kosongNilai : `${SATU.format(r.ketepatan1)}%`}</dd>
              </div>
            </dl>
            {r.tingkat.tepat !== null && r.tingkat.kurang !== null && r.tingkat.berisiko !== null ? (
              <div className="js-dasbor-tingkat">
                <p>{t.ringkasanLangkah2}</p>
                <span className="js-statistik-tumpuk js-dasbor-tumpuk" aria-hidden="true">
                  <span data-tingkat="tepat" style={{ width: `${r.tingkat.tepat}%` }} />
                  <span data-tingkat="kurang" style={{ width: `${r.tingkat.kurang}%` }} />
                  <span data-tingkat="berisiko" style={{ width: `${r.tingkat.berisiko}%` }} />
                </span>
                <p>{isiTeks(t.ringkasanTingkat, { a: SATU.format(r.tingkat.tepat), b: SATU.format(r.tingkat.kurang), c: SATU.format(r.tingkat.berisiko) })}</p>
              </div>
            ) : null}
            <p className="js-dasbor-catatan">{t.ringkasanCatatan}</p>
            <a className="js-dasbor-tautan" href={keHash("statistik")}>
              {t.keStatistik}
            </a>
          </>
        ) : (
          <p>{t.ringkasanKosong}</p>
        )}
      </Kartu>
    </>
  );
}

export default function Dasbor({ akun, galatSesi }: { akun: Saya; galatSesi: (galat: GalatApi) => boolean }) {
  const { muatan, muatUlang } = useMuat(api.dasbor, galatSesi);
  return (
    <>
      <p className="js-konsol-salam">{isiTeks(t.salam, { nama: akun.namaTampilan })}</p>
      <div className="js-konsol-kartu-kisi js-dasbor-kisi">
        {muatan.jenis === "ada" ? (
          <IsiDasbor data={muatan.data} admin={akun.peran === "admin"} />
        ) : (
          <Kartu judul={t.peringatan}>
            {muatan.jenis === "memuat" ? (
              <p role="status">{t.memuat}</p>
            ) : (
              <div className="js-konsol-tumpuk">
                <p role="alert">{t.gagal}</p>
                <button type="button" className="js-konsol-tombol" onClick={muatUlang}>
                  {t.cobaLagi}
                </button>
              </div>
            )}
          </Kartu>
        )}
      </div>
    </>
  );
}
