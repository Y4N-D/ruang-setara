// Komponen akar game Sehari Setara.
// F-01: baru menampilkan layar kerangka. Layar judul menggantikannya di F-10.
import { copy } from "./content/copy";

// Tautan kembali ke galeri, relatif terhadap /ruang-setara/sehari-setara/ (Architecture bagian 11).
const GALLERY_HREF = "../";

export default function Game() {
  return (
    <div className="ss-viewport">
      <div className="ss-screen">
        <main className="ss-placeholder" aria-labelledby="ss-placeholder-title">
          <h1 id="ss-placeholder-title" className="ss-placeholder-title">
            {copy.gameName}
          </h1>
          <p className="ss-placeholder-lead">{copy.placeholder.lead}</p>
          <p className="ss-placeholder-status">{copy.placeholder.status}</p>
          <a className="ss-button" href={GALLERY_HREF}>
            {copy.backToGallery}
          </a>
        </main>
      </div>
    </div>
  );
}
