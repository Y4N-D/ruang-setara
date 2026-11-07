// Panel halaman kosong JS-01 dengan penanda server. Sejak JS-03 hanya dipakai konsol.
import PenandaServer from "./PenandaServer";

export default function HalamanKerangka({ judul, isi, atas }: { judul: string; isi: string; atas?: string }) {
  return (
    <main className="js-kerangka">
      <div className="js-bingkai">
        {atas ? <p className="js-atas">{atas}</p> : null}
        <h1>{judul}</h1>
        <p className="js-isi">{isi}</p>
        <PenandaServer />
      </div>
    </main>
  );
}
