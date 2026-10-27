// Layar refleksi (spesifikasi F-09): tiga kalimat pemantik untuk ditulis di buku, lalu "Main lagi", "Kembali ke galeri",
// dan unduh rekap (FR-20). Masa tunggu, unduhan, dan "Main lagi" diatur PlayScreen; layar ini hanya menampilkan.
import { useEffect, useRef, type MouseEvent } from "react";
import { copy } from "../content/copy";
import type { DownloadKind } from "./download";

// Relatif terhadap /ruang-setara/sehari-setara/ (Architecture bagian 11).
const GALLERY_HREF = "../";

const text = copy.closing.reflection;
const download = copy.closing.download;
const KINDS: readonly DownloadKind[] = ["png", "pdf"];

interface ReflectionProps {
  /** Benar sesudah masa tunggu; sebelum itu tombol dan tautan ber-aria-disabled. */
  ready: boolean;
  /** Jenis berkas yang sedang disiapkan, atau null. */
  busy: DownloadKind | null;
  /** Kabar unduhan terakhir; kosong bila belum ada unduhan. */
  status: string;
  onReplay(): void;
  /** Klik "Kembali ke galeri"; PlayScreen membatalkannya selama masa tunggu. */
  onGallery(event: MouseEvent<HTMLAnchorElement>): void;
  onDownload(kind: DownloadKind): void;
}

export function Reflection({ ready, busy, status, onReplay, onGallery, onDownload }: ReflectionProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <div className="ss-reflection">
      <header className="ss-reflection-head">
        <h2 ref={titleRef} tabIndex={-1} className="ss-reflection-title">
          {text.title}
        </h2>
      </header>
      <div className="ss-reflection-body">
        <p className="ss-reflection-lead">{text.lead}</p>
        {/* role="list": tanpa itu, Safari membacakan daftar tanpa penanda butir sebagai kelompok biasa. */}
        <ol className="ss-reflection-prompts" role="list" aria-label={text.list}>
          {text.prompts.map((prompt, i) => (
            <li key={prompt} className="ss-reflection-prompt">
              <span className="ss-choice-key" aria-hidden="true">
                {i + 1}
              </span>
              <span>{prompt}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="ss-reflection-foot">
        <div className="ss-reflection-actions">
          <button type="button" className="ss-button" aria-disabled={ready ? undefined : true} onClick={onReplay}>
            {text.playAgain}
          </button>
          <a className="ss-button" href={GALLERY_HREF} aria-disabled={ready ? undefined : true} onClick={onGallery}>
            {copy.backToGallery}
          </a>
        </div>
        <div className="ss-download" data-sibuk={busy ?? undefined}>
          <p className="ss-download-status">{status}</p>
          <div className="ss-download-buttons">
            {KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                className="ss-button"
                data-unduh={kind}
                aria-label={download.name[kind]}
                aria-disabled={ready && busy === null ? undefined : true}
                onClick={() => onDownload(kind)}
              >
                {download.button[kind]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
