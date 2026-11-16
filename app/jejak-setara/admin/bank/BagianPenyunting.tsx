// Isian penyunting kejadian (spesifikasi JS-12, P-6 dan P-8): bagian identitas, tokoh dan properti, situasi, Langkah 1,
// Langkah 2, dan kartu dampak, dengan hitungan karakter dan temuan validasi di bawah kolomnya.
import { useId, useState, type ReactNode } from "react";
import { kolomDariLetak, type PilihanBank, type TemuanApi } from "../../inti/bank";
import { PANJANG_KONTEN } from "../../inti/konten/skema";
import type { IsiKejadian } from "../../inti/tipe";
import { isiTeks } from "../../teks";
import { TEKS_KONSOL } from "../../teks-konsol";
import { gambarTokoh, namaTokoh } from "./aset-tokoh";

const t = TEKS_KONSOL.sunting;
const tb = TEKS_KONSOL.bank;
const HURUF = ["A", "B", "C", "D"] as const;

/** Batas karakter kolom menurut kunci kolomnya (Architecture 5.4). */
export function batasKolom(kolom: string): number | null {
  const akhir = kolom.split(".").pop() ?? "";
  if (kolom === "judul") return PANJANG_KONTEN.judul;
  if (kolom === "situasi") return PANJANG_KONTEN.situasi;
  if (kolom === "topik") return PANJANG_KONTEN.topik;
  if (akhir === "pertanyaan") return PANJANG_KONTEN.pertanyaan;
  if (kolom.startsWith("langkah1.opsi.") && akhir === "teks") return PANJANG_KONTEN.opsi1;
  if (akhir === "umpanBalik") return PANJANG_KONTEN.umpanBalik;
  if (kolom === "langkah1.petunjuk") return PANJANG_KONTEN.petunjuk;
  if (kolom.startsWith("langkah2.opsi.") && akhir === "teks") return PANJANG_KONTEN.opsi2;
  if (akhir === "terjadi") return PANJANG_KONTEN.terjadi;
  if (kolom === "kartu.hak") return PANJANG_KONTEN.hak;
  if (kolom === "kartu.kewajiban") return PANJANG_KONTEN.kewajiban;
  return null;
}

/** Kalimat konsol untuk satu temuan (Permintaan A-7). */
export function pesanTemuan(x: TemuanApi): string {
  const teks = (TEKS_KONSOL.temuan as Record<string, string>)[x.kode] ?? x.pesan;
  return isiTeks(teks, { batas: batasKolom(kolomDariLetak(x.letak)) ?? "" });
}

export type PetaTemuan = Map<string, TemuanApi[]>;

export function petakanTemuan(temuan: readonly TemuanApi[]): PetaTemuan {
  const peta: PetaTemuan = new Map();
  for (const x of temuan) {
    const k = kolomDariLetak(x.letak);
    peta.set(k, [...(peta.get(k) ?? []), x]);
  }
  return peta;
}

function DaftarTemuan({ id, daftar }: { id: string; daftar: readonly TemuanApi[] | undefined }) {
  if (!daftar || daftar.length === 0) return null;
  return (
    <ul id={id} className="js-sunting-temuan">
      {daftar.map((x, i) => (
        <li key={i} data-tingkat={x.tingkat}>
          {pesanTemuan(x)}
        </li>
      ))}
    </ul>
  );
}

interface PropsKolomTeks {
  kolom: string;
  label: string;
  nilai: string;
  ubah: (v: string) => void;
  peta: PetaTemuan;
  nonaktif: boolean;
  baris?: number;
}

export function KolomTeks({ kolom, label, nilai, ubah, peta, nonaktif, baris }: PropsKolomTeks) {
  const id = useId();
  const batas = batasKolom(kolom);
  const daftar = peta.get(kolom);
  const panjang = [...nilai].length;
  const umum = { id, value: nilai, disabled: nonaktif, "aria-invalid": daftar?.some((x) => x.tingkat === "galat") || undefined, "aria-describedby": daftar ? `${id}-t` : undefined };
  return (
    <div className="js-sunting-kolom">
      <label htmlFor={id}>{label}</label>
      {baris ? <textarea {...umum} rows={baris} onChange={(e) => ubah(e.target.value)} /> : <input {...umum} type="text" onChange={(e) => ubah(e.target.value)} />}
      {batas ? (
        <span className="js-sunting-hitung" data-lewat={panjang > batas ? "ya" : undefined}>
          {isiTeks(t.hitung, { n: panjang, batas })}
        </span>
      ) : null}
      <DaftarTemuan id={`${id}-t`} daftar={daftar} />
    </div>
  );
}

function Bagian({ judul, children, temuan }: { judul: string; children: ReactNode; temuan?: readonly TemuanApi[] }) {
  const id = useId();
  return (
    <fieldset className="js-sunting-bagian">
      <legend>{judul}</legend>
      <DaftarTemuan id={id} daftar={temuan} />
      {children}
    </fieldset>
  );
}

interface PropsForm {
  isi: IsiKejadian;
  ubah: (f: (isi: IsiKejadian) => IsiKejadian) => void;
  pilihan: PilihanBank;
  peta: PetaTemuan;
  nonaktif: boolean;
}

export function FormKejadian({ isi, ubah, pilihan, peta, nonaktif }: PropsForm) {
  const umum = { peta, nonaktif };
  const opsi1 = (i: number, lain: Partial<IsiKejadian["langkah1"]["opsi"][number]>) =>
    ubah((x) => ({ ...x, langkah1: { ...x.langkah1, opsi: x.langkah1.opsi.map((o, j) => (j === i ? { ...o, ...lain } : o)) as IsiKejadian["langkah1"]["opsi"] } }));
  const opsi2 = (i: number, lain: Partial<IsiKejadian["langkah2"]["opsi"][number]>) =>
    ubah((x) => ({ ...x, langkah2: { ...x.langkah2, opsi: x.langkah2.opsi.map((o, j) => (j === i ? { ...o, ...lain } : o)) as IsiKejadian["langkah2"]["opsi"] } }));
  const idZona = useId();
  const idJenis = useId();
  return (
    <div className="js-sunting-form">
      <Bagian judul={t.bagianIdentitas} temuan={[...(peta.get("") ?? []), ...(peta.get("kode") ?? [])]}>
        <KolomTeks kolom="judul" label={t.judul} nilai={isi.judul} ubah={(v) => ubah((x) => ({ ...x, judul: v }))} {...umum} />
        <div className="js-sunting-kolom">
          <label htmlFor={idZona}>{t.zona}</label>
          <select id={idZona} value={isi.zona} disabled={nonaktif} onChange={(e) => ubah((x) => ({ ...x, zona: e.target.value as IsiKejadian["zona"] }))}>
            {pilihan.zona.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nama}
              </option>
            ))}
          </select>
          <DaftarTemuan id={`${idZona}-t`} daftar={peta.get("zona")} />
        </div>
        <KolomTeks kolom="topik" label={t.topik} nilai={isi.topik} ubah={(v) => ubah((x) => ({ ...x, topik: v }))} {...umum} />
        <div className="js-sunting-kolom">
          <label htmlFor={idJenis}>{t.jenis}</label>
          <select id={idJenis} value={isi.jenis} disabled={nonaktif} onChange={(e) => ubah((x) => ({ ...x, jenis: e.target.value as IsiKejadian["jenis"] }))}>
            <option value="pelanggaran_hak">{tb.jenisPelanggaran}</option>
            <option value="pengabaian_kewajiban">{tb.jenisPengabaian}</option>
            <option value="keduanya">{tb.jenisKeduanya}</option>
          </select>
          <DaftarTemuan id={`${idJenis}-t`} daftar={peta.get("jenis")} />
        </div>
      </Bagian>

      <Bagian judul={t.bagianTokoh} temuan={[...(peta.get("setTokoh") ?? []), ...[0, 1, 2, 3].flatMap((i) => peta.get(`setTokoh.${i}`) ?? [])]}>
        <p className="js-konsol-petunjuk">{t.tokohPetunjuk}</p>
        <PilihTokoh nilai={isi.setTokoh} aset={pilihan.aset} nonaktif={nonaktif} ubah={(v) => ubah((x) => ({ ...x, setTokoh: v }))} />
      </Bagian>

      <Bagian judul={t.bagianSituasi}>
        <KolomTeks kolom="situasi" label={t.situasi} nilai={isi.situasi} baris={3} ubah={(v) => ubah((x) => ({ ...x, situasi: v }))} {...umum} />
      </Bagian>

      <Bagian judul={t.bagianLangkah1} temuan={peta.get("langkah1.opsi")}>
        <KolomTeks kolom="langkah1.pertanyaan" label={t.pertanyaan} nilai={isi.langkah1.pertanyaan} ubah={(v) => ubah((x) => ({ ...x, langkah1: { ...x.langkah1, pertanyaan: v } }))} {...umum} />
        {isi.langkah1.opsi.map((o, i) => (
          <div key={o.id} className="js-sunting-opsi">
            <KolomTeks kolom={`langkah1.opsi.${i}.teks`} label={isiTeks(t.pilihan, { huruf: HURUF[i] })} nilai={o.teks} ubah={(v) => opsi1(i, { teks: v })} {...umum} />
            <label className="js-bank-centang">
              <input type="radio" name="kunci1" checked={o.benar} disabled={nonaktif} onChange={() => ubah((x) => ({ ...x, langkah1: { ...x.langkah1, opsi: x.langkah1.opsi.map((p, j) => ({ ...p, benar: j === i })) as IsiKejadian["langkah1"]["opsi"] } }))} />
              <span>{t.kunci}</span>
            </label>
            <KolomTeks kolom={`langkah1.opsi.${i}.umpanBalik`} label={t.umpanBalik} nilai={o.umpanBalik} baris={2} ubah={(v) => opsi1(i, { umpanBalik: v })} {...umum} />
          </div>
        ))}
        <KolomTeks kolom="langkah1.petunjuk" label={t.petunjuk} nilai={isi.langkah1.petunjuk} ubah={(v) => ubah((x) => ({ ...x, langkah1: { ...x.langkah1, petunjuk: v } }))} {...umum} />
      </Bagian>

      <Bagian judul={t.bagianLangkah2} temuan={peta.get("langkah2.opsi")}>
        <KolomTeks kolom="langkah2.pertanyaan" label={t.pertanyaan} nilai={isi.langkah2.pertanyaan} ubah={(v) => ubah((x) => ({ ...x, langkah2: { ...x.langkah2, pertanyaan: v } }))} {...umum} />
        {isi.langkah2.opsi.map((o, i) => (
          <div key={o.id} className="js-sunting-opsi">
            <KolomTeks kolom={`langkah2.opsi.${i}.teks`} label={isiTeks(t.pilihan, { huruf: HURUF[i] })} nilai={o.teks} ubah={(v) => opsi2(i, { teks: v })} {...umum} />
            <label className="js-sunting-kolom">
              <span>{t.tingkat}</span>
              <select value={o.tingkat} disabled={nonaktif} onChange={(e) => opsi2(i, { tingkat: e.target.value as "tepat" | "kurang" | "berisiko" })}>
                <option value="tepat">{tb.tingkatTepat}</option>
                <option value="kurang">{tb.tingkatKurang}</option>
                <option value="berisiko">{tb.tingkatBerisiko}</option>
              </select>
            </label>
            <KolomTeks kolom={`langkah2.opsi.${i}.terjadi`} label={t.terjadi} nilai={o.terjadi} baris={2} ubah={(v) => opsi2(i, { terjadi: v })} {...umum} />
          </div>
        ))}
      </Bagian>

      <Bagian judul={t.bagianKartu} temuan={[...(peta.get("kartu.rujukan") ?? []), ...[0, 1, 2, 3].flatMap((i) => peta.get(`kartu.rujukan.${i}`) ?? [])]}>
        <KolomTeks kolom="kartu.hak" label={t.hak} nilai={isi.kartu.hak} baris={2} ubah={(v) => ubah((x) => ({ ...x, kartu: { ...x.kartu, hak: v } }))} {...umum} />
        <KolomTeks kolom="kartu.kewajiban" label={t.kewajiban} nilai={isi.kartu.kewajiban} baris={2} ubah={(v) => ubah((x) => ({ ...x, kartu: { ...x.kartu, kewajiban: v } }))} {...umum} />
        <PilihRujukan nilai={isi.kartu.rujukan} pustaka={pilihan.rujukan} nonaktif={nonaktif} ubah={(v) => ubah((x) => ({ ...x, kartu: { ...x.kartu, rujukan: v } }))} />
      </Bagian>
    </div>
  );
}

function PilihTokoh({ nilai, aset, ubah, nonaktif }: { nilai: string[]; aset: string[]; ubah: (v: string[]) => void; nonaktif: boolean }) {
  return (
    <div className="js-tokoh-kisi">
      {aset.map((k) => {
        const urutan = nilai.indexOf(k);
        const dipilih = urutan >= 0;
        const gambar = gambarTokoh(k);
        return (
          <label key={k} className="js-tokoh-pilih" data-dipilih={dipilih ? "ya" : undefined} title={k}>
            <input
              type="checkbox"
              checked={dipilih}
              disabled={nonaktif || (!dipilih && nilai.length >= 4)}
              onChange={() => ubah(dipilih ? nilai.filter((x) => x !== k) : [...nilai, k])}
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- halaman Vite, bukan Next.js */}
            {gambar ? <img src={gambar} alt="" className="js-piksel" /> : null}
            <span>{dipilih ? `${urutan + 1}. ${namaTokoh(k)}` : namaTokoh(k)}</span>
          </label>
        );
      })}
    </div>
  );
}

function PilihRujukan({ nilai, pustaka, ubah, nonaktif }: { nilai: string[]; pustaka: PilihanBank["rujukan"]; ubah: (v: string[]) => void; nonaktif: boolean }) {
  const [cari, setCari] = useState("");
  const kata = cari.trim().toLocaleLowerCase("id-ID");
  const tampil = pustaka.filter((r) => nilai.includes(r.id) || !kata || `${r.id} ${r.teks}`.toLocaleLowerCase("id-ID").includes(kata));
  return (
    <div className="js-sunting-kolom">
      <span>{t.rujukan}</span>
      <input type="search" placeholder={t.rujukanCari} aria-label={t.rujukanCari} value={cari} onChange={(e) => setCari(e.target.value)} disabled={nonaktif} />
      <ul className="js-rujukan-pilih">
        {tampil.map((r) => {
          const dipilih = nilai.includes(r.id);
          return (
            <li key={r.id}>
              <label className="js-bank-centang">
                <input type="checkbox" checked={dipilih} disabled={nonaktif || (!dipilih && nilai.length >= 4)} onChange={() => ubah(dipilih ? nilai.filter((x) => x !== r.id) : [...nilai, r.id])} />
                <span>
                  <strong>{r.id}</strong> {r.teks}{" "}
                  <span className={`js-konsol-tanda ${r.status === "terverifikasi" ? "" : "js-konsol-tanda-belum"}`}>
                    {r.status === "terverifikasi" ? TEKS_KONSOL.pustaka.statusTerverifikasi : TEKS_KONSOL.pustaka.statusBelum}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
